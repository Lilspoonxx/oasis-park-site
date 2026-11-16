/* ชั้นข้อมูลราคาน้ำมัน (แหล่งเดียวของทั้งหน้า) — UI ห้าม fetch เอง ให้เรียกผ่าน window.FuelPrices

   แหล่งข้อมูล เรียงจากใหม่ไปเก่า:
     1) data/prices.json   ดึงสดผ่านเครือข่าย (ได้เมื่อโฮสต์บนเซิร์ฟเวอร์)
     2) window.FUEL_PRICES_BUNDLE (data/prices.js)  สำเนาที่สคริปต์สร้างให้ ใช้ได้แม้เปิดไฟล์ตรง
     3) แคชในเบราว์เซอร์ (localStorage) จากครั้งที่โหลดสำเร็จล่าสุด
     4) FALLBACK ด้านล่าง  ชุดที่ตรวจสอบแล้ว (ประกาศมีผล 11 พ.ย. 2569) หน้าจะไม่มีวันว่าง

   ผลลัพธ์ที่ UI ได้รับ (normalized):
     { updated, effective:{date,time}, source:'network'|'bundle'|'cache'|'fallback',
       fuels: FuelPrice[] }
     FuelPrice = { id, name, category:'gasohol'|'diesel', price, previousPrice,
                   effectiveDate, previousEffectiveDate, history:[{date,price}] }                   */
(function () {
  var DATA_URL = 'data/prices.json';
  var CACHE_KEY = 'oasis-fuel-prices-v2';

  /* ---------- ชุดสำรองที่ตรวจสอบแล้ว (ใช้เมื่อไม่มีข้อมูลอื่นเลย) ---------- */
  var EFF = '2026-11-11', PREV = '2026-11-06';
  function fb(id, name, category, price, previousPrice) {
    var h = previousPrice !== price ? [{ date: PREV, price: previousPrice }, { date: EFF, price: price }] : [{ date: EFF, price: price }];
    return { id: id, name: name, category: category, price: price, previousPrice: previousPrice, effectiveDate: EFF, previousEffectiveDate: PREV, history: h };
  }
  var FALLBACK = {
    updated: null,
    effective: { date: EFF, time: '05:00' },
    fuels: [
      fb('gasohol95', 'Gasohol 95 S EVO', 'gasohol', 39.34, 39.84),
      fb('gasohol91', 'Gasohol 91 S EVO', 'gasohol', 38.97, 39.47),
      fb('e20', 'Gasohol E20 S EVO', 'gasohol', 31.30, 31.80),
      fb('e85', 'Gasohol E85 S EVO', 'gasohol', 30.63, 30.63),
      fb('premium98', 'Hi Premium 98 Plus', 'gasohol', 48.55, 48.55),
      fb('b20', 'Diesel B20', 'diesel', 33.50, 33.50),
      fb('dieselS', 'Hi Diesel S', 'diesel', 40.79, 41.79),
      fb('premiumDiesel', 'Hi Premium Diesel Plus', 'diesel', 49.05, 49.05)
    ]
  };

  /* ---------- ทำให้ข้อมูลจากทุกแหล่งมีรูปแบบเดียวกัน ---------- */
  function normalize(raw, source) {
    if (!raw || !Array.isArray(raw.fuels) || !raw.fuels.length) return null;
    var eff = raw.effective || {};
    var fuels = raw.fuels.map(function (f) {
      var price = Number(f.price);
      if (!isFinite(price)) return null;
      var prevP = f.previousPrice !== undefined && f.previousPrice !== null ? Number(f.previousPrice) : price;
      return {
        id: String(f.id), name: f.name, category: f.category === 'diesel' ? 'diesel' : 'gasohol',
        price: price, previousPrice: isFinite(prevP) ? prevP : price,
        effectiveDate: f.effectiveDate || eff.date || null,
        previousEffectiveDate: f.previousEffectiveDate || null,
        history: Array.isArray(f.history) ? f.history.filter(function (h) { return h && isFinite(h.price); }) : []
      };
    }).filter(Boolean);
    if (!fuels.length) return null;
    return { updated: raw.updated || null, local: !!raw.local, remark: raw.remark || null, effective: { date: eff.date || null, time: eff.time || null }, source: source, fuels: fuels };
  }

  function readCache() {
    try { return normalize(JSON.parse(localStorage.getItem(CACHE_KEY)), 'cache'); } catch (e) { return null; }
  }
  function writeCache(raw) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(raw)); } catch (e) { /* ไม่มีแคชก็ไม่เป็นไร */ }
  }
  function newer(a, b) {            // เลือกชุดที่ใหม่กว่า (เทียบ updated แล้วค่อยเทียบวันที่มีผล)
    if (!a) return b; if (!b) return a;
    var ka = (a.updated || '0') + '|' + (a.effective.date || ''), kb = (b.updated || '0') + '|' + (b.effective.date || '');
    return ka >= kb ? a : b;
  }

  var latest = normalize(FALLBACK, 'fallback');
  latest = newer(readCache(), latest) || latest;
  latest = newer(normalize(window.FUEL_PRICES_BUNDLE, 'bundle'), latest) || latest;
  var lastRaw = null;

  /* ---------- ดึงข้อมูลสด (ไม่ล้มทั้งหน้า: ล้มเหลวก็ใช้ชุดที่มีอยู่) ---------- */
  function sig(d) { return d.updated + '|' + d.fuels.map(function (f) { return f.id + ':' + f.price + ':' + f.previousPrice; }).join(','); }

  function refresh() {
    if (location.protocol === 'file:' || typeof fetch !== 'function') {     // เปิดไฟล์ตรง: fetch ไม่ได้ ใช้ชุด bundle/แคช/สำรองที่มี
      return Promise.resolve({ data: latest, changed: false, failed: false, offline: true });
    }
    return fetch(DATA_URL + '?t=' + Date.now(), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (raw) {
        var d = normalize(raw, 'network');
        if (!d) throw new Error('bad data');
        var changed = sig(d) !== sig(latest);
        latest = d; lastRaw = raw; writeCache(raw);
        return { data: d, changed: changed, failed: false };
      })
      .catch(function () {
        return { data: latest, changed: false, failed: true };             // ใช้ข้อมูลล่าสุดที่มี ไม่ทำให้หน้าว่าง
      });
  }

  window.FuelPrices = {
    current: function () { return latest; },
    refresh: refresh,
    fallback: function () { return normalize(FALLBACK, 'fallback'); }
  };
})();
