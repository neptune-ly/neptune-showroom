// Services hub + "Pay over time" (Mizan channel, Murabaha instalments) — native rows, no separate product chrome.
import { $, $$, S, L, t, T, tx, ic, icf, bal, num, cur, sheet, toast, esc, dateLbl, today, moneyTxt, haptic, sleep } from '../util.js';
import { reg, go, back, backTo, tab, A, rerender } from '../app.js';
import { bankName, accBy, TX } from '../data.js';
import { authorize, bioSheet } from './auth.js';

L([
  ['Services', 'Services', 'الخدمات'], ['Utilities, internet, fees', 'Services, internet, taxes', 'خدمات وإنترنت ورسوم'], ['Any operator', 'Tout opérateur', 'أي مشغّل'], ['Live rates', 'Taux en direct', 'أسعار مباشرة'], ['Pay bills', 'Payer des factures', 'دفع الفواتير'], ['Mobile top-up', 'Recharge mobile', 'شحن الهاتف'], ['Currency exchange', 'Change de devises', 'صرف العملات'], ['Request money', 'Demander de l\'argent', 'طلب أموال'], ['Split a bill', 'Partager l\'addition', 'تقسيم الفاتورة'], ['Spending insights', 'Analyse des dépenses', 'تحليل الإنفاق'], ['Savings goals', 'Objectifs d\'épargne', 'أهداف التوفير'], ['Partner services', 'Services partenaires', 'خدمات الشركاء'], ['Widgets', 'Widgets', 'الودجات'],
  ['Pay over time', 'Payer en plusieurs fois', 'ادفع على أقساط'], ['Split a purchase into 3, 6 or 12 months', 'Étalez un achat sur 3, 6 ou 12 mois', 'قسّط مشترياتك على 3 أو 6 أو 12 شهراً'], ['Provided by {bank}', 'Proposé par {bank}', 'يقدمه {bank}'], ['Choose a plan', 'Choisissez un plan', 'اختر خطة'], ['Everything disclosed first', 'Tout est annoncé d\'abord', 'كل شيء معلن مسبقاً'], ['Price, profit and total before you sign.', 'Prix, profit et total avant signature.', 'السعر والربح والإجمالي قبل التوقيع.'], ['Fixed monthly schedule', 'Échéancier mensuel fixe', 'جدول شهري ثابت'], ['No compounding on late payment.', 'Pas de cumul en cas de retard.', 'بلا تراكم على التأخير.'], ['Start a plan', 'Commencer un plan', 'ابدأ خطة'],
  ['Checkout', 'Paiement', 'الدفع'], ['Merchant', 'Commerçant', 'التاجر'], ['Item', 'Article', 'السلعة'], ['Delivery', 'Livraison', 'التوصيل'], ['Free', 'Gratuit', 'مجاني'], ['Pay in full now', 'Payer en une fois', 'ادفع كاملاً الآن'], ['months', 'mois', 'أشهر'], ['{n} months', '{n} mois', '{n} أشهر'], ['{m} / month', '{m} / mois', '{m} / شهر'], ['Total {t}', 'Total {t}', 'الإجمالي {t}'], ['Continue', 'Continuer', 'متابعة'],
  ['Price of goods', 'Prix de l\'article', 'سعر السلعة'], ['Bank cost', 'Coût pour la banque', 'تكلفة المصرف'], ['Disclosed profit', 'Profit annoncé', 'الربح المعلن'], ['Total to pay', 'Total à payer', 'الإجمالي المستحق'], ['Instalments', 'Mensualités', 'الأقساط'], ['First instalment', 'Première mensualité', 'القسط الأول'], ['Review contract', 'Voir le contrat', 'مراجعة العقد'], ['Murabaha sale offer', 'Offre de vente Mourabaha', 'عرض بيع مرابحة'],
  ['Sale contract', 'Contrat de vente', 'عقد البيع'], ['Seller', 'Vendeur', 'البائع'], ['Buyer', 'Acheteur', 'المشتري'], ['Goods', 'Marchandise', 'السلعة'], ['Schedule', 'Échéancier', 'الجدول'], ['I have read the contract and the cost disclosure', 'J\'ai lu le contrat et l\'annonce des coûts', 'اطلعت على العقد والإفصاح عن التكلفة'], ['Confirm with biometrics', 'Confirmer par biométrie', 'التأكيد بالبصمة'], ['Sign in to', 'Se connecter à', 'تسجيل الدخول إلى'],
  ['Plan active', 'Plan actif', 'الخطة نشطة'], ['Next instalment', 'Prochaine mensualité', 'القسط القادم'], ['Due {d}', 'Échéance {d}', 'مستحق {d}'], ['remaining', 'restant', 'متبقٍ'], ['Instalment {i} of {n}', 'Mensualité {i} sur {n}', 'القسط {i} من {n}'], ['Paid', 'Payé', 'مدفوع'], ['Due', 'À payer', 'مستحق'], ['Upcoming', 'À venir', 'قادم'], ['Pay instalment', 'Payer la mensualité', 'سدّد القسط'], ['Settle early', 'Solder par anticipation', 'سداد مبكر'], ['Return item', 'Retourner l\'article', 'إرجاع السلعة'],
  ['Early settlement', 'Règlement anticipé', 'السداد المبكر'], ['Remaining instalments', 'Mensualités restantes', 'الأقساط المتبقية'], ['Rebate on unearned profit', 'Remise sur profit non acquis', 'خصم على الربح غير المستحق'], ['You pay today', 'Vous payez aujourd\'hui', 'تدفع اليوم'], ['Settle {amt}', 'Solder {amt}', 'سدّد {amt}'], ['Plan settled', 'Plan soldé', 'تم سداد الخطة'], ['Instalment paid', 'Mensualité payée', 'تم سداد القسط'], ['Return this item?', 'Retourner cet article ?', 'إرجاع هذه السلعة؟'], ['The merchant is notified and your plan is cancelled. Instalments paid are refunded.', 'Le commerçant est informé et votre plan est annulé. Les mensualités payées sont remboursées.', 'يُبلَّغ التاجر وتُلغى الخطة. تُردّ الأقساط المدفوعة.'], ['Request return', 'Demander le retour', 'طلب الإرجاع'], ['Return requested', 'Retour demandé', 'تم طلب الإرجاع'], ['No active plan', 'Aucun plan actif', 'لا توجد خطة نشطة'],
  ['Pay {amt}', 'Payer {amt}', 'ادفع {amt}'], ['Fee', 'Frais', 'الرسوم'], ['Done', 'Terminé', 'تم'], ['Cancel', 'Annuler', 'إلغاء'], ['Wireless headphones', 'Casque sans fil', 'سماعات لاسلكية'], ['View plan', 'Voir le plan', 'عرض الخطة'],
]);

