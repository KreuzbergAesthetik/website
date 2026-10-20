/* Gemeinsame Bausteine der Webformulare: Unterschrift, PDF, Versand */
var PRAXIS_F = { name: 'Kreuzberg Ästhetik', arzt: 'Manuel Fella', mail: 'manuel.fella@kreuzberg-aesthetik.de', strasse: 'Neuenburger Str. 24', ort: '10969 Berlin' };
/* Adresse des Empfangsskripts auf dem Webspace der Praxis (siehe formular-empfang.php und LIESMICH.txt).
   Solange sie leer ist, bekommt der Patient das PDF zum Teilen oder Herunterladen. */
var ENDPOINT = '';

function $(id) { return document.getElementById(id); }
function el(tag, attrs, kids) {
  var e = document.createElement(tag);
  Object.keys(attrs || {}).forEach(function (k) { if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); });
  (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return e;
}
function pad2(n) { return ('0' + n).slice(-2); }
function today() { var d = new Date(); return pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear(); }

/* Ja/Nein-Schalter */
function ynToggle(name, onchange) {
  var seg = el('div', { class: 'seg' }), val = null;
  [['ja', 'Ja'], ['nein', 'Nein']].forEach(function (o) {
    var inp = el('input', { type: 'radio', name: name, value: o[0] });
    inp.addEventListener('change', function () { val = o[0] === 'ja'; seg.classList.remove('err'); if (onchange) onchange(val); });
    seg.appendChild(el('label', {}, [inp, el('span', { text: o[1] })]));
  });
  return { node: seg, get: function () { return val; }, mark: function () { seg.classList.add('err'); } };
}

