/* ===== Medien: Gruppen, Galerie, Zuordnung ===== */
var zuNext = null, gal = null, zuCtx = null, medFilter = 'dok', medKat = '', medLimit = 30;
function validZu(p) {
  var v = {}, n = nameKey(p);
  events.forEach(function (e) { if (eventBelongs(e, p)) v['e' + e.id] = 1; });
  (p.doku || []).forEach(function (d) { v['d' + d.ts] = 1; });
  return v;
}
function zuLabel(p, key) {
  if (key.charAt(0) === 'e') { var e = events.filter(function (x) { return 'e' + x.id === key; })[0]; return e ? 'Termin ' + fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '') : ''; }
  var d = (p.doku || []).filter(function (x) { return 'd' + x.ts === key; })[0];
  return d ? 'Dokumentation ' + fmtDT(d.ts) : '';
}
/* Dateien eines Patienten bündeln: gleiche Zuordnung oder gleicher Tag */
function fileGroups(p, kind) {
  var arr = (kind === 'bild' ? p.bilder : p.dokumente) || [], valid = validZu(p), byZu = {}, out = [], last = null;
  arr.filter(recordVisible).sort(function (a, b) { return tsOf(a) - tsOf(b); }).forEach(function (a) {
    if (a.zu && valid[a.zu]) {
      var g = byZu[a.zu];
      if (!g) { g = byZu[a.zu] = { kind: kind, p: p, zu: a.zu, list: [], k: 0 }; out.push(g); }
      g.list.push(a); g.k = Math.max(g.k, tsOf(a)); return;
    }
    if (last && iso(new Date(tsOf(a))) === iso(new Date(tsOf(last.list[last.list.length - 1])))) { last.list.push(a); last.k = tsOf(a); }
    else { last = { kind: kind, p: p, zu: '', list: [a], k: tsOf(a) }; out.push(last); }
  });
  return out;
}
function autoZu() {
  var p = curP, n = nameKey(p), days = {}, valid = validZu(p), c = 0;
  events.forEach(function (e) { if (eventBelongs(e, p)) (days[e.date] = days[e.date] || []).push(e); });
  (p.bilder || []).concat(p.dokumente || []).forEach(function (x) {
    if (x.zu && valid[x.zu]) return;
    var l = days[iso(new Date(tsOf(x)))];
    if (l && l.length === 1) { x.zu = 'e' + l[0].id; c++; }
  });
  persist(); renderVerlauf();
  alert(c ? c + ' Datei(en) wurden dem Termin am selben Tag zugeordnet.' : 'Es wurde keine freie Datei mit genau einem Termin am selben Tag gefunden.');
}
function refreshFiles() {
  persist();
  if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
}
function mediaGrid(p, list) {
  var g = mk('div', 'media');
  list.forEach(function (b, i) {
    var w = mk('div', 'mi'), im = document.createElement('img'); im.alt = b.name || ''; im.loading = 'lazy'; im.draggable = true;
    fileURL(b).then(function (u) { if (u) im.src = u; });
    im.onclick = function () { showGallery(p, list, i); };
    im.addEventListener('dragstart', function (ev) { try { ev.dataTransfer.setData('text/x-ka-bild', String(b.id)); ev.dataTransfer.effectAllowed = 'copy'; } catch (x) {} });
    w.appendChild(im);
    if ((p.bilder || []).indexOf(b) >= 0 && window.cmpAdd) { var cb = mk('button', 'mi-cmp', '⇄'); cb.type = 'button'; cb.title = 'Zum Bildvergleich hinzufügen'; cb.setAttribute('aria-label', cb.title); cb.onclick = function (ev) { ev.stopPropagation(); cmpAdd(p, b); }; w.appendChild(cb); }
    g.appendChild(w);
  });
  return g;
}
var ICON_SIGN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><path fill="currentColor" stroke="currentColor" stroke-width=".45" stroke-linejoin="round" fill-rule="evenodd" d="M10.27 22.38C10.08 22.29 9.99 22.16 9.82 21.69C9.72 21.43 9.65 21.32 9.61 21.33C9.58 21.34 9.31 21.52 9.02 21.73C8.38 22.19 8.24 22.25 7.99 22.22C7.62 22.16 7.41 21.88 7.37 21.40C7.35 21.23 7.33 21.09 7.32 21.09C7.31 21.09 6.85 21.37 6.29 21.71C5.18 22.40 5.09 22.43 4.90 22.21C4.76 22.05 4.79 21.93 5.04 21.57C6.14 19.98 6.68 18.33 6.24 17.89C5.84 17.49 4.48 18.77 2.41 21.52C2.05 21.99 1.94 22.06 1.73 21.96C1.54 21.87 1.48 21.69 1.57 21.51C1.73 21.22 2.87 19.76 3.55 18.98C5.21 17.07 6.36 16.63 6.93 17.66C7.06 17.89 7.07 17.92 7.07 18.43C7.07 19.07 6.96 19.45 6.56 20.29C6.42 20.60 6.30 20.85 6.31 20.86C6.32 20.86 6.49 20.77 6.70 20.64C7.46 20.17 7.99 20.38 8.05 21.20C8.06 21.38 8.08 21.53 8.09 21.53C8.10 21.53 8.34 21.37 8.62 21.16C9.35 20.64 9.42 20.61 9.64 20.61C10.00 20.61 10.18 20.76 10.39 21.25L10.51 21.53L10.56 20.09C10.59 19.30 10.63 18.35 10.64 17.99C10.65 17.62 10.68 17.24 10.71 17.13C10.73 17.02 11.88 14.68 13.26 11.93C18.78 0.97 18.22 2.03 18.58 1.80C18.91 1.59 19.21 1.52 19.55 1.58C19.93 1.64 21.77 2.56 22.05 2.83C22.38 3.15 22.54 3.65 22.46 4.10C22.42 4.30 19.81 9.60 18.71 11.69C18.60 11.91 17.71 13.67 16.74 15.61C15.15 18.79 14.96 19.15 14.77 19.34C14.65 19.45 13.73 20.20 12.73 21.00L10.91 22.46L10.66 22.45C10.53 22.45 10.35 22.42 10.27 22.38ZM11.70 21.08C11.91 20.95 13.87 19.35 13.84 19.33C13.78 19.28 11.27 18.01 11.23 18.01C11.21 18.01 11.19 18.44 11.17 18.97C11.15 19.49 11.13 20.11 11.11 20.33C11.08 20.79 11.13 20.97 11.31 21.07C11.45 21.15 11.57 21.15 11.70 21.08Z"/></svg>';
function docList(p, list) { var ul = mk('div'); list.forEach(function (dd) { ul.appendChild(medDocRow(p, dd)); }); return ul; }
/* Dateien, die zu einem Termin oder einer Dokumentation gehören, direkt dort anzeigen */
function attachBlock(p, key) {
  var imgs = (p.bilder || []).filter(function (x) { return x.zu === key && !x.hiddenFromView; }).sort(function (a, b) { return tsOf(a) - tsOf(b); });
  var docs = (p.dokumente || []).filter(function (x) { return x.zu === key && !x.hiddenFromView; }).sort(function (a, b) { return tsOf(a) - tsOf(b); });
  var box = mk('div'); box.style.marginTop = '8px';
  if (imgs.length || docs.length) { var at = mk('div', 'tl-att'); at.innerHTML = tvSvg('clip') + (imgs.length + docs.length) + (imgs.length + docs.length === 1 ? ' Anhang' : ' Anhänge'); box.appendChild(at); }
  if (imgs.length) box.appendChild(mediaGrid(p, imgs));
  if (docs.length) box.appendChild(docList(p, docs));
  return box;
}
function editGroupDate(list) {
  var p = curP;
  var first = list.reduce(function (m, x) { return Math.min(m, tsOf(x)); }, Infinity);
  askDateTime(first, function (t) {
    var delta = t - first;
    list.forEach(function (x) { var before = auditFileState(x); x.ts = tsOf(x) + delta; auditFileChange(p, x, before); });
    refreshFiles(); try { renderMedien(); } catch (e) {}
  });
}
/* Galerie */
function showGallery(p, list, i) { gal = { p: p, list: list.slice(), i: i }; galShow(); openModal('modal-img'); }
function galShow() {
  var r = gal.list[gal.i], im = document.getElementById('img-big');
  im.removeAttribute('src'); document.getElementById('img-cnt').textContent = (gal.i + 1) + ' / ' + gal.list.length + (r.name ? '  ·  ' + r.name : '');
  var hideButton = document.querySelector('#modal-img button[onclick="galDelete()"]');
  if (hideButton) {
    if (!hideButton.dataset.hideIcon) hideButton.dataset.hideIcon = hideButton.innerHTML;
    hideButton.title = r.hiddenFromView ? 'Wieder einblenden' : 'Ausblenden'; hideButton.setAttribute('aria-label', hideButton.title);
    hideButton.classList.toggle('btn-ico', !r.hiddenFromView);
    if (r.hiddenFromView) hideButton.textContent = 'Wieder einblenden'; else hideButton.innerHTML = hideButton.dataset.hideIcon;
  }
  if (r.hiddenFromView) document.getElementById('img-cnt').textContent += ' · Ausgeblendet';
  var cb = document.getElementById('img-cmp-btn'); if (cb) { cb.classList.toggle('on', !!gal.cmpA); if (gal.cmpA) document.getElementById('img-cnt').textContent += gal.cmpA === r ? ' · erstes Bild für den Vergleich' : ' · jetzt „Vergleichen“ tippen'; }
  fileURL(r).then(function (u) { if (u && gal && gal.list[gal.i] === r) im.src = u; });
}
/* Zwei Bilder vergleichen: erstes Bild merken, mit ‹ › zweites wählen, nochmal tippen; dann Überblenden mit Regler oder nebeneinander */
function galCompare() {
  if (!gal) return;
  var r = gal.list[gal.i];
  if (!gal.cmpA) { gal.cmpA = r; galShow(); return; }
  if (gal.cmpA === r) { gal.cmpA = null; galShow(); return; }
  var a = gal.cmpA; gal.cmpA = null; galShow(); openCompare(a, r);
}
function openCompare(a, b) { cmpPair((gal && gal.p) || curP, a, b); }
function galStep(n) { if (!gal) return; gal.i = (gal.i + n + gal.list.length) % gal.list.length; galShow(); }
function galDelete() {
  if (!gal) return;
  var r = gal.list[gal.i], p = gal.p;
  fileHide(p, r);
  gal.list = gal.list.filter(recordVisible);
  if (!gal.list.length) { closeModal('modal-img'); gal = null; }
  else { gal.i = Math.min(gal.i, gal.list.length - 1); galShow(); }
}
document.addEventListener('keydown', function (ev) {
  if (!gal || !document.getElementById('modal-img').classList.contains('active')) return;
  if (ev.key === 'ArrowLeft') galStep(-1); else if (ev.key === 'ArrowRight') galStep(1);
});
/* Zuordnen */
function openZu(p, list) {
  zuCtx = { p: p, list: list };
  var sel = document.getElementById('zu-sel'); sel.innerHTML = '';
  var o0 = mk('option', '', 'Keine Zuordnung (frei in der Zeitleiste)'); o0.value = ''; sel.appendChild(o0);
  var n = nameKey(p), day = iso(new Date(tsOf(list[0])));
  events.filter(function (e) { return eventBelongs(e, p); }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); })
    .forEach(function (e) { var o = mk('option', '', 'Termin ' + fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '')); o.value = 'e' + e.id; sel.appendChild(o); });
  (p.doku || []).slice().sort(function (a, b) { return b.ts - a.ts; }).forEach(function (d) {
    var o = mk('option', '', 'Dokumentation ' + fmtDT(d.ts) + ' · ' + String(d.text || '').split('\n')[0].slice(0, 40)); o.value = 'd' + d.ts; sel.appendChild(o);
  });
  var cur = list[0].zu || '';
  if (!cur) { var same = events.filter(function (e) { return eventBelongs(e, p) && e.date === day; })[0]; if (same) cur = 'e' + same.id; }
  sel.value = cur;
  document.getElementById('zu-info').textContent = list.length + (list.length === 1 ? ' Datei' : ' Dateien') + ' vom ' + fmtDT(tsOf(list[0])) + (cur && !list[0].zu ? '. Vorschlag: Termin am selben Tag.' : '.');
  openModal('modal-zu');
}
function saveZu() {
  var v = document.getElementById('zu-sel').value;
  zuCtx.list.forEach(function (x) { var before = auditFileState(x); if (v) x.zu = v; else delete x.zu; auditFileChange(zuCtx.p, x, before); });
  closeModal('modal-zu'); refreshFiles();
}
/* Medien und Dokumente des Patienten an einem Ort */
function setMedFilter(f, k) { medFilter = f; medKat = k || ''; medLimit = 30; renderMedien(); }
/* Anlagen als Zeitleiste nach Monat: Bilder pro Tag als Streifen, Dokumente als Zeilen, Aktionen im Menü */
function medDots(items) {
  var b = mk('button', 'md-dots', '⋯'); b.type = 'button'; b.title = 'Weitere Aktionen'; b.setAttribute('aria-label', 'Weitere Aktionen');
  b.onclick = function (ev) { tlMenu(ev, items); }; return b;
}
/* Vorschaubild: erste Seite bei PDFs, das Bild selbst bei Fotos. Die PDFs werden nacheinander im Hintergrund gezeichnet. */
var THQ = Promise.resolve(), THC = {};
function setTh(ic, u) { ic.textContent = ''; ic.classList.add('th'); ic.style.backgroundImage = 'url(' + u + ')'; }
async function pdfThumb(dd, w) {
  var bl = await fileBlob(dd); if (!bl) return null;
  var lib = await loadPdfJs(), doc = await lib.getDocument({ data: new Uint8Array(await bl.arrayBuffer()) }).promise;
  try {
    var pg = await doc.getPage(1), v0 = pg.getViewport({ scale: 1 }), v = pg.getViewport({ scale: (w || 110) / v0.width }), c = document.createElement('canvas');
    c.width = Math.round(v.width); c.height = Math.round(v.height); var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: cx, viewport: v }).promise; return c.toDataURL('image/jpeg', w ? 0.85 : 0.7);
  } finally { doc.destroy(); }
}
function docThumb(dd, ic) {
  var key = dd.id + '|' + (dd.sig ? dd.sig.ts : '') + '|' + (dd.sig2 ? dd.sig2.ts : '') + '|' + (dd.ets || '');
  if (THC[key]) { setTh(ic, THC[key]); return; }
  if (/\.(png|jpe?g|webp|gif)$/i.test(dd.name || '')) fileURL(dd).then(function (u) { if (u) setTh(ic, u); });
  else if (/\.pdf$/i.test(dd.name || '')) THQ = THQ.then(function () { return pdfThumb(dd); }).then(function (u) { if (u) { THC[key] = u; setTh(ic, u); } }).catch(function () {});
}
/* Vorschau groß: Tipp auf das Vorschaubild */
function docPreview(dd) {
  var o = mk('div', 'dp-ov'), box = mk('div', 'dp-box'), img = mk('img', 'dp-img'), bar = mk('div', 'dp-bar'), t = mk('span', 'dp-t', dd.name || '');
  var open = mk('a', 'btn btn-secondary btn-sm', 'Öffnen'); open.target = '_blank'; open.rel = 'noopener'; open.style.textDecoration = 'none';
  var x = mk('button', 'btn btn-cancel btn-sm', 'Schließen'); x.type = 'button';
  var close = function () { o.remove(); }; x.onclick = close; o.onclick = function (ev) { if (ev.target === o) close(); };
  var ed = mk('button', 'btn btn-secondary btn-sm', 'Bearbeiten'); ed.type = 'button'; ed.onclick = function () { close(); if (curP) pdfEdit(curP, dd); };
  bar.appendChild(t); if (/\.pdf$/i.test(dd.name || '') || dd.tid) bar.appendChild(ed); bar.appendChild(open); bar.appendChild(x); box.appendChild(bar); box.appendChild(img); o.appendChild(box); document.body.appendChild(o);
  fileURL(dd).then(function (u) { if (u) { open.href = u; if (!/\.pdf$/i.test(dd.name || '')) img.src = u; } });
  if (/\.pdf$/i.test(dd.name || '')) { img.alt = 'Wird geladen …'; pdfThumb(dd, 900).then(function (u) { if (u) img.src = u; }).catch(function () { img.alt = 'Keine Vorschau möglich.'; }); }
}
function medDocRow(p, dd) {
  var r = mk('div', 'md-doc' + (dd.sig && !needSig2(dd) ? ' md-ok' : dd.sig || signable(dd) ? ' md-wait' : '')), ext = (/\.([A-Za-z0-9]+)$/.exec(dd.name || '') || [])[1] || '';
  var ic0 = mk('div', 'md-ic', (ext || 'Datei').slice(0, 4).toUpperCase()); r.appendChild(ic0); docThumb(dd, ic0); ic0.onclick = function () { if (ic0.classList.contains('th')) docPreview(dd); };
  var a = mk('a', 'md-nm', dd.name); a.href = '#'; a.title = dd.name + ' · ' + fmtD(iso(new Date(tsOf(dd))));
  fileURL(dd).then(function (u) { if (u) { a.href = u; if (/\.pdf$/i.test(dd.name)) { a.target = '_blank'; a.rel = 'noopener'; } else a.download = dd.name; } });
  if (dd.hiddenFromView) { r.style.opacity = '0.65'; r.appendChild(fileHiddenBadge(dd)); }
  var col = mk('div', 'md-col'), l2 = mk('div', 'md-l2'); col.appendChild(a); col.appendChild(l2); r.appendChild(col);
  var dl = mk('span', 'md-date', fmtD(iso(new Date(tsOf(dd))))); l2.appendChild(dl);
  if (dd.hiddenFromView) l2.appendChild(restoreVisibilityButton(function () { fileHide(p, dd); }));
  /* Unterschrift: schwarzes Symbol = noch zu unterschreiben, grünes = vorhanden (Datum beim Darüberfahren) */
  var stx = dd.sig && !needSig2(dd) ? ['unterschrieben', 'ok'] : dd.sig ? ['Arzt-Unterschrift fehlt', 'wait'] : signable(dd) ? ['Unterschrift fehlt', 'wait'] : null;
  if (dd.sig) { var sg = mk('span', 'md-sig on'); sg.title = 'Unterschrieben am ' + fmtD(iso(new Date(dd.sig.ts))) + (dd.sig2 ? ', Arzt am ' + fmtD(iso(new Date(dd.sig2.ts))) : ''); sg.setAttribute('aria-label', sg.title); sg.innerHTML = ICON_SIGN; l2.appendChild(sg); if (needSig2(dd)) { var sb2 = mk('button', 'md-sig'); sb2.type = 'button'; sb2.title = 'Als Arzt unterschreiben'; sb2.setAttribute('aria-label', sb2.title); sb2.innerHTML = ICON_SIGN; sb2.onclick = function () { openSign(p, dd, true); }; l2.appendChild(sb2); } }
  if ((/\.pdf$/i.test(dd.name || '') || dd.tid) && !isVideoDoc(dd)) { var eb = mk('button', 'md-edit'); eb.type = 'button'; eb.title = 'Bearbeiten (Stift, Text, Markieren, Unterschrift)'; eb.setAttribute('aria-label', eb.title); eb.innerHTML = tvSvg('pen'); eb.onclick = function (ev) { ev.stopPropagation(); pdfEdit(p, dd); }; l2.appendChild(eb); }
  if (stx) l2.appendChild(mk('span', 'md-stx ' + stx[1], stx[0]));
  var dots = medDots((dd.kat === 'Rezept' ? [['Rezept bearbeiten', function () {
      curP = p; var lg = (p.log || []).filter(function (x) { return x.type === 'rezept' && (x.docId === dd.id || Math.abs((x.ts || 0) - (dd.ts || 0)) < 15000); })[0];
      if (!lg) { lg = { ts: dd.ts || Date.now(), type: 'rezept', text: '', docId: dd.id, _tmp: true }; }
      openRx(null, lg);
    }]] : []).concat([
    isVideoDoc(dd) ? ['In Videos verschieben (nur auf diesem Gerät)', function () { moveToVideos(p, dd); }] : ['Bearbeiten (Stift, Text, Markieren)', function () { pdfEdit(p, dd); }]].concat(dd.sig ? [['Unterschrift prüfen', function () { sigInfo(dd); }]] : []).concat([
    ['Senden (E-Mail, Teilen)', function () { sendDokument(p, dd); }],
    ['Zuordnen', function () { openZu(p, [dd]); }],
    ['Umbenennen', async function () {
      var v = await kaPrompt('Neuer Name der Datei:', dd.name || ''); if (v === null) return; v = v.trim(); if (!v) return;
      var ex = (/\.([A-Za-z0-9]+)$/.exec(dd.name || '') || [])[0] || ''; if (ex && !/\.[A-Za-z0-9]{1,6}$/.test(v)) v += ex;
      var before = auditFileState(dd); dd.name = v; auditFileChange(p, dd, before); persist(); refreshFiles(); renderMedien();
    }],
    ['Kategorie ändern …', function () { setTimeout(function () { tlMenu({ stopPropagation: function () {}, currentTarget: dots }, KATS.map(function (k) { return [k, function () { var before = auditFileState(dd); dd.kat = k; auditFileChange(p, dd, before); refreshFiles(); renderMedien(); }]; })); }, 0); }],
    ['Datum ändern', function () { editGroupDate([dd]); renderMedien(); }],
    ['Logbuch (PDF)', function () { logbuchOpen(p, dd); }],
    [dd.hiddenFromView ? 'Wieder einblenden' : 'Ausblenden', function () { fileHide(p, dd); }]
  ])));
  l2.appendChild(dots);
  return r;
}
function renderMedien() {
  var box = document.getElementById('md-list'); if (!box || !curP) return;
  try { if (window.cmpRender) cmpRender(curP); } catch (x) {}
  akTabs();
  var nb = (curP.bilder || []).filter(recordVisible).length + (curP.videos || []).filter(recordVisible).length, nd = (curP.dokumente || []).filter(recordVisible).length;
  document.getElementById('md-bild').textContent = 'Bilder (' + nb + ')'; document.getElementById('md-dok').textContent = 'Dateien (' + nd + ')';
  document.getElementById('md-bild').className = medFilter === 'bild' ? 'on' : ''; document.getElementById('md-dok').className = medFilter === 'dok' ? 'on' : '';
  var ub = document.getElementById('a-unt-block'); if (ub) ub.style.display = (medFilter === 'dok' && !medKat) ? 'block' : 'none';
  var chips = document.getElementById('md-chips'); chips.innerHTML = '';
  var kmap = {}, kc = function (d) { return kmap[d.id] || (kmap[d.id] = katOf(d)); };
  var kats = []; (curP.dokumente || []).filter(recordVisible).forEach(function (d) { var k = kc(d); if (kats.indexOf(k) < 0) kats.push(k); });
  kats.sort(function (a, b) { return KATS.indexOf(a) - KATS.indexOf(b); });
  if (medKat && kats.indexOf(medKat) < 0) medKat = '';
  if (medFilter === 'dok' && kats.length > 1) [''].concat(kats).forEach(function (k) {
    var bt = mk('button', 'md-chip' + (medKat === k ? ' on' : ''), k || 'Alle'); bt.type = 'button'; bt.onclick = function () { setMedFilter('dok', k); }; chips.appendChild(bt);
  });
  var q = (document.getElementById('md-filter').value || '').trim().toLowerCase(), items = [];
  fileGroups(curP, medFilter).forEach(function (g) {
    var l = g.list.filter(function (x) { return (!q || String(x.name || '').toLowerCase().indexOf(q) >= 0) && (!(medKat && medFilter === 'dok') || kc(x) === medKat); });
    if (l.length) items.push({ k: g.k, g: { kind: g.kind, p: g.p, zu: g.zu, k: g.k, list: l } });
  });
  items.sort(function (a, b) { return b.k - a.k; });
  box.innerHTML = '';
  var vids = medFilter === 'bild' ? (curP.videos || []).filter(function (v) { return recordVisible(v) && (!q || String(v.name || '').toLowerCase().indexOf(q) >= 0); }).sort(function (a, b) { return tsOf(b) - tsOf(a); }) : [];
  if (vids.length) box.appendChild(medVideos(curP, vids));
  if (!items.length) { if (!vids.length) box.appendChild(mk('div', 'hm-empty', (q || medKat) ? 'Keine Datei gefunden' : medFilter === 'bild' ? 'Noch keine Fotos' : 'Noch keine Dateien')); return; }
  items.slice(0, medLimit).forEach(function (it) {
    var g = it.g, d = new Date(it.k);
    var c = mk('div', 'md-item'), zl = g.zu ? mk('div', 'md-zu', zuLabel(g.p, g.zu)) : null;
    if (g.kind === 'bild') {
      var h = mk('div', 'md-gh'), t = mk('div', 'md-day', pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' · ' + g.list.length + (g.list.length === 1 ? ' Bild' : ' Bilder'));
      h.appendChild(t); h.appendChild(mk('div', 'sp'));
      h.appendChild(medDots([['Zuordnen', function () { openZu(g.p, g.list); }], ['Datum ändern', function () { editGroupDate(g.list); renderMedien(); }]]));
      c.appendChild(h); if (zl) c.appendChild(zl);
      c.appendChild(mediaGrid(g.p, g.list));
    } else {
      if (zl) c.appendChild(zl);
      g.list.forEach(function (dd) { c.appendChild(medDocRow(g.p, dd)); });
    }
    box.appendChild(c);
  });
  if (items.length > medLimit) { var mb = mk('button', 'btn btn-secondary', 'Mehr anzeigen (' + (items.length - medLimit) + ')'); mb.type = 'button'; mb.onclick = function () { medLimit += 30; renderMedien(); }; box.appendChild(mb); }
}
/* Finanzen pro Patient */
function renderFin() {
  var box = document.getElementById('a-fin'); if (!box || !curP) return;
  box.innerHTML = '';
  var list = invoices.filter(function (i) { return i.pid === curP.id; }).sort(function (a, b) { return b.date.localeCompare(a.date) || b.created - a.created; });
  if (!list.length) { box.appendChild(mk('div', 'hm-empty', 'Noch keine Rechnungen')); return; }
  var tot = 0, paid = 0;
  list.forEach(function (i) { tot += i.total; paid += (i.payments || []).length ? paidSum(i) : (i.paid ? i.total : 0); });
  var open = r2(tot - paid), st = mk('div'); st.style.cssText = 'display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;';
  [['Gesamt', eur(tot)], ['Bezahlt', eur(paid)], ['Offen', eur(open)]].forEach(function (x) {
    var d = mk('div', 'hm-stat'); d.style.minWidth = '110px'; d.appendChild(mk('span', '', x[0])); d.firstChild.style.cssText = 'font-size:12px; color:#64748b;';
    var b = mk('b', '', x[1]); if (x[0] === 'Offen' && open > 0.005) b.style.color = '#b45309'; d.appendChild(b); st.appendChild(d);
  });
  box.appendChild(st);
  list.forEach(function (i) {
    var s2 = invState(i), badge = mk('span', 'badge ' + s2.cls, s2.txt);
    box.appendChild(hmRow(fmtD(i.date), i.nr, (i.items || []).map(function (x) { return x.text; }).slice(0, 2).join(', '), function () { viewInvoice(i.id); }, (function () { var w = mk('div'); w.style.textAlign = 'right'; w.appendChild(mk('b', '', eur(i.total))); w.appendChild(document.createElement('br')); w.appendChild(badge); return w; })()));
  });
}
function renderPick() {
  document.getElementById('a-dok-pick').style.display = dokPick ? 'block' : 'none';
  var tl = document.getElementById('a-tpl-list'); tl.innerHTML = '';
  if (!templates.length) {
    var em = mk('div', '', 'Noch keine Vorlagen. Lade z.B. Deine Aufklärungen einmal hoch, dann stehen sie hier für alle Patienten bereit.');
    em.style.cssText = 'color:#94a3b8; font-size:13px;'; tl.appendChild(em);
  }
  templates.forEach(function (t) {
    var row = document.createElement('div'); row.style.cssText = 'display:flex; gap:6px; margin-bottom:6px;';
    var b = mk('button', 'btn btn-secondary', t.name); b.type = 'button'; b.style.cssText = 'flex:1; text-align:left;';
    b.onclick = function () {
      var p = curP, id = newId();
      fileBlob(t).then(function (bl) { return bl ? fPut(id, t.name, bl) : false; }).then(function (ok) {
        if (!ok) { alert('Die Vorlage konnte nicht übernommen werden.'); return; }
        var rec = { id: id, ts: Date.now(), name: t.name, kat: t.kat || katOf(t), tid: t.id };
        p.dokumente = (p.dokumente || []).concat([rec]); auditFilesAdded(p, [rec], 'Dokumente');
        dokPick = false; persist(); if (curP === p) { renderPick(); renderVerlauf(); }
      });
    };
    var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.title = 'Vorlage löschen';
    x.onclick = async function () {
      if (!await kaConfirm('Vorlage "' + t.name + '" löschen? Bereits zugeordnete Dateien bleiben erhalten.')) return;
      fDel(t.id); templates = templates.filter(function (y) { return y.id !== t.id; }); persist(); renderPick();
    };
    row.appendChild(b); row.appendChild(x); tl.appendChild(row);
  });
}

