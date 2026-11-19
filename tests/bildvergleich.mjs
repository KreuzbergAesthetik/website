import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Bildvergleich im Bildfenster: erstes Bild merken, zweites wählen, Überblenden mit Regler oder nebeneinander, Vorher/Nachher nach Datum, Tauschen.
// Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    window.alert = () => {};
    const farbe = (c) => { const k = document.createElement('canvas'); k.width = 120; k.height = 90; const g = k.getContext('2d'); g.fillStyle = c; g.fillRect(0, 0, 120, 90); return k.toDataURL('image/png'); };
    const jetzt = Date.now();
    const p = { id: 'bv1', nr: 1, anrede: 'Frau', vorname: 'Eva', nachname: 'Bild', dob: '01.01.1990', medikation: [], log: [], doku: [], dokumente: [], erstellt: jetzt,
      bilder: [{ id: 'b-nachher', name: 'nachher.png', ts: jetzt - 1000, dataUrl: farbe('#2f7a46') }, { id: 'b-vorher', name: 'vorher.png', ts: jetzt - 86400000 * 30, dataUrl: farbe('#c0392b') }, { id: 'b-dritt', name: 'drittes.png', ts: jetzt - 86400000 * 10, dataUrl: farbe('#2980b9') }] };
    patients.length = 0; patients.push(p); FLC = null; persist();
    viewAkte(p); await wait(300);
    showGallery(p, p.bilder.slice(), 0); await wait(300);
    const cmpBtn = document.getElementById('img-cmp-btn');
    out.knopf = !!cmpBtn && cmpBtn.getBoundingClientRect().width > 0;
    cmpBtn.click(); await wait(100);
    out.markiert = cmpBtn.classList.contains('on') && /erstes Bild/.test(document.getElementById('img-cnt').textContent);
    galStep(1); await wait(100);
    out.hinweis = /Vergleichen/.test(document.getElementById('img-cnt').textContent);
    cmpBtn.click(); await wait(500);
    const m = document.getElementById('modal-cmp');
    out.offen = m.classList.contains('active') && !!document.querySelector('#cmp-stage .cmp-wrap');
    const tags = [...document.querySelectorAll('#cmp-stage .cmp-tag')].map(x => x.textContent);
    out.vorherNachher = /Vorher/.test(tags[0] || '') && /Nachher/.test(tags[1] || '');
    const wrap = document.querySelector('#cmp-stage .cmp-wrap'), bImg = wrap.querySelector('.cmp-b'), rect = wrap.getBoundingClientRect();
    out.mitte = /50%/.test(bImg.style.clipPath);
    wrap.dispatchEvent(new PointerEvent('pointerdown', { clientX: rect.left + rect.width * 0.25, clientY: rect.top + 10, pointerId: 1, bubbles: true }));
    wrap.dispatchEvent(new PointerEvent('pointerup', { clientX: rect.left + rect.width * 0.25, pointerId: 1, bubbles: true }));
    await wait(100);
    out.regler = /2[45](\.\d+)?%/.test(bImg.style.clipPath) && parseFloat(document.querySelector('#cmp-stage .cmp-line').style.left) < 30;
    const srcVorher = wrap.querySelector('.cmp-a').getAttribute('alt');
    cmpSwap(); await wait(200);
    out.tauschen = document.querySelector('#cmp-stage .cmp-wrap .cmp-a').getAttribute('alt') !== srcVorher;
    cmpMode(); await wait(300);
    out.nebeneinander = document.querySelectorAll('#cmp-stage .cmp-fig img').length === 2 && /Nebeneinander|Überblenden/.test(document.getElementById('cmp-mode').textContent) && document.getElementById('cmp-mode').textContent === 'Überblenden';
    closeModal('modal-cmp'); await wait(100);
    out.zu = !m.classList.contains('active');
    // zweimal dasselbe Bild: Vergleich abbrechen statt öffnen
    document.getElementById('img-cmp-btn').click(); document.getElementById('img-cmp-btn').click(); await wait(100);
    out.abbruch = !document.getElementById('img-cmp-btn').classList.contains('on') && !m.classList.contains('active');
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Bildvergleich: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Bildvergleich OK (Überblenden mit Regler, nebeneinander, Vorher/Nachher, Tauschen)');
} finally {
  await browser.close();
}
