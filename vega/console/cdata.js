// Invented, deterministic console data (seeded). Demonstration — simulated data.
import { rng, dayOff, NOW } from '../assets/core.js';
const R = rng('vega-console-2026');
const pick = a => a[Math.floor(R() * a.length)];
const ri = (a, b) => Math.floor(a + R() * (b - a + 1));
const hex = n => Array.from({ length: n }, () => '0123456789abcdef'[ri(0, 15)]).join('');

const FN = [['Amira', 'أميرة'], ['Karim', 'كريم'], ['Layla', 'ليلى'], ['Omar', 'عمر'], ['Nour', 'نور'], ['Yusuf', 'يوسف'], ['Mariam', 'مريم'], ['Hana', 'هناء'], ['Samir', 'سمير'], ['Rania', 'رانيا'], ['Tarek', 'طارق'], ['Dalia', 'داليا'], ['Faris', 'فارس'], ['Salma', 'سلمى'], ['Idris', 'إدريس'], ['Lina', 'لينا'], ['Walid', 'وليد'], ['Mona', 'منى'], ['Bashir', 'بشير'], ['Huda', 'هدى']];
const LN = [['Haddad', 'حداد'], ['Mansour', 'منصور'], ['Saidi', 'سعيدي'], ['Tahir', 'طاهر'], ['Barakat', 'بركات'], ['Zayed', 'زايد'], ['Rizk', 'رزق'], ['Jaber', 'جابر'], ['Nasser', 'ناصر'], ['Khalil', 'خليل'], ['Darwish', 'درويش'], ['Ammar', 'عمار'], ['Fahmy', 'فهمي'], ['Sabri', 'صبري']];
export const CITIES = [{ en: 'Harbor City', ar: 'مدينة الميناء' }, { en: 'Northgate', ar: 'البوابة الشمالية' }, { en: 'Oasis', ar: 'الواحة' }, { en: 'Mesa', ar: 'الهضبة' }, { en: 'Eastbay', ar: 'الخليج الشرقي' }];
const person = () => { const f = pick(FN), l = pick(LN); return { en: `${f[0]} ${l[0]}`, ar: `${f[1]} ${l[1]}` }; };

export const CUSTOMERS = Array.from({ length: 72 }, (_, i) => {
  const p = person(), tier = pick([0, 1, 1, 1, 2, 2, 2, 3]), s = R();
  return { id: 'C-' + (10400 + i), ...p, ph: `•••• 0${ri(100, 899)}`, tier, status: s < .84 ? 'active' : s < .9 ? 'frozen' : 'review', bal: Math.round(Math.pow(R(), 2.2) * [50000, 500000, 2500000, 9000000][tier]), joined: dayOff(ri(2, 420)), risk: Math.round(Math.pow(R(), 1.6) * 100), city: pick(CITIES), txn: ri(2, 240), ver: tier > 0 };
});
CUSTOMERS[0] = { ...CUSTOMERS[0], en: 'Amira Haddad', ar: 'أميرة حداد', tier: 1, status: 'active', bal: 428560, risk: 12 };

