// Seed data. All names, numbers and codes are fictional.
import { add, dayOff, st } from '../assets/core.js';

export const ME = { en: 'Amira Haddad', ar: 'أميرة حداد', first: { en: 'Amira', fr: 'Amira', ar: 'أميرة' }, phone: '+000 91 555 0142', handle: '@amira.h', tier: 1 };

export const CONTACTS = [
  { id: 'c1', en: 'Karim Mansour', ar: 'كريم منصور', ph: '+000 92 555 0111', fav: 1 },
  { id: 'c2', en: 'Layla Saidi', ar: 'ليلى سعيدي', ph: '+000 91 555 0188', fav: 1 },
  { id: 'c3', en: 'Omar Tahir', ar: 'عمر طاهر', ph: '+000 94 555 0173', fav: 1 },
  { id: 'c4', en: 'Nour El-Din', ar: 'نور الدين', ph: '+000 92 555 0129', fav: 1 },
  { id: 'c5', en: 'Yusuf Barakat', ar: 'يوسف بركات', ph: '+000 93 555 0160', fav: 0 },
  { id: 'c6', en: 'Mariam Zayed', ar: 'مريم زايد', ph: '+000 91 555 0154', fav: 0 },
  { id: 'c7', en: 'Hana Rizk', ar: 'هناء رزق', ph: '+000 94 555 0137', fav: 0 },
  { id: 'c8', en: 'Samir Jaber', ar: 'سمير جابر', ph: '+000 92 555 0199', fav: 0 }
];

export const MERCH = [
  { id: 'm1', en: 'Zaytun Café', ar: 'مقهى الزيتونة', cat: 'food', icon: 'shopping-bag', cb: 5 },
  { id: 'm2', en: 'Sahara Market', ar: 'سوق الصحراء', cat: 'groceries', icon: 'shopping-bag', cb: 3 },
  { id: 'm3', en: 'Atlas Pharmacy', ar: 'صيدلية أطلس', cat: 'health', icon: 'insurance', cb: 2 },
  { id: 'm4', en: 'FuelGo Station', ar: 'محطة فيولغو', cat: 'transport', icon: 'location', cb: 1 },
  { id: 'm5', en: 'Medina Bakery', ar: 'مخبز المدينة', cat: 'food', icon: 'shopping-bag', cb: 5 },
  { id: 'm6', en: 'CinéBleu', ar: 'سينما بلو', cat: 'fun', icon: 'star', cb: 8 },
  { id: 'm7', en: 'Olive & Co. Fashion', ar: 'أوليف للأزياء', cat: 'shopping', icon: 'category-tag', cb: 4 },
  { id: 'm8', en: 'Qamar Books', ar: 'مكتبة قمر', cat: 'shopping', icon: 'category-tag', cb: 6 }
];

export const AGENTS = [
  { id: 'a1', en: 'Al-Noor Exchange', ar: 'النور للصرافة', d: 0.3, open: 1, rating: 4.9, cash: 'high', hrs: '08:00–22:00', x: 118, y: 108 },
  { id: 'a2', en: 'Sahel Kiosk', ar: 'كشك الساحل', d: 0.6, open: 1, rating: 4.7, cash: 'med', hrs: '07:00–23:00', x: 238, y: 74 },
  { id: 'a3', en: 'Blue Door Pharmacy Point', ar: 'نقطة الباب الأزرق', d: 0.9, open: 1, rating: 4.8, cash: 'high', hrs: '24h', x: 292, y: 168 },
  { id: 'a4', en: 'Medina Money Point', ar: 'نقطة المدينة للمال', d: 1.4, open: 0, rating: 4.5, cash: 'low', hrs: '09:00–18:00', x: 64, y: 186 }
];

