import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Medikation: Rezept direkt aus der Karte (alle) oder für ein einzelnes Medikament (beim Überfahren). Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await page.evaluate(async () => {
    window.alert = () => {}; const p = { id: 'rm1', nr: 1, vorname: 'Rosa', nachname: 'Medikation', erstellt: Date.now(), medikation: ['Probemittel A 10 mg', 'Probemittel B 5 mg', 'Probemittel C'], bilder: [], dokumente: [], doku: [], log: [] };
    patients.length = 0; patients.push(p); events.length = 0; FLC = null; persist(); viewAkte(p);
  });
  await page.waitForTimeout(500);
  assert.equal(await page.locator('.med-rx').count(), 3, 'Pro Medikament ein Rezept-Symbol');
  // beim Überfahren sichtbar
  const li = page.locator('.a-tile ul li').nth(1); await li.hover(); await page.waitForTimeout(250);
  assert.equal(await li.locator('.med-rx').evaluate(e => getComputedStyle(e).opacity), '1', 'Symbol nicht sichtbar beim Überfahren');
  await li.locator('.med-rx').click(); await page.waitForTimeout(300);
  let rows = await page.evaluate(() => ({ offen: document.getElementById('modal-rx').classList.contains('active'), an: rxRows.filter(r => r.on).map(r => r.text), alle: rxRows.length }));
  assert.ok(rows.offen && rows.alle === 3 && rows.an.length === 1 && rows.an[0] === 'Probemittel B 5 mg', 'Einzelnes Medikament: ' + JSON.stringify(rows));
  await page.evaluate(() => closeModal('modal-rx'));
  // Knopf an der Karte: Maske ohne Vorauswahl
  await page.locator('.med-rxall').click(); await page.waitForTimeout(300);
  rows = await page.evaluate(() => ({ offen: document.getElementById('modal-rx').classList.contains('active'), an: rxRows.filter(r => r.on).length }));
  assert.ok(rows.offen && rows.an === 0, 'Kartenknopf: ' + JSON.stringify(rows));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Rezept aus Medikation OK (Kartenknopf, Symbol je Medikament beim Überfahren, Vorauswahl)');
} finally {
  await browser.close();
}
