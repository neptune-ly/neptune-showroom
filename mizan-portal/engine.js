/* Reference-style assessment engine (demonstration). Deterministic; never treats UNKNOWN as PASS. */
const GATE_KEYS = ["identity.verified", "compliance.aml_clear", "purpose.asset_eligible", "consent.valid", "merchant.verified", "invoice.verified"];
const FEATURE_NAMES = {
  "identity.verified": ["Identity verified", "التحقق من الهوية"], "compliance.aml_clear": ["Sanctions / AML cleared", "اجتياز العقوبات ومكافحة غسل الأموال"],
  "purpose.asset_eligible": ["Asset eligible for financing", "الأصل مؤهل للتمويل"], "consent.valid": ["Customer consent valid", "موافقة العميل سارية"],
  "merchant.verified": ["Merchant verified by Merchant Bank", "التاجر موثق من مصرف التاجر"], "invoice.verified": ["Invoice verified", "الفاتورة موثقة"],
  "income.verified_monthly": ["Monthly income (FCMS salary median)", "الدخل الشهري (وسيط رواتب FCMS)"], "cic.monthly_obligations": ["Monthly obligations (credit centre)", "الالتزامات الشهرية (مركز الائتمان)"],
  "bank.behavior_index": ["Account behaviour index (0–1)", "مؤشر سلوك الحساب (0–1)"], "account.tenure_months": ["Account tenure (months)", "عمر الحساب (بالأشهر)"]
};
const SRC_NAMES = { IDENTITY_PROVIDER: ["Identity provider", "مزود الهوية"], DOCUMENT: ["Document review", "مراجعة المستندات"], MIZAN_HISTORY: ["Mizan history", "سجل ميزان"], MERCHANT_BANK: ["Merchant Bank (MIP)", "مصرف التاجر (MIP)"], FCMS: ["FCMS salary system", "نظام رواتب FCMS"], CREDIT_INFORMATION_CENTRE: ["Credit information centre", "مركز المعلومات الائتمانية"], CBS_READ_MODEL: ["Core banking read model", "نموذج قراءة النظام المصرفي"], SELF_DECLARED: ["Self-declared", "إفادة ذاتية"] };

const usable = f => f && f.exp > 0 && (f.conf === "VERIFIED_PRIMARY" || f.conf === "VERIFIED_SECONDARY") && f.v !== "unknown" && f.v != null;
function evidenceIssue(f) {
  if (!f || f.v == null || f.v === "unknown" || f.conf === "MISSING") return "missing";
  if (f.conf === "CONFLICTED") return "conflict";
  if (f.exp <= 0) return "expired";
  if (f.conf === "SELF_DECLARED") return "selfdeclared";
  if (f.v === false) return "notmet";
  return null;
}
function gateStatus(f) { // PASS | FAIL | UNKNOWN — unknown is never pass
  if (!usable(f)) return "UNKNOWN";
  return f.v === true ? "PASS" : "FAIL";
}

function murabaha(financed, term, ratePct, downPct = 0) {
  const fin = Math.round(financed * (1 - downPct / 100));
  const profit = Math.round(fin * ratePct / 100 * term / 12);
  const price = fin + profit;
  const inst = Math.ceil(price / term);
  // implied effective annual rate (disclosure comparison only; profit is fixed at sale)
  let lo = 0, hi = 1;
  for (let i = 0; i < 60; i++) { const r = (lo + hi) / 2; const pv = r === 0 ? inst * term : inst * (1 - Math.pow(1 + r, -term)) / r; if (pv > fin) lo = r; else hi = r; }
  const eff = Math.pow(1 + lo, 12) - 1;
  return { fin, profit, price, inst, eff: eff * 100, down: financed - fin };
}

const POLICY = { version: "reference draft pack · pilot-0.9.0", dsrCeiling: 0.40, incomeHaircut: 0.10, stressIncome: 0.20, minScore: 60, strongScore: 75 };

