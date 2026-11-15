/* ===== Startseite ===== */
var MN3 = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
var WDL = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
function patOf(e) { return eventPatient(e); }
function hasAllergy(p) { var a = p && (p.allergien || '').trim().toLowerCase(); return !!a && a !== 'keine' && a !== '-' && a !== 'nein'; }
function hmRow(time, main, sub, onclick, extra, cls) {
  var r = mk('div', 'hm-row' + (cls ? ' ' + cls : '')); r.onclick = onclick;
  if (time !== null) r.appendChild(mk('div', 'hm-time', time));
  var m = mk('div', 'hm-main'); m.appendChild(main && main.nodeType ? main : document.createTextNode(main)); if (sub) m.appendChild(mk('small', '', sub)); r.appendChild(m);
  if (extra) r.appendChild(extra); return r;
}
function hmFill(id, rows, emptyTxt) {
  var b = document.getElementById(id); b.innerHTML = '';
  if (!rows.length) b.appendChild(mk('div', 'hm-empty', emptyTxt)); else rows.forEach(function (r) { b.appendChild(r); });
  if (id === 'hm-bday' || id === 'hm-order') { var cd = b.closest('.hc'); if (cd) cd.classList.toggle('hc-empty', !rows.length); }
}
/* Umsatzsteuer-Voranmeldung: Frist ist der 10. nach Ende des Zeitraums */
function ustvaInfo(now) {
  var m = settings.ustva || 'quartal'; if (m === 'aus') return null;
  var y = now.getFullYear(), mo = now.getMonth(), due, key, label;
  if (m === 'monat') {
    due = new Date(y, mo + (now.getDate() >= 10 ? 0 : -1), 10);
    var pm = new Date(due.getFullYear(), due.getMonth() - 1, 1); key = pm.getFullYear() + '-' + pad(pm.getMonth() + 1); label = MN[pm.getMonth()] + ' ' + pm.getFullYear();
  } else {
    var qm = [0, 3, 6, 9], cand = [];
    for (var yy = y - 1; yy <= y; yy++) qm.forEach(function (q) { cand.push(new Date(yy, q, 10)); });
    cand = cand.filter(function (d) { return d <= now; }); due = cand[cand.length - 1];
    var qEnd = new Date(due.getFullYear(), due.getMonth() - 1, 1), q = Math.floor(qEnd.getMonth() / 3) + 1; key = qEnd.getFullYear() + '-Q' + q; label = q + '. Quartal ' + qEnd.getFullYear();
  }
  return { key: key, label: label, due: due };
}
function monthSeries(year) {
  var rev = [], out = [], pat = [], ter = [], i;
  for (i = 0; i < 12; i++) { rev.push(0); out.push(0); pat.push(0); ter.push(0); }
  allPayments().forEach(function (p) { if (String(p.date).slice(0, 4) === String(year)) rev[+String(p.date).slice(5, 7) - 1] += p.amount; });
  allAusgaben().forEach(function (a) { if (a.date && String(a.date).slice(0, 4) === String(year)) out[+String(a.date).slice(5, 7) - 1] += a.betrag; });
  patients.forEach(function (p) { var d = new Date(p.erstellt); if (d.getFullYear() === +year) pat[d.getMonth()]++; });
  events.forEach(function (e) { if (String(e.date).slice(0, 4) === String(year)) ter[+String(e.date).slice(5, 7) - 1]++; });
  return { rev: rev, out: out, pat: pat, ter: ter };
}
function hmImportantRow(title, sub, fn, label, action) {
  var ex = null; if (label) { ex = mk('button', 'btn btn-secondary btn-sm', label); ex.type = 'button'; ex.onclick = function (ev) { ev.stopPropagation(); action(); }; }
  return hmRow(null, title, sub, fn, ex);
}
function renderHome() {
  if (!document.getElementById('hm-today')) return;
  var now = new Date(), today = iso(now), nowMin = now.getHours() * 60 + now.getMinutes(), h = now.getHours();
  var first = String(settings.inhaber || '').split(' ')[0];
  document.getElementById('hm-greet').textContent = 'Hallo' + (first ? ' ' + first : '');
  document.getElementById('hm-date').textContent = WDL[now.getDay()] + ', ' + now.getDate() + '. ' + MN[now.getMonth()] + ' ' + now.getFullYear();
  /* Deine Termine */
  var te = events.filter(function (e) { return e.date === today; }).sort(function (a, b) { return a.time.localeCompare(b.time); }), nextDone = false;
  document.getElementById('hm-tcount').textContent = te.length ? te.length + (te.length === 1 ? ' Termin' : ' Termine') : '';
  hmFill('hm-today', te.map(function (e) {
    var end = toMin(e.time) + (e.dur || 60), isNext = !nextDone && end > nowMin; if (isNext) nextDone = true;
    var p = patOf(e), ex = null, miss = p ? tplsForEvent(e).filter(function (t) { return tplState(p, t).s !== 'ok'; }) : [];
    if (hasAllergy(p) || miss.length) {
      ex = mk('div', 'hm-chips');
      if (hasAllergy(p)) ex.appendChild(mk('span', 'badge hm-allergy', 'Allergie: ' + p.allergien));
      var ml = miss.map(function (t) { return t.name + (tplState(p, t).s === 'offen' ? ' · Unterschrift' : ''); });
      if (ml.length > 2) { var c3 = mk('span', 'badge badge-amber', 'Offen: ' + ml.length + ' Unterlagen'); c3.title = ml.join('\n'); ex.appendChild(c3); }
      else ml.forEach(function (t) { var c2 = mk('span', 'badge badge-amber', 'Offen: ' + t); c2.title = t; ex.appendChild(c2); });
    }
    var endStr = pad(Math.floor(end / 60)) + ':' + pad(end % 60);
    var row = hmRow(e.time + ' bis ' + endStr, nmEl(eventPatientDisplay(e)), e.behandlung || '', function () { openAkteFromTermin(e.id); }, null, isNext ? 'next' : '');
    if (ex) row.querySelector('.hm-main').appendChild(ex);
    return row;
  }), 'Heute stehen keine Termine an.');
  /* Heute wichtig: nur, was heute erledigt werden muss */
  var imp = document.getElementById('hm-important'); imp.innerHTML = '';
  sortTodos(todos.filter(todoOpenToday)).forEach(function (t) { imp.appendChild(todoRow(t)); });
  var us = ustvaInfo(now);
  if (us && (settings.ustvaDone || []).indexOf(us.key) < 0) {
    var late = iso(us.due) < today;
    imp.appendChild(hmImportantRow('Umsatzsteuer-Voranmeldung ' + us.label, (late ? 'war am ' : 'fällig am ') + fmtD(iso(us.due)) + (late ? ' fällig' : ''), function () {}, 'Erledigt', function () { settings.ustvaDone = (settings.ustvaDone || []).concat([us.key]); persist(); }));
  }
  var low = lager.produkte.filter(function (p) { return p.min > 0 && bestand(p.id) < p.min; });
  low.forEach(function (p) { imp.appendChild(hmImportantRow('Lager: ' + p.name + ' unter Mindestmenge', qty(bestand(p.id)) + ' ' + (p.einheit || '') + ' vorhanden, Mindestmenge ' + qty(p.min), function () { switchTab('lager'); }, 'Zum Lager', function () { switchTab('lager'); })); });
  var expd = 0; lager.chargen.forEach(function (c) { if ((+c.rest || 0) > 0 && c.verfall && daysTo(c.verfall) < 0) expd++; });
  if (expd) imp.appendChild(hmImportantRow(expd + (expd === 1 ? ' Charge abgelaufen' : ' Chargen abgelaufen'), 'Bitte aus dem Bestand nehmen', function () { switchTab('lager'); }, 'Zum Lager', function () { switchTab('lager'); }));
  var ziel = parseInt(settings.zahlungsziel, 10) || 14;
  var verzug = invoices.filter(function (i) { return !invState(i).full && Math.round((new Date(today) - new Date(i.date)) / 86400000) > ziel; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
  verzug.slice(0, 3).forEach(function (i) { imp.appendChild(hmImportantRow('Zahlungsverzug: ' + invNm(i), i.nr + ' vom ' + fmtD(i.date) + ' · offen ' + eur(i.total - paidSum(i)), function () { viewInvoice(i.id); }, 'Zahlung', function () { viewInvId = i.id; openPay(); })); });
  if (verzug.length > 3) imp.appendChild(mk('div', 'hm-empty', 'und ' + (verzug.length - 3) + ' weitere überfällige Rechnungen'));
  patients.forEach(function (p) {
    var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(p.dob || ''); if (!m || +m[1] !== now.getDate() || +m[2] !== now.getMonth() + 1) return;
    imp.appendChild(hmRow(null, 'Geburtstag: ' + dnP(p), 'wird heute ' + (now.getFullYear() - +m[3]), function () { viewAkte(p); }, null, 'next'));
  });
  var lb = null; try { lb = kaGet('ka_lastbackup'); } catch (x) {}
  var days = lb ? Math.round((new Date(today) - new Date(iso(new Date(lb)))) / 86400000) : null;
  if (lb === null || days >= 2 || (days === 1 && h >= 12) || (days >= 1 && h >= 17)) imp.appendChild(hmImportantRow(lb === null ? 'Noch keine Datensicherung auf diesem Gerät' : days === 1 ? 'Heute noch nicht gesichert' : 'Letzte Datensicherung vor ' + days + ' Tagen', '', function () { exportData(); }, 'Jetzt sichern', function () { exportData(); }));
  if (!imp.children.length) imp.appendChild(mk('div', 'hm-empty', 'Heute nichts Dringendes.'));
  /* Geburtstage in den nächsten 7 Tagen (ab morgen) */
  var bd = [];
  patients.forEach(function (p) {
    var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(p.dob || ''); if (!m) return;
    for (var k = 1; k <= 7; k++) { var d = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), k); if (d.getMonth() === +m[2] - 1 && d.getDate() === +m[1]) { bd.push({ p: p, k: k, d: d, age: d.getFullYear() - +m[3] }); break; } }
  });
  bd.sort(function (a, b) { return a.k - b.k; });
  hmFill('hm-bday', bd.map(function (x) { return hmRow(null, nameKey(x.p), (x.k === 1 ? 'Morgen' : WDL[x.d.getDay()] + ', ' + x.d.getDate() + '. ' + MN[x.d.getMonth()]) + ' · wird ' + x.age, function () { viewAkte(x.p); }); }), 'Keine Geburtstage in den nächsten 7 Tagen.');
  /* Bestellungen, die nicht akut sind */
  var ord = [];
  lager.produkte.forEach(function (p) { var b = bestand(p.id); if (p.min > 0 && b >= p.min && b <= p.min * 1.5) ord.push({ t: p.name, s: 'Bestand ' + qty(b) + ' ' + (p.einheit || '') + ', Mindestmenge ' + qty(p.min) }); });
  lager.chargen.forEach(function (c) { if ((+c.rest || 0) > 0 && c.verfall) { var d = daysTo(c.verfall); if (d >= 0 && d <= 60) { var pr = prodOf(c.pid); ord.push({ t: (pr ? pr.name : '?') + ': Charge läuft ab', s: 'Charge ' + (c.nr || '-') + ' in ' + d + ' Tagen (' + fmtD(c.verfall) + ')' }); } } });
  hmFill('hm-order', ord.map(function (o) { return hmRow(null, o.t, o.s, function () { switchTab('lager'); }); }), 'Aktuell nichts nachzubestellen.');
  /* Behandlungsliste diese Woche */
  var wd = (now.getDay() + 6) % 7, wk = document.getElementById('hm-week'); wk.innerHTML = '';
  var any = false;
  for (var di = 0; di < 7; di++) {
    var dd = addDays(now, di - wd), k = iso(dd), ev = events.filter(function (e) { return e.date === k; }).sort(function (a, b) { return a.time.localeCompare(b.time); });
    if (!ev.length) continue; any = true;
    wk.appendChild(mk('div', 'hm-sec', WDL[dd.getDay()] + ', ' + dd.getDate() + '. ' + MN[dd.getMonth()] + (k === today ? ' (heute)' : '')));
    ev.forEach(function (e) { wk.appendChild(hmRow(e.time, nmEl(eventPatientDisplay(e)), e.behandlung || '', function () { openAkteFromTermin(e.id); })); });
  }
  if (!any) wk.appendChild(mk('div', 'hm-empty', 'Diese Woche stehen keine Termine an.'));
  /* Umsatz und Ausgaben des Jahres */
  var ms = monthSeries(now.getFullYear()), fin = document.getElementById('hm-fin'); fin.innerHTML = '';
  var tb = mk('table', 'pt'); tb.style.cssText = 'min-width:0; font-size:13.5px; white-space:nowrap;';
  var hd = tb.createTHead().insertRow(); ['Monat', 'Umsatz', 'Ausgaben', 'Umsatz kum.'].forEach(function (t) { var th = mk('th'); th.innerHTML = t === 'Umsatz kum.' ? '<span class="hm-l">Umsatz kum.</span><span class="hm-s">Kum.</span>' : t; hd.appendChild(th); });
  var bo = tb.createTBody(), cum = 0;
  for (var mi = 0; mi <= now.getMonth(); mi++) { cum += ms.rev[mi]; var r = bo.insertRow(); r.insertCell().textContent = MN3[mi]; r.insertCell().textContent = eurShort(ms.rev[mi]); r.insertCell().textContent = eurShort(ms.out[mi]); r.insertCell().textContent = eurShort(cum); }
  fin.appendChild(tb);
  /* offene Punkte */
  var nd = events.filter(function (e) { var end = toMin(e.time) + (e.dur || 60); return !e.alt && !dokFilled(e) && (e.date < today || (e.date === today && end <= nowMin)); }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); });
  var ndRows = nd.slice(0, 5).map(function (e) { return hmRow(null, nmEl(eventPatientDisplay(e)), fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : ''), function () { openDokuFromTermin(e.id); }); });
  if (nd.length > 5) ndRows.push(mk('div', 'hm-empty', 'und ' + (nd.length - 5) + ' weitere'));
  hmFill('hm-nodoku', ndRows, 'Alles dokumentiert.');
  var op = invoices.filter(function (i) { return !invState(i).full; }).sort(function (a, b) { return a.date.localeCompare(b.date); }), sum = 0;
  op.forEach(function (i) { sum += i.total - paidSum(i); });
  var opRows = op.slice(0, 5).map(function (i) { return hmRow(null, i.name, i.nr + ' vom ' + fmtD(i.date), function () { viewInvoice(i.id); }, mk('b', '', eur(i.total - paidSum(i)))); });
  if (op.length > 5) opRows.push(mk('div', 'hm-empty', 'und ' + (op.length - 5) + ' weitere'));
  if (op.length) opRows.push(mk('div', 'hm-empty', 'Offen insgesamt: ' + eur(sum)));
  hmFill('hm-open', opRows, 'Keine offenen Rechnungen.');
  var fm = flagsMap(), an = patients.filter(function (p) { return fm.get(p).anam; }).sort(function (a, b) { var x = fm.get(a).anam.e, y = fm.get(b).anam.e; return (x.date + x.time).localeCompare(y.date + y.time); });
  var anRows = an.slice(0, 5).map(function (p) { var z = fm.get(p).anam; return hmRow(null, nmEl(dnP(p)), 'Termin ' + fmtTermin(z.e) + ' · ' + anamText(z.info), function () { viewAkte(p); setAkTab('anl'); }); });
  if (an.length > 5) anRows.push(mk('div', 'hm-empty', 'und ' + (an.length - 5) + ' weitere'));
  hmFill('hm-anam', anRows, 'Alle Anamnesen für die nächsten Termine sind aktuell.');
}
/* Terminansicht (angelehnt an die Termin-Karte des Altsystems): Details, Schnellaktionen, Ablauf-Status */
var TV_PH = [['', 'Patient noch nicht erschienen', '#d9edf7', '#31708f', 'Patient im Warteraum'], ['Warteraum', 'Patient im Warteraum', '#fef3c7', '#92400e', 'Behandlung starten'], ['Behandlung', 'Patient in Behandlung', '#d1fae5', '#065f46', 'Abschließen'], ['Fertig', 'Behandlung abgeschlossen', '#e2e8f0', '#334155', 'Wieder öffnen'], ['Abgesagt', 'Termin abgesagt', '#fee2e2', '#991b1b', 'Wieder aktivieren']];
var TV_I = {
  merge: '<circle cx="6" cy="5.5" r="2.2"/><circle cx="6" cy="18.5" r="2.2"/><circle cx="18" cy="12" r="2.2"/><path d="M6 7.7v8.6M8.2 5.5c5.5 0 9.8 1.5 9.8 4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', cancel: '<circle cx="12" cy="12" r="9"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>', rx: '<path d="M7 4h7l4 4v12H7z"/><path d="M14 4v4h4M10 12h5M10 16h5"/>', wa: '<path d="M4 20l1.3-4A8 8 0 118 18.7z"/>', link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>', img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>', auto: '<path d="M4 12a8 8 0 0114-5l2-2v6h-6l2.2-2.2A5.5 5.5 0 006.5 12M20 12a8 8 0 01-14 5l-2 2v-6h6l-2.2 2.2A5.5 5.5 0 0017.5 12"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>', pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>', euro: '<path d="M17.5 6.5A7 7 0 107 17.5 7 7 0 0017.5 17.5M4 10.5h9M4 13.5h9"/>', book: '<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3z"/><path d="M5 17a3 3 0 013-3h11M9 8h6"/>', pill: '<path d="M10.5 20.5a4.95 4.95 0 01-7-7l10-10a4.95 4.95 0 017 7z"/><path d="M8.5 8.5l7 7"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>', phone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/>', down: '<path d="M6 9l6 6 6-6"/>', dots: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>', form: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', pencil2: '<path d="M4 20l4-1 11-11a2.1 2.1 0 00-3-3L5 16z"/>' };
function tvSvg(k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + TV_I[k] + '</svg>'; }
function tvIcon(k, title, fn) { var b = mk('button', 'tv-ib'); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.innerHTML = tvSvg(k); b.onclick = fn; return b; }
function tvTool(k, title, label, fn) { var b = mk('button', 'tv-ib tv-tool tt-' + k); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.setAttribute('data-tip', title); b.innerHTML = '<span class="tv-ic">' + tvSvg(k) + '</span><span class="tv-lbl">' + label + '</span>'; b.onclick = fn; return b; }
/* Text in die Zwischenablage; ok/fail werden danach aufgerufen */
function copyText(text, ok, fail) { (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(ok, fail); }
function tvCopy(text, btn) { copyText(text, function () { btn.style.color = '#16a34a'; setTimeout(function () { btn.style.color = ''; }, 1200); }, function () { alert(text); }); }
function tvPhase(e) { var k = e.phase || ''; return TV_PH.filter(function (x) { return x[0] === k; })[0] || TV_PH[0]; }
function setPhase(id, k) {
  var e = events.filter(function (x) { return x.id === id; })[0]; if (!e) return;
  e.phase = k; e.mod = Date.now(); persist(); renderCal(); if (document.getElementById('tab-start').classList.contains('active')) renderHome(); openTerminView(id, true);
}
function dupTermin(id) {
  var e = events.filter(function (x) { return x.id === id; })[0]; if (!e) return;
  closeModal('modal-tview'); openTermin(e.date, e.time);
  var ep = eventPatient(e); tPatientId = ep ? ep.id : null; document.getElementById('t-patient').value = ep ? nameKey(ep) : (e.patient || ''); document.getElementById('t-notiz').value = e.notiz || '';
  tLeist = evLeistungen(e).slice(); renderTLeist(); document.getElementById('t-farbe').value = e.color || '#16a34a';
  tDur = e.dur; document.getElementById('t-ende').value = fromMin(toMin(e.time) + e.dur); dLabel(e.dur);
}
function tvMail(p, vorlName, fallback) {
  curP = p; openMail();
  var n = (settings.nachrichten || []).filter(function (x) { return x.name === vorlName; })[0];
  if (n) { document.getElementById('m-vorl').value = n.id; applyMailVorl(); } else if (fallback) { document.getElementById('m-betreff').value = fallback[0]; document.getElementById('m-text').value = fillPlatzhalter(fallback[1], p); }
}
/* Terminbestätigung für genau diesen Termin: vorhandene Vorlage „Terminbestätigung (E-Mail)“, Datum und Uhrzeit dieses Termins */
function tvBestaetigung(p, e) {
  var v = NV_SCREENSHOTS_20261105.filter(function (x) { return x.name === 'Terminbestätigung (E-Mail)'; })[0];
  phEvent = e;
  try { tvMail(p, 'Terminbestätigung (E-Mail)', v ? [v.betreff, v.text] : null); } finally { phEvent = null; }
}
async function tvCancel(e, p) {
  if (!await kaConfirm('Termin am ' + fmtD(e.date) + ' um ' + e.time + ' absagen? Er bleibt als abgesagt im Kalender stehen.')) return;
  e.phase = 'Abgesagt'; e.mod = Date.now(); persist(); renderCal(); closeModal('modal-tview');
  if (p && p.email && await kaConfirm('Absagebestätigung per E-Mail an ' + nameKey(p) + ' vorbereiten?')) { setTimeout(function () { tvMail(p, 'Bestätigung Terminabsage (E-Mail)', ['Bestätigung Deiner Terminabsage', '{AnredeInformell},\n\nDein Termin am {TerminDatum} um {Uhrzeit} Uhr wurde erfolgreich abgesagt.\n\nManuel von Kreuzberg Ästhetik']); }, 100); }
}
function openTerminView(id, keep) {
  if (noClick) return;
  var e = events.filter(function (x) { return x.id === id; })[0]; if (!e) return;
  var p = patOf(e), box = document.getElementById('tv-body'); box.innerHTML = '';
  var ls = evLeistungen(e), cats = evKats(e), col = (cats[0] && cats[0].color) || e.color || '#94a3b8';
  var d = new Date(e.date + 'T12:00:00');
  /* Kopf: Streifen und blasse Fläche in der Kategoriefarbe, Name, Datum und Uhrzeit */
  var hd = mk('div', 'tv-hd'); hd.style.setProperty('--tvc', col);
  var hm = mk('div', 'tv-hm');
  var wen = mk('div', 'tv-wann'); var ganzT = e.time === fromMin(DSTART * 60) && e.dur === (DEND - DSTART) * 60;
  wen.innerHTML = WD[(d.getDay() + 6) % 7] + ', ' + d.getDate() + '. ' + MN[d.getMonth()].slice(0, 3) + '. · ' + (ganzT ? '<b>ganztägig</b>' : '<b>' + e.time + '</b> – <b>' + fromMin(toMin(e.time) + e.dur) + '</b> Uhr <span>(' + e.dur + ' min)</span>');
  hm.appendChild(wen);
  var nm = p ? (dnP(p) + (ageOf(p.dob) !== '' ? ' (' + ageOf(p.dob) + ')' : '')) : eventPatientName(e);
  var nl = mk('a', 'tv-name', nm); nl.href = '#'; nl.title = 'Patientenakte öffnen';
  if (p) nl.onclick = function (ev) { ev.preventDefault(); closeModal('modal-tview'); viewAkte(p); }; else { nl.removeAttribute('href'); nl.style.cursor = 'default'; nl.style.textDecoration = 'none'; }
  hm.appendChild(nl);
  if (p) { var fl = flagPills(p); if (fl.length) { var fw = mk('div', 'tv-fl'); fl.forEach(function (x) { x.style.marginLeft = '0'; fw.appendChild(x); }); hm.appendChild(fw); } }
  if (!p) hm.appendChild(mk('div', 'hm-empty', 'Keine Patientenakte angelegt'));
  hd.appendChild(hm);
  hd.appendChild(tvIcon('copy', 'Termin kopieren', function () { dupTermin(id); }));
  hd.appendChild(tvIcon('pen', 'Bearbeiten', function () { closeModal('modal-tview'); editTermin(id); }));
  hd.appendChild(tvIcon('x', 'Schließen', function () { closeModal('modal-tview'); }));
  box.appendChild(hd);
  /* Pillen: Anrufen, E-Mail */
  if (p && (p.phone || p.email)) {
    var pw = mk('div', 'tv-pills');
    if (p.phone) { var ph = mk('a', 'tv-pill'); ph.innerHTML = tvSvg('phone') + '<span>' + esc(p.phone) + '</span>'; ph.href = 'tel:' + p.phone.replace(/\s/g, ''); pw.appendChild(ph); }
    if (p.email) { var em = mk('button', 'tv-pill'); em.type = 'button'; em.innerHTML = tvSvg('mail') + '<span>E-Mail</span>'; em.title = p.email; em.onclick = function () { closeModal('modal-tview'); setTimeout(function () { curP = p; openMail(); }, 80); }; pw.appendChild(em); }
    box.appendChild(pw);
  }
  /* Kacheln: Leistung, Notiz, Dokumentation */
  var tl = mk('div', 'tv-tiles');
  var t1 = mk('div', 'tv-tile'); t1.appendChild(mk('small', '', 'Leistung'));
  var bs = mk('div');
  if (ls.length) { var w = mk('div'); w.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-bottom:6px;'; ls.forEach(function (n) { var l = findKat(n), c = l ? lkatOf(l) : null, cc = c ? c.color : '#94a3b8'; var ch = mk('span'); ch.style.cssText = 'display:inline-flex; align-items:center; gap:6px; border:1.5px solid ' + cc + '; border-radius:16px; padding:2px 10px; font-size:13px;'; var dt = mk('i'); dt.style.cssText = 'width:9px; height:9px; border-radius:50%; background:' + cc + ';'; ch.appendChild(dt); ch.appendChild(document.createTextNode(n)); w.appendChild(ch); }); bs.appendChild(w); }
  if (e.behandlung && ls.indexOf(e.behandlung) < 0 && e.behandlung !== ls.join(', ')) bs.appendChild(mk('div', '', e.behandlung));
  if (!bs.childNodes.length) bs.appendChild(mk('div', 'hm-empty', 'Keine Leistung eingetragen'));
  t1.appendChild(bs); tl.appendChild(t1);
  if (e.notiz) { var t2 = mk('div', 'tv-tile'); t2.appendChild(mk('small', '', 'Notiz')); var nt = mk('div', '', e.notiz); nt.style.cssText = 'font-size:14.5px; white-space:pre-wrap;'; t2.appendChild(nt); tl.appendChild(t2); }
  if (dokFilled(e)) { var t3 = mk('div', 'tv-tile'); t3.appendChild(mk('small', '', 'Dokumentation')); var ds = dokSummary(e); ds.onclick = function () { closeModal('modal-tview'); openDok(e.id); }; t3.appendChild(ds); tl.appendChild(t3); }
  box.appendChild(tl);
  /* Werkzeugleiste */
  var ac = mk('div', 'tv-acts');
  ac.appendChild(tvTool('book', 'Dokumentation', 'Dokumentation', function () { closeModal('modal-tview'); openDok(id); }));
  if (p) ac.appendChild(tvTool('euro', 'Rechnung erstellen', 'Rechnung', function () { closeModal('modal-tview'); setTimeout(function () { curP = p; invFromEvent(e); }, 80); }));
  if (p) ac.appendChild(tvTool('mail', 'Terminbestätigung versenden', 'Bestätigung', function () {
    if (!p.email) { alert('Für ' + nameKey(p) + ' ist keine E-Mail-Adresse hinterlegt.'); return; }
    closeModal('modal-tview'); setTimeout(function () { tvBestaetigung(p, e); }, 80);
  }));
  if (p) ac.appendChild(tvTool('pill', 'Rezept erstellen', 'Rezept', function () { closeModal('modal-tview'); setTimeout(function () { curP = p; openRx('e' + e.id); }, 80); }));
  if (p) {
    var fb = tvTool('form', 'Formulare und Unterlagen', 'Formulare', null); fb.classList.add('tv-menu'); fb.querySelector('.tv-ic').insertAdjacentHTML('beforeend', tvSvg('down'));
    fb.onclick = function (ev) { tlMenu(ev, [
      ['Anmeldebogen-Link senden', function () { closeModal('modal-tview'); setTimeout(function () { tvMail(p, 'Anmeldebogen Email', ['Dein Termin bei Kreuzberg Ästhetik', '{AnredeInformell},\n\nbitte fülle vor Deinem Termin am {NaechsterTermin} den Anmeldebogen aus:\n{LinkAnmeldung}\n\nManuel - Kreuzberg Ästhetik']); }, 80); }],
      ['Anamnesebogen-Link senden', function () { closeModal('modal-tview'); setTimeout(function () { tvMail(p, '', ['Anamnesebogen', '{AnredeInformell},\n\nbitte fülle vor Deinem Termin am {NaechsterTermin} den Anamnesebogen aus:\n{LinkAnamnese}\n\nManuel - Kreuzberg Ästhetik']); }, 80); }],
      ['Unterlagen zum Termin hinzufügen', function () { offerVorlagen(e); }]
    ]); };
    ac.appendChild(fb);
  }
  box.appendChild(ac);
  /* Abgesagt: kleiner Hinweis mit Rückgängig */
  if (e.phase === 'Abgesagt') {
    var cn = mk('div', 'tv-cancelled'); cn.appendChild(mk('span', '', 'Dieser Termin ist abgesagt.'));
    var un = mk('button', 'tv-btn', 'Wieder aktivieren'); un.type = 'button'; un.onclick = function () { setPhase(id, ''); }; cn.appendChild(un); box.appendChild(cn);
  }
  /* Fuß: nur Löschen */
  var ft = mk('div', 'tv-foot');
  var del = mk('button', 'tv-fbtn tv-fdel'); del.type = 'button'; del.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><span>Löschen</span>'; del.title = 'Termin löschen'; del.setAttribute('aria-label', 'Termin löschen'); del.type = 'button'; del.onclick = async function () { if (!await kaConfirm('Termin wirklich löschen?')) return; events = events.filter(function (x) { return x.id !== id; }); persist(); renderCal(); closeModal('modal-tview'); }; ft.appendChild(del);
  ft.appendChild(del);
  var fsp = mk('span'); fsp.style.flex = '1'; ft.appendChild(fsp);
  var fb = function (k, t, fn, lb) { var b = tvIcon(k, t, fn); b.className = 'tv-fbtn tf-' + k; b.innerHTML = tvSvg(k) + '<span>' + lb + '</span>'; ft.appendChild(b); };
  if (e.phase !== 'Abgesagt') fb('cancel', 'Termin absagen', function () { tvCancel(e, p); }, 'Absagen');
  box.appendChild(ft);
  if (!keep) openModal('modal-tview');
}
function openAkteFromTermin(id) {
  if (noClick) return;
  var e = events.filter(function (x) { return x.id === id; })[0]; if (!e) return;
  var p = patOf(e);
  if (!p) { editTermin(id); return; }
  viewAkte(p);
}
function openDokuFromTermin(id) {
  if (noClick) return;
  var e = events.filter(function (x) { return x.id === id; })[0];
  if (!e) return;
  var p = eventPatient(e);
  if (!p) { alert('Für diesen Termin ist kein Patient angelegt.'); return; }
  viewAkte(p);
  openDok(e.id);
}
function slotClick(e, k) {
  if (noClick || e.target.closest('.ev')) return;
  var y = e.clientY - e.currentTarget.getBoundingClientRect().top;
  var mins = START * 60 + Math.floor(y / H * 4) * 15;
  openTermin(k, pad(Math.floor(mins / 60)) + ':' + pad(mins % 60));
}

