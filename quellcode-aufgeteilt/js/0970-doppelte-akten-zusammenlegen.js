/* ===== Doppelte Akten zusammenlegen ===== */
var mgA = null, mgB = null, mgKeep = 'a', mgPick = {};
var MG_FIELDS = [['anrede', 'Anrede'], ['titel', 'Titel'], ['vorname', 'Vorname'], ['nachname', 'Nachname'], ['dob', 'Geburtsdatum'], ['phone', 'Telefon'], ['email', 'E-Mail'], ['adresse', 'Anschrift']];
function mgCounts(p) { return { t: events.filter(function (e) { return eventBelongs(e, p); }).length, r: invoices.filter(function (i) { return i.pid === p.id; }).length, d: (p.dokumente || []).length + (p.bilder || []).length, l: (p.log || []).length + (p.doku || []).length }; }
function mgWeight(p) { var c = mgCounts(p); return c.t + c.r * 2 + c.d + c.l; }
function mgDigits(t) { return String(t || '').replace(/\D/g, '').replace(/^(00)?49/, '').replace(/^0+/, ''); }
function mgScore(a, b) {
  var s = 0, strong = false, da = String(a.dob || '').trim(), db = String(b.dob || '').trim();
  if (da && da === db) s += 3;
  if (nameNorm(nameKey(a)) === nameNorm(nameKey(b))) s += 4;
  else { if (nameNorm(a.nachname) === nameNorm(b.nachname)) s += 1.5; if (nameNorm(a.vorname) === nameNorm(b.vorname)) s += 1; else if (nameNorm(a.vorname).slice(0, 3) && nameNorm(a.vorname).slice(0, 3) === nameNorm(b.vorname).slice(0, 3)) s += 0.5; }
  if (a.email && String(a.email).toLowerCase() === String(b.email || '').toLowerCase()) { s += 3; strong = true; }
  if (mgDigits(a.phone).length >= 6 && mgDigits(a.phone) === mgDigits(b.phone)) { s += 3; strong = true; }
  return { s: s, strong: strong };
}
function mgPairs() {
  var out = [];
  for (var i = 0; i < patients.length; i++) for (var j = i + 1; j < patients.length; j++) { var r = mgScore(patients[i], patients[j]); if (r.s >= 4 || r.strong) out.push({ a: patients[i], b: patients[j], s: r.s }); }
  return out.sort(function (x, y) { return y.s - x.s; });
}
function mgLine(p) { return '#' + patNr(p) + ' ' + dnP(p) + (p.dob ? ' · ' + p.dob : '') + (p.phone ? ' · ' + p.phone : ''); }
function mgOpen(a, b) { ensurePatients(); mgA = a || null; mgB = b || null; mgPick = {}; mgRender(); openModal('modal-merge'); }
function mgRender() {
  var box = document.getElementById('mg-body'), go = document.getElementById('mg-go'); box.innerHTML = ''; go.style.display = 'none';
  var note = function (t) { var d = mk('div', '', t); d.style.cssText = 'font-size:13px; color:#475569; margin-bottom:10px;'; box.appendChild(d); };
  var row = function (txt, fn, badge) {
    var b = mk('button', 'btn btn-secondary'); b.type = 'button'; b.style.cssText = 'display:flex; width:100%; text-align:left; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; font-weight:400;'; b.appendChild(mk('span', '', txt));
    if (badge) { var g = mk('span', 'badge badge-amber', badge); b.appendChild(g); } b.onclick = fn; box.appendChild(b);
  };
  if (!mgA) {
    document.getElementById('mg-title').textContent = 'Doppelte Akten';
    var pr = mgPairs(); note(pr.length ? 'Diese Akten sehen nach Doubletten aus (gleicher Name, gleiches Geburtsdatum, gleiche E-Mail oder Telefonnummer). Tippe ein Paar an, um es zu prüfen.' : 'Es wurden keine offensichtlichen Doppelten gefunden. Du kannst eine Akte öffnen und dort im Stift-Menü „Zusammenlegen“ wählen.');
    pr.slice(0, 40).forEach(function (x) { row(mgLine(x.a) + '  ↔  ' + mgLine(x.b), function () { mgA = x.a; mgB = x.b; mgPick = {}; mgRender(); }); });
    return;
  }
  document.getElementById('mg-title').textContent = 'Akten zusammenlegen';
  if (!mgB) {
    note('Mit welcher Akte soll „' + dnP(mgA) + '“ zusammengelegt werden?');
    var q = mk('input', 'form-control'); q.type = 'search'; q.placeholder = 'Name, Geburtsdatum, Telefon …'; q.style.marginBottom = '8px'; box.appendChild(q);
    var lst = mk('div'); box.appendChild(lst);
    var draw = function () {
      var t = String(q.value || '').trim().toLowerCase(); lst.innerHTML = '';
      patients.filter(function (x) { return x !== mgA; }).map(function (x) { return { p: x, r: mgScore(mgA, x) }; })
        .filter(function (x) { return !t || (nameKey(x.p) + ' ' + dnP(x.p) + ' ' + (x.p.dob || '') + ' ' + (x.p.phone || '') + ' ' + (x.p.email || '')).toLowerCase().indexOf(t) >= 0; })
        .sort(function (a, b) { return b.r.s - a.r.s || nameKey(a.p).localeCompare(nameKey(b.p), 'de'); }).slice(0, 30).forEach(function (x) {
          var b = mk('button', 'btn btn-secondary'); b.type = 'button'; b.style.cssText = 'display:flex; width:100%; text-align:left; justify-content:space-between; align-items:center; gap:8px; margin-bottom:6px; font-weight:400;';
          b.appendChild(mk('span', '', mgLine(x.p))); if (x.r.s >= 4 || x.r.strong) b.appendChild(mk('span', 'badge badge-amber', 'wahrscheinlich doppelt')); b.onclick = function () { mgB = x.p; mgPick = {}; mgRender(); }; lst.appendChild(b);
        });
    };
    q.oninput = draw; draw(); return;
  }
  /* Auswahl, welche Akte bleibt, und Abgleich der Angaben */
  if (mgKeepAuto !== mgA.id + ':' + mgB.id) { mgKeep = mgWeight(mgA) >= mgWeight(mgB) ? 'a' : 'b'; mgKeepAuto = mgA.id + ':' + mgB.id; }
  var keep = mgKeep === 'a' ? mgA : mgB, other = keep === mgA ? mgB : mgA;
  note('Alles aus der einen Akte wird in die andere übernommen (Termine, Rechnungen, Dateien, Verlauf, Medikation). Danach wird die übernommene Akte gelöscht.');
  [['a', mgA], ['b', mgB]].forEach(function (x) {
    var c = mgCounts(x[1]), lb = mk('label'); lb.style.cssText = 'display:flex; gap:10px; align-items:flex-start; padding:10px; border:1.5px solid ' + (mgKeep === x[0] ? '#16a34a' : '#cbd5e1') + '; border-radius:10px; margin-bottom:8px; font-weight:400; cursor:pointer;';
    var r = mk('input'); r.type = 'radio'; r.name = 'mg-keep'; r.checked = mgKeep === x[0]; r.style.marginTop = '3px'; r.onchange = function () { mgKeep = x[0]; mgPick = {}; mgRender(); };
    var t = mk('div'); t.appendChild(mk('b', '', (mgKeep === x[0] ? 'Bleibt: ' : 'Wird übernommen: ') + mgLine(x[1])));
    var d = mk('div', '', c.t + ' Termine · ' + c.r + ' Rechnungen · ' + c.d + ' Dateien und Bilder · ' + c.l + ' Verlaufseinträge'); d.style.cssText = 'font-size:12.5px; color:#64748b; margin-top:2px;'; t.appendChild(d);
    lb.appendChild(r); lb.appendChild(t); box.appendChild(lb);
  });
  var conf = MG_FIELDS.filter(function (f) { var a = String(keep[f[0]] || '').trim(), b = String(other[f[0]] || '').trim(); return a && b && a.toLowerCase() !== b.toLowerCase(); });
  if (conf.length) {
    var h = mk('div', 'ak-h', 'Unterschiedliche Angaben'); h.style.marginTop = '8px'; box.appendChild(h); note('Welche Angabe soll gelten?');
    conf.forEach(function (f) {
      var wrap = mk('div'); wrap.style.cssText = 'display:flex; gap:10px; align-items:center; margin-bottom:6px; font-size:13.5px; flex-wrap:wrap;'; wrap.appendChild(Object.assign(mk('span', '', f[1]), { style: 'width:96px; color:#64748b;' }));
      [['keep', keep], ['other', other]].forEach(function (y) {
        var l = mk('label'); l.style.cssText = 'display:flex; gap:5px; align-items:center; font-weight:400; margin:0;'; var r = mk('input'); r.type = 'radio'; r.name = 'mg-f-' + f[0]; r.checked = (mgPick[f[0]] || 'keep') === y[0]; r.onchange = function () { mgPick[f[0]] = y[0]; };
        l.appendChild(r); l.appendChild(document.createTextNode(String(y[1][f[0]]).replace(/\n/g, ', '))); wrap.appendChild(l);
      });
      box.appendChild(wrap);
    });
  }
  var nb = mk('div'); nb.style.cssText = 'font-size:12.5px; color:#b45309; margin-top:10px;'; nb.textContent = 'Das lässt sich nur mit einer Sicherung rückgängig machen. Mach vorher eine Sicherung, wenn Du Dir nicht sicher bist.'; box.appendChild(nb);
  go.style.display = '';
}
var mgKeepAuto = '';
function mgMerge(keep, other, pick) {
  var oldK = nameKey(keep), oldO = nameKey(other), oid = other.id;
  MG_FIELDS.forEach(function (f) { var k = f[0]; if (pick[k] === 'other' && String(other[k] || '').trim()) keep[k] = other[k]; else if (!String(keep[k] || '').trim() && String(other[k] || '').trim()) keep[k] = other[k]; });
  ['allergien', 'diagnosen', 'notizen'].forEach(function (k) {
    var a = String(keep[k] || '').trim(), b = String(other[k] || '').trim();
    if (b && !a) keep[k] = b; else if (a && b && a.toLowerCase().indexOf(b.toLowerCase()) < 0) keep[k] = a + '\n' + b;
  });
  var med = (keep.medikation = keep.medikation || []); (other.medikation || []).forEach(function (m) { if (med.indexOf(m) < 0) med.push(m); });
  ['doku', 'log', 'audit', 'bilder', 'dokumente', 'best'].forEach(function (k) { if ((other[k] || []).length) keep[k] = (keep[k] || []).concat(other[k]); });
  if (other.code) { if (!keep.code) keep.code = other.code; else if (other.code !== keep.code) keep.codes2 = (keep.codes2 || []).concat([other.code]); }
  (other.codes2 || []).forEach(function (c) { keep.codes2 = (keep.codes2 || []).concat([c]); });
  Object.keys(other).forEach(function (k) { if (keep[k] === undefined && other[k] !== undefined && k !== 'id' && k !== 'nr') keep[k] = other[k]; });
  keep.erstellt = Math.min(keep.erstellt || Date.now(), other.erstellt || Date.now());
  var newK = nameKey(keep);
  events.forEach(function (e) { if (String(e.patientId) === String(oid) || String(e.patientId) === String(keep.id) || e.patient === oldO || e.patient === oldK) { e.patientId = keep.id; e.patient = newK; } });
  invoices.forEach(function (i) { if (i.pid === oid) i.pid = keep.id; }); entw.forEach(function (i) { if (i.pid === oid) i.pid = keep.id; });
  todos.forEach(function (t) { if (t.pid === oid) t.pid = keep.id; });
  lager.verbrauch.forEach(function (v) { if (v.pid === oid) v.pid = keep.id; });
  keep.log = (keep.log || []).concat([{ ts: Date.now(), type: 'notiz', text: 'Akte zusammengelegt mit ' + mgLine(other) + (other.email ? ' · ' + other.email : '') + (other.adresse ? ' · ' + String(other.adresse).replace(/\n/g, ', ') : '') }]);
  patients = patients.filter(function (x) { return x !== other; });
}
async function mgDo() {
  var keep = mgKeep === 'a' ? mgA : mgB, other = keep === mgA ? mgB : mgA; if (!keep || !other) return;
  if (!await kaConfirm('„' + dnP(other) + '“ (#' + patNr(other) + ') in „' + dnP(keep) + '“ (#' + patNr(keep) + ') übernehmen und die erste Akte danach löschen?')) return;
  mgMerge(keep, other, mgPick); mgA = mgB = null;
  persist(); closeModal('modal-merge'); try { renderPatients(); renderCal(); } catch (x) {} stammEdit = false; viewAkte(keep);
}
var rxRows = [], rxZu = null, rxEdit = null;
function rxDocOf(lg) {
  var ds = curP.dokumente || [];
  return ds.filter(function (d) { return d.id === lg.docId; })[0] || ds.filter(function (d) { return d.kat === 'Rezept' && Math.abs((d.ts || 0) - lg.ts) < 15000; })[0] || null;
}
function openRx(zu, edit) {
  rxEdit = edit || null; rxZu = zu || null;
  rxRows = (curP.medikation || []).map(function (m) { return { on: false, text: m, neu: false }; });
  var dat = iso(new Date());
  if (edit) {
    var od = rxDocOf(edit); if (od && od.zu) rxZu = od.zu; if (!edit.items && !String(edit.text || '').trim() && od) { var mm = /(\d{2})\.(\d{2})\.(\d{4})/.exec(od.name || ''); if (mm) edit.datum = mm[3] + '-' + mm[2] + '-' + mm[1]; }
    (edit.items || String(edit.text || '').replace(/^Rezept erstellt:\s*/, '').split(/;\s*/)).filter(Boolean).forEach(function (t) { var r = rxRows.filter(function (x) { return x.text === t; })[0]; if (r) r.on = true; else rxRows.push({ on: true, text: t, neu: true }); });
    dat = edit.datum || iso(new Date(edit.ts));
  }
  document.getElementById('rx-title').textContent = (edit ? 'Rezept bearbeiten · ' : 'Rezept · ') + dnP(curP);
  document.getElementById('rx-datum').value = dat;
  document.getElementById('rx-new').value = '';
  var o = settings.rx || {}; document.getElementById('rx-dx').value = o.dx || 0; document.getElementById('rx-dy').value = o.dy || 0;
  document.getElementById('rx-label').checked = o.label !== false;
  rxRender(); openModal('modal-rx');
}
function rxRender() {
  var box = document.getElementById('rx-list'); box.innerHTML = '';
  if (!rxRows.length) box.appendChild(mk('div', 'hm-empty', 'Noch keine Medikamente in der Akte. Unten ein neues eintragen.'));
  rxRows.forEach(function (r, i) {
    var row = mk('div'); row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-bottom:6px;';
    var c = mk('input', 'td-chk'); c.type = 'checkbox'; c.checked = r.on; c.onchange = function () { r.on = c.checked; };
    var t = mk('input', 'form-control'); t.type = 'text'; t.value = r.text; t.oninput = function () { r.text = t.value; if (t.value.trim() && !c.checked) { c.checked = true; r.on = true; } };
    row.appendChild(c); row.appendChild(t);
    if (r.neu) { var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.onclick = function () { rxRows.splice(i, 1); rxRender(); }; row.appendChild(x); }
    box.appendChild(row);
  });
}
function rxAdd() {
  var inp = document.getElementById('rx-new'), v = inp.value.trim(); if (!v) return;
  rxRows.push({ on: true, text: v, neu: true }); inp.value = ''; rxRender(); inp.focus();
}
function rxSafe(t) { return String(t == null ? '' : t).replace(/[^\x20-\x7E\u00A0-\u00FF\u20AC]/g, '?'); }
async function rxMake() {
  var p = curP; if (!p) return;
  var inp = document.getElementById('rx-new'); if (inp.value.trim()) rxAdd();
  var sel = rxRows.filter(function (r) { return r.on && r.text.trim(); });
  if (!sel.length) { alert('Bitte mindestens ein Medikament anhaken oder eintragen.'); return; }
  if (sel.length > 6 && !await kaConfirm('Auf ein A6-Rezept passen etwa 6 Zeilen. Trotzdem erstellen?')) return;
  var datum = document.getElementById('rx-datum').value || iso(new Date()), label = document.getElementById('rx-label').checked;
  var dx = parseFloat(document.getElementById('rx-dx').value) || 0, dy = parseFloat(document.getElementById('rx-dy').value) || 0;
  settings.rx = { dx: dx, dy: dy, label: label };
  var btn = document.getElementById('rx-go'); btn.disabled = true;
  try {
    var L = await loadPdfLib(), MM = 72 / 25.4, W = 148 * MM, H = 105 * MM;
    var doc = await L.PDFDocument.create(), page = doc.addPage([W, H]);
    var f = await doc.embedFont(L.StandardFonts.Helvetica), fb = await doc.embedFont(L.StandardFonts.HelveticaBold);
    var X = function (mm) { return (mm + dx) * MM; }, Y = function (mm) { return H - (mm + dy) * MM; };
    var txt = function (t, x, y, sz, bold) { page.drawText(rxSafe(t), { x: X(x), y: Y(y), size: sz, font: bold ? fb : f, color: L.rgb(0, 0, 0) }); };
    var wrap = function (t, font, sz, maxW) {
      var out = [], line = '';
      rxSafe(t).split(/\s+/).forEach(function (w) { var c = line ? line + ' ' + w : w; if (line && font.widthOfTextAtSize(c, sz) > maxW * MM) { out.push(line); line = w; } else line = c; });
      if (line) out.push(line); return out;
    };
    txt('Privat', 11, 13.3, 10);
    txt(p.nachname + ', ' + p.vorname, 11, 22.5, 10);
    var ad = (p.adresse || '').split(/\r?\n/).filter(Boolean).slice(0, 2); ad.forEach(function (l, i) { txt(l, 11, 27 + i * 4.2, 10); });
    if (p.dob) txt(p.dob, 68, 27.5, 10);
    var dp = datum.split('-'); txt(dp[2] + '.' + dp[1] + '.' + dp[0], 68, 49.5, 10);
    var my = 61.5;
    sel.forEach(function (r) { wrap(r.text.trim(), f, 10.5, 84).forEach(function (l) { txt(l, 11, my, 10.5); my += 4.4; }); my += 2; });
    if (label) {
      var kp = PRAXIS.kopf.split(' - '), st = [[kp[0], 1, 10]].concat(kp[1] ? [[kp[1], 1, 10]] : [], [[PRAXIS.titel, 0, 8.5], [PRAXIS.strasse, 0, 9], [PRAXIS.ort, 0, 9], ['Tel. ' + PRAXIS.tel, 0, 9]]), sy = 59;
      st.forEach(function (e) {
        var fo = e[1] ? fb : f; wrap(e[0], fo, e[2], 40).forEach(function (l) {
          var wd = fo.widthOfTextAtSize(l, e[2]) / MM; page.drawText(l, { x: X(121.5 - wd / 2), y: Y(sy), size: e[2], font: fo, color: L.rgb(0, 0, 0) }); sy += e[2] * 0.4;
        });
        sy += 1.2;
      });
    }
    var bytes = await doc.save(), blob = new Blob([bytes], { type: 'application/pdf' });
    var name = 'Rezept ' + dp[2] + '.' + dp[1] + '.' + dp[0] + '.pdf', id = newId();
    var ok = await fPut(id, name, blob); if (!ok) throw new Error('save');
    var oldDoc = rxEdit ? rxDocOf(rxEdit) : null;
    if (oldDoc) { try { await fDel(oldDoc.id); } catch (x) {} p.dokumente = p.dokumente.filter(function (d) { return d !== oldDoc; }); }
    var rxRec = { id: id, ts: oldDoc ? oldDoc.ts : Date.now(), name: name, kat: 'Rezept', zu: rxZu || undefined };
    p.dokumente = (p.dokumente || []).concat([rxRec]);
    auditFileChange(p, rxRec, auditFileState(oldDoc), 'Dokumente');
    rxRows.forEach(function (r) { if (r.on && r.neu && document.getElementById('rx-merk').checked && (p.medikation || []).indexOf(r.text.trim()) < 0) { p.medikation = (p.medikation || []).concat([r.text.trim()]); } });
    var items = sel.map(function (r) { return r.text.trim(); }), rtext = 'Rezept erstellt: ' + items.join('; ');
    if (rxEdit) { rxEdit.text = rtext; rxEdit.items = items; rxEdit.docId = id; rxEdit.datum = datum; if (rxEdit._tmp) { delete rxEdit._tmp; p.log = (p.log || []).concat([rxEdit]); } }
    else p.log = (p.log || []).concat([{ ts: Date.now(), type: 'rezept', text: rtext, items: items, docId: id, datum: datum }]);
    rxEdit = null;
    persist(); closeModal('modal-rx'); renderHead(); renderVerlauf();
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  } catch (x) { alert('Das Rezept konnte nicht erstellt werden.'); }
  btn.disabled = false;
}

