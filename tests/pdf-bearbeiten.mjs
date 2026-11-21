import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// PDF bearbeiten und Vorlagenfelder: Felder werden beim Hinzufügen eingetragen (frei bleibt leer), im Editor Stift und Text,
// Speichern schreibt ins PDF, vorige Fassung bleibt ausgeblendet erhalten, Protokoll, Wiederöffnen mit bearbeitbaren Einträgen. Erfundene Daten.
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
    const L = await loadPdfLib(); const doc = await L.PDFDocument.create(); doc.addPage([595, 842]); doc.addPage([595, 842]);
    const src = new Blob([await doc.save()], { type: 'application/pdf' }), tid = newId(); await fPut(tid, 'Arbeitsbogen.pdf', src);
    const t = { id: tid, name: 'Arbeitsbogen', kat: 'Aufklärung', neu: true };
    templates.push(t);
    // Felder einrichten über die Oberfläche: Art wählen, + Feld, auf die Seite tippen
    let antworten = []; window.kaPrompt = async () => antworten.shift();
    await tplFields(t); await wait(600);
    const S = tplFieldsState(), ov0 = S.pages[0].ov, rc = ov0.getBoundingClientRect();
    const tippen = async (ov, fx, fy) => { const r = ov.getBoundingClientRect(); ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r.left + r.width * fx, clientY: r.top + r.height * fy, pointerId: 1, bubbles: true, pointerType: 'mouse' })); await wait(50); ov.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true })); await wait(50); };
    const feld = async (k, fx, fy, txt) => { const sel = document.querySelector('.pe-tools select'); sel.value = k; sel.dispatchEvent(new Event('change')); [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === '+ Feld').click(); if (txt != null) antworten.push(txt); await tippen(ov0, fx, fy); };
    await feld('name', 0.1, 0.1); await feld('dob', 0.1, 0.15); await feld('fest', 0.1, 0.2, 'Behandelnder Arzt: Dr. Probe'); await feld('frei', 0.1, 0.3, 'Präparat');
    out.vierFelder = S.fields.length === 4 && S.fields.every(f => f.p === 0);
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern').click(); await wait(200);
    out.gespeichert = (t.fields || []).length === 4 && t.fill === 1 && !document.querySelector('.pe-ov');
    // zur Akte hinzufügen: vorbelegte und feste Felder stehen im PDF, das freie nicht
    const p = { id: 'pb1', nr: 1, anrede: 'Frau', vorname: 'Erika', nachname: 'Probefrau', dob: '03.04.1985', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    await addTplTo(p, t, null, 0); const d = p.dokumente[0];
    const t1 = await texte(await fileBlob(d));
    out.eingetragen = /Erika Probefrau/.test(t1) && /03\.04\.1985/.test(t1) && /Dr\. Probe/.test(t1) && !/Präparat/.test(t1);
    // Editor: Stift-Strich, Text in das freie Feld, Speichern
    await pdfEdit(p, d); await wait(800);
    const E = pdfEditState(), ov = E.pages[0].ov, r0 = ov.getBoundingClientRect();
    out.platzhalter = E.free.length === 1;
    const zug = (pts) => { ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r0.left + r0.width * pts[0][0], clientY: r0.top + r0.height * pts[0][1], pointerId: 2, bubbles: true, pointerType: 'pen' })); pts.slice(1).forEach(q => ov.dispatchEvent(new PointerEvent('pointermove', { clientX: r0.left + r0.width * q[0], clientY: r0.top + r0.height * q[1], pointerId: 2, bubbles: true, pointerType: 'pen' }))); ov.dispatchEvent(new PointerEvent('pointerup', { pointerId: 2, bubbles: true })); };
    zug([[0.5, 0.5], [0.6, 0.55], [0.7, 0.5]]);
    out.strich = E.items.length === 1 && E.items[0].t === 'ink' && E.items[0].pts.length === 3;
    [...document.querySelectorAll('.pe-tools [data-tool]')].find(b => b.dataset.tool === 'text').click();
    antworten = ['Botulinumtoxin 20 E']; const f0 = t.fields.find(f => f.k === 'frei');
    ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r0.left + r0.width * (f0.x + 0.02), clientY: r0.top + r0.height * (f0.y + 0.005), pointerId: 3, bubbles: true, pointerType: 'mouse' })); await wait(150);
    out.freiesFeld = E.items.length === 2 && E.items[1].fid === f0.id && E.items[1].txt === 'Botulinumtoxin 20 E';
    // Rückgängig und wieder
    [...document.querySelectorAll('.pe-tools button')].find(b => b.title === 'Rückgängig').click(); out.rueckgaengig = E.items.length === 1;
    antworten = ['Botulinumtoxin 20 E'];
    ov.dispatchEvent(new PointerEvent('pointerdown', { clientX: r0.left + r0.width * (f0.x + 0.02), clientY: r0.top + r0.height * (f0.y + 0.005), pointerId: 4, bubbles: true, pointerType: 'mouse' })); await wait(150);
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Speichern').click(); await wait(1500);
    const t2 = await texte(await fileBlob(d));
    out.imPdf = /Botulinumtoxin 20 E/.test(t2) && /Erika Probefrau/.test(t2);
    const ver = p.dokumente.find(x => x.vonDok === d.id);
    out.vorigeFassung = !!ver && ver.hiddenFromView === true && d.annoBase === ver.id && !/Botulinumtoxin/.test(await texte(await fileBlob(ver)));
    out.protokoll = JSON.stringify(p.audit || []).includes('Bearbeitet: Arbeitsbogen') && JSON.stringify(p.audit || []).includes('Botulinumtoxin 20 E');
    // wieder öffnen: Einträge bearbeitbar, Basis ist die Fassung ohne Einträge
    await pdfEdit(p, d); await wait(800);
    const E2 = pdfEditState();
    out.wiederBearbeitbar = E2.items.length === 2 && E2.hadBase === true;
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Abbrechen').click(); await wait(100);
    // nach einer Unterschrift beginnt eine neue Runde auf der unterschriebenen Fassung
    d.sig = { ts: Date.now(), name: 'Probefrau, Erika' };
    await pdfEdit(p, d); await wait(800);
    const E3 = pdfEditState(); out.nachUnterschriftNeu = E3.items.length === 0 && E3.hadBase === false;
    [...document.querySelectorAll('.pe-tools button')].find(b => b.textContent === 'Abbrechen').click();
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'PDF bearbeiten: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('PDF bearbeiten OK (Vorlagenfelder, Stift, freies Feld, Rückgängig, Speichern, vorige Fassung, Protokoll, Wiederöffnen)');
} finally {
  await browser.close();
}
