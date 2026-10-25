import { boot, st, t, add, ic, esc, setLang, setTheme, onChange, vegaLockup, vegaMark, neptuneLogo, tenantName, RM } from '../assets/core.js';
import { $, $$, route, PAGES, toast, modal, nm } from './ckit.js';
import './c-ops.js';
import './c-review.js';
import './c-admin.js';
import { openCustomer, openTxn } from './c-ops.js';
import { CUSTOMERS, TXNS, AGENTS, MERCHANTS } from './cdata.js';

add({
  grp_overview: 'Overview§Aperçu§نظرة عامة', grp_people: 'People & money§Clients et flux§العملاء والأموال', grp_network: 'Network§Réseau§الشبكة', grp_control: 'Control§Contrôle§الرقابة', grp_platform: 'Platform§Plateforme§المنصة',
  nav_dashboard: 'Dashboard§Tableau de bord§لوحة المؤشرات', nav_customers: 'Customers§Clients§العملاء', nav_wallets: 'Wallets§Portefeuilles§المحافظ', nav_transactions: 'Transactions§Transactions§المعاملات', nav_kyc: 'KYC review§Revue KYC§مراجعة التوثيق', nav_network: 'Agents & merchants§Agents et marchands§الوكلاء والتجار', nav_pricing: 'Limits & fees§Plafonds et frais§الحدود والرسوم', nav_recon: 'Reconciliation§Rapprochement§التسوية', nav_risk: 'Risk & alerts§Risques et alertes§المخاطر والتنبيهات', nav_reports: 'Reports§Rapports§التقارير', nav_roles: 'Roles & access§Rôles et accès§الأدوار والصلاحيات', nav_brand: 'Brand studio§Studio de marque§استوديو الهوية',
  top_search: 'Search customers, transactions, agents…§Rechercher clients, transactions, agents…§ابحث عن عميل أو معاملة أو وكيل…', top_env: 'Sandbox§Bac à sable§بيئة تجريبية', top_tenant: 'Tenant (white-label brand)§Locataire (marque blanche)§المستأجر (علامة بيضاء)', top_me: 'Nadia Farouk · Admin§Nadia Farouk · Admin§نادية فاروق · مدير', top_open_app: 'Open the wallet app§Ouvrir l’app portefeuille§افتح تطبيق المحفظة', top_menu: 'Menu§Menu§القائمة', top_help: 'Type to search · Esc to close§Tapez pour chercher · Échap pour fermer§اكتب للبحث · Esc للإغلاق', top_pages: 'Pages§Pages§الصفحات', top_cust: 'Customers§Clients§العملاء', top_tx: 'Transactions§Transactions§المعاملات', top_ag: 'Network§Réseau§الشبكة', top_none: 'No results§Aucun résultat§لا نتائج'
});
boot({ product: 'console', defaultLook: 'classic' });

const NAV = [
  ['grp_overview', [['dashboard', 'chart-line']]],
  ['grp_people', [['customers', 'users'], ['wallets', 'wallet'], ['transactions', 'transfer'], ['kyc', 'id-card', 6]]],
  ['grp_network', [['network', 'location']]],
  ['grp_control', [['pricing', 'coins'], ['recon', 'swap-exchange'], ['risk', 'security-shield', 4]]],
  ['grp_platform', [['reports', 'statement'], ['roles', 'key'], ['brand', 'edit']]]
];
const shell = () => `<div class="shell" id="shell"><aside class="side" id="side" aria-label="Navigation">
  <button class="tenant" id="tenantbtn" aria-haspopup="true" aria-expanded="false"><span class="tmark">${esc(tenantName().slice(0, 1))}</span><span class="tn"><b>${esc(tenantName())}</b><small>Vega by Neptune · ${t('top_env')}</small></span>${ic('chevron-down', 'sm')}</button>
  <nav>${NAV.map(([g, items]) => `<div class="ng"><div class="ngl">${t(g)}</div>${items.map(([id, i, n]) => `<a href="#/${id}" class="ni" data-nav="${id}" title="${t('nav_' + id)}">${ic(i)}<span class="nl">${t('nav_' + id)}</span>${n ? `<em class="nb">${n}</em>` : ''}</a>`).join('')}</div>`).join('')}</nav>
  <div class="sfoot"><span class="demo-tag2">${ic('info', 'sm')} <span>${t('demo_label')}</span></span><div class="pwr">${neptuneLogo()}</div></div></aside>
  <div class="main"><header class="top"><button class="iconbtn" id="menubtn" aria-label="${t('top_menu')}">${ic('menu')}</button>
    <button class="gsearch" id="gs" aria-label="${t('top_search')}">${ic('search', 'sm')}<span class="sp trunc">${t('top_search')}</span><kbd>⌘K</kbd></button>
    <span class="badge info envb">${t('top_env')}</span>
    <div class="seg langseg" id="langseg">${[['en', 'EN'], ['fr', 'FR'], ['ar', 'ع']].map(([k, n]) => `<button aria-selected="${st.lang === k}" data-l="${k}" aria-label="${k}">${n}</button>`).join('')}</div>
    <button class="iconbtn fill" id="themebtn" aria-label="${t('theme')}">${ic(st.theme === 'dark' ? 'sun' : 'moon')}</button>
    <a class="iconbtn fill" href="../app/?look=${st.look === 'classic' ? 'vibrant' : st.look}" title="${t('top_open_app')}" aria-label="${t('top_open_app')}">${ic('phone')}</a>
    <button class="iconbtn fill" data-go="#/risk" aria-label="Alerts">${ic('bell')}<span class="dot"></span></button>
    <button class="me" title="${t('top_me')}">${`<span class="av f2">NF</span>`}</button></header>
    <main id="page" class="page" tabindex="-1" aria-live="polite"></main></div></div>`;

