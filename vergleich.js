/* Bildvergleich in der Akte (Bereich im Reiter Anlagen, Abschnitt Bilder)
   Bis zu drei Bilder aus derselben Akte nebeneinander oder übereinander legen. Bilder kommen per Ziehen auf einen Platz oder über das Symbol am Bild.
   Übereinander: Teilen (Regler schiebt die Kante) oder Überblenden (Deckkraft je Bild). Jedes Bild lässt sich einzeln skalieren und verschieben.
   Nebeneinander: Zoom und Verschieben gelten für alle Bilder gleich, so bleibt dieselbe Stelle sichtbar. Nichts davon verändert Bilddateien. */
(function () {
  'use strict';
  var C = null, host = null, LETTER = ['A', 'B', 'C'];

  function h(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function lab(r) { return r ? fmtD(iso(new Date(tsOf(r)))) : ''; }
  function st(p) {
    if (!C || C.pid !== p.id) C = { pid: p.id, slots: [null, null, null], n: 2, mode: 'over', kind: 'wipe', pos: [0.5, 0.75], op: [1, 0.5, 0.5], T: [{ s: 1, x: 0, y: 0 }, { s: 1, x: 0, y: 0 }, { s: 1, x: 0, y: 0 }], sel: 1, align: false, open: true };
    return C;
  }
  function usable(p) { return (p.bilder || []).filter(recordVisible); }
  function filled(c) { return c.slots.slice(0, c.n).filter(Boolean); }

  /* ---------- Plätze füllen ---------- */
  function put(p, rec, idx) {
    var c = st(p);
    if (idx == null) {
      var k = c.slots.slice(0, c.n).indexOf(null);
      if (k < 0 && c.n < 3) { c.n++; k = c.n - 1; }
      idx = k < 0 ? c.n - 1 : k;
    }
    c.slots[idx] = rec; c.T[idx] = { s: 1, x: 0, y: 0 };
    return c;
  }
  window.cmpAdd = function (p, rec, opt) {
    p = p || curP; if (!p || !rec) return;
    put(p, rec);
    if (!(opt && opt.stay)) reveal(p);
    cmpRender(p);
  };
  /* Zwei Bilder aus der Bildansicht: das ältere liegt unten (A) */
  window.cmpPair = function (p, a, b) {
    var c = st(p), old = tsOf(a) <= tsOf(b) ? [a, b] : [b, a];
    c.slots = [old[0], old[1], null]; c.n = 2; c.T = [{ s: 1, x: 0, y: 0 }, { s: 1, x: 0, y: 0 }, { s: 1, x: 0, y: 0 }]; c.sel = 1;
    reveal(p); cmpRender(p);
  };
  function reveal(p) {
    try { if (typeof closeModal === 'function' && document.getElementById('modal-img').classList.contains('active')) closeModal('modal-img'); } catch (e) {}
    try { if (!document.getElementById('modal-akte').classList.contains('active')) viewAkte(p); setAkTab('anl'); medFilter = 'bild'; renderMedien(); } catch (e) {}
    setTimeout(function () { var el = document.getElementById('md-cmp'); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }, 80);
  }

  /* ---------- Darstellung ---------- */
  function applyT(img, t) { img.style.transform = 'translate(' + t.x + '%,' + t.y + '%) scale(' + t.s + ')'; }
  function layer(rec, t) {
    var w = h('div', 'vg-layer'), im = h('img', 'vg-img'); im.alt = rec.name || ''; im.draggable = false; fileURL(rec).then(function (u) { if (u) im.src = u; }); applyT(im, t); w.appendChild(im); return { w: w, im: im };
  }
  function slotUi(p, c, i, tray) {
    var s = h('div', 'vg-slot' + (c.slots[i] ? ' on' : '')), r = c.slots[i];
    s.appendChild(h('span', 'vg-sl', LETTER[i]));
    if (r) {
      var th = h('img', 'vg-th'); th.alt = r.name || ''; th.draggable = false; fileURL(r).then(function (u) { if (u) th.src = u; }); s.appendChild(th);
      s.appendChild(h('span', 'vg-sd', lab(r)));
      var x = h('button', 'vg-x', '×'); x.type = 'button'; x.title = 'Bild aus dem Vergleich nehmen'; x.setAttribute('aria-label', x.title);
      x.onclick = function (ev) { ev.stopPropagation(); c.slots[i] = null; cmpRender(p); }; s.appendChild(x);
    } else s.appendChild(h('span', 'vg-empty', 'Bild hierher ziehen oder am Bild ⇄ tippen'));
    ['dragenter', 'dragover'].forEach(function (n) { s.addEventListener(n, function (ev) { if (ev.dataTransfer && [].indexOf.call(ev.dataTransfer.types || [], 'text/x-ka-bild') >= 0) { ev.preventDefault(); s.classList.add('drop'); } }); });
    s.addEventListener('dragleave', function () { s.classList.remove('drop'); });
    s.addEventListener('drop', function (ev) {
      s.classList.remove('drop'); var id = ev.dataTransfer && ev.dataTransfer.getData('text/x-ka-bild'); if (!id) return; ev.preventDefault();
      var rec = usable(p).filter(function (b) { return String(b.id) === id; })[0]; if (!rec) return; put(p, rec, i); cmpRender(p);
    });
    if (r) { s.draggable = true; s.addEventListener('dragstart', function (ev) { ev.dataTransfer.setData('text/x-ka-bild', String(r.id)); }); }
    return s;
  }
  function seg(items, cur, fn) {
    var g = h('div', 'seg vg-seg'); items.forEach(function (x) { var b = h('button', cur === x[0] ? 'on' : '', x[1]); b.type = 'button'; b.onclick = function () { fn(x[0]); }; g.appendChild(b); }); return g;
  }
  function stageSized(stage, recs) {
    var first = recs[0], im = new Image(); fileURL(first).then(function (u) { if (!u) return; im.onload = function () { if (im.width) { var ra = Math.max(0.6, Math.min(1.8, im.width / im.height)); stage.style.aspectRatio = ra + ''; stage.style.maxWidth = 'min(760px, calc(72vh * ' + ra + '))'; } }; im.src = u; });
  }
  /* Ziehen und Zoomen (Zeiger und Mausrad), t = zu veränderndes Bild */
  function gestures(el, getT, onChange, canDrag) {
    var pts = {}, last = null, d0 = 0, s0 = 1;
    el.addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.vg-hd')) return;
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY }; try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      var k = Object.keys(pts); if (k.length === 2) { var a = pts[k[0]], b = pts[k[1]]; d0 = Math.hypot(a.x - b.x, a.y - b.y); s0 = getT().s; }
      last = { x: ev.clientX, y: ev.clientY };
    });
    el.addEventListener('pointermove', function (ev) {
      if (!pts[ev.pointerId]) return; pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var k = Object.keys(pts), t = getT();
      if (k.length >= 2 && d0) { var a = pts[k[0]], b = pts[k[1]], d = Math.hypot(a.x - b.x, a.y - b.y); t.s = Math.max(0.3, Math.min(5, s0 * d / d0)); onChange(); return; }
      if (k.length === 1 && canDrag() && last) { var r = el.getBoundingClientRect(); t.x += (ev.clientX - last.x) / r.width * 100; t.y += (ev.clientY - last.y) / r.height * 100; last = { x: ev.clientX, y: ev.clientY }; onChange(); }
    });
    ['pointerup', 'pointercancel'].forEach(function (n) { el.addEventListener(n, function (ev) { delete pts[ev.pointerId]; d0 = 0; last = null; }); });
    el.addEventListener('wheel', function (ev) { ev.preventDefault(); var t = getT(); t.s = Math.max(0.3, Math.min(5, t.s * (ev.deltaY < 0 ? 1.08 : 1 / 1.08))); onChange(); }, { passive: false });
  }
  function overlay(p, c, box) {
    var recs = filled(c), n = recs.length;
    var stage = h('div', 'vg-stage vg-over'); stageSized(stage, recs);
    var ls = recs.map(function (r) { var i = c.slots.indexOf(r); return { i: i, L: layer(r, c.T[i]) }; });
    ls.forEach(function (x, k) { stage.appendChild(x.L.w); x.L.w.dataset.k = k; });
    var hds = [];
    function paint() {
      ls.forEach(function (x, k) {
        applyT(x.L.im, c.T[x.i]);
        if (k === 0) return;
        if (c.kind === 'wipe') { x.L.w.style.clipPath = 'inset(0 0 0 ' + (c.pos[k - 1] * 100) + '%)'; x.L.w.style.opacity = 1; }
        else { x.L.w.style.clipPath = 'none'; x.L.w.style.opacity = c.op[x.i]; }
      });
      hds.forEach(function (hd, j) { hd.style.left = (c.pos[j] * 100) + '%'; });
    }
    if (c.kind === 'wipe') {
      for (var j = 0; j < n - 1; j++) (function (j) {
        var hd = h('div', 'vg-hd'), kn = h('div', 'vg-kn', '↔'); hd.appendChild(kn); hds.push(hd); stage.appendChild(hd);
        var move = function (ev) { var r = stage.getBoundingClientRect(), v = Math.max(0.02, Math.min(0.98, (ev.clientX - r.left) / r.width)); if (j === 0 && n === 3) v = Math.min(v, c.pos[1] - 0.03); if (j === 1) v = Math.max(v, c.pos[0] + 0.03); c.pos[j] = v; paint(); };
        hd.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); hd.setPointerCapture(ev.pointerId); hd._d = true; move(ev); });
        hd.addEventListener('pointermove', function (ev) { if (hd._d) move(ev); });
        ['pointerup', 'pointercancel'].forEach(function (t) { hd.addEventListener(t, function () { hd._d = false; }); });
      })(j);
    }
    recs.forEach(function (r, k) { var t = h('span', 'vg-tag vg-tag-' + (k === 0 ? 'l' : k === n - 1 ? 'r' : 'm'), LETTER[c.slots.indexOf(r)] + ' · ' + lab(r)); stage.appendChild(t); });
    var selSlot = function () { if (!c.slots[c.sel]) c.sel = c.slots.indexOf(recs[recs.length - 1]); return c.sel; };
    gestures(stage, function () { return c.T[selSlot()]; }, function () { paint(); syncZoom(); }, function () { return c.align; });
    stage.style.touchAction = c.align ? 'none' : 'pan-y';
    box.appendChild(stage);
    /* Regler */
    var ctl = h('div', 'vg-ctl');
    if (c.kind === 'blend') recs.forEach(function (r, k) {
      if (k === 0) return; var i = c.slots.indexOf(r), row = h('label', 'vg-row'); row.appendChild(h('span', '', 'Deckkraft ' + LETTER[i]));
      var rg = h('input'); rg.type = 'range'; rg.min = 0; rg.max = 100; rg.value = Math.round(c.op[i] * 100); rg.oninput = function () { c.op[i] = rg.value / 100; paint(); }; row.appendChild(rg); ctl.appendChild(row);
    });
    var al = h('div', 'vg-row'); al.appendChild(h('span', '', 'Bild ausrichten:'));
    recs.forEach(function (r) { var i = c.slots.indexOf(r), b = h('button', 'vg-chip' + (c.sel === i ? ' on' : ''), LETTER[i]); b.type = 'button'; b.onclick = function () { c.sel = i; cmpRender(p); }; al.appendChild(b); });
    var zl = h('label', 'vg-row vg-zoom'); zl.appendChild(h('span', '', 'Größe'));
    var zr = h('input'); zr.type = 'range'; zr.min = 30; zr.max = 300; zr.value = Math.round(c.T[selSlot()].s * 100); zr.oninput = function () { c.T[selSlot()].s = zr.value / 100; paint(); }; zl.appendChild(zr);
    function syncZoom() { zr.value = Math.round(c.T[selSlot()].s * 100); }
    var mv = h('button', 'btn btn-secondary btn-sm' + (c.align ? ' on' : ''), c.align ? 'Verschieben: an' : 'Verschieben'); mv.type = 'button'; mv.title = 'Wenn an, verschiebt Ziehen im Bild das gewählte Bild'; mv.onclick = function () { c.align = !c.align; cmpRender(p); };
    var rs = h('button', 'btn btn-secondary btn-sm', 'Zurücksetzen'); rs.type = 'button'; rs.onclick = function () { c.T[selSlot()] = { s: 1, x: 0, y: 0 }; cmpRender(p); };
    al.appendChild(mv); al.appendChild(rs); ctl.appendChild(al); ctl.appendChild(zl); box.appendChild(ctl);
    paint();
  }
  function side(p, c, box) {
    var recs = filled(c), g = h('div', 'vg-side vg-n' + recs.length), shared = c.T[0], ims = [];
    recs.forEach(function (r) {
      var f = h('figure', 'vg-fig'), v = h('div', 'vg-pane'), L = layer(r, shared); v.appendChild(L.w); ims.push(L.im);
      f.appendChild(v); f.appendChild(h('figcaption', '', LETTER[c.slots.indexOf(r)] + ' · ' + lab(r))); g.appendChild(f);
    });
    function paint() { ims.forEach(function (im) { applyT(im, shared); }); zr.value = Math.round(shared.s * 100); }
    g.style.touchAction = 'pan-y';
    gestures(g, function () { return shared; }, paint, function () { return shared.s !== 1; });
    box.appendChild(g);
    var ctl = h('div', 'vg-ctl'), zl = h('label', 'vg-row vg-zoom'); zl.appendChild(h('span', '', 'Zoom (alle Bilder)'));
    var zr = h('input'); zr.type = 'range'; zr.min = 100; zr.max = 400; zr.value = Math.round(shared.s * 100); zr.oninput = function () { shared.s = zr.value / 100; paint(); }; zl.appendChild(zr);
    var rs = h('button', 'btn btn-secondary btn-sm', 'Zurücksetzen'); rs.type = 'button'; rs.onclick = function () { shared.s = 1; shared.x = 0; shared.y = 0; cmpRender(p); };
    zl.appendChild(rs); ctl.appendChild(zl); box.appendChild(ctl);
  }

  window.cmpRender = function (p) {
    p = p || curP; host = document.getElementById('md-cmp'); if (!host || !p) return;
    var imgs = usable(p);
    if (typeof medFilter !== 'undefined' && medFilter !== 'bild' || imgs.length < 2) { host.style.display = 'none'; host.innerHTML = ''; return; }
    var c = st(p); host.style.display = 'block'; host.innerHTML = '';
    /* Bilder, die ausgeblendet oder entfernt wurden, fliegen aus den Plätzen */
    c.slots = c.slots.map(function (r) { return r && imgs.indexOf(r) >= 0 ? r : null; });
    var head = h('div', 'vg-head'), t = h('button', 'vg-title', (c.open ? '▾ ' : '▸ ') + 'Bildvergleich'); t.type = 'button'; t.onclick = function () { c.open = !c.open; cmpRender(p); }; head.appendChild(t);
    var fl = filled(c); if (fl.length) { var cl = h('button', 'btn btn-secondary btn-sm', 'Leeren'); cl.type = 'button'; cl.onclick = function () { c.slots = [null, null, null]; c.n = 2; cmpRender(p); }; head.appendChild(cl); }
    host.appendChild(head);
    if (!c.open) return;
    var tray = h('div', 'vg-tray');
    for (var i = 0; i < c.n; i++) tray.appendChild(slotUi(p, c, i));
    if (c.n < 3) { var pl = h('button', 'vg-plus', '+ 3. Bild'); pl.type = 'button'; pl.title = 'Ein drittes Bild vergleichen'; pl.onclick = function () { c.n = 3; cmpRender(p); }; tray.appendChild(pl); }
    else { var mi = h('button', 'vg-plus', '− 3. Bild'); mi.type = 'button'; mi.onclick = function () { c.n = 2; c.slots[2] = null; cmpRender(p); }; tray.appendChild(mi); }
    host.appendChild(tray);
    if (fl.length < 2) { host.appendChild(h('div', 'vg-hint', 'Zwei Bilder (bis zu drei) auf die Plätze ziehen oder am Bild ⇄ tippen.')); return; }
    var bar = h('div', 'vg-bar');
    bar.appendChild(seg([['over', 'Übereinander'], ['side', 'Nebeneinander']], c.mode, function (m) { c.mode = m; cmpRender(p); }));
    if (c.mode === 'over') bar.appendChild(seg([['wipe', 'Teilen'], ['blend', 'Überblenden']], c.kind, function (k) { c.kind = k; cmpRender(p); }));
    var sw = h('button', 'btn btn-secondary btn-sm', '⇄ Reihenfolge'); sw.type = 'button'; sw.title = 'Bilder tauschen (A ist unten bzw. links)';
    sw.onclick = function () { var f = c.slots.slice(0, c.n).filter(Boolean); f.push(f.shift()); for (var j = 0; j < 3; j++) c.slots[j] = f[j] || null; cmpRender(p); };
    var sd = h('button', 'btn btn-secondary btn-sm', 'Nach Datum'); sd.type = 'button'; sd.title = 'Älteste Aufnahme zuerst';
    sd.onclick = function () { var f = c.slots.slice(0, c.n).filter(Boolean).sort(function (a, b) { return tsOf(a) - tsOf(b); }); for (var j = 0; j < 3; j++) c.slots[j] = f[j] || null; cmpRender(p); };
    bar.appendChild(sw); bar.appendChild(sd); host.appendChild(bar);
    if (c.mode === 'side') side(p, c, host); else overlay(p, c, host);
  };
})();
