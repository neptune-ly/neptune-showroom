// Calm layer: Home, More, Me (Personal/Business modes), Pay over time (Mizan channel), Business: orders, POS tap-to-pay, settlement, refunds.
import { st, t, add, ic, esc, money, moneyT, numT, tenantName, fmtDate, fmtTime, BASE, RM } from '../assets/core.js';
import { qrV as qrSvg } from './brand.js';

import { SCR, reg, hdr, scr, avatar, nm, store, go, tab, back, sheet, closeSheet, toast, pin, keypadHtml, bindKeypad, toMinor, amtDisplay, processing, showSuccess, refNo, wait, rebuildTabbar, refresh, rerender, switchEl, $, $$ } from './kit.js';
import { S, ME, whoName, CONTACTS, person } from './data.js';
import { txnRow, TYPE } from './s-home.js';

const MZ = `${BASE}brand/mizan/mizan-mark.svg`;
const mz = (c = 'mzm') => `<img class="${c}" src="${MZ}" alt="Mizan">`;
add({
  b_orders: 'Orders§Commandes§الطلبات', b_charge: 'Charge§Encaisser§تحصيل', b_biz: 'Business§Pro§الأعمال', b_pers: 'Personal§Personnel§شخصي', b_mode: 'Account mode§Mode du compte§نمط الحساب', b_mode_s: 'Switch between your personal wallet and your business.§Passez de votre portefeuille personnel à votre activité.§بدّل بين محفظتك الشخصية ونشاطك التجاري.',
  h_all: 'All§Tout§الكل', h_act: 'Activity§Activité§النشاط', h_acct: 'Main wallet§Portefeuille principal§المحفظة الرئيسية', h_avail: 'Available balance§Solde disponible§الرصيد المتاح', h_send: 'Send§Envoyer§إرسال', h_reqqr: 'Request / QR§Demander / QR§طلب / QR', h_cash: 'Cash in/out§Dépôt/retrait§إيداع/سحب', h_more: 'More§Plus§المزيد', h_sales: 'Today’s sales§Ventes du jour§مبيعات اليوم', h_orders_n: '{n} orders · {m} waiting§{n} commandes · {m} en attente§{n} طلبات · {m} بالانتظار', h_neworder: 'New order§Commande§طلب جديد', h_settle: 'Settlement§Règlement§التسوية', h_latest: 'Latest orders§Dernières commandes§آخر الطلبات', h_counter: 'Counter 2§Caisse 2§الصندوق 2',
  mo_title: 'More§Plus§المزيد', mo_pay: 'Pay§Payer§الدفع', mo_money: 'Money§Argent§الأموال', mo_account: 'Account§Compte§الحساب', mo_sub: 'Pay over time§Payer en plusieurs fois§الدفع بالتقسيط', mo_sub_s: 'Instalments through your bank§Mensualités via votre banque§أقساط عبر مصرفك', mo_biz: 'Business§Activité§الأعمال',
  me_mode: 'Mode§Mode§النمط', me_name_b: 'Dune Electronics§Dune Electronics§دون للإلكترونيات',
  o_all: 'All§Toutes§الكل', o_open: 'Open§Ouvertes§مفتوحة', o_paid: 'Paid§Payées§مدفوعة', o_ref: 'Refunded§Remboursées§مستردة', o_none: 'No orders here§Aucune commande§لا طلبات هنا', o_walk: 'Counter sale§Vente comptoir§بيع عند الصندوق', o_via_w: 'Vega wallet§Portefeuille Vega§محفظة Vega', o_via_m: 'Mizan · {n} months§Mizan · {n} mois§ميزان · {n} أشهر', o_via_q: 'QR / link§QR / lien§QR / رابط',
  on_title: 'New order§Nouvelle commande§طلب جديد', on_create: 'Create order§Créer la commande§إنشاء الطلب', oq_title: 'Scan to pay§Scanner pour payer§امسح للدفع', oq_wait: 'Waiting for payment§En attente du paiement§بانتظار الدفع', oq_link: 'Payment link§Lien de paiement§رابط الدفع', oq_sim: 'Check payment status§Vérifier le paiement§تحقق من حالة الدفع', oq_paid: 'Paid§Payée§تم الدفع', oq_view: 'View order§Voir la commande§عرض الطلب', oq_share: 'Share link§Partager§مشاركة الرابط',
  od_title: 'Order§Commande§الطلب', od_cust: 'Customer§Client§العميل', od_method: 'Paid with§Payé via§وسيلة الدفع', od_created: 'Created§Créée§أُنشئ', od_fee: 'Fee§Frais§الرسوم', od_net: 'You receive§Vous recevez§صافي ما تستلم', od_refund: 'Refund§Rembourser§استرداد', od_s1: 'Order created§Commande créée§أُنشئ الطلب', od_s2: 'Payment received§Paiement reçu§استُلم الدفع', od_s3: 'Settled to your account§Réglé sur votre compte§سُوّي إلى حسابك', od_s4: 'Refunded§Remboursée§تم الاسترداد',
  rfd_title: 'Refund§Remboursement§الاسترداد', rfd_full: 'Full refund§Remboursement total§استرداد كامل', rfd_part: 'Partial refund§Remboursement partiel§استرداد جزئي', rfd_to: 'Goes back to the customer’s original method§Retourne vers le moyen de paiement d’origine§يعود إلى وسيلة الدفع الأصلية للعميل', rfd_go: 'Refund {a}§Rembourser {a}§استرداد {a}', rfd_done: 'Refund sent§Remboursement envoyé§تم إرسال الاسترداد', rfl_title: 'Refunds§Remboursements§المستردات',
  sl_title: 'Settlement§Règlement§التسوية', sl_next: 'Next payout§Prochain versement§الدفعة القادمة', sl_when: 'Tomorrow, to ••4417§Demain, vers ••4417§غداً إلى ••4417', sl_hist: 'Payouts§Versements§الدفعات', sl_ledger: 'Ledger — yesterday§Grand livre — hier§دفتر الحساب — أمس', sl_sales: 'Sales§Ventes§المبيعات', sl_fees: 'Fees§Frais§الرسوم', sl_refunds: 'Refunds§Remboursements§المستردات', sl_net: 'Net payout§Versement net§صافي الدفعة', sl_sched: 'Scheduled§Prévu§مجدولة', sl_paid: 'Paid§Versé§مدفوعة',
  pos_title: 'Charge§Encaisser§تحصيل', pos_btn: 'Charge§Encaisser§تحصيل', pos_tap: 'Ready for tap§Prêt pour le paiement§جاهز للمس', pos_tap_s: 'Hold the customer’s phone or card near the top of this device§Approchez le téléphone ou la carte du client du haut de l’appareil§قرّب هاتف أو بطاقة العميل من أعلى الجهاز', pos_sim: 'Contactless cards and phones accepted§Cartes et téléphones sans contact acceptés§تُقبل البطاقات والهواتف اللاسلكية', pos_simtap: 'Start charge§Lancer l’encaissement§ابدأ التحصيل', pos_cancel: 'Cancel§Annuler§إلغاء', pos_choose: 'How would the customer like to pay?§Comment le client souhaite-t-il payer ?§كيف يرغب العميل بالدفع؟', pos_full: 'Pay in full§Payer comptant§دفع كامل', pos_permo: '{a} / month§{a} / mois§{a} / شهر', pos_mizan: 'Pay over time with Mizan§Payer en plusieurs fois avec Mizan§الدفع بالتقسيط مع ميزان', pos_approve: 'Approve§Valider§موافقة', pos_wait: 'Asking the customer’s bank…§Demande à la banque du client…§نسأل مصرف العميل…',
  pos_ok: 'Approved§Approuvé§تمت الموافقة', pos_pend: 'Waiting for the bank§En attente de la banque§بانتظار المصرف', pos_pend_s: 'Do not hand over the goods yet. We will confirm in a moment.§Ne remettez pas encore les articles. Confirmation dans un instant.§لا تسلّم البضاعة بعد. سنؤكد خلال لحظات.', pos_dec: 'Declined§Refusé§مرفوض', pos_dec_s: 'Over the customer’s limit§Au-delà du plafond du client§تجاوز حد العميل', pos_again: 'Try another way§Autre moyen§جرّب طريقة أخرى', pos_check: 'Check status§Vérifier§تحقق من الحالة', pos_new: 'New charge§Nouvel encaissement§تحصيل جديد', pos_rcpt: 'Receipt§Reçu§الإيصال', pos_auth: 'Approval code§Code d’approbation§رمز الموافقة', pos_plan: 'Plan§Plan§الخطة', pos_done: 'Done§Terminé§تم',
  mz_title: 'Pay over time§Payer en plusieurs fois§الدفع بالتقسيط', mz_active: 'Active plans§Plans actifs§الخطط الحالية', mz_none: 'No active plans§Aucun plan actif§لا خطط حالية', mz_start: 'Start a plan§Commencer un plan§ابدأ خطة', mz_start_s: 'Order ORD-1051 · Dune Electronics · {a}§Commande ORD-1051 · Dune Electronics · {a}§الطلب ORD-1051 · دون للإلكترونيات · {a}', mz_next: 'Next instalment§Prochaine mensualité§القسط القادم', mz_of: '{a} of {b} paid§{a} sur {b} payées§دُفع {a} من {b}',
  mp_title: 'Choose a plan§Choisir un plan§اختر خطة', mp_price: 'Price of goods§Prix des biens§سعر البضاعة', mp_months: '{n} months§{n} mois§{n} أشهر', mp_disc: 'Everything disclosed§Tout est indiqué§كل شيء معلن', mp_profit: 'Bank profit (fixed)§Profit de la banque (fixe)§ربح المصرف (ثابت)', mp_total: 'Total to repay§Total à rembourser§إجمالي السداد', mp_first: 'First instalment§Première mensualité§القسط الأول', mp_down: 'Down payment§Apport§الدفعة الأولى', mp_late: 'Late payment§Retard de paiement§التأخر في السداد', mp_late_v: 'No compounding§Sans capitalisation§دون مضاعفة', mp_review: 'Review contract§Voir le contrat§راجع العقد', mp_none: 'None§Aucun§لا يوجد',
  mc_title: 'Contract§Contrat§العقد', mc_text: 'Your bank buys the goods from the merchant and sells them to you at the disclosed price. You repay on the fixed schedule.§Votre banque achète les biens auprès du marchand et vous les revend au prix indiqué. Vous remboursez selon le calendrier fixe.§يشتري مصرفك البضاعة من التاجر ويبيعها لك بالسعر المعلن وتسدد وفق جدول ثابت.', mc_confirm: 'Confirm with Face ID§Confirmer avec Face ID§أكّد ببصمة الوجه', mc_done: 'Plan started§Plan démarré§بدأت الخطة', mc_view: 'View plan§Voir le plan§عرض الخطة',
  md_title: 'Plan§Plan§الخطة', md_sched: 'Schedule§Calendrier§الجدول', md_paid: 'Paid§Payée§مدفوعة', md_due: 'Due§À payer§مستحقة', md_pay: 'Pay next instalment§Payer la prochaine mensualité§ادفع القسط القادم', md_early: 'Settle early§Solder par anticipation§سداد مبكر', md_early_t: 'Settle {a} now§Solder {a} maintenant§سدّد {a} الآن', md_early_s: 'Remaining profit you do not owe is removed.§Le profit restant non dû est retiré.§يُخصم الربح المتبقي غير المستحق.', md_paid_t: 'Instalment paid§Mensualité payée§تم دفع القسط', md_settled: 'Plan settled§Plan soldé§تم سداد الخطة'
});

