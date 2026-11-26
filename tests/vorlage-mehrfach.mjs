import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Vorlagen lassen sich mehrfach in dieselbe Akte legen (auch wenn schon vorhanden); weitere Kopien werden durchnummeriert. Erfundene Daten.
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
    const L = await loadPdfLib(), blob = async (t) => { const d = await L.PDFDocument.create(); d.addPage([300, 400]).drawText(t, { x: 30, y: 350, size: 16 }); return new Blob([await d.save()], { type: 'application/pdf' }); };
    const t = { id: 'tpl-test-1', name: 'Aufklärung Testvorlage', kat: 'Aufklärung' };
    await fPut(t.id, t.name, await blob('Vorlage')); templates.push(t);
    const p = { id: 'vm1', nr: 1, vorname: 'Vera', nachname: 'Vorlage', dob: '02.03.1985', erstellt: Date.now(), medikation: [], bilder: [], doku: [], dokumente: [], log: [] };
    patients.length = 0; patients.push(p); events.length = 0; FLC = null; persist(); viewAkte(p); await wait(600);
    await addTplTo(p, t, null, 0); await addTplTo(p, t, null, 1); await addTplTo(p, t, null, 2);
    out.dreiKopien = p.dokumente.length === 3;
    out.namen = p.dokumente.map(d => d.name).join('|') === 'Aufklärung Testvorlage|Aufklärung Testvorlage (2)|Aufklärung Testvorlage (3)';
    out.gleicheVorlage = p.dokumente.every(d => d.tid === t.id);
    setAkTab('anl'); setMedFilter('dok', ''); await wait(600);
    const ev = { stopPropagation() {}, currentTarget: document.getElementById('md-list') };
    medAddMenu(ev); await wait(100);
    const top = [...document.querySelectorAll('#tl-menu button')].find(b => /Vorlage in die Akte legen/.test(b.textContent)); out.menuPunkt = !!top;
    if (top) { top.click(); await wait(300); }
    const m = document.getElementById('tl-menu'); const eintrag = m && [...m.querySelectorAll('button')].find(b => b.textContent.indexOf('Aufklärung Testvorlage') === 0);
    out.vorhandeneWaehlbar = !!eintrag && /noch einmal/.test(eintrag.textContent);
    if (eintrag) { eintrag.click(); await wait(800); }
    out.vierteKopie = p.dokumente.length === 4 && p.dokumente[3].name === 'Aufklärung Testvorlage (4)';
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Vorlage mehrfach: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Vorlage mehrfach OK (3 Kopien nummeriert, Menü bietet vorhandene Vorlage erneut an, vierte Kopie)');
} finally {
  await browser.close();
}
