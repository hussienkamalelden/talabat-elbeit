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
  const ZONE_NAME = { street: 'الشارع', online: 'الأونلاين' };
  const ZONE_TO = { street: 'للشارع', online: 'للأونلاين' };

  // المنتجات الأصلية (أول تشغيل + زرار "رجّع الأصل") — نفس اللي في آخر supabase/schema.sql
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
  const PREF_KEY = 'talabat-elbeit-prefs';
  const DEVICE_KEY = 'talabat-elbeit-device';

  // ================== أدوات ==================
  const $ = (s) => document.querySelector(s);
  const ic = window.ic;   // أيقونات SVG من icons.js
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
  const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* مش مهم */ } };
  const mobile = matchMedia('(max-width: 760px)');

  // كل جهاز ليه رقم ثابت — عشان الإشعار ميوصلش للي ضاف المنتج نفسه
  const DEVICE = lsGet(DEVICE_KEY) || uuid();
  lsSet(DEVICE_KEY, DEVICE);

  // ================== البحث الذكي ==================
  // توحيد الكتابة: أ/إ/آ=ا، ة=ه، ى/ئ=ي، ؤ=و، التشكيل
  const norm = (s) => s.trim().toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ىئ]/g, 'ي').replace(/ؤ/g, 'و').replace(/ء/g, '')
    .replace(/\s+/g, ' ');
  // للبحث بس: حروف بتتلخبط في الكتابة (ذ/ظ=ز، ث/ص=س، ط=ت، ض=د)
  const fold = (s) => norm(s).replace(/[ذظ]/g, 'ز').replace(/[ثص]/g, 'س').replace(/ط/g, 'ت').replace(/ض/g, 'د');
  const stripAl = (w) => (w.length > 4 && w.startsWith('ال') ? w.slice(2) : w);

  // مسافة بين كلمتين (عدد الحروف الغلط/الناقصة/الزيادة/المقلوبة)
  function editDistance(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev2 = null, prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let rowMin = i;
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
        cur.push(v);
        rowMin = Math.min(rowMin, v);
      }
      if (rowMin > max) return max + 1;
      prev2 = prev; prev = cur;
    }
    return prev[b.length];
  }

  function wordScore(qw, words) {
    let best = 0;
    for (const w of words) {
      if (w === qw) return 100;
      if (w.startsWith(qw)) best = Math.max(best, 90);
      else if (w.includes(qw)) best = Math.max(best, 70);
      else if (qw.length >= 3) {
        // كلمة قصيرة = غلطة واحدة بس في الكلمة كلها، والأطول تستحمل أكتر وتقارن بأول الكلمة كمان
        const tol = qw.length <= 5 ? 1 : 2;
        let d = editDistance(qw, w, tol);
        if (qw.length >= 4) d = Math.min(d, editDistance(qw, w.slice(0, qw.length), tol));
        if (d <= tol) best = Math.max(best, 60 - d * 15);
      }
    }
    return best;
  }

  // درجة التطابق (0 = مش مطابق)
  function matchScore(name, qf) {
    const f = fold(name);
    if (f.includes(qf)) return 300 - f.indexOf(qf);
    const words = f.split(' ').map(stripAl);
    const qws = qf.split(' ').filter(Boolean).map(stripAl);
    let total = 0;
    for (const qw of qws) {
      const s = wordScore(qw, words);
      if (!s) return 0;
      total += s;
    }
    return total / qws.length;
  }

  function search(query) {
    const qf = fold(query);
    if (!qf) return [];
    const res = state.items
      .map((i) => ({ i, s: matchScore(i.name, qf) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s || byAr(a.i.name, b.i.name));
    // لو فيه نتيجة قوية، نشيل النتايج الضعيفة جدًا عشان القايمة تبقى نضيفة
    const best = res[0]?.s || 0;
    return res.filter((r) => best < 90 || r.s >= best * 0.3).map((r) => r.i);
  }

  // ================== الحالة ==================
  const prefs = lsGet(PREF_KEY) || {};
  const state = {
    items: [], sel: new Map(), query: '', editing: false,
    cat: CAT_KEYS.has(prefs.cat) ? prefs.cat : CATS[0].key,         // الكاتيجوري المفتوحة
    dest: prefs.dest === 'online' ? 'online' : 'street',             // المنتج هيتضاف فين
    view: ['street', 'online', 'products'].includes(prefs.view) ? prefs.view : 'street',   // الشاشة (موبايل)
  };
  const savePrefs = () => lsSet(PREF_KEY, { cat: state.cat, dest: state.dest, view: state.view });
  const itemOf = (id) => state.items.find((i) => i.id === id);
  const nameOf = (id) => itemOf(id)?.name ?? '';
  const seedItems = () => Object.entries(SEED)
    .flatMap(([category, names]) => names.map((name) => ({ id: uuid(), name, category })));

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
    let withDevice = true;   // لو عمود added_by لسه مش موجود في الداتابيز، نكمّل من غيره
    const COLS = ['item_id', 'source', 'qty', 'bought', 'position'];
    const pick = (s) => Object.fromEntries(COLS.map((k) => [k, s[k]]));

    async function upsertSels(list) {
      const rows = list.map((s) => (withDevice ? { ...pick(s), added_by: DEVICE } : pick(s)));
      const res = await sb.from('selections').upsert(rows, { onConflict: 'item_id' });
      if (res.error && withDevice && /added_by/.test(res.error.message || '')) {
        withDevice = false;
        return upsertSels(list);
      }
      return must(res);
    }

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
      saveSels: upsertSels,
      removeSel: (id) => sb.from('selections').delete().eq('item_id', id).then(must),
      clearSels: () => sb.from('selections').delete().not('item_id', 'is', null).then(must),
      // "رجّع الأصل": بيمسح كل حاجة ويرجّع المنتجات الأصلية في خطوة واحدة جوه الداتابيز
      reset: (items) => sb.rpc('reset_items', { seed: items }).then(must),
      // الإشعارات
      savePush: (s) => sb.rpc('save_push_subscription', {
        p_endpoint: s.endpoint, p_p256dh: s.p256dh, p_auth: s.auth, p_device: DEVICE,
      }).then(must),
      removePush: (endpoint) => sb.rpc('delete_push_subscription', { p_endpoint: endpoint }).then(must),
      // Realtime: الاتصال مفتوح بس طول ما الصفحة قدامك
      connect(onChange) {
        if (channel) return;
        channel = sb.channel('talabat')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, onChange)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'selections' }, onChange)
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') setConn('on');
            else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') setConn('connecting');   // بيحاول تاني لوحده
            else if (status === 'CLOSED') setConn('off');
          });
        setConn('connecting');
      },
      async disconnect() {
        if (!channel) return;
        const ch = channel;
        channel = null;
        await sb.removeChannel(ch);
        sb.realtime.disconnect();   // يقفل الـ WebSocket نفسه
        setConn('off');
      },
      isConnected: () => Boolean(channel),
    };
  }

  function localApi() {
    const save = async () => lsSet(LS_KEY, { items: state.items, sels: [...state.sel.values()] });
    return {
      async load() { return lsGet(LS_KEY) || { items: seedItems(), sels: [] }; },
      addItem: save, updateItem: save, deleteItem: save, saveSels: save, removeSel: save, clearSels: save, reset: save,
      savePush: async () => {}, removePush: async () => {},
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
        .map((i) => ({ id: i.id, name: i.name, category: CAT_KEYS.has(i.category) ? i.category : 'other' }))
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
  let quietUntil = 0;             // بعد "امسح الكل" أو "رجّع الأصل" بنتجاهل سيل الأحداث شوية
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

  // علامة الاتصال اللي تحت العنوان: متصل (أخضر) / بيتصل / مش متصل
  function setConn(s) {
    const el = $('#conn');
    if (!REMOTE) s = 'local';
    el.dataset.state = s;
    el.textContent = { on: 'متصل', connecting: 'بيتصل…', off: 'مش متصل', local: 'مش متصل بالسيرفر' }[s];
  }

  // ================== الأفعال ==================
  // المنتجات المختارة في قايمة معيّنة: متجمّعة تحت الكاتيجوري بتاعتها، وجوه كل كاتيجوري بترتيبك انت
  const CAT_ORDER = new Map(CATS.map((c, i) => [c.key, i]));
  const catIndex = (id) => CAT_ORDER.get(itemOf(id)?.category) ?? CATS.length;
  const zoneRows = (zone) => [...state.sel.values()]
    .filter((s) => s.source === zone)
    .sort((a, b) => catIndex(a.item_id) - catIndex(b.item_id)
      || (a.position ?? 0) - (b.position ?? 0)
      || byAr(nameOf(a.item_id), nameOf(b.item_id)));

  function moveTo(id, zone, index) {
    const cur = state.sel.get(id);

    // نازل للمنتجات: يتشال من الطلبات، ولو اتساب على كاتيجوري تانية يتنقل لها
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

    // طالع للطلبات (شارع أو أونلاين)، أو بيترتب جوه نفس القايمة
    if (cur && cur.source === zone && index === undefined) return;
    const list = zoneRows(zone).filter((r) => r.item_id !== id);
    const at = index === undefined ? list.length : Math.max(0, Math.min(index, list.length));
    list.splice(at, 0, { qty: 1, bought: false, ...cur, item_id: id, source: zone });
    const changed = [];
    list.forEach((r, i) => {
      const next = { item_id: r.item_id, source: r.source, qty: r.qty, bought: r.bought, position: i + 1 };
      const prev = state.sel.get(r.item_id);
      if (!prev || prev.position !== next.position || prev.source !== next.source) changed.push(next);
      state.sel.set(r.item_id, next);
    });
    render();
    if (!cur || cur.source !== zone) bump(zone);
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

  // دوسة على منتج في "المنتجات": يتضاف للمكان المختار، ودوسة تانية تشيله
  function togglePick(id) {
    const cur = state.sel.get(id);
    if (cur) {
      moveTo(id, 'pool');
      toast(`اتشال «${nameOf(id)}»`);
    } else {
      moveTo(id, state.dest);
      toast(`اتضاف «${nameOf(id)}» ${ZONE_TO[state.dest]}`);
    }
  }

  // إضافة منتج جديد: الاسم الأول، وبعدين الكاتيجوري
  const picker = $('#catPicker');
  let pendingName = '';

  function startAdd(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (!name) { $('#q').focus(); return; }
    const existing = state.items.find((i) => norm(i.name) === norm(name));
    if (existing) {
      toast(state.sel.has(existing.id) ? `«${existing.name}» متضاف بالفعل` : `«${existing.name}» موجود بالفعل`);
      return;
    }
    pendingName = name;
    $('#newName').textContent = name;
    $('#q').blur();
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
    setQuery('');
    state.cat = cat;
    savePrefs();
    touch(item.id);
    persist(() => api.addItem(item));
    // المنتج الجديد بيتضاف على طول للمكان المختار (شارع/أونلاين)
    moveTo(item.id, state.dest);
    toast(`اتضاف «${item.name}» في ${catOf(cat).name} و${ZONE_TO[state.dest]}`);
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
      text: 'كل اللي في الشارع والأونلاين هيتشال. المنتجات نفسها مش هتتمسح.',
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
      icon: 'trash',
      title: 'ترجّع كل حاجة زي الأول؟',
      text: `هيتمسح كل المختار، وأي منتج ضفته أو مسحته أو غيّرت الكاتيجوري بتاعته، وترجع القايمة الأصلية (${fresh.length} منتج). الخطوة دي مينفعش تترجع.`,
      yes: 'أيوه، رجّع كل حاجة',
    });
    if (!ok) return;
    state.items = fresh.slice().sort((a, b) => byAr(a.name, b.name));
    state.sel.clear();
    setQuery('');
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
    renderZone('street');
    renderZone('online');
    renderPool();
  }

  const ZONE_EL = {
    street: { list: '#listStreet', count: '#countStreet', bar: '#barStreet', nav: '#navStreet' },
    online: { list: '#listOnline', count: '#countOnline', bar: '#barOnline', nav: '#navOnline' },
  };

  function renderZone(zone) {
    const el = ZONE_EL[zone];
    const rows = zoneRows(zone).map((s) => ({ ...s, name: nameOf(s.item_id) }));
    const done = rows.filter((r) => r.bought).length;
    const left = rows.length - done;

    // العدد: جبت كام من كام + خط التقدّم
    const count = $(el.count);
    count.textContent = !rows.length ? '' : left === 0 ? 'كله اتجاب ✓' : `جبت ${done} من ${rows.length}`;
    count.classList.toggle('all-done', rows.length > 0 && left === 0);
    $(el.bar).style.width = rows.length ? `${(done / rows.length) * 100}%` : '0';

    // رقم الباقي على زرار التنقل تحت
    const nav = $(el.nav);
    nav.textContent = !rows.length ? '' : left === 0 ? '✓' : String(left);
    nav.classList.toggle('done', rows.length > 0 && left === 0);

    // عنوان لكل كاتيجوري فوق منتجاتها (فيه جبت كام من كام)
    const groups = new Map();
    rows.forEach((r) => {
      const k = itemOf(r.item_id)?.category || 'other';
      const g = groups.get(k) || { total: 0, done: 0 };
      g.total++; if (r.bought) g.done++;
      groups.set(k, g);
    });
    let lastCat = null;
    const head = (r) => {
      const k = itemOf(r.item_id)?.category || 'other';
      if (k === lastCat) return '';
      lastCat = k;
      const c = catOf(k), g = groups.get(k);
      return `<li class="grp-head tinted${g.done === g.total ? ' done' : ''}" style="${tint(k)}" aria-hidden="true">
        ${ic(k)}<span>${c.name}</span><b>${g.done}/${g.total}</b></li>`;
    };

    $(el.list).innerHTML = rows.length
      ? rows.map((r, i) => `${head(r)}
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
      : `<li class="empty">
          <span class="empty-ic">${ic(zone === 'street' ? 'store' : 'cart')}</span>
          <span>مفيش حاجة في ${ZONE_NAME[zone]} لسه</span>
          <button type="button" class="btn" data-go="products" data-dest="${zone}">${ic('plus')}أضف منتجات</button>
        </li>`;
  }

  function chipHtml(i) {
    const s = state.sel.get(i.id);
    const on = s ? ` on at-${s.source}` : '';
    const mark = s ? `<span class="chip-mark">${ic(s.source === 'street' ? 'store' : 'cart')}</span>` : '';
    const del = state.editing ? `<span class="x" data-act="del" role="button" aria-label="امسح ${esc(i.name)}">${ic('x')}</span>` : '';
    return `<button type="button" class="chip tinted${on}" style="${tint(i.category)}" data-drag data-id="${i.id}"
      aria-pressed="${Boolean(s)}">${mark}${esc(i.name)}${del}</button>`;
  }

  // المنتجات: شريط كاتيجوريز + منتجات الكاتيجوري المفتوحة (أو نتايج البحث من كل الكاتيجوريز)
  function renderPool() {
    const q = state.query.trim();
    document.body.classList.toggle('has-query', Boolean(q));
    $('#clearQ').hidden = !q;

    document.querySelectorAll('.dest-btn').forEach((b) => {
      const on = b.dataset.dest === state.dest;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on);
    });

    $('#tabs').innerHTML = CATS.map((c) => {
      const inCat = state.items.filter((i) => i.category === c.key);
      const picked = inCat.filter((i) => state.sel.has(i.id)).length;
      const active = !q && c.key === state.cat;
      return `<button type="button" class="tab tinted${active ? ' active' : ''}" style="${tint(c.key)}"
          data-tab="${c.key}" data-zone="cat:${c.key}" aria-pressed="${active}" title="${c.name}">
          <span class="tab-ic">${ic(c.key)}</span><span class="tab-name">${c.short}</span>${
          picked ? `<span class="badge" title="${picked} متختار">${picked}</span>` : ''}</button>`;
    }).join('');

    let head, list;
    if (q) {
      list = search(q);
      head = `<div class="prod-head">${ic('search')} ${list.length ? `${list.length} نتيجة` : 'مفيش نتايج'}</div>`;
    } else {
      const c = catOf(state.cat);
      list = state.items.filter((i) => i.category === c.key);
      const picked = list.filter((i) => state.sel.has(i.id)).length;
      head = `<div class="prod-head tinted" style="${tint(c.key)}">${ic(c.key)} ${c.name}
        <span class="prod-sub">${list.length} منتج${picked ? ` · ${picked} متختار` : ''}</span></div>`;
    }

    let html = list.map(chipHtml).join('');
    if (q && !state.items.some((i) => norm(i.name) === norm(q))) {
      html += `<button type="button" class="chip add-chip" data-act="add">${ic('plus')} أضف «${esc(q)}» كمنتج جديد</button>`;
    }
    if (!html) html = '<p class="prod-empty">الكاتيجوري دي فاضية — اكتب اسم منتج فوق وضيفه</p>';
    $('#products').innerHTML = head + `<div class="prod-chips">${html}</div>`;
  }

  function openTab(key) {
    state.cat = key;
    savePrefs();
    setQuery('');
    $('#products').scrollTop = 0;
  }

  function setQuery(v) {
    state.query = v;
    $('#q').value = v;
    renderPool();
  }

  function setDest(zone) {
    state.dest = zone;
    savePrefs();
    renderPool();
  }

  // الشاشات على الموبايل: الشارع / أونلاين / المنتجات
  function go(view) {
    state.view = view;
    document.body.dataset.view = view;
    document.querySelectorAll('.nav-btn').forEach((b) => b.setAttribute('aria-current', b.dataset.go === view ? 'page' : 'false'));
    savePrefs();
  }

  // نبضة صغيرة على زرار التنقل لما حاجة تتضاف
  function bump(zone) {
    const b = document.querySelector(`.nav-btn.${zone}`);
    if (!b) return;
    b.classList.remove('bump');
    void b.offsetWidth;
    b.classList.add('bump');
  }

  // ================== السحب والإفلات (ماوس + تاتش) ==================
  let press = null;   // ضغطة لسه مبقتش سحب
  let drag = null;    // سحب شغال
  let justDragged = false;

  document.addEventListener('pointerdown', (e) => {
    // وانت بتبحث على الموبايل: الدوس على النتايج ميقفلش الكيبورد
    if (document.activeElement === $('#q') && e.target.closest('.chip, .search-x, .dest-btn')) e.preventDefault();
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
      }, 320);
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

  // خط بيوضح المنتج هيتحط فين جوه القايمة
  const dropLine = document.createElement('li');
  dropLine.className = 'drop-line';
  dropLine.setAttribute('aria-hidden', 'true');

  function placeLine(zone, y) {
    const list = zone?.matches('.zone') ? zone.querySelector('.list') : null;
    if (!list) { dropLine.remove(); drag.index = undefined; return; }
    // سكرول لوحده لو قربت من أول أو آخر القايمة
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

    const goBtn = e.target.closest('[data-go]');
    if (goBtn) {
      if (goBtn.dataset.dest) setDest(goBtn.dataset.dest);
      go(goBtn.dataset.go);
      return;
    }

    const destBtn = e.target.closest('.dest-btn');
    if (destBtn) { setDest(destBtn.dataset.dest); return; }

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
    if (chip) togglePick(chip.dataset.id);
  });

  // ================== البحث ==================
  const qInput = $('#q');
  qInput.addEventListener('input', () => {
    if (document.activeElement === qInput) document.body.classList.add('searching');
    state.query = qInput.value;
    renderPool();
    $('#products').scrollTop = 0;
  });
  qInput.addEventListener('focus', () => document.body.classList.add('searching'));
  qInput.addEventListener('blur', () => setTimeout(() => {
    if (document.activeElement !== qInput) document.body.classList.remove('searching');
  }, 120));
  $('#clearQ').addEventListener('click', () => { setQuery(''); qInput.focus(); });

  $('#addForm').addEventListener('submit', (e) => {
    e.preventDefault();
    // زرار "إضافة" = منتج جديد. زرار Enter في الكيبورد = اقفل الكيبورد وشوف النتايج
    if (e.submitter?.id === 'addBtn' || !search(state.query).length) startAdd(state.query);
    else qInput.blur();
  });

  // الكيبورد على الموبايل: الصفحة تبقى على قد الجزء اللي فاضل فوقه، فالنتايج تفضل باينة
  const vv = window.visualViewport;
  if (vv) {
    const fit = () => {
      document.documentElement.style.setProperty('--app-h', `${vv.height}px`);
      if (document.body.classList.contains('searching')) window.scrollTo(0, 0);
    };
    vv.addEventListener('resize', fit);
    fit();
  }

  $('#clearAll').addEventListener('click', clearAll);
  $('#editToggle').addEventListener('click', (e) => {
    state.editing = !state.editing;
    e.currentTarget.setAttribute('aria-pressed', state.editing);
    e.currentTarget.innerHTML = ic(state.editing ? 'check' : 'pencil');
    renderPool();
  });

  // ================== اسحب لتحت = تحديث ==================
  // الصفحة مقفولة على قد الشاشة، فالـ pull-to-refresh بتاع المتصفح مش شغال — فعملناه بنفسنا
  const ptr = $('#ptr');
  let pull = null;
  const scrollerAt = (el) => el.closest('.list, .products');
  document.addEventListener('touchstart', (e) => {
    if (drag || press?.grip || e.touches.length !== 1 || document.body.classList.contains('searching')) return;
    if (e.target.closest('input, dialog, .grip')) return;
    const sc = scrollerAt(e.target);
    if (sc && sc.scrollTop > 0) return;
    pull = { y: e.touches[0].clientY, x: e.touches[0].clientX, d: 0, sc };
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (!pull || drag) return;
    const dy = e.touches[0].clientY - pull.y;
    const dx = Math.abs(e.touches[0].clientX - pull.x);
    if (pull.sc && pull.sc.scrollTop > 0) { pull = null; ptr.style.transform = ''; return; }
    if (dy < 0 || dx > dy) { pull.d = 0; ptr.style.transform = ''; return; }
    pull.d = Math.min(dy * 0.5, 110);
    ptr.style.transform = `translate(-50%, ${pull.d}px) rotate(${pull.d * 2.4}deg)`;
    ptr.classList.toggle('ready', pull.d > 70);
  }, { passive: true });
  document.addEventListener('touchend', () => {
    if (!pull) return;
    const go = pull.d > 70;
    pull = null;
    if (go) {
      ptr.classList.add('loading');
      flushSels();
      queue.then(() => location.reload());   // نستنى أي حفظ شغال يخلص الأول
    } else {
      ptr.style.transform = '';
      ptr.classList.remove('ready');
    }
  });

  // ================== الإشعارات ==================
  const notifBtn = $('#notifBtn');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const pushEnabledHere = REMOTE && Boolean(cfg.VAPID_PUBLIC_KEY);

  const b64ToBytes = (b64) => {
    const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  };

  async function currentSub() {
    if (!pushSupported) return null;
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  }

  async function refreshBell() {
    if (!pushEnabledHere || (!pushSupported && !isIOS)) { notifBtn.hidden = true; return; }
    notifBtn.hidden = false;
    const on = pushSupported && Notification.permission === 'granted' && Boolean(await currentSub());
    notifBtn.classList.toggle('on', on);
    notifBtn.innerHTML = ic(on ? 'bellOn' : 'bell');
    notifBtn.title = on ? 'الإشعارات شغالة — دوس عشان تقفلها' : 'شغّل الإشعارات';
    return on;
  }

  async function savePushSub(sub) {
    const j = sub.toJSON();
    await api.savePush({ endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth });
    lsSet('talabat-elbeit-push', j.endpoint);
  }

  notifBtn.addEventListener('click', async () => {
    if (!pushSupported) {
      toast(isIOS && !standalone ? 'على الآيفون: ثبّت التطبيق على الشاشة الرئيسية الأول، وافتحه من هناك' : 'المتصفح ده مش بيدعم الإشعارات');
      return;
    }
    try {
      const sub = await currentSub();
      if (sub && Notification.permission === 'granted') {
        await api.removePush(sub.endpoint).catch(() => {});
        await sub.unsubscribe();
        lsSet('talabat-elbeit-push', null);
        toast('الإشعارات اتقفلت');
      } else {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') { toast('الإشعارات مرفوضة — تقدر تفتحها من إعدادات المتصفح'); return; }
        const reg = await navigator.serviceWorker.ready;
        const s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(cfg.VAPID_PUBLIC_KEY) });
        await savePushSub(s);
        toast('تمام! هيجيلك إشعار لما حد يضيف حاجة');
      }
    } catch (err) {
      console.error(err);
      toast('مقدرتش أشغّل الإشعارات');
    }
    refreshBell();
  });

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
  addEventListener('offline', () => setConn('off'));               // النت قطع

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  // ================== تشغيل ==================
  // الأيقونات الثابتة في الـ HTML
  document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = ic(el.dataset.icon); });
  // أزرار الكاتيجوريز في نافذة الإضافة
  $('#catGrid').innerHTML = CATS.map((c) =>
    `<button type="button" class="cat-pick tinted" style="${tint(c.key)}" value="${c.key}">${ic(c.key)}${c.name}</button>`).join('');
  go(state.view);

  (async () => {
    setConn(REMOTE ? 'connecting' : 'local');
    try {
      api = REMOTE ? await remoteApi() : localApi();
    } catch (err) {
      console.error(err);
      setSync('error');
      setConn('off');
      toast('مش قادر أحمّل Supabase — اتأكد من النت');
      return;
    }
    await reload();
    ready = true;
    if (document.visibilityState === 'visible') api.connect(onRemoteChange);

    // "رجّع الأصل" مخفي: بيظهر بس لو فتحت الموقع على /reset أو ?reset أو #reset
    if (/\/reset\/?$/.test(location.pathname) || /[?&]reset\b/.test(location.search) || location.hash === '#reset') {
      history.replaceState(null, '', location.pathname.replace(/reset\/?$/, '') || '/');
      resetAll();
    }

    // لو الإشعارات شغالة بس الاشتراك اتغير (أو اتسجّل من جهاز تاني)، نحدّثه مرة واحدة
    if (await refreshBell()) {
      const sub = await currentSub();
      if (sub && lsGet('talabat-elbeit-push') !== sub.endpoint) savePushSub(sub).catch(console.error);
    }
  })();

  // PWA: يخلّي الموقع يتسطّب على الموبايل
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW:', err));
  }
})();
