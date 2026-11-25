/* หน้าแผนที่ & ติดต่อ (contact.html) — v1.6 · 26 พ.ย. 69 */
(function () {
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  var toast = document.querySelector('.toast'), tt;
  function say(msg) { toast.textContent = msg; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 2000); }

  document.querySelectorAll('[data-copy], [data-copy-from]').forEach(function (b) {
    var span = b.querySelector('span') || b, label = b.getAttribute('data-label');
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-copy');
      if (!v) {
        var src = document.getElementById(b.getAttribute('data-copy-from'));
        v = src ? src.textContent.replace(/\s*·\s*/g, ' ').trim() : '';
        var extra = b.getAttribute('data-copy-extra'); if (extra) v = v ? v + '\n' + extra : extra;
      }
      if (!v) { say('ยังไม่มีข้อมูลให้คัดลอก'); return; }
      var ok = function () {
        b.classList.add('done'); span.textContent = 'คัดลอกแล้ว ✓'; say('คัดลอกแล้ว');
        setTimeout(function () { b.classList.remove('done'); span.textContent = label; }, 2000);
      };
      var legacy = function () {
        var t = document.createElement('textarea'); t.value = v; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;opacity:0;top:0';
        document.body.appendChild(t); t.select(); var r = false; try { r = document.execCommand('copy'); } catch (e) {} t.remove();
        b.focus();
        if (r) ok(); else { say('คัดลอกไม่ได้ · ' + v.replace('\n', ' · ')); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, 6000); }
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(ok, legacy); else legacy();
    });
  });

  // ===== ช่องทางโซเชียล: ไอคอนเด้ง + แสงวาบ + ประกายวิ้ง =====
  // ไม่หน่วงลิงก์: ปล่อยให้การแตะของลูกค้าเปิดลิงก์เองทันที มือถือถึงจะส่งต่อเข้าแอป LINE / Facebook / TikTok ได้
  // เอฟเฟกต์เริ่มตั้งแต่นิ้วแตะจอ (pointerdown) เลยเห็นการเด้งก่อนเปลี่ยนหน้า
  var GLINTS = [[-58, 40, 15, 0], [8, 47, 10, 70], [62, 37, 13, 30], [128, 45, 9, 120], [192, 39, 14, 50], [262, 46, 10, 150]];
  function popIcon(si) {
    if (!si || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    si.classList.remove('pop'); void si.offsetWidth; si.classList.add('pop');
    var old = si.querySelector('.burst'); if (old) old.remove();
    var b = document.createElement('span'); b.className = 'burst'; b.setAttribute('aria-hidden', 'true');
    GLINTS.forEach(function (g) {
      var e = document.createElement('span'); e.className = 'gl';
      e.style.setProperty('--a', g[0] + 'deg'); e.style.setProperty('--r', g[1] + 'px'); e.style.setProperty('--s', g[2] + 'px');
      var i = document.createElement('i'); i.style.setProperty('--dl', g[3] + 'ms'); e.appendChild(i); b.appendChild(e);
    });
    for (var k = 0; k < 5; k++) {
      var d = document.createElement('span'); d.className = 'dust';
      d.style.setProperty('--a', (k * 72 + 36) + 'deg'); d.style.setProperty('--dl', (60 + k * 40) + 'ms'); b.appendChild(d);
    }
    si.appendChild(b);
    clearTimeout(si._t); si._t = setTimeout(function () { b.remove(); si.classList.remove('pop'); }, 1100);
  }
  document.querySelectorAll('[data-social]').forEach(function (a) {
    var si = function () { return a.closest('.sc').querySelector('.si'); };
    a.addEventListener('pointerdown', function (e) { if (e.button === 0) popIcon(si()); });
    a.addEventListener('click', function (e) { if (e.detail === 0) popIcon(si()); }); // กด Enter จากคีย์บอร์ด
  });
  // คัดลอกไอดี LINE → ไอคอน LINE เด้งด้วย
  document.querySelectorAll('.sc [data-copy]').forEach(function (b) {
    b.addEventListener('click', function () { popIcon(b.closest('.sc').querySelector('.si')); });
  });

  // ===== นาฬิกาเวลาประเทศไทย (UTC+7 ตลอดปี ไม่มีเวลาออมแสง จึงคำนวณเองได้ ไม่พึ่งเวลาโซนของเครื่อง) =====
  (function () {
    var H = document.getElementById('clkH'), M = document.getElementById('clkM'), S = document.getElementById('clkS'),
        hand = document.getElementById('clkHand'), ticks = document.getElementById('clkTicks'),
        dt = document.getElementById('clkDate'), clk = document.getElementById('clk');
    if (!H) return;
    var NS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 24; i++) { // ขีด 24 ชั่วโมง (ขีดยาวทุก 6 ชม.)
      var ln = document.createElementNS(NS, 'line'), big = i % 6 === 0;
      ln.setAttribute('x1', 100); ln.setAttribute('x2', 100); ln.setAttribute('y1', big ? 14 : 17); ln.setAttribute('y2', big ? 27 : 23);
      ln.setAttribute('transform', 'rotate(' + i * 15 + ' 100 100)'); if (big) ln.setAttribute('class', 'big');
      ticks.appendChild(ln);
    }
    var dfmt = null;
    try { dfmt = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
    var lastMin = -1;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var now = new Date(), t = new Date(now.getTime() + 7 * 3600e3), h = t.getUTCHours(), m = t.getUTCMinutes(), s = t.getUTCSeconds();
      H.textContent = pad(h); M.textContent = pad(m); S.textContent = pad(s);
      hand.setAttribute('transform', 'rotate(' + (h * 3600 + m * 60 + s) / 240 + ' 100 100)'); // จุดเรืองแสงเดินรอบวง 1 รอบ/วัน (เที่ยงคืนอยู่บนสุด)
      if (m !== lastMin) {
        lastMin = m;
        clk.setAttribute('aria-label', 'เวลาประเทศไทยขณะนี้ ' + pad(h) + ':' + pad(m) + ' น.');
        if (dfmt && dt) { try { dt.textContent = dfmt.format(now); } catch (e) {} }
      }
      setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
    }
    tick();
  })();

  // ===== ลูกเล่นตอนกด นำทาง / โทร =====
  // ลดการเคลื่อนไหว หรือกดพร้อม Ctrl/Shift = ไปตรงทันทีแบบเดิม · กดยกเลิกหรือ Esc ได้ระหว่างแอนิเมชัน
  var fx = document.getElementById('fx'), sky = document.getElementById('fxSky'), route = document.getElementById('fxRoute'),
      plane = document.getElementById('fxPlane'), msg = document.getElementById('fxMsg'), cancel = document.getElementById('fxCancel');
  var go = document.getElementById('fxGo'), title = document.getElementById('fxTitle'), sub = document.getElementById('fxSub');
  var fxTimers = [], fxRaf = 0, fxFrom = null, wentAway = false;
  var behind = ['header.site', 'main', 'footer.site', '.sticky-bar'];
  function setInert(on) { // ระหว่างแอนิเมชัน ส่วนหลังฉากกด/โฟกัสไม่ได้
    behind.forEach(function (sel) { var el = document.querySelector(sel); if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  }
  function fxClear() {
    fxTimers.forEach(clearTimeout); fxTimers = []; cancelAnimationFrame(fxRaf);
    fx.hidden = true; fx.className = 'fx'; document.body.classList.remove('fx-on');
    go.hidden = true; cancel.textContent = 'ยกเลิก'; wentAway = false; setInert(false);
  }
  function fxClose() { fxClear(); if (fxFrom) { try { fxFrom.focus({ preventScroll: true }); } catch (e) {} fxFrom = null; } }
  function fxShow(mode, from, t, s) {
    fxClear(); fxFrom = from;
    title.textContent = t; sub.textContent = s;
    fx.className = 'fx ' + mode; fx.hidden = false; document.body.classList.add('fx-on'); setInert(true);
    try { cancel.focus({ preventScroll: true }); } catch (e) {}
  }
  // หลังพยายามเปิดปลายทางแล้ว: เผื่อเบราว์เซอร์/LINE ไม่ยอมเปิดเอง → โชว์ปุ่มให้แตะเปิดเอง (เป็นการแตะจริงของผู้ใช้ เปิดได้แน่)
  function fxFallback(url, isMaps) {
    go.href = url; go.textContent = isMaps ? 'เปิด Google Maps' : 'โทรเลย';
    if (isMaps) { go.target = '_blank'; go.rel = 'noopener'; } else { go.removeAttribute('target'); go.removeAttribute('rel'); }
    sub.textContent = 'ถ้ายังไม่เปิด แตะปุ่ม “' + go.textContent + '” ด้านล่าง';
    go.hidden = false; cancel.textContent = 'ปิด';
    if (document.activeElement === cancel) { try { go.focus({ preventScroll: true }); } catch (e) {} }
  }
  cancel.addEventListener('click', fxClose);
  document.addEventListener('keydown', function (e) {
    if (fx.hidden) return;
    if (e.key === 'Escape') { fxClose(); return; }
    if (e.key === 'Tab') { // วนโฟกัสอยู่ในกล่องนี้เท่านั้น
      var f = [go, cancel].filter(function (x) { return !x.hidden; }), i = f.indexOf(document.activeElement);
      e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  // ออกไปแอปแผนที่/แอปโทรแล้วกลับมา → ปิดกล่องให้ใช้งานต่อได้ทันที
  document.addEventListener('visibilitychange', function () {
    if (fx.hidden) return;
    if (document.hidden) wentAway = true; else if (wentAway) fxClose();
  });
  addEventListener('pageshow', function (e) { if (e.persisted) fxClear(); });

  function openMaps(url) {
    var w = null; try { w = window.open(url, '_blank'); } catch (e) {}
    if (w) { try { w.opener = null; } catch (e) {} } else location.href = url; // เปิดแท็บใหม่ไม่ได้ (เช่น iPhone) → เปิดในหน้าเดิม
  }

  function fly(a) {
    var url = a.href;
    fxShow('fly', a, 'กำลังเปิด Google Maps', 'นำทางไป Oasis Park · เขาย้อย');
    var w = innerWidth, h = innerHeight, cx = w / 2, cy = h * .42, L;
    try {
      sky.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      route.setAttribute('d', 'M -90 ' + h * .86 + ' C ' + w * .18 + ' ' + h * .92 + ', ' + w * .28 + ' ' + cy + ', ' + cx + ' ' + cy +
        ' S ' + w * .86 + ' ' + h * .04 + ', ' + (w + 90) + ' ' + h * .1);
      L = route.getTotalLength(); if (!(L > 0)) throw 0;
    } catch (err) { fxClear(); openMaps(url); return; } // วาดเส้นทางไม่ได้ → เปิดแผนที่ทันที ไม่ให้ค้าง
    var t0 = 0, dur = 1150, dropped = false;
    route.style.strokeDasharray = L; route.style.strokeDashoffset = L;
    function step(now) {
      try {
        if (!t0) t0 = now;
        var p = Math.min((now - t0) / dur, 1), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2, l = e * L;
        var pt = route.getPointAtLength(l), b = route.getPointAtLength(Math.max(l - 2, 0)), f = route.getPointAtLength(Math.min(l + 2, L));
        plane.style.transform = 'translate(' + pt.x + 'px,' + pt.y + 'px) rotate(' + Math.atan2(f.y - b.y, f.x - b.x) * 180 / Math.PI + 'deg)';
        route.style.strokeDashoffset = L - l;
        if (!dropped && pt.x >= cx) { dropped = true; fx.classList.add('drop'); }
        if (p < 1) fxRaf = requestAnimationFrame(step);
      } catch (err) { // คำนวณเฟรมไม่ได้ → หยุดเครื่องบิน โชว์หมุดเลย ส่วนตัวจับเวลายังเปิดแผนที่ + ปุ่มสำรองตามปกติ
        plane.style.display = 'none'; fx.classList.add('drop');
      }
    }
    plane.style.display = '';
    fxTimers.push(setTimeout(function () { openMaps(url); fxFallback(url, true); }, 1500)); // ตั้งก่อนเริ่มแอนิเมชัน ไม่พึ่งว่าเฟรมจะสำเร็จ
    fxRaf = requestAnimationFrame(step);
  }

  function call(a) {
    var url = a.getAttribute('href');
    fxShow('call', a, 'กำลังเปิดหน้าโทร', 'โทรหา Oasis Park · 095-441-4142');
    fxTimers.push(setTimeout(function () { location.href = url; fxFallback(url, false); }, 1300));
  }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.closest('#fx')) return;
    var href = a.getAttribute('href');
    if (/^tel:/i.test(href)) { e.preventDefault(); call(a); }
    else if (/maps\.app\.goo\.gl|google\.[a-z.]+\/maps/i.test(href)) { e.preventDefault(); fly(a); }
  }, true);
})();
