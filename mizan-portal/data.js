/* Neptune Mizan portal — SIMULATED DATA ONLY. Every name, number and identifier is invented. */
const NOW = new Date("2026-09-14T09:30:00Z");
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hex = (seed, n = 64) => { const r = rng(seed); let s = ""; while (s.length < n) s += Math.floor(r() * 16).toString(16); return s; };

const BANK = { id: "LY-WAHAT", name: ["Al Wahat Bank", "بنك الواحة"], node: "mizan-node-wahat-01" };

const PEERS = [
  { id: "sahel", name: ["Sahel Commercial Bank", "مصرف الساحل التجاري"], roles: ["MERCHANT_BANK"], state: "UAT_ACTIVE", caps: ["QUOTE", "RESERVE", "PURCHASE_ORDER", "FULFILMENT_EVIDENCE"], certDays: 212, fp: hex(11, 16), msgs: 41, p95: 380, limit: 250000 },
  { id: "tibesti", name: ["Tibesti Bank", "مصرف تبستي"], roles: ["MERCHANT_BANK", "FINANCING_BANK"], state: "UAT_ACTIVE", caps: ["QUOTE", "RESERVE", "PURCHASE_ORDER"], certDays: 47, fp: hex(12, 16), msgs: 23, p95: 610, limit: 150000 },
  { id: "cyrene", name: ["Cyrene Islamic Bank", "مصرف قورينا الإسلامي"], roles: ["MERCHANT_BANK"], state: "CANDIDATE", caps: ["QUOTE"], certDays: 0, fp: hex(13, 16), msgs: 0, p95: 0, limit: 0 },
  { id: "fezzan", name: ["Fezzan Trade Bank", "مصرف فزان التجاري"], roles: ["MERCHANT_BANK"], state: "SUSPENDED", caps: ["QUOTE", "RESERVE"], certDays: -9, fp: hex(14, 16), msgs: 6, p95: 1900, limit: 0 }
];

const MERCHANTS = [
  { id: "MRC-1001", name: ["Medina Home Appliances", "مدينة للأجهزة المنزلية"], bank: "sahel", sector: ["Household appliances", "أجهزة منزلية"], city: ["Tripoli", "طرابلس"], dd: "APPROVED", vol: 184200, disp: 0.8, since: "2026-02-10", review: "2026-08-02", checks: [1, 1, 1, 1, 1, 1] },
  { id: "MRC-1002", name: ["Tripoli Tech Hub", "مركز طرابلس للتقنية"], bank: "sahel", sector: ["Electronics", "إلكترونيات"], city: ["Tripoli", "طرابلس"], dd: "APPROVED", vol: 126800, disp: 1.9, since: "2026-03-01", review: "2026-07-21", checks: [1, 1, 1, 1, 1, 1] },
  { id: "MRC-1003", name: ["Green Sun Energy", "الشمس الخضراء للطاقة"], bank: "tibesti", sector: ["Solar & power", "الطاقة الشمسية"], city: ["Misrata", "مصراتة"], dd: "ENHANCED_DD", vol: 98400, disp: 2.6, since: "2026-04-18", review: "2026-08-30", checks: [1, 1, 0, 1, 1, 1] },
  { id: "MRC-1004", name: ["Al Noor Furniture", "النور للأثاث"], bank: "tibesti", sector: ["Furniture", "أثاث"], city: ["Benghazi", "بنغازي"], dd: "APPROVED", vol: 72100, disp: 1.1, since: "2026-03-22", review: "2026-06-15", checks: [1, 1, 1, 1, 1, 1] },
  { id: "MRC-1005", name: ["Fezzan Equipment Co.", "فزان للمعدات"], bank: "sahel", sector: ["Productive equipment", "معدات إنتاجية"], city: ["Sebha", "سبها"], dd: "EXPIRED_DOCS", vol: 54000, disp: 3.4, since: "2026-05-02", review: "2026-05-30", checks: [1, 0, 1, 1, 1, 1] },
  { id: "MRC-1006", name: ["Bright Start Stationers", "البداية المشرقة للقرطاسية"], bank: "sahel", sector: ["Education supplies", "مستلزمات تعليمية"], city: ["Zawiya", "الزاوية"], dd: "APPROVED", vol: 31800, disp: 0.4, since: "2026-06-04", review: "2026-08-12", checks: [1, 1, 1, 1, 1, 1] },
  { id: "MRC-1007", name: ["Cyrene Cooling", "قورينا للتبريد"], bank: "tibesti", sector: ["Air conditioning", "تكييف"], city: ["Al Bayda", "البيضاء"], dd: "PENDING_REVIEW", vol: 0, disp: 0, since: "2026-09-03", review: "—", checks: [1, 1, 0, 0, 0, 1] },
  { id: "MRC-1008", name: ["Zawiya Scooters", "الزاوية للدراجات"], bank: "tibesti", sector: ["Vehicles & scooters", "مركبات ودراجات"], city: ["Zawiya", "الزاوية"], dd: "SUSPENDED", vol: 22600, disp: 7.8, since: "2026-05-20", review: "2026-09-01", checks: [1, 1, 1, 0, 1, 0] },
  { id: "MRC-1009", name: ["Misrata Sewing House", "مصراتة لمستلزمات الخياطة"], bank: "sahel", sector: ["Workshop tools", "أدوات ورش"], city: ["Misrata", "مصراتة"], dd: "APPROVED", vol: 28900, disp: 1.3, since: "2026-06-30", review: "2026-08-19", checks: [1, 1, 1, 1, 1, 1] },
  { id: "MRC-1010", name: ["Benghazi Power Systems", "بنغازي لأنظمة الطاقة"], bank: "tibesti", sector: ["Generators", "مولدات"], city: ["Benghazi", "بنغازي"], dd: "APPROVED", vol: 61300, disp: 1.7, since: "2026-04-02", review: "2026-07-28", checks: [1, 1, 1, 1, 1, 1] }
];

