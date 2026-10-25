// Dashboard, customers, wallets, transactions.
import { st, t, add, ic, esc, money, moneyT, numT, countUp, spark, lineChart, bars, donut, gauge, ring, short, fmtDate, fmtTime, rng, tenantName, RM } from '../assets/core.js';
import { $, $$, nm, page, head, card, kpi, btn, badge, stBadge, av, toast, drawer, closeDrawer, modal, Table, chartTips, every, wait } from './ckit.js';
import { CUSTOMERS, TXNS, AGENTS, MERCHANTS, DAYS, ALERTS, CITIES } from './cdata.js';

add({
  d_title: 'Dashboard§Tableau de bord§لوحة المؤشرات', d_sub: 'Live position of the {t} wallet programme§Position en direct du programme portefeuille {t}§الوضع المباشر لبرنامج محفظة {t}', d_7: '7 days§7 jours§7 أيام', d_30: '30 days§30 jours§30 يوماً',
  k_wallets: 'Active wallets§Portefeuilles actifs§المحافظ النشطة', k_txn: 'Transactions today§Transactions du jour§معاملات اليوم', k_vol: 'Volume today§Volume du jour§حجم اليوم', k_rev: 'Net revenue today§Revenu net du jour§صافي إيراد اليوم',
  d_chart: 'Volume and transactions§Volume et transactions§الحجم والمعاملات', d_chart_s: 'Volume in thousands · transactions per day§Volume en milliers · transactions par jour§الحجم بالآلاف · المعاملات يومياً', d_vol: 'Volume (K)§Volume (K)§الحجم (ألف)', d_cnt: 'Transactions§Transactions§المعاملات',
  d_mix: 'Transaction mix§Répartition§توزيع المعاملات', d_live: 'Live activity§Activité en direct§النشاط المباشر', d_heat: 'Busiest hours§Heures de pointe§ساعات الذروة', d_funnel: 'Onboarding funnel§Entonnoir d’inscription§مسار التسجيل', d_health: 'Platform health§Santé de la plateforme§صحة المنصة', d_top: 'Top agents (30 days)§Meilleurs agents (30 j)§أفضل الوكلاء (30 يوماً)', d_alerts: 'Open alerts§Alertes ouvertes§التنبيهات المفتوحة',
  h_succ: 'Success rate§Taux de réussite§نسبة النجاح', h_lat: 'p95 latency§Latence p95§زمن الاستجابة p95', h_ledger: 'Ledger balanced§Grand livre équilibré§دفتر الأستاذ متوازن', h_ok: 'Debits = credits per asset§Débits = crédits par actif§المدين = الدائن لكل أصل', h_q: 'Settlement queue§File de règlement§طابور التسوية', f1: 'Downloads§Téléchargements§التنزيلات', f2: 'Phone verified§Téléphone vérifié§تحقق الهاتف', f3: 'Wallet opened§Portefeuille ouvert§فتح المحفظة', f4: 'First top-up§Première recharge§أول إيداع', f5: 'Tier 2 verified§Niveau 2 vérifié§توثيق المستوى 2',
  tt_p2p: 'Send money§Envoi§إرسال أموال', tt_merchant: 'Merchant payment§Paiement marchand§دفع لتاجر', tt_cashin: 'Cash in§Dépôt§إيداع نقدي', tt_cashout: 'Cash out§Retrait§سحب نقدي', tt_bill: 'Bill payment§Paiement de facture§دفع فاتورة', tt_airtime: 'Airtime§Recharge§شحن رصيد', tt_reversal: 'Reversal§Annulation§عكس عملية',
  ch_app: 'App§App§التطبيق', ch_agent: 'Agent§Agent§وكيل', ch_ussd: 'USSD§USSD§USSD', ch_api: 'Partner API§API partenaire§واجهة الشركاء',
  cu_title: 'Customers§Clients§العملاء', cu_sub: 'Every wallet holder, with tier, status and risk at a glance§Chaque titulaire, avec niveau, statut et risque§كل أصحاب المحافظ مع المستوى والحالة والمخاطر', cu_add: 'Add customer§Ajouter un client§إضافة عميل', cu_cust: 'Customer§Client§العميل', cu_tier: 'Tier§Niveau§المستوى', cu_status: 'Status§Statut§الحالة', cu_bal: 'Balance (LYD)§Solde (LYD)§الرصيد (LYD)', cu_risk: 'Risk§Risque§المخاطر', cu_city: 'City§Ville§المدينة', cu_joined: 'Joined§Inscrit§الانضمام', cu_phone: 'Phone§Téléphone§الهاتف',
  t0: 'Tier 0 · Basic§Niveau 0 · Basique§المستوى 0 · أساسي', t1: 'Tier 1 · Standard§Niveau 1 · Standard§المستوى 1 · قياسي', t2: 'Tier 2 · Verified§Niveau 2 · Vérifié§المستوى 2 · موثّق', t3: 'Tier 3 · Premium§Niveau 3 · Premium§المستوى 3 · مميّز', tn0: 'Basic§Basique§أساسي', tn1: 'Standard§Standard§قياسي', tn2: 'Verified§Vérifié§موثّق', tn3: 'Premium§Premium§مميّز',
  cd_freeze: 'Freeze wallet§Geler le portefeuille§تجميد المحفظة', cd_unfreeze: 'Unfreeze wallet§Dégeler§إلغاء التجميد', cd_raise: 'Request limit increase§Demander une hausse de plafond§طلب رفع الحدود', cd_msg: 'Send message§Envoyer un message§إرسال رسالة', cd_wallets: 'Wallets§Portefeuilles§المحافظ', cd_recent: 'Recent transactions§Transactions récentes§آخر المعاملات', cd_limits: 'Limit usage today§Utilisation du jour§استخدام الحدود اليوم', cd_frozen_t: 'Wallet frozen — customer notified§Portefeuille gelé — client notifié§تم تجميد المحفظة — أُبلغ العميل', cd_unfrozen_t: 'Wallet unfrozen§Portefeuille dégelé§أُلغي التجميد', cd_raise_t: 'Limit increase requested§Hausse demandée§تم طلب رفع الحدود', cd_msg_t: 'Message queued (simulated)§Message en file (simulé)§أُضيفت الرسالة للطابور (محاكاة)', cd_reason: 'Reason§Motif§السبب', cd_r1: 'Customer request§Demande du client§طلب العميل', cd_r2: 'Verified income§Revenu vérifié§دخل موثّق', cd_r3: 'Business need§Besoin professionnel§حاجة تجارية', cd_main: 'Main wallet§Portefeuille principal§المحفظة الرئيسية', cd_txns: 'transactions§transactions§معاملة', cd_added: 'Customer added (simulated)§Client ajouté (simulé)§تمت إضافة العميل (محاكاة)', cd_kycdone: 'KYC passed§KYC validé§تم التوثيق',
  w_title: 'Wallets§Portefeuilles§المحافظ', w_sub: 'Every ledger account, double-entry and balanced per currency§Chaque compte du grand livre, en partie double§كل حساب في دفتر الأستاذ بقيد مزدوج ومتوازن لكل عملة', w_type: 'Type§Type§النوع', w_owner: 'Owner§Titulaire§المالك', w_avail: 'Available§Disponible§المتاح', w_holds: 'Holds§Réservé§المحجوز', w_liab: 'Customer wallets§Portefeuilles clients§محافظ العملاء', w_float: 'Agent float§Float agents§سيولة الوكلاء', w_settle: 'Merchant settlement§Règlement marchands§تسوية التجار', w_treas: 'Tenant treasury§Trésorerie§خزينة المشغّل', w_proof: 'Trial balance: total debits equal total credits — {d} = {c}§Balance : débits = crédits — {d} = {c}§ميزان المراجعة: إجمالي المدين = إجمالي الدائن — {d} = {c}',
  wt_personal: 'Personal§Personnel§شخصية', wt_pocket: 'Pocket§Poche§جيب', wt_agent: 'Agent float§Float agent§سيولة وكيل', wt_merchant: 'Merchant settlement§Règlement marchand§تسوية تاجر', wt_treasury: 'Treasury§Trésorerie§الخزينة', wt_fee: 'Fee income§Revenus de frais§إيرادات الرسوم', wl_title: 'Ledger entries§Écritures§قيود الدفتر', wl_acct: 'Account§Compte§الحساب', wl_dr: 'Debit§Débit§مدين', wl_cr: 'Credit§Crédit§دائن', wl_bal: 'Balanced§Équilibré§متوازن',
  x_title: 'Transactions§Transactions§المعاملات', x_sub: 'One-winner intents, idempotent by design — every posting traceable§Intentions uniques, idempotentes — chaque écriture traçable§نوايا فريدة وغير مكررة — كل قيد قابل للتتبع', x_id: 'ID§ID§المعرّف', x_type: 'Type§Type§النوع', x_parties: 'From → To§De → Vers§من ← إلى', x_amt: 'Amount (LYD)§Montant (LYD)§المبلغ (LYD)', x_fee: 'Fee§Frais§الرسوم', x_chan: 'Channel§Canal§القناة', x_time: 'Time§Heure§الوقت',
  xd_intent: 'Payment intent§Intention de paiement§نية الدفع', xd_idem: 'Idempotency key§Clé d’idempotence§مفتاح عدم التكرار', xd_win: 'Winner attempt #1 · {n} duplicate attempts rejected§Tentative gagnante n°1 · {n} doublons rejetés§المحاولة الفائزة رقم 1 · رُفضت {n} محاولات مكررة', xd_journal: 'Journal postings§Écritures comptables§قيود اليومية', xd_time: 'Timeline§Chronologie§المسار الزمني', xd_rev: 'Request reversal§Demander l’annulation§طلب عكس العملية', xd_rcpt: 'Download receipt§Télécharger le reçu§تنزيل الإيصال', xd_s1: 'Intent created§Intention créée§أُنشئت النية', xd_s2: 'Risk checks passed§Contrôles risque réussis§اجتازت فحوص المخاطر', xd_s3: 'Funds reserved§Fonds réservés§حُجز المبلغ', xd_s4: 'Posted to ledger§Comptabilisée§قُيّدت في الدفتر', xd_s5: 'Receipt sent§Reçu envoyé§أُرسل الإيصال', xd_revd: 'Reversal requested§Annulation demandée§طُلب العكس', xd_revh: 'Reverse this transaction§Annuler cette transaction§عكس هذه المعاملة', xd_revw: 'A reversal posts the exact opposite entries. It needs a second approver.§Une annulation passe les écritures inverses. Un second approbateur est requis.§العكس يقيّد القيود المعاكسة تماماً ويتطلب موافقة مراجع ثانٍ.', xd_rreason: 'Reason code§Code motif§رمز السبب', xd_rr1: 'Duplicate payment§Paiement en double§دفعة مكررة', xd_rr2: 'Customer dispute§Litige client§اعتراض العميل', xd_rr3: 'Fraud confirmed§Fraude confirmée§احتيال مؤكد', xd_rsend: 'Submit for approval§Soumettre§إرسال للموافقة'
});

