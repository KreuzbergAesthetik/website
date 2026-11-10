/* ===== Globale Suche im Kopfbereich ===== */
var gsScope = { kal: true, pat: true, rec: true };
/* Die drei Knöpfe im Header legen Neues an */
function ptApplyEr() { var t = document.getElementById('tab-patienten'), b = document.getElementById('pt-er-btn'), on = !!settings.ptShowEr; if (t) t.classList.toggle('pt-shower', on); if (b) b.style.background = on ? '#dbeafe' : ''; }
function ptToggleEr() { settings.ptShowEr = !settings.ptShowEr; persist(); ptApplyEr(); }
function gsToggle(force) {
  var bar = document.getElementById('gs-bar'), inp = document.getElementById('gs-in'), res = document.getElementById('gs-res'), f = document.getElementById('gs-fab');
  /* Die Suchleiste ist immer sichtbar; auf/zu betrifft nur Eingabe und Trefferliste */
  var open = typeof force === 'boolean' ? force : res.style.display !== 'block';
  bar.style.display = 'flex'; f.classList.toggle('on', open);
  if (open && bar.classList.contains('zu')) { gsCollapse(false); return; }
  if (open) { inp.focus(); gsRun(true); } else { inp.value = ''; res.style.display = 'none'; inp.blur(); }
}
/* Suchleiste ein- und ausklappen: eingeklappt bleibt nur die Lupe; die Wahl merkt sich das Gerät */
function gsCollapse(force) {
  var bar = document.getElementById('gs-bar'), inp = document.getElementById('gs-in'), lupe = document.getElementById('gs-lupe'), res = document.getElementById('gs-res');
  var zu = typeof force === 'boolean' ? force : !bar.classList.contains('zu');
  bar.classList.toggle('zu', zu); lupe.setAttribute('aria-expanded', zu ? 'false' : 'true'); lupe.title = zu ? 'Suche aufklappen' : 'Suche einklappen';
  gsMenu(false);
  if (zu) { inp.value = ''; res.style.display = 'none'; inp.blur(); } else { inp.focus(); gsRun(true); }
  try { localStorage.setItem('ka_gs_zu', zu ? '1' : '0'); } catch (x) {}
}
/* Pop-up über dem Plus-Knopf: Termin, Patient, Rechnung */
function gsMenu(force) {
  var m = document.getElementById('gs-menu'), p = document.getElementById('gs-plus'); if (!m || !p) return;
  var on = typeof force === 'boolean' ? force : !m.classList.contains('on');
  m.classList.toggle('on', on); p.classList.toggle('on', on); p.setAttribute('aria-expanded', on ? 'true' : 'false');
  if (on) { var r = document.getElementById('gs-res'); if (r) r.style.display = 'none'; }
}
document.addEventListener('click', function (ev) { if (!ev.target.closest('#gs-menu') && !ev.target.closest('#gs-plus')) gsMenu(false); });
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') gsMenu(false); });
try { if (localStorage.getItem('ka_gs_zu') === '1') gsCollapse(true); } catch (x) {}
function hdAdd(k) {
  gsMenu(false);
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
/* Patientenliste: Die drei Punkte öffnen ein Pop-up mit den Aktionen (wie das Plus-Menü der unteren Leiste) */
function ptPop(btn, items) {
  var m = document.getElementById('pt-pop');
  if (!m) { m = mk('div', 'pt-pop'); m.id = 'pt-pop'; m.setAttribute('role', 'menu'); document.body.appendChild(m); }
  if (m.classList.contains('on') && m._src === btn) { m.classList.remove('on'); return; }
  m._src = btn; m.innerHTML = '';
  items.forEach(function (it) {
    var b = mk('button', 'pt-pop-i ib-' + it.k + (it.cls ? ' ' + it.cls : '')); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.title = it.t;
    b.innerHTML = tvSvg(it.k) + '<span>' + esc(it.lb) + '</span>';
    b.onclick = function (ev) { ev.stopPropagation(); m.classList.remove('on'); it.fn({ currentTarget: btn, target: btn, stopPropagation: function () {}, preventDefault: function () {} }); };
    m.appendChild(b);
  });
  m.classList.add('on');
  var r = btn.getBoundingClientRect(), mh = m.offsetHeight, mw = m.offsetWidth;
  m.style.left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8)) + 'px';
  var top = r.bottom + 6; if (top + mh > window.innerHeight - 8) top = Math.max(8, r.top - mh - 6);
  m.style.top = top + 'px';
}
document.addEventListener('click', function (ev) { var m = document.getElementById('pt-pop'); if (m && m.classList.contains('on') && !ev.target.closest('#pt-pop')) m.classList.remove('on'); });
document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') { var m = document.getElementById('pt-pop'); if (m) m.classList.remove('on'); } });
window.addEventListener('scroll', function () { var m = document.getElementById('pt-pop'); if (m) m.classList.remove('on'); }, true);
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
  var found = 0, sect = function (titel) { var h = mk('div', 'gs-h', titel); box.appendChild(h); found++; };
  /* Patienten: Name, Nummer, Geburtsdatum, Telefon, E-Mail, Anschrift, Formular-Code, Allergien */
  var ps = patients.filter(function (p) { return has(nameKey(p), p.nachname + ' ' + p.vorname, p.nachname + ', ' + p.vorname, p.phone, p.email, p.dob, '#' + patNr(p), p.adresse, p.code, p.allergien); });
  ps.sort(function (a, b) { var sa = nameKey(a).toLowerCase().indexOf(q) === 0 || (a.nachname || '').toLowerCase().indexOf(q) === 0 ? 0 : 1, sb = nameKey(b).toLowerCase().indexOf(q) === 0 || (b.nachname || '').toLowerCase().indexOf(q) === 0 ? 0 : 1; return sa - sb || (a.nachname || '').localeCompare(b.nachname || '', 'de'); });
  if (ps.length) { sect('Patienten'); ps.slice(0, 6).forEach(function (p) { gsPatRow(box, p); }); }
  /* Rechnungen: Nummer, Name, Betrag, Positionen */
  var ivs = invoices.filter(function (i) { return has(i.nr, i.name, nf(+i.total || 0), String(i.total), i.stornoFor, (i.items || []).map(function (x) { return x.text; }).join(' ')); });
  ivs.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
  if (ivs.length) { sect('Rechnungen'); ivs.slice(0, 5).forEach(function (i) { gsRow(box, (i.nr || (DRAFT[i.kind] ? DRAFT[i.kind].name : 'Entwurf')) + '  ' + (i.name || ''), fmtD(i.date) + ' · ' + nf(+i.total || 0) + ' €', function () { viewInvoice(i.id); }); }); }
  /* Termine: Behandlung, Patient, Datum */
  var evs = events.filter(function (e) { return has(e.behandlung, e.patient, e.date, fmtD(e.date), e.phase, e.status); });
  var tdy = iso(new Date());
  evs.sort(function (a, b) { var fa = a.date >= tdy ? 0 : 1, fb = b.date >= tdy ? 0 : 1; return fa - fb || (fa === 0 ? String(a.date + a.time).localeCompare(b.date + b.time) : String(b.date + b.time).localeCompare(a.date + a.time)); });
  if (evs.length) { sect('Termine'); evs.slice(0, 5).forEach(function (e) { gsRow(box, (e.patient || '') + (e.behandlung ? ' · ' + e.behandlung : ''), fmtD(e.date) + ' ' + (e.time || ''), function () { showInCal(e); }); }); }
  /* To-Dos */
  var tds = todos.filter(function (t) { return has(t.text); });
  if (tds.length) { sect('To-Dos'); tds.slice(0, 4).forEach(function (t) { gsRow(box, t.text, t.done ? 'erledigt' : (t.due ? 'fällig ' + fmtD(t.due) : ''), function () { openTodo(t.id); }); }); }
  /* Lager: Produkt oder Charge */
  var prs = lager.produkte.filter(function (pr) { return has(pr.name, lager.chargen.filter(function (c) { return c.pid === pr.id; }).map(function (c) { return c.nr; }).join(' ')); });
  if (prs.length) { sect('Lager'); prs.slice(0, 4).forEach(function (pr) { gsRow(box, pr.name, qty(bestand(pr.id)) + ' ' + (pr.einheit || '') + ' vorhanden', function () { openProdukt(pr.id); }); }); }
  /* Anlagen: Dateinamen der Akten */
  var fl = [];
  patients.forEach(function (p) { (p.dokumente || []).concat(p.bilder || []).forEach(function (f) { if (f && !f.hiddenFromView && has(f.name)) fl.push({ p: p, f: f }); }); });
  if (fl.length) { sect('Anlagen'); fl.slice(0, 4).forEach(function (x) { gsRow(box, x.f.name, dnP(x.p), function () { lastSearchAdd(x.p.id); viewAkte(x.p); setTimeout(function () { try { setAkTab('anl'); } catch (e) {} }, 60); }); }); }
  /* Leistungen: Name oder GOÄ-Nummer */
  var ks = (settings.katalog || []).map(function (k, i) { return { k: k, i: i }; }).filter(function (x) { return has(x.k.name, x.k.goae, (x.k.goaePos || []).map(function (g) { return g.nr; }).join(' ')); });
  if (ks.length) { sect('Leistungen'); ks.slice(0, 4).forEach(function (x) { gsRow(box, x.k.name, nf(+x.k.price || 0) + ' €', function () { openLeist(x.i); }); }); }
  if (!found) box.appendChild(mk('div', 'hm-empty', 'Nichts gefunden'));
  box.style.display = 'block';
}

