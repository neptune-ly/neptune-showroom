// Core: state, theming, router, UI primitives, layers (drawer/modal/toast), maker-checker, audit, command palette.
(function () {
  const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
  const NX = window.NX = { mods: [], hand: {}, inp: {}, layers: [], searchers: [] };
  const GROUPS = NX.groups = [
    { id: "overview", i: "home", t: ["Overview", "Vue d’ensemble", "نظرة عامة"] },
    { id: "customers", i: "users", t: ["Customers", "Clients", "العملاء"] },
    { id: "payments", i: "transfer", t: ["Payments", "Paiements", "المدفوعات"] },
    { id: "cards", i: "card", t: ["Cards", "Cartes", "البطاقات"] },
    { id: "risk", i: "shield", t: ["Risk & control", "Risque & contrôle", "المخاطر والرقابة"] },
    { id: "ops", i: "building", t: ["Operations", "Opérations", "العمليات"] },
    { id: "platform", i: "plug", t: ["Platform", "Plateforme", "المنصة"] }
  ];
  const SOBER = ["classic", "heritage", "private"]; // composition kind per look; everything else is "lively"
  NX.lookKind = id => SOBER.includes(id) ? "sober" : "lively";
  const LK = () => (window.Looks && Looks.list.find(l => l.id === Looks.get())) || { id: "classic", name: "Meridian Bank" };
  NX.look = LK;
  const PERSONAS = NX.PERSONAS = [
    { id: "nour", name: "Nour Haddad", role: ["Operator", "Opératrice", "مشغّلة"] },
    { id: "samir", name: "Samir Qadiri", role: ["Supervisor (checker)", "Superviseur (validateur)", "مشرف (مراجع)"] },
    { id: "hana", name: "Hana Mirza", role: ["Product manager", "Responsable produit", "مديرة منتج"] }
  ];
  const S = NX.S = {
    lang: store.get("lang", (navigator.language || "en").slice(0, 2)), mode: store.get("mode", "light"),
    bankName: store.get("bankName", ""), initial: store.get("initial", ""), accent: store.get("accent", ""), shapeScale: +store.get("shape", 1),
    user: "nour", route: "dashboard", param: "", menu: false, m: {}, tab: {}, groupClosed: {}, appr: [], audit: [], degraded: false, notifRead: false
  };
  if (!LANGS[S.lang]) S.lang = "en";
  NX.m = id => (S.m[id] ||= {});
  NX.tab = (id, def) => S.tab[id] || def;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = NX.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  NX.fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  NX.money = (v, d = 2) => `<span class="num">${NX.fmt(v, d)}</span>`;
  NX.num = v => `<span class="num">${esc(v)}</span>`;
  NX.rnd = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  NX.sleep = ms => new Promise(r => setTimeout(r, ms));
  const user = () => PERSONAS.find(p => p.id === S.user);
  NX.user = user;
  NX.bankName = () => S.bankName.trim() || LK().name;
  NX.initial = () => (S.initial.trim() || NX.bankName())[0] || "N";

  /* ---------- colour helpers ---------- */
  function hex(h) { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
  function lum(h) { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; }
  NX.lum = lum;
  const mixHex = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v * (1 - t) + hex(b)[i] * t).toString(16).padStart(2, "0")).join("");
  function applyTheme() {
    const r = document.documentElement;
    r.lang = S.lang; r.dir = S.lang === "ar" ? "rtl" : "ltr"; r.dataset.odysseyMode = S.mode; r.dataset.kind = NX.lookKind(LK().id);
    // Brand Studio overrides sit ON TOP of the chosen look: accent colour only (name/initial are text).
    ["--accent", "--look-accent", "--look-on-accent", "--on-accent"].forEach(k => r.style.removeProperty(k));
    if (/^#[0-9a-f]{6}$/i.test(S.accent)) { const on = lum(S.accent) > .4 ? "#14110A" : "#FFFFFF"; r.style.setProperty("--accent", S.accent); r.style.setProperty("--look-accent", S.accent); r.style.setProperty("--look-on-accent", on); }
    r.style.setProperty("--rs", S.shapeScale);
    r.style.setProperty("--tonal", "color-mix(in srgb, var(--p) 14%, var(--surface))");
    document.title = `${NX.bankName()} · Nexus Hub — Showroom`;
  }
  NX.applyTheme = applyTheme;

  /* ---------- icons ---------- */
  const P = {
    home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10", users: "M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3 2.7-5 6-5s6 2 6 5M14.5 15.2c.5-.1 1-.2 1.5-.2 3 0 6 1.7 6 5",
    card: "M3 6h18v12H3zM3 10h18M6 15h4", transfer: "M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4", send: "M21 3L10 14M21 3l-7 18-4-7-7-4z",
    shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4", sliders: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4",
    chart: "M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3", bell: "M6 17v-6a6 6 0 1112 0v6l2 2H4zM10 21h4", search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5",
    menu: "M4 7h16M4 12h16M4 17h16", moon: "M20 14A8 8 0 0110 4a8 8 0 1010 10z", sun: "M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5",
    plus: "M12 5v14M5 12h14", lock: "M6 11h12v9H6zM8 11V8a4 4 0 118 0v3", unlock: "M6 11h12v9H6zM8 11V8a4 4 0 017.5-2", key: "M8 15a4 4 0 110-8 4 4 0 010 8zM11 12h9M17 12v3M20 12v2",
    refresh: "M20 11a8 8 0 00-14-4L4 9M4 4v5h5M4 13a8 8 0 0014 4l2-2M20 20v-5h-5", warning: "M12 3l10 18H2zM12 10v5M12 18h0",
    globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18", qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18h2v2",
    receive: "M12 3v13M7 11l5 5 5-5M4 20h16", statement: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6", dispute: "M4 5h16v11H9l-5 4zM12 8v3M12 13h0",
    truck: "M2 6h12v10H2zM14 10h4l3 3v3h-7zM6 19a2 2 0 100-4 2 2 0 000 4zM17 19a2 2 0 100-4 2 2 0 000 4z", box: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
    building: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M8 11h0M12 11h0M16 11h0", calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", mail: "M3 5h18v14H3zM3 7l9 7 9-7",
    headset: "M4 14v-2a8 8 0 0116 0v2M4 14h3v5H4zM17 14h3v5h-3zM17 19c0 1.5-2 2-5 2", pulse: "M3 12h4l3-7 4 14 3-7h4", plug: "M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4",
    code: "M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14", palette: "M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-6-4-11-8-11zM7.5 11h0M10 7h0M15 7.5h0",
    coins: "M9 14a6 6 0 100-12 6 6 0 000 12zM15 8a6 6 0 11-4 10M9 5v6", briefcase: "M3 8h18v12H3zM9 8V5h6v3M3 13h18", wallet: "M3 7h17v13H3zM3 7l13-4v4M16 13h4v3h-4z",
    file: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6", check: "M5 12l5 5 9-10", x: "M6 6l12 12M18 6L6 18", clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z", filter: "M3 5h18l-7 8v6l-4 2v-8z", download: "M12 3v12M7 10l5 5 5-5M4 20h16",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5", usercheck: "M9 12a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6s7 2 7 6M16 11l2 2 4-4", idcard: "M3 5h18v14H3zM7 11a2 2 0 100-4 2 2 0 000 4zM4.5 16c.5-2 5-2 5 0M13 9h5M13 13h4",
    camera: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 100-8 4 4 0 000 8z", list: "M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0", bank: "M3 10l9-6 9 6zM5 10v8M9 10v8M15 10v8M19 10v8M3 21h18",
    flag: "M5 21V4M5 4h12l-2 4 2 4H5", bolt: "M13 2L4 14h7l-1 8 9-12h-7z", trend: "M3 17l6-6 4 4 8-9M15 6h6v6", copy: "M9 9h11v11H9zM5 15V4h11", trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14",
    edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4", play: "M7 4l13 8-13 8z", dots: "M5 12h0M12 12h0M19 12h0", chev: "M9 6l6 6-6 6", arrow: "M5 12h14M13 6l6 6-6 6", phone: "M7 3h10v18H7zM11 18h2",
    map: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14", bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z", atm: "M4 4h16v16H4zM8 9h8M8 13h4M15 16h1", pos: "M7 3h10v18H7zM9 6h6M9 10h1M12 10h1M9 13h1M12 13h1M9 16h4",
    contactless: "M6 8c3 2 3 6 0 8M10 6c5 3 5 9 0 12M14 4c7 4 7 12 0 16", tag: "M3 12V4h8l10 10-8 8zM7.5 8h0", id: "M4 6h16v12H4z", scale: "M12 3v18M5 7h14M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z",
    mobile: "M7 3h10v18H7zM11 18h2", rocket: "M5 19c0-3 1-4 3-4l-1-3 6-8c3-1 6-1 7 0 0 3 0 6-1 7l-8 6-3-1c0 2-1 3-3 3zM15 9h0", info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h0",
    gavel: "M14 4l6 6M10 8l6 6M5 21l8-8M3 11l6-6", flow: "M5 4h5v5H5zM14 15h5v5h-5zM7.5 9v3a3 3 0 003 3H14", user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-6 8-6s8 2 8 6", logout: "M10 4H4v16h6M15 8l4 4-4 4M19 12H9"
  };
  NX.ic = (n, cls = "") => P[n] ? `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n]}"/></svg>` : `<span class="ic ${cls}" style="--i:url(assets/icons/${n}.svg)"></span>`;
  const ic = NX.ic;

  /* ---------- registry & routing ---------- */
  NX.reg = m => { NX.mods.push(m); return m; };
  const modOf = id => NX.mods.find(m => m.id === id || (m.alias || []).includes(id));
  NX.modTitle = m => T.apply(null, m.t);
  function route() {
    const h = decodeURIComponent(location.hash.slice(1) || "dashboard"), [id, ...rest] = h.split("/");
    const m = modOf(id) || modOf("dashboard");
    S.route = m.id; S.param = rest.join("/"); S.alias = id; S.menu = false; S.anim = true; NX.closeAll(true);
    NX.view(true); S.anim = false; window.scrollTo(0, 0);
  }
  NX.go = h => { if (location.hash === "#" + h) route(); else location.hash = h; };

  /* ---------- UI primitives ---------- */
  NX.chip = (s, label) => { const d = ST[s]; return `<span class="chip ${d ? d[3] : ""}">${esc(label || stLabel(s))}</span>`; };
  NX.tone = (t, text) => `<span class="chip ${t}">${esc(text)}</span>`;
  NX.btn = (label, a, p = "", o = {}) => `<button class="btn ${o.cls || ""}" data-a="${a}" data-p="${esc(p)}" ${o.dis ? "disabled" : ""} ${o.id ? `id="${o.id}"` : ""}>${o.ic ? ic(o.ic) : ""}${label ? `<span>${label}</span>` : ""}</button>`;
  NX.kpis = list => `<div class="grid kpis">${list.map((k, i) => `<div class="card kpi f${(i % 4) + 1}"><div class="l">${k.l}</div><div class="v ${k.small ? "sm" : ""}">${k.v}</div>${k.d ? `<div class="d">${k.d}</div>` : ""}</div>`).join("")}</div>`;
  NX.tabs = (id, list, def) => { const cur = NX.tab(id, def || list[0][0]); return `<div class="tabs" role="tablist">${list.map(([k, n, c]) => `<button role="tab" aria-selected="${cur === k}" data-a="tab" data-p="${id}:${k}">${n}${c != null ? `<span class="tcount num">${c}</span>` : ""}</button>`).join("")}</div>`; };
  NX.card = (title, body, o = {}) => `<section class="card ${o.cls || ""}" ${o.style ? `style="${o.style}"` : ""}>${title || o.right ? `<div class="card-h"><h2>${title || ""}</h2>${o.right || ""}</div>` : ""}${body}</section>`;
  NX.field = (label, input, hint) => `<div class="field"><label>${label}</label>${input}${hint ? `<small class="muted">${hint}</small>` : ""}</div>`;
  NX.input = (id, path, val = "", o = {}) => `<input id="${id}" class="inp ${o.cls || ""}" value="${esc(val)}" data-i="set" data-p="${path}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ""} ${o.type ? `type="${o.type}"` : ""} ${o.max ? `maxlength="${o.max}"` : ""} autocomplete="off" ${o.dir ? `dir="${o.dir}"` : ""} ${o.aria ? `aria-label="${esc(o.aria)}"` : ""}>`;
  NX.select = (id, path, opts, val, o = {}) => `<select id="${id}" class="inp ${o.cls || ""}" data-c="set" data-p="${path}" ${o.aria ? `aria-label="${esc(o.aria)}"` : ""}>${opts.map(([k, n]) => `<option value="${esc(k)}" ${String(val) === String(k) ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
  NX.sw = (path, on, label, o = {}) => `<button class="switch" role="switch" aria-label="${esc(label)}" aria-checked="${!!(NX.getPath(path) ?? on)}" data-a="tog" data-p="${path}" ${o.dis ? "disabled" : ""} ${o.act ? `data-x="${o.act}"` : ""}></button>`;
  NX.toolbar = (left, right = "") => `<div class="tools">${left}<span class="grow"></span>${right}</div>`;
  NX.search = (path, val, ph) => `<label class="searchbox">${ic("search")}<input id="q-${path.replace(/\W/g, "_")}" class="inp" data-i="set" data-p="${path}" value="${esc(val || "")}" placeholder="${esc(ph || w("search"))}" aria-label="${esc(ph || w("search"))}" autocomplete="off"></label>`;
  NX.seg = (path, opts, val) => `<div class="seg" role="group">${opts.map(([k, n]) => `<button aria-pressed="${String(val) === String(k)}" data-a="setv" data-p="${path}=${k}">${n}</button>`).join("")}</div>`;
  NX.empty = msg => `<div class="empty">${ic("search")}<div>${msg || w("none")}</div></div>`;
  NX.table = o => {
    const rows = o.rows || [];
    if (!rows.length) return NX.empty(o.empty);
    return `<div class="tbl-wrap"><table ${o.id ? `id="${o.id}"` : ""}><thead><tr>${o.cols.map(c => `<th class="${c.cls || ""}">${c.h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => {
      const id = o.key ? o.key(r) : i; return `<tr ${o.act ? `class="click" tabindex="0" data-a="${o.act}" data-p="${esc(id)}"` : ""}>${o.cols.map(c => `<td class="${c.cls || ""}">${c.r ? c.r(r, i) : esc(r[c.k])}</td>`).join("")}</tr>`;
    }).join("")}</tbody></table></div>`;
  };
  NX.dl = pairs => `<dl class="dl">${pairs.filter(Boolean).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
  NX.timeline = items => `<ol class="tl">${items.map(i => `<li class="${i.s || ""}"><span class="dotm"></span><div><b>${i.t}</b>${i.d ? `<div class="muted">${i.d}</div>` : ""}</div><span class="muted num">${i.at || ""}</span></li>`).join("")}</ol>`;
  NX.stepper = (steps, cur) => `<ol class="steps">${steps.map((s, i) => `<li class="${i < cur ? "done" : i === cur ? "cur" : ""}" ${i === cur ? 'aria-current="step"' : ""}><span class="n">${i < cur ? ic("check") : i + 1}</span><span class="sl">${s}</span></li>`).join("")}</ol>`;
  NX.avatar = (name, cls = "") => `<span class="avatar ${cls}" aria-hidden="true">${esc(String(name).split(/\s+/).map(x => x[0]).slice(0, 2).join(""))}</span>`;
  NX.hero = (title, text, art) => `<div class="hero"><div><h2>${title}</h2><p>${text}</p></div>${art || ""}</div>`;

  /* ---------- layers: drawer / modal / toast ---------- */
  let lastFocus = null;
  function paintLayers() {
    const host = $("#layer"); if (!host) return;
    host.innerHTML = NX.layers.map((L, i) => {
      const v = L.fn(); L.last = v;
      const head = `<header><div><h2 id="lt${i}">${v.t}</h2>${v.sub ? `<div class="muted">${v.sub}</div>` : ""}</div><button class="btn icon-btn" data-a="closeLayer" aria-label="${w("close")}">${ic("x")}</button></header>`;
      return `<div class="scrim ${L.kind}-scrim" data-layer="${i}"><div class="${L.kind} ${L.cls}" role="dialog" aria-modal="true" aria-labelledby="lt${i}" tabindex="-1">${head}<div class="lb">${v.b}</div>${v.f ? `<footer>${v.f}</footer>` : ""}</div></div>`;
    }).join("");
  }
  NX.layer = (kind, fn, cls = "") => {
    if (!NX.layers.length) lastFocus = document.activeElement;
    NX.layers.push({ kind, fn, cls }); paintLayers();
    const el = $(`[data-layer="${NX.layers.length - 1}"] .${kind}`); const f = el && (el.querySelector("[autofocus],input,select,textarea") || el.querySelector(".lb button,.lb a")); (f || el)?.focus({ preventScroll: true });
  };
  NX.drawer = fn => NX.layer("drawer", fn);
  NX.modal = fn => NX.layer("modal", fn);
  NX.closeLayer = () => { NX.layers.pop(); paintLayers(); if (!NX.layers.length && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); };
  NX.closeAll = quiet => { NX.layers = []; paintLayers(); };
  NX.confirm = o => { NX._ok = o.run; NX.modal(() => ({ t: o.t, b: `<p>${o.msg}</p>${o.extra || ""}`, f: `<button class="btn" data-a="closeLayer">${w("cancel")}</button><button class="btn ${o.danger ? "danger-fill" : "primary"}" data-a="confirmOk" autofocus>${o.ok || w("confirm")}</button>` })); };
  NX.on = h => Object.assign(NX.hand, h);
  NX.onInput = new Proxy(h => Object.assign(NX.inp, h), { set(t, k, v) { NX.inp[k] = v; return true; }, get(t, k) { return k in t ? t[k] : NX.inp[k]; } });
  NX.toast = (msg, tone = "") => {
    let host = $("#toasts"); if (!host) { host = document.createElement("div"); host.id = "toasts"; host.setAttribute("role", "status"); host.setAttribute("aria-live", "polite"); document.body.append(host); }
    const e = document.createElement("div"); e.className = "toast " + tone; e.innerHTML = `${ic(tone === "bad" ? "warning" : "check")}<span>${esc(msg)}</span>`; host.append(e); setTimeout(() => e.remove(), 3600);
  };

  /* ---------- audit & maker-checker ---------- */
  const hash = s => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16).padStart(8, "0"); };
  NX.clock = () => { const d = new Date(Date.UTC(2026, 9, 24, 14, 32, 0) + (NX.tick = (NX.tick || 0) + 1) * 47000); return d.toISOString().slice(0, 16).replace("T", " "); };
  NX.audit = (action, detail, mod) => {
    const prev = S.audit.length ? S.audit[0].h : "00000000";
    S.audit.unshift({ at: NX.clock(), user: user().name, action, detail, mod: mod || S.route, h: hash(prev + action + detail + S.audit.length) });
  };
  // act: toast + audit in one call
  NX.act = (msg, action, detail, tone) => { NX.toast(msg, tone); NX.audit(action || msg, detail || msg); };
  NX.request = o => { // o: kind,t,detail,apply
    const a = { id: "R" + (705 + (NX.reqN = (NX.reqN || 0) + 1) - 1), maker: S.user, at: NX.clock(), state: "open", ...o }; S.appr.unshift(a);
    NX.audit("request." + o.kind, o.detail, o.mod); NX.toast(w("sentForApproval") + " " + a.id); NX.view(); return a;
  };
  NX.decide = (id, ok) => {
    const a = S.appr.find(x => x.id === id); if (!a || a.state !== "open") return;
    if (ok && a.maker === S.user) { NX.toast(T("You cannot approve your own request — switch to another person.", "Vous ne pouvez pas approuver votre propre demande — changez de personne.", "لا يمكنك الموافقة على طلبك — بدّل إلى شخص آخر."), "bad"); return; }
    a.state = ok ? "approved" : "rejected"; a.by = S.user; if (ok && a.apply) a.apply();
    NX.audit((ok ? "approve." : "reject.") + a.kind, a.id + " · " + a.detail, "approvals"); NX.toast(ok ? stLabel("approved") : stLabel("rejected")); NX.view();
  };
  NX.openCount = () => S.appr.filter(a => a.state === "open").length;

  /* ---------- shell ---------- */
  const navMods = () => NX.mods.filter(m => !m.hidden);
  function sideHtml() {
    return GROUPS.map(g => {
      const ms = navMods().filter(m => m.g === g.id); if (!ms.length) return "";
      const closed = S.groupClosed[g.id];
      return `<div class="ng" data-g="${g.id}"><button class="ngh" data-a="grp" data-p="${g.id}" aria-expanded="${!closed}"><span class="gi">${ic(g.i)}</span><span class="gl">${T.apply(null, g.t)}</span><span class="cv">${ic("chev")}</span></button>
        <div class="ngl" ${closed ? "hidden" : ""}>${ms.map(m => `<a href="#${m.id}" data-mod="${m.id}" title="${esc(NX.modTitle(m))}">${ic(m.i)}<span>${esc(NX.modTitle(m))}</span>${m.badge ? `<b class="nb" data-badge="${m.id}"></b>` : ""}</a>`).join("")}</div></div>`;
    }).join("");
  }
  function railHtml() { // tablet navigation rail: one destination per group
    return GROUPS.map(g => `<a class="rl" href="#${navMods().find(m => m.g === g.id)?.id}" data-grp="${g.id}">${ic(g.i)}<span>${T.apply(null, g.t)}</span></a>`).join("");
  }
  NX.shell = () => {
    applyTheme(); const L = LANGS;
    $("#app").innerHTML = `<div class="shell"><a class="skip" href="#view">${T("Skip to content", "Aller au contenu", "تخطَّ إلى المحتوى")}</a>
    <aside class="side ${S.menu ? "open" : ""}" aria-label="${T("Navigation", "Navigation", "التنقل")}">
      <div class="logo"><span class="mark">${esc(NX.initial())}</span><div><span id="bn-side">${esc(NX.bankName())}</span><small>NEXUS HUB</small></div></div>
      <nav class="nav" id="nav">${sideHtml()}</nav><nav class="rail" id="rail" aria-label="${T("Sections", "Sections", "الأقسام")}">${railHtml()}</nav>
      <div class="grow"></div><div class="demo-note">${T("Demonstration — simulated data", "Démonstration — données simulées", "عرض توضيحي — بيانات محاكاة")}</div></aside>
    <div class="scrim nav-scrim ${S.menu ? "on" : ""}" data-a="menu"></div>
    <main id="main"><div class="hero-ribbon" role="note">${T("Demonstration — simulated data. Nothing here is real, and nothing leaves your browser.", "Démonstration — données simulées. Rien ici n’est réel et rien ne quitte votre navigateur.", "عرض توضيحي — بيانات محاكاة. لا شيء هنا حقيقي ولا شيء يغادر متصفحك.")}</div>
    <header class="top"><button class="btn icon-btn menu-btn" data-a="menu" aria-label="${T("Menu", "Menu", "القائمة")}">${ic("menu")}</button>
      <div class="ttl"><div class="crumb" id="crumb"></div><h1 id="h1"></h1></div>
      <button class="btn pal-btn" data-a="palette" aria-label="${T("Search everything", "Tout rechercher", "ابحث في كل شيء")}">${ic("search")}<span class="plabel">${T("Search…", "Rechercher…", "بحث…")}</span><kbd>Ctrl K</kbd></button>
      <button class="btn icon-btn bellb" data-a="notifs" aria-label="${T("Notifications", "Notifications", "الإشعارات")}">${ic("bell")}<i class="bdg" id="bell-n"></i></button>
      <div class="lk-wrap"><button class="btn lk-btn" data-a="looksPop" id="lk-btn" aria-haspopup="true" aria-expanded="false" aria-label="${T("Look", "Apparence", "المظهر")}"><span class="looks-dot" id="lk-dot"></span><span class="lk-n" id="lk-name"></span></button><div class="lk-pop" id="lk-pop"><div id="lk-picker"></div><a class="lk-more" href="#brand-studio">${T("Personalise…", "Personnaliser…", "تخصيص…")}</a></div></div>
      <button class="btn icon-btn" data-a="mode" aria-label="${T("Switch light/dark", "Basculer clair/sombre", "تبديل الفاتح/الداكن")}">${ic(S.mode === "light" ? "moon" : "sun")}</button>
      <select class="btn langsel" id="lang" data-c="lang" aria-label="${T("Language", "Langue", "اللغة")}">${Object.keys(L).map(k => `<option value="${k}" ${S.lang === k ? "selected" : ""}>${L[k]}</option>`).join("")}</select>
      <button class="btn who" data-a="persona" aria-label="${T("Acting as", "Agit en tant que", "العمل بصفة")}">${NX.avatar(user().name)}<span class="wl"><b>${esc(user().name)}</b><small>${T.apply(null, user().role)}</small></span></button></header>
    <nav class="subnav" id="subnav" aria-label="${T("Pages in this section", "Pages de cette section", "صفحات هذا القسم")}"></nav>
    <div id="view" tabindex="-1"></div></main></div><div id="layer"></div>`;
    mountLooks(); NX.view(true);
  };
  function paintLookBtn() { const l = LK(), d = $("#lk-dot"); if (!d) return; d.style.cssText = `--a:${l.brand};--b:${l.accent};--c:${l.canvas}`; $("#lk-name").textContent = l.name; }
  function mountLooks() { if (!window.Looks) return; Looks.mount($("#lk-picker"), { label: T("Look", "Apparence", "المظهر") }); paintLookBtn(); }
  NX.lookPop = on => { const p = $("#lk-pop"), b = $("#lk-btn"); if (!p) return; p.classList.toggle("on", on); b.setAttribute("aria-expanded", on); if (on) { const c = p.querySelector('[aria-checked="true"]'); c && c.focus(); } };
  document.addEventListener("click", e => { if (!e.target.closest(".lk-wrap")) NX.lookPop(false); });
  document.addEventListener("looks:change", () => { applyTheme(); paintLookBtn(); NX.lookPop(false);
    const n = $("#bn-side"); if (n) n.textContent = NX.bankName(); document.querySelectorAll(".logo .mark").forEach(e => e.textContent = NX.initial());
    if (S.route === "brand-studio") NX.view(); });
  NX.view = (nav) => {
    const m = modOf(S.route) || modOf("dashboard"), act = document.activeElement, aid = act && act.id, sel = act && act.selectionStart;
    const html = m.r(S.param, S.alias) || ""; const v = $("#view"); if (!v) return;
    const sy = nav ? 0 : window.scrollY, keep = $(".tbl-wrap"), tsl = keep ? keep.scrollLeft : 0;
    v.className = S.anim ? "view" : ""; v.innerHTML = html;
    const g = GROUPS.find(x => x.id === m.g);
    $("#h1").textContent = S.crumbTitle || NX.modTitle(m); $("#crumb").textContent = g ? T.apply(null, g.t) + (S.param || S.crumbTitle ? " / " + NX.modTitle(m) : "") : "";
    const navId = m.nav || m.id;
    document.querySelectorAll("#nav a").forEach(a => { if (a.dataset.mod === navId) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.querySelectorAll("#rail a").forEach(a => { if (a.dataset.grp === m.g) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("#subnav").innerHTML = navMods().filter(x => x.g === m.g).map(x => `<a href="#${x.id}" ${x.id === navId ? 'aria-current="page"' : ""}>${esc(NX.modTitle(x))}</a>`).join("");
    document.title = `${NX.modTitle(m)} · ${NX.bankName()} · Nexus Hub`;
    const n = NX.openCount() + (S.degraded ? 1 : 0); const b = $("#bell-n"); if (b) { b.textContent = n; b.style.display = n && !S.notifRead ? "" : "none"; }
    const ab = document.querySelector('[data-badge="approvals"]'); if (ab) { ab.textContent = NX.openCount(); ab.style.display = NX.openCount() ? "" : "none"; }
    if (aid) { const e = document.getElementById(aid); if (e && e !== act) { e.focus({ preventScroll: true }); try { if (sel != null) e.setSelectionRange(sel, sel); } catch {} } }
    if (!nav) { window.scrollTo(0, sy); const w2 = $(".tbl-wrap"); if (w2) w2.scrollLeft = tsl; }
    if (NX.layers.length) paintLayers();
    m.after && m.after();
  };
  const refreshStatic = () => { applyTheme(); NX.shell(); };

  /* ---------- generic handlers ---------- */
  const setPath = (path, val) => { const [id, ...k] = path.split("."); let o = NX.m(id); k.slice(0, -1).forEach(x => o = (o[x] ||= {})); o[k[k.length - 1]] = val; };
  const getPath = path => { const [id, ...k] = path.split("."); let o = NX.m(id); for (const x of k) { if (o == null) return; o = o[x]; } return o; };
  NX.setPath = setPath; NX.getPath = getPath;
  NX.on({
    tab(p) { const [id, k] = p.split(":"); S.tab[id] = k; NX.view(); },
    go(p) { NX.go(p); },
    setv(p) { const [path, v] = p.split("="); setPath(path, v); NX.view(); },
    tog(p, el) { setPath(p, el.getAttribute("aria-checked") !== "true"); if (el.dataset.x && NX.hand[el.dataset.x]) NX.hand[el.dataset.x](p, el); NX.view(); },
    closeLayer() { NX.closeLayer(); },
    confirmOk() { const f = NX._ok; NX.closeLayer(); f && f(); },
    menu() { S.menu = !S.menu; document.querySelector(".side").classList.toggle("open", S.menu); document.querySelector(".nav-scrim").classList.toggle("on", S.menu); },
    grp(p) { S.groupClosed[p] = !S.groupClosed[p]; const g = document.querySelector(`.ng[data-g="${p}"]`); g.querySelector(".ngl").hidden = !!S.groupClosed[p]; g.querySelector(".ngh").setAttribute("aria-expanded", !S.groupClosed[p]); },
    looksPop() { NX.lookPop(!$("#lk-pop").classList.contains("on")); },
    mode() { S.mode = S.mode === "light" ? "dark" : "light"; store.set("mode", S.mode); refreshStatic(); },
    notifs() { S.notifRead = true; NX.drawer(() => ({ t: T("Notifications", "Notifications", "الإشعارات"), b: notifHtml() })); NX.view(); },
    persona() { NX.modal(() => ({ t: T("Acting as", "Agit en tant que", "العمل بصفة"), b: `<p class="muted">${T("Maker–checker is enforced: the person who requests a change cannot approve it. Switch person to approve it.", "Le principe des quatre yeux s’applique : la personne qui demande ne peut pas approuver. Changez de personne pour approuver.", "مبدأ المنفّذ والمراجع مفعّل: من يطلب التغيير لا يمكنه الموافقة عليه. بدّل الشخص للموافقة.")}</p>
      <div class="plist">${PERSONAS.map(p => `<button class="prow" aria-pressed="${p.id === S.user}" data-a="setUser" data-p="${p.id}">${NX.avatar(p.name)}<span><b>${p.name}</b><small>${T.apply(null, p.role)}</small></span>${p.id === S.user ? ic("check") : ""}</button>`).join("")}</div>` })); },
    setUser(p) { S.user = p; NX.closeAll(); NX.audit("session.switch", "Acting as " + user().name, "session"); NX.toast(T("Now acting as ", "Agit en tant que ", "العمل بصفة ") + user().name); refreshStatic(); },
    approve(p) { NX.decide(p, true); }, rejectReq(p) { NX.decide(p, false); },
    palette() { openPalette(); }, pick(p) { const it = palItems[+p]; NX.closeAll(); if (it) it.run(); },
    sim() { NX.toast(w("simulated")); }
  });
  NX.afterSet = {};
  NX.onInput({ set(v, el) { setPath(el.dataset.p, v); if (NX.afterSet[el.dataset.p]) NX.afterSet[el.dataset.p](v); NX.view(); } });
  NX.onChange = { set(v, el) { setPath(el.dataset.p, v); NX.view(); }, lang(v) { S.lang = v; store.set("lang", v); refreshStatic(); } };
  function notifHtml() {
    const items = [];
    if (S.degraded) items.push(["warn", T("OnePay gateway is degraded", "La passerelle OnePay est dégradée", "بوابة OnePay بأداء منخفض"), T("Latency above 2s since 14:20. Fallback queue active.", "Latence supérieure à 2 s depuis 14:20.", "زمن الاستجابة أعلى من ثانيتين منذ 14:20.")]);
    S.appr.filter(a => a.state === "open").forEach(a => items.push(["info", a.t, a.maker === S.user ? T("Waiting for a checker", "En attente d’un validateur", "بانتظار مراجع") : T("Needs your decision", "Votre décision est requise", "بانتظار قرارك")]));
    items.push(["warn", T("3 fraud cases close to SLA breach", "3 dossiers de fraude proches de l’échéance", "3 قضايا احتيال قريبة من تجاوز المهلة"), "Argus"], ["ok", T("Settlement cycle 14:00 reconciled", "Cycle de règlement 14:00 rapproché", "تمت مطابقة دورة تسوية 14:00"), "LYPay"], ["info", T("Card batch B-2043 left the printer", "Le lot B-2043 a quitté l’imprimerie", "غادرت الدفعة B-2043 المطبعة"), T("Cards", "Cartes", "البطاقات")]);
    return `<ul class="nlist">${items.map(i => `<li class="${i[0]}"><span class="dotm"></span><div><b>${esc(i[1])}</b><div class="muted">${esc(i[2])}</div></div></li>`).join("")}</ul>`;
  }

  /* ---------- command palette ---------- */
  let palItems = [];
  NX.searchers.push(q => navMods().filter(m => !q || (NX.modTitle(m) + " " + (m.k || "")).toLowerCase().includes(q)).map(m => ({ ic: m.i, t: NX.modTitle(m), s: T.apply(null, GROUPS.find(g => g.id === m.g).t), run: () => NX.go(m.id) })));
  NX.searchers.push(q => !q || q.length < 2 ? [] : [
    { ic: "moon", t: T("Toggle light / dark", "Basculer clair / sombre", "تبديل الفاتح/الداكن"), s: T("Action", "Action", "إجراء"), run: () => NX.hand.mode(), k: "theme dark light mode" },
    ...Looks.list.map(l => ({ ic: "palette", t: l.name, s: T("Look", "Apparence", "المظهر") + " · " + l.tag, run: () => Looks.set(l.id), k: "look theme apparence " + l.id })),
    ...Object.keys(LANGS).map(k => ({ ic: "globe", t: LANGS[k], s: T("Language", "Langue", "اللغة"), run: () => NX.onChange.lang(k), k: "language langue " + k }))
  ].filter(i => (i.t + " " + i.k).toLowerCase().includes(q)));
  function results(q) { q = q.trim().toLowerCase(); let out = []; NX.searchers.forEach(f => { try { out = out.concat(f(q) || []); } catch (e) {} }); return out.slice(0, 40); }
  function openPalette() {
    NX.pal = { q: "", sel: 0 };
    NX.layer("modal", () => { palItems = results(NX.pal.q); return { t: T("Search everything", "Tout rechercher", "ابحث في كل شيء"), b: `<div class="palbox">${ic("search")}<input id="pal-q" class="inp" value="${esc(NX.pal.q)}" data-i="pal" placeholder="${T("Customers, cards, payments, cases, pages…", "Clients, cartes, paiements, dossiers, pages…", "عملاء، بطاقات، مدفوعات، قضايا، صفحات…")}" autocomplete="off" aria-label="${w("search")}" role="combobox" aria-expanded="true" aria-controls="pal-l"></div>
      <ul class="plist2" id="pal-l" role="listbox">${palItems.map((it, i) => `<li role="option" aria-selected="${i === NX.pal.sel}" class="${i === NX.pal.sel ? "sel" : ""}" data-a="pick" data-p="${i}">${ic(it.ic || "search")}<span><b>${esc(it.t)}</b><small>${esc(it.s || "")}</small></span></li>`).join("") || `<li class="muted pe">${w("none")}</li>`}</ul>` }; }, "pal");
    $("#pal-q")?.focus();
  }
  NX.onInput.pal = (v, el) => { NX.pal.q = v; NX.pal.sel = 0; const pos = el.selectionStart; paintLayers(); const n = $("#pal-q"); n.focus(); n.setSelectionRange(pos, pos); };

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const sc = e.target.classList && e.target.classList.contains("scrim") && e.target.dataset.layer; if (typeof sc === "string" && sc !== "") { NX.closeLayer(); return; }
    const el = e.target.closest("[data-a]"); if (!el || el.disabled) return; const f = NX.hand[el.dataset.a]; if (f) { e.preventDefault(); f(el.dataset.p, el, e); }
  });
  document.addEventListener("input", e => { const el = e.target.closest("[data-i]"); if (el && NX.inp[el.dataset.i]) NX.inp[el.dataset.i](el.value, el, e); });
  document.addEventListener("change", e => { const el = e.target.closest("[data-c]"); if (el && NX.onChange[el.dataset.c]) NX.onChange[el.dataset.c](el.value, el, e); });
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); return; }
    const inField = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === "/" && !inField && !NX.layers.length) { e.preventDefault(); openPalette(); return; }
    if (e.key === "Escape" && $("#lk-pop.on")) { NX.lookPop(false); $("#lk-btn").focus(); return; }
    if (e.key === "Escape" && NX.layers.length) { NX.closeLayer(); return; }
    if (NX.layers.length && NX.layers[NX.layers.length - 1].fn && $("#pal-q") && e.target.id === "pal-q") {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); NX.pal.sel = Math.max(0, Math.min(palItems.length - 1, NX.pal.sel + (e.key === "ArrowDown" ? 1 : -1))); paintLayers(); const n = $("#pal-q"); n.focus(); n.setSelectionRange(n.value.length, n.value.length); $(".plist2 .sel")?.scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter") { e.preventDefault(); const it = palItems[NX.pal.sel]; if (it) { NX.closeAll(); it.run(); } }
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches('tr[data-a],li[data-a],[role=button][data-a]')) { e.preventDefault(); e.target.click(); }
    if (e.key === "Tab" && NX.layers.length) { // simple focus trap
      const box = $(`[data-layer="${NX.layers.length - 1}"] > div`); const f = [...box.querySelectorAll('button,[href],input,select,textarea,[tabindex="0"]')].filter(x => !x.disabled && x.offsetParent !== null);
      if (f.length) { const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } else if (!box.contains(document.activeElement)) { e.preventDefault(); first.focus(); } }
    }
  });
  addEventListener("hashchange", route);
  NX.start = () => { applyTheme(); NX.shell(); route(); };
})();
