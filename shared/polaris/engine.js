// Neptune Polaris (showroom) - on-device ML engine. Everything is loaded from ./vendor (no network, no CDN):
//   MediaPipe Tasks Vision 1.1.1  (Google)  FaceLandmarker 478 pts + blendshapes, BlazeFace FaceDetector
//   ONNX Runtime Web 1.30.0 (wasm)          OpenCV Zoo SFace (Apache-2.0) 128-d face embedding, 112x112
//   tesseract.js 7.0.0 (wasm)               OCR of the passport machine-readable zone
// Models are loaded lazily and independently, so one failing component degrades honestly instead of breaking the flow.

import { extractSignals, lumaStats, sharpness, geometrySimilarity, LM } from './liveness.js';
import { findMrz, repairTD3, parseTD3 } from './mrz.js';

const loadScript = (src) => new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = src; s.async = true; s.onload = res; s.onerror = () => rej(new Error('script ' + src)); document.head.appendChild(s);
});
const once = (fn) => { let p = null; return (...a) => (p || (p = fn(...a).catch(e => { p = null; throw e; }))); };

// SFace / ArcFace 112x112 five-point template: right eye, left eye (as seen in the image), nose, mouth right, mouth left
export const TEMPLATE_112 = [[38.2946, 51.6963], [73.5318, 51.5014], [56.0252, 71.7366], [41.5493, 92.3655], [70.7299, 92.2041]];
export const SFACE_THRESHOLD = 0.363; // OpenCV Zoo recommended cosine threshold