const L = c => nm(c);
const tierB = n => `<span class="tierb t${n}"><i></i>${t('tn' + n)}</span>`;
const riskB = r => `<span class="riskbar ${r > 66 ? 'h' : r > 33 ? 'm' : ''}"><span><i style="width:${r}%"></i></span><b class="num small">${r}</b></span>`;
const dt = d => `<span class="num">${fmtDate(d, { day: 'numeric', month: 'short' })}</span>`;
const dtt = d => `<span class="num">${fmtDate(d, { day: 'numeric', month: 'short' })} ${fmtTime(d)}</span>`;
const cust = id => CUSTOMERS.find(c => c.id === id);
const MIX = [['p2p', '#3BC1EE'], ['merchant', 'var(--look-brand)'], ['cashin', '#2FB59A'], ['cashout', '#E0B72E'], ['bill', 'var(--look-accent)'], ['airtime', '#8E7CE0']];
export const partyName = p => p ? nm(p) : '';

/* ======================== dashboard ======================== */
const series = D => { const k = (D.reduce((a, d) => a + d.vol, 0) / D.reduce((a, d) => a + d.cnt, 0)) * .55; return [D.map(d => d.vol), D.map(d => Math.round(d.cnt * k))]; };
page('dashboard', {
  render() {
    const sp = i => DAYS.map(d => d.vol * (1 + (i % 3) * .08)).slice(-14);
    return `${head(t('d_title'), t('d_sub', { t: esc(tenantName()) }), `<div class="seg" id="rng" style="min-width:210px"><button aria-selected="false" data-r="7">${t('d_7')}</button><button aria-selected="true" data-r="30">${t('d_30')}</button></div>${btn(t('c_export'), { cls: 'outline', icon: 'download', act: 'exp' })}`)}
    <div class="g g4">${kpi({ label: t('k_wallets'), value: 184230, delta: '3.2%', spark: sp(0), f: 1, icon: 'wallet' })}${kpi({ label: t('k_txn'), value: 41862, delta: '8.4%', spark: sp(1), f: 2, icon: 'transfer' }).replace('<span class="num" data-count', '<span class="num" id="txnk" data-count')}${kpi({ label: t('k_vol'), value: 6.42, dec: 2, suf: 'M LYD', delta: '5.1%', spark: sp(2), f: 3, icon: 'chart-line' })}${kpi({ label: t('k_rev'), value: 38120, suf: 'LYD', delta: '1.8%', spark: sp(0).reverse(), f: 4, icon: 'coins' })}</div>
    <div class="g g21">${card(t('d_chart'), `<div id="lc" class="chartbox">${lineChart(series(DAYS), DAYS.map(d => fmtDate(d.d, { day: 'numeric' })), { w: 720, h: 290 })}</div><div class="legendrow"><span><i style="background:var(--look-brand)"></i>${t('d_vol')}</span><span><i style="background:var(--look-accent)"></i>${t('d_cnt')}</span></div>`, { sub: t('d_chart_s') })}
      ${card(t('d_mix'), `<div class="mixrow">${donut(MIX.map(([k, c], i) => ({ v: [42, 24, 13, 9, 8, 4][i], c })), { size: 176, thick: 24, center: `<div><div class="small muted">${t('x_title')}</div><b class="disp" style="font-size:22px"><span class="num" data-count="41862">0</span></b></div>` })}<div class="legend">${MIX.map(([k, c], i) => `<div class="lg"><i style="background:${c}"></i><span class="sp">${t('tt_' + k)}</span><b class="num">${[42, 24, 13, 9, 8, 4][i]}%</b></div>`).join('')}</div></div>`)}</div>
    <div class="g g3">${card(t('d_live'), `<ul class="feed" id="feed">${TXNS.slice(0, 7).map(feedRow).join('')}</ul>`, { actions: '<span class="livedot"></span>' })}
      ${card(t('d_heat'), heat())}
      ${card(t('d_funnel'), funnel())}</div>
    <div class="g g32">${card(t('d_health'), `<div class="health">${[[t('h_succ'), gauge(99, { size: 130, thick: 13, label: '99.2%', color: 'var(--ok)' })], [t('h_lat'), gauge(72, { size: 130, thick: 13, label: '184ms', color: 'var(--look-brand)' })], [t('h_q'), gauge(34, { size: 130, thick: 13, label: '34%', color: 'var(--look-accent)' })]].map(([l, g]) => `<div class="hg">${g}<span class="small muted b">${l}</span></div>`).join('')}</div><div class="okbar">${ic('success-check')}<div><b>${t('h_ledger')}</b><div class="small">${t('h_ok')}</div></div></div>`)}
      ${card(t('d_top'), `<div class="lb">${[...AGENTS].sort((a, b) => b.txn30 - a.txn30).slice(0, 5).map((a, i) => `<div class="lbr"><b class="rk">${i + 1}</b>${av(L(a), i)}<span class="sp"><b>${esc(L(a))}</b><span class="barx"><i style="--w:${a.txn30 / 24}%"></i></span></span><span class="num b">${numT(a.txn30)}</span></div>`).join('')}</div>`)}</div>`;
  },
  mount(el) {
    const draw = n => { const D = DAYS.slice(-n); $('#lc', el).innerHTML = lineChart(series(D), D.map(d => fmtDate(d.d, { day: 'numeric' })), { w: 720, h: 290 }); chartTips($('#lc', el), [D.map(d => d.vol), D.map(d => d.cnt)], D.map(d => fmtDate(d.d, { day: 'numeric', month: 'short' }))); };
    chartTips($('#lc', el), [DAYS.map(d => d.vol), DAYS.map(d => d.cnt)], DAYS.map(d => fmtDate(d.d, { day: 'numeric', month: 'short' })));
    $('#rng', el).addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; $$('#rng button', el).forEach(x => x.setAttribute('aria-selected', x === b)); draw(+b.dataset.r); });
    el.addEventListener('click', e => { if (e.target.closest('[data-act=exp]')) toast(t('c_exported'), 'download'); const f = e.target.closest('.feed li'); if (f) { location.hash = '#/transactions'; setTimeout(() => openTxn(f.dataset.id), 150); } });
    let n = 7, count = 41862; const feed = $('#feed', el), k = $('#txnk', el);
    every(() => { const x = TXNS[(n++ * 3) % TXNS.length]; const li = document.createElement('li'); li.innerHTML = feedInner({ ...x, t: new Date() }); li.className = 'new'; li.dataset.id = x.id; feed.prepend(li); if (feed.children.length > 7) feed.lastChild.remove(); count += 1 + (n % 3); if (k) k.textContent = numT(count); }, 3200);
  }
});
const feedInner = x => `<span class="fi">${ic({ p2p: 'send', merchant: 'shopping-bag', cashin: 'arrow-down', cashout: 'atm', bill: 'bill', airtime: 'phone', reversal: 'refund' }[x.type])}</span><span class="sp"><b>${t('tt_' + x.type)}</b><small class="muted">${esc(partyName(x.from))} → ${esc(partyName(x.to))}</small></span><span class="end"><b class="num">${moneyT(x.amt)}</b><small class="muted num">${fmtTime(x.t)}</small></span>`;
const feedRow = x => `<li data-id="${x.id}">${feedInner(x)}</li>`;
function heat() {
  const R = rng('heat'); const days = st.lang === 'ar' ? ['إث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'] : st.lang === 'fr' ? ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return `<div class="heat">${days.map((d, r) => `<span class="hl">${d}</span>${Array.from({ length: 24 }, (_, h) => { const v = Math.max(0, Math.exp(-Math.pow((h - 13) / 4.5, 2)) * (r > 4 ? .8 : 1) + Math.exp(-Math.pow((h - 20) / 2, 2)) * .5 + R() * .18); return `<i style="--v:${Math.min(1, v).toFixed(2)};--d:${(r * 24 + h) * 4}ms" title="${d} ${h}:00"></i>`; }).join('')}`).join('')}</div><div class="heatx small muted"><span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span></div>`;
}
function funnel() { const v = [100, 71, 58, 39, 24]; return `<div class="fun">${v.map((x, i) => `<div class="fr"><span class="small">${t('f' + (i + 1))}</span><span class="fbar"><i style="--w:${x}%;--d:${i * 90}ms"></i></span><b class="num small">${x}%</b></div>`).join('')}</div>`; }