const PLANS = { 3: .045, 6: .08, 12: .14 };
const calc = (price, m) => { const profit = Math.round(price * PLANS[m] * 1000) / 1000, total = price + profit; return { profit, total, monthly: Math.round(total / m * 1000) / 1000 } };
const mark = (c = 'mzmark') => `<img class="${c}" src="assets/brand/${S.theme === 'dark' ? 'mizan-mark-reverse' : 'mizan-mark'}.svg" alt="">`;
const dueDate = i => { const d = new Date(today); d.setMonth(d.getMonth() + i + 1); return d };
const row = (ico, label, go_, p, sub = '') => `<button class="row" data-go="${go_}" data-p='${JSON.stringify(p || {})}'><span class="tile">${ic(ico)}</span><div class="tx"><b>${t(label)}</b>${sub ? `<small>${sub}</small>` : ''}</div>${icf('chevron-right', 'muted')}</button>`;
const kv = (l, v) => `<div class="row kvr"><div class="tx"><small>${l}</small><b>${v}</b></div></div>`;

const sv = (ico, tone, label, go_, sub = '') => `<button class="sv" data-go="${go_}"><span class="tile ${tone}">${ic(ico)}</span><div><b>${t(label)}</b>${sub ? `<small>${sub}</small>` : ''}</div></button>`;
reg('services', () => {
  const sub = S.mz && !S.mz.closed ? `${t('Next instalment')} · ${moneyTxt(S.mz.monthly)}` : t('Split a purchase into 3, 6 or 12 months');
  return { title: t('Services'), body: `<div class="svgrid rv">
    <button class="sv feat" data-go="vouchers"><span class="tile acc">${ic('gift', 'l')}</span><div><b>${t('Vouchers')}</b><small>${t('Top up, stream, play and shop')}</small></div></button>
    ${sv('bill', 'f1', 'Pay bills', 'bills', t('Utilities, internet, fees'))}${sv('phone', 'f2', 'Mobile top-up', 'topup', t('Any operator'))}${sv('exchange-rate', 'f3', 'Currency exchange', 'fx', t('Live rates'))}${sv('request', '', 'Request money', 'request')}${sv('split-bill', 'f2', 'Split a bill', 'split')}${sv('chart-pie', 'f1', 'Spending insights', 'insights')}${sv('goal', 'f3', 'Savings goals', 'goals')}${sv('category-tag', '', 'Partner services', 'partners')}
    <button class="sv" data-go="mizan" style="grid-column:1/-1;grid-auto-flow:column;grid-template-columns:auto 1fr auto;align-items:center;min-height:0">${mark()}<div><b>${t('Pay over time')}</b><small>${sub}</small></div>${icf('chevron-right', 'muted')}</button>
    </div>` };
});

