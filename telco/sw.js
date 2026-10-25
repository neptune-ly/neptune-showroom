// Neptune Showroom - Telco apps offline shell. App code: stale-while-revalidate. Vendored ML assets (shared/polaris/vendor): cache-first, filled on first use
// or all at once from Profile > Offline pack. No analytics, nothing leaves the origin.
const V = 'telco-shell-v1', VENDOR = 'telco-vendor-v1';
const SHELL = ['./', 'index.html', 'stage.css', 'stage.js', 'sw.js', 'shared/tc.css', 'shared/core.js', 'shared/onboarding.js', 'assets/odyssey.css', 'assets/fonts/HankenGrotesk.ttf', 'assets/fonts/Baloo2.ttf', 'assets/fonts/Beiruti.ttf',
  'assets/brand/Neptune_Logo_Color.png', 'assets/brand/Neptune_Logo_Reverse.png',
  'mobile/', 'mobile/index.html', 'mobile/app.js', 'mobile/strings.js', 'mobile/manifest.webmanifest', 'mobile/icon.svg', 'mobile/icons/icon-192.png',
  'vega/', 'vega/index.html', 'vega/app.js', 'vega/strings.js', 'vega/manifest.webmanifest', 'vega/icon.svg', 'vega/icons/icon-192.png',
  '../shared/looks/looks.css', '../shared/looks/looks.js', '../shared/looks/looks-picker.css',
  '../shared/polaris/polaris.js', '../shared/polaris/polaris.css', '../shared/polaris/engine.js', '../shared/polaris/liveness.js', '../shared/polaris/mrz.js', '../shared/polaris/demo-camera.js', '../shared/polaris/strings.js', '../shared/polaris/icons.js'];
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
