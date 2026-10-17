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
  function img(u, alt, kelas, ikon, fb) { u = P.gambar(u) || (fb ? 'img/' + fb + '.svg' : ''); return u ? '<img src="' + esc(u) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" class="' + (kelas || 'aspect-[4/3]') + ' w-full object-cover" onerror="this.outerHTML=this.dataset.fb" data-fb="' + esc(ph(ikon, kelas)) + '">' : ph(ikon, kelas); }
  function head(eyebrow, judul, sub, terang) {
    return '<div class="max-w-2xl mb-10 relative"><span class="eyebrow ' + (terang ? '!text-gold' : '') + '">' + I('sparkles', '!w-4 !h-4') + esc(eyebrow) + '</span><h2 class="h-section mt-3 ' + (terang ? 'text-white' : '') + '">' + esc(judul) + '</h2>' + (sub ? '<p class="mt-3 ' + (terang ? 'text-white/80' : 'text-ink2') + ' text-lg">' + esc(sub) + '</p>' : '') + '</div>';
  }
  function sec(id, cls, inner, blobs) { return '<section id="s-' + id + '" class="relative overflow-hidden py-16 sm:py-24 scroll-mt-[68px] ' + (cls || '') + '">' + (blobs || '') + '<div class="wrap relative">' + inner + '</div></section>'; }
  var WARNA = ['20 83 45', '0 109 66', '176 124 20', '30 100 160', '124 58 130', '170 60 60'];
  function kunciFasilitas(n, i) { n = String(n).toLowerCase(); var m = [['masjid', 'masjid'], ['asrama', 'asrama'], ['perpus', 'perpustakaan'], ['lab', 'lab'], ['lapang|olahraga', 'lapangan'], ['klinik|kesehatan|uks', 'klinik']].filter(function (x) { return new RegExp(x[0]).test(n); })[0]; return m ? 'fasilitas-' + m[1] : ['fasilitas-masjid', 'fasilitas-asrama', 'fasilitas-perpustakaan', 'fasilitas-lab', 'fasilitas-lapangan', 'fasilitas-klinik'][i % 6]; }
  var BL = function (c, pos) { return '<span class="blob ' + c + ' ' + pos + '" aria-hidden="true"></span>'; };

  var R = {
    beranda: function () {
      var b = D.beranda, k = D.kuota, fh = P.gambar(b.foto_hero) || 'img/hero.svg';
      var ik = ['users', 'graduation-cap', 'award', 'calendar-days'];
      var st = [1, 2, 3, 4].map(function (i) { return b['stat' + i + '_angka'] ? '<div class="flex items-center gap-3 px-3 sm:px-5 justify-center lg:justify-start"><span class="clay-ic hidden sm:grid" style="--c:' + WARNA[i % 3] + '">' + I(ik[i - 1]) + '</span><div><div class="text-2xl sm:text-3xl font-extrabold text-brand dark:text-sec leading-none">' + esc(b['stat' + i + '_angka']) + '</div><div class="text-xs sm:text-sm text-ink2 font-semibold mt-1">' + esc(b['stat' + i + '_label']) + '</div></div></div>' : ''; }).join('');
      var pct = k.kuota ? Math.min(100, Math.round(k.terisi / k.kuota * 100)) : 0;
      return '<section id="s-beranda" class="relative overflow-hidden bg-brand-deep text-white -mt-px">' +
        '<img src="' + esc(fh) + '" alt="" class="absolute inset-0 w-full h-full object-cover" fetchpriority="high" onerror="this.remove()">' +
        '<div class="absolute inset-0" style="background:linear-gradient(100deg,rgb(var(--brand-deep)/.94) 8%,rgb(var(--brand-deep)/.72) 48%,rgb(var(--brand-deep)/.25) 100%)"></div>' +
        BL('bg-sec w-[420px] h-[420px]', '-left-24 top-10') + BL('bg-gold w-[340px] h-[340px]', 'right-0 bottom-0') +
        '<div class="wrap relative grid lg:grid-cols-[1.25fr_1fr] gap-10 items-center py-20 sm:py-28 lg:py-36 pb-36 sm:pb-44">' +
        '<div><span class="glass !bg-white/10 !border-white/25 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-gold">' + I('badge-check', '!w-4 !h-4') + 'Penerimaan Santri Baru ' + esc(D.pengaturan.tahun_ajaran || '') + '</span>' +
        '<h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] drop-shadow-lg">' + esc(b.judul || D.pengaturan.nama_aplikasi) + '</h1>' +
        '<p class="mt-5 text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">' + esc(b.subjudul || D.pengaturan.tagline) + '</p>' +
        '<div class="mt-8 flex flex-wrap gap-4"><a href="#/daftar" class="clay-btn clay-gold">' + esc(b.cta_label || 'Daftar Sekarang') + I('arrow-right') + '</a><a href="#/status" class="clay-btn clay-glass">' + I('scan-search') + 'Cek Status Seleksi</a></div>' +
        '<div class="mt-8 flex flex-wrap gap-2.5 text-sm font-semibold">' + [['shield-check', 'Terakreditasi A'], ['house', 'Asrama putra & putri'], ['book-open', 'Tahfidz + Kurikulum Nasional']].map(function (x) { return '<span class="glass !bg-white/10 !border-white/20 rounded-full px-3.5 py-2 inline-flex items-center gap-2 text-white/95">' + I(x[0], '!w-4 !h-4 text-gold') + x[1] + '</span>'; }).join('') + '</div></div>' +
        '<div class="relative max-w-md w-full lg:ml-auto"><div class="glass-dark rounded-[28px] p-6 text-white"><div class="flex items-center gap-3 mb-5"><span class="clay-ic" style="--c:217 164 65">' + I('calendar-days') + '</span><div><div class="text-sm text-white/70">Periode Pendaftaran</div><div class="font-bold">' + esc(P.tgl(k.buka, 1)) + ' – ' + esc(P.tgl(k.tutup, 1)) + '</div></div></div>' +
        '<div class="rounded-2xl bg-black/25 p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,.35)]"><div class="flex justify-between text-sm mb-2"><span>Kuota terisi</span><b>' + k.terisi + ' / ' + (k.kuota || '∞') + '</b></div><div class="h-3 rounded-full bg-white/15 overflow-hidden"><div class="h-full rounded-full bg-gradient-to-r from-gold to-sec" style="width:' + pct + '%"></div></div></div>' +
        '<div class="mt-4 text-sm font-bold flex items-center gap-2 ' + (k.dibuka ? 'text-sec' : 'text-gold') + '"><span class="w-2.5 h-2.5 rounded-full ' + (k.dibuka ? 'bg-sec' : 'bg-gold') + ' animate-pulse"></span>' + (k.dibuka ? 'Pendaftaran sedang dibuka' : esc(k.alasan)) + '</div></div>' +
        '<div class="clay float absolute -left-8 -bottom-16 hidden sm:flex items-center gap-3 px-4 py-3 !rounded-3xl text-ink"><span class="clay-ic !w-11 !h-11" style="--c:0 109 66">' + I('users') + '</span><div><div class="font-extrabold text-brand dark:text-sec leading-none">' + esc(b.stat1_angka || '850+') + '</div><div class="text-xs text-ink2 font-semibold">' + esc(b.stat1_label || 'Santri aktif') + '</div></div></div>' +
        '<div class="glass-dark float-2 absolute -right-3 -top-7 hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white">' + I('sparkles', '!w-4 !h-4 text-gold') + 'Beasiswa tersedia</div></div></div></section>' +
        (st ? '<div class="wrap relative z-10 -mt-20 sm:-mt-24"><div class="clay grid grid-cols-2 lg:grid-cols-4 gap-y-5 py-6 sm:py-8 px-2 sm:px-4">' + st + '</div></div>' : '');
    },
    profil: function () {
      var p = D.profil, misi = String(p.misi || '').split(';').map(function (x) { return x.trim(); }).filter(Boolean);
      return sec('profil', 'bg-gradient-to-b from-bg to-surf2', head('Profil', 'Mengenal Pesantren Kami', 'Lembaga pendidikan Islam yang menumbuhkan ilmu, akhlak, dan kemandirian.') + '<div class="grid lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-12 items-center"><div class="relative"><div class="clay p-3"><img src="' + esc(P.gambar(p.foto_profil) || 'img/profil.svg') + '" alt="Kampus pesantren" loading="lazy" class="w-full aspect-[4/3] object-cover rounded-[calc(var(--radius)+2px)]"></div>' +
        '<div class="glass-2 absolute -bottom-6 right-4 sm:right-8 flex items-center gap-3 rounded-3xl p-3 pr-5 max-w-[88%]"><img src="' + esc(P.gambar(p.foto_pimpinan) || 'img/pimpinan.svg') + '" alt="Pimpinan" class="w-14 h-14 rounded-full object-cover ring-4 ring-white/70 shrink-0"><div class="min-w-0"><div class="text-xs text-ink2">Pimpinan Pondok</div><div class="font-bold truncate">' + esc(p.pimpinan) + '</div></div></div></div>' +
        '<div class="grid gap-5 mt-6 lg:mt-0"><div class="glass-card p-6 sm:p-7"><h3 class="text-xl mb-3 flex items-center gap-2">' + I('library', 'text-sec-ink') + 'Sejarah Singkat</h3><p class="text-ink2 leading-relaxed">' + esc(p.sejarah) + '</p></div>' +
        '<div class="grid sm:grid-cols-2 gap-5"><div class="clay p-6"><h3 class="text-lg mb-2 flex items-center gap-2">' + I('flag', 'text-gold') + 'Visi</h3><p class="text-ink2 text-[15px] leading-relaxed">' + esc(p.visi) + '</p></div><div class="clay p-6"><h3 class="text-lg mb-3 flex items-center gap-2">' + I('rocket', 'text-sec-ink') + 'Misi</h3><ul class="grid gap-2">' + misi.map(function (m) { return '<li class="flex gap-2 text-ink2 text-[15px]">' + I('circle-check', 'text-sec-ink mt-0.5 shrink-0') + '<span>' + esc(m) + '</span></li>'; }).join('') + '</ul></div></div></div></div>', BL('bg-sec w-80 h-80', '-left-20 top-20') + BL('bg-gold w-72 h-72', 'right-0 bottom-10'));
    },
    program: function () {
      return sec('program', 'bg-gradient-to-br from-surf2 to-bg', head('Program', 'Program Unggulan', 'Kurikulum terpadu untuk membentuk ilmu, akhlak, dan keterampilan.') + '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">' + D.program.map(function (x, i) {
        return '<article class="glass-card card-hover p-6" style="transition:transform .2s ease"><span class="clay-ic mb-4" style="--c:' + WARNA[i % 6] + '">' + I(IKON_PRG[x.ikon] || 'book-open') + '</span><h3 class="text-lg mb-2">' + esc(x.nama) + '</h3><p class="text-ink2 text-[15px] leading-relaxed">' + esc(x.deskripsi) + '</p></article>'; }).join('') + '</div>',
        BL('bg-sec w-96 h-96', '-right-24 top-0') + BL('bg-gold w-80 h-80', '-left-24 bottom-0') + BL('bg-brand w-64 h-64', 'left-1/2 top-1/3'));
    },
    fasilitas: function () {
      return sec('fasilitas', '', head('Fasilitas', 'Lingkungan Belajar yang Nyaman', 'Sarana lengkap untuk menunjang ibadah, belajar, dan pertumbuhan santri.') + '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">' + D.fasilitas.map(function (x, i) {
        return '<article class="clay clay-hover p-3"><div class="relative overflow-hidden rounded-[calc(var(--radius)+2px)]">' + img(x.foto, x.nama, 'aspect-[16/10]', 'building-2', kunciFasilitas(x.nama, i)) + (x.badge ? '<span class="absolute top-3 left-3 badge glass !text-ink">' + esc(x.badge) + '</span>' : '') + '</div><div class="p-4 pb-3"><h3 class="text-lg mb-1">' + esc(x.nama) + '</h3><p class="text-ink2 text-[15px]">' + esc(x.deskripsi) + '</p></div></article>'; }).join('') + '</div>', BL('bg-sec w-72 h-72', 'left-0 top-1/4'));
    },
    prestasi: function () {
      return sec('prestasi', 'bg-brand-deep text-white', head('Prestasi', 'Kebanggaan Santri Kami', 'Capaian di tingkat daerah hingga nasional.', 1) + '<div class="grid md:grid-cols-3 gap-6">' + D.prestasi.map(function (x, i) {
        return '<article class="glass !bg-white/[.07] !border-white/15 rounded-app p-3 hover:!bg-white/[.12] transition-colors"><div class="relative overflow-hidden rounded-[calc(var(--radius)-4px)]">' + img(x.foto, x.judul, 'aspect-[16/10]', 'trophy', 'prestasi-' + (i % 3 + 1)) + '<span class="absolute top-3 right-3 badge glass !text-ink">' + esc(x.tingkat) + '</span></div><div class="p-4"><h3 class="text-lg text-white mb-2">' + esc(x.judul) + '</h3><p class="text-white/70 text-sm mb-3">' + esc(x.deskripsi) + '</p><div class="text-sm text-white/60 flex gap-4"><span class="flex items-center gap-1.5">' + I('calendar', '!w-4 !h-4') + esc(x.tahun) + '</span>' + (x.lokasi ? '<span class="flex items-center gap-1.5">' + I('map-pin', '!w-4 !h-4') + esc(x.lokasi) + '</span>' : '') + '</div></div></article>'; }).join('') + '</div>',
        BL('bg-sec w-96 h-96', '-left-24 -top-10') + BL('bg-gold w-72 h-72', 'right-0 bottom-0'));
    },
    berita: function () {
      return sec('berita', 'bg-surf2', head('Berita', 'Kabar Terbaru', 'Informasi dan cerita terbaru dari lingkungan pesantren.') + '<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">' + D.berita.slice(0, 6).map(function (x, i) {
        return '<a href="#/berita/' + esc(x.id) + '" class="clay clay-hover p-3 block"><div class="overflow-hidden rounded-[calc(var(--radius)+2px)]">' + img(x.foto, x.judul, 'aspect-[16/10]', 'newspaper', 'berita-' + (i % 3 + 1)) + '</div><div class="p-4 pb-3"><div class="flex items-center gap-2 text-xs text-ink2 mb-2"><span class="badge b-ok">' + esc(x.kategori || 'Berita') + '</span>' + esc(P.tgl(x.tanggal_terbit, 1)) + '</div><h3 class="text-lg mb-2 line-clamp-2">' + esc(x.judul) + '</h3><p class="text-ink2 text-[15px] line-clamp-3">' + esc(x.ringkasan) + '</p></div></a>'; }).join('') + '</div>', BL('bg-gold w-72 h-72', 'right-0 top-10'));
    },
    kegiatan: function () {
      return sec('kegiatan', '', head('Kegiatan', 'Agenda Kegiatan', 'Kegiatan rutin dan agenda mendatang.') + '<div class="grid md:grid-cols-3 gap-5">' + D.kegiatan.slice(0, 6).map(function (x) {
        var t = new Date(x.tanggal + 'T00:00:00');
        return '<article class="glass-card card-hover p-5 flex gap-4"><div class="shrink-0 w-16 h-20 rounded-2xl text-white grid place-items-center text-center leading-tight bg-gradient-to-br from-sec to-brand shadow-[6px_8px_16px_rgba(20,83,45,.35),inset_0_4px_8px_rgba(255,255,255,.3),inset_0_-4px_8px_rgba(0,0,0,.2)]"><div><div class="text-2xl font-extrabold">' + (isNaN(t) ? '–' : t.getDate()) + '</div><div class="text-xs uppercase opacity-90">' + (isNaN(t) ? '' : t.toLocaleDateString('id-ID', { month: 'short' })) + '</div></div></div><div class="min-w-0"><span class="badge b-warn mb-2">' + esc(x.kategori) + '</span><h3 class="text-base mb-1">' + esc(x.judul) + '</h3><p class="text-sm text-ink2 mb-2 line-clamp-2">' + esc(x.deskripsi) + '</p><div class="text-sm text-ink2 grid gap-1"><span class="flex items-center gap-1.5">' + I('clock', '!w-4 !h-4') + esc(x.jam) + ' WIB</span><span class="flex items-center gap-1.5">' + I('map-pin', '!w-4 !h-4') + esc(x.lokasi) + '</span></div></div></article>'; }).join('') + '</div>', BL('bg-sec w-72 h-72', '-right-10 top-1/3') + BL('bg-gold w-64 h-64', 'left-0 bottom-0'));
    },
    biaya: function () {
      var tot = D.biaya.reduce(function (s, x) { return s + (Number(x.nominal) || 0); }, 0);
      return sec('biaya', 'bg-surf2', head('Biaya', 'Rincian Biaya Pendidikan', 'Transparan dan terjangkau, ada keringanan bagi yang membutuhkan.') + '<div class="clay max-w-3xl overflow-hidden !p-0"><div class="divide-y divide-line/50">' + D.biaya.map(function (x, i) {
        return '<div class="flex items-center justify-between gap-4 p-5"><div class="flex items-center gap-4 min-w-0"><span class="clay-ic !w-12 !h-12 shrink-0" style="--c:' + WARNA[(i + 2) % 6] + '">' + I('wallet') + '</span><div class="min-w-0"><div class="font-bold">' + esc(x.komponen) + '</div><div class="text-sm text-ink2">' + esc(x.satuan) + (x.keterangan ? ' · ' + esc(x.keterangan) : '') + '</div></div></div><div class="font-extrabold text-brand dark:text-sec whitespace-nowrap">' + P.rupiah(x.nominal) + '</div></div>'; }).join('') + '</div><div class="p-5 flex items-center justify-between text-white bg-gradient-to-r from-brand to-sec shadow-[inset_0_4px_10px_rgba(255,255,255,.25)]"><span class="font-semibold">Total (jika semua komponen dihitung)</span><b class="text-lg">' + P.rupiah(tot) + '</b></div></div>', BL('bg-gold w-72 h-72', 'right-0 top-0'));
    },
    pendaftaran: function () {
      var k = D.kuota;
      return '<section id="s-pendaftaran" class="py-16 sm:py-20 scroll-mt-[68px]"><div class="wrap"><div class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand to-brand-deep text-white p-8 sm:p-14 shadow-lift">' + BL('bg-sec w-80 h-80', '-left-16 -top-16') + BL('bg-gold w-72 h-72', 'right-0 bottom-0') +
        '<div class="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center"><div><span class="eyebrow !text-gold">' + I('ticket-check', '!w-4 !h-4') + 'Penerimaan Santri Baru</span><h2 class="h-section mt-3 text-white">Wujudkan Pendidikan Terbaik untuk Putra-Putri Anda</h2><p class="mt-3 text-white/85 text-lg">' + (k.dibuka ? 'Pendaftaran dibuka hingga ' + esc(P.tgl(k.tutup)) + '. Sisa kuota ' + k.sisa + ' santri.' : esc(k.alasan)) + '</p></div>' +
        '<div class="glass-dark rounded-[28px] p-5 grid gap-3"><a href="#/daftar" class="clay-btn clay-gold">' + I('square-pen') + 'Isi Formulir Pendaftaran</a><a href="#/status" class="clay-btn clay-glass">' + I('scan-search') + 'Cek Status Seleksi</a></div></div></div></div></section>';
    },
    kontak: function () {
      var k = D.kontak, m = String(k.maps_embed || ''), embed = /^https:\/\/www\.google\.com\/maps\/embed/.test(m) ? m : '';
      var q = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(k.alamat || '');
      function r(i, t, v, href, c) { return v ? '<li class="flex gap-4"><span class="clay-ic shrink-0" style="--c:' + c + '">' + I(i) + '</span><div class="min-w-0"><div class="text-xs text-ink2">' + t + '</div>' + (href ? '<a class="font-semibold hover:underline break-words" href="' + esc(href) + '">' + esc(v) + '</a>' : '<div class="font-semibold break-words">' + esc(v) + '</div>') + '</div></li>' : ''; }
      return sec('kontak', '', head('Kontak', 'Hubungi Kami', 'Tim kami siap membantu pertanyaan Anda.') + '<div class="grid lg:grid-cols-2 gap-6"><div class="clay p-6 sm:p-8"><ul class="grid gap-5">' + r('map-pin', 'Alamat', k.alamat, q, WARNA[0]) + r('phone', 'Telepon', k.telepon, 'tel:' + String(k.telepon || '').replace(/[^\d+]/g, ''), WARNA[1]) + r('message-circle', 'WhatsApp', k.whatsapp, 'https://wa.me/' + waNo(k.whatsapp), WARNA[2]) + r('mail', 'Email', k.email, 'mailto:' + k.email, WARNA[3]) + r('clock', 'Jam layanan', k.jam, '', WARNA[4]) + '</ul></div>' +
        '<div class="clay p-3 min-h-[320px]">' + (embed ? '<iframe src="' + esc(embed) + '" title="Lokasi pesantren" class="w-full h-full min-h-[300px] border-0 rounded-[calc(var(--radius)+2px)]" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>' : '<div class="h-full min-h-[300px] grid place-items-center text-center p-8 rounded-[calc(var(--radius)+2px)] bg-gradient-to-br from-surf2 to-surf3"><div><span class="clay-ic !w-16 !h-16 mx-auto mb-3">' + I('map-pin', '!w-8 !h-8') + '</span><p class="text-ink2 mb-4">' + esc(k.alamat) + '</p><a class="btn btn-primary" target="_blank" rel="noopener noreferrer" href="' + esc(q) + '">Buka di Google Maps</a></div></div>') + '</div></div>', BL('bg-sec w-72 h-72', 'right-0 top-0'));
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
    var b = $('#tema'); function ik() { b.innerHTML = '<span class="inline-flex" style="transition:transform .5s">' + I(document.documentElement.classList.contains('dark') ? 'sun' : 'moon') + '</span>'; } ik();
    b.addEventListener('click', function () { P.gantiTema(b, function () { ik(); P.terapkanTema(D && D.pengaturan); }); });
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
