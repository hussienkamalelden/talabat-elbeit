// أيقونات SVG (خطوط، 24×24) — بتاخد لونها من النص (currentColor)
window.ICONS = {
  // ---------- الكاتيجوريز ----------
  // خضار وفاكهة: جزرة
  veg: '<path d="M2.5 21.5s9.6-3.4 12.4-6.2a4.4 4.4 0 0 0-6.2-6.2C5.9 11.9 2.5 21.5 2.5 21.5z"/><path d="M8.6 14.1 6.8 12.3M15 15.1l-2.2-2.2"/><path d="M21.5 9s-1.3-2-3.4-2c-1.6 0-3.4 2-3.4 2s1.3 2 3.4 2 3.4-2 3.4-2z"/><path d="M15 2.5s-2 1.3-2 3.4S15 9 15 9s2-1.8 2-3.4c0-2.1-2-3.1-2-3.1z"/>',
  // لحوم وفراخ وسمك: ورك فراخ
  meat: '<path d="M15.2 3a5.8 5.8 0 0 1 5.8 5.8c0 3.6-3.1 6.2-6.6 6.2-.9 0-1.7-.2-2.4-.5l-3.1 3.1"/><path d="M15.2 3A5.8 5.8 0 0 0 9.4 8.8c0 .9.2 1.7.5 2.4l-3.1 3.1"/><path d="M6.8 14.3a2 2 0 1 0-2.6 2.6 2 2 0 1 0 2.9 2.9 2 2 0 1 0 1.8-1.8"/>',
  // ألبان وبيض: علبة لبن
  dairy: '<path d="M8 2.5h8V5l2 3.2V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V8.2L8 5V2.5z"/><path d="M6 8.2h12M8 5h8"/><path d="M12 12.5c-1.3 1.6-2 2.7-2 3.5a2 2 0 0 0 4 0c0-.8-.7-1.9-2-3.5z"/>',
  // بقالة وتموين: شوال رز
  pantry: '<path d="M8 2.5h8l-1.6 3.6c3.1 1.5 5.6 5 5.6 9.1a5.8 5.8 0 0 1-5.8 5.8H9.8A5.8 5.8 0 0 1 4 15.2c0-4.1 2.5-7.6 5.6-9.1L8 2.5z"/><path d="M9.6 6.1h4.8"/><path d="M9 14.5c1-1 2-1 3 0s2 1 3 0"/>',
  // مشروبات: كوباية شاي/قهوة
  drinks: '<path d="M17 9h1.5a3 3 0 0 1 0 6H17"/><path d="M3.5 9H17v6a5.5 5.5 0 0 1-5.5 5.5h-2.5A5.5 5.5 0 0 1 3.5 15V9z"/><path d="M7 2.5c0 1.5 1 1.5 1 3M10.5 2.5c0 1.5 1 1.5 1 3M14 2.5c0 1.5 1 1.5 1 3"/>',
  // منظفات: إزازة سبراي
  cleaning: '<path d="M8.5 10h5.5l1.2 3v7a1.5 1.5 0 0 1-1.5 1.5H8.8A1.5 1.5 0 0 1 7.3 20v-7l1.2-3z"/><path d="M9.5 10V6.5h4.2l2.8 2h1.5"/><path d="M13.7 6.5V4H8.5"/><path d="M20.5 5.5h.01M21 8.5h.01M20.5 11.5h.01"/>',
  // أطفال: ببرونة
  kids: '<path d="M10.5 2.5h3l.6 3h-4.2l.6-3z"/><path d="M9 5.5h6v2H9z"/><path d="M9.6 7.5h4.8l.6 2.5v9.5a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V10l.6-2.5z"/><path d="M9 13h2.5M9 16h2.5"/>',
  // أخرى: كرتونة
  other: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/><path d="m7.5 5.2 9 4.6"/>',

  // ---------- الواجهة ----------
  basket: '<path d="M4.5 10h15l-1.6 9.3a2 2 0 0 1-2 1.7H8.1a2 2 0 0 1-2-1.7L4.5 10z"/><path d="M2.5 10h19"/><path d="m8 10 3-6.5M16 10l-3-6.5"/><path d="M9.5 14v3.5M14.5 14v3.5"/>',
  store: '<path d="M3 9.5 4.6 4h14.8L21 9.5"/><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 12v9h14v-9"/><path d="M10 21v-5h4v5"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3h3l2.6 12.2a1 1 0 0 0 1 .8h9.4a1 1 0 0 0 1-.8L21 7H6.3"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  bellOn: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" fill="currentColor"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
  arrowDown: '<path d="M12 4v15M5.5 12.5 12 19l6.5-6.5"/>',
  grip: '<circle cx="9" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="6" r="1.6" fill="currentColor" stroke="none"/><circle cx="9" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="1.6" fill="currentColor" stroke="none"/><circle cx="15" cy="18" r="1.6" fill="currentColor" stroke="none"/>',
  trash: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13a1.2 1.2 0 0 0 1.2 1.1h7.6A1.2 1.2 0 0 0 17 20l1-13M10 11v6M14 11v6"/>',
  pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
};

window.ic = (name, cls = '') =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${window.ICONS[name] || ''}</svg>`;
