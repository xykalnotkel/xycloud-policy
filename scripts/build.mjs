import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/policy.json'), 'utf8'));
const M = policy.meta;

const pick = (o, v) => (v === 'internal' && o.internal ? o.internal : o.public);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const wa = (t) => `https://wa.me/${M.adminPhone}?text=${encodeURIComponent(t)}`;

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background:#ece5dd;color:#111b21;line-height:1.7;-webkit-font-smoothing:antialiased}
.wrap{max-width:780px;margin:0 auto;padding:0 18px 60px}

#bar{position:fixed;top:0;left:0;height:3px;width:0;background:linear-gradient(90deg,#25d366,#128c7e);z-index:60;transition:width .1s linear}

header{background:linear-gradient(160deg,#075e54 0%,#128c7e 100%);color:#fff;padding:46px 18px 40px;text-align:center}
.badge{display:inline-block;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);padding:5px 14px;border-radius:999px;font-size:12px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:14px}
.badge.warn{background:#d92d20;border-color:#f97066}
header h1{font-size:30px;line-height:1.25;font-weight:800;letter-spacing:-.5px}
header .grup{font-size:18px;font-weight:700;margin-top:10px}
header p.meta{margin-top:14px;opacity:.85;font-size:13px}
.tags{margin-top:16px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.tag{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.25);padding:4px 12px;border-radius:999px;font-size:12.5px}

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
.close{position:absolute}

footer{text-align:center;font-size:13px;color:#54656f;padding-top:26px;border-top:1px solid #d1d7db;margin-top:30px}
footer b{color:#075e54}
footer a{color:#075e54}
.switch{text-align:center;margin:22px 0 4px}
.switch a{font-size:13px;color:#54656f}
@media(max-width:520px){header h1{font-size:24px}.card,.why,.tldr{padding:20px 18px}.vb{width:auto;flex:1}}
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

const renderToc = () => `    <nav class="toc" aria-label="Daftar isi">
      <h2>Loncat ke bagian</h2>
      <ol>
${policy.sections.map(s => `        <li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('\n')}
      </ol>
    </nav>`;

const renderFaq = () => policy.faq.map(f => `    <details>
      <summary>${esc(f.q)}</summary>
      <p>${esc(f.a)}</p>
    </details>`).join('\n');

function jsonLd() {
  const d = [
    { '@context': 'https://schema.org', '@type': 'WebSite', name: `${M.title} - ${M.name}`, url: M.url, inLanguage: 'id-ID',
      publisher: { '@type': 'Organization', name: M.name, url: M.url, logo: `${M.url}/og.png` } },
    { '@context': 'https://schema.org', '@type': 'WebPage', name: `${M.title} - ${M.name}`, url: M.url,
      description: M.description, inLanguage: 'id-ID', datePublished: M.effective, dateModified: M.updated,
      primaryImageOfPage: { '@type': 'ImageObject', url: `${M.url}/og.png`, width: 1200, height: 630 } },
    { '@context': 'https://schema.org', '@type': 'Organization', name: M.name, url: M.url, logo: `${M.url}/og.png`,
      description: M.tagline, sameAs: [M.channelUrl].filter(Boolean),
      contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', telephone: `+${M.adminPhone}`, availableLanguage: ['id'] }] },
    { '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: policy.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Beranda', item: M.url },
      { '@type': 'ListItem', position: 2, name: M.title, item: `${M.url}/#keluar-masuk` }] }
  ];
  return d.map(x => `<script type="application/ld+json">${JSON.stringify(x)}</script>`).join('\n  ');
}

function buildPage(v) {
  const internal = v === 'internal';
  const pageTitle = internal ? `[INTERNAL] ${M.title} - ${M.name}` : `${M.title} WhatsApp - ${M.name}`;
  const pageDesc = internal ? 'Versi internal tanpa sensor. Khusus member grup XyCloud | Official.' : M.description;
  const ogImg = internal ? `${M.url}/og-internal.png` : `${M.url}/og.png`;

  const seo = internal ? `
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex">
  <meta name="googlebot" content="noindex,nofollow">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(pageDesc)}">
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">` : `
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
  <meta property="og:image" content="${ogImg}">
  <meta property="og:image:secure_url" content="${ogImg}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Banner ${esc(M.title)} ${esc(M.name)}">
  <meta property="og:updated_time" content="${M.updated}">
  <meta property="article:published_time" content="${M.effective}">
  <meta property="article:modified_time" content="${M.updated}">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(pageDesc)}">
  <meta name="twitter:image" content="${ogImg}">
  <meta name="twitter:image:alt" content="Banner ${esc(M.title)} ${esc(M.name)}">

  <meta name="pinterest-rich-pin" content="true">
  <meta itemprop="name" content="${esc(pageTitle)}">
  <meta itemprop="description" content="${esc(pageDesc)}">
  <meta itemprop="image" content="${ogImg}">

  ${jsonLd()}`;

  const tldr = `    <div class="tldr">
      <h2>${esc(policy.tldr.title)}</h2>
      <ol>
${policy.tldr.points.map(p => `        <li>${esc(p)}</li>`).join('\n')}
      </ol>
      <div class="cl">${esc(policy.tldr.closing)}</div>
    </div>`;

  const why = `    <section class="why" id="kenapa">
      <h2>${esc(policy.why.title)}</h2>
      <div class="sub">${esc(policy.why.sub)}</div>
${policy.why.paras.map(p => `      <p>${esc(p)}</p>`).join('\n')}
    </section>`;

  const alert = `    <div class="alert">
      <h2>${esc(policy.alert.title)}</h2>
${policy.alert.paras.map(p => `      <p>${pick(p, v)}</p>`).join('\n')}
    </div>`;

  const apiCard = internal ? '' : `
    <section class="card" id="api">
      <h2><span class="num">API</span> Mau Pakai Kebijakan Ini?</h2>
      <div class="sub">Gratis, open source, lisensi MIT. Boleh dipakai siapa aja asal izin dan cantumin kredit.</div>
      <ul>
        <li>Tarik datanya real time lewat API publik. Format JSON, HTML, Markdown, atau teks polos.</li>
        <li>Atau tempel satu baris script, langsung jadi halaman kebijakan lengkap di web lu.</li>
        <li>Punya link bio? Pasang <b>gate popup</b>: orang harus baca kebijakan dan pencet setuju dulu sebelum link WhatsApp-nya kebuka.</li>
        <li>Tanpa API key, tanpa daftar, CORS kebuka buat semua origin.</li>
      </ul>
      <pre><code>&lt;!-- Widget kebijakan --&gt;
&lt;div id="xyc-policy"&gt;&lt;/div&gt;
&lt;script src="${M.url}/embed.js" defer&gt;&lt;/script&gt;

&lt;!-- Gate popup buat link bio --&gt;
&lt;script src="${M.url}/gate.js" defer&gt;&lt;/script&gt;
&lt;a href="https://chat.whatsapp.com/xxxx" data-xyc-gate&gt;Join Grup&lt;/a&gt;</code></pre>
      <div class="cta">
        <a class="btn ghost" href="/demo">Coba Gate Popup</a>
        <a class="btn ghost" href="/docs">Dokumentasi API</a>
        <a class="btn ghost" href="${M.repo}" target="_blank" rel="noopener">Source Code</a>
      </div>
    </section>`;

  const feedback = `
    <div class="fb" id="fb">
      <div id="fbAsk">
        <h2>Menurut lu kebijakan ini gimana?</h2>
        <p class="q">Jujur aja, ga usah sungkan. Masukannya langsung masuk ke admin.</p>
        <div class="vote">
          <button class="vb up" type="button" data-vote="like">
            <svg viewBox="0 0 24 24"><path d="M2 21h4V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 6.59 7.59C6.22 7.95 6 8.45 6 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
            Bagus
          </button>
          <button class="vb down" type="button" data-vote="dislike">
            <svg viewBox="0 0 24 24"><path d="M22 3h-4v12h4V3zM2 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l6.58-6.59c.37-.36.59-.86.59-1.41V5c0-1.1-.9-2-2-2H7c-.83 0-1.54.5-1.84 1.22L2.14 11.27c-.09.23-.14.47-.14.73v2z"/></svg>
            Kurang
          </button>
        </div>
      </div>
      <div class="done" id="fbDone">Makasih ya, masukannya udah masuk.</div>
    </div>

    <div class="mask" id="fbMask" role="dialog" aria-modal="true" aria-labelledby="fbTitle">
      <div class="modal">
        <h3 id="fbTitle">Bagian mana yang bikin ganjel?</h3>
        <p class="mp">Pilih yang paling relevan, terus ceritain dikit. Anonim kok, kecuali lu isi kontaknya sendiri.</p>
        <div class="msg" id="fbMsg"></div>
        <div class="chips" id="fbChips"></div>
        <label for="fbText">Ceritain dikit</label>
        <textarea id="fbText" placeholder="Tulis apa adanya di sini..."></textarea>
        <label for="fbContact">Kontak (opsional, kalau mau dibales)</label>
        <input id="fbContact" type="text" placeholder="Nomor WA atau email" autocomplete="off">
        <div class="mact">
          <button class="btn ghost" type="button" id="fbCancel">Batal</button>
          <button class="btn" type="button" id="fbSend">Kirim ke Admin</button>
        </div>
      </div>
    </div>`;

  const contact = `
    <section class="card" id="kontak">
      <h2><span class="num">?</span> Kontak &amp; Lapor</h2>
      <div class="sub">Ada masalah, mau lapor penipuan, atau mau izin pakai kebijakan ini.</div>
      <ul>
        <li>Lapor penipuan wajib bawa <b>bukti chat plus bukti transfer</b>. Tanpa itu susah diproses.</li>
        <li>Semua pengumuman resmi keluarnya dari Saluran. Kalau ragu, cek ke sana dulu.</li>
        <li>Admin bukan CS 24 jam, dibales kalau lagi sempet.</li>
      </ul>
      <div class="cta">
        <a class="btn" href="${wa('Halo Admin XyCloud, saya mau nanya/lapor soal kebijakan grup.')}" target="_blank" rel="noopener">Japri Admin</a>
        <a class="btn alt" href="${M.channelUrl}" target="_blank" rel="noopener">Ikuti Saluran Resmi</a>
        <a class="btn ghost" href="${wa('Halo Admin XyCloud, saya mau izin pakai kebijakan dari rules.xyc.my.id untuk komunitas saya.')}" target="_blank" rel="noopener">Izin Pakai Kebijakan</a>
      </div>
    </section>`;

  const switcher = internal
    ? `    <div class="switch"><a href="/">&larr; Balik ke versi publik</a></div>`
    : `    <div class="switch"><a href="/internal">Versi internal (blak-blakan) &rarr;</a></div>`;

  const js = `
<script>
(function(){
  var bar=document.getElementById('bar');
  addEventListener('scroll',function(){
    var h=document.documentElement,max=h.scrollHeight-h.clientHeight;
    bar.style.width=(max>0?(h.scrollTop/max)*100:0)+'%';
  },{passive:true});

  var REASONS=['Kepanjangan','Bahasanya kasar','Terlalu ketat','Ada yang ga jelas','Ga setuju sama aturan keluar-masuk','Lainnya'];
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

  function open(v){
    vote=v;
    document.getElementById('fbTitle').textContent = v==='like'
      ? 'Mantap, bagian mana yang paling kena?'
      : 'Bagian mana yang bikin ganjel?';
    mask.classList.add('on');
    document.body.style.overflow='hidden';
  }
  function close(){mask.classList.remove('on');document.body.style.overflow=''}

  document.querySelectorAll('.vb').forEach(function(b){
    b.onclick=function(){open(b.dataset.vote)};
  });
  document.getElementById('fbCancel').onclick=close;
  mask.onclick=function(e){if(e.target===mask)close()};
  addEventListener('keydown',function(e){if(e.key==='Escape')close()});

  document.getElementById('fbSend').onclick=function(){
    var btn=this,text=document.getElementById('fbText').value.trim();
    if(!sel.length && !text){
      msg.className='msg err';msg.textContent='Pilih minimal satu alasan atau tulis sesuatu dulu.';return;
    }
    btn.disabled=true;btn.textContent='Ngirim...';
    fetch('/api/feedback',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        vote:vote,reasons:sel,message:text,
        contact:document.getElementById('fbContact').value.trim(),
        page:location.pathname,version:'${M.version}'
      })
    }).then(function(r){return r.json()}).then(function(d){
      if(!d.ok)throw new Error(d.error||'gagal');
      close();
      document.getElementById('fbAsk').style.display='none';
      document.getElementById('fbDone').style.display='block';
      try{localStorage.setItem('xyc_fb','1')}catch(e){}
    }).catch(function(e){
      msg.className='msg err';
      msg.textContent='Gagal ngirim ('+e.message+'). Coba lagi atau japri admin langsung.';
      btn.disabled=false;btn.textContent='Kirim ke Admin';
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
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(pageTitle)}</title>
  <meta name="theme-color" content="#075e54">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="${ogImg}">
  <link rel="manifest" href="/site.webmanifest">${seo}
  <style>${CSS}</style>
</head>
<body>

<div id="bar"></div>

<header>
  <div class="badge${internal ? ' warn' : ''}">${internal ? 'Versi Internal - Tanpa Sensor' : 'Grup &amp; Saluran Resmi'}</div>
  <h1>${esc(M.title)}</h1>
  <div class="grup">${M.nameStyled}</div>
  <div class="tags">
${M.tags.map(t => `    <span class="tag">${esc(t)}</span>`).join('\n')}
  </div>
  <p class="meta">Versi ${M.version} &middot; Update ${M.updated} &middot; Baca santai ${M.readMinutes} menit</p>
</header>

<div class="wrap">

${tldr}

${alert}

${why}

${renderToc()}

${renderSections(v)}

  <h2 class="section-title">Yang sering ditanyain</h2>
${renderFaq()}
${apiCard}
${feedback}
${contact}
${switcher}

  <footer>
    <p>${pick(policy.footer, v)}</p>
    <p style="margin-top:10px">&copy; 2026 <b>${M.nameStyled}</b> &middot; ${esc(M.tagline)}</p>
    <p style="margin-top:6px">Open source (MIT) &middot; <a href="${M.repo}" target="_blank" rel="noopener">GitHub</a> &middot; <a href="/api/policy">API</a> &middot; <a href="/docs">Docs</a></p>
  </footer>

</div>
${js}
</body>
</html>
`;
}

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
    <loc>${M.url}/</loc><lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority>
    <image:image><image:loc>${M.url}/og.png</image:loc><image:title>${esc(M.title)} ${esc(M.name)}</image:title></image:image>
  </url>
  <url>
    <loc>${M.url}/docs</loc><lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority>
    <image:image><image:loc>${M.url}/og-docs.png</image:loc><image:title>API Docs ${esc(M.name)}</image:title></image:image>
  </url>
  <url>
    <loc>${M.url}/demo</loc><lastmod>${M.updated}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority>
  </url>
</urlset>
`);

fs.writeFileSync(path.join(pub, 'site.webmanifest'), JSON.stringify({
  name: `${M.title} - ${M.name}`, short_name: 'Kebijakan XyCloud',
  description: M.description, start_url: '/', display: 'standalone',
  background_color: '#ece5dd', theme_color: '#075e54', lang: 'id',
  icons: [{ src: '/og.png', sizes: '1200x630', type: 'image/png', purpose: 'any' }]
}, null, 2));

fs.writeFileSync(path.join(pub, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#075e54"/><path d="M32 12l16 6v13c0 11-7 19-16 21-9-2-16-10-16-21V18l16-6z" fill="none" stroke="#25d366" stroke-width="4" stroke-linejoin="round"/><circle cx="32" cy="34" r="5" fill="#25d366"/></svg>`);

console.log('[build] index, internal, robots, sitemap, manifest, favicon -> public/');
