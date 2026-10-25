// Neptune Showroom - Telco apps core: prefs (EN/FR/AR, light/dark, 6 looks), i18n, shell, router, sheets, keypad, charts, confetti.
// Everything is simulated: no network, no backend. State lives in localStorage.
const BASE = new URL('../', import.meta.url);
export const ICONS = new URL('assets/icons/', BASE).href;
export const LOGO = { color: new URL('assets/brand/Neptune_Logo_Color.png', BASE).href, rev: new URL('assets/brand/Neptune_Logo_Reverse.png', BASE).href };

/* ------------------------------------------------------------------ i18n  DICT[key] = [en, ar, fr] */
export const DICT = {};
const IDX = { en: 0, ar: 1, fr: 2 };
export const add = o => Object.assign(DICT, o);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ prefs */
const PREF_KEY = 'telco.prefs.v1';
const L = globalThis.Looks;
const DENSE = ['classic', 'heritage', 'private'];
const qs = new URLSearchParams(location.search);
export const EMBED = qs.get('embed') === '1';
let PREFS = { lang: 'en', theme: 'light', look: 'telco', motion: 'auto' };
try { Object.assign(PREFS, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* private mode */ }
for (const k of ['lang', 'theme', 'look']) if (qs.get(k)) PREFS[k] = qs.get(k);
if (!['en', 'ar', 'fr'].includes(PREFS.lang)) PREFS.lang = 'en';
if (L && !L.list.some(l => l.id === PREFS.look)) PREFS.look = 'telco';
export const prefs = () => PREFS;
export const lang = () => PREFS.lang;
export const isRtl = () => PREFS.lang === 'ar';
export const t = (k, p) => {
  const e = DICT[k];
  if (!e) { console.warn('[i18n] missing', k); return k; }
  let s = e[IDX[PREFS.lang]] ?? e[0];
  if (p) s = s.replace(/\{(\w+)\}/g, (_, n) => (p[n] ?? ''));
  return s;
};
export const loc = o => (o && typeof o === 'object') ? (o[PREFS.lang] || o.en) : (o ?? '');
let bc = null; try { bc = 'BroadcastChannel' in self ? new BroadcastChannel('telco-showroom') : null; } catch (e) { /* ignore */ }
const listeners = new Set();
export const onPrefs = f => listeners.add(f);
export function applyPrefs() {
  const d = document.documentElement;
  d.lang = PREFS.lang; d.dir = PREFS.lang === 'ar' ? 'rtl' : 'ltr';
  d.dataset.odysseyMode = PREFS.theme; d.dataset.odysseyProduct = 'core';
  if (L) L.set(PREFS.look, true); else d.dataset.look = PREFS.look;
  if (DENSE.includes(PREFS.look)) { d.dataset.dense = ''; delete d.dataset.lively; } else { d.dataset.lively = ''; delete d.dataset.dense; }
  d.dataset.reduceMotion = PREFS.motion === 'reduce' ? 'true' : 'false';
  const meta = document.querySelector('meta[name=theme-color]'); if (meta) { const l = L && L.list.find(x => x.id === PREFS.look); if (l) meta.content = PREFS.theme === 'dark' ? '#101018' : l.brand; }
}
export function setPrefs(p, broadcast = true) {
  Object.assign(PREFS, p);
  try { localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); } catch (e) { /* ignore */ }
  applyPrefs();
  if (broadcast && bc) bc.postMessage({ t: 'prefs', p: PREFS });
  listeners.forEach(f => f());
}
if (bc) bc.onmessage = e => {
  if (e.data && e.data.t === 'prefs') { Object.assign(PREFS, e.data.p); applyPrefs(); listeners.forEach(f => f()); }
  if (e.data && e.data.t === 'replay' && ACTIONS.replay) ACTIONS.replay();
};
export const broadcast = m => { if (bc) bc.postMessage(m); };
window.addEventListener('storage', e => { if (e.key === PREF_KEY && e.newValue) { try { Object.assign(PREFS, JSON.parse(e.newValue)); applyPrefs(); listeners.forEach(f => f()); } catch (err) { /* ignore */ } } });
document.addEventListener('looks:change', e => { if (e.detail && e.detail.id !== PREFS.look) setPrefs({ look: e.detail.id }); });

