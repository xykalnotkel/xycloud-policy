/*!
 * XyCloud Policy Gate v1.0
 * Popup persetujuan: orang harus baca kebijakan dan pencet Setuju
 * sebelum link WhatsApp (atau link apa pun) kebuka.
 *
 *   <script src="https://rules.xyc.my.id/gate.js" defer></script>
 *   <a href="https://chat.whatsapp.com/xxxx" data-xyc-gate>Join Grup</a>
 *
 * Mode otomatis (semua link WhatsApp di halaman ikut ke-gate):
 *   <script src="https://rules.xyc.my.id/gate.js" data-auto="wa" defer></script>
 *
 * Opsi data-* di tag <script>:
 *   data-auto="wa|all|off"   auto-intercept                (default: off)
 *   data-theme="light|dark"                                (default: light)
 *   data-remember="30"       hari ingat persetujuan, 0=selalu tanya (default: 30)
 *   data-require="scroll|check|both|none" syarat tombol aktif (default: scroll)
 *   data-accent="#25d366"
 *
 * Programmatic:
 *   XycGate.open('https://chat.whatsapp.com/xxx').then(ok => { ... })
 *   XycGate.reset()   // hapus persetujuan tersimpan
 *
 * Lisensi MIT. Wajib mencantumkan kredit ke https://rules.xyc.my.id
 */
