import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Patientenliste: kompakte Zeilen, durchgehender blassgrauer Strich (Farbabschnitte nur bei offenen Hinweisen), Drei-Punkte-Knopf mit Pop-up-Menü der Aktionen. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    patients.length = 0; events.length = 0; todos.length = 0;
    const mkp = (id, n, v, nn) => ({ id, nr: n, anrede: 'Frau', vorname: v, nachname: nn, dob: '01.02.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
    const ps = [mkp('a', 1, 'Rita', 'Muster'), mkp('b', 2, 'Hans', 'Probe')]; ps.forEach(x => patients.push(x));
    todos.push({ id: 't1', text: 'Erfundenes To-Do', prio: 'hoch', done: false, pid: 'a' });
    const d = new Date(); d.setDate(d.getDate() + 3); events.push({ id: 1, patientId: 'a', patient: nameKey(ps[0]), date: iso(d), time: '10:00', dur: 30, behandlung: 'Probe' });
    FLC = null; switchTab('patienten'); renderPatients(); await wait(400);
    const rows = [...document.querySelectorAll('#tab-patienten tbody tr')];
    const strich = tr => { const dts = tr.querySelector('.pt-dots'), c = tr.cells[1].getBoundingClientRect(), b = dts.getBoundingClientRect(); return { n: dts.children.length, voll: Math.abs(b.height - c.height) < 1.5, farben: [...dts.children].map(x => getComputedStyle(x).backgroundColor) }; };
    const sa = strich(rows.find(t => /MUSTER/i.test(t.textContent))), sb = strich(rows.find(t => /PROBE/i.test(t.textContent)));
    out.keinHinweis = sb.n === 1 && sb.voll && sb.farben[0] === 'rgb(203, 213, 225)';
    out.mehrfarbig = sa.n >= 2 && sa.voll && new Set(sa.farben).size === sa.n && !sa.farben.includes('rgb(203, 213, 225)');
    out.zeileKompakt = rows.every(tr => tr.getBoundingClientRect().height <= 64);
    out.nurDreiPunkte = rows.every(tr => tr.querySelectorAll('.pt-acts > .pt-ib').length === 1 && getComputedStyle(tr.querySelector('.pt-quick')).display === 'none' && getComputedStyle(tr.querySelector('.pt-acts')).opacity === '1');
    const mc = getComputedStyle(rows[0].querySelector('.pt-ib.ib-more')); out.punkteOhneKnopf = mc.boxShadow === 'none' && mc.backgroundColor === 'rgba(0, 0, 0, 0)' && mc.borderTopWidth === '0px';
    const btn = rows[0].querySelector('.pt-ib.ib-more'); btn.click(); await wait(200);
    const pop = document.getElementById('pt-pop'), items = [...pop.querySelectorAll('.pt-pop-i')];
    out.popOffen = getComputedStyle(pop).display !== 'none' && items.map(x => x.textContent.trim()).join('|') === 'Termin|Dokumentation|Senden|Rechnung|Rezept|Alle Aktionen';
    const pr = pop.getBoundingClientRect(); out.popImBild = pr.left >= 0 && pr.right <= innerWidth && pr.top >= 0 && pr.bottom <= innerHeight;
    btn.click(); await wait(100); out.popZu = getComputedStyle(pop).display === 'none';
    btn.click(); await wait(100); document.body.click(); await wait(100); out.popAussen = getComputedStyle(pop).display === 'none';
    // Aktion aus dem Menü: Dokumentation öffnet die Akte
    btn.click(); await wait(100); pop.querySelectorAll('.pt-pop-i')[1].click(); await wait(400);
    out.aktion = document.getElementById('modal-akte').classList.contains('active');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Patientenliste: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Patientenliste OK (' + Object.keys(r).length + ' Prüfungen)');
  // Mit der Maus (Desktop): Beim Überfahren der Zeile erscheinen die Aktionen als Knopfreihe, ohne Klick
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 700 } });
  await dctx.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const dp = await dctx.newPage(); dp.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
  await dp.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await dp.fill('#al-pw', 'CiAppPasswort-123!'); await dp.fill('#al-pw2', 'CiAppPasswort-123!'); await dp.click('#al-submit');
  await dp.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await dp.evaluate(async () => {
    patients.length = 0; const mkp = (id, n, v, nn) => ({ id, nr: n, anrede: 'Frau', vorname: v, nachname: nn, dob: '01.02.1990', phone: '030 1234567', email: v.toLowerCase() + '@example.invalid', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
    patients.push(mkp('a', 1, 'Rita', 'Muster'), mkp('b', 2, 'Hans', 'Probe')); FLC = null; switchTab('patienten'); renderPatients(); await new Promise(r => setTimeout(r, 400));
  });
  const q0 = await dp.evaluate(() => getComputedStyle(document.querySelector('#tab-patienten tbody tr:nth-child(1) .pt-quick')).display);
  await dp.hover('#tab-patienten tbody tr:nth-child(1)'); await dp.waitForTimeout(250);
  const q1 = await dp.evaluate(() => { const q = document.querySelector('#tab-patienten tbody tr:nth-child(1) .pt-quick'), b = [...q.querySelectorAll('.pt-ib')]; return { disp: getComputedStyle(q).display, n: b.length, horizontal: b.every((x, i) => i === 0 || Math.abs(x.getBoundingClientRect().top - b[0].getBoundingClientRect().top) < 2), info: getComputedStyle(document.querySelector('#tab-patienten tbody tr:nth-child(1) .pt-info')).opacity }; });
  assert.equal(q0, 'none', 'Schnellknöpfe ohne Hover sichtbar');
  assert.ok(q1.disp === 'flex' && q1.n === 6 && q1.horizontal && q1.info === '0', 'Schnellknöpfe beim Überfahren: ' + JSON.stringify(q1));
  await dp.mouse.move(5, 5); await dp.waitForTimeout(250);
  assert.equal(await dp.evaluate(() => getComputedStyle(document.querySelector('#tab-patienten tbody tr:nth-child(1) .pt-quick')).display), 'none', 'Schnellknöpfe bleiben nach dem Verlassen der Zeile');
  await dctx.close();
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser (Desktop)');
  console.log('Patientenliste Hover OK');
} finally {
  await browser.close();
}
