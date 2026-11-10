import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Patientenakte im Querformat: Seitenleiste und Zeitleiste reichen bis zum unteren Bildschirmrand (kein leerer Streifen darunter),
// im Hochformat bleibt die einspaltige Ansicht. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  for (const [w, h, quer] of [[915, 412, true], [844, 390, true], [1280, 800, true], [390, 844, false]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900, deviceScaleFactor: 1 });
    await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
    const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
    await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
    const r = await page.evaluate(async () => {
      patients.length = 0;
      const p = { id: 'q1', nr: 1, anrede: 'Herr', vorname: 'Max', nachname: 'Muster', dob: '13.01.1992', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [{ ts: Date.now(), type: 'note', text: 'Erfundene Notiz' }], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
      patients.push(p); viewAkte(p); await new Promise(r => setTimeout(r, 400));
      const bx = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect() : null; };
      const pg = bx('.akte-page.active'), sd = bx('.a-sidecol'), pn = bx('.akte-page .a-pane');
      return { vh: innerHeight, pageBottom: pg.bottom, sideH: sd ? sd.height : 0, sideBottom: sd ? sd.bottom : 0, paneBottom: pn.bottom, grid: getComputedStyle(document.querySelector('.akte-page.active')).display };
    });
    if (quer) {
      assert.equal(r.grid, 'grid', `${w}x${h}: zweispaltige Ansicht fehlt ${JSON.stringify(r)}`);
      assert.ok(r.vh - r.sideBottom <= 8 && r.vh - r.paneBottom <= 8, `${w}x${h}: Spalten enden nicht am unteren Rand ${JSON.stringify(r)}`);
    } else {
      assert.equal(r.grid, 'block', `${w}x${h}: Hochformat nicht einspaltig ${JSON.stringify(r)}`);
    }
    await context.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Akte im Querformat OK (4 Größen)');
} finally {
  await browser.close();
}