const TT = ['p2p', 'p2p', 'p2p', 'merchant', 'merchant', 'merchant', 'cashin', 'cashin', 'cashout', 'bill', 'bill', 'airtime', 'reversal'];
export const MERCHANTS = Array.from({ length: 34 }, (_, i) => {
  const n = [['Zaytun Café', 'مقهى الزيتونة'], ['Sahara Market', 'سوق الصحراء'], ['Atlas Pharmacy', 'صيدلية أطلس'], ['FuelGo', 'فيولغو'], ['Medina Bakery', 'مخبز المدينة'], ['CinéBleu', 'سينما بلو'], ['Olive & Co.', 'أوليف'], ['Qamar Books', 'مكتبة قمر'], ['Dune Taxi', 'تاكسي الكثبان'], ['Palm Grill', 'مشويات النخيل'], ['Nile Tech', 'نايل تك'], ['Cedar Hardware', 'أدوات الأرز']][i % 12];
  return { id: 'M-' + (3100 + i), en: n[0] + (i >= 12 ? ' #' + (Math.floor(i / 12) + 1) : ''), ar: n[1] + (i >= 12 ? ' ' + (Math.floor(i / 12) + 1) : ''), cat: pick(['food', 'groceries', 'health', 'transport', 'shopping', 'fun']), vol: ri(8, 480) * 10000, status: R() < .9 ? 'active' : 'onboarding', x: ri(6, 94), y: ri(8, 88), mdr: pick([.8, 1, 1.2, 1.5]), city: pick(CITIES) };
});
export const AGENTS = Array.from({ length: 26 }, (_, i) => {
  const n = [['Al-Noor Exchange', 'النور للصرافة'], ['Sahel Kiosk', 'كشك الساحل'], ['Blue Door Point', 'نقطة الباب الأزرق'], ['Medina Money', 'المدينة للمال'], ['Harbor Cash', 'كاش الميناء'], ['Oasis Pay Shop', 'متجر الواحة'], ['Mesa Mobile', 'موبايل الهضبة'], ['Eastbay Express', 'إكسبرس الخليج']][i % 8];
  const fl = ri(20, 300) * 10000, mx = 3000000, st0 = R();
  return { id: 'AG-' + (2200 + i), en: n[0] + (i >= 8 ? ' ' + (Math.floor(i / 8) + 1) : ''), ar: n[1] + (i >= 8 ? ' ' + (Math.floor(i / 8) + 1) : ''), float: fl, max: mx, status: st0 < .86 ? 'active' : st0 < .93 ? 'onboarding' : 'frozen', comm: pick([.4, .5, .6]), txn30: ri(80, 2400), x: ri(6, 94), y: ri(8, 88), city: pick(CITIES), tier: i < 4 ? 'super' : 'agent', rating: (4 + R()).toFixed(1) };
});
export const TXNS = Array.from({ length: 150 }, (_, i) => {
  const type = pick(TT), s = R(), c1 = pick(CUSTOMERS), c2 = pick(CUSTOMERS), m = pick(MERCHANTS), a = pick(AGENTS);
  const amt = Math.round(Math.pow(R(), 2.4) * 600000 + 500), fee = type === 'p2p' ? 0 : type === 'merchant' ? Math.round(amt * m.mdr / 100) : type === 'cashout' ? Math.max(50, Math.round(amt * .01)) : type === 'bill' ? 100 : 0;
  const from = type === 'cashin' ? a : type === 'merchant' ? c1 : type === 'cashout' ? c1 : c1, to = type === 'p2p' ? c2 : type === 'merchant' ? m : type === 'cashin' ? c1 : type === 'cashout' ? a : { en: pick(['Lumen Electric', 'Netline', 'AquaNorth']), ar: pick(['لومن', 'نت لاين', 'أكوا نورث']) };
  return { id: 'TX-' + (880000 + i * 7).toString(36).toUpperCase() + ri(10, 99), type, amt, fee, status: s < .915 ? 'done' : s < .955 ? 'pending' : s < .985 ? 'failed' : 'reversed', from, to, chan: pick(['app', 'app', 'app', 'agent', 'ussd', 'api']), t: new Date(NOW.getTime() - i * ri(40, 360) * 1000 * 4), idem: 'idem_' + hex(14), cust: c1.id };
});
export const KYC = [
  { id: 'KR-5101', en: 'Rania Fahmy', ar: 'رانيا فهمي', ago: 4, doc: 'ID card', live: 98, face: 96, hits: 0, risk: 'low', mism: [], dob: '14 Mar 1992', num: '••••• 4821', exp: '2031-06', from: 1, to: 2 },
  { id: 'KR-5102', en: 'Tarek Darwish', ar: 'طارق درويش', ago: 11, doc: 'Passport', live: 91, face: 88, hits: 1, risk: 'med', mism: ['name'], dob: '02 Nov 1986', num: '••••• 7710', exp: '2029-01', from: 1, to: 2 },
  { id: 'KR-5103', en: 'Dalia Sabri', ar: 'داليا صبري', ago: 19, doc: 'ID card', live: 99, face: 97, hits: 0, risk: 'low', mism: [], dob: '27 Jul 1999', num: '••••• 0392', exp: '2032-09', from: 0, to: 1 },
  { id: 'KR-5104', en: 'Faris Ammar', ar: 'فارس عمار', ago: 26, doc: 'Residence permit', live: 74, face: 71, hits: 0, risk: 'high', mism: ['dob', 'photo'], dob: '09 Jan 1990', num: '••••• 5543', exp: '2027-02', from: 1, to: 2 },
  { id: 'KR-5105', en: 'Salma Nasser', ar: 'سلمى ناصر', ago: 33, doc: 'ID card', live: 97, face: 95, hits: 0, risk: 'low', mism: [], dob: '30 May 1995', num: '••••• 2276', exp: '2030-12', from: 1, to: 2 },
  { id: 'KR-5106', en: 'Idris Jaber', ar: 'إدريس جابر', ago: 47, doc: 'Passport', live: 93, face: 90, hits: 2, risk: 'med', mism: [], dob: '18 Aug 1983', num: '••••• 8815', exp: '2028-04', from: 2, to: 3 }
];
export const RECON = {
  lines: [['ledger', 18240500, 18240500], ['partner', 18240500, 18238200], ['settle', 18238200, 18238200]],
  breaks: [
    { id: 'BR-301', kind: 'missing', amt: 120000, ref: 'TX-7K2M41', age: 2, st: 'open', note: 'Credit absent at partner bank' },
    { id: 'BR-302', kind: 'amount', amt: 1500, ref: 'TX-7J9A18', age: 1, st: 'open', note: 'Fee differs by 1.500' },
    { id: 'BR-303', kind: 'dup', amt: 45000, ref: 'TX-7H3C02', age: 3, st: 'open', note: 'Duplicate statement line' },
    { id: 'BR-304', kind: 'timing', amt: 80000, ref: 'TX-7G6P77', age: 0, st: 'open', note: 'Cut-off timing, expected next batch' },
    { id: 'BR-305', kind: 'amount', amt: 700, ref: 'TX-7F1D90', age: 5, st: 'resolved', note: 'Rounding adjustment approved' },
    { id: 'BR-306', kind: 'missing', amt: 22000, ref: 'TX-7E8Q63', age: 4, st: 'open', note: 'Agent cash-in not settled' }
  ],
  batches: [['SB-2610-A', 'Partner Bank 1', 8420000, 'settled'], ['SB-2610-B', 'Partner Bank 2', 5120300, 'settled'], ['SB-2610-C', 'Mobile operator', 2310000, 'pending'], ['SB-2610-D', 'Agent float', 2390200, 'pending']]
};
export const ALERTS = [
  ['Velocity: 12 sends in 10 min', 'C-10412', 'high', 6, 'open'], ['Structuring: repeated just-below-limit cash-ins', 'C-10431', 'high', 14, 'open'], ['New device + large cash-out', 'C-10405', 'med', 25, 'open'], ['Dormant wallet suddenly active', 'C-10450', 'med', 41, 'review'],
  ['Sanctions name-screen partial match', 'C-10418', 'high', 55, 'review'], ['Agent float spike', 'AG-2203', 'med', 70, 'open'], ['Failed PIN ×5 then success', 'C-10466', 'low', 95, 'resolved'], ['Merchant refund ratio 18%', 'M-3107', 'med', 130, 'open'], ['Geo-velocity: two cities in 20 min', 'C-10422', 'high', 180, 'open'], ['Mule pattern: many-to-one', 'C-10440', 'high', 210, 'review']
].map((a, i) => ({ id: 'AL-' + (7700 + i), rule: a[0], subj: a[1], sev: a[2], ago: a[3], st: a[4] }));
export const RULES = [
  ['Velocity per hour', 'More than N sends from one wallet in an hour', 8, 'alert', 1, 38], ['Structuring', 'Repeated amounts within 5% below tier limit', 3, 'hold', 1, 12], ['New device cash-out', 'Cash-out above amount from a device < 48h old', 5000, 'hold', 1, 21], ['Geo-velocity', 'Activity in two distant cities within 30 minutes', 1, 'block', 1, 4],
  ['Many-to-one inflow', 'Receiving from more than N distinct payers in a day', 15, 'alert', 1, 17], ['Dormant reactivation', 'Wallet inactive > 90 days with high-value txn', 2000, 'alert', 0, 9], ['Merchant refund ratio', 'Refund share above N% over 7 days', 15, 'alert', 1, 6], ['Name screening', 'Fuzzy match against sanction and PEP lists', 85, 'hold', 1, 5]
].map(r => ({ name: r[0], desc: r[1], thr: r[2], act: r[3], on: r[4], hits: r[5] }));
export const TIERS = [
  { id: 0, daily: 50000, month: 100000, bal: 100000, cin: 50000, cout: 0, per: 20000 }, { id: 1, daily: 500000, month: 2000000, bal: 1000000, cin: 200000, cout: 200000, per: 100000 },
  { id: 2, daily: 2500000, month: 10000000, bal: 5000000, cin: 1000000, cout: 1000000, per: 500000 }, { id: 3, daily: 10000000, month: 40000000, bal: 25000000, cin: 4000000, cout: 4000000, per: 2000000 }
];
export const FEES = [
  { id: 'p2p', model: 'flat', flat: 0, pct: 0, min: 0, max: 0, split: [100, 0, 0] }, { id: 'merchant', model: 'pct', flat: 0, pct: 1.2, min: 50, max: 5000, split: [70, 0, 30] }, { id: 'cashin', model: 'flat', flat: 0, pct: 0, min: 0, max: 0, split: [0, 100, 0] },
  { id: 'cashout', model: 'pct', flat: 0, pct: 1.0, min: 50, max: 2500, split: [45, 45, 10] }, { id: 'bill', model: 'flat', flat: 100, pct: 0, min: 100, max: 100, split: [60, 0, 40] }, { id: 'airtime', model: 'pct', flat: 0, pct: 2, min: 0, max: 0, split: [40, 0, 60] }
];
export const ROLES = [
  { id: 'admin', n: 6 }, { id: 'ops', n: 14 }, { id: 'compliance', n: 5 }, { id: 'finance', n: 4 }, { id: 'support', n: 22 }, { id: 'auditor', n: 3 }
];
export const PERMS = ['cust_view', 'cust_freeze', 'kyc_decide', 'txn_view', 'txn_reverse', 'limits_edit', 'fees_edit', 'recon_run', 'rules_edit', 'reports', 'roles_edit', 'brand_edit'];
export const MATRIX = {
  admin: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], ops: [1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0], compliance: [1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0], finance: [1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0], support: [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], auditor: [1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0]
};
export const STAFF = [['Nadia Farouk', 'نادية فاروق', 'admin'], ['Rami Soliman', 'رامي سليمان', 'ops'], ['Hiba Mostafa', 'هبة مصطفى', 'compliance'], ['Jad Karam', 'جاد كرم', 'finance'], ['Lamis Orfi', 'لميس عرفي', 'support'], ['Ziad Hakim', 'زياد حكيم', 'auditor'], ['Maha Salem', 'مها سالم', 'ops'], ['Tamer Aziz', 'تامر عزيز', 'compliance'], ['Dina Wahba', 'دينا وهبة', 'support']].map((s, i) => ({ en: s[0], ar: s[1], role: s[2], mfa: i !== 8, last: ri(1, 600), id: 'U-' + (40 + i) }));
export const AUDIT = [
  ['kyc.approve', 'Hiba Mostafa', 'KR-5101', 12], ['limits.publish_request', 'Jad Karam', 'Tier 2 daily limit', 31], ['txn.reverse_request', 'Rami Soliman', 'TX-7K2M41', 58], ['customer.freeze', 'Rami Soliman', 'C-10431', 92], ['rules.toggle', 'Hiba Mostafa', 'Dormant reactivation', 140], ['recon.run', 'Jad Karam', '2026-10-24', 210], ['roles.update', 'Nadia Farouk', 'support', 300], ['brand.publish', 'Nadia Farouk', 'v14', 420]
].map(a => ({ act: a[0], who: a[1], obj: a[2], ago: a[3] }));
export const REPORTS = [
  ['daily_txn', 'chart-line', 'Daily transaction summary', 'ملخص المعاملات اليومي', 'Daily', 'PDF · CSV'], ['float', 'wallet', 'Float & liquidity position', 'مركز السيولة والرصيد', 'Daily', 'PDF · XLSX'], ['aml', 'security-shield', 'AML / suspicious activity (STR)', 'الأنشطة المشبوهة', 'On demand', 'PDF'], ['revenue', 'coins', 'Revenue & fee split', 'الإيرادات وتوزيع الرسوم', 'Monthly', 'XLSX'],
  ['kyc_funnel', 'id-card', 'KYC funnel & turnaround', 'مسار التوثيق ومدته', 'Weekly', 'PDF'], ['agent_perf', 'location', 'Agent & merchant performance', 'أداء الوكلاء والتجار', 'Weekly', 'XLSX'], ['recon', 'swap-exchange', 'Reconciliation breaks', 'فروقات التسوية', 'Daily', 'CSV'], ['tax', 'invoice', 'Tax & regulatory returns', 'الإقرارات الضريبية والرقابية', 'Monthly', 'PDF']
].map(r => ({ id: r[0], icon: r[1], en: r[2], ar: r[3], freq: r[4], fmt: r[5] }));
export const DAYS = Array.from({ length: 30 }, (_, i) => { const d = dayOff(29 - i); const base = 3200 + i * 38; return { d, vol: Math.round(base * (1 + .18 * Math.sin(i / 2.2) + R() * .1)), cnt: Math.round((base / 2.1) * (1 + .15 * Math.cos(i / 2.7) + R() * .1)) }; });
