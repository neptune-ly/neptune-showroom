// Vega showroom core: state, i18n (EN/FR/AR), formatting (Western digits), icons, motion helpers, fake QR, charts.
// Demonstration — simulated data. No network, no backend.
export const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
export const BASE = new URL('./', import.meta.url).href;
const IDX = { en: 0, fr: 1, ar: 2 };
export const DICT = {};
export const add = o => Object.assign(DICT, o);
export const st = { lang: 'en', theme: 'light', look: 'classic', cur: 'LYD', product: 'app' };
const LIVELY = ['fintech', 'vibrant', 'telco'];
export const isLively = () => LIVELY.includes(st.look);
export const tenantName = () => st.tenant || window.Looks.list.find(l => l.id === st.look).name;

export function t(k, p) {
  const e = DICT[k];
  if (e == null) { console.warn('[i18n] missing', k); return k; }
  const a = e.split('§');
  let s = a[IDX[st.lang]] || a[0];
  if (p) s = s.replace(/\{(\w+)\}/g, (_, n) => (p[n] ?? ''));
  return s;
}
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ic = (n, c = '') => `<span class="ic ${c}" style="--i:url(${BASE}icons/${n}.svg)" aria-hidden="true"></span>`;
export const RM = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off';
export const loc = () => ({ en: 'en-GB-u-nu-latn', fr: 'fr-FR-u-nu-latn', ar: 'ar-EG-u-nu-latn' }[st.lang]);

/* ---------- boot: URL params > per-product storage > defaults ---------- */
export function boot({ product, defaultLook, defaultTheme = 'light', defaultLang = 'en' }) {
  st.product = product;
  const q = new URLSearchParams(location.search);
  const K = k => `vega.${product}.${k}`;
  const ok = (v, list) => list.includes(v) ? v : null;
  st.lang = ok(q.get('lang'), ['en', 'fr', 'ar']) || ok(LS.get(K('lang')), ['en', 'fr', 'ar']) || defaultLang;
  st.theme = ok(q.get('theme'), ['light', 'dark']) || ok(LS.get(K('theme')), ['light', 'dark']) || defaultTheme;
  const ids = window.Looks.list.map(l => l.id);
  st.look = ok(q.get('look'), ids) || ok(LS.get(K('look')), ids) || defaultLook;
  window.Looks.set(st.look, true);
  if (q.get('motion') === 'off') document.documentElement.dataset.motion = 'off';
  applyRoot();
  document.addEventListener('looks:change', e => { st.look = e.detail.id; LS.set(K('look'), st.look); applyRoot(); emit(); });
}
const K = k => `vega.${st.product}.${k}`;
export function applyRoot() {
  const r = document.documentElement;
  r.lang = st.lang; r.dir = st.lang === 'ar' ? 'rtl' : 'ltr';
  r.dataset.odysseyMode = st.theme; r.dataset.look = st.look; r.dataset.kind = isLively() ? 'lively' : 'sober';
  const lk = window.Looks.list.find(l => l.id === st.look);
  const m = document.querySelector('meta[name=theme-color]'); if (m && lk) m.content = st.theme === 'dark' ? '#0B0D12' : lk.brand;
}
export function setLang(l) { st.lang = l; LS.set(K('lang'), l); applyRoot(); emit(); }
export function setTheme(m) { st.theme = m; LS.set(K('theme'), m); applyRoot(); emit(); }
export function setLook(id) { window.Looks.set(id); }
let listeners = [];
export const onChange = f => listeners.push(f);
function emit() { listeners.forEach(f => f()); }

