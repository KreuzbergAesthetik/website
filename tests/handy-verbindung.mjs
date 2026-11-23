import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Handy-Verbindung (Test): Tablet-Seite erzeugt das Angebot, die Handy-Seite antwortet, beide verbinden sich direkt (WebRTC) und tauschen Prüfdaten aus. Kein Patientenbezug.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const dir = base.replace(/[^/]*$/, '');
const browser = await chromium.launch({ headless: true, args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--disable-features=WebRtcHideLocalIpsWithMdns'], ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 900 }, permissions: ['camera'] });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const tablet = await context.newPage(); tablet.on('pageerror', e => pageErrors.push('Tablet: ' + e));
  await tablet.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await tablet.fill('#al-pw', 'CiAppPasswort-123!'); await tablet.fill('#al-pw2', 'CiAppPasswort-123!'); await tablet.click('#al-submit');
  await tablet.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await tablet.evaluate(() => kvOpen());
  await tablet.waitForFunction(() => window.KV && KV.last && KV.last.code, null, { timeout: 15000 });
  const angebot = await tablet.evaluate(() => KV.last.code);
  assert.ok(/^[zr][A-Za-z0-9_-]+$/.test(angebot), 'Angebot hat kein gültiges Format');
  assert.ok(await tablet.evaluate(() => !!document.querySelector('#kv-main canvas')), 'QR-Code fehlt');
  // Der QR-Code lässt sich wieder lesen (gleiche Bibliothek wie die Kamera-Erkennung) und enthält den Link mit dem Angebot
  const gelesen = await tablet.evaluate(() => { const c = document.querySelector('#kv-main canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height), r = jsQR(d.data, c.width, c.height); return r ? r.data : null; });
  assert.ok(gelesen && gelesen.endsWith('#o=' + angebot) && /verbindung\.html#/.test(gelesen), 'QR-Code nicht lesbar');
  console.log('Angebot: ' + angebot.length + ' Zeichen');
  const handy = await context.newPage(); handy.on('pageerror', e => pageErrors.push('Handy: ' + e));
  await handy.goto(dir + 'verbindung.html#o=' + angebot, { waitUntil: 'load', timeout: 30000 });
  await handy.waitForFunction(() => window.KV && KV.lastAnswer, null, { timeout: 15000 });
  const antwort = await handy.evaluate(() => KV.lastAnswer);
  await tablet.evaluate(() => { document.querySelector('#kv-ov details').open = true; }); await tablet.fill('#kv-paste', antwort); await tablet.click('#kv-pastego');
  await tablet.waitForFunction(() => /Verbindung funktioniert|fehlerhaft|fehlgeschlagen/.test(document.getElementById('kv-ov').innerText), null, { timeout: 40000 });
  const txt = await tablet.evaluate(() => document.getElementById('kv-ov').innerText);
  assert.ok(/Verbindung funktioniert/.test(txt), 'Test nicht bestanden: ' + txt);
  assert.ok(/Laufzeit: \d+ ms/.test(txt) && /MBit\/s/.test(txt), 'Messwerte fehlen: ' + txt);
  await handy.waitForFunction(() => /Verbindung funktioniert/.test(document.getElementById('st').innerText), null, { timeout: 15000 });
  // Ohne Code meldet die Handy-Seite einen Hinweis
  const leer = await context.newPage(); await leer.goto(dir + 'verbindung.html', { waitUntil: 'load' });
  assert.ok(/Code am Tablet/.test(await leer.evaluate(() => document.getElementById('st').innerText)));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Handy-Verbindung OK (QR, Angebot, Antwort, direkte Verbindung, Prüfdaten 4 MB)');
} finally {
  await browser.close();
}
