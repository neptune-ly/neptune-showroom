// Vega wallet screens: Home (swipeable wallet stack), Wallets, Cards, Top up, Vouchers, Profile, Welcome.
import { st, t, add, ic, esc, money, moneyT, numT, RM, ring, fmtDate, setLang, setTheme, LS } from '../assets/core.js';
import { vegaStar, vegaLogo } from './brand.js';
import { catGlyph, VOUCHERS, VCATS, voucher } from './glyphs.js';
import { SCR, reg, hdr, scr, row, avatar, nm, store, setHide, go, tab, sheet, closeSheet, toast, pin, processing, switchEl, wait, refNo, bindKeypad, keypadHtml, toMinor, amtDisplay, slideHtml, bindSlide, showSuccess, refresh, rerender, rebuildTabbar, $, $$ } from './kit.js';
import { S, ME, CONTACTS, WALLETS, walBal, RATE_USD, NOTIFS, addTxn, person } from './data.js';
import { grouped } from './s-home.js';

add({
  spl_tag: 'Money in motion§L’argent en mouvement§مالك في حركة',
  g_am: 'Good morning§Bonjour§صباح الخير', g_pm: 'Good afternoon§Bon après-midi§مساء الخير', g_ev: 'Good evening§Bonsoir§مساء النور',
  w_avail: 'Available balance§Solde disponible§الرصيد المتاح', w_add: 'Add money§Ajouter§إضافة أموال', w_card: 'Card§Carte§البطاقة', w_pot: 'Add to pot§Alimenter§أضف للحصّالة', w_goals: 'Goals§Objectifs§الأهداف', w_manage: 'Manage§Gérer§إدارة',
  w_spent: 'Spent this month§Dépensé ce mois§المصروف هذا الشهر', w_cb: 'Cashback§Remise§الاسترداد', w_trend: 'this month§ce mois§هذا الشهر', w_goal_p: '{p}% of goal§{p} % de l’objectif§{p}٪ من الهدف', w_roundup: 'Round-ups on§Arrondis actifs§التقريب مفعّل', w_rate: '1 USD = {r} LYD§1 USD = {r} LYD§1 دولار = {r} د.ل', w_from: 'Spends from Main wallet§Dépense depuis le principal§يخصم من المحفظة الرئيسية',
  a_cashio: 'Top up§Recharger§إيداع', a_scanpay: 'Scan & pay§Scanner§امسح وادفع',
  q_again: 'Send again§Renvoyer§أرسل مجدداً', q_new: 'New§Nouveau§جديد',
  rg_cb: 'Cashback this month§Remise du mois§استرداد هذا الشهر', rg_goal: 'of {g} goal§sur {g}§من {g}', in_t: 'Spending§Dépenses§الإنفاق', hv_t: 'Vouchers§Bons cadeaux§القسائم', from_v: 'From {a}§Dès {a}§من {a}',
  wl_title: 'Wallets§Portefeuilles§المحافظ', wl_total: 'Total across wallets§Total des portefeuilles§الإجمالي في كل المحافظ', wl_cards: 'Cards§Cartes§البطاقات', wl_pockets: 'Savings goals§Objectifs d’épargne§أهداف الادخار', wl_more: 'Manage money§Gérer l’argent§إدارة الأموال', wl_approx: '≈ {a} LYD§≈ {a} LYD§≈ {a} د.ل',
  c_net: 'Contactless§Sans contact§لاسلكية', c_unfreeze: 'Unfreeze card§Débloquer la carte§إلغاء تجميد البطاقة', c_sheet_t: 'Card details§Détails de la carte§تفاصيل البطاقة',
  ci_pick: 'How would you like to add money?§Comment souhaitez-vous ajouter de l’argent ?§كيف تريد إضافة الأموال؟',
  cm_agent: 'At a Vega agent§Chez un agent Vega§لدى وكيل فيغا', cm_agent_s: 'Hand over cash, credited instantly§Remettez des espèces, crédité aussitôt§سلّم النقد ويُضاف فوراً', cm_free: 'Free§Gratuit§مجاني',
  cm_card: 'Debit or credit card§Carte bancaire§بطاقة مصرفية', cm_card_s: 'Instant · 1.2% fee§Instantané · 1,2 % de frais§فوري · رسوم 1.2٪',
  cm_bank: 'Bank transfer§Virement bancaire§تحويل مصرفي', cm_bank_s: 'Arrives in minutes§Quelques minutes§يصل خلال دقائق',
  tc_title: 'Add from card§Ajouter par carte§إضافة من بطاقة', tc_with: 'Pay with§Payer avec§الدفع بواسطة', tc_card: 'Debit •••• 7730§Débit •••• 7730§خصم •••• 7730', tc_fee: 'Fee 1.2% · {f}§Frais 1,2 % · {f}§رسوم 1.2٪ · {f}', tc_btn: 'Add money§Ajouter§أضف الأموال', tc_done: 'Money added§Argent ajouté§تمت الإضافة',
  tb_title: 'Bank transfer§Virement bancaire§تحويل مصرفي', tb_s: 'Send from your bank app to the details below. Your wallet is credited as soon as it arrives.§Envoyez depuis votre appli bancaire vers les coordonnées ci-dessous. Votre portefeuille est crédité dès réception.§حوّل من تطبيق مصرفك إلى البيانات أدناه. يُضاف الرصيد فور وصول التحويل.',
  tb_name: 'Account name§Nom du compte§اسم الحساب', tb_iban: 'IBAN§IBAN§رقم الآيبان', tb_ref: 'Reference (required)§Référence (obligatoire)§المرجع (مطلوب)', tb_note: 'Use your reference so we can match the transfer to you.§Indiquez votre référence pour identifier le virement.§اكتب مرجعك حتى نربط التحويل بحسابك.', tb_share: 'Share details§Partager§مشاركة البيانات',
  vc_all: 'All§Tout§الكل', vc_telecom: 'Telecom§Télécom§اتصالات', vc_streaming: 'Streaming§Streaming§بث', vc_gaming: 'Gaming§Jeux§ألعاب', vc_shopping: 'Shopping§Shopping§تسوق', vc_food: 'Food§Restauration§طعام',
  vz_hot: 'Popular now§Populaires§الأكثر رواجاً', vz_all: 'All vouchers§Tous les bons§كل القسائم', vz_instant: 'Instant delivery§Livraison instantanée§تسليم فوري', vz_valid: 'Valid 12 months§Valable 12 mois§صالحة 12 شهراً',
  vz_gift: 'Send as a gift§Offrir§أرسلها كهدية', vz_gift_s: 'The code goes straight to their Vega app§Le code arrive directement dans leur appli Vega§يصل الرمز مباشرة إلى تطبيق فيغا لديه', vz_to: 'Gift to§Offrir à§إهداء إلى', vz_msg: 'Add a message (optional)§Ajouter un message (facultatif)§أضف رسالة (اختياري)',
  vz_sum: 'Summary§Récapitulatif§الملخص', vz_value: 'Voucher value§Valeur du bon§قيمة القسيمة', vz_cbl: 'Cashback {p}%§Remise {p} %§استرداد {p}٪', vz_pay: 'Pay {a}§Payer {a}§ادفع {a}',
  vz_ready: 'Voucher ready§Bon prêt§القسيمة جاهزة', vz_gifted: 'Gift sent to {n}§Cadeau envoyé à {n}§أُرسلت الهدية إلى {n}', vz_code: 'Voucher code§Code du bon§رمز القسيمة', vz_redeem: 'How to redeem§Comment l’utiliser§طريقة الاستخدام',
  vz_r1: 'Open {b} and choose Redeem a code§Ouvrez {b} puis « Utiliser un code »§افتح {b} واختر استرداد رمز', vz_r2: 'Enter the code above§Saisissez le code ci-dessus§أدخل الرمز أعلاه', vz_r3: 'Your credit appears right away§Votre crédit apparaît aussitôt§يظهر رصيدك فوراً', vz_masked: 'The code was delivered to {n}§Le code a été remis à {n}§تم تسليم الرمز إلى {n}', vz_none: 'No vouchers here yet§Aucun bon ici§لا قسائم هنا بعد',
  wc_h: 'Money that moves with you§L’argent qui vous suit§مال يتحرك معك', wc_s: 'Send, pay and top up in seconds, with cashback on every purchase.§Envoyez, payez et rechargez en quelques secondes, avec une remise à chaque achat.§أرسل وادفع وعبّئ رصيدك في ثوانٍ، مع استرداد نقدي على كل عملية شراء.', wc_cb: '5% cashback§5 % de remise§استرداد 5٪', wc_new: 'Create account§Créer un compte§إنشاء حساب', wc_login: 'Log in§Se connecter§تسجيل الدخول',
  me_up: 'Upgrade to Tier 2§Passer au niveau 2§الترقية إلى المستوى 2', me_up_s: 'Raise your limits in about 3 minutes§Relevez vos plafonds en 3 minutes§ارفع حدودك خلال 3 دقائق', me_ver: 'Vega by Neptune · v3.2§Vega by Neptune · v3.2§فيغا من نبتون · v3.2', me_quick: 'Language and theme§Langue et thème§اللغة والمظهر'
});

