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
    const regionen = ['oberes Gesichtsdrittel', 'unteres Gesichtsdrittel', 'Hals', 'Masseter', 'Hände', 'Füße', 'Achseln', 'Gesicht komplett'];
    const std = 'Rötung, Schwellung, blaue Flecken, Blutung, Allergie (allergische Reaktion bis hin zur Anaphylaxie), Entzündung, Infektion', kosten = 'Diese sind unter Umständen mit privaten Kosten bzw. Selbstzahlungen verbunden.';
    out.standardBaustein = t('Risiken BTX Standard').includes(std + ', herabhängendes Augenlid oder herabhängende Augenbraue, Narbe, Revision mit OP.') && t('Risiken BTX Standard').includes(kosten);
    out.regionen = regionen.every(n => (t('Risiken BTX ' + n) || '').includes(std) && t('Risiken BTX ' + n).includes('Revision mit OP') && t('Risiken BTX ' + n).includes(kosten));
    out.augeNurGesicht = ['oberes Gesichtsdrittel', 'unteres Gesichtsdrittel', 'Hals', 'Masseter', 'Gesicht komplett'].every(n => /herabhängendes Augenlid/.test(t('Risiken BTX ' + n))) && ['Hände', 'Füße', 'Achseln'].every(n => !/Augenlid/.test(t('Risiken BTX ' + n)));
    out.einzeln = /Brauenform/.test(t('Risiken BTX oberes Gesichtsdrittel')) && /Mundwinkel/.test(t('Risiken BTX unteres Gesichtsdrittel')) && /Schluckbeschwerden/.test(t('Risiken BTX Hals')) && /Kaukraft/.test(t('Risiken BTX Masseter')) && /Griffkraft/.test(t('Risiken BTX Hände')) && /Fußmuskulatur/.test(t('Risiken BTX Füße')) && /Schwitzen an anderen/.test(t('Risiken BTX Achseln'));
    out.gesichtKomplett = /Brauenform/.test(t('Risiken BTX Gesicht komplett')) && /Mundwinkel/.test(t('Risiken BTX Gesicht komplett')) && /Schluckbeschwerden/.test(t('Risiken BTX Gesicht komplett'));
    out.ergaenzungen = /Antikörper/.test(t('Risiken BTX Ergänzungen')) && /Gegenanzeigen/.test(t('Risiken BTX Ergänzungen'));
    out.keineDosierung = regionen.every(n => !/\d+-\d+/.test(t('Risiken BTX ' + n)));
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
