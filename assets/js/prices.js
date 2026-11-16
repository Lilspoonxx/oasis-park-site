/* หน้าราคาน้ำมัน
   ไฟล์นี้คือ UI อย่างเดียว: ข้อมูลทั้งหมดมาจาก window.FuelPrices (assets/js/fuel-prices.js) เท่านั้น
   ห้ามใส่ราคาหรือ fetch เองในไฟล์นี้ — ส่วนต่าง/ขึ้น/ลง/สรุป คำนวณจากข้อมูลทั้งหมด */
document.addEventListener('DOMContentLoaded', function () {
  var board = document.querySelector('#price-board');
  if (!board || !window.FuelPrices) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var POLL_MS = 5 * 60 * 1000;
  var LIVE_HOURS = 24;

  /* ============ ข้อความ/สีประจำน้ำมัน (ไม่ใช่ข้อมูลราคา) ============ */
  var fuelNote = 'ราคาอ้างอิงจากประกาศบางจาก ราคาหน้าปั๊มอาจแตกต่างเล็กน้อย ตรวจคู่มือรถก่อนเลือกชนิดน้ำมัน';
  var water = 'เติมทุก 1,000 บาท รับน้ำดื่ม 1 ขวด';
  var info = {
    gasohol95: { tag: 'แก๊สโซฮอล์', b: ['Gasohol', '95 S EVO'], c: ['#FF9A2E', '#E26A00'], lead: 'แก๊สโซฮอล์ออกเทน 95 สำหรับรถเบนซินที่รองรับน้ำมันแก๊สโซฮอล์', points: ['เติมตั้งแต่ 1,200 บาท รับน้ำผลไม้ดอยคำ', water], note: fuelNote },
    gasohol91: { tag: 'แก๊สโซฮอล์', b: ['Gasohol', '91 S EVO'], c: ['#2FC24B', '#0E7A2C'], lead: 'แก๊สโซฮอล์ออกเทน 91 สำหรับรถเบนซินทั่วไปที่รองรับแก๊สโซฮอล์', points: ['เติมตั้งแต่ 1,200 บาท รับน้ำผลไม้ดอยคำ', water], note: fuelNote },
    e20: { tag: 'แก๊สโซฮอล์ E20', b: ['Gasohol', 'E20 S EVO'], c: ['#B7F000', '#5FA800'], lead: 'แก๊สโซฮอล์ E20 มีเอทานอลผสม 20% ใช้ได้เฉพาะรถที่รองรับ E20', points: ['เติม E20 รับน้ำดื่ม 2 เท่า', 'เติมตั้งแต่ 1,200 บาท รับน้ำผลไม้ดอยคำ'], note: 'ก่อนเติม E20 โปรดตรวจสอบว่ารถของท่านรองรับ · ' + fuelNote },
    e85: { tag: 'แก๊สโซฮอล์ E85', b: ['Gasohol', 'E85 S EVO'], c: ['#F04FC8', '#A3178B'], lead: 'แก๊สโซฮอล์ E85 มีเอทานอลผสมสูง ใช้ได้เฉพาะรถที่รองรับ E85', points: [water], note: 'ก่อนเติม E85 โปรดตรวจสอบว่ารถของท่านรองรับ · ' + fuelNote },
    premium98: { tag: 'พรีเมียม', b: ['Hi Premium', '98 Plus'], c: ['#E3C25A', '#8A6B14'], lead: 'เบนซินพรีเมียมออกเทน 98 สำหรับรถที่ต้องการน้ำมันออกเทนสูง', points: [water], note: fuelNote },
    b20: { tag: 'ดีเซล B20', b: ['Diesel', 'B20'], c: ['#3AA0FF', '#0B52C9'], lead: 'ดีเซลผสมไบโอดีเซล 20% สำหรับรถที่รองรับ B20 เช่น รถบรรทุกและรถใหญ่', points: ['เติม B20 รับน้ำดื่ม 2 เท่า', 'B20 เลือกของแถมได้ตามจำนวนสิทธิ์ที่ได้รับ'], note: 'ก่อนเติม B20 โปรดตรวจสอบว่ารถของท่านรองรับ · ' + fuelNote },
    dieselS: { tag: 'ดีเซล', b: ['Hi Diesel', 'S'], c: ['#3F6BFF', '#14298F'], lead: 'น้ำมันดีเซลสำหรับเครื่องยนต์ดีเซล เหมาะกับรถกระบะ รถบรรทุก และรถใหญ่', points: ['เติมตั้งแต่ 1,200 บาท รับ M-150 หรือคาราบาวแดง', water, 'รถใหญ่หรือเติมตั้งแต่ 100 ลิตร รับคูปองอาหารฟรี'], note: fuelNote },
    premiumDiesel: { tag: 'ดีเซลพรีเมียม', b: ['Hi Premium', 'Diesel Plus'], c: ['#E4E8E6', '#8B9692'], dark: true, lead: 'ดีเซลพรีเมียมสำหรับเครื่องยนต์ดีเซลที่ต้องการน้ำมันคุณภาพสูง', points: [water], note: fuelNote }
  };
  var groups = [
    { key: 'gasohol', title: 'กลุ่มเบนซิน / แก๊สโซฮอล์', icon: 'M5 20V6a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v14M4 20h11M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5V16a1.5 1.5 0 0 0 3 0V9l-3-3' },
    { key: 'diesel', title: 'กลุ่มดีเซล', icon: 'M2 7h12v9H2zM14 10h4l3 3v3h-7M6 19.5a1.5 1.5 0 1 0 0-.01M17 19.5a1.5 1.5 0 1 0 0-.01' }
  ];

  /* ============ ตัวช่วยจัดรูปแบบ ============ */
  var MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  function thDate(iso, short) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return '';
    return (+m[3]) + ' ' + MONTHS[+m[2] - 1] + (short ? '' : ' ' + (+m[1] + 543));
  }
  function thTime(iso) { var m = /T(\d{2}:\d{2})/.exec(iso || ''); return m ? m[1] : ''; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function money(n) { return Number(n).toFixed(2); }
  function bkkToday() { return new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10); }
  function r2(n) { return Math.round(n * 100) / 100; }

  /* ส่วนต่างคำนวณจาก ราคาปัจจุบัน - ราคาครั้งก่อน เสมอ */
  function trendOf(f) {
    var d = r2(f.price - (typeof f.previousPrice === 'number' ? f.previousPrice : f.price)), a = money(Math.abs(d));
    if (d < 0) return { cls: 'down', d: d, a: a, lbl: 'ลดลง ' + a, ico: '▼', short: '↓ ลดลง ' + a, long: '↓ ลดลง ' + a + ' บาท', plain: 'ราคาลดลง ' + a + ' บาท/ลิตร' };
    if (d > 0) return { cls: 'up', d: d, a: a, lbl: 'เพิ่มขึ้น ' + a, ico: '▲', short: '↑ เพิ่มขึ้น ' + a, long: '↑ เพิ่มขึ้น ' + a + ' บาท', plain: 'ราคาเพิ่มขึ้น ' + a + ' บาท/ลิตร' };
    return { cls: 'same', d: 0, a: a, lbl: 'คงเดิม', ico: '=', short: '— คงเดิม', long: '— คงเดิม', plain: 'ราคาคงเดิม' };
  }

  /* ============ FX: ตัวเลขหมุนแบบ digital counter (ใช้ transform ล้วน) ============ */
  function rollMarkup(str) {
    var h = '<span class="roll" aria-label="' + esc(str) + '">';
    str.split('').forEach(function (ch) {
      if (/\d/.test(ch)) {
        h += '<span class="rd" aria-hidden="true"><span class="rc" data-d="' + ch + '">';
        for (var i = 0; i < 10; i++) h += '<i>' + i + '</i>';
        h += '</span></span>';
      } else h += '<span class="rp" aria-hidden="true">' + esc(ch) + '</span>';
    });
    return h + '</span>';
  }
  function setCols(root, fromStr, instant) {
    var cols = root.querySelectorAll('.rc');
    var fd = (fromStr || '').replace(/\D/g, '');
    cols.forEach(function (c, i) {
      var to = +c.getAttribute('data-d');
      var from = fd[i] !== undefined ? +fd[i] : to;
      c.style.transition = 'none';
      c.style.transform = 'translateY(' + (-(instant ? to : from)) + 'em)';
    });
  }
  function playRoll(root, fromStr, onDone) {
    var cols = root.querySelectorAll('.rc');
    if (reduce) { setCols(root, null, true); if (onDone) onDone(); return; }
    var fd = (fromStr || '').replace(/\D/g, '');
    cols.forEach(function (c, i) {                         // ราคาเท่าเดิม: ขยับเบาๆ 1 ช่อง ไม่หมุนยาว
      var to = +c.getAttribute('data-d');
      var from = fd[i] !== undefined ? +fd[i] : (to === 0 ? 1 : to - 1);
      c.style.transition = 'none';
      c.style.transform = 'translateY(' + (-from) + 'em)';
    });
    void root.offsetWidth;
    cols.forEach(function (c, i) {
      var to = +c.getAttribute('data-d');
      c.style.transition = 'transform .7s cubic-bezier(.22,.8,.25,1) ' + (i * 70) + 'ms';
      c.style.transform = 'translateY(' + (-to) + 'em)';
    });
    setTimeout(function () { if (onDone) onDone(); }, 700 + cols.length * 70 + 40);
  }
  function reveal(row, fromStr) {
    var roll = row.querySelector('.roll');
    if (!roll) return;
    var changed = row.classList.contains('t-down') || row.classList.contains('t-up');
    if (changed) row.classList.add('fx');
    playRoll(roll, fromStr, function () {
      var cell = row.querySelector('.pcell');
      if (cell) { cell.classList.remove('glow'); void cell.offsetWidth; cell.classList.add('glow'); }
    });
  }
  function observeReveal(row, fromStr) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var done = false;
    setCols(row.querySelector('.roll'), fromStr === undefined ? null : fromStr, true);   // แสดงค่าจริงไว้ก่อน (กันค้างเป็นเลขอื่นถ้าไม่เลื่อนมาเจอ)
    new IntersectionObserver(function (es, ob) {
      if (!es[0].isIntersecting || done) return;
      done = true; ob.disconnect();
      reveal(row, fromStr);
    }, { threshold: .5 }).observe(row);
  }

  /* ============ คลิกที่ตัวเลขราคา: วงแหวนนีออนขยายแล้วค่อยเปิดรายละเอียด ============ */
  document.addEventListener('click', function (e) {
    var price = e.target.closest && e.target.closest('.pcell');
    var row = price && price.closest('.prow');
    if (!row || reduce) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var ring = document.createElement('span');
    ring.className = 'pring';
    price.appendChild(ring);
    setTimeout(function () { ring.remove(); }, 650);
    setTimeout(function () { window.OP.open(row.getAttribute('data-modal'), row); }, 240);
  }, true);

  /* ============ VIEW: modal รายละเอียด ============ */
  function spark(hist) {
    if (!hist || hist.length < 2) return '';
    var W = 280, H = 64, P = 8;
    var ps = hist.map(function (h) { return h.price; });
    var lo = Math.min.apply(null, ps), hi = Math.max.apply(null, ps), span = hi - lo || 1;
    var pts = hist.map(function (h, i) {
      return [P + i * (W - 2 * P) / (hist.length - 1), H - P - ((h.price - lo) / span) * (H - 2 * P)];
    });
    var line = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var dots = pts.map(function (p, i) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === pts.length - 1 ? 4.5 : 3) + '"' + (i === pts.length - 1 ? ' class="last"' : '') + '/>'; }).join('');
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="กราฟราคาย้อนหลัง"><polyline points="' + line + '"/>' + dots + '</svg>';
  }
  function modalHtml(f, t, globalEff) {
    var hist = (f.history || []).slice(-6);
    var tl = hist.slice().reverse().map(function (h, i) {
      return '<li' + (i === 0 ? ' class="now"' : '') + '><span>' + esc(h.date ? thDate(h.date) : '—') + '</span><b>' + money(h.price) + '</b></li>';
    }).join('');
    var effDate = f.effectiveDate || globalEff.date;
    var effTxt = effDate ? thDate(effDate) + (globalEff.time && effDate === globalEff.date ? ' • ' + globalEff.time + ' น.' : '') : '';
    var prevTxt = money(f.previousPrice) + ' บาท/ลิตร' + (f.previousEffectiveDate ? ' (มีผล ' + thDate(f.previousEffectiveDate) + ')' : '');
    return '<div class="fxm">' +
      '<div class="fxm-price"><span class="fxm-num" data-roll="' + money(f.price) + '" data-from="' + (t.cls === 'same' ? '' : money(f.previousPrice)) + '">' + money(f.price) + '</span><small>บาท/ลิตร</small></div>' +
      '<div class="fxm-trend"><span class="chg ' + t.cls + '">' + esc(t.long) + '</span></div>' +
      '<dl class="fxm-dl">' +
      '<div><dt>ราคาก่อนหน้า</dt><dd>' + esc(prevTxt) + '</dd></div>' +
      (effTxt ? '<div><dt>ราคามีผล</dt><dd>' + esc(effTxt) + '</dd></div>' : '') +
      '</dl>' +
      (hist.length ? '<div class="fxm-hist"><h4>ประวัติราคา</h4>' + spark(hist) + '<ul class="fxm-tl">' + tl + '</ul>' + (hist.length < 2 ? '<p class="fxm-hn">ยังไม่มีการปรับราคาในประวัติ ระบบจะเพิ่มให้อัตโนมัติเมื่อราคาเปลี่ยน</p>' : '') + '</div>' : '') +
      '</div>';
  }

  /* ============ การ์ดรายละเอียดน้ำมัน (หน้าตาตาม mockup) ============ */
  var FUEL_IMG = 'assets/img/web/fuel/';
  var calSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>';
  var listSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>';
  var barSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="13" width="3.6" height="8" rx="1"/><rect x="9.2" y="9" width="3.6" height="12" rx="1"/><rect x="15.4" y="4" width="3.6" height="17" rx="1"/></svg>';
  function at(x, y, w, h) { return ' style="--x:' + x + ';--y:' + y + ';--w:' + w + ';--h:' + h + '"'; }   // ตำแหน่งบนเวที 1586×992 (ใช้เมื่อจอกว้าง)

  /* ส่วนรายละเอียดของน้ำมันที่เลือก (เรนเดอร์ใหม่ทุกครั้งที่เลือกชนิดอื่น) */
  function detailInner(f, t, eff) {
    var hist = (f.history || []).slice(-4);
    var chips = hist.map(function (h, i) {
      return '<li class="fxd-chip' + (i === hist.length - 1 ? ' now' : '') + '">' + esc(h.date ? thDate(h.date) : '—') + ' <b>— ' + money(h.price) + '</b></li>';
    }).join('');
    var effDate = f.effectiveDate || eff.date;
    var dateTxt = effDate ? 'ราคามีผล ' + thDate(effDate) + (eff.time && effDate === eff.date ? ' • ' + eff.time + ' น.' : '') : '';
    var prevDate = f.previousEffectiveDate ? '<small>(มีผล ' + esc(thDate(f.previousEffectiveDate)) + ')</small>' : '';
    return '<img class="fxd-nozzle at" src="' + FUEL_IMG + 'fuel-nozzle.webp" alt="" aria-hidden="true" width="900" height="822"' + at(604, 179, 229, 205) + '>' +
      '<div class="fxd-title at"' + at(722, 205, 558, 84) + '><span>' + esc(f.name) + '</span></div>' +
      (dateTxt ? '<div class="fxd-date at"' + at(851, 300, 364, 43) + '>' + calSvg + esc(dateTxt) + '</div>' : '') +
      '<div class="fxd-odo at"' + at(657, 346, 730, 180) + '><span class="fxd-num" data-roll="' + money(f.price) + '" data-from="' + (t.cls === 'same' ? '' : money(f.previousPrice)) + '">' + money(f.price) + '</span><small>บาท/ลิตร</small></div>' +
      '<div class="fxd-chg at"' + at(666, 532, 734, 61) + '><span class="chg ' + t.cls + '"><i class="ti" aria-hidden="true">' + t.ico + '</i>' + esc(t.lbl) + (t.cls === 'same' ? '' : ' บาท') + '</span><i class="fxd-vr" aria-hidden="true"></i>' +
      '<span class="fxd-prev">ก่อนหน้า <b>' + money(f.previousPrice) + '</b> บาท/ลิตร' + prevDate + '</span></div>' +
      '<p class="fxd-src at"' + at(752, 605, 524, 34) + '>' + refreshIcon + (current && current.local ? 'ราคาหน้าปั๊ม Oasis Park เขาย้อย' : 'ข้อมูลอ้างอิงจากประกาศราคาปลีกบางจาก') + '</p>' +
      (hist.length ? '<div class="fxd-hist at"' + at(638, 646, 777, 106) + '><div class="fxd-hl">' + barSvg + 'ประวัติราคา <small>(เฉพาะวันที่ปรับ)</small></div><ul class="fxd-chips" aria-label="ประวัติราคา บาทต่อลิตร">' + chips + '</ul></div>' : '') +
      '<details class="fxd-guide at"' + at(825, 755, 395, 43) + '><summary>คำแนะนำการอ่านราคา</summary><div class="fxd-guide-copy">ราคาปัจจุบันแสดงเป็นบาทต่อลิตร ลูกศรบอกการเปลี่ยนแปลงจากราคาก่อนหน้า เลือกชนิดน้ำมันอื่นจากรายการหรือปุ่มดูราคาทั้งหมด ราคาหน้าปั๊มอาจต่างจากราคาอ้างอิง</div></details>' +
      '<div class="fxd-acts"><button type="button" class="fxd-all at"' + at(727, 804, 361, 67) + '>' + listSvg + 'ดูราคาทั้งหมด</button><button type="button" class="fxd-close at"' + at(1115, 804, 224, 66) + '><span aria-hidden="true">✕</span> ปิด</button></div>';
  }

  /* รายการราคาด้านซ้ายของเวที (จอกว้างเท่านั้น) — ใช้ข้อมูลชุดเดียวกับรายละเอียด */
  function stageList(data, selId) {
    return groups.map(function (g) {
      var list = data.fuels.filter(function (f) { return f.category === g.key; });
      if (!list.length) return '';
      return '<div class="fxs-grp"><h4>' + esc(g.title) + '</h4>' + list.map(function (f) {
        var base = info[f.id] || { b: ['', f.name], c: ['#B7F000', '#5FA800'] };
        return '<button type="button" class="fxs-row' + (f.id === selId ? ' sel' : '') + '" data-fuel="' + esc(f.id) + '" aria-label="' + esc(f.name) + ' ' + money(f.price) + ' บาทต่อลิตร" style="--c1:' + base.c[0] + ';--c2:' + base.c[1] + '">' +
          '<span class="fbadge' + (base.dark ? ' dk' : '') + '" aria-hidden="true"><small>' + esc(base.b[0]) + '</small><b' + (base.b[1].length > 8 ? ' class="lg"' : '') + '>' + esc(base.b[1]) + '</b></span>' +
          '<span class="fxs-name">' + esc(f.name) + '</span>' +
          '<span class="fxs-price">' + money(f.price) + '<small>บาท/ลิตร</small></span>' +
          '<span class="pchev" aria-hidden="true">' + chevSvg + '</span></button>';
      }).join('') + '</div>';
    }).join('');
  }

  function fuelItem(f, data) {          // item สำหรับ OP.open (ใช้ทั้งหน้าหลักและ modal รายการ)
    var base = info[f.id] || { c: ['#B7F000', '#5FA800'] };
    var eff = data.effective || {};
    return {
      custom: true, fuel: true, title: f.name,
      html: '<div class="fxs">' +
        '<img class="fxs-bg" src="' + FUEL_IMG + 'fuel-bg.webp" alt="" aria-hidden="true" width="1586" height="992">' +
        '<div class="fxs-list at"' + at(39, 254, 565, 620) + '>' + stageList(data, f.id) + '</div>' +
        '<img class="fxs-glass at" src="' + FUEL_IMG + 'fuel-glass.webp" alt="" aria-hidden="true" width="1315" height="1196"' + at(578, 100, 890, 845) + '>' +
        '<div class="fxs-detail fxd" style="--c1:' + base.c[0] + ';--c2:' + base.c[1] + '">' + detailInner(f, trendOf(f), eff) + '</div></div>',
      onOpen: function (dlg) {
        var root = dlg.querySelector('.fxs'), det = root.querySelector('.fxs-detail');
        initDetailRoll(root);
        root.addEventListener('click', function (e) {
          if (e.target.closest('.fxd-close')) { window.OP.close(); return; }
          if (e.target.closest('.fxd-all')) { openBoard(null); return; }
          var row = e.target.closest('.fxs-row');
          if (!row) return;
          var ff = data.fuels.filter(function (x) { return x.id === row.getAttribute('data-fuel'); })[0];
          if (!ff) return;
          root.querySelectorAll('.fxs-row').forEach(function (r) { r.classList.toggle('sel', r === row); });
          var bb = info[ff.id] || { c: ['#B7F000', '#5FA800'] };
          det.style.setProperty('--c1', bb.c[0]); det.style.setProperty('--c2', bb.c[1]);
          det.innerHTML = detailInner(ff, trendOf(ff), eff);
          initDetailRoll(det);
        });
      }
    };
  }
  // จอกว้าง: เปิดเวทีรายละเอียด (มีรายการซ้ายอยู่แล้ว) / จอแคบ: เปิดรายการทั้งหมดก่อน
  function openFromCard(trigger) {
    var data = window.FuelPrices.current();
    if (window.matchMedia('(min-width: 1100px)').matches && data.fuels.length) window.OP.open(fuelItem(data.fuels[0], data), trigger);
    else openBoard(trigger);
  }

  /* ============ VIEW: วาดทั้งหน้า ============ */
  var current = null, shown = {};          // shown = ราคาที่แสดงอยู่ (ใช้เป็นจุดเริ่มหมุนเมื่อมีข้อมูลใหม่)
  var chevSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  function render(data, opts) {
    opts = opts || {};
    current = data;
    if (data.local) {   // ราคาปั๊มเขาย้อย (ราคาบางจากบวกส่วนต่างเพชรบุรี) — ข้อความมาจากข้อมูล
      var pl = document.getElementById('priceLead'), pn = document.getElementById('priceSrcNote');
      if (pl) pl.textContent = 'ราคาต่อลิตร ณ ปั๊ม Oasis Park เขาย้อย เพชรบุรี';
      if (pn) pn.innerHTML = 'ที่มา: <a href="https://www.bangchak.co.th/th/oilprice" target="_blank" rel="noopener">ประกาศราคาบางจาก (เว็บทางการ)</a> บวกค่าขนส่งต่างจังหวัด เป็นราคาหน้าปั๊มเขาย้อย หากราคาที่ตู้จ่ายต่างจากนี้ ยึดราคาที่ตู้จ่ายเป็นหลัก';
    }
    var items = window.OP.items;
    var eff = data.effective || {};
    var effTxt = eff.date ? thDate(eff.date) + (eff.time ? ' • ' + eff.time + ' น.' : '') : '';
    var prevShown = shown; shown = {};
    var buckets = { down: [], same: [], up: [] };

    board.innerHTML = '';
    groups.forEach(function (g) {
      var list = data.fuels.filter(function (f) { return f.category === g.key; });
      if (!list.length) return;
      var sec = document.createElement('section');
      sec.className = 'pb-panel';
      sec.innerHTML = '<h2 class="pb-title"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + g.icon + '"/></svg>' + esc(g.title) + '</h2>';
      var rows = document.createElement('div');
      rows.className = 'pb-rows';
      list.forEach(function (f) {
        var base = info[f.id] || { tag: 'น้ำมัน', b: ['', f.name], c: ['#B7F000', '#5FA800'], lead: '', points: [], note: fuelNote };
        var has = typeof f.price === 'number';
        var t = has ? trendOf(f) : null;
        if (t) buckets[t.cls].push({ name: f.name, d: t.d });
        shown[f.id] = has ? money(f.price) : null;

        items['fuel-' + f.id] = has ? fuelItem(f, data) : { tag: base.tag, title: f.name, big: 'สอบถามราคา', lead: base.lead, points: base.points, note: base.note };

        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'glass prow' + (t ? ' t-' + t.cls : '');
        b.setAttribute('data-modal', 'fuel-' + f.id);
        b.setAttribute('aria-haspopup', 'dialog');
        b.setAttribute('aria-label', f.name + ' ' + (has ? money(f.price) + ' บาทต่อลิตร ' + t.plain : 'สอบถามราคา'));
        b.style.setProperty('--c1', base.c[0]); b.style.setProperty('--c2', base.c[1]);
        b.innerHTML =
          '<span class="pc-glow" aria-hidden="true"></span>' +
          '<span class="fbadge' + (base.dark ? ' dk' : '') + '" aria-hidden="true"><small>' + esc(base.b[0]) + '</small><b' + (base.b[1].length > 8 ? ' class="lg"' : '') + '>' + esc(base.b[1]) + '</b></span>' +
          '<span class="fname">' + esc(f.name) + '</span>' +
          '<span class="pcell">' + (has ? '<span class="fuel-price">' + rollMarkup(money(f.price)) + '</span><span class="unit">บาท/ลิตร</span>' : '<span class="fuel-price">สอบถามราคา</span>') + '</span>' +
          (t ? '<span class="chg ' + t.cls + '"><i class="ti" aria-hidden="true">' + t.ico + '</i>' + esc(t.lbl) + '</span>' : '<span></span>') +
          '<span class="pchev" aria-hidden="true">' + chevSvg + '</span>';
        rows.appendChild(b);
        if (has) {
          var from = opts.animate && prevShown[f.id] && prevShown[f.id] !== money(f.price) ? prevShown[f.id]
            : (typeof f.previousPrice === 'number' && f.previousPrice !== f.price ? money(f.previousPrice) : null);
          if (opts.animate && prevShown[f.id] === money(f.price)) setCols(b.querySelector('.roll'), null, true);
          else observeReveal(b, from);
        }
      });
      sec.appendChild(rows);
      var more = document.createElement('button');
      more.type = 'button'; more.className = 'pb-more';
      more.innerHTML = 'กดดูรายละเอียด <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
      more.addEventListener('click', function () { openFromCard(more); });
      sec.appendChild(more);
      board.appendChild(sec);
    });

    renderStatus(data, effTxt, opts);
    renderSummary(data, buckets, eff);
  }

  function renderStatus(data, effTxt, opts) {
    var upd = document.querySelector('#price-updated');
    var live = document.querySelector('#pb-live');
    var effEl = document.querySelector('#price-effective');
    var msg = document.querySelector('#pb-msg');
    var wrap = document.querySelector('#pb-status');
    var st = statusOf(data, opts.failed), txt = st.txt, fresh = st.fresh;
    if (upd) {
      if (opts.animate && !reduce) { upd.style.opacity = 0; setTimeout(function () { upd.textContent = txt; upd.style.opacity = 1; }, 220); }
      else upd.textContent = txt;
    }
    if (live) {
      live.hidden = !fresh;
      if (opts.animate && fresh) { live.classList.remove('pulse'); void live.offsetWidth; live.classList.add('pulse'); }
    }
    if (wrap) wrap.classList.toggle('stale', !fresh);
    if (effEl) effEl.textContent = st.eff;
    if (msg) { msg.textContent = st.msg; msg.hidden = !st.msg; }
  }

  function summaryHtml(b, eff) {
    var when = eff.date === bkkToday() ? 'วันนี้' : 'ประกาศล่าสุด' + (eff.date ? ' (' + thDate(eff.date, true) + ')' : '');
    var parts = [];
    if (b.up.length) parts.push('ปรับขึ้น ' + b.up.length + ' รายการ');
    if (b.down.length) parts.push('ปรับลง ' + b.down.length + ' รายการ');
    var headline = parts.length ? when + ' ราคา' + parts.join(' และ') : when + ' ไม่มีการปรับราคาน้ำมัน';
    function chips(arr) { return arr.map(function (x) { return '<span class="sum-chip">' + esc(x.name) + (x.d ? ' <b>' + (x.d < 0 ? '−' : '+') + money(Math.abs(x.d)) + '</b>' : '') + '</span>'; }).join(''); }
    var rows = [
      ['down', '↓', 'ปรับลง', b.down], ['up', '↑', 'ปรับขึ้น', b.up], ['same', '—', 'คงเดิม', b.same]
    ].filter(function (r) { return r[3].length; });
    return '<p class="sum-head">' + esc(headline) + '</p>' +
      rows.map(function (r) { return '<div class="sum-row"><span class="chg ' + r[0] + '">' + r[1] + ' ' + r[2] + '</span><div class="sum-list">' + chips(r[3]) + '</div></div>'; }).join('');
  }
  function bucketsOf(data) {          // จัดกลุ่ม ลง/ขึ้น/คงเดิม จากข้อมูลจริงทุกครั้ง
    var b = { down: [], same: [], up: [] };
    data.fuels.forEach(function (f) { var t = trendOf(f); b[t.cls].push({ name: f.name, d: t.d }); });
    return b;
  }
  function renderSummary(data, b, eff) {
    var sum = document.querySelector('#price-summary');
    if (!sum) return;
    sum.innerHTML = '<div class="sm-left"><i class="sm-ico" aria-hidden="true"><svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="13" width="3.2" height="8" rx="1"/><rect x="8.4" y="9" width="3.2" height="12" rx="1"/><rect x="13.8" y="5" width="3.2" height="16" rx="1"/><rect x="19" y="2" width="2.4" height="19" rx="1"/></svg></i><h2>สรุปราคา<span>ล่าสุด</span></h2></div><div class="sm-body">' + summaryHtml(b, eff) + '</div>';
    sum.hidden = false;
  }

  var failed = false;

  /* ============ Modal "ราคาน้ำมันวันนี้" (กดภาพหัวหน้า) ============ */
  function initDetailRoll(scope) {
    var n = scope.querySelector('[data-roll]');
    if (!n) return;
    n.innerHTML = rollMarkup(n.getAttribute('data-roll'));
    var from = n.getAttribute('data-from');
    setCols(n, from || null, false);
    setTimeout(function () { playRoll(n, from || null, function () { n.classList.add('glow'); }); }, 260);
  }
  function statusOf(data, failedFlag) {
    var stamp = data.updated || (data.effective && data.effective.date);
    var ageH = data.updated ? (Date.now() - new Date(data.updated).getTime()) / 36e5 : Infinity;
    var fresh = !failedFlag && data.source !== 'fallback' && data.source !== 'cache' && ageH <= LIVE_HOURS;
    var e = data.effective || {};
    return {
      fresh: fresh,
      txt: 'อัปเดตล่าสุด ' + thDate(stamp) + (data.updated && thTime(data.updated) ? ' • ' + thTime(data.updated) + ' น.' : ''),
      eff: e.date ? 'ราคามีผล ' + thDate(e.date) + (e.time ? ' • ' + e.time + ' น.' : '') : '',
      msg: (failedFlag || data.source === 'fallback' || data.source === 'cache') ? 'กำลังแสดงข้อมูลล่าสุดที่มี (ราคามีผล ' + thDate(e.date) + ')' : (!fresh ? 'ข้อมูลอาจไม่ใช่ล่าสุด ตรวจราคาล่าสุดที่เว็บบางจากหรือสอบถามหน้าปั๊ม' : '')
    };
  }
  var refreshIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>';

  function boardHead(st) {
    return '<div class="mb-head">' +
      '<span class="pb-live"' + (st.fresh ? '' : ' hidden') + '><i class="pb-dot" aria-hidden="true"></i>LIVE</span>' +
      '<span class="mb-date">' + esc(st.txt) + '</span>' +
      '<button type="button" class="pb-refresh mb-refresh" aria-label="ตรวจราคาล่าสุดอีกครั้ง" title="ตรวจราคาล่าสุด">' + refreshIcon + '</button>' +
      '</div>' + (st.eff ? '<p class="mb-eff">' + esc(st.eff) + '</p>' : '') +
      (st.msg ? '<p class="pb-msg">' + esc(st.msg) + '</p>' : '');
  }
  function boardList(data, fromMap) {
    return groups.map(function (g) {
      var list = data.fuels.filter(function (f) { return f.category === g.key; });
      if (!list.length) return '';
      return '<div class="mb-group"><h4>' + esc(g.title) + '</h4>' + list.map(function (f) {
        var base = info[f.id] || { c: ['#B7F000', '#5FA800'] }, t = trendOf(f);
        var from = fromMap && fromMap[f.id] && fromMap[f.id] !== money(f.price) ? fromMap[f.id] : (t.cls === 'same' ? '' : money(f.previousPrice));
        return '<button type="button" class="mrow t-' + t.cls + '" data-fuel="' + esc(f.id) + '" data-from="' + from + '" style="--c1:' + base.c[0] + '">' +
          '<span class="mname"><i class="fdot" style="--fc:' + base.c[0] + '" aria-hidden="true"></i>' + esc(f.name) + '</span>' +
          '<span class="pcell"><span class="fuel-price">' + rollMarkup(money(f.price)) + '</span><span class="unit">บาท/ลิตร</span></span>' +
          '<span class="chg ' + t.cls + '">' + esc(t.long) + '</span>' +
          '<span class="pchev" aria-hidden="true">' + chevSvg + '</span></button>';
      }).join('') + '</div>';
    }).join('');
  }
  function boardModalHtml(data, failedFlag, fromMap) {
    var st = statusOf(data, failedFlag), eff = data.effective || {};
    return '<div class="mb">' + boardHead(st) +
      '<div class="mb-view"><div class="mb-list">' + boardList(data, fromMap) +
      '<div class="mb-sum"><h4>สรุปราคาล่าสุด</h4>' + summaryHtml(bucketsOf(data), eff) + '</div></div></div></div>';
  }

  function rollRows(scope) {          // ตัวเลขทุกแถว: ราคาก่อนหน้า → ราคาปัจจุบัน
    scope.querySelectorAll('.mrow').forEach(function (r) {
      var roll = r.querySelector('.roll'), from = r.getAttribute('data-from') || null;
      setCols(roll, from, false);
      setTimeout(function () {
        playRoll(roll, from, function () { var c = r.querySelector('.pcell'); c.classList.remove('glow'); void c.offsetWidth; c.classList.add('glow'); });
      }, 220);
    });
  }

  function openBoard(trigger) {
    var data = window.FuelPrices.current(), mFailed = failed, view = 'list';
    var item = {
      tag: data.local ? 'ราคาปั๊มเขาย้อย' : 'ราคาปลีกบางจาก', title: 'ราคาน้ำมันวันนี้', fuel: true, wide: true,
      html: boardModalHtml(data, mFailed),
      lead: 'แตะที่ชนิดน้ำมันเพื่อดูรายละเอียดและประวัติราคา',
      points: [], note: data.remark || 'ราคาปลีก กทม. ยังไม่รวมภาษีบำรุงท้องถิ่น ราคาหน้าปั๊มอาจแตกต่างเล็กน้อย',
      onOpen: function (dlg) {
        var root = dlg.querySelector('.mb');
        var viewEl = root.querySelector('.mb-view');
        rollRows(root);

        function showList(animate) {
          view = 'list';
          viewEl.innerHTML = '<div class="mb-list">' + boardList(data) + '<div class="mb-sum"><h4>สรุปราคาล่าสุด</h4>' + summaryHtml(bucketsOf(data), data.effective || {}) + '</div></div>';
          if (animate) rollRows(viewEl);
          else viewEl.querySelectorAll('.roll').forEach(function (r) { setCols(r, null, true); });
        }
        function showDetail(id) {
          var f = data.fuels.filter(function (x) { return x.id === id; })[0];
          if (f) window.OP.open(fuelItem(f, data), null);
        }
        function reload(res) {
          var old = {}; data.fuels.forEach(function (f) { old[f.id] = money(f.price); });
          data = res.data; mFailed = !!res.failed;
          var head = root.querySelector('.mb-head'), st = statusOf(data, mFailed);
          var tmp = document.createElement('div'); tmp.innerHTML = boardHead(st);
          head.parentNode.replaceChild(tmp.firstChild, head);
          var eff = root.querySelector('.mb-eff'); if (eff && eff.parentNode) eff.remove();
          var msg = root.querySelector('.pb-msg'); if (msg) msg.remove();
          var headNew = root.querySelector('.mb-head');
          var tmp2 = document.createElement('div'); tmp2.innerHTML = (st.eff ? '<p class="mb-eff">' + esc(st.eff) + '</p>' : '') + (st.msg ? '<p class="pb-msg">' + esc(st.msg) + '</p>' : '');
          while (tmp2.lastChild) headNew.insertAdjacentElement('afterend', tmp2.lastChild);
          if (res.changed) {
            var lv = root.querySelector('.pb-live'); if (lv && !lv.hidden) { lv.classList.remove('pulse'); void lv.offsetWidth; lv.classList.add('pulse'); }
            if (view === 'list') { viewEl.innerHTML = '<div class="mb-list">' + boardList(data, old) + '<div class="mb-sum"><h4>สรุปราคาล่าสุด</h4>' + summaryHtml(bucketsOf(data), data.effective || {}) + '</div></div>'; rollRows(viewEl); }
          }
        }
        root.addEventListener('click', function (e) {
          var row = e.target.closest('.mrow');
          if (row) { showDetail(row.getAttribute('data-fuel')); return; }
          if (e.target.closest('.mb-back')) { showList(true); return; }
          var rf = e.target.closest('.mb-refresh');
          if (rf) {
            rf.classList.add('spin', 'busy');
            window.FuelPrices.refresh().then(function (res) { reload(res); rf.classList.remove('busy'); setTimeout(function () { rf.classList.remove('spin'); }, 700); });
          }
        });
      }
    };
    window.OP.open(item, trigger);
  }

  // ภาพหัวหน้า "ราคาน้ำมันวันนี้" กดได้ทั้งใบ (เมาส์ / แตะ / คีย์บอร์ด)
  var heroCard = document.querySelector('[data-fuelboard]');
  if (heroCard) {
    heroCard.addEventListener('click', function () { openFromCard(heroCard); });
    if (heroCard.tagName !== 'BUTTON') {
      heroCard.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFromCard(heroCard); } });
    }
  }

  /* ============ DATA: ใช้ชั้นข้อมูลกลาง (FuelPrices) ============ */
  var btn = document.querySelector('#pb-refresh');

  function check(manual) {
    if (btn) { btn.classList.add('busy'); if (manual) btn.classList.add('spin'); }
    return window.FuelPrices.refresh().then(function (res) {
      var prevFailed = failed;
      failed = !!res.failed;
      if (res.changed) render(res.data, { animate: true, failed: failed });
      else if (failed !== prevFailed) renderStatus(current, effText(current), { failed: failed });
      if (btn) { btn.classList.remove('busy'); if (manual) setTimeout(function () { btn.classList.remove('spin'); }, 700); }
    });
  }
  function effText(d) { var e = d.effective || {}; return e.date ? thDate(e.date) + (e.time ? ' • ' + e.time + ' น.' : '') : ''; }

  if (btn) btn.addEventListener('click', function () { check(true); });
  setInterval(function () { if (!document.hidden) check(false); }, POLL_MS);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(false); });

  render(window.FuelPrices.current(), {});      // แสดงราคาทันทีจากชุดที่มี (ไม่รอเครือข่าย ไม่มีหน้าว่าง)
  check(false);                                 // แล้วตรวจข้อมูลสดเบื้องหลัง ถ้ามีใหม่ค่อยหมุนตัวเลข
});
