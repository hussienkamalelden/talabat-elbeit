-- الإشعارات: شغّل الملف ده في Supabase → SQL Editor → New query → Run
-- (بعد schema.sql — وآمن تشغّله أكتر من مرة)

-- ============ مين ضاف المنتج (عشان الإشعار ميوصلش للي ضافه نفسه) ============
alter table public.selections add column if not exists added_by text check (char_length(added_by) <= 64);
alter table public.selections add column if not exists notified boolean not null default false;

-- ============ الأجهزة اللي مفعّلة الإشعارات ============
-- الجدول ده محدش يقدر يقراه من الموقع خالص (مفيش policies) — بيتكتب فيه من الفانكشنز اللي تحت بس
create table if not exists public.push_subscriptions (
  endpoint   text primary key check (char_length(endpoint) <= 1000),
  p256dh     text not null check (char_length(p256dh) <= 200),
  auth       text not null check (char_length(auth) <= 100),
  device_id  text check (char_length(device_id) <= 64),
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;

create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_device text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.push_subscriptions (endpoint, p256dh, auth, device_id)
  values (p_endpoint, p_p256dh, p_auth, p_device)
  on conflict (endpoint) do update
    set p256dh = excluded.p256dh, auth = excluded.auth, device_id = excluded.device_id;
$$;

create or replace function public.delete_push_subscription(p_endpoint text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.push_subscriptions where endpoint = p_endpoint;
$$;

revoke all on function public.save_push_subscription(text, text, text, text) from public;
revoke all on function public.delete_push_subscription(text) from public;
grant execute on function public.save_push_subscription(text, text, text, text) to anon;
grant execute on function public.delete_push_subscription(text) to anon;

-- ============ لما منتج يتضاف للطلبات → نكلّم الـ Edge Function "notify" ============
create extension if not exists pg_net with schema extensions;

create or replace function public.notify_new_selection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    url     := 'https://rpqykeueaveuymywwyio.supabase.co/functions/v1/notify',
    body    := jsonb_build_object('item_id', new.item_id),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
end;
$$;

drop trigger if exists selections_notify on public.selections;
create trigger selections_notify
  after insert on public.selections
  for each row execute function public.notify_new_selection();
