// Caches the whole app on the phone so the clock works offline all night.
const CACHE = 'night-clock-v6';
const ASSETS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'keepawake.mp4',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'fonts/DSEG14Classic-Bold.woff2',
  'fonts/DSEG14Classic-BoldItalic.woff2',
  'fonts/DSEG14Modern-Bold.woff2',
  'fonts/DSEG7Classic-Bold.woff2',
  'fonts/DSEG7Classic-BoldItalic.woff2',
  'fonts/DSEG7Modern-Bold.woff2',
  'fonts/bitcount-grid-double.woff2',
  'fonts/dotgothic16.woff2',
  'fonts/doto.woff2',
  'fonts/handjet.woff2',
  'fonts/lcddot-tr.ttf',
  'fonts/micro-5.woff2',
  'fonts/nixie-one.woff2',
  'fonts/orbitron.woff2',
  'fonts/pixelify-sans.woff2',
  'fonts/share-tech-mono.woff2',
  'fonts/silkscreen.woff2',
  'fonts/sixtyfour.woff2',
  'fonts/tiny5.woff2',
  'fonts/vt323.woff2',
  'fonts/workbench.woff2',
];
// 'reload' bypasses the browser's HTTP cache, so a new version never stores old files
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;   // weather lookups go straight to the network
  // Serve from the phone's cache instantly; refresh the cached copy in the background when online.
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(res => {
      if (res && res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || fresh;
  }));
});
