/* แถบ "ราคาน้ำมันวันนี้" หน้าแรก — อ่านข้อมูลจาก window.FuelPrices เท่านั้น (ห้าม fetch เอง) */
(function () {
  var row = document.getElementById('homePrices');
  var note = document.getElementById('homePricesNote');
  if (!row || !window.FuelPrices) return;

  // น้ำมันที่ลูกค้าเติมบ่อยที่สุด เรียงตามความนิยมหน้าปั๊ม
  var PICK = [
    ['dieselS', 'ดีเซล S'],
    ['gasohol95', 'แก๊สโซฮอล์ 95'],
    ['gasohol91', 'แก๊สโซฮอล์ 91'],
    ['e20', 'E20'],
    ['b20', 'ดีเซล B20']
  ];
  var TH_MONTH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  function thDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return '';
    return Number(m[3]) + ' ' + TH_MONTH[Number(m[2]) - 1] + ' ' + String(Number(m[1]) + 543).slice(-2);
  }

  function render(data) {
    if (!data || !data.fuels) return;
    var byId = {};
    data.fuels.forEach(function (f) { byId[f.id] = f; });
    var html = '';
    PICK.forEach(function (p) {
      var f = byId[p[0]];
      if (!f) return;
      var diff = Math.round((f.price - f.previousPrice) * 100) / 100;
      var chg = '';
      if (diff < 0) chg = '<span class="ps-chg down">▼ ' + Math.abs(diff).toFixed(2) + '</span>';
      else if (diff > 0) chg = '<span class="ps-chg up">▲ ' + diff.toFixed(2) + '</span>';
      html += '<a class="ps-chip" role="listitem" href="prices.html"><span class="ps-name">' + p[1] +
        '</span><span class="ps-price">' + f.price.toFixed(2) + '</span>' + chg + '</a>';
    });
    row.innerHTML = html;
    var d = data.effective && data.effective.date;
    if (note && d) note.textContent = 'มีผล ' + thDate(d) + ' · ราคาอ้างอิงบางจาก หน่วย บาท/ลิตร';
  }

  render(window.FuelPrices.current());
  window.FuelPrices.refresh().then(function (res) { if (res && res.changed) render(res.data); });
})();