/* ---------- formatting ---------- */
export function numT(n, dec = 0) {
  let s = Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  if (st.lang === 'fr') s = s.replace(/,/g, ' ').replace('.', ',');
  return (n < 0 ? '−' : '') + s;
}
export function moneyT(minor, { sign = false, dec = 2 } = {}) {
  const s = numT(Math.abs(minor) / 100, dec);
  return (minor < 0 ? '−' : sign ? '+' : '') + s;
}
export function money(minor, { cur = st.cur, sign = false, dec = 2, nocur = false } = {}) {
  const s = moneyT(minor, { sign, dec }), m = s.match(/^(.*?)([.,]\d{2,3})$/);
  return `<span class="num">${m ? `${m[1]}<span class="dim">${m[2]}</span>` : s}</span>${nocur ? '' : `<span class="cur">${cur}</span>`}`;
}
export const num = (n, dec = 0) => `<span class="num">${numT(n, dec)}</span>`;
export function short(n) { // compact 12.4K / 1.2M
  const a = Math.abs(n);
  const s = a >= 1e6 ? (a / 1e6).toFixed(1) + 'M' : a >= 1e3 ? (a / 1e3).toFixed(a >= 1e4 ? 0 : 1) + 'K' : String(Math.round(a));
  return (n < 0 ? '−' : '') + s;
}
export const NOW = new Date();
export const dayOff = (d, h = 12, m = 0) => { const x = new Date(NOW); x.setDate(x.getDate() - d); x.setHours(h, m, 0, 0); return x; };
export const fmtDate = (d, o = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat(loc(), o).format(d);
export const fmtTime = d => new Intl.DateTimeFormat(loc(), { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
export function dayLabel(d) {
  const diff = Math.round((new Date(NOW).setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
  return diff === 0 ? t('today') : diff === 1 ? t('yesterday') : fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' });
}
export const initials = s => String(s).split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ---------- motion helpers ---------- */
export function countUp(el, to, { dur = 1000, dec = 2, from = 0, prefix = '' } = {}) {
  if (!el) return;
  const fin = () => { el.textContent = prefix + numT(to, dec); };
  if (RM()) return fin();
  const t0 = performance.now();
  const step = n => {
    const p = Math.min(1, (n - t0) / dur), e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    el.textContent = prefix + numT(from + (to - from) * e, dec);
    if (p < 1) requestAnimationFrame(step); else fin();
  };
  requestAnimationFrame(step);
}
export function runCounts(root) {
  root.querySelectorAll('[data-count]').forEach(el => {
    const to = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec ?? 0, 10);
    countUp(el, to, { dec, dur: +(el.dataset.dur || 1000), prefix: el.dataset.prefix || '' });
  });
}
export function confetti(host, { n = 110, force = false } = {}) {
  if (RM() || !force) return; // calm brief: celebration is opt-in only
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--look-brand', '--look-accent', '--look-field-1', '--look-field-2', '--look-field-3'].map(v => cs.getPropertyValue(v).trim()).filter(Boolean);
  cols.push('#F9E87A', '#EB4E4D', '#3BC1EE');
  const c = document.createElement('canvas'); c.className = 'confetti'; host.appendChild(c);
  const r = host.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
  c.width = r.width * dpr; c.height = r.height * dpr;
  const x = c.getContext('2d'); x.scale(dpr, dpr);
  const ps = Array.from({ length: n }, () => ({
    x: r.width / 2, y: r.height * .38, vx: (Math.random() - .5) * 15, vy: -Math.random() * 15 - 5, g: .38 + Math.random() * .2,
    s: 5 + Math.random() * 7, a: Math.random() * 6, va: (Math.random() - .5) * .45, c: cols[(Math.random() * cols.length) | 0], sh: Math.random() < .35, life: 1
  }));
  let f = 0;
  (function tick() {
    x.clearRect(0, 0, r.width, r.height); f++;
    ps.forEach(p => {
      p.vy += p.g; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.a += p.va; if (f > 70) p.life -= .02;
      x.save(); x.globalAlpha = Math.max(0, p.life); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c;
      if (p.sh) { x.beginPath(); x.arc(0, 0, p.s / 2, 0, 7); x.fill(); } else x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      x.restore();
    });
    if (f < 160) requestAnimationFrame(tick); else c.remove();
  })();
}

/* ---------- seeded PRNG + fake QR (decorative only; not scannable) ---------- */
export function rng(seed) { let s = 0; for (const ch of String(seed)) s = (s * 31 + ch.charCodeAt(0)) >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function qrSvg(seed, { size = 220, fg = 'currentColor', n = 29, logo = true } = {}) {
  const R = rng(seed), g = Array.from({ length: n }, () => Array.from({ length: n }, () => R() < .48));
  const finder = (ox, oy) => { for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) { const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= n || Y >= n) continue; const edge = x === 0 || x === 6 || y === 0 || y === 6, core = x >= 2 && x <= 4 && y >= 2 && y <= 4; g[Y][X] = (x >= 0 && x <= 6 && y >= 0 && y <= 6) && (edge || core); } };
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  if (logo) for (let y = n / 2 - 3 | 0; y < n / 2 + 3; y++) for (let x = n / 2 - 3 | 0; x < n / 2 + 3; x++) g[y][x] = false;
  let d = '';
  g.forEach((row, y) => row.forEach((on, x) => { if (on) d += `M${x} ${y}h1v1h-1z`; }));
  const c = n / 2;
  return `<svg viewBox="0 0 ${n} ${n}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="QR code (simulated)"><path d="${d}" fill="${fg}"/>${logo ? `<g transform="translate(${c - 2.5} ${c - 2.5})"><rect width="5" height="5" rx="1.2" fill="var(--look-brand)"/><path d="M1.1 1.4 2.5 3.8 3.9 1.4" stroke="var(--look-on-brand)" stroke-width=".55" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>` : ''}</svg>`;
}

/* ---------- inline SVG charts (animated with CSS classes) ---------- */
const smooth = pts => pts.map((p, i) => { if (!i) return `M${p[0]} ${p[1]}`; const q = pts[i - 1], cx = (q[0] + p[0]) / 2; return `C${cx} ${q[1]} ${cx} ${p[1]} ${p[0]} ${p[1]}`; }).join('');
export function spark(vals, { w = 160, h = 48, color = 'currentColor', fill = true, sw = 2.5, dot = true } = {}) {
  const mn = Math.min(...vals), mx = Math.max(...vals), pad = sw + 3;
  const pts = vals.map((v, i) => [pad + (w - pad * 2) * i / (vals.length - 1), pad + (h - pad * 2) * (1 - (v - mn) / ((mx - mn) || 1))]);
  const id = 'g' + Math.random().toString(36).slice(2, 7), p = smooth(pts), last = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true">
  ${fill ? `<path class="areafade" d="${p}L${w - pad} ${h}L${pad} ${h}Z" fill="${color}" fill-opacity=".14"/>` : ''}<path class="draw" pathLength="1" d="${p}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
}
export function donut(items, { size = 180, thick = 22, center = '' } = {}) {
  const r = (size - thick) / 2, C = 2 * Math.PI * r, tot = items.reduce((a, b) => a + b.v, 0); let off = 0;
  const segs = items.map((it, i) => { const len = C * it.v / tot, gap = 3; const s = `<circle class="dseg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${it.c}" stroke-width="${thick}" stroke-linecap="round" stroke-dasharray="${Math.max(0, len - gap)} ${C}" style="--len:${len};--off:${-off};animation-delay:${i * 90}ms" transform="rotate(-90 ${size / 2} ${size / 2})"/>`; off += len; return s; }).join('');
  return `<div class="donut" style="position:relative;width:${size}px;height:${size}px"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--cont)" stroke-width="${thick}"/>${segs}</svg><div style="position:absolute;inset:0;display:grid;place-items:center;text-align:center">${center}</div></div>`;
}
export function bars(vals, labels, { h = 140, color = 'var(--look-brand)', hi = -1, accent = 'var(--look-accent)' } = {}) {
  const mx = Math.max(...vals), n = vals.length, W = 300, bw = W / n * .56;
  return `<svg viewBox="0 0 ${W} ${h + 24}" width="100%" aria-hidden="true">${[0, .5, 1].map(f => `<line x1="0" x2="${W}" y1="${h - h * f}" y2="${h - h * f}" stroke="var(--line)" stroke-dasharray="3 5"/>`).join('')}${vals.map((v, i) => { const bh = Math.max(4, v / mx * (h - 6)), x = W / n * i + (W / n - bw) / 2; return `<rect class="growy" style="animation-delay:${i * 60}ms" x="${x}" y="${h - bh}" width="${bw}" height="${bh}" rx="${Math.min(8, bw / 2)}" fill="${i === hi ? accent : color}" opacity="${i === hi ? 1 : .88}"/><text x="${x + bw / 2}" y="${h + 17}" text-anchor="middle" font-size="10.5" fill="var(--muted)" font-family="Hanken Grotesk,sans-serif">${labels[i]}</text>`; }).join('')}</svg>`;
}
export function lineChart(series, labels, { w = 640, h = 220, colors = ['var(--look-brand)', 'var(--look-accent)'], area = true } = {}) {
  const all = series.flat(), mx = Math.max(...all) * 1.08, mn = 0, px = 40, py = 14, id = 'lc' + Math.random().toString(36).slice(2, 6);
  const X = i => px + (w - px - 10) * i / (labels.length - 1), Y = v => py + (h - py - 26) * (1 - (v - mn) / (mx - mn || 1));
  const grid = [0, .25, .5, .75, 1].map(f => { const y = py + (h - py - 26) * f; return `<line x1="${px}" x2="${w - 10}" y1="${y}" y2="${y}" stroke="var(--line)" stroke-dasharray="3 5"/><text x="${px - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="var(--muted)" font-family="Hanken Grotesk">${short(mx * (1 - f))}</text>`; }).join('');
  const ls = series.map((s, k) => { const pts = s.map((v, i) => [X(i), Y(v)]), p = smooth(pts); return `${area && k === 0 ? `<path class="areafade" d="${p}L${X(s.length - 1)} ${h - 26}L${px} ${h - 26}Z" fill="${colors[k]}" fill-opacity=".14"/>` : ''}<path class="draw" pathLength="1" d="${p}" fill="none" stroke="${colors[k]}" stroke-width="2.6" stroke-linecap="round"/>`; }).join('');
  const xl = labels.map((l, i) => (labels.length > 14 && i % 2) ? '' : `<text x="${X(i)}" y="${h - 6}" text-anchor="middle" font-size="10.5" fill="var(--muted)" font-family="Hanken Grotesk">${l}</text>`).join('');
  const hov = labels.map((l, i) => `<rect class="hv" data-i="${i}" x="${X(i) - (w - px) / labels.length / 2}" y="0" width="${(w - px) / labels.length}" height="${h - 20}" fill="transparent"><title>${l}: ${series.map(s => numT(s[i])).join(' / ')}</title></rect>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="chart">${grid}${ls}${xl}${hov}</svg>`;
}
export function gauge(pct, { size = 120, thick = 12, color = 'var(--look-brand)', label = '' } = {}) {
  const r = (size - thick) / 2, C = Math.PI * r;
  return `<div style="position:relative;width:${size}px;height:${size / 2 + 14}px"><svg viewBox="0 0 ${size} ${size / 2 + 8}" width="${size}"><path d="M${thick / 2} ${size / 2} A${r} ${r} 0 0 1 ${size - thick / 2} ${size / 2}" fill="none" stroke="var(--cont-hi)" stroke-width="${thick}" stroke-linecap="round"/><path class="dseg" d="M${thick / 2} ${size / 2} A${r} ${r} 0 0 1 ${size - thick / 2} ${size / 2}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="round" stroke-dasharray="${C}" style="--len:${C};--off:${C * (1 - pct / 100)}"/></svg><div style="position:absolute;inset-inline:0;bottom:0;text-align:center;font:700 20px var(--display)"><span class="num">${label || pct + '%'}</span></div></div>`;
}
export function ring(pct, { size = 72, thick = 9, color = 'var(--look-brand)', inner = '' } = {}) {
  const r = (size - thick) / 2, C = 2 * Math.PI * r;
  return `<div style="position:relative;width:${size}px;height:${size}px;flex:none"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--cont-hi)" stroke-width="${thick}"/><circle class="dseg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="round" stroke-dasharray="${C}" style="--len:${C};--off:${C * (1 - pct / 100)}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><div style="position:absolute;inset:0;display:grid;place-items:center;font-weight:700;font-size:${size / 4.6}px">${inner || `<span class="num">${Math.round(pct)}%</span>`}</div></div>`;
}

/* ---------- Vega mark + lockup (invented product mark; Neptune logos are used unmodified elsewhere) ---------- */
export const vegaMark = (c1 = 'currentColor') => `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 8.5 16 25 27 8.5" fill="none" stroke="${c1}" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="6.2" r="2.7" fill="var(--look-accent)"/></svg>`;
export const vegaLockup = (sub = true) => `<span class="vmark">${vegaMark()}<span><b>Vega</b>${sub ? `<small>by Neptune</small>` : ''}</span></span>`;
export const neptuneLogo = (cls = 'logo-img') => `<img class="${cls} lg-color" src="${BASE}brand/Neptune_Logo_Color.png" alt="Neptune"><img class="${cls} lg-rev" src="${BASE}brand/Neptune_Logo_Reverse.png" alt="Neptune">`;

/* shared dictionary entries (en§fr§ar) */
add({
  today: 'Today§Aujourd’hui§اليوم', yesterday: 'Yesterday§Hier§أمس', demo_label: 'Demonstration — simulated data§Démonstration — données simulées§عرض توضيحي — بيانات محاكاة',
  language: 'Language§Langue§اللغة', theme: 'Theme§Thème§المظهر', look: 'Brand look§Identité visuelle§الهوية البصرية', light: 'Light§Clair§فاتح', dark: 'Dark§Sombre§داكن',
  cancel: 'Cancel§Annuler§إلغاء', confirm: 'Confirm§Confirmer§تأكيد', done: 'Done§Terminé§تم', back: 'Back§Retour§رجوع', next: 'Continue§Continuer§متابعة', close: 'Close§Fermer§إغلاق', save: 'Save§Enregistrer§حفظ', search: 'Search§Rechercher§بحث', all: 'All§Tout§الكل'
});
