import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Akte: leere Kacheln ausgeblendet mit „+“ zum Ergänzen, Filter der Zeitleiste nach Art, Antippen am Touchgerät zeigt das Menü. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 412, height: 900 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const t = Date.now(), D = 86400000;
    const p = { id: 'kf1', nr: 1, vorname: 'Kira', nachname: 'Kachel', dob: '01.02.1990', adresse: 'Musterweg 1\n10999 Berlin', erstellt: t, medikation: [], bilder: [], dokumente: [], doku: [{ ts: t - D * 3, text: 'Beratung' }],
      log: [{ ts: t - D * 2, type: 'notiz', text: 'Eine Notiz' }, { ts: t - D, type: 'mail', text: 'E-Mail gesendet an k@example.org\nBetreff: x' }] };
    patients.length = 0; patients.push(p); events.length = 0; FLC = null; persist(); viewAkte(p); await wait(500);
    const sichtbar = () => [...document.querySelectorAll('#a-head .a-tile')].filter(x => getComputedStyle(x).display !== 'none').map(x => x.querySelector('h4').textContent);
    out.leereWeg = JSON.stringify(sichtbar()) === JSON.stringify(['Kontakt', 'Anschrift']);
    const plus = document.querySelector('.a-addtile'); out.plus = !!plus;
    plus.click(); await wait(200);
    const eintraege = [...document.querySelectorAll('#tl-menu button')].map(b => b.textContent);
    out.menue = ['Wiedervorstellung', 'Notiz', 'Medikation', 'Allergien'].every(n => eintraege.includes(n)) && !eintraege.includes('Anschrift');
    [...document.querySelectorAll('#tl-menu button')].find(b => b.textContent === 'Notiz').click(); await wait(300);
    out.bearbeiten = !!document.getElementById('a-tile-in');
    // Filter
    tileEdit = ''; renderHead(); renderVerlauf(); await wait(200);
    const chips = [...document.querySelectorAll('.tl-filter .md-chip')].map(c => c.textContent);
    out.chips = chips[0] === 'Alle' && chips.includes('Notizen') && chips.includes('E-Mails') && chips.includes('Dokumentation');
    [...document.querySelectorAll('.tl-filter .md-chip')].find(c => c.textContent === 'Notizen').click(); await wait(200);
    const nur = [...document.querySelectorAll('#a-verlauf .tl-item')].every(x => x.classList.contains('tl-notiz')) && document.querySelectorAll('#a-verlauf .tl-item').length === 1;
    out.filter = nur;
    document.querySelector('.tl-filter .md-chip').click(); await wait(200);
    out.alle = document.querySelectorAll('#a-verlauf .tl-item').length >= 3;
    // Touch: Antippen des Eintrags zeigt das Menü
    const row = document.querySelector('#a-verlauf .tl-item.tl-notiz'); row.querySelector('.tl-body').click(); await wait(100);
    out.touch = row.classList.contains('quick-on');
    row.querySelector('.tl-body').click(); await wait(100); out.touchZu = !row.classList.contains('quick-on');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Kacheln und Filter: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Kacheln und Filter OK (leere Kacheln weg, Plus-Menü, Filter, Antippen)');
} finally {
  await browser.close();
}
