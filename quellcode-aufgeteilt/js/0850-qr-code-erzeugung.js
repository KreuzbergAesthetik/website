/* ===== QR-Code-Erzeugung (Byte-Modus, Fehlerkorrektur M, Version 1 bis 10) ===== */
var QR_ECC = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26], QR_BLK = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
function qrRawCw(v) {
  var r = (16 * v + 128) * v + 64;
  if (v >= 2) { var na = Math.floor(v / 7) + 2; r -= (25 * na - 10) * na - 55; if (v >= 7) r -= 36; }
  return Math.floor(r / 8);
}
function qrGfMul(x, y) { var z = 0; for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; } return z; }
function qrRs(data, deg) {
  var div = []; for (var i = 0; i < deg - 1; i++) div.push(0); div.push(1);
  var root = 1;
  for (var i = 0; i < deg; i++) {
    for (var j = 0; j < div.length; j++) { div[j] = qrGfMul(div[j], root); if (j + 1 < div.length) div[j] ^= div[j + 1]; }
    root = qrGfMul(root, 2);
  }
  var res = div.map(function () { return 0; });
  data.forEach(function (b) {
    var f = b ^ res.shift(); res.push(0);
    div.forEach(function (c, i) { res[i] ^= qrGfMul(c, f); });
  });
  return res;
}
function qrMake(text) {
  var u = unescape(encodeURIComponent(text)), bytes = []; for (var i = 0; i < u.length; i++) bytes.push(u.charCodeAt(i));
  var ver = 0, cap = 0;
  for (var v = 1; v <= 10; v++) { cap = qrRawCw(v) - QR_ECC[v - 1] * QR_BLK[v - 1]; if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= cap * 8) { ver = v; break; } }
  if (!ver) return null;
  var bits = [];
  function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
  put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(function (b) { put(b, 8); });
  put(0, Math.min(4, cap * 8 - bits.length)); while (bits.length % 8) bits.push(0);
  for (var pad = 0xEC; bits.length < cap * 8; pad ^= 0xEC ^ 0x11) put(pad, 8);
  var data = []; for (var i = 0; i < bits.length; i += 8) { var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k]; data.push(b); }
  var nb = QR_BLK[ver - 1], ecl = QR_ECC[ver - 1], raw = qrRawCw(ver), nShort = nb - raw % nb, shortLen = Math.floor(raw / nb), blocks = [], k = 0;
  for (var i = 0; i < nb; i++) {
    var dat = data.slice(k, k + shortLen - ecl + (i < nShort ? 0 : 1)); k += dat.length;
    var ec = qrRs(dat, ecl); if (i < nShort) dat.push(0); blocks.push(dat.concat(ec));
  }
  var all = [];
  for (var i = 0; i < blocks[0].length; i++) blocks.forEach(function (bl, j) { if (i !== shortLen - ecl || j >= nShort) all.push(bl[i]); });
  var size = ver * 4 + 17, mod = [], fn = [];
  for (var y = 0; y < size; y++) { mod.push([]); fn.push([]); for (var x = 0; x < size; x++) { mod[y].push(false); fn[y].push(false); } }
  function setF(x, y, d) { mod[y][x] = d; fn[y][x] = true; }
  for (var i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
  function finder(cx, cy) { for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) { var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy; if (xx >= 0 && xx < size && yy >= 0 && yy < size) setF(xx, yy, d !== 2 && d !== 4); } }
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  var ap = []; if (ver > 1) { var na = Math.floor(ver / 7) + 2, step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2; ap = [6]; for (var p = size - 7; ap.length < na; p -= step) ap.splice(1, 0, p); }
  ap.forEach(function (ax, i) { ap.forEach(function (ay, j) {
    if ((i === 0 && j === 0) || (i === 0 && j === ap.length - 1) || (i === ap.length - 1 && j === 0)) return;
    for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }); });
  function fmt(mask) {
    var d = mask, rem = d; for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    var b = ((d << 10) | rem) ^ 0x5412, g = function (i) { return ((b >>> i) & 1) === 1; };
    for (var i = 0; i <= 5; i++) setF(8, i, g(i)); setF(8, 7, g(6)); setF(8, 8, g(7)); setF(7, 8, g(8)); for (var i = 9; i < 15; i++) setF(14 - i, 8, g(i));
    for (var i = 0; i < 8; i++) setF(size - 1 - i, 8, g(i)); for (var i = 8; i < 15; i++) setF(8, size - 15 + i, g(i)); setF(8, size - 8, true);
  }
  fmt(0);
  if (ver >= 7) { var rem = ver; for (var i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25); var vb = (ver << 12) | rem; for (var i = 0; i < 18; i++) { var bt = ((vb >>> i) & 1) === 1, a = size - 11 + i % 3, c = Math.floor(i / 3); setF(a, c, bt); setF(c, a, bt); } }
  var ii = 0;
  for (var right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (var vert = 0; vert < size; vert++) for (var j = 0; j < 2; j++) {
      var x = right - j, y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
      if (!fn[y][x] && ii < all.length * 8) { mod[y][x] = ((all[ii >>> 3] >>> (7 - (ii & 7))) & 1) === 1; ii++; }
    }
  }
  function mask(m) {
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      var inv = m === 0 ? (x + y) % 2 === 0 : m === 1 ? y % 2 === 0 : m === 2 ? x % 3 === 0 : m === 3 ? (x + y) % 3 === 0 : m === 4 ? (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0 : m === 5 ? x * y % 2 + x * y % 3 === 0 : m === 6 ? (x * y % 2 + x * y % 3) % 2 === 0 : ((x + y) % 2 + x * y % 3) % 2 === 0;
      if (!fn[y][x] && inv) mod[y][x] = !mod[y][x];
    }
  }
  function penalty() {
    var p = 0, dark = 0, line, runs;
    function scan(get) {
      for (var a = 0; a < size; a++) {
        var run = 1, s = '';
        for (var b = 0; b < size; b++) {
          var c = get(a, b); s += c ? '1' : '0'; if (c) dark++;
          if (b > 0 && c === get(a, b - 1)) { run++; if (run === 5) p += 3; else if (run > 5) p++; } else run = 1;
        }
        var f = 0, idx; while ((idx = s.indexOf('10111010000', f)) >= 0) { p += 40; f = idx + 1; } f = 0; while ((idx = s.indexOf('00001011101', f)) >= 0) { p += 40; f = idx + 1; }
      }
    }
    scan(function (a, b) { return mod[a][b]; }); dark = 0; scan(function (a, b) { return mod[b][a]; });
    dark = dark / 1;
    for (var y = 0; y < size - 1; y++) for (var x = 0; x < size - 1; x++) { var c = mod[y][x]; if (c === mod[y][x + 1] && c === mod[y + 1][x] && c === mod[y + 1][x + 1]) p += 3; }
    var tot = size * size; p += (Math.ceil(Math.abs(dark * 20 - tot * 10) / tot) - 1) * 10;
    return p;
  }
  var best = 0, bp = 1e9;
  for (var m = 0; m < 8; m++) { mask(m); fmt(m); var pe = penalty(); if (pe < bp) { bp = pe; best = m; } mask(m); }
  mask(best); fmt(best);
  return mod.map(function (r) { return r.map(function (v) { return v ? '1' : '0'; }).join(''); });
}

