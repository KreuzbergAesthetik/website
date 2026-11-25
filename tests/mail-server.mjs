import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Text-E-Mails über den Praxis-Server: Schalter, Versand mit Zugangsschlüssel, Eintrag in der Zeitleiste, Fehler mit Angebot Mailprogramm. Nachgebauter Server, erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  const gesendet = []; let fehler = false;
  await page.route('**/wp-json/ka/v1/abgleich', async r => {
    const body = r.request().postData() || '', feld = n => { const m = new RegExp('name="' + n + '"\\r\\n\\r\\n([\\s\\S]*?)\\r\\n--').exec(body); return m ? m[1] : null; };
    if (feld('a') === 'mail') {
      if (fehler) return r.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'Der Server konnte die E-Mail nicht senden.' }) });
      gesendet.push({ t: feld('t'), an: feld('an'), b: feld('b'), x: (feld('x') || '').replace(/\r\n/g, '\n') });  // Formulardaten senden Zeilenumbrüche als CRLF, der Server wandelt sie zurück
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, von: 'info@kreuzberg-aesthetik.de', heute: gesendet.length }) });
    }
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, rev: 0, objs: [], inbox: [] }) });
  });
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await page.evaluate(async () => {
    window.alert = () => {}; kaSet('ka_sync', JSON.stringify({ tok: 'c'.repeat(64), ek: 'd'.repeat(64) })); settings.syncMode = 'manuell';
    const p = { id: 'ms1', nr: 1, vorname: 'Mia', nachname: 'Mail', email: 'mia@example.org', erstellt: Date.now(), medikation: [], bilder: [], dokumente: [], doku: [], log: [] };
    patients.length = 0; patients.push(p); FLC = null; persist(); viewAkte(p);
  });
  // Ohne Schalter: Mailprogramm (kein Serveraufruf)
  const ohne = await page.evaluate(async () => { const r = await sendViaServer({ an: 'mia@example.org', betreff: 'x', text: 'y' }).catch(e => ({ fehler: e.message })); return r; });
  assert.equal(ohne.via, 'mailto'); assert.equal(gesendet.length, 0, 'Ohne Schalter darf nichts an den Server gehen');
  // Schalter an: Versand über den Server, Eintrag in der Zeitleiste
  await page.evaluate(() => { mailServerSet(true); openMail(); document.getElementById('m-betreff').value = 'Dein Termin'; document.getElementById('m-text').value = 'Hallo Mia,\nbis morgen.'; });
  assert.ok(/Server/.test(await page.inputValue('#m-von')), 'Von-Feld zeigt nicht den Serverversand');
  await page.evaluate(() => sendMail()); await page.waitForTimeout(500);
  assert.equal(gesendet.length, 1); assert.equal(gesendet[0].t, 'c'.repeat(64)); assert.equal(gesendet[0].an, 'mia@example.org'); assert.equal(gesendet[0].b, 'Dein Termin'); assert.equal(gesendet[0].x, 'Hallo Mia,\nbis morgen.');
  const log = await page.evaluate(() => curP.log.map(l => l.text).join('|'));
  assert.ok(/^E-Mail gesendet an mia@example.org\nBetreff: Dein Termin/.test(log), 'Zeitleiste: ' + log);
  // Fehler: Angebot Mailprogramm, bei Abbrechen kein Eintrag
  fehler = true;
  const r2 = await page.evaluate(async () => { let frage = ''; window.kaConfirm = async m => { frage = m; return false; }; const n0 = curP.log.length; const r = await sendViaServer({ an: 'mia@example.org', betreff: 'x', text: 'y' }).then(() => 'ok', e => 'abgelehnt'); return { r, frage, n: curP.log.length - n0 }; });
  assert.equal(r2.r, 'abgelehnt'); assert.ok(/Mailprogramm/.test(r2.frage) && /nicht senden/.test(r2.frage), 'Fehlermeldung: ' + r2.frage); assert.equal(r2.n, 0);
  // Test-E-Mail-Knopf
  fehler = false;
  await page.evaluate(() => { switchTab('abgleich'); renderSync(); }); await page.waitForTimeout(300);
  assert.equal(await page.isChecked('#sy-mail'), true, 'Schalter nicht gesetzt');
  await page.evaluate(() => mailServerTest()); await page.waitForTimeout(400);
  assert.equal(gesendet.length, 2); assert.ok(/Gesendet an/.test(await page.textContent('#sy-mailst')));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Mail über Server OK (Schalter, Versand, Zeitleiste, Fehler mit Mailprogramm-Angebot, Test-E-Mail)');
} finally {
  await browser.close();
}
