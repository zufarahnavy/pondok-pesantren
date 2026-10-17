/* admin-pages.js — Dashboard, Pendaftar, Laporan */
(function () {
  'use strict';
  var P = PP, $ = P.$, $$ = P.$$, esc = P.esc, I = P.icon;
  var WARNA = { Baru: '#3b82f6', Diverifikasi: '#8b5cf6', Diterima: '#22c55e', Ditolak: '#ef4444', Cadangan: '#f59e0b' };

  // ================= DASHBOARD =================
  function dashHtml(d) {
    if (!d) return '';
    var st = ADM.STATUS, k = d.kuota, max = Math.max.apply(null, d.tren.map(function (x) { return x.jumlah; }).concat([1]));
    var kartu = [['Total Pendaftar', d.total, 'users', 'text-brand dark:text-sec bg-brand/10']].concat(st.map(function (s) { return [s, d.perStatus[s] || 0, { Baru: 'user-plus', Diverifikasi: 'badge-check', Diterima: 'user-check', Ditolak: 'user-x', Cadangan: 'clock' }[s], 'bg-surf3 text-ink']; }));
    return (d.dummy ? '<div class="rounded-2xl bg-gold/15 border border-gold/40 p-4 mb-5 flex gap-3 items-start">' + I('triangle-alert', 'text-gold shrink-0 mt-0.5') + '<div class="text-sm"><b>Masih ada data contoh (dummy).</b> Hapus dari <a class="underline font-semibold" href="#/pengaturan">Pengaturan → Data Contoh</a> sebelum go-live.</div></div>' : '') +
      '<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-5">' + kartu.map(function (c) { return '<div class="card p-4 sm:p-5"><span class="w-10 h-10 rounded-xl grid place-items-center mb-3 ' + c[3] + '">' + I(c[2]) + '</span><div class="text-2xl sm:text-3xl font-extrabold">' + c[1] + '</div><div class="text-sm text-ink2">' + esc(c[0]) + '</div></div>'; }).join('') + '</div>' +
      '<div class="grid xl:grid-cols-[2fr_1fr] gap-5 mb-5">' + ADM.panel('Pendaftar 14 Hari Terakhir', '', '<div class="flex items-end gap-1.5 h-44" role="img" aria-label="Grafik pendaftar 14 hari terakhir">' + d.tren.map(function (x) { return '<div class="flex-1 flex flex-col items-center justify-end h-full gap-1 min-w-0" title="' + esc(P.tgl(x.tanggal, 1)) + ': ' + x.jumlah + '"><span class="text-[11px] font-bold text-ink2">' + (x.jumlah || '') + '</span><div class="w-full rounded-t-lg bg-brand dark:bg-sec" style="height:' + Math.max(3, Math.round(x.jumlah / max * 100)) + '%;min-height:3px"></div><span class="text-[10px] text-ink2">' + x.tanggal.slice(8) + '</span></div>'; }).join('') + '</div>') +
      ADM.panel('Kuota & Status', '', '<div class="mb-4"><div class="flex justify-between text-sm mb-2"><span>Terisi</span><b>' + k.terisi + ' / ' + (k.kuota || '∞') + '</b></div><div class="h-3 rounded-full bg-surf3 overflow-hidden"><div class="h-full rounded-full bg-sec" style="width:' + (k.kuota ? Math.min(100, Math.round(k.terisi / k.kuota * 100)) : 0) + '%"></div></div><p class="text-xs text-ink2 mt-2">' + (k.dibuka ? 'Pendaftaran dibuka sampai ' + P.tgl(k.tutup) : esc(k.alasan)) + '</p></div><div class="grid gap-2">' + st.map(function (s) { var n = d.perStatus[s] || 0; return '<div class="flex items-center gap-3 text-sm"><span class="w-3 h-3 rounded-full" style="background:' + WARNA[s] + '"></span><span class="flex-1">' + s + '</span><b>' + n + '</b></div>'; }).join('') + '</div>') + '</div>' +
      ADM.panel('Pendaftar Terbaru', '<a class="btn btn-ghost btn-sm" href="#/pendaftar">Lihat semua</a>', d.terbaru.length ? '<div class="divide-y divide-line/60">' + d.terbaru.map(function (x) { return '<div class="flex items-center gap-3 py-3"><span class="w-10 h-10 rounded-full bg-brand text-on-brand grid place-items-center font-bold shrink-0">' + esc(x.nama.charAt(0)) + '</span><div class="min-w-0 flex-1"><div class="font-semibold truncate">' + esc(x.nama) + '</div><div class="text-xs text-ink2">' + esc(x.no_pendaftaran) + ' · ' + esc(P.jam(x.tanggal)) + '</div></div>' + ADM.statusBadge(x.status) + '</div>'; }).join('') + '</div>' : ADM.empty('users', 'Belum ada pendaftar'));
  }
  ADM.page({ id: 'dashboard', label: 'Dashboard', ikon: 'layout-dashboard', izin: 'dashboard',
    init: function (el) {
      var b = ADM.boot && ADM.boot.dashboard; el.innerHTML = b ? dashHtml(b) : ADM.skel(5);
      this.muat = function () { P.swr('dashboard', function () { return ADM.call('dashboard'); }, function (d) { el.innerHTML = dashHtml(d); }, 30000).catch(ADM.err); };
    }, show: function () { this.muat(); } });

  // ================= PENDAFTAR =================
  var F = { q: '', status: '', dari: '', sampai: '', hal: 1, per: 25 }, rowsCache = [], pilih = {}, total = 0;
  function key() { return 'pendaftar:p' + F.hal + ':' + [F.q, F.status, F.dari, F.sampai].join('|'); }
  function listHtml() {
    if (!rowsCache.length) return ADM.empty('users', 'Tidak ada pendaftar', 'Ubah filter atau tunggu pendaftar baru.');
    var tbl = '<div class="hidden md:block overflow-x-auto -mx-2"><table class="tbl"><thead><tr><th class="w-10"><input type="checkbox" id="p-all" aria-label="Pilih semua" class="w-4 h-4"></th><th>No.</th><th>Nama</th><th>Kontak</th><th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>' + rowsCache.map(function (r) {
      return '<tr data-no="' + esc(r.no_pendaftaran) + '"><td><input type="checkbox" class="p-sel w-4 h-4" ' + (pilih[r.no_pendaftaran] ? 'checked' : '') + ' aria-label="Pilih ' + esc(r.nama) + '"></td><td class="font-mono text-xs whitespace-nowrap">' + esc(r.no_pendaftaran) + '</td><td class="font-semibold">' + esc(r.nama) + (r.is_dummy === 'TRUE' ? ' <span class="badge b-off">contoh</span>' : '') + '</td><td class="text-ink2 text-xs">' + esc(r.no_hp) + '<br>' + esc(r.email) + '</td><td class="whitespace-nowrap text-ink2">' + esc(P.tgl(r.tanggal, 1)) + '</td><td>' + ADM.statusBadge(r.status) + '</td><td class="text-right"><button class="btn btn-ghost btn-sm p-det">Detail</button></td></tr>'; }).join('') + '</tbody></table></div>';
    var kartu = '<div class="md:hidden grid gap-3">' + rowsCache.map(function (r) {
      return '<div class="rounded-2xl border border-line/60 p-4 bg-surf" data-no="' + esc(r.no_pendaftaran) + '"><div class="flex items-start gap-3"><input type="checkbox" class="p-sel w-5 h-5 mt-1" ' + (pilih[r.no_pendaftaran] ? 'checked' : '') + ' aria-label="Pilih ' + esc(r.nama) + '"><div class="min-w-0 flex-1"><div class="font-bold truncate">' + esc(r.nama) + '</div><div class="text-xs text-ink2 font-mono">' + esc(r.no_pendaftaran) + '</div><div class="text-xs text-ink2 mt-1">' + esc(r.no_hp) + ' · ' + esc(P.tgl(r.tanggal, 1)) + '</div></div>' + ADM.statusBadge(r.status) + '</div><button class="btn btn-ghost btn-sm w-full mt-3 p-det">Lihat detail</button></div>'; }).join('') + '</div>';
    var hal = Math.ceil(total / F.per) || 1;
    return tbl + kartu + '<div class="flex items-center justify-between mt-4 gap-3 flex-wrap"><span class="text-sm text-ink2">' + total + ' pendaftar · halaman ' + F.hal + '/' + hal + '</span><div class="flex gap-2"><button class="btn btn-ghost btn-sm" id="p-prev" ' + (F.hal <= 1 ? 'disabled' : '') + '>' + I('chevron-left') + 'Sebelumnya</button><button class="btn btn-ghost btn-sm" id="p-next" ' + (F.hal >= hal ? 'disabled' : '') + '>Berikutnya' + I('chevron-right') + '</button></div></div>';
  }
  function bulkBar(el) { var n = Object.keys(pilih).length, b = $('#p-bulk', el); b.hidden = !n; $('#p-n', el).textContent = n + ' dipilih'; }
  function renderList(el) { $('#p-list', el).innerHTML = listHtml(); bulkBar(el); }
  function muatList(el, paksa) {
    var k = key(); if (paksa) P.Cache.del(k);
    P.swr(k, function () { return ADM.call('pendaftar.list', F); }, function (r) { rowsCache = r.baris; total = r.total; renderList(el); }, 20000).catch(ADM.err);
  }
  function ubahStatus(el, nos, status, catatan) {
    // optimistic UI: perbarui tampilan dulu, rollback jika gagal
    var lama = JSON.parse(JSON.stringify(rowsCache)); rowsCache.forEach(function (r) { if (nos.indexOf(r.no_pendaftaran) > -1) r.status = status; }); renderList(el);
    return ADM.write('pendaftar.status', { nos: nos, status: status, catatan_publik: catatan }).then(function (r) { P.toast(r.diubah + ' pendaftar → ' + status); P.Cache.del('dashboard'); muatList(el, true); }, function (e) { rowsCache = lama; renderList(el); ADM.err(e); });
  }
  function detail(el, no) {
    var m = P.modal('<div class="skel h-8 w-1/2 mb-4"></div>' + ADM.skel(3), { cls: 'sm:!max-w-2xl' });
    ADM.call('pendaftar.get', { no: no }).then(function (r) {
      var jaw = r.jawaban || {}, rows = [];
      (r.definisi && r.definisi.bagian || []).forEach(function (b) { b.fields.forEach(function (f) { if (jaw[f.id]) rows.push('<div class="flex justify-between gap-4 py-2 border-b border-line/50 text-sm"><span class="text-ink2">' + esc(f.label) + '</span><span class="font-semibold text-right break-words min-w-0">' + esc(jaw[f.id]) + '</span></div>'); }); });
      m.el.querySelector('.modal').innerHTML = '<div class="flex items-start justify-between gap-3 mb-4"><div class="min-w-0"><h3 class="text-xl truncate">' + esc(r.nama) + '</h3><div class="text-xs text-ink2 font-mono">' + esc(r.no_pendaftaran) + ' · ' + esc(P.jam(r.tanggal)) + '</div></div><div class="flex items-center gap-2">' + ADM.statusBadge(r.status) + '<button class="btn-icon" data-close aria-label="Tutup">' + I('x') + '</button></div></div>' +
        '<div class="flex gap-4 mb-4">' + (r.foto_id ? '<div id="pf" class="w-24 h-32 rounded-xl bg-surf3 skel shrink-0"></div>' : '') + '<div class="flex-1 min-w-0">' + rows.join('') + '</div></div>' +
        '<div class="grid gap-3 border-t border-line/60 pt-4"><div><label class="label" for="d-st">Ubah status</label><div class="flex gap-2 flex-wrap">' + ADM.STATUS.map(function (s) { return '<button class="btn btn-sm ' + (s === r.status ? 'btn-primary' : 'btn-ghost') + ' d-st" data-s="' + s + '">' + s + '</button>'; }).join('') + '</div></div>' +
        '<div><label class="label" for="d-pub">Catatan untuk pendaftar (tampil di cek status & notifikasi)</label><input class="field" id="d-pub" maxlength="400" value="' + esc(r.catatan_publik) + '"></div>' +
        '<div><label class="label" for="d-cat">Catatan internal</label><textarea class="field" id="d-cat" maxlength="800">' + esc(r.catatan) + '</textarea></div>' +
        '<div class="flex gap-2 flex-wrap justify-between"><div class="flex gap-2 flex-wrap"><button class="btn btn-primary btn-sm" id="d-simpan">' + I('save') + 'Simpan catatan</button>' + (r.pdf_id ? '<button class="btn btn-ghost btn-sm" id="d-pdf">' + I('file-down') + 'Bukti PDF</button>' : '') + '</div>' + (ADM.user.peran === 'Superadmin' ? '<button class="btn btn-ghost btn-sm !text-danger" id="d-hapus">' + I('trash-2') + 'Hapus</button>' : '') + '</div></div>';
      var mm = m.el;
      if (r.foto_id) ADM.call('pendaftar.foto', { no: no }).then(function (f) { var pf = $('#pf', mm); if (pf) { pf.classList.remove('skel'); pf.innerHTML = '<img class="w-full h-full object-cover rounded-xl" alt="Pas foto ' + esc(r.nama) + '" src="data:' + f.mime + ';base64,' + f.base64 + '">'; } }, function () { var pf = $('#pf', mm); if (pf) pf.remove(); });
      $$('.d-st', mm).forEach(function (b) { b.onclick = function () { m.close(); ubahStatus(el, [no], b.dataset.s, $('#d-pub', mm) ? $('#d-pub', mm).value : ''); }; });
      $('#d-simpan', mm).onclick = function () { var b = this; P.sibuk(b, ADM.write('pendaftar.catatan', { no: no, catatan: $('#d-cat', mm).value }).then(function () { return ADM.write('pendaftar.status', { nos: [no], status: r.status, catatan_publik: $('#d-pub', mm).value }); }).then(function () { P.toast('Catatan disimpan.'); }, ADM.err)); };
      var pd = $('#d-pdf', mm); if (pd) pd.onclick = function () { P.sibuk(pd, ADM.call('pendaftar.pdf', { no: no }).then(function (f) { ADM.unduhB64(f.base64, f.mime, f.nama); }, ADM.err)); };
      var hp = $('#d-hapus', mm); if (hp) hp.onclick = function () { P.konfirmasi('Hapus pendaftar?', 'Data ' + r.nama + ' dihapus permanen.', 'Hapus', 1).then(function (y) { if (!y) return; m.close(); ADM.write('pendaftar.hapus', { no: no }).then(function () { P.toast('Dihapus.'); P.Cache.del('dashboard'); muatList(el, true); }, ADM.err); }); };
    }, function (e) { m.close(); ADM.err(e); });
  }
  ADM.page({ id: 'pendaftar', label: 'Pendaftar', ikon: 'users', izin: 'pendaftar',
    init: function (el) {
      el.innerHTML = ADM.panel('Data Pendaftar', '<button class="btn btn-ghost btn-sm" id="p-xl">' + I('file-spreadsheet') + 'Ekspor Excel</button>',
        '<div class="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-3 mb-4"><div><label class="label" for="f-q">Cari</label><input class="field" id="f-q" type="search" placeholder="Nama, nomor, email, HP"></div>' + ADM.fld('f-st', 'Status', '', { tipe: 'select', opsi: [['', 'Semua status']].concat(ADM.STATUS) }) + ADM.fld('f-dari', 'Dari tanggal', '', { tipe: 'date' }) + ADM.fld('f-sampai', 'Sampai', '', { tipe: 'date' }) + '</div>' +
        '<div id="p-bulk" hidden class="flex items-center gap-2 flex-wrap rounded-2xl bg-brand/10 p-3 mb-4"><b id="p-n" class="text-sm mr-2"></b><span class="text-sm text-ink2">Ubah ke:</span>' + ADM.STATUS.map(function (s) { return '<button class="btn btn-ghost btn-sm p-bs" data-s="' + s + '">' + s + '</button>'; }).join('') + '<button class="btn btn-ghost btn-sm ml-auto" id="p-clr">Batal pilih</button></div><div id="p-list">' + ADM.skel(5) + '</div>');
      var self = this, deb = P.debounce(function () { F.q = $('#f-q', el).value.trim(); F.hal = 1; muatList(el); }, 280);
      $('#f-q', el).oninput = deb; ['f-st:status', 'f-dari:dari', 'f-sampai:sampai'].forEach(function (x) { var p = x.split(':'); $('#' + p[0], el).onchange = function () { F[p[1]] = this.value; F.hal = 1; muatList(el); }; });
      el.addEventListener('click', function (e) {
        var t = e.target.closest('button,input'); if (!t) return;
        var tr = e.target.closest('[data-no]');
        if (t.classList.contains('p-det') && tr) detail(el, tr.dataset.no);
        else if (t.classList.contains('p-sel') && tr) { if (t.checked) pilih[tr.dataset.no] = 1; else delete pilih[tr.dataset.no]; bulkBar(el); }
        else if (t.id === 'p-all') { rowsCache.forEach(function (r) { if (t.checked) pilih[r.no_pendaftaran] = 1; else delete pilih[r.no_pendaftaran]; }); renderList(el); }
        else if (t.id === 'p-clr') { pilih = {}; renderList(el); }
        else if (t.classList.contains('p-bs')) { var nos = Object.keys(pilih), s = t.dataset.s; P.konfirmasi('Ubah status ' + nos.length + ' pendaftar?', 'Status menjadi "' + s + '". Notifikasi akan dikirim sesuai pengaturan.', 'Ubah').then(function (y) { if (y) { pilih = {}; ubahStatus(el, nos, s, ''); } }); }
        else if (t.id === 'p-prev') { F.hal--; muatList(el); } else if (t.id === 'p-next') { F.hal++; muatList(el); }
        else if (t.id === 'p-xl') { P.sibuk(t, ADM.call('pendaftar.ekspor', F).then(function (r) { return ADM.unduhXlsx(r.kolom, r.baris, 'Pendaftar', 'Pendaftar'); }).then(function () { P.toast('Excel diunduh.'); }, ADM.err)); }
      });
    }, show: function (el) { muatList(el); } });

  // ================= LAPORAN =================
  ADM.page({ id: 'laporan', label: 'Laporan', ikon: 'file-spreadsheet', izin: 'laporan',
    init: function (el) {
      el.innerHTML = ADM.panel('Ekspor Laporan Pendaftar', '', '<p class="text-ink2 text-sm mb-4">Unduh data pendaftar dalam format Excel (.xlsx) sesuai filter. Kolom jawaban mengikuti formulir.</p><div class="grid sm:grid-cols-3 gap-3 mb-4">' + ADM.fld('l-st', 'Status', '', { tipe: 'select', opsi: [['', 'Semua status']].concat(ADM.STATUS) }) + ADM.fld('l-dari', 'Dari tanggal', '', { tipe: 'date' }) + ADM.fld('l-sampai', 'Sampai tanggal', '', { tipe: 'date' }) + '</div><button class="btn btn-primary" id="l-go">' + I('download') + 'Unduh Excel</button>') +
        '<div class="mt-5" id="l-ring"></div>';
      $('#l-go', el).onclick = function () { var b = this; P.sibuk(b, ADM.call('pendaftar.ekspor', { status: $('#l-st', el).value, dari: $('#l-dari', el).value, sampai: $('#l-sampai', el).value }).then(function (r) { if (!r.baris.length) throw new Error('Tidak ada data pada filter ini.'); return ADM.unduhXlsx(r.kolom, r.baris, 'Laporan_Pendaftar', 'Pendaftar'); }).then(function () { P.toast('Excel diunduh.'); }, ADM.err)); };
    }, show: function (el) { P.swr('dashboard', function () { return ADM.call('dashboard'); }, function (d) { $('#l-ring', el).innerHTML = ADM.panel('Ringkasan Status', '', '<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">' + ADM.STATUS.map(function (s) { return '<div class="rounded-2xl bg-surf2 p-4 text-center"><div class="text-2xl font-extrabold">' + (d.perStatus[s] || 0) + '</div><div class="text-xs text-ink2">' + s + '</div></div>'; }).join('') + '</div>'); }, 30000).catch(function () { }); } });
})();
