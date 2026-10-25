// Neptune Mobile for Telco - "Lumo Pay": SIM/eSIM-linked mobile-money app for the invented operator Lumo Telecom.
// Led by Neptune Polaris onboarding (passport + liveness + face match, on-device), then wallet, bundles, bills, QR, cards, rewards.
// Everything is simulated. State in localStorage ("telco.mobile.v1").
import * as C from '../shared/core.js';
import * as OBN from '../shared/onboarding.js';
import './strings.js';
const { t, ic, esc, loc, money, moneyT, fmtN, fdate, ago, go, view, sheet, toast, haptic, sleep, confetti, ring, bars, fakeQR, msisdn, countUp, int, keypadHTML, bindKeypad, logoLine } = C;
const DAY = 864e5;

const OP = { name: { en: 'Lumo Telecom', ar: 'لومو للاتصالات', fr: 'Lumo Telecom' }, app: { en: 'Lumo Pay', ar: 'لومو باي', fr: 'Lumo Pay' }, mark: 'L', number: '+218915550142' };
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
    onboarded: false, name: 'Nour', pin: '1234', bio: true, num: OP.number, sim: 'esim', kyc: 'std', profile: {}, avatar: null,
    bal: 184250, planId: 'flex', plan: { data: { used: 6.2, total: 10 }, mins: { used: 140, total: 300 }, sms: { used: 12, total: 100 }, renews: n + 12 * DAY, auto: true },
    points: 640, streak: 3, spend: [40, 85, 0, 120, 60, 210, 95].map(x => x * 100), card: { frozen: false, online: true, nfc: true, limit: 100000 }, missions: { bundles: 1, bill: 0, qr: 0, login: 3 }, used: [],
    tx: [
      { id: 't1', k: 'merchant', n: 'mer.2', amt: -1850, ts: n - 3 * 36e5 }, { id: 't2', k: 'p2p_in', n: 'c.person.5', amt: 20000, ts: n - 20 * 36e5 }, { id: 't3', k: 'bundle', n: 'b.n.w5', amt: -800, ts: n - 1.2 * DAY },
      { id: 't4', k: 'cashback', n: '', amt: 92, ts: n - 1.3 * DAY }, { id: 't5', k: 'bill', n: 'bl.pow', amt: -4725, ts: n - 3 * DAY }, { id: 't6', k: 'p2p_out', n: 'c.person.2', amt: -5000, ts: n - 4 * DAY }, { id: 't7', k: 'salary', n: '', amt: 120000, ts: n - 6 * DAY }, { id: 't8', k: 'topup', n: '', amt: -1000, ts: n - 7 * DAY },
    ],
  };
}
const store = C.store('telco.mobile.v1', seed);
const S = () => store.get();
let PAY = null, UI = { wfilter: 'all', bt: 'data', showCard: false, billAcct: '' };

