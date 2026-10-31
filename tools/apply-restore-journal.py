from pathlib import Path
import re

INDEX = Path('index.html')
SW = Path('sw.js')
STATIC = Path('tests/static-check.mjs')
BROWSER = Path('tests/browser-smoke.mjs')

s = INDEX.read_text(encoding='utf-8')

def replace_once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'{label}: erwartet 1 Treffer, gefunden {n}')
    s = s.replace(old, new, 1)

def sub_once(pattern, repl, label, flags=re.S):
    global s
    s2, n = re.subn(pattern, lambda m: repl, s, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f'{label}: erwartet 1 Treffer, gefunden {n}')
    s = s2

if "__ka_restore_journal_v1" in s and "async function restoreJournalBegin(" in s:
    print('Restore-Journal bereits vorhanden.')
else:
    # Kleine, unverschlüsselte Metadaten stehen in localStorage. Der eigentliche Snapshot
    # besteht ausschließlich aus den bereits verschlüsselten Raw-Werten und liegt separat in IndexedDB.
    anchor = 'async function kaLoadAll() {'
    helpers = r'''var RJ_KEY = '__ka_restore_journal_v1', RJ_DB = 'ka-restore', RJ_STORE = 'journal', RJ_EARLY = false;
var RJ_CORE_KEYS = ['ka_events','ka_patients','ka_templates','ka_invoices','ka_settings','ka_lager','ka_ausgaben','ka_entw','ka_todos'];
function rjMetaGet() {
  var t = localStorage.getItem(RJ_KEY); if (!t) return null;
  var j; try { j = JSON.parse(t); } catch (x) { throw new Error('Wiederherstellungsjournal ist beschädigt'); }
  if (!j || j.v !== 1 || typeof j.snapshotId !== 'string' || typeof j.stagePrefix !== 'string' || typeof j.backupPrefix !== 'string') throw new Error('Wiederherstellungsjournal ist ungültig');
  return j;
}
function rjMetaSet(j) { localStorage.setItem(RJ_KEY, JSON.stringify(j)); }
function rjMetaClear() { localStorage.removeItem(RJ_KEY); }
function rjDbOpen() {
  return new Promise(function (res, rej) {
    try {
      var rq = indexedDB.open(RJ_DB, 1);
      rq.onupgradeneeded = function () { if (!rq.result.objectStoreNames.contains(RJ_STORE)) rq.result.createObjectStore(RJ_STORE, { keyPath: 'id' }); };
      rq.onsuccess = function () { res(rq.result); };
      rq.onerror = function () { rej(rq.error || new Error('Wiederherstellungsspeicher nicht verfügbar')); };
    } catch (x) { rej(x); }
  });
}
function rjStore(mode, fn) {
  return rjDbOpen().then(function (db) {
    return new Promise(function (res, rej) {
      var tx = db.transaction(RJ_STORE, mode), out;
      try { out = fn(tx.objectStore(RJ_STORE)); } catch (x) { try { tx.abort(); } catch (z) {} rej(x); return; }
      tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : true); };
      tx.onerror = tx.onabort = function () { rej(tx.error || new Error('Wiederherstellungsspeicher fehlgeschlagen')); };
    });
  });
}
function rjSnapPut(id, core) { return rjStore('readwrite', function (st) { return st.put({ id: id, ts: Date.now(), core: core }); }); }
function rjSnapGet(id) { return rjStore('readonly', function (st) { return st.get(id); }); }
function rjSnapDel(id) { return id ? rjStore('readwrite', function (st) { return st.delete(id); }) : Promise.resolve(true); }
function rjSnapClear() { return rjStore('readwrite', function (st) { return st.clear(); }); }
function rjRestoreRaw(core) {
  RJ_CORE_KEYS.forEach(function (k) {
    if (!Object.prototype.hasOwnProperty.call(core || {}, k)) throw new Error('Kerndaten-Snapshot ist unvollständig');
    var v = core[k];
    if (v === null) localStorage.removeItem(k);
    else if (typeof v === 'string') localStorage.setItem(k, v);
    else throw new Error('Kerndaten-Snapshot ist ungültig');
  });
}
async function rjEarlyCore() {
  var j = rjMetaGet();
  if (!j || j.phase === 'committed') return j;
  var snap = await rjSnapGet(j.snapshotId);
  if (!snap || !snap.core) throw new Error('Wiederherstellungs-Snapshot fehlt');
  rjRestoreRaw(snap.core); RJ_EARLY = true; return j;
}
'''
    if anchor not in s:
        raise SystemExit('kaLoadAll-Anker fehlt')
    s = s.replace(anchor, helpers + anchor, 1)

    replace_once(
        "try { KA.key = await alImportKey(raw); await kaLoadAll(); await kaIdle(); }",
        "try { KA.key = await alImportKey(raw); await rjEarlyCore(); await kaLoadAll(); await kaIdle(); }",
        'Early-Core-Recovery beim Entsperren'
    )
    replace_once(
        "  if (!KA.booted) kaBoot(false);\n  document.documentElement.classList.remove('locked'); alArm();",
        "  if (!KA.booted) kaBoot(false);\n  try { var rjr = typeof restoreJournalStartup === 'function' ? await restoreJournalStartup() : ''; if (rjr === 'reload') { location.reload(); return; } }\n  catch (e) { msg.textContent = 'Die unterbrochene Wiederherstellung konnte nicht sicher abgeschlossen werden. ' + (e && e.message ? e.message : ''); return; }\n  document.documentElement.classList.remove('locked'); alArm();",
        'Journal-Recovery vor Entsperren'
    )

    # Transaktionsähnlicher Dateitausch, Rollback und Journal-Lebenszyklus.
    sub_once(
        r"function fKeys\(\) \{.*?function restoreFiles\(list\) \{ return restoreInlineFiles\(list \|\| \[\]\); \}\n",
        r'''function fKeys() {
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
''',
        'Journal-Dateitransaktion'
    )

    # ZIP-Dateien werden gegen den Journal-Backupbereich statt destruktiv ausgetauscht.
    sub_once(
        r"async function restoreZipFiles\(key, ctx, d\) \{.*?\n\}",
        r'''async function restoreZipFiles(key, ctx, d, journal) {
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
}''',
        'ZIP-Dateitausch mit Journal'
    )
    replace_once(
        "    var restorer = async function () {\n      progOpen('Fotos und Dateien werden sicher vorbereitet');\n      try { return await restoreZipFiles(key, ctx, d); }\n      finally { progClose(true); }\n    };",
        "    var restorer = async function (journal) {\n      progOpen('Fotos und Dateien werden sicher vorbereitet');\n      try { return await restoreZipFiles(key, ctx, d, journal); }\n      finally { progClose(true); }\n    };",
        'ZIP-Restorer Journalparameter'
    )

    sub_once(
        r"async function applyImport\(d, inp, restorer\) \{.*?\n\}\n\nrenderPatients\(\);",
        r'''async function applyImport(d, inp, restorer) {
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

renderPatients();''',
        'applyImport mit Journal'
    )

    replace_once("var KA_V = '2026-11-01-q';", "var KA_V = '2026-11-01-r';", 'App-Version')
    INDEX.write_text(s, encoding='utf-8')

    sw = SW.read_text(encoding='utf-8')
    if "var V='2026-11-01-q'" not in sw:
        raise SystemExit('Service-Worker-Version q nicht gefunden')
    sw = sw.replace("var V='2026-11-01-q'", "var V='2026-11-01-r'", 1)
    SW.write_text(sw, encoding='utf-8')

