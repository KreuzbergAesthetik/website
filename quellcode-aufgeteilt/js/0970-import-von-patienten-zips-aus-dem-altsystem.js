/* ===== Import von Patienten-ZIPs aus dem Altsystem (läuft komplett auf diesem Gerät) ===== */
var bi = { files: [], running: false, cancel: false };
function loadPdfJs() {
  return new Promise(function (res, rej) {
    if (window.pdfjsLib) { res(window.pdfjsLib); return; }
    var sc = document.createElement('script'); sc.src = 'pdfjs.min.js';
    sc.onload = function () { if (!window.pdfjsLib) { rej(new Error('lib')); return; } window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs.worker.min.js'; res(window.pdfjsLib); };
    sc.onerror = function () { rej(new Error('lib')); }; document.head.appendChild(sc);
  });
}
async function pdfPages(blob) {
  var lib = await loadPdfJs(), doc = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise, out = [];
  for (var n = 1; n <= doc.numPages; n++) { var pg = await doc.getPage(n), tc = await pg.getTextContent(); out.push(tc.items.map(function (i) { return { str: i.str, x: i.transform[4], y: i.transform[5], w: i.width }; })); }
  if (doc.destroy) doc.destroy(); return out;
}
function shrinkImg(blob, maxPx) {
  return createImageBitmap(blob).then(function (bm) {
    var sc = Math.min(1, maxPx / Math.max(bm.width, bm.height));
    if (sc >= 1 && blob.size < 600 * 1024) { if (bm.close) bm.close(); return blob; }
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(bm.width * sc)); c.height = Math.max(1, Math.round(bm.height * sc));
    c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); if (bm.close) bm.close();
    return new Promise(function (res) { c.toBlob(function (b) { res(b && b.size < blob.size ? b : blob); }, 'image/jpeg', 0.85); });
  }).catch(function () { return blob; });
}
function storageChars() { var n = 0; try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); n += k.length + (localStorage.getItem(k) || '').length; } } catch (x) {} return n; }
function biLog(t, bad) { var l = document.getElementById('bi-log'); l.style.display = 'block'; var d = mk('div', '', t); if (bad) d.style.color = '#b91c1c'; l.appendChild(d); l.scrollTop = l.scrollHeight; }
function biOpen(files) {
  bi = { files: files, running: false, cancel: false };
  document.getElementById('bi-info').textContent = files.length + (files.length === 1 ? ' ZIP-Datei ausgewählt.' : ' ZIP-Dateien ausgewählt.') + ' Jede ZIP gehört zu einem Patienten und soll die Akte als PDF (Nachname, Vorname.pdf) enthalten. Die Daten bleiben auf diesem Gerät.';
  document.getElementById('bi-bar').style.width = '0'; document.getElementById('bi-status').textContent = ''; var l = document.getElementById('bi-log'); l.innerHTML = ''; l.style.display = 'none';
  document.getElementById('bi-go').disabled = false; document.getElementById('bi-go').style.display = ''; document.getElementById('bi-opts').style.display = '';
  document.getElementById('bi-cancel').textContent = 'Abbrechen'; openModal('modal-bimp');
}
function biClose() { if (bi.running) { bi.cancel = true; document.getElementById('bi-status').textContent = 'Wird nach der aktuellen Datei beendet...'; return; } closeModal('modal-bimp'); }
async function biOne(file, o) {
  var map = await readZip(file), keys = Object.keys(map).filter(function (k) { return !/\/$/.test(k); });
  var mfk = keys.filter(function (k) { return /(^|\/)manifest\.json$/.test(k); })[0];
  if (mfk) { var d = JSON.parse(await map[mfk].text()), fm = {}; keys.forEach(function (k) { fm[k] = map[k]; }); var cnt = await doImportPatienten(d, fm, o); return { ok: true, text: file.name + ': ' + (cnt ? cnt.added : 0) + ' Patient(en) im eigenen Format' }; }
  var files = keys.map(function (k) { var base = k.split('/').pop(), m = /^(\d+)_(.*)$/.exec(base); return { id: m ? +m[1] : 0, name: m ? m[2] : base, blob: map[k] }; });
  var akten = files.filter(function (f) { return /^[^,]+,\s*[^,]+\.pdf$/i.test(f.name); }).sort(function (a, b) { return a.id - b.id; });
  if (!akten.length) return { fehler: file.name + ': keine Akte-PDF (Nachname, Vorname.pdf) in der ZIP gefunden' };
  var P = parseAkte(await pdfPages(akten[akten.length - 1].blob)), r = akteBuild(P, files, { tsParse: tsParse, katGuess: katGuess });
  if (r.fehler) return { fehler: file.name + ': ' + r.fehler };
  var p = r.patient, name = nameKey(p), old = patients.filter(function (x) { return nameKey(x).toLowerCase() === name.toLowerCase(); })[0];
  if (old) {
    if (o.dup === 'skip') return { skip: true, text: name + ': übersprungen (gibt es schon)' };
    p.id = old.id; (old.bilder || []).concat(old.dokumente || []).forEach(function (x) { fDel(x.id); });
    patients = patients.filter(function (x) { return x !== old; }); events = events.filter(function (e) { return !eventBelongs(e, old); });
  }
  if (!o.mail) p.log = p.log.filter(function (l) { return l.type !== 'mail'; });
  var evs = r.events.map(function (e) { e.patient = name; e.id = nid++; return e; }), nf = 0, bad = 0;
  p.doku.forEach(function (d, i) { d.ts += i; });
  for (var i = 0; i < r.atts.length; i++) {
    var a = r.atts[i], id = newId(), blob = a.blob;
    if (a.kind === 'bild' && o.shrink) blob = await shrinkImg(blob, 2000);
    if (!(await fPut(id, a.name, blob))) { bad++; continue; }
    var rec = { id: id, ts: a.ts + i, name: a.name }; if (a.kat) rec.kat = a.kat; if (a.zuIdx >= 0) rec.zu = 'e' + evs[a.zuIdx].id;
    (a.kind === 'bild' ? p.bilder : p.dokumente).push(rec); nf++;
  }
  patients.push(p); ensurePatients(); evs.forEach(function (e) { e.patientId = p.id; e.patient = nameKey(p); }); events = events.concat(evs); persist();
  return { ok: true, text: name + ': ' + evs.length + ' Termine, ' + (p.doku.length + evs.filter(function (e) { return e.doku; }).length) + ' Dokumentationen, ' + nf + ' Dateien' + (bad ? ', ' + bad + ' Datei(en) nicht gespeichert' : ''), report: r.report.map(function (x) { return name + ': ' + x; }) };
}
async function biRun() {
  if (bi.running) return;
  var o = { dup: document.getElementById('bi-dup').value, shrink: document.getElementById('bi-shrink').checked, mail: document.getElementById('bi-mail').checked, quiet: true };
  bi.running = true; bi.cancel = false; document.getElementById('bi-go').disabled = true; document.getElementById('bi-opts').style.display = 'none'; document.getElementById('bi-cancel').textContent = 'Anhalten';
  var sum = { ok: 0, skip: 0, fail: 0 }, total = bi.files.length, i;
  for (i = 0; i < total && !bi.cancel; i++) {
    var f = bi.files[i]; document.getElementById('bi-status').textContent = (i + 1) + ' von ' + total + ': ' + f.name;
    if (storageChars() > 4400000) { biLog('Der Browser-Speicher für Patientendaten ist fast voll. Der Import wurde angehalten, um nichts zu verlieren.', true); bi.cancel = true; break; }
    try {
      var r = await biOne(f, o);
      if (r.fehler) { sum.fail++; biLog(r.fehler, true); } else if (r.skip) { sum.skip++; biLog(r.text); } else { sum.ok++; biLog(r.text); (r.report || []).forEach(function (x) { biLog('  Hinweis: ' + x); }); }
    } catch (e) { sum.fail++; biLog(f.name + ': Fehler (' + (e && e.message ? e.message : 'unbekannt') + ')', true); }
    document.getElementById('bi-bar').style.width = Math.round((i + 1) / total * 100) + '%';
    await new Promise(function (r2) { setTimeout(r2, 0); });
  }
  bi.running = false; persist(); renderPatients(); renderCal(); renderHome();
  document.getElementById('bi-status').textContent = 'Fertig: ' + sum.ok + ' importiert, ' + sum.skip + ' übersprungen, ' + sum.fail + ' mit Fehler' + (bi.cancel ? ' (angehalten nach ' + i + ' von ' + total + ')' : '') + '. Speicher: ' + Math.round(storageChars() / 52428.8) + ' % des Browser-Speichers für Patientendaten belegt.';
  document.getElementById('bi-go').style.display = 'none'; document.getElementById('bi-cancel').textContent = 'Schließen';
}
async function pdfEmbeddedJson(file) {
  try {
    var lib = await loadPdfJs(), doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise, at = await doc.getAttachments();
    if (!at) return null; var k = Object.keys(at).filter(function (x) { return /\.json$/i.test(at[x].filename || x); })[0]; if (!k) return null;
    var j = JSON.parse(new TextDecoder().decode(at[k].content)); return j && j.format === 'ka-formular' ? j : null;
  } catch (x) { return null; }
}
async function detectFormulare(fl) {
  var jsons = fl.filter(function (f) { return /\.json$/i.test(f.name) && !/^manifest\.json$/i.test(f.name); }), pdfs = fl.filter(function (f) { return /\.pdf$/i.test(f.name); }), out = [], used = [];
  for (var i = 0; i < jsons.length; i++) {
    try { var d = JSON.parse(await jsons[i].text()); } catch (x) { continue; }
    if (!d || d.format !== 'ka-formular' || !d.patient) continue;
    var base = jsons[i].name.replace(/\.json$/i, ''), pdf = pdfs.filter(function (x) { return x.name.replace(/\.pdf$/i, '') === base; })[0] || (jsons.length === 1 && pdfs.length === 1 ? pdfs[0] : null);
    if (pdf) used.push(pdf); out.push({ d: d, pdf: pdf });
  }
  for (var k = 0; k < pdfs.length; k++) { if (used.indexOf(pdfs[k]) >= 0) continue; var e = await pdfEmbeddedJson(pdfs[k]); if (e && e.patient) out.push({ d: e, pdf: pdfs[k] }); }
  return out;
}
function importPatienten(inp) {
  var fl = [].slice.call(inp.files || []); if (!fl.length) return;
  if (!fl.some(function (f) { return /\.zip$/i.test(f.name); }) && fl.some(function (f) { return /\.(json|pdf)$/i.test(f.name) && !/^manifest\.json$/i.test(f.name); })) {
    detectFormulare(fl).then(function (es) { if (es.length) { inp.value = ''; formularImport(es); } else importPatienten2(inp, fl); }); return;
  }
  return importPatienten2(inp, fl);
}
function importPatienten2(inp, fl) {
  var fail = function (e) { alert('Die Datei konnte nicht gelesen werden.' + (e && e.message ? ' (' + e.message + ')' : '')); inp.value = ''; };
  var zip = fl.filter(function (f) { return /\.zip$/i.test(f.name); })[0];
  var mf = zip ? null : fl.filter(function (f) { return /\.json$/i.test(f.name); })[0];
  if (!zip && !mf) { alert('Bitte die ZIP-Datei wählen, oder die Datei manifest.json zusammen mit den zugehörigen Dateien.'); inp.value = ''; return; }
  var zips = fl.filter(function (f) { return /\.zip$/i.test(f.name); });
  if (zips.length > 1) { inp.value = ''; biOpen(zips); return; }
  var done = function (o) { inp.value = ''; return doImportPatienten(o.d, o.files); };
  if (zip) {
    /* Die ZIP wird stückweise gelesen (nicht komplett in den Speicher), auch große Dateien gehen */
    readZip(zip).then(function (m) { if (!m['manifest.json']) { inp.value = ''; biOpen([zip]); return Promise.reject(new Error('batch')); } return m['manifest.json'].text().then(function (t) { return { d: JSON.parse(t), files: m }; }); }).then(done, function (e) { if (e && e.message === 'batch') return; fail(e); });
  } else {
    mf.text().then(function (t) {
      var files = {}; fl.forEach(function (f) { if (f !== mf) files[f.name] = f.type ? f : new Blob([f], { type: mimeOf(f.name) }); });
      return { d: JSON.parse(t), files: files };
    }).then(done, fail);
  }
}
async function doImportPatienten(d, files, q) {
  if (!d || d.format !== 'ka-patienten' || !Array.isArray(d.patients)) { if (q) return Promise.reject(new Error('kein Patienten-Importpaket')); alert('Das ist keine Patienten-Importdatei. Für eine komplette Sicherung nutze oben "Laden".'); return Promise.resolve(); }
  var added = 0, ev = 0, nf = 0, miss = 0, jobs = [], T = function (v) { return String(v == null ? '' : v); };
  for (var pi0 = 0; pi0 < d.patients.length; pi0++) await (async function (src) {
    var name = (T(src.vorname) + ' ' + T(src.nachname)).trim();
    if (!T(src.vorname).trim() || !T(src.nachname).trim()) return;
    var old = patients.filter(function (x) { return nameKey(x).toLowerCase() === name.toLowerCase(); })[0];
    if (old && (q ? q.dup === 'skip' : !await kaConfirm('Einen Patienten "' + name + '" gibt es schon.\n\nOK = seine bisherigen Daten (Termine, Dokumentation, Dateien) durch die Importdaten ersetzen oder diesen Patienten überspringen?', { ok: 'Ersetzen', cancel: 'Überspringen' }))) return;
    var p = { anrede: T(src.anrede), vorname: T(src.vorname).trim(), nachname: T(src.nachname).trim(), dob: T(src.dob), phone: T(src.phone), email: T(src.email), adresse: T(src.adresse), allergien: T(src.allergien), notizen: T(src.notizen), medikation: [], doku: [], log: [], bilder: [], dokumente: [], erstellt: tsParse(src.erstellt) };
    if (old) {
      p.id = old.id;
      (old.bilder || []).concat(old.dokumente || []).forEach(function (x) { fDel(x.id); });
      patients = patients.filter(function (x) { return x !== old; });
      events = events.filter(function (e) { return !eventBelongs(e, old); });
    }
    (src.medikation || []).forEach(function (m) { p.medikation.push(T(m)); });
    (src.doku || []).forEach(function (x, i) { p.doku.push({ ts: tsParse(x.ts) + i, text: T(x.text) }); });
    (src.log || []).forEach(function (x, i) { p.log.push({ ts: tsParse(x.ts) + i, type: x.type === 'med' ? 'med' : 'notiz', text: T(x.text) }); });
    [['bilder', src.bilder], ['dokumente', src.dokumente]].forEach(function (kv) {
      (kv[1] || []).forEach(function (a, i) {
        var bl = files[a.datei] || files[String(a.datei).split('/').pop()]; if (!bl) { miss++; return; }
        var id = newId(), rec = { id: id, ts: a.ts ? tsParse(a.ts) + i : Date.now() + i, name: T(a.name) || T(a.datei) };
        p[kv[0]].push(rec);
        jobs.push(fPut(id, rec.name, new Blob([bl], { type: bl.type || mimeOf(rec.name) })).then(function (ok) { if (ok) nf++; else { p[kv[0]] = p[kv[0]].filter(function (x) { return x !== rec; }); miss++; } }));
      });
    });
    patients.push(p); ensurePatients(); added++;
    (src.termine || []).forEach(function (t) {
      var dt = tsParse(t.ts), dd = new Date(dt);
      events.push({ id: nid++, date: iso(dd), time: pad(dd.getHours()) + ':' + pad(dd.getMinutes()), dur: +t.dur || 60, patientId: p.id, patient: nameKey(p), behandlung: T(t.behandlung) || 'Beratung', notiz: T(t.notiz), doku: t.doku ? T(t.doku) : undefined, color: '#16a34a' });
      ev++;
    });
  })(d.patients[pi0]);
  return Promise.all(jobs).then(function () {
    persist(); renderPatients(); renderCal(); if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
    if (q) return { added: added, ev: ev, nf: nf, miss: miss };
    alert(added + ' Patient(en), ' + ev + ' Termin(e) und ' + nf + ' Datei(en) wurden hinzugefügt.' + (miss ? '\n' + miss + ' Datei(en) konnten nicht übernommen werden.' : ''));
  });
}
document.getElementById('p-adr-box').appendChild(addrBlock('p-adr-', ''));
function savePatient() {
  var g = function (id) { return document.getElementById(id).value.trim(); };
  if (!g('p-vorname') || !g('p-nachname')) { alert('Bitte mind. Vorname und Nachname eingeben.'); return; }
  if (!validDob(g('p-dob'))) { alert(DOB_MSG); return; }
  if (patients.some(function (x) { return nameKey(x).toLowerCase() === (g('p-vorname') + ' ' + g('p-nachname')).toLowerCase(); })) { alert('Einen Patienten mit diesem Namen gibt es schon. Bitte prüfe, ob es sich um dieselbe Person handelt, oder ergänze zur sicheren Unterscheidung z.B. einen zweiten Vornamen.'); return; }
  patients.push({ anrede: g('p-anrede'), vorname: g('p-vorname'), nachname: g('p-nachname'), dob: g('p-dob'), phone: g('p-phone'), email: g('p-email'), adresse: addrRead('p-adr-'), allergien: g('p-allergien'), notizen: g('p-notizen') });
  ensurePatients(); migrateEventPatientIds(); persist(); renderPatients();
  var newP = patients[patients.length - 1];
  if (patFromTermin) { patFromTermin = false; tPatientId = newP.id; document.getElementById('t-patient').value = nameKey(newP); }
  ['p-anrede', 'p-vorname', 'p-nachname', 'p-dob', 'p-phone', 'p-email', 'p-allergien', 'p-notizen', 'p-adr-str', 'p-adr-nr', 'p-adr-plz', 'p-adr-ort'].forEach(function (id) { document.getElementById(id).value = ''; });
  closeModal('modal-patient');
  offerNeu(newP);
}

