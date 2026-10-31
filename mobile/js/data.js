// Fictional sample data: invented names, balances and transactions.
import { T, tx, dAgo, S } from './util.js';
export const USER = { en: 'Layla Haddad', ar: 'ليلى حداد', first: ['Layla', 'Layla', 'ليلى'], id: '30417' };
export const uname = () => T(USER.en, USER.en, USER.ar);
export const BANK = ['Neptune', 'Neptune', 'نبتون'];
export const bankName = () => tx(BANK);

export const ACC = [
  { id: 'cur', name: ['Current account', 'Compte courant', 'الحساب الجاري'], no: '4821', iban: 'LY83 0021 0004 0000 4821 77', cur: 'LYD', bal: 12480.25, ic: 'wallet', tone: '' },
  { id: 'sav', name: ['Savings account', 'Compte épargne', 'حساب التوفير'], no: '7730', iban: 'LY41 0021 0004 0000 7730 12', cur: 'LYD', bal: 48920.00, ic: 'savings', tone: 'f2' },
  { id: 'usd', name: ['Dollar account', 'Compte en dollars', 'حساب الدولار'], no: '1192', iban: 'LY12 0021 0004 0001 1192 03', cur: 'USD', bal: 2315.40, ic: 'coins', tone: 'f3' },
  { id: 'wal', name: ['Mobile wallet', 'Portefeuille mobile', 'المحفظة الإلكترونية'], no: '0066', iban: '—', cur: 'LYD', bal: 640.50, ic: 'phone', tone: '' },
];
export const accBy = id => ACC.find(a => a.id === id);
export const TOTAL_LYD = () => ACC.filter(a => a.cur === 'LYD').reduce((s, a) => s + a.bal, 0) + 2315.40 * 4.88;

export const BEN = [
  { id: 'b1', en: 'Omar Mansour', ar: 'عمر منصور', bank: ['Cedar Trust', 'Cedar Trust', 'سيدار ترست'], no: '3302', tone: 'f1', fav: 1 },
  { id: 'b2', en: 'Salma Farouk', ar: 'سلمى فاروق', bank: ['Orbit', 'Orbit', 'أوربت'], no: '9015', tone: 'f2', fav: 1 },
  { id: 'b3', en: 'Youssef Karam', ar: 'يوسف كرم', bank: ['Harbor Bank', 'Harbor Bank', 'بنك هاربر'], no: '5521', tone: 'f3', fav: 1 },
  { id: 'b4', en: 'Nadia Idris', ar: 'نادية إدريس', bank: ['Pulse', 'Pulse', 'بالس'], no: '2284', tone: 'f1', fav: 0 },
  { id: 'b5', en: 'Karim & Sons Trading', ar: 'كريم وأولاده للتجارة', bank: ['Neptune', 'Neptune', 'نبتون'], no: '7719', tone: 'f2', fav: 0 },
  { id: 'b6', en: 'Hana Rashid', ar: 'هناء رشيد', bank: ['Cedar Trust', 'Cedar Trust', 'سيدار ترست'], no: '6140', tone: 'f3', fav: 0 },
];
export const benName = b => T(b.en, b.en, b.ar);

