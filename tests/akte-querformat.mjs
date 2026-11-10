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
      const side = document.querySelector('.a-side') ? document.querySelector('.a-side').getBoundingClientRect() : null, top = document.querySelector('.a-sidecol .a-top');
      const kurz = { sideBottom: side ? side.bottom : 0, paneBottom: pn.bottom, topL: top ? top.getBoundingClientRect().left : 0, topR: top ? top.getBoundingClientRect().right : 0, cardL: side ? side.left : 0, cardR: side ? side.right : 0 };
      // langer Verlauf: untere Ecken eckig, solange Inhalt folgt, am Ende rund
      for (let i = 0; i < 60; i++) p.log.push({ ts: Date.now() - i * 1000, type: 'note', text: 'Erfundener Eintrag ' + i });
      viewAkte(p); await new Promise(r => setTimeout(r, 500));
      const pane = document.querySelector('.akte-page .a-pane'); pane.scrollTop = 0; await new Promise(r => setTimeout(r, 200));
      const oben = getComputedStyle(pane).borderBottomLeftRadius; pane.scrollTop = pane.scrollHeight; await new Promise(r => setTimeout(r, 300));
      const unten = getComputedStyle(pane).borderBottomLeftRadius;
      const side2 = document.querySelector('.a-side').getBoundingClientRect();
      return { kurz, oben, unten, lang: { sideBottom: side2.bottom, paneBottom: pane.getBoundingClientRect().bottom }, vh: innerHeight, pageBottom: pg.bottom, sideH: sd ? sd.height : 0, sideBottom: sd ? sd.bottom : 0, paneBottom: pn.bottom, grid: getComputedStyle(document.querySelector('.akte-page.active')).display };
    });
    if (quer) {
      assert.equal(r.grid, 'grid', `${w}x${h}: zweispaltige Ansicht fehlt ${JSON.stringify(r)}`);
      assert.ok(Math.abs(r.kurz.sideBottom - r.kurz.paneBottom) <= 1 || r.kurz.sideBottom > r.kurz.paneBottom - 1, `${w}x${h}: Karten enden nicht auf gleicher Höhe (kurz) ${JSON.stringify(r)}`);
      assert.ok(Math.abs(r.lang.sideBottom - r.lang.paneBottom) <= 1 || r.lang.sideBottom > r.lang.paneBottom - 1, `${w}x${h}: Karten enden nicht auf gleicher Höhe (lang) ${JSON.stringify(r)}`);
      assert.ok(r.kurz.topL < r.kurz.cardL && r.kurz.topR > r.kurz.cardR && r.kurz.cardL - r.kurz.topL <= 8, `${w}x${h}: Namensleiste steht nicht leicht über ${JSON.stringify(r)}`);
      assert.equal(r.oben, '0px', `${w}x${h}: Ecken unten schon rund, obwohl Inhalt folgt ${JSON.stringify(r)}`);
      assert.equal(r.unten, '14px', `${w}x${h}: Ecken am Ende nicht rund ${JSON.stringify(r)}`);
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
