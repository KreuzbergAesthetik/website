/* ===== Dateispeicher (IndexedDB): Fotos und Dokumente liegen nicht im kleinen localStorage ===== */
var fdb = null, urlCache = {};
function fOpen() {
  return new Promise(function (res) {
    if (fdb) { res(fdb); return; }
    try {
      var rq = indexedDB.open('ka-files', 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore('files', { keyPath: 'id' }); };
      rq.onsuccess = function () { fdb = rq.result; res(fdb); };
      rq.onerror = function () { res(null); };
    } catch (x) { res(null); }
  });
}
function fTx(mode, fn) {
  return fOpen().then(function (db) {
    if (!db) return null;
    return new Promise(function (res) {
      var tx = db.transaction('files', mode), out = null;
      try { out = fn(tx.objectStore('files')); } catch (x) { res(null); return; }
      tx.oncomplete = function () { res(out && out.result !== undefined ? out.result : true); };
      tx.onerror = tx.onabort = function () { res(null); };
    });
  });
}
function fPut(id, name, blob) {
  if (!KA.enc) return fTx('readwrite', function (s) { return s.put({ id: id, name: name, type: blob.type || '', blob: blob }); }).then(function (r) { return r !== null; });
  return blob.arrayBuffer().then(async function (ab) {
    var e = await kaEncBytes(new Uint8Array(ab)), m = await kaEncBytes(new TextEncoder().encode(JSON.stringify({ name: name, type: blob.type || '' })));
    return fTx('readwrite', function (s) { return s.put({ id: id, enc: e.buffer, emeta: m.buffer }); });
  }).then(function (r) { return r !== null; });
}
async function fRec(r) {
  if (!r.enc) return r; if (!KA.key) return null;
  var m = JSON.parse(new TextDecoder().decode(await kaDecBytes(new Uint8Array(r.emeta)))), b = await kaDecBytes(new Uint8Array(r.enc));
  return { id: r.id, name: m.name, type: m.type, blob: new Blob([b], { type: m.type || '' }) };
}
function fGet(id) { return fTx('readonly', function (s) { return s.get(id); }).then(function (r) { return r && r !== true ? fRec(r).catch(function () { return null; }) : null; }); }
function fDel(id) { if (urlCache[id]) { URL.revokeObjectURL(urlCache[id]); delete urlCache[id]; } return fTx('readwrite', function (s) { return s.delete(id); }); }
function fAll() { return fTx('readonly', function (s) { return s.getAll(); }).then(function (r) { return Array.isArray(r) ? Promise.all(r.map(fRec)).then(function (l) { return l.filter(Boolean); }) : []; }); }
function fClear() { Object.keys(urlCache).forEach(function (k) { URL.revokeObjectURL(urlCache[k]); }); urlCache = {}; return fTx('readwrite', function (s) { return s.clear(); }); }
function dataToBlob(url) { return fetch(url).then(function (r) { return r.blob(); }); }
function fileURL(rec) {
  if (rec.dataUrl) return Promise.resolve(rec.dataUrl);
  if (urlCache[rec.id]) return Promise.resolve(urlCache[rec.id]);
  return fGet(rec.id).then(function (f) { return f ? (urlCache[rec.id] = URL.createObjectURL(f.blob)) : null; });
}
function fileBlob(rec) { return rec.dataUrl ? dataToBlob(rec.dataUrl) : fGet(rec.id).then(function (f) { return f ? f.blob : null; }); }
function mimeOf(n) { n = String(n).toLowerCase(); return /\.pdf$/.test(n) ? 'application/pdf' : /\.jpe?g$/.test(n) ? 'image/jpeg' : /\.png$/.test(n) ? 'image/png' : 'application/octet-stream'; }
/* alte Einträge mit eingebetteten Daten in den Dateispeicher verschieben */
function migrateFiles() {
  var jobs = [];
  function mig(rec) { if (rec && rec.dataUrl) jobs.push(dataToBlob(rec.dataUrl).then(function (b) { return fPut(rec.id, rec.name, b); }).then(function (ok) { if (ok) delete rec.dataUrl; }).catch(function () {})); }
  patients.forEach(function (p) { (p.bilder || []).forEach(mig); (p.dokumente || []).forEach(mig); });
  templates.forEach(mig);
  if (!jobs.length) return Promise.resolve();
  return Promise.all(jobs).then(function () { persist(); });
}
function editFileDate(rec) {
  askDateTime(tsOf(rec), function (t) { rec.ts = t; persist(); renderVerlauf(); });
}
