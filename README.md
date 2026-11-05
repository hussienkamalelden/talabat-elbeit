# 🧺 طلبات البيت

صفحة واحدة (HTML + CSS + JS) لطلبات البيت: من الشارع وأونلاين.
الكود على **GitHub**، والموقع على **Cloudflare Pages**، والداتا على **Supabase**. التلاتة مجانيين.

## شكل الفولدر

```
talabat-elbeit/
├── public/                 ← ده الموقع (الفولدر الوحيد اللي Cloudflare بيرفعه)
│   ├── index.html
│   ├── style.css
│   ├── app.js              ← كل المنطق (+ قايمة المنتجات الأصلية SEED)
│   ├── icons.js            ← أيقونات SVG
│   ├── config.js           ← بيانات Supabase (URL + publishable key)
│   ├── sw.js, manifest.webmanifest, icons/   ← عشان يتسطّب كتطبيق (PWA)
│   └── _headers            ← إعدادات Cloudflare
├── supabase/
│   └── schema.sql          ← الجداول + الصلاحيات + Realtime + الريست + المنتجات
└── README.md
```

---

## 1) GitHub

1. اعمل repo جديد على GitHub **فاضي**: من غير README ولا .gitignore ولا license.
2. من جوه فولدر `talabat-elbeit` شغّل:
   ```bash
   git remote add origin https://github.com/<اسمك>/<اسم-الـrepo>.git
   git push -u origin main
   ```
   أول مرة هيفتحلك صفحة تسجيل دخول GitHub في المتصفح.

> الـ repo ممكن يبقى **Private** عادي، وCloudflare هيقدر يوصله.

## 2) Cloudflare Pages (مربوط بـ GitHub)

1. ادخل [dash.cloudflare.com](https://dash.cloudflare.com)، وبعدين **Workers & Pages**، وبعدين **Create**، واختار تاب **Pages**، وبعدين **Connect to Git**.
2. اختار GitHub، واسمحله يوصل للـ repo بتاعك، وبعدين اختار الـ repo.
3. الإعدادات:

   | الإعداد | القيمة |
   |---|---|
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | *(سيبه فاضي)* |
   | Build output directory | `public` |

4. دوس **Save and Deploy**. هيديك لينك زي `https://talabat-elbeit.pages.dev`.
5. من دلوقتي **أي `git push` على `main` هيعمل deploy لوحده** في أقل من دقيقة.

> لحد ما تربط Supabase، الموقع هيشتغل ويحفظ على المتصفح بس. ده عادي ومفيد للتجربة.

## 3) Supabase

1. ادخل [supabase.com](https://supabase.com) واعمل **New project**. اختار Region قريبة، زي **Frankfurt (eu-central-1)**.
2. افتح **SQL Editor**، وبعدين **New query**، والزق محتوى `supabase/schema.sql` كله، وبعدين **Run**.
   - المفروض يقول `Success`.
   - في **Table Editor** هتلاقي جدولين: `items` (69 منتج) و `selections` (فاضي).
   - الملف ده **آمن تشغّله أكتر من مرة**. لو عدّلت فيه بعدين، شغّله تاني وهو مش هيكرر المنتجات.
3. من **Project Settings → API Keys** انسخ:
   - **Project URL**: شكله `https://xxxx.supabase.co`، وهتلاقيه برضه في **Data API**.
   - **Publishable key**: بيبدأ بـ `sb_publishable_`، أو الـ **anon** key من تاب Legacy.
   - ⚠️ **أوعى** تحط الـ `secret` أو `service_role` key. دول بيتجاوزوا كل الصلاحيات.
4. حطهم في `public/config.js`:
   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://xxxx.supabase.co",
     SUPABASE_KEY: "sb_publishable_xxxxxxxx"
   };
   ```
5. اعمل commit وpush:
   ```bash
   git add public/config.js
   git commit -m "Connect Supabase"
   git push
   ```
   Cloudflare هيعمل deploy لوحده.
6. **جرّب:** افتح اللينك على موبايلين، واشطب حاجة من واحد. المفروض تتشطب على التاني في أقل من ثانية.

> **هل ينفع الـ key يبقى في GitHub؟** أيوه. الـ publishable/anon key معمول عشان يبقى ظاهر في المتصفح أصلًا، وأي حد يفتح الموقع يقدر يشوفه. الحماية في الداتابيز نفسها (RLS).

---

## على الموبايل (PWA)

- **أندرويد (Chrome):** افتح اللينك، وبعدين ⋮، وبعدين **Install app** أو **Add to Home screen**.
- **آيفون (Safari):** افتح اللينك، وبعدين زرار المشاركة، وبعدين **Add to Home Screen**.

## ملاحظات

- **مفيش لوجين:** أي حد معاه اللينك يقدر يعدّل أو يعمل ريست، فمتنشرش اللينك.
  - لو عايز تقفله عليك وعلى أهل البيت بس، فعّل **Cloudflare Access** (Zero Trust، ومجاني لحد 50 مستخدم)، وده من غير أي تعديل في الكود.
- **Supabase المجاني** بيوقّف المشروع لو فضل **7 أيام من غير استخدام**. ادخل الداشبورد ودوس **Restore**، والداتا مبتضيعش.
- **تغيير المنتجات الأصلية** (اللي بيرجعلها زرار الريست): `SEED` في `public/app.js`، وبرضه في آخر `supabase/schema.sql`.
- **تغيير الكاتيجوريز:** `CATS` في `public/app.js`، والـ `check` اللي في `supabase/schema.sql`، والأيقونة بتاعتها في `public/icons.js`.
- **تشغيل محلي للتجربة:**
  ```bash
  python -m http.server 5517 --directory public
  ```
  وبعدها افتح `http://localhost:5517`.
