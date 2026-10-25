// Cash in / cash out at agents: map illustration, agent sheet, one-time code.
import { st, t, add, ic, esc, money, numT, qrSvg, ring, countUp, fmtDate, fmtTime, RM } from '../assets/core.js';
import { reg, hdr, scr, row, nm, go, back, sheet, closeSheet, toast, keypadHtml, bindKeypad, toMinor, amtDisplay, processing, showSuccess, refNo, wait, $, $$ } from './kit.js';
import { S, AGENTS, agent, addTxn } from './data.js';

add({
  ci_title: 'Cash in§Dépôt d’espèces§إيداع نقدي', co_title: 'Cash out§Retrait d’espèces§سحب نقدي', ci_sub: 'Hand cash to a verified agent — it lands in your wallet instantly§Remettez des espèces à un agent vérifié — crédité instantanément§سلّم النقد لوكيل موثّق — يصل إلى محفظتك فوراً', co_sub: 'Withdraw cash at an agent or cardless ATM§Retirez chez un agent ou un DAB sans carte§اسحب نقداً من وكيل أو صراف بدون بطاقة',
  nearby: 'Agents near you§Agents près de vous§وكلاء بالقرب منك', you: 'You are here§Vous êtes ici§موقعك', km: '{d} km§{d} km§{d} كم', open_until: 'Open · {h}§Ouvert · {h}§مفتوح · {h}', closed: 'Closed now§Fermé§مغلق الآن', cash_high: 'Cash available§Espèces dispo§نقد متوفر', cash_med: 'Limited cash§Espèces limitées§نقد محدود', cash_low: 'Low cash§Peu d’espèces§نقد قليل', rating: 'Rating§Note§التقييم',
  how_much: 'How much cash?§Combien ?§كم المبلغ؟', get_code: 'Get my code§Obtenir mon code§احصل على رمزي', ag_choose: 'Choose this agent§Choisir cet agent§اختر هذا الوكيل', ci_fee0: 'Agents never charge you to deposit§Dépôt gratuit chez les agents§الإيداع لدى الوكلاء مجاني', co_fee: 'Fee {f}§Frais {f}§الرسوم {f}', via_agent: 'Agent§Agent§وكيل', via_atm: 'Cardless ATM§DAB sans carte§صراف بدون بطاقة',
  code_in: 'Deposit code§Code de dépôt§رمز الإيداع', code_out: 'Withdrawal code§Code de retrait§رمز السحب', code_for: 'Show this to {a}§Montrez ceci à {a}§اعرض هذا على {a}', code_exp: 'Expires in {m}§Expire dans {m}§ينتهي خلال {m}', code_wait: 'Waiting for the agent…§En attente de l’agent…§بانتظار الوكيل…', code_step1: 'Show the code or QR to the agent§Montrez le code ou le QR à l’agent§اعرض الرمز على الوكيل', code_step2_in: 'Hand over the cash§Remettez les espèces§سلّم النقد', code_step2_out: 'Agent hands you the cash§L’agent vous remet les espèces§يسلّمك الوكيل النقد', code_step3: 'Wallet updates instantly§Le portefeuille est mis à jour§تتحدّث محفظتك فوراً', sim_agent: 'Demo: agent confirms§Démo : l’agent confirme§عرض: الوكيل يؤكد', cancel_code: 'Cancel code§Annuler le code§إلغاء الرمز',
  done_in: 'Cash deposited§Dépôt effectué§تم الإيداع', done_out: 'Cash withdrawn§Retrait effectué§تم السحب', new_bal: 'New balance§Nouveau solde§الرصيد الجديد', tier_note: 'Tier 1 deposit limit: {l} per day§Plafond de dépôt niveau 1 : {l} par jour§حد الإيداع للمستوى 1: {l} يومياً'
});

