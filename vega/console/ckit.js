// Console kit: router, table, drawer, modal, toast, palette helpers. Demonstration — simulated data.
import { st, t, add, esc, ic, RM, numT, money, countUp, runCounts, spark, lineChart, bars, donut, gauge, ring, short, fmtDate, fmtTime, initials, rng } from '../assets/core.js';

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const nm = o => (o && typeof o === 'object') ? (st.lang === 'ar' ? o.ar : o.en) : o;
export const PAGES = {};
export const page = (id, def) => { PAGES[id] = def; };
export const wait = ms => new Promise(r => setTimeout(r, RM() ? Math.min(ms, 20) : ms));
export const cur = { id: null, timers: [] };
export const every = (f, ms) => { const i = setInterval(f, ms); cur.timers.push(i); return i; };

add({
  c_all: 'All§Tous§الكل', c_search: 'Search§Rechercher§بحث', c_export: 'Export CSV§Exporter CSV§تصدير CSV', c_exported: 'Export queued — simulated§Export en file — simulé§أُضيف التصدير للطابور — محاكاة', c_filter: 'Filter§Filtrer§تصفية',
  c_of: 'of§sur§من', c_rows: 'rows§lignes§صفوف', c_prev: 'Previous§Précédent§السابق', c_next: 'Next§Suivant§التالي', c_none: 'Nothing matches these filters§Aucun résultat§لا نتائج مطابقة', c_density: 'Density§Densité§الكثافة',
  c_close: 'Close§Fermer§إغلاق', c_cancel: 'Cancel§Annuler§إلغاء', c_save: 'Save§Enregistrer§حفظ', c_apply: 'Apply§Appliquer§تطبيق', c_confirm: 'Confirm§Confirmer§تأكيد', c_done: 'Done§Terminé§تم',
  st_active: 'Active§Actif§نشط', st_frozen: 'Frozen§Gelé§مجمّد', st_review: 'In review§En revue§قيد المراجعة', st_closed: 'Closed§Clos§مغلق', st_done: 'Completed§Terminée§مكتملة', st_pending: 'Pending§En attente§معلّقة', st_failed: 'Failed§Échouée§فاشلة', st_reversed: 'Reversed§Annulée§معكوسة', st_onboarding: 'Onboarding§Intégration§قيد التفعيل', st_open: 'Open§Ouvert§مفتوح', st_resolved: 'Resolved§Résolu§تمت المعالجة',
  mk_pending: 'Awaiting a second approver§En attente d’un second approbateur§بانتظار موافقة مُراجع ثانٍ', mk_sub: 'Maker-checker: you cannot approve your own change§Quatre yeux : vous ne pouvez pas approuver votre propre changement§الموافقة المزدوجة: لا يمكنك الموافقة على تغييرك',
  demo_banner: 'Demonstration — simulated data. Nothing here is real.§Démonstration — données simulées. Rien n’est réel.§عرض توضيحي — بيانات محاكاة. لا شيء هنا حقيقي.'
});

/* ---------- router ---------- */
export function route() {
  const id = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('?')[0];
  const def = PAGES[id] || PAGES.dashboard;
  cur.timers.forEach(clearInterval); cur.timers = [];
  closeDrawer(true);
  cur.id = PAGES[id] ? id : 'dashboard';
  const host = $('#page');
  host.classList.remove('enter'); void host.offsetWidth; host.classList.add('enter');
  host.innerHTML = def.render();
  def.mount && def.mount(host);
  if (RM()) runCounts(host);
  else { const sk = $$('.kpi,.cx', host); sk.forEach(e => e.classList.add('sk')); setTimeout(() => { sk.forEach(e => e.classList.remove('sk')); runCounts(host); }, 460); }
  $$('[data-nav]').forEach(a => a.setAttribute('aria-current', a.dataset.nav === cur.id ? 'page' : 'false'));
  document.title = `${t('nav_' + cur.id)} — Vega Console`;
  const m = $('.main'); if (m) m.scrollTop = 0;
  host.focus({ preventScroll: true });
}
export const reRoute = () => route();

