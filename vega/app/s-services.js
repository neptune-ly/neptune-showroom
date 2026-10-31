// Services hub, bills, airtime & data, merchants, vouchers, split bill, exchange, scheduled payments.
import { st, t, add, ic, esc, money, moneyT, numT, countUp, ring, fmtDate, confetti } from '../assets/core.js';
import { qrV as qrSvg } from './brand.js';

import { reg, hdr, scr, row, sectionHead, avatar, nm, go, tab, sheet, closeSheet, toast, pin, keypadHtml, bindKeypad, toMinor, amtDisplay, slideHtml, bindSlide, processing, showSuccess, refNo, switchEl, wait, $, $$, rerender, refresh } from './kit.js';
import { S, BILLERS, TELCOS, MERCH, CONTACTS, biller, telco, merchant, addTxn, person } from './data.js';

add({
  sv_title: 'All services§Tous les services§كل الخدمات', sv_pay: 'Pay§Payer§الدفع', sv_money: 'Money§Argent§الأموال', sv_wallet: 'Wallet§Portefeuille§المحفظة', sv_perks: 'Perks & help§Avantages et aide§المزايا والمساعدة',
  sv_bills: 'Bills§Factures§الفواتير', sv_air: 'Airtime & data§Recharge et data§الشحن والباقات', sv_mer: 'Merchants§Marchands§التجار', sv_vou: 'Vouchers§Bons§القسائم', sv_split: 'Split a bill§Partager l’addition§تقسيم فاتورة', sv_fx: 'Exchange§Change§صرف العملات', sv_sch: 'Scheduled§Planifiés§المجدولة', sv_link: 'Payment link§Lien de paiement§رابط دفع',
  sv_cards: 'Cards§Cartes§البطاقات', sv_pk: 'Pockets§Poches§الجيوب', sv_ins: 'Insights§Analyses§التحليلات', sv_stm: 'Statements§Relevés§كشوف الحساب', sv_rw: 'Rewards§Récompenses§المكافآت', sv_rf: 'Invite friends§Inviter§ادعُ أصدقاء', sv_lim: 'Limits§Plafonds§الحدود', sv_kyc: 'Verify identity§Vérifier l’identité§توثيق الهوية', sv_sup: 'Support§Aide§الدعم',
  b_title: 'Bills§Factures§الفواتير', b_due: 'Due soon§À régler bientôt§مستحقة قريباً', b_due_in: 'Due in {d} days§Échéance dans {d} jours§تستحق خلال {d} أيام', b_paynow: 'Pay now§Payer§ادفع الآن', b_cats: 'Pay a new bill§Nouvelle facture§فاتورة جديدة', b_saved: 'Saved bills§Factures enregistrées§الفواتير المحفوظة', b_choose: 'Choose a provider§Choisissez un fournisseur§اختر المزوّد', b_acct: 'Account or meter number§N° de compte ou compteur§رقم الحساب أو العداد', b_fetch: 'Find my bill§Trouver ma facture§ابحث عن فاتورتي', b_found: 'Bill found§Facture trouvée§تم العثور على الفاتورة', b_cust: 'Customer§Client§العميل', b_period: 'Period§Période§الفترة', b_period_v: 'September§Septembre§سبتمبر', b_duedate: 'Due date§Échéance§الاستحقاق', b_slide: 'Slide to pay bill§Glissez pour payer§اسحب لدفع الفاتورة', b_done: 'Bill paid§Facture payée§تم دفع الفاتورة', b_autopay: 'Pay automatically each month§Payer automatiquement chaque mois§الدفع تلقائياً كل شهر', b_paid: 'Paid§Payée§مدفوعة',
  bc_electricity: 'Electricity§Électricité§الكهرباء', bc_water: 'Water§Eau§المياه', bc_internet: 'Internet§Internet§الإنترنت', bc_gas: 'Gas§Gaz§الغاز', bc_tv: 'TV§TV§التلفزيون', bc_edu: 'Education§Éducation§التعليم', bc_tax: 'Municipal§Municipal§البلدية', bc_ins: 'Insurance§Assurance§التأمين',
  at_title: 'Airtime & data§Recharge et data§الشحن والباقات', at_op: 'Operator§Opérateur§المشغّل', at_num: 'Phone number§Numéro§رقم الهاتف', at_air: 'Airtime§Crédit§رصيد', at_data: 'Data bundles§Forfaits data§باقات الإنترنت', at_bonus: '+{p}% bonus§+{p} % bonus§مكافأة {p}٪', at_slide: 'Slide to top up§Glissez pour recharger§اسحب للشحن', at_done: 'Top-up sent§Recharge envoyée§تم الشحن', at_pick: 'Pick an amount§Choisissez un montant§اختر المبلغ', at_valid: '{d} days§{d} jours§{d} يوماً', at_gb: '{g} GB§{g} Go§{g} جيجا',
  mr_title: 'Merchants§Marchands§التجار', mr_search: 'Find a place to pay§Trouver un marchand§ابحث عن مكان للدفع', mr_ma: 'Enter amount§Saisir le montant§أدخل المبلغ', mr_pay: 'Continue to pay§Continuer§متابعة الدفع',
  v_title: 'Vouchers§Bons cadeaux§القسائم', v_sub: 'Instant digital codes, paid from your wallet§Codes numériques instantanés§أكواد رقمية فورية تُدفع من محفظتك', v_buy: 'Buy voucher§Acheter§شراء القسيمة', v_pick: 'Choose a value§Choisissez une valeur§اختر القيمة', copy_code: 'Copy code§Copier le code§نسخ الرمز', v_code: 'Your code§Votre code§رمزك', v_done: 'Voucher ready§Bon prêt§القسيمة جاهزة',
  sp_title: 'Split a bill§Partager l’addition§تقسيم فاتورة', sp_total: 'Bill total§Total de l’addition§إجمالي الفاتورة', sp_with: 'Split with§Partager avec§قسّم مع', sp_each: 'Each pays§Chacun paie§يدفع كل شخص', sp_you: 'You§Vous§أنت', sp_send: 'Send requests§Envoyer les demandes§إرسال الطلبات', sp_done: 'Requests sent§Demandes envoyées§تم إرسال الطلبات', sp_what: 'Dinner at Zaytun Café§Dîner au Zaytun Café§عشاء في مقهى الزيتونة', sp_people: '{n} people§{n} personnes§{n} أشخاص',
  fx_title: 'Exchange§Change§صرف العملات', fx_rate: 'Rate {r}§Taux {r}§السعر {r}', fx_you: 'You pay§Vous payez§تدفع', fx_get: 'You get§Vous recevez§تستلم', fx_btn: 'Exchange now§Changer§اصرف الآن', fx_done: 'Exchanged§Change effectué§تم الصرف', fx_usd: 'USD wallet§Portefeuille USD§محفظة الدولار', fx_note: 'Live rate for 30 seconds§Taux garanti 30 secondes§السعر ثابت لمدة 30 ثانية', fx_swap: 'Swap currencies§Inverser§تبديل العملتين',
  sc_title: 'Scheduled payments§Paiements planifiés§المدفوعات المجدولة', sc_new: 'New schedule§Nouveau§جدولة جديدة', sc_monthly: 'Every month§Chaque mois§كل شهر', sc_weekly: 'Every week§Chaque semaine§كل أسبوع', sc_next: 'Next {d}§Prochain {d}§التالي {d}', sc_rent: 'Rent — Layla Saidi§Loyer — Layla Saidi§الإيجار — ليلى سعيدي', sc_net: 'Netline Broadband§Netline Broadband§نت لاين للإنترنت', sc_pk: 'Pocket: Summer trip§Poche : Voyage d’été§جيب: رحلة الصيف'
});

