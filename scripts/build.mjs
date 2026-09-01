import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/policy.json'), 'utf8'));
const M = policy.meta;

const pick = (obj, v) => (v === 'internal' && obj.internal ? obj.internal : obj.public);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const waLink = (phone, text) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background:#ece5dd;color:#111b21;line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:780px;margin:0 auto;padding:0 18px 60px}
header{background:linear-gradient(160deg,#075e54 0%,#128c7e 100%);color:#fff;padding:46px 18px 40px;text-align:center}
.badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);padding:5px 14px;border-radius:999px;font-size:12px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}
.badge.warn{background:#d92d20;border-color:#f97066}
header h1{font-size:27px;line-height:1.3;font-weight:700;max-width:620px;margin:0 auto}
header .grup{font-size:19px;font-weight:700;margin-top:12px;letter-spacing:.5px}
header p.meta{margin-top:14px;opacity:.85;font-size:13.5px}
.tags{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.tag{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);padding:4px 12px;border-radius:999px;font-size:12.5px}
.alert{background:#fff;border-left:6px solid #d92d20;border-radius:12px;padding:22px 24px;margin:-24px 0 26px;box-shadow:0 6px 22px rgba(0,0,0,.10)}
.alert h2{font-size:17px;color:#d92d20;margin-bottom:8px}
.alert p{font-size:15px}
.alert p+p{margin-top:8px}
.alert b{background:#fee4e2;padding:1px 5px;border-radius:4px}
nav.toc{background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
nav.toc h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#54656f;margin-bottom:12px}
nav.toc ol{list-style:none;counter-reset:t;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px}
nav.toc li{counter-increment:t;padding-left:0;margin:0}
nav.toc li::before{display:none}
nav.toc a{color:#075e54;text-decoration:none;font-size:14.5px;display:block;padding:5px 0}
nav.toc a::before{content:counter(t) ". ";color:#25d366;font-weight:700}
nav.toc a:hover{text-decoration:underline}
.card{background:#fff;border-radius:12px;padding:24px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06);scroll-margin-top:16px}
.card h2{font-size:17px;color:#075e54;margin-bottom:14px;display:flex;align-items:center;gap:10px}
.num{background:#25d366;color:#fff;min-width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}
.sub{font-size:13.5px;color:#54656f;margin:-6px 0 14px;padding-left:36px}
ul{list-style:none}
li{position:relative;padding-left:26px;margin-bottom:10px;font-size:15px}
li::before{content:"";position:absolute;left:8px;top:11px;width:7px;height:7px;border-radius:50%;background:#25d366}
li.no::before{background:#d92d20}
.note{font-size:13.5px;color:#54656f;background:#f0f2f5;border-radius:8px;padding:12px 14px;margin-top:14px}
.note.keras{background:#fef3f2;color:#912018;border:1px solid #fecdca}
details{background:#fff;border-radius:10px;margin-bottom:10px;box-shadow:0 2px 8px rgba(0,0,0,.05);overflow:hidden}
summary{cursor:pointer;padding:15px 18px;font-weight:600;font-size:15px;color:#075e54;list-style:none;display:flex;justify-content:space-between;gap:12px}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";font-size:20px;color:#25d366;line-height:1}
details[open] summary::after{content:"-"}
details p{padding:0 18px 16px;font-size:14.5px;color:#3b4a54}
.section-title{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#54656f;margin:30px 0 12px;font-weight:700}
.cta{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
.btn{display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14.5px;font-weight:600;transition:.15s}
.btn:hover{background:#1eb85a}
.btn.alt{background:#075e54}
.btn.alt:hover{background:#0a7168}
.btn.ghost{background:transparent;color:#075e54;border:1.5px solid #075e54}
.btn.ghost:hover{background:#075e54;color:#fff}
code{background:#f0f2f5;padding:2px 6px;border-radius:4px;font-size:13.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:#0f1b17;color:#c8f5d8;padding:16px;border-radius:10px;overflow-x:auto;font-size:13px;line-height:1.6;margin:12px 0}
pre code{background:none;padding:0;color:inherit}
footer{text-align:center;font-size:13px;color:#54656f;padding-top:26px;border-top:1px solid #d1d7db;margin-top:30px}
footer b{color:#075e54}
footer a{color:#075e54}
.switch{text-align:center;margin:22px 0 4px}
.switch a{font-size:13px;color:#54656f}
@media(max-width:520px){header h1{font-size:22px}.card{padding:20px 18px}}
`.trim();

function renderSections(v) {
  return policy.sections.map((s, i) => {
    const items = s.items.map(it => `        <li class="${it.type === 'no' ? 'no' : ''}">${pick(it, v)}</li>`).join('\n');
    const note = s.note ? `\n      <div class="note ${s.note.type === 'keras' ? 'keras' : ''}">${pick(s.note, v)}</div>` : '';
    return `    <section class="card" id="${s.id}">
      <h2><span class="num">${i + 1}</span> ${esc(s.title)}</h2>
      <div class="sub">${esc(s.sub)}</div>
      <ul>
${items}
      </ul>${note}
    </section>`;
  }).join('\n\n');
}

function renderToc() {
  return `    <nav class="toc" aria-label="Daftar isi">
      <h2>Daftar Isi</h2>
      <ol>
${policy.sections.map(s => `        <li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('\n')}
      </ol>
    </nav>`;
}

function renderFaq() {
  return policy.faq.map(f => `    <details>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join('\n');
}

function jsonLd() {
  const data = [
    {
      '@context': 'https://schema.org', '@type': 'WebSite',
      name: `${M.name} - ${M.title}`, url: M.url, inLanguage: 'id-ID',
      publisher: { '@type': 'Organization', name: M.name, url: M.url, logo: `${M.url}/og.png` }
    },
    {
      '@context': 'https://schema.org', '@type': 'WebPage',
      name: `${M.title} - ${M.name}`, url: M.url, description: M.description,
      inLanguage: 'id-ID', datePublished: M.effective, dateModified: M.updated,
      primaryImageOfPage: { '@type': 'ImageObject', url: `${M.url}/og.png`, width: 1200, height: 630 }
    },
    {
      '@context': 'https://schema.org', '@type': 'Organization',
      name: M.name, url: M.url, logo: `${M.url}/og.png`, description: M.tagline,
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', telephone: `+${M.adminPhone}`, availableLanguage: ['id'] }]
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: policy.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    },
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Beranda', item: M.url },
        { '@type': 'ListItem', position: 2, name: M.title, item: `${M.url}/#keluar-masuk` }
      ]
    }
  ];
  return data.map(d => `<script type="application/ld+json">${JSON.stringify(d)}</script>`).join('\n  ');
}

function buildPage(v) {
  const isInternal = v === 'internal';
  const pageTitle = isInternal
    ? `[INTERNAL] Tata Tertib Grup - ${M.name}`
    : `${M.title} WhatsApp - ${M.name}`;
  const pageDesc = isInternal
    ? 'Versi internal tanpa sensor. Khusus member grup XyCloud | Official.'
    : M.description;

  const seo = isInternal ? `
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex">
  <meta name="googlebot" content="noindex,nofollow">` : `
  <meta name="description" content="${esc(pageDesc)}">
  <meta name="keywords" content="${esc(M.keywords.join(', '))}">
  <meta name="author" content="${esc(M.name)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="googlebot" content="index,follow">
  <link rel="canonical" href="${M.url}/">
  <link rel="alternate" hreflang="id" href="${M.url}/">
  <link rel="alternate" hreflang="x-default" href="${M.url}/">

  <!-- Open Graph : Facebook, WhatsApp, Threads, LinkedIn, Discord, Telegram -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(M.name)}">
  <meta property="og:locale" content="id_ID">
  <meta property="og:locale:alternate" content="en_US">
  <meta property="og:url" content="${M.url}/">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(pageDesc)}">
  <meta property="og:image" content="${M.url}/og.png">
  <meta property="og:image:secure_url" content="${M.url}/og.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Banner Tata Tertib &amp; Kebijakan Grup ${esc(M.name)}">
  <meta property="og:updated_time" content="${M.updated}">
  <meta property="article:published_time" content="${M.effective}">
  <meta property="article:modified_time" content="${M.updated}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(pageDesc)}">
  <meta name="twitter:image" content="${M.url}/og.png">
  <meta name="twitter:image:alt" content="Banner Tata Tertib ${esc(M.name)}">

  <!-- Pinterest / Telegram / misc -->
  <meta name="pinterest-rich-pin" content="true">
  <meta name="telegram:channel" content="${esc(M.name)}">
  <meta itemprop="name" content="${esc(pageTitle)}">
  <meta itemprop="description" content="${esc(pageDesc)}">
  <meta itemprop="image" content="${M.url}/og.png">

  ${jsonLd()}`;

  const alertBox = `    <div class="alert">
      <h2>${esc(policy.alert.title)}</h2>
${policy.alert.paras.map(p => `      <p>${pick(p, v)}</p>`).join('\n')}
    </div>`;

  const apiBlock = isInternal ? '' : `
    <section class="card" id="api">
      <h2><span class="num">API</span> Pakai Kebijakan Ini di Web Lu</h2>
      <div class="sub">Open source, gratis, lisensi MIT. Boleh dipakai siapa aja asal izin dan cantumin kredit.</div>
      <ul>
        <li>Ambil datanya real time lewat API publik, format JSON / HTML / Markdown / teks.</li>
        <li>Atau tempel satu baris script, langsung jadi halaman kebijakan di web lu.</li>
        <li>CORS dibuka untuk semua origin. Ga perlu API key, ga perlu daftar.</li>
        <li>Wajib izin dulu ke admin sebelum dipakai untuk komunitas lain, dan cantumkan kredit balik ke <code>rules.xyc.my.id</code>.</li>
      </ul>
      <pre><code>&lt;!-- Cara 1: widget instan --&gt;
&lt;div id="xyc-policy"&gt;&lt;/div&gt;
&lt;script src="${M.url}/embed.js" defer&gt;&lt;/script&gt;

&lt;!-- Cara 2: ambil JSON --&gt;
fetch('${M.url}/api/policy')
  .then(r =&gt; r.json())
  .then(d =&gt; console.log(d.sections));</code></pre>
      <div class="cta">
        <a class="btn ghost" href="/api/policy" target="_blank" rel="noopener">Lihat API JSON</a>
        <a class="btn ghost" href="/docs">Dokumentasi API</a>
        <a class="btn ghost" href="${M.repo}" target="_blank" rel="noopener">Source Code</a>
      </div>
    </section>`;

  const contact = `
    <section class="card" id="kontak">
      <h2><span class="num">?</span> Kontak &amp; Pelaporan</h2>
      <div class="sub">Ada masalah, laporan penipuan, atau mau izin pakai kebijakan ini.</div>
      <ul>
        <li>Laporan penipuan wajib bawa <b>bukti chat + bukti transfer</b>. Tanpa bukti ga diproses.</li>
        <li>Izin pemakaian kebijakan untuk komunitas lain juga lewat kontak yang sama.</li>
        <li>Admin bukan CS 24 jam. Balasan menyesuaikan waktu luang.</li>
      </ul>
      <div class="cta">
        <a class="btn" href="${waLink(M.adminPhone, 'Halo Admin XyCloud, saya mau melapor / bertanya soal tata tertib grup.')}" target="_blank" rel="noopener">Japri Admin</a>
        <a class="btn alt" href="${waLink(M.adminPhone, 'Halo Admin XyCloud, saya mau minta izin memakai kebijakan dari rules.xyc.my.id untuk komunitas saya.')}" target="_blank" rel="noopener">Izin Pakai Kebijakan</a>
      </div>
    </section>`;

  const switcher = isInternal
    ? `    <div class="switch"><a href="/">&larr; Balik ke versi publik</a></div>`
    : `    <div class="switch"><a href="/internal">Versi internal (blak-blakan) &rarr;</a></div>`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(pageTitle)}</title>
  <meta name="theme-color" content="#075e54">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/og.png">
  <link rel="manifest" href="/site.webmanifest">${seo}
  <style>${CSS}</style>
</head>
<body>

<header>
  <div class="badge${isInternal ? ' warn' : ''}">${isInternal ? 'Versi Internal - Tanpa Sensor' : 'Dokumen Resmi Grup &amp; Saluran'}</div>
  <h1>${esc(M.title)}</h1>
  <div class="grup">${M.nameStyled}</div>
  <div class="tags">
${M.tags.map(t => `    <span class="tag">${esc(t)}</span>`).join('\n')}
  </div>
  <p class="meta">Versi ${M.version} &middot; Berlaku untuk SEMUA member tanpa kecuali &middot; Update: ${M.updated}</p>
</header>

<div class="wrap">

${alertBox}

${renderToc()}

${renderSections(v)}

  <h2 class="section-title">FAQ - Biar Ga Nanya Berulang-ulang</h2>
${renderFaq()}
${apiBlock}
${contact}
${switcher}

  <footer>
    <p>${pick(policy.footer, v)}</p>
    <p style="margin-top:10px">&copy; 2026 <b>${M.nameStyled}</b> &middot; ${esc(M.tagline)}</p>
    <p style="margin-top:6px">Open source (MIT) &middot; <a href="${M.repo}" target="_blank" rel="noopener">GitHub</a> &middot; <a href="/api/policy">API</a> &middot; <a href="/docs">Docs</a></p>
  </footer>

</div>
</body>
</html>
`;
}

// ---- write outputs ----
const pub = path.join(root, 'public');
fs.mkdirSync(pub, { recursive: true });

fs.writeFileSync(path.join(pub, 'index.html'), buildPage('public'));
fs.writeFileSync(path.join(pub, 'internal.html'), buildPage('internal'));

fs.writeFileSync(path.join(pub, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /internal
Disallow: /internal.html

User-agent: GPTBot
Allow: /

Sitemap: ${M.url}/sitemap.xml
`);

fs.writeFileSync(path.join(pub, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${M.url}/</loc>
    <lastmod>${M.updated}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${M.url}/og.png</image:loc>
      <image:title>Tata Tertib &amp; Kebijakan Grup ${M.name}</image:title>
    </image:image>
  </url>
  <url>
    <loc>${M.url}/docs</loc>
    <lastmod>${M.updated}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
`);

fs.writeFileSync(path.join(pub, 'site.webmanifest'), JSON.stringify({
  name: `${M.title} - ${M.name}`, short_name: 'XyCloud Rules',
  description: M.description, start_url: '/', display: 'standalone',
  background_color: '#ece5dd', theme_color: '#075e54', lang: 'id',
  icons: [{ src: '/og.png', sizes: '1200x630', type: 'image/png', purpose: 'any' }]
}, null, 2));

fs.writeFileSync(path.join(pub, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#075e54"/><path d="M32 12l16 6v13c0 11-7 19-16 21-9-2-16-10-16-21V18l16-6z" fill="none" stroke="#25d366" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="34" r="5" fill="#25d366"/></svg>`);

console.log('[build] index.html, internal.html, robots.txt, sitemap.xml, manifest, favicon -> public/');