/* ---------- business data ---------- */
const C = id => person(id);
export const ORD = [
  { id: 'ORD-1051', c: 'c2', amt: 120000, via: 'q', st: 'open', h: 9, d: 0, items: 'Wireless headphones' },
  { id: 'ORD-1050', c: 'c1', amt: 34500, via: 'w', st: 'paid', h: 8, d: 0, items: 'Phone case, charger' },
  { id: 'ORD-1049', c: 'c4', amt: 289900, via: 'm6', st: 'paid', h: 17, d: 1, items: 'Laptop 14"' },
  { id: 'ORD-1048', c: null, amt: 8900, via: 'w', st: 'paid', h: 15, d: 1, items: 'USB-C cable' },
  { id: 'ORD-1047', c: 'c3', amt: 56000, via: 'w', st: 'refunded', h: 11, d: 2, items: 'Speaker' },
  { id: 'ORD-1046', c: 'c6', amt: 149000, via: 'm3', st: 'paid', h: 10, d: 3, items: 'Tablet' },
  { id: 'ORD-1045', c: 'c7', amt: 22000, via: 'q', st: 'open', h: 16, d: 4, items: 'Keyboard' }
];
const dayOff = (d, h) => { const x = new Date(); x.setDate(x.getDate() - d); x.setHours(h, 12, 0, 0); return x; };
const stTxt = s => t(s === 'open' ? 'o_open' : s === 'paid' ? 'o_paid' : 'o_ref');
const viaTxt = v => v === 'w' ? t('o_via_w') : v === 'q' ? t('o_via_q') : t('o_via_m', { n: v.slice(1) });
const custName = o => o.c ? nm(C(o.c)) : t('o_walk');
const hl = (title, link = '', a = '') => `<div class="sec"><h2>${title}</h2>${link ? `<button data-go="${a}">${link}</button>` : ''}</div>`;
const ordRow = o => `<button class="rw" data-go="order" data-p='{"id":"${o.id}"}'><span class="rw-l"><b>${esc(custName(o))}</b><small>${o.id} · <span class="num">${fmtDate(dayOff(o.d, o.h))}</span></small></span><span class="rw-r"><b>${money(o.amt, { nocur: true })}</b><small class="stt ${o.st}">${stTxt(o.st)}</small></span></button>`;
const bell = `<button class="tilebtn" data-go="notifs" aria-label="${t('notifs')}">${ic('bell')}<i class="bdg">1</i></button>`;
const tile = (g, icn, k, on) => `<button class="tl ${on ? 'on' : ''}" data-go="${g}">${ic(icn)}<span>${t(k)}</span></button>`;

