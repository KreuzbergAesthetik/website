/* ===== Hinweise an Patienten: offene To-Dos und Termine ohne Rechnung ===== */
var FLC = null, FLT = 0;
function flagsMap() {
  var now = Date.now(); if (FLC && now - FLT < 60000) return FLC;
  var byName = {}, m = { byId: {}, byName: byName }, cut = now - 180 * 86400000, inv = {}, invEv = {};
  patients.forEach(function (p) { byName[nameKey(p)] = p; m.byId[p.id] = { todos: [], unb: [] }; });
  todos.forEach(function (t) { if (!t.done && t.pid && m.byId[t.pid]) m.byId[t.pid].todos.push(t); });
  invoices.forEach(function (i) { if (i.eid) invEv[i.eid] = 1; if (i.pid) { inv[i.pid + '|' + i.date] = 1; if (i.leistung) inv[i.pid + '|' + i.leistung] = 1; } });
  events.forEach(function (e) {
    var p = eventPatient(e); if (!p || e.phase === 'Abgesagt' || e.keineRechnung || invEv[e.id] || inv[p.id + '|' + e.date]) return;
    var end = new Date(e.date + 'T' + e.time + ':00').getTime() + (+e.dur || 60) * 60000;
    if (end < now && end > cut) m.byId[p.id].unb.push(e);
  });
  var tdy = iso(new Date()), lim = iso(new Date(now + 14 * 86400000));
  var seen = {};
  events.filter(function (e) { return e.phase !== 'Abgesagt' && e.date >= tdy && e.date <= lim && eventPatient(e); })
    .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }).forEach(function (e) {
      var p = eventPatient(e); if (!p || seen[p.id]) return; seen[p.id] = 1;
      var ai = anamInfo(p); if (ai.state !== 'ok') m.byId[p.id].anam = { info: ai, e: e };
    });
  /* nächster gebuchter Termin; Erinnerung fällig, wenn er innerhalb von settings.remDays Tagen liegt und noch nicht erinnert wurde */
  var remLim = iso(new Date(now + (settings.remDays == null ? 2 : +settings.remDays) * 86400000));
  events.forEach(function (e) {
    var p = eventPatient(e); if (!p || e.phase === 'Abgesagt') return;
    var t = new Date(e.date + 'T' + e.time + ':00').getTime(); if (!(t >= now)) return;
    var q = m.byId[p.id]; if (!q.next || t < q.nextT) { q.next = e; q.nextT = t; }
  });
  Object.keys(m.byId).forEach(function (k) { var q = m.byId[k]; if (q.next && q.next.date <= remLim && !bestLast(patients.filter(function (x) { return String(x.id) === k; })[0] || {}, 'termin:' + q.next.id, 'sent')) q.rem = q.next; });
  /* Wiedervorstellung: ab dem empfohlenen Datum erinnern, solange kein zukünftiger Termin gebucht ist. */
  Object.keys(m.byId).forEach(function (k) {
    var q = m.byId[k], p = patients.filter(function (x) { return String(x.id) === k; })[0];
    if (p && p.wiedervorstellung && p.wiedervorstellung <= tdy && !q.next) q.wieder = p.wiedervorstellung;
  });
  Object.keys(m.byId).forEach(function (k) { m.byId[k].unb.sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }); });
  m.get = function (p) { return (p && m.byId[p.id]) || { todos: [], unb: [] }; };
  FLC = m; FLT = now; return m;
}
/* Anamnese muss mindestens einmal im Jahr bestätigt werden (neu ausgefüllt oder vor Ort bestätigt) */
function anamInfo(p) {
  var ts = Math.max(bestLast(p, 'anamnese', 'got'), bestLast(p, 'anamnese', 'vorOrt'));
  (p.dokumente || []).forEach(function (d) { if (d.sig && d.form === 'anamnese') ts = Math.max(ts, d.sig.ts || 0); });
  var due = ts + 365 * 86400000, left = Math.ceil((due - Date.now()) / 86400000);
  return { ts: ts, due: due, left: left, state: !ts ? 'fehlt' : left < 0 ? 'faellig' : left <= 30 ? 'bald' : 'ok' };
}
function anamText(ai) { return ai.state === 'fehlt' ? 'Anamnese fehlt' : ai.state === 'faellig' ? 'Anamnese älter als 1 Jahr' : 'Anamnese läuft in ' + ai.left + ' Tagen ab'; }
function anamConfirm(p) {
  bestAdd(p, 'anamnese', 'vorOrt'); p.log = p.log || []; p.log.push({ ts: Date.now(), type: 'notiz', text: 'Anamnese vor Ort bestätigt' });
  persist(); renderUnterlagen(); if (curP === p) { renderHead(); renderVerlauf(); }
}
function setWiedervorstellung(p, date) {
  var old = p.wiedervorstellung || '', v = String(date || '').trim();
  if (old === v) return;
  if (v) p.wiedervorstellung = v; else delete p.wiedervorstellung;
  auditOne(p, 'Behandlungsplanung', 'Empfohlene Wiedervorstellung', old ? fmtD(old) : '[nicht festgelegt]', v ? fmtD(v) : '[entfernt]');
  persist(); if (curP === p) { renderHead(); renderFlags(); } renderPatients();
}
function openWiedervorstellungTermin(p) {
  curP = p; openTermin(p.wiedervorstellung || iso(new Date()), '11:30', true);
}
function evFlag(e) { var m = flagsMap(), p = eventPatient(e); return p && m.get(p).todos.length ? '<span class="evfl" title="Offenes To-Do">!</span>' : ''; }
function flagPills(p, noTodo) {
  var f = flagsMap().get(p), out = [];
  if (f.todos.length && !noTodo) { var a = mk('span', 'fl fl-red', 'To-Do' + (f.todos.length > 1 ? ' ×' + f.todos.length : '')); a.title = f.todos.map(function (t) { return t.text; }).join('\n'); out.push(a); }
  if (f.unb.length) { var b = mk('span', 'fl fl-blue fl-ico'); b.innerHTML = tvSvg('euro'); b.title = 'Rechnung offen: vergangene Termine ohne Rechnung (' + f.unb.length + ')'; b.setAttribute('aria-label', 'Rechnung offen'); out.push(b); }
  if (f.anam) { var c = mk('span', 'fl fl-amb', 'Anamnese'); c.title = anamText(f.anam.info) + ' · Termin ' + fmtTermin(f.anam.e); out.push(c); }
  if (f.wieder) { var w = mk('span', 'fl fl-orange', 'Wiedervorstellung'); w.title = 'Wiedervorstellung fehlt · empfohlen ' + fmtD(f.wieder); out.push(w); }
  return out;
}
function flagItems(p) {
  var f = flagsMap().get(p), out = [];
  if (f.anam) out.push({ cls: 'fl-amb', label: anamText(f.anam.info), menu: [['Per E-Mail senden', function () { sendForm(p, ['anamnese'], 'mail', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, p)); }], ['Vor Ort bestätigt (heute)', function () { anamConfirm(p); }]] });
  if (f.wieder) out.push({ cls: 'fl-orange', label: 'Wiedervorstellung fehlt · empfohlen ' + fmtD(f.wieder), menu: [['Termin vereinbaren', function () { openWiedervorstellungTermin(p); }], ['Empfehlung entfernen', function () { setWiedervorstellung(p, ''); }]] });
  if (f.rem) {
    var re = f.rem, rtx = fillPlatzhalter('{AnredeInformell},\n\nich erinnere Dich an Deinen Termin am ' + fmtD(re.date) + ' um ' + re.time + ' Uhr bei Kreuzberg Ästhetik.\n\nSolltest Du den Termin nicht wahrnehmen können, gib mir bitte rechtzeitig Bescheid.\n\nManuel - Kreuzberg Ästhetik', p);
    var rmark = function () { bestAdd(p, 'termin:' + re.id, 'sent'); p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: 'Terminerinnerung gesendet für ' + fmtTermin(re) }]); persist(); if (curP === p) { renderVerlauf(); renderHead(); } };
    out.push({ cls: 'fl-orange', label: 'Terminerinnerung: ' + fmtTermin(re), menu: [['Per E-Mail senden', function () { rmark(); tvMail(p, '', ['Terminerinnerung', rtx]); }], ['Schon erinnert (vor Ort oder telefonisch)', rmark]] });
  }
  else if (f.next && f.next.date <= iso(new Date(Date.now() + (settings.remDays == null ? 2 : +settings.remDays) * 86400000)) && bestLast(p, 'termin:' + f.next.id, 'sent')) {
    var ue = f.next;
    out.push({ cls: 'fl-grey', label: 'Terminerinnerung gesendet: ' + fmtTermin(ue), menu: [['Rückgängig (als nicht gesendet markieren)', function () {
      p.best = (p.best || []).filter(function (b) { return !(b.k === 'termin:' + ue.id && b.art === 'sent'); });
      var tx = 'Terminerinnerung gesendet für ' + fmtTermin(ue), ix = -1; (p.log || []).forEach(function (l, i) { if (l.text === tx) ix = i; }); if (ix >= 0) p.log.splice(ix, 1);
      persist(); if (curP === p) { renderVerlauf(); renderHead(); } renderPatients();
    }]] });
  }
  var cutT = function (t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
  if (f.todos.length) out.push({ cls: 'fl-red', label: 'To-Dos', n: f.todos.length, subs: f.todos.map(function (t) { return { label: cutT(t.text, 70) + (t.due ? ' · fällig ' + fmtD(t.due) : ''), fn: function () { openTodo(t.id); } }; }) });
  if (f.unb.length) out.push({ cls: 'fl-blue', label: 'Rechnung offen', n: f.unb.length, subs: f.unb.map(function (e) {
    var d = e.date.split('-');
    return { label: d[2] + '.' + d[1] + '.' + d[0].slice(2), sub: e.behandlung || '', fn: function () { openInvoice(p); document.getElementById('inv-termin').value = String(e.id); invTerminChanged(); }, alt: ['Keine Rechnung nötig', function () { e.keineRechnung = true; persist(); if (curP === p) { renderFlags(); } renderPatients(); }] };
  }) });
  return out;
}
function flagBtn(it) {
  var b = mk('button', 'fl ' + it.cls, it.label); b.type = 'button';
  if (it.n) b.appendChild(mk('span', 'fl-n', String(it.n)));
  b.onclick = function (ev) { ev.stopPropagation(); if (it.subs) flagDrop(ev, it, b); else if (it.menu) tlMenu(ev, it.menu); else if (it.fn) { fpClose(); it.fn(); } };
  return b;
}
/* Einzelne Posten einer Hinweis-Kategorie erst nach dem Antippen im Auswahlfenster */
function flagDrop(ev, it, anchor) {
  ev.stopPropagation(); var m = document.getElementById('fl-drop');
  if (!m) { m = mk('div', 'a-menu'); m.id = 'fl-drop'; document.body.appendChild(m); }
  if (m.style.display === 'block' && m._src === anchor) { m.style.display = 'none'; return; }
  m._src = anchor; m.innerHTML = '';
  it.subs.forEach(function (sub) {
    var row = mk('div'); row.style.cssText = 'display:flex; align-items:center; gap:2px;';
    var b = mk('button', '', sub.label); b.type = 'button'; b.style.cssText = 'flex:1; width:auto;';
    if (sub.sub) { var sm = mk('small', '', ' · ' + sub.sub); sm.style.cssText = 'color:#94a3b8; font-size:12px;'; b.appendChild(sm); }
    b.onclick = function () { m.style.display = 'none'; fpClose(); sub.fn(); }; row.appendChild(b);
    if (sub.alt) { var x = mk('button', '', ''); x.type = 'button'; x.title = sub.alt[0]; x.setAttribute('aria-label', sub.alt[0]); x.innerHTML = tvSvg('ban'); x.firstChild.style.cssText = 'width:15px;height:15px;vertical-align:middle;'; x.style.cssText = 'flex:none; width:34px; padding:10px 0; text-align:center; color:#94a3b8;'; x.onclick = function () { m.style.display = 'none'; sub.alt[1](); }; row.appendChild(x); }
    m.appendChild(row);
  });
  var r = anchor.getBoundingClientRect(); m.style.position = 'fixed'; m.style.right = 'auto'; m.style.width = 'max-content'; m.style.maxWidth = 'calc(100vw - 16px)'; m.style.maxHeight = '60vh'; m.style.overflowY = 'auto'; m.style.zIndex = 80; m.style.display = 'block';
  m.style.left = Math.max(8, Math.min(r.left, window.innerWidth - m.offsetWidth - 8)) + 'px';
  var top = r.bottom + 4; if (top + m.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - m.offsetHeight - 4); m.style.top = top + 'px';
}
function renderFlags() {
  var card = document.getElementById('a-flagcard'), fb = document.getElementById('a-flagbtn'); if (!card) return;
  card.innerHTML = ''; fpClose();
  var items = curP ? flagItems(curP) : [];
  card.style.display = items.length ? '' : 'none';
  if (items.length) {
    card.appendChild(mk('span', 'a-fl-t', 'Offen:'));
    items.forEach(function (it) { card.appendChild(flagBtn(it)); });
  }
  fb.className = 'a-flagbtn ' + (items.some(function (i) { return i.cls === 'fl-red'; }) ? 'red' : 'amb'); fb.dataset.n = items.length;
  flagScroll();
}
function flagScroll() {
  var card = document.getElementById('a-flagcard'), fb = document.getElementById('a-flagbtn'); if (!card || !fb) return;
  var show = document.body.classList.contains('akte-open') && card.style.display !== 'none' && card.getBoundingClientRect().bottom < (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hdh'), 10) || 110) + 50;
  fb.style.display = show ? 'flex' : 'none'; if (!show) fpClose();
}
function fpClose() { var p = document.getElementById('a-flagpop'); if (p) p.style.display = 'none'; }
function fpToggle() {
  var pop = document.getElementById('a-flagpop'); if (pop.style.display === 'block') { fpClose(); return; }
  pop.innerHTML = ''; (curP ? flagItems(curP) : []).forEach(function (it) { pop.appendChild(flagBtn(it)); });
  pop.style.display = 'block';
}
window.addEventListener('scroll', function () { requestAnimationFrame(flagScroll); }, { passive: true });
document.addEventListener('click', function (ev) { if (!ev.target.closest('#a-flagpop, #a-flagbtn, #tl-menu')) fpClose(); });
function ensurePatients() {
  var m = 0;
  patients.forEach(function (p) { if (p.id > m) m = p.id; });
  patients.forEach(function (p) { if (!p.id) p.id = ++m; if (!p.erstellt) p.erstellt = Date.now(); });
  /* Patientennummer: frei änderbar, getrennt von der internen ID, an der Termine und Rechnungen hängen */
  var used = {}, mx = 0; patients.forEach(function (p) { if (p.nr > 0) { used[p.nr] = true; if (p.nr > mx) mx = p.nr; } });
  patients.forEach(function (p) { if (!(p.nr > 0)) { if (!used[p.id]) { p.nr = p.id; used[p.id] = true; if (p.id > mx) mx = p.id; } } });
  patients.forEach(function (p) { if (!(p.nr > 0)) p.nr = ++mx; });
  if (typeof settings === 'object' && settings && settings.titelMig && Array.isArray(events)) patients.forEach(function (p) {
    var v = noTitel(p.vorname), n = noTitel(p.nachname), k = nameKey(p);
    if ((v !== p.vorname || n !== p.nachname) && (v || n) && !events.some(function (e) { return eventBelongs(e, p); })) { if (!p.titel) p.titel = splitTitel(p).titel; p.vorname = v; p.nachname = n; }
  });
  patients.forEach(function (p) {
    /* Titel als eigenes Feld: aus dem Namen und aus Notizzeilen „Titel: …“ übernehmen, der Name bleibt unverändert */
    if (!p.titel) {
      var tt = splitTitel(p).titel, nz = String(p.notizen || '').split('\n'), keep = [];
      nz.forEach(function (l) { var m = /^Titel:\s*(.+)$/.exec(l.trim()); if (m) { if (!tt) tt = m[1].trim(); } else keep.push(l); });
      if (tt) { p.titel = tt; p.notizen = keep.join('\n').trim(); }
    }
  });
  patients.forEach(function (p) {
    /* alte Felder formSt und anamneseBest in das Protokoll p.best übernehmen */
    if (p.formSt) { Object.keys(p.formSt).forEach(function (k) { ['sent', 'got'].forEach(function (art) { if (p.formSt[k][art]) (p.best = p.best || []).push({ k: k, art: art, ts: p.formSt[k][art] }); }); }); delete p.formSt; }
    if (p.anamneseBest) { (p.best = p.best || []).push({ k: 'anamnese', art: 'vorOrt', ts: p.anamneseBest }); delete p.anamneseBest; }
  });
}
/* Einmalig: akademische Titel aus Vor- und Nachname lösen. Termine hängen über die Patienten-ID an der Akte; der lesbare Name im Termin wird mitgeändert.
   Die alten Namen merkt sich ka_bak_titel, damit sich die Umstellung rückgängig machen lässt. */
function titelMigration() {
  if (settings.titelMig) return;
  settings.titelMig = 1;
  var keys = {}, map = [], skipped = [];
  patients.forEach(function (p) { var k = nameKey(p); keys[k] = (keys[k] || 0) + 1; });
  patients.forEach(function (p) {
    var v = noTitel(p.vorname), n = noTitel(p.nachname);
    if ((v === p.vorname && n === p.nachname) || (!v && !n)) return;
    var old = nameKey(p), nk = v + ' ' + n;
    if (keys[nk]) { skipped.push(old); return; }
    if (!p.titel) p.titel = splitTitel(p).titel;
    map.push({ id: p.id, oldV: p.vorname, oldN: p.nachname, oldKey: old, newKey: nk });
    p.vorname = v; p.nachname = n; keys[old]--; keys[nk] = 1;
    events.forEach(function (e) { if (String(e.patientId) === String(p.id) || e.patient === old) { e.patientId = p.id; e.patient = nk; } });
  });
  try {
    if (map.length) kaSet('ka_bak_titel', JSON.stringify({ ts: Date.now(), map: map }));
    kaSet('ka_patients', JSON.stringify(patients)); kaSet('ka_events', JSON.stringify(events)); kaSet('ka_settings', JSON.stringify(settings));
  } catch (x) {}
  if (map.length || skipped.length) setTimeout(function () { alert('Titel aus den Namen gelöst: ' + map.length + ' Patient(en).' + (skipped.length ? '\n\nNicht geändert, weil der Name sonst doppelt vorkäme: ' + skipped.join(', ') : '') + '\n\nRückgängig machen: Praxis → Praxisdaten.'); }, 600);
}
async function titelRueckgaengig() {
  var b = null; try { b = JSON.parse(kaGet('ka_bak_titel') || 'null'); } catch (x) {}
  if (!b || !b.map || !b.map.length) { alert('Es gibt nichts rückgängig zu machen.'); return; }
  if (!await kaConfirm(b.map.length + ' Patient(en) bekommen ihren Titel wieder in den Namen. Fortfahren?')) return;
  b.map.forEach(function (m) {
    var p = patients.filter(function (x) { return x.id === m.id; })[0]; if (!p || nameKey(p) !== m.newKey) return;
    p.vorname = m.oldV; p.nachname = m.oldN;
    events.forEach(function (e) { if (String(e.patientId) === String(p.id) || e.patient === m.newKey) { e.patientId = p.id; e.patient = m.oldKey; } });
  });
  kaSet('ka_bak_titel', 'null'); persist(); renderPatients(); alert('Erledigt.');
}
function patNr(p) { return p.nr > 0 ? p.nr : p.id; }
async function changePatNr(p) {
  ensurePatients(); var old = p.nr, mx = 0; patients.forEach(function (q) { if (q.nr > mx) mx = q.nr; });
  var v = await kaPrompt('Neue Nummer für ' + p.vorname + ' ' + p.nachname + ' (jetzt #' + old + '):\nDie Nummern dazwischen rücken automatisch nach.', old);
  if (v === null) return; var n = parseInt(v, 10);
  if (!(n >= 1)) { alert('Bitte eine ganze Zahl ab 1 eingeben.'); return; }
  n = Math.min(n, mx); if (n === old) return;
  patients.forEach(function (q) { if (q === p) return; if (n < old && q.nr >= n && q.nr < old) q.nr++; else if (n > old && q.nr > old && q.nr <= n) q.nr--; });
  p.nr = n; persist(); renderPatients(); if (curP === p) renderHead();
}
function ageOf(dob) {
  var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec((dob || '').trim());
  if (!m) return '';
  var b = new Date(+m[3], +m[2] - 1, +m[1]), n = new Date();
  if (isNaN(b.getTime())) return '';
  var a = n.getFullYear() - b.getFullYear();
  if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
  return a >= 0 && a < 130 ? a : '';
}
function fmtDT(ts) {
  var d = new Date(ts);
  return WD[(d.getDay() + 6) % 7] + ', ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2) + ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}
function hasWarn(p) { var a = (p.allergien || '').trim().toLowerCase(); return a !== '' && a !== 'keine' && a !== '-' && a !== 'nein'; }
function setPSort(k) { pKey = k; pSort = (k === 'erstellt' || k === 'id') ? 'desc' : 'asc'; renderPatients(); }
function sortBy(k) { if (pKey === k) pSort = pSort === 'asc' ? 'desc' : 'asc'; else { pKey = k; pSort = (k === 'erstellt' || k === 'id') ? 'desc' : 'asc'; } renderPatients(); }
function togglePDir() { pSort = pSort === 'asc' ? 'desc' : 'asc'; renderPatients(); }
function dobNum(d) { var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(d || '').trim()); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : null; }
var ICON_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>';
var ICON_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 7 9-7"/></svg>';
function mk(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
function warnIcon(p) { var w = mk('span', 'warn', '!'); w.title = 'Allergie oder Unverträglichkeit hinterlegt'; return w; }
function sexIcon(p) { var sx = { Frau: ['♀', 'weiblich'], Herr: ['♂', 'männlich'], Divers: ['⚧', 'divers'] }[p.anrede]; if (!sx) return null; var sp = mk('span', 'a-sex', sx[0]); sp.title = sx[1]; return sp; }
/* Zeile mit Symbol (Telefon, E-Mail) in der Informationsspalte der Patientenliste */
function ptLn(box, ico, el) { var r = document.createElement('div'); r.className = 'pt-iln'; r.innerHTML = ico; r.appendChild(el); box.appendChild(r); }
function renderPatients() {
  ptApplyEr();
  ensurePatients();
  var tb = document.getElementById('patient-table'), dl = document.getElementById('t-patient-list');
  tb.innerHTML = ''; dl.innerHTML = '';
  [].forEach.call(document.querySelectorAll('.sarr'), function (e) { e.innerHTML = e.getAttribute('data-k') === pKey ? (pSort === 'asc' ? '&#9650;' : '&#9660;') : ''; });
  var q = (document.getElementById('p-filter').value || '').trim().toLowerCase().replace(/^#/, '#');
  var cmp = function (a, b) {
    var d;
    if (pKey === 'id') d = patNr(a) - patNr(b);
    else if (pKey === 'name') d = (String(a.nachname) + ' ' + String(a.vorname)).localeCompare(String(b.nachname) + ' ' + String(b.vorname), 'de', { sensitivity: 'base' });
    else if (pKey === 'dob') { var x = dobNum(a.dob), y = dobNum(b.dob); d = (x === null ? 1e9 : x) - (y === null ? 1e9 : y); }
    else d = (a.erstellt - b.erstellt) || (a.id - b.id);
    return pSort === 'desc' ? -d : d;
  };
  /* nächster (sonst letzter) Termin je Patient */
  var nowT = Date.now(), evMap = {};
  events.forEach(function (e) {
    if (e.phase === 'Abgesagt') return; var t = new Date(e.date + 'T' + e.time).getTime(); if (!t) return;
    var ep = eventPatient(e); if (!ep) return; var ek = String(ep.id), m = evMap[ek] = evMap[ek] || { next: null, last: null };
    if (t >= nowT) { if (!m.next || t < m.next.t) m.next = { t: t, e: e }; } else if (!m.last || t > m.last.t) m.last = { t: t, e: e };
  });
  var fmtS = function (t) { var d = new Date(t); return WD[(d.getDay() + 6) % 7] + ' ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + (d.getFullYear() === new Date().getFullYear() ? '' : String(d.getFullYear()).slice(2)) + (t >= nowT ? ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) : ''); };
  patients.slice().sort(cmp).forEach(function (p) {
    var o = document.createElement('option'); o.value = p.vorname + ' ' + p.nachname; dl.appendChild(o);
    if (q && (nameKey(p) + ' ' + p.nachname + ' ' + (p.phone || '') + ' ' + (p.dob || '') + ' #' + patNr(p)).toLowerCase().indexOf(q) < 0) return;
    var age = ageOf(p.dob), row = tb.insertRow(), c0 = row.insertCell(), c1 = row.insertCell(), c3 = row.insertCell();
    c1.style.cssText = 'max-width:0; width:100%; position:relative;';
    var nb0 = mk('button', 'pidb', '#' + patNr(p)); nb0.type = 'button'; nb0.title = 'Nummer ändern'; nb0.onclick = function () { changePatNr(p); }; c0.appendChild(nb0);
    var noT = function (t) { return String(t || '').split(/\s+/).filter(function (w) { return w && !TITEL_RE.test(w); }).join(' '); };
    var full = noT(p.nachname) + ', ' + noT(p.vorname);
    var nrow = mk('div', 'pn-row'), fl0 = flagsMap().get(p), dots = mk('span', 'pt-dots');
    var addDot = function (cls, t) { var d = mk('span', 'pt-dot ' + cls); d.title = t; d.setAttribute('aria-label', t); dots.appendChild(d); };
    if (fl0.todos.length) addDot('d-todo', 'Offene To-Dos: ' + fl0.todos.map(function (t) { return t.text; }).join(', '));
    if (fl0.unb.length) addDot('d-inv', 'Rechnung offen: vergangene Termine ohne Rechnung (' + fl0.unb.length + ')');
    if (fl0.anam) addDot('d-anam', anamText(fl0.anam.info));
    if (fl0.rem) addDot('d-rem', 'Terminerinnerung fällig: ' + fmtTermin(fl0.rem));
    if (fl0.next) addDot('d-next', 'Nächster Termin gebucht: ' + fmtTermin(fl0.next));
    var nb = mk('button', 'pn pn-nm'); nb.type = 'button'; nb.title = full + (p.titel ? ' (' + p.titel + ')' : ''); nb.onclick = function () { viewAkte(p); };
    var nl1 = mk('span', 'pn-l'); nl1.appendChild(document.createTextNode((noT(p.nachname) || '').toUpperCase() + ','));
    nb.appendChild(nl1); nb.appendChild(document.createTextNode(' ')); var nl2 = mk('span', 'pn-f', noT(p.vorname)); if (p.titel) nl2.appendChild(mk('small', 'pt-tit2', p.titel)); nb.appendChild(nl2); nrow.appendChild(nb);
    c1.appendChild(nrow);
    var sub = p.dob || '';
    var em = evMap[String(p.id)] || {};
    if (sub) { var dr = mk('div', 'pt-dr'); dr.appendChild(mk('span', 'pt-dob', sub)); c1.appendChild(dr); }
    var inv0 = em.last ? invoices.filter(function (i) { return i.eid === em.last.e.id || (i.pid === p.id && i.date === em.last.e.date); })[0] : null;
    if (em.last && inv0 && !(invState(inv0).full || inv0.sentAt)) { var yd = mk('span', 'pt-dot d-send'); yd.title = 'Rechnung erstellt, noch nicht versendet'; yd.setAttribute('aria-label', yd.title); dots.appendChild(yd); }
    if (!dots.childNodes.length) dots.appendChild(mk('span', 'pt-dot d-none'));
    c1.appendChild(dots);
    /* Schnellaktionen */
    var acts = mk('div', 'pt-acts');
    var popItems = [], ib = function (k, t, fn, lb) { popItems.push({ k: k, t: t, lb: lb || t, fn: fn }); };
    ib('cal', 'Termin anlegen', function () { curP = p; var n = new Date(); openTermin(iso(n), pad(n.getHours()) + ':' + pad(n.getMinutes()), true); document.getElementById('t-patient').value = nameKey(p); }, 'Termin');
    ib('book', 'Dokumentation hinzufügen', function () { viewAkte(p); openDkPick(null); }, 'Dokumentation');
    var fst = formStatus(p);
    ib('mail', 'Senden: E-Mail, Formulare' + (fst.t ? ' · ' + fst.t : ''), function (ev) {
      curP = p; var tx = fillPlatzhalter(ANAM_TXT, p);
      tlMenu(ev, [['E-Mail schreiben', function () { openMail(); }], ['Anamnese per E-Mail senden', function () { sendForm(p, ['anamnese'], 'mail', 'Anamnesebogen', tx); }]].concat(formMenuItems(p)));
    }, 'Senden');
    popItems[popItems.length - 1].cls = 'st-' + fst.s;
    ib('euro', 'Rechnung', function (ev) {
      curP = p; var it = [['Rechnung erstellen', function () { openInvoice(p); }], ['Kostenvoranschlag erstellen', function () { openInvoiceKind(p, 'kv'); }]];
      invoices.filter(function (i) { return i.pid === p.id && !i.kind && !(invState(i).full || i.sentAt); }).slice(0, 4).forEach(function (i) { it.push(['Rechnung ' + (i.nr || '') + ' ansehen und senden', function () { curP = p; viewInvoice(i.id); }]); });
      tlMenu(ev, it);
    }, 'Rechnung');
    ib('pill', 'Rezept erstellen', function () { curP = p; openRx(null); }, 'Rezept');
    ib('plus', 'Alle Aktionen', function (ev) { ptAMenu(ev, p); }, 'Alle Aktionen');
    var more = mk('button', 'pt-ib ib-more'); more.type = 'button'; more.title = 'Aktionen'; more.setAttribute('aria-label', 'Aktionen für ' + full); more.setAttribute('aria-haspopup', 'true');
    more.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
    more.onclick = function (ev) { ev.stopPropagation(); ptPop(more, popItems); };
    /* Mit der Maus: Beim Überfahren der Zeile erscheinen die Aktionen direkt als Knopfreihe */
    var quick = mk('div', 'pt-quick');
    popItems.forEach(function (it) { var qb = mk('button', 'pt-ib ib-' + it.k + (it.cls ? ' ' + it.cls : '')); qb.type = 'button'; qb.title = it.lb; qb.setAttribute('aria-label', it.lb); qb.innerHTML = tvSvg(it.k); qb.onclick = function (ev) { ev.stopPropagation(); it.fn(ev); }; quick.appendChild(qb); });
    acts.appendChild(quick);
    acts.appendChild(more);
    var wrap = mk('div', 'pt-wrap'), left = mk('div', 'pt-l');
    [].slice.call(c1.children).forEach(function (n) { if (n !== dots) left.appendChild(n); });
    /* Querformat: Hinweise als Punkte in eigener Spalte (der Strich ist dort durchgehend blau) */
    var hintc = mk('div', 'pt-hintc'); [].forEach.call(dots.children, function (d) { if (!d.classList.contains('d-none')) hintc.appendChild(d.cloneNode(true)); });
    var info = mk('div', 'pt-info'), i1 = mk('div', 'pt-i1'), i2 = mk('div', 'pt-i2'), cut = function (t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
    if (String(p.allergien || '').trim()) { var al = mk('span', 'pt-chip', 'Allergie: ' + cut(p.allergien, 30)); al.title = 'Allergie: ' + p.allergien; i1.appendChild(al); }
    if (p.phone) { var pa = mk('a', '', p.phone); pa.href = 'tel:' + String(p.phone).replace(/\s/g, ''); pa.onclick = function (e) { e.stopPropagation(); }; pa.style.cssText = 'color:#5b6f95; text-decoration:none;'; ptLn(i2, ICON_PHONE, pa); }
    if (p.email) { var ea = mk('a', '', p.email); ea.href = 'mailto:' + p.email; ea.onclick = function (e) { e.stopPropagation(); }; ea.style.cssText = 'color:#5b6f95; text-decoration:none; overflow:hidden; text-overflow:ellipsis;'; ptLn(i2, ICON_MAIL, ea); }
    info.appendChild(i1); info.appendChild(i2);
    var dobc = mk('div', 'pt-dobc', p.dob || ''), rz = mk('div', 'pt-rz');
    /* Größere Klickfläche: Name, Geburtsdatum und Hinweise öffnen die Akte; rechts (Informationen, Aktionen) erscheinen beim Überfahren die Schnellaktionen */
    [left, dobc, hintc].forEach(function (z) { z.classList.add('pt-hit'); z.onclick = function (ev) { if (ev.target.closest('a, button')) return; viewAkte(p); }; });
    rz.appendChild(info); rz.appendChild(acts);
    wrap.appendChild(left); wrap.appendChild(dobc); wrap.appendChild(hintc); wrap.appendChild(rz); c1.appendChild(wrap);
    c3.textContent = fmtDT(p.erstellt); c3.className = 'pc-er';
  });
  if (!tb.rows.length) { var er = tb.insertRow(), ec = er.insertCell(); ec.colSpan = 3; ec.textContent = q ? 'Kein Patient gefunden' : 'Noch keine Patienten angelegt'; ec.style.color = '#94a3b8'; }
}
var hasEntry = false, silentPop = false;
function anyOverlay() { return !!document.querySelector('.modal-overlay.active, .akte-page.active') || !document.getElementById('tab-start').classList.contains('active'); }
function histPush() { if (!hasEntry) { try { history.pushState({ ka: 1 }, ''); hasEntry = true; } catch (x) {} } }
function histClean() { setTimeout(function () { if (hasEntry && !anyOverlay()) { silentPop = true; hasEntry = false; history.back(); } }, 60); }
window.addEventListener('popstate', function () {
  if (silentPop) { silentPop = false; return; }
  hasEntry = false;
  var open = [].slice.call(document.querySelectorAll('.modal-overlay.active'));
  if (open.length) { var top = open[open.length - 1]; if (top.id === 'modal-termin') closeTermin(); else closeModal(top.id); }
  else if (document.getElementById('modal-akte').classList.contains('active')) closeModal('modal-akte');
  else if (!document.getElementById('tab-start').classList.contains('active')) { switchTab('start'); return; }
  if (anyOverlay()) histPush();
});
function syncLock() { document.body.style.overflow = document.querySelector('.modal-overlay.active') ? 'hidden' : ''; }
function closeModal(id) { document.getElementById(id).classList.remove('active'); syncLock(); histClean(); if (id === 'modal-akte') { document.body.classList.remove('akte-open'); window.scrollTo(0, 0); saveLast(); } }

