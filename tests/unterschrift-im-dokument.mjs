import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Unterschrift im Dokument: Fenster zum Unterschreiben, danach ins Dokument tippen; Nachweis (Prüfsumme, Dauer), Status, Prüfen;
// automatisch erstelltes Logbuch (PDF) zu jedem Dokument. Erfundene Daten.
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
    const src = new Blob([await doc.save()], { type: 'application/pdf' }), tid = newId(); await fPut(tid, 'Frei-Bogen.pdf', src);
    const t = { id: tid, name: 'Frei-Bogen', kat: 'Aufklärung', neu: true, sig: { on: true, free: true, page: 0, x: 0.5, y: 0.5, w: 0.3 }, sig2: { on: true, free: true } }; templates.push(t);
    const p = { id: 'ud1', nr: 1, anrede: 'Frau', vorname: 'Uta', nachname: 'Unterschrift', dob: '02.02.1990', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    await addTplTo(p, t, null, 0); const d = p.dokumente[0];
    out.start = tplState(p, t).s === 'offen' && !sigFixed(d, false) && !sigFixed(d, true);
    await wait(1800);
    out.logbuchAuto = !!d.logId;
    const lb0 = await texte(await fileBlob({ id: d.logId }));
    out.logbuchInhalt = /Logbuch zum Dokument/.test(lb0) && /Frei-Bogen/.test(lb0) && /Unterschrift/.test(lb0) && /Keine Unterschrift vorhanden/.test(lb0) && /Uta Unterschrift/.test(lb0);
    // Unterschreiben (Patient): Editor öffnet, Fenster, ins Dokument tippen
    openSign(p, d, false); await wait(1500);
    out.editorOffen = !!document.querySelector('.pe-ov') && document.getElementById('modal-sign').classList.contains('active');
    const cv = document.getElementById('sg-cv'), g = cv.getContext('2d'); g.strokeStyle = '#111'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 250); g.bezierCurveTo(300, 40, 500, 40, 700, 220); g.stroke();
    sgInk = true; sgBox = { x0: 80, y0: 40, x1: 700, y1: 250 }; sgMeta = { n: 40, t0: 1000, t1: 3200 };
    applySign(); await wait(500);
    const E = pdfEditState(); out.hinweis = E.tool === 'sigplace' && E.ui.hint.style.display === 'block';
    const ov = E.pages[0].ov, r0 = ov.getBoundingClientRect();
    ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r0.left + r0.width * 0.3, clientY: r0.top + r0.height * 0.7, pointerId: 1, bubbles: true, pointerType: 'mouse' })); await wait(300);
    out.platziert = E.items.length === 1 && E.items[0].t === 'sig' && Math.abs(E.items[0].x - 0.3) < 0.02 && Math.abs(E.items[0].y - 0.7) < 0.02;
    const gr0 = (await fileBlob(d)).size;
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern').click(); await wait(2500);
    out.patientDrin = !!d.sig && d.sig.name === 'Uta Unterschrift' && /^[0-9a-f]{64}$/.test(d.sig.hash) && /^[0-9a-f]{64}$/.test(d.sig.hashVor) && d.sig.hash !== d.sig.hashVor && d.sig.dauer === 2200 && d.sig.punkte === 40;
    out.groesser = (await fileBlob(d)).size > gr0 && /Unterschrieben am/.test(await texte(await fileBlob(d)));
    out.status = tplState(p, t).s === 'offen2';
    out.hashPasst = (await sha256Hex(await fileBlob(d))) === d.sig.hash;
    // Arzt
    openSign(p, d, true); await wait(1500);
    const cv2 = document.getElementById('sg-cv'), g2 = cv2.getContext('2d'); g2.strokeStyle = '#111'; g2.lineWidth = 6; g2.beginPath(); g2.moveTo(80, 220); g2.lineTo(700, 120); g2.stroke();
    sgInk = true; sgBox = { x0: 80, y0: 100, x1: 700, y1: 240 }; sgMeta = { n: 30, t0: 0, t1: 1500 }; applySign(); await wait(500);
    const E2 = pdfEditState(), ov2 = E2.pages[0].ov, r2 = ov2.getBoundingClientRect();
    ov2.dispatchEvent(new PointerEvent('pointerdown', { clientX: r2.left + r2.width * 0.7, clientY: r2.top + r2.height * 0.7, pointerId: 2, bubbles: true, pointerType: 'mouse' })); await wait(300);
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern').click(); await wait(2500);
    out.arztDrin = !!d.sig2 && d.sig2.name === (settings.inhaber || 'Arzt') && tplState(p, t).s === 'ok' && d.sig2.hashVor === d.sig.hash;
    // Prüfen
    const c1 = await sigCheck(d); out.pruefOk = c1.st === 'ok';
    await wait(1500);
    const lb1 = await texte(await fileBlob({ id: d.logId }));
    out.logbuchAktuell = /Uta Unterschrift/.test(lb1) && new RegExp(settings.inhaber || 'Arzt').test(lb1) && /unverändert/.test(lb1) && /Prüfsumme/.test(lb1) && /Unterschrift \(Patient\)/.test(lb1) && /Unterschrift \(Arzt\)/.test(lb1) && /Fassung vor Bearbeitung/.test(lb1);
    // Veränderung wird erkannt
    await fPut(d.id, d.name, new Blob([await fileBlob(d), new Uint8Array([1])], { type: 'application/pdf' }));
    const c2 = await sigCheck(d); out.geaendertErkannt = c2.st === 'geaendert';
    // Menü: Logbuch öffnet in der App (Seiten als Bild, Öffnen, Herunterladen), auch für Dokumente ohne Logbuch
    d.logId = null; logbuchOpen(curP || patients[0], d);
    for (let i = 0; i < 40 && !document.querySelector('.dp-ov canvas'); i++) await new Promise(r => setTimeout(r, 150));
    const lov = document.querySelector('.dp-ov');
    out.menue = !!lov && lov.querySelectorAll('canvas').length >= 1 && /Öffnen/.test(lov.textContent) && /Herunterladen/.test(lov.textContent) && !!lov.querySelector('a[download]') && /^blob:/.test(lov.querySelector('a[download]').href);
    if (lov) lov.remove();
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Unterschrift im Dokument: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Unterschrift im Dokument OK (Fenster, platzieren, Nachweis, Prüfen, Logbuch)');
} finally {
  await browser.close();
}