/* ======================== customers ======================== */
export function openCustomer(id) {
  const c = cust(id) || CUSTOMERS[0], tx = TXNS.filter(x => x.cust === c.id).slice(0, 5), L0 = [50000, 500000, 2500000, 10000000][c.tier];
  const d = drawer(`<div class="dh">${av(L(c), +c.id.slice(-1))}<div class="sp"><h2 class="disp">${esc(L(c))}</h2><div class="small muted"><span class="mono">${c.id}</span> · ${esc(L(c.city))}</div></div></div>
    <div class="row wrap" id="cst">${stBadge(c.status)} ${tierB(c.tier)} ${riskB(c.risk)}</div>
    <div class="g g3 mini"><div class="mk"><small>${t('cu_bal')}</small><b class="disp">${money(c.bal, { nocur: true })}</b></div><div class="mk"><small>${t('x_title')}</small><b class="disp num">${c.txn}</b></div><div class="mk"><small>${t('cu_joined')}</small><b class="disp">${dt(c.joined)}</b></div></div>
    <section class="stack s8"><div class="small b muted">${t('cd_limits')}</div>${[[t('cd_limits'), Math.round(L0 * .3), L0]].map(([k, u, m]) => `<div class="progress"><i style="--v:${u / m * 100}%"></i></div><div class="row small muted" style="justify-content:space-between"><span class="num">${moneyT(u)}</span><span class="num">${moneyT(m)}</span></div>`).join('')}</section>
    <section class="stack s8"><div class="small b muted">${t('cd_wallets')}</div><div class="list"><div class="item"><span class="lead">${ic('wallet')}</span><span class="sp t">${t('cd_main')}</span><b>${money(c.bal)}</b></div>${c.tier > 0 ? `<div class="item"><span class="lead f2">${ic('savings')}</span><span class="sp t">${t('wt_pocket')}</span><b>${money(Math.round(c.bal * .35))}</b></div>` : ''}</div></section>
    <section class="stack s8"><div class="small b muted">${t('cd_recent')}</div><div class="list">${tx.map(x => `<div class="item"><span class="lead f1">${ic({ p2p: 'send', merchant: 'shopping-bag', cashin: 'arrow-down', cashout: 'atm', bill: 'bill', airtime: 'phone', reversal: 'refund' }[x.type])}</span><span class="sp"><span class="t">${t('tt_' + x.type)}</span><span class="s">${dtt(x.t)}</span></span><b class="num">${moneyT(x.amt)}</b></div>`).join('') || `<div class="item muted">—</div>`}</div></section>
    <div class="row wrap"><button class="btn sm ${c.status === 'frozen' ? '' : 'danger'}" data-a="frz">${ic('lock', 'sm')} ${t(c.status === 'frozen' ? 'cd_unfreeze' : 'cd_freeze')}</button><button class="btn sm tonal" data-a="raise">${ic('trending-up', 'sm')} ${t('cd_raise')}</button><button class="btn sm outline" data-a="msg">${ic('chat', 'sm')} ${t('cd_msg')}</button></div>`);
  d.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'frz') { c.status = c.status === 'frozen' ? 'active' : 'frozen'; $('#cst', d).firstElementChild.outerHTML = stBadge(c.status); e.target.closest('[data-a]').innerHTML = `${ic('lock', 'sm')} ${t(c.status === 'frozen' ? 'cd_unfreeze' : 'cd_freeze')}`; e.target.closest('[data-a]').classList.toggle('danger', c.status !== 'frozen'); toast(t(c.status === 'frozen' ? 'cd_frozen_t' : 'cd_unfrozen_t'), 'lock'); }
    if (a === 'msg') toast(t('cd_msg_t'), 'chat');
    if (a === 'raise') { const m = modal(`<div class="mh"><h2 class="disp">${t('cd_raise')}</h2><button class="iconbtn" data-mclose aria-label="${t('c_close')}">${ic('close')}</button></div><div class="stack"><div class="field"><label>${t('cd_reason')}</label><select class="inp" id="rs"><option>${t('cd_r1')}</option><option>${t('cd_r2')}</option><option>${t('cd_r3')}</option></select></div><div class="note2">${ic('security-shield', 'sm')}<span class="small">${t('mk_sub')}</span></div><div class="row" style="justify-content:flex-end"><button class="btn text" data-mclose>${t('c_cancel')}</button><button class="btn" id="rq">${t('c_confirm')}</button></div></div>`, { cls: 'sm' }); $('#rq', m).addEventListener('click', () => { m.close(); toast(t('cd_raise_t') + ' · ' + t('mk_pending'), 'trending-up'); }); }
  });
}
page('customers', {
  render() { return `${head(t('cu_title'), t('cu_sub'), btn(t('c_export'), { cls: 'outline', icon: 'download', act: 'exp' }) + btn(t('cu_add'), { icon: 'plus', act: 'add' }))}${card('', '<div id="tbl"></div>')}`; },
  mount(el) {
    new Table($('#tbl', el), {
      rows: CUSTOMERS, pageSize: 10, search: [c => c.en + c.ar + c.id + c.ph],
      filters: [{ key: 'tier', label: t('cu_tier'), options: [[0, t('tn0')], [1, t('tn1')], [2, t('tn2')], [3, t('tn3')]] }, { key: 'status', label: t('cu_status'), options: [['active', t('st_active')], ['frozen', t('st_frozen')], ['review', t('st_review')]] }],
      cols: [{ k: 'en', label: t('cu_cust'), sort: c => c.en, r: c => `<span class="cell">${av(L(c), +c.id.slice(-1))}<span><b>${esc(L(c))}</b><small class="mono">${c.id}</small></span></span>` }, { k: 'ph', label: t('cu_phone'), r: c => `<span class="num muted">${c.ph}</span>` }, { k: 'tier', label: t('cu_tier'), sort: c => c.tier, r: c => tierB(c.tier) }, { k: 'status', label: t('cu_status'), r: c => stBadge(c.status) }, { k: 'bal', label: t('cu_bal'), al: 'r', sort: c => c.bal, r: c => `<b>${money(c.bal, { nocur: true })}</b>` }, { k: 'risk', label: t('cu_risk'), sort: c => c.risk, r: c => riskB(c.risk) }, { k: 'city', label: t('cu_city'), r: c => esc(L(c.city)) }, { k: 'joined', label: t('cu_joined'), sort: c => +c.joined, r: c => dt(c.joined) }],
      onRow: c => openCustomer(c.id)
    });
    el.addEventListener('click', e => { const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'exp') toast(t('c_exported'), 'download'); if (a === 'add') toast(t('cd_added'), 'user'); });
  }
});