reg('mizan', () => {
  const p = S.mz;
  return { title: t('Pay over time'), body: `<div class="mzhead">${mark()}<div><b>${t('Pay over time')}</b><small>${t('Provided by {bank}', { bank: esc(bankName()) })}</small></div></div>
    ${p && !p.closed ? `<div class="next rv" style="margin-top:18px"><small>${t('Next instalment')}</small><div class="amt disp">${bal(p.monthly, 'LYD')}</div><small>${t('Due {d}', { d: dateLbl(dueDate(p.paid), 1) })} · ${esc(t(p.item))}</small></div><div class="actions"><button class="btn" data-go="mz-plan">${t('View plan')}</button></div>`
      : `<div class="group rv" style="margin-top:18px"><div class="row kvr"><div class="tx"><b>${t('Choose a plan')}</b><small>${t('Split a purchase into 3, 6 or 12 months')}</small></div></div><div class="row kvr"><div class="tx"><b>${t('Everything disclosed first')}</b><small>${t('Price, profit and total before you sign.')}</small></div></div><div class="row kvr"><div class="tx"><b>${t('Fixed monthly schedule')}</b><small>${t('No compounding on late payment.')}</small></div></div></div><div class="actions"><button class="btn" data-go="mz-checkout">${t('Start a plan')}</button></div>`}` };
});

const M0 = { n: 'Atlas Electronics', item: 'Wireless headphones', price: 840 };
reg('mz-checkout', () => ({
  title: t('Checkout'), body: `<div class="rc"><b class="rn">${M0.n}</b><div class="amt disp">${bal(M0.price, 'LYD')}</div></div>
    <div class="group" style="margin-top:14px">${kv(t('Merchant'), M0.n)}${kv(t('Item'), t(M0.item))}${kv(t('Delivery'), t('Free'))}</div>
    <div class="actions"><button class="btn" data-act="mzfull">${t('Pay {amt}', { amt: moneyTxt(M0.price) })}</button><button class="btn outline" data-go="mz-plans" data-p='${JSON.stringify(M0)}'>${mark()}${t('Pay over time')}</button></div>`
}));
A.mzfull = async () => { const ok = await authorize({ title: t('Checkout'), amount: M0.price, rows: [[t('Merchant'), M0.n], [t('Fee'), t('Free')]] }); if (ok) { accBy('cur').bal -= M0.price; go('done', { amt: M0.price, ccy: 'LYD', tgt: M0.n, ref: 'CK55021', fee: 0 }) } };

