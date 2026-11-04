/* ===== Nachrichtenvorlagen und Textbausteine ===== */
var nvIdx = -1, txIdx = -1;
function simpleList(boxId, list, fn, sub, sorted) {
  var box = document.getElementById(boxId); if (!box) return; box.innerHTML = '';
  var ord = list.map(function (x, i) { return i; }); if (sorted) ord.sort(function (a, b) { return String(list[a].name).localeCompare(String(list[b].name), 'de', { sensitivity: 'base', numeric: true }); });
  ord.forEach(function (i) { var x = list[i]; box.appendChild(hmRow(null, x.name, sub(x), function () { fn(i); })); });
  if (!list.length) box.appendChild(mk('div', 'hm-empty', 'Noch nichts angelegt.'));
}
var NV_STD = [
  { name: 'Kostenvoranschlag (E-Mail)', betreff: 'Ihr Kostenvoranschlag', text: '{AnredeFormell},\n\nAnbei finden Sie Ihren Kostenvoranschlag von {DatumWochentag}.' },
  { name: 'Geburtstagsnachricht', betreff: 'Alles Gute zum Geburtstag', text: '{AnredeInformell},\n\nAlles Gute zu Deinem Geburtstag!\n\nIch hoffe, wir sehen uns bald wieder,\nManuel von Kreuzberg Ästhetik' },
  { name: 'Bestätigung Terminabsage (E-Mail)', betreff: 'Bestätigung Deiner Terminabsage', text: '{AnredeInformell},\n\nDein Termin am {TerminDatum} um {Uhrzeit} Uhr wurde erfolgreich abgesagt.\n\nIch freue mich dennoch, Dich bald wieder zu sehen.\nManuel von Kreuzberg Ästhetik' },
  { name: 'Befund (E-Mail)', betreff: 'Dein Befund', text: '{AnredeInformell},\n\nAnbei findest Du Deinen Befund.\n\nAlles Liebe,\nManuel von Kreuzberg Ästhetik' },
  { name: 'Anmeldebogen SMS', betreff: '', text: '{AnredeInformell},\nich würde mich freuen, wenn Du vor Deinem Termin das Formular ausfüllen könntest: {LinkAnmeldung}\nLiebe Grüße,\n\nManuel von Kreuzberg Ästhetik' },
  { name: 'Anmeldebogen Email', betreff: 'Dein Termin bei Kreuzberg Ästhetik', text: '{AnredeInformell},\n\nZeit ist kostbar!\n\nDeshalb möchte ich davon so viel wie möglich mit Dir und Deinen Wünschen verbringen anstatt mich mit Papierkram aufzuhalten.\n\nIch würde mich freuen, wenn Du vor Deinem Termin am {NaechsterTermin} den Anmeldebogen ausfüllen könntest:\n{LinkAnmeldung}\n\nIch freue mich auf Dich,\nManuel - Kreuzberg Ästhetik\n\n______________________________\n\nDear {Vorname},\n\nTime is precious!\n\nThat\u2019s why I want to spend as much of it as possible with you and your wishes \u2013 not on paperwork.\n\nI\u2019d really appreciate it if you could fill out the form before your appointment:\n{LinkAnmeldung}\n\nJust drop by \u2013 I\u2019m looking forward to seeing you!\nManuel - Kreuzberg Ästhetik' },
  { name: 'Online-Formulare Anmeldung und Terminerinnerung', betreff: 'Bitte vor Deinem Termin ausfüllen', text: '{AnredeInformell},\n\nbitte fülle vor Deinem Termin am {NaechsterTermin} diese Formulare aus:\n\n1. Patientenanmeldung: {LinkAnmeldung}\n2. Terminerinnerung (freiwillig): {LinkErinnerung}\n\nDas geht bequem am Handy und dauert nur wenige Minuten. Den Anamnesebogen schicke ich Dir danach separat.\n\nIch freue mich auf Dich,\nManuel - Kreuzberg Ästhetik' },
  { name: 'Anamnesebogen und Aufklärungsbogen', betreff: 'Anamnesebogen und Aufklärungsbogen', text: '{AnredeInformell},\n\nim Anhang findest Du einen Anamnesebogen, den ich Dich bitten würde auszufüllen.\n\nAußerdem findest Du einen Aufklärungsbogen, diesen einfach durchlesen. Unterschreiben musst Du ihn noch nicht, da ich noch etwas ergänzen werde.\n\nLiebe Grüße\nManuel von Kreuzberg Ästhetik' },
  { name: 'Anamnesebogen und 2+ Aufklärungsbögen', betreff: 'Anamnesebogen und Aufklärungsbögen', text: '{AnredeInformell},\n\nim Anhang findest Du einen Anamnesebogen, den ich Dich bitten würde auszufüllen und zu unterschreiben.\n\nAußerdem findest Du Aufklärungsbögen, diese einfach durchlesen.\n\nLiebe Grüße\nManuel von Kreuzberg Ästhetik\n\n______________________________\n\n{AnredeEnglisch},\n\nAttached you will find a medical history form, which I would ask you to fill out and sign.\n\nYou will also find information and consent forms, please just read through them.\n\nBest regards,\nManuel from Kreuzberg Ästhetik' }
];
async function nvDefaults() {
  settings.nachrichten = settings.nachrichten || [];
  var have = {}; settings.nachrichten.forEach(function (n) { have[n.name.toLowerCase()] = 1; });
  var neu = NV_STD.filter(function (n) { return !have[n.name.toLowerCase()]; });
  if (!neu.length) { alert('Alle Standardvorlagen sind schon vorhanden.'); return; }
  if (!await kaConfirm(neu.length + ' Standardvorlagen hinzufügen? Bereits vorhandene bleiben unverändert.')) return;
  neu.forEach(function (n) { settings.nachrichten.push({ id: newId(), name: n.name, betreff: n.betreff, text: n.text }); });
  persist(); renderNachr();
}
var NV_GROUPS = ['Termin', 'Formulare', 'Rechnung und Befund', 'Sonstiges'], NV_KANAELE = ['E-Mail', 'SMS', 'E-Mail · SMS'];
function nvGroupOf(x) {
  if (NV_GROUPS.indexOf(x.gruppe) >= 0) return x.gruppe; var n = String(x.name || '');
  if (/termin|erinner|absage/i.test(n)) return 'Termin'; if (/anmelde|anamnes|aufklär|formular/i.test(n)) return 'Formulare'; if (/kosten|rechnung|befund/i.test(n)) return 'Rechnung und Befund'; return 'Sonstiges';
}
function nvKanalOf(x) { return NV_KANAELE.indexOf(x.kanal) >= 0 ? x.kanal : (/sms/i.test(x.name || '') ? 'SMS' : 'E-Mail'); }
function nvCleanName(x) { return String(x.name || '').replace(/\s*\((E-Mail|SMS)\)\s*$/i, '').replace(/\s+(SMS|Email|E-Mail)$/i, ''); }
function renderNachr() {
  settings.nachrichten = settings.nachrichten || []; renderPakete(); renderPlatzhalter();
  var box = document.getElementById('nv-list'); if (!box) return; box.innerHTML = '';
  NV_GROUPS.forEach(function (g) {
    var items = settings.nachrichten.map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return nvGroupOf(o.x) === g; }); if (!items.length) return;
    box.appendChild(mk('div', 'nv-sec', g));
    items.forEach(function (o) {
      var x = o.x, k = nvKanalOf(x), t = mk('div', 'nv-t'), m = mk('div', 'm');
      m.appendChild(mk('div', 'nm', x.name)); var sub = (x.betreff || '') || String(x.text || '').replace(/\s+/g, ' ').slice(0, 80); if (sub) m.appendChild(mk('div', 'sub', sub));
      t.appendChild(m); t.appendChild(mk('span', 'nv-ch' + (k === 'SMS' ? ' sms' : k === 'E-Mail' ? '' : ' both'), k)); t.onclick = function () { openNachr(o.i); }; box.appendChild(t);
    });
  });
  if (!settings.nachrichten.length) box.appendChild(mk('div', 'hm-empty', 'Noch nichts angelegt. Über ⋯ kannst Du die Standardvorlagen laden.'));
}
function nvMenu(ev) {
  ev.stopPropagation(); var old = document.getElementById('nv-pop'); if (old) { old.remove(); return; }
  var r = ev.currentTarget.getBoundingClientRect(), m = mk('div', 'nv-pop'); m.id = 'nv-pop';
  var it = mk('button', '', 'Standardvorlagen laden'); it.type = 'button'; it.onclick = function () { m.remove(); nvDefaults(); }; m.appendChild(it);
  m.style.top = (r.bottom + 6) + 'px'; m.style.right = Math.max(8, window.innerWidth - r.right) + 'px'; document.body.appendChild(m);
  setTimeout(function () { document.addEventListener('click', function f() { var p = document.getElementById('nv-pop'); if (p) p.remove(); document.removeEventListener('click', f); }); }, 0);
}
/* Platzhalter: eingebaute (fest), Anreden (umformulierbar) und eigene */
var PH_BUILTIN = [
  ['Aus der Akte', [['Anrede', 'Frau, Herr oder leer'], ['Vorname', 'Vorname des Patienten'], ['Nachname', 'Nachname des Patienten'], ['Name', 'Vorname und Nachname']]],
  ['Termin und Datum', [['Datum', 'heutiges Datum'], ['DatumWochentag', 'heutiges Datum mit Wochentag'], ['Termin', 'nächster Termin mit Datum und Uhrzeit'], ['TerminDatum', 'Datum des nächsten Termins mit Wochentag'], ['NaechsterTermin', 'nächster Termin kurz, z. B. 12.11. um 14:00'], ['Uhrzeit', 'Uhrzeit des nächsten Termins'], ['Behandlung', 'Behandlung des nächsten Termins']]],
  ['Links', [['LinkAnmeldung', 'Anmeldeformular'], ['LinkAnamnese', 'Anamnese mit dem Code des Patienten'], ['LinkErinnerung', 'Erinnerungsformular'], ['Links', 'nur in Paketen: Liste der Formular-Links']]]
];
var AN_DEF = { Formell: ['Sehr geehrte Frau {Nachname}', 'Sehr geehrter Herr {Nachname}', 'Guten Tag {Vorname} {Nachname}'], Informell: ['Liebe {Vorname}', 'Lieber {Vorname}', 'Hallo {Vorname}'], Englisch: ['Dear Ms. {Nachname}', 'Dear Mr. {Nachname}', 'Dear {Vorname} {Nachname}'] };
function anTpl(k) { var s = (settings.anreden || {})[k]; return Array.isArray(s) && s.length === 3 ? s : AN_DEF[k]; }
function anFill(k, an, vn, nn) { return anTpl(k)[an === 'Frau' ? 0 : an === 'Herr' ? 1 : 2].replace(/\{Vorname\}/g, vn).replace(/\{Nachname\}/g, nn).replace(/\{Name\}/g, (vn + ' ' + nn).trim()); }
function phReserved() { var r = ['AnredeFormell', 'AnredeInformell', 'AnredeEnglisch']; PH_BUILTIN.forEach(function (g) { g[1].forEach(function (x) { r.push(x[0]); }); }); return r; }
function phAll() { return (settings.platzhalter || []).map(function (x) { return x.name; }).concat(['Vorname', 'Nachname', 'AnredeInformell', 'AnredeFormell', 'TerminDatum', 'Uhrzeit', 'Behandlung', 'Name', 'Datum', 'Anrede', 'AnredeEnglisch', 'DatumWochentag', 'Termin', 'NaechsterTermin', 'LinkAnmeldung', 'LinkAnamnese', 'LinkErinnerung']); }
function renderPlatzhalter() {
  var box = document.getElementById('ph-list'); if (!box) return; box.innerHTML = '';
  var edit = function (fn, label) { var b = mk('button', 'ph-edit'); b.type = 'button'; b.title = label; b.setAttribute('aria-label', label); b.innerHTML = tvSvg('pen'); b.onclick = function (ev) { ev.stopPropagation(); fn(); }; return b; };
  var sec = function (t, extra) { var h = mk('div', 'nv-sec'); h.appendChild(mk('span', '', t)); if (extra) h.appendChild(extra); box.appendChild(h); };
  var row = function (name, ex, btn, desc) { var r = mk('div', 'ph-row'), m = mk('div', 'm'); m.appendChild(mk('span', 'ph-tag', '{' + name + '}')); if (desc) m.appendChild(mk('span', 'ph-d', desc)); if (ex) m.appendChild(mk('div', 'ph-ex', ex)); r.appendChild(m); if (btn) r.appendChild(btn); if (btn) r.style.cursor = 'pointer'; box.appendChild(r); return r; };
  var add = mk('button', 'btn btn-sm btn-secondary', '+ Platzhalter'); add.type = 'button'; add.onclick = function () { openPh(-1); };
  sec('Eigene', add);
  var cu = settings.platzhalter || [];
  cu.forEach(function (x, i) { var r = row(x.name, String(x.text || '').replace(/\s+/g, ' ').slice(0, 90), edit(function () { openPh(i); }, 'Platzhalter bearbeiten')); r.onclick = function () { openPh(i); }; });
  if (!cu.length) box.appendChild(mk('div', 'hm-empty', 'Noch keine eigenen Platzhalter, zum Beispiel {Praxisname} oder {Telefon}.'));
  sec('Anreden (umformulierbar)');
  [['Formell', 'AnredeFormell'], ['Informell', 'AnredeInformell'], ['Englisch', 'AnredeEnglisch']].forEach(function (a) { var r = row(a[1], anFill(a[0], 'Frau', 'Anna', 'Beispiel'), edit(function () { openAn(a[0]); }, 'Anrede bearbeiten')); r.onclick = function () { openAn(a[0]); }; });
  PH_BUILTIN.forEach(function (g) { var lk = mk('span', 'nv-lock', 'fest'); sec(g[0], lk); g[1].forEach(function (x) { row(x[0], '', null, x[1]); }); });
}
var phIdx = -1, anKey = '';
function openPh(i) {
  phIdx = i; var x = i >= 0 ? settings.platzhalter[i] : null;
  document.getElementById('ph-title').textContent = x ? 'Platzhalter bearbeiten' : 'Neuer Platzhalter';
  document.getElementById('ph-name').value = x ? x.name : ''; document.getElementById('ph-text').value = x ? x.text : '';
  document.getElementById('ph-hint').textContent = x ? 'In Vorlagen schreibst Du {' + x.name + '}.' : '';
  document.getElementById('ph-del').style.display = x ? '' : 'none'; openModal('modal-ph');
}
function savePh() {
  var n = document.getElementById('ph-name').value.trim().replace(/^\{|\}$/g, ''), t = document.getElementById('ph-text').value;
  if (!/^[A-Za-zÄÖÜäöüß0-9_]+$/.test(n)) { alert('Der Name darf nur Buchstaben, Ziffern und _ enthalten, ohne Leerzeichen.'); return; }
  settings.platzhalter = settings.platzhalter || [];
  if (phReserved().indexOf(n) >= 0 || settings.platzhalter.some(function (x, i) { return i !== phIdx && x.name === n; })) { alert('Diesen Namen gibt es schon.'); return; }
  var x = { name: n, text: t }; if (phIdx >= 0) settings.platzhalter[phIdx] = x; else settings.platzhalter.push(x);
  persist(); closeModal('modal-ph'); renderPlatzhalter();
}
async function deletePh() { if (phIdx < 0 || !await kaConfirm('Platzhalter löschen? Vorlagen, die ihn verwenden, zeigen ihn dann unverändert in Klammern.')) return; settings.platzhalter.splice(phIdx, 1); persist(); closeModal('modal-ph'); renderPlatzhalter(); }
function openAn(k) {
  anKey = k; document.getElementById('an-title').textContent = 'Anrede „' + k + '“'; var t = anTpl(k);
  for (var i = 0; i < 3; i++) document.getElementById('an-' + i).value = t[i]; openModal('modal-an');
}
function saveAn() {
  var v = [0, 1, 2].map(function (i) { return document.getElementById('an-' + i).value.trim(); });
  if (v.some(function (x) { return !x; })) { alert('Bitte alle drei Zeilen ausfüllen.'); return; }
  settings.anreden = settings.anreden || {}; settings.anreden[anKey] = v; persist(); closeModal('modal-an'); renderPlatzhalter();
}
function resetAn() { if (settings.anreden) delete settings.anreden[anKey]; persist(); closeModal('modal-an'); renderPlatzhalter(); }
var nvLast = 'nv-text';
document.addEventListener('focusin', function (ev) { if (ev.target && (ev.target.id === 'nv-betreff' || ev.target.id === 'nv-text')) nvLast = ev.target.id; });
function nvPhChips(all) {
  var box = document.getElementById('nv-phs'); if (!box) return; box.innerHTML = '';
  var names = phAll(), show = all ? names : names.slice(0, (settings.platzhalter || []).length + 7);
  show.forEach(function (n) { var b = mk('button', '', '{' + n + '}'); b.type = 'button'; b.onmousedown = function (ev) { ev.preventDefault(); }; b.onclick = function () { var f = document.getElementById(nvLast) || document.getElementById('nv-text'), a = f.selectionStart == null ? f.value.length : f.selectionStart, e = f.selectionEnd == null ? a : f.selectionEnd; f.value = f.value.slice(0, a) + '{' + n + '}' + f.value.slice(e); f.focus(); f.selectionStart = f.selectionEnd = a + n.length + 2; }; box.appendChild(b); });
  if (!all) { var mb = mk('button', 'more', 'mehr ▾'); mb.type = 'button'; mb.onclick = function () { nvPhChips(true); }; box.appendChild(mb); }
}
/* Standard-Textbausteine, abgeleitet aus den Schreibweisen in den bisherigen Rechnungen (ohne Namen, Chargen und Preise).
   Zahlen und Zonen sind Beispiele und werden vor dem Einsetzen angepasst. */