export const CATS = {
  food: { n: ['Food & dining', 'Restauration', 'مطاعم وطعام'], c: '#EB4E4D', ic: 'shopping-bag' },
  shop: { n: ['Shopping', 'Achats', 'تسوق'], c: '#E39A2D', ic: 'category-tag' },
  bills: { n: ['Bills & utilities', 'Factures', 'فواتير وخدمات'], c: '#2AA6DA', ic: 'bill' },
  trans: { n: ['Transport', 'Transport', 'مواصلات'], c: '#00A8AE', ic: 'location' },
  fun: { n: ['Leisure', 'Loisirs', 'ترفيه'], c: '#D9569E', ic: 'star' },
  inc: { n: ['Income', 'Revenus', 'دخل'], c: '#1E9E6A', ic: 'arrow-down' },
  tr: { n: ['Transfers', 'Virements', 'تحويلات'], c: '#5B7391', ic: 'transfer' },
};
// d: days ago, h hour, a signed amount LYD
const raw = [
  [0, 9, 'Bakery Al Nakheel', 'مخبز النخيل', 'food', -14.5, 'card', 'Card ••4821'], [0, 8, 'Metro fare top-up', 'شحن بطاقة المترو', 'trans', -20, 'wal', 'Wallet'],
  [1, 19, 'Omar Mansour', 'عمر منصور', 'tr', -250, 'out', 'Fast transfer'], [1, 13, 'Greenfield Market', 'سوق جرينفيلد', 'food', -86.3, 'card', 'Card ••4821'],
  [2, 20, 'Cinema Lumière', 'سينما لوميير', 'fun', -45, 'card', 'Card ••4821'], [2, 11, 'Salma Farouk', 'سلمى فاروق', 'tr', 120, 'in', 'LYPay'],
  [3, 9, 'Electricity — monthly', 'الكهرباء — شهري', 'bills', -74.8, 'bill', 'Bill payment'], [4, 15, 'Atlas Fashion', 'أطلس للأزياء', 'shop', -310, 'card', 'Card ••4821'],
  [5, 10, 'Salary — Delta Logistics', 'راتب — دلتا للوجستيات', 'inc', 6200, 'in', 'Standing credit'], [6, 18, 'Fuel station 12', 'محطة وقود 12', 'trans', -60, 'card', 'Card ••4821'],
  [7, 12, 'Mobile top-up', 'شحن رصيد الهاتف', 'bills', -30, 'bill', 'Top-up'], [8, 14, 'Blue Harbor Café', 'مقهى الميناء الأزرق', 'food', -38.2, 'card', 'Card ••4821'],
  [9, 17, 'Youssef Karam', 'يوسف كرم', 'tr', 400, 'in', 'OnePay'], [10, 10, 'Streaming subscription', 'اشتراك بث', 'fun', -22, 'card', 'Card ••4821'],
  [11, 16, 'Home Depot Plus', 'هوم ديبو بلس', 'shop', -189.9, 'card', 'Card ••4821'], [12, 9, 'Internet — monthly', 'الإنترنت — شهري', 'bills', -95, 'bill', 'Bill payment'],
  [13, 20, 'Zayn Restaurant', 'مطعم زين', 'food', -112.4, 'card', 'Card ••4821'], [14, 11, 'Savings round-up', 'تجميع الفكة', 'tr', -18.35, 'out', 'Round-ups'],
  [16, 13, 'Pharmacy Noor', 'صيدلية نور', 'shop', -54.6, 'card', 'Card ••4821'], [18, 9, 'Water — monthly', 'المياه — شهري', 'bills', -28, 'bill', 'Bill payment'],
  [20, 18, 'Hana Rashid', 'هناء رشيد', 'tr', -150, 'out', 'Fast transfer'], [22, 10, 'Salary — Delta Logistics', 'راتب — دلتا للوجستيات', 'inc', 6200, 'in', 'Standing credit'],
];
export const TX = raw.map((r, i) => ({ id: 'T' + (84120 + 40 - i), d: r[0], h: r[1], en: r[2], ar: r[3], cat: r[4], a: r[5], via: r[6], note: r[7], date: (() => { const x = dAgo(r[0]); x.setHours(r[1], (i * 7) % 60); return x })() }));
export const txName = x => T(x.en, x.en, x.ar);
export const spendByCat = () => { const m = {}; TX.filter(x => x.a < 0 && x.cat !== 'tr').forEach(x => m[x.cat] = (m[x.cat] || 0) + -x.a); return Object.entries(m).map(([k, v]) => ({ k, v, c: CATS[k].c })).sort((a, b) => b.v - a.v) };