/* ---------- UI atoms ---------- */
export const badge = (kind, text) => `<span class="badge ${kind}">${text}</span>`;
export const stBadge = s => ({ active: 'ok', done: 'ok', open: 'warn', frozen: 'bad', failed: 'bad', review: 'warn', pending: 'warn', reversed: 'info', closed: '', onboarding: 'info', resolved: 'ok' }[s] !== undefined ? badge({ active: 'ok', done: 'ok', open: 'warn', frozen: 'bad', failed: 'bad', review: 'warn', pending: 'warn', reversed: 'info', closed: '', onboarding: 'info', resolved: 'ok' }[s], t('st_' + s)) : s);
export const av = (name, i = 0) => `<span class="av f${(i % 3) + 1}">${esc(initials(name))}</span>`;
export const head = (title, sub, actions = '') => `<div class="ph"><div class="ph-t"><h1 class="disp">${title}</h1>${sub ? `<p class="muted">${sub}</p>` : ''}</div><div class="ph-a">${actions}</div></div>`;
export const card = (title, body, { actions = '', cls = '', sub = '' } = {}) => `<section class="cx ${cls}">${title ? `<div class="cx-h"><div><h2 class="disp">${title}</h2>${sub ? `<p class="small muted">${sub}</p>` : ''}</div><div class="cx-a">${actions}</div></div>` : ''}${body}</section>`;
export const kpi = ({ label, value, dec = 0, pre = '', suf = '', delta, up = true, spark: sp, f = 1, icon }) => `<div class="kpi f${f}"><div class="kpi-t"><span class="small b">${label}</span>${icon ? `<span class="kpi-i">${ic(icon, 'sm')}</span>` : ''}</div><div class="kpi-v disp">${pre}<span class="num" data-count="${value}" data-dec="${dec}">0</span>${suf ? `<span class="cur">${suf}</span>` : ''}</div>${delta != null ? `<span class="badge ${up ? 'ok' : 'bad'}">${ic(up ? 'trending-up' : 'trending-down', 'sm')} <span class="num">${delta}</span></span>` : ''}${sp ? `<div class="kpi-s">${spark(sp, { w: 200, h: 42, color: 'currentColor' })}</div>` : ''}</div>`;
export const btn = (label, { cls = '', icon = '', act = '', attrs = '' } = {}) => `<button class="btn sm ${cls}" ${act ? `data-act="${act}"` : ''} ${attrs}>${icon ? ic(icon, 'sm') : ''}${label}</button>`;

