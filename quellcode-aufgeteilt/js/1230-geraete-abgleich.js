/* ===== Geräte-Abgleich ===== */
function renderVerbindung() {}
/* Handy-Verbindung: Programmteile werden erst beim Öffnen geladen */
function kvLoad(src) { return new Promise(function (res, rej) { var sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = function () { rej(new Error(src)); }; document.head.appendChild(sc); }); }
async function kvOpen() {
  try { if (!window.qrcode) await kvLoad('lib-qrcode.js'); if (!window.jsQR) await kvLoad('lib-jsqr.js'); if (!window.KV) await kvLoad('verbindung.js'); }
  catch (e) { alert('Die Verbindungsfunktion konnte nicht geladen werden.'); return; }
  KV.openTablet();
}
function renderSicherung() {
  vbkState();
  var lb = null; try { lb = kaGet('ka_lastbackup'); } catch (x) {}
  var el = document.getElementById('sk-state'); if (!el) return;
  if (!lb) { el.textContent = 'Noch keine Sicherung auf diesem Gerät'; el.style.color = '#b91c1c'; return; }
  var d = new Date(lb), days = Math.round((new Date(iso(new Date())) - new Date(iso(d))) / 86400000);
  el.textContent = 'Letzte Sicherung: ' + (days === 0 ? 'heute' : days === 1 ? 'gestern' : 'vor ' + days + ' Tagen') + ' um ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' Uhr';
  el.style.color = days >= 2 ? '#92400e' : '#15803d';
}
/* Videos getrennt sichern und laden. Format: ZIP-Teile (je bis 400 MB) mit info.json (Salz, Prüfwert, Teil x von y),
   videos/<id>.enc (AES-GCM, Schlüssel aus dem Passwort mit PBKDF2) und im ersten Teil videos.json.enc (Liste mit Patient, Name, Typ, Größe, Datum, SHA-256). */
