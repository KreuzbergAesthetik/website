import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Videos in der Akte: nur auf diesem Gerät, verschlüsselt im eigenen Speicher, höchstens 100 MB,
// nicht im Dateispeicher (und damit nicht in Sicherung und Abgleich). Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    window.alert = () => {}; window.kaConfirm = async () => true;
    const p = { id: 'vd1', nr: 1, anrede: 'Frau', vorname: 'Vera', nachname: 'Video', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    viewAkte(p); setAkTab('anl'); setMedFilter('bild'); await wait(300);
    out.knopf = (document.getElementById('md-add').click(), await wait(100), [...document.querySelectorAll('#tl-menu button')].some(x => /^Video/.test(x.textContent)));
    const inhalt = new Uint8Array(4096).map((_, i) => i % 251);
    const klein = new File([inhalt], 'beispiel.mp4', { type: 'video/mp4' });
    const gross = { name: 'zu-gross.mp4', type: 'video/mp4', size: 101 * 1048576 };
    const fake = files => ({ files, value: 'x' });
    const vorher = (await fKeys()).length;
    await addVideos(fake([klein, gross])); await wait(300);
    out.einVideo = (p.videos || []).length === 1 && p.videos[0].size === 4096 && p.videos[0].name === 'beispiel.mp4';
    out.nichtImDateispeicher = (await fKeys()).length === vorher;
    const roh = await new Promise(res => { const q = indexedDB.open('ka-videos', 1); q.onsuccess = () => { const db = q.result, g = db.transaction('v').objectStore('v').get(p.videos[0].id); g.onsuccess = () => { db.close(); res(g.result); }; }; });
    out.verschluesselt = !!(roh && roh.enc && !roh.blob && roh.enc.byteLength > 4096);
    const f = await vGet(p.videos[0].id), back = new Uint8Array(await f.blob.arrayBuffer());
    out.entschluesselt = back.length === 4096 && back[250] === 250 && back[251] === 0 && f.type === 'video/mp4';
    out.protokoll = JSON.stringify(p.audit || []).includes('beispiel.mp4');
    setMedFilter('bild'); renderMedien(); await wait(200);
    out.kachel = !!document.querySelector('#md-list .vid-tile') && /Bilder \(1\)/.test(document.getElementById('md-bild').textContent);
    document.querySelector('#md-list .vid-tile').click(); await wait(400);
    out.abspielen = !!document.querySelector('#vid-view video') && /^blob:/.test(document.querySelector('#vid-view video').src);
    document.querySelector('#vid-view .vid-x').click(); await wait(100);
    out.zu = document.getElementById('vid-view').style.display === 'none';
    // Video ohne Datei auf diesem Gerät (z. B. per Abgleich übernommen): Hinweis statt Fehler
    p.videos.push({ id: 'fremd-1', ts: Date.now(), name: 'anderes-geraet.mp4', size: 1000 }); renderMedien(); await wait(300);
    out.fremd = [...document.querySelectorAll('#md-list .vid-tile')].some(t => t.classList.contains('vid-miss') && /anderen Gerät/.test(t.textContent));
    // Sicherung enthält nur Dateien aus dem Dateispeicher: Video-ID taucht dort nicht auf
    out.nichtInSicherung = !(await fAll()).some(x => x.id === p.videos[0].id);
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Videos: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Videos OK (nur Gerät, verschlüsselt, 100 MB, Protokoll, Abspielen, nicht in Sicherung)');
} finally {
  await browser.close();
}
