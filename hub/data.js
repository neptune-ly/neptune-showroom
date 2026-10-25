// Entirely fictional. Names, numbers, institutions and identifiers are invented for the demonstration.
(function () {
  const R = NX.rnd(20261024), ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pick = a => a[Math.floor(R() * a.length)];
  const D = window.D = {};
  const pad = (n, l = 2) => String(n).padStart(l, "0");
  D.nm = c => (NX.S.lang === "ar" && c.n[1]) ? c.n[1] : c.n[0];          // display name by language
  D.city = c => NX.S.lang === "ar" ? c[1] : c[0];
  const CITIES = [["Harbor City", "مدينة الميناء"], ["Palm Bay", "خليج النخيل"], ["Old Town", "المدينة القديمة"], ["Riverside", "ضفة النهر"], ["Hill Crest", "قمة التل"], ["Northgate", "البوابة الشمالية"]];
  const people = [["Layla Haddad", "ليلى حداد"], ["Omar Selim", "عمر سليم"], ["Sara Mansour", "سارة منصور"], ["Yusuf Karimi", "يوسف كريمي"], ["Nadia Farouk", "نادية فاروق"], ["Karim Bensaid", "كريم بن سعيد"], ["Amal Idris", "أمل إدريس"], ["Tariq Aziz", "طارق عزيز"], ["Hala Ben Youssef", "هالة بن يوسف"], ["Rami Dahan", "رامي دهان"], ["Maya Costa", "مايا كوستا"], ["Adel Nasser", "عادل ناصر"], ["Dina Khalil", "دينا خليل"], ["Fadi Rahal", "فادي رحال"], ["Ines Marzouk", "إيناس مرزوق"], ["Jamal Oueslati", "جمال الوسلاتي"], ["Rania Saad", "رانيا سعد"], ["Walid Touati", "وليد التواتي"], ["Salma Abbas", "سلمى عباس"], ["Zaid Hamdan", "زيد حمدان"]];
  const biz = [["Blue Harbor Trading", "شركة الميناء الأزرق للتجارة"], ["Sunrise Pharmacy", "صيدلية الشروق"], ["Olive Grove Cafe", "مقهى بستان الزيتون"], ["Atlas Logistics", "أطلس للخدمات اللوجستية"], ["Palm Court Hotel", "فندق قصر النخيل"], ["Northgate Builders", "نورث غيت للمقاولات"]];
  const pub = [["Ministry Payroll Unit", "وحدة رواتب الوزارة"], ["City Water Authority", "هيئة مياه المدينة"]];
  const tiers = ["standard", "silver", "gold", "private"];
  D.customers = [...people.map(n => [n, "individual"]), ...biz.map(n => [n, "business"]), ...pub.map(n => [n, "public"])].map(([n, seg], i) => {
    const bal = ri(800, 90000);
    return { id: "C" + (1000 + i), n, seg, kyc: i % 9 === 5 ? "review" : i % 13 === 7 ? "expired" : "verified", tier: tiers[(i * 3) % 4], city: CITIES[i % 6], risk: i % 11 === 3 ? "high" : i % 5 === 2 ? "medium" : "low",
      phone: "+000 55 " + pad(100 + i * 37, 3) + " " + pad(1000 + i * 91, 4), since: 2012 + (i % 13), mfa: i % 6 !== 4, devices: 1 + (i % 3),
      accounts: [{ no: "1001-" + pad(300000 + i * 4111, 6), type: "current", bal }, ...(i % 2 ? [{ no: "2001-" + pad(500000 + i * 2713, 6), type: "savings", bal: ri(500, 40000) }] : []), ...(i % 3 === 0 ? [{ no: "9001-" + pad(100000 + i * 911, 6), type: "wallet", bal: ri(20, 900) }] : [])] };
  });
  D.cust = id => D.customers.find(c => c.id === id);
  D.banks = ["Harbor National Bank", "Cedar Trust", "Meridian Bank", "Orchid Savings", "Atlas Commercial Bank", "Sahara Union Bank", "Pearl Islamic Bank", "Delta Bank"];
  D.merchants = ["Olive Market", "City Pharmacy", "Streamly", "Skyline Air", "Harbor Fuel", "Palm Electronics", "Bright Books", "Corner Bakery", "Metro Transit", "Nile Fashion", "Sunset Cinema", "Green Grocer"];
  // ---- payments ledger (shared by transfers, rails, customer 360, analytics) ----
  const rails = ["lypay", "onepay", "fast", "internal", "card"], types = { lypay: ["P2P", "QR merchant", "Bill"], onepay: ["P2P", "QR merchant", "Pull"], fast: ["Domestic", "Cross-border"], internal: ["Own accounts", "Customer"], card: ["POS", "Online", "ATM"] };
  D.tx = Array.from({ length: 90 }, (_, i) => {
    const rail = i % 7 === 0 ? "card" : i % 5 === 0 ? "fast" : i % 9 === 0 ? "internal" : i % 2 ? "lypay" : "onepay", c = D.customers[(i * 7 + 3) % D.customers.length], inbound = rail !== "card" && (i % 3 !== 0);
    const st = i % 17 === 0 ? "failed" : i % 11 === 0 ? "pending" : i % 29 === 0 ? "reversed" : i % 23 === 0 ? "exception" : "completed";
    const mins = 14 * 60 + 30 - i * 9, day = 24 - Math.floor(mins < 0 ? (-mins) / 1440 + 1 : 0), mm = ((mins % 1440) + 1440) % 1440;
    return { id: "T" + (50000 + i), ref: ({ lypay: "LY", onepay: "OP", fast: "FT", internal: "IN", card: "CD" })[rail] + (900200 + i * 13), rail, dir: inbound ? "in" : "out", cust: c.id, cp: rail === "card" ? pick(D.merchants) : pick(D.banks), type: pick(types[rail]),
      amount: +(ri(8, 2400) + (R() > .5 ? .5 : 0)).toFixed(2), fee: rail === "internal" ? 0 : +(ri(0, 6) * .25).toFixed(2), status: st, at: `2026-10-${pad(day)} ${pad(Math.floor(mm / 60))}:${pad(mm % 60)}`, ch: pick(["app", "web", "branch", "api"]), score: ri(2, 96) };
  });
  D.txOf = id => D.tx.filter(t => t.cust === id);
  // ---- cards ----
  D.products = [
    { id: "P1", name: "Everyday Debit", kind: "debit", network: "Domestic", fee: 0, vendor: "Vendor Alpha", bin: "421100", plastic: "PL1", tokens: true, color: "#0b5a99" },
    { id: "P2", name: "Gold Credit", kind: "credit", network: "International", fee: 45, vendor: "Vendor Alpha", bin: "537700", plastic: "PL2", tokens: true, color: "#8c2a2a" },
    { id: "P3", name: "Travel Prepaid", kind: "prepaid", network: "International", fee: 10, vendor: "Vendor Beta", bin: "489900", plastic: "PL3", tokens: true, color: "#00797e" },
    { id: "P4", name: "Online Virtual", kind: "virtual", network: "International", fee: 0, vendor: "Vendor Beta", bin: "489901", plastic: "—", tokens: false, color: "#4a3b9c" },
    { id: "P5", name: "Corporate Prepaid", kind: "prepaid", network: "Domestic", fee: 6, vendor: "Vendor Beta", bin: "421300", plastic: "PL1", tokens: false, color: "#3d5a2b" },
    { id: "P6", name: "Youth Debit", kind: "debit", network: "Domestic", fee: 0, vendor: "Vendor Alpha", bin: "421150", plastic: "PL4", tokens: true, color: "#b4540a" }];
  D.prod = id => D.products.find(p => p.id === id);
  D.plastics = [
    { id: "PL1", name: "Classic PVC", material: "PVC", chip: "Contact", finish: "Gloss", cost: 0.62, stock: 18400, min: 5000 },
    { id: "PL2", name: "Premium soft-touch", material: "PVC", chip: "Dual interface", finish: "Soft-touch", cost: 1.35, stock: 3200, min: 3000 },
    { id: "PL3", name: "Recycled PVC", material: "rPVC", chip: "Dual interface", finish: "Matte", cost: 0.88, stock: 7600, min: 4000 },
    { id: "PL4", name: "Youth transparent", material: "PETG", chip: "Contact", finish: "Transparent", cost: 1.1, stock: 2100, min: 2500 }];
  const CST = ["active", "active", "active", "frozen", "active", "pending", "active", "blocked"];
  D.cards = D.customers.slice(0, 26).map((c, i) => {
    const p = D.products[i % 6];
    return { id: "K" + (500 + i), cust: c.id, holder: c.n[0].toUpperCase(), product: p.id, kind: p.kind, last4: String(4100 + i * 173).slice(-4), exp: pad(1 + i % 9) + "/" + (28 + i % 3), status: CST[i % 8], dailyLimit: [1500, 3000, 800, 5000][i % 4], atmLimit: [600, 1200, 300, 2000][i % 4], spent: [120, 0, 340, 75][i % 4] * (i % 3 + 1),
      ch: { atm: true, pos: true, online: p.kind !== "debit" || i % 2 === 0, contactless: p.kind !== "virtual", intl: p.kind === "credit" || p.kind === "virtual" }, ds3: p.kind !== "debit" || i % 3 === 0, issued: `2026-0${1 + i % 9}-${pad(2 + i)}`, branch: "BR0" + (1 + i % 6), pinTries: i % 7 === 6 ? 2 : 0 };
  });
  D.card = id => D.cards.find(c => c.id === id);
  // ---- branches ----
  D.branches = [["BR01", "Harbor Street", "شارع الميناء"], ["BR02", "Old Town Square", "ساحة المدينة القديمة"], ["BR03", "Airport Road", "طريق المطار"], ["BR04", "University Quarter", "حي الجامعة"], ["BR05", "Palm Bay Mall", "مركز خليج النخيل"], ["BR06", "Northgate", "البوابة الشمالية"], ["BR07", "Riverside", "ضفة النهر"], ["BR08", "Hill Crest", "قمة التل"], ["BR09", "Central Market", "السوق المركزي"], ["BR10", "Free Zone", "المنطقة الحرة"]].map((b, i) => ({ id: b[0], n: [b[1], b[2]], city: CITIES[i % 6], open: i !== 7 && i !== 9, queue: ri(0, 14), cash: ri(120, 900) * 1000, atms: 1 + i % 4, staff: ri(6, 22), cardStock: ri(40, 400), mgr: people[(i * 3) % 20][0] }));
  D.br = id => D.branches.find(b => b.id === id);
  D.brn = b => NX.S.lang === "ar" ? b.n[1] : b.n[0];
  // ---- risk simulation sample: 600 historical payments with a hidden fraud label ----
  const RS = NX.rnd(777);
  D.sample = Array.from({ length: 600 }, (_, i) => {
    const fraud = RS() < .045, night = fraud ? RS() < .6 : RS() < .09, newDev = fraud ? RS() < .7 : RS() < .06, newPayee = fraud ? RS() < .85 : RS() < .22;
    const amount = Math.round(fraud ? 600 + RS() * 7000 : 8 + Math.pow(RS(), 2.4) * 3200), vel = fraud ? 2 + Math.floor(RS() * 7) : Math.floor(RS() * RS() * 5), intl = fraud ? RS() < .35 : RS() < .05;
    return { i, fraud, night, newDev, newPayee, amount, vel, intl, day: i % 30 };
  });
  D.R = { ri, pick, pad, R };
})();
