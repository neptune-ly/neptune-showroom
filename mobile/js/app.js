// Router, shell, boot.
import { $, $$, S, L, t, T, ic, icf, anim, kind, haptic, toast, sheet, runIn, reduced, MISSING, esc } from './util.js';

export const A = {};            // data-act handlers
const REG = {};                 // route registry
export const reg = (name, fn) => { REG[name] = fn };
export const R = { stack: [], tabs: ['home', 'accounts', 'cards', 'more'] };
const rtl = () => document.documentElement.dir === 'rtl';
let view, nav, appEl;
const seen = new Set(); const q = new URLSearchParams(location.search);

L([['Home', 'Accueil', 'الرئيسية'], ['Accounts', 'Comptes', 'الحسابات'], ['Pay', 'Payer', 'ادفع'], ['Cards', 'Cartes', 'البطاقات'], ['More', 'Plus', 'المزيد'], ['Back', 'Retour', 'رجوع'], ['Wallet', 'Portefeuille', 'المحفظة']]);

/* ---------- build a screen element ---------- */
function build(name, p) {
  const def = REG[name]; if (!def) throw new Error('no route ' + name);
  const d = def(p || {}); const el = document.createElement('section');
  el.className = 'screen' + (d.nav ? '' : ' nonav'); el.dataset.name = name; el.dataset.p = JSON.stringify(p || {});
  const first = d.skel && !seen.has(name) && q.get('skel') !== '0'; seen.add(name);
  const bar = d.bar === false ? '' : `<header class="topbar">${d.nav ? '' : `<button class="ibtn" data-back aria-label="${t('Back')}">${icf('arrow-left')}</button>`}<h1 class="ttl">${esc(d.title || '')}</h1><div class="tright">${d.right || '<span style="width:48px"></span>'}</div></header>`;
  el.innerHTML = `${bar}<div class="scroll">${first ? d.skel : d.body}</div>`;
  const sc = $('.scroll', el); sc.addEventListener('scroll', () => el.classList.toggle('scrolled', sc.scrollTop > 6), { passive: true });
  el._def = d; el._ready = () => { d.mount && d.mount(el, sc); runIn(sc); };
  el._swap = first ? () => { sc.classList.remove('in'); sc.innerHTML = d.body; el._ready() } : null;
  return el;
}
const dur = () => 520;