const PRODUCTS = [
  { id: "ESS", name: ["Mizan Essential Goods Murabaha", "مرابحة ميزان للسلع الأساسية"], status: "UAT_ACTIVE", min: 500, max: 12000, terms: [3, 24], rate: [6, 9], down: 0, uses: ["Household appliances", "Devices, school or work equipment"] },
  { id: "BNPL", name: ["Mizan Merchant BNPL Murabaha", "مرابحة ميزان للشراء الآن والدفع لاحقًا"], status: "CANDIDATE", min: 200, max: 4000, terms: [1, 6], rate: [5, 8], down: 10, uses: ["Short-tenor purchases at approved merchants"] },
  { id: "PRO", name: ["Mizan Productive Asset Murabaha", "مرابحة ميزان للأصول الإنتاجية"], status: "PENDING_REVIEW", min: 3000, max: 40000, terms: [6, 36], rate: [7, 10], down: 15, uses: ["Equipment and inventory inputs for microenterprises"] },
  { id: "IJR", name: ["Mizan Ijarah", "إجارة ميزان"], status: "CANDIDATE", min: 5000, max: 60000, terms: [12, 48], rate: [6, 9], down: 10, uses: ["Eligible productive equipment"] },
  { id: "SAL", name: ["Mizan Salary-Supported Finance", "تمويل ميزان المدعوم بالراتب"], status: "PENDING_REVIEW", min: 1000, max: 15000, terms: [6, 24], rate: [6, 8.5], down: 0, uses: ["Verified salary evidence used for assessment only"] },
  { id: "GRD", name: ["Mizan Graduated Limit", "حد ميزان المتدرج"], status: "CANDIDATE", min: 300, max: 6000, terms: [3, 12], rate: [5, 8], down: 0, uses: ["Low initial exposure, raised on verified repayment"] }
];

/* feature spec: [value, source, confidence, days until expiry] */
const F = (v, src, conf = "VERIFIED_PRIMARY", exp = 20) => ({ v, src, conf, exp });
const gates = (o = {}) => ({
  "identity.verified": F(true, "IDENTITY_PROVIDER"), "compliance.aml_clear": F(true, "IDENTITY_PROVIDER"),
  "purpose.asset_eligible": F(true, "DOCUMENT", "VERIFIED_SECONDARY"), "consent.valid": F(true, "MIZAN_HISTORY"),
  "merchant.verified": F(true, "MERCHANT_BANK"), "invoice.verified": F(true, "MERCHANT_BANK"), ...o
});
const numeric = (income, obl, beh, tenure, o = {}) => ({
  "income.verified_monthly": F(income, "FCMS"), "cic.monthly_obligations": F(obl, "CREDIT_INFORMATION_CENTRE", "VERIFIED_PRIMARY", 24),
  "bank.behavior_index": F(beh, "CBS_READ_MODEL", "VERIFIED_PRIMARY", 18), "account.tenure_months": F(tenure, "CBS_READ_MODEL", "VERIFIED_PRIMARY", 18), ...o
});

