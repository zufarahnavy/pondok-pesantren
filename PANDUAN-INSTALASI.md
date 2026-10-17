# Panduan Instalasi — Landing Page & Admin Pondok Pesantren

Arsitektur: **Backend** = Google Apps Script (REST API, data di Google Sheets) · **Frontend** = HTML/CSS/JS statis di **GitHub Pages**.
Urutan: **A. Backend → B. Frontend → C. Uji → D. Go-live**. Semua langkah GitHub memakai terminal.

---

## A. Backend (Google Apps Script)

1. Buka <https://script.google.com> → **Proyek baru** → beri nama `Pondok Pesantren API`.
2. Hapus isi `Code.gs` bawaan. Buat file `.gs` satu per satu (ikon **+** → Skrip) dengan **nama persis** berikut dan tempel isinya dari file yang dikirim terpisah:
   `Inti.gs`, `Auth.gs`, `Konten.gs`, `Pendaftaran.gs`, `Notifikasi.gs`, `CRM.gs`, `Migrasi.gs`, `Setup.gs`, `Kode.gs`
3. **Project Settings (⚙)** → centang **Show "appsscript.json" manifest file in editor** → buka `appsscript.json` → ganti seluruh isinya dengan file `appsscript.json` yang dikirim → **Simpan**.
4. Pilih fungsi **`setupAppEnvironment`** → **Run** → setujui izin (Lanjutan → Buka proyek → Izinkan).
   Fungsi ini membuat Spreadsheet database, folder Drive, data contoh, trigger, dan **sandi darurat acak**.
5. Buka **Executions** (ikon jam) → log eksekusi terakhir → **catat `SANDI DARURAT`** (hanya tampil sekali) dan URL spreadsheet.
6. **Deploy → New deployment → Web app**
   - Execute as: **Me** · Who has access: **Anyone** → **Deploy** → salin **Web app URL** (berakhiran `/exec`).
7. *(Login Google — disarankan)* Di <https://console.cloud.google.com> → APIs & Services → Credentials → **Create credentials → OAuth client ID → Web application**.
   Authorized JavaScript origins: `https://USERNAME.github.io` (ganti USERNAME). Salin **Client ID**.
   Isi di Apps Script: **Project Settings → Script Properties → Add** `GOOGLE_CLIENT_ID` = Client ID tadi. (Atau nanti dari panel admin: Pengaturan → Kunci & Rahasia.)

> **Mengubah kode backend nanti:** Deploy → **Manage deployments → ✏️ Edit → Version: New version → Deploy**. URL tetap sama. Jangan buat deployment baru.

---

## B. Frontend (GitHub Pages)

1. Ekstrak ZIP frontend. Hasilnya folder **`pondok-pesantren`** (berisi `index.html`, `admin.html`, `css/`, `js/`).
2. Buka `pondok-pesantren/js/config.js`, ganti:
   ```js
   window.APP_CONFIG = { GAS_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec' };
   ```
3. Buat repositori **publik** kosong di GitHub, mis. `pondok-pesantren` (tanpa README).
4. Di terminal, **masuk ke folder `pondok-pesantren` hasil ekstrak** (folder yang langsung berisi `index.html`), lalu jalankan:
   ```bash
   cd pondok-pesantren
   git init
   git add .
   git commit -m "Rilis awal"
   git branch -M main
   git remote add origin https://github.com/USERNAME/pondok-pesantren.git
   git push -u origin main
   ```
5. Aktifkan Pages (pilih salah satu):
   - Dengan GitHub CLI: `gh api -X POST repos/USERNAME/pondok-pesantren/pages -f "source[branch]=main" -f "source[path]=/"`
   - Atau di browser: repo → **Settings → Pages → Branch: main / (root) → Save**.
6. Tunggu ±1 menit. Situs: `https://USERNAME.github.io/pondok-pesantren/` · Admin: `.../admin.html`.
7. Jika memakai login Google, pastikan origin di langkah A7 sama persis dengan `https://USERNAME.github.io`.

**Memperbarui situs:** ubah file → `git add . && git commit -m "ubah" && git push`.

---

## C. Uji cepat
- Buka situs publik → bagian-bagian tampil, ganti mode terang/gelap.
- Isi formulir pendaftaran (dengan foto) → catat nomor & token → coba **Cek Status**.
- Buka `/admin.html` → login (Google, atau **Login darurat Superadmin** dengan email pemilik skrip + sandi darurat).
- Admin → Pendaftar → ubah status → cek notifikasi email.

## D. Go-live
1. Admin → **Pengaturan → Data Contoh → Hapus semua data contoh**.
2. Ganti isi **Konten Situs** (Beranda, Profil, Kontak, dst.), atur **Periode & Kuota**, sesuaikan **Tema**.
3. **Pengaturan → Sandi Darurat**: ganti dengan sandi Anda sendiri.
4. *(Opsional WhatsApp)* daftar di Fonnte, hubungkan nomor, isi `FONNTE_TOKEN` di **Pengaturan → Kunci & Rahasia**, lalu aktifkan di **WhatsApp & Notifikasi → Kanal & Event**. Tanpa ini, email tetap terkirim dan halaman sukses menyediakan tombol WhatsApp (wa.me).
5. **Migrasi & Backup**: backup otomatis tiap tanggal 1 pukul 02.00; tombol backup manual tersedia. Impor data lama lewat tab **Impor Data** (selalu *Pindai* dulu).

## Masalah umum
| Gejala | Solusi |
|---|---|
| "GAS_URL belum diatur" | Isi `js/config.js` lalu push ulang. |
| "Sesi berakhir" terus | Deploy ulang sebagai **New version**; pastikan akses **Anyone**. |
| Login Google gagal | Origin OAuth harus `https://USERNAME.github.io`; `GOOGLE_CLIENT_ID` terisi; email terdaftar di Admin. |
| Data tidak berubah di publik | Cache ±10 menit; simpan dari admin otomatis membersihkannya. |
| Perubahan backend tak berlaku | Manage deployments → Edit → New version. |
| Email tidak terkirim | Kuota harian MailApp; cek **WhatsApp & Notifikasi → Antrean**. |

Keamanan: semua rahasia (token, Client ID, sandi) disimpan di **Script Properties**, tidak ada di repo. Repo publik hanya berisi URL Web App (bukan rahasia).