function setNav(tab) {
  const tp = R.stack[R.stack.length - 1]; document.documentElement.dataset.sb = tp && tp._def.sbHero ? 'hero' : '';
  const show = !!tab; nav.style.pointerEvents = show ? '' : 'none';
  anim(nav, [{ transform: nav.dataset.on === '1' ? 'none' : 'translateY(140%)', opacity: nav.dataset.on === '1' ? 1 : 0 }, show ? { transform: 'none', opacity: 1 } : { transform: 'translateY(140%)', opacity: 0 }], { duration: 380 });
  nav.dataset.on = show ? '1' : '0';
  $$('button', nav).forEach(b => b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'));
}
export function renderNav() {
  const ico = { home: 'home', accounts: 'wallet', cards: 'card', more: 'more-horizontal' }, lab = { home: 'Home', accounts: 'Accounts', cards: 'Cards', more: 'More' };
  const b = k => `<button data-tab="${k}" aria-label="${t(lab[k])}">${ic(ico[k])}<span class="l">${t(lab[k])}</span></button>`;
  nav.innerHTML = b('home') + b('accounts') + `<button class="qrb" data-go="qrpay" data-p='{"scheme":"lypay"}' aria-label="${t('Pay by QR')}"><i class="disc">${ic('qr-code')}</i></button>` + b('cards') + b('more');
}

/* ---------- navigation ---------- */
export function go(name, p, o = {}) {
  const el = build(name, p); const prev = R.stack[R.stack.length - 1]; R.stack.push(el); view.append(el);
  const s = rtl() ? -1 : 1; const D = o.instant ? 1 : dur();
  setNav(el._def.nav);
  if (prev && !o.instant) {
    anim(el, [{ transform: `translateX(${100 * s}%)` }, { transform: 'none' }], { duration: D });
    anim(prev, [{ transform: 'none' }, { transform: `translateX(${-20 * s}%)`, opacity: .7 }], { duration: D }).finished.then(() => { prev.style.visibility = 'hidden' });
  }
  setTimeout(() => { el._swap ? el._swap() : el._ready() }, el._swap ? 700 : (prev && !o.instant ? 140 : 0));
  haptic(6); return el;
}
export function back() {
  if (R.stack.length < 2) return; const el = R.stack.pop(), prev = R.stack[R.stack.length - 1]; const s = rtl() ? -1 : 1;
  prev.style.visibility = ''; setNav(prev._def.nav);
  anim(prev, [{ transform: `translateX(${-24 * s}%)`, opacity: .6 }, { transform: 'none', opacity: 1 }], { duration: dur() });
  anim(el, [{ transform: 'none' }, { transform: `translateX(${100 * s}%)` }], { duration: dur() * .8, easing: 'cubic-bezier(.3,0,.2,1)' }).finished.then(() => el.remove());
  haptic(6);
}
export function backTo(name) { while (R.stack.length > 1 && R.stack[R.stack.length - 1].dataset.name !== name) { const e = R.stack.pop(); e.remove() } const t0 = R.stack[R.stack.length - 1]; t0.style.visibility = ''; setNav(t0._def.nav) }
export function tab(name, o = {}) {
  const old = [...R.stack]; R.stack = []; const el = build(name, {}); R.stack.push(el); view.append(el); setNav(el._def.nav);
  if (!o.instant && old.length) { anim(el, [{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 480 }); old.forEach(e => anim(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' }).finished.then(() => e.remove())) } else old.forEach(e => e.remove());
  setTimeout(() => { el._swap ? el._swap() : el._ready() }, el._swap ? 700 : 60); return el;
}
export const top = () => R.stack[R.stack.length - 1];
export function rerender() { // language / look changes: rebuild every stacked screen in place
  renderNav(); R.stack.forEach((el, i) => { const n = el.dataset.name, p = JSON.parse(el.dataset.p); const sc0 = $('.scroll', el).scrollTop; const nw = build(n, p); nw.style.visibility = el.style.visibility; el.replaceWith(nw); R.stack[i] = nw; nw._def.skel && seen.add(n); const s = $('.scroll', nw); s.innerHTML = nw._def.body; nw._ready(); s.scrollTop = sc0 }); const tp = top(); if (tp) setNav(tp._def.nav) }

/* ---------- global events ---------- */
function bindGlobal() {
  appEl.addEventListener('click', e => {
    const tb = e.target.closest('[data-tab]'); if (tb && nav.contains(tb)) { if (top().dataset.name !== tb.dataset.tab) tab(tb.dataset.tab); else $('.scroll', top()).scrollTo({ top: 0, behavior: 'smooth' }); haptic(8); return }
    if (e.target.closest('[data-back]')) return back();
    const g = e.target.closest('[data-go]'); if (g) { go(g.dataset.go, g.dataset.p ? JSON.parse(g.dataset.p) : {}); return }
    const tt = e.target.closest('[data-tabgo]'); if (tt) { tab(tt.dataset.tabgo); return }
    const a = e.target.closest('[data-act]'); if (a && A[a.dataset.act]) { haptic(8); A[a.dataset.act](a, e) }
  });
  appEl.addEventListener('pointerdown', e => { if (e.target.closest('.btn,.row,.chip,.ibtn,.qa,.nav button,.tile-btn')) haptic(4) });
}

/* ---------- theme / look / lang ---------- */
const root = document.documentElement;
export function applyLang(l, silent) { S.lang = l; S.set('lang', l); root.lang = l; root.dir = l === 'ar' ? 'rtl' : 'ltr'; if (!silent && appEl) rerender() }
export function applyTheme(m) { S.theme = m; S.set('theme', m); root.dataset.odysseyMode = m; const mt = $('meta[name=theme-color]'); if (mt) mt.content = m === 'dark' ? '#06121D' : '#07315F' }

/* ---------- deep links for QA: ?go=route@{json} ---------- */
export function jump(r) {
  S.authed = true; if (r === 'login') { S.authed = false; return tab('login') }
  const m = { home: () => tab('home'), transfer: () => { tab('home'); go('transfer', { type: 'fast' }) }, lypay: () => { tab('home'); go('qrpay', { scheme: 'lypay' }) }, cards: () => tab('cards'), card: () => { tab('cards'); go('card', { id: 'c1' }) }, vouchers: () => { tab('home'); go('vouchers') }, services: () => { tab('home'); go('services') }, insights: () => { tab('home'); go('services'); go('insights') }, bills: () => { tab('home'); go('services'); go('bills') }, fx: () => { tab('home'); go('services'); go('fx') }, security: () => { tab('more'); go('security') }, assistant: () => { tab('more'); go('assistant') } };
  (m[r] || m.home)();
}

/* ---------- boot ---------- */
let deferred = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e });
export const canInstall = () => !!deferred; export const install = () => deferred && deferred.prompt();
export async function boot() {
  root.dataset.odysseyMode = S.theme; root.lang = S.lang; root.dir = S.lang === 'ar' ? 'rtl' : 'ltr';
  appEl = document.createElement('div'); appEl.className = 'app'; appEl.innerHTML = `<div id="view"></div><nav class="nav" aria-label="Main"></nav>`; document.body.append(appEl);
  view = $('#view', appEl); nav = $('.nav', appEl); nav.dataset.on = '0'; renderNav(); bindGlobal();
  applyTheme(S.theme);
  const go0 = q.get('go');
  if (q.get('auth') === '1' || go0) { S.authed = true; if (go0) { const [r, pj] = go0.split('@'); await jump0(r, pj) } else tab('home', { instant: true }) }
  else tab('login', { instant: true });
  if ('serviceWorker' in navigator && !q.get('nosw') && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  window.NM = { go, back, tab, jump, S, MISSING, R };
}
async function jump0(r, pj) { const p = pj ? JSON.parse(decodeURIComponent(pj)) : {}; const tabs = R.tabs; if (tabs.includes(r)) tab(r, { instant: true }); else { tab(p.root || 'home', { instant: true }); go(r, p, { instant: true }) } }
