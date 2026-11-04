/* ===== Webformulare ===== */
/* Eigene Namen der drei Formulare (settings.formFelder[Formular].name) in WEBF und PK_FORMS übernehmen */
var FNAME_DEF = { anmeldung: 'Patientenanmeldung', anamnese: 'Anamnesebogen', erinnerung: 'Terminerinnerung' };
function fNamen() {
  var fe = settings.formFelder || {};
  PK_FORMS.forEach(function (f) { if (FNAME_DEF[f[0]]) f[1] = (fe[f[0]] && fe[f[0]].name) || FNAME_DEF[f[0]]; });
  WEBF.forEach(function (w) { var id = String(w[1]).replace(/\.html.*/, ''); if (FNAME_DEF[id]) w[0] = (fe[id] && fe[id].name) || FNAME_DEF[id]; });
}
async function fRename(w) {
  var id = String(w[1]).replace(/\.html.*/, ''); if (!FNAME_DEF[id]) return;
  var v = await kaPrompt('Neuer Name für dieses Formular (leer = ' + FNAME_DEF[id] + '):', w[0]); if (v === null) return;
  v = v.trim(); if (v === FNAME_DEF[id]) v = '';
  settings.formFelder = settings.formFelder || {}; var c = settings.formFelder[id] = settings.formFelder[id] || {}; if (v) c.name = v; else delete c.name;
  persist(); fNamen(); renderWebf();
  if (typeof KS !== 'undefined') KS.txtset(settings.formTexte || {}, settings.formFelder).catch(function () { alert('Der Name ist gespeichert, aber noch nicht auf dem Server veröffentlicht. Er gilt dort nach dem nächsten Speichern im Editor.'); });
}
var WEBF = [['Patientenanmeldung', 'anmeldung.html'], ['Anamnesebogen', 'anamnese.html'], ['Terminerinnerung', 'erinnerung.html']].concat(KA_DOCS.filter(function (d) { return d.typ === 'info'; }).map(function (d) { return [d.name, 'info.html?d=' + d.id]; }));
function webfUrl(f) { try { return new URL(f, location.href).href; } catch (x) { return f; } }
function renderWebf() {
  var box = document.getElementById('wf-list'); if (!box) return; box.innerHTML = '';
  var ic = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>';
  fNamen();
  var hid = settings.wfHidden || [];
  WEBF.filter(function (w) { return hid.indexOf(w[1]) < 0; }).forEach(function (w) {
    var url = webfUrl(w[1]), r = mk('div', 'wf-row');
    r.appendChild(mk('b', 'wf-t', w[0]));
    var ln = mk('div', 'wf-ln'), a = mk('a', 'wf-a', url); a.href = url; a.target = '_blank'; a.rel = 'noopener'; ln.appendChild(a);
    var ib = function (svg, ttl, fn) { var b = mk('button', 'wf-cp'); b.type = 'button'; b.innerHTML = svg; b.title = ttl; b.setAttribute('aria-label', ttl); b.onclick = fn; ln.appendChild(b); return b; };
    var cp = ib(ic, 'Link kopieren', function () { copyText(url, function () { cp.classList.add('ok'); setTimeout(function () { cp.classList.remove('ok'); }, 1500); }, async function () { await kaPrompt('Link zum Kopieren:', url, { readonly: true, ok: 'Schließen', single: true }); }); });
    ib('<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>', 'Formular bearbeiten', function () { fvOpen(w); });
    ib('<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>', 'Weitere Aktionen', function (ev) {
      var it = []; if (FNAME_DEF[String(w[1]).replace(/\.html.*/, '')]) it.push(['Umbenennen', function () { fRename(w); }]);
      it.push(['Texte als Liste', function () { ftOpen(w); }]);
      if (/^(anmeldung|anamnese|erinnerung)\.html/.test(w[1])) it.push(['Felder als Liste', function () { ffOpen(w); }]);
      it.push(['Löschen', async function () {
        if (!await kaConfirm('Formular „' + w[0] + '“ aus der Liste löschen?\n\nDie Seite selbst bleibt online und der Link funktioniert weiter, bis Du ihn nicht mehr verschickst. Gelöschte Formulare kannst Du unten wiederherstellen.', { ok: 'Löschen' })) return;
        settings.wfHidden = (settings.wfHidden || []).concat([w[1]]); persist(); renderWebf();
      }]);
      tlMenu(ev, it);
    });
    r.appendChild(ln);
    box.appendChild(r);
  });
  if (hid.length) {
    var rb = mk('button', 'btn btn-secondary btn-sm', 'Gelöschte Formulare wiederherstellen (' + hid.length + ')'); rb.type = 'button'; rb.style.marginTop = '8px';
    rb.onclick = async function () { if (!await kaConfirm(hid.length + (hid.length === 1 ? ' gelöschtes Formular' : ' gelöschte Formulare') + ' wieder in der Liste anzeigen?', { ok: 'Wiederherstellen', danger: false })) return; settings.wfHidden = []; persist(); renderWebf(); };
    box.appendChild(rb);
  }
}
/* Felder der Webformulare: ausblenden, Pflicht, eigene Zusatzfragen. settings.formFelder[Formular] = { hide, req, extra } */
var ffCur = '', ffDesc = null, ffExtra = [];
var FF_TYPEN = [['text', 'Kurzer Text'], ['lang', 'Langer Text'], ['jn', 'Ja / Nein'], ['wahl', 'Auswahl'], ['datum', 'Datum'], ['haken', 'Haken (Bestätigung)']];
function ffOpen(w) {
  ffCur = w[1].replace(/\.html.*/, ''); ffDesc = null;
  document.getElementById('ff-title').textContent = 'Felder: ' + w[0];
  var body = document.getElementById('ff-body'); body.innerHTML = ''; body.appendChild(mk('div', 'hm-empty', 'Felder werden gelesen ...')); document.getElementById('ff-save').disabled = true; openModal('modal-ffeld');
  var fr = document.createElement('iframe'), url = webfUrl(w[1]); url += (url.indexOf('?') >= 0 ? '&' : '?') + 'ed=1';
  fr.style.cssText = 'position:fixed; left:-9999px; top:0; width:480px; height:800px; border:0; visibility:hidden;';
  var done = false, fin = function (msg) { if (done) return; done = true; try { fr.remove(); } catch (x) {} if (msg) { body.innerHTML = ''; body.appendChild(mk('div', 'hm-empty', msg)); } };
  fr.onload = function () {
    setTimeout(function () {
      if (done) return;
      try {
        var K = fr.contentWindow.KF; if (!K || !K.describe) { fin('Die Seite ist noch nicht auf dem neuesten Stand. Bitte in ein bis zwei Minuten noch einmal versuchen.'); return; }
        ffDesc = K.describe(fr.contentWindow); fin();
        var cur = (settings.formFelder || {})[ffCur] || {}; ffExtra = JSON.parse(JSON.stringify(cur.extra || [])); ffRender();
      } catch (x) { fin('Die Felder konnten nicht gelesen werden.'); }
    }, 500);
  };
  fr.onerror = function () { fin('Die Seite konnte nicht geladen werden.'); };
  document.body.appendChild(fr); fr.src = url;
}
function ffRender() {
  var body = document.getElementById('ff-body'); body.innerHTML = ''; var cur = (settings.formFelder || {})[ffCur] || {}, hide = cur.hide || [], req = cur.req || {};
  var rows = ffDesc.units.map(function (u) { return { k: u.k, t: u.t, lock: u.lock, pf: true, req: u.req }; }).concat(ffDesc.groups.map(function (g) { return { k: g.k, t: g.t, lock: g.lock, pf: false }; }));
  if (rows.length) {
    body.appendChild(mk('div', 'ak-h', ffDesc.groups.length ? 'Fragengruppen' : 'Vorhandene Felder'));
    var tb = mk('div'); tb.id = 'ff-rows';
    rows.forEach(function (r) {
      var row = mk('div', 'ff-row'); row.dataset.k = r.k; row.dataset.dreq = r.req ? '1' : ''; row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px solid #eef2f6;';
      var nm = mk('span', '', r.t); nm.style.cssText = 'flex:1; min-width:0;'; row.appendChild(nm);
      var cb = function (cls, txt, on, dis) { var l = mk('label'); l.style.cssText = 'display:flex; align-items:center; gap:4px; font-size:12.5px; font-weight:400; color:#475569; margin:0;'; var c = mk('input'); c.type = 'checkbox'; c.className = cls; c.checked = on; c.disabled = !!dis; l.appendChild(c); l.appendChild(document.createTextNode(txt)); return l; };
      row.appendChild(cb('ff-show', 'Anzeigen', hide.indexOf(r.k) < 0, r.lock));
      if (r.pf) row.appendChild(cb('ff-req', 'Pflicht', req[r.k] != null ? !!req[r.k] : r.req, r.lock));
      if (r.lock) { var lk = mk('small', '', 'nötig'); lk.style.color = '#94a3b8'; row.appendChild(lk); }
      tb.appendChild(row);
    });
    body.appendChild(tb);
  }
  body.appendChild(mk('div', 'ak-h', 'Eigene Zusatzfragen')); body.lastChild.style.marginTop = '16px';
  var hint = mk('div', '', 'Erscheinen am Ende des Formulars. Die Antworten stehen im PDF und als Notiz in der Akte.'); hint.style.cssText = 'font-size:12.5px; color:#64748b; margin-bottom:8px;'; body.appendChild(hint);
  var xl = mk('div'); xl.id = 'ff-extra'; body.appendChild(xl); ffRenderExtra();
  var add = mk('div', 'add-row', '+ Frage hinzufügen'); add.onclick = function () { ffExtraSync(); ffExtra.push({ id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), label: '', typ: 'text', req: false, opts: [] }); ffRenderExtra(); var ins = document.querySelectorAll('#ff-extra .ffx-l'); if (ins.length) ins[ins.length - 1].focus(); }; body.appendChild(add);
  document.getElementById('ff-save').disabled = false;
}
function ffExtraSync() {
  [].forEach.call(document.querySelectorAll('#ff-extra .ffx'), function (r, i) {
    var f = ffExtra[i]; if (!f) return;
    f.label = r.querySelector('.ffx-l').value.trim(); f.typ = r.querySelector('.ffx-t').value; f.req = r.querySelector('.ffx-r').checked;
    f.opts = r.querySelector('.ffx-o').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
  });
}
function ffRenderExtra() {
  var xl = document.getElementById('ff-extra'); xl.innerHTML = '';
  ffExtra.forEach(function (f, i) {
    var r = mk('div', 'ffx'); r.style.cssText = 'border:1px solid #dbe2ea; border-radius:10px; padding:8px 10px; margin-bottom:8px; background:#f8fafc;';
    var l = mk('input', 'form-control ffx-l'); l.type = 'text'; l.placeholder = 'Frage oder Beschriftung'; l.value = f.label; r.appendChild(l);
    var row = mk('div'); row.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:6px; flex-wrap:wrap;';
    var t = mk('select', 'form-control ffx-t'); t.style.cssText = 'width:auto; flex:1 1 140px;'; FF_TYPEN.forEach(function (o) { var op = mk('option', '', o[1]); op.value = o[0]; t.appendChild(op); }); t.value = f.typ;
    var o = mk('textarea', 'form-control ffx-o'); o.rows = 3; o.placeholder = 'Eine Antwort pro Zeile'; o.value = (f.opts || []).join('\n'); o.style.cssText = 'margin-top:6px;' + (f.typ === 'wahl' ? '' : 'display:none;');
    t.onchange = function () { o.style.display = t.value === 'wahl' ? '' : 'none'; };
    var rl = mk('label'); rl.style.cssText = 'display:flex; align-items:center; gap:4px; font-size:12.5px; font-weight:400; margin:0;'; var rc = mk('input', 'ffx-r'); rc.type = 'checkbox'; rc.checked = !!f.req; rl.appendChild(rc); rl.appendChild(document.createTextNode('Pflicht'));
    var mkb = function (txt, ttl, fn) { var b = mk('button', 'x-btn', txt); b.type = 'button'; b.title = ttl; b.setAttribute('aria-label', ttl); b.onclick = fn; return b; };
    row.appendChild(t); row.appendChild(rl);
    row.appendChild(mkb('↑', 'Nach oben', function () { ffExtraSync(); if (i > 0) { var x = ffExtra.splice(i, 1)[0]; ffExtra.splice(i - 1, 0, x); ffRenderExtra(); } }));
    row.appendChild(mkb('↓', 'Nach unten', function () { ffExtraSync(); if (i < ffExtra.length - 1) { var x = ffExtra.splice(i, 1)[0]; ffExtra.splice(i + 1, 0, x); ffRenderExtra(); } }));
    row.appendChild(mkb('×', 'Entfernen', function () { ffExtraSync(); ffExtra.splice(i, 1); ffRenderExtra(); }));
    r.appendChild(row); r.appendChild(o); xl.appendChild(r);
  });
}
async function ffSave() {
  ffExtraSync();
  var extra = ffExtra.filter(function (f) { return f.label; });
  if (extra.some(function (f) { return f.typ === 'wahl' && !(f.opts || []).length; })) { alert('Bei einer Auswahl brauchst Du mindestens eine Antwort (eine pro Zeile).'); return; }
  var hide = [], req = {};
  [].forEach.call(document.querySelectorAll('#ff-rows .ff-row'), function (r) {
    var k = r.dataset.k, sh = r.querySelector('.ff-show'), rq = r.querySelector('.ff-req');
    if (!sh.checked && !sh.disabled) hide.push(k);
    if (rq && !rq.disabled && sh.checked && rq.checked !== (r.dataset.dreq === '1')) req[k] = rq.checked;
  });
  var nm0 = ((settings.formFelder || {})[ffCur] || {}).name; settings.formFelder = settings.formFelder || {}; settings.formFelder[ffCur] = { hide: hide, req: req, extra: extra }; if (nm0) settings.formFelder[ffCur].name = nm0;
  persist(); closeModal('modal-ffeld');
  try { await KS.txtset(settings.formTexte || {}, settings.formFelder); alert('Gespeichert und veröffentlicht. Das Formular zeigt die neuen Felder beim nächsten Öffnen.'); }
  catch (x) { alert('Gespeichert, aber noch nicht veröffentlicht: ' + (x && x.message ? x.message : x) + '\n\nSpeichere noch einmal, sobald die Verbindung steht. Für die Veröffentlichung muss der Geräte-Abgleich eingerichtet und das Server-Snippet aktuell sein.'); }
}
/* Eigene Texte der Webformulare: Originaltext -> eigener Text, gespeichert in settings.formTexte und auf dem Server veröffentlicht */
/* Visueller Editor: das echte Formular im Rahmen, Änderungen per Antippen */
var FV = { form: '' };
function ffvInit() { var fe = (settings.formFelder || {})[FV.form] || {}; return { texte: JSON.parse(JSON.stringify(settings.formTexte || {})), felder: JSON.parse(JSON.stringify(fe)) }; }
function fvOpen(w) {
  FV.form = /^(anmeldung|anamnese|erinnerung)\.html/.test(w[1]) ? w[1].replace(/\.html.*/, '') : '';
  document.getElementById('fv-title').textContent = w[0]; var url = webfUrl(w[1]); url += (url.indexOf('?') >= 0 ? '&' : '?') + 'ed=1&vis=1';
  var fr = document.getElementById('fv-frame'); fr.removeAttribute('src'); openModal('modal-fvis'); fr.src = url;
}
async function fvSave() {
  var fr = document.getElementById('fv-frame'), K = null; try { K = fr.contentWindow.KE; } catch (x) {}
  if (!K) { alert('Der Editor ist noch nicht geladen, oder die Seite ist noch nicht auf dem neuesten Stand. Bitte kurz warten und noch einmal versuchen.'); return; }
  var res = K.result(); if (res.error) { alert(res.error); return; }
  settings.formTexte = res.texte;
  if (FV.form) { settings.formFelder = settings.formFelder || {}; var nm1 = (settings.formFelder[FV.form] || {}).name; settings.formFelder[FV.form] = res.felder; if (nm1) res.felder.name = nm1; else delete res.felder.name; }
  persist(); closeModal('modal-fvis');
  try { await KS.txtset(settings.formTexte || {}, settings.formFelder || {}); alert('Gespeichert und veröffentlicht. Das Formular zeigt die Änderungen beim nächsten Öffnen.'); }
  catch (x) { alert('Gespeichert, aber noch nicht veröffentlicht: ' + (x && x.message ? x.message : x) + '\n\nSpeichere noch einmal, sobald die Verbindung steht. Für die Veröffentlichung muss der Geräte-Abgleich eingerichtet und das Server-Snippet aktuell sein.'); }
}
var ftCur = null, ftKeys = [];
function ftNorm(t) { return String(t == null ? '' : t).replace(/\s+/g, ' ').trim(); }
function ftOpen(w) {
  ftCur = w; document.getElementById('ft-title').textContent = 'Texte: ' + w[0];
  var lst = document.getElementById('ft-list'); lst.innerHTML = ''; document.getElementById('ft-q').value = '';
  lst.appendChild(mk('div', 'hm-empty', 'Texte werden gelesen ...')); document.getElementById('ft-save').disabled = true; openModal('modal-ftxt');
  var fr = document.createElement('iframe'), url = webfUrl(w[1]); url += (url.indexOf('?') >= 0 ? '&' : '?') + 'ed=1';
  fr.style.cssText = 'position:fixed; left:-9999px; top:0; width:480px; height:800px; border:0; visibility:hidden;';
  var done = false, fin = function (msg) { if (done) return; done = true; try { fr.remove(); } catch (x) {} if (msg) { lst.innerHTML = ''; lst.appendChild(mk('div', 'hm-empty', msg)); } };
  fr.onload = function () {
    setTimeout(function () {
      if (done) return;
      try {
        var KTw = fr.contentWindow.KT; if (!KTw) { fin('Die Seite ist noch nicht auf dem neuesten Stand. Bitte in ein bis zwei Minuten noch einmal versuchen.'); return; }
        ftKeys = KTw.collect(fr.contentDocument.body); fin(); ftRender();
      } catch (x) { fin('Die Texte konnten nicht gelesen werden.'); }
    }, 1200);
  };
  fr.onerror = function () { fin('Die Seite konnte nicht geladen werden.'); };
  document.body.appendChild(fr); fr.src = url;
}
function ftRender() {
  var lst = document.getElementById('ft-list'); lst.innerHTML = ''; var map = settings.formTexte || {};
  ftKeys.forEach(function (k) {
    var row = mk('div', 'ft-row'); row.dataset.k = k; row.style.cssText = 'margin-bottom:10px;';
    var ta = mk('textarea', 'form-control'); ta.rows = k.length > 90 ? Math.min(8, Math.ceil(k.length / 55)) : 1; ta.value = map[k] != null ? map[k] : k; ta.style.cssText = 'resize:vertical; min-height:38px;';
    var top = mk('div'); top.style.cssText = 'display:flex; gap:6px; align-items:center; font-size:11.5px; color:#94a3b8; margin-bottom:2px;';
    var lb = mk('span', '', 'Original: ' + (k.length > 70 ? k.slice(0, 69) + '…' : k)); lb.style.cssText = 'flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;'; top.appendChild(lb);
    var rs = mk('button', 'x-btn', '↺'); rs.type = 'button'; rs.title = 'Original wiederherstellen'; rs.setAttribute('aria-label', 'Original wiederherstellen'); rs.onclick = function () { ta.value = k; mark(); };
    top.appendChild(rs);
    var mark = function () { var ch = ftNorm(ta.value) !== k && ftNorm(ta.value) !== ''; ta.style.borderColor = ch ? '#16a34a' : ''; rs.style.visibility = ch ? 'visible' : 'hidden'; };
    ta.oninput = mark; mark(); row.appendChild(top); row.appendChild(ta); lst.appendChild(row);
  });
  if (!ftKeys.length) lst.appendChild(mk('div', 'hm-empty', 'Keine Texte gefunden.'));
  document.getElementById('ft-save').disabled = false;
}
function ftFilter() {
  var q = ftNorm(document.getElementById('ft-q').value).toLowerCase();
  [].forEach.call(document.querySelectorAll('#ft-list .ft-row'), function (r) { var ta = r.querySelector('textarea'); r.style.display = !q || (r.dataset.k + ' ' + ta.value).toLowerCase().indexOf(q) >= 0 ? '' : 'none'; });
}
async function ftSave() {
  var map = settings.formTexte = settings.formTexte || {};
  [].forEach.call(document.querySelectorAll('#ft-list .ft-row'), function (r) { var k = r.dataset.k, v = ftNorm(r.querySelector('textarea').value); if (!v || v === k) delete map[k]; else map[k] = v; });
  persist(); closeModal('modal-ftxt');
  try { await KS.txtset(map, settings.formFelder || {}); alert('Gespeichert und veröffentlicht. Die Formulare zeigen die neuen Texte beim nächsten Öffnen.'); }
  catch (x) { alert('Gespeichert, aber noch nicht veröffentlicht: ' + (x && x.message ? x.message : x) + '\n\nSpeichere die Texte noch einmal, sobald die Verbindung steht. Für die Veröffentlichung muss der Geräte-Abgleich eingerichtet und das Server-Snippet aktuell sein.'); }
}
/* Ausgefüllte Formulare (.json und .pdf) in die Akten übernehmen */
function fIsDob(a, b) { return String(a || '').trim() === String(b || '').trim(); }
async function formularImport(entries) {
  var out = [], today = Date.now(), okIdx = [];
  for (var i = 0; i < entries.length; i++) {
    var d = entries[i].d, pdf = entries[i].pdf;
    var q = d.patient, nm = ((q.vorname || '') + ' ' + (q.nachname || '')).trim().toLowerCase();
    var p, created = false;
    if (d.typ === 'anamnese' || d.typ === 'aufklaerung') {
      p = patients.filter(function (x) { return x.code && (x.code === q.code || (x.codes2 || []).indexOf(q.code) >= 0); })[0];
      if (!p) {
        if (await kaConfirm('Der Code ' + q.code + ' ist noch keinem Patienten zugeordnet.\n\nNeuen Patienten anlegen oder einem vorhandenen zuordnen?', { ok: 'Neu anlegen', cancel: 'Zuordnen', danger: false })) {
          p = { anrede: '', vorname: 'Neuer Patient', nachname: q.code, dob: '', phone: '', email: '', adresse: '', allergien: '', notizen: '', medikation: [], doku: [], log: [], bilder: [], dokumente: [], erstellt: today, code: q.code };
          patients.push(p); ensurePatients(); created = true;
        } else {
          var nmq = (await kaPrompt('Name des vorhandenen Patienten (Teil des Namens genügt):') || '').trim().toLowerCase();
          var hit = nmq ? patients.filter(function (x) { return nameKey(x).toLowerCase().indexOf(nmq) >= 0; }) : [];
          if (hit.length !== 1) { out.push('Übersprungen: Code ' + q.code + (hit.length ? ' (mehrere Treffer, bitte genauer eingeben)' : ' (kein Patient gefunden)')); continue; }
          p = hit[0]; if (p.code && !await kaConfirm('Dieser Patient hat schon den Code ' + p.code + '. Durch ' + q.code + ' ersetzen?')) { out.push('Übersprungen: Code ' + q.code); continue; }
          p.code = q.code;
        }
      }
    } else p = patients.filter(function (x) { return nameNorm(nameKey(x)) === nameNorm(nm) && (!q.dob || !x.dob || fIsDob(x.dob, q.dob)); })[0];
    if (!p) {
      if (d.typ !== 'anmeldung' && !await kaConfirm('Für „' + q.vorname + ' ' + q.nachname + '“ gibt es noch keinen Patienten. Jetzt anlegen?')) { out.push('Übersprungen: ' + q.vorname + ' ' + q.nachname); continue; }
      p = { anrede: '', vorname: q.vorname, nachname: q.nachname, dob: q.dob || '', phone: '', email: '', adresse: '', allergien: '', notizen: '', medikation: [], doku: [], log: [], bilder: [], dokumente: [], erstellt: today };
      patients.push(p); ensurePatients(); created = true;
    }
    p.medikation = p.medikation || []; p.log = p.log || []; p.dokumente = p.dokumente || [];
    var addNote = function (line) { if (!line) return; if (String(p.notizen || '').indexOf(line) < 0) p.notizen = (p.notizen ? p.notizen + '\n' : '') + line; };
    var addDiag = function (line) { if (!line) return; if (String(p.diagnosen || '').indexOf(line) < 0) p.diagnosen = (p.diagnosen ? p.diagnosen + '\n' : '') + line; };
    var setIf = function (k, v) { if (v && !String(p[k] || '').trim()) p[k] = v; };
    if (d.typ === 'anmeldung') {
      setIf('anrede', q.anrede); setIf('titel', q.titel); setIf('phone', q.phone); setIf('email', q.email);
      setIf('adresse', [((q.strasse || '') + ' ' + (q.nr || '')).trim(), ((q.plz || '') + ' ' + (q.stadt || '')).trim()].filter(Boolean).join('\n'));
      var a = d.angaben || {}, f = a.fragen || {};
      if (f.allergien && f.allergien.ja) setIf('allergien', f.allergien.text || 'ja (ohne nähere Angabe)');
      if (a.chronisch) addDiag(a.chronisch);
      if (a.medikamente) String(a.medikamente).split(/[,;]+/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (m) { if (p.medikation.indexOf(m) < 0) p.medikation.push(m); });
      if (a.quelle) addNote('Zu uns gekommen durch: ' + a.quelle);
      if (q.notfall) addNote('Notfallkontakt: ' + q.notfall);
      if (f.vorbeh && f.vorbeh.ja) addNote('Frühere ästhetische Behandlungen: ' + (f.vorbeh.text || 'ja'));
      if (f.ops && f.ops.ja) addNote('Operationen: ' + (f.ops.text || 'ja'));
      p.log.push({ ts: Date.now(), type: 'notiz', text: 'Anmeldeformular übernommen' + (created ? ' (Patient angelegt)' : '') });
    } else if (d.typ === 'erinnerung') {
      setIf('email', q.email);
      addNote(d.einwilligung === 'ja' ? 'Terminerinnerung per E-Mail: Einwilligung erteilt am ' + new Date().toLocaleDateString('de-DE') : 'Terminerinnerung: keine Einwilligung (' + new Date().toLocaleDateString('de-DE') + ')');
      p.log.push({ ts: Date.now(), type: 'notiz', text: 'Einwilligung Terminerinnerung übernommen' + (created ? ' (Patient angelegt)' : '') });
    } else if (d.typ === 'aufklaerung') {
      var dk = d.dokument || {}; formMark(p, 'doc:' + dk.id, 'got');
      p.log.push({ ts: Date.now(), type: 'notiz', text: 'Aufklärung online gelesen: ' + (dk.titel || '') + (d.fragen ? '\nFragen für das Gespräch: ' + d.fragen : '') + '\n(Unterschrift vor Ort noch nötig)' });
      if (d.fragen) addNote('Frage zur Aufklärung: ' + d.fragen);
    } else if (d.typ === 'anamnese') {
      var z = d.zusammenfassung || {};
      setIf('allergien', z.allergien);
      String(z.medikamente || '').split(/[,;]+/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (m) { if (p.medikation.indexOf(m) < 0) p.medikation.push(m); });
      (z.diagnosen || []).forEach(addDiag);
      var hw = (z.hinweise || []); if (hw.length) p.log.push({ ts: Date.now(), type: 'notiz', text: 'Anamnese, Hinweise:\n' + hw.join('\n') });
      p.log.push({ ts: Date.now(), type: 'notiz', text: 'Anamnesebogen übernommen (Unterschrift vor Ort noch nötig)' + (created ? ' (Patient angelegt)' : '') });
    }
    if (Array.isArray(d.extra) && d.extra.length) p.log.push({ ts: Date.now(), type: 'notiz', text: 'Zusatzangaben (' + ({ anmeldung: 'Anmeldung', anamnese: 'Anamnese', erinnerung: 'Terminerinnerung' }[d.typ] || d.typ) + '):\n' + d.extra.map(function (x) { return x.label + ': ' + (x.wert || '-'); }).join('\n') });
    formMark(p, d.typ, 'got');
    if (pdf) {
      var id = newId();
      if (await fPut(id, pdf.name, pdf)) {
        var pdfRec = { id: id, ts: Date.now(), name: pdf.name, kat: d.typ === 'aufklaerung' ? 'Aufklärung' : 'Aufnahme und Anamnese', form: d.typ };
        p.dokumente.push(pdfRec); auditFilesAdded(p, [pdfRec], 'Dokumente');
      }
    }
    okIdx[i] = true;
    out.push(({ anamnese: 'Anamnese', erinnerung: 'Terminerinnerung', aufklaerung: 'Aufklärung' }[d.typ] || 'Anmeldung') + ': ' + nameKey(p) + (created ? ' (neu angelegt)' : '') + (pdf ? ', PDF angehängt' : ', ohne PDF'));
  }
  if (!out.length) return okIdx;
  persist(); renderPatients(); if (curP && document.getElementById('modal-akte').classList.contains('active')) viewAkte(curP);
  alert(out.join('\n'));
  return okIdx;
}