var vbkParts = [];
function vbkList() {
  var out = [];
  patients.forEach(function (p) { (p.videos || []).forEach(function (v) { out.push({ p: p, v: v }); }); });
  return out;
}
function vbkState() {
  var el = document.getElementById('vbk-state'); if (!el) return;
  var l = vbkList(); el.textContent = 'Videos werden geprüft …'; el.style.color = '#475569';
  Promise.all(l.map(function (x) { return vHas(x.v.id); })).then(function (h) {
    var n = 0, mb = 0; h.forEach(function (ok, i) { if (ok) { n++; mb += l[i].v.size || 0; } });
    var last = null; try { last = localStorage.getItem('ka_lastvideobackup'); } catch (x) {}
    el.textContent = n ? n + (n === 1 ? ' Video' : ' Videos') + ' auf diesem Gerät (' + fmtMB(mb) + ')' + (last ? ' · zuletzt gesichert am ' + fmtDT(Date.parse(last)) : ' · noch nie gesichert') : 'Keine Videos auf diesem Gerät';
    el.style.color = n && !last ? '#92400e' : '#475569';
  });
}
async function vbkPassword(neu) {
  var pw = await kaPrompt(neu ? 'Passwort für die Videosicherung (mindestens 12 Zeichen). Ohne dieses Passwort lässt sie sich nicht mehr öffnen.' : 'Passwort der Videosicherung:', '', { password: true, ok: 'Weiter' });
  if (pw == null) return null;
  if (!neu) return pw;
  if (pw.length < 12) { alert('Das Passwort braucht mindestens 12 Zeichen.'); return null; }
  var pw2 = await kaPrompt('Passwort wiederholen:', '', { password: true, ok: 'Weiter' });
  if (pw2 == null) return null;
  if (pw2 !== pw) { alert('Die beiden Passwörter stimmen nicht überein.'); return null; }
  return pw;
}
async function vbkExport() {
  var all = vbkList(), have = [];
  for (var i = 0; i < all.length; i++) if (await vHas(all[i].v.id)) have.push(all[i]);
  if (!have.length) { alert('Auf diesem Gerät liegen keine Videos.'); return; }
  var pw = await vbkPassword(true); if (!pw) return;
  progOpen('Videos werden gesichert');
  try {
    var salt = crypto.getRandomValues(new Uint8Array(16)), key = await bkKey(pw, salt, BK_ITER), sid = newId(), parts = [new ZipPart()], meta = [], now = new Date();
    for (var k = 0; k < have.length; k++) {
      var x = have[k], f = await vGet(x.v.id); if (!f) continue;
      progSet(k / have.length * 92, 'Video ' + (k + 1) + ' von ' + have.length + ' wird verschlüsselt');
      var raw = new Uint8Array(await f.blob.arrayBuffer()), hash = await sha256Hex(raw), e = await encEntry(key, raw), eb = new Blob([e]), crc = (crcBytes(e, 0xFFFFFFFF) ^ 0xFFFFFFFF) >>> 0;
      raw = null;
      var part = parts[parts.length - 1];
      if (part.ents.length && part.off + eb.size > BK_PART) { part = new ZipPart(); parts.push(part); }
      part.add('videos/' + x.v.id + '.enc', eb, crc);
      meta.push({ id: x.v.id, pid: x.p.id, patient: nameKey(x.p), name: x.v.name || f.name || '', type: x.v.type || f.type || '', size: x.v.size || f.blob.size, ts: tsOf(x.v), sha256: hash, teil: parts.length });
      await new Promise(function (r) { setTimeout(r, 0); });
    }
    if (!meta.length) throw new Error('Keine Videos lesbar');
    var jb = await encEntry(key, new TextEncoder().encode(JSON.stringify({ format: 'ka-videosicherung', version: 1, id: sid, exportiert: now.toISOString(), videos: meta })));
    parts[0].add('videos.json.enc', new Blob([jb]), (crcBytes(jb, 0xFFFFFFFF) ^ 0xFFFFFFFF) >>> 0);
    var pruef = toB64(await encEntry(key, new TextEncoder().encode('ka-ok')));
    var blobs = parts.map(function (pt, idx) {
      var info = new TextEncoder().encode(JSON.stringify({ format: 'ka-videosicherung-teil', sicherung: sid, teil: idx + 1, von: parts.length, exportiert: now.toISOString(), verschluesselt: true, iter: BK_ITER, salt: toB64(salt), pruefung: pruef }));
      pt.add('info.json', new Blob([info]), (crcBytes(info, 0xFFFFFFFF) ^ 0xFFFFFFFF) >>> 0);
      return pt.finish();
    });
    vbkParts = blobs;
    progSet(100, 'Fertig. Bitte jetzt alle Teile speichern.');
    var base = 'kreuzberg-aesthetik-videos-' + iso(now), box = document.getElementById('pg-parts'), got = 0, total = blobs.length;
    box.innerHTML = ''; bkOpen = total;
    blobs.forEach(function (bl, idx) {
      var nm = base + (total > 1 ? '-teil-' + (idx + 1) + '-von-' + total : '') + '-verschluesselt.zip';
      var row = mk('div'); row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid #f1f5f9;';
      row.appendChild(mk('span', '', (total > 1 ? 'Teil ' + (idx + 1) + ' von ' + total + ' · ' : '') + fmtMB(bl.size)));
      var b = mk('button', 'btn btn-save btn-sm', 'Speichern'); b.type = 'button';
      b.onclick = function () {
        var a = document.createElement('a'); a.href = URL.createObjectURL(bl); a.download = nm; document.body.appendChild(a); a.click(); a.remove();
        if (!b.getAttribute('data-ok')) { b.setAttribute('data-ok', '1'); b.textContent = 'Gespeichert ✓'; got++; bkOpen = total - got; }
        if (got === total) { try { localStorage.setItem('ka_lastvideobackup', new Date().toISOString()); } catch (x) {} vbkState(); document.getElementById('pg-status').textContent = 'Alle Teile wurden gespeichert.'; }
      };
      row.appendChild(b); box.appendChild(row);
    });
    document.getElementById('pg-close').style.display = '';
    return blobs;
  } catch (x) {
    progClose(true);
    alert('Die Videosicherung konnte nicht erstellt werden. (' + (x && x.message ? x.message : 'unbekannter Fehler') + ')');
    return null;
  }
}
async function vbkImport(inp, pwGiven) {
  var files = [].slice.call(inp.files || []).filter(function (f) { return /\.zip$/i.test(f.name) || f.type === 'application/zip'; }); inp.value = '';
  if (!files.length) return null;
  var maps = [], infos = [];
  try {
    for (var i = 0; i < files.length; i++) {
      var m = await readZip(files[i]); if (!m['info.json']) throw new Error('„' + files[i].name + '“ ist keine Videosicherung.');
      var inf = JSON.parse(await m['info.json'].text()); if (!inf || inf.format !== 'ka-videosicherung-teil') throw new Error('„' + files[i].name + '“ ist keine Videosicherung (für die normale Sicherung bitte oben „Laden“ nehmen).');
      maps.push(m); infos.push(inf);
    }
  } catch (x) { alert(x && x.message ? x.message : 'Die Datei konnte nicht gelesen werden.'); return null; }
  var sid = infos[0].sicherung, von = infos[0].von;
  if (infos.some(function (x) { return x.sicherung !== sid; })) { alert('Die gewählten Teile gehören zu verschiedenen Videosicherungen.'); return null; }
  var teile = {}; infos.forEach(function (x) { teile[x.teil] = 1; });
  var fehlt = []; for (var t = 1; t <= von; t++) if (!teile[t]) fehlt.push(t);
  if (fehlt.length) { alert('Es fehlen Teile: ' + fehlt.join(', ') + ' von ' + von + '. Bitte alle Teile gemeinsam wählen.'); return null; }
  var iter = +infos[0].iter;
  if (!Number.isInteger(iter) || iter < 100000 || iter > 2000000) { alert('Ungültige Videosicherung.'); return null; }
  var pw = pwGiven || await vbkPassword(false); if (!pw) return null;
  var key;
  try { key = await bkKey(pw, fromB64(infos[0].salt), iter); var ok = new TextDecoder().decode(await decEntry(key, fromB64(infos[0].pruefung))); if (ok !== 'ka-ok') throw new Error(); }
  catch (x) { alert('Das Passwort stimmt nicht.'); return null; }
  progOpen('Videos werden geladen');
  var res = { neu: 0, schon: 0, ohneAkte: 0, fehler: 0 };
  try {
    var first = maps[infos.findIndex(function (x) { return x.teil === 1; })], jb = first && first['videos.json.enc'];
    if (!jb) throw new Error('Das Verzeichnis der Videos fehlt.');
    var list = JSON.parse(new TextDecoder().decode(await decEntry(key, new Uint8Array(await jb.arrayBuffer())))).videos || [];
    var touched = {};
    for (var k = 0; k < list.length; k++) {
      var v = list[k]; progSet(k / Math.max(1, list.length) * 95, 'Video ' + (k + 1) + ' von ' + list.length);
      var p = patById(v.pid);
      if (!p) { res.ohneAkte++; continue; }
      if (await vHas(v.id)) { res.schon++; }
      else {
        var src = null; maps.forEach(function (mm) { if (mm['videos/' + v.id + '.enc']) src = mm['videos/' + v.id + '.enc']; });
        try {
          if (!src) throw new Error('fehlt');
          var raw = await decEntry(key, new Uint8Array(await src.arrayBuffer()));
          if (await sha256Hex(raw) !== v.sha256) throw new Error('Prüfsumme');
          if (!await vPut(v.id, v.name, new Blob([raw], { type: v.type || '' }))) throw new Error('Speichern');
          res.neu++;
        } catch (x) { res.fehler++; continue; }
      }
      if (!(p.videos || []).some(function (r) { return r.id === v.id; })) {
        var rec = { id: v.id, ts: v.ts, name: v.name, size: v.size, type: v.type };
        p.videos = (p.videos || []).concat([rec]); auditFilesAdded(p, [rec], 'Videos'); touched[p.id] = 1;
      }
      await new Promise(function (r) { setTimeout(r, 0); });
    }
    if (Object.keys(touched).length) persist();
    progSet(100, 'Fertig.'); document.getElementById('pg-close').style.display = '';
    var txt = res.neu + ' Video(s) geladen' + (res.schon ? ', ' + res.schon + ' waren schon da' : '') + (res.ohneAkte ? ', ' + res.ohneAkte + ' ohne passende Akte auf diesem Gerät (zuerst die normale Sicherung laden oder abgleichen)' : '') + (res.fehler ? ', ' + res.fehler + ' fehlerhaft' : '') + '.';
    document.getElementById('pg-status').textContent = txt;
    vbkState(); try { if (curP) renderMedien(); } catch (x) {}
    return res;
  } catch (x) {
    progClose(true); alert('Die Videos konnten nicht geladen werden. (' + (x && x.message ? x.message : 'unbekannter Fehler') + ')'); return null;
  }
}
function calCopy() { var u = KS.calUrl(); copyText(u, function () { alert('Adresse kopiert.'); }, async function () { await kaPrompt('Adresse zum Kopieren:', u, { readonly: true, ok: 'Schließen', single: true }); }); }
async function calOffAsk() { if (await kaConfirm('Kalender ausschalten? Die Adresse wird ungültig, und der Kalender in Google verschwindet nach der nächsten Aktualisierung.')) KS.calOff(); }
function extSave() {
  var v = (document.getElementById('ext-url').value || '').trim(); if (!v) { alert('Bitte die Adresse einfügen.'); return; }
  settings.extUrl = v.replace(/^webcal:/i, 'https:'); persist(); EXT.ui(); EXT.refresh();
}
async function extOff() { if (!await kaConfirm('Privaten Kalender entfernen? Die Adresse wird aus der App gelöscht.')) return; settings.extUrl = ''; persist(); EXT.clear(); EXT.ui(); try { renderCal(); } catch (x) {} }
function extHide(on) { settings.extHide = !!on; persist(); EXT.ui(); try { renderCal(); } catch (x) {} }
function renderSync() { var m = document.getElementById('sy-msg'); if (m) m.textContent = ''; document.getElementById('sy-baks').innerHTML = ''; KS.ui(); EXT.ui(); }
async function syncGo(mode) {
  var pw = document.getElementById('sy-pw').value, m = document.getElementById('sy-msg'); m.className = ''; m.style.color = '#64748b';
  if (pw.length < 12) { m.style.color = '#b91c1c'; m.textContent = 'Das Passwort braucht mindestens 12 Zeichen.'; return; }
  m.textContent = 'Einen Moment, der Schlüssel wird berechnet …';
  try { if (mode === 'setup') await KS.setup(pw, document.getElementById('sy-code').value.trim()); else await KS.connect(pw); document.getElementById('sy-pw').value = ''; m.textContent = ''; }
  catch (e) { m.style.color = '#b91c1c'; m.textContent = e && e.message ? e.message : 'Das hat nicht geklappt.'; }
  KS.ui();
}
function syncPw() {
  var d = document.createElement('div'); d.className = 'modal-overlay active'; d.style.zIndex = 120;
  d.innerHTML = '<div class="modal-box"><div class="modal-header"><strong>Abgleich-Passwort ändern</strong></div>' +
    '<div class="form-group"><label>Aktuelles Passwort</label><input type="password" id="sp-old" class="form-control" autocomplete="current-password"></div>' +
    '<div class="form-group"><label>Neues Passwort (mindestens 12 Zeichen)</label><input type="password" id="sp-new" class="form-control" autocomplete="new-password"></div>' +
    '<div class="form-group"><label>Neues Passwort wiederholen</label><input type="password" id="sp-new2" class="form-control" autocomplete="new-password"></div>' +
    '<div class="form-group"><label>Einrichtungscode (nur falls im Server-Skript eingetragen)</label><input type="text" id="sp-code" class="form-control" autocomplete="off"></div>' +
    '<div class="hm-warn" style="margin-bottom:10px">Alles wird mit dem neuen Passwort neu verschlüsselt, der alte Bereich auf dem Server wird gelöscht. Andere Geräte tippen danach auf „Trennen“ und verbinden sich mit dem neuen Passwort. Notiere das neue Passwort, ohne es sind die Daten nicht mehr lesbar.</div>' +
    '<div id="sp-msg" style="font-size:13px;min-height:18px;margin-bottom:8px"></div>' +
    '<div class="foot-bar"><button type="button" class="btn btn-cancel" id="sp-no">Abbrechen</button><button type="button" class="btn btn-save" id="sp-ok">Ändern</button></div></div>';
  document.body.appendChild(d);
  var m = d.querySelector('#sp-msg'), ok = d.querySelector('#sp-ok'), no = d.querySelector('#sp-no');
  no.onclick = function () { d.remove(); };
  ok.onclick = async function () {
    var o = d.querySelector('#sp-old').value, n = d.querySelector('#sp-new').value, n2 = d.querySelector('#sp-new2').value;
    m.style.color = '#b91c1c';
    if (!o) { m.textContent = 'Bitte das aktuelle Passwort eingeben.'; return; }
    if (n.length < 12) { m.textContent = 'Das neue Passwort braucht mindestens 12 Zeichen.'; return; }
    if (n !== n2) { m.textContent = 'Die beiden neuen Passwörter sind nicht gleich.'; return; }
    ok.disabled = no.disabled = true; m.style.color = '#64748b'; m.textContent = 'Einen Moment, alles wird neu verschlüsselt …';
    try {
      var sauber = await KS.changePw(o, n, d.querySelector('#sp-code').value.trim());
      d.remove(); alert(sauber ? 'Das Passwort ist geändert. Auf anderen Geräten bitte „Trennen“ tippen und mit dem neuen Passwort verbinden.' : 'Das Passwort ist geändert. Der alte Bereich auf dem Server konnte nicht gelöscht werden, er ist aber mit dem alten Passwort verschlüsselt. Auf anderen Geräten bitte „Trennen“ tippen und mit dem neuen Passwort verbinden.');
    } catch (e) { ok.disabled = no.disabled = false; m.style.color = '#b91c1c'; m.textContent = e && e.message ? e.message : 'Das hat nicht geklappt.'; }
  };
}
async function syncOff() { if (await kaConfirm('Abgleich auf diesem Gerät beenden? Die Daten auf diesem Gerät bleiben erhalten, auf dem Server ändert sich nichts.')) KS.disconnect(); }
async function syncBackups() {
  var box = document.getElementById('sy-baks'); box.innerHTML = 'Lade …';
  try {
    var l = await KS.backups(); box.innerHTML = '';
    if (!l.length) { box.textContent = 'Es gibt keine früheren Stände.'; box.style.cssText = 'font-size:13px;color:#64748b;margin-bottom:14px'; return; }
    var h = mk('div', 'ak-h', 'Frühere Stände (von Konflikten)'); box.appendChild(h);
    l.forEach(function (n) {
      var ts = +n.replace('sich_', ''), r = mk('div'); r.style.cssText = 'display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:14px';
      var t = mk('span', '', new Date(ts).toLocaleString('de-DE')); t.style.flex = '1';
      var b = mk('button', 'btn btn-secondary btn-sm', 'Zurückholen'); b.type = 'button';
      b.onclick = async function () { if (await kaConfirm('Diesen Stand auf diesem Gerät einsetzen? Der aktuelle Stand wird dadurch ersetzt (er bleibt auf dem Server bis zum nächsten Abgleich erhalten).')) KS.restoreBackup(n).catch(function (e) { alert(e.message); }); };
      r.appendChild(t); r.appendChild(b); box.appendChild(r);
    });
  } catch (e) { box.textContent = e.message; }
}