/* ------------------------------------------------------------------ formats (Western digits 0-9 in Arabic too) */
const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export const cur = () => PREFS.lang === 'ar' ? 'د.ل' : 'LYD';
export const fmtN = (m, short) => (short && m % 100 === 0) ? nf0.format(m / 100) : nf.format(m / 100);
export const money = (m, o = {}) => `<span style="white-space:nowrap"><span class="num">${o.sign && m > 0 ? '+' : (m < 0 ? '−' : '')}${fmtN(Math.abs(m), o.short)}</span>${o.cur === false ? '' : `<span class="cur">${cur()}</span>`}</span>`;
export const moneyT = (m, short) => `${fmtN(m, short)} ${cur()}`;
export const int = n => nf0.format(n);
const dloc = () => ({ en: 'en-GB', ar: 'ar-LY-u-nu-latn', fr: 'fr-FR' })[PREFS.lang];
export function fdate(ts, o = {}) {
  const f = o.time ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false } : o.long ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat(dloc(), f).format(new Date(ts));
}
export const ago = ts => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return t('c.now'); if (m < 60) return t('c.min_ago', { n: m }); const h = Math.round(m / 60); if (h < 24) return t('c.h_ago', { n: h });
  return fdate(ts);
};
export const fnum = n => `<span class="num">${esc(n)}</span>`;
export const msisdn = s => s.replace(/(\+\d{3})(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');

/* ------------------------------------------------------------------ small DOM helpers */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const ic = (name, cls = '') => `<i class="ic ${cls}" style="--ic:url(${ICONS}${name}.svg)" aria-hidden="true"></i>`;
export const logoLine = () => `<span class="logo-line"><img class="rev" src="${LOGO.rev}" alt="Neptune"><img class="col" src="${LOGO.color}" alt="Neptune"></span>`;
export const haptic = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* ignore */ } };
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const reduced = () => PREFS.motion === 'reduce' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
export function uid() { return Math.random().toString(36).slice(2, 9); }

/* ------------------------------------------------------------------ persisted state */
export function store(key, seed) {
  let S;
  try { S = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { S = null; }
  if (!S) { S = seed(); save(); }
  function save() { try { localStorage.setItem(key, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  return { get: () => S, set(fn) { fn(S); save(); }, reset() { S = seed(); save(); return S; }, replace(v) { S = v; save(); } };
}

/* ------------------------------------------------------------------ shell */
let APP = null;
/**
 * Build the app shell into <body>. cfg: {id, title, logo (html), panel: {extra buttons}}
 * Returns {app, view(html,opts), sheet, toast, root}
 */
export function shell(cfg) {
  applyPrefs();
  const desk = !EMBED && matchMedia('(min-width: 900px) and (min-height: 640px)').matches;
  document.documentElement.classList.toggle('tc-desk', desk); document.documentElement.classList.toggle('tc-embed', EMBED);
  document.body.innerHTML = `<div class="tc-root">${desk ? `<aside class="tc-panel" id="panel"></aside>` : ''}<div class="tc-phone">${desk ? '<span class="notch"></span>' : ''}<div class="app" id="app"><div class="statusbar" aria-hidden="true"><span class="num">9:41</span><span class="r">${ic('signal', 'sm')}${ic('wifi', 'sm')}<i class="sbar-batt"></i></span></div><div id="view" style="display:contents"></div></div></div></div>`;
  const app = $('#app'), viewEl = $('#view');
  APP = { app, viewEl, cfg, desk };
  if (desk) { fitPhone(); addEventListener('resize', fitPhone); paintPanel(); onPrefs(paintPanel); }
  app.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g && app.contains(g)) { e.preventDefault(); go(g.dataset.go); return; }
    const b = e.target.closest('[data-back]'); if (b) { e.preventDefault(); back(b.dataset.back || null); return; }
    const a = e.target.closest('[data-act]'); if (a && app.contains(a)) { const f = ACTIONS[a.dataset.act]; if (f) f(a, e); }
  });
  app.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][tabindex]')) { e.preventDefault(); e.target.click(); } });
  return APP;
}
function fitPhone() { const z = Math.min(1, (innerHeight - 20) / 852); document.documentElement.style.setProperty('--z', z.toFixed(3)); }
const ACTIONS = {};
export const actions = ACTIONS;
export const appEl = () => APP && APP.app;