/* ------------------------------------------------------------------ view helpers */
const TABS = [['home', 'home', 'm.t.home'], ['wallet', 'wallet', 'm.t.wallet'], ['cards', 'card', 'm.t.cards'], ['me', 'user', 'm.t.me']];
const tabbar = cur => `<nav class="tabbar" aria-label="${t('m.title')}">${TABS.map(([r, i, k]) => `<a class="tab" href="#/${r}" ${cur === r ? 'aria-current="page"' : ''}><span class="pill">${ic(i)}</span><span>${t(k)}</span></a>`).join('')}</nav>`;
const page = (inner, { tab, ctx } = {}) => view(`<div class="screen${ctx && ctx.back ? ' back' : ''}"><div class="sc-in">${inner}</div></div>${tab ? tabbar(tab) : ''}`, { tab: !!tab });
const topbar = (title, { back = true, end = '' } = {}) => `<div class="topbar">${back ? `<button class="iconbtn" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}<h2>${title}</h2>${end}</div>`;
const nm = k => (k && /^(c\.person|mer\.|b\.n\.|bl\.)/.test(k)) ? t(k) : (k || '');
const txTitle = x => t('tx.' + x.k, { n: nm(x.n) });
const TXICO = { merchant: ['qr-scan', 'f3'], p2p_in: ['receive', 'ok'], p2p_out: ['send', 'f1'], bundle: ['package', 'f2'], topup: ['topup', 'f2'], bill: ['bill', 'f3'], cashback: ['coins', 'ok'], salary: ['cash-stack', 'ok'], fund: ['wallet', 'ok'] };
const txRow = x => { const [i, f] = TXICO[x.k] || ['wallet', 'f1']; return `<div class="item"><span class="lead ${f}">${ic(i)}</span><div><div class="t">${esc(txTitle(x))}</div><div class="s">${ago(x.ts)}</div></div><div class="end amt ${x.amt > 0 ? 'pos' : 'neg'}">${money(x.amt, { sign: true })}</div></div>`; };
const bars4 = n => `<svg viewBox="0 0 22 16" width="22" height="16" aria-label="4G+" style="vertical-align:-2px">${[0, 1, 2, 3].map(i => `<rect x="${i * 5.6}" y="${14 - (i + 1) * 3.4}" width="3.6" height="${(i + 1) * 3.4}" rx="1.2" fill="currentColor" opacity="${i < n ? 1 : .3}"/>`).join('')}</svg>`;
const first = () => esc(S().name || 'Nour');
const GB = n => `<span class="num">${(+n).toFixed(1).replace(/\.0$/, '')}</span> GB`;

/* ------------------------------------------------------------------ routes */
const SCR = {};
function handle(parts, ctx) {
  const s = S();
  if (parts[0] === 'ob') { if (OBN.route(parts, ctx)) return; }
  if (!s.onboarded && parts[0] !== 'ob') { C.replace('ob/welcome'); return; }
  const name = parts[0] || 'home';
  const f = SCR[name] || SCR.home;
  f(parts.slice(1), ctx);
  C.countUp(C.appEl());
}

/* ------------------------------------------------------------------ home */
SCR.home = (a, ctx) => {
  const s = S();
  page(`<div class="band">${logoLine()}</div>
    <div class="greet"><div><small>${t('m.hi_s')}</small><b>${first()}</b></div><a class="iconbtn" href="#/notifications" aria-label="${t('n.title')}">${ic('bell')}</a></div>
    <div class="balcard"><div class="t1">${t('m.t.wallet')} <span class="num" dir="ltr" style="opacity:.85;font-weight:600">${msisdn(s.num)}</span></div>
      <div><div class="t2">${t('m.bal')} · ${C.cur()}</div><div class="bal"><div class="big-num" id="bal">${UI.hide ? '<span class="num">••••••</span>' : `<span class="num">${fmtN(s.bal)}</span>`}</div><button class="eye" data-act="eye" aria-label="${t('v.hide')}">${ic(UI.hide ? 'eye-off' : 'eye')}</button></div></div></div>
    <div class="tiles">${[['send', 'send', 'a.send'], ['topup', 'topup', 'a.topup'], ['bundles', 'package', 'a.bundles'], ['bills', 'bill', 'a.bills']].map(([r, i, k]) => `<button class="tile4" data-go="${r}">${ic(i)}<span>${t(k)}</span></button>`).join('')}</div>
    <div class="rows-h"><h3>${t('w.activity')}</h3><a href="#/wallet">${t('m.see_all')}</a></div>
    <div class="rows">${s.tx.slice(0, 4).map(x => `<div class="rrow"><div><div class="t">${esc(txTitle(x))}</div><div class="s">${fdate(x.ts)}</div></div><div class="end amt ${x.amt > 0 ? 'pos' : ''}">${money(x.amt, { sign: true })}</div></div>`).join('')}</div>`, { tab: 'home', ctx });
};
C.actions.eye = () => { UI.hide = !UI.hide; SCR.home([], { back: false }); };
const tier = pts => pts >= 3000 ? 'platinum' : pts >= 1000 ? 'gold' : 'silver';

/* ------------------------------------------------------------------ wallet */
SCR.wallet = (a, ctx) => {
  const s = S(), f = UI.wfilter, list = s.tx.filter(x => f === 'all' || (f === 'in' ? x.amt > 0 : x.amt < 0));
  const spent = s.spend.reduce((x, y) => x + y, 0);
  page(`${topbar(t('w.h'), { back: false, end: `<button class="iconbtn tonal" data-act="fund" aria-label="${t('w.add')}">${ic('plus')}</button>` })}
    <div class="sec stagger">
      <div class="pocket brand" style="display:flex;flex-direction:column;gap:6px"><span class="eyebrow">${t('m.bal')}</span><div class="big-num">${money(s.bal)}</div><div class="row" style="margin-top:8px"><button class="btn accent sm" data-act="fund">${ic('plus', 'sm')} ${t('w.add')}</button><button class="btn sm tonal" data-go="send">${ic('send', 'sm')} ${t('a.send')}</button></div></div>
      <div class="card"><div class="row" style="justify-content:space-between"><div><div class="tiny muted">${t('w.spent')}</div><div style="font:var(--dw) 22px var(--display)">${money(spent)}</div></div><span class="badge ok">${ic('trending-down', 'sm')} 12%</span></div>${bars(s.spend, 5)}<div class="row tiny muted" style="justify-content:space-between;margin-top:4px">${['S', 'S', 'M', 'T', 'W', 'T', 'F'].map(d => `<span>${d}</span>`).join('')}</div></div>
      <div class="sec-h">${t('w.activity')}</div>
      <div class="seg full" role="group">${[['all', 'w.all'], ['in', 'w.in'], ['out', 'w.out']].map(([k, l]) => `<button data-wf="${k}" aria-pressed="${f === k}">${t(l)}</button>`).join('')}</div>
      <div class="list">${list.map(txRow).join('')}</div>
    </div>`, { tab: 'wallet', ctx });
  C.appEl().querySelectorAll('[data-wf]').forEach(b => b.addEventListener('click', () => { UI.wfilter = b.dataset.wf; SCR.wallet([], { back: false }); }));
};
C.actions.fund = () => {
  const sh = sheet(`<h3>${t('w.fund')}</h3><div class="list">${[['atm', 'w.fund_a', 'cash'], ['accounts', 'w.fund_b', 'bank'], ['card', 'w.fund_c', 'card']].map(([i, k, id]) => `<button class="item" data-fund="${id}"><span class="lead f2">${ic(i)}</span><div class="t">${t(k)}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></button>`).join('')}</div>`);
  sh.el.querySelectorAll('[data-fund]').forEach(b => b.addEventListener('click', () => { sh.close(); credit(10000, 'fund', b.dataset.fund === 'cash' ? 'w.fund_a' : b.dataset.fund === 'bank' ? 'w.fund_b' : 'w.fund_c'); }));
};
function credit(amt, k, n) { store.set(s => { s.bal += amt; s.tx.unshift({ id: C.uid(), k, n: n ? t(n) : '', amt, ts: Date.now() }); }); haptic(20); toast(t('p.paid')); C.rerender(); }

/* ------------------------------------------------------------------ payment flow (shared by send / topup / bundles / bills / QR) */
function startPay(p) { PAY = { fee: 0, amount: 0, typed: '', points: 0, ...p }; go(PAY.fixed ? 'pay/review' : 'pay/amount'); }
SCR.pay = (a, ctx) => {
  if (!PAY) return go('home');
  const step = a[0];
  if (step === 'amount') return payAmount(ctx);
  if (step === 'review') return payReview(ctx);
  if (step === 'done') return payDone(ctx);
  if (step === 'm') { const m = MERCH.find(x => x.id === +a[1]); startPay({ kind: 'merchant', n: m.n, to: t(m.n), ico: m.ico, cashback: true, title: t('q.found') }); }
};
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
function pinSheet(ok) {
  let v = '';
  const sh = sheet(`<h3 style="text-align:center">${t('p.enter_pin')}</h3><div class="pin-dots" id="pd">${[0, 1, 2, 3].map(() => '<i></i>').join('')}</div><p class="hint" id="ph" style="text-align:center">${t('p.pin_hint', { p: esc(S().pin) })}</p>${keypadHTML()}${S().bio ? `<button class="btn tonal block" id="bio">${ic('face-id')} ${t('p.use_face')}</button>` : ''}`);
  const dots = sh.el.querySelector('#pd');
  const bump = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  bindKeypad(sh.el.querySelector('.keypad'), { max: 4, onChange: async x => { v = x; bump(); if (v.length === 4) { await sleep(160); if (v === S().pin) { sh.close(); ok(); } else { dots.classList.add('err'); haptic(60); sh.el.querySelector('#ph').textContent = t('p.wrong'); sh.el.querySelector('#ph').style.color = 'var(--err)'; await sleep(420); dots.classList.remove('err'); v = ''; bump(); } } } });
  const bio = sh.el.querySelector('#bio'); if (bio) bio.addEventListener('click', async () => { bio.innerHTML = `${ic('face-id')} …`; await sleep(700); sh.close(); ok(); });
}
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
  go('pay/done');
}
function payDone(ctx) {
  const P = PAY;
  page(`<div class="sc-in" style="justify-content:center;align-items:center;text-align:center;padding:26px 22px;gap:14px;min-height:100%">
    <div class="anim-pop" style="width:112px;height:112px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center">${ic('success-check', 'xl')}</div>
    <h1 style="font:var(--dw) 28px var(--display)">${t(P.kind === 'p2p_out' ? 'p.sent' : 'p.paid')}</h1>
    <div class="big-num">${money(P.amount)}</div><p class="muted">${esc(P.to)}</p>
    <div class="list" style="width:100%;text-align:start"><div class="item"><div class="s">${t('p.ref')}</div><div class="end num" dir="ltr">${P.ref}</div></div><div class="item"><div class="s">${t('p.when')}</div><div class="end">${fdate(P.at, { time: true })}</div></div></div>
    <span class="badge ok">${ic('gift', 'sm')} ${t('p.points', { n: P.pts })}</span>
    <div class="row" style="width:100%"><button class="btn tonal" style="flex:1" data-act="share">${ic('share')} ${t('p.share')}</button><button class="btn" style="flex:1" data-go="home">${t('p.done')}</button></div></div>`, { ctx });
  
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
      <div class="field"><label>${t('ob.number')}</label><input class="input ltr" id="tn" value="${msisdn(S().num)}" readonly></div>
      <div class="sec-h">${t('t.choose')}</div>
      <div class="grid3" id="ta">${[5, 10, 20, 50, 100, 200].map(v => `<button class="chip" data-a="${v}" aria-pressed="${v === 20}" style="min-height:60px;justify-content:center;font-size:18px;font-weight:800">${v}</button>`).join('')}</div>
      <div class="pocket f3 sm" style="display:flex;gap:10px;align-items:center">${ic('gift', 'sm')} ${t('t.bonus')}</div>
      <button class="btn block" id="tgo">${t('p.review')}${ic('arrow-right', 'flip')}</button>
    </div>`, { ctx });
  amt = 2000;
  C.$$('#who button').forEach(b => b.addEventListener('click', () => { who = b.dataset.w; C.$$('#who button').forEach(x => x.setAttribute('aria-pressed', x === b)); const i = C.$('#tn'); i.readOnly = who === 'mine'; i.value = who === 'mine' ? msisdn(S().num) : ''; if (who === 'other') i.focus(); }));
  C.$$('#ta .chip').forEach(b => b.addEventListener('click', () => { amt = +b.dataset.a * 100; C.$$('#ta .chip').forEach(x => x.setAttribute('aria-pressed', x === b)); haptic(8); }));
  C.$('#tgo').addEventListener('click', () => startPay({ kind: 'topup', amount: amt, fixed: true, to: C.$('#tn').value || msisdn(S().num), ico: 'topup', n: '', onOk: s => { if (amt >= 2000) s.points += 20; } }));
};

