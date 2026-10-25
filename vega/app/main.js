import { tenantName, boot, st, t, add, ic, esc, onChange, setLang, setTheme, vegaLockup, neptuneLogo, LS, RM } from '../assets/core.js';
import { setMode, $, $$, go, tab, bindGlobal, rebuildTabbar, rerenderAll, store, wait, SCR, back } from './kit.js';
import './s-home.js';
import './s-pay.js';
import './s-cash.js';
import './s-services.js';
import './s-money.js';
import './s-account.js';
import './s-calm.js';
import './s-calm2.js';

add({
  st_h1: 'A wallet people actually enjoy§Un portefeuille qu’on aime vraiment§محفظة يحبها الناس فعلاً',
  st_p: 'White-label by design: your name, your colours, your language — running on the Vega ledger.§Marque blanche : votre nom, vos couleurs, votre langue — sur le grand livre Vega.§بعلامتك أنت: اسمك وألوانك ولغتك — فوق دفتر أستاذ Vega.',
  st_f1: 'Send, request, pay by QR§Envoyer, demander, payer par QR§أرسل واطلب وادفع برمز QR', st_f2: 'Cash in/out at agents§Dépôt/retrait chez les agents§إيداع وسحب لدى الوكلاء', st_f3: 'Bills, airtime, vouchers§Factures, recharges, bons§فواتير وشحن وقسائم', st_f4: 'Pockets, cards, rewards§Poches, cartes, récompenses§جيوب وبطاقات ومكافآت',
  st_tour: 'Jump to a moment§Aller à un moment§انتقل إلى مشهد', st_console: 'Open tenant console§Ouvrir la console§افتح لوحة التشغيل', st_reset: 'Restart demo§Relancer la démo§إعادة العرض',
  st_motion: 'Motion§Animations§الحركة', on: 'On§Oui§تشغيل', off: 'Off§Non§إيقاف', st_install: 'Install as an app: browser menu → Add to Home Screen§Installer : menu du navigateur → Ajouter à l’écran d’accueil§للتثبيت: قائمة المتصفح ← إضافة إلى الشاشة الرئيسية',
  j_send: 'Send money§Envoyer§إرسال', j_scan: 'Scan & pay§Scanner§مسح ودفع', j_cashin: 'Cash in§Dépôt§إيداع', j_cards: 'Cards§Cartes§البطاقات', j_kyc: 'Upgrade tier§Niveau§رفع المستوى', j_insights: 'Insights§Analyses§التحليلات', j_mizan: 'Pay over time§Payer en plusieurs fois§الدفع بالتقسيط', j_pos: 'Tap-to-pay POS§TPE sans contact§نقطة بيع باللمس', j_orders: 'Business orders§Commandes pro§طلبات الأعمال', j_welcome: 'Onboarding§Accueil§الترحيب', j_chat: 'Support chat§Assistance§الدعم', j_bills: 'Bills§Factures§الفواتير', j_rewards: 'Rewards§Récompenses§المكافآت'
});

boot({ product: 'app', defaultLook: 'vibrant' });

function jump(s) { const biz = s === 'pos' || s === 'orders'; setMode(biz ? 'business' : 'personal'); rebuildTabbar(); if (s === 'orders') return tab('orders'); tab('home'); setTimeout(() => go(s), 80); }
const JUMPS = [['send', 'j_send'], ['scan', 'j_scan'], ['cashin', 'j_cashin'], ['mizan', 'j_mizan'], ['pos', 'j_pos'], ['orders', 'j_orders'], ['kyc', 'j_kyc'], ['cards', 'j_cards'], ['support', 'j_chat'], ['welcome', 'j_welcome']];