reg('mz-plans', (p) => ({
  title: t('Pay over time'), body: `<div class="mzhead"><div><b>${esc(p.n)}</b><small>${esc(t(p.item))} · <span class="num">${num(p.price)} ${cur('LYD')}</span></small></div></div>
    <section class="sec"><h3>${t('Choose a plan')}</h3><div class="group" id="pl">${[3, 6, 12].map(m => { const c = calc(p.price, m); return `<button class="plan" data-m="${m}" aria-checked="${m === 6}"><span class="radio"></span><div class="tx"><b>${t('{n} months', { n: m })}</b><small>${t('Total {t}', { t: moneyTxt(c.total) })}</small></div><div class="end"><b class="num">${num(c.monthly)}</b><small>${t('{m} / month', { m: cur('LYD') })}</small></div></button>` }).join('')}</div></section>
    <div class="actions"><button class="btn" id="go">${t('Continue')}</button></div>`,
  mount(el) { let m = 6; $$('.plan', el).forEach(b => b.onclick = () => { m = +b.dataset.m; $$('.plan', el).forEach(x => x.setAttribute('aria-checked', x === b)); haptic(8) }); $('#go', el).onclick = () => go('mz-disclosure', { ...p, months: m }) }
}));

reg('mz-disclosure', (p) => { const c = calc(p.price, p.months); return {
  title: t('Everything disclosed first'), body: `<p class="muted" style="padding:6px 20px 0">${t('Price, profit and total before you sign.')}</p><div class="group" style="margin-top:8px">${kv(t('Price of goods'), `<span class="num">${num(p.price)} ${cur('LYD')}</span>`)}${kv(t('Bank cost'), `<span class="num">${num(p.price)} ${cur('LYD')}</span>`)}${kv(t('Disclosed profit'), `<span class="num">${num(c.profit)} ${cur('LYD')}</span>`)}${kv(t('Total to pay'), `<span class="num">${num(c.total)} ${cur('LYD')}</span>`)}${kv(t('Instalments'), `<span class="num">${p.months} × ${num(c.monthly)} ${cur('LYD')}</span>`)}${kv(t('First instalment'), dateLbl(dueDate(0), 1))}</div>
    <div class="actions"><button class="btn" id="go">${t('Review contract')}</button></div>`,
  mount(el) { $('#go', el).onclick = () => go('mz-contract', p) } } });

