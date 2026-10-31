// Sahar Cash: agent-network wallet inside the Sahar mobile operator. Cash in and out through street agents, send, pay, vouchers, savings pots.
// Identity check on the device. State in localStorage ("telco.vega.v2").
import * as C from '../shared/core.js';
import * as OBN from '../shared/onboarding.js';
import * as VCH from '../shared/vouchers.js';
import * as SET from '../shared/settings.js';
import './strings.js';
const { heroBar, t, ic, esc, loc, money, moneyT, fdate, ago, go, view, sheet, toast, haptic, sleep, confetti, ring, fakeQR, msisdn, keypadHTML, bindKeypad, lockup, byDay, int } = C;
const DAY = 864e5;

const OP = { name: { en: 'Sahar Mobile', ar: 'سحر موبايل', fr: 'Sahar Mobile' }, app: { en: 'Sahar Cash', ar: 'سحر كاش', fr: 'Sahar Cash' }, short: { en: 'Sahar', ar: 'سحر', fr: 'Sahar' }, number: '+218925550177' };

/* brand mark: a sun rising over the horizon, inside two tide rings */
let MK = 0;
const markBody = (ink = 'currentColor') => { const i = 'sm' + (++MK); return `<defs><linearGradient id="${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2A512"/></linearGradient></defs><g fill="none" stroke="${ink}" stroke-linecap="round" stroke-width="5"><path d="M12 44A20 20 0 0 1 52 44" opacity=".8"/><path d="M4 44A28 28 0 0 1 60 44" opacity=".42"/><path d="M6 53H58" opacity=".95"/></g><path d="M20 44A12 12 0 0 1 44 44Z" fill="url(#${i})"/>`; };
const saharMark = n => `<svg width="${n}" height="${n}" viewBox="0 0 64 64" aria-hidden="true" style="overflow:visible">${markBody()}</svg>`;
const PLANS = [{ id: 'voice', name: 'vpl.voice', desc: 'vpl.voice_d', price: 0, f: 'f2', icon: 'voice' }, { id: 'family', name: 'vpl.family', desc: 'vpl.family_d', price: 1500, f: 'f1', icon: 'users' }, { id: 'data', name: 'vpl.data', desc: 'vpl.data_d', price: 3000, f: 'f3', icon: 'data' }];
C.add({ 'vpl.voice': ['Sahar Talk', 'سحر توك', 'Sahar Talk'], 'vpl.voice_d': ['Cheap calls, pay as you go', 'مكالمات رخيصة والدفع حسب الاستخدام', 'Appels pas chers, à l’usage'], 'vpl.family': ['Sahar Family', 'سحر العائلة', 'Sahar Famille'], 'vpl.family_d': ['5 GB + free calls to 3 family numbers', '5 غيغا + مكالمات مجانية لثلاثة أرقام عائلية', '5 Go + appels gratuits vers 3 numéros famille'], 'vpl.data': ['Sahar Net', 'سحر نت', 'Sahar Net'], 'vpl.data_d': ['25 GB for streaming and study', '25 غيغا للمشاهدة والدراسة', '25 Go pour streaming et études'] });

const AG = [
  { id: 1, n: 'ag.1', d: 120, x: 206, y: 150, h: ['08:00', '22:00'], low: false, r: 4.8, rv: 212, st: 'open' }, { id: 2, n: 'ag.2', d: 260, x: 262, y: 84, h: ['09:00', '23:00'], low: false, r: 4.6, rv: 98, st: 'open' }, { id: 3, n: 'ag.3', d: 380, x: 96, y: 92, h: ['07:00', '21:00'], low: false, r: 4.9, rv: 341, st: 'open' },
  { id: 4, n: 'ag.4', d: 520, x: 286, y: 170, h: ['08:00', '20:00'], low: true, r: 4.4, rv: 57, st: 'closing' }, { id: 5, n: 'ag.5', d: 910, x: 56, y: 176, h: ['09:00', '18:00'], low: false, r: 4.7, rv: 120, st: 'open' },
];
const MERCH = [{ id: 1, n: 'vm.m1', ico: 'store' }, { id: 2, n: 'vm.m2', ico: 'insurance' }, { id: 3, n: 'vm.m3', ico: 'shopping-bag' }, { id: 4, n: 'vm.m4', ico: 'atm' }];
const SERV = [{ id: 'air', ico: 'topup', k: 'vp.air', amt: 2000, f: 'f1' }, { id: 'data', ico: 'data', k: 'vp.data', amt: 1500, f: 'f2' }, { id: 'pow', ico: 'bolt', k: 'vp.pow', amt: 4725, f: 'f3' }, { id: 'wat', ico: 'drop', k: 'vp.wat', amt: 1260, f: 'f1' }, { id: 'tv', ico: 'tv', k: 'vp.tv', amt: 2200, f: 'f2' }, { id: 'sch', ico: 'school', k: 'vp.sch', amt: 15000, f: 'f3' }];
const CONTACTS = [{ id: 1, n: 'vc.person.1', num: '+218913330101' }, { id: 2, n: 'vc.person.2', num: '+218914440102' }, { id: 3, n: 'vc.person.3', num: '+218925550103' }, { id: 4, n: 'vc.person.4', num: '+218917770105' }];

function seed() {
  const n = Date.now();
  return {
    onboarded: false, name: 'Karim', pin: '1234', bio: true, num: OP.number, sim: 'sim', kyc: 'std', profile: {}, avatar: null, bal: 92500, hide: false, roundup: true, vouchers: [],
    pots: [{ id: 1, n: 'v.pot_eid', goal: 50000, saved: 31000, ico: 'gift' }, { id: 2, n: 'v.pot_sch', goal: 150000, saved: 60000, ico: 'school' }, { id: 3, n: 'v.pot_phone', goal: 120000, saved: 18000, ico: 'phone' }],
    pending: [], agent: { mode: false, float: 850000, cash: 420000, comm: 1240 },
    tx: [{ id: 'a1', k: 'cash_in', n: 'ag.1', amt: 50000, ts: n - 5 * 36e5 }, { id: 'a2', k: 'p2p_out', n: 'vc.person.2', amt: -8000, ts: n - 1 * DAY }, { id: 'a3', k: 'airtime', n: '', amt: -2000, ts: n - 2 * DAY }, { id: 'a4', k: 'remit', n: 'vc.sender', amt: 120000, ts: n - 4 * DAY }, { id: 'a5', k: 'cash_out', n: 'ag.2', amt: -30000, ts: n - 6 * DAY }],
  };
}
const fin = n => Number.isFinite(n);
const okState = s => s && typeof s === 'object' && fin(s.bal) && typeof s.name === 'string' && /^\+\d{12}$/.test(s.num) && /^\d{4}$/.test(s.pin)
  && Array.isArray(s.tx) && s.tx.every(x => x && typeof x.k === 'string' && typeof x.n === 'string' && fin(x.amt) && fin(x.ts))
  && Array.isArray(s.pots) && s.pots.every(p => p && fin(p.id) && fin(p.goal) && p.goal > 0 && fin(p.saved) && /^v\.pot_[a-z]+$/.test(p.n) && /^[a-z-]+$/.test(p.ico))
  && Array.isArray(s.pending) && s.pending.every(p => p && typeof p.id === 'string' && /^\d{6}$/.test(p.code) && ['in', 'out'].includes(p.kind) && fin(p.amt) && AG.some(g => g.id === p.agent) && typeof p.name === 'string')
  && s.agent && fin(s.agent.float) && fin(s.agent.cash) && fin(s.agent.comm) && s.profile && typeof s.profile === 'object'
  && (s.avatar == null || typeof s.avatar === 'string') && (s.vouchers == null || Array.isArray(s.vouchers));