# Statische Invarianten ergänzen.
t = STATIC.read_text(encoding='utf-8')
if 'Restore-Journal muss dauerhaft vorhanden bleiben.' not in t:
    marker = "// 8) Sync und automatischer Formularimport dürfen nicht still verschwinden."
    block = r'''// 8) Restore-Journal muss dauerhaft vorhanden bleiben.
for (const marker of ['__ka_restore_journal_v1', 'async function rjEarlyCore(', 'async function restoreJournalBegin(', 'async function restoreJournalRollback(', 'async function restoreJournalStartup(', 'async function fRollbackJournalFiles(', "restoreJournalPhase(journal, 'committed')"]) {
  assert.ok(html.includes(marker), `Restore-Journal fehlt: ${marker}`);
}
assert.ok(html.includes('fCommitStagedFiles(prefix, mapping, journal.backupPrefix)'), 'Dateitausch behält keinen reversiblen Altbestand');
assert.ok(html.includes('await restorePersistCore();'), 'Restore schreibt Kerndaten nicht kontrolliert');
assert.ok(!html.includes("await fClear(); var list = d.dateien || []"), 'Restore darf vorhandene Dateien nicht vorab löschen');

// 9) Sync und automatischer Formularimport dürfen nicht still verschwinden.'''
    if marker not in t:
        raise SystemExit('Static-Test-Anker fehlt')
    t = t.replace(marker, block, 1)
    t = t.replace('// 9) Lokale Praxisdaten müssen verpflichtend verschlüsselt werden.', '// 10) Lokale Praxisdaten müssen verpflichtend verschlüsselt werden.', 1)
    t = t.replace('// 10) Manifest und zentrale PWA-Dateien müssen existieren und lesbar sein.', '// 11) Manifest und zentrale PWA-Dateien müssen existieren und lesbar sein.', 1)
    STATIC.write_text(t, encoding='utf-8')

