import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Untere schwebende Leiste: Suche immer offen, daneben Termin, Patient, Rechnung; in der Akte liegen die Akte-Aktionen darüber, ohne die Leiste zu überdecken.
// Im Hoch- und im Querformat. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  for (const [w, h] of [[390, 844], [915, 412], [1280, 800]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
    await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
    const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
    await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
    const r = await page.evaluate(async () => {
      const box = id => { const e = document.getElementById(id), b = e.getBoundingClientRect(), cs = getComputedStyle(e); return { l: b.left, r: b.right, t: b.top, b: b.bottom, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 }; };
      const out = { vw: innerWidth, vh: innerHeight, bar: box('gs-bar'), kal: box('gs-kal'), pat: box('gs-pat'), rec: box('gs-rec'), lupe: getComputedStyle(document.getElementById('gs-fab')).display };
      patients.length = 0; patients.push({ id: 'l1', nr: 1, anrede: 'Frau', vorname: 'Anna', nachname: 'Beispiel', dob: '01.01.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
      viewAkte(patients[0]); await new Promise(r => setTimeout(r, 500));
      const af = document.querySelector('.a-fab').getBoundingClientRect(); out.akteAktionen = { t: af.top, b: af.bottom, vis: af.height > 0 };
      const inp = document.getElementById('gs-in'); inp.value = 'Anna'; gsRun(); await new Promise(r => setTimeout(r, 300));
      const res = document.getElementById('gs-res').getBoundingClientRect(); out.treffer = { b: res.bottom, h: res.height, vis: getComputedStyle(document.getElementById('gs-res')).display !== 'none' };
      return out;
    });
    const tag = `${w}x${h} ${JSON.stringify(r)}`;
    assert.ok(r.bar.vis, 'Suchleiste nicht sichtbar ' + tag);
    assert.equal(r.lupe, 'none', 'Lupen-Knopf noch sichtbar ' + tag);
    for (const k of ['kal', 'pat', 'rec']) assert.ok(r[k].vis && r[k].b <= r.vh && r[k].r <= r.vw, 'Knopf ' + k + ' nicht sichtbar ' + tag);
    assert.ok(r.bar.r <= r.kal.l + 1 && r.kal.r <= r.pat.l + 1 && r.pat.r <= r.rec.l + 1, 'Leiste überlappt ' + tag);
    assert.ok(r.vh - r.bar.b <= 24 && r.bar.l >= 0, 'Leiste sitzt nicht am unteren Rand ' + tag);
    assert.ok(r.akteAktionen.vis && r.akteAktionen.b <= r.bar.t + 1, 'Akte-Aktionen überdecken die Leiste ' + tag);
    assert.ok(r.treffer.vis && r.treffer.h > 20 && r.treffer.b <= r.bar.t, 'Trefferliste nicht über der Leiste ' + tag);
    await context.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Untere Leiste OK (3 Größen)');
} finally {
  await browser.close();
}