/* tiny inline glyphs for billers (the kit set has no utilities icons) */
const G = {
  electricity: '<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>', water: '<path d="M12 3C8 8 6 11 6 14a6 6 0 0 0 12 0c0-3-2-6-6-11Z"/>', internet: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10.5 10.5 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.2"/>',
  gas: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-6 1 2 2 2 2 3 1-3 1-5 1-9Z"/>', tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>', edu: '<path d="m2 9 10-5 10 5-10 5Z"/><path d="M6 11.5V16c3 2.5 9 2.5 12 0v-4.5"/>', tax: '<path d="M3 21h18M5 21V10m14 11V10M9 21V10m6 11V10M2 10l10-6 10 6Z"/>', ins: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>'
};
export const bIcon = (k, s = 24) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${G[k]}</svg>`;

/* ---------- services hub ---------- */
const SV = [
  ['sv_pay', [['bills', 'bill', 'sv_bills'], ['airtime', 'phone', 'sv_air'], ['merchants', 'shopping-bag', 'sv_mer'], ['vouchers', 'card-add', 'sv_vou']]],
  ['sv_money', [['split', 'split-bill', 'sv_split'], ['exchange', 'swap-exchange', 'sv_fx'], ['scheduled', 'calendar', 'sv_sch'], ['request', 'link', 'sv_link']]],
  ['sv_wallet', [['cards', 'card', 'sv_cards'], ['pockets', 'savings', 'sv_pk'], ['insights', 'chart-pie', 'sv_ins'], ['statements', 'statement', 'sv_stm']]],
  ['sv_perks', [['rewards', 'star', 'sv_rw'], ['referrals', 'users', 'sv_rf'], ['limits', 'security-shield', 'sv_lim'], ['support', 'support', 'sv_sup']]]
];
reg('services', {
  render() {
    return scr(SV.map(([h, items]) => `<section class="stack s8 rise"><div class="muted small b grp">${t(h)}</div><div class="svgrid">${items.map(([g, i, k], n) => `<button class="svt f${(n % 3) + 1}" data-go="${g === 'pockets' ? 'pockets' : g}"><span class="svi">${ic(i)}</span><span>${t(k)}</span></button>`).join('')}</div></section>`).join(''), { head: hdr(t('sv_title')) });
  }
});

/* ---------- bills ---------- */
const CATS = ['electricity', 'water', 'internet', 'gas', 'tv', 'edu', 'tax', 'ins'];
reg('bills', {
  render() {
    return scr(`<div class="duecard rise" data-sk><div class="row"><span class="lead brand">${bIcon('electricity')}</span><div class="sp"><div class="b">${nm(biller('b1'))}</div><div class="small" style="opacity:.8">${t('b_due_in', { d: '<span class="num">3</span>' })}</div></div></div><div class="disp" style="font-size:34px;margin:8px 0 12px">${money(8650)}</div><button class="btn accent block" data-go="billpay" data-p='{"cat":"electricity","b":"b1","fetched":1}'>${t('b_paynow')}</button></div>
      <section class="stack s8 rise"><div class="muted small b grp">${t('b_cats')}</div><div class="catgrid">${CATS.map(c => `<button class="ct" data-go="billpay" data-p='{"cat":"${c}"}'><span class="cti">${bIcon(c)}</span><span>${t('bc_' + c)}</span></button>`).join('')}</div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('b_saved')}</div><div class="list" data-sk>${row({ lead: `<span class="lead f1">${bIcon('electricity')}</span>`, title: nm(biller('b1')), sub: '<span class="num">•••• 4417</span>', end: `<span class="badge warn">${t('b_due_in', { d: 3 })}</span>`, go: 'billpay', p: { cat: 'electricity', b: 'b1', fetched: 1 } })}${row({ lead: `<span class="lead f2">${bIcon('internet')}</span>`, title: nm(biller('b4')), sub: '<span class="num">•••• 2290</span>', end: `<span class="badge ok">${t('b_paid')}</span>`, go: 'billpay', p: { cat: 'internet', b: 'b4' } })}</div></section>`, { head: hdr(t('b_title')) });
  }
});
reg('billpay', {
  skel: false,
  render({ cat, b, fetched }, el) {
    const bl = BILLERS[cat], sel = el._b || b || (bl.length === 1 ? bl[0].id : null), f = el._f ?? fetched;
    const amt = cat === 'electricity' ? 8650 : cat === 'internet' ? 9900 : 4575;
    let inner = '';
    if (!sel) inner = `<div class="muted small b grp">${t('b_choose')}</div><div class="list rise">${bl.map(x => row({ lead: `<span class="lead f1">${bIcon(cat)}</span>`, title: nm(x), act: 'pickb' }).replace('<button class="item', `<button data-pb="${x.id}" class="item`)).join('')}</div>`;
    else inner = `<div class="rcp rise"><span class="lead f1">${bIcon(cat)}</span><div class="sp"><div class="b">${esc(nm(biller(sel)))}</div><div class="small muted">${t('bc_' + cat)}</div></div></div>
      <div class="field rise"><label for="acct">${t('b_acct')}</label><input id="acct" class="inp num" inputmode="numeric" value="4417 2290 18" ${f ? 'readonly' : ''}></div>
      ${f === 'load' ? `<div class="card sk" style="height:180px"></div>` : f ? `<div class="billcard rise"><span class="badge ok">${ic('success-check', 'sm')} ${t('b_found')}</span><div class="disp" style="font-size:40px;line-height:1.1;margin:10px 0">${money(amt)}</div>
        ${[[t('b_cust'), st.lang === 'ar' ? 'أميرة ح.' : 'Amira H.'], [t('b_period'), t('b_period_v')], [t('b_duedate'), `<span class="num">${fmtDate(new Date(Date.now() + 3 * 864e5), { day: 'numeric', month: 'short' })}</span>`]].map(([k, v]) => `<div class="kvr"><span class="muted">${k}</span><span class="b">${v}</span></div>`).join('')}</div>
        <div class="card flat row"><span class="sp b">${t('b_autopay')}</span>${switchEl('auto', false)}</div>` : ''}`;
    return scr(inner, { head: hdr(t('bc_' + cat)), foot: sel ? (f && f !== 'load' ? slideHtml(t('b_slide'), 'bill') : `<button class="btn block lg" id="fetch">${t('b_fetch')}</button>`) : '' });
  },
  mount(el, { cat, b }) {
    el.addEventListener('click', e => { const pb = e.target.closest('[data-pb]'); if (pb) { el._b = pb.dataset.pb; rerender(el); } });
    $('#fetch', el)?.addEventListener('click', async () => { el._f = 'load'; rerender(el); await wait(900); el._f = 1; rerender(el); });
    const amt = cat === 'electricity' ? 8650 : cat === 'internet' ? 9900 : 4575;
    bindSlide(el, () => pin(async () => {
      await processing(); const id = el._b || b || BILLERS[cat][0].id, ref = refNo('BL');
      const x = addTxn({ type: 'bill', who: id, amt: -amt, cat: 'bills', acct: '•••• 4417', ref });
      showSuccess({ title: t('b_done'), amountMinor: amt, rows: [[t('to'), esc(nm(biller(id)))], [t('ref'), `<span class="mono">${ref}</span>`], [t('fee'), t('free')]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-go="txn" data-p='{"id":${x.id}}'>${ic('receipt', 'sm')} ${t('view_receipt')}</button>` });
    }));
  }
});