const store = C.store('telco.vega.v2', seed, okState);
const S = () => store.get();
let PAY = null, UI = { sel: 1, shown: false };

const tabbar = cur => C.dock(cur, [['home', 'home', 'v.t.home'], ['agents', 'location', 'v.t.agents']], [['vouchers', 'gift', 'v.t.vouchers'], ['me', 'user', 'v.t.me']]);
const page = (inner, { tab, ctx } = {}) => view(`<div class="screen${ctx && ctx.back ? ' back' : ''}"><div class="sc-in">${inner}</div></div>${tab ? tabbar(tab) : ''}`, { tab: !!tab });
const topbar = (title, { back = true, end = '' } = {}) => `<div class="topbar">${back ? `<button class="iconbtn" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}<h2>${title}</h2>${end}</div>`;
const nm = k => (k && /^(vc\.|ag\.|vch\.|v\.pot_|vp\.|vm\.m)/.test(k) && C.DICT[k]) ? t(k) : (k || '');
const txTitle = x => t('tx.' + x.k, { n: nm(x.n) });
const TXICO = { cash_in: ['atm', 'g3'], cash_out: ['cash-stack', 'g2'], p2p_out: ['send', 'g1'], p2p_in: ['receive', 'g3'], airtime: ['topup', 'g5'], bill: ['bill', 'g4'], shop: ['qr-scan', 'g2'], remit: ['globe', 'g3'], pot: ['savings', 'g1'], voucher: ['gift', 'g2'] };
const txRow = x => { const [i, g] = TXICO[x.k] || ['wallet', 'g1']; return `<div class="tx"><span class="gly ${g}">${ic(i)}</span><div><div class="t">${esc(txTitle(x))}</div><div class="s">${fdate(x.ts, { time: true })}</div></div><div class="end amt ${x.amt > 0 ? 'pos' : ''}">${money(x.amt, { sign: true })}</div></div>`; };
const txGroups = list => byDay(list).map(g => `<div class="dayh">${g.label}</div><div class="txg">${g.items.map(txRow).join('')}</div>`).join('');
const initials = () => (S().profile.name || S().name || 'K').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = () => /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(S().avatar || '') ? `<img src="${S().avatar}" alt="">` : esc(initials());
const heroTop = () => `<div class="hrow">${lockup(32)}<span class="sp"></span><a class="iconbtn glass" href="#/notifications" aria-label="${t('n.title')}">${ic('bell')}<i class="dot">2</i></a><a class="avatar" href="#/me" aria-label="${t('v.t.me')}">${avatar()}</a></div>`;
const fmtDist = d => d < 1000 ? t('v.m', { n: d }) : t('v.km', { n: (d / 1000).toFixed(1) });
const code6 = () => String(Math.floor(100000 + Math.random() * 900000));
const spaced = c => c.slice(0, 3) + ' ' + c.slice(3);

const SCR = {};
function handle(parts, ctx) {
  const s = S();
  if (s.onboarded && parts[0] === 'ob') { C.replace('home'); return; }
  if (!s.onboarded) { if (parts[0] === 'ob' && OBN.route(parts, ctx)) return; C.replace('ob/welcome'); return; }
  (SCR[parts[0] || 'home'] || SCR.home)(parts.slice(1), ctx);
  C.countUp(C.appEl());
}

/* ------------------------------------------------------------------ home */
SCR.home = (a, ctx) => {
  const s = S(), sel = UI.sel, near = AG.slice(0, 3);
  page(`<div class="hero sh"><div class="rings"></div>${heroTop()}
      <div class="greet"><small>${t('v.hi', { name: `<bdi>${esc(s.name)}</bdi>` })}</small></div>
      <div class="row" style="margin-top:6px"><span class="eyebrow" style="opacity:.85">${t('v.bal')} · ${C.cur()}</span><button class="eye" data-act="toggle-bal" aria-label="${t(s.hide ? 'v.show' : 'v.hide')}" aria-pressed="${!!s.hide}">${ic(s.hide ? 'eye-off' : 'eye')}</button></div>
      <div class="big-num" style="margin-top:-6px">${s.hide ? '<span class="num">••••••</span>' : money(s.bal, { cur: false })}</div>
      <div class="row wrap" style="gap:8px;margin-top:12px"><span class="gchip">${ic('phone', 'sm')} <span class="num" dir="ltr">${msisdn(s.num)}</span></span><span class="gchip">${ic('shield-check', 'sm')} ${t(s.kyc === 'std' ? 'v.tier1' : 'v.tier1r')}</span></div>
      <div class="cashbtns"><a class="btn" href="#/agents/in">${ic('atm')} ${t('v.cashin')}</a><a class="btn glass" href="#/agents/out">${ic('cash-stack')} ${t('v.cashout')}</a></div></div>
    <div class="sheetbody"><nav class="qa c4" aria-label="${t('h.quick')}">${[['send', 'send', 'v.send_t'], ['pay', 'bill', 'v.pay'], ['vouchers', 'gift', 'v.t.vouchers'], ['pots', 'savings', 'v.t.pots']].map(([r, i, k]) => `<button data-go="${r}"><span class="qi">${ic(i)}</span><span>${t(k)}</span></button>`).join('')}</nav>
      <div class="sec-h" style="padding:24px 18px 10px">${t('v.nearby')}<a class="more" href="#/agents">${t('v.see_all')}</a></div>
      <div class="sec" style="padding-top:0;gap:10px"><div class="maptile" id="map" style="height:176px">${mapSVG(sel)}</div><div class="col" id="agl" style="gap:8px">${near.map(g => agRow(g, g.id === sel)).join('')}</div></div>
      <div class="sec-h" style="padding:14px 18px 0">${t('v.pots')}<a class="more" href="#/pots">${t('v.see_all')}</a></div>
      <div class="hscroll">${s.pots.map(p => `<a class="pot" href="#/pot/${p.id}"><span class="gly g2">${ic(p.ico)}</span><div style="flex:1;min-width:0"><b>${t(p.n)}</b><div class="tiny muted">${t('v.pot_of', { a: `<span class="num">${Math.round(p.saved / 100)}</span>`, b: `<span class="num">${Math.round(p.goal / 100)}</span>` })}</div><div class="bar" aria-hidden="true"><i style="width:${Math.round(p.saved / p.goal * 100)}%"></i></div></div></a>`).join('')}</div>
      <div class="sec" style="padding-top:0"><div class="sec-h">${t('v.feed')}<a class="more" href="#/activity">${t('v.see_all')}</a></div>${txGroups(s.tx.slice(0, 6)).replace(/^<div class="dayh">/, '<div class="dayh" style="padding-top:2px">')}</div></div>`, { tab: 'home', ctx });
  const upd = n => { UI.sel = n; C.$('#map').innerHTML = mapSVG(n); C.$('#agl').innerHTML = near.map(g => agRow(g, g.id === n)).join(''); bindMap(upd); };
  bindMap(upd);
};
SCR.activity = (a, ctx) => page(`${heroBar(t('v.feed'))}<div class="sec" style="padding-top:0">${txGroups(S().tx)}</div>`, { ctx });
SCR.pots = (a, ctx) => {
  const s = S();
  page(`${heroBar(t('v.pots'), { end: `<button class="iconbtn glass" data-act="newpot" aria-label="${t('v.newpot')}">${ic('plus')}</button>` })}<div class="sec" style="padding-top:0;gap:10px">${s.pots.map(p => `<a class="pot" href="#/pot/${p.id}" style="min-width:0"><span class="gly g2">${ic(p.ico)}</span><div style="flex:1;min-width:0"><b>${t(p.n)}</b><div class="tiny muted">${t('v.pot_of', { a: `<span class="num">${Math.round(p.saved / 100)}</span>`, b: `<span class="num">${Math.round(p.goal / 100)}</span>` })}</div><div class="bar" aria-hidden="true"><i style="width:${Math.round(p.saved / p.goal * 100)}%"></i></div></div>${ic('chevron-right', 'flip')}</a>`).join('')}</div>`, { ctx });
};
C.actions['toggle-bal'] = () => { store.set(s => { s.hide = !s.hide; }); SCR.home([], { back: false }); };
C.actions.newpot = () => { const sh = sheet(`<h3>${t('v.newpot')}</h3><div class="grid3">${[['gift', 'v.pot_eid'], ['school', 'v.pot_sch'], ['phone', 'v.pot_phone']].map(([i, k]) => `<button class="card" data-n="${k}|${i}" style="display:flex;flex-direction:column;align-items:center;gap:8px;min-height:90px;box-shadow:inset 0 0 0 1.5px var(--line)">${ic(i, 'lg')}<span class="tiny" style="font-weight:700">${t(k)}</span></button>`).join('')}</div>`); sh.el.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { const [k, i] = b.dataset.n.split('|'); store.set(s => { s.pots.push({ id: Date.now(), n: k, goal: 80000, saved: 0, ico: i }); }); sh.close(); toast(t('v.newpot')); C.rerender(); })); };

/* ------------------------------------------------------------------ stylised map tile + agents */
function mapSVG(sel) {
  const pin = a => { const on = a.id === sel; return `<g transform="translate(${a.x} ${a.y})${on ? ' scale(1.25)' : ''}" data-ag="${a.id}" class="pin" role="button" tabindex="0" aria-label="${esc(t(a.n))}"><ellipse cy="18" rx="9" ry="3" fill="#000" opacity=".18"/><path d="M0 -22C9 -22 15 -16 15 -8C15 3 0 17 0 17C0 17 -15 3 -15 -8C-15 -16 -9 -22 0 -22Z" style="fill:${on ? 'var(--accent)' : 'var(--brand)'}" stroke="#fff" stroke-width="2.5"/><text y="-4" text-anchor="middle" style="fill:${on ? 'var(--on-accent)' : 'var(--on-brand)'};font:800 13px var(--font)">${a.id}</text></g>`; };
  return `<svg viewBox="0 0 340 220" preserveAspectRatio="xMidYMid slice" role="group" aria-label="${t('ag.h')}"><rect width="340" height="220" style="fill:var(--c-mid)"/>
    <path d="M-10 40C50 62 96 20 160 44S270 74 350 40V-10H-10Z" style="fill:var(--g5)" opacity=".9"/><path d="M-10 54C50 76 96 34 160 58S270 88 350 54" fill="none" style="stroke:var(--g5i)" stroke-width="1.4" opacity=".35"/>
    <rect x="224" y="118" width="62" height="40" rx="14" style="fill:var(--g3)"/><rect x="30" y="140" width="56" height="34" rx="12" style="fill:var(--g3)"/>
    ${[[16, 96, 62, 36], [100, 96, 58, 44], [188, 96, 24, 18], [16, 190, 70, 24], [100, 150, 50, 26], [190, 150, 24, 44], [300, 100, 30, 56], [226, 168, 70, 40], [100, 190, 60, 26], [256, 76, 56, 22]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" style="fill:var(--surface)" opacity=".8"/>`).join('')}
    <g fill="none" stroke-linecap="round"><g style="stroke:var(--surface)" stroke-width="11"><path d="M-10 90H350"/><path d="M-10 146H350"/><path d="M92 40V230"/><path d="M182 40V230"/><path d="M-10 206 350 100" stroke-width="8"/></g><g style="stroke:var(--line)" stroke-width="1" stroke-dasharray="5 6"><path d="M-10 90H350"/><path d="M-10 146H350"/><path d="M92 40V230"/><path d="M182 40V230"/></g></g>
    <g transform="translate(170 120)"><circle r="14" style="fill:var(--info)" opacity=".22"><animate attributeName="r" values="9;26;9" dur="2.6s" repeatCount="indefinite"/></circle><circle r="7.5" style="fill:var(--info)" stroke="#fff" stroke-width="3"/></g>
    ${AG.filter(a => a.id !== sel).map(pin).join('')}${AG.filter(a => a.id === sel).map(pin).join('')}</svg>`;
}
const stars = r => `<span class="stars">${ic('star')}<span class="num">${r.toFixed(1)}</span></span>`;
const openB = g => `<span class="open ${g.st === 'closing' ? 'closing' : ''}"><i></i>${t(g.st === 'closing' ? 'ag.closing' : 'v.open_now')}</span>`;
const agRow = (g, on) => `<div class="agrow ${on ? 'on' : ''}" data-agrow="${g.id}" ${on ? '' : 'role="button" tabindex="0"'}><span class="no">${g.id}</span><div style="flex:1;min-width:0"><b>${t(g.n)}</b><div class="m">${stars(g.r)}<span>${fmtDist(g.d)}</span>${openB(g)}</div>${on ? `<div class="row" style="gap:8px;margin-top:10px"><a class="btn sm" href="#/agents/in/${g.id}" style="flex:1">${t('v.cashin')}</a><a class="btn sm tonal" href="#/agents/out/${g.id}" style="flex:1">${t('v.cashout')}</a></div>` : ''}</div>${on ? '' : `<span class="badge ${g.low ? 'warn' : 'ok'}">${t(g.low ? 'ag.float_low' : 'ag.float_ok')}</span>`}</div>`;
function bindMap(upd) {
  C.$$('[data-ag]').forEach(g => { const f = () => upd(+g.dataset.ag); g.addEventListener('click', f); g.addEventListener('keydown', e => { if (e.key === 'Enter') f(); }); });
  C.$$('[data-agrow]').forEach(r => r.addEventListener('click', e => { if (!e.target.closest('a')) upd(+r.dataset.agrow); }));
}
SCR.agents = (a, ctx) => {
  const mode = a[0] || null, id = +a[1] || null;
  if (mode && id) return cashStart(mode, id, ctx);
  if (a[0] === 'in' || a[0] === 'out') return agentPick(a[0], ctx);
  const sel = UI.sel, f = UI.af || 'near';
  const list = () => AG.filter(g => f !== 'open' || g.st === 'open').slice().sort((x, y) => f === 'top' ? y.r - x.r : x.d - y.d);
  page(`${heroBar(t('ag.h'), { back: false })}
    <div class="sec" style="gap:12px;padding-top:0"><div class="maptile" id="map" style="height:250px">${mapSVG(sel)}</div>
      <div class="chips" style="padding:0 0 2px;margin-inline:-18px;padding-inline:18px" role="group" aria-label="${t('ag.list')}">${[['near', 'ag.f_near'], ['top', 'ag.f_top'], ['open', 'ag.f_open']].map(([k, l]) => `<button class="chip" data-af="${k}" aria-pressed="${f === k}">${t(l)}</button>`).join('')}</div>
      <div class="col" id="agl" style="gap:8px">${list().map(g => agRow(g, g.id === sel)).join('')}</div></div>`, { tab: 'agents', ctx });
  const upd = n => { UI.sel = n; C.$('#map').innerHTML = mapSVG(n); C.$('#agl').innerHTML = list().map(g => agRow(g, g.id === n)).join(''); bindMap(upd); };
  bindMap(upd);
  C.$$('[data-af]').forEach(b => b.addEventListener('click', () => { UI.af = b.dataset.af; SCR.agents([], { back: false }); }));
};
function agentPick(mode, ctx) {
  page(`${heroBar(t(mode === 'in' ? 'cf.in_h' : 'cf.out_h'), { back: 'home' })}<div class="sec" style="padding-top:0"><div class="maptile" style="height:170px">${mapSVG(null)}</div><div class="col" style="gap:8px">${AG.map(g => `<a class="agrow" href="#/agents/${mode}/${g.id}"><span class="no">${g.id}</span><div style="flex:1;min-width:0"><b>${t(g.n)}</b><div class="m">${stars(g.r)}<span>${fmtDist(g.d)}</span>${openB(g)}</div></div>${mode === 'out' && g.low ? `<span class="badge warn">${t('ag.float_low')}</span>` : ic('chevron-right', 'flip')}</a>`).join('')}</div></div>`, { ctx });
}

/* ------------------------------------------------------------------ cash in / cash out */
function cashStart(mode, id, ctx) {
  const g = AG.find(x => x.id === id); if (!g || !['in', 'out'].includes(mode)) return C.replace('agents'); let v = '';
  page(`${heroBar(t(mode === 'in' ? 'cf.in_h' : 'cf.out_h'), { back: 'agents/' + mode })}<div class="sec" style="gap:14px;padding-top:0">
    <div class="agrow" style="cursor:default"><span class="no">${g.id}</span><div style="flex:1;min-width:0"><b>${t(g.n)}</b><div class="m">${stars(g.r)}<span>${fmtDist(g.d)}</span>${openB(g)}</div></div><span class="badge ok">${t('cf.fee')}: ${t('cf.free')}</span></div>
    <p class="muted" style="text-align:center">${t(mode === 'in' ? 'cf.how_in' : 'cf.how_out')}</p>
    <div style="text-align:center"><div class="big-num" id="ca" style="font-size:52px">${money(0)}</div><div class="hint" id="ch"></div></div>
    <div class="row wrap" style="justify-content:center">${[20, 50, 100, 200].map(x => `<button class="chip" data-q="${x}">${x}</button>`).join('')}</div>
    ${keypadHTML({ dec: false })}<button class="btn block" id="cg" disabled>${t('cf.get_code')}</button></div>`, { ctx });
  const upd = x => { v = x; const a = (+x || 0) * 100; C.$('#ca').innerHTML = `<span class="num">${x || '0'}</span><span class="cur">${C.cur()}</span>`; const low = mode === 'out' && a > S().bal; C.$('#ch').textContent = low ? t('cf.low_bal') : ''; C.$('#ch').style.color = 'var(--err)'; C.$('#cg').disabled = !(a > 0) || low; };
  const kp = bindKeypad(C.$('.keypad'), { max: 5, onChange: upd });
  C.$$('[data-q]').forEach(b => b.addEventListener('click', () => kp.set(b.dataset.q)));
  C.$('#cg').addEventListener('click', e => { if (e.currentTarget.disabled) return; e.currentTarget.disabled = true; const rec = { id: C.uid(), code: code6(), kind: mode, amt: (+v) * 100, agent: id, ts: Date.now(), st: 'wait', name: S().profile.name || S().name }; store.set(s => { s.pending.push(rec); }); UI.cur = rec.id; go('cash/code'); });
}
SCR.cash = (a, ctx) => {
  // after a reload the code page picks up the newest open request, with the time it has left
  const rec = S().pending.find(p => p.id === UI.cur) || S().pending.filter(p => p.st === 'wait').slice(-1)[0]; if (!rec) return C.replace('home');
  UI.cur = rec.id;
  if (a[0] === 'done') return rec.st === 'done' ? cashDone(rec, ctx) : C.replace('cash/code');
  if (rec.st === 'done') return C.replace('cash/done');
  const g = AG.find(x => x.id === rec.agent), amtT = moneyT(rec.amt, true); let secs = Math.max(0, 15 * 60 - Math.floor((Date.now() - rec.ts) / 1000));
  page(`${heroBar(t('cf.code_h'), { back: 'home' })}<div class="sec" style="gap:14px;padding-top:0">
    <div class="ticket"><div class="ticket-top"><div style="width:184px;background:#fff;color:#0B2A2D;padding:10px;border-radius:20px;box-shadow:inset 0 0 0 1.5px var(--line)">${fakeQR('CASH-' + rec.code, 27)}</div><span class="badge info">${ic('clock', 'sm')} ${t('cf.expires', { m: `<span class="num" id="cd">${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}</span>` })}</span></div>
      <div class="ticket-cut"></div><div class="ticket-bot"><div class="eyebrow muted">${t('cf.otp')}</div><div class="code" dir="ltr">${spaced(rec.code)}</div></div></div>
    <div class="list"><div class="item"><span class="lead f2">${ic('agent')}</span><div><div class="s">${t('cf.agent')}</div><div class="t">${t(g.n)}</div></div></div><div class="item"><span class="lead f3">${ic('coins')}</span><div class="t">${t(rec.kind === 'in' ? 'v.cashin' : 'v.cashout')}</div><div class="end" style="font-size:17px">${money(rec.amt)}</div></div></div>
    <p class="muted sm" style="text-align:center;max-width:320px;align-self:center">${t(rec.kind === 'in' ? 'cf.code_in' : 'cf.code_out', { a: `<b>${amtT}</b>` })}</p>
    <div class="row" style="gap:8px;color:var(--muted);justify-content:center" aria-live="polite"><i class="ic" style="--ic:url(${C.ICONS}refresh.svg);animation:tc-spin 1.4s linear infinite"></i> <span id="cw">${t('cf.waiting')}</span></div>
    <button class="btn block" id="cpin" hidden>${ic('lock')} ${t('p.enter_pin')}</button>
    <button class="btn text" id="cx" style="align-self:center">${t('cf.cancel')}</button></div>`, { ctx });
  let stop = false; const here = () => !stop && C.$('#cd') && C.path() === 'cash/code';
  const tm = setInterval(() => { secs = Math.max(0, secs - 1); const el = C.$('#cd'); if (!el || C.path() !== 'cash/code') { stop = true; return clearInterval(tm); } el.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'); const p = S().pending.find(x => x.id === rec.id); if (p && p.st === 'done') { stop = true; clearInterval(tm); C.reset('home', 'cash/done'); } }, 1000);
  // the agent scans the code a few seconds later; a withdrawal then asks for the customer's PIN
  const askPin = () => { C.$('#cpin').hidden = true; pinSheet(() => { if (finalize(rec.id)) { stop = true; C.reset('home', 'cash/done'); } else toast(t('cf.low_bal'), 'warning'); }, { onCancel: () => { if (here()) C.$('#cpin').hidden = false; } }); };
  C.$('#cpin').addEventListener('click', askPin);
  setTimeout(() => { if (!here()) return; if (rec.kind === 'out') { C.$('#cw').textContent = t('cf.confirm_pin'); askPin(); } else { finalize(rec.id); stop = true; C.reset('home', 'cash/done'); } }, 7000);
  C.$('#cx').addEventListener('click', () => { stop = true; clearInterval(tm); store.set(s => { s.pending = s.pending.filter(p => p.id !== rec.id); }); C.reset('home'); });
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
  page(C.success({ title: t(rec.kind === 'in' ? 'cf.done_in' : 'cf.done_out'), sub: t(rec.kind === 'in' ? 'cf.done_in_s' : 'cf.done_out_s', { a: `<b>${moneyT(rec.amt, true)}</b>` }), big: `<div class="tiny muted">${t('v.bal')}</div><div class="big-num" style="margin-top:2px">${money(S().bal)}</div>`,
    rows: `<div class="list"><div class="item"><div class="s">${t('cf.agent')}</div><div class="end">${t(g.n)}</div></div><div class="item"><div class="s">${t('p.when')}</div><div class="end">${fdate(Date.now(), { time: true })}</div></div></div>`, foot: `<button class="btn block" data-go="home">${t('p.done')}</button>` }), { ctx });
  confetti(C.appEl(), 36, .6);
}

/* ------------------------------------------------------------------ agent mode (the agent's side of a cash-in or cash-out) */
SCR.agent = (a, ctx) => {
  const s = S(), ag = s.agent, q = s.pending.filter(p => p.st === 'wait');
  page(`${heroBar(t('am.h'), { back: false, end: `<button class="btn sm glass" data-act="agent-off">${t('am.off')}</button>` })}<div class="sec stagger">
    <div class="pocket brand"><div class="row"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--accent);color:var(--on-accent);display:grid;place-items:center">${ic('store', 'lg')}</span><div><div style="font:var(--dw) 19px var(--display)">${t('am.agent_name')}</div><div class="tiny" style="opacity:.8">${esc(loc(OP.name))}</div></div></div>
      <div class="grid2" style="margin-top:14px"><div><div class="eyebrow">${t('am.float')}</div><div class="big-num" style="font-size:26px">${money(ag.float, { short: true })}</div></div><div><div class="eyebrow">${t('am.cash')}</div><div class="big-num" style="font-size:26px">${money(ag.cash, { short: true })}</div></div></div></div>
    <div class="pocket f3" style="display:flex;gap:12px;align-items:center">${ic('coins', 'xl')}<div><div class="eyebrow" style="opacity:.7">${t('am.comm')}</div><div class="big-num" style="font-size:26px">${money(ag.comm)}</div></div></div>
    <div class="sec-h">${t('am.queue')}</div>
    ${q.length ? `<div class="col">${q.map(p => `<div class="card" style="display:flex;gap:12px;align-items:center"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--f${p.kind === 'in' ? 2 : 3});display:grid;place-items:center;color:var(--brand)">${ic(p.kind === 'in' ? 'atm' : 'cash-stack')}</span><div style="flex:1"><b>${t('am.cust', { n: esc(p.name.split(' ')[0]) })}</b><div class="sm muted num" dir="ltr">${spaced(p.code)}</div><div class="sm"><b>${t(p.kind === 'in' ? 'am.take' : 'am.give', { a: moneyT(p.amt, true) })}</b></div></div><button class="btn sm" data-fin="${p.id}">${t('am.confirm')}</button></div>`).join('')}</div>` : `<div class="pocket" style="background:var(--c-mid);text-align:center;color:var(--muted)">${t('am.empty')}</div>`}
  </div>`, { ctx });
  C.$$('[data-fin]').forEach(b => b.addEventListener('click', () => { if (finalize(b.dataset.fin)) { toast(t('am.earned', { a: moneyT(S().pending.find(x => x.id === b.dataset.fin).comm, false) }), 'coins'); haptic(20); } else toast(t('cf.low_bal'), 'warning'); SCR.agent([], { back: false }); }));
};
C.actions['agent-on'] = () => { store.set(s => { s.agent.mode = true; }); go('agent'); };
C.actions['agent-off'] = () => { store.set(s => { s.agent.mode = false; }); C.reset('home'); };

/* ------------------------------------------------------------------ pay flow */
function startPay(p) { PAY = { fee: 0, amount: 0, typed: '', ...p }; go(PAY.fixed ? 'pay/review' : 'pay/amount'); }
SCR.pay = (a, ctx) => {
  const step = a[0];
  if (step === 'amount') return payAmount(ctx); if (step === 'review') return payReview(ctx); if (step === 'done') return payDone(ctx);
  page(`${heroBar(t('vp.h'))}<div class="sec stagger">
    <div class="sec-h">${t('vp.services')}</div><div class="grid3">${SERV.map(x => `<button class="act" data-sv="${x.id}" style="min-height:96px"><span class="ico" style="background:var(--${x.f});width:62px;height:62px">${ic(x.ico, 'lg')}</span>${t(x.k)}</button>`).join('')}</div>
    <div class="card" style="display:flex;gap:12px;align-items:center"><span class="lead" style="width:50px;height:50px;border-radius:16px;background:var(--f3);display:grid;place-items:center;color:var(--brand)">${ic('qr-scan', 'lg')}</span><div style="flex:1"><b>${t('vp.shop')}</b><div class="sm muted">${t('vp.shop_s')}</div></div></div>
    <div class="field"><label for="till">${t('vp.till')}</label><input id="till" class="input ltr" inputmode="numeric" maxlength="8" autocomplete="off" value="204118"></div><button class="btn block" id="tg">${t('vp.shop')}</button></div>`, { tab: 'pay', ctx });
  C.$$('[data-sv]').forEach(b => b.addEventListener('click', () => { const x = SERV.find(y => y.id === b.dataset.sv); startPay({ kind: x.id === 'air' || x.id === 'data' ? 'airtime' : 'bill', n: x.id === 'air' || x.id === 'data' ? '' : x.k, to: t(x.k), ico: x.ico, amount: x.amt, fixed: x.id !== 'air' && x.id !== 'data' ? true : false, title: t(x.k), sugg: [10, 20, 50] }); }));
  const till = () => C.$('#till').value.replace(/\D/g, '');
  C.$('#till').addEventListener('input', () => { C.$('#tg').disabled = !/^\d{4,8}$/.test(till()); });
  C.$('#tg').addEventListener('click', () => { if (!/^\d{4,8}$/.test(till())) return; const n = t('vp.till_n', { n: till() }); startPay({ kind: 'shop', n, to: n, ico: 'store', title: t('vp.shop') }); });
};
function payAmount(ctx) {
  const P = PAY; if (!P) return C.replace('pay');
  page(`${topbar(P.title || t('vs.h'))}<div class="sec" style="gap:16px">
    <div class="pocket f2" style="display:flex;align-items:center;gap:12px"><span class="lead" style="width:46px;height:46px;border-radius:14px;background:var(--surface);display:grid;place-items:center;color:var(--brand)">${ic(P.ico || 'user')}</span><div><div class="tiny" style="opacity:.7">${t('p.to')}</div><div style="font-weight:800">${esc(P.to)}</div>${P.sub ? `<div class="tiny num" style="opacity:.8">${esc(P.sub)}</div>` : ''}</div></div>
    <div style="text-align:center"><div class="big-num" id="amt" style="font-size:52px">${money(0)}</div><div class="hint">${P.kind === 'p2p_out' ? t('vs.fee') : ''}</div></div>
    <div class="row wrap" style="justify-content:center">${(P.sugg || [10, 20, 50, 100]).map(v => `<button class="chip" data-q="${v}">${v}</button>`).join('')}</div>${keypadHTML({ dec: true })}<button class="btn block" id="pcont" disabled>${t('p.review')}${ic('arrow-right', 'flip')}</button></div>`, { ctx });
  const kp = bindKeypad(C.$('.keypad'), { max: 7, dec: true, onChange: v => { P.amount = Math.round(parseFloat(v || '0') * 100) || 0; P.fee = P.kind === 'p2p_out' ? Math.round(P.amount * 0.005) : 0; C.$('#amt').innerHTML = `<span class="num">${v || '0'}</span><span class="cur">${C.cur()}</span>`; C.$('#pcont').disabled = !(P.amount > 0); } });
  C.$$('[data-q]').forEach(b => b.addEventListener('click', () => kp.set(String(b.dataset.q))));
  C.$('#pcont').addEventListener('click', () => go('pay/review'));
}
function payReview(ctx) {
  const P = PAY; if (!P) return C.replace('pay'); const s = S(), total = P.amount + P.fee;
  page(`${topbar(t('p.review'))}<div class="sec" style="gap:14px"><div class="pocket brand" style="text-align:center;padding:24px"><div class="eyebrow">${t('p.amount')}</div><div class="big-num" style="margin-top:6px;font-size:46px">${money(P.amount)}</div></div>
    <div class="list"><div class="item"><span class="lead">${ic(P.ico || 'user')}</span><div><div class="s">${t('p.to')}</div><div class="t">${esc(P.to)}</div></div></div><div class="item"><span class="lead f2">${ic('wallet')}</span><div><div class="s">${t('p.from')}</div><div class="t">${esc(loc(OP.app))}</div></div><div class="end">${money(s.bal)}</div></div>
      <div class="item"><span class="lead f3">${ic('receipt')}</span><div class="t">${t('p.fee')}</div><div class="end">${P.fee ? money(P.fee) : t('p.none')}</div></div><div class="item"><span class="lead">${ic('coins')}</span><div class="t">${t('p.total')}</div><div class="end" style="font-size:18px">${money(total)}</div></div></div>
    ${total > s.bal ? `<div class="pocket" style="background:var(--err-c);color:var(--err);display:flex;gap:10px;align-items:center">${ic('warning')}<b>${t('p.low')}</b></div>` : ''}<button class="btn block" id="pay" ${total > s.bal ? 'disabled' : ''}>${ic('lock')} ${t('p.confirm')}</button></div>`, { ctx });
  C.$('#pay').addEventListener('click', () => pinSheet(() => commitPay()));
}
const pinSheet = (ok, o = {}) => C.pinSheet(ok, { pin: () => S().pin, bio: S().bio, ...o });
function commitPay() {
  const P = PAY, total = P.amount + P.fee;
  store.set(s => { s.bal -= total; s.tx.unshift({ id: C.uid(), k: P.kind, n: P.n || '', amt: -total, ts: Date.now() }); });
  P.ref = 'SC' + Math.random().toString(36).slice(2, 8).toUpperCase(); P.at = Date.now(); haptic([20, 30, 50]); C.reset('home', 'pay/done');
}
function payDone(ctx) {
  const P = PAY; if (!P) return C.replace('home');
  page(C.success({ title: t(P.kind === 'p2p_out' ? 'p.sent' : 'p.paid'), sub: esc(P.to), big: `<div class="big-num">${money(P.amount)}</div>`,
    rows: `<div class="list"><div class="item"><div class="s">${t('p.ref')}</div><div class="end num" dir="ltr">${P.ref}</div></div><div class="item"><div class="s">${t('p.when')}</div><div class="end">${fdate(P.at, { time: true })}</div></div></div>`,
    foot: `<div class="row"><button class="btn tonal" style="flex:1" data-act="share">${ic('share')} ${t('p.share')}</button><button class="btn" style="flex:1" data-go="home">${t('p.done')}</button></div>` }), { ctx });
  confetti(C.appEl(), 30, .5);
}
C.actions.share = () => toast(t('p.share'), 'share');

/* ------------------------------------------------------------------ send / receive */
SCR.send = (a, ctx) => {
  if (a[0] === 'receive') return receive(ctx);
  page(`${heroBar(t('vs.h'), { end: `<a class="btn sm glass" href="#/send/receive">${ic('receive', 'sm')} ${t('vs.receive')}</a>` })}<div class="sec">
    <div class="field"><label for="to">${t('vs.to')}</label><div class="row" dir="ltr" style="gap:8px"><span class="input" style="width:auto;flex:none;display:flex;align-items:center"><b class="num">+218</b></span><input id="to" class="input ltr" inputmode="tel" placeholder="9X XXX XXXX"></div></div><button class="btn block" id="sn" disabled>${t('p.review')}</button>
    <div class="sec-h">${t('vs.recent')}</div><div class="list">${CONTACTS.map(c => `<button class="item" data-c="${c.id}"><span class="lead f${(c.id % 3) + 1}" style="border-radius:50%;font:800 17px var(--display)">${esc(t(c.n)[0])}</span><div><div class="t">${esc(t(c.n))}</div><div class="s num" dir="ltr">${msisdn(c.num)}</div></div></button>`).join('')}</div></div>`, { tab: 'send', ctx });
  const pick = (to, sub) => startPay({ kind: 'p2p_out', n: to, to, sub, ico: 'user', title: t('vs.h') });
  C.$$('[data-c]').forEach(b => b.addEventListener('click', () => { const c = CONTACTS.find(x => x.id === +b.dataset.c); pick(t(c.n), msisdn(c.num)); }));
  C.$('#to').addEventListener('input', e => { C.$('#sn').disabled = e.target.value.replace(/\D/g, '').length < 9; });
  C.$('#sn').addEventListener('click', () => { const d = C.$('#to').value.replace(/\D/g, ''); pick('+218 ' + d, '+218 ' + d); });
};
function receive(ctx) { const s = S(); page(`${topbar(t('vs.receive'))}<div class="sec" style="align-items:center;text-align:center"><div class="pocket f2" style="width:100%;padding:26px;display:flex;flex-direction:column;align-items:center;gap:14px"><div style="width:230px;background:#fff;color:#111;padding:14px;border-radius:24px">${fakeQR('SAHAR-' + s.num, 27)}</div><b style="font:var(--dw) 20px var(--display)">${esc(s.profile.name || s.name)}</b><div class="num big-num" dir="ltr" style="font-size:26px">${msisdn(s.num)}</div><button class="btn tonal sm" data-act="copy">${ic('copy', 'sm')} ${t('vs.receive_s')}</button></div></div>`, { ctx }); }
C.actions.copy = () => toast(t('vs.copy'), 'copy');

/* ------------------------------------------------------------------ pots */
SCR.pot = (a, ctx) => {
  const p = S().pots.find(x => x.id === +a[0]); if (!p) return C.replace('pots');
  page(`${topbar(t(p.n))}<div class="sec" style="align-items:center;gap:16px">${ring({ pct: p.saved / p.goal, size: 180, stroke: 16, mid: `<div>${ic(p.ico, 'xl')}<div class="big-num num" style="font-size:26px;margin-top:4px">${Math.round(p.saved / p.goal * 100)}%</div></div>` })}
    <div style="text-align:center"><div class="big-num">${money(p.saved)}</div><div class="muted">${t('v.pot_of', { a: moneyT(p.saved, true), b: moneyT(p.goal, true) })}</div></div>
    <div class="row wrap" style="justify-content:center">${[10, 20, 50].map(v => `<button class="chip" data-add="${v}">+${v}</button>`).join('')}</div>
    <label class="row" style="gap:12px;width:100%"><button class="switch" id="ru" role="switch" aria-checked="${S().roundup}" aria-label="${t('v.roundup')}"></button><span>${t('v.roundup')}</span></label></div>`, { ctx });
  C.$$('[data-add]').forEach(b => b.addEventListener('click', () => { const amt = +b.dataset.add * 100; if (S().bal < amt) return toast(t('p.low'), 'warning'); store.set(s => { s.bal -= amt; const pp = s.pots.find(x => x.id === p.id); pp.saved = Math.min(pp.goal, pp.saved + amt); s.tx.unshift({ id: C.uid(), k: 'pot', n: p.n, amt: -amt, ts: Date.now() }); }); haptic(15); SCR.pot(a, { back: false }); }));
  C.$('#ru').addEventListener('click', e => { store.set(s => { s.roundup = !s.roundup; }); e.currentTarget.setAttribute('aria-checked', S().roundup); });
};

/* ------------------------------------------------------------------ me */
const ST = SET.install({ page, S, store, avatar, markBig: saharMark, op: OP, aboutKey: 'vm.about_p', signout: () => { OBN.configure(OBCFG); store.set(s => { s.onboarded = false; }); C.reset('ob/welcome'); }, kyc: s => ({ ok: s.kyc === 'std', key: s.kyc === 'std' ? 'v.tier1' : 'v.tier1r' }),
  notifs: [['n.1', 'atm', 'g3'], ['n.2', 'savings', 'g1'], ['n.3', 'gift', 'g2']],
  rows: link => `${link('pots', 'f2', 'savings', 'v.pots')}${link('me/sim', 'f2', S().sim === 'esim' ? 'esim' : 'sim', 'vm.sim')}${link('me/limits', 'f1', 'chart-pie', 'vm.limits')}${link('notifications', '', 'bell', 'n.title')}<button class="item" data-act="agent-on"><span class="lead f3">${ic('store')}</span><div class="t">${t('am.on')}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></button>` });
SCR.me = (a, ctx) => { if (a[0] === 'sim') return meSim(ctx); if (a[0] === 'limits') return meLimits(ctx); if (a[0] === 'about') return ST.about(ctx); ST.me(ctx); };
SCR.notifications = (a, ctx) => ST.notifications(ctx);
function meSim(ctx) { const s = S(); page(`${heroBar(t('vsim.h'), { back: 'me' })}<div class="sec"><div class="pocket brand" style="display:flex;gap:14px;align-items:center">${ic(s.sim === 'esim' ? 'esim' : 'sim', 'xl')}<div><div style="font:var(--dw) 20px var(--display)">${esc(loc(OP.name))}</div><div class="num" dir="ltr">${msisdn(s.num)}</div><span class="badge ok" style="margin-top:6px">${t('vsim.status')} · 4G+</span></div></div><div class="list"><div class="item"><div class="s">${t('vsim.iccid')}</div><div class="end num" dir="ltr">8921 8002 •••• 7710</div></div></div></div>`, { ctx }); }
function meLimits(ctx) { const std = S().kyc === 'std'; page(`${heroBar(t('vl.h'), { back: 'me' })}<div class="sec stagger"><div class="pocket f2" style="display:flex;gap:12px;align-items:center">${ic('shield-check', 'xl')}<b>${t(std ? 'v.tier1' : 'v.tier1r')}</b></div><div class="list">${[['vl.daily', std ? 250000 : 50000], ['vl.monthly', std ? 1500000 : 300000], ['vl.max', std ? 800000 : 200000]].map(([k, v]) => `<div class="item"><div class="t">${t(k)}</div><div class="end">${money(v, { short: true })}</div></div>`).join('')}</div><div class="pocket f3" style="display:flex;gap:12px;align-items:center">${ic('agent', 'xl')}<div><b>${t('v.upgrade')}</b><div class="sm" style="opacity:.8">${t('v.tier2')}. ${t('v.upgrade_s')}</div></div></div></div>`, { ctx }); }

/* ------------------------------------------------------------------ boot */
/* scan to pay */
SCR.scan = () => C.scanView({ merch: MERCH, onPick: id => { const m = MERCH.find(x => x.id === id); startPay({ kind: 'shop', n: m.n, to: t(m.n), ico: m.ico, title: t('vp.shop') }); } });

/* vouchers */
const V = VCH.install({ S, store, page, pinSheet, op: OP, contacts: CONTACTS, hero: heroTop, mark64: () => `<g transform="translate(-2 -1)">${markBody('#fff')}</g>`, own: ['#05434A', '#0C8A82'] });
SCR.vouchers = (a, ctx) => V.screen(a, ctx);

const scene = () => `<svg viewBox="0 0 360 270" role="img" aria-label="${t('ob.v.h')}"><defs><linearGradient id="ws" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A8"/><stop offset="1" stop-color="#F2A512"/></linearGradient><linearGradient id="wg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#fff" stop-opacity=".08"/></linearGradient></defs>
  <g transform="translate(180 168)"><circle class="wl-ring" r="86" fill="none" stroke="#fff" stroke-width="2"/><circle class="wl-ring r2" r="86" fill="none" stroke="#fff" stroke-width="2"/><circle class="wl-ring r3" r="86" fill="none" stroke="#fff" stroke-width="2"/><path d="M-66 0A66 66 0 0 1 66 0Z" fill="#FFC23D" opacity=".2"/><path d="M-44 0A44 44 0 0 1 44 0Z" fill="url(#ws)"/></g>
  <g fill="#03282D" opacity=".5"><rect x="20" y="150" width="46" height="60" rx="8"/><rect x="72" y="132" width="40" height="78" rx="8"/><rect x="248" y="138" width="44" height="72" rx="8"/><rect x="298" y="156" width="44" height="54" rx="8"/></g>
  <rect x="0" y="206" width="360" height="5" rx="2.5" fill="#fff" opacity=".85"/>
  <g class="float"><g transform="translate(38 36) rotate(-6)"><rect width="176" height="62" rx="22" fill="#fff"/><g transform="translate(14 13)"><circle cx="18" cy="18" r="18" fill="#FFC23D"/><path d="M10 18l6 6 12-13" fill="none" stroke="#2B1A00" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g><text x="64" y="26" fill="#05434A" opacity=".7" style="font:700 11px 'Hanken Grotesk',sans-serif">Sahar Cash</text><text x="64" y="46" fill="#0B2A2D" style="font:800 17px 'Hanken Grotesk',sans-serif" direction="ltr">+ 50.00 LYD</text></g></g>
  <g class="float" style="animation-delay:-2.2s"><g transform="translate(214 42) rotate(5)"><rect width="118" height="56" rx="20" fill="url(#wg)" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/><g fill="#fff" transform="translate(16 14)"><rect width="26" height="26" rx="8" opacity=".9"/><path d="M6 13h14M13 6v14" stroke="#05434A" stroke-width="2.6" stroke-linecap="round"/></g><text x="52" y="24" fill="#fff" style="font:800 13px 'Hanken Grotesk',sans-serif">Agent 1</text><text x="52" y="40" fill="#fff" opacity=".8" style="font:600 11px 'Hanken Grotesk',sans-serif" direction="ltr">120 m · 4.8</text></g></g></svg>`;
const OBCFG = {
  id: 'sahar', op: OP, plans: PLANS, scene, feats: [['id-card', 'ob.f_id'], ['agent', 'ob.f_agents'], ['gift', 'ob.f_vch']],
  account: () => S().acct ? { first: S().name, num: S().num, pin: S().pin, bio: S().bio, avatar: avatar() } : null,
  onLogin: ob => { store.set(s => { s.onboarded = true; s.acct = true; if (ob) { s.pin = ob.pin; s.num = ob.phone; } }); C.reset('home'); },
  onFinish: ob => {
    store.set(s => {
      s.onboarded = true; s.acct = true; const p = ob.profile || {}; s.profile = { name: p.name || 'Karim Bensalem' }; s.name = (p.name || 'Karim').split(' ')[0]; s.kyc = ob.kyc && ob.kyc.decision === 'accepted' ? 'std' : (ob.kyc ? 'basic' : 'std'); s.avatar = p.selfie || null;
      s.num = ob.phone && ob.phone.length >= 13 ? ob.phone : OP.number; s.sim = ob.sim; s.pin = ob.pin || '1234'; s.bio = ob.bio; s.bal = 0; s.tx = []; s.pending = [];
      s.agent.mode = false; s.hide = false; s.vouchers = [];
      s.bal = 20000; s.tx.unshift({ id: C.uid(), k: 'cash_in', n: 'ag.1', amt: 20000, ts: Date.now() });
    });
    C.reset('home');
  },
};
function boot() {
  C.shell({ id: 'sahar', op: OP, mark: saharMark, themeColor: ['#05434A', '#021A1E'] });
  OBN.configure(OBCFG);
  C.onPrefs(() => { if (C.path() === 'ob/id' && OBN.onLangChange()) return; C.rerender(); });
  C.router(handle);
  if (!sessionStorage.getItem('telco.sahar.splash')) { sessionStorage.setItem('telco.sahar.splash', '1'); C.splash(`<div class="rings"></div><span class="lockup">${saharMark(64)}<b>${esc(loc(OP.app))}</b></span>`, 1200); }
  C.registerSW('../sw.js');
}
boot();
