// App kit: store, router (stack + tabs), sheets, toast, PIN step-up, keypad, success screen.
import { st, t, add, esc, ic, money, moneyT, numT, RM, runCounts, confetti, qrSvg, vegaLockup } from '../assets/core.js';

export const SCR = {};
export const reg = (name, def) => { SCR[name] = def; };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const nm = o => (o && typeof o === 'object') ? (st.lang === 'ar' ? o.ar : o.en) : o;
export const stack = [];
export const store = { hideBal: false, motion: true, tab: 'home', lastRef: 0, mode: 'personal' };
try { const q = new URLSearchParams(location.search).get('mode'); if (q === 'business' || q === 'personal') store.mode = q; else if (localStorage.getItem('vega.app.mode') === 'business') store.mode = 'business'; } catch (e) {}
export const setMode = m => { store.mode = m; try { localStorage.setItem('vega.app.mode', m); } catch (e) {} };
export const wait = ms => new Promise(r => setTimeout(r, RM() ? Math.min(ms, 30) : ms));
export const vp = () => $('#vp');
export const phone = () => $('#phone');

add({
  tab_home: 'Home§Accueil§الرئيسية', tab_activity: 'Activity§Activité§النشاط', tab_scan: 'Scan§Scanner§مسح', tab_grow: 'Pockets§Poches§الجيوب', tab_me: 'Me§Moi§حسابي',
  pin_title: 'Confirm with your PIN§Confirmez avec votre code PIN§أكّد برمز PIN', pin_sub: 'Enter any 4 digits (demo)§Saisissez 4 chiffres (démo)§أدخل أي 4 أرقام (عرض)', pin_bio: 'Use Face ID§Utiliser Face ID§استخدم بصمة الوجه',
  pin_bio_wait: 'Looking for your face…§Reconnaissance du visage…§جارٍ التعرّف على وجهك…',
  ref: 'Reference§Référence§المرجع', status: 'Status§Statut§الحالة', fee: 'Fee§Frais§الرسوم', total: 'Total§Total§الإجمالي', amount: 'Amount§Montant§المبلغ', from: 'From§De§من', to: 'To§À§إلى', date: 'Date§Date§التاريخ',
  free: 'Free§Gratuit§مجاني', share: 'Share§Partager§مشاركة', receipt: 'Receipt§Reçu§الإيصال', view_receipt: 'View receipt§Voir le reçu§عرض الإيصال', go_home: 'Back to home§Retour à l’accueil§العودة للرئيسية',
  completed: 'Completed§Terminé§مكتملة', pending: 'Pending§En attente§قيد المعالجة', failed: 'Failed§Échoué§فاشلة', instant: 'Instant§Instantané§فوري', wallet_main: 'Main wallet§Portefeuille principal§المحفظة الرئيسية',
  available: 'Available§Disponible§المتاح', copied: 'Copied§Copié§تم النسخ', saved_toast: 'Saved§Enregistré§تم الحفظ'
});

/* ---------- store: all fake, in-memory ---------- */
export function refNo(prefix = 'VG') { store.lastRef += 1; return `${prefix}-${(48210 + store.lastRef * 37 + 5).toString(36).toUpperCase()}${(7419 + store.lastRef * 13)}`; }

