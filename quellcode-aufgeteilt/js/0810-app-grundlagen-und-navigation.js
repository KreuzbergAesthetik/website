
/* Praxis-Menü: Reihenfolge, Beschriftung und Aufbau-Funktion je Seite; '-' = Trennlinie, geplant = noch nicht vorhanden */
var KA_V = '2026-11-11-h';
function kaVersion() { var m = /^(\d{4})-(\d{2})-(\d{2})-(\w+)$/.exec(KA_V); return m ? 'Version ' + m[3] + '.' + m[2] + '.' + m[1] + ' (' + m[4] + ')' : 'Version ' + KA_V; }
var PRAXIS_NAV = [['#', 'Finanzen'], ['rechnungen', 'Rechnungen', 'renderInvoices'], ['zahlungen', 'Zahlungen', 'renderZahlungen'], ['statistik', 'Statistik', 'renderStat'],
  ['#', 'Praxis'], ['lager', 'Lager', 'renderLager'], ['leistungen', 'Leistungen', 'renderLeist'], ['settings', 'Praxisdaten', 'openSettings'],
  ['#', 'Kommunikation & Vorlagen'], ['webformulare', 'Webformulare', 'renderWebf'], ['dokumente', 'Vorlagen', 'renderTemplates'], ['nachrichten', 'Nachrichtenvorlagen', 'renderNachr'], ['textbausteine', 'Textbausteine', 'renderTxt'],
  ['#', 'Daten & Technik'], ['abgleich', 'Geräte-Abgleich', 'renderSync'], ['sicherung', 'Sicherung', 'renderSicherung'],
  ['#', 'Geplant'], ['', 'Patientenstammdaten'], ['', 'Automationen']];
