import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Lange Menüs (Hinzufügen in der Akte) bleiben im Bild und scrollen in sich selbst, nicht die Seite dahinter. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 700 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const p = { id: 'ms1', nr: 1, anrede: 'Frau', vorname: 'Mia', nachname: 'Menü', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist(); viewAkte(p); setAkTab('anl'); await wait(400);
    const items = []; for (let i = 0; i < 60; i++) items.push(['Eintrag ' + i, () => {}]);
    const b = document.getElementById('a-unt-add');
    tlMenu({ stopPropagation() {}, currentTarget: b }, items); await wait(100);
    const m = document.getElementById('tl-menu'), r = m.getBoundingClientRect(), cs = getComputedStyle(m);
    out.imBild = r.top >= 0 && r.bottom <= innerHeight;
    out.scrollbar = cs.overflowY === 'auto' && m.scrollHeight > m.clientHeight && cs.overscrollBehaviorY === 'contain';
    m.scrollTop = 200; await wait(50); out.scrollt = m.scrollTop > 0;
    // Echtes Hinzufügen-Menü: Eintrag "Link senden" darf keinen Fehler auslösen (Anker des Menüs muss erhalten bleiben)
    const fehler = []; window.addEventListener('error', e => fehler.push(String(e.message)));
    document.getElementById('tl-menu').style.display = 'none'; b.click(); await wait(100);
    const eintrag = [...document.querySelectorAll('#tl-menu button')].find(x => /^Link senden/.test(x.textContent));
    out.linkEintrag = !!eintrag; if (eintrag) eintrag.click(); await wait(300);
    out.keinFehler = fehler.length === 0 && getComputedStyle(document.getElementById('tl-menu')).display === 'block' && /E-Mail/.test(document.getElementById('tl-menu').textContent);
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Menü scrollt: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Menü scrollt OK (im Bild, scrollt in sich)');
} finally {
  await browser.close();
}