/* ------------------------------------------------------------------ bundles */
SCR.bundles = (a, ctx) => {
  const s = S(), tab = UI.bt, list = BUNDLES[tab];
  page(`${topbar(t('b.h'), { back: false })}
    <div class="sec stagger">
      <div class="card" style="display:flex;align-items:center;gap:14px">${ring({ pct: Math.max(0.02, (s.plan.data.total - s.plan.data.used) / s.plan.data.total), size: 70, stroke: 9, mid: `<span class="num" style="font-weight:800">${Math.max(0, s.plan.data.total - s.plan.data.used).toFixed(1).replace(/\.0$/, '')}</span>` })}<div style="flex:1"><b>${t('m.data')}</b><div class="sm muted">${t('m.left', { a: GB(Math.max(0, s.plan.data.total - s.plan.data.used)), b: GB(s.plan.data.total) })}</div></div><label class="col" style="gap:4px;align-items:center"><button class="switch" id="ar" role="switch" aria-checked="${s.plan.auto}" aria-label="${t('m.autorenew')}"></button><span class="tiny muted">${t('m.autorenew')}</span></label></div>
      <div class="seg full" role="tablist">${[['data', 'b.data'], ['voice', 'b.voice'], ['combo', 'b.combo']].map(([k, l]) => `<button role="tab" data-bt="${k}" aria-pressed="${tab === k}">${t(l)}</button>`).join('')}</div>
      <div class="col">${list.map(b => `<div class="card bnd" style="display:flex;gap:14px;align-items:center;min-height:84px;position:relative">${b.pop ? `<span class="badge warn" style="position:absolute;top:-10px;inset-inline-end:14px">${ic('star', 'sm')} ${t('b.popular')}</span>` : ''}<span class="lead" style="width:54px;height:54px;border-radius:16px;background:var(--${b.gb && b.min ? 'f3' : b.gb ? 'f1' : 'f2'});display:grid;place-items:center;color:var(--brand);flex:none">${ic(b.gb && b.min ? 'package' : b.gb ? 'data' : 'voice', 'lg')}</span><div style="flex:1;min-width:0"><div style="font-weight:800;line-height:1.2">${t(b.n)}</div><div class="sm muted">${b.d === 'b.night' ? t('b.night') : t('b.valid', { d: t(b.d) })}</div></div><button class="btn sm" data-b="${b.id}" style="min-width:92px">${money(b.price, { short: true })}</button></div>`).join('')}</div>
    </div>`, { tab: 'bundles', ctx });
  C.$$('[data-bt]').forEach(b => b.addEventListener('click', () => { UI.bt = b.dataset.bt; SCR.bundles([], { back: false }); }));
  C.$('#ar').addEventListener('click', e => { store.set(x => { x.plan.auto = !x.plan.auto; }); e.currentTarget.setAttribute('aria-checked', S().plan.auto); });
  C.$$('[data-b]').forEach(btn => btn.addEventListener('click', () => { const b = list.find(x => x.id === btn.dataset.b); startPay({ kind: 'bundle', n: b.n, amount: b.price, fixed: true, to: t(b.n), ico: 'package', verb: 'b.pay_with', onOk: st => { if (b.gb) st.plan.data.total += b.gb; if (b.min) st.plan.mins.total += b.min; st.plan.renews = Math.max(st.plan.renews, Date.now() + 7 * DAY); } }); }));
};

