(() => {
  'use strict';

  // ================== الكاتيجوريز (ثابتة) ==================
  // h = لون الكاتيجوري (درجة اللون من 0 لـ 360)، و"أخرى" رمادي
  const CATS = [
    { key: 'veg',      name: 'خضار وفاكهة',          short: 'خضار',    h: 130 },
    { key: 'meat',     name: 'لحوم وفراخ وسمك',      short: 'لحوم',    h: 0 },
    { key: 'dairy',    name: 'ألبان وبيض',           short: 'ألبان',   h: 205 },
    { key: 'pantry',   name: 'بقالة وتموين',         short: 'بقالة',   h: 40 },
    { key: 'drinks',   name: 'مشروبات وحلويات',      short: 'مشروبات', h: 280 },
    { key: 'cleaning', name: 'منظفات وعناية شخصية', short: 'منظفات',  h: 228 },
    { key: 'kids',     name: 'أطفال',                short: 'أطفال',   h: 330 },
    { key: 'other',    name: 'أخرى',                 short: 'أخرى',    h: 0, gray: true },
  ];
  const CAT_KEYS = new Set(CATS.map((c) => c.key));
  const catOf = (key) => CATS.find((c) => c.key === key) || CATS[CATS.length - 1];
  const tint = (key) => { const c = catOf(key); return `--h:${c.h};${c.gray ? '--s:0%;' : ''}`; };

  // المنتجات المبدئية (لوضع التجربة من غير Supabase — نفس اللي في schema.sql)
  const SEED = {
    veg: ['خضار متنوع وفاكهة', 'بطاطس محمرة', 'بسلة وجزر بسمة'],
    meat: ['لحمة', 'فراخ', 'جمبري وسمك', 'تركي مدخن'],
    dairy: ['بيض بلدي الواحة', 'لبن جهينة', 'جبنة بيضا طبيعي مزارع دينا', 'جبنة موزاريلا طبيعي', 'جبنة رومي', 'زبادي'],
    pantry: ['عيش', 'توست بالرده', 'بقسماط مطحون',
      'رز أبيض الضحى', 'رز بسمتي دوبيلا', 'زيت حلوة', 'زيت عباد الشمس', 'سمن شيراتون طبيعي',
      'عدس بجبة الضحى', 'عدس أصفر', 'فول الضحى', 'فاصوليا بيضاء', 'لوبيا', 'سكر', 'دقيق فايف ستارز', 'عسل امتنان',
      'مكرونة فرن إيطاليانو', 'لسان عصفور إيطاليانو', 'مرمرية إيطاليانو', 'اسباجتي إيطاليانو', 'مكرونة فوزيلي إيطاليانو',
      'طحينة الرشيدي', 'بريموز رانش صوص', 'كاتشب', 'صلصة طماطم هارفست', 'خل', 'ملح هيمالايا', 'توابل'],
    drinks: ['بن عبد المعبود', 'شاي العروسة', 'يانسون',
      'شوكولاتة طبخ دريم', 'كاكاو خام دريم', 'حلاوة بالفستق', 'بلح باللوز'],
    cleaning: ['أوكسي', 'سائل بريل', 'فينيش مسحوق غسالة الصحون', 'كلوركس ألوان', 'كلوركس عادي', 'ديتول',
      'هاربيك سائل للتواليت', 'ليفة مواعين', 'مناديل سحب',
      'صابون لوكس', 'صابون سائل لليد فريدة', 'شاور جل', 'شامبو كلير', 'كريم شعر بانتين', 'معجون أسنان',
      'فرش أسنان', 'حلاقة', 'ديوريكس'],
    kids: ['حفاضات يونس', 'فيتامينات يونس', 'شامبوهات يونس'],
  };

  const cfg = window.APP_CONFIG || {};
  const REMOTE = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_KEY);
  const SUPABASE_JS = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.0/dist/umd/supabase.js';
  // بصمة الملف (SRI): لو حد عدّل الملف على الـ CDN المتصفح هيرفض يشغّله
  const SUPABASE_JS_SRI = 'sha384-3lSoufGjgosjqp3JDr/NReX3PjMd3SlC8wJ23CWFjB6DSFNf71I0DhcRTUm9MwgO';
  const LS_KEY = 'talabat-elbeit-v5';
  const TAB_KEY = 'talabat-elbeit-tab';

  // المنتجات الأصلية بـ ids جديدة (بتستخدم في أول تشغيل وفي الريست)
  const seedItems = () => Object.entries(SEED)
    .flatMap(([category, names]) => names.map((name) => ({ id: uuid(), name, category })));

  // ================== أدوات ==================
  const $ = (s) => document.querySelector(s);
  const ic = window.ic;   // أيقونات SVG من icons.js
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // توحيد الكتابة العربي عشان البحث (أ/ا، ة/ه، ى/ي، تشكيل)
  const norm = (s) => s.trim().toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ');
  const byAr = (a, b) => a.localeCompare(b, 'ar');
  const uuid = () => {
    if (crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  };
  const loadScript = (src, integrity) => new Promise((ok, fail) => {
    const s = document.createElement('script');
    s.src = src;
    if (integrity) { s.integrity = integrity; s.crossOrigin = 'anonymous'; }   // المتصفح يتأكد إن الملف متعدّلش
    s.onload = ok; s.onerror = () => fail(new Error('failed to load ' + src));
    document.head.appendChild(s);
  });

  // ================== الحالة ==================
  let savedTab = null;
  try { savedTab = localStorage.getItem(TAB_KEY); } catch { /* مش مهم */ }
  const state = {
    items: [], sel: new Map(), query: '', editing: false,
    cat: CAT_KEYS.has(savedTab) ? savedTab : CATS[0].key,   // الكاتيجوري المفتوحة تحت
  };
  const itemOf = (id) => state.items.find((i) => i.id === id);
  const nameOf = (id) => itemOf(id)?.name ?? '';

  // ================== التخزين ==================
  // نفس الواجهة للاتنين: Supabase أو localStorage (للتجربة بس)
  let api;

  async function remoteApi() {
    await loadScript(SUPABASE_JS, SUPABASE_JS_SRI);
    // مفيش لوجين: نقفل حفظ الجلسة وتجديد التوكن (مفيش تايمرز ولا تخزين على الفاضي)
    const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const must = ({ data, error }) => { if (error) throw error; return data; };
    let channel = null;
    return {
      async load() {
        const [items, sels] = (await Promise.all([
          sb.from('items').select('id,name,category'),
          sb.from('selections').select('item_id,source,qty,bought,position'),
        ])).map(must);
        return { items, sels };
      },
      addItem: (item) => sb.from('items').insert(item).then(must),
      updateItem: (id, patch) => sb.from('items').update(patch).eq('id', id).then(must),
      deleteItem: (id) => sb.from('items').delete().eq('id', id).then(must),
      saveSels: (list) => sb.from('selections').upsert(list, { onConflict: 'item_id' }).then(must),
      removeSel: (id) => sb.from('selections').delete().eq('item_id', id).then(must),
      clearSels: () => sb.from('selections').delete().not('item_id', 'is', null).then(must),
      // ريست: بيمسح كل حاجة ويرجّع المنتجات الأصلية في خطوة واحدة جوه الداتابيز
      reset: (items) => sb.rpc('reset_items', { seed: items }).then(must),
      // Realtime: أي تغيير من أي جهاز يوصل هنا
      // الاتصال مفتوح بس طول ما الصفحة قدامك
      connect(onChange) {
        if (channel) return;
        channel = sb.channel('talabat')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, onChange)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'selections' }, onChange)
          .subscribe();
      },
      async disconnect() {
        if (!channel) return;
        const ch = channel;
        channel = null;
        await sb.removeChannel(ch);
        sb.realtime.disconnect();   // يقفل الـ WebSocket نفسه
      },
      isConnected: () => Boolean(channel),
    };
  }

  function localApi() {
    const save = async () => {
      localStorage.setItem(LS_KEY, JSON.stringify({ items: state.items, sels: [...state.sel.values()] }));
    };
    return {
      async load() {
        let data = null;
        try { data = JSON.parse(localStorage.getItem(LS_KEY)); } catch { /* فاضي */ }
        return data || {
          items: seedItems(),
          sels: [],
        };
      },
      addItem: save, updateItem: save, deleteItem: save, saveSels: save, removeSel: save, clearSels: save, reset: save,
      connect() {}, disconnect() {}, isConnected: () => false,
    };
  }

  // كل عمليات الحفظ بتمشي ورا بعض بالترتيب
  let queue = Promise.resolve();
  let pending = 0;
  let failed = false;
  function enqueue(fn) {
    pending++;
    setSync('saving');
    queue = queue
      .then(fn)
      .catch((err) => { console.error(err); failed = true; })
      .finally(async () => {
        if (--pending > 0) return;
        if (failed) {
          failed = false;
          toast('الحفظ فشل — بحمّل آخر نسخة');
          await reload();
        } else setSync('ok');
      });
  }
  function persist(fn) {
    flushSels();   // أي تعديل كمية/شطب مستني يتبعت الأول، عشان الترتيب يفضل صح
    enqueue(fn);
  }

  // تعديلات الكمية والشطب بتتجمّع: 5 دوسات ورا بعض = طلب واحد بس
  const dirty = new Set();
  let dirtyTimer;
  function saveSelLater(id) {
    dirty.add(id);
    setSync('saving');
    clearTimeout(dirtyTimer);
    dirtyTimer = setTimeout(flushSels, 450);
  }
  function flushSels() {
    clearTimeout(dirtyTimer);
    if (!dirty.size) return;
    const list = [...dirty].map((id) => state.sel.get(id)).filter(Boolean);
    dirty.clear();
    if (list.length) enqueue(() => api.saveSels(list));
    else if (!pending) setSync('ok');
  }

  async function reload() {
    setSync('saving');
    try {
      const data = await api.load();
      state.items = data.items
        .map((i) => ({ ...i, category: CAT_KEYS.has(i.category) ? i.category : 'other' }))
        .sort((a, b) => byAr(a.name, b.name));
      const ids = new Set(state.items.map((i) => i.id));
      state.sel = new Map(data.sels.filter((s) => ids.has(s.item_id)).map((s) => [s.item_id, s]));
      if (!REMOTE) api.saveSels();
      render();
      setSync('ok');
    } catch (err) {
      console.error(err);
      setSync('error');
      toast('مش قادر أوصل للداتابيز');
    }
  }

  // ================== التغييرات اللي جاية من أجهزة تانية ==================
  // بنطبّق التغيير اللي وصل على طول (من غير ما نحمّل كل الداتا تاني)،
  // وبنتجاهل "الصدى" — يعني التغييرات اللي إحنا لسه عاملينها من الجهاز ده.
  const touched = new Map();      // id → آخر مرة اتعدّل من هنا
  let quietUntil = 0;             // بعد "امسح الكل" أو "الريست" بنتجاهل سيل الأحداث شوية
  const touch = (...ids) => { const t = Date.now(); ids.forEach((id) => touched.set(id, t)); };
  const isEcho = (id) => Date.now() < quietUntil || Date.now() - (touched.get(id) || 0) < 3000;

  let needReload = false;
  function onRemoteChange({ table, eventType, new: row, old }) {
    const id = table === 'items' ? (row?.id ?? old?.id) : (row?.item_id ?? old?.item_id);
    if (!id || isEcho(id)) return;
    if (table === 'items') {
      if (eventType === 'DELETE') {
        state.items = state.items.filter((i) => i.id !== id);
        state.sel.delete(id);
      } else {
        const it = { id, name: row.name, category: CAT_KEYS.has(row.category) ? row.category : 'other' };
        const i = state.items.findIndex((x) => x.id === id);
        if (i >= 0) state.items[i] = it; else state.items.push(it);
        state.items.sort((a, b) => byAr(a.name, b.name));
      }
    } else if (eventType === 'DELETE') {
      state.sel.delete(id);
    } else if (itemOf(id)) {
      state.sel.set(id, { item_id: id, source: row.source, qty: row.qty, bought: row.bought, position: row.position });
    } else {
      needReload = true;   // منتج لسه موصلناش — نحمّل مرة واحدة احتياطي
    }
    scheduleRender();
  }

  let renderTimer;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      if (drag) return scheduleRender();          // منبوظش السحب اللي شغال
      if (needReload && !pending) { needReload = false; reload(); } else render();
    }, 60);
  }

  // خط رفيع فوق الصفحة وقت الحفظ بس
  function setSync(s) { document.body.dataset.sync = s; }

  // ================== الأفعال ==================
  // المنتجات المختارة في عمود معيّن، بالترتيب (رقم 1 الأول)
  const zoneRows = (zone) => [...state.sel.values()]
    .filter((s) => s.source === zone)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || byAr(nameOf(a.item_id), nameOf(b.item_id)));

  function moveTo(id, zone, index) {
    const cur = state.sel.get(id);

    // نازل تحت: يتشال من الطلبات، ولو اتساب على كاتيجوري تانية يتنقل لها
    if (zone === 'pool' || zone.startsWith('cat:')) {
      touch(id);
      if (cur) { state.sel.delete(id); persist(() => api.removeSel(id)); }
      const cat = zone.startsWith('cat:') ? zone.slice(4) : null;
      const item = itemOf(id);
      if (cat && item && item.category !== cat) {
        item.category = cat;
        persist(() => api.updateItem(id, { category: cat }));
      }
      render();
      return;
    }

    // طالع فوق (شارع أو أونلاين)، أو بيترتب جوه نفس العمود
    if (cur && cur.source === zone && index === undefined) return;
    const list = zoneRows(zone).filter((r) => r.item_id !== id);
    const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
    list.splice(at, 0, { qty: 1, bought: false, ...cur, item_id: id, source: zone });
    // نرقّم العمود من الأول (1، 2، 3...) ونحفظ اللي اتغير بس
    const changed = [];
    list.forEach((r, i) => {
      const next = { item_id: r.item_id, source: r.source, qty: r.qty, bought: r.bought, position: i + 1 };
      const prev = state.sel.get(r.item_id);
      if (!prev || prev.position !== next.position || prev.source !== next.source) changed.push(next);
      state.sel.set(r.item_id, next);
    });
    render();
    touch(id, ...changed.map((c) => c.item_id));
    if (changed.length) persist(() => api.saveSels(changed));
  }

  function updateSel(id, patch) {
    const cur = state.sel.get(id);
    if (!cur) return;
    state.sel.set(id, { ...cur, ...patch });
    render();
    touch(id);
    saveSelLater(id);
  }

  const toggleBought = (id) => updateSel(id, { bought: !state.sel.get(id).bought });

  // إضافة منتج: الاسم الأول، وبعدين تختار الكاتيجوري
  const picker = $('#catPicker');
  let pendingName = '';

  function startAdd(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const existing = state.items.find((i) => norm(i.name) === norm(name));
    if (existing) {
      toast(state.sel.has(existing.id) ? `«${existing.name}» موجود فوق بالفعل` : `«${existing.name}» موجود بالفعل`);
      return;
    }
    pendingName = name;
    $('#newName').textContent = name;
    picker.returnValue = '';
    picker.showModal();
  }

  picker.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-pick');
    if (btn) { e.preventDefault(); picker.close(); finishAdd(btn.value); }
    else if (e.target === picker) picker.close();   // دوسة برّه النافذة = إلغاء
  });

  function finishAdd(cat) {
    if (!CAT_KEYS.has(cat) || !pendingName) return;
    const item = { id: uuid(), name: pendingName, category: cat };
    pendingName = '';
    state.items.push(item);
    state.items.sort((a, b) => byAr(a.name, b.name));
    state.query = '';
    $('#q').value = '';
    state.cat = cat;   // افتح الكاتيجوري اللي اتضاف فيها عشان تشوفه
    render();
    touch(item.id);
    persist(() => api.addItem(item));
    toast(`اتضاف «${item.name}» في ${catOf(cat).name}`);
  }

  function deleteItem(id) {
    state.items = state.items.filter((i) => i.id !== id);
    state.sel.delete(id);
    render();
    touch(id);
    persist(() => api.deleteItem(id));
  }

  async function clearAll() {
    if (!state.sel.size) { toast('مفيش حاجة مختارة'); return; }
    const ok = await ask({
      icon: 'trash',
      title: 'تمسح كل الطلبات؟',
      text: 'كل اللي في الشارع والأونلاين هيرجع لمكانه تحت. المنتجات نفسها مش هتتمسح.',
      yes: 'امسح الكل',
    });
    if (!ok) return;
    state.sel.clear();
    render();
    quietUntil = Date.now() + 4000;
    persist(() => api.clearSels());
  }

  async function resetAll() {
    const fresh = seedItems();
    const ok = await ask({
      icon: 'reset',
      title: 'ترجّع كل حاجة زي الأول؟',
      text: `هيتمسح كل المختار فوق، وأي منتج ضفته أو مسحته أو غيّرت الكاتيجوري بتاعته، وترجع القايمة الأصلية (${fresh.length} منتج). الخطوة دي مينفعش تترجع.`,
      yes: 'أيوه، رجّع كل حاجة',
    });
    if (!ok) return;
    state.items = fresh.slice().sort((a, b) => byAr(a.name, b.name));
    state.sel.clear();
    state.query = '';
    $('#q').value = '';
    state.cat = CATS[0].key;
    render();
    quietUntil = Date.now() + 5000;
    persist(() => api.reset(fresh));
    toast('رجعت كل حاجة زي الأول');
  }

  // ================== نافذة التأكيد ==================
  const confirmBox = $('#confirm');
  let confirmDone = null;

  function ask({ icon, title, text, yes }) {
    $('#cfIcon').innerHTML = ic(icon);
    $('#cfTitle').textContent = title;
    $('#cfText').textContent = text;
    $('#cfYes').textContent = yes;
    confirmBox.showModal();
    $('#cfNo').focus();
    return new Promise((resolve) => { confirmDone = resolve; });
  }
  function answer(v) {
    if (confirmBox.open) confirmBox.close();
    confirmDone?.(v);
    confirmDone = null;
  }
  $('#cfYes').addEventListener('click', () => answer(true));
  $('#cfNo').addEventListener('click', () => answer(false));
  confirmBox.addEventListener('cancel', (e) => { e.preventDefault(); answer(false); });   // Esc
  confirmBox.addEventListener('click', (e) => { if (e.target === confirmBox) answer(false); });   // برّه النافذة

  // ================== الرسم ==================
  function render() {
    renderZone('street', '#listStreet', '#countStreet');
    renderZone('online', '#listOnline', '#countOnline');
    renderPool();
  }

  function renderZone(zone, listSel, countSel) {
    // الترتيب بتاعك (اسحب من المقبض ⋮⋮ عشان ترتّب) — واللي اتجاب بيفضل مكانه عشان تراجع عليه
    const rows = zoneRows(zone).map((s) => ({ ...s, name: nameOf(s.item_id) }));
    const done = rows.filter((r) => r.bought).length;
    $(countSel).textContent = rows.length ? `${done}/${rows.length}` : '';
    $(listSel).innerHTML = rows.length
      ? rows.map((r, i) => `
        <li class="row${r.bought ? ' bought' : ''}" data-drag data-id="${r.item_id}">
          <span class="grip" title="اسحب عشان ترتّب" aria-label="الترتيب ${i + 1} — اسحب عشان ترتّب">${ic('grip')}</span>
          <button type="button" class="name" data-act="toggle" aria-pressed="${r.bought}">${esc(r.name)}</button>
          <span class="qty">
            <button type="button" class="tap" data-act="dec" aria-label="قلّل">${ic('minus')}</button>
            <b aria-label="الكمية">${r.qty}</b>
            <button type="button" class="tap" data-act="inc" aria-label="زوّد">${ic('plus')}</button>
          </span>
          <button type="button" class="tap ok" data-act="toggle" title="جبته" aria-label="جبته">${ic('check')}</button>
          <button type="button" class="tap rm" data-act="remove" title="شيله" aria-label="شيله من الطلبات">${ic('x')}</button>
        </li>`).join('')
      : '<li class="empty">اسحب هنا أو دوس على أي منتج</li>';
  }

  function chipHtml(i) {
    return `<button type="button" class="chip tinted" style="${tint(i.category)}" data-drag data-id="${i.id}">${esc(i.name)}${
      state.editing ? `<span class="x" data-act="del" role="button" aria-label="امسح ${esc(i.name)}">${ic('x')}</span>` : ''
    }</button>`;
  }

  // تحت: شريط كاتيجوريز ملوّنة + منتجات الكاتيجوري المفتوحة بس (أو نتايج البحث من كل الكاتيجوريز)
  function renderPool() {
    const q = norm(state.query);
    const avail = state.items.filter((i) => !state.sel.has(i.id));

    $('#tabs').innerHTML = CATS.map((c) => {
      const n = avail.filter((i) => i.category === c.key).length;
      const active = !q && c.key === state.cat;
      return `<button type="button" class="tab tinted${active ? ' active' : ''}" style="${tint(c.key)}"
          data-tab="${c.key}" data-zone="cat:${c.key}" aria-pressed="${active}" title="${c.name}">
          <span class="tab-ic">${ic(c.key)}</span><span class="tab-name">${c.short}</span>${
          n ? `<span class="badge">${n}</span>` : ''}</button>`;
    }).join('');

    let head, list;
    if (q) {
      list = avail.filter((i) => norm(i.name).includes(q));
      head = `<div class="prod-head">${ic('search')} نتايج «${esc(state.query.trim())}»</div>`;
    } else {
      const c = catOf(state.cat);
      list = avail.filter((i) => i.category === c.key);
      head = `<div class="prod-head tinted" style="${tint(c.key)}">${ic(c.key)} ${c.name}</div>`;
    }

    let html = list.map(chipHtml).join('');
    if (q && !state.items.some((i) => norm(i.name) === q)) {
      html += `<button type="button" class="chip add-chip" data-act="add">${ic('plus')} أضف «${esc(state.query.trim())}»</button>`;
    }
    if (!html) html = `<p class="prod-empty">${q ? 'مفيش نتايج' : 'كل منتجات الكاتيجوري دي متختارة فوق'}</p>`;
    $('#products').innerHTML = head + `<div class="prod-chips">${html}</div>`;
  }

  function openTab(key) {
    state.cat = key;
    state.query = '';
    $('#q').value = '';
    try { localStorage.setItem(TAB_KEY, key); } catch { /* مش مهم */ }
    renderPool();
  }

  // ================== قايمة الاختيار (دوسة على منتج تحت) ==================
  const menu = $('#menu');

  function openMenu(el) {
    const id = el.dataset.id;
    menu.innerHTML = `<div class="menu-title">${esc(nameOf(id))}</div>
      <button type="button" data-pick="street">${ic('store')} من الشارع</button>
      <button type="button" data-pick="online">${ic('cart')} أونلاين</button>`;
    menu.dataset.id = id;
    menu.hidden = false;

    const r = el.getBoundingClientRect();
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - mw / 2), innerWidth - mw - 8);
    let top = r.bottom + 6;
    if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 6);
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.querySelector('button')?.focus({ preventScroll: true });
  }
  const closeMenu = () => { menu.hidden = true; };

  // ================== السحب والإفلات (ماوس + تاتش) ==================
  let press = null;   // ضغطة لسه مبقتش سحب
  let drag = null;    // سحب شغال
  let justDragged = false;

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const src = e.target.closest('[data-drag]');
    // الأزرار جوه الصف مش بتبدأ سحب — إلا اسم المنتج
    if (!src || e.target.closest('input, [data-act]:not(.name)')) return;
    press = { el: src, id: src.dataset.id, x: e.clientX, y: e.clientY, touch: e.pointerType !== 'mouse', timer: 0 };
    // المقبض ⋮⋮ اللي جنب المنتج: بيسحب على طول حتى على التاتش
    if (e.target.closest('.grip')) { press.grip = true; return; }
    // على التاتش: دوسة طويلة تبدأ السحب، والحركة السريعة تفضل سكرول عادي
    if (press.touch) {
      press.timer = setTimeout(() => {
        if (!press) return;
        startDrag(press.x, press.y);
        navigator.vibrate?.(15);
      }, 280);
    }
  });

  document.addEventListener('pointermove', (e) => {
    if (drag) { moveDrag(e.clientX, e.clientY); return; }
    if (!press) return;
    const d = Math.hypot(e.clientX - press.x, e.clientY - press.y);
    if (press.touch && !press.grip) { if (d > 10) cancelPress(); return; }
    if (d > 5) startDrag(e.clientX, e.clientY);
  });

  document.addEventListener('pointerup', (e) => {
    if (drag) endDrag(e.clientX, e.clientY);
    cancelPress();
  });
  document.addEventListener('pointercancel', () => { if (drag) endDrag(); cancelPress(); });

  // منع السكرول وقت السحب على الموبايل
  document.addEventListener('touchmove', (e) => { if (drag) e.preventDefault(); }, { passive: false });
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('[data-drag]')) e.preventDefault(); });

  function cancelPress() {
    if (press) clearTimeout(press.timer);
    press = null;
  }

  function startDrag(x, y) {
    const { el, id, touch } = press;
    cancelPress();
    closeMenu();
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.textContent = nameOf(id);
    document.body.appendChild(ghost);
    el.classList.add('dragging');
    document.body.classList.add('is-dragging');
    drag = { id, el, ghost, touch, over: null };
    moveDrag(x, y);
  }

  function moveDrag(x, y) {
    // على التاتش نرفع الشبح فوق الصباع عشان يبان
    drag.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${drag.touch ? '-140%' : '-50%'})`;
    const zone = document.elementFromPoint(x, y)?.closest('[data-zone]') || null;
    if (zone !== drag.over) {
      drag.over?.classList.remove('over');
      zone?.classList.add('over');
      drag.over = zone;
    }
    placeLine(zone, y);
  }

  // خط بيوضح المنتج هيتحط فين جوه العمود
  const dropLine = document.createElement('li');
  dropLine.className = 'drop-line';
  dropLine.setAttribute('aria-hidden', 'true');

  function placeLine(zone, y) {
    const list = zone?.matches('.zone') ? zone.querySelector('.list') : null;
    if (!list) { dropLine.remove(); drag.index = undefined; return; }
    // سكرول لوحده لو قربت من أول أو آخر العمود
    const lr = list.getBoundingClientRect();
    if (y < lr.top + 28) list.scrollTop -= 10;
    else if (y > lr.bottom - 28) list.scrollTop += 10;

    const rows = [...list.querySelectorAll('.row')].filter((r) => r !== drag.el);
    let index = rows.findIndex((r) => { const b = r.getBoundingClientRect(); return y < b.top + b.height / 2; });
    if (index === -1) index = rows.length;
    drag.index = index;
    const before = rows[index];
    if (before) list.insertBefore(dropLine, before);
    else list.appendChild(dropLine);
  }

  function endDrag(x, y) {
    const { id, el, ghost, over, index } = drag;
    ghost.remove();
    dropLine.remove();
    el.classList.remove('dragging');
    over?.classList.remove('over');
    document.body.classList.remove('is-dragging');
    drag = null;
    justDragged = true;
    setTimeout(() => { justDragged = false; }, 60);
    if (over && x !== undefined) moveTo(id, over.dataset.zone, over.matches('.zone') ? index : undefined);
  }

  // ================== الضغطات ==================
  document.addEventListener('click', (e) => {
    if (justDragged) return;

    const pick = e.target.closest('[data-pick]');
    if (pick) { moveTo(menu.dataset.id, pick.dataset.pick); closeMenu(); return; }
    if (!e.target.closest('#menu')) closeMenu();

    const act = e.target.closest('[data-act]');
    if (act) {
      const id = act.closest('[data-id]')?.dataset.id;
      switch (act.dataset.act) {
        case 'toggle': toggleBought(id); break;
        case 'remove': moveTo(id, 'pool'); break;
        case 'inc': { const q = state.sel.get(id).qty; if (q < 999) updateSel(id, { qty: q + 1 }); break; }
        case 'dec': { const q = state.sel.get(id).qty; if (q > 1) updateSel(id, { qty: q - 1 }); break; }
        case 'del':
          ask({ icon: 'trash', title: `تمسح «${nameOf(id)}»؟`, text: 'المنتج هيتشال من القايمة خالص.', yes: 'امسح' })
            .then((ok) => ok && deleteItem(id));
          break;
        case 'add': startAdd(state.query); break;
      }
      return;
    }

    const tab = e.target.closest('[data-tab]');
    if (tab) { openTab(tab.dataset.tab); return; }

    const chip = e.target.closest('.chip[data-drag]');
    if (chip) openMenu(chip);
  });

  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  addEventListener('resize', closeMenu);
  document.addEventListener('scroll', closeMenu, true);

  $('#q').addEventListener('input', (e) => { state.query = e.target.value; renderPool(); });
  $('#addForm').addEventListener('submit', (e) => { e.preventDefault(); startAdd(state.query); });
  $('#clearAll').addEventListener('click', clearAll);
  $('#resetAll').addEventListener('click', resetAll);
  $('#editToggle').addEventListener('click', (e) => {
    state.editing = !state.editing;
    e.currentTarget.setAttribute('aria-pressed', state.editing);
    e.currentTarget.innerHTML = ic(state.editing ? 'check' : 'pencil');
    renderPool();
  });

  // الأيقونات الثابتة في الـ HTML
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = ic(el.dataset.icon); });

  // أزرار الكاتيجوريز في نافذة الإضافة
  $('#catGrid').innerHTML = CATS.map((c) =>
    `<button type="button" class="cat-pick tinted" style="${tint(c.key)}" value="${c.key}">${ic(c.key)}${c.name}</button>`).join('');

  // ================== الاتصال اللحظي (Realtime) ==================
  // بيتفتح لما الصفحة تبقى قدامك، وبيتقفل لما تقفلها أو تروح لأبلكيشن تاني
  // (حتى لو متسطّبة كتطبيق). أول ما ترجع: يفتح تاني ويجيب آخر نسخة.
  let hideTimer;
  let ready = false;   // لحد ما أول تحميل يخلص
  function goOnline() {
    clearTimeout(hideTimer);
    if (!REMOTE || !ready || api.isConnected()) return;
    api.connect(onRemoteChange);     // نشترك الأول عشان مفيش تغيير يفوتنا
    if (!pending) reload();          // وبعدين نجيب آخر نسخة
  }
  function goOffline() {
    flushSels();   // أي تعديل مستني يتبعت حالًا قبل ما الصفحة تروح الخلفية
    // مهلة صغيرة عشان لو رحت ورجعت بسرعة ميقفلش ويفتح على الفاضي
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (document.visibilityState === 'hidden') api?.disconnect(); }, 5000);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') goOnline(); else goOffline();
  });
  addEventListener('pageshow', goOnline);                          // راجع من الـ back/forward cache
  addEventListener('pagehide', () => { flushSels(); clearTimeout(hideTimer); api?.disconnect(); });
  addEventListener('online', goOnline);                            // النت رجع

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
  }

  // ================== تشغيل ==================
  (async () => {
    try {
      api = REMOTE ? await remoteApi() : localApi();
    } catch (err) {
      console.error(err);
      setSync('error');
      toast('مش قادر أحمّل Supabase — اتأكد من النت');
      return;
    }
    await reload();
    ready = true;
    if (document.visibilityState === 'visible') api.connect(onRemoteChange);
  })();

  // PWA: يخلّي الموقع يتسطّب على الموبايل
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW:', err));
  }
})();
