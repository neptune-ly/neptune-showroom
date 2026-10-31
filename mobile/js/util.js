// Shared helpers: state, i18n, formatting, motion, sheets, charts, QR.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ls = { g(k) { try { return localStorage.getItem(k) } catch (e) { return null } }, s(k, v) { try { localStorage.setItem(k, v) } catch (e) {} } };
const q = new URLSearchParams(location.search);
const ok = (v, list) => list.includes(v) ? v : null;

/* ---------- state ---------- */
export const S = {
  lang: ok(q.get('lang'), ['en', 'fr', 'ar']) || ok(ls.g('nm.lang'), ['en', 'fr', 'ar']) || 'en',
  theme: ok(q.get('theme'), ['light', 'dark']) || ok(ls.g('nm.theme'), ['light', 'dark']) || 'light',
  hide: ls.g('nm.hide') === '1',
  authed: false, frozen: {}, tok: { apple: true, google: false, samsung: false }, threeDS: true, online: true, contactless: true, intl: false,
  limits: { atm: 1500, pos: 8000, online: 4000 },
  goals: null, roundups: true, applock: true, notes: [], sentCount: 0,
  get(k) { return ls.g('nm.' + k) }, set(k, v) { ls.s('nm.' + k, v) }
};
export const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches && !q.get('motion');
export const kind = () => 'lively';

