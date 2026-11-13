import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Patientenliste quer/Desktop: Geburtsdatum und Hinweise als eigene Spalten, Telefon und E-Mail mit Symbol untereinander,
// Vorname schwarz, schwebende Legende, Schnellaktionen nur beim Überfahren der rechten Zone, große Klickfläche links,
// Erstellt-am-Symbol in der Kopfzeile. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 700 } });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = []; page.on('pageerror', e => pageErrors.push(String(e)));
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await page.evaluate(async () => {
    patients.length = 0; events.length = 0; FLC = null;
    const p = { id: 'q1', nr: 1, anrede: 'Herr', vorname: 'Max', nachname: 'Muster', dob: '13.01.1992', phone: '030 123456', email: 'max@example.invalid', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(p); const d = new Date(); d.setDate(d.getDate() + 3);
    events.push({ id: 'e1', patientId: p.id, patient: nameKey(p), date: iso(d), time: '10:00', dur: 30, title: 'T', behandlung: 'Botox' });
    switchTab('patienten'); renderPatients(); await new Promise(r => setTimeout(r, 400));
  });
  const r = await page.evaluate(() => {
    const row = document.querySelector('#patient-table tr'), box = e => e.getBoundingClientRect(), vis = e => !!e && getComputedStyle(e).display !== 'none';
    const l = row.querySelector('.pt-l'), dob = row.querySelector('.pt-dobc'), hi = row.querySelector('.pt-hintc'), rz = row.querySelector('.pt-rz'), lines = [...row.querySelectorAll('.pt-iln')];
    const ths = [...document.querySelectorAll('.pt-hg > *')].filter(vis).map(e => e.textContent.trim());
    return {
      spalten: ths, dobText: dob.textContent, dobRechtsVonName: box(dob).left >= box(l).right - 1, hinweiseRechtsVonDob: box(hi).left >= box(dob).right - 1, punkte: hi.querySelectorAll('.pt-dot').length,
      infoZeilen: lines.length, symbole: lines.every(x => x.querySelector('svg')), untereinander: lines.length === 2 && box(lines[1]).top > box(lines[0]).bottom - 1,
      vorname: getComputedStyle(row.querySelector('.pn-f')).color, legende: vis(document.getElementById('pt-leg')), legendeFix: getComputedStyle(document.getElementById('pt-leg')).position,
      erKopf: !!document.querySelector('.pt-hg .pt-erb') && box(document.querySelector('.pt-hg .pt-erb')).right > box(rz).right - 60,
      altKnopfWeg: !vis(document.getElementById('pt-er-row')), infoLinksVonZone: box(rz).left > box(hi).right - 1,
      klickBreite: Math.round(box(l).width), klickHoehe: Math.round(box(l).height)
    };
  });
  assert.ok(r.spalten.some(x => /Geburtsdatum/.test(x)) && r.spalten.some(x => /Hinweise/.test(x)) && r.spalten.some(x => /Informationen/.test(x)), 'Spaltenköpfe: ' + JSON.stringify(r.spalten));
  assert.equal(r.dobText, '13.01.1992'); assert.ok(r.dobRechtsVonName && r.hinweiseRechtsVonDob, 'Reihenfolge Name, Geburtsdatum, Hinweise: ' + JSON.stringify(r));
  assert.ok(r.punkte >= 1, 'Hinweis-Punkte fehlen');
  assert.ok(r.infoZeilen === 2 && r.symbole && r.untereinander, 'Telefon und E-Mail mit Symbol untereinander: ' + JSON.stringify(r));
  assert.equal(r.vorname, 'rgb(15, 23, 42)', 'Vorname nicht schwarz');
  assert.ok(r.legende && r.legendeFix === 'fixed', 'Legende nicht schwebend sichtbar');
  assert.ok(r.erKopf && r.altKnopfWeg, 'Erstellt-am-Symbol nicht in der Kopfzeile: ' + JSON.stringify(r));
  assert.ok(r.klickBreite > 200 && r.klickHoehe >= 50, 'Klickfläche zu klein: ' + r.klickBreite + 'x' + r.klickHoehe);
  // Schnellaktionen: links nicht sichtbar, rechts beim Überfahren sichtbar
  const op = () => page.evaluate(() => getComputedStyle(document.querySelector('#patient-table .pt-quick')).opacity);
  await page.hover('#patient-table .pt-l'); await page.waitForTimeout(300); assert.equal(await op(), '0', 'Schnellaktionen links sichtbar');
  await page.hover('#patient-table .pt-rz'); await page.waitForTimeout(300); assert.equal(await op(), '1', 'Schnellaktionen rechts nicht sichtbar');
  // Klick auf den leeren Teil der linken Zone öffnet die Akte
  await page.evaluate(() => { document.getElementById('modal-akte') && 0; });
  const hit = await page.evaluate(() => { const l = document.querySelector('#patient-table .pt-dobc').getBoundingClientRect(); return { x: l.left + l.width - 4, y: l.top + l.height / 2 }; });
  await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(400);
  assert.ok(await page.evaluate(() => document.getElementById('modal-akte').classList.contains('active') || document.querySelector('.akte-page.active')), 'Klick in die linke Zone öffnet die Akte nicht');
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Patientenliste quer OK (Spalten, Symbole, Legende, Hover-Zone, Klickfläche)');
} finally {
  await browser.close();
}
