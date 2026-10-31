// Pockets, insights, statements, limits, rewards, referrals.
import { tenantName, st, t, add, ic, esc, money, moneyT, numT, num, countUp, ring, donut, bars, spark, fmtDate, confetti, short } from '../assets/core.js';
import { qrV as qrSvg } from './brand.js';

import { reg, hdr, scr, row, sectionHead, avatar, nm, go, tab, sheet, closeSheet, toast, pin, processing, showSuccess, refNo, switchEl, wait, $, $$, rerender, refresh, back } from './kit.js';
import { S, POCKETS, CONTACTS, MERCH, merchant, person, addTxn } from './data.js';

add({
  pk_title: 'Pockets§Poches§الجيوب', pk_saved: 'Total saved§Total épargné§إجمالي المدّخر', pk_apy: 'Earning {r}% a year§Rémunéré {r} % par an§بعائد {r}٪ سنوياً', pk_new: 'New pocket§Nouvelle poche§جيب جديد', pk_goal: 'Goal {g}§Objectif {g}§الهدف {g}', pk_rule_weekly: 'Saves {a} every week§Épargne {a} chaque semaine§يدّخر {a} كل أسبوع', pk_rule_roundup: 'Rounds up every payment§Arrondit chaque paiement§يقرّب كل عملية دفع', pk_rule_none: 'Manual only§Manuel uniquement§يدوي فقط', pk_locked: 'Locked§Verrouillée§مقفلة',
  pk_add: 'Add money§Ajouter§إضافة أموال', pk_take: 'Withdraw§Retirer§سحب', pk_eta: 'On track — goal by {d}§Dans les temps — objectif en {d}§في المسار — الهدف في {d}', pk_eta_v: 'Dec 2026§déc. 2026§ديسمبر 2026', pk_lock: 'Lock until goal is reached§Verrouiller jusqu’à l’objectif§قفل حتى بلوغ الهدف', pk_rules: 'Auto-save rule§Règle d’épargne§قاعدة الادخار التلقائي', pk_roundup: 'Round up payments§Arrondir les paiements§تقريب المدفوعات', pk_roundup_s: 'Spare change goes to your pockets§La monnaie va dans vos poches§الفكّة تذهب إلى جيوبك', pk_added: 'Added to {n}§Ajouté à {n}§تمت الإضافة إلى {n}', pk_name: 'Pocket name§Nom de la poche§اسم الجيب', pk_goalamt: 'Goal amount§Montant objectif§مبلغ الهدف', pk_icon: 'Icon§Icône§الأيقونة', pk_create: 'Create pocket§Créer§إنشاء الجيب', pk_ph: 'e.g. Wedding fund§ex. Mariage§مثال: صندوق الزواج', pk_hist: 'Activity§Activité§النشاط',
  in_title: 'Spending insights§Analyse des dépenses§تحليل الإنفاق', in_spent: 'Spent in {m}§Dépensé en {m}§المصروف في {m}', in_vs: '{p}% less than last month§{p} % de moins que le mois dernier§أقل بـ {p}٪ من الشهر الماضي', in_cats: 'By category§Par catégorie§حسب الفئة', in_weeks: 'Week by week§Semaine par semaine§أسبوعاً بأسبوع', in_top: 'Top merchants§Principaux marchands§أبرز التجار', in_budget: 'Monthly budgets§Budgets mensuels§الميزانيات الشهرية', in_left: '{a} left§{a} restant§متبقٍ {a}', in_over: 'Almost there§Presque atteint§قارب على الانتهاء', in_tip: 'You could save 120.00 a month by moving groceries to weekly bulk shopping.§Vous pourriez économiser 120,00 par mois en groupant vos courses.§يمكنك توفير 120.00 شهرياً بتجميع مشتريات البقالة أسبوعياً.', m_sep: 'September§Septembre§سبتمبر', m_aug: 'August§Août§أغسطس', m_jul: 'July§Juillet§يوليو', w1: 'W1§S1§1', w2: 'W2§S2§2', w3: 'W3§S3§3', w4: 'W4§S4§4',
  stm_title: 'Statements§Relevés§كشوف الحساب', stm_sub: 'Official PDF statements for any month§Relevés PDF officiels§كشوف PDF رسمية لأي شهر', stm_custom: 'Custom range§Période libre§فترة مخصصة', stm_email: 'Email me monthly§Recevoir chaque mois par e-mail§أرسلها إلى بريدي شهرياً', stm_gen: 'Preparing PDF…§Préparation du PDF…§جارٍ تجهيز ملف PDF…', stm_saved: 'Saved to Files§Enregistré dans Fichiers§تم الحفظ في الملفات', stm_dl: 'Download PDF§Télécharger le PDF§تنزيل PDF', stm_open: 'Opening balance§Solde d’ouverture§الرصيد الافتتاحي', stm_close: 'Closing balance§Solde de clôture§الرصيد الختامي', stm_sig: 'Digitally signed§Signé numériquement§موقّع رقمياً', stm_tx: '{n} transactions§{n} opérations§{n} عملية',
  l_title: 'Limits & tier§Plafonds et niveau§الحدود والمستوى', l_tier: 'Your tier§Votre niveau§مستواك', l_tiers: 'Tiers§Niveaux§المستويات', l_t0: 'Basic§Basique§أساسي', l_t1: 'Standard§Standard§قياسي', l_t2: 'Verified§Vérifié§موثّق', l_t3: 'Premium§Premium§مميّز', l_t0s: 'Phone number only§Numéro de téléphone seul§رقم الهاتف فقط', l_t1s: 'ID photo§Photo de pièce d’identité§صورة الهوية', l_t2s: 'ID + selfie + address§ID + selfie + adresse§الهوية + صورة شخصية + العنوان', l_t3s: 'Income proof§Justificatif de revenus§إثبات الدخل',
  l_use: 'Your usage§Votre utilisation§استخدامك', l_day: 'Sending today§Envois du jour§إرسال اليوم', l_mon: 'Sending this month§Envois du mois§إرسال هذا الشهر', l_max: 'Wallet balance cap§Plafond du portefeuille§سقف رصيد المحفظة', l_cash: 'Cash in today§Dépôts du jour§إيداع اليوم', l_own: 'My own daily cap§Mon plafond perso§سقفي اليومي الخاص', l_own_s: 'Set a lower limit for extra safety§Fixez un plafond plus bas pour plus de sécurité§حدد سقفاً أقل لمزيد من الأمان', l_raise: 'Raise my limits§Augmenter mes plafonds§رفع حدودي', l_cur: 'Current§Actuel§الحالي', l_of: 'of {x}§sur {x}§من {x}',
  rw_title: 'Rewards§Récompenses§المكافآت', rw_cb: 'Cashback earned§Remises gagnées§الاسترداد المكتسب', rw_redeem: 'Add to wallet§Ajouter au portefeuille§أضف إلى المحفظة', rw_tier: 'Silver · {p} points to Gold§Argent · {p} points avant Or§فضي · {p} نقطة للذهبي', rw_streak: 'Weekly streak§Série hebdomadaire§سلسلة أسبوعية', rw_missions: 'Missions§Missions§المهام', rw_m1: 'Pay 3 merchants§Payer 3 marchands§ادفع لـ 3 تجار', rw_m2: 'Send money to a friend§Envoyer à un ami§أرسل لصديق', rw_m3: 'Pay a bill in the app§Payer une facture§ادفع فاتورة', rw_reveal: 'Tap to reveal today’s reward§Touchez pour révéler la récompense§المس لكشف مكافأة اليوم', rw_won: 'You won {a} cashback!§Vous gagnez {a} de remise !§ربحت {a} استرداداً!', rw_daily: 'Daily reward§Récompense du jour§مكافأة اليوم', rw_red_ok: 'Added to your wallet§Ajouté à votre portefeuille§أُضيف إلى محفظتك',
  rf_title: 'Invite friends§Inviter des amis§ادعُ أصدقاءك', rf_hero: 'Give 20.00, get 20.00§Donnez 20,00, recevez 20,00§امنح 20.00 واحصل على 20.00', rf_sub: 'When a friend verifies and makes a first payment§Dès qu’un ami vérifie son compte et paie§عندما يوثّق صديقك حسابه ويدفع أول مرة', rf_code: 'Your code§Votre code§رمزك', rf_share: 'Share invite§Partager l’invitation§شارك الدعوة', rf_ladder: 'Milestone bonuses§Bonus par palier§مكافآت المراحل', rf_friends: 'Your friends§Vos amis§أصدقاؤك', rf_joined: 'Joined§Inscrit§انضم', rf_inv: 'Invited§Invité§مدعو', rf_earned: 'Earned {a}§Gagné {a}§ربحت {a}', rf_m: '{n} friends§{n} amis§{n} أصدقاء'
});

