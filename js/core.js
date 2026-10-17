/* core.js — api() dengan timeout/retry, cache SWR, Perf, tema, UI util. Tanpa dependensi. */
(function (w) {
  'use strict';
  var d = document, LS = (function () { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return localStorage; } catch (e) { var m = {}; return { getItem: function (k) { return m[k] || null; }, setItem: function (k, v) { m[k] = String(v); }, removeItem: function (k) { delete m[k]; } }; } })();
  var SCHEMA_V = '1';

  // ---------- util ----------
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function icon(n, cls) { var p = (w.ICONS && w.ICONS[n]) || ''; return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>'; }
  function rupiah(n) { n = Number(n) || 0; return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function tgl(s, pendek) { if (!s) return ''; var t = new Date(s.length === 10 ? s + 'T00:00:00' : s); if (isNaN(t)) return s; return t.toLocaleDateString('id-ID', pendek ? { day: '2-digit', month: 'short', year: 'numeric' } : { day: 'numeric', month: 'long', year: 'numeric' }); }
  function jam(s) { var t = new Date(s); return isNaN(t) ? '' : t.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  function debounce(fn, ms) { var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); }; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function foto(u, fallback) { u = String(u || ''); return /^https?:\/\//i.test(u) ? u : (fallback || ''); }
  function safeUrl(u) { u = String(u || ''); return /^(https?:|mailto:|tel:|#)/i.test(u) ? u : '#'; }
  /** URL gambar Drive → bentuk yang bisa ditampilkan */
  function gambar(u) { u = String(u || '').trim(); var m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([\w-]+)/); return m ? 'https://lh3.googleusercontent.com/d/' + m[1] + '=w1200' : (/^https?:\/\//i.test(u) ? u : ''); }

  // ---------- Perf ----------
  var Perf = { log: [], push: function (a, total, server) { this.log.push({ a: a, total: total, server: server }); if (this.log.length > 60) this.log.shift(); },
    avg: function () { if (!this.log.length) return 0; return Math.round(this.log.reduce(function (s, x) { return s + x.total; }, 0) / this.log.length); },
    last: function () { return this.log[this.log.length - 1] || null; } };

  // ---------- Sesi ----------
  var Sesi = {
    get: function () { try { return JSON.parse(LS.getItem('pp:sess') || 'null'); } catch (e) { return null; } },
    set: function (s) { LS.setItem('pp:sess', JSON.stringify(s)); }, clear: function () { LS.removeItem('pp:sess'); },
    token: function () { var s = this.get(); return s && s.token || ''; }, email: function () { var s = this.get(); return s && s.email || 'anon'; }
  };

  // ---------- Cache SWR ----------
  var Cache = {
    k: function (key) { return 'pp:v' + SCHEMA_V + ':' + Sesi.email() + ':' + key; },
    get: function (key) { try { var r = JSON.parse(LS.getItem(this.k(key)) || 'null'); return r; } catch (e) { return null; } },
    set: function (key, data) { try { LS.setItem(this.k(key), JSON.stringify({ t: Date.now(), d: data })); } catch (e) { /* kuota penuh: abaikan */ } },
    del: function (key) { LS.removeItem(this.k(key)); },
    clearAll: function () { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('pp:v' + SCHEMA_V + ':') === 0) LS.removeItem(k); }); }
  };
  var inflight = {};
  /** Tampilkan cache langsung, segarkan di latar jika basi. onData(data, dariCache). Mengembalikan promise data segar. */
  function swr(key, fetcher, onData, ttl) {
    ttl = ttl == null ? 30000 : ttl; var c = Cache.get(key), segar = c && (Date.now() - c.t) < ttl;
    if (c && onData) onData(c.d, true);
    if (segar) return Promise.resolve(c.d);
    if (inflight[key]) return inflight[key].then(function (x) { if (onData && (!c || JSON.stringify(c.d) !== JSON.stringify(x))) onData(x, false); return x; });
    var p = fetcher().then(function (x) {
      var beda = !c || JSON.stringify(c.d) !== JSON.stringify(x); Cache.set(key, x); delete inflight[key];
      if (onData && beda) onData(x, false); return x;
    }, function (e) { delete inflight[key]; if (!c) throw e; return c.d; });
    inflight[key] = p; return p;
  }

  // ---------- API ----------
  function waitOnline() { return navigator.onLine === false ? new Promise(function (r) { w.addEventListener('online', function f() { w.removeEventListener('online', f); r(); }); setTimeout(r, 8000); }) : Promise.resolve(); }
  function url() { var u = (w.APP_CONFIG || {}).GAS_URL || ''; if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(u)) throw new Error('GAS_URL belum diatur di js/config.js'); return u; }
  var authHandlers = [];
  function onAuthExpired(f) { authHandlers.push(f); }

  function api(action, params, opt) {
    opt = opt || {}; var t0 = performance.now(), tries = opt.retry == null ? 2 : opt.retry, isWrite = !!opt.write;
    var body = { action: action, params: params || {}, token: opt.public ? '' : Sesi.token() }; if (isWrite) body.reqId = opt.reqId || uid();
    function once(n) {
      return waitOnline().then(function () {
        var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, opt.timeout || 28000);
        return fetch(url(), { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), signal: ctl.signal })
          .then(function (r) { clearTimeout(to); return r.json(); }, function (e) { clearTimeout(to); throw e; });
      }).then(function (j) {
        Perf.push(action, Math.round(performance.now() - t0), j.ms);
        if (!j.success) { var er = new Error(j.message || 'Gagal.'); er.code = j.code; if (j.code === 'AUTH') authHandlers.forEach(function (f) { f(); }); throw er; }
        return j.data;
      }, function (e) {
        if (e.code) throw e;
        if (n < tries) return new Promise(function (r) { setTimeout(r, 600 * (n + 1)); }).then(function () { return once(n + 1); });
        throw new Error(e.name === 'AbortError' ? 'Server lambat merespons. Coba lagi.' : 'Tidak dapat terhubung ke server. Periksa koneksi internet.');
      });
    }
    return once(0);
  }
  function apiBatch(calls) { // calls: [[action, params], ...] → array data
    var t0 = performance.now(), body = { action: 'batch', calls: calls.map(function (c) { return { action: c[0], params: c[1] || {} }; }), token: Sesi.token() };
    return waitOnline().then(function () { return fetch(url(), { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); })
      .then(function (j) { Perf.push('batch', Math.round(performance.now() - t0), j.ms); if (!j.success) throw new Error(j.message); return j.data.map(function (x) { if (!x.success) { if (x.code === 'AUTH') authHandlers.forEach(function (f) { f(); }); return { error: x.message }; } return { data: x.data }; }); });
  }
  /** GET publik kecil (CDN-friendly), dipakai untuk warm-up */
  function warm() { try { fetch(url() + '?action=ping', { redirect: 'follow', mode: 'no-cors' }).catch(function () { }); } catch (e) { } }

  // ---------- UI ----------
  var toastT;
  function toast(msg, err) {
    var e = $('.toast'); if (e) e.remove(); e = d.createElement('div'); e.className = 'toast' + (err ? ' err' : ''); e.setAttribute('role', 'status'); e.textContent = msg; d.body.appendChild(e);
    clearTimeout(toastT); toastT = setTimeout(function () { e.remove(); }, err ? 5000 : 2600);
  }
  function modal(html, opt) {
    opt = opt || {}; var bg = d.createElement('div'); bg.className = 'modal-bg'; bg.setAttribute('role', 'dialog'); bg.setAttribute('aria-modal', 'true');
    bg.innerHTML = '<div class="modal ' + (opt.cls || '') + '">' + html + '</div>'; d.body.appendChild(bg); d.body.style.overflow = 'hidden';
    function close() { bg.remove(); d.body.style.overflow = ''; d.removeEventListener('keydown', esc_); if (opt.onClose) opt.onClose(); }
    function esc_(e) { if (e.key === 'Escape') close(); }
    bg.addEventListener('mousedown', function (e) { if (e.target === bg) close(); }); d.addEventListener('keydown', esc_);
    $$('[data-close]', bg).forEach(function (b) { b.addEventListener('click', close); });
    var f = $('input,select,textarea,button', bg); if (f && !opt.noFocus) f.focus();
    return { el: bg, close: close, $: function (s) { return $(s, bg); }, $$: function (s) { return $$(s, bg); } };
  }
  function konfirmasi(judul, teks, labelOk, bahaya) {
    return new Promise(function (res) {
      var m = modal('<h3 class="text-xl mb-2">' + esc(judul) + '</h3><p class="text-ink2 mb-6">' + esc(teks) + '</p><div class="flex gap-3 justify-end"><button class="btn btn-ghost" data-close>Batal</button><button class="btn ' + (bahaya ? 'btn-danger' : 'btn-primary') + '" id="kok">' + esc(labelOk || 'Ya, lanjut') + '</button></div>', { onClose: function () { res(false); }, cls: 'sm:max-w-md' });
      m.$('#kok').addEventListener('click', function () { res(true); m.el.remove(); d.body.style.overflow = ''; });
    });
  }
  /** Tombol sibuk: nonaktifkan + teks, pulihkan setelah promise */
  function sibuk(btn, p, teks) {
    if (!btn) return p; var h = btn.innerHTML; btn.disabled = true; btn.innerHTML = icon('loader-circle', 'animate-spin') + ' ' + (teks || 'Memproses…');
    var done = function () { btn.disabled = false; btn.innerHTML = h; }; p.then(done, done); return p;
  }

  // ---------- Tema ----------
  function hex2rgb(h) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return null; var n = parseInt(m[1], 16); return (n >> 16 & 255) + ' ' + (n >> 8 & 255) + ' ' + (n & 255); }
  function lum(h) { var m = /^#?([0-9a-f]{6})$/i.exec(h || ''); if (!m) return 0; var n = parseInt(m[1], 16), c = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function terapkanTema(s) {
    if (!s) return; var r = d.documentElement.style;
    var map = { warna_primer: '--brand', warna_sekunder: '--sec', warna_aksen: '--gold' };
    Object.keys(map).forEach(function (k) { var v = hex2rgb(s[k]); if (v && !(k === 'warna_primer' && d.documentElement.classList.contains('dark'))) r.setProperty(map[k], v); });
    if (hex2rgb(s.warna_primer)) { r.setProperty('--on-brand', lum(s.warna_primer) > .45 ? '16 30 24' : '255 255 255'); }
    if (s.radius) r.setProperty('--radius', Math.max(8, Math.min(32, +s.radius || 20)) + 'px');
    if (s.glass_blur) r.setProperty('--glass-blur', Math.max(0, Math.min(40, +s.glass_blur || 18)) + 'px');
    if (s.glass_opacity) r.setProperty('--glass-op', (Math.max(30, Math.min(100, +s.glass_opacity || 72)) / 100).toFixed(2));
  }
  function modeAktif(def) { var o = LS.getItem('pp:mode'); if (o === 'terang' || o === 'gelap') return o; if (def === 'terang' || def === 'gelap') return def; return w.matchMedia && w.matchMedia('(prefers-color-scheme:dark)').matches ? 'gelap' : 'terang'; }
  function setMode(m, simpan) { d.documentElement.classList.toggle('dark', m === 'gelap'); if (simpan) LS.setItem('pp:mode', m); var meta = $('meta[name=theme-color]'); if (meta) meta.content = m === 'gelap' ? '#08140F' : '#14532D'; }
  (function awal() { var o = LS.getItem('pp:mode'); setMode(o === 'gelap' || (!o && w.matchMedia && w.matchMedia('(prefers-color-scheme:dark)').matches) ? 'gelap' : 'terang'); })();

  // ---------- Offline banner ----------
  function pantauKoneksi() {
    function s() { var e = $('#offline'); if (navigator.onLine === false) { if (!e) { e = d.createElement('div'); e.id = 'offline'; e.className = 'fixed top-0 inset-x-0 z-[120] bg-danger text-white text-center text-sm py-2 font-semibold'; e.textContent = 'Anda sedang offline — data tersimpan akan tetap tampil.'; d.body.appendChild(e); } } else if (e) e.remove(); }
    w.addEventListener('online', s); w.addEventListener('offline', s); s();
  }

  w.PP = { $: $, $$: $$, esc: esc, icon: icon, rupiah: rupiah, tgl: tgl, jam: jam, debounce: debounce, uid: uid, foto: foto, gambar: gambar, safeUrl: safeUrl, Perf: Perf, Sesi: Sesi, Cache: Cache, swr: swr,
    api: api, apiBatch: apiBatch, warm: warm, onAuthExpired: onAuthExpired, toast: toast, modal: modal, konfirmasi: konfirmasi, sibuk: sibuk, terapkanTema: terapkanTema, modeAktif: modeAktif, setMode: setMode, pantauKoneksi: pantauKoneksi, LS: LS };
})(window);
