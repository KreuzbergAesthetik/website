import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Vorlage mit zweiter Unterschrift (Arzt): erst Patient, dann Arzt, beide landen im PDF, Status und Knöpfe stimmen. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 900 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const L = await loadPdfLib(); const doc = await L.PDFDocument.create(); for (let i = 0; i < 4; i++) doc.addPage([595, 842]);
    const src = new Blob([await doc.save()], { type: 'application/pdf' }), tid = newId(); await fPut(tid, 'Probe-Aufklaerung.pdf', src);
    const t = { id: tid, name: 'Probe-Aufklaerung', kat: 'Aufklärung', neu: true, sig: { on: true, page: 4, x: 0.06, y: 0.52, w: 0.4 }, sig2: { on: true, x: 0.52, y: 0.52 } };
    templates.push(t);
    const p = { id: 'az1', nr: 1, anrede: 'Frau', vorname: 'Anna', nachname: 'Arzt', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    await addTplTo(p, t, null, 0); const d = p.dokumente[0];
    out.start = tplState(p, t).s === 'offen';
    // Vorlagen-Maske zeigt das zweite Feld
    openTpl(t.id); await wait(100);
    out.maske = document.getElementById('tp-sig2').checked && document.getElementById('tp-box2').style.display === 'block' && document.getElementById('tp-x2').value === '52';
    closeModal('modal-tpl');
    // Patient unterschreibt
    const unterschreiben = async arzt => {
      openSign(p, d, arzt); await wait(150);
      const cv = document.getElementById('sg-cv'), g = cv.getContext('2d'); g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 250); g.bezierCurveTo(300, 40, 500, 40, 700, 220); g.stroke();
      sgInk = true; sgBox = { x0: 80, y0: 40, x1: 700, y1: 250 };
      applySign(); await wait(1200);
    };
    const gr0 = (await fileBlob(d)).size;
    await unterschreiben(false);
    out.patient = !!d.sig && !d.sig2 && tplState(p, t).s === 'offen2' && (await fileBlob(d)).size > gr0;
    const gr1 = (await fileBlob(d)).size;
    // Anlagen zeigen den Arzt-Knopf
    viewAkte(p); setAkTab('anl'); await wait(400);
    out.knopf = [...document.querySelectorAll('#a-unt button')].some(b => /Als Arzt unterschreiben/.test(b.textContent)) && /Unterschrift des Arztes fehlt/.test(document.getElementById('a-unt').textContent);
    closeModal('modal-akte');
    await unterschreiben(true);
    out.arzt = !!d.sig2 && d.sig2.name === (settings.inhaber || 'Arzt') && tplState(p, t).s === 'ok' && (await fileBlob(d)).size > gr1;
    out.infoText = true;
    viewAkte(p); setAkTab('anl'); await wait(400);
    out.fertig = /Arzt/.test(document.getElementById('a-unt').textContent) && ![...document.querySelectorAll('#a-unt button')].some(b => /Als Arzt unterschreiben/.test(b.textContent));
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Arzt-Unterschrift: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Arzt-Unterschrift OK (Patient, dann Arzt, Status, Knopf, Maske)');
} finally {
  await browser.close();
}