/* Medikament hinzufügen (Kachel Medikation) */
function addMed() {
  var inp = document.getElementById('a-med-in'), v = inp.value.trim();
  if (!v) return;
  curP.medikation = (curP.medikation || []).concat([v]);
  auditOne(curP, 'Medikation', 'Medikament', '[nicht vorhanden]', v);
  logAdd('med', v); persist(); renderHead(); renderVerlauf(); document.getElementById('a-med-in').focus();
}

/* Zeitleiste: ALLE Einträge chronologisch */
function fmtTermin(e) { var d = e.date.split('-'); return d[2] + '.' + d[1] + '.' + d[0] + ' ' + e.time; }
function docBox(id, text, placeholder, label, onSave, onCancel, rerender) {
  var dk = document.createElement('div');
  dk.style.cssText = 'font-size:13px; margin:4px 0 0; padding:6px 8px; background:#f8fafc; border-radius:6px; white-space:pre-wrap;';
  if (editingDokuId === id) {
    dk.className = 'ed-box'; dk.style.whiteSpace = 'normal';
    var ta = mk('textarea', 'form-control'); ta.rows = 3; ta.id = 'doku-in';
    ta.value = text || ''; ta.placeholder = placeholder;
    var row = document.createElement('div'); row.className = 'foot-bar'; row.style.cssText = 'margin-top:12px; padding-top:12px;';
    var cancel = mk('button', 'btn btn-cancel', 'Abbrechen'); cancel.type = 'button';
    cancel.onclick = function () { if (onCancel) onCancel(); editingDokuId = null; rerender(); };
    var save = mk('button', 'btn btn-save', 'Speichern'); save.type = 'button';
    save.onclick = function () {
      var t = document.getElementById('doku-in').value.trim();
      if (!t) { alert('Bitte Text eingeben.'); return; }
      onSave(t); editingDokuId = null; persist(); rerender();
    };
    row.appendChild(cancel); row.appendChild(save); dk.appendChild(ta); var tpk = tbPicker(ta); if (tpk) dk.appendChild(tpk); dk.appendChild(row);
  } else {
    dk.style.cursor = 'pointer';
    if (text) { dk.style.color = '#0f172a'; dk.textContent = text; }
    else { dk.style.color = '#94a3b8'; dk.textContent = label; }
    dk.onclick = function () { editingDokuId = id; rerender(); };
  }
  return dk;
}
function tlMenu(ev, items) {
  ev.stopPropagation();
  var m = document.getElementById('tl-menu');
  if (!m) { m = mk('div', 'a-menu'); m.id = 'tl-menu'; document.body.appendChild(m); }
  if (m.style.display === 'block' && m._src === ev.currentTarget) { m.style.display = 'none'; return; }
  m.innerHTML = ''; m._src = ev.currentTarget;
  items.forEach(function (it) { var b = mk('button', '', it[0]); b.type = 'button'; b.onclick = function () { m.style.display = 'none'; it[1](); }; m.appendChild(b); });
  var r = ev.currentTarget.getBoundingClientRect(); m.style.right = 'auto'; m.style.width = 'max-content'; m.style.display = 'block'; m.style.position = 'fixed';
  m.style.left = Math.max(8, Math.min(r.right - m.offsetWidth, window.innerWidth - m.offsetWidth - 8)) + 'px';
  var top = r.bottom + 4; if (top + m.offsetHeight > window.innerHeight - 8) top = Math.max(8, r.top - m.offsetHeight - 4);
  m.style.top = top + 'px'; m.style.right = 'auto';
}
function tlPlus(sh, items) {
  var b = mk('button', 'tl-plus'); b.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'; b.type = 'button'; b.title = 'Weitere Aktionen'; b.setAttribute('aria-label', 'Weitere Aktionen');
  sh.actions = items;
  b.onclick = function (ev) { tlMenu(ev, sh.actions); }; sh.row.appendChild(b);
}
function attItems(key) { return [['Bilder hinzufügen', function () { zuNext = key; document.getElementById('a-img-in').click(); }], ['Dokument hinzufügen', function () { zuNext = key; document.getElementById('a-doc-in').click(); }]]; }
function attMove(key) {
  var l = (curP.bilder || []).concat(curP.dokumente || []).filter(function (x) { return x.zu === key; });
  return l.length ? [['Zuordnung ändern', function () { openZu(curP, l); }]] : [];
}
function invFromEvent(e) {
  openInvoice(curP); var sel = document.getElementById('inv-termin'); sel.value = String(e.id); invTerminChanged();
}
function showInCal(e) {
  cur = new Date(e.date + 'T12:00:00'); view = 'tag'; switchTab('kalender'); renderCal();
}
function tlShell(ts, label) {
  var d = new Date(ts);
  var row = mk('div', 'tl-item');
  var left = mk('div', 'tl-date');
  left.appendChild(mk('b', '', WD[(d.getDay() + 6) % 7].toUpperCase() + ', ' + pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + String(d.getFullYear()).slice(2)));
  left.appendChild(mk('span', '', pad(d.getHours()) + ':' + pad(d.getMinutes())));
  var body = mk('div', 'tl-body'); body.appendChild(mk('div', 'tl-label', label));
  row.appendChild(left); row.appendChild(body);
  return { row: row, body: body };
}
function xBtn(fn) { var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.title = 'Löschen'; x.style.cssText += 'float:right;'; x.onclick = fn; return x; }
/* Dokumentation mit einem Termin verknüpfen */
var dkpDoc = null;
function newFreeDoku() {
  var d = { ts: Date.now(), text: '' };
  curP.doku = (curP.doku || []).concat([d]);
  renderVerlauf(); openDokFree(d);
}
function openDkPick(doc) {
  dkpDoc = doc || null;
  var evs = events.filter(function (e) { return eventBelongs(e, curP); }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); });
  if (!doc && !evs.length) { newFreeDoku(); return; }
  if (doc && !evs.length) { alert('Für diesen Patienten gibt es noch keinen Termin, mit dem die Dokumentation verknüpft werden kann.'); return; }
  var sel = document.getElementById('dkp-sel'); sel.innerHTML = ''; var today = iso(new Date()), pre = null;
  evs.forEach(function (e) { var o = mk('option', '', fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '') + (dokFilled(e) ? ' · mit Dokumentation' : '')); o.value = String(e.id); sel.appendChild(o); if (!pre && e.date <= today) pre = String(e.id); });
  if (!doc) { var o2 = mk('option', '', 'Ohne Termin (freie Dokumentation)'); o2.value = ''; sel.appendChild(o2); }
  sel.value = pre || String(evs[evs.length - 1].id);
  document.getElementById('dkp-title').textContent = doc ? 'Dokumentation mit Termin verknüpfen' : 'Dokumentation zu einem Termin';
  document.getElementById('dkp-info').textContent = doc ? 'Der Text und die Anhänge dieser Dokumentation wandern in die Dokumentation des gewählten Termins.' : 'Vorgewählt ist der letzte Termin bis heute.';
  document.getElementById('dkp-go').textContent = doc ? 'Verknüpfen' : 'Weiter';
  openModal('modal-dkp');
}
function dkpGo() {
  var v = document.getElementById('dkp-sel').value; closeModal('modal-dkp');
  if (dkpDoc) { linkDokuToTermin(dkpDoc, parseInt(v, 10)); return; }
  if (v === '') newFreeDoku(); else openDok(parseInt(v, 10));
}
function linkDokuToTermin(d, eid) {
  var e = events.filter(function (x) { return x.id === eid; })[0]; if (!e) return;
  var o = dokOf(e); e.dok = Object.assign({}, o, { verw: Object.assign({}, o.verw || {}) });
  var add = String(d.text || '').trim();
  if (add) e.dok.behandlung = (e.dok.behandlung ? e.dok.behandlung + '\n\n' : '') + add;
  e.doku = dokuText(e);
  [curP.bilder, curP.dokumente].forEach(function (l) { (l || []).forEach(function (x) { if (x.zu === 'd' + d.ts) x.zu = 'e' + e.id; }); });
  curP.doku = (curP.doku || []).filter(function (y) { return y !== d; });
  persist(); renderVerlauf();
}
var tlEditLog = null;
function tlRow(it) {
  var sh, line;
  if (it.t === 'termin') {
    var e = it.e;
    sh = tlShell(it.k, 'Termin · ' + fmtTermin(e));
    sh.body.appendChild(dokSummary(e));
    sh.body.appendChild(attachBlock(curP, 'e' + e.id));
    tlPlus(sh, [['Dokumentation', function () { openDok(e.id); }], ['Termin bearbeiten', function () { editTermin(e.id, true); }], ['Im Kalender anzeigen', function () { showInCal(e); }]]
      .concat(attItems('e' + e.id), [['Produkt verwenden', function () { openVb(e.id); }], ['Rezept erstellen', function () { openRx('e' + e.id); }], ['Rechnung erstellen', function () { invFromEvent(e); }], ['E-Mail senden', function () { openMail(); }]], attMove('e' + e.id)));
  } else if (it.t === 'verbrauch') {
    var vb = it.v;
    sh = tlShell(it.k, 'Produkt');
    var ev0 = vb.eid ? events.filter(function (x) { return x.id === vb.eid; })[0] : null;
    tlPlus(sh, [['Bearbeiten', function () { openVbEdit(vb); }]]);
    sh.body.appendChild(mk('div', '', vb.name + ': ' + qty(vb.menge) + ' ' + (vb.einheit || '') + ' · Charge ' + (vb.nr || '-') + (vb.verfall ? ' · verwendbar bis ' + fmtD(vb.verfall) : '') + (ev0 ? ' · Termin ' + fmtTermin(ev0) : '')));
  } else if (it.t === 'doku') {
    var d = it.d;
    sh = tlShell(it.k, 'Dokumentation');
    var dtb = mk('div'); dtb.style.cssText = 'font-size:13px; margin:4px 0 0; padding:6px 8px; background:#f8fafc; border-radius:6px; white-space:pre-wrap; cursor:pointer;';
    if (d.text) { dtb.style.color = '#0f172a'; dtb.textContent = d.text; } else { dtb.style.color = '#94a3b8'; dtb.textContent = 'Dokumentation hinzufügen'; }
    dtb.onclick = function () { openDokFree(d); }; sh.body.appendChild(dtb);
    sh.body.appendChild(attachBlock(curP, 'd' + d.ts));
    tlPlus(sh, [['Mit Termin verknüpfen', function () { openDkPick(d); }], ['Datum und Uhrzeit ändern', function () {
      askDateTime(d.ts, function (t) { var oldTs = d.ts, oz = 'd' + d.ts, nz = 'd' + t; [curP.bilder, curP.dokumente].forEach(function (l) { (l || []).forEach(function (x) { if (x.zu === oz) x.zu = nz; }); }); d.ts = t; auditOne(curP, 'Dokumentation', 'Zeitpunkt', fmtDT(oldTs), fmtDT(t)); persist(); renderVerlauf(); });
    }]].concat(attItems('d' + d.ts), attMove('d' + d.ts)));
  } else if (it.t === 'rechnung') {
    var iv = it.inv;
    sh = tlShell(it.k, 'Rechnung');
    line = mk('div', '', iv.nr + ' · ' + eur(iv.total) + ' · ' + invState(iv).txt.toLowerCase());
    line.style.cssText = 'font-weight:600; cursor:pointer;';
    line.onclick = function () { viewInvoice(iv.id); };
    sh.body.appendChild(line);
  } else if (it.t === 'audit') {
    var au = it.a;
    sh = tlShell(it.k, 'Änderungshistorie');
    var ah = mk('div', '', au.area || 'Patientenakte'); ah.style.fontWeight = '600'; sh.body.appendChild(ah);
    (au.changes || []).forEach(function (c) {
      var w = mk('div'); w.style.cssText = 'margin-top:7px; padding-top:7px; border-top:1px solid #e2e8f0;';
      var f = mk('div', '', c.field || 'Wert'); f.style.cssText = 'font-size:12px; font-weight:600; color:#475569; margin-bottom:3px;'; w.appendChild(f);
      var o = mk('div', '', 'Vorher: ' + (String(c.from || '').trim() || '[leer]')); o.style.cssText = 'white-space:pre-wrap; color:#64748b;'; w.appendChild(o);
      var n = mk('div', '', 'Danach: ' + (String(c.to || '').trim() || '[leer]')); n.style.cssText = 'white-space:pre-wrap; color:#0f172a; margin-top:2px;'; w.appendChild(n);
      sh.body.appendChild(w);
    });
  } else if (it.t === 'hiddenfile') {
    sh = tlShell(it.k, 'Ausgeblendete Datei');
    var fileOwner = curP;
    if (it.kind === 'bild') sh.body.firstChild.appendChild(restoreVisibilityButton(function () { fileHide(fileOwner, it.file); }));
    if (it.kind === 'bild') sh.body.appendChild(mediaGrid(curP, [it.file]));
    else sh.body.appendChild(docList(curP, [it.file]));
  } else if (it.t === 'angelegt') {
    sh = tlShell(it.k, 'Patient'); sh.body.appendChild(mk('div', '', 'Patient angelegt'));
  } else {
    var lab = it.t === 'med' ? 'Medikament' : it.t === 'mail' ? 'E-Mail' : it.t === 'rezept' ? 'Rezept' : 'Notiz';
    sh = tlShell(it.k, lab);
    if (it.t === 'med') { var ml = sh.body.firstChild; ml.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-3px"><rect x="2" y="7.5" width="20" height="9" rx="4.5"/><path d="M12 7.5v9"/><path d="M5.5 11v2" stroke-width="1.5"/></svg>'; ml.title = 'Medikament'; ml.setAttribute('aria-label', 'Medikament'); }
    var lg = it.l;
    if (tlEditLog === lg) {
      var ta = mk('textarea', 'form-control'); ta.rows = 4; ta.value = lg.text; sh.body.appendChild(ta);
      var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';
      var cb = mk('button', 'btn btn-cancel', 'Abbrechen'); cb.type = 'button'; cb.onclick = function () { tlEditLog = null; renderVerlauf(); };
      var sv = mk('button', 'btn btn-save', 'Speichern'); sv.type = 'button';
      sv.onclick = function () { var v = ta.value.trim(); if (!v) { alert('Der Text darf nicht leer sein. Zum Verbergen bitte „Ausblenden“ wählen.'); return; } var oldText = lg.text; lg.text = v; if (v !== oldText) auditOne(curP, 'Verlaufseintrag', 'Text', oldText, v); tlEditLog = null; persist(); renderVerlauf(); };
      fb.appendChild(cb); fb.appendChild(sv); sh.body.appendChild(fb);
    } else {
      var tx = mk('div', '', it.t === 'med' ? String(lg.text).replace(/^Medikament hinzugefügt:\s*/, '') : lg.text);
      tx.style.whiteSpace = 'pre-wrap'; sh.body.appendChild(tx);
      tlPlus(sh, [['Bearbeiten', function () { if (it.t === 'rezept') openRx(null, lg); else { tlEditLog = lg; renderVerlauf(); } }], ['Datum und Uhrzeit ändern', function () { askDateTime(lg.ts, function (t) { var oldTs = lg.ts; lg.ts = t; auditOne(curP, 'Verlaufseintrag', 'Zeitpunkt', fmtDT(oldTs), fmtDT(t)); persist(); renderVerlauf(); }); }]]);
    }
  }
  var rec = it.e || it.d || it.l || it.inv || it.v;
  if (rec) {
    var owner = curP, area = { termin:'Termin', doku:'Dokumentation', rechnung:'Rechnung', verbrauch:'Produktbuchung', notiz:'Notiz' }[it.t] || 'Verlaufseintrag';
    var label = rec.nr || rec.name || rec.id || fmtDT(it.k);
    if (rec.hiddenFromView) {
      sh.body.firstChild.appendChild(fileHiddenBadge(rec));
      sh.body.firstChild.appendChild(restoreVisibilityButton(function () { setRecordHidden(owner, rec, false, area, label); }));
      sh.row.style.opacity = '0.65';
    }
    if (!sh.actions) tlPlus(sh, []);
    sh.actions.push([rec.hiddenFromView ? 'Wieder einblenden' : 'Ausblenden', function () { setRecordHidden(owner, rec, !rec.hiddenFromView, area, label); }]);
  }
  sh.row.className += ' tl-' + it.t;
  return sh.row;
}
var tlAuditPatient = null, tlAuditVisible = false;
function renderVerlauf() {
  if (tlAuditPatient !== curP.id) { tlAuditPatient = curP.id; tlAuditVisible = false; }
  renderFin(); renderUnterlagen(); renderMedien();
  var name = nameKey(curP), box = document.getElementById('a-verlauf'), items = [];
  events.forEach(function (e) { if (eventBelongs(e, curP)) items.push({ k: new Date(e.date + 'T' + e.time).getTime() || 0, t: 'termin', e: e }); });
  (curP.doku || []).forEach(function (d) { items.push({ k: d.ts, t: 'doku', d: d }); });
  (curP.log || []).forEach(function (l) { if (!(l.type === 'mail' && /^E-Mail-Fenster/.test(l.text))) items.push({ k: l.ts, t: l.type, l: l }); });
  if (tlAuditVisible) (curP.audit || []).forEach(function (a) { items.push({ k: a.ts, t: 'audit', a: a }); });
  invoices.forEach(function (i) { if (i.pid === curP.id) items.push({ k: i.created, t: 'rechnung', inv: i }); });
  lager.verbrauch.forEach(function (v) { if (v.pid === curP.id) items.push({ k: v.ts, t: 'verbrauch', v: v }); });
  if (tlAuditVisible) {
    [['bild', curP.bilder || []], ['dok', curP.dokumente || []]].forEach(function (pair) {
      pair[1].filter(function (f) { return f.hiddenFromView; }).forEach(function (f) { items.push({ k: tsOf(f), t: 'hiddenfile', kind: pair[0], file: f }); });
    });
  }
  items = items.filter(function (it) { var r = it.e || it.d || it.l || it.inv || it.v; return !r || recordVisible(r); });
  if (curP.erstellt) items.push({ k: curP.erstellt, t: 'angelegt' });
  var dkey = function (k) { var d = new Date(k); return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate(); };
  items.sort(function (a, b) { return dkey(b.k) - dkey(a.k) || b.k - a.k; });
  box.innerHTML = '';
  var auditFilter = mk('label');
  auditFilter.style.cssText = 'display:inline-flex;align-items:center;margin:0;cursor:pointer;';
  auditFilter.title = 'Änderungshistorie und ausgeblendete Einträge anzeigen';
  var auditCheck = mk('input'); auditCheck.type = 'checkbox'; auditCheck.checked = tlAuditVisible;
  auditCheck.title = 'Änderungshistorie und ausgeblendete Einträge anzeigen';
  auditCheck.setAttribute('aria-label', 'Änderungshistorie und ausgeblendete Einträge anzeigen');
  auditCheck.onchange = function () { tlAuditVisible = auditCheck.checked; renderVerlauf(); };
  auditFilter.appendChild(auditCheck);
  var auditSlot = document.getElementById('a-audit-filter');
  auditSlot.innerHTML = ''; auditSlot.appendChild(auditFilter);
  /* Eine Karte für die ganze Zeitleiste: durchgehender Strich, links Datum (beim ersten Eintrag eines Tages) und Uhrzeit, rechts das Ereignis */
  var day = null, card = mk('div', 'tl-day tl-all'); box.appendChild(card);
  items.forEach(function (it) {
    var d = new Date(it.k), key = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(), neuerTag = key !== day; day = key;
    var row = tlRow(it); if (neuerTag) row.classList.add('tl-dstart');
    var bd = row.querySelector('.tl-body'), kids = bd ? [].slice.call(bd.children) : [];
    var first = kids.filter(function (c) { return !c.classList.contains('tl-label') && !c.classList.contains('x-btn'); })[0];
    if (first) first.classList.add('tl-first');
    var always = it.t === 'termin' || it.t === 'doku';
    if (always) row.classList.add('open');
    if (bd && !always) bd.addEventListener('click', function (ev) { if (ev.target.closest('button, a, input, textarea, select, .docbox, img')) return; row.classList.toggle('open'); });
    card.appendChild(row);
  });
}

/* Bilder und Dokumente hinzufügen */
function readFileURL(f) {
  return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { res(null); }; r.readAsDataURL(f); });
}
function readImg(f) {
  return readFileURL(f).then(function (url) {
    if (!url) return null;
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () {
        var sc = Math.min(1, 2000 / Math.max(im.width, im.height));
        var c = document.createElement('canvas');
        c.width = Math.round(im.width * sc); c.height = Math.round(im.height * sc);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        c.toBlob(function (b) { res(b); }, 'image/jpeg', 0.85);
      };
      im.onerror = function () { res(null); };
      im.src = url;
    });
  });
}
function addImages(inp) {
  var files = [].slice.call(inp.files || []); inp.value = '';
  var zu = zuNext; zuNext = null;
  if (!files.length) return;
  var p = curP, base = Date.now();
  Promise.all(files.map(function (f, i) {
    return readImg(f).then(function (b) { if (!b) return null; var id = newId(); return fPut(id, f.name, b).then(function (ok) { return ok ? { id: id, ts: base + i, name: f.name, zu: zu || undefined } : null; }); });
  })).then(function (res) {
    var ok = res.filter(Boolean);
    p.bilder = (p.bilder || []).concat(ok);
    auditFilesAdded(p, ok, 'Bilder');
    persist(); if (curP === p) renderVerlauf();
    if (ok.length < files.length) alert((files.length - ok.length) + ' Bild(er) konnten nicht gespeichert werden.');
  });
}
function addDocs(inp, key) {
  var files = [].slice.call(inp.files || []); inp.value = '';
  var zu = zuNext; zuNext = null;
  if (!files.length) return;
  var p = curP, skipped = 0, base = Date.now();
  Promise.all(files.map(function (f, i) {
    if (f.size > 31457280) { skipped++; return Promise.resolve(null); }
    var id = newId();
    return fPut(id, f.name, f).then(function (ok) { if (!ok) { skipped++; return null; } return { id: id, ts: base + i, name: f.name, zu: key === 'templates' ? undefined : (zu || undefined), kat: katGuess(f.name) }; });
  })).then(function (res) {
    var ok = res.filter(Boolean);
    if (key === 'templates') templates = templates.concat(ok);
    else { p.dokumente = (p.dokumente || []).concat(ok); auditFilesAdded(p, ok, 'Dokumente'); dokPick = false; }
    persist(); if (curP === p) { renderPick(); renderVerlauf(); }
    if (skipped) alert(skipped + ' Datei(en) sind größer als 30 MB oder konnten nicht gespeichert werden.');
  });
}
