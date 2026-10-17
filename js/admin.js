/* admin.js — cangkang admin: login, router hash (halaman tetap hidup), helper bersama, Dashboard, Pendaftar, Laporan. */
(function (w) {
  'use strict';
  var P = PP, $ = P.$, $$ = P.$$, esc = P.esc, I = P.icon;
  var ADM = w.ADM = { user: null, boot: null, pages: {}, order: [], cur: '', STATUS: ['Baru', 'Diverifikasi', 'Diterima', 'Ditolak', 'Cadangan'] };

  // ---------- helper bersama ----------
  ADM.call = function (a, p, o) { return P.api(a, p || {}, o); };
  ADM.write = function (a, p) { return P.api(a, p || {}, { write: true, retry: 1, timeout: 45000 }); };
  ADM.can = function (m) { return ADM.user && (ADM.user.peran === 'Superadmin' || (ADM.user.izin && ADM.user.izin[m])); };
  ADM.page = function (d) { ADM.pages[d.id] = d; ADM.order.push(d.id); };
  ADM.pubBump = function () { P.Cache.del('pub'); };
  ADM.fld = function (id, label, val, o) {
    o = o || {}; var t = o.tipe || 'text', a = 'id="' + id + '" name="' + id + '"' + (o.req ? ' required' : '') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '');
    var inner;
    if (t === 'area') inner = '<textarea class="field" ' + a + ' rows="' + (o.rows || 4) + '">' + esc(val) + '</textarea>';
    else if (t === 'select') inner = '<select class="field" ' + a + '>' + (o.opsi || []).map(function (x) { var v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return '<option value="' + esc(v) + '" ' + (String(val) === String(v) ? 'selected' : '') + '>' + esc(l) + '</option>'; }).join('') + '</select>';
    else inner = '<input class="field" type="' + t + '" ' + a + ' value="' + esc(val) + '"' + (o.min != null ? ' min="' + o.min + '"' : '') + '>';
    return '<div class="' + (o.cls || '') + '"><label class="label" for="' + id + '">' + esc(label) + (o.req ? ' <span class="text-danger">*</span>' : '') + '</label>' + inner + (o.hint ? '<p class="hint">' + esc(o.hint) + '</p>' : '') + '</div>';
  };
  ADM.read = function (el, ids) { var o = {}; ids.forEach(function (i) { var e = $('#' + i, el); if (e) o[i] = e.type === 'checkbox' ? e.checked : e.value.trim(); }); return o; };
  ADM.statusBadge = function (s) { return '<span class="badge b-' + esc(s) + '">' + esc(s) + '</span>'; };
  ADM.empty = function (ik, t, s) { return '<div class="text-center py-14 text-ink2"><span class="inline-grid place-items-center w-14 h-14 rounded-2xl bg-surf3 mb-3">' + I(ik || 'package', '!w-7 !h-7') + '</span><div class="font-bold text-ink">' + esc(t) + '</div>' + (s ? '<div class="text-sm mt-1">' + esc(s) + '</div>' : '') + '</div>'; };
  ADM.skel = function (n) { var s = ''; for (var i = 0; i < (n || 4); i++) s += '<div class="skel h-16 mb-3"></div>'; return s; };
  ADM.err = function (e) { P.toast(e.message || 'Terjadi kesalahan.', 1); };
  ADM.panel = function (judul, aksi, isi, cls) { return '<section class="card p-5 sm:p-6 ' + (cls || '') + '"><div class="flex items-center justify-between gap-3 flex-wrap mb-4"><h2 class="text-lg">' + esc(judul) + '</h2><div class="flex gap-2 flex-wrap">' + (aksi || '') + '</div></div>' + isi + '</section>'; };
  ADM.loadXlsx = function () {
    if (w.XLSX) return Promise.resolve();
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = res; s.onerror = function () { rej(new Error('Pustaka Excel gagal dimuat. Periksa koneksi.')); }; document.head.appendChild(s); });
  };
  ADM.unduhXlsx = function (kolom, baris, nama, sheet) {
    return ADM.loadXlsx().then(function () {
      var ws = XLSX.utils.aoa_to_sheet([kolom].concat(baris)); ws['!cols'] = kolom.map(function (k, i) { var m = k.length; baris.slice(0, 60).forEach(function (r) { m = Math.max(m, String(r[i] == null ? '' : r[i]).length); }); return { wch: Math.min(40, m + 2) }; });
      var wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, sheet || 'Data'); XLSX.writeFile(wb, nama + '_' + new Date().toISOString().slice(0, 10) + '.xlsx');
    });
  };
  ADM.unduhB64 = function (b64, mime, nama) { var a = document.createElement('a'); a.href = 'data:' + mime + ';base64,' + b64; a.download = nama; document.body.appendChild(a); a.click(); a.remove(); };
  ADM.tabs = function (el, daftar, onPilih, awal) {
    el.innerHTML = daftar.map(function (t) { return '<button type="button" class="tab" role="tab" data-t="' + t[0] + '" aria-selected="false">' + (t[2] ? I(t[2], '!w-4 !h-4') : '') + esc(t[1]) + '</button>'; }).join('');
    function pilih(id) { $$('[data-t]', el).forEach(function (b) { b.setAttribute('aria-selected', b.dataset.t === id); }); onPilih(id); }
    el.addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) pilih(b.dataset.t); }); pilih(awal || daftar[0][0]);
  };

  // ---------- login ----------
  function tampilLogin(pesan) {
    $('#app').hidden = true; $('#login').hidden = false; $('#lg-err').textContent = pesan || '';
    $('#lg-ic').innerHTML = I('moon-star', '!w-6 !h-6'); $('#lg-back').innerHTML = I('arrow-left') + 'Kembali ke situs publik';
    P.api('auth.config', {}, { public: true, retry: 1 }).then(function (c) {
      $('#lg-nama').textContent = c.namaApp || 'Panel Admin';
      if (!c.darurat) $('#f-darurat').parentElement.hidden = true;
      if (!c.googleClientId) { $('#g-btn').innerHTML = '<p class="text-sm text-ink2 text-center">Login Google belum dikonfigurasi. Gunakan login darurat Superadmin, lalu isi Google Client ID di Pengaturan → Kunci & Rahasia.</p>'; return; }
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () {
        google.accounts.id.initialize({ client_id: c.googleClientId, callback: function (r) { masuk('auth.google', { credential: r.credential }); }, ux_mode: 'popup' });
        google.accounts.id.renderButton($('#g-btn'), { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', locale: 'id', width: 320 });
      };
      s.onerror = function () { $('#g-btn').innerHTML = '<p class="text-sm text-danger">Gagal memuat Google Sign-In.</p>'; };
      document.head.appendChild(s);
    }, function (e) { $('#lg-err').textContent = e.message; });
  }
  function masuk(aksi, prm) {
    $('#lg-err').textContent = '';
    return P.api(aksi, prm, { public: true, retry: 1, timeout: 40000 }).then(function (r) {
      P.Sesi.set({ token: r.token, email: r.user.email }); ADM.user = r.user; ADM.boot = r.boot; P.Cache.set('boot', r.boot); mulai();
    }, function (e) { $('#lg-err').textContent = e.message; });
  }
  w.ADM_masuk = masuk;

  // ---------- shell ----------
  function menuHtml() {
    return ADM.order.filter(function (id) { var d = ADM.pages[id]; return !d.izin || ADM.can(d.izin) || (d.super && ADM.user.peran === 'Superadmin'); }).filter(function (id) { var d = ADM.pages[id]; return !d.super || ADM.user.peran === 'Superadmin'; })
      .map(function (id) { var d = ADM.pages[id]; return '<a class="side-link" href="#/' + id + '" data-p="' + id + '">' + I(d.ikon) + esc(d.label) + '</a>'; }).join('');
  }
  function tampilkanChip(d, s) {
    var k = d && d.kuota; if (!k) return;
    $('#chip-periode').textContent = (k.dibuka ? 'Dibuka · ' : 'Ditutup · ') + P.tgl(k.tutup, 1); $('#chip-periode').className = 'badge hidden md:inline-flex ' + (k.dibuka ? 'b-ok' : 'b-off');
    $('#chip-kuota').textContent = 'Kuota ' + k.terisi + '/' + (k.kuota || '∞');
  }
  function mulai() {
    $('#login').hidden = true; $('#app').hidden = false;
    var u = ADM.user, b = ADM.boot || {}, pub = b.publik || {};
    if (pub.pengaturan) { P.terapkanTema(pub.pengaturan); $('#sd-nama').textContent = pub.pengaturan.nama_aplikasi || 'Panel Admin'; }
    $('#sd-ic').innerHTML = I('moon-star', '!w-6 !h-6'); $('#u-nama').textContent = u.nama || u.email; $('#u-peran').textContent = u.peran; $('#avatar').textContent = String(u.nama || u.email || 'A').charAt(0).toUpperCase();
    $('#menu').innerHTML = menuHtml(); $('#lnk-publik').innerHTML = I('external-link') + 'Lihat situs publik'; $('#btn-keluar').innerHTML = I('log-out') + 'Keluar'; $('#burger').innerHTML = I('menu');
    var tm = $('#tema'); function ik() { tm.innerHTML = I(document.documentElement.classList.contains('dark') ? 'sun' : 'moon'); } ik();
    tm.onclick = function () { P.setMode(document.documentElement.classList.contains('dark') ? 'terang' : 'gelap', true); ik(); };
    tampilkanChip(b.dashboard, u); route();
    // prefetch ringan di waktu senggang
    (w.requestIdleCallback || setTimeout)(function () { if (ADM.can('pendaftar')) P.swr('pendaftar:p1:', function () { return ADM.call('pendaftar.list', { hal: 1, per: 25 }); }, null, 120000).catch(function () { }); }, 1500);
  }
  function route() {
    var id = (location.hash.replace(/^#\/?/, '').split('/')[0]) || 'dashboard';
    var d = ADM.pages[id];
    if (!d || (d.izin && !ADM.can(d.izin)) || (d.super && ADM.user.peran !== 'Superadmin')) { id = ADM.order.filter(function (x) { var p = ADM.pages[x]; return (!p.izin || ADM.can(p.izin)) && (!p.super || ADM.user.peran === 'Superadmin'); })[0]; d = ADM.pages[id]; }
    if (!d) return;
    var host = $('#pages'), el = $('#pg-' + id);
    if (!el) { el = document.createElement('div'); el.id = 'pg-' + id; el.hidden = true; host.appendChild(el); d._el = el; d._init = false; }
    $$('#pages > div').forEach(function (x) { x.hidden = x !== el; });
    $$('#menu a').forEach(function (a) { if (a.dataset.p === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#judul-hal').textContent = d.label; document.title = d.label + ' — Admin';
    if (ADM.cur !== id) { el.classList.remove('view'); void el.offsetWidth; el.classList.add('view'); window.scrollTo(0, 0); }
    ADM.cur = id; tutupDrawer();
    if (!d._init) { d._init = true; d.init(el); } if (d.show) d.show(el);
  }
  function bukaDrawer() { $('#side').classList.remove('hidden'); $('#side').classList.add('flex'); $('#scrim').hidden = false; }
  function tutupDrawer() { if (matchMedia('(min-width:1024px)').matches) return; $('#side').classList.add('hidden'); $('#side').classList.remove('flex'); $('#scrim').hidden = true; }
  function keluar(pesan) {
    var tk = P.Sesi.token(); if (tk && !pesan) P.api('auth.logout', {}, { retry: 0 }).catch(function () { });
    P.Sesi.clear(); P.Cache.clearAll(); ADM.user = null; $('#pages').innerHTML = ''; ADM.order.forEach(function (i) { ADM.pages[i]._init = false; }); ADM.cur = ''; tampilLogin(pesan);
  }
  ADM.start = function () {
    P.pantauKoneksi(); P.warm();
    $('#burger').onclick = bukaDrawer; $('#scrim').onclick = tutupDrawer; $('#btn-keluar').onclick = function () { keluar(); };
    w.addEventListener('hashchange', function () { if (ADM.user) route(); });
    P.onAuthExpired(function () { if (ADM.user) keluar('Sesi berakhir. Silakan masuk kembali.'); });
    $('#f-darurat').addEventListener('submit', function (e) { e.preventDefault(); P.sibuk($('button', e.target), masuk('auth.darurat', { email: $('#d-em').value, password: $('#d-pw').value }), 'Masuk…'); });
    var s = P.Sesi.get();
    if (s && s.token) {
      var c = P.Cache.get('boot'); // tampilkan seketika dari cache, verifikasi di latar
      if (c && c.d && c.d.user) { ADM.user = c.d.user; ADM.boot = c.d; mulai(); }
      P.api('admin.boot', {}, { retry: 1 }).then(function (b) { var baru = !ADM.user; ADM.user = b.user; ADM.boot = b; P.Cache.set('boot', b); if (baru) mulai(); else { tampilkanChip(b.dashboard, b.user); P.terapkanTema(b.publik.pengaturan); } },
        function (e) { if (e.code !== 'AUTH') { if (!ADM.user) tampilLogin(e.message); } });
    } else tampilLogin();
  };
})(window);