/* ------------------------------------------------------------------ bills */
SCR.bills = (a, ctx) => {
  if (a[0]) return billDetail(a[0], ctx);
  page(`${topbar(t('bl.h'))}<div class="sec"><div class="grid2 stagger">${BILLS.map(b => `<a class="card" href="#/bills/${b.id}" style="display:flex;flex-direction:column;gap:10px;min-height:112px;transition:transform .3s var(--spring-s)"><span class="lead" style="width:50px;height:50px;border-radius:16px;background:var(--f${(BILLS.indexOf(b) % 3) + 1});display:grid;place-items:center;color:var(--brand)">${ic(b.ico, 'lg')}</span><b>${t(b.k)}</b></a>`).join('')}</div></div>`, { ctx });
};
function billDetail(id, ctx) {
  const b = BILLS.find(x => x.id === id); let found = false;
  page(`${topbar(t(b.k))}<div class="sec">
    <div class="field"><label for="ba">${t('bl.acct')}</label><input id="ba" class="input ltr" inputmode="numeric" value="${esc(UI.billAcct || '4408 1127 36')}"></div>
    <button class="btn tonal block" id="bl">${ic('search')} ${t('bl.lookup')}</button>
    <div id="bres" style="display:none" class="col"><div class="pocket f2"><div class="eyebrow" style="opacity:.7">${t('bl.found')}</div><div class="row" style="justify-content:space-between;margin-top:6px"><div><div class="tiny" style="opacity:.7">${t('bl.holder')}</div><b>Nour El Huda H.</b></div><div style="text-align:end"><div class="tiny" style="opacity:.7">${t('bl.due')}</div><div class="big-num" style="font-size:26px">${money(b.amt)}</div></div></div></div><button class="btn block" id="bp">${t('bl.pay', { a: moneyT(b.amt) })}</button></div></div>`, { ctx });
  C.$('#bl').addEventListener('click', async e => { const btn = e.currentTarget; btn.disabled = true; btn.innerHTML = '<i class="ic" style="--ic:url(' + C.ICONS + 'refresh.svg);animation:tc-spin .8s linear infinite"></i>'; await sleep(700); btn.style.display = 'none'; C.$('#bres').style.display = 'flex'; C.$('#bres').classList.add('anim-pop'); haptic(15); });
  C.$('#bp').addEventListener('click', () => startPay({ kind: 'bill', n: b.k, amount: b.amt, fixed: true, to: t(b.k), ico: b.ico, onOk: s => { s.points += 30; } }));
}

