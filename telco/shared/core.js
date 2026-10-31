// Telco apps core: prefs (EN/FR/AR, light/dark), i18n, shell, router, sheets, keypad, charts, confetti.
// No network, no backend. State lives in localStorage.
const BASE = new URL('../', import.meta.url);
export const ICONS = new URL('assets/icons/', BASE).href;

/* ------------------------------------------------------------------ i18n  DICT[key] = [en, ar, fr] */
export const DICT = {};
const IDX = { en: 0, ar: 1, fr: 2 };
export const add = o => Object.assign(DICT, o);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ------------------------------------------------------------------ prefs */
const PREF_KEY = 'telco.prefs.v2';
const qs = new URLSearchParams(location.search);
let PREFS = { lang: 'en', theme: 'light', motion: 'auto' };
try { Object.assign(PREFS, JSON.parse(localStorage.getItem(PREF_KEY) || '{}')); } catch (e) { /* private mode */ }
for (const k of ['lang', 'theme']) if (qs.get(k)) PREFS[k] = qs.get(k);
if (!['en', 'ar', 'fr'].includes(PREFS.lang)) PREFS.lang = 'en';
if (!['light', 'dark'].includes(PREFS.theme)) PREFS.theme = 'light';
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
const listeners = new Set();
export const onPrefs = f => listeners.add(f);
export function applyPrefs() {
  const d = document.documentElement;
  d.lang = PREFS.lang; d.dir = PREFS.lang === 'ar' ? 'rtl' : 'ltr';
  d.dataset.odysseyMode = PREFS.theme; d.dataset.reduceMotion = PREFS.motion === 'reduce' ? 'true' : 'false';
  if (APP) d.dataset.app = APP.cfg.id;
  const meta = document.querySelector('meta[name=theme-color]'); if (meta && APP) meta.content = APP.cfg.themeColor[PREFS.theme === 'dark' ? 1 : 0];
}
export function setPrefs(p) {
  Object.assign(PREFS, p);
  try { localStorage.setItem(PREF_KEY, JSON.stringify(PREFS)); } catch (e) { /* ignore */ }
  applyPrefs();
  listeners.forEach(f => f());
}

