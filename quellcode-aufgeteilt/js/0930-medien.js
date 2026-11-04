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
    var im = document.createElement('img'); im.alt = b.name || ''; im.loading = 'lazy';
    fileURL(b).then(function (u) { if (u) im.src = u; });
    im.onclick = function () { showGallery(p, list, i); };
    g.appendChild(im);
  });
  return g;
}
var ICON_SIGN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3.5a2.1 2.1 0 013 3L8 17l-4 1 1-4z"/><path d="M3 21h18"/></svg>';
function docList(p, list) { var ul = mk('div'); list.forEach(function (dd) { ul.appendChild(medDocRow(p, dd)); }); return ul; }
/* Dateien, die zu einem Termin oder einer Dokumentation gehören, direkt dort anzeigen */
function attachBlock(p, key) {
  var imgs = (p.bilder || []).filter(function (x) { return x.zu === key && !x.hiddenFromView; }).sort(function (a, b) { return tsOf(a) - tsOf(b); });
  var docs = (p.dokumente || []).filter(function (x) { return x.zu === key && !x.hiddenFromView; }).sort(function (a, b) { return tsOf(a) - tsOf(b); });
  var box = mk('div'); box.style.marginTop = '8px';
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
  fileURL(r).then(function (u) { if (u && gal && gal.list[gal.i] === r) im.src = u; });
}
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
  var key = dd.id + '|' + (dd.sig ? dd.sig.ts : '');
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
  bar.appendChild(t); bar.appendChild(open); bar.appendChild(x); box.appendChild(bar); box.appendChild(img); o.appendChild(box); document.body.appendChild(o);
  fileURL(dd).then(function (u) { if (u) { open.href = u; if (!/\.pdf$/i.test(dd.name || '')) img.src = u; } });
  if (/\.pdf$/i.test(dd.name || '')) { img.alt = 'Wird geladen …'; pdfThumb(dd, 900).then(function (u) { if (u) img.src = u; }).catch(function () { img.alt = 'Keine Vorschau möglich.'; }); }
}
function medDocRow(p, dd) {
  var r = mk('div', 'md-doc'), ext = (/\.([A-Za-z0-9]+)$/.exec(dd.name || '') || [])[1] || '';
  var ic0 = mk('div', 'md-ic', (ext || 'Datei').slice(0, 4).toUpperCase()); r.appendChild(ic0); docThumb(dd, ic0); ic0.onclick = function () { if (ic0.classList.contains('th')) docPreview(dd); };
  var a = mk('a', 'md-nm', dd.name); a.href = '#'; a.title = dd.name + ' · ' + fmtD(iso(new Date(tsOf(dd))));
  fileURL(dd).then(function (u) { if (u) { a.href = u; if (/\.pdf$/i.test(dd.name)) { a.target = '_blank'; a.rel = 'noopener'; } else a.download = dd.name; } });
  if (dd.hiddenFromView) { r.style.opacity = '0.65'; r.appendChild(fileHiddenBadge(dd)); }
  var col = mk('div', 'md-col'), l2 = mk('div', 'md-l2'); col.appendChild(a); col.appendChild(l2); r.appendChild(col);
  var pill = mk('button', 'md-pill', katOf(dd)); pill.type = 'button'; pill.title = 'Kategorie ändern';
  pill.onclick = function (ev) { tlMenu(ev, KATS.map(function (k) { return [k, function () { var before = auditFileState(dd); dd.kat = k; auditFileChange(p, dd, before); refreshFiles(); renderMedien(); }]; })); };
  l2.appendChild(pill);
  if (dd.hiddenFromView) l2.appendChild(restoreVisibilityButton(function () { fileHide(p, dd); }));
  /* Unterschrift: schwarzes Symbol = noch zu unterschreiben, grünes = vorhanden (Datum beim Darüberfahren) */
  if (dd.sig) { var sg = mk('span', 'md-sig on'); sg.title = 'Unterschrieben am ' + fmtD(iso(new Date(dd.sig.ts))); sg.setAttribute('aria-label', sg.title); sg.innerHTML = ICON_SIGN; l2.appendChild(sg); }
  else if (signable(dd)) { var sb = mk('button', 'md-sig'); sb.type = 'button'; sb.title = 'Unterschrift hinzufügen'; sb.setAttribute('aria-label', 'Unterschrift hinzufügen'); sb.innerHTML = ICON_SIGN; sb.onclick = function () { openSign(p, dd); }; l2.appendChild(sb); }
  l2.appendChild(medDots((dd.kat === 'Rezept' ? [['Rezept bearbeiten', function () {
      curP = p; var lg = (p.log || []).filter(function (x) { return x.type === 'rezept' && (x.docId === dd.id || Math.abs((x.ts || 0) - (dd.ts || 0)) < 15000); })[0];
      if (!lg) { lg = { ts: dd.ts || Date.now(), type: 'rezept', text: '', docId: dd.id, _tmp: true }; }
      openRx(null, lg);
    }]] : []).concat([
    ['Zuordnen', function () { openZu(p, [dd]); }],
    ['Umbenennen', async function () {
      var v = await kaPrompt('Neuer Name der Datei:', dd.name || ''); if (v === null) return; v = v.trim(); if (!v) return;
      var ex = (/\.([A-Za-z0-9]+)$/.exec(dd.name || '') || [])[0] || ''; if (ex && !/\.[A-Za-z0-9]{1,6}$/.test(v)) v += ex;
      var before = auditFileState(dd); dd.name = v; auditFileChange(p, dd, before); persist(); refreshFiles(); renderMedien();
    }],
    ['Datum ändern', function () { editGroupDate([dd]); renderMedien(); }],
    [dd.hiddenFromView ? 'Wieder einblenden' : 'Ausblenden', function () { fileHide(p, dd); }]
  ])));
  return r;
}
function renderMedien() {
  var box = document.getElementById('md-list'); if (!box || !curP) return;
  akTabs();
  var nb = (curP.bilder || []).filter(recordVisible).length, nd = (curP.dokumente || []).filter(recordVisible).length;
  document.getElementById('md-bild').textContent = 'Bilder (' + nb + ')'; document.getElementById('md-dok').textContent = 'Dateien (' + nd + ')';
  document.getElementById('md-bild').className = medFilter === 'bild' ? 'on' : ''; document.getElementById('md-dok').className = medFilter === 'dok' ? 'on' : '';
  document.getElementById('md-addf').style.display = medFilter === 'bild' ? '' : 'none'; document.getElementById('md-addd').style.display = medFilter === 'dok' ? '' : 'none';
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
  if (!items.length) { box.appendChild(mk('div', 'hm-empty', (q || medKat) ? 'Keine Datei gefunden' : medFilter === 'bild' ? 'Noch keine Fotos' : 'Noch keine Dateien')); return; }
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
  { t: 'Nachrichten', ic: 'mail', items: [['mail', 'mail', 'E-Mail'], ['anammail', 'mail', 'Anamnese E-Mail'], ['anamwa', 'wa', 'Anamnese WhatsApp'], ['anamlink', 'link', 'Anamnese-Link']] },
  { t: 'Dateien', ic: 'img', items: [['bild', 'img', 'Bilder'], ['dokument', 'form', 'Datei'], ['auto', 'auto', 'Dateien zuordnen']] },
  { t: 'Medikamente', ic: 'pill', items: [['med', 'pill', 'Medikament hinzufügen'], ['rezept', 'rx', 'Rezept erstellen']] }
];
/* Symbolleiste: Termin, Rechnung und Rezept (häufigste Aktionen) starten direkt, die anderen öffnen ihre Kategorie */
var AM_DOCK = [{ t: 'Dokumentation', ic: 'book', act: 'doku', c: 'd0' }, { t: 'Rezept erstellen', ic: 'pill', act: 'rezept', c: 'd3', hm: 1 }, { t: 'E-Mail schreiben', ic: 'mail', act: 'mail', c: 'd4' }, { t: 'WhatsApp schreiben', ic: 'wa', act: 'wa', c: 'd5', hm: 1 }, { t: 'Foto hinzufügen', ic: 'img', act: 'bild', c: 'd6' }, { t: 'Datei hinzufügen', ic: 'form', act: 'dokument', c: 'd7', hm: 1 }];
(function () {
  var box = document.getElementById('a-cats'); if (!box) return;
  AM_DOCK.forEach(function (d) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'a-cat ' + d.c + (d.hm ? ' hm' : ''); b.title = d.t; b.setAttribute('aria-label', d.t); b.innerHTML = tvSvg(d.ic);
    b.onclick = function (ev) { if (d.act) { ev.stopPropagation(); document.getElementById('a-menu').style.display = 'none'; aAct(d.act); } else toggleAMenu(ev, d.g); }; box.appendChild(b);
  });
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
  else if (x === 'wa') waOpen(curP, '');
  else if (x === 'produkt') openVb(null);
  else if (x === 'rechnung') openInvoice(curP);
  else if (x === 'rezept') openRx(null);
  else if (x === 'anammail' || x === 'anamwa') sendForm(curP, ['anamnese'], x === 'anamwa' ? 'wa' : 'mail', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, curP));
  else if (x === 'anamlink') {
    var url = webfUrl('anamnese.html') + '?c=' + pCode(curP);
    copyText(url, function () { alert('Link kopiert. Er gilt nur für ' + nameKey(curP) + ' (Code ' + curP.code + ').'); }, async function () { await kaPrompt('Link zum Kopieren:', url, { readonly: true, ok: 'Schließen', single: true }); });
  }
  else if (x === 'auto') autoZu();
}

