// Secondary pages re-drawn in the calm language: plain rows, one primary action, no tonal card piles.
import { st, t, add, ic, esc, money, moneyT, numT, tenantName, vegaMark, fmtDate } from '../assets/core.js';
import { reg, hdr, scr, nm, go, back, sheet, closeSheet, toast, pin, processing, switchEl, wait, rerender, $, $$ } from './kit.js';
import { S, MERCH } from './data.js';
import { bIcon } from './s-services.js';
import { catGlyph } from './glyphs.js';

const bar = (v, cls = '') => `<span class="thin ${cls}"><i style="width:${Math.min(100, v)}%"></i></span>`;
const plain = h => `<div class="rows plain">${h}</div>`;
const lr = (icon, title, sub, end, attrs = '', tag = 'button') => `<${tag} class="lr" ${attrs}>${icon ? `<span class="lri">${icon}</span>` : ''}<span class="lt"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>${end ? `<span class="le">${end}</span>` : ''}</${tag}>`;
const big = (label, amt, sub = '') => `<div class="amtc"><small class="muted">${label}</small><div class="amt-row sm"><span class="amt-v">${amt}</span><span class="amt-c">${st.cur}</span></div>${sub ? `<small class="muted">${sub}</small>` : ''}</div>`;
const gl = s => `<div class="gl">${s}</div>`;

/* ---------- Pockets ---------- */
reg('pockets', {
  render() {
    const tot = S.pockets.reduce((a, p) => a + p.saved, 0);
    return scr(big(t('pk_saved'), money(tot, { nocur: true })) + plain(S.pockets.map(p => `<button class="lr" data-go="pocket" data-p='{"id":"${p.id}"}'><span class="lri">${ic(p.icon)}</span><span class="lt"><b>${esc(nm(p.name))}</b><small>${t('pk_goal', { g: money(p.goal, { dec: 0 }) })}</small>${bar(p.saved / p.goal * 100)}</span><span class="le"><b>${money(p.saved, { nocur: true, dec: 0 })}</b></span></button>`).join('')) +
      plain(`<div class="lr"><span class="lt"><b>${t('pk_roundup')}</b><small>${t('pk_roundup_s')}</small></span>${switchEl('ru', true)}</div>`), { head: hdr(t('pk_title')), foot: `<button class="btn block lg" data-go="pocketnew">${t('pk_new')}</button>` });
  }
});
reg('pocket', {
  render({ id }) {
    const p = S.pockets.find(x => x.id === id) || S.pockets[0];
    return scr(big(esc(nm(p.name)), money(p.saved, { nocur: true }), t('pk_goal', { g: money(p.goal, { dec: 0 }) })) + bar(p.saved / p.goal * 100, 'tall') + `<p class="small muted center">${t('pk_eta', { d: t('pk_eta_v') })}</p>` +
      plain(lr(ic('refresh'), t('pk_rules'), p.rule === 'weekly' ? t('pk_rule_weekly', { a: money(p.amt, { dec: 0 }) }) : p.rule === 'roundup' ? t('pk_rule_roundup') : t('pk_rule_none'), '', '', 'div') + `<div class="lr"><span class="lt"><b>${t('pk_lock')}</b></span>${switchEl('lk', !!p.locked)}</div>`), { head: hdr(esc(nm(p.name))), foot: `<button class="btn block lg" data-act="add">${t('pk_add')}</button><button class="btn text block" data-act="take" ${p.locked ? 'disabled' : ''}>${t('pk_take')}</button>` });
  },
  mount(el, { id }) {
    const p = S.pockets.find(x => x.id === id) || S.pockets[0];
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return; let v = 5000;
      const sh = sheet(`<h3>${t(a === 'add' ? 'pk_add' : 'pk_take')}</h3><div class="rows plain">${[2000, 5000, 10000, 20000].map(x => `<button class="pr" role="radio" aria-checked="${x === 5000}" data-v="${x}"><span class="pl"><b>${money(x, { nocur: true })} ${st.cur}</b></span><i class="rad"></i></button>`).join('')}</div><button class="btn block lg" id="go">${t('confirm')}</button>`);
      sh.addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (b) { v = +b.dataset.v; $$('[data-v]', sh).forEach(x => x.setAttribute('aria-checked', x === b)); } });
      $('#go', sh).addEventListener('click', async () => { closeSheet(); await wait(300); await processing(t('proc'), 700); if (a === 'add') { p.saved += v; S.balance -= v; } else { p.saved -= v; S.balance += v; } rerender(el); toast(t('pk_added', { n: nm(p.name) })); });
    });
  }
});