function epcFor(inv) {
  var rest = Math.max(0, r2(inv.total - paidSum(inv)));
  return ['BCD', '002', '1', 'SCT', String(settings.bic || '').replace(/\s+/g, '').toUpperCase(), settings.inhaber || 'Kreuzberg Ästhetik', ibanKey(settings.iban), 'EUR' + rest.toFixed(2), '', '', 'Rechnung ' + inv.nr].join('\n');
}
function qrSvg(rows, size) {
  var n = rows.length, d = '', NS = 'http://www.w3.org/2000/svg';
  rows.forEach(function (rw, r) { var c = 0; while (c < n) { if (rw.charAt(c) === '1') { var e = c; while (e < n && rw.charAt(e) === '1') e++; d += 'M' + c + ' ' + r + 'h' + (e - c) + 'v1h-' + (e - c) + 'z'; c = e; } else c++; } });
  var sv = document.createElementNS(NS, 'svg'); sv.setAttribute('viewBox', '-2 -2 ' + (n + 4) + ' ' + (n + 4)); sv.setAttribute('width', size); sv.setAttribute('height', size); sv.setAttribute('shape-rendering', 'crispEdges'); sv.style.flex = 'none';
  var bg = document.createElementNS(NS, 'rect'); bg.setAttribute('x', -2); bg.setAttribute('y', -2); bg.setAttribute('width', n + 4); bg.setAttribute('height', n + 4); bg.setAttribute('fill', '#fff'); sv.appendChild(bg);
  var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', '#111'); sv.appendChild(p); return sv;
}
function ibanKey(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
/* Der vorbereitete PayPal-QR-Code gilt nur für die Adresse, die ihn erzeugt hat; die Adresse selbst steht nicht im Code, nur ihr Prüfwert. */
function qrHash(t) { var h = 2166136261; for (var i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(36); }
function qrPaypal() { return qrHash(String(settings.paypal || '').trim().toLowerCase()) === '42kex4'; }
function splitRecipient(inv) {
  var a = (inv.name || '').split(' '), anr = ['Frau', 'Herr', 'Divers'].indexOf(a[0]) >= 0 ? a.shift() : '';
  return { anrede: anr, lines: [a.join(' ')].concat(String(inv.adresse || '').split('\n').filter(function (x) { return x.trim(); })) };
}
function invCalc(inv) {
  var byRate = {}; inv.items.forEach(function (it) { var rt = it.rate != null ? it.rate : 0, a = it.amount != null ? it.amount : r2(it.qty * it.price); byRate[rt] = (byRate[rt] || 0) + a; });
  var vat = 0, vr = [];
  Object.keys(byRate).map(Number).sort(function (a, b) { return b - a; }).forEach(function (rt) {
    if (rt > 0) { var g = byRate[rt], v = r2(g * rt / (100 + rt)); vat += v; vr.push({ label: 'Umsatzsteuer ' + rt + '% auf Netto ' + eurP(g - v), val: v }); }
  });
  return { net: r2(inv.total - vat), vr: vr };
}
function invStatusText(inv) {
  if (inv.stornoFor) return 'Stornorechnung zu Rechnung ' + inv.stornoFor;
  if (inv.storniert) return 'Storniert' + (inv.stornoRef ? ' (Stornorechnung ' + inv.stornoRef + ')' : '');
  var st = invState(inv), pays = inv.payments || [];
  return st.full ? 'Bezahlt' + (pays.length ? ' am ' + fmtD(pays[pays.length - 1].date) : '') : (st.txt === 'Teilzahlung' ? 'Teilzahlung, offen ' + eurP(inv.total - paidSum(inv)) : 'Offen');
}
function buildInvoicePdf(inv, logo) {
  var PW = 595, PH = 842, L = 60, R = 543, pages = [], cur, y, st = invIsDraft(inv) ? { full: true } : invState(inv), pays = inv.payments || [];
  var imgs = [];
  if (logo) imgs.push({ n: 'Im1', w: logo.w, h: logo.h, bytes: logo.bytes });
  var q1 = (!!settings.iban && !st.full && inv.showQr !== false) ? qrMake(epcFor(inv)) : null, useQ1 = !!q1, useQ2 = qrPaypal() && !st.full && inv.showQr !== false;
  function np() { cur = []; pages.push(cur); y = 60; }
  function Y(v) { return (PH - v).toFixed(2); }
  function txt(x, v, s, size, bold, gray, font) { cur.push((gray != null ? gray : 0.1) + ' g BT /' + (font || (bold ? 'F2' : 'F1')) + ' ' + size + ' Tf ' + x.toFixed(2) + ' ' + Y(v) + ' Td (' + pdfEnc(s) + ') Tj ET'); }
  function txtR(x, v, s, size, bold, gray) { txt(x - pdfW(s, bold, size), v, s, size, bold, gray); }
  function txtC(x, v, s, size, bold, gray) { txt(x - pdfW(s, bold, size) / 2, v, s, size, bold, gray); }
  function line(x1, y1, x2, y2, w) { cur.push('0.15 G ' + (w || 0.7) + ' w ' + x1.toFixed(2) + ' ' + Y(y1) + ' m ' + x2.toFixed(2) + ' ' + Y(y2) + ' l S'); }
  function fill(x, v, w, h, g) { cur.push(g + ' g ' + x.toFixed(2) + ' ' + (PH - v - h).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re f'); }
  function box(x, v, w, h, lw) { cur.push('0.15 G ' + (lw || 0.9) + ' w ' + x.toFixed(2) + ' ' + (PH - v - h).toFixed(2) + ' ' + w.toFixed(2) + ' ' + h.toFixed(2) + ' re S'); }
  function image(name, x, v, w, h) { cur.push('q ' + w + ' 0 0 ' + h + ' ' + x.toFixed(2) + ' ' + (PH - v - h).toFixed(2) + ' cm /' + name + ' Do Q'); }
  function need(h) { if (y + h > 770) np(); }
  function qr(rows, x, v, size) {
    var n = rows.length, m = size / n, ops = ['0.1 g'];
    rows.forEach(function (rw, r) { var c = 0; while (c < n) { if (rw.charAt(c) === '1') { var e = c; while (e < n && rw.charAt(e) === '1') e++; ops.push((x + c * m).toFixed(2) + ' ' + (PH - v - (r + 1) * m).toFixed(2) + ' ' + ((e - c) * m + 0.15).toFixed(2) + ' ' + (m + 0.15).toFixed(2) + ' re'); c = e; } else c++; } });
    ops.push('f'); cur.push(ops.join(' '));
  }
  np();
  if (logo) image('Im1', L, 56, 56, 56);
  var tt = PRAXIS.kopf.split(' - ');
  txt(PW / 2 - timesW(tt[0], 20) / 2, 80, tt[0], 20, false, 0.1, 'F3');
  if (tt[1]) txt(PW / 2 - timesW(tt[1], 10) / 2, 95, tt[1], 10, false, 0.1, 'F3');
  [PRAXIS.strasse, PRAXIS.ort, 'Tel. ' + PRAXIS.tel].forEach(function (t, i) { txtR(R, 68 + i * 12.5, t, 9, false, 0.2); });
  if (settings.ustid) txtR(R, 105.5, 'UID: ' + settings.ustid, 9, true, 0.1);
  var rc = splitRecipient(inv), ry = 152;
  if (rc.anrede) { txt(L, ry, rc.anrede, 9.5, true); ry += 12; }
  rc.lines.forEach(function (t, i) { pdfWrap(t, false, 9.5, 280).forEach(function (w) { txt(L, ry, w, 9.5); ry += 12; }); });
  txt(379, 148, invIsDraft(inv) ? DRAFT[inv.kind].kopf : inv.stornoFor ? 'STORNORECHNUNG' : 'RECHNUNG', 9.5, true);
  (invIsDraft(inv) ? [['Datum:', fmtD(inv.date)]] : [['Rechnungsnummer:', inv.nr], ['Rechnungsdatum:', fmtD(inv.date)], ['Zahlungsstatus:', invStatusText(inv)]]).forEach(function (m, i) {
    txt(379, 160 + i * 12, m[0], 8.5, false, 0.25); txtR(R, 160 + i * 12, m[1], 8.5, false, 0.25);
  });
  y = Math.max(ry, 190) + 16;
  var cx = [60, 161, 199, 424, 480, 543];
  function row(top, h, hdr) { for (var k = 0; k < 5; k++) box(cx[k], top, cx[k + 1] - cx[k], h, 0.8); }
  if (inv.vortext) { pdfWrap(inv.vortext, false, 9.5, 483).forEach(function (t) { if (y > 770) np(); txt(L, y, t, 9.5); y += 13; }); y += 8; }
  fill(60, y, 483, 23, 0.93); row(y, 23);
  txt(66, y + 15, 'Datum', 9, true); txtC((cx[1] + cx[2]) / 2, y + 15, 'Menge', 9, true); txt(205, y + 15, 'Position', 9, true); txtC((cx[3] + cx[4]) / 2, y + 15, 'MwSt-%', 9, true); txtR(537, y + 15, 'Brutto', 9, true);
  y += 23;
  inv.items.forEach(function (it) {
    var amt = it.amount != null ? it.amount : r2(it.qty * it.price), rate = it.rate != null ? it.rate : 0;
    var ls = pdfWrap(it.text, false, 9.5, 212), ns = it.note ? pdfWrap(it.note, false, 8.5, 212) : [], h = Math.max(25, ls.length * 12 + ns.length * 11 + 12);
    if (y + h > 770) np();
    row(y, h);
    if (!it.rabatt) { txt(66, y + 16, fmtD(it.datum || inv.leistung), 9.5); txtC((cx[1] + cx[2]) / 2, y + 16, String(it.qty).replace('.', ','), 9.5); }
    ls.forEach(function (t, i) { txt(205, y + 16 + i * 12, t, 9.5); });
    ns.forEach(function (t, i) { txt(205, y + 16 + (ls.length - 1) * 12 + 12 + i * 11, t, 8.5, false, 0.3); });
    txtC((cx[3] + cx[4]) / 2, y + 16, rate + '%', 9.5); txtR(537, y + 16, eurP(amt), 9.5);
    y += h;
  });
  var c = invCalc(inv), sums = [['Gesamt Netto', c.net]].concat(c.vr.map(function (v) { return [v.label, v.val]; }));
  need(sums.length * 21 + 40); y += 14;
  sums.forEach(function (r, i) {
    txt(66, y + 14, r[0], 9.5); txtR(537, y + 14, eurP(r[1]), 9.5); y += 21;
    line(60, y, 543, y, i === sums.length - 1 ? 1.4 : 0.7);
  });
  txt(66, y + 17, 'Gesamt', 11.5, true); txtR(537, y + 17, eurP(inv.total), 11.5, true); y += 28;
  if (pays.length) {
    need(30 + pays.length * 34); y += 10; txt(L, y, 'ZAHLUNGEN', 9, true); y += 8;
    var bh = pays.length * 34 + 6;
    cur.push('0.2 G 0.6 w [3 2] 0 d 60 ' + (PH - y - bh).toFixed(2) + ' 483 ' + bh + ' re S [] 0 d');
    pays.forEach(function (p, i) {
      var by = y + 17 + i * 34;
      txt(68, by, p.nr, 9.5, true); txt(68 + pdfW(p.nr, true, 9.5), by, ' (' + p.art + ')', 9.5);
      txt(68, by + 13, eurP(p.amount), 9.5, true); txt(68 + pdfW(eurP(p.amount), true, 9.5), by + 13, ' am ' + fmtD(p.date), 9.5);
      txt(300, by + 13, eurP(p.amount) + ' für ' + inv.nr, 9.5);
    });
    y += bh + 6;
  }
  function para(text, size, bold) { pdfWrap(text, bold, size, 483).forEach(function (t) { need(14); txt(L, y, t, size, bold); y += 13; }); }
  if (inv.hinweis) { y += 8; need(20); para(inv.hinweis, 9.5); }
  if (inv.doku) { y += 10; need(36); txt(L, y, 'Behandlungsdokumentation', 9.5, true); y += 13; para(inv.doku, 9.5); }
  if (!st.full) {
    if (inv.zahlung) { y += 10; need(20); para(inv.zahlung, 9.5); }
    var hasI = !!settings.iban, hasP = !!settings.paypal;
    if (hasI || hasP) {
      need(100); y += 18;
      txtC(PW / 2, y, 'Den Betrag kannst Du auf mein Konto' + (hasP ? ' oder via PayPal' : '') + ' überweisen.', 9.5, false, 0.2); y += 12;
      var bw = hasI && hasP ? 241.5 : 483, bx = L;
      if (hasI) {
        box(bx, y, bw, 58, 1);
        if (useQ1) qr(q1, bx + 6, y + 6, 46);
        var tx = bx + (useQ1 ? 60 : 8), nm = settings.inhaber || '', ib = settings.iban, fs = 11.5;
        while (fs > 8 && pdfW(ib, false, fs) > bx + bw - tx - 6) fs -= 0.5;
        txt(tx, y + 24, nm, fs); txt(tx, y + 44, ib, fs);
      }
      if (hasP) {
        var px = hasI ? L + 241.5 : L;
        box(px, y, bw, 58, 1);
        var rx = px + bw - (useQ2 ? 62 : 8), pf = 11.5;
        txtR(rx, y + 24, 'PayPal', pf); 
        while (pf > 8 && pdfW(settings.paypal, false, pf) > bw - 70) pf -= 0.5;
        txtR(rx, y + 44, settings.paypal, pf);
        if (useQ2) qr(QRM.pp, px + bw - 52, y + 6, 46);
      }
      y += 58;
    }
  }
  y += 28; if (y > 765) { np(); }
  txt(L, y, 'Bis zum nächsten Mal', 9.5); txt(L, y + 13, 'Manuel', 9.5);
  pages.forEach(function (pg, i) {
    cur = pg;
    txtC(PW / 2, 795, PRAXIS.mail + '   •   ' + PRAXIS.web, 7.5, false, 0.2);
    if (pages.length > 1) txtR(R, 815, 'Seite ' + (i + 1) + ' von ' + pages.length, 8, false, 0.4);
  });
  /* Zusammenbau */
  var parts = [], off = 0, offs = [];
  function put(x) { var b = typeof x === 'string' ? bstr(x) : x; parts.push(b); off += b.length; }
  function obj(n, body) { offs[n] = off; put(n + ' 0 obj\n'); put(body); put('\nendobj\n'); }
  var n = pages.length, base = 6 + imgs.length, kids = [];
  put('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  for (var i = 0; i < n; i++) kids.push((base + i * 2) + ' 0 R');
  obj(2, '<< /Type /Pages /Kids [' + kids.join(' ') + '] /Count ' + n + ' >>');
  obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  obj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>');
  var xo = '';
  imgs.forEach(function (im, i) {
    var on = 6 + i; xo += '/' + im.n + ' ' + on + ' 0 R '; offs[on] = off;
    put(on + ' 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + im.w + ' /Height ' + im.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + im.bytes.length + ' >>\nstream\n'); put(im.bytes); put('\nendstream\nendobj\n');
  });
  pages.forEach(function (pg, i) {
    var pn = base + i * 2, cs = pg.join('\n');
    obj(pn, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + PW + ' ' + PH + '] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >>' + (xo ? ' /XObject << ' + xo + '>>' : '') + ' >> /Contents ' + (pn + 1) + ' 0 R >>');
    obj(pn + 1, '<< /Length ' + cs.length + ' >>\nstream\n' + cs + '\nendstream');
  });
  var total = base + n * 2, xr = off, x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
  for (var k = 1; k < total; k++) x += ('0000000000' + offs[k]).slice(-10) + ' 00000 n \n';
  put(x + 'trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xr + '\n%%EOF');
  var all = new Uint8Array(off), p = 0; parts.forEach(function (b) { all.set(b, p); p += b.length; });
  return all;
}
async function savePdf() {
  var inv = invCur(); if (!inv) return;
  var data = buildInvoicePdf(inv, getLogoJpeg()), name = invFile(inv);
  var dl = null; try { dl = window.claude && await window.claude.use('downloads'); } catch (x) {}
  if (dl) {
    try { await dl.save({ filename: name, data: data }); } catch (x) { if (!x || x.code !== 'declined') alert('Die PDF konnte nicht gespeichert werden.'); }
    return;
  }
  try {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/pdf' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  } catch (x) { alert('Die PDF konnte nicht erstellt werden.'); }
}

/* Rechnung als PDF über das Teilen-Menü des Geräts senden und als versendet vermerken */
async function sendInvoice() {
  var inv = invCur(); if (!inv) return;
  var p = patients.filter(function (x) { return x.id === inv.pid; })[0] || curP, name = invFile(inv), dr = DRAFT[inv.kind], what = dr ? dr.name : 'Rechnung ' + inv.nr;
  var betreff = what + ' - Kreuzberg Ästhetik', text = fillPlatzhalter('{AnredeInformell},\n\nanbei ' + (dr ? 'der ' + dr.name : 'die Rechnung ' + inv.nr) + '.\n\nManuel - Kreuzberg Ästhetik', p);
  var file; try { file = new File([buildInvoicePdf(inv, getLogoJpeg())], name, { type: 'application/pdf' }); } catch (x) { alert('Die PDF konnte nicht erstellt werden.'); return; }
  var done = function (via) {
    inv.sentAt = Date.now();
    if (p) p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: what + ' gesendet (' + via + ')' }]);
    persist(); try { renderPatients(); } catch (x) {} if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
  };
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: betreff, text: text }); done('Teilen-Menü'); }
    catch (x) { if (!x || x.name !== 'AbortError') alert('Das Teilen ist fehlgeschlagen. Bitte „Als PDF speichern“ nutzen und die Datei von Hand anhängen.'); }
    return;
  }
  /* Computer: PDF laden und Mail vorbereiten, Anhang hängt der Nutzer selbst an */
  var a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  if (p && p.email) window.location.href = 'mailto:' + encodeURIComponent(p.email) + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text);
  if (await kaConfirm('Die PDF wurde heruntergeladen. Bitte im Mailprogramm anhängen und senden.\n\nRechnung jetzt als versendet markieren?')) done('Mailprogramm');
}
function invFile(inv) { var dr = DRAFT[inv.kind]; return dr ? dr.datei + '-' + String(inv.name || '').replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, '_') + '-' + inv.date + '.pdf' : 'Rechnung-' + inv.nr + '.pdf'; }
function printInvoice() {
  try { window.print(); } catch (x) { alert('Drucken ist in dieser Ansicht nicht verfügbar.'); }
}

