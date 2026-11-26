/* PDF-Editor der Praxis-App (Kreuzberg Ästhetik)
   1) pdfEdit(p, rec): ein PDF aus der Akte als Arbeitsdokument bearbeiten: Stift, Textmarker, Text, Haken, Kreuz, Radierer, Rückgängig.
      Beim ersten Speichern bleibt die vorige Fassung als ausgeblendetes Dokument in der Akte erhalten (nachvollziehbar),
      jede Speicherung wird im Änderungsprotokoll vermerkt. Die eigenen Einträge bleiben bearbeitbar (rec.anno auf Basis rec.annoBase),
      solange seitdem nicht unterschrieben wurde; nach einer Unterschrift beginnt eine neue Bearbeitungsrunde auf der unterschriebenen Fassung.
   2) tplFields(t): Felder einer PDF-Vorlage einrichten (aus der Akte vorbelegt, fester Text, freies Textfeld), die beim Hinzufügen
      zur Akte eingetragen werden (fillStampPdf in index.html).
   Koordinaten: Anteile der Seite (x von links, y von oben). Wird nach dem Entsperren aufgerufen, nutzt die globalen Helfer der App. */
(function () {
  'use strict';
  var COLORS = [['#0b1f5c', 'Navy'], ['#111111', 'Schwarz'], ['#c0262d', 'Rot'], ['#1d4ed8', 'Blau'], ['#15803d', 'Grün']];
  var TF_KINDS = [['name', 'Name (Vor- und Nachname)'], ['vorname', 'Vorname'], ['nachname', 'Nachname'], ['anrede', 'Anrede'], ['dob', 'Geburtsdatum'], ['namedob', 'Name, geb. Datum'], ['alter', 'Alter (Jahre)'], ['patnr', 'Akte-Nummer'],
    ['datum', 'Datum (heute oder Termin)'], ['heute', 'Datum heute'], ['termin', 'Datum nächster Termin'], ['anamnese', 'Datum letzte Anamnese'], ['honorar', 'Datum Honorarvereinbarung'], ['ort', 'Ort (Praxis)'], ['ortdatum', 'Ort und Datum (z. B. Berlin, 22.11.2026)'],
    ['behandlung', 'Behandlung (des Termins)'], ['tel', 'Telefon'], ['email', 'E-Mail'], ['allergien', 'Allergien'], ['adresse', 'Anschrift (eine Zeile)'], ['plzort', 'PLZ und Ort (Patient)'], ['arzt', 'Arzt (Praxisinhaber)'], ['fest', 'Fester Text'], ['frei', 'Freies Textfeld (in der Akte ausfüllen)'], ['kasten', 'Kästchen (in der Akte antippen = Haken)']];
  var PE = null, TF = null;

  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function btn(cls, html, title, fn) { var b = h('button', cls); b.type = 'button'; b.innerHTML = html; if (title) { b.title = title; b.setAttribute('aria-label', title); } b.onclick = fn; return b; }
  var IC = {
    hand: '<path d="M8 13V5.5a1.5 1.5 0 013 0V11m0-6.5v-1a1.5 1.5 0 013 0V11m0-6a1.5 1.5 0 013 0v7m0-4a1.5 1.5 0 013 0v5a7 7 0 01-7 7h-1a7 7 0 01-6-3.4L4 13.5a1.5 1.5 0 012.6-1.5L8 14"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>',
    mark: '<path d="M9 11l-6 6v3h9l3-3"/><path d="M22 12l-4.6 4.6a2 2 0 01-2.8 0l-5.2-5.2a2 2 0 010-2.8L14 4"/>',
    text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    cross: '<path d="M6 6l12 12M18 6L6 18"/>',
    erase: '<path d="M20 20H8l-5-5 10-10 8 8-6 6"/><path d="M7 11l6 6"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    sign: '<path fill="currentColor" stroke="currentColor" stroke-width=".45" stroke-linejoin="round" fill-rule="evenodd" d="M10.27 22.38C10.08 22.29 9.99 22.16 9.82 21.69C9.72 21.43 9.65 21.32 9.61 21.33C9.58 21.34 9.31 21.52 9.02 21.73C8.38 22.19 8.24 22.25 7.99 22.22C7.62 22.16 7.41 21.88 7.37 21.40C7.35 21.23 7.33 21.09 7.32 21.09C7.31 21.09 6.85 21.37 6.29 21.71C5.18 22.40 5.09 22.43 4.90 22.21C4.76 22.05 4.79 21.93 5.04 21.57C6.14 19.98 6.68 18.33 6.24 17.89C5.84 17.49 4.48 18.77 2.41 21.52C2.05 21.99 1.94 22.06 1.73 21.96C1.54 21.87 1.48 21.69 1.57 21.51C1.73 21.22 2.87 19.76 3.55 18.98C5.21 17.07 6.36 16.63 6.93 17.66C7.06 17.89 7.07 17.92 7.07 18.43C7.07 19.07 6.96 19.45 6.56 20.29C6.42 20.60 6.30 20.85 6.31 20.86C6.32 20.86 6.49 20.77 6.70 20.64C7.46 20.17 7.99 20.38 8.05 21.20C8.06 21.38 8.08 21.53 8.09 21.53C8.10 21.53 8.34 21.37 8.62 21.16C9.35 20.64 9.42 20.61 9.64 20.61C10.00 20.61 10.18 20.76 10.39 21.25L10.51 21.53L10.56 20.09C10.59 19.30 10.63 18.35 10.64 17.99C10.65 17.62 10.68 17.24 10.71 17.13C10.73 17.02 11.88 14.68 13.26 11.93C18.78 0.97 18.22 2.03 18.58 1.80C18.91 1.59 19.21 1.52 19.55 1.58C19.93 1.64 21.77 2.56 22.05 2.83C22.38 3.15 22.54 3.65 22.46 4.10C22.42 4.30 19.81 9.60 18.71 11.69C18.60 11.91 17.71 13.67 16.74 15.61C15.15 18.79 14.96 19.15 14.77 19.34C14.65 19.45 13.73 20.20 12.73 21.00L10.91 22.46L10.66 22.45C10.53 22.45 10.35 22.42 10.27 22.38ZM11.70 21.08C11.91 20.95 13.87 19.35 13.84 19.33C13.78 19.28 11.27 18.01 11.23 18.01C11.21 18.01 11.19 18.44 11.17 18.97C11.15 19.49 11.13 20.11 11.11 20.33C11.08 20.79 11.13 20.97 11.31 21.07C11.45 21.15 11.57 21.15 11.70 21.08Z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  function svg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IC[k] + '</svg>'; }
  function sigKey(rec) { return (rec.sig ? rec.sig.ts : 0) + '/' + (rec.sig2 ? rec.sig2.ts : 0); }
  function hexRgb(L, c) { var n = parseInt(String(c).slice(1), 16); return L.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); }
  function txt(t) { return typeof pdfText === 'function' ? pdfText(t) : String(t); }

  /* ---------- gemeinsamer Seitenbetrachter ---------- */
  async function renderPages(blob, host) {
    var lib = await loadPdfJs(), doc = await lib.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise, pages = [];
    var avail = Math.max(260, Math.min(host.clientWidth - 24, 980)), dpr = Math.min(2, window.devicePixelRatio || 1);
    for (var n = 1; n <= doc.numPages; n++) {
      var pg = await doc.getPage(n), vp1 = pg.getViewport({ scale: 1 }), sc = avail / vp1.width, vp = pg.getViewport({ scale: sc * dpr });
      var wrap = h('div', 'pe-page'), cv = h('canvas', 'pe-cv'), ov = h('canvas', 'pe-ovc');
      cv.width = Math.round(vp.width); cv.height = Math.round(vp.height); ov.width = cv.width; ov.height = cv.height;
      wrap.style.width = Math.round(vp1.width * sc) + 'px'; wrap.style.height = Math.round(vp1.height * sc) + 'px';
      wrap.appendChild(cv); wrap.appendChild(ov); wrap.appendChild(h('div', 'pe-pno', 'Seite ' + n + ' von ' + doc.numPages)); host.appendChild(wrap);
      await pg.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
      pages.push({ i: n - 1, W: vp1.width, H: vp1.height, wrap: wrap, cv: cv, ov: ov });
    }
    if (doc.destroy) doc.destroy();
    return pages;
  }
  function frac(ov, ev) { var r = ov.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height, r: r }; }
  function shell(title) {
    var o = h('div', 'pe-ov'), bar = h('div', 'pe-bar'), tools = h('div', 'pe-tools'), scroll = h('div', 'pe-scroll'), t = h('div', 'pe-title', title);
    bar.appendChild(t); bar.appendChild(tools); o.appendChild(bar); o.appendChild(scroll); document.body.appendChild(o);
    document.body.classList.add('pe-open');
    return { o: o, bar: bar, tools: tools, scroll: scroll, close: function () { o.remove(); document.body.classList.remove('pe-open'); } };
  }

  /* ---------- 1) Arbeitsdokument bearbeiten ---------- */
  function peDraw(pg) {
    var c = pg.ov.getContext('2d'), Wp = pg.ov.width, Hp = pg.ov.height; c.clearRect(0, 0, Wp, Hp);
    /* freie Felder der Vorlage als gestrichelte Platzhalter (werden nicht gespeichert) */
    (PE.free || []).forEach(function (f) {
      if (f.p !== pg.i || PE.items.some(function (it) { return it.fid === f.id; })) return;
      var fs = (f.s || 11) / pg.W * Wp, w = (f.w || 0.3) * Wp;
      c.save(); c.setLineDash([6, 4]); c.strokeStyle = 'rgba(1,34,101,.55)'; c.lineWidth = 1.5; c.strokeRect(f.x * Wp, f.y * Hp, w, fs * 1.35);
      c.fillStyle = 'rgba(1,34,101,.55)'; c.font = Math.round(fs * 0.8) + 'px sans-serif'; c.fillText(f.txt || 'Freies Feld', f.x * Wp + 4, f.y * Hp + fs); c.restore();
    });
    (PE.boxes || []).forEach(function (f) {
      if (f.p !== pg.i || f.r) return;
      var sz = (f.s || 12) / pg.W * Wp; c.save(); c.setLineDash([4, 3]); c.strokeStyle = 'rgba(1,34,101,.5)'; c.lineWidth = 1.2; c.strokeRect(f.x * Wp, f.y * Hp, sz, sz); c.restore();
    });
    PE.items.forEach(function (it) {
      if (it.p !== pg.i) return;
      c.save(); c.strokeStyle = c.fillStyle = it.c; c.globalAlpha = it.a || 1; c.lineCap = 'round'; c.lineJoin = 'round';
      if (it.t === 'ink') {
        c.lineWidth = it.w * Wp; c.beginPath();
        it.pts.forEach(function (q, k) { var x = q[0] * Wp, y = q[1] * Hp; if (k) c.lineTo(x, y); else c.moveTo(x, y); });
        if (it.pts.length === 1) c.lineTo(it.pts[0][0] * Wp + 0.1, it.pts[0][1] * Hp);
        c.stroke();
      } else if (it.t === 'text') {
        var fs = it.s * Wp; c.font = fs + 'px Helvetica, Arial, sans-serif'; c.textBaseline = 'alphabetic';
        String(it.txt).split('\n').forEach(function (ln, k) { c.fillText(ln, it.x * Wp, it.y * Hp + fs * 0.8 + k * fs * 1.2); });
      } else if (it.t === 'sig') {
        var im = sigImg(it, pg); if (im && im.width) { var wpx = it.w * Wp, hpx = wpx * im.height / im.width; c.drawImage(im, it.x * Wp - wpx / 2, it.y * Hp - hpx / 2, wpx, hpx); c.setLineDash([5, 4]); c.strokeStyle = PE.selSig === it ? 'rgba(192,38,45,.9)' : 'rgba(21,128,61,.6)'; c.lineWidth = PE.selSig === it ? 2 : 1; c.strokeRect(it.x * Wp - wpx / 2, it.y * Hp - hpx / 2, wpx, hpx); }
      } else if (it.t === 'mark') {
        var m = it.s * Wp, x0 = it.x * Wp, y0 = it.y * Hp; c.lineWidth = Math.max(2, m * 0.14); c.beginPath();
        if (it.sym === 'check') { c.moveTo(x0 - m * 0.45, y0); c.lineTo(x0 - m * 0.12, y0 + m * 0.35); c.lineTo(x0 + m * 0.5, y0 - m * 0.4); }
        else { c.moveTo(x0 - m * 0.4, y0 - m * 0.4); c.lineTo(x0 + m * 0.4, y0 + m * 0.4); c.moveTo(x0 + m * 0.4, y0 - m * 0.4); c.lineTo(x0 - m * 0.4, y0 + m * 0.4); }
        c.stroke();
      }
      c.restore();
    });
  }
  function sigImg(it, pg) {
    PE.imgs = PE.imgs || {}; var im = PE.imgs[it.url];
    if (!im) { im = new Image(); im.onload = function () { if (PE && pg) peDraw(pg); }; im.src = it.url; PE.imgs[it.url] = im; }
    return im.complete ? im : null;
  }
  function peRedraw() { (PE.pages || []).forEach(peDraw); }
  function peSnap() { PE.undo.push(JSON.stringify(PE.items)); if (PE.undo.length > 60) PE.undo.shift(); PE.dirty = true; }
  function textBox(it, pg) { var lines = String(it.txt).split('\n'), fs = it.s; var w = Math.max.apply(null, lines.map(function (l) { return l.length; })) * fs * 0.55; return { x0: it.x, y0: it.y, x1: it.x + w, y1: it.y + lines.length * fs * 1.2 * pg.W / pg.H }; }
  function hitItem(pg, f, tol) {
    for (var k = PE.items.length - 1; k >= 0; k--) {
      var it = PE.items[k]; if (it.p !== pg.i) continue;
      if (it.t === 'ink') { var r2 = Math.pow(tol + it.w / 2, 2); if (it.pts.some(function (q) { var dx = q[0] - f.x, dy = (q[1] - f.y) * pg.H / pg.W; return dx * dx + dy * dy <= r2; })) return k; }
      else if (it.t === 'text') { var b = textBox(it, pg); if (f.x >= b.x0 - tol && f.x <= b.x1 + tol && f.y >= b.y0 - tol && f.y <= b.y1 + tol) return k; }
      else if (it.t === 'sig') { var im2 = sigImg(it, pg), hh = im2 && im2.width ? it.w * im2.height / im2.width * pg.W / pg.H : 0.06; if (Math.abs(f.x - it.x) <= it.w / 2 + tol && Math.abs(f.y - it.y) <= hh / 2 + tol) return k; }
      else if (it.t === 'mark') { if (Math.abs(f.x - it.x) <= it.s * 0.6 + tol && Math.abs(f.y - it.y) * pg.H / pg.W <= it.s * 0.6 + tol) return k; }
    }
    return -1;
  }
  function hitFree(pg, f) {
    return (PE.free || []).filter(function (fd) {
      if (fd.p !== pg.i || PE.items.some(function (it) { return it.fid === fd.id; })) return false;
      var hh = (fd.s || 11) * 1.35 / pg.H;
      return f.x >= fd.x && f.x <= fd.x + (fd.w || 0.3) && f.y >= fd.y && f.y <= fd.y + hh;
    })[0] || null;
  }
  function peSignStart(who) {
    var rec = PE.rec, p = PE.p, name = who === 'arzt' ? (settings.inhaber || 'Arzt') : nameKey(p);
    openSignPad(name + ' unterschreibt: ' + (rec.name || 'Dokument'), function (blob, mt) {
      var fr = new FileReader(); fr.onload = function () {
        PE.pending = { who: who, url: fr.result, mt: mt || {} }; peTool('sigplace');
        PE.ui.hint.textContent = 'Jetzt in das Dokument tippen, wo die Unterschrift von ' + name + ' stehen soll.'; PE.ui.hint.style.display = 'block';
      }; fr.readAsDataURL(blob);
    });
  }
  function placeSig(pg, f) {
    var pd = PE.pending; if (!pd) return;
    peSnap(); PE.items.push({ t: 'sig', p: pg.i, x: f.x, y: f.y, w: 0.16, who: pd.who, url: pd.url, mt: pd.mt, ts: Date.now() });
    PE.pending = null; PE.selSig = PE.items[PE.items.length - 1]; sigBar(); peTool('hand'); peRedraw();
  }
  /* Ausgewählte Unterschrift: Größe einstellen, neu platzieren oder entfernen */
  function sigBar() {
    var h0 = PE.ui.hint, it = PE.selSig; h0.innerHTML = '';
    if (!it || PE.items.indexOf(it) < 0) { h0.style.display = 'none'; PE.selSig = null; return; }
    h0.style.display = 'flex'; h0.style.cssText += ';align-items:center;gap:8px;flex-wrap:wrap;';
    h0.appendChild(document.createTextNode('Unterschrift: Größe'));
    var rg = h('input'); rg.type = 'range'; rg.min = 6; rg.max = 45; rg.value = Math.round(it.w * 100); rg.style.cssText = 'flex:1; min-width:120px;'; rg.oninput = function () { it.w = rg.value / 100; PE.dirty = true; peRedraw(); }; h0.appendChild(rg);
    var nw = h('button', 'btn btn-secondary btn-sm', 'Neu platzieren'); nw.type = 'button'; nw.onclick = function () { PE.pending = { who: it.who, url: it.url, mt: it.mt }; PE.items.splice(PE.items.indexOf(it), 1); PE.selSig = null; peTool('sigplace'); h0.textContent = 'Jetzt in das Dokument tippen, wo die Unterschrift stehen soll.'; peRedraw(); }; h0.appendChild(nw);
    var dl = h('button', 'btn btn-secondary btn-sm', 'Entfernen'); dl.type = 'button'; dl.onclick = function () { PE.items.splice(PE.items.indexOf(it), 1); PE.selSig = null; PE.dirty = true; sigBar(); peRedraw(); }; h0.appendChild(dl);
  }
  function hitSig(pg, f) {
    for (var k = PE.items.length - 1; k >= 0; k--) { var it = PE.items[k]; if (it.t !== 'sig' || it.p !== pg.i) continue; var im = sigImg(it, pg), hh = im && im.width ? it.w * im.height / im.width * pg.W / pg.H : 0.05; if (Math.abs(f.x - it.x) <= it.w / 2 && Math.abs(f.y - it.y) <= hh / 2) return it; }
    return null;
  }
  function hitBox(pg, f) {
    var tolx = 6 / pg.W, toly = 6 / pg.H;
    return (PE.boxes || []).filter(function (b) { var sx = (b.s || 12) / pg.W, sy = (b.s || 12) / pg.H; return b.p === pg.i && f.x >= b.x - tolx && f.x <= b.x + sx + tolx && f.y >= b.y - toly && f.y <= b.y + sy + toly; })[0] || null;
  }
  function toggleBox(pg, b) {
    var k = -1; PE.items.forEach(function (it, i) { if (it.fid === b.id && it.t === 'mark') k = i; });
    peSnap();
    if (k >= 0) PE.items.splice(k, 1);
    else PE.items.push({ t: 'mark', p: pg.i, x: b.x + (b.s || 12) / 2 / pg.W, y: b.y + (b.s || 12) / 2 / pg.H, s: (b.s || 12) * 1.05 / pg.W, sym: 'check', c: PE.color, fid: b.id });
    peDraw(pg);
  }
  function peBind(pg) {
    var ov = pg.ov, cur = null;
    ov.addEventListener('pointerdown', async function (ev) {
      if (PE.tool === 'sigplace' && PE.pending) { ev.preventDefault(); placeSig(pg, frac(ov, ev)); return; }
      if (PE.tool !== 'pen' && PE.tool !== 'marker' && PE.tool !== 'erase' && PE.tool !== 'hand') { var hs = hitSig(pg, frac(ov, ev)); if (hs) { ev.preventDefault(); PE.selSig = hs; sigBar(); peRedraw(); return; } }
      var tool = PE.tool; if (tool === 'hand' && ev.pointerType !== 'pen') return;
      if (tool === 'hand') tool = 'pen';
      ev.preventDefault(); var f = frac(ov, ev), tol = 10 / f.r.width;
      var bx = tool === 'pen' || tool === 'marker' ? null : hitBox(pg, f);
      if (bx) { toggleBox(pg, bx); return; }
      if (tool === 'pen' || tool === 'marker') {
        peSnap(); try { ov.setPointerCapture(ev.pointerId); } catch (x) {}
        cur = tool === 'pen' ? { t: 'ink', p: pg.i, pts: [[f.x, f.y]], c: PE.color, w: PE.width / pg.W, a: 1 } : { t: 'ink', p: pg.i, pts: [[f.x, f.y]], c: '#facc15', w: 12 / pg.W, a: 0.35 };
        PE.items.push(cur); peDraw(pg); return;
      }
      if (tool === 'erase') { var k = hitItem(pg, f, tol); if (k >= 0) { peSnap(); PE.items.splice(k, 1); peDraw(pg); } cur = 'erase'; try { ov.setPointerCapture(ev.pointerId); } catch (x) {} return; }
      if (tool === 'check' || tool === 'cross') { peSnap(); PE.items.push({ t: 'mark', p: pg.i, x: f.x, y: f.y, s: 14 / pg.W, sym: tool, c: PE.color }); peDraw(pg); return; }
      if (tool === 'text') {
        var hk = hitItem(pg, f, tol);
        if (hk >= 0 && PE.items[hk].t === 'text') {
          var old = PE.items[hk], nv = await kaPrompt('Text ändern (leer = löschen):', old.txt, { ok: 'Übernehmen' });
          if (nv == null) return; peSnap(); if (String(nv).trim()) old.txt = String(nv); else PE.items.splice(hk, 1); peDraw(pg); return;
        }
        var fd = hitFree(pg, f), v = await kaPrompt(fd ? (fd.txt || 'Freies Feld') + ':' : 'Text:', '', { ok: 'Einfügen' });
        if (v == null || !String(v).trim()) return;
        peSnap(); PE.items.push(fd ? { t: 'text', p: pg.i, x: fd.x + 2 / pg.W, y: fd.y + 1 / pg.H, s: (fd.s || 11) / pg.W, txt: String(v), c: PE.color, fid: fd.id } : { t: 'text', p: pg.i, x: f.x, y: f.y, s: PE.size / pg.W, txt: String(v), c: PE.color });
        peDraw(pg);
      }
    });
    ov.addEventListener('pointermove', function (ev) {
      if (!cur) return; ev.preventDefault(); var f = frac(ov, ev);
      if (cur === 'erase') { var k = hitItem(pg, f, 10 / f.r.width); if (k >= 0) { PE.items.splice(k, 1); peDraw(pg); } return; }
      var last = cur.pts[cur.pts.length - 1]; if (Math.abs(last[0] - f.x) + Math.abs(last[1] - f.y) < 0.0015) return;
      cur.pts.push([Math.round(f.x * 10000) / 10000, Math.round(f.y * 10000) / 10000]); peDraw(pg);
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { ov.addEventListener(n, function () { cur = null; }); });
    ov.addEventListener('click', function (ev) {
      if (PE.tool !== 'hand') return; var hs = hitSig(pg, frac(ov, ev)); if (hs) { PE.selSig = hs; sigBar(); peRedraw(); return; } var f = frac(ov, ev), bx = hitBox(pg, f); if (bx) toggleBox(pg, bx);
    });
  }
  function peTool(t) {
    PE.tool = t;
    [].forEach.call(PE.ui.tools.querySelectorAll('[data-tool]'), function (b) { b.classList.toggle('on', b.dataset.tool === t); });
    (PE.pages || []).forEach(function (pg) { pg.ov.style.touchAction = t === 'hand' ? 'pan-x pan-y pinch-zoom' : 'none'; pg.ov.style.cursor = t === 'hand' ? 'default' : 'crosshair'; });
  }
  async function peBuild() {
    var L = await loadPdfLib(), doc = await L.PDFDocument.load(await PE.base.arrayBuffer(), { ignoreEncryption: true, updateMetadata: false });
    var font = await doc.embedFont(L.StandardFonts.Helvetica), pages = doc.getPages(), sigEmbeds = {};
    for (var si = 0; si < PE.items.length; si++) { var sit = PE.items[si]; if (sit.t === 'sig' && !sigEmbeds[sit.url]) sigEmbeds[sit.url] = await doc.embedPng(await (await fetch(sit.url)).arrayBuffer()); }
    PE.items.forEach(function (it) {
      var pg = pages[it.p]; if (!pg) return; var sz = pg.getSize(), W = sz.width, H = sz.height, col = hexRgb(L, it.c);
      if (it.t === 'ink') {
        var d = it.pts.map(function (q, k) { return (k ? 'L ' : 'M ') + (q[0] * W).toFixed(2) + ' ' + (q[1] * H).toFixed(2); }).join(' ');
        if (it.pts.length === 1) d += ' L ' + (it.pts[0][0] * W + 0.1).toFixed(2) + ' ' + (it.pts[0][1] * H).toFixed(2);
        pg.drawSvgPath(d, { x: 0, y: H, borderColor: col, borderWidth: it.w * W, borderOpacity: it.a || 1, borderLineCap: L.LineCapStyle.Round });
      } else if (it.t === 'text') {
        var fs = it.s * W;
        String(it.txt).split('\n').forEach(function (ln, k) { pg.drawText(txt(ln), { x: it.x * W, y: H - it.y * H - fs * 0.8 - k * fs * 1.2, size: fs, font: font, color: col }); });
      } else if (it.t === 'sig') {
        var img = sigEmbeds[it.url]; if (!img) return;
        var wp = it.w * W, hp = wp * img.height / img.width, nm = it.who === 'arzt' ? (settings.inhaber || 'Arzt') : nameKey(PE.p);
        pg.drawImage(img, { x: it.x * W - wp / 2, y: H - it.y * H - hp / 2, width: wp, height: hp });
        pg.drawText(txt('Unterschrieben am ' + fmtDT(it.ts) + ' Uhr von ' + nm), { x: it.x * W - wp / 2, y: H - it.y * H - hp / 2 - 8, size: 6.5, font: font, color: L.rgb(0.3, 0.3, 0.3) });
      } else if (it.t === 'mark') {
        var m = it.s * W, x0 = it.x * W, y0 = it.y * H, p;
        p = it.sym === 'check' ? 'M ' + (x0 - m * 0.45) + ' ' + y0 + ' L ' + (x0 - m * 0.12) + ' ' + (y0 + m * 0.35) + ' L ' + (x0 + m * 0.5) + ' ' + (y0 - m * 0.4)
          : 'M ' + (x0 - m * 0.4) + ' ' + (y0 - m * 0.4) + ' L ' + (x0 + m * 0.4) + ' ' + (y0 + m * 0.4) + ' M ' + (x0 + m * 0.4) + ' ' + (y0 - m * 0.4) + ' L ' + (x0 - m * 0.4) + ' ' + (y0 + m * 0.4);
        pg.drawSvgPath(p, { x: 0, y: H, borderColor: col, borderWidth: Math.max(1.5, m * 0.14), borderLineCap: L.LineCapStyle.Round });
      }
    });
    return new Blob([await doc.save()], { type: 'application/pdf' });
  }
  function summary(items) {
    var n = { ink: 0, text: 0, mark: 0, sig: 0 }; (items || []).forEach(function (it) { n[it.t] = (n[it.t] || 0) + 1; });
    var texts = (items || []).filter(function (it) { return it.t === 'text'; }).map(function (it) { return '„' + String(it.txt).replace(/\s+/g, ' ').slice(0, 60) + '“'; });
    return n.ink + ' Striche, ' + n.mark + ' Haken/Kreuze, ' + n.text + ' Texte' + (texts.length ? ': ' + texts.join(', ') : '');
  }
  async function peSave(sendAfter) {
    var p = PE.p, rec = PE.rec, sb = PE.ui.save; sb.disabled = true; if (PE.ui.save2) PE.ui.save2.disabled = true;
    try {
      var out = await peBuild(), hashVor = await sha256Hex(await fileBlob(rec)) , sigs = PE.items.filter(function (it) { return it.t === 'sig' && !it.done; });
      if (!PE.hadBase) {
        var now = new Date(), stamp = fmtDT(now.getTime()), vid = newId(), vname = String(rec.name || 'Dokument').replace(/\.pdf$/i, '') + ' (Fassung vor Bearbeitung ' + stamp + ').pdf';
        if (!await fPut(vid, vname, PE.base)) throw new Error('Die vorige Fassung konnte nicht gesichert werden.');
        var vrec = { id: vid, ts: now.getTime(), name: vname, kat: rec.kat || (typeof katOf === 'function' ? katOf(rec) : undefined), hiddenFromView: true, vonDok: rec.id, zu: rec.zu };
        p.dokumente = (p.dokumente || []).concat([vrec]); auditFilesAdded(p, [vrec], 'Dokumente');
        rec.annoBase = vid; PE.hadBase = true;
      }
      if (!await fPut(rec.id, rec.name, out)) throw new Error('Das bearbeitete Dokument konnte nicht gespeichert werden.');
      if (typeof urlCache !== 'undefined' && urlCache[rec.id]) { URL.revokeObjectURL(urlCache[rec.id]); delete urlCache[rec.id]; }
      var before = summary(rec.anno), saveTs = Date.now();
      for (var qi = 0; qi < sigs.length; qi++) {
        var sg = sigs[qi], nm = sg.who === 'arzt' ? (settings.inhaber || 'Arzt') : nameKey(p);
        await sigRecord(rec, sg.who, nm, hashVor, out, sg.ts, sg.mt);
        auditOne(p, 'Dokumente', 'Unterschrift (' + (sg.who === 'arzt' ? 'Arzt' : 'Patient') + '): ' + (rec.name || rec.id), '', nm + ', ' + fmtDT(sg.ts) + ' · Prüfsumme ' + String(rec.sig2 && sg.who === 'arzt' ? rec.sig2.hash : rec.sig.hash).slice(0, 12));
      }
      var plain = PE.items.filter(function (it) { return it.t !== 'sig'; });
      rec.anno = sigs.length ? [] : JSON.parse(JSON.stringify(PE.items)); rec.annoSig = sigs.length ? null : sigKey(rec); rec.ets = saveTs;
      auditOne(p, 'Dokumente', 'Bearbeitet: ' + (rec.name || rec.id), before, summary(plain));
      persist(); PE.dirty = false; if (window.logbuchQueue) logbuchQueue(p, [rec]);
      try { refreshFiles(); } catch (x) {} try { renderMedien(); } catch (x) {} try { renderUnterlagen(); } catch (x) {}
      PE.ui.close(); PE = null;
      if (sendAfter && typeof sendDokument === 'function') { await sendDokument(p, rec); } else alert('Gespeichert.');
    } catch (e) { sb.disabled = false; if (PE && PE.ui.save2) PE.ui.save2.disabled = false; alert('Speichern hat nicht geklappt: ' + (e && e.message ? e.message : e)); }
  }
  window.pdfEdit = async function (p, rec, opt) {
    if (!p || !rec) return;
    var cont = !!(rec.annoBase && Array.isArray(rec.anno) && rec.annoSig === sigKey(rec)), base = null;
    if (cont) { base = await fileBlob({ id: rec.annoBase }); if (!base) cont = false; }
    if (!cont && (rec.sig || rec.sig2) && !await kaConfirm('Dieses Dokument ist bereits unterschrieben.\n\nÄnderungen werden protokolliert, die unterschriebene Fassung bleibt als ältere Fassung in der Akte erhalten.\n\nTrotzdem bearbeiten?', { ok: 'Bearbeiten', danger: false })) return;
    if (!base) base = await fileBlob(rec);
    if (!base) { alert('Die Datei liegt nicht auf diesem Gerät.'); return; }
    var head = new Uint8Array(await base.slice(0, 5).arrayBuffer()); if (String.fromCharCode.apply(null, head) !== '%PDF-') { alert('Bearbeiten geht nur bei PDF-Dateien.'); return; }
    var t = typeof tplFor === 'function' ? tplFor(rec) : null;
    PE = { p: p, rec: rec, base: base, hadBase: cont, items: cont ? JSON.parse(JSON.stringify(rec.anno)) : [], undo: [], tool: 'pen', color: COLORS[0][0], width: 2, size: 11, dirty: false,
      free: t && Array.isArray(t.fields) ? t.fields.filter(function (f) { return f.k === 'frei'; }) : [],
      boxes: t && Array.isArray(t.fields) ? t.fields.filter(function (f) { return f.k === 'kasten'; }) : [] };
    var ui = shell(rec.name || 'Dokument'); PE.ui = ui;
    var tools = ui.tools; ui.hint = h('div', 'pe-hintbar'); ui.hint.style.display = 'none'; ui.bar.appendChild(ui.hint);
    [['hand', 'Blättern (Finger scrollt, Stift schreibt)'], ['pen', 'Stift'], ['marker', 'Textmarker'], ['text', 'Text (antippen; vorhandenen Text antippen zum Ändern)'], ['check', 'Haken'], ['cross', 'Kreuz'], ['erase', 'Radierer']].forEach(function (x) {
      var b = btn('pe-tb', svg(x[0] === 'marker' ? 'mark' : x[0]), x[1], function () { peTool(x[0]); }); b.dataset.tool = x[0]; tools.appendChild(b);
    });
    [['patient', 'Unterschrift Patient: unterschreiben, dann ins Dokument tippen', 'P'], ['arzt', 'Unterschrift Arzt: unterschreiben, dann ins Dokument tippen', 'A']].forEach(function (x) {
      var b = btn('pe-tb pe-sg', svg('sign') + '<small>' + x[2] + '</small>', x[1], function () { peSignStart(x[0]); }); tools.appendChild(b);
    });
    var cols = h('span', 'pe-cols');
    COLORS.forEach(function (c) { var b = btn('pe-col', '', c[1], function () { PE.color = c[0]; [].forEach.call(cols.children, function (x) { x.classList.toggle('on', x === b); }); }); b.style.background = c[0]; if (c[0] === PE.color) b.classList.add('on'); cols.appendChild(b); });
    tools.appendChild(cols);
    var wsel = h('select', 'pe-sel'); [[1.2, 'fein'], [2, 'mittel'], [3.5, 'dick']].forEach(function (w) { var o = h('option', '', w[1]); o.value = w[0]; if (w[0] === 2) o.selected = true; wsel.appendChild(o); });
    wsel.title = 'Strichstärke'; wsel.setAttribute('aria-label', 'Strichstärke'); wsel.onchange = function () { PE.width = +wsel.value; }; tools.appendChild(wsel);
    tools.appendChild(btn('pe-tb', svg('undo'), 'Rückgängig', function () { if (!PE.undo.length) return; PE.items = JSON.parse(PE.undo.pop()); PE.dirty = true; peRedraw(); }));
    var sp = h('span', 'pe-sp'); tools.appendChild(sp);
    var cancel = h('button', 'btn btn-cancel btn-sm', 'Abbrechen'); cancel.type = 'button';
    cancel.onclick = async function () { if (PE && PE.dirty && !await kaConfirm('Änderungen verwerfen?')) return; ui.close(); PE = null; };
    var save = h('button', 'btn btn-save btn-sm', 'Speichern'); save.type = 'button'; save.onclick = function () { peSave(false); }; ui.save = save;
    var save2 = h('button', 'btn btn-save btn-sm', 'Speichern und senden'); save2.type = 'button'; save2.onclick = function () { peSave(true); }; ui.save2 = save2;
    tools.appendChild(cancel); tools.appendChild(save); tools.appendChild(save2);
    ui.scroll.appendChild(h('div', 'pe-load', 'Dokument wird geladen …'));
    try {
      ui.scroll.innerHTML = ''; PE.pages = await renderPages(base, ui.scroll);
      PE.pages.forEach(peBind); peTool('pen'); peRedraw();
      if (opt && opt.sign) peSignStart(opt.sign);
    } catch (e) { ui.scroll.innerHTML = ''; ui.scroll.appendChild(h('div', 'pe-load', 'Das PDF konnte nicht angezeigt werden.')); }
  };
  window.pdfEditState = function () { return PE; };

  /* ---------- 2) Felder der Vorlage ---------- */
  function kindLabel(k) { var x = TF_KINDS.filter(function (y) { return y[0] === k; })[0]; return x ? x[1] : k; }
  function fieldShown(f) { return f.k === 'fest' ? (f.txt || 'Fester Text') : f.k === 'frei' ? (f.txt || 'Freies Feld') + ' (frei)' : '[' + kindLabel(f.k).replace(/ \(.*\)$/, '') + ']'; }
  function tfDraw(pg) {
    var c = pg.ov.getContext('2d'), Wp = pg.ov.width, Hp = pg.ov.height; c.clearRect(0, 0, Wp, Hp);
    TF.fields.forEach(function (f) {
      if (f.p !== pg.i) return;
      if (f.k === 'kasten') {
        var ks = (f.s || 12) / pg.W * Wp, kx = f.x * Wp, ky = f.y * Hp, sel2 = TF.sel === f;
        c.fillStyle = 'rgba(21,128,61,.10)'; c.fillRect(kx, ky, ks, ks); c.setLineDash(f.r ? [] : [4, 3]); c.strokeStyle = sel2 ? '#c0262d' : 'rgba(21,128,61,.9)'; c.lineWidth = sel2 ? 2.5 : 1.6; c.strokeRect(kx, ky, ks, ks); c.setLineDash([]);
        c.strokeStyle = 'rgba(21,128,61,.9)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(kx + ks * 0.2, ky + ks * 0.55); c.lineTo(kx + ks * 0.42, ky + ks * 0.78); c.lineTo(kx + ks * 0.82, ky + ks * 0.25); c.stroke();
        return;
      }
      var fs = (f.s || 11) / pg.W * Wp, label = fieldShown(f); c.font = fs + 'px Helvetica, Arial, sans-serif';
      var w = f.k === 'frei' ? (f.w || 0.3) * Wp : c.measureText(label).width + 6, x = f.x * Wp, y = f.y * Hp, sel = TF.sel === f;
      c.fillStyle = f.k === 'frei' ? 'rgba(1,34,101,.06)' : 'rgba(21,128,61,.10)'; c.fillRect(x - 2, y, w, fs * 1.3);
      c.setLineDash(f.k === 'frei' ? [6, 4] : []); c.strokeStyle = sel ? '#c0262d' : (f.k === 'frei' ? 'rgba(1,34,101,.6)' : 'rgba(21,128,61,.8)'); c.lineWidth = sel ? 2.5 : 1.5; c.strokeRect(x - 2, y, w, fs * 1.3); c.setLineDash([]);
      c.fillStyle = '#0b1f5c'; c.fillText(label, x + 1, y + fs * 0.95);
    });
  }
  function tfRedraw() { TF.pages.forEach(tfDraw); tfProps(); }
  function tfHit(pg, f) {
    for (var k = TF.fields.length - 1; k >= 0; k--) {
      var fd = TF.fields[k]; if (fd.p !== pg.i) continue;
      if (fd.k === 'kasten') { var sx = (fd.s || 12) / pg.W, sy = (fd.s || 12) / pg.H; if (f.x >= fd.x - 0.015 && f.x <= fd.x + sx + 0.015 && f.y >= fd.y - 0.01 && f.y <= fd.y + sy + 0.01) return fd; continue; }
      var hh = (fd.s || 11) * 1.3 / pg.H, ww = fd.k === 'frei' ? (fd.w || 0.3) : Math.max(0.08, fieldShown(fd).length * (fd.s || 11) * 0.55 / pg.W);
      if (f.x >= fd.x - 0.01 && f.x <= fd.x + ww && f.y >= fd.y - 0.005 && f.y <= fd.y + hh) return fd;
    }
    return null;
  }
  function tfProps() {
    var box = TF.ui.props; box.innerHTML = '';
    if (TF.placing) { box.appendChild(h('span', 'pe-hint', 'Jetzt auf die Stelle im Dokument tippen, an der „' + kindLabel(TF.kind) + '“ stehen soll.')); return; }
    var f = TF.sel; if (!f) { box.appendChild(h('span', 'pe-hint', TF.fields.length ? 'Feld antippen zum Ändern, ziehen zum Verschieben.' : 'Noch keine Felder. Art wählen und „+ Feld“ tippen.')); return; }
    var ks = h('select', 'pe-sel'); TF_KINDS.forEach(function (k) { var o = h('option', '', k[1]); o.value = k[0]; if (k[0] === f.k) o.selected = true; ks.appendChild(o); });
    ks.onchange = function () { f.k = ks.value; if (f.k === 'kasten' && !f.s) f.s = 12; tfRedraw(); }; box.appendChild(ks);
    if (f.k === 'kasten') {
      var rl = h('label', 'pe-hint'); rl.style.cssText = 'display:inline-flex; gap:6px; align-items:center;'; var rc = document.createElement('input'); rc.type = 'checkbox'; rc.checked = !!f.r; rc.onchange = function () { f.r = rc.checked; TF.dirty = true; tfRedraw(); }; rl.appendChild(rc); rl.appendChild(document.createTextNode('Rahmen mitdrucken (wenn im PDF noch kein Kästchen steht)')); box.appendChild(rl);
    }
    if (f.k === 'fest' || f.k === 'frei') {
      var ti = h('input', 'form-control pe-in'); ti.type = 'text'; ti.value = f.txt || ''; ti.placeholder = f.k === 'fest' ? 'Text, der immer eingetragen wird' : 'Beschriftung, z. B. Präparat';
      ti.oninput = function () { f.txt = ti.value; TF.pages.forEach(tfDraw); }; box.appendChild(ti);
    }
    var sm = btn('pe-tb', '−', 'Schrift kleiner', function () { f.s = Math.max(6, (f.s || 11) - 1); tfRedraw(); }), sz = h('span', 'pe-hint', (f.s || 11) + ' pt'), sp = btn('pe-tb', '+', 'Schrift größer', function () { f.s = Math.min(28, (f.s || 11) + 1); tfRedraw(); });
    box.appendChild(sm); box.appendChild(sz); box.appendChild(sp);
    if (f.k === 'frei') {
      var wm = btn('pe-tb', '↔−', 'Feld schmaler', function () { f.w = Math.max(0.08, (f.w || 0.3) - 0.04); tfRedraw(); }), wp = btn('pe-tb', '↔+', 'Feld breiter', function () { f.w = Math.min(0.95, (f.w || 0.3) + 0.04); tfRedraw(); });
      box.appendChild(wm); box.appendChild(wp);
    }
    var del = btn('pe-del', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>', 'Feld löschen', function () {
      TF.fields = TF.fields.filter(function (x) { return x !== f; }); TF.sel = null; TF.dirty = true; tfRedraw();
    });
    box.insertBefore(del, box.firstChild);
  }
  function tfBind(pg) {
    var ov = pg.ov, drag = null;
    ov.style.touchAction = 'pan-y';
    ov.addEventListener('pointerdown', async function (ev) {
      var f = frac(ov, ev);
      if (TF.placing) {
        ev.preventDefault(); TF.placing = false;
        var nf = { id: newId(), k: TF.kind, p: pg.i, x: f.x, y: f.y, s: TF.kind === 'kasten' ? 12 : 11 };
        if (nf.k === 'kasten') { nf.x = Math.max(0, f.x - 6 / pg.W); nf.y = Math.max(0, f.y - 6 / pg.H); }
        if (nf.k === 'frei') nf.w = 0.3;
        if (nf.k === 'fest' || nf.k === 'frei') { var v = await kaPrompt(nf.k === 'fest' ? 'Fester Text:' : 'Beschriftung des freien Feldes (nur zur Orientierung, wird nicht gedruckt):', '', { ok: 'Übernehmen' }); if (v == null) { tfRedraw(); return; } nf.txt = String(v); }
        TF.fields.push(nf); TF.sel = nf; TF.dirty = true; tfRedraw(); return;
      }
      var hit = tfHit(pg, f);
      if (!hit) { if (TF.sel) { TF.sel = null; tfRedraw(); } return; }
      ev.preventDefault(); TF.sel = hit; drag = { dx: f.x - hit.x, dy: f.y - hit.y, moved: false }; try { ov.setPointerCapture(ev.pointerId); } catch (x) {} tfRedraw();
    });
    ov.addEventListener('pointermove', function (ev) {
      if (!drag || !TF.sel) return; ev.preventDefault(); var f = frac(ov, ev);
      TF.sel.x = Math.max(0, Math.min(0.98, f.x - drag.dx)); TF.sel.y = Math.max(0, Math.min(0.98, f.y - drag.dy)); drag.moved = true; TF.dirty = true; tfDraw(pg);
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { ov.addEventListener(n, function () { drag = null; }); });
  }
  /* Bisherige feste Positionen ("Patientendaten automatisch eintragen") als Felder übernehmen */
  function fromFillPos(n, W, H) {
    var out = [], fp = window.FILL_POS; if (!fp) return out;
    var add = function (k, p, x, yBase, s) { s = s || Math.max(7, Math.min(11, W * 0.0185)); out.push({ id: newId(), k: k === 'name+dob' ? 'namedob' : k, p: p, x: x, y: Math.max(0, yBase - s * 0.8 / H), s: s }); };
    fp.first.forEach(function (f) { add(f[0], 0, f[1], f[2]); });
    if (n > 1) fp.last.forEach(function (f) { add(f[0], n - 1, f[1], f[2], f[3]); });
    for (var i = 0; i < n; i++) fp.foot.forEach(function (f) { add(f[0], i, f[1], f[2]); });
    return out;
  }
  window.tplFields = async function (t) {
    if (!t) return;
    var base = await fileBlob(t);
    var hd = base ? String.fromCharCode.apply(null, new Uint8Array(await base.slice(0, 5).arrayBuffer())) : '';
    if (hd !== '%PDF-') { alert('Felder lassen sich nur bei PDF-Vorlagen einrichten.'); return; }
    TF = { t: t, fields: Array.isArray(t.fields) ? JSON.parse(JSON.stringify(t.fields)) : [], sel: null, placing: false, kind: 'name', dirty: false };
    var ui = shell('Felder: ' + (t.name || 'Vorlage')); TF.ui = ui;
    var ks = h('select', 'pe-sel'); TF_KINDS.forEach(function (k) { var o = h('option', '', k[1]); o.value = k[0]; ks.appendChild(o); });
    ks.onchange = function () { TF.kind = ks.value; }; ks.setAttribute('aria-label', 'Art des Feldes');
    ui.tools.appendChild(ks);
    var add = h('button', 'btn btn-secondary btn-sm', '+ Feld'); add.type = 'button'; add.onclick = function () { TF.placing = true; TF.sel = null; tfRedraw(); }; ui.tools.appendChild(add);
    ui.tools.appendChild(h('span', 'pe-sp'));
    var cancel = h('button', 'btn btn-cancel btn-sm', 'Abbrechen'); cancel.type = 'button';
    cancel.onclick = async function () { if (TF.dirty && !await kaConfirm('Änderungen an den Feldern verwerfen?')) return; ui.close(); TF = null; };
    var save = h('button', 'btn btn-save btn-sm', 'Speichern'); save.type = 'button';
    save.onclick = function () {
      t.fields = TF.fields.map(function (f) { var o = { id: f.id, k: f.k, p: f.p, x: Math.round(f.x * 10000) / 10000, y: Math.round(f.y * 10000) / 10000, s: f.s || 11 }; if (f.k === 'fest' || f.k === 'frei') o.txt = f.txt || ''; if (f.k === 'frei') o.w = f.w || 0.3; if (f.k === 'kasten' && f.r) o.r = 1; return o; });
      if (t.fields.length) t.fill = 1;
      persist(); try { renderTemplates(); } catch (x) {} var cb = document.getElementById('tp-fill'); if (cb && t.fill) cb.checked = true;
      try { if (typeof tpFieldsInfo === 'function') tpFieldsInfo(); } catch (x) {}
      ui.close(); TF = null; alert('Felder gespeichert.');
    };
    ui.tools.appendChild(cancel); ui.tools.appendChild(save);
    var props = h('div', 'pe-props'); ui.bar.appendChild(props); ui.props = props;
    ui.scroll.appendChild(h('div', 'pe-load', 'Vorlage wird geladen …'));
    try {
      ui.scroll.innerHTML = ''; TF.pages = await renderPages(base, ui.scroll);
      if (!TF.fields.length && t.fill && TF.pages.length) { TF.fields = fromFillPos(TF.pages.length, TF.pages[0].W, TF.pages[0].H); TF.dirty = true; }
      TF.pages.forEach(tfBind); tfRedraw();
    } catch (e) { ui.scroll.innerHTML = ''; ui.scroll.appendChild(h('div', 'pe-load', 'Die Vorlage konnte nicht angezeigt werden.')); }
  };
  window.tplFieldsState = function () { return TF; };
  window.TF_KINDS = TF_KINDS;
})();

