import { $, $$, S, L, t, T, tx, ic, icf, bal, num, cur, sheet, toast, confetti, haptic, esc, init, qrSvg, sleep, anim, dayLbl, timeLbl, dateLbl, today, dAgo, reduced, moneyTxt, dp, bmark } from '../util.js';
import { reg, go, back, backTo, tab, A, top } from '../app.js';
import { ACC, accBy, BEN, benName, TX, CATS, txName, uname, bankName, RATES } from '../data.js';
import { authorize } from './auth.js';
import { txRow, dayHead } from './home.js';
import { keysHtml, mountPad } from './pad.js';

L([
  ['Confirm transfer', 'Confirmer le virement', 'تأكيد التحويل'], ['Card •••• 4821', 'Carte •••• 4821', 'البطاقة \u2066•••• 4821\u2069'], ['Wallet', 'Portefeuille', 'المحفظة'], ['Fast transfer', 'Virement instantané', 'تحويل فوري'], ['Bill payment', 'Paiement de facture', 'دفع فاتورة'], ['Top-up', 'Recharge', 'شحن'], ['Standing credit', 'Virement permanent', 'إيداع دائم'], ['Transfer', 'Virement', 'تحويل'],
  ['Tap to pay', 'Payer sans contact', 'الدفع بالتقريب'], ['Contactless', 'Sans contact', 'اللاتلامسي'], ['Today', "Aujourd'hui", 'اليوم'], ['Yesterday', 'Hier', 'أمس'],
  ['Pay & transfer', 'Payer et virer', 'الدفع والتحويل'], ['Transfers', 'Virements', 'التحويلات'], ['Instant payments', 'Paiements instantanés', 'المدفوعات الفورية'], ['Pay & request', 'Payer et demander', 'الدفع والطلب'],
  ['Between my accounts', 'Entre mes comptes', 'بين حساباتي'], ['International', 'International', 'دولي'], ['Send abroad in USD or EUR', 'Envoyez à l\'étranger en USD ou EUR', 'أرسل للخارج بالدولار أو اليورو'], ['Your own accounts · instant', 'Vos comptes · instantané', 'حساباتك · فوري'], ['Within the bank', 'Au sein de la banque', 'داخل المصرف'], ['Fast transfer', 'Virement instantané', 'تحويل فوري'], ['Scheduled & standing', 'Programmés et permanents', 'مجدولة ودائمة'], ['Beneficiaries', 'Bénéficiaires', 'المستفيدون'],
  ['Pay bills', 'Payer des factures', 'دفع الفواتير'], ['Mobile top-up', 'Recharge mobile', 'شحن الهاتف'], ['Vouchers', 'Bons', 'القسائم'], ['Services', 'Services', 'الخدمات'], ['Request money', 'Demander de l\'argent', 'طلب أموال'], ['Split a bill', 'Partager l\'addition', 'تقسيم الفاتورة'], ['Currency exchange', 'Change de devises', 'صرف العملات'],
  ['Send, scan, receive', 'Envoyer, scanner, recevoir', 'أرسل وامسح واستلم'], ['Instant, free, 24/7', 'Instantané, gratuit, 24h/24', 'فوري ومجاني على مدار الساعة'], ['Interbank by alias', 'Interbancaire par alias', 'بين المصارف عبر الاسم المستعار'],
  ['From', 'De', 'من'], ['To', 'Vers', 'إلى'], ['Amount', 'Montant', 'المبلغ'], ['Note (optional)', 'Note (facultatif)', 'ملاحظة (اختياري)'], ['Review', 'Vérifier', 'مراجعة'], ['New', 'Nouveau', 'جديد'], ['Now', 'Maintenant', 'الآن'], ['Later', 'Plus tard', 'لاحقاً'], ['Repeat', 'Répéter', 'تكرار'],
  ['Insufficient balance', 'Solde insuffisant', 'الرصيد غير كافٍ'], ['Fee', 'Frais', 'الرسوم'], ['Free', 'Gratuit', 'مجاني'], ['Total', 'Total', 'الإجمالي'], ['Confirm and authorise', 'Confirmer et autoriser', 'تأكيد وتفويض'], ['Review transfer', 'Vérifier le virement', 'مراجعة التحويل'], ['Arrives', 'Arrivée', 'الوصول'], ['Instantly', 'Instantanément', 'فوراً'],
  ['Same day', 'Le jour même', 'في نفس اليوم'], ['Choose account', 'Choisir un compte', 'اختر حساباً'], ['Choose beneficiary', 'Choisir un bénéficiaire', 'اختر مستفيداً'], ['Sent', 'Envoyé', 'تم الإرسال'], ['Transfer sent', 'Virement envoyé', 'تم إرسال التحويل'], ['Transfer scheduled', 'Virement programmé', 'تمت جدولة التحويل'], ['Share receipt', 'Partager le reçu', 'مشاركة الإيصال'], ['Done', 'Terminé', 'تم'], ['View receipt', 'Voir le reçu', 'عرض الإيصال'],
  ['Reference', 'Référence', 'المرجع'], ['Date', 'Date', 'التاريخ'], ['Status', 'Statut', 'الحالة'], ['Completed', 'Terminé', 'مكتمل'], ['Category', 'Catégorie', 'الفئة'], ['Channel', 'Canal', 'القناة'], ['Merchant', 'Commerçant', 'التاجر'], ['Report a problem', 'Signaler un problème', 'الإبلاغ عن مشكلة'], ['Download PDF', 'Télécharger le PDF', 'تنزيل PDF'],
  ['Add beneficiary', 'Ajouter un bénéficiaire', 'إضافة مستفيد'], ['Full name', 'Nom complet', 'الاسم الكامل'], ['Bank', 'Banque', 'المصرف'], ['Account or IBAN', 'Compte ou IBAN', 'الحساب أو الآيبان'], ['Save beneficiary', 'Enregistrer', 'حفظ المستفيد'], ['Favourites', 'Favoris', 'المفضلة'], ['All beneficiaries', 'Tous les bénéficiaires', 'كل المستفيدين'], ['Beneficiary added', 'Bénéficiaire ajouté', 'تمت إضافة المستفيد'], ['Enter a name and a full account number or IBAN', 'Saisissez un nom et un numéro de compte ou IBAN complet', 'أدخل الاسم ورقم الحساب أو الآيبان كاملاً'], ['This beneficiary is already saved', 'Ce bénéficiaire est déjà enregistré', 'هذا المستفيد محفوظ مسبقاً'],
  ['Search', 'Rechercher', 'بحث'], ['All', 'Tout', 'الكل'], ['Money in', 'Entrées', 'الوارد'], ['Spending', 'Dépenses', 'الإنفاق'], ['Transfers', 'Virements', 'التحويلات'], ['Bills', 'Factures', 'الفواتير'], ['History', 'Historique', 'السجل'], ['Search transactions', 'Rechercher des opérations', 'ابحث في العمليات'], ['No results', 'Aucun résultat', 'لا توجد نتائج'], ['Try another search', 'Essayez une autre recherche', 'جرّب بحثاً آخر'],
  ['Scan', 'Scanner', 'مسح'], ['My QR', 'Mon QR', 'رمزي'], ['Requests', 'Demandes', 'الطلبات'], ['Point at a QR code', 'Visez un code QR', 'وجّه نحو رمز QR'], ['Code detected', 'Code détecté', 'تم اكتشاف الرمز'], ['Pay merchant', 'Payer le commerçant', 'الدفع للتاجر'], ['Pay now', 'Payer', 'ادفع الآن'], ['Receive money', 'Recevoir de l\'argent', 'استلام الأموال'], ['Show this code to get paid', 'Montrez ce code pour être payé', 'اعرض هذا الرمز لتلقي الدفع'], ['Set an amount', 'Fixer un montant', 'حدد مبلغاً'], ['Share', 'Partager', 'مشاركة'], ['Save image', 'Enregistrer l\'image', 'حفظ الصورة'], ['Code refreshes in {s}s', 'Le code change dans {s} s', 'يتجدد الرمز خلال {s} ث'],
  ['Send to', 'Envoyer à', 'إرسال إلى'], ['Phone, alias or tag', 'Téléphone, alias ou tag', 'الهاتف أو الاسم المستعار أو الوسم'], ['Recent', 'Récents', 'الأخيرة'], ['Send now', 'Envoyer', 'أرسل الآن'], ['Approve', 'Approuver', 'موافقة'], ['Decline', 'Refuser', 'رفض'], ['Incoming', 'Reçues', 'الواردة'], ['Sent requests', 'Demandes envoyées', 'الطلبات المرسلة'], ['requests {amt}', 'demande {amt}', 'يطلب {amt}'], ['Dinner last Friday', 'Dîner de vendredi', 'عشاء الجمعة الماضية'], ['Concert tickets', 'Billets de concert', 'تذاكر الحفل'], ['Request declined', 'Demande refusée', 'تم رفض الطلب'], ['Request sent', 'Demande envoyée', 'تم إرسال الطلب'], ['Send request', 'Envoyer la demande', 'إرسال الطلب'], ['From whom', 'À qui', 'من'], ['Pending', 'En attente', 'قيد الانتظار'], ['Paid', 'Payé', 'مدفوع'], ['Due date', 'Échéance', 'تاريخ الاستحقاق'], ['In 7 days', 'Dans 7 jours', 'خلال 7 أيام'],
  ['Execute on', 'Exécuter le', 'التنفيذ في'], ['Tomorrow', 'Demain', 'غداً'], ['Next Sunday', 'Dimanche prochain', 'الأحد القادم'], ['Next month', 'Mois prochain', 'الشهر القادم'], ['Weekly', 'Chaque semaine', 'أسبوعياً'], ['Monthly', 'Chaque mois', 'شهرياً'], ['Standing orders', 'Ordres permanents', 'أوامر دائمة'], ['Scheduled', 'Programmés', 'المجدولة'], ['Rent — Hana Rashid', 'Loyer — Hana Rashid', 'الإيجار — هناء رشيد'], ['Savings top-up', 'Alimentation épargne', 'إيداع التوفير'], ['Next: {d}', 'Prochain : {d}', 'التالي: {d}'], ['New schedule', 'Nouvelle programmation', 'جدولة جديدة'], ['Cancel', 'Annuler', 'إلغاء'], ['Step', 'Étape', 'الخطوة'],
  ['Everyday transfers', 'Virements du quotidien', 'تحويلات يومية'], ['Within {bank} · no fee', 'Au sein de {bank} · sans frais', 'داخل {bank} · بدون رسوم'], ['Other banks · instant · small fee', 'Autres banques · instantané · petits frais', 'مصارف أخرى · فوري · رسوم بسيطة'], ['Payment sent', 'Paiement envoyé', 'تم إرسال الدفع'], ['Payment to {name}', 'Paiement à {name}', 'دفع إلى {name}'],
]);
L([['Rate', 'Taux', 'سعر الصرف'], ['You get {a}', 'Vous recevez {a}', 'تحصل على {a}'], ['LYPay', 'LYPay', 'ليبي باي'], ['OnePay', 'OnePay', 'ون باي'], ['Continue', 'Continuer', 'متابعة'], ['Send {amt}', 'Envoyer {amt}', 'إرسال {amt}'], ['Transfer {amt}', 'Virer {amt}', 'تحويل {amt}'], ['Request {amt}', 'Demander {amt}', 'طلب {amt}'], ['Pay {amt}', 'Payer {amt}', 'ادفع {amt}'], ['Available: {a}', 'Disponible : {a}', 'المتاح: {a}'], ['Transfer', 'Virement', 'تحويل'], ['New beneficiary', 'Nouveau bénéficiaire', 'مستفيد جديد'], ['When', 'Quand', 'متى'], ['Pay over time', 'Payer en plusieurs fois', 'ادفع على أقساط'], ['from {m} / month', 'dès {m} / mois', 'ابتداءً من {m} / شهر'], ['Pay in full now', 'Payer en une fois', 'ادفع كاملاً الآن'], ['Wireless headphones', 'Casque sans fil', 'سماعات لاسلكية'], ['Choose how to pay', 'Choisissez comment payer', 'اختر طريقة الدفع'], ['Tap to pay', 'Payer sans contact', 'الدفع بالتقريب'], ['Contactless', 'Sans contact', 'اللاتلامسي']]);

