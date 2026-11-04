import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// GOÄ: Leistung mit mehreren GOÄ-Positionen und Präparat als Auslage (§ 10). Der Festpreis bleibt,
// ein gemeinsamer Steigerungsfaktor wird zurückgerechnet. Ausschließlich erfundene Beispielwerte.
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
    settings.katalog = (settings.katalog || []).filter(k => !/^Probe/.test(k.name));

    // Leistungsfenster: drei Positionen aus der Liste und Präparat
    openLeist(-1);
    out.vorschlaege = document.getElementById('ls-goae-pick').options.length === GOAE_VORSCHLAEGE.length + 1;
    document.getElementById('ls-name').value = 'Probeleistung GOÄ';
    document.getElementById('ls-price').value = '169,00';
    document.getElementById('ls-rate').value = '19';
    lsGoaePick('1'); lsGoaePick('5'); lsGoaePick('268');
    out.hinweis = /beidseitig/.test(document.getElementById('ls-goae-hint').textContent);
    lsGoaePick('267');
    lsFaktorInfo(); out.konflikt267 = /267 und 268 nicht nebeneinander/.test(document.getElementById('ls-faktor').textContent);
    LS_POS.splice(2, 1); lsPosRender();
    document.getElementById('ls-ausl-text').value = 'Präparat Probe';
    document.getElementById('ls-ausl').value = '40,00';
    lsFaktorInfo();
    out.faktorText = document.getElementById('ls-faktor').textContent;
    saveLeist();
    const k = settings.katalog.find(x => x.name === 'Probeleistung GOÄ');
    out.katalog = !!k && k.goaePos.map(p => p.nr).join(',') === '1,5,267' && k.auslageNet === 40 && k.auslageText === 'Präparat Probe';

    // Nr. 3 neben Nr. 267: Hinweis
    openLeist(settings.katalog.indexOf(k)); lsGoaePick('3'); lsFaktorInfo();
    out.konflikt3 = /Nr\. 3 ist nur allein/.test(document.getElementById('ls-faktor').textContent);
    closeModal('modal-leist');

    // Ältere Leistung mit nur einer Nummer wird weiter verstanden
    settings.katalog.push({ name: 'Probe alt', price: 11.9, rate: 19, goae: '252', pkt: 40 });

    // Akte mit Honorarvereinbarung
    const p = { id: 'g1', nr: 1, anrede: 'Frau', vorname: 'Gina', nachname: 'Beispiel', dob: '01.02.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(p); viewAkte(p); toggleStamm();
    document.getElementById('se-honorarVom').value = '28.10.2026'; toggleStamm();
    out.akteFeld = p.honorarVom === '28.10.2026' && (p.audit || []).some(a => /Honorarvereinbarung/.test(JSON.stringify(a)));
    closeModal('modal-akte');

    // Rechnung: eine Zeile „Probeleistung GOÄ“ wird zu drei GOÄ-Positionen + Auslage
    openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Probeleistung GOÄ', qty: '1', price: '169,00', rate: '19', datum: '', note: '', rab: '' }, { type: 'pos', text: 'Probe alt', qty: '1', price: '11,90', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    const inv = invoices[invoices.length - 1];
    out.positionen = inv.items.map(i => (i.goae ? i.goae.nr : i.auslage ? 'Auslage' : '-') + ':' + i.amount).join(' | ');
    out.faktor = inv.items[0].goae && inv.items[0].goae.faktor;
    out.honorar = inv.honorarVom;
    out.total = inv.total;
    viewInvoice(inv.id);
    const txt = document.getElementById('inv-view').innerText;
    const g0 = inv.items[0].goae, fx = String(g0.faktor).replace('.', ','), gb = nf(g0.gebuehr);
    out.ansicht = /GOÄ Nr\. 267/.test(txt) && /80 Punkte/.test(txt) && txt.includes('Faktor ' + fx) && txt.includes('Gebühr ' + gb + ' €') && /Auslage nach § 10 GOÄ: Präparat Probe/.test(txt) && /Behandlung: Probeleistung GOÄ/.test(txt);
    out.goaeSumme = r2(inv.items.filter(i => (i.goae && i.goae.nr !== '252') || i.auslage).reduce((a, i) => a + i.amount, 0));
    out.gebuehrExakt = inv.items.filter(i => i.goae).every(i => r2(i.goae.pkt * GOAE_PW * i.goae.faktor) === i.goae.gebuehr);
    out.hinweisText = /Auslagen \(Präparate\) nach § 10 GOÄ/.test(txt) && /Honorarvereinbarung nach § 2 GOÄ vom 28\.10\.2026/.test(txt) && /Leistungen auf Verlangen \(§ 1 Abs\. 2 Satz 2 GOÄ\)/.test(txt);
    try { out.pdf = !!(await Promise.resolve(buildInvoicePdf(inv, null))); } catch (e) { out.pdf = 'Fehler ' + e.message; }

    // Unversendete Rechnung bearbeiten und speichern: GOÄ-Angaben bleiben erhalten
    editInvoice(); await saveInvoice();
    const inv2 = invoices.find(i => i.id === inv.id);
    out.bearbeitenErhaelt = inv2.items.filter(i => i.goae).length === 4 && inv2.items.some(i => i.auslage) && inv2.total === inv.total;
    closeModal('modal-invview');

    // Ohne Honorarvereinbarung bei Faktor > 2,3: Rückfrage
    const q = { id: 'g2', nr: 2, anrede: 'Herr', vorname: 'Gero', nachname: 'Probe', adresse: 'Teststraße 2\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() };
    patients.push(q); asked.length = 0;
    openInvoiceKind(q, 'rechnung'); invRows = [{ type: 'pos', text: 'Probeleistung GOÄ', qty: '1', price: '169,00', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    out.warnung = asked.some(a => /keine Honorarvereinbarung/.test(a));
    closeModal('modal-invview');

    // Präparat teurer als Preis: Abbruch mit Hinweis
    const alerts = []; const oa = window.alert; window.alert = m => alerts.push(String(m));
    settings.katalog.push({ name: 'Probe teuer', price: 20, rate: 19, goaePos: [{ nr: '267', pkt: 80, text: '' }], auslageNet: 50 });
    const n0 = invoices.length;
    openInvoiceKind(q, 'rechnung'); invRows = [{ type: 'pos', text: 'Probe teuer', qty: '1', price: '20', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    out.teuerAbbruch = invoices.length === n0 && alerts.some(a => /Präparat mehr als der Preis/.test(a));
    window.alert = oa; closeModal('modal-inv');

    // Freie Position ohne GOÄ bleibt eine Zeile
    openInvoiceKind(q, 'rechnung'); invRows = [{ type: 'pos', text: 'Freie Position', qty: '1', price: '50', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice();
    const fr = invoices[invoices.length - 1];
    out.ohneGoae = fr.items.length === 1 && !fr.items[0].goae && !goaeNote(fr);
    closeModal('modal-invview');
    return out;
  });

  // 169 € brutto / 1,19 = 142,02 € netto − 40 € Präparat = 102,02 €; 240 Punkte × 5,82873 Cent = 13,99 € → Faktor rund 7,29 (4 Stellen)
  assert.ok(r.faktor > 7.28 && r.faktor < 7.31 && Math.round(r.faktor * 10000) / 10000 === r.faktor, 'Faktor falsch: ' + JSON.stringify(r));
  // Festpreis exakt: 169,00 € für die GOÄ-Leistung samt Präparat, dazu 11,90 € alte Leistung; jede Gebühr = Punkte × Punktwert × Faktor
  assert.equal(r.goaeSumme, 169, 'Festpreis nicht exakt: ' + JSON.stringify(r));
  assert.equal(r.total, 180.9, 'Summe falsch: ' + JSON.stringify(r));
  assert.equal(r.gebuehrExakt, true, 'Gebühr passt nicht zum Faktor: ' + JSON.stringify(r));
  for (const k of ['vorschlaege', 'hinweis', 'konflikt267', 'katalog', 'konflikt3', 'akteFeld', 'ansicht', 'hinweisText', 'pdf', 'bearbeitenErhaelt', 'warnung', 'teuerAbbruch', 'ohneGoae'])
    assert.equal(r[k], true, 'GOÄ: ' + k + ' ' + JSON.stringify(r));
  assert.match(r.positionen, /^1:[\d.]+ \| 5:[\d.]+ \| 267:[\d.]+ \| Auslage:47\.6 \| 252:11\.9$/);
  assert.equal(r.honorar, '28.10.2026');
  assert.match(r.faktorText, /^Faktor 7,29\d*:/);
  assert.match(r.faktorText, /Rechnung brutto 169,00 €\./);
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('GOÄ OK', r.faktorText);
} finally {
  await browser.close();
}