/* ---------- router ---------- */
const DUR = 460;
export function render(el, name, p) {
  const def = SCR[name];
  el.innerHTML = def.render(p, el);
  el._p = p;
}
function mountScr(el, name, p, first = true) {
  const def = SCR[name];
  if (el._ls) el._ls.forEach(([ty, f, o]) => el.removeEventListener(ty, f, o));
  el._ls = [];
  if (!el._patched) { const ad = el.addEventListener.bind(el); el.addEventListener = (ty, f, o) => { el._ls.push([ty, f, o]); ad(ty, f, o); }; el._patched = 1; }
  if (def.mount) def.mount(el, p);
  if (first && !RM() && def.skel !== false) {
    const sk = $$('[data-sk]', el);
    sk.forEach(x => x.classList.add('sk'));
    setTimeout(() => { sk.forEach(x => x.classList.remove('sk')); runCounts(el); }, 520);
  } else runCounts(el);
  $$('.rise', el).forEach((x, i) => x.style.setProperty('--i', i));
}
export function go(name, p = {}, { replaceTop = false } = {}) {
  const def = SCR[name]; if (!def) { console.error('no screen', name); return; }
  closeSheet();
  const el = document.createElement('section');
  el.className = 'scr ' + (def.tab ? 'tabroot' : 'enter'); el.dataset.name = name;
  el.setAttribute('aria-label', name);
  render(el, name, p);
  const prev = stack[stack.length - 1];
  if (replaceTop && prev) { prev.el.remove(); stack.pop(); }
  vp().appendChild(el); stack.push({ name, p, el });
  if (prev && !replaceTop) { prev.el.classList.add('under'); prev.el.inert = true; }
  syncChrome();
  mountScr(el, name, p);
  el.scrollTop = 0;
  const b = $('.body', el); if (b) b.scrollTop = 0;
  return el;
}
export function back() {
  if (stack.length < 2) return;
  const top = stack.pop(), prev = stack[stack.length - 1];
  closeSheet();
  top.el.classList.add('leaving');
  prev.el.classList.remove('under'); prev.el.inert = false;
  setTimeout(() => top.el.remove(), RM() ? 10 : DUR - 100);
  syncChrome();
}
export function tab(name) {
  closeSheet();
  store.tab = name;
  const old = stack.splice(0);
  old.forEach(o => { o.el.classList.add('fadeout'); setTimeout(() => o.el.remove(), RM() ? 10 : 220); });
  go(name, {});
  syncChrome();
}
export function resetToHome() { tab('home'); }
function syncChrome() {
  const top = stack[stack.length - 1]; if (!top) return;
  const def = SCR[top.name];
  const ph = phone();
  ph.classList.toggle('notabs', !def.tab);
  $$('.tb [data-tab]').forEach(b => b.setAttribute('aria-current', (b.dataset.tab === store.tab && def.tab) ? 'true' : 'false'));
  ph.dataset.screen = top.name;
}
export function rerenderAll() {
  stack.forEach(s => {
    const sc = $('.body', s.el)?.scrollTop || 0;
    render(s.el, s.name, s.p);
    mountScr(s.el, s.name, s.p, false);
    const b = $('.body', s.el); if (b) b.scrollTop = sc;
  });
  const sh = $('.sheet');
  if (sh && sh._re) sh._re();
  rebuildTabbar();
}
export function rerender(el) { const s = stack.find(x => x.el === el); if (!s) return; render(el, s.name, s.p); mountScr(el, s.name, s.p, false); }
export const refresh = () => { const s = stack[stack.length - 1]; if (!s) return; render(s.el, s.name, s.p); mountScr(s.el, s.name, s.p, false); };

/* ---------- common building blocks ---------- */
export const hdr = (title, { right = '', back: b = true, sub = '' } = {}) => `<header class="hd">${b ? `<button class="iconbtn fill" data-back aria-label="${t('back')}">${ic('chevron-left', 'flip')}</button>` : '<span class="hd-sp"></span>'}<span class="hd-end">${right}</span><h1 class="disp">${title}</h1>${sub ? `<p class="hd-sub muted">${sub}</p>` : ''}</header>`;
export const scr = (inner, { head = '', foot = '', cls = '' } = {}) => `${head}<div class="body ${cls}">${inner}</div>${foot ? `<footer class="foot">${foot}</footer>` : ''}`;
export const sectionHead = (title, link = '') => `<div class="sechead"><h2 class="disp">${title}</h2>${link}</div>`;
export const avatar = (name, i = 0, cls = '') => `<span class="lead round f${(i % 3) + 1} ${cls}">${esc(String(name).split(/\s+/).map(w => w[0]).join('').slice(0, 2))}</span>`;
export const row = ({ icon, lead, title, sub, end, go: g, p, cls = '', tag = 'button', act }) => `<${tag} class="item ${cls}" ${g ? `data-go="${g}" data-p='${JSON.stringify(p || {})}'` : ''} ${act ? `data-act="${act}"` : ''}>${lead || (icon ? `<span class="lead">${ic(icon)}</span>` : '')}<span class="sp"><span class="t">${title}</span>${sub ? `<span class="s" style="display:block">${sub}</span>` : ''}</span>${end ? `<span class="end">${end}</span>` : (g ? `<span class="muted">${ic('chevron-right', 'sm flip')}</span>` : '')}</${tag}>`;
export const switchEl = (id, on) => `<button class="switch" role="switch" aria-checked="${on}" data-sw="${id}"></button>`;

