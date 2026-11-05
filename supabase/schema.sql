-- شغّل الملف ده في Supabase → SQL Editor → New query → Run (آمن تشغّله أكتر من مرة)

-- ============ المنتجات ============
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 1 and 60),
  category   text not null default 'other' check (category in (
               'veg','meat','dairy','pantry','drinks','cleaning','kids','other')),
  created_at timestamptz not null default now()
);

-- ============ المختار الشهر ده ============
create table if not exists public.selections (
  item_id    uuid primary key references public.items(id) on delete cascade,
  source     text not null check (source in ('street', 'online')),
  qty        int  not null default 1 check (qty between 1 and 999),
  bought     boolean not null default false,
  position   int  not null default 0,          -- ترتيبك جوه العمود (1 = أول حاجة)
  updated_at timestamptz not null default now()
);

-- لو الجدول كان معمول قبل كده من غير عمود الترتيب
alter table public.selections add column if not exists position int not null default 0;

-- حدود معقولة لو الجداول كانت معمولة قبل كده
do $$
begin
  alter table public.items add constraint items_name_len check (char_length(name) between 1 and 60);
exception when duplicate_object then null;
end $$;
do $$
begin
  alter table public.selections add constraint selections_qty_max check (qty between 1 and 999);
exception when duplicate_object then null;
end $$;

-- ============ الصلاحيات (مفيش لوجين: أي حد معاه اللينك يقدر يقرا ويعدّل) ============
alter table public.items      enable row level security;
alter table public.selections enable row level security;

drop policy if exists "anon all" on public.items;
drop policy if exists "anon all" on public.selections;
create policy "anon all" on public.items      for all to anon using (true) with check (true);
create policy "anon all" on public.selections for all to anon using (true) with check (true);

grant select, insert, update, delete on public.items, public.selections to anon;

-- ============ زرار الريست: يمسح كل حاجة ويرجّع المنتجات الأصلية (خطوة واحدة) ============
-- الموقع بيبعت القايمة الأصلية (من SEED في app.js) والفانكشن بتستبدل بيها كل حاجة.
create or replace function public.reset_items(seed jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  delete from public.selections where true;
  delete from public.items where true;
  insert into public.items (id, name, category)
  select (x->>'id')::uuid, x->>'name', x->>'category'
  from jsonb_array_elements(seed) as x;
$$;

grant execute on function public.reset_items(jsonb) to anon;

-- ============ Realtime: أي تغيير يوصل لكل الأجهزة المفتوحة على طول ============
do $$
begin
  alter publication supabase_realtime add table public.items;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.selections;
exception when duplicate_object then null;
end $$;

-- ============ المنتجات المبدئية ============
insert into public.items (name, category) values
  -- خضار وفاكهة
  ('خضار متنوع وفاكهة', 'veg'), ('بطاطس محمرة', 'veg'), ('بسلة وجزر بسمة', 'veg'),
  -- لحوم وفراخ وسمك
  ('لحمة', 'meat'), ('فراخ', 'meat'), ('جمبري وسمك', 'meat'),
  ('تركي مدخن', 'meat'),
  -- ألبان وبيض
  ('بيض بلدي الواحة', 'dairy'), ('لبن جهينة', 'dairy'), ('جبنة بيضا طبيعي مزارع دينا', 'dairy'),
  ('جبنة موزاريلا طبيعي', 'dairy'), ('جبنة رومي', 'dairy'), ('زبادي', 'dairy'),
  -- بقالة وتموين
  ('عيش', 'pantry'), ('توست بالرده', 'pantry'), ('بقسماط مطحون', 'pantry'),
  ('رز أبيض الضحى', 'pantry'), ('رز بسمتي دوبيلا', 'pantry'), ('زيت حلوة', 'pantry'),
  ('زيت عباد الشمس', 'pantry'), ('سمن شيراتون طبيعي', 'pantry'), ('عدس بجبة الضحى', 'pantry'),
  ('عدس أصفر', 'pantry'), ('فول الضحى', 'pantry'), ('فاصوليا بيضاء', 'pantry'),
  ('لوبيا', 'pantry'), ('سكر', 'pantry'), ('دقيق فايف ستارز', 'pantry'),
  ('عسل امتنان', 'pantry'), ('مكرونة فرن إيطاليانو', 'pantry'), ('لسان عصفور إيطاليانو', 'pantry'),
  ('مرمرية إيطاليانو', 'pantry'), ('اسباجتي إيطاليانو', 'pantry'), ('مكرونة فوزيلي إيطاليانو', 'pantry'),
  ('طحينة الرشيدي', 'pantry'), ('بريموز رانش صوص', 'pantry'), ('كاتشب', 'pantry'),
  ('صلصة طماطم هارفست', 'pantry'), ('خل', 'pantry'), ('ملح هيمالايا', 'pantry'),
  ('توابل', 'pantry'),
  -- مشروبات وحلويات
  ('بن عبد المعبود', 'drinks'), ('شاي العروسة', 'drinks'), ('يانسون', 'drinks'),
  ('شوكولاتة طبخ دريم', 'drinks'), ('كاكاو خام دريم', 'drinks'), ('حلاوة بالفستق', 'drinks'),
  ('بلح باللوز', 'drinks'),
  -- منظفات وعناية شخصية
  ('أوكسي', 'cleaning'), ('سائل بريل', 'cleaning'), ('فينيش مسحوق غسالة الصحون', 'cleaning'),
  ('كلوركس ألوان', 'cleaning'), ('كلوركس عادي', 'cleaning'), ('ديتول', 'cleaning'),
  ('هاربيك سائل للتواليت', 'cleaning'), ('ليفة مواعين', 'cleaning'), ('مناديل سحب', 'cleaning'),
  ('صابون لوكس', 'cleaning'), ('صابون سائل لليد فريدة', 'cleaning'), ('شاور جل', 'cleaning'),
  ('شامبو كلير', 'cleaning'), ('كريم شعر بانتين', 'cleaning'), ('معجون أسنان', 'cleaning'),
  ('فرش أسنان', 'cleaning'), ('حلاقة', 'cleaning'), ('ديوريكس', 'cleaning'),
  -- أطفال
  ('حفاضات يونس', 'kids'), ('فيتامينات يونس', 'kids'), ('شامبوهات يونس', 'kids')
on conflict (name) do nothing;