/* E-Mail-Versand: über sendmail.php auf dem Webspace der Praxis (Praxisdaten), sonst über das Mailprogramm des Geräts */
function sendViaServer(mail) {
  var url = (settings.mailUrl || '').trim();
  if (url) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: settings.mailToken || '', an: mail.an, betreff: mail.betreff, text: mail.text }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'Fehler ' + r.status); return { via: 'server' }; }); });
  }
  var href = 'mailto:' + encodeURIComponent(mail.an) + '?subject=' + encodeURIComponent(mail.betreff) + '&body=' + encodeURIComponent(mail.text);
  if (href.length > 1800) return Promise.reject(new Error('Der Text ist für das Mailprogramm zu lang. Bitte kürzen oder den Mailversand in den Praxisdaten einrichten.'));
  window.location.href = href;
  return Promise.resolve({ via: 'mailto' });
}
function openMail() {
  var vs = document.getElementById('m-vorl'); vs.innerHTML = ''; var o0 = mk('option', '', 'Keine Vorlage'); o0.value = ''; vs.appendChild(o0);
  (settings.nachrichten || []).forEach(function (n) { var o = mk('option', '', n.name); o.value = n.id; vs.appendChild(o); });
  var tbx = document.getElementById('m-tb'); tbx.innerHTML = ''; var tp = tbPicker(document.getElementById('m-text')); if (tp) tbx.appendChild(tp);
  document.getElementById('m-an').value = curP.email || '';
  document.getElementById('m-betreff').value = '';
  document.getElementById('m-text').value = '';
  mailAtt = []; mailAttRender();
  openModal('modal-mail');
}
function sendMail() {
  var an = document.getElementById('m-an').value.trim();
  var betreff = document.getElementById('m-betreff').value.trim();
  var text = document.getElementById('m-text').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(an)) { alert('Bitte eine gültige E-Mail-Adresse eingeben.'); return; }
  if (!betreff) { alert('Bitte einen Betreff eingeben.'); return; }
  var p = curP;
  var btn = document.querySelector('#modal-mail .btn-save'); btn.disabled = true;
  if (mailAtt.length) { sendMailWithFiles(an, betreff, text, p, btn); return; }
  sendViaServer({ von: PRAXIS.mail, an: an, betreff: betreff, text: text }).then(function (r) {
    btn.disabled = false;
    p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: (r.via === 'mailto' ? 'E-Mail im Mailprogramm vorbereitet für ' : 'E-Mail gesendet an ') + an + '\nBetreff: ' + betreff + (text ? '\n' + text : '') }]);
    persist(); closeModal('modal-mail'); if (curP === p) renderVerlauf();
  }, function (err) {
    btn.disabled = false;
    alert('Die E-Mail wurde nicht gesendet und nichts in die Zeitleiste eingetragen. ' + (err && err.message ? err.message + ' ' : '') + 'Dein Text bleibt hier erhalten.');
  });
}
async function sendMailWithFiles(an, betreff, text, p, btn) {
  try {
    var files = [];
    for (var i = 0; i < mailAtt.length; i++) { var f = await fGet(mailAtt[i].id); if (f && f.blob) files.push(new File([f.blob], mailAtt[i].name, { type: f.blob.type || 'application/octet-stream' })); }
    if (!files.length) throw new Error('Die Anhänge konnten nicht gelesen werden.');
    var names = files.map(function (x) { return x.name; }).join(', '), via;
    if (navigator.canShare && navigator.canShare({ files: files })) {
      await navigator.share({ files: files, title: betreff, text: text }); via = 'Teilen-Menü';
    } else {
      files.forEach(function (x) { var a = document.createElement('a'); a.href = URL.createObjectURL(x); a.download = x.name; document.body.appendChild(a); a.click(); a.remove(); });
      await sendViaServer({ von: PRAXIS.mail, an: an, betreff: betreff, text: text }); via = 'Mailprogramm';
      alert('Dein Gerät kann keine Anhänge direkt übergeben. Die Dateien wurden heruntergeladen, bitte im Mailprogramm anhängen.');
    }
    p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: 'E-Mail vorbereitet (' + via + ') für ' + an + '\nBetreff: ' + betreff + '\nAnhänge: ' + names + (text ? '\n' + text : '') }]);
    persist(); closeModal('modal-mail'); if (curP === p) renderVerlauf();
  } catch (x) {
    if (!(x && x.name === 'AbortError')) alert('Die E-Mail wurde nicht vorbereitet. ' + (x && x.message ? x.message + ' ' : '') + 'Dein Text bleibt hier erhalten.');
  }
  btn.disabled = false;
}
function logMailSent(p, betreff, text) {
  p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: 'E-Mail gesendet an ' + (p.email || '') + '\nBetreff: ' + betreff + (text ? '\n' + text : '') }]);
  persist(); if (curP === p) renderVerlauf();
}
function logAdd(type, text) { curP.log = (curP.log || []).concat([{ ts: Date.now(), type: type, text: text }]); }

