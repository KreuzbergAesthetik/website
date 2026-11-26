import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Zeitleiste: Symbole je Eintrag, Dokumente mit Vorschaublatt (Rezept öffnet das vorhandene Dokument), Name im Kopfkasten mittig, Patientenliste ohne Überfahren-Menü, Update-Hinweis lesbar. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 915, height: 412 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const L = await loadPdfLib(), mk = async (t) => { const d = await L.PDFDocument.create(); d.addPage([300, 400]).drawText(t, { x: 30, y: 350, size: 16 }); return new Blob([await d.save()], { type: 'application/pdf' }); };
    await fPut('rx1', 'Rezept_Test.pdf', await mk('Rezept')); await fPut('dk1', 'Honorar.pdf', await mk('Honorar'));
    const t = Date.now(), D = 86400000;
    const p = { id: 'zd1', nr: 1, vorname: 'Dora', nachname: 'Dokument', dob: '02.03.1985', erstellt: t, medikation: [], bilder: [], doku: [{ ts: t - D * 5, text: 'Beratung' }],
      dokumente: [{ id: 'rx1', ts: t - D * 3, name: 'Rezept_Test.pdf', kat: 'Rezept' }, { id: 'dk1', ts: t - D, name: 'Honorar.pdf', kat: 'Honorar' }],
      log: [{ ts: t - D * 3, type: 'rezept', text: 'Rezept erstellt: Test', docId: 'rx1' }, { ts: t - D * 2, type: 'notiz', text: 'Notiz' }, { ts: t - D * 2.5, type: 'mail', text: 'E-Mail gesendet an a@example.org\nBetreff: Test' }] };
    patients.length = 0; patients.push(p); events.length = 0; FLC = null; persist(); viewAkte(p); await wait(1200);
    const icon = c => !!document.querySelector('#a-verlauf .tl-item.' + c + ' .tl-date svg.tl-ico');
    out.symbole = ['tl-notiz', 'tl-mail', 'tl-rezept', 'tl-doku'].every(icon);
    out.dokumentEintrag = !!document.querySelector('#a-verlauf .tl-item .tl-docp') && document.querySelectorAll('#a-verlauf .tl-docp').length === 2;   // Honorar + Rezept
    let rxEditor = 0; const oldRx = window.openRx; window.openRx = function () { rxEditor++; return oldRx.apply(this, arguments); };
    document.querySelector('#a-verlauf .tl-item.tl-rezept .tl-docp').click(); await wait(300);
    out.vorschauOffen = !!document.querySelector('.dp-ov') && rxEditor === 0; document.querySelector('.dp-ov') && document.querySelector('.dp-ov').remove();
    // Bearbeiten-Knopf an der Dokumentkarte öffnet den PDF-Editor direkt
    let ed = null; const oldEd = window.pdfEdit; window.pdfEdit = (pp, rec) => { ed = rec && rec.id; }; const eb = document.querySelector('#a-verlauf .md-doc .md-edit, #a-verlauf .tl-item .md-edit') || (renderMedien(), document.querySelector('.md-doc .md-edit, .md-tr .md-edit'));
    out.bearbeitenKnopf = !!eb; if (eb) { eb.click(); } out.bearbeitenOeffnet = ed === 'dk1' || ed === 'rx1' || ed !== null; window.pdfEdit = oldEd;
    const t0 = document.querySelector('.a-top .a-title'), nm = t0.querySelector('.a-nm'), a = t0.getBoundingClientRect(), n = nm.getBoundingClientRect();
    out.nameMittig = Math.abs((n.top + n.height / 2) - (a.top + a.height / 2)) < 3;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Zeitleiste Dokumente: ' + k + ' ' + JSON.stringify(r));
  // Patientenliste: Überfahren blendet keine Schnellaktionen ein
  await page.evaluate(() => { switchTab('patienten'); }); await page.waitForTimeout(400);
  const row = page.locator('#tab-patienten .pt-rz').first();
  if (await row.count()) { await row.hover(); await page.waitForTimeout(300); assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('#tab-patienten .pt-rz .pt-quick')).opacity), '0', 'Patientenliste zeigt beim Überfahren Symbole'); }
  // Update-Hinweis: Später-Knopf hell auf dunklem Grund
  const kontrast = await page.evaluate(() => { const bar = document.getElementById('upd-bar'); bar.style.display = 'block'; const b = bar.querySelector('.btn-cancel'), cs = getComputedStyle(b); return cs.color; });
  assert.equal(kontrast, 'rgb(255, 255, 255)', 'Später-Knopf nicht hell: ' + kontrast);
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Zeitleiste Dokumente OK (Symbole, Vorschaublatt, Rezept öffnet vorhandenes Dokument, Name mittig, Patientenliste, Update-Hinweis)');
} finally {
  await browser.close();
}