/* ------------------------------------------------------------------ QR */
SCR.scan = (a, ctx) => {
  view(`<div class="screen" style="background:#05080e;color:#fff;animation:none"><div class="sc-in" style="min-height:100%">
    <div class="topbar" style="color:#fff"><button class="iconbtn" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button><h2>${t('q.scan_h')}</h2><a class="iconbtn" href="#/myqr" aria-label="${t('q.myqr_h')}">${ic('qr-code')}</a></div>
    <div style="flex:1;display:grid;place-items:center;position:relative"><div class="vf" style="width:260px;height:260px;position:relative;border-radius:28px;background:repeating-linear-gradient(45deg,#0c1420 0 8px,#0a111b 8px 16px)"><i class="c c1"></i><i class="c c2"></i><i class="c c3"></i><i class="c c4"></i><i class="ln"></i>
      <span style="position:absolute;inset:0;display:grid;place-items:center;opacity:.35">${ic('qr-scan', 'xl')}</span></div></div>
    <p style="text-align:center;opacity:.8;padding:0 24px">${t('q.point')}</p>
    <div class="sec" style="padding-bottom:30px"><div class="eyebrow" style="opacity:.6">${t('q.demo_pick')}</div><div class="grid2">${MERCH.map(m => `<button class="chip" data-m="${m.id}" style="background:rgba(255,255,255,.12);color:#fff;min-height:52px;justify-content:center">${ic(m.ico, 'sm')} ${t(m.n)}</button>`).join('')}</div></div>
  </div></div>
  <style>.vf .c{position:absolute;width:44px;height:44px;border:5px solid var(--accent)}.vf .c1{top:-3px;left:-3px;border-width:5px 0 0 5px;border-top-left-radius:26px}.vf .c2{top:-3px;right:-3px;border-width:5px 5px 0 0;border-top-right-radius:26px}.vf .c3{bottom:-3px;left:-3px;border-width:0 0 5px 5px;border-bottom-left-radius:26px}.vf .c4{bottom:-3px;right:-3px;border-width:0 5px 5px 0;border-bottom-right-radius:26px}.vf .ln{position:absolute;inset-inline:10px;height:3px;background:var(--accent);animation:vfs 2.4s ease-in-out infinite}@keyframes vfs{0%,100%{top:8%}50%{top:90%}}</style>`);
  C.$$('[data-m]').forEach(b => b.addEventListener('click', () => { haptic(25); go('pay/m/' + b.dataset.m); }));
};
SCR.myqr = (a, ctx) => {
  const s = S();
  page(`${topbar(t('q.myqr_h'))}<div class="sec" style="align-items:center;text-align:center">
    <div class="pocket f2" style="width:100%;padding:26px;display:flex;flex-direction:column;align-items:center;gap:14px"><div style="width:230px;background:#fff;color:#111;padding:14px;border-radius:24px">${fakeQR('LUMO-' + s.num, 27)}</div><div><b style="font:var(--dw) 20px var(--display)">${esc(s.profile.name || s.name)}</b><div class="num" dir="ltr">${msisdn(s.num)}</div></div></div>
    <p class="muted sm" style="max-width:300px">${t('q.myqr_s')}</p><p class="hint">${t('c.qr_demo')}</p></div>`, { ctx });
};

