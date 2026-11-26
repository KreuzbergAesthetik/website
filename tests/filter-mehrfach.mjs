import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Filter in der Patientenakte mit Mehrfachauswahl: Zeitleiste (Eintragsarten) und Anlagen (Kategorien). Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 915, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const L = await loadPdfLib(), mk = async (t) => { const d = await L.PDFDocument.create(); d.addPage([300, 400]).drawText(t, { x: 30, y: 350, size: 16 }); return new Blob([await d.save()], { type: 'application/pdf' }); };
    await fPut('f1', 'Rezept_A.pdf', await mk('A')); await fPut('f2', 'Befund_B.pdf', await mk('B')); await fPut('f3', 'Sonstiges_C.pdf', await mk('C'));
    const t = Date.now(), D = 864e5;
    const p = { id: 'fm1', nr: 1, vorname: 'Fina', nachname: 'Filter', dob: '02.03.1985', erstellt: t, medikation: [], bilder: [], doku: [{ ts: t - D * 4, text: 'Doku' }],
      dokumente: [{ id: 'f1', ts: t - D, name: 'Rezept_A.pdf', kat: 'Rezept' }, { id: 'f2', ts: t - D * 2, name: 'Befund_B.pdf', kat: 'Befund' }, { id: 'f3', ts: t - D * 3, name: 'Sonstiges_C.pdf', kat: 'Sonstiges' }],
      log: [{ ts: t - D * 5, type: 'notiz', text: 'Notiz' }, { ts: t - D * 6, type: 'mail', text: 'E-Mail gesendet an a@example.org\nBetreff: Test' }] };
    patients.length = 0; patients.push(p); events.length = 0; FLC = null; persist(); viewAkte(p); await wait(1200);
    const arten = () => new Set([...document.querySelectorAll('#a-verlauf .tl-item')].map(x => [...x.classList].find(c => /^tl-(notiz|mail|doku|dokument|rezept|termin)$/.test(c)))).size;
    const alle = document.querySelectorAll('#a-verlauf .tl-item').length;
    const btn = l => document.querySelector('#a-audit-filter .tl-fbtn[aria-label="' + l + '"]');
    btn('Nur Notizen').click(); await wait(200);
    const nurNotiz = document.querySelectorAll('#a-verlauf .tl-item').length;
    const mailBtn = [...document.querySelectorAll('#a-audit-filter .tl-fbtn')].find(b => /E-Mail/i.test(b.getAttribute('aria-label')));
    mailBtn.click(); await wait(200);
    const zwei = document.querySelectorAll('#a-verlauf .tl-item').length, an = [...document.querySelectorAll('#a-audit-filter .tl-fbtn.on')].length;
    out.zeitleisteMehrere = nurNotiz === 1 && zwei === 2 && an === 2 && alle > 2;
    document.querySelector('#a-audit-filter .tl-fbtn.on').click(); await wait(200);
    out.zeitleisteEinesAb = document.querySelectorAll('#a-verlauf .tl-item').length === 1;
    // Anlagen-Kategorien
    setAkTab('anl'); setMedFilter('dok', ''); await wait(1200);
    const chip = n => [...document.querySelectorAll('#md-chips .md-chip')].find(c => c.textContent === n);
    const zeilen = () => document.querySelectorAll('#md-list .md-tr').length;
    out.dreiDateien = zeilen() === 3;
    chip('Rezept').click(); await wait(300); const eins = zeilen();
    chip('Befund').click(); await wait(300); const zweiK = zeilen(), onK = document.querySelectorAll('#md-chips .md-chip.on').length;
    out.anlagenMehrere = eins === 1 && zweiK === 2 && onK === 2;
    chip('Alle').click(); await wait(300); out.alleLoest = zeilen() === 3 && document.querySelectorAll('#md-chips .md-chip.on').length === 1;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Filter Mehrfach: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Filter Mehrfachauswahl OK (Zeitleiste und Anlagen, einzeln abwählen, Alle)');
} finally {
  await browser.close();
}
