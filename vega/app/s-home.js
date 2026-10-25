// Home, activity, transaction detail + dispute, notifications badge.
import { tenantName, st, t, add, ic, esc, money, moneyT, num, numT, countUp, spark, bars, ring, dayLabel, fmtDate, fmtTime, qrSvg } from '../assets/core.js';
import { reg, hdr, scr, row, sectionHead, avatar, nm, store, go, tab, sheet, closeSheet, toast, $, $$, wait, refresh, rerender } from './kit.js';
import { S, ME, whoName, person, merchant, NOTIFS } from './data.js';

add({
  greet: 'Good morning§Bonjour§صباح الخير', bal: 'Total balance§Solde total§الرصيد الكلي', avail: 'Available§Disponible§المتاح', pend: 'Pending§En cours§معلّق', dlim: 'Daily limit left§Limite du jour§المتبقي من الحد اليومي',
  this_month: 'this month§ce mois§هذا الشهر', tier1: 'Tier 1 · Standard§Niveau 1 · Standard§المستوى 1 · قياسي', verified: 'Verified§Vérifié§موثّق',
  a_send: 'Send§Envoyer§إرسال', a_request: 'Request§Demander§طلب', a_pay: 'Pay§Payer§ادفع', a_cashin: 'Cash in§Dépôt§إيداع', a_cashout: 'Cash out§Retrait§سحب', a_bills: 'Bills§Factures§فواتير', a_airtime: 'Airtime§Recharge§شحن', a_more: 'More§Plus§المزيد',
  p_kyc_t: 'Unlock higher limits§Débloquez de plus hauts plafonds§افتح حدوداً أعلى', p_kyc_s: '2 of 4 steps done§2 étapes sur 4§اكتملت خطوتان من 4', p_cb_t: '5% back at Zaytun Café§5 % de remise au Zaytun Café§استرداد 5٪ في مقهى الزيتونة', p_cb_s: 'This week only§Cette semaine seulement§هذا الأسبوع فقط', p_ref_t: 'Invite a friend, get 20.00§Parrainez, gagnez 20,00§ادعُ صديقاً واحصل على 20.00', p_ref_s: 'They get 20.00 too§Eux aussi§ويحصل هو أيضاً على 20.00',
  my_pockets: 'My pockets§Mes poches§جيوبي', see_all: 'See all§Tout voir§عرض الكل', recent: 'Recent activity§Activité récente§آخر العمليات', spend_trend: 'Spending, last 12 weeks§Dépenses, 12 dernières semaines§الإنفاق آخر 12 أسبوعاً',
  hide_bal: 'Hide balance§Masquer le solde§إخفاء الرصيد', notifs: 'Notifications§Notifications§الإشعارات',
  act_title: 'Activity§Activité§النشاط', act_search: 'Search people, merchants, references§Rechercher§ابحث عن شخص أو تاجر أو مرجع', f_all: 'All§Tout§الكل', f_sent: 'Sent§Envoyé§مُرسل', f_recv: 'Received§Reçu§مستلم', f_pay: 'Payments§Paiements§مدفوعات', f_cash: 'Cash§Espèces§نقد',
  in_m: 'In§Entrées§داخل', out_m: 'Out§Sorties§خارج', none_found: 'Nothing matches that search§Aucun résultat§لا نتائج مطابقة',
  ty_send: 'Sent§Envoi§إرسال', ty_receive: 'Received§Reçu§استلام', ty_pay: 'Payment§Paiement§دفع', ty_cashin: 'Cash in§Dépôt§إيداع', ty_cashout: 'Cash out§Retrait§سحب', ty_bill: 'Bill§Facture§فاتورة', ty_airtime: 'Airtime§Recharge§شحن', ty_cashback: 'Cashback§Remise§استرداد نقدي', ty_exchange: 'Exchange§Change§صرف', ty_voucher: 'Voucher§Bon§قسيمة', ty_topup: 'Top-up§Recharge§تعبئة',
  t_cashback: 'Cashback reward§Remise§مكافأة استرداد', t_exchange: 'Currency exchange§Change de devise§صرف عملات',
  td_details: 'Details§Détails§التفاصيل', td_method: 'Paid with§Payé avec§وسيلة الدفع', td_note: 'Note§Note§ملاحظة', td_acct: 'Account§Compte§الحساب', td_repeat: 'Repeat§Répéter§تكرار', td_report: 'Report issue§Signaler§إبلاغ عن مشكلة',
  tl_created: 'Created§Créé§أُنشئت', tl_checked: 'Checked by Vega§Contrôlé par Vega§تم فحصها في Vega', tl_settled: 'Settled§Réglé§تمت التسوية', tl_wait: 'Waiting for recipient’s bank§En attente de la banque du bénéficiaire§بانتظار مصرف المستلم', tl_failed: 'Declined — limit reached§Refusé — plafond atteint§مرفوضة — بلوغ الحد',
  dp_title: 'What went wrong?§Que s’est-il passé ?§ما المشكلة؟', dp_1: 'I did not make this payment§Je n’ai pas fait ce paiement§لم أجرِ هذه العملية', dp_2: 'Wrong amount§Montant erroné§مبلغ خاطئ', dp_3: 'Goods or service not received§Service non reçu§لم أستلم الخدمة', dp_4: 'Paid twice§Payé deux fois§دُفعت مرتين', dp_5: 'Something else§Autre§أمر آخر',
  dp_send: 'Submit dispute§Envoyer§إرسال البلاغ', dp_done: 'Case opened§Dossier ouvert§تم فتح البلاغ', dp_done_s: 'We will reply within 2 business days. Case {id}§Réponse sous 2 jours ouvrés. Dossier {id}§سنرد خلال يومَي عمل. رقم البلاغ {id}',
  n_title: 'Notifications§Notifications§الإشعارات', n_mark: 'Mark all read§Tout marquer lu§تعليم الكل كمقروء',
  n_recv: '{who} sent you {amt}§{who} vous a envoyé {amt}§أرسل لك {who} مبلغ {amt}', n_cb: 'You earned {amt} cashback§Vous avez gagné {amt} de remise§ربحت {amt} استرداداً نقدياً', n_kyc: 'Finish your ID check to raise limits§Terminez la vérification pour hausser vos plafonds§أكمل التحقق من هويتك لرفع الحدود', n_sec: 'New sign-in on a Pixel phone§Nouvelle connexion sur un téléphone Pixel§تسجيل دخول جديد من هاتف Pixel', n_bill: 'Your Lumen Electric bill is ready§Votre facture Lumen Electric est prête§فاتورة لومن للكهرباء جاهزة', n_ref: 'Karim joined with your invite§Karim a rejoint avec votre invitation§انضم كريم بدعوتك',
  earlier: 'Earlier§Plus tôt§سابقاً'
});

