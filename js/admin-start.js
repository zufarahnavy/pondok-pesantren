(function () {
  var MENU = ['dashboard', 'pendaftar', 'formulir', 'periode', 'konten', 'laporan', 'notifikasi', 'crm', 'migrasi', 'admin', 'log', 'pengaturan'];
  ADM.order = MENU.filter(function (i) { return ADM.pages[i]; });
  function go() { ADM.start(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
