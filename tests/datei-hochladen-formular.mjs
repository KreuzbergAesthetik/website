import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Datei hochladen: normale Datei wird abgelegt; ein erkanntes Formular (JSON + PDF) fragt nach und kann nur abgelegt werden. Erfundene Daten.
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
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const p = { id: 'dh1', nr: 1, anrede: 'Frau', vorname: 'Dora', nachname: 'Hochlade', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist(); viewAkte(p); setAkTab('anl'); await wait(300);
    const pdf = n => new File([new Uint8Array([37, 80, 68, 70, 45, 49, 46, 52, 10])], n, { type: 'application/pdf' });
    // 1) normales PDF: ohne Frage abgelegt
    let fragen = 0; window.kaConfirm = async () => { fragen++; return false; };
    await addDocsOrForm({ files: [pdf('Brief.pdf')], value: 'x' }); await wait(300);
    out.abgelegt = p.dokumente.some(d => d.name === 'Brief.pdf') && fragen === 0;
    // 2) erkanntes Formular, "Nur ablegen": gefragt, Datei abgelegt
    const json = new File([JSON.stringify({ format: 'ka-formular', typ: 'anamnese', patient: { vorname: 'Dora', nachname: 'Hochlade', code: 'ABC123' } })], 'Bogen.json', { type: 'application/json' });
    fragen = 0; await addDocsOrForm({ files: [json, pdf('Bogen.pdf')], value: 'x' }); await wait(300);
    out.gefragt = fragen === 1;
    out.nurAbgelegt = p.dokumente.some(d => d.name === 'Bogen.pdf');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Datei hochladen: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Datei hochladen OK (normal abgelegt, Formular erkannt und gefragt)');
} finally {
  await browser.close();
}
