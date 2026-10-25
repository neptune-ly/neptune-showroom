// Offline shell for the Vega wallet demo (cache-first for static files, refreshed in the background).
const V = 'vega-demo-v1';
const FILES = ['./', 'index.html', 'app.css', 'main.js', 'kit.js', 'data.js', 's-home.js', 's-pay.js', 's-cash.js', 's-services.js', 's-money.js', 's-account.js', 'manifest.webmanifest', 'icon.svg',
  '../assets/vega.css', '../assets/core.js', '../assets/odyssey.css', '../assets/looks/looks.css', '../assets/looks/looks.js', '../assets/looks/looks-picker.css', '../assets/fonts/HankenGrotesk.ttf', '../assets/fonts/Baloo2.ttf', '../assets/fonts/Beiruti.ttf', '../assets/brand/Neptune_Logo_Color.png', '../assets/brand/Neptune_Logo_Reverse.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => Promise.all(FILES.map(f => c.add(new URL(f, self.registration.scope).href).catch(() => {})))).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok && e.request.url.startsWith(self.location.origin)) caches.open(V).then(c => c.put(e.request, r.clone())); return r; }).catch(() => hit);
    return hit || net;
  }));
});
