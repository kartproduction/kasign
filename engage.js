/* KASIGN — Like / Comment / Share for blog posts
   Drop-in: add <script src="engage.js"></script> right before </body> in index.html
   Comments + likes (reactions) use Giscus (GitHub Discussions). Fill in the 2 IDs below. */
(function () {
  // ====== 1. PASTE YOUR GISCUS IDS HERE (from https://giscus.app) ======
  var GISCUS = {
    repo: 'kartproduction/kasign',
    repoId: 'R_kgDOU12ajg',
    category: 'Comments',
    categoryId: 'DIC_kwDOU12ajs4DHMSU'
  };
  // =====================================================================

  var pv = document.getElementById('postview');
  if (!pv) return;

  // ---- styles (use your site's own colour variables, so light/dark just works)
  var css =
    '#engage{margin-top:48px;padding-top:22px;border-top:1px solid var(--line)}' +
    '.eng-bar{display:flex;flex-wrap:wrap;gap:10px}' +
    '.eng-btn{font:inherit;font-size:.92rem;font-weight:500;padding:9px 16px;border:1px solid var(--line);' +
    'background:var(--paper-2);color:var(--ink);border-radius:2px;cursor:pointer;text-decoration:none}' +
    '.eng-btn:hover{border-color:var(--clay);color:var(--clay)}' +
    '.eng-menu{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
    '.eng-menu[hidden]{display:none}' +
    '#comments{margin-top:24px}' +
    '.eng-note{font-size:.9rem;opacity:.7}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // ---- the container
  var box = document.createElement('div');
  box.id = 'engage';

  function theme() {
    var a = document.documentElement.getAttribute('data-theme');
    if (a) return a;
    return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function mount(art, slug) {
    var pn = art.querySelector('.pn');
    art.insertBefore(box, pn || null);

    var title = art.querySelector('h1').textContent;
    var url = location.origin + location.pathname + '#post/' + slug;
    var enc = encodeURIComponent;

    box.innerHTML =
      '<div class="eng-bar">' +
        '<button class="eng-btn" id="eng-like" type="button">\u2661 Like</button>' +
        '<button class="eng-btn" id="eng-comment" type="button">\uD83D\uDCAC Comment</button>' +
        '<button class="eng-btn" id="eng-share" type="button">\u2197 Share</button>' +
      '</div>' +
      '<div class="eng-menu" id="eng-menu" hidden>' +
        '<a class="eng-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + enc(url) + '">Facebook</a>' +
        '<a class="eng-btn" target="_blank" rel="noopener" href="https://x.com/intent/tweet?url=' + enc(url) + '&text=' + enc(title) + '">X</a>' +
        '<a class="eng-btn" target="_blank" rel="noopener" href="https://wa.me/?text=' + enc(title + ' ' + url) + '">WhatsApp</a>' +
        '<button class="eng-btn" id="eng-copy" type="button">Copy link</button>' +
      '</div>' +
      '<div id="comments"></div>';

    function toComments() {
      document.getElementById('comments').scrollIntoView({ behavior: 'smooth' });
    }
    document.getElementById('eng-like').onclick = toComments;     // Giscus reaction bar sits at the top of the widget
    document.getElementById('eng-comment').onclick = toComments;

    document.getElementById('eng-share').onclick = function () {
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
      } else {
        var m = document.getElementById('eng-menu');
        m.hidden = !m.hidden;
      }
    };
    document.getElementById('eng-copy').onclick = function (e) {
      var b = e.target;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
        .then(function () { b.textContent = 'Copied \u2713'; })
        .catch(function () { window.prompt('Copy this link:', url); });
    };

    var holder = document.getElementById('comments');
    if (/^PASTE_/.test(GISCUS.repoId) || /^PASTE_/.test(GISCUS.categoryId)) {
      holder.innerHTML = '<p class="eng-note">Comments will appear here once the Giscus IDs are added in engage.js.</p>';
      return;
    }

    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    var attrs = {
      'data-repo': GISCUS.repo,
      'data-repo-id': GISCUS.repoId,
      'data-category': GISCUS.category,
      'data-category-id': GISCUS.categoryId,
      'data-mapping': 'specific',
      'data-term': slug,                 // one discussion per post
      'data-strict': '0',
      'data-reactions-enabled': '1',     // the "like" reactions
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': theme(),
      'data-lang': 'en',
      'data-loading': 'lazy'
    };
    Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    holder.appendChild(s);
  }

  // keep the comment box in sync with the \u25D0 light/dark button
  new MutationObserver(function () {
    var f = document.querySelector('iframe.giscus-frame');
    if (f) f.contentWindow.postMessage({ giscus: { setConfig: { theme: theme() } } }, 'https://giscus.app');
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  function onRoute() {
    var m = location.hash.slice(1).match(/^post\/(.+)$/);
    var art = m && document.getElementById('p-' + m[1]);
    if (art && !art.hidden) mount(art, m[1]);
  }

  window.addEventListener('hashchange', onRoute);
  onRoute();
})();
