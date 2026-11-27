import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Kopfzeile "n Anhänge" mit rundem Bearbeiten-Knopf: Menü mit Hinzufügen, Zuordnen, Datum ändern. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 915, height: 900 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const L = await loadPdfLib(), mk = async (t) => { const d = await L.PDFDocument.create(); d.addPage([300, 400]).drawText(t, { x: 30, y: 350, size: 16 }); return new Blob([await d.save()], { type: 'application/pdf' }); };
    await fPut('b1', 'Eins.pdf', await mk('1')); await fPut('b2', 'Zwei.pdf', await mk('2'));
    const D = 864e5, b = new Date(); b.setHours(12, 0, 0, 0); const t = b.getTime();
    const p = { id: 'ab1', nr: 1, vorname: 'Anna', nachname: 'Anhang', dob: '02.03.1985', erstellt: t - 30 * D, medikation: [], bilder: [], doku: [],
      dokumente: [{ id: 'b1', ts: t - D * 2, name: 'Eins.pdf', kat: 'Sonstiges', zu: 'e9101' }, { id: 'b2', ts: t - D * 2 + 1000, name: 'Zwei.pdf', kat: 'Sonstiges', zu: 'e9101' }], log: [] };
    patients.length = 0; patients.push(p); events.length = 0; events.push({ id: 9101, patientId: p.id, patient: 'Anhang, Anna', date: iso(new Date(t - 2 * D)), time: '10:00', dur: 30 }); FLC = null; persist(); viewAkte(p); await wait(1200);
    const knopf = document.querySelector('#a-verlauf .tl-att .md-edit');
    out.knopfDa = !!knopf && /Anh/.test(knopf.parentElement.textContent) && knopf.getAttribute('aria-label') === 'Anhänge bearbeiten';
    knopf.click(); await wait(200);
    const m = document.getElementById('tl-menu'), txt = m ? m.textContent : '';
    out.menue = !!m && m.style.display === 'block' && /Bilder hinzufügen/.test(txt) && /Dokument hinzufügen/.test(txt) && /anderen Eintrag zuordnen/.test(txt) && /Datum aller Anhänge/.test(txt);
    let zuOffen = false; const alt = window.openZu; window.openZu = (pp, list) => { zuOffen = list.length === 2; }; 
    [...m.querySelectorAll('button')].find(x => /anderen Eintrag zuordnen/.test(x.textContent)).click(); await wait(100); window.openZu = alt;
    out.zuordnen = zuOffen;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Anhänge bearbeiten: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Anhänge bearbeiten OK (Knopf in der Kopfzeile, Menü, Zuordnen für alle Anhänge)');
} finally {
  await browser.close();
}