const sheetBen = (b, sel) => `<button class="pk row ${sel ? 'on' : ''}" data-v="${b.id}"><span class="av ${b.tone}">${init(benName(b))}</span><div class="tx"><b>${esc(benName(b))}</b><small>${esc(tx(b.bank))} · <span class="num">•••• ${b.no}</span></small></div>${sel ? ic('success-check', 'pos') : ''}</button>`;
export function pickAcc(selId, cb, title, skip) {
  sheet(`<h2>${title || t('Choose account')}</h2><div style="margin-top:12px">${ACC.filter(a => a.id !== skip).map(a => `<button class="pk row" data-v="${a.id}"><span class="tile">${ic(a.ic)}</span><div class="tx"><b>${tx(a.name)}</b><small class="num">•••• ${a.no}</small></div><div class="end"><b class="num">${num(a.bal, dp(a.cur))}</b><small>${cur(a.cur)}</small></div>${a.id === selId ? ic('success-check', 'pos') : ''}</button>`).join('')}</div>`, { mount(sh, close) { sh.addEventListener('click', e => { const b = e.target.closest('.pk'); if (b) { cb(b.dataset.v); close() } }) } });
}
const ownRow = a => `<span class="tile">${ic(a.ic)}</span><div class="tx"><small>${t('To')}</small><b>${tx(a.name)}</b></div>${ic('chevron-down', 'muted')}`;
const accChip = a => `${tx(a.name)} · <span class="num">•••• ${a.no}</span> ${ic('chevron-down', 's')}`;