# Browser-Test: unterbrochenen Dateitausch und committed cleanup real in IndexedDB prüfen.
b = BROWSER.read_text(encoding='utf-8')
if 'restoreJournalCrashRecovery' not in b:
    anchor = "    out.backupRejectsWrongPassword = wrongRejected;\n\n    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen."
    block = r'''    out.backupRejectsWrongPassword = wrongRejected;

    // Restore-Journal: Ein unterbrochener Restore muss Kerndaten und Dateien vollständig zurückrollen.
    const oldCore = JSON.stringify([{ id:7101, patient:'Journal Alt', date:'2026-10-30', time:'09:00', dur:30 }]);
    kaSet('ka_events', oldCore); await kaIdle();
    await fPut('ci-j-old', 'old.txt', new Blob(['old-file'], { type:'text/plain' }));
    const j1 = await restoreJournalBegin();
    const stage1 = j1.stagePrefix + '0';
    await fPut(stage1, 'new.txt', new Blob(['new-file'], { type:'text/plain' }));
    const map1 = {}; map1[stage1] = 'ci-j-new';
    const swapped1 = await fCommitStagedFiles(j1.stagePrefix, map1, j1.backupPrefix);
    restoreJournalPhase(j1, 'files-swapped');
    kaSet('ka_events', JSON.stringify([{ id:7102, patient:'Journal Neu', date:'2026-10-31', time:'10:00', dur:30 }])); await kaIdle();
    await rjEarlyCore(); await kaLoadAll(); await kaIdle();
    await restoreJournalStartup();
    const oldFile = await fGet('ci-j-old'), newFileAfterRollback = await fGet('ci-j-new');
    out.restoreJournalCrashRecovery = swapped1 && JSON.parse(kaGet('ka_events'))[0]?.id === 7101 && !!oldFile && (await oldFile.blob.text()) === 'old-file' && !newFileAfterRollback && !localStorage.getItem(RJ_KEY);
    await fDel('ci-j-old');

    // Nach Commit werden nur die neuen Dateien behalten und das Journal restlos entfernt.
    await fPut('ci-j-old2', 'old2.txt', new Blob(['old-2'], { type:'text/plain' }));
    const j2 = await restoreJournalBegin();
    const stage2 = j2.stagePrefix + '0';
    await fPut(stage2, 'new2.txt', new Blob(['new-2'], { type:'text/plain' }));
    const map2 = {}; map2[stage2] = 'ci-j-new2';
    const swapped2 = await fCommitStagedFiles(j2.stagePrefix, map2, j2.backupPrefix);
    restoreJournalPhase(j2, 'files-swapped');
    kaSet('ka_events', JSON.stringify([{ id:7103, patient:'Journal Commit', date:'2026-10-31', time:'11:00', dur:30 }])); await kaIdle();
    restoreJournalPhase(j2, 'committed');
    await restoreJournalFinalize(j2);
    const old2 = await fGet('ci-j-old2'), new2 = await fGet('ci-j-new2');
    out.restoreJournalCommit = swapped2 && !old2 && !!new2 && (await new2.blob.text()) === 'new-2' && JSON.parse(kaGet('ka_events'))[0]?.id === 7103 && !localStorage.getItem(RJ_KEY);
    await fDel('ci-j-new2');

    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen.'''
    if anchor not in b:
        raise SystemExit('Browser-Test-Anker fehlt')
    b = b.replace(anchor, block, 1)
    BROWSER.write_text(b, encoding='utf-8')

print('Restore-Journal Patch angewendet.')