/* ---------- toast ---------- */
export function toast(msg, icon = 'success-check') {
  const el = document.createElement('div'); el.className = 'ctoast'; el.setAttribute('role', 'status'); el.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`;
  $('#overlay').appendChild(el); setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3000);
}

/* ---------- drawer & modal ---------- */
export function drawer(html, { wide = false, onClose } = {}) {
  closeDrawer(true);
  const o = $('#overlay'), sc = document.createElement('div'); sc.className = 'dscrim'; sc.dataset.close = '';
  const d = document.createElement('aside'); d.className = 'drawer' + (wide ? ' wide' : ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d._onClose = onClose;
  d.innerHTML = `<button class="iconbtn dclose" data-close aria-label="${t('c_close')}">${ic('close')}</button><div class="dbody">${html}</div>`;
  o.append(sc, d); requestAnimationFrame(() => { sc.classList.add('on'); d.classList.add('on'); });
  const k = e => { if (e.key === 'Escape') closeDrawer(); }; document.addEventListener('keydown', k); d._k = k;
  setTimeout(() => $('.dclose', d)?.focus(), 60);
  runCounts(d);
  return d;
}
export function closeDrawer(now) {
  const d = $('.drawer'), s = $('.dscrim'); if (!d) return;
  document.removeEventListener('keydown', d._k); d._onClose && d._onClose();
  if (now) { d.remove(); s?.remove(); return; }
  d.classList.remove('on'); s?.classList.remove('on'); setTimeout(() => { d.remove(); s?.remove(); }, 320);
}
export function modal(html, { cls = '' } = {}) {
  const o = $('#overlay'), sc = document.createElement('div'); sc.className = 'mscrim'; sc.dataset.mclose = '';
  const m = document.createElement('div'); m.className = 'modal ' + cls; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.innerHTML = html;
  o.append(sc, m); requestAnimationFrame(() => { sc.classList.add('on'); m.classList.add('on'); });
  const close = () => { m.classList.remove('on'); sc.classList.remove('on'); setTimeout(() => { m.remove(); sc.remove(); }, 260); document.removeEventListener('keydown', k); };
  const k = e => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', k);
  sc.addEventListener('click', close); m.addEventListener('click', e => { if (e.target.closest('[data-mclose]')) close(); });
  m.close = close; return m;
}
document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDrawer(); });

/* ---------- data table ---------- */
export class Table {
  constructor(host, { cols, rows, pageSize = 10, search = [], filters = [], onRow, right = '', compact = false }) {
    Object.assign(this, { host, cols, rows, pageSize, search, filters, onRow, right });
    this.q = ''; this.f = {}; this.sort = null; this.page = 0; this.compact = compact;
    this.mount();
  }
  mount() {
    const h = this.host;
    h.innerHTML = `<div class="tbar"><label class="sbox">${ic('search', 'sm')}<input type="search" data-q placeholder="${t('c_search')}" aria-label="${t('c_search')}"></label>
      ${this.filters.map(f => `<label class="sel"><span class="sr">${f.label}</span><select data-f="${f.key}" aria-label="${f.label}"><option value="">${f.label}: ${t('c_all')}</option>${f.options.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>`).join('')}
      <span class="sp"></span>${this.right}<button class="iconbtn fill" data-dens aria-label="${t('c_density')}" aria-pressed="${this.compact}">${ic('menu', 'sm')}</button></div><div class="twrap"><table class="tbl ${this.compact ? 'compact' : ''}"></table></div><div class="pager"></div>`;
    $('[data-q]', h).addEventListener('input', e => { this.q = e.target.value.toLowerCase(); this.page = 0; this.draw(); });
    $$('[data-f]', h).forEach(s => s.addEventListener('change', () => { this.f[s.dataset.f] = s.value; this.page = 0; this.draw(); }));
    $('[data-dens]', h).addEventListener('click', e => { this.compact = !this.compact; e.currentTarget.setAttribute('aria-pressed', this.compact); $('.tbl', h).classList.toggle('compact', this.compact); });
    h.addEventListener('click', e => {
      const th = e.target.closest('th[data-s]'); if (th) { const k = th.dataset.s; this.sort = this.sort && this.sort.k === k ? { k, d: -this.sort.d } : { k, d: 1 }; this.draw(); return; }
      const pg = e.target.closest('[data-pg]'); if (pg) { this.page += +pg.dataset.pg; this.draw(); return; }
      const tr = e.target.closest('tr[data-i]'); if (tr && this.onRow && !e.target.closest('button,a,input,.switch')) this.onRow(this.rows[+tr.dataset.i], +tr.dataset.i);
    });
    h.addEventListener('keydown', e => { if (e.key === 'Enter') { const tr = e.target.closest('tr[data-i]'); if (tr && this.onRow) this.onRow(this.rows[+tr.dataset.i]); } });
    this.draw();
  }
  view() {
    let r = this.rows.map((x, i) => ({ x, i }));
    if (this.q) r = r.filter(({ x }) => this.search.some(k => String(typeof k === 'function' ? k(x) : x[k]).toLowerCase().includes(this.q)));
    Object.entries(this.f).forEach(([k, v]) => { if (v) r = r.filter(({ x }) => String(x[k]) === v); });
    if (this.sort) { const c = this.cols.find(c => c.k === this.sort.k), g = c.sort || (x => x[c.k]); r.sort((a, b) => { const A = g(a.x), B = g(b.x); return (A > B ? 1 : A < B ? -1 : 0) * this.sort.d; }); }
    return r;
  }
  draw() {
    const v = this.view(), n = v.length, pages = Math.max(1, Math.ceil(n / this.pageSize)); this.page = Math.min(this.page, pages - 1);
    const sl = v.slice(this.page * this.pageSize, (this.page + 1) * this.pageSize), h = this.host;
    $('.tbl', h).innerHTML = `<thead><tr>${this.cols.map(c => `<th ${c.sort || c.sortable ? `data-s="${c.k}" aria-sort="${this.sort?.k === c.k ? (this.sort.d > 0 ? 'ascending' : 'descending') : 'none'}"` : ''} class="${c.al || ''}">${c.label}${this.sort?.k === c.k ? `<i class="srt">${this.sort.d > 0 ? '▲' : '▼'}</i>` : ''}</th>`).join('')}</tr></thead><tbody>${sl.length ? sl.map(({ x, i }) => `<tr data-i="${i}" ${this.onRow ? 'tabindex="0" class="clk"' : ''}>${this.cols.map(c => `<td class="${c.al || ''}">${c.r ? c.r(x) : esc(x[c.k])}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${this.cols.length}" class="center muted" style="padding:36px">${t('c_none')}</td></tr>`}</tbody>`;
    $('.pager', h).innerHTML = `<span class="small muted"><span class="num">${n ? this.page * this.pageSize + 1 : 0}–${Math.min(n, (this.page + 1) * this.pageSize)}</span> ${t('c_of')} <span class="num">${n}</span></span><span class="row"><button class="iconbtn fill" data-pg="-1" ${this.page === 0 ? 'disabled' : ''} aria-label="${t('c_prev')}">${ic('chevron-left', 'sm flip')}</button><span class="small b num">${this.page + 1}/${pages}</span><button class="iconbtn fill" data-pg="1" ${this.page >= pages - 1 ? 'disabled' : ''} aria-label="${t('c_next')}">${ic('chevron-right', 'sm flip')}</button></span>`;
  }
}

/* chart hover tooltips for lineChart() */
export function chartTips(host, series, labels, fmt = v => numT(v)) {
  const tip = document.createElement('div'); tip.className = 'ctip'; host.style.position = 'relative'; host.appendChild(tip);
  host.addEventListener('mousemove', e => { const r = e.target.closest('.hv'); if (!r) { tip.classList.remove('on'); return; } const i = +r.dataset.i, b = host.getBoundingClientRect(); tip.innerHTML = `<b>${labels[i]}</b>${series.map((s, k) => `<span><i style="background:${['var(--look-brand)', 'var(--look-accent)'][k]}"></i>${fmt(s[i])}</span>`).join('')}`; tip.style.left = Math.min(b.width - 130, Math.max(0, e.clientX - b.left + 12)) + 'px'; tip.style.top = (e.clientY - b.top - 56) + 'px'; tip.classList.add('on'); });
  host.addEventListener('mouseleave', () => tip.classList.remove('on'));
}
add({ total: 'Total§Total§الإجمالي' });
