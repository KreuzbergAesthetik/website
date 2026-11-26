import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// GOÄ: Standard-Vorschlag je Leistung (nur belegte Nummern) und Schalter „nach GOÄ aufschlüsseln“ in der Rechnung. Erfundene Daten.
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
    const out = {}; window.alert = () => {}; window.kaConfirm = async () => true; settings.steuernr = 'TEST';
    const nrs = n => { const g = goaeStandardFor(n); return g ? g.nrs.join('+') : 'keiner'; };
    out.einZone = nrs('Neuromodulator 1 Zone') === '267';
    out.mehrZonen = nrs('Neuromodulator 2 Zonen') === '268' && nrs('Jawline') === '268' && nrs('Bruxismus/Masseter') === '268';
    out.weitere = nrs('Jede weitere Zone') === '';
    out.hyaluron = nrs('Hyaluron Filler 1 ml') === '267' && nrs('Lip-Flip + 0,7 ml Hyaluron (Abstand 2 Wochen)') === '267' && nrs('Hylase intern') === 'keiner';
    out.infusion = nrs('NAD+-Infusion 250 mg') === '272';
    out.ohneBeleg = ['PRP', 'Microneedling', 'PRX-T33®-Peeling', '3 x Polynukleotide', 'Rotlicht-Therapie (LED)'].every(n => nrs(n) === 'keiner');
    // Leistungsfenster: Vorschlag füllt die Positionen
    openLeist(-1); document.getElementById('ls-name').value = 'Neuromodulator 2 Zonen'; document.getElementById('ls-price').value = '259,00'; lsGoaeSuggest();
    out.fenster = LS_POS.length === 1 && LS_POS[0].nr === '268' && LS_POS[0].pkt === 130 && /Vorschlag/.test(document.getElementById('ls-goae-hint').textContent);
    document.getElementById('ls-name').value = 'PRP'; lsGoaeSuggest(); out.ohneBelegHinweis = /§ 6 Abs\. 2 GOÄ/.test(document.getElementById('ls-goae-hint').textContent);
    // Rechnung mit Schalter
    settings.katalog = [{ name: 'Probe Neuro', price: 259, rate: 19, goaePos: [{ nr: '268', pkt: 130, text: 'Infiltration mehrere Regionen', analog: false }] }];
    const p = { id: 'gv1', nr: 1, anrede: 'Frau', vorname: 'Gina', nachname: 'Vorschlag', dob: '01.02.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.length = 0; patients.push(p); invoices.length = 0; FLC = null;
    openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Probe Neuro', qty: '1', price: '259,00', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows();
    out.schalter = !!document.querySelector('#inv-pos input[type=checkbox]') && /Nach GOÄ aufschlüsseln \(Nr\. 268\)/.test(document.getElementById('inv-pos').textContent);
    document.querySelector('#inv-pos input[type=checkbox]').click();   // aus
    out.aus = invRows[0].goaeOff === true;
    await saveInvoice(); const inv = invoices[invoices.length - 1];
    out.ohneGoae = inv.items.length === 1 && !inv.items[0].goae && inv.total === 259;
    closeModal('modal-invview');
    openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Probe Neuro', qty: '1', price: '259,00', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    const inv2 = invoices[invoices.length - 1]; out.mitGoae = inv2.items.some(i => i.goae && i.goae.nr === '268') && inv2.total === 259;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'GOÄ-Vorschlag: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('GOÄ-Vorschlag OK (Zuordnung, nur belegte Nummern, Leistungsfenster, Schalter in der Rechnung)');
} finally {
  await browser.close();
}