/* ---------- Insights ---------- */
const CATS = [['groceries', 61860], ['food', 38200], ['bills', 38400], ['transport', 24000], ['shopping', 23100], ['health', 9200]];
reg('insights', {
  render(p, el) {
    const mk = +(el._m || 0), k = [1, 1.05, .9][mk], tot = Math.round(CATS.reduce((a, c) => a + c[1], 0) * k);
    const mon = o => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - o); return fmtDate(d, { month: 'long' }); }, cap = s => s[0].toUpperCase() + s.slice(1);
    return scr(`<div class="seg">${[0, 1, 2].map(x => `<button aria-pressed="${mk === x}" data-m="${x}">${cap(mon(x))}</button>`).join('')}</div>` + big(t('in_spent', { m: st.lang === 'fr' ? mon(mk) : cap(mon(mk)) }), money(tot, { nocur: true }), mk === 0 ? t('in_vs', { p: '4.5' }) : '') +
      gl(t('in_cats')) + plain(CATS.map(([c, v]) => lr(catGlyph(c, 20), t('cat_' + c), bar(v * k / tot * 220), money(Math.round(v * k), { nocur: true, dec: 0 }), '', 'div')).join('')) +
      gl(t('in_budget')) + plain([['food', 38200, 40000], ['groceries', 61860, 80000], ['shopping', 23100, 20000]].map(([c, u, b]) => lr('', t('cat_' + c), bar(u / b * 100, u > b ? 'warn' : ''), `<bdi dir="ltr">${money(u, { nocur: true, dec: 0 })} / ${money(b, { nocur: true, dec: 0 })}</bdi>`, '', 'div')).join('')) +
      gl(t('in_top')) + plain([['m2', 22000], ['m1', 18500], ['m4', 14000]].map(([m, a]) => lr('', esc(nm(MERCH.find(x => x.id === m))), '', money(-a, { nocur: true }), '', 'div')).join('')), { head: hdr(t('in_title')) });
  },
  mount(el) { el.addEventListener('click', e => { const m = e.target.closest('[data-m]'); if (m) { el._m = m.dataset.m; rerender(el); } }); }
});

/* ---------- Rewards ---------- */
reg('rewards', {
  render(p, el) {
    const R = S.rewards;
    return scr(big(t('rw_cb'), money(R.cashback, { nocur: true })) + `<small class="muted center">${t('rw_tier', { p: '740' })}</small>` +
      gl(t('rw_streak')) + plain(lr('', `<span class="num">${R.streak}</span> / 7`, bar(R.streak / 7 * 100), '', '', 'div')) +
      gl(t('rw_missions')) + plain([['rw_m1', 2, 3, '2.00'], ['rw_m2', 1, 1, '1.00'], ['rw_m3', 0, 1, '1.50']].map(([k, a, b, r]) => lr('', t(k), bar(a / b * 100), `+${r}`, '', 'div')).join('')) +
      plain(lr(ic('star'), t('rw_daily'), el._rev ? t('rw_won', { a: '0.50' }) : t('rw_reveal'), el._rev ? money(50, { sign: true, nocur: true }) : '', 'data-act="rev"')), { head: hdr(t('rw_title')), foot: `<button class="btn block lg" data-act="red">${t('rw_redeem')}</button>` });
  },
  mount(el) { el.addEventListener('click', e => { const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'rev' && !el._rev) { el._rev = 1; S.rewards.cashback += 50; S.balance += 50; rerender(el); } if (a === 'red') toast(t('rw_red_ok'), 'wallet'); }); }
});