const CASES = [
  { id: "MZN-D-2041", cust: ["Salem Al-Mansouri", "سالم المنصوري"], job: ["Civil servant, Ministry of Education", "موظف حكومي، وزارة التعليم"], goods: ["Refrigerator and washing machine", "ثلاجة وغسالة"], merchant: "MRC-1001", product: "ESS", principal: 6400, term: 12, rate: 7.5, state: "CREDIT_REVIEW", applied: "2026-09-10T08:12:00Z", f: { ...gates(), ...numeric(4200, 300, 0.78, 54) }, sharia: { asset: "unk", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2042", cust: ["Huda Ben Ali", "هدى بن علي"], job: ["Nurse, public hospital", "ممرضة، مستشفى عام"], goods: ["Laptop for study", "حاسوب محمول للدراسة"], merchant: "MRC-1002", product: "ESS", principal: 3100, term: 9, rate: 7.5, state: "EVIDENCE", applied: "2026-09-11T13:40:00Z", f: { ...gates(), ...numeric(2600, 0, 0.64, 31, { "income.verified_monthly": F(2600, "FCMS", "VERIFIED_PRIMARY", -3) }) }, sharia: { asset: "unk", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2043", cust: ["Idris Gharyani", "إدريس الغرياني"], job: ["Bakery owner (self-employed)", "صاحب مخبز (عمل حر)"], goods: ["Deck oven and dough mixer", "فرن ومعجن"], merchant: "MRC-1005", product: "PRO", principal: 18500, term: 24, rate: 8.5, state: "CREDIT_REVIEW", applied: "2026-09-09T10:05:00Z", f: { ...gates(), ...numeric(5100, 900, 0.55, 22, { "income.verified_monthly": F(5100, "SELF_DECLARED", "SELF_DECLARED", 20) }) }, sharia: { asset: "pass", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2044", cust: ["Mabrouka Zwawi", "مبروكة الزوي"], job: ["Part-time cashier", "كاشير بدوام جزئي"], goods: ["Smartphone", "هاتف ذكي"], merchant: "MRC-1002", product: "ESS", principal: 2400, term: 6, rate: 7.5, state: "DECLINED", applied: "2026-09-08T15:20:00Z", f: { ...gates(), ...numeric(1900, 650, 0.41, 9) }, sharia: { asset: "pass", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2045", cust: ["Tarek Elfaitouri", "طارق الفيتوري"], job: ["Engineer, municipal utility", "مهندس، شركة مرافق بلدية"], goods: ["Rooftop solar kit with battery", "طقم ألواح شمسية مع بطارية"], merchant: "MRC-1003", product: "ESS", principal: 9200, term: 18, rate: 7.5, state: "APPROVED", applied: "2026-09-04T09:45:00Z", f: { ...gates(), ...numeric(6800, 400, 0.84, 88) }, sharia: { asset: "pass", purchase: "pass", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2046", cust: ["Nadia Abouzeid", "نادية أبو زيد"], job: ["Tailor, home workshop", "خياطة، ورشة منزلية"], goods: ["Industrial sewing machine", "ماكينة خياطة صناعية"], merchant: "MRC-1009", product: "PRO", principal: 3800, term: 12, rate: 8.5, state: "ACTIVE", applied: "2026-07-22T11:00:00Z", f: { ...gates(), ...numeric(3300, 150, 0.72, 40) }, sharia: { asset: "pass", purchase: "pass", possess: "pass", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2047", cust: ["Khaled Sharif", "خالد شريف"], job: ["Teacher, secondary school", "مدرّس، مدرسة ثانوية"], goods: ["Two split air conditioners", "مكيّفان منفصلان"], merchant: "MRC-1007", product: "ESS", principal: 5600, term: 12, rate: 7.5, state: "RECOMMENDED", applied: "2026-09-10T14:25:00Z", f: { ...gates(), ...numeric(4700, 500, 0.7, 62) }, sharia: { asset: "pass", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2048", cust: ["Amal Dabbashi", "أمل الدباشي"], job: ["Primary school administrator", "إدارية مدرسة ابتدائية"], goods: ["Classroom and study equipment", "تجهيزات صف ودراسة"], merchant: "MRC-1006", product: "ESS", principal: 1450, term: 6, rate: 7.5, state: "ACTIVE", applied: "2026-06-12T09:10:00Z", f: { ...gates(), ...numeric(3000, 0, 0.8, 70) }, sharia: { asset: "pass", purchase: "pass", possess: "pass", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2049", cust: ["Yousef Bukhatwa", "يوسف بوخطوة"], job: ["Courier", "ساعي توصيل"], goods: ["Delivery scooter", "دراجة توصيل"], merchant: "MRC-1008", product: "PRO", principal: 11900, term: 24, rate: 8.5, state: "DECLINED", applied: "2026-09-07T12:30:00Z", f: { ...gates({ "compliance.aml_clear": F(false, "IDENTITY_PROVIDER"), "merchant.verified": F(false, "MERCHANT_BANK") }), ...numeric(3600, 800, 0.5, 14) }, sharia: { asset: "pass", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2050", cust: ["Rania Ghariani", "رانيا الغرياني"], job: ["Pharmacist", "صيدلانية"], goods: ["Bedroom and living-room furniture", "أثاث غرفة نوم وجلوس"], merchant: "MRC-1004", product: "ESS", principal: 7800, term: 12, rate: 7.5, state: "OFFERED", applied: "2026-09-03T16:00:00Z", f: { ...gates(), ...numeric(5900, 200, 0.82, 96) }, sharia: { asset: "pass", purchase: "pass", possess: "pass", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2051", cust: ["Omar Tweer", "عمر الطوير"], job: ["Graduate student, part-time tutor", "طالب دراسات عليا، مدرّس خصوصي"], goods: ["Tablet", "جهاز لوحي"], merchant: "MRC-1002", product: "BNPL", principal: 1900, term: 6, rate: 7, state: "EVIDENCE", applied: "2026-09-12T10:10:00Z", f: { ...gates({ "invoice.verified": F("unknown", "MERCHANT_BANK", "MISSING", 0) }), ...numeric(1700, 0, 0.58, 12, { "income.verified_monthly": F(1700, "SELF_DECLARED", "SELF_DECLARED", 20) }) }, sharia: { asset: "unk", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } },
  { id: "MZN-D-2052", cust: ["Salma Kaabar", "سلمى كعبار"], job: ["Clinic manager", "مديرة عيادة"], goods: ["Standby generator", "مولد كهربائي احتياطي"], merchant: "MRC-1010", product: "ESS", principal: 6900, term: 12, rate: 7.5, state: "CREDIT_REVIEW", applied: "2026-09-11T09:00:00Z", f: { ...gates(), ...numeric(4300, 600, 0.66, 36) }, sharia: { asset: "pass", purchase: "unk", possess: "unk", template: "pass", disclose: "pass", latefee: "pass" } }
];

/* Receivables on the book (ACTIVE contracts + seasoned book, simulated). dpd = days past due */
const NAMES = [["Fathi Ben Nasr", "فتحي بن نصر"], ["Hanan Al-Sherif", "حنان الشريف"], ["Mustafa Gadour", "مصطفى قدّور"], ["Eman Buzaid", "إيمان بوزيد"], ["Jalal Mahjoub", "جلال محجوب"], ["Asma Zeglam", "أسماء الزقلم"], ["Walid Ashur", "وليد عاشور"], ["Ghada Frifer", "غادة فريفر"], ["Anis Shalgham", "أنيس شلغم"], ["Najla Treki", "نجلاء التريكي"], ["Raed Ben Halim", "رائد بن حليم"], ["Sumaya Elmagri", "سمية المقري"]];
const RECEIVABLES = [
  { id: "MC-7701", cust: CASES[5].cust, case: "MZN-D-2046", out: 2850, inst: 345, dpd: 0, next: "2026-09-25", term: 12, paid: 3, merchant: "MRC-1009" },
  { id: "MC-7702", cust: CASES[7].cust, case: "MZN-D-2048", out: 410, inst: 252, dpd: 0, next: "2026-09-20", term: 6, paid: 4, merchant: "MRC-1006" },
  ...NAMES.map((n, i) => {
    const dpd = [0, 0, 3, 12, 0, 34, 0, 47, 71, 0, 105, 18][i];
    return { id: "MC-" + (7703 + i), cust: n, case: "MZN-D-" + (1980 + i), out: [5200, 1750, 3100, 8400, 2250, 6100, 940, 9700, 4400, 1200, 12800, 3600][i], inst: [510, 180, 330, 760, 240, 560, 160, 890, 420, 130, 1050, 340][i], dpd, next: dpd ? "2026-09-" + String(Math.max(1, 14 - dpd % 13)).padStart(2, "0") : "2026-09-" + String(18 + i % 9), term: [12, 12, 12, 12, 12, 12, 6, 24, 12, 12, 24, 12][i], paid: [6, 8, 5, 7, 9, 4, 5, 10, 3, 10, 12, 4][i], merchant: MERCHANTS[i % 10].id };
  })
];
const bucketOf = d => d === 0 ? "cur" : d <= 30 ? "b1" : d <= 60 ? "b2" : d <= 90 ? "b3" : "b4";

/* Collections activity per account */
const COLLECT_LOG = {
  "MC-7705": [["2026-09-12", ["SMS reminder sent", "أُرسل تذكير نصي"]], ["2026-09-13", ["Customer called; salary delayed one week", "اتصل العميل؛ تأخر الراتب أسبوعًا"]]],
  "MC-7708": [["2026-08-30", ["First reminder", "تذكير أول"]], ["2026-09-06", ["Promise to pay 2026-09-10 (broken)", "وعد بالسداد في 2026-09-10 (لم يُنفذ)"]]],
  "MC-7710": [["2026-07-10", ["Reminder", "تذكير"]], ["2026-08-05", ["Field visit; employment ended", "زيارة ميدانية؛ انتهى عمل العميل"]], ["2026-09-01", ["Restructuring proposed", "اقتُرحت إعادة جدولة"]]]
};

/* Time series (deterministic) */
const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const MONTHS_AR = ["أكت", "نوف", "ديس", "ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت"];
const NPL_SERIES = [0.0, 0.2, 0.4, 0.6, 0.9, 1.1, 1.5, 1.8, 2.1, 2.3, 2.6, 2.8];
const BOOK_SERIES = [0.41, 0.63, 0.9, 1.24, 1.52, 1.98, 2.41, 2.85, 3.32, 3.76, 4.21, 4.68]; // million LYD
const VINTAGES = (() => { const r = rng(7); return ["Mar", "Apr", "May", "Jun", "Jul", "Aug"].map((m, i) => { const base = 0.5 + r() * 0.5 + i * 0.1; const pts = []; for (let k = 0; k <= 6 - i; k++) pts.push(+(Math.min(9, base * (k ** 1.35) * 0.55 * (1 + (i > 3 ? 0.25 : 0)))).toFixed(2)); return { m, pts }; }); })();
const SECTORS = [[["Appliances", "أجهزة منزلية"], 31], [["Electronics", "إلكترونيات"], 19], [["Solar & power", "طاقة"], 17], [["Productive equipment", "معدات"], 15], [["Furniture", "أثاث"], 10], [["Other", "أخرى"], 8]];

const SIGNALS = [
  { id: "EW-01", sev: "high", ent: "MC-7710", type: ["Employment ended, salary credits stopped", "توقفت الرواتب وانتهى العمل"], trig: ["No FCMS salary credit for 2 cycles", "لا إيداع راتب لدورتين"], act: ["Open restructuring review", "فتح مراجعة إعادة الجدولة"], days: 2 },
  { id: "EW-02", sev: "high", ent: "MRC-1008", type: ["Merchant dispute rate spike", "ارتفاع حاد في نزاعات التاجر"], trig: ["7.8% disputes vs 2% policy ceiling", "7.8٪ نزاعات مقابل سقف 2٪"], act: ["Suspend new orders; Merchant Bank review", "إيقاف الطلبات الجديدة ومراجعة مصرف التاجر"], days: 1 },
  { id: "EW-03", sev: "med", ent: "MC-7708", type: ["Salary moved to another bank", "تحويل الراتب إلى مصرف آخر"], trig: ["Employer credit now observed elsewhere", "ظهور إيداع جهة العمل في مصرف آخر"], act: ["Customer outreach; update repayment source", "التواصل مع العميل وتحديث مصدر السداد"], days: 4 },
  { id: "EW-04", sev: "med", ent: "MRC-1003", type: ["Concentration above 15% of new volume", "تركّز يتجاوز 15٪ من الحجم الجديد"], trig: ["Green Sun Energy: 18.2% of 30-day originations", "الشمس الخضراء: 18.2٪ من الأصول خلال 30 يومًا"], act: ["Apply merchant exposure cap", "تطبيق سقف التعرض للتاجر"], days: 3 },
  { id: "EW-05", sev: "med", ent: "MZN-D-2043", type: ["Declared income unverified at high exposure", "دخل غير موثق مع تعرض مرتفع"], trig: ["Self-declared income, principal above 3× monthly", "دخل مُعلن ومبلغ يفوق ثلاثة أضعاف الدخل الشهري"], act: ["Require site visit and invoices", "طلب زيارة ميدانية وفواتير"], days: 5 },
  { id: "EW-06", sev: "low", ent: "MC-7706", type: ["Returned item on current account", "شيك/عملية مرتجعة في الحساب الجاري"], trig: ["One returned debit in 14 days", "عملية مرتجعة واحدة خلال 14 يومًا"], act: ["Monitor; reminder before due date", "متابعة وتذكير قبل الاستحقاق"], days: 6 },
  { id: "EW-07", sev: "high", ent: "MIP / fezzan", type: ["Peer certificate expired", "انتهت صلاحية شهادة المصرف النظير"], trig: ["Peer cert expired 9 days ago; connection suspended", "انتهت شهادة النظير منذ 9 أيام وعُلّق الاتصال"], act: ["Hold new quotes; request renewal", "إيقاف عروض الأسعار وطلب التجديد"], days: 1 },
  { id: "EW-08", sev: "med", ent: "MRC-1002", type: ["Duplicate invoice pattern", "نمط فواتير مكررة"], trig: ["Same invoice amount, 3 customers, 48 hours", "المبلغ نفسه لثلاثة عملاء خلال 48 ساعة"], act: ["Merchant Bank evidence request", "طلب أدلة من مصرف التاجر"], days: 2 },
  { id: "EW-09", sev: "low", ent: "MZN-D-2051", type: ["New device before disbursement", "جهاز جديد قبل الصرف"], trig: ["Device change within 24h of purchase promise", "تغيير الجهاز خلال 24 ساعة من وعد الشراء"], act: ["Step-up verification", "تحقق إضافي"], days: 7 },
  { id: "EW-10", sev: "low", ent: "Portfolio", type: ["Vintage Aug running above Jul", "دفعة أغسطس أعلى من يوليو"], trig: ["Month-3 30+ DPD 0.9 pts above prior vintage", "تأخر 30+ في الشهر الثالث أعلى بـ0.9 نقطة"], act: ["Review origination mix", "مراجعة تركيبة الإصدار"], days: 9 }
];

const DISPUTES = [
  { id: "DSP-301", order: "ORD-5521", cust: CASES[5].cust, merchant: "MRC-1009", type: ["Item not as described", "السلعة غير مطابقة للوصف"], opened: "2026-09-08", state: "EVIDENCE_REQUESTED", amount: 3800, owner: "merchant" },
  { id: "DSP-302", order: "ORD-5530", cust: NAMES[2], merchant: "MRC-1008", type: ["Delivery not received", "لم يتم التسليم"], opened: "2026-09-05", state: "ESCALATED", amount: 11900, owner: "financing" },
  { id: "DSP-303", order: "ORD-5547", cust: NAMES[7], merchant: "MRC-1001", type: ["Defective on delivery, return requested", "عيب عند التسليم وطلب إرجاع"], opened: "2026-09-10", state: "RETURN_REQUESTED", amount: 2900, owner: "merchant" },
  { id: "DSP-304", order: "ORD-5502", cust: NAMES[4], merchant: "MRC-1002", type: ["Price differs from quote", "السعر يختلف عن العرض"], opened: "2026-08-29", state: "RESOLVED", amount: 2250, owner: "merchant" },
  { id: "DSP-305", order: "ORD-5560", cust: NAMES[9], merchant: "MRC-1004", type: ["Late delivery", "تأخر التسليم"], opened: "2026-09-12", state: "OPEN", amount: 1200, owner: "merchant" }
];

const MIP_LOG = [
  { ts: "2026-09-14T09:21:07Z", dir: "OUT", peer: "sahel", type: "quote.request", order: "ORD-5571", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-14T09:21:08Z", dir: "IN", peer: "sahel", type: "quote.issued", order: "ORD-5571", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-14T09:12:40Z", dir: "OUT", peer: "tibesti", type: "reservation.request", order: "ORD-5568", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-14T09:12:42Z", dir: "IN", peer: "tibesti", type: "reservation.confirmed", order: "ORD-5568", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-14T08:47:19Z", dir: "OUT", peer: "tibesti", type: "purchase_order.submit", order: "ORD-5565", st: "UNKNOWN" },
  { ts: "2026-09-14T08:31:55Z", dir: "IN", peer: "sahel", type: "possession.evidence", order: "ORD-5559", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-14T08:02:11Z", dir: "OUT", peer: "sahel", type: "purchase_order.submit", order: "ORD-5559", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-13T16:44:30Z", dir: "IN", peer: "tibesti", type: "delivery.confirmed", order: "ORD-5544", st: "SIGNED_RECEIPT" },
  { ts: "2026-09-13T15:10:02Z", dir: "OUT", peer: "fezzan", type: "quote.request", order: "ORD-5540", st: "REJECTED" },
  { ts: "2026-09-13T11:27:48Z", dir: "IN", peer: "sahel", type: "dispute.opened", order: "ORD-5521", st: "SIGNED_RECEIPT" }
];

const ROLES = [
  { id: "analyst", name: ["Credit analyst", "محلل الائتمان"], user: ["Layla Mansour", "ليلى منصور"], perms: ["case.read", "case.recommend", "evidence.refresh", "collections.act"] },
  { id: "checker", name: ["Credit supervisor", "مشرف الائتمان"], user: ["Karim Bashir", "كريم بشير"], perms: ["case.read", "case.recommend", "case.approve", "case.decline", "policy.approve"] },
  { id: "sharia", name: ["Sharia control officer", "مسؤول الرقابة الشرعية"], user: ["Dr. Fatima Senussi", "د. فاطمة السنوسي"], perms: ["case.read", "sharia.clear", "contract.template.approve"] },
  { id: "ops", name: ["Operations officer", "موظف العمليات"], user: ["Adel Ghazal", "عادل غزال"], perms: ["case.read", "network.inquire", "booking.request", "dispute.act"] },
  { id: "auditor", name: ["Internal auditor", "مدقق داخلي"], user: ["Samira Taher", "سميرة الطاهر"], perms: ["audit.read", "report.read", "case.read"] }
];
const PERM_MATRIX = [["case.recommend", "Recommend a decision", "اقتراح قرار"], ["case.approve", "Approve credit (checker)", "الموافقة الائتمانية (المراجع)"], ["sharia.clear", "Clear Sharia control", "اعتماد الرقابة الشرعية"], ["booking.request", "Request CBS booking", "طلب القيد في النظام المصرفي"], ["network.inquire", "Send MIP inquiry", "إرسال استعلام MIP"], ["collections.act", "Collections actions", "إجراءات التحصيل"], ["policy.approve", "Approve policy change", "اعتماد تغيير السياسة"], ["audit.read", "Read audit log", "قراءة سجل التدقيق"]];
const PENDING_APPROVALS = [
  { id: "AP-901", kind: ["Raise Essential Goods max principal 12,000 → 15,000 LYD", "رفع الحد الأقصى للتمويل الأساسي من 12,000 إلى 15,000 د.ل"], maker: "analyst", at: "2026-09-13T10:15:00Z" },
  { id: "AP-902", kind: ["Set affordability ceiling 40% → 38% of net income", "خفض سقف القدرة على السداد من 40٪ إلى 38٪ من الدخل الصافي"], maker: "checker", at: "2026-09-13T14:02:00Z" },
  { id: "AP-903", kind: ["Activate peer Cyrene Islamic Bank (quote only)", "تفعيل المصرف النظير قورينا الإسلامي (عروض أسعار فقط)"], maker: "ops", at: "2026-09-14T08:20:00Z" },
  { id: "AP-904", kind: ["Approve contract template v1.3 (late-payment clause)", "اعتماد نموذج العقد 1.3 (بند التأخر في السداد)"], maker: "sharia", at: "2026-09-14T08:55:00Z" }
];

const CBS_CAPS = [
  { id: "ACCOUNT_DISCOVERY", name: ["Customer account discovery", "الاستعلام عن حسابات العميل"], lat: 240, ok: true },
  { id: "ACCOUNT_OWNERSHIP", name: ["Account and ownership", "الحساب والملكية"], lat: 310, ok: true },
  { id: "FCMS_OBSERVATIONS", name: ["FCMS salary observations", "ملاحظات رواتب FCMS"], lat: 520, ok: true },
  { id: "STATEMENT", name: ["Bounded account statement", "كشف حساب محدود"], lat: 690, ok: true },
  { id: "CIC_INQUIRY", name: ["Credit information centre inquiry", "استعلام مركز المعلومات الائتمانية"], lat: 880, ok: false },
  { id: "BOOKING", name: ["Financing booking (simulated)", "قيد التمويل (محاكاة)"], lat: 410, ok: true }
];

const PILOT = [
  { id: "P1", crit: true, name: ["Sharia Supervisory Board approves product template and contracts", "هيئة الرقابة الشرعية تعتمد نموذج المنتج والعقود"], owner: ["Sharia board", "هيئة الرقابة الشرعية"], st: "open" },
  { id: "P2", crit: true, name: ["Regulator no-objection for pilot cohort", "عدم ممانعة الجهة الرقابية لعيّنة التجربة"], owner: ["Compliance", "الامتثال"], st: "open" },
  { id: "P3", crit: true, name: ["Fail-closed Sharia control replaces default-allow helper", "رقابة شرعية تغلق عند عدم اليقين بدل السماح الافتراضي"], owner: ["Technology", "التقنية"], st: "progress" },
  { id: "P4", crit: true, name: ["Independent security assessment closed, no open critical", "تقييم أمني مستقل دون ثغرات حرجة مفتوحة"], owner: ["Security", "الأمن"], st: "open" },
  { id: "P5", crit: true, name: ["Stop-loss rules and first-loss limit signed", "توقيع قواعد وقف الخسارة وحد الخسارة الأولى"], owner: ["Risk", "المخاطر"], st: "progress" },
  { id: "P6", crit: false, name: ["One product, one customer cohort, one merchant cohort frozen", "تثبيت منتج وشريحة عملاء وشريحة تجار"], owner: ["Product", "المنتج"], st: "done" },
  { id: "P7", crit: true, name: ["Approved payment path certified end to end", "اعتماد مسار الدفع المعتمد من البداية للنهاية"], owner: ["Operations", "العمليات"], st: "open" },
  { id: "P8", crit: false, name: ["MIP conformance suite passes with first merchant bank", "اجتياز اختبارات مطابقة MIP مع أول مصرف تاجر"], owner: ["Technology", "التقنية"], st: "progress" },
  { id: "P9", crit: false, name: ["CBS adapter verified against bank records (read-only)", "التحقق من وصلة النظام المصرفي مع السجلات (قراءة فقط)"], owner: ["Technology", "التقنية"], st: "progress" },
  { id: "P10", crit: false, name: ["Collections and complaint procedures staffed", "تجهيز إجراءات التحصيل والشكاوى بالموظفين"], owner: ["Operations", "العمليات"], st: "open" },
  { id: "P11", crit: false, name: ["Credit policy pack approved by credit committee", "اعتماد حزمة سياسة الائتمان من لجنة الائتمان"], owner: ["Credit", "الائتمان"], st: "done" },
  { id: "P12", crit: false, name: ["Staff trained in six-screen case workflow", "تدريب الموظفين على مسار الحالة بست شاشات"], owner: ["Operations", "العمليات"], st: "done" }
];

const REPORTS = [
  { id: "R1", name: ["Portfolio quality (aging and NPL)", "جودة المحفظة (الأعمار ونسبة التعثر)"] },
  { id: "R2", name: ["Origination by product and merchant", "الإصدار حسب المنتج والتاجر"] },
  { id: "R3", name: ["Decision explainability sample", "عيّنة شرح القرارات"] },
  { id: "R4", name: ["Sharia control exceptions", "استثناءات الرقابة الشرعية"] },
  { id: "R5", name: ["MIP message and receipt reconciliation", "مطابقة رسائل MIP والإيصالات"] },
  { id: "R6", name: ["Service-fee pool statement", "بيان مجمّع رسوم الخدمة"] },
  { id: "R7", name: ["Dispute ageing", "أعمار النزاعات"] },
  { id: "R8", name: ["Maker-checker activity", "نشاط المُنشئ والمراجع"] }
];

const SEED_AUDIT = [
  ["2026-09-14T09:21:08Z", "system", "MIP", "quote.issued received from sahel · receipt verified", "استلام quote.issued من sahel وتم التحقق من الإيصال"],
  ["2026-09-14T08:55:00Z", "sharia", "Policy", "Submitted contract template v1.3 for approval (AP-904)", "قدّم نموذج العقد 1.3 للاعتماد (AP-904)"],
  ["2026-09-14T08:47:19Z", "ops", "MIP", "purchase_order.submit to tibesti: status UNKNOWN, inquiry required", "purchase_order.submit إلى tibesti: الحالة غير معروفة ويلزم الاستعلام"],
  ["2026-09-13T16:02:41Z", "checker", "Case", "MZN-D-2045 credit approved (maker: Layla Mansour)", "اعتماد ائتمان MZN-D-2045 (المُنشئ: ليلى منصور)"],
  ["2026-09-13T15:10:02Z", "ops", "MIP", "Peer fezzan rejected quote.request: certificate expired", "رفض النظير fezzan لطلب العرض: الشهادة منتهية"],
  ["2026-09-13T11:40:12Z", "analyst", "Case", "MZN-D-2044 declined: affordability outside policy", "رفض MZN-D-2044: القدرة على السداد خارج السياسة"],
  ["2026-09-12T14:20:00Z", "sharia", "Sharia", "MZN-D-2045 asset permissibility passed", "اجتياز مشروعية الأصل في MZN-D-2045"],
  ["2026-09-12T10:10:00Z", "analyst", "Evidence", "MZN-D-2051 evidence requested: merchant invoice", "طلب أدلة MZN-D-2051: فاتورة التاجر"],
  ["2026-09-11T09:00:00Z", "checker", "Merchant", "MRC-1008 suspended: dispute rate above ceiling", "تعليق MRC-1008: نسبة النزاعات فوق السقف"],
  ["2026-09-10T08:12:00Z", "system", "Case", "MZN-D-2041 application submitted via Customer app", "تقديم طلب MZN-D-2041 عبر تطبيق العميل"]
];
