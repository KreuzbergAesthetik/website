import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

// Weiterleitungsseiten für alte Links: Parameter und Anker bleiben erhalten, ungültige Zieladresse wird abgelehnt. Erfundene Adressen.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ka-weiter-'));
const ziel = 'https://neu.example.invalid';
execFileSync('node', ['werkzeuge/weiterleitungen.mjs', ziel, tmp], { stdio: 'pipe' });
let abgelehnt = false;
try { execFileSync('node', ['werkzeuge/weiterleitungen.mjs', 'http://unsicher.example.invalid', path.join(tmp, 'x')], { stdio: 'pipe' }); } catch { abgelehnt = true; }
assert.equal(abgelehnt, true, 'http-Zieladresse nicht abgelehnt');

const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext();
await context.route('https://alt.example.invalid/**', r => {
  const name = new URL(r.request().url()).pathname.split('/').pop();
  r.fulfill({ status: 200, contentType: 'text/html', body: fs.readFileSync(path.join(tmp, name), 'utf8') });
});
await context.route(ziel + '/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<p>neu</p>' }));
const pageErrors = [];
try {
  const faelle = [['anamnese.html', '?c=ABC234'], ['aufklaerung.html', '?d=x&c=ABC234'], ['anmeldung.html', ''], ['info.html', '?d=x#abschnitt']];
  for (const [name, rest] of faelle) {
    const p = await context.newPage(); p.on('pageerror', e => pageErrors.push(String(e)));
    await p.goto('https://alt.example.invalid/website/' + name + rest);
    await p.waitForURL(ziel + '/' + name + rest, { timeout: 5000 });
    assert.equal(p.url(), ziel + '/' + name + rest, name);
    await p.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  const html = fs.readFileSync(path.join(tmp, 'anamnese.html'), 'utf8');
  assert.ok(!/https?:\/\/(?!neu\.example\.invalid)/.test(html), 'fremde Adresse in der Weiterleitung');
  console.log('Weiterleitungen OK (4 Seiten)');
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
