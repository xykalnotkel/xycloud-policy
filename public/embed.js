/*!
 * XyCloud Policy Embed Widget
 * Tempel kebijakan grup XyCloud ke website mana pun dengan satu baris script.
 *
 *   <div id="xyc-policy"></div>
 *   <script src="https://rules.xyc.my.id/embed.js" defer></script>
 *
 * Opsi lewat atribut data-* pada tag <script>:
 *   data-target="#selector"   elemen tujuan          (default: #xyc-policy)
 *   data-theme="light|dark|auto"                     (default: auto)
 *   data-section="promosi"    tampilkan 1 section    (default: semua)
 *   data-accent="#25d366"     warna aksen (hex/nama warna CSS saja)
 *   data-credit="true|false"  tampilkan kredit       (default: true, mohon jangan dimatikan)
 *   data-lang="id|en|auto"    bahasa isi widget      (default: auto = deteksi browser)
 *
 * Lisensi MIT. Wajib mencantumkan kredit ke https://rules.xyc.my.id
 */
(function () {
  'use strict';

  var script = document.currentScript || (function () {
    var s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  var D = script.dataset || {};
  var origin = (function () {
    try { return new URL(script.src).origin; } catch (e) { return 'https://rules.xyc.my.id'; }
  })();

  var opt = {
    target: D.target || '#xyc-policy',
    theme: D.theme || 'auto',
    section: D.section || '',
    accent: safeAccent(D.accent),
    credit: D.credit !== 'false',
    lang: D.lang || 'auto'
  };

  // Label kecil widget per bahasa. Isi kebijakan diambil dari /api/policy?lang=...
  var STR = {
    id: {
      loading: 'Memuat kebijakan&hellip;',
      ver: 'Versi', upd: 'Update',
      credit: 'Kebijakan oleh',
      err: 'Gagal memuat kebijakan (',
      err2: '). Buka langsung di ',
      noTarget: 'target tidak ketemu:',
      noTarget2: '- bikin <div id="xyc-policy"></div> dulu.',
      badResp: 'respons tidak valid'
    },
    en: {
      loading: 'Loading the policy&hellip;',
      ver: 'Version', upd: 'Updated',
      credit: 'Policy by',
      err: 'Failed to load the policy (',
      err2: '). Open it directly at ',
      noTarget: 'target not found:',
      noTarget2: '- create <div id="xyc-policy"></div> first.',
      badResp: 'invalid response'
    }
  };

  // auto: bahasa browser Indonesia -> id, selain itu -> en, gagal baca -> id.
  function detectLang() {
    if (opt.lang === 'id' || opt.lang === 'en') return opt.lang;
    try {
      var ls = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
      for (var i = 0; i < ls.length; i++) {
        if (/^id/i.test(ls[i] || '')) return 'id';
      }
      return ls[0] ? 'en' : 'id';
    } catch (e) { return 'id'; }
  }

  // data-accent masuk mentah ke dalam <style>. Tanpa disaring, nilai seperti
  // "red;}body{display:none" bisa menutup blok CSS dan menyuntik aturan lain.
  function safeAccent(v) {
    if (typeof v !== 'string') return '#25d366';
    var t = v.trim();
    if (/^#[0-9a-fA-F]{3,8}$/.test(t)) return t;
    if (/^[a-zA-Z]{3,20}$/.test(t)) return t;
    return '#25d366';
  }

  var STYLE_ID = 'xyc-policy-style';

  function injectStyle(dark) {
    if (document.getElementById(STYLE_ID)) return;
    var bg = dark ? '#111b21' : '#ffffff';
    var fg = dark ? '#e9edef' : '#111b21';
    var muted = dark ? '#8696a0' : '#54656f';
    var soft = dark ? '#1f2c33' : '#f0f2f5';
    var line = dark ? '#2a3942' : '#e4e7ec';
    var head = dark ? '#25d366' : '#075e54';

    var css = [
      '.xyc-w{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.7;color:' + fg + ';background:' + bg + ';max-width:780px;margin:0 auto;padding:4px;box-sizing:border-box}',
      '.xyc-w *{box-sizing:border-box}',
      '.xyc-w .xyc-hd{border-bottom:2px solid ' + line + ';padding-bottom:14px;margin-bottom:18px}',
      '.xyc-w .xyc-hd h2{font-size:20px;margin:0 0 4px;color:' + head + '}',
      '.xyc-w .xyc-hd .g{font-weight:700;font-size:15px;color:' + opt.accent + '}',
      '.xyc-w .xyc-hd .m{font-size:12.5px;color:' + muted + ';margin-top:4px}',
      '.xyc-w .xyc-al{border-left:5px solid #d92d20;background:' + (dark ? '#2a1614' : '#fef3f2') + ';padding:14px 16px;border-radius:8px;margin-bottom:18px}',
      '.xyc-w .xyc-al h3{margin:0 0 6px;font-size:15px;color:#d92d20}',
      '.xyc-w .xyc-al p{margin:0 0 6px;font-size:14px}',
      '.xyc-w .xyc-s{margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid ' + line + '}',
      '.xyc-w .xyc-s h3{font-size:16px;margin:0 0 3px;color:' + head + '}',
      '.xyc-w .xyc-s .sub{font-size:12.5px;color:' + muted + ';margin:0 0 10px}',
      '.xyc-w ul.xyc-l{list-style:none;margin:0;padding:0}',
      '.xyc-w ul.xyc-l li{position:relative;padding-left:24px;margin-bottom:8px;font-size:14.5px}',
      '.xyc-w ul.xyc-l li:before{content:"";position:absolute;left:6px;top:10px;width:7px;height:7px;border-radius:50%;background:' + opt.accent + '}',
      '.xyc-w ul.xyc-l li.no:before{background:#d92d20}',
      '.xyc-w .xyc-n{font-size:13px;background:' + soft + ';color:' + muted + ';padding:11px 13px;border-radius:7px;margin-top:10px}',
      '.xyc-w .xyc-n.strict{background:' + (dark ? '#2a1614' : '#fef3f2') + ';color:' + (dark ? '#fda29b' : '#912018') + '}',
      '.xyc-w details{background:' + soft + ';border-radius:8px;margin-bottom:8px;overflow:hidden}',
      '.xyc-w details summary{cursor:pointer;padding:12px 14px;font-weight:600;font-size:14.5px;color:' + head + ';list-style:none}',
      '.xyc-w details summary::-webkit-details-marker{display:none}',
      '.xyc-w details p{margin:0;padding:0 14px 13px;font-size:14px;color:' + muted + '}',
      '.xyc-w .xyc-ft{font-size:12.5px;color:' + muted + ';text-align:center;padding-top:14px;border-top:1px solid ' + line + ';margin-top:18px}',
      '.xyc-w .xyc-ft a{color:' + head + ';text-decoration:none}',
      '.xyc-w .xyc-ld{padding:28px;text-align:center;color:' + muted + ';font-size:14px}',
      '.xyc-w .xyc-er{padding:16px;border-radius:8px;background:' + (dark ? '#2a1614' : '#fef3f2') + ';color:#912018;font-size:14px}'
    ].join('\n');

    var el = document.createElement('style');
    el.id = STYLE_ID;
    el.textContent = css;
    document.head.appendChild(el);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render(host, d, lang) {
    var S = STR[lang];
    var h = [];
    h.push('<div class="xyc-w">');
    h.push('<div class="xyc-hd"><h2>' + esc(d.meta.title) + '</h2>');
    h.push('<div class="g">' + esc(d.meta.nameStyled) + '</div>');
    h.push('<div class="m">' + S.ver + ' ' + esc(d.meta.version) + ' &middot; ' + S.upd + ' ' + esc(d.meta.updated) + '</div></div>');

    if (d.alert && !opt.section) {
      h.push('<div class="xyc-al"><h3>' + esc(d.alert.title) + '</h3>');
      d.alert.paragraphs.forEach(function (p) { h.push('<p>' + esc(p) + '</p>'); });
      h.push('</div>');
    }

    d.sections.forEach(function (s) {
      h.push('<div class="xyc-s" id="xyc-' + esc(s.id) + '">');
      h.push('<h3>' + s.number + '. ' + esc(s.title) + '</h3>');
      h.push('<p class="sub">' + esc(s.subtitle) + '</p><ul class="xyc-l">');
      s.items.forEach(function (i) {
        h.push('<li class="' + (i.type === 'prohibited' ? 'no' : '') + '">' + esc(i.text) + '</li>');
      });
      h.push('</ul>');
      if (s.note) h.push('<div class="xyc-n ' + (s.note.level === 'strict' ? 'strict' : '') + '">' + esc(s.note.text) + '</div>');
      h.push('</div>');
    });

    if (d.faq && d.faq.length) {
      h.push('<h3 style="font-size:15px;margin:0 0 10px">FAQ</h3>');
      d.faq.forEach(function (f) {
        h.push('<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>');
      });
    }

    h.push('<div class="xyc-ft"><p>' + esc(d.footer) + '</p>');
    if (opt.credit) {
      h.push('<p>' + S.credit + ' <a href="' + esc(d.meta.url) + '" target="_blank" rel="noopener">' + esc(d.meta.domain) + '</a> &middot; MIT License</p>');
    }
    h.push('</div></div>');

    host.innerHTML = h.join('');
  }

  function boot() {
    var lang = detectLang();
    var S = STR[lang];
    var host = document.querySelector(opt.target);
    if (!host) {
      console.warn('[xyc-policy] ' + S.noTarget, opt.target, S.noTarget2);
      return;
    }

    var dark = opt.theme === 'dark' || (opt.theme === 'auto' &&
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    injectStyle(dark);

    host.innerHTML = '<div class="xyc-w"><div class="xyc-ld">' + S.loading + '</div></div>';

    // Selalu versi publik. Versi internal tidak lagi bisa ditarik dari widget.
    var q = '?lang=' + lang + (opt.section ? '&section=' + encodeURIComponent(opt.section) : '');
    var url = origin + '/api/policy' + q;

    fetch(url, { mode: 'cors' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        if (!d || !d.ok) throw new Error(S.badResp);
        render(host, d, lang);
        host.dispatchEvent(new CustomEvent('xyc:policy:loaded', { bubbles: true, detail: d }));
      })
      .catch(function (e) {
        host.innerHTML = '<div class="xyc-w"><div class="xyc-er">' + S.err + esc(e.message) +
          S.err2 + '<a href="' + origin + '">' + origin.replace(/^https?:\/\//, '') + '</a></div></div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
