// Offline shell for Lumo Pay and Sahar Cash. App code: stale-while-revalidate. Identity-check assets (shared/polaris/vendor): cache-first, filled on first use
// or all at once from Settings > Offline pack. Nothing leaves the origin.
const V = 'telco-shell-v3', VENDOR = 'telco-vendor-v1';
const SHELL = ['./', 'index.html', 'sw.js', 'shared/tc.css', 'shared/core.js', 'shared/onboarding.js', 'shared/vouchers.js', 'shared/settings.js',
  'assets/fonts/HankenGrotesk.ttf', 'assets/fonts/Baloo2.ttf', 'assets/fonts/Beiruti.ttf',
  'mobile/', 'mobile/index.html', 'mobile/app.js', 'mobile/strings.js', 'mobile/lumo.css', 'mobile/manifest.webmanifest', 'mobile/icon.svg', 'mobile/icons/icon-192.png', 'mobile/icons/icon-512.png', 'mobile/icons/maskable-512.png', 'mobile/icons/apple-180.png',
  'vega/', 'vega/index.html', 'vega/app.js', 'vega/strings.js', 'vega/sahar.css', 'vega/manifest.webmanifest', 'vega/icon.svg', 'vega/icons/icon-192.png', 'vega/icons/icon-512.png', 'vega/icons/maskable-512.png', 'vega/icons/apple-180.png',
  '../shared/polaris/polaris.js', '../shared/polaris/polaris.css', '../shared/polaris/engine.js', '../shared/polaris/liveness.js', '../shared/polaris/mrz.js', '../shared/polaris/demo-camera.js', '../shared/polaris/strings.js', '../shared/polaris/icons.js'];
for (const f of ['transfer', 'grid', 'sim', 'search', 'receipt', 'arrow-down', 'savings', 'atm', 'user', 'home', 'more-horizontal', 'chevron-right', 'chevron-down', 'lock', 'logout', 'signal', 'topup', 'qr-code', 'qr-scan', 'package', 'store', 'settings', 'download', 'agent', 'bolt', 'tv', 'sms', 'goal', 'wallet', 'bell', 'eye-off', 'eye', 'card', 'plus', 'receive', 'warning', 'wifi', 'info', 'close', 'copy', 'coins', 'refresh', 'send', 'bill', 'camera', 'esim', 'star', 'success-check', 'face-id', 'gift', 'data', 'voice', 'language', 'sun', 'moon', 'trash', 'trophy', 'flame', 'globe', 'location', 'phone', 'school', 'users', 'drop', 'clock', 'cash-stack', 'contactless', 'card-add', 'chart-pie', 'shield-check', 'insurance', 'shopping-bag', 'trending-down', 'tap-to-pay', 'id-card', 'arrow-left', 'arrow-right', 'category-tag', 'share']) SHELL.push('assets/icons/' + f + '.svg');
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => Promise.all(SHELL.map(u => c.add(new URL(u, self.registration.scope)).catch(() => null)))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== VENDOR).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url); if (u.origin !== location.origin) return;
  if (u.pathname.includes('/shared/polaris/vendor/')) {
    e.respondWith(caches.open(VENDOR).then(async c => { const hit = await c.match(r, { ignoreVary: true }); if (hit) return hit; const res = await fetch(r); if (res.ok && res.status === 200) c.put(r, res.clone()); return res; }));
    return;
  }
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
