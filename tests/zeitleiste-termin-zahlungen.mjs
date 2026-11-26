import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Zeitleiste der Akte (eine Karte, Datum nur beim ersten Eintrag eines Tages), Termin-Ansicht (Bestätigung und Absagebestätigung
// mit Datum/Uhrzeit des gewählten Termins, nicht des nächsten) und Zahlungen (offene Posten oben, Zahlungsliste, Euro-Symbol). Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    window.kaConfirm = async () => true; window.alert = () => {};
    patients.length = 0; invoices.length = 0; events.length = 0; entw.length = 0; settings.steuernr = 'TEST';
    const p = { id: 'zt1', nr: 1, anrede: 'Herr', vorname: 'Max', nachname: 'Muster', email: 'max@example.invalid', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() - 20 * 864e5 };
    patients.push(p);
    const tag = n => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
    const nah = { id: 8001, patientId: p.id, patient: 'Muster, Max', date: tag(2), time: '09:30', dur: 30 };
    const fern = { id: 8002, patientId: p.id, patient: 'Muster, Max', date: tag(9), time: '15:45', dur: 45 };
    events.push(nah, fern);
    const t1 = new Date(); t1.setDate(t1.getDate() - 5); t1.setHours(10, 0, 0, 0);
    p.doku.push({ ts: t1.getTime(), text: 'Erfundene Dokumentation A' });
    p.log.push({ ts: t1.getTime() + 36e5, type: 'notiz', text: 'Erfundene Notiz am selben Tag' });
    const t2 = new Date(t1); t2.setDate(t2.getDate() - 3);
    p.log.push({ ts: t2.getTime(), type: 'notiz', text: 'Erfundene Notiz früher' });
    persist();

    // ---- Zeitleiste ----
    viewAkte(p); await wait(500);
    const cards = document.querySelectorAll('#a-verlauf .tl-day.tl-all');
    out.eineKarte = cards.length === 1 && document.querySelectorAll('#a-verlauf .tl-day').length === 1;
    const rows = [...document.querySelectorAll('#a-verlauf .tl-item')];
    const tageKeys = new Set(rows.map(x => x.querySelector('.tl-date b').textContent));
    const koepfe = [...document.querySelectorAll('#a-verlauf .tl-dh')];
    out.tagStart = koepfe.length === tageKeys.size && tageKeys.size >= 4 && rows.every(x => !x.classList.contains('tl-dstart'));
    out.datumEigeneZeile = koepfe.every(k => k.nextElementSibling && k.nextElementSibling.classList.contains('tl-item')) && rows.every(x => getComputedStyle(x.querySelector('.tl-date b')).display === 'none');
    out.datumTextOk = koepfe.every(k => /^[A-ZÄÖÜ]{2}, \d\d\.\d\d\.\d\d$/.test(k.textContent.trim()));
    out.uhrzeitImmer = rows.every(x => /^\d{2}:\d{2}$/.test(x.querySelector('.tl-date span').textContent.trim()));
    out.datumRechtsbuendig = getComputedStyle(rows[0].querySelector('.tl-date')).textAlign === 'right';
    out.sortiertNeuZuerst = koepfe.length >= 4 && koepfe[0].textContent !== koepfe[koepfe.length - 1].textContent;
    out.dickeTagesLinie = koepfe.slice(1).every(k => getComputedStyle(k).borderTopWidth === '2px') && getComputedStyle(koepfe[0]).borderTopWidth === '0px';
    out.terminDokuOffen = rows.filter(x => x.classList.contains('tl-termin') || x.classList.contains('tl-doku')).every(x => x.classList.contains('open'));
    const notiz = rows.find(x => x.classList.contains('tl-notiz')); const offenVor = notiz.classList.contains('open');
    notiz.querySelector('.tl-body').click(); out.notizKlappt = !offenVor && notiz.classList.contains('open');
    out.keineZeileFehlt = rows.length >= 6;
    closeModal && closeModal('modal-akte');

    // ---- Termin-Ansicht und Bestätigung ----
    openTerminView(fern.id); await wait(300);
    const tv = document.getElementById('tv-body');
    out.tvDatum = tv.querySelector('.tv-wann').textContent.includes('15:45');
    out.tvKnoepfe = !!tv.querySelector('.tv-hd .tv-ib[title="Termin kopieren"]') && !!tv.querySelector('.tv-hd .tv-ib[title="Bearbeiten"]');
    const best = tv.querySelector('.tv-tool.tt-mail');
    out.tvBestaetigungKnopf = !!best && /Bestätigung/.test(best.textContent) && !!tv.querySelector('.tf-cancel') && !!tv.querySelector('.tv-fdel');
    out.tvNurLoeschenRot = [...tv.querySelectorAll('.tv-tool, .tf-cancel')].every(b => { const c = getComputedStyle(b).color; return !/^rgb\((2[0-9]{2}|1[5-9][0-9]), (\d|[1-5]\d), (\d|[1-5]\d)\)$/.test(c); });
    best.click(); await wait(400);
    const wdl = new Date(fern.date + 'T12:00:00'), dm = fmtD(fern.date);
    const bTxt = document.getElementById('m-text').value;
    out.bestaetigungDieserTermin = bTxt.includes(dm) && bTxt.includes('15:45') && !bTxt.includes(fmtD(nah.date)) && !bTxt.includes('09:30') && !/\{[A-Za-zÄÖÜäöüß]+\}/.test(bTxt);
    out.phEventZurueck = phEvent === null;
    closeModal('modal-mail');

    // ---- Absagebestätigung: abgesagter, nicht nächster Termin ----
    openTerminView(fern.id); await wait(300);
    document.querySelector('#tv-body .tf-cancel').click(); await wait(800);
    out.abgesagt = fern.phase === 'Abgesagt';
    const aTxt = document.getElementById('m-text').value;
    out.absageDieserTermin = aTxt.includes(fmtD(fern.date)) && aTxt.includes('15:45') && !aTxt.includes(fmtD(nah.date)) && !aTxt.includes('09:30');
    out.phEventNachAbsage = phEvent === null;
    closeModal('modal-mail');
    // Gegenprobe: ohne gesetzten Termin bleibt der nächste Termin maßgeblich
    out.gegenprobe = fillPlatzhalter('{Uhrzeit}', p) === '09:30';

    // ---- Zahlungen ----
    const mkInv = async (price, pay) => { openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Erfundene Leistung', qty: '1', price: String(price), rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice(); closeModal('modal-invview'); const i = invoices[invoices.length - 1]; if (pay) i.payments = [{ date: iso(new Date()), amount: price, art: 'Bar' }]; return i; };
    const offen = await mkInv(150, false), bezahlt = await mkInv(90, true); persist();
    switchTab('zahlungen'); renderZahlungen(); await wait(300);
    const orows = [...document.querySelectorAll('#zl-open-t tr[data-nr]')];
    out.offenZeilen = orows.length === 1 && orows[0].dataset.nr === offen.nr;
    out.offenUeberschrift = /Offene Posten \(1\)/.test(document.getElementById('zl-open-h').textContent);
    out.euroSymbol = !!orows[0] && !!orows[0].querySelector('button svg, .inv-pay-btn svg, .inv-pay-action svg') && !/Zahlung\b/.test(orows[0].querySelector('.inv-pay-action, .inv-cell-action:last-child')?.textContent || '');
    const zrows = [...document.querySelectorAll('#zl-in tr')].filter(tr => tr.cells.length === 5);
    out.zahlungenZeile = zrows.length === 1 && /Bar/.test(zrows[0].cells[3].textContent) && /90/.test(zrows[0].cells[4].textContent) && zrows[0].textContent.includes(bezahlt.nr.split('-')[0]);
    out.offenOberhalb = document.getElementById('zl-open').compareDocumentPosition(document.getElementById('zl-in')) & Node.DOCUMENT_POSITION_FOLLOWING;
    // Filter nach Zahlart: Karte schließt die Barzahlung aus, Bar zeigt sie, erneutes Antippen hebt den Filter auf
    const artBtn = name => [...document.querySelectorAll('#zl-arts .za-b')].find(b => b.title === name);
    artBtn('Karte').click(); const nKarte = [...document.querySelectorAll('#zl-in tr')].filter(tr => tr.cells.length === 5).length;
    artBtn('Bar').click(); const nBar = [...document.querySelectorAll('#zl-in tr')].filter(tr => tr.cells.length === 5).length;
    artBtn('Bar').click(); const nAlle = [...document.querySelectorAll('#zl-in tr')].filter(tr => tr.cells.length === 5).length;
    out.zahlartFilter = nKarte === 0 && nBar === 1 && nAlle === 1;
    // Bezahlen entfernt den offenen Posten
    offen.payments = [{ date: iso(new Date()), amount: 150, art: 'Karte' }]; persist(); renderZahlungen(); await wait(200);
    out.offenWeg = document.querySelectorAll('#zl-open-t tr[data-nr]').length === 0 && /Alles bezahlt/.test(document.getElementById('zl-open').textContent);
    return out;
  });
  for (const k of Object.keys(r)) assert.ok(r[k], 'Zeitleiste/Termin/Zahlungen: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Zeitleiste, Termin-Ansicht und Zahlungen OK');
} finally {
  await browser.close();
}
