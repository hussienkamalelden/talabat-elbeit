# 🧺 طلبات البيت

صفحة واحدة (HTML + CSS + JS) لطلبات البيت: من الشارع وأونلاين.
الداتا على **Supabase**، والموقع على **Cloudflare Pages**، والاتنين مجاني.

## الملفات

| الملف | وظيفته |
|---|---|
| `index.html` | هيكل الصفحة |
| `style.css` | التصميم (فاتح/غامق تلقائي) |
| `app.js` | كل المنطق: سحب وإفلات، حفظ، Realtime |
| `config.js` | بيانات Supabase |
| `schema.sql` | الجداول + الصلاحيات + Realtime + المنتجات المبدئية |
| `manifest.webmanifest`, `sw.js`, `icons/` | عشان الموقع يتسطّب كتطبيق (PWA) |
| `_headers` | إعدادات Cloudflare |

## 1) Supabase

1. ادخل [supabase.com](https://supabase.com) واعمل **New project** (اختار أقرب Region، زي Frankfurt).
2. من القايمة الجانبية افتح **SQL Editor**، بعدين **New query**، والزق محتوى `schema.sql` كله، وبعدين **Run**.
   - المفروض يقولك `Success`، وتلاقي في **Table Editor** جدولين: `items` و `selections`.
3. من **Project Settings → API Keys** انسخ:
   - **Project URL** (شكله `https://xxxx.supabase.co`)، وهتلاقيه برضه في **Project Settings → Data API**.
   - **Publishable key** (بيبدأ بـ `sb_publishable_`)، أو الـ **anon** key من تاب Legacy.
   - ⚠️ **أوعى** تستخدم الـ `secret` أو `service_role` key.
4. حطهم في `config.js`:
   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://xxxx.supabase.co",
     SUPABASE_KEY: "sb_publishable_xxxxxxxx"
   };
   ```

## 2) Cloudflare Pages

1. ادخل [dash.cloudflare.com](https://dash.cloudflare.com)، وبعدين **Workers & Pages**، وبعدين **Create**، واختار تاب **Pages**، وبعدين **Upload assets**.
2. سمّي المشروع (مثلًا `talabat-elbeit`)، واسحب **محتوى الفولدر ده** (الملفات نفسها، مش الفولدر اللي فوقهم)، وبعدين **Deploy**.
3. هيديك لينك زي `https://talabat-elbeit.pages.dev`.
4. لو عدّلت أي حاجة بعدين: افتح نفس المشروع، وبعدين **Create deployment**، وارفع الملفات تاني.

> الملف `README.md` ومش لازم يترفع، ومش هيضر لو اترفع.

## 3) على الموبايل

- **أندرويد (Chrome):** افتح اللينك، وبعدين ⋮، وبعدين **Install app** أو **Add to Home screen**.
- **آيفون (Safari):** افتح اللينك، وبعدين زرار المشاركة، وبعدين **Add to Home Screen**.

## ملاحظات

- **مفيش لوجين:** أي حد معاه اللينك يقدر يعدّل. لو عايز تقفله عليك وعلى أهل البيت بس، فعّل **Cloudflare Access** (مجاني لحد 50 مستخدم)، وده من غير أي تعديل في الكود.
- **Supabase المجاني** بيوقّف المشروع لو فضل **7 أيام من غير استخدام**. ساعتها ادخل الداشبورد ودوس **Restore**، والداتا مبتضيعش.
- **من غير `config.js`** (لو سبته فاضي) الموقع بيشتغل ويحفظ على المتصفح بس. ده مفيد للتجربة.
- **الكاتيجوريز ثابتة في الكود:** في `CATS` جوه `app.js`، وفي الـ `check` اللي جوه `schema.sql`.