export const TYPE = {
  send: ['send', 'ty_send'], receive: ['receive', 'ty_receive'], pay: ['shopping-bag', 'ty_pay'], cashin: ['cash-stack', 'ty_cashin'], cashout: ['atm', 'ty_cashout'], bill: ['bill', 'ty_bill'],
  airtime: ['phone', 'ty_airtime'], cashback: ['star', 'ty_cashback'], exchange: ['swap-exchange', 'ty_exchange'], voucher: ['card-add', 'ty_voucher'], topup: ['plus', 'ty_topup']
};
export const txnTitle = x => x.who ? whoName(x.who) : (x.type === 'cashback' ? t('t_cashback') : t('t_exchange'));
export function txnRow(x, i = 0) {
  const [icn, lk] = TYPE[x.type] || ['wallet', 'ty_pay'];
  const lead = x.type === 'send' || x.type === 'receive' ? avatar(whoName(x.who), +String(x.who).slice(1)) : `<span class="lead f${(i % 3) + 1}">${ic(icn)}</span>`;
  const stl = x.status === 'pending' ? `<span class="badge warn">${t('pending')}</span>` : x.status === 'failed' ? `<span class="badge bad">${t('failed')}</span>` : '';
  return row({
    lead, title: esc(txnTitle(x)), sub: `${t(lk)} · <span class="num">${fmtTime(x.date)}</span>`, go: 'txn', p: { id: x.id },
    end: `<span class="b ${x.amt > 0 ? 'pos' : ''}" ${x.status === 'failed' ? 'style="text-decoration:line-through;opacity:.6"' : ''}>${money(x.amt, { sign: true, nocur: true })}</span><br>${stl || `<span class="tiny muted">${st.cur}</span>`}`
  });
}
export function grouped(txns) {
  const g = []; let last = '';
  txns.forEach((x, i) => { const k = dayLabel(x.date); if (k !== last) { g.push(`<div class="grp muted small b">${k}</div>`); last = k; g.push('<div class="list" data-sk>'); } g.push(txnRow(x, i)); const nx = txns[i + 1]; if (!nx || dayLabel(nx.date) !== k) g.push('</div>'); });
  return g.join('');
}
const unread = () => NOTIFS.filter(n => n.unread).length;
const bell = () => `<button class="iconbtn" data-go="notifs" aria-label="${t('notifs')}">${ic('bell')}${unread() ? '<span class="dot"></span>' : ''}</button>`;
const tenant = () => tenantName();

