/* ===== Globale Suche im Kopfbereich ===== */
var gsScope = { kal: true, pat: true, rec: true };
/* Die drei Knöpfe im Header legen Neues an */
function ptApplyEr() { var t = document.getElementById('tab-patienten'), b = document.getElementById('pt-er-btn'), on = !!settings.ptShowEr; if (t) t.classList.toggle('pt-shower', on); if (b) b.style.background = on ? '#dbeafe' : ''; }
function ptToggleEr() { settings.ptShowEr = !settings.ptShowEr; persist(); ptApplyEr(); }
function gsToggle(force) {
  var bar = document.getElementById('gs-bar'), inp = document.getElementById('gs-in'), res = document.getElementById('gs-res'), f = document.getElementById('gs-fab');
  var open = typeof force === 'boolean' ? force : bar.style.display !== 'flex';
  bar.style.display = open ? 'flex' : 'none'; f.classList.toggle('on', open);
  if (open) { inp.focus(); gsRun(true); } else { inp.value = ''; res.style.display = 'none'; inp.blur(); }
}
function hdAdd(k) {
  /* In der Patientenakte sind Termin und Rechnung für diesen Patienten vorausgefüllt */
  if (document.body.classList.contains('akte-open') && curP && (k === 'termin' || k === 'rec')) { aAct(k === 'termin' ? 'termin' : 'rechnung'); return; }
  /* Die Knöpfe im Header gehören zu keiner Seite: immer eine frische, leere Maske */
  if (k === 'termin') openTermin(); else if (k === 'pat') { ['p-anrede', 'p-vorname', 'p-nachname', 'p-dob', 'p-phone', 'p-email', 'p-allergien', 'p-notizen', 'p-adr-str', 'p-adr-nr', 'p-adr-plz', 'p-adr-ort'].forEach(function (id) { var e = document.getElementById(id); if (e) e.value = ''; }); openModal('modal-patient'); }
  else if (k === 'rec') openInvoice(null);
}
function recentAdd(id) { try { var l = JSON.parse(kaGet('ka_recent') || '[]').filter(function (x) { return x !== id; }); l.unshift(id); kaSet('ka_recent', JSON.stringify(l.slice(0, 12))); } catch (x) {} }
/* Suche: nur Patienten, die letzten fünf Treffer merkt sich die App */
function lastSearch() { try { var l = JSON.parse(kaGet('ka_lastsearch') || '[]'); return Array.isArray(l) ? l : []; } catch (x) { return []; } }
function lastSearchAdd(id) { try { var l = lastSearch().filter(function (x) { return x !== id; }); l.unshift(id); kaSet('ka_lastsearch', JSON.stringify(l.slice(0, 5))); } catch (x) {} }
/* Aktionsmenü wie in der Patientenakte, direkt aus der Patientenübersicht */
function ptAMenu(ev, p) {
  var btn = ev.currentTarget, m = document.getElementById('pt-amenu');
  if (!m) { m = mk('div', 'a-menu'); m.id = 'pt-amenu'; document.body.appendChild(m); }
  if (m.style.display === 'block' && m._src === btn) { m.style.display = 'none'; return; }
  m._src = btn; m.innerHTML = '';
  AM_GROUPS.forEach(function (g, ci) {
    var h = mk('div', 'am-h', g.t); m.appendChild(h);
    var gr = mk('div', 'am-grid');
    g.items.forEach(function (it) {
      var t = mk('button', 'am-tile c' + ci); t.type = 'button'; t.innerHTML = tvSvg(it[1]) + '<span>' + it[2] + '</span>';
      t.onclick = function () { m.style.display = 'none'; viewAkte(p); setTimeout(function () { aAct(it[0]); }, 80); }; gr.appendChild(t);
    });
    m.appendChild(gr);
  });
  var r = btn.getBoundingClientRect(); m.style.position = 'fixed'; m.style.right = 'auto'; m.style.width = 'min(372px, calc(100vw - 16px))'; m.style.maxHeight = '70vh'; m.style.overflowY = 'auto'; m.style.display = 'block';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth, window.innerWidth - m.offsetWidth - 8)) + 'px';
  var top = r.bottom + 4; if (top + m.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - m.offsetHeight - 4);
  m.style.top = top + 'px'; m.style.zIndex = 45;
}
function gsPatRow(box, p) { gsRow(box, '#' + patNr(p) + '  ' + dnP(p), p.dob || p.phone || '', function () { lastSearchAdd(p.id); viewAkte(p); }); var r = box.lastChild; if (r) flagPills(p).forEach(function (x) { r.insertBefore(x, r.querySelector('small')); }); }
function gsRow(res, title, sub, fn) {
  var b = mk('button', 'gs-r'); b.type = 'button'; b.appendChild(document.createTextNode(title)); if (sub) b.appendChild(mk('small', '', sub));
  b.onclick = function () { gsToggle(false); fn(); }; res.appendChild(b);
}
function gsRun(hint) {
  var q = document.getElementById('gs-in').value.trim().toLowerCase(), box = document.getElementById('gs-res'); box.innerHTML = '';
  if (!q) {
    var ps0 = lastSearch().map(function (id) { return patients.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
    if (hint === true && ps0.length) { box.appendChild(mk('div', 'gs-h', 'Zuletzt gesucht')); ps0.forEach(function (p) { gsPatRow(box, p); }); box.style.display = 'block'; } else box.style.display = 'none';
    return;
  }
  var has = function () { for (var i = 0; i < arguments.length; i++) if (String(arguments[i] == null ? '' : arguments[i]).toLowerCase().indexOf(q) >= 0) return true; return false; };
  var ps = patients.filter(function (p) { return has(nameKey(p), p.nachname + ' ' + p.vorname, p.nachname + ', ' + p.vorname, p.phone, p.email, p.dob, '#' + patNr(p)); });
  ps.sort(function (a, b) { var sa = nameKey(a).toLowerCase().indexOf(q) === 0 || (a.nachname || '').toLowerCase().indexOf(q) === 0 ? 0 : 1, sb = nameKey(b).toLowerCase().indexOf(q) === 0 || (b.nachname || '').toLowerCase().indexOf(q) === 0 ? 0 : 1; return sa - sb || (a.nachname || '').localeCompare(b.nachname || '', 'de'); });
  ps.slice(0, 8).forEach(function (p) { gsPatRow(box, p); });
  if (!ps.length) box.appendChild(mk('div', 'hm-empty', 'Kein Patient gefunden'));
  box.style.display = 'block';
}

