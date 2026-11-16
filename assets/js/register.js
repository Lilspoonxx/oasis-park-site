/* หน้าสมัครสมาชิก VIP ออนไลน์
   ข้อมูลส่งตรงเข้า Google Sheet บัญชีร้าน ผ่าน Apps Script เว็บแอป (โค้ดฝั่งชีต: briefs/vip-register/apps-script.gs)
   ENDPOINT ว่าง = โหมดพรีวิว ไม่ส่งข้อมูลจริง */
(function () {
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbyeX9i2vdTb6L-UiBSGpZHD6NGnn21pyOJgQzY_D5RMtQbCBSWcuXc8QS95ycqwXDeuCA/exec';       // เช่น https://script.google.com/macros/s/XXXX/exec

  var form = document.getElementById('reg-form');
  if (!form) return;
  var $ = function (id) { return document.getElementById(id); };
  var btn = $('reg-submit'), status = $('reg-status');

  // PDPA
  var pdpa = $('pdpa');
  $('pdpa-open').addEventListener('click', function () { if (pdpa.showModal) pdpa.showModal(); });
  pdpa.addEventListener('click', function (e) { if (e.target === pdpa) pdpa.close(); });

  function digits(s) { return (s || '').replace(/\D/g, ''); }
  function setErr(input, errId, msg) {
    $(errId).textContent = msg || '';
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function isMobile(d) { return /^0[689]\d{8}$/.test(d); }

  function validate() {
    var ok = true, first = null;
    function check(input, errId, msg) {
      if (!setErr(input, errId, msg)) { ok = false; first = first || input; }
    }
    var name = $('f-name'), phone = $('f-phone'), addr = $('f-addr'), ref = $('f-ref'), consent = $('f-consent');
    var p = digits(phone.value), r = digits(ref.value);

    check(name, 'e-name', name.value.trim().length < 3 ? 'กรุณากรอกชื่อและนามสกุล' : '');
    check(phone, 'e-phone', !isMobile(p) ? 'กรุณากรอกเบอร์มือถือ 10 หลัก เช่น 0812345678' : '');
    check(addr, 'e-addr', addr.value.trim().length < 10 ? 'กรุณากรอกที่อยู่ให้ครบ' : '');
    check(ref, 'e-ref', r && !isMobile(r) ? 'เบอร์ผู้ชวนไม่ถูกต้อง (ถ้าไม่มีให้เว้นว่าง)' :
                        r && r === p ? 'เบอร์ผู้ชวนต้องไม่ใช่เบอร์ของคุณเอง' : '');
    check(consent, 'e-consent', !consent.checked ? 'กรุณาติ๊กยินยอมก่อนส่งข้อมูล' : '');
    if (first) first.focus();
    return ok;
  }

  // ลบ error ทันทีที่แก้
  form.addEventListener('input', function (e) {
    var map = { 'f-name': 'e-name', 'f-phone': 'e-phone', 'f-addr': 'e-addr', 'f-ref': 'e-ref', 'f-consent': 'e-consent' };
    if (map[e.target.id]) setErr(e.target, map[e.target.id], '');
  });

  function done(phone) {
    $('rd-phone').textContent = phone.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
    form.hidden = true;
    var box = $('reg-done');
    box.hidden = false;
    box.focus();
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'f-status';
    status.textContent = '';
    if (!validate()) return;

    var phone = digits($('f-phone').value);
    if (form.website.value) { done(phone); return; }   // บอท: ทำเหมือนสำเร็จแต่ไม่ส่ง

    if (!ENDPOINT) {
      status.textContent = 'โหมดพรีวิว: ยังไม่ได้เชื่อมที่เก็บข้อมูล ข้อมูลนี้ไม่ได้ถูกส่ง';
      done(phone);
      return;
    }

    var body = new URLSearchParams();
    body.append('name', $('f-name').value.trim());
    body.append('phone', phone);
    body.append('address', $('f-addr').value.trim());
    body.append('referrer', digits($('f-ref').value));

    btn.disabled = true;
    btn.textContent = 'กำลังส่ง...';
    fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () { done(phone); })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'ส่งข้อมูลสมัครสมาชิก';
        status.className = 'f-status bad';
        status.textContent = 'ส่งไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง หรือโทร 095-441-4142';
      });
  });
})();
