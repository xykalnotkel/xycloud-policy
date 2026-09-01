# Audit Keamanan, Bug, SEO, A11y & Performa — XyDev

Tanggal: 2026-09-02 · Base: `main` @ `bb7fbd6` · Status: semua temuan "fix" sudah diterapkan & diverifikasi.

Metode: setiap klaim diverifikasi lewat perintah nyata (curl, handler dipanggil langsung,
unit tes fungsi, render ulang build). Yang tidak kebukti **dicoret** dan dicatat di bawah.

---

## A. Temuan yang DIFIX

### Keamanan

| # | Temuan | Bukti sebelum | Fix |
|---|--------|---------------|-----|
| 1 | **Versi internal bocor lewat API publik** — `GET /api/policy?version=internal` (CORS `*`) mengembalikan 5 section berisi teks blak-blakan (9 item + 4 note beda vs publik); `embed.js` bahkan bisa menempelnya di situs pihak ketiga lewat `data-version="internal"`. | `curl /api/policy?version=internal` → 200 + isi internal | `api/policy.js`: default **403 `internal_terkunci`**; terbuka hanya bila env `POLICY_INTERNAL_KEY` diset DAN pemanggil mengirim header `X-Policy-Internal-Key` / `?key=` yang sama. `embed.js`: opsi internal dihapus, selalu versi publik. Docs & README diperbarui. |
| 2 | **HTML policy tidak disanitasi** di `build.mjs` — item/note/alert/footer disisipkan mentah; satu `<script>`/`onerror` yang nyelip ke `policy.json` langsung jalan di dua halaman utama. | `grep pick(` di build.mjs | Semua titik lewat `rich()`: escape total, baru `<b>` polos dibuka lagi. Diuji: 10 payload (script, img onerror, `<b onmouseover>`, svg onload, dll) → satu-satunya tag yang lolos `<b>` tanpa atribut. |
| 3 | **Gate popup fail-open** — saat kebijakan gagal dimuat, popup menawarkan tombol "Lanjut Aja" yang membuka link tanpa membaca apa pun. Gate yang bisa dilewati begitu saja bukan gate. | kode `gate.js` | Fail-closed: hanya "Tutup" + "Coba Lagi"; retry memuat ulang kebijakan. |
| 4 | **Open redirect / eksekusi via `XycGate.open(href)`** — href dipakai buat `location.href` tanpa cek protokol. | kode `gate.js` | `safeHref()` hanya mengizinkan `https:`, `http:`, `mailto:`, `tel:`. Diuji: `javascript:`, `data:`, `vbscript:`, `//host` ditolak. |
| 5 | **CSS injection via `data-accent`** di `embed.js` & `gate.js` — nilai masuk mentah ke `<style>`. | kode | `safeAccent()` hanya hex `#rgb…` atau nama warna polos; sisanya fallback `#25d366`. Diuji 13 kasus. |
| 6 | **`reply_to` tanpa validasi** di `api/feedback.js` — string apa pun asal mengandung `@` jadi `reply_to` (admin bisa membalas ke alamat tak terduga, termasuk percobaan injeksi). | kode | `isEmail()` ketat; diuji 12 kasus termasuk `a@b.com\nBcc:` ditolak. |
| 7 | **Link WhatsApp rusak** — kontak non-numerik menghasilkan `href="https://wa.me/"` kosong di email admin. | kode | `waNumber()` (8–15 digit); link hanya dirender bila valid. Diuji lewat intercept fetch. |
| 8 | **IP rate limit dipalsukan tanpa fallback** — `x-forwarded-for` dipercaya buta di luar Vercel. | kode | `clientIp()` fallback ke `req.socket.remoteAddress`. |

### Bug

| # | Temuan | Fix |
|---|--------|-----|
| 9 | Dev server meng-import modul per-request (`?t=Date.now()`) → state modul (rate limiter) tidak pernah hidup di lokal, menyesatkan saat tes. | `serve.mjs`: cache modul + invalidasi mtime. Terbukti: request ke-6 kini 429 `kebanyakan_kirim`. |
| 10 | `/api/status` memanggil `GET api.resend.com/domains` **tiap request**; endpoint publik tanpa rate limit dan terdaftar di sitemap → bot bisa menguras kuota Resend. | Cache hasil 60 detik. Terbukti: 3 request → fetch Resend 1x. |
| 11 | `robots.txt`: blok `User-agent: GPTBot` menimpa blok `*`, dan di dalamnya **tidak** ada `Disallow: /internal` → GPTBot justru boleh merayap halaman rahasia. | Disallow ditambahkan ke kedua blok. |

### SEO / Metadata