/* ---------- transfer hub (rows) ---------- */
const hub = (ico, tone, label, go_, p, sub = '', wide = '') => `<button class="hub ${wide}" data-go="${go_}" data-p='${JSON.stringify(p || {})}'><span class="tile ${tone}">${ic(ico)}</span><div><b>${t(label)}</b>${sub ? `<small>${sub}</small>` : ''}</div>${wide ? icf('chevron-right', 'muted') : ''}</button>`;
reg('xfer', () => ({
  title: t('Transfer'), right: `<button class="btn text sm" data-go="request">${t('Request money')}</button>`,
  body: `<div class="hubgrid rv">${hub('wallet', '', 'Between my accounts', 'transfer', { type: 'own' }, t('Your own accounts · instant'))}${hub('accounts', 'f2', 'Within the bank', 'transfer', { type: 'internal' }, t('Within {bank} · no fee', { bank: bankName() }))}${hub('send', 'f1', 'Fast transfer', 'transfer', { type: 'fast' }, t('Other banks · instant · small fee'))}${hub('globe', 'f3', 'International', 'transfer', { type: 'intl' }, t('Send abroad in USD or EUR'))}${hub('qr-code', 'acc', 'LYPay', 'qrpay', { scheme: 'lypay' }, t('Instant, free, 24/7'), 'wide')}${hub('swap-exchange', 'f2', 'OnePay', 'qrpay', { scheme: 'onepay' }, t('Interbank by alias'), 'wide')}</div>
    <div class="group rv" style="--d:1;margin-top:14px"><button class="row" data-go="beneficiaries"><span class="tile f1">${ic('users')}</span><div class="tx"><b>${t('Beneficiaries')}</b></div>${icf('chevron-right', 'muted')}</button><button class="row" data-go="scheduled"><span class="tile f3">${ic('calendar')}</span><div class="tx"><b>${t('Scheduled & standing')}</b></div>${icf('chevron-right', 'muted')}</button><button class="row" data-go="split"><span class="tile f2">${ic('split-bill')}</span><div class="tx"><b>${t('Split a bill')}</b></div>${icf('chevron-right', 'muted')}</button></div>`
}));

