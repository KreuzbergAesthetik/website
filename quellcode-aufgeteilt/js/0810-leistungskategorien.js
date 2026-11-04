/* ===== Leistungskategorien (mit Farbe) ===== */
var DEF_LKATS = [['Botox', '#7c3aed'], ['Hyaluron', '#2563eb'], ['Dermalästhetika', '#0d9488'], ['Lipolyse', '#ea580c'], ['Microneedling', '#db2777'], ['Peeling', '#ca8a04'], ['Sonstiges', '#64748b']];
function katGuessLeist(name) {
  var n = String(name || '').toLowerCase();
  var rules = [['Botox', /neuromodul|botox|botul|tox|hyperhidrosis|bruxismus|masseter|jawline|platysma|nefertiti|zone/], ['Lipolyse', /lipolyse|fett-weg|aqualyx|lemonbottle|pb-serum/], ['Microneedling', /needling|exosom|prp|prf|nctf|mesotherapie/], ['Peeling', /peeling|prx|retinol|rotlicht|led/], ['Hyaluron', /hyaluron filler|filler|lip-flip|lippen|restylane|juvederm|belotero|teosyal/], ['Dermalästhetika', /polynukleotid|profhilo|caha|radiesse|plla|sculptra|ellans|ultracol|hylase|skinbooster|biostim/]];
  var n2 = n.replace(/[\s-]/g, '');
  for (var i = 0; i < rules.length; i++) if (rules[i][1].test(n) || rules[i][1].test(n2)) return rules[i][0];
  return 'Sonstiges';
}
function ensureLKats() {
  if (!Array.isArray(settings.leistKats) || !settings.leistKats.length) {
    settings.leistKats = DEF_LKATS.map(function (k) { return { id: newId(), name: k[0], color: k[1] }; });
    (settings.katalog || []).forEach(function (l) { if (!l.kat) { var g = settings.leistKats.filter(function (c) { return c.name === katGuessLeist(l.name); })[0]; if (g) l.kat = g.id; } });
    persist();
  }
  return settings.leistKats;
}
function lkatOf(l) { ensureLKats(); return settings.leistKats.filter(function (c) { return c.id === (l && l.kat); })[0] || null; }
/* Kategorie zu einem Text: Leistung aus der Liste, sonst Kategoriename oder Stichwort (z. B. Betreff "Botox") */
function lkatForText(t) {
  t = String(t || '').trim(); if (!t) return null;
  var l = findKat(t), c = l ? lkatOf(l) : null; if (c) return c;
  var ks = ensureLKats(), kn = ks.filter(function (k) { return k.name.toLowerCase() === t.toLowerCase(); })[0]; if (kn) return kn;
  /* Betreff enthält den Namen einer Leistung aus der Liste (längster Treffer gewinnt) */
  var tl = t.toLowerCase(), best = null;
  (settings.katalog || []).forEach(function (k) { var n = String(k.name || '').trim().toLowerCase(); if (n.length >= 4 && tl.indexOf(n) >= 0 && (!best || n.length > best.name.length)) best = { name: n, k: k }; });
  if (best) { var bc = lkatOf(best.k); if (bc) return bc; }
  var g = katGuessLeist(l ? l.name : t); if (g === 'Sonstiges' && !l) return null;
  return ks.filter(function (k) { return k.name === g; })[0] || null;
}
function lkatColorFor(leistung) { var c = lkatForText(leistung); return c ? c.color : null; }
/* Anzeigefarbe eines Termins: Farbe der Kategorie hat Vorrang, sonst die gespeicherte Farbe */
function evColor(e) { var ls = evLeistungen(e).concat(e.behandlung ? [e.behandlung] : []), c = null; for (var i = 0; i < ls.length && !c; i++) c = lkatColorFor(ls[i]); return c || e.color || ''; }
var lsIdx = -1;
var lkIdx = -1;
function renderLKats() {
  renderRabatte();
  var box = document.getElementById('lk-box'); if (!box) return; box.innerHTML = '';
  var head = mk('div'); head.style.cssText = 'display:flex; justify-content:space-between; align-items:baseline; gap:8px; margin-bottom:8px; flex-wrap:wrap;';
  head.appendChild(mk('div', 'hm-sec', 'Kategorien und Farben'));
  var rc = mk('button', '', 'Termine neu einfärben'); rc.type = 'button'; rc.onclick = recolorEvents; rc.style.cssText = 'border:none; background:none; color:#64748b; font-size:12.5px; text-decoration:underline; cursor:pointer; padding:2px 0;'; head.appendChild(rc);
  box.appendChild(head);
  var row = mk('div'); row.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px;';
  var chip = 'display:inline-flex; align-items:center; gap:7px; background:#fff; border:1px solid #cbd5e1; border-radius:16px; padding:3px 11px; font-size:13px; cursor:pointer; color:#0f172a; min-height:28px;';
  ensureLKats().forEach(function (c, i) {
    var n = (settings.katalog || []).filter(function (l) { return l.kat === c.id; }).length;
    var b = mk('button'); b.type = 'button'; b.onclick = function () { openLKat(i); }; b.style.cssText = chip;
    var d = mk('span'); d.style.cssText = 'width:10px; height:10px; border-radius:50%; background:' + c.color + '; flex:none;'; b.appendChild(d);
    b.appendChild(document.createTextNode(c.name + ' ' + n)); row.appendChild(b);
  });
  var nb = mk('button', '', '+ Kategorie'); nb.type = 'button'; nb.onclick = function () { openLKat(-1); }; nb.style.cssText = chip + 'border-style:dashed; color:#64748b; background:none;'; row.appendChild(nb);
  box.appendChild(row);
}
function openLKat(i) {
  lkIdx = i; var c = i >= 0 ? settings.leistKats[i] : null;
  document.getElementById('lk-title').textContent = c ? 'Kategorie bearbeiten' : 'Neue Kategorie';
  document.getElementById('lk-name').value = c ? c.name : ''; document.getElementById('lk-color').value = c ? c.color : '#2563eb';
  document.getElementById('lk-del').style.display = c ? '' : 'none'; openModal('modal-lkat');
}
function saveLKat() {
  var n = document.getElementById('lk-name').value.trim(); if (!n) { alert('Bitte einen Namen eingeben.'); return; }
  if (settings.leistKats.some(function (c, j) { return j !== lkIdx && c.name.toLowerCase() === n.toLowerCase(); })) { alert('Eine Kategorie mit diesem Namen gibt es schon.'); return; }
  var col = document.getElementById('lk-color').value;
  if (lkIdx >= 0) { settings.leistKats[lkIdx].name = n; settings.leistKats[lkIdx].color = col; } else settings.leistKats.push({ id: newId(), name: n, color: col });
  persist(); closeModal('modal-lkat'); renderLKats(); renderLeist(); if (document.getElementById('tab-kalender').classList.contains('active')) renderCal();
}
async function deleteLKat() {
  var c = settings.leistKats[lkIdx]; if (!c) return;
  var n = (settings.katalog || []).filter(function (l) { return l.kat === c.id; }).length;
  if (!await kaConfirm('Kategorie „' + c.name + '“ löschen?' + (n ? ' ' + n + ' Leistung(en) haben dann keine Kategorie.' : ''))) return;
  (settings.katalog || []).forEach(function (l) { if (l.kat === c.id) delete l.kat; });
  settings.leistKats.splice(lkIdx, 1); persist(); closeModal('modal-lkat'); renderLKats(); renderLeist();
}
async function recolorEvents() {
  var n = 0; events.forEach(function (e) { var c = evKats(e)[0]; if (c && e.color !== c.color) n++; });
  if (!n) { alert('Alle Termine mit einer Leistung haben schon die Farbe ihrer Kategorie.'); return; }
  if (!await kaConfirm(n + ' Termin(e) auf die Farbe ihrer Kategorie setzen? Von Hand gewählte Farben werden dabei überschrieben.')) return;
  events.forEach(function (e) { var c = evKats(e)[0]; if (c) e.color = c.color; });
  persist(); alert(n + ' Termin(e) umgefärbt.'); if (document.getElementById('tab-kalender').classList.contains('active')) renderCal();
}
/* Termin mit mehreren Leistungen: die erste führt (Farbe), alle Kategorien sind im Kalender sichtbar */
var tLeist = [];
function evLeistungen(e) { return Array.isArray(e.leistungen) && e.leistungen.length ? e.leistungen : (e.leistung ? [e.leistung] : []); }
function evKats(e) { var out = []; var ls = evLeistungen(e); if (!ls.length && e.behandlung) ls = [e.behandlung]; ls.forEach(function (n) { var c = lkatForText(n); if (c && out.indexOf(c) < 0) out.push(c); }); if (!out.length && e.behandlung) { var cb = lkatForText(e.behandlung); if (cb) out.push(cb); } return out; }
function renderTLeist() {
  var box = document.getElementById('t-lchips'); if (!box) return; box.innerHTML = '';
  tLeist.forEach(function (n, i) {
    var l = findKat(n), c = l ? lkatOf(l) : null, col = c ? c.color : '#94a3b8';
    var ch = mk('span'); ch.style.cssText = 'display:inline-flex; align-items:center; gap:6px; background:#fff; border:1.5px solid ' + col + '; border-radius:16px; padding:3px 4px 3px 10px; font-size:13px;';
    var d = mk('i'); d.style.cssText = 'width:9px; height:9px; border-radius:50%; background:' + col + '; flex:none;'; ch.appendChild(d);
    var t = mk('span', '', n + (i === 0 && tLeist.length > 1 ? ' ★' : '')); t.title = i === 0 ? 'Führende Leistung (bestimmt die Farbe)' : 'Tippen: als führend setzen'; if (i > 0) { t.style.cursor = 'pointer'; t.onclick = function () { var pv = tLeist[0]; tLeist.unshift(tLeist.splice(i, 1)[0]); syncBetreff(pv); renderTLeist(); terminKatColor(); }; } ch.appendChild(t);
    var x = mk('button', '', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Leistung entfernen'); x.style.cssText = 'border:none; background:none; color:#64748b; font-size:16px; line-height:1; cursor:pointer; padding:0 6px;'; x.onclick = function () { var pv = tLeist[0]; tLeist.splice(i, 1); syncBetreff(pv); renderTLeist(); terminKatColor(); }; ch.appendChild(x);
    box.appendChild(ch);
  });
}
function syncBetreff() {}
function tLeistAdd(v) {
  v = String(v || '').trim(); var inp = document.getElementById('t-leistung'); if (!v) return;
  var k = findKat(v); if (k) v = k.name;
  if (tLeist.indexOf(v) < 0) tLeist.push(v);
  inp.value = '';
  renderTLeist(); terminKatColor();
  if (tLeist.length === 1 && !editId && k && k.dauer) { tDur = k.dauer; shiftEnd(); }
}
function terminKatColor() {
  var c = lkatColorFor(tLeist[0] || document.getElementById('t-leistung').value); if (c) document.getElementById('t-farbe').value = c;
  tmSub();
}
function calLegend() {
  var box = document.getElementById('cal-legend'); if (!box) return; box.innerHTML = '';
  var kats = ensureLKats(); if (!kats.length) return;
  kats.forEach(function (c) { var s = mk('span'); s.style.cssText = 'display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#475569; margin-right:12px;'; var d = mk('i'); d.style.cssText = 'width:10px; height:10px; border-radius:3px; background:' + c.color + '; display:inline-block;'; s.appendChild(d); s.appendChild(document.createTextNode(c.name)); box.appendChild(s); });
}
var lsPage = 1, lsSort = { k: 'name', dir: 1 };
function lsEnsureIds() { var m = 0, l = settings.katalog || []; l.forEach(function (k) { if (k.id > m) m = k.id; }); l.forEach(function (k) { if (!k.id) k.id = ++m; }); }
function lsSortBy(k) { if (lsSort.k === k) lsSort.dir = -lsSort.dir; else { lsSort.k = k; lsSort.dir = 1; } renderLeist(); }
function lsRow(k) { return k; }
function renderLeist() {
  var tb = document.getElementById('ls-table'); if (!tb) return;
  tb.innerHTML = ''; renderLKats(); lsEnsureIds();
  var fs = document.getElementById('ls-fkat'), fv = fs.value; fs.innerHTML = ''; var o0 = mk('option', '', 'Alle Gruppen'); o0.value = ''; fs.appendChild(o0);
  ensureLKats().forEach(function (c) { var o = mk('option', '', c.name); o.value = c.id; fs.appendChild(o); }); fs.value = fv;
  var q = (document.getElementById('ls-filter').value || '').trim().toLowerCase(), all = settings.katalog || [];
  document.getElementById('ls-empty').style.display = all.length ? 'none' : 'block';
  var list = all.filter(function (k) { return (!q || k.name.toLowerCase().indexOf(q) >= 0) && (!fs.value || k.kat === fs.value); });
  var key = { id: function (k) { return k.id; }, name: function (k) { return k.name.toLowerCase(); }, kat: function (k) { var c = lkatOf(k); return c ? c.name.toLowerCase() : 'zzz'; }, price: function (k) { return k.price; }, dauer: function (k) { return k.dauer || 0; } }[lsSort.k];
  list.sort(function (a, b) { var x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * lsSort.dir; });
  var per = parseInt(document.getElementById('ls-per').value, 10) || list.length || 1, pages = Math.max(1, Math.ceil(list.length / per)); if (lsPage > pages) lsPage = pages;
  list.slice((lsPage - 1) * per, lsPage * per).forEach(function (k) {
    var i = all.indexOf(k), row = tb.insertRow(), c = [0, 1, 2, 3, 4, 5].map(function () { return row.insertCell(); });
    c[0].textContent = k.id; c[0].style.color = '#64748b';
    var b = mk('button', 'pn', k.name); b.type = 'button'; b.onclick = function () { openLeist(i); }; c[1].appendChild(b);
    c[2].style.whiteSpace = 'nowrap'; var kc = lkatOf(k); if (kc) { var dt = mk('span'); dt.style.cssText = 'display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:8px; background:' + kc.color + ';'; c[2].appendChild(dt); var gn = mk('span', 'ls-gn', kc.name); c[2].appendChild(gn); } else c[2].textContent = '-';
    c[3].textContent = eur(k.price); c[4].textContent = k.rate + ' %'; c[5].textContent = k.dauer ? k.dauer + ' min' : '-';
  });
  if (all.length && !list.length) { var er = tb.insertRow(), ec = er.insertCell(); ec.colSpan = 6; ec.textContent = 'Keine Leistung gefunden'; ec.style.color = '#94a3b8'; }
  var pg = document.getElementById('ls-pager'); pg.innerHTML = ''; pg.style.display = pages > 1 ? 'inline-flex' : 'none';
  for (var p = 1; p <= pages; p++) (function (p) { var b = mk('button', '', String(p)); b.type = 'button'; b.className = p === lsPage ? 'on' : ''; b.onclick = function () { lsPage = p; renderLeist(); }; pg.appendChild(b); })(p);
}
var LS_I = { copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>', pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>' };
function lsAct(k, title, fn, cls) { var b = mk('button', 'tv-ib' + (cls ? ' ' + cls : '')); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.style.cssText = 'width:32px; height:30px; margin-right:4px;' + (cls === 'del' ? 'border-color:transparent; background:none; color:#dc2626;' : ''); b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;">' + LS_I[k] + '</svg>'; b.onclick = fn; return b; }
function lsCopy(i) { var k = settings.katalog[i]; if (!k) return; var n = Object.assign({}, k, { id: 0, name: k.name + ' (Kopie)', vorlagen: (k.vorlagen || []).slice() }); settings.katalog.push(n); lsEnsureIds(); persist(); refreshLeistungen(); renderLeist(); }
async function lsDelete(i) { var k = settings.katalog[i]; if (!k || !await kaConfirm('Leistung "' + k.name + '" löschen? Bestehende Rechnungen bleiben unverändert.')) return; settings.katalog.splice(i, 1); persist(); refreshLeistungen(); renderLeist(); }
function lsExport() {
  var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
  var rows = [['ID', 'Leistung', 'Gruppe', 'Preis brutto', 'MwSt', 'Dauer (min)'].map(q).join(';')].concat((settings.katalog || []).map(function (k) { var c = lkatOf(k); return [k.id, k.name, c ? c.name : '', String(k.price).replace('.', ','), k.rate, k.dauer || ''].map(q).join(';'); }));
  var blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Leistungen.csv'; document.body.appendChild(a); a.click(); a.remove();
}
function openLeist(i) {
  lsIdx = i; var k = i >= 0 ? settings.katalog[i] : null;
  document.getElementById('ls-title').textContent = k ? 'Leistung bearbeiten' : 'Neue Leistung';
  document.getElementById('ls-name').value = k ? k.name : '';
  document.getElementById('ls-price').value = k ? nf(k.price) : '';
  document.getElementById('ls-rate').value = k ? String(k.rate) : '19';
  var ks = document.getElementById('ls-kat'); ks.innerHTML = ''; var o0 = mk('option', '', 'Keine Kategorie'); o0.value = ''; ks.appendChild(o0);
  ensureLKats().forEach(function (c) { var o = mk('option', '', c.name); o.value = c.id; ks.appendChild(o); });
  ks.value = k ? (k.kat || '') : ''; document.getElementById('ls-dauer').value = k && k.dauer ? k.dauer : '';
  document.getElementById('ls-del').style.display = k ? '' : 'none'; document.getElementById('ls-cp').style.display = k ? 'inline-block' : 'none';
  var vb = document.getElementById('ls-vorl'); vb.innerHTML = '';
  if (!templates.length) vb.appendChild(mk('div', 'hm-empty', 'Noch keine Vorlagen hochgeladen.'));
  templates.forEach(function (t) {
    var l = document.createElement('label'); l.className = 'tm-chk'; l.style.fontWeight = '400';
    var cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = t.id; cb.checked = !!(k && (k.vorlagen || []).indexOf(t.id) >= 0);
    l.appendChild(cb); l.appendChild(document.createTextNode(' ' + t.name + ' (' + katOf(t) + ')')); vb.appendChild(l);
  });
  openModal('modal-leist');
}
function saveLeist() {
  var name = document.getElementById('ls-name').value.trim(), price = r2(numIn(document.getElementById('ls-price').value)), rate = parseInt(document.getElementById('ls-rate').value, 10);
  if (!name) { alert('Bitte eine Bezeichnung eingeben.'); return; }
  if (price <= 0) { alert('Bitte einen Preis größer als 0 eingeben.'); return; }
  if (settings.katalog.some(function (k, j) { return j !== lsIdx && k.name.trim().toLowerCase() === name.toLowerCase(); })) { alert('Eine Leistung mit dieser Bezeichnung gibt es schon.'); return; }
  var k = { name: name, price: price, rate: rate, kat: document.getElementById('ls-kat').value || (function () { var g = katGuessLeist(name), c = ensureLKats().filter(function (x) { return x.name === g; })[0]; return c ? c.id : undefined; })(), dauer: parseInt(document.getElementById('ls-dauer').value, 10) || undefined, id: lsIdx >= 0 ? settings.katalog[lsIdx].id : 0, vorlagen: [].slice.call(document.querySelectorAll('#ls-vorl input:checked')).map(function (c) { return c.value; }) };
  if (lsIdx >= 0) settings.katalog[lsIdx] = k; else settings.katalog.push(k);
  lsEnsureIds(); persist(); refreshLeistungen(); renderLeist(); closeModal('modal-leist');
}
async function deleteLeist() {
  if (lsIdx < 0 || !await kaConfirm('Leistung "' + settings.katalog[lsIdx].name + '" löschen? Bestehende Rechnungen bleiben unverändert.')) return;
  settings.katalog.splice(lsIdx, 1);
  persist(); refreshLeistungen(); renderLeist(); closeModal('modal-leist');
}
function openSettings() {
  var m = { 's-steuernr': 'steuernr', 's-ustid': 'ustid', 's-inhaber': 'inhaber', 's-bank': 'bank', 's-bic': 'bic', 's-iban': 'iban', 's-paypal': 'paypal', 's-hinweis': 'hinweis', 's-zahlung': 'zahlung', 's-ustva': 'ustva', 's-ziel': 'zahlungsziel', 's-mailurl': 'mailUrl', 's-mailtoken': 'mailToken' };
  Object.keys(m).forEach(function (id) { document.getElementById(id).value = settings[m[id]] || ''; });
  document.getElementById('s-remdays').value = settings.remDays == null ? '' : settings.remDays;
  if (!settings.ustva) document.getElementById('s-ustva').value = 'quartal'; if (!settings.zahlungsziel) document.getElementById('s-ziel').value = '14';
  alUi();
}
function saveSettings() {
  var m = { 's-steuernr': 'steuernr', 's-ustid': 'ustid', 's-inhaber': 'inhaber', 's-bank': 'bank', 's-bic': 'bic', 's-iban': 'iban', 's-paypal': 'paypal', 's-hinweis': 'hinweis', 's-zahlung': 'zahlung', 's-ustva': 'ustva', 's-ziel': 'zahlungsziel', 's-mailurl': 'mailUrl', 's-mailtoken': 'mailToken' };
  Object.keys(m).forEach(function (id) { settings[m[id]] = document.getElementById(id).value.trim(); });
  var rd = document.getElementById('s-remdays').value.trim();
  if (/^\d{1,2}$/.test(rd)) settings.remDays = Math.min(30, +rd); else delete settings.remDays;
  persist(); refreshLeistungen();
  var sb = document.getElementById('s-save'); if (sb) { sb.textContent = 'Gespeichert ✓'; setTimeout(function () { sb.textContent = 'Speichern'; }, 1800); }
}
var invPayArt = '', invPayAuto = true;
function setInvPay(art) {
  invPayArt = art;
  [].forEach.call(document.querySelectorAll('#inv-payseg button'), function (b) { b.className = b.getAttribute('data-art') === art ? 'on' : ''; });
  document.getElementById('inv-paybox').style.display = art ? 'grid' : 'none';
  if (art) { if (!document.getElementById('inv-paydatum').value) document.getElementById('inv-paydatum').value = document.getElementById('inv-datum').value || iso(new Date()); invPayAuto = true; syncInvPay(); }
}
function syncInvPay() { if (invPayArt && invPayAuto) document.getElementById('inv-paybetrag').value = nf(invTotal()); }
function updZeroInfo() {
  var z = invRows.some(function (r) { return String(r.rate) === '0'; }), el = document.getElementById('inv-0info');
  el.style.display = z ? 'block' : 'none';
  if (z) el.textContent = settings.hinweis ? 'Bei 0 % wird automatisch dieser Hinweis in die Rechnung eingefügt: ' + settings.hinweis : 'Bei 0 % fehlt noch der Standardhinweis. Trage ihn im Menü Praxis unter Praxisdaten ein, sonst steht kein Hinweis in der Rechnung.';
}
function nextPayNr(date) {
  var yr = String(date).slice(0, 4), seq = 0;
  invoices.forEach(function (i) { (i.payments || []).forEach(function (p) { var m = /^B(\d{4})-(\d+)$/.exec(p.nr); if (m && m[1] === yr) seq = Math.max(seq, parseInt(m[2], 10)); }); });
  return 'B' + yr + '-' + String(seq + 1).padStart(5, '0');
}
function newRow(type) { return type === 'rabatt' ? { type: 'rabatt', text: 'Rabatt', pct: '', rate: '19' } : { type: 'pos', text: '', qty: '1', price: '', rate: '19', datum: '', note: '', rab: '', rabText: 'Rabatt' }; }
var invEdit = null, invMode = 'rechnung', invTab = 'rechnung', invKeepMode = false;
var DRAFT = { kv: { name: 'Kostenvoranschlag', kopf: 'KOSTENVORANSCHLAG', datei: 'Kostenvoranschlag', neu: 'Kostenvoranschlag erstellen', liste: 'Kostenvoranschläge' }, test: { name: 'Test-Rechnung', kopf: 'RECHNUNG', datei: 'Test-Rechnung', neu: 'Test-Rechnung erstellen', liste: 'Test-Rechnungen' } };
function invCur() { return invoices.concat(entw).filter(function (i) { return i.id === viewInvId; })[0]; }
function invIsDraft(inv) { return !!(inv && inv.kind); }
function invEditUi(on) {
  var dr = DRAFT[invMode], nm = dr ? dr.name : 'Rechnung';
  var kindSelect = document.getElementById('inv-document-kind');
  kindSelect.innerHTML = invMode === 'test' ? '<option value="test">Test-Rechnung</option>' : '<option value="rechnung">Rechnung</option><option value="kv">Kostenvoranschlag (KV)</option>';
  kindSelect.value = invMode; kindSelect.disabled = !!on || invMode === 'test';
  document.getElementById('inv-title').textContent = on ? nm + ' bearbeiten' : dr ? dr.neu : 'Rechnung erstellen';
  document.getElementById('inv-savebtn').textContent = on ? 'Speichern' : dr ? nm + ' erstellen' : 'Rechnung erstellen';
  var hidePay = on || !!dr;
  ['inv-payh', 'inv-payseg', 'inv-paybox'].forEach(function (id) { var e = document.getElementById(id); if (e) e.style.display = hidePay ? 'none' : (id === 'inv-paybox' ? (invPayArt ? 'grid' : 'none') : ''); });
  var zw = document.getElementById('iv-zahlwrap'); if (zw) zw.style.display = dr ? 'none' : '';
}
/* Bestehende Rechnung ändern: Nummer und Zahlungen bleiben erhalten */
function editInvoice() {
  var inv = invCur(); if (!inv) return;
  var p = patients.filter(function (x) { return x.id === inv.pid; })[0]; if (!p) { alert('Der Patient zu dieser Rechnung wurde nicht gefunden.'); return; }
  closeModal('modal-invview'); invMode = inv.kind || 'rechnung'; invKeepMode = true; openInvoice(p); invEdit = inv; invEditUi(true); fillInvForm(inv);
}
function fillInvForm(inv) {
  var g = function (id) { return document.getElementById(id); };
  g('inv-adresse').value = inv.adresse || ''; g('inv-datum').value = inv.date || ''; g('inv-leistung').value = inv.leistung || inv.date || '';
  g('inv-vortext').value = inv.vortext || ''; g('inv-doku').value = inv.doku || ''; g('inv-zahlung').value = inv.zahlung || '';
  if (inv.eid) g('inv-termin').value = String(inv.eid);
  invRows = [];
  var c = function (v) { return String(v).replace('.', ','); };
  (inv.items || []).forEach(function (it) {
    var last = invRows[invRows.length - 1];
    var strip = function (t) { return String(t || '').replace(/\s*-[\d,.]+\s*(%|€)$/, ''); };
    if (it.rabatt && it.perPos && last && last.type === 'pos') { last.rabArt = it.art === 'eur' ? 'eur' : 'pct'; last.rab = c(it.art === 'eur' ? it.eur : it.pct); last.rabText = strip(it.text) || 'Rabatt'; return; }
    if (it.rabatt) { invRows.push({ type: 'rabatt', art: it.art === 'eur' ? 'eur' : 'pct', text: strip(it.text), pct: c(it.art === 'eur' ? it.eur : it.pct), rate: String(it.rate) }); return; }
    var dd0 = it.datum || inv.leistung || inv.date;
    invRows.push({ type: 'pos', text: it.text, qty: c(it.qty), price: c(it.price), rate: String(it.rate), datum: dd0 && dd0 !== inv.date ? dd0 : '', note: it.note || '', rab: '', rabText: 'Rabatt' });
  });
  g('inv-show-hint').checked = inv.showHint !== false; g('inv-show-qr').checked = inv.showQr !== false;
  renderInvRows(); ivFoldSync();
}
function openInvoiceKind(p, kind) { invMode = kind || 'rechnung'; invKeepMode = true; openInvoice(p); }
function invDocumentChanged(kind) {
  if (invEdit || invMode === 'test' || ['rechnung','kv'].indexOf(kind) < 0) return;
  invMode = kind; invEditUi(false);
}
function invoiceToKv() {
  var inv = invCur(); if (!inv || invIsDraft(inv)) return;
  var p = patients.filter(function (x) { return x.id === inv.pid; })[0]; if (!p) { alert('Der Patient wurde nicht gefunden.'); return; }
  closeModal('modal-invview'); openInvoiceKind(p, 'kv'); fillInvForm(inv);
  document.getElementById('inv-datum').value = iso(new Date());
}
function kvToInvoice() {
  var inv = invCur(); if (!inv) return;
  var p = patients.filter(function (x) { return x.id === inv.pid; })[0]; if (!p) { alert('Der Patient wurde nicht gefunden.'); return; }
  closeModal('modal-invview'); invMode = 'rechnung'; openInvoice(p); fillInvForm(inv);
  document.getElementById('inv-datum').value = iso(new Date());
}
function openInvoice(p) {
  if (!invKeepMode) invMode = 'rechnung'; invKeepMode = false;
  invP = p; invEdit = null; if (document.getElementById('inv-title')) invEditUi(false);
  document.getElementById('inv-patient').value = p ? nameKey(p) : '';
  document.getElementById('inv-adresse').value = p && p.adresse ? p.adresse : '';
  var t = iso(new Date());
  document.getElementById('inv-datum').value = t; document.getElementById('inv-leistung').value = t;
  document.getElementById('inv-vortext').value = '';
  document.getElementById('inv-paydatum').value = ''; document.getElementById('inv-paybetrag').value = ''; setInvPay('');
  document.getElementById('inv-zahlung').value = settings.zahlung || '';
  invRows = []; invAddInit();
  document.getElementById('inv-doku').value = ''; invDokEv = null; document.getElementById('inv-doku-btn').style.display = 'none';
  fillTermine(p);
  renderInvRows();
  document.getElementById('inv-show-hint').checked = true; document.getElementById('inv-show-qr').checked = true;
  openModal('modal-inv'); ivFoldSync();
}
function fillTermine(p) {
  var sel = document.getElementById('inv-termin'); sel.innerHTML = '';
  var o0 = mk('option', '', p ? 'Keinen Termin übernehmen' : 'Erst Patient auswählen'); o0.value = ''; sel.appendChild(o0);
  if (!p) return;
  events.filter(function (e) { return eventBelongs(e, p); })
    .sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); })
    .forEach(function (e) { var o = mk('option', '', fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '') + (dokFilled(e) ? ' · mit Dokumentation' : '')); o.value = String(e.id); sel.appendChild(o); });
}
var invDokEv = null;
function invDokuEinfuegen() {
  var e = invDokEv; if (!e || !e.dok || !String(e.dok.rechnung || '').trim()) return;
  var ta = document.getElementById('inv-doku'), t = String(e.dok.rechnung).trim();
  if (ta.value.indexOf(t) < 0) ta.value = (ta.value.trim() ? ta.value.trim() + '\n' : '') + t;
}
function invTerminChanged() {
  var id = parseInt(document.getElementById('inv-termin').value, 10);
  var e = events.filter(function (x) { return x.id === id; })[0];
  if (!e) { invDokEv = null; document.getElementById('inv-doku-btn').style.display = 'none'; return; }
  document.getElementById('inv-leistung').value = e.date;
  invDokEv = e; var rb = document.getElementById('inv-doku-btn'); if (rb) rb.style.display = e.dok && String(e.dok.rechnung || '').trim() ? '' : 'none';
  var lst = evLeistungen(e).filter(function (n) { return findKat(n); });
  if (lst.length > 1 || (lst.length === 1 && lst[0] !== e.behandlung)) {
    var f0 = invRows[0]; if (invRows.length === 1 && f0.type === 'pos' && !f0.text.trim() && !f0.price) invRows = [];
    lst.forEach(function (n) { if (invRows.some(function (r) { return r.text === n; })) return; var k = findKat(n), r = newRow('pos'); r.datum = e.date; r.text = k.name; r.price = String(k.price).replace('.', ','); r.rate = String(k.rate); invRows.push(r); });
    renderInvRows(); return;
  }
  var first = invRows[0];
  if (invRows.length === 1 && first.type === 'pos' && !first.text.trim() && !first.price) { first.text = e.behandlung || 'Beratung'; first.datum = e.date; }
  else if (!invRows.some(function (r) { return r.text === e.behandlung; })) { var r = newRow('pos'); r.datum = e.date; r.text = e.behandlung || 'Beratung'; invRows.push(r); }
  renderInvRows();
}
function invPatientChanged() {
  var v = document.getElementById('inv-patient').value.trim();
  var p = patients.filter(function (x) { return nameKey(x) === v; })[0];
  if (p) { invP = p; if (p.adresse) document.getElementById('inv-adresse').value = p.adresse; fillTermine(p); }
}
/* Gespeicherte Rabatte (Praxis → Leistungen) */
function ensureRabatte() {
  if (!Array.isArray(settings.rabatte)) settings.rabatte = [];
  if (!settings.rabSeeded) { settings.rabSeeded = true; if (!settings.rabatte.length) settings.rabatte = [{ id: newId(), name: 'Erstkunde', pct: 20 }, { id: newId(), name: 'Home Treatment', pct: 10 }]; persist(); }
  return settings.rabatte;
}
var rbIdx = -1;
function renderRabatte() {
  var box = document.getElementById('rab-box'); if (!box) return; box.innerHTML = '';
  box.appendChild(mk('div', 'hm-sec', 'Rabatte für Rechnungen'));
  var row = mk('div'); row.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;';
  var chip = 'display:inline-flex; align-items:center; gap:7px; background:#fff; border:1px solid #cbd5e1; border-radius:16px; padding:3px 11px; font-size:13px; cursor:pointer; color:#0f172a; min-height:28px;';
  ensureRabatte().forEach(function (r, i) { var b = mk('button', '', r.name + ' -' + String(r.pct).replace('.', ',') + ' %'); b.type = 'button'; b.style.cssText = chip; b.onclick = function () { openRab(i); }; row.appendChild(b); });
  var nb = mk('button', '', '+ Rabatt'); nb.type = 'button'; nb.style.cssText = chip + 'border-style:dashed; color:#64748b; background:none;'; nb.onclick = function () { openRab(-1); }; row.appendChild(nb);
  box.appendChild(row);
}
function openRab(i) {
  rbIdx = i; var r = i >= 0 ? settings.rabatte[i] : null;
  document.getElementById('rb-title').textContent = r ? 'Rabatt bearbeiten' : 'Neuer Rabatt';
  document.getElementById('rb-name').value = r ? r.name : ''; document.getElementById('rb-pct').value = r ? String(r.pct).replace('.', ',') : '';
  document.getElementById('rb-del').style.display = r ? '' : 'none'; openModal('modal-rab');
}
function saveRab() {
  var n = document.getElementById('rb-name').value.trim(), p = numIn(document.getElementById('rb-pct').value);
  if (!n) { alert('Bitte eine Bezeichnung eingeben.'); return; }
  if (!(p > 0 && p <= 100)) { alert('Bitte einen Prozentwert zwischen 0 und 100 eingeben.'); return; }
  ensureRabatte(); if (rbIdx >= 0) { settings.rabatte[rbIdx].name = n; settings.rabatte[rbIdx].pct = p; } else settings.rabatte.push({ id: newId(), name: n, pct: p });
  persist(); closeModal('modal-rab'); renderRabatte(); renderInvRab();
}
async function deleteRab() { if (rbIdx < 0 || !await kaConfirm('Rabatt "' + settings.rabatte[rbIdx].name + '" löschen? Bestehende Rechnungen bleiben unverändert.')) return; settings.rabatte.splice(rbIdx, 1); persist(); closeModal('modal-rab'); renderRabatte(); renderInvRab(); }
function renderInvRab() {
  var box = document.getElementById('inv-rab'); if (!box) return; box.innerHTML = '';
  ensureRabatte().forEach(function (r) {
    var b = mk('button', 'inv-rb', '+ ' + r.name + ' -' + String(r.pct).replace('.', ',') + ' %'); b.type = 'button'; b.title = 'Rabatt auf alle Positionen darüber';
    b.onclick = function () { var x = newRow('rabatt'); x.text = r.name; x.pct = String(r.pct).replace('.', ','); invRows.push(x); renderInvRows(); }; box.appendChild(b);
  });
}
function addErstRabatt() { var r = newRow('rabatt'); r.text = 'Rabatt Erstbehandlung'; r.pct = '20'; invRows.push(r); renderInvRows(); }
function addInvRow(type) { invRows.push(newRow(type)); renderInvRows(); }
function renderInvRows() {
  renderInvRab();
  var box = document.getElementById('inv-pos'); box.innerHTML = '';
  invRows.forEach(function (r, i) {
    var isR = r.type === 'rabatt', card = mk('div', 'inv-card' + (isR ? ' rab' : '')), top = mk('div', 'ic-top'), mid = mk('div', 'ic-mid' + (isR ? ' rab' : ''));
    var a = mk('input', 'form-control'); a.type = 'text'; a.placeholder = isR ? 'Bezeichnung' : 'Leistung'; a.value = r.text;
    if (!isR) a.setAttribute('list', 't-leistung-list');
    a.oninput = function () { r.text = a.value; };
    if (!isR) a.onchange = function () { var k = findKat(a.value); if (k && !numIn(r.price)) { r.text = k.name; r.price = String(k.price).replace('.', ','); r.rate = String(k.rate); renderInvRows(); } };
    var q = mk('input', 'form-control'); q.type = 'text'; q.inputMode = 'decimal'; q.setAttribute('aria-label', isR ? 'Prozent' : 'Menge');
    var pr = null;
    if (isR) { q.value = r.pct; q.placeholder = '%'; }
    else { q.value = r.qty; q.placeholder = 'Menge'; pr = mk('input', 'form-control'); pr.type = 'text'; pr.inputMode = 'decimal'; pr.value = r.price; pr.placeholder = 'Preis €'; pr.setAttribute('aria-label', 'Preis'); }
    var rt = mk('select', 'form-control');
    ['19', '7', '0'].forEach(function (v) { var o = mk('option', '', v + ' %'); o.value = v; rt.appendChild(o); });
    rt.value = r.rate; rt.onchange = function () { r.rate = rt.value; updZeroInfo(); };
    var sum = mk('div', 'inv-amt', eurP(rowAmount(i) - posRab(i)));
    var upd = function () {
      if (isR) r.pct = q.value; else { r.qty = q.value; r.price = pr.value; }
      box.querySelectorAll('.inv-amt').forEach(function (el, k) { el.textContent = eurP(rowAmount(k) - posRab(k)); });
      document.getElementById('inv-total').textContent = eurP(invTotal()); syncInvPay();
    };
    q.oninput = upd; if (pr) pr.oninput = upd;
    var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.title = 'Entfernen';
    x.onclick = function () { invRows.splice(i, 1); renderInvRows(); };
    top.appendChild(a); top.appendChild(sum); top.appendChild(x); card.appendChild(top);
    if (isR) {
      var as = mk('select', 'form-control'); [['pct', '%'], ['eur', '€']].forEach(function (o) { var op = mk('option', '', o[1]); op.value = o[0]; as.appendChild(op); }); as.value = r.art === 'eur' ? 'eur' : 'pct'; as.setAttribute('aria-label', 'Prozent oder Euro');
      q.placeholder = as.value === 'eur' ? '€' : '%'; as.onchange = function () { r.art = as.value; q.placeholder = as.value === 'eur' ? '€' : '%'; upd(); };
      mid.appendChild(q); mid.appendChild(as); mid.appendChild(rt); card.appendChild(mid); box.appendChild(card); return;
    }
    mid.appendChild(q); mid.appendChild(pr); mid.appendChild(rt); card.appendChild(mid);
    /* kleine Zusatzfelder je Position: Rabatt, Datum, Text */
    var btns = mk('div', 'ic-btns'), fields = mk('div', 'ic-fields');
    var shown = { rab: !!(String(r.rab || '').trim()), datum: !!r.datum, note: !!String(r.note || '').trim() };
    var mkF = function (key, label, build) {
      var f = mk('div', 'ic-f'), b = mk('button', 'ic-add' + (shown[key] ? ' on' : ''), (shown[key] ? '' : '+ ') + label); b.type = 'button';
      build(f); f.style.display = shown[key] ? '' : 'none';
      b.onclick = function () { shown[key] = !shown[key]; if (!shown[key]) { if (key === 'rab') { r.rab = ''; } else if (key === 'datum') r.datum = ''; else r.note = ''; renderInvRows(); return; } f.style.display = ''; b.className = 'ic-add on'; b.textContent = label; var fi = f.querySelector('input'); if (key === 'datum' && fi) r.datum = fi.value; if (fi) fi.focus(); };
      btns.appendChild(b); fields.appendChild(f);
    };
    mkF('rab', 'Rabatt', function (f) {
      var pc = mk('input', 'form-control'); pc.type = 'text'; pc.inputMode = 'decimal'; pc.placeholder = '%'; pc.value = r.rab || ''; pc.style.maxWidth = '70px';
      var nm = mk('input', 'form-control'); nm.type = 'text'; nm.placeholder = 'Bezeichnung'; nm.value = r.rabText || 'Rabatt';
      pc.oninput = function () { r.rab = pc.value; upd(); }; nm.oninput = function () { r.rabText = nm.value; };
      var ar = mk('select', 'form-control'); ar.style.maxWidth = '62px'; [['pct', '%'], ['eur', '€']].forEach(function (o) { var op = mk('option', '', o[1]); op.value = o[0]; ar.appendChild(op); }); ar.value = r.rabArt === 'eur' ? 'eur' : 'pct'; ar.setAttribute('aria-label', 'Prozent oder Euro');
      pc.placeholder = ar.value === 'eur' ? '€' : '%'; ar.onchange = function () { r.rabArt = ar.value; pc.placeholder = ar.value === 'eur' ? '€' : '%'; upd(); };
      f.className = 'ic-f two'; f.appendChild(pc); f.appendChild(ar); f.appendChild(nm);
    });
    mkF('datum', 'Datum', function (f) { var dt = mk('input', 'form-control'); dt.type = 'date'; dt.value = r.datum || document.getElementById('inv-datum').value || ''; dt.title = 'Datum der Leistung'; dt.onchange = function () { r.datum = dt.value; }; f.appendChild(dt); });
    mkF('note', 'Text', function (f) { var nt = mk('input', 'form-control'); nt.type = 'text'; nt.placeholder = 'Anmerkung für die Tabelle, z. B. Charge'; nt.value = r.note || ''; nt.oninput = function () { r.note = nt.value; }; f.appendChild(nt); });
    card.appendChild(fields); card.appendChild(btns); box.appendChild(card);
  });
  document.getElementById('inv-total').textContent = eurP(invTotal()); syncInvPay(); updZeroInfo();
}
async function saveInvoice() {
  var name = document.getElementById('inv-patient').value.trim();
  var p = patients.filter(function (x) { return nameKey(x) === name; })[0];
  if (!p) { alert('Bitte einen angelegten Patienten auswählen. Neue Patienten legst Du zuerst unter Patienten an.'); return; }
  var adresse = document.getElementById('inv-adresse').value.trim();
  if (!adresse) { alert('Bitte die Anschrift des Patienten eingeben.'); return; }
  var datum = document.getElementById('inv-datum').value, leist = document.getElementById('inv-leistung').value;
  if (!datum || !leist) { alert('Bitte Rechnungsdatum und Leistungsdatum angeben.'); return; }
  var items = [], bad = false;
  invRows.forEach(function (r, i) {
    if (r.type === 'rabatt') {
      var pc = numIn(r.pct);
      var ge = r.art === 'eur';
      if (!r.text.trim() || pc <= 0 || (!ge && pc > 100)) { bad = true; return; }
      items.push(ge ? { rabatt: true, art: 'eur', eur: pc, pct: 0, text: r.text.trim() + ' -' + nf(pc) + ' €', qty: 1, price: rowAmount(i), amount: rowAmount(i), rate: parseInt(r.rate, 10) }
        : { rabatt: true, pct: pc, text: r.text.trim() + ' -' + String(pc).replace('.', ',') + '%', qty: 1, price: rowAmount(i), amount: rowAmount(i), rate: parseInt(r.rate, 10) });
    } else {
      var q = numIn(r.qty), pr = numIn(r.price);
      if (!r.text.trim() || q <= 0 || pr <= 0) { bad = true; return; }
      items.push({ text: r.text.trim(), qty: q, price: pr, amount: r2(q * pr), rate: parseInt(r.rate, 10), datum: r.datum || datum, note: String(r.note || '').trim() });
      var pcr = numIn(r.rab), pge = r.rabArt === 'eur';
      if (pcr > 0 && (pge || pcr <= 100)) { var pa = posRab(i); items.push(pge ? { rabatt: true, perPos: true, art: 'eur', eur: pcr, pct: 0, text: String(r.rabText || 'Rabatt').trim() + ' -' + nf(pa) + ' €', qty: 1, price: -pa, amount: -pa, rate: parseInt(r.rate, 10) }
        : { rabatt: true, perPos: true, pct: pcr, text: String(r.rabText || 'Rabatt').trim() + ' -' + String(pcr).replace('.', ',') + '%', qty: 1, price: -pa, amount: -pa, rate: parseInt(r.rate, 10) }); } else if (pcr > 100 && !pge) bad = true;
    }
  });
  var pd = items.filter(function (x) { return x.datum; }).map(function (x) { return x.datum; }).sort(); leist = pd.length ? pd[0] : datum;
  if (bad || !items.length) { alert('Bitte jede Position mit Leistung, Menge und Preis (Rabatt: Bezeichnung und Prozent) ausfüllen.'); return; }
  var hinweis = items.some(function (i) { return i.rate === 0; }) ? (settings.hinweis || '').trim() : '';
  if (!settings.steuernr && !settings.ustid && !await kaConfirm('In den Praxisdaten fehlt die Steuernummer oder USt-IdNr. Die Rechnung wäre unvollständig. Trotzdem erstellen?')) return;
  if (items.some(function (i) { return i.rate === 0; }) && !hinweis && !await kaConfirm('Eine Position hat 0 % Umsatzsteuer, aber im Menü Praxis unter Praxisdaten ist kein Hinweis für 0 % hinterlegt. Trotzdem erstellen?')) return;
  var payAmount = 0, payDate = '';
  if (invPayArt) {
    payAmount = r2(numIn(document.getElementById('inv-paybetrag').value)); payDate = document.getElementById('inv-paydatum').value;
    var tot0 = r2(items.reduce(function (a, i) { return a + i.amount; }, 0));
    if (payAmount <= 0 || !payDate) { alert('Bitte bei der Zahlung Betrag und Datum angeben, oder "Noch offen" wählen.'); return; }
    if (payAmount > tot0 + 0.005) { alert('Der Zahlungsbetrag ist höher als die Rechnungssumme.'); return; }
  }
  if (invMode !== 'rechnung' && !invEdit) {
    var dtot = r2(items.reduce(function (a, i) { return a + i.amount; }, 0));
    var d0 = { id: newId(), kind: invMode, nr: '', date: datum, leistung: leist, pid: p.id, name: (p.anrede ? p.anrede + ' ' : '') + p.vorname + ' ' + p.nachname, adresse: adresse, items: items,
      doku: document.getElementById('inv-doku').value.trim(), eid: parseInt(document.getElementById('inv-termin').value, 10) || null, hinweis: hinweis, zahlung: '', vortext: document.getElementById('inv-vortext').value.trim(), total: dtot, payments: [], created: Date.now() };
    entw.push(d0); p.adresse = adresse; persist(); closeModal('modal-inv'); invTab = d0.kind === 'test' ? 'test' : 'rechnung'; renderInvoices(); viewInvoice(d0.id); return;
  }
  if (invEdit) {
    var ie = invEdit, totE = r2(items.reduce(function (a, i) { return a + i.amount; }, 0));
    if (paidSum(ie) > totE + 0.005 && !await kaConfirm('Die bereits erfassten Zahlungen (' + eur(paidSum(ie)) + ') sind höher als die neue Summe (' + eur(totE) + '). Trotzdem speichern?')) return;
    var changed = JSON.stringify(ie.items) !== JSON.stringify(items) || ie.date !== datum || ie.adresse !== adresse || ie.vortext !== document.getElementById('inv-vortext').value.trim();
    ie.date = datum; ie.leistung = leist; ie.pid = p.id; ie.name = (p.anrede ? p.anrede + ' ' : '') + p.vorname + ' ' + p.nachname; ie.adresse = adresse; ie.items = items;
    ie.doku = document.getElementById('inv-doku').value.trim(); ie.eid = parseInt(document.getElementById('inv-termin').value, 10) || null; ie.hinweis = hinweis; ie.zahlung = document.getElementById('inv-zahlung').value.trim();
    ie.vortext = document.getElementById('inv-vortext').value.trim(); ie.total = totE; ie.showHint = document.getElementById('inv-show-hint').checked; ie.showQr = document.getElementById('inv-show-qr').checked;
    if (changed) ie.sentAt = null;
    p.adresse = adresse; invEdit = null; persist(); closeModal('modal-inv'); renderInvoices();
    if (curP === p) { renderHead(); renderVerlauf(); }
    ['tab-zahlungen', 'tab-statistik'].forEach(function (t) { var el = document.getElementById(t); if (el && el.classList.contains('active')) (t === 'tab-zahlungen' ? renderZahlungen : renderStat)(); });
    viewInvoice(ie.id); return;
  }
  var yr = datum.slice(0, 4), seq = 0;
  invoices.forEach(function (i) { var m = /^(?:RE-)?(\d{4})-(\d+)$/.exec(i.nr); if (m && m[1] === yr) seq = Math.max(seq, parseInt(m[2], 10)); });
  var nr = yr + '-' + String(seq + 1).padStart(5, '0');
  var total = r2(items.reduce(function (a, i) { return a + i.amount; }, 0));
  var inv = { id: newId(), nr: nr, date: datum, leistung: leist, pid: p.id,
    name: (p.anrede ? p.anrede + ' ' : '') + p.vorname + ' ' + p.nachname, adresse: adresse,
    items: items, doku: document.getElementById('inv-doku').value.trim(), eid: parseInt(document.getElementById('inv-termin').value, 10) || null, hinweis: hinweis, zahlung: document.getElementById('inv-zahlung').value.trim(),
    vortext: document.getElementById('inv-vortext').value.trim(), showHint: document.getElementById('inv-show-hint').checked, showQr: document.getElementById('inv-show-qr').checked,
    total: total, payments: [], created: Date.now() };
  if (invPayArt) inv.payments.push({ nr: nextPayNr(payDate), art: invPayArt, amount: payAmount, date: payDate });
  p.adresse = adresse;
  invoices.push(inv); persist();
  closeModal('modal-inv');
  renderInvoices(); if (curP === p) { renderHead(); renderVerlauf(); }
  viewInvoice(inv.id);
}
/* Offene Posten: Summe, Anzahl und überfällige (nach Zahlungsziel) */
function invDaysOld(i) { return Math.round((new Date(iso(new Date())) - new Date(i.date)) / 86400000); }
function invLate(i) { return invDaysOld(i) > (parseInt(settings.zahlungsziel, 10) || 14); }
var invPer = { k: 'alle', from: '', to: '' };
function invPerRange() {
  var n = new Date(), y = n.getFullYear(), m = n.getMonth(), iso0 = function (d) { return iso(d); }, k = invPer.k;
  if (k === 'monat') return [iso0(new Date(y, m, 1)), iso0(new Date(y, m + 1, 0))];
  if (k === 'lmonat') return [iso0(new Date(y, m - 1, 1)), iso0(new Date(y, m, 0))];
  if (k === 'quartal') { var q = Math.floor(m / 3) * 3; return [iso0(new Date(y, q, 1)), iso0(new Date(y, q + 3, 0))]; }
  if (k === 'jahr') return [y + '-01-01', y + '-12-31'];
  if (k === 'ljahr') return [(y - 1) + '-01-01', (y - 1) + '-12-31'];
  if (k === 'eigen') return [invPer.from || '0000-01-01', invPer.to || '9999-12-31'];
  return null;
}
function invInRange(i) { var r = invPerRange(); return !r || (String(i.date) >= r[0] && String(i.date) <= r[1]); }
var INV_PER_LBL = { alle: 'Alle', monat: 'Dieser Monat', lmonat: 'Letzter Monat', quartal: 'Dieses Quartal', jahr: 'Dieses Jahr', ljahr: 'Letztes Jahr', eigen: 'Eigener Zeitraum' };
function invPerText() { if (invPer.k === 'eigen') return (invPer.from ? fmtD(invPer.from) : 'Anfang') + ' bis ' + (invPer.to ? fmtD(invPer.to) : 'heute'); return INV_PER_LBL[invPer.k]; }
function invPerMenu(ev) {
  ev.stopPropagation(); var old = document.getElementById('inv-pop'); if (old) { old.remove(); return; }
  var r = ev.currentTarget.getBoundingClientRect(), m = mk('div', 'nv-pop'); m.id = 'inv-pop';
  ['alle', 'monat', 'lmonat', 'quartal', 'jahr', 'ljahr'].forEach(function (k) { var b = mk('button', '', (invPer.k === k ? '✓ ' : '') + INV_PER_LBL[k]); b.type = 'button'; b.onclick = function () { m.remove(); invPer.k = k; renderInvoices(); }; m.appendChild(b); });
  var e = mk('button', '', (invPer.k === 'eigen' ? '✓ ' : '') + 'Eigener Zeitraum …'); e.type = 'button'; e.onclick = function () { m.remove(); invPerCustom(); }; m.appendChild(e);
  m.style.top = (r.bottom + 6) + 'px'; m.style.right = Math.max(8, window.innerWidth - r.right) + 'px'; document.body.appendChild(m);
  setTimeout(function () { document.addEventListener('click', function f() { var p = document.getElementById('inv-pop'); if (p) p.remove(); document.removeEventListener('click', f); }); }, 0);
}
function invPerCustom() {
  var d = document.createElement('div'); d.className = 'ka-dlg';
  d.innerHTML = '<div class="ka-dlg-box"><div class="ka-dlg-msg"><b>Eigener Zeitraum</b></div><div class="grid-2"><div class="form-group"><label>Von</label><input type="date" id="ip-from" class="form-control"></div><div class="form-group"><label>Bis</label><input type="date" id="ip-to" class="form-control"></div></div><div class="ka-dlg-foot"><button type="button" class="btn btn-cancel" id="ip-no">Abbrechen</button><button type="button" class="btn btn-save" id="ip-ok">Anwenden</button></div></div>';
  document.body.appendChild(d); d.querySelector('#ip-from').value = invPer.from; d.querySelector('#ip-to').value = invPer.to;
  d.querySelector('#ip-no').onclick = function () { d.remove(); };
  d.querySelector('#ip-ok').onclick = function () { var f = d.querySelector('#ip-from').value, t = d.querySelector('#ip-to').value; if (!f && !t) { alert('Bitte mindestens ein Datum angeben.'); return; } if (f && t && f > t) { alert('Das Anfangsdatum liegt nach dem Enddatum.'); return; } invPer = { k: 'eigen', from: f, to: t }; d.remove(); renderInvoices(); };
}
function invOpenInfo(range) {
  var l = invoices.filter(function (i) { return !invState(i).full && (!range || invInRange(i)); }), sum = 0, lateN = 0, lateSum = 0;
  l.forEach(function (i) { var o = r2(i.total - paidSum(i)); sum += o; if (invLate(i)) { lateN++; lateSum += o; } });
  return { list: l, sum: r2(sum), lateN: lateN, lateSum: r2(lateSum) };
}
function openBox() {
  var o = invOpenInfo(true); if (!o.list.length) return null;
  var b = mk('div', 'open-box' + (o.lateN ? ' late' : '')), a = mk('div');
  a.appendChild(mk('b', '', eur(o.sum)));
  b.appendChild(a);
  var late = o.list.filter(function (i) { return invLate(i); }).sort(function (x, y) { return String(x.date).localeCompare(String(y.date)); });
  var nm = function (i) { return i.nr + ' · ' + invNm(i) + ' (' + invDaysOld(i) + ' Tage)'; };
  var t = mk('div', 'ob-t', o.list.length + (o.list.length === 1 ? ' offene Rechnung' : ' offene Rechnungen') + (late.length ? ' · überfällig: ' + late.slice(0, 2).map(nm).join('; ') + (late.length > 2 ? ' und ' + (late.length - 2) + ' weitere' : '') : '') + (invPer.k !== 'alle' ? ' · ' + invPerText() : ''));
  b.appendChild(t); return b;
}
var invSort = { k: 'nr', dir: -1 }, invF = '';
function invKind(i) { if (i.kind === 'kv') return 'kv'; return i.storniert ? 'storno' : invState(i).full ? 'bezahlt' : (invLate(i) ? 'ueberfaellig' : 'offen'); }
function invSortBy(k) { if (invSort.k === k) invSort.dir = -invSort.dir; else { invSort.k = k; invSort.dir = k === 'name' || k === 'status' ? 1 : -1; } renderInvoices(); }
function invCmp(a, b) {
  var k = invSort.k, d;
  if (k === 'nr') d = String(a.nr).localeCompare(String(b.nr), 'de', { numeric: true });
  else if (k === 'date') d = String(a.date).localeCompare(String(b.date)) || String(a.nr).localeCompare(String(b.nr), 'de', { numeric: true });
  else if (k === 'name') d = String(a.name).localeCompare(String(b.name), 'de', { sensitivity: 'base' });
  else if (k === 'total') d = a.total - b.total;
  else d = invState(a).txt.localeCompare(invState(b).txt, 'de');
  return d * invSort.dir;
}
/* Suchleisten stehen hinter einer Lupe; mit Text bleiben sie sichtbar */
var SR_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
function srchFold(inputId, host, before, btnId) {
  var inp = document.getElementById(inputId); if (!inp || !host || inp.dataset.sr) return; inp.dataset.sr = '1';
  var b = mk('button', 'sr-btn'); b.type = 'button'; b.title = 'Suchen'; b.setAttribute('aria-label', 'Suchen'); b.innerHTML = SR_ICON; if (btnId) b.id = btnId;
  var set = function (on) { inp.style.display = on ? '' : 'none'; b.classList.toggle('on', on); if (on) inp.focus(); };
  b.onclick = function () { var open = inp.style.display === 'none'; if (!open && inp.value) { inp.value = ''; inp.dispatchEvent(new Event('input')); } set(open); };
  inp.style.display = inp.value ? '' : 'none'; b.classList.toggle('on', !!inp.value);
  host.insertBefore(b, before || host.firstChild);
}
/* Schwebende Lupe unten rechts; die Suchleiste klappt unten daneben auf. Der Knopf liegt im Reiter und ist nur dort sichtbar. */
function srchFloat(inputId, tabId) {
  var inp = document.getElementById(inputId), tab = document.getElementById(tabId); if (!inp || !tab || inp.dataset.sr) return; inp.dataset.sr = '1';
  var bar = mk('div', 'sr-bar'), b = mk('button', 'sr-fab'); b.type = 'button'; b.title = 'Suchen'; b.setAttribute('aria-label', 'Suchen'); b.innerHTML = SR_ICON;
  inp.style.cssText = 'margin:0; flex:1; min-width:0;'; bar.appendChild(inp); tab.appendChild(bar); tab.appendChild(b);
  var set = function (on) { bar.style.display = on ? 'flex' : 'none'; b.classList.toggle('on', on); if (on) inp.focus(); };
  b.onclick = function () { var open = bar.style.display !== 'flex'; if (!open && inp.value) { inp.value = ''; inp.dispatchEvent(new Event('input')); } set(open); };
  set(!!inp.value);
}
function srchInit() {
  
  var ma = document.getElementById('md-addf'); if (ma) srchFold('md-filter', ma.parentNode, null);
}
var invAddReady = false;
function invAddPos(text, price, rate) {
  if (invRows.length === 1 && invRows[0].type === 'pos' && !invRows[0].text.trim() && !numIn(invRows[0].price)) invRows = [];
  var r = newRow('pos'); r.text = text; if (price != null) r.price = String(price).replace('.', ','); if (rate != null) r.rate = String(rate); invRows.push(r); renderInvRows();
}
function invAddInit() {
  if (invAddReady) return; invAddReady = true;
  var inp = document.getElementById('inv-add'), dd = document.getElementById('inv-add-dd');
  var show = function () {
    var q = inp.value.trim().toLowerCase(), cat = (settings.katalog || []).filter(function (k) { return !q || k.name.toLowerCase().indexOf(q) >= 0; }).slice(0, 12);
    dd.innerHTML = '';
    cat.forEach(function (k) { var b = mk('button', 'dk-ddi', k.name + ' · ' + eur(k.price)); b.type = 'button'; b.onmousedown = function (ev) { ev.preventDefault(); invAddPos(k.name, k.price, k.rate); inp.value = ''; dd.style.display = 'none'; }; dd.appendChild(b); });
    var raw = inp.value.trim(); if (raw && !cat.some(function (k) { return k.name.toLowerCase() === raw.toLowerCase(); })) { var o = mk('button', 'dk-ddi dk-own', '„' + raw + '“ als freie Leistung'); o.type = 'button'; o.onmousedown = function (ev) { ev.preventDefault(); invAddPos(raw); inp.value = ''; dd.style.display = 'none'; }; dd.appendChild(o); }
    dd.style.display = dd.children.length ? 'block' : 'none';
  };
  inp.addEventListener('input', show); inp.addEventListener('focus', show); inp.addEventListener('blur', function () { dd.style.display = 'none'; });
  inp.addEventListener('keydown', function (ev) { if (ev.key !== 'Enter') return; ev.preventDefault(); var q = inp.value.trim().toLowerCase(), hit = (settings.katalog || []).filter(function (k) { return k.name.toLowerCase().indexOf(q) >= 0; }); if (q && hit.length === 1) invAddPos(hit[0].name, hit[0].price, hit[0].rate); else if (q) invAddPos(inp.value.trim()); inp.value = ''; dd.style.display = 'none'; });
}
function ivFold(h) { h.parentNode.classList.toggle('closed'); h.setAttribute('aria-expanded', String(!h.parentNode.classList.contains('closed'))); var t = h.parentNode.querySelector('textarea'); if (t && !h.parentNode.classList.contains('closed')) { autoGrow(t); t.focus(); } }
/* Abschnitte auf, wenn Text drinsteht; Textfelder wachsen mit */
function ivFoldSync() {
  [['iv-f-vor', 'inv-vortext'], ['iv-f-doku', 'inv-doku']].forEach(function (f) { var el = document.getElementById(f[0]), ta = document.getElementById(f[1]); if (el && ta) { el.classList.toggle('closed', !String(ta.value).trim()); var h = el.querySelector('.dk-fh'); if (h) h.setAttribute('aria-expanded', String(!el.classList.contains('closed'))); } });
  [].forEach.call(document.querySelectorAll('#modal-inv textarea.dk-grow'), function (t) { if (t.offsetParent) autoGrow(t); });
  setTimeout(function () { [].forEach.call(document.querySelectorAll('#modal-inv textarea.dk-grow'), function (t) { if (t.offsetParent) autoGrow(t); }); }, 0);
}
function invNew() { if (invTab === 'rechnung') openInvoice(null); else openInvoiceKind(null, invTab); }
/* Reiter Rechnungen | Kostenvoranschläge | Test-Rechnungen: Kostenvoranschläge und Test-Rechnungen haben keine Nummer und zählen nicht in Statistik und Zahlungen */
function renderEntw() {
  var sg = document.getElementById('inv-kind'); if (!sg) return; sg.innerHTML = '';
  if (invTab === 'kv') invTab = 'rechnung';
  [['rechnung', 'Rechnungen & KV'], ['test', 'Test-Rechnungen']].forEach(function (k) {
    var b = mk('button', invTab === k[0] ? 'on' : '', k[1]); b.type = 'button'; b.onclick = function () { invTab = k[0]; renderInvoices(); }; sg.appendChild(b);
  });
  var dr = invTab === 'test' ? DRAFT.test : null, main = document.getElementById('inv-main'), box = document.getElementById('entw-list'), srb = document.querySelector('#tab-rechnungen .sr-fab'), srbar = document.querySelector('#tab-rechnungen .sr-bar'); if (srb) srb.style.display = dr ? 'none' : ''; if (dr && srbar) srbar.style.display = 'none';
  main.style.display = dr ? 'none' : ''; box.style.display = dr ? '' : 'none';
  var nb = document.getElementById('inv-b-new'); nb.title = nb.getAttribute('aria-label').replace(/.*/, 'Neu: ' + (dr ? dr.name : 'Rechnung')); nb.setAttribute('aria-label', nb.title);
  if (!dr) return;
  box.innerHTML = '';
  var list = entw.filter(function (e) { return e.kind === invTab; }).sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
  if (!list.length) { box.appendChild(Object.assign(mk('div', '', 'Noch keine ' + dr.liste), { style: 'color:#94a3b8; font-size:13px; padding:10px 0;' })); return; }
  list.forEach(function (e) {
    var r = mk('button', 'entw-row'); r.type = 'button'; r.onclick = function () { viewInvoice(e.id); };
    r.appendChild(mk('span', 'entw-n', e.name)); r.appendChild(mk('span', 'entw-d', fmtD(e.date))); r.appendChild(mk('b', 'entw-t', eur(e.total))); box.appendChild(r);
  });
}
function renderInvoices() {
  renderEntw();
  var tb = document.getElementById('inv-table'); if (!tb) return;
  tb.innerHTML = '';
  [].forEach.call(document.querySelectorAll('[data-ik]'), function (e) { e.innerHTML = e.getAttribute('data-ik') === invSort.k ? (invSort.dir > 0 ? '&#9650;' : '&#9660;') : ''; });
  var billingList = invoices.concat(entw.filter(function (e) { return e.kind === 'kv'; }));
  document.getElementById('inv-empty').style.display = billingList.length ? 'none' : 'block';
  var ob = document.getElementById('inv-open'); if (ob) { ob.innerHTML = ''; var bx = openBox(); if (bx) ob.appendChild(bx); }
  var fb0 = document.getElementById('inv-flt'); if (fb0) { fb0.classList.toggle('on', invPer.k !== 'alle'); fb0.title = invPer.k === 'alle' ? 'Zeitraum der Anzeige wählen' : 'Zeitraum: ' + invPerText(); }
  /* Filter und Suche */
  var inR = billingList.filter(invInRange), cnt = { '': inR.length, offen: 0, ueberfaellig: 0, bezahlt: 0, storno: 0, kv: 0 };
  inR.forEach(function (i) { var k = invKind(i); cnt[k]++; if (k === 'ueberfaellig') cnt.offen++; });
  var sg = document.getElementById('inv-seg'); sg.innerHTML = '';
  [['', 'Alle'], ['offen', 'Offen'], ['ueberfaellig', 'Überfällig'], ['bezahlt', 'Bezahlt'], ['storno', 'Storno'], ['kv', 'KV']].forEach(function (f) {
    var bt = mk('button', 'za-b' + (invF === f[0] ? ' on' : '')); bt.type = 'button'; bt.appendChild(document.createTextNode(f[1] + ' ')); bt.appendChild(mk('b', '', String(cnt[f[0]])));
    bt.onclick = function () { invF = (invF === f[0]) ? '' : f[0]; renderInvoices(); }; sg.appendChild(bt);
  });
  var q = (document.getElementById('inv-q').value || '').trim().toLowerCase();
  var shown = inR.filter(function (i) {
    var k = invKind(i);
    if (invF === 'offen' && k !== 'offen' && k !== 'ueberfaellig') return false; if (invF && invF !== 'offen' && k !== invF) return false;
    return !q || ((i.kind === 'kv' ? 'KV Kostenvoranschlag ' : '') + i.nr + ' ' + i.name + ' ' + eur(i.total) + ' ' + fmtD(i.date) + ' ' + String(i.total).replace('.', ',')).toLowerCase().indexOf(q) >= 0;
  });
  if (!shown.length && billingList.length) { var er = tb.insertRow(), ec = er.insertCell(); ec.colSpan = 4; ec.textContent = 'Keine Rechnung gefunden'; ec.style.color = '#94a3b8'; }
  shown.sort(invCmp).forEach(function (i) {
    var row = tb.insertRow(); row.className = i.kind === 'kv' ? 't-kv' : i.storniert ? '' : !invState(i).full ? (invLate(i) ? 't-late' : 't-open') : 't-paid';
    var c0 = row.insertCell(), c1 = row.insertCell(), c2 = row.insertCell(), c3 = row.insertCell();
    var b = mk('button', 'pn', i.kind === 'kv' ? 'KV' : i.nr); if (i.kind === 'kv') { b.classList.add('inv-kv-label'); b.title = 'Kostenvoranschlag öffnen'; } b.type = 'button'; b.onclick = function () { viewInvoice(i.id); }; c0.appendChild(b);
    var fd = fmtD(i.date); c1.textContent = fd; c1.className = 'pc-d'; var dsm = mk('small', 'pc-ds', fd.slice(0, 5)); c0.appendChild(dsm); c2.appendChild(nmEl(invNm(i))); c3.textContent = eur(i.total); c0.className = 'nw';
    /* Betrag statt Status-Spalte: rot = offen, dunkelrot = überfällig, orange = Teilzahlung, grün = bezahlt, grau = storniert */
    var st = invState(i), late = !st.full && invLate(i), amt = mk('span', 'inv-a ' + (i.storniert ? 'a-st' : st.full ? 'a-ok' : late ? 'a-late' : st.txt === 'Teilzahlung' ? 'a-part' : 'a-open'), eur(i.total));
    if (i.kind === 'kv') { amt.className = 'inv-a a-kv'; amt.title = 'Kostenvoranschlag, keine offene Forderung'; } else amt.title = i.storniert ? 'Storniert' : st.full ? 'Bezahlt' : late ? 'Überfällig' : st.txt; c3.textContent = ''; c3.className = 'nw'; c3.appendChild(amt);
  });
}
