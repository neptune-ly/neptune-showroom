/* Core: state, helpers, charts, shell, router */
const Q = new URLSearchParams(location.search);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
const S = {
  lang: Q.get("lang") || store.get("mz.lang") || "en",
  theme: Q.get("theme") || store.get("mz.theme") || "light",
  role: Q.get("role") || "analyst",
  menu: false, filter: "ALL", q: "", cf: "ALL", sel: null, mf: "ALL",
  cases: JSON.parse(JSON.stringify(CASES)),
  audit: SEED_AUDIT.map(a => ({ ts: a[0], role: a[1], area: a[2], en: a[3], ar: a[4] })),
  approvals: PENDING_APPROVALS.map(a => ({ ...a, st: "pending" })),
  mip: MIP_LOG.map(m => ({ ...m })),
  collect: JSON.parse(JSON.stringify(COLLECT_LOG)),
  pilot: PILOT.map(p => ({ ...p })),
  stress: { delay: 10, income: 10, merchant: 2 },
  pricing: { cost: 6400, term: 12, rate: 7.5, down: 0, funding: 4.5, fee: 1.2, lgd: 55 },
  settle: { amount: 6880, fee: 1.2 },
  policyDraft: null, cbs: {}, ack: {}, disputeSel: "DSP-301", merchantSel: null, contractSel: null, reportSel: "R1",
  peers: PEERS.map(p => ({ ...p })), disputes: DISPUTES.map(d => ({ ...d })), merchants: MERCHANTS.map(m => ({ ...m, checks: [...m.checks] })), recv: RECEIVABLES.map(r => ({ ...r })),
  signals: SIGNALS.map(s => ({ ...s }))
};
S.cases.forEach(c => { const s = c.sharia; c.sh = { asset: s.asset, goods: s.purchase, sequence: s.possess, template: s.template, disclose: s.disclose, latefee: s.latefee }; if (["RECOMMENDED", "APPROVED", "OFFERED", "ACTIVE"].includes(c.state)) Object.keys(c.sh).forEach(k => c.sh[k] = "pass"); if (["RECOMMENDED", "APPROVED", "OFFERED", "ACTIVE"].includes(c.state) || c.state === "DECLINED") { c.snap = { at: c.applied, route: null }; } if (["RECOMMENDED"].includes(c.state)) c.rec = { by: "analyst", at: "2026-09-12T09:00:00Z", note: "" }; });
S.cases.forEach(c => { if (c.snap) { const a = assess(c); c.snap = { at: c.applied, route: a.route, score: a.score, hash: fakeHash(c.id + a.route), sig: evSig(c) }; } });