/* ---------- pockets ---------- */
const ruleText = p => p.rule === 'weekly' ? t('pk_rule_weekly', { a: money(p.amt, { dec: 0 }) }) : p.rule === 'roundup' ? t('pk_rule_roundup') : t('pk_rule_none');
reg('pockets', {
  tab: true,
  render() {
    const tot = S.pockets.reduce((a, p) => a + p.saved, 0);
    return `${hdr(t('pk_title'), { back: false, right: `<button class="iconbtn" data-go="pocketnew" aria-label="${t('pk_new')}">${ic('plus')}</button>` })}<div class="body">
      <section class="pkhero rise" data-sk><div class="small" style="opacity:.8">${t('pk_saved')}</div><div class="disp" style="font-size:42px;line-height:1.1"><span class="num" data-count="${tot / 100}" data-dec="2">0.00</span><span class="cur">${st.cur}</span></div><span class="badge accent">${ic('trending-up', 'sm')} ${t('pk_apy', { r: '<span class="num">4.2</span>' })}</span><div class="spk2">${spark([20, 24, 23, 29, 33, 31, 38, 44, 47, 52, 58, 66], { w: 300, h: 44, color: 'currentColor' })}</div></section>
      <div class="pgrid rise">${S.pockets.map(p => `<button class="pcard f${p.f}" data-go="pocket" data-p='{"id":"${p.id}"}' data-sk>${ring(p.saved / p.goal * 100, { size: 64, thick: 8, color: 'var(--look-brand)', inner: ic(p.icon, 'sm') })}<b class="pn">${esc(nm(p.name))}</b><span class="disp pa">${money(p.saved, { dec: 0 })}</span><span class="tiny">${t('pk_goal', { g: money(p.goal, { dec: 0, nocur: true }) })}</span>${p.locked ? `<span class="lk">${ic('lock', 'sm')}</span>` : ''}</button>`).join('')}
        <button class="pcard add" data-go="pocketnew"><span class="plus">${ic('plus', 'lg')}</span><b>${t('pk_new')}</b></button></div>
      <div class="card row rise"><span class="lead f2">${ic('coins')}</span><div class="sp"><div class="b">${t('pk_roundup')}</div><div class="small muted">${t('pk_roundup_s')}</div></div>${switchEl('ru', true)}</div></div>`;
  }
});
reg('pocket', {
  render({ id }) {
    const p = S.pockets.find(x => x.id === id) || S.pockets[0], pct = p.saved / p.goal * 100;
    return scr(`<div class="pdet rise"><div class="pdring">${ring(pct, { size: 190, thick: 16, color: 'var(--look-brand)', inner: `<div class="center"><div class="small muted">${esc(nm(p.name))}</div><div class="disp" style="font-size:30px"><span class="num" data-count="${p.saved / 100}" data-dec="0">0</span></div><div class="tiny muted">${t('pk_goal', { g: money(p.goal, { dec: 0 }) })}</div></div>`})}</div><span class="badge ok">${ic('success-check', 'sm')} ${t('pk_eta', { d: t('pk_eta_v') })}</span></div>
      <div class="grid2 rise"><button class="btn" data-act="add">${ic('plus', 'sm')} ${t('pk_add')}</button><button class="btn tonal" data-act="take" ${p.locked ? 'disabled' : ''}>${ic('arrow-up', 'sm')} ${t('pk_take')}</button></div>
      <div class="list rise"><div class="item"><span class="lead f1">${ic('refresh')}</span><span class="sp"><span class="t">${t('pk_rules')}</span><span class="s" style="display:block">${ruleText(p)}</span></span></div><div class="item"><span class="lead f3">${ic('lock')}</span><span class="sp"><span class="t">${t('pk_lock')}</span></span>${switchEl('lk', !!p.locked)}</div></div>
      <section class="stack s8 rise"><div class="muted small b grp">${t('pk_hist')}</div><div class="list">${[[5000, 2], [5000, 9], [15000, 16], [5000, 23]].map(([a, d], i) => `<div class="item kv"><span class="lead f${(i % 3) + 1}">${ic('arrow-down')}</span><span class="sp"><span class="t">${t('pk_add')}</span><span class="s" style="display:block"><span class="num">${fmtDate(new Date(Date.now() - d * 864e5))}</span></span></span><span class="b pos">${money(a, { sign: true, nocur: true })}</span></div>`).join('')}</div></section>`, { head: hdr(esc(nm(p.name))) });
  },
  mount(el, { id }) {
    const p = S.pockets.find(x => x.id === id) || S.pockets[0];
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
      let v = 5000; const sh = sheet(`<h3 class="disp">${t(a === 'add' ? 'pk_add' : 'pk_take')}</h3><div class="amgrid air">${[2000, 5000, 10000, 20000].map((x, i) => `<button class="amtile ${i === 1 ? 'on' : ''}" data-v="${x}"><b class="disp">${numT(x / 100)}</b><span class="tiny">${st.cur}</span></button>`).join('')}</div><button class="btn block lg" id="go">${t('confirm')}</button>`);
      sh.addEventListener('click', ev => { const b = ev.target.closest('[data-v]'); if (b) { v = +b.dataset.v; $$('[data-v]', sh).forEach(x => x.classList.toggle('on', x === b)); } });
      $('#go', sh).addEventListener('click', async () => { closeSheet(); await wait(350); await processing(t('proc'), 700); if (a === 'add') { p.saved += v; S.balance -= v; } else { p.saved -= v; S.balance += v; } rerender(el); toast(t('pk_added', { n: nm(p.name) })); confetti(el, { n: 50 }); });
    });
  }
});
const PI = ['location', 'security-shield', 'phone', 'goal', 'shopping-bag', 'savings'];
reg('pocketnew', {
  skel: false,
  render(p, el) {
    const ic0 = el._ic ?? 0, nmv = el._n || '';
    return scr(`<div class="field rise"><label for="pn">${t('pk_name')}</label><input id="pn" class="inp" placeholder="${t('pk_ph')}" value="${esc(nmv)}"></div>
      <div class="muted small b grp">${t('pk_icon')}</div><div class="icgrid rise">${PI.map((i, k) => `<button class="icb ${k === ic0 ? 'on' : ''}" data-ic="${k}" aria-label="${i}">${ic(i)}</button>`).join('')}</div>
      <div class="muted small b grp">${t('pk_goalamt')}</div><div class="amgrid air rise">${[50000, 100000, 300000, 500000].map((x, i) => `<button class="amtile ${(el._g ?? 2) === i ? 'on' : ''}" data-g="${i}"><b class="disp">${numT(x / 100, 0)}</b><span class="tiny">${st.cur}</span></button>`).join('')}</div>
      <div class="muted small b grp">${t('pk_rules')}</div><div class="stack s8 rise">${[['weekly', 'pk_rule_weekly'], ['roundup', 'pk_rule_roundup'], ['none', 'pk_rule_none']].map(([k, l]) => `<button class="opt" role="radio" aria-checked="${(el._r || 'weekly') === k}" data-r="${k}"><span>${t(l, { a: money(2500, { dec: 0 }) })}</span>${ic('success-check', 'sm')}</button>`).join('')}</div>`, { head: hdr(t('pk_new')), foot: `<button class="btn block lg" id="mk">${t('pk_create')}</button>` });
  },
  mount(el) {
    el.addEventListener('click', e => { const i = e.target.closest('[data-ic]'), g = e.target.closest('[data-g]'), r = e.target.closest('[data-r]'); if (i) el._ic = +i.dataset.ic; if (g) el._g = +g.dataset.g; if (r) el._r = r.dataset.r; if (i || g || r) { el._n = $('#pn', el).value; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); } });
    $('#mk', el).addEventListener('click', async () => {
      const name = $('#pn', el).value.trim() || (st.lang === 'ar' ? 'جيب جديد' : 'New pocket');
      S.pockets.push({ id: 'p' + (S.pockets.length + 1), name: { en: name, fr: name, ar: name }, icon: PI[el._ic ?? 0], saved: 0, goal: [50000, 100000, 300000, 500000][el._g ?? 2], rule: el._r || 'weekly', amt: 2500, f: (S.pockets.length % 3) + 1 });
      await processing(t('proc'), 700); back(); toast(t('saved_toast')); setTimeout(() => refresh(), 50);
    });
  }
});