var TB_STD = [
  { name: 'BTX Zornesfalte', text: 'Zornesfalte (Glabella): Botulinumtoxin, Injektionsschema 10-10-10-10-10 (50 Einheiten).' },
  { name: 'BTX Stirn', text: 'Stirn (M. frontalis): Botulinumtoxin, Injektionsschema 5-5-5-5-5 (25 Einheiten).' },
  { name: 'BTX Krähenfüße', text: 'Krähenfüße beidseits: Botulinumtoxin, Injektionsschema 5-10-10-10 pro Seite (70 Einheiten).' },
  { name: 'BTX Browlift', text: 'Browlift: Botulinumtoxin, 4 Einheiten pro Seite.' },
  { name: 'BTX Masseter', text: 'Masseter: Botulinumtoxin beidseits, ___ Einheiten pro Seite.' },
  { name: 'BTX Zonen', text: 'Botulinumtoxin in ___ Zonen (___ Einheiten gesamt).' },
  { name: 'Hinweis Speywood-Units', text: '(*SU = Speywood-Units, die spezifischen Units für Azzalure und Dysport)' },
  { name: 'Produkt mit Charge', text: 'Produkt: ___, Chargennummer: ___, MHD: ___' },
  { name: 'Hyaluron Menge', text: 'Hyaluronsäure ___ ml, Areal: ___, Kanüle: ___.' },
  { name: 'Hyaluron Tränenrinne', text: 'Tränenrinne beidseits: Hyaluronsäure, ___ ml pro Seite, stumpfe Kanüle 25 G.' },
  { name: 'Hyaluron Kinn', text: 'Kinn: Hyaluronsäure, ___ ml, spitze Kanüle.' },
  { name: 'Hyaluron Hochrisiko-Gebiet', text: 'Hyaluronsäure ___ ml in einem Hochrisiko-Gebiet (___). Aufklärung über Gefäßrisiken erfolgt.' },
  { name: 'Rechnung Dank', text: 'Vielen Dank für Ihr Vertrauen.' },
  { name: 'Rechnung Wiedersehen', text: 'See you soon.' },
  { name: 'BTX Schema kurz', text: 'SF ___ / Stirn ___ / ZF ___ / KF ___' },
  { name: 'Microneedling Anti-Aging', text: 'Microneedling (Anti-Aging-Protokoll) mit PNBlast (Exosomen und Polynukleotide), Areal: ___.' },
  { name: 'Mesotherapie PN NCTF', text: '___ ml PN (Polynukleotide), Areal: ___, zusammen mit ___ ml NCTF.' },
  /* Nachsorge: nach den Verhaltensregeln der Praxis (After-care-instructions), Texte in docs.js, vom Praxisinhaber gegengelesen und freigegeben (04.11.2026) */
  { name: 'Nachsorge Neuromodulator', text: KA_PARTS['Nachsorge Neuromodulator'] },
  { name: 'Nachsorge Filler', text: KA_PARTS['Nachsorge Filler'] },
  { name: 'Nachsorge Filler Lippen', text: KA_PARTS['Nachsorge Filler Lippen'] },
  { name: 'Nachsorge Filler Nase', text: KA_PARTS['Nachsorge Filler Nase'] },
  { name: 'Nachsorge Trinkmenge', text: KA_PARTS['Nachsorge Trinkmenge'] },
  { name: 'Nachsorge Poly-L-Milchsäure', text: KA_PARTS['Nachsorge Poly-L-Milchsäure'] },
  { name: 'Nachsorge Neuromodulator Kurz', text: KA_PARTS['Nachsorge Neuromodulator Kurz'] },
  { name: 'Nachsorge Wirkungseintritt Neuromodulator', text: KA_PARTS['Nachsorge Wirkungseintritt Neuromodulator'] },
  { name: 'Nachsorge Blaue Flecken', text: KA_PARTS['Nachsorge Blaue Flecken'] },
  { name: 'Nachsorge Auffälligkeiten', text: KA_PARTS['Nachsorge Auffälligkeiten'] },
  { name: 'Nachsorge Neuromodulator EN', text: KA_PARTS['Nachsorge Neuromodulator EN'] },
  { name: 'Nachsorge Filler EN', text: KA_PARTS['Nachsorge Filler EN'] },
  { name: 'Nachsorge Filler Lippen EN', text: KA_PARTS['Nachsorge Filler Lippen EN'] },
  { name: 'Nachsorge Poly-L-Milchsäure EN', text: KA_PARTS['Nachsorge Poly-L-Milchsäure EN'] }
];
/* Standardtexte einmalig übernehmen: nur Namen, die es noch nicht gibt; spätere Ergänzungen kommen mit höherem TB_VER dazu */
var TB_VER = 2;
function tbDefaults() {
  settings.textbausteine = settings.textbausteine || [];
  if ((settings.tbVer || 0) >= TB_VER) return;
  var have = {}; settings.textbausteine.forEach(function (t) { have[String(t.name).toLowerCase()] = 1; });
  TB_STD.forEach(function (t) { if (!have[t.name.toLowerCase()]) settings.textbausteine.push({ id: newId(), name: t.name, text: t.text }); });
  settings.tbVer = TB_VER;
  try { kaSet('ka_settings', JSON.stringify(settings)); } catch (x) {}
}
function renderTxt() { tbDefaults(); settings.textbausteine = settings.textbausteine || []; simpleList('tb-list', settings.textbausteine, openTxt, function (x) { return x.text.replace(/\s+/g, ' ').slice(0, 90); }, true); }
function nvAttRender(sel) {
  var box = document.getElementById('nv-att'); box.innerHTML = '';
  if (!templates.length) { box.appendChild(mk('div', 'hm-empty', 'Noch keine Vorlagen unter Praxis → Vorlagen hochgeladen.')); return; }
  templates.forEach(function (t) {
    var l = mk('label'); l.style.cssText = 'display:flex; gap:8px; align-items:center; font-weight:400; margin-bottom:4px;';
    var c = mk('input'); c.type = 'checkbox'; c.value = t.id; c.checked = sel.indexOf(t.id) >= 0; l.appendChild(c); l.appendChild(document.createTextNode(t.name)); box.appendChild(l);
  });
}
function openNachr(i) {
  nvIdx = i; var x = i >= 0 ? settings.nachrichten[i] : null;
  document.getElementById('nv-name').value = x ? x.name : ''; document.getElementById('nv-betreff').value = x ? x.betreff : ''; document.getElementById('nv-text').value = x ? x.text : '';
  nvAttRender(x ? x.anhang || [] : []);
  var gs = document.getElementById('nv-gruppe'); gs.innerHTML = ''; NV_GROUPS.forEach(function (g) { var o = mk('option', '', g); o.value = g; gs.appendChild(o); });
  gs.value = x ? nvGroupOf(x) : 'Sonstiges'; document.getElementById('nv-kanal').value = x ? nvKanalOf(x) : 'E-Mail'; nvLast = 'nv-text'; nvPhChips(false);
  document.getElementById('nv-del').style.display = x ? '' : 'none'; openModal('modal-nv');
}
function saveNachr() {
  var n = document.getElementById('nv-name').value.trim(); if (!n) { alert('Bitte einen Namen eingeben.'); return; }
  var x = { id: nvIdx >= 0 ? settings.nachrichten[nvIdx].id : newId(), name: n, gruppe: document.getElementById('nv-gruppe').value, kanal: document.getElementById('nv-kanal').value, betreff: document.getElementById('nv-betreff').value.trim(), text: document.getElementById('nv-text').value, anhang: [].slice.call(document.querySelectorAll('#nv-att input:checked')).map(function (c) { return c.value; }) };
  if (nvIdx >= 0) settings.nachrichten[nvIdx] = x; else settings.nachrichten.push(x);
  persist(); closeModal('modal-nv'); renderNachr();
}
async function deleteNachr() { if (nvIdx < 0 || !await kaConfirm('Vorlage löschen?')) return; settings.nachrichten.splice(nvIdx, 1); persist(); closeModal('modal-nv'); renderNachr(); }
function openTxt(i) {
  txIdx = i; var x = i >= 0 ? settings.textbausteine[i] : null;
  document.getElementById('tb-name').value = x ? x.name : ''; document.getElementById('tb-text').value = x ? x.text : '';
  document.getElementById('tb-del').style.display = x ? '' : 'none'; openModal('modal-tb');
}
function saveTxt() {
  var n = document.getElementById('tb-name').value.trim(), t = document.getElementById('tb-text').value; if (!n || !t.trim()) { alert('Bitte Name und Text eingeben.'); return; }
  var x = { id: txIdx >= 0 ? settings.textbausteine[txIdx].id : newId(), name: n, text: t };
  if (txIdx >= 0) settings.textbausteine[txIdx] = x; else settings.textbausteine.push(x);
  persist(); closeModal('modal-tb'); renderTxt();
}
async function deleteTxt() { if (txIdx < 0 || !await kaConfirm('Textbaustein löschen?')) return; settings.textbausteine.splice(txIdx, 1); persist(); closeModal('modal-tb'); renderTxt(); }
/* Auswahl "Textbaustein einfügen" unter einem Textfeld */
function tbPicker(ta) {
  var list = settings.textbausteine || []; if (!list.length || !ta) return null;
  var sel = mk('select', 'form-control'); sel.style.cssText = 'width:auto; max-width:100%; min-height:32px; padding:4px 8px; font-size:12.5px; margin-top:6px;';
  var o0 = mk('option', '', 'Textbaustein einfügen...'); o0.value = ''; sel.appendChild(o0);
  list.forEach(function (t) { var o = mk('option', '', t.name); o.value = t.id; sel.appendChild(o); });
  sel.onchange = function () {
    var t = list.filter(function (x) { return x.id === sel.value; })[0]; sel.value = ''; if (!t) return;
    var a = ta.selectionStart == null ? ta.value.length : ta.selectionStart, b = ta.selectionEnd == null ? a : ta.selectionEnd;
    var pre = (a > 0 && !/\s$/.test(ta.value.slice(0, a))) ? '\n' : '', ins = pre + t.text;
    ta.value = ta.value.slice(0, a) + ins + ta.value.slice(b); ta.focus(); ta.selectionStart = ta.selectionEnd = a + ins.length;
    ta.dispatchEvent(new Event('input'));
  };
  return sel;
}
/* Zufälliger Patientencode für die Anamnese (ohne Klarnamen im Netz); Zeichen ohne Verwechslungen */
function pCode(p) {
  if (!p.code) {
    var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', c;
    do { var b = new Uint8Array(6); crypto.getRandomValues(b); c = Array.prototype.map.call(b, function (x) { return A.charAt(x % A.length); }).join(''); }
    while (patients.some(function (x) { return x.code === c; }));
    p.code = c; persist();
  }
  return p.code;
}
function fillPlatzhalter(text, p) {
  var today = iso(new Date()), nx = events.filter(function (e) { return eventBelongs(e, p) && e.date >= today; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); })[0];
  var an = p.anrede || '', nn = p.nachname || '', vn = p.vorname || '';
  var wd = function (iso0) { var d = new Date(iso0 + 'T12:00:00'); return WDL[d.getDay()] + ', ' + fmtD(iso0); };
  var map = { Anrede: an, Vorname: vn, Nachname: nn, Name: nameKey(p), Datum: fmtD(today), Termin: nx ? fmtTermin(nx) : '', Behandlung: nx ? (nx.behandlung || '') : '',
    AnredeFormell: anFill('Formell', an, vn, nn), AnredeInformell: anFill('Informell', an, vn, nn), AnredeEnglisch: anFill('Englisch', an, vn, nn),
    DatumWochentag: wd(today), TerminDatum: nx ? wd(nx.date) : '', Uhrzeit: nx ? nx.time : '',
    LinkAnmeldung: webfUrl('anmeldung.html'), LinkAnamnese: webfUrl('anamnese.html') + '?c=' + pCode(p), LinkErinnerung: webfUrl('erinnerung.html'),
    NaechsterTermin: nx ? nx.date.slice(8, 10) + '.' + nx.date.slice(5, 7) + '. um ' + nx.time : '' };
  (settings.platzhalter || []).forEach(function (x) { if (x && x.name && map[x.name] === undefined) map[x.name] = String(x.text || ''); });
  return String(text || '').replace(/\{([A-Za-zÄÖÜäöüß0-9_]+)\}/g, function (m, k) { return map[k] !== undefined ? map[k] : m; });
}
var mailAtt = [];
function mailAttAdd(id, name) { if (!mailAtt.some(function (a) { return a.id === id; })) mailAtt.push({ id: id, name: name }); }
function mailAttRender() {
  var box = document.getElementById('m-att'); box.innerHTML = '';
  mailAtt.forEach(function (a, i) {
    var r = mk('div'); r.style.cssText = 'display:flex; justify-content:space-between; gap:8px; align-items:center; padding:4px 0; font-size:14px;';
    r.appendChild(mk('span', '', '\ud83d\udcce ' + a.name)); var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.onclick = function () { mailAtt.splice(i, 1); mailAttRender(); }; r.appendChild(x); box.appendChild(r);
  });
  var sel = mk('select', 'form-control'); sel.style.cssText = 'margin-top:6px;';
  var o0 = mk('option', '', '+ Anhang hinzufügen...'); o0.value = ''; sel.appendChild(o0);
  var addGrp = function (label, list) { if (!list.length) return; var g = document.createElement('optgroup'); g.label = label; list.forEach(function (x) { var o = mk('option', '', x.name); o.value = x.id; g.appendChild(o); }); sel.appendChild(g); };
  addGrp('Vorlagen (Praxis → Vorlagen)', templates); addGrp('Aus der Akte', curP.dokumente || []);
  sel.onchange = function () { var id = sel.value; if (!id) return; var f = templates.concat(curP.dokumente || []).filter(function (x) { return x.id === id; })[0]; if (f) mailAttAdd(f.id, f.name); mailAttRender(); };
  box.appendChild(sel);
  if (mailAtt.length) box.appendChild(Object.assign(mk('div', '', 'Mit Anhängen öffnet sich das Teilen-Menü deines Geräts. Dort wählst du dein Mailprogramm, die Dateien hängen schon dran.'), { style: 'font-size:12px; color:#64748b; margin-top:6px;' }));
}
function applyMailVorl() {
  var id = document.getElementById('m-vorl').value, n = (settings.nachrichten || []).filter(function (x) { return x.id === id; })[0]; if (!n) return;
  document.getElementById('m-betreff').value = fillPlatzhalter(n.betreff, curP); document.getElementById('m-text').value = fillPlatzhalter(n.text, curP);
  (n.anhang || []).forEach(function (id) { var t = templates.filter(function (x) { return x.id === id; })[0]; if (t) mailAttAdd(t.id, t.name); }); mailAttRender();
}

