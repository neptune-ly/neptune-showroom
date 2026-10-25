// Neptune Polaris (showroom) - embeddable on-device onboarding identity module.
//
//   import { mount } from '../shared/polaris/polaris.js';
//   const polaris = mount(el, { lang: 'en' });
//   polaris.on('step',   e => ...);   // {id, index, phase}
//   polaris.on('result', e => ...);   // {decision:'accepted'|'review'|'retake', reason, document, liveness, match, images, mode, reference}
//   polaris.on('continue', e => ...); // the person pressed Continue on the result screen
//
// Flow: consent -> camera permission -> passport capture (auto-capture) -> MRZ read + check digits + portrait crop ->
//       live selfie with randomised active liveness -> face match -> result (accepted / retake / manual review).
// Real-time, on-device, no backend: MediaPipe FaceLandmarker/FaceDetector, SFace embeddings via ONNX Runtime Web, tesseract.js OCR.
// DEMO-GRADE. Not certified (no ISO/IEC 30107 PAD claim). See README.md.

import { Engine, SFACE_THRESHOLD } from './engine.js';
import { LivenessSession, docScore, sharpness, lumaStats } from './liveness.js';
import { parseTD3, findMrz, countryName } from './mrz.js';
import { DemoCamera, DEMO_PEOPLE, renderPassport, loadMrzFont } from './demo-camera.js';
import { tr } from './strings.js';
import { icon, blinkIcon } from './icons.js';

const HERE = new URL('./', import.meta.url).href;
export { DEMO_PEOPLE };
export const VERSION = '1.0.0';

const STEPS = ['intro', 'perm', 'ppGuide', 'ppCam', 'read', 'sfGuide', 'sfCam', 'match', 'result'];
const PHASE = { intro: -1, perm: -1, ppGuide: 0, ppCam: 0, read: 0, sfGuide: 1, sfCam: 1, match: 2, result: 2 };
const PROGRESS = { intro: [0, 0, 0], perm: [0, 0, 0], ppGuide: [.15, 0, 0], ppCam: [.4, 0, 0], read: [.8, 0, 0], sfGuide: [1, .2, 0], sfCam: [1, .6, 0], match: [1, 1, .5], result: [1, 1, 1] };
const IMMERSIVE = new Set(['ppCam', 'sfCam']);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* not supported */ } };

function ensureCss(href) {
  if (document.querySelector('link[data-polaris-css]')) return;
  const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; l.dataset.polarisCss = '1'; document.head.appendChild(l);
}
/** object-fit: cover mapping between a container and a video/canvas frame. */
function coverMap(cw, ch, vw, vh) { const s = Math.max(cw / vw, ch / vh); return { s, ox: (cw - vw * s) / 2, oy: (ch - vh * s) / 2 }; }
const toVideo = (r, m) => ({ x: (r.x - m.ox) / m.s, y: (r.y - m.oy) / m.s, w: r.w / m.s, h: r.h / m.s });

export function mount(el, options = {}) { const p = new Polaris(el, options); p.start(); return p.api(); }

