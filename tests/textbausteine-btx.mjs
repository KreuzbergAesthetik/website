import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Neue Standard-Textbausteine (Risiken und Nebenwirkungen von Botulinumtoxin nach Region, BTX Standard) kommen einmalig dazu, vorhandene und geänderte bleiben unberührt. Erfundene Daten.
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
  const r = await page.evaluate(() => {
    const out = {};
    // Stand wie vor der Ergänzung: Version 2, ein eigener geänderter Baustein
    settings.tbVer = 2; settings.textbausteine = [{ id: 'x1', name: 'BTX Masseter', text: 'Eigener Text ___' }]; tbDefaults();
    const t = n => (settings.textbausteine.filter(x => x.name === n)[0] || {}).text;
    out.version = settings.tbVer === TB_VER && TB_VER >= 3;
    out.standard = t('BTX Standard') === 'Azzalure (140 SU*)\nSF 5-5-5-5-5-5 (30)\nZF 10-10-10-10-10 (50)\nKF 10-10-10 (60)';
    const std = 'Rötung, Schwellung, blaue Flecken, Blutung, Allergie (allergische Reaktion bis hin zur Anaphylaxie), Entzündung, Infektion', kosten = 'Diese sind unter Umständen mit privaten Kosten bzw. Selbstzahlungen verbunden.';
    const btx = ['oberes Gesichtsdrittel', 'unteres Gesichtsdrittel', 'Hals', 'Masseter', 'Hände', 'Füße', 'Achseln', 'Gesicht komplett'].map(n => 'Risiken BTX ' + n).concat(['Risiken BTX Standard']);
    const ha = ['Standard', 'Lippen', 'Nase', 'Tränenrinne', 'Mittelgesicht und Wangen', 'Kinn und Kieferlinie', 'Schläfen'].map(n => 'Risiken Hyaluron ' + n);
    const sonst = ['Poly-L-Milchsäure', 'Microneedling', 'Exosomen', 'Lipolyse', 'Mesotherapie PN NCTF'].map(n => 'Risiken ' + n);
    const alle = btx.concat(ha, sonst);
    out.standardBaustein = t('Risiken BTX Standard').includes(std + ', herabhängendes Augenlid oder herabhängende Augenbraue, Narbe, Revision mit OP.');
    out.allePflicht = alle.every(n => (t(n) || '').includes(std) && t(n).includes('Revision mit OP') && t(n).includes(kosten));
    out.offLabelUndAlternativen = alle.every(n => /Off-Label-Use/.test(t(n)) && /Bedeutung und mögliche Auswirkungen wurde informiert/.test(t(n)) && /Über Behandlungsalternativen/.test(t(n)));
    out.augeNurGesicht = ['oberes Gesichtsdrittel', 'unteres Gesichtsdrittel', 'Hals', 'Masseter', 'Gesicht komplett'].every(n => /herabhängendes Augenlid/.test(t('Risiken BTX ' + n))) && ['Hände', 'Füße', 'Achseln'].every(n => !/Augenlid/.test(t('Risiken BTX ' + n)));
    out.einzelnBTX = /Brauenform/.test(t('Risiken BTX oberes Gesichtsdrittel')) && /Mundwinkel/.test(t('Risiken BTX unteres Gesichtsdrittel')) && /Schluckbeschwerden/.test(t('Risiken BTX Hals')) && /Kaukraft/.test(t('Risiken BTX Masseter')) && /Griffkraft/.test(t('Risiken BTX Hände')) && /Fußmuskulatur/.test(t('Risiken BTX Füße')) && /Schwitzen an anderen/.test(t('Risiken BTX Achseln'));
    out.gesichtKomplett = /Brauenform/.test(t('Risiken BTX Gesicht komplett')) && /Mundwinkel/.test(t('Risiken BTX Gesicht komplett')) && /Schluckbeschwerden/.test(t('Risiken BTX Gesicht komplett'));
    out.hyaluron = ha.every(n => /Gefäßverschluss/.test(t(n)) && /Hyaluronidase/.test(t(n))) && /Lippenherpes/.test(t('Risiken Hyaluron Lippen')) && /Erblindung/.test(t('Risiken Hyaluron Nase')) && /bläuliche/.test(t('Risiken Hyaluron Tränenrinne'));
    out.sonstige = /Granulome/.test(t('Risiken Poly-L-Milchsäure')) && /Pigmentveränderungen/.test(t('Risiken Microneedling')) && /Polynukleotide/.test(t('Risiken Exosomen')) && /Lipolyse/.test(t('Risiken Lipolyse')) && /Mesotherapie/.test(t('Risiken Mesotherapie PN NCTF'));
    out.ergaenzungen = /Antikörper/.test(t('Risiken BTX Ergänzungen')) && /Gegenanzeigen/.test(t('Risiken BTX Ergänzungen'));
    out.keineDosierung = btx.every(n => !/\d+-\d+/.test(t(n)));
    out.eigenerBleibt = t('BTX Masseter') === 'Eigener Text ___' && settings.textbausteine.filter(x => x.name === 'BTX Masseter').length === 1;
    const n = settings.textbausteine.length; tbDefaults(); out.einmalig = settings.textbausteine.length === n;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Textbausteine BTX: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Textbausteine BTX OK (neue Regionen, Standard, eigene bleiben, einmalig)');
} finally {
  await browser.close();
}