function paintPanel() {
  const p = $('#panel'); if (!p) return; const cfg = APP.cfg, dark = PREFS.theme === 'dark';
  const open = p.querySelector('.looks-picker') ? true : false; void open;
  p.innerHTML = `<img class="logo" src="${dark ? LOGO.rev : LOGO.color}" alt="Neptune"><div><h1>${esc(loc(cfg.title))}</h1><p class="muted sm" style="margin-top:4px">${esc(t('panel.demo'))}</p></div>
   <div class="grp"><label class="t">${t('panel.language')}</label><div class="seg full" role="group" aria-label="${t('panel.language')}">${['en', 'ar', 'fr'].map(l => `<button data-lang="${l}" aria-pressed="${PREFS.lang === l}" lang="${l}">${{ en: 'English', ar: 'العربية', fr: 'Français' }[l]}</button>`).join('')}</div></div>
   <div class="grp"><label class="t">${t('panel.theme')}</label><div class="seg full" role="group"><button data-theme="light" aria-pressed="${!dark}">${ic('sun', 'sm')} ${t('panel.light')}</button><button data-theme="dark" aria-pressed="${dark}">${ic('moon', 'sm')} ${t('panel.dark')}</button></div></div>
   <div class="grp"><label class="t">${t('panel.look')}</label><div id="looks-slot"></div></div>
   <div class="grp"><button class="btn tonal sm" data-p="replay">${ic('refresh')} ${t('panel.replay')}</button><button class="btn ghost sm" data-p="reset">${t('panel.reset')}</button><a class="btn text sm" href="../">${t('panel.stage')}</a></div>
   <p class="legal">${t('panel.honest')}</p>`;
  if (L) { L.mount($('#looks-slot', p), { label: t('panel.look') }); }
  p.onclick = e => {
    const lb = e.target.closest('[data-lang]'); if (lb) { setPrefs({ lang: lb.dataset.lang }); return; }
    const tb = e.target.closest('[data-theme]'); if (tb) { setPrefs({ theme: tb.dataset.theme }); return; }
    const pb = e.target.closest('[data-p]'); if (pb && cfg.onPanel) cfg.onPanel(pb.dataset.p);
  };
}