/* ---------- amount-first transfer ---------- */
const FEE = { own: 0, internal: 0, fast: .5, intl: 12 }; // in LYD
const [, USD_BUY, USD_SELL] = RATES[0]; // bank buys USD at USD_BUY LYD, sells at USD_SELL
const feeIn = (type, c) => c === 'LYD' ? FEE[type] : Math.round(FEE[type] / USD_SELL * 100) / 100;
const conv = (v, from, to) => from === to ? v : from === 'USD' ? Math.round(v * USD_BUY * 1000) / 1000 : Math.round(v / USD_SELL * 100) / 100;
const rateTxt = from => `\u20661 USD = ${num(from === 'USD' ? USD_BUY : USD_SELL, 3)} ${cur('LYD')}\u2069`; // isolated so it reads left to right inside Arabic text
const ownTo = f => (ACC.find(a => a.id !== f && a.cur === accBy(f).cur) || ACC.find(a => a.id !== f)).id;
reg('transfer', (p) => {
  const type = p.type || 'fast'; const ttl = { own: t('Between my accounts'), internal: t('Within the bank'), fast: t('Fast transfer'), intl: t('International') }[type];
  const from = p.from || 'cur'; const toOwn = accBy(ownTo(from));
  const b0 = BEN.find(b => b.id === p.to) || BEN[0];
  const toRow = type === 'own'
    ? `<button class="row" id="tob">${ownRow(toOwn)}</button>`
    : `<button class="row" id="tob"><span class="av ${b0.tone}">${init(benName(b0))}</span><div class="tx"><small>${t('To')}</small><b>${esc(benName(b0))}</b></div>${ic('chevron-down', 'muted')}</button>`;
  return {
    title: ttl, body: `<div class="amt-wrap"><div class="amt-top">${toRow}</div><div class="amt-big"><b>0</b><small id="ccy">${cur(accBy(from).cur)}</small></div><div class="amt-sub" id="as"></div><button class="chip-btn" id="fromb">${accChip(accBy(from))}</button>${keysHtml()}<div class="cta"><button class="btn" id="go" disabled>${t('Continue')}</button></div></div>`,
    mount(el) {
      let f = from, to = type === 'own' ? toOwn.id : b0.id, amtv = 0;
      const upd = () => { const a = accBy(f); const bad = amtv + feeIn(type, a.cur) > a.bal; const as = $('#as', el); as.className = 'amt-sub' + (bad ? ' bad' : ''); const tc = type === 'own' ? accBy(to).cur : a.cur; as.textContent = bad ? t('Insufficient balance') : tc !== a.cur ? `${rateTxt(a.cur)} · ${t('You get {a}', { a: `\u2066${moneyTxt(conv(amtv, a.cur, tc), tc, dp(tc))}\u2069` })}` : t('Available: {a}', { a: moneyTxt(a.bal, a.cur, dp(a.cur)) }); const g = $('#go', el); g.disabled = !(amtv > 0) || bad; g.textContent = amtv > 0 ? t(type === 'own' ? 'Transfer {amt}' : 'Send {amt}', { amt: moneyTxt(amtv, a.cur, dp(a.cur)) }) : t('Continue'); $('#ccy', el).textContent = cur(a.cur) };
      mountPad(el, { onChange: v => { amtv = v; upd() } }); upd();
      $('#fromb', el).onclick = () => pickAcc(f, id => { f = id; $('#fromb', el).innerHTML = accChip(accBy(id)); if (type === 'own' && to === f) { to = ownTo(f); $('#tob', el).innerHTML = ownRow(accBy(to)) } upd() });
      $('#tob', el).onclick = () => { if (type === 'own') pickAcc(to, id => { to = id; $('#tob', el).innerHTML = ownRow(accBy(id)); upd() }, t('To'), f); else sheet(`<h2>${t('Choose beneficiary')}</h2><div style="margin-top:10px">${BEN.map(b => sheetBen(b, b.id === to)).join('')}<button class="row" data-go-new><span class="tile">${ic('plus')}</span><div class="tx"><b>${t('New beneficiary')}</b></div></button></div>`, { mount(sh, close) { sh.addEventListener('click', e => { const n = e.target.closest('[data-go-new]'); if (n) { close(); return go('addben') } const b = e.target.closest('.pk'); if (b) { to = b.dataset.v; const bb = BEN.find(x => x.id === to); $('#tob', el).innerHTML = `<span class="av ${bb.tone}">${init(benName(bb))}</span><div class="tx"><small>${t('To')}</small><b>${esc(benName(bb))}</b></div>${ic('chevron-down', 'muted')}`; close() } }) } }) };
      $('#go', el).onclick = () => {
        const a = accBy(f), tgt = type === 'own' ? tx(accBy(to).name) : benName(BEN.find(b => b.id === to)), fee = feeIn(type, a.cur), tc = type === 'own' ? accBy(to).cur : a.cur, got = conv(amtv, a.cur, tc); let when = 'now';
        const feeTxt = fee ? `${num(fee, dp(a.cur))} ${cur(a.cur)}` : t('Free'), fx = tc !== a.cur ? `<div><span>${t('Rate')}</span><b class="num">${rateTxt(a.cur)}</b></div><div><span>${t('You get')}</span><b class="num">${num(got, dp(tc))} ${cur(tc)}</b></div>` : '';
        sheet(`<h2>${t('Review transfer')}</h2><div class="amt disp" style="text-align:center;font-size:40px;font-weight:700;padding:8px 0">${num(amtv, dp(a.cur))} <small style="font-size:16px;color:var(--look-muted)">${cur(a.cur)}</small></div>
          <div class="kv"><div><span>${t('From')}</span><b>${tx(a.name)} <span class="num">•••• ${a.no}</span></b></div><div><span>${t('To')}</span><b>${esc(tgt)}</b></div>${fx}<div><span>${t('Fee')}</span><b class="num">${feeTxt}</b></div><div class="tot"><span>${t('Total')}</span><b class="num">${num(amtv + fee, dp(a.cur))} ${cur(a.cur)}</b></div></div>
          <div class="seg" id="wh" style="margin:6px 0 14px">${[['now', 'Now'], ['later', 'Tomorrow'], ['rep', 'Monthly']].map((s, i) => `<button data-w="${s[0]}" aria-selected="${i === 0}">${t(s[1])}</button>`).join('')}</div>
          <button class="btn" data-close="ok">${t('Confirm and authorise')}</button>`, {
          mount(sh) { $$('#wh button', sh).forEach(b => b.onclick = () => { when = b.dataset.w; $$('#wh button', sh).forEach(x => x.setAttribute('aria-selected', x === b)) }) },
          onClose: async v => { if (v !== 'ok') return; const ok = await authorize({ title: t('Confirm transfer'), amount: amtv, ccy: a.cur, rows: [[t('To'), esc(tgt)], ...(tc !== a.cur ? [[t('You get'), `${num(got, dp(tc))} ${cur(tc)}`]] : []), [t('Fee'), feeTxt]] }); if (!ok) return; await sleep(150); finish({ from: f, to, type, amt: amtv, fee, when, tgt, got }) }
        });
      };
    }
  };
});
function finish(o) {
  const a = accBy(o.from); if (o.when === 'now') { a.bal -= o.amt + o.fee; if (o.type === 'own') accBy(o.to).bal += o.got; TX.unshift({ id: 'T' + (84160 + (++S.sentCount)), d: 0, h: 10, en: o.tgt, ar: o.tgt, cat: 'tr', a: -o.amt, via: 'out', note: o.type === 'fast' || o.type === 'intl' ? 'Fast transfer' : 'Transfer', date: new Date(today) }) }
  go('done', { amt: o.amt, ccy: a.cur, tgt: o.tgt, later: o.when !== 'now', ref: 'FT' + (260100 + S.sentCount * 37), fee: o.fee });
}
reg('done', (p) => ({
  bar: false, body: `<div class="done"><div class="ck-w"><svg class="ck" viewBox="0 0 120 120"><circle class="c1" cx="60" cy="60" r="52" fill="none" stroke="var(--ok)" stroke-width="7" pathLength="1"/><path class="c2" d="M38 62 54 78 84 44" fill="none" stroke="var(--ok)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg></div>
    <h1 class="rv" style="--d:3">${p.title ? esc(p.title) : p.later ? t('Transfer scheduled') : t('Transfer sent')}</h1><div class="amt rv" style="--d:4">${bal(+p.amt || 0, esc(p.ccy), dp(p.ccy))}</div><p class="muted rv" style="--d:5">${t('Payment to {name}', { name: esc(p.tgt) })}</p>
    <div class="group rv" style="--d:6"><div class="row kvr"><div class="tx"><small>${t('Reference')}</small><b class="num">${esc(p.ref)}</b></div></div><div class="row kvr"><div class="tx"><small>${t('Date')}</small><b>${dateLbl(today, 1)} · ${timeLbl(today)}</b></div></div><div class="row kvr"><div class="tx"><small>${t('Status')}</small><b><span class="badge ok">${p.later ? t('Scheduled') : t('Completed')}</span></b></div></div></div>
    <div class="actions rv" style="--d:7"><button class="btn" data-act="finish">${t('Done')}</button><button class="btn text" data-act="sharerec" style="margin:auto">${ic('share', 's')}${t('Share receipt')}</button></div></div>`,
  mount(el) { $('.ck', el).classList.add('go'); setTimeout(() => confetti($('.app'), 30), 700) }
}));
A.sharerec = () => toast(T('Receipt shared', 'Reçu partagé', 'تمت مشاركة الإيصال'), 'share');
A.finish = () => tab('home');

