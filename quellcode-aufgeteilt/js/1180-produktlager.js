/* ===== Produktlager ===== */
/* Produkte importieren: eigene JSON-Datei oder CSV-Export (name; stock; minimum_stock; group; contact; ownCosts; gross; taxRate) */
function csvRows(t) {
  var first = t.split(/\r?\n/)[0] || '', d = (first.split(';').length >= first.split('\t').length && first.split(';').length >= first.split(',').length) ? ';' : (first.split('\t').length >= first.split(',').length ? '\t' : ',');
  var rows = [], row = [], f = '', q = false;
  for (var i = 0; i < t.length; i++) {
    var c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === d) { row.push(f); f = ''; }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
    else if (c !== '\r') f += c;
  }
  if (f !== '' || row.length) { row.push(f); rows.push(row); }
  return rows.filter(function (r) { return r.some(function (x) { return String(x).trim() !== ''; }); });
}
function parseLagerFile(t) {
  t = t.replace(/^\uFEFF/, '').replace(/^ï»¿/, '');
  if (/Ã[\u0080-\u00BF]/.test(t)) { try { t = decodeURIComponent(escape(t)); } catch (x) {} }
  if (/^\s*\{/.test(t)) { var j = JSON.parse(t); if (!j || !Array.isArray(j.produkte)) throw new Error('Keine Produktliste gefunden.'); return j.produkte; }
  var rs = csvRows(t); if (rs.length < 2) throw new Error('Die Datei enthält keine Produktzeilen.');
  var h = rs[0].map(function (x) { return x.trim().toLowerCase().replace(/[^a-zäöü_]/g, ''); });
  var col = function () { for (var a = 0; a < arguments.length; a++) { var k = h.indexOf(arguments[a]); if (k >= 0) return k; } return -1; };
  var ci = { name: col('name', 'produkt', 'bezeichnung'), stock: col('stock', 'bestand'), min: col('minimum_stock', 'minimumstock', 'mindestmenge'), group: col('group', 'gruppe', 'kategorie'), contact: col('contact', 'lieferant'), ek: col('owncosts', 'ek', 'einkaufspreis'), gross: col('gross', 'brutto', 'vk'), tax: col('taxrate', 'mwst', 'steuersatz') };
  if (ci.name < 0) throw new Error('Spalte "name" nicht gefunden.');
  var nn = function (v) { if (v === undefined || String(v).trim() === '') return null; var x = parseFloat(String(v).replace(/\s/g, '').replace(',', '.')); return isNaN(x) ? null : x; };
  return rs.slice(1).map(function (r) {
    var nm = String(r[ci.name] || '').trim(), m = nm.match(/^(.*?)\s*\((\d+)\)\s*$/), tx = ci.tax >= 0 ? nn(r[ci.tax]) : null, gr = ci.gross >= 0 ? nn(r[ci.gross]) : null;
    if (tx !== null && tx > 1) tx = tx / 100; if (tx === null) tx = 0.19;
    return { name: m ? m[1] : nm, nr: m ? m[2] : '', gruppe: ci.group >= 0 ? String(r[ci.group] || '').trim() : '', lief: ci.contact >= 0 ? String(r[ci.contact] || '').trim() : '', min: ci.min >= 0 ? nn(r[ci.min]) || 0 : 0, ek: ci.ek >= 0 ? nn(r[ci.ek]) : null, vk: gr ? Math.round(gr / (1 + tx) * 100) / 100 : 0, bestand: ci.stock >= 0 ? nn(r[ci.stock]) : null };
  });
}
function lagerImport(inp) {
  var f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
  f.text().then(async function (t) {
    var list; try { list = parseLagerFile(t); } catch (x) { alert('Die Datei konnte nicht gelesen werden: ' + (x && x.message ? x.message : x)); return; }
    var have = {}; lager.produkte.forEach(function (p) { have[p.name.toLowerCase()] = 1; });
    var neu = [], skip = 0, neg = 0;
    list.forEach(function (r) { var n = String(r.name || '').trim(); if (!n || have[n.toLowerCase()]) { skip++; return; } have[n.toLowerCase()] = 1; neu.push(r); if ((+r.bestand || 0) < 0) neg++; });
    if (!neu.length) { alert('Es gibt nichts Neues zu importieren (' + skip + ' Produkt(e) sind schon im Lager).'); return; }
    var mitB = neu.filter(function (r) { return (+r.bestand || 0) > 0; }).length;
    if (!await kaConfirm(neu.length + ' neue Produkte importieren' + (skip ? ' (' + skip + ' schon vorhanden, werden übersprungen)' : '') + '?\n' + mitB + ' davon mit Bestand' + (neg ? '. ' + neg + ' mit negativem Bestand werden ohne Bestand angelegt' : '') + '.')) return;
    var today = iso(new Date());
    neu.forEach(function (r) {
      var p = { id: lid(), name: String(r.name).trim(), einheit: r.einheit || '', min: +r.min || 0, ek: r.ek === null || r.ek === undefined || r.ek === '' ? null : +r.ek, vk: +r.vk || 0, lief: r.lief || '', nr: r.nr || '', gruppe: r.gruppe || '' };
      lager.produkte.push(p);
      var b = +r.bestand || 0;
      if (b > 0) lager.chargen.push({ id: lid(), pid: p.id, nr: 'Bestand bei Import', verfall: '', menge: b, rest: b, ek: p.ek, datum: today });
    });
    persist(); renderLager();
    alert(neu.length + ' Produkte importiert. Bitte bei den Chargen später Chargennummer und Verfall ergänzen, sobald du sie brauchst.');
  });
}

function lid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function num(v) { var n = parseFloat(String(v).replace(',', '.')); return isNaN(n) ? null : n; }
function qty(n) { return String(Math.round((+n || 0) * 100) / 100).replace('.', ','); }
function prodOf(id) { return lager.produkte.filter(function (p) { return p.id === id; })[0]; }
function bestand(pid) { return lager.chargen.reduce(function (s, c) { return c.pid === pid && !(c.verfall && daysTo(c.verfall) < 0) ? s + (+c.rest || 0) : s; }, 0); }
function daysTo(d) { return Math.round((new Date(d + 'T00:00:00') - new Date(iso(new Date()) + 'T00:00:00')) / 86400000); }
function chargenOf(pid) {
  return lager.chargen.filter(function (c) { return c.pid === pid && (+c.rest || 0) > 0; })
    .sort(function (a, b) { return (a.verfall || '9999').localeCompare(b.verfall || '9999') || (a.datum || '').localeCompare(b.datum || ''); });
}
function lastEk(p) {
  var cs = lager.chargen.filter(function (c) { return c.pid === p.id && c.ek !== null && c.ek !== '' && c.ek !== undefined; }).sort(function (a, b) { return (b.datum || '').localeCompare(a.datum || ''); });
  if (cs.length) return +cs[0].ek;
  return p.ek !== null && p.ek !== '' && p.ek !== undefined ? +p.ek : null;
}
function lagerWarns() {
  var low = 0, soon = 0, exp = 0;
  lager.produkte.forEach(function (p) {
    var b = bestand(p.id);
    if (p.verwalten !== false && p.min > 0 && b < p.min) low++;
    chargenOf(p.id).forEach(function (c) { if (!c.verfall) return; var d = daysTo(c.verfall); if (d < 0) exp++; else if (d <= 60) soon++; });
  });
  var r = [];
  if (low) r.push({ text: low + (low === 1 ? ' Produkt' : ' Produkte') + ' unter Mindestmenge' });
  if (exp) r.push({ text: exp + (exp === 1 ? ' Charge abgelaufen' : ' Chargen abgelaufen') });
  if (soon) r.push({ text: soon + (soon === 1 ? ' Charge läuft' : ' Chargen laufen') + ' in 60 Tagen ab' });
  return r;
}
function renderLager() {
  var tb = document.getElementById('lg-table'); if (!tb) return;
  tb.innerHTML = '';
  document.getElementById('lg-empty').style.display = lager.produkte.length ? 'none' : 'block';
  var wb = document.getElementById('lg-warn'); wb.innerHTML = '';
  lagerWarns().forEach(function (w) { var d = mk('div', 'hm-warn', w.text); wb.appendChild(d); });
  var wert = 0;
  lager.produkte.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'de'); }).forEach(function (p) {
    var b = bestand(p.id), row = tb.insertRow();
    var c = [0, 1, 2, 3, 4, 5, 6].map(function () { return row.insertCell(); });
    var nb = mk('button', 'pn', p.name); nb.type = 'button'; nb.onclick = function () { openProdukt(p.id); }; c[0].appendChild(nb);
    c[1].appendChild(document.createTextNode(qty(b) + ' ' + (p.einheit || '') + ' '));
    if (p.min > 0 && b < p.min) { var lb = mk('span', 'badge', b <= 0 ? 'leer' : 'niedrig'); lb.style.cssText = 'background:#fee2e2; color:#b91c1c;'; c[1].appendChild(lb); }
    c[2].textContent = p.min > 0 ? qty(p.min) : '-';
    var ch = chargenOf(p.id).filter(function (x) { return x.verfall; })[0];
    if (ch) {
      var dd = daysTo(ch.verfall);
      c[3].appendChild(document.createTextNode(fmtD(ch.verfall) + ' '));
      if (dd < 0) { var eb = mk('span', 'badge', 'abgelaufen'); eb.style.cssText = 'background:#fee2e2; color:#b91c1c;'; c[3].appendChild(eb); }
      else if (dd <= 60) c[3].appendChild(mk('span', 'badge badge-amber', 'in ' + dd + ' Tagen'));
    } else c[3].textContent = '-';
    var ek = lastEk(p);
    c[4].textContent = ek !== null ? eur(ek) : '-';
    c[5].textContent = p.vk > 0 ? eur(p.vk) : '-';
    c[6].textContent = (ek !== null && p.vk > 0) ? eur(p.vk - ek) + ' (' + Math.round((p.vk - ek) / p.vk * 100) + ' %)' : '-';
    lager.chargen.forEach(function (x) { if (x.pid === p.id && x.ek !== null && x.ek !== '' && x.ek !== undefined) wert += (+x.rest || 0) * (+x.ek); });
  });
  document.getElementById('lg-sum').textContent = lager.produkte.length ? 'Lagerwert zum Einkaufspreis (netto): ' + eur(wert) : '';
}
var curProd = null;
var lpHistN = 10;
function lpPreview() {
  var br = num(document.getElementById('lp-brutto').value), st = parseInt(document.getElementById('lp-steuer').value, 10) || 0, nm = document.getElementById('lp-name').value.trim();
  document.getElementById('lpv-name').textContent = nm || '-';
  if (br === null || br <= 0) { ['lpv-n', 'lpv-m', 'lpv-b'].forEach(function (i) { document.getElementById(i).textContent = '-'; }); return; }
  var net = r2(br / (1 + st / 100)); document.getElementById('lpv-n').textContent = eur(net); document.getElementById('lpv-m').textContent = eur(r2(br - net)); document.getElementById('lpv-b').textContent = eur(br);
}
function openProdukt(id) {
  curProd = id ? prodOf(id) : null;
  var p = curProd || {};
  document.getElementById('lp-title').textContent = p.id ? p.name + ' bearbeiten' : 'Neues Produkt';
  document.getElementById('lp-name').value = p.name || '';
  var st = p.steuer !== undefined ? p.steuer : 19; document.getElementById('lp-steuer').value = String(st);
  document.getElementById('lp-brutto').value = p.vk > 0 ? qty(r2(p.vk * (1 + st / 100))) : '';
  document.getElementById('lp-gruppe').value = p.gruppe || '';
  var dl = document.getElementById('lp-gruppen'); dl.innerHTML = ''; var seen = {}; lager.produkte.forEach(function (x) { if (x.gruppe && !seen[x.gruppe]) { seen[x.gruppe] = 1; var o = document.createElement('option'); o.value = x.gruppe; dl.appendChild(o); } });
  document.getElementById('lp-einheit').value = p.einheit || '';
  document.getElementById('lp-min').value = p.min > 0 ? qty(p.min) : '';
  document.getElementById('lp-ek').value = p.ek !== null && p.ek !== undefined && p.ek !== '' ? qty(p.ek) : '';
  document.getElementById('lp-barcode').value = p.barcode || p.nr || '';
  document.getElementById('lp-text').value = p.text || '';
  document.getElementById('lp-konto').value = p.konto || '';
  document.getElementById('lp-lief').value = p.lief || '';
  document.getElementById('lp-verw').checked = p.verwalten !== false;
  document.getElementById('lp-del').style.display = p.id ? '' : 'none';
  lpPreview();
  var box = document.getElementById('lp-chbox'), list = document.getElementById('lp-chargen');
  list.innerHTML = '';
  document.getElementById('lp-stock').style.display = p.id ? 'block' : 'none';
  document.getElementById('lp-histbox').style.display = p.id ? 'block' : 'none';
  if (p.id) {
    document.getElementById('lp-stand').textContent = qty(bestand(p.id)) + ' ' + (p.einheit || 'Stk');
    var cs = chargenOf(p.id);
    box.style.display = cs.length ? 'block' : 'none';
    cs.forEach(function (c) {
      var r = mk('div', ''); r.style.cssText = 'display:flex; gap:8px; align-items:center; justify-content:space-between; padding:6px 0; border-top:1px solid #e2e8f0; font-size:13px;';
      var cl = mk('span', '', 'Charge ' + (c.nr || '-') + (c.verfall ? ' · bis ' + fmtD(c.verfall) : '')); cl.style.cursor = 'pointer'; cl.onclick = function () { openWare(c.id); }; r.appendChild(cl);
      var inp = mk('input', 'form-control'); inp.type = 'text'; inp.setAttribute('inputmode', 'decimal'); inp.style.cssText = 'width:90px;'; inp.value = qty(c.rest); inp.setAttribute('data-cid', c.id); inp.title = 'Restmenge korrigieren';
      var pe = mk('button', 'x-btn ra-pen'); pe.type = 'button'; pe.title = 'Charge bearbeiten'; pe.setAttribute('aria-label', 'Charge bearbeiten'); pe.innerHTML = tvSvg('pen'); pe.firstChild.style.cssText = 'width:16px;height:16px;'; pe.onclick = function () { openWare(c.id); };
      var rr = mk('span'); rr.style.cssText = 'display:inline-flex; gap:6px; align-items:center;'; rr.appendChild(inp); rr.appendChild(pe);
      r.appendChild(rr); list.appendChild(r);
    });
    lpHistN = 10; lpHistory();
  } else box.style.display = 'none';
  openModal('modal-produkt');
}
function lpHistory() {
  var p = curProd; if (!p) return; var tb = document.getElementById('lp-hist'); tb.innerHTML = '';
  var rows = [];
  lager.chargen.forEach(function (c) { if (c.pid === p.id) rows.push({ ts: c.datum ? new Date(c.datum + 'T12:00:00').getTime() : 0, grund: 'Einbuchung' + (c.nr ? ' (Charge ' + c.nr + ')' : ''), anz: +c.menge || 0, ek: c.ek }); });
  lager.verbrauch.forEach(function (v) { if (v.prodId === p.id) { var pt = v.pid ? patients.filter(function (x) { return x.id === v.pid; })[0] : null; rows.push({ ts: v.ts, grund: pt ? 'Behandlung ' + nameKey(pt) : (v.grund || 'Ausbuchung'), anz: -(+v.menge || 0), ek: v.ek }); } });
  rows.sort(function (a, b) { return b.ts - a.ts; });
  rows.slice(0, lpHistN).forEach(function (r) { var row = tb.insertRow(); row.insertCell().textContent = r.ts ? fmtD(iso(new Date(r.ts))) : '-'; row.insertCell().textContent = r.grund; var c = row.insertCell(); c.textContent = (r.anz > 0 ? '+' : '') + qty(r.anz) + ' ' + (p.einheit || 'Stk'); c.style.color = r.anz < 0 ? '#b91c1c' : '#166534'; row.insertCell().textContent = r.ek !== null && r.ek !== undefined && r.ek !== '' ? eur(+r.ek) : '-'; });
  if (!rows.length) { var er = tb.insertRow(), ec = er.insertCell(); ec.colSpan = 4; ec.textContent = 'Noch keine Buchungen'; ec.style.color = '#94a3b8'; }
  document.getElementById('lp-histmore').style.display = rows.length > lpHistN ? '' : 'none';
}
function lpEinbuchen() { if (!curProd) return; var id = curProd.id; closeModal('modal-produkt'); setTimeout(function () { openWare(); document.getElementById('lw-prod').value = id; wareProdChanged(); }, 80); }
function lpAusbuchen() {
  if (!curProd) return; var cs = chargenOf(curProd.id);
  if (!cs.length) { alert('Es ist keine Charge mit Restmenge vorhanden.'); return; }
  var sel = document.getElementById('au-ch'); sel.innerHTML = '';
  cs.forEach(function (c) { var o = mk('option', '', 'Charge ' + (c.nr || '-') + ' · Rest ' + qty(c.rest) + (c.verfall ? ' · bis ' + fmtD(c.verfall) : '')); o.value = c.id; sel.appendChild(o); });
  document.getElementById('au-menge').value = ''; document.getElementById('au-title').textContent = curProd.name + ' ausbuchen'; openModal('modal-aus');
}
function saveAus() {
  var p = curProd, c = lager.chargen.filter(function (x) { return x.id === document.getElementById('au-ch').value; })[0], m = num(document.getElementById('au-menge').value);
  if (!p || !c) return; if (m === null || m <= 0) { alert('Bitte eine Menge größer als 0 eingeben.'); return; }
  if (m > (+c.rest || 0) + 1e-9) { alert('Von dieser Charge sind nur noch ' + qty(c.rest) + ' da.'); return; }
  c.rest = Math.round(((+c.rest || 0) - m) * 1000) / 1000;
  lager.verbrauch.push({ id: lid(), ts: Date.now(), pid: null, prodId: p.id, chId: c.id, name: p.name, einheit: p.einheit || '', nr: c.nr || '', verfall: c.verfall || '', menge: m, ek: c.ek, eid: null, grund: document.getElementById('au-grund').value });
  persist(); closeModal('modal-aus'); openProdukt(p.id); renderLager();
}
function saveProdukt() {
  var name = document.getElementById('lp-name').value.trim();
  if (!name) { alert('Bitte eine Bezeichnung eingeben.'); return; }
  var ekv = document.getElementById('lp-ek').value.trim(), bv = document.getElementById('lp-brutto').value.trim(), mv = document.getElementById('lp-min').value.trim(), st = parseInt(document.getElementById('lp-steuer').value, 10) || 0;
  var ek = ekv === '' ? null : num(ekv), br = bv === '' ? 0 : num(bv), mn = mv === '' ? 0 : num(mv);
  if ((ekv !== '' && (ek === null || ek < 0)) || br === null || br < 0 || mn === null || mn < 0) { alert('Bitte Zahlen für Preise und Mindestmenge prüfen.'); return; }
  var dup = lager.produkte.filter(function (p) { return p.name.toLowerCase() === name.toLowerCase() && (!curProd || p.id !== curProd.id); })[0];
  if (dup) { alert('Ein Produkt mit diesem Namen gibt es schon.'); return; }
  var p = curProd;
  if (!p) { p = { id: lid() }; lager.produkte.push(p); }
  p.name = name; p.einheit = document.getElementById('lp-einheit').value.trim(); p.min = mn; p.ek = ek; p.steuer = st; p.vk = br ? r2(br / (1 + st / 100)) : 0; p.lief = document.getElementById('lp-lief').value.trim();
  p.gruppe = document.getElementById('lp-gruppe').value.trim(); p.barcode = document.getElementById('lp-barcode').value.trim(); p.text = document.getElementById('lp-text').value.trim(); p.konto = document.getElementById('lp-konto').value.trim(); p.verwalten = document.getElementById('lp-verw').checked;
  var bad = false;
  [].slice.call(document.querySelectorAll('#lp-chargen input')).forEach(function (inp) {
    var n = num(inp.value), c = lager.chargen.filter(function (x) { return x.id === inp.getAttribute('data-cid'); })[0];
    if (!c) return; if (n === null || n < 0) { bad = true; return; } c.rest = n;
  });
  if (bad) { alert('Bitte die Restmengen der Chargen prüfen.'); return; }
  persist(); renderLager(); closeModal('modal-produkt');
}
async function deleteProdukt() {
  if (!curProd) return;
  if (lager.verbrauch.some(function (v) { return v.prodId === curProd.id; })) { alert('Zu diesem Produkt gibt es Buchungen bei Patienten. Setze stattdessen die Restmengen der Chargen auf 0.'); return; }
  if (!await kaConfirm('Produkt "' + curProd.name + '" mit allen Chargen löschen?')) return;
  var id = curProd.id;
  lager.produkte = lager.produkte.filter(function (p) { return p.id !== id; });
  lager.chargen = lager.chargen.filter(function (c) { return c.pid !== id; });
  persist(); renderLager(); closeModal('modal-produkt');
}
var wareCur = null;
function openWare(cid) {
  wareCur = null;
  if (!lager.produkte.length) { alert('Bitte zuerst ein Produkt anlegen.'); openProdukt(null); return; }
  var sel = document.getElementById('lw-prod'); sel.innerHTML = '';
  lager.produkte.slice().sort(function (a, b) { return a.name.localeCompare(b.name, 'de'); }).forEach(function (p) { var o = mk('option', '', p.name); o.value = p.id; sel.appendChild(o); });
  ['lw-nr', 'lw-verfall', 'lw-menge'].forEach(function (i) { document.getElementById(i).value = ''; });
  document.getElementById('lw-datum').value = iso(new Date());
  document.getElementById('lw-title').textContent = 'Wareneingang'; document.getElementById('lw-del').style.display = 'none'; document.getElementById('lw-prod').disabled = false;
  wareProdChanged();
  var c0 = cid ? lager.chargen.filter(function (x) { return x.id === cid; })[0] : null;
  if (c0) {
    wareCur = c0; document.getElementById('lw-prod').value = c0.pid; document.getElementById('lw-prod').disabled = true; document.getElementById('lw-title').textContent = 'Charge bearbeiten'; document.getElementById('lw-del').style.display = '';
    document.getElementById('lw-nr').value = c0.nr || ''; document.getElementById('lw-verfall').value = c0.verfall || ''; document.getElementById('lw-menge').value = qty(c0.menge); document.getElementById('lw-ek').value = c0.ek === null || c0.ek === undefined || c0.ek === '' ? '' : qty(c0.ek); document.getElementById('lw-datum').value = c0.datum || '';
  }
  openModal('modal-ware');
}
function wareProdChanged() {
  var p = prodOf(document.getElementById('lw-prod').value), ek = p ? lastEk(p) : null;
  document.getElementById('lw-ek').value = ek !== null ? qty(ek) : '';
}
function saveWare() {
  var p = prodOf(document.getElementById('lw-prod').value), nr = document.getElementById('lw-nr').value.trim(), m = num(document.getElementById('lw-menge').value), ekv = document.getElementById('lw-ek').value.trim(), ek = ekv === '' ? null : num(ekv);
  if (!p) { alert('Bitte ein Produkt wählen.'); return; }
  if (!nr) { alert('Bitte die Chargennummer eingeben. Sie wird für die Dokumentation beim Patienten gebraucht.'); return; }
  if (m === null || m <= 0) { alert('Bitte eine Menge größer als 0 eingeben.'); return; }
  if (ekv !== '' && (ek === null || ek < 0)) { alert('Bitte den Einkaufspreis prüfen.'); return; }
  if (wareCur) {
    var c1 = wareCur, d = m - (+c1.menge || 0);
    c1.nr = nr; c1.verfall = document.getElementById('lw-verfall').value || ''; c1.ek = ek; c1.datum = document.getElementById('lw-datum').value || c1.datum;
    c1.menge = m; c1.rest = Math.max(0, Math.round(((+c1.rest || 0) + d) * 1000) / 1000);
    lager.verbrauch.forEach(function (v) { if (v.chId === c1.id) { v.nr = nr; v.verfall = c1.verfall; } });
    wareCur = null;
  } else lager.chargen.push({ id: lid(), pid: p.id, nr: nr, verfall: document.getElementById('lw-verfall').value || '', menge: m, rest: m, ek: ek, datum: document.getElementById('lw-datum').value || iso(new Date()) });
  persist(); renderLager(); closeModal('modal-ware'); if (curProd && document.getElementById('modal-produkt').classList.contains('active')) openProdukt(curProd.id);
}
async function deleteWare() {
  var c = wareCur; if (!c) return;
  if (lager.verbrauch.some(function (v) { return v.chId === c.id; })) { alert('Von dieser Charge wurde schon etwas verwendet. Sie kann deshalb nicht gelöscht werden. Setze stattdessen die Restmenge auf 0.'); return; }
  if (!await kaConfirm('Charge ' + (c.nr || '-') + ' löschen? Der Bestand sinkt um ' + qty(c.rest) + '.')) return;
  lager.chargen = lager.chargen.filter(function (x) { return x !== c; }); wareCur = null;
  persist(); renderLager(); closeModal('modal-ware'); if (curProd && document.getElementById('modal-produkt').classList.contains('active')) openProdukt(curProd.id);
}
function openVb(eid) {
  if (!curP) return;
  var prods = lager.produkte.filter(function (p) { return chargenOf(p.id).length; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'de'); });
  if (!prods.length) { alert('Im Lager ist kein Bestand vorhanden. Bitte zuerst im Reiter Lager einen Wareneingang erfassen.'); return; }
  document.getElementById('vb-pat').textContent = 'Patient: ' + dnP(curP);
  var sel = document.getElementById('vb-prod'); sel.innerHTML = '';
  prods.forEach(function (p) { var o = mk('option', '', p.name + ' (' + qty(bestand(p.id)) + ' ' + (p.einheit || '') + ')'); o.value = p.id; sel.appendChild(o); });
  var ts = document.getElementById('vb-termin'); ts.innerHTML = '';
  var o0 = mk('option', '', 'Kein Termin'); o0.value = ''; ts.appendChild(o0);
  events.filter(function (e) { return eventBelongs(e, curP); }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }).forEach(function (e) { var o = mk('option', '', fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '')); o.value = e.id; ts.appendChild(o); });
  ts.value = eid ? String(eid) : '';
  document.getElementById('vb-menge').value = '';
  vbProdChanged(); openModal('modal-vb');
}
function vbProdChanged() {
  var pid = document.getElementById('vb-prod').value, sel = document.getElementById('vb-ch'); sel.innerHTML = '';
  chargenOf(pid).forEach(function (c) {
    var exp = c.verfall && daysTo(c.verfall) < 0;
    var o = mk('option', '', 'Charge ' + (c.nr || '-') + (c.verfall ? ' · bis ' + fmtD(c.verfall) : '') + (exp ? ' · ABGELAUFEN' : '') + ' · Rest ' + qty(c.rest));
    o.value = c.id; if (exp) o.disabled = true; sel.appendChild(o);
  });
  var first = [].slice.call(sel.options).filter(function (o) { return !o.disabled; })[0];
  if (first) sel.value = first.value;
  vbChChanged();
}
function vbChChanged() {
  var c = lager.chargen.filter(function (x) { return x.id === document.getElementById('vb-ch').value; })[0], p = prodOf(document.getElementById('vb-prod').value);
  document.getElementById('vb-rest').textContent = c ? '(verfügbar: ' + qty(c.rest) + ' ' + ((p && p.einheit) || '') + ')' : '';
}
function saveVb() {
  var p = prodOf(document.getElementById('vb-prod').value), c = lager.chargen.filter(function (x) { return x.id === document.getElementById('vb-ch').value; })[0], m = num(document.getElementById('vb-menge').value);
  var eidv = document.getElementById('vb-termin').value;
  var stage = !!(dkEv && !dkEv.pseudo && document.getElementById('modal-dok').classList.contains('active') && eidv === String(dkEv.id));
  if (!p || !c) { alert('Bitte Produkt und Charge wählen. Abgelaufene Chargen können nicht verwendet werden.'); return; }
  if (c.verfall && daysTo(c.verfall) < 0) { alert('Diese Charge ist abgelaufen.'); return; }
  if (m === null || m <= 0) { alert('Bitte eine Menge größer als 0 eingeben.'); return; }
  var frei = (+c.rest || 0) - (stage ? dkPend.filter(function (x) { return x.chId === c.id; }).reduce(function (t, x) { return t + x.menge; }, 0) : 0);
  if (m > frei + 1e-9) { alert('Von dieser Charge sind nur noch ' + qty(frei) + ' ' + (p.einheit || '') + ' da.'); return; }
  var vb = { id: lid(), ts: Date.now(), pid: curP.id, prodId: p.id, chId: c.id, name: p.name, einheit: p.einheit || '', nr: c.nr || '', verfall: c.verfall || '', menge: m, ek: c.ek, eid: eidv ? +eidv : null };
  if (stage) { dkPend.push(vb); closeModal('modal-vb'); dkRenderProd(); return; }
  c.rest = Math.round(((+c.rest || 0) - m) * 1000) / 1000;
  lager.verbrauch.push(vb);
  persist(); renderVerlauf(); renderLager(); closeModal('modal-vb'); if (dkEv) dkRenderProd();
}

