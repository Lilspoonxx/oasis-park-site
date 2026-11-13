(function () {
  var promoNote = 'โปรโมชันอาจเปลี่ยนแปลงได้โดยไม่ต้องแจ้งล่วงหน้า';
  var askNote = 'สอบถามเวลาทำการของร้านได้ที่ 095-441-4142';
  var IMG = 'assets/img/web/';

  // ข้อมูลหน้าต่างรายละเอียด (กดการ์ดแล้วเด้งขึ้นมา)
  var items = {
    c42: { tag: 'บางจากฉลองครบรอบ 42 ปี', title: 'สิทธิพิเศษจากบางจาก', big: 'ลด 1 บาท/ลิตร', lead: 'เฉพาะสมาชิก Bangchak GreenMiles วันที่ 13 พ.ย. 2569 เวลา 05.00–24.00 น.', points: ['น้ำมันทุกชนิด ทุกลิตร ไม่มีขั้นต่ำ', 'ราคาหน้าป้ายและหัวจ่ายหักส่วนลดแล้ว', 'เฉพาะสถานีที่ร่วมรายการ'], note: 'โปรโมชันนี้เป็นของบางจาก สอบถามเงื่อนไขเพิ่มเติมได้ที่ปั๊ม', img: IMG + 'promo/promo-42-years.png', alt: 'โปรโมชันบางจากฉลองครบรอบ 42 ปี ลด 1 บาทต่อลิตร' },
    p1: { tag: 'ของแถมตามยอดเติม', title: 'เติมทุก 1,000 บาท', big: 'น้ำดื่ม 1 ขวด', lead: 'ยิ่งเติมมาก ยิ่งได้มาก รับน้ำดื่มทุกยอดเติม 1,000 บาท', points: ['เติม 2,000 บาท รับน้ำดื่ม 2 ขวด', 'ไม่สามารถเปลี่ยนของแถมข้ามชนิดน้ำมัน'], note: promoNote, img: IMG + 'promo/freebie-water.webp', alt: 'ขวดน้ำดื่ม OASIS PARK' },
    p2: { tag: 'ยอดเติมตั้งแต่ 1,200 บาท', title: 'ของแถมตามชนิดน้ำมัน', big: '1,200 ฿ ขึ้นไป', lead: 'ของแถมที่ได้ขึ้นอยู่กับชนิดน้ำมันที่เติม', points: ['ดีเซล รับ M-150 หรือคาราบาวแดง', 'แก๊สโซฮอล รับน้ำผลไม้ดอยคำ', 'ดีเซลไม่เกิน 10,000 บาท ใช้น้ำดื่ม 2 ขวด แลกเครื่องดื่มชูกำลังได้ 1 ขวด', 'ไม่สามารถเปลี่ยนของแถมข้ามชนิดน้ำมัน'], note: promoNote, img: IMG + 'promo/freebie-drinks.webp', alt: 'เครื่องดื่มโปรโมชันดีเซลและแก๊สโซฮอล' },
    p3: { tag: 'เฉพาะ B20 / E20', title: 'B20 / E20 รับน้ำดื่ม 2 เท่า', big: 'น้ำดื่ม 2 เท่า', lead: 'โปรโมชันนี้สำหรับผู้เติม B20 หรือ E20 เท่านั้น เติมแล้วรับน้ำดื่มเพิ่มเป็น 2 เท่า', points: ['ใช้ได้เฉพาะน้ำมัน B20 และ E20', 'รับของแถมตามจำนวนสิทธิ์ที่ได้รับ', 'ไม่สามารถเปลี่ยนของแถมข้ามชนิดน้ำมันได้'], note: promoNote, img: IMG + 'promo/freebie-water-x2.webp', alt: 'น้ำดื่มสองขวดสำหรับโปรโมชัน B20 และ E20' },
    p4: { tag: 'รถใหญ่', title: 'รับคูปองอาหารฟรี', big: '100 ลิตร ขึ้นไป', lead: 'รถใหญ่ หรือเติมตั้งแต่ 100 ลิตร รับคูปองอาหารฟรี ใช้ที่ศูนย์อาหาร', points: ['ร้านอาหารเปิด 07:00 – 15:00 น.', 'รถใหญ่เติมเกิน 10,000 บาท เลือกสัดส่วนน้ำดื่มและ M-150 ได้'], note: promoNote, img: IMG + 'promo/freebie-rice-coupon.webp', alt: 'รถใหญ่พร้อมคูปองอาหาร' },
    terms: { tag: 'เงื่อนไข', title: 'เงื่อนไขทั้งหมด', big: 'โปรของแถม', lead: 'อ่านเงื่อนไขก่อนรับของแถม', points: ['ไม่สามารถเปลี่ยนของแถมข้ามชนิดน้ำมัน', 'ดีเซลไม่เกิน 10,000 บาท ใช้น้ำดื่ม 2 ขวด แลกเครื่องดื่มชูกำลังได้ 1 ขวด', 'รถใหญ่เติมเกิน 10,000 บาท เลือกสัดส่วนน้ำดื่มและ M-150 ได้', 'B20 เลือกของแถมได้ตามจำนวนสิทธิ์ที่ได้รับ'], note: promoNote + ' ติดตามล่าสุดทาง LINE OA' },
    s1: { tag: 'ร้านค้า', title: 'ร้านสะดวกซื้อ Mini Big C', big: 'Mini Big C', lead: 'แวะซื้อของใช้และของกินระหว่างทางได้ในปั๊ม', points: ['อยู่ภายในปั๊ม Oasis Park'], note: askNote + ' · ภาพประกอบ', img: IMG + 'services/shop-scene.jpg', alt: 'ร้านสะดวกซื้อหน้าปั๊ม พร้อมตะกร้าสินค้า' },
    gallery: { tag: 'บรรยากาศ', title: 'บรรยากาศใน Oasis Park', lead: 'ภาพรวมปั๊ม หัวจ่าย หัวชาร์จ EV ร้านกาแฟ ศูนย์อาหาร ร้านสะดวกซื้อ ห้องน้ำ ลานจอดรถ และบัตรสมาชิก', points: [], note: 'ภาพประกอบบรรยากาศ อาจแตกต่างจากหน้างานจริง', img: IMG + 'gallery/oasis-collage.jpg', alt: 'ภาพรวมบรรยากาศ Oasis Park' },
    s2: { tag: 'คาเฟ่', title: 'ร้านกาแฟ Inthanin', big: 'อินทนิล', lead: 'เครื่องดื่มหลากหลาย พร้อมของว่างอร่อย', points: ['เมนูแนะนำ: กาแฟเข้มข้น ชาเขียวหอมละมุน ชาไทยเข้มข้น ชาใสสดชื่น', 'ของว่าง เช่น ขนมจีบ แซนด์วิช'], note: askNote + ' · ภาพประกอบ', img: IMG + 'services/cafe-scene.jpg', alt: 'ร้านกาแฟยามเย็น พร้อมกาแฟเย็นและลาเต้' },
    s3: { tag: 'อาหาร', title: 'ศูนย์อาหาร', big: 'อร่อยครบ จบที่เดียว', lead: 'เมนูหลากหลาย อร่อยถูกใจ ทุกสไตล์ เหมาะสำหรับคนขับรถและครอบครัว', points: ['เมนูแนะนำ: ก๋วยเตี๋ยวต้มยำ ต้มเลือดหมู ข้าวกะเพราหมู/ไก่/เนื้อ ข้าวขาหมู ข้าวมันไก่', 'รับคูปองอาหารฟรีสำหรับรถใหญ่ หรือเติมตั้งแต่ 100 ลิตร'], note: askNote + ' · ภาพประกอบ', img: IMG + 'services/food-scene.jpg', alt: 'ศูนย์อาหารยามเย็นข้างลานเติมน้ำมัน' },
    s4: { tag: 'EV', title: 'ชาร์จรถ EV', big: 'สูงสุด 360 kW', lead: 'ชาร์จเร็วทันใจที่ Oasis Park ด้วยหัวชาร์จ SPARK EV Charging', points: ['ชาร์จพร้อมกันได้ 6 หัว', 'กำลังไฟสูงสุด 360 kW', 'ชำระเงินได้หลายช่องทาง', 'ลงทะเบียนและดูรายละเอียด EV ได้ที่ปั๊ม'], note: 'สอบถามสถานะหัวชาร์จและสิทธิประโยชน์ได้ที่ 095-441-4142 · ภาพประกอบ', img: IMG + 'services/ev-scene.jpg', alt: 'หัวชาร์จ EV ใต้หลังคาไฟเขียวไลม์ ข้างห้องน้ำ' }
  };

  var dialog, lastFocus;

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  var reduceMo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var closeTimer;
  function closeDialog() {           // ปิดแบบ fade/scale สั้นๆ แล้วค่อยปิดจริง
    if (!dialog || !dialog.open) return;
    if (reduceMo || dialog.classList.contains('closing')) { if (reduceMo) dialog.close(); return; }
    dialog.classList.add('closing');
    closeTimer = setTimeout(function () { dialog.classList.remove('closing'); dialog.close(); }, 230);
  }

  function build() {
    dialog = document.createElement('dialog');
    dialog.className = 'op-modal';
    dialog.setAttribute('aria-labelledby', 'op-modal-title');
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); closeDialog(); });   // กด Escape
    dialog.addEventListener('close', function () { document.body.classList.remove('modal-open'); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
    document.body.appendChild(dialog);
  }

  function open(id, trigger) {
    var m = typeof id === 'string' ? items[id] : id;
    if (!m) return;
    if (!dialog) build();
    if (!dialog.open) lastFocus = trigger || document.activeElement;      // เปลี่ยนเนื้อหา modal ที่เปิดอยู่: คงจุดโฟกัสเดิมไว้
    if (lastFocus && lastFocus.classList) { lastFocus.classList.remove('popped'); void lastFocus.offsetWidth; lastFocus.classList.add('popped'); }
    var pts = (m.points || []).map(function (p) { return '<li><span>' + esc(p) + '</span></li>'; }).join('');
    dialog.innerHTML = m.custom ? ('<div class="mbody"><button type="button" class="mclose" aria-label="ปิดหน้าต่าง">✕</button><h3 id="op-modal-title" class="sr-only">' + esc(m.title) + '</h3>' + (m.html || '') + '</div>') :
      '<div class="mbody">' +
      '<button type="button" class="mclose" aria-label="ปิดหน้าต่าง">✕</button>' +
      (m.img ? '<img class="mimg" src="' + esc(m.img) + '" alt="' + esc(m.alt || '') + '">' : '') +
      '<span class="tag-pill">' + esc(m.tag) + '</span>' +
      '<h3 id="op-modal-title">' + esc(m.title) + '</h3>' +
      (m.big ? '<div class="mbig">' + esc(m.big) + '</div>' : '') +
      (m.html ? '<div class="mx">' + m.html + '</div>' : '') +
      '<p class="mlead">' + esc(m.lead) + '</p>' +
      (pts ? '<ul>' + pts + '</ul>' : '') +
      '<p class="mnote">' + esc(m.note) + '</p>' +
      '<div class="macts">' +
      '<a class="btn btn-primary" href="https://line.me/R/ti/p/@087rhavv" target="_blank" rel="noopener">สอบถามทาง LINE</a>' +
      '<a class="btn btn-outline" href="tel:0954414142">โทร 095-441-4142</a>' +
      '</div></div>';
    dialog.classList.toggle('fuel', !!m.fuel);
    dialog.classList.toggle('custom', !!m.custom);
    dialog.classList.toggle('wide', !!m.wide);
    clearTimeout(closeTimer);                  // เปิดใหม่ระหว่างกำลังปิด: ยกเลิกตัวจับเวลาปิดเดิม
    dialog.classList.remove('closing');
    dialog.querySelector('.mclose').addEventListener('click', closeDialog);
    document.body.classList.add('modal-open');
    if (!dialog.open) { if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', ''); }
    if (m.onOpen) m.onOpen(dialog);
  }

  window.OP = { items: items, open: open, close: closeDialog };

  document.addEventListener('DOMContentLoaded', function () {
    // เมนูมือถือ
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('nav.primary');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var o = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', o ? 'true' : 'false');
      });
    }

    // กดการ์ดแล้วเปิดหน้าต่างรายละเอียด
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-modal]');
      if (t) { e.preventDefault(); open(t.getAttribute('data-modal'), t); }
    });

    // แสงตามเมาส์บนการ์ด
    document.addEventListener('mousemove', function (e) {
      var c = e.target.closest && e.target.closest('.glass');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });


    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ripple แสงไลม์ตรงจุดที่กด
    document.addEventListener('pointerdown', function (e) {
      if (reduce) return;
      var t = e.target.closest && e.target.closest('.glass, .btn, nav.primary a');
      if (!t) return;
      var r = t.getBoundingClientRect();
      var s = document.createElement('span');
      s.className = 'rip';
      s.style.left = (e.clientX - r.left) + 'px';
      s.style.top = (e.clientY - r.top) + 'px';
      t.appendChild(s);
      setTimeout(function () { s.remove(); }, 800);
    });

    // เปลี่ยนหน้าแบบแถบเขียว-ไลม์กวาด + ตราโลโก้เด้ง
    var pt = document.querySelector('.pt');
    // กันค้าง: เมื่อแอนิเมชันเปิดหน้าจบ (หรือเกิน 2 วินาที) ให้เอาแถบออกจากหน้า
    if (pt) { var donePt = function () { if (!pt.classList.contains('leaving')) pt.style.display = 'none'; }; pt.addEventListener('animationend', function (e) { if (e.animationName === 'ptEnter') donePt(); }); setTimeout(donePt, 2000); }
    document.addEventListener('click', function (e) {
      if (reduce || !pt || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || !/(\.html|\/)$/.test(u.pathname)) return;
      e.preventDefault();
      pt.style.display = ''; pt.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 460);
    });
    window.addEventListener('pageshow', function (ev) { if (ev.persisted && pt) { pt.classList.remove('leaving'); pt.style.display = 'none'; } });

    // พารัลแลกซ์ของภาพเบลอด้านหลัง
    var bgs = document.querySelectorAll('.hero-bg');
    if (bgs.length && !reduce) {
      var tick = false;
      window.addEventListener('scroll', function () {
        if (tick) return; tick = true;
        requestAnimationFrame(function () {
          bgs.forEach(function (b) { b.style.setProperty('--sy', Math.min(window.scrollY, 700)); });
          tick = false;
        });
      }, { passive: true });
    }

    // ภาพคมเอียงตามเมาส์ (เฉพาะจอที่มีเมาส์)
    if (!reduce && window.matchMedia('(hover: hover)').matches) {
      document.querySelectorAll('.shot').forEach(function (s) {
        var t = s.querySelector('.tilt'); if (!t) return;
        s.addEventListener('mousemove', function (e) {
          var r = s.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          t.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg');
          t.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
        });
        s.addEventListener('mouseleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
      });
    }

    // ซ่อนโปรที่หมดเขตแล้ว (data-until)
    document.querySelectorAll('[data-until]').forEach(function (el) {
      if (Date.now() > Date.parse(el.getAttribute('data-until'))) el.hidden = true;
    });
  });
})();
