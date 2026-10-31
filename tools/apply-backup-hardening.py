from pathlib import Path
import re

INDEX = Path("index.html")
SW = Path("sw.js")

s = INDEX.read_text(encoding="utf-8")

def require(text, label):
    if text not in s:
        raise SystemExit(f"Fehlt in index.html: {label}")

def replace_once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f"{label}: erwartet 1 Treffer, gefunden {n}")
    s = s.replace(old, new, 1)

def sub_once(pattern, repl, label, flags=re.S):
    global s
    s2, n = re.subn(pattern, repl, s, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f"{label}: erwartet 1 Treffer, gefunden {n}")
    s = s2

if "async function verifyZipBackup(" in s and "version: 4" in s and 'id="bk-nopw"' not in s:
    print("Backup-Härtung in index.html bereits vorhanden.")
else:
    s = s.replace("Du kannst sie mit einem eigenen Passwort verschlüsseln.", "Sie wird immer mit einem eigenen Passwort verschlüsselt.")
    replace_once(
        '<div class="form-group"><label>Passwort (mindestens 8 Zeichen)</label><input type="password" id="bk-pw" class="form-control" autocomplete="new-password"></div>',
        '<div class="form-group"><label>Passwort (mindestens 12 Zeichen)</label><input type="password" id="bk-pw" class="form-control" autocomplete="new-password"></div>',
        "Backup-Passwortlabel"
    )
    for old, label in [
        ('    <div id="bk-pwhint" style="margin:8px 0;"></div>\n', "Passwortwechsel-Hinweis"),
        ('    <label class="tm-chk" style="display:flex; gap:8px; align-items:center; margin-top:6px;"><input type="checkbox" id="bk-newpw"> Ich habe ein neues Passwort vergeben (Datum merken)</label>\n', "Passwortwechsel-Checkbox"),
        ('    <label class="tm-chk" style="display:flex; gap:8px; align-items:center; margin-top:6px;"><input type="checkbox" id="bk-nopw" onchange="bkToggle()"> Ohne Passwort sichern (nicht empfohlen)</label>\n', "Unverschlüsselt-Checkbox"),
    ]:
        replace_once(old, "", label)
    replace_once(
        '    <div style="font-size:12px; color:#64748b; margin:6px 0;">Jede Sicherung gilt nur mit dem Passwort, mit dem sie erstellt wurde. Alte Passwörter bitte aufbewahren. Fotos und Dateien sind in der Sicherung enthalten, sie kann dadurch groß werden.</div>',
        '    <div style="font-size:12px; color:#64748b; margin:6px 0;">Jede Sicherung wird vollständig verschlüsselt. Verwende ein langes eigenes Passwort und bewahre es sicher auf. Ohne dieses Passwort gibt es keine Wiederherstellung. Fotos und Dateien sind enthalten, die Sicherung kann dadurch groß werden.</div>',
        "Backup-Hinweis"
    )
    s = s.replace("/* ===== Sicherung (optional mit Passwort verschlüsselt) ===== */", "/* ===== Sicherung (immer mit Passwort verschlüsselt) ===== */")
    s = s.replace("/* ===== Sicherung als ZIP: streamt die Dateien, teilt große Mengen in mehrere Teile, optional verschlüsselt ===== */", "/* ===== Sicherung als ZIP: streamt die Dateien, teilt große Mengen in mehrere Teile und verschlüsselt immer ===== */")

    sub_once(
        r"async function decryptBackup\(obj, pw\) \{.*?\n\}",
        """async function decryptBackup(obj, pw) {
  if (!obj || obj.format !== 'ka-backup-enc') throw new Error('Format');
  var iter = +obj.iter;
  if (!Number.isInteger(iter) || iter < 100000 || iter > 2000000) throw new Error('Ungültige Schlüsselableitung');
  var salt = fromB64(obj.salt || ''), iv = fromB64(obj.iv || '');
  if (salt.length < 16 || iv.length !== 12) throw new Error('Ungültige Verschlüsselungsdaten');
  var key = await bkKey(pw, salt, iter);
  var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, fromB64(obj.data || ''));
  return new TextDecoder().decode(pt);
}""",
        "decryptBackup"
    )

    anchor = "function exportData() {"
    helpers = r"""async function sha256Hex(v) {
  var ab;
  if (typeof Blob !== 'undefined' && v instanceof Blob) ab = await v.arrayBuffer();
  else if (v instanceof Uint8Array) ab = v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength);
  else if (v instanceof ArrayBuffer) ab = v;
  else ab = new TextEncoder().encode(String(v)).buffer;
  var h = new Uint8Array(await crypto.subtle.digest('SHA-256', ab)), out = '';
  for (var i = 0; i < h.length; i++) out += h[i].toString(16).padStart(2, '0');
  return out;
}
function backupCore(d) {
  return {
    format: d.format, version: d.version, id: d.id, exportiert: d.exportiert,
    events: d.events, patients: d.patients, templates: d.templates, invoices: d.invoices,
    settings: d.settings, lager: d.lager, ausgaben: d.ausgaben, entw: d.entw, todos: d.todos,
    dateien: d.dateien
  };
}
async function backupStateHash(d) {
  return sha256Hex(new TextEncoder().encode(JSON.stringify(backupCore(d))));
}
function validateBackupData(d) {
  if (!d || !Array.isArray(d.events) || !Array.isArray(d.patients)) throw new Error('Ungültiges Sicherungsformat');
  if (d.format === 'ka-sicherung') {
    if (!Number.isInteger(+d.version) || +d.version < 3 || !Array.isArray(d.dateien)) throw new Error('Unvollständige Sicherung');
    if (+d.version >= 4 && (!d.integrity || d.integrity.alg !== 'SHA-256' || !/^[0-9a-f]{64}$/i.test(d.integrity.state || ''))) throw new Error('Integritätsangabe fehlt');
  }
  return true;
}
"""
    require(anchor, "exportData")
    s = s.replace(anchor, helpers + anchor, 1)

    sub_once(
        r"function exportData\(\) \{.*?\n\}\nfunction blobB64",
        """function exportData() {
  ['bk-pw', 'bk-pw2'].forEach(function (id) { document.getElementById(id).value = ''; });
  openModal('modal-bk');
}
function blobB64""",
        "exportData"
    )

    sub_once(
        r"function restoreFiles\(list\) \{.*?\n\}\nfunction bkToggle\(\) \{[^\n]*\}\n",
        r"""function fKeys() {
  return fTx('readonly', function (st) { return st.getAllKeys(); }).then(function (r) { return Array.isArray(r) ? r : []; });
}
async function fDropStage(prefix) {
  var keys = await fKeys();
  for (var i = 0; i < keys.length; i++) if (String(keys[i]).indexOf(prefix) === 0) await fDel(keys[i]);
}
function fCommitStagedFiles(prefix, mapping) {
  return fOpen().then(function (db) {
    if (!db) return false;
    return new Promise(function (res) {
      var tx = db.transaction('files', 'readwrite'), st = tx.objectStore('files'), rq = st.openCursor(), ok = true;
      rq.onsuccess = function () {
        var cur = rq.result; if (!cur) return;
        var id = String(cur.key);
        if (id.indexOf(prefix) === 0) {
          var target = mapping[id];
          if (target === undefined || target === null || target === '') { ok = false; try { tx.abort(); } catch (x) {} return; }
          var rec = cur.value; rec.id = target; st.put(rec); cur.delete();
        } else cur.delete();
        cur.continue();
      };
      rq.onerror = function () { ok = false; try { tx.abort(); } catch (x) {} };
      tx.oncomplete = function () {
        Object.keys(urlCache).forEach(function (k) { URL.revokeObjectURL(urlCache[k]); }); urlCache = {};
        res(ok);
      };
      tx.onerror = tx.onabort = function () { res(false); };
    });
  });
}
function restoreStagePrefix() { return '\uffffka_restore_' + newId() + '_'; }
async function restoreInlineFiles(list) {
  var prefix = restoreStagePrefix(), mapping = {};
  try {
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.id === undefined || f.id === null || !f.data) throw new Error('Dateiangabe unvollständig');
      var b = await dataToBlob('data:' + (f.type || 'application/octet-stream') + ';base64,' + f.data), sid = prefix + i;
      if (!(await fPut(sid, f.name || 'Datei', b))) throw new Error('Nicht genügend Gerätespeicher für die Wiederherstellung');
      mapping[sid] = f.id;
    }
    if (!(await fCommitStagedFiles(prefix, mapping))) throw new Error('Dateien konnten nicht atomar übernommen werden');
    return '';
  } catch (x) {
    await fDropStage(prefix);
    throw x;
  }
}
function restoreFiles(list) { return restoreInlineFiles(list || []); }
""",
        "staged file restore"
    )

    sub_once(
        r"async function doExport\(\) \{.*?\n\}\n/\* Sicherung laden \(ZIP mit einem oder mehreren Teilen\) \*/",
        r"""async function doExport() {
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
/* Sicherung laden (ZIP mit einem oder mehreren Teilen) */""",
        "doExport v4"
    )

    sub_once(
        r"async function restoreZips\(zips, inp\) \{.*?\n\}\n\nrenderPatients\(\);",
        r"""async function restoreZips(zips, inp) {
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
async function restoreZipFiles(key, ctx, d) {
  var list = d.dateien || [], prefix = restoreStagePrefix(), mapping = {};
  try {
    for (var i = 0; i < list.length; i++) {
      var m = list[i], bytes = await backupEntryBytes(key, ctx, m), sid = prefix + i;
      progSet(list.length ? (i / list.length) * 95 : 95, 'Bereite Datei ' + (i + 1) + ' von ' + list.length + ' vor');
      if (!(await fPut(sid, m.name || 'Datei', new Blob([bytes], { type: m.type || '' })))) throw new Error('Nicht genügend freier Gerätespeicher. Die bisherigen Daten wurden nicht verändert.');
      mapping[sid] = m.id;
      if (i % 15 === 14) await new Promise(function (r) { setTimeout(r, 0); });
    }
    progSet(97, 'Dateien werden atomar übernommen...');
    if (!(await fCommitStagedFiles(prefix, mapping))) throw new Error('Dateien konnten nicht sicher übernommen werden. Die bisherigen Dateien bleiben erhalten.');
    progSet(100, 'Dateien übernommen.');
    return '';
  } catch (x) {
    await fDropStage(prefix);
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
    var restorer = async function () {
      progOpen('Fotos und Dateien werden sicher vorbereitet');
      try { return await restoreZipFiles(key, ctx, d); }
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
  var committed = false;
  try {
    validateBackupData(d);
    if (!await kaConfirm('Die Sicherung wurde gelesen. Aktuelle Daten wirklich durch diesen Stand ersetzen? (' + d.events.length + ' Termine, ' + d.patients.length + ' Patienten)')) { if (inp) inp.value = ''; return; }
    var msg = '';
    if (restorer) msg = await restorer();
    else if (Array.isArray(d.files) && !d.ohneDateien) msg = await restoreFiles(d.files);

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
    persist(); if (typeof kaIdle === 'function') await kaIdle(); committed = true;
    renderPatients(); renderCal(); renderInvoices(); refreshLeistungen(); renderLager(); renderLeist();
    try { await migrateFiles(); } catch (x) {}
    alert('Daten wurden geladen.' + (typeof msg === 'string' ? msg : ''));
  } catch (x) {
    progClose(true);
    if (committed) alert('Die Daten wurden übernommen, aber die Oberfläche konnte nicht vollständig aktualisiert werden. Bitte die App einmal neu laden.');
    else alert('Sicherung wurde nicht übernommen. Die bisherigen Praxisdaten bleiben erhalten. ' + (x && x.message ? x.message : ''));
  }
  if (inp) inp.value = '';
}

renderPatients();""",
        "safe restore pipeline"
    )

    s2, n = re.subn(r"var KA_V = '2026-11-01-[^']+';", "var KA_V = '2026-11-01-q';", s, count=1)
    if n != 1:
        raise SystemExit(f"KA_V: erwartet 1 Treffer, gefunden {n}")
    s = s2

    for marker in [
        "async function verifyZipBackup(", "async function backupStateHash(", "function fCommitStagedFiles(",
        "version: 4", "sha256:", "mindestens 12 Zeichen", "immer mit Passwort verschlüsselt"
    ]:
        if marker not in s:
            raise SystemExit(f"Patch-Invariante fehlt: {marker}")
    for forbidden in ['id="bk-nopw"', 'id="bk-newpw"', 'Ohne Passwort sichern']:
        if forbidden in s:
            raise SystemExit(f"Unsichere Backup-Option blieb erhalten: {forbidden}")

INDEX.write_text(s, encoding="utf-8")

sw = SW.read_text(encoding="utf-8")
sw2, n = re.subn(r"var V='2026-11-01-[^']+'", "var V='2026-11-01-q'", sw, count=1)
if n != 1:
    raise SystemExit(f"Service-Worker-Version: erwartet 1 Treffer, gefunden {n}")
SW.write_text(sw2, encoding="utf-8")

print("Backup-Härtung angewendet.")
