// Service Worker: بيخلّي الموقع يتسطّب كتطبيق، وبيفتح بسرعة، وبيستقبل الإشعارات.
// الاستراتيجية: النت الأول (عشان أي تعديل يظهر على طول)، ولو مفيش نت يفتح آخر نسخة محفوظة.
// الداتا نفسها (Supabase) مش بتعدّي من هنا.
const CACHE = 'talabat-v14';
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
        // نحفظ الردود السليمة بس (مش صفحات 404 أو أخطاء)
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      // مفيش نت: آخر نسخة محفوظة، ولو فتح صفحة → الصفحة الرئيسية
      .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))),
  );
});

// ================== الإشعارات ==================
// بتوصل من Supabase (Edge Function "notify") لما حد يضيف منتج للطلبات
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'طلبات البيت', {
    body: d.body || 'فيه حاجة جديدة في الطلبات',
    icon: 'icons/icon-192.png',
    badge: 'icons/icon-192.png',
    tag: d.tag || 'talabat',      // كذا إشعار ورا بعض بيتجمعوا في واحد
    renotify: true,
    dir: 'rtl',
    lang: 'ar',
    data: { url: d.url || './' },
  }));
});

// دوسة على الإشعار: يفتح التطبيق (أو يرجعله لو مفتوح)
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow(e.notification.data?.url || './');
    }),
  );
});
