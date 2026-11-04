
/* ===== Speicher mit verpflichtender Verschlüsselung (AES-GCM) und App-Sperre ===== */
var KA = { enc: false, key: null, mem: {}, q: {}, busy: null, bad: false, booted: false }, KA_ENC = 'enc1:', AL_KEY = 'ka_lock';
function kaB64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.subarray(i, i + 8192)); return btoa(s); }
function kaUnB64(t) { var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
async function kaEncBytes(u8) { var iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, KA.key, u8)), o = new Uint8Array(12 + ct.length); o.set(iv); o.set(ct, 12); return o; }
async function kaDecBytes(u8) { return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u8.subarray(0, 12) }, KA.key, u8.subarray(12))); }
async function kaEncStr(s) { return KA_ENC + kaB64(await kaEncBytes(new TextEncoder().encode(s))); }
async function kaDecStr(t) { return t.indexOf(KA_ENC) === 0 ? new TextDecoder().decode(await kaDecBytes(kaUnB64(t.slice(KA_ENC.length)))) : t; }
function kaOwn(k) { return k.indexOf('ka_') === 0 && k !== AL_KEY; }
function kaGet(k) { if (KA.enc) return Object.prototype.hasOwnProperty.call(KA.mem, k) ? KA.mem[k] : null; return localStorage.getItem(k); }
function kaSet(k, v) { if (!KA.enc) { localStorage.setItem(k, v); return; } KA.mem[k] = String(v); KA.q[k] = 1; kaFlushSoon(); }
function kaFlushSoon() { if (!KA.busy) KA.busy = Promise.resolve().then(kaFlush); }
async function kaFlush() {
  var ks = [];
  try {
    while (Object.keys(KA.q).length) { ks = Object.keys(KA.q); ks.forEach(function (k) { delete KA.q[k]; }); for (var i = 0; i < ks.length; i++) localStorage.setItem(ks[i], await kaEncStr(KA.mem[ks[i]])); ks = []; }
  } catch (e) { ks.forEach(function (k) { KA.q[k] = 1; }); if (!KA.bad) { KA.bad = true; alert('Die letzte Änderung konnte nicht gespeichert werden (Speicher voll?). Bitte jetzt sichern.'); } }
  KA.busy = null; if (Object.keys(KA.q).length && !KA.bad) kaFlushSoon();
}
async function kaIdle() { while (KA.busy || Object.keys(KA.q).length) { if (!KA.busy) kaFlushSoon(); await KA.busy; if (KA.bad) throw new Error('Speichern fehlgeschlagen'); } }
var RJ_KEY = '__ka_restore_journal_v1', RJ_DB = 'ka-restore', RJ_STORE = 'journal', RJ_EARLY = false;
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
async function kaLoadAll() {
  var keys = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (kaOwn(k)) keys.push(k); }
  var mem = {}, q = {};
  for (var j = 0; j < keys.length; j++) { var v = localStorage.getItem(keys[j]); mem[keys[j]] = await kaDecStr(v); if (v.indexOf(KA_ENC) !== 0) q[keys[j]] = 1; }
  KA.mem = mem; KA.q = q; KA.enc = true; if (Object.keys(q).length) kaFlushSoon();
}
window.addEventListener('pagehide', function () { if (KA.enc && Object.keys(KA.q).length) kaFlush(); });

/* Schlüsselverwaltung: Das Passwort schützt einen zufälligen Datenschlüssel (PBKDF2 -> AES-GCM) */
function alGet() { try { return JSON.parse(localStorage.getItem(AL_KEY) || 'null'); } catch (e) { return null; } }
function alPut(c) { try { if (c) localStorage.setItem(AL_KEY, JSON.stringify(c)); else localStorage.removeItem(AL_KEY); } catch (e) { alert('Speichern nicht möglich.'); } }
/* Passkey schon während des frühen Sicherheitsstarts anfordern, nicht erst nach Aufbau der gesamten App. */
try { if (window.pkMaybeAutoUnlock) window.pkMaybeAutoUnlock(); } catch (x) {}
function alHex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
function alSaltBytes(h) { return new Uint8Array(h.match(/../g).map(function (x) { return parseInt(x, 16); })); }
async function alPbk(pw) { return crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits', 'deriveKey']); }
async function alHash(pw, saltHex) { return alHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: alSaltBytes(saltHex), iterations: 150000, hash: 'SHA-256' }, await alPbk(pw), 256)); }
async function alWrapKey(pw, saltHex) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: alSaltBytes(saltHex), iterations: 150000, hash: 'SHA-256' }, await alPbk(pw), { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
async function alWrap(pw, raw, saltHex) { var iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, await alWrapKey(pw, saltHex), raw)), o = new Uint8Array(12 + ct.length); o.set(iv); o.set(ct, 12); return kaB64(o); }
async function alUnwrap(pw, c) { try { var u = kaUnB64(c.wrap); return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, await alWrapKey(pw, c.salt), u.subarray(12))); } catch (e) { return null; } }
function alImportKey(raw) { return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); }
async function alCheck(pw) { var c = alGet(); if (!c) return true; return c.enc ? !!(await alUnwrap(pw, c)) : (await alHash(pw, c.salt)) === c.hash; }