function tPatDDHide() { var d = document.getElementById('t-pat-dd'); if (d) d.style.display = 'none'; }
function tPatDD() {
  var inp = document.getElementById('t-patient'), d = document.getElementById('t-pat-dd'), q = inp.value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (tPatientId != null) { var tp = patById(tPatientId); if (!tp || nameKey(tp).toLowerCase() !== q) tPatientId = null; }
  d.innerHTML = '';
  if (!q) { d.style.display = 'none'; return; }
  var hit = patients.filter(function (p) { var n = nameKey(p).toLowerCase(); return n.indexOf(q) === 0 || (' ' + n).indexOf(' ' + q) >= 0 || (p.nachname + ' ' + p.vorname).toLowerCase().indexOf(q) === 0; }).sort(function (a, b) { return nameKey(a).localeCompare(nameKey(b), 'de'); }).slice(0, 8);
  hit.forEach(function (p) { var b = mk('button', '', nameKey(p) + (p.dob ? ' · ' + p.dob : '')); b.type = 'button'; b.onmousedown = function (ev) { ev.preventDefault(); }; b.onclick = function () { tPatientId = p.id; inp.value = nameKey(p); d.style.display = 'none'; }; d.appendChild(b); });
  var exact = patients.some(function (p) { return nameKey(p).toLowerCase() === q; });
  if (!exact) {
    var nb = mk('button', 'pd-new', '+ Neuen Patienten anlegen: ' + inp.value.trim()); nb.type = 'button'; nb.onmousedown = function (ev) { ev.preventDefault(); };
    nb.onclick = function () {
      d.style.display = 'none';
      ['p-anrede', 'p-vorname', 'p-nachname', 'p-dob', 'p-phone', 'p-email', 'p-allergien', 'p-notizen', 'p-adr-str', 'p-adr-nr', 'p-adr-plz', 'p-adr-ort'].forEach(function (id) { var e = document.getElementById(id); if (e) e.value = ''; });
      var w = inp.value.trim().split(/\s+/), n = w.length > 1 ? w.pop() : ''; document.getElementById('p-vorname').value = w.join(' '); document.getElementById('p-nachname').value = n;
      patFromTermin = true; openModal('modal-patient');
    };
    d.appendChild(nb);
  }
  d.style.display = 'block';
}
var patFromTermin = false;
async function saveTermin() {
  var datum = document.getElementById('t-datum').value;
  var ganz = document.getElementById('t-ganztag').checked;
  var zeit = ganz ? fromMin(DSTART * 60) : document.getElementById('t-zeit').value;
  var dur = (DEND - DSTART) * 60;
  if (!ganz) {
    var ende = document.getElementById('t-ende').value;
    if (!datum || !zeit || !ende) { alert('Bitte Datum, Beginn und Ende angeben.'); return; }
    dur = toMin(ende) - toMin(zeit);
    if (dur <= 0) { alert('Das Ende muss nach dem Beginn liegen.'); return; }
  } else if (!datum) { alert('Bitte Datum angeben.'); return; }
  if (document.getElementById('t-leistung').value.trim()) tLeistAdd(document.getElementById('t-leistung').value);
  var pname = document.getElementById('t-patient').value.trim().replace(/\s+/g, ' ');
  if (!pname) { alert('Bitte einen Patienten eingeben.'); return; }
  var pp = tPatientId != null ? patById(tPatientId) : null;
  if (pp && nameKey(pp) !== pname) pp = null;
  if (!pp) { var hit = patients.filter(function (x) { return nameKey(x) === pname; }); if (hit.length === 1) pp = hit[0]; }
  if (!pp && !await kaConfirm('Der Patient "' + pname + '" ist nicht angelegt. Der Termin kann dann keiner Akte zugeordnet werden. Trotzdem speichern?')) return;
  var ev = {
    date: datum, time: zeit, dur: dur,
    patientId: pp ? pp.id : null,
    patient: pp ? nameKey(pp) : pname,
    behandlung: tLeist.join(', '),
    notiz: document.getElementById('t-notiz').value,
    color: document.getElementById('t-farbe').value,
    leistung: tLeist[0] || '',
    leistungen: tLeist.slice()
  };
  if (editId) {
    for (var i = 0; i < events.length; i++) if (events[i].id === editId) { ev.id = editId; ev.doku = events[i].doku; ev.dok = events[i].dok; ev.status = events[i].status; ev.phase = events[i].phase; events[i] = ev; }
  } else {
    ev.id = nid++;
    events.push(ev);
  }
  ev.mod = Date.now();
  var p = datum.split('-'); cur = new Date(+p[0], +p[1] - 1, +p[2]);
  persist(); renderCal();
  closeTermin();
  offerVorlagen(ev);
}

/* Backup: Export und Import */