/* ---------- Home ---------- */
reg('home', {
  tab: true,
  render() {
    const biz = store.mode === 'business', hide = store.hideBal;
    const open = ORD.filter(o => o.st === 'open').length, sales = ORD.filter(o => o.st === 'paid' && o.d === 0).reduce((a, o) => a + o.amt, 0) + 154200;
    const amount = hide ? `<span class="num">••••••</span>` : money(biz ? sales : S.balance, { nocur: true });
    const eye = `<button class="eyeb" data-act="eye" aria-pressed="${hide}" aria-label="${t('hide_bal')}">${ic(hide ? 'eye-off' : 'eye')}</button>`;
    return `<div class="band"><span class="bm">${esc(tenantName().slice(0, 1))}</span><b>${esc(tenantName())}</b>${biz ? `<span class="bchip">${t('b_biz')}</span>` : ''}</div>
    <div class="body home2">
      <div class="gr"><div><small>${biz ? t('h_counter') : t('greet')}</small><h1>${biz ? t('me_name_b') : nm(ME)}</h1></div>${bell}</div>
      <section class="bc" data-sk><div class="bc-top"><span>${biz ? t('h_sales') : t('h_acct') + ' · ••0142'}</span>${biz ? '' : ic('chevron-down', 'sm')}</div><div class="bc-l">${biz ? t('h_orders_n', { n: 12 + open, m: open }) : t('h_avail') + ' · ' + st.cur}</div><div class="bc-b"><div class="bc-a">${amount}${biz ? `<span class="cur">${st.cur}</span>` : ''}</div>${eye}</div></section>
      <div class="tiles">${biz ? tile('pos', 'contactless', 'b_charge', 1) + tile('ordernew', 'link', 'h_neworder') + tile('settlement', 'coins', 'h_settle') + tile('bizmore', 'menu', 'h_more')
        : tile('send', 'transfer', 'h_send', 1) + tile('receive', 'qr-code', 'h_reqqr') + tile('cashin', 'cash-stack', 'h_cash') + tile('more', 'menu', 'h_more')}</div>
      ${hl(biz ? t('h_latest') : t('h_act'), t('h_all'), biz ? '' : '')}
      <div class="rows" data-sk>${biz ? ORD.slice(0, 4).map(ordRow).join('') : S.txns.slice(0, 4).map(txnRow2).join('')}</div>
    </div>`;
  },
  mount(el) {
    el.addEventListener('click', e => {
      if (e.target.closest('[data-act=eye]')) { store.hideBal = !store.hideBal; refresh(); return; }
      const all = e.target.closest('.sec button'); if (all) tab(store.mode === 'business' ? 'orders' : 'activity');
    });
  }
});
const txnRow2 = x => {
  const title = x.who ? whoName(x.who) : (x.type === 'cashback' ? t('t_cashback') : t('t_exchange'));
  return `<button class="rw" data-go="txn" data-p='{"id":${x.id}}'><span class="rw-l"><b>${esc(title)}</b><small class="num">${fmtDate(x.date, { day: 'numeric', month: 'short', year: 'numeric' })}</small></span><span class="rw-r"><b class="${x.amt > 0 ? 'pos' : ''}">${money(x.amt, { sign: true, nocur: true })}</b>${x.status !== 'done' ? `<small class="stt ${x.status}">${t(x.status === 'pending' ? 'pending' : 'failed')}</small>` : `<small>${st.cur}</small>`}</span></button>`;
};