reg('mz-contract', (p) => { const c = calc(p.price, p.months); return {
  title: t('Murabaha sale offer'), body: `<div class="group" style="margin-top:8px">${kv(t('Seller'), esc(bankName()))}${kv(t('Buyer'), T('Layla Haddad', 'Layla Haddad', 'ليلى حداد'))}${kv(t('Goods'), `${esc(t(p.item))} — ${esc(p.n)}`)}${kv(t('Price of goods'), `<span class="num">${num(p.price)} ${cur('LYD')}</span>`)}${kv(t('Disclosed profit'), `<span class="num">${num(c.profit)} ${cur('LYD')}</span>`)}${kv(t('Total to pay'), `<span class="num">${num(c.total)} ${cur('LYD')}</span>`)}${kv(t('Schedule'), `<span class="num">${p.months} × ${num(c.monthly)} ${cur('LYD')}</span>`)}
    <div class="row"><div class="tx"><b style="white-space:normal;font-weight:500;font-size:15px">${t('I have read the contract and the cost disclosure')}</b></div><button class="switch" role="switch" id="rd" aria-checked="false"></button></div></div>
    <div class="actions"><button class="btn" id="go" disabled>${ic('fingerprint')}${t('Confirm with biometrics')}</button></div>`,
  mount(el) {
    $('#rd', el).onclick = e => { const on = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', on); $('#go', el).disabled = !on; haptic(8) };
    $('#go', el).onclick = () => bioSheet(() => { S.mz = { n: p.n, item: p.item, price: p.price, months: p.months, ...c, paid: 0, closed: false }; go('mz-plan', { fresh: 1 }) }, t('Murabaha sale offer'));
  } } });

reg('mz-plan', ({ fresh }) => {
  const p = S.mz; if (!p) return { title: t('Pay over time'), body: `<div class="empty"><b>${t('No active plan')}</b></div>` };
  const left = p.months - p.paid, rem = left * p.monthly;
  return { title: fresh ? t('Plan active') : t('Pay over time'), body: `${p.closed ? `<div class="next"><span class="badge ok">${t('Plan settled')}</span></div>` : `<div class="next rv"><small>${t('Next instalment')}</small><div class="amt disp">${bal(p.monthly, 'LYD')}</div><small>${t('Due {d}', { d: dateLbl(dueDate(p.paid), 1) })} · <span class="num">${num(rem)} ${cur('LYD')}</span> ${t('remaining')}</small></div>`}
    ${p.closed ? '' : `<div class="actions"><button class="btn" data-act="mzpay">${t('Pay instalment')}</button><button class="btn outline" data-act="mzsettle">${t('Settle early')}</button><button class="btn text" data-act="mzreturn" style="margin:auto">${t('Return item')}</button></div>`}
    <section class="sec"><h3>${esc(t(p.item))} · ${esc(p.n)}</h3><div class="group sched">${Array.from({ length: p.months }, (_, i) => { const st = p.closed || i < p.paid ? 'ok' : i === p.paid ? 'warn' : ''; return `<div class="row"><div class="tx"><b>${t('Instalment {i} of {n}', { i: i + 1, n: p.months })}</b><small>${dateLbl(dueDate(i), 1)}</small></div><div class="end"><b class="num">${num(p.monthly)}</b>${st ? `<span class="st ${st === 'ok' ? 'pos' : ''}" style="color:var(--${st === 'ok' ? 'ok' : 'warn'})">${st === 'ok' ? t('Paid') : t('Due')}</span>` : `<small>${t('Upcoming')}</small>`}</div></div>` }).join('')}</div></section>` };
});
A.mzpay = async () => { const p = S.mz; const ok = await authorize({ title: t('Pay instalment'), amount: p.monthly, rows: [[t('Instalment {i} of {n}', { i: p.paid + 1, n: p.months }), ''], [t('Fee'), t('Free')]] }); if (!ok) return; accBy('cur').bal -= p.monthly; p.paid++; if (p.paid >= p.months) p.closed = true; back(); setTimeout(() => { go('mz-plan', {}); toast(t('Instalment paid'), 'success-check') }, 420) };
A.mzsettle = () => { const p = S.mz, left = p.months - p.paid, rem = left * p.monthly, reb = Math.round(rem * (p.profit / p.total) * .25 * 1000) / 1000, pay = rem - reb;
  sheet(`<h2>${t('Early settlement')}</h2><div class="kv" style="margin-top:8px"><div><span>${t('Remaining instalments')}</span><b class="num">${num(rem)} ${cur('LYD')}</b></div><div><span>${t('Rebate on unearned profit')}</span><b class="num pos">−${num(reb)} ${cur('LYD')}</b></div><div class="tot"><span>${t('You pay today')}</span><b class="num">${num(pay)} ${cur('LYD')}</b></div></div><button class="btn" data-close="ok">${t('Settle {amt}', { amt: moneyTxt(pay) })}</button>`, { onClose: async v => { if (v !== 'ok') return; const ok = await authorize({ title: t('Early settlement'), amount: pay, rows: [[t('Fee'), t('Free')]] }); if (!ok) return; accBy('cur').bal -= pay; p.closed = true; p.paid = p.months; go('done', { amt: pay, ccy: 'LYD', tgt: p.n, ref: 'MZ' + (8100 + p.months), fee: 0, title: t('Plan settled') }) } }) };
A.mzreturn = () => sheet(`<h2>${t('Return this item?')}</h2><p class="sub">${t('The merchant is notified and your plan is cancelled. Instalments paid are refunded.')}</p><button class="btn danger" data-close="ok">${t('Request return')}</button><button class="btn text" data-close="x" style="margin:6px auto 0;display:flex">${t('Cancel')}</button>`, { onClose: v => { if (v === 'ok') { S.mz = null; tab('home'); setTimeout(() => toast(t('Return requested'), 'refund'), 500) } } });

if (new URLSearchParams(location.search).get('mz')) S.mz = { n: 'Atlas Electronics', item: 'Wireless headphones', price: 840, months: 6, ...calc(840, 6), paid: 1, closed: false };
