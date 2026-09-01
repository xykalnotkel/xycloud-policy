// Dev server sederhana: static /public + emulasi /api/* (tanpa Vercel CLI)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(root, 'public');
const PORT = process.env.PORT || 3000;
const MIME = { '.html':'text/html; charset=utf-8', '.js':'application/javascript; charset=utf-8',
  '.json':'application/json; charset=utf-8', '.png':'image/png', '.svg':'image/svg+xml',
  '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.webmanifest':'application/manifest+json' };

// Cache modul per file dan invalidasi lewat mtime.
// Sebelumnya URL-nya ditempeli '?t=' + Date.now() sehingga modul di-import ulang
// setiap request: state di dalam modul (misalnya Map rate limiter di api/feedback.js)
// selalu lahir baru, jadi pembatasan laju tidak pernah terlihat aktif di lokal.
const modCache = new Map();
async function loadApi(file) {
  const st = fs.statSync(file);
  const hit = modCache.get(file);
  if (hit && hit.mtimeMs === st.mtimeMs && hit.size === st.size) return hit.mod;
  const mod = await import(pathToFileURL(file).href);
  modCache.set(file, { mtimeMs: st.mtimeMs, size: st.size, mod });
  return mod;
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${req.headers.host}`);
  if (u.pathname.startsWith('/api/')) {
    const name = u.pathname.replace('/api/', '').replace(/\/$/, '') || 'health';
    const file = path.join(root, 'api', name + '.js');
    if (!fs.existsSync(file)) { res.writeHead(404).end('no api'); return; }
    if (req.method === 'POST') {
      req.body = await new Promise(r => { let b=''; req.on('data',c=>b+=c); req.on('end',()=>{ try{r(JSON.parse(b||'{}'))}catch{r({})} }); });
    }
    const mod = await loadApi(file);
    res.setHeader = res.setHeader.bind(res);
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(o)); };
    res.send = (s) => res.end(s);
    return mod.default(req, res);
  }
  let p = u.pathname === '/' ? '/index.html' : u.pathname;
  if (!path.extname(p)) p += '.html';
  const f = path.join(PUB, p);
  if (!f.startsWith(PUB) || !fs.existsSync(f)) { res.writeHead(404).end('404'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream', 'Access-Control-Allow-Origin': '*' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, '0.0.0.0', () => console.log(`http://0.0.0.0:${PORT}`));
