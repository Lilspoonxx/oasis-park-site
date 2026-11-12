document.addEventListener('DOMContentLoaded', function () {
  var tbody = document.querySelector('#price-body');
  var updatedEl = document.querySelector('#price-updated');
  if (!tbody) return;

  fetch('data/prices.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      tbody.innerHTML = '';
      data.fuels.forEach(function (f) {
        var tr = document.createElement('tr');
        var priceText = (f.price === null || f.price === undefined)
          ? 'โปรดสอบถามหน้าปั๊ม'
          : f.price.toFixed(2) + ' บาท/ลิตร';
        tr.innerHTML = '<td>' + f.name + '</td><td class="price-val">' + priceText + '</td>';
        tbody.appendChild(tr);
      });
      if (updatedEl) updatedEl.textContent = data.updated;
    })
    .catch(function () {
      tbody.innerHTML = '<tr><td colspan="2">ไม่สามารถโหลดราคาได้ในขณะนี้ กรุณาสอบถามหน้าปั๊มโดยตรง</td></tr>';
    });
});
