// Supabase Edge Function: "notify"
// بتشتغل لوحدها لما منتج يتضاف للطلبات (من الـ trigger اللي في notifications.sql)،
// وبتبعت إشعار لكل الأجهزة المفعّلة الإشعارات — ما عدا الجهاز اللي ضاف المنتج.
//
// محتاجة Secrets (Edge Functions → Secrets): VAPID_PUBLIC_KEY و VAPID_PRIVATE_KEY
// و"Verify JWT" لازم يبقى مقفول (الـ trigger بيكلمها من غير توكن).
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2.112.0';

const SITE = 'https://talabat-elbeit.hussien-kamal92.workers.dev';
const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
webpush.setVapidDetails(SITE, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let itemId = '';
  try { itemId = String((await req.json())?.item_id ?? ''); } catch { /* body غلط */ }
  if (!UUID.test(itemId)) return json({ error: 'bad item_id' }, 400);

  // حماية من الإزعاج: بنبعت بس لمنتج لسه متضاف حالًا (آخر دقيقتين) ومتبعتلوش إشعار قبل كده.
  // التحديث ده بيحصل مرة واحدة بس، فلو حد نادى الفانكشن تاني مش هيتبعت إشعار مكرر.
  const since = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const { data: sel, error: selErr } = await sb
    .from('selections')
    .update({ notified: true })
    .eq('item_id', itemId)
    .eq('notified', false)
    .gte('updated_at', since)
    .select('source, added_by')
    .maybeSingle();
  if (selErr) return json({ error: selErr.message }, 500);
  if (!sel) return json({ skipped: 'not fresh or already notified' });

  const { data: item } = await sb.from('items').select('name').eq('id', itemId).maybeSingle();
  if (!item) return json({ skipped: 'no item' });

  const { data: subs, error: subErr } = await sb.from('push_subscriptions').select('endpoint, p256dh, auth, device_id');
  if (subErr) return json({ error: subErr.message }, 500);
  const targets = (subs ?? []).filter((s) => !sel.added_by || s.device_id !== sel.added_by);

  const payload = JSON.stringify({
    title: 'طلبات البيت',
    body: `اتضاف «${item.name}» ${sel.source === 'street' ? 'لطلبات الشارع' : 'لطلبات الأونلاين'}`,
    tag: 'talabat-added',
    url: SITE,
  });

  let sent = 0;
  await Promise.all(targets.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
      sent++;
    } catch (e) {
      const code = (e as { statusCode?: number })?.statusCode;
      // الجهاز لغى الإشعارات أو اتمسح التطبيق → نشيله
      if (code === 404 || code === 410) await sb.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
      else console.error('push failed', code, e);
    }
  }));

  return json({ sent, targets: targets.length });
});
