import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Briefumschlag B6: PDF im Format 176 x 125 mm (quer) mit Absender (Praxis) und Empfänger (Patient), erreichbar im Aktionsmenü der Akte.
// Ausschließlich erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));

try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#al-pw2', { state: 'visible', timeout: 10000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!');
  await page.fill('#al-pw2', 'CiAppPasswort-123!');
  await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });

  const r = await page.evaluate(async () => {
    const out = {}, alerts = []; window.alert = m => alerts.push(String(m));
    patients.length = 0;
    const mk = (id, x) => Object.assign({ id, nr: 1, anrede: 'Frau', titel: '', vorname: 'Erika', nachname: 'Mustermann', adresse: 'Teststraße 12\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() }, x || {});
    const p1 = mk('u1'), p2 = mk('u2', { anrede: 'Herr', titel: 'Dr.', vorname: 'Ömer Şahin-Ünalçıoğlu', nachname: 'Beispiel-Musterhausen-Langername', adresse: 'Eine sehr lange Beispielstraße am Wasser 123 a\n12345 Sehr Langer Beispielort an der Spree' }), p3 = mk('u3', { adresse: '' }), p4 = mk('u4', { anrede: '' });
    patients.push(p1, p2, p3, p4);
    // Zeilen
    out.zeilen = JSON.stringify(umschlagLines(p1)) === JSON.stringify({ absender: ['Kreuzberg Ästhetik', 'Manuel Fella', 'Neuenburger Str. 24', '10969 Berlin'], empfaenger: ['Frau', 'Erika Mustermann', 'Teststraße 12', '10999 Berlin'], nameIdx: 1 });
    out.ohneAnrede = umschlagLines(p4).empfaenger.length === 3 && umschlagLines(p4).nameIdx === 0;
    out.ohneAnschrift = umschlagLines(p3) === null && (await umschlagPdf(p3)) === null;
    // PDF erzeugen, lesen
    const load = src => new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s); });
    await load('pdfjs.min.js'); pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs.worker.min.js';
    const info = async (p) => {
      const bytes = await umschlagPdf(p), pdf = await pdfjsLib.getDocument({ data: bytes }).promise, pg = await pdf.getPage(1), vp = pg.getViewport({ scale: 1 });
      const tc = await pg.getTextContent();
      return { seiten: pdf.numPages, bMm: vp.width / UMSCHLAG_MM, hMm: vp.height / UMSCHLAG_MM, items: tc.items.map(i => ({ s: i.str, x: i.transform[4] / UMSCHLAG_MM, y: vp.height / UMSCHLAG_MM - i.transform[5] / UMSCHLAG_MM, w: i.width / UMSCHLAG_MM })) };
    };
    const a = await info(p1);
    out.format = a.seiten === 1 && Math.abs(a.bMm - 176) < 0.3 && Math.abs(a.hMm - 125) < 0.3;
    const txt = a.items.map(i => i.s);
    out.text = ['Kreuzberg Ästhetik', 'Manuel Fella', 'Neuenburger Str. 24', '10969 Berlin', 'Frau', 'Erika Mustermann', 'Teststraße 12', '10999 Berlin'].every(t => txt.includes(t));
    const sender = a.items.find(i => i.s === 'Kreuzberg Ästhetik'), emp = a.items.find(i => i.s === 'Erika Mustermann');
    out.lage = sender.x > 25 && sender.x < 40 && sender.y < 20 && emp.x > 90 && emp.x < 100 && emp.y > 55 && emp.y < 80;
    out.empfaengerImFeld = a.items.filter(i => ['Frau', 'Erika Mustermann', 'Teststraße 12', '10999 Berlin'].includes(i.s)).every(i => i.x + i.w <= 176 - 9);
    // lange Zeilen und Sonderzeichen: passt in die Seite, kein Abbruch
    const b = await info(p2);
    out.lang = b.items.filter(i => i.x > 90 && i.s).every(i => i.x + i.w <= 176 - 9) && b.items.some(i => /^Dr\./.test(i.s));
    out.umbruch = b.items.filter(i => i.x > 90 && i.s).length >= 5 && !b.items.some(i => /\?/.test(i.s)) && b.items.some(i => /Sahin-Ünalçioglu/.test(i.s)) && b.items.some(i => i.s === 'Beispiel-Musterhausen-Langername');
    // Logo: Bild auf der Seite, links oben im Absenderbereich
    { const bytes = await umschlagPdf(p1), pdf = await pdfjsLib.getDocument({ data: bytes }).promise, pg = await pdf.getPage(1), ol = await pg.getOperatorList();
      out.logo = ol.fnArray.some(f => f === pdfjsLib.OPS.paintImageXObject || f === pdfjsLib.OPS.paintInlineImageXObject); }
    // Ohne Logo-Datei: Umschlag entsteht trotzdem, Text beginnt am linken Rand
    { const keep = umschlagLogoBytes; umschlagLogoBytes = false; const c = await info(p1); umschlagLogoBytes = keep;
      const s0 = c.items.find(i => i.s === 'Kreuzberg Ästhetik'); out.ohneLogo = s0.x < 15 && c.items.some(i => i.s === 'Erika Mustermann'); }
    // Dateiname
    out.datei = umschlagFile(p1) === 'Umschlag-B6-Mustermann-Erika.pdf';
    // Menü: Eintrag vorhanden und Aktion löst Download aus
    out.menue = AM_GROUPS.some(g => g.items.some(it => it[0] === 'umschlag' && /B6/.test(it[2])));
    return out;
  });
  for (const k of ['zeilen', 'logo', 'ohneLogo', 'ohneAnrede', 'ohneAnschrift', 'format', 'text', 'lage', 'empfaengerImFeld', 'lang', 'umbruch', 'datei', 'menue']) assert.equal(r[k], true, 'Briefumschlag: ' + k + ' ' + JSON.stringify(r));

  // Download über die Aktion im Aktionsmenü
  const dl = page.waitForEvent('download', { timeout: 15000 });
  await page.evaluate(() => { curP = patients[0]; aAct('umschlag'); });
  const d = await dl;
  assert.equal(d.suggestedFilename(), 'Umschlag-B6-Mustermann-Erika.pdf');
  // fehlende Anschrift: Hinweis, kein Download
  const hinweis = await page.evaluate(async () => { const al = []; window.alert = m => al.push(String(m)); await umschlagSave(patients[2]); return al; });
  assert.ok(hinweis.some(m => /fehlt die Anschrift/.test(m)), 'Hinweis bei fehlender Anschrift: ' + JSON.stringify(hinweis));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Briefumschlag B6 OK (176 x 125 mm quer, Absender und Empfänger)');
} finally {
  await browser.close();
}