/* view + transitions */
export function view(html, { tab = false, back = false, cls = '' } = {}) {
  const { viewEl, app } = APP;
  app.classList.toggle('has-tabs', !!tab);
  viewEl.innerHTML = html;
  const sc = viewEl.querySelector('.screen'); if (sc && back) sc.classList.add('back'); if (sc && cls) sc.classList.add(cls);
  return viewEl;
}
/* router (hash) */
let HANDLER = null, STACK = [], LAST = '';
export function router(handler) {
  HANDLER = handler;
  addEventListener('hashchange', () => render());
  render(true);
}
export const path = () => location.hash.replace(/^#\/?/, '') || '';
export function go(p) { if (('#/' + p) === location.hash) { render(); return; } location.hash = '#/' + p; }
export function replace(p) { history.replaceState(null, '', '#/' + p); render(); }
export function back(fallback) { if (STACK.length > 1) history.back(); else if (fallback) replace(fallback); else history.back(); }
export function render(first) {
  const p = path();
  const dir = STACK.length > 1 && STACK[STACK.length - 2] === p ? 'back' : 'fwd';
  if (dir === 'back') STACK.pop(); else if (STACK[STACK.length - 1] !== p) STACK.push(p);
  LAST = p;
  const parts = p.split('/').filter(Boolean), q = {};
  HANDLER && HANDLER(parts, { path: p, dir, first: !!first, back: dir === 'back' });
}
export const rerender = () => render();
export const currentPath = () => LAST;

/* sheets + toast */
export function sheet(html, { onClose, cls = '' } = {}) {
  const { app } = APP;
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const sh = document.createElement('div'); sh.className = 'sheet ' + cls; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
  sh.innerHTML = `<span class="grab"></span>${html}`;
  app.appendChild(scrim); app.appendChild(sh);
  const close = () => { scrim.remove(); sh.remove(); onClose && onClose(); };
  scrim.addEventListener('click', close);
  sh.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(); });
  const f = sh.querySelector('button,input'); f && f.focus && f.focus({ preventScroll: true });
  return { el: sh, close };
}
export function toast(msg, icon = 'success-check') {
  const { app } = APP; const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`;
  app.appendChild(el); setTimeout(() => el.remove(), 2600);
}

/* ------------------------------------------------------------------ keypad + PIN */
export function keypadHTML(opts = {}) {
  const k = ['1', '2', '3', '4', '5', '6', '7', '8', '9', opts.dec ? '.' : '', '0', 'del'];
  return `<div class="keypad" role="group" aria-label="keypad">${k.map(x => x === '' ? '<span></span>' : x === 'del' ? `<button class="o" data-k="del" aria-label="${t('c.delete')}">${ic('arrow-left', 'flip')}</button>` : `<button data-k="${x}">${x}</button>`).join('')}</div>`;
}
export function bindKeypad(root, { max = 8, dec = false, onChange, value = '' }) {
  let v = value;
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; haptic(6);
    if (k === 'del') v = v.slice(0, -1);
    else if (k === '.') { if (dec && !v.includes('.') && v.length) v += '.'; else if (dec && !v.length) v = '0.'; }
    else if (v.length < max) { if (dec && v.includes('.') && v.split('.')[1].length >= 2) return; v = (v === '0' ? '' : v) + k; }
    onChange(v);
  });
  return { get: () => v, set: x => { v = x; onChange(v); } };
}

/* ------------------------------------------------------------------ charts + decoration */
export function ring({ pct, size = 120, stroke = 12, color = 'var(--accent)', mid = '' }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/><circle class="fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" style="stroke:${color}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.max(0.001, Math.min(1, pct)))}"/></svg><div class="mid">${mid}</div></div>`;
}
export function bars(vals, hi = -1) {
  const m = Math.max(...vals, 1);
  return `<div class="spark" aria-hidden="true">${vals.map((v, i) => `<i class="${i === hi ? 'on' : ''}" style="height:${Math.max(8, v / m * 100)}%;animation-delay:${i * 0.04}s"></i>`).join('')}</div>`;
}
export function countUp(root = document) {
  $$('[data-count]', root).forEach(el => {
    const to = +el.dataset.count, dec = el.dataset.dec === '1'; if (reduced()) { el.textContent = dec ? fmtN(to) : int(to); return; }
    const t0 = performance.now(), d = 900; const f = now => { const p = Math.min(1, (now - t0) / d), e = 1 - Math.pow(1 - p, 3); el.textContent = dec ? fmtN(Math.round(to * e)) : int(Math.round(to * e)); if (p < 1) requestAnimationFrame(f); }; requestAnimationFrame(f);
  });
}
/** Deterministic FAKE QR-look pattern (finder squares + pseudo-random modules). Not scannable: it is a demonstration. */
export function fakeQR(seed = 'demo', n = 27) {
  let h = 2166136261; for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  const cell = 100 / (n + 2); let d = '';
  const finder = (x, y) => { d += `<rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${7 * cell}" height="${7 * cell}" rx="${cell * 1.2}" fill="none" stroke="currentColor" stroke-width="${cell}"/><rect x="${(x + 3) * cell}" y="${(y + 3) * cell}" width="${3 * cell}" height="${3 * cell}" rx="${cell * .6}" fill="currentColor"/>`; };
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) d += `<rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${cell * .92}" height="${cell * .92}" rx="${cell * .25}" fill="currentColor"/>`;
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${t('c.qr_demo')}" style="width:100%;height:auto;display:block">${d}</svg>`;
}
export function confetti(host, n = 120, power = 1) {
  n = Math.min(n, 24); power = Math.min(power, .6);
  if (reduced()) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti-cv'; const r = host.getBoundingClientRect(); cv.width = r.width; cv.height = r.height; host.appendChild(cv);
  const g = cv.getContext('2d'), cs = getComputedStyle(document.documentElement);
  const col = [cs.getPropertyValue('--look-brand'), cs.getPropertyValue('--look-accent'), cs.getPropertyValue('--look-field-3'), cs.getPropertyValue('--look-field-2'), '#fff'].map(x => x.trim() || '#EB4E4D');
  const P = Array.from({ length: n }, () => { const a = Math.random() * Math.PI * 2, s = (3 + Math.random() * 8) * power; return { x: r.width / 2, y: r.height * .34, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, w: 5 + Math.random() * 7, h: 4 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: col[Math.floor(Math.random() * col.length)], l: 1, o: Math.random() < .3 }; });
  let last = performance.now();
  const f = now => { const dt = Math.min(2, (now - last) / 16.7); last = now; g.clearRect(0, 0, cv.width, cv.height); let any = false;
    for (const p of P) { p.vy += .22 * dt; p.vx *= .992; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; p.l -= .006 * dt; if (p.l > 0 && p.y < cv.height + 20) { any = true; g.save(); g.globalAlpha = Math.min(1, p.l * 1.5); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c; if (p.o) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 7); g.fill(); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore(); } }
    if (any) requestAnimationFrame(f); else cv.remove(); };
  requestAnimationFrame(f);
}
export function splash(brandHTML, ms = 1400) {
  const { app } = APP; const s = document.createElement('div'); s.className = 'splash'; s.innerHTML = brandHTML; app.appendChild(s);
  return new Promise(res => setTimeout(() => { s.classList.add('out'); setTimeout(() => { s.remove(); res(); }, 520); }, reduced() ? 100 : ms));
}

