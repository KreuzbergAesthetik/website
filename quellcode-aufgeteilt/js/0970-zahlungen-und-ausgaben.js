/* ===== Zahlungen und Ausgaben ===== */
var AUSG_KATS = ['Material und Waren', 'Miete und Nebenkosten', 'Versicherung', 'Personal', 'Marketing', 'Steuern und Abgaben', 'Fortbildung', 'Sonstiges'];
var zMonth = iso(new Date()).slice(0, 7), zArt = '', agCur = null;
function allPayments() {
  var out = [];
  invoices.forEach(function (i) {
    if ((i.payments || []).length) i.payments.forEach(function (p) { out.push({ date: p.date, amount: p.amount, art: p.art, inv: i, ref: p }); });
    else if (i.paid) out.push({ date: i.date, amount: i.total, art: '-', inv: i, ref: null });
  });
  return out;
}
function allAusgaben() {
  var out = ausgaben.map(function (a) { return { date: a.date, text: a.text, kat: a.kat, betrag: a.betrag, id: a.id }; });
  lager.chargen.forEach(function (c) {
    var pr = prodOf(c.pid), ek = +c.ek; if (c.ek === null || c.ek === '' || c.ek === undefined || isNaN(ek)) return;
    out.push({ date: c.datum || '', text: 'Wareneingang: ' + (pr ? pr.name : '?') + ' (Charge ' + (c.nr || '-') + ', netto)', kat: 'Material und Waren', betrag: r2(ek * (+c.menge || 0)), auto: true });
  });
  return out;
}
function statBox(label, val, color) {
  var d = mk('div', 'hm-stat'); d.style.minWidth = '120px'; var l = mk('span', '', label); l.style.cssText = 'font-size:12px; color:#64748b;'; d.appendChild(l);
  var b = mk('b', '', val); if (color) b.style.color = color; d.appendChild(b); return d;
}
var ZA_COL = { Karte: '#3b82f6', Bar: '#22c55e', 'Überweisung': '#8b5cf6', PayPal: '#0ea5e9', Gutschein: '#ec4899' };
/* Neue Zahlung von der Zahlungen-Seite: erst die Rechnung wählen, dann die übliche Maske */
function zlAdd() {
  var l = invOpenInfo().list.sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
  if (!l.length) { alert('Es gibt keine offenen Rechnungen. Eine Zahlung wird immer zu einer Rechnung erfasst.'); return; }
  var d = document.createElement('div'); d.className = 'modal-overlay active'; d.style.zIndex = 120;
  d.innerHTML = '<div class="modal-box"><div class="modal-header"><strong>Zahlung zu welcher Rechnung?</strong><button type="button" class="close-btn">&times;</button></div><input type="text" class="form-control" id="zl-q" placeholder="Nummer oder Name" autocomplete="off" style="margin-bottom:8px"><div id="zl-pick"></div></div>';
  document.body.appendChild(d);
  var box = d.querySelector('#zl-pick'), q = d.querySelector('#zl-q');
  var fill = function () {
    var t = q.value.trim().toLowerCase(); box.innerHTML = '';
    l.filter(function (i) { return !t || (i.nr + ' ' + i.name).toLowerCase().indexOf(t) >= 0; }).forEach(function (i) {
      var r = mk('div', 'hm-row'), m = mk('div', 'hm-main'), nm = mk('div', '', i.nr); nm.style.cssText = 'font-size:16px; font-weight:700; color:#0f172a;';
      m.appendChild(nm); m.appendChild(mk('small', '', String(i.name || '').replace(/^(Frau|Herr|Divers)\s+/, '') + ' · ' + fmtD(i.date) + (invLate(i) ? ' · überfällig' : ''))); r.appendChild(m);
      var am = mk('b', '', eur(r2(i.total - paidSum(i)))); am.style.cssText = 'white-space:nowrap; color:#b45309;'; r.appendChild(am);
      r.onclick = function () { d.remove(); viewInvId = i.id; openPay(); }; box.appendChild(r);
    });
    if (!box.children.length) box.appendChild(mk('div', 'hm-empty', 'Keine passende offene Rechnung.'));
  };
  q.oninput = fill; fill();
  d.querySelector('.close-btn').onclick = function () { d.remove(); };
  d.addEventListener('click', function (ev) { if (ev.target === d) d.remove(); });
}
function zEur(v) { return window.innerWidth <= 760 && Math.abs(v - Math.round(v)) < 0.005 ? Math.round(v).toLocaleString('de-DE') + ' €' : eur(v); }
function renderZahlungen() {
  var tin = document.getElementById('zl-in'); if (!tin) return;
  document.getElementById('zl-month').value = zMonth;
  var inM = function (d) { return !zMonth || String(d).slice(0, 7) === zMonth; };
  var allP = allPayments().filter(function (p) { return inM(p.date); }), pays = allP.filter(function (p) { return !zArt || p.art === zArt; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  var sumIn = 0, byArt = {};
  pays.forEach(function (p) { sumIn += p.amount; byArt[p.art] = (byArt[p.art] || 0) + p.amount; });
  var sm = document.getElementById('zl-sum'); sm.innerHTML = '';

  /* Zahlart-Auswahl: jede Art ist direkt antippbar und filtert die Tabelle */
  var zs = document.getElementById('zl-arts'); zs.innerHTML = '';
  var allSum = {}; allP.forEach(function (p) { allSum[p.art] = (allSum[p.art] || 0) + p.amount; });
  var tot = allP.reduce(function (a, p) { return a + p.amount; }, 0);
  var segBtn = function (key, dot, label, sum) {
    var b = mk('button', 'za-b' + ((zArt || '') === key ? ' on' : '')); b.type = 'button';
    var lb = mk('span', 'za-l'); if (dot) { var d = mk('i'); d.style.background = dot; lb.appendChild(d); } lb.appendChild(document.createTextNode(label === 'Überweisung' ? 'Überw.' : label)); b.title = label; b.appendChild(lb); b.appendChild(mk('b', '', zEur(sum)));
    b.onclick = function () { zArt = ((zArt || '') === key) ? '' : key; renderZahlungen(); }; zs.appendChild(b);
  };
  segBtn('', null, 'Alle', tot);
  ['Bar', 'Karte', 'Überweisung', 'PayPal'].concat(Object.keys(allSum).filter(function (k) { return ['Bar', 'Karte', 'Überweisung', 'PayPal'].indexOf(k) < 0; }).sort()).forEach(function (k) { segBtn(k, ZA_COL[k] || '#94a3b8', k, allSum[k] || 0); });
  tin.innerHTML = '';
  pays.forEach(function (p) {
    var row = tin.insertRow(), c0 = row.insertCell(), c1 = row.insertCell(), c2 = row.insertCell(), c3 = row.insertCell(), c4 = row.insertCell();
    var zd = fmtD(p.date); c0.innerHTML = '<span class="hm-l">' + zd + '</span><span class="hm-s">' + zd.slice(0, 6) + zd.slice(8) + '</span>'; c0.className = 'nw'; var zn = String(invNm(p.inv) || ''), zk = zn.indexOf(', '); c1.innerHTML = '<b class="za-n1">' + esc(zk < 0 ? zn : zn.slice(0, zk)) + '</b>' + (zk < 0 ? '' : '<span class="za-n2">' + esc(zn.slice(zk + 2)) + '</span>'); c4.className = 'nw';
    var b = mk('button', 'pn'); b.type = 'button'; var nrm = /^(.*?-)(\d+)$/.exec(String(p.inv.nr || '')); if (nrm) { b.appendChild(document.createTextNode(nrm[1])); b.appendChild(document.createElement('br')); b.appendChild(document.createTextNode(nrm[2])); } else b.textContent = p.inv.nr; b.style.lineHeight = '1.25'; b.onclick = function () { viewInvoice(p.inv.id); }; c2.appendChild(b);
    row.style.setProperty('--bar', ZA_COL[p.art] || '#94a3b8'); row.title = 'Zahlungsart: ' + p.art; var ar = mk('span', 'zart'), ad = mk('i'); ad.style.background = ZA_COL[p.art] || '#94a3b8'; ar.appendChild(ad); ar.appendChild(document.createTextNode(p.art)); c3.appendChild(ar);
    c4.appendChild(mk('span', '', eur(p.amount)));
    row.style.cursor = 'pointer'; row.onclick = function (ev) { if (ev.target.closest('.pn')) return; openPayEdit(p.inv.id, p.ref); };
  });
  if (!pays.length) { var er = tin.insertRow(), ec = er.insertCell(); ec.colSpan = 5; ec.textContent = 'Keine Zahlungen im Zeitraum'; ec.style.color = '#94a3b8'; }
  var op = document.getElementById('zl-open'); op.innerHTML = '';
  var oi = invOpenInfo(), open = oi.list.sort(function (a, b) { return a.date.localeCompare(b.date); });
  var oh = document.getElementById('zl-open-h'); oh.textContent = open.length ? 'Offene Posten (' + open.length + ') · ' + eur(oi.sum) : 'Offene Posten'; oh.className = 'ak-h' + (open.length ? ' ak-h-open' : '');
  open.forEach(function (i) {
    var b0 = mk('button', 'btn btn-secondary btn-sm', 'Zahlung'); b0.type = 'button'; b0.onclick = function (ev) { ev.stopPropagation(); viewInvId = i.id; openPay(); };
    var b = mk('span'); b.style.cssText = 'display:inline-flex; flex-direction:column; align-items:flex-end; gap:5px; flex:none;'; var am = mk('b', '', eur(i.total - paidSum(i))); am.style.cssText = 'white-space:nowrap; color:#b45309;'; b.appendChild(am); b.appendChild(b0);
    var late = invLate(i), d = invDaysOld(i), row = hmRow(fmtD(i.date), nmEl(invNm(i)), i.nr + ' · offen' + (late ? ' · seit ' + d + ' Tagen überfällig' : ''), function () { viewInvoice(i.id); }, b);
    var tm0 = row.querySelector('.hm-time'); if (tm0) { var zd0 = fmtD(i.date); tm0.innerHTML = '<span class="hm-l">' + zd0 + '</span><span class="hm-s">' + zd0.slice(0, 6) + zd0.slice(8) + '</span>'; }
    row.classList.add(late ? 'hm-late' : 'hm-openp'); op.appendChild(row);
  });
  if (!open.length) op.appendChild(mk('div', 'hm-empty', 'Keine offenen Rechnungen. Alles bezahlt.'));
}
function openAusgabe(id) {
  agCur = id ? ausgaben.filter(function (a) { return a.id === id; })[0] : null;
  var sel = document.getElementById('ag-kat'); sel.innerHTML = ''; AUSG_KATS.forEach(function (k) { var o = mk('option', '', k); o.value = k; sel.appendChild(o); });
  document.getElementById('ag-title').textContent = agCur ? 'Ausgabe bearbeiten' : 'Neue Ausgabe';
  document.getElementById('ag-datum').value = agCur ? agCur.date : iso(new Date());
  document.getElementById('ag-betrag').value = agCur ? nf(agCur.betrag) : '';
  sel.value = agCur ? agCur.kat : AUSG_KATS[0];
  document.getElementById('ag-text').value = agCur ? agCur.text : '';
  document.getElementById('ag-del').style.display = agCur ? '' : 'none';
  openModal('modal-ausg');
}
function saveAusgabe() {
  var d = document.getElementById('ag-datum').value, b = r2(numIn(document.getElementById('ag-betrag').value));
  if (!d || b <= 0) { alert('Bitte Datum und einen Betrag größer als 0 angeben.'); return; }
  var a = agCur || { id: newId() };
  a.date = d; a.betrag = b; a.kat = document.getElementById('ag-kat').value; a.text = document.getElementById('ag-text').value.trim();
  if (!agCur) ausgaben.push(a);
  persist(); closeModal('modal-ausg'); renderZahlungen(); var st = document.getElementById('tab-statistik'); if (st && st.classList.contains('active') && typeof renderStat === 'function') renderStat();
}
async function deleteAusgabe() {
  if (!agCur || !await kaConfirm('Ausgabe löschen?')) return;
  ausgaben = ausgaben.filter(function (a) { return a !== agCur; }); persist(); closeModal('modal-ausg'); renderZahlungen();
}

