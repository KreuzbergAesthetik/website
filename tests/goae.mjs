import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// GOÄ: Festpreis bleibt, Steigerungsfaktor wird zurückgerechnet; Honorarvereinbarung aus der Akte erscheint auf der Rechnung.
// Ausschließlich erfundene Beispielwerte (keine echte GOÄ-Zuordnung).
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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
    const out = {}, asked = [];
    window.kaConfirm = async (m) => { asked.push(String(m)); return true; };
    patients.length = 0; invoices.length = 0; entw.length = 0;
    settings.steuernr = 'TEST';
    settings.katalog = (settings.katalog || []).filter(k => k.name !== 'Probeleistung GOÄ');

    // Leistungsfenster: Felder ausfüllen, Faktor wird angezeigt
    openLeist(-1);
    document.getElementById('ls-name').value = 'Probeleistung GOÄ';
    document.getElementById('ls-price').value = '121,38';
    document.getElementById('ls-rate').value = '19';
    document.getElementById('ls-goae').value = '1234';
    document.getElementById('ls-pkt').value = '500';
    document.getElementById('ls-analog').checked = true;
    lsFaktorInfo();
    out.faktorText = document.getElementById('ls-faktor').textContent;
    saveLeist();
    const k = settings.katalog.find(x => x.name === 'Probeleistung GOÄ');
    out.katalog = !!k && k.goae === '1234' && k.pkt === 500 && k.analog === true;

    // Akte: Honorarvereinbarung eintragen (über die Stammdaten-Maske)
    const p = { id: 'g1', nr: 1, anrede: 'Frau', vorname: 'Gina', nachname: 'Beispiel', dob: '01.02.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(p); viewAkte(p); toggleStamm();
    document.getElementById('se-honorarVom').value = '28.10.2026'; toggleStamm();
    out.akteFeld = p.honorarVom === '28.10.2026' && (p.audit || []).some(a => /Honorarvereinbarung/.test(JSON.stringify(a)));
    closeModal('modal-akte');

    // Rechnung aus der Leistung
    openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Probeleistung GOÄ', qty: '1', price: '121,38', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    const inv = invoices[invoices.length - 1];
    const g = inv.items[0].goae;
    out.faktor = g && g.faktor;
    out.honorar = inv.honorarVom;
    viewInvoice(inv.id);
    const txt = document.getElementById('inv-view').innerText;
    out.ansichtNr = /GOÄ A 1234 \(entsprechend Nr\. 1234\)/.test(txt) && /Faktor 3,5/.test(txt);
    out.ansichtHinweis = /Honorarvereinbarung nach § 2 GOÄ vom 28\.10\.2026/.test(txt);
    try { const pdf = await Promise.resolve(buildInvoicePdf(inv, null)); out.pdf = !!pdf; } catch (e) { out.pdf = 'Fehler ' + e.message; }
    closeModal('modal-invview');

    // Ohne Honorarvereinbarung bei Faktor > 2,3: Rückfrage
    const q = { id: 'g2', nr: 2, anrede: 'Herr', vorname: 'Gero', nachname: 'Probe', adresse: 'Teststraße 2\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(q); asked.length = 0;
    openInvoiceKind(q, 'rechnung'); invRows = [{ type: 'pos', text: 'Probeleistung GOÄ', qty: '1', price: '121,38', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    out.warnung = asked.some(a => /keine Honorarvereinbarung/.test(a));
    closeModal('modal-invview');

    // Leistung ohne GOÄ bleibt wie bisher
    openInvoiceKind(q, 'rechnung'); invRows = [{ type: 'pos', text: 'Freie Position', qty: '1', price: '50', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    out.ohneGoae = !invoices[invoices.length - 1].items[0].goae && !goaeNote(invoices[invoices.length - 1]);
    closeModal('modal-invview');
    return out;
  });

  // 121,38 € brutto / 1,19 = 102,00 € netto; 500 × 0,0582873 = 29,14365 €; 102 / 29,14365 = 3,4999… → 3,5
  assert.equal(r.faktor, 3.5, 'Faktor falsch zurückgerechnet: ' + JSON.stringify(r));
  for (const k of ['katalog', 'akteFeld', 'ansichtNr', 'ansichtHinweis', 'pdf', 'warnung', 'ohneGoae']) assert.equal(r[k], true, 'GOÄ: ' + k + ' ' + JSON.stringify(r));
  assert.equal(r.honorar, '28.10.2026');
  assert.match(r.faktorText, /Steigerungsfaktor 3,5/);
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('GOÄ OK', r.faktorText);
} finally {
  await browser.close();
}