/* ---------- sheet + toast ---------- */
export function sheet(html, { onClose, cls = '', re } = {}) {
  closeSheet(true);
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.dataset.scrim = '';
  const sh = document.createElement('div'); sh.className = 'sheet ' + cls; sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true');
  sh.innerHTML = `<div class="grab"></div>${html}`; sh._onClose = onClose; sh._re = re;
  phone().append(sc, sh);
  requestAnimationFrame(() => { sc.classList.add('on'); sh.classList.add('on'); });
  return sh;
}
export function closeSheet(quick) {
  const sh = $('.sheet'), sc = $('.scrim'); if (!sh) return;
  const cb = sh._onClose; sh._onClose = null;
  if (quick) { sh.remove(); sc?.remove(); }
  else { sh.classList.remove('on'); sc?.classList.remove('on'); setTimeout(() => { sh.remove(); sc?.remove(); }, 320); }
  cb && cb();
}
export function toast(msg, icon = 'success-check') {
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `${ic(icon)}<span>${esc(msg)}</span>`; phone().appendChild(el);
  setTimeout(() => el.classList.add('out'), 2400); setTimeout(() => el.remove(), 2800);
}

/* ---------- PIN / biometric step-up ---------- */
export function pin(ok, { title = t('pin_title') } = {}) {
  let v = '';
  const sh = sheet(`<div class="pinsheet"><div class="pin-ic">${ic('lock', 'lg')}</div><h3 class="disp">${title}</h3><p class="muted small">${t('pin_sub')}</p>
    <div class="dots" aria-hidden="true">${[0, 1, 2, 3].map(i => `<i data-d="${i}"></i>`).join('')}</div>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-bio aria-label="${t('pin_bio')}">${ic('face-id')}</button><button data-k="0">0</button><button data-k="del" aria-label="Delete">${ic('chevron-left', 'sm flip')}</button></div>
    <p class="small b bio-msg" style="min-height:20px;text-align:center"></p></div>`, { cls: 'pinwrap' });
  const dots = () => $$('.dots i', sh).forEach((d, i) => d.classList.toggle('on', i < v.length));
  const fin = async () => { sh.classList.add('okp'); await wait(380); closeSheet(); await wait(250); ok(); };
  sh.addEventListener('click', e => {
    const k = e.target.closest('[data-k]'), b = e.target.closest('[data-bio]');
    if (k) { const x = k.dataset.k; if (x === 'del') v = v.slice(0, -1); else if (v.length < 4) v += x; dots(); if (v.length === 4) fin(); }
    if (b) { $('.bio-msg', sh).textContent = t('pin_bio_wait'); sh.classList.add('scan'); wait(1100).then(() => { v = '1234'; dots(); fin(); }); }
  });
  return sh;
}

/* ---------- amount keypad (minor units from digit string with 2 decimals) ---------- */
export const keypadHtml = () => `<div class="pad amtpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-k=".">.</button><button data-k="0">0</button><button data-k="del" aria-label="Delete">${ic('chevron-left', 'sm flip')}</button></div>`;
export function bindKeypad(el, onChange, init = '') {
  let s = init;
  const apply = () => onChange(s);
  el.addEventListener('click', e => {
    const k = e.target.closest('[data-k]'); if (!k) return;
    const x = k.dataset.k;
    if (x === 'del') s = s.slice(0, -1);
    else if (x === '.') { if (!s.includes('.')) s = (s || '0') + '.'; }
    else { if (s === '0') s = ''; if (s.includes('.') ? s.split('.')[1].length < 2 : s.length < 6) s += x; }
    apply();
  });
  apply();
  return { set(v) { s = v; apply(); }, get: () => s };
}
export const toMinor = s => Math.round(parseFloat(s || '0') * 100) || 0;
export const amtDisplay = s => { const [a, b] = (s || '0').split('.'); const w = numT(parseInt(a || '0', 10)); return `<span class="num">${w}${b !== undefined ? '.' + b.padEnd(0, '0') : ''}</span>`; };

/* ---------- success screen (confetti + drawn check) ---------- */
add({ sent_ok: 'Money sent§Argent envoyé§تم الإرسال', share_receipt: 'Share receipt§Partager le reçu§مشاركة الإيصال' });
export function successHtml({ title, amountMinor, sub = '', rows = [], actions = '' }) {
  return `<div class="body succ"><div class="succ-art"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring" cx="60" cy="60" r="52"/><circle class="pulse" cx="60" cy="60" r="52"/><path class="chk draw" pathLength="1" d="M36 62 54 80 86 42"/></svg></div>
  <h2 class="disp succ-t">${title}</h2>${amountMinor != null ? `<div class="succ-a disp">${money(amountMinor)}</div>` : ''}${sub ? `<p class="muted center">${sub}</p>` : ''}
  <div class="list succ-rows">${rows.map(([k, v]) => `<div class="item kv"><span class="muted">${k}</span><span class="b end">${v}</span></div>`).join('')}</div></div><footer class="foot">${actions}</footer>`;
}
export function showSuccess(opts) {
  const el = go('success', opts, { replaceTop: false });
  setTimeout(() => confetti(el), 250);
  return el;
}
reg('success', { skel: false, render: p => successHtml(p), mount: el => {} });

