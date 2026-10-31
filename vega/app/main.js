import { boot, st, t, onChange, setLang, setTheme, RM, LS } from '../assets/core.js';
import { $, go, tab, bindGlobal, rebuildTabbar, rerenderAll, SCR } from './kit.js';
import { vegaStar } from './brand.js';
import './s-home.js';
import './s-pay.js';
import './s-cash.js';
import './s-services.js';
import './s-money.js';
import './s-account.js';
import './s-calm.js';
import './s-calm2.js';
import './s-vega.js';

boot({ product: 'app', defaultLook: 'vibrant' });
st.tenant = 'Vega';

function splash() {
  const sp = $('#splash'); if (!sp) return;
  sp.innerHTML = `<div class="splash"><i class="spl-rings"></i><div class="spl-in">${vegaStar('spl-star')}<b>Vega</b></div><p class="spl-sub">${t('spl_tag')}</p></div>`;
  const el = $('.splash', sp);
  setTimeout(() => el.classList.add('out'), RM() ? 50 : 1400);
  setTimeout(() => sp.innerHTML = '', RM() ? 100 : 2000);
}

const q = new URLSearchParams(location.search);
document.getElementById('stage').innerHTML = `<div class="phone" id="phone"><div id="vp"></div><nav class="tb" aria-label="Main"></nav><div id="splash"></div></div>`;
rebuildTabbar(); bindGlobal();
const out = LS.get('vega.app.out') === '1';
tab(out ? 'welcome' : 'home');
if (q.get('splash') !== '0') splash();
// Shortcut links (?go=) may only open screens that need no parameters; anything else lands on Home.
const START = ['wallets', 'activity', 'me', 'cards', 'vouchers', 'pockets', 'insights', 'rewards', 'referrals', 'bills', 'airtime', 'exchange', 'scheduled', 'statements', 'limits', 'support', 'help', 'settings', 'security', 'notifs', 'cashin', 'send', 'request', 'receive', 'scan', 'split', 'kyc'];
const start = q.get('go');
if (start && !out && START.includes(start)) setTimeout(() => SCR[start].tab ? tab(start) : go(start), 300);

onChange(() => { rerenderAll(); });

if ('serviceWorker' in navigator && location.protocol.startsWith('http') && q.get('sw') !== '0') navigator.serviceWorker.register('sw.js').catch(() => {});

/* Live brand preview: the console's Brand Studio drives this app through postMessage (same-origin only). */
let custom = [];
addEventListener('message', e => {
  const d = e.data; if (!d || d.vega !== 'brand' || e.origin !== location.origin) return;
  const r = document.documentElement;
  custom.forEach(k => r.style.removeProperty(k)); custom = [];
  Object.entries(d.vars || {}).forEach(([k, v]) => { r.style.setProperty(k, v); custom.push(k); });
  if ('tenant' in d) st.tenant = d.tenant || 'Vega';
  if (d.lang && d.lang !== st.lang) setLang(d.lang);
  if (d.theme && d.theme !== st.theme) setTheme(d.theme);
  if (d.go) { tab('home'); setTimeout(() => go(d.go, d.p || {}), 60); }
  if (d.tab) tab(d.tab);
  if (d.splash) splash();
  rerenderAll();
});
