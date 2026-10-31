// Lumo Pay: SIM/eSIM-linked wallet inside the Lumo mobile operator. Identity check on the device, then wallet, bundles, vouchers, bills, QR, cards, rewards.
// State in localStorage ("telco.mobile.v2").
import * as C from '../shared/core.js';
import * as OBN from '../shared/onboarding.js';
import * as VCH from '../shared/vouchers.js';
import * as SET from '../shared/settings.js';
import './strings.js';
const { heroBar, t, ic, esc, loc, money, moneyT, fmtN, fdate, ago, go, view, sheet, toast, haptic, sleep, confetti, ring, bars, fakeQR, msisdn, countUp, int, keypadHTML, bindKeypad, lockup, byDay } = C;
const DAY = 864e5;

const OP = { name: { en: 'Lumo Telecom', ar: 'لومو للاتصالات', fr: 'Lumo Telecom' }, app: { en: 'Lumo Pay', ar: 'لومو باي', fr: 'Lumo Pay' }, short: { en: 'Lumo', ar: 'لومو', fr: 'Lumo' }, number: '+218915550142' };

/* brand mark: an L drawn as a tide line, with the light (amber orb) and its rings */
let MK = 0;
const markBody = (ink = 'currentColor') => { const i = 'lm' + (++MK); return `<defs><radialGradient id="${i}" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".55" stop-color="#FFB020"/><stop offset="1" stop-color="#FF7A2F"/></radialGradient></defs><g fill="none" stroke="${ink}" stroke-width="3"><circle cx="43" cy="23" r="19" opacity=".55"/><circle cx="43" cy="23" r="28" opacity=".26"/></g><path d="M15 9V39Q15 53 29 53H57" fill="none" stroke="${ink}" stroke-width="9.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="43" cy="23" r="12" fill="#FFB020" opacity=".3"/><circle cx="43" cy="23" r="9.5" fill="url(#${i})"/>`; };
const lumoMark = n => `<svg width="${n}" height="${n}" viewBox="0 0 64 64" aria-hidden="true" style="overflow:visible">${markBody()}</svg>`;
const PLANS = [
  { id: 'lite', name: 'pl.lite', desc: 'pl.lite_d', price: 0, f: 'f2', icon: 'signal' },
  { id: 'flex', name: 'pl.flex', desc: 'pl.flex_d', price: 2500, f: 'f1', icon: 'data' },
  { id: 'max', name: 'pl.max', desc: 'pl.max_d', price: 4000, f: 'f3', icon: 'bolt' },
];
C.add({ 'pl.lite': ['Lumo Lite', 'لومو لايت', 'Lumo Lite'], 'pl.lite_d': ['2 GB + 50 min, no monthly fee', '2 غيغا + 50 دقيقة بلا اشتراك', '2 Go + 50 min, sans abonnement'], 'pl.flex': ['Lumo Flex', 'لومو فلكس', 'Lumo Flex'], 'pl.flex_d': ['10 GB + 300 min + 100 SMS', '10 غيغا + 300 دقيقة + 100 رسالة', '10 Go + 300 min + 100 SMS'], 'pl.max': ['Lumo Max', 'لومو ماكس', 'Lumo Max'], 'pl.max_d': ['30 GB + 500 min + 5G', '30 غيغا + 500 دقيقة + 5G', '30 Go + 500 min + 5G'] });

/* ------------------------------------------------------------------ state */
const CONTACTS = [{ id: 1, n: 'c.person.1', num: '+218913330101' }, { id: 2, n: 'c.person.2', num: '+218914440102' }, { id: 3, n: 'c.person.3', num: '+218925550103' }, { id: 4, n: 'c.person.4', num: '+218916660104' }, { id: 5, n: 'c.person.5', num: '+218917770105' }];
const MERCH = [{ id: 1, n: 'mer.1', ico: 'insurance', cat: 'health' }, { id: 2, n: 'mer.2', ico: 'category-tag', cat: 'cafe' }, { id: 3, n: 'mer.3', ico: 'shopping-bag', cat: 'grocery' }, { id: 4, n: 'mer.4', ico: 'atm', cat: 'fuel' }];
const BUNDLES = {
  data: [{ id: 'd1', n: 'b.n.d1', price: 200, d: 'b.d1', gb: 1 }, { id: 'w5', n: 'b.n.w5', price: 800, d: 'b.d7', gb: 5, pop: 1 }, { id: 'm20', n: 'b.n.m20', price: 2500, d: 'b.d30', gb: 20 }, { id: 'n10', n: 'b.n.n10', price: 500, d: 'b.night', gb: 10 }],
  voice: [{ id: 'v100', n: 'b.n.v100', price: 500, d: 'b.d7', min: 100 }, { id: 'vu', n: 'b.n.vu', price: 1500, d: 'b.d30', min: 600, pop: 1 }],
  combo: [{ id: 'c1', n: 'b.n.c1', price: 4000, d: 'b.d30', gb: 30, min: 500, pop: 1 }, { id: 'c2', n: 'b.n.c2', price: 1800, d: 'b.d30', gb: 8, min: 100 }],
};
const BILLS = [{ id: 'pow', ico: 'bolt', k: 'bl.pow', amt: 4725 }, { id: 'wat', ico: 'drop', k: 'bl.wat', amt: 1260 }, { id: 'net', ico: 'wifi', k: 'bl.net', amt: 3500 }, { id: 'tv', ico: 'tv', k: 'bl.tv', amt: 2200 }, { id: 'sch', ico: 'school', k: 'bl.sch', amt: 15000 }, { id: 'post', ico: 'phone', k: 'bl.post', amt: 2900 }];
const VOUCH = [{ id: 1, n: 'vo.1', pts: 200, ico: 'data' }, { id: 2, n: 'vo.2', pts: 500, ico: 'topup' }, { id: 3, n: 'vo.3', pts: 900, ico: 'category-tag' }];

