/* ===== GOÄ: Festpreis bleibt, der Steigerungsfaktor wird daraus zurückgerechnet (Punktwert 5,82873 Cent) ===== */
var GOAE_PW = 0.0582873;
/* Auswahl belegter GOÄ-Nummern (Gebührenverzeichnis; BÄK GOÄ-Ratgeber „Faltenunterspritzung“, DÄ 2022;119(13):A 584). Nur Vorschläge, die Zuordnung trifft der Arzt. */
var GOAE_VORSCHLAEGE = [
  { nr: '1', pkt: 80, text: 'Beratung', hint: 'Neben Leistungen der Abschnitte C bis O im Behandlungsfall nur einmal berechnungsfähig.' },
  { nr: '3', pkt: 150, text: 'Eingehende Beratung, mindestens 10 Minuten', hint: 'Nur als einzige Leistung oder zusammen mit einer Untersuchung nach Nr. 5, 6, 7, 8, 800 oder 801.' },
  { nr: '5', pkt: 80, text: 'Symptombezogene Untersuchung', hint: 'Laut BÄK neben der Faltenunterspritzung berechnungsfähig, wenn erbracht.' },
  { nr: '7', pkt: 160, text: 'Vollständige Untersuchung des gesamten Hautorgans', hint: 'Umfasst Haut, Hautanhangsgebilde und sichtbare Schleimhäute.' },
  { nr: '252', pkt: 40, text: 'Injektion, subkutan, submukös, intrakutan oder intramuskulär', hint: '' },
  { nr: '267', pkt: 80, text: 'Medikamentöse Infiltrationsbehandlung im Bereich einer Körperregion, je Sitzung', hint: 'Laut BÄK für Botulinumtoxin oder Hyaluronsäure, wenn eine Seite bzw. eine Region behandelt wird (z. B. eine Wange). Nur eine der Nrn. 267/268 je Sitzung.' },
  { nr: '268', pkt: 130, text: 'Medikamentöse Infiltrationsbehandlung im Bereich mehrerer Körperregionen (auch eine Körperregion beidseitig), je Sitzung', hint: 'Laut BÄK, wenn über die Mittellinie oder beidseitig behandelt wird (ganze Stirn, ganzes Kinn, beide Wangen). Nicht neben Nr. 267.' }
];
function lsGoaePick(v) {
  var g = GOAE_VORSCHLAEGE.filter(function (x) { return x.nr === v; })[0], h = document.getElementById('ls-goae-hint'); if (!g) { if (h) h.textContent = ''; return; }
  document.getElementById('ls-goae').value = g.nr; document.getElementById('ls-pkt').value = String(g.pkt); document.getElementById('ls-analog').checked = false; document.getElementById('ls-goaetext').value = g.text;
  if (h) h.textContent = g.hint ? 'Hinweis: ' + g.hint : '';
  lsFaktorInfo();
}
function goaeFaktor(bruttoEinzel, rate, pkt) { var net = (+bruttoEinzel || 0) / (1 + (+rate || 0) / 100); return pkt > 0 ? Math.round(net / (pkt * GOAE_PW) * 100) / 100 : 0; }
function goaeFx(f) { return String(f).replace('.', ','); }
function goaeLine(g) {
  if (!g || !g.nr) return '';
  return 'GOÄ ' + (g.analog ? 'A ' + g.nr + ' (entsprechend Nr. ' + g.nr + ')' : 'Nr. ' + g.nr) + (g.text ? ', ' + g.text : '') + ' · Faktor ' + goaeFx(g.faktor) + (g.begr ? ' · Begründung: ' + g.begr : '');
}
function goaeFromKatalog(name, bruttoEinzel, rate) {
  var k = (settings.katalog || []).filter(function (x) { return x.name.trim().toLowerCase() === String(name || '').trim().toLowerCase(); })[0];
  if (!k || !k.goae || !(k.pkt > 0)) return null;
  return { nr: k.goae, analog: !!k.analog, text: k.goaeText || '', pkt: k.pkt, begr: k.begr || '', faktor: goaeFaktor(Math.abs(bruttoEinzel), rate, k.pkt) };
}
function goaeNote(inv) {
  if (!(inv.items || []).some(function (i) { return i.goae; })) return '';
  return 'Abrechnung nach der Gebührenordnung für Ärzte (GOÄ), Punktwert 5,82873 Cent.' + (inv.honorarVom ? ' Steigerungsfaktor gemäß Honorarvereinbarung nach § 2 GOÄ vom ' + inv.honorarVom + '.' : '');
}
function lsFaktorInfo() {
  var el = document.getElementById('ls-faktor'); if (!el) return;
  var pkt = numIn(document.getElementById('ls-pkt').value), pr = numIn(document.getElementById('ls-price').value), rt = parseInt(document.getElementById('ls-rate').value, 10);
  if (!(pkt > 0) || !(pr > 0)) { el.textContent = 'Mit Punktzahl und Preis wird der Steigerungsfaktor berechnet.'; el.style.color = '#64748b'; return; }
  var f = goaeFaktor(pr, rt, pkt);
  el.textContent = 'Steigerungsfaktor ' + goaeFx(f) + ' (Preis ' + nf(pr) + ' € brutto, ' + rt + ' % MwSt, ' + pkt + ' Punkte × 5,82873 Cent)' + (f > 3.5 ? ' · über dem Höchstsatz 3,5: nur mit Honorarvereinbarung' : f > 2.3 ? ' · über dem Schwellenwert 2,3' : '');
  el.style.color = f > 3.5 ? '#b45309' : '#166534';
}
function openLeist(i) {
  lsIdx = i; var k = i >= 0 ? settings.katalog[i] : null;
  document.getElementById('ls-title').textContent = k ? 'Leistung bearbeiten' : 'Neue Leistung';
  document.getElementById('ls-name').value = k ? k.name : '';
  document.getElementById('ls-price').value = k ? nf(k.price) : '';
  document.getElementById('ls-rate').value = k ? String(k.rate) : '19';
  document.getElementById('ls-goae').value = k && k.goae || ''; document.getElementById('ls-pkt').value = k && k.pkt ? String(k.pkt).replace('.', ',') : ''; document.getElementById('ls-analog').checked = !!(k && k.analog);
  document.getElementById('ls-goaetext').value = k && k.goaeText || ''; document.getElementById('ls-begr').value = k && k.begr || '';
  document.getElementById('ls-goae-box').open = !!(k && k.goae); lsFaktorInfo();
  var gp = document.getElementById('ls-goae-pick'); gp.innerHTML = ''; var g0 = mk('option', '', 'Nummer aus der Liste wählen …'); g0.value = ''; gp.appendChild(g0);
  GOAE_VORSCHLAEGE.forEach(function (g) { var o = mk('option', '', 'Nr. ' + g.nr + ' · ' + g.pkt + ' Punkte · ' + g.text); o.value = g.nr; gp.appendChild(o); });
  document.getElementById('ls-goae-hint').textContent = '';
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
  var gnr = document.getElementById('ls-goae').value.trim(), gpk = numIn(document.getElementById('ls-pkt').value);
  if (gnr && !(gpk > 0)) { alert('Bitte zur GOÄ-Nummer auch die Punktzahl eingeben.'); return; }
  if (gnr) { k.goae = gnr; k.pkt = gpk; k.analog = document.getElementById('ls-analog').checked; k.goaeText = document.getElementById('ls-goaetext').value.trim(); k.begr = document.getElementById('ls-begr').value.trim(); }
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
/* Fortlaufende Rechnungsnummer JJJJ-NNNNN */
function invNextNr(datum) {
  var yr = String(datum).slice(0, 4), seq = 0;
  invoices.forEach(function (i) { var m = /^(?:RE-)?(\d{4})-(\d+)$/.exec(i.nr); if (m && m[1] === yr) seq = Math.max(seq, parseInt(m[2], 10)); });
  return yr + '-' + String(seq + 1).padStart(5, '0');
}
/* Ausgestellte Rechnungen sind unveränderlich, sobald sie versendet, bezahlt oder storniert sind (GoBD). Korrektur nur über Storno und neue Rechnung. */
function invLocked(inv) {
  if (!inv || invIsDraft(inv)) return '';
  if (inv.stornoFor) return 'eine Stornorechnung';
  if (inv.storniert) return 'storniert';
  if (inv.sentAt) return 'versendet';
  if ((inv.payments || []).length || inv.paid) return 'bezahlt';
  return '';
}
function invIsLastNr(inv) { var m = /^(?:RE-)?(\d{4})-(\d+)$/.exec(inv.nr || ''); return !!m && invNextNr(m[1] + '-01-01') === m[1] + '-' + String(parseInt(m[2], 10) + 1).padStart(5, '0'); }
/* Storno: eigene Stornorechnung mit neuer Nummer und negativen Beträgen, Original wird als storniert markiert */
function stornoInvoice(inv) {
  if (!inv || invIsDraft(inv) || inv.storniert || inv.stornoFor) return null;
  var today = iso(new Date()), s = JSON.parse(JSON.stringify(inv));
  s.id = newId(); s.nr = invNextNr(today); s.date = today; s.payments = []; s.paid = false; s.sentAt = null; s.storniert = false; s.stornoRef = '';
  s.items = (s.items || []).map(function (it) { return Object.assign({}, it, { price: -(+it.price || 0), amount: -(+it.amount || 0) }); });
  s.total = r2(-inv.total); s.stornoFor = inv.nr; s.showQr = false; s.zahlung = '';
  s.vortext = 'Stornorechnung zu Rechnung ' + inv.nr + ' vom ' + fmtD(inv.date) + '. Die Rechnung ist damit aufgehoben.';
  invoices.push(s); inv.storniert = true; inv.stornoRef = s.nr;
  var p = patients.filter(function (x) { return x.id === inv.pid; })[0];
  if (p) p.log = (p.log || []).concat([{ ts: Date.now(), type: 'notiz', text: 'Rechnung ' + inv.nr + ' storniert (Stornorechnung ' + s.nr + ')' }]);
  persist(); return s;
}
async function stornoAsk(inv, korr, vorab) {
  var paid = paidSum(inv);
  var msg = (vorab ? vorab + '\n\n' : '') + 'Rechnung ' + inv.nr + ' stornieren?\n\nEs entsteht eine Stornorechnung mit eigener Nummer, die Rechnung bleibt als storniert erhalten.'
    + (paid > 0 ? '\n\nBereits erfasste Zahlungen (' + eur(paid) + ') bleiben bei dieser Rechnung. Eine Erstattung oder Verrechnung bitte gesondert vermerken.' : '')
    + (korr ? '\n\nDanach öffnet sich eine neue Rechnung mit denselben Angaben zum Korrigieren.' : '');
  if (!await kaConfirm(msg, { ok: korr ? 'Stornieren und korrigieren' : 'Stornieren', danger: false })) return null;
  var s = stornoInvoice(inv); if (!s) return null;
  renderInvoices();
  if (korr) { var p = patients.filter(function (x) { return x.id === inv.pid; })[0]; if (p) { closeModal('modal-invview'); invMode = 'rechnung'; openInvoice(p); fillInvForm(inv); document.getElementById('inv-datum').value = iso(new Date()); return s; } }
  viewInvoice(s.id); return s;
}
function editInvoice() {
  var inv = invCur(); if (!inv) return;
  var lk = invLocked(inv);
  if (lk === 'storniert' || lk === 'eine Stornorechnung') { alert('Diese Rechnung ist ' + lk + ' und kann nicht mehr geändert werden.'); return; }
  if (lk) { stornoAsk(inv, true, 'Rechnung ' + inv.nr + ' ist ' + lk + ' und darf nicht mehr geändert werden. Eine Korrektur geht über Storno und neue Rechnung.'); return; }
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
      var it0 = { text: r.text.trim(), qty: q, price: pr, amount: r2(q * pr), rate: parseInt(r.rate, 10), datum: r.datum || datum, note: String(r.note || '').trim() };
      var gg = goaeFromKatalog(it0.text, pr, it0.rate); if (gg) it0.goae = gg;
      items.push(it0);
      var pcr = numIn(r.rab), pge = r.rabArt === 'eur';
      if (pcr > 0 && (pge || pcr <= 100)) { var pa = posRab(i); items.push(pge ? { rabatt: true, perPos: true, art: 'eur', eur: pcr, pct: 0, text: String(r.rabText || 'Rabatt').trim() + ' -' + nf(pa) + ' €', qty: 1, price: -pa, amount: -pa, rate: parseInt(r.rate, 10) }
        : { rabatt: true, perPos: true, pct: pcr, text: String(r.rabText || 'Rabatt').trim() + ' -' + String(pcr).replace('.', ',') + '%', qty: 1, price: -pa, amount: -pa, rate: parseInt(r.rate, 10) }); } else if (pcr > 100 && !pge) bad = true;
    }
  });
  var pd = items.filter(function (x) { return x.datum; }).map(function (x) { return x.datum; }).sort(); leist = pd.length ? pd[0] : datum;
  if (bad || !items.length) { alert('Bitte jede Position mit Leistung, Menge und Preis (Rabatt: Bezeichnung und Prozent) ausfüllen.'); return; }
  var hinweis = items.some(function (i) { return i.rate === 0; }) ? (settings.hinweis || '').trim() : '';
  var hvom = items.some(function (i) { return i.goae; }) ? (p.honorarVom || '') : '';
  if (items.some(function (i) { return i.goae && i.goae.faktor > 2.3; }) && !hvom && !await kaConfirm('Der Steigerungsfaktor liegt über 2,3, aber in der Akte ist keine Honorarvereinbarung eingetragen. Trotzdem erstellen?')) return;
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
      doku: document.getElementById('inv-doku').value.trim(), eid: parseInt(document.getElementById('inv-termin').value, 10) || null, hinweis: hinweis, honorarVom: hvom, zahlung: '', vortext: document.getElementById('inv-vortext').value.trim(), total: dtot, payments: [], created: Date.now() };
    entw.push(d0); p.adresse = adresse; persist(); closeModal('modal-inv'); invTab = d0.kind === 'test' ? 'test' : 'rechnung'; renderInvoices(); viewInvoice(d0.id); return;
  }
  if (invEdit) {
    var ie = invEdit, totE = r2(items.reduce(function (a, i) { return a + i.amount; }, 0));
    if (paidSum(ie) > totE + 0.005 && !await kaConfirm('Die bereits erfassten Zahlungen (' + eur(paidSum(ie)) + ') sind höher als die neue Summe (' + eur(totE) + '). Trotzdem speichern?')) return;
    var changed = JSON.stringify(ie.items) !== JSON.stringify(items) || ie.date !== datum || ie.adresse !== adresse || ie.vortext !== document.getElementById('inv-vortext').value.trim();
    ie.date = datum; ie.leistung = leist; ie.pid = p.id; ie.name = (p.anrede ? p.anrede + ' ' : '') + p.vorname + ' ' + p.nachname; ie.adresse = adresse; ie.items = items;
    ie.doku = document.getElementById('inv-doku').value.trim(); ie.eid = parseInt(document.getElementById('inv-termin').value, 10) || null; ie.hinweis = hinweis; ie.honorarVom = hvom; ie.zahlung = document.getElementById('inv-zahlung').value.trim();
    ie.vortext = document.getElementById('inv-vortext').value.trim(); ie.total = totE; ie.showHint = document.getElementById('inv-show-hint').checked; ie.showQr = document.getElementById('inv-show-qr').checked;
    if (changed) ie.sentAt = null;
    p.adresse = adresse; invEdit = null; persist(); closeModal('modal-inv'); renderInvoices();
    if (curP === p) { renderHead(); renderVerlauf(); }
    ['tab-zahlungen', 'tab-statistik'].forEach(function (t) { var el = document.getElementById(t); if (el && el.classList.contains('active')) (t === 'tab-zahlungen' ? renderZahlungen : renderStat)(); });
    viewInvoice(ie.id); return;
  }
  var nr = invNextNr(datum);
  var total = r2(items.reduce(function (a, i) { return a + i.amount; }, 0));
  var inv = { id: newId(), nr: nr, date: datum, leistung: leist, pid: p.id,
    name: (p.anrede ? p.anrede + ' ' : '') + p.vorname + ' ' + p.nachname, adresse: adresse,
    items: items, doku: document.getElementById('inv-doku').value.trim(), eid: parseInt(document.getElementById('inv-termin').value, 10) || null, hinweis: hinweis, honorarVom: hvom, zahlung: document.getElementById('inv-zahlung').value.trim(),
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
function invKind(i) { if (i.kind === 'kv') return 'kv'; return i.storniert || i.stornoFor ? 'storno' : invState(i).full ? 'bezahlt' : (invLate(i) ? 'ueberfaellig' : 'offen'); }
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
var invSendF = '';
function invSent(i) { return i.kind !== 'kv' && !!i.sentAt; }
async function toggleInvoiceSent() {
  var i = invCur(); if (!i || i.kind === 'kv') return;
  var wasSent = invSent(i);
  if (!await kaConfirm(wasSent ? 'Rechnung wieder als nicht versendet markieren?' : 'Rechnung als versendet markieren? Bitte nur bestätigen, wenn sie tatsächlich abgeschickt wurde.')) return;
  i.sentAt = wasSent ? null : Date.now();
  persist(); viewInvoice(i.id); renderInvoices();
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
  var ss = document.getElementById('inv-send-seg'); if (ss) {
    ss.innerHTML = '';
    var sc = { alle: 0, ja: 0, nein: 0 };
    inR.forEach(function(i) { if (i.kind === 'kv') return; sc.alle++; if (invSent(i)) sc.ja++; else sc.nein++; });
    [['', 'Alle'], ['ja', 'Versendet'], ['nein', 'Nicht versendet']].forEach(function(f) {
      var bt = mk('button', 'za-b' + (invSendF === f[0] ? ' on' : '')); bt.type = 'button'; bt.appendChild(document.createTextNode(f[1] + ' ')); bt.appendChild(mk('b', '', String(sc[f[0] || 'alle'])));
      bt.onclick = function() { invSendF = f[0]; renderInvoices(); }; ss.appendChild(bt);
    });
  }
  var q = (document.getElementById('inv-q').value || '').trim().toLowerCase();
  var shown = inR.filter(function (i) {
    var k = invKind(i);
    if (invSendF && (i.kind === 'kv' || (invSendF === 'ja') !== invSent(i))) return false;
    if (invF === 'offen' && k !== 'offen' && k !== 'ueberfaellig') return false; if (invF && invF !== 'offen' && k !== invF) return false;
    return !q || ((i.kind === 'kv' ? 'KV Kostenvoranschlag ' : '') + i.nr + ' ' + i.name + ' ' + eur(i.total) + ' ' + fmtD(i.date) + ' ' + String(i.total).replace('.', ',')).toLowerCase().indexOf(q) >= 0;
  });
  if (!shown.length && billingList.length) { var er = tb.insertRow(), ec = er.insertCell(); ec.colSpan = 4; ec.textContent = 'Keine Rechnung gefunden'; ec.style.color = '#94a3b8'; }
  shown.sort(invCmp).forEach(function (i) {
    var row = tb.insertRow(); row.className = i.kind === 'kv' ? 't-kv' : i.storniert ? '' : !invState(i).full ? (invLate(i) ? 't-late' : 't-open') : 't-paid';
    var c0 = row.insertCell(), c1 = row.insertCell(), c2 = row.insertCell(), c3 = row.insertCell();
    var b = mk('button', 'pn', i.kind === 'kv' ? 'KV' : i.nr); if (i.kind === 'kv') { b.classList.add('inv-kv-label'); b.title = 'Kostenvoranschlag öffnen'; } b.type = 'button'; b.onclick = function () { viewInvoice(i.id); }; c0.appendChild(b);
    var fd = fmtD(i.date); c1.textContent = fd; c1.className = 'pc-d'; var dsm = mk('small', 'pc-ds', fd.slice(0, 5)); c0.appendChild(dsm);
    if (i.kind !== 'kv') { var si = mk('span', 'inv-send-indicator ' + (invSent(i) ? 'is-sent' : 'is-unsent')); si.textContent = invSent(i) ? '✓' : '○'; si.title = invSent(i) ? 'Als versendet markiert' + (typeof i.sentAt === 'number' ? ' am ' + new Date(i.sentAt).toLocaleDateString('de-DE') : '') : 'Noch nicht als versendet markiert'; si.setAttribute('aria-label', si.title); c0.appendChild(si); }
    c2.appendChild(nmEl(invNm(i))); c3.textContent = eur(i.total); c0.className = 'nw';
    /* Betrag statt Status-Spalte: rot = offen, dunkelrot = überfällig, orange = Teilzahlung, grün = bezahlt, grau = storniert */
    var st = invState(i), late = !st.full && invLate(i), amt = mk('span', 'inv-a ' + (i.storniert ? 'a-st' : st.full ? 'a-ok' : late ? 'a-late' : st.txt === 'Teilzahlung' ? 'a-part' : 'a-open'), eur(i.total));
    if (i.kind === 'kv') { amt.className = 'inv-a a-kv'; amt.title = 'Kostenvoranschlag, keine offene Forderung'; } else amt.title = i.storniert ? 'Storniert' : st.full ? 'Bezahlt' : late ? 'Überfällig' : st.txt; c3.textContent = ''; c3.className = 'nw'; c3.appendChild(amt);
  });
}
/* Rechnungsversand: kleine Kennzeichnung neben der Rechnungsnummer */
