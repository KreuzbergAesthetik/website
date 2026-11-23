import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Zeitleiste: Beim Überfahren erscheinen Symbole, die zum Eintrag passen; E-Mail erneut senden übernimmt Empfänger, Betreff und Text. Erfundene Daten.
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
  await page.evaluate(() => {
    window.alert = () => {}; const t = Date.now(), D = 86400000;
    const p = { id: 'zs1', nr: 1, vorname: 'Zora', nachname: 'Symbol', email: 'zora@example.org', erstellt: t, medikation: [], bilder: [], dokumente: [],
      doku: [{ ts: t - D * 5, text: 'Beratung' }],
      log: [{ ts: t - D * 3, type: 'mail', text: 'E-Mail gesendet an zora@example.org\nBetreff: Dein Termin\nBis bald' }, { ts: t - D * 2, type: 'notiz', text: 'Eine Notiz' }] };
    patients.length = 0; patients.push(p); events.length = 0;
    events.push({ id: 'ze1', date: new Date(t - D * 9).toISOString().slice(0, 10), time: '09:00', dur: 30, patient: 'Zora Symbol', pid: 'zs1', leistung: 'Beratung', behandlung: 'Test', notes: '' });
    FLC = null; persist(); viewAkte(p);
  });
  await page.waitForTimeout(500);
  const titel = async (sel) => { await page.hover(sel); await page.waitForTimeout(350); return page.evaluate(s => { const r = document.querySelector(s); return { sichtbar: getComputedStyle(r.querySelector('.tl-quick')).opacity === '1', t: [...r.querySelectorAll('.tl-qb')].map(b => b.title) }; }, sel); };
  const termin = await titel('#a-verlauf .tl-item.tl-termin'), doku = await titel('#a-verlauf .tl-item.tl-doku:not(.tl-termin)'), mail = await titel('#a-verlauf .tl-item.tl-mail'), notiz = await titel('#a-verlauf .tl-item.tl-notiz');
  assert.ok(termin.sichtbar && termin.t.slice(0, 4).join() === 'Im Kalender anzeigen,Dokumentation,Rechnung erstellen,Rezept erstellen', 'Termin: ' + JSON.stringify(termin));
  assert.ok(doku.sichtbar && doku.t.slice(0, 3).join() === 'Bearbeiten,Bild oder Datei anhängen,Mit Termin verknüpfen', 'Doku: ' + JSON.stringify(doku));
  assert.ok(mail.sichtbar && mail.t[0] === 'Erneut senden', 'E-Mail: ' + JSON.stringify(mail));
  assert.ok(notiz.sichtbar && notiz.t[0] === 'Bearbeiten', 'Notiz: ' + JSON.stringify(notiz));
  await page.hover('#a-verlauf .tl-item.tl-mail'); await page.click('#a-verlauf .tl-item.tl-mail .tl-qb[title="Erneut senden"]'); await page.waitForTimeout(300);
  const f = await page.evaluate(() => ({ an: document.getElementById('m-an').value, b: document.getElementById('m-betreff').value, t: document.getElementById('m-text').value }));
  assert.equal(f.an, 'zora@example.org'); assert.equal(f.b, 'Dein Termin'); assert.equal(f.t, 'Bis bald');
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Zeitleiste-Symbole OK (Termin, Dokumentation, E-Mail erneut senden, Notiz)');
} finally {
  await browser.close();
}
