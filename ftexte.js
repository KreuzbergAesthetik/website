/*
 * Eigene Texte für die Webformulare.
 * Die Praxis-App veröffentlicht eine Liste "Originaltext -> eigener Text" auf dem Server der Praxis.
 * Jede Formularseite lädt sie beim Öffnen und ersetzt damit die passenden Texte (auch Platzhalter und Hinweise).
 * Mit ?ed=1 bleiben die Originaltexte stehen; so liest die App aus, welche Texte es gibt.
 */
var KT = (function () {
  var URL_T = 'https://www.kreuzberg-aesthetik.de/wp-json/ka/v1/texte', LS = 'ka_texte', ATTRS = ['placeholder', 'title'];
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
    fetch(URL_T, { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.ok || !j.texte || typeof j.texte !== 'object') return;
      var neu = JSON.stringify(j.texte); if (neu === JSON.stringify(map)) return;
      try { localStorage.setItem(LS, neu); } catch (x) {}
      setMap(j.texte);
    }).catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  return { collect: collect, norm: norm, apply: apply };
})();
