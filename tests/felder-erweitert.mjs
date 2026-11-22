import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Neue Vorlagenfelder (letzte Anamnese, Datum heute/nächster Termin/Honorarvereinbarung, Ort, Kontaktdaten ...), kleinere skalierbare Unterschrift,
// Speichern und senden. Erfundene Daten.
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
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {}; window.kaConfirm = async () => true;
    const texte = async blob => (await pdfPages(blob)).map(pg => pg.map(i => i.str).join(' ')).join(' | ');
    const L = await loadPdfLib(); const doc = await L.PDFDocument.create(); doc.addPage([595, 842]);
    const src = new Blob([await doc.save()], { type: 'application/pdf' }), tid = newId(); await fPut(tid, 'Feld-Bogen.pdf', src);
    const kinds = ['anamnese', 'heute', 'termin', 'honorar', 'ort', 'ortdatum', 'tel', 'email', 'allergien', 'patnr', 'behandlung', 'plzort', 'alter'];
    const t = { id: tid, name: 'Feld-Bogen', kat: 'Aufklärung', neu: true, fields: kinds.map((k, i) => ({ id: 'f' + i, k, p: 0, x: 0.08, y: 0.05 + i * 0.05, s: 10 })) }; templates.push(t);
    const jetzt = new Date(), morgen = new Date(Date.now() + 3 * 86400000), dd = d => iso(d);
    const p = { id: 'fe1', nr: 12, anrede: 'Frau', vorname: 'Fine', nachname: 'Felder', dob: '03.04.1985', phone: '030 1234567', email: 'fine@example.invalid', allergien: 'Latex\nNickel', adresse: 'Teststraße 1\n10999 Berlin', honorarVom: '2026-10-05', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    p.best = [{ k: 'anamnese', art: 'got', ts: new Date(2026, 8, 17, 10, 0).getTime() }];
    patients.length = 0; patients.push(p); events.length = 0; events.push({ id: 7, patientId: 'fe1', patient: 'Felder, Fine', date: dd(morgen), time: '10:00', dur: 30, behandlung: 'Faltenbehandlung' });
    FLC = null; persist();
    await addTplTo(p, t, null, 0); const d = p.dokumente[0], tx = await texte(await fileBlob(d));
    const heute = jetzt.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }), nxt = morgen.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    out.anamnese = /17\.09\.2026/.test(tx); out.honorar = /05\.10\.2026/.test(tx); out.heute = tx.includes(heute); out.termin = tx.includes(nxt);
    out.ort = /Berlin, /.test(tx) && tx.includes('Berlin, ' + heute); out.kontakt = /030 1234567/.test(tx) && /fine@example\.invalid/.test(tx);
    out.allergien = /Latex, Nickel/.test(tx); out.nr = /\b12\b/.test(tx); out.behandlung = /Faltenbehandlung/.test(tx); out.plzort = /10999 Berlin/.test(tx); out.alter = /\b4[01]\b/.test(tx);
    out.listeImEditor = TF_KINDS.length >= 25 && ['anamnese', 'termin', 'honorar', 'ortdatum'].every(k => TF_KINDS.some(x => x[0] === k));
    // Unterschrift: kleiner und skalierbar
    openSign(p, d, false); await wait(1500);
    const cv = document.getElementById('sg-cv'), g = cv.getContext('2d'); g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 250); g.bezierCurveTo(300, 40, 500, 40, 700, 220); g.stroke();
    sgInk = true; sgBox = { x0: 80, y0: 40, x1: 700, y1: 250 }; applySign(); await wait(500);
    const E = pdfEditState(), ov = E.pages[0].ov, r0 = ov.getBoundingClientRect();
    ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r0.left + r0.width * 0.5, clientY: r0.top + r0.height * 0.8, pointerId: 1, bubbles: true, pointerType: 'mouse' })); await wait(300);
    out.klein = E.items.length === 1 && E.items[0].w <= 0.17;
    const rg = E.ui.hint.querySelector('input[type=range]'); out.regler = !!rg && E.ui.hint.style.display !== 'none';
    rg.value = 10; rg.dispatchEvent(new Event('input')); out.skaliert = Math.abs(E.items[0].w - 0.10) < 0.005;
    // Speichern und senden (Teilen-Menü nachgebaut)
    let geteilt = null; Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true }); Object.defineProperty(navigator, 'share', { value: async o => { geteilt = o; }, configurable: true });
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern und senden').click(); await wait(3000);
    out.gesendet = !!geteilt && geteilt.files.length === 1 && /Feld-Bogen/.test(geteilt.files[0].name) && geteilt.files[0].type === 'application/pdf';
    out.vermerk = (p.log || []).some(x => /Feld-Bogen gesendet \(Teilen-Menü\)/.test(x.text)) && JSON.stringify(p.audit || []).includes('Gesendet: Feld-Bogen');
    out.nachSpeichern = !!d.sig && !document.querySelector('.pe-ov');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Felder erweitert: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Felder erweitert OK (neue Feldarten, kleine skalierbare Unterschrift, Speichern und senden)');
} finally {
  await browser.close();
}
