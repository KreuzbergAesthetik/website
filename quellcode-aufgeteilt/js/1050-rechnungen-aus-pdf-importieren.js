/* ===== Rechnungen aus PDF importieren (Rechnungsnummer, Datum, Anschrift, Positionen, Zahlungsstatus) ===== */
var riList = [];
function riNum(t) { var m = /(-)?\s*(\d{1,3}(?:\.\d{3})*|\d+),(\d{2})/.exec(String(t || '').replace(/−/g, '-')); if (!m) return null; var v = parseFloat(m[2].replace(/\./g, '') + '.' + m[3]); return (m[1] || /-\s*€|€\s*-/.test(t)) ? -v : v; }
/* Zeilen aus pdf.js-Textstücken bilden (nach y gruppieren, nach x sortieren) */
function riLines(items) {
  var rows = {}; items.forEach(function (i) { if (!String(i.str).trim()) return; var k = Math.round(i.y / 2.5); (rows[k] = rows[k] || []).push(i); });
  return Object.keys(rows).map(Number).sort(function (a, b) { return b - a; }).map(function (k) { var t = rows[k].sort(function (a, b) { return a.x - b.x; }); return { y: rows[k][0].y, t: t, s: t.map(function (x) { return x.str; }).join(' ').replace(/\s+/g, ' ').trim() }; });
}
var RI_MON = { januar: 1, februar: 2, 'märz': 3, maerz: 3, april: 4, mai: 5, juni: 6, juli: 7, august: 8, september: 9, oktober: 10, november: 11, dezember: 12 };
function riDate(t) {
  var m = /(\d{1,2})\.\s*([A-Za-zäöüÄÖÜ]+)\s+(\d{4})/.exec(t || '');
  if (m) { var mo = RI_MON[m[2].toLowerCase()]; return mo ? m[3] + '-' + pad(mo) + '-' + pad(+m[1]) : null; }
  m = /(\d{2})\.(\d{2})\.(\d{4})/.exec(t || ''); return m ? m[3] + '-' + m[2] + '-' + m[1] : null;
}
/* Zahlungsblock: Nummer (Art), Datum, Betrag für diese Rechnung, Stornovermerke */
function riPays(lines, invNr) {
  var pays = [], cur = null, re = new RegExp('€\\s*(-?[\\d.]*\\d,\\d{2})\\s+für\\s+' + invNr.replace(/[^0-9A-Za-z-]/g, ''));
  lines.forEach(function (l) {
    if (/^(Vielen Dank|Seite \d)/.test(l.s)) { cur = null; return; }
    var ls = l.t.filter(function (x) { return x.x < 225; }).map(function (x) { return x.str; }).join(' ').replace(/\s+/g, ' ').trim(), rs = l.t.filter(function (x) { return x.x >= 225; }).map(function (x) { return x.str; }).join(' ').replace(/\s+/g, ' ').trim();
    var m = /^([A-Z]\d{4}-\d+)\s*\(([^)]+)\)/.exec(ls);
    if (m) { cur = { nr: m[1], art: m[2], date: null, alloc: null, storno: null }; pays.push(cur); }
    if (!cur) return;
    var dm = /am\s+(\d{2})\.(\d{2})\.(\d{4})/.exec(ls); if (dm) cur.date = dm[3] + '-' + dm[2] + '-' + dm[1];
    var am = re.exec(rs); if (am) cur.alloc = riNum(am[1]);
    var sm = /Storniert\s+([A-Z]\d{4}-\d+)/.exec(rs); if (sm) cur.storno = sm[1];
  });
  return pays;
}
function riPaysDone(raw) {
  var dead = {}; raw.forEach(function (p) { if (p.storno) { dead[p.nr] = 1; dead[p.storno] = 1; } });
  return raw.filter(function (p) { return !dead[p.nr] && p.alloc != null && Math.abs(p.alloc) > 0.004; }).map(function (p) { return { nr: p.nr, art: p.art, amount: p.alloc, date: p.date }; });
}
/* Rechnungen aus dem Programm mit Spalten Position, MwSt-Satz, Brutto (ohne Menge) */
function riParseNeu(lines, r) {
  var hi = -1; lines.forEach(function (l, i) { if (hi < 0 && /\bPosition\b/.test(l.s) && /MwSt/.test(l.s) && /Brutto/.test(l.s)) hi = i; });
  if (hi < 0) throw new Error('Keine Positionstabelle gefunden');
  var hx = function (w) { var t = lines[hi].t.filter(function (x) { return x.str.indexOf(w) === 0; })[0]; return t ? t.x : null; };
  var xP = hx('Position'), xS = hx('MwSt'), xB = hx('Brutto');
  if (xP == null || xS == null || xB == null) throw new Error('Tabellenspalten nicht erkannt');
  var endIdx = lines.length; lines.forEach(function (l, i) { if (i > hi && endIdx === lines.length && /^Gesamt\s+Netto/i.test(l.s)) endIdx = i; });
  /* Textstücke der Positionstabelle einsammeln: Beträge sind die Ankerpunkte, Menge/Satz/Datum gehören zum nächsten Betrag */
  var amts = [], qtys = [], rates = [], dats = [], txts = [];
  for (var i = hi + 1; i < endIdx; i++) lines[i].t.forEach(function (x) {
    var t = x.str.trim();
    if (x.x >= xB - 40 && /^€\s*-?[\d.]*\d,\d{2}$/.test(t)) amts.push({ y: x.y, v: riNum(t) });
    else if (x.x >= xS - 12 && x.x < xB - 40 && /^\d+\s*%$/.test(t)) rates.push({ y: x.y, v: parseInt(t, 10) });
    else if (x.x < xP - 4 && /^\d{2}\.\d{2}\.\d{4}$/.test(t)) dats.push({ y: x.y, v: t });
    else if (x.x < xP - 4 && /^\d+(?:[.,]\d+)?$/.test(t)) qtys.push({ y: x.y, v: parseFloat(t.replace(',', '.')) });
    else if (x.x >= xP - 4 && x.x < xS - 12 && !/^€\s*-?\d{1,3}(?:\.\d{3})*,\d{2}$/.test(t)) txts.push({ y: x.y, x: x.x, v: t });
  });
  if (!amts.length) throw new Error('Keine Positionen gefunden');
  amts.sort(function (p, q) { return q.y - p.y; });
  var near = function (arr, y, tol) { var best = null, bd = 1e9; arr.forEach(function (o) { var d = Math.abs(o.y - y); if (!o.used && d < bd && d <= tol) { bd = d; best = o; } }); if (best) best.used = true; return best; };
  var groups = amts.map(function (a) { return { a: a, qty: near(qtys, a.y, 9), rate: near(rates, a.y, 9), dat: near(dats, a.y, 9), ls: [] }; });
  txts.forEach(function (t) { var best = 0, bd = 1e9; groups.forEach(function (g, k) { var d = Math.abs(g.a.y - t.y); if (d < bd) { bd = d; best = k; } }); groups[best].ls.push(t); });
  r.items = groups.map(function (g) {
    var a = g.a, ys = {}, parts = [];
    g.ls.sort(function (p, q) { return q.y - p.y || p.x - q.x; }).forEach(function (t) { var k = Math.round(t.y / 2.5); if (ys[k] == null) { ys[k] = parts.length; parts.push(t.v); } else parts[ys[k]] += ' ' + t.v; });
    var text = parts.join(' – ').replace(/\s*–?\s*\(\d+(?:[.,]\d+)?x\s*€[^)]*\)/, ''), rate = g.rate ? g.rate.v : 19;
    if (!g.qty) { var pm = /-\s*(\d+(?:[.,]\d+)?)\s*%/.exec(text); return { rabatt: true, pct: pm ? parseFloat(pm[1].replace(',', '.')) : 0, text: text, qty: 1, price: a.v, amount: a.v, rate: rate, datum: '' }; }
    var q = g.qty.v > 0 ? g.qty.v : 1; return { text: text, qty: q, price: r2(a.v / q), amount: a.v, rate: rate, datum: g.dat ? g.dat.v : '' };
  });
  var tot = null; lines.forEach(function (l, i) { if (i >= endIdx && /^Gesamt(\s|$)/i.test(l.s) && !/Netto/i.test(l.s)) { var v = riNum(l.s.replace(/^Gesamt/i, '')); if (v != null) tot = v; } });
  r.total = tot != null ? tot : r2(r.items.reduce(function (x, i) { return x + (i.amount || 0); }, 0));
  r.leistung = (r.items.filter(function (x) { return x.datum; })[0] || {}).datum; r.leistung = r.leistung ? r.leistung.split('.').reverse().join('-') : r.date;
  /* Empfänger: links über der Überschrift RECHNUNG */
  var hd = -1; lines.forEach(function (l, i) { if (hd < 0 && /^(STORNO)?RECHNUNG$/.test(l.s)) hd = i; });
  var rec = [];
  lines.forEach(function (l, i) {
    if (hd >= 0 && i >= hd) return; if (l.t[0].x > 150) return;
    var left = l.t.filter(function (x) { return x.x < 300; }).map(function (x) { return x.str; }).join(' ').replace(/\s+/g, ' ').trim();
    if (!left || /·/.test(left) || /Kreuzberg/i.test(left) || /^Deutschland$/i.test(left)) return; rec.push(left);
  });
  var first = rec.length ? /^(Herr|Frau|Divers)\s+(.+)$/.exec(rec[0]) : null; if (first) { r.anrede = first[1]; rec[0] = first[2]; }
  r.name = rec.shift() || ''; r.adresse = rec.join('\n');
  r.paysRaw = riPays(lines, r.nr);
}
function parseRechnung(items) {
  /* Zeilen bilden (nach y gruppieren, nach x sortieren) */
  var rows = {}; items.forEach(function (i) { if (!String(i.str).trim()) return; var k = Math.round(i.y / 2.5); (rows[k] = rows[k] || []).push(i); });
  var lines = Object.keys(rows).map(Number).sort(function (a, b) { return b - a; }).map(function (k) { var t = rows[k].sort(function (a, b) { return a.x - b.x; }); return { y: rows[k][0].y, t: t, s: t.map(function (x) { return x.str; }).join(' ').replace(/\s+/g, ' ').trim() }; });
  var all = lines.map(function (l) { return l.s; }).join('\n'), r = { items: [], adresse: '', anrede: '' }, m;
  if (!(m = /Rechnungsnummer:?\s*([A-Za-z0-9][A-Za-z0-9\-\/]*)/.exec(all))) throw new Error('Keine Rechnungsnummer gefunden');
  r.nr = m[1];
  if (!(m = /Rechnungsdatum:?\s*([^\n]+)/.exec(all)) || !riDate(m[1])) throw new Error('Kein Rechnungsdatum gefunden');
  r.date = riDate(m[1]);
  m = /Zahlungsstatus:?\s*([A-Za-zäöüÄÖÜ]+)(?:\s+am\s+([^\n]+))?/.exec(all); r.status = m ? m[1] : ''; r.paidDate = m && m[2] ? riDate(m[2]) : null;
  r.storno = /^Storniert/i.test(r.status); r.stornoRef = (m = /Storniert\s+(?:durch|Rechnung):?\s*(\d{4}-\d+)/.exec(all)) ? m[1] : '';
  /* Spalten aus der Kopfzeile der Tabelle */
  var hi = -1; lines.forEach(function (l, i) { if (hi < 0 && /\bDatum\b/.test(l.s) && /\bMenge\b/.test(l.s) && /\bPosition\b/.test(l.s)) hi = i; });
  if (hi < 0) { riParseNeu(lines, r); return r; }
  var hx = function (w) { var t = lines[hi].t.filter(function (x) { return x.str.indexOf(w) === 0; })[0]; return t ? t.x : null; };
  var xM = hx('Menge'), xP = hx('Position'), xS = hx('MwSt'), xB = hx('Brutto');
  if (xM == null || xP == null || xS == null || xB == null) throw new Error('Tabellenspalten nicht erkannt');
  var col = function (x) { return x < xM - 4 ? 0 : x < xP - 4 ? 1 : x < xS - 8 ? 2 : x < xB - 18 ? 3 : 4; };
  var endIdx = lines.length; lines.forEach(function (l, i) { if (i > hi && endIdx === lines.length && /^Gesamt\s+Netto/i.test(l.s)) endIdx = i; });
  var cur = null;
  for (var i = hi + 1; i < endIdx; i++) {
    var c = ['', '', '', '', '']; lines[i].t.forEach(function (x) { var k = col(x.x); c[k] += (c[k] ? ' ' : '') + x.str; });
    var hasDate = /\d{2}\.\d{2}\.\d{4}/.test(c[0]), amt = riNum(c[4]);
    if (hasDate || (amt != null && c[2])) {
      cur = { datum: hasDate ? c[0].trim() : '', qty: /\d/.test(c[1]) ? parseFloat(c[1].replace(',', '.')) : 1, text: c[2].trim(), rate: parseInt(c[3], 10), amount: amt };
      r.items.push(cur);
    } else if (cur && c[2]) cur.text += ' ' + c[2].trim();
  }
  if (!r.items.length) throw new Error('Keine Positionen gefunden');
  var tot = null; lines.forEach(function (l, i) { if (i >= endIdx && /^Gesamt(\s|$)/i.test(l.s) && !/Netto/i.test(l.s)) { var a = riNum(l.s.replace(/^Gesamt/i, '')); if (a != null) tot = a; } });
  r.total = tot != null ? tot : r2(r.items.reduce(function (a, i) { return a + (i.amount || 0); }, 0));
  r.items = r.items.map(function (it) {
    var neg = it.amount < 0 || /^Rabatt/i.test(it.text), pm = /-\s*(\d+(?:[.,]\d+)?)\s*%/.exec(it.text);
    if (neg) return { rabatt: true, pct: pm ? parseFloat(pm[1].replace(',', '.')) : 0, text: it.text, qty: 1, price: it.amount, amount: it.amount, rate: it.rate || 19, datum: it.datum };
    var q = it.qty > 0 ? it.qty : 1; return { text: it.text, qty: q, price: r2(it.amount / q), amount: it.amount, rate: it.rate || 19, datum: it.datum };
  });
  r.leistung = (r.items.filter(function (x) { return x.datum; })[0] || {}).datum; r.leistung = r.leistung ? r.leistung.split('.').reverse().join('-') : r.date;
  /* Empfängerblock: links, unter der Praxisangabe, über der Tabelle */
  var xR = (lines.map(function (l) { return l.t.filter(function (x) { return /^RECHNUNG$/.test(x.str); })[0]; }).filter(Boolean)[0] || {}).x || 340;
  var yUid = null; lines.forEach(function (l) { if (/UID|USt-?Id/i.test(l.s)) yUid = yUid == null ? l.y : Math.min(yUid, l.y); }); if (yUid == null) lines.forEach(function (l) { if (/Tel\./.test(l.s)) yUid = yUid == null ? l.y : Math.min(yUid, l.y); });
  var rec = [];
  lines.forEach(function (l, i) {
    if (i >= hi) return; if (yUid != null && l.y >= yUid - 1) return;
    if (l.t[0].x > 150) return;
    var left = l.t.filter(function (x) { return x.x < xR - 20; }).map(function (x) { return x.str; }).join(' ').trim();
    if (left && !/Rechnungsnummer|Rechnungsdatum|Zahlungsstatus|^RECHNUNG$/.test(left)) rec.push(left);
  });
  if (rec.length && /^(Herr|Frau|Divers|Familie|Firma)$/i.test(rec[0])) r.anrede = rec.shift();
  r.name = rec.shift() || ''; r.adresse = rec.join('\n');
  return r;
}
function riFind(name) {
  var n = nameNorm(name);
  var strip = function (p) { return nameNorm(nameKey(p)); };
  return patients.filter(function (p) { return strip(p) === n; })[0] || patients.filter(function (p) { var a = strip(p); return n && (a.indexOf(n) >= 0 || n.indexOf(a) >= 0); })[0] || null;
}
async function rechnungenImport(inp) {
  var sel = [].slice.call(inp.files || []).filter(function (f) { return /\.(pdf|zip)$/i.test(f.name); }); inp.value = '';
  var fl = [];
  for (var z = 0; z < sel.length; z++) {
    if (!/\.zip$/i.test(sel[z].name)) { fl.push(sel[z]); continue; }
    try {
      var zm = await readZipBlob(sel[z]);
      Object.keys(zm).sort().forEach(function (k) { var bn = k.split('/').pop(); if (/\.pdf$/i.test(bn) && !/^(\._|__MACOSX)/.test(k) && !/^\._/.test(bn)) fl.push(new File([zm[k]], bn, { type: 'application/pdf' })); });
    } catch (x) { alert('Die ZIP-Datei ' + sel[z].name + ' konnte nicht gelesen werden.'); }
  }
  if (!fl.length) { alert('Bitte die Rechnungen als PDF oder als ZIP mit PDFs auswählen.'); return; }
  riList = [];
  var errs = [];
  for (var i = 0; i < fl.length; i++) {
    try {
      var pages = await pdfPages(fl[i]), inv = parseRechnung(pages[0] || []);
      if (inv.paysRaw) { for (var pg = 1; pg < pages.length; pg++) inv.paysRaw = inv.paysRaw.concat(riPays(riLines(pages[pg]), inv.nr)); inv.pays = riPaysDone(inv.paysRaw); inv.paySum = r2(inv.pays.reduce(function (a, x) { return a + x.amount; }, 0)); }
      inv.file = fl[i]; inv.pat = riFind(inv.name);
      inv.dup = invoices.some(function (x) { return x.nr === inv.nr; });
      inv.sum = r2(inv.items.reduce(function (a, x) { return a + x.amount; }, 0)); inv.warn = Math.abs(inv.sum - inv.total) > 0.015;
      inv.on = !inv.dup && !inv.warn; riList.push(inv);
    } catch (x) { errs.push(fl[i].name + ': ' + (x && x.message ? x.message : 'nicht lesbar')); }
  }
  if (!riList.length) { alert('Es konnte keine Rechnung gelesen werden.\n' + errs.join('\n')); return; }
  riRender(errs); openModal('modal-rimp');
}
function riRender(errs) {
  var tb = document.getElementById('ri-table'); tb.innerHTML = '';
  riList.sort(function (a, b) { return a.nr.localeCompare(b.nr); }).forEach(function (r) {
    var row = tb.insertRow(), c = [0, 1, 2, 3, 4, 5, 6].map(function () { return row.insertCell(); });
    var cb = mk('input'); cb.type = 'checkbox'; cb.checked = r.on; cb.onchange = function () { r.on = cb.checked; riCount(); }; c[0].appendChild(cb);
    c[1].textContent = r.nr; c[2].textContent = fmtD(r.date); c[3].textContent = (r.anrede ? r.anrede + ' ' : '') + r.name; c[4].textContent = eur(r.total); c[5].textContent = r.status || '-';
    var h = r.dup ? 'Nummer gibt es schon' : r.warn ? 'Summe der Positionen (' + eur(r.sum) + ') weicht ab' : (r.pays && !r.storno && /^bezahlt/i.test(r.status) && Math.abs((r.paySum || 0) - r.total) > 0.015) ? 'Zahlungen (' + eur(r.paySum || 0) + ') weichen vom Gesamtbetrag ab' : r.pat ? 'Patient gefunden' : 'Patient wird angelegt';
    c[6].textContent = h; c[6].style.color = r.dup || r.warn || /weichen vom/.test(h) ? '#b91c1c' : r.pat ? '#16a34a' : '#b45309';
  });
  document.getElementById('ri-info').textContent = riList.length + ' Rechnung(en) gelesen.' + (errs && errs.length ? ' Nicht lesbar: ' + errs.join('; ') : '') + ' Rechnungen mit rotem Hinweis sind abgewählt.';
  riCount();
}
function riCount() { var n = riList.filter(function (r) { return r.on; }).length; document.getElementById('ri-go').textContent = n + ' Rechnung(en) importieren'; document.getElementById('ri-go').disabled = !n; }
async function rechnungenSave() {
  var art = document.getElementById('ri-art').value, n = 0, neu = 0, ids = {};
  for (var i = 0; i < riList.length; i++) {
    var r = riList[i]; if (!r.on) continue;
    var p = r.pat || riFind(r.name);
    if (!p) {
      var parts = r.name.trim().split(/\s+/), nach = parts.pop() || r.name, vor = parts.join(' ');
      p = { anrede: /^(Herr|Frau|Divers)$/.test(r.anrede) ? r.anrede : '', vorname: vor, nachname: nach, dob: '', phone: '', email: '', adresse: r.adresse, allergien: '', notizen: '', medikation: [], doku: [], log: [{ ts: Date.now(), type: 'notiz', text: 'Aus einer importierten Rechnung angelegt' }], bilder: [], dokumente: [], erstellt: Date.now() };
      patients.push(p); ensurePatients(); r.pat = p; neu++;
    }
    var items = r.items.map(function (x) { var o = { text: x.text, qty: x.qty, price: x.price, amount: x.amount, rate: x.rate }; if (x.rabatt) { o.rabatt = true; o.pct = x.pct; } return o; });
    if (p.log && p.log.some(function (l) { return /importierten Rechnung angelegt/.test(l.text || ''); })) { var ts0 = new Date(r.date + 'T12:00:00').getTime(); if (ts0 < p.erstellt) p.erstellt = ts0; }
    var inv = { id: newId(), nr: r.nr, date: r.date, leistung: r.leistung, pid: p.id, name: (p.anrede ? p.anrede + ' ' : '') + p.vorname + ' ' + p.nachname, adresse: r.adresse || p.adresse || '', items: items, doku: '', eid: null,
      hinweis: items.some(function (x) { return x.rate === 0; }) ? (settings.hinweis || '').trim() : '', zahlung: settings.zahlung || '', vortext: '', total: r.total, payments: [], created: Date.now(), imported: true };
    if (r.storno) { inv.storniert = true; inv.stornoRef = r.stornoRef || ''; }
    else if (r.pays && r.pays.length) r.pays.forEach(function (x) { inv.payments.push({ nr: x.nr, art: x.art, amount: x.amount, date: x.date || r.paidDate || r.date }); });
    else if (/^bezahlt/i.test(r.status)) inv.payments.push({ nr: nextPayNr(r.paidDate || r.date), art: art, amount: r.total, date: r.paidDate || r.date });
    invoices.push(inv);
    if (!p.adresse && r.adresse) p.adresse = r.adresse;
    if (r.file) { var fid = newId(); await fPut(fid, 'Rechnung-' + r.nr + '.pdf', r.file); p.dokumente = p.dokumente || []; p.dokumente.push({ id: fid, ts: Date.now(), name: 'Rechnung-' + r.nr + '.pdf', kat: 'Sonstiges' }); }
    n++;
  }
  persist(); closeModal('modal-rimp'); renderInvoices(); renderPatients(); if (document.getElementById('tab-zahlungen').classList.contains('active')) renderZahlungen();
  alert(n + ' Rechnung(en) importiert' + (neu ? ', ' + neu + ' Patient(en) neu angelegt' : '') + '. Die Original-PDFs hängen in den Akten unter Anlagen.');
}
