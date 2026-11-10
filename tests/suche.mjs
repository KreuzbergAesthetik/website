import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Suchleiste: findet Patienten (Name, Nummer, Anschrift, Code), Rechnungen (Nummer, Name, Betrag), Termine, To-Dos, Lager, Anlagen und Leistungen.
// Die Treffer öffnen das passende Ziel, Eingaben werden nicht als HTML ausgeführt. Ausschließlich erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
const page = await context.newPage();
const pageErrors = [];
page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
  await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
  const r = await page.evaluate(async () => {
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms));
    patients.length = 0; invoices.length = 0; events.length = 0; todos.length = 0; lager.produkte.length = 0; lager.chargen.length = 0;
    const p = { id: 's1', nr: 7, anrede: 'Frau', vorname: 'Sophie', nachname: 'Suchbeispiel', dob: '02.03.1991', phone: '030 1234567', adresse: 'Probeweg 5\n10999 Berlin', code: 'ABC234', medikation: [], log: [], doku: [], dokumente: [{ id: 'd1', name: 'Befundbogen-Probe.pdf' }], bilder: [], erstellt: Date.now() };
    patients.push(p);
    settings.steuernr = 'TEST';
    openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Probebehandlung Zebra', qty: '1', price: '123,45', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice(); closeModal('modal-invview');
    invoices[invoices.length - 1].nr = '2026-04711';
    events.push({ id: 91, patientId: 's1', patient: nameKey(p), date: '2099-01-05', time: '10:30', dur: 30, behandlung: 'Probetermin Quokka' });
    todos.push({ id: 't91', text: 'Erfundenes To-Do Narwal', prio: 'mittel', done: false });
    lager.produkte.push({ id: 'pr1', name: 'Probeprodukt Okapi', einheit: 'Stk', min: 1 }); lager.chargen.push({ id: 'c1', pid: 'pr1', nr: 'CH-4242', rest: 3 });
    (settings.katalog = settings.katalog || []).push({ name: 'Probeleistung Wombat', price: 50, rate: 19, goae: '9999' });
    const such = async q => { const i = document.getElementById('gs-in'); i.value = q; gsRun(); await wait(80); const res = document.getElementById('gs-res'); return { heads: [...res.querySelectorAll('.gs-h')].map(x => x.textContent), rows: [...res.querySelectorAll('.gs-r')].map(x => x.textContent), html: res.innerHTML }; };
    out.name = (await such('suchbeisp')).heads.includes('Patienten');
    out.nummer = (await such('#7')).rows.some(x => /SUCHBEISPIEL/.test(x));
    out.anschrift = (await such('probeweg')).rows.some(x => /SUCHBEISPIEL/.test(x));
    out.code = (await such('abc234')).rows.some(x => /SUCHBEISPIEL/.test(x));
    const re = await such('04711'); out.rechnungNr = re.heads.includes('Rechnungen') && re.rows.some(x => /2026-04711/.test(x));
    out.rechnungBetrag = (await such('123,45')).heads.includes('Rechnungen');
    out.rechnungPos = (await such('zebra')).heads.includes('Rechnungen');
    out.termin = (await such('quokka')).heads.includes('Termine');
    out.todo = (await such('narwal')).heads.includes('To-Dos');
    out.lagerName = (await such('okapi')).heads.includes('Lager');
    out.lagerCharge = (await such('ch-4242')).heads.includes('Lager');
    const an = await such('befundbogen'); out.anlage = an.heads.includes('Anlagen') && an.rows.some(x => /Befundbogen-Probe/.test(x));
    out.leistung = (await such('wombat')).heads.includes('Leistungen');
    out.goae = (await such('9999')).heads.includes('Leistungen');
    out.nichts = /Nichts gefunden/.test((await such('qqqqq-gibt-es-nicht')).html);
    // Klick öffnet das Ziel
    await such('04711'); document.querySelector('#gs-res .gs-r').click(); await wait(300);
    out.rechnungOffen = document.getElementById('modal-invview').classList.contains('active'); closeModal('modal-invview');
    await such('narwal'); document.querySelector('#gs-res .gs-r').click(); await wait(300);
    out.todoOffen = !!document.querySelector('.modal-overlay.active') && /Narwal/.test(document.getElementById('to-text').value); try { closeModal('modal-todo'); } catch (e) {}
    await such('suchbeisp'); document.querySelector('#gs-res .gs-r').click(); await wait(300);
    out.akteOffen = document.getElementById('modal-akte').classList.contains('active');
    // HTML in der Eingabe wird nicht ausgeführt
    window.__xss = 0; const x = await such('<img src=x onerror="window.__xss=1">'); out.xss = window.__xss === 0 && !/<img/i.test(x.html.replace(/&lt;img/g, ''));
    // Patienten-Code wird beim Suchen nicht neu erzeugt
    patients.push({ id: 's2', nr: 8, vorname: 'Ohne', nachname: 'Code', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
    await such('ohne'); out.keinNeuerCode = !patients[1].code;
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Suche: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Suche OK (' + Object.keys(r).length + ' Prüfungen: Patienten, Rechnungen, Termine, To-Dos, Lager, Anlagen, Leistungen)');
} finally {
  await browser.close();
}
