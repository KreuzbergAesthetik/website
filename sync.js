/*
 * Abgleich der Praxis-App zwischen Geräten und Postfach für Webformulare.
 * Alles, was den Browser verlässt, wird vorher mit einem Schlüssel verschlüsselt, der aus dem Abgleich-Passwort entsteht.
 * Der Server (siehe formular-empfang-wordpress.txt) sieht nur unlesbare Daten.
 */
var KS = (function () {
  var EP = 'https://www.kreuzberg-aesthetik.de/wp-json/ka/v1/abgleich';
  var STORES = ['events', 'patients', 'templates', 'invoices', 'settings', 'lager', 'ausgaben', 'todos', 'entw'];
  var S = { busy: false, applying: false, timer: null, poll: null, inbox: [], err: '', msg: '', obj: [], rev: 0, started: false };
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
    var c = cfg(); if (!c || S.busy) return; if (!navigator.onLine) { S.err = 'Offline'; ui(); return; }
    S.busy = true; S.err = ''; S.msg = ''; ui();
    try {
      var st = await api('status'), b = base(), hasCore = st.objs.some(function (o) { return o.n === 'core'; });
      if (b.dirty && b.h && stateHash() === b.h) { b.dirty = false; setBase(b); }   // nur angefasst, nichts geändert
      S.inbox = st.inbox || []; S.obj = st.objs; S.rev = st.rev;
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
    } finally { S.busy = false; S.msg = ''; ui(); }
  }
  function touch() {
    if (settings.calOn && !S.applying) { clearTimeout(S.calT); S.calT = setTimeout(calPush, 15000); }
    if (S.applying) return; var c = cfg(); if (!c) return;
    var b = base(); if (!b.dirty) { b.dirty = true; setBase(b); }
    clearTimeout(S.timer); S.timer = setTimeout(function () { run(false); }, 6000); ui();
  }

  /* ---------- Einrichten ---------- */
  async function newKeys(c) {
    var kp = await crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['encrypt', 'decrypt']);
    var pub = await crypto.subtle.exportKey('jwk', kp.publicKey), priv = await crypto.subtle.exportKey('jwk', kp.privateKey);
    return { pub: pub, priv: priv };
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
  function disconnect() { try { kaSet('ka_sync', 'null'); kaSet('ka_sync_base', 'null'); } catch (x) {} S.inbox = []; S.obj = []; ui(); }

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
      var r = await api('init', { e: code || '', _c: nc });
      if (!r.neu) throw new Error('Mit diesem Passwort gibt es schon einen Bereich. Bitte ein anderes wählen.');
      made = true;
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
    var b = base(); b.dirty = true; setBase(b); refreshUi(); await run(true);
  }

  /* ---------- Kalender ohne Namen (für Google, Apple usw.) ---------- */
  function icsZ(t) { return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function calBuild() {
    var kz = settings.calMode === 'kuerzel', now = Date.now(), from = now - 7 * 86400000, salt = settings.calToken || '';
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kreuzberg Aesthetik//Praxis//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Praxis (belegt)', 'X-PUBLISHED-TTL:PT1H', 'REFRESH-INTERVAL;VALUE=DURATION:PT1H'];
    events.forEach(function (e) {
      if (e.phase === 'Abgesagt') return;
      var t = new Date(e.date + 'T' + e.time + ':00').getTime(); if (!t || t < from) return;
      var sum = 'Belegt';
      if (kz) { var p = patients.filter(function (x) { return nameKey(x) === e.patient; })[0]; if (p) { var v = noTitel(p.vorname), n = noTitel(p.nachname); sum = ((v.charAt(0) || '') + (n.charAt(0) || '')).toUpperCase() || 'Belegt'; } }
      L.push('BEGIN:VEVENT', 'UID:' + h53(salt + '|' + e.patient + '|' + e.date + e.time) + '@praxis', 'DTSTAMP:' + icsZ(now), 'DTSTART:' + icsZ(t), 'DTEND:' + icsZ(t + (+e.dur || 60) * 60000), 'SUMMARY:' + sum, 'TRANSP:OPAQUE', 'END:VEVENT');
    });
    L.push('END:VCALENDAR'); return L.join('\r\n') + '\r\n';
  }
  function calUrl() { return settings.calToken ? EP.replace(/abgleich$/, 'kalender') + '?c=' + settings.calToken : ''; }
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
    settings.calOn = true; persist(); await calPush();
  }

  /* ---------- Postfach ---------- */
  async function openPaket(c, u8) {
    var n = (u8[0] << 8) | u8[1], wrapped = u8.subarray(2, 2 + n), iv = u8.subarray(2 + n, 14 + n), ct = u8.subarray(14 + n);
    var priv = await crypto.subtle.importKey('jwk', c.priv, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
    var raw = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, priv, wrapped), ak = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['decrypt']);
    return JSON.parse(dec.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, ak, ct)));
  }
  async function abrufen() {
    var c = cfg(); if (!c) { alert('Der Abgleich ist noch nicht eingerichtet (Praxis, Abgleich).'); return; }
    if (S.busy) return; S.busy = true; ui();
    try {
      var st = await api('status'); S.inbox = st.inbox || [];
      if (!S.inbox.length) { alert('Das Postfach ist leer.'); return; }
      var entries = [], ids = [], bad = [];
      for (var i = 0; i < S.inbox.length; i++) {
        var id = S.inbox[i].id;
        try {
          var o = await openPaket(c, await api('ibget', { id: id }).then(function (j) { return unb64(j.d); }));
          entries.push({ d: o.daten, pdf: o.pdf ? new File([unb64(o.pdf)], o.pdfName || 'Formular.pdf', { type: 'application/pdf' }) : null }); ids.push(id);
        } catch (x) { bad.push(id); }
      }
      var ok = entries.length ? await formularImport(entries) : [];
      for (var k = 0; k < ids.length; k++) if (ok && ok[k]) await api('ibdel', { id: ids[k] }).catch(function () {});
      if (bad.length && confirm(bad.length + ' Eingang/Eingänge konnten nicht entschlüsselt werden (anderer Schlüssel oder beschädigt). Aus dem Postfach löschen?')) for (var m = 0; m < bad.length; m++) await api('ibdel', { id: bad[m] }).catch(function () {});
      st = await api('status'); S.inbox = st.inbox || [];
    } catch (e) { alert('Abrufen nicht möglich: ' + err(e)); }
    finally { S.busy = false; ui(); }
  }

  /* ---------- Anzeige ---------- */
  function ago(ts) { if (!ts) return 'noch nie'; var m = Math.round((Date.now() - ts) / 60000); return m < 1 ? 'gerade eben' : m < 60 ? 'vor ' + m + ' Min.' : m < 1440 ? 'vor ' + Math.round(m / 60) + ' Std.' : new Date(ts).toLocaleDateString('de-DE'); }
  function ui() {
    var c = cfg(), b = c ? base() : null, n = S.inbox.length;
    var btn = document.getElementById('pt-abrufen'); if (btn) { btn.style.display = c && n ? '' : 'none'; btn.textContent = n ? 'Abrufen (' + n + ')' : 'Abrufen'; btn.classList.toggle('has-new', n > 0); }
    var bar = document.getElementById('ks-bar'); if (bar) { bar.style.display = c && n ? 'flex' : 'none'; var t = document.getElementById('ks-bar-t'); if (t) t.textContent = n === 1 ? '1 neues Formular im Postfach' : n + ' neue Formulare im Postfach'; }
    var kb = document.getElementById('kal-box');
    if (kb) {
      var on = !!settings.calOn;
      kb.querySelector('.kb-off').style.display = on ? 'none' : ''; kb.querySelector('.kb-on').style.display = on ? '' : 'none';
      kb.querySelector('.kb-url').value = calUrl(); kb.querySelector('.kb-mode').value = settings.calMode === 'kuerzel' ? 'kuerzel' : 'belegt';
      var ke = kb.querySelector('.kb-state'); ke.textContent = S.calErr ? S.calErr : on ? (S.calLast ? 'Zuletzt aktualisiert: ' + ago(S.calLast) : 'Wird aktualisiert …') : ''; ke.style.color = S.calErr ? '#b91c1c' : '#64748b';
    }
    var box = document.getElementById('sync-box'); if (!box) return;
    box.querySelector('.sy-off').style.display = c ? 'none' : '';
    box.querySelector('.sy-on').style.display = c ? '' : 'none';
    if (c) {
      var st = box.querySelector('.sy-state');
      st.textContent = S.busy ? (S.msg || 'Gleiche ab …') : S.err ? S.err : b.dirty ? 'Änderungen warten auf den Abgleich' : 'Alles abgeglichen (' + ago(b.last) + ')';
      st.className = 'sy-state' + (S.err ? ' bad' : b.dirty || S.busy ? ' wait' : ' good');
      box.querySelector('.sy-inbox').textContent = n ? n + ' Formular(e) im Postfach' : 'Postfach leer';
    }
  }
  function init() {
    if (S.started) return; S.started = true;
    var hf = function (name) { var f = window[name]; if (typeof f !== 'function') return; window[name] = function () { var r = f.apply(this, arguments); if (r && r.then) return r.then(function (v) { if (v) touch(); return v; }); return r; }; };
    hf('fPut'); hf('fDel');
    setTimeout(function () { run(false); ui(); }, 1500); setTimeout(calPush, 5000); ui();
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') run(false); });
    window.addEventListener('online', function () { run(false); });
    S.poll = setInterval(function () { if (document.visibilityState === 'visible') run(false); }, 180000);
  }
  async function extFetch(url) { var j = await api('calget', { u: url }); return j.ics; }
  async function txtset(obj, felder) { var c = cfg(); if (!c) throw new Error('Der Geräte-Abgleich ist nicht eingerichtet.'); var f = { k: JSON.stringify(obj || {}), _c: c }; if (felder) f.f = JSON.stringify(felder); await api('txtset', f); }
  return { extFetch: extFetch, calOn: calOn, calOff: calOff, calPush: calPush, calUrl: calUrl, calBuild: calBuild, txtset: txtset, init: init, run: run, touch: touch, setup: setup, connect: connect, disconnect: disconnect, changePw: changePw, abrufen: abrufen, ui: ui, backups: backups, restoreBackup: restoreBackup, state: S, cfg: cfg, base: base };
})();