function stageHtml() {
  const looks = window.Looks.list.find(l => l.id === st.look);
  return `<div class="stage">
  <aside class="st-side st-left">
    <div class="st-brand">${vegaLockup()}<span class="sepv"></span>${neptuneLogo()}</div>
    <span class="demo-tag">${ic('info', 'sm')} ${t('demo_label')}</span>
    <h1>${t('st_h1')}</h1><p>${t('st_p')}</p>
    <ul class="feat">${['st_f1', 'st_f2', 'st_f3', 'st_f4'].map(k => `<li>${ic('success-check', 'sm')}<span>${t(k)}</span></li>`).join('')}</ul>
    <p class="small muted">${t('st_install')}</p>
  </aside>
  <main class="st-center"><div class="frame" id="frame"><div class="notch"></div><div class="sbar" aria-hidden="true"><span>9:41</span><span class="r">${ic('globe', 'sm')}<i class="bat"></i></span></div><div class="phone" id="phone"><div id="vp"></div><nav class="tb" aria-label="Main"></nav><div id="splash"></div></div></div></main>
  <aside class="st-side st-right">
    <div class="tool"><span class="lbl muted b">${t('look')}</span><div id="lookpick"></div></div>
    <div class="tool"><span class="lbl muted b">${t('language')}</span><div class="seg" id="langseg" role="tablist">${[['en', 'English'], ['fr', 'Français'], ['ar', 'العربية']].map(([k, n]) => `<button role="tab" aria-selected="${st.lang === k}" data-l="${k}">${n}</button>`).join('')}</div></div>
    <div class="tool"><span class="lbl muted b">${t('theme')}</span><div class="seg" id="themeseg">${['light', 'dark'].map(k => `<button role="tab" aria-selected="${st.theme === k}" data-th="${k}">${t(k)}</button>`).join('')}</div></div>
    <div class="tool"><span class="lbl muted b">${t('st_tour')}</span><div class="jump">${JUMPS.map(([s, k]) => `<button class="chip" data-jump="${s}">${t(k)}</button>`).join('')}</div></div>
    <div class="row wrap"><button class="btn sm outline" id="reset">${ic('refresh', 'sm')} ${t('st_reset')}</button><a class="btn sm tonal" href="../console/?look=${st.look === 'vibrant' ? 'classic' : st.look}">${ic('chart-line', 'sm')} ${t('st_console')}</a></div>
  </aside></div>`;
}

function splash() {
  const sp = $('#splash'); if (!sp) return;
  sp.innerHTML = `<div class="splash"><div class="spl-in">${vegaLockup()}<p class="spl-sub">${esc(tenantName())}</p></div><div class="spl-pw">${neptuneLogo()}</div></div>`;
  const el = $('.splash', sp);
  setTimeout(() => el.classList.add('out'), RM() ? 50 : 1500);
  setTimeout(() => sp.innerHTML = '', RM() ? 100 : 2100);
}

function fit() {
  const f = $('#frame'); if (!f) return;
  const z = innerWidth > 620 ? Math.min(1, (innerHeight - 20) / 872) : 1;
  f.style.setProperty('--z', z);
}

function build(first) {
  const cur = store.tab;
  document.getElementById('stage').innerHTML = stageHtml();
  window.Looks.mount($('#lookpick'), { label: t('look') });
  rebuildTabbar(); bindGlobal(); fit();
  $('#langseg').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) setLang(b.dataset.l); });
  $('#themeseg').addEventListener('click', e => { const b = e.target.closest('[data-th]'); if (b) setTheme(b.dataset.th); });
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => jump(b.dataset.jump)));
  $('#reset').addEventListener('click', () => location.reload());
  return cur;
}

const q = new URLSearchParams(location.search);
build(true);
addEventListener('resize', fit);
tab('home');
if (q.get('splash') !== '0') splash();
const start = q.get('go');
if (start) setTimeout(() => { tab('home'); let p = {}; try { p = JSON.parse(q.get('p') || '{}'); } catch (e) {} go(start, p); }, 300);

onChange(() => {
  // keep stage + router; refresh text in place
  const keep = { stack: null };
  const side = [$('.st-left'), $('.st-right')];
  const tmp = document.createElement('div'); tmp.innerHTML = stageHtml();
  $('.st-left').replaceWith($('.st-left', tmp)); $('.st-right').replaceWith($('.st-right', tmp));
  window.Looks.mount($('#lookpick'), { label: t('look') });
  $('#langseg').addEventListener('click', e => { const b = e.target.closest('[data-l]'); if (b) setLang(b.dataset.l); });
  $('#themeseg').addEventListener('click', e => { const b = e.target.closest('[data-th]'); if (b) setTheme(b.dataset.th); });
  $$('[data-jump]').forEach(b => b.addEventListener('click', () => jump(b.dataset.jump)));
  $('#reset').addEventListener('click', () => location.reload());
  rerenderAll();
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && q.get('sw') !== '0') navigator.serviceWorker.register('sw.js').catch(() => {});

/* Live brand preview: the console's Brand Studio drives this app through postMessage (same-origin only). */
let custom = [];
addEventListener('message', e => {
  const d = e.data; if (!d || d.vega !== 'brand' || e.origin !== location.origin) return;
  const r = document.documentElement;
  custom.forEach(k => r.style.removeProperty(k)); custom = [];
  if (d.look && d.look !== st.look) window.Looks.set(d.look);
  Object.entries(d.vars || {}).forEach(([k, v]) => { r.style.setProperty(k, v); custom.push(k); });
  if ('tenant' in d) st.tenant = d.tenant || '';
  if (d.lang && d.lang !== st.lang) setLang(d.lang);
  if (d.theme && d.theme !== st.theme) setTheme(d.theme);
  if (d.go) { tab('home'); setTimeout(() => go(d.go, d.p || {}), 60); }
  if (d.tab) tab(d.tab);
  if (d.splash) splash();
  rerenderAll();
});