/* ------------------------------------------------------------------ cards */
SCR.cards = (a, ctx) => {
  const s = S(), c = s.card, show = UI.showCard;
  page(`${topbar(t('cd.h'), { back: false })}
    <div class="sec stagger">
      <div class="vcard ${c.frozen ? 'frozen' : ''}" aria-label="${t('cd.virtual')}"><div class="row"><span class="opmark" style="font-size:16px"><i style="width:26px;height:26px;font-size:15px;border-radius:9px">${OP.mark}</i>${esc(loc(OP.app))}</span><span class="sp"></span>${ic('contactless', 'lg')}</div>
        <div class="pan num" dir="ltr">${show ? '5412 7500 0000 4821' : '•••• •••• •••• 4821'}</div>
        <div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="tiny" style="opacity:.7">${t('cd.valid')}</div><b class="num">09/29</b></div>${show ? `<div><div class="tiny" style="opacity:.7">${t('cd.cvv')}</div><b class="num">417</b></div>` : ''}<div style="font:800 20px/1 var(--display);letter-spacing:.05em;text-align:end">${esc((s.profile.name || s.name).split(' ')[0].toUpperCase())}<div class="tiny" style="font-family:var(--font);letter-spacing:0;opacity:.7;font-weight:600">${t('cd.virtual')}</div></div></div>
        ${c.frozen ? `<div class="frz">${ic('lock', 'lg')} ${t('cd.frozen')}</div>` : ''}</div>
      <div class="row"><button class="btn tonal" style="flex:1" id="sd">${ic(show ? 'eye-off' : 'eye', 'sm')} ${t(show ? 'cd.hide' : 'cd.show')}</button><button class="btn tonal" style="flex:1" data-act="addw">${ic('card-add', 'sm')} ${t('cd.wallet')}</button></div>
      ${show ? `<p class="hint" style="text-align:center">${t('cd.auto_hide')}</p>` : ''}
      <div class="list">${[['freeze', 'lock', 'cd.freeze', c.frozen], ['online', 'globe', 'cd.online', c.online], ['nfc', 'contactless', 'cd.nfc', c.nfc]].map(([k, i, l, on]) => `<div class="item"><span class="lead f${k === 'freeze' ? 3 : 1}">${ic(i)}</span><div class="t" style="flex:1">${t(l)}</div><button class="switch" data-sw="${k}" role="switch" aria-checked="${on}" aria-label="${t(l)}"></button></div>`).join('')}
        <div class="item"><span class="lead f2">${ic('chart-pie')}</span><div><div class="t">${t('cd.limit')}</div><div class="s">${moneyT(c.limit, true)}</div></div><input type="range" min="10000" max="500000" step="10000" value="${c.limit}" id="lim" style="margin-inline-start:auto;width:120px;accent-color:var(--brand)" aria-label="${t('cd.limit')}"></div></div>
      <p class="legal">${t('cd.note')}</p>
    </div>
    <style>.vcard{position:relative;border-radius:var(--r-big);padding:20px;min-height:200px;display:flex;flex-direction:column;justify-content:space-between;gap:20px;color:var(--on-hero);background:var(--hero);transition:filter .4s}.vcard.frozen{filter:grayscale(1) brightness(.8)}.vcard .pan{font:700 21px var(--font);letter-spacing:.1em}.vcard .frz{position:absolute;inset:0;border-radius:inherit;background:rgba(10,20,40,.55);display:flex;gap:10px;align-items:center;justify-content:center;font:800 20px var(--display);backdrop-filter:blur(2px)}</style>`, { tab: 'cards', ctx });
  C.$('#sd').addEventListener('click', () => { UI.showCard = !UI.showCard; SCR.cards([], { back: false }); if (UI.showCard) { clearTimeout(UI.ct); UI.ct = setTimeout(() => { UI.showCard = false; if (C.path() === 'cards') SCR.cards([], { back: false }); }, 10000); } });
  C.$$('[data-sw]').forEach(b => b.addEventListener('click', () => { store.set(x => { x.card[b.dataset.sw] = !x.card[b.dataset.sw]; }); haptic(12); SCR.cards([], { back: false }); }));
  C.$('#lim').addEventListener('change', e => { store.set(x => { x.card.limit = +e.target.value; }); SCR.cards([], { back: false }); });
};
C.actions.addw = () => { const sh = sheet(`<h3>${t('cd.wallet')}</h3><div class="list"><div class="item"><span class="lead f1">${ic('tap-to-pay')}</span><div class="t">Apple Pay</div><span class="badge info end">demo</span></div><div class="item"><span class="lead f2">${ic('tap-to-pay')}</span><div class="t">Google Pay</div><span class="badge info end">demo</span></div></div><p class="legal">${t('cd.note')}</p><button class="btn block" data-close>${t('p.done')}</button>`); void sh; };

/* ------------------------------------------------------------------ rewards */
SCR.rewards = (a, ctx) => {
  const s = S(), tp = tier(s.points), nextAt = tp === 'silver' ? 1000 : tp === 'gold' ? 3000 : 6000, nextN = tp === 'silver' ? 'gold' : tp === 'gold' ? 'platinum' : 'platinum', prev = tp === 'silver' ? 0 : tp === 'gold' ? 1000 : 3000;
  const M = [['ms.1', s.missions.bundles, 2, 'package'], ['ms.2', s.missions.bill, 1, 'bill'], ['ms.3', s.missions.qr, 1, 'qr-scan'], ['ms.4', s.streak, 7, 'flame']];
  page(`${topbar(t('r.h'), { back: false })}
    <div class="sec stagger">
      <div class="pocket brand" style="display:flex;gap:18px;align-items:center">${ring({ pct: (s.points - prev) / (nextAt - prev), size: 112, stroke: 12, color: 'var(--accent)', mid: `<div><div class="big-num num" style="font-size:26px" data-count="${s.points}">0</div><div class="tiny" style="opacity:.8">pts</div></div>` })}<div><span class="badge warn">${ic('trophy', 'sm')} ${t('tier.' + tp)}</span><div style="font:var(--dw) 20px/1.2 var(--display);margin-top:8px">${t('r.next', { n: `<span class="num">${Math.max(0, nextAt - s.points)}</span>`, t: t('tier.' + nextN) })}</div><div class="sm" style="opacity:.8;margin-top:4px">${ic('flame', 'sm')} ${t('m.streak', { n: s.streak })}</div></div></div>
      <div class="sec-h">${t('r.missions')}</div>
      <div class="list">${M.map(([k, v, g, i]) => `<div class="item"><span class="lead ${v >= g ? 'ok' : 'f2'}">${ic(v >= g ? 'success-check' : i)}</span><div style="flex:1"><div class="t">${t(k)}</div><div class="bar" style="height:7px;margin-top:6px"><i style="width:${Math.min(100, v / g * 100)}%"></i></div></div><span class="end num">${Math.min(v, g)}/${g}</span></div>`).join('')}</div>
      <div class="sec-h">${t('r.vouchers')}</div>
      <div class="col">${VOUCH.map(v => `<div class="card" style="display:flex;align-items:center;gap:14px"><span class="lead" style="width:50px;height:50px;border-radius:16px;background:var(--f${v.id});display:grid;place-items:center;color:var(--brand)">${ic(v.ico, 'lg')}</span><div style="flex:1"><b>${t(v.n)}</b><div class="sm muted"><span class="num">${v.pts}</span> pts</div></div><button class="btn sm ${s.points >= v.pts ? '' : 'ghost'}" data-v="${v.id}">${t('r.redeem')}</button></div>`).join('')}</div>
    </div>`, { tab: 'rewards', ctx });
  C.$$('[data-v]').forEach(b => b.addEventListener('click', () => { const v = VOUCH.find(x => x.id === +b.dataset.v); if (S().points < v.pts) { toast(t('r.need', { n: v.pts - S().points }), 'warning'); return; } store.set(x => { x.points -= v.pts; if (v.id === 1) x.plan.data.total += 0.5; if (v.id === 2) { x.bal += 500; x.tx.unshift({ id: C.uid(), k: 'cashback', n: '', amt: 500, ts: Date.now() }); } }); haptic([20, 30]); confetti(C.appEl(), 70, .7); toast(t('r.redeemed')); SCR.rewards([], { back: false }); }));
};

