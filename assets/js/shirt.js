// โชว์รูมเสื้อ: สลับภาพ (หน้า/หลัง/เนื้อผ้า) + นับถอยหลังวันแจก + ภาพขยาย
(function () {
  var gal = document.getElementById('jrGallery');
  if (!gal) return;
  var imgs = gal.querySelectorAll('.jr-main img');
  var thumbs = gal.querySelectorAll('.jr-thumbs button');
  var cur = 0;

  function show(i) {
    cur = i;
    imgs.forEach(function (m, k) { m.classList.toggle('on', k === i); });
    thumbs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
  }
  thumbs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });

  // ปัดซ้าย/ขวาบนภาพหลักเพื่อเปลี่ยนภาพ (มือถือ)
  var main = gal.querySelector('.jr-main'), sx = null;
  main.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  main.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) show((cur + (dx < 0 ? 1 : imgs.length - 1)) % imgs.length);
  });

  // นับถอยหลังแบบเรียลไทม์ถึงวันแจก 5 ธ.ค. 2569 00:00 (เวลาไทย)
  var dateBox = document.getElementById('jrDate');
  if (dateBox) {
    var TARGET = new Date('2026-12-05T00:00:00+07:00').getTime();
    var START = new Date('2026-11-23T00:00:00+07:00').getTime(); // วันเปิดตัวแบบเสื้อ (ใช้คำนวณแถบความคืบหน้า)
    var els = {}, last = {};
    dateBox.querySelectorAll('[data-u]').forEach(function (b) { els[b.dataset.u] = b; });
    var bar = document.getElementById('jrBar'), msg = document.getElementById('jrCdMsg'), timer = null;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    function set(u, v) {
      if (last[u] === v) return;
      last[u] = v; var b = els[u]; b.textContent = v;
      b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick');
    }
    function tick() {
      var left = TARGET - Date.now();
      if (left <= 0) {
        dateBox.classList.add('done'); msg.textContent = 'เริ่มแจกแล้ว! แวะรับได้ที่ OASIS PARK';
        clearInterval(timer); return;
      }
      var s = Math.floor(left / 1000);
      set('d', pad(Math.floor(s / 86400))); set('h', pad(Math.floor(s % 86400 / 3600)));
      set('m', pad(Math.floor(s % 3600 / 60))); set('s', pad(s % 60));
      bar.style.width = Math.min(100, Math.max(2, (Date.now() - START) / (TARGET - START) * 100)).toFixed(2) + '%';
      var days = left / 86400000;
      msg.textContent = days <= 1 ? 'พรุ่งนี้แล้ว! เจอกันที่ปั๊ม OASIS PARK'
        : days <= 5 ? 'โค้งสุดท้าย! เตรียมตัวรับเสื้อได้เลย'
        : 'อีกไม่นาน เสื้อตัวนี้จะเป็นของคุณ!';
    }
    tick(); timer = setInterval(tick, 1000);
  }

  // ภาพขยาย
  var box = document.getElementById('jrBox');
  function openBox(src, cap) {
    if (!box || !box.showModal) { window.open(src, '_blank', 'noopener'); return; }
    var bi = box.querySelector('img');
    bi.src = src; bi.alt = cap; box.querySelector('p').textContent = cap; box.showModal();
  }
  if (box) {
    box.querySelector('.jr-x').addEventListener('click', function () { box.close(); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  }
  gal.querySelector('.jr-zoom').addEventListener('click', function () { openBox(imgs[cur].src, imgs[cur].alt); });
})();
