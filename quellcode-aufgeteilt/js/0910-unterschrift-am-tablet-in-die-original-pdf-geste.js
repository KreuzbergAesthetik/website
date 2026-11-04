/* ===== Unterschrift am Tablet, in die Original-PDF gestempelt ===== */
var DEF_SIG = { page: 0, x: 0.55, y: 0.86, w: 0.30 };
var sgCtx = null, sgDraw = null, sgInk = false, sgBox = null, sgTarget = null;
function loadPdfLib() {
  return new Promise(function (res, rej) {
    if (window.PDFLib) { res(window.PDFLib); return; }
    var sc = document.createElement('script'); sc.src = 'pdf-lib.min.js';
    sc.onload = function () { window.PDFLib ? res(window.PDFLib) : rej(new Error('lib')); }; sc.onerror = function () { rej(new Error('lib')); };
    document.head.appendChild(sc);
  });
}
function tplDoc(p, t) { return (p.dokumente || []).filter(function (d) { return d.tid === t.id || String(d.name).toLowerCase() === String(t.name).toLowerCase(); })[0]; }
function tplFor(rec) { return templates.filter(function (t) { return t.id === rec.tid || String(t.name).toLowerCase() === String(rec.name).toLowerCase(); })[0]; }
function tplState(p, t) {
  var d = tplDoc(p, t);
  if (!d) return { d: null, s: 'fehlt' };
  return (t.sig && t.sig.on && !d.sig) ? { d: d, s: 'offen' } : { d: d, s: 'ok' };
}
function sigCfg(rec) { var t = tplFor(rec); return t && t.sig && t.sig.on ? t.sig : DEF_SIG; }
function signable(dd) { return /\.pdf$/i.test(dd.name) && !dd.sig && [KATS[0], KATS[1], KATS[2]].indexOf(katOf(dd)) >= 0; }
function pdfText(t) { return String(t).replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?'); }
function stampPdf(srcBlob, cfg, sigBlob, text) {
  return loadPdfLib().then(function (L) {
    return Promise.all([srcBlob.arrayBuffer(), sigBlob.arrayBuffer()]).then(function (b) {
      return L.PDFDocument.load(b[0], { ignoreEncryption: true, updateMetadata: false }).then(function (doc) {
        var pages = doc.getPages(), pi = cfg.page > 0 ? Math.min(cfg.page, pages.length) - 1 : pages.length - 1, pg = pages[pi], sz = pg.getSize();
        return Promise.all([doc.embedPng(b[1]), doc.embedFont(L.StandardFonts.Helvetica)]).then(function (r) {
          var img = r[0], font = r[1], bw = sz.width * cfg.w, bh = bw / 3.5, bx = sz.width * cfg.x, top = sz.height * cfg.y;
          var sc = Math.min(bw / img.width, bh / img.height), dw = img.width * sc, dh = img.height * sc, fs = Math.max(5, Math.min(8, sz.width * 0.013));
          pg.drawImage(img, { x: bx, y: sz.height - top - bh + (bh - dh) / 2, width: dw, height: dh });
          pg.drawText(pdfText(text), { x: bx, y: sz.height - top - bh - fs - 2, size: fs, font: font, color: L.rgb(0.25, 0.25, 0.25) });
          return doc.save();
        });
      });
    }).then(function (bytes) { return new Blob([bytes], { type: 'application/pdf' }); });
  });
}
function sgSetup() {
  var cv = document.getElementById('sg-cv'); sgCtx = cv.getContext('2d');
  if (cv._ready) return; cv._ready = true;
  function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height, p: e.pressure > 0 ? e.pressure : 0.5 }; }
  cv.addEventListener('pointerdown', function (e) { e.preventDefault(); cv.setPointerCapture(e.pointerId); sgDraw = pos(e); sgInk = true; var q = sgDraw; sgBox = sgBox || { x0: q.x, y0: q.y, x1: q.x, y1: q.y }; sgDot(q, q); });
  cv.addEventListener('pointermove', function (e) { if (!sgDraw) return; e.preventDefault(); var q = pos(e); sgDot(sgDraw, q); sgDraw = q; });
  ['pointerup', 'pointercancel'].forEach(function (n) { cv.addEventListener(n, function () { sgDraw = null; }); });
}
function sgDot(a, b) {
  sgCtx.strokeStyle = '#111'; sgCtx.lineCap = 'round'; sgCtx.lineJoin = 'round'; sgCtx.lineWidth = 3 + b.p * 5;
  sgCtx.beginPath(); sgCtx.moveTo(a.x, a.y); sgCtx.lineTo(b.x + 0.01, b.y + 0.01); sgCtx.stroke();
  sgBox.x0 = Math.min(sgBox.x0, b.x); sgBox.y0 = Math.min(sgBox.y0, b.y); sgBox.x1 = Math.max(sgBox.x1, b.x); sgBox.y1 = Math.max(sgBox.y1, b.y);
}
function sgClear() { var cv = document.getElementById('sg-cv'); cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); sgInk = false; sgBox = null; sgDraw = null; }
function sgPng() {
  var cv = document.getElementById('sg-cv'), pad = 12, x0 = Math.max(0, sgBox.x0 - pad), y0 = Math.max(0, sgBox.y0 - pad), x1 = Math.min(cv.width, sgBox.x1 + pad), y1 = Math.min(cv.height, sgBox.y1 + pad);
  var t = document.createElement('canvas'); t.width = Math.max(1, Math.round(x1 - x0)); t.height = Math.max(1, Math.round(y1 - y0));
  t.getContext('2d').drawImage(cv, x0, y0, x1 - x0, y1 - y0, 0, 0, t.width, t.height);
  return new Promise(function (res) { t.toBlob(res, 'image/png'); });
}
function openSign(p, rec) {
  sgTarget = { p: p, rec: rec }; sgSetup(); sgClear();
  document.getElementById('sg-info').textContent = nameKey(p) + ' unterschreibt: ' + rec.name;
  openModal('modal-sign');
}
function applySign() {
  if (!sgInk || !sgBox) { alert('Bitte zuerst im Feld unterschreiben.'); return; }
  var t = sgTarget, btn = document.getElementById('sg-ok'), now = new Date(); btn.disabled = true;
  var label = 'Unterschrieben am ' + pad(now.getDate()) + '.' + pad(now.getMonth() + 1) + '.' + now.getFullYear() + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes()) + ' Uhr von ' + nameKey(t.p);
  Promise.all([sgPng(), fileBlob(t.rec)]).then(function (r) {
    if (!r[1]) throw new Error('file');
    return stampPdf(r[1], sigCfg(t.rec), r[0], label);
  }).then(function (out) {
    if (urlCache[t.rec.id]) { URL.revokeObjectURL(urlCache[t.rec.id]); delete urlCache[t.rec.id]; }
    return fPut(t.rec.id, t.rec.name, out);
  }).then(function (ok) {
    btn.disabled = false;
    if (!ok) { alert('Die unterschriebene Datei konnte nicht gespeichert werden.'); return; }
    var before = auditFileState(t.rec);
    t.rec.sig = { ts: now.getTime(), name: nameKey(t.p) };
    auditFileChange(t.p, t.rec, before, 'Dokumente');
    closeModal('modal-sign'); refreshFiles();
  }).catch(function () { btn.disabled = false; alert('Die Unterschrift konnte nicht in die PDF eingefügt werden. Die Datei bleibt unverändert. (Ist die Datei pdf-lib.min.js hochgeladen und bist Du online?)'); });
}
/* Einstellungen der Vorlage */
function updateSigPrev() {
  var on = document.getElementById('tp-sig').checked; document.getElementById('tp-sigcfg').style.display = on ? 'block' : 'none';
  var w = +document.getElementById('tp-w').value, x = +document.getElementById('tp-x').value, y = +document.getElementById('tp-y').value;
  document.getElementById('tp-wv').textContent = w + ' %'; document.getElementById('tp-xv').textContent = x + ' %'; document.getElementById('tp-yv').textContent = y + ' %';
  var b = document.getElementById('tp-box'); b.style.left = x + '%'; b.style.top = y + '%'; b.style.width = w + '%'; b.style.height = (w / 3.5 / 1.414) + '%';
}
function sigFromForm() { return { on: true, page: Math.max(0, parseInt(document.getElementById('tp-pg').value, 10) || 0), x: +document.getElementById('tp-x').value / 100, y: +document.getElementById('tp-y').value / 100, w: +document.getElementById('tp-w').value / 100 }; }
function testSig() {
  var c = document.createElement('canvas'); c.width = 700; c.height = 200; var g = c.getContext('2d');
  g.strokeStyle = '#111'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 140); g.bezierCurveTo(120, 20, 180, 20, 230, 120); g.bezierCurveTo(260, 180, 320, 60, 400, 100); g.bezierCurveTo(470, 140, 520, 60, 640, 90); g.stroke();
  var win = window.open('', '_blank');
  new Promise(function (r) { c.toBlob(r, 'image/png'); }).then(function (png) { return fileBlob(tpCur).then(function (src) { return stampPdf(src, sigFromForm(), png, 'Unterschrieben am TT.MM.JJJJ HH:MM Uhr von Max Mustermann (Probe)'); }); })
    .then(function (out) { var u = URL.createObjectURL(out); if (win) win.location.href = u; else window.open(u, '_blank'); })
    .catch(function () { if (win) win.close(); alert('Der Testlauf hat nicht geklappt. Ist die Datei pdf-lib.min.js hochgeladen und bist Du online?'); });
}
var tpCur = null;
function openTpl(id) {
  tpCur = templates.filter(function (t) { return t.id === id; })[0]; if (!tpCur) return;
  document.getElementById('tp-name').value = tpCur.name;
  var sel = document.getElementById('tp-kat'); fillKatSelect(sel, false); sel.value = katOf(tpCur);
  document.getElementById('tp-neu').checked = !!tpCur.neu;
  var sg = tpCur.sig && tpCur.sig.on ? tpCur.sig : DEF_SIG;
  document.getElementById('tp-sig').checked = !!(tpCur.sig && tpCur.sig.on);
  document.getElementById('tp-pg').value = sg.page; document.getElementById('tp-x').value = Math.round(sg.x * 100); document.getElementById('tp-y').value = Math.round(sg.y * 100); document.getElementById('tp-w').value = Math.round(sg.w * 100);
  updateSigPrev();
  var ls = (settings.katalog || []).filter(function (k) { return (k.vorlagen || []).indexOf(id) >= 0; }).map(function (k) { return k.name; });
  document.getElementById('tp-leist').textContent = ls.length ? 'Verknüpft mit: ' + ls.join(', ') : 'Noch mit keiner Leistung verknüpft (im Reiter Leistungen bei der jeweiligen Leistung auswählen).';
  openModal('modal-tpl');
}
function saveTpl() {
  var name = document.getElementById('tp-name').value.trim(); if (!name) { alert('Bitte eine Bezeichnung eingeben.'); return; }
  tpCur.name = name; tpCur.kat = document.getElementById('tp-kat').value; tpCur.neu = document.getElementById('tp-neu').checked;
  if (document.getElementById('tp-sig').checked) tpCur.sig = sigFromForm(); else delete tpCur.sig;
  persist(); renderTemplates(); closeModal('modal-tpl');
}
async function deleteTpl() {
  if (!await kaConfirm('Vorlage "' + tpCur.name + '" löschen? Bereits in Akten abgelegte Dateien bleiben erhalten.')) return;
  var id = tpCur.id; fDel(id); templates = templates.filter(function (t) { return t.id !== id; });
  (settings.katalog || []).forEach(function (k) { if (k.vorlagen) k.vorlagen = k.vorlagen.filter(function (x) { return x !== id; }); });
  persist(); renderTemplates(); closeModal('modal-tpl');
}
function viewTpl() { fileURL(tpCur).then(function (u) { if (u) window.open(u, '_blank'); }); }
function addTemplates(inp) {
  var files = [].slice.call(inp.files || []); inp.value = ''; if (!files.length) return;
  var skipped = 0, base = Date.now();
  Promise.all(files.map(function (f, i) {
    if (f.size > 31457280) { skipped++; return Promise.resolve(null); }
    var id = newId(), nm = f.name.replace(/\.[^.]+$/, '');
    return fPut(id, f.name, f).then(function (ok) { if (!ok) { skipped++; return null; } return { id: id, ts: base + i, name: nm, kat: katGuess(nm), neu: false }; });
  })).then(function (res) {
    templates = templates.concat(res.filter(Boolean)); persist(); renderTemplates();
    if (skipped) alert(skipped + ' Datei(en) konnten nicht gespeichert werden.');
  });
}
