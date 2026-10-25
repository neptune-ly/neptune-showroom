// Neptune Polaris (showroom) - on-device liveness logic. Pure ES module (no DOM) so it can be unit-tested in node.
//
// DEMO-GRADE ONLY. Active challenges (blink / turn / smile in random order) plus a few passive cues. This is a
// demonstration of the experience, NOT a certified presentation-attack-detection system (no ISO/IEC 30107-3 claim).
//
// A "signal" (sig) is one frame of measurements, produced either by the real MediaPipe landmarker (extractSignals)
// or by the synthetic Demo camera. Convention:  turn  > 0 = the person turned to THEIR OWN LEFT, < 0 = their right.

export const LM = {
  // MediaPipe FaceLandmarker 478-point mesh
  rEyeOuter: 33, rEyeInner: 133, rEyeTop1: 160, rEyeTop2: 158, rEyeBot1: 144, rEyeBot2: 153,
  lEyeInner: 362, lEyeOuter: 263, lEyeTop1: 385, lEyeTop2: 387, lEyeBot1: 380, lEyeBot2: 373,
  nose: 1, noseBridge: 168, chin: 152, forehead: 10, cheekR: 234, cheekL: 454,
  mouthR: 61, mouthL: 291, lipTop: 13, lipBot: 14, irisR: 468, irisL: 473,
};
// Stable subset (brows, eyes, nose, mouth) used for the non-rigid micro-motion cue.
export const STABLE = [33, 133, 160, 158, 144, 153, 362, 263, 385, 387, 380, 373, 1, 168, 61, 291, 13, 14, 105, 334, 70, 300, 98, 327, 152, 10];

const d2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Eye aspect ratio (Soukupova and Cech): ~0.30 open, < ~0.18 closed. Landmarks are normalised image coords; ratio is scale-free. */
export function eyeAspect(lm, side) {
  const p = side === 'r'
    ? [lm[LM.rEyeOuter], lm[LM.rEyeInner], lm[LM.rEyeTop1], lm[LM.rEyeBot1], lm[LM.rEyeTop2], lm[LM.rEyeBot2]]
    : [lm[LM.lEyeOuter], lm[LM.lEyeInner], lm[LM.lEyeTop1], lm[LM.lEyeBot1], lm[LM.lEyeTop2], lm[LM.lEyeBot2]];
  const h = d2(p[0], p[1]);
  return h > 0 ? (d2(p[2], p[3]) + d2(p[4], p[5])) / (2 * h) : 0;
}
/** Head turn index from nose-vs-cheek asymmetry. -1..1, positive = subject's left. ~0.45 is roughly 20-25 degrees. */
export function turnIndex(lm) {
  const cr = lm[LM.cheekR], cl = lm[LM.cheekL], n = lm[LM.nose];
  const w = cl.x - cr.x; // subject's left cheek has the larger raw x in an un-mirrored frame
  if (Math.abs(w) < 1e-6) return 0;
  return clamp(((n.x - (cr.x + cl.x) / 2) / w) * 2, -1, 1);
}
/** Vertical look: nose position between eye line and chin. ~0 = level, + = looking up. */
export function pitchIndex(lm) {
  const eyeY = (lm[LM.rEyeInner].y + lm[LM.lEyeInner].y) / 2, chin = lm[LM.chin].y, n = lm[LM.nose].y;
  const span = chin - eyeY; if (span < 1e-6) return 0;
  return clamp(-((n - eyeY) / span - 0.52) * 4, -1, 1);
}
export function rollDeg(lm) {
  const a = lm[LM.rEyeOuter], b = lm[LM.lEyeOuter];
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}
/** Smile from mouth geometry: corner spread vs inter-ocular distance, plus lip lift. Used if blendshapes are missing. */
export function smileGeom(lm) {
  const io = d2(lm[LM.rEyeOuter], lm[LM.lEyeOuter]) || 1;
  const mw = d2(lm[LM.mouthR], lm[LM.mouthL]) / io;
  const lift = ((lm[LM.lipTop].y + lm[LM.lipBot].y) / 2 - (lm[LM.mouthR].y + lm[LM.mouthL].y) / 2) / io; // corners rise above lip centre when smiling
  return { mw, lift };
}
export function faceBox(lm) {
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const p of lm) { if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}
const bs = (cats, name) => { const c = cats && cats.find(x => x.categoryName === name); return c ? c.score : 0; };

