import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Patientenseiten: Impressum und Datenschutzerklärung als Fußzeile. Ohne eingetragene Adressen erscheint keine Fußzeile,
// mit Adressen zwei sichere Links; unsichere (http) und leere Adressen werden ignoriert. Erfundene Adressen.
const origin = (process.env.APP_URL || 'http://127.0.0.1:4173/index.html').replace(/\/[^/]*$/, '');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.route('https://www.kreuzberg-aesthetik.de/**', r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true,"texte":{},"felder":{},"key":null}' }));
const pageErrors = [];

try {
  for (const f of ['anmeldung.html', 'anamnese.html?c=ABC234', 'erinnerung.html', 'aufklaerung.html?d=x&c=ABC234', 'info.html?d=x', 'postfachtest.html']) {
    const p = await context.newPage(); p.on('pageerror', e => pageErrors.push(f + ': ' + String(e)));
    await p.goto(origin + '/' + f, { waitUntil: 'networkidle' });
    const r = await p.evaluate(() => {
      const out = {};
      out.ohneAdressen = !document.getElementById('legal');
      PRAXIS_F.impressum = 'http://example.invalid/impressum'; PRAXIS_F.datenschutz = '';
      legalFooter(); out.unsichererLinkIgnoriert = !document.getElementById('legal');
      PRAXIS_F.impressum = 'https://example.invalid/impressum'; PRAXIS_F.datenschutz = 'https://example.invalid/datenschutz';
      legalFooter();
      const a = [...document.querySelectorAll('#legal a')];
      out.links = a.map(x => x.textContent + '=' + x.getAttribute('href')).join(' | ');
      out.sicher = a.length === 2 && a.every(x => x.target === '_blank' && /noopener/.test(x.rel));
      out.amEnde = document.body.lastElementChild.id === 'legal';
      out.nurEine = document.querySelectorAll('#legal').length === 1;
      if (typeof showDone === 'function' && document.getElementById('formbox')) { showDone('Test'); out.nachAbsenden = !!document.getElementById('legal'); }
      return out;
    });
    assert.equal(r.ohneAdressen, true, f + ': Fußzeile ohne Adressen sichtbar');
    assert.equal(r.unsichererLinkIgnoriert, true, f + ': http-Adresse nicht ignoriert');
    assert.equal(r.links, 'Impressum=https://example.invalid/impressum | Datenschutzerklärung=https://example.invalid/datenschutz', f);
    assert.equal(r.sicher, true, f + ': Links nicht sicher geöffnet');
    assert.equal(r.amEnde, true, f + ': Fußzeile nicht am Seitenende');
    assert.equal(r.nurEine, true, f + ': Fußzeile doppelt');
    if ('nachAbsenden' in r) assert.equal(r.nachAbsenden, true, f + ': Fußzeile nach dem Absenden weg');
    await p.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Rechtliche Links OK (6 Seiten)');
} finally {
  await browser.close();
}
