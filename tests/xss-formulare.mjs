import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Webformulare sind öffentlich: Was dort eingetragen wird, darf in der App nie als Code ausgeführt werden.
// Der Test importiert Formulare mit Schadcode in allen Feldern und öffnet danach alle wichtigen Ansichten.
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
    const X = n => '<img src="x-' + n + '" onerror="window.__xss=(window.__xss||[]).concat(\'' + n + '\')">';
    const Y = n => '"><svg onload="window.__xss=(window.__xss||[]).concat(\'' + n + '\')">';
    const wait = ms => new Promise(r => setTimeout(r, ms));
    window.kaConfirm = async () => true;
    window.kaPrompt = async () => '';
    patients.length = 0; events.length = 0;

    await formularImport([
      { d: { format: 'ka-formular', version: 1, typ: 'anmeldung', patient: { anrede: 'Frau', titel: X('titel'), vorname: 'Eva' + X('vorname'), nachname: 'Probe' + Y('nachname'), dob: '02.03.1991', strasse: X('strasse'), nr: '1', plz: '10999', stadt: Y('stadt'), phone: '+4930' + X('phone'), email: 'eva@example.invalid' + X('email'), notfall: X('notfall') }, angaben: { quelle: X('quelle'), chronisch: X('chronisch'), medikamente: X('medikament'), fragen: { allergien: { ja: true, text: X('allergie') }, vorbeh: { ja: true, text: X('vorbeh') }, ops: { ja: true, text: X('ops') } } }, extra: [{ l: X('extraL'), v: X('extraV'), label: X('extraLabel'), value: X('extraValue') }] }, pdf: null },
      { d: { format: 'ka-formular', version: 1, typ: 'erinnerung', patient: { vorname: 'Eva' + X('vorname'), nachname: 'Probe' + Y('nachname'), dob: '02.03.1991', email: 'eva2@example.invalid' + X('email2') }, einwilligung: 'ja', extra: [] }, pdf: null },
      { d: { format: 'ka-formular', version: 1, typ: 'anamnese', patient: { code: 'XSS234' }, zusammenfassung: { allergien: X('az'), medikamente: X('am'), diagnosen: [X('ad')], hinweise: [X('ah')] }, extra: [] }, pdf: null },
      { d: { format: 'ka-formular', version: 1, typ: 'aufklaerung', patient: { code: 'XSS234' }, dokument: { id: 'x', titel: X('doktitel') }, fragen: X('fragen'), extra: [] }, pdf: null }
    ]);
    await wait(400);
    const p = patients.find(x => /^Eva/.test(x.vorname));
    if (!p) return { error: 'Patient nicht angelegt' };
    const today = iso(new Date());
    events.push({ id: 9901, date: today, time: '10:00', dur: 60, patientId: p.id, patient: nameKey(p), behandlung: X('behandlung'), notiz: X('termnotiz'), color: '#16a34a' });
    persist();

    const steps = [];
    const step = async (name, fn) => { try { await fn(); } catch (e) { steps.push(name + ': ' + e.message); } await wait(250); };
    await step('start', () => { switchTab('start'); renderHome && renderHome(); });
    for (const t of ['kalender', 'patienten', 'todos', 'rechnungen']) await step(t, () => switchTab(t));
    for (const v of ['tag', 'woche', 'monat']) await step('kalender-' + v, () => { switchTab('kalender'); setView(v); });
    await step('termin', () => openTerminView(9901));
    await step('suche', () => { const i = document.getElementById('gs-in'); i.value = 'eva'; gsRun(); });
    await step('akte', () => viewAkte(p));
    for (const t of ['akte', 'anl', 'fin']) await step('akte-' + t, () => setAkTab(t));
    await wait(600);
    // Gegenprobe: absichtlich eingefügter Schadcode muss erkannt werden, sonst ist der Test wertlos.
    const probe = document.createElement('div'); probe.innerHTML = X('gegenprobe'); document.body.appendChild(probe);
    await wait(600); probe.remove();
    const all = window.__xss || [];
    return { xss: all.filter(n => n !== 'gegenprobe'), control: all.includes('gegenprobe'), steps };
  });

  assert.ok(!res.error, res.error);
  assert.equal(res.control, true, 'Gegenprobe nicht erkannt: Test kann Schadcode nicht feststellen');
  assert.deepEqual(res.xss, [], 'Schadcode aus Webformularen wurde ausgeführt: ' + JSON.stringify(res.xss));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('XSS-Schutz Webformulare OK', res.steps.length ? '(Hinweise: ' + res.steps.join('; ') + ')' : '');
} finally {
  await browser.close();
}
