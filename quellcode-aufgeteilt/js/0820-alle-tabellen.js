/* ===== Alle Tabellen: Klick auf die Spaltenüberschrift sortiert (Zahlen, Beträge, Daten, Monate, Text) ===== */
var TS_MON = ['jan', 'feb', 'mär', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dez'], tsState = new WeakMap(), tsTimers = new WeakMap();
function tsKey(txt) {
  var t = String(txt).replace(/\s+/g, ' ').trim();
  if (!t || t === '-' || t === '–') return { e: true };
  var m = t.length < 30 && /(\d{1,2})\.(\d{1,2})\.(\d{2,4})(?:,?\s*(\d{1,2}):(\d{2}))?/.exec(t);
  if (m) { var y = +m[3]; if (y < 100) y += 2000; return { n: y * 1e8 + (+m[2]) * 1e6 + (+m[1]) * 1e4 + (+(m[4] || 0)) * 100 + (+(m[5] || 0)) }; }
  var mo = TS_MON.indexOf(t.toLowerCase().replace('.', '')); if (mo >= 0 && t.length <= 4) return { n: mo };
  var t2 = t.replace(/[€%\s#]|min$|Stk$/g, '');
  if (/^-?\d{1,3}(\.\d{3})*(,\d+)?$/.test(t2) || /^-?\d+(,\d+)?$/.test(t2)) return { n: parseFloat(t2.replace(/\./g, '').replace(',', '.')) };
  return { s: t };
}
function tsSort(table) {
  var st = tsState.get(table), tb = table.tBodies[0]; if (!st || !tb) return;
  var rows = [].slice.call(tb.rows); if (rows.length < 2 || rows.some(function (r) { return r.cells.length < 2; })) return;
  var keyed = rows.map(function (r, i) { return { r: r, i: i, k: tsKey(r.cells[st.col] ? r.cells[st.col].textContent : '') }; });
  keyed.sort(function (a, b) {
    if (a.k.e !== b.k.e) return a.k.e ? 1 : -1; if (a.k.e) return a.i - b.i;
    var d; if (a.k.n != null && b.k.n != null) d = a.k.n - b.k.n; else if (a.k.n != null) d = -1; else if (b.k.n != null) d = 1; else d = String(a.k.s).localeCompare(String(b.k.s), 'de', { numeric: true, sensitivity: 'base' });
    return (d * st.dir) || (a.i - b.i);
  });
  var ob = tsTimers.get(table); if (ob) ob.disconnect();
  keyed.forEach(function (x) { tb.appendChild(x.r); });
  if (ob) ob.observe(tb, { childList: true });
  [].forEach.call(table.querySelectorAll('thead th'), function (th, i) { if (!th.hasAttribute('onclick')) th.removeAttribute('data-sd'); if (i === st.col) th.setAttribute('data-sd', String(st.dir)); });
}
document.addEventListener('click', function (ev) {
  var th = ev.target.closest && ev.target.closest('table.pt thead th');
  if (!th || th.hasAttribute('onclick') || ev.target.closest('button, a, input, select')) return;
  var table = th.closest('table'), st = tsState.get(table), col = th.cellIndex;
  if (st && st.col === col) st.dir = -st.dir; else tsState.set(table, st = { col: col, dir: 1 });
  var tb = table.tBodies[0];
  if (tb && !tsTimers.get(table)) { var tm = null, ob = new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(function () { tsSort(table); }, 0); }); tsTimers.set(table, ob); ob.observe(tb, { childList: true }); }
  tsSort(table);
});
/* Alle Rechnungen auf Auffälligkeiten prüfen */
function invCheck() {
  var box = document.getElementById('ichk-body'); box.innerHTML = '';
  var groups = [], byNr = {}, num = {};
  invoices.forEach(function (i) { (byNr[i.nr] = byNr[i.nr] || []).push(i); var m = /^(\d{4})-(\d+)$/.exec(i.nr); if (m) (num[m[1]] = num[m[1]] || {})[parseInt(m[2], 10)] = 1; });
  var g1 = []; Object.keys(byNr).forEach(function (k) { if (byNr[k].length > 1) byNr[k].forEach(function (i) { g1.push({ i: i, t: 'Nummer ' + k + ' kommt ' + byNr[k].length + '× vor' }); }); });
  groups.push(['Doppelte Rechnungsnummern', g1]);
  var seen = {}, g2 = []; invoices.forEach(function (i) { if (i.storniert || i.total <= 0) return; var k = i.pid + '|' + i.date + '|' + i.total; (seen[k] = seen[k] || []).push(i); });
  Object.keys(seen).forEach(function (k) { var l = seen[k].filter(function (i) { return seen[k].some(function (x) { return x !== i && x.nr !== i.nr; }); }); l.forEach(function (i) { g2.push({ i: i, t: 'Gleicher Patient, Datum und Betrag wie ' + seen[k].filter(function (x) { return x !== i && x.nr !== i.nr; }).map(function (x) { return x.nr; }).join(', ') }); }); });
  groups.push(['Mögliche Doppelte (gleicher Patient, Datum und Betrag)', g2]);
  var g3 = []; Object.keys(num).forEach(function (y) { var mx = 0; Object.keys(num[y]).forEach(function (n) { if (+n > mx) mx = +n; }); var miss = []; for (var n = 1; n <= mx; n++) if (!num[y][n]) miss.push(y + '-' + ('00000' + n).slice(-5)); if (miss.length) g3.push({ t: 'Fehlende Nummern in ' + y + ': ' + miss.slice(0, 20).join(', ') + (miss.length > 20 ? ' … (' + miss.length + ' insgesamt)' : '') }); });
  groups.push(['Lücken in der Nummernfolge', g3]);
  var g4 = []; invoices.forEach(function (i) {
    if (i.storniert) return; var paid = paidSum(i), sum = r2((i.items || []).reduce(function (a, x) { return a + (x.amount || 0); }, 0));
    if (paid > i.total + 0.015) g4.push({ i: i, t: 'Zahlungen (' + eur(paid) + ') sind höher als der Betrag (' + eur(i.total) + ')' });
    if ((i.items || []).length && Math.abs(sum - i.total) > 0.015) g4.push({ i: i, t: 'Positionen (' + eur(sum) + ') ergeben nicht den Betrag (' + eur(i.total) + ')' });
  });
  groups.push(['Beträge, die nicht passen', g4]);
  var total = groups.reduce(function (a, g) { return a + g[1].length; }, 0);
  var head = mk('div', '', invoices.length + ' Rechnungen geprüft. ' + (total ? total + ' Auffälligkeit(en).' : 'Keine Auffälligkeiten.')); head.style.cssText = 'font-size:14px; margin-bottom:10px; color:' + (total ? '#b45309' : '#166534') + '; font-weight:600;'; box.appendChild(head);
  groups.forEach(function (g) {
    var h = mk('div', 'ak-h', g[0] + ' (' + g[1].length + ')'); box.appendChild(h);
    if (!g[1].length) { var ok = mk('div', 'hm-empty', 'In Ordnung.'); box.appendChild(ok); return; }
    g[1].forEach(function (x) {
      var row = mk('div'); row.style.cssText = 'display:flex; flex-wrap:wrap; gap:2px 10px; align-items:center; padding:8px 0; border-bottom:1px solid #eef2f6; font-size:13.5px;';
      if (x.i) { var b = mk('button', 'pn', x.i.nr); b.type = 'button'; b.style.flex = 'none'; b.onclick = function () { closeModal('modal-invchk'); viewInvoice(x.i.id); }; row.appendChild(b); row.appendChild(mk('span', '', fmtD(x.i.date) + ' · ' + x.i.name)); }
      var t = mk('span', '', x.t); t.style.cssText = 'color:#64748b; flex:1 1 100%; font-size:12.5px;'; row.appendChild(t); box.appendChild(row);
    });
  });
  openModal('modal-invchk');
}

/* Rechnungsansicht nach Vorbild der Praxisrechnung */
function invoiceDOM(inv) {
  var w = mk('div'); w.style.cssText = 'font-size:13px; color:#111; line-height:1.45; min-width:560px;';
  var dk0 = invIsDraft(inv), st = dk0 ? { full: true } : invState(inv), pays = inv.payments || [];
  var top = mk('div'); top.style.cssText = 'display:grid; grid-template-columns:90px 1fr 190px; align-items:start; gap:8px;';
  var logo = document.createElement('img'); var li = document.getElementById('inv-logo');
  if (li) logo.src = li.src; logo.style.cssText = 'width:70px; height:70px;'; logo.alt = '';
  var mid = mk('div'); mid.style.cssText = 'text-align:center; padding-top:6px;';
  var tt = PRAXIS.kopf.split(' - ');
  var t1 = mk('div', '', tt[0]); t1.style.cssText = 'font-family:Georgia,"Times New Roman",serif; font-size:26px;'; mid.appendChild(t1);
  if (tt[1]) { var t2 = mk('div', '', tt[1]); t2.style.cssText = 'font-family:Georgia,"Times New Roman",serif; font-size:13px;'; mid.appendChild(t2); }
  var pr = mk('div'); pr.style.cssText = 'text-align:right; font-size:12px; color:#333;';
  [PRAXIS.strasse, PRAXIS.ort, 'Tel. ' + PRAXIS.tel].forEach(function (t) { pr.appendChild(mk('div', '', t)); });
  if (settings.ustid) pr.appendChild(mk('b', '', 'UID: ' + settings.ustid));
  top.appendChild(logo); top.appendChild(mid); top.appendChild(pr); w.appendChild(top);
  var two = mk('div'); two.style.cssText = 'display:flex; justify-content:space-between; gap:16px; margin-top:22px; align-items:flex-start;';
  var rc = splitRecipient(inv), left = mk('div'); left.style.fontSize = '13px';
  if (rc.anrede) left.appendChild(mk('b', '', rc.anrede));
  rc.lines.forEach(function (t) { left.appendChild(mk('div', '', t)); });
  var right = mk('div'); right.style.cssText = 'width:230px; font-size:12px; color:#333;';
  right.appendChild(mk('b', '', dk0 ? DRAFT[inv.kind].kopf : 'RECHNUNG'));
  (dk0 ? [['Datum:', fmtD(inv.date)]] : [['Rechnungsnummer:', inv.nr], ['Rechnungsdatum:', fmtD(inv.date)], ['Zahlungsstatus:', invStatusText(inv)]]).forEach(function (m) {
    var r = mk('div'); r.style.cssText = 'display:flex; justify-content:space-between; gap:8px;'; r.appendChild(mk('span', '', m[0])); r.appendChild(mk('span', '', m[1])); right.appendChild(r);
  });
  two.appendChild(left); two.appendChild(right); w.appendChild(two);
  if (inv.vortext) { var vt = mk('div', '', inv.vortext); vt.style.cssText = 'white-space:pre-wrap; margin-top:18px;'; w.appendChild(vt); }
  var tab = mk('table', 'inv2'); tab.style.marginTop = '18px'; var th = mk('thead'), hr = mk('tr');
  [['Datum', ''], ['Menge', 'c'], ['Position', ''], ['MwSt-%', 'c'], ['Brutto', 'r']].forEach(function (c) { hr.appendChild(mk('th', c[1], c[0])); });
  th.appendChild(hr); tab.appendChild(th); var tb = mk('tbody');
  inv.items.forEach(function (it) {
    var tr = mk('tr'), rate = it.rate != null ? it.rate : 0, amt = it.amount != null ? it.amount : r2(it.qty * it.price);
    tr.appendChild(mk('td', '', it.rabatt ? '' : fmtD(it.datum || inv.leistung)));
    tr.appendChild(mk('td', 'c', it.rabatt ? '' : String(it.qty).replace('.', ',')));
    var ptd = mk('td', '', it.text); if (it.note) { var pn = mk('div', '', it.note); pn.style.cssText = 'font-size:11.5px; color:#444; margin-top:2px; white-space:pre-wrap;'; ptd.appendChild(pn); }
    tr.appendChild(ptd); tr.appendChild(mk('td', 'c', rate + '%')); tr.appendChild(mk('td', 'r', eurP(amt)));
    tb.appendChild(tr);
  });
  tab.appendChild(tb); w.appendChild(tab);
  var c = invCalc(inv), sm = mk('table', 'inv-sum'), smb = mk('tbody');
  var addSum = function (label, val, big) {
    var tr = mk('tr'), a = mk('td', '', label), b = mk('td', '', eurP(val)); b.style.textAlign = 'right';
    if (big) { a.style.cssText = 'font-weight:700; font-size:16px; border-bottom:none;'; b.style.cssText += 'font-weight:700; font-size:16px; border-bottom:none;'; }
    tr.appendChild(a); tr.appendChild(b); smb.appendChild(tr);
  };
  addSum('Gesamt Netto', c.net); c.vr.forEach(function (v) { addSum(v.label, v.val); });
  smb.lastChild.querySelectorAll('td').forEach(function (td) { td.style.borderBottom = '2px solid #111'; });
  addSum('Gesamt', inv.total, true);
  sm.appendChild(smb); w.appendChild(sm);
  if (pays.length) {
    var zt = mk('div', '', 'ZAHLUNGEN'); zt.style.cssText = 'font-size:12px; font-weight:700; margin-top:16px;'; w.appendChild(zt);
    var zb = mk('div'); zb.style.cssText = 'border:1px dashed #333; padding:8px 10px; margin-top:6px; font-size:13px;';
    pays.forEach(function (p) {
      var r = mk('div'); r.style.cssText = 'display:flex; gap:30px; flex-wrap:wrap; margin-bottom:4px;';
      var l = mk('div'); l.style.minWidth = '220px'; var l1 = mk('div'); l1.appendChild(mk('b', '', p.nr)); l1.appendChild(document.createTextNode(' (' + p.art + ')'));
      var l2 = mk('div'); l2.appendChild(mk('b', '', eurP(p.amount))); l2.appendChild(document.createTextNode(' am ' + fmtD(p.date)));
      l.appendChild(l1); l.appendChild(l2); r.appendChild(l); r.appendChild(mk('div', '', eurP(p.amount) + ' für ' + inv.nr)); zb.appendChild(r);
    });
    w.appendChild(zb);
  }
  if (inv.hinweis) { var hd = mk('div', '', inv.hinweis); hd.style.cssText = 'white-space:pre-wrap; margin-top:12px;'; w.appendChild(hd); }
  if (inv.doku) { var dk = mk('div'); dk.style.cssText = 'margin-top:12px; font-size:12.5px;'; dk.appendChild(mk('b', '', 'Behandlungsdokumentation')); var dt = mk('div', '', inv.doku); dt.style.whiteSpace = 'pre-wrap'; dk.appendChild(dt); w.appendChild(dk); }
  if (!st.full) {
    if (inv.zahlung && inv.showHint !== false) { var zd = mk('div', '', inv.zahlung); zd.style.cssText = 'white-space:pre-wrap; margin-top:12px;'; w.appendChild(zd); }
    var hasI = !!settings.iban && inv.showQr !== false, hasP = !!settings.paypal && inv.showQr !== false;
    if (hasI || hasP) {
      var ps = mk('div', '', 'Den Betrag kannst Du auf mein Konto' + (hasP ? ' oder via PayPal' : '') + ' überweisen.'); ps.style.cssText = 'text-align:center; margin-top:18px; font-size:13px;'; w.appendChild(ps);
      var bx = mk('div'); bx.style.cssText = 'display:flex; margin-top:8px;';
      var mkBox = function (qr, lines, right) {
        var b = mk('div'); b.style.cssText = 'flex:1; border:1.5px solid #111; padding:6px; display:flex; align-items:center; gap:10px; min-height:60px;' + (right ? ' flex-direction:row-reverse; text-align:right;' : '');
        if (qr) { b.appendChild(qrSvg(qr, 56)); }
        var tx = mk('div'); tx.style.cssText = 'font-size:14px; line-height:1.9; flex:1;'; lines.forEach(function (t) { tx.appendChild(mk('div', '', t)); }); b.appendChild(tx); return b;
      };
      if (hasI) bx.appendChild(mkBox((settings.iban && qrMake(epcFor(inv))) || null, [settings.inhaber || '', settings.iban], false));
      if (hasP) bx.appendChild(mkBox(qrPaypal() ? QRM.pp : null, ['PayPal', settings.paypal], true));
      w.appendChild(bx);
    }
  }
  var so = mk('div'); so.style.cssText = 'margin-top:18px; font-size:13px;'; so.appendChild(mk('div', '', 'Bis zum nächsten Mal')); so.appendChild(mk('div', '', 'Manuel')); w.appendChild(so);
  var ft = mk('div', '', PRAXIS.mail + '   •   ' + PRAXIS.web); ft.style.cssText = 'text-align:center; font-size:11px; color:#444; margin-top:26px;'; w.appendChild(ft);
  return w;
}
function viewInvoice(id) {
  viewInvId = id; var inv = invCur(); if (!inv) return;
  var box = document.getElementById('inv-view'); box.innerHTML = ''; box.appendChild(invoiceDOM(inv)); if (!invIsDraft(inv)) box.appendChild(invPayBlock(inv));
  document.getElementById('inv-pay-btn').style.display = invIsDraft(inv) || invState(inv).full ? 'none' : 'inline-block';
  document.getElementById('inv-kv-btn').style.display = inv.kind === 'kv' ? '' : 'none';
  document.getElementById('inv-copykv-btn').style.display = invIsDraft(inv) ? 'none' : '';
  var statusBtn = document.getElementById('inv-send-status-btn'); if (statusBtn) { statusBtn.style.display = inv.kind === 'kv' ? 'none' : 'inline-flex'; statusBtn.title = invSent(inv) ? 'Als nicht versendet markieren' : 'Als versendet markieren'; statusBtn.setAttribute('aria-label', statusBtn.title); statusBtn.style.color = invSent(inv) ? '#15803d' : '#64748b'; }
  var sb = document.getElementById('inv-send-btn'), sl = invIsDraft(inv) ? DRAFT[inv.kind].name + ' senden' : 'Rechnung senden'; sb.title = sl; sb.setAttribute('aria-label', sl);
  openModal('modal-invview');
}
async function deleteInvoice() {
  var inv = invCur(); if (!inv) return;
  if (invIsDraft(inv)) {
    if (!await kaConfirm(DRAFT[inv.kind].name + ' für ' + inv.name + ' (' + eur(inv.total) + ') wirklich löschen?')) return;
    entw = entw.filter(function (i) { return i !== inv; }); persist(); closeModal('modal-invview'); invTab = inv.kind === 'test' ? 'test' : 'rechnung'; renderInvoices(); return;
  }
  var paid = paidSum(inv), np = (inv.payments || []).length;
  var msg = 'Rechnung ' + inv.nr + ' für ' + inv.name + ' (' + eur(inv.total) + ') wirklich löschen?\n\n'
    + (np ? (np === 1 ? 'Die Zahlung' : 'Die ' + np + ' Zahlungen') + ' (' + eur(paid) + ') dazu ' + (np === 1 ? 'wird' : 'werden') + ' ebenfalls gelöscht und ' + (np === 1 ? 'fehlt' : 'fehlen') + ' dann in Statistik und Zahlungen.\n\n' : '')
    + 'Bereits versendete Rechnungen müssen aus steuerlichen Gründen aufbewahrt werden. Lösche nur Testrechnungen oder Fehlerfassungen.';
  if (!await kaConfirm(msg)) return;
  invoices = invoices.filter(function (i) { return i !== inv; });
  persist(); closeModal('modal-invview'); renderInvoices();
  if (document.getElementById('tab-zahlungen') && document.getElementById('tab-zahlungen').classList.contains('active')) renderZahlungen();
  if (document.getElementById('tab-statistik') && document.getElementById('tab-statistik').classList.contains('active')) renderStat();
  if (document.getElementById('tab-start').classList.contains('active')) renderHome();
  if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
}
var payCur = null;
function payFill(art, amount, date, titel, edit) {
  var sel = document.getElementById('pay-art'); if (![].some.call(sel.options, function (o) { return o.text === art; })) sel.appendChild(mk('option', '', art));
  sel.value = art; document.getElementById('pay-betrag').value = nf(amount); document.getElementById('pay-datum').value = date;
  document.getElementById('pay-title').textContent = titel; document.getElementById('pay-del').style.display = edit ? '' : 'none';
  openModal('modal-pay');
}
function openPay() {
  var inv = invCur(); if (!inv) return; payCur = null;
  payFill('Überweisung', Math.max(0, inv.total - paidSum(inv)), iso(new Date()), 'Zahlung erfassen', false);
}
/* Vorhandene Zahlung ändern oder löschen; ref = Eintrag in inv.payments, ohne ref = alter Vermerk "bezahlt" */
function openPayEdit(invId, ref) {
  viewInvId = invId; var inv = invCur(); if (!inv) return;
  payCur = ref ? { ref: ref } : { legacy: true };
  payFill(ref ? ref.art : 'Überweisung', ref ? ref.amount : inv.total, ref ? ref.date : inv.date, 'Zahlung bearbeiten', true);
}
function payRefresh(inv, openView) {
  renderInvoices();
  if (openView || document.getElementById('modal-invview').classList.contains('active')) viewInvoice(inv.id);
  ['zahlungen', 'statistik'].forEach(function (t) { var el = document.getElementById('tab-' + t); if (el && el.classList.contains('active') && typeof window[TAB_RENDER[t]] === 'function') window[TAB_RENDER[t]](); });
  if (document.getElementById('tab-start').classList.contains('active')) renderHome();
  try { renderPatients(); } catch (x) {}
  if (curP && document.getElementById('modal-akte').classList.contains('active')) { renderVerlauf(); }
}
function savePay() {
  var inv = invCur(); if (!inv) return;
  var amount = r2(numIn(document.getElementById('pay-betrag').value)), date = document.getElementById('pay-datum').value, art = document.getElementById('pay-art').value;
  if (amount <= 0 || !date) { alert('Bitte Betrag und Datum angeben.'); return; }
  if (payCur && payCur.ref) { payCur.ref.art = art; payCur.ref.amount = amount; payCur.ref.date = date; }
  else if (payCur && payCur.legacy) { inv.paid = false; inv.payments = (inv.payments || []).concat([{ nr: nextPayNr(date), art: art, amount: amount, date: date }]); }
  else inv.payments = (inv.payments || []).concat([{ nr: nextPayNr(date), art: art, amount: amount, date: date }]);
  var wasEdit = !!payCur; payCur = null;
  persist(); closeModal('modal-pay'); payRefresh(inv, !wasEdit);
}
async function deletePay() {
  var inv = invCur(); if (!inv || !payCur) return;
  if (!await kaConfirm('Diese Zahlung löschen? Die Rechnung gilt danach wieder als offen bzw. teilbezahlt.')) return;
  if (payCur.ref) inv.payments = (inv.payments || []).filter(function (x) { return x !== payCur.ref; }); else inv.paid = false;
  payCur = null; persist(); closeModal('modal-pay'); payRefresh(inv, false);
}
/* Zahlungen unter der Rechnung (nur am Bildschirm) */
function invPayBlock(inv) {
  var w = mk('div', 'no-print'), pays = inv.payments || []; if (!pays.length && !inv.paid) return w;
  w.style.cssText = 'margin-top:16px; padding-top:10px; border-top:1px dashed #cbd5e1; font-size:13px; color:#334155;';
  var h = mk('b', '', 'Zahlungen'); h.style.cssText = 'display:block; margin-bottom:4px;'; w.appendChild(h);
  var line = function (txt, fn) {
    var r = mk('div'); r.style.cssText = 'display:flex; align-items:center; gap:8px; padding:3px 0;'; var t = mk('span', '', txt); t.style.flex = '1'; t.style.cursor = 'pointer'; t.onclick = fn; r.appendChild(t);
    var b = mk('button', 'x-btn ra-pen'); b.type = 'button'; b.title = 'Zahlung bearbeiten'; b.setAttribute('aria-label', 'Zahlung bearbeiten'); b.innerHTML = tvSvg('pen'); b.firstChild.style.cssText = 'width:16px;height:16px;'; b.onclick = fn; r.appendChild(b); w.appendChild(r);
  };
  if (pays.length) pays.forEach(function (x) { line(fmtD(x.date) + ' · ' + x.art + ' · ' + eur(x.amount), function () { openPayEdit(inv.id, x); }); });
  else line('Als bezahlt vermerkt (' + eur(inv.total) + ')', function () { openPayEdit(inv.id, null); });
  return w;
}
