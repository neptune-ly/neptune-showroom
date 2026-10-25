// Overview: dashboard, payments analytics (heatmap), global search sources.
(function () {
  const { esc, fmt, money, chip, ic, btn, kpis, card, table, tabs, seg } = NX, { ri } = D.R;
  const DAYS = () => [T("Mon", "Lun", "اثن"), T("Tue", "Mar", "ثلا"), T("Wed", "Mer", "أرب"), T("Thu", "Jeu", "خمي"), T("Fri", "Ven", "جمع"), T("Sat", "Sam", "سبت"), T("Sun", "Dim", "أحد")];
  const series = (seed, n, base, amp) => { const r = NX.rnd(seed); return Array.from({ length: n }, (_, i) => Math.round(base + amp * Math.sin(i / 2.3 + seed) + r() * amp * .6 + i * (base / n) * .35)); };

  /* ---------- Dashboard ---------- */
  NX.reg({
    id: "dashboard", g: "overview", i: "home", t: ["Dashboard", "Tableau de bord", "لوحة المتابعة"], k: "home overview kpi",
    r() {
      const M = NX.m("dashboard"); M.range ??= "7";
      const n = +M.range, labels = Array.from({ length: n }, (_, i) => n === 7 ? DAYS()[i] : String(i + 1));
      const ly = series(3, n, 38, 9), op = series(8, n, 31, 8), openAp = S().appr.filter(a => a.state === "open");
      const rails = [["LYPay", "up"], ["OnePay", S().degraded ? "degraded" : "up"], [T("Card switch", "Commutateur cartes", "مفتاح البطاقات"), "up"], [T("Core banking", "Cœur bancaire", "النظام المصرفي الأساسي"), "up"], [T("SMS gateway", "Passerelle SMS", "بوابة الرسائل")]. concat(["up"])];
      const cases = CASES().filter(c => c.status !== "closed").slice(0, 4);
      const mix = ["lypay", "onepay", "fast", "card", "internal"].map(r => ({ l: RAILN(r), v: D.tx.filter(t => t.rail === r).length }));
      const hr = new Date().getHours();
      return `${NX.hero(T("Good afternoon, ", "Bonjour, ", "مساء الخير، ") + NX.user().name.split(" ")[0], T("Instant payments are healthy and 1 settlement cycle is left today. You have ", "Les paiements instantanés sont sains et il reste 1 cycle de règlement aujourd’hui. Vous avez ", "المدفوعات الفورية بحالة جيدة وتبقّت دورة تسوية واحدة اليوم. لديك ") + openAp.length + T(" requests waiting in the approval queue.", " demandes dans la file de validation.", " طلبات بانتظار الموافقة."),
        `<div class="tools"><button class="btn primary" data-a="go" data-p="fast-transfer">${ic("send")}${T("New fast transfer", "Nouveau virement rapide", "تحويل سريع جديد")}</button><button class="btn tonal" data-a="go" data-p="cards">${ic("card")}${T("Issue a card", "Émettre une carte", "إصدار بطاقة")}</button><button class="btn" data-a="go" data-p="approvals">${ic("shield")}${T("Approvals", "Validations", "الموافقات")}</button></div>`)}
      ${kpis([{ l: T("Active customers", "Clients actifs", "العملاء النشطون"), v: NX.num(fmt(D.customers.length * 1840)), d: "+2.4% " + T("vs last month", "vs mois dernier", "عن الشهر الماضي") },
        { l: T("Active cards", "Cartes actives", "البطاقات النشطة"), v: NX.num(fmt(D.cards.filter(c => c.status === "active").length * 2310)), d: "+1.1%" },
        { l: T("Instant payments today", "Paiements instantanés du jour", "المدفوعات الفورية اليوم"), v: NX.num("1.84M"), d: `<span class="num">99.2%</span> ${T("success rate", "taux de réussite", "نسبة النجاح")}` },
        { l: T("Pending approvals", "Validations en attente", "موافقات معلّقة"), v: NX.num(openAp.length), d: `<a href="#approvals">${T("Open queue", "Ouvrir la file", "فتح الطابور")} →</a>` }])}
      <div class="grid two">
        ${card(T("Instant payment volume (thousand LYD)", "Volume des paiements instantanés (milliers LYD)", "حجم المدفوعات الفورية (ألف دينار)"), CH.line({ labels, series: [{ name: "LYPay", vals: ly }, { name: "OnePay", vals: op, color: "var(--c2)" }], label: T("Payment volume", "Volume", "حجم المدفوعات") }), { right: seg("dashboard.range", [["7", T("7 days", "7 jours", "7 أيام")], ["30", T("30 days", "30 jours", "30 يوماً")]], M.range) })}
        ${card(T("Service status", "État des services", "حالة الخدمات"), rails.map(([n, s]) => `<div class="rowline"><span class="dot ${s === "degraded" ? "warn" : ""}"></span><b style="flex:1">${esc(n)}</b>${chip(s)}</div>`).join(""), { right: `<a href="#system-health">${T("Details", "Détails", "التفاصيل")}</a>` })}
      </div>
      <div class="grid three">
        ${card(T("Payment mix today", "Répartition du jour", "توزيع المدفوعات اليوم"), CH.donut(mix, String(D.tx.length), T("payments", "paiements", "دفعة")))}
        ${card(T("Fraud cases by SLA", "Dossiers de fraude par échéance", "قضايا الاحتيال حسب المهلة"), cases.map(c => `<div class="rowline"><div style="flex:1;min-width:0"><b>${esc(c.id)}</b> · ${esc(c.title())}<div class="muted">${esc(D.nm(D.cust(c.cust)))}</div></div>${slaHtml(c.sla)}</div>`).join(""), { right: `<a href="#argus">Argus</a>` })}
        ${card(T("Waiting for a checker", "En attente d’un validateur", "بانتظار المراجع"), openAp.length ? openAp.slice(0, 4).map(a => `<div class="rowline"><div style="flex:1;min-width:0"><b>${esc(a.t)}</b><div class="muted">${esc(a.maker === S().user ? T("Requested by you", "Demandé par vous", "طلبتَه أنت") : PERS(a.maker))}</div></div><button class="btn sm primary" data-a="approve" data-p="${a.id}">${w("approve")}</button></div>`).join("") : NX.empty(T("Queue is empty.", "La file est vide.", "الطابور فارغ.")))}
      </div>
      ${card(T("Recent activity", "Activité récente", "النشاط الأخير"), table({ rows: D.tx.slice(0, 7), act: "tx", key: t => t.id, cols: [{ h: w("ref"), r: t => `<span class="num">${t.ref}</span>` }, { h: w("customer"), r: t => esc(D.nm(D.cust(t.cust))) }, { h: T("Rail", "Rail", "القناة"), r: t => RAILN(t.rail), cls: "hide-sm" }, { h: w("amount"), cls: "r", r: t => money(t.amount) }, { h: w("status"), r: t => chip(t.status) }] }), { right: `<a href="#transfers">${T("All payments", "Tous les paiements", "كل المدفوعات")}</a>` })}`;
    }
  });
  const S = () => NX.S, PERS = id => (NX.PERSONAS.find(p => p.id === id) || {}).name || id;
  window.PERS = PERS;
  window.RAILN = r => ({ lypay: "LYPay", onepay: "OnePay", fast: T("Fast transfer", "Virement rapide", "تحويل سريع"), card: T("Card", "Carte", "بطاقة"), internal: T("Internal", "Interne", "داخلي") })[r] || r;
  window.slaHtml = h => `<span class="sla ${h < 2 ? "bad" : h < 6 ? "warn" : "ok"}">${ic("clock")} <span class="num">${h}h</span></span>`;
  window.CASES = () => (window._cases ||= []);
  NX.on({ tx(p) { openTx(p); } });

  /* ---------- transaction detail drawer (shared) ---------- */
  window.openTx = id => NX.drawer(() => {
    const t = D.tx.find(x => x.id === id), c = D.cust(t.cust), nm = D.nm(c);
    const tl = [{ t: T("Instruction received", "Instruction reçue", "استلام التعليمة"), at: t.at.slice(11), s: "ok" }, { t: T("Risk screening passed", "Contrôle de risque réussi", "اجتاز فحص المخاطر"), d: T("Score ", "Score ", "الدرجة ") + t.score, at: t.at.slice(11), s: t.score > 80 ? "warn" : "ok" },
      { t: T("Debit posted", "Débit comptabilisé", "تم القيد المدين"), at: t.at.slice(11), s: t.status === "failed" ? "bad" : "ok" }, { t: t.status === "pending" ? T("Awaiting beneficiary bank", "En attente de la banque du bénéficiaire", "بانتظار بنك المستفيد") : t.status === "failed" ? T("Rejected by beneficiary bank", "Rejeté par la banque du bénéficiaire", "رفضه بنك المستفيد") : T("Credit confirmed", "Crédit confirmé", "تأكيد القيد الدائن"), s: t.status === "failed" ? "bad" : t.status === "pending" ? "cur" : "ok" }];
    const canRev = t.status === "completed" && t.rail !== "card";
    return { t: `<span class="num">${t.ref}</span>`, sub: chip(t.status), b: `<div class="kpis grid" style="margin-bottom:14px"><div class="card flat"><div class="muted">${w("amount")}</div><b style="font-size:24px">${money(t.amount)}</b> LYD</div><div class="card flat"><div class="muted">${w("fee")}</div><b style="font-size:24px">${money(t.fee)}</b></div></div>
      ${NX.dl([[w("customer"), `<a href="#customer/${c.id}">${esc(nm)}</a>`], [T("Rail", "Rail", "القناة"), RAILN(t.rail)], [w("type"), esc(t.type)], [t.dir === "in" ? w("from") : w("to"), esc(t.cp)], [w("channel"), esc(t.ch)], [w("date"), `<span class="num">${t.at}</span>`]])}
      <h3>${T("Timeline", "Chronologie", "المسار الزمني")}</h3>${NX.timeline(tl)}`,
      f: `${canRev ? `<button class="btn danger" data-a="reqReverse" data-p="${t.id}">${ic("refresh")}${T("Request reversal", "Demander l’annulation", "طلب عكس العملية")}</button>` : ""}<button class="btn" data-a="sim">${ic("statement")}${T("Receipt", "Reçu", "إيصال")}</button><button class="btn primary" data-a="go" data-p="customer/${c.id}">${T("Customer 360", "Client 360", "ملف العميل 360")}</button>` };
  });
  NX.on({ reqReverse(id) { const t = D.tx.find(x => x.id === id); NX.closeAll(); NX.request({ kind: "reversal", mod: "transfers", t: T("Reverse payment ", "Annuler le paiement ", "عكس الدفعة ") + t.ref, detail: t.ref + " · " + t.amount.toFixed(2), apply() { t.status = "reversed"; } }); } });

  /* ---------- Analytics heatmap ---------- */
  NX.reg({
    id: "analytics", g: "overview", i: "chart", t: ["Payments analytics", "Analyse des paiements", "تحليلات المدفوعات"], k: "heatmap insights latency success",
    r() {
      const M = NX.m("analytics"); M.metric ??= "vol"; M.rail ??= "all";
      const rr = NX.rnd(M.rail === "lypay" ? 5 : M.rail === "onepay" ? 6 : 4);
      const peak = h => Math.exp(-Math.pow((h - 13) / 3.2, 2)) * .9 + Math.exp(-Math.pow((h - 20) / 2.4, 2)) * 1 + .08;
      const mat = DAYS().map((_, d) => Array.from({ length: 24 }, (_, h) => {
        const wk = d >= 5 ? .8 : d === 4 ? .9 : 1, base = peak(h) * wk, noise = rr() * .12;
        if (M.metric === "vol") return Math.round((base + noise) * 4200 * (M.rail === "all" ? 2 : 1));
        if (M.metric === "fail") return +(0.4 + (d === 3 && h >= 19 && h <= 21 ? 2.6 : 0) + (h >= 2 && h <= 4 ? 1.2 : 0) + base * .6 + rr() * .35).toFixed(2);
        return Math.round(210 + base * 160 + (d === 3 && h >= 19 && h <= 21 ? 420 : 0) + rr() * 40);
      }));
      const flat = mat.flatMap((r, d) => r.map((v, h) => ({ v, d, h }))).sort((a, b) => b.v - a.v)[0];
      const fmtv = M.metric === "vol" ? v => fmt(v) : M.metric === "fail" ? v => v + "%" : v => v + " ms";
      const hue = M.metric === "fail" ? "var(--c3)" : M.metric === "lat" ? "var(--c4)" : "var(--p)";
      const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
      const succ = ["LYPay", "OnePay", T("Fast transfer", "Virement rapide", "تحويل سريع"), T("Card", "Carte", "بطاقة")].map((n, i) => ({ l: n, v: [99.3, S().degraded ? 96.1 : 98.9, 99.6, 98.1][i] }));
      return `${NX.toolbar(`<div class="seg" role="group">${[["vol", T("Volume", "Volume", "الحجم")], ["fail", T("Failure rate", "Taux d’échec", "نسبة الفشل")], ["lat", T("p95 latency", "Latence p95", "زمن p95")]].map(([k, n]) => `<button aria-pressed="${M.metric === k}" data-a="setv" data-p="analytics.metric=${k}">${n}</button>`).join("")}</div>`, NX.select("an-rail", "analytics.rail", [["all", T("All rails", "Tous les rails", "كل القنوات")], ["lypay", "LYPay"], ["onepay", "OnePay"]], M.rail, { aria: T("Rail", "Rail", "القناة") }))}
      ${card(T("When do instant payments happen?", "Quand les paiements instantanés ont-ils lieu ?", "متى تحدث المدفوعات الفورية؟"), CH.heat(mat, DAYS(), hours, { fmt: fmtv, hue, label: T("Heatmap by weekday and hour", "Carte de chaleur par jour et heure", "خريطة حرارية حسب اليوم والساعة") }), { right: `<span class="muted">${T("Last 8 weeks, hour of day", "8 dernières semaines, heure du jour", "آخر 8 أسابيع، ساعة اليوم")}</span>` })}
      <div class="grid three">
        ${card(T("Insight", "Constat", "ملاحظة"), `<div class="note ${M.metric === "vol" ? "" : "warn"}">${ic("bulb")}<div>${M.metric === "vol" ? T("Peak load is ", "Pic de charge : ", "ذروة الحمل: ") + DAYS()[flat.d] + " " + String(flat.h).padStart(2, "0") + ":00 — " + fmt(flat.v) + T(" payments/hour. Plan settlement liquidity ahead of the evening peak.", " paiements/heure. Prévoyez la liquidité avant le pic du soir.", " دفعة/ساعة. خطّط للسيولة قبل ذروة المساء.") : M.metric === "fail" ? T("Failures spike on Thursday evening (19:00–21:00): beneficiary bank timeouts. Raise with the scheme operator.", "Les échecs culminent le jeudi soir (19 h–21 h) : délais de la banque bénéficiaire.", "ترتفع حالات الفشل مساء الخميس (19:00–21:00): انتهاء مهلة بنك المستفيد.") : T("p95 latency doubles in the same window — a capacity problem, not a fraud problem.", "La latence p95 double sur la même plage — un problème de capacité.", "يتضاعف زمن p95 في الفترة نفسها — مشكلة سعة لا احتيال.")}</div></div><p class="muted">${T("Peak cell", "Cellule maximale", "أعلى خلية")}: ${DAYS()[flat.d]} ${String(flat.h).padStart(2, "0")}:00 · <b>${fmtv(flat.v)}</b></p>`)}
        ${card(T("Success rate by rail", "Taux de réussite par rail", "نسبة النجاح حسب القناة"), CH.hbars(succ, { fmt: v => v + "%" }))}
        ${card(T("Top counterparties", "Principales contreparties", "أبرز الأطراف المقابلة"), CH.hbars(D.banks.slice(0, 5).map((b, i) => ({ l: b, v: 420 - i * 63 })), { fmt: v => fmt(v) + "k" }))}
      </div>`;
    }
  });

  /* ---------- global search sources ---------- */
  NX.searchers.push(q => q.length < 2 ? [] : D.customers.filter(c => (c.n.join(" ") + c.id).toLowerCase().includes(q)).slice(0, 5).map(c => ({ ic: "user", t: D.nm(c), s: T("Customer 360", "Client 360", "ملف العميل") + " · " + c.id, run: () => NX.go("customer/" + c.id) })));
  NX.searchers.push(q => q.length < 2 ? [] : D.cards.filter(c => (c.holder + c.last4 + c.id).toLowerCase().includes(q)).slice(0, 4).map(c => ({ ic: "card", t: c.holder + " •••• " + c.last4, s: T("Card", "Carte", "بطاقة") + " · " + c.id, run: () => NX.go("card/" + c.id) })));
  NX.searchers.push(q => q.length < 3 ? [] : D.tx.filter(t => t.ref.toLowerCase().includes(q)).slice(0, 4).map(t => ({ ic: "transfer", t: t.ref, s: RAILN(t.rail) + " · " + t.amount.toFixed(2), run: () => openTx(t.id) })));
})();
