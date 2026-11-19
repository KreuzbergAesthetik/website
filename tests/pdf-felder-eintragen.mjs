import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Vorlage mit "Patientendaten automatisch eintragen": Beim Hinzufügen zur Akte stehen Name, Geburtsdatum und Datum im PDF. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}; window.alert = () => {};
    const L = await loadPdfLib();
    const doc = await L.PDFDocument.create(); for (let i = 0; i < 4; i++) doc.addPage([595, 842]);
    const src = new Blob([await doc.save()], { type: 'application/pdf' });
    const tid = newId(); await fPut(tid, 'Probe.pdf', src);
    const t = { id: tid, name: 'Probe', kat: 'Aufklärung', fill: 1 };
    const t2 = { id: newId(), name: 'Ohne', kat: 'Aufklärung' }; await fPut(t2.id, 'Ohne.pdf', src);
    templates.push(t, t2);
    const p = { id: 'pf1', nr: 1, anrede: 'Frau', vorname: 'Erika', nachname: 'Testfrau', dob: '02.03.1991', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); persist();
    await addTplTo(p, t, null, 0, '2026-11-19'); await addTplTo(p, t2, null, 1);
    const hex = s => Array.from(new TextEncoder().encode(s)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    const text = async rec => { const b = await fileBlob(rec); return { n: b.size, s: new TextDecoder('latin1').decode(new Uint8Array(await b.arrayBuffer())) }; };
    const a = await text(p.dokumente[0]), b = await text(p.dokumente[1]);
    out.groesser = a.n > b.n;
    out.seiten = (await L.PDFDocument.load(await fileBlob(p.dokumente[0]).then(x => x.arrayBuffer()))).getPageCount() === 4;
    out.checkbox = (openTpl(t.id), document.getElementById('tp-fill').checked === true);
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'PDF-Felder: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('PDF-Felder eintragen OK');
} finally {
  await browser.close();
}