/* ------------------------------------------------------------------ profile / settings */
SCR.me = (a, ctx) => {
  if (a[0] === 'sim') return meSim(ctx); if (a[0] === 'limits') return meLimits(ctx); if (a[0] === 'about') return meAbout(ctx);
  const s = S(), d = C.prefs();
  page(`${topbar(t('me.h'))}
    <div class="sec stagger">
      <div class="pocket f2" style="display:flex;gap:14px;align-items:center">${s.avatar ? `<img src="${s.avatar}" alt="" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid var(--surface)">` : `<span class="lead" style="width:70px;height:70px;border-radius:50%;background:var(--surface);display:grid;place-items:center">${ic('user', 'xl')}</span>`}<div><div style="font:var(--dw) 21px/1.15 var(--display)">${esc(s.profile.name || s.name)}</div><div class="sm num" dir="ltr" style="opacity:.8">${msisdn(s.num)}</div><span class="badge ${s.kyc === 'std' ? 'ok' : 'warn'}" style="margin-top:6px">${ic('shield-check', 'sm')} ${t(s.kyc === 'std' ? 'me.kyc' : 'me.kyc_rev')}</span></div></div>
      <div class="list">
        <a class="item" href="#/rewards"><span class="lead f3">${ic('gift')}</span><div><div class="t">${t('m.t.rewards')}</div><div class="s">${t('m.points', { n: s.points })}</div></div><span class="chev end">${ic('chevron-right', 'flip')}</span></a>
        <a class="item" href="#/me/sim"><span class="lead f2">${ic(s.sim === 'esim' ? 'esim' : 'sim')}</span><div><div class="t">${t('me.sim')}</div><div class="s">${t('me.sim_s')}</div></div><span class="chev end">${ic('chevron-right', 'flip')}</span></a>
        <a class="item" href="#/me/limits"><span class="lead f1">${ic('chart-pie')}</span><div><div class="t">${t('me.limits')}</div></div><span class="chev end">${ic('chevron-right', 'flip')}</span></a>
        <div class="item"><span class="lead f3">${ic('lock')}</span><div class="t" style="flex:1">${t('me.sec')}</div><button class="switch" id="bsw" role="switch" aria-checked="${s.bio}" aria-label="${t('ob.bio')}"></button></div>
      </div>
      <div class="list">
        <div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="t">${ic('language', 'sm')} ${t('me.lang')}</div><div class="seg full">${['en', 'ar', 'fr'].map(l => `<button data-l="${l}" aria-pressed="${d.lang === l}" lang="${l}">${{ en: 'English', ar: 'العربية', fr: 'Français' }[l]}</button>`).join('')}</div></div>
        <div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="t">${ic('sun', 'sm')} ${t('me.theme')}</div><div class="seg full"><button data-th="light" aria-pressed="${d.theme === 'light'}">${t('panel.light')}</button><button data-th="dark" aria-pressed="${d.theme === 'dark'}">${t('panel.dark')}</button></div><div id="looks-slot" class="card-picker"></div></div>
        <div class="item" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="lead f2">${ic('download')}</span><div style="flex:1"><div class="t">${t('me.offline')}</div><div class="s">${t('me.offline_s')}</div></div></div><div class="bar" id="opb" style="height:8px;display:none"><i style="width:0%;animation:none;transition:width .3s"></i></div><button class="btn tonal sm" id="opk">${ic('download', 'sm')} ${t('me.offline')}</button></div>
      </div>
      <div class="list"><a class="item" href="#/me/about"><span class="lead">${ic('info')}</span><div class="t">${t('me.about')}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></a>
        <button class="item" data-act="replay"><span class="lead f2">${ic('refresh')}</span><div class="t">${t('me.replay')}</div></button><button class="item" data-act="reset"><span class="lead err">${ic('trash')}</span><div class="t">${t('me.reset')}</div></button></div>
      <p class="legal">${t('me.signed')}</p>
    </div>`, { ctx });
  C.$$('[data-l]').forEach(b => b.addEventListener('click', () => C.setPrefs({ lang: b.dataset.l })));
  C.$$('[data-th]').forEach(b => b.addEventListener('click', () => C.setPrefs({ theme: b.dataset.th })));
  if (globalThis.Looks) globalThis.Looks.mount(C.$('#looks-slot'), { label: t('panel.look') });
  C.$('#bsw').addEventListener('click', e => { store.set(x => { x.bio = !x.bio; }); e.currentTarget.setAttribute('aria-checked', S().bio); });
  const op = C.$('#opk'); C.offlineReady().then(r => { if (r) { op.innerHTML = `${ic('success-check', 'sm')} OK`; op.disabled = true; } });
  op.addEventListener('click', async () => { op.disabled = true; const b = C.$('#opb'); b.style.display = 'block'; await C.downloadOfflinePack(p => { b.firstChild.style.width = Math.round(p * 100) + '%'; }); op.innerHTML = `${ic('success-check', 'sm')} OK`; toast(t('me.offline')); });
};
C.actions.replay = () => { OBN.configure(OBCFG); store.set(s => { s.onboarded = false; }); go('ob/welcome'); };
C.actions.reset = () => { store.reset(); OBN.configure(OBCFG); go('ob/welcome'); };
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
function meAbout(ctx) { page(`${topbar(t('me.about'))}<div class="sec"><div class="pocket f3"><p>${t('me.about_p')}</p></div><div class="card"><p class="sm muted">Neptune Showroom · Polaris ${'1.0'}</p></div></div>`, { ctx }); }
SCR.notifications = (a, ctx) => { page(`${topbar(t('n.title'))}<div class="sec"><div class="list">${[['n.1', 'gift', 'f3'], ['n.2', 'esim', 'f2'], ['n.3', 'bolt', 'f1']].map(([k, i, f], n) => `<div class="item"><span class="lead ${f}">${ic(i)}</span><div class="t" style="font-weight:600">${t(k)}</div><span class="end tiny muted">${n + 1}h</span></div>`).join('')}</div></div>`, { ctx }); };

/* ------------------------------------------------------------------ boot */
const OBCFG = {
  id: 'mobile', op: OP, plans: PLANS,
  art: () => `<svg viewBox="0 0 280 170" width="280" height="170" role="img" aria-label="${t('ob.m.h')}"><g style="color:var(--brand)"><rect x="92" y="6" width="96" height="158" rx="20" fill="none" stroke="currentColor" stroke-width="4"/><rect x="118" y="14" width="44" height="6" rx="3" fill="currentColor" opacity=".5"/>
    <rect x="104" y="40" width="72" height="44" rx="12" style="fill:var(--accent)"/><text x="140" y="68" text-anchor="middle" style="fill:var(--on-accent);font:800 17px var(--display)">LUMO</text><rect x="104" y="96" width="72" height="8" rx="4" fill="currentColor" opacity=".5"/><rect x="104" y="112" width="46" height="8" rx="4" fill="currentColor" opacity=".3"/>
    <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"><path d="M206 50a50 50 0 0 1 0 68"/><path d="M222 38a72 72 0 0 1 0 92"/><path d="M74 50a50 50 0 0 0 0 68"/><path d="M58 38a72 72 0 0 0 0 92"/></g></g></svg>`,
  onSkip: () => { store.set(s => { s.onboarded = true; }); go('home'); },
  onFinish: ob => {
    store.set(s => {
      s.onboarded = true; const p = ob.profile || {}; s.profile = { name: p.name || 'Nour El Huda Haddad' }; s.name = (p.name || 'Nour').split(' ')[0]; s.kyc = ob.kyc && ob.kyc.decision === 'accepted' ? 'std' : (ob.kyc ? 'basic' : 'std'); s.avatar = p.selfie || null;
      s.num = ob.phone && ob.phone.length >= 13 ? ob.phone : OP.number; s.sim = ob.sim; s.pin = ob.pin || '1234'; s.bio = ob.bio; s.planId = ob.plan || 'flex'; s.points = 500; s.bal = 0;
      const pl = { lite: [2, 50], flex: [10, 300], max: [30, 500] }[s.planId] || [10, 300]; s.plan = { data: { used: 0, total: pl[0] + 1 }, mins: { used: 0, total: pl[1] }, sms: { used: 0, total: 100 }, renews: Date.now() + 30 * DAY, auto: true };
      s.tx = [{ id: C.uid(), k: 'cashback', n: '', amt: 0, ts: Date.now() }].slice(0, 0); s.spend = [0, 0, 0, 0, 0, 0, 0]; s.missions = { bundles: 0, bill: 0, qr: 0, login: 1 }; s.streak = 1; s.bal = 25000;
      s.tx.unshift({ id: C.uid(), k: 'fund', n: t('w.fund_a'), amt: 25000, ts: Date.now() });
    });
    go('home');
  },
};
function boot() {
  C.applyPrefs();
  C.shell({ id: 'mobile', title: { en: 'Neptune Mobile for Telco', ar: 'نبتون موبايل للاتصالات', fr: 'Neptune Mobile pour opérateurs' }, onPanel: a => { if (a === 'replay') C.actions.replay(); if (a === 'reset') C.actions.reset(); } });
  OBN.configure(OBCFG);
  C.onPrefs(() => { if (C.path() === 'ob/id' && OBN.onLangChange()) return; C.rerender(); });
  C.router(handle);
  if (!sessionStorage.getItem('telco.mobile.splash') && !C.EMBED) { sessionStorage.setItem('telco.mobile.splash', '1'); C.splash(`<span class="opmark" style="font-size:34px;animation:tc-pop .8s var(--spring) both"><i style="width:54px;height:54px;font-size:30px;border-radius:18px">${OP.mark}</i>${esc(loc(OP.app))}</span>`, 1200); }
  C.registerSW('../sw.js');
}
boot();
