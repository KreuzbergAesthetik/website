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
  var edMode = /[?&]ed=1\b/.test(location.search), vis = /[?&]vis=1\b/.test(location.search), map = {};
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
    if (edMode && !vis) return; root = root || document.body; if (!root) return;
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
  return { collect: collect, norm: norm, apply: apply, setMap: setMap, useful: useful, skip: skipNode };
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
  function extras(box, over) {
    var list = over || conf().extra || []; if (!box || !list.length) return null;
    box.appendChild(el2('h2', '', 'Weitere Angaben'));
    var card = el2('div', 'card'), items = [], wraps = [];
    list.forEach(function (f, i) {
      var wrap = el2('div'), ctl, get, mark; wraps.push(wrap);
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
    return { wraps: wraps, collect: function () {
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

/*
 * Visueller Editor (?ed=1&vis=1): Die Praxis-App zeigt das echte Formular in einem Rahmen.
 * Tippen auf einen Text ändert ihn, ⚙ an einem Feld steuert Anzeigen und Pflicht, am Ende lassen sich eigene Fragen anlegen.
 * Die Praxis-App holt das Ergebnis mit KE.result().
 */
var KE = (function () {
  if (!/[?&]vis=1\b/.test(location.search)) return null;
  var init = {}; try { init = window.parent.ffvInit ? window.parent.ffvInit() : {}; } catch (x) {}
  var D = { texte: init.texte || {}, felder: init.felder || {} };
  D.felder.hide = D.felder.hide || []; D.felder.req = D.felder.req || {}; D.felder.extra = D.felder.extra || [];
  var form = document.body.getAttribute('data-form') || '', sheet = null, norm = KT.norm;
  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function all(sel) { return [].slice.call(document.querySelectorAll(sel)); }
  function css() {
    var st = h('style'); st.textContent = 'body{padding-bottom:340px !important} .ke-hint{background:#fef9c3;border:1px solid #eab308;color:#713f12;border-radius:10px;padding:8px 12px;font-size:13px;margin:8px 0} '
      + '.ke-badge{position:absolute;top:2px;right:2px;z-index:6;background:#0f172a;color:#fff;border:none;border-radius:8px;font-size:14px;line-height:1;padding:5px 8px;cursor:pointer;opacity:.85} .ke-dim{opacity:.4;outline:2px dashed #94a3b8;outline-offset:2px} '
      + '.ke-add{display:block;width:100%;margin:10px 0;padding:12px;border:2px dashed #94a3b8;border-radius:12px;background:#f8fafc;color:#334155;font-size:15px;cursor:pointer} '
      + '.ke-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#fff;border-top:3px solid #0f172a;border-radius:16px 16px 0 0;box-shadow:0 -10px 30px rgba(15,23,42,.3);padding:12px 14px 16px;max-height:70vh;overflow-y:auto;font:15px system-ui,sans-serif;color:#0f172a} '
      + '.ke-sheet h4{margin:0 0 8px;font-size:14px;color:#475569} .ke-sheet textarea,.ke-sheet input[type=text],.ke-sheet select{width:100%;box-sizing:border-box;font:inherit;padding:8px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:8px} '
      + '.ke-sheet .ke-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:8px} .ke-sheet button{font:inherit;padding:9px 14px;border:none;border-radius:10px;background:#e2e8f0;color:#334155;cursor:pointer} .ke-sheet button.ok{background:#2f9e44;color:#fff} .ke-sheet small{color:#64748b} '
      + '.ke-sheet label{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:15px}';
    document.head.appendChild(st);
  }
  function closeSheet() { if (sheet) { sheet.remove(); sheet = null; } }
  function openSheet(title, build) {
    closeSheet(); sheet = h('div', 'ke-ui ke-sheet'); sheet.appendChild(h('h4', '', title)); build(sheet);
    var r = h('div', 'ke-row'); var ok = h('button', 'ok', 'Fertig'); ok.type = 'button'; ok.onclick = function () { closeSheet(); redrawExtras(); }; r.appendChild(ok); sheet.appendChild(r);
    document.body.appendChild(sheet);
  }
  /* Texte */
  function editText(key, current, title, hint) {
    openSheet(title, function (b) {
      var ta = h('textarea'); ta.rows = current.length > 80 ? 5 : 2; ta.value = current; b.appendChild(ta);
      var sm = h('small', '', 'Original: ' + key); sm.style.display = 'block'; sm.style.marginBottom = '8px'; b.appendChild(sm);
      if (hint) { var hh = h('small', '', hint); hh.style.display = 'block'; hh.style.marginBottom = '8px'; b.appendChild(hh); }
      var set = function () { var v = norm(ta.value); if (!v || v === key) delete D.texte[key]; else D.texte[key] = v; KT.setMap(D.texte); };
      ta.oninput = set;
      var rs = h('button', '', '↺ Original'); rs.type = 'button'; rs.onclick = function () { ta.value = key; set(); }; var r = h('div', 'ke-row'); r.appendChild(rs); b.appendChild(r); ta.focus();
    });
  }
  function textAt(x, y) {
    var n = null;
    if (document.caretPositionFromPoint) { var p = document.caretPositionFromPoint(x, y); n = p && p.offsetNode; }
    else if (document.caretRangeFromPoint) { var r = document.caretRangeFromPoint(x, y); n = r && r.startContainer; }
    if (!n || n.nodeType !== 3 || KT.skip(n)) return null;
    var rg = document.createRange(); rg.selectNodeContents(n); var rs = rg.getClientRects();
    for (var i = 0; i < rs.length; i++) { var q = rs[i]; if (x >= q.left - 8 && x <= q.right + 8 && y >= q.top - 8 && y <= q.bottom + 8) return n; }
    return null;
  }
  function onTap(ev) {
    if (ev.target.closest && ev.target.closest('.ke-ui')) return;
    ev.preventDefault(); ev.stopPropagation();
    var t = ev.target, n = textAt(ev.clientX, ev.clientY);
    if (!n && t.nodeType === 1) { var w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT, null), c; while ((c = w.nextNode())) { if (!KT.skip(c) && KT.useful(norm(c._ko != null ? c._ko : c.nodeValue))) { n = c; break; } } }
    if (t.matches && t.matches('input,textarea') && t.getAttribute('placeholder')) { var key = norm(t._ka && t._ka.placeholder != null ? t._ka.placeholder : t.getAttribute('placeholder')); editText(key, norm(t.getAttribute('placeholder')), 'Platzhalter ändern'); return; }
    if (n) { KT.apply(n); var k = norm(n._ko != null ? n._ko : n.nodeValue); if (KT.useful(k)) editText(k, norm(n.nodeValue), 'Text ändern'); }
  }
  /* Felder */
  function marks(el, need) {
    var ms = el.querySelectorAll('.req'); [].forEach.call(ms, function (r) { r.style.display = need ? '' : 'none'; });
    if (need && !ms.length) { var l = el.querySelector('label.l'); if (l) { l.appendChild(document.createTextNode(' ')); l.appendChild(Object.assign(h('span'), { className: 'req', textContent: '*' })); } }
  }
  function refresh(el, k, defReq, hasReq) {
    var hid = D.felder.hide.indexOf(k) >= 0; el.classList.toggle('ke-dim', hid);
    if (hasReq) marks(el, D.felder.req[k] != null ? !!D.felder.req[k] : defReq);
  }
  function fieldSheet(el, k, title, lock, defReq, hasReq) {
    openSheet(title, function (b) {
      var l1 = h('label'), c1 = h('input'); c1.type = 'checkbox'; c1.checked = D.felder.hide.indexOf(k) < 0; c1.disabled = lock; l1.appendChild(c1); l1.appendChild(document.createTextNode('Im Formular anzeigen')); b.appendChild(l1);
      c1.onchange = function () { var i = D.felder.hide.indexOf(k); if (c1.checked && i >= 0) D.felder.hide.splice(i, 1); if (!c1.checked && i < 0) D.felder.hide.push(k); refresh(el, k, defReq, hasReq); };
      if (hasReq && !lock) {
        var l2 = h('label'), c2 = h('input'); c2.type = 'checkbox'; c2.checked = D.felder.req[k] != null ? !!D.felder.req[k] : defReq; l2.appendChild(c2); l2.appendChild(document.createTextNode('Pflichtfeld')); b.appendChild(l2);
        c2.onchange = function () { if (c2.checked === defReq) delete D.felder.req[k]; else D.felder.req[k] = c2.checked; refresh(el, k, defReq, hasReq); };
      }
      if (lock) b.appendChild(h('small', '', 'Dieses Feld wird für die Zuordnung zur Akte gebraucht und bleibt immer sichtbar.'));
    });
  }
  function badge(el, onclick) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var b = h('button', 'ke-ui ke-badge', '⚙'); b.type = 'button'; b.setAttribute('aria-label', 'Feld bearbeiten'); b.onclick = function (ev) { ev.preventDefault(); ev.stopPropagation(); onclick(); }; el.appendChild(b);
  }
  function decorate() {
    all('[data-fk]').forEach(function (el) {
      var k = el.getAttribute('data-fk'), lock = el.getAttribute('data-lock') === '1', dr = el.getAttribute('data-req') === '1', t = el.getAttribute('data-fl') || k;
      badge(el, function () { fieldSheet(el, k, t, lock, dr, true); }); refresh(el, k, dr, !lock);
    });
    if (window.ui && window.QS) window.ui.forEach(function (u) {
      var k = 'q' + u.n, lock = u.n === 3 || u.n === 4;
      badge(u.card, function () { fieldSheet(u.card, k, 'Frage ' + u.n, lock, false, false); }); refresh(u.card, k, false, false);
    });
  }
  /* Eigene Zusatzfragen */
  var TYPEN = [['text', 'Kurzer Text'], ['lang', 'Langer Text'], ['jn', 'Ja / Nein'], ['wahl', 'Auswahl'], ['datum', 'Datum'], ['haken', 'Haken (Bestätigung)']];
  function extraSheet(i) {
    var f = D.felder.extra[i]; if (!f) return;
    openSheet('Eigene Frage', function (b) {
      var l = h('input'); l.type = 'text'; l.placeholder = 'Frage oder Beschriftung'; l.value = f.label || ''; l.oninput = function () { f.label = l.value; }; b.appendChild(l);
      var t = h('select'); TYPEN.forEach(function (o) { var op = h('option', '', o[1]); op.value = o[0]; t.appendChild(op); }); t.value = f.typ;
      var o = h('textarea'); o.rows = 3; o.placeholder = 'Eine Antwort pro Zeile'; o.value = (f.opts || []).join('\n'); o.style.display = f.typ === 'wahl' ? '' : 'none'; o.oninput = function () { f.opts = o.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
      t.onchange = function () { f.typ = t.value; o.style.display = t.value === 'wahl' ? '' : 'none'; redrawExtras(); };
      b.appendChild(t); b.appendChild(o);
      var lr = h('label'), cr = h('input'); cr.type = 'checkbox'; cr.checked = !!f.req; cr.onchange = function () { f.req = cr.checked; redrawExtras(); }; lr.appendChild(cr); lr.appendChild(document.createTextNode('Pflichtfeld')); b.appendChild(lr);
      var row = h('div', 'ke-row'), mv = function (txt, d) { var bt = h('button', '', txt); bt.type = 'button'; bt.onclick = function () { var j = i + d; if (j < 0 || j >= D.felder.extra.length) return; var x = D.felder.extra.splice(i, 1)[0]; D.felder.extra.splice(j, 0, x); closeSheet(); redrawExtras(); extraSheet(j); }; return bt; };
      row.appendChild(mv('↑ Nach oben', -1)); row.appendChild(mv('↓ Nach unten', 1));
      var del = h('button', '', 'Löschen'); del.type = 'button'; del.style.color = '#b91c1c'; del.onclick = function () { D.felder.extra.splice(i, 1); closeSheet(); redrawExtras(); }; row.appendChild(del); b.appendChild(row);
    });
  }
  function redrawExtras() {
    var box = document.getElementById('extras'); if (!box) return; box.innerHTML = '';
    var list = D.felder.extra, r = list.length && typeof ynToggle === 'function' ? KF.extras(box, list) : null;
    if (r) r.wraps.forEach(function (w, i) { badge(w, function () { extraSheet(i); }); });
    var add = h('button', 'ke-ui ke-add', '+ Eigene Frage hinzufügen'); add.type = 'button';
    add.onclick = function () { D.felder.extra.push({ id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), label: 'Neue Frage', typ: 'text', req: false, opts: [] }); redrawExtras(); extraSheet(D.felder.extra.length - 1); };
    box.appendChild(add); KT.apply(box);
  }
  function start() {
    css(); KT.setMap(D.texte);
    all('.info-panel').forEach(function (p) { p.classList.add('on'); }); all('details').forEach(function (d) { d.open = true; });
    var hint = h('div', 'ke-ui ke-hint', 'Tippe auf einen Text, um ihn zu ändern.' + (form ? ' Mit ⚙ steuerst Du, ob ein Feld erscheint und ob es Pflicht ist.' : '')); var w = document.querySelector('.wrap'); if (w) w.insertBefore(hint, w.firstChild);
    if (form) { decorate(); redrawExtras(); }
    document.addEventListener('click', onTap, true); document.addEventListener('mousedown', function (e) { if (!(e.target.closest && e.target.closest('.ke-ui'))) e.preventDefault(); }, true);
    document.addEventListener('submit', function (e) { e.preventDefault(); }, true);
    try { new MutationObserver(function (list) { list.forEach(function (r) { [].forEach.call(r.addedNodes, function (n) { if (!(n.classList && n.classList.contains('ke-ui'))) KT.apply(n); }); }); }).observe(document.body, { childList: true, subtree: true }); } catch (x) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  function result() {
    var ex = D.felder.extra.filter(function (f) { return String(f.label || '').trim(); });
    if (ex.some(function (f) { return f.typ === 'wahl' && !(f.opts || []).length; })) return { error: 'Bei einer Auswahl brauchst Du mindestens eine Antwort (eine pro Zeile).' };
    ex.forEach(function (f) { f.label = f.label.trim(); });
    return { error: '', texte: D.texte, felder: { hide: D.felder.hide, req: D.felder.req, extra: ex } };
  }
  return { result: result };
})();
