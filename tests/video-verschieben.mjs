import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Video aus den Dateien in den Video-Bereich verschieben: weg aus dem Dateispeicher und den Dokumenten, verschlüsselt im Video-Speicher, protokolliert. Erfundene Daten.
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
    const out = {}; window.alert = () => {}; window.kaConfirm = async () => true;
    const inhalt = new Uint8Array(6000).map((_, i) => i % 251);
    await fPut('mov-1', 'IMG_0001.mov', new Blob([inhalt], { type: 'video/quicktime' })); await fPut('pdf-1', 'Bogen.pdf', new Blob([new Uint8Array(10)], { type: 'application/pdf' }));
    const p = { id: 'vv1', nr: 1, vorname: 'Vera', nachname: 'Verschieb', medikation: [], log: [], doku: [], bilder: [], erstellt: Date.now(),
      dokumente: [{ id: 'mov-1', ts: Date.now() - 5000, name: 'IMG_0001.mov', kat: 'Sonstiges' }, { id: 'pdf-1', ts: Date.now(), name: 'Bogen.pdf', kat: 'Sonstiges' }] };
    patients.length = 0; patients.push(p); FLC = null; persist();
    out.erkannt = isVideoDoc(p.dokumente[0]) && !isVideoDoc(p.dokumente[1]);
    await moveToVideos(p, p.dokumente[0]);
    out.weg = p.dokumente.length === 1 && p.dokumente[0].name === 'Bogen.pdf' && !(await fKeys()).includes('mov-1');
    out.imVideoBereich = (p.videos || []).length === 1 && p.videos[0].name === 'IMG_0001.mov' && p.videos[0].size === 6000;
    const f = await vGet(p.videos[0].id), back = new Uint8Array(await f.blob.arrayBuffer());
    out.inhaltGleich = back.length === 6000 && back[250] === 250 && back[251] === 0;
    out.protokoll = JSON.stringify(p.audit || []).includes('Verschoben in Videos: IMG_0001.mov');
    out.pdfBleibt = (await fKeys()).includes('pdf-1');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Video verschieben: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Video verschieben OK (Dateien, Video-Bereich, Inhalt, Protokoll)');
} finally {
  await browser.close();
}