/* ---------- More ---------- */
const row = (g, i, k, s, mzi) => `<button class="lr" data-go="${g}">${mzi ? mz('lri') : `<span class="lri">${ic(i)}</span>`}<span class="lt"><b>${t(k)}</b>${s ? `<small>${t(s)}</small>` : ''}</span>${ic('chevron-right', 'sm flip')}</button>`;
const grp = (title, rows) => `<div class="gl">${title}</div><div class="rows plain">${rows}</div>`;
reg('more', {
  render() {
    return scr(grp(t('mo_pay'), row('mizan', '', 'mo_sub', 'mo_sub_s', 1) + row('bills', 'bill', 'sv_bills') + row('airtime', 'phone', 'sv_air') + row('merchants', 'shopping-bag', 'sv_mer') + row('vouchers', 'card-add', 'sv_vou')) +
      grp(t('mo_money'), row('request', 'request', 'r_title') + row('cashout', 'atm', 'co_title') + row('split', 'split-bill', 'sv_split') + row('exchange', 'swap-exchange', 'sv_fx') + row('scheduled', 'calendar', 'sv_sch') + row('pockets', 'savings', 'sv_pk') + row('insights', 'chart-pie', 'sv_ins')) +
      grp(t('mo_account'), row('cards', 'card', 'sv_cards') + row('statements', 'statement', 'sv_stm') + row('rewards', 'star', 'sv_rw') + row('referrals', 'users', 'sv_rf') + row('limits', 'security-shield', 'sv_lim') + row('support', 'support', 'sv_sup')), { head: hdr(t('mo_title')) });
  }
});
reg('bizmore', {
  render() { return scr(grp(t('mo_biz'), row('orders', 'receipt', 'b_orders') + row('refunds', 'refund', 'rfl_title') + row('settlement', 'coins', 'h_settle') + row('statements', 'statement', 'sv_stm') + row('support', 'support', 'sv_sup')), { head: hdr(t('mo_title')) }); }
});
SCR.services = SCR.more;

/* ---------- Me ---------- */
reg('me', {
  tab: true,
  render() {
    const biz = store.mode === 'business';
    return `${hdr(t('me_title'), { back: false })}<div class="body">
      <div class="prof2">${avatar(biz ? t('me_name_b') : nm(ME), 0, 'big')}<div><b>${biz ? t('me_name_b') : esc(nm(ME))}</b><small><span class="ltr">${ME.handle}</span> · <span class="num">${ME.phone}</span></small></div></div>
            ${grp(t('me_acct'), row('limits', 'id-card', 'me_id', 'tier1') + row('cards', 'card', 'sv_cards') + row('statements', 'statement', 'sv_stm') + row('rewards', 'star', 'sv_rw'))}
      ${grp(t('me_prefs'), row('security', 'security-shield', 'me_sec') + row('settings', 'settings', 'me_set') + row('notifs', 'bell', 'notifs'))}
      ${grp(t('me_help'), row('support', 'chat', 'me_sup') + row('help', 'info', 'me_faq') + row('lock', 'logout', 'me_out'))}
      <p class="tiny muted center">Neptune Vega</p></div>`;
  },
});

/* ---------- Orders (business) ---------- */
reg('orders', {
  tab: true,
  render(p, el) {
    const f = el._f || 'all', list = ORD.filter(o => f === 'all' || o.st === f);
    return `${hdr(t('b_orders'), { back: false, right: `<button class="iconbtn" data-go="ordernew" aria-label="${t('h_neworder')}">${ic('plus')}</button>` })}<div class="body"><div class="seg">${[['all', 'o_all'], ['open', 'o_open'], ['paid', 'o_paid'], ['refunded', 'o_ref']].map(([k, l]) => `<button aria-selected="${f === k}" data-f="${k}">${t(l)}</button>`).join('')}</div><div class="rows">${list.map(ordRow).join('') || `<p class="muted center" style="padding:30px 0">${t('o_none')}</p>`}</div></div>`;
  },
  mount(el) { el.addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { el._f = b.dataset.f; rerender(el); } }); }
});
reg('refunds', { render() { const l = ORD.filter(o => o.st === 'refunded'); return scr(`<div class="rows">${l.map(ordRow).join('') || `<p class="muted center">${t('o_none')}</p>`}</div>`, { head: hdr(t('rfl_title')) }); } });

