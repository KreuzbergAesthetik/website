/*
 * Eigene Texte für die Webformulare.
 * Die Praxis-App veröffentlicht eine Liste "Originaltext -> eigener Text" auf dem Server der Praxis.
 * Jede Formularseite lädt sie beim Öffnen und ersetzt damit die passenden Texte (auch Platzhalter und Hinweise).
 * Mit ?ed=1 bleiben die Originaltexte stehen; so liest die App aus, welche Texte es gibt.
 */
var KP = null;
function kLoad() {
  if (!KP) KP = fetch('https://www.kreuzberg-aesthetik.de/wp-json/ka/v1/texte', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) { return j && j.ok ? j : null; }).catch(function () { return null; });
  return KP;
}
var KT = (function () {
  var LS = 'ka_texte', ATTRS = ['placeholder', 'title'];
  var edMode = /[?&]ed=1\b/.test(location.search), map = {};
  function norm(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function skipNode(n) {
    for (var p = n.parentNode; p && p.nodeType === 1; p = p.parentNode) { if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CANVAS|SVG)$/i.test(p.nodeName) || p.classList && p.classList.contains('hp')) return true; }
    return false;
  }
  function useful(k) { return k.length > 1 && /[A-Za-zÄÖÜäöüß]{2}/.test(k); }
  function eachText(root, fn) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { if (!skipNode(n)) fn(n); }
  }
  function eachAttr(root, fn) {
    var els = root.querySelectorAll ? [].slice.call(root.querySelectorAll('[placeholder],[title]')) : [];
    if (root.nodeType === 1 && (root.hasAttribute('placeholder') || root.hasAttribute('title'))) els.unshift(root);
    els.forEach(function (e) { if (skipNode(e) || (e.classList && e.classList.contains('hp'))) return; ATTRS.forEach(function (a) { if (e.hasAttribute(a)) fn(e, a); }); });
  }
  /* Alle Texte einer Seite, in der Reihenfolge der Seite, ohne Doppelte */
  function collect(root) {
    var seen = {}, out = [];
    function add(raw) { var k = norm(raw); if (!useful(k) || seen[k]) return; seen[k] = 1; out.push(k); }
    eachText(root || document.body, function (n) { add(n._ko != null ? n._ko : n.nodeValue); });
    eachAttr(root || document.body, function (e, a) { add(e._ka && e._ka[a] != null ? e._ka[a] : e.getAttribute(a)); });
    return out;
  }
  function apply(root) {
    if (edMode) return; root = root || document.body; if (!root) return;
    var nodes = [];
    if (root.nodeType === 3) { if (!skipNode(root)) nodes.push(root); } else eachText(root, function (n) { nodes.push(n); });
    nodes.forEach(function (n) {
      if (n._ko == null) n._ko = n.nodeValue;
      var k = norm(n._ko), v = map[k], want = n._ko;
      if (k && v != null && v !== '') { var m = /^(\s*)[\s\S]*?(\s*)$/.exec(n._ko); want = m[1] + v + m[2]; }
      if (n.nodeValue !== want) n.nodeValue = want;
    });
    if (root.nodeType === 1 || root.nodeType === 9) eachAttr(root, function (e, a) {
      e._ka = e._ka || {}; if (e._ka[a] == null) e._ka[a] = e.getAttribute(a);
      var k = norm(e._ka[a]), v = map[k], want = (k && v != null && v !== '') ? v : e._ka[a];
      if (e.getAttribute(a) !== want) e.setAttribute(a, want);
    });
  }
  function setMap(m) { map = m && typeof m === 'object' ? m : {}; apply(); }
  function init() {
    if (edMode) return;
    try { var c = JSON.parse(localStorage.getItem(LS)); if (c && typeof c === 'object') map = c; } catch (x) {}
    apply();
    try { new MutationObserver(function (list) { list.forEach(function (r) { [].forEach.call(r.addedNodes, function (n) { apply(n); }); }); }).observe(document.body, { childList: true, subtree: true }); } catch (x) {}
    kLoad().then(function (j) {
      if (!j || !j.texte || typeof j.texte !== 'object') return;
      var neu = JSON.stringify(j.texte); if (neu === JSON.stringify(map)) return;
      try { localStorage.setItem(LS, neu); } catch (x) {}
      setMap(j.texte);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  return { collect: collect, norm: norm, apply: apply };
})();

/*
 * Felder der Webformulare: ausblenden, Pflicht ein oder aus, eigene Zusatzfragen.
 * Einstellung je Formular: { hide: [Schlüssel], req: { Schlüssel: true|false }, extra: [ { id, label, typ, req, opts } ] }
 * Die Formularseite wartet (höchstens 2,5 Sekunden), bis die Einstellung vom Server da ist.
 */
var KF = (function () {
  var LSF = 'ka_felder', form = document.body ? document.body.getAttribute('data-form') || '' : '', ed = /[?&]ed=1\b/.test(location.search), cfg = {}, done = false, waiters = [];
  function conf() { return cfg[form] || {}; }
  function hidden(k) { return (conf().hide || []).indexOf(k) >= 0; }
  function need(k, def) { if (hidden(k)) return false; var r = conf().req; return r && r[k] != null ? !!r[k] : !!def; }
  function finish() { if (done) return; done = true; document.body.classList.remove('kf-wait'); waiters.splice(0).forEach(function (f) { try { f(); } catch (x) { if (window.console) console.error(x); } }); }
  function ready(cb) { if (done) cb(); else waiters.push(cb); }
  function grids(el) {
    var par = el.parentNode; if (!par || !par.children) return;
    var vis = [].filter.call(par.children, function (c) { return c.style.display !== 'none'; }).length;
    if (/grid2|grid3/.test(par.className)) par.style.gridTemplateColumns = vis < par.children.length ? 'repeat(' + Math.max(vis, 1) + ',1fr)' : '';
  }
  /* Elemente mit data-fk ausblenden und die Sternchen nach Pflicht setzen */
  function apply() {
    [].forEach.call(document.querySelectorAll('[data-fk]'), function (el) {
      var k = el.getAttribute('data-fk'), h = hidden(k); el.style.display = h ? 'none' : ''; grids(el);
      if (h) return;
      var n = need(k, el.getAttribute('data-req') === '1'), marks = el.querySelectorAll('.req');
      if (el.getAttribute('data-lock') === '1') return;
      [].forEach.call(marks, function (r) { r.style.display = n ? '' : 'none'; });
      if (n && !marks.length) { var l = el.querySelector('label.l'); if (l) l.appendChild(document.createTextNode(' ')), l.appendChild(Object.assign(document.createElement('span'), { className: 'req', textContent: '*' })); }
    });
  }
  function describe(win) {
    var out = { units: [], groups: [] };
    [].forEach.call(win.document.querySelectorAll('[data-fk]'), function (el) { out.units.push({ k: el.getAttribute('data-fk'), t: el.getAttribute('data-fl') || el.getAttribute('data-fk'), req: el.getAttribute('data-req') === '1', lock: el.getAttribute('data-lock') === '1' }); });
    if (win.QS) win.QS.forEach(function (q) { out.groups.push({ k: 'q' + q.n, t: q.n + '. ' + q.t, lock: q.n === 3 || q.n === 4 }); });
    return out;
  }
  /* Zusatzfragen am Ende des Formulars */
  function extras(box) {
    var list = conf().extra || []; if (!box || !list.length) return null;
    box.appendChild(el2('h2', '', 'Weitere Angaben'));
    var card = el2('div', 'card'), items = [];
    list.forEach(function (f, i) {
      var wrap = el2('div'), ctl, get, mark;
      if (i) wrap.style.marginTop = '14px';
      if (f.typ === 'haken') {
        var cb = document.createElement('input'); cb.type = 'checkbox'; var lb = el2('label', 'chk'); lb.appendChild(cb); lb.appendChild(el2('span', '', f.label + (f.req ? ' *' : '')));
        wrap.appendChild(lb); get = function () { return cb.checked ? 'Ja' : 'Nein'; }; mark = function () { lb.classList.add('invalid'); return lb; }; items.push({ f: f, get: get, empty: function () { return !cb.checked; }, mark: mark, node: lb }); card.appendChild(wrap); return;
      }
      var l = el2('label', 'l', f.label); if (f.req) l.appendChild(Object.assign(document.createElement('span'), { className: 'req', textContent: ' *' })); wrap.appendChild(l);
      if (f.typ === 'jn') {
        var yn = ynToggle('kx_' + f.id); wrap.appendChild(yn.node);
        items.push({ f: f, get: function () { var v = yn.get(); return v === null ? '' : v ? 'Ja' : 'Nein'; }, empty: function () { return yn.get() === null; }, mark: function () { yn.mark(); return yn.node; }, node: yn.node });
      } else {
        if (f.typ === 'lang') { ctl = document.createElement('textarea'); ctl.rows = 3; }
        else if (f.typ === 'wahl') { ctl = document.createElement('select'); var o0 = document.createElement('option'); o0.value = ''; o0.textContent = 'Bitte auswählen'; ctl.appendChild(o0); (f.opts || []).forEach(function (o) { var op = document.createElement('option'); op.value = o; op.textContent = o; ctl.appendChild(op); }); }
        else { ctl = document.createElement('input'); ctl.type = f.typ === 'datum' ? 'date' : 'text'; }
        wrap.appendChild(ctl);
        items.push({ f: f, get: function () { var v = ctl.value.trim(); if (f.typ === 'datum' && /^\d{4}-\d{2}-\d{2}$/.test(v)) v = v.slice(8) + '.' + v.slice(5, 7) + '.' + v.slice(0, 4); return v; }, empty: function () { return !ctl.value.trim(); }, mark: function () { ctl.classList.add('invalid'); return ctl; }, node: ctl });
      }
      card.appendChild(wrap);
    });
    box.appendChild(card);
    return { collect: function () {
      var bad = [], out = [];
      items.forEach(function (it) { if (it.f.req && it.empty()) bad.push(it.mark()); out.push({ id: it.f.id, label: it.f.label, typ: it.f.typ, wert: it.get() }); });
      return { bad: bad, list: out };
    } };
  }
  function el2(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  /* Zusatzangaben ins PDF */
  function pdf(P, list) {
    if (!list || !list.length) return;
    P.y -= 8; P.text('ZUSÄTZLICHE ANGABEN', { size: 10.5, bold: true, gap: 2 }); P.rule(8);
    list.forEach(function (e) { P.text(e.label, { size: 9.5, color: P.gray }); P.text(e.wert || '-', { size: 10.5, x: P.M + 8, gap: 4 }); });
  }
  if (form && !ed) {
    document.documentElement.classList.add('kf-on'); document.body.classList.add('kf-wait');
    var st = document.createElement('style'); st.textContent = 'body.kf-wait .wrap{visibility:hidden}'; document.head.appendChild(st);
    try { var c = JSON.parse(localStorage.getItem(LSF)); if (c && typeof c === 'object') cfg = c; } catch (x) {}
    var t = setTimeout(finish, 2500);
    kLoad().then(function (j) {
      if (j && j.felder && typeof j.felder === 'object') { cfg = j.felder; try { localStorage.setItem(LSF, JSON.stringify(cfg)); } catch (x) {} }
      clearTimeout(t); finish();
    });
  } else done = true;
  return { ready: ready, apply: apply, hidden: hidden, need: need, extras: extras, pdf: pdf, describe: describe };
})();