function build() {
  document.getElementById('root').innerHTML = shell();
  $('#langseg').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) setLang(b.dataset.l); });
  $('#themebtn').addEventListener('click', () => setTheme(st.theme === 'dark' ? 'light' : 'dark'));
  $('#menubtn').addEventListener('click', () => $('#shell').classList.toggle('navopen'));
  $('#side').addEventListener('click', e => { if (e.target.closest('.ni')) $('#shell').classList.remove('navopen'); });
  $('#gs').addEventListener('click', palette);
  $('#tenantbtn').addEventListener('click', tenantPop);
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => location.hash = b.dataset.go));
}
function tenantPop() {
  const m = modal(`<div class="mh"><h2 class="disp">${t('top_tenant')}</h2><button class="iconbtn" data-mclose aria-label="${t('c_close')}">${ic('close')}</button></div><div id="tp"></div>`, { cls: 'sm' });
  window.Looks.mount($('#tp', m), { label: t('top_tenant') });
  document.addEventListener('looks:change', () => setTimeout(() => m.close && m.close(), 400), { once: true });
}
function palette() {
  const m = modal(`<div class="pal"><label class="palq">${ic('search')}<input id="pq" placeholder="${t('top_search')}" autocomplete="off" aria-label="${t('top_search')}"></label><div id="pr" class="prs" role="listbox"></div><div class="palh tiny muted">${t('top_help')}</div></div>`, { cls: 'palette' });
  const pr = $('#pr', m), inp = $('#pq', m); inp.focus();
  const draw = () => {
    const q = inp.value.trim().toLowerCase(), pages = Object.keys(PAGES).filter(id => !q || t('nav_' + id).toLowerCase().includes(q)).slice(0, 6);
    const cs = q ? CUSTOMERS.filter(c => (c.en + c.ar + c.id).toLowerCase().includes(q)).slice(0, 4) : CUSTOMERS.slice(0, 2);
    const tx = q ? TXNS.filter(x => x.id.toLowerCase().includes(q)).slice(0, 3) : [];
    const ag = q ? AGENTS.filter(a => (a.en + a.ar + a.id).toLowerCase().includes(q)).slice(0, 2) : [];
    const sec = (title, items) => items.length ? `<div class="prh">${title}</div>${items.join('')}` : '';
    const it = (icn, label, sub, act) => `<button class="pri" role="option" data-act='${act}'>${ic(icn)}<span class="sp"><b>${label}</b><small class="muted">${sub || ''}</small></span></button>`;
    pr.innerHTML = sec(t('top_pages'), pages.map(id => it('chevron-right', t('nav_' + id), '', 'p:' + id))) + sec(t('top_cust'), cs.map(c => it('user', esc(nm(c)), c.id, 'c:' + c.id))) + sec(t('top_tx'), tx.map(x => it('transfer', x.id, t('tt_' + x.type), 't:' + x.id))) + sec(t('top_ag'), ag.map(a => it('location', esc(nm(a)), a.id, 'p:network'))) || `<p class="center muted" style="padding:24px">${t('top_none')}</p>`;
  };
  inp.addEventListener('input', draw); draw();
  pr.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; const [k, v] = b.dataset.act.split(':'); m.close(); setTimeout(() => { if (k === 'p') location.hash = '#/' + v; if (k === 'c') { location.hash = '#/customers'; setTimeout(() => openCustomer(v), 120); } if (k === 't') { location.hash = '#/transactions'; setTimeout(() => openTxn(v), 120); } }, 280); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') pr.querySelector('.pri')?.click(); });
}
document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); } });

build();
addEventListener('hashchange', route);
route();
onChange(() => {
  const side = $('.side'); const mainTop = $('.main').scrollTop;
  build(); route(); $('.main').scrollTop = mainTop;
});