/* ---------- map illustration (token-driven, so it follows every look) ---------- */
export function mapSvg(agents, sel) {
  const pin = (a, i) => `<g class="mp ${sel === a.id ? 'sel' : ''} ${a.open ? '' : 'shut'}" data-a="${a.id}" transform="translate(${a.x} ${a.y})" style="--d:${i * 110}ms" tabindex="0" role="button" aria-label="${esc(nm(a))}"><g class="mp-in"><path d="M0 0C-12-14-16-20-16-28a16 16 0 0 1 32 0c0 8-4 14-16 28Z" /><circle cy="-28" r="9" fill="var(--surface)"/><g transform="translate(-6 -34) scale(.5)"><path d="M3 12h18M12 3v18" stroke="var(--look-brand)" stroke-width="3.2" stroke-linecap="round"/></g></g></g>`;
  return `<svg class="map" viewBox="0 0 360 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${t('nearby')}">
    <rect width="360" height="250" fill="var(--cont)"/>
    <path d="M-10 190C40 170 70 215 130 205S230 240 370 215V260H-10Z" fill="var(--look-field-1)" opacity=".85"/>
    <path d="M-10 198C42 178 72 222 132 212S232 246 370 222" fill="none" stroke="var(--surface)" stroke-width="2.5" opacity=".7"/>
    <ellipse cx="300" cy="40" rx="52" ry="30" fill="var(--look-field-2)" opacity=".9"/><ellipse cx="46" cy="52" rx="34" ry="22" fill="var(--look-field-2)" opacity=".9"/>
    <g stroke="var(--surface)" stroke-linecap="round" fill="none"><path d="M-10 96H370" stroke-width="13"/><path d="M162-10V200" stroke-width="13"/><path d="M-10 160 370 40" stroke-width="9"/><path d="M80-10V170M250-10V210M-10 40H370M-10 140H200" stroke-width="5"/></g>
    <g fill="var(--cont-hi)">${[[22, 66, 44, 22], [96, 8, 52, 24], [176, 108, 50, 24], [262, 106, 62, 28], [188, 8, 46, 22], [270, 150, 40, 22], [100, 114, 48, 24], [24, 108, 44, 22], [300, 80, 44, 14], [176, 60, 50, 20], [100, 150, 40, 14]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`).join('')}</g>
    <g transform="translate(180 130)"><circle class="you-p" r="10" fill="var(--look-brand)"/><circle class="you-p p2" r="10" fill="var(--look-brand)"/><circle r="8" fill="#fff"/><circle r="5.2" fill="var(--look-brand)"/></g>
    ${agents.map(pin).join('')}</svg>`;
}

const lvl = c => `<span class="badge ${c === 'high' ? 'ok' : c === 'med' ? 'warn' : 'bad'}">${t('cash_' + c)}</span>`;
const agRow = (a, i) => row({ lead: `<span class="lead f${(i % 3) + 1}">${ic('location')}</span>`, title: esc(nm(a)), sub: `<span class="num">${t('km', { d: numT(a.d, 1) })}</span> · ${a.open ? t('open_until', { h: `<span class="num">${a.hrs}</span>` }) : t('closed')}`, end: `<span class="num b">${ic('star', 'sm')} ${a.rating}</span><br>${lvl(a.cash)}`, act: 'ag', cls: '', p: {} }).replace('<button class="item', `<button data-ag="${a.id}" class="item`);

function agentSheet(a, kind, onPick) {
  const sh = sheet(`<div class="row"><span class="lead big f1">${ic('location', 'lg')}</span><div class="sp"><h3 class="disp">${esc(nm(a))}</h3><div class="small muted"><span class="num">${t('km', { d: numT(a.d, 1) })}</span> · <span class="num">${a.hrs}</span></div></div></div>
    <div class="row wrap"><span class="badge info"><span class="num">${a.rating}</span> ${ic('star', 'sm')}</span>${lvl(a.cash)}<span class="badge">${ic('security-shield', 'sm')} ${t('m_verified')}</span></div>
    <button class="btn block lg" data-pick>${t('ag_choose')}</button>`);
  $('[data-pick]', sh).addEventListener('click', () => { closeSheet(); onPick(a); });
}

/* shared map + list body */
function agentsBody(el, kind) {
  el._ag ||= 'a1';
  return `<p class="muted small rise">${t(kind === 'in' ? 'ci_sub' : 'co_sub')}</p>
    <div class="mapwrap rise" data-sk>${mapSvg(AGENTS, el._ag)}<div class="maplegend"><i></i>${t('you')}</div></div>
    <section class="stack s8 rise"><div class="muted small b grp">${t('nearby')}</div><div class="list" data-sk>${AGENTS.map(agRow).join('')}</div></section>`;
}
function bindAgents(el, kind) {
  const open = id => agentSheet(agent(id), kind, a => go('cashamt', { kind, a: a.id }));
  el.addEventListener('click', e => { const p = e.target.closest('[data-a]'), r = e.target.closest('[data-ag]'); const id = (p || r)?.dataset.a || r?.dataset.ag; if (id) { el._ag = id; $$('.mp', el).forEach(m => m.classList.toggle('sel', m.dataset.a === id)); open(id); } });
  el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.closest('[data-a]')) e.target.closest('[data-a]').dispatchEvent(new MouseEvent('click', { bubbles: true })); });
}
reg('cashin', { render: (p, el) => scr(agentsBody(el, 'in'), { head: hdr(t('ci_title')) }), mount: el => bindAgents(el, 'in') });
reg('cashout', {
  render: (p, el) => scr(`<div class="seg rise"><button aria-selected="${(el._mode || 'agent') === 'agent'}" data-md="agent">${t('via_agent')}</button><button aria-selected="${el._mode === 'atm'}" data-md="atm">${t('via_atm')}</button></div>${agentsBody(el, 'out')}`, { head: hdr(t('co_title')) }),
  mount(el) { bindAgents(el, 'out'); el.addEventListener('click', e => { const m = e.target.closest('[data-md]'); if (m) { el._mode = m.dataset.md; $$('[data-md]', el).forEach(b => b.setAttribute('aria-selected', b === m)); if (m.dataset.md === 'atm') go('cashamt', { kind: 'out', a: 'a3', atm: 1 }); } }); }
});