const T0 = Date.now(); const clock = () => new Date(NOW.getTime() + (Date.now() - T0) + 3600e3).toISOString();
const L = () => S.lang;
const t = (en, ar, fr) => S.lang === "ar" ? ar : (S.lang === "fr" && fr) ? fr : en;
const nm = a => S.lang === "ar" ? a[1] : a[0];
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nf = (n, d = 0) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const num = (n, d = 0) => `<span class="num">${nf(n, d)}</span>`;
const money = (n, d = 0) => `<span class="num">${nf(n, d)}</span> <span class="hint" style="font-size:.8em">${t("LYD", "د.ل")}</span>`;
const pct = (n, d = 1) => `<span class="num">${nf(n, d)}%</span>`;
const loc = () => S.lang === "ar" ? "ar-LY-u-nu-latn" : "en-GB";
const fdate = v => v && v !== "—" ? new Intl.DateTimeFormat(loc(), { day: "2-digit", month: "short", year: "numeric" }).format(new Date(v)) : "—";
const fdt = v => new Intl.DateTimeFormat(loc(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" }).format(new Date(v));
const ic = (n, cls = "") => `<span class="ic ${cls}" style="--i:url(assets/icons/${n}.svg)" aria-hidden="true"></span>`;
const roleOf = id => ROLES.find(r => r.id === id);
const can = p => roleOf(S.role).perms.includes(p);
const merchantOf = id => S.merchants.find(m => m.id === id);
const peerOf = id => S.peers.find(p => p.id === id);
const productOf = id => PRODUCTS.find(p => p.id === id);
const caseOf = id => S.cases.find(c => c.id === id);

const LABEL = {
  EVIDENCE: ["Evidence needed", "بانتظار الأدلة"], CREDIT_REVIEW: ["Credit review", "مراجعة الائتمان"], RECOMMENDED: ["Supervisor review", "مراجعة المشرف"], APPROVED: ["Credit approved", "تمت الموافقة الائتمانية"],
  OFFERED: ["Awaiting customer", "بانتظار العميل"], ACTIVE: ["Active", "نشط"], DECLINED: ["Declined", "مرفوض"],
  UAT_ACTIVE: ["Active in pilot test", "نشط في اختبار التجربة"], CANDIDATE: ["Candidate", "مرشح"], PENDING_REVIEW: ["Awaiting review", "بانتظار المراجعة"], SUSPENDED: ["Suspended", "معلق"],
  APPROVED_DD: ["Approved", "معتمد"], ENHANCED_DD: ["Enhanced due diligence", "عناية واجبة معززة"], EXPIRED_DOCS: ["Documents expired", "مستندات منتهية"],
  ELIGIBLE_WITHIN_POLICY: ["Within policy", "ضمن السياسة"], ELIGIBLE_WITH_CONDITIONS: ["Conditions required", "مطلوب استيفاء شروط"], MANUAL_REVIEW: ["Human review required", "مطلوب مراجعة بشرية"],
  MORE_EVIDENCE_REQUIRED: ["More evidence required", "مطلوب أدلة إضافية"], NOT_ELIGIBLE_NOW: ["Outside affordability policy", "خارج سياسة القدرة على السداد"], DECLINE_HARD_GATE: ["Mandatory gate failed", "فشل شرط إلزامي"],
  PASS: ["Pass", "اجتياز"], FAIL: ["Fail", "إخفاق"], UNKNOWN: ["Unknown", "غير معروف"], CLEARED: ["Cleared", "معتمد"], HOLD: ["Hold: unknown", "إيقاف: غير معروف"], BLOCKED: ["Blocked", "محظور"],
  SIGNED_RECEIPT: ["Signed receipt", "إيصال موقّع"], REJECTED: ["Rejected", "مرفوض"], DELIVERED: ["Delivered", "مُسلَّم"],
  OPEN: ["Open", "مفتوح"], EVIDENCE_REQUESTED: ["Evidence requested", "طُلبت أدلة"], ESCALATED: ["Escalated", "مُصعّد"], RETURN_REQUESTED: ["Return requested", "طلب إرجاع"], RESOLVED: ["Resolved", "محلول"],
  open: ["Not met", "غير مستوفى"], progress: ["In progress", "قيد التنفيذ"], done: ["Met", "مستوفى"],
  high: ["High", "مرتفع"], med: ["Medium", "متوسط"], low: ["Low", "منخفض"], pending: ["Pending", "معلق"], approved: ["Approved", "معتمد"], rejected: ["Rejected", "مرفوض"]
};
const TONE = { ACTIVE: "good", APPROVED: "good", APPROVED_DD: "good", UAT_ACTIVE: "good", ELIGIBLE_WITHIN_POLICY: "good", PASS: "good", CLEARED: "good", SIGNED_RECEIPT: "good", RESOLVED: "good", done: "good", approved: "good",
  DECLINED: "bad", SUSPENDED: "bad", EXPIRED_DOCS: "bad", NOT_ELIGIBLE_NOW: "bad", DECLINE_HARD_GATE: "bad", FAIL: "bad", BLOCKED: "bad", REJECTED: "bad", ESCALATED: "bad", high: "bad", rejected: "bad", open: "bad",
  EVIDENCE: "warn", MORE_EVIDENCE_REQUIRED: "warn", MANUAL_REVIEW: "warn", UNKNOWN: "warn", HOLD: "warn", ENHANCED_DD: "warn", PENDING_REVIEW: "warn", EVIDENCE_REQUESTED: "warn", RETURN_REQUESTED: "warn", med: "warn", progress: "warn", pending: "warn",
  CREDIT_REVIEW: "info", RECOMMENDED: "info", OFFERED: "info", ELIGIBLE_WITH_CONDITIONS: "info", CANDIDATE: "info", OPEN: "info", low: "info" };
const badge = (k, lbl) => `<span class="badge ${TONE[k] || ""}"><i class="dot"></i>${esc(lbl || (LABEL[k] ? nm(LABEL[k]) : k))}</span>`;
const ddKey = d => d === "APPROVED" ? "APPROVED_DD" : d;

/* ---------- charts (hand-written SVG) ---------- */
function lineChart({ series, xs, w = 620, h = 240, yMax, yFmt = v => v, band, xlabels }) {
  const narrow = innerWidth < 700; if (narrow) { w = 380; h = Math.min(h, 230); }
  const pl = 44, pr = 12, pt = 12, pb = 28, iw = w - pl - pr, ih = h - pt - pb;
  const maxX = Math.max(...xs), max = yMax || Math.ceil(Math.max(...series.flatMap(s => s.pts)) * 1.15 * 10) / 10;
  const X = x => (S.lang === "ar" ? pl + iw - x / maxX * iw : pl + x / maxX * iw), Y = y => pt + ih - y / max * ih;
  let g = "";
  for (let i = 0; i <= 4; i++) { const v = max * i / 4, y = Y(v); g += `<line class="gl" x1="${pl}" x2="${w - pr}" y1="${y}" y2="${y}"/><text x="${pl - 8}" y="${y + 4}" text-anchor="end">${esc(yFmt(+v.toFixed(2)))}</text>`; }
  xs.forEach((x, i) => { if (xlabels ? (!narrow || i % 2 === 0) : x % Math.ceil(xs.length / 8) === 0) g += `<text x="${X(x)}" y="${h - 8}" text-anchor="middle">${esc(xlabels ? xlabels[i] : x)}</text>`; });
  if (band) g += `<line x1="${pl}" x2="${w - pr}" y1="${Y(band.v)}" y2="${Y(band.v)}" stroke="var(--c3)" stroke-width="1.5" stroke-dasharray="6 4"/><text x="${S.lang === "ar" ? pl + 36 : w - pr}" y="${Y(band.v) - 6}" text-anchor="${S.lang === "ar" ? "start" : "end"}" style="fill:var(--c3)">${esc(band.label)}</text>`;
  const lines = series.map((s, si) => {
    const pts = s.pts.map((v, i) => `${X(xs[i])},${Y(v)}`).join(" ");
    const last = s.pts.length - 1;
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="${s.w || 2.5}" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${X(xs[last])}" cy="${Y(s.pts[last])}" r="4" fill="${s.color}"/>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(series.map(s => s.name).join(", "))}"><line class="ax" x1="${pl}" x2="${w - pr}" y1="${Y(0)}" y2="${Y(0)}"/>${g}${lines}</svg>`;
}
function barChart({ items, w = 520, h = 220, color = "var(--c1)", fmt = v => v, max }) {
  if (innerWidth < 700) w = 380;
  const pl = 8, pb = 40, pt = 22, n = items.length, gap = 12, bw = (w - pl * 2 - gap * (n - 1)) / n, m = max || Math.max(...items.map(i => i.v)) * 1.1 || 1, ih = h - pb - pt;
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(items.map(i => i.label + " " + i.v).join(", "))}">` + items.map((it, i) => {
    const bh = Math.max(2, it.v / m * ih), x = S.lang === "ar" ? w - pl - bw * (i + 1) - gap * i : pl + i * (bw + gap);
    return `<rect x="${x}" y="${pt + ih - bh}" width="${bw}" height="${bh}" rx="6" fill="${it.color || color}"/><text x="${x + bw / 2}" y="${pt + ih - bh - 6}" text-anchor="middle" style="fill:var(--ink);font-weight:700">${esc(fmt(it.v))}</text><text x="${x + bw / 2}" y="${h - 18}" text-anchor="middle">${esc(it.label)}</text>${it.sub ? `<text x="${x + bw / 2}" y="${h - 4}" text-anchor="middle" style="font-size:11px">${esc(it.sub)}</text>` : ""}`;
  }).join("") + `</svg>`;
}
function stackBar(parts, h = 52) { // [{label,v,color}]
  const tot = parts.reduce((a, p) => a + p.v, 0);
  return `<div class="pool-bar" style="height:${h}px">${parts.map(p => `<div style="flex:${p.v};background:${p.color};color:${p.color === "var(--c1)" ? "var(--on-primary)" : "#071A2D"}" title="${esc(p.label)}"><span class="num">${nf(p.v / tot * 100, 0)}%</span></div>`).join("")}</div>`;
}
function hbars(items, fmt = v => nf(v), color = "var(--c1)") {
  const m = Math.max(...items.map(i => i.v)) || 1;
  return items.map(i => `<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;gap:8px;font-size:14px"><span>${esc(i.label)}</span><b>${fmt(i.v)}</b></div><div class="meter"><i style="width:${i.v / m * 100}%;background:${i.color || color}"></i></div></div>`).join("");
}

/* ---------- UI primitives ---------- */
const btn = (txt, act, o = {}) => `<button class="btn ${o.p ? "primary" : ""} ${o.sm ? "sm" : ""} ${o.warn ? "warn" : ""}" data-act="${act}" ${o.arg != null ? `data-arg="${esc(o.arg)}"` : ""} ${o.dis ? `disabled title="${esc(o.dis)}"` : ""}>${o.icon ? ic(o.icon) : ""}${txt}</button>`;
const pageHead = (eyebrow, title, sub = "", actions = "") => `<header class="page-h"><div><span class="eyebrow">${eyebrow}</span><h1 class="title">${title}</h1>${sub ? `<p class="sub">${sub}</p>` : ""}</div><div style="display:flex;gap:10px;flex-wrap:wrap">${actions}</div></header>`;
const notice = (title, text, tone = "") => `<div class="notice ${tone}" role="status"><b>${title}</b>${text}</div>`;
const table = (heads, rows, o = {}) => `<div class="tablewrap" ${o.label ? `role="region" aria-label="${esc(o.label)}" tabindex="0"` : ""}><table><thead><tr>${heads.map(h => `<th class="${h.r ? "r" : ""}">${h.t || h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
const chip = (txt, act, on, arg) => `<button class="chip" data-act="${act}" data-arg="${esc(arg)}" aria-pressed="${on}">${txt}</button>`;
const reqHint = (perm) => { const r = ROLES.find(x => x.perms.includes(perm)); return r ? t("Requires role: ", "يتطلب دور: ") + nm(r.name) : ""; };

function toast(msg) { const el = document.getElementById("toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 3400); }
function log(area, en, ar) { S.audit.unshift({ ts: clock(), role: S.role, area, en, ar }); }
function openDrawer(html, modal) { closeOverlay(); const o = document.createElement("div"); o.className = "overlay" + (modal ? " modal-wrap" : ""); o.id = "overlay"; o.innerHTML = `<div class="${modal ? "modal" : "drawer"}" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`; o.addEventListener("click", e => { if (e.target === o) closeOverlay(); }); document.body.appendChild(o); o.firstChild.focus(); }
function closeOverlay() { const o = document.getElementById("overlay"); if (o) o.remove(); }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeOverlay(); });

/* ---------- routing & shell ---------- */
const MZ_MARK = `<svg class="mz-mark" viewBox="0 0 96 96" aria-hidden="true"><path d="M20 70V26l28 26 28-26v44" fill="none" stroke-width="10.5" stroke-linejoin="round" stroke-linecap="round"/><rect x="20" y="80" width="56" height="6" rx="3"/></svg>`;
const mzLock = () => `<span class="mz-lock">${MZ_MARK}<span class="mz-txt"><b class="mz-word">${t("Mizan", "ميزان")}</b><small class="mz-by">${t("by Neptune", "من نبتون")}</small></span></span>`;
const lookMenu = () => `<details class="look-menu" id="lookMenu"><summary class="btn sm" aria-label="${t("Visual look", "المظهر")}"><span class="looks-dot" id="lookDot"></span><span id="lookName" class="look-cur"></span></summary><div class="look-pop" id="lookPick"></div></details>`;
function syncLook() { const l = Looks.list.find(x => x.id === Looks.get()); const d = document.getElementById("lookDot"); if (!d || !l) return; d.style.cssText = `--a:${l.brand};--b:${l.accent};--c:${l.canvas}`; document.getElementById("lookName").textContent = l.name; }
document.addEventListener("looks:change", () => { syncLook(); const m = document.getElementById("lookMenu"); if (m) m.open = false; });
const NAV = [
  ["operate", ["Operate", "التشغيل"], [["overview", "home", ["Overview", "نظرة عامة"]], ["applications", "request", ["Applications", "الطلبات"]], ["contracts", "statement", ["Contracts", "العقود"]], ["receivables", "loan", ["Receivables", "الذمم المدينة"]], ["collections", "phone", ["Collections", "التحصيل"]]]],
  ["network", ["Merchants and network", "التجار والشبكة"], [["merchants", "shopping-bag", ["Merchant registry", "سجل التجار"]], ["network", "link", ["Network connections", "اتصالات الشبكة"]], ["settlement", "coins", ["Settlement pool", "مجمّع التسوية"]], ["disputes", "dispute", ["Disputes", "النزاعات"]]]],
  ["insight", ["Insight", "التحليل"], [["portfolio", "chart-line", ["Portfolio and stress", "المحفظة واختبار الضغط"]], ["warning", "warning", ["Early warning", "الإنذار المبكر"]], ["pricing", "pie-budget", ["Pricing simulator", "محاكي التسعير"]], ["reports", "invoice", ["Reports", "التقارير"]]]],
  ["govern", ["Govern", "الحوكمة"], [["products", "category-tag", ["Products and pricing", "المنتجات والتسعير"]], ["policy", "security-shield", ["Risk policy", "سياسة المخاطر"]], ["roles", "users", ["Roles and approvals", "الأدوار والاعتمادات"]], ["audit", "eye", ["Audit log", "سجل التدقيق"]], ["cbs", "accounts", ["CBS integration", "ربط النظام المصرفي"]], ["pilot", "goal", ["Pilot go / no-go", "جاهزية التجربة"]]]]
];
const SCREENS = {};
const parseRoute = () => { const h = location.hash.replace(/^#\/?/, "") || "overview"; const p = h.split("/"); return { name: p[0], a: p[1], b: p[2] }; };

function shell(inner, route) {
  const cnt = { applications: S.cases.filter(c => ["EVIDENCE", "CREDIT_REVIEW", "RECOMMENDED"].includes(c.state)).length, roles: S.approvals.filter(a => a.st === "pending").length, warning: S.signals.filter(s => s.sev === "high" && !S.ack[s.id]).length };
  const cur = route.name === "case" ? "applications" : route.name;
  const side = `<aside class="side ${S.menu ? "open" : ""}" id="side" aria-label="${t("Main navigation", "التنقل الرئيسي")}">
    <div class="brand"><a href="#/overview" aria-label="${t("Mizan by Neptune", "ميزان من نبتون")}" class="mz-lock-a">${mzLock()}</a><small>${t("Financing operations", "عمليات التمويل")}</small></div>
    <nav class="nav">${NAV.map(g => `<div class="nav-h">${nm(g[1])}</div>` + g[2].map(n => `<a href="#/${n[0]}" ${cur === n[0] ? 'aria-current="page"' : ""}>${ic(n[1])}<span>${nm(n[2])}</span>${cnt[n[0]] ? `<span class="cnt num">${cnt[n[0]]}</span>` : ""}</a>`).join("")).join("")}</nav>
    <div class="grow"></div><div class="nep-plate"><img src="assets/brand/Neptune_Logo_Color.png" alt="Neptune" width="120" height="15"></div><div class="sim-note">${t("Demonstration — simulated data. No claim of Sharia or regulator approval. Not connected to any bank system.", "عرض توضيحي — بيانات محاكاة. لا ادعاء باعتماد شرعي أو رقابي. غير متصل بأي نظام مصرفي.")}</div></aside>`;
  const top = `<div class="topbar"><button class="btn menu-btn sm" data-act="menu" aria-label="${t("Open menu", "فتح القائمة")}" aria-expanded="${S.menu}">${ic("menu")}</button>
    <span class="top-mark">${mzLock()}</span><div class="node"><b>${nm(BANK.name)} · ${t("Financing Bank node", "عقدة المصرف الممول")}</b><span>${BANK.node} · ${t("isolated bank-hosted node", "عقدة معزولة مستضافة لدى المصرف")}</span></div>
    <label class="ctl">${ic("user")}<span class="sr">${t("Acting as role", "العمل بدور")}</span><select data-change="role" aria-label="${t("Acting as role", "العمل بدور")}">${ROLES.map(r => `<option value="${r.id}" ${S.role === r.id ? "selected" : ""}>${nm(r.name)} · ${nm(r.user)}</option>`).join("")}</select></label>
    ${lookMenu()}<div class="seg" role="group" aria-label="${t("Language", "اللغة")}"><button data-act="lang" data-arg="en" aria-pressed="${S.lang === "en"}">EN</button><button data-act="lang" data-arg="ar" aria-pressed="${S.lang === "ar"}">العربية</button></div>
    <button class="btn sm" data-act="theme" aria-label="${t("Toggle dark mode", "تبديل الوضع الداكن")}" aria-pressed="${S.theme === "dark"}">${ic(S.theme === "dark" ? "sun" : "moon")}<span class="sr">${t("Theme", "السمة")}</span></button></div>`;
  return `<a class="skip" href="#main">${t("Skip to main content", "تخطي إلى المحتوى")}</a><div class="shell">${side}<div class="scrim ${S.menu ? "show" : ""}" data-act="menu"></div><div class="main">${top}<div class="demo-banner">${t("Demonstration — simulated data", "عرض توضيحي — بيانات محاكاة")} · ${t("Neptune Mizan 1.0 Alpha concept portal", "بوابة مفهوم نبتون ميزان 1.0 ألفا")}</div><main class="page" id="main" tabindex="-1">${inner}</main></div></div><div class="wm">${t("Simulated demonstration", "عرض محاكى")}</div>`;
}

function render(focus) {
  document.documentElement.lang = S.lang; document.documentElement.dir = S.lang === "ar" ? "rtl" : "ltr"; document.documentElement.dataset.odysseyMode = S.theme;
  const r = parseRoute(); const fn = SCREENS[r.name] || SCREENS.overview;
  document.title = "Neptune Mizan — " + t("Financing operations (demo)", "عمليات التمويل (عرض)");
  const sy = window.scrollY;
  document.getElementById("app").innerHTML = shell(fn(r), r);
  Looks.mount(document.getElementById("lookPick"), { label: t("Visual look", "المظهر") }); syncLook();
  if (focus) { const m = document.getElementById("main"); m && m.focus({ preventScroll: true }); window.scrollTo(0, 0); } else window.scrollTo(0, sy);
}
window.addEventListener("hashchange", () => { S.menu = false; closeOverlay(); render(true); });

const ACTS = {};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]"); if (el && !el.disabled) { const f = ACTS[el.dataset.act]; if (f) { f(el.dataset.arg, el, e); } return; }
  const row = e.target.closest("tr[data-href]"); if (row && !e.target.closest("a,button,input,select")) location.hash = row.dataset.href;
});
document.addEventListener("change", e => { const el = e.target.closest("[data-change]"); if (el && ACTS[el.dataset.change]) ACTS[el.dataset.change](el.value, el); });
document.addEventListener("input", e => { const el = e.target.closest("[data-input]"); if (el && ACTS[el.dataset.input]) ACTS[el.dataset.input](el.value, el, e); });
document.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("tr[data-href]")) { e.preventDefault(); location.hash = e.target.dataset.href; } });

Object.assign(ACTS, {
  menu: () => { S.menu = !S.menu; render(); },
  lang: v => { S.lang = v; store.set("mz.lang", v); render(); },
  theme: () => { S.theme = S.theme === "dark" ? "light" : "dark"; store.set("mz.theme", S.theme); render(); },
  role: v => { S.role = v; render(); toast(t("Now acting as ", "العمل الآن بدور ") + nm(roleOf(v).name)); },
  close: closeOverlay
});
const rowLink = (href, label) => `data-href="${href}" tabindex="0" aria-label="${esc(label)}"`;
