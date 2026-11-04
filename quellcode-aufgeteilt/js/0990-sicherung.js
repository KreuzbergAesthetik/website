/* ===== Sicherung (immer mit Passwort verschlüsselt) ===== */
function toB64(u8) { var s = '', n = 0x8000; for (var i = 0; i < u8.length; i += n) s += String.fromCharCode.apply(null, u8.subarray(i, i + n)); return btoa(s); }
function fromB64(b) { var s = atob(b), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
var BK_ITER = 250000;
async function bkKey(pw, salt, iter) {
  var km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt, iterations: iter, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encryptBackup(text, pw) {
  var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)), key = await bkKey(pw, salt, BK_ITER);
  var ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, new TextEncoder().encode(text)));
  return JSON.stringify({ format: 'ka-backup-enc', v: 1, kdf: 'PBKDF2-SHA256', iter: BK_ITER, salt: toB64(salt), iv: toB64(iv), data: toB64(ct) });
}
async function decryptBackup(obj, pw) {
  if (!obj || obj.format !== 'ka-backup-enc') throw new Error('Format');
  var iter = +obj.iter;
  if (!Number.isInteger(iter) || iter < 100000 || iter > 2000000) throw new Error('Ungültige Schlüsselableitung');
  var salt = fromB64(obj.salt || ''), iv = fromB64(obj.iv || '');
  if (salt.length < 16 || iv.length !== 12) throw new Error('Ungültige Verschlüsselungsdaten');
  var key = await bkKey(pw, salt, iter);
  var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, fromB64(obj.data || ''));
  return new TextDecoder().decode(pt);
}
async function sha256Hex(v) {
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
function exportData() {
  ['bk-pw', 'bk-pw2'].forEach(function (id) { document.getElementById(id).value = ''; });
  openModal('modal-bk');
}
function blobB64(b) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1] || ''); }; r.onerror = function () { res(''); }; r.readAsDataURL(b); }); }
function fKeys() {
  return fTx('readonly', function (st) { return st.getAllKeys(); }).then(function (r) { if (!Array.isArray(r)) throw new Error('Dateispeicher nicht verfügbar'); return r; });
}
async function fDropStage(prefix) {
  if (!prefix) return;
  var keys = await fKeys();
  for (var i = 0; i < keys.length; i++) if (String(keys[i]).indexOf(prefix) === 0) { var r = await fDel(keys[i]); if (r === null) throw new Error('Temporäre Dateien konnten nicht bereinigt werden'); }
}
async function fHasPrefix(prefix) { var keys = await fKeys(); return keys.some(function (k) { return String(k).indexOf(prefix) === 0; }); }
function restorePackId(id) { return encodeURIComponent(JSON.stringify(id)); }
function restoreUnpackId(id, prefix) { return JSON.parse(decodeURIComponent(String(id).slice(prefix.length))); }
function fCommitStagedFiles(prefix, mapping, backupPrefix) {
  return fOpen().then(function (db) {
    if (!db) return false;
    return new Promise(function (res) {
      var tx = db.transaction('files', 'readwrite'), st = tx.objectStore('files'), ok = true;
      var fail = function () { ok = false; try { tx.abort(); } catch (x) {} };
      var moveNew = function () {
        var rq2 = st.openCursor();
        rq2.onsuccess = function () {
          var cur = rq2.result; if (!cur) return;
          var id = String(cur.key);
          if (id.indexOf(prefix) === 0) {
            var target = mapping[id];
            if (target === undefined || target === null || target === '') { fail(); return; }
            var rec = cur.value; rec.id = target;
            var p = st.put(rec), d = cur.delete(); p.onerror = fail; d.onerror = fail;
          }
          cur.continue();
        };
        rq2.onerror = fail;
      };
      var rq = st.openCursor();
      rq.onsuccess = function () {
        var cur = rq.result;
        if (!cur) { moveNew(); return; }
        var raw = cur.key, id = String(raw);
        if (id.indexOf(prefix) !== 0 && id.indexOf(backupPrefix) !== 0) {
          var rec = cur.value; rec.id = backupPrefix + restorePackId(raw);
          var p = st.put(rec), d = cur.delete(); p.onerror = fail; d.onerror = fail;
        }
        cur.continue();
      };
      rq.onerror = fail;
      tx.oncomplete = function () {
        Object.keys(urlCache).forEach(function (k) { URL.revokeObjectURL(urlCache[k]); }); urlCache = {};
        res(ok);
      };
      tx.onerror = tx.onabort = function () { res(false); };
    });
  });
}
async function fRollbackJournalFiles(j) {
  if (!(await fHasPrefix(j.backupPrefix))) { await fDropStage(j.stagePrefix); return true; }
  var db = await fOpen(); if (!db) throw new Error('Dateispeicher nicht verfügbar');
  return new Promise(function (res, rej) {
    var tx = db.transaction('files', 'readwrite'), st = tx.objectStore('files'), failed = false;
    var fail = function () { failed = true; try { tx.abort(); } catch (x) {} };
    var restoreOld = function () {
      var rq2 = st.openCursor();
      rq2.onsuccess = function () {
        var cur = rq2.result; if (!cur) return;
        var id = String(cur.key);
        if (id.indexOf(j.backupPrefix) === 0) {
          var rec = cur.value;
          try { rec.id = restoreUnpackId(cur.key, j.backupPrefix); } catch (x) { fail(); return; }
          var p = st.put(rec), d = cur.delete(); p.onerror = fail; d.onerror = fail;
        }
        cur.continue();
      };
      rq2.onerror = fail;
    };
    var rq = st.openCursor();
    rq.onsuccess = function () {
      var cur = rq.result;
      if (!cur) { restoreOld(); return; }
      if (String(cur.key).indexOf(j.backupPrefix) !== 0) { var d = cur.delete(); d.onerror = fail; }
      cur.continue();
    };
    rq.onerror = fail;
    tx.oncomplete = function () { Object.keys(urlCache).forEach(function (k) { URL.revokeObjectURL(urlCache[k]); }); urlCache = {}; res(!failed); };
    tx.onerror = tx.onabort = function () { rej(tx.error || new Error('Datei-Rollback fehlgeschlagen')); };
  });
}
function restoreStagePrefix() { return '\uffffka_restore_new_' + newId() + '_'; }
function restoreBackupPrefix() { return '\uffffka_restore_old_' + newId() + '_'; }
async function restoreJournalBegin() {
  await kaIdle();
  if (rjMetaGet()) throw new Error('Eine frühere Wiederherstellung ist noch nicht bereinigt');
  var core = {};
  RJ_CORE_KEYS.forEach(function (k) {
    var v = localStorage.getItem(k);
    if (v !== null && KA.enc && v.indexOf(KA_ENC) !== 0) throw new Error('Lokale Kerndaten sind noch nicht vollständig verschlüsselt');
    core[k] = v;
  });
  var snapId = 'core-' + newId();
  await rjSnapPut(snapId, core);
  var j = { v: 1, ts: Date.now(), phase: 'prepared', snapshotId: snapId, stagePrefix: restoreStagePrefix(), backupPrefix: restoreBackupPrefix() };
  try { rjMetaSet(j); } catch (x) { await rjSnapDel(snapId); throw x; }
  return j;
}
function restoreJournalPhase(j, phase) { j.phase = phase; rjMetaSet(j); }
async function restoreJournalFinalize(j) {
  await fDropStage(j.stagePrefix); await fDropStage(j.backupPrefix);
  rjMetaClear();
  try { await rjSnapDel(j.snapshotId); } catch (x) {}
  return true;
}
async function restoreJournalRollback(j) {
  var snap = await rjSnapGet(j.snapshotId);
  if (!snap || !snap.core) throw new Error('Rollback-Snapshot fehlt');
  KA.q = {}; KA.busy = null; KA.bad = false;
  rjRestoreRaw(snap.core);
  if (!(await fRollbackJournalFiles(j))) throw new Error('Datei-Rollback fehlgeschlagen');
  rjMetaClear();
  try { await rjSnapDel(j.snapshotId); } catch (x) {}
  await kaLoadAll(); await kaIdle();
  return true;
}
async function restoreJournalStartup() {
  var j = rjMetaGet();
  if (!j) { try { await rjSnapClear(); } catch (x) {} return ''; }
  if (j.phase === 'committed') { await restoreJournalFinalize(j); return ''; }
  var snap = await rjSnapGet(j.snapshotId);
  if (!snap || !snap.core) throw new Error('Rollback-Snapshot fehlt');
  if (!RJ_EARLY) { rjRestoreRaw(snap.core); KA.q = {}; KA.busy = null; KA.bad = false; await kaLoadAll(); await kaIdle(); }
  if (!(await fRollbackJournalFiles(j))) throw new Error('Datei-Rollback fehlgeschlagen');
  rjMetaClear();
  try { await rjSnapDel(j.snapshotId); } catch (x) {}
  return RJ_EARLY ? '' : 'reload';
}
async function restorePersistCore() {
  kaSet('ka_events', JSON.stringify(events));
  kaSet('ka_patients', JSON.stringify(patients));
  kaSet('ka_templates', JSON.stringify(templates));
  kaSet('ka_invoices', JSON.stringify(invoices));
  kaSet('ka_settings', JSON.stringify(settings));
  kaSet('ka_lager', JSON.stringify(lager));
  kaSet('ka_ausgaben', JSON.stringify(ausgaben));
  kaSet('ka_entw', JSON.stringify(entw));
  kaSet('ka_todos', JSON.stringify(todos));
  await kaIdle();
}
async function restoreInlineFiles(list, journal) {
  var prefix = journal.stagePrefix, mapping = {};
  try {
    for (var i = 0; i < list.length; i++) {
      var f = list[i];
      if (f.id === undefined || f.id === null || !f.data) throw new Error('Dateiangabe unvollständig');
      var b = await dataToBlob('data:' + (f.type || 'application/octet-stream') + ';base64,' + f.data), sid = prefix + i;
      if (!(await fPut(sid, f.name || 'Datei', b))) throw new Error('Nicht genügend Gerätespeicher für die Wiederherstellung');
      mapping[sid] = f.id;
    }
    if (!(await fCommitStagedFiles(prefix, mapping, journal.backupPrefix))) throw new Error('Dateien konnten nicht atomar vorbereitet werden');
    restoreJournalPhase(journal, 'files-swapped');
    return '';
  } catch (x) {
    await fDropStage(prefix).catch(function () {});
    throw x;
  }
}
function restoreFiles(list, journal) { return restoreInlineFiles(list || [], journal); }
