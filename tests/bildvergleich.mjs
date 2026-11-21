import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Bildvergleich in der Akte (Reiter Anlagen, Bilder): Bereich oben, Plätze per Ziehen und Symbol am Bild, bis zu drei Bilder,
// übereinander (Teilen/Überblenden, Skalieren) und nebeneinander (gemeinsamer Zoom). Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 900, height: 1000 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {};
    const farbe = (c) => { const k = document.createElement('canvas'); k.width = 120; k.height = 160; const g = k.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, 120, 160); g.fillStyle = '#fff'; g.fillRect(40, 50, 40, 50); return k.toDataURL('image/png'); };
    const jetzt = Date.now(), D = 86400000;
    const p = { id: 'bv1', nr: 1, anrede: 'Frau', vorname: 'Eva', nachname: 'Bild', dob: '01.01.1990', medikation: [], log: [], doku: [], dokumente: [], erstellt: jetzt,
      bilder: [['b1', '#2f7a46', 1], ['b2', '#c0392b', 30], ['b3', '#2980b9', 10], ['b4', '#8e44ad', 60]].map(x => ({ id: x[0], name: x[0] + '.png', ts: jetzt - D * x[2], dataUrl: farbe(x[1]) })) };
    patients.length = 0; patients.push(p); FLC = null; persist();
    viewAkte(p); setAkTab('anl'); setMedFilter('bild'); await wait(500);
    // Reihenfolge: Bilder und Dateien stehen vor den Unterlagen
    const mb = document.getElementById('a-medien-block'), ub = document.getElementById('a-unt-block');
    out.reihenfolge = !!(mb.compareDocumentPosition(ub) & Node.DOCUMENT_POSITION_FOLLOWING);
    out.bereichDa = getComputedStyle(document.getElementById('md-cmp')).display !== 'none' && document.querySelectorAll('#md-cmp .vg-slot').length === 2;
    // Symbol am Bild
    const knoepfe = [...document.querySelectorAll('#md-list .mi-cmp')]; out.symbole = knoepfe.length === 4;
    knoepfe[0].click(); await wait(200);
    out.erster = document.querySelectorAll('#md-cmp .vg-slot.on').length === 1;
    // Ziehen auf Platz B (Drag-and-Drop mit echtem DataTransfer)
    const slotB = document.querySelectorAll('#md-cmp .vg-slot')[1];
    const dt = new DataTransfer(); dt.setData('text/x-ka-bild', 'b2');
    slotB.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true })); slotB.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); await wait(300);
    out.zwei = document.querySelectorAll('#md-cmp .vg-slot.on').length === 2 && !!document.querySelector('#md-cmp .vg-stage.vg-over');
    // Teilen: Regler (Kante) verschieben
    const stage = document.querySelector('#md-cmp .vg-stage'), hd = stage.querySelector('.vg-hd'), sr = stage.getBoundingClientRect();
    hd.dispatchEvent(new PointerEvent('pointerdown', { clientX: sr.left + sr.width * 0.25, pointerId: 1, bubbles: true })); hd.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, bubbles: true })); await wait(100);
    out.teilen = /25(\.\d+)?%/.test(stage.querySelectorAll('.vg-layer')[1].style.clipPath);
    // Skalieren des gewählten Bildes (B)
    const zoom = document.querySelector('#md-cmp .vg-zoom input'); zoom.value = 160; zoom.dispatchEvent(new Event('input')); await wait(100);
    out.skaliert = /scale\(1\.6\)/.test(stage.querySelectorAll('.vg-img')[1].style.transform) && /scale\(1\)/.test(stage.querySelectorAll('.vg-img')[0].style.transform);
    // Überblenden: Deckkraft
    [...document.querySelectorAll('#md-cmp .vg-seg button')].find(b => b.textContent === 'Überblenden').click(); await wait(200);
    const op = document.querySelector('#md-cmp .vg-row input[type=range]'); op.value = 30; op.dispatchEvent(new Event('input')); await wait(50);
    out.blend = Math.abs(parseFloat(document.querySelectorAll('#md-cmp .vg-layer')[1].style.opacity) - 0.3) < 0.02;
    // Drittes Bild
    [...document.querySelectorAll('#md-cmp .vg-plus')].find(b => /3\. Bild/.test(b.textContent)).click(); await wait(200);
    knoepfe[2] && [...document.querySelectorAll('#md-list .mi-cmp')][2].click(); await wait(300);
    out.drei = document.querySelectorAll('#md-cmp .vg-slot.on').length === 3 && document.querySelectorAll('#md-cmp .vg-layer').length === 3;
    // Teilen mit drei Bildern: zwei Kanten
    [...document.querySelectorAll('#md-cmp .vg-seg button')].find(b => b.textContent === 'Teilen').click(); await wait(200);
    out.zweiKanten = document.querySelectorAll('#md-cmp .vg-hd').length === 2;
    // Nebeneinander: drei Spalten, gemeinsamer Zoom
    [...document.querySelectorAll('#md-cmp .vg-seg button')].find(b => b.textContent === 'Nebeneinander').click(); await wait(300);
    out.spalten = document.querySelectorAll('#md-cmp .vg-fig').length === 3;
    const z2 = document.querySelector('#md-cmp .vg-zoom input'); z2.value = 200; z2.dispatchEvent(new Event('input')); await wait(80);
    out.gemeinsamerZoom = [...document.querySelectorAll('#md-cmp .vg-img')].every(i => /scale\(2\)/.test(i.style.transform));
    // jedes Bild mit jedem: ein viertes ersetzt den letzten Platz
    [...document.querySelectorAll('#md-list .mi-cmp')][3].click(); await wait(200);
    out.maxDrei = document.querySelectorAll('#md-cmp .vg-slot.on').length === 3 && document.querySelector('#md-cmp .vg-slot:nth-child(3) .vg-sd') !== null;
    // Aus Platz nehmen
    document.querySelector('#md-cmp .vg-slot .vg-x').click(); await wait(200);
    out.entfernt = document.querySelectorAll('#md-cmp .vg-slot.on').length === 2;
    // Bildansicht: Vergleichen-Knopf übernimmt zwei Bilder in den Bereich
    showGallery(p, p.bilder.slice(), 0); await wait(300);
    document.getElementById('img-cmp-btn').click(); galStep(1); await wait(100); document.getElementById('img-cmp-btn').click(); await wait(500);
    out.ausBildansicht = !document.getElementById('modal-img').classList.contains('active') && document.querySelectorAll('#md-cmp .vg-slot.on').length === 2;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Bildvergleich: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Bildvergleich OK (Reihenfolge, Ziehen, Symbol, Teilen, Überblenden, Skalieren, drei Bilder, nebeneinander)');
} finally {
  await browser.close();
}