/* Unveränderliche Änderungshistorie der Patientenakte. Die normalen Daten bleiben editierbar; jede relevante Änderung erhält zusätzlich einen append-only Audit-Eintrag. */
var AUD_LABEL = { anrede:'Anrede', titel:'Titel', vorname:'Vorname', nachname:'Nachname', dob:'Geburtsdatum', phone:'Telefon', email:'E-Mail', adresse:'Anschrift', allergien:'Allergien', diagnosen:'Erkrankungen / Diagnosen', notizen:'Notiz' };
function auditNorm(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(auditNorm).join('\n');
  if (typeof v === 'object') { try { return JSON.stringify(v); } catch (x) { return String(v); } }
  return String(v);
}
function auditPush(p, area, changes) {
  if (!p) return;
  var c = (changes || []).map(function (x) { return { field: x.field || 'Wert', from: auditNorm(x.from), to: auditNorm(x.to) }; }).filter(function (x) { return x.from !== x.to; });
  if (!c.length) return;
  p.audit = (p.audit || []).concat([{ ts: Date.now(), area: area || 'Patientenakte', changes: c }]);
}
function auditOne(p, area, field, from, to) { auditPush(p, area, [{ field: field, from: from, to: to }]); }
function auditDiff(p, area, before, after, fields) {
  var c = [];
  (fields || []).forEach(function (f) { var k = Array.isArray(f) ? f[0] : f, lab = Array.isArray(f) ? f[1] : (AUD_LABEL[k] || k); c.push({ field: lab, from: before ? before[k] : '', to: after ? after[k] : '' }); });
  auditPush(p, area, c);
}
/* Dateivorgänge protokollieren nur Metadaten, keine Dateiinhalte. */
function auditFileState(r) {
  if (!r) return '[nicht vorhanden]';
  return ['ID: ' + r.id, 'Name: ' + (r.name || ''), 'Datum: ' + (r.ts ? fmtDT(r.ts) : ''),
    'Kategorie: ' + (r.kat || ''), 'Zuordnung: ' + (r.zu || 'frei'),
    'Unterschrift: ' + (r.sig && r.sig.ts ? fmtDT(r.sig.ts) : 'keine')].join('\n');
}
function auditFileChange(p, r, before, area) {
  auditOne(p, area || ((p.bilder || []).indexOf(r) >= 0 ? 'Bilder' : 'Dokumente'), 'Datei: ' + (r.name || r.id), before, auditFileState(r));
}
function auditFilesAdded(p, list, area) {
  auditPush(p, area, (list || []).map(function (r) { return { field: 'Hinzugefügt: ' + (r.name || r.id), from: '', to: auditFileState(r) }; }));
}