/* Unterschriftenfeld */
function makeSig(canvas) {
  var ctx = canvas.getContext('2d'), drawing = false, dirty = false, last = null;
  function size() {
    var r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0f172a';
  }
  size(); window.addEventListener('resize', function () { if (!dirty) size(); });
  function pos(ev) { var r = canvas.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  canvas.addEventListener('pointerdown', function (ev) { ev.preventDefault(); drawing = true; last = pos(ev); canvas.setPointerCapture(ev.pointerId); ctx.beginPath(); ctx.arc(last.x, last.y, 1.2, 0, 7); ctx.fill(); dirty = true; canvas.classList.remove('invalid'); });
  canvas.addEventListener('pointermove', function (ev) { if (!drawing) return; ev.preventDefault(); var p = pos(ev); ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
  ['pointerup', 'pointercancel'].forEach(function (t) { canvas.addEventListener(t, function () { drawing = false; }); });
  return {
    isEmpty: function () { return !dirty; },
    clear: function () { dirty = false; size(); },
    png: function () {
      /* auf weißen Grund verkleinern, damit das PDF klein bleibt */
      var w = 600, h = Math.round(canvas.height / canvas.width * 600), c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(canvas, 0, 0, w, h); return c.toDataURL('image/png');
    }
  };
}

/* PDF-Baukasten auf Basis von pdf-lib */
function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Skript ' + src + ' nicht ladbar')); }; document.head.appendChild(s); }); }
function ascii(t) { return String(t == null ? '' : t).replace(/[‐-―]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/[^\x20-\x7E -ÿ€\n]/g, '?'); }

async function newPdf(title, who) {
  if (!window.PDFLib) await loadScript('pdf-lib.min.js');
  var L = window.PDFLib, doc = await L.PDFDocument.create();
  doc.setTitle(ascii(title)); doc.setAuthor(PRAXIS_F.name); doc.setCreator('Kreuzberg Ästhetik Webformular');
  var P = { L: L, doc: doc, W: 595.28, H: 841.89, M: 46, page: null, y: 0, who: who, title: title, n: 0 };
  P.f = await doc.embedFont(L.StandardFonts.Helvetica); P.fb = await doc.embedFont(L.StandardFonts.HelveticaBold); P.fi = await doc.embedFont(L.StandardFonts.HelveticaOblique);
  try { var r = await fetch('icon-192.png'), buf = new Uint8Array(await r.arrayBuffer()); P.logo = (buf[0] === 0xFF && buf[1] === 0xD8) ? await doc.embedJpg(buf) : await doc.embedPng(buf); } catch (x) { P.logo = null; }
  P.black = L.rgb(0.06, 0.09, 0.16); P.gray = L.rgb(0.4, 0.45, 0.52); P.line = L.rgb(0.8, 0.84, 0.88);
  P.add = function () {
    P.page = doc.addPage([P.W, P.H]); P.n++;
    if (P.n === 1) {
      if (P.logo) P.page.drawImage(P.logo, { x: P.M, y: P.H - P.M - 44, width: 44, height: 44 });
      P.page.drawText(ascii(P.title), { x: P.M + 58, y: P.H - P.M - 16, size: 19, font: P.fb, color: P.black });
      P.page.drawText(ascii(PRAXIS_F.name + ' - Arzt: ' + PRAXIS_F.arzt), { x: P.M + 58, y: P.H - P.M - 32, size: 9.5, font: P.f, color: P.gray });
      P.y = P.H - P.M - 62;
    } else {
      P.page.drawText(ascii(P.title + ' - ' + P.who), { x: P.M, y: P.H - P.M + 4, size: 9, font: P.f, color: P.gray });
      P.y = P.H - P.M - 16;
    }
  };
  P.wrap = function (text, font, size, maxW) {
    var out = [];
    ascii(text).split('\n').forEach(function (para) {
      var line = '';
      para.split(/\s+/).forEach(function (w) {
        if (!w) return; var c = line ? line + ' ' + w : w;
        if (line && font.widthOfTextAtSize(c, size) > maxW) { out.push(line); line = w; } else line = c;
      });
      out.push(line);
    });
    return out;
  };
  P.ensure = function (h) { if (!P.page || P.y - h < P.M + 30) P.add(); };
  P.text = function (text, o) {
    o = o || {}; var size = o.size || 10, font = o.bold ? P.fb : (o.italic ? P.fi : P.f), x = o.x != null ? o.x : P.M, maxW = o.maxW || (P.W - P.M - x), lh = size * 1.35;
    var lines = P.wrap(text, font, size, maxW);
    lines.forEach(function (l) { P.ensure(lh); P.page.drawText(l, { x: x, y: P.y - size, size: size, font: font, color: o.color || P.black }); P.y -= lh; });
    P.y -= (o.gap || 0);
    return lines.length;
  };
  P.rule = function (gap) { P.ensure(10); P.page.drawLine({ start: { x: P.M, y: P.y - 2 }, end: { x: P.W - P.M, y: P.y - 2 }, thickness: 0.7, color: P.line }); P.y -= (gap || 8); };
  P.yn = function (x, y, val) {
    /* J [x] N [ ] */
    var s = 9;
    P.page.drawText('J', { x: x, y: y + 1, size: 9, font: P.fb, color: P.black });
    P.page.drawRectangle({ x: x + 9, y: y - 1, width: s, height: s, borderColor: P.black, borderWidth: 0.9 });
    P.page.drawText('N', { x: x + 26, y: y + 1, size: 9, font: P.fb, color: P.black });
    P.page.drawRectangle({ x: x + 35, y: y - 1, width: s, height: s, borderColor: P.black, borderWidth: 0.9 });
    var bx = val ? x + 9 : x + 35;
    P.page.drawLine({ start: { x: bx + 1.5, y: y + 0.5 }, end: { x: bx + s - 1.5, y: y + s - 2 }, thickness: 1.4, color: P.black });
    P.page.drawLine({ start: { x: bx + 1.5, y: y + s - 2 }, end: { x: bx + s - 1.5, y: y + 0.5 }, thickness: 1.4, color: P.black });
  };
  P.sign = async function (dataUrl, label, name) {
    P.ensure(110);
    var img = await doc.embedPng(dataUrl), w = 170, h = Math.min(62, img.height / img.width * w);
    P.page.drawImage(img, { x: P.M, y: P.y - h, width: w, height: h });
    P.y -= h + 2; P.page.drawLine({ start: { x: P.M, y: P.y }, end: { x: P.M + 220, y: P.y }, thickness: 0.7, color: P.black }); P.y -= 11;
    P.page.drawText(ascii(label), { x: P.M, y: P.y, size: 8.5, font: P.f, color: P.gray }); P.y -= 12;
    P.page.drawText(ascii(name + ' - ' + today()), { x: P.M, y: P.y, size: 8.5, font: P.f, color: P.gray }); P.y -= 12;
  };
  P.finish = async function (data) {
    if (data) { try { await doc.attach(new TextEncoder().encode(JSON.stringify(data)), 'formulardaten.json', { mimeType: 'application/json', description: 'Strukturierte Formulardaten für die Praxis-App' }); } catch (x) {} }
    var pages = doc.getPages();
    pages.forEach(function (pg, i) {
      pg.drawLine({ start: { x: P.M, y: P.M + 12 }, end: { x: P.W - P.M, y: P.M + 12 }, thickness: 0.6, color: P.line });
      pg.drawText(ascii(P.who + ' - ' + today()), { x: P.M, y: P.M, size: 8.5, font: P.f, color: P.gray });
      var c = (i + 1) + ' von ' + pages.length; pg.drawText(c, { x: P.W / 2 - P.f.widthOfTextAtSize(c, 8.5) / 2, y: P.M, size: 8.5, font: P.f, color: P.gray });
      var r = ascii(PRAXIS_F.name + ' - Arzt: ' + PRAXIS_F.arzt); pg.drawText(r, { x: P.W - P.M - P.f.widthOfTextAtSize(r, 8.5), y: P.M, size: 8.5, font: P.f, color: P.gray });
    });
    return await doc.save();
  };
  P.add();
  return P;
}

function bytesToBlob(b) { return new Blob([b], { type: 'application/pdf' }); }
function slug(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, ''); }

/* Versand: an das Empfangsskript der Praxis oder, solange keins eingerichtet ist, PDF zum Teilen/Herunterladen */
async function deliver(typ, label, who, data, pdfBytes, hp) {
  var blob = bytesToBlob(pdfBytes), fname = label + '_' + slug(who) + '_' + new Date().toISOString().slice(0, 10) + '.pdf';
  if (ENDPOINT) {
    var fd = new FormData();
    fd.append('typ', typ); fd.append('name', who); fd.append('website', hp || ''); fd.append('pdf', blob, fname);
    fd.append('daten', new Blob([JSON.stringify(data)], { type: 'application/json' }), fname.replace(/\.pdf$/, '.json'));
    var r = await fetch(ENDPOINT, { method: 'POST', body: fd });
    var j = null; try { j = await r.json(); } catch (x) {}
    if (!r.ok || !j || !j.ok) throw new Error((j && j.error) || ('Fehler ' + r.status));
    return { sent: true, blob: blob, fname: fname };
  }
  return { sent: false, blob: blob, fname: fname };
}
function showDone(res, label) {
  var box = $('formbox'); box.innerHTML = '';
  var d = el('div', { class: 'done' });
  d.appendChild(el('div', { html: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12.5l3 3 5-6"/></svg>' }));
  if (res.sent) {
    d.appendChild(el('h1', { text: 'Vielen Dank' }));
    d.appendChild(el('p', { text: 'Dein ' + label + ' ist bei uns angekommen. Wir freuen uns auf Dich.' }));
  } else {
    d.appendChild(el('h1', { text: 'Fast geschafft' }));
    d.appendChild(el('p', { text: 'Dein ' + label + ' ist als PDF erstellt. Bitte schicke es jetzt an die Praxis.' }));
    var b = el('div', { class: 'btns' });
    var url = URL.createObjectURL(res.blob), file = null;
    try { file = new File([res.blob], res.fname, { type: 'application/pdf' }); } catch (x) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      var sh = el('button', { class: 'btn primary', type: 'button', text: 'PDF an die Praxis senden' });
      sh.onclick = function () { navigator.share({ files: [file], title: label + ' ' + PRAXIS_F.name, text: 'Mein ' + label + ' für ' + PRAXIS_F.name }).catch(function () {}); };
      b.appendChild(sh);
    }
    var a = el('a', { class: 'btn', href: url, download: res.fname, text: 'PDF herunterladen' }); b.appendChild(a);
    b.appendChild(el('a', { class: 'btn', href: 'mailto:' + PRAXIS_F.mail + '?subject=' + encodeURIComponent(label) + '&body=' + encodeURIComponent('Anbei mein ' + label + ' als PDF.'), text: 'E-Mail an die Praxis öffnen' }));
    d.appendChild(b);
    d.appendChild(el('p', { class: 'hint', text: 'Hänge das heruntergeladene PDF an die E-Mail an.' }));
  }
  box.appendChild(d); window.scrollTo(0, 0);
}
function errBox(msg) { var m = $('errmsg'); m.textContent = msg; m.style.display = 'block'; m.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

var DATENSCHUTZ = [
  'Verantwortlich: ' + PRAXIS_F.name + ', ' + PRAXIS_F.arzt + ', ' + PRAXIS_F.strasse + ', ' + PRAXIS_F.ort + ', E-Mail: ' + PRAXIS_F.mail + '.',
  'Zweck: Deine Angaben nutzen wir zur Vorbereitung und Durchführung Deiner Behandlung, zur Terminorganisation und zur Dokumentation in der Patientenakte. Rechtsgrundlage sind Art. 6 Abs. 1 lit. b DSGVO und, soweit es um Gesundheitsdaten geht, Art. 9 Abs. 2 lit. h DSGVO in Verbindung mit dem Behandlungsvertrag. Die Terminerinnerung per SMS oder E-Mail erfolgt nur auf Grundlage Deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Du jederzeit widerrufen kannst.',
  'Übermittlung: Das ausgefüllte Formular wird verschlüsselt an die Praxis übertragen. Eine Weitergabe an Dritte erfolgt nur, wenn dies für die Behandlung oder Abrechnung erforderlich ist oder eine gesetzliche Pflicht besteht.',
  'Speicherdauer: Behandlungsunterlagen werden nach § 630f BGB mindestens zehn Jahre aufbewahrt.',
  'Deine Rechte: Du hast das Recht auf Auskunft, Berichtigung, Löschung (soweit keine Aufbewahrungspflicht entgegensteht), Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch sowie das Recht, Dich bei einer Datenschutzaufsichtsbehörde zu beschweren.'
];
function datenschutzBlock() {
  var d = el('details', {}, [el('summary', { text: 'Details zur Verarbeitung und Datenschutzhinweise gemäß Artikel 13 DSGVO' })]);
  var inner = el('div'); DATENSCHUTZ.forEach(function (t) { inner.appendChild(el('p', { text: t })); }); d.appendChild(inner); return d;
}

/* Rote Markierung verschwindet, sobald das Feld bearbeitet wird */
['input', 'change'].forEach(function (t) { document.addEventListener(t, function (ev) { var n = ev.target; if (n.classList) n.classList.remove('invalid'); var g = n.closest && n.closest('.invalid'); if (g) g.classList.remove('invalid'); }); });

['input', 'change'].forEach(function (t) { document.addEventListener(t, function () { var m = document.getElementById('errmsg'); if (m) m.style.display = 'none'; }); });
