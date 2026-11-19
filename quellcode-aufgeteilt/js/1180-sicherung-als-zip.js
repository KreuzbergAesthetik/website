/* ===== Sicherung als ZIP: streamt die Dateien, teilt große Mengen in mehrere Teile und verschlüsselt immer ===== */
var BK_PART = 400 * 1048576, CRC_T = null, bkParts = [];
function crcTab() { if (!CRC_T) { CRC_T = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); CRC_T[n] = c >>> 0; } } return CRC_T; }
function crcBytes(u, c) { var T = crcTab(); for (var i = 0; i < u.length; i++) c = T[(c ^ u[i]) & 255] ^ (c >>> 8); return c; }
async function crcBlob(blob) { var c = 0xFFFFFFFF, rd = blob.stream().getReader(); for (;;) { var x = await rd.read(); if (x.done) break; c = crcBytes(x.value, c); } return (c ^ 0xFFFFFFFF) >>> 0; }
function ZipPart() { this.body = []; this.ents = []; this.off = 0; }
ZipPart.prototype.add = function (name, blob, crc) {
  var nb = new TextEncoder().encode(name), h = new DataView(new ArrayBuffer(30)), d = new Date();
  var dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, tm, true); h.setUint16(12, dt, true);
  h.setUint32(14, crc, true); h.setUint32(18, blob.size, true); h.setUint32(22, blob.size, true); h.setUint16(26, nb.length, true); h.setUint16(28, 0, true);
  this.ents.push({ nb: nb, crc: crc, size: blob.size, off: this.off, tm: tm, dt: dt });
  this.body.push(new Uint8Array(h.buffer), nb, blob); this.off += 30 + nb.length + blob.size;
};
ZipPart.prototype.finish = function () {
  var cd = [], cdSize = 0;
  this.ents.forEach(function (e) {
    var h = new DataView(new ArrayBuffer(46));
    h.setUint32(0, 0x02014b50, true); h.setUint16(4, 20, true); h.setUint16(6, 20, true); h.setUint16(8, 0x0800, true); h.setUint16(10, 0, true); h.setUint16(12, e.tm, true); h.setUint16(14, e.dt, true);
    h.setUint32(16, e.crc, true); h.setUint32(20, e.size, true); h.setUint32(24, e.size, true); h.setUint16(28, e.nb.length, true); h.setUint32(42, e.off, true);
    cd.push(new Uint8Array(h.buffer), e.nb); cdSize += 46 + e.nb.length;
  });
  var t = new DataView(new ArrayBuffer(22)); t.setUint32(0, 0x06054b50, true); t.setUint16(8, this.ents.length, true); t.setUint16(10, this.ents.length, true); t.setUint32(12, cdSize, true); t.setUint32(16, this.off, true);
  return new Blob(this.body.concat(cd, [new Uint8Array(t.buffer)]), { type: 'application/zip' });
};
async function encEntry(key, u8) { var iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, u8)), out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return out; }
async function decEntry(key, u8) { return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u8.subarray(0, 12) }, key, u8.subarray(12))); }
function progOpen(title) { document.getElementById('pg-title').textContent = title; document.getElementById('pg-bar').style.width = '0'; document.getElementById('pg-status').textContent = ''; document.getElementById('pg-parts').innerHTML = ''; document.getElementById('pg-close').style.display = 'none'; openModal('modal-prog'); }
function progSet(pct, text) { document.getElementById('pg-bar').style.width = Math.max(0, Math.min(100, pct)) + '%'; if (text !== undefined) document.getElementById('pg-status').textContent = text; }
var bkOpen = 0;
async function progClose(force) {
  if (!force && bkOpen > 0 && !await kaConfirm('Es wurden noch nicht alle Teile der Sicherung gespeichert. Ohne alle Teile ist die Sicherung unvollständig.\n\nTrotzdem schließen?')) return;
  bkOpen = 0; closeModal('modal-prog');
}
async function doExport() {
  var pw = document.getElementById('bk-pw').value;
  if (pw.length < 12) { alert('Das Backup-Passwort braucht mindestens 12 Zeichen.'); return; }
  if (pw !== document.getElementById('bk-pw2').value) { alert('Die beiden Passwörter stimmen nicht überein.'); return; }
  if (!(window.crypto && crypto.subtle)) { alert('Verschlüsseln ist in dieser Ansicht nicht verfügbar.'); return; }
  closeModal('modal-bk'); progOpen('Sicherung wird erstellt');
  try {
    var files = await fAll(), salt = crypto.getRandomValues(new Uint8Array(16)), key = await bkKey(pw, salt, BK_ITER), sid = newId(), parts = [new ZipPart()], meta = [], now = new Date();
    for (var i = 0; i < files.length; i++) {
      var f = files[i], name = 'dateien/' + f.id + '.enc';
      progSet(files.length ? (i / files.length) * 88 : 88, 'Datei ' + (i + 1) + ' von ' + files.length + ' wird verschlüsselt');
      var raw = new Uint8Array(await f.blob.arrayBuffer()), hash = await sha256Hex(raw), e = await encEntry(key, raw), eb = new Blob([e]), crc = (crcBytes(e, 0xFFFFFFFF) ^ 0xFFFFFFFF) >>> 0;
      var part = parts[parts.length - 1];
      if (part.ents.length && part.off + eb.size > BK_PART) { part = new ZipPart(); parts.push(part); }
      part.add(name, eb, crc);
      meta.push({ id: f.id, name: f.name, type: f.type || '', size: raw.byteLength, teil: parts.length, sha256: hash });
      if (i % 20 === 19) await new Promise(function (r) { setTimeout(r, 0); });
    }
    progSet(90, 'Daten und Prüfsummen werden geschrieben...');
    var data = { format: 'ka-sicherung', version: 4, id: sid, exportiert: now.toISOString(), events: events, patients: patients, templates: templates, invoices: invoices, settings: settings, lager: lager, ausgaben: ausgaben, entw: entw, todos: todos, dateien: meta };
    data.integrity = { alg: 'SHA-256', state: await backupStateHash(data) };
    var jb = new TextEncoder().encode(JSON.stringify(data));
    jb = await encEntry(key, jb);
    parts[0].add('daten.json.enc', new Blob([jb]), (crcBytes(jb, 0xFFFFFFFF) ^ 0xFFFFFFFF) >>> 0);
    var pruef = toB64(await encEntry(key, new TextEncoder().encode('ka-ok')));
    var blobs = parts.map(function (pt, idx) {
      var info = new TextEncoder().encode(JSON.stringify({ format: 'ka-sicherung-teil', sicherung: sid, teil: idx + 1, von: parts.length, exportiert: now.toISOString(), verschluesselt: true, iter: BK_ITER, salt: toB64(salt), pruefung: pruef, integritaet: 'SHA-256' }));
      pt.add('info.json', new Blob([info]), (crcBytes(info, 0xFFFFFFFF) ^ 0xFFFFFFFF) >>> 0);
      return pt.finish();
    });
    progSet(100, 'Fertig. Bitte jetzt alle Teile speichern.');
    var base = 'kreuzberg-aesthetik-sicherung-' + iso(now), box = document.getElementById('pg-parts'), got = 0, total = blobs.length;
    box.innerHTML = ''; bkParts = blobs; bkOpen = total;
    blobs.forEach(function (bl, idx) {
      var nm = base + (total > 1 ? '-teil-' + (idx + 1) + '-von-' + total : '') + '-verschluesselt.zip';
      var row = mk('div'); row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid #f1f5f9;';
      row.appendChild(mk('span', '', (total > 1 ? 'Teil ' + (idx + 1) + ' von ' + total + ' · ' : '') + Math.round(bl.size / 1048576) + ' MB'));
      var b = mk('button', 'btn btn-save btn-sm', 'Speichern'); b.type = 'button';
      b.onclick = function () {
        var a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = nm; document.body.appendChild(a); a.click(); a.remove();
        if (!b.getAttribute('data-ok')) { b.setAttribute('data-ok', '1'); b.textContent = 'Gespeichert ✓'; got++; bkOpen = total - got; }
        if (got === total) {
          try { kaSet('ka_lastbackup', new Date().toISOString()); } catch (x) {}
          renderHome(); document.getElementById('pg-status').textContent = 'Alle Teile wurden gespeichert.';
        }
      };
      row.appendChild(b); box.appendChild(row);
    });
    document.getElementById('pg-close').style.display = '';
  } catch (x) {
    progClose(true);
    alert('Die Sicherung konnte nicht erstellt werden. (' + (x && x.message ? x.message : 'unbekannter Fehler') + ')');
  }
}
/* Sicherung laden (ZIP mit einem oder mehreren Teilen) */
async function restoreZips(zips, inp) {
  progOpen('Sicherung wird gelesen');
  try {
    var parts = [];
    for (var i = 0; i < zips.length; i++) {
      var map = await readZipBlob(zips[i]);
      if (!map['info.json']) throw new Error('Keine Sicherung: ' + zips[i].name);
      var info = JSON.parse(await map['info.json'].text());
      if (!info || info.format !== 'ka-sicherung-teil') throw new Error('Ungültige Teilinformation');
      parts.push({ map: map, info: info, file: zips[i] });
    }
    var inf = parts[0].info, have = {};
    if (!Number.isInteger(+inf.teil) || !Number.isInteger(+inf.von) || +inf.von < 1) throw new Error('Ungültige Teilnummer');
    parts.forEach(function (p) {
      var x = p.info;
      if (x.sicherung !== inf.sicherung || +x.von !== +inf.von || !!x.verschluesselt !== !!inf.verschluesselt || x.salt !== inf.salt || +x.iter !== +inf.iter || x.pruefung !== inf.pruefung) throw new Error('Die ausgewählten Teile gehören nicht vollständig zur selben Sicherung');
      var n = +x.teil;
      if (!Number.isInteger(n) || n < 1 || n > +inf.von) throw new Error('Ungültige Teilnummer ' + x.teil);
      if (have[n]) throw new Error('Teil ' + n + ' wurde mehrfach ausgewählt');
      have[n] = p;
    });
    var miss = []; for (var t = 1; t <= +inf.von; t++) if (!have[t]) miss.push(t);
    if (miss.length) throw new Error('Es fehlen die Teile ' + miss.join(', ') + ' von ' + inf.von + '. Bitte alle Teile gemeinsam auswählen.');
    if (inf.verschluesselt) {
      var it = +inf.iter;
      if (!Number.isInteger(it) || it < 100000 || it > 2000000 || fromB64(inf.salt || '').length < 16 || !inf.pruefung) throw new Error('Ungültige Verschlüsselungsparameter');
    }
    var ctx = { have: have, inf: inf, inp: inp };
    progClose(true);
    if (inf.verschluesselt) {
      pendingEnc = { zip: true, ctx: ctx }; importInp = inp; document.getElementById('bkp-pw').value = ''; openModal('modal-bkpw');
    } else {
      if (!await kaConfirm('Diese ältere Sicherung ist unverschlüsselt. Sie kann nicht so vollständig kryptografisch geprüft werden wie eine neue Sicherung. Nur fortfahren, wenn Du der Datei vertraust.')) { if (inp) inp.value = ''; return; }
      await continueZipRestore(null, ctx);
    }
  } catch (x) {
    progClose(true);
    alert('Die Sicherung konnte nicht gelesen werden. ' + (x && x.message ? x.message : ''));
    if (inp) inp.value = '';
  }
}
async function backupEntryBytes(key, ctx, m) {
  var p = ctx.have[+m.teil], nm = 'dateien/' + m.id + (key ? '.enc' : ''), bl = p && p.map[nm];
  if (!bl) throw new Error('Datei fehlt in der Sicherung: ' + (m.name || m.id));
  var bytes = new Uint8Array(await bl.arrayBuffer());
  if (key) bytes = await decEntry(key, bytes);
  return bytes;
}
async function verifyZipBackup(key, ctx, d) {
  validateBackupData(d);
  if (d.format !== 'ka-sicherung') throw new Error('Ungültiges Sicherungsformat');
  if (d.id !== ctx.inf.sicherung) throw new Error('Sicherungskennung stimmt nicht überein');
  if (+d.version >= 4) {
    var stateHash = await backupStateHash(d);
    if (stateHash !== String(d.integrity.state || '').toLowerCase()) throw new Error('Prüfsumme der Praxisdaten stimmt nicht');
  }
  var list = d.dateien || [], seen = {};
  for (var i = 0; i < list.length; i++) {
    var m = list[i], id = String(m.id);
    if (m.id === undefined || m.id === null || seen[id]) throw new Error('Doppelte oder fehlende Datei-ID');
    seen[id] = true;
    progSet(list.length ? 5 + (i / list.length) * 90 : 95, 'Prüfe Datei ' + (i + 1) + ' von ' + list.length);
    var bytes = await backupEntryBytes(key, ctx, m);
    if (m.size !== undefined && +m.size !== bytes.byteLength) throw new Error('Dateigröße stimmt nicht: ' + (m.name || m.id));
    if (+d.version >= 4) {
      if (!/^[0-9a-f]{64}$/i.test(m.sha256 || '')) throw new Error('Prüfsumme fehlt: ' + (m.name || m.id));
      if ((await sha256Hex(bytes)) !== String(m.sha256).toLowerCase()) throw new Error('Datei ist beschädigt: ' + (m.name || m.id));
    }
    if (i % 15 === 14) await new Promise(function (r) { setTimeout(r, 0); });
  }
  progSet(100, 'Sicherung vollständig geprüft.');
  return true;
}
async function restoreZipFiles(key, ctx, d, journal) {
  var list = d.dateien || [], prefix = journal.stagePrefix, mapping = {};
  try {
    for (var i = 0; i < list.length; i++) {
      var m = list[i], bytes = await backupEntryBytes(key, ctx, m), sid = prefix + i;
      progSet(list.length ? (i / list.length) * 95 : 95, 'Bereite Datei ' + (i + 1) + ' von ' + list.length + ' vor');
      if (!(await fPut(sid, m.name || 'Datei', new Blob([bytes], { type: m.type || '' })))) throw new Error('Nicht genügend freier Gerätespeicher. Die bisherigen Daten wurden nicht verändert.');
      mapping[sid] = m.id;
      if (i % 15 === 14) await new Promise(function (r) { setTimeout(r, 0); });
    }
    progSet(97, 'Dateien werden reversibel umgeschaltet...');
    if (!(await fCommitStagedFiles(prefix, mapping, journal.backupPrefix))) throw new Error('Dateien konnten nicht sicher vorbereitet werden. Die bisherigen Dateien bleiben erhalten.');
    restoreJournalPhase(journal, 'files-swapped');
    progSet(100, 'Dateien vorbereitet.');
    return '';
  } catch (x) {
    await fDropStage(prefix).catch(function () {});
    throw x;
  }
}
async function continueZipRestore(pw, ctx) {
  var inf = ctx.inf, key = null;
  try {
    if (inf.verschluesselt) {
      key = await bkKey(pw, fromB64(inf.salt), +inf.iter);
      try {
        var ok = new TextDecoder().decode(await decEntry(key, fromB64(inf.pruefung)));
        if (ok !== 'ka-ok') throw new Error('proof');
      } catch (x) { alert('Das Passwort stimmt nicht.'); return false; }
      closeModal('modal-bkpw');
      pendingEnc = null;
    }
    progOpen('Sicherung wird geprüft');
    var dn = key ? 'daten.json.enc' : 'daten.json', dp = null;
    Object.keys(ctx.have).forEach(function (k) { if (ctx.have[k].map[dn]) dp = ctx.have[k]; });
    if (!dp) throw new Error(dn + ' fehlt');
    var bytes = new Uint8Array(await dp.map[dn].arrayBuffer());
    if (key) bytes = await decEntry(key, bytes);
    var d = JSON.parse(new TextDecoder().decode(bytes));
    await verifyZipBackup(key, ctx, d);
    progClose(true);
    var restorer = async function (journal) {
      progOpen('Fotos und Dateien werden sicher vorbereitet');
      try { return await restoreZipFiles(key, ctx, d, journal); }
      finally { progClose(true); }
    };
    await applyImport(d, ctx.inp, restorer);
    return true;
  } catch (x) {
    progClose(true);
    alert('Sicherung wurde nicht übernommen. Die bisherigen Praxisdaten bleiben erhalten. ' + (x && x.message ? x.message : ''));
    if (ctx.inp) ctx.inp.value = '';
    return false;
  }
}
var pendingEnc = null, importInp = null;
function importData(inp) {
  var fl = [].slice.call(inp.files || []); if (!fl.length) return;
  var zips = fl.filter(function (f) { return /\.zip$/i.test(f.name); });
  if (zips.length) { restoreZips(zips, inp); return; }
  var f = fl[0], r = new FileReader();
  r.onload = async function () {
    var d; try { d = JSON.parse(r.result); } catch (x) { alert('Die Datei konnte nicht gelesen werden.'); inp.value = ''; return; }
    if (d && d.format === 'ka-backup-enc') {
      pendingEnc = d; importInp = inp; document.getElementById('bkp-pw').value = ''; openModal('modal-bkpw'); return;
    }
    if (!await kaConfirm('Diese ältere Sicherungsdatei ist unverschlüsselt. Nur fortfahren, wenn Du der Datei vertraust.')) { inp.value = ''; return; }
    await applyImport(d, inp);
  };
  r.readAsText(f);
}
async function doDecrypt() {
  var pw = document.getElementById('bkp-pw').value;
  if (!pendingEnc || !pw) { alert('Bitte das Passwort eingeben.'); return; }
  if (pendingEnc.zip) { var ctx0 = pendingEnc.ctx; await continueZipRestore(pw, ctx0); return; }
  var text;
  try { text = await decryptBackup(pendingEnc, pw); } catch (x) { alert('Das Passwort stimmt nicht oder die Datei ist beschädigt.'); return; }
  var d; try { d = JSON.parse(text); validateBackupData(d); } catch (x) { alert('Die Datei konnte nicht gelesen oder geprüft werden.'); return; }
  closeModal('modal-bkpw'); pendingEnc = null;
  await applyImport(d, importInp);
}
async function applyImport(d, inp, restorer) {
  var journal = null, committed = false;
  try {
    validateBackupData(d);
    if (!await kaConfirm('Die Sicherung wurde gelesen. Aktuelle Daten wirklich durch diesen Stand ersetzen? (' + d.events.length + ' Termine, ' + d.patients.length + ' Patienten)')) { if (inp) inp.value = ''; return; }

    journal = await restoreJournalBegin();
    var msg = '';
    if (restorer) msg = await restorer(journal);
    else if (Array.isArray(d.files) && !d.ohneDateien) msg = await restoreFiles(d.files, journal);

    events = d.events; patients = d.patients; ensurePatients(); migrateEventPatientIds();
    if (Array.isArray(d.templates)) templates = d.templates;
    if (Array.isArray(d.invoices)) invoices = d.invoices;
    if (d.settings && typeof d.settings === 'object') settings = Object.assign(settings, d.settings);
    if (!Array.isArray(settings.katalog)) settings.katalog = [];
    if (d.lager && Array.isArray(d.lager.produkte)) lager = { produkte: d.lager.produkte, chargen: Array.isArray(d.lager.chargen) ? d.lager.chargen : [], verbrauch: Array.isArray(d.lager.verbrauch) ? d.lager.verbrauch : [] };
    if (Array.isArray(d.ausgaben)) ausgaben = d.ausgaben;
    if (Array.isArray(d.entw)) entw = d.entw;
    if (Array.isArray(d.todos)) todos = d.todos;
    var m = 0;
    events.forEach(function (e) { if (e.id > m) m = e.id; });
    events.forEach(function (e) { if (!e.id) e.id = ++m; });
    nid = m + 1;

    await restorePersistCore();
    restoreJournalPhase(journal, 'committed'); committed = true;
    await restoreJournalFinalize(journal);

    renderPatients(); renderCal(); renderInvoices(); refreshLeistungen(); renderLager(); renderLeist();
    try { await migrateFiles(); } catch (x) {}
    try { KS.touch(); } catch (x) {}
    alert('Daten wurden geladen.' + (typeof msg === 'string' ? msg : ''));
  } catch (x) {
    progClose(true);
    if (journal && !committed) {
      try {
        await restoreJournalRollback(journal);
        alert('Die Wiederherstellung wurde abgebrochen. Der vorherige Stand wurde automatisch vollständig wiederhergestellt.');
        location.reload(); return;
      } catch (rb) {
        document.documentElement.classList.add('locked');
        alert('Die Wiederherstellung wurde gestoppt, aber der automatische Rollback konnte nicht vollständig abgeschlossen werden. Bitte die App nicht weiter benutzen und neu laden. (' + (rb && rb.message ? rb.message : 'unbekannter Fehler') + ')');
        return;
      }
    }
    if (journal && committed) {
      alert('Die Daten wurden übernommen, aber die technische Bereinigung ist noch nicht abgeschlossen. Die App wird neu geladen und bereinigt den Rest automatisch.');
      location.reload(); return;
    }
    alert('Sicherung wurde nicht übernommen. Die bisherigen Praxisdaten bleiben erhalten. ' + (x && x.message ? x.message : ''));
  }
  if (inp) inp.value = '';
}

renderPatients();
renderCal();
renderInvoices();
refreshLeistungen();
renderHome();
renderTemplates();
migrateFiles();
/* Einmalige Reparatur für schon importierte Rechnungen: Anlagedatum der Patienten und Zusatztexte in Positionen */
function fixImported() {
  if (settings.fixImp1) return; var ch = 0, first = {};
  invoices.forEach(function (i) {
    if (!i.imported) return;
    var t = new Date(i.date + 'T12:00:00').getTime(); if (first[i.pid] == null || t < first[i.pid]) first[i.pid] = t;
    (i.items || []).forEach(function (x) { var n = String(x.text || '').replace(/\s*–?\s*\(\d+(?:[.,]\d+)?x\s*€[^)]*\)/g, '').replace(/\s+€\s*\d{1,3}(?:\.\d{3})*,\d{2}(?=\s+–|$)/g, ''); if (n !== x.text) { x.text = n; ch++; } });
  });
  patients.forEach(function (p) { if (first[p.id] != null && first[p.id] < p.erstellt && (p.log || []).some(function (l) { return /importierten Rechnung angelegt/.test(l.text || ''); })) { p.erstellt = first[p.id]; ch++; } });
  settings.fixImp1 = true; persist();
}
fixImported();
restoreLast();