/* ---------- airtime & data ---------- */
const AIR = [500, 1000, 2000, 5000], DATA = [[2, 7, 1200], [5, 15, 2500], [12, 30, 4500], [30, 30, 9000]];
reg('airtime', {
  skel: false,
  render(p, el) {
    const op = el._op || 'o1', md = el._md || 'air', pick = el._pk ?? (md === 'air' ? 1 : 1);
    const opts = md === 'air' ? AIR.map((v, i) => `<button class="amtile ${pick === i ? 'on' : ''}" data-pk="${i}"><b class="disp">${numT(v / 100)}</b><span class="tiny">${st.cur}</span>${i === 3 ? `<em>${t('at_bonus', { p: 10 })}</em>` : ''}</button>`).join('')
      : DATA.map((d, i) => `<button class="amtile wide ${pick === i ? 'on' : ''}" data-pk="${i}"><b class="disp"><span class="num">${t('at_gb', { g: d[0] })}</span></b><span class="tiny">${t('at_valid', { d: d[1] })}</span><span class="b">${money(d[2])}</span></button>`).join('');
    return scr(`<div class="muted small b grp">${t('at_op')}</div><div class="ops rise">${TELCOS.map(o => `<button class="op h${o.hue} ${op === o.id ? 'on' : ''}" data-op="${o.id}"><span class="opd"></span>${esc(nm(o))}</button>`).join('')}</div>
      <div class="field rise"><label>${t('at_num')}</label><div class="inp row" style="gap:10px"><span class="num sp b">+000 91 555 0142</span><button class="iconbtn" data-go="send" aria-label="Contacts">${ic('users', 'sm')}</button></div></div>
      <div class="seg rise"><button aria-selected="${md === 'air'}" data-md="air">${t('at_air')}</button><button aria-selected="${md === 'data'}" data-md="data">${t('at_data')}</button></div>
      <div class="muted small b grp">${t('at_pick')}</div><div class="amgrid ${md}">${opts}</div>`, { head: hdr(t('at_title')), foot: slideHtml(t('at_slide'), 'phone') });
  },
  mount(el) {
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-op]'), m = e.target.closest('[data-md]'), p = e.target.closest('[data-pk]');
      if (a) { el._op = a.dataset.op; rerender(el); } if (m) { el._md = m.dataset.md; el._pk = 1; rerender(el); } if (p) { el._pk = +p.dataset.pk; rerender(el); }
    });
    bindSlide(el, () => pin(async () => {
      const md = el._md || 'air', i = el._pk ?? 1, amt = md === 'air' ? AIR[i] : DATA[i][2]; await processing(); const ref = refNo('AT');
      const x = addTxn({ type: 'airtime', who: el._op || 'o1', amt: -amt, cat: 'bills', ref });
      showSuccess({ title: t('at_done'), amountMinor: amt, rows: [[t('to'), '<span class="num">+000 91 555 0142</span>'], [t('at_op'), esc(nm(telco(el._op || 'o1')))], [t('ref'), `<span class="mono">${ref}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button>` });
    }));
  }
});