/* Patienten aus einer JSON-Datei hinzufügen (ersetzt nichts, bestehende Daten bleiben) */
function tsParse(v) {
  if (typeof v === 'number') return v;
  var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(v || ''));
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime() : Date.now();
}
/* ZIP lesen (gespeichert oder deflate), ohne Fremdbibliothek */
function readZip(x) { return (typeof Blob !== 'undefined' && x instanceof Blob) ? readZipBlob(x) : readZipBuf(x); }
/* ZIP direkt aus einer Datei lesen, ohne sie ganz in den Arbeitsspeicher zu laden (auch für mehrere GB geeignet) */
async function readZipBlob(file) {
  var size = file.size, dec = new TextDecoder('utf-8'), list = [], out = {};
  var big = function (dv, o) { return Number(dv.getBigUint64(o, true)); };
  var tl = Math.min(size, 65557 + 76), tail = new DataView(await file.slice(size - tl).arrayBuffer()), i = tl - 22;
  while (i >= 0 && tail.getUint32(i, true) !== 0x06054b50) i--;
  if (i >= 0) {
    var n = tail.getUint16(i + 10, true), cdSize = tail.getUint32(i + 12, true), cdOff = tail.getUint32(i + 16, true);
    if ((n === 0xFFFF || cdSize === 0xFFFFFFFF || cdOff === 0xFFFFFFFF) && i >= 20 && tail.getUint32(i - 20, true) === 0x07064b50) {   /* ZIP64 */
      var z64 = big(tail, i - 20 + 8), r64 = new DataView(await file.slice(z64, z64 + 56).arrayBuffer());
      if (r64.getUint32(0, true) === 0x06064b50) { n = big(r64, 32); cdSize = big(r64, 40); cdOff = big(r64, 48); }
    }
    var cdBuf = await file.slice(cdOff, cdOff + cdSize).arrayBuffer(), cd = new DataView(cdBuf), u8 = new Uint8Array(cdBuf), p = 0;
    for (var k = 0; k < n; k++) {
      if (p + 46 > cdBuf.byteLength || cd.getUint32(p, true) !== 0x02014b50) break;
      var fl = cd.getUint16(p + 8, true), meth = cd.getUint16(p + 10, true), csz = cd.getUint32(p + 20, true), usz = cd.getUint32(p + 24, true), nl = cd.getUint16(p + 28, true), el = cd.getUint16(p + 30, true), cl = cd.getUint16(p + 32, true), lo = cd.getUint32(p + 42, true);
      if (csz === 0xFFFFFFFF || usz === 0xFFFFFFFF || lo === 0xFFFFFFFF) {   /* ZIP64-Zusatzfeld */
        var q = p + 46 + nl, qe = q + el;
        while (q + 4 <= qe) { var hid = cd.getUint16(q, true), hl = cd.getUint16(q + 2, true); if (hid === 1) { var w = q + 4; if (usz === 0xFFFFFFFF) { usz = big(cd, w); w += 8; } if (csz === 0xFFFFFFFF) { csz = big(cd, w); w += 8; } if (lo === 0xFFFFFFFF) { lo = big(cd, w); } break; } q += 4 + hl; }
      }
      list.push({ name: dec.decode(u8.subarray(p + 46, p + 46 + nl)), meth: meth, csz: csz, lo: lo, enc: !!(fl & 1) });
      p += 46 + nl + el + cl;
    }
  } else {
    /* Kein Dateiende gefunden (zum Beispiel unvollständig heruntergeladen): die Einträge der Reihe nach lesen */
    var head = new DataView(await file.slice(0, Math.min(size, 4)).arrayBuffer());
    if (size < 4 || head.getUint32(0, true) !== 0x04034b50) throw new Error('keine ZIP-Datei, ' + Math.round(size / 1048576) + ' MB');
    var pos = 0;
    while (pos + 30 <= size) {
      var lh0 = new DataView(await file.slice(pos, pos + 30).arrayBuffer());
      if (lh0.getUint32(0, true) !== 0x04034b50) break;
      var f0 = lh0.getUint16(6, true), m0 = lh0.getUint16(8, true), c0 = lh0.getUint32(18, true), nl0 = lh0.getUint16(26, true), el0 = lh0.getUint16(28, true);
      if ((f0 & 8) && c0 === 0) break;
      var nm0 = dec.decode(new Uint8Array(await file.slice(pos + 30, pos + 30 + nl0).arrayBuffer()));
      if (pos + 30 + nl0 + el0 + c0 > size) break;
      list.push({ name: nm0, meth: m0, csz: c0, lo: pos, enc: !!(f0 & 1) });
      pos += 30 + nl0 + el0 + c0;
    }
    if (!list.length) throw new Error('ZIP-Ende nicht gefunden, ' + Math.round(size / 1048576) + ' MB, vermutlich unvollständig');
  }
  for (var a = 0; a < list.length; a += 200) {
    await Promise.all(list.slice(a, a + 200).map(async function (e) {
      if (/\/$/.test(e.name)) return;
      if (e.enc) { if (/(manifest|info|daten)\.json/.test(e.name)) throw new Error('ZIP ist passwortgeschützt'); return; }
      var lh = new DataView(await file.slice(e.lo, e.lo + 30).arrayBuffer()), ds = e.lo + 30 + lh.getUint16(26, true) + lh.getUint16(28, true), part = file.slice(ds, ds + e.csz);
      if (e.meth === 0) out[e.name] = new Blob([part], { type: mimeOf(e.name) });
      else if (e.meth === 8) out[e.name] = new Blob([await new Response(part.stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob()], { type: mimeOf(e.name) });
      else if (/(manifest|info|daten)\.json/.test(e.name)) throw new Error('Komprimierung ' + e.meth + ' wird nicht unterstützt');
    }));
  }
  return out;
}
function readZipBuf(buf) {
  var dv = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder('utf-8'), i = buf.byteLength - 22;
  while (i >= 0 && dv.getUint32(i, true) !== 0x06054b50) i--;
  if (i < 0) return Promise.reject(new Error('zip'));
  var n = dv.getUint16(i + 10, true), p = dv.getUint32(i + 16, true), jobs = [], out = {};
  for (var k = 0; k < n; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    var meth = dv.getUint16(p + 10, true), csz = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    var name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + el + cl;
    var ds = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true), raw = u8.subarray(ds, ds + csz);
    (function (nm, m, rw) {
      if (/\/$/.test(nm)) return;
      if (m === 0) out[nm] = new Blob([rw], { type: mimeOf(nm) });
      else if (m === 8) jobs.push(new Response(new Blob([rw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).blob().then(function (b) { out[nm] = new Blob([b], { type: mimeOf(nm) }); }));
    })(name, meth, raw);
  }
  return Promise.all(jobs).then(function () { return out; });
}
/*PARSER-BEGIN*/
/* Liest die als PDF gedruckte Patientenakte des Altsystems (Text mit Positionen) und gibt Stammdaten und Akteneinträge zurück.
   pages: pro Seite eine Liste von Textstücken { str, x, y, w }. Rein funktional, ohne Zugriff auf die Oberfläche. */
function akteGroupLines(items) {
  var its = items.filter(function (i) { return String(i.str).replace(/\s/g, '') !== ''; }).sort(function (a, b) { return b.y - a.y || a.x - b.x; });
  var lines = [];
  its.forEach(function (i) {
    var l = lines.length ? lines[lines.length - 1] : null;
    if (l && Math.abs(l.y - i.y) < 2) l.items.push(i); else lines.push({ y: i.y, items: [i] });
  });
  lines.forEach(function (l) { l.items.sort(function (a, b) { return a.x - b.x; }); });
  return lines;
}
function akteText(l, from, to) {
  var out = '', end = null;
  l.items.forEach(function (i) {
    if (i.x < from || i.x >= to) return;
    if (end !== null && i.x - end > 1.2) out += ' ';
    out += String(i.str).replace(/﻿|​/g, ''); end = i.x + i.w;
  });
  return out.replace(/\s+/g, ' ').trim();
}
function parseAkte(pages) {
  var res = { titel: '', geb: '', kasse: '', erwartet: null, stamm: [], eintraege: [], druck: '', warn: [] };
  var all = [];
  pages.forEach(function (items, pi) {
    akteGroupLines(items).forEach(function (l) {
      var t = akteText(l, -1e9, 1e9);
      if (l.y > 785) { if (!res.titel && t) res.titel = t; return; }
      if (l.y < 45) { var dm = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})$/.exec(t); if (dm) res.druck = dm[1]; return; }
      l.page = pi; l.text = t; all.push(l);
    });
  });
  var i = 0, n = all.length, hdr;
  for (; i < n; i++) {
    var t = all[i].text, m;
    if ((m = /^Patient:\s*(.+)$/.exec(t))) res.patientName = m[1];
    else if ((m = /^Geb\.\s*(\d{2}\.\d{2}\.\d{4})(?:\s*\(([^)]*)\))?/.exec(t))) { res.geb = m[1]; res.kasse = m[2] || ''; }
    else if ((m = /^Inhalt:\s*(.*)$/.exec(t))) {
      var e = {}, re = /(\d+)\s+(Dokumentationen|Medikamente|Rechnungen|Termine|Dateien)/g, mm;
      while ((mm = re.exec(m[1]))) e[mm[2]] = +mm[1];
      res.erwartet = e;
    }
    else if (t === 'Stammdaten') { hdr = i + 1; break; }
  }
  /* Stammdaten-Tabelle: Spalten aus der Kopfzeile */
  var ak = -1; for (var k = i; k < n; k++) if (all[k].text === 'Akteneinträge') { ak = k; break; }
  if (hdr !== undefined && ak > hdr) {
    var hl = all[hdr], xv = 1e9, xd = 1e9;
    hl.items.forEach(function (it) { if (/^Inhalt/.test(it.str)) xv = it.x; if (/^Erstellt/.test(it.str)) xd = it.x; });
    var cur = null;
    for (var r = hdr + 1; r < ak; r++) {
      var ln = all[r], lab = akteText(ln, -1e9, xv - 2), val = akteText(ln, xv - 2, xd - 2), dat = akteText(ln, xd - 2, 1e9);
      var dm2 = /\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.exec(dat); if (dm2 && cur && !cur.erstellt) cur.erstellt = dm2[0];
      if (lab && val) { cur = { label: lab, value: val, erstellt: dm2 ? dm2[0] : '' }; res.stamm.push(cur); }
      else if (lab && !val) { if (cur) cur.label += ' ' + lab; else { cur = { label: lab, value: '', erstellt: '' }; res.stamm.push(cur); } }
      else if (!lab && val) { if (cur) cur.value += '\n' + val; }
    }
    res.stamm.forEach(function (s) { s.label = s.label.replace(/\s*\*\s*$/, '').trim(); });
  }
  /* Akteneinträge */
  var ent = null, prevY = null, prevPage = -1;
  for (var q = ak + 1; q < n; q++) {
    var L = all[q], first = L.items[0], txt = L.text;
    var isMeta = /^(Erstellt|Geändert) am \d{4}-/.test(txt) && first.x > 300;
    var isHead = first.x < 58 && !isMeta;
    if (isHead) {
      var dm3 = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2})\s*$/.exec(txt);
      if (!dm3) { res.warn.push('Kopfzeile ohne Datum: ' + txt.slice(0, 60)); if (ent) ent.body.push(txt); continue; }
      var head = txt.slice(0, dm3.index).replace(/Erstellt am\s*$/, '').trim(), am = /^(Nachricht \(E-Mail\)|[^\s\[]+)\s*(?:\[([^\]]*)\])?\s*(.*)$/.exec(head);
      ent = { typ: am[1].trim(), autor: am[2] || '', titel: (am[3] || '').trim(), datum: dm3[1], body: [] };
      res.eintraege.push(ent); prevY = null; continue;
    }
    if (isMeta || !ent) continue;
    if (prevY !== null && L.page === prevPage && prevY - L.y > 15) ent.body.push('');
    ent.body.push(txt); prevY = L.y; prevPage = L.page;
  }
  res.eintraege.forEach(function (e) { while (e.body.length && e.body[e.body.length - 1] === '') e.body.pop(); });
  return res;
}

