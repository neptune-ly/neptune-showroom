// Core: state, theme, icons, router, shell, UI primitives, layers (modal/drawer/toast), step-up, confetti, tooltips, command palette.
(function () {
  const store = { get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch {} } };
  const NX = window.NX = { mods: [], act: {}, layers: [], searchers: [], afterHooks: [] };
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SOBER = ["classic", "heritage", "private"];
  const S = NX.S = {
    lang: store.get("plus.lang", (navigator.language || "en").slice(0, 2)), mode: store.get("plus.mode", "light"), user: "amira", route: "dashboard", param: "",
    menu: false, pop: null, m: {}, tab: {}, appr: null, audit: [], notifOpen: false, unread: 2
  };
  if (!LANGS[S.lang]) S.lang = "en";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  NX.$ = $; NX.$$ = $$; NX.reduced = reduced;
  NX.m = id => (S.m[id] ||= {});
  NX.tab = (id, def) => S.tab[id] || def;
  const esc = NX.esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  NX.fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  NX.sleep = ms => new Promise(r => setTimeout(r, ms));
  NX.mny = (v, cur = "LYD", d = 2) => `<span class="num">${cur ? cur + " " : ""}${NX.fmt(v, d)}</span>`;
  NX.cnt = (v, d = 0, pre = "") => `<span class="num cnt" data-to="${v}" data-d="${d}" data-pre="${esc(pre)}">${esc(pre)}${NX.fmt(v, d)}</span>`;
  const LK = NX.look = () => (window.Looks && Looks.list.find(l => l.id === Looks.get())) || { id: "classic", name: "Meridian Bank" };
  NX.kind = () => SOBER.includes(LK().id) ? "sober" : "lively";
  NX.user = () => D.PERSONAS.find(p => p.id === S.user);
  NX.getPath = p => p.split(".").reduce((o, k) => (o == null ? o : o[k]), S);
  NX.setPath = (p, v) => { const ks = p.split("."), last = ks.pop(); ks.reduce((o, k) => (o[k] ??= {}), S)[last] = v; };

  /* ---------- theme ---------- */
  const hex = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  NX.applyTheme = () => {
    const r = document.documentElement;
    r.lang = S.lang; r.dir = S.lang === "ar" ? "rtl" : "ltr"; r.dataset.odysseyMode = S.mode; r.dataset.kind = NX.kind();
    const hero = getComputedStyle(r).getPropertyValue("--look-hero").trim() || "#0F2B46";
    r.dataset.logo = /^#[0-9a-f]{6}$/i.test(hero) && lum(hero) > .35 ? "color" : "reverse";
    document.title = `Neptune Plus · ${LK().name} — Showroom`;
    const m = $('meta[name="theme-color"]'); if (m) m.content = getComputedStyle(r).getPropertyValue("--bg") || "#fff";
  };

  /* ---------- icons ---------- */
  const P = {
    home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10", inbox: "M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5", wallet: "M3 7h17v13H3zM3 7l13-4v4M16 13h4v3h-4z", bank: "M3 10l9-6 9 6zM5 10v8M9 10v8M15 10v8M19 10v8M3 21h18",
    chart: "M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-3", pie: "M12 3v9h9a9 9 0 11-9-9zM15 3a9 9 0 016 6h-6z", file: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6", statement: "M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6",
    transfer: "M7 7h13M16 3l4 4-4 4M17 17H4M8 13l-4 4 4 4", layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5", users: "M16 11a3 3 0 100-6 3 3 0 000 6zM8 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3 2.7-5 6-5s6 2 6 5M14.5 15.2c.5-.1 1-.2 1.5-.2 3 0 6 1.7 6 5",
    calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4", globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18", shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
    plug: "M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0zM12 17v4", bell: "M6 17v-6a6 6 0 1112 0v6l2 2H4zM10 21h4", settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-2-4-2 1a7 7 0 00-2-1l-.5-2h-4L10 7a7 7 0 00-2 1L6 7 4 11l2 1a7 7 0 000 2l-2 1 2 4 2-1a7 7 0 002 1l.5 2h4l.5-2a7 7 0 002-1l2 1 2-4-2-1a7 7 0 000-2z",
    key: "M8 15a4 4 0 110-8 4 4 0 010 8zM11 12h9M17 12v3M20 12v2", search: "M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5", menu: "M4 7h16M4 12h16M4 17h16", moon: "M20 14A8 8 0 0110 4a8 8 0 1010 10z",
    sun: "M12 16a4 4 0 100-8 4 4 0 000 8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5", plus: "M12 5v14M5 12h14", x: "M6 6l12 12M18 6L6 18", chev: "M9 6l6 6-6 6", chevd: "M6 9l6 6 6-6",
    arrow: "M5 12h14M13 6l6 6-6 6", download: "M12 3v12M7 10l5 5 5-5M4 20h16", upload: "M12 17V5M7 10l5-5 5 5M4 20h16", refresh: "M20 11a8 8 0 00-14-4L4 9M4 4v5h5M4 13a8 8 0 0014 4l2-2M20 20v-5h-5", clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
    warning: "M12 3l10 18H2zM12 10v5M12 18h0", info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h0", bolt: "M13 2L4 14h7l-1 8 9-12h-7z", copy: "M9 9h11v11H9zM5 15V4h11", eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
    trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14", edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4", filter: "M3 5h18l-7 8v6l-4 2v-8z", dots: "M5 12h0M12 12h0M19 12h0", lock: "M6 11h12v9H6zM8 11V8a4 4 0 118 0v3", coins: "M9 14a6 6 0 100-12 6 6 0 000 12zM15 8a6 6 0 11-4 10M9 5v6",
    briefcase: "M3 8h18v12H3zM9 8V5h6v3M3 13h18", trend: "M3 17l6-6 4 4 8-9M15 6h6v6", check: "M5 12l5 5 9-10", mail: "M3 5h18v14H3zM3 7l9 7 9-7", phone: "M7 3h10v18H7zM11 18h2", finger: "M6 11a6 6 0 0112 0c0 4 0 6-1 9M9 20c.7-2 1-4 1-7a2 2 0 014 0c0 3-.3 6-1.5 8M3 13c0-5 4-9 9-9",
    scale: "M12 3v18M5 7h14M5 7l-3 7a3 3 0 006 0zM19 7l-3 7a3 3 0 006 0z", ship: "M3 16l2 4h14l2-4zM6 16V9h12v7M12 9V4M9 6h6", building: "M4 21V8l8-5 8 5v13M9 21v-6h6v6M8 11h0M12 11h0M16 11h0", user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-6 8-6s8 2 8 6",
    logout: "M10 4H4v16h6M15 8l4 4-4 4M19 12H9", play: "M7 4l13 8-13 8z", sparkle: "M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 3v4M17 5h4", palette: "M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2s0-2 1.5-2h2a3 3 0 003-3c0-6-4-11-8-11zM7.5 11h0M10 7h0M15 7.5h0",
    link: "M10 14a4 4 0 005.6 0l3-3a4 4 0 00-5.6-5.6l-1 1M14 10a4 4 0 00-5.6 0l-3 3a4 4 0 005.6 5.6l1-1", repeat: "M17 2l4 4-4 4M3 11V9a3 3 0 013-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 01-3 3H3", database: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18h2v2", gauge: "M4 18a9 9 0 1116 0M12 18l4-6", target: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h0", flow: "M5 4h5v5H5zM14 15h5v5h-5zM7.5 9v3a3 3 0 003 3H14", list: "M8 6h13M8 12h13M8 18h13M3 6h0M3 12h0M3 18h0"
  };
  const ic = NX.ic = (n, cls = "") => `<svg class="ic ${n === "arrow" || n === "chev" ? "dirx " : ""}${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="${P[n] || P.info}"/></svg>`;

  /* ---------- registry & nav ---------- */
  const GROUPS = [
    { id: "overview", t: ["Overview", "Vue d’ensemble", "نظرة عامة"] }, { id: "cash", t: ["Accounts & cash", "Comptes & trésorerie", "الحسابات والسيولة"] },
    { id: "pay", t: ["Payments", "Paiements", "المدفوعات"] }, { id: "insight", t: ["Insight", "Analyse", "التحليلات"] }, { id: "company", t: ["Company", "Entreprise", "الشركة"] }
  ];
  NX.reg = m => { NX.mods.push(m); return m; };
  const modOf = id => NX.mods.find(m => m.id === id);
  NX.title = m => T.apply(null, m.t);
  NX.pendingCount = () => (S.appr || []).filter(a => a.st === "pending").length;

  function nav() {
    return GROUPS.map(g => { const ms = NX.mods.filter(m => m.grp === g.id && !m.hidden); if (!ms.length) return "";
      return `<div class="ng"><div class="ngt">${T.apply(null, g.t)}</div>${ms.map(m => { const b = m.id === "approvals" ? NX.pendingCount() : 0;
        return `<a class="ni" href="#/${m.id}" data-nav="${m.id}" ${S.route === m.id ? 'aria-current="page"' : ""} title="${esc(NX.title(m))}">${ic(m.ic)}<span class="nl">${NX.title(m)}</span>${b ? `<span class="nb num">${b}</span>` : ""}</a>`; }).join("")}</div>`; }).join("");
  }
  function controls() {
    const l = LK(), u = NX.user();
    const pop = (id, btn, body) => `<div class="pw">${btn}${S.pop === id ? `<div class="pop ${id}-pop" role="menu">${body}</div>` : ""}</div>`;
    return `<div class="ctl">
      ${pop("look", `<button class="cbtn lookbtn" data-a="pop" data-p="look" aria-haspopup="menu" aria-expanded="${S.pop === "look"}" title="${esc(w("look"))}"><span class="looks-dot sm" style="--a:${l.brand};--b:${l.accent};--c:${l.canvas}"></span><span class="lbn">${esc(l.name)}</span>${ic("chevd")}</button>`,
        `<div class="pop-h">${T("Bank look · white-label preview", "Habillage banque · aperçu marque blanche", "هوية البنك · معاينة العلامة البيضاء")}</div>` + Looks.list.map(x => `<button role="menuitemradio" aria-checked="${x.id === l.id}" class="pi look-i" data-a="look" data-p="${x.id}"><span class="looks-dot" style="--a:${x.brand};--b:${x.accent};--c:${x.canvas}"></span><span><b>${esc(x.name)}</b><small>${esc(x.tag)}</small></span>${x.id === l.id ? ic("check") : ""}</button>`).join(""))}
      ${pop("lang", `<button class="cbtn" data-a="pop" data-p="lang" aria-haspopup="menu" aria-expanded="${S.pop === "lang"}" aria-label="${esc(T("Language", "Langue", "اللغة"))}">${ic("globe")}<span class="lbn">${S.lang.toUpperCase()}</span></button>`,
        Object.entries(LANGS).map(([k, n]) => `<button role="menuitemradio" aria-checked="${k === S.lang}" class="pi" data-a="lang" data-p="${k}"><span><b>${n}</b></span>${k === S.lang ? ic("check") : ""}</button>`).join(""))}
      <button class="cbtn sq" data-a="mode" aria-label="${esc(T("Toggle dark mode", "Basculer le mode sombre", "تبديل الوضع الداكن"))}" aria-pressed="${S.mode === "dark"}">${ic(S.mode === "dark" ? "sun" : "moon")}</button>
    </div>`;
  }
  NX.shell = () => {
    const oldMain = $("#main");
    const u = NX.user(), l = LK(), m = modOf(S.route) || modOf("dashboard");
    const logo = `<img class="lg lg-color" src="assets/brand/Neptune_Logo_Color.png" alt="Neptune"><img class="lg lg-reverse" src="assets/brand/Neptune_Logo_Reverse.png" alt="Neptune">`;
    $("#app").innerHTML = `<a class="skip" href="#main">${T("Skip to content", "Aller au contenu", "تخطَّ إلى المحتوى")}</a>
    <div class="shell ${S.menu ? "menu-open" : ""}">
      <div class="scrim nav-scrim" data-a="menu"></div>
      <aside class="side" id="side" aria-label="${esc(T("Main navigation", "Navigation principale", "التنقل الرئيسي"))}">
        <div class="brand"><div class="lgw">${logo}</div><div class="wm"><span class="wm-t">Neptune <b>Plus</b></span><span class="wm-s">${T("for", "pour", "لدى")} ${esc(l.name)}</span></div><button class="cbtn sq side-x" data-a="menu" aria-label="${w("close")}">${ic("x")}</button></div>
        <div class="co-card"><span class="avatar co">${esc(nm(D.company).split(/\s+/).map(x => x[0]).slice(0, 2).join(""))}</span><div><b>${esc(nm(D.company))}</b><small>${T("Corporate · CR 20418", "Entreprise · RC 20418", "شركة · سجل 20418")}</small></div></div>
        <nav class="nav">${nav()}</nav>
        <div class="side-foot"><div class="mobctl">${controls()}</div><div class="who"><span class="avatar">${esc(nm(u.name).split(/\s+/).map(x => x[0]).slice(0, 2).join(""))}</span><div><b>${esc(nm(u.name))}</b><small>${T.apply(null, u.role)}</small></div></div></div>
      </aside>
      <div class="col">
        <div class="ribbon" role="note">${ic("info")}<span>${T("Demonstration — simulated data. Nothing here is real and nothing leaves your browser.", "Démonstration — données simulées. Rien ici n’est réel et rien ne quitte votre navigateur.", "عرض توضيحي — بيانات محاكاة. لا شيء هنا حقيقي ولا شيء يغادر متصفحك.")}</span></div>
        <header class="top">
          <button class="cbtn sq menu-btn" data-a="menu" aria-label="${esc(T("Open menu", "Ouvrir le menu", "فتح القائمة"))}">${ic("menu")}</button>
          <div class="crumb"><small>${T.apply(null, (GROUPS.find(g => g.id === m.grp) || GROUPS[0]).t)}</small><h1 id="ptitle">${NX.title(m)}</h1></div>
          <span class="grow"></span>
          <button class="cbtn search-btn" data-a="palette" aria-label="${esc(T("Search and commands", "Rechercher et commandes", "بحث وأوامر"))}">${ic("search")}<span class="lbn">${T("Search…", "Rechercher…", "بحث…")}</span><kbd>Ctrl K</kbd></button>
          <div class="deskctl">${controls()}</div>
          <button class="cbtn sq bell" data-a="notifs" aria-label="${esc(T("Notifications", "Notifications", "الإشعارات"))}">${ic("bell")}${S.unread ? `<i class="dot num">${S.unread}</i>` : ""}</button>
          <div class="pw">${`<button class="cbtn who-btn" data-a="pop" data-p="persona" aria-haspopup="menu" aria-expanded="${S.pop === "persona"}"><span class="avatar">${esc(nm(u.name).split(/\s+/).map(x => x[0]).slice(0, 2).join(""))}</span><span class="lbn who-n"><b>${esc(nm(u.name))}</b><small>${T.apply(null, u.role)}</small></span></button>`}${S.pop === "persona" ? `<div class="pop persona-pop" role="menu"><div class="pop-h">${T("Act as (demo)", "Agir en tant que (démo)", "التصرف بصفة (عرض)")}</div>${D.PERSONAS.map(p => `<button role="menuitemradio" aria-checked="${p.id === S.user}" class="pi" data-a="persona" data-p="${p.id}"><span class="avatar">${esc(nm(p.name).split(/\s+/).map(x => x[0]).slice(0, 2).join(""))}</span><span><b>${esc(nm(p.name))}</b><small>${T.apply(null, p.role)}</small></span>${p.id === S.user ? ic("check") : ""}</button>`).join("")}</div>` : ""}</div>
        </header>
        <main id="main" class="main" tabindex="-1" aria-labelledby="ptitle"></main>
      </div>
    </div>`;
    if (oldMain) $("#main").replaceWith(oldMain);
  };

  /* ---------- router & view ---------- */
  let viewTok = 0, enterTimer = 0;
  function route() {
    const h = decodeURIComponent(location.hash.replace(/^#\/?/, "") || "dashboard"), [id, ...rest] = h.split("/");
    const m = modOf(id) || modOf("dashboard");
    S.route = m.id; S.param = rest.join("/"); S.menu = false; S.pop = null; NX.closeAll(true);
    NX.shell(); NX.view(true); window.scrollTo(0, 0);
  }
  NX.go = h => { if (location.hash === "#/" + h) route(); else location.hash = "#/" + h; };
  function skeleton() {
    const b = (c = "") => `<div class="sk ${c}"></div>`;
    return `<div class="skel" aria-busy="true" aria-label="${esc(T("Loading", "Chargement", "جارٍ التحميل"))}"><div class="sk-row">${b("h1")}${b("btn")}</div><div class="grid g4">${b("k")}${b("k")}${b("k")}${b("k")}</div><div class="grid g12">${b("big c8")}${b("big c4")}</div></div>`;
  }
  NX.view = (anim, quick) => {
    const main = $("#main"); if (!main) return; const m = modOf(S.route) || modOf("dashboard"), tok = ++viewTok;
    const focus = (() => { const a = document.activeElement; return a && a.id && main.contains(a) ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null; })();
    const y = window.scrollY;
    const paint = (entering) => {
      if (tok !== viewTok) return; CH.reset();
      main.classList.toggle("enter", !!entering); clearTimeout(enterTimer);
      main.innerHTML = `<div class="page ${NX.kind()}-page" data-page="${m.id}">${m.render()}</div>`;
      CH.paint(main); NX.afterView(main, entering); if (m.after) m.after(main);
      if (focus) { const el = document.getElementById(focus.id); if (el) { el.focus({ preventScroll: true }); try { el.setSelectionRange(focus.s, focus.e); } catch {} } }
      if (entering) enterTimer = setTimeout(() => main.classList.remove("enter"), 2400);
      NX.refreshNav();
    };
    if (anim && !quick && !reduced() && !m.noSkel) { main.classList.remove("enter"); main.innerHTML = skeleton(); setTimeout(() => paint(true), 420); }
    else { paint(!!anim); if (!anim) window.scrollTo(0, y); }
  };
  NX.refreshNav = () => { $$(".ni").forEach(a => { if (a.dataset.nav === S.route) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); const nb = $('.ni[data-nav="approvals"]'); if (nb) { const c = NX.pendingCount(); let b = $(".nb", nb); if (c) { if (!b) { b = document.createElement("span"); b.className = "nb num"; nb.appendChild(b); } b.textContent = c; } else if (b) b.remove(); } };
  NX.afterView = (root, entering) => {
    $$(".cnt", root).forEach(el => { const to = +el.dataset.to, d = +el.dataset.d, pre = el.dataset.pre || "", fin = pre + NX.fmt(to, d);
      if (!entering || reduced()) { el.textContent = fin; return; }
      const t0 = performance.now(), dur = 1100; const step = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4); el.textContent = pre + NX.fmt(to * e, d); if (k < 1) requestAnimationFrame(step); else el.textContent = fin; }; requestAnimationFrame(step); });
    $$(".reveal", root).forEach((el, i) => el.style.setProperty("--i", el.style.getPropertyValue("--i") || i));
  };

  /* ---------- primitives ---------- */
  NX.chip = (s, label) => { const d = ST[s]; return `<span class="chip ${d ? d[3] : ""}">${esc(label || stLabel(s))}</span>`; };
  NX.tone = (t, text, i) => `<span class="chip ${t}">${i ? ic(i) : ""}${esc(text)}</span>`;
  NX.btn = (label, a, p = "", o = {}) => `<button class="btn ${o.cls || ""}" data-a="${a}" data-p="${esc(p)}" ${o.dis ? "disabled" : ""} ${o.id ? `id="${o.id}"` : ""} ${o.aria ? `aria-label="${esc(o.aria)}"` : ""}>${o.ic ? ic(o.ic) : ""}${label ? `<span>${label}</span>` : ""}</button>`;
  NX.head = (title, sub, actions = "") => `<div class="phead reveal"><div><h2 class="pt">${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ""}</div><div class="pact">${actions}</div></div>`;
  NX.card = (title, body, o = {}) => `<section class="card reveal ${o.cls || ""}" style="--i:${o.i ?? 0};${o.style || ""}">${title || o.right ? `<div class="card-h"><h3>${title || ""}</h3>${o.right || ""}</div>` : ""}${body}</section>`;
  NX.kpi = (k, i = 0) => `<div class="card kpi reveal f${(i % 4) + 1}" style="--i:${i}"><div class="kic">${ic(k.ic || "chart")}</div><div class="l">${k.l}</div><div class="v">${k.v}</div>${k.d ? `<div class="d ${k.tone || ""}">${k.d}</div>` : ""}${k.sp ? `<div class="ksp">${k.sp}</div>` : ""}</div>`;
  NX.tabs = (id, list, def) => { const cur = NX.tab(id, def || list[0][0]); return `<div class="tabs" role="tablist">${list.map(([k, n, c]) => `<button role="tab" aria-selected="${cur === k}" data-a="tab" data-p="${id}:${k}">${n}${c != null ? `<span class="tcount num">${c}</span>` : ""}</button>`).join("")}</div>`; };
  NX.seg = (path, opts, val) => `<div class="seg" role="group">${opts.map(([k, n]) => `<button aria-pressed="${String(val) === String(k)}" data-a="setv" data-p="${path}=${k}">${n}</button>`).join("")}</div>`;
  NX.field = (label, input, hint, id) => `<div class="field"><label ${id ? `for="${id}"` : ""}>${label}</label>${input}${hint ? `<small class="muted">${hint}</small>` : ""}</div>`;
  NX.input = (id, path, val = "", o = {}) => `<input id="${id}" class="inp ${o.cls || ""}" value="${esc(val)}" data-i="${path}" ${o.ph ? `placeholder="${esc(o.ph)}"` : ""} ${o.type ? `type="${o.type}"` : ""} ${o.inputmode ? `inputmode="${o.inputmode}"` : ""} autocomplete="off" ${o.dir ? `dir="${o.dir}"` : ""} ${o.aria ? `aria-label="${esc(o.aria)}"` : ""}>`;
  NX.select = (id, path, opts, val, o = {}) => `<select id="${id}" class="inp ${o.cls || ""}" data-c="${path}" ${o.r === false ? "" : 'data-r="1"'} ${o.aria ? `aria-label="${esc(o.aria)}"` : ""}>${opts.map(([k, n]) => `<option value="${esc(k)}" ${String(val) === String(k) ? "selected" : ""}>${esc(n)}</option>`).join("")}</select>`;
  NX.sw = (path, on, label) => `<button class="switch" role="switch" aria-label="${esc(label)}" aria-checked="${!!(NX.getPath(path) ?? on)}" data-a="tog" data-p="${path}|${on ? 1 : 0}"></button>`;
  NX.search = (path, val, ph) => `<label class="searchbox">${ic("search")}<input id="q-${path.replace(/\W/g, "_")}" class="inp" data-i="${path}" data-r="1" value="${esc(val || "")}" placeholder="${esc(ph || w("search"))}" aria-label="${esc(ph || w("search"))}" autocomplete="off"></label>`;
  NX.empty = msg => `<div class="empty">${ic("search")}<div>${msg || w("none")}</div></div>`;
  NX.table = o => { const rows = o.rows || []; if (!rows.length) return NX.empty(o.empty);
    return `<div class="tbl-wrap"><table ${o.id ? `id="${o.id}"` : ""}><thead><tr>${o.cols.map(c => `<th class="${c.cls || ""}">${c.h}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => { const id = o.key ? o.key(r) : i;
      return `<tr style="--i:${Math.min(i, 14)}" ${o.act ? `class="click" tabindex="0" data-a="${o.act}" data-p="${esc(id)}"` : ""}>${o.cols.map(c => `<td data-l="${esc(String(c.h).replace(/<[^>]+>/g, ""))}" class="${c.cls || ""}">${c.r ? c.r(r, i) : esc(r[c.k])}</td>`).join("")}</tr>`; }).join("")}</tbody></table></div>`; };
  NX.dl = pairs => `<dl class="dl">${pairs.filter(Boolean).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>`;
  NX.stepper = (steps, cur) => `<ol class="steps">${steps.map((s, i) => `<li class="${i < cur ? "done" : i === cur ? "cur" : ""}" ${i === cur ? 'aria-current="step"' : ""}><span class="n">${i < cur ? ic("check") : i + 1}</span><span class="sl">${s}</span></li>`).join("")}</ol>`;
  NX.avatar = (name, cls = "") => `<span class="avatar ${cls}" aria-hidden="true">${esc(String(name).split(/\s+/).map(x => x[0]).slice(0, 2).join(""))}</span>`;
  NX.sla = h => { const late = h < 0, a = Math.abs(h), txt = late ? T(`${a.toFixed(1)} h overdue`, `${a.toFixed(1)} h de retard`, `متأخر ${a.toFixed(1)} ساعة`) : T(`${h.toFixed(1)} h left`, `${h.toFixed(1)} h restantes`, `متبقي ${h.toFixed(1)} ساعة`);
    const pct = late ? 100 : Math.max(6, 100 - h / 8 * 100), tone = late || h < 2 ? "var(--bad)" : h < 4 ? "var(--warn)" : "var(--ok)";
    return `<span class="sla" title="${esc(T("Service-level target: 8 h", "Objectif de service : 8 h", "هدف مستوى الخدمة: 8 ساعات"))}"><span class="slab"><i style="--w:${pct}%;background:${tone}"></i></span><span class="slat num" style="color:${tone}">${txt}</span></span>`; };
  NX.pname = id => nm((D.PERSONAS.find(p => p.id === id) || { name: "—" }).name);

  /* ---------- audit (hash-chained look, simulated) ---------- */
  NX.log = (a) => { const h = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0"); D.audit.unshift({ at: new Date(NOW.getTime() + 60000 * D.audit.length), u: S.user, a, ip: "10.24.8.21", h }); };

  /* ---------- layers ---------- */
  let lastFocus = null;
  function paintLayers() {
    const host = $("#layer"); if (!host) return;
    host.innerHTML = NX.layers.map((L, i) => { const v = L.fn();
      const head = `<header><div><h2 id="lt${i}">${v.t}</h2>${v.sub ? `<div class="muted">${v.sub}</div>` : ""}</div><button class="cbtn sq" data-a="closeLayer" aria-label="${w("close")}">${ic("x")}</button></header>`;
      return `<div class="lscrim ${L.kind}-scrim" data-layer="${i}"><div class="${L.kind} ${L.cls || ""}" role="dialog" aria-modal="true" aria-labelledby="lt${i}" tabindex="-1">${head}<div class="lb">${v.b}</div>${v.f ? `<footer>${v.f}</footer>` : ""}</div></div>`; }).join("");
    document.body.classList.toggle("has-layer", NX.layers.length > 0);
  }
  NX.layer = (kind, fn, cls = "") => { lastFocus = document.activeElement; NX.layers.push({ kind, fn, cls }); paintLayers(); const d = $$(".lscrim").pop(); const f = d && $("[autofocus],.inp,.btn.pri", d); setTimeout(() => (f || $(".modal,.drawer", d))?.focus({ preventScroll: true }), 30); };
  NX.refreshLayers = () => { const f = document.activeElement; const id = f && f.id, s = f && f.selectionStart; paintLayers(); if (id) { const el = document.getElementById(id); if (el) { el.focus(); try { el.setSelectionRange(s, s); } catch {} } } };
  NX.closeLayer = () => { const L = NX.layers.pop(); if (!L) return; if (L.onClose) L.onClose(); paintLayers(); if (lastFocus && !NX.layers.length) { try { lastFocus.focus({ preventScroll: true }); } catch {} } };
  NX.closeAll = (quiet) => { NX.layers = []; if (!quiet) paintLayers(); else { const h = $("#layer"); if (h) h.innerHTML = ""; document.body.classList.remove("has-layer"); } };
  NX.toast = (msg, tone = "ok", icn) => { const host = $("#toasts"), el = document.createElement("div"); el.className = "toast " + tone; el.setAttribute("role", "status");
    el.innerHTML = `${ic(icn || (tone === "ok" ? "check" : tone === "bad" ? "warning" : "info"))}<span>${msg}</span>`; host.appendChild(el); setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 3800); };

  /* ---------- confetti ---------- */
  NX.confetti = (x, y) => {
    if (reduced()) return; const cv = $("#confetti"), ctx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr); const cs = getComputedStyle(document.documentElement);
    const cols = ["--look-brand", "--look-accent", "--c2", "--c4", "--c3", "--c5"].map(v => cs.getPropertyValue(v).trim()).filter(Boolean);
    const ox = x ?? innerWidth / 2, oy = y ?? innerHeight * .38, ps = Array.from({ length: 150 }, () => { const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 9;
      return { x: ox, y: oy, vx: Math.cos(a) * sp * (1 + Math.random() * .4), vy: Math.sin(a) * sp - 6, w: 5 + Math.random() * 6, h: 3 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .4, c: cols[Math.floor(Math.random() * cols.length)] || "#c7a24a", round: Math.random() < .3 }; });
    const t0 = performance.now(); (function f(t) { const k = (t - t0) / 2200; ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach(p => { p.vy += .32; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - Math.max(0, k - .55) / .45); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c;
        if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2.2, 0, 7); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (k < 1) requestAnimationFrame(f); else ctx.clearRect(0, 0, innerWidth, innerHeight); })(t0);
  };

  /* ---------- step-up (OTP / passkey) ---------- */
  NX.stepUp = (o) => { const st = S.su = { method: "passkey", code: "", busy: false, done: false, o };
    NX.layer("modal", () => { const s = S.su; if (!s) return { t: "", b: "" };
      const body = s.done ? `<div class="su-done">${`<div class="okmark">${ic("check")}</div>`}<h3>${T("Approved", "Approuvé", "تمت الموافقة")}</h3><p class="muted">${esc(o.doneText || "")}</p></div>` : `
        <p class="muted">${esc(o.text || T("This action needs a second factor. Choose how to confirm.", "Cette action exige un second facteur. Choisissez comment confirmer.", "يتطلب هذا الإجراء عاملاً ثانياً. اختر طريقة التأكيد."))}</p>
        ${o.summary ? `<div class="su-sum">${o.summary}</div>` : ""}
        <div class="seg wide" role="tablist">${[["passkey", T("Passkey", "Clé d’accès", "مفتاح المرور"), "finger"], ["otp", T("Authenticator code", "Code d’authentification", "رمز المصادقة"), "phone"]].map(([k, n, i]) => `<button role="tab" aria-selected="${s.method === k}" aria-pressed="${s.method === k}" data-a="su-m" data-p="${k}">${ic(i)}<span>${n}</span></button>`).join("")}</div>
        ${s.method === "passkey" ? `<div class="su-pk"><button class="pk ${s.busy ? "busy" : ""}" data-a="su-pk" ${s.busy ? "disabled" : ""} aria-label="${esc(T("Use passkey", "Utiliser la clé d’accès", "استخدام مفتاح المرور"))}"><span class="pkr"></span><span class="pkr r2"></span>${ic("finger")}</button><p class="muted">${s.busy ? T("Verifying…", "Vérification…", "جارٍ التحقق…") : T("Touch the sensor or use your device unlock to confirm.", "Touchez le capteur ou déverrouillez l’appareil pour confirmer.", "المس المستشعر أو افتح قفل الجهاز للتأكيد.")}</p></div>`
        : `<div class="su-otp"><label for="otp">${T("6-digit code from your authenticator app", "Code à 6 chiffres de votre application", "الرمز المكوّن من 6 أرقام من تطبيق المصادقة")}</label><div class="otpbox"><input id="otp" class="inp otp num" inputmode="numeric" maxlength="6" autocomplete="one-time-code" data-i="su.code" data-otp="1" value="${esc(s.code)}" placeholder="••••••" dir="ltr"></div><small class="muted">${T("Demo: any 6 digits are accepted.", "Démo : tout code à 6 chiffres est accepté.", "عرض توضيحي: يُقبل أي رمز من 6 أرقام.")}</small></div>`}`;
      return { t: s.done ? T("Done", "Terminé", "تم") : (o.title || T("Confirm with step-up", "Confirmer avec une double vérification", "التأكيد بالتحقق الإضافي")), b: body, f: s.done ? NX.btn(w("close"), "closeLayer", "", { cls: "pri" }) : `${NX.btn(w("cancel"), "closeLayer", "")}${s.method === "otp" ? NX.btn(w("confirm"), "su-ok", "", { cls: "pri", dis: s.code.length < 6 }) : ""}` }; }, "su");
  };
  NX.stepDone = async () => { const s = S.su; if (!s) return; s.busy = true; NX.refreshLayers(); await NX.sleep(s.method === "passkey" ? 1100 : 500); s.busy = false; s.done = true; NX.refreshLayers(); try { s.o.onOk && s.o.onOk(); } catch (e) { console.error(e); } const b = $(".okmark"); const r = b && b.getBoundingClientRect(); NX.confetti(r ? r.left + r.width / 2 : null, r ? r.top + r.height / 2 : null); };

  /* ---------- tooltips ---------- */
  const tip = () => $("#tip");
  document.addEventListener("pointermove", e => { const t = e.target.closest && e.target.closest("[data-tip]"), el = tip(); if (!el) return;
    if (!t) { el.classList.remove("on"); $$(".pt.on").forEach(p => p.classList.remove("on")); return; }
    el.innerHTML = t.dataset.tip; el.classList.add("on"); const r = el.getBoundingClientRect(); let x = e.clientX + 14, y = e.clientY + 14; if (x + r.width > innerWidth - 8) x = e.clientX - r.width - 14; if (y + r.height > innerHeight - 8) y = e.clientY - r.height - 14; el.style.transform = `translate(${Math.max(8, x)}px,${Math.max(8, y)}px)`;
    if (t.dataset.pt) { const prev = t.previousElementSibling; $$(".pt.on").forEach(p => p.classList.remove("on")); /* highlight dot */ const dots = $$(".pt", t.closest("svg")); const idx = $$(".hit[data-pt]", t.closest("svg")).indexOf(t); dots[idx] && dots[idx].classList.add("on"); } });
  document.addEventListener("pointerleave", () => tip() && tip().classList.remove("on"), true);

  /* ---------- command palette ---------- */
  NX.searchers.push(q => []);
  function paletteItems(q) {
    q = q.trim().toLowerCase(); const out = [];
    NX.mods.filter(m => !m.hidden).forEach(m => out.push({ g: T("Go to", "Aller à", "انتقال إلى"), t: NX.title(m), i: m.ic, run: () => NX.go(m.id), k: NX.title(m) + " " + m.id }));
    [[T("New transfer", "Nouveau virement", "تحويل جديد"), "transfer", () => NX.go("transfers/new")], [T("New bulk payment", "Nouveau paiement groupé", "دفعة جماعية جديدة"), "layers", () => NX.go("bulk/new")], [T("Request FX purchase", "Demander un achat de devises", "طلب شراء عملة"), "globe", () => NX.go("fx")], [T("Request a statement", "Demander un relevé", "طلب كشف حساب"), "statement", () => NX.go("statements")], [T("Review approvals", "Examiner les validations", "مراجعة الموافقات"), "inbox", () => NX.go("approvals")]]
      .forEach(([t, i, run]) => out.push({ g: T("Actions", "Actions", "إجراءات"), t, i, run, k: t }));
    D.bens.forEach(b => out.push({ g: T("Beneficiaries", "Bénéficiaires", "المستفيدون"), t: nm(b.n), s: b.iban, i: "user", run: () => { NX.m("transfers").ben = b.id; NX.m("transfers").step = 0; NX.go("transfers/new"); }, k: nm(b.n) + " " + b.n.en + " " + b.iban }));
    D.accounts.forEach(a => out.push({ g: T("Accounts", "Comptes", "الحسابات"), t: nm(a.n), s: a.no, i: "wallet", run: () => NX.go("accounts/" + a.id), k: nm(a.n) + " " + a.no }));
    Object.entries(LANGS).forEach(([k, n]) => out.push({ g: T("Preferences", "Préférences", "التفضيلات"), t: T("Language: ", "Langue : ", "اللغة: ") + n, i: "globe", run: () => NX.act.lang(k), k: "language " + n }));
    out.push({ g: T("Preferences", "Préférences", "التفضيلات"), t: T("Toggle dark mode", "Basculer le mode sombre", "تبديل الوضع الداكن"), i: "moon", run: () => NX.act.mode(), k: "dark light theme mode" });
    Looks.list.forEach(l => out.push({ g: T("Preferences", "Préférences", "التفضيلات"), t: T("Bank look: ", "Habillage : ", "الهوية: ") + l.name, i: "palette", run: () => NX.act.look(l.id), k: "look brand " + l.name + " " + l.tag }));
    return out.filter(x => !q || x.k.toLowerCase().includes(q) || x.t.toLowerCase().includes(q)).slice(0, 40);
  }
  NX.palette = () => { S.pal = { q: "", i: 0 };
    NX.layer("modal", () => ({ t: T("Search and commands", "Rechercher et commandes", "بحث وأوامر"), b: `<div class="palette"><label class="searchbox big">${ic("search")}<input id="pal-q" class="inp" autocomplete="off" aria-label="${esc(w("search"))}" placeholder="${esc(T("Type a page, beneficiary, account or command…", "Page, bénéficiaire, compte ou commande…", "صفحة أو مستفيد أو حساب أو أمر…"))}" value="${esc(S.pal.q)}"></label><div id="pal-list" class="pal-list" role="listbox"></div></div>` }), "pal-modal");
    fillPal(); };
  function fillPal() { const list = $("#pal-list"); if (!list) return; const items = S.pal.items = paletteItems(S.pal.q); S.pal.i = Math.min(S.pal.i, Math.max(0, items.length - 1)); let g = "";
    list.innerHTML = items.length ? items.map((x, i) => { const head = x.g !== g ? `<div class="pal-g">${x.g}</div>` : ""; g = x.g; return `${head}<button role="option" aria-selected="${i === S.pal.i}" class="pal-i" data-a="pal-run" data-p="${i}" id="pal-${i}">${ic(x.i)}<span><b>${esc(x.t)}</b>${x.s ? `<small class="num">${esc(x.s)}</small>` : ""}</span>${ic("arrow")}</button>`; }).join("") : NX.empty();
    const sel = $('[aria-selected="true"]', list); if (sel) sel.scrollIntoView({ block: "nearest" }); }

  /* ---------- actions & events ---------- */
  const A = NX.act;
  A.menu = () => { S.menu = !S.menu; $(".shell").classList.toggle("menu-open", S.menu); };
  A.pop = p => { S.pop = S.pop === p ? null : p; NX.shell(); NX.refreshNav(); NX.paintPop(); };
  NX.paintPop = () => { const t = $(".pop"); if (t) { const f = $('[aria-checked="true"]', t) || $(".pi", t); f && f.focus({ preventScroll: true }); } };
  A.look = id => { Looks.set(id, true); const u = new URL(location.href); u.searchParams.set("look", id); history.replaceState(null, "", u); S.pop = null; NX.applyTheme(); NX.shell(); NX.view(false); NX.toast(T("Look changed to ", "Habillage : ", "تم تغيير الهوية إلى ") + LK().name, "ok", "palette"); };
  A.lang = k => { S.lang = k; store.set("plus.lang", k); S.pop = null; NX.applyTheme(); NX.shell(); NX.view(false); };
  A.mode = () => { S.mode = S.mode === "dark" ? "light" : "dark"; store.set("plus.mode", S.mode); NX.applyTheme(); NX.shell(); NX.view(false); };
  A.persona = id => { S.user = id; S.pop = null; NX.shell(); NX.view(false); NX.toast(T("Now acting as ", "Vous agissez en tant que ", "أنت الآن بصفة ") + nm(NX.user().name), "info", "user"); };
  A.palette = () => NX.palette();
  A.closeLayer = () => NX.closeLayer();
  A["pal-run"] = p => { const it = S.pal.items[+p]; NX.closeAll(); if (it) it.run(); };
  A.tab = p => { const [id, k] = p.split(":"); S.tab[id] = k; NX.view(false); };
  A.setv = p => { const i = p.indexOf("="); NX.setPath(p.slice(0, i), p.slice(i + 1)); NX.view(false); };
  A.tog = p => { const [path, def] = p.split("|"), cur = NX.getPath(path); NX.setPath(path, !(cur ?? def === "1")); NX.view(false); };
  A.notifs = () => { S.unread = 0; NX.shell(); NX.layer("drawer", () => ({ t: T("Notifications", "Notifications", "الإشعارات"), sub: T("Latest activity for your company", "Dernière activité de votre entreprise", "آخر نشاط في شركتك"), b: `<ul class="nlist">${D.notifs.map(n => `<li class="${n.u ? "unread" : ""}"><span class="nic">${ic(n.i)}</span><div><b>${T.apply(null, n.t)}</b><small class="muted num">${fdate(n.at)} · ${ftime(n.at)}</small></div></li>`).join("")}</ul>`, f: NX.btn(T("Notification preferences", "Préférences de notification", "تفضيلات الإشعارات"), "go", "notifications", { cls: "pri" }) }), "right"); };
  A.go = p => { NX.closeAll(); NX.go(p); };
  A["su-m"] = k => { S.su.method = k; NX.refreshLayers(); };
  A["su-pk"] = () => NX.stepDone();
  A["su-ok"] = () => NX.stepDone();
  A.noop = () => NX.toast(w("sim"), "info", "info");

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-a]");
    if (!e.target.closest(".pw") && S.pop) { S.pop = null; NX.shell(); NX.refreshNav(); }
    if (e.target.classList && e.target.classList.contains("lscrim")) { NX.closeLayer(); return; }
    if (!t || t.disabled) return; const a = t.dataset.a, p = t.dataset.p; if (A[a]) { e.preventDefault && t.tagName === "A" && e.preventDefault(); A[a](p, t, e); } });
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); NX.layers.length ? NX.closeAll() : NX.palette(); return; }
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !NX.layers.length) { e.preventDefault(); NX.palette(); return; }
    if (e.key === "Escape") { if (S.pop) { S.pop = null; NX.shell(); NX.refreshNav(); return; } if (S.menu) { A.menu(); return; } if (NX.layers.length) { NX.closeLayer(); return; } }
    if (document.activeElement && document.activeElement.id === "pal-q") { const n = (S.pal.items || []).length;
      if (e.key === "ArrowDown") { e.preventDefault(); S.pal.i = (S.pal.i + 1) % Math.max(1, n); fillPal(); } else if (e.key === "ArrowUp") { e.preventDefault(); S.pal.i = (S.pal.i - 1 + n) % Math.max(1, n); fillPal(); } else if (e.key === "Enter") { e.preventDefault(); const it = S.pal.items[S.pal.i]; if (it) { NX.closeAll(); it.run(); } } return; }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches && e.target.matches("tr.click")) { e.preventDefault(); e.target.click(); }
    if (S.pop && /^Arrow(Up|Down)$/.test(e.key)) { const items = $$(".pop .pi"), i = items.indexOf(document.activeElement); e.preventDefault(); items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus(); }
    if (e.key === "Tab" && NX.layers.length) { const d = $$(".lscrim").pop(), f = $$('button:not([disabled]),input,select,textarea,a[href],[tabindex="0"]', d).filter(x => x.offsetParent); if (f.length) { const i = f.indexOf(document.activeElement); if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } } } });
  document.addEventListener("input", e => { const t = e.target;
    if (t.id === "pal-q") { S.pal.q = t.value; S.pal.i = 0; fillPal(); return; }
    if (t.dataset.otp) { t.value = t.value.replace(/\D/g, "").slice(0, 6); S.su.code = t.value; const b = $('[data-a="su-ok"]'); if (b) b.disabled = t.value.length < 6; return; }
    if (t.dataset.i) { NX.setPath(t.dataset.i, t.value); if (t.dataset.r) NX.view(false); } });
  document.addEventListener("change", e => { const t = e.target; if (t.dataset.c) { NX.setPath(t.dataset.c, t.value); if (t.dataset.r) { NX.view(false); NX.refreshLayers(); } } });
  addEventListener("hashchange", route);
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { const m = $("#main"); if (m) CH.paint(m); }, 120); });

  NX.start = () => {
    document.body.insertAdjacentHTML("beforeend", `<div id="app"></div><div id="layer"></div><div id="toasts" aria-live="polite"></div><div id="tip" class="tip" role="tooltip"></div><canvas id="confetti" aria-hidden="true"></canvas>`);
    S.appr = D.approvals.map(a => ({ ...a, st: "pending" })); S.audit = D.audit;
    document.addEventListener("looks:change", () => { NX.applyTheme(); NX.shell(); NX.view(false); });
    NX.applyTheme(); route();
  };
})();