export const BILLERS = {
  electricity: [{ id: 'b1', en: 'Lumen Electric', ar: 'لومن للكهرباء' }, { id: 'b2', en: 'GridCo Power', ar: 'غريد كو للطاقة' }],
  water: [{ id: 'b3', en: 'AquaNorth Water', ar: 'مياه أكوا نورث' }],
  internet: [{ id: 'b4', en: 'Netline Broadband', ar: 'نت لاين للإنترنت' }, { id: 'b5', en: 'Skyfiber Home', ar: 'سكاي فايبر' }],
  gas: [{ id: 'b6', en: 'CityGas', ar: 'سيتي غاز' }],
  tv: [{ id: 'b7', en: 'Oasis TV', ar: 'واحة التلفزيون' }],
  edu: [{ id: 'b8', en: 'Horizon Academy', ar: 'أكاديمية الأفق' }],
  tax: [{ id: 'b9', en: 'Municipal Services', ar: 'الخدمات البلدية' }],
  ins: [{ id: 'b10', en: 'Shield Insurance', ar: 'شيلد للتأمين' }]
};
export const TELCOS = [
  { id: 'o1', en: 'Pulse Mobile', ar: 'بولس موبايل', hue: 1 }, { id: 'o2', en: 'Aurora Telecom', ar: 'أورورا للاتصالات', hue: 2 }, { id: 'o3', en: 'Nimbus', ar: 'نيمبوس', hue: 3 }
];

export const CATS = {
  food: ['Food & drink', 'Restauration', 'مطاعم ومقاهي'], groceries: ['Groceries', 'Courses', 'بقالة'], transport: ['Transport', 'Transport', 'مواصلات'], bills: ['Bills', 'Factures', 'فواتير'],
  shopping: ['Shopping', 'Shopping', 'تسوق'], health: ['Health', 'Santé', 'صحة'], fun: ['Leisure', 'Loisirs', 'ترفيه'], transfers: ['Transfers', 'Virements', 'تحويلات'], other: ['Other', 'Autres', 'أخرى']
};
Object.entries(CATS).forEach(([k, v]) => add({ ['cat_' + k]: v.join('§') }));

const T = (id, type, who, amt, d, h, status = 'done', extra = {}) => ({ id, type, who, amt, date: dayOff(d, h, (id * 7) % 60), status, ref: 'VG-' + (7000 + id * 53).toString(36).toUpperCase() + (100 + id * 11), ...extra });
export const TXNS = [
  T(1, 'pay', 'm1', -1850, 0, 9, 'done', { cat: 'food', note: '' }),
  T(2, 'receive', 'c2', 15000, 0, 8, 'done', { note: 'Rent share' }),
  T(3, 'cashback', null, 92, 0, 9, 'done', { cat: 'other' }),
  T(4, 'send', 'c1', -4500, 1, 20, 'done', { note: 'Dinner ✓' }),
  T(5, 'pay', 'm2', -12740, 1, 17, 'done', { cat: 'groceries' }),
  T(6, 'bill', 'b1', -8650, 2, 11, 'done', { cat: 'bills', acct: '•••• 4417' }),
  T(7, 'cashin', 'a1', 50000, 3, 15, 'done', {}),
  T(8, 'airtime', 'o1', -2000, 3, 10, 'done', { cat: 'bills' }),
  T(9, 'pay', 'm4', -6000, 4, 18, 'done', { cat: 'transport' }),
  T(10, 'send', 'c3', -2500, 4, 13, 'pending', {}),
  T(11, 'pay', 'm6', -3400, 5, 21, 'done', { cat: 'fun' }),
  T(12, 'receive', 'c4', 8000, 6, 12, 'done', {}),
  T(13, 'pay', 'm3', -2260, 6, 16, 'done', { cat: 'health' }),
  T(14, 'bill', 'b4', -9900, 7, 9, 'done', { cat: 'bills', acct: '•••• 2290' }),
  T(15, 'cashout', 'a2', -20000, 8, 14, 'done', {}),
  T(16, 'pay', 'm5', -950, 8, 8, 'done', { cat: 'food' }),
  T(17, 'send', 'c6', -3000, 9, 19, 'failed', {}),
  T(18, 'pay', 'm7', -18900, 10, 16, 'done', { cat: 'shopping' }),
  T(19, 'exchange', null, -10000, 11, 12, 'done', { note: 'LYD → USD' }),
  T(20, 'receive', 'c5', 12000, 12, 18, 'done', {}),
  T(21, 'pay', 'm8', -4200, 13, 15, 'done', { cat: 'shopping' }),
  T(22, 'pay', 'm2', -9120, 14, 17, 'done', { cat: 'groceries' }),
  T(23, 'send', 'c7', -6000, 16, 12, 'done', {}),
  T(24, 'cashin', 'a3', 30000, 18, 11, 'done', {})
];

