import policy from '../data/policy.json' with { type: 'json' };

const BOOT = Date.now();

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
}

// Endpoint ini publik, tanpa rate limit, dan terdaftar di sitemap.
// Sebelumnya setiap request memanggil GET https://api.resend.com/domains,
// jadi trafik bot langsung memakan kuota API Resend akun admin.
// Hasilnya di-cache sebentar; angka 60 detik cukup buat halaman status.
const RESEND_TTL = 60_000;
let resendCache = { at: 0, data: null };

async function checkResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { status: 'down', detail: 'RESEND_API_KEY belum diset' };
  const now = Date.now();
  if (resendCache.data && now - resendCache.at < RESEND_TTL) {
    return { ...resendCache.data, cached: true, cacheAgeMs: now - resendCache.at };
  }
  const t = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` }, signal: ctrl.signal
    });
    clearTimeout(to);
    const ms = Date.now() - t;
    if (!r.ok) return cache({ status: 'degraded', latency: ms, detail: `HTTP ${r.status}` });
    const d = await r.json().catch(() => ({}));
    const list = d.data || [];
    const dom = list.find(x => x.name === 'xyc.my.id');
    if (!dom) return cache({ status: 'degraded', latency: ms, detail: 'domain xyc.my.id tidak ditemukan' });
    return cache({
      status: dom.status === 'verified' ? 'operational' : 'degraded',
      latency: ms,
      detail: `domain ${dom.name} · ${dom.status}`,
      sender: process.env.FEEDBACK_FROM || null
    });
  } catch (e) {
    return cache({ status: 'down', latency: Date.now() - t, detail: e.name === 'AbortError' ? 'timeout 4s' : 'tidak bisa dihubungi' });
  }
}

function cache(data) {
  resendCache = { at: Date.now(), data };
  return data;
}

function checkData() {
  try {
    const s = policy.sections || [];
    const f = policy.faq || [];
    const items = s.reduce((a, x) => a + (x.items ? x.items.length : 0), 0);
    const problems = [];
    if (!s.length) problems.push('sections kosong');
    if (!f.length) problems.push('faq kosong');
    if (!policy.meta || !policy.meta.version) problems.push('meta.version hilang');
    if (!policy.tldr) problems.push('tldr hilang');
    if (!policy.why) problems.push('why hilang');
    s.forEach(x => { if (!x.id || !x.title) problems.push(`section tanpa id/title`); });
    return {
      status: problems.length ? 'degraded' : 'operational',
      detail: problems.length ? problems.join(', ') : `${s.length} bagian · ${items} poin · ${f.length} FAQ`,
      sections: s.length, items, faq: f.length
    };
  } catch (e) {
    return { status: 'down', detail: 'policy.json tidak bisa dibaca' };
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const t0 = Date.now();
  const data = checkData();
  const email = await checkResend();

  const components = [
    { id: 'api', name: 'Policy API', desc: 'Endpoint /api/policy', status: 'operational', latency: Date.now() - t0, detail: 'merespons normal' },
    { id: 'data', name: 'Data Kebijakan', desc: 'Integritas policy.json', ...data },
    { id: 'email', name: 'Layanan Email', desc: 'Pengiriman feedback via Resend', ...email },
    { id: 'edge', name: 'Edge Network', desc: 'Vercel CDN', status: 'operational', detail: `region ${process.env.VERCEL_REGION || 'unknown'}` }
  ];

  const rank = { operational: 0, degraded: 1, down: 2 };
  const worst = components.reduce((a, c) => (rank[c.status] > rank[a] ? c.status : a), 'operational');

  const overall = {
    operational: { label: 'Semua sistem normal', color: '#25d366' },
    degraded: { label: 'Ada gangguan sebagian', color: '#f79009' },
    down: { label: 'Ada layanan bermasalah', color: '#d92d20' }
  }[worst];

  res.status(200).json({
    ok: worst !== 'down',
    overall: { status: worst, ...overall },
    components,
    policy: {
      version: policy.meta.version,
      updated: policy.meta.updated,
      sections: data.sections,
      items: data.items,
      faq: data.faq
    },
    build: {
      commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || null,
      message: process.env.VERCEL_GIT_COMMIT_MESSAGE ? String(process.env.VERCEL_GIT_COMMIT_MESSAGE).split('\n')[0].slice(0, 80) : null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
      env: process.env.VERCEL_ENV || 'development',
      region: process.env.VERCEL_REGION || null
    },
    runtime: {
      node: process.version,
      instanceAgeMs: Date.now() - BOOT,
      coldStart: Date.now() - BOOT < 1500
    },
    checkedAt: new Date().toISOString(),
    tookMs: Date.now() - t0
  });
}
