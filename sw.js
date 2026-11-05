// Service Worker: بيخلّي الموقع يتسطّب كتطبيق، وبيفتح بسرعة.
// الاستراتيجية: النت الأول (عشان أي تعديل يظهر على طول)، ولو مفيش نت يفتح آخر نسخة محفوظة.
// الداتا نفسها (Supabase) مش بتعدّي من هنا.
const CACHE = 'talabat-v10';
const SHELL = [
  './', 'index.html', 'style.css', 'app.js', 'icons.js', 'config.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })   // يتأكد من السيرفر كل مرة (رد سريع لو الملف متغيرش)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('index.html'))),
  );
});