function assess(c) {
  const F = c.f, P = POLICY, m = murabaha(c.principal, c.term, c.rate);
  const gates = GATE_KEYS.map(k => ({ k, st: gateStatus(F[k]), issue: evidenceIssue(F[k]) }));
  const inc = F["income.verified_monthly"], obl = F["cic.monthly_obligations"], beh = F["bank.behavior_index"], ten = F["account.tenure_months"];
  const incomeOk = usable(inc), oblOk = usable(obl), behOk = usable(beh), tenOk = usable(ten);
  const income = inc.v || 0, oblV = obl.v || 0;
  const netIncome = income * (1 - P.incomeHaircut);
  const cap = Math.max(0, Math.round(netIncome * P.dsrCeiling - oblV));
  const stressCap = Math.max(0, Math.round(income * (1 - P.stressIncome) * (1 - P.incomeHaircut) * P.dsrCeiling - oblV * 1.1));
  const comps = [];
  const add = (code, en, ar, pts, max, note) => comps.push({ code, en, ar, pts: Math.round(pts * 10) / 10, max, note });
  add("INC_VERIFIED", "Verified income continuity", "استمرارية الدخل الموثق", incomeOk ? 25 : 0, 25, incomeOk ? null : "income");
  const head = cap > 0 ? (cap - m.inst) / cap : 0;
  add("AFFORD_HEADROOM", "Affordability headroom", "هامش القدرة على السداد", m.inst <= cap ? 25 * Math.min(1, head / 0.5) : 0, 25);
  add("ACCT_BEHAVIOR", "Account behaviour", "سلوك الحساب", behOk ? beh.v * 20 : 0, 20, behOk ? null : "beh");
  add("ACCT_TENURE", "Account tenure", "عمر الحساب", tenOk ? Math.min(ten.v, 48) / 48 * 10 : 0, 10, tenOk ? null : "ten");
  const dsr = income ? oblV / income : 1;
  add("OBLIGATION_LOAD", "Existing obligation load", "حمل الالتزامات القائمة", oblOk && incomeOk ? 10 * (1 - Math.min(1, dsr / P.dsrCeiling)) : 0, 10);
  const mer = gates.find(g => g.k === "merchant.verified").st === "PASS" && gates.find(g => g.k === "invoice.verified").st === "PASS";
  add("MERCHANT_QUALITY", "Merchant and invoice quality", "جودة التاجر والفاتورة", mer ? 10 : 0, 10);
  const score = Math.round(comps.reduce((a, x) => a + x.pts, 0));
  const failG = gates.filter(g => g.st === "FAIL"), unkG = gates.filter(g => g.st === "UNKNOWN");
  const gaps = [!incomeOk && "income", !oblOk && "obl", !behOk && "beh", !tenOk && "ten"].filter(Boolean);
  const selfDecl = inc.conf === "SELF_DECLARED";
  const affordOk = m.inst <= cap, stressOk = m.inst <= stressCap;
  let route, why = [];
  if (failG.length) { route = "DECLINE_HARD_GATE"; why.push("GATE_FAILED"); }
  else if (unkG.length || (gaps.length && !selfDecl) ) { route = "MORE_EVIDENCE_REQUIRED"; why.push(unkG.length ? "GATE_UNKNOWN_BLOCKS" : "EVIDENCE_STALE_OR_MISSING"); }
  else if (!affordOk) { route = "NOT_ELIGIBLE_NOW"; why.push("AFFORDABILITY_EXCEEDED"); }
  else if (selfDecl || score < P.minScore) { route = "MANUAL_REVIEW"; why.push(selfDecl ? "INCOME_NOT_VERIFIED" : "SCORE_BELOW_MIN"); }
  else if (!stressOk || score < P.strongScore) { route = "ELIGIBLE_WITH_CONDITIONS"; why.push(!stressOk ? "STRESS_AFFORDABILITY_FAILED" : "SCORE_MODERATE"); }
  else { route = "ELIGIBLE_WITHIN_POLICY"; why.push("WITHIN_POLICY"); }
  return { m, gates, comps, score, route, why, cap, stressCap, affordOk, stressOk, income, oblV, netIncome, gaps, selfDecl, dsr,
    pd: Math.min(0.2, Math.max(0.01, 0.125 - score * 0.0011)), blocking: route === "MORE_EVIDENCE_REQUIRED" || route === "DECLINE_HARD_GATE" };
}
const REASON_TEXT = {
  GATE_FAILED: ["A mandatory gate failed. The score cannot override a failed gate.", "فشل شرط إلزامي. لا يمكن للنتيجة تجاوز الشرط الفاشل."],
  GATE_UNKNOWN_BLOCKS: ["A mandatory gate is UNKNOWN (missing, expired or unconfirmed). UNKNOWN is never treated as PASS.", "أحد الشروط الإلزامية غير معروف (مفقود أو منتهٍ أو غير مؤكد). غير المعروف لا يُعامل كاجتياز."],
  EVIDENCE_STALE_OR_MISSING: ["Required numeric evidence is expired or missing; the case cannot be scored as clean.", "أدلة رقمية مطلوبة منتهية أو مفقودة؛ لا يمكن اعتبار الحالة سليمة."],
  AFFORDABILITY_EXCEEDED: ["Proposed installment exceeds the maximum affordable installment.", "القسط المقترح يتجاوز الحد الأقصى للقسط المحتمل."],
  INCOME_NOT_VERIFIED: ["Income is self-declared, so it earns no points; a human must review.", "الدخل مُعلن ذاتيًا فلا يمنح نقاطًا؛ يلزم مراجعة بشرية."],
  SCORE_BELOW_MIN: ["Score is below the minimum for straight-through handling.", "النتيجة أقل من الحد الأدنى للمعالجة المباشرة."],
  STRESS_AFFORDABILITY_FAILED: ["Installment passes today but fails the 20% income-shock test; conditions apply.", "القسط مقبول اليوم لكنه يفشل في اختبار انخفاض الدخل 20٪؛ تُطبّق شروط."],
  SCORE_MODERATE: ["Score is in the moderate band; conditions apply.", "النتيجة ضمن النطاق المتوسط؛ تُطبّق شروط."],
  WITHIN_POLICY: ["All gates passed, affordability and stress tests passed, score in the strong band.", "اجتيزت جميع الشروط واختبارا القدرة والضغط والنتيجة في النطاق القوي."]
};
const ROUTE_TONE = r => r.startsWith("ELIGIBLE_WITHIN") ? "good" : r === "ELIGIBLE_WITH_CONDITIONS" ? "info" : r === "MANUAL_REVIEW" || r === "MORE_EVIDENCE_REQUIRED" ? "warn" : "bad";
const evSig = c => Object.entries(c.f).map(([k, v]) => k + v.v + v.conf + (v.exp > 0 ? 1 : 0)).join("|");
function fakeHash(str, n = 16) { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909); h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909); return ((h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0")).slice(0, n); }

/* Sharia/legal control — tri-state */
const SHARIA_CONTROLS = [
  ["asset", ["Asset permissible and tangible", "الأصل مباح وملموس"]], ["goods", ["Goods screened against prohibited list", "فحص السلع مقابل قائمة المحظورات"]],
  ["sequence", ["Sequence enforced: bank buys and possesses before it sells", "تسلسل ملزم: يشتري المصرف ويحوز قبل أن يبيع"]],
  ["template", ["Contract template version approved by Sharia board", "نموذج العقد معتمد من هيئة الرقابة الشرعية"]],
  ["disclose", ["Cost, profit and price disclosed before acceptance", "الإفصاح عن التكلفة والربح والسعر قبل القبول"]],
  ["latefee", ["No interest-based late charge accrues to the bank", "لا غرامة تأخير ربوية تعود للمصرف"]]
];
function shariaStatus(c) { const v = Object.values(c.sh); return v.includes("fail") ? "BLOCKED" : v.includes("unk") ? "HOLD" : "CLEARED"; }

/* Portfolio stress model (illustrative, linear-convex) */
function stress(p) {
  const base = { npl: NPL_SERIES[11], dpd30: 4.6, book: BOOK_SERIES[11] * 1e6 };
  const addNpl = p.delay * 0.2 + p.income * 0.17 + Math.pow(p.income / 10, 2) * 0.35 + p.merchant * 0.6 + p.delay * p.income / 100 * 0.04;
  const npl = base.npl + addNpl, dpd30 = base.dpd30 + addNpl * 1.5;
  const loss = base.book * npl / 100 * 0.55;
  return { npl, dpd30, loss, lossPct: loss / base.book * 100, base };
}