reg('ordernew', {
  skel: false,
  render() { return scr(`<div class="amtc"><div class="amt-row"><span class="amt-v" data-amt>0</span><span class="amt-c">${st.cur}</span></div><small class="muted">${t('on_title')}</small></div>${keypadHtml()}`, { head: hdr(t('on_title')), foot: `<button class="btn block lg" id="go" disabled>${t('on_create')}</button>`, cls: 'amtbody' }); },
  mount(el) { let cur = ''; bindKeypad($('.amtpad', el), s => { cur = s; $('[data-amt]', el).innerHTML = amtDisplay(s); $('#go', el).disabled = !toMinor(s); }); $('#go', el).addEventListener('click', () => { const o = { id: 'ORD-' + (1052 + ORD.length - 7), c: null, amt: toMinor(cur), via: 'q', st: 'open', h: 12, d: 0, items: '' }; ORD.unshift(o); go('orderqr', { id: o.id }); }); }
});
reg('orderqr', {
  skel: false,
  render({ id }) {
    const o = ORD.find(x => x.id === id), paid = o.st === 'paid';
    return scr(`<div class="qrc"><div class="amt-row sm"><span class="amt-v">${money(o.amt, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div><div class="qrbox2">${qrSvg(o.id, { size: 220 })}</div>
      <div class="state ${paid ? 'ok' : ''}">${paid ? ic('success-check', 'sm') + ' ' + t('oq_paid') : `<i class="pulse1"></i>${t('oq_wait')}`}</div></div>
      <div class="rows plain"><button class="lr" data-copy="vega.pay/${o.id.toLowerCase()}"><span class="lri">${ic('link')}</span><span class="lt"><b>${t('oq_link')}</b><small class="mono">vega.pay/${o.id.toLowerCase()}</small></span>${ic('copy', 'sm')}</button></div>`,
      { head: hdr(o.id), foot: paid ? `<button class="btn block lg" data-go="order" data-p='{"id":"${o.id}"}'>${t('oq_view')}</button>` : `<button class="btn block lg" data-act="shr">${ic('share', 'sm')} ${t('oq_share')}</button><button class="btn text block" data-act="sim">${t('oq_sim')}</button>` });
  },
  mount(el, { id }) { el.addEventListener('click', e => { const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'shr') toast(t('share'), 'share'); if (a === 'sim') { const o = ORD.find(x => x.id === id); o.st = 'paid'; o.c = 'c5'; rerender(el); } }); }
});
reg('order', {
  render({ id }) {
    const o = ORD.find(x => x.id === id), fee = Math.round(o.amt * (o.via[0] === 'm' ? .018 : .01));
    const steps = [['od_s1', 1], ['od_s2', o.st !== 'open'], ['od_s3', o.st === 'paid' && o.d > 0], ...(o.st === 'refunded' ? [['od_s4', 1]] : [])];
    return scr(`<div class="amtc"><small class="muted">${esc(custName(o))}</small><div class="amt-row sm"><span class="amt-v">${money(o.amt, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div><span class="stt big ${o.st}">${stTxt(o.st)}</span></div>
      <div class="kv2">${[[t('od_title'), `<span class="mono">${o.id}</span>`], [t('od_method'), viaTxt(o.via)], [t('od_created'), `<span class="num">${fmtDate(dayOff(o.d, o.h), { day: 'numeric', month: 'short' })} · ${fmtTime(dayOff(o.d, o.h))}</span>`], [t('od_fee'), money(fee)], [t('od_net'), `<b>${money(o.amt - fee)}</b>`]].map(([k, v]) => `<div><span class="muted">${k}</span><span>${v}</span></div>`).join('')}</div>
      <div class="tlx">${steps.map(([k, on]) => `<div class="${on ? 'on' : ''}"><i></i><span>${t(k)}</span></div>`).join('')}</div>`, { head: hdr(t('od_title')), foot: o.st === 'paid' ? `<button class="btn outline block" data-act="ref">${t('od_refund')}</button>` : o.st === 'open' ? `<button class="btn block" data-go="orderqr" data-p='{"id":"${o.id}"}'>${ic('qr-code', 'sm')} ${t('oq_title')}</button>` : '' });
  },
  mount(el, { id }) {
    el.addEventListener('click', e => {
      if (!e.target.closest('[data-act=ref]')) return; const o = ORD.find(x => x.id === id); let part = false;
      const sh = sheet(`<h3>${t('rfd_title')}</h3><div class="stack s8"><button class="opt" role="radio" aria-checked="true" data-r="0"><span>${t('rfd_full')} · ${money(o.amt)}</span>${ic('success-check', 'sm')}</button><button class="opt" role="radio" aria-checked="false" data-r="1"><span>${t('rfd_part')} · ${money(Math.round(o.amt / 2))}</span>${ic('success-check', 'sm')}</button></div><p class="small muted">${t('rfd_to')}</p><button class="btn block lg" id="rfg">${t('rfd_go', { a: money(o.amt) })}</button>`);
      sh.addEventListener('click', ev => { const r = ev.target.closest('[data-r]'); if (r) { part = r.dataset.r === '1'; $$('[data-r]', sh).forEach(b => b.setAttribute('aria-checked', b === r)); $('#rfg', sh).innerHTML = t('rfd_go', { a: money(part ? Math.round(o.amt / 2) : o.amt) }); } });
      $('#rfg', sh).addEventListener('click', async () => { closeSheet(); await wait(300); await processing(t('proc'), 900); if (!part) o.st = 'refunded'; rerender(el); toast(t('rfd_done'), 'refund'); });
    });
  }
});
reg('settlement', {
  render() {
    const P = [[1, 1285400, 'paid'], [2, 1042200, 'paid'], [3, 968700, 'paid']];
    return scr(`<div class="amtc"><small class="muted">${t('sl_next')}</small><div class="amt-row sm"><span class="amt-v">${money(1196800, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div><small class="muted">${t('sl_when')}</small></div>
      <div class="gl">${t('sl_ledger')}</div><div class="kv2">${[[t('sl_sales'), money(1214500)], [t('sl_fees'), money(-14500)], [t('sl_refunds'), money(-56000)], [t('sl_net'), `<b>${money(1144000)}</b>`]].map(([k, v]) => `<div><span class="muted">${k}</span><span>${v}</span></div>`).join('')}</div>
      <div class="gl">${t('sl_hist')}</div><div class="rows">${P.map(([d, a, s]) => `<div class="rw"><span class="rw-l"><b><span class="num">${fmtDate(dayOff(d, 9))}</span></b><small>••4417</small></span><span class="rw-r"><b>${money(a, { nocur: true })}</b><small class="stt paid">${t('sl_paid')}</small></span></div>`).join('')}</div>`, { head: hdr(t('sl_title')) });
  }
});