var alFails = 0, alUntil = 0, alTimer = null, alHiddenAt = 0;
function alPrepare() {
  var c = alGet(), fresh = !c, inp = document.getElementById('al-pw'), inp2 = document.getElementById('al-pw2');
  var title = document.getElementById('al-title'), hint = document.getElementById('al-hint'), submit = document.getElementById('al-submit');
  if (!inp || !inp2 || !title || !hint || !submit) return;
  title.textContent = fresh ? 'Sicherheit einrichten' : 'Kreuzberg Ästhetik';
  hint.style.display = fresh ? '' : 'none';
  hint.textContent = fresh ? 'Lege einmalig ein Passwort mit mindestens 8 Zeichen fest. Patientendaten und Dateien werden damit auf diesem Gerät verschlüsselt.' : '';
  inp2.style.display = fresh ? '' : 'none'; inp2.value = '';
  inp.autocomplete = fresh ? 'new-password' : 'current-password';
  submit.textContent = fresh ? 'Verschlüsselung aktivieren' : (c && !c.enc ? 'Entsperren & verschlüsseln' : 'Entsperren');
}
function alLockNow() {
  if (!alGet()) return;
  document.querySelectorAll('.modal-overlay.active').forEach(function (m) { m.dataset.dirty = ''; });
  document.documentElement.classList.add('locked');
  document.getElementById('al-pw').value = ''; document.getElementById('al-msg').textContent = ''; alPrepare();
  setTimeout(function () { document.getElementById('al-pw').focus(); }, 50);
}
async function alActivateEncryption(pw, min) {
  var raw = crypto.getRandomValues(new Uint8Array(32)), salt = alHex(crypto.getRandomValues(new Uint8Array(16)));
  KA.key = await alImportKey(raw);
  alPut({ enc: true, salt: salt, wrap: await alWrap(pw, raw, salt), min: Number.isFinite(+min) ? +min : 5, sweep: true });
  await kaLoadAll(); await kaIdle();
  return raw;
}
async function alUnlock(ev) {
  ev.preventDefault();
  var msg = document.getElementById('al-msg'), inp = document.getElementById('al-pw'), inp2 = document.getElementById('al-pw2'), c = alGet();
  var wait = Math.ceil((alUntil - Date.now()) / 1000);
  if (wait > 0) { msg.textContent = 'Bitte ' + wait + ' Sekunden warten.'; return; }
  if (!c) {
    if (!(window.crypto && crypto.subtle)) { msg.textContent = 'Dieser Browser unterstützt die Verschlüsselung nicht.'; return; }
    if (inp.value.length < 8) { msg.textContent = 'Das Passwort braucht mindestens 8 Zeichen.'; return; }
    if (inp.value !== inp2.value) { msg.textContent = 'Die beiden Passwörter sind nicht gleich.'; return; }
    msg.textContent = 'Daten werden verschlüsselt …';
    try { await alActivateEncryption(inp.value, 5); c = alGet(); }
    catch (e) { KA.key = null; msg.textContent = 'Die Verschlüsselung konnte nicht eingerichtet werden. Bitte erneut versuchen.'; return; }
  } else if (!c.enc) {
    var okLegacy = false;
    try { okLegacy = await alCheck(inp.value); } catch (e) {}
    if (!okLegacy) {
      alFails++; inp.value = ''; msg.textContent = 'Passwort falsch.';
      if (alFails >= 3) { alUntil = Date.now() + Math.min(60, Math.pow(2, alFails - 2)) * 1000; msg.textContent = 'Passwort falsch. Bitte kurz warten.'; }
      return;
    }
    msg.textContent = 'Bestehende Daten werden verschlüsselt …';
    try { await alActivateEncryption(inp.value, c.min); c = alGet(); }
    catch (e) { KA.key = null; msg.textContent = 'Die Verschlüsselung konnte nicht abgeschlossen werden. Bitte erneut entsperren.'; return; }
  } else {
    var raw = null;
    try { raw = await alUnwrap(inp.value, c); } catch (e) {}
    if (!raw) {
      alFails++; inp.value = ''; msg.textContent = 'Passwort falsch.';
      if (alFails >= 3) { alUntil = Date.now() + Math.min(60, Math.pow(2, alFails - 2)) * 1000; msg.textContent = 'Passwort falsch. Bitte kurz warten.'; }
      return;
    }
    if (!KA.enc) {
      try { KA.key = await alImportKey(raw); await rjEarlyCore(); await kaLoadAll(); await kaIdle(); }
      catch (e) { KA.key = null; msg.textContent = 'Die Daten konnten nicht gelesen werden.'; return; }
    }
  }
  alFails = 0; inp.value = ''; inp2.value = ''; msg.textContent = '';
  if (!KA.booted) kaBoot(false);
  try { var rjr = typeof restoreJournalStartup === 'function' ? await restoreJournalStartup() : ''; if (rjr === 'reload') { location.reload(); return; } }
  catch (e) { msg.textContent = 'Die unterbrochene Wiederherstellung konnte nicht sicher abgeschlossen werden. ' + (e && e.message ? e.message : ''); return; }
  document.documentElement.classList.remove('locked'); alArm();
  c = alGet(); if (c && c.enc && c.sweep) kaFilesToEnc().catch(function () {});
}
function alArm() {
  clearTimeout(alTimer); var c = alGet(); if (!c || document.documentElement.classList.contains('locked')) return;
  if (+c.min > 0) alTimer = setTimeout(alLockNow, c.min * 60000);
}
['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(function (t) { document.addEventListener(t, alArm, { passive: true, capture: true }); });
document.addEventListener('visibilitychange', function () {
  var c = alGet(); if (!c || !KA.booted) return;
  if (document.hidden) { alHiddenAt = Date.now(); if (+c.min === 0) alLockNow(); }
  else if (alHiddenAt && Date.now() - alHiddenAt >= c.min * 60000) alLockNow();
});
function alUi() {
  var c = alGet();
  document.getElementById('al-info').textContent = c && c.enc
    ? 'Sperre und Verschlüsselung sind eingeschaltet. Alle Patientendaten, Fotos und Dateien auf diesem Gerät werden verschlüsselt gespeichert.'
    : 'Die Verschlüsselung wird beim nächsten Entsperren automatisch eingerichtet.';
  document.getElementById('al-curg').style.display = c ? '' : 'none';
  document.getElementById('al-warn').textContent = 'Ohne das Passwort lassen sich die Daten nicht wieder herstellen. Es gibt keine „Passwort vergessen“-Funktion. Bitte regelmäßig verschlüsselt sichern und das Passwort an einem sicheren Ort aufbewahren.';
  document.getElementById('al-min').value = String(c ? c.min : 5);
  ['al-cur', 'al-new', 'al-new2'].forEach(function (i) { document.getElementById(i).value = ''; });
  document.getElementById('al-btn').style.display = c ? '' : 'none';
}
async function alSet() {
  var c = alGet(), n = document.getElementById('al-new').value;
  if (!c || !c.enc) { alert('Die Verschlüsselung muss zuerst beim Start der App eingerichtet werden.'); return; }
  if (!(window.crypto && crypto.subtle)) { alert('Dieser Browser unterstützt die Verschlüsselung nicht.'); return; }
  var cur = document.getElementById('al-cur').value, raw = null;
  try { raw = await alUnwrap(cur, c); } catch (e) {}
  if (!raw) { alert('Das aktuelle Passwort stimmt nicht.'); return; }
  if (n.length < 8) { alert('Das neue Passwort braucht mindestens 8 Zeichen.'); return; }
  if (n !== document.getElementById('al-new2').value) { alert('Die beiden neuen Passwörter sind nicht gleich.'); return; }
  var salt = alHex(crypto.getRandomValues(new Uint8Array(16))), min = +document.getElementById('al-min').value;
  alPut({ enc: true, salt: salt, wrap: await alWrap(n, raw, salt), min: min, sweep: c.sweep });
  alUi(); alArm(); alert('Das Passwort wurde geändert.');
}
function alSetMin() { var c = alGet(); if (!c) return; c.min = +document.getElementById('al-min').value; alPut(c); alArm(); }

/* Dateien (IndexedDB) zwischen Klartext und verschlüsselt umstellen */
function kaFileIds() { return fTx('readonly', function (s) { return s.getAllKeys(); }).then(function (r) { return Array.isArray(r) ? r : []; }); }
async function kaFilesToEnc(onp) {
  var ids = await kaFileIds();
  for (var i = 0; i < ids.length; i++) {
    var r = await fTx('readonly', function (s) { return s.get(ids[i]); });
    if (r && r !== true && !r.enc && r.blob) { var e = await kaEncBytes(new Uint8Array(await r.blob.arrayBuffer())), m = await kaEncBytes(new TextEncoder().encode(JSON.stringify({ name: r.name, type: r.type || '' }))); if (await fTx('readwrite', function (s) { return s.put({ id: r.id, enc: e.buffer, emeta: m.buffer }); }) === null) throw new Error('Datei konnte nicht gespeichert werden'); }
    if (onp) onp(i + 1, ids.length);
  }
  var c = alGet(); if (c && c.sweep) { delete c.sweep; alPut(c); }
}
async function kaFilesToPlain(onp) {
  var ids = await kaFileIds();
  for (var i = 0; i < ids.length; i++) {
    var r = await fTx('readonly', function (s) { return s.get(ids[i]); });
    if (r && r !== true && r.enc) { var f = await fRec(r); if (!f) throw new Error('Eine Datei lässt sich nicht entschlüsseln'); if (await fTx('readwrite', function (s) { return s.put({ id: f.id, name: f.name, type: f.type, blob: f.blob }); }) === null) throw new Error('Datei konnte nicht gespeichert werden'); }
    if (onp) onp(i + 1, ids.length);
  }
}
async function alEncryptAll() {
  var c = alGet(), cur = document.getElementById('al-cur').value;
  if (!c || c.enc) return;
  if (!(await alCheck(cur))) { alert('Bitte oben das aktuelle Passwort eingeben.'); return; }
  if (!await kaConfirm('Alle Daten auf diesem Gerät werden jetzt verschlüsselt.\n\nHast Du gerade eine Sicherung gemacht? Ohne das Passwort gibt es danach keinen Zugriff mehr auf die Daten.\n\nJetzt verschlüsseln?')) return;
  progOpen('Daten werden verschlüsselt');
  try {
    var raw = crypto.getRandomValues(new Uint8Array(32)), salt = alHex(crypto.getRandomValues(new Uint8Array(16)));
    KA.key = await alImportKey(raw);
    alPut({ enc: true, salt: salt, wrap: await alWrap(cur, raw, salt), min: c.min, sweep: true });
    progSet(10, 'Daten werden verschlüsselt ...'); await kaLoadAll(); await kaIdle();
    await kaFilesToEnc(function (i, n) { progSet(15 + 80 * i / Math.max(1, n), 'Datei ' + i + ' von ' + n); });
    progSet(100, 'Fertig. Die Daten sind jetzt verschlüsselt.'); document.getElementById('pg-close').style.display = ''; alUi();
  } catch (e) { progClose(true); alert('Das Verschlüsseln wurde unterbrochen: ' + (e && e.message ? e.message : e) + '\n\nDie Daten sind nicht verloren. Beim nächsten Entsperren wird der Rest nachgeholt.'); }
}
async function alDecryptAll() {
  alert('Die lokale Verschlüsselung ist für Praxisdaten verpflichtend und kann nicht deaktiviert werden.');
  return false;
}
async function alRemove() {
  alert('App-Sperre und Verschlüsselung sind für Praxisdaten verpflichtend und können nicht deaktiviert werden.');
  return false;
}
/* Start: ohne Verschlüsselung sofort, mit Verschlüsselung erst nach dem Entsperren */
function kaBoot(lockAfter) {
  if (KA.booted) return; KA.booted = true;
  var sc = document.createElement('script'); sc.text = document.getElementById('ka-main').textContent; document.body.appendChild(sc);
  if (alGet()) { document.getElementById('al-btn').style.display = ''; if (lockAfter) alLockNow(); }
}
function kaStart() {
  document.documentElement.classList.add('locked');
  alPrepare();
  setTimeout(function () { document.getElementById('al-pw').focus(); }, 50);
}