/* ---------- global delegation ---------- */
export function bindGlobal() {
  const ph = phone();
  ph.addEventListener('click', e => {
    const g = e.target.closest('[data-go]');
    if (g) { let p = {}; try { p = JSON.parse(g.dataset.p || '{}'); } catch (x) {} if (g.dataset.go === 'home') return tab('home'); if (SCR[g.dataset.go]?.tab) return tab(g.dataset.go); return go(g.dataset.go, p); }
    if (e.target.closest('[data-back]')) return back();
    const tb = e.target.closest('[data-tab]'); if (tb) { if (tb.dataset.tab === 'scan' || tb.dataset.tab === 'pos') return go(tb.dataset.tab); return tab(tb.dataset.tab); }
    if (e.target.closest('[data-home]')) return tab('home');
    if (e.target.closest('[data-scrim]')) return closeSheet();
    const cl = e.target.closest('[data-close]'); if (cl) return closeSheet();
    const sw = e.target.closest('.switch'); if (sw && !sw.dataset.own) sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true');
    const cp = e.target.closest('[data-copy]'); if (cp) { try { navigator.clipboard?.writeText(cp.dataset.copy); } catch (x) {} toast(t('copied'), 'copy'); }
  });
  ph.addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('.sheet')) closeSheet(); else back(); } });
}

/* ---------- tab bar ---------- */
export function rebuildTabbar() {
  const tb = $('.tb'); if (!tb) return;
  const hidden = $('#phone').classList.contains('notabs');
  const it = (id, icon, key) => `<button class="tbi" data-tab="${id}" aria-label="${t(key)}" aria-current="${store.tab === id && !hidden}"><span class="tbi-ic">${ic(icon)}</span><span class="tbi-l">${t(key)}</span></button>`;
  tb.innerHTML = store.mode === 'business'
    ? it('home', 'home', 'tab_home') + it('orders', 'receipt', 'b_orders') + it('pos', 'contactless', 'b_charge') + it('me', 'user', 'tab_me')
    : it('home', 'home', 'tab_home') + it('activity', 'statement', 'tab_activity') + it('scan', 'qr-code', 'tab_scan') + it('me', 'user', 'tab_me');
}

/* ---------- slide to confirm + processing overlay ---------- */
export const slideHtml = (label, icon = 'send') => `<div class="slide" role="button" tabindex="0" aria-label="${esc(label)}" data-slide><span class="slide-l">${esc(label)}</span><span class="slide-h">${ic(icon)}</span></div>`;
export function bindSlide(root, done) {
  const s = $('[data-slide]', root); if (!s) return;
  const h = $('.slide-h', s); let x0 = null, dx = 0, fin = false;
  const max = () => s.clientWidth - h.clientWidth - 8, rtl = () => document.documentElement.dir === 'rtl';
  const setX = v => { dx = Math.max(0, Math.min(max(), v)); h.style.transform = `translateX(${rtl() ? -dx : dx}px)`; s.style.setProperty('--p', dx / max()); };
  const finish = () => { if (fin) return; fin = true; s.classList.add('done'); setX(max()); setTimeout(done, 200); setTimeout(() => { fin = false; s.classList.remove('done'); h.style.transition = ''; setX(0); }, 900); };
  h.addEventListener('pointerdown', e => { x0 = e.clientX - (rtl() ? -dx : dx); h.setPointerCapture(e.pointerId); h.style.transition = 'none'; });
  h.addEventListener('pointermove', e => { if (x0 == null) return; setX(rtl() ? -(e.clientX - x0) : e.clientX - x0); });
  const up = () => { if (x0 == null) return; x0 = null; h.style.transition = ''; dx > max() * .8 ? finish() : setX(0); };
  h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); h.style.transition = ''; finish(); } });
  s.addEventListener('click', e => { if (e.target === s || e.target.classList.contains('slide-l')) { h.style.transition = ''; finish(); } });
}
add({ proc: 'Securing your payment…§Sécurisation du paiement…§جارٍ تأمين عمليتك…' });
export async function processing(text = t('proc'), ms = 1300) {
  const el = document.createElement('div'); el.className = 'proc'; el.setAttribute('role', 'status');
  el.innerHTML = `<div class="proc-in"><div class="spin"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="none" stroke="var(--look-brand)" stroke-width="5" stroke-linecap="round" stroke-dasharray="40 120"/></svg></div><p class="b">${text}</p></div>`;
  phone().appendChild(el); await wait(ms); el.classList.add('out'); await wait(260); el.remove();
}