/* ------------------------------------------------------------------ PWA */
export function registerSW(url = '../sw.js') {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  addEventListener('load', () => navigator.serviceWorker.register(url).catch(() => { /* offline shell is optional */ }));
}
/** Cache every vendored ML asset so the Polaris check works with no network (Settings > Offline pack). */
export async function downloadOfflinePack(onProgress) {
  const base = new URL('../../shared/polaris/vendor/', import.meta.url).href;
  const files = ['mediapipe/vision_bundle.mjs', 'mediapipe/wasm/vision_wasm_internal.js', 'mediapipe/wasm/vision_wasm_internal.wasm', 'models/face_landmarker.task', 'models/blaze_face_short_range.tflite', 'models/face_recognition_sface_2021dec_int8.onnx',
    'ort/ort.wasm.min.mjs', 'ort/ort-wasm-simd-threaded.mjs', 'ort/ort-wasm-simd-threaded.wasm', 'tesseract/tesseract.min.js', 'tesseract/worker.min.js', 'tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract/core/tesseract-core-simd-lstm.wasm.js', 'tesseract/core/tesseract-core-lstm.wasm.js', 'tesseract/lang/eng.traineddata.gz', 'fonts/DejaVuSansMono-Bold.ttf'].map(f => base + f);
  const cache = await caches.open('telco-vendor-v1'); let done = 0;
  for (const u of files) { try { if (!(await cache.match(u))) { const r = await fetch(u); if (r.ok) await cache.put(u, r); } } catch (e) { /* skip */ } done++; onProgress && onProgress(done / files.length); }
  return files.length;
}
export async function offlineReady() { try { const c = await caches.open('telco-vendor-v1'); return (await c.keys()).length >= 14; } catch (e) { return false; } }

add({
  'c.now': ['now', 'الآن', 'à l’instant'], 'c.min_ago': ['{n} min ago', 'قبل {n} د', 'il y a {n} min'], 'c.h_ago': ['{n} h ago', 'قبل {n} س', 'il y a {n} h'],
  'c.delete': ['Delete', 'حذف', 'Effacer'], 'c.qr_demo': ['Demonstration code, not scannable', 'رمز توضيحي غير قابل للمسح', 'Code de démonstration, non scannable'],
  'c.back': ['Back', 'رجوع', 'Retour'], 'c.close': ['Close', 'إغلاق', 'Fermer'], 'c.continue': ['Continue', 'متابعة', 'Continuer'], 'c.done': ['Done', 'تم', 'Terminé'], 'c.cancel': ['Cancel', 'إلغاء', 'Annuler'], 'c.confirm': ['Confirm', 'تأكيد', 'Confirmer'], 'c.save': ['Save', 'حفظ', 'Enregistrer'], 'c.next': ['Next', 'التالي', 'Suivant'],
  'panel.demo': ['Demonstration. Simulated data, invented operator.', 'عرض توضيحي. بيانات محاكاة ومشغّل مُختلق.', 'Démonstration. Données simulées, opérateur fictif.'],
  'panel.language': ['Language', 'اللغة', 'Langue'], 'panel.theme': ['Theme', 'المظهر', 'Thème'], 'panel.light': ['Light', 'فاتح', 'Clair'], 'panel.dark': ['Dark', 'داكن', 'Sombre'], 'panel.look': ['Look', 'الهوية البصرية', 'Apparence'],
  'panel.replay': ['Replay onboarding', 'أعد تشغيل التسجيل', 'Rejouer l’inscription'], 'panel.reset': ['Reset demo', 'إعادة ضبط العرض', 'Réinitialiser la démo'], 'panel.stage': ['Open the stage (both apps)', 'افتح المنصة (التطبيقان)', 'Ouvrir la scène (les deux apps)'],
  'panel.honest': ['Simulated showcase: no backend, no real operator, no real identity checks. Polaris checks run on this device with demo-grade models.', 'عرض محاكى: بلا خادم ولا مشغّل حقيقي ولا فحص هوية حقيقي. تعمل فحوص بولاريس على هذا الجهاز بنماذج للعرض.', 'Vitrine simulée : pas de serveur, pas d’opérateur réel, pas de vérification d’identité réelle. Les contrôles Polaris tournent sur cet appareil avec des modèles de démonstration.'],
});
