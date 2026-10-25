// Neptune Vega for Telco - "Sahar Cash": wallet-first mobile money with agents, cash-in/out, savings pots, bills and QR.
// Led by Neptune Polaris onboarding (passport + liveness + face match, on-device). Everything simulated; state in localStorage ("telco.vega.v1").
// Includes a demo "Agent mode" so a presenter can show both sides of a cash-in or cash-out.
import * as C from '../shared/core.js';
import * as OBN from '../shared/onboarding.js';
import './strings.js';
const { t, ic, esc, loc, money, moneyT, fdate, ago, go, view, sheet, toast, haptic, sleep, confetti, ring, fakeQR, msisdn, keypadHTML, bindKeypad, logoLine } = C;
const DAY = 864e5;

const OP = { name: { en: 'Sahar Mobile', ar: 'سحر موبايل', fr: 'Sahar Mobile' }, app: { en: 'Sahar Cash', ar: 'سحر كاش', fr: 'Sahar Cash' }, mark: 'S', number: '+218925550177' };
const PLANS = [{ id: 'voice', name: 'vpl.voice', desc: 'vpl.voice_d', price: 0, f: 'f2', icon: 'voice' }, { id: 'family', name: 'vpl.family', desc: 'vpl.family_d', price: 1500, f: 'f1', icon: 'users' }, { id: 'data', name: 'vpl.data', desc: 'vpl.data_d', price: 3000, f: 'f3', icon: 'data' }];
C.add({ 'vpl.voice': ['Sahar Talk', 'سحر توك', 'Sahar Talk'], 'vpl.voice_d': ['Cheap calls, pay as you go', 'مكالمات رخيصة والدفع حسب الاستخدام', 'Appels pas chers, à l’usage'], 'vpl.family': ['Sahar Family', 'سحر العائلة', 'Sahar Famille'], 'vpl.family_d': ['5 GB + free calls to 3 family numbers', '5 غيغا + مكالمات مجانية لثلاثة أرقام عائلية', '5 Go + appels gratuits vers 3 numéros famille'], 'vpl.data': ['Sahar Net', 'سحر نت', 'Sahar Net'], 'vpl.data_d': ['25 GB for streaming and study', '25 غيغا للمشاهدة والدراسة', '25 Go pour streaming et études'] });

const AG = [
  { id: 1, n: 'ag.1', d: 120, x: 196, y: 214, h: ['08:00', '22:00'], low: false }, { id: 2, n: 'ag.2', d: 260, x: 262, y: 142, h: ['09:00', '23:00'], low: false }, { id: 3, n: 'ag.3', d: 380, x: 96, y: 150, h: ['07:00', '21:00'], low: false },
  { id: 4, n: 'ag.4', d: 520, x: 282, y: 270, h: ['08:00', '20:00'], low: true }, { id: 5, n: 'ag.5', d: 910, x: 58, y: 288, h: ['09:00', '18:00'], low: false },
];
const SERV = [{ id: 'air', ico: 'topup', k: 'vp.air', amt: 2000, f: 'f1' }, { id: 'data', ico: 'data', k: 'vp.data', amt: 1500, f: 'f2' }, { id: 'pow', ico: 'bolt', k: 'vp.pow', amt: 4725, f: 'f3' }, { id: 'wat', ico: 'drop', k: 'vp.wat', amt: 1260, f: 'f1' }, { id: 'tv', ico: 'tv', k: 'vp.tv', amt: 2200, f: 'f2' }, { id: 'sch', ico: 'school', k: 'vp.sch', amt: 15000, f: 'f3' }];
const CONTACTS = [{ id: 1, n: 'vc.person.1', num: '+218913330101' }, { id: 2, n: 'vc.person.2', num: '+218914440102' }, { id: 3, n: 'vc.person.3', num: '+218925550103' }, { id: 4, n: 'vc.person.4', num: '+218917770105' }];

function seed() {
  const n = Date.now();
  return {
    onboarded: false, name: 'Karim', pin: '1234', bio: true, num: OP.number, sim: 'sim', kyc: 'std', profile: {}, avatar: null, bal: 92500, hide: false, roundup: true,
    pots: [{ id: 1, n: 'v.pot_eid', goal: 50000, saved: 31000, ico: 'gift' }, { id: 2, n: 'v.pot_sch', goal: 150000, saved: 60000, ico: 'school' }, { id: 3, n: 'v.pot_phone', goal: 120000, saved: 18000, ico: 'phone' }],
    pending: [], agent: { mode: false, float: 850000, cash: 420000, comm: 1240 },
    tx: [{ id: 'a1', k: 'cash_in', n: 'ag.1', amt: 50000, ts: n - 5 * 36e5 }, { id: 'a2', k: 'p2p_out', n: 'vc.person.2', amt: -8000, ts: n - 1 * DAY }, { id: 'a3', k: 'airtime', n: '', amt: -2000, ts: n - 2 * DAY }, { id: 'a4', k: 'remit', n: 'vc.sender', amt: 120000, ts: n - 4 * DAY }, { id: 'a5', k: 'cash_out', n: 'ag.2', amt: -30000, ts: n - 6 * DAY }],
  };
}
const store = C.store('telco.vega.v1', seed);
const S = () => store.get();
let PAY = null, UI = { sel: 1, shown: false };

