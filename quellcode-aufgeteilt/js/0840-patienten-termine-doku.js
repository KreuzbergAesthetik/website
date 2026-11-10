/* ===== Patienten, Termine, Doku ===== */
var curP = null, stammEdit = false, editingDokuId = null, medInput = false, medMode = false, notizEdit = false, dokPick = false;
var ICON_PEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>';
var ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
/* Anschrift in vier Feldern: Straße, Hausnummer, PLZ, Ort. Gespeichert wird weiter als Text „Straße Nr“ und „PLZ Ort“ in zwei Zeilen. */
function addrParse(t) {
  var ls = String(t || '').split(/\r?\n/).map(function (x) { return x.trim(); }).filter(Boolean), o = { str: '', nr: '', plz: '', ort: '' };
  if (ls[0]) { var m = /^(.*?\S)\s+(\d+\s?[A-Za-z]?(?:\s?[-\/]\s?\d+\s?[A-Za-z]?)?)$/.exec(ls[0]); if (m) { o.str = m[1]; o.nr = m[2]; } else o.str = ls[0]; }
  if (ls[1]) { var z = /^(\d{4,5})\s+(.+)$/.exec(ls[1]); if (z) { o.plz = z[1]; o.ort = z[2]; } else o.ort = ls[1]; }
  if (ls.length > 2) o.ort = (o.ort + ' ' + ls.slice(2).join(' ')).trim();
  return o;
}
function addrJoin(o) { return [((o.str || '').trim() + ' ' + (o.nr || '').trim()).trim(), ((o.plz || '').trim() + ' ' + (o.ort || '').trim()).trim()].filter(Boolean).join('\n'); }
function addrBlock(pre, text) {
  var o = addrParse(text), box = document.createElement('div'); box.className = 'addr-block';
  [['str', 'Straße', o.str, 'street-address'], ['nr', 'Hausnr.', o.nr, ''], ['plz', 'PLZ', o.plz, 'postal-code'], ['ort', 'Ort', o.ort, 'address-level2']].forEach(function (f) {
    var i = document.createElement('input'); i.type = 'text'; i.className = 'form-control addr-' + f[0]; i.id = pre + f[0]; i.placeholder = f[1]; i.setAttribute('aria-label', f[1]); i.value = f[2];
    if (f[0] === 'plz') i.inputMode = 'numeric'; box.appendChild(i);
  });
  return box;
}
function addrRead(pre) { var v = function (k) { return document.getElementById(pre + k).value; }; return addrJoin({ str: v('str'), nr: v('nr'), plz: v('plz'), ort: v('ort') }); }
var HEAD_FIELDS = [['anrede','Anrede'],['titel','Titel'],['vorname','Vorname'],['nachname','Nachname'],['dob','Geburtsdatum'],['phone','Telefon'],['email','E-Mail'],['adresse','Anschrift'],['allergien','Allergien'],['diagnosen','Erkrankungen / Diagnosen'],['honorarVom','Honorarvereinbarung vom']];
var templates = [];
try { var stp = JSON.parse(kaGet('ka_templates')); if (Array.isArray(stp)) templates = stp; } catch (x) {}
function maskDob(el) {
  var d = el.value.replace(/\D/g, '').slice(0, 8), o = d.slice(0, 2);
  if (d.length > 2) o += '.' + d.slice(2, 4);
  if (d.length > 4) o += '.' + d.slice(4);
  el.value = o;
}
function validDob(v) {
  if (!v) return true;
  var m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v); if (!m) return false;
  var dd = +m[1], mm = +m[2], yy = +m[3], dt = new Date(yy, mm - 1, dd);
  return yy >= 1900 && dt.getFullYear() === yy && dt.getMonth() === mm - 1 && dt.getDate() === dd && dt <= new Date();
}
var DOB_MSG = 'Bitte das Geburtsdatum im Format TT.MM.JJJJ eingeben, z.B. 23.09.1978.';
function nameKey(p) { return p.vorname + ' ' + p.nachname; }
function patById(id) { return patients.filter(function (p) { return String(p.id) === String(id); })[0] || null; }
function eventPatient(e) {
  if (!e) return null;
  var p = e.patientId != null ? patById(e.patientId) : null;
  if (p) return p;
  var hit = patients.filter(function (x) { return nameKey(x) === e.patient; });
  return hit.length === 1 ? hit[0] : null;
}
function eventBelongs(e, p) {
  if (!e || !p) return false;
  if (e.patientId != null) return String(e.patientId) === String(p.id);
  return e.patient === nameKey(p);
}
function eventPatientName(e) { var p = eventPatient(e); return p ? nameKey(p) : String(e && e.patient || ''); }
/* Anzeige: Nachname, Vorname. Beziehungen laufen intern über die Patienten-ID; der Name im Termin bleibt nur als lesbarer Fallback erhalten. */
function dnP(p) { return (noTitel(p.nachname) || p.nachname || '').toUpperCase() + ', ' + (noTitel(p.vorname) || p.vorname || ''); }
function eventPatientDisplay(e) { var p = eventPatient(e); return p ? dnP(p) : dnS(e && e.patient); }
/* Interne Namensanzeige: NACHNAME, Vorname mit fettem Nachnamen */
function nmHtml(t) { t = String(t || ''); var k = t.indexOf(', '); return k < 0 ? esc(t) : '<b>' + esc(t.slice(0, k)) + '</b>' + esc(t.slice(k)); }
function nmEl(t) { var e = document.createElement('span'); e.innerHTML = nmHtml(t); return e; }
function invNm(i) {
  var p = i.pid ? patients.filter(function (x) { return x.id === i.pid; })[0] : null; if (p) return dnP(p);
  var w = String(i.name || '').replace(/^(Frau|Herr|Divers)\s+/, '').trim().split(/\s+/); if (w.length < 2) return w.join(' ');
  var n = w.pop(); return n.toUpperCase() + ', ' + (noTitel(w.join(' ')) || w.join(' '));
}
function dnS(n) { var p = patients.filter(function (x) { return nameKey(x) === n; })[0]; return p ? dnP(p) : n; }
function migrateEventPatientIds() {
  if (!Array.isArray(events) || !events.length) return;
  var changed = false;
  events.forEach(function (e) {
    var p = e.patientId != null ? patById(e.patientId) : null;
    if (!p && e.patient) { var hit = patients.filter(function (x) { return nameKey(x) === e.patient; }); if (hit.length === 1) p = hit[0]; }
    if (!p) return;
    if (String(e.patientId) !== String(p.id)) { e.patientId = p.id; changed = true; }
    var n = nameKey(p); if (e.patient !== n) { e.patient = n; changed = true; }
  });
  if (!changed) return;
  try {
    kaSet('ka_events', JSON.stringify(events));
    var b = JSON.parse(kaGet('ka_sync_base') || 'null'); if (b) { b.dirty = true; kaSet('ka_sync_base', JSON.stringify(b)); }
  } catch (x) {}
}
migrateEventPatientIds();
function newId() { return Date.now() + '-' + Math.random().toString(36).slice(2, 7); }
function tsOf(x) { return x.ts || parseInt(String(x.id || '0').split('-')[0], 10) || 0; }
