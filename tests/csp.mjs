import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Sicherheitsrichtlinie (CSP): Die App muss mit ihr ohne Verstöße laufen, Verbindungen zu fremden Servern müssen blockiert sein.
// Erfundene Daten; Praxis-Server wird simuliert.
const origin = (process.env.APP_URL || 'http://127.0.0.1:4173/index.html').replace(/\/[^/]*$/, '');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  try { if (location.pathname.endsWith('index.html')) localStorage.clear(); } catch {}
  window.__csp = [];
  document.addEventListener('securitypolicyviolation', e => {
    // pdf.js prüft nur, ob eval erlaubt ist, und kommt ohne aus
    if (e.blockedURI === 'eval' && /pdfjs/.test(e.sourceFile || '')) return;
    window.__csp.push(e.violatedDirective + ' ' + e.blockedURI);
  });
});
await context.route('https://www.kreuzberg-aesthetik.de/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true,"texte":{},"felder":{},"key":null}' }));
await context.route('https://example.com/**', r => r.fulfill({ status: 200, body: 'x' }));
const pageErrors = [];

try {
  const page = await context.newPage();
  page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
  await page.goto(origin + '/index.html', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#al-pw2', { state: 'visible', timeout: 10000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!');
  await page.fill('#al-pw2', 'CiAppPasswort-123!');
  await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });

  const app = await page.evaluate(async () => {
    const w = ms => new Promise(r => setTimeout(r, ms));
    const out = {};
    for (const t of ['start', 'kalender', 'patienten', 'todos'].concat(PRAXIS_TABS)) { try { switchTab(t); } catch {} await w(120); }
    // PDF erzeugen (pdf-lib) und wieder lesen (pdf.js mit Worker)
    const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });
    await load('pdf-lib.min.js');
    const doc = await PDFLib.PDFDocument.create(); const pg = doc.addPage([200, 100]); pg.drawText('Probe', { x: 20, y: 50, size: 14 }); const bytes = await doc.save();
    await load('pdfjs.min.js');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs.worker.min.js';
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise; const p1 = await pdf.getPage(1);
    const tc = await p1.getTextContent(); out.pdfText = tc.items.map(i => i.str).join('');
    const cv = document.createElement('canvas'); const vp = p1.getViewport({ scale: 1 }); cv.width = vp.width; cv.height = vp.height;
    await p1.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise; out.pdfRender = true;
    // Daten-URL und Blob lesen (wird für Dateien gebraucht)
    out.dataUrl = (await (await fetch('data:text/plain,ok')).text()) === 'ok';
    // erlaubte Verbindung zum Praxis-Server
    try { out.praxis = (await (await fetch('https://www.kreuzberg-aesthetik.de/wp-json/ka/v1/texte')).json()).ok === true; } catch { out.praxis = false; }
    const own = window.__csp.slice();
    // Gegenprobe: fremder Server muss blockiert sein
    try { await fetch('https://example.com/x'); out.fremdBlockiert = false; } catch { out.fremdBlockiert = true; }
    await w(200);
    out.fremdGemeldet = window.__csp.some(v => /connect-src/.test(v) && /example\.com/.test(v));
    out.verstoesse = own;
    return out;
  });
  assert.equal(app.pdfText, 'Probe', 'PDF konnte nicht gelesen werden');
  assert.equal(app.pdfRender, true);
  assert.equal(app.dataUrl, true, 'Daten-URL blockiert');
  assert.equal(app.praxis, true, 'Verbindung zum Praxis-Server blockiert');
  assert.equal(app.fremdBlockiert, true, 'Gegenprobe: Verbindung zu fremdem Server nicht blockiert');
  assert.equal(app.fremdGemeldet, true, 'Gegenprobe: Verstoß nicht gemeldet');
  assert.deepEqual(app.verstoesse, [], 'CSP-Verstöße in der App: ' + JSON.stringify(app.verstoesse));

  // Formularseiten: laden, PDF erzeugen, Schlüssel vom Praxis-Server holen
  const forms = {};
  for (const f of ['anmeldung.html', 'anamnese.html?c=ABC234', 'erinnerung.html', 'aufklaerung.html?d=x&c=ABC234', 'info.html?d=x', 'postfachtest.html']) {
    const p = await context.newPage(); p.on('pageerror', err => pageErrors.push(f + ': ' + String(err?.stack || err)));
    await p.goto(origin + '/' + f, { waitUntil: 'networkidle' });
    forms[f] = await p.evaluate(async () => {
      if (typeof newPdf === 'function') { const P = await newPdf('Probe', 'Test'); P.text('Probe'); await P.finish({}); }
      if (typeof praxisKey === 'function') await praxisKey();
      return window.__csp.slice();
    });
    await p.close();
  }
  for (const [f, v] of Object.entries(forms)) assert.deepEqual(v, [], 'CSP-Verstöße auf ' + f + ': ' + JSON.stringify(v));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('CSP OK (App, PDF, Worker, Praxis-Server erlaubt; fremder Server blockiert; Formularseiten ohne Verstoß)');
} finally {
  await browser.close();
}