class Polaris {
  constructor(host, o) {
    this.host = host;
    this.o = {
      lang: 'en', camera: 'auto', allowDemo: true, allowUpload: true, challenges: 3, rng: Math.random, vendorBase: HERE + 'vendor/', cssHref: HERE + 'polaris.css',
      thresholds: { match: SFACE_THRESHOLD, review: 0.25 }, continueLabel: null, preload: true, person: DEMO_PEOPLE[0], startAt: 'intro', autoCapture: true, ...o,
    };
    this.lang = this.o.lang;
    this.h = {}; this.td = []; this.alive = true;
    this.S = this.fresh();
    this.engine = new Engine({ base: this.o.vendorBase, onStatus: (id, st) => this.onModel(id, st) });
  }
  fresh() {
    return {
      step: null, mode: null, consent: false, perm: 'ask',
      passport: { canvas: null, uploaded: false, mrz: null, portrait: null, lm: null, faceBox: null, ocr: null, expired: false, photoOk: null, sig: null },
      read: { rows: { zone: 'wait', doc: 'wait', dob: 'wait', exp: 'wait', all: 'wait', photo: 'wait' }, done: false, manual: false, ms: 0, chars: 0, error: null, running: false },
      selfie: { canvas: null, lm: null, sig: null, uploaded: false, portrait: null },
      liveness: null, match: null, result: null, attempts: { selfie: 0, passport: 0 }, ref: null,
    };
  }
  /* ----------------------------------------------------------------- public api */
  api() {
    const self = this;
    return {
      on: (e, f) => { (self.h[e] = self.h[e] || []).push(f); return self.api(); },
      off: (e, f) => { self.h[e] = (self.h[e] || []).filter(x => x !== f); },
      setLang: l => self.setLang(l),
      goto: (id) => self.go(id),
      restart: () => self.restart(),
      destroy: () => self.destroy(),
      get state() { return self.S; },
      get engine() { return self.engine; },
      get step() { return self.S.step; },
      get root() { return self.root; },
      version: VERSION,
    };
  }
  emit(type, detail) {
    (this.h[type] || []).slice().forEach(f => { try { f(detail); } catch (e) { console.error(e); } });
    try { this.host.dispatchEvent(new CustomEvent('polaris:' + type, { detail, bubbles: true })); } catch (e) { /* ignore */ }
    const cb = this.o['on' + type[0].toUpperCase() + type.slice(1)]; if (cb) { try { cb(detail); } catch (e) { console.error(e); } }
  }
  t(k, p) { return tr(this.lang, k, p); }
  /* ----------------------------------------------------------------- shell */
  start() {
    ensureCss(this.o.cssHref);
    this.host.innerHTML = '';
    const r = this.root = document.createElement('div');
    r.className = 'po'; r.setAttribute('data-polaris', VERSION);
    r.innerHTML = `<header class="po-top"><button class="po-iconbtn" data-act="back" aria-label="back">${icon('arrowL', 24, 'class="po-flip"')}</button><div class="po-track" role="progressbar" aria-label="progress"></div><button class="po-iconbtn" data-act="close" aria-label="close">${icon('x')}</button></header><div class="po-stage"></div><canvas class="po-confetti" width="10" height="10"></canvas>`;
    this.host.appendChild(r);
    this.stage = r.querySelector('.po-stage'); this.trackEl = r.querySelector('.po-track'); this.confetti = r.querySelector('.po-confetti');
    r.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && r.contains(b)) this.act(b.dataset.act, b, e); });
    this.applyLang(); this.watchLook();
    if (this.o.preload) setTimeout(() => this.engine.preload(), 60);
    this.go(this.o.startAt || 'intro', 'fwd', true);
  }
  watchLook() {
    const upd = () => { this.refreshExpr(); };
    this.onLook = upd; document.addEventListener('looks:change', upd);
    this.mo = new MutationObserver(upd); this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-look', 'data-odyssey-mode', 'data-reduce-motion', 'lang', 'dir'] });
    this.refreshExpr();
  }
  refreshExpr() {
    const r = this.root; if (!r) return;
    const m = parseFloat(getComputedStyle(r).getPropertyValue('--look-motion'));
    r.dataset.expr = (isNaN(m) || m >= 0.6) ? 'lively' : 'sober';
    const rm = (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) || document.documentElement.dataset.reduceMotion === 'true' || this.o.reduceMotion;
    r.dataset.reduce = rm ? '1' : '0';
    this.reduce = !!rm;
  }
  applyLang() { const r = this.root; r.lang = this.lang; r.dir = this.lang === 'ar' ? 'rtl' : 'ltr'; }
  setLang(l) {
    this.lang = l; this.applyLang(); this.retext();
    if (this.repaint) this.repaint();
  }
  retext() { this.root.querySelectorAll('[data-t]').forEach(n => { n.textContent = this.t(n.dataset.t, n.dataset.p ? JSON.parse(n.dataset.p) : undefined); }); this.root.querySelectorAll('[data-ta]').forEach(n => n.setAttribute('aria-label', this.t(n.dataset.ta))); this.paintTrack(); }
  destroy() {
    this.alive = false; this.leave(); if (this.keep) { this.keep.stop(); this.keep = null; }
    try { this.mo && this.mo.disconnect(); document.removeEventListener('looks:change', this.onLook); } catch (e) { /* ignore */ }
    this.host.innerHTML = '';
  }
  restart() { this.leave(); if (this.keep) { this.keep.stop(); this.keep = null; } this.S = this.fresh(); this._announced = null; this.go('intro', 'back'); this.emit('restart', {}); }
  leave() { const t = this.td; this.td = []; t.forEach(f => { try { f(); } catch (e) { /* ignore */ } }); this.repaint = null; this.stopSource(); }

  /* ----------------------------------------------------------------- navigation */
  go(step, dir = 'fwd', first = false) {
    this.leave();
    const S = this.S; S.step = step;
    this.root.classList.toggle('po-immersive', IMMERSIVE.has(step));
    this.root.querySelector('.po-top').style.display = IMMERSIVE.has(step) ? 'none' : '';
    const sc = document.createElement('section');
    sc.className = 'po-screen'; sc.dataset.step = step; if (dir === 'back') sc.dataset.dir = 'back';
    sc.setAttribute('aria-live', 'polite');
    this.stage.innerHTML = ''; this.stage.appendChild(sc); this.sc = sc;
    this['draw_' + step](sc);
    this.retext(); this.paintTrack();
    const back = this.root.querySelector('[data-act=back]'); back.style.visibility = (step === 'intro' || step === 'result') ? 'hidden' : '';
    this.emit('step', { id: step, index: STEPS.indexOf(step), phase: PHASE[step], mode: S.mode });
    if (this['run_' + step]) Promise.resolve(this['run_' + step](sc)).catch(e => { console.error('[polaris]', step, e); this.emit('error', { step, error: String(e && e.message || e) }); });
  }
  paintTrack() {
    const S = this.S, ph = PHASE[S.step], pr = PROGRESS[S.step] || [0, 0, 0];
    const names = ['po.step.passport', 'po.step.selfie', 'po.step.match'];
    this.trackEl.innerHTML = names.map((k, i) => `<div class="po-seg" data-state="${i < ph ? 'done' : i === ph ? 'cur' : 'todo'}"><span>${this.t(k)}</span><i style="--p:${pr[i]}"></i></div>`).join('');
    this.trackEl.setAttribute('aria-valuenow', String(Math.round(((pr[0] + pr[1] + pr[2]) / 3) * 100)));
  }
  act(a, btn, ev) {
    const S = this.S;
    switch (a) {
      case 'back': this.back(); break;
      case 'close': this.emit('close', {}); break;
      case 'start': if (!S.consent) return; this.toPerm(); break;
      case 'allow': this.requestCamera(); break;
      case 'useDemo': this.chooseMode('demo'); break;
      case 'useUpload': this.chooseMode('upload'); break;
      case 'openPp': if (S.mode === 'upload') this.pickFile('passport'); else this.go('ppCam'); break;
      case 'pickPp': this.pickFile('passport'); break;
      case 'shutter': this.captureNow && this.captureNow(true); break;
      case 'retakePp': S.attempts.passport++; S.passport = this.fresh().passport; S.read = this.fresh().read; this.go(S.mode === 'upload' ? 'ppGuide' : 'ppCam', 'back'); break;
      case 'readNext': this.go('sfGuide'); break;
      case 'manual': this.showManual(); break;
      case 'applyManual': this.applyManual(); break;
      case 'sample': this.fillSample(); break;
      case 'openSf': if (S.mode === 'upload') this.pickFile('selfie'); else this.go('sfCam'); break;
      case 'pickSf': this.pickFile('selfie'); break;
      case 'retrySf': S.attempts.selfie++; S.selfie = this.fresh().selfie; S.liveness = null; S.match = null; this.go(S.mode === 'upload' ? 'sfGuide' : 'sfCam', 'back'); break;
      case 'retryPpFromResult': S.attempts.passport++; S.passport = this.fresh().passport; S.read = this.fresh().read; S.selfie = this.fresh().selfie; S.liveness = null; S.match = null; this.go(S.mode === 'upload' ? 'ppGuide' : 'ppCam', 'back'); break;
      case 'continue': this.emit('continue', this.payload()); break;
      case 'restart': this.restart(); break;
      default: break;
    }
  }
  back() {
    const S = this.S, m = { perm: 'intro', ppGuide: 'intro', ppCam: 'ppGuide', read: 'ppGuide', sfGuide: 'read', sfCam: 'sfGuide', match: 'sfGuide', result: null };
    const to = m[S.step]; if (to) this.go(to, 'back');
  }

  /* ----------------------------------------------------------------- model readiness */
  onModel(id, st) {
    this.models = this.models || {}; this.models[id] = st;
    const bar = this.root && this.root.querySelector('.po-models'); if (bar) this.paintModels(bar);
  }
  paintModels(bar) {
    const want = ['landmarkerVideo', 'detector', 'embedder', 'ocr'], m = this.models || {};
    const ready = want.every(k => m[k] === 'ready'), settled = want.every(k => m[k] === 'ready' || m[k] === 'error');
    bar.querySelector('.po-loadbar').classList.toggle('done', settled);
    bar.querySelector('small').textContent = this.t(settled ? 'po.intro.models_ready' : 'po.intro.models');
    bar.dataset.ready = ready ? '1' : '0';
  }

  /* ================================================================= INTRO */
  draw_intro(sc) {
    sc.innerHTML = `<div class="po-scroll">
      <div class="po-hero" aria-hidden="true">${this.heroArt()}</div>
      <div><h1 class="po-title" data-t="po.intro.title"></h1><p class="po-sub" data-t="po.intro.sub" style="margin-top:6px"></p></div>
      <div class="po-list">
        ${[['idcard', 1], ['face', 2], ['shield', 3]].map(([i, n]) => `<div class="po-row"><span class="lead">${icon(i)}</span><div><b data-t="po.intro.s${n}"></b><span class="d" data-t="po.intro.s${n}d"></span></div></div>`).join('')}
      </div>
      <label class="po-check"><input type="checkbox" id="po-consent" ${this.S.consent ? 'checked' : ''}><span data-t="po.intro.consent"></span></label>
    </div>
    <div class="po-foot">
      <div class="po-models" style="display:grid;gap:6px"><div class="po-loadbar"><i></i></div><small style="color:var(--po-muted);font-size:12px;text-align:center"></small></div>
      <button class="po-btn block" data-act="start" ${this.S.consent ? '' : 'disabled'}><span data-t="po.continue"></span>${icon('arrowR', 22, 'class="po-flip"')}</button>
      <p class="po-honest" data-t="po.honest"></p>
    </div>`;
    const cb = sc.querySelector('#po-consent'), btn = sc.querySelector('[data-act=start]');
    cb.addEventListener('change', () => { this.S.consent = cb.checked; btn.disabled = !cb.checked; if (cb.checked) buzz(8); });
    this.paintModels(sc.querySelector('.po-models'));
  }
  heroArt() {
    return `<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice"><defs><clipPath id="po-c1"><rect x="40" y="52" width="130" height="92" rx="12"/></clipPath></defs>
      <g class="ring" style="transform-origin:262px 100px"><circle cx="262" cy="100" r="74" fill="none" style="stroke:var(--po-accent)" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/></g>
      <ellipse cx="262" cy="100" rx="50" ry="64" style="fill:var(--po-surface);stroke:var(--po-brand)" stroke-width="3"/>
      <circle cx="262" cy="92" r="24" style="fill:var(--po-field3)"/><path d="M216 160c6-26 22-38 46-38s40 12 46 38" style="fill:var(--po-brand)"/>
      <circle cx="252" cy="90" r="3" style="fill:var(--po-ink)"/><circle cx="272" cy="90" r="3" style="fill:var(--po-ink)"/><path d="M252 102c6 6 14 6 20 0" fill="none" style="stroke:var(--po-ink)" stroke-width="2.4" stroke-linecap="round"/>
      <g transform="rotate(-7 105 98)"><rect x="40" y="52" width="130" height="92" rx="12" style="fill:var(--po-surface);stroke:var(--po-brand)" stroke-width="3"/>
        <rect x="52" y="64" width="38" height="48" rx="6" style="fill:var(--po-field1)"/><circle cx="71" cy="82" r="9" style="fill:var(--po-field3)"/><path d="M57 112c3-11 8-15 14-15s11 4 14 15" style="fill:var(--po-brand)"/>
        <rect x="98" y="66" width="60" height="6" rx="3" style="fill:var(--po-line)"/><rect x="98" y="80" width="44" height="6" rx="3" style="fill:var(--po-line)"/><rect x="98" y="94" width="52" height="6" rx="3" style="fill:var(--po-line)"/>
        <rect x="46" y="120" width="118" height="4" rx="2" style="fill:var(--po-ink)" opacity=".75"/><rect x="46" y="130" width="118" height="4" rx="2" style="fill:var(--po-ink)" opacity=".75"/></g>
      <g transform="translate(176 100)"><circle r="22" style="fill:var(--po-ok)"/><path d="m-9 0 6 6 12-13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g></svg>`;
  }

  /* ================================================================= PERMISSION */
  toPerm() {
    const S = this.S, c = this.o.camera;
    if (c === 'demo') { S.mode = 'demo'; this.go('ppGuide'); return; }
    if (c === 'off') { S.perm = 'none'; }
    else if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) S.perm = 'none';
    else S.perm = 'ask';
    this.go('perm');
  }
  draw_perm(sc) {
    const S = this.S, p = S.perm;
    const title = p === 'denied' ? 'po.perm.denied' : p === 'none' ? 'po.perm.none' : 'po.perm.title';
    const body = p === 'denied' ? 'po.perm.deniedBody' : p === 'none' ? 'po.perm.noneBody' : 'po.perm.body';
    sc.innerHTML = `<div class="po-scroll center">
      <div class="po-permart"><span class="halo"></span>${icon(p === 'none' || p === 'denied' ? 'x' : 'camera', 78)}</div>
      <div style="text-align:center"><h1 class="po-title" data-t="${title}"></h1><p class="po-sub" data-t="${body}" style="margin-top:8px"></p></div>
      ${p === 'wait' ? `<p class="po-sub" style="text-align:center" data-t="po.perm.wait"></p>` : ''}
    </div>
    <div class="po-foot">
      ${p !== 'none' ? `<button class="po-btn block" data-act="allow" ${p === 'wait' ? 'disabled' : ''}>${icon('camera')}<span data-t="${p === 'denied' ? 'po.retry' : 'po.perm.allow'}"></span></button>` : ''}
      ${this.o.allowDemo ? `<button class="po-btn tonal block" data-act="useDemo">${icon('film')}<span data-t="po.opt.demo"></span></button><p class="po-honest" data-t="po.opt.demo_note" style="margin-top:-4px"></p>` : ''}
      ${this.o.allowUpload ? `<button class="po-btn ghost block" data-act="useUpload">${icon('upload')}<span data-t="po.opt.upload"></span></button>` : ''}
    </div>`;
  }
  async requestCamera() {
    const S = this.S; S.perm = 'wait'; this.go('perm', 'fwd');
    try {
      const src = await this.openReal('environment');
      this.keep = src; S.mode = 'camera'; S.perm = 'granted';
      this.go('ppGuide');
    } catch (e) {
      const n = e && e.name;
      S.perm = (n === 'NotFoundError' || n === 'OverconstrainedError' || n === 'NotReadableError' && false) ? 'none' : (n === 'NotAllowedError' || n === 'SecurityError') ? 'denied' : 'none';
      this.go('perm');
    }
  }
  chooseMode(m) { const S = this.S; S.mode = m; this.go('ppGuide'); }

  /* ----------------------------------------------------------------- camera sources */
  async openReal(facing) {
    const md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { const e = new Error('no mediaDevices'); e.name = 'NotFoundError'; throw e; }
    let stream;
    try { stream = await md.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false }); }
    catch (e) { if (e && e.name === 'OverconstrainedError') stream = await md.getUserMedia({ video: true, audio: false }); else throw e; }
    const video = document.createElement('video'); video.playsInline = true; video.muted = true; video.autoplay = true; video.setAttribute('playsinline', ''); video.srcObject = stream;
    await new Promise(r => { let done = false; const f = () => { if (!done) { done = true; r(); } }; video.onloadedmetadata = f; setTimeout(f, 3000); });
    try { await video.play(); } catch (e) { /* autoplay policies: muted+inline normally fine */ }
    return { kind: 'camera', stream, video, el: video, facing, get w() { return video.videoWidth; }, get h() { return video.videoHeight; }, stop() { stream.getTracks().forEach(t => t.stop()); video.srcObject = null; } };
  }
  /** Source for a capture step: demo camera, or the real stream (reopened if facing differs). */
  async getSource(kind) {
    const S = this.S, facing = kind === 'passport' ? 'environment' : 'user';
    this.stopSource();
    if (S.mode === 'demo') {
      const person = this.o.person;
      const d = new DemoCamera({ mode: kind === 'passport' ? 'passport' : 'selfie', person, size: kind === 'passport' ? [1080, 1440] : [720, 960], rng: this.o.rng });
      await d.init(this.o.vendorBase); d.el = d.canvas; d.start(); this.src = d; return d;
    }
    if (this.keep && this.keep.facing === facing && this.keep.stream.active) { this.src = this.keep; this.keep = null; return this.src; }
    if (this.keep) { this.keep.stop(); this.keep = null; }
    this.src = await this.openReal(facing); return this.src;
  }
  stopSource() { if (this.src) { try { this.src.stop(); } catch (e) { /* ignore */ } this.src = null; } }

  /* ----------------------------------------------------------------- file upload */
  pickFile(kind) {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; if (kind === 'selfie') inp.setAttribute('capture', 'user');
    inp.style.display = 'none'; this.root.appendChild(inp);
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0]; inp.remove(); if (!f) return;
      try { const c = await this.fileToCanvas(f); this.onUpload(kind, c); } catch (e) { this.emit('error', { step: 'upload', error: String(e) }); }
    });
    inp.click(); this.lastInput = inp;
  }
  async fileToCanvas(file, max = 1800) {
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
    catch (e) { bmp = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); }); }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight, k = Math.min(1, max / Math.max(w, h));
    const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext('2d', { willReadFrequently: true }).drawImage(bmp, 0, 0, c.width, c.height);
    return c;
  }
  /** Public: feed an image directly (used by tests and by apps that already hold a photo). */
  onUpload(kind, canvas) {
    const S = this.S;
    if (kind === 'passport') { S.passport = { ...this.fresh().passport, canvas, uploaded: true }; S.read = this.fresh().read; this.emit('capture', { type: 'passport', uploaded: true }); this.go('read'); }
    else { S.selfie = { ...this.fresh().selfie, canvas, uploaded: true }; S.liveness = { grade: 'demo', certified: false, performed: false, passed: false, uploaded: true, challenges: [] }; this.emit('capture', { type: 'selfie', uploaded: true }); this.go('match'); }
  }

  /* ================================================================= PASSPORT GUIDE */
  draw_ppGuide(sc) {
    const up = this.S.mode === 'upload';
    sc.innerHTML = `<div class="po-scroll">
      <div class="po-hero" aria-hidden="true">${this.passportArt()}</div>
      <div><h1 class="po-title" data-t="po.pp.title"></h1></div>
      <div class="po-list">
        ${[['idcard', 1], ['sun', 2], ['scan', 3]].map(([i, n]) => `<div class="po-row"><span class="lead">${icon(i)}</span><div><b data-t="po.pp.t${n}"></b></div></div>`).join('')}
      </div>
      ${this.S.mode === 'demo' ? `<div class="po-note">${icon('film')}<span data-t="po.opt.demo_note"></span></div>` : ''}
    </div>
    <div class="po-foot">
      <button class="po-btn block" data-act="openPp">${icon(up ? 'upload' : 'camera')}<span data-t="${up ? 'po.pp.upload' : 'po.pp.open'}"></span></button>
      ${!up && this.o.allowUpload ? `<button class="po-btn ghost block" data-act="pickPp">${icon('upload')}<span data-t="po.pp.upload"></span></button>` : ''}
    </div>`;
  }
  passportArt() {
    return `<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice"><rect x="60" y="30" width="240" height="148" rx="14" style="fill:var(--po-surface);stroke:var(--po-brand)" stroke-width="3"/>
      <rect x="76" y="46" width="62" height="78" rx="8" style="fill:var(--po-field1)"/><circle cx="107" cy="76" r="14" style="fill:var(--po-field3)"/><path d="M84 124c4-18 13-24 23-24s19 6 23 24" style="fill:var(--po-brand)"/>
      <rect x="152" y="50" width="120" height="8" rx="4" style="fill:var(--po-line)"/><rect x="152" y="68" width="90" height="8" rx="4" style="fill:var(--po-line)"/><rect x="152" y="86" width="104" height="8" rx="4" style="fill:var(--po-line)"/>
      <rect x="70" y="134" width="220" height="34" rx="6" style="fill:none;stroke:var(--po-accent)" stroke-width="3" stroke-dasharray="7 6"/>
      <text x="76" y="148" style="fill:var(--po-ink);font:700 9px monospace" opacity=".8">P&lt;UTOHADDAD&lt;&lt;NOUR&lt;EL&lt;HUDA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="76" y="162" style="fill:var(--po-ink);font:700 9px monospace" opacity=".8">P4821907&lt;2UTO9403213F3209309&lt;&lt;&lt;&lt;&lt;00</text>
      <g style="stroke:var(--po-brand)" stroke-width="5" fill="none" stroke-linecap="round"><path d="M44 62V40a14 14 0 0 1 14-14h22"/><path d="M316 62V40a14 14 0 0 0-14-14h-22"/><path d="M44 146v22a14 14 0 0 0 14 14h22"/><path d="M316 146v22a14 14 0 0 1-14 14h-22"/></g></svg>`;
  }

  /* ================================================================= CAMERA LAYOUT HELPERS */
  /** Measure the camera container and write guide geometry. kind: 'doc' | 'oval'. */
  layoutCam(kind) {
    const cam = this.sc.querySelector('.po-cam'); if (!cam) return null;
    const W = cam.clientWidth, H = cam.clientHeight; if (!W || !H) return null;
    const L = { W, H };
    if (kind === 'doc') {
      let gw = Math.min(W * 0.92, H * 0.62 * 1.42), gh = gw / 1.42; const gx = (W - gw) / 2, gy = H * 0.40 - gh / 2 + 10;
      L.guide = { x: gx, y: gy, w: gw, h: gh };
      const g = cam.querySelector('.po-docg'); Object.assign(g.style, { left: gx + 'px', top: gy + 'px', width: gw + 'px', height: gh + 'px', borderRadius: '14px' });
      const chipsD = cam.querySelector('.po-chips'); if (chipsD) chipsD.style.top = Math.min(H - 170, gy + gh + 14) + 'px';
      const rr = 14, svg = cam.querySelector('svg.mask');
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.querySelector('.scrim').setAttribute('d', `M0 0H${W}V${H}H0Z M${gx + rr} ${gy}H${gx + gw - rr}A${rr} ${rr} 0 0 1 ${gx + gw} ${gy + rr}V${gy + gh - rr}A${rr} ${rr} 0 0 1 ${gx + gw - rr} ${gy + gh}H${gx + rr}A${rr} ${rr} 0 0 1 ${gx} ${gy + gh - rr}V${gy + rr}A${rr} ${rr} 0 0 1 ${gx + rr} ${gy}Z`);
    } else {
      const rx = Math.min(W * 0.36, H * 0.27), ry = rx * 1.3, cx = W / 2, cy = H * 0.43;
      L.oval = { cx, cy, rx, ry };
      const svg = cam.querySelector('svg.mask'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.querySelector('.scrim').setAttribute('d', `M0 0H${W}V${H}H0Z M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`);
      const d = `M${cx} ${cy - ry}A${rx} ${ry} 0 1 1 ${cx} ${cy + ry}A${rx} ${ry} 0 1 1 ${cx} ${cy - ry}`;
      svg.querySelectorAll('.po-ring path').forEach(p => p.setAttribute('d', d));
      const ring = svg.querySelector('.po-ring'); ring.style.transformOrigin = `${cx}px ${cy}px`;
      // chips sit under the oval
      const chips = cam.querySelector('.po-chips'); if (chips) chips.style.top = Math.min(H - 150, cy + ry + 14) + 'px';
      const ar = cam.querySelectorAll('.po-arrows'); ar.forEach(a => { a.style.top = (cy - 17) + 'px'; });
    }
    this.layout = L; return L;
  }
  watchSize(kind, after) {
    const cam = this.sc.querySelector('.po-cam'); let ro = null;
    const f = () => { this.layoutCam(kind); after && after(); };
    if (window.ResizeObserver) { ro = new ResizeObserver(f); ro.observe(cam); }
    f(); this.td.push(() => ro && ro.disconnect());
  }
  /** Mount the video/canvas element into the camera container. */
  mountFeed(src, mirror) {
    const cam = this.sc.querySelector('.po-cam'), el = src.el;
    el.classList.add('feed'); if (mirror) el.classList.add('mirror');
    if (src.kind === 'camera') { el.style.cssText = ''; }
    cam.insertBefore(el, cam.firstChild);
    this.td.push(() => { try { el.remove(); } catch (e) { /* ignore */ } });
  }
  camBadge(src) {
    return src.kind === 'demo' ? `<span class="po-pill sim"><i></i><span data-t="po.demo_badge"></span></span>` : `<span class="po-pill"><i></i><span data-t="po.live_badge"></span></span>`;
  }

  /* ================================================================= PASSPORT CAMERA */
  draw_ppCam(sc) {
    sc.innerHTML = `<div class="po-cam" data-kind="doc">
      <svg class="mask" aria-hidden="true"><path class="scrim" fill-rule="evenodd"/></svg>
      <div class="po-docg" data-q="bad"><span class="corner c1"></span><span class="corner c2"></span><span class="corner c3"></span><span class="corner c4"></span><span class="photo"></span><span class="zone"><span data-t="po.chk.mrz"></span></span><span class="laser"></span></div>
      <div class="po-camtop"><button class="po-iconbtn" data-act="back" data-ta="po.back" aria-label="back">${icon('arrowL', 24, 'class="po-flip"')}</button><span class="t" data-t="po.pp.title"></span><span class="po-badge-slot"></span></div>
      <div class="po-chips" style="bottom:auto"></div>
      <div class="po-prompt" style="gap:12px"><div class="po-hint" data-k="warn"></div>
        <div style="display:flex;align-items:center;gap:22px"><button class="po-iconbtn" data-act="pickPp" style="color:#fff;background:rgba(255,255,255,.16)" aria-label="upload">${icon('upload')}</button>
          <button class="po-shutter" data-act="shutter" aria-label="capture"><svg viewBox="0 0 72 72"><circle class="bg" cx="36" cy="36" r="32"/><circle class="fg" cx="36" cy="36" r="32" stroke-dasharray="201.06" stroke-dashoffset="201.06"/></svg><span class="core"></span></button>
          <span style="width:48px"></span></div></div>
      <div class="po-flash"></div></div>`;
  }
  async run_ppCam(sc) {
    const S = this.S, cam = sc.querySelector('.po-cam');
    let src;
    try { src = await this.getSource('passport'); } catch (e) { S.perm = (e && e.name === 'NotAllowedError') ? 'denied' : 'none'; this.go('perm'); return; }
    if (!this.alive || S.step !== 'ppCam') { return; }
    this.mountFeed(src, false);
    cam.querySelector('.po-badge-slot').innerHTML = this.camBadge(src); this.retext();
    const ac = document.createElement('canvas'); ac.width = 200; ac.height = 141; const actx = ac.getContext('2d', { willReadFrequently: true });
    const hint = cam.querySelector('.po-hint'), dg = cam.querySelector('.po-docg'), fg = cam.querySelector('.po-shutter .fg');
    const chipsEl = cam.querySelector('.po-chips');
    const chips = ['page', 'sharp', 'light', 'mrz'];
    chipsEl.innerHTML = chips.map(c => `<span class="po-chip" data-c="${c}" data-s="no"><span class="po-st">${icon('check')}</span><span data-t="po.chk.${c}"></span></span>`).join(''); this.retext();
    let alive = true, holdAt = 0, prev = null, last = 0, shot = false;
    this.td.push(() => { alive = false; });
    const setHint = (k, kind) => { const txt = this.t('po.pp.h.' + k); if (hint.textContent !== txt) hint.textContent = txt; hint.dataset.k = kind; hint.dataset.t = 'po.pp.h.' + k; };
    this.watchSize('doc', () => { if (src.kind === 'demo' && this.layout && this.layout.guide) { const g = this.layout.guide, m = coverMap(this.layout.W, this.layout.H, src.w, src.h), r = toVideo(g, m); src.setGuide({ w: r.w / src.w, cy: (r.y + r.h / 2) / src.h }); } });
    this.captureNow = (manual) => {
      if (shot) return; shot = true; alive = false;
      const L = this.layout, m = coverMap(L.W, L.H, src.w, src.h), r = toVideo(L.guide, m);
      const sx = clamp(r.x, 0, src.w - 2), sy = clamp(r.y, 0, src.h - 2), sw = Math.min(r.w, src.w - sx), sh = Math.min(r.h, src.h - sy);
      const k = Math.min(1, 1800 / sw), c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k);
      c.getContext('2d', { willReadFrequently: true }).drawImage(src.el, sx, sy, sw, sh, 0, 0, c.width, c.height);
      S.passport.canvas = c; S.passport.uploaded = false; S.passport.manual = !!manual;
      const fl = cam.querySelector('.po-flash'); fl.classList.add('go'); buzz(30); setHint('got', 'ok');
      this.emit('capture', { type: 'passport', manual: !!manual });
      setTimeout(() => { if (this.alive && S.step === 'ppCam') this.go('read'); }, 420);
    };
    const tick = (now) => {
      if (!alive || !this.alive) return;
      setTimeout(() => requestAnimationFrame(tick), 70);
      if (now - last < 60 || !this.layout || !this.layout.guide) return; last = now;
      const L = this.layout, m = coverMap(L.W, L.H, src.w || 1, src.h || 1), r = toVideo(L.guide, m);
      if (!src.w) return;
      actx.drawImage(src.el, clamp(r.x, 0, src.w - 1), clamp(r.y, 0, src.h - 1), Math.min(r.w, src.w), Math.min(r.h, src.h), 0, 0, 200, 141);
      const d = actx.getImageData(0, 0, 200, 141).data;
      const lu = lumaStats(d, 2), sh = sharpness(d, 200, 141), doc = docScore(d, 200, 141);
      let diff = 0; if (prev) { for (let i = 0; i < d.length; i += 64) diff += Math.abs(d[i] - prev[i]); diff /= (d.length / 64); } prev = d.slice(0);
      const st = { page: doc.ok || doc.band > 9, sharp: sh > 42, light: lu.mean > 55 && lu.mean < 228 && lu.std > 18, mrz: doc.band > 7 };
      this.dbg = { sh, band: doc.band, body: doc.body, luma: lu.mean, std: lu.std, diff };
      for (const c of chips) { const n = chipsEl.querySelector(`[data-c=${c}]`); const s = st[c] ? 'ok' : 'no'; if (n.dataset.s !== s) n.dataset.s = s; n.querySelector('.po-st').dataset.s = s; }
      const ok = st.page && st.sharp && st.light && st.mrz && diff < 14;
      dg.dataset.q = (st.page && st.mrz) ? 'ok' : 'bad';
      if (!st.light) setHint(lu.mean >= 228 ? 'glare' : 'light', 'warn');
      else if (!st.page) setHint('fit', 'warn');
      else if (!st.sharp || diff >= 14) setHint('blur', 'warn');
      else setHint('hold', 'ok');
      if (ok && this.o.autoCapture) { if (!holdAt) holdAt = now; const p = clamp((now - holdAt) / 1100, 0, 1); fg.style.strokeDashoffset = String(201.06 * (1 - p)); if (p >= 1) this.captureNow(false); }
      else { holdAt = 0; fg.style.strokeDashoffset = '201.06'; }
    };
    requestAnimationFrame(tick);
  }

  /* ================================================================= READ (MRZ + portrait) */
  draw_read(sc) {
    const S = this.S, R = S.read, rows = R.rows;
    const names = [['zone', 'po.read.r.zone'], ['doc', 'po.read.r.doc'], ['dob', 'po.read.r.dob'], ['exp', 'po.read.r.exp'], ['all', 'po.read.r.all'], ['photo', 'po.read.r.photo']];
    const p = S.passport.mrz;
    sc.innerHTML = `<div class="po-scroll" id="po-readscroll">
      <div><h1 class="po-title" data-t="po.read.title"></h1><p class="po-sub" data-t="po.read.sub" style="margin-top:4px"></p></div>
      <div class="po-docimg ${R.running ? 'scanning' : ''}"><span class="scan"></span><span class="laser"></span><span class="facebox"></span></div>
      <div class="po-rows">${names.map(([id, k]) => `<div class="r" data-row="${id}" data-s="${rows[id]}"><span class="po-st" data-s="${rows[id]}">${icon(rows[id] === 'bad' ? 'x' : 'check')}</span><span data-t="${k}"></span><span class="x"></span></div>`).join('')}</div>
      <div class="po-fields"></div>
      <div class="po-msg"></div>
      <div class="po-manual" style="display:none;gap:8px;flex-direction:column"></div>
    </div>
    <div class="po-foot"><button class="po-btn block" data-act="readNext" disabled><span data-t="po.continue"></span>${icon('arrowR', 22, 'class="po-flip"')}</button>
      <div style="display:flex;gap:8px"><button class="po-btn ghost" style="flex:1" data-act="retakePp">${icon('refresh')}<span data-t="po.read.retake"></span></button><button class="po-btn ghost" style="flex:1" data-act="manual" data-hide-demo><span data-t="po.read.manual"></span></button></div></div>`;
    const wrap = sc.querySelector('.po-docimg');
    if (S.passport.canvas) { const c = S.passport.canvas; c.removeAttribute('style'); wrap.insertBefore(c, wrap.firstChild); }
    this.repaint = () => this.paintRead();
    this.paintRead();
  }
  paintRead() {
    const S = this.S, R = S.read, sc = this.sc; if (!sc || S.step !== 'read') return;
    const p = S.passport.mrz, lang = this.lang;
    // row states
    sc.querySelectorAll('.po-rows .r').forEach(r => { const id = r.dataset.row, s = R.rows[id]; r.dataset.s = s; const st = r.querySelector('.po-st'); st.dataset.s = s; st.innerHTML = icon(s === 'bad' ? 'x' : 'check'); });
    const fields = sc.querySelector('.po-fields');
    if (p) {
      const nm = (p.givenNames + ' ' + p.surname).trim();
      const fmt = d => d ? d.split('-').reverse().join('/') : '';
      fields.innerHTML = `<div class="po-card field"><div class="po-fieldscard">${S.passport.portrait ? '<div class="po-portrait"></div>' : ''}<div class="po-kv" style="flex:1">
        <div class="wide"><small data-t="po.read.f.name"></small><b>${esc(nm)}</b></div>
        <div><small data-t="po.read.f.doc"></small><b class="po-num">${esc(p.docNumber)}</b></div>
        <div><small data-t="po.read.f.nat"></small><b>${esc(countryName(p.nationality, lang))}</b></div>
        <div><small data-t="po.read.f.dob"></small><b class="po-num">${esc(fmt(p.dob))}</b></div>
        <div><small data-t="po.read.f.exp"></small><b class="po-num">${esc(fmt(p.expiry))}</b></div></div></div></div>`;
      const slot = fields.querySelector('.po-portrait'); if (slot && S.passport.portrait) { S.passport.portrait.removeAttribute('style'); slot.appendChild(S.passport.portrait); }
      this.retext();
    } else fields.innerHTML = '';
    const msg = sc.querySelector('.po-msg'); let m = '';
    if (R.error) m = `<div class="po-note" style="background:var(--po-err-c);color:var(--po-err)">${icon('info')}<span><b data-t="po.read.failed"></b><br><span data-t="po.read.failed_d"></span></span></div>`;
    else if (S.passport.expired) m = `<div class="po-note" style="background:var(--po-err-c);color:var(--po-err)">${icon('info')}<span data-t="po.read.expired"></span></div>`;
    else if (R.done && p && !p.valid) m = `<div class="po-note" style="background:var(--po-warn-c);color:var(--po-warn)">${icon('info')}<span data-t="po.read.partial"></span></div>`;
    else if (R.done && R.rows.photo === 'bad') m = `<div class="po-note" style="background:var(--po-warn-c);color:var(--po-warn)">${icon('info')}<span data-t="po.read.nophoto"></span></div>`;
    else if (R.done && R.chars) m = `<div class="po-note">${icon('scan')}<span>${esc(this.t('po.read.using', { n: R.chars, ms: R.ms }))}</span></div>`;
    msg.innerHTML = m;
    const next = sc.querySelector('[data-act=readNext]');
    next.disabled = !(R.done && p && p.valid && !S.passport.expired && R.rows.photo !== 'bad');
    sc.querySelector('.po-docimg').classList.toggle('scanning', !!R.running);
    this.retext();
  }
  async run_read(sc) {
    const S = this.S, R = S.read;
    if (R.done) return;
    if (!S.passport.canvas) { this.go('ppGuide', 'back'); return; }
    R.running = true; this.paintRead();
    const setRow = (id, s, x) => { R.rows[id] = s; const r = sc.querySelector(`[data-row=${id}]`); if (!r) return; r.dataset.s = s; const st = r.querySelector('.po-st'); st.dataset.s = s; st.innerHTML = icon(s === 'bad' ? 'x' : 'check'); if (x !== undefined) r.querySelector('.x').textContent = x; };
    setRow('zone', 'run');
    const t0 = performance.now();
    let parsed = null, ocr = null;
    try { ocr = await this.engine.readMrz(S.passport.canvas); parsed = ocr.parsed; R.ms = ocr.ms; R.chars = parsed ? parsed.lines.join('').length : 0; }
    catch (e) { console.warn('[polaris] OCR unavailable', e); }
    if (!this.alive || S.step !== 'read') return;
    if (!parsed && S.mode === 'demo') { // the Demo camera knows its own specimen; use it only if real OCR failed and say so
      const pp = renderPassport(this.o.person); parsed = parseTD3(pp.lines[0], pp.lines[1]); parsed.fromSpecimen = true;
    }
    R.running = false;
    if (!parsed) { setRow('zone', 'bad'); R.error = true; R.done = true; this.paintRead(); this.showManual(); return; }
    await this.applyParsed(parsed, { setRow, animate: true });
  }
  async applyParsed(parsed, { setRow, animate }) {
    const S = this.S, R = S.read, sc = this.sc; if (!setRow) setRow = (id, s, x) => { R.rows[id] = s; };
    S.passport.mrz = parsed; R.error = null;
    const ck = parsed.checks, d = animate ? 260 : 0;
    setRow('zone', 'ok', parsed.format); await sleep(d);
    setRow('doc', ck.docNumber ? 'ok' : 'bad'); this.paintRead(); await sleep(d);
    setRow('dob', ck.dob ? 'ok' : 'bad'); await sleep(d);
    setRow('exp', ck.expiry ? 'ok' : 'bad'); await sleep(d);
    setRow('all', ck.composite && (ck.optional !== false) ? 'ok' : 'bad'); this.paintRead(); await sleep(d);
    const exp = parsed.expiry ? new Date(parsed.expiry + 'T23:59:59Z') : null; S.passport.expired = !!(exp && exp.getTime() < Date.now());
    // portrait
    setRow('photo', 'run'); this.paintRead();
    try {
      const face = await this.engine.findPassportFace(S.passport.canvas);
      if (face) {
        S.passport.faceBox = face.box;
        const pc = this.engine.portrait(S.passport.canvas, face.box, 0.6, 360); S.passport.portrait = pc;
        let lm = null; try { const sg = await this.engine.analyzeImage(pc); if (sg.face) { lm = sg.lm; S.passport.sig = sg; } } catch (e) { /* landmarks optional */ }
        S.passport.lm = lm; S.passport.photoOk = true;
        setRow('photo', 'ok', Math.round(face.score * 100) + '%');
        const fb = sc && sc.querySelector('.facebox'), img = sc && sc.querySelector('.po-docimg canvas');
        if (fb && img) { const W = S.passport.canvas.width, H = S.passport.canvas.height; Object.assign(fb.style, { left: face.box.x / W * 100 + '%', top: face.box.y / H * 100 + '%', width: face.box.w / W * 100 + '%', height: face.box.h / H * 100 + '%' }); fb.classList.add('on'); }
      } else { S.passport.photoOk = false; setRow('photo', 'bad'); }
    } catch (e) { console.warn('[polaris] portrait', e); S.passport.photoOk = false; setRow('photo', 'bad'); }
    R.done = true; R.running = false; buzz(parsed.valid ? 24 : 0);
    this.paintRead();
  }
  showManual() {
    const S = this.S, box = this.sc.querySelector('.po-manual'); if (!box) return;
    const p = S.passport.mrz, l = p ? p.lines : ['', ''];
    box.style.display = 'flex';
    box.innerHTML = `<label data-t="po.read.manual_l1"></label><textarea id="po-l1" rows="2" spellcheck="false" maxlength="48">${esc(l[0])}</textarea><label data-t="po.read.manual_l2"></label><textarea id="po-l2" rows="2" spellcheck="false" maxlength="48">${esc(l[1])}</textarea>
      <div style="display:flex;gap:8px"><button class="po-btn tonal" style="flex:1" data-act="applyManual"><span data-t="po.continue"></span></button>${S.mode === 'demo' ? `<button class="po-btn ghost" style="flex:1" data-act="sample"><span data-t="po.read.sample"></span></button>` : ''}</div>`;
    this.retext(); box.scrollIntoView({ block: 'nearest' });
  }
  fillSample() { const pp = renderPassport(this.o.person); this.sc.querySelector('#po-l1').value = pp.lines[0]; this.sc.querySelector('#po-l2').value = pp.lines[1]; }
  async applyManual() {
    const a = this.sc.querySelector('#po-l1').value, b = this.sc.querySelector('#po-l2').value;
    const p = findMrz(a + '\n' + b) || parseTD3(a.toUpperCase().replace(/[^A-Z0-9<]/g, '<'), b.toUpperCase().replace(/[^A-Z0-9<]/g, '<'));
    const R = this.S.read; R.rows = this.fresh().read.rows; R.done = false; R.chars = 0; R.error = null;
    const setRow = (id, s, x) => { R.rows[id] = s; const r = this.sc.querySelector(`[data-row=${id}]`); if (r) { r.dataset.s = s; const st = r.querySelector('.po-st'); st.dataset.s = s; st.innerHTML = icon(s === 'bad' ? 'x' : 'check'); if (x !== undefined) r.querySelector('.x').textContent = x; } };
    this.sc.querySelector('.po-manual').style.display = 'none';
    await this.applyParsed(p, { setRow, animate: true });
  }

  /* ================================================================= SELFIE GUIDE + CAMERA */
  draw_sfGuide(sc) {
    const up = this.S.mode === 'upload';
    sc.innerHTML = `<div class="po-scroll">
      <div class="po-hero" aria-hidden="true">${this.selfieArt()}</div>
      <div><h1 class="po-title" data-t="po.sf.title"></h1></div>
      <div class="po-list">${[['face', 1], ['turn', 2], ['sun', 3]].map(([i, n]) => `<div class="po-row"><span class="lead">${icon(i)}</span><div><b data-t="po.sf.t${n}"></b></div></div>`).join('')}</div>
      ${up ? `<div class="po-note">${icon('info')}<span data-t="po.sf.upload_note"></span></div>` : ''}
    </div>
    <div class="po-foot"><button class="po-btn block" data-act="openSf">${icon(up ? 'upload' : 'camera')}<span data-t="${up ? 'po.sf.upload' : 'po.sf.start'}"></span></button>
      ${!up && this.o.allowUpload ? `<button class="po-btn ghost block" data-act="pickSf">${icon('upload')}<span data-t="po.sf.upload"></span></button>` : ''}</div>`;
  }
  selfieArt() {
    return `<svg viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice"><ellipse cx="180" cy="100" rx="58" ry="76" fill="none" style="stroke:var(--po-brand)" stroke-width="4" stroke-dasharray="6 7" stroke-linecap="round"/>
      <circle cx="180" cy="90" r="30" style="fill:var(--po-field3)"/><path d="M122 176c8-32 26-46 58-46s50 14 58 46z" style="fill:var(--po-brand)"/>
      <ellipse cx="168" cy="86" rx="4" ry="4.5" style="fill:var(--po-ink)"/><ellipse cx="192" cy="86" rx="4" ry="4.5" style="fill:var(--po-ink)"/><path d="M168 102c8 7 16 7 24 0" fill="none" style="stroke:var(--po-ink)" stroke-width="3" stroke-linecap="round"/>
      <g style="stroke:var(--po-accent)" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M96 98l-14 0M84 90l-8 8 8 8"/><path d="M264 98h14M276 90l8 8-8 8"/></g>
      <circle cx="258" cy="48" r="13" style="fill:var(--po-ok)"/><path d="m252 48 4.5 4.5L265 43" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  draw_sfCam(sc) {
    sc.innerHTML = `<div class="po-cam" data-kind="oval">
      <svg class="mask" aria-hidden="true">
        <path class="scrim" fill-rule="evenodd"/>
        <g class="po-ring" data-q="bad"><path class="bg" pathLength="100"/><path class="al" pathLength="100" stroke-dasharray="100 0"/>${Array.from({ length: this.o.challenges }, (_, i) => `<path class="seg" data-i="${i}" pathLength="100"/>`).join('')}</g></svg>
      <div class="po-arrows left">${icon('chevL', 34)}${icon('chevL', 34)}${icon('chevL', 34)}</div><div class="po-arrows right">${icon('chevL', 34)}${icon('chevL', 34)}${icon('chevL', 34)}</div>
      <div class="po-camtop"><button class="po-iconbtn" data-act="back" aria-label="back">${icon('arrowL', 24, 'class="po-flip"')}</button><span class="t" data-t="po.step.selfie"></span><span class="po-badge-slot"></span></div>
      <div class="po-chips"></div>
      <div class="po-prompt"><div class="po-dots"></div><div class="po-slot"></div><div class="po-hint" data-k="warn"></div></div>
      <div class="po-flash"></div></div>`;
  }
  async run_sfCam(sc) {
    const S = this.S, cam = sc.querySelector('.po-cam');
    let src;
    try { src = await this.getSource('selfie'); } catch (e) { S.perm = (e && e.name === 'NotAllowedError') ? 'denied' : 'none'; this.go('perm'); return; }
    if (!this.alive || S.step !== 'sfCam') return;
    this.mountFeed(src, true);
    cam.querySelector('.po-badge-slot').innerHTML = this.camBadge(src);
    const n = this.o.challengeList && this.o.challengeList.length ? this.o.challengeList.length : this.o.challenges;
    const segs = [...cam.querySelectorAll('.po-ring .seg')], ring = cam.querySelector('.po-ring');
    const segLen = 96 / n - 3;
    segs.forEach((p, i) => { p.style.strokeDasharray = `0 100`; p.style.strokeDashoffset = String(-(2 + i * (96 / n))); });
    const chipsEl = cam.querySelector('.po-chips'), hint = cam.querySelector('.po-hint'), slot = cam.querySelector('.po-slot'), dots = cam.querySelector('.po-dots');
    const CH = ['face', 'centre', 'distance', 'light'];
    chipsEl.innerHTML = CH.map(c => `<span class="po-chip" data-c="${c}" data-s="no"><span class="po-st">${icon('check')}</span><span data-t="po.chk.${c}"></span></span>`).join('');
    dots.innerHTML = Array.from({ length: n }, () => '<i></i>').join('');
    this.retext();
    const vbox = { guide: null };
    const sess = new LivenessSession({ challenges: n, list: this.o.challengeList, rng: this.o.rng, timeoutMs: this.o.livenessTimeoutMs || (S.mode === 'demo' ? 12000 : 10000) });
    this.sess = sess;
    const arrowL = cam.querySelector('.po-arrows.left'), arrowR = cam.querySelector('.po-arrows.right');
    let alive = true, busy = false, best = null, bestCanvas = document.createElement('canvas'), lastPhase = '', lastKey = '';
    this.td.push(() => { alive = false; });
    const updateGuide = () => {
      const L = this.layout; if (!L || !L.oval || !src.w) return;
      const m = coverMap(L.W, L.H, src.w, src.h), o = L.oval;
      const cxv = (o.cx - m.ox) / m.s / src.w, cyv = (o.cy - m.oy) / m.s / src.h, hv = (2 * o.ry) / m.s / src.h;
      sess.guide = { cx: 1 - cxv, cy: cyv, h: hv }; // the preview is mirrored, the analysed frame is not
    };
    this.watchSize('oval', updateGuide);
    const setHint = (txt, kind) => { if (hint.textContent !== txt) hint.textContent = txt; hint.dataset.k = kind; };
    const paintSegs = (view) => {
      segs.forEach((p, i) => { const on = i < view.index || view.phase === 'done' || (view.phase === 'win' && i === view.index) || (view.phase === 'capture'); p.style.strokeDasharray = on ? `${segLen} 100` : `0 100`; });
      dots.querySelectorAll('i').forEach((d, i) => { d.className = (i < view.index || view.phase === 'capture' || view.phase === 'done' || (view.phase === 'win' && i === view.index)) ? 'on' : (i === view.index && (view.phase === 'prompt') ? 'cur' : ''); });
    };
    const promptCard = (view, win) => {
      const c = view.list[Math.min(view.index, view.list.length - 1)];
      const ic = c === 'blink' ? blinkIcon(30) : c === 'smile' ? icon('smile', 30) : icon('turn', 30, c === 'turnRight' ? 'style="transform:scaleX(-1)"' : '');
      const key = (win ? 'w' : 'p') + c + view.index;
      if (lastKey === key) return; lastKey = key;
      slot.innerHTML = `<div class="big ${win ? 'win' : ''}"><span class="ic">${win ? icon('check', 30) : ic}</span><span><small>${esc(this.t('po.p.n', { a: view.index + 1, b: view.total }))}</small>${esc(this.t(win ? 'po.p.pass' : 'po.p.' + c))}</span></div>`;
      const big = slot.firstChild; if (!win) { big.classList.add('haptic'); buzz(18); }
    };
    const onEvents = (ev, view) => {
      for (const e of ev) {
        if (e.type === 'prompt') { if (src.kind === 'demo') src.cue(e.challenge); ring.dataset.pulse = 'on'; setTimeout(() => { ring.dataset.pulse = ''; }, 600); }
        if (e.type === 'pass') { buzz([20, 40, 20]); this.sparkle(cam, 0.45); ring.dataset.pulse = 'on'; setTimeout(() => { ring.dataset.pulse = ''; }, 600); this.emit('capture', { type: 'challenge', challenge: e.challenge, ms: e.ms }); }
        if (e.type === 'retry') { setHint(this.t('po.p.retry'), 'warn'); }
      }
    };
    const loop = async () => {
      if (!alive || !this.alive) return;
      if (busy) { requestAnimationFrame(loop); return; }
      busy = true;
      const ts = performance.now(); let sig;
      try { sig = src.kind === 'demo' ? src.signal(ts) : (src.w ? await this.engine.detectVideo(src.el, ts) : { face: false, faces: 0, t: ts }); }
      catch (e) { console.error('[polaris] detect', e); alive = false; this.emit('error', { step: 'sfCam', error: String(e && e.message || e) }); S.liveness = { grade: 'demo', certified: false, passed: false, error: 'model' }; this.finishSelfie(null, 'model'); return; }
      if (!alive) return;
      const view = sess.update(sig, ts);
      onEvents(view.events, view);
      // best frame (real camera): keep the sharpest frontal frame seen during the capture phase
      if (view.phase === 'capture' && sess.best && sess.best.sig === sig) { bestCanvas.width = src.w; bestCanvas.height = src.h; bestCanvas.getContext('2d').drawImage(src.el, 0, 0); best = { sig, canvas: bestCanvas }; }
      // paint
      const q = view.quality; const qmap = {}; if (q) for (const c of q.checks) qmap[c.id] = c;
      for (const id of CH) { const n = chipsEl.querySelector(`[data-c=${id}]`), ok = !!(qmap[id] && qmap[id].ok); const s = ok ? 'ok' : 'no'; if (n.dataset.s !== s) { n.dataset.s = s; n.querySelector('.po-st').dataset.s = s; } }
      ring.dataset.q = (q && q.ok) ? 'ok' : (view.phase === 'align' ? 'bad' : 'ok');
      chipsEl.classList.toggle('hide', view.phase === 'prompt' || view.phase === 'win' || view.phase === 'capture');
      paintSegs(view);
      arrowL.classList.toggle('on', view.phase === 'prompt' && view.challenge === 'turnLeft'); arrowR.classList.toggle('on', view.phase === 'prompt' && view.challenge === 'turnRight');
      if (view.phase !== lastPhase) { lastPhase = view.phase; if (view.phase !== 'prompt' && view.phase !== 'win') { slot.innerHTML = ''; lastKey = ''; } }
      if (view.phase === 'align') { const bad = q && q.checks.find(c => !c.ok); setHint(bad ? this.t('po.h.' + bad.hint) : this.t('po.h.ok'), bad ? 'warn' : 'ok'); }
      else if (view.phase === 'neutral') setHint(this.t('po.h.neutral'), 'warn');
      else if (view.phase === 'prompt') { promptCard(view, false); hint.style.display = 'none'; }
      else if (view.phase === 'win') { promptCard(view, true); hint.style.display = 'none'; }
      else if (view.phase === 'capture') { hint.style.display = ''; setHint(this.t('po.p.capture'), 'ok'); }
      if (view.phase !== 'prompt' && view.phase !== 'win') hint.style.display = '';
      if (view.done) { alive = false; cam.querySelector('.po-flash').classList.add('go'); buzz(40); this.sparkle(cam, 1); const frame = best && best.canvas.width ? best : (src.kind === 'camera' ? this.grab(src, sig) : null); setTimeout(() => this.finishSelfie(sess, null, frame, src), 380); return; }
      if (view.failed) { alive = false; setTimeout(() => this.finishSelfie(sess, view.reason, null, src), 500); return; }
      busy = false; requestAnimationFrame(loop);
    };
    // make sure models are ready before the first frame (shows hint meanwhile)
    if (src.kind !== 'demo') { setHint(this.t('po.intro.models'), 'warn'); try { await this.engine.loadLandmarkerVideo(); } catch (e) { this.emit('error', { step: 'sfCam', error: 'landmarker' }); this.finishSelfie(null, 'model'); return; } }
    requestAnimationFrame(loop);
  }
  grab(src, sig) { const c = document.createElement('canvas'); c.width = src.w; c.height = src.h; c.getContext('2d').drawImage(src.el, 0, 0); return { canvas: c, sig }; }
  finishSelfie(sess, failReason, frame, src) {
    const S = this.S; if (!this.alive || (S.step !== 'sfCam')) return;
    S.liveness = sess ? { ...sess.summary(), performed: true } : { grade: 'demo', certified: false, passed: false, performed: true, challenges: [] };
    if (failReason) S.liveness.passed = false, S.liveness.reason = failReason;
    if (frame) { const c = document.createElement('canvas'); c.width = frame.canvas.width; c.height = frame.canvas.height; c.getContext('2d', { willReadFrequently: true }).drawImage(frame.canvas, 0, 0); S.selfie = { ...S.selfie, canvas: c, lm: frame.sig.lm, sig: frame.sig }; }
    else if (src && src.kind === 'demo' && !failReason) { S.selfie = { ...S.selfie, canvas: src.snapshot(), lm: null, sig: null }; }
    this.stopSource();
    if (failReason) { this.decide({ forced: 'retake', reason: 'live' }); this.go('result'); return; }
    this.go('match');
  }
  /** Small celebratory burst anchored on the oval. */
  sparkle(cam, power) { if (this.reduce) return; this.burst(power * 36, 'small', cam); }

  /* ================================================================= MATCH */
  draw_match(sc) {
    sc.innerHTML = `<div class="po-scroll" style="align-items:center;text-align:center">
      <div><h1 class="po-title" data-t="po.m.title"></h1></div>
      <div class="po-faces scanning"><figure class="po-face a" style="margin:0"></figure><span class="scanline"></span><figure class="po-face b" style="margin:0"></figure></div>
      <div class="po-facelabels"><span data-t="po.m.passport"></span><span data-t="po.m.selfie"></span></div>
      <div class="po-score" data-k="ok"><svg viewBox="0 0 176 176"><circle class="bg" cx="88" cy="88" r="76"/><circle class="fg" cx="88" cy="88" r="76" stroke-dasharray="477.5" stroke-dashoffset="477.5"/></svg><div class="mid"><b class="po-num">0</b><small data-t="po.m.score"></small></div></div>
      <div class="po-match-meta" style="display:grid;gap:8px;width:100%;justify-items:center"></div>
    </div><div class="po-foot"><p class="po-honest" data-t="po.honest"></p></div>`;
    const S = this.S, a = sc.querySelector('.po-face.a'), b = sc.querySelector('.po-face.b');
    const fill = (fig, canvas) => { if (canvas) { const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; c.getContext('2d').drawImage(canvas, 0, 0); fig.appendChild(c); } };
    fill(a, S.passport.portrait || this.portraitOf(S.passport.canvas, S.passport.faceBox));
    const sp = this.selfiePortrait(); fill(b, sp);
    this.repaint = () => this.paintMatchMeta();
  }
  portraitOf(canvas, box) { return canvas && box ? this.engine.portrait(canvas, box, 0.6, 320) : canvas; }
  selfiePortrait() {
    const S = this.S, c = S.selfie.canvas; if (!c) return null;
    if (S.selfie.portrait) return S.selfie.portrait;
    let box = null; const sig = S.selfie.sig; if (sig && sig.box) box = { x: sig.box.x * c.width, y: sig.box.y * c.height, w: sig.box.w * c.width, h: sig.box.h * c.height };
    S.selfie.portrait = box ? this.engine.portrait(c, box, 0.5, 320) : (this.engine.crop(c, { x: c.width * 0.18, y: c.height * 0.08, w: c.width * 0.64, h: c.width * 0.64 * 1.2 }, 320));
    return S.selfie.portrait;
  }
  async run_match(sc) {
    const S = this.S, T = this.o.thresholds, faces = sc.querySelector('.po-faces'), score = sc.querySelector('.po-score'), fg = score.querySelector('.fg'), num = score.querySelector('b');
    await sleep(this.reduce ? 50 : 500); faces.classList.add('joined');
    // work: real embedding when both landmark sets exist
    let m;
    const demoSim = S.mode === 'demo';
    const needLm = async () => {
      if (!S.selfie.lm && S.selfie.canvas && !demoSim) { try { const sg = await this.engine.analyzeImage(S.selfie.canvas); if (sg.face) { S.selfie.lm = sg.lm; S.selfie.sig = sg; S.selfie.portrait = null; } } catch (e) { /* none */ } }
      if (!S.passport.lm && S.passport.canvas && !demoSim && S.passport.portrait) { try { const sg = await this.engine.analyzeImage(S.passport.portrait); if (sg.face) S.passport.lm = sg.lm; } catch (e) { /* none */ } }
    };
    try { await needLm(); } catch (e) { /* ignore */ }
    const t0 = performance.now();
    if (!demoSim && S.selfie.lm && S.passport.lm) {
      m = await this.engine.compare(S.passport.portrait, S.passport.lm, S.selfie.canvas, S.selfie.lm);
      m.simulated = false;
    } else if (!demoSim && (!S.selfie.lm || !S.passport.lm)) {
      m = { method: 'no face found', cosine: null, score: 0.05, threshold: T.match, estimate: true, noFace: true, simulated: false };
    } else {
      const r = this.o.rng; m = { method: 'simulated (Demo camera)', cosine: null, score: 0.86 + r() * 0.08, threshold: 0.72, estimate: true, simulated: true };
    }
    m.ms = Math.round(performance.now() - t0); S.match = m;
    await sleep(Math.max(0, 900 - m.ms));
    faces.classList.remove('scanning');
    const pct = Math.round(m.score * 100), circ = 477.5;
    const thrPct = m.estimate ? 72 : Math.round(this.engineScoreAtThreshold() * 100);
    const kind = m.estimate && !m.simulated ? (m.score >= 0.62 ? 'ok' : m.score >= 0.4 ? 'warn' : 'bad') : (m.cosine !== null ? (m.cosine >= T.match ? 'ok' : m.cosine >= T.review ? 'warn' : 'bad') : (m.score >= 0.72 ? 'ok' : 'bad'));
    score.dataset.k = kind;
    fg.style.strokeDashoffset = String(circ * (1 - m.score));
    // threshold tick
    const ang = (thrPct / 100) * 2 * Math.PI, svg = score.querySelector('svg');
    const x1 = 88 + Math.cos(ang) * 68, y1 = 88 + Math.sin(ang) * 68, x2 = 88 + Math.cos(ang) * 84, y2 = 88 + Math.sin(ang) * 84;
    svg.insertAdjacentHTML('beforeend', `<line class="tick" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    // count up
    const dur = this.reduce ? 10 : 1200, st = performance.now();
    await new Promise(res => { const f = (t) => { const p = clamp((t - st) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); num.textContent = String(Math.round(pct * e)); if (p < 1) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    this.paintMatchMeta(); buzz(kind === 'ok' ? [20, 30, 20] : 30);
    await sleep(this.reduce ? 200 : 1500);
    if (!this.alive || S.step !== 'match') return;
    this.decide({}); this.go('result');
  }
  engineScoreAtThreshold() { return 0.72; }
  paintMatchMeta() {
    const S = this.S, m = S.match, box = this.sc && this.sc.querySelector('.po-match-meta'); if (!m || !box) return;
    const lv = S.liveness;
    const live = !lv || lv.uploaded ? ['skipped', 'warn'] : lv.passed ? ['passed', 'ok'] : ['failed', 'bad'];
    box.innerHTML = `<span class="po-badge ${m.estimate ? '' : (m.cosine >= this.o.thresholds.match ? 'ok' : 'bad')}">${m.estimate ? esc(this.t('po.m.est')) : esc(this.t('po.m.real', { c: m.cosine.toFixed(2) }))}</span>
      <span class="po-badge ${live[1]}">${icon('shield', 16)} ${esc(this.t('po.m.liveness'))}: ${esc(this.t('po.m.' + live[0]))}</span>
      <p class="po-sub" style="font-size:12.5px;max-width:320px">${esc(m.estimate ? (m.simulated ? this.t('po.m.est_note') : this.t('po.m.geo_note')) : this.t('po.m.threshold', { t: this.o.thresholds.match.toFixed(3) }))}</p>`;
  }

  /* ================================================================= DECISION + RESULT */
  decide({ forced, reason }) {
    const S = this.S, T = this.o.thresholds, m = S.match, lv = S.liveness, mrz = S.passport.mrz;
    let decision, why;
    const ref = S.ref || (S.ref = 'PLR-' + Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(this.o.rng() * 32)]).join(''));
    if (forced) { decision = forced; why = reason; }
    else if (!mrz || !mrz.valid) { decision = 'retake'; why = 'mrz'; }
    else if (S.passport.expired) { decision = 'retake'; why = 'expired'; }
    else if (lv && lv.uploaded) { decision = 'review'; why = 'upload'; }
    else if (!lv || !lv.passed) { decision = 'retake'; why = 'live'; }
    else if (m && m.noFace) { decision = 'retake'; why = 'match'; }
    else if (m && m.simulated) { decision = 'accepted'; why = 'simulated'; }
    else if (m && m.estimate) { decision = m.score >= 0.62 ? 'review' : 'retake'; why = m.score >= 0.62 ? 'estimate' : 'match'; }
    else if (m && m.cosine >= T.match) { decision = 'accepted'; why = 'match'; }
    else if (m && m.cosine >= T.review) { decision = 'review'; why = 'borderline'; }
    else { decision = 'retake'; why = 'match'; }
    // too many failed selfie attempts -> a person looks at it instead of a loop
    if (decision === 'retake' && (why === 'live' || why === 'match') && S.attempts.selfie >= 2) { decision = 'review'; why = 'attempts'; }
    S.result = { decision, reason: why, reference: ref };
    return S.result;
  }
  payload() {
    const S = this.S, p = S.passport.mrz, m = S.match, lv = S.liveness, r = S.result || {};
    const img = (c, q = 0.85) => { try { return c ? c.toDataURL('image/jpeg', q) : null; } catch (e) { return null; } };
    return {
      decision: r.decision, reason: r.reason, reference: r.reference, mode: S.mode, grade: 'demo', certified: false, ts: new Date().toISOString(),
      document: p ? { format: p.format, type: p.docType, issuer: p.issuer, surname: p.surname, givenNames: p.givenNames, docNumber: p.docNumber, nationality: p.nationality, dob: p.dob, sex: p.sex, expiry: p.expiry, expired: S.passport.expired, mrz: { lines: p.lines, checks: p.checks, valid: p.valid, repaired: !!p.repaired } } : null,
      liveness: lv ? { ...lv } : null,
      match: m ? { score: +m.score.toFixed(3), cosine: m.cosine === null ? null : +m.cosine.toFixed(3), method: m.method, estimate: !!m.estimate, simulated: !!m.simulated, threshold: m.threshold } : null,
      images: { passportPhoto: img(S.passport.portrait), selfie: img(S.selfie.portrait || this.selfiePortrait()) },
    };
  }
  draw_result(sc) {
    const S = this.S; if (!S.result) this.decide({});
    const r = S.result, k = r.decision === 'accepted' ? 'ok' : r.decision === 'review' ? 'rev' : 'ret';
    const title = { ok: 'po.r.ok.t', rev: 'po.r.rev.t', ret: 'po.r.ret.t' }[k];
    const desc = r.decision === 'accepted' ? 'po.r.ok.d' : r.decision === 'review' ? (r.reason === 'upload' ? 'po.r.rev.upload' : 'po.r.rev.d') : 'po.r.ret.' + ({ live: 'live', match: 'match', mrz: 'mrz', expired: 'expired' }[r.reason] || 'live');
    const m = S.match, lv = S.liveness, p = S.passport.mrz;
    const nChk = p ? Object.keys(p.checks).length : 0, okChk = p ? Object.values(p.checks).filter(Boolean).length : 0;
    const row = (st, label, val) => `<div class="r"><span class="po-st" data-s="${st}">${icon(st === 'ok' ? 'check' : st === 'bad' ? 'x' : 'info')}</span><span data-t="${label}"></span><b>${val}</b></div>`;
    const liveTxt = !lv || lv.uploaded ? this.t('po.m.skipped') : lv.passed ? this.t('po.m.passed') : this.t('po.m.failed');
    const liveSt = !lv || lv.uploaded ? 'warn' : lv.passed ? 'ok' : 'bad';
    const retPp = r.decision === 'retake' && (r.reason === 'mrz' || r.reason === 'expired');
    sc.innerHTML = `<div class="po-scroll po-result">
      <div class="po-bigcheck pop" data-k="${k}"><svg viewBox="0 0 24 24" class="draw" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${k === 'ok' ? '<path d="m5 12.5 4.5 4.5L19 7.5"/>' : k === 'rev' ? '<circle cx="12" cy="12" r="8.4"/><path d="M12 7.5V12l3 2"/>' : '<path d="M6 6l12 12M18 6 6 18"/>'}</svg></div>
      <h1 class="po-title" data-t="${title}"></h1><p class="po-sub" data-t="${desc}" style="max-width:340px"></p>
      <div class="po-card po-sumlist">
        ${row(liveSt, 'po.r.sum.live', esc(liveTxt))}
        ${row(p && p.valid ? 'ok' : 'bad', 'po.r.sum.mrz', esc(p ? (okChk === nChk ? this.t('po.r.sum.mrz_ok', { n: nChk }) : this.t('po.r.sum.mrz_part', { a: okChk, b: nChk })) : '-'))}
        ${row(m ? (m.estimate && !m.simulated ? 'warn' : (m.cosine !== null ? (m.cosine >= this.o.thresholds.match ? 'ok' : 'bad') : (m.score >= 0.72 ? 'ok' : 'bad'))) : 'warn', 'po.r.sum.match', m ? `<span class="po-num">${Math.round(m.score * 100)}%</span>${m.estimate ? ' · ' + esc(this.t('po.m.est')) : ''}` : '-')}
        <div class="r"><span class="po-st" data-s="ok">${icon('info')}</span><span data-t="po.r.ref"></span><b class="po-num" style="direction:ltr">${esc(r.reference)}</b></div>
      </div>
      <p class="po-honest" data-t="po.honest"></p></div>
    <div class="po-foot">
      ${r.decision === 'retake' ? `<button class="po-btn block" data-act="${retPp ? 'retryPpFromResult' : 'retrySf'}">${icon('refresh')}<span data-t="${retPp ? 'po.r.retake_pp' : 'po.r.retake_sf'}"></span></button>` : `<button class="po-btn block" data-act="continue"><span>${esc(this.o.continueLabel || this.t('po.continue'))}</span>${icon('arrowR', 22, 'class="po-flip"')}</button>`}
    </div>`;
    this.repaint = () => this.draw_result(sc), this.retext();
    // announce once per decision
    if (!this._announced || this._announced !== r.reference + r.decision) { this._announced = r.reference + r.decision; setTimeout(() => this.emit('result', this.payload()), 60); if (r.decision === 'accepted') { buzz([30, 40, 60]); setTimeout(() => this.burst(150, 'big'), 250); } }
  }

  /* ================================================================= CONFETTI */
  burst(n, kind, anchor) {
    if (this.reduce) return; n = Math.min(n, kind === 'small' ? 0 : 28); if (!n) return;
    const cv = this.confetti, r = this.root.getBoundingClientRect(); cv.width = r.width; cv.height = r.height; const g = cv.getContext('2d');
    const cs = getComputedStyle(this.root), col = ['--po-brand', '--po-accent', '--po-field3', '--po-ok', '--po-field2'].map(v => cs.getPropertyValue(v).trim() || '#EB4E4D');
    col.push('#ffffff');
    const ox = kind === 'small' ? r.width / 2 : r.width / 2, oy = kind === 'small' ? r.height * 0.43 : r.height * 0.28;
    const P = Array.from({ length: n }, () => { const a = Math.random() * Math.PI * 2, s = (kind === 'small' ? 2 : 4) + Math.random() * (kind === 'small' ? 4 : 8); return { x: ox, y: oy, vx: Math.cos(a) * s * (kind === 'small' ? 1 : 1.2), vy: Math.sin(a) * s - (kind === 'small' ? 0 : 5), w: 5 + Math.random() * 7, h: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: col[Math.floor(Math.random() * col.length)], life: 1, round: Math.random() < .3 }; });
    let last = performance.now();
    const f = (t) => {
      if (!this.alive) return; const dt = Math.min(2, (t - last) / 16.7); last = t; g.clearRect(0, 0, cv.width, cv.height); let any = false;
      for (const p of P) { p.vy += 0.22 * dt; p.vx *= 0.992; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.life -= (kind === 'small' ? 0.022 : 0.006) * dt; if (p.life > 0 && p.y < cv.height + 20) { any = true; g.save(); g.globalAlpha = clamp(p.life * 1.5, 0, 1); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; if (p.round) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 7); g.fill(); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); } }
      if (any) requestAnimationFrame(f); else g.clearRect(0, 0, cv.width, cv.height);
    };
    requestAnimationFrame(f);
  }
}
