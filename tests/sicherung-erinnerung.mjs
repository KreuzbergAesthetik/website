import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Sicherungs-Erinnerung (Test, erfundene Daten): Hinweisleiste, Punkt am Praxis-Menü, Zeitpunkte und "Später".
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const vis = () => page.evaluate(() => getComputedStyle(document.getElementById('bk-bar')).display !== 'none');
  const dot = c => page.evaluate(c => document.getElementById('btn-praxis').classList.contains(c), c);

  // Noch nie gesichert: Stufe 2, Leiste und roter Punkt
  await page.evaluate(() => { try { kaDel('ka_lastbackup'); } catch {} kaSet('ka_bknudge', ''); bkNudge(); });
  assert.equal(await page.evaluate(() => bkStatus().level), 2);
  assert.ok(await vis(), 'Leiste fehlt bei fehlender Sicherung'); assert.ok(await dot('bk-dot2'), 'roter Punkt fehlt');
  assert.match(await page.textContent('#bk-bar-t'), /Noch keine Datensicherung/);
  // Später blendet aus, im selben Zeitfenster kommt sie nicht wieder
  await page.click('#bk-bar .btn-cancel'); assert.ok(!(await vis()));
  await page.evaluate(() => bkNudge()); assert.ok(!(await vis()), 'Leiste kam im selben Zeitfenster wieder');
  // Heute gesichert: nichts
  await page.evaluate(() => { kaSet('ka_lastbackup', new Date().toISOString()); bkNudge(); });
  assert.equal(await page.evaluate(() => bkStatus().level), 0); assert.ok(!(await vis())); assert.ok(!(await dot('bk-dot')));
  // 3 Tage her: Stufe 2 mit Text
  await page.evaluate(() => { kaSet('ka_lastbackup', new Date(Date.now() - 3 * 86400000).toISOString()); kaSet('ka_bknudge', ''); bkNudge(); });
  assert.ok(await vis()); assert.match(await page.textContent('#bk-bar-t'), /vor 3 Tagen/);
  console.log('Sicherungs-Erinnerung OK');
  assert.deepEqual(pageErrors, []);
} finally { await browser.close(); }