/* Ausblenden verändert nur die Ansicht; Einträge und Dateien bleiben erhalten. */
function recordVisible(r) { return !r.hiddenFromView || tlAuditVisible; }
function setRecordHidden(p, r, hide, area, label) {
  var wasHidden = !!r.hiddenFromView;
  if (wasHidden === hide) return;
  if (hide) r.hiddenFromView = true; else delete r.hiddenFromView;
  if (area !== 'Notiz') auditOne(p, area, 'Sichtbarkeit: ' + label, wasHidden ? 'ausgeblendet' : 'sichtbar', hide ? 'ausgeblendet' : 'sichtbar');
  persist();
  if (curP === p) renderVerlauf();
}
function fileHide(p, r) {
  setRecordHidden(p, r, !r.hiddenFromView, (p.bilder || []).indexOf(r) >= 0 ? 'Bilder' : 'Dokumente', r.name || r.id);
}
function restoreVisibilityButton(fn) {
  var b = mk('button', 'btn btn-secondary btn-sm', 'Wieder einblenden');
  b.type = 'button'; b.title = 'Dauerhaft in der normalen Ansicht einblenden';
  b.style.cssText = 'margin-left:8px;padding:3px 7px;font-size:11px;';
  b.onclick = function (ev) { ev.stopPropagation(); fn(); };
  return b;
}

function fileHiddenBadge(r) {
  var b = mk('span', '', 'Ausgeblendet'); b.style.cssText = 'font-size:11px;color:#64748b;margin-left:6px;'; return b;
}

function auditDocState(d) {
  d = d || {}; var v = d.verw || {}, verw = [];
  DK_VERW.forEach(function (x) { if (v[x[0]]) verw.push(x[1]); }); if (String(v.text || '').trim()) verw.push(String(v.text).trim());
  return { anamnese:d.anamnese || '', befund:d.befund || '', behandlung:d.behandlung || '', aufklaerung:d.aufklaerung || '', leist:d.leist || '', produkte:d.produkte || '', ausblick:d.ausblick || '', rechnung:d.rechnung || '', verw:verw.join('\n') };
}
function auditDocPlain(d, fallback) {
  var a = auditDocState(d), out = [];
  [['anamnese','Anamnese'],['befund','Befund'],['behandlung','Behandlung'],['aufklaerung','Aufklärung'],['leist','Leistungen'],['produkte','Produkte'],['ausblick','Ausblick'],['rechnung','Rechnungstext'],['verw','Verwaltung']].forEach(function (x) { if (String(a[x[0]] || '').trim()) out.push(x[1] + ': ' + a[x[0]]); });
  return out.join('\n') || String(fallback || '').trim();
}

