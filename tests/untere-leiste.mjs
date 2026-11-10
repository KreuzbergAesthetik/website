import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Untere schwebende Leiste: Suche standardmäßig offen und per Lupe einklappbar, daneben ein Plus-Knopf mit Pop-up (Termin, Patient, Rechnung);
// in der Akte liegen die Akte-Aktionen darüber, ohne die Leiste zu überdecken.
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
      const box = id => { const e = document.getElementById(id), b = e.getBoundingClientRect(), cs = getComputedStyle(e); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 }; };
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const out = { vw: innerWidth, vh: innerHeight, bar: box('gs-bar'), lupe: box('gs-lupe'), plus: box('gs-plus'), menuAnfang: getComputedStyle(document.getElementById('gs-menu')).display, lupeAlt: getComputedStyle(document.getElementById('gs-fab')).display };
      // Pop-up-Menü über dem Plus-Knopf
      document.getElementById('gs-plus').click(); await wait(100);
      out.menu = { an: getComputedStyle(document.getElementById('gs-menu')).display, kal: box('gs-kal'), pat: box('gs-pat'), rec: box('gs-rec'), plus: box('gs-plus'), exp: document.getElementById('gs-plus').getAttribute('aria-expanded') };
      document.getElementById('gs-plus').click(); await wait(100);
      out.menuZu = getComputedStyle(document.getElementById('gs-menu')).display;
      // Außerhalb tippen schließt das Menü
      document.getElementById('gs-plus').click(); await wait(50); document.body.click(); await wait(50);
      out.menuAussen = getComputedStyle(document.getElementById('gs-menu')).display;
      // Lupe klappt die Suchleiste ein und wieder auf
      document.getElementById('gs-lupe').click(); await wait(150);
      out.zu = { bar: box('gs-bar'), input: getComputedStyle(document.getElementById('gs-in')).display, plus: box('gs-plus'), exp: document.getElementById('gs-lupe').getAttribute('aria-expanded'), gemerkt: localStorage.getItem('ka_gs_zu') };
      document.getElementById('gs-lupe').click(); await wait(150);
      out.auf = { bar: box('gs-bar'), input: getComputedStyle(document.getElementById('gs-in')).display, exp: document.getElementById('gs-lupe').getAttribute('aria-expanded'), gemerkt: localStorage.getItem('ka_gs_zu') };
      // Akte: Aktionen über der Leiste, Treffer über der Leiste
      patients.length = 0; patients.push({ id: 'l1', nr: 1, anrede: 'Frau', vorname: 'Anna', nachname: 'Beispiel', dob: '01.01.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
      viewAkte(patients[0]); await wait(500);
      const af = document.querySelector('.a-fab').getBoundingClientRect(); out.akteAktionen = { b: af.bottom, t: af.top, w: af.width, h: af.height, r: af.right, vis: af.height > 0 };
      const inp = document.getElementById('gs-in'); inp.value = 'Anna'; gsRun(); await wait(300);
      const res = document.getElementById('gs-res').getBoundingClientRect(); out.treffer = { b: res.bottom, h: res.height, vis: getComputedStyle(document.getElementById('gs-res')).display !== 'none' };
      return out;
    });
    const tag = `${w}x${h} ${JSON.stringify(r)}`;
    assert.ok(r.bar.vis && r.bar.w > 100 && r.lupe.vis && r.plus.vis, 'Suchleiste, Lupe oder Plus nicht sichtbar ' + tag);
    assert.equal(r.lupeAlt, 'none', 'alter Lupen-Knopf noch sichtbar ' + tag);
    assert.ok(r.bar.r <= r.plus.l + 1 && r.plus.r <= r.vw && r.vh - r.bar.b <= 24, 'Leiste sitzt nicht richtig unten ' + tag);
    assert.equal(r.menuAnfang, 'none', 'Menü am Anfang offen ' + tag);
    assert.notEqual(r.menu.an, 'none', 'Menü öffnet nicht ' + tag);
    for (const k of ['kal', 'pat', 'rec']) assert.ok(r.menu[k].vis && r.menu[k].b <= r.menu.plus.t && r.menu[k].l >= 0 && r.menu[k].r <= r.vw && r.menu[k].t >= 0, 'Menüpunkt ' + k + ' nicht sichtbar oder nicht über Plus ' + tag);
    assert.equal(r.menu.exp, 'true', 'aria-expanded fehlt ' + tag);
    assert.equal(r.menuZu, 'none', 'Menü schließt nicht beim zweiten Tipp ' + tag);
    assert.equal(r.menuAussen, 'none', 'Menü schließt nicht beim Tippen daneben ' + tag);
    assert.ok(r.zu.bar.w < 60 && r.zu.input === 'none' && r.zu.exp === 'false' && r.zu.gemerkt === '1' && r.zu.plus.vis, 'Einklappen funktioniert nicht ' + tag);
    assert.ok(r.auf.bar.w > 100 && r.auf.input !== 'none' && r.auf.exp === 'true' && r.auf.gemerkt === '0', 'Aufklappen funktioniert nicht ' + tag);
    assert.ok(r.akteAktionen.h > r.akteAktionen.w && r.akteAktionen.r <= r.vw && r.akteAktionen.t >= 40, 'Akte-Aktionen nicht untereinander oder außerhalb ' + tag);
    assert.ok(r.akteAktionen.vis && r.akteAktionen.b <= r.bar.t + 1, 'Akte-Aktionen überdecken die Leiste ' + tag);
    assert.ok(r.treffer.vis && r.treffer.h > 20 && r.treffer.b <= r.bar.t, 'Trefferliste nicht über der Leiste ' + tag);
    await context.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Untere Leiste OK (Suche, Lupe zum Einklappen, Plus-Menü; 3 Größen)');
} finally {
  await browser.close();
}
