document.addEventListener('DOMContentLoaded', function () {
  var grid = document.querySelector('#price-grid');
  var effEl = document.querySelector('#price-effective');
  if (!grid) return;

  var fuelNote = 'ราคาอ้างอิงจากประกาศบางจาก ราคาหน้าปั๊มอาจแตกต่างเล็กน้อย ตรวจคู่มือรถก่อนเลือกชนิดน้ำมัน';
  var info = {
    'HI DIESEL S': { tag: 'ดีเซล', lead: 'น้ำมันดีเซลสำหรับเครื่องยนต์ดีเซล เหมาะกับรถกระบะ รถบรรทุก และรถใหญ่', points: ['เติมตั้งแต่ 1,200 บาท รับ M-150 หรือคาราบาวแดง', 'เติมทุก 1,000 บาท รับน้ำดื่ม 1 ขวด', 'รถใหญ่หรือเติมตั้งแต่ 100 ลิตร รับคูปองข้าวฟรี'], note: fuelNote },
    'ดีเซล B20': { tag: 'ดีเซล B20', lead: 'ดีเซลผสมไบโอดีเซล 20% สำหรับรถที่รองรับ B20 เช่น รถบรรทุกและรถใหญ่', points: ['เติม B20 รับน้ำดื่ม 2 เท่า', 'B20 เลือกของแถมได้ตามจำนวนสิทธิ์ที่ได้รับ'], note: 'ก่อนเติม B20 โปรดตรวจสอบว่ารถของท่านรองรับ · ' + fuelNote },
    'GASOHOL 95S EVO': { tag: 'แก๊สโซฮอล', lead: 'แก๊สโซฮอลออกเทน 95 สำหรับรถเบนซินที่รองรับน้ำมันแก๊สโซฮอล', points: ['เติมตั้งแต่ 1,200 บาท รับน้ำผลไม้ดอยคำ', 'เติมทุก 1,000 บาท รับน้ำดื่ม 1 ขวด'], note: fuelNote },
    'GASOHOL E20S EVO': { tag: 'แก๊สโซฮอล E20', lead: 'แก๊สโซฮอล E20 มีเอทานอลผสม 20% ใช้ได้เฉพาะรถที่รองรับ E20', points: ['เติม E20 รับน้ำดื่ม 2 เท่า', 'เติมตั้งแต่ 1,200 บาท รับน้ำผลไม้ดอยคำ'], note: 'ก่อนเติม E20 โปรดตรวจสอบว่ารถของท่านรองรับ · ' + fuelNote },
    'GASOHOL 91S EVO': { tag: 'แก๊สโซฮอล', lead: 'แก๊สโซฮอลออกเทน 91 สำหรับรถเบนซินทั่วไปที่รองรับแก๊สโซฮอล', points: ['เติมตั้งแต่ 1,200 บาท รับน้ำผลไม้ดอยคำ', 'เติมทุก 1,000 บาท รับน้ำดื่ม 1 ขวด'], note: fuelNote },
    'ไฮ พรีเมียม 98 พลัส': { tag: 'พรีเมียม', lead: 'เบนซินพรีเมียมออกเทน 98 สำหรับรถที่ต้องการน้ำมันออกเทนสูง', points: [], note: fuelNote }
  };

  function chgOf(price, prev) {
    var d = Math.round((price - prev) * 100) / 100, a = Math.abs(d).toFixed(2);
    if (d < 0) return { cls: 'down', short: '▼ ลง ' + a, long: 'ราคาลดลง ' + a + ' บาท/ลิตร' };
    if (d > 0) return { cls: 'up', short: '▲ ขึ้น ' + a, long: 'ราคาขึ้น ' + a + ' บาท/ลิตร' };
    return { cls: 'same', short: '– เท่าเดิม', long: 'ราคาเท่าเดิม' };
  }

  fetch('data/prices.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      grid.innerHTML = '';
      data.fuels.forEach(function (f, i) {
        var base = info[f.name] || { tag: 'น้ำมัน', lead: '', points: [], note: fuelNote };
        var hasPrice = f.price !== null && f.price !== undefined;
        var c = hasPrice ? chgOf(f.price, f.prev === undefined ? f.price : f.prev) : null;
        var key = 'fuel' + i;
        window.OP.items[key] = {
          tag: base.tag, title: f.name,
          big: hasPrice ? f.price.toFixed(2) + ' ฿/ลิตร' : 'สอบถามราคา',
          lead: base.lead,
          points: (c ? [c.long + ' (เทียบกับ 6 พ.ย. 2569: ' + f.prev.toFixed(2) + ' ฿)'] : []).concat(base.points),
          note: base.note
        };
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'glass';
        b.setAttribute('data-modal', key);
        b.setAttribute('aria-haspopup', 'dialog');
        b.innerHTML =
          '<span class="fuel-name">' + f.name + '</span>' +
          '<span class="bignum fuel-price">' + (hasPrice ? f.price.toFixed(2) : 'สอบถาม') + '</span>' +
          '<span class="chg-row"><span>บาท / ลิตร</span>' + (c ? '<span class="chg ' + c.cls + '">' + c.short + '</span>' : '') + '</span>';
        grid.appendChild(b);
      });
      if (effEl) effEl.textContent = data.effective || data.updated;
    })
    .catch(function () {
      grid.innerHTML = '<p class="note">ไม่สามารถโหลดราคาได้ในขณะนี้ กรุณาสอบถามหน้าปั๊มโดยตรง หรือดูราคาล่าสุดที่เว็บบางจาก</p>';
    });
});