/* ---------- insights ---------- */
const CAT_COL = ['var(--look-brand)', 'var(--look-accent)', '#3BC1EE', '#2FB59A', '#E0B72E', '#8E7CE0'];
const MONTHS = { sep: { v: [61860, 38200, 38400, 24000, 23100, 9200], tot: 194760, pc: 12 }, aug: { v: [58000, 41000, 39000, 28000, 31000, 7000], tot: 204000, pc: 0 }, jul: { v: [52000, 36000, 38000, 21000, 18000, 11000], tot: 176000, pc: 0 } };
const ICAT = ['groceries', 'food', 'bills', 'transport', 'shopping', 'health'];
reg('insights', {
  render(p, el) {
    const mk = el._m || 'sep', M = MONTHS[mk], tot = M.v.reduce((a, b) => a + b, 0);
    return scr(`<div class="seg rise">${['sep', 'aug', 'jul'].map(k => `<button aria-selected="${mk === k}" data-m="${k}">${t('m_' + k)}</button>`).join('')}</div>
      <div class="card rise" data-sk><div class="row" style="align-items:flex-start"><div class="sp"><div class="small muted">${t('in_spent', { m: t('m_' + mk) })}</div><div class="disp" style="font-size:38px;line-height:1.15"><span class="num" data-count="${tot / 100}" data-dec="2">0.00</span><span class="cur">${st.cur}</span></div>${mk === 'sep' ? `<span class="badge ok">${ic('trending-down', 'sm')} ${t('in_vs', { p: '<span class="num">4.5</span>' })}</span>` : ''}</div></div>
      <div class="donutrow">${donut(ICAT.map((c, i) => ({ v: M.v[i], c: CAT_COL[i] })), { size: 168, thick: 22, center: `<div><div class="tiny muted">${t('in_cats')}</div><div class="disp" style="font-size:20px">${ICAT.length}</div></div>` })}<div class="legend">${ICAT.map((c, i) => `<div class="lg"><i style="background:${CAT_COL[i]}"></i><span class="sp">${t('cat_' + c)}</span><b class="num">${Math.round(M.v[i] / tot * 100)}%</b></div>`).join('')}</div></div></div>
      <section class="card rise" data-sk><div class="small b muted" style="margin-bottom:6px">${t('in_weeks')}</div>${bars(mk === 'sep' ? [41000, 58000, 47000, 48760] : mk === 'aug' ? [52000, 49000, 55000, 48000] : [40000, 46000, 44000, 46000], [t('w1'), t('w2'), t('w3'), t('w4')], { h: 120, hi: mk === 'sep' ? 1 : 2 })}</section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('in_budget')}</div><div class="list" data-sk>${[['food', 38200, 40000], ['groceries', 61860, 80000], ['shopping', 23100, 20000]].map(([c, u, b]) => `<div class="item" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="sp b">${t('cat_' + c)}</span><span class="small">${money(u, { dec: 0, nocur: true })} <span class="muted">${t('l_of', { x: money(b, { dec: 0, nocur: true }) })}</span></span></div><div class="progress ${u > b ? 'warnb' : ''}"><i style="--v:${Math.min(100, u / b * 100)}%"></i></div></div>`).join('')}</div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('in_top')}</div><div class="list" data-sk>${[['m2', 22000], ['m1', 18500], ['m4', 14000]].map(([m, a], i) => row({ lead: `<span class="lead f${i + 1}">${esc(nm(merchant(m)).split(' ').map(w => w[0]).join('').slice(0, 2))}</span>`, title: esc(nm(merchant(m))), sub: t('cat_' + merchant(m).cat), end: `<b>${money(-a, { nocur: true })}</b>` })).join('')}</div></section>
      <div class="note rise">${ic('info', 'sm')}<span class="small">${t('in_tip')}</span></div>`, { head: hdr(t('in_title')) });
  },
  mount(el) { el.addEventListener('click', e => { const m = e.target.closest('[data-m]'); if (m) { el._m = m.dataset.m; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); } }); }
});