const TABS = [['home', 'home', 'v.t.home'], ['agents', 'location', 'v.t.agents'], ['pots', 'savings', 'v.t.pots'], ['me', 'user', 'v.t.me']];
const tabbar = cur => `<nav class="tabbar" aria-label="${t('v.title')}">${TABS.map(([r, i, k]) => `<a class="tab" href="#/${r}" ${cur === r ? 'aria-current="page"' : ''}><span class="pill">${ic(i)}</span><span>${t(k)}</span></a>`).join('')}</nav>`;
const page = (inner, { tab, ctx } = {}) => view(`<div class="screen${ctx && ctx.back ? ' back' : ''}"><div class="sc-in">${inner}</div></div>${tab ? tabbar(tab) : ''}`, { tab: !!tab });
const topbar = (title, { back = true, end = '' } = {}) => `<div class="topbar">${back ? `<button class="iconbtn" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}<h2>${title}</h2>${end}</div>`;
const nm = k => (k && /^(vc\.|ag\.)/.test(k)) ? t(k) : (k || '');
const txTitle = x => t('tx.' + x.k, { n: nm(x.n) });
const TXICO = { cash_in: ['atm', 'ok'], cash_out: ['cash-stack', 'f3'], p2p_out: ['send', 'f1'], p2p_in: ['receive', 'ok'], airtime: ['topup', 'f2'], bill: ['bill', 'f3'], shop: ['qr-scan', 'f3'], remit: ['globe', 'ok'], pot: ['savings', 'f2'] };
const txRow = x => { const [i, f] = TXICO[x.k] || ['wallet', 'f1']; return `<div class="item"><span class="lead ${f}">${ic(i)}</span><div><div class="t">${esc(txTitle(x))}</div><div class="s">${ago(x.ts)}</div></div><div class="end amt ${x.amt > 0 ? 'pos' : 'neg'}">${money(x.amt, { sign: true })}</div></div>`; };
const fmtDist = d => d < 1000 ? t('v.m', { n: d }) : t('v.km', { n: (d / 1000).toFixed(1) });
const code6 = () => String(Math.floor(100000 + Math.random() * 900000));
const spaced = c => c.slice(0, 3) + ' ' + c.slice(3);

const SCR = {};
function handle(parts, ctx) {
  const s = S();
  if (parts[0] === 'ob') { if (OBN.route(parts, ctx)) return; }
  if (!s.onboarded && parts[0] !== 'ob') { C.replace('ob/welcome'); return; }
  (SCR[parts[0] || 'home'] || SCR.home)(parts.slice(1), ctx);
  C.countUp(C.appEl());
}

/* ------------------------------------------------------------------ home (wallet first: flat field hero, big 2x2 actions) */
SCR.home = (a, ctx) => {
  const s = S();
  page(`<div class="band">${logoLine()}</div>
    <div class="greet"><div><small>${t('v.hi_s')}</small><b>${esc(s.name)}</b></div><a class="iconbtn" href="#/me" aria-label="${t('vm.h')}">${ic('user')}</a></div>
    <div class="balcard"><div class="t1">${esc(loc(OP.app))} <span class="num" dir="ltr" style="opacity:.85;font-weight:600">${msisdn(s.num)}</span></div>
      <div><div class="t2">${t('v.bal')} · ${C.cur()}</div><div class="bal"><div class="big-num" id="bal">${s.hide ? '<span class="num">••••••</span>' : `<span class="num">${C.fmtN(s.bal)}</span>`}</div><button class="eye" data-act="toggle-bal" aria-label="${t(s.hide ? 'v.show' : 'v.hide')}">${ic(s.hide ? 'eye-off' : 'eye')}</button></div></div></div>
    <div class="tiles">${[['agents/in', 'atm', 'v.cashin'], ['agents/out', 'cash-stack', 'v.cashout'], ['send', 'send', 'v.send_t'], ['pay', 'bill', 'v.pay']].map(([r, i, k]) => `<button class="tile4" data-go="${r}">${ic(i)}<span>${t(k)}</span></button>`).join('')}</div>
    <div class="rows-h"><h3>${t('v.recent')}</h3></div>
    <div class="rows">${s.tx.slice(0, 5).map(x => `<div class="rrow"><div><div class="t">${esc(txTitle(x))}</div><div class="s">${fdate(x.ts)}</div></div><div class="end amt ${x.amt > 0 ? 'pos' : ''}">${money(x.amt, { sign: true })}</div></div>`).join('')}</div>`, { tab: 'home', ctx });
};
SCR.pots = (a, ctx) => {
  const s = S();
  page(`${topbar(t('v.pots'), { back: false, end: `<button class="iconbtn" data-act="newpot" aria-label="${t('v.newpot')}">${ic('plus')}</button>` })}<div class="rows">${s.pots.map(p => `<a class="rrow" href="#/pot/${p.id}"><span class="lead" style="width:44px;height:44px;border-radius:12px;background:var(--f1);display:grid;place-items:center;color:var(--brand)">${ic(p.ico)}</span><div><div class="t">${t(p.n)}</div><div class="s">${t('v.pot_of', { a: `<span class="num">${Math.round(p.saved / 100)}</span>`, b: `<span class="num">${Math.round(p.goal / 100)}</span>` })}</div></div><span class="chev">${ic('chevron-right', 'flip')}</span></a>`).join('')}</div>`, { tab: 'pots', ctx });
};
C.actions['toggle-bal'] = () => { store.set(s => { s.hide = !s.hide; }); SCR.home([], { back: false }); };
C.actions.newpot = () => { const sh = sheet(`<h3>${t('v.newpot')}</h3><div class="grid3">${[['gift', 'v.pot_eid'], ['school', 'v.pot_sch'], ['phone', 'v.pot_phone']].map(([i, k]) => `<button class="card" data-n="${k}|${i}" style="display:flex;flex-direction:column;align-items:center;gap:8px;min-height:90px">${ic(i, 'lg')}<span class="tiny" style="font-weight:700">${t(k)}</span></button>`).join('')}</div>`); sh.el.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { const [k, i] = b.dataset.n.split('|'); store.set(s => { s.pots.push({ id: Date.now(), n: k, goal: 80000, saved: 0, ico: i }); }); sh.close(); toast(t('v.newpot')); SCR.home([], { back: false }); })); };

/* ------------------------------------------------------------------ map + agents */
function mapSVG(sel, mini) {
  const pins = AG.map(a => `<g transform="translate(${a.x} ${a.y})" data-ag="${a.id}" style="cursor:pointer" role="button" tabindex="0" aria-label="${esc(t(a.n))}"><circle r="${mini ? 11 : (a.id === sel ? 20 : 15)}" style="fill:${a.id === sel ? 'var(--accent)' : 'var(--surface)'};stroke:var(--brand)" stroke-width="3" class="pin"/><text y="${mini ? 4 : 5}" text-anchor="middle" style="fill:${a.id === sel ? 'var(--on-accent)' : 'var(--brand)'};font:800 ${mini ? 11 : 14}px var(--font)">${a.id}</text></g>`).join('');
  return `<svg viewBox="${mini ? '40 110 280 150' : '0 0 340 340'}" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%;display:block" aria-label="map"><rect width="340" height="340" style="fill:var(--c-mid)"/>
    <path d="M0 40 C60 60 80 30 140 56 S250 90 340 60 V0 H0Z" style="fill:var(--f1)"/><rect x="214" y="190" width="70" height="52" rx="10" style="fill:var(--f2)"/><rect x="40" y="226" width="64" height="40" rx="10" style="fill:var(--f2)"/>
    <g style="stroke:var(--surface)" stroke-width="12" fill="none" stroke-linecap="round"><path d="M0 120H340"/><path d="M0 250H340"/><path d="M120 60V340"/><path d="M230 60V340"/><path d="M0 330 330 170" stroke-width="8"/></g>
    <g style="stroke:var(--line)" stroke-width="1.5" fill="none"><path d="M0 120H340"/><path d="M0 250H340"/><path d="M120 60V340"/><path d="M230 60V340"/></g>
    ${[[20, 140, 80, 90], [140, 140, 80, 90], [250, 70, 70, 40], [20, 270, 70, 50], [140, 270, 80, 50], [250, 270, 70, 60]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:var(--surface);opacity:.75"/>`).join('')}
    ${pins}<g transform="translate(170 190)"><circle r="16" style="fill:var(--info)" opacity=".2" class="pulse"><animate attributeName="r" values="10;24;10" dur="2.4s" repeatCount="indefinite"/></circle><circle r="8" style="fill:var(--info);stroke:#fff" stroke-width="3"/></g></svg>`;
}
SCR.agents = (a, ctx) => {
  const mode = a[0] || null, id = +a[1] || null;
  if (mode && id) return cashStart(mode, id, ctx);
  if (a[0] === 'in' || a[0] === 'out') return agentPick(a[0], ctx);
  const sel = UI.sel;
  page(`${topbar(t('ag.h'), { back: false })}
    <div class="sec" style="gap:12px">
      <div class="card" style="padding:0;overflow:hidden;position:relative"><div id="map" style="height:300px">${mapSVG(sel)}</div><span class="badge" style="position:absolute;top:10px;inset-inline-start:10px;background:var(--surface)">${ic('location', 'sm')} ${t('ag.select')}</span></div>
      <div class="sec-h">${t('ag.list')}</div>
      <div class="col" id="agl">${AG.map(g => agRow(g, g.id === sel)).join('')}</div>
    </div>`, { tab: 'agents', ctx });
  const upd = n => { UI.sel = n; C.$('#map').innerHTML = mapSVG(n); C.$('#agl').innerHTML = AG.map(g => agRow(g, g.id === n)).join(''); bindMap(upd); };
  bindMap(upd);
};
const agRow = (g, on) => `<div class="card" data-agrow="${g.id}" style="display:flex;gap:12px;align-items:center;${on ? 'border-color:var(--brand);background:var(--f1)' : ''}"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--${on ? 'surface' : 'f2'});display:grid;place-items:center;color:var(--brand);flex:none;font:800 18px var(--display)">${g.id}</span><div style="flex:1;min-width:0"><b>${t(g.n)}</b><div class="sm muted">${fmtDist(g.d)} · ${t('ag.hours', { a: g.h[0], b: g.h[1] })}</div><span class="badge ${g.low ? 'warn' : 'ok'}" style="margin-top:4px">${t(g.low ? 'ag.float_low' : 'ag.float_ok')}</span></div>${on ? `<div class="col" style="gap:6px"><a class="btn sm" href="#/agents/in/${g.id}">${t('v.cashin')}</a><a class="btn sm tonal" href="#/agents/out/${g.id}">${t('v.cashout')}</a></div>` : ''}</div>`;
function bindMap(upd) {
  C.$$('[data-ag]').forEach(g => { const f = () => upd(+g.dataset.ag); g.addEventListener('click', f); g.addEventListener('keydown', e => { if (e.key === 'Enter') f(); }); });
  C.$$('[data-agrow]').forEach(r => r.addEventListener('click', e => { if (!e.target.closest('a')) upd(+r.dataset.agrow); }));
}
function agentPick(mode, ctx) {
  page(`${topbar(t(mode === 'in' ? 'cf.in_h' : 'cf.out_h'))}<div class="sec"><div class="card" style="padding:0;overflow:hidden;height:190px">${mapSVG(null)}</div><div class="col">${AG.map(g => `<a class="card" href="#/agents/${mode}/${g.id}" style="display:flex;gap:12px;align-items:center;min-height:68px"><span class="lead" style="width:44px;height:44px;border-radius:14px;background:var(--f2);display:grid;place-items:center;color:var(--brand);font:800 17px var(--display)">${g.id}</span><div style="flex:1"><b>${t(g.n)}</b><div class="sm muted">${fmtDist(g.d)}</div></div>${mode === 'out' && g.low ? `<span class="badge warn">${t('ag.float_low')}</span>` : `<span class="badge ok">${t('v.open_now')}</span>`}</a>`).join('')}</div></div>`, { ctx });
}

/* ------------------------------------------------------------------ cash in / cash out */
function cashStart(mode, id, ctx) {
  const g = AG.find(x => x.id === id); let v = '';
  page(`${topbar(t(mode === 'in' ? 'cf.in_h' : 'cf.out_h'))}<div class="sec" style="gap:14px">
    <div class="pocket f2" style="display:flex;gap:12px;align-items:center"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--surface);display:grid;place-items:center;color:var(--brand)">${ic('agent')}</span><div style="flex:1"><div class="tiny" style="opacity:.7">${t('cf.agent')}</div><b>${t(g.n)}</b><div class="tiny">${fmtDist(g.d)}</div></div><span class="badge" style="background:var(--surface);color:var(--ink)">${t('cf.fee')}: ${t('cf.free')}</span></div>
    <p class="muted" style="text-align:center">${t(mode === 'in' ? 'cf.how_in' : 'cf.how_out')}</p>
    <div style="text-align:center"><div class="big-num" id="ca" style="font-size:50px">${money(0)}</div><div class="hint" id="ch"></div></div>
    <div class="row wrap" style="justify-content:center">${[20, 50, 100, 200].map(x => `<button class="chip" data-q="${x}">${x}</button>`).join('')}</div>
    ${keypadHTML({ dec: false })}<button class="btn block" id="cg" disabled>${t('cf.get_code')}</button></div>`, { ctx });
  const upd = x => { v = x; const a = (+x || 0) * 100; C.$('#ca').innerHTML = `<span class="num">${x || '0'}</span><span class="cur">${C.cur()}</span>`; const low = mode === 'out' && a > S().bal; C.$('#ch').textContent = low ? t('cf.low_bal') : ''; C.$('#ch').style.color = 'var(--err)'; C.$('#cg').disabled = !(a > 0) || low; };
  const kp = bindKeypad(C.$('.keypad'), { max: 5, onChange: upd });
  C.$$('[data-q]').forEach(b => b.addEventListener('click', () => kp.set(b.dataset.q)));
  C.$('#cg').addEventListener('click', () => { const rec = { id: C.uid(), code: code6(), kind: mode, amt: (+v) * 100, agent: id, ts: Date.now(), st: 'wait', name: S().profile.name || S().name }; store.set(s => { s.pending.push(rec); }); UI.cur = rec.id; go('cash/code'); });
}
SCR.cash = (a, ctx) => {
  const rec = S().pending.find(p => p.id === UI.cur); if (!rec) return go('home');
  if (a[0] === 'done') return cashDone(rec, ctx);
  const g = AG.find(x => x.id === rec.agent), amtT = moneyT(rec.amt, true); let secs = 15 * 60;
  page(`${topbar(t('cf.code_h'))}<div class="sec" style="align-items:center;text-align:center;gap:14px">
    <div class="pocket f2" style="width:100%;display:flex;flex-direction:column;align-items:center;gap:10px;padding:22px"><div style="width:176px;background:#fff;color:#111;padding:10px;border-radius:20px">${fakeQR('CASH-' + rec.code, 27)}</div><div class="big-num num" dir="ltr" style="font-size:44px;letter-spacing:.06em">${spaced(rec.code)}</div><span class="badge" style="background:var(--surface);color:var(--ink)">${ic('clock', 'sm')} ${t('cf.expires', { m: `<span class="num" id="cd">15:00</span>` })}</span></div>
    <div class="list" style="width:100%;text-align:start"><div class="item"><span class="lead f2">${ic('agent')}</span><div><div class="s">${t('cf.agent')}</div><div class="t">${t(g.n)}</div></div></div><div class="item"><span class="lead f3">${ic('coins')}</span><div class="t">${t(rec.kind === 'in' ? 'v.cashin' : 'v.cashout')}</div><div class="end">${money(rec.amt)}</div></div></div>
    <p class="muted sm" style="max-width:320px">${t(rec.kind === 'in' ? 'cf.code_in' : 'cf.code_out', { a: `<b>${amtT}</b>` })}</p>
    <div class="row" style="gap:8px;color:var(--muted)"><i class="ic" style="--ic:url(${C.ICONS}refresh.svg);animation:tc-spin 1.4s linear infinite"></i> ${t('cf.waiting')}</div>
    <button class="btn block" id="sim">${ic('agent')} ${t('cf.sim')}</button><button class="btn text" id="cx">${t('cf.cancel')}</button></div><style>@keyframes tc-spin{to{transform:rotate(360deg)}}</style>`, { ctx });
  const tm = setInterval(() => { secs--; const el = C.$('#cd'); if (!el) return clearInterval(tm); el.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'); }, 1000);
  C.$('#sim').addEventListener('click', () => { clearInterval(tm); if (rec.kind === 'out') pinSheet(() => { if (finalize(rec.id)) go('cash/done'); else toast(t('cf.low_bal'), 'warning'); }); else { finalize(rec.id); go('cash/done'); } });
  C.$('#cx').addEventListener('click', () => { clearInterval(tm); store.set(s => { s.pending = s.pending.filter(p => p.id !== rec.id); }); go('home'); });
};
function finalize(id) {
  let ok = false;
  store.set(s => {
    const p = s.pending.find(x => x.id === id); if (!p || p.st === 'done') return;
    if (p.kind === 'out' && s.bal < p.amt) return;
    const comm = Math.max(25, Math.round(p.amt * 0.004));
    if (p.kind === 'in') { s.bal += p.amt; s.agent.float -= p.amt; s.agent.cash += p.amt; } else { s.bal -= p.amt; s.agent.float += p.amt; s.agent.cash -= p.amt; }
    s.agent.comm += comm; p.st = 'done'; p.comm = comm; ok = true;
    s.tx.unshift({ id: C.uid(), k: p.kind === 'in' ? 'cash_in' : 'cash_out', n: AG.find(g => g.id === p.agent).n, amt: p.kind === 'in' ? p.amt : -p.amt, ts: Date.now() });
  });
  if (ok) haptic([20, 40, 60]);
  return ok;
}
function cashDone(rec, ctx) {
  const g = AG.find(x => x.id === rec.agent);
  page(`<div class="sc-in" style="justify-content:center;align-items:center;text-align:center;padding:26px 22px;gap:14px;min-height:100%"><div class="anim-pop" style="width:112px;height:112px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center">${ic('success-check', 'xl')}</div>
    <h1 style="font:var(--dw) 28px var(--display)">${t(rec.kind === 'in' ? 'cf.done_in' : 'cf.done_out')}</h1><p class="muted" style="max-width:300px">${t(rec.kind === 'in' ? 'cf.done_in_s' : 'cf.done_out_s', { a: `<b>${moneyT(rec.amt, true)}</b>` })}</p>
    <div class="big-num">${money(S().bal)}</div><div class="tiny muted">${t('v.bal')}</div>
    <div class="list" style="width:100%;text-align:start"><div class="item"><div class="s">${t('cf.agent')}</div><div class="end">${t(g.n)}</div></div><div class="item"><div class="s">${t('p.when')}</div><div class="end">${fdate(Date.now(), { time: true })}</div></div></div>
    <button class="btn block" data-go="home">${t('p.done')}</button></div>`, { ctx });
  
}

/* ------------------------------------------------------------------ agent mode (demo of the agent's side) */
SCR.agent = (a, ctx) => {
  const s = S(), ag = s.agent, q = s.pending.filter(p => p.st === 'wait');
  page(`${topbar(t('am.h'), { back: false, end: `<button class="btn sm tonal" data-act="agent-off">${t('am.off')}</button>` })}<div class="sec stagger">
    <div class="pocket brand"><div class="row"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--accent);color:var(--on-accent);display:grid;place-items:center">${ic('store', 'lg')}</span><div><div style="font:var(--dw) 19px var(--display)">${t('am.agent_name')}</div><div class="tiny" style="opacity:.8">${esc(loc(OP.name))}</div></div></div>
      <div class="grid2" style="margin-top:14px"><div><div class="eyebrow">${t('am.float')}</div><div class="big-num" style="font-size:26px">${money(ag.float, { short: true })}</div></div><div><div class="eyebrow">${t('am.cash')}</div><div class="big-num" style="font-size:26px">${money(ag.cash, { short: true })}</div></div></div></div>
    <div class="pocket f3" style="display:flex;gap:12px;align-items:center">${ic('coins', 'xl')}<div><div class="eyebrow" style="opacity:.7">${t('am.comm')}</div><div class="big-num" style="font-size:26px">${money(ag.comm)}</div></div></div>
    <div class="sec-h">${t('am.queue')}</div>
    ${q.length ? `<div class="col">${q.map(p => `<div class="card" style="display:flex;gap:12px;align-items:center"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--f${p.kind === 'in' ? 2 : 3});display:grid;place-items:center;color:var(--brand)">${ic(p.kind === 'in' ? 'atm' : 'cash-stack')}</span><div style="flex:1"><b>${t('am.cust', { n: esc(p.name.split(' ')[0]) })}</b><div class="sm muted num" dir="ltr">${spaced(p.code)}</div><div class="sm"><b>${t(p.kind === 'in' ? 'am.take' : 'am.give', { a: moneyT(p.amt, true) })}</b></div></div><button class="btn sm" data-fin="${p.id}">${t('am.confirm')}</button></div>`).join('')}</div>` : `<div class="pocket" style="background:var(--c-mid);text-align:center;color:var(--muted)">${t('am.empty')}</div>`}
  </div>`, { ctx });
  C.$$('[data-fin]').forEach(b => b.addEventListener('click', () => { if (finalize(b.dataset.fin)) { toast(t('am.earned', { a: moneyT(S().pending.find(x => x.id === b.dataset.fin).comm, false) }), 'coins'); haptic(20); } else toast(t('cf.low_bal'), 'warning'); SCR.agent([], { back: false }); }));
};
C.actions['agent-on'] = () => { store.set(s => { s.agent.mode = true; }); go('agent'); };
C.actions['agent-off'] = () => { store.set(s => { s.agent.mode = false; }); go('home'); };

/* ------------------------------------------------------------------ pay flow */
function startPay(p) { PAY = { fee: 0, amount: 0, typed: '', ...p }; go(PAY.fixed ? 'pay/review' : 'pay/amount'); }
SCR.pay = (a, ctx) => {
  const step = a[0];
  if (step === 'amount') return payAmount(ctx); if (step === 'review') return payReview(ctx); if (step === 'done') return payDone(ctx);
  page(`${topbar(t('vp.h'), { back: false })}<div class="sec stagger">
    <div class="sec-h">${t('vp.services')}</div><div class="grid3">${SERV.map(x => `<button class="act" data-sv="${x.id}" style="min-height:96px"><span class="ico" style="background:var(--${x.f});width:62px;height:62px">${ic(x.ico, 'lg')}</span>${t(x.k)}</button>`).join('')}</div>
    <div class="card" style="display:flex;gap:12px;align-items:center"><span class="lead" style="width:50px;height:50px;border-radius:16px;background:var(--f3);display:grid;place-items:center;color:var(--brand)">${ic('qr-scan', 'lg')}</span><div style="flex:1"><b>${t('vp.shop')}</b><div class="sm muted">${t('vp.shop_s')}</div></div></div>
    <div class="field"><label for="till">${t('vp.till')}</label><input id="till" class="input ltr" inputmode="numeric" value="204118"></div><button class="btn block" id="tg">${t('vp.shop')}</button></div>`, { tab: 'pay', ctx });
  C.$$('[data-sv]').forEach(b => b.addEventListener('click', () => { const x = SERV.find(y => y.id === b.dataset.sv); startPay({ kind: x.id === 'air' || x.id === 'data' ? 'airtime' : 'bill', n: x.id === 'air' || x.id === 'data' ? '' : x.k, to: t(x.k), ico: x.ico, amount: x.amt, fixed: x.id !== 'air' && x.id !== 'data' ? true : false, title: t(x.k), sugg: [10, 20, 50] }); }));
  C.$('#tg').addEventListener('click', () => startPay({ kind: 'shop', n: 'Till ' + C.$('#till').value, to: 'Till ' + C.$('#till').value, ico: 'store', title: t('vp.shop') }));
};
function payAmount(ctx) {
  const P = PAY; if (!P) return go('pay');
  page(`${topbar(P.title || t('vs.h'))}<div class="sec" style="gap:16px">
    <div class="pocket f2" style="display:flex;align-items:center;gap:12px"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--surface);display:grid;place-items:center;color:var(--brand)">${ic(P.ico || 'user')}</span><div><div class="tiny" style="opacity:.7">${t('p.to')}</div><div style="font-weight:800">${esc(P.to)}</div>${P.sub ? `<div class="tiny num" style="opacity:.8">${esc(P.sub)}</div>` : ''}</div></div>
    <div style="text-align:center"><div class="big-num" id="amt" style="font-size:52px">${money(0)}</div><div class="hint">${P.kind === 'p2p_out' ? t('vs.fee') : ''}</div></div>
    <div class="row wrap" style="justify-content:center">${(P.sugg || [10, 20, 50, 100]).map(v => `<button class="chip" data-q="${v}">${v}</button>`).join('')}</div>${keypadHTML({ dec: true })}<button class="btn block" id="pcont" disabled>${t('p.review')}${ic('arrow-right', 'flip')}</button></div>`, { ctx });
  const kp = bindKeypad(C.$('.keypad'), { max: 7, dec: true, onChange: v => { P.amount = Math.round(parseFloat(v || '0') * 100) || 0; P.fee = P.kind === 'p2p_out' ? Math.round(P.amount * 0.005) : 0; C.$('#amt').innerHTML = `<span class="num">${v || '0'}</span><span class="cur">${C.cur()}</span>`; C.$('#pcont').disabled = !(P.amount > 0); } });
  C.$$('[data-q]').forEach(b => b.addEventListener('click', () => kp.set(String(b.dataset.q))));
  C.$('#pcont').addEventListener('click', () => go('pay/review'));
}
function payReview(ctx) {
  const P = PAY; if (!P) return go('pay'); const s = S(), total = P.amount + P.fee;
  page(`${topbar(t('p.review'))}<div class="sec" style="gap:14px"><div class="pocket brand" style="text-align:center;padding:24px"><div class="eyebrow">${t('p.amount')}</div><div class="big-num" style="margin-top:6px;font-size:46px">${money(P.amount)}</div></div>
    <div class="list"><div class="item"><span class="lead">${ic(P.ico || 'user')}</span><div><div class="s">${t('p.to')}</div><div class="t">${esc(P.to)}</div></div></div><div class="item"><span class="lead f2">${ic('wallet')}</span><div><div class="s">${t('p.from')}</div><div class="t">${esc(loc(OP.app))}</div></div><div class="end">${money(s.bal)}</div></div>
      <div class="item"><span class="lead f3">${ic('receipt')}</span><div class="t">${t('p.fee')}</div><div class="end">${P.fee ? money(P.fee) : t('p.none')}</div></div><div class="item"><span class="lead">${ic('coins')}</span><div class="t">${t('p.total')}</div><div class="end" style="font-size:18px">${money(total)}</div></div></div>
    ${total > s.bal ? `<div class="pocket" style="background:var(--err-c);color:var(--err);display:flex;gap:10px;align-items:center">${ic('warning')}<b>${t('p.low')}</b></div>` : ''}<button class="btn block" id="pay" ${total > s.bal ? 'disabled' : ''}>${ic('lock')} ${t('p.confirm')}</button></div>`, { ctx });
  C.$('#pay').addEventListener('click', () => pinSheet(() => commitPay()));
}
function pinSheet(ok) {
  let v = '';
  const sh = sheet(`<h3 style="text-align:center">${t('p.enter_pin')}</h3><div class="pin-dots" id="pd">${[0, 1, 2, 3].map(() => '<i></i>').join('')}</div><p class="hint" id="ph" style="text-align:center">${t('p.pin_hint', { p: esc(S().pin) })}</p>${keypadHTML()}${S().bio ? `<button class="btn tonal block" id="bio">${ic('face-id')} ${t('p.use_face')}</button>` : ''}`);
  const dots = sh.el.querySelector('#pd'); const bump = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  bindKeypad(sh.el.querySelector('.keypad'), { max: 4, onChange: async x => { v = x; bump(); if (v.length === 4) { await sleep(160); if (v === S().pin) { sh.close(); ok(); } else { dots.classList.add('err'); haptic(60); sh.el.querySelector('#ph').textContent = t('p.wrong'); sh.el.querySelector('#ph').style.color = 'var(--err)'; await sleep(420); dots.classList.remove('err'); v = ''; bump(); } } } });
  const bio = sh.el.querySelector('#bio'); if (bio) bio.addEventListener('click', async () => { bio.innerHTML = `${ic('face-id')} …`; await sleep(700); sh.close(); ok(); });
}
function commitPay() {
  const P = PAY, total = P.amount + P.fee;
  store.set(s => { s.bal -= total; s.tx.unshift({ id: C.uid(), k: P.kind, n: P.n || '', amt: -total, ts: Date.now() }); if (s.roundup && P.amount % 100 === 0 && P.amount % 1000 !== 0) { /* round-up demo: move the change into the first pot */ } });
  P.ref = 'SC' + Math.random().toString(36).slice(2, 8).toUpperCase(); P.at = Date.now(); haptic([20, 30, 50]); go('pay/done');
}
function payDone(ctx) {
  const P = PAY; if (!P) return go('home');
  page(`<div class="sc-in" style="justify-content:center;align-items:center;text-align:center;padding:26px 22px;gap:14px;min-height:100%"><div class="anim-pop" style="width:112px;height:112px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center">${ic('success-check', 'xl')}</div>
    <h1 style="font:var(--dw) 28px var(--display)">${t(P.kind === 'p2p_out' ? 'p.sent' : 'p.paid')}</h1><div class="big-num">${money(P.amount)}</div><p class="muted">${esc(P.to)}</p>
    <div class="list" style="width:100%;text-align:start"><div class="item"><div class="s">${t('p.ref')}</div><div class="end num" dir="ltr">${P.ref}</div></div><div class="item"><div class="s">${t('p.when')}</div><div class="end">${fdate(P.at, { time: true })}</div></div></div>
    <div class="row" style="width:100%"><button class="btn tonal" style="flex:1" data-act="share">${ic('share')} ${t('p.share')}</button><button class="btn" style="flex:1" data-go="home">${t('p.done')}</button></div></div>`, { ctx });
  
}
C.actions.share = () => toast(t('p.share'), 'share');

/* ------------------------------------------------------------------ send / receive */
SCR.send = (a, ctx) => {
  if (a[0] === 'receive') return receive(ctx);
  page(`${topbar(t('vs.h'), { back: false, end: `<a class="btn sm tonal" href="#/send/receive">${ic('receive', 'sm')} ${t('vs.receive')}</a>` })}<div class="sec">
    <div class="field"><label for="to">${t('vs.to')}</label><div class="row" style="gap:8px"><span class="input" style="width:auto;flex:none;display:flex;align-items:center"><b class="num">+218</b></span><input id="to" class="input ltr" inputmode="tel" placeholder="9X XXX XXXX"></div></div><button class="btn block" id="sn" disabled>${t('p.review')}</button>
    <div class="sec-h">${t('vs.recent')}</div><div class="list">${CONTACTS.map(c => `<button class="item" data-c="${c.id}"><span class="lead f${(c.id % 3) + 1}" style="border-radius:50%;font:800 17px var(--display)">${esc(t(c.n)[0])}</span><div><div class="t">${esc(t(c.n))}</div><div class="s num" dir="ltr">${msisdn(c.num)}</div></div></button>`).join('')}</div></div>`, { tab: 'send', ctx });
  const pick = (to, sub) => startPay({ kind: 'p2p_out', n: to, to, sub, ico: 'user', title: t('vs.h') });
  C.$$('[data-c]').forEach(b => b.addEventListener('click', () => { const c = CONTACTS.find(x => x.id === +b.dataset.c); pick(t(c.n), msisdn(c.num)); }));
  C.$('#to').addEventListener('input', e => { C.$('#sn').disabled = e.target.value.replace(/\D/g, '').length < 9; });
  C.$('#sn').addEventListener('click', () => { const d = C.$('#to').value.replace(/\D/g, ''); pick('+218 ' + d, '+218 ' + d); });
};
function receive(ctx) { const s = S(); page(`${topbar(t('vs.receive'))}<div class="sec" style="align-items:center;text-align:center"><div class="pocket f2" style="width:100%;padding:26px;display:flex;flex-direction:column;align-items:center;gap:14px"><div style="width:230px;background:#fff;color:#111;padding:14px;border-radius:24px">${fakeQR('SAHAR-' + s.num, 27)}</div><b style="font:var(--dw) 20px var(--display)">${esc(s.profile.name || s.name)}</b><div class="num big-num" dir="ltr" style="font-size:26px">${msisdn(s.num)}</div><button class="btn tonal sm" data-act="copy">${ic('copy', 'sm')} ${t('vs.receive_s')}</button></div><p class="hint">${t('c.qr_demo')}</p></div>`, { ctx }); }
C.actions.copy = () => toast(t('vs.copy'), 'copy');

/* ------------------------------------------------------------------ pots */
SCR.pot = (a, ctx) => {
  const p = S().pots.find(x => x.id === +a[0]); if (!p) return go('home');
  page(`${topbar(t(p.n))}<div class="sec" style="align-items:center;gap:16px">${ring({ pct: p.saved / p.goal, size: 180, stroke: 16, mid: `<div>${ic(p.ico, 'xl')}<div class="big-num num" style="font-size:26px;margin-top:4px">${Math.round(p.saved / p.goal * 100)}%</div></div>` })}
    <div style="text-align:center"><div class="big-num">${money(p.saved)}</div><div class="muted">${t('v.pot_of', { a: moneyT(p.saved, true), b: moneyT(p.goal, true) })}</div></div>
    <div class="row wrap" style="justify-content:center">${[10, 20, 50].map(v => `<button class="chip" data-add="${v}">+${v}</button>`).join('')}</div>
    <label class="row" style="gap:12px;width:100%"><button class="switch" id="ru" role="switch" aria-checked="${S().roundup}"></button><span>${t('v.roundup')}</span></label></div>`, { ctx });
  C.$$('[data-add]').forEach(b => b.addEventListener('click', () => { const amt = +b.dataset.add * 100; if (S().bal < amt) return toast(t('p.low'), 'warning'); store.set(s => { s.bal -= amt; const pp = s.pots.find(x => x.id === p.id); pp.saved = Math.min(pp.goal, pp.saved + amt); s.tx.unshift({ id: C.uid(), k: 'pot', n: p.n ? t(p.n) : '', amt: -amt, ts: Date.now() }); }); haptic(15); SCR.pot(a, { back: false }); }));
  C.$('#ru').addEventListener('click', e => { store.set(s => { s.roundup = !s.roundup; }); e.currentTarget.setAttribute('aria-checked', S().roundup); });
};

/* ------------------------------------------------------------------ me */
SCR.me = (a, ctx) => {
  if (a[0] === 'sim') return meSim(ctx); if (a[0] === 'limits') return meLimits(ctx); if (a[0] === 'about') return page(`${topbar(t('vm.about'))}<div class="sec"><div class="pocket f3"><p>${t('vm.about_p')}</p></div></div>`, { ctx });
  const s = S(), d = C.prefs();
  page(`${topbar(t('vm.h'), { back: false })}<div class="sec stagger">
    <div class="pocket f2" style="display:flex;gap:14px;align-items:center">${s.avatar ? `<img src="${s.avatar}" alt="" style="width:70px;height:70px;border-radius:50%;object-fit:cover;border:3px solid var(--surface)">` : `<span class="lead" style="width:70px;height:70px;border-radius:50%;background:var(--surface);display:grid;place-items:center">${ic('user', 'xl')}</span>`}<div><div style="font:var(--dw) 21px/1.15 var(--display)">${esc(s.profile.name || s.name)}</div><div class="sm num" dir="ltr" style="opacity:.8">${msisdn(s.num)}</div><span class="badge ${s.kyc === 'std' ? 'ok' : 'warn'}" style="margin-top:6px">${ic('shield-check', 'sm')} ${t(s.kyc === 'std' ? 'v.tier1' : 'v.tier1r')}</span></div></div>
    <div class="list"><a class="item" href="#/me/sim"><span class="lead f2">${ic(s.sim === 'esim' ? 'esim' : 'sim')}</span><div class="t">${t('vm.sim')}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></a><a class="item" href="#/me/limits"><span class="lead f1">${ic('chart-pie')}</span><div class="t">${t('vm.limits')}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></a>
      <div class="item"><span class="lead f3">${ic('lock')}</span><div class="t" style="flex:1">${t('vm.sec')}</div><button class="switch" id="bsw" role="switch" aria-checked="${s.bio}" aria-label="${t('ob.bio')}"></button></div>
      <button class="item" data-act="agent-on"><span class="lead f2">${ic('store')}</span><div class="t">${t('am.on')}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></button></div>
    <div class="list"><div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="t">${ic('language', 'sm')} ${t('vm.lang')}</div><div class="seg full">${['en', 'ar', 'fr'].map(l => `<button data-l="${l}" aria-pressed="${d.lang === l}" lang="${l}">${{ en: 'English', ar: 'العربية', fr: 'Français' }[l]}</button>`).join('')}</div></div>
      <div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="t">${ic('sun', 'sm')} ${t('vm.theme')}</div><div class="seg full"><button data-th="light" aria-pressed="${d.theme === 'light'}">${t('panel.light')}</button><button data-th="dark" aria-pressed="${d.theme === 'dark'}">${t('panel.dark')}</button></div><div id="looks-slot" class="card-picker"></div></div>
      <div class="item" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="lead f2">${ic('download')}</span><div style="flex:1"><div class="t">${t('vm.offline')}</div><div class="s">${t('vm.offline_s')}</div></div></div><div class="bar" id="opb" style="height:8px;display:none"><i style="width:0%;animation:none;transition:width .3s"></i></div><button class="btn tonal sm" id="opk">${ic('download', 'sm')} ${t('vm.offline')}</button></div></div>
    <div class="list"><a class="item" href="#/me/about"><span class="lead">${ic('info')}</span><div class="t">${t('vm.about')}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></a><button class="item" data-act="replay"><span class="lead f2">${ic('refresh')}</span><div class="t">${t('vm.replay')}</div></button><button class="item" data-act="reset"><span class="lead err">${ic('trash')}</span><div class="t">${t('vm.reset')}</div></button></div></div>`, { tab: 'me', ctx });
  C.$$('[data-l]').forEach(b => b.addEventListener('click', () => C.setPrefs({ lang: b.dataset.l }))); C.$$('[data-th]').forEach(b => b.addEventListener('click', () => C.setPrefs({ theme: b.dataset.th })));
  if (globalThis.Looks) globalThis.Looks.mount(C.$('#looks-slot'), { label: t('panel.look') });
  C.$('#bsw').addEventListener('click', e => { store.set(x => { x.bio = !x.bio; }); e.currentTarget.setAttribute('aria-checked', S().bio); });
  const op = C.$('#opk'); C.offlineReady().then(r => { if (r) { op.innerHTML = `${ic('success-check', 'sm')} OK`; op.disabled = true; } });
  op.addEventListener('click', async () => { op.disabled = true; const b = C.$('#opb'); b.style.display = 'block'; await C.downloadOfflinePack(p => { b.firstChild.style.width = Math.round(p * 100) + '%'; }); op.innerHTML = `${ic('success-check', 'sm')} OK`; toast(t('vm.offline')); });
};
C.actions.replay = () => { OBN.configure(OBCFG); store.set(s => { s.onboarded = false; }); go('ob/welcome'); };
C.actions.reset = () => { store.reset(); OBN.configure(OBCFG); go('ob/welcome'); };
function meSim(ctx) { const s = S(); page(`${topbar(t('vsim.h'))}<div class="sec"><div class="pocket brand" style="display:flex;gap:14px;align-items:center">${ic(s.sim === 'esim' ? 'esim' : 'sim', 'xl')}<div><div style="font:var(--dw) 20px var(--display)">${esc(loc(OP.name))}</div><div class="num" dir="ltr">${msisdn(s.num)}</div><span class="badge ok" style="margin-top:6px">${t('vsim.status')} · 4G+</span></div></div><div class="list"><div class="item"><div class="s">${t('vsim.iccid')}</div><div class="end num" dir="ltr">8921 8002 •••• 7710</div></div></div></div>`, { ctx }); }
function meLimits(ctx) { const std = S().kyc === 'std'; page(`${topbar(t('vl.h'))}<div class="sec stagger"><div class="pocket f2" style="display:flex;gap:12px;align-items:center">${ic('shield-check', 'xl')}<b>${t(std ? 'v.tier1' : 'v.tier1r')}</b></div><div class="list">${[['vl.daily', std ? 250000 : 50000], ['vl.monthly', std ? 1500000 : 300000], ['vl.max', std ? 800000 : 200000]].map(([k, v]) => `<div class="item"><div class="t">${t(k)}</div><div class="end">${money(v, { short: true })}</div></div>`).join('')}</div><div class="pocket f3" style="display:flex;gap:12px;align-items:center">${ic('agent', 'xl')}<div><b>${t('v.upgrade')}</b><div class="sm" style="opacity:.8">${t('v.tier2')}. ${t('v.upgrade_s')}</div></div></div></div>`, { ctx }); }

/* ------------------------------------------------------------------ boot */
const OBCFG = {
  id: 'vega', op: OP, plans: PLANS,
  art: () => `<svg viewBox="0 0 280 170" width="280" height="170" role="img" aria-label="${t('ob.v.h')}"><g style="color:var(--brand)"><rect x="18" y="86" width="82" height="62" rx="12" fill="none" stroke="currentColor" stroke-width="4"/><path d="M18 106h82" stroke="currentColor" stroke-width="4"/><circle cx="40" cy="128" r="8" style="fill:var(--accent)"/>
    <rect x="96" y="14" width="88" height="142" rx="18" fill="none" stroke="currentColor" stroke-width="4"/><rect x="120" y="22" width="40" height="6" rx="3" fill="currentColor" opacity=".5"/><circle cx="140" cy="76" r="26" style="fill:var(--accent)"/><text x="140" y="86" text-anchor="middle" style="fill:var(--on-accent);font:800 28px var(--display)">S</text><rect x="110" y="116" width="60" height="8" rx="4" fill="currentColor" opacity=".5"/>
    <g transform="translate(196 92)"><rect width="66" height="56" rx="12" fill="none" stroke="currentColor" stroke-width="4"/><path d="M8 18h50M18 30h30" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M12 56v14M54 56v14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></g>
    <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".5"><path d="M190 40a40 40 0 0 1 0 54"/><path d="M204 28a60 60 0 0 1 0 78"/></g></g></svg>`,
  onSkip: () => { store.set(s => { s.onboarded = true; }); go('home'); },
  onFinish: ob => {
    store.set(s => {
      s.onboarded = true; const p = ob.profile || {}; s.profile = { name: p.name || 'Karim Bensalem' }; s.name = (p.name || 'Karim').split(' ')[0]; s.kyc = ob.kyc && ob.kyc.decision === 'accepted' ? 'std' : (ob.kyc ? 'basic' : 'std'); s.avatar = p.selfie || null;
      s.num = ob.phone && ob.phone.length >= 13 ? ob.phone : OP.number; s.sim = ob.sim; s.pin = ob.pin || '1234'; s.bio = ob.bio; s.bal = 0; s.tx = []; s.pending = [];
      s.pots = s.pots.map(x => ({ ...x, saved: 0 })); s.agent.mode = false;
      s.bal = 20000; s.tx.unshift({ id: C.uid(), k: 'cash_in', n: 'ag.1', amt: 20000, ts: Date.now() });
    });
    go('home');
  },
};
function boot() {
  C.applyPrefs();
  C.shell({ id: 'vega', title: { en: 'Neptune Vega for Telco', ar: 'نبتون فيغا للاتصالات', fr: 'Neptune Vega pour opérateurs' }, onPanel: a => { if (a === 'replay') C.actions.replay(); if (a === 'reset') C.actions.reset(); } });
  OBN.configure(OBCFG);
  C.onPrefs(() => { if (C.path() === 'ob/id' && OBN.onLangChange()) return; C.rerender(); });
  C.router(handle);
  if (!sessionStorage.getItem('telco.vega.splash') && !C.EMBED) { sessionStorage.setItem('telco.vega.splash', '1'); C.splash(`<span class="opmark" style="font-size:34px;animation:tc-pop .8s var(--spring) both"><i style="width:54px;height:54px;font-size:30px;border-radius:18px">${OP.mark}</i>${esc(loc(OP.app))}</span>`, 1200); }
  C.registerSW('../sw.js');
}
boot();
