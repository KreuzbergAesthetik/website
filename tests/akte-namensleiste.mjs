import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Namensleiste der Akte: Rahmenfarbe nach Anrede, Name einzeilig wenn er passt, sonst zweizeilig (Nachname oben, Vorname darunter), nie dreizeilig;
// Alter und Nummer rechts untereinander unter dem Stift. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
const neu = async (w, h) => {
  const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  return { context, page };
};
const pruefe = (page, rows) => page.evaluate(async rows => {
  const out = [], wait = ms => new Promise(r => setTimeout(r, ms));
  window.alert = () => {};
  for (const [anrede, vn, nn] of rows) {
    patients.length = 0;
    patients.push({ id: 'nb1', nr: 81, anrede, vorname: vn, nachname: nn, dob: '18.11.1990', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
    FLC = null; closeModal('modal-akte'); viewAkte(patients[0]); await wait(400);
    const bar = document.querySelector('.a-top'), nm = bar.querySelector('.a-nm'), l = nm.querySelector('.a-nl'), f = nm.querySelector('.a-nf');
    const lh = el => parseFloat(getComputedStyle(el).lineHeight) || parseFloat(getComputedStyle(el).fontSize) * 1.2;
    const zeilen = Math.round(nm.getBoundingClientRect().height / lh(nm));
    const rt = bar.querySelector('.a-rt'), age = rt.querySelector('.a-age'), pid = rt.querySelector('.a-pid'), pen = document.getElementById('a-edit');
    const r = e => e.getBoundingClientRect();
    out.push({ anrede, ein: nm.classList.contains('a-nm-1'), zwei: nm.classList.contains('a-nm-2'), zeilen, vornameUnten: r(f).top >= r(l).bottom - 2 || nm.classList.contains('a-nm-1'),
      farbe: getComputedStyle(bar).borderTopColor, pfeil: getComputedStyle(bar.querySelector(':scope > .icon-btn')).color, rechtsUntereinander: r(age).bottom <= r(pid).top + 1 && r(pen).bottom <= r(age).top + 2,
      rechtsbuendig: Math.abs(r(pen.querySelector('svg')).right - r(age).right) <= 1.5 && Math.abs(r(age).right - r(pid).right) <= 1.5,
      nichtAbgeschnitten: r(nm).right <= r(rt).left + 1 && r(rt).right <= r(bar).right && l.scrollWidth <= nm.clientWidth + 1 && f.scrollWidth <= nm.clientWidth + 1 });
  }
  return out;
}, rows);
try {
  const lang = ['Herr', 'Maximilian-Alexander', 'Müller-Lüdenscheidt-Wolkenstein-Hohenzollern'];
  for (const [w, h] of [[390, 844], [915, 412], [1280, 700]]) {
    const t = await neu(w, h);
    const r = await pruefe(t.page, [['Frau', 'Eva', 'Lau'], ['Herr', 'Jan', 'Lau'], ['Divers', 'Alex', 'Beispiel'], ['', 'Eva', 'Muster'], ['Herr', 'Jan', 'Musterfrau-Beispiel'], lang]);
    const [a, b, c, d, e, g] = r;
    for (const x of [a, b, c, d]) assert.equal(x.farbe, 'rgb(30, 58, 138)', w + ' Rahmen immer dunkles Patientenblau');
    assert.equal(a.pfeil, 'rgb(232, 121, 169)', w + ' Pfeil Frau'); assert.equal(b.pfeil, 'rgb(91, 135, 214)', w + ' Pfeil Herr'); assert.equal(c.pfeil, 'rgb(124, 195, 138)', w + ' Pfeil Divers');
    assert.ok(a.ein && a.zeilen === 1, w + ' kurzer Name einzeilig ' + JSON.stringify(a));
    for (const x of r) { assert.ok(x.ein !== x.zwei, w + ' genau ein Modus'); assert.ok(x.zeilen <= 2, w + ' nie dreizeilig ' + JSON.stringify(x)); assert.ok(x.vornameUnten, w + ' Vorname unter Nachname'); assert.ok(x.rechtsbuendig, w + ' Stift, Alter, Nummer rechtsbündig ' + JSON.stringify(x)); assert.ok(x.rechtsUntereinander, w + ' Stift, Alter, Nummer untereinander ' + JSON.stringify(x)); if (x !== g) assert.ok(x.nichtAbgeschnitten, w + ' nichts abgeschnitten ' + JSON.stringify(x)); }
    assert.ok(g.zwei && g.zeilen === 2, w + ' sehr langer Name zweizeilig ' + JSON.stringify(g));
    await t.context.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Namensleiste OK (Rahmen immer dunkelblau mit Pfeil in der Farbe der Anrede, ein-/zweizeilig, nie dreizeilig, Alter und Nummer rechts; 3 Größen)');
} finally {
  await browser.close();
}