/* Plus-Menü der Patientenakte */
/* Aktionsmenü der Akte: vier Kategorien mit eigenem Symbol, das + öffnet alle */
var AM_GROUPS = [
  { t: 'Dokumentieren', ic: 'book', items: [['doku', 'book', 'Dokumentation'], ['notiz', 'pen', 'Notiz'], ['produkt', 'box', 'Produkt']] },
  { t: 'Termin und Abrechnung', ic: 'cal', items: [['termin', 'cal', 'Termin'], ['rechnung', 'euro', 'Rechnung']] },
  { t: 'Nachrichten', ic: 'mail', items: [['mail', 'mail', 'E-Mail'], ['anammail', 'mail', 'Anamnese E-Mail'], ['anamlink', 'link', 'Anamnese-Link'], ['umschlag', 'form', 'Briefumschlag C6 (PDF)']] },
  { t: 'Dateien', ic: 'img', items: [['bild', 'img', 'Bilder'], ['dokument', 'form', 'Datei'], ['auto', 'auto', 'Dateien zuordnen']] },
  { t: 'Medikamente', ic: 'pill', items: [['med', 'pill', 'Medikament hinzufügen'], ['rezept', 'rx', 'Rezept erstellen']] }
];
/* Symbolleiste der Akte. Breit (Querformat, Desktop): die fünf Grundaktionen. Als Streifen am Rand (hochkant): alle Aktionen der Reihe nach, so viele wie die Bildschirmhöhe hergibt; der Rest steckt unter „Alle Aktionen“ (…). */
var AM_DOCK = [{ t: 'Dokumentation', ic: 'book', act: 'doku', c: 'd0', b: 1 }, { t: 'Termin', ic: 'cal', act: 'termin', c: 'd1' }, { t: 'Rechnung', ic: 'euro', act: 'rechnung', c: 'd2' }, { t: 'Rezept erstellen', ic: 'pill', act: 'rezept', c: 'd3', hm: 1, b: 1 }, { t: 'E-Mail schreiben', ic: 'mail', act: 'mail', c: 'd4', b: 1 }, { t: 'Foto hinzufügen', ic: 'img', act: 'bild', c: 'd6', b: 1 }, { t: 'Datei hinzufügen', ic: 'form', act: 'dokument', c: 'd7', hm: 1, b: 1 },
  { t: 'Notiz', ic: 'pen', act: 'notiz', c: 'd0' }, { t: 'Produkt', ic: 'box', act: 'produkt', c: 'd0' }, { t: 'Medikament hinzufügen', ic: 'pill', act: 'med', c: 'd3' }, { t: 'Anamnese E-Mail', ic: 'mail', act: 'anammail', c: 'd4' }, { t: 'Anamnese-Link', ic: 'link', act: 'anamlink', c: 'd4' }, { t: 'Briefumschlag C6 (PDF)', ic: 'form', act: 'umschlag', c: 'd4' }, { t: 'Dateien zuordnen', ic: 'auto', act: 'auto', c: 'd7' }];
