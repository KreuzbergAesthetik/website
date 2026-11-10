import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Einrichtungspasswort: Die erste Einrichtung der App braucht das Wort aus dem Server-Snippet (Route zugang).
// Der Server wird simuliert; erfundene Daten. ?zugang=1 erzwingt die Prüfung auch lokal.
const base = (process.env.APP_URL || 'http://127.0.0.1:4173/index.html') + '?zugang=1';
const plain = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
const neu = async (url, handler) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  if (handler) await page.route('**/wp-json/ka/v1/zugang', handler);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#al-pw2', { state: 'visible', timeout: 10000 });
  return { context, page };
};
const setze = async (page, code) => {
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!');
  if (code !== undefined) await page.fill('#al-code', code);
  await page.click('#al-submit');
};
const eingerichtet = page => page.evaluate(() => !!localStorage.getItem('ka_lock'));
try {
  // 1) Lokal ohne ?zugang: kein Feld, Einrichtung wie bisher
  let t = await neu(plain);
  assert.equal(await t.page.isVisible('#al-code'), false, 'Feld darf lokal nicht erscheinen');
  await t.context.close();

  // 2) Falsches Wort: abgelehnt, nichts eingerichtet
  let gesendet = null;
  t = await neu(base, async route => { gesendet = route.request().postData() || ''; await route.fulfill({ status: 403, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: false, error: 'Das Einrichtungspasswort stimmt nicht.' }) }); });
  assert.equal(await t.page.isVisible('#al-code'), true, 'Feld fehlt');
  await setze(t.page, 'falsch');
  await t.page.waitForFunction(() => /Einrichtungspasswort stimmt nicht/.test(document.getElementById('al-msg').textContent), null, { timeout: 10000 });
  assert.ok(gesendet && gesendet.includes('falsch'), 'Wort wurde nicht an den Server geschickt');
  assert.equal(await eingerichtet(t.page), false, 'trotz falschem Wort eingerichtet');
  assert.ok(await t.page.evaluate(() => document.documentElement.classList.contains('locked')), 'App nicht gesperrt');
  await t.context.close();

  // 3) Server nicht erreichbar: abgelehnt
  t = await neu(base, route => route.abort('failed'));
  await setze(t.page, 'egal');
  await t.page.waitForFunction(() => /Keine Verbindung/.test(document.getElementById('al-msg').textContent), null, { timeout: 10000 });
  assert.equal(await eingerichtet(t.page), false, 'ohne Server eingerichtet');
  await t.context.close();

  // 4) Alter Server (Route fehlt, 404): abgelehnt mit Hinweis
  t = await neu(base, route => route.fulfill({ status: 404, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{}' }));
  await setze(t.page, 'egal');
  await t.page.waitForFunction(() => /Server-Snippet/.test(document.getElementById('al-msg').textContent), null, { timeout: 10000 });
  assert.equal(await eingerichtet(t.page), false, 'bei altem Server eingerichtet');
  await t.context.close();

  // 5) Richtiges Wort: eingerichtet, App läuft
  t = await neu(base, route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
  await setze(t.page, 'richtig');
  await t.page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  assert.equal(await eingerichtet(t.page), true, 'nicht eingerichtet');
  await t.context.close();

  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Einrichtungspasswort OK (lokal ohne Feld, falsch, offline, alter Server, richtig)');
} finally {
  await browser.close();
}
