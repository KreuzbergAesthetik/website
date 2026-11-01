import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Prüft, welcher Akte ein eingehendes Formular zugeordnet wird (formularImport).
// Ausschließlich erfundene Daten.
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
  await page.waitForFunction(() => window.KA && window.KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });

  const res = await page.evaluate(async () => {
    const out = {};
    let asked = [];
    window.kaConfirm = async (msg) => { asked.push(String(msg)); return true; };
    window.kaPrompt = async () => '';
    const mk = (id, vorname, nachname, dob, extra) => Object.assign({ id, nr: id, vorname, nachname, dob, medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() }, extra || {});
    const anm = (vorname, nachname, dob, email) => ({ d: { format: 'ka-formular', version: 1, typ: 'anmeldung', patient: { vorname, nachname, dob, email: email || '', phone: '' }, angaben: {}, extra: [] }, pdf: null });
    const reset = list => { patients.length = 0; events.length = 0; list.forEach(p => patients.push(p)); asked = []; };

    // 1) Gleicher Name, gleiches Geburtsdatum: dieselbe Akte, nichts neu angelegt.
    reset([mk(1, 'Anna', 'Muster', '01.02.1990')]);
    await formularImport([anm('Anna', 'Muster', '01.02.1990', 'anna@example.invalid')]);
    out.gleicheAkte = patients.length === 1 && patients[0].email === 'anna@example.invalid';

    // 2) Titel und Groß-/Kleinschreibung spielen keine Rolle.
    reset([mk(1, 'Anna', 'Muster', '01.02.1990')]);
    await formularImport([anm('anna', 'muster', '01.02.1990')]);
    out.schreibweiseGrossKlein = patients.length === 1;

    // 3) Gleicher Name, anderes Geburtsdatum: zwei verschiedene Personen, keine Vermischung.
    reset([mk(1, 'Anna', 'Muster', '01.02.1990', { phone: '+49111' })]);
    await formularImport([anm('Anna', 'Muster', '09.09.1985', 'andere@example.invalid')]);
    out.andereGeburtsdatumGetrennt = patients.length === 2 && !patients[0].email && patients[0].phone === '+49111';

    // 4) Anamnese mit bekanntem Code: Zuordnung über den Code, ohne Rückfrage.
    reset([mk(1, 'Berta', 'Probe', '03.04.1980', { code: 'ABC123' })]);
    await formularImport([{ d: { format: 'ka-formular', version: 1, typ: 'anamnese', patient: { code: 'ABC123' }, zusammenfassung: { allergien: 'keine', medikamente: '', diagnosen: [], hinweise: [] }, extra: [] }, pdf: null }]);
    out.codeBekannt = patients.length === 1 && asked.length === 0 && patients[0].log.some(l => /Anamnese/.test(l.text));

    // 5) Anamnese mit unbekanntem Code: die App fragt, statt still eine Akte zu wählen.
    reset([mk(1, 'Berta', 'Probe', '03.04.1980', { code: 'ABC123' })]);
    await formularImport([{ d: { format: 'ka-formular', version: 1, typ: 'anamnese', patient: { code: 'ZZZ999' }, zusammenfassung: { allergien: '', medikamente: '', diagnosen: [], hinweise: [] }, extra: [] }, pdf: null }]);
    out.codeUnbekanntFragt = asked.length >= 1 && /ZZZ999/.test(asked[0]);

    // Bekannte Randfälle (nur Bericht, kein Prüfergebnis):
    // A) Akte ohne Geburtsdatum + gleicher Name
    reset([mk(1, 'Clara', 'Beispiel', '', { phone: '+49222' })]);
    await formularImport([anm('Clara', 'Beispiel', '07.07.1977', 'clara@example.invalid')]);
    out.info_ohneGeburtsdatumVermischt = patients.length === 1;
    // B) abweichende Schreibweise (Umlaut / Tippfehler)
    reset([mk(1, 'Jürgen', 'Müller', '05.05.1970')]);
    await formularImport([anm('Juergen', 'Mueller', '05.05.1970')]);
    out.info_umlautDoppelteAkte = patients.length === 2;
    reset([mk(1, 'Anna', 'Muster', '01.02.1990')]);
    await formularImport([anm('Anne', 'Muster', '01.02.1990')]);
    out.info_tippfehlerDoppelteAkte = patients.length === 2;
    return out;
  });

  const pflicht = ['gleicheAkte', 'schreibweiseGrossKlein', 'andereGeburtsdatumGetrennt', 'codeBekannt', 'codeUnbekanntFragt'];
  for (const k of pflicht) assert.equal(res[k], true, `Formular-Zuordnung: ${k}`);
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Formular-Zuordnung OK', JSON.stringify(Object.fromEntries(pflicht.map(k => [k, res[k]]))));
  console.log('Bekannte Randfälle (nur Bericht):', JSON.stringify(Object.fromEntries(Object.entries(res).filter(([k]) => k.startsWith('info_')))));
} finally {
  await browser.close();
}
