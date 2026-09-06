import policyId from '../data/policy.json' with { type: 'json' };
import policyEn from '../data/policy.en.json' with { type: 'json' };

// Dua bahasa: default `id` (kompatibel dengan pemanggil lama), `?lang=en` untuk
// Inggris. Struktur kedua file identik, id section disamakan, jadi ?section=
// tetap bekerja sama untuk kedua bahasa.
const POLICIES = { id: policyId, en: policyEn };
const LANGS = Object.keys(POLICIES);

// Versi "internal" isinya blak-blakan dan niatnya cuma buat member grup.
// Sebelumnya ?version=internal terbuka buat siapa saja (CORS *), dan embed.js
// malah bisa menempelkannya di website pihak ketiga. Sekarang default-nya ditutup:
// baru bisa dibuka kalau POLICY_INTERNAL_KEY diset di environment dan pemanggil
// mengirim kunci yang sama lewat header X-Policy-Internal-Key atau ?key=.
// Halaman /internal sendiri tidak terpengaruh karena di-generate statis saat build.
const INTERNAL_KEY = process.env.POLICY_INTERNAL_KEY || '';

function internalAllowed(req, url) {
  if (!INTERNAL_KEY) return false;
  const got = req.headers['x-policy-internal-key'] || url.searchParams.get('key') || '';
  return typeof got === 'string' && got.length > 0 && got === INTERNAL_KEY;
}

const pick = (o, v) => (v === 'internal' && o.internal ? o.internal : o.public);
const strip = (s) => String(s).replace(/<[^>]+>/g, '');

// Label kecil di output markdown/html supaya ikut bahasa yang diminta.
const FMT = {
  id: { ver: 'Versi', upd: 'Update', src: 'Sumber' },
  en: { ver: 'Version', upd: 'Updated', src: 'Source' }
};

function cors(res, lang) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Policy-Version', POLICIES[lang].meta.version);
  res.setHeader('X-Policy-Language', lang);
  res.setHeader('X-Policy-Source', POLICIES[lang].meta.url);
  res.setHeader('X-Policy-License', 'MIT - credit rules.xyc.my.id');
}

function shape(version, lang) {
  const policy = POLICIES[lang];
  const M = policy.meta;
  return {
    ok: true,
    meta: {
      ...M,
      requestedVersion: version,
      requestedLanguage: lang,
      availableLanguages: LANGS,
      license: 'MIT',
      attribution: 'Wajib cantumkan kredit ke https://rules.xyc.my.id',
      docs: `${M.url}/docs`
    },
    tldr: policy.tldr ? {
      title: policy.tldr.title,
      points: policy.tldr.points,
      closing: policy.tldr.closing
    } : null,
    why: policy.why ? {
      title: policy.why.title,
      subtitle: policy.why.sub,
      paragraphs: policy.why.paras
    } : null,
    alert: {
      title: policy.alert.title,
      paragraphs: policy.alert.paras.map(p => strip(pick(p, version)))
    },
    sections: policy.sections.map((s, i) => ({
      number: i + 1,
      id: s.id,
      title: s.title,
      subtitle: s.sub,
      items: s.items.map(it => ({
        type: it.type === 'no' ? 'prohibited' : 'allowed',
        text: strip(pick(it, version))
      })),
      note: s.note ? { level: s.note.type === 'keras' ? 'strict' : 'info', text: strip(pick(s.note, version)) } : null
    })),
    faq: policy.faq,
    footer: strip(pick(policy.footer, version))
  };
}

function toMarkdown(d, lang) {
  const L = [];
  const F = FMT[lang];
  L.push(`# ${d.meta.title} — ${d.meta.name}`, '');
  L.push(`> ${d.meta.tagline}`, '');
  L.push(`**${F.ver} ${d.meta.version} · ${F.upd} ${d.meta.updated}**`, '');
  if (d.tldr) {
    L.push(`## ${d.tldr.title}`, '');
    d.tldr.points.forEach((p, i) => L.push(`${i + 1}. ${p}`));
    L.push('', `_${d.tldr.closing}_`, '');
  }
  L.push(`## ⚠ ${d.alert.title}`, '');
  d.alert.paragraphs.forEach(p => L.push(p, ''));
  if (d.why) {
    L.push(`## ${d.why.title}`, '', `_${d.why.subtitle}_`, '');
    d.why.paragraphs.forEach(p => L.push(p, ''));
  }
  d.sections.forEach(s => {
    L.push(`## ${s.number}. ${s.title}`, '', `_${s.subtitle}_`, '');
    s.items.forEach(it => L.push(`- ${it.type === 'prohibited' ? '❌' : '✅'} ${it.text}`));
    L.push('');
    if (s.note) L.push(`> ${s.note.text}`, '');
  });
  L.push('## FAQ', '');
  d.faq.forEach(f => L.push(`**${f.q}**`, '', f.a, ''));
  L.push('---', '', d.footer, '', `${F.src}: ${d.meta.url}`);
  return L.join('\n');
}

