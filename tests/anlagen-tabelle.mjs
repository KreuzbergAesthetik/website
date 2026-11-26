import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Anlagen/Dateien als Tabelle: Datum links, farbiger Strich (orange = Unterschrift fehlt, grün = unterschrieben, grau = neutral), Name mit Aktionen, Vorschau rechts, Menü beim Antippen. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 915, height: 700 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const L = await loadPdfLib(), mk = async (t) => { const d = await L.PDFDocument.create(); d.addPage([300, 400]).drawText(t, { x: 30, y: 350, size: 16 }); return new Blob([await d.save()], { type: 'application/pdf' }); };
    await fPut('a1', 'Aufklärung_Test.pdf', await mk('Aufklaerung')); await fPut('a2', 'Rezept_Test.pdf', await mk('Rezept')); await fPut('a3', 'Befund_Test.pdf', await mk('Befund'));
    const t = Date.now(), D = 86400000;
    const p = { id: 'at1', nr: 1, vorname: 'Anna', nachname: 'Anlage', dob: '02.03.1985', erstellt: t, medikation: [], bilder: [], doku: [], log: [],
      dokumente: [{ id: 'a1', ts: t - D, name: 'Aufklärung_Test.pdf', kat: 'Aufklärung' }, { id: 'a2', ts: t - D * 2, name: 'Rezept_Test.pdf', kat: 'Rezept', sig: { ts: t - D * 2 } }, { id: 'a3', ts: t - D * 3, name: 'Befund_Test.pdf', kat: 'Befund' }] };
    patients.length = 0; patients.push(p); events.length = 0; FLC = null; persist(); viewAkte(p); await wait(800);
    setAkTab('anl'); setMedFilter('dok', ''); await wait(1500);
    const rows = [...document.querySelectorAll('#md-list .md-tr')];
    out.dreiZeilen = rows.length === 3;
    out.farben = rows[0].classList.contains('md-wait') && rows[1].classList.contains('md-ok') && !rows[2].classList.contains('md-wait') && !rows[2].classList.contains('md-ok');
    const col = i => getComputedStyle(rows[i].querySelector('.md-tr-m')).borderLeftColor;
    out.strichfarben = col(0) === 'rgb(245, 158, 11)' && col(1) === 'rgb(34, 197, 94)' && col(2) === 'rgb(148, 163, 184)';
    out.datumLinks = rows.every(x => /\d\d\.\d\d\.\d\d/.test(x.querySelector('.md-tr-d').textContent));
    out.vorschauRechts = rows.every(x => x.lastElementChild.classList.contains('md-tr-th'));
    out.keinStatusText = rows.every(x => getComputedStyle(x.querySelector('.md-nm')).display !== 'none') && rows.every(x => { const s = x.querySelector('.md-stx'); return !s || getComputedStyle(s).display === 'none'; });
    out.aktionen = rows[0].querySelectorAll('.md-l2 button').length >= 3;
    rows[2].querySelector('.md-tr-m').click(); await wait(200);
    const m = document.getElementById('tl-menu'); out.menueAuf = !!m && m.style.display === 'block' && /Umbenennen/.test(m.textContent) && /Zuordnen/.test(m.textContent) && /Logbuch/.test(m.textContent);
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Anlagen-Tabelle: ' + k + ' ' + JSON.stringify(r));
  if (process.env.SHOT) await page.screenshot({ path: process.env.SHOT });
  if (process.env.SHOT2) { await page.evaluate(() => { document.getElementById('tl-menu').style.display = 'none'; document.querySelector('#md-list .md-tr').scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); await page.waitForTimeout(300); await page.screenshot({ path: process.env.SHOT2 }); }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Anlagen-Tabelle OK (Datum, Strichfarben, Aktionen, Vorschau rechts, Menü)');
} finally {
  await browser.close();
}