/** Build a signal from a MediaPipe FaceLandmarkerResult (VIDEO mode). `video` = {w,h}. Returns {face:false,...} when none. */
export function extractSignals(res, t, extra = {}) {
  const faces = (res && res.faceLandmarks) ? res.faceLandmarks.length : 0;
  if (!faces) return { t, face: false, faces: 0, ...extra };
  const lm = res.faceLandmarks[0];
  // Distances must be measured in an isotropic space: x is normalised by width, y by height.
  const asp = extra.aspect || 1;
  const lmS = asp === 1 ? lm : lm.map(p => ({ x: p.x * asp, y: p.y, z: p.z }));
  const cats = res.faceBlendshapes && res.faceBlendshapes[0] && res.faceBlendshapes[0].categories;
  const earR = eyeAspect(lmS, 'r'), earL = eyeAspect(lmS, 'l');
  const blink = cats ? Math.max(bs(cats, 'eyeBlinkLeft'), bs(cats, 'eyeBlinkRight')) : 0;
  const g = smileGeom(lmS);
  const smileBS = cats ? (bs(cats, 'mouthSmileLeft') + bs(cats, 'mouthSmileRight')) / 2 : 0;
  const box = faceBox(lm);
  return {
    t, face: true, faces, lm, lmS, box,
    ear: (earR + earL) / 2, blink, hasBlend: !!cats,
    turn: turnIndex(lmS), pitch: pitchIndex(lmS), roll: rollDeg(lmS),
    smile: cats ? smileBS : clamp((g.mw - 0.78) * 4, 0, 1), mouthW: g.mw,
    jaw: cats ? bs(cats, 'jawOpen') : 0,
    ...extra,
  };
}

/* ---------------------------------------------------------------- image statistics (pure, work on RGBA arrays) */
/** Mean luma and contrast (std) of an RGBA buffer. */
export function lumaStats(d, step = 4) {
  let s = 0, s2 = 0, n = 0;
  for (let i = 0; i < d.length; i += 4 * step) {
    const y = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    s += y; s2 += y * y; n++;
  }
  const m = s / (n || 1);
  return { mean: m, std: Math.sqrt(Math.max(0, s2 / (n || 1) - m * m)) };
}
/** Variance of the Laplacian over a grayscale conversion of an RGBA buffer (focus / motion-blur measure). */
export function sharpness(d, w, h) {
  const g = new Float32Array(w * h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) g[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, v = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
    s += v; s2 += v * v; n++;
  }
  const m = s / (n || 1);
  return s2 / (n || 1) - m * m;
}
/** Passive "is a document with a text band in view" score for the passport guide: MRZ band edge density vs the page body. */
export function docScore(d, w, h) {
  const g = new Float32Array(w * h);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) g[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  const rowE = new Float32Array(h);
  for (let y = 0; y < h; y++) { let e = 0; for (let x = 1; x < w; x++) e += Math.abs(g[y * w + x] - g[y * w + x - 1]); rowE[y] = e / w; }
  const avg = (a, b) => { let s = 0; for (let y = a; y < b; y++) s += rowE[y]; return s / Math.max(1, b - a); };
  const band = avg(Math.floor(h * 0.76), Math.floor(h * 0.96)), body = avg(Math.floor(h * 0.1), Math.floor(h * 0.7));
  // MRZ: two dense text rows at the bottom. A blank table/wall has low energy everywhere.
  const dense = band > 6;
  return { band, body, ratio: band / (body + 1), ok: dense && band > body * 0.55 };
}

