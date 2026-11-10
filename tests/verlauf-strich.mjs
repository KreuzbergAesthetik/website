import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Verlauf der Akte: Der farbige Strich zwischen Uhrzeit und Text liegt bei allen Einträgen eines Tages in derselben Spalte
// und schließt ohne Lücke an den nächsten Eintrag an, auch bei Farbwechsel und bei umrahmten Terminen und Dokumentationen. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1000, height: 700 } });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    patients.length = 0; events.length = 0; const now = Date.now();
    const p = { id: 'v1', nr: 1, anrede: 'Herr', vorname: 'Max', nachname: 'Muster', dob: '13.01.1992', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [
      { ts: now - 1000, type: 'notiz', text: 'Erste erfundene Notiz' }, { ts: now - 2000, type: 'mail', text: 'Erfundene Mail' }, { ts: now - 3000, type: 'notiz', text: 'Zweite erfundene Notiz' }, { ts: now - 4000, type: 'rezept', text: 'Erfundenes Rezept' }],
      doku: [{ ts: now - 5000, text: 'Erfundene Behandlung' }], dokumente: [], bilder: [], erstellt: now - 6000 };
    patients.push(p); events.push({ id: 'e1', patientId: p.id, patient: nameKey(p), date: iso(new Date()), time: '09:00', dauer: 30, title: 'Erfundener Termin', typ: 'Behandlung' });
    viewAkte(p); await new Promise(r => setTimeout(r, 500));
    const rows = [...document.querySelectorAll('.tl-day')][0].querySelectorAll('.tl-item .tl-body');
    const rects = [...rows].map(b => { const x = b.getBoundingClientRect(); return { l: x.left, t: x.top, b: x.bottom, c: getComputedStyle(b).borderLeftColor }; });
    return { n: rects.length, rects };
  });
  assert.ok(r.n >= 6, 'Zu wenige Verlaufseinträge: ' + JSON.stringify(r));
  const l0 = r.rects[0].l;
  r.rects.forEach((x, i) => assert.ok(Math.abs(x.l - l0) <= 1, `Strich ${i} nicht in derselben Spalte: ${JSON.stringify(r.rects)}`));
  for (let i = 0; i + 1 < r.rects.length; i++) assert.ok(Math.abs(r.rects[i].b - r.rects[i + 1].t) <= 0.6, `Lücke im Strich zwischen Eintrag ${i} und ${i + 1}: ${JSON.stringify(r.rects)}`);
  assert.ok(new Set(r.rects.map(x => x.c)).size >= 4, 'Farbwechsel fehlt: ' + JSON.stringify(r.rects));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Verlauf-Strich OK (' + r.n + ' Einträge, durchgehend, ' + new Set(r.rects.map(x => x.c)).size + ' Farben)');
} finally {
  await browser.close();
}