/* ---------- amount ---------- */
reg('cashamt', {
  skel: false,
  render({ kind, a, atm }) {
    const ag = agent(a);
    return scr(`<div class="rcp rise"><span class="lead f1">${ic(atm ? 'atm' : 'location')}</span><div class="sp"><div class="b">${atm ? t('via_atm') + ' · ' : ''}${esc(nm(ag))}</div><div class="small muted"><span class="num">${t('km', { d: numT(ag.d, 1) })}</span></div></div></div>
      <div class="amt"><div class="amt-row"><span class="amt-v disp" data-amt>0</span><span class="amt-c disp">${st.cur}</span></div><div class="amt-hint small" data-hint>${kind === 'in' ? t('ci_fee0') : t('co_fee', { f: '0.50 – 2.00' })}</div></div>
      <div class="chips" style="justify-content:center;flex-wrap:wrap;margin:0">${[50, 100, 200, 500].map(v => `<button class="chip" data-q="${v}"><span class="num">${v}</span></button>`).join('')}</div>${keypadHtml()}`,
      { head: hdr(t('how_much')), foot: `<button class="btn block lg" id="gc" disabled>${t('get_code')}</button>`, cls: 'amtbody' });
  },
  mount(el, { kind, a, atm }) {
    let cur = '', kp;
    const upd = s => { cur = s; const m = toMinor(s); $('[data-amt]', el).innerHTML = amtDisplay(s); const bad = kind === 'out' && m > S.balance; $('#gc', el).disabled = !m || bad; $('[data-hint]', el).innerHTML = bad ? `<span style="color:var(--bad)">${t('s_exceed')}</span>` : kind === 'in' ? t('ci_fee0') : t('co_fee', { f: money(Math.max(50, Math.round(m * .01))) }); };
    kp = bindKeypad($('.amtpad', el), upd);
    el.addEventListener('click', e => { const q = e.target.closest('[data-q]'); if (q) kp.set(q.dataset.q); });
    $('#gc', el).addEventListener('click', () => go('cashcode', { kind, a, atm, amt: toMinor(cur) }));
  }
});

/* ---------- one-time code ---------- */
reg('cashcode', {
  skel: false,
  render({ kind, a, amt, atm }) {
    const ag = agent(a), code = atm ? '738 205' : '483 920', digits = code.replace(' ', '').split('');
    return scr(`<div class="codecard rise"><div class="small muted">${t(kind === 'in' ? 'code_in' : 'code_out')}</div><div class="disp" style="font-size:30px">${money(amt)}</div>
      <div class="digits" dir="ltr">${digits.map((d, i) => `<b style="--d:${i * 90}ms">${d}</b>`).join('')}</div>
      <div class="cc-qr">${qrSvg('cash' + code + kind, { size: 150 })}</div>
      <div class="row" style="justify-content:center;gap:14px">${ring(100, { size: 46, thick: 5, inner: ic('clock', 'sm') })}<span class="b" data-tm>${t('code_exp', { m: '<span class="num">14:59</span>' })}</span></div></div>
      <div class="card flat steps rise"><div class="small b" style="margin-bottom:6px">${t('code_for', { a: esc(nm(ag)) })}</div>${['code_step1', kind === 'in' ? 'code_step2_in' : 'code_step2_out', 'code_step3'].map((k, i) => `<div class="stp"><i>${i + 1}</i><span>${t(k)}</span></div>`).join('')}</div>
      <p class="waiting center small b rise"><span class="dotsw"><i></i><i></i><i></i></span> ${t('code_wait')}</p>`,
      { head: hdr(t(kind === 'in' ? 'code_in' : 'code_out')), foot: `<button class="btn block lg accent" id="sim">${ic('success-check', 'sm')} ${t('sim_agent')}</button><button class="btn text block" data-back>${t('cancel_code')}</button>` });
  },
  mount(el, { kind, a, amt }) {
    let s = 899; const tm = $('[data-tm]', el);
    const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); s--; const m = Math.floor(s / 60), r = String(s % 60).padStart(2, '0'); tm.innerHTML = t('code_exp', { m: `<span class="num">${m}:${r}</span>` }); }, 1000);
    $('#sim', el).addEventListener('click', async () => {
      clearInterval(iv); await processing(t('code_wait'), 1500);
      const ag = agent(a), ref = refNo('AG');
      const fee = kind === 'out' ? Math.max(50, Math.round(amt * .01)) : 0;
      const x = addTxn({ type: kind === 'in' ? 'cashin' : 'cashout', who: a, amt: kind === 'in' ? amt : -(amt + fee), ref });
      showSuccess({ title: t(kind === 'in' ? 'done_in' : 'done_out'), amountMinor: amt, sub: '', rows: [[t('via_agent'), esc(nm(ag))], [t('fee'), fee ? money(fee) : t('free')], [t('new_bal'), money(S.balance)], [t('ref'), `<span class="mono">${ref}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-go="txn" data-p='{"id":${x.id}}'>${ic('receipt', 'sm')} ${t('view_receipt')}</button>` });
    });
  }
});