function toText(d, lang) {
  return toMarkdown(d, lang).replace(/[#>_*`]/g, '').replace(/\n{3,}/g, '\n\n');
}

function toHtml(d, lang) {
  const F = FMT[lang];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const sec = d.sections.map(s => `<section class="xyc-sec" id="xyc-${s.id}">
<h2>${s.number}. ${esc(s.title)}</h2>
<p class="xyc-sub">${esc(s.subtitle)}</p>
<ul>${s.items.map(i => `<li class="xyc-${i.type}">${esc(i.text)}</li>`).join('')}</ul>
${s.note ? `<div class="xyc-note xyc-${s.note.level}">${esc(s.note.text)}</div>` : ''}
</section>`).join('\n');
  const faq = d.faq.map(f => `<details class="xyc-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n');
  return `<div class="xyc-policy" data-version="${d.meta.version}" data-lang="${lang}">
<header class="xyc-head"><h1>${esc(d.meta.title)}</h1><p class="xyc-grup">${esc(d.meta.nameStyled)}</p><p class="xyc-meta">${F.ver} ${d.meta.version} · ${F.upd} ${d.meta.updated}</p></header>
${d.tldr ? `<div class="xyc-tldr"><h2>${esc(d.tldr.title)}</h2><ol>${d.tldr.points.map(p => `<li>${esc(p)}</li>`).join('')}</ol><p class="xyc-tldr-cl">${esc(d.tldr.closing)}</p></div>` : ''}
<div class="xyc-alert"><h2>${esc(d.alert.title)}</h2>${d.alert.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</div>
${sec}
<h2 class="xyc-faq-title">FAQ</h2>
${faq}
<footer class="xyc-foot"><p>${esc(d.footer)}</p><p><a href="${d.meta.url}" target="_blank" rel="noopener">${F.src}: ${esc(d.meta.domain)}</a></p></footer>
</div>`;
}

export default function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host || POLICIES.id.meta.domain}`);
  const q = url.searchParams;
  const langRaw = (q.get('lang') || 'id').toLowerCase();
  const lang = POLICIES[langRaw] ? langRaw : 'id';
  const format = (q.get('format') || 'json').toLowerCase();

  cors(res, lang);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (!['GET', 'HEAD'].includes(req.method)) {
    return res.status(405).json({ ok: false, error: 'method_not_allowed', allowed: ['GET', 'HEAD', 'OPTIONS'] });
  }

  if (q.get('version') === 'internal' && !internalAllowed(req, url)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(403).json({
      ok: false,
      error: 'internal_terkunci',
      message: INTERNAL_KEY
        ? 'Versi internal butuh kunci. Kirim header X-Policy-Internal-Key atau parameter ?key=.'
        : 'Versi internal tidak dibuka lewat API. Set POLICY_INTERNAL_KEY di environment untuk membukanya.',
      hint: 'Baca versi publik di /api/policy, atau halaman lengkapnya di /internal.'
    });
  }

  const version = q.get('version') === 'internal' ? 'internal' : 'public';
  const sectionId = q.get('section');
  const pretty = q.get('pretty') === '1' || q.get('pretty') === 'true';

  let data = shape(version, lang);

  if (sectionId) {
    const found = data.sections.find(s => s.id === sectionId || String(s.number) === sectionId);
    if (!found) {
      return res.status(404).json({
        ok: false, error: 'section_not_found', requested: sectionId,
        available: data.sections.map(s => ({ number: s.number, id: s.id, title: s.title }))
      });
    }
    data = { ...data, sections: [found], faq: [] };
  }

  if (format === 'markdown' || format === 'md') {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    return res.status(200).send(toMarkdown(data, lang));
  }
  if (format === 'text' || format === 'txt') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(toText(data, lang));
  }
  if (format === 'html') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(toHtml(data, lang));
  }
  if (format === 'index') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.status(200).json({
      ok: true, meta: data.meta,
      sections: data.sections.map(s => ({ number: s.number, id: s.id, title: s.title, itemCount: s.items.length })),
      faqCount: data.faq.length
    });
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).send(JSON.stringify(data, null, pretty ? 2 : 0));
}
