import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Akte-Schnellzugriffe schweben dauerhaft als runde Knöpfe am Rand (hochkant und quer), ohne Ein- und Ausklappen. Erfundene Daten.
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
  assert.ok(z.sichtbar >= z.breite - 1, 'Hochkant: Knopf nicht ganz sichtbar ' + JSON.stringify(z));
  assert.equal(await t.page.evaluate(() => getComputedStyle(document.querySelector('.a-fab-tog')).display), 'none', 'Ausklapp-Pfeil darf es nicht mehr geben');
  // Antippen löst die Aktion sofort aus, nichts klappt ein oder aus
  await t.page.evaluate(() => { window.__aktion = 0; document.querySelector('.a-fab .a-cat').addEventListener('click', () => { window.__aktion++; }); });
  await t.page.evaluate(() => document.querySelector('.a-fab .a-cat').click()); await t.page.waitForTimeout(300);
  assert.equal(await t.page.evaluate(() => window.__aktion), 1, 'Aktion wurde beim ersten Antippen nicht ausgelöst');
  z = await sicht(t.page); assert.ok(z.sichtbar >= z.breite - 1, 'Knopf nach dem Antippen nicht mehr ganz sichtbar ' + JSON.stringify(z));
  await t.context.close();

  t = await neu(915, 412);
  assert.equal(await t.page.evaluate(() => getComputedStyle(document.querySelector('.a-fab-tog')).display), 'none', 'Pfeil im Querformat sichtbar');
  z = await sicht(t.page); assert.ok(z.sichtbar >= z.breite - 1, 'Querformat: Knopf nicht ganz sichtbar ' + JSON.stringify(z));
  await t.context.close();

  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Akte-Aktionen am Rand OK (dauerhaft sichtbar, kein Ein-/Ausklappen, Antippen löst sofort aus)');
} finally {
  await browser.close();
}