(function () {
  'use strict';
  if (window.XycGate) return;

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();
  var D = script.dataset || {};
  var ORIGIN = (function () {
    try { return new URL(script.src).origin; } catch (e) { return 'https://rules.xyc.my.id'; }
  })();

  var CFG = {
    auto: D.auto || 'off',
    theme: D.theme === 'dark' ? 'dark' : 'light',
    remember: D.remember === undefined ? 30 : parseInt(D.remember, 10) || 0,
    require: D.require || 'scroll',
    accent: D.accent || '#25d366'
  };

  var KEY = 'xyc_gate_ok';
  var cache = null, pending = null, host = null, shadow = null;

  function agreed() {
    if (!CFG.remember) return false;
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return !!(v && v.exp > Date.now());
    } catch (e) { return false; }
  }
  function remember() {
    if (!CFG.remember) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({
        exp: Date.now() + CFG.remember * 864e5, at: new Date().toISOString()
      }));
    } catch (e) {}
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function styles() {
    var dark = CFG.theme === 'dark';
    var bg = dark ? '#111b21' : '#ffffff';
    var fg = dark ? '#e9edef' : '#111b21';
    var mut = dark ? '#8696a0' : '#54656f';
    var soft = dark ? '#1f2c33' : '#f0f2f5';
    var line = dark ? '#2a3942' : '#e4e7ec';
    return [
      ':host{all:initial}',
      '*{margin:0;padding:0;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
      '.mask{position:fixed;inset:0;background:rgba(6,20,17,.78);backdrop-filter:blur(4px);z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}',
      '.mask.on{opacity:1}',
      '.box{background:' + bg + ';color:' + fg + ';width:100%;max-width:480px;max-height:86vh;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,.5);transform:translateY(16px) scale(.97);transition:transform .22s cubic-bezier(.2,.9,.3,1)}',
      '.mask.on .box{transform:none}',
      '.hd{background:linear-gradient(160deg,#075e54,#128c7e);color:#fff;padding:22px 24px;flex-shrink:0;position:relative}',
      '.hd .bdg{display:inline-block;background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.28);padding:3px 11px;border-radius:999px;font-size:10.5px;letter-spacing:.6px;text-transform:uppercase;font-weight:700;margin-bottom:9px}',
      '.hd h2{font-size:20px;font-weight:800;letter-spacing:-.3px;line-height:1.25}',
      '.hd .g{font-size:13.5px;opacity:.9;margin-top:5px;font-weight:600}',
      '.x{position:absolute;top:16px;right:16px;width:30px;height:30px;border-radius:50%;border:none;background:rgba(255,255,255,.18);color:#fff;font-size:19px;line-height:1;cursor:pointer;transition:.15s}',
      '.x:hover{background:rgba(255,255,255,.32)}',
      '.bd{padding:20px 24px;overflow-y:auto;flex:1;-webkit-overflow-scrolling:touch;scroll-behavior:smooth}',
      '.tl{background:' + soft + ';border-radius:12px;padding:16px 18px;margin-bottom:18px}',
      '.tl h3{font-size:13px;text-transform:uppercase;letter-spacing:.6px;color:' + mut + ';margin-bottom:11px}',
      '.tl ol{list-style:none;counter-reset:c}',
      '.tl li{counter-increment:c;position:relative;padding-left:32px;margin-bottom:9px;font-size:14.5px;line-height:1.6}',
      '.tl li:last-child{margin-bottom:0}',
      '.tl li:before{content:counter(c);position:absolute;left:0;top:1px;width:21px;height:21px;border-radius:50%;background:' + CFG.accent + ';color:#053b34;font-size:11.5px;font-weight:800;display:flex;align-items:center;justify-content:center}',
      '.sec{margin-bottom:16px}',
      '.sec h4{font-size:14.5px;color:' + (dark ? CFG.accent : '#075e54') + ';margin-bottom:7px;font-weight:700}',
      '.sec ul{list-style:none}',
      '.sec li{position:relative;padding-left:20px;margin-bottom:6px;font-size:13.8px;line-height:1.6;color:' + fg + '}',
      '.sec li:before{content:"";position:absolute;left:4px;top:8px;width:6px;height:6px;border-radius:50%;background:' + CFG.accent + '}',
      '.sec li.no:before{background:#d92d20}',
      '.more{display:block;width:100%;text-align:center;background:none;border:1.5px dashed ' + line + ';color:' + mut + ';border-radius:10px;padding:11px;font-size:13.5px;cursor:pointer;margin-bottom:16px;transition:.15s}',
      '.more:hover{border-color:' + CFG.accent + ';color:' + CFG.accent + '}',
      '.end{text-align:center;font-size:12.5px;color:' + mut + ';padding:10px 0 2px;border-top:1px dashed ' + line + '}',
      '.ld{padding:44px 0;text-align:center;color:' + mut + ';font-size:14px}',
      '.ft{padding:16px 24px 18px;border-top:1px solid ' + line + ';flex-shrink:0;background:' + bg + '}',
      '.chk{display:flex;align-items:flex-start;gap:9px;font-size:13.5px;color:' + fg + ';margin-bottom:13px;cursor:pointer;line-height:1.5}',
      '.chk input{width:17px;height:17px;margin-top:2px;accent-color:' + CFG.accent + ';cursor:pointer;flex-shrink:0}',
      '.hint{font-size:12.5px;color:' + mut + ';text-align:center;margin-bottom:11px;transition:.2s}',
      '.hint.go{color:' + CFG.accent + ';font-weight:600}',
      '.row{display:flex;gap:10px}',
      '.b{flex:1;padding:13px 16px;border-radius:11px;border:none;font-size:14.5px;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s}',
      '.b.no{flex:0 0 96px;background:transparent;color:' + mut + ';border:1.5px solid ' + line + '}',
      '.b.no:hover{border-color:' + mut + '}',
      '.b.ok{background:' + CFG.accent + ';color:#053b34}',
      '.b.ok:hover:not(:disabled){filter:brightness(1.07)}',
      '.b.ok:disabled{opacity:.38;cursor:not-allowed}',
      '.cr{text-align:center;font-size:11px;color:' + mut + ';margin-top:11px}',
      '.cr a{color:' + mut + ';text-decoration:underline}',
      '@media(max-width:420px){.hd h2{font-size:18px}.bd{padding:18px}.b.no{flex:0 0 80px}}'
    ].join('\n');
  }

  function build() {
    host = document.createElement('div');
    host.setAttribute('data-xyc-gate-root', '');
    shadow = host.attachShadow({ mode: 'open' });
    var st = document.createElement('style');
    st.textContent = styles();
    shadow.appendChild(st);
    var mask = document.createElement('div');
    mask.className = 'mask';
    mask.innerHTML = '<div class="box" role="dialog" aria-modal="true"><div class="ld">Memuat kebijakan&hellip;</div></div>';
    shadow.appendChild(mask);
    document.body.appendChild(host);
    return mask;
  }

  function fetchPolicy() {
    if (cache) return Promise.resolve(cache);
    return fetch(ORIGIN + '/api/policy', { mode: 'cors' })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.ok) throw new Error('bad'); cache = d; return d; });
  }

  function paint(mask, d) {
    var box = mask.querySelector('.box');
    var tl = d.tldr && d.tldr.points ? d.tldr.points : [];
    var key = d.sections.filter(function (s) {
      return ['keluar-masuk', 'transaksi', 'promosi'].indexOf(s.id) > -1;
    });

    var full = d.sections.map(function (s) {
      return '<div class="sec"><h4>' + s.number + '. ' + esc(s.title) + '</h4><ul>' +
        s.items.map(function (i) {
          return '<li class="' + (i.type === 'prohibited' ? 'no' : '') + '">' + esc(i.text) + '</li>';
        }).join('') + '</ul></div>';
    }).join('');

    var short = key.map(function (s) {
      return '<div class="sec"><h4>' + s.number + '. ' + esc(s.title) + '</h4><ul>' +
        s.items.slice(0, 4).map(function (i) {
          return '<li class="' + (i.type === 'prohibited' ? 'no' : '') + '">' + esc(i.text) + '</li>';
        }).join('') + '</ul></div>';
    }).join('');

    var needChk = CFG.require === 'check' || CFG.require === 'both';
    var needScroll = CFG.require === 'scroll' || CFG.require === 'both';

    box.innerHTML =
      '<div class="hd">' +
        '<button class="x" aria-label="Tutup">&times;</button>' +
        '<div class="bdg">Baca dulu sebentar</div>' +
        '<h2>' + esc(d.meta.title) + '</h2>' +
        '<div class="g">' + esc(d.meta.nameStyled) + '</div>' +
      '</div>' +
      '<div class="bd">' +
        (tl.length ? '<div class="tl"><h3>Intinya cuma tiga</h3><ol>' +
          tl.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' : '') +
        '<div id="short">' + short + '</div>' +
        '<button class="more" id="more">Lihat semua ' + d.sections.length + ' bagian &darr;</button>' +
        '<div id="full" style="display:none">' + full + '</div>' +
        '<div class="end" id="end">Udah sampai bawah. Makasih udah baca.</div>' +
      '</div>' +
      '<div class="ft">' +
        (needChk ? '<label class="chk"><input type="checkbox" id="chk"><span>Gua udah baca dan ngerti isinya, terutama soal keluar dari grup ga bisa balik lagi.</span></label>' : '') +
        (needScroll ? '<div class="hint" id="hint">Scroll sampai bawah dulu ya</div>' : '') +
        '<div class="row">' +
          '<button class="b no" id="no">Batal</button>' +
          '<button class="b ok" id="ok"' + (CFG.require === 'none' ? '' : ' disabled') + '>Setuju &amp; Lanjut</button>' +
        '</div>' +
        '<div class="cr">Kebijakan oleh <a href="' + esc(d.meta.url) + '" target="_blank" rel="noopener">' + esc(d.meta.domain) + '</a></div>' +
      '</div>';

    var bd = box.querySelector('.bd');
    var ok = box.querySelector('#ok');
    var hint = box.querySelector('#hint');
    var chk = box.querySelector('#chk');
    var reachedBottom = !needScroll;

    function refresh() {
      if (CFG.require === 'none') { ok.disabled = false; return; }
      var okScroll = !needScroll || reachedBottom;
      var okChk = !needChk || (chk && chk.checked);
      ok.disabled = !(okScroll && okChk);
    }

    bd.addEventListener('scroll', function () {
      if (bd.scrollTop + bd.clientHeight >= bd.scrollHeight - 24) {
        if (!reachedBottom) {
          reachedBottom = true;
          if (hint) { hint.textContent = 'Oke, lanjut'; hint.className = 'hint go'; }
        }
        refresh();
      }
    }, { passive: true });

    box.querySelector('#more').addEventListener('click', function () {
      box.querySelector('#short').style.display = 'none';
      box.querySelector('#full').style.display = 'block';
      this.style.display = 'none';
    });

    if (chk) chk.addEventListener('change', refresh);
    box.querySelector('.x').addEventListener('click', function () { finish(false); });
    box.querySelector('#no').addEventListener('click', function () { finish(false); });
    ok.addEventListener('click', function () { remember(); finish(true); });

    // konten pendek dan udah keliatan semua
    setTimeout(function () {
      if (bd.scrollHeight <= bd.clientHeight + 8) {
        reachedBottom = true;
        if (hint) { hint.textContent = 'Oke, lanjut'; hint.className = 'hint go'; }
        refresh();
      }
    }, 60);
  }

  var maskEl = null, prevOverflow = '';

  function finish(ok) {
    if (maskEl) maskEl.classList.remove('on');
    document.documentElement.style.overflow = prevOverflow;
    setTimeout(function () { if (host) { host.remove(); host = null; maskEl = null; } }, 220);
    var p = pending; pending = null;
    if (p) {
      p.resolve(ok);
      if (ok && p.href) {
        if (p.target === '_blank') window.open(p.href, '_blank', 'noopener');
        else location.href = p.href;
      }
    }
  }

  function open(href, target) {
    if (agreed()) {
      if (href) {
        if (target === '_blank') window.open(href, '_blank', 'noopener');
        else location.href = href;
      }
      return Promise.resolve(true);
    }
    return new Promise(function (resolve) {
      pending = { href: href, target: target, resolve: resolve };
      maskEl = build();
      prevOverflow = document.documentElement.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      requestAnimationFrame(function () { maskEl.classList.add('on'); });

      fetchPolicy().then(function (d) { paint(maskEl, d); }).catch(function () {
        maskEl.querySelector('.box').innerHTML =
          '<div class="hd"><h2>Gagal memuat</h2></div>' +
          '<div class="bd"><p style="font-size:14px">Kebijakannya lagi ga bisa dimuat. Buka manual di ' +
          '<a href="' + ORIGIN + '" target="_blank" rel="noopener" style="color:' + CFG.accent + '">' +
          ORIGIN.replace(/^https?:\/\//, '') + '</a></p></div>' +
          '<div class="ft"><div class="row"><button class="b no" id="no">Tutup</button>' +
          '<button class="b ok" id="ok">Lanjut Aja</button></div></div>';
        maskEl.querySelector('#no').onclick = function () { finish(false); };
        maskEl.querySelector('#ok').onclick = function () { finish(true); };
      });
    });
  }

  var WA = /(?:wa\.me|chat\.whatsapp\.com|whatsapp\.com\/channel|api\.whatsapp\.com)/i;

  function intercept(e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var manual = a.hasAttribute('data-xyc-gate');
    var auto = CFG.auto === 'all' || (CFG.auto === 'wa' && WA.test(a.href));
    if (!manual && !auto) return;
    if (a.hasAttribute('data-xyc-gate-skip')) return;
    if (agreed()) return;
    e.preventDefault();
    e.stopPropagation();
    open(a.href, a.target);
  }

  document.addEventListener('click', intercept, true);

  window.XycGate = {
    open: open,
    agreed: agreed,
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    config: CFG,
    version: '1.0.0'
  };
})();