/* ======================== wallets ======================== */
const WALLETS = [
  ...CUSTOMERS.slice(0, 36).map((c, i) => ({ id: 'W-' + (50100 + i), type: 'personal', owner: c, bal: c.bal, hold: Math.round(c.bal * .02), st: c.status })),
  ...CUSTOMERS.slice(0, 10).map((c, i) => ({ id: 'W-' + (50300 + i), type: 'pocket', owner: c, bal: Math.round(c.bal * .35), hold: 0, st: 'active' })),
  ...AGENTS.slice(0, 10).map((a, i) => ({ id: 'W-' + (60100 + i), type: 'agent', owner: a, bal: a.float, hold: Math.round(a.float * .05), st: a.status })),
  ...MERCHANTS.slice(0, 10).map((m, i) => ({ id: 'W-' + (70100 + i), type: 'merchant', owner: m, bal: m.vol, hold: Math.round(m.vol * .1), st: m.status })),
  { id: 'W-90001', type: 'treasury', owner: { en: 'Tenant treasury', ar: 'خزينة المشغّل' }, bal: 482000000, hold: 0, st: 'active' }, { id: 'W-90002', type: 'fee', owner: { en: 'Fee income', ar: 'إيرادات الرسوم' }, bal: 38120000, hold: 0, st: 'active' }
].map(w => ({ ...w, cur: 'LYD' }));
export function openWallet(id) {
  const w = WALLETS.find(x => x.id === id), bal = w.bal, d = Math.round(bal * .14), n = 6;
  const rows = [['TX-7K2M41', 'Cash in at agent', d, 0], ['TX-7J9A18', 'Merchant payment', 0, Math.round(d * .4)], ['TX-7H3C02', 'Transfer received', Math.round(d * .7), 0], ['TX-7G6P77', 'Bill payment', 0, Math.round(d * .25)], ['TX-7F1D90', 'Pocket top-up', 0, Math.round(d * .2)]];
  const sd = rows.reduce((a, r) => a + r[2], 0), sc = rows.reduce((a, r) => a + r[3], 0);
  drawer(`<div class="dh"><span class="av f3">${ic('wallet')}</span><div class="sp"><h2 class="disp">${esc(L(w.owner))}</h2><div class="small muted"><span class="mono">${w.id}</span> · ${t('wt_' + w.type)}</div></div></div>
    <div class="g g3 mini"><div class="mk"><small>${t('cu_bal')}</small><b class="disp">${money(w.bal, { nocur: true })}</b></div><div class="mk"><small>${t('w_holds')}</small><b class="disp">${money(w.hold, { nocur: true })}</b></div><div class="mk"><small>${t('w_avail')}</small><b class="disp">${money(w.bal - w.hold, { nocur: true })}</b></div></div>
    <section class="stack s8"><div class="small b muted">${t('wl_title')}</div><div class="twrap"><table class="tbl compact"><thead><tr><th>${t('x_id')}</th><th class="r">${t('wl_dr')}</th><th class="r">${t('wl_cr')}</th></tr></thead><tbody>${rows.map(r => `<tr><td><span class="mono small">${r[0]}</span></td><td class="r num">${r[2] ? moneyT(r[2]) : ''}</td><td class="r num">${r[3] ? moneyT(r[3]) : ''}</td></tr>`).join('')}<tr class="tot"><td><b>${t('total')}</b></td><td class="r num"><b>${moneyT(sd)}</b></td><td class="r num"><b>${moneyT(sc)}</b></td></tr></tbody></table></div></section>
    <div class="okbar">${ic('success-check')}<div><b>${t('wl_bal')}</b><div class="small">${t('w_proof', { d: '<span class="num">' + moneyT(1862440) + '</span>', c: '<span class="num">' + moneyT(1862440) + '</span>' })}</div></div></div>`);
}
page('wallets', {
  render() {
    const sum = ty => WALLETS.filter(w => ty.includes(w.type)).reduce((a, w) => a + w.bal, 0);
    return `${head(t('w_title'), t('w_sub'))}<div class="g g4">${kpi({ label: t('w_liab'), value: sum(['personal', 'pocket']) / 100, dec: 0, suf: 'LYD', f: 1, icon: 'users' })}${kpi({ label: t('w_float'), value: sum(['agent']) / 100, dec: 0, suf: 'LYD', f: 2, icon: 'location' })}${kpi({ label: t('w_settle'), value: sum(['merchant']) / 100, dec: 0, suf: 'LYD', f: 3, icon: 'shopping-bag' })}${kpi({ label: t('w_treas'), value: sum(['treasury', 'fee']) / 100, dec: 0, suf: 'LYD', f: 4, icon: 'coins' })}</div>
    <div class="okbar">${ic('success-check')}<div><b>${t('h_ledger')}</b><div class="small">${t('w_proof', { d: '<span class="num">' + numT(WALLETS.reduce((a, w) => a + w.bal, 0) / 100, 2) + '</span>', c: '<span class="num">' + numT(WALLETS.reduce((a, w) => a + w.bal, 0) / 100, 2) + '</span>' })}</div></div></div>${card('', '<div id="tbl"></div>')}`;
  },
  mount(el) {
    new Table($('#tbl', el), {
      rows: WALLETS, pageSize: 10, search: [w => w.id + w.owner.en + w.owner.ar], onRow: w => openWallet(w.id),
      filters: [{ key: 'type', label: t('w_type'), options: ['personal', 'pocket', 'agent', 'merchant', 'treasury', 'fee'].map(k => [k, t('wt_' + k)]) }],
      cols: [{ k: 'id', label: t('x_id'), sort: w => w.id, r: w => `<span class="mono small">${w.id}</span>` }, { k: 'type', label: t('w_type'), r: w => `<span class="pill">${t('wt_' + w.type)}</span>` }, { k: 'owner', label: t('w_owner'), sort: w => w.owner.en, r: w => esc(L(w.owner)) }, { k: 'cur', label: '', r: () => '<span class="muted small">LYD</span>' }, { k: 'bal', label: t('cu_bal'), al: 'r', sort: w => w.bal, r: w => `<b>${money(w.bal, { nocur: true })}</b>` }, { k: 'hold', label: t('w_holds'), al: 'r', r: w => `<span class="num muted">${moneyT(w.hold)}</span>` }, { k: 'st', label: t('cu_status'), r: w => stBadge(w.st) }]
    });
  }
});