/* ---------- statements ---------- */
const STM = [['sep', 86, 234500, 194760], ['aug', 74, 198000, 204000], ['jul', 69, 176000, 181500], ['jun', 71, 190000, 172000], ['may', 58, 165000, 158000]];
add({ m_jun: 'June§Juin§يونيو', m_may: 'May§Mai§مايو' });
reg('statements', {
  render() {
    return scr(`<p class="muted small rise">${t('stm_sub')}</p><div class="list rise" data-sk>${STM.map(([m, n, i, o]) => `<div class="item stm" data-m="${m}"><span class="lead f1">${ic('pdf')}</span><span class="sp"><span class="t">${t('m_' + m)} 2026</span><span class="s" style="display:block">${t('stm_tx', { n: `<span class="num">${n}</span>` })}</span><span class="dlbar"><i></i></span></span><button class="iconbtn fill" data-dl="${m}" aria-label="${t('stm_dl')}">${ic('download')}</button></div>`).join('')}</div>
      <button class="btn outline block rise" data-act="rng">${ic('calendar', 'sm')} ${t('stm_custom')}</button><div class="card row rise"><span class="sp b">${t('stm_email')}</span>${switchEl('em', true)}</div>`, { head: hdr(t('stm_title')) });
  },
  mount(el) {
    el.addEventListener('click', async e => {
      const d = e.target.closest('[data-dl]'), row0 = e.target.closest('.stm');
      if (d) { const r = d.closest('.stm'); r.classList.add('dling'); await wait(1400); r.classList.remove('dling'); toast(t('stm_saved'), 'download'); return; }
      if (row0) paper(row0.dataset.m);
      if (e.target.closest('[data-act=rng]')) toast(t('stm_custom'), 'calendar');
    });
  }
});
function paper(m) {
  const d = STM.find(x => x[0] === m), tl = tenantName();
  sheet(`<div class="paper"><div class="row" style="justify-content:space-between"><b class="disp" style="font-size:18px">${esc(tl)}</b><span class="tiny muted">Vega by Neptune</span></div><div class="small muted" style="margin:2px 0 10px">${t('stm_title')} · ${t('m_' + m)} 2026</div>
    ${[[t('stm_open'), money(d[2] * .6)], [t('in_m'), money(d[2], { sign: true })], [t('out_m'), money(-d[3])], [t('stm_close'), money(S.balance)]].map(([k, v]) => `<div class="kvr"><span class="muted">${k}</span><b>${v}</b></div>`).join('')}
    <div class="pp-lines">${[90, 75, 82, 60, 88, 70].map(w => `<i style="width:${w}%"></i>`).join('')}</div><div class="tiny muted center">${t('stm_sig')}</div></div><button class="btn block" id="dl">${ic('download', 'sm')} ${t('stm_dl')}</button>`);
  $('#dl').addEventListener('click', () => { closeSheet(); setTimeout(() => toast(t('stm_saved'), 'download'), 350); });
}