/* ---------- beneficiaries / scheduled ---------- */
const benRow = b => `<button class="row" data-go="transfer" data-p='{"type":"fast","to":"${b.id}"}'><span class="av ${b.tone}">${init(benName(b))}</span><div class="tx"><b>${esc(benName(b))}</b><small>${esc(tx(b.bank))} · <span class="num">•••• ${b.no}</span></small></div>${b.fav ? ic('star', 'pos') : icf('chevron-right', 'muted')}</button>`;
reg('beneficiaries', () => ({
  title: t('Beneficiaries'), right: `<button class="ibtn" data-go="addben" aria-label="${t('Add beneficiary')}">${ic('plus')}</button>`,
  body: `<section class="sec" style="margin-top:8px"><h3>${t('Favourites')}</h3><div class="group">${BEN.filter(b => b.fav).map(benRow).join('')}</div></section><section class="sec"><h3>${t('All beneficiaries')}</h3><div class="group">${BEN.filter(b => !b.fav).map(benRow).join('')}</div></section>`
}));
reg('addben', () => ({
  title: t('Add beneficiary'), body: `<form class="form"><label class="field"><span>${t('Full name')}</span><input id="bn" value="${T('Ibrahim Saad', 'Ibrahim Saad', 'إبراهيم سعد')}"></label><label class="field sel"><span>${t('Bank')}</span><select id="bk"><option>Cedar Trust</option><option>Orbit</option><option>Pulse</option><option>Harbor Bank</option></select></label><label class="field"><span>${t('Account or IBAN')}</span><input id="bi" class="num" dir="ltr" value="LY52 0035 0007 0000 3318 04"></label></form><div class="actions"><button class="btn" id="sv">${t('Save beneficiary')}</button></div>`,
  mount(el) {
    $('#sv', el).onclick = () => {
      const n = $('#bn', el).value.trim().replace(/\s+/g, ' '), bk = $('#bk', el).value, digits = $('#bi', el).value.replace(/\D/g, '');
      if (!/\p{L}/u.test(n) || digits.length < 8) return toast(t('Enter a name and a full account number or IBAN'), 'warning');
      const no = digits.slice(-4); if (BEN.some(b => b.no === no && b.en === n)) return toast(t('This beneficiary is already saved'), 'info');
      BEN.push({ id: 'b' + (BEN.length + 1), en: n, ar: n, bank: [bk, bk, bk], no, tone: ['f1', 'f2', 'f3'][BEN.length % 3], fav: 0 }); back(); setTimeout(() => toast(t('Beneficiary added')), 350);
    };
  }
}));
reg('scheduled', () => ({
  title: t('Scheduled & standing'), right: `<button class="ibtn" data-go="transfer" data-p='{"type":"fast"}' aria-label="${t('New schedule')}">${ic('plus')}</button>`,
  body: `<section class="sec" style="margin-top:8px"><h3>${t('Standing orders')}</h3><div class="group"><div class="row"><div class="tx"><b>${t('Rent — Hana Rashid')}</b><small>${t('Monthly')} · ${t('Next: {d}', { d: dateLbl(new Date(today.getFullYear(), today.getMonth() + 1, 1)) })}</small></div><div class="end"><b class="num">1,200.000 ${cur('LYD')}</b></div></div><div class="row"><div class="tx"><b>${t('Savings top-up')}</b><small>${t('Weekly')} · ${t('Next: {d}', { d: dateLbl(dAgo(-3)) })}</small></div><div class="end"><b class="num">150.000 ${cur('LYD')}</b></div></div></div></section><section class="sec"><h3>${t('Scheduled')}</h3><div class="group"><div class="row"><div class="tx"><b>Omar Mansour</b><small>${dateLbl(dAgo(-6))}</small></div><div class="end"><b class="num">250.000 ${cur('LYD')}</b></div></div></div></section>`
}));

