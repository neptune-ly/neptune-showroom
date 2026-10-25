// Seeded, invented demonstration data. Nothing here is real; no code or data was taken from any real system.
(function () {
  const rnd = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const D = window.D = {};
  const L = (en, ar, fr) => ({ en, ar: ar || en, fr: fr || en });
  window.nm = o => (typeof o === "string" ? o : o[NX.S.lang] || o.en);
  D.company = L("Zahra Harbor Trading", "زهراء هاربر للتجارة", "Zahra Harbor Négoce");
  D.PERSONAS = [
    { id: "amira", name: L("Amira Khalil", "أميرة خليل"), role: ["Finance manager", "Responsable finance", "مديرة المالية"], maker: true, checker: true },
    { id: "omar", name: L("Omar Haddad", "عمر حداد"), role: ["CFO · Approver", "Directeur financier · Valideur", "المدير المالي · معتمد"], maker: true, checker: true },
    { id: "lina", name: L("Lina Saad", "لينا سعد"), role: ["Treasury analyst · Viewer", "Analyste trésorerie · Lecteur", "محللة الخزينة · عرض فقط"], maker: false, checker: false }
  ];
  D.FX = { LYD: 1, USD: 4.912, EUR: 5.348 };
  D.accounts = [
    { id: "A1", n: L("Operating account", "الحساب التشغيلي", "Compte d’exploitation"), no: "0010 2231 0014", cur: "LYD", bal: 4812350.75, avail: 4790120.75, kind: "cur", sp: [4.1, 4.3, 4.2, 4.5, 4.4, 4.7, 4.6, 4.81], tone: 1 },
    { id: "A2", n: L("Payroll account", "حساب الرواتب", "Compte paie"), no: "0010 2231 0027", cur: "LYD", bal: 1260400.00, avail: 1260400.00, kind: "pay", sp: [1.5, 1.4, 1.35, 1.3, 1.5, 1.45, 1.3, 1.26], tone: 2 },
    { id: "A3", n: L("USD collections", "تحصيلات بالدولار", "Encaissements USD"), no: "0010 2231 0305", cur: "USD", bal: 612880.40, avail: 598880.40, kind: "fx", sp: [520, 540, 560, 555, 590, 600, 605, 612], tone: 3 },
    { id: "A4", n: L("EUR settlement", "تسوية باليورو", "Règlement EUR"), no: "0010 2231 0412", cur: "EUR", bal: 238115.20, avail: 238115.20, kind: "fx", sp: [210, 220, 215, 230, 228, 240, 236, 238], tone: 4 },
    { id: "A5", n: L("Term deposit · 90 days", "وديعة لأجل · ٩٠ يوماً".replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)), "Dépôt à terme · 90 jours"), no: "0010 2231 0588", cur: "LYD", bal: 3000000.00, avail: 0, kind: "term", sp: [3, 3, 3, 3, 3, 3, 3, 3], tone: 5 }
  ];
  D.lyd = a => a.bal * D.FX[a.cur];
  D.totalLYD = () => D.accounts.reduce((s, a) => s + D.lyd(a), 0);
  D.bens = [
    { id: "B1", n: L("Sunrise Hardware LLC", "شركة الشروق للمعدات"), iban: "LY83 0021 0010 7712 0044 3", bank: L("Meridian Bank", "بنك ميريديان"), cur: "LYD", fav: true, ini: "SH" },
    { id: "B2", n: L("Oasis Cold Chain", "واحة للتبريد"), iban: "LY40 0021 0019 2301 8833 7", bank: L("Cedar Trust", "سيدار ترست"), cur: "LYD", fav: true, ini: "OC" },
    { id: "B3", n: L("Northport Logistics", "نورث بورت للخدمات اللوجستية"), iban: "LY12 0034 0007 5521 1190 2", bank: L("Orbit Bank", "بنك أوربت"), cur: "LYD", fav: false, ini: "NL" },
    { id: "B4", n: L("Delta Machinery GmbH", "دلتا ماشينري"), iban: "DE89 3704 0044 0532 0130 00", bank: L("Rhein Handelsbank", "راين هاندلزبنك"), cur: "EUR", fav: true, ini: "DM" },
    { id: "B5", n: L("Pacific Components Ltd", "باسيفيك كومبوننتس"), iban: "GB29 NWBK 6016 1331 9268 19", bank: L("Harbour & Crown", "هاربر آند كراون"), cur: "USD", fav: false, ini: "PC" },
    { id: "B6", n: L("Cedar Office Supplies", "الأرز للقرطاسية"), iban: "LY55 0021 0044 8803 2217 1", bank: L("Meridian Bank", "بنك ميريديان"), cur: "LYD", fav: false, ini: "CO" },
    { id: "B7", n: L("Blue Nile Packaging", "النيل الأزرق للتغليف"), iban: "LY71 0034 0009 1160 5521 8", bank: L("Orbit Bank", "بنك أوربت"), cur: "LYD", fav: false, ini: "BN" }
  ];
  D.ben = id => D.bens.find(b => b.id === id);
  // cash flow: 12 history weeks + 8 forecast
  const r = rnd(7), N = 20, F = 12;
  D.cash = { forecastFrom: F, inflow: [], outflow: [], net: [], band: [], labels: [] };
  { let bal = 7.2e6; for (let i = 0; i < N; i++) { const wk = addDays(new Date(2026, 7, 3), i * 7), s = 1 + .18 * Math.sin(i / 2.2);
    const inn = Math.round((1.55e6 * s + r() * 3.2e5) / 1e4) * 1e4, out = Math.round((1.38e6 * (1 + .14 * Math.cos(i / 1.8)) + r() * 3e5) / 1e4) * 1e4;
    D.cash.inflow.push(inn); D.cash.outflow.push(out); bal += inn - out; D.cash.net.push(bal); D.cash.labels.push(wk); if (i >= F) D.cash.band.push(1.1e5 * (i - F + 1)); } }
  D.cashBal = D.cash.net.slice(0, F);
  D.fxPairs = [
    { p: "USD/LYD", v: 4.9120, d: +0.31, sp: [4.86, 4.87, 4.88, 4.87, 4.9, 4.89, 4.91, 4.912] },
    { p: "EUR/LYD", v: 5.3480, d: -0.12, sp: [5.38, 5.37, 5.39, 5.36, 5.35, 5.36, 5.35, 5.348] },
    { p: "GBP/LYD", v: 6.2210, d: +0.08, sp: [6.19, 6.2, 6.18, 6.2, 6.21, 6.22, 6.21, 6.221] },
    { p: "EUR/USD", v: 1.0888, d: -0.44, sp: [1.099, 1.096, 1.097, 1.093, 1.092, 1.09, 1.091, 1.0888] }
  ];
  D.cats = [
    { k: "sup", n: ["Suppliers", "Fournisseurs", "الموردون"], v: 2140000, c: "var(--c1)" },
    { k: "pay", n: ["Payroll", "Paie", "الرواتب"], v: 1260000, c: "var(--c2)" },
    { k: "log", n: ["Logistics", "Logistique", "الخدمات اللوجستية"], v: 640000, c: "var(--c4)" },
    { k: "tax", n: ["Taxes & fees", "Taxes & frais", "الضرائب والرسوم"], v: 410000, c: "var(--c5)" },
    { k: "oth", n: ["Other", "Autres", "أخرى"], v: 290000, c: "var(--c3)" }
  ];
  const day = (n, h = 9, m = 0) => { const d = addDays(NOW, n); d.setHours(h, m); return d; };
  D.tx = [
    { id: "T1", d: day(0, 8, 12), t: ["Customer receipt · Riverside Retail", "Encaissement client · Riverside Retail", "تحصيل عميل · ريفرسايد ريتيل"], a: 184500, cur: "LYD", cat: "in", acc: "A1" },
    { id: "T2", d: day(-1, 16, 40), t: ["Transfer · Sunrise Hardware LLC", "Virement · Sunrise Hardware LLC", "تحويل · شركة الشروق للمعدات"], a: -62300, cur: "LYD", cat: "sup", acc: "A1" },
    { id: "T3", d: day(-1, 11, 5), t: ["Bulk payment · Suppliers Oct-W4", "Paiement groupé · Fournisseurs oct.-S4", "دفعة جماعية · موردون أكتوبر"], a: -418900, cur: "LYD", cat: "sup", acc: "A1" },
    { id: "T4", d: day(-2, 14, 22), t: ["Export receipt · Marlow Foods", "Encaissement export · Marlow Foods", "تحصيل تصدير · مارلو فودز"], a: 96400, cur: "USD", cat: "in", acc: "A3" },
    { id: "T5", d: day(-3, 10, 31), t: ["Customs duties · Port of Misrata", "Droits de douane · Port de Misrata", "رسوم جمركية · ميناء مصراتة"], a: -128750, cur: "LYD", cat: "tax", acc: "A1" },
    { id: "T6", d: day(-4, 9, 0), t: ["Payroll · September run", "Paie · échéance septembre", "رواتب · دورة سبتمبر"], a: -1182400, cur: "LYD", cat: "pay", acc: "A2" },
    { id: "T7", d: day(-5, 15, 18), t: ["Freight · Northport Logistics", "Fret · Northport Logistics", "شحن · نورث بورت"], a: -74200, cur: "LYD", cat: "log", acc: "A1" },
    { id: "T8", d: day(-6, 12, 44), t: ["FX purchase · USD 40,000", "Achat de devises · 40 000 USD", "شراء عملة · ٤٠٬٠٠٠ دولار".replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))], a: -196480, cur: "LYD", cat: "fx", acc: "A1" }
  ];
  D.approvals = [
    { id: "AP-2041", kind: "transfer", t: ["Transfer to Delta Machinery GmbH", "Virement vers Delta Machinery GmbH", "تحويل إلى دلتا ماشينري"], a: 48500, cur: "EUR", by: "amira", at: day(0, 7, 55), sla: 3.2, risk: "medium", note: ["Spare parts · invoice DM-88121", "Pièces détachées · facture DM-88121", "قطع غيار · فاتورة DM-88121"] },
    { id: "AP-2040", kind: "bulk", t: ["Bulk payment · Suppliers Oct-W5 (42 payments)", "Paiement groupé · Fournisseurs oct.-S5 (42)", "دفعة جماعية · موردون أكتوبر-٥ (٤٢ دفعة)".replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))], a: 612480, cur: "LYD", by: "lina", at: day(-1, 17, 20), sla: 1.1, risk: "low", note: ["Dry-run passed · 0 warnings", "Simulation validée · 0 alerte", "نجحت المحاكاة · بدون تنبيهات"] },
    { id: "AP-2039", kind: "payroll", t: ["Payroll · October run (118 employees)", "Paie · échéance octobre (118 salariés)", "رواتب · دورة أكتوبر (١١٨ موظفاً)".replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))], a: 1204950, cur: "LYD", by: "amira", at: day(-1, 9, 14), sla: 6.5, risk: "low", note: ["Pay date 27 Oct", "Date de paie 27 oct.", "تاريخ الصرف ٢٧ أكتوبر".replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d))] },
    { id: "AP-2038", kind: "fx", t: ["FX purchase · USD 120,000 at 4.9120", "Achat de devises · 120 000 USD à 4,9120", "شراء عملة · 120,000 دولار بسعر 4.9120"], a: 589440, cur: "LYD", by: "lina", at: day(-2, 13, 2), sla: -0.8, risk: "high", note: ["Rate lock expires today 16:00", "Taux garanti jusqu’à 16h00", "تثبيت السعر ينتهي اليوم 16:00"] },
    { id: "AP-2037", kind: "user", t: ["New user · Karim Nasser (Viewer)", "Nouvel utilisateur · Karim Nasser (Lecteur)", "مستخدم جديد · كريم ناصر (عرض فقط)"], a: 0, cur: "", by: "amira", at: day(-2, 10, 30), sla: 14, risk: "low", note: ["Domain-locked email verified", "E-mail du domaine vérifié", "تم التحقق من بريد النطاق"] }
  ];
  D.bulks = [
    { id: "BP-1180", n: "Suppliers Oct-W4", n2: ["Supplier run · week 4", "Lot fournisseurs · semaine 4", "دفعة الموردين · الأسبوع 4"], rows: 38, total: 418900, cur: "LYD", st: "executed", ok: 38, fail: 0, at: day(-1, 11, 5), by: "amira" },
    { id: "BP-1176", n: "Freight settlements", n2: ["Freight settlements", "Règlements de fret", "تسويات الشحن"], rows: 14, total: 96200, cur: "LYD", st: "partial", ok: 12, fail: 2, at: day(-6, 15, 12), by: "amira" },
    { id: "BP-1171", n: "Marketplace refunds", n2: ["Marketplace refunds", "Remboursements marketplace", "استردادات السوق"], rows: 63, total: 38410, cur: "LYD", st: "executed", ok: 63, fail: 0, at: day(-9, 10, 2), by: "omar" },
    { id: "BP-1168", n: "Euro vendors Sep", n2: ["Euro vendors · September", "Fournisseurs euro · septembre", "موردو اليورو · سبتمبر"], rows: 9, total: 211700, cur: "EUR", st: "executed", ok: 9, fail: 0, at: day(-15, 14, 40), by: "omar" },
    { id: "BP-1181", n: "Suppliers Oct-W5", n2: ["Supplier run · week 5", "Lot fournisseurs · semaine 5", "دفعة الموردين · الأسبوع 5"], rows: 42, total: 612480, cur: "LYD", st: "pending", ok: 0, fail: 0, at: day(-1, 17, 20), by: "lina" }
  ];
  const names = ["Sunrise Hardware LLC", "Oasis Cold Chain", "Northport Logistics", "Cedar Office Supplies", "Blue Nile Packaging", "Atlas Fasteners", "Harbor Fuel Services", "Coral Print House", "Medina Spare Parts", "Greenfield Agro", "Tanit Electrical", "Samir Freight Co"];
  D.sampleRows = Array.from({ length: 24 }, (_, i) => { const q = rnd(300 + i); const bad = i === 5 ? "iban" : i === 13 ? "amount" : i === 19 ? "dup" : null;
    return { n: names[i % names.length] + (i >= names.length ? " " + (Math.floor(i / names.length) + 1) : ""), iban: "LY" + String(10 + Math.floor(q() * 80)) + " 0021 00" + String(10 + Math.floor(q() * 80)) + " " + String(1000 + Math.floor(q() * 8999)) + " " + String(1000 + Math.floor(q() * 8999)) + " " + Math.floor(q() * 9), a: Math.round((8000 + q() * 62000) * 100) / 100, ref: "INV-" + (88100 + i * 7), bad }; });
  D.sampleRows[5].iban = "LY83 0021 00XX 7712"; D.sampleRows[13].a = 0; D.sampleRows[19].ref = D.sampleRows[2].ref; D.sampleRows[19].a = D.sampleRows[2].a;
  const fn = ["Salma", "Yusuf", "Nadia", "Tariq", "Hiba", "Idris", "Maryam", "Khaled", "Reem", "Faris", "Dina", "Anis"], ln = ["Mansour", "Belhaj", "Ghanem", "Zidan", "Farouk", "Haddad", "Sassi", "Younis"];
  D.employees = Array.from({ length: 14 }, (_, i) => { const q = rnd(900 + i); return { n: fn[i % 12] + " " + ln[(i * 3) % 8], dept: ["Operations", "Finance", "Sales", "Warehouse", "Logistics"][i % 5], gross: Math.round((1900 + q() * 3600) / 10) * 10, ded: Math.round(q() * 220 + 60), st: i === 6 ? "warning" : "valid" }; });
  D.payroll = [
    { id: "PR-310", m: ["October 2026", "Octobre 2026", "أكتوبر 2026"], emp: 118, total: 1204950, pay: addDays(NOW, 2), st: "pending" },
    { id: "PR-309", m: ["September 2026", "Septembre 2026", "سبتمبر 2026"], emp: 117, total: 1182400, pay: new Date(2026, 8, 27), st: "executed" },
    { id: "PR-308", m: ["August 2026", "Août 2026", "أغسطس 2026"], emp: 115, total: 1168020, pay: new Date(2026, 7, 27), st: "executed" },
    { id: "PR-307", m: ["July 2026", "Juillet 2026", "يوليو 2026"], emp: 114, total: 1151300, pay: new Date(2026, 6, 27), st: "executed" }
  ];
  D.sched = [
    { id: "SC-1", t: ["Rent · Harbor Office Park", "Loyer · Harbor Office Park", "إيجار · هاربر أوفيس بارك"], a: 38000, cur: "LYD", every: ["Monthly · 1st", "Mensuel · le 1er", "شهرياً · اليوم الأول"], next: addDays(NOW, 7), st: "scheduled" },
    { id: "SC-2", t: ["Payroll · October run", "Paie · échéance octobre", "رواتب · دورة أكتوبر"], a: 1204950, cur: "LYD", every: ["Monthly · 27th", "Mensuel · le 27", "شهرياً · اليوم 27"], next: addDays(NOW, 2), st: "pending" },
    { id: "SC-3", t: ["Cold-storage lease · Oasis", "Bail frigorifique · Oasis", "إيجار تبريد · واحة"], a: 21400, cur: "LYD", every: ["Monthly · 5th", "Mensuel · le 5", "شهرياً · اليوم الخامس"], next: addDays(NOW, 11), st: "scheduled" },
    { id: "SC-4", t: ["Machinery instalment · Delta", "Échéance machine · Delta", "قسط معدات · دلتا"], a: 24000, cur: "EUR", every: ["Quarterly", "Trimestriel", "ربع سنوي"], next: addDays(NOW, 19), st: "scheduled" },
    { id: "SC-5", t: ["Insurance premium", "Prime d’assurance", "قسط التأمين"], a: 17650, cur: "LYD", every: ["Yearly · 12 Nov", "Annuel · 12 nov.", "سنوياً · 12 نوفمبر"], next: addDays(NOW, 18), st: "scheduled" },
    { id: "SC-6", t: ["Software licences", "Licences logicielles", "تراخيص البرمجيات"], a: 3200, cur: "USD", every: ["Monthly · 15th", "Mensuel · le 15", "شهرياً · اليوم 15"], next: addDays(NOW, 21), st: "scheduled" }
  ];
  D.exports = [
    { id: "EX-9921", t: ["Statement · Operating account · Oct", "Relevé · Compte d’exploitation · oct.", "كشف · الحساب التشغيلي · أكتوبر"], fmt: "PDF", at: day(0, 8, 2), size: "412 KB", st: "ready" },
    { id: "EX-9920", t: ["Transactions · Q3 2026", "Opérations · T3 2026", "العمليات · الربع الثالث 2026"], fmt: "XLSX", at: day(-1, 16, 11), size: "2.4 MB", st: "ready" },
    { id: "EX-9919", t: ["Statement · USD collections · Sep", "Relevé · Encaissements USD · sept.", "كشف · تحصيلات الدولار · سبتمبر"], fmt: "CSV", at: day(-3, 10, 40), size: "96 KB", st: "ready" },
    { id: "EX-9918", t: ["Audit trail · Sep 2026", "Piste d’audit · sept. 2026", "سجل التدقيق · سبتمبر 2026"], fmt: "PDF", at: day(-6, 9, 30), size: "1.1 MB", st: "ready" }
  ];
  D.trade = [
    { id: "LC-5512", k: ["Letter of credit · import", "Lettre de crédit · import", "اعتماد مستندي · استيراد"], cp: "Delta Machinery GmbH", a: 320000, cur: "EUR", exp: addDays(NOW, 41), pct: 62, st: "active", stage: 2 },
    { id: "LC-5498", k: ["Letter of credit · import", "Lettre de crédit · import", "اعتماد مستندي · استيراد"], cp: "Pacific Components Ltd", a: 185000, cur: "USD", exp: addDays(NOW, 12), pct: 88, st: "expiring", stage: 3 },
    { id: "BG-2210", k: ["Performance guarantee", "Garantie de bonne exécution", "ضمان حسن التنفيذ"], cp: "Port Authority of Misrata", a: 750000, cur: "LYD", exp: addDays(NOW, 133), pct: 25, st: "active", stage: 1 },
    { id: "DC-1304", k: ["Documentary collection", "Remise documentaire", "تحصيل مستندي"], cp: "Marlow Foods", a: 96400, cur: "USD", exp: addDays(NOW, 6), pct: 94, st: "active", stage: 3 }
  ];
  D.users = [
    { id: "U1", n: L("Omar Haddad", "عمر حداد"), e: "omar.haddad", role: "Company admin", roles: "admin", st: "active", last: day(0, 9, 12), mfa: "passkey" },
    { id: "U2", n: L("Amira Khalil", "أميرة خليل"), e: "amira.khalil", role: "Finance maker", roles: "maker", st: "active", last: day(0, 8, 1), mfa: "passkey" },
    { id: "U3", n: L("Lina Saad", "لينا سعد"), e: "lina.saad", role: "Viewer", roles: "viewer", st: "active", last: day(-1, 17, 22), mfa: "totp" },
    { id: "U4", n: L("Karim Nasser", "كريم ناصر"), e: "karim.nasser", role: "Viewer", roles: "viewer", st: "invited", last: null, mfa: "—" },
    { id: "U5", n: L("Hassan Orfali", "حسن عرفلي"), e: "hassan.orfali", role: "Treasury checker", roles: "checker", st: "active", last: day(-3, 11, 40), mfa: "totp" },
    { id: "U6", n: L("Rania Boukhari", "رانيا بوخاري"), e: "rania.boukhari", role: "Payroll maker", roles: "maker", st: "suspended", last: day(-27, 10, 5), mfa: "totp" }
  ];
  D.perms = [["accounts.read", "Accounts · view", "Comptes · consulter", "الحسابات · عرض"], ["statements.request", "Statements · request", "Relevés · demander", "الكشوف · طلب"], ["transfers.create", "Transfers · create", "Virements · créer", "التحويلات · إنشاء"], ["transfers.approve", "Transfers · approve", "Virements · approuver", "التحويلات · موافقة"], ["bulk.create", "Bulk payments · create", "Paiements groupés · créer", "الدفعات الجماعية · إنشاء"], ["bulk.approve", "Bulk payments · approve", "Paiements groupés · approuver", "الدفعات الجماعية · موافقة"], ["fx.trade", "FX House · trade", "FX House · négocier", "بيت الصرف · تداول"], ["users.manage", "Users & roles · manage", "Utilisateurs & rôles · gérer", "المستخدمون والأدوار · إدارة"], ["api.manage", "API & webhooks · manage", "API & webhooks · gérer", "الواجهات والخطافات · إدارة"]];
  D.roles = [["Company admin", "Administrateur", "مسؤول الشركة", [1, 1, 1, 0, 1, 0, 1, 1, 1]], ["Finance maker", "Initiateur finance", "مُنشئ مالي", [1, 1, 1, 0, 1, 0, 1, 0, 0]], ["Treasury checker", "Valideur trésorerie", "مراجع الخزينة", [1, 1, 0, 1, 0, 1, 1, 0, 0]], ["Viewer", "Lecteur", "عرض فقط", [1, 1, 0, 0, 0, 0, 0, 0, 0]]];
  D.audit = [
    { at: day(0, 9, 12), u: "omar", a: ["Signed in with passkey", "Connexion avec clé d’accès", "تسجيل دخول بمفتاح المرور"], ip: "10.24.8.17", h: "7f3a9c" },
    { at: day(0, 7, 55), u: "amira", a: ["Created transfer AP-2041 (EUR 48,500)", "Virement AP-2041 créé (48 500 EUR)", "إنشاء التحويل AP-2041 (48,500 يورو)"], ip: "10.24.8.21", h: "b21d04" },
    { at: day(-1, 17, 20), u: "lina", a: ["Submitted bulk batch BP-1181", "Lot BP-1181 soumis", "إرسال الدفعة الجماعية BP-1181"], ip: "10.24.9.4", h: "e9c7a1" },
    { at: day(-1, 11, 7), u: "omar", a: ["Approved bulk batch BP-1180 · step-up passkey", "Lot BP-1180 approuvé · passkey", "الموافقة على الدفعة BP-1180 · مفتاح مرور"], ip: "10.24.8.17", h: "4d80b6" },
    { at: day(-2, 10, 30), u: "amira", a: ["Invited user Karim Nasser", "Utilisateur Karim Nasser invité", "دعوة المستخدم كريم ناصر"], ip: "10.24.8.21", h: "a07f52" },
    { at: day(-3, 16, 2), u: "omar", a: ["Changed daily transfer limit to LYD 2,000,000", "Plafond journalier fixé à 2 000 000 LYD", "تغيير الحد اليومي إلى 2,000,000 دينار"], ip: "10.24.8.17", h: "c36e19" },
    { at: day(-5, 8, 48), u: "lina", a: ["Failed sign-in (wrong code) · then succeeded", "Échec de connexion (mauvais code) puis succès", "فشل دخول (رمز خاطئ) ثم نجاح"], ip: "10.24.9.4", h: "09bb7d" }
  ];
  D.notifs = [
    { at: day(0, 9, 2), i: "warning", t: ["FX rate lock for AP-2038 expires at 16:00", "Le taux de AP-2038 expire à 16h00", "تثبيت سعر AP-2038 ينتهي الساعة 16:00"], u: 1 },
    { at: day(0, 8, 2), i: "file", t: ["Statement EX-9921 is ready to download", "Le relevé EX-9921 est prêt", "كشف EX-9921 جاهز للتنزيل"], u: 1 },
    { at: day(-1, 11, 7), i: "check", t: ["Bulk batch BP-1180 executed · 38 of 38", "Lot BP-1180 exécuté · 38 sur 38", "نُفّذت الدفعة BP-1180 · 38 من 38"], u: 0 },
    { at: day(-2, 13, 2), i: "bolt", t: ["Lina Saad requested an FX purchase", "Lina Saad a demandé un achat de devises", "طلبت لينا سعد شراء عملة"], u: 0 }
  ];
  D.erp = [
    { id: "ledger", n: "LedgerOne ERP", d: ["General ledger & AP/AR sync", "Grand livre & synchro fournisseurs/clients", "دفتر الأستاذ ومزامنة الذمم"], st: "connected", sync: day(0, 6, 0), n2: "1,284", ic: "layers" },
    { id: "atlas", n: "Atlas Payroll Suite", d: ["Employee master & pay-run export", "Données salariés & export de paie", "بيانات الموظفين وتصدير الرواتب"], st: "connected", sync: day(0, 5, 30), n2: "118", ic: "users" },
    { id: "harbor", n: "HarborTrade Customs", d: ["Customs duties & declarations", "Droits & déclarations en douane", "الرسوم الجمركية والإقرارات"], st: "disconnected", sync: null, n2: "—", ic: "box" },
    { id: "pulse", n: "PulseBooks Accounting", d: ["Bank feeds & reconciliation", "Flux bancaires & rapprochement", "تغذية البنك والمطابقة"], st: "disconnected", sync: null, n2: "—", ic: "statement" }
  ];
  D.keys = [
    { n: "erp-sync-prod", scope: "read:accounts · read:transactions", made: day(-40), last: day(0, 6, 0), st: "active", px: "npk_live_9x2f" },
    { n: "treasury-dashboard", scope: "read:accounts", made: day(-12), last: day(-1, 18, 3), st: "active", px: "npk_live_41cd" },
    { n: "sandbox-tests", scope: "read:*", made: day(-77), last: day(-20), st: "expiring", px: "npk_test_77aa" }
  ];
  D.hooks = [
    { u: "https://erp.zahra-harbor.example/hooks/payments", ev: "payment.executed, payment.failed", st: "active", ok: 99.7, last: day(0, 8, 14) },
    { u: "https://bi.zahra-harbor.example/ingest/statements", ev: "statement.ready", st: "active", ok: 100, last: day(0, 8, 2) }
  ];
  D.sessions = [
    { d: ["MacBook · Chrome", "MacBook · Chrome", "ماك بوك · كروم"], loc: "Tripoli", cur: true, at: day(0, 9, 12) }, { d: ["iPhone · Neptune app", "iPhone · app Neptune", "آيفون · تطبيق نبتون"], loc: "Tripoli", cur: false, at: day(-1, 21, 4) }, { d: ["Windows · Edge", "Windows · Edge", "ويندوز · إيدج"], loc: "Misrata", cur: false, at: day(-4, 13, 9) }
  ];
})();
