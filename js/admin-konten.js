/* admin-konten.js — Formulir (builder), Periode & Kuota, Konten, Pengaturan (tema, umum, rahasia, dummy) */
(function () {
  'use strict';
  var P = PP, $ = P.$, $$ = P.$$, esc = P.esc, I = P.icon;
  function slugId(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30) || 'field'; }

  // ================= FORM BUILDER =================
  var TIPE = [['teks', 'Teks pendek'], ['paragraf', 'Paragraf'], ['angka', 'Angka'], ['email', 'Email'], ['telepon', 'Telepon / WA'], ['tanggal', 'Tanggal'], ['pilihan', 'Pilihan (radio)'], ['dropdown', 'Dropdown'], ['centang', 'Kotak centang'], ['foto', 'Pas foto 4x6']];
  var PERAN = [['', '—'], ['nama', 'Nama pendaftar'], ['email', 'Email kontak'], ['no_hp', 'No. HP / WA']];
  var def = null, versiAktif = '', dirty = false, preview = false, drag = null;
  function builderHtml() {
    if (preview) return '<div class="rounded-2xl border border-dashed border-line p-5 grid gap-6">' + def.bagian.map(function (b) { return '<div><div class="font-bold text-brand dark:text-sec mb-3">' + esc(b.judul) + '</div><div class="grid gap-4">' + b.fields.map(function (f) { return '<div><div class="label">' + esc(f.label) + (f.wajib ? ' <span class="text-danger">*</span>' : '') + '</div>' + (f.tipe === 'paragraf' ? '<div class="field !min-h-[72px] opacity-60"></div>' : f.tipe === 'foto' ? '<div class="w-20 h-28 rounded-xl border border-dashed border-line grid place-items-center text-ink2">' + I('image') + '</div>' : (f.opsi && f.opsi.length ? '<div class="flex gap-2 flex-wrap">' + f.opsi.map(function (o) { return '<span class="badge b-off">' + esc(o) + '</span>'; }).join('') + '</div>' : '<div class="field opacity-60"></div>')) + '</div>'; }).join('') + '</div></div>'; }).join('') + '</div>';
    return def.bagian.map(function (b, bi) {
      return '<div class="rounded-2xl border border-line/70 p-4 mb-4 bg-surf2/50" data-bi="' + bi + '"><div class="flex items-center gap-2 mb-3"><input class="field !font-bold b-judul" value="' + esc(b.judul) + '" aria-label="Judul bagian" maxlength="100"><button class="btn-icon b-up" aria-label="Naikkan bagian">' + I('arrow-up') + '</button><button class="btn-icon b-dn" aria-label="Turunkan bagian">' + I('arrow-down') + '</button><button class="btn-icon b-del !text-danger" aria-label="Hapus bagian">' + I('trash-2') + '</button></div>' +
        b.fields.map(function (f, fi) {
          var opsi = (f.tipe === 'pilihan' || f.tipe === 'dropdown' || f.tipe === 'centang');
          return '<div class="rounded-xl bg-surf border border-line/60 p-3 mb-2" draggable="true" data-fi="' + fi + '"><div class="flex items-center gap-2"><span class="cursor-grab text-ink2 p-1" title="Seret untuk memindah">' + I('grip-vertical') + '</span><input class="field f-label" value="' + esc(f.label) + '" aria-label="Label field" maxlength="150"><button class="btn-icon f-up" aria-label="Naikkan">' + I('chevron-up') + '</button><button class="btn-icon f-dn" aria-label="Turunkan">' + I('chevron-down') + '</button><button class="btn-icon f-del !text-danger" aria-label="Hapus field">' + I('x') + '</button></div>' +
            '<div class="grid sm:grid-cols-[1fr_1fr_auto] gap-2 mt-2 items-center"><select class="field f-tipe" aria-label="Tipe field">' + TIPE.map(function (t) { return '<option value="' + t[0] + '" ' + (t[0] === f.tipe ? 'selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select><select class="field f-peran" aria-label="Peran data">' + PERAN.map(function (t) { return '<option value="' + t[0] + '" ' + (t[0] === (f.peran || '') ? 'selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select><label class="flex items-center gap-2 min-h-[44px] text-sm font-semibold"><input type="checkbox" class="f-wajib w-4 h-4" ' + (f.wajib ? 'checked' : '') + '>Wajib</label></div>' +
            (opsi ? '<textarea class="field mt-2 f-opsi" rows="2" placeholder="Satu opsi per baris" aria-label="Opsi">' + esc((f.opsi || []).join('\n')) + '</textarea>' : '') + '</div>'; }).join('') +
        '<button class="btn btn-ghost btn-sm b-add mt-1">' + I('plus') + 'Tambah field</button></div>'; }).join('') + '<button class="btn btn-ghost" id="b-sec">' + I('plus') + 'Tambah bagian</button>';
  }
  function bangun(el) { $('#fb-body', el).innerHTML = builderHtml(); $('#fb-ver', el).textContent = 'Versi aktif: v' + versiAktif + (dirty ? ' · ada perubahan belum diterbitkan' : ''); $('#fb-pub', el).disabled = !dirty; $('#fb-pv', el).innerHTML = preview ? I('pencil') + 'Kembali edit' : I('eye') + 'Pratinjau'; }
  function sync(el) { // baca input → def
    $$('[data-bi]', el).forEach(function (bs) {
      var b = def.bagian[+bs.dataset.bi]; b.judul = $('.b-judul', bs).value;
      $$('[data-fi]', bs).forEach(function (fs) {
        var f = b.fields[+fs.dataset.fi]; f.label = $('.f-label', fs).value; f.tipe = $('.f-tipe', fs).value; f.peran = $('.f-peran', fs).value || undefined; f.wajib = $('.f-wajib', fs).checked;
        var o = $('.f-opsi', fs); if (o) f.opsi = o.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); else if (!/pilihan|dropdown|centang/.test(f.tipe)) delete f.opsi;
      });
    });
  }
  function pindah(arr, a, b) { if (b < 0 || b >= arr.length) return; var x = arr.splice(a, 1)[0]; arr.splice(b, 0, x); }
  function muatForm(el) {
    P.swr('form', function () { return ADM.call('form.get'); }, function (r) {
      if (dirty) return; versiAktif = r.aktif ? r.aktif.versi : '-'; def = r.aktif ? JSON.parse(JSON.stringify(r.aktif.definisi)) : { judul: 'Formulir Pendaftaran', bagian: [{ id: 's1', judul: 'Data Calon Santri', fields: [] }] };
      $('#fb-judul', el).value = def.judul || ''; bangun(el);
      $('#fb-vers', el).innerHTML = r.versi.map(function (v) { return '<div class="flex items-center justify-between gap-3 py-2 border-b border-line/50 text-sm"><span><b>v' + esc(v.versi) + '</b> · ' + esc(P.jam(v.diubah_pada)) + '</span>' + (v.status === 'Aktif' ? '<span class="badge b-ok">Aktif</span>' : '<button class="btn btn-ghost btn-sm v-pulih" data-v="' + esc(v.versi) + '">' + I('undo-2') + 'Pulihkan</button>') + '</div>'; }).join('');
    }, 20000).catch(ADM.err);
  }
  ADM.page({ id: 'formulir', label: 'Form Pendaftaran', ikon: 'square-pen', izin: 'formulir',
    init: function (el) {
      el.innerHTML = '<div class="grid xl:grid-cols-[2fr_1fr] gap-5"><div>' + ADM.panel('Pembuat Formulir', '<span class="text-sm text-ink2 self-center" id="fb-ver"></span><button class="btn btn-ghost btn-sm" id="fb-pv"></button><button class="btn btn-primary btn-sm" id="fb-pub" disabled>' + I('save') + 'Terbitkan versi baru</button>',
        '<div class="mb-4"><label class="label" for="fb-judul">Judul formulir</label><input class="field" id="fb-judul" maxlength="120"></div><div id="fb-body">' + ADM.skel(3) + '</div>') + '</div>' + ADM.panel('Riwayat Versi', '', '<p class="text-xs text-ink2 mb-3">Perubahan membuat versi baru; data pendaftar lama tetap membaca versi aslinya.</p><div id="fb-vers"></div>') + '</div>';
      el.addEventListener('input', function (e) { if (preview) return; dirty = true; $('#fb-pub', el).disabled = false; $('#fb-ver', el).textContent = 'Versi aktif: v' + versiAktif + ' · ada perubahan belum diterbitkan'; });
      el.addEventListener('change', function (e) { if (e.target.classList.contains('f-tipe')) { sync(el); bangun(el); } });
      el.addEventListener('click', function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.id === 'fb-pv') { if (!preview) sync(el); preview = !preview; bangun(el); return; }
        if (t.id === 'fb-pub') { sync(el); def.judul = $('#fb-judul', el).value; P.sibuk(t, ADM.write('form.simpan', { definisi: def }).then(function (r) { dirty = false; versiAktif = r.versi; ADM.pubBump(); P.Cache.del('form'); P.toast('Formulir v' + r.versi + ' diterbitkan.'); muatForm(el); }, ADM.err), 'Menerbitkan…'); return; }
        if (t.classList.contains('v-pulih')) { P.konfirmasi('Pulihkan versi ' + t.dataset.v + '?', 'Versi ini menjadi formulir aktif.', 'Pulihkan').then(function (y) { if (y) ADM.write('form.pulihkan', { versi: t.dataset.v }).then(function () { dirty = false; ADM.pubBump(); P.Cache.del('form'); P.toast('Dipulihkan.'); muatForm(el); }, ADM.err); }); return; }
        var bs = t.closest('[data-bi]'), fs = t.closest('[data-fi]'); if (t.id === 'b-sec') { sync(el); def.bagian.push({ id: 's' + P.uid(), judul: 'Bagian Baru', fields: [] }); dirty = true; bangun(el); return; }
        if (!bs) return; sync(el); var bi = +bs.dataset.bi, b = def.bagian[bi], fi = fs ? +fs.dataset.fi : -1;
        if (t.classList.contains('b-up')) pindah(def.bagian, bi, bi - 1); else if (t.classList.contains('b-dn')) pindah(def.bagian, bi, bi + 1);
        else if (t.classList.contains('b-del')) { if (def.bagian.length < 2) return P.toast('Minimal satu bagian.', 1); def.bagian.splice(bi, 1); }
        else if (t.classList.contains('b-add')) { var ids = {}; def.bagian.forEach(function (x) { x.fields.forEach(function (f) { ids[f.id] = 1; }); }); var id = 'field_' + (Object.keys(ids).length + 1); while (ids[id]) id += '_'; b.fields.push({ id: id, tipe: 'teks', label: 'Field baru', wajib: false }); }
        else if (t.classList.contains('f-up')) pindah(b.fields, fi, fi - 1); else if (t.classList.contains('f-dn')) pindah(b.fields, fi, fi + 1);
        else if (t.classList.contains('f-del')) b.fields.splice(fi, 1); else return;
        dirty = true; bangun(el);
      });
      // seret & lepas (field)
      el.addEventListener('dragstart', function (e) { var f = e.target.closest && e.target.closest('[data-fi]'); if (!f) return; drag = { bi: +f.closest('[data-bi]').dataset.bi, fi: +f.dataset.fi }; e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', 'f'); } catch (x) { } });
      el.addEventListener('dragover', function (e) { if (drag && e.target.closest('[data-fi]')) e.preventDefault(); });
      el.addEventListener('drop', function (e) {
        var f = e.target.closest('[data-fi]'); if (!drag || !f) return; e.preventDefault(); sync(el);
        var tb = +f.closest('[data-bi]').dataset.bi, tf = +f.dataset.fi, x = def.bagian[drag.bi].fields.splice(drag.fi, 1)[0]; def.bagian[tb].fields.splice(tf, 0, x); drag = null; dirty = true; bangun(el);
      });
    }, show: function (el) { muatForm(el); } });

  // ================= PERIODE =================
  ADM.page({ id: 'periode', label: 'Periode & Kuota', ikon: 'calendar-days', izin: 'periode',
    init: function (el) {
      el.innerHTML = '<div class="max-w-2xl">' + ADM.panel('Periode Pendaftaran & Kuota', '', '<div id="pr-body">' + ADM.skel(2) + '</div>') + '</div>';
      this.muat = function () { P.swr('pub', function () { return ADM.call('public.bootstrap', {}); }, function (d) {
        var s = d.pengaturan, k = d.kuota;
        $('#pr-body', el).innerHTML = '<div class="rounded-2xl p-4 mb-5 text-sm ' + (k.dibuka ? 'bg-sec/15' : 'bg-gold/15') + '"><b>' + (k.dibuka ? 'Pendaftaran dibuka' : 'Pendaftaran ditutup') + '</b> — terisi ' + k.terisi + ' dari ' + (k.kuota || '∞') + (k.alasan ? ' · ' + esc(k.alasan) : '') + '</div><form id="pr-f" class="grid sm:grid-cols-2 gap-4" novalidate>' + ADM.fld('buka', 'Tanggal buka', s.periode_buka, { tipe: 'date' }) + ADM.fld('tutup', 'Tanggal tutup', s.periode_tutup, { tipe: 'date' }) + ADM.fld('kuota', 'Kuota (0 = tanpa batas)', s.kuota, { tipe: 'number', min: 0 }) + ADM.fld('tahun', 'Tahun ajaran', s.tahun_ajaran, { max: 20 }) + '<div class="sm:col-span-2"><button class="btn btn-primary" type="submit">' + I('save') + 'Simpan</button></div></form>';
        $('#pr-f', el).onsubmit = function (e) { e.preventDefault(); var v = ADM.read(el, ['buka', 'tutup', 'kuota', 'tahun']); P.sibuk($('button', e.target), ADM.write('periode.simpan', { buka: v.buka, tutup: v.tutup, kuota: v.kuota, tahun_ajaran: v.tahun }).then(function () { ADM.pubBump(); P.Cache.del('dashboard'); P.toast('Periode disimpan.'); }, ADM.err)); };
      }, 15000).catch(ADM.err); };
    }, show: function () { this.muat(); } });

  // ================= KONTEN =================
  var KV = {
    beranda: { nama: 'Beranda', f: [['judul', 'Judul utama'], ['subjudul', 'Sub-judul', 'area'], ['cta_label', 'Label tombol'], ['foto_hero', 'URL foto hero', 'url', 'Tautan gambar (Google Drive "siapa saja dengan tautan" atau URL langsung).'], ['stat1_angka', 'Statistik 1 — angka'], ['stat1_label', 'Statistik 1 — label'], ['stat2_angka', 'Statistik 2 — angka'], ['stat2_label', 'Statistik 2 — label'], ['stat3_angka', 'Statistik 3 — angka'], ['stat3_label', 'Statistik 3 — label'], ['stat4_angka', 'Statistik 4 — angka'], ['stat4_label', 'Statistik 4 — label']] },
    profil: { nama: 'Profil', f: [['sejarah', 'Sejarah', 'area'], ['visi', 'Visi', 'area'], ['misi', 'Misi (pisahkan dengan titik koma ;)', 'area'], ['pimpinan', 'Nama pimpinan'], ['foto_pimpinan', 'URL foto pimpinan', 'url']] },
    kontak: { nama: 'Kontak', f: [['alamat', 'Alamat', 'area'], ['telepon', 'Telepon'], ['whatsapp', 'WhatsApp (08…)'], ['email', 'Email', 'email'], ['jam', 'Jam layanan'], ['maps_embed', 'URL embed Google Maps', 'url', 'Dari Google Maps → Bagikan → Sematkan peta → salin nilai src (https://www.google.com/maps/embed?…).'], ['instagram', 'URL Instagram', 'url'], ['youtube', 'URL YouTube', 'url'], ['facebook', 'URL Facebook', 'url']] }
  };
  var AKTIF = ['Aktif', 'Nonaktif'];
  var LIST = {
    Program: { nama: 'Program', judul: 'nama', f: [['nama', 'Nama program', 'text', 1], ['deskripsi', 'Deskripsi', 'area'], ['ikon', 'Ikon', 'select', ['menu_book', 'auto_stories', 'translate', 'science', 'groups', 'storefront', 'school']], ['status', 'Status', 'select', AKTIF]] },
    Fasilitas: { nama: 'Fasilitas', judul: 'nama', f: [['nama', 'Nama fasilitas', 'text', 1], ['badge', 'Label (opsional)'], ['deskripsi', 'Deskripsi', 'area'], ['foto', 'URL foto', 'url'], ['status', 'Status', 'select', AKTIF]] },
    Prestasi: { nama: 'Prestasi', judul: 'judul', f: [['judul', 'Nama prestasi', 'text', 1], ['tahun', 'Tahun'], ['tingkat', 'Tingkat'], ['lokasi', 'Lokasi'], ['deskripsi', 'Deskripsi', 'area'], ['foto', 'URL foto', 'url'], ['status', 'Status', 'select', AKTIF]] },
    Berita: { nama: 'Berita', judul: 'judul', f: [['judul', 'Judul', 'text', 1], ['kategori', 'Kategori'], ['tanggal_terbit', 'Tanggal terbit', 'date'], ['ringkasan', 'Ringkasan', 'area'], ['isi', 'Isi berita (boleh HTML sederhana: p, b, i, ul, li, a)', 'area10'], ['foto', 'URL foto', 'url'], ['penulis', 'Penulis'], ['status', 'Status', 'select', ['Draft', 'Terbit']]] },
    Kegiatan: { nama: 'Kegiatan', judul: 'judul', f: [['judul', 'Nama kegiatan', 'text', 1], ['kategori', 'Kategori'], ['tanggal', 'Tanggal', 'date'], ['jam', 'Jam'], ['lokasi', 'Lokasi'], ['deskripsi', 'Deskripsi', 'area'], ['status', 'Status', 'select', AKTIF]] },
    Biaya: { nama: 'Biaya', judul: 'komponen', f: [['komponen', 'Komponen biaya', 'text', 1], ['nominal', 'Nominal (Rp)', 'number'], ['satuan', 'Satuan (mis. per bulan)'], ['keterangan', 'Keterangan'], ['jenjang', 'Jenjang'], ['status', 'Status', 'select', AKTIF]] }
  };
  function formFields(defs, v, pre) {
    return defs.map(function (x) {
      var id = (pre || 'k_') + x[0], t = x[2] || 'text', o = { req: x[3] === 1, hint: typeof x[3] === 'string' ? x[3] : '' };
      if (t === 'area') o.tipe = 'area'; else if (t === 'area10') { o.tipe = 'area'; o.rows = 8; } else if (t === 'select') { o.tipe = 'select'; o.opsi = x[3]; o.req = 0; o.hint = ''; } else if (t === 'url') o.tipe = 'url'; else if (t === 'date' || t === 'number' || t === 'email') o.tipe = t;
      return ADM.fld(id, x[1], v[x[0]] == null ? '' : v[x[0]], o);
    }).join('');
  }
  function bacaFields(defs, el, pre) { var o = {}; defs.forEach(function (x) { var e = $('#' + (pre || 'k_') + x[0], el); if (e) o[x[0]] = e.value.trim(); }); return o; }

  function kvPane(host, kunci) {
    var c = KV[kunci]; host.innerHTML = ADM.skel(3);
    P.swr('kv:' + kunci, function () { return ADM.call('kv.get', { seksi: c.nama }); }, function (v) {
      host.innerHTML = '<form class="grid sm:grid-cols-2 gap-4" novalidate>' + formFields(c.f, v).replace(/<div class="">/g, '<div>') + '<div class="sm:col-span-2"><button class="btn btn-primary" type="submit">' + I('save') + 'Simpan ' + c.nama + '</button></div></form>';
      $$('textarea', host).forEach(function (t) { t.parentElement.classList.add('sm:col-span-2'); });
      $('form', host).onsubmit = function (e) { e.preventDefault(); P.sibuk($('button', e.target), ADM.write('kv.simpan', { seksi: c.nama, data: bacaFields(c.f, host) }).then(function (r) { P.Cache.set('kv:' + kunci, r); ADM.pubBump(); P.toast(c.nama + ' tersimpan.'); }, ADM.err)); };
    }, 20000).catch(ADM.err);
  }
  function listPane(host, nama) {
    var c = LIST[nama], rows = [];
    function gambar() {
      host.innerHTML = '<div class="flex justify-between items-center mb-4 flex-wrap gap-2"><span class="text-sm text-ink2">' + rows.length + ' item</span><button class="btn btn-primary btn-sm" id="li-add">' + I('plus') + 'Tambah ' + c.nama + '</button></div>' +
        (rows.length ? '<div class="grid gap-2">' + rows.map(function (r, i) { return '<div class="flex items-center gap-2 rounded-2xl border border-line/60 p-3 bg-surf" data-id="' + esc(r.id) + '"><div class="flex flex-col"><button class="btn-icon !w-8 !h-8 li-up" aria-label="Naikkan" ' + (i === 0 ? 'disabled' : '') + '>' + I('chevron-up', '!w-4 !h-4') + '</button><button class="btn-icon !w-8 !h-8 li-dn" aria-label="Turunkan" ' + (i === rows.length - 1 ? 'disabled' : '') + '>' + I('chevron-down', '!w-4 !h-4') + '</button></div><div class="min-w-0 flex-1"><div class="font-semibold truncate">' + esc(r[c.judul]) + (r.is_dummy === 'TRUE' ? ' <span class="badge b-off">contoh</span>' : '') + '</div><div class="text-xs text-ink2 truncate">' + esc(nama === 'Biaya' ? P.rupiah(r.nominal) : (r.kategori || r.tahun || r.badge || r.tanggal || '')) + '</div></div><span class="badge ' + (r.status === 'Aktif' || r.status === 'Terbit' ? 'b-ok' : 'b-off') + '">' + esc(r.status) + '</span><button class="btn-icon li-ed" aria-label="Ubah">' + I('pencil') + '</button><button class="btn-icon li-del !text-danger" aria-label="Hapus">' + I('trash-2') + '</button></div>'; }).join('') + '</div>' : ADM.empty('package', 'Belum ada ' + c.nama.toLowerCase(), 'Klik "Tambah" untuk membuat yang pertama.'));
    }
    function edit(r) {
      r = r || {}; var m = P.modal('<div class="flex justify-between items-center mb-4"><h3 class="text-xl">' + (r.id ? 'Ubah ' : 'Tambah ') + c.nama + '</h3><button class="btn-icon" data-close aria-label="Tutup">' + I('x') + '</button></div><form class="grid gap-4" novalidate>' + formFields(c.f, r, 'm_') + '<button class="btn btn-primary" type="submit">' + I('save') + 'Simpan</button></form>');
      $('form', m.el).onsubmit = function (e) { e.preventDefault(); var d = bacaFields(c.f, m.el, 'm_'); if (r.id) d.id = r.id; if (!d[c.judul]) return P.toast('Isian utama wajib diisi.', 1);
        P.sibuk($('button[type=submit]', m.el), ADM.write('konten.simpan', { seksi: nama, data: d }).then(function () { m.close(); ADM.pubBump(); P.toast('Tersimpan.'); muat(true); }, ADM.err)); };
    }
    function muat(paksa) { if (paksa) P.Cache.del('list:' + nama); P.swr('list:' + nama, function () { return ADM.call('konten.list', { seksi: nama }); }, function (r) { rows = r; gambar(); }, 20000).catch(ADM.err); }
    host.innerHTML = ADM.skel(4); muat();
    host.onclick = function (e) {
      var t = e.target.closest('button'); if (!t) return; if (t.id === 'li-add') return edit(); var row = t.closest('[data-id]'); if (!row) return; var i = rows.findIndex(function (x) { return x.id === row.dataset.id; });
      if (t.classList.contains('li-ed')) edit(rows[i]);
      else if (t.classList.contains('li-del')) P.konfirmasi('Hapus ' + c.nama.toLowerCase() + '?', '"' + rows[i][c.judul] + '" akan dihapus permanen.', 'Hapus', 1).then(function (y) { if (!y) return; var lama = rows.slice(); rows.splice(i, 1); gambar(); ADM.write('konten.hapus', { seksi: nama, id: row.dataset.id }).then(function () { ADM.pubBump(); P.Cache.set('list:' + nama, rows); P.toast('Dihapus.'); }, function (er) { rows = lama; gambar(); ADM.err(er); }); });
      else if (t.classList.contains('li-up') || t.classList.contains('li-dn')) { var j = t.classList.contains('li-up') ? i - 1 : i + 1; var x = rows[i]; rows[i] = rows[j]; rows[j] = x; gambar(); ADM.write('konten.urut', { seksi: nama, ids: rows.map(function (r) { return r.id; }) }).then(function () { ADM.pubBump(); P.Cache.set('list:' + nama, rows); }, function (er) { muat(true); ADM.err(er); }); }
    };
  }
  var SEKSI = [['beranda', 'Beranda'], ['profil', 'Profil'], ['kontak', 'Kontak'], ['Program', 'Program'], ['Fasilitas', 'Fasilitas'], ['Prestasi', 'Prestasi'], ['Berita', 'Berita'], ['Kegiatan', 'Kegiatan'], ['Biaya', 'Biaya'], ['susunan', 'Susunan Halaman']];
  var NM = { beranda: 'Beranda', profil: 'Profil', prestasi: 'Prestasi', fasilitas: 'Fasilitas', program: 'Program', berita: 'Berita', kegiatan: 'Kegiatan', biaya: 'Biaya', kontak: 'Kontak', pendaftaran: 'Pendaftaran (ajakan)' };
  function susunanPane(host) {
    host.innerHTML = ADM.skel(4);
    P.swr('pub', function () { return ADM.call('public.bootstrap', {}); }, function (d) {
      var ur = String(d.pengaturan.urutan_section || '').split(',').filter(Boolean), sb = String(d.pengaturan.section_tersembunyi || '').split(',').filter(Boolean);
      Object.keys(NM).forEach(function (k) { if (ur.indexOf(k) < 0) ur.push(k); });
      function g() { host.innerHTML = '<p class="text-sm text-ink2 mb-4">Atur urutan dan tampil/sembunyikan bagian pada halaman publik.</p><div class="grid gap-2 mb-4">' + ur.map(function (k, i) { var h = sb.indexOf(k) > -1; return '<div class="flex items-center gap-2 rounded-2xl border border-line/60 p-3 bg-surf ' + (h ? 'opacity-60' : '') + '" data-k="' + k + '"><div class="flex flex-col"><button class="btn-icon !w-8 !h-8 s-up" aria-label="Naikkan" ' + (i === 0 ? 'disabled' : '') + '>' + I('chevron-up', '!w-4 !h-4') + '</button><button class="btn-icon !w-8 !h-8 s-dn" aria-label="Turunkan" ' + (i === ur.length - 1 ? 'disabled' : '') + '>' + I('chevron-down', '!w-4 !h-4') + '</button></div><span class="font-semibold flex-1">' + NM[k] + '</span>' + (k === 'beranda' ? '<span class="badge b-off">selalu tampil</span>' : '<button class="btn btn-ghost btn-sm s-eye" aria-pressed="' + !h + '">' + I(h ? 'eye-off' : 'eye') + (h ? 'Tersembunyi' : 'Tampil') + '</button>') + '</div>'; }).join('') + '</div><button class="btn btn-primary" id="s-save">' + I('save') + 'Simpan susunan</button>'; }
      g();
      host.onclick = function (e) { var t = e.target.closest('button'); if (!t) return; var row = t.closest('[data-k]'), k = row && row.dataset.k, i = ur.indexOf(k);
        if (t.classList.contains('s-up') || t.classList.contains('s-dn')) { var j = t.classList.contains('s-up') ? i - 1 : i + 1, x = ur[i]; ur[i] = ur[j]; ur[j] = x; g(); }
        else if (t.classList.contains('s-eye')) { var p = sb.indexOf(k); if (p > -1) sb.splice(p, 1); else sb.push(k); g(); }
        else if (t.id === 's-save') P.sibuk(t, ADM.write('susunan.simpan', { urutan: ur.join(','), tersembunyi: sb.join(',') }).then(function () { ADM.pubBump(); P.toast('Susunan disimpan.'); }, ADM.err)); };
    }, 15000).catch(ADM.err);
  }
  ADM.page({ id: 'konten', label: 'Konten Situs', ikon: 'newspaper', izin: 'konten',
    init: function (el) {
      el.innerHTML = '<div class="card p-3 mb-4 overflow-x-auto"><div class="flex gap-1" id="kt-tabs" role="tablist"></div></div><div class="card p-5 sm:p-6" id="kt-body"></div>';
      ADM.tabs($('#kt-tabs', el), SEKSI.map(function (s) { return [s[0], s[1]]; }), function (id) { var h = $('#kt-body', el); h.onclick = null; if (KV[id]) kvPane(h, id); else if (LIST[id]) listPane(h, id); else susunanPane(h); });
    } });

  // ================= PENGATURAN =================
  var PRESET = [['Hijau Klasik', '#14532D', '#3FB57A', '#D9A441'], ['Hijau Zamrud', '#065F46', '#34D399', '#F59E0B'], ['Biru Laut', '#0F4C81', '#38BDF8', '#F4B740'], ['Marun Hangat', '#7A1F2B', '#E07A5F', '#E9C46A']];
  function temaPane(host, s) {
    var st = { mode: s.mode_tema || 'sistem', p: s.warna_primer || '#14532D', s: s.warna_sekunder || '#3FB57A', a: s.warna_aksen || '#D9A441', r: s.radius || '20', b: s.glass_blur || '18', o: s.glass_opacity || '72' };
    function pv() { var x = $('#tv', host); if (!x) return; x.style.setProperty('--b', st.p); x.style.setProperty('--s', st.s); x.style.setProperty('--a', st.a); x.style.setProperty('--r', st.r + 'px'); x.style.setProperty('--bl', st.b + 'px'); x.style.setProperty('--o', (st.o / 100)); }
    function gambar() {
      host.innerHTML = '<div class="grid xl:grid-cols-[1.2fr_1fr] gap-6"><div class="grid gap-6"><div><div class="label">Mode tampilan publik</div><div class="grid grid-cols-3 gap-2" role="radiogroup">' + [['terang', 'Terang', 'sun'], ['gelap', 'Gelap', 'moon'], ['sistem', 'Ikuti sistem', 'monitor']].map(function (m) { return '<button type="button" role="radio" aria-checked="' + (st.mode === m[0]) + '" data-mode="' + m[0] + '" class="rounded-2xl border-2 p-3 min-h-[76px] grid place-items-center gap-1 text-sm font-semibold ' + (st.mode === m[0] ? 'border-sec bg-sec/10' : 'border-line') + '">' + I(m[2]) + m[1] + '</button>'; }).join('') + '</div></div>' +
        '<div><div class="label">Preset warna</div><div class="flex gap-2 flex-wrap">' + PRESET.map(function (p, i) { return '<button type="button" class="btn btn-ghost btn-sm" data-preset="' + i + '"><span class="flex">' + [p[1], p[2], p[3]].map(function (c) { return '<i class="w-4 h-4 rounded-full -ml-1 first:ml-0 border border-white" style="background:' + c + '"></i>'; }).join('') + '</span>' + p[0] + '</button>'; }).join('') + '</div></div>' +
        '<div class="grid sm:grid-cols-3 gap-3">' + [['p', 'Warna utama'], ['s', 'Warna sekunder'], ['a', 'Warna aksen']].map(function (c) { return '<div><label class="label" for="h-' + c[0] + '">' + c[1] + '</label><div class="flex gap-2"><input type="color" value="' + st[c[0]] + '" data-pick="' + c[0] + '" class="w-11 h-11 rounded-xl border border-line p-1 bg-surf shrink-0" aria-label="Pilih ' + c[1] + '"><input class="field font-mono uppercase" id="h-' + c[0] + '" maxlength="7" value="' + st[c[0]] + '" data-hex="' + c[0] + '"></div></div>'; }).join('') + '</div>' +
        '<div class="grid sm:grid-cols-3 gap-3">' + ADM.fld('t-r', 'Radius kartu', st.r, { tipe: 'select', opsi: [['12', '12 px · tegas'], ['16', '16 px'], ['20', '20 px · default'], ['28', '28 px · lembut']] }) + '<div><label class="label" for="t-b">Blur kaca: ' + st.b + 'px</label><input id="t-b" type="range" min="0" max="30" value="' + st.b + '" class="w-full accent-[rgb(var(--brand))] min-h-[44px]"></div><div><label class="label" for="t-o">Opasitas kaca: ' + st.o + '%</label><input id="t-o" type="range" min="40" max="95" value="' + st.o + '" class="w-full accent-[rgb(var(--brand))] min-h-[44px]"></div></div>' +
        '<div><button class="btn btn-primary" id="t-save">' + I('save') + 'Simpan tema</button></div></div>' +
        '<div><div class="label">Pratinjau langsung</div><div id="tv" class="rounded-3xl p-5 relative overflow-hidden" style="background:linear-gradient(135deg,var(--b),#0B2E22);min-height:300px"><div class="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-30" style="background:var(--s)"></div><div class="relative p-4 text-ink" style="background:rgba(255,255,255,var(--o));backdrop-filter:blur(var(--bl));-webkit-backdrop-filter:blur(var(--bl));border-radius:var(--r);border:1px solid rgba(255,255,255,.5)"><div class="font-extrabold text-lg mb-1" style="color:var(--b)">Pondok Pesantren</div><p class="text-sm text-[#404941] mb-3">Contoh kartu kaca dengan tombol dan lencana.</p><div class="flex gap-2 flex-wrap"><span class="px-4 py-2 rounded-full text-sm font-bold text-white" style="background:var(--b)">Daftar</span><span class="px-4 py-2 rounded-full text-sm font-bold" style="background:var(--a);color:#2a1c00">Cek Status</span><span class="px-3 py-2 rounded-full text-xs font-bold text-white" style="background:var(--s)">Dibuka</span></div></div></div></div></div>';
      pv();
    }
    gambar();
    host.onclick = function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.mode) { st.mode = t.dataset.mode; gambar(); } else if (t.dataset.preset) { var p = PRESET[+t.dataset.preset]; st.p = p[1]; st.s = p[2]; st.a = p[3]; gambar(); }
      else if (t.id === 't-save') P.sibuk(t, ADM.write('pengaturan.simpan', { data: { mode_tema: st.mode, warna_primer: st.p, warna_sekunder: st.s, warna_aksen: st.a, radius: st.r, glass_blur: st.b, glass_opacity: st.o } }).then(function () { ADM.pubBump(); P.terapkanTema({ warna_primer: st.p, warna_sekunder: st.s, warna_aksen: st.a, radius: st.r, glass_blur: st.b, glass_opacity: st.o }); P.toast('Tema disimpan. Situs publik akan memakai tema baru.'); }, ADM.err));
    };
    host.oninput = function (e) {
      var t = e.target;
      if (t.dataset.pick) { st[t.dataset.pick] = t.value.toUpperCase(); $('#h-' + t.dataset.pick, host).value = st[t.dataset.pick]; pv(); }
      else if (t.dataset.hex) { if (/^#[0-9a-fA-F]{6}$/.test(t.value)) { st[t.dataset.hex] = t.value.toUpperCase(); $('[data-pick=' + t.dataset.hex + ']', host).value = st[t.dataset.hex]; pv(); } }
      else if (t.id === 't-b') { st.b = t.value; t.previousElementSibling.textContent = 'Blur kaca: ' + t.value + 'px'; pv(); } else if (t.id === 't-o') { st.o = t.value; t.previousElementSibling.textContent = 'Opasitas kaca: ' + t.value + '%'; pv(); } else if (t.id === 't-r') { st.r = t.value; pv(); }
    };
    host.onchange = function (e) { if (e.target.id === 't-r') { st.r = e.target.value; pv(); } };
  }
  function umumPane(host, s) {
    host.innerHTML = '<form class="grid sm:grid-cols-2 gap-4 max-w-3xl" novalidate>' + ADM.fld('u-nama', 'Nama aplikasi / pesantren', s.nama_aplikasi, { req: 1, cls: 'sm:col-span-2', max: 80 }) + ADM.fld('u-tag', 'Tagline', s.tagline, { cls: 'sm:col-span-2', max: 200 }) + '<div class="sm:col-span-2"><button class="btn btn-primary" type="submit">' + I('save') + 'Simpan</button></div></form>';
    $('form', host).onsubmit = function (e) { e.preventDefault(); P.sibuk($('button', e.target), ADM.write('pengaturan.simpan', { data: { nama_aplikasi: $('#u-nama', host).value.trim(), tagline: $('#u-tag', host).value.trim() } }).then(function () { ADM.pubBump(); P.toast('Disimpan.'); }, ADM.err)); };
  }
  function rahasiaPane(host) {
    host.innerHTML = ADM.skel(3);
    ADM.call('rahasia.status').then(function (r) {
      host.innerHTML = '<p class="text-sm text-ink2 mb-4 max-w-2xl">Nilai disimpan aman di Script Properties server — tidak pernah ada di kode atau repo. Nilai rahasia hanya ditampilkan tersamar.</p><div class="grid gap-3 max-w-2xl">' + r.map(function (k) {
        return '<div class="rounded-2xl border border-line/60 p-4"><div class="flex items-center justify-between gap-2 mb-2"><label class="label !mb-0" for="r-' + k.kunci + '">' + esc(k.label) + '</label><span class="badge ' + (k.terisi ? 'b-ok' : 'b-warn') + '">' + (k.terisi ? 'Terisi' : 'Kosong') + '</span></div><div class="flex gap-2"><input class="field" id="r-' + k.kunci + '" ' + (k.rahasia ? 'type="password" autocomplete="new-password"' : 'type="text"') + ' placeholder="' + esc(k.terisi ? k.nilai : 'Belum diisi') + '"><button class="btn btn-primary btn-sm self-center r-save" data-k="' + k.kunci + '">Simpan</button></div></div>'; }).join('') + '</div>';
      host.onclick = function (e) { var b = e.target.closest('.r-save'); if (!b) return; var inp = $('#r-' + b.dataset.k, host); P.sibuk(b, ADM.write('rahasia.simpan', { kunci: b.dataset.k, nilai: inp.value }).then(function () { P.toast('Disimpan.'); rahasiaPane(host); }, ADM.err)); };
    }, ADM.err);
  }
  function sandiPane(host) {
    host.innerHTML = '<form class="grid gap-4 max-w-md" novalidate><p class="text-sm text-ink2">Sandi darurat memungkinkan Superadmin masuk jika Google Login bermasalah. Minimal 10 karakter, kombinasi huruf & angka. Setelah 5 kali salah, login dikunci 15 menit.</p>' + ADM.fld('sd-1', 'Sandi darurat baru', '', { tipe: 'password', req: 1 }) + ADM.fld('sd-2', 'Ulangi sandi', '', { tipe: 'password', req: 1 }) + '<button class="btn btn-primary" type="submit">' + I('key-round') + 'Ubah sandi darurat</button></form>';
    $('form', host).onsubmit = function (e) { e.preventDefault(); var a = $('#sd-1', host).value, b = $('#sd-2', host).value; if (a !== b) return P.toast('Sandi tidak sama.', 1); P.sibuk($('button', e.target), ADM.write('sandi.darurat', { password: a }).then(function () { $('#sd-1', host).value = ''; $('#sd-2', host).value = ''; P.toast('Sandi darurat diperbarui.'); }, ADM.err)); };
  }
  function dummyPane(host) {
    host.innerHTML = ADM.skel(2);
    ADM.call('dummy.hitung').then(function (h) {
      var n = Object.keys(h).reduce(function (s, k) { return s + h[k]; }, 0);
      host.innerHTML = n ? '<p class="text-ink2 mb-4 max-w-2xl">Data contoh dibuat otomatis saat setup agar tampilan tidak kosong. Hapus seluruhnya dengan satu klik sebelum go-live. Konten Beranda/Profil/Kontak tetap ada namun ditandai bukan contoh — silakan ganti isinya.</p><div class="flex gap-2 flex-wrap mb-5">' + Object.keys(h).map(function (k) { return '<span class="badge b-warn">' + k + ': ' + h[k] + '</span>'; }).join('') + '</div><button class="btn btn-danger" id="dm">' + I('trash-2') + 'Hapus semua data contoh</button>' : ADM.empty('circle-check', 'Tidak ada data contoh', 'Sistem sudah bersih.');
      var b = $('#dm', host); if (b) b.onclick = function () { P.konfirmasi('Hapus semua data contoh?', 'Pendaftar, berita, program, dan item lain bertanda contoh dihapus permanen.', 'Ya, hapus', 1).then(function (y) { if (y) P.sibuk(b, ADM.write('dummy.hapus').then(function () { P.Cache.clearAll(); P.toast('Data contoh dihapus.'); dummyPane(host); }, ADM.err)); }); };
    }, ADM.err);
  }
  ADM.page({ id: 'pengaturan', label: 'Pengaturan', ikon: 'settings', izin: 'pengaturan',
    init: function (el) {
      el.innerHTML = '<div class="card p-3 mb-4 overflow-x-auto"><div class="flex gap-1" id="pg-tabs" role="tablist"></div></div><div class="card p-5 sm:p-6" id="pg-body"></div>';
      var su = ADM.user.peran === 'Superadmin', tabs = [['tema', 'Tema & Tampilan', 'palette'], ['umum', 'Umum', 'settings']].concat(su ? [['rahasia', 'Kunci & Rahasia', 'lock'], ['sandi', 'Sandi Darurat', 'key-round'], ['dummy', 'Data Contoh', 'trash-2']] : []);
      ADM.tabs($('#pg-tabs', el), tabs, function (id) {
        var h = $('#pg-body', el); h.onclick = h.oninput = h.onchange = null; h.innerHTML = ADM.skel(3);
        if (id === 'tema' || id === 'umum') ADM.call('pengaturan.get').then(function (s) { (id === 'tema' ? temaPane : umumPane)(h, s); }, ADM.err);
        else if (id === 'rahasia') rahasiaPane(h); else if (id === 'sandi') sandiPane(h); else dummyPane(h);
      });
    } });
})();