function seed() {
  const n = Date.now();
  return {
    onboarded: false, name: 'Nour', pin: '1234', bio: true, hide: false, vouchers: [], num: OP.number, sim: 'esim', kyc: 'std', profile: {}, avatar: null,
    bal: 184250, planId: 'flex', plan: { data: { used: 6.2, total: 10 }, mins: { used: 140, total: 300 }, sms: { used: 12, total: 100 }, renews: n + 12 * DAY, auto: true },
    points: 640, streak: 3, spend: [40, 85, 0, 120, 60, 210, 95].map(x => x * 100), card: { frozen: false, online: true, nfc: true, limit: 100000 }, missions: { bundles: 1, bill: 0, qr: 0, login: 3 }, used: [],
    tx: [
      { id: 't1', k: 'merchant', n: 'mer.2', amt: -1850, ts: n - 3 * 36e5 }, { id: 't2', k: 'p2p_in', n: 'c.person.5', amt: 20000, ts: n - 20 * 36e5 }, { id: 't3', k: 'bundle', n: 'b.n.w5', amt: -800, ts: n - 1.2 * DAY },
      { id: 't4', k: 'cashback', n: '', amt: 92, ts: n - 1.3 * DAY }, { id: 't5', k: 'bill', n: 'bl.pow', amt: -4725, ts: n - 3 * DAY }, { id: 't6', k: 'p2p_out', n: 'c.person.2', amt: -5000, ts: n - 4 * DAY }, { id: 't7', k: 'salary', n: '', amt: 120000, ts: n - 6 * DAY }, { id: 't8', k: 'topup', n: '', amt: -1000, ts: n - 7 * DAY },
    ],
  };
}
const fin = n => Number.isFinite(n);
const okState = s => s && typeof s === 'object' && fin(s.bal) && fin(s.points) && fin(s.streak) && typeof s.name === 'string' && /^\+\d{12}$/.test(s.num) && /^\d{4}$/.test(s.pin)
  && Array.isArray(s.tx) && s.tx.every(x => x && typeof x.k === 'string' && typeof x.n === 'string' && fin(x.amt) && fin(x.ts))
  && s.plan && ['data', 'mins', 'sms'].every(k => s.plan[k] && fin(s.plan[k].used) && fin(s.plan[k].total) && s.plan[k].total > 0) && fin(s.plan.renews)
  && Array.isArray(s.spend) && s.spend.length === 7 && s.spend.every(fin) && s.card && fin(s.card.limit) && s.missions && s.profile && typeof s.profile === 'object'
  && (s.avatar == null || typeof s.avatar === 'string') && (s.vouchers == null || Array.isArray(s.vouchers));
const store = C.store('telco.mobile.v2', seed, okState);
const S = () => store.get();
let PAY = null, UI = { wfilter: 'all', bt: 'data', showCard: false, billAcct: '' };
const initials = () => (S().profile.name || S().name || 'N').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = () => /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(S().avatar || '') ? `<img src="${S().avatar}" alt="">` : esc(initials());