/* ---------- Referrals ---------- */
reg('referrals', {
  render() {
    return scr(`<div class="amtc"><small class="muted">${t('rf_code')}</small><div class="amt-row sm"><span class="amt-v ltr">AMIRA-24</span></div><small class="muted">${t('rf_hero')}</small></div>` +
      plain(lr(ic('copy'), t('rf_copy'), '', '', 'data-copy="AMIRA-24"')) + gl(t('rf_ladder')) +
      plain([[3, 20], [5, 50], [10, 120]].map(([n, a]) => lr('', t('rf_m', { n }), bar(Math.min(100, 2 / n * 100)), `+${a}.00`, '', 'div')).join('')) +
      gl(t('rf_friends')) + plain([['Mariam Zayed', 'مريم زايد', 'rf_joined'], ['Hana Rizk', 'هناء رزق', 'rf_joined'], ['Samir Jaber', 'سمير جابر', 'rf_inv']].map(([e, a, k]) => lr('', st.lang === 'ar' ? a : e, t(k), '', '', 'div')).join('')), { head: hdr(t('rf_title')), foot: `<button class="btn block lg" data-act="shr">${t('rf_share')}</button>` });
  },
  mount(el) { el.addEventListener('click', e => { if (e.target.closest('[data-act=shr]')) toast(t('share'), 'share'); }); }
});
add({ rf_copy: 'Copy code§Copier le code§نسخ الرمز' });

/* ---------- Cards ---------- */
const face = (c) => `<div class="cardflat ${c.kind} ${c.frozen ? 'frz' : ''}"><div class="cf-top"><span class="cf-brand">${vegaMark('currentColor')}<b>${esc(tenantName())}</b></span><span class="cf-kind">${t('c_' + c.kind)}</span></div><div class="cf-num mono">•••• •••• •••• ${c.last4}</div><div class="cf-bot"><span>${t('c_holder')}</span><span class="mono">${c.exp}</span></div>${c.frozen ? `<div class="cf-frost"><b>${t('c_frozen')}</b></div>` : ''}</div>`;
reg('cards', {
  render(p, el) {
    const i = el._k ?? 0, c = S.cards[i];
    return scr(`<div class="seg">${S.cards.map((k, x) => `<button aria-selected="${x === i}" data-k="${x}">${t('c_' + k.kind)} ·${k.last4}</button>`).join('')}</div>${face(c)}` +
      (c.kind === 'physical' && c.status === 'shipping' ? `<p class="center muted">${t('c_ship')}</p>` : plain(lr(ic('eye'), t('c_show'), '', '', 'data-act="show"') + `<div class="lr"><span class="lt"><b>${t('c_freeze')}</b></span>${switchEl('frz', !!c.frozen)}</div><div class="lr"><span class="lt"><b>${t('c_online')}</b></span>${switchEl('onl', true)}</div><div class="lr"><span class="lt"><b>${t('c_tap')}</b></span>${switchEl('tap', c.kind === 'physical')}</div>` + lr(ic('security-shield'), t('c_limits'), '', ic('chevron-right', 'sm flip'), 'data-go="limits"'))), { head: hdr(t('c_title')), foot: `<button class="btn block lg" data-act="${S.cards.some(k => k.kind === 'physical') ? 'newv' : 'ord'}">${S.cards.some(k => k.kind === 'physical') ? t('c_new_t') : t('c_order')}</button>` });
  },
  mount(el) {
    el.addEventListener('click', async e => {
      const k = e.target.closest('[data-k]'); if (k) { el._k = +k.dataset.k; rerender(el); return; }
      const sw = e.target.closest('.switch[data-sw=frz]'); if (sw) { await wait(60); S.cards[el._k ?? 0].frozen = sw.getAttribute('aria-checked') === 'true' ? 1 : 0; rerender(el); toast(t(S.cards[el._k ?? 0].frozen ? 'c_frozen' : 'saved_toast'), 'lock'); return; }
      const a = e.target.closest('[data-act]')?.dataset.act, c = S.cards[el._k ?? 0];
      if (a === 'show') pin(() => { const sh = sheet(`<h3>${t('c_show')}</h3><div class="kv2"><div><span class="muted">${t('c_num')}</span><b class="mono">4291 7730 5518 ${c.last4}</b></div><div><span class="muted">${t('c_exp')}</span><b class="mono">${c.exp}</b></div><div><span class="muted">${t('c_cvv')}</span><b class="mono">731</b></div></div><p class="small muted center">${t('c_reveal_t', { s: 15 })}</p>`); setTimeout(() => { if (sh.isConnected) closeSheet(); }, 15000); });
      if (a === 'newv') { await processing(t('proc'), 700); S.cards.unshift({ id: 'k' + (S.cards.length + 1), kind: 'virtual', last4: '6204', exp: '10/29', frozen: 0 }); el._k = 0; rerender(el); toast(t('c_created'), 'card'); }
      if (a === 'ord') { await processing(t('proc'), 800); S.cards.push({ id: 'k9', kind: 'physical', last4: '8830', exp: '03/30', frozen: 0, status: 'shipping' }); el._k = S.cards.length - 1; rerender(el); toast(t('c_ship')); }
    });
  }
});

