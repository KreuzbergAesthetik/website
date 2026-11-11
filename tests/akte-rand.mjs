import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Hochkant: Akte-Aktionen liegen als schmale Streifen am rechten Rand, Pfeil oder Antippen klappt sie aus, Tippen daneben klappt zu.
// Querformat: Knöpfe bleiben voll sichtbar. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
const neu = async (w, h) => {
  const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await page.evaluate(async () => {
    patients.length = 0;
    const p = { id: 'r1', nr: 1, anrede: 'Herr', vorname: 'Max', nachname: 'Muster', dob: '13.01.1992', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(p); viewAkte(p); await new Promise(r => setTimeout(r, 500));
  });
  return { context, page };
};
const sicht = page => page.evaluate(() => {
  const f = document.querySelector('.a-fab'), c = f.querySelector('.a-cat'), r = c.getBoundingClientRect();
  return { out: f.classList.contains('out'), sichtbar: Math.round(Math.min(r.right, innerWidth) - Math.max(r.left, 0)), breite: Math.round(r.width), vw: innerWidth };
});
try {
  let t = await neu(390, 844);
  let z = await sicht(t.page);
  assert.equal(z.out, false, 'Aktionen starten ausgeklappt');
  assert.ok(z.sichtbar > 4 && z.sichtbar <= 14, 'Streifen nicht schmal: ' + JSON.stringify(z));
  assert.ok(await t.page.evaluate(() => getComputedStyle(document.querySelector('.a-fab-tog')).display !== 'none'), 'Ausklapp-Pfeil fehlt');
  await t.page.click('.a-fab-tog'); await t.page.waitForTimeout(400);
  z = await sicht(t.page); assert.equal(z.out, true, 'Pfeil klappt nicht aus'); assert.ok(z.sichtbar >= z.breite - 1, 'Knopf nicht ganz sichtbar: ' + JSON.stringify(z));
  await t.page.tap('.a-head', { position: { x: 10, y: 10 }, force: true }).catch(() => {});
  await t.page.evaluate(() => document.querySelector('.a-top').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })));
  await t.page.waitForTimeout(400);
  z = await sicht(t.page); assert.equal(z.out, false, 'Tippen daneben klappt nicht zu');
  // Antippen des Streifens klappt aus, ohne die Aktion auszuführen
  await t.page.evaluate(() => { window.__aktion = 0; document.querySelector('.a-fab .a-cat').addEventListener('click', () => { window.__aktion++; }); });
  await t.page.evaluate(() => document.querySelector('.a-fab .a-cat').click()); await t.page.waitForTimeout(300);
  z = await sicht(t.page); assert.equal(z.out, true, 'Antippen klappt nicht aus');
  assert.equal(await t.page.evaluate(() => window.__aktion), 0, 'Aktion wurde beim Ausklappen ausgelöst');
  await t.context.close();

  t = await neu(915, 412);
  assert.equal(await t.page.evaluate(() => getComputedStyle(document.querySelector('.a-fab-tog')).display), 'none', 'Pfeil im Querformat sichtbar');
  z = await sicht(t.page); assert.ok(z.sichtbar >= z.breite - 1, 'Querformat: Knopf nicht ganz sichtbar ' + JSON.stringify(z));
  await t.context.close();

  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Akte-Aktionen am Rand OK (hochkant Streifen, Pfeil, Antippen, zuklappen; quer unverändert)');
} finally {
  await browser.close();
}