/* ---------- merchants ---------- */
reg('merchants', {
  render(p, el) {
    const c = el._c || 'all', q = (el._q || '').toLowerCase(), cats = ['all', 'food', 'groceries', 'transport', 'shopping', 'health', 'fun'];
    const list = MERCH.filter(m => (c === 'all' || m.cat === c) && (!q || (m.en + m.ar).toLowerCase().includes(q)));
    return scr(`<label class="searchbar rise">${ic('search', 'sm')}<input class="sinp" type="search" placeholder="${t('mr_search')}" value="${esc(el._q || '')}"></label>
      <div class="chips rise">${cats.map(k => `<button class="chip" aria-pressed="${c === k}" data-c="${k}">${k === 'all' ? t('all') : t('cat_' + k)}</button>`).join('')}</div>
      <div class="mgrid rise" data-sk>${list.map((m, i) => `<button class="mt f${(i % 3) + 1}" data-go="merchamt" data-p='{"m":"${m.id}"}'><span class="mt-l">${esc(nm(m).split(' ').map(w => w[0]).join('').slice(0, 2))}</span><b>${esc(nm(m))}</b><span class="tiny muted">${t('cat_' + m.cat)}</span><span class="badge accent">${ic('star', 'sm')} ${t('m_cb', { p: m.cb })}</span></button>`).join('')}</div>`, { head: hdr(t('mr_title')) });
  },
  mount(el) {
    el.addEventListener('click', e => { const c = e.target.closest('[data-c]'); if (c) { el._c = c.dataset.c; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); } });
    const i = $('.sinp', el); i?.addEventListener('input', () => { el._q = i.value; const ps = i.selectionStart; rerender(el); const n = $('.sinp', el); n.focus(); n.setSelectionRange(ps, ps); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); });
  }
});
reg('merchamt', {
  skel: false,
  render({ m }) {
    const mm = merchant(m);
    return scr(`<div class="rcp rise"><span class="lead brand">${esc(nm(mm).split(' ').map(w => w[0]).join('').slice(0, 2))}</span><div class="sp"><div class="b">${esc(nm(mm))}</div><div class="small muted">${t('cat_' + mm.cat)}</div></div><span class="badge accent">${t('m_cb', { p: mm.cb })}</span></div>
      <div class="amt"><div class="amt-row"><span class="amt-v disp" data-amt>0</span><span class="amt-c disp">${st.cur}</span></div></div>${keypadHtml()}`, { head: hdr(t('mr_ma')), foot: `<button class="btn block lg" id="mp" disabled>${t('mr_pay')}</button>`, cls: 'amtbody' });
  },
  mount(el, { m }) { let cur = ''; bindKeypad($('.amtpad', el), s => { cur = s; $('[data-amt]', el).innerHTML = amtDisplay(s); $('#mp', el).disabled = !toMinor(s) || toMinor(s) > S.balance; }); $('#mp', el).addEventListener('click', () => go('merchantpay', { m, amt: toMinor(cur) })); }
});