/* Kopfbereich: Titel und Kacheln (Kontakt, Notiz, Medikation, Allergien, Diagnosen, Anschrift) */
var tileEdit = '', akTab = 'akte';
function tilePen(fn) { var b = mk('button', 'a-pen'); b.type = 'button'; b.innerHTML = ICON_PEN; b.title = 'Bearbeiten'; b.setAttribute('aria-label', 'Bearbeiten'); b.onclick = fn; return b; }
/* Medikament für die Anzeige kürzen: nur Name und Dosierung, ohne Packungsgröße und Anwendung (der volle Text bleibt gespeichert) */
function medSplit(m) {
  var t = String(m || '').replace(/\s+/g, ' ').trim(), w = t.split(' '), i = 0, UNIT = /^(mg|µg|mcg|g|ml|ie|i\.e\.|%)(\/(g|ml|l|h|tag|hub|dosis))?[,.;]?$/i;
  while (i < w.length && !/^\d/.test(w[i])) i++;
  if (i === 0 || i >= w.length) return { n: t.replace(/[,;]\s*$/, ''), d: '' };
  var name = w.slice(0, i).join(' ').replace(/[,;]\s*$/, ''), dose = '', x = w[i].replace(/[,;]$/, '');
  var mm = /^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(mg|µg|mcg|g|ml|ie|%)(\/(?:g|ml|l|h|tag|hub|dosis))?$/i.exec(x);
  if (mm) dose = x;
  else if (/^\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?$/.test(x)) {
    var um = /^(mg|µg|mcg|g|ml|ie|i\.e\.|%)(\/(?:g|ml|l|h|tag|hub|dosis))?(?:\/\S*)?[,.;]?$/i.exec(w[i + 1] || '');
    if (um) dose = x + ' ' + um[1] + (um[2] || '');
    else if (!/^(st|stk|stück|x|n\d|tabl|tbl|kaps|amp)/i.test(w[i + 1] || '')) dose = x;
  }
  return { n: name, d: dose };
}
function tileBox(key, title, cls, fill) {
  var t = mk('div', 'a-tile' + (cls ? ' ' + cls : '')); t.appendChild(mk('h4', '', title));
  if (tileEdit === key) { t.className += ' ed'; fill(t, true); } else { t.appendChild(tilePen(function () { stammEdit = false; tileEdit = key; renderHead(); var f = document.getElementById('a-tile-in') || document.getElementById('a-med-in'); if (f) f.focus(); })); fill(t, false); if (t.querySelector('.a-none') && !t.querySelector('li')) t.style.display = 'none'; }
  return t;
}
function txtTile(key, title, cls, ph) {
  return tileBox(key, title, cls, function (t, ed) {
    if (!ed) { var v = (curP[key] || '').trim(); if (key === 'notizen' && curP.titel) v = ('Titel: ' + curP.titel + (v ? '\n' + v : '')); t.appendChild(mk('div', v ? 'a-txt' : 'a-txt a-none', v || ph)); return; }
    if (key === 'adresse') t.appendChild(addrBlock('a-adr-', curP.adresse)); else { var ta = mk('textarea', 'form-control'); ta.id = 'a-tile-in'; ta.rows = 3; ta.value = curP[key] || ''; t.appendChild(ta); }
    var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';
    var c = mk('button', 'btn btn-cancel', 'Abbrechen'); c.type = 'button'; c.onclick = function () { tileEdit = ''; renderHead(); };
    var sv = mk('button', 'btn btn-save', 'Speichern'); sv.type = 'button'; sv.onclick = function () { tileSave(key); };
    fb.appendChild(c); fb.appendChild(sv); t.appendChild(fb);
  });
}
function tileSave(key) {
  var old = curP[key] || '', v = key === 'adresse' ? addrRead('a-adr-') : document.getElementById('a-tile-in').value.trim(), changed = v !== old;
  curP[key] = v;
  // Persönliche Notizen bleiben frei editierbar, ohne automatische Historien- oder Verlaufseinträge.
  if (changed && key !== 'notizen') auditOne(curP, 'Patientenakte', AUD_LABEL[key] || key, old, v);
  tileEdit = ''; persist(); renderHead(); renderVerlauf(); renderPatients();
}
function renderHead() {
  var p = curP, box = document.getElementById('a-head'), ttl = document.getElementById('a-title'); box.innerHTML = ''; ttl.innerHTML = '';
  var pidn = mk('span', 'a-pid', '#' + patNr(p)); pidn.title = 'Nummer ändern'; pidn.style.cursor = 'pointer'; pidn.onclick = function () { changePatNr(p); };
  var idc = mk('div', 'a-idc'); idc.appendChild(pidn);
  var sx = { Frau: ['♀', 'weiblich'], Herr: ['♂', 'männlich'], Divers: ['⚧', 'divers'] }[p.anrede]; if (sx) { var sp = mk('span', 'a-sex', sx[0]); sp.title = sx[1]; idc.appendChild(sp); }
  var nmb = mk('div', 'a-nm'), nl = mk('span', 'a-nl', (noTitel(p.nachname) || p.nachname || '').toUpperCase() + ','), nf = mk('span', 'a-nf', noTitel(p.vorname) || p.vorname || '');
  if (p.titel) nf.appendChild(mk('small', 'a-tit', p.titel));
  nmb.appendChild(nl); nmb.appendChild(document.createTextNode(' ')); nmb.appendChild(nf);
  ttl.appendChild(idc); ttl.appendChild(nmb);
  renderFlags();
  document.getElementById('a-edit').style.display = stammEdit ? 'none' : 'inline-flex';
  document.querySelector('.a-fab').style.visibility = stammEdit ? 'hidden' : '';
  if (stammEdit) {
    var grid = document.createElement('div'); grid.className = 'grid-2';
    HEAD_FIELDS.forEach(function (k) {
      var g = mk('div', 'form-group'); g.appendChild(mk('label', '', k[1]));
      var inp;
      if (k[0] === 'adresse') { g.appendChild(addrBlock('se-adr-', p.adresse)); g.style.gridColumn = '1 / -1'; grid.appendChild(g); return; }
      if (k[0] === 'anrede') {
        inp = mk('select', 'form-control');
        ['', 'Frau', 'Herr', 'Divers'].forEach(function (o) { var op = mk('option', '', o || 'Keine Angabe'); op.value = o; inp.appendChild(op); });
      } else if (k[0] === 'diagnosen') { inp = mk('textarea', 'form-control'); inp.rows = 2; g.style.gridColumn = '1 / -1'; } else inp = mk('input', 'form-control');
      inp.id = 'se-' + k[0]; inp.value = p[k[0]] || '';
      if (k[0] === 'dob') { inp.placeholder = 'TT.MM.JJJJ'; inp.inputMode = 'numeric'; inp.maxLength = 10; inp.oninput = function () { maskDob(inp); }; }
      g.appendChild(inp); grid.appendChild(g);
    });
    box.appendChild(grid);
    var fb = mk('div', 'foot-bar');
    var cb = mk('button', 'btn btn-cancel', 'Abbrechen'); cb.type = 'button'; cb.onclick = function () { cancelStamm(); };
    var sbn = mk('button', 'btn btn-save', 'Speichern'); sbn.type = 'button'; sbn.onclick = function () { toggleStamm(); };
    var db = mk('button', 'btn btn-del btn-ico'); db.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'; db.title = 'Patient löschen'; db.setAttribute('aria-label', 'Patient löschen'); db.type = 'button'; db.onclick = function () { deletePatient(); };
    var mgb = mk('button', 'btn btn-secondary btn-ico'); mgb.type = 'button'; mgb.title = 'Mit einer anderen Akte zusammenlegen'; mgb.setAttribute('aria-label', mgb.title); mgb.innerHTML = tvSvg('merge'); mgb.firstChild.style.cssText = 'width:18px;height:18px;'; mgb.onclick = function () { mgOpen(curP); };
    fb.appendChild(db); fb.appendChild(mgb); fb.appendChild(cb); fb.appendChild(sbn); box.appendChild(fb);
    return;
  }
  var tiles = mk('div', 'a-tiles'), age = ageOf(p.dob);
  var kt = mk('div', 'a-tile a-kt'); kt.appendChild(mk('h4', '', 'Kontakt')); kt.appendChild(tilePen(function () { toggleStamm(); }));
  kt.appendChild(mk('div', p.dob ? '' : 'a-none', p.dob ? p.dob + (age !== '' ? ' (' + age + ' Jahre)' : '') : 'Geburtsdatum fehlt'));
  if (p.phone) { var l1 = mk('div', 'tl-ln'); l1.innerHTML = ICON_PHONE; var a1 = mk('a', '', p.phone); a1.href = 'tel:' + p.phone.replace(/\s/g, ''); l1.appendChild(a1); kt.appendChild(l1); }
  if (p.email) { var l2 = mk('div', 'tl-ln'); l2.innerHTML = ICON_MAIL; var a2 = mk('a', '', p.email); a2.href = 'mailto:' + p.email; l2.appendChild(a2); kt.appendChild(l2); }
  tiles.appendChild(kt);
  tiles.appendChild(txtTile('notizen', 'Notiz', '', 'Keine Notiz'));
  tiles.appendChild(tileBox('med', 'Medikation', 'a-wide', function (t, ed) {
    var list = p.medikation || [];
    if (!list.length && !ed) t.appendChild(mk('div', 'a-txt a-none', 'Keine Medikation'));
    var ul = mk('ul'); list.forEach(function (m, i) {
      var li = mk('li'), md = medSplit(m), tx = mk('span', 'med-t'); tx.title = ed ? 'Tippen zum Bearbeiten' : m;
      tx.appendChild(mk('b', 'med-n', md.n)); if (md.d) tx.appendChild(mk('span', 'med-d', ' ' + md.d));
      if (ed) { tx.style.cursor = 'pointer'; tx.onclick = async function () { var v = await kaPrompt('Medikament bearbeiten:', m); if (v === null) return; v = v.trim(); if (v && v !== m) { p.medikation[i] = v; auditOne(p, 'Medikation', 'Medikament', m, v); persist(); renderHead(); renderVerlauf(); } }; }
      li.appendChild(tx);
      if (ed) { var b = mk('button', '', '×'); b.type = 'button'; b.onclick = function () { var old = p.medikation[i]; p.medikation.splice(i, 1); auditOne(p, 'Medikation', 'Medikament', old, '[entfernt]'); persist(); renderHead(); renderVerlauf(); }; li.appendChild(b); }
      ul.appendChild(li);
    }); t.appendChild(ul);
    if (ed) {
      var row = mk('div'); row.style.cssText = 'display:flex; gap:6px; margin-top:6px;';
      var inp = mk('input', 'form-control'); inp.id = 'a-med-in'; inp.placeholder = 'Medikament hinzufügen...'; inp.onkeydown = function (e) { if (e.key === 'Enter') addMed(); };
      var ad = mk('button', 'btn', '+'); ad.type = 'button'; ad.onclick = addMed; row.appendChild(inp); row.appendChild(ad); t.appendChild(row);
      var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';
      var ok = mk('button', 'btn btn-save', 'Fertig'); ok.type = 'button'; ok.onclick = function () { tileEdit = ''; renderHead(); }; fb.appendChild(ok); t.appendChild(fb);
    }
  }));
  var tAl = txtTile('allergien', 'Allergien', (hasWarn(p) ? 'a-warn ' : '') + 'a-half', 'Keine Angabe'), tAd = txtTile('adresse', 'Anschrift', 'a-half', 'Keine Anschrift');
  tiles.appendChild(tAl); tiles.appendChild(tAd);
  if ([tAl, tAd].filter(function (x) { return x.style.display !== 'none'; }).length === 1) { tAl.classList.remove('a-half'); tAd.classList.remove('a-half'); }
  tiles.appendChild(txtTile('diagnosen', 'Erkrankungen / Diagnosen', '', 'Keine Angabe'));
  tiles.setAttribute('data-n', [].filter.call(tiles.children, function (c) { return c.style.display !== 'none'; }).length);
  box.appendChild(tiles);
}
function hdH() { var h = document.querySelector('header'); if (h) document.documentElement.style.setProperty('--hdh', h.offsetHeight + 'px'); }
window.addEventListener('resize', hdH);
try { new ResizeObserver(hdH).observe(document.querySelector('header')); } catch (x) {}
hdH();
function setAkTab(t) {
  akTab = t; saveLast();
  ['akte', 'anl', 'fin'].forEach(function (k) { var el = document.getElementById('at-' + k), b = document.getElementById('atb-' + k); if (el) el.style.display = k === t ? 'block' : 'none'; if (b) b.className = k === t ? 'on' : ''; });
  akTabs();
}
function akTabs() {
  var b = document.getElementById('atb-anl'); if (!b || !curP) return;
  var n = (curP.bilder || []).length + (curP.dokumente || []).length;
  b.textContent = 'Anlagen' + (n ? ' (' + n + ')' : '');
}
function toggleStamm() {
  if (!stammEdit) { stammEdit = true; tileEdit = ''; renderHead(); return; }
  var g = function (k) { return document.getElementById('se-' + k).value.trim(); };
  if (!g('vorname') || !g('nachname')) { alert('Vorname und Nachname dürfen nicht leer sein.'); return; }
  if (!validDob(g('dob'))) { alert(DOB_MSG); return; }
  var old = nameKey(curP), before = {};
  HEAD_FIELDS.forEach(function (k) { before[k[0]] = curP[k[0]] || ''; });
  if (patients.some(function (x) { return x !== curP && nameKey(x).toLowerCase() === (g('vorname') + ' ' + g('nachname')).toLowerCase(); })) { alert('Einen Patienten mit diesem Namen gibt es schon.'); return; }
  HEAD_FIELDS.forEach(function (k) { if (k[0] !== 'adresse') curP[k[0]] = g(k[0]); });
  curP.adresse = addrRead('se-adr-');
  var after = {}; HEAD_FIELDS.forEach(function (k) { after[k[0]] = curP[k[0]] || ''; });
  auditDiff(curP, 'Stammdaten', before, after, HEAD_FIELDS);
  var nn = nameKey(curP);
  if (nn !== old) events.forEach(function (e) { if (String(e.patientId) === String(curP.id) || e.patient === old) { e.patientId = curP.id; e.patient = nn; } });
  persist(); renderPatients(); renderCal(); viewAkte(curP);
}
/* Aufbewahrungspflicht: Akten mit medizinischer Dokumentation 10 Jahre nach der letzten Behandlung (§ 630f Abs. 3 BGB) */
function patAufbewahrung(p) {
  var was = [], last = 0, now = Date.now(), tsOfD = function (x) { return x.ts || tsOf(x) || 0; };
  if ((p.doku || []).length) { was.push('Dokumentation'); p.doku.forEach(function (d) { last = Math.max(last, tsOfD(d)); }); }
  if ((p.dokumente || []).length) { was.push('Dokumente'); p.dokumente.forEach(function (d) { last = Math.max(last, tsOfD(d)); }); }
  if ((p.bilder || []).length) { was.push('Bilder'); p.bilder.forEach(function (d) { last = Math.max(last, tsOfD(d)); }); }
  if ((p.medikation || []).length || String(p.allergien || '').trim() || String(p.diagnosen || '').trim()) { was.push('Anamnese'); last = Math.max(last, p.erstellt || 0); }
  var ev = events.filter(function (e) { if (!eventBelongs(e, p) || e.phase === 'Abgesagt') return false; var t = new Date(e.date + 'T' + (e.time || '00:00') + ':00').getTime(); return t && t <= now; });
  if (ev.length) { was.push('Behandlungstermine'); ev.forEach(function (e) { last = Math.max(last, new Date(e.date + 'T12:00:00').getTime()); }); }
  if (!was.length) return { was: was, bis: 0 };
  if (!last) last = now;
  var d = new Date(last); d.setFullYear(d.getFullYear() + 10);
  return { was: was, bis: d.getTime() };
}
async function deletePatient() {
  var p = curP;
  if (invoices.some(function (i) { return i.pid === p.id; })) { alert('Zu diesem Patienten gibt es Rechnungen. Diese müssen aufbewahrt werden, deshalb kann er nicht gelöscht werden.'); return; }
  if (lager.verbrauch.some(function (v) { return v.pid === p.id; })) { alert('Zu diesem Patienten gibt es Produktbuchungen aus dem Lager. Deshalb kann er nicht gelöscht werden.'); return; }
  var aufb = patAufbewahrung(p);
  if (aufb.bis && aufb.bis > Date.now()) { alert('Diese Akte enthält medizinische Dokumentation (' + aufb.was.join(', ') + '). Sie muss bis ' + new Date(aufb.bis).toLocaleDateString('de-DE') + ' aufbewahrt werden (10 Jahre nach der letzten Behandlung, § 630f BGB) und kann bis dahin nicht gelöscht werden.'); return; }
  var name = nameKey(p), n = events.filter(function (e) { return eventBelongs(e, p); }).length;
  if (!await kaConfirm('Patient "' + name + '" mit Akte und ' + n + ' Termin(en) endgültig löschen? Das lässt sich nur mit einer Sicherung rückgängig machen.')) return;
  (p.bilder || []).concat(p.dokumente || []).forEach(function (x) { fDel(x.id); });
  patients = patients.filter(function (x) { return x !== p; });
  events = events.filter(function (e) { return !eventBelongs(e, p); });
  stammEdit = false; curP = null;
  persist(); renderPatients(); renderCal(); closeModal('modal-akte');
}
function cancelStamm() { stammEdit = false; renderHead(); }
function viewAkte(p) {
  var was = document.getElementById('modal-akte').classList.contains('active');
  curP = p; stammEdit = false; editingDokuId = null; medInput = false; medMode = false; notizEdit = false; dokPick = false;
  document.getElementById('a-menu').style.display = 'none';
  tileEdit = ''; recentAdd(p.id); hdH(); renderHead(); renderPick(); renderVerlauf(); setAkTab('akte');
  openModal('modal-akte');
  if (!was) window.scrollTo(0, 0);
  saveLast();
}