| # | Temuan | Fix |
|---|--------|-----|
| 12 | `og:locale:alternate en_US` padahal tidak ada versi bahasa Inggris. | Dibuang. |
| 13 | `og:updated_time` / `article:*_time` berisi `YYYY-MM-DD` (validator minta ISO 8601 lengkap). | `isoDate()` → `2026-09-01T00:00:00+08:00` (WITA, konsisten dengan feedback). |
| 14 | `BreadcrumbList` JSON-LD item-2 menunjuk dirinya sendiri + fragment. | Fragment dibuang. |
| 15 | `/internal` tidak punya `meta description` & `og:url` → preview link sebarannya kosong. | Ditambahkan (tetap `noindex`). |
| 16 | `apple-touch-icon` menunjuk `og.png` 1200×630; manifest cuma satu ikon non-persegi → PWA/install bermasalah. | Ikon persegi 180/192/512 dirender saat build dari favicon vektor; manifest pakai 192+512; `apple-touch-icon` → `icon-180.png`; `mask-icon` ditambahkan. Terbukti persegi via parser PNG. |

### Aksesibilitas

| # | Temuan | Fix |
|---|--------|-----|
| 17 | Modal feedback tanpa focus trap & tanpa kembalikan fokus. | Trap Tab/Shift+Tab, fokus masuk saat buka, kembali saat tutup. |
| 18 | Tidak ada skip link; progress bar tidak `aria-hidden`; tidak ada `prefers-reduced-motion`; focus ring tidak kelihatan. | Skip link "Lewati ke isi", `aria-hidden` di `#bar`, media query reduced-motion, `:focus-visible` ring, `aria-describedby` di dialog. |

### Performa / Cache

| # | Temuan | Fix |
|---|--------|-----|
| 19 | `og*.png` total 875 KB — berat buat preview WhatsApp/Telegram. | pngquant (quality 80–95): total **185 KB (−78,8%)**, selisih piksel rata-rata ≤1,3/255, dicek visual. |
| 20 | `/gate.js` tidak punya `Cache-Control` (embed.js punya); halaman `/` bisa di-cache lama. | `vercel.json`: `gate.js` + `embed.js` 1 jam `must-revalidate`; `/` `max-age=0, must-revalidate`. |

---

## B. Yang gue curigai tapi TIDAK terbukti (dicoret)

| Dugaan awal | Hasil verifikasi |
|-------------|------------------|
| Rate limiter feedback tidak bekerja (8 request tanpa 429) | Logikanya benar (429 mulai request ke-6). Yang rusak dev server-nya (bug #9), bukan limiter-nya. |
| Kontras warna `#54656f` dll gagal WCAG | Dihitung: semua pasangan ≥ 5,40:1 — lolos AA untuk ukuran teksnya. |
| PnP/ESM/`yarn i` (sesi env) | Bukan bagian proyek ini; sudah dijelaskan di sesi sebelumnya. |

## C. Verifikasi akhir (live, server `npm run dev`)

- 25/25: semua rute lama 200, 404 tetap 404, `?version=internal` → 403 (3 variasi).
- Kombinasi env/kunci diuji ulang dengan quoting bersih (5/5): env+key benar 200, key salah 403,
  header benar 200, tanpa env 403, publik 200. (Dua baris "GAGAL" di tengah verifikasi ternyata
  bug quoting `node -e` di harness tes gue sendiri, bukan bug kode — diganti tes bersih di atas.)
- Rate limit: 429 tepat di request ke-6 dari IP sama.
- Payload Resend (fetch dicegat): reply_to hanya untuk email valid; link `wa.me` hanya untuk nomor valid; injeksi ditolak.
- Cache status: 3 request → 1 fetch Resend.
- CI repo (`validate` → `build` → `check output`) dijalankan persis: semua lolos.
- Scan a11y semua HTML: bersih (img alt, lang, satu h1, skip link, focus ring, reduced-motion).
- `node --check` untuk semua JS yang disentuh; build deterministik (git status sesudah build tetap sama).

## D. Breaking change yang disengaja (perlu keputusan owner saat deploy)

1. `?version=internal` di API kini **403 secara default**. Kalau memang mau dibuka, set env `POLICY_INTERNAL_KEY` di Vercel.
2. `embed.js` tidak lagi mendukung `data-version="internal"`.
3. Halaman `/internal` tidak berubah (tetap noindex, tetap bisa dibuka langsung).

## E. Belum disentuh (catatan, bukan temuan)

- Tidak ada CSP header — bisa dipertimbangkan, tapi `X-Frame-Options: SAMEORIGIN` + `nosniff` sudah ada dan tidak ada konten user yang dirender sebagai HTML.
- `vercel.json` tetap tanpa `rewrites`; clean URL ditangani host (sudah jalan di production).
