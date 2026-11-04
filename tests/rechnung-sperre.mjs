import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Rechnungen: versendete/bezahlte sind gesperrt, Korrektur nur über Storno; Löschen nur für die letzte, unversendete Nummer.
// Patienten: Akten mit medizinischer Dokumentation sind 10 Jahre gegen Löschen geschützt. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));

try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#al-pw2', { state: 'visible', timeout: 10000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!');
  await page.fill('#al-pw2', 'CiAppPasswort-123!');
  await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });

  const r = await page.evaluate(async () => {
    const out = {}, asked = [];
    window.kaConfirm = async (m) => { asked.push(String(m)); return true; };
    window.alert = (m) => asked.push('ALERT ' + m);
    patients.length = 0; invoices.length = 0; entw.length = 0; events.length = 0;
    const p = { id: 'rs1', nr: 1, vorname: 'Rita', nachname: 'Muster', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(p); settings.steuernr = 'TEST';
    const create = async (price) => { openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Erfundene Leistung', qty: '1', price: String(price), rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice(); closeModal('modal-invview'); return invoices[invoices.length - 1]; };

    // 1) Unversendete letzte Rechnung: Bearbeiten öffnet die Maske, Löschen erlaubt
    const a = await create(100);
    viewInvoice(a.id); editInvoice(); out.editOffen = document.getElementById('modal-inv').classList.contains('active') && !a.storniert; closeModal('modal-inv');
    viewInvoice(a.id); await deleteInvoice(); out.loeschenLetzte = !invoices.includes(a);

    // 2) Versendete Rechnung: Bearbeiten führt zu Storno + neuer Rechnung
    const b = await create(120); b.sentAt = Date.now(); persist();
    viewInvoice(b.id); asked.length = 0; editInvoice(); await new Promise(r => setTimeout(r, 300));
    const sb = invoices.find(i => i.stornoFor === b.nr);
    out.storno = !!b.storniert && !!sb && sb.total === -120 && sb.nr !== b.nr && b.stornoRef === sb.nr && sb.items.every(i => i.amount < 0);
    out.stornoStatus = invState(sb).txt === 'Stornorechnung' && invState(b).txt === 'Storniert' && /Stornorechnung/.test(invStatusText(b));
    out.korrekturMaske = document.getElementById('modal-inv').classList.contains('active');
    closeModal('modal-inv');
    out.nummernFortlaufend = invoices.map(i => i.nr).join(',');

    // 3) Stornierte Rechnung und Stornorechnung: weder änderbar noch löschbar
    viewInvoice(b.id); const n1 = invoices.length; await deleteInvoice(); out.stornoNichtLoeschbar = invoices.length === n1 && invoices.includes(b);
    viewInvoice(sb.id); editInvoice(); out.stornoNichtAenderbar = !document.getElementById('modal-inv').classList.contains('active');

    // 4) Bezahlte Rechnung, nicht letzte Nummer: Löschen wird zum Storno
    const c = await create(80); c.payments = [{ date: iso(new Date()), amount: 80, art: 'bar' }]; persist();
    const d = await create(50);
    viewInvoice(c.id); await deleteInvoice(); out.bezahltStorno = invoices.includes(c) && !!c.storniert;
    // d ist durch die neue Stornonummer nicht mehr die letzte Nummer: Löschen wird ebenfalls zum Storno
    viewInvoice(d.id); await deleteInvoice(); out.nichtLetzteStorno = invoices.includes(d) && !!d.storniert;
    const e = await create(30);
    viewInvoice(e.id); const n2 = invoices.length; await deleteInvoice(); out.letzteUnversendetLoeschbar = invoices.length === n2 - 1;

    // 5) Löschschutz Patient
    const leer = { id: 'rs2', nr: 2, vorname: 'Leo', nachname: 'Leer', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    const doku = { id: 'rs3', nr: 3, vorname: 'Dana', nachname: 'Doku', medikation: [], log: [], doku: [{ ts: Date.now() - 864e5, text: 'Erfundene Behandlung' }], dokumente: [], bilder: [], erstellt: Date.now() };
    const alt = { id: 'rs4', nr: 4, vorname: 'Alma', nachname: 'Alt', medikation: [], log: [], doku: [{ ts: new Date('2014-01-10').getTime(), text: 'Erfundene alte Behandlung' }], dokumente: [], bilder: [], erstellt: new Date('2014-01-01').getTime() };
    patients.push(leer, doku, alt);
    curP = doku; await deletePatient(); out.dokuGeschuetzt = patients.includes(doku) && asked.some(a => /aufbewahrt werden/.test(a));
    curP = leer; await deletePatient(); out.leerLoeschbar = !patients.includes(leer);
    curP = alt; await deletePatient(); out.altLoeschbar = !patients.includes(alt);
    return out;
  });

  for (const k of ['editOffen', 'loeschenLetzte', 'storno', 'stornoStatus', 'korrekturMaske', 'stornoNichtLoeschbar', 'stornoNichtAenderbar', 'bezahltStorno', 'nichtLetzteStorno', 'letzteUnversendetLoeschbar', 'dokuGeschuetzt', 'leerLoeschbar', 'altLoeschbar'])
    assert.equal(r[k], true, 'Rechnungssperre/Löschschutz: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Rechnungssperre und Löschschutz OK', r.nummernFortlaufend);
} finally {
  await browser.close();
}
