import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Schnellzugriffe der Akte: höchstens drei runde Knöpfe, dauerhaft sichtbar, in der App belegbar; Symbole in den Zeitleisten-Zeilen. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 800, height: 1000 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const t = iso(new Date());
    const p = { id: 'sz1', nr: 1, anrede: 'Frau', vorname: 'Sina', nachname: 'Zugriff', medikation: [], log: [{ ts: Date.now() - 3600000, type: 'notiz', text: 'Erfundene Notiz' }], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); events.length = 0; events.push({ id: 1, patientId: 'sz1', patient: 'Zugriff, Sina', date: t, time: '09:00', dur: 60, behandlung: 'Beratung' });
    FLC = null; persist(); viewAkte(p); await wait(400);
    const knoepfe = () => [...document.querySelectorAll('.a-fab .a-cats .a-cat')].filter(b => b.getBoundingClientRect().width > 0);
    out.dreiStandard = knoepfe().length === 3 && knoepfe().map(b => b.title).join('|') === 'Dokumentation|Termin|Rechnung';
    const cs = getComputedStyle(knoepfe()[0]);
    out.rundDurchsichtig = cs.borderRadius === '50%' || parseFloat(cs.borderTopLeftRadius) >= 20; out.durchsichtig = /rgba\(255, 255, 255, 0\.5/.test(cs.backgroundColor);
    out.keinKlappen = getComputedStyle(document.querySelector('.a-fab-tog')).display === 'none' && knoepfe().every(b => getComputedStyle(b).transform === 'none');
    // belegen: bis zu drei, mehr geht nicht
    aDockEdit(); await wait(200);
    const boxes = [...document.querySelectorAll('#dk-list input')];
    boxes.forEach(c => { c.checked = false; }); boxes.slice(0, 3).forEach(c => { c.checked = true; }); boxes[0].dispatchEvent(new Event('change'));
    out.vierteGesperrt = boxes.slice(3).every(c => c.disabled);
    const wunsch = ['bild', 'mail', 'notiz']; boxes.forEach(c => { c.checked = wunsch.includes(c.value); }); boxes[0].dispatchEvent(new Event('change'));
    aDockSave(); await wait(300);
    out.gespeichert = JSON.stringify(settings.akteDock) === JSON.stringify(AM_DOCK.map(d => d.act).filter(a => wunsch.includes(a))) && knoepfe().length === 3;
    out.alleAktionenOffen = !!document.querySelector('.a-fab .plus-btn');
    // Zeitleiste: Symbole in der Zeile
    const q = [...document.querySelectorAll('.tl-item .tl-quick')].find(x => x.querySelectorAll('.tl-qb').length >= 2);
    out.zeilenSymbole = !!q && getComputedStyle(q).opacity === '0';
    document.querySelector('.tl-item .tl-plus').click(); await wait(200);
    out.antippen = document.querySelector('.tl-plus').closest('.tl-item').classList.contains('quick-on') && getComputedStyle(q).opacity === '1';
    document.querySelector('.tl-item .tl-plus').click(); await wait(100);
    out.zu = !document.querySelector('.tl-plus').closest('.tl-item').classList.contains('quick-on');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Schnellzugriffe: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Schnellzugriffe OK (3 Knöpfe, rund, dauerhaft, belegbar, Zeitleiste)');
} finally {
  await browser.close();
}
