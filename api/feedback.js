const RESEND_URL = 'https://api.resend.com/emails';
const TO = process.env.FEEDBACK_TO || 'xycdigital@gmail.com';
const FROM = process.env.FEEDBACK_FROM || 'XyCloud Policy <noreply@xyc.my.id>';

// rate limit sederhana per instance (best effort, bukan jaminan keras)
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter(t => now - t < win);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 500) hits.clear();
  return arr.length > 5;
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' });

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ ok: false, error: 'kebanyakan_kirim' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  if (!body || typeof body !== 'object') body = {};

  const vote = body.vote === 'like' ? 'like' : body.vote === 'dislike' ? 'dislike' : null;
  const reasons = Array.isArray(body.reasons) ? body.reasons.slice(0, 8).map(r => String(r).slice(0, 60)) : [];
  const message = String(body.message || '').slice(0, 2000).trim();
  const contact = String(body.contact || '').slice(0, 120).trim();
  const page = String(body.page || '/').slice(0, 120);
  const version = String(body.version || '-').slice(0, 20);

  if (!vote) return res.status(400).json({ ok: false, error: 'vote_wajib' });
  if (!reasons.length && !message) return res.status(400).json({ ok: false, error: 'alasan_atau_pesan_wajib' });
  if (body.website) return res.status(200).json({ ok: true, skipped: true }); // honeypot

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: 'email_belum_dikonfigurasi' });

  const positive = vote === 'like';
  const accent = positive ? '#25d366' : '#d92d20';
  const label = positive ? 'BAGUS' : 'KURANG';
  const waktu = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar', dateStyle: 'full', timeStyle: 'short' });

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#ece5dd;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08)">
  <div style="background:linear-gradient(160deg,#075e54,#128c7e);padding:24px;color:#fff">
    <div style="display:inline-block;background:${accent};padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.5px">${label}</div>
    <h1 style="margin:12px 0 0;font-size:19px">Feedback Kebijakan Grup</h1>
    <p style="margin:6px 0 0;font-size:13px;opacity:.85">rules.xyc.my.id &middot; versi ${esc(version)}</p>
  </div>
  <div style="padding:24px">
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:7px 0;color:#54656f;width:110px">Penilaian</td><td style="padding:7px 0;font-weight:700;color:${accent}">${label}</td></tr>
      <tr><td style="padding:7px 0;color:#54656f;vertical-align:top">Alasan</td><td style="padding:7px 0">${reasons.length ? reasons.map(r => `<span style="display:inline-block;background:#f0f2f5;color:#111b21;padding:3px 10px;border-radius:999px;font-size:12.5px;margin:0 4px 4px 0">${esc(r)}</span>`).join('') : '<i style="color:#8696a0">tidak dipilih</i>'}</td></tr>
      <tr><td style="padding:7px 0;color:#54656f">Halaman</td><td style="padding:7px 0"><code>${esc(page)}</code></td></tr>
      <tr><td style="padding:7px 0;color:#54656f">Kontak</td><td style="padding:7px 0">${contact ? esc(contact) : '<i style="color:#8696a0">anonim</i>'}</td></tr>
      <tr><td style="padding:7px 0;color:#54656f">Waktu</td><td style="padding:7px 0">${esc(waktu)} WITA</td></tr>
    </table>
    ${message ? `<div style="margin-top:18px"><div style="font-size:12px;color:#54656f;text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px">Pesan</div>
    <div style="background:#f0f2f5;border-left:4px solid ${accent};border-radius:8px;padding:14px 16px;font-size:14.5px;line-height:1.65;white-space:pre-wrap">${esc(message)}</div></div>` : ''}
    ${contact ? `<div style="margin-top:18px"><a href="https://wa.me/${esc(contact.replace(/[^0-9]/g, ''))}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600">Bales via WhatsApp</a></div>` : ''}
  </div>
  <div style="padding:16px 24px;border-top:1px solid #e4e7ec;font-size:12px;color:#8696a0;text-align:center">
    Email otomatis dari <b style="color:#075e54">XyCloud Policy</b> &middot; <a href="https://rules.xyc.my.id" style="color:#075e54">rules.xyc.my.id</a>
  </div>
</div></body></html>`;

  const text = [
    `Feedback Kebijakan Grup — ${label}`, '',
    `Alasan  : ${reasons.join(', ') || '-'}`,
    `Pesan   : ${message || '-'}`,
    `Kontak  : ${contact || 'anonim'}`,
    `Halaman : ${page}`,
    `Versi   : ${version}`,
    `Waktu   : ${waktu} WITA`, '',
    'rules.xyc.my.id'
  ].join('\n');

  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM, to: [TO],
        subject: `[${label}] Feedback Kebijakan Grup XyCloud${reasons.length ? ' — ' + reasons[0] : ''}`,
        html, text,
        ...(contact && contact.includes('@') ? { reply_to: contact } : {})
      })
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('resend error', r.status, out);
      return res.status(502).json({ ok: false, error: 'gagal_kirim_email' });
    }
    return res.status(200).json({ ok: true, id: out.id || null, message: 'Makasih, masukannya udah masuk ke admin.' });
  } catch (e) {
    console.error('feedback error', e);
    return res.status(500).json({ ok: false, error: 'kesalahan_server' });
  }
}