/* Baut aus der gelesenen Akte und den Dateien der ZIP einen Patienten, seine Termine und Anhänge.
   dep: { tsParse, katGuess }. files: [{ id, name, blob }] (id = Nummer vor dem Dateinamen). */
function akteNorm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9äöüß]+/g, ''); }
function akteBuild(P, files, dep) {
  var rep = [], tn = String(P.titel || '').split(','), nach = (tn[0] || '').trim(), vor = tn.slice(1).join(',').trim();
  if (!nach || !vor) { var pn = String(P.patientName || '').trim().split(/\s+/); if (pn.length >= 2) { vor = vor || pn.slice(0, -1).join(' '); nach = nach || pn[pn.length - 1]; } }
  if (!nach || !vor) return { fehler: 'Name nicht erkennbar' };
  var p = { anrede: '', vorname: vor, nachname: nach, dob: P.geb || '', phone: '', email: '', adresse: '', allergien: '', notizen: '', medikation: [], doku: [], log: [], bilder: [], dokumente: [] };
  var notes = [], earliest = '';
  P.stamm.forEach(function (s) {
    var l = s.label.toLowerCase(), v = String(s.value || '').trim();
    if (s.erstellt && (!earliest || s.erstellt < earliest)) earliest = s.erstellt;
    if (!v || v === '-') return;
    if (l === 'adresse') p.adresse = v;
    else if (/^e-?mail/.test(l)) p.email = v;
    else if (/^telefon|handy/.test(l)) p.phone = p.phone || v;
    else if (l === 'geschlecht') p.anrede = /männ/i.test(v) ? 'Herr' : /weib/i.test(v) ? 'Frau' : /divers/i.test(v) ? 'Divers' : '';
    else if (/^allerg/.test(l)) p.allergien = v;
    else notes.push(s.label + ': ' + v.replace(/\n/g, ', '));
  });
  if (P.kasse && !notes.some(function (x) { return /^Krankenversicherung/.test(x); })) notes.push('Krankenversicherung: ' + P.kasse);
  p.notizen = notes.join('\n');
  var firstEntry = '';
  P.eintraege.forEach(function (e) { if (!firstEntry || e.datum < firstEntry) firstEntry = e.datum; });
  p.erstellt = dep.tsParse(earliest || firstEntry || '');
  var termine = [], verl = [], dat = [], clean = function (a) { return a.join('\n').replace(/\n{3,}/g, '\n\n').trim(); };
  var seenMed = {};
  P.eintraege.slice().reverse().forEach(function (e) {
    var body = clean(e.body), one = e.body.join(' ').replace(/\s+/g, ' ').trim();
    if (e.typ === 'Termin') {
      var b = one.replace(/^.*?\)\s*:\s*\[[^\]]*\]\s*/, ''), nz = '';
      if (b === one) b = one.replace(/^.*\[[^\]]*\]\s*/, '') === one ? '' : one.replace(/^.*\[[^\]]*\]\s*/, '');
      var m = /^(.*?)\s*-?\s*\((.*)\)\s*$/.exec(b); if (m && (m[1] === '' || / - \(/.test(b) || /^\(/.test(b))) { b = m[1].replace(/\s*-\s*$/, ''); nz = m[2]; }
      termine.push({ datum: e.datum, behandlung: b.trim(), notiz: nz.trim(), verl: [] });
    } else if (e.typ === 'Verlauf') verl.push({ datum: e.datum, text: ((e.titel ? e.titel + '\n' : '') + body).trim() });
    else if (e.typ === 'Datei') dat.push({ datum: e.datum, name: one.replace(/\s*\((?:Bild|PDF|Datei|Dokument)\)\s*$/i, '').trim() });
    else if (e.typ === 'Medikament') {
      var nm = e.body.filter(function (x) { return x && !/^\d+([.,]\d+)?$/.test(x); }).join(' ').trim();
      if (nm) { if (!seenMed[nm.toLowerCase()]) { seenMed[nm.toLowerCase()] = 1; p.medikation.push(nm); } p.log.push({ ts: dep.tsParse(e.datum), type: 'med', text: nm }); }
    } else if (e.typ === 'Rezept') {
      var lines = [], names = [], q = null;
      for (var i = 0; i < e.body.length; i++) { var x = e.body[i]; if (/^Verknüpfte Dateien/.test(x)) break; if (!x) continue; if (/^\d+([.,]\d+)?$/.test(x)) { if (names.length) lines[names.length - 1] = names[names.length - 1] + ' (Menge ' + x + ')'; } else { names.push(x); lines.push(x); } }
      p.log.push({ ts: dep.tsParse(e.datum), type: 'notiz', text: 'Rezept (Altsystem)\n' + lines.join('\n') });
    } else if (e.typ === 'Rechnung') p.log.push({ ts: dep.tsParse(e.datum), type: 'notiz', text: 'Rechnung (Altsystem)\n' + body });
    else if (/^Nachricht/.test(e.typ)) p.log.push({ ts: dep.tsParse(e.datum), type: 'mail', text: ('E-Mail (Altsystem)\n' + body).slice(0, 4000) });
    else if (e.typ === 'Infoskop') { /* nur Verweis auf Dateien, die schon als Datei geführt werden */ }
    else p.log.push({ ts: dep.tsParse(e.datum), type: 'notiz', text: e.typ + (e.titel ? ' ' + e.titel : '') + '\n' + body });
  });
  /* Termine: gleiche Tagesdokumentation zuordnen, wenn an dem Tag genau ein Termin liegt */
  var byDay = {}; termine.forEach(function (t, i) { (byDay[t.datum.slice(0, 10)] = byDay[t.datum.slice(0, 10)] || []).push(i); });
  var events = termine.map(function (t) { return { date: t.datum.slice(0, 10), time: t.datum.slice(11, 16), dur: 60, behandlung: t.behandlung || 'Beratung', notiz: t.notiz, color: '#16a34a', alt: true }; });
  verl.forEach(function (v) {
    var d = byDay[v.datum.slice(0, 10)];
    if (d && d.length === 1) { termine[d[0]].verl.push(v); } else p.doku.push({ ts: dep.tsParse(v.datum), text: v.text });
  });
  termine.forEach(function (t, i) {
    if (!t.verl.length) return;
    var txt = t.verl.map(function (v) { return v.text; }).join('\n\n');
    events[i].doku = txt; events[i].dok = { anamnese: '', befund: '', behandlung: txt, verw: {}, leist: '', produkte: '', ausblick: '' };
  });
  /* Dateien den Einträgen zuordnen */
  var list = files.map(function (f) { return { id: f.id, name: f.name, blob: f.blob, key: akteNorm(f.name), used: false }; }).sort(function (a, b) { return a.id - b.id; });
  var akteKey = akteNorm(P.titel + '.pdf'), akteCopies = list.filter(function (f) { return f.key === akteKey; });
  var rest = list.filter(function (f) { return f.key !== akteKey; });
  var atts = [];
  var attach = function (f, ts, nameOverride) {
    var isImg = /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(f.name), t = ts, day = new Date(t), dk = day.getFullYear() + '-' + ('0' + (day.getMonth() + 1)).slice(-2) + '-' + ('0' + day.getDate()).slice(-2);
    var zi = byDay[dk] && byDay[dk].length === 1 ? byDay[dk][0] : -1;
    atts.push({ name: nameOverride || f.name, blob: f.blob, ts: t, kind: isImg ? 'bild' : 'dok', kat: isImg ? '' : dep.katGuess(f.name), zuIdx: zi });
  };
  dat.forEach(function (d) {
    var k = akteNorm(d.name), f = rest.filter(function (x) { return !x.used && x.key === k; })[0];
    if (!f) { rep.push('Datei fehlt im ZIP: ' + d.name); return; }
    f.used = true; attach(f, dep.tsParse(d.datum));
  });
  rest.forEach(function (f) {
    if (f.used) return;
    var m = /(\d{4})(\d{2})(\d{2})[_-]?(\d{2})?(\d{2})?/.exec(f.name), ts = m ? dep.tsParse(m[1] + '-' + m[2] + '-' + m[3] + ' ' + (m[4] || '12') + ':' + (m[5] || '00')) : p.erstellt;
    rep.push('Datei ohne Eintrag in der Akte: ' + f.name); attach(f, ts);
  });
  if (akteCopies.length) { var newest = akteCopies[akteCopies.length - 1]; atts.push({ name: 'Altakte (Altsystem).pdf', blob: newest.blob, ts: dep.tsParse(P.druck || ''), kind: 'dok', kat: 'Sonstiges', zuIdx: -1 }); }
  /* Plausibilität gegen die Zusammenfassung in der Akte */
  var ex = P.erwartet || {}, cnt = { Dokumentationen: 0, Medikamente: 0, Rechnungen: 0, Termine: 0, Dateien: 0 };
  P.eintraege.forEach(function (e) { if (e.typ === 'Verlauf' || e.typ === 'Rezept' || e.typ === 'Infoskop') cnt.Dokumentationen++; else if (e.typ === 'Medikament') cnt.Medikamente++; else if (e.typ === 'Rechnung') cnt.Rechnungen++; else if (e.typ === 'Termin') cnt.Termine++; else if (e.typ === 'Datei') cnt.Dateien++; });
  Object.keys(cnt).forEach(function (k) { if (ex[k] !== undefined && ex[k] !== cnt[k]) rep.push('Zahl stimmt nicht überein: ' + k + ' laut Akte ' + ex[k] + ', gelesen ' + cnt[k]); });
  return { patient: p, events: events, atts: atts, report: rep.concat(P.warn || []) };
}
/*PARSER-END*/