/* ======================== transactions ======================== */
export function openTxn(id) {
  const x = TXNS.find(y => y.id === id) || TXNS[0], R = rng(x.id), dup = Math.floor(R() * 3);
  const dr = [[`${esc(partyName(x.from))} — ${t('cd_main')}`, x.amt + x.fee, 0]], cr = [];
  const toL = `${esc(partyName(x.to))} — ${x.type === 'merchant' ? t('wt_merchant') : x.type === 'cashout' ? t('wt_agent') : t('cd_main')}`;
  const rows = [[`${esc(partyName(x.from))} — ${t('cd_main')}`, x.amt + x.fee, 0], [toL, 0, x.amt], ...(x.fee ? [[t('wt_fee'), 0, x.fee]] : [])];
  const steps = [['xd_s1', 1], ['xd_s2', 1], ['xd_s3', 1], ['xd_s4', x.status === 'done' || x.status === 'reversed' ? 1 : 0], ['xd_s5', x.status === 'done' ? 1 : 0]];
  const d = drawer(`<div class="dh"><span class="av f1">${ic({ p2p: 'send', merchant: 'shopping-bag', cashin: 'arrow-down', cashout: 'atm', bill: 'bill', airtime: 'phone', reversal: 'refund' }[x.type])}</span><div class="sp"><h2 class="disp">${money(x.amt)}</h2><div class="small muted"><span class="mono">${x.id}</span> · ${t('tt_' + x.type)}</div></div></div>
    <div class="row wrap">${stBadge(x.status)}<span class="pill">${t('ch_' + x.chan)}</span><span class="small muted">${dtt(x.t)}</span></div>
    <div class="card flat stack s8"><div class="row small"><span class="muted sp">${t('xd_intent')}</span><b class="mono">PI-${x.id.slice(3)}</b></div><div class="row small"><span class="muted sp">${t('xd_idem')}</span><b class="mono">${x.idem}</b></div><div class="note2">${ic('lock', 'sm')}<span class="small">${t('xd_win', { n: `<b class="num">${dup}</b>` })}</span></div></div>
    <section class="stack s8"><div class="small b muted">${t('xd_journal')}</div><div class="twrap"><table class="tbl compact"><thead><tr><th>${t('wl_acct')}</th><th class="r">${t('wl_dr')}</th><th class="r">${t('wl_cr')}</th></tr></thead><tbody>${rows.map(r => `<tr><td class="wrapc">${r[0]}</td><td class="r num">${r[1] ? moneyT(r[1]) : ''}</td><td class="r num">${r[2] ? moneyT(r[2]) : ''}</td></tr>`).join('')}<tr class="tot"><td><b>${t('wl_bal')} ✓</b></td><td class="r num"><b>${moneyT(x.amt + x.fee)}</b></td><td class="r num"><b>${moneyT(x.amt + x.fee)}</b></td></tr></tbody></table></div></section>
    <section class="stack s8"><div class="small b muted">${t('xd_time')}</div><div class="tl2">${steps.map(([k, on]) => `<div class="tl2s ${on ? 'on' : ''}"><i></i><span>${t(k)}</span></div>`).join('')}</div></section>
    <div class="row wrap"><button class="btn sm danger" data-a="rev" ${x.status === 'done' ? '' : 'disabled'}>${ic('refund', 'sm')} ${t('xd_rev')}</button><button class="btn sm outline" data-a="rc">${ic('receipt', 'sm')} ${t('xd_rcpt')}</button></div>`, { wide: false });
  d.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'rc') toast(t('c_exported'), 'download');
    if (a === 'rev') { const m = modal(`<div class="mh"><h2 class="disp">${t('xd_revh')}</h2><button class="iconbtn" data-mclose aria-label="${t('c_close')}">${ic('close')}</button></div><div class="stack"><p class="small muted">${t('xd_revw')}</p><div class="field"><label>${t('xd_rreason')}</label><select class="inp"><option>${t('xd_rr1')}</option><option>${t('xd_rr2')}</option><option>${t('xd_rr3')}</option></select></div><div class="row" style="justify-content:flex-end"><button class="btn text" data-mclose>${t('c_cancel')}</button><button class="btn danger" id="rv">${t('xd_rsend')}</button></div></div>`, { cls: 'sm' }); $('#rv', m).addEventListener('click', () => { m.close(); x.status = 'pending'; toast(t('xd_revd') + ' · ' + t('mk_pending'), 'refund'); }); }
  });
}
page('transactions', {
  render() { return `${head(t('x_title'), t('x_sub'), btn(t('c_export'), { cls: 'outline', icon: 'download', act: 'exp' }))}${card('', '<div id="tbl"></div>')}`; },
  mount(el) {
    new Table($('#tbl', el), {
      rows: TXNS, pageSize: 12, search: [x => x.id + x.idem + x.from.en + x.to.en + x.from.ar + x.to.ar], onRow: x => openTxn(x.id),
      filters: [{ key: 'type', label: t('x_type'), options: ['p2p', 'merchant', 'cashin', 'cashout', 'bill', 'airtime', 'reversal'].map(k => [k, t('tt_' + k)]) }, { key: 'status', label: t('cu_status'), options: ['done', 'pending', 'failed', 'reversed'].map(k => [k, t('st_' + k)]) }, { key: 'chan', label: t('x_chan'), options: ['app', 'agent', 'ussd', 'api'].map(k => [k, t('ch_' + k)]) }],
      cols: [{ k: 'id', label: t('x_id'), sort: x => x.id, r: x => `<span class="mono small">${x.id}</span>` }, { k: 'type', label: t('x_type'), r: x => `<span class="pill">${t('tt_' + x.type)}</span>` }, { k: 'from', label: t('x_parties'), r: x => `<span class="trunc2">${esc(partyName(x.from))} <span class="muted">→</span> ${esc(partyName(x.to))}</span>` }, { k: 'amt', label: t('x_amt'), al: 'r', sort: x => x.amt, r: x => `<b>${money(x.amt, { nocur: true })}</b>` }, { k: 'fee', label: t('x_fee'), al: 'r', r: x => `<span class="num muted">${x.fee ? moneyT(x.fee) : '—'}</span>` }, { k: 'status', label: t('cu_status'), r: x => stBadge(x.status) }, { k: 'chan', label: t('x_chan'), r: x => `<span class="muted small">${t('ch_' + x.chan)}</span>` }, { k: 't', label: t('x_time'), sort: x => +x.t, r: x => dtt(x.t) }]
    });
    el.addEventListener('click', e => { if (e.target.closest('[data-act=exp]')) toast(t('c_exported'), 'download'); });
  }
});