/* ---------- limits ---------- */
reg('limits', {
  render(p, el) {
    const T = [['l_t0', 'l_t0s', 50000, 100000], ['l_t1', 'l_t1s', 500000, 1000000], ['l_t2', 'l_t2s', 2500000, 5000000], ['l_t3', 'l_t3s', 10000000, 25000000]], cur = S.kyc.tier;
    const U = [['l_day', 145000, 500000], ['l_mon', 720000, 2000000], ['l_max', S.balance, 1000000], ['l_cash', 50000, 200000]];
    return scr(`<div class="tiers rise">${T.map((x, i) => `<div class="tr ${i === cur ? 'on' : ''} ${i < cur ? 'past' : ''}"><i>${i < cur ? ic('success-check', 'sm') : i}</i><b>${t(x[0])}</b><span class="tiny">${t(x[1])}</span></div>`).join('')}</div>
      <section class="stack s8 rise"><div class="muted small b grp">${t('l_use')}</div><div class="list" data-sk>${U.map(([k, u, m]) => `<div class="item" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="sp b">${t(k)}</span><span class="small">${money(u, { dec: 0, nocur: true })} <span class="muted">${t('l_of', { x: money(m, { dec: 0 }) })}</span></span></div><div class="progress ${u / m > .8 ? 'warnb' : ''}"><i style="--v:${u / m * 100}%"></i></div></div>`).join('')}</div></section>
      <div class="card rise"><div class="row"><div class="sp"><div class="b">${t('l_own')}</div><div class="small muted">${t('l_own_s')}</div></div><b class="disp" data-capv style="font-size:20px">${money(300000, { dec: 0 })}</b></div><input type="range" class="rng" min="50000" max="500000" step="10000" value="300000" aria-label="${t('l_own')}"></div>`,
      { head: hdr(t('l_title')), foot: `<button class="btn block lg" data-go="kyc">${ic('id-card', 'sm')} ${t('l_raise')}</button>` });
  },
  mount(el) { const r = $('.rng', el); const upd = () => { $('[data-capv]', el).innerHTML = money(+r.value, { dec: 0 }); r.style.setProperty('--v', ((r.value - 50000) / 450000 * 100) + '%'); }; r.addEventListener('input', upd); upd(); }
});