/* ---------- POS: Mizan tap-to-pay ---------- */
const RATE = { 3: .036, 6: .069, 12: .125 };
export const plan = (price, n) => { const profit = Math.round(price * RATE[n]), total = price + profit; return { n, profit, total, monthly: Math.round(total / n) }; };
reg('pos', {
  skel: false,
  render(p, el) {
    const s = (el._s ||= { step: 'amount', amt: '', res: '', n: 0 }), m = toMinor(s.amt);
    const top = (x = true) => `<div class="posbar">${x ? `<button class="iconbtn" data-back aria-label="${t('close')}">${ic('close')}</button>` : '<span></span>'}<span class="pt"><b>${t('me_name_b')}</b><small>${t('h_counter')}</small></span>${mz()}</div>`;
    if (s.step === 'amount') return `${top()}<div class="body amtbody posbody"><div class="amtc big"><div class="amt-row"><span class="amt-v" data-amt>${amtDisplay(s.amt)}</span><span class="amt-c">${st.cur}</span></div></div>${keypadHtml()}</div><footer class="foot"><button class="btn block lg" id="chg" ${m ? '' : 'disabled'}>${t('pos_btn')}${m ? ' · ' + money(m, { nocur: true }) : ''}</button></footer>`;
    if (s.step === 'tap') return `${top(false)}<div class="body tapbody"><div class="amtc"><div class="amt-row sm"><span class="amt-v">${money(m, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div></div><div class="tapring"><i class="r1"></i><span class="core">${ic('contactless', 'xl')}</span></div><div class="tapt"><h2>${t('pos_tap')}</h2><p class="muted">${t('pos_tap_s')}</p><small class="muted">${t('pos_sim')}</small></div></div><footer class="foot"><button class="btn tonal block" data-act="tap">${t('pos_simtap')}</button><button class="btn text block" data-act="cancel">${t('pos_cancel')}</button></footer>`;
    const pl = s.n ? plan(m, s.n) : null;
    const icn = { ok: 'success-check', pend: 'clock', dec: 'close' }[s.res];
    return `${top(false)}<div class="body resbody"><div class="resic ${s.res}">${ic(icn, 'xl')}</div><h2>${t('pos_' + s.res)}</h2>${s.res === 'pend' ? `<p class="muted center">${t('pos_pend_s')}</p>` : s.res === 'dec' ? `<p class="muted center">${t('pos_dec_s')}</p>` : ''}<div class="amt-row sm"><span class="amt-v">${money(m, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div>
      ${s.res === 'ok' ? `<div class="kv2"><div><span class="muted">${t('pos_plan')}</span><span>${pl ? t('o_via_m', { n: s.n }) + ' · ' + t('pos_permo', { a: money(pl.monthly, { nocur: true }) }) : t('pos_full')}</span></div><div><span class="muted">${t('pos_auth')}</span><span class="mono">MZ-48${s.n}7Q2</span></div><div><span class="muted">${t('date')}</span><span class="num">${fmtDate(new Date())} · ${fmtTime(new Date())}</span></div></div>` : ''}</div>
      <footer class="foot">${s.res === 'ok' ? `<button class="btn block lg" data-act="new">${t('pos_new')}</button><button class="btn text block" data-act="done">${t('pos_done')}</button>` : s.res === 'pend' ? `<button class="btn block lg" data-act="check">${t('pos_check')}</button><button class="btn text block" data-act="done">${t('pos_cancel')}</button>` : `<button class="btn block lg" data-act="again">${t('pos_again')}</button><button class="btn text block" data-act="done">${t('pos_cancel')}</button>`}</footer>`;
  },
  mount(el) {
    const s = el._s, m = () => toMinor(s.amt), re = () => rerender(el);
    if (s.step === 'amount') { bindKeypad($('.amtpad', el), v => { s.amt = v; $('[data-amt]', el).innerHTML = amtDisplay(v); const b = $('#chg', el); b.disabled = !toMinor(v); b.innerHTML = t('pos_btn') + (toMinor(v) ? ' · ' + money(toMinor(v), { nocur: true }) : ''); }, s.amt); $('#chg', el).addEventListener('click', () => { s.step = 'tap'; re(); }); }
    if (s.step === 'tap') { const go2 = () => { if (!el.isConnected || s.step !== 'tap' || s._busy) return; s._busy = 1; choose(); }; el._tm = setTimeout(go2, RM() ? 4000 : 6500);
      el.addEventListener('click', e => { const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'tap') go2(); if (a === 'cancel') { clearTimeout(el._tm); s.step = 'amount'; re(); } }); }
    if (s.step === 'res') {}
    el.addEventListener('click', async e => {
      const a = e.target.closest('[data-act]')?.dataset.act; if (!a || s.step !== 'res') return;
      if (a === 'new') { el._s = { step: 'amount', amt: '', res: '', n: 0 }; re(); } if (a === 'done') back();
      if (a === 'again') { s.step = 'tap'; s._busy = 0; re(); }
      if (a === 'check') { await processing(t('pos_wait'), 1100); s.res = 'ok'; record(s); re(); }
    });
    function choose() {
      const price = m(), opts = [0, 3, 6, 12]; let sel = 0;
      const sh = sheet(`<h3>${t('pos_choose')}</h3><div class="rows plain">${opts.map(n => { const pl = n ? plan(price, n) : null; return `<button class="pr" role="radio" aria-checked="${n === 0}" data-n="${n}"><span class="pl"><b>${n ? t('mp_months', { n }) : t('pos_full')}</b><small>${n ? t('pos_mizan') : ''}</small></span><span class="pa">${n ? t('pos_permo', { a: money(pl.monthly, { nocur: true }) }) : money(price, { nocur: true })}</span><i class="rad"></i></button>`; }).join('')}</div><button class="btn block lg" id="ap">${t('pos_approve')}</button>`, { onClose: () => { if (s.step === 'tap') s._busy = 0; } });
      sh.addEventListener('click', ev => { const r = ev.target.closest('[data-n]'); if (r) { sel = +r.dataset.n; $$('[data-n]', sh).forEach(b => b.setAttribute('aria-checked', b === r)); } });
      $('#ap', sh).addEventListener('click', async () => { sh._onClose = null; closeSheet(); await wait(300); await processing(t('pos_wait'), 1700); s.n = sel; const v = m(); s.res = v >= 1000000 ? 'dec' : v >= 500000 ? 'pend' : 'ok'; s.step = 'res'; if (s.res !== 'dec') record(s); re(); });
    }
  }
});
function record(s) { const v = toMinor(s.amt); if (!ORD.some(o => o._pos === s)) ORD.unshift({ id: 'ORD-' + (1060 + ORD.length), c: null, amt: v, via: s.n ? 'm' + s.n : 'w', st: s.res === 'ok' ? 'paid' : 'open', h: 12, d: 0, items: '', _pos: s }); else { ORD.find(o => o._pos === s).st = 'paid'; } }

