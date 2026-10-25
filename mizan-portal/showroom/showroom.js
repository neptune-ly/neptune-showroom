const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const Q = new URLSearchParams(location.search);
const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
let lang = Q.get("lang") || store.get("mz.sr.lang") || "en", theme = Q.get("theme") || store.get("mz.sr.theme") || "light", step = 0, playing = false, timer = null;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const nf = (n, d = 0) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const T = k => (TX[lang] && TX[lang][k]) || TX.en[k] || "";

function applyLang() {
  const d = document.documentElement; d.lang = lang; d.dir = TX[lang].dir;
  $$("[data-i18n]").forEach(e => { const v = T(e.dataset.i18n); if (v) e.textContent = v; });
  $$("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  $("#theme").setAttribute("aria-label", T("theme")); $(".seg").setAttribute("aria-label", TX[lang].name);
  buildSteps(); calc(); setPlayLabel(); store.set("mz.sr.lang", lang);
}
function applyTheme() { document.documentElement.dataset.odysseyMode = theme; $("#theme .ic").style.setProperty("--i", `url(../assets/icons/${theme === "dark" ? "sun" : "moon"}.svg)`); $("#theme").setAttribute("aria-pressed", theme === "dark"); store.set("mz.sr.theme", theme); }
$$("[data-lang]").forEach(b => b.addEventListener("click", () => { lang = b.dataset.lang; applyLang(); }));
$("#theme").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; applyTheme(); });

/* flow diagram */
const SCENES = [{ nodes: [0, 1, 2], links: [0, 1], rail: false }, { nodes: [3, 2], links: [2], rail: false }, { nodes: [2], links: [], rail: false }, { nodes: [2, 3], links: [2], rail: false }, { nodes: [2, 3], links: [2], rail: true }];
function buildSteps() {
  $("#steps").innerHTML = SCENES.map((_, i) => `<button role="tab" class="stp" data-i="${i}" aria-selected="${i === step}"><span class="n">${i + 1}</span><span>${T("s" + (i + 1) + "_t")}</span></button>`).join("");
  $$(".stp").forEach(b => b.addEventListener("click", () => { go(+b.dataset.i); pause(); }));
  paint();
}
function paint() {
  const sc = SCENES[step];
  $$(".fl-node").forEach(n => n.classList.toggle("on", sc.nodes.includes(+n.dataset.n)));
  $$(".fl-link").forEach(l => l.classList.toggle("run", sc.links.includes(+l.dataset.l)));
  $("#rail").classList.toggle("run", sc.rail);
  $$(".stp").forEach(b => b.setAttribute("aria-selected", +b.dataset.i === step));
  $("#stepPanel").innerHTML = `<h3>${T("s" + (step + 1) + "_t")}</h3><p>${T("s" + (step + 1) + "_x")}</p>`;
  $("#sn").textContent = step + 1;
}
function go(i) { step = (i + SCENES.length) % SCENES.length; paint(); }
function setPlayLabel() { $("#play").textContent = playing ? T("pause") : T("play"); $("#play").setAttribute("aria-pressed", playing); }
function play() { if (reduce) return; playing = true; clearInterval(timer); timer = setInterval(() => go(step + 1), 4200); setPlayLabel(); }
function pause() { playing = false; clearInterval(timer); setPlayLabel(); }
$("#play").addEventListener("click", () => playing ? pause() : play());
$("#prev").addEventListener("click", () => { go(step - 1); pause(); });
$("#next").addEventListener("click", () => { go(step + 1); pause(); });

/* economics */
function calc() {
  const P = +$("#e1").value, n = +$("#e2").value, r = +$("#e3").value, f = +$("#e4").value;
  const profit = Math.round(P * r / 100 * n / 12), price = P + profit, inst = Math.ceil(price / n), pool = P * f / 100, u = " " + T("lyd");
  $("#v1").textContent = nf(P) + u; $("#v2").textContent = nf(n); $("#v3").textContent = nf(r, 1) + "%"; $("#v4").textContent = nf(f, 1) + "%";
  $("#o_inst").textContent = nf(inst) + u; $("#o_profit").textContent = nf(profit) + u; $("#o_total").textContent = nf(price) + u; $("#o_pool").textContent = nf(pool, 1) + u;
  $("#p1").textContent = nf(pool * .3, 1); $("#p2").textContent = nf(pool * .5, 1); $("#p3").textContent = nf(pool * .2, 1);
  $("#poolbar").innerHTML = `<span class="c1" style="flex:30">30%</span><span class="c2" style="flex:50">50%</span><span class="c3" style="flex:20">20%</span>`;
  $("#poolbar").setAttribute("aria-label", "30% / 50% / 20%");
}
["e1", "e2", "e3", "e4"].forEach(id => $("#" + id).addEventListener("input", calc));

/* form */
$("#cform").addEventListener("submit", e => { e.preventDefault(); $("#thanks").hidden = false; });

/* reveal */
if (!reduce && "IntersectionObserver" in window) {
  document.documentElement.classList.add("rv");
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { threshold: .12 });
  $$(".head,.flow,.panel,.cards article,.dcard,.faq-list,.contact-card,.iso,.steps,.step-panel").forEach((e, i) => { e.classList.add("reveal"); e.style.setProperty("--d", (i % 4) * 70 + "ms"); io.observe(e); });
}
applyTheme(); applyLang(); play();

/* looks picker */
function syncLook() { const l = Looks.list.find(x => x.id === Looks.get()); if (l) { $("#lookDot").style.cssText = `--a:${l.brand};--b:${l.accent};--c:${l.canvas}`; $("#lookMenu summary").title = l.name + " — " + l.tag; } }
Looks.mount($("#lookPick"), { label: "Look" }); syncLook();
document.addEventListener("looks:change", () => { syncLook(); $("#lookMenu").open = false; });