const ACTIONS = [['send', 'send', 'a_send'], ['request', 'request', 'a_request'], ['scan', 'qr-code', 'a_pay'], ['cashin', 'cash-stack', 'a_cashin'], ['cashout', 'atm', 'a_cashout'], ['bills', 'bill', 'a_bills'], ['airtime', 'phone', 'a_airtime'], ['services', 'menu', 'a_more']];
const actions = () => `<div class="acts">${ACTIONS.map(([g, i, k], n) => `<button class="act a${n % 4}" data-go="${g}" style="--n:${n}"><span class="act-ic">${ic(i)}</span><span class="act-l">${t(k)}</span></button>`).join('')}</div>`;

reg('home', {
  tab: true,
  render() {
    const hide = store.hideBal, bal = S.balance / 100;
    const balHtml = hide ? `<span class="num">••••••</span>` : `<span class="num" data-count="${bal}" data-dec="2">0.00</span>`;
    const eye = `<button class="iconbtn" data-act="eye" aria-label="${t('hide_bal')}" aria-pressed="${hide}">${ic(hide ? 'eye-off' : 'eye')}</button>`;
    const trend = S.month.slice(-12);
    return `<div class="body home">
    <div class="v-sober">
      <section class="balband" data-sk>
        <div class="row" style="justify-content:space-between"><span class="tn">${esc(tenant())}</span><span class="row" style="gap:0">${eye}${bell()}</span></div>
        <div class="muted-on">${t('bal')}</div>
        <div class="bigbal disp">${balHtml}<span class="cur">${st.cur}</span></div>
        <div class="bal-meta"><div><small>${t('avail')}</small><b>${money(S.balance - S.pending, { nocur: true })}</b></div><div><small>${t('pend')}</small><b>${money(S.pending, { nocur: true })}</b></div><div><small>${t('dlim')}</small><b>${money(2150000, { nocur: true, dec: 0 })}</b></div></div>
      </section>
    </div>
    <div class="v-lively">
      <div class="hhead rise">${avatar(nm(ME), 0, 'big')}<div class="sp"><div class="small muted">${t('greet')}</div><div class="disp" style="font-size:22px;line-height:1.1">${nm(ME.first)}</div></div>${eye}${bell()}</div>
      <section class="balcard rise" data-sk>
        <svg class="blob" viewBox="0 0 200 200" aria-hidden="true"><circle cx="165" cy="30" r="64" fill="var(--look-accent)" opacity=".9"/><circle cx="196" cy="118" r="36" fill="var(--look-field-2)" opacity=".9"/><circle cx="130" cy="-8" r="26" fill="var(--look-field-3)"/></svg>
        <div class="row"><span class="badge brand tier">${ic('security-shield', 'sm')} ${t('tier1')}</span></div>
        <div class="muted-on" style="margin-top:14px">${t('bal')}</div>
        <div class="bigbal disp">${balHtml}<span class="cur">${st.cur}</span></div>
        <div class="row" style="gap:8px;margin-top:6px"><span class="chip-trend">${ic('trending-up', 'sm')} <span class="num">+12.4%</span> ${t('this_month')}</span></div>
        <div class="spk">${spark(trend, { w: 330, h: 54, color: 'currentColor' })}</div>
      </section>
    </div>
    <section class="rise" data-sk>${actions()}</section>
    <section class="promos rise" aria-label="Offers">
      <button class="promo p1" data-go="kyc"><span class="pm-t">${t('p_kyc_t')}</span><span class="pm-s">${t('p_kyc_s')}</span>${ring(50, { size: 64, thick: 8, color: 'currentColor', inner: '<span class="num">2/4</span>' })}</button>
      <button class="promo p2" data-go="rewards"><span class="pm-t">${t('p_cb_t')}</span><span class="pm-s">${t('p_cb_s')}</span><span class="pm-ic">${ic('star', 'xl')}</span></button>
      <button class="promo p3" data-go="referrals"><span class="pm-t">${t('p_ref_t')}</span><span class="pm-s">${t('p_ref_s')}</span><span class="pm-ic">${ic('users', 'xl')}</span></button>
    </section>
    <section class="stack s8 rise">${sectionHead(t('my_pockets'), `<button data-tab="pockets">${t('see_all')}</button>`)}
      <div class="pstrip">${S.pockets.map((p, i) => `<button class="pk f${p.f}" data-go="pocket" data-p='{"id":"${p.id}"}' data-sk>${ring(p.saved / p.goal * 100, { size: 58, thick: 7, color: 'currentColor', inner: ic(p.icon, 'sm') })}<span class="pk-n">${nm(p.name)}</span><span class="pk-a">${money(p.saved, { dec: 0 })}</span></button>`).join('')}</div></section>
    <section class="stack s8 rise">${sectionHead(t('recent'), `<button data-tab="activity">${t('see_all')}</button>`)}
      <div class="list" data-sk>${S.txns.slice(0, 5).map((x, i) => txnRow(x, i)).join('')}</div></section>
    <section class="card rise" data-sk><div class="small muted b">${t('spend_trend')}</div><div style="margin-top:8px">${bars(S.month.slice(-12).map(v => v * 100), ['', '', '', '', '', '', '', '', '', '', '', ''], { h: 90, hi: 7 })}</div></section>
    </div>`;
  },
  mount(el) {
    el.addEventListener('click', e => { if (e.target.closest('[data-act=eye]')) { store.hideBal = !store.hideBal; refresh(); } });
  }
});