/* ---------- rewards ---------- */
const DAYS = { en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], fr: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'], ar: ['اث', 'ثل', 'أر', 'خم', 'جم', 'سب', 'أح'] };
reg('rewards', {
  render(p, el) {
    const R = S.rewards, rev = el._rev;
    return scr(`<section class="rwhero rise" data-sk><div class="small" style="opacity:.8">${t('rw_cb')}</div><div class="disp" style="font-size:44px;line-height:1.1"><span class="num" data-count="${R.cashback / 100}" data-dec="2">0.00</span><span class="cur">${st.cur}</span></div><div class="row" style="gap:12px;margin-top:10px">${ring(72, { size: 54, thick: 6, color: 'currentColor', inner: ic('star', 'sm') })}<span class="small b">${t('rw_tier', { p: '<span class="num">740</span>' })}</span></div><button class="btn accent sm" data-act="redeem" style="margin-top:12px">${ic('wallet', 'sm')} ${t('rw_redeem')}</button></section>
      <button class="scratch ${rev ? 'open' : ''} rise" data-act="rev" aria-label="${t('rw_reveal')}"><span class="sc-f"><b class="disp">${t('rw_daily')}</b><span class="small">${t('rw_reveal')}</span>${ic('star', 'xl')}</span><span class="sc-b"><b class="disp">${money(50, { sign: true })}</b><span class="small">${t('rw_won', { a: '0.50' })}</span></span></button>
      <section class="card rise"><div class="row"><b class="sp">${t('rw_streak')}</b><span class="badge accent">${ic('trending-up', 'sm')} <span class="num">${R.streak}</span></span></div><div class="week">${DAYS[st.lang].map((d, i) => `<div class="wd ${i < R.streak ? 'on' : ''}"><i>${i < R.streak ? ic('success-check', 'sm') : ''}</i><span class="tiny">${d}</span></div>`).join('')}</div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('rw_missions')}</div><div class="list" data-sk>${[['rw_m1', 2, 3, 'shopping-bag', '2.00'], ['rw_m2', 1, 1, 'send', '1.00'], ['rw_m3', 0, 1, 'bill', '1.50']].map(([k, a, b, i, r]) => `<div class="item" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="lead f${a === b ? 2 : 1}">${a === b ? ic('success-check') : ic(i)}</span><span class="sp b">${t(k)}</span><span class="badge ${a === b ? 'ok' : 'accent'}"><span class="num">+${r}</span></span></div><div class="progress acc"><i style="--v:${a / b * 100}%"></i></div></div>`).join('')}</div></section>`, { head: hdr(t('rw_title')) });
  },
  mount(el) {
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'rev' && !el._rev) { el._rev = 1; $('.scratch', el).classList.add('open'); confetti(el, { n: 70 }); S.rewards.cashback += 50; S.balance += 50; }
      if (a === 'redeem') { toast(t('rw_red_ok'), 'wallet'); confetti(el, { n: 60 }); }
    });
  }
});