/* ---------- Vouchers / Merchants ---------- */
const VOU = [['StreamBox', 'Streaming', 'بث', [1500, 3000, 6000]], ['PlayVerse', 'Gaming', 'ألعاب', [2000, 5000, 10000]], ['SkyMarket', 'Shopping', 'تسوق', [2500, 5000, 10000]], ['RideNow', 'Rides', 'مشاوير', [1000, 2000, 4000]], ['BookNest', 'Books', 'كتب', [1500, 3000]]];
reg('vouchers', {
  render() { return scr(`<p class="muted small">${t('v_sub')}</p>` + plain(VOU.map((v, i) => lr(`<b>${v[0][0]}</b>`, v[0], st.lang === 'ar' ? v[2] : v[1], money(v[3][0], { dec: 0, nocur: true }) + '+', `data-v="${i}"`)).join('')), { head: hdr(t('v_title')) }); },
  mount(el) {
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return; const v = VOU[+b.dataset.v]; let sel = 0;
      const sh = sheet(`<h3>${v[0]}</h3><div class="rows plain">${v[3].map((a, i) => `<button class="pr" role="radio" aria-checked="${i === 0}" data-s="${i}"><span class="pl"><b>${money(a, { nocur: true })} ${st.cur}</b></span><i class="rad"></i></button>`).join('')}</div><button class="btn block lg" id="buy">${t('v_buy')}</button>`);
      sh.addEventListener('click', ev => { const s = ev.target.closest('[data-s]'); if (s) { sel = +s.dataset.s; $$('[data-s]', sh).forEach(x => x.setAttribute('aria-checked', x === s)); } });
      $('#buy', sh).addEventListener('click', () => { closeSheet(); setTimeout(() => pin(async () => { await processing(); const a = v[3][sel]; const { addTxn } = await import('./data.js'); const { refNo, showSuccess } = await import('./kit.js'); const ref = refNo('VC'); addTxn({ type: 'voucher', who: null, amt: -a, cat: 'shopping', ref, note: v[0] });
        showSuccess({ title: t('v_done'), amountMinor: a, rows: [[t('v_code'), '<span class="mono">VG4K-9TQ2-XM71</span>'], [t('to'), v[0]], [t('ref'), `<span class="mono">${ref}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button>` }); }), 330); });
    });
  }
});
reg('merchants', {
  render(p, el) {
    const q = (el._q || '').toLowerCase(), l = MERCH.filter(m => !q || (m.en + m.ar).toLowerCase().includes(q));
    return scr(`<label class="searchbar">${ic('search', 'sm')}<input class="sinp" type="search" placeholder="${t('mr_search')}" value="${esc(el._q || '')}"></label>` + plain(l.map(m => lr(`<b>${esc(nm(m)[0])}</b>`, esc(nm(m)), t('cat_' + m.cat), t('m_cb', { p: m.cb }), `data-go="merchamt" data-p='{"m":"${m.id}"}'`)).join('')), { head: hdr(t('mr_title')) });
  },
  mount(el) { const i = $('.sinp', el); i?.addEventListener('input', () => { el._q = i.value; const ps = i.selectionStart; rerender(el); const n = $('.sinp', el); n.focus(); n.setSelectionRange(ps, ps); }); }
});

