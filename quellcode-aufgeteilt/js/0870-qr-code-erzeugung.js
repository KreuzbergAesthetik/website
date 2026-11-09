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
    var ls = pdfWrap(it.text, false, 9.5, 212), ns = (it.note ? pdfWrap(it.note, false, 8.5, 212) : []).concat(it.goae ? pdfWrap(goaeLine(it.goae, it.text), false, 8.5, 212) : []), h = Math.max(25, ls.length * 12 + ns.length * 11 + 12);
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
  if (goaeNote(inv)) { y += 8; need(20); para(goaeNote(inv), 9); }
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