/* ------------------------------------------------------------------ formats (Western digits 0-9 in Arabic too) */
const nf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
export const cur = () => PREFS.lang === 'ar' ? 'د.ل' : 'LYD';
export const fmtN = (m, short) => (short && m % 100 === 0) ? nf0.format(m / 100) : nf.format(m / 100);
export const money = (m, o = {}) => {
  const a = Math.abs(m), whole = nf0.format(Math.floor(a / 100)), dec = (o.short && a % 100 === 0) ? '' : `<small class="dec">.${String(a % 100).padStart(2, '0')}</small>`;
  return `<span style="white-space:nowrap"><span class="num">${o.sign && m > 0 ? '+' : (m < 0 ? '−' : '')}${whole}${dec}</span>${o.cur === false ? '' : `<span class="cur">${cur()}</span>`}</span>`;
};
export const moneyT = (m, short) => `${fmtN(m, short)} ${cur()}`;
export const int = n => nf0.format(n);
const dloc = () => ({ en: 'en-GB', ar: 'ar-LY-u-nu-latn', fr: 'fr-FR' })[PREFS.lang];
export function fdate(ts, o = {}) {
  if (o.wd) return new Intl.DateTimeFormat(dloc(), { weekday: 'narrow' }).format(new Date(ts));
  const f = o.time ? { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false } : o.long ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat(dloc(), f).format(new Date(ts));
}
export const ago = ts => {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return t('c.now'); if (m < 60) return t('c.min_ago', { n: m }); const h = Math.round(m / 60); if (h < 24) return t('c.h_ago', { n: h });
  return fdate(ts);
};
export const fnum = n => `<span class="num">${esc(n)}</span>`;
export const msisdn = s => esc(String(s ?? '').replace(/^(\+\d{3})(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4'));

/* ------------------------------------------------------------------ small DOM helpers */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const ic = (name, cls = '') => `<i class="ic ${cls}" style="--ic:url(${ICONS}${name}.svg)" aria-hidden="true"></i>`;
/** section header for pages reached from the dock or home: gradient band + the sheet lip the content slides under */
export const heroBar = (title, { back = 'home', end = '' } = {}) => `<div class="hero slim"><div class="rings"></div><div class="hrow">${back ? `<button class="iconbtn glass" data-back="${back}" aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}<h1 class="disp" style="font-size:26px;flex:1;letter-spacing:-.01em">${title}</h1>${end}</div></div><div class="sheetlip"></div>`;
/** floating glass dock: two tabs, the raised scan button, two tabs */
/* dock tabs: Home returns to the root entry; switching between tabs replaces rather than stacks, so back never cycles through tabs */
function tabGo(r, l) {
  if (r === 'home') return reset('home');
  if (r === path()) return;
  const onTab = [...l.closest('.tabbar').querySelectorAll('a.tab')].some(x => x.getAttribute('href').slice(2) === path() && x !== l);
  if (onTab && r !== 'scan' && path() !== 'home') replace(r); else go(r);
}
export const dock = (cur, left, right) => { const lnk = ([r, i, k]) => `<a class="tab" href="#/${r}" ${cur === r ? 'aria-current="page"' : ''}><span class="pill">${ic(i)}</span><span class="tl">${t(k)}</span></a>`; return `<nav class="tabbar" aria-label="${esc(loc(APP.cfg.op.app))}">${left.map(lnk).join('')}<a class="tab" href="#/scan" aria-label="${t('c.scan')}"><span class="fab">${ic('qr-scan', 'lg')}</span></a>${right.map(lnk).join('')}</nav>`; };
/** result screen: gradient band with the seal, then the sheet with the details */
export const success = ({ title, sub = '', big = '', rows = '', foot = '' }) => `<div class="hero compact" style="padding-bottom:64px;text-align:center"><div class="rings"></div><div class="hrow" style="justify-content:center">${lockup(28)}</div><span class="okmark anim-pop" style="margin:18px auto 12px;width:84px;height:84px;box-shadow:0 0 0 10px rgba(255,255,255,.16),0 14px 30px -10px rgba(0,0,0,.5)">${ic('success-check', 'lg')}</span><h1 class="disp" style="font-size:28px;letter-spacing:-.02em">${title}</h1>${sub ? `<p style="opacity:.9;margin:6px auto 0;max-width:290px">${sub}</p>` : ''}</div><div class="sheetbody"><div class="sec fill" style="gap:14px;padding-top:20px">${big ? `<div class="card" style="text-align:center">${big}</div>` : ''}${rows}${foot}</div></div>`;
export const mark = (n = 32) => APP.cfg.mark(n);
export const lockup = (n = 30) => `<span class="lockup">${mark(n)}<b>${esc(loc(APP.cfg.op.app))}</b></span>`;
export const copyText = async (txt, msg) => { try { await navigator.clipboard.writeText(txt); } catch (e) { /* clipboard blocked: still confirm, the code stays on screen */ } toast(msg); };
export function byDay(list) {
  const out = [], today = new Date().setHours(0, 0, 0, 0);
  for (const x of list) {
    const d = Math.round((today - new Date(x.ts).setHours(0, 0, 0, 0)) / 864e5), label = d <= 0 ? t('c.today') : d === 1 ? t('c.yesterday') : fdate(x.ts, { long: true });
    const g = out[out.length - 1]; if (g && g.label === label) g.items.push(x); else out.push({ label, items: [x] });
  }
  return out;
}
export const haptic = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* ignore */ } };
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const reduced = () => PREFS.motion === 'reduce' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
export function uid() { return Math.random().toString(36).slice(2, 9); }

/* ------------------------------------------------------------------ persisted state */
/** valid(S) guards against a stored copy that is corrupted or from an older build: anything that fails starts fresh. */
export function store(key, seed, valid = () => true) {
  let S;
  try { S = JSON.parse(localStorage.getItem(key) || 'null'); if (S && !valid(S)) S = null; } catch (e) { S = null; }
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
  APP = { cfg };
  applyPrefs();
  document.body.innerHTML = `<div class="app" id="app"><div id="view" style="display:contents"></div></div>`;
  const app = $('#app'), viewEl = $('#view');
  Object.assign(APP, { app, viewEl });
  app.addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g && app.contains(g)) { e.preventDefault(); go(g.dataset.go); return; }
    const b = e.target.closest('[data-back]'); if (b) { e.preventDefault(); back(b.dataset.back || null); return; }
    const a = e.target.closest('[data-act]'); if (a && app.contains(a)) { const f = ACTIONS[a.dataset.act]; if (f) f(a, e); return; }
    const l = e.target.closest('a[href^="#/"]'); if (l && app.contains(l)) { e.preventDefault(); const r = l.getAttribute('href').slice(2); if (l.classList.contains('tab')) tabGo(r, l); else go(r); }
  });
  app.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][tabindex]')) { e.preventDefault(); e.target.click(); } });
  return APP;
}
const ACTIONS = {};
export const actions = ACTIONS;
export const appEl = () => APP && APP.app;

/* view + transitions */
export function view(html, { tab = false, back = false, cls = '' } = {}) {
  const { viewEl, app } = APP;
  app.classList.toggle('has-tabs', !!tab);
  viewEl.innerHTML = html;
  const sc = viewEl.querySelector('.screen'); if (sc && back) sc.classList.add('back'); if (sc && cls) sc.classList.add(cls);
  return viewEl;
}
/* router (hash). Every entry carries its depth in history.state, so the in-app back button, the Android back key and
   reload agree: back pops one screen, and at depth 0 (home, or welcome when signed out) the browser leaves the app.
   An open sheet owns one extra entry so the back key closes it instead of leaving the screen. */
let HANDLER = null, LAST = null, D = 0, RESET = null;
export function router(handler) {
  HANDLER = handler;
  const s = history.state || {};
  D = typeof s.d === 'number' ? s.d : 0;
  if (s.sheet) history.replaceState({ d: D }, '');
  addEventListener('popstate', onPop);
  addEventListener('hashchange', () => { if (path() !== LAST) { history.replaceState({ d: D }, ''); render(); } });
  render(true);
}
function onPop(e) {
  const s = e.state;
  if (RESET) { const ps = RESET; RESET = null; D = 0; history.replaceState({ d: 0 }, '', '#/' + ps[0]); for (const p of ps.slice(1)) history.pushState({ d: ++D }, '', '#/' + p); render(); return; }
  const open = SHEET;
  if (s && s.sheet && !open) { history.back(); return; } // a sheet that was already closed in the UI: skip its entry
  const nd = s && typeof s.d === 'number' ? s.d : D + 1;
  if (!s) history.replaceState({ d: nd }, '');
  const isBack = nd < D; D = nd;
  if (open) { open.close(); if (path() === LAST) return; }
  if (path() === LAST) return;
  render(false, isBack);
}
export const path = () => decodeURIComponent(location.hash.replace(/^#\/?/, '')) || '';
export function go(p) { if (('#/' + p) === location.hash && !(history.state || {}).sheet) { render(); return; } history.pushState({ d: ++D }, '', '#/' + p); render(); }
export function replace(p) { history.replaceState({ d: D, sheet: undefined }, '', '#/' + p); render(); }
/** back to the root entry, which becomes paths[0]; any further paths are pushed on top of it (e.g. home, then a receipt). */
export function reset(...ps) { if (D > 0) { RESET = ps; history.go(-D); return; } history.replaceState({ d: 0 }, '', '#/' + ps[0]); for (const p of ps.slice(1)) history.pushState({ d: ++D }, '', '#/' + p); render(); }
export function back(fallback) { if (D > 0) history.back(); else replace(fallback || 'home'); }
export function render(first, isBack = false) {
  const p = path();
  LAST = p;
  closeSheet();
  const parts = p.split('/').filter(Boolean);
  HANDLER && HANDLER(parts, { path: p, dir: isBack ? 'back' : 'fwd', first: !!first, back: isBack });
}
export const rerender = () => render();
export const currentPath = () => LAST;

/* sheets + toast */
let SHEET = null;
const closeSheet = () => { if (SHEET) SHEET.close(); };
export function sheet(html, { onClose, cls = '' } = {}) {
  closeSheet();
  const { app } = APP;
  const scrim = document.createElement('div'); scrim.className = 'scrim';
  const sh = document.createElement('div'); sh.className = 'sheet ' + cls; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.tabIndex = -1;
  sh.innerHTML = `<span class="grab"></span>${html}`;
  app.appendChild(scrim); app.appendChild(sh);
  history.pushState({ d: ++D, sheet: 1 }, '');
  const api = { el: sh, close: () => { if (SHEET !== api) return; SHEET = null; scrim.remove(); sh.remove(); onClose && onClose(); } };
  SHEET = api;
  scrim.addEventListener('click', api.close);
  sh.addEventListener('keydown', e => { if (e.key === 'Escape') api.close(); });
  sh.addEventListener('click', e => { if (e.target.closest('[data-close]')) api.close(); });
  const f = sh.querySelector('button,input'); f && f.focus && f.focus({ preventScroll: true });
  return api;
}
/** PIN (or face) approval sheet, the same for every payment. Calls ok() once, however fast the taps come. */
export function pinSheet(ok, { pin, bio = false, onCancel } = {}) {
  let v = '', done = false;
  const finish = () => { if (done) return; done = true; sh.close(); ok(); };
  const sh = sheet(`<h3 style="text-align:center">${t('p.enter_pin')}</h3><div class="pin-dots" id="pd">${'<i></i>'.repeat(4)}</div><p class="hint" id="ph" style="text-align:center" aria-live="polite">${t('p.pin_h')}</p>${keypadHTML()}${bio ? `<button class="btn tonal block" id="bio"><span class="row" style="gap:10px">${ic('face-id')} ${t('p.use_face')}</span></button>` : ''}`, { onClose: () => { if (!done) { done = true; onCancel && onCancel(); } } });
  const dots = sh.el.querySelector('#pd'), ph = sh.el.querySelector('#ph');
  const bump = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  const kp = bindKeypad(sh.el.querySelector('.keypad'), { max: 4, onChange: async x => { v = x; bump(); if (v.length < 4) return; await sleep(160); if (done) return; if (v === pin()) finish(); else { dots.classList.add('err'); haptic(60); ph.textContent = t('p.wrong'); ph.style.color = 'var(--err)'; await sleep(420); dots.classList.remove('err'); kp.set(''); } } });
  const b = sh.el.querySelector('#bio'); if (b) b.addEventListener('click', async () => { if (b.disabled) return; b.disabled = true; b.classList.add('busy'); await sleep(700); finish(); });
  return sh;
}
export function toast(msg, icon = 'success-check') {
  const { app } = APP; const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`;
  app.appendChild(el); setTimeout(() => el.remove(), 2600);
}

/** scan-to-pay screen, the same in both apps: viewfinder, hint, nearby merchants as one-tap shortcuts */
export function scanView({ merch, end = '', onPick }) {
  view(`<div class="screen scan" style="animation:none"><div class="sc-in">
    <div class="topbar"><button class="iconbtn" data-back="home" aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button><h2>${t('c.scan')}</h2>${end}</div>
    <div class="vf-wrap"><div class="vf" role="img" aria-label="${t('q.point')}"><i class="c c1"></i><i class="c c2"></i><i class="c c3"></i><i class="c c4"></i><i class="ln"></i><span class="vf-ic">${ic('qr-scan', 'xl')}</span></div></div>
    <p class="vf-hint">${t('q.point')}</p>
    <div class="sec vf-near"><div class="eyebrow">${t('q.nearby')}</div><div class="grid2">${merch.map(m => `<button class="chip" data-m="${m.id}">${ic(m.ico, 'sm')} ${t(m.n)}</button>`).join('')}</div></div>
  </div></div>`);
  $$('[data-m]').forEach(b => b.addEventListener('click', () => { haptic(25); onPick(+b.dataset.m); }));
}

/* ------------------------------------------------------------------ keypad + PIN */
export function keypadHTML(opts = {}) {
  const k = ['1', '2', '3', '4', '5', '6', '7', '8', '9', opts.dec ? '.' : '', '0', 'del'];
  return `<div class="keypad" role="group" aria-label="keypad">${k.map(x => x === '' ? '<span></span>' : x === 'del' ? `<button class="o" data-k="del" aria-label="${t('c.delete')}">${ic('arrow-left')}</button>` : `<button data-k="${x}">${x}</button>`).join('')}</div>`;
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
/** Deterministic QR-style pattern (finder squares + pseudo-random modules); decorative, not an encoder. */
export function fakeQR(seed = 'code', n = 27) {
  let h = 2166136261; for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };
  const cell = 100 / (n + 2); let d = '';
  const finder = (x, y) => { d += `<rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${7 * cell}" height="${7 * cell}" rx="${cell * 1.2}" fill="none" stroke="currentColor" stroke-width="${cell}"/><rect x="${(x + 3) * cell}" y="${(y + 3) * cell}" width="${3 * cell}" height="${3 * cell}" rx="${cell * .6}" fill="currentColor"/>`; };
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() > 0.52) d += `<rect x="${(x + 1) * cell}" y="${(y + 1) * cell}" width="${cell * .92}" height="${cell * .92}" rx="${cell * .25}" fill="currentColor"/>`;
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${t('c.qr')}" style="width:100%;height:auto;display:block">${d}</svg>`;
}
export function confetti(host, n = 120, power = 1) {
  n = Math.min(n, 24); power = Math.min(power, .6);
  if (reduced()) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti-cv'; const r = host.getBoundingClientRect(); cv.width = r.width; cv.height = r.height; host.appendChild(cv);
  const g = cv.getContext('2d'), cs = getComputedStyle(document.documentElement);
  const col = [cs.getPropertyValue('--brand'), cs.getPropertyValue('--accent'), cs.getPropertyValue('--gold'), '#fff'].map(x => x.trim() || '#C2185B');
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
/** Cache every vendored ML asset so the identity check works with no network (Settings > Offline pack). */
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
  'c.now': ['now', 'الآن', 'à l’instant'], 'c.min_ago': ['{n} min ago', 'قبل {n} د', 'il y a {n} min'], 'c.h_ago': ['{n} h ago', 'قبل {n} س', 'il y a {n} h'], 'c.today': ['Today', 'اليوم', 'Aujourd’hui'], 'c.yesterday': ['Yesterday', 'أمس', 'Hier'],
  'c.delete': ['Delete', 'حذف', 'Effacer'], 'c.qr': ['QR code', 'رمز QR', 'Code QR'], 'c.scan': ['Scan to pay', 'امسح للدفع', 'Scanner pour payer'], 'c.copied': ['Copied', 'تم النسخ', 'Copié'],
  'c.back': ['Back', 'رجوع', 'Retour'], 'c.close': ['Close', 'إغلاق', 'Fermer'], 'c.continue': ['Continue', 'متابعة', 'Continuer'], 'c.done': ['Done', 'تم', 'Terminé'], 'c.cancel': ['Cancel', 'إلغاء', 'Annuler'], 'c.confirm': ['Confirm', 'تأكيد', 'Confirmer'], 'c.save': ['Save', 'حفظ', 'Enregistrer'], 'c.next': ['Next', 'التالي', 'Suivant'],
  'panel.light': ['Light', 'فاتح', 'Clair'], 'panel.dark': ['Dark', 'داكن', 'Sombre'],
});