/* ---------------------------------------------------------------- passive anti-photo cues (demo-grade) */
/** Non-rigid micro-motion: residual after removing a best-fit similarity transform between consecutive landmark sets. */
export function nonRigidResidual(prev, cur, idx = STABLE) {
  if (!prev || !cur) return 0;
  const A = idx.map(i => prev[i]), B = idx.map(i => cur[i]);
  const n = A.length;
  const ca = A.reduce((o, p) => ({ x: o.x + p.x / n, y: o.y + p.y / n }), { x: 0, y: 0 });
  const cb = B.reduce((o, p) => ({ x: o.x + p.x / n, y: o.y + p.y / n }), { x: 0, y: 0 });
  let sxx = 0, sxy = 0, saa = 0;
  for (let i = 0; i < n; i++) {
    const ax = A[i].x - ca.x, ay = A[i].y - ca.y, bx = B[i].x - cb.x, by = B[i].y - cb.y;
    sxx += ax * bx + ay * by; sxy += ax * by - ay * bx; saa += ax * ax + ay * ay;
  }
  if (saa < 1e-9) return 0;
  const a = sxx / saa, b = sxy / saa; // rotation+scale
  let r = 0;
  for (let i = 0; i < n; i++) {
    const ax = A[i].x - ca.x, ay = A[i].y - ca.y;
    const px = a * ax - b * ay + cb.x, py = b * ax + a * ay + cb.y;
    r += (B[i].x - px) ** 2 + (B[i].y - py) ** 2;
  }
  const scale = Math.sqrt(saa / n) || 1;
  return Math.sqrt(r / n) / scale; // relative to face size
}

/* ---------------------------------------------------------------- quality gate */
export const DEFAULT_QUALITY = { centre: 0.13, minH: 0.34, maxH: 0.78, minR: 0.6, maxR: 1.1, minLuma: 70, maxLuma: 215, minStd: 22, maxTurn: 0.22, maxRoll: 14, sharp: 6 };
/**
 * Live face-guide checks. Returns {checks:[{id,ok,hint}], ok}. `guide` = {cx,cy} (default centre of frame).
 * Each check has a hint key the UI translates: move_closer, move_back, centre, light_low, light_high, steady, one_face, look_straight.
 */
export function qualityChecks(sig, q = DEFAULT_QUALITY, guide = { cx: 0.5, cy: 0.46 }) {
  if (!sig || !sig.face) return { ok: false, checks: [{ id: 'face', ok: false, hint: 'no_face' }, { id: 'centre', ok: false, hint: 'centre' }, { id: 'distance', ok: false, hint: 'move_closer' }, { id: 'light', ok: false, hint: 'light_low' }], noFace: true };
  const b = sig.box, checks = [];
  checks.push({ id: 'face', ok: sig.faces === 1, hint: sig.faces > 1 ? 'one_face' : 'ok' });
  const dx = b.cx - guide.cx, dy = b.cy - guide.cy;
  checks.push({ id: 'centre', ok: Math.abs(dx) < q.centre && Math.abs(dy) < q.centre && Math.abs(sig.turn) < q.maxTurn && Math.abs(sig.roll) < q.maxRoll, hint: (Math.abs(sig.turn) >= q.maxTurn || Math.abs(sig.roll) >= q.maxRoll) ? 'look_straight' : 'centre' });
  // If the guide height is known (oval height as a fraction of the video frame) judge distance against the oval, else the absolute fraction.
  const lo = guide.h ? q.minR * guide.h : q.minH, hi = guide.h ? q.maxR * guide.h : q.maxH;
  checks.push({ id: 'distance', ok: b.h >= lo && b.h <= hi, hint: b.h < lo ? 'move_closer' : b.h > hi ? 'move_back' : 'ok' });
  const lumaOk = sig.luma === undefined || (sig.luma >= q.minLuma && sig.luma <= q.maxLuma && (sig.contrast === undefined || sig.contrast >= q.minStd));
  checks.push({ id: 'light', ok: lumaOk, hint: sig.luma !== undefined && sig.luma < q.minLuma ? 'light_low' : sig.luma > q.maxLuma ? 'light_high' : (sig.contrast !== undefined && sig.contrast < q.minStd ? 'light_low' : 'ok') });
  return { checks, ok: checks.every(c => c.ok) };
}