/* ---------- vouchers ---------- */
const VOU = [['StreamBox', 'Streaming', 'بث', 'f1', [1500, 3000, 6000]], ['PlayVerse', 'Gaming', 'ألعاب', 'f3', [2000, 5000, 10000]], ['SkyMarket', 'Shopping', 'تسوق', 'f2', [2500, 5000, 10000]], ['RideNow', 'Rides', 'مشاوير', 'f1', [1000, 2000, 4000]], ['Café Voucher', 'Food', 'طعام', 'f2', [1000, 2500]], ['BookNest', 'Books', 'كتب', 'f3', [1500, 3000]]];
reg('vouchers', {
  render() {
    return scr(`<p class="muted small rise">${t('v_sub')}</p><div class="vgrid rise" data-sk>${VOU.map((v, i) => `<button class="vc ${v[3]}" data-v="${i}"><span class="vc-b disp">${v[0]}</span><span class="tiny">${st.lang === 'ar' ? v[2] : v[1]}</span><span class="vc-f">${money(v[4][0], { dec: 0 })}+</span><i class="vc-dec"></i></button>`).join('')}</div>`, { head: hdr(t('v_title')) });
  },
  mount(el) {
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-v]'); if (!b) return; const v = VOU[+b.dataset.v]; let sel = 0;
      const sh = sheet(`<div class="vc big ${v[3]}" style="min-height:120px"><span class="vc-b disp">${v[0]}</span><span class="tiny">${st.lang === 'ar' ? v[2] : v[1]}</span><i class="vc-dec"></i></div><div class="muted small b">${t('v_pick')}</div><div class="amgrid air">${v[4].map((a, i) => `<button class="amtile ${i === 0 ? 'on' : ''}" data-s="${i}"><b class="disp">${numT(a / 100)}</b><span class="tiny">${st.cur}</span></button>`).join('')}</div><button class="btn block lg" id="buy">${t('v_buy')}</button>`);
      sh.addEventListener('click', ev => { const s = ev.target.closest('[data-s]'); if (s) { sel = +s.dataset.s; $$('[data-s]', sh).forEach(x => x.classList.toggle('on', x === s)); } });
      $('#buy', sh).addEventListener('click', () => { closeSheet(); setTimeout(() => pin(async () => { await processing(); const a = v[4][sel], ref = refNo('VC'); addTxn({ type: 'voucher', who: null, amt: -a, cat: 'shopping', ref, note: v[0] });
        showSuccess({ title: t('v_done'), amountMinor: a, rows: [[t('v_code'), '<span class="mono">VG4K-9TQ2-XM71</span>'], [t('to'), v[0]], [t('ref'), `<span class="mono">${ref}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-copy="VG4K-9TQ2-XM71">${ic('copy', 'sm')} ${t('copy_code')}</button>` }); }), 350); });
    });
  }
});