/* ---------- QR: LYPay / OnePay ---------- */
const SCH = { lypay: { n: 'LYPay', tag: '@layla.h' }, onepay: { n: 'OnePay', tag: 'layla.haddad@onepay' } };
reg('qrpay', (p) => {
  const sc = SCH[p.scheme || 'lypay'], cur_ = p.tab || 'scan';
  return {
    title: sc.n, right: `<button class="ibtn" data-act="tap" aria-label="${t('Tap to pay')}">${ic('tap-to-pay')}</button>`, body: `<div class="seg qtabs" role="tablist">${[['scan', 'Scan'], ['my', 'My QR'], ['send', 'Send'], ['req', 'Requests']].map(x => `<button data-q="${x[0]}" role="tab" aria-selected="${x[0] === cur_}">${t(x[1])}</button>`).join('')}</div><div id="qbody"></div>`,
    mount(el) {
      const host = $('#qbody', el); let timer;
      const views = {
        scan() {
          host.innerHTML = `<div class="cam"><div class="vf"><b class="k1"></b><b class="k2"></b><b class="k3"></b><b class="k4"></b><i class="ln"></i></div><span class="qhint">${t('Point at a QR code')}</span></div><div class="actions"><button class="btn outline" id="sim">${ic('camera')}${t('Scan from gallery')}</button></div>`;
          const hit = () => { if (top() !== el || !host.querySelector('.cam')) return; haptic(25); $('.vf', host).classList.add('hit'); $('.qhint', host).textContent = t('Code detected'); setTimeout(() => payMerchant(sc), 600) };
          $('#sim', host).onclick = hit; timer = setTimeout(hit, reduced() ? 600 : 2800);
        },
        my() {
          host.innerHTML = `<div class="myqr"><div class="qcard"><div class="qhead">${bmark(false)}<div><b>${esc(uname())}</b><small class="num">${sc.tag}</small></div></div><div class="qimg">${qrSvg(sc.n + 'layla', 29, 8)}</div><small class="muted">${t('Show this code to get paid')}</small><div class="qtimer"><span id="qt">${t('Code refreshes in {s}s', { s: 30 })}</span></div></div></div><div class="actions row2"><button class="btn outline" data-act="shareqr">${ic('share')}${t('Share')}</button><button class="btn outline" data-act="amtqr">${ic('edit')}${t('Set an amount')}</button></div>`;
          let s = 30; timer = setInterval(() => { s = s <= 1 ? 30 : s - 1; const e = $('#qt', host); if (e && el.isConnected) e.textContent = t('Code refreshes in {s}s', { s }); else clearInterval(timer) }, 1000);
        },
        send() { host.innerHTML = `<section class="sec" style="margin-top:14px"><h3>${t('Send to')}</h3><div class="group">${BEN.slice(0, 5).map(b => `<button class="row" data-go="transfer" data-p='{"type":"fast","to":"${b.id}"}'><span class="av ${b.tone}">${init(benName(b))}</span><div class="tx"><b>${esc(benName(b))}</b><small>${esc(tx(b.bank))}</small></div>${icf('chevron-right', 'muted')}</button>`).join('')}</div></section>` },
        req() {
          host.innerHTML = `<section class="sec" style="margin-top:14px"><h3>${t('Incoming')}</h3><div class="group">${reqRow(BEN[2], 75, 'Dinner last Friday')}${reqRow(BEN[3], 40, 'Concert tickets')}</div></section>`;
          host.onclick = async e => {
            const ap = e.target.closest('[data-ap]'), de = e.target.closest('[data-de]'); if (!ap && !de) return; const row = e.target.closest('.row');
            if (de) { row.style.transition = 'opacity .3s'; row.style.opacity = 0; setTimeout(() => row.remove(), 300); return toast(t('Request declined'), 'close') }
            const amt = +ap.dataset.ap; const ok = await authorize({ title: sc.n, amount: amt, rows: [[t('To'), $('b', row).textContent]] }); if (ok) { row.remove(); accBy('cur').bal -= amt; toast(t('Payment sent'), 'send') }
          };
        }
      };
      const show = k => { clearTimeout(timer); clearInterval(timer); host.onclick = null; $$('[data-q]', el).forEach(b => b.setAttribute('aria-selected', b.dataset.q === k)); views[k](); anim(host, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 }) };
      $$('[data-q]', el).forEach(b => b.onclick = () => show(b.dataset.q)); show(cur_);
    }
  };
});
const reqRow = (b, a, n) => `<div class="row reqr"><span class="av ${b.tone}">${init(benName(b))}</span><div class="tx"><b>${esc(benName(b))}</b><small>${t(n)}</small></div><div class="end"><b class="num">${num(a)} ${cur('LYD')}</b></div><div class="rb"><button class="btn sm outline" data-de>${t('Decline')}</button><button class="btn sm" data-ap="${a}">${t('Approve')}</button></div></div>`;
const MERCH = { amt: 840, n: 'Atlas Electronics', item: 'Wireless headphones' };
function payMerchant(sc) {
  const sh = sheet(`<h2>${t('Pay merchant')}</h2><div class="merch"><b>${MERCH.n}</b><small class="muted">${sc.n} · ${t(MERCH.item)}</small></div><div class="amt disp" style="text-align:center;font-size:40px;font-weight:700;padding:6px 0 14px">${num(MERCH.amt)} <small style="font-size:16px;color:var(--look-muted)">${cur('LYD')}</small></div>
    <button class="btn" data-close="ok">${t('Pay {amt}', { amt: moneyTxt(MERCH.amt) })}</button>
    <button class="mrow" data-close="mz" style="margin-top:8px;border-top:1px solid var(--look-line)"><img class="mzmark" src="assets/brand/${S.theme === 'dark' ? 'mizan-mark-reverse' : 'mizan-mark'}.svg" alt=""><div class="tx"><b>${t('Pay over time')}</b><small>${t('from {m} / month', { m: moneyTxt(MERCH.amt * 1.14 / 12) })}</small></div>${icf('chevron-right', 'muted')}</button>`, {
    onClose: async v => {
      if (v === 'mz') return go('mz-plans', { n: MERCH.n, item: MERCH.item, price: MERCH.amt });
      if (v !== 'ok') return; const ok = await authorize({ title: t('Pay merchant'), amount: MERCH.amt, rows: [[t('Merchant'), MERCH.n], [t('Fee'), t('Free')]] });
      if (ok) { accBy('cur').bal -= MERCH.amt; TX.unshift({ id: 'T84199', d: 0, h: 10, en: MERCH.n, ar: 'أطلس للإلكترونيات', cat: 'shop', a: -MERCH.amt, via: 'qr', note: sc.n, date: new Date(today) }); go('done', { amt: MERCH.amt, ccy: 'LYD', tgt: MERCH.n, ref: sc.n.slice(0, 2).toUpperCase() + '77031', fee: 0 }) }
    }
  });
}
A.shareqr = () => toast(T('QR shared', 'QR partagé', 'تمت مشاركة الرمز'), 'share');
A.amtqr = () => sheet(`<h2>${t('Set an amount')}</h2><div class="amt-big" style="padding:16px 0"><b style="font-size:48px">50.000</b><small>${cur('LYD')}</small></div><button class="btn" data-close="ok">${t('Done')}</button>`);