export const CARDS = [
  { id: 'c1', kind: ['Debit', 'Débit', 'خصم مباشر'], name: ['Everyday debit', 'Débit quotidien', 'بطاقة الخصم اليومية'], no: '4821', exp: '09/29', net: 'visa', acc: 'cur', style: 0 },
  { id: 'c2', kind: ['Credit', 'Crédit', 'ائتمان'], name: ['Platinum credit', 'Crédit Platinum', 'ائتمان بلاتينيوم'], no: '9034', exp: '02/28', net: 'mc', acc: 'cur', style: 1, limit: 20000, used: 6420 },
  { id: 'c3', kind: ['Virtual', 'Virtuelle', 'افتراضية'], name: ['Online shopping', 'Achats en ligne', 'التسوق عبر الإنترنت'], no: '7716', exp: '11/27', net: 'visa', acc: 'cur', style: 2, virt: 1 },
];
export const BILLERS = {
  power: { n: ['Electricity', 'Électricité', 'الكهرباء'], ic: 'bolt', billers: [['National Power Co.', 'الشركة الوطنية للكهرباء'], ['City Grid Services', 'خدمات شبكة المدينة']], due: 74.8 },
  water: { n: ['Water', 'Eau', 'المياه'], ic: 'drop', billers: [['Aqua Utility', 'مرفق أكوا']], due: 28 },
  net: { n: ['Internet', 'Internet', 'الإنترنت'], ic: 'globe', billers: [['FiberNet', 'فايبر نت'], ['Skyline Broadband', 'سكاي لاين']], due: 95 },
  tv: { n: ['TV & streaming', 'TV & streaming', 'التلفاز والبث'], ic: 'tv', billers: [['StreamBox', 'ستريم بوكس']], due: 22 },
  edu: { n: ['Education', 'Éducation', 'التعليم'], ic: 'id-card', billers: [['Horizon Academy', 'أكاديمية الأفق']], due: 1200 },
  ins: { n: ['Insurance', 'Assurance', 'التأمين'], ic: 'insurance', billers: [['Shield Insurance', 'شيلد للتأمين']], due: 215 },
  gov: { n: ['Fees & fines', 'Taxes & amendes', 'رسوم وغرامات'], ic: 'invoice', billers: [['Civil Registry', 'السجل المدني'], ['Traffic Authority', 'هيئة المرور']], due: 40 },
  don: { n: ['Donations', 'Dons', 'تبرعات'], ic: 'heart', billers: [['Helping Hands Fund', 'صندوق الأيادي المعطاءة']], due: 0 },
};
export const OPS = [{ id: 'o1', n: 'Zephyr Mobile', ar: 'زيفير موبايل', c: '#3BC1EE' }, { id: 'o2', n: 'Comet Telecom', ar: 'كوميت للاتصالات', c: '#EB4E4D' }, { id: 'o3', n: 'Lumen Net', ar: 'لومن نت', c: '#8F7BE8' }];
export const RATES = [
  ['USD', 4.88, 4.93, [4.80, 4.82, 4.81, 4.85, 4.84, 4.87, 4.88]], ['EUR', 5.26, 5.32, [5.30, 5.28, 5.29, 5.27, 5.25, 5.26, 5.26]],
  ['GBP', 6.11, 6.18, [6.02, 6.05, 6.08, 6.07, 6.10, 6.12, 6.11]], ['TRY', 0.142, 0.149, [0.15, 0.149, 0.147, 0.146, 0.145, 0.143, 0.142]],
];
export const NOTES = [
  { ic: 'transfer', t: ['Transfer received', 'Virement reçu', 'تم استلام تحويل'], s: ['Salma Farouk sent you 120.00 LYD', 'Salma Farouk vous a envoyé 120,00 LYD', 'أرسلت لك سلمى فاروق 120.00 د.ل'], ago: ['2h', '2 h', 'منذ ساعتين'], tone: 'ok', unread: 1 },
  { ic: 'request', t: ['Payment request', 'Demande de paiement', 'طلب دفع'], s: ['Youssef Karam requests 75.00 LYD', 'Youssef Karam demande 75,00 LYD', 'يطلب يوسف كرم 75.00 د.ل'], ago: ['5h', '5 h', 'منذ 5 ساعات'], tone: 'warn', unread: 1 },
  { ic: 'security-shield', t: ['New device sign-in blocked', 'Connexion bloquée sur nouvel appareil', 'تم حظر دخول من جهاز جديد'], s: ['Review it in the Security centre', 'À vérifier dans le Centre de sécurité', 'راجعه في مركز الأمان'], ago: ['Yesterday', 'Hier', 'أمس'], tone: 'bad', unread: 1 },
  { ic: 'bill', t: ['Bill due soon', 'Facture à échéance', 'فاتورة مستحقة قريباً'], s: ['Internet — 95.00 LYD due in 3 days', 'Internet — 95,00 LYD dans 3 jours', 'الإنترنت — 95.00 د.ل خلال 3 أيام'], ago: ['Yesterday', 'Hier', 'أمس'], tone: '' },
  { ic: 'goal', t: ['Goal on track', 'Objectif en bonne voie', 'الهدف على المسار'], s: ['Summer trip is 68% funded', 'Voyage d\'été financé à 68 %', 'رحلة الصيف ممولة بنسبة 68%'], ago: ['2d', '2 j', 'منذ يومين'], tone: 'f2' },
];
export const GOALS = [
  { id: 'g1', n: ['Summer trip', 'Voyage d\'été', 'رحلة الصيف'], t: 6000, s: 4080, ic: 'location', c: 'var(--look-accent)' },
  { id: 'g2', n: ['New laptop', 'Nouvel ordinateur', 'حاسوب جديد'], t: 3500, s: 1225, ic: 'phone', c: 'var(--look-brand)' },
  { id: 'g3', n: ['Emergency fund', 'Fonds d\'urgence', 'صندوق الطوارئ'], t: 15000, s: 11250, ic: 'security-shield', c: '#41B983' },
];
export const DEVICES = [
  { n: ['Layla\'s phone', 'Téléphone de Layla', 'هاتف ليلى'], os: ['Phone · Today', 'Téléphone · Aujourd\'hui', 'هاتف · اليوم'], ok: 1, cur: 1 },
  { n: ['Family tablet', 'Tablette familiale', 'جهاز لوحي عائلي'], os: ['Tablet · 6 days ago', 'Tablette · il y a 6 j', 'جهاز لوحي · قبل 6 أيام'], ok: 1 },
  { n: ['Unrecognised phone', 'Téléphone inconnu', 'هاتف غير معروف'], os: ['Sign-in blocked · Yesterday, 23:12 · City unknown', 'Connexion bloquée · Hier 23:12 · Ville inconnue', 'تم حظر الدخول · أمس 23:12 · مدينة غير معروفة'], ok: 0 },
];