/* ---------- Pay over time (customer side of the Mizan channel) ---------- */
export const PLANS = [{ id: 'pl1', what: { en: 'Headphones', fr: 'Casque', ar: 'سماعات' }, merchant: 'Dune Electronics', price: 90000, n: 6, paid: 2 }];
const addM = (d, k) => { const x = new Date(d); x.setMonth(x.getMonth() + k); return x; };
reg('mizan', {
  render() {
    const pl = PLANS.map(p => { const c = plan(p.price, p.n); return `<button class="lr" data-go="mzdetail" data-p='{"id":"${p.id}"}'>${mz('lri')}<span class="lt"><b>${nm(p.what)} · ${p.merchant}</b><small>${t('mz_next')} ${money(c.monthly)} · ${t('mz_of', { a: p.paid, b: p.n })}</small></span>${ic('chevron-right', 'sm flip')}</button>`; }).join('');
    return scr(`<div class="gl">${t('mz_active')}</div><div class="rows plain">${pl || `<p class="muted" style="padding:14px 0">${t('mz_none')}</p>`}</div>
      <div class="rows plain"><button class="lr" data-go="mzplan" data-p='{"price":120000}'><span class="lri">${ic('plus')}</span><span class="lt"><b>${t('mz_start')}</b><small>${t('mz_start_s', { a: moneyT(120000) + ' ' + st.cur })}</small></span>${ic('chevron-right', 'sm flip')}</button></div>`, { head: hdr(t('mz_title')) });
  }
});
reg('mzplan', {
  skel: false,
  render({ price }, el) {
    const n = el._n || 6, p = plan(price, n);
    return scr(`<div class="amtc"><small class="muted">${t('mp_price')}</small><div class="amt-row sm"><span class="amt-v">${money(price, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div></div>
      <div class="rows plain">${[3, 6, 12].map(k => { const c = plan(price, k); return `<button class="pr" role="radio" aria-checked="${k === n}" data-n="${k}"><span class="pl"><b>${t('mp_months', { n: k })}</b><small>${t('pos_permo', { a: moneyT(c.monthly) + ' ' + st.cur })}</small></span><span class="pa">${money(c.total, { nocur: true })}</span><i class="rad"></i></button>`; }).join('')}</div>
      <div class="gl">${t('mp_disc')}</div><div class="kv2">${[[t('mp_price'), money(price)], [t('mp_profit'), money(p.profit)], [t('mp_total'), `<b>${money(p.total)}</b>`], [t('mp_first'), `<span class="num">${fmtDate(addM(new Date(), 1), { day: 'numeric', month: 'short' })}</span>`], [t('mp_down'), t('mp_none')], [t('mp_late'), t('mp_late_v')]].map(([k, v]) => `<div><span class="muted">${k}</span><span>${v}</span></div>`).join('')}</div>`,
      { head: hdr(t('mp_title')), foot: `<button class="btn block lg" id="rv">${t('mp_review')}</button>` });
  },
  mount(el, { price }) { el.addEventListener('click', e => { const r = e.target.closest('[data-n]'); if (r) { el._n = +r.dataset.n; rerender(el); } }); $('#rv', el).addEventListener('click', () => go('mzcontract', { price, n: el._n || 6 })); }
});
reg('mzcontract', {
  skel: false,
  render({ price, n }) {
    const p = plan(price, n);
    return scr(`<div class="amtc"><small class="muted">${t('mp_total')}</small><div class="amt-row sm"><span class="amt-v">${money(p.total, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div></div>
      <div class="kv2">${[[t('mp_price'), money(price)], [t('mp_profit'), money(p.profit)], [t('mp_months', { n }), t('pos_permo', { a: money(p.monthly) })], [t('mp_late'), t('mp_late_v')]].map(([k, v]) => `<div><span class="muted">${k}</span><span>${v}</span></div>`).join('')}</div>
      <p class="small muted">${t('mc_text')}</p>`, { head: hdr(t('mc_title')), foot: `<button class="btn block lg" id="cf">${ic('face-id', 'sm')} ${t('mc_confirm')}</button>` });
  },
  mount(el, { price, n }) { $('#cf', el).addEventListener('click', () => pin(async () => { await processing(t('proc'), 1000); const id = 'pl' + (PLANS.length + 1); PLANS.push({ id, what: { en: 'Wireless headphones', fr: 'Casque sans fil', ar: 'سماعات لاسلكية' }, merchant: 'Dune Electronics', price, n, paid: 0 }); const o = ORD.find(x => x.id === 'ORD-1051'); if (o) { o.st = 'paid'; o.via = 'm' + n; }
    showSuccess({ title: t('mc_done'), amountMinor: plan(price, n).monthly, sub: t('mp_first') + ' · ' + fmtDate(addM(new Date(), 1), { day: 'numeric', month: 'short' }), rows: [[t('mp_months', { n }), t('pos_permo', { a: money(plan(price, n).monthly) })]], actions: `<button class="btn block lg" data-go="mzdetail" data-p='{"id":"${id}"}'>${t('mc_view')}</button><button class="btn text block" data-home>${t('go_home')}</button>` }); })); }
});
reg('mzdetail', {
  render({ id }) {
    const p = PLANS.find(x => x.id === id), c = plan(p.price, p.n), done = p.paid >= p.n;
    return scr(`<div class="amtc"><small class="muted">${done ? t('md_settled') : t('mz_next')}</small><div class="amt-row sm"><span class="amt-v">${money(c.monthly, { nocur: true })}</span><span class="amt-c">${st.cur}</span></div><small class="muted">${nm(p.what)} · ${p.merchant} · ${t('mz_of', { a: p.paid, b: p.n })}</small></div>
      <div class="gl">${t('md_sched')}</div><div class="rows">${Array.from({ length: p.n }, (_, i) => `<div class="rw"><span class="rw-l"><b><span class="num">${i + 1}</span> / <span class="num">${p.n}</span></b><small class="num">${fmtDate(addM(new Date(), i + 1 - p.paid), { day: 'numeric', month: 'short', year: 'numeric' })}</small></span><span class="rw-r"><b>${money(c.monthly, { nocur: true })}</b><small class="stt ${i < p.paid ? 'paid' : 'open'}">${t(i < p.paid ? 'md_paid' : 'md_due')}</small></span></div>`).join('')}</div>`,
      { head: hdr(t('md_title')), foot: done ? '' : `<button class="btn block lg" data-act="pay">${t('md_pay')}</button><button class="btn outline block" data-act="early">${t('md_early')}</button>` });
  },
  mount(el, { id }) {
    const p = PLANS.find(x => x.id === id), c = plan(p.price, p.n);
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
      if (a === 'pay') pin(async () => { await processing(t('proc'), 900); p.paid++; rerender(el); toast(t('md_paid_t'), 'success-check'); });
      if (a === 'early') { const left = Math.round((c.total - c.monthly * p.paid) * .97); const sh = sheet(`<h3>${t('md_early')}</h3><p class="muted">${t('md_early_s')}</p><button class="btn block lg" id="se">${t('md_early_t', { a: money(left) })}</button>`); $('#se', sh).addEventListener('click', () => { closeSheet(); setTimeout(() => pin(async () => { await processing(t('proc'), 900); p.paid = p.n; rerender(el); toast(t('md_settled'), 'success-check'); }), 320); }); }
    });
  }
});