/* ---------- request money ---------- */
reg('request', () => ({
  title: t('Request money'), body: `<div class="amt-wrap"><div class="amt-top"><button class="row" id="tob"><span class="av ${BEN[2].tone}">${init(benName(BEN[2]))}</span><div class="tx"><small>${t('From whom')}</small><b>${esc(benName(BEN[2]))}</b></div>${ic('chevron-down', 'muted')}</button></div><div class="amt-big"><b>0</b><small>${cur('LYD')}</small></div><div class="amt-sub"></div>${keysHtml()}<div class="cta"><button class="btn" id="rs" disabled>${t('Continue')}</button></div></div>`,
  mount(el) {
    mountPad(el, { onChange: v => { const b = $('#rs', el); b.disabled = !(v > 0); b.textContent = v > 0 ? t('Request {amt}', { amt: moneyTxt(v) }) : t('Continue') } });
    $('#tob', el).onclick = () => sheet(`<h2>${t('From whom')}</h2><div style="margin-top:10px">${BEN.slice(0, 5).map(b => sheetBen(b)).join('')}</div>`, { mount(sh, close) { sh.addEventListener('click', e => { const b = e.target.closest('.pk'); if (b) { const bb = BEN.find(x => x.id === b.dataset.v); $('#tob', el).innerHTML = `<span class="av ${bb.tone}">${init(benName(bb))}</span><div class="tx"><small>${t('From whom')}</small><b>${esc(benName(bb))}</b></div>${ic('chevron-down', 'muted')}`; close() } }) } });
    $('#rs', el).onclick = () => { back(); setTimeout(() => toast(t('Request sent'), 'request'), 400) };
  }
}));