/** Five alignment points (pixels) from a 478-point landmark list. */
export function fivePoints(lm, w, h) {
  const P = i => ({ x: lm[i].x * w, y: lm[i].y * h });
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const re = lm[LM.irisR] ? P(LM.irisR) : mid(P(LM.rEyeOuter), P(LM.rEyeInner));
  const le = lm[LM.irisL] ? P(LM.irisL) : mid(P(LM.lEyeOuter), P(LM.lEyeInner));
  return [re, le, P(LM.nose), P(LM.mouthR), P(LM.mouthL)];
}
/** Least-squares similarity transform src->dst (2D Umeyama). Returns canvas matrix {a,b,c,d,e,f}. */
export function similarity(src, dst) {
  const n = src.length;
  const mx = src.reduce((s, p) => s + p.x, 0) / n, my = src.reduce((s, p) => s + p.y, 0) / n;
  const nx = dst.reduce((s, p) => s + p.x, 0) / n, ny = dst.reduce((s, p) => s + p.y, 0) / n;
  let sxx = 0, sxy = 0, sd = 0;
  for (let i = 0; i < n; i++) {
    const ax = src[i].x - mx, ay = src[i].y - my, bx = dst[i].x - nx, by = dst[i].y - ny;
    sxx += ax * bx + ay * by; sxy += ax * by - ay * bx; sd += ax * ax + ay * ay;
  }
  const a = sxx / sd, b = sxy / sd;
  return { a, b, c: -b, d: a, e: nx - (a * mx - b * my), f: ny - (b * mx + a * my) };
}
export function alignFace(srcCanvas, lm) {
  const pts = fivePoints(lm, srcCanvas.width, srcCanvas.height);
  const M = similarity(pts, TEMPLATE_112.map(([x, y]) => ({ x, y })));
  const c = document.createElement('canvas'); c.width = c.height = 112;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#808080'; g.fillRect(0, 0, 112, 112);
  g.setTransform(M.a, M.b, M.c, M.d, M.e, M.f); g.imageSmoothingQuality = 'high'; g.drawImage(srcCanvas, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  return c;
}
export function cosine(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

/** Native runtimes (MediaPipe/TFLite, ONNX Runtime) print benign INFO/WARN lines through console.error. Drop only those. */
let quiet = false;
export function quietNativeLogs() {
  if (quiet || typeof console === 'undefined') return; quiet = true;
  const orig = console.error.bind(console);
  const noise = /^(INFO: Created TensorFlow Lite|\W*\[?[IWE]\d{4} .*(gl_context|inference_feedback|face_landmarker_graph|calculator|Graph successfully)|.*\[W:onnxruntime)/;
  console.error = (...a) => { if (typeof a[0] === 'string' && noise.test(a[0])) return; orig(...a); };
}
export class Engine {
  /** @param {{base:string, onStatus?:(id:string,state:string,info?:any)=>void}} o  base = URL of the vendor folder (trailing slash) */
  constructor(o) {
    this.base = o.base.endsWith('/') ? o.base : o.base + '/';
    if (o.quietNative !== false) quietNativeLogs();
    this.onStatus = o.onStatus || (() => {});
    this.state = { vision: 'idle', landmarkerVideo: 'idle', landmarkerImage: 'idle', detector: 'idle', embedder: 'idle', ocr: 'idle' };
    // CPU (XNNPACK, WASM SIMD) is the default: ~30 fps on a 4-core laptop and identical everywhere. GPU is opt-in (o.delegate='GPU'); under software GL it ran ~3 fps.
    this.delegate = o.delegate || 'CPU';
    this._lumaCanvas = null;
    this.stats = { loadMs: {}, inferMs: {} };
    this.loadVision = once(async () => this._track('vision', async () => {
      const mod = await import(this.base + 'mediapipe/vision_bundle.mjs');
      const fileset = await mod.FilesetResolver.forVisionTasks(this.base + 'mediapipe/wasm');
      return { mod, fileset };
    }));
    this.loadLandmarkerVideo = once(async () => this._track('landmarkerVideo', async () => {
      const { mod, fileset } = await this.loadVision();
      const mk = (delegate) => mod.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: this.base + 'models/face_landmarker.task', delegate },
        runningMode: 'VIDEO', numFaces: 2, outputFaceBlendshapes: true, outputFacialTransformationMatrixes: false,
        minFaceDetectionConfidence: 0.5, minFacePresenceConfidence: 0.5, minTrackingConfidence: 0.5,
      });
      try { const l = await mk(this.delegate); this.activeDelegate = this.delegate; return l; } catch (e) { this.delegate = 'CPU'; this.activeDelegate = 'CPU'; return mk('CPU'); }
    }));
    this.loadLandmarkerImage = once(async () => this._track('landmarkerImage', async () => {
      const { mod, fileset } = await this.loadVision();
      return mod.FaceLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: this.base + 'models/face_landmarker.task', delegate: 'CPU' },
        runningMode: 'IMAGE', numFaces: 1, outputFaceBlendshapes: true, minFaceDetectionConfidence: 0.3, minFacePresenceConfidence: 0.3,
      });
    }));
    this.loadDetector = once(async () => this._track('detector', async () => {
      const { mod, fileset } = await this.loadVision();
      return mod.FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: this.base + 'models/blaze_face_short_range.tflite', delegate: 'CPU' },
        runningMode: 'IMAGE', minDetectionConfidence: 0.35,
      });
    }));
    this.loadEmbedder = once(async () => this._track('embedder', async () => {
      const ort = await import(this.base + 'ort/ort.wasm.min.mjs');
      ort.env.wasm.wasmPaths = this.base + 'ort/';
      ort.env.wasm.numThreads = 1; ort.env.wasm.proxy = false; ort.env.logLevel = 'error';
      const buf = await (await fetch(this.base + 'models/face_recognition_sface_2021dec_int8.onnx')).arrayBuffer();
      const session = await ort.InferenceSession.create(new Uint8Array(buf), { executionProviders: ['wasm'], graphOptimizationLevel: 'all', logSeverityLevel: 4 });
      return { ort, session };
    }));
    this.loadOcr = once(async () => this._track('ocr', async () => {
      if (!globalThis.Tesseract) await loadScript(this.base + 'tesseract/tesseract.min.js');
      const w = await globalThis.Tesseract.createWorker('eng', 1, {
        workerPath: this.base + 'tesseract/worker.min.js', corePath: this.base + 'tesseract/core/', langPath: this.base + 'tesseract/lang/',
        gzip: true, workerBlobURL: false, cacheMethod: 'none', logger: () => {},
      });
      await w.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<', preserve_interword_spaces: '0', tessedit_pageseg_mode: '6' });
      return w;
    }));
  }
  async _track(id, fn) {
    this.state[id] = 'loading'; this.onStatus(id, 'loading');
    const t0 = performance.now();
    try { const r = await fn(); this.state[id] = 'ready'; this.stats.loadMs[id] = Math.round(performance.now() - t0); this.onStatus(id, 'ready', { ms: this.stats.loadMs[id] }); return r; }
    catch (e) { this.state[id] = 'error'; this.onStatus(id, 'error', { error: String(e && e.message || e) }); throw e; }
  }
  /** Start all loads in the background; never throws. */
  preload(kinds = ['landmarkerVideo', 'detector', 'embedder', 'ocr']) {
    const map = { landmarkerVideo: this.loadLandmarkerVideo, landmarkerImage: this.loadLandmarkerImage, detector: this.loadDetector, embedder: this.loadEmbedder, ocr: this.loadOcr };
    return Promise.allSettled(kinds.map(k => map[k]()));
  }

  /* ----------------------------------------------------------------- live video */
  /** Detect on a <video> frame. Returns a liveness signal (see liveness.js) incl. luma / sharpness of the face region. */
  async detectVideo(video, ts, wantImage = true) {
    const lmk = await this.loadLandmarkerVideo();
    const t0 = performance.now();
    const res = lmk.detectForVideo(video, ts);
    this.stats.inferMs.video = Math.round((performance.now() - t0) * 10) / 10;
    const sig = extractSignals(res, ts, { aspect: (video.videoWidth || 1) / (video.videoHeight || 1) });
    if (sig.face && wantImage) Object.assign(sig, this.regionStats(video, sig.box));
    return sig;
  }
  /** Sample luma/contrast/sharpness of the face box from a video/canvas using a tiny offscreen canvas. */
  regionStats(src, box) {
    const W = src.videoWidth || src.width, H = src.videoHeight || src.height;
    if (!this._lumaCanvas) { this._lumaCanvas = document.createElement('canvas'); this._lumaCanvas.width = 64; this._lumaCanvas.height = 64; this._lctx = this._lumaCanvas.getContext('2d', { willReadFrequently: true }); }
    const sx = Math.max(0, box.x * W), sy = Math.max(0, box.y * H), sw = Math.min(W - sx, box.w * W), sh = Math.min(H - sy, box.h * H);
    if (sw < 8 || sh < 8) return {};
    this._lctx.drawImage(src, sx, sy, sw, sh, 0, 0, 64, 64);
    const d = this._lctx.getImageData(0, 0, 64, 64).data;
    const l = lumaStats(d, 1);
    return { luma: l.mean, contrast: l.std, sharp: sharpness(d, 64, 64) };
  }
  /* ----------------------------------------------------------------- stills */
  async analyzeImage(canvas) {
    const lmk = await this.loadLandmarkerImage();
    const t0 = performance.now();
    const res = lmk.detect(canvas);
    this.stats.inferMs.image = Math.round(performance.now() - t0);
    return extractSignals(res, 0, { aspect: canvas.width / canvas.height });
  }
  /** Find the portrait on a passport page. Returns {box:{x,y,w,h} px, score, via} or null. */
  async findPassportFace(canvas) {
    const W = canvas.width, H = canvas.height;
    const tries = [{ x: 0, y: 0, w: W, h: H }, { x: 0, y: 0, w: W * 0.5, h: H }, { x: 0, y: H * 0.1, w: W * 0.45, h: H * 0.75 }, { x: W * 0.5, y: 0, w: W * 0.5, h: H }];
    try {
      const det = await this.loadDetector();
      for (const r of tries) {
        const c = this.crop(canvas, r);
        const out = det.detect(c).detections || [];
        if (out.length) {
          out.sort((a, b) => b.boundingBox.width * b.boundingBox.height - a.boundingBox.width * a.boundingBox.height);
          const bb = out[0].boundingBox, sc = out[0].categories && out[0].categories[0] ? out[0].categories[0].score : 0.5;
          return { box: { x: r.x + bb.originX, y: r.y + bb.originY, w: bb.width, h: bb.height }, score: sc, via: 'FaceDetector' };
        }
      }
    } catch (e) { /* fall through to landmarker */ }
    try {
      const sig = await this.analyzeImage(canvas);
      if (sig.face) return { box: { x: sig.box.x * W, y: sig.box.y * H, w: sig.box.w * W, h: sig.box.h * H }, score: 0.6, via: 'FaceLandmarker' };
    } catch (e) { /* none */ }
    return null;
  }
  crop(canvas, r, scaleTo) {
    const c = document.createElement('canvas');
    const k = scaleTo ? Math.min(2.5, scaleTo / Math.max(r.w, r.h)) : 1;
    c.width = Math.max(1, Math.round(r.w * k)); c.height = Math.max(1, Math.round(r.h * k));
    const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high';
    g.drawImage(canvas, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
    return c;
  }
  /** Face crop with margin around a box (pixels). Square-ish portrait. */
  portrait(canvas, box, margin = 0.55, size = 320) {
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2, s = Math.max(box.w, box.h) * (1 + margin);
    const r = { x: Math.max(0, cx - s / 2), y: Math.max(0, cy - s / 2 * 1.08), w: s, h: s * 1.08 };
    r.w = Math.min(r.w, canvas.width - r.x); r.h = Math.min(r.h, canvas.height - r.y);
    return this.crop(canvas, r, size);
  }
  /* ----------------------------------------------------------------- embedding */
  /** 128-d L2-normalised SFace embedding of the aligned face. `lm` normalised landmarks of `canvas`. */
  async embed(canvas, lm) {
    const { ort, session } = await this.loadEmbedder();
    const a = alignFace(canvas, lm), d = a.getContext('2d').getImageData(0, 0, 112, 112).data;
    const f = new Float32Array(3 * 112 * 112);
    for (let i = 0, p = 112 * 112; i < p; i++) { f[i] = d[i * 4]; f[p + i] = d[i * 4 + 1]; f[2 * p + i] = d[i * 4 + 2]; } // RGB, 0..255 (OpenCV blobFromImage swapRB)
    const t0 = performance.now();
    const out = await session.run({ data: new ort.Tensor('float32', f, [1, 3, 112, 112]) });
    this.stats.inferMs.embed = Math.round(performance.now() - t0);
    const v = Float32Array.from(out[Object.keys(out)[0]].data);
    let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1;
    for (let i = 0; i < v.length; i++) v[i] /= n;
    return { vec: v, aligned: a };
  }
  /** Compare two faces. Returns {method, cosine, score(0..1 display), threshold, estimate:boolean}. */
  async compare(canvasA, lmA, canvasB, lmB) {
    try {
      const [ea, eb] = [await this.embed(canvasA, lmA), await this.embed(canvasB, lmB)];
      const cs = cosine(ea.vec, eb.vec);
      return { method: 'SFace-int8 (ONNX Runtime Web)', cosine: cs, score: cosToScore(cs), threshold: SFACE_THRESHOLD, estimate: false, aligned: [ea.aligned, eb.aligned] };
    } catch (e) {
      const sc = (c, lm) => lm.map(p => ({ x: p.x * c.width / c.height, y: p.y }));
      const g = geometrySimilarity(sc(canvasA, lmA), sc(canvasB, lmB));
      return { method: 'landmark geometry', cosine: null, score: g, threshold: 0.62, estimate: true, error: String(e && e.message || e) };
    }
  }
  /* ----------------------------------------------------------------- OCR */
  /** Prepare an MRZ band: crop, grayscale, upscale, percentile contrast stretch. */
  prepareMrz(canvas, fromFrac, toFrac = 1, targetW = 1700) {
    const W = canvas.width, H = canvas.height, y0 = Math.floor(H * fromFrac), hh = Math.max(8, Math.floor(H * (toFrac - fromFrac)));
    const k = Math.min(3, targetW / W);
    const c = document.createElement('canvas'); c.width = Math.round(W * k); c.height = Math.round(hh * k);
    const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high';
    g.drawImage(canvas, 0, y0, W, hh, 0, 0, c.width, c.height);
    const im = g.getImageData(0, 0, c.width, c.height), d = im.data;
    const hist = new Uint32Array(256); const n = c.width * c.height;
    for (let i = 0; i < d.length; i += 4) { const y = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) | 0; d[i] = y; hist[y]++; }
    let acc = 0, lo = 0, hi = 255; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc > n * 0.02) { lo = v; break; } }
    acc = 0; for (let v = 255; v >= 0; v--) { acc += hist[v]; if (acc > n * 0.25) { hi = v; break; } }
    const span = Math.max(30, hi - lo);
    for (let i = 0; i < d.length; i += 4) { const y = Math.max(0, Math.min(255, ((d[i] - lo) / span) * 255)); d[i] = d[i + 1] = d[i + 2] = y; }
    g.putImageData(im, 0, 0);
    return c;
  }
  /** Try to read an MRZ from a passport image. Returns {parsed, text, tries, ms} (parsed may be null). */
  async readMrz(canvas, onTry) {
    const w = await this.loadOcr();
    const t0 = performance.now(); const tries = [];
    const bands = [[0.7, 1], [0.58, 1], [0.8, 1], [0, 1]];
    let best = null;
    for (const [a, b] of bands) {
      const pc = this.prepareMrz(canvas, a, b);
      const { data } = await w.recognize(pc);
      let parsed = findMrz(data.text); if (parsed && !parsed.valid) parsed = repairTD3(parsed);
      tries.push({ band: [a, b], text: data.text.trim().slice(0, 200), valid: !!(parsed && parsed.valid), score: parsed ? parsed.score : 0 });
      if (onTry) onTry(tries[tries.length - 1]);
      if (parsed) parsed._pc = pc;
      // Only the trailing check digits failed (the right edge of line 2 is the commonest OCR casualty): re-read that corner with a digits-only whitelist.
      if (parsed && !parsed.valid && parsed.format === 'TD3' && parsed.checks.docNumber && parsed.checks.dob && parsed.checks.expiry) {
        try {
          const tail = await this.ocrTail(pc); tries.push({ band: 'tail', text: tail, valid: false, score: 0 });
          const [l1, l2] = parsed.lines;
          for (const cand of [l2.slice(0, 28) + tail.slice(-16).padStart(16, '<'), l2.slice(0, 42) + tail.slice(-2)]) {
            const p = parseTD3(l1, cand.slice(0, 44));
            if (p.score > parsed.score) { parsed = { ...p, repaired: true, _pc: pc }; tries[tries.length - 1].valid = p.valid; }
            if (parsed.valid) break;
          }
        } catch (e) { /* keep what we have */ }
      }
      if (parsed && (!best || parsed.score > best.score)) best = parsed;
      if (parsed && parsed.valid) break;
    }
    if (best) delete best._pc;
    return { parsed: best, tries, ms: Math.round(performance.now() - t0) };
  }
  /** Digits-only OCR of the lower-right corner (end of MRZ line 2). Returns characters from 0-9 and '<'. */
  async ocrTail(pc) {
    const w = await this.loadOcr(), W = pc.width, H = pc.height;
    const c = this.crop(pc, { x: W * 0.6, y: H * 0.5, w: W * 0.4, h: H * 0.5 }, 900);
    await w.setParameters({ tessedit_char_whitelist: '0123456789<', tessedit_pageseg_mode: '7' });
    try { const { data } = await w.recognize(c); return data.text.replace(/[^0-9<]/g, ''); }
    finally { await w.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<', tessedit_pageseg_mode: '6' }); }
  }
}

/** Map an SFace cosine to a friendly 0..1 display score: 0.363 (decision threshold) lands at 0.72 ("clear match" starts there). */
export function cosToScore(c) {
  if (c <= 0) return 0.05 * Math.max(0, 1 + c);
  if (c < SFACE_THRESHOLD) return 0.72 * (c / SFACE_THRESHOLD) ** 1.25;
  return Math.min(0.99, 0.72 + 0.27 * ((c - SFACE_THRESHOLD) / (0.75 - SFACE_THRESHOLD)));
}