/* ---------------------------------------------------------------- challenge session */
export const CHALLENGES = ['blink', 'turnLeft', 'turnRight', 'smile'];

/** Fisher-Yates pick of n distinct challenges. rng() must return [0,1). */
export function pickChallenges(n = 3, rng = Math.random, pool = CHALLENGES) {
  const a = pool.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, Math.min(n, a.length));
}

/**
 * Active liveness state machine. Feed it one signal per frame with update(sig). Phases:
 *   align  -> quality gate must hold ~0.5 s
 *   neutral-> face relaxed (eyes open, level, no smile) before each prompt so a prompt cannot be satisfied by leftovers
 *   prompt -> waiting for the challenge, with a timeout (retries then fail)
 *   win    -> brief success flash
 *   capture-> hold still, best frame chosen
 *   done | failed
 */
export class LivenessSession {
  constructor(opts = {}) {
    this.rng = opts.rng || Math.random;
    this.fixed = opts.list && opts.list.length ? opts.list.filter(c => CHALLENGES.includes(c)) : null;
    this.n = this.fixed ? this.fixed.length : (opts.challenges || 3);
    this.timeoutMs = opts.timeoutMs || 10000;
    this.maxRetries = opts.maxRetries ?? 2;
    this.alignMs = opts.alignMs || 500;
    this.alignTimeoutMs = opts.alignTimeoutMs || 30000;
    this.winMs = opts.winMs || 650;
    this.captureMs = opts.captureMs || 700;
    this.q = { ...DEFAULT_QUALITY, ...(opts.quality || {}) };
    this.guide = opts.guide || { cx: 0.5, cy: 0.46 };
    this.reset();
  }
  reset() {
    this.list = this.fixed ? this.fixed.slice() : pickChallenges(this.n, this.rng);
    this.i = 0; this.phase = 'align'; this.phaseAt = null; this.retries = 0; this.failedReason = null;
    this.earBase = 0.28; this.blinkBase = 0.1; this.nBase = 0; this.smileBase = 0.12; this.history = []; this.lastLm = null;
    this.micro = []; this.cues = { micro: 0, parallax: 0, maxTurn: 0, blinkSeen: false, frames: 0 };
    this.bt = { closedAt: null, seenOpen: true }; this.hold = 0; this.best = null; this.results = []; this.t0 = null; this.promptAt = null; this.qok = 0;
    this.neutralFrames = 0; this.turnBaseNose = null;
    return this;
  }
  get current() { return this.list[this.i]; }
  /** Overall progress 0..1: align 5%, challenges 80% (each fills on pass), capture 15%. */
  get progress() {
    const per = 0.8 / this.list.length;
    if (this.phase === 'done') return 1;
    if (this.phase === 'align') return 0;
    if (this.phase === 'capture') return 0.85;
    return clamp(0.05 + this.i * per + (this.phase === 'win' ? per : 0), 0, 0.85);
  }
  _set(p, t) { this.phase = p; this.phaseAt = t; this.hold = 0; if (p === 'prompt') { this.promptAt = t; } }
  _isNeutral(s) {
    return s.face && Math.abs(s.turn) < 0.25 && s.smile < 0.35 && s.blink < this.blinkBase + 0.12 && s.ear > this.earBase * 0.8;
  }
  _isBlinking(s) { return s.face && (s.blink > Math.max(0.4, this.blinkBase + 0.14) || s.ear < this.earBase * 0.76); }
  /** Returns {phase, challenge, index, total, progress, quality, events:[...], hint}. */
  update(s, t = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    const events = [];
    if (this.t0 === null) { this.t0 = t; this._set('align', t); }
    const quality = qualityChecks(s, this.q, this.guide);
    this.cues.frames++;
    if (s.face) {
      // learn this person's resting eye openness / blink score (narrow eyes rest at a higher blink blendshape), but never while blinking
      if ((this.phase === 'align' || this.phase === 'neutral') && (this.nBase < 20 || (s.blink < this.blinkBase + 0.1 && s.ear > 0.12))) {
        const a = this.nBase++ < 20 ? 0.2 : 0.03; this.earBase = this.earBase * (1 - a) + s.ear * a; this.blinkBase = this.blinkBase * (1 - a) + s.blink * a;
      }
      if (this.lastLm) { const r = nonRigidResidual(this.lastLm, s.lmS || s.lm); this.micro.push(r); if (this.micro.length > 90) this.micro.shift(); }
      this.lastLm = s.lmS || s.lm;
      if (s.micro !== undefined) this.micro.push(s.micro);
      this.cues.maxTurn = Math.max(this.cues.maxTurn, Math.abs(s.turn));
      if (this.phase === 'align' || this.phase === 'neutral') this.smileBase = this.smileBase * 0.97 + Math.min(s.smile, 0.3) * 0.03;
    }
    const ph = this.phase;
    if (ph === 'align') {
      if (quality.ok) this.qok += 1; else this.qok = 0;
      if (quality.ok) { if (this.hold === 0) this.hold = t; if (t - this.hold >= this.alignMs) { events.push({ type: 'aligned' }); this._set('neutral', t); } }
      else this.hold = 0;
      if (t - this.t0 > this.alignTimeoutMs) return this._fail('align', t, events, quality);
    } else if (ph === 'neutral') {
      if (this._isNeutral(s)) { this.neutralFrames++; if (this.neutralFrames >= 4) { this.neutralFrames = 0; this.bt = { closedAt: null, seenOpen: true }; events.push({ type: 'prompt', challenge: this.current, index: this.i }); this._set('prompt', t); } }
      else this.neutralFrames = 0;
      if (!s.face && t - this.phaseAt > 6000) return this._fail('no_face', t, events, quality);
    } else if (ph === 'prompt') {
      const c = this.current;
      let ok = false;
      if (!s.face) { this.hold = 0; }
      else if (c === 'blink') {
        const closed = this._isBlinking(s);
        if (closed && this.bt.seenOpen && this.bt.closedAt === null) { this.bt.closedAt = t; }
        else if (!closed && this.bt.closedAt !== null) {
          const dur = t - this.bt.closedAt; this.bt.closedAt = null;
          if (dur >= 40 && dur <= 900) { ok = true; this.cues.blinkSeen = true; }
        }
        if (!closed && s.ear > this.earBase * 0.8) this.bt.seenOpen = true;
      } else if (c === 'turnLeft' || c === 'turnRight') {
        const want = c === 'turnLeft' ? 1 : -1;
        if (s.turn * want >= 0.42) { if (!this.hold) this.hold = t; if (t - this.hold >= 220) ok = true; } else this.hold = 0;
        if (ok) this.cues.parallax = Math.max(this.cues.parallax, Math.abs(s.turn));
      } else if (c === 'smile') {
        if (s.smile >= Math.max(0.5, this.smileBase + 0.3)) { if (!this.hold) this.hold = t; if (t - this.hold >= 220) ok = true; } else this.hold = 0;
      }
      if (ok) {
        this.results.push({ challenge: c, ms: Math.round(t - this.promptAt) });
        events.push({ type: 'pass', challenge: c, index: this.i, ms: Math.round(t - this.promptAt) });
        this._set('win', t);
      } else if (t - this.promptAt > this.timeoutMs) {
        if (this.retries < this.maxRetries) {
          this.retries++; events.push({ type: 'retry', challenge: c, index: this.i });
          // replace with a different not-yet-used challenge so the prompt cannot be pre-rehearsed
          const unused = CHALLENGES.filter(x => !this.list.includes(x));
          if (unused.length) this.list[this.i] = unused[Math.floor(this.rng() * unused.length)];
          this._set('neutral', t);
        } else return this._fail('timeout', t, events, quality);
      }
    } else if (ph === 'win') {
      if (t - this.phaseAt >= this.winMs) {
        this.i++;
        if (this.i >= this.list.length) { this._set('capture', t); events.push({ type: 'capturing' }); }
        else this._set('neutral', t);
      }
    } else if (ph === 'capture') {
      if (s.face && quality.ok) {
        const score = (s.sharp ?? 10) * (1 - Math.abs(s.turn)) * (s.ear > this.earBase * 0.85 ? 1 : 0.3) * (1 - clamp(s.smile, 0, 0.6));
        if (!this.best || score > this.best.score) this.best = { score, t, sig: s };
      }
      if (t - this.phaseAt >= this.captureMs && this.best) { this._set('done', t); events.push({ type: 'done' }); }
      else if (t - this.phaseAt > this.captureMs + 5000) return this._fail('capture', t, events, quality);
    }
    return this.view(events, quality);
  }
  _fail(reason, t, events, quality) { this.phase = 'failed'; this.failedReason = reason; events.push({ type: 'failed', reason }); return this.view(events, quality); }
  view(events = [], quality = null) {
    return { phase: this.phase, challenge: this.phase === 'prompt' || this.phase === 'win' ? this.list[Math.min(this.i, this.list.length - 1)] : (this.phase === 'neutral' ? this.list[this.i] : null), index: this.i, total: this.list.length, list: this.list.slice(), progress: this.progress, quality, events, done: this.phase === 'done', failed: this.phase === 'failed', reason: this.failedReason };
  }
  /** Final summary for the host app. */
  summary() {
    const m = this.micro.length ? this.micro.reduce((a, b) => a + b, 0) / this.micro.length : 0;
    const flat = this.micro.length > 20 && m < 0.0004 && !this.cues.blinkSeen;
    return {
      grade: 'demo', certified: false,
      passed: this.phase === 'done' && !flat,
      challenges: this.results, retries: this.retries,
      cues: { microMotion: +m.toFixed(5), depthParallax: +this.cues.parallax.toFixed(2), maxTurn: +this.cues.maxTurn.toFixed(2), blinkSeen: this.cues.blinkSeen, frames: this.cues.frames },
      flat,
    };
  }
}

/* ---------------------------------------------------------------- geometry-based similarity (labelled "demo estimate") */
const GEO_PAIRS = [[33, 263], [133, 362], [33, 133], [362, 263], [1, 168], [1, 152], [61, 291], [13, 14], [152, 10], [234, 454], [105, 334], [1, 61], [1, 291], [168, 152], [10, 1], [234, 1], [454, 1], [159, 145], [386, 374], [199, 152], [98, 327]];
export function geometryVector(lm) {
  const io = d2(lm[LM.rEyeOuter], lm[LM.lEyeOuter]) || 1;
  return GEO_PAIRS.map(([a, b]) => d2(lm[a], lm[b]) / io);
}
/** Cosine of mean-centred ratio vectors mapped to a 0..1 "demo estimate". Honest: crude, frontal poses only. */
export function geometrySimilarity(lmA, lmB) {
  const a = geometryVector(lmA), b = geometryVector(lmB);
  const rel = a.map((v, i) => Math.abs(v - b[i]) / ((v + b[i]) / 2 + 1e-6));
  const err = rel.reduce((x, y) => x + y, 0) / rel.length;
  return clamp(1 - err * 3.2, 0, 1);
}
