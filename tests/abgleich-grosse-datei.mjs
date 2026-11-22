import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Abgleich: Eine Datei, die der Server (PHP-Grenze) nicht annimmt, wird übersprungen und benannt; der Rest wird abgeglichen. Nachgebauter Server, erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  const puts = [];
  await page.route('**/wp-json/ka/v1/**', async r => {
    const d = r.request().postData() || '', a = (/name="a"\r\n\r\n([^\r]*)/.exec(d) || [])[1], n = (/name="n"\r\n\r\n([^\r]*)/.exec(d) || [])[1];
    if (a === 'put') puts.push(n);
    if (a === 'put' && /^f_/.test(n || '') && d.length > 600000) return r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Ungültige Anfrage.' }) });
    await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, rev: 1, objs: [], inbox: [], pub: true }) });
  });
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}; window.alert = () => {};
    kaSet('ka_sync', JSON.stringify({ tok: 'a'.repeat(64), ek: 'b'.repeat(64) })); await kaIdle();
    const rnd = new Uint8Array(900000); for (let i = 0; i < rnd.length; i += 65536) crypto.getRandomValues(rnd.subarray(i, Math.min(rnd.length, i + 65536)));
    await fPut('gross-1', 'Grosse-Datei.pdf', new Blob([rnd], { type: 'application/pdf' }));
    await KS.run(true);
    out.text = document.querySelector('#sync-box .sy-state') ? document.querySelector('#sync-box .sy-state').textContent : '';
    return out;
  });
  assert.match(r.text, /zu groß für den Server/, 'Meldung nennt die zu große Datei: ' + r.text);
  assert.match(r.text, /Grosse-Datei\.pdf/, 'Dateiname steht in der Meldung');
  assert.ok(puts.includes('core'), 'Der Rest (core) wurde trotzdem abgeglichen: ' + JSON.stringify(puts));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Abgleich große Datei OK (übersprungen, benannt, Rest abgeglichen)');
} finally {
  await browser.close();
}