/* Schnellzugriffe: höchstens drei runde, durchsichtige Knöpfe, schweben dauerhaft am Rand. Die Auswahl legt Praxis in settings.akteDock ab (Aktions-Kennungen aus AM_DOCK). */
var DOCK_DEF = ['doku', 'termin', 'rechnung'];
function dockIds() {
  var ok = AM_DOCK.map(function (d) { return d.act; }), l = (settings.akteDock || DOCK_DEF).filter(function (a, i, arr) { return ok.indexOf(a) >= 0 && arr.indexOf(a) === i; }).slice(0, 3);
  return l.length ? l : DOCK_DEF.slice();
}
function aDockBuild() {
  var box = document.getElementById('a-cats'); if (!box) return;
  box.innerHTML = '';
  dockIds().forEach(function (id) {
    var d = AM_DOCK.filter(function (x) { return x.act === id; })[0]; if (!d) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'a-cat ' + d.c; b.title = d.t; b.setAttribute('aria-label', d.t); b.innerHTML = tvSvg(d.ic);
    b.onclick = function (ev) { ev.stopPropagation(); document.getElementById('a-menu').style.display = 'none'; aAct(d.act); }; box.appendChild(b);
  });
}
aDockBuild();
function aDockEdit() {
  document.getElementById('a-menu').style.display = 'none';
  var cur = dockIds(), box = document.getElementById('dk-list'); box.innerHTML = '';
  var upd = function () { var n = box.querySelectorAll('input:checked').length; [].forEach.call(box.querySelectorAll('input'), function (c) { c.disabled = !c.checked && n >= 3; }); document.getElementById('dk-n').textContent = n + ' von 3'; };
  AM_DOCK.forEach(function (d) {
    var lab = document.createElement('label'); lab.className = 'dk-row';
    var c = document.createElement('input'); c.type = 'checkbox'; c.value = d.act; c.checked = cur.indexOf(d.act) >= 0; c.onchange = upd;
    var ic = document.createElement('span'); ic.className = 'dk-ic'; ic.innerHTML = tvSvg(d.ic);
    lab.appendChild(c); lab.appendChild(ic); lab.appendChild(document.createTextNode(d.t)); box.appendChild(lab);
  });
  upd(); openModal('modal-dock');
}
function aDockSave() {
  var l = [].map.call(document.querySelectorAll('#dk-list input:checked'), function (c) { return c.value; }).slice(0, 3);
  if (!l.length) { alert('Bitte mindestens eine Aktion wählen.'); return; }
  settings.akteDock = l; persist(); aDockBuild(); try { renderVerlauf(); } catch (x) {} closeModal('modal-dock');
}
function aFabFit() {
  var f = document.querySelector('.a-fab'); if (!f || !document.body.classList.contains('akte-open')) return;
  var bs = [].slice.call(f.querySelectorAll('.a-cats .a-cat'));
  bs.forEach(function (b) { b.classList.remove('ov'); });
  if (!aFabMq.matches) return;
  bs.forEach(function (b) { b.classList.remove('xk-off'); });
  var top = document.querySelector('.a-top'), lim = top ? top.getBoundingClientRect().bottom + 12 : 140, fb = f.getBoundingClientRect(), one = (bs[0] ? bs[0].offsetHeight : 42) + 6;
  var rest = [].slice.call(f.children).filter(function (x) { return !x.classList.contains('a-cats') && x.offsetHeight; }).reduce(function (t, x) { return t + x.offsetHeight + 6; }, 0);
  var n = Math.max(1, Math.floor((fb.bottom - lim - rest) / one));
  bs.forEach(function (b, i) { b.classList.toggle('ov', i >= n); });
}
window.addEventListener('resize', function () { try { aFabFit(); } catch (x) {} });
/* Hochkant: Die Akte-Aktionen liegen als farbige Streifen am rechten Rand. Antippen, nach links Herausziehen oder der Pfeil klappen sie aus. */
var aFabMq = window.matchMedia('(max-width:699px), (orientation:portrait)');
/* Die Schnellzugriffe bleiben dauerhaft sichtbar (kein Ein- und Ausklappen mehr) */
function aFabOut() { var f = document.querySelector('.a-fab'); if (f) f.classList.add('out'); }
aFabOut();
(function () {
  var f = document.querySelector('.a-fab'), sx = null; if (!f) return;
  f.addEventListener('click', function (e) { if (!aFabMq.matches || f.classList.contains('out') || e.target.closest('.a-fab-tog')) return; e.stopPropagation(); e.preventDefault(); aFabOut(true); }, true);
  f.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  f.addEventListener('pointermove', function (e) {
    if (sx === null || !aFabMq.matches) return; var dx = e.clientX - sx;
    if (dx < -14 && !f.classList.contains('out')) { aFabOut(true); sx = null; } else if (dx > 14 && f.classList.contains('out')) { aFabOut(false); sx = null; }
  });
  ['pointerup', 'pointercancel'].forEach(function (t) { f.addEventListener(t, function () { sx = null; }); });
  document.addEventListener('pointerdown', function (e) { if (aFabMq.matches && f.classList.contains('out') && !e.target.closest('.a-fab')) aFabOut(false); }, true);
  f.addEventListener('click', function (e) { if (aFabMq.matches && f.classList.contains('out') && e.target.closest('.a-cat')) setTimeout(function () { aFabOut(false); }, 250); });
})();
function toggleAMenu(ev, gi) {
  ev.stopPropagation();
  var m = document.getElementById('a-menu'), key = gi === undefined ? 'all' : String(gi);
  if (m.style.display === 'block' && m.dataset.g === key) { m.style.display = 'none'; return; }
  m.innerHTML = ''; m.dataset.g = key;
  (gi === undefined ? AM_GROUPS : [AM_GROUPS[gi]]).forEach(function (g) {
    var ci = AM_GROUPS.indexOf(g);
    var h = document.createElement('div'); h.className = 'am-h'; h.textContent = g.t; m.appendChild(h);
    var gr = document.createElement('div'); gr.className = 'am-grid';
    g.items.forEach(function (it) {
      var t = document.createElement('button'); t.type = 'button'; t.className = 'am-tile c' + ci; t.innerHTML = tvSvg(it[1]) + '<span>' + it[2] + '</span>';
      t.onclick = function () { aAct(it[0]); }; gr.appendChild(t);
    });
    m.appendChild(gr);
  });
  if (gi === undefined) { var ed = document.createElement('button'); ed.type = 'button'; ed.className = 'am-edit'; ed.textContent = 'Schnellzugriffe anpassen …'; ed.onclick = function (e2) { e2.stopPropagation(); aDockEdit(); }; m.appendChild(ed); }
  m.style.display = 'block';
}
document.addEventListener('click', function (ev) {
  var m = document.getElementById('a-menu'); if (m) m.style.display = 'none';
  var tm = document.getElementById('tl-menu'); if (tm) tm.style.display = 'none';
  var n = document.getElementById('nav-menu'); if (n && !n.contains(ev.target)) n.style.display = 'none';   /* Klick im Menü (z. B. Gruppe aufklappen) lässt es offen; Einträge schließen es selbst */
  var pm = document.getElementById('pt-amenu'); if (pm) pm.style.display = 'none';
  var fd = document.getElementById('fl-drop'); if (fd) fd.style.display = 'none';
  var g = document.getElementById('gs-res'); if (g && !ev.target.closest('.fab-col')) { g.style.display = 'none'; var gb = document.getElementById('gs-bar'); if (gb && gb.style.display === 'flex' && !document.getElementById('gs-in').value) gsToggle(false); }
});
/* Tippen neben ein Pop-up schließt es. Bei ungespeicherten Eingaben fragt die App vorher. */
(function () {
  var down = null;
  var mark = function (ev) { var o = ev.target.closest && ev.target.closest('.modal-overlay'); if (o) o.dataset.dirty = '1'; };
  document.addEventListener('input', mark, true); document.addEventListener('change', mark, true);
  var rec = function (ev) { down = ev.target; };
  document.addEventListener('mousedown', rec, true); document.addEventListener('touchstart', rec, true);
  document.addEventListener('click', async function (ev) {
    var o = ev.target; if (!o.classList || !o.classList.contains('modal-overlay') || down !== o || !o.classList.contains('active')) return;
    if (o.id === 'modal-prog' || o.id === 'modal-sign') return;
    var c = o.querySelector('.close-btn'); if (!c) return;
    if (o.dataset.dirty === '1' && !await kaConfirm('Eingaben verwerfen und schließen?')) return;
    c.click();
  });
})();
document.addEventListener('keydown', function (ev) {
  if (ev.key !== 'Escape') return;
  var open = [].slice.call(document.querySelectorAll('.modal-overlay.active'));
  if (open.length) { var top = open[open.length - 1]; if (top.id === 'modal-termin') closeTermin(); else closeModal(top.id); }
});
function aAct(x) {
  document.getElementById('a-menu').style.display = 'none';
  if (x === 'med') { stammEdit = false; tileEdit = 'med'; renderHead(); document.getElementById('a-med-in').focus(); }
  else if (x === 'doku') openDkPick(null);
  else if (x === 'notiz') { stammEdit = false; tileEdit = 'notizen'; renderHead(); document.getElementById('a-tile-in').focus(); }
  else if (x === 'termin') {
    var p = curP, n = new Date();
    openTermin(iso(n), pad(n.getHours()) + ':' + pad(n.getMinutes()), true);
    document.getElementById('t-patient').value = nameKey(p);
  }
  else if (x === 'bild') { zuNext = null; document.getElementById('a-img-in').click(); }
  else if (x === 'dokument') { dokPick = true; renderPick(); }
  else if (x === 'mail') openMail();
  else if (x === 'produkt') openVb(null);
  else if (x === 'rechnung') openInvoice(curP);
  else if (x === 'rezept') openRx(null);
  else if (x === 'anammail') sendForm(curP, ['anamnese'], 'mail', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, curP));
  else if (x === 'anamlink') {
    var url = webfUrl('anamnese.html') + '?c=' + pCode(curP);
    copyText(url, function () { alert('Link kopiert. Er gilt nur für ' + nameKey(curP) + ' (Code ' + curP.code + ').'); }, async function () { await kaPrompt('Link zum Kopieren:', url, { readonly: true, ok: 'Schließen', single: true }); });
  }
  else if (x === 'umschlag') umschlagSave(curP);
  else if (x === 'auto') autoZu();
}