/* ---------- history + receipt ---------- */
reg('history', () => ({
  title: t('Transactions'), right: `<button class="ibtn" data-act="dl" aria-label="${t('Download PDF')}">${ic('download')}</button>`, skel: `${'<div class="skel-row"><div><span class="skel"></span><span class="skel"></span></div></div>'.repeat(8)}`,
  body: `<div class="searchbar pad"><label class="sb-in">${ic('search')}<input id="hq" type="search" placeholder="${t('Search transactions')}" aria-label="${t('Search')}"></label></div><div class="chips" id="hf" style="margin-top:14px">${[['all', 'All'], ['in', 'Money in'], ['out', 'Spending'], ['tr', 'Transfers'], ['bills', 'Bills']].map((c, i) => `<button class="chip" aria-pressed="${i === 0}" data-f="${c[0]}">${t(c[1])}</button>`).join('')}</div><div id="hl"></div>`,
  mount(el) {
    let f = 'all', qv = ''; const L_ = $('#hl', el);
    const draw = () => {
      const list = TX.filter(x => (f === 'all' || (f === 'in' && x.a > 0) || (f === 'out' && x.a < 0 && x.cat !== 'tr') || (f === 'tr' && x.cat === 'tr') || (f === 'bills' && x.cat === 'bills')) && (!qv || (txName(x) + ' ' + x.en).toLowerCase().includes(qv)));
      if (!list.length) { L_.innerHTML = `<div class="empty"><b>${t('No results')}</b><small>${t('Try another search')}</small></div>`; return }
      const days = [...new Set(list.map(x => x.d))]; L_.innerHTML = days.map(d => { const l = list.filter(x => x.d === d); return `${dayHead(d, l)}<div class="group">${l.map(txRow).join('')}</div>` }).join('');
    };
    draw(); $('#hq', el).oninput = e => { qv = e.target.value.toLowerCase().trim(); draw() }; $$('#hf .chip', el).forEach(c => c.onclick = () => { f = c.dataset.f; $$('#hf .chip', el).forEach(x => x.setAttribute('aria-pressed', x === c)); draw() });
  }
}));
reg('receipt', ({ id }) => {
  const x = TX.find(o => o.id === id) || TX[0], neg = x.a < 0, c = CATS[x.cat];
  return {
    title: t('View receipt'), body: `<div class="rc rv"><span class="gl" style="--c:${c.c}">${ic(x.cat === 'inc' ? 'arrow-down' : c.ic)}</span><b class="rn">${esc(txName(x))}</b><div class="amt">${neg ? '−' : '+'}${bal(Math.abs(x.a), 'LYD')}</div><span class="badge ok">${ic('check', 's')} ${t('Completed')}</span></div>
      <div class="group rv" style="--d:1;margin-top:20px"><div class="row kvr"><div class="tx"><small>${t('Date')}</small><b>${dateLbl(x.date, 1)} · ${timeLbl(x.date)}</b></div></div><div class="row kvr"><div class="tx"><small>${t('Category')}</small><b>${tx(c.n)}</b></div></div><div class="row kvr"><div class="tx"><small>${t('Channel')}</small><b>${t(x.note)}</b></div></div><div class="row kvr"><div class="tx"><small>${t('Reference')}</small><b class="num">${x.id}-LY</b></div></div><div class="row kvr"><div class="tx"><small>${t('From')}</small><b>${tx(ACC[0].name)} <span class="num">•••• 4821</span></b></div></div></div>
      <div class="actions rv" style="--d:2"><button class="btn" data-act="sharerec">${ic('share')}${t('Share receipt')}</button><button class="btn text" data-go="newticket" style="margin:auto">${t('Report a problem')}</button></div>`
  };
});