var NAV_PINNED = ['rechnungen'];
var PRAXIS_TABS = PRAXIS_NAV.filter(function (x) { return x[0] && x[0] !== '#'; }).map(function (x) { return x[0]; });
/* Navigationsleiste: so viele Seiten aus dem Praxis-Menü, wie in die Breite passen; der Rest steht hinter dem Pfeil */
(function () {
  var nav = document.querySelector('header nav'), more = document.getElementById('btn-praxis');
  PRAXIS_NAV.forEach(function (x) {
    if (!x || !x[0] || x[0] === '#' || NAV_PINNED.indexOf(x[0]) < 0) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'nav-btn nav-x nav-main'; b.id = 'btn-' + x[0]; b.textContent = x[1]; b.style.display = 'none'; b.onclick = function () { switchTab(x[0]); };
    nav.insertBefore(b, more);
  });
})();
function navFit() {
  var nav = document.querySelector('header nav'), more = document.getElementById('btn-praxis'); if (!nav || !more) return;
  var fixed = [].filter.call(nav.querySelectorAll('.nav-btn:not(.nav-x)'), function (b) { return b !== more; }), xs = [].slice.call(nav.querySelectorAll('.nav-x'));
  nav.classList.add('nav-meas'); xs.forEach(function (b) { b.style.display = ''; });
  var used = more.offsetWidth + fixed.reduce(function (t, b) { return t + b.offsetWidth; }, 0), avail = nav.clientWidth, n = 0;
  var phone = window.matchMedia('(max-width:760px)').matches, cap = phone ? 1 : xs.length;   /* Handy: nur bis Rechnungen, Zahlungen steht im Menü */
  for (var i = 0; i < Math.min(xs.length, cap); i++) { var w = xs[i].offsetWidth; if (used + w > avail - 10) break; used += w; n++; }
  xs.forEach(function (b, i) { b.style.display = i < n ? '' : 'none'; });
  nav.classList.remove('nav-meas');
  var cur = document.querySelector('.tab-content.active'); if (cur) { var id = cur.id.replace(/^tab-/, ''), nb = document.getElementById('btn-' + id), vis = nb && nb.style.display !== 'none'; [].forEach.call(nav.querySelectorAll('.nav-btn'), function (b) { b.classList.remove('active'); }); var t = vis ? nb : (PRAXIS_TABS.indexOf(id) >= 0 ? more : null); if (t) t.classList.add('active'); }
}
var NAV_ICON = {
  rechnungen: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/>',
  zahlungen: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  statistik: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  lager: '<path d="M3 8l9-5 9 5v10l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v10"/>',
  leistungen: '<path d="M5 4h14v16H5zM9 9h6M9 13h6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  webformulare: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8"/>',
  dokumente: '<path d="M6 3h9l4 4v14H6z"/>',
  nachrichten: '<path d="M4 5h16v11H9l-5 4z"/>',
  textbausteine: '<path d="M5 6h14M5 12h14M5 18h9"/>',
  abgleich: '<path d="M20 8a8 8 0 00-14-2M4 4v4h4M4 16a8 8 0 0014 2M20 20v-4h-4"/>',
  sicherung: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  _: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>'
};
function navIcon(id) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (NAV_ICON[id] || NAV_ICON._) + '</svg>'; }
var navGroupOpen = { 'Finanzen': true }, navGroupInit = false;
function fillNavMenu() {
  var box = document.getElementById('nav-menu'); box.innerHTML = ''; var group = null;
  if (!navGroupInit) { navGroupInit = true; if (window.matchMedia('(orientation:landscape) and (max-height:600px) and (pointer:coarse)').matches) PRAXIS_NAV.forEach(function (g) { if (g[0] === '#') navGroupOpen[g[1]] = true; }); }   /* Handy quer: alle Kategorien gleich sichtbar */
  var cur = document.querySelector('.tab-content.active'), active = cur ? cur.id.replace(/^tab-/, '') : '';
  PRAXIS_NAV.forEach(function (x) {
    if (x === '-') return;
    if (x[0] === '#') {
      group = document.createElement('details'); group.className = 'nav-section';
      group.dataset.ni = box.querySelectorAll('.nav-section').length;
      var h = document.createElement('summary'); h.className = 'nav-group'; h.textContent = x[1]; group.appendChild(h);
      var title = x[1]; group.open = !!navGroupOpen[title];
      group.addEventListener('toggle', function () { navGroupOpen[title] = groupForTitle(title).open; });
      var items = document.createElement('div'); items.className = 'nav-items'; group.appendChild(items); group._items = items;
      box.appendChild(group); return;
    }
    var vb = x[0] && document.getElementById('btn-' + x[0]); if (vb && vb.classList.contains('nav-x') && vb.style.display !== 'none') return;
    var b = document.createElement('button'); b.type = 'button';
    b.innerHTML = navIcon(x[0]) + '<span></span>'; var lab = b.lastChild;
    if (x[0]) { lab.textContent = x[1]; b.onclick = function () { navGo(x[0]); }; if (x[0] === active) { b.setAttribute('aria-current','page'); if (group) group.open = true; } }
    else { b.disabled = true; lab.textContent = x[1] + ' (geplant)'; }
    (group ? group._items : box).appendChild(b);
  });
  function groupForTitle(title) { return [].filter.call(box.querySelectorAll('.nav-section'), function (g) { return g.firstElementChild.textContent === title; })[0] || {open:false}; }
  var vf = document.createElement('div'); vf.className = 'nav-ver'; vf.textContent = kaVersion(); box.appendChild(vf);
  navLayout();
}
/* Handy quer: Kategorien in unabhängigen Spalten. Jede Spalte stapelt für sich, freier Platz bleibt nur unten. Die Zuordnung zur Spalte ist fest (der Reihe nach), damit nichts springt. */
function navLayout() {
  var box = document.getElementById('nav-menu'); if (!box) return;
  var ver = box.querySelector('.nav-ver'), secs = [].slice.call(box.querySelectorAll('.nav-section')).sort(function (p, q) { return (+p.dataset.ni || 0) - (+q.dataset.ni || 0); });
  var old = box.querySelector('.nav-cols');
  var land = window.matchMedia('(orientation:landscape) and (max-height:600px) and (pointer:coarse)').matches;
  if (!land) { if (old) { secs.forEach(function (x) { box.insertBefore(x, ver); }); old.remove(); } return; }
  var n = Math.min(940, window.innerWidth - 16) >= 780 ? 3 : 2, wrap = document.createElement('div'), cols = [];
  wrap.className = 'nav-cols';
  for (var i = 0; i < n; i++) { var c = document.createElement('div'); c.className = 'nav-col'; cols.push(c); wrap.appendChild(c); }
  secs.forEach(function (x, k) { cols[k % n].appendChild(x); });
  if (old) old.remove();
  box.insertBefore(wrap, ver);
}
try { document.fonts.ready.then(navFit); } catch (x) {}
window.addEventListener('resize', navFit); window.addEventListener('orientationchange', navFit); window.addEventListener('load', navFit); setTimeout(navFit, 0);
var TAB_RENDER = { kalender: 'renderCal', start: 'renderHome', todos: 'renderTodos' };
PRAXIS_NAV.forEach(function (x) { if (x[0] && x[0] !== '#') TAB_RENDER[x[0]] = x[2]; });
/* Fehleranzeige: Meldet Fehler sichtbar, statt dass Knöpfe stillschweigend nichts tun */
function errBanner(msg) {
  var b = document.getElementById('err-bar');
  if (!b) { b = document.createElement('div'); b.id = 'err-bar'; b.style.cssText = 'position:fixed; left:8px; right:8px; bottom:8px; z-index:99; background:#7f1d1d; color:#fff; padding:10px 14px; border-radius:10px; font-size:13px; line-height:1.4;'; b.onclick = function () { b.style.display = 'none'; }; document.body.appendChild(b); }
  b.textContent = 'Fehler: ' + msg + ' (zum Schließen tippen)'; b.style.display = 'block';
}
/* Sofort sichtbare Hinweise (Maus und Stift, auch am Handy): zeigt den title-Text kleiner Symbol-Buttons ohne Verzögerung */
(function () {
  var tip = null, cur = null, tm = 0;
  function hide() { clearTimeout(tm); if (tip) tip.style.display = 'none'; if (cur && cur._tt) { cur.setAttribute('title', cur._tt); cur._tt = null; } cur = null; }
  document.addEventListener('pointerover', function (e) {
    if (e.pointerType === 'touch') return;
    var t = e.target.closest && e.target.closest('[title]'); if (!t || t === cur) return; hide();
    var txt = t.getAttribute('title'); if (!txt) return; cur = t; t._tt = txt; t.removeAttribute('title');
    tm = setTimeout(function () {
      if (!tip) { tip = document.createElement('div'); tip.style.cssText = 'position:fixed; z-index:99999; background:#0f172a; color:#fff; font:12px/1.3 system-ui,sans-serif; padding:5px 9px; border-radius:7px; pointer-events:none; box-shadow:0 4px 12px rgba(15,23,42,.3); max-width:260px;'; document.body.appendChild(tip); }
      tip.textContent = txt; tip.style.display = 'block'; var r = t.getBoundingClientRect();
      var l = Math.max(6, Math.min(r.left + r.width / 2 - tip.offsetWidth / 2, window.innerWidth - tip.offsetWidth - 6)), tp = r.bottom + 6; if (tp + tip.offsetHeight > window.innerHeight - 6) tp = r.top - tip.offsetHeight - 6;
      tip.style.left = l + 'px'; tip.style.top = tp + 'px';
    }, 80);
  });
  document.addEventListener('pointerout', function (e) { if (cur && !cur.contains(e.relatedTarget)) hide(); });
  document.addEventListener('click', hide, true); window.addEventListener('scroll', hide, true);
})();
window.addEventListener('error', function (ev) { errBanner((ev.message || 'unbekannt') + (ev.lineno ? ' [Zeile ' + ev.lineno + ']' : '')); });
window.addEventListener('unhandledrejection', function (ev) { errBanner(ev.reason && ev.reason.message ? ev.reason.message : 'Vorgang fehlgeschlagen'); });
function hdRun(fn, name) { try { fn(); } catch (x) { errBanner(name + ': ' + (x && x.message ? x.message : x)); } }
function toggleNavMenu(ev) {
  ev.stopPropagation(); var m = document.getElementById('nav-menu');
  if (m.style.display !== 'none') { m.style.display = 'none'; return; }
  fillNavMenu();
  var r = ev.currentTarget.getBoundingClientRect(); m.style.display = 'grid';
  m.style.top = (r.bottom + 4) + 'px'; m.style.maxHeight = Math.max(120, window.innerHeight - r.bottom - 12) + 'px'; m.scrollTop = 0; m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - m.offsetWidth - 8)) + 'px';
}
function navGo(id) { document.getElementById('nav-menu').style.display = 'none'; switchTab(id); }
/* Letzte Seite merken: nach dem Neuladen (z. B. Ziehen nach unten) geht es dort weiter, wo man war */
var lastTab = 'start', lastReady = false;
function saveLast() {
  if (!lastReady) return;
  try { kaSet('ka_last', JSON.stringify({ tab: lastTab, pid: (curP && document.getElementById('modal-akte').classList.contains('active')) ? curP.id : null, akTab: akTab, view: view, cur: iso(cur) })); } catch (x) {}
}
function restoreLast() {
  var l = null; try { l = JSON.parse(kaGet('ka_last')); } catch (x) {} lastReady = true; if (!l) return;
  try {
    if (l.view) view = l.view;
    if (l.cur) { var q = String(l.cur).split('-'); if (q.length === 3) cur = new Date(+q[0], +q[1] - 1, +q[2]); }
    if (l.tab && l.tab !== 'start' && document.getElementById('tab-' + l.tab)) switchTab(l.tab);
    if (l.pid) { var pt = patients.filter(function (x) { return x.id === l.pid; })[0]; if (pt) { viewAkte(pt); if (l.akTab) setAkTab(l.akTab); } }
    if (l.tab === 'kalender' || l.view) renderCal();
  } catch (x) {}
}
function switchTab(tabId) {
  lastTab = tabId;
  closeModal('modal-akte');
  var nm = document.getElementById('nav-menu'); if (nm) nm.style.display = 'none';
  var gr = document.getElementById('gs-res'); if (gr) gr.style.display = 'none';
  var rf = TAB_RENDER[tabId]; if (rf && typeof window[rf] === 'function') window[rf]();
  var c = document.querySelectorAll('.tab-content');
  for (var i = 0; i < c.length; i++) c[i].classList.remove('active');
  var b = document.querySelectorAll('.nav-btn');
  for (var j = 0; j < b.length; j++) b[j].classList.remove('active');
  document.getElementById('tab-' + tabId).classList.add('active');
  var nb = document.getElementById('btn-' + tabId); if (!nb || nb.style.display === 'none') nb = PRAXIS_TABS.indexOf(tabId) >= 0 ? document.getElementById('btn-praxis') : null; if (nb) nb.classList.add('active');
  if (tabId === 'start') histClean(); else histPush();
  saveLast();
}
function openModal(id) { var mo = document.getElementById(id); mo.dataset.dirty = ''; mo.classList.add('active'); syncLock(); histPush(); if (id === 'modal-akte') document.body.classList.add('akte-open'); }
var ausgaben = [], todos = [], entw = [];
try { var sen = JSON.parse(kaGet('ka_entw')); if (Array.isArray(sen)) entw = sen; } catch (x) {}
try { var sa = JSON.parse(kaGet('ka_ausgaben')); if (Array.isArray(sa)) ausgaben = sa; } catch (x) {}
try { var stt = JSON.parse(kaGet('ka_todos')); if (Array.isArray(stt)) todos = stt; } catch (x) {}
var patients = [];
/* Akademische Titel im Namen (z. B. „Alexander Dip. Ing“) gehören nicht in die Namensleiste, sondern als Notiz in die Akte */
var TITEL_RE = /^(Prof\.?|Dr\.?|med\.?|dent\.?|rer\.?|nat\.?|phil\.?|Dipl\.?(-\w+\.?)?|Dip\.?|Ing\.?|Mag\.?|MSc|BSc|M\.Sc\.|B\.Sc\.)$/i;
function splitTitel(p) {
  var ti = [], nm = (String(p.vorname || '') + ' ' + String(p.nachname || '')).split(/\s+/).filter(function (w) { if (w && TITEL_RE.test(w)) { ti.push(w); return false; } return !!w; });
  return { name: nm.join(' ') || nameKey(p), titel: ti.join(' ') };
}
/* Name ohne akademische Titel, klein geschrieben: zum Vergleichen von Namen aus Rechnungen und Formularen */
function nameNorm(t) { return String(t || '').split(/\s+/).filter(function (w) { return w && !TITEL_RE.test(w); }).join(' ').toLowerCase(); }
function noTitel(t) { return String(t || '').split(/\s+/).filter(function (w) { return w && !TITEL_RE.test(w); }).join(' '); }
try { var sp = JSON.parse(kaGet('ka_patients')); if (Array.isArray(sp)) patients = sp; } catch (x) {}
ensurePatients();
var lager = { produkte: [], chargen: [], verbrauch: [] };
try { var slg = JSON.parse(kaGet('ka_lager')); if (slg && Array.isArray(slg.produkte)) lager = { produkte: slg.produkte, chargen: Array.isArray(slg.chargen) ? slg.chargen : [], verbrauch: Array.isArray(slg.verbrauch) ? slg.verbrauch : [] }; } catch (x) {}
function persist() {
  FLC = null; setTimeout(function () { try { renderFlags(); } catch (x) {} }, 0);
  try {
    kaSet('ka_events', JSON.stringify(events));
    kaSet('ka_patients', JSON.stringify(patients));
    kaSet('ka_templates', JSON.stringify(templates));
    kaSet('ka_invoices', JSON.stringify(invoices));
    kaSet('ka_settings', JSON.stringify(settings));
    kaSet('ka_lager', JSON.stringify(lager));
    kaSet('ka_ausgaben', JSON.stringify(ausgaben));
    kaSet('ka_entw', JSON.stringify(entw));
    kaSet('ka_todos', JSON.stringify(todos));
  } catch (x) { alert('Der Speicher im Browser ist voll. Bitte große Dateien entfernen und eine Sicherung machen.'); }
  try { renderHome(); } catch (x) {}
  try { updateTodoBadge(); } catch (x) {}
  try { KS.touch(); } catch (x) {}
}
var pSort = 'desc', pKey = 'id';