/* ---------- Limits ---------- */
reg('limits', {
  render() {
    const cur = S.kyc.tier, T = [['l_t0', 'l_t0s', '500'], ['l_t1', 'l_t1s', '5,000'], ['l_t2', 'l_t2s', '25,000'], ['l_t3', 'l_t3s', '100,000']];
    const U = [['l_day', 145000, 500000], ['l_mon', 720000, 2000000], ['l_max', S.balance, 1000000], ['l_cash', 50000, 200000]];
    return scr(gl(t('l_tiers')) + plain(T.map(([a, b, d], i) => lr(i < cur ? ic('success-check', 'sm') : `<b>${i}</b>`, t(a), t(b), i === cur ? `<span class="badge ok">${t('l_cur')}</span>` : `<span class="num muted">${d}</span>`, '', 'div')).join('')) +
      gl(t('l_use')) + plain(U.map(([k, u, m]) => lr('', t(k), bar(u / m * 100, u / m > .8 ? 'warn' : ''), `<bdi dir="ltr">${money(u, { dec: 0, nocur: true })} / ${money(m, { dec: 0, nocur: true })}</bdi>`, '', 'div')).join('')) +
      `<div class="lr"><span class="lt"><b>${t('l_own')}</b><small>${t('l_own_s')}</small></span><b data-capv>${money(300000, { dec: 0 })}</b></div><input type="range" class="rng" min="50000" max="500000" step="10000" value="300000" aria-label="${t('l_own')}">`, { head: hdr(t('l_title')), foot: cur < 2 ? `<button class="btn block lg" data-go="kyc">${t('l_raise')}</button>` : '' });
  },
  mount(el) { const r = $('.rng', el); r.addEventListener('input', () => { $('[data-capv]', el).innerHTML = money(+r.value, { dec: 0 }); }); }
});

/* ---------- KYC intro ---------- */
reg('kyc', {
  render() {
    const R = [['k_r1', 1], ['k_r2', 0], ['k_r3', 0]];
    return scr(`<div class="amtc"><small class="muted">${t('k_now', { t: t('l_t1') })}</small><h1 style="font-size:26px;text-align:center">${t('k_next')}</h1><small class="muted center">${t('k_gain', { a: money(500000, { dec: 0, nocur: true }), b: money(2500000, { dec: 0, nocur: true }) })}</small></div>` +
      gl(t('k_req')) + plain(R.map(([k, d]) => lr(ic(['id-card', 'face-id', 'location'][R.findIndex(x => x[0] === k)]), t(k), '', d ? `<span class="badge ok">${t('k_done')}</span>` : `<span class="muted small">${t('k_todo')}</span>`, '', 'div')).join('')) + `<p class="small muted center">${t('k_priv')}</p>`, { head: hdr(t('k_title')), foot: `<button class="btn block lg" id="ks">${t('k_start')}</button><p class="tiny muted center">${t('k_time')}</p>` });
  },
  mount(el) { $('#ks', el).addEventListener('click', () => go('polaris', { flow: 'kyc' })); }
});

/* ---------- Bills ---------- */
const BC = ['electricity', 'water', 'internet', 'gas', 'tv', 'edu', 'tax', 'ins'];
reg('bills', {
  render() {
    return scr(gl(t('b_due')) + plain(lr(bIcon('electricity', 20), 'Lumen Electric', t('b_due_in', { d: 3 }), money(8650, { nocur: true }), `data-go="billpay" data-p='{"cat":"electricity","b":"b1","fetched":1}'`)) + gl(t('b_cats')) +
      plain(BC.map(c => lr(bIcon(c, 20), t('bc_' + c), '', '', `data-go="billpay" data-p='{"cat":"${c}"}'`)).join('')), { head: hdr(t('b_title')) });
  }
});