/* ---------- split bill ---------- */
reg('split', {
  skel: false,
  render(p, el) {
    const sel = (el._sel ||= ['c1', 'c2', 'c3']), total = 9600, each = Math.round(total / (sel.length + 1));
    return scr(`<div class="card tonal center rise"><div class="small">${t('sp_what')}</div><div class="disp" style="font-size:42px;line-height:1.15">${money(total)}</div><div class="tiny" style="opacity:.8">${t('sp_total')}</div></div>
      <div class="muted small b grp">${t('sp_with')} · ${t('sp_people', { n: sel.length + 1 })}</div>
      <div class="favrow rise">${CONTACTS.slice(0, 7).map((c, i) => `<button class="fav ${sel.includes(c.id) ? 'on' : ''}" data-sel="${c.id}">${avatar(nm(c), i, 'big')}<span>${nm(c).split(' ')[0]}</span><i class="tick">${ic('success-check', 'sm')}</i></button>`).join('')}</div>
      <div class="list rise"><div class="item kv">${avatar(nm({ en: 'Amira Haddad', ar: 'أميرة حداد' }), 0)}<span class="sp b">${t('sp_you')}</span><span class="b">${money(each)}</span></div>${sel.map(id => `<div class="item kv">${avatar(nm(person(id)), +id.slice(1))}<span class="sp">${esc(nm(person(id)))}</span><span class="b">${money(each)}</span></div>`).join('')}</div>`, { head: hdr(t('sp_title')), foot: `<button class="btn block lg" id="spg" ${sel.length ? '' : 'disabled'}>${t('sp_send')}</button>` });
  },
  mount(el) {
    el.addEventListener('click', e => { const s = e.target.closest('[data-sel]'); if (s) { const id = s.dataset.sel; el._sel = el._sel.includes(id) ? el._sel.filter(x => x !== id) : [...el._sel, id]; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); } });
    $('#spg', el).addEventListener('click', async () => { await processing(t('proc'), 900); showSuccess({ title: t('sp_done'), amountMinor: 9600, sub: '', rows: [[t('sp_each'), money(Math.round(9600 / (el._sel.length + 1)))], [t('sp_with'), t('sp_people', { n: el._sel.length })]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button>` }); });
  }
});

/* ---------- exchange ---------- */
const RATE = 4.82;
reg('exchange', {
  skel: false,
  render(p, el) {
    const flip = el._flip, a = el._a || '';
    const from = flip ? 'USD' : st.cur, to = flip ? st.cur : 'USD', bal = flip ? S.usd : S.balance;
    const m = toMinor(a), got = flip ? Math.round(m * RATE) : Math.round(m / RATE);
    return scr(`<div class="fxbox rise"><div class="small muted b">${t('fx_you')}</div><div class="row"><span class="fx-c disp">${from}</span><span class="fx-v disp num" data-amt>${a || '0'}</span></div><div class="tiny muted">${t('avail')}: ${money(bal, { cur: from })}</div></div>
      <div class="swapwrap"><button class="swapbtn" data-act="swap" aria-label="${t('fx_swap')}">${ic('swap-exchange')}</button><span class="badge info">${t('fx_rate', { r: flip ? `<span class="num">1 USD = ${RATE} ${st.cur}</span>` : `<span class="num">1 USD = ${RATE} ${st.cur}</span>` })}</span></div>
      <div class="fxbox get rise"><div class="small muted b">${t('fx_get')}</div><div class="row"><span class="fx-c disp">${to}</span><span class="fx-v disp num">${numT(got / 100, 2)}</span></div><div class="tiny muted">${t('fx_note')}</div></div>${keypadHtml()}`, { head: hdr(t('fx_title')), foot: `<button class="btn block lg" id="fxg" ${m && m <= bal ? '' : 'disabled'}>${t('fx_btn')}</button>`, cls: 'amtbody' });
  },
  mount(el) {
    el.addEventListener('click', e => { if (e.target.closest('[data-act=swap]')) { el._flip = !el._flip; el._a = ''; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); $('.swapbtn', el).classList.add('spun'); } });
    bindKeypad($('.amtpad', el), s => { el._a = s; const flip = el._flip, m = toMinor(s), bal = flip ? S.usd : S.balance, got = flip ? Math.round(m * RATE) : Math.round(m / RATE); $('[data-amt]', el).textContent = s || '0'; $('.get .fx-v', el).textContent = numT(got / 100, 2); $('#fxg', el).disabled = !m || m > bal; }, el._a || '');
    $('#fxg', el).addEventListener('click', () => pin(async () => { await processing(); const m = toMinor(el._a), flip = el._flip, got = flip ? Math.round(m * RATE) : Math.round(m / RATE), ref = refNo('FX');
      if (flip) { S.usd -= m; addTxn({ type: 'exchange', who: null, amt: got, note: 'USD → ' + st.cur, ref }); } else { S.usd += got; addTxn({ type: 'exchange', who: null, amt: -m, note: st.cur + ' → USD', ref }); }
      showSuccess({ title: t('fx_done'), amountMinor: got, rows: [[t('fx_you'), money(m, { cur: flip ? 'USD' : st.cur })], [t('fx_get'), money(got, { cur: flip ? st.cur : 'USD' })], [t('fx_usd'), money(S.usd, { cur: 'USD' })], [t('ref'), `<span class="mono">${ref}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button>` }); }));
  }
});

/* ---------- scheduled ---------- */
reg('scheduled', {
  render() {
    const d = n => fmtDate(new Date(Date.now() + n * 864e5), { day: 'numeric', month: 'short' });
    const R = [['sc_rent', 'users', 15000, 'sc_monthly', 4, 1], ['sc_net', 'internet', 9900, 'sc_monthly', 11, 1], ['sc_pk', 'savings', 5000, 'sc_weekly', 2, 1]];
    return scr(`<div class="list rise" data-sk>${R.map(([k, i, a, f, n, on], x) => `<div class="item"><span class="lead f${x + 1}">${i === 'internet' ? bIcon('internet') : ic(i)}</span><span class="sp"><span class="t">${t(k)}</span><span class="s" style="display:block">${t(f)} · ${t('sc_next', { d: `<span class="num">${d(n)}</span>` })}</span></span><span class="end b" style="margin-inline-end:8px">${money(a, { nocur: true })}</span>${switchEl('s' + x, !!on)}</div>`).join('')}</div><button class="btn outline block rise" data-act="new">${ic('plus', 'sm')} ${t('sc_new')}</button>`, { head: hdr(t('sc_title')) });
  },
  mount(el) { el.addEventListener('click', e => { if (e.target.closest('[data-act=new]')) go('send'); }); }
});
