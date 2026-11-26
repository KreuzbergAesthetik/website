import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Rechnung aus einem Termin: Leistungen aus der Dokumentation (Feld „Leistungen“) haben Vorrang vor denen des Termins. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); window.alert = () => {}; window.kaConfirm = async () => true;
    settings.katalog = [{ name: 'Probe Beratung', price: 80, rate: 0 }, { name: 'Probe Behandlung A', price: 200, rate: 19 }, { name: 'Probe Behandlung B', price: 150, rate: 19 }];
    const p = { id: 'rd1', nr: 1, vorname: 'Rita', nachname: 'Rechnung', adresse: 'Musterweg 1, 10999 Berlin', erstellt: Date.now(), medikation: [], bilder: [], dokumente: [], doku: [], log: [] };
    const e = { id: 4711, date: iso(new Date()), time: '10:00', dur: 30, patient: 'Rita Rechnung', pid: 'rd1', leistung: 'Probe Beratung', behandlung: 'Probe Beratung', notes: '', dok: { anamnese: '', befund: '', behandlung: 'x', aufklaerung: '', verw: {}, leist: 'Probe Behandlung A\nProbe Behandlung B', produkte: '', ausblick: '' } };
    patients.length = 0; patients.push(p); events.length = 0; events.push(e); invoices.length = 0; FLC = null; persist();
    curP = p; openInvoice(p); await wait(300);
    fillTermine(p); document.getElementById('inv-termin').value = String(e.id); out.opt = document.getElementById('inv-termin').value; invTerminChanged(); await wait(200);
    out.zeilen = [...document.querySelectorAll('#inv-pos input')].map(i => i.value).filter(v => /^Probe/.test(v)).join('|'); out.dbg = JSON.stringify({ opt: out.opt, kat: typeof findKat === 'function' ? !!findKat('Probe Behandlung A') : 'x', rows: invRows.length });
    return out;
  });
  assert.equal(r.zeilen, 'Probe Behandlung A|Probe Behandlung B', 'Leistungen aus der Dokumentation nicht übernommen: ' + r.zeilen + ' ' + r.dbg);
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Rechnung aus Dokumentation OK (Leistungen der Doku haben Vorrang)');
} finally {
  await browser.close();
}