/* ------------------------------------------------------------------ view helpers */
const tabbar = cur => C.dock(cur, [['home', 'home', 'm.t.home'], ['wallet', 'wallet', 'm.t.wallet']], [['vouchers', 'gift', 'm.t.vouchers'], ['me', 'user', 'm.t.me']]);
const page = (inner, { tab, ctx } = {}) => view(`<div class="screen${ctx && ctx.back ? ' back' : ''}"><div class="sc-in">${inner}</div></div>${tab ? tabbar(tab) : ''}`, { tab: !!tab });
const topbar = (title, { back = true, end = '' } = {}) => `<div class="topbar">${back ? `<button class="iconbtn" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}<h2>${title}</h2>${end}</div>`;
const nm = k => (k && /^(c\.person|mer\.|b\.n\.|bl\.|vch\.|w\.fund_)/.test(k) && C.DICT[k]) ? t(k) : (k || '');
const txTitle = x => t('tx.' + x.k, { n: nm(x.n) });
const TXICO = { merchant: ['qr-scan', 'g2'], p2p_in: ['receive', 'g3'], p2p_out: ['send', 'g1'], bundle: ['package', 'g4'], topup: ['topup', 'g1'], bill: ['bill', 'g5'], cashback: ['coins', 'g3'], salary: ['cash-stack', 'g3'], fund: ['wallet', 'g3'], voucher: ['gift', 'g2'] };
const txRow = x => { const [i, g] = TXICO[x.k] || ['wallet', 'g1']; return `<div class="tx"><span class="gly ${g}">${ic(i)}</span><div><div class="t">${esc(txTitle(x))}</div><div class="s">${fdate(x.ts, { time: true })}</div></div><div class="end amt ${x.amt > 0 ? 'pos' : ''}">${money(x.amt, { sign: true })}</div></div>`; };
const txGroups = list => byDay(list).map(g => `<div class="dayh">${g.label}</div><div class="txg">${g.items.map(txRow).join('')}</div>`).join('');
const bars4 = n => `<svg viewBox="0 0 22 16" width="22" height="16" aria-label="4G+" style="vertical-align:-2px">${[0, 1, 2, 3].map(i => `<rect x="${i * 5.6}" y="${14 - (i + 1) * 3.4}" width="3.6" height="${(i + 1) * 3.4}" rx="1.2" fill="currentColor" opacity="${i < n ? 1 : .3}"/>`).join('')}</svg>`;
const first = () => esc(S().name || 'Nour');
const GB = n => `<span class="num">${(+n).toFixed(1).replace(/\.0$/, '')}</span> ${t('u.gb')}`;

/* ------------------------------------------------------------------ routes */
const SCR = {};
function handle(parts, ctx) {
  const s = S();
  if (s.onboarded && parts[0] === 'ob') { C.replace('home'); return; }
  if (!s.onboarded) { if (parts[0] === 'ob' && OBN.route(parts, ctx)) return; C.replace('ob/welcome'); return; }
  const name = parts[0] || 'home';
  const f = SCR[name] || SCR.home;
  f(parts.slice(1), ctx);
  C.countUp(C.appEl());
}

/* ------------------------------------------------------------------ home */
const heroTop = () => `<div class="hrow">${lockup(32)}<span class="sp"></span><a class="iconbtn glass" href="#/notifications" aria-label="${t('n.title')}">${ic('bell')}<i class="dot">3</i></a><a class="avatar" href="#/me" aria-label="${t('m.t.me')}">${avatar()}</a></div>`;
const vcardHTML = (w) => { const s = S(), c = s.card; return `<div class="vcard ${c.frozen ? 'frozen' : ''}" ${w ? `style="width:${w}px"` : ''} aria-label="${t('cd.virtual')}"><span class="rings"></span><div class="row">${lockup(24)}<span class="sp"></span>${ic('contactless', 'lg')}</div><div class="vchip"></div>
  <div class="pan num" dir="ltr">${UI.showCard ? '5412 7500 0000 4821' : '•••• •••• •••• 4821'}</div>
  <div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="tiny" style="opacity:.75">${t('cd.valid')}</div><b class="num">09/29</b></div>${UI.showCard ? `<div><div class="tiny" style="opacity:.75">${t('cd.cvv')}</div><b class="num">417</b></div>` : ''}<div style="font:800 17px/1 var(--display);letter-spacing:.05em;text-align:end">${esc((s.profile.name || s.name).split(' ')[0].toUpperCase())}<div class="tiny" style="font-family:var(--font);letter-spacing:0;opacity:.75;font-weight:600;margin-top:3px">${t('cd.virtual')}</div></div></div>
  ${c.frozen ? `<div class="frz">${ic('lock', 'lg')} ${t('cd.frozen')}</div>` : ''}</div>`; };
SCR.home = (a, ctx) => {
  const s = S(), P = s.plan, plan = PLANS.find(x => x.id === s.planId) || PLANS[1];
  const dL = Math.max(0, P.data.total - P.data.used), mL = Math.max(0, P.mins.total - P.mins.used), sL = Math.max(0, P.sms.total - P.sms.used);
  const days = Math.max(0, Math.ceil((P.renews - Date.now()) / DAY)), cycle = Math.min(1, Math.max(.06, days / 30));
  const u = (pct, color, i, val, unit, lbl) => `<div class="u">${ring({ pct: Math.max(.04, pct), size: 76, stroke: 8, color, mid: ic(i) })}<div><b>${val}</b> <span style="display:inline">${unit}</span></div><span>${lbl}</span></div>`;
  page(`<div class="hero lh"><div class="rings"></div>${heroTop()}
      <div class="plan-t"><div class="eyebrow">${t('m.plan')} · ${bars4(4)} 4G+</div><div class="row" style="align-items:flex-end;margin-top:2px"><h1>${t(plan.name)}</h1><a class="hero-btn" href="#/bundles">${ic('plus', 'sm')} ${t('m.buy_more')}</a></div></div>
      <div class="usage glass" role="group" aria-label="${t('m.plan')}">${u(dL / P.data.total, '#FFB020', 'data', `<span class="num">${(+dL.toFixed(1))}</span>`, t('u.gb'), t('m.data'))}${u(mL / P.mins.total, '#FFFFFF', 'voice', `<span class="num">${Math.round(mL)}</span>`, t('u.min'), t('m.mins'))}${u(sL / P.sms.total, '#FF9CC6', 'sms', `<span class="num">${Math.round(sL)}</span>`, t('u.sms'), t('m.sms'))}</div>
      <div class="balchip glass"><span class="gly" style="width:40px;height:40px;background:rgba(255,255,255,.18);color:#fff">${ic('wallet', 'sm')}</span><div><div class="lbl">${t('m.bal')}</div><div class="big-num">${s.hide ? '<span class="num">••••••</span>' : money(s.bal)}</div></div><button class="eye" data-act="eye" aria-label="${t(s.hide ? 'v.show' : 'v.hide')}" aria-pressed="${s.hide}">${ic(s.hide ? 'eye-off' : 'eye')}</button></div></div>
    <div class="sheetbody"><nav class="qa c5" aria-label="${t('h.quick')}">${[['topup', 'topup', 'h.topup', 1], ['bundles', 'data', 'h.data'], ['send', 'send', 'h.send'], ['scan', 'qr-scan', 'h.qr'], ['vouchers', 'gift', 'm.t.vouchers']].map(([r, i, k, hot]) => `<button data-go="${r}"><span class="qi ${hot ? 'hot' : ''}">${ic(i)}</span><span>${t(k)}</span></button>`).join('')}</nav>
      <div class="sec" style="padding-top:22px"><div class="card simplan"><div class="top"><span class="gly g2">${ic(s.sim === 'esim' ? 'esim' : 'sim')}</span><div style="flex:1"><h3>${t(plan.name)}</h3><div class="sm muted">${t(s.sim === 'esim' ? 'm.sim_esim' : 'm.sim_sim')} · <span class="num" dir="ltr">${msisdn(s.num)}</span></div></div><span class="badge ok">${t('esim.status')}</span></div>
        <div class="bar" aria-hidden="true"><i style="width:${Math.round(cycle * 100)}%"></i></div>
        <div class="meta"><span>${t('m.renews', { d: `<b class="num">${days}</b>` })}</span><label class="row" style="gap:8px"><span>${t('m.autorenew')}</span><button class="switch" id="ar" role="switch" aria-checked="${P.auto}" aria-label="${t('m.autorenew')}"></button></label></div></div></div>
      <div class="sec" style="padding-top:0"><a class="offer" href="#/vouchers"><span class="gly" style="background:rgba(42,15,39,.14);color:#2A0F27">${ic('gift')}</span><div style="flex:1"><b>${t('h.offer')}</b><small>${t('h.offer_s')}</small></div>${ic('chevron-right', 'flip')}</a></div>
      <div class="sec-h" style="padding:6px 18px 0">${t('h.cards')}<a class="more" href="#/cards">${t('m.see_all')}</a></div>
      <div class="hscroll">${vcardHTML(300)}<div class="pass"><div class="row"><span class="eyebrow">${t('h.pass')}</span><span class="sp"></span>${ic('trophy')}</div><div><div class="big-num num">${int(s.points)}</div><div class="sm" style="font-weight:600">${t('m.points', { n: '' }).trim()} · ${t('tier.' + tier(s.points))}</div></div><a class="btn sm" href="#/rewards" style="background:#2A0F27;color:#fff;align-self:flex-start;box-shadow:none">${t('r.h')}</a></div></div>
      <div class="sec" style="padding-top:2px"><div class="sec-h">${t('m.recent')}<a class="more" href="#/wallet">${t('m.see_all')}</a></div>${txGroups(s.tx.slice(0, 6)).replace(/^<div class="dayh">/, '<div class="dayh" style="padding-top:2px">')}</div></div>`, { tab: 'home', ctx });
  C.$('#ar').addEventListener('click', e => { store.set(x => { x.plan.auto = !x.plan.auto; }); e.currentTarget.setAttribute('aria-checked', S().plan.auto); });
};
C.actions.eye = () => { store.set(s => { s.hide = !s.hide; }); SCR.home([], { back: false }); };
const tier = pts => pts >= 3000 ? 'platinum' : pts >= 1000 ? 'gold' : 'silver';

/* ------------------------------------------------------------------ wallet */
SCR.wallet = (a, ctx) => {
  const s = S(), f = UI.wfilter, list = s.tx.filter(x => f === 'all' || (f === 'in' ? x.amt > 0 : x.amt < 0));
  const spent = s.spend.reduce((x, y) => x + y, 0);
  page(`<div class="hero compact"><div class="rings"></div>${heroTop()}
      <div class="eyebrow" style="margin-top:18px;opacity:.85">${t('m.bal')} · ${C.cur()}</div><div class="big-num" style="font-size:46px;margin-top:4px">${s.hide ? '<span class="num">••••••</span>' : money(s.bal, { cur: false })}</div>
      <div class="row" style="margin-top:18px"><button class="btn light sm" data-act="fund" style="flex:1">${ic('plus', 'sm')} ${t('w.add')}</button><button class="btn glass sm" data-go="send" style="flex:1">${ic('send', 'sm')} ${t('a.send')}</button></div></div>
    <div class="sheetbody"><div class="sec stagger" style="padding-top:18px">
      <div class="card"><div class="row" style="justify-content:space-between"><div><div class="tiny muted">${t('w.spent')}</div><div style="font:var(--dw) 24px var(--display)">${money(spent)}</div></div><span class="badge ok">${ic('trending-down', 'sm')} 12%</span></div>${bars(s.spend, 5)}<div class="row tiny muted" style="justify-content:space-between;margin-top:4px">${[6, 5, 4, 3, 2, 1, 0].map(d => `<span>${fdate(Date.now() - d * DAY, { wd: 1 })}</span>`).join('')}</div></div>
      <div class="seg full" role="group" aria-label="${t('w.activity')}">${[['all', 'w.all'], ['in', 'w.in'], ['out', 'w.out']].map(([k, l]) => `<button data-wf="${k}" aria-pressed="${f === k}">${t(l)}</button>`).join('')}</div>
      <div>${txGroups(list)}</div></div></div>`, { tab: 'wallet', ctx });
  C.appEl().querySelectorAll('[data-wf]').forEach(b => b.addEventListener('click', () => { UI.wfilter = b.dataset.wf; SCR.wallet([], { back: false }); }));
};
C.actions.fund = () => {
  const sh = sheet(`<h3>${t('w.fund')}</h3><div class="list">${[['atm', 'w.fund_a', 'cash'], ['accounts', 'w.fund_b', 'bank'], ['card', 'w.fund_c', 'card']].map(([i, k, id]) => `<button class="item" data-fund="${id}"><span class="lead f2">${ic(i)}</span><div class="t">${t(k)}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></button>`).join('')}</div>`);
  sh.el.querySelectorAll('[data-fund]').forEach(b => b.addEventListener('click', () => { sh.close(); credit(10000, 'fund', b.dataset.fund === 'cash' ? 'w.fund_a' : b.dataset.fund === 'bank' ? 'w.fund_b' : 'w.fund_c'); }));
};
function credit(amt, k, n) { store.set(s => { s.bal += amt; s.tx.unshift({ id: C.uid(), k, n: n || '', amt, ts: Date.now() }); }); haptic(20); toast(t('p.paid')); C.rerender(); }

/* ------------------------------------------------------------------ payment flow (shared by send / topup / bundles / bills / QR) */
function startPay(p, rep) { PAY = { fee: 0, amount: 0, typed: '', points: 0, ...p }; (rep ? C.replace : go)(PAY.fixed ? 'pay/review' : 'pay/amount'); }
SCR.pay = (a, ctx) => {
  const step = a[0];
  if (step === 'm') { const m = MERCH.find(x => x.id === +a[1]); if (!m) return C.replace('scan'); PAY = null; return payMerchant(m, true); }
  if (!PAY) return C.replace('home');
  if (step === 'amount') return payAmount(ctx);
  if (step === 'review') return payReview(ctx);
  if (step === 'done') return payDone(ctx);
  C.replace('home');
};
const payMerchant = (m, rep) => startPay({ kind: 'merchant', n: m.n, to: t(m.n), ico: m.ico, cashback: true, title: t('q.found') }, rep);
function payAmount(ctx) {
  const P = PAY;
  page(`${topbar(P.title || t('s.h'))}
    <div class="sec" style="gap:16px">
      <div class="pocket f2" style="display:flex;align-items:center;gap:12px"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--surface);display:grid;place-items:center;color:var(--brand)">${ic(P.ico || 'user')}</span><div><div class="tiny" style="opacity:.7">${t('p.to')}</div><div style="font-weight:800">${esc(P.to)}</div>${P.sub ? `<div class="tiny num" style="opacity:.8">${esc(P.sub)}</div>` : ''}</div></div>
      <div style="text-align:center;padding:6px 0"><div class="big-num" id="amt" style="font-size:52px">${money(0)}</div><div class="hint" id="amh">${P.cashback ? t('q.cashback') : P.kind === 'p2p_out' ? t('s.free') : ''}</div></div>
      <div class="row wrap" style="justify-content:center">${[10, 20, 50, 100].map(v => `<button class="chip" data-q="${v}">${v}</button>`).join('')}</div>
      ${keypadHTML({ dec: true })}
      <button class="btn block" id="pcont" disabled>${t('p.review')}${ic('arrow-right', 'flip')}</button>
    </div>`, { ctx });
  const upd = v => { P.typed = v; P.amount = Math.round(parseFloat(v || '0') * 100) || 0; C.$('#amt').innerHTML = `<span class="num">${v || '0'}</span><span class="cur">${C.cur()}</span>`; C.$('#pcont').disabled = !(P.amount > 0); };
  const kp = bindKeypad(C.$('.keypad'), { max: 7, dec: true, onChange: upd });
  C.appEl().querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => kp.set(String(b.dataset.q))));
  C.$('#pcont').addEventListener('click', () => go('pay/review'));
}
function payReview(ctx) {
  const P = PAY, s = S(), total = P.amount + P.fee;
  page(`${topbar(t('p.review'))}
    <div class="sec" style="gap:14px">
      <div class="pocket brand" style="text-align:center;padding:24px"><div class="eyebrow">${esc(P.verb ? t(P.verb) : t('p.amount'))}</div><div class="big-num" style="margin-top:6px;font-size:46px">${money(P.amount)}</div></div>
      <div class="list">
        <div class="item"><span class="lead">${ic(P.ico || 'user')}</span><div><div class="s">${t('p.to')}</div><div class="t">${esc(P.to)}</div></div></div>
        <div class="item"><span class="lead f2">${ic('wallet')}</span><div><div class="s">${t('p.from')}</div><div class="t">${esc(t('m.t.wallet'))} · ${esc(loc(OP.app))}</div></div><div class="end">${money(s.bal)}</div></div>
        <div class="item"><span class="lead f3">${ic('receipt')}</span><div class="t">${t('p.fee')}</div><div class="end">${P.fee ? money(P.fee) : t('p.none')}</div></div>
        <div class="item"><span class="lead">${ic('coins')}</span><div class="t">${t('p.total')}</div><div class="end" style="font-size:18px">${money(total)}</div></div>
      </div>
      ${total > s.bal ? `<div class="pocket" style="background:var(--err-c);color:var(--err);display:flex;gap:10px;align-items:center">${ic('warning')}<b>${t('p.low')}</b></div>` : ''}
      <button class="btn block" id="pay" ${total > s.bal ? 'disabled' : ''}>${ic('lock')} ${t('p.confirm')}</button>
    </div>`, { ctx });
  C.$('#pay').addEventListener('click', () => pinSheet(() => commitPay()));
}
const pinSheet = (ok, o = {}) => C.pinSheet(ok, { pin: () => S().pin, bio: S().bio, ...o });
function commitPay() {
  const P = PAY, total = P.amount + P.fee; let pts = 0;
  store.set(s => {
    s.bal -= total; pts = Math.max(1, Math.floor(P.amount / 500)); s.points += pts;
    s.tx.unshift({ id: C.uid(), k: P.kind, n: P.n || '', amt: -total, ts: Date.now() });
    s.spend[6] += P.amount;
    if (P.cashback) { const cb = Math.round(P.amount * 0.05); s.bal += cb; s.tx.unshift({ id: C.uid(), k: 'cashback', n: '', amt: cb, ts: Date.now() }); s.missions.qr = 1; }
    if (P.kind === 'bundle') s.missions.bundles++; if (P.kind === 'bill') s.missions.bill = 1;
    if (P.onOk) P.onOk(s);
  });
  P.ref = 'LP' + Math.random().toString(36).slice(2, 8).toUpperCase(); P.pts = pts; P.at = Date.now(); haptic([20, 30, 50]);
  C.reset('home', 'pay/done');
}
function payDone(ctx) {
  const P = PAY;
  page(C.success({ title: t(P.kind === 'p2p_out' ? 'p.sent' : 'p.paid'), sub: esc(P.to), big: `<div class="big-num">${money(P.amount)}</div><span class="badge ok" style="margin-top:8px">${ic('gift', 'sm')} ${t('p.points', { n: P.pts })}</span>`,
    rows: `<div class="list"><div class="item"><div class="s">${t('p.ref')}</div><div class="end num" dir="ltr">${P.ref}</div></div><div class="item"><div class="s">${t('p.when')}</div><div class="end">${fdate(P.at, { time: true })}</div></div></div>`,
    foot: `<div class="row"><button class="btn tonal" style="flex:1" data-act="share">${ic('share')} ${t('p.share')}</button><button class="btn" style="flex:1" data-go="home">${t('p.done')}</button></div>` }), { ctx });
  confetti(C.appEl(), 30, .5);
}
C.actions.share = () => toast(t('p.share'), 'share');

/* ------------------------------------------------------------------ send */
SCR.send = (a, ctx) => {
  page(`${topbar(t('s.h'))}
    <div class="sec">
      <div class="field"><label for="srch" class="sr">${t('s.search')}</label><div class="row" style="position:relative"><input id="srch" class="input" placeholder="${t('s.search')}" style="padding-inline-start:46px"><span style="position:absolute;inset-inline-start:14px;color:var(--muted)">${ic('search')}</span></div></div>
      <div class="sec-h">${t('s.recent')}</div>
      <div class="row" style="overflow-x:auto;gap:14px;margin-inline:-18px;padding:2px 18px 6px;scrollbar-width:none">${CONTACTS.slice(0, 4).map(c => `<button class="act" data-c="${c.id}" style="min-width:64px"><span class="ico av" style="width:58px;height:58px;border-radius:50%;font:800 20px var(--display)">${esc(t(c.n)[0])}</span><span>${esc(t(c.n).split(' ')[0])}</span></button>`).join('')}</div>
      <div class="sec-h">${t('s.contacts')}</div>
      <div class="list" id="cl">${CONTACTS.map(c => `<button class="item" data-c="${c.id}"><span class="lead f${(c.id % 3) + 1}" style="border-radius:50%;font:800 17px var(--display)">${esc(t(c.n)[0])}</span><div><div class="t">${esc(t(c.n))}</div><div class="s num" dir="ltr">${msisdn(c.num)}</div></div></button>`).join('')}</div>
    </div>`, { ctx });
  const pick = id => { const c = CONTACTS.find(x => x.id === +id); startPay({ kind: 'p2p_out', n: c.n, to: t(c.n), sub: msisdn(c.num), ico: 'user', title: t('s.h') }); };
  C.appEl().querySelectorAll('[data-c]').forEach(b => b.addEventListener('click', () => pick(b.dataset.c)));
  C.$('#srch').addEventListener('input', e => { const q = e.target.value.toLowerCase(); C.$$('#cl .item').forEach(it => { it.style.display = it.textContent.toLowerCase().includes(q) ? '' : 'none'; }); });
};

/* ------------------------------------------------------------------ top-up */
SCR.topup = (a, ctx) => {
  let who = 'mine', amt = 2000;
  page(`${topbar(t('t.h'))}
    <div class="sec">
      <div class="sec-h">${t('t.who')}</div>
      <div class="seg full" id="who"><button data-w="mine" aria-pressed="true">${t('t.mine')}</button><button data-w="other" aria-pressed="false">${t('t.other')}</button></div>
      <div class="field"><label for="tn">${t('ob.number')}</label><input class="input ltr" id="tn" inputmode="tel" autocomplete="off" value="${msisdn(S().num)}" readonly aria-describedby="tnh"><span class="hint" id="tnh" hidden>${t('ob.number_h')}</span></div>
      <div class="sec-h">${t('t.choose')}</div>
      <div class="grid3" id="ta">${[5, 10, 20, 50, 100, 200].map(v => `<button class="chip" data-a="${v}" aria-pressed="${v === 20}" style="min-height:60px;justify-content:center;font-size:18px;font-weight:800">${v}</button>`).join('')}</div>
      <div class="pocket f3 sm" style="display:flex;gap:10px;align-items:center">${ic('gift', 'sm')} ${t('t.bonus')}</div>
      <button class="btn block" id="tgo">${t('p.review')}${ic('arrow-right', 'flip')}</button>
    </div>`, { ctx });
  const digits = () => C.$('#tn').value.replace(/\D/g, '').replace(/^218/, '');
  const valid = () => { const ok = who === 'mine' || /^9\d{8}$/.test(digits()); C.$('#tgo').disabled = !ok; return ok; };
  C.$$('#who button').forEach(b => b.addEventListener('click', () => { who = b.dataset.w; C.$$('#who button').forEach(x => x.setAttribute('aria-pressed', x === b)); const i = C.$('#tn'); i.readOnly = who === 'mine'; i.value = who === 'mine' ? msisdn(S().num) : ''; C.$('#tnh').hidden = who === 'mine'; i.placeholder = who === 'mine' ? '' : '9X XXX XXXX'; valid(); if (who === 'other') i.focus(); }));
  C.$('#tn').addEventListener('input', valid);
  C.$$('#ta .chip').forEach(b => b.addEventListener('click', () => { amt = +b.dataset.a * 100; C.$$('#ta .chip').forEach(x => x.setAttribute('aria-pressed', x === b)); haptic(8); }));
  C.$('#tgo').addEventListener('click', () => { if (!valid()) return; startPay({ kind: 'topup', amount: amt, fixed: true, to: who === 'mine' ? S().num.replace(/^(\+\d{3})(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4') : '+218 ' + digits().replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'), ico: 'topup', n: '', onOk: s => { if (amt >= 2000) s.points += 20; } }); });
};

/* ------------------------------------------------------------------ bundles */
SCR.bundles = (a, ctx) => {
  const s = S(), tab = UI.bt, list = BUNDLES[tab];
  page(`${heroBar(t('b.h'))}
    <div class="sec stagger">
      <div class="card" style="display:flex;flex-wrap:wrap;align-items:center;gap:14px">${ring({ pct: Math.max(0.02, (s.plan.data.total - s.plan.data.used) / s.plan.data.total), size: 70, stroke: 9, mid: `<span class="num" style="font-weight:800">${Math.max(0, s.plan.data.total - s.plan.data.used).toFixed(1).replace(/\.0$/, '')}</span>` })}<div style="flex:1"><b>${t('m.data')}</b><div class="sm muted">${t('m.left', { a: GB(Math.max(0, s.plan.data.total - s.plan.data.used)), b: GB(s.plan.data.total) })}</div></div><label class="col" style="gap:4px;align-items:center"><button class="switch" id="ar" role="switch" aria-checked="${s.plan.auto}" aria-label="${t('m.autorenew')}"></button><span class="tiny muted">${t('m.autorenew')}</span></label></div>
      <div class="seg full" role="group" aria-label="${t('b.h')}">${[['data', 'b.data'], ['voice', 'b.voice'], ['combo', 'b.combo']].map(([k, l]) => `<button data-bt="${k}" aria-pressed="${tab === k}">${t(l)}</button>`).join('')}</div>
      <div class="col">${list.map(b => `<div class="card bnd" style="display:flex;gap:14px;align-items:center;min-height:84px;position:relative">${b.pop ? `<span class="badge warn" style="position:absolute;top:-10px;inset-inline-end:14px">${ic('star', 'sm')} ${t('b.popular')}</span>` : ''}<span class="lead" style="width:54px;height:54px;border-radius:16px;background:var(--${b.gb && b.min ? 'f3' : b.gb ? 'f1' : 'f2'});display:grid;place-items:center;color:var(--brand);flex:none">${ic(b.gb && b.min ? 'package' : b.gb ? 'data' : 'voice', 'lg')}</span><div style="flex:1;min-width:0"><div style="font-weight:800;line-height:1.2">${t(b.n)}</div><div class="sm muted">${b.d === 'b.night' ? t('b.night') : t('b.valid', { d: t(b.d) })}</div></div><button class="btn sm" data-b="${b.id}" style="min-width:92px">${money(b.price, { short: true })}</button></div>`).join('')}</div>
    </div>`, { tab: 'bundles', ctx });
  C.$$('[data-bt]').forEach(b => b.addEventListener('click', () => { UI.bt = b.dataset.bt; SCR.bundles([], { back: false }); }));
  C.$('#ar').addEventListener('click', e => { store.set(x => { x.plan.auto = !x.plan.auto; }); e.currentTarget.setAttribute('aria-checked', S().plan.auto); });
  C.$$('[data-b]').forEach(btn => btn.addEventListener('click', () => { const b = list.find(x => x.id === btn.dataset.b); startPay({ kind: 'bundle', n: b.n, amount: b.price, fixed: true, to: t(b.n), ico: 'package', verb: 'b.pay_with', onOk: st => { if (b.gb) st.plan.data.total += b.gb; if (b.min) st.plan.mins.total += b.min; st.plan.renews = Math.max(st.plan.renews, Date.now() + 7 * DAY); } }); }));
};

/* ------------------------------------------------------------------ bills */
SCR.bills = (a, ctx) => {
  if (a[0]) return billDetail(a[0], ctx);
  page(`${heroBar(t('bl.h'))}<div class="sec"><div class="grid2 stagger">${BILLS.map(b => `<a class="card" href="#/bills/${b.id}" style="display:flex;flex-direction:column;gap:10px;min-height:112px;transition:transform .3s var(--spring-s)"><span class="lead" style="width:50px;height:50px;border-radius:16px;background:var(--f${(BILLS.indexOf(b) % 3) + 1});display:grid;place-items:center;color:var(--brand)">${ic(b.ico, 'lg')}</span><b>${t(b.k)}</b></a>`).join('')}</div></div>`, { ctx });
};
function billDetail(id, ctx) {
  const b = BILLS.find(x => x.id === id); if (!b) return C.replace('bills');
  page(`${topbar(t(b.k))}<div class="sec">
    <div class="field"><label for="ba">${t('bl.acct')}</label><input id="ba" class="input ltr" inputmode="numeric" value="${esc(UI.billAcct || '4408 1127 36')}"></div>
    <button class="btn tonal block" id="bl">${ic('search')} ${t('bl.lookup')}</button>
    <div id="bres" style="display:none" class="col"><div class="pocket f2"><div class="eyebrow" style="opacity:.7">${t('bl.found')}</div><div class="row" style="justify-content:space-between;margin-top:6px"><div><div class="tiny" style="opacity:.7">${t('bl.holder')}</div><b>Nour El Huda H.</b></div><div style="text-align:end"><div class="tiny" style="opacity:.7">${t('bl.due')}</div><div class="big-num" style="font-size:26px">${money(b.amt)}</div></div></div></div><button class="btn block" id="bp">${t('bl.pay', { a: moneyT(b.amt) })}</button></div></div>`, { ctx });
  C.$('#bl').addEventListener('click', async e => { const btn = e.currentTarget; btn.disabled = true; btn.innerHTML = '<i class="ic" style="--ic:url(' + C.ICONS + 'refresh.svg);animation:tc-spin .8s linear infinite"></i>'; await sleep(700); btn.style.display = 'none'; C.$('#bres').style.display = 'flex'; C.$('#bres').classList.add('anim-pop'); haptic(15); });
  C.$('#bp').addEventListener('click', () => startPay({ kind: 'bill', n: b.k, amount: b.amt, fixed: true, to: t(b.k), ico: b.ico, onOk: s => { s.points += 30; } }));
}

/* ------------------------------------------------------------------ QR */
SCR.scan = () => C.scanView({ merch: MERCH, end: `<a class="iconbtn" href="#/myqr" aria-label="${t('q.myqr_h')}">${ic('qr-code')}</a>`, onPick: id => payMerchant(MERCH.find(x => x.id === id)) });
SCR.myqr = (a, ctx) => {
  const s = S();
  page(`${topbar(t('q.myqr_h'))}<div class="sec" style="align-items:center;text-align:center">
    <div class="pocket f2" style="width:100%;padding:26px;display:flex;flex-direction:column;align-items:center;gap:14px"><div style="width:230px;background:#fff;color:#111;padding:14px;border-radius:24px">${fakeQR('LUMO-' + s.num, 27)}</div><div><b style="font:var(--dw) 20px var(--display)">${esc(s.profile.name || s.name)}</b><div class="num" dir="ltr">${msisdn(s.num)}</div></div></div>
    <p class="muted sm" style="max-width:300px">${t('q.myqr_s')}</p><p class="hint">${t('c.qr')}</p></div>`, { ctx });
};

/* ------------------------------------------------------------------ cards */
SCR.cards = (a, ctx) => {
  const s = S(), c = s.card, show = UI.showCard;
  page(`${heroBar(t('cd.h'))}
    <div class="sec stagger">
      ${vcardHTML()}
      <div class="row"><button class="btn tonal" style="flex:1" id="sd">${ic(show ? 'eye-off' : 'eye', 'sm')} ${t(show ? 'cd.hide' : 'cd.show')}</button><button class="btn tonal" style="flex:1" data-act="addw">${ic('card-add', 'sm')} ${t('cd.wallet')}</button></div>
      ${show ? `<p class="hint" style="text-align:center">${t('cd.auto_hide')}</p>` : ''}
      <div class="list">${[['freeze', 'lock', 'cd.freeze', c.frozen], ['online', 'globe', 'cd.online', c.online], ['nfc', 'contactless', 'cd.nfc', c.nfc]].map(([k, i, l, on]) => `<div class="item"><span class="lead f${k === 'freeze' ? 3 : 1}">${ic(i)}</span><div class="t" style="flex:1">${t(l)}</div><button class="switch" data-sw="${k}" role="switch" aria-checked="${on}" aria-label="${t(l)}"></button></div>`).join('')}
        <div class="item"><span class="lead f2">${ic('chart-pie')}</span><div><div class="t">${t('cd.limit')}</div><div class="s">${moneyT(c.limit, true)}</div></div><input type="range" min="10000" max="500000" step="10000" value="${c.limit}" id="lim" style="margin-inline-start:auto;width:120px;accent-color:var(--brand)" aria-label="${t('cd.limit')}"></div></div>
    </div>`, { tab: 'cards', ctx });
  C.$('#sd').addEventListener('click', () => { UI.showCard = !UI.showCard; SCR.cards([], { back: false }); if (UI.showCard) { clearTimeout(UI.ct); UI.ct = setTimeout(() => { UI.showCard = false; if (C.path() === 'cards') SCR.cards([], { back: false }); }, 10000); } });
  C.$$('[data-sw]').forEach(b => b.addEventListener('click', () => { store.set(x => { x.card[b.dataset.sw] = !x.card[b.dataset.sw]; }); haptic(12); SCR.cards([], { back: false }); }));
  C.$('#lim').addEventListener('change', e => { store.set(x => { x.card.limit = +e.target.value; }); SCR.cards([], { back: false }); });
};
C.actions.addw = () => { sheet(`<h3>${t('cd.wallet')}</h3><div class="list"><div class="item"><span class="lead f1">${ic('tap-to-pay')}</span><div><div class="t">${t('cd.tap')}</div><div class="s">${t('cd.tap_s')}</div></div></div></div><button class="btn block" data-close>${t('p.done')}</button>`); };

/* ------------------------------------------------------------------ rewards */
SCR.rewards = (a, ctx) => {
  const s = S(), tp = tier(s.points), nextAt = tp === 'silver' ? 1000 : tp === 'gold' ? 3000 : 6000, nextN = tp === 'silver' ? 'gold' : tp === 'gold' ? 'platinum' : 'platinum', prev = tp === 'silver' ? 0 : tp === 'gold' ? 1000 : 3000;
  const M = [['ms.1', s.missions.bundles, 2, 'package'], ['ms.2', s.missions.bill, 1, 'bill'], ['ms.3', s.missions.qr, 1, 'qr-scan'], ['ms.4', s.streak, 7, 'flame']];
  page(`${heroBar(t('r.h'))}
    <div class="sec stagger">
      <div class="pocket brand" style="display:flex;gap:18px;align-items:center">${ring({ pct: (s.points - prev) / (nextAt - prev), size: 112, stroke: 12, color: 'var(--accent)', mid: `<div><div class="big-num num" style="font-size:26px" data-count="${s.points}">0</div><div class="tiny" style="opacity:.8">${t('r.pts')}</div></div>` })}<div><span class="badge warn">${ic('trophy', 'sm')} ${t('tier.' + tp)}</span><div style="font:var(--dw) 20px/1.2 var(--display);margin-top:8px">${t('r.next', { n: `<span class="num">${Math.max(0, nextAt - s.points)}</span>`, t: t('tier.' + nextN) })}</div><div class="sm" style="opacity:.8;margin-top:4px">${ic('flame', 'sm')} ${t('m.streak', { n: s.streak })}</div></div></div>
      <div class="sec-h">${t('r.missions')}</div>
      <div class="list">${M.map(([k, v, g, i]) => `<div class="item"><span class="lead ${v >= g ? 'ok' : 'f2'}">${ic(v >= g ? 'success-check' : i)}</span><div style="flex:1"><div class="t">${t(k)}</div><div class="bar" style="height:7px;margin-top:6px"><i style="width:${Math.min(100, v / g * 100)}%"></i></div></div><span class="end num">${Math.min(v, g)}/${g}</span></div>`).join('')}</div>
      <div class="sec-h">${t('r.vouchers')}</div>
      <div class="col">${VOUCH.map(v => `<div class="card" style="display:flex;align-items:center;gap:14px"><span class="lead" style="width:50px;height:50px;border-radius:16px;background:var(--f${v.id});display:grid;place-items:center;color:var(--brand)">${ic(v.ico, 'lg')}</span><div style="flex:1"><b>${t(v.n)}</b><div class="sm muted">${t('r.pts_n', { n: `<span class="num">${v.pts}</span>` })}</div></div><button class="btn sm ${s.points >= v.pts ? '' : 'ghost'}" data-v="${v.id}">${t('r.redeem')}</button></div>`).join('')}</div>
    </div>`, { tab: 'rewards', ctx });
  C.$$('[data-v]').forEach(b => b.addEventListener('click', () => { const v = VOUCH.find(x => x.id === +b.dataset.v); if (S().points < v.pts) { toast(t('r.need', { n: v.pts - S().points }), 'warning'); return; } store.set(x => { x.points -= v.pts; if (v.id === 1) x.plan.data.total += 0.5; if (v.id === 2) { x.bal += 500; x.tx.unshift({ id: C.uid(), k: 'cashback', n: '', amt: 500, ts: Date.now() }); } }); haptic([20, 30]); confetti(C.appEl(), 70, .7); toast(t('r.redeemed')); SCR.rewards([], { back: false }); }));
};

/* ------------------------------------------------------------------ profile / settings */
const ST = SET.install({ page, S, store, avatar, markBig: lumoMark, op: OP, aboutKey: 'me.about_p', signout: () => { OBN.configure(OBCFG); store.set(s => { s.onboarded = false; }); C.reset('ob/welcome'); }, kyc: s => ({ ok: s.kyc === 'std', key: s.kyc === 'std' ? 'me.kyc' : 'me.kyc_rev' }),
  notifs: [['n.1', 'gift', 'g2'], ['n.2', 'esim', 'g3'], ['n.3', 'bolt', 'g1']],
  rows: link => `${link('rewards', 'f3', 'gift', 'm.t.rewards', t('m.points', { n: S().points }))}${link('cards', '', 'card', 'cd.h')}${link('me/sim', 'f2', S().sim === 'esim' ? 'esim' : 'sim', 'me.sim', t('me.sim_s'))}${link('me/limits', 'f1', 'chart-pie', 'me.limits')}${link('notifications', '', 'bell', 'n.title')}` });
SCR.me = (a, ctx) => { if (a[0] === 'sim') return meSim(ctx); if (a[0] === 'limits') return meLimits(ctx); if (a[0] === 'about') return ST.about(ctx); ST.me(ctx); };
function meSim(ctx) {
  const s = S();
  page(`${topbar(t('esim.h'))}<div class="sec stagger">
    <div class="pocket brand" style="display:flex;gap:14px;align-items:center">${ic(s.sim === 'esim' ? 'esim' : 'sim', 'xl')}<div><div style="font:var(--dw) 20px var(--display)">${esc(loc(OP.name))}</div><div class="num" dir="ltr">${msisdn(s.num)}</div><span class="badge ok" style="margin-top:6px">${t('esim.status')} · 4G+</span></div></div>
    <div class="list"><div class="item"><div class="s">${t('esim.iccid')}</div><div class="end num" dir="ltr">8921 8001 •••• 4427</div></div><div class="item"><div class="s">${t('esim.eid')}</div><div class="end num" dir="ltr">8904 •••• •••• 9051</div></div></div>
    <button class="btn tonal block" data-act="etransfer">${ic('qr-code')} ${t('esim.transfer')}</button><button class="btn ghost block" data-act="ereplace">${ic('sim')} ${t('esim.replace')}</button></div>`, { ctx });
}
C.actions.etransfer = () => { sheet(`<h3>${t('esim.transfer')}</h3><div style="width:210px;margin:auto;padding:12px;background:#fff;color:#111;border-radius:22px">${fakeQR('ESIM-' + S().num, 27)}</div><p class="sm muted" style="text-align:center">${t('esim.transfer_s')}</p><button class="btn block" data-close>${t('p.done')}</button>`); };
C.actions.ereplace = () => toast(t('esim.ordered'), 'sim');
function meLimits(ctx) {
  const s = S(), std = s.kyc === 'std';
  page(`${topbar(t('lim.h'))}<div class="sec stagger"><div class="pocket ${std ? 'f2' : 'f3'}" style="display:flex;gap:12px;align-items:center">${ic('shield-check', 'xl')}<b>${t(std ? 'lim.std' : 'lim.basic')}</b></div>
    <div class="list">${[['lim.daily', std ? 300000 : 50000], ['lim.monthly', std ? 2000000 : 300000], ['lim.max', std ? 1000000 : 200000]].map(([k, v]) => `<div class="item"><div class="t">${t(k)}</div><div class="end">${money(v, { short: true })}</div></div>`).join('')}</div>
    <p class="muted sm">${t('lim.up')}</p></div>`, { ctx });
}
SCR.notifications = (a, ctx) => ST.notifications(ctx);

/* vouchers */
const V = VCH.install({ S, store, page, pinSheet, op: OP, contacts: CONTACTS, hero: heroTop, mark64: () => `<g transform="translate(-2 -1)">${markBody('#fff')}</g>`, own: ['#5A0D43', '#C21868'] });
SCR.vouchers = (a, ctx) => V.screen(a, ctx);

/* ------------------------------------------------------------------ boot */
const scene = () => `<svg viewBox="0 0 360 270" role="img" aria-label="${t('ob.m.h')}"><defs><radialGradient id="wo" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#FFE9A8"/><stop offset=".55" stop-color="#FFB020"/><stop offset="1" stop-color="#FF7A2F"/></radialGradient><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient></defs>
  <g transform="translate(292 74)"><circle class="wl-ring" r="76" fill="none" stroke="#fff" stroke-width="2"/><circle class="wl-ring r2" r="76" fill="none" stroke="#fff" stroke-width="2"/><circle class="wl-ring r3" r="76" fill="none" stroke="#fff" stroke-width="2"/><circle r="64" fill="#FFB020" opacity=".18"/><circle r="46" fill="url(#wo)"/></g>
  <g class="float"><g transform="translate(26 76) rotate(-7)"><rect width="226" height="140" rx="24" fill="url(#wg)" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><rect x="20" y="22" width="44" height="34" rx="8" fill="#FFB020"/><path d="M20 39h44M42 22v34" stroke="#7A3A00" stroke-width="2" opacity=".5"/>
    <g transform="translate(170 24)" fill="#fff">${[0, 1, 2, 3].map(i => `<rect x="${i * 9}" y="${22 - (i + 1) * 5}" width="6" height="${(i + 1) * 5}" rx="2"/>`).join('')}</g>
    <text x="20" y="100" fill="#fff" style="font:700 21px 'Hanken Grotesk',sans-serif;letter-spacing:.04em" direction="ltr">+218 91 555 0142</text><text x="20" y="124" fill="#fff" opacity=".8" style="font:600 13px 'Hanken Grotesk',sans-serif">eSIM · 4G+</text></g></g>
  <g class="float" style="animation-delay:-2.4s"><g transform="translate(150 196)"><rect width="186" height="54" rx="27" fill="#fff"/><circle cx="27" cy="27" r="17" fill="#FFB020"/><path d="M20 27l5 5 10-11" fill="none" stroke="#2A0F27" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><text x="54" y="24" fill="#5A0D43" style="font:700 12px 'Hanken Grotesk',sans-serif" opacity=".7">Lumo Pay</text><text x="54" y="42" fill="#2A0F27" style="font:800 17px 'Hanken Grotesk',sans-serif" direction="ltr">+ 25.00 LYD</text></g></g></svg>`;
const OBCFG = {
  id: 'lumo', op: OP, plans: PLANS, scene, feats: [['id-card', 'ob.f_id'], ['esim', 'ob.f_sim'], ['gift', 'ob.f_vch']],
  account: () => S().acct ? { first: S().name, num: S().num, pin: S().pin, bio: S().bio, avatar: avatar() } : null,
  onLogin: ob => { store.set(s => { s.onboarded = true; s.acct = true; if (ob) { s.pin = ob.pin; s.num = ob.phone; } }); C.reset('home'); },
  onFinish: ob => {
    store.set(s => {
      s.onboarded = true; s.acct = true; s.hide = false; s.vouchers = []; const p = ob.profile || {}; s.profile = { name: p.name || 'Nour El Huda Haddad' }; s.name = (p.name || 'Nour').split(' ')[0]; s.kyc = ob.kyc && ob.kyc.decision === 'accepted' ? 'std' : (ob.kyc ? 'basic' : 'std'); s.avatar = p.selfie || null;
      s.num = ob.phone && ob.phone.length >= 13 ? ob.phone : OP.number; s.sim = ob.sim; s.pin = ob.pin || '1234'; s.bio = ob.bio; s.planId = ob.plan || 'flex'; s.points = 500; s.bal = 0;
      const pl = { lite: [2, 50], flex: [10, 300], max: [30, 500] }[s.planId] || [10, 300]; s.plan = { data: { used: +(pl[0] * .31).toFixed(1), total: pl[0] + 1 }, mins: { used: Math.round(pl[1] * .22), total: pl[1] }, sms: { used: 9, total: 100 }, renews: Date.now() + 30 * DAY, auto: true };
      s.tx = [{ id: C.uid(), k: 'cashback', n: '', amt: 0, ts: Date.now() }].slice(0, 0); s.spend = [0, 0, 0, 0, 0, 0, 0]; s.missions = { bundles: 0, bill: 0, qr: 0, login: 1 }; s.streak = 1; s.bal = 25000;
      s.tx.unshift({ id: C.uid(), k: 'fund', n: 'w.fund_a', amt: 25000, ts: Date.now() });
    });
    C.reset('home');
  },
};
function boot() {
  C.shell({ id: 'lumo', op: OP, mark: lumoMark, themeColor: ['#5A0D43', '#2A0830'] });
  OBN.configure(OBCFG);
  C.onPrefs(() => { if (C.path() === 'ob/id' && OBN.onLangChange()) return; C.rerender(); });
  C.router(handle);
  if (!sessionStorage.getItem('telco.lumo.splash')) { sessionStorage.setItem('telco.lumo.splash', '1'); C.splash(`<div class="rings"></div><span class="lockup">${lumoMark(64)}<b>${esc(loc(OP.app))}</b></span>`, 1200); }
  C.registerSW('../sw.js');
}
boot();