reg('activity', {
  tab: true,
  render(p, el) {
    const f = (el._f ||= 'all'), qv = el._q || '';
    const keep = { all: () => true, sent: x => x.type === 'send', recv: x => x.type === 'receive' || x.type === 'cashback', pay: x => ['pay', 'bill', 'airtime', 'voucher'].includes(x.type), cash: x => x.type === 'cashin' || x.type === 'cashout' }[f];
    const list = S.txns.filter(keep).filter(x => !qv || (txnTitle(x) + x.ref).toLowerCase().includes(qv.toLowerCase()));
    const inn = S.txns.filter(x => x.amt > 0).reduce((a, x) => a + x.amt, 0), out = S.txns.filter(x => x.amt < 0).reduce((a, x) => a + x.amt, 0);
    return `${hdr(t('act_title'), { back: false, right: `<button class="iconbtn" data-go="statements" aria-label="${t('s_title')}">${ic('statement')}</button>` })}<div class="body">
      <div class="grid2 rise"><div class="card tonal sum" data-sk><span class="small">${t('in_m')}</span><b class="disp pos2">${money(inn, { sign: true })}</b></div><div class="card sum" data-sk><span class="small muted">${t('out_m')}</span><b class="disp">${money(out)}</b></div></div>
      <label class="searchbar rise">${ic('search', 'sm')}<input class="sinp" type="search" placeholder="${t('act_search')}" value="${esc(qv)}" aria-label="${t('search')}"></label>
      <div class="chips rise">${[['all', 'f_all'], ['sent', 'f_sent'], ['recv', 'f_recv'], ['pay', 'f_pay'], ['cash', 'f_cash']].map(([k, l]) => `<button class="chip" aria-pressed="${f === k}" data-f="${k}">${t(l)}</button>`).join('')}</div>
      ${list.length ? grouped(list) : `<p class="muted center" style="padding:30px 0">${t('none_found')}</p>`}</div>`;
  },
  mount(el) {
    el.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { el._f = b.dataset.f; rerender(el); instant(el); } });
    const inp = $('.sinp', el);
    inp?.addEventListener('input', () => { el._q = inp.value; const pos = inp.selectionStart; rerender(el); instant(el); const n = $('.sinp', el); n.focus(); n.setSelectionRange(pos, pos); });
  }
});
const instant = el => $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; });