export const POCKETS = [
  { id: 'p1', name: { en: 'Summer trip', fr: 'Voyage d’été', ar: 'رحلة الصيف' }, icon: 'location', saved: 184000, goal: 300000, rule: 'weekly', amt: 5000, f: 1 },
  { id: 'p2', name: { en: 'Emergency fund', fr: 'Fonds d’urgence', ar: 'صندوق الطوارئ' }, icon: 'security-shield', saved: 520000, goal: 800000, rule: 'roundup', amt: 0, f: 2, locked: 1 },
  { id: 'p3', name: { en: 'New laptop', fr: 'Nouvel ordinateur', ar: 'حاسوب جديد' }, icon: 'phone', saved: 62000, goal: 450000, rule: 'weekly', amt: 2500, f: 3 }
];

export const CARDS = [
  { id: 'k1', kind: 'virtual', last4: '4291', exp: '09/29', frozen: 0 },
  { id: 'k2', kind: 'physical', last4: '8830', exp: '03/30', frozen: 0, status: 'shipping' }
];

export const NOTIFS = [
  { id: 1, ic: 'receive', k: 'n_recv', who: 'c2', amt: 15000, d: 0, h: 8, unread: 1 },
  { id: 2, ic: 'star', k: 'n_cb', amt: 92, d: 0, h: 9, unread: 1 },
  { id: 3, ic: 'id-card', k: 'n_kyc', d: 1, h: 10, unread: 1 },
  { id: 4, ic: 'security-shield', k: 'n_sec', d: 2, h: 22, unread: 0 },
  { id: 5, ic: 'bill', k: 'n_bill', d: 3, h: 9, unread: 0 },
  { id: 6, ic: 'users', k: 'n_ref', d: 5, h: 13, unread: 0 }
];

export const S = {
  balance: 428560, pending: 2500, usd: 18240,
  txns: TXNS.map(x => ({ ...x })), pockets: POCKETS.map(x => ({ ...x })), cards: CARDS.map(x => ({ ...x })),
  rewards: { cashback: 4150, points: 2860, tier: 'Silver', streak: 4 },
  kyc: { tier: 1 },
  month: [310, 280, 355, 420, 390, 465, 410, 520, 480, 430, 395, 450]
};
/* wallets shown as the swipeable card stack on Home */
export const WALLETS = [
  { id: 'main', tone: 'coral', cur: 'LYD', name: { en: 'Main wallet', fr: 'Portefeuille principal', ar: 'المحفظة الرئيسية' }, no: '0142' },
  { id: 'save', tone: 'teal', cur: 'LYD', name: { en: 'Savings pot', fr: 'Cagnotte épargne', ar: 'حصّالة الادخار' }, no: '0377' },
  { id: 'usd', tone: 'navy', cur: 'USD', name: { en: 'USD wallet', fr: 'Portefeuille USD', ar: 'محفظة الدولار' }, no: '0518' },
  { id: 'card', tone: 'sand', cur: 'LYD', name: { en: 'Vega Card', fr: 'Carte Vega', ar: 'بطاقة فيغا' }, no: '8830', card: 1 }
];
export const walBal = w => w.id === 'main' || w.id === 'card' ? S.balance : w.id === 'save' ? S.pockets.reduce((a, p) => a + p.saved, 0) : S.usd;
export const RATE_USD = 4.86;
export const person = id => CONTACTS.find(c => c.id === id);
export const merchant = id => MERCH.find(c => c.id === id);
export const agent = id => AGENTS.find(c => c.id === id);
export const biller = id => Object.values(BILLERS).flat().find(c => c.id === id);
export const telco = id => TELCOS.find(c => c.id === id);
export const whoName = (x) => { const o = person(x) || merchant(x) || agent(x) || biller(x) || telco(x); return o ? (st.lang === 'ar' ? o.ar : o.en) : ''; };
export function addTxn(o) { const x = { id: S.txns.length + 1, date: new Date(), status: 'done', ref: o.ref, ...o }; S.txns.unshift(x); S.balance += x.amt; return x; }
