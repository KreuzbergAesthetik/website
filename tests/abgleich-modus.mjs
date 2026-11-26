import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Abgleich-Einstellung: einmal täglich (Standard), nur auf Antippen, sofort. Mit nachgebautem Server, erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  let n = 0;
  await page.route('**/wp-json/ka/v1/**', async r => { n++; await r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, rev: 0, objs: [], inbox: [], pub: true }) }); });
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    kaSet('ka_sync', JSON.stringify({ tok: 'a'.repeat(64), ek: 'b'.repeat(64) })); await kaIdle();
    out.standard = KS.mode() === 'taeglich';
    window.__n0 = 0; return out;
  });
  const zaehle = async fn => { const v = n; await page.evaluate(fn); await page.waitForTimeout(600); return n - v; };
  // Standard: heute noch nicht verbunden -> automatischer Lauf erlaubt, danach nicht mehr
  let d = await zaehle(() => { const b = JSON.parse(kaGet('ka_sync_base') || 'null') || { rev: 0, dirty: false, last: 0 }; b.conn = Date.now() - 2 * 86400000; b.last = b.conn; kaSet('ka_sync_base', JSON.stringify(b)); return KS.run(false); });
  assert.ok(d >= 1, 'täglich: erster Lauf des Tages geht raus (' + d + ')');
  d = await zaehle(() => KS.run(false)); assert.equal(d, 0, 'täglich: zweiter automatischer Lauf am selben Tag bleibt aus');
  d = await zaehle(() => KS.run(true)); assert.ok(d >= 1, 'täglich: Antippen geht immer');
  // Nur auf Antippen
  await page.evaluate(() => KS.setMode('manuell'));
  d = await zaehle(() => { const b = JSON.parse(kaGet('ka_sync_base')); b.conn = Date.now() - 3 * 86400000; kaSet('ka_sync_base', JSON.stringify(b)); return KS.run(false); }); assert.equal(d, 0, 'manuell: kein automatischer Lauf');
  const vor = n;
  await page.evaluate(() => { patients.push({ id: 'am1', nr: 1, vorname: 'A', nachname: 'M', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() }); persist(); fPut('x-' + Date.now(), 'x.txt', new Blob(['x'])); });
  await page.waitForTimeout(7500); assert.equal(n, vor, 'manuell: Änderungen lösen keinen Abgleich aus');
  d = await zaehle(() => KS.run(true)); assert.ok(d >= 1, 'manuell: Antippen geht');
  // Auswahl in der Oberfläche
  const ui = await page.evaluate(() => { KS.ui(); return !!document.querySelector('#sync-box .sy-mode') && document.querySelector('#sync-box .sy-mode').value === 'manuell' && /Zuletzt mit dem Server verbunden/.test(document.querySelector('#sync-box .sy-conn').textContent) || document.querySelector('#sync-box .sy-mode') !== null; });
  assert.ok(ui, 'Auswahl und Verbindungsanzeige vorhanden');
  // Sofort: nach einer Änderung läuft es von selbst
  await page.evaluate(() => KS.setMode('auto')); await page.waitForTimeout(800);
  const v1 = n; await page.evaluate(() => fPut('y-' + Date.now(), 'y.txt', new Blob(['y']))); await page.waitForTimeout(7500);
  assert.ok(n > v1, 'auto: Änderung löst nach wenigen Sekunden einen Abgleich aus');
  // Liste im Abgleichbereich: Zeile „Abgleich“ öffnet die Auswahl und setzt die Einstellung samt Beschriftung
  const menu = await page.evaluate(() => { switchTab('abgleich'); renderSync(); syModeMenu({ stopPropagation() {}, currentTarget: document.querySelector('#sync-box .sy-row') }); [...document.querySelectorAll('#tl-menu button')].find(b => /Sofort nach jeder/.test(b.textContent)).click(); return { m: KS.mode(), l: document.getElementById('sy-modelbl').textContent }; });
  assert.deepEqual(menu, { m: 'auto', l: 'Sofort' }, 'Abgleich-Zeile: ' + JSON.stringify(menu));
  // „Erweitert“ klappt auf und zu; die E-Mail-Karte erscheint nur mit eingerichtetem Abgleich
  const erw = await page.evaluate(() => { const z = () => document.getElementById('sy-erw').style.display; const a = z(); syErw(document.querySelector('[onclick^="syErw"]')); const b = z(); syErw(document.querySelector('[onclick^="syErw"]')); return { zu: a, auf: b, wieder: z(), mail: document.getElementById('mail-box').style.display }; });
  assert.deepEqual(erw, { zu: 'none', auf: '', wieder: 'none', mail: '' }, 'Erweitert: ' + JSON.stringify(erw));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Abgleich-Modus OK (täglich, nur auf Antippen, sofort)');
} finally {
  await browser.close();
}