/* ---------- Logbuch zu jedem Dokument (PDF) ----------
   Wird automatisch erstellt und bei jeder Änderung des Dokuments neu geschrieben (Anlegen, Bearbeiten, Unterschrift, Umbenennen, Ausblenden, Zuordnen).
   Inhalt: Dokumentdaten mit Prüfsumme (SHA-256), Unterschriften mit Nachweis, frühere Fassungen und das Änderungsprotokoll der Akte zu diesem Dokument.
   Das Logbuch liegt im Dateispeicher (rec.logId), nicht als eigenes Dokument in der Akte. */
(function () {
  'use strict';
  var queue = {}, timer = null;
  function wrapText(font, size, text, maxW) {
    var out = [], paras = String(text == null ? '' : text).split('\n');
    paras.forEach(function (para) {
      var words = para.split(/\s+/), line = '';
      words.forEach(function (w) {
        while (font.widthOfTextAtSize(w, size) > maxW && w.length > 1) {
          var cut = w.length; while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > maxW) cut--;
          if (line) { out.push(line); line = ''; }
          out.push(w.slice(0, cut)); w = w.slice(cut);
        }
        var t = line ? line + ' ' + w : w;
        if (font.widthOfTextAtSize(t, size) <= maxW) line = t; else { if (line) out.push(line); line = w; }
      });
      out.push(line);
    });
    return out;
  }
  function entriesFor(p, rec, names) {
    var id = String(rec.id), res = [];
    (p.audit || []).forEach(function (e) {
      (e.changes || []).forEach(function (c) {
        var hit = String(c.field || '').split(': ').slice(1).join(': ') ; 
        var mine = names.indexOf(hit) >= 0 || String(c.from || '').indexOf('ID: ' + id) >= 0 || String(c.to || '').indexOf('ID: ' + id) >= 0;
        if (mine && /^(Datei|Hinzugefügt|Bearbeitet|Sichtbarkeit|Unterschrift)/.test(c.field || '')) res.push({ ts: e.ts, area: e.area, field: c.field, from: c.from, to: c.to });
      });
    });
    return res.sort(function (a, b) { return a.ts - b.ts; });
  }
  async function build(p, rec) {
    var L = await loadPdfLib(), doc = await L.PDFDocument.create(), font = await doc.embedFont(L.StandardFonts.Helvetica), bold = await doc.embedFont(L.StandardFonts.HelveticaBold), mono = await doc.embedFont(L.StandardFonts.Courier);
    var W = 595, H = 842, M = 48, page = null, y = 0, pages = [];
    function np() { page = doc.addPage([W, H]); pages.push(page); y = H - M; }
    function need(h) { if (!page || y - h < M + 20) np(); }
    function line(t, o) { o = o || {}; var f = o.bold ? bold : (o.mono ? mono : font), sz = o.size || 9.5; wrapText(f, sz, pdfText(t), W - 2 * M - (o.indent || 0)).forEach(function (ln) { need(sz + 4); page.drawText(ln, { x: M + (o.indent || 0), y: y - sz, size: sz, font: f, color: o.gray ? L.rgb(0.35, 0.35, 0.35) : L.rgb(0.08, 0.08, 0.1) }); y -= sz + (o.gap == null ? 3.5 : o.gap); }); }
    function head(t) { need(26); y -= 8; page.drawRectangle({ x: M, y: y - 16, width: W - 2 * M, height: 17, color: L.rgb(0.95, 0.96, 0.99) }); page.drawText(pdfText(t), { x: M + 6, y: y - 12, size: 10.5, font: bold, color: L.rgb(0.004, 0.133, 0.396) }); y -= 24; }
    var blob = await fileBlob(rec), hash = blob ? await sha256Hex(blob) : '(Datei nicht vorhanden)';
    var now = new Date(), vers = (p.dokumente || []).filter(function (d) { return d.vonDok === rec.id; }).sort(function (a, b) { return tsOf(a) - tsOf(b); });
    var names = [rec.name]; (p.audit || []).forEach(function (e) { (e.changes || []).forEach(function (c) { var m = /Name: (.*)/.exec(String(c.from || '')) || /Name: (.*)/.exec(String(c.to || '')); if (m && String(c.from + c.to).indexOf('ID: ' + rec.id) >= 0 && names.indexOf(m[1]) < 0) names.push(m[1]); }); });
    np();
    page.drawText('Logbuch zum Dokument', { x: M, y: y - 16, size: 18, font: bold, color: L.rgb(0.004, 0.133, 0.396) }); y -= 30;
    line((PRAXIS && PRAXIS.kopf ? PRAXIS.kopf : 'Kreuzberg Ästhetik') + (PRAXIS && PRAXIS.strasse ? ' · ' + PRAXIS.strasse + ', ' + PRAXIS.ort : ''), { gray: true });
    head('Dokument');
    line('Name: ' + rec.name, { bold: true });
    line('Patient: ' + nameKey(p) + (p.dob ? ' · geb. ' + p.dob : '') + (p.nr ? ' · Akte #' + p.nr : ''));
    line('Kategorie: ' + (rec.kat || '') + ' · Zuordnung: ' + (rec.zu || 'frei') + (rec.tid ? ' · aus Vorlage' : ''));
    line('Angelegt: ' + fmtDT(tsOf(rec)) + (rec.ets ? ' · zuletzt bearbeitet: ' + fmtDT(rec.ets) : ''));
    line('Dokument-ID: ' + rec.id + ' · Größe: ' + (blob ? (blob.size >= 1048576 ? (blob.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(blob.size / 1024)) + ' KB') : '-'));
    line('Prüfsumme der aktuellen Datei (SHA-256):');
    line(hash, { mono: true, size: 8.5, indent: 8 });
    head('Unterschriften');
    var any = false;
    [['Patient', rec.sig], ['Arzt', rec.sig2]].forEach(function (x) {
      var q = x[1]; if (!q) return; any = true;
      line(x[0] + ': ' + q.name + ' · ' + fmtDT(q.ts) + ' Uhr', { bold: true });
      if (q.hash) {
        line('Prüfsumme der Datei nach der Unterschrift:', { gray: true, size: 8.5, indent: 8 }); line(q.hash, { mono: true, size: 8, indent: 8 });
        if (q.hashVor) { line('Prüfsumme der Fassung davor:', { gray: true, size: 8.5, indent: 8 }); line(q.hashVor, { mono: true, size: 8, indent: 8 }); }
        line('Geschrieben in ' + (Math.round((q.dauer || 0) / 100) / 10) + ' Sekunden mit ' + (q.punkte || 0) + ' erfassten Punkten (Tablet).', { size: 8.5, indent: 8, gray: true });
      } else line('Ältere Unterschrift ohne gespeicherte Prüfsumme.', { size: 8.5, indent: 8, gray: true });
    });
    if (!any) line('Keine Unterschrift vorhanden.');
    var l = rec.sig2 && rec.sig2.hash ? rec.sig2 : rec.sig && rec.sig.hash ? rec.sig : null;
    if (l) line('Stand: ' + (l.hash === hash ? 'Die Datei ist seit der letzten Unterschrift unverändert.' : 'Die Datei wurde nach der letzten Unterschrift verändert (siehe Protokoll).'), { bold: true });
    if (vers.length) {
      head('Frühere Fassungen in der Akte (ausgeblendet)');
      for (var i = 0; i < vers.length; i++) { var vb = await fileBlob(vers[i]), vh = vb ? await sha256Hex(vb) : '-'; line(fmtDT(tsOf(vers[i])) + ' · ' + vers[i].name); line(vh, { mono: true, size: 8, indent: 8 }); }
    }
    head('Protokoll');
    var ev = entriesFor(p, rec, names);
    if (!ev.length) line('Noch keine Einträge.');
    ev.forEach(function (e) {
      line(fmtDT(e.ts) + ' · ' + e.area, { bold: true, size: 9 });
      line(e.field, { indent: 8 });
      if (e.to && !/^ID: /.test(e.to)) line('→ ' + String(e.to).replace(/\n/g, ' · '), { indent: 8, size: 8.5, gray: true });
      else if (e.to) line('→ ' + String(e.to).replace(/\n/g, ' · '), { indent: 8, size: 8, gray: true });
      y -= 2;
    });
    need(60); y -= 10;
    line('Dieses Logbuch wird von der Praxis-App automatisch erstellt (zuletzt am ' + fmtDT(now.getTime()) + ' Uhr) und bei jeder Änderung des Dokuments neu geschrieben.', { gray: true, size: 8 });
    line('Die Unterschriften sind einfache elektronische Unterschriften (Tablet) mit Nachweisprotokoll, keine qualifizierten Signaturen.', { gray: true, size: 8 });
    pages.forEach(function (pg, k) { pg.drawText('Seite ' + (k + 1) + ' von ' + pages.length + ' · ' + pdfText(rec.name), { x: M, y: 24, size: 7.5, font: font, color: L.rgb(0.5, 0.5, 0.5) }); });
    doc.setTitle('Logbuch zu ' + rec.name);
    return new Blob([await doc.save()], { type: 'application/pdf' });
  }
  async function write(p, rec) {
    if (!rec || rec.hiddenFromView && rec.vonDok) return false;
    var blob = await build(p, rec), id = rec.logId || newId();
    if (!await fPut(id, 'Logbuch - ' + rec.name + '.pdf', blob)) return false;
    if (urlCache[id]) { URL.revokeObjectURL(urlCache[id]); delete urlCache[id]; }
    if (rec.logId !== id) { rec.logId = id; persist(); }
    return true;
  }
  async function flush() {
    timer = null; var q = queue; queue = {};
    var ids = Object.keys(q);
    for (var i = 0; i < ids.length; i++) { try { await write(q[ids[i]].p, q[ids[i]].rec); } catch (e) {} }
  }
  window.logbuchQueue = function (p, list) {
    (list || []).forEach(function (r) { if (r && r.id && (p.dokumente || []).indexOf(r) >= 0) queue[r.id] = { p: p, rec: r }; });
    if (Object.keys(queue).length && !timer) timer = setTimeout(flush, 900);
  };
  window.logbuchNow = async function (p, rec) { await write(p, rec); };
  /* Logbuch in der App anzeigen (alle Seiten als Bild), damit es auch auf Tablets ohne eingebauten PDF-Betrachter lesbar ist; Öffnen und Herunterladen als Knöpfe. */
  window.logbuchOpen = async function (p, rec) {
    var o = document.createElement('div'); o.className = 'dp-ov'; o.style.cssText = 'z-index:200; align-items:stretch;';
    var box = document.createElement('div'); box.className = 'dp-box'; box.style.cssText = 'display:flex; flex-direction:column; max-height:100%; width:100%; max-width:760px;';
    var bar = document.createElement('div'); bar.className = 'dp-bar'; var t = document.createElement('span'); t.className = 'dp-t'; t.textContent = 'Logbuch - ' + rec.name;
    var open = document.createElement('a'); open.className = 'btn btn-secondary btn-sm'; open.textContent = 'Öffnen'; open.target = '_blank'; open.rel = 'noopener'; open.style.textDecoration = 'none';
    var dl = document.createElement('a'); dl.className = 'btn btn-secondary btn-sm'; dl.textContent = 'Herunterladen'; dl.style.textDecoration = 'none'; dl.download = 'Logbuch - ' + rec.name + '.pdf';
    var x = document.createElement('button'); x.type = 'button'; x.className = 'btn btn-cancel btn-sm'; x.textContent = 'Schließen';
    var close = function () { o.remove(); }; x.onclick = close; o.onclick = function (ev) { if (ev.target === o) close(); };
    bar.appendChild(t); bar.appendChild(open); bar.appendChild(dl); bar.appendChild(x);
    var body = document.createElement('div'); body.style.cssText = 'overflow:auto; flex:1 1 auto; background:#e2e8f0; padding:8px; -webkit-overflow-scrolling:touch;'; body.textContent = 'Das Logbuch wird erstellt …'; body.style.color = '#475569';
    box.appendChild(bar); box.appendChild(body); o.appendChild(box); document.body.appendChild(o);
    try {
      await write(p, rec); var f = await fGet(rec.logId); if (!f || !f.blob) throw new Error('leer');
      var u = URL.createObjectURL(f.blob); open.href = u; dl.href = u;
      var lib = await loadPdfJs(), doc = await lib.getDocument({ data: new Uint8Array(await f.blob.arrayBuffer()) }).promise; body.textContent = '';
      for (var n = 1; n <= doc.numPages; n++) {
        var pg = await doc.getPage(n), v0 = pg.getViewport({ scale: 1 }), v = pg.getViewport({ scale: 1100 / v0.width }), c = document.createElement('canvas');
        c.width = Math.round(v.width); c.height = Math.round(v.height); c.style.cssText = 'width:100%; height:auto; display:block; margin:0 auto 8px; background:#fff; box-shadow:0 1px 4px rgba(15,23,42,.25);'; body.appendChild(c);
        var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); await pg.render({ canvasContext: cx, viewport: v }).promise;
      }
      if (doc.destroy) doc.destroy();
    } catch (e) { body.textContent = 'Das Logbuch konnte nicht erstellt werden.'; body.style.color = '#b91c1c'; }
  };
  window.logbuchFlush = flush;
})();
