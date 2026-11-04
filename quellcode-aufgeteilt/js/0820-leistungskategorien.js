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
