import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Kästchen in PDF-Vorlagen: in der Vorlage setzen (mit und ohne gedruckten Rahmen), in der Akte antippen = Haken, nochmal = weg,
// wird gespeichert, protokolliert und beim Wiederöffnen angezeigt. Erfundene Daten.
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
    const L = await loadPdfLib(); const doc = await L.PDFDocument.create(); doc.addPage([595, 842]);
    const src = new Blob([await doc.save()], { type: 'application/pdf' }), tid = newId(); await fPut(tid, 'Kasten-Bogen.pdf', src);
    const t = { id: tid, name: 'Kasten-Bogen', kat: 'Aufklärung', neu: true }; templates.push(t);
    await tplFields(t); await wait(600);
    const S = tplFieldsState(), ov0 = S.pages[0].ov;
    const tippen = async (ov, fx, fy) => { const r = ov.getBoundingClientRect(); ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width * fx, clientY: r.top + r.height * fy, pointerId: 1, bubbles: true, pointerType: 'mouse' })); await wait(50); ov.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true })); await wait(50); };
    const sel = document.querySelector('.pe-tools select'); sel.value = 'kasten'; sel.dispatchEvent(new Event('change'));
    for (const [x, y] of [[0.2, 0.2], [0.2, 0.3]]) { [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === '+ Feld').click(); await tippen(ov0, x, y); }
    out.zwei = S.fields.length === 2 && S.fields.every(f => f.k === 'kasten' && f.s === 12);
    // zweites Kästchen: Rahmen mitdrucken
    const rahmen = document.querySelector('.pe-props input[type=checkbox]'); rahmen.checked = true; rahmen.dispatchEvent(new Event('change'));
    out.rahmenGesetzt = S.fields[1].r === true;
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern').click(); await wait(200);
    out.gespeichert = t.fields.length === 2 && t.fields[1].r === 1 && !t.fields[0].r;
    const p = { id: 'kb1', nr: 1, anrede: 'Herr', vorname: 'Karl', nachname: 'Kasten', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    const leer = (await (async () => { const d0 = await L.PDFDocument.load(await (await fileBlob(t)).arrayBuffer()); return (await d0.save()).length; })());
    await addTplTo(p, t, null, 0); const d = p.dokumente[0];
    const gross = (await fileBlob(d)).size;
    out.rahmenGedruckt = gross > leer;
    await pdfEdit(p, d); await wait(800);
    const E = pdfEditState(), ov = E.pages[0].ov;
    out.zweiKaesten = E.boxes.length === 2;
    const antippen = async (b, tool) => { document.querySelector('.pe-tools [data-tool="' + tool + '"]').click(); const r = ov.getBoundingClientRect(); ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width * (b.x + 6 / 595), clientY: r.top + r.height * (b.y + 6 / 842), pointerId: 5, bubbles: true, pointerType: 'mouse' })); await wait(80); };
    await antippen(E.boxes[0], 'text'); // Text-Werkzeug: Tippen setzt Haken (kein Textdialog)
    out.haken = E.items.length === 1 && E.items[0].t === 'mark' && E.items[0].fid === E.boxes[0].id;
    await antippen(E.boxes[0], 'check'); out.weg = E.items.length === 0;
    await antippen(E.boxes[0], 'check'); await antippen(E.boxes[1], 'erase');
    out.beide = E.items.length === 2;
    // Stift daneben zeichnet statt zu setzen
    document.querySelector('.pe-tools [data-tool="pen"]').click(); const rr = ov.getBoundingClientRect();
    ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: rr.left + rr.width * (E.boxes[0].x + 6 / 595), clientY: rr.top + rr.height * (E.boxes[0].y + 6 / 842), pointerId: 6, bubbles: true, pointerType: 'pen' })); ov.dispatchEvent(new PointerEvent('pointerup', { pointerId: 6, bubbles: true }));
    out.stiftZeichnet = E.items.length === 3 && E.items[2].t === 'ink';
    E.items.pop();
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern').click(); await wait(1500);
    out.protokoll = JSON.stringify(p.audit || []).includes('Bearbeitet: Kasten-Bogen') && d.anno.length === 2;
    await pdfEdit(p, d); await wait(800);
    out.wieder = pdfEditState().items.length === 2 && pdfEditState().items.every(it => it.fid);
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Abbrechen').click();
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Kästchen: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Kästchen OK (Vorlage, Rahmen, antippen, Haken weg, speichern, Protokoll, Wiederöffnen)');
} finally {
  await browser.close();
}