/* ---------- transaction detail ---------- */
const STEPS = x => x.status === 'failed' ? [['tl_created', 1], ['tl_failed', 0, 'bad']] : x.status === 'pending' ? [['tl_created', 1], ['tl_checked', 1], ['tl_wait', 0, 'warn']] : [['tl_created', 1], ['tl_checked', 1], ['tl_settled', 1]];
reg('txn', {
  render({ id }) {
    const x = S.txns.find(y => y.id === id) || S.txns[0]; const [icn, lk] = TYPE[x.type];
    const sb = x.status === 'done' ? `<span class="badge ok">${ic('success-check', 'sm')} ${t('completed')}</span>` : x.status === 'pending' ? `<span class="badge warn">${t('pending')}</span>` : `<span class="badge bad">${t('failed')}</span>`;
    const out = x.amt < 0;
    return scr(`<div class="rcpt rise"><div class="rc-top">${x.who && (x.type === 'send' || x.type === 'receive') ? avatar(whoName(x.who), +String(x.who).slice(1), 'big') : `<span class="lead big f1">${ic(icn, 'lg')}</span>`}
      <div class="small muted" style="margin-top:8px">${t(lk)}</div><div class="disp" style="font-size:20px">${esc(txnTitle(x))}</div>
      <div class="disp rc-amt ${x.amt > 0 ? 'pos' : ''}">${money(x.amt, { sign: true })}</div>${sb}</div>
      <div class="rc-cut"><i></i><b></b><i></i></div>
      <div class="rc-rows">
      ${kv(t('date'), `<span class="num">${fmtDate(x.date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${fmtTime(x.date)}</span>`)}
      ${kv(out ? t('from') : t('to'), t('wallet_main'))}
      ${x.acct ? kv(t('td_acct'), `<span class="num">${x.acct}</span>`) : ''}
      ${x.note ? kv(t('td_note'), esc(x.note)) : ''}
      ${kv(t('fee'), x.type === 'cashout' ? money(150) : t('free'))}
      ${kv(t('ref'), `<button class="refbtn mono" data-copy="${x.ref}">${x.ref} ${ic('copy', 'sm')}</button>`)}</div>
      <div class="rc-qr">${qrSvg(x.ref, { size: 74, n: 21, logo: false })}<span class="tiny muted">${t('demo_label')}</span></div></div>
      <div class="card rise"><div class="small b" style="margin-bottom:10px">${t('td_details')}</div><div class="tl">${STEPS(x).map(([k, on, c]) => `<div class="tl-s ${on ? 'on' : ''} ${c || ''}"><i></i><span>${t(k)}</span></div>`).join('')}</div></div>`,
      { head: hdr(t('receipt'), { right: `<button class="iconbtn" data-act="share" aria-label="${t('share')}">${ic('share')}</button>` }), foot: `<div class="grid2"><button class="btn tonal" data-act="report">${ic('dispute', 'sm')} ${t('td_report')}</button>${['send', 'pay', 'bill'].includes(x.type) ? `<button class="btn" data-act="repeat">${ic('refresh', 'sm')} ${t('td_repeat')}</button>` : `<button class="btn" data-act="share">${ic('share', 'sm')} ${t('share')}</button>`}</div>` });
  },
  mount(el, { id }) {
    const x = S.txns.find(y => y.id === id) || S.txns[0];
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'share') toast(t('share_receipt'), 'share');
      if (a === 'repeat') go(x.type === 'send' ? 'send' : x.type === 'bill' ? 'bills' : 'scan');
      if (a === 'report') dispute(x);
    });
  }
});
const kv = (k, v) => `<div class="kvr"><span class="muted">${k}</span><span class="b end">${v}</span></div>`;
function dispute(x) {
  let r = 1;
  const sh = sheet(`<h3 class="disp">${t('dp_title')}</h3><div class="stack s8">${[1, 2, 3, 4, 5].map(i => `<button class="opt" role="radio" aria-checked="${i === 1}" data-r="${i}">${t('dp_' + i)}${ic('success-check', 'sm')}</button>`).join('')}</div><button class="btn block" id="dpgo">${t('dp_send')}</button>`);
  sh.addEventListener('click', async e => {
    const o = e.target.closest('[data-r]'); if (o) { r = o.dataset.r; $$('[data-r]', sh).forEach(b => b.setAttribute('aria-checked', b === o)); }
    if (e.target.closest('#dpgo')) { const id = 'DSP-' + (4410 + x.id * 7); closeSheet(); await wait(350); toast(t('dp_done'), 'success-check'); }
  });
}

/* ---------- notifications ---------- */
reg('notifs', {
  render() {
    const body = NOTIFS.map((n, i) => {
      const o = { amt: n.amt != null ? moneyT(n.amt) + ' ' + st.cur : '', who: n.who ? whoName(n.who).split(' ')[0] : '' };
      const d = new Date(); d.setDate(d.getDate() - n.d);
      return row({ lead: `<span class="lead f${(i % 3) + 1}">${ic(n.ic)}</span>`, title: `<span style="font-weight:${n.unread ? 700 : 500}">${t(n.k, o)}</span>`, sub: `${dayLabel(d)} · <span class="num">${String(n.h).padStart(2, '0')}:00</span>`, end: n.unread ? '<i class="udot"></i>' : '', cls: n.unread ? 'unr' : '' });
    }).join('');
    return scr(`<div class="list rise">${body}</div>`, { head: hdr(t('n_title'), { right: `<button class="btn text sm" data-act="mark">${t('n_mark')}</button>` }) });
  },
  mount(el) { el.addEventListener('click', e => { if (e.target.closest('[data-act=mark]')) { NOTIFS.forEach(n => n.unread = 0); refresh(); toast(t('saved_toast')); } }); }
});
