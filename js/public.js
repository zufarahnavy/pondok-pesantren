/* public.js — landing page SPA: render dari cache lalu segarkan di latar (SWR), router hash, form dinamis, cek status. */
(function () {
  'use strict';
  var P = PP, $ = P.$, $$ = P.$$, esc = P.esc, I = P.icon, D = null; // D = data bootstrap
  var ORDER_DEF = ['beranda', 'profil', 'prestasi', 'fasilitas', 'program', 'berita', 'kegiatan', 'biaya', 'kontak', 'pendaftaran'];
  var NAMA = { beranda: 'Beranda', profil: 'Profil', prestasi: 'Prestasi', fasilitas: 'Fasilitas', program: 'Program', berita: 'Berita', kegiatan: 'Kegiatan', biaya: 'Biaya', kontak: 'Kontak', pendaftaran: 'Pendaftaran' };
  var IKON_PRG = { menu_book: 'book-open', auto_stories: 'library', translate: 'languages', science: 'flask-conical', groups: 'users', storefront: 'store', school: 'graduation-cap' };
  var hash0 = '';

  // ---------- sanitasi HTML berita (whitelist) ----------
  var OK_TAG = { P: 1, BR: 1, B: 1, STRONG: 1, I: 1, EM: 1, U: 1, UL: 1, OL: 1, LI: 1, H2: 1, H3: 1, H4: 1, A: 1, BLOCKQUOTE: 1, IMG: 1, SPAN: 1, DIV: 1 };
  function bersihHtml(html) {
    var t = document.createElement('template'); t.innerHTML = String(html || '');
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 8) { c.remove(); return; }
        if (c.nodeType !== 1) return;
        if (!OK_TAG[c.tagName]) { c.replaceWith(document.createTextNode(c.textContent)); return; }
        Array.prototype.slice.call(c.attributes).forEach(function (a) {
          var nm = a.name.toLowerCase();
          if (!(nm === 'href' || nm === 'src' || nm === 'alt' || nm === 'title') || ((nm === 'href' || nm === 'src') && !/^(https?:|mailto:|tel:|#)/i.test(a.value))) c.removeAttribute(a.name);
        });
        if (c.tagName === 'A') { c.setAttribute('rel', 'noopener noreferrer'); c.setAttribute('target', '_blank'); }
        if (c.tagName === 'IMG') c.setAttribute('loading', 'lazy');
        walk(c);
      });
    })(t.content);
    return t.innerHTML;
  }

  // ---------- tampilan ----------
  function ph(i, kelas) { return '<div class="' + (kelas || 'aspect-[4/3]') + ' w-full bg-gradient-to-br from-brand to-brand-deep grid place-items-center text-white/70">' + I(i || 'image', '!w-10 !h-10') + '</div>'; }
  function img(u, alt, kelas, ikon) { u = P.gambar(u); return u ? '<img src="' + esc(u) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" class="' + (kelas || 'aspect-[4/3]') + ' w-full object-cover" onerror="this.outerHTML=this.dataset.fb" data-fb="' + esc(ph(ikon, kelas)) + '">' : ph(ikon, kelas); }
  function head(eyebrow, judul, sub, terang) {
    return '<div class="max-w-2xl mb-10"><span class="eyebrow ' + (terang ? '!text-gold' : '') + '">' + I('sparkles', '!w-4 !h-4') + esc(eyebrow) + '</span><h2 class="h-section mt-3 ' + (terang ? 'text-white' : '') + '">' + esc(judul) + '</h2>' + (sub ? '<p class="mt-3 ' + (terang ? 'text-white/80' : 'text-ink2') + ' text-lg">' + esc(sub) + '</p>' : '') + '</div>';
  }
  function sec(id, cls, inner) { return '<section id="s-' + id + '" class="py-16 sm:py-24 scroll-mt-[68px] ' + (cls || '') + '"><div class="wrap">' + inner + '</div></section>'; }

  var R = {
    beranda: function () {
      var b = D.beranda, k = D.kuota, fh = P.gambar(b.foto_hero);
      var st = [1, 2, 3, 4].map(function (i) { return b['stat' + i + '_angka'] ? '<div class="text-center px-2"><div class="text-3xl sm:text-4xl font-extrabold text-brand dark:text-sec">' + esc(b['stat' + i + '_angka']) + '</div><div class="text-sm text-ink2 font-medium mt-1">' + esc(b['stat' + i + '_label']) + '</div></div>' : ''; }).join('');
      return '<section id="s-beranda" class="relative overflow-hidden bg-brand-deep text-white -mt-px">' +
        (fh ? '<img src="' + esc(fh) + '" alt="" class="absolute inset-0 w-full h-full object-cover opacity-30" fetchpriority="high">' : '') +
        '<div class="absolute inset-0" style="background:radial-gradient(circle at 80% 20%,rgb(var(--sec)/.28),transparent 45%),linear-gradient(135deg,rgb(var(--brand-deep)) 30%,rgb(var(--brand)) 100%);opacity:.92"></div>' +
        '<svg class="absolute -right-24 -top-24 w-[520px] h-[520px] text-white/5" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".6"><circle cx="50" cy="50" r="48"/><circle cx="50" cy="50" r="36"/><path d="M50 2l10 38 38 10-38 10-10 38-10-38L2 50l38-10z"/></g></svg>' +
        '<div class="wrap relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center py-20 sm:py-28 lg:py-32 pb-32 sm:pb-40">' +
        '<div><span class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-gold">' + I('badge-check', '!w-4 !h-4') + 'Tahun Ajaran ' + esc(D.pengaturan.tahun_ajaran || '') + '</span>' +
        '<h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1]">' + esc(b.judul || D.pengaturan.nama_aplikasi) + '</h1>' +
        '<p class="mt-5 text-lg sm:text-xl text-white/85 max-w-2xl leading-relaxed">' + esc(b.subjudul || D.pengaturan.tagline) + '</p>' +
        '<div class="mt-8 flex flex-wrap gap-3"><a href="#/daftar" class="btn btn-gold !min-h-[52px] !px-7 text-base">' + esc(b.cta_label || 'Daftar Sekarang') + I('arrow-right') + '</a><a href="#/status" class="btn !min-h-[52px] !px-7 text-base bg-white/10 text-white hover:bg-white/20">' + I('scan-search') + 'Cek Status Seleksi</a></div></div>' +
        '<div class="glass-2 !bg-white/10 !border-white/20 rounded-app p-6 text-white hidden lg:block"><div class="flex items-center gap-3 mb-4"><span class="w-11 h-11 rounded-xl bg-gold/20 text-gold grid place-items-center">' + I('calendar-days') + '</span><div><div class="text-sm text-white/70">Periode Pendaftaran</div><div class="font-bold">' + esc(P.tgl(k.buka, 1)) + ' – ' + esc(P.tgl(k.tutup, 1)) + '</div></div></div>' +
        '<div class="rounded-2xl bg-black/20 p-4"><div class="flex justify-between text-sm mb-2"><span>Kuota terisi</span><b>' + k.terisi + ' / ' + (k.kuota || '∞') + '</b></div><div class="h-2 rounded-full bg-white/15 overflow-hidden"><div class="h-full bg-gold rounded-full" style="width:' + (k.kuota ? Math.min(100, Math.round(k.terisi / k.kuota * 100)) : 0) + '%"></div></div></div>' +
        '<div class="mt-4 text-sm font-semibold ' + (k.dibuka ? 'text-sec' : 'text-gold') + '">' + (k.dibuka ? '● Pendaftaran sedang dibuka' : esc(k.alasan)) + '</div></div></div></section>' +
        (st ? '<div class="wrap relative z-10 -mt-16 sm:-mt-20"><div class="glass-2 rounded-app shadow-lift grid grid-cols-2 lg:grid-cols-4 gap-y-6 py-7 divide-line/40 lg:divide-x">' + st + '</div></div>' : '');
    },
    profil: function () {
      var p = D.profil, misi = String(p.misi || '').split(';').map(function (x) { return x.trim(); }).filter(Boolean);
      return sec('profil', '', head('Profil', 'Mengenal Pesantren Kami', '') + '<div class="grid lg:grid-cols-2 gap-8"><div class="card p-7"><h3 class="text-xl mb-3">Sejarah Singkat</h3><p class="text-ink2 leading-relaxed">' + esc(p.sejarah) + '</p>' + (p.pimpinan ? '<div class="mt-5 flex items-center gap-3 rounded-2xl bg-surf2 p-4"><span class="w-11 h-11 rounded-full bg-brand text-on-brand grid place-items-center">' + I('user') + '</span><div><div class="text-xs text-ink2">Pimpinan Pondok</div><div class="font-bold">' + esc(p.pimpinan) + '</div></div></div>' : '') + '</div>' +
        '<div class="grid gap-6"><div class="card p-7 border-l-4 !border-l-gold"><h3 class="text-xl mb-2 flex items-center gap-2">' + I('flag', 'text-gold') + 'Visi</h3><p class="text-ink2 leading-relaxed">' + esc(p.visi) + '</p></div><div class="card p-7"><h3 class="text-xl mb-3 flex items-center gap-2">' + I('rocket', 'text-sec-ink') + 'Misi</h3><ul class="grid gap-2">' + misi.map(function (m) { return '<li class="flex gap-2.5 text-ink2">' + I('circle-check', 'text-sec-ink mt-0.5') + '<span>' + esc(m) + '</span></li>'; }).join('') + '</ul></div></div></div>');
    },
    program: function () {
      return sec('program', 'bg-surf2', head('Program', 'Program Unggulan', 'Kurikulum terpadu untuk membentuk ilmu, akhlak, dan keterampilan.') + '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">' + D.program.map(function (x) {
        return '<article class="card card-hover p-6"><span class="w-12 h-12 rounded-2xl bg-brand/10 text-brand dark:text-sec grid place-items-center mb-4">' + I(IKON_PRG[x.ikon] || 'book-open') + '</span><h3 class="text-lg mb-2">' + esc(x.nama) + '</h3><p class="text-ink2 text-[15px] leading-relaxed">' + esc(x.deskripsi) + '</p></article>'; }).join('') + '</div>');
    },
    fasilitas: function () {
      var ik = ['building-2', 'school', 'library', 'flask-conical', 'dumbbell', 'heart-pulse'];
      return sec('fasilitas', '', head('Fasilitas', 'Lingkungan Belajar yang Nyaman', 'Sarana lengkap untuk menunjang ibadah, belajar, dan pertumbuhan santri.') + '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">' + D.fasilitas.map(function (x, i) {
        return '<article class="card card-hover overflow-hidden">' + '<div class="relative">' + img(x.foto, x.nama, 'aspect-[16/10]', ik[i % 6]) + (x.badge ? '<span class="absolute top-3 left-3 badge bg-gold text-[#2a1c00]">' + esc(x.badge) + '</span>' : '') + '</div><div class="p-5"><h3 class="text-lg mb-1">' + esc(x.nama) + '</h3><p class="text-ink2 text-[15px]">' + esc(x.deskripsi) + '</p></div></article>'; }).join('') + '</div>');
    },
    prestasi: function () {
      return sec('prestasi', 'bg-brand-deep text-white relative overflow-hidden', head('Prestasi', 'Kebanggaan Santri Kami', 'Capaian di tingkat daerah hingga nasional.', 1) + '<div class="grid md:grid-cols-3 gap-5">' + D.prestasi.map(function (x) {
        return '<article class="rounded-app bg-white/[.07] border border-white/10 p-6 hover:bg-white/10 transition-colors"><div class="flex items-center justify-between mb-5"><span class="w-12 h-12 rounded-2xl bg-gold/20 text-gold grid place-items-center">' + I('trophy') + '</span><span class="badge bg-gold/20 text-gold">' + esc(x.tingkat) + '</span></div><h3 class="text-lg text-white mb-2">' + esc(x.judul) + '</h3><p class="text-white/70 text-sm mb-3">' + esc(x.deskripsi) + '</p><div class="text-sm text-white/60 flex gap-4"><span class="flex items-center gap-1.5">' + I('calendar', '!w-4 !h-4') + esc(x.tahun) + '</span>' + (x.lokasi ? '<span class="flex items-center gap-1.5">' + I('map-pin', '!w-4 !h-4') + esc(x.lokasi) + '</span>' : '') + '</div></article>'; }).join('') + '</div>');
    },
    berita: function () {
      return sec('berita', 'bg-surf2', head('Berita', 'Kabar Terbaru', '') + '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">' + D.berita.slice(0, 6).map(function (x) {
        return '<a href="#/berita/' + esc(x.id) + '" class="card card-hover overflow-hidden block">' + img(x.foto, x.judul, 'aspect-[16/10]', 'newspaper') + '<div class="p-5"><div class="flex items-center gap-2 text-xs text-ink2 mb-2"><span class="badge b-ok">' + esc(x.kategori || 'Berita') + '</span>' + esc(P.tgl(x.tanggal_terbit, 1)) + '</div><h3 class="text-lg mb-2 line-clamp-2">' + esc(x.judul) + '</h3><p class="text-ink2 text-[15px] line-clamp-3">' + esc(x.ringkasan) + '</p></div></a>'; }).join('') + '</div>');
    },
    kegiatan: function () {
      return sec('kegiatan', '', head('Kegiatan', 'Agenda Kegiatan', 'Kegiatan rutin dan agenda mendatang.') + '<div class="grid md:grid-cols-3 gap-5">' + D.kegiatan.slice(0, 6).map(function (x) {
        var t = new Date(x.tanggal + 'T00:00:00');
        return '<article class="card card-hover p-5 flex gap-4"><div class="shrink-0 w-16 h-20 rounded-2xl bg-brand text-on-brand grid place-items-center text-center leading-tight"><div><div class="text-2xl font-extrabold">' + (isNaN(t) ? '–' : t.getDate()) + '</div><div class="text-xs uppercase opacity-80">' + (isNaN(t) ? '' : t.toLocaleDateString('id-ID', { month: 'short' })) + '</div></div></div><div class="min-w-0"><span class="badge b-warn mb-2">' + esc(x.kategori) + '</span><h3 class="text-base mb-1">' + esc(x.judul) + '</h3><div class="text-sm text-ink2 grid gap-1"><span class="flex items-center gap-1.5">' + I('clock', '!w-4 !h-4') + esc(x.jam) + ' WIB</span><span class="flex items-center gap-1.5">' + I('map-pin', '!w-4 !h-4') + esc(x.lokasi) + '</span></div></div></article>'; }).join('') + '</div>');
    },
    biaya: function () {
      var tot = D.biaya.reduce(function (s, x) { return s + (Number(x.nominal) || 0); }, 0);
      return sec('biaya', 'bg-surf2', head('Biaya', 'Rincian Biaya Pendidikan', 'Transparan dan terjangkau.') + '<div class="card overflow-hidden max-w-3xl"><div class="divide-y divide-line/60">' + D.biaya.map(function (x) {
        return '<div class="flex items-center justify-between gap-4 p-5"><div class="flex items-center gap-3 min-w-0"><span class="w-10 h-10 rounded-xl bg-gold/20 text-gold grid place-items-center shrink-0">' + I('wallet') + '</span><div class="min-w-0"><div class="font-bold">' + esc(x.komponen) + '</div><div class="text-sm text-ink2">' + esc(x.satuan) + (x.keterangan ? ' · ' + esc(x.keterangan) : '') + '</div></div></div><div class="font-extrabold text-brand dark:text-sec whitespace-nowrap">' + P.rupiah(x.nominal) + '</div></div>'; }).join('') + '</div><div class="p-5 bg-brand text-on-brand flex items-center justify-between"><span class="font-semibold">Total (jika semua komponen dihitung)</span><b class="text-lg">' + P.rupiah(tot) + '</b></div></div>');
    },
    pendaftaran: function () {
      var k = D.kuota;
      return '<section id="s-pendaftaran" class="py-16 sm:py-20 scroll-mt-[68px]"><div class="wrap"><div class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-brand to-brand-deep text-white p-8 sm:p-14 grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center"><div><span class="eyebrow !text-gold">' + I('ticket-check', '!w-4 !h-4') + 'Penerimaan Santri Baru</span><h2 class="h-section mt-3 text-white">Wujudkan Pendidikan Terbaik untuk Putra-Putri Anda</h2><p class="mt-3 text-white/80 text-lg">' + (k.dibuka ? 'Pendaftaran dibuka hingga ' + esc(P.tgl(k.tutup)) + '. Sisa kuota ' + k.sisa + ' santri.' : esc(k.alasan)) + '</p></div><div class="grid gap-3"><a href="#/daftar" class="btn btn-gold !min-h-[52px] text-base">' + I('square-pen') + 'Isi Formulir Pendaftaran</a><a href="#/status" class="btn bg-white/10 text-white hover:bg-white/20 !min-h-[52px] text-base">' + I('scan-search') + 'Cek Status Seleksi</a></div></div></div></section>';
    },
    kontak: function () {
      var k = D.kontak, m = String(k.maps_embed || ''), embed = /^https:\/\/www\.google\.com\/maps\/embed/.test(m) ? m : '';
      var q = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(k.alamat || '');
      function r(i, t, v, href) { return v ? '<li class="flex gap-3"><span class="w-11 h-11 rounded-xl bg-brand/10 text-brand dark:text-sec grid place-items-center shrink-0">' + I(i) + '</span><div class="min-w-0"><div class="text-xs text-ink2">' + t + '</div>' + (href ? '<a class="font-semibold hover:underline break-words" href="' + esc(href) + '">' + esc(v) + '</a>' : '<div class="font-semibold break-words">' + esc(v) + '</div>') + '</div></li>' : ''; }
      return sec('kontak', '', head('Kontak', 'Hubungi Kami', 'Tim kami siap membantu pertanyaan Anda.') + '<div class="grid lg:grid-cols-2 gap-6"><div class="card p-6 sm:p-8"><ul class="grid gap-5">' + r('map-pin', 'Alamat', k.alamat, q) + r('phone', 'Telepon', k.telepon, 'tel:' + String(k.telepon || '').replace(/[^\d+]/g, '')) + r('message-circle', 'WhatsApp', k.whatsapp, 'https://wa.me/' + waNo(k.whatsapp)) + r('mail', 'Email', k.email, 'mailto:' + k.email) + r('clock', 'Jam layanan', k.jam) + '</ul></div>' +
        '<div class="card overflow-hidden min-h-[320px]">' + (embed ? '<iframe src="' + esc(embed) + '" title="Lokasi pesantren" class="w-full h-full min-h-[320px] border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' : '<div class="h-full min-h-[320px] grid place-items-center text-center p-8 bg-surf2"><div>' + I('map-pin', '!w-12 !h-12 text-brand dark:text-sec mx-auto') + '<p class="mt-3 text-ink2 mb-4">' + esc(k.alamat) + '</p><a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' + esc(q) + '">Buka di Google Maps</a></div></div>') + '</div></div>');
    }
  };
  function waNo(v) { var s = String(v || '').replace(/[^\d]/g, ''); return s.indexOf('0') === 0 ? '62' + s.slice(1) : s; }

  function urutan() {
    var u = String((D.pengaturan || {}).urutan_section || '').split(',').filter(function (x) { return ORDER_DEF.indexOf(x) > -1; });
    ORDER_DEF.forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); });
    var sembunyi = String((D.pengaturan || {}).section_tersembunyi || '').split(',');
    return u.filter(function (x) { return sembunyi.indexOf(x) < 0; });
  }
  function adaIsi(s) { var d = D; if (['prestasi', 'fasilitas', 'program', 'berita', 'kegiatan', 'biaya'].indexOf(s) > -1) return d[s].length > 0; return true; }

  var lastSig = '';
  function renderHome() {
    var set = D.pengaturan, ur = urutan().filter(adaIsi);
    var sig = JSON.stringify(D); if (sig === lastSig) return; lastSig = sig;
    $('#home-in').innerHTML = ur.map(function (s) { return R[s] ? R[s]() : ''; }).join('');
    var nav = ur.filter(function (s) { return s !== 'pendaftaran'; });
    $('#nav').innerHTML = nav.map(function (s) { return '<a href="#/" data-go="' + s + '" class="px-3 min-h-[44px] inline-flex items-center rounded-full text-sm font-semibold text-ink2 hover:text-ink hover:bg-surf3">' + NAMA[s] + '</a>'; }).join('');
    $('#mnav-in').innerHTML = nav.map(function (s) { return '<a href="#/" data-go="' + s + '" class="btn btn-ghost !justify-start">' + NAMA[s] + '</a>'; }).join('') + '<a href="#/daftar" class="btn btn-primary col-span-2">Daftar Sekarang</a><a href="#/status" class="btn btn-ghost col-span-2">Cek Status Seleksi</a>';
    $('#nama-app').textContent = set.nama_aplikasi || 'Pondok Pesantren';
    document.title = (set.nama_aplikasi || 'Pondok Pesantren') + ' — Penerimaan Santri Baru';
    renderFoot(); var wa = waNo((D.kontak || {}).whatsapp), f = $('#fab-wa'); if (wa) { f.hidden = false; f.href = 'https://wa.me/' + wa; f.innerHTML = I('message-circle', '!w-7 !h-7'); } else f.hidden = true;
  }
  function renderFoot() {
    var k = D.kontak, s = D.pengaturan;
    $('#foot').innerHTML = '<div class="bg-brand-deep text-white/80 pt-14 pb-8"><div class="wrap grid md:grid-cols-2 lg:grid-cols-4 gap-8"><div><div class="font-extrabold text-white text-lg mb-3">' + esc(s.nama_aplikasi) + '</div><p class="text-sm leading-relaxed">' + esc(s.tagline) + '</p></div>' +
      '<div><h4 class="text-white mb-3">Tautan Cepat</h4><ul class="grid gap-2 text-sm"><li><a class="hover:text-white" href="#/" data-go="profil">Profil & Sejarah</a></li><li><a class="hover:text-white" href="#/" data-go="program">Program Unggulan</a></li><li><a class="hover:text-white" href="#/daftar">Pendaftaran Santri Baru</a></li><li><a class="hover:text-white" href="#/status">Cek Status Seleksi</a></li></ul></div>' +
      '<div><h4 class="text-white mb-3">Kontak</h4><ul class="grid gap-2 text-sm"><li>' + esc(k.alamat) + '</li><li>' + esc(k.telepon) + '</li><li>' + esc(k.email) + '</li></ul></div>' +
      '<div><h4 class="text-white mb-3">Media Sosial</h4><div class="flex gap-2">' + [['instagram', 'instagram'], ['youtube', 'youtube'], ['facebook', 'facebook']].map(function (x) { return k[x[0]] ? '<a class="w-11 h-11 rounded-full bg-white/10 grid place-items-center hover:bg-sec" aria-label="' + x[0] + '" target="_blank" rel="noopener noreferrer" href="' + esc(P.safeUrl(k[x[0]])) + '">' + I(x[1]) + '</a>' : ''; }).join('') + '</div></div></div>' +
      '<div class="wrap mt-10 pt-6 border-t border-white/10 text-sm flex flex-col sm:flex-row justify-between gap-2"><span>© ' + new Date().getFullYear() + ' ' + esc(s.nama_aplikasi) + '. Hak cipta dilindungi.</span><a class="hover:text-white" href="admin.html">Masuk Admin</a></div></div>';
  }

  // ---------- Router ----------
  var VIEWS = ['home', 'daftar', 'status', 'berita'];
  var cur = '';
  function show(v) { if (v === cur) return; cur = v; VIEWS.forEach(function (x) { var e = $('#v-' + x); if (e) e.hidden = x !== v; }); var e = $('#v-' + v); if (e) { e.classList.remove('view'); void e.offsetWidth; e.classList.add('view'); } $('#mnav').classList.add('hidden'); $('#burger').setAttribute('aria-expanded', 'false'); }
  var pendingScroll = '', lastHash = null;
  function scrollKe(id) { var e = $('#s-' + id) || (id === 'beranda' ? $('#top') : null); if (id === 'beranda') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; } if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  function route() {
    var h = location.hash.replace(/^#\/?/, ''), p = h.split('/'), baru = h !== lastHash; lastHash = h;
    var sc = function () { if (baru) window.scrollTo(0, 0); };
    if (p[0] === 'daftar') { show('daftar'); renderDaftar(); sc(); }
    else if (p[0] === 'status') { show('status'); renderStatus(); sc(); }
    else if (p[0] === 'berita' && p[1]) { show('berita'); renderBerita(p[1]); sc(); }
    else { show('home'); if (baru && !pendingScroll && lastHash !== null && h === '') { /* kembali ke beranda */ } if (pendingScroll) { var s = pendingScroll; pendingScroll = ''; requestAnimationFrame(function () { scrollKe(s); }); } }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-go]'); if (!a) return; var id = a.getAttribute('data-go');
    if (!D) return; e.preventDefault();
    var onHome = !$('#v-home').hidden; $('#mnav').classList.add('hidden');
    if (onHome) scrollKe(id); else { pendingScroll = id; location.hash = '#/'; }
  });
  window.addEventListener('hashchange', route);

  // ---------- Pendaftaran ----------
  var formSig = '';
  function renderDaftar() {
    var box = $('#v-daftar'), k = D.kuota, f = D.form;
    var sig = JSON.stringify([f, k.dibuka, k.alasan]); if (sig === formSig && box.innerHTML) return; formSig = sig;
    if (!f) { box.innerHTML = '<div class="wrap py-20 text-center text-ink2">Formulir belum tersedia.</div>'; return; }
    var draft = {}; try { draft = JSON.parse(P.LS.getItem('pp:draft') || '{}'); } catch (e) { }
    var tutup = !k.dibuka;
    box.innerHTML = '<div class="wrap py-10 sm:py-16 max-w-3xl"><a href="#/" class="inline-flex items-center gap-2 text-sm font-semibold text-ink2 mb-6 min-h-[44px]">' + I('arrow-left') + 'Kembali ke beranda</a>' +
      '<div id="form-card" class="card p-6 sm:p-10"><h1 class="text-3xl mb-1">' + esc(f.definisi.judul || 'Formulir Pendaftaran') + '</h1><p class="text-ink2 mb-6">Tahun ajaran ' + esc(D.pengaturan.tahun_ajaran) + ' · Sisa kuota ' + k.sisa + '</p>' +
      (tutup ? '<div class="rounded-2xl bg-gold/15 text-ink p-4 mb-6 flex gap-3">' + I('triangle-alert', 'text-gold shrink-0') + '<span>' + esc(k.alasan) + '</span></div>' : '') +
      '<form id="frm" novalidate class="grid gap-8">' + f.definisi.bagian.map(function (b) {
        return '<fieldset class="grid gap-5"><legend class="text-lg font-bold mb-1 text-brand dark:text-sec">' + esc(b.judul) + '</legend>' + b.fields.map(function (x) { return fieldHtml(x, draft[x.id]); }).join('') + '</fieldset>'; }).join('') +
      '<div class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-2"><button type="submit" class="btn btn-primary !min-h-[52px] text-base" ' + (tutup ? 'disabled' : '') + '>' + I('send') + 'Kirim Pendaftaran</button></div></form></div></div>';
    var frm = $('#frm'); frm.addEventListener('submit', submitDaftar);
    frm.addEventListener('input', P.debounce(function () { var o = {}; new FormData(frm).forEach(function (v, k2) { if (typeof v === 'string') o[k2] = v; }); P.LS.setItem('pp:draft', JSON.stringify(o)); }, 400));
    var inp = $('input[type=file]', frm); if (inp) inp.addEventListener('change', pratinjauFoto);
  }
  function fieldHtml(x, v) {
    v = v == null ? '' : v; var id = 'f_' + x.id, req = x.wajib ? ' <span class="text-danger" aria-hidden="true">*</span>' : '', lab = '<label class="label" for="' + id + '">' + esc(x.label) + req + '</label>', base = 'id="' + id + '" name="' + esc(x.id) + '"' + (x.wajib ? ' required' : '');
    var t = x.tipe, out;
    if (t === 'paragraf') out = '<textarea class="field" ' + base + '>' + esc(v) + '</textarea>';
    else if (t === 'pilihan') out = '<div class="grid sm:grid-cols-2 gap-2" role="radiogroup">' + (x.opsi || []).map(function (o, i) { return '<label class="flex items-center gap-3 min-h-[44px] px-4 rounded-xl border border-line cursor-pointer has-[:checked]:border-sec has-[:checked]:bg-sec/10"><input type="radio" name="' + esc(x.id) + '" value="' + esc(o) + '" ' + (v === o ? 'checked' : '') + ' class="w-4 h-4 accent-[rgb(var(--brand))]">' + esc(o) + '</label>'; }).join('') + '</div>';
    else if (t === 'dropdown') out = '<select class="field" ' + base + '><option value="">Pilih…</option>' + (x.opsi || []).map(function (o) { return '<option ' + (v === o ? 'selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select>';
    else if (t === 'centang') out = '<div class="grid sm:grid-cols-2 gap-2">' + (x.opsi || []).map(function (o) { return '<label class="flex items-center gap-3 min-h-[44px] px-4 rounded-xl border border-line cursor-pointer"><input type="checkbox" name="' + esc(x.id) + '" value="' + esc(o) + '" class="w-4 h-4 accent-[rgb(var(--brand))]">' + esc(o) + '</label>'; }).join('') + '</div>';
    else if (t === 'foto') out = '<div class="flex items-center gap-4"><div id="prev-foto" class="w-24 h-32 rounded-xl bg-surf2 border border-dashed border-line grid place-items-center text-ink2 overflow-hidden shrink-0">' + I('image') + '</div><div class="grid gap-1 min-w-0"><input class="field !py-2" type="file" id="' + id + '" name="foto" accept="image/jpeg,image/png"><p class="hint">JPG/PNG, maksimal 2 MB, rasio 4×6.</p><p class="text-sm text-danger" id="err-foto" role="alert"></p></div></div>';
    else if (t === 'berkas') out = '<p class="hint">Unggah berkas tidak tersedia pada versi ini.</p>';
    else out = '<input class="field" ' + base + ' type="' + ({ email: 'email', telepon: 'tel', angka: 'number', tanggal: 'date' }[t] || 'text') + '"' + (t === 'telepon' ? ' inputmode="tel" placeholder="08xxxxxxxxxx"' : '') + (t === 'email' ? ' autocomplete="email" inputmode="email"' : '') + ' value="' + esc(v) + '">';
    return '<div>' + (t === 'pilihan' || t === 'centang' || t === 'foto' ? '<div class="label">' + esc(x.label) + req + '</div>' : lab) + out + '<p class="text-sm text-danger mt-1" data-err="' + esc(x.id) + '" role="alert"></p></div>';
  }
  var fotoData = null;
  function pratinjauFoto(e) {
    var f = e.target.files[0], er = $('#err-foto'); er.textContent = ''; fotoData = null; if (!f) return;
    if (['image/jpeg', 'image/png'].indexOf(f.type) < 0) { er.textContent = 'Format harus JPG atau PNG.'; e.target.value = ''; return; }
    if (f.size > 2 * 1024 * 1024) { er.textContent = 'Ukuran foto maksimal 2 MB.'; e.target.value = ''; return; }
    var rd = new FileReader(); rd.onload = function () { $('#prev-foto').innerHTML = '<img alt="Pratinjau foto" class="w-full h-full object-cover" src="' + rd.result + '">'; fotoData = { mime: f.type, base64: String(rd.result).split(',')[1] }; }; rd.readAsDataURL(f);
  }
  function submitDaftar(e) {
    e.preventDefault(); var frm = e.target, def = D.form.definisi, jaw = {}, bad = 0; $$('[data-err]', frm).forEach(function (x) { x.textContent = ''; });
    def.bagian.forEach(function (b) {
      b.fields.forEach(function (x) {
        if (x.tipe === 'foto' || x.tipe === 'berkas') { if (x.tipe === 'foto' && x.wajib && !fotoData) { $('#err-foto').textContent = 'Pas foto wajib diunggah.'; bad++; } return; }
        var v = x.tipe === 'centang' ? $$('input[name="' + x.id + '"]:checked', frm).map(function (c) { return c.value; }) : (x.tipe === 'pilihan' ? ($('input[name="' + x.id + '"]:checked', frm) || {}).value || '' : (frm.elements[x.id] || {}).value || '');
        var s = Array.isArray(v) ? v.join(',') : String(v).trim(), er = null;
        if (x.wajib && !s) er = 'Wajib diisi.';
        else if (s && x.tipe === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) er = 'Format email tidak valid.';
        else if (s && x.tipe === 'telepon' && !/^(\+?62|0)8\d{8,12}$/.test(s.replace(/[\s-]/g, ''))) er = 'Nomor tidak valid (contoh 081234567890).';
        if (er) { bad++; var t = $('[data-err="' + x.id + '"]', frm); if (t) t.textContent = er; }
        jaw[x.id] = v;
      });
    });
    if (bad) { var first = $('[data-err]:not(:empty)', frm) || $('#err-foto'); if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' }); P.toast('Periksa kembali isian yang ditandai.', 1); return; }
    var btn = $('button[type=submit]', frm);
    P.sibuk(btn, P.api('public.submit', { jawaban: jaw, foto: fotoData }, { public: true, write: true, retry: 1, timeout: 60000 }), 'Mengirim…').then(function (r) {
      P.LS.removeItem('pp:draft'); fotoData = null; formSig = ''; sukses(r);
    }, function (er) { P.toast(er.message, 1); });
  }
  function sukses(r) {
    $('#form-card').innerHTML = '<div class="text-center py-6"><span class="w-16 h-16 mx-auto rounded-full bg-sec/20 text-sec-ink grid place-items-center mb-4">' + I('circle-check', '!w-9 !h-9') + '</span><h1 class="text-3xl mb-2">Pendaftaran Berhasil</h1><p class="text-ink2 mb-6">Simpan nomor dan token berikut untuk memeriksa status seleksi.</p>' +
      (r.duplikat ? '<div class="rounded-2xl bg-gold/15 p-3 mb-5 text-sm text-left flex gap-2">' + I('triangle-alert', 'text-gold shrink-0') + 'Data dengan nama & nomor HP yang sama sudah pernah terdaftar. Panitia akan memeriksa kemungkinan duplikat.</div>' : '') +
      '<div class="grid sm:grid-cols-2 gap-3 text-left mb-6"><div class="rounded-2xl bg-surf2 p-4"><div class="text-xs text-ink2">No. Pendaftaran</div><div class="text-xl font-extrabold break-all" id="r-no">' + esc(r.no_pendaftaran) + '</div></div><div class="rounded-2xl bg-surf2 p-4"><div class="text-xs text-ink2">Token Cek Status</div><div class="text-xl font-extrabold tracking-widest" id="r-tk">' + esc(r.token) + '</div></div></div>' +
      '<p class="text-sm text-ink2 mb-6">Bukti pendaftaran (PDF) dikirim ke email Anda. Token tidak dapat dilihat kembali, mohon dicatat.</p>' +
      '<div class="flex flex-wrap gap-3 justify-center no-print"><button class="btn btn-ghost" id="b-copy">' + I('copy') + 'Salin</button><button class="btn btn-ghost" onclick="window.print()">' + I('printer') + 'Cetak</button>' + (r.wa_link ? '<a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' + esc(r.wa_link) + '">' + I('message-circle') + 'Konfirmasi via WhatsApp</a>' : '') + '<a class="btn btn-ghost" href="#/status">' + I('scan-search') + 'Cek Status</a></div></div>';
    $('#b-copy').addEventListener('click', function () { var t = 'No. Pendaftaran: ' + r.no_pendaftaran + '\nToken: ' + r.token; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { P.toast('Tersalin.'); }, function () { P.toast('Salin manual dari layar.', 1); }); });
    window.scrollTo(0, 0);
  }

  // ---------- Cek status ----------
  function renderStatus() {
    var box = $('#v-status'); if (box.innerHTML) return;
    box.innerHTML = '<div class="wrap py-10 sm:py-16 max-w-xl"><a href="#/" class="inline-flex items-center gap-2 text-sm font-semibold text-ink2 mb-6 min-h-[44px]">' + I('arrow-left') + 'Kembali ke beranda</a><div class="card p-6 sm:p-9"><span class="w-12 h-12 rounded-2xl bg-brand/10 text-brand dark:text-sec grid place-items-center mb-4">' + I('scan-search') + '</span><h1 class="text-3xl mb-1">Cek Status Seleksi</h1><p class="text-ink2 mb-6">Masukkan nomor pendaftaran dan token (atau email yang didaftarkan).</p>' +
      '<form id="frs" class="grid gap-4" novalidate><div><label class="label" for="s-no">Nomor Pendaftaran</label><input class="field uppercase" id="s-no" autocomplete="off" placeholder="PSB-2026-0001" required></div>' +
      '<div class="flex gap-2 text-sm" role="tablist"><button type="button" class="tab" role="tab" aria-selected="true" data-m="token">Pakai Token</button><button type="button" class="tab" role="tab" aria-selected="false" data-m="email">Pakai Email</button></div>' +
      '<div><label class="label" for="s-kunci" id="s-lab">Token</label><input class="field" id="s-kunci" autocomplete="off" required></div><p class="text-sm text-danger" id="s-err" role="alert"></p><button class="btn btn-primary !min-h-[52px] text-base" type="submit">' + I('search') + 'Periksa Status</button></form><div id="s-hasil" class="mt-6"></div></div></div>';
    var mode = 'token';
    $$('[data-m]', box).forEach(function (b) { b.addEventListener('click', function () { mode = b.dataset.m; $$('[data-m]', box).forEach(function (x) { x.setAttribute('aria-selected', x === b); }); $('#s-lab').textContent = mode === 'token' ? 'Token' : 'Email'; var i = $('#s-kunci'); i.type = mode === 'email' ? 'email' : 'text'; i.value = ''; i.classList.toggle('uppercase', mode === 'token'); }); });
    $('#frs').addEventListener('submit', function (e) {
      e.preventDefault(); var no = $('#s-no').value.trim(), kk = $('#s-kunci').value.trim(), er = $('#s-err'); er.textContent = ''; $('#s-hasil').innerHTML = '';
      if (!no || !kk) { er.textContent = 'Lengkapi nomor pendaftaran dan ' + (mode === 'token' ? 'token' : 'email') + '.'; return; }
      var prm = { no_pendaftaran: no }; prm[mode === 'token' ? 'token' : 'email'] = kk;
      P.sibuk($('button[type=submit]', box), P.api('public.status', prm, { public: true, retry: 1 }), 'Memeriksa…').then(function (r) {
        $('#s-hasil').innerHTML = '<div class="rounded-2xl bg-surf2 p-5 view"><div class="flex items-center justify-between gap-3 mb-3"><div class="min-w-0"><div class="text-xs text-ink2">Nama</div><div class="font-bold truncate">' + esc(r.nama) + '</div></div><span class="badge b-' + esc(r.status) + ' !text-sm">' + esc(r.status) + '</span></div><div class="text-sm text-ink2">No. ' + esc(r.no_pendaftaran) + ' · Terdaftar ' + esc(P.tgl(r.tanggal, 1)) + '</div>' + (r.catatan ? '<div class="mt-3 text-sm rounded-xl bg-surf p-3">' + esc(r.catatan) + '</div>' : '') + '</div>';
      }, function (x) { er.textContent = x.message; });
    });
  }

  // ---------- Detail berita ----------
  function renderBerita(id) {
    var x = D.berita.filter(function (b) { return b.id === id; })[0], box = $('#v-berita');
    if (!x) { box.innerHTML = '<div class="wrap py-20 text-center"><p class="text-ink2 mb-4">Berita tidak ditemukan.</p><a class="btn btn-primary" href="#/">Kembali</a></div>'; return; }
    box.innerHTML = '<article class="wrap py-10 sm:py-16 max-w-3xl"><a href="#/" data-go="berita" class="inline-flex items-center gap-2 text-sm font-semibold text-ink2 mb-6 min-h-[44px]">' + I('arrow-left') + 'Semua berita</a><span class="badge b-ok mb-3">' + esc(x.kategori) + '</span><h1 class="text-3xl sm:text-4xl mb-3">' + esc(x.judul) + '</h1><div class="text-sm text-ink2 mb-6">' + esc(P.tgl(x.tanggal_terbit)) + (x.penulis ? ' · ' + esc(x.penulis) : '') + '</div>' + (P.gambar(x.foto) ? '<img class="rounded-app w-full mb-6 aspect-[16/9] object-cover" alt="" src="' + esc(P.gambar(x.foto)) + '">' : '') + '<div class="prose-s text-lg leading-relaxed">' + bersihHtml(x.isi) + '</div></article>';
    document.title = x.judul + ' — ' + D.pengaturan.nama_aplikasi;
  }

  // ---------- Boot ----------
  function terapkan(data) {
    D = data; var s = D.pengaturan; P.terapkanTema(s);
    if (!P.LS.getItem('pp:mode')) P.setMode(P.modeAktif(s.mode_tema));
    renderHome(); formSig = formSig; route();
  }
  function aturTema() {
    var b = $('#tema'); function ik() { b.innerHTML = I(document.documentElement.classList.contains('dark') ? 'sun' : 'moon'); } ik();
    b.addEventListener('click', function () { var g = !document.documentElement.classList.contains('dark'); P.setMode(g ? 'gelap' : 'terang', true); ik(); P.terapkanTema(D && D.pengaturan); });
    $('#logo-i').innerHTML = I('moon-star', '!w-6 !h-6'); $('#burger').innerHTML = I('menu');
    $('#burger').addEventListener('click', function () { var m = $('#mnav'), o = m.classList.toggle('hidden'); this.setAttribute('aria-expanded', String(!o)); });
  }
  function init() {
    P.pantauKoneksi(); aturTema(); P.warm();
    var ambil = function () { return P.api('public.bootstrap', {}, { public: true }); };
    P.swr('pub', ambil, terapkan, 60000).catch(function (e) {
      if (!D) $('#home-in').innerHTML = '<div class="wrap py-24 text-center"><p class="text-ink2 mb-4">' + esc(e.message) + '</p><button class="btn btn-primary" onclick="location.reload()">Muat ulang</button></div>';
    });
    // segarkan saat tab kembali aktif (tanpa mengganggu)
    document.addEventListener('visibilitychange', function () { if (!document.hidden && D) P.swr('pub', ambil, terapkan, 60000).catch(function () { }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