/* ---------- i18n: English text is the key; rows are [en, fr, ar] ---------- */
const DICT = { fr: {}, ar: {} }; export const MISSING = new Set();
export function L(rows) { rows.forEach(r => { DICT.fr[r[0]] = r[1]; DICT.ar[r[0]] = r[2] }) }
export function t(en, vars) {
  let s = S.lang === 'en' ? en : (DICT[S.lang][en]);
  if (s == null) { MISSING.add(en); s = en }
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);
  return s;
}
export const T = (en, fr, ar) => S.lang === 'fr' ? (fr ?? en) : S.lang === 'ar' ? (ar ?? en) : en; // inline trio
export const tx = a => Array.isArray(a) ? T(a[0], a[1], a[2]) : a;
export const MONTHS = { en: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '), fr: 'janv. févr. mars avr. mai juin juil. août sept. oct. nov. déc.'.split(' '), ar: 'يناير فبراير مارس أبريل مايو يونيو يوليو أغسطس سبتمبر أكتوبر نوفمبر ديسمبر'.split(' ') };
export const DAYS = { en: 'Sun Mon Tue Wed Thu Fri Sat'.split(' '), fr: 'dim. lun. mar. mer. jeu. ven. sam.'.split(' '), ar: 'الأحد الاثنين الثلاثاء الأربعاء الخميس الجمعة السبت'.split(' ') };

/* ---------- formatting (Western digits always) ---------- */
const nf = (d) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const num = (n, d = 3) => nf(d).format(n);
export const CUR = { LYD: ['LYD', 'LYD', 'د.ل'], USD: ['USD', 'USD', 'USD'], EUR: ['EUR', 'EUR', 'EUR'], GBP: ['GBP', 'GBP', 'GBP'], TRY: ['TRY', 'TRY', 'TRY'] };
export const cur = c => T(...(CUR[c] || [c, c, c]));
export const money = (n, c = 'LYD', d = 3) => `<span class="num">${num(n, d)}</span> <small class="cur">${cur(c)}</small>`;
export const moneyTxt = (n, c = 'LYD', d = 3) => `${num(n, d)} ${cur(c)}`;
export const today = new Date(); today.setHours(10, 24, 0, 0);
export const dAgo = n => { const d = new Date(today); d.setDate(d.getDate() - n); return d };
export function dateLbl(d, withYear) { const m = MONTHS[S.lang][d.getMonth()]; return S.lang === 'ar' ? `${d.getDate()} ${m}${withYear ? ' ' + d.getFullYear() : ''}` : `${d.getDate()} ${m}${withYear ? ' ' + d.getFullYear() : ''}` }
export function dayLbl(n) { if (n === 0) return t('Today'); if (n === 1) return t('Yesterday'); const d = dAgo(n); return `${DAYS[S.lang][d.getDay()]}, ${dateLbl(d)}` }
export const timeLbl = d => `<span class="num">${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</span>`;
export const mask = (s) => `<span class="num">•••• ${s}</span>`;
/* balance span: counted up on mount, masked if hidden */
export const dp = c => c === 'LYD' ? 3 : 2;
const split = (n, d) => { const s = num(n, d); const k = s.lastIndexOf('.'); return d ? [s.slice(0, k), s.slice(k)] : [s, ''] };
export function paintBal(b, v) { const d = +b.dataset.d || 0, i = b.querySelector('.i'), de = b.querySelector('.dec'); if (S.hide) { i.textContent = '••••••'; de.textContent = ''; return } const [a, c] = split(v == null ? +b.dataset.count : v, d); i.textContent = a; de.textContent = c }
export const bal = (n, c = 'LYD', d, opt = {}) => { d = d ?? dp(c || 'LYD'); const [a, e] = split(n, d); return `<span class="bal ${opt.cls || ''}" data-count="${n}" data-d="${d}"><span class="num"><span class="i">${S.hide ? '••••••' : a}</span><span class="dec">${S.hide ? '' : e}</span></span></span>${c ? ` <small class="cur">${cur(c)}</small>` : ''}`; };

const ICB = new URL('assets/icons/', document.baseURI).href;
export const ic = (n, c = '') => `<i class="ic ${c}" style="--i:url(${ICB}${n}.svg)"></i>`;
export const icf = (n, c = '') => ic(n, 'flip ' + c);
export const init = (name) => { const p = name.trim().split(/\s+/).filter(w => /\p{L}/u.test(w[0])); return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase() };

/* ---------- motion ---------- */
export function haptic(ms = 8) { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms) } catch (e) {} }
export const EASE_SPRING = () => 'linear(0,.009,.035 2.1%,.141 4.4%,.723 12.9%,.938 16.7%,1.017 19.4%,1.077 22.4%,1.121 25.7%,1.149 29.2%,1.159 33.4%,1.133 39.5%,1.056 49.4%,1.011 57.9%,.993 66%,.99 74.2%,1.001 87.4%,1)';
export function anim(el, kf, o = {}) { if (reduced()) { const last = kf[kf.length - 1]; Object.assign(el.style, last); return { finished: Promise.resolve() } } return el.animate(kf, { duration: 520, easing: EASE_SPRING(), fill: 'both', ...o }) }
export function countUp(el, dur = 800) {
  const to = parseFloat(el.dataset.count); if (isNaN(to) || !el.querySelector('.i')) return;
  if (S.hide || reduced()) { paintBal(el); return }
  const t0 = performance.now(); const ease = x => 1 - Math.pow(1 - x, 4);
  (function f(now) { if (S.hide) { paintBal(el); return } const p = Math.min(1, (now - t0) / dur); paintBal(el, to * ease(p)); if (p < 1) requestAnimationFrame(f) })(t0);
}
export function runIn(root) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.add('in'); $$('.bal', root).forEach(e => countUp(e)); $$('.chart', root).forEach(c => c.classList.add('go'));
  }));
}
export function confetti(host, n = 36) {
  if (reduced()) return;
  const cv = document.createElement('canvas'); cv.className = 'confetti'; host.appendChild(cv);
  const r = host.getBoundingClientRect(); const sc = host.offsetWidth / r.width || 1; cv.width = host.offsetWidth * 2; cv.height = host.offsetHeight * 2; const g = cv.getContext('2d'); g.scale(2, 2);
  const cs = getComputedStyle(document.documentElement); const pal = ['--look-brand', '--look-accent', '--look-field-1', '--look-field-2', '--look-field-3'].map(v => cs.getPropertyValue(v).trim()).concat(['#EB4E4D', '#3BC1EE', '#F9E87A', '#C9F3E8']);
  const W = host.offsetWidth, H = host.offsetHeight; const P = [];
  for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 6; P.push({ x: W / 2, y: H * .22, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 4, w: 4 + Math.random() * 3, h: 3 + Math.random() * 3, rot: Math.random() * 6, vr: (Math.random() - .5) * .4, c: pal[i % pal.length], life: 1, circ: Math.random() < .3 }) }
  let last = performance.now(); (function f(now) {
    const dt = Math.min(2, (now - last) / 16.7); last = now; g.clearRect(0, 0, W, H); let alive = 0;
    P.forEach(p => { p.vy += .32 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt; p.life -= .006 * dt; if (p.life > 0 && p.y < H + 20) { alive++; g.save(); g.globalAlpha = Math.min(1, p.life * 2); g.translate(p.x, p.y); g.rotate(p.rot); g.fillStyle = p.c; if (p.circ) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 7); g.fill() } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore() } });
    if (alive) requestAnimationFrame(f); else cv.remove();
  })(last);
}

/* ---------- toast & sheet (inside .app) ---------- */
const app = () => $('.app');
export function toast(msg, icon = 'success-check') {
  const old = $('.toast'); if (old) old.remove();
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`; app().appendChild(el);
  anim(el, [{ transform: 'translateY(-140%)' }, { transform: 'translateY(0)' }], { duration: 600 }); haptic(12);
  setTimeout(() => { anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-160%)' }], { duration: 260, easing: 'ease-in' }).finished.then(() => el.remove()) }, 2400);
}
export function sheet(html, o = {}) {
  const host = app(); const sc = document.createElement('div'); sc.className = 'scrim'; const sh = document.createElement('div'); sh.className = 'sheet'; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
  sh.innerHTML = `<div class="grab"></div><div class="sb">${html}</div>`; host.append(sc, sh); document.dispatchEvent(new Event('nm:sheet'));
  requestAnimationFrame(() => { sc.classList.add('on'); anim(sh, [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 560 }) });
  let closed = false;
  const close = (v) => { if (closed) return; closed = true; sc.classList.remove('on'); anim(sh, [{ transform: 'translateY(0)' }, { transform: 'translateY(105%)' }], { duration: 260, easing: 'cubic-bezier(.5,0,.8,.4)' }).finished.then(() => { sc.remove(); sh.remove(); document.dispatchEvent(new Event('nm:sheet')); o.onClose && o.onClose(v) }) };
  sc.addEventListener('click', () => close()); sh.addEventListener('click', e => { if (e.target.closest('[data-close]')) close(e.target.closest('[data-close]').dataset.close) });
  let y0 = null; const grab = $('.grab', sh); grab.style.touchAction = 'none';
  grab.addEventListener('pointerdown', e => { y0 = e.clientY; grab.setPointerCapture(e.pointerId) }); grab.addEventListener('pointermove', e => { if (y0 != null) sh.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)` }); grab.addEventListener('pointerup', e => { if (y0 != null && e.clientY - y0 > 90) close(); else sh.style.transform = ''; y0 = null });
  o.mount && o.mount(sh, close); return { el: sh, close };
}

