/*
 * Abgleich der Praxis-App zwischen Geräten und Postfach für Webformulare.
 * Alles, was den Browser verlässt, wird vorher mit einem Schlüssel verschlüsselt, der aus dem Abgleich-Passwort entsteht.
 * Der Server (siehe formular-empfang-wordpress.txt) sieht nur unlesbare Daten.
 */
var KS = (function () {
  // Entwicklungszweig: produktiven WordPress-Endpunkt bewusst nicht verwenden.
  // Erst eine separate Testinstanz mit synthetischen Daten konfigurieren.
  var EP = null; // Nur in einer gesonderten TEST-Umgebung konfigurieren. Keine Produktions-URL!
  var STORES = ['events', 'patients', 'templates', 'invoices', 'settings', 'lager', 'ausgaben', 'todos', 'entw'];
  var S = { busy: false, applying: false, inbox: [], inboxChecked: false, inboxLast: 0, inboxNote: '', err: '', msg: '', obj: [], rev: 0, started: false };
  var enc = new TextEncoder(), dec = new TextDecoder();

  /* ---------- kleine Helfer ---------- */
  function hex(u8) { return Array.prototype.map.call(u8, function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function unhex(h) { var o = new Uint8Array(h.length / 2); for (var i = 0; i < o.length; i++) o[i] = parseInt(h.substr(i * 2, 2), 16); return o; }
  function b64(u8) { var s = '', i; for (i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); }
  function unb64(t) { var s = atob(t), o = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; }
  function get(k) { try { return JSON.parse(kaGet(k)); } catch (x) { return null; } }
  function put(k, v) { kaSet(k, JSON.stringify(v)); }
  function cfg() { var c = get('ka_sync'); return c && c.tok && c.ek ? c : null; }
  function base() { return get('ka_sync_base') || { rev: 0, dirty: false, last: 0 }; }
  function setBase(b) { put('ka_sync_base', b); }
  function h53(str) {
    var h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (var i = 0, ch; i < str.length; i++) { ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }
  function stateHash() { return h53(JSON.stringify(collect())); }
  function nameOf(id) { return 'f_' + String(id).replace(/[^A-Za-z0-9_-]/g, '_'); }
  function err(e) { return e && e.message ? e.message : String(e); }
  function inboxSig() { return (S.inbox || []).map(function (x) { return x.id; }).sort().join('|'); }

  /* ---------- Verschlüsselung ---------- */
  async function derive(pw) {
    var km = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
    var bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', iterations: 250000, salt: enc.encode('ka-abgleich-v1') }, km, 512));
    return { tok: hex(bits.subarray(0, 32)), ek: hex(bits.subarray(32)) };
  }
  function aesKey(c) { return crypto.subtle.importKey('raw', unhex(c.ek), 'AES-GCM', false, ['encrypt', 'decrypt']); }
  async function seal(c, u8) {
    var iv = crypto.getRandomValues(new Uint8Array(12)), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, await aesKey(c), u8));
    var out = new Uint8Array(12 + ct.length); out.set(iv); out.set(ct, 12); return out;
  }
  async function open(c, u8) { return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u8.subarray(0, 12) }, await aesKey(c), u8.subarray(12))); }
  async function gz(u8) {
    if (typeof CompressionStream === 'undefined') return u8;
    var cs = new Blob([u8]).stream().pipeThrough(new CompressionStream('gzip')); return new Uint8Array(await new Response(cs).arrayBuffer());
  }
  async function gunz(u8) {
    var ds = new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip')); return new Uint8Array(await new Response(ds).arrayBuffer());
  }
  async function packJson(c, obj) { var raw = enc.encode(JSON.stringify(obj)), z = typeof CompressionStream !== 'undefined', body = z ? await gz(raw) : raw, o = new Uint8Array(body.length + 1); o[0] = z ? 1 : 0; o.set(body, 1); return seal(c, o); }
  async function unpackJson(c, u8) { var o = await open(c, u8), body = o.subarray(1); return JSON.parse(dec.decode(o[0] === 1 ? await gunz(body) : body)); }

  /* ---------- Server ---------- */
  async function api(a, fields, file) {
    if (!EP) throw new Error('Testmodus: Serverzugriffe gesperrt. Zuerst isolierten Testserver einrichten.');
    // Schutz gegen versehentliches Verbinden mit der produktiven Praxis-Website.
    // Nur ausdrücklich konfigurierte lokale Testinstanzen dürfen angesprochen werden.
    var testUrl;
    try { testUrl = new URL(EP, location.href); } catch (e) { throw new Error('Ungültige Testserver-Adresse.'); }
    var localTest = ['localhost', '127.0.0.1', '[::1]'].includes(testUrl.hostname);
    if (!localTest || !/^https?:$/.test(testUrl.protocol)) {
      throw new Error('Entwicklungsversion: Nur ein lokaler Testserver ist erlaubt. Produktive Server sind gesperrt.');
    }
    var c = fields && fields._c || cfg(); if (!c) throw new Error('Der Abgleich ist nicht eingerichtet.');
    var fd = new FormData(); fd.append('a', a); fd.append('t', c.tok);
    Object.keys(fields || {}).forEach(function (k) { if (k !== '_c') fd.append(k, fields[k]); });
    if (file) fd.append('d', new Blob([file], { type: 'application/octet-stream' }), 'd.bin');
    var r; try { r = await fetch(EP, { method: 'POST', body: fd, cache: 'no-store' }); } catch (x) { var e0 = new Error('Keine Verbindung zum Server.'); e0.offline = true; throw e0; }
    var j = null; try { j = await r.json(); } catch (x) {}
    if (!j || !j.ok) { var e = new Error(j && j.error ? j.error : 'Der Server hat nicht geantwortet (' + r.status + ').'); e.status = r.status; e.rev = j && j.rev; throw e; }
    return j;
  }
  async function getObj(name, c) { var j = await api('get', { n: name, _c: c }); return unb64(j.d); }

  /* ---------- Daten ---------- */
  function collect() { var o = {}; STORES.forEach(function (k) { o[k] = window[k]; }); return { v: 1, stores: o }; }
  function setArr(a, src) { a.length = 0; for (var i = 0; i < src.length; i++) a.push(src[i]); }
  function applyCore(core) {
    var s = core.stores;
    ['events', 'patients', 'templates', 'invoices', 'ausgaben', 'todos', 'entw'].forEach(function (k) { setArr(window[k], Array.isArray(s[k]) ? s[k] : []); });
    Object.keys(settings).forEach(function (k) { delete settings[k]; }); Object.assign(settings, s.settings || {});
    var lg = s.lager || {}; ['produkte', 'chargen', 'verbrauch'].forEach(function (k) { setArr(lager[k], Array.isArray(lg[k]) ? lg[k] : []); });
    try { ensurePatients(); } catch (x) {}
    S.applying = true; try { persist(); } finally { S.applying = false; }
  }
  function modalOpen() { return !!document.querySelector('.modal-overlay.active'); }
  function refreshUi() {
    try { document.querySelectorAll('.modal-overlay.active').forEach(function (m) { closeModal(m.id); }); } catch (x) {}
    try { switchTab(typeof lastTab === 'string' ? lastTab : 'start'); } catch (x) {}
    try { renderPatients(); } catch (x) {}
    try { renderHome(); } catch (x) {}
    ui();
  }
  function fKeys() {
    return fOpen().then(function (db) {
      if (!db) return [];
      return new Promise(function (res) { var r = db.transaction('files').objectStore('files').getAllKeys(); r.onsuccess = function () { res(r.result || []); }; r.onerror = function () { res([]); }; });
    });
  }
  async function packFile(c, id) {
    var rec = await fGet(id); if (!rec || !rec.blob) return null;
    var meta = enc.encode(JSON.stringify({ id: id, name: rec.name, type: rec.type })), body = new Uint8Array(await rec.blob.arrayBuffer()), o = new Uint8Array(4 + meta.length + body.length);
    new DataView(o.buffer).setUint32(0, meta.length); o.set(meta, 4); o.set(body, 4 + meta.length); return seal(c, o);
  }
  async function unpackFile(c, u8) {
    var o = await open(c, u8), n = new DataView(o.buffer, o.byteOffset).getUint32(0), meta = JSON.parse(dec.decode(o.subarray(4, 4 + n)));
    return { id: meta.id, name: meta.name, type: meta.type, blob: new Blob([o.subarray(4 + n)], { type: meta.type || '' }) };
  }
  function progress(t) { S.msg = t; ui(); }

  /* ---------- Hochladen / Herunterladen ---------- */
  async function push(c, st, b) {
    var ids = await fKeys(), local = {}; ids.forEach(function (id) { local[nameOf(id)] = id; });
    var remote = {}; st.objs.forEach(function (o) { if (/^f_/.test(o.n)) remote[o.n] = 1; });
    var up = Object.keys(local).filter(function (n) { return !remote[n]; });
    for (var i = 0; i < up.length; i++) {
      progress('Lade Dateien hoch (' + (i + 1) + ' von ' + up.length + ') …');
      var pk = await packFile(c, local[up[i]]); if (pk) await api('put', { n: up[i], _c: c }, pk);
    }
    progress('Lade Daten hoch …');
    var r = await api('put', { n: 'core', base: st.rev }, await packJson(c, collect()));
    var txt = JSON.stringify(collect().stores);
    Object.keys(remote).forEach(function (n) { if (!local[n] && txt.indexOf('"' + n.slice(2) + '"') < 0) api('del', { n: n }).catch(function () {}); });
    setBase({ rev: r.rev, dirty: false, last: Date.now(), h: stateHash() });
    return r.rev;
  }
  async function pull(c, st) {
    progress('Hole Daten …');
    var core = await unpackJson(c, await getObj('core', c));
    var ids = await fKeys(), local = {}; ids.forEach(function (id) { local[nameOf(id)] = id; });
    var remote = st.objs.filter(function (o) { return /^f_/.test(o.n); }).map(function (o) { return o.n; });
    var down = remote.filter(function (n) { return !local[n]; });
    for (var i = 0; i < down.length; i++) {
      progress('Hole Dateien (' + (i + 1) + ' von ' + down.length + ') …');
      var f = await unpackFile(c, await getObj(down[i], c)); S.applying = true; try { await fPut(f.id, f.name, f.blob); } finally { S.applying = false; }
    }
    applyCore(core);
    var gone = Object.keys(local).filter(function (n) { return remote.indexOf(n) < 0; });
    /* nur Dateien entfernen, auf die der neue Stand nirgends mehr verweist */
    var txt = JSON.stringify(collect()); gone = gone.filter(function (n) { return txt.indexOf('"' + local[n] + '"') < 0; });
    if (gone.length) { S.applying = true; try { for (var k = 0; k < gone.length; k++) await fDel(local[gone[k]]); } finally { S.applying = false; } }
    setBase({ rev: st.rev, dirty: false, last: Date.now(), h: stateHash() });
    refreshUi();
  }
  /* Stand vor dem Überschreiben verschlüsselt auf dem Server ablegen, damit nichts verloren geht */
  async function stash(c, who) {
    var n = 'sich_' + Date.now();
    await api('put', { n: n }, await packJson(c, who === 'local' ? collect() : await unpackJson(c, await getObj('core', c))));
    var st = await api('status'), old = st.objs.filter(function (o) { return /^sich_/.test(o.n); }).map(function (o) { return o.n; }).sort();
    for (var i = 0; i < old.length - 5; i++) await api('del', { n: old[i] });
    return n;
  }
  function decide(st, firstTime) {
    return new Promise(function (res) {
      var d = document.createElement('div'); d.className = 'modal-overlay active'; d.style.zIndex = 120;
      d.innerHTML = '<div class="modal-box"><div class="modal-header"><strong>Welcher Stand gilt?</strong></div><div style="font-size:14px;color:#334155">' +
        (firstTime ? 'Auf diesem Gerät sind schon Daten gespeichert, und auf dem Server liegt ebenfalls ein Stand.' : 'Auf dem Server liegt ein neuerer Stand von einem anderen Gerät, und auf diesem Gerät wurde inzwischen auch etwas geändert.') +
        '<p style="margin:10px 0">Der Stand, der nicht gewinnt, wird vorher verschlüsselt auf dem Server aufgehoben. Du kannst ihn später im Abgleich wieder zurückholen.</p></div>' +
        '<div class="foot-bar"><button type="button" class="btn btn-cancel" data-v="later">Später</button><button type="button" class="btn btn-secondary" data-v="local">Dieses Gerät gilt</button><button type="button" class="btn btn-save" data-v="remote">Server gilt</button></div></div>';
      d.addEventListener('click', function (ev) { var v = ev.target.getAttribute && ev.target.getAttribute('data-v'); if (!v) return; d.remove(); res(v); });
      document.body.appendChild(d);
    });
  }

  /* ---------- Ablauf ---------- */
  async function run(manual) {
    if (!manual) return; // Entwicklungsmodus: keine automatischen Netzwerkabfragen
    var c = cfg(); if (!c || S.busy) return; if (!navigator.onLine) { S.err = 'Offline'; ui(); return; }
    S.busy = true; S.err = ''; S.msg = ''; ui();
    try {
      var st = await api('status'), b = base(), hasCore = st.objs.some(function (o) { return o.n === 'core'; });
      if (b.dirty && b.h && stateHash() === b.h) { b.dirty = false; setBase(b); }   // nur angefasst, nichts geändert
      // Der Geräteabgleich verarbeitet keine Postfacheingänge.
      S.obj = st.objs; S.rev = st.rev;
      if (!hasCore) await push(c, st, b);
      else if (st.rev > b.rev && !b.dirty) { if (modalOpen() && !manual) S.msg = 'Neuer Stand vom Server wartet.'; else await pull(c, st); }
      else if (st.rev > b.rev && b.dirty) {
        if (modalOpen() && !manual) S.msg = 'Konflikt: bitte später abgleichen.';
        else {
          var v = await decide(st, b.rev === 0);
          if (v === 'remote') { await stash(c, 'local'); await pull(c, st); }
          else if (v === 'local') { await stash(c, 'remote'); await push(c, st, b); }
        }
      } else if (b.dirty) await push(c, st, b);
      else { b.last = Date.now(); setBase(b); }
    } catch (e) {
      if (e.status === 409) { S.err = 'Ein anderes Gerät war schneller. Beim nächsten Abgleich entscheidest Du.'; var bb = base(); bb.dirty = true; setBase(bb); }
      else if (e.status === 404 && /nichts eingerichtet/.test(err(e))) S.err = 'Das Abgleich-Passwort wurde geändert. Bitte hier auf „Trennen“ tippen und mit dem neuen Passwort verbinden.';
      else S.err = err(e);
    } finally {
      // Geräteabgleich und Postfach bleiben strikt getrennte Nutzeraktionen.
      S.busy = false; S.msg = ''; ui();
    }
  }
  function touch() {
    // Kalenderexport nur nach ausdrücklichem Aufruf.
    if (S.applying) return; var c = cfg(); if (!c) return;
    var b = base(); if (!b.dirty) { b.dirty = true; setBase(b); }
    ui(); // Änderungen nur lokal markieren, nicht automatisch übertragen
  }

  /* ---------- Einrichten ---------- */
  async function newKeys(c) {
    var kp = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    var pub = await crypto.subtle.exportKey('jwk', kp.publicKey), priv = await crypto.subtle.exportKey('jwk', kp.privateKey);
    return { pub: pub, priv: priv };
  }
  /* Öffentlicher Schlüssel aus dem privaten dieses Geräts: so passt der Schlüssel der Formulare immer zum Postfach */
  async function ensurePub(c) {
    if (!c || !c.priv || !c.priv.n || !c.priv.e || S.pubOk === c.tok) return;
    await api('pubset', { k: JSON.stringify({ kty: 'RSA', n: c.priv.n, e: c.priv.e, alg: 'RSA-OAEP-256', ext: true, key_ops: ['encrypt'] }), _c: c });
    S.pubOk = c.tok;
  }
  async function setup(pw, code) {
    var d = await derive(pw), c = { tok: d.tok, ek: d.ek };
    var r = await api('init', { e: code || '', _c: c });
    if (!r.neu) throw new Error('Mit diesem Passwort gibt es schon einen Bereich. Wähle „Mit vorhandenem verbinden“ oder ein anderes Passwort.');
    var k = await newKeys(c);
    await api('put', { n: 'keys', _c: c }, await packJson(c, k));
    await api('pubset', { k: JSON.stringify(k.pub), _c: c });
    c.priv = k.priv; put('ka_sync', c); setBase({ rev: 0, dirty: true, last: 0 });
    await run(true);
  }
  async function connect(pw) {
    var d = await derive(pw), c = { tok: d.tok, ek: d.ek }, k;
    try { await api('status', { _c: c }); } catch (e) { throw e.status === 404 ? new Error('Das Passwort stimmt nicht, oder auf dem Server ist noch nichts eingerichtet.') : e; }
    try { k = await unpackJson(c, await getObj('keys', c)); } catch (e) { throw new Error('Die Schlüssel auf dem Server konnten nicht gelesen werden.'); }
    c.priv = k.priv; put('ka_sync', c);
    var empty = !patients.length && !events.length && !invoices.length;
    setBase({ rev: 0, dirty: !empty, last: 0 });
    await run(true);
  }
  function disconnect() { try { kaSet('ka_sync', 'null'); kaSet('ka_sync_base', 'null'); } catch (x) {} S.inbox = []; S.inboxChecked = false; S.inboxLast = 0; S.inboxNote = ''; S.obj = []; ui(); }

  /* ---------- Passwort ändern: neuer Bereich mit neuem Schlüssel, alles umverschlüsselt, alter Bereich wird gelöscht ---------- */
  async function dropArea(c) {
    try { await api('drop', { _c: c }); return true; } catch (e) {}
    try { var st = await api('status', { _c: c }); for (var i = 0; i < st.objs.length; i++) await api('del', { n: st.objs[i].n, _c: c }); return true; } catch (e) { return false; }
  }
  async function changePw(oldPw, newPw, code) {
    var c = cfg(); if (!c) throw new Error('Der Abgleich ist nicht eingerichtet.');
    if (S.busy) throw new Error('Der Abgleich läuft gerade. Bitte gleich noch einmal versuchen.');
    if (!navigator.onLine) throw new Error('Keine Verbindung zum Server.');
    var od = await derive(oldPw); if (od.tok !== c.tok) throw new Error('Das aktuelle Passwort stimmt nicht.');
    var nd = await derive(newPw); if (nd.tok === c.tok) throw new Error('Das neue Passwort ist gleich dem alten.');
    await run(true);
    if (S.err || base().dirty) throw new Error(S.err || 'Bitte zuerst abgleichen und einen Konflikt klären.');
    var nc = { tok: nd.tok, ek: nd.ek }, made = false, switched = false;
    S.busy = true; S.err = ''; ui();
    try {
      var st = await api('status'), core = st.objs.some(function (o) { return o.n === 'core'; });
      if (!core) throw new Error('Auf dem Server liegt noch kein Stand. Bitte zuerst abgleichen.');
      var r = await api('init', { e: code || '', alt: c.tok, _c: nc });   /* alt: weist den bisherigen Bereich aus, damit der Server den neuen erlaubt */
      if (!r.neu) throw new Error('Mit diesem Passwort gibt es schon einen Bereich. Bitte ein anderes wählen.');
      made = true; await ensurePub({ tok: nc.tok, ek: nc.ek, priv: c.priv });
      var names = st.objs.map(function (o) { return o.n; }).sort(function (a, b) { return (a === 'core') - (b === 'core'); }), rev = 0;
      for (var i = 0; i < names.length; i++) {
        progress('Verschlüssele neu (' + (i + 1) + ' von ' + names.length + ') …');
        var raw = await getObj(names[i], c), out = /^f_/.test(names[i]) ? await seal(nc, await open(c, raw)) : await packJson(nc, await unpackJson(c, raw));
        var j = await api('put', { n: names[i], base: 0, _c: nc }, out); if (names[i] === 'core') rev = j.rev;
      }
      nc.priv = c.priv; put('ka_sync', nc); switched = true; setBase({ rev: rev, dirty: false, last: Date.now(), h: stateHash() });
      progress('Lösche den alten Bereich …');
      return await dropArea(c);
    } catch (e) {
      if (made && !switched) await dropArea(nc);
      throw e;
    } finally { S.busy = false; S.msg = ''; ui(); }
  }

  async function backups() { var st = await api('status'); return st.objs.filter(function (o) { return /^sich_/.test(o.n); }).map(function (o) { return o.n; }).sort().reverse(); }
  async function restoreBackup(n) {
    var c = cfg(); var core = await unpackJson(c, await getObj(n, c)); applyCore(core);
    var b = base(); b.dirty = true; setBase(b); refreshUi();
    // Nach Wiederherstellung niemals automatisch überschreiben oder hochladen.
    S.msg = 'Wiederhergestellt. Änderungen warten auf einen manuellen Abgleich.'; ui();
  }

  /* ---------- Kalender ohne Namen (für Google, Apple usw.): immer nur „Belegt“, keine Kürzel ---------- */
  function icsZ(t) { return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function calBuild() {
    var now = Date.now(), from = now - 7 * 86400000, salt = settings.calToken || '';
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kreuzberg Aesthetik//Praxis//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Praxis (belegt)', 'X-PUBLISHED-TTL:PT1H', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H'];
    events.forEach(function (e) {
      if (e.phase === 'Abgesagt') return;
      var t = new Date(e.date + 'T' + e.time + ':00').getTime(); if (!t || t < from) return;
      var sum = 'Belegt';
      L.push('BEGIN:VEVENT', 'UID:' + h53(salt + '|' + e.patient + '|' + e.date + e.time) + '@praxis', 'DTSTAMP:' + icsZ(now), 'DTSTART:' + icsZ(t), 'DTEND:' + icsZ(t + (+e.dur || 60) * 60000), 'SUMMARY:' + sum, 'TRANSP:OPAQUE', 'END:VEVENT');
    });
    L.push('END:VCALENDAR'); return L.join('\r\n') + '\r\n';
  }
  function calUrl() { return EP && settings.calToken ? EP.replace(/abgleich$/, 'kalender') + '?c=' + settings.calToken : ''; }
  async function calPush() {
    if (!settings.calOn || !settings.calToken) return; var c = cfg(); if (!c) { S.calErr = 'Erst den Geräte-Abgleich einrichten.'; ui(); return; }
    try { await api('calput', { c: settings.calToken }, enc.encode(calBuild())); S.calErr = ''; S.calLast = Date.now(); }
    catch (e) { S.calErr = err(e); }
    ui();
  }
  async function calOff() { var tk = settings.calToken, c = cfg(); settings.calOn = false; settings.calToken = ''; persist(); if (tk && c) { try { await api('caldel', { c: tk }); } catch (e) {} } S.calErr = ''; ui(); }
  async function calOn() {
    if (!cfg()) { S.calErr = 'Erst den Geräte-Abgleich einrichten.'; ui(); return; }
    if (!settings.calToken) { var r = crypto.getRandomValues(new Uint8Array(16)); settings.calToken = hex(r); }
    settings.calOn = true; persist();
    // Kalenderexport erst nach explizitem Klick auf „Jetzt aktualisieren“.
    S.calErr = ''; ui();
  }

  /* ---------- Postfach ---------- */
  async function openPaket(c, u8) {
    var n = (u8[0] << 8) | u8[1], wrapped = u8.subarray(2, 2 + n), iv = u8.subarray(2 + n, 14 + n), ct = u8.subarray(14 + n);
    var priv = await crypto.subtle.importKey('jwk', c.priv, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
    var raw = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, wrapped), ak = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, ak, ct)));
  }
  /* Eigenständiger Postfachabruf ausschließlich nach Nutzeraktion. */
  async function abrufen() {
    var c = cfg();
    if (!c) { alert('Der Postfach-Schlüssel ist noch nicht eingerichtet (Praxis, Abgleich).'); return; }
    if (S.busy) return;
    S.busy = true; S.err = ''; S.msg = 'Postfach abrufen …'; S.inboxNote = ''; ui();
    try {
      // EP bleibt im isolierten Entwicklungszweig deaktiviert.
      if (!EP) throw new Error('Testmodus: keine Serververbindung eingerichtet.');
      await ensurePub(c);
      var st = await api('status');
      S.inbox = Array.isArray(st.inbox) ? st.inbox : [];
      S.inboxChecked = true; S.inboxLast = Date.now();
      if (!S.inbox.length) { S.inboxNote = 'Keine neuen Eingänge'; alert('Das Postfach ist leer.'); return; }
      var entries = [], ids = [], bad = [];
      for (var i = 0; i < S.inbox.length; i++) {
        var id = S.inbox[i].id;
        try {
          var o = await openPaket(c, await api('ibget', { id: id }).then(function (j) { return unb64(j.d); }));
          entries.push({ d: o.daten, pdf: o.pdf ? new File([unb64(o.pdf)], o.pdfName || 'Formular.pdf', { type: 'application/pdf' }) : null });
          ids.push(id);
        } catch (x) { bad.push(id); }
      }
      var ok = entries.length ? await formularImport(entries) : [];
      // Erst nach dem abgeschlossenen verschlüsselten lokalen Schreibvorgang löschen.
      if (ok.some(function (v) { return !!v; })) {
        if (typeof kaIdle !== 'function') throw new Error('Speicherbestätigung nicht verfügbar. Postfacheingänge bleiben erhalten.');
        await kaIdle();
      }
      var imported = 0;
      for (var k = 0; k < ids.length; k++) if (ok && ok[k]) {
        // Nur durch den Import als erfolgreich bestätigte Eingänge quittieren.
        await api('ibdel', { id: ids[k] });
        imported++;
      }
      S.inboxNote = imported + ' übernommen' + (bad.length ? ', ' + bad.length + ' nicht entschlüsselbar' : '');
      if (bad.length) alert(bad.length + ' Eingang/Eingänge konnten nicht entschlüsselt werden. Sie bleiben im Postfach.');
      st = await api('status'); S.inbox = Array.isArray(st.inbox) ? st.inbox : [];
    } catch (e) { S.err = 'Postfach: ' + err(e); alert('Abrufen nicht möglich: ' + err(e)); }
    finally { S.busy = false; S.msg = ''; ui(); }
  }

  /* ---------- Anzeige ---------- */
  function ago(ts) { if (!ts) return 'noch nie'; var m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'gerade eben' : m < 60 ? 'vor ' + m + ' Min.' : m < 1440 ? 'vor ' + Math.round(m / 60) + ' Std.' : new Date(ts).toLocaleDateString('de-DE'); }
  function ui() {
    var c = cfg(), b = c ? base() : null, n = S.inbox.length;
    var btn = document.getElementById('pt-abrufen'); if (btn) { btn.style.display = c ? '' : 'none'; btn.disabled = S.busy; btn.textContent = n ? 'Postfach abrufen (' + n + ')' : 'Postfach abrufen'; btn.classList.toggle('has-new', n > 0); }
    var bar = document.getElementById('ks-bar'); if (bar) { bar.style.display = c && n ? 'flex' : 'none'; var t = document.getElementById('ks-bar-t'); if (t) t.textContent = n === 1 ? '1 neues Formular im Postfach' : n + ' neue Formulare im Postfach'; }
    var kb = document.getElementById('kal-box');
    if (kb) {
      var on = !!settings.calOn;
      kb.querySelector('.kb-off').style.display = on ? 'none' : ''; kb.querySelector('.kb-on').style.display = on ? '' : 'none';
      kb.querySelector('.kb-url').value = calUrl();
      var ke = kb.querySelector('.kb-state'); ke.textContent = S.calErr ? S.calErr : on ? (S.calLast ? 'Zuletzt manuell aktualisiert: ' + ago(S.calLast) : 'Noch nicht manuell veröffentlicht') : ''; ke.style.color = S.calErr ? '#b91c1c' : '#64748b';
    }
    var box = document.getElementById('sync-box'); if (!box) return;
    box.querySelector('.sy-off').style.display = c ? 'none' : '';
    box.querySelector('.sy-on').style.display = c ? '' : 'none';
    if (c) {
      var st = box.querySelector('.sy-state');
      st.textContent = S.busy ? (S.msg || 'Verbindung läuft …') : S.err ? S.err : b.dirty ? 'Lokale Änderungen warten auf manuellen Geräteabgleich' : b.last ? 'Letzter Geräteabgleich: ' + ago(b.last) : 'Noch kein Geräteabgleich durchgeführt';
      st.className = 'sy-state' + (S.err ? ' bad' : b.dirty || S.busy ? ' wait' : ' good');
      box.querySelector('.sy-inbox').textContent = !S.inboxChecked ? 'Postfach noch nicht geprüft' : n ? n + ' Formular(e) im Postfach (Prüfung ' + ago(S.inboxLast) + ')' : 'Postfach zuletzt geprüft: ' + ago(S.inboxLast) + ' · ' + (S.inboxNote || 'Keine neuen Eingänge');
      var fp = box.querySelector('.sy-form-pending'); if (fp) fp.style.display = settings.formPublishPending ? '' : 'none';
      var pb = box.querySelector('.sy-publish'); if (pb) pb.disabled = S.busy || !settings.formPublishPending;
    }
  }
  function init() {
    if (S.started) return; S.started = true;
    var hf = function (name) { var f = window[name]; if (typeof f !== 'function') return; window[name] = function () { var r = f.apply(this, arguments); if (r && r.then) return r.then(function (v) { if (v) touch(); return v; }); return r; }; };
    hf('fPut'); hf('fDel');
    ui(); // Keine automatischen Abfragen bei Start, Sichtbarkeit, Online-Status oder Intervall.
  }
  async function extFetch(url) { var j = await api('calget', { u: url }); return j.ics; }
  /* Formular-Editor: Änderungen lokal vormerken, keinesfalls beim Speichern senden. */
  function txtset() { settings.formPublishPending = true; persist(); ui(); }
  /* Getrennter manueller Vorgang zur Veröffentlichung öffentlicher Formulartexte. */
  async function publishForms() {
    if (S.busy) throw new Error('Ein anderer Vorgang läuft noch.');
    var c = cfg(); if (!c) throw new Error('Der Serverzugang ist noch nicht eingerichtet.');
    S.busy = true; S.msg = 'Veröffentliche Formulare …'; S.err = ''; ui();
    try {
      await api('txtset', { k: JSON.stringify(settings.formTexte || {}), f: JSON.stringify(settings.formFelder || {}) });
      settings.formPublishPending = false; persist(); return true;
    } catch (e) { S.err = 'Formularveröffentlichung: ' + err(e); throw e; }
    finally { S.busy = false; S.msg = ''; ui(); }
  }
  return { extFetch: extFetch, calOn: calOn, calOff: calOff, calPush: calPush, calUrl: calUrl, calBuild: calBuild, txtset: txtset, publishForms: publishForms, init: init, run: run, touch: touch, setup: setup, connect: connect, disconnect: disconnect, changePw: changePw, abrufen: abrufen, ui: ui, backups: backups, restoreBackup: restoreBackup, state: S, cfg: cfg, base: base };
})();