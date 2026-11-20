import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Suche: Treffer unter "Anlagen" öffnet das Bild direkt in der Bildansicht. Erfundene Daten.
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
    const k = document.createElement('canvas'); k.width = 40; k.height = 30; k.getContext('2d').fillRect(0, 0, 40, 30);
    const blob = await new Promise(r => k.toBlob(r, 'image/png')), id = newId(); await fPut(id, 'Stirn-vorher.png', blob);
    const p = { id: 'sa1', nr: 1, anrede: 'Frau', vorname: 'Anja', nachname: 'Suche', medikation: [], log: [], doku: [], dokumente: [], bilder: [{ id, ts: Date.now(), name: 'Stirn-vorher.png' }], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    const f = p.bilder[0];
    gsOpenFile(p, f); await wait(500);
    out.akteOffen = document.getElementById('modal-akte').classList.contains('active');
    out.bildOffen = document.getElementById('modal-img').classList.contains('active') && /Stirn-vorher/.test(document.getElementById('img-cnt').textContent);
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Suche Anlagen: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Suche Anlagen OK (Treffer öffnet das Bild direkt)');
} finally {
  await browser.close();
}
