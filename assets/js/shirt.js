(function () {
  var root = document.getElementById('shirtReveal');
  if (!root) return;
  var mystery = root.querySelector('.sr-mystery');
  var closeBtn = root.querySelector('.sr-close');
  var tabs = root.querySelectorAll('.sr-tab');
  var imgs = root.querySelectorAll('.sr-viewer img');
  var viewer = root.querySelector('.sr-viewer');

  function show(i) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    imgs.forEach(function (m, k) { m.classList.toggle('on', k === i); });
  }
  function setOpen(o) {
    root.classList.toggle('open', o);
    mystery.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (viewer) viewer.setAttribute('aria-hidden', o ? 'false' : 'true');
    if (closeBtn) closeBtn.hidden = !o;
    if (o) { show(0); setTimeout(function () { if (tabs[0]) tabs[0].focus(); }, 700); }
    else mystery.focus();
  }
  imgs.forEach(function (m) { m.loading = 'eager'; });
  mystery.addEventListener('click', function () { setOpen(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); }); });
  root.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) setOpen(false); });
})();