/* ---------- charts (SVG strings; animate when ancestor gets .go) ---------- */
export function donut(parts, size = 168, w = 22) {
  const r = (size - w) / 2, C = 2 * Math.PI * r, tot = parts.reduce((a, p) => a + p.v, 0); let off = 0;
  const segs = parts.map((p, i) => { const len = C * p.v / tot, gap = 3; const s = `<circle class="sg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${p.c}" stroke-width="${w}" stroke-linecap="round" style="--len:${Math.max(0, len - gap)};--c:${C};--o:${-off};--i:${i}" stroke-dasharray="0 ${C}" stroke-dashoffset="${-off}"/>`; off += len; return s }).join('');
  return `<svg class="chart donut" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--look-field-1)" stroke-width="${w}" opacity=".5"/>${segs}</svg>`;
}
export function bars(vals, labels, h = 150, hi = -1) {
  const mx = Math.max(...vals); const w = 100 / vals.length;
  return `<div class="chart bars" style="height:${h}px">${vals.map((v, i) => `<div class="b${i === hi ? ' hi' : ''}" style="--h:${(v / mx * 100).toFixed(1)}%;--i:${i}"><i></i><span>${labels[i]}</span></div>`).join('')}</div>`;
}
export function line(vals, w = 340, h = 120, fill = true) {
  const mn = Math.min(...vals), mx = Math.max(...vals), pad = 8, step = (w - pad * 2) / (vals.length - 1);
  const pts = vals.map((v, i) => [pad + i * step, h - pad - (v - mn) / ((mx - mn) || 1) * (h - pad * 2)]);
  let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}` }
  const area = `${d} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h}Z`; const last = pts[pts.length - 1];
  return `<svg class="chart line" viewBox="0 0 ${w} ${h}" width="100%" style="height:auto;overflow:visible">${fill ? `<path class="area" d="${area}" fill="var(--look-brand)" fill-opacity=".14"/>` : ''}<path class="ln" d="${d}" pathLength="1" fill="none" stroke="var(--look-brand)" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle class="dotl" cx="${last[0]}" cy="${last[1]}" r="5" fill="var(--look-accent)" stroke="var(--look-surface)" stroke-width="2.5"/></svg>`;
}
export function spark(vals, up = true, w = 84, h = 32) {
  const mn = Math.min(...vals), mx = Math.max(...vals), step = w / (vals.length - 1);
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${(i * step).toFixed(1)},${(h - 3 - (v - mn) / ((mx - mn) || 1) * (h - 6)).toFixed(1)}`).join('');
  return `<svg class="chart line spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path class="ln" d="${d}" pathLength="1" fill="none" stroke="${up ? 'var(--ok)' : 'var(--bad)'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
export function ring(p, size = 64, w = 8, color = 'var(--look-brand)', inner = '') {
  const r = (size - w) / 2, C = 2 * Math.PI * r;
  return `<div class="chart ringw" style="width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" style="transform:rotate(-90deg)"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--look-field-1)" stroke-width="${w}"/><circle class="sg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0 ${C}" style="--len:${C * p};--c:${C};--i:0"/></svg><div class="in">${inner}</div></div>`;
}

/* ---------- decorative QR (not scannable; seeded) ---------- */
export function qrSvg(seed = 'x', n = 29, px = 8) {
  let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } const rnd = () => (h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909), ((h >>> 0) % 1000) / 1000);
  const m = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd() < .48));
  const fin = (x, y) => { for (let i = -1; i < 8; i++) for (let j = -1; j < 8; j++) { const a = x + i, b = y + j; if (a < 0 || b < 0 || a >= n || b >= n) continue; const e = i === -1 || j === -1 || i === 7 || j === 7; const ring = i === 0 || j === 0 || i === 6 || j === 6; const core = i >= 2 && i <= 4 && j >= 2 && j <= 4; m[b][a] = !e && (ring || core) } };
  fin(0, 0); fin(n - 7, 0); fin(0, n - 7);
  let r = ''; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" rx=".22"/>`;
  return `<svg viewBox="0 0 ${n} ${n}" width="${n * px}" height="${n * px}" fill="currentColor" shape-rendering="geometricPrecision" aria-label="QR">${r}</svg>`;
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const bmark = (rev = true) => `<img class="bmark" src="assets/brand/neptune-mark${rev ? '-reverse' : ''}.svg" alt="Neptune">`;
