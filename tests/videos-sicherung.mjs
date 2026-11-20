import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Videos getrennt sichern und laden: verschlüsselte ZIP, falsches Passwort abgelehnt, Wiederherstellung mit Prüfsumme und Zuordnung zur Akte.
// Erfundene Daten.
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
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)), msgs = [];
    window.alert = m => msgs.push(String(m)); window.kaConfirm = async () => true;
    let antworten = []; window.kaPrompt = async () => antworten.shift();
    const p = { id: 'vs1', nr: 1, anrede: 'Herr', vorname: 'Theo', nachname: 'Sicher', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); FLC = null; persist();
    const a = new Uint8Array(5000).map((_, i) => (i * 7) % 256), b = new Uint8Array(3000).map((_, i) => (i * 3) % 256);
    curP = p;
    await addVideos({ files: [new File([a], 'eins.mp4', { type: 'video/mp4' }), new File([b], 'zwei.mov', { type: 'video/quicktime' })], value: '' });
    out.zwei = (p.videos || []).length === 2;
    // Sichern
    antworten = ['Video-Sicherung-123', 'Video-Sicherung-123'];
    const blobs = await vbkExport(); await wait(100);
    out.erstellt = Array.isArray(blobs) && blobs.length === 1 && blobs[0].size > 8000;
    const roh = new Uint8Array(await blobs[0].arrayBuffer());
    const enthaelt = (hay, nadel) => { outer: for (let i = 0; i <= hay.length - nadel.length; i++) { for (let k = 0; k < nadel.length; k++) if (hay[i + k] !== nadel[k]) continue outer; return true; } return false; };
    out.verschluesselt = !enthaelt(roh, a.subarray(100, 140)) && !enthaelt(roh, new TextEncoder().encode('eins.mp4')) && !enthaelt(roh, new TextEncoder().encode('Sicher'));
    closeModal('modal-prog'); bkOpen = 0;
    const zip = new File([blobs[0]], 'videos.zip', { type: 'application/zip' });
    // Gerät "verliert" die Videos, eine Akte kennt das zweite Video nicht mehr
    const ids = p.videos.map(v => v.id); for (const id of ids) await vDel(id);
    p.videos = p.videos.slice(0, 1); persist();
    // falsches Passwort
    antworten = ['falsches-Passwort-99'];
    const r0 = await vbkImport({ files: [zip], value: '' });
    out.falschAbgelehnt = r0 === null && msgs.some(m => /Passwort stimmt nicht/.test(m)) && !(await vHas(ids[0]));
    // richtig
    antworten = ['Video-Sicherung-123'];
    const r1 = await vbkImport({ files: [zip], value: '' }); closeModal('modal-prog');
    out.geladen = r1 && r1.neu === 2 && r1.fehler === 0;
    const f1 = await vGet(ids[0]), f2 = await vGet(ids[1]);
    const back1 = new Uint8Array(await f1.blob.arrayBuffer()), back2 = new Uint8Array(await f2.blob.arrayBuffer());
    out.inhalt = back1.length === 5000 && back1[123] === a[123] && back2.length === 3000 && back2[77] === b[77] && f2.type === 'video/quicktime';
    out.akteVerknuepft = p.videos.length === 2 && p.videos.some(v => v.id === ids[1] && v.name === 'zwei.mov');
    // nochmal laden: nichts doppelt
    antworten = ['Video-Sicherung-123'];
    const r2 = await vbkImport({ files: [zip], value: '' }); closeModal('modal-prog');
    out.keineDoppelten = r2 && r2.neu === 0 && r2.schon === 2 && p.videos.length === 2;
    // normale Sicherung erkennt die Videosicherung
    out.nichtImDateispeicher = !(await fAll()).some(x => ids.includes(x.id));
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Videosicherung: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Videosicherung OK (verschlüsselt, Passwort, Prüfsumme, Zuordnung, keine Doppelten)');
} finally {
  await browser.close();
}