/* ---------- helpers ---------- */
export const bigMoney = minor => { const s = moneyT(minor), m = s.match(/^(.*?)([.,]\d{2})$/); return m ? `<span class="bm-i num">${m[1]}</span><span class="bm-d num">${m[2]}</span>` : `<span class="bm-i num">${s}</span>`; };
function animBal(el, from, to) {
  if (!el) return;
  if (RM() || from === to) { el.innerHTML = bigMoney(to); return; }
  const t0 = performance.now(), d = 700;
  const f = n => { const p = Math.min(1, (n - t0) / d), e = 1 - Math.pow(1 - p, 3); if (!el.isConnected) return; el.innerHTML = bigMoney(Math.round(from + (to - from) * e)); if (p < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
const greet = () => { const h = new Date().getHours(); return t(h < 12 ? 'g_am' : h < 18 ? 'g_pm' : 'g_ev'); };
const rtl = () => document.documentElement.dir === 'rtl';
const curOf = w => w.cur;
const wname = w => nm(w.name);
const bell = () => `<button class="iconbtn glass" data-go="notifs" aria-label="${t('notifs')}">${ic('bell')}${NOTIFS.some(n => n.unread) ? '<span class="dot"></span>' : ''}</button>`;
const eye = hide => `<button class="iconbtn glass" data-act="eye" aria-label="${t('hide_bal')}" aria-pressed="${hide}">${ic(hide ? 'eye-off' : 'eye')}</button>`;

/* ---------- wallet card face (stack on Home) ---------- */
const PILLS = {
  main: [['cashin', 'plus', 'w_add'], ['cards', 'card', 'w_card']],
  save: [['pockets', 'savings', 'w_pot'], ['pockets', 'goal', 'w_goals']],
  usd: [['exchange', 'swap-exchange', 'sv_fx'], ['cashin', 'plus', 'w_add']],
  card: [['cards', 'card', 'w_manage'], ['limits', 'security-shield', 'sv_lim']]
};
const wcard = (w, i, pos) => `<article class="wc tone-${w.tone}" data-i="${i}" data-pos="${pos}" aria-label="${esc(wname(w))}">
  <i class="wc-rings"></i>
  <div class="wc-in" ${pos ? 'inert' : ''}><div class="wc-top"><span class="eyebrow">${esc(wname(w))} · ${w.no}</span>${w.card ? `<span class="wc-ct">${ic('contactless')}</span>` : vegaStar('wc-star')}</div>
  <div class="wc-bot"><div class="wc-pills">${PILLS[w.id].map(([g, i2, k]) => `<button class="pill" data-go="${g}">${ic(i2, 'sm')}<span>${t(k)}</span></button>`).join('')}</div></div></div></article>`;
const chips = w => {
  const c = (i, h) => `<span class="gchip">${ic(i, 'sm')}${h}</span>`;
  if (w.id === 'main') return c('trending-up', `<span class="num">+12.4%</span> ${t('w_trend')}`) + c('star', `${t('w_cb')} <span class="num">${moneyT(S.rewards.cashback)}</span>`);
  if (w.id === 'save') return c('goal', t('w_goal_p', { p: '61' })) + c('refresh', t('w_roundup'));
  if (w.id === 'usd') return c('swap-exchange', t('w_rate', { r: numT(RATE_USD, 2) })) + c('trending-up', `<span class="num">≈ ${moneyT(Math.round(S.usd * RATE_USD))}</span> LYD`);
  return c('card', `${t('w_spent')} <span class="num">1,284.50</span>`) + c('lock', t('w_from'));
};

/* ---------- Home ---------- */
const spent = S.month.slice(-7);
const quick = () => CONTACTS.filter(c => c.fav).concat(CONTACTS.filter(c => !c.fav).slice(0, 2));
const vtile = v => `<button class="vt" data-go="voucher" data-p='{"id":"${v.id}"}'><span class="vt-a">${v.art}</span><b>${v.name}</b><small>${t('from_v', { a: money(v.vals[0], { dec: 0, nocur: true }) })}</small></button>`;
reg('home', {
  tab: true,
  render() {
    const w = WALLETS[store.wallet], n = WALLETS.length, hide = store.hideBal;
    return `<div class="body home">
    <section class="hero" data-tone="${w.tone}">
      <div class="hero-bg" aria-hidden="true">${WALLETS.map(x => `<i class="hb tone-${x.tone} ${x.id === w.id ? 'on' : ''}" data-t="${x.tone}"></i>`).join('')}<i class="hero-rings"></i></div>
      <header class="hm-top">${vegaLogo()}<span class="sp"></span>${eye(hide)}${bell()}</header>
      <div class="hm-bal">
        <div class="hm-hi small">${greet()}, ${esc(nm(ME.first))}</div>
        <div class="eyebrow" data-eb>${esc(wname(w))} · ${t('w_avail')}</div>
        <div class="bigbal disp"><span data-bal>${hide ? '<span class="num bm-i">••••••</span>' : bigMoney(walBal(w))}</span><span class="curchip" data-cur>${curOf(w)}</span></div>
        <div class="hm-chips" data-chips>${chips(w)}</div>
      </div>
      <div class="wstack" role="group" aria-label="${t('wl_title')}" data-n="${n}">${WALLETS.map((x, i) => wcard(x, i, (i - store.wallet + n) % n)).join('')}</div>
      <div class="wdots" data-dots>${WALLETS.map((x, i) => `<button class="${i === store.wallet ? 'on' : ''}" data-d="${i}" aria-label="${esc(wname(x))}"></button>`).join('')}</div>
    </section>
    <div class="panel">
      <nav class="acts2" aria-label="${t('a_more')}">${[['send', 'send', 'a_send', 'coral'], ['request', 'request', 'a_request', 'teal'], ['cashin', 'cash-stack', 'a_cashio', 'sand'], ['scan', 'qr-code', 'a_scanpay', 'navy']].map(([g, i, k, tn]) => `<button class="ta tone-${tn}" data-go="${g}"><span class="ta-g">${ic(i, 'lg')}</span><span class="ta-l">${t(k)}</span></button>`).join('')}</nav>
      <div class="svpills">${[['bills', 'bills', 'sv_bills'], ['airtime', 'phone', 'sv_air'], ['split', 'split-bill', 'sv_split'], ['scheduled', 'calendar', 'sv_sch'], ['exchange', 'swap-exchange', 'sv_fx'], ['pockets', 'savings', 'sv_pk']].map(([g, i, k]) => `<button class="svp" data-go="${g}">${i === 'bills' ? ic('bill', 'sm') : ic(i, 'sm')}<span>${t(k)}</span></button>`).join('')}</div>
      <section class="blk"><div class="sec"><h2>${t('q_again')}</h2></div>
        <div class="stories"><button class="stq" data-go="send"><span class="stq-a plus">${ic('plus')}</span><small>${t('q_new')}</small></button>${quick().map((c, i) => `<button class="stq" data-go="sendamt" data-p='{"c":"${c.id}"}'><span class="stq-a r${i % 5}">${avatar(nm(c), i)}</span><small>${esc(nm(c).split(' ')[0])}</small></button>`).join('')}</div></section>
      <section class="duo">
        <button class="rcard" data-go="rewards">${ring(68, { size: 66, thick: 8, color: '#fff', inner: ic('star', 'sm') })}<span class="rc-t"><small>${t('rg_cb')}</small><b class="disp">${money(S.rewards.cashback, { nocur: true })}</b><small>${t('rg_goal', { g: moneyT(6000, { dec: 0 }) })}</small></span></button>
        <button class="icard" data-go="insights"><span class="ic-bars" aria-hidden="true">${spent.map((v, i) => `<i style="--h:${Math.round(v / 5.2)}%;--d:${i * 50}ms" class="${i === 5 ? 'hi' : ''}"></i>`).join('')}</span><span class="rc-t"><small>${t('in_t')}</small><b class="disp">${money(S.month[11] * 100, { dec: 0 })}</b></span></button>
      </section>
      <section class="blk"><div class="sec"><h2>${t('hv_t')}</h2><button data-go="vouchers">${t('see_all')}</button></div>
        <div class="vstrip">${VOUCHERS.filter(v => v.hot).map(vtile).join('')}</div></section>
      <section class="blk"><div class="sec"><h2>${t('recent')}</h2><button data-tab="activity">${t('see_all')}</button></div>${grouped(S.txns.slice(0, 6))}</section>
    </div></div>`;
  },
  mount(el) {
    const hero = $('.hero', el), stack = $('.wstack', el), n = WALLETS.length;
    const setW = i => {
      const prev = store.wallet; store.wallet = (i + n) % n;
      const w = WALLETS[store.wallet];
      $$('.wc', stack).forEach(c => {
        const pos = (+c.dataset.i - store.wallet + n) % n;
        if (c.dataset.pos === '0' && pos !== 0) { c.classList.add('fly'); setTimeout(() => c.classList.remove('fly'), 360); }
        c.dataset.pos = pos; c.style.transform = ''; $('.wc-in', c).inert = pos !== 0;
      });
      $$('.hb', hero).forEach(b => b.classList.toggle('on', b.dataset.t === w.tone));
      hero.dataset.tone = w.tone;
      $('[data-eb]', el).textContent = `${wname(w)} · ${t('w_avail')}`;
      $('[data-cur]', el).textContent = curOf(w);
      $('[data-chips]', el).innerHTML = chips(w);
      $$('[data-d]', el).forEach(d => d.classList.toggle('on', +d.dataset.d === store.wallet));
      if (!store.hideBal) animBal($('[data-bal]', el), walBal(WALLETS[prev]), walBal(w));
    };
    el.addEventListener('click', e => {
      if (e.target.closest('[data-act=eye]')) { setHide(!store.hideBal); refresh(); return; }
      const d = e.target.closest('[data-d]'); if (d) return setW(+d.dataset.d);
      const c = e.target.closest('.wc'); if (c && c.dataset.pos !== '0' && !e.target.closest('.pill')) setW(+c.dataset.i);
    });
    let x0 = null, dx = 0, t0 = 0;
    stack.addEventListener('pointerdown', e => { const c = e.target.closest('.wc'); if (!c || c.dataset.pos !== '0' || e.target.closest('.pill')) return; x0 = e.clientX; dx = 0; t0 = performance.now(); c.style.transition = 'none'; });
    stack.addEventListener('pointermove', e => { if (x0 == null) return; dx = e.clientX - x0; if (Math.abs(dx) > 6) stack.setPointerCapture?.(e.pointerId); const c = $('.wc[data-pos="0"]', stack); c.style.transform = `translateX(${dx}px) rotate(${dx / 28}deg)`; });
    const end = () => {
      if (x0 == null) return; const c = $('.wc[data-pos="0"]', stack); c.style.transition = '';
      const v = Math.abs(dx) / Math.max(1, performance.now() - t0), go_ = Math.abs(dx) > 56 || v > .5; x0 = null;
      if (go_) { const fwd = (dx < 0) !== rtl(); setW(store.wallet + (fwd ? 1 : -1)); } else c.style.transform = '';
    };
    stack.addEventListener('pointerup', end); stack.addEventListener('pointercancel', end);
    if (!store.hideBal) animBal($('[data-bal]', el), 0, walBal(WALLETS[store.wallet]));
  }
});

/* ---------- Wallets (tab) ---------- */
const cardFace = (c, big) => `<div class="vcard tone-${c.kind === 'physical' ? 'sand' : 'navy'} ${c.frozen ? 'frz' : ''} ${big ? 'big' : ''}"><i class="wc-rings"></i>
  <div class="vc-top">${vegaLogo('sm')}<span class="vc-kind">${t('c_' + c.kind)}</span></div><span class="vc-chip" aria-hidden="true"></span>
  <div class="vc-num num">•••• ${c.last4}</div>
  <div class="vc-bot"><span>${esc(nm(ME)).toUpperCase()}</span><span class="num">${c.exp}</span>${ic('contactless')}</div>${c.frozen ? `<div class="vc-frost">${ic('lock', 'lg')}<b>${t('c_frozen')}</b></div>` : ''}</div>`;
reg('wallets', {
  tab: true,
  render() {
    const tot = S.balance + walBal(WALLETS[1]) + Math.round(S.usd * RATE_USD), c = S.cards[0];
    return `${hdr(t('wl_title'), { back: false, right: `<button class="iconbtn fill" data-go="pocketnew" aria-label="${t('pk_new')}">${ic('plus')}</button>` })}<div class="body">
      <section class="wl-tot rise"><div class="eyebrow">${t('wl_total')}</div><div class="bigbal disp"><span>${bigMoney(tot)}</span><span class="curchip">LYD</span></div></section>
      <div class="wl-list rise">${WALLETS.slice(0, 3).map((w, i) => `<button class="wrow tone-${w.tone}" data-wl="${i}"><i class="wc-rings"></i><span class="wr-m"><small class="eyebrow">${esc(wname(w))} · ${w.no}</small><b class="disp">${bigMoney(walBal(w))}<span class="cur">${w.cur}</span></b></span><span class="wr-go">${ic('chevron-right', 'sm flip')}</span></button>`).join('')}</div>
      <section class="blk rise"><div class="sec"><h2>${t('wl_cards')}</h2><button data-go="cards">${t('see_all')}</button></div>
        <button class="cardbtn" data-go="cards" aria-label="${t('c_title')}">${cardFace(c)}</button></section>
      <section class="blk rise"><div class="sec"><h2>${t('wl_pockets')}</h2><button data-go="pockets">${t('see_all')}</button></div>
        <div class="pgrid">${S.pockets.map(p => `<button class="pk2 tone-${['coral', 'teal', 'navy'][p.f - 1]}" data-go="pocket" data-p='{"id":"${p.id}"}'>${ring(p.saved / p.goal * 100, { size: 58, thick: 7, color: 'currentColor', inner: ic(p.icon, 'sm') })}<b>${esc(nm(p.name))}</b><small class="num">${money(p.saved, { dec: 0, nocur: true })} / ${money(p.goal, { dec: 0, nocur: true })}</small></button>`).join('')}</div></section>
      <section class="blk rise"><div class="sec"><h2>${t('wl_more')}</h2></div><div class="rows plain">${[['scheduled', 'calendar', 'sv_sch'], ['exchange', 'swap-exchange', 'sv_fx'], ['limits', 'security-shield', 'sv_lim'], ['statements', 'statement', 'sv_stm']].map(([g, i, k], n) => `<button class="lr" data-go="${g}"><span class="lri tone-${['coral', 'teal', 'navy', 'sand'][n]}">${ic(i)}</span><span class="lt"><b>${t(k)}</b></span>${ic('chevron-right', 'sm flip')}</button>`).join('')}</div></section>
    </div>`;
  },
  mount(el) { el.addEventListener('click', e => { const b = e.target.closest('[data-wl]'); if (b) { store.wallet = +b.dataset.wl; tab('home'); } }); }
});

/* ---------- Cards ---------- */
reg('cards', {
  render(p, el) {
    const i = el._k ?? 0, c = S.cards[i];
    return scr(`<div class="cardcar rise" data-car>${S.cards.map(k => `<div class="cc">${cardFace(k, 1)}</div>`).join('')}</div>
      <div class="cdots">${S.cards.map((k, x) => `<i class="${x === i ? 'on' : ''}"></i>`).join('')}</div>
      ${c.kind === 'physical' && c.status === 'shipping' ? `<section class="card rise"><div class="b" style="margin-bottom:8px">${t('c_ship')}</div><div class="tl">${[['c_s1', 1], ['c_s2', 1], ['c_s3', 1], ['c_s4', 0]].map(([k, on]) => `<div class="tl-s ${on ? 'on' : ''}"><i></i><span>${t(k)}</span></div>`).join('')}</div></section>` : `
      <div class="qacts rise"><button class="qa" data-act="show"><span class="ta-g tone-coral">${ic('eye')}</span><small>${t('c_show')}</small></button><button class="qa" data-act="frz"><span class="ta-g tone-teal">${ic(c.frozen ? 'unlock' : 'lock')}</span><small>${t(c.frozen ? 'c_unfreeze' : 'c_freeze')}</small></button><button class="qa" data-act="wallet"><span class="ta-g tone-navy">${ic('phone')}</span><small>${t('c_wallet_s')}</small></button><button class="qa" data-go="limits"><span class="ta-g tone-sand">${ic('security-shield')}</span><small>${t('c_limits')}</small></button></div>
      <div class="rows plain rise"><div class="lr"><span class="lri tone-teal">${ic('globe')}</span><span class="lt"><b>${t('c_online')}</b></span>${switchEl('onl', true)}</div><div class="lr"><span class="lri tone-sky">${ic('contactless')}</span><span class="lt"><b>${t('c_tap')}</b></span>${switchEl('tap', c.kind === 'physical')}</div><div class="lr"><span class="lri tone-sand">${ic('atm')}</span><span class="lt"><b>${t('c_atm')}</b></span>${switchEl('atm', false)}</div></div>`}`,
      { head: hdr(t('c_title')), foot: `<button class="btn block lg" data-act="${S.cards.some(k => k.kind === 'physical') ? 'newv' : 'ord'}">${ic('plus', 'sm')} ${S.cards.some(k => k.kind === 'physical') ? t('c_new_t') : t('c_order')}</button>` });
  },
  mount(el) {
    const car = $('[data-car]', el);
    car?.addEventListener('scroll', () => { const k = Math.round(Math.abs(car.scrollLeft) / car.firstElementChild.offsetWidth); if (k !== (el._k ?? 0) && k < S.cards.length) { el._k = k; $$('.cdots i', el).forEach((d, x) => d.classList.toggle('on', x === k)); const c = S.cards[k]; $$('[data-act=frz] small', el).forEach(s => s.textContent = t(c.frozen ? 'c_unfreeze' : 'c_freeze')); } }, { passive: true });
    el.addEventListener('click', async e => {
      const a = e.target.closest('[data-act]')?.dataset.act, c = S.cards[el._k ?? 0];
      if (a === 'frz') { c.frozen = c.frozen ? 0 : 1; const y = car?.scrollLeft; rerender(el); const nc = $('[data-car]', el); if (nc) nc.scrollLeft = y; toast(t(c.frozen ? 'c_frozen' : 'saved_toast'), 'lock'); }
      if (a === 'show') pin(() => { const sh = sheet(`<h3 class="disp">${t('c_sheet_t')}</h3><div class="kv2"><div><span class="muted">${t('c_num')}</span><b class="mono">4291 7730 5518 ${c.last4}</b></div><div><span class="muted">${t('c_exp')}</span><b class="mono">${c.exp}</b></div><div><span class="muted">${t('c_cvv')}</span><b class="mono">731</b></div></div><p class="small muted center">${t('c_reveal_t', { s: 15 })}</p>`); setTimeout(() => { if (sh.isConnected) closeSheet(); }, 15000); });
      if (a === 'wallet') toast(t('c_wallet'), 'phone');
      if (a === 'newv') { await processing(t('proc'), 700); S.cards.unshift({ id: 'k' + (S.cards.length + 1), kind: 'virtual', last4: '6204', exp: '10/29', frozen: 0 }); el._k = 0; rerender(el); toast(t('c_created'), 'card'); }
      if (a === 'ord') { await processing(t('proc'), 800); S.cards.push({ id: 'k9', kind: 'physical', last4: '8830', exp: '03/30', frozen: 0, status: 'shipping' }); el._k = S.cards.length - 1; rerender(el); toast(t('c_ship')); }
    });
  }
});

/* ---------- Top up ---------- */
SCR.cashinagents = { ...SCR.cashin };
reg('cashin', {
  render() {
    const M = [['cashinagents', 'location', 'cm_agent', 'cm_agent_s', 'coral', 'cm_free'], ['topupcard', 'card', 'cm_card', 'cm_card_s', 'navy', ''], ['topupbank', 'accounts', 'cm_bank', 'cm_bank_s', 'teal', 'cm_free']];
    return scr(`<p class="lead-p muted rise">${t('ci_pick')}</p><div class="methods rise">${M.map(([g, i, k, s, tn, tag]) => `<button class="meth tone-${tn}" data-go="${g}"><span class="ta-g">${ic(i, 'lg')}</span><span class="mt-t"><b>${t(k)}</b><small>${t(s)}</small></span>${tag ? `<span class="badge ok">${t(tag)}</span>` : ''}${ic('chevron-right', 'sm flip')}</button>`).join('')}</div>
      <div class="rows plain rise"><button class="lr" data-go="cashout"><span class="lri tone-sand">${ic('atm')}</span><span class="lt"><b>${t('co_title')}</b><small>${t('co_sub')}</small></span>${ic('chevron-right', 'sm flip')}</button></div>`, { head: hdr(t('ci_title')) });
  }
});
reg('topupcard', {
  skel: false,
  render() {
    return scr(`<div class="rcp rise"><span class="tg tone-navy">${ic('card')}</span><div class="sp"><div class="b">${t('tc_card')}</div><div class="small muted">${t('tc_with')}</div></div>${ic('chevron-down', 'sm')}</div>
      <div class="amt"><div class="amt-row"><span class="amt-v disp" data-amt>0</span><span class="amt-c disp">${st.cur}</span></div><div class="amt-hint small" data-hint>${t('tc_fee', { f: moneyT(0) })}</div></div>
      <div class="chips" style="justify-content:center;flex-wrap:wrap;margin:0">${[50, 100, 200, 500].map(v => `<button class="chip" data-q="${v}"><span class="num">${v}</span></button>`).join('')}</div>${keypadHtml()}`, { head: hdr(t('tc_title')), foot: `<button class="btn block lg" id="tc" disabled>${t('tc_btn')}</button>`, cls: 'amtbody' });
  },
  mount(el) {
    let cur = '', kp; const btn = $('#tc', el);
    kp = bindKeypad($('.amtpad', el), s => { cur = s; const m = toMinor(s); $('[data-amt]', el).innerHTML = amtDisplay(s); btn.disabled = !m; $('[data-hint]', el).innerHTML = t('tc_fee', { f: money(Math.round(m * .012)) }); });
    el.addEventListener('click', e => { const q = e.target.closest('[data-q]'); if (q) kp.set(q.dataset.q); });
    btn.addEventListener('click', () => pin(async () => {
      await processing(); const m = toMinor(cur), ref = refNo('TC'), x = addTxn({ type: 'cashin', who: 'a1', amt: m, ref });
      showSuccess({ title: t('tc_done'), amountMinor: m, rows: [[t('tc_with'), t('tc_card')], [t('fee'), money(Math.round(m * .012))], [t('new_bal'), money(S.balance)], [t('ref'), `<span class="mono">${ref}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-go="txn" data-p='{"id":${x.id}}'>${ic('receipt', 'sm')} ${t('view_receipt')}</button>` });
    }));
  }
});
reg('topupbank', {
  render() {
    const R = [['tb_name', 'Neptune Vega Payments'], ['tb_iban', 'LY38 0021 0001 4277 1055 18'], ['tb_ref', 'VG-AMIRA-0142']];
    return scr(`<div class="note rise">${ic('info', 'sm')}<span class="small">${t('tb_s')}</span></div>
      <div class="rows plain rise">${R.map(([k, v]) => `<button class="lr" data-copy="${v}"><span class="lt"><small>${t(k)}</small><b class="${k === 'tb_ref' ? 'mono' : k === 'tb_iban' ? 'num' : ''}" style="white-space:nowrap">${v}</b></span><span class="lri tone-sand">${ic('copy', 'sm')}</span></button>`).join('')}</div>
      <p class="small muted center rise">${t('tb_note')}</p>`, { head: hdr(t('tb_title')), foot: `<button class="btn block lg" data-act="shr">${ic('share', 'sm')} ${t('tb_share')}</button>` });
  },
  mount(el) { el.addEventListener('click', e => { if (e.target.closest('[data-act=shr]')) toast(t('share'), 'share'); }); }
});

/* ---------- Vouchers ---------- */
const vcard = v => `<button class="vc2" data-go="voucher" data-p='{"id":"${v.id}"}'><span class="vc2-a">${v.art}${v.hot ? `<i class="vc2-hot">${ic('star', 'sm')}</i>` : ''}</span><b>${v.name}</b><small>${t('from_v', { a: money(v.vals[0], { dec: 0, nocur: true }) })} · ${t('vc_' + v.cat)}</small></button>`;
reg('vouchers', {
  render(p, el) {
    const c = el._c || 'all', list = VOUCHERS.filter(v => c === 'all' || v.cat === c);
    return scr(`<p class="lead-p muted rise">${t('v_sub')}</p>
      <div class="chips rise">${['all', ...VCATS].map(k => `<button class="chip" aria-pressed="${c === k}" data-c="${k}">${t('vc_' + k)}</button>`).join('')}</div>
      ${c === 'all' ? `<section class="blk rise"><div class="sec"><h2>${t('vz_hot')}</h2></div><div class="vfeat">${VOUCHERS.filter(v => v.hot).map(v => `<button class="vf2" data-go="voucher" data-p='{"id":"${v.id}"}'>${v.art}<span class="vf2-t"><b>${v.name}</b><small>${t('from_v', { a: money(v.vals[0], { dec: 0, nocur: true }) })}</small></span></button>`).join('')}</div></section>` : ''}
      <section class="blk rise">${c === 'all' ? `<div class="sec"><h2>${t('vz_all')}</h2></div>` : ''}${list.length ? `<div class="vgrid2">${list.map(vcard).join('')}</div>` : `<p class="muted center">${t('vz_none')}</p>`}</section>`, { head: hdr(t('v_title')) });
  },
  mount(el) { el.addEventListener('click', e => { const c = e.target.closest('[data-c]'); if (c) { el._c = c.dataset.c; const y = $('.body', el).scrollTop; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); $('.body', el).scrollTop = y; } }); }
});
const codeOf = ref => { const a = (ref.replace(/[^A-Z0-9]/g, '') + 'K9TQ2XM71VG4').slice(0, 12); return [a.slice(0, 4), a.slice(4, 8), a.slice(8, 12)].join('-'); };
reg('voucher', {
  skel: false,
  render({ id }, el) {
    const v = voucher(id), vi = el._v ?? Math.min(1, v.vals.length - 1), val = v.vals[vi], gift = !!el._g, to = el._to || 'c2';
    const cb = Math.round(val * .03);
    return scr(`<div class="vhero rise"><span class="vh-a">${v.art}</span><div class="vh-t"><b class="disp">${v.name}</b><span class="badge glassb">${t('vc_' + v.cat)}</span></div></div><div class="vh-m"><span>${ic('clock', 'sm')} ${t('vz_instant')}</span><span>${ic('success-check', 'sm')} ${t('vz_valid')}</span></div>
      <div class="gl">${t('v_pick')}</div><div class="amgrid air rise">${v.vals.map((a, i) => `<button class="amtile ${i === vi ? 'on' : ''}" data-s="${i}"><b class="disp num">${numT(a / 100)}</b><span class="tiny">${st.cur}</span></button>`).join('')}</div>
      <div class="giftbox rise ${gift ? 'on' : ''}"><div class="lr"><span class="lri tone-coral">${ic('card-add')}</span><span class="lt"><b>${t('vz_gift')}</b><small>${t('vz_gift_s')}</small></span>${switchEl('gift', gift)}</div>
        ${gift ? `<div class="gl">${t('vz_to')}</div><div class="favrow">${CONTACTS.slice(0, 6).map((c, i) => `<button class="fav ${to === c.id ? 'on' : ''}" data-to="${c.id}">${avatar(nm(c), i, 'big')}<span>${esc(nm(c).split(' ')[0])}</span><i class="tick">${ic('success-check', 'sm')}</i></button>`).join('')}</div><input class="inp" data-msg placeholder="${t('vz_msg')}" value="${esc(el._m || '')}" aria-label="${t('vz_msg')}">` : ''}</div>
      <div class="rows plain rise"><div class="kvr"><span class="muted">${t('vz_value')}</span><b class="num">${money(val)}</b></div><div class="kvr"><span class="muted">${t('fee')}</span><b class="pos">${t('free')}</b></div><div class="kvr"><span class="muted">${t('m_cbtxt')}</span><b class="pos num">${money(cb, { sign: true })}</b></div><div class="kvr tot"><b>${t('total')}</b><b class="num">${money(val)}</b></div></div>`,
      { head: hdr(v.name), foot: `<button class="btn block lg" id="vbuy" ${val > S.balance ? 'disabled' : ''}>${t('vz_pay', { a: moneyT(val) + ' ' + st.cur })}</button>` });
  },
  mount(el, { id }) {
    const v = voucher(id), keep = () => { const y = $('.body', el).scrollTop; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); $('.body', el).scrollTop = y; };
    el.addEventListener('click', e => {
      const s = e.target.closest('[data-s]'), g = e.target.closest('[data-sw=gift]'), to = e.target.closest('[data-to]');
      if (s) { el._v = +s.dataset.s; keep(); }
      if (g) { setTimeout(() => { el._g = g.getAttribute('aria-checked') === 'true'; keep(); }, 20); }
      if (to) { el._to = to.dataset.to; keep(); }
    });
    el.addEventListener('input', e => { if (e.target.matches('[data-msg]')) el._m = e.target.value; });
    $('#vbuy', el).addEventListener('click', () => pin(async () => {
      await processing(); const val = v.vals[el._v ?? Math.min(1, v.vals.length - 1)], ref = refNo('VC');
      addTxn({ type: 'voucher', who: null, amt: -val, cat: 'shopping', ref, note: v.name }); S.balance += Math.round(val * .03);
      go('vdone', { id, val, ref, to: el._g ? (el._to || 'c2') : '' });
    }));
  }
});
reg('vdone', {
  skel: false,
  render({ id, val, ref, to }) {
    const v = voucher(id), code = codeOf(ref), who = to ? nm(person(to)).split(' ')[0] : '';
    return `<div class="body vdone">
      <div class="succ-art"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring" cx="60" cy="60" r="52"/><path class="chk draw" pathLength="1" d="M36 62 54 80 86 42"/></svg></div>
      <h2 class="disp succ-t">${who ? t('vz_gifted', { n: esc(who) }) : t('vz_ready')}</h2>
      <article class="ticket"><span class="tk-a">${v.art}</span><div class="tk-v"><span><b class="disp" style="font-size:18px">${v.name}</b><br><small>${t('vz_value')}</small></span><b class="disp">${money(val)}</b></div><div class="rc-cut"><i></i><b></b><i></i></div>
        <div class="tk-c"><small>${t('vz_code')}</small><b class="mono code">${who ? 'VG••-••••-••••' : esc(code)}</b>${who ? `<small>${t('vz_masked', { n: esc(who) })}</small>` : `<button class="btn tonal sm" data-copy="${esc(code)}">${ic('copy', 'sm')} ${t('copy_code')}</button>`}</div></article>
      ${who ? '' : `<section class="rows plain"><div class="gl">${t('vz_redeem')}</div>${['vz_r1', 'vz_r2', 'vz_r3'].map((k, i) => `<div class="lr"><span class="lri num">${i + 1}</span><span class="lt"><b>${t(k, { b: v.name })}</b></span></div>`).join('')}</section>`}</div>
      <footer class="foot"><button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-go="activity">${ic('receipt', 'sm')} ${t('view_receipt')}</button></footer>`;
  }
});

/* ---------- Profile ---------- */
const grp = (title, rows) => `<section class="blk rise"><div class="sec"><h2>${title}</h2></div><div class="rows plain">${rows.map(([g, i, k, s, tn, p]) => `<button class="lr" data-go="${g}" ${p ? `data-p='${JSON.stringify(p)}'` : ''}><span class="lri tone-${tn}">${ic(i)}</span><span class="lt"><b>${t(k)}</b>${s ? `<small>${t(s)}</small>` : ''}</span>${ic('chevron-right', 'sm flip')}</button>`).join('')}</div></section>`;
reg('me', {
  tab: true,
  render() {
    return `${hdr(t('me_title'), { back: false, right: `<button class="iconbtn fill" data-go="settings" aria-label="${t('set_title')}">${ic('settings')}</button>` })}<div class="body">
      <section class="mecard rise" data-sk><i class="hero-rings"></i>${avatar(nm(ME), 2, 'big xl2')}<div class="sp"><div class="disp mc-n">${esc(nm(ME))}</div><div class="small"><span class="ltr">${ME.handle}</span> · <span class="num">${ME.phone}</span></div><span class="badge glassb">${ic('security-shield', 'sm')} ${t('tier1')}</span></div></section>
      <button class="upg rise" data-go="kyc"><span class="lri tone-coral">${ic('id-card')}</span><span class="lt"><b>${t('me_up')}</b><small>${t('me_up_s')}</small><span class="thin tall"><i style="width:50%"></i></span></span>${ic('chevron-right', 'sm flip')}</button>
      <section class="blk rise"><div class="sec"><h2>${t('me_quick')}</h2></div>
        <div class="seg" id="sl">${[['en', 'English'], ['fr', 'Français'], ['ar', 'العربية']].map(([k, n]) => `<button aria-pressed="${st.lang === k}" data-l="${k}">${n}</button>`).join('')}</div>
        <div class="seg" style="margin-top:8px">${['light', 'dark'].map(k => `<button aria-pressed="${st.theme === k}" data-th="${k}">${ic(k === 'light' ? 'sun' : 'moon', 'sm')} ${t(k)}</button>`).join('')}</div></section>
      ${grp(t('me_acct'), [['limits', 'id-card', 'me_id', 'tier1', 'coral'], ['cards', 'card', 'sv_cards', '', 'navy'], ['statements', 'statement', 'sv_stm', '', 'teal'], ['rewards', 'star', 'sv_rw', '', 'amber'], ['referrals', 'users', 'sv_rf', '', 'sky']])}
      ${grp(t('me_prefs'), [['security', 'security-shield', 'me_sec', '', 'teal'], ['settings', 'settings', 'me_set', '', 'sand'], ['notifs', 'bell', 'notifs', '', 'coral']])}
      ${grp(t('me_help'), [['support', 'chat', 'me_sup', '', 'sky'], ['help', 'info', 'me_faq', '', 'sand'], ['welcome', 'logout', 'me_out', '', 'navy']])}
      <p class="tiny muted center">${t('me_ver')}</p></div>`;
  },
  mount(el) {
    el.addEventListener('click', e => {
      if (e.target.closest('[data-go=welcome]')) { e.stopPropagation(); LS.set('vega.app.out', '1'); tab('welcome'); return; } // sign out: Back must not return to the wallet
      const l = e.target.closest('[data-l]'), th = e.target.closest('[data-th]'); if (l) setLang(l.dataset.l); if (th) setTheme(th.dataset.th);
    });
  }
});

/* ---------- Welcome ---------- */
reg('welcome', {
  skel: false,
  render() {
    return `<div class="welc"><i class="hero-rings"></i><div class="w-top">${vegaLogo()}</div>
      <div class="w-fan" aria-hidden="true"><span class="w-chip c1">${ic('receive', 'sm')} +150.00 LYD</span><span class="w-chip c2">${ic('star', 'sm')} ${t('wc_cb')}</span><i class="tone-navy"></i><i class="tone-teal"></i><i class="tone-coral"><b>${vegaStar('wc-star')}</b></i></div>
      <div class="w-txt"><h1 class="disp">${t('wc_h')}</h1><p>${t('wc_s')}</p></div>
      <div class="stack s8" style="width:100%"><button class="btn block lg light" data-go="signup">${t('wc_new')}</button><button class="btn block lg ghost" data-go="lock">${t('wc_login')}</button></div></div>`;
  }
});
