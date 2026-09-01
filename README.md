<div align="center">

![XyCloud Policy](public/og.png)

# XyCloud Policy

**Tata Tertib & Kebijakan Grup / Saluran WhatsApp — XyCloud | Official**

Website statis + API publik + widget embed. Satu file JSON jadi sumber kebenaran untuk semuanya.

[![Live](https://img.shields.io/badge/live-rules.xyc.my.id-25d366?style=flat-square)](https://rules.xyc.my.id)
[![API](https://img.shields.io/badge/API-public%20%C2%B7%20no%20key-075e54?style=flat-square)](https://rules.xyc.my.id/api/policy)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[Website](https://rules.xyc.my.id) · [Dokumentasi API](https://rules.xyc.my.id/docs.html) · [Endpoint JSON](https://rules.xyc.my.id/api/policy)

</div>

---

## Apa Ini

Halaman aturan komunitas yang biasanya cuma jadi pesan tersemat yang ga pernah dibaca, dijadikan website beneran — lengkap dengan SEO, Open Graph, dan API supaya komunitas lain bisa ikut memakainya.

Aturan intinya satu: **member yang keluar atau dikeluarkan dari Grup tidak bisa bergabung kembali.** Sisanya turunan dari situ.

## Fitur

| | |
|---|---|
| **Dua versi** | `/` versi publik (SEO-friendly) dan `/internal.html` versi blak-blakan (`noindex`) |
| **Satu sumber data** | Semua teks ada di [`data/policy.json`](data/policy.json). Edit di situ, jalankan build, semua ikut berubah |
| **API publik** | JSON, HTML, Markdown, dan teks polos. Tanpa API key, CORS terbuka |
| **Widget embed** | Satu baris `<script>` untuk menempelkan kebijakan di website mana pun |
| **SEO lengkap** | Canonical, hreflang, robots, sitemap, dan 5 blok JSON-LD (WebSite, WebPage, Organization, FAQPage, BreadcrumbList) |
| **Open Graph penuh** | Banner 1200×630 untuk WhatsApp, Facebook, X, Telegram, Discord, LinkedIn, Threads, Pinterest |
| **Nol dependensi** | Tidak ada `node_modules`. HTML, CSS, dan JS murni |

## Struktur

```
xycloud-policy/
├── data/policy.json        # sumber kebenaran — edit di sini
├── scripts/
│   ├── build.mjs           # generator HTML, sitemap, robots, manifest, favicon
│   └── serve.mjs           # dev server lokal + emulasi /api
├── api/
│   ├── policy.js           # GET /api/policy
│   └── health.js           # GET /api/health
├── public/                 # hasil build + aset statis
│   ├── index.html          # (generated) versi publik
│   ├── internal.html       # (generated) versi internal
│   ├── docs.html           # dokumentasi API
│   ├── embed.js            # widget
│   └── og.png              # banner Open Graph 1200×630
└── vercel.json
```

## Jalankan Lokal

Butuh Node 18+. Tidak ada dependensi yang perlu diinstal.

```bash
git clone https://github.com/xykalnotkel/xycloud-policy.git
cd xycloud-policy

npm run dev      # build + serve di http://localhost:3000
npm run build    # build saja
```

## API

Base URL: `https://rules.xyc.my.id`

```bash
curl "https://rules.xyc.my.id/api/policy"                          # semua, JSON
curl "https://rules.xyc.my.id/api/policy?format=index"             # daftar section
curl "https://rules.xyc.my.id/api/policy?section=promosi"          # satu section
curl "https://rules.xyc.my.id/api/policy?format=markdown"          # Markdown
curl "https://rules.xyc.my.id/api/policy?format=text"              # teks polos (buat bot)
curl "https://rules.xyc.my.id/api/health"                          # status
```

**Parameter:** `format` (json·html·markdown·text·index) · `section` (id/nomor) · `version` (public·internal) · `pretty` (1)

**Section:** `keluar-masuk` `aturan-harian` `promosi` `transaksi` `ketipu` `member-batu` `larangan` `sanksi` `saluran` `privasi` `admin`

Dokumentasi lengkap dengan contoh React, PHP, dan bot: **[rules.xyc.my.id/docs.html](https://rules.xyc.my.id/docs.html)**

## Widget

```html
<div id="xyc-policy"></div>
<script src="https://rules.xyc.my.id/embed.js" defer></script>
```

Dengan opsi:

```html
<script src="https://rules.xyc.my.id/embed.js"
        data-target="#kebijakan"
        data-theme="dark"
        data-section="promosi"
        data-accent="#00ff88"
        defer></script>
```

`data-theme` mengikuti `prefers-color-scheme` secara default, dan widget memancarkan event `xyc:policy:loaded` setelah render.

## Pakai untuk Komunitas Sendiri

Boleh, gratis, lisensi MIT. Dua syarat:

1. **Minta izin dulu** ke [Admin XyCloud](https://wa.me/6283116632566) sebelum dipakai.
2. **Cantumkan kredit** balik ke `rules.xyc.my.id`. Widget sudah otomatis menambahkannya — mohon jangan dimatikan.

Kalau mau fork total, cukup ubah blok `meta` di `data/policy.json` (nama, domain, nomor admin, tag, keyword), lalu `npm run build`.

## Deploy

Dirancang untuk Vercel, tapi jalan di mana saja.

- **Static host** (Netlify, Cloudflare Pages, GitHub Pages): deploy folder `public/`. API tidak ikut, tapi website tetap utuh.
- **Dengan API**: butuh runtime Node 18+ untuk folder `api/`.

```bash
vercel --prod
```

## Kontribusi

Isu dan pull request diterima. Untuk perubahan teks aturan, edit `data/policy.json` — jangan edit `public/index.html` atau `public/internal.html` langsung karena akan tertimpa saat build.

## Lisensi

[MIT](LICENSE) © 2026 XyCloud | Official