/* Rezept: Medikamente wählen, A6 quer (148 x 105 mm) als PDF für den Vordruck */
/* Datum und Uhrzeit eines Eintrags ändern */
var dtCb = null;
function askDateTime(ts, cb) {
  var d = new Date(ts); dtCb = cb;
  document.getElementById('dt-in').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  openModal('modal-dt');
}
function dtSave() {
  var t = new Date(document.getElementById('dt-in').value).getTime(); if (isNaN(t)) { alert('Bitte Datum und Uhrzeit angeben.'); return; }
  var cb = dtCb; dtCb = null; closeModal('modal-dt'); if (cb) cb(t);
}
/* Produktbuchung vollständig bearbeiten: Zeitpunkt, Charge, Menge, Termin; der Lagerbestand wird mit korrigiert */
var vbeCur = null;
function openVbEdit(vb) {
  vbeCur = vb; var d = new Date(vb.ts);
  document.getElementById('vbe-info').textContent = vb.name + (vb.pid ? '' : ' · Ausbuchung' + (vb.grund ? ' (' + vb.grund + ')' : ''));
  document.getElementById('vbe-datum').value = iso(d); document.getElementById('vbe-zeit').value = pad(d.getHours()) + ':' + pad(d.getMinutes());
  var sel = document.getElementById('vbe-ch'); sel.innerHTML = '';
  lager.chargen.filter(function (c) { return c.pid === vb.prodId; }).forEach(function (c) { var o = mk('option', '', 'Charge ' + (c.nr || '-') + (c.verfall ? ' · bis ' + fmtD(c.verfall) : '') + ' · Rest ' + qty(c.id === vb.chId ? (+c.rest || 0) + vb.menge : c.rest)); o.value = c.id; sel.appendChild(o); });
  sel.value = vb.chId; document.getElementById('vbe-menge').value = qty(vb.menge);
  var tg = document.getElementById('vbe-tgrp'), ts = document.getElementById('vbe-termin'); ts.innerHTML = '';
  tg.style.display = vb.pid ? '' : 'none';
  if (vb.pid) {
    var pt = patients.filter(function (x) { return x.id === vb.pid; })[0], o0 = mk('option', '', 'Kein Termin'); o0.value = ''; ts.appendChild(o0);
    events.filter(function (e) { return pt && eventBelongs(e, pt); }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }).forEach(function (e) { var o = mk('option', '', fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '')); o.value = e.id; ts.appendChild(o); });
    ts.value = vb.eid ? String(vb.eid) : '';
  }
  openModal('modal-vbe');
}
function saveVbEdit() {
  var vb = vbeCur; if (!vb) return;
  var m = num(document.getElementById('vbe-menge').value), nc = lager.chargen.filter(function (c) { return c.id === document.getElementById('vbe-ch').value; })[0], oc = lager.chargen.filter(function (c) { return c.id === vb.chId; })[0];
  var dd = document.getElementById('vbe-datum').value, tt = document.getElementById('vbe-zeit').value || '12:00';
  if (!dd) { alert('Bitte ein Datum angeben.'); return; } if (m === null || m <= 0) { alert('Bitte eine Menge größer als 0 eingeben.'); return; } if (!nc) { alert('Bitte eine Charge wählen.'); return; }
  var avail = (+nc.rest || 0) + (nc === oc ? vb.menge : 0); if (m > avail + 1e-9) { alert('Von dieser Charge sind nur noch ' + qty(avail) + ' ' + (vb.einheit || '') + ' da.'); return; }
  var rd = function (x) { return Math.round(x * 1000) / 1000; };
  if (oc) oc.rest = rd((+oc.rest || 0) + vb.menge); nc.rest = rd((+nc.rest || 0) - m);
  vb.chId = nc.id; vb.nr = nc.nr || ''; vb.verfall = nc.verfall || ''; vb.ek = nc.ek; vb.menge = m; vb.ts = new Date(dd + 'T' + tt + ':00').getTime();
  if (vb.pid) { var ev = document.getElementById('vbe-termin').value; vb.eid = ev ? +ev : null; }
  vbeCur = null; persist(); closeModal('modal-vbe'); if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf(); renderLager();
}
