import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Fotos aus dem Teilen-Menü: Nach dem Entsperren müssen sie im Zwischenspeicher verschlüsselt liegen,
// trotzdem angezeigt und einer Akte zugeordnet werden können. Erfundene Daten, künstlich erzeugtes Bild.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));

try {
  // 1) App einrichten und erfundenen Patienten anlegen
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#al-pw2', { state: 'visible', timeout: 10000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!');
  await page.fill('#al-pw2', 'CiAppPasswort-123!');
  await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true, null, { timeout: 15000 });
  await page.evaluate(async () => {
    patients.length = 0;
    patients.push({ id: 'eg1', nr: 1, vorname: 'Ina', nachname: 'Beispiel', dob: '04.05.1988', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
    persist(); await kaIdle();
  });

  // 2) Neu laden (gesperrt) und ein Foto so ablegen, wie es der Service Worker beim Teilen tut
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#al-pw', { state: 'visible', timeout: 10000 });
  await page.evaluate(async () => {
    const cv = document.createElement('canvas'); cv.width = 40; cv.height = 30; const g = cv.getContext('2d'); g.fillStyle = '#c33'; g.fillRect(0, 0, 40, 30);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const c = await caches.open('ka-eingang'); await c.put('./eingang/1-0', new Response(blob, { headers: { 'Content-Type': 'image/png', 'X-Name': encodeURIComponent('Probe.png') } }));
  });
  await page.fill('#al-pw', 'CiAppPasswort-123!');
  await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  await page.waitForFunction(() => [...document.querySelectorAll('div')].some(d => /1 Foto zuordnen/.test(d.textContent || '') && d.children.length === 0), null, { timeout: 10000 });

  const sealed = await page.evaluate(async () => {
    const c = await caches.open('ka-eingang'), ks = await c.keys(), r = await c.match(ks[0]);
    const u8 = new Uint8Array(await r.arrayBuffer());
    const png = [0x89, 0x50, 0x4e, 0x47];
    let plain = false; for (let i = 0; i < u8.length - 4; i++) if (png.every((b, k) => u8[i + k] === b)) { plain = true; break; }
    const thumb = [...document.querySelectorAll('img')].find(i => i.src.startsWith('blob:'));
    if (thumb && !thumb.complete) await new Promise(r => { thumb.onload = thumb.onerror = r; });
    return { count: ks.length, enc: r.headers.get('X-Enc'), name: r.headers.get('X-Name'), plain, thumbOk: !!thumb && thumb.naturalWidth === 40 };
  });
  assert.equal(sealed.count, 1, 'Foto fehlt im Eingang');
  assert.equal(sealed.enc, '1', 'Foto ist nicht als verschlüsselt markiert');
  assert.equal(sealed.name, null, 'Dateiname liegt noch lesbar im Kopf');
  assert.equal(sealed.plain, false, 'Bilddaten liegen unverschlüsselt im Zwischenspeicher');
  assert.equal(sealed.thumbOk, true, 'Vorschaubild lässt sich nicht anzeigen');

  // 3) Zuordnen: Foto landet in der Akte, Zwischenspeicher ist leer
  await page.evaluate(() => { [...document.querySelectorAll('div')].find(d => typeof d.onclick === 'function' && /Ina/.test(d.textContent || ''))?.click(); });
  await page.evaluate(() => [...document.querySelectorAll('button')].find(b => b.textContent === 'Zur Akte' && !b.disabled)?.click());
  await page.waitForFunction(() => (patients.find(p => p.id === 'eg1')?.bilder || []).length === 1, null, { timeout: 10000 });
  const after = await page.evaluate(async () => (await (await caches.open('ka-eingang')).keys()).length);
  assert.equal(after, 0, 'Zwischenspeicher nach dem Zuordnen nicht leer');
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Eingangskorb verschlüsselt OK', JSON.stringify(sealed));
} finally {
  await browser.close();
}