/* ---------- referrals ---------- */
reg('referrals', {
  render() {
    const F = [['c6', 'rf_joined', 2000], ['c7', 'rf_joined', 2000], ['c8', 'rf_inv', 0]], joined = 2;
    return scr(`<section class="rfhero rise"><svg class="rf-art" viewBox="0 0 200 120" aria-hidden="true"><circle cx="60" cy="60" r="38" fill="var(--look-accent)"/><circle cx="116" cy="62" r="30" fill="var(--look-field-2)"/><circle cx="160" cy="52" r="22" fill="var(--look-field-3)"/><path d="M40 60h18l8-14 10 28 8-14h20" fill="none" stroke="var(--look-brand)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><h2 class="disp" style="font-size:25px;line-height:1.15">${t('rf_hero')}</h2><p class="small" style="opacity:.82">${t('rf_sub')}</p></section>
      <div class="card row rise"><div class="sp"><div class="small muted">${t('rf_code')}</div><div class="disp mono-d" style="font-size:26px"><span class="ltr">AMIRA-24</span></div></div><button class="iconbtn fill" data-copy="AMIRA-24" aria-label="${t('copied')}">${ic('copy')}</button><div class="qrmini">${qrSvg('invite', { size: 64, n: 21, logo: false })}</div></div>
      <button class="btn block lg rise" data-act="shr">${ic('share', 'sm')} ${t('rf_share')}</button>
      <section class="card rise"><div class="b" style="margin-bottom:12px">${t('rf_ladder')}</div><div class="ladder">${[[3, 1000, 1], [5, 2500, 0], [10, 6000, 0]].map(([n, a, d], i) => `<div class="rg ${joined >= n ? 'on' : ''}"><i>${joined >= n ? ic('success-check', 'sm') : n}</i><b>${t('rf_m', { n: `<span class="num">${n}</span>` })}</b><span class="badge ${joined >= n ? 'ok' : 'accent'}">${money(a * 2, { dec: 0, sign: true, nocur: true })}</span></div>`).join('')}</div><div class="progress acc" style="margin-top:14px"><i style="--v:${joined / 3 * 100}%"></i></div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('rf_friends')}</div><div class="list" data-sk>${F.map(([c, k, a], i) => row({ lead: avatar(nm(person(c)), i), title: esc(nm(person(c))), sub: t(k), end: a ? `<span class="badge ok">${t('rf_earned', { a: money(a, { nocur: true, dec: 0 }) })}</span>` : `<span class="badge">${t('rf_inv')}</span>` })).join('')}</div></section>`, { head: hdr(t('rf_title')) });
  },
  mount(el) { el.addEventListener('click', e => { if (e.target.closest('[data-act=shr]')) toast(t('share'), 'share'); }); }
});
