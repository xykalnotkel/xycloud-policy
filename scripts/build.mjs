import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// ===== Dua bahasa, satu struktur =====
// policy.json  = Bahasa Indonesia (kanonik, default)
// policy.en.json = English (struktur identik, id section disamakan
//                  supaya hreflang & filter ?section= tetap konsisten)
const POLICIES = {
  id: JSON.parse(fs.readFileSync(path.join(root, 'data/policy.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(root, 'data/policy.en.json'), 'utf8'))
};
const M = POLICIES.id.meta; // meta untuk robots/sitemap/manifest (netral bahasa)

const pick = (o, v) => (v === 'internal' && o.internal ? o.internal : o.public);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Meta OG & article:* minta timestamp ISO 8601 lengkap. Data cuma punya YYYY-MM-DD,
// dan sebagian validator menolak nilai tanggal polos di properti ini.
const isoDate = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? `${d}T00:00:00+08:00` : String(d));

// Teks kebijakan boleh pakai <b> buat penekanan, dan itu sengaja.
// Tapi sebelumnya isi policy.json disisipkan ke HTML mentah-mentah tanpa disaring:
// satu <script> atau <img onerror=...> yang nyelip ke JSON langsung jalan di browser.
// Cara amannya: escape dulu semuanya, baru buka lagi khusus <b>. Tag lain tetap mati.
const rich = (s) => esc(s)
  .replace(/&lt;b&gt;/g, '<b>')
  .replace(/&lt;\/b&gt;/g, '</b>');

// ===== String antarmuka halaman (chrome), per bahasa =====
// Konten kebijakan ada di data/policy*.json; yang di sini cuma label halaman.
const UI = {
  id: {
    htmlLang: 'id',
    ogLocale: 'id_ID',
    schemaLang: 'id-ID',
    skip: 'Lewati ke isi',
    tocTitle: 'Loncat ke bagian',
    tocAria: 'Daftar isi',
    faqTitle: 'Yang sering ditanyain',
    badgePublic: 'Grup &amp; Saluran Resmi',
    badgeInternal: 'Versi Internal - Tanpa Sensor',
    internalDesc: 'Versi internal tanpa sensor. Khusus member grup XyCloud | Official.',
    metaLine: (m) => `Versi ${m.version} &middot; Update ${m.updated} &middot; Baca santai ${m.readMinutes} menit`,
    switchPublic: 'Versi internal (blak-blakan) &rarr;',
    switchInternal: '&larr; Balik ke versi publik',
    home: 'Beranda',
    api: {
      title: 'Mau Pakai Kebijakan Ini?',
      sub: 'Gratis, open source, lisensi MIT. Boleh dipakai siapa aja asal izin dan cantumin kredit.',
      items: [
        'Tarik datanya real time lewat API publik. Format JSON, HTML, Markdown, atau teks polos.',
        'Atau tempel satu baris script, langsung jadi halaman kebijakan lengkap di web lu.',
        'Punya link bio? Pasang <b>gate popup</b>: orang harus baca kebijakan dan pencet setuju dulu sebelum link WhatsApp-nya kebuka.',
        'Tanpa API key, tanpa daftar, CORS kebuka buat semua origin.'
      ],
      demo: 'Coba Gate Popup',
      docs: 'Dokumentasi API',
      src: 'Source Code'
    },
    fb: {
      title: 'Menurut lu kebijakan ini gimana?',
      q: 'Jujur aja, ga usah sungkan. Masukannya langsung masuk ke admin.',
      up: 'Bagus',
      down: 'Kurang',
      done: 'Makasih ya, masukannya udah masuk.',
      titleLike: 'Mantap, bagian mana yang paling kena?',
      titleBad: 'Bagian mana yang bikin ganjel?',
      desc: 'Pilih yang paling relevan, terus ceritain dikit. Anonim kok, kecuali lu isi kontaknya sendiri.',
      textLabel: 'Ceritain dikit',
      textPh: 'Tulis apa adanya di sini...',
      contactLabel: 'Kontak (opsional, kalau mau dibales)',
      contactPh: 'Nomor WA atau email',
      cancel: 'Batal',
      send: 'Kirim ke Admin',
      sending: 'Ngirim...',
      errEmpty: 'Pilih minimal satu alasan atau tulis sesuatu dulu.',
      errFail: 'Gagal ngirim (',
      errFail2: '). Coba lagi atau japri admin langsung.',
      reasons: ['Kepanjangan', 'Bahasanya kasar', 'Terlalu ketat', 'Ada yang ga jelas', 'Ga setuju sama aturan keluar-masuk', 'Lainnya']
    },
    contact: {
      title: 'Kontak &amp; Lapor',
      sub: 'Ada masalah, mau lapor penipuan, atau mau izin pakai kebijakan ini.',
      items: [
        'Lapor penipuan wajib bawa <b>bukti chat plus bukti transfer</b>. Tanpa itu susah diproses.',
        'Semua pengumuman resmi keluarnya dari Saluran. Kalau ragu, cek ke sana dulu.',
        'Admin bukan CS 24 jam, dibales kalau lagi sempet.'
      ],
      wa1: 'Halo Admin XyCloud, saya mau nanya/lapor soal kebijakan grup.',
      cta1: 'Japri Admin',
      cta2: 'Ikuti Saluran Resmi',
      wa2: 'Halo Admin XyCloud, saya mau izin pakai kebijakan dari rules.xyc.my.id untuk komunitas saya.',
      cta3: 'Izin Pakai Kebijakan'
    }
  },
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    schemaLang: 'en',
    skip: 'Skip to content',
    tocTitle: 'Jump to a section',
    tocAria: 'Table of contents',
    faqTitle: 'Frequently asked questions',
    badgePublic: 'Official Group &amp; Channel',
    badgeInternal: 'Internal Version - Uncensored',
    internalDesc: 'Uncensored internal version. For XyCloud | Official group members only.',
    metaLine: (m) => `Version ${m.version} &middot; Updated ${m.updated} &middot; ${m.readMinutes} min light reading`,
    switchPublic: 'Internal version (uncensored) &rarr;',
    switchInternal: '&larr; Back to public version',
    home: 'Home',
    api: {
      title: 'Want to Use This Policy?',
      sub: 'Free, open source, MIT licensed. Anyone can use it — just ask permission and keep the credit.',
      items: [
        'Pull the data in real time through the public API. JSON, HTML, Markdown, or plain text.',
        'Or paste one line of script and it becomes a full policy page on your own site.',
        'Got a bio link? Install the <b>gate popup</b>: people must read the policy and press Agree before your WhatsApp link opens.',
        'No API key, no sign-up, CORS open to every origin.'
      ],
      demo: 'Try the Gate Popup',
      docs: 'API Docs',
      src: 'Source Code'
    },
    fb: {
      title: 'What do you think of this policy?',
      q: 'Be honest, no need to hold back. Feedback goes straight to admin.',
      up: 'Good',
      down: 'Needs work',
      done: 'Thanks — your feedback just landed.',
      titleLike: 'Nice — which part hit hardest?',
      titleBad: 'Which part doesn&rsquo;t sit right?',
      desc: 'Pick what&rsquo;s most relevant, then tell us a bit more. It&rsquo;s anonymous — unless you fill in your own contact.',
      textLabel: 'Tell us a bit',
      textPh: 'Write it as it is here...',
      contactLabel: 'Contact (optional, if you want a reply)',
      contactPh: 'WhatsApp number or email',
      cancel: 'Cancel',
      send: 'Send to Admin',
      sending: 'Sending...',
      errEmpty: 'Pick at least one reason or write something first.',
      errFail: 'Failed to send (',
      errFail2: '). Try again or message admin directly.',
      reasons: ['Too long', 'The tone is too harsh', 'Too strict', 'Something unclear', 'Disagree with the leave-forever rule', 'Other']
    },
    contact: {
      title: 'Contact &amp; Report',
      sub: 'Got a problem, want to report a scam, or want permission to reuse this policy.',
      items: [
        'Scam reports must include <b>chat logs plus transfer receipts</b>. Without those, it&rsquo;s hard to process.',
        'Every official announcement comes from the Channel. When in doubt, check there first.',
        'Admin is not 24/7 support — replies come when there&rsquo;s time.'
      ],
      wa1: 'Hello XyCloud Admin, I have a question / want to report something about the group policy.',
      cta1: 'Message Admin',
      cta2: 'Follow the Official Channel',
      wa2: 'Hello XyCloud Admin, I would like permission to reuse the policy from rules.xyc.my.id for my community.',
      cta3: 'Request Permission to Reuse'
    }
  }
};

// Path per (versi, bahasa) — dipakai untuk canonical, og:url, hreflang, dan switcher.
function pagePath(v, lang) {
  if (lang === 'en') return v === 'internal' ? '/en/internal' : '/en';
  return v === 'internal' ? '/internal' : '/';
}

// Deteksi bahasa otomatis di sisi klien (bukan deteksi "device/negara" —
// yang bisa dipercaya browser adalah bahasa UI-nya). Aturan main:
//  - hanya jalan kalau pengunjung BELUM pernah milih bahasa manual (localStorage xyc_lang)
//  - browser berbahasa Indonesia -> versi id; selain itu -> versi en
//  - bot crawler & social scraper dikecualikan supaya hreflang/OG tiap URL tetap
//    terbaca apa adanya (Googlebot dirender dengan locale en-US; kalau ikut
//    di-redirect, halaman / berisiko hilang dari index)
//  - kondisi id vs en saling eksklusif -> tidak mungkin redirect loop
function autoLangScript(lang) {
  return `
<script>
(function(){
  try{
    if(localStorage.getItem('xyc_lang'))return;
    var bot=/bot|crawl|spider|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|discord|twitterbot|linkedin|pinterest|lighthouse|headless/i;
    if(bot.test(navigator.userAgent||''))return;
    var ls=navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||''];
    var isId=false;
    for(var i=0;i<ls.length;i++){if(/^id/i.test(ls[i]||'')){isId=true;break}}
    var p=location.pathname.replace(/\\/+$/,'');
    var onEn=p==='/en'||p.indexOf('/en/')===0;
    var q=location.search||'',h=location.hash||'';
    if(!isId&&!onEn){location.replace('/en'+(p==='/'?'':p)+q+h)}
    else if(isId&&onEn){location.replace((p.replace(/^\\/en/,'')||'/')+q+h)}
  }catch(e){}
})();
</script>`;
}

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
.skip{position:absolute;left:-9999px;top:0;background:#075e54;color:#fff;padding:10px 16px;border-radius:0 0 8px 0;font-size:14px;font-weight:600;z-index:80}
.skip:focus{left:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background:#ece5dd;color:#111b21;line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:780px;margin:0 auto;padding:0 18px 60px}

#bar{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#25d366,#128c7e);z-index:60;transition:width .1s linear}

header{background:linear-gradient(160deg,#075e54 0%,#128c7e 100%);color:#fff;padding:46px 18px 40px;text-align:center;position:relative}
.badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);padding:5px 14px;border-radius:999px;font-size:12px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}
.badge.warn{background:#d92d20;border-color:#f97066}
header h1{font-size:30px;line-height:1.25;font-weight:800;letter-spacing:-.5px}
header .grup{font-size:18px;font-weight:700;margin-top:10px}
header p.meta{margin-top:14px;opacity:.85;font-size:13px}
.tags{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.tag{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);padding:4px 12px;border-radius:999px;font-size:12.5px}

.langsw{position:absolute;top:14px;right:14px;display:flex;border:1px solid rgba(255,255,255,.38);border-radius:999px;overflow:hidden;background:rgba(255,255,255,.12)}
.langsw a{padding:5px 13px;font-size:12px;font-weight:700;color:rgba(255,255,255,.78);text-decoration:none;letter-spacing:.4px}
.langsw a.on{background:#25d366;color:#053b34}
.langsw a:not(.on):hover{color:#fff;background:rgba(255,255,255,.16)}
.langsw .dot{align-self:center;width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.35)}

.tldr{background:#075e54;color:#fff;border-radius:14px;padding:24px;margin:-24px 0 18px;box-shadow:0 8px 26px rgba(7,94,84,.28)}
.tldr h2{font-size:18px;margin-bottom:14px}
.tldr ol{list-style:none;counter-reset:z}
.tldr li{counter-increment:z;position:relative;padding-left:38px;margin-bottom:11px;font-size:15.5px}
.tldr li::before{content:counter(z);position:absolute;left:0;top:2px;width:24px;height:24px;border-radius:50%;background:#25d366;color:#053b34;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}
.tldr .cl{margin-top:14px;padding-top:13px;border-top:1px solid rgba(255,255,255,.2);font-size:13.5px;opacity:.88}

.alert{background:#fff;border-left:6px solid #d92d20;border-radius:12px;padding:22px 24px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
.alert h2{font-size:17px;color:#d92d20;margin-bottom:8px}
.alert p{font-size:15px}
.alert p+p{margin-top:8px}
.alert b{background:#fee4e2;padding:1px 5px;border-radius:4px}

.why{background:#fff;border-radius:12px;padding:24px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06);border-top:4px solid #25d366}
.why h2{font-size:17px;color:#075e54;margin-bottom:3px}
.why .sub{font-size:13.5px;color:#54656f;margin-bottom:14px}
.why p{font-size:15px;margin-bottom:12px}
.why p:last-child{margin-bottom:0}

nav.toc{background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06)}
nav.toc h2{font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#54656f;margin-bottom:12px}
nav.toc ol{list-style:none;counter-reset:t;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px}
nav.toc li{counter-increment:t;padding-left:0;margin:0}
nav.toc li::before{display:none}
nav.toc a{color:#075e54;text-decoration:none;font-size:14.5px;display:block;padding:5px 0}
nav.toc a::before{content:counter(t) ". ";color:#25d366;font-weight:700}
nav.toc a:hover{text-decoration:underline}

.card{background:#fff;border-radius:12px;padding:24px;margin-bottom:18px;box-shadow:0 2px 10px rgba(0,0,0,.06);scroll-margin-top:16px}
.card h2{font-size:17px;color:#075e54;margin-bottom:14px;display:flex;align-items:center;gap:10px}
.num{background:#25d366;color:#fff;min-width:26px;height:26px;padding:0 7px;border-radius:13px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0}
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
.btn{display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14.5px;font-weight:600;border:none;cursor:pointer;font-family:inherit;transition:.15s}
.btn:hover{background:#1eb85a}
.btn.alt{background:#075e54}.btn.alt:hover{background:#0a7168}
.btn.ghost{background:transparent;color:#075e54;border:1.5px solid #075e54}
.btn.ghost:hover{background:#075e54;color:#fff}
code{background:#f0f2f5;padding:2px 6px;border-radius:4px;font-size:13.5px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:#0f1b17;color:#c8f5d8;padding:16px;border-radius:10px;overflow-x:auto;font-size:12.8px;line-height:1.6;margin:12px 0}
pre code{background:none;padding:0;color:inherit}

/* feedback */
.fb{background:#fff;border-radius:12px;padding:26px 24px;margin:22px 0 18px;box-shadow:0 2px 10px rgba(0,0,0,.06);text-align:center}
.fb h2{font-size:17px;color:#075e54;margin-bottom:5px}
.fb p.q{font-size:14px;color:#54656f;margin-bottom:16px}
.fb .vote{display:flex;gap:12px;justify-content:center}
.vb{width:120px;padding:14px 10px;border-radius:12px;border:2px solid #d1d7db;background:#fff;cursor:pointer;font-family:inherit;font-size:14.5px;font-weight:600;color:#54656f;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:6px}
.vb:hover{border-color:#25d366;color:#075e54;transform:translateY(-2px)}
.vb svg{width:26px;height:26px;fill:currentColor}
.vb.up:hover{border-color:#25d366;color:#25d366}
.vb.down:hover{border-color:#d92d20;color:#d92d20}
.fb .done{display:none;font-size:15px;color:#075e54;font-weight:600;padding:12px}

/* modal */
.mask{position:fixed;inset:0;background:rgba(6,20,17,.72);backdrop-filter:blur(3px);z-index:70;display:none;align-items:center;justify-content:center;padding:18px}
.mask.on{display:flex}
.modal{background:#fff;border-radius:16px;width:100%;max-width:460px;max-height:88vh;overflow-y:auto;padding:26px;box-shadow:0 24px 60px rgba(0,0,0,.4);animation:pop .22s ease}
@keyframes pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}
.modal h3{font-size:18px;color:#075e54;margin-bottom:4px}
.modal .mp{font-size:13.5px;color:#54656f;margin-bottom:16px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.chip{padding:8px 14px;border-radius:999px;border:1.5px solid #d1d7db;background:#fff;cursor:pointer;font-family:inherit;font-size:13.5px;color:#3b4a54;transition:.13s}
.chip:hover{border-color:#075e54}
.chip.sel{background:#075e54;border-color:#075e54;color:#fff}
.modal label{display:block;font-size:13px;font-weight:600;color:#54656f;margin-bottom:6px}
.modal textarea,.modal input{width:100%;border:1.5px solid #d1d7db;border-radius:9px;padding:11px 13px;font-family:inherit;font-size:14.5px;color:#111b21;margin-bottom:14px;resize:vertical}
.modal textarea{min-height:96px}
.modal textarea:focus,.modal input:focus{outline:none;border-color:#25d366}
.mact{display:flex;gap:10px;margin-top:4px}
.mact .btn{flex:1;text-align:center}
.msg{font-size:13.5px;padding:11px 13px;border-radius:8px;margin-bottom:12px;display:none}
.msg.ok{display:block;background:#ecfdf3;color:#027a48;border:1px solid #a6f4c5}
.msg.err{display:block;background:#fef3f2;color:#912018;border:1px solid #fecdca}

footer{text-align:center;font-size:13px;color:#54656f;padding-top:26px;border-top:1px solid #d1d7db;margin-top:30px}
footer b{color:#075e54}
footer a{color:#075e54}
.switch{text-align:center;margin:22px 0 4px}
.switch a{font-size:13px;color:#54656f}
`.trim();

function renderSections(P, v) {
  return P.sections.map((s, i) => {
    const items = s.items.map(it => `        <li class="${it.type === 'no' ? 'no' : ''}">${rich(pick(it, v))}</li>`).join('\n');
    const note = s.note
      ? `\n      <div class="note ${s.note.type === 'keras' ? 'keras' : ''}">${rich(pick(s.note, v))}</div>`
      : '';
    return `    <section class="card" id="${s.id}">
      <h2><span class="num">${i + 1}</span> ${esc(s.title)}</h2>
      <div class="sub">${esc(s.sub)}</div>
      <ul>
${items}
      </ul>${note}
    </section>`;
  }).join('\n\n');
}

const renderToc = (P, T) => `    <nav class="toc" aria-label="${T.tocAria}">
      <h2>${T.tocTitle}</h2>
      <ol>
${P.sections.map(s => `        <li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('\n')}
      </ol>
    </nav>`;

const renderFaq = (P) => P.faq.map(f => `    <details>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join('\n');

function jsonLd(P, lang, T) {
  const m = P.meta;
  const d = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: `${m.title} - ${m.name}`, url: m.url, inLanguage: T.schemaLang,
      publisher: { '@type': 'Organization', name: m.name, url: m.url, logo: `${m.url}/og.png` } },
    { '@context': 'https://schema.org', '@type': 'WebPage', name: `${m.title} - ${m.name}`, url: m.url,
      description: m.description, inLanguage: T.schemaLang, datePublished: m.effective, dateModified: m.updated,
      primaryImageOfPage: { '@type': 'ImageObject', url: `${m.url}/og.png`, width: 1200, height: 630 } },
    { '@context': 'https://schema.org', '@type': 'Organization', name: m.name, url: m.url, logo: `${m.url}/og.png`,
      description: m.tagline, sameAs: [m.channelUrl].filter(Boolean),
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', telephone: `+${m.adminPhone}`, availableLanguage: ['id', 'en'] }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: P.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: T.home, item: m.url },
      { '@type': 'ListItem', position: 2, name: m.title }] }
  ];
  return d.map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n  ');
}

function buildPage(v, lang) {
  const internal = v === 'internal';
  const P = POLICIES[lang];
  const m = P.meta;
  const T = UI[lang];
  const other = lang === 'id' ? 'en' : 'id';
  const here = pagePath(v, lang);
  const there = pagePath(v, other);
  const wa = (t) => `https://wa.me/${m.adminPhone}?text=${encodeURIComponent(t)}`;

  const pageTitle = internal ? `[INTERNAL] ${m.title} - ${m.name}` : `${m.title} WhatsApp - ${m.name}`;
  const pageDesc = internal ? T.internalDesc : m.description;
  const ogImg = internal ? `${m.url}/og-internal.png` : `${m.url}/og.png`;

  // hreflang: kedua bahasa + x-default. Halaman internal noindex, jadi tanpa hreflang.
  const hreflang = internal ? '' : `
  <link rel="alternate" hreflang="id" href="${m.url}/">
  <link rel="alternate" hreflang="en" href="${m.url}/en">
  <link rel="alternate" hreflang="x-default" href="${m.url}/">`;

  const seo = internal ? `
  <meta name="description" content="${esc(pageDesc)}">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex">
  <meta name="googlebot" content="noindex,nofollow">
  <link rel="canonical" href="${m.url}${here}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(m.name)}">
  <meta property="og:locale" content="${T.ogLocale}">
  <meta property="og:url" content="${m.url}${here}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(pageDesc)}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : `
  <meta name="description" content="${esc(pageDesc)}">
  <meta name="keywords" content="${esc(m.keywords.join(', '))}">
  <meta name="author" content="${esc(m.name)}">
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
  <meta name="googlebot" content="index,follow">
  <link rel="canonical" href="${m.url}${here}">${hreflang}

  <!-- Open Graph : Facebook, WhatsApp, Threads, LinkedIn, Discord, Telegram -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(m.name)}">
  <meta property="og:locale" content="${T.ogLocale}">
  <meta property="og:url" content="${m.url}${here}">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(pageDesc)}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:secure_url" content="${ogImg}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Banner ${esc(m.title)} ${esc(m.name)}">
  <meta property="og:updated_time" content="${isoDate(m.updated)}">
  <meta property="article:published_time" content="${isoDate(m.effective)}">
  <meta property="article:modified_time" content="${isoDate(m.updated)}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(pageDesc)}">
  <meta name="twitter:image" content="${ogImg}">
  <meta name="twitter:image:alt" content="Banner ${esc(m.title)} ${esc(m.name)}">

  <meta name="pinterest-rich-pin" content="true">
  <meta itemprop="name" content="${esc(pageTitle)}">
  <meta itemprop="description" content="${esc(pageDesc)}">
  <meta itemprop="image" content="${ogImg}">

  ${jsonLd(P, lang, T)}`;

  const tldr = `    <div class="tldr">
      <h2>${esc(P.tldr.title)}</h2>
      <ol>
${P.tldr.points.map(p => `        <li>${esc(p)}</li>`).join('\n')}
      </ol>
      <div class="cl">${esc(P.tldr.closing)}</div>
    </div>`;

  const why = `    <section class="why" id="kenapa">
      <h2>${esc(P.why.title)}</h2>
      <div class="sub">${esc(P.why.sub)}</div>
${P.why.paras.map(p => `      <p>${esc(p)}</p>`).join('\n')}
    </section>`;

  const alert = `    <div class="alert">
      <h2>${esc(P.alert.title)}</h2>
${P.alert.paras.map(p => `      <p>${rich(pick(p, v))}</p>`).join('\n')}
    </div>`;

  const apiCard = internal ? '' : `
    <section class="card" id="api">
      <h2><span class="num">API</span> ${T.api.title}</h2>
      <div class="sub">${T.api.sub}</div>
      <ul>
${T.api.items.map(i => `        <li>${i}</li>`).join('\n')}
      </ul>
      <pre><code>&lt;!-- Widget kebijakan / Policy widget --&gt;
&lt;div id="xyc-policy"&gt;&lt;/div&gt;
&lt;script src="${m.url}/embed.js" defer&gt;&lt;/script&gt;

&lt;!-- Gate popup buat link bio / consent gate for bio links --&gt;
&lt;script src="${m.url}/gate.js" defer&gt;&lt;/script&gt;
&lt;a href="https://chat.whatsapp.com/xxxx" data-xyc-gate&gt;Join Grup&lt;/a&gt;</code></pre>
      <div class="cta">
        <a class="btn ghost" href="/demo">${T.api.demo}</a>
        <a class="btn ghost" href="/docs">${T.api.docs}</a>
        <a class="btn ghost" href="${m.repo}" target="_blank" rel="noopener">${T.api.src}</a>
      </div>
    </section>`;

  const feedback = `
    <div class="fb" id="fb">
      <div id="fbAsk">
        <h2>${T.fb.title}</h2>
        <p class="q">${T.fb.q}</p>
        <div class="vote">
          <button class="vb up" type="button" data-vote="like">
            <svg viewBox="0 0 24 24"><path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            ${T.fb.up}
          </button>
          <button class="vb down" type="button" data-vote="dislike">
            <svg viewBox="0 0 24 24"><path d="M22 3h-4v12h4V3zM2 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.58-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2H7c-.83 0-1.54.5-1.84 1.22L2.14 11.27c-.09.23-.14.47-.14.73v2z"/></svg>
            ${T.fb.down}
          </button>
        </div>
      </div>
      <div class="done" id="fbDone">${T.fb.done}</div>
    </div>

    <div class="mask" id="fbMask" role="dialog" aria-modal="true" aria-labelledby="fbTitle" aria-describedby="fbDesc">
      <div class="modal">
        <h3 id="fbTitle">${T.fb.titleBad}</h3>
        <p class="mp" id="fbDesc">${T.fb.desc}</p>
        <div class="msg" id="fbMsg"></div>
        <div class="chips" id="fbChips"></div>
        <label for="fbText">${T.fb.textLabel}</label>
        <textarea id="fbText" placeholder="${T.fb.textPh}"></textarea>
        <label for="fbContact">${T.fb.contactLabel}</label>
        <input id="fbContact" type="text" placeholder="${T.fb.contactPh}" autocomplete="off">
        <div class="mact">
          <button class="btn ghost" type="button" id="fbCancel">${T.fb.cancel}</button>
          <button class="btn" type="button" id="fbSend">${T.fb.send}</button>
        </div>
      </div>
    </div>`;

  const contact = `
    <section class="card" id="kontak">
      <h2><span class="num">?</span> ${T.contact.title}</h2>
      <div class="sub">${T.contact.sub}</div>
      <ul>
${T.contact.items.map(i => `        <li>${i}</li>`).join('\n')}
      </ul>
      <div class="cta">
        <a class="btn" href="${wa(T.contact.wa1)}" target="_blank" rel="noopener">${T.contact.cta1}</a>
        <a class="btn alt" href="${m.channelUrl}" target="_blank" rel="noopener">${T.contact.cta2}</a>
        <a class="btn ghost" href="${wa(T.contact.wa2)}" target="_blank" rel="noopener">${T.contact.cta3}</a>
      </div>
    </section>`;

  const switcher = internal
    ? `    <div class="switch"><a href="${pagePath('public', lang)}">${T.switchInternal}</a></div>`
    : `    <div class="switch"><a href="${pagePath('internal', lang)}">${T.switchPublic}</a></div>`;

  // Toggle bahasa: link statis (jalan tanpa JS), kliknya sekalian simpan pilihan manual
  // supaya auto-detect berikutnya tidak menimpa.
  const langSwitch = `
  <div class="langsw" role="group" aria-label="Bahasa / Language">
    <a href="${pagePath(v, 'id')}" hreflang="id" lang="id" class="${lang === 'id' ? 'on' : ''}"${lang === 'id' ? ' aria-current="true"' : ''} onclick="try{localStorage.setItem('xyc_lang','id')}catch(e){}">ID</a><span class="dot"></span><a href="${pagePath(v, 'en')}" hreflang="en" lang="en" class="${lang === 'en' ? 'on' : ''}"${lang === 'en' ? ' aria-current="true"' : ''} onclick="try{localStorage.setItem('xyc_lang','en')}catch(e){}">EN</a>
  </div>`;

  const js = `
<script>
(function(){
  var bar=document.getElementById('bar');
  addEventListener('scroll',function(){
    var h=document.documentElement,max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?(h.scrollTop/max)*100:0)+'%';
  },{passive:true});

  var REASONS=${JSON.stringify(T.fb.reasons)};
  var mask=document.getElementById('fbMask'),chips=document.getElementById('fbChips'),
      msg=document.getElementById('fbMsg'),vote='',sel=[];

  REASONS.forEach(function(r){
    var b=document.createElement('button');
    b.type='button';b.className='chip';b.textContent=r;
    b.onclick=function(){
      var i=sel.indexOf(r);
      if(i<0){sel.push(r);b.classList.add('sel')}else{sel.splice(i,1);b.classList.remove('sel')}
    };
    chips.appendChild(b);
  });

  var lastFocus=null;
  function focusables(){
    return Array.prototype.slice.call(
      mask.querySelectorAll('button,textarea,input,[href],[tabindex]:not([tabindex="-1"])')
    ).filter(function(el){return !el.disabled && el.offsetParent!==null});
  }
  function open(v){
    vote=v;
    document.getElementById('fbTitle').textContent = v==='like'
      ? ${JSON.stringify(T.fb.titleLike)}
      : ${JSON.stringify(T.fb.titleBad)};
    lastFocus=document.activeElement;
    mask.classList.add('on');
    document.body.style.overflow='hidden';
    var f=focusables();
    if(f.length) f[f.length-1].focus();
  }
  function close(){
    mask.classList.remove('on');
    document.body.style.overflow='';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.querySelectorAll('.vb').forEach(function(b){
    b.onclick=function(){open(b.dataset.vote)};
  });
  document.getElementById('fbCancel').onclick=close;
  mask.onclick=function(e){if(e.target===mask)close()};
  addEventListener('keydown',function(e){
    if(e.key==='Escape'){close();return}
    if(e.key!=='Tab' || !mask.classList.contains('on')) return;
    var f=focusables();
    if(!f.length) return;
    var first=f[0],last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus()}
  });

  document.getElementById('fbSend').onclick=function(){
    var btn=this,text=document.getElementById('fbText').value.trim();
    if(!sel.length && !text){
      msg.className='msg err';msg.textContent=${JSON.stringify(T.fb.errEmpty)};return;
    }
    btn.disabled=true;btn.textContent=${JSON.stringify(T.fb.sending)};
    fetch('/api/feedback',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        vote:vote,reasons:sel,message:text,
        contact:document.getElementById('fbContact').value.trim(),
        page:location.pathname,version:'${m.version}',lang:'${lang}'
      })
    }).then(function(r){return r.json()}).then(function(d){
      if(!d.ok)throw new Error(d.error||'gagal');
      close();
      document.getElementById('fbAsk').style.display='none';
      document.getElementById('fbDone').style.display='block';
      try{localStorage.setItem('xyc_fb','1')}catch(e){}
    }).catch(function(e){
      msg.className='msg err';
      msg.textContent=${JSON.stringify(T.fb.errFail)}+e.message+${JSON.stringify(T.fb.errFail2)};
      btn.disabled=false;btn.textContent=${JSON.stringify(T.fb.send)};
    });
  };

  try{
    if(localStorage.getItem('xyc_fb')){
      document.getElementById('fbAsk').style.display='none';
      document.getElementById('fbDone').style.display='block';
    }
  }catch(e){}
})();
</script>`;

  return `<!DOCTYPE html>
<html lang="${T.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(pageTitle)}</title>
  <meta name="theme-color" content="#075e54">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/icon-180.png">
  <link rel="mask-icon" href="/favicon.svg" color="#075e54">
  <link rel="manifest" href="/site.webmanifest">${seo}
${autoLangScript()}
  <style>${CSS}</style>
</head>
<body>

<a class="skip" href="#isi">${T.skip}</a>
<div id="bar" aria-hidden="true"></div>

<header>
${langSwitch}
  <div class="badge${internal ? ' warn' : ''}">${internal ? T.badgeInternal : T.badgePublic}</div>
  <h1>${esc(m.title)}</h1>
  <div class="grup">${m.nameStyled}</div>
  <div class="tags">
${m.tags.map(t => `    <span class="tag">${esc(t)}</span>`).join('\n')}
  </div>
  <p class="meta">${T.metaLine(m)}</p>
</header>

<div class="wrap" id="isi">

${tldr}

${alert}

${why}

${renderToc(P, T)}

${renderSections(P, v)}

  <h2 class="section-title">${T.faqTitle}</h2>
${renderFaq(P)}
${apiCard}
${feedback}
${contact}
${switcher}

  <footer>
    <p>${rich(pick(P.footer, v))}</p>
    <p style="margin-top:10px">&copy; 2026 <b>${m.nameStyled}</b> &middot; ${esc(m.tagline)}</p>
    <p style="margin-top:6px">Open source (MIT) &middot; <a href="${m.repo}" target="_blank" rel="noopener">GitHub</a> &middot; <a href="/api/policy">API</a> &middot; <a href="/docs">Docs</a> &middot; <a href="/status">Status</a></p>
  </footer>

</div>
${js}
</body>
</html>
`;
}

const pub = path.join(root, 'public');
fs.mkdirSync(pub, { recursive: true });
fs.mkdirSync(path.join(pub, 'en'), { recursive: true });
fs.writeFileSync(path.join(pub, 'index.html'), buildPage('public', 'id'));
fs.writeFileSync(path.join(pub, 'internal.html'), buildPage('internal', 'id'));
fs.writeFileSync(path.join(pub, 'en', 'index.html'), buildPage('public', 'en'));
fs.writeFileSync(path.join(pub, 'en', 'internal.html'), buildPage('internal', 'en'));

fs.writeFileSync(path.join(pub, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /internal
Disallow: /internal.html
Disallow: /en/internal
Disallow: /en/internal.html

User-agent: GPTBot
Allow: /
Disallow: /internal
Disallow: /internal.html
Disallow: /en/internal
Disallow: /en/internal.html

Sitemap: ${M.url}/sitemap.xml
`);

const alt = (base) => `    <xhtml:link rel="alternate" hreflang="id" href="${M.url}/"/>
    <xhtml:link rel="alternate" hreflang="en" href="${M.url}/en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${M.url}/"/>`;

fs.writeFileSync(path.join(pub, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${M.url}/</loc>
${alt()}
    <lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority>
    <image:image><image:loc>${M.url}/og.png</image:loc><image:title>${esc(M.title)} ${esc(M.name)}</image:title></image:image>
  </url>
  <url>
    <loc>${M.url}/en</loc>
${alt()}
    <lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority>
    <image:image><image:loc>${M.url}/og.png</image:loc><image:title>${esc(POLICIES.en.meta.title)} ${esc(M.name)}</image:title></image:image>
  </url>
  <url>
    <loc>${M.url}/docs</loc><lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
    <image:image><image:loc>${M.url}/og-docs.png</image:loc><image:title>API Docs ${esc(M.name)}</image:title></image:image>
  </url>
  <url>
    <loc>${M.url}/demo</loc><lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority>
  </url>
  <url>
    <loc>${M.url}/status</loc><lastmod>${M.updated}</lastmod><changefreq>daily</changefreq><priority>0.4</priority>
  </url>
</urlset>
`);

const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#075e54"/><path d="M32 12l16 6v13c0 11-7 19-16 21-9-2-16-10-16-21V18l16-6z" fill="none" stroke="#25d366" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="34" r="5" fill="#25d366"/></svg>`;
fs.writeFileSync(path.join(pub, 'favicon.svg'), FAVICON_SVG);

// Ikon persegi buat PWA & iOS. Sebelumnya manifest & apple-touch-icon sama-sama
// menunjuk og.png 1200x630: rasio salah, dan Chrome menolak ikon non-persegi
// untuk instalasi. PNG di-render dari vektor yang sama, jadi tidak perlu aset baru.
const ICON_SIZES = [180, 192, 512];
let iconsDone = [];
try {
  const { execFileSync } = await import('node:child_process');
  const hasRenderer = (() => {
    try { execFileSync('magick', ['-version'], { stdio: 'ignore' }); return 'magick'; }
    catch { try { execFileSync('convert', ['-version'], { stdio: 'ignore' }); return 'convert'; } catch { return null; } }
  })();
  if (hasRenderer) {
    const tmpSvg = path.join(pub, '.icon-src.svg');
    fs.writeFileSync(tmpSvg, FAVICON_SVG);
    for (const n of ICON_SIZES) {
      const out = path.join(pub, `icon-${n}.png`);
      execFileSync(hasRenderer, ['-background', 'none', '-density', '384', tmpSvg,
        '-resize', `${n}x${n}!`, '-strip', '-define', 'png:include-chunk=none', out]);
      iconsDone.push(n);
    }
    fs.rmSync(tmpSvg);
  }
} catch (e) {
  console.warn('[build] ikon PNG dilewati (' + e.message.split('\n')[0] + ') — pakai favicon.svg saja');
}

const iconList = iconsDone.filter(n => n !== 180).map(n => ({
  src: `/icon-${n}.png`, sizes: `${n}x${n}`, type: 'image/png', purpose: 'any'
}));
// og.png tetap dipakai sebagai ikon besar; tetap sah sebagai entri tambahan
if (!iconList.length) iconList.push({ src: '/og.png', sizes: '1200x630', type: 'image/png', purpose: 'any' });

fs.writeFileSync(path.join(pub, 'site.webmanifest'), JSON.stringify({
  name: `${M.title} - ${M.name}`, short_name: 'Kebijakan XyCloud',
  description: M.description, start_url: '/', display: 'standalone',
  background_color: '#ece5dd', theme_color: '#075e54', lang: 'id',
  icons: iconList
}, null, 2));

console.log('[build] id: index+internal, en: en/index+en/internal, robots, sitemap (hreflang), manifest, favicon' +
  (iconsDone.length ? `, icon-${iconsDone.join('/')} -> public/` : ' -> public/'));
