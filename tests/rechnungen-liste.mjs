import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Rechnungsliste: zwei Zeilen je Eintrag auf gleicher Höhe (Nr./Nachname/Betrag, Datum/Vorname/bezahlt am oder offen), Briefsymbol als Versandfilter,
// Stornorechnung und Original sichtbar verbunden, Plus-Knöpfe mit Symbol, Praxis-Menü in Karten. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
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
    window.kaConfirm = async () => true; window.alert = () => {};
    patients.length = 0; invoices.length = 0; entw.length = 0; events.length = 0; settings.steuernr = 'TEST';
    const p = { id: 'rl1', nr: 1, vorname: 'Rita', nachname: 'Muster', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() }; patients.push(p);
    const create = async price => { openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Erfundene Leistung', qty: '1', price: String(price), rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice(); closeModal('modal-invview'); return invoices[invoices.length - 1]; };
    const a = await create(100), b = await create(120); b.sentAt = Date.now(); persist();
    viewInvoice(b.id); editInvoice(); await wait(400); closeModal('modal-inv');
    const c = await create(80); c.payments = [{ date: iso(new Date()), amount: 80, art: 'bar' }]; persist();
    switchTab('rechnungen'); renderInvoices(); await wait(300);
    out.sendSegWeg = !document.getElementById('inv-send-seg');
    const eb = document.getElementById('inv-send-flt'); out.briefKnopf = !!eb && eb.getBoundingClientRect().width > 0;
    const rows = [...document.querySelectorAll('#inv-table tr[data-nr]')];
    out.zeilen = rows.length;
    const top = (el) => el ? Math.round(el.getBoundingClientRect().top) : -1;
    out.gleicheHoehe = rows.every(tr => { const c0 = tr.cells[0], c1 = tr.cells[1], c2 = tr.cells[2]; const l1 = [c0.querySelector('.inv-l1'), c1.querySelector('.inv-l1'), c2.querySelector('.inv-l1')].map(top), l2 = [c0.querySelector('.inv-l2'), c1.querySelector('.inv-l2'), c2.querySelector('.inv-l2')].map(top); return l1.every(x => Math.abs(x - l1[0]) <= 1) && l2.every(x => Math.abs(x - l2[0]) <= 1) && l2[0] > l1[0]; });
    const t0 = rows.find(tr => /muster/i.test(tr.cells[1].textContent));
    out.namenGetrennt = /Muster/i.test(t0.cells[1].querySelector('.inv-l1').textContent) && /Rita/.test(t0.cells[1].querySelector('.inv-l2').textContent) && !/Rita/.test(t0.cells[1].querySelector('.inv-l1').textContent);
    const paid = rows.find(tr => tr.dataset.nr === c.nr); out.bezahltDatum = /\d{2}\.\d{2}\.\d{4}/.test(paid.cells[2].querySelector('.inv-l2').textContent);
    const open = rows.find(tr => tr.dataset.nr === a.nr); out.offen = /Offen/i.test(open.cells[2].querySelector('.inv-l2').textContent);
    const sb = invoices.find(i => i.stornoFor === b.nr);
    const rs = rows.find(tr => tr.dataset.nr === sb.nr), ro = rows.find(tr => tr.dataset.nr === b.nr);
    out.stornoVerbunden = rs.classList.contains('t-link') && ro.classList.contains('t-link') && ((rs.classList.contains('pair-top') && ro.classList.contains('pair-bot')) || (ro.classList.contains('pair-top') && rs.classList.contains('pair-bot'))) && !!rs.querySelector('.inv-link') && !!ro.querySelector('.inv-link');
    out.grauerStrich = rs.classList.contains('t-storno') && ro.classList.contains('t-storno') && getComputedStyle(rs.cells[0]).boxShadow.includes('148, 163, 184') && getComputedStyle(ro.cells[0]).boxShadow.includes('148, 163, 184') && getComputedStyle(rs.cells[0]).paddingLeft === getComputedStyle(rows.find(tr => tr.dataset.nr === a.nr).cells[0]).paddingLeft;
    out.keinLinkBeiAnderen = !rows.find(tr => tr.dataset.nr === a.nr).classList.contains('t-link');
    // Versandfilter durchschalten
    const n0 = document.querySelectorAll('#inv-table tr[data-nr]').length;
    eb.click(); await wait(100); const nJa = document.querySelectorAll('#inv-table tr[data-nr]').length;
    eb.click(); await wait(100); const nNein = document.querySelectorAll('#inv-table tr[data-nr]').length;
    eb.click(); await wait(100); const n3 = document.querySelectorAll('#inv-table tr[data-nr]').length;
    out.filter = nJa === 1 && nNein === n0 - 1 && n3 === n0 && document.getElementById('inv-send-flt').title.length > 10;
    out.plusSymbole = !!document.querySelector('#inv-b-new svg') && !!document.querySelector('.cal-plus svg') && !document.querySelector('#inv-b-new').textContent.trim() && !document.querySelector('.cal-plus').textContent.trim();
    // Praxis-Menü als Karten
    toggleNavMenu({ stopPropagation() {}, currentTarget: document.getElementById('btn-praxis'), target: document.getElementById('btn-praxis') }); await wait(200);
    const secs = [...document.querySelectorAll('#nav-menu .nav-section')];
    out.menueKarten = secs.length >= 3 && secs.every(x => parseFloat(getComputedStyle(x).borderTopLeftRadius) >= 10 && parseFloat(getComputedStyle(x).marginBottom) >= 0) && new Set(secs.map(x => getComputedStyle(x).borderLeftColor)).size >= 3;
    return out;
  });
  for (const k of Object.keys(r)) if (k !== 'zeilen') assert.equal(r[k], true, 'Rechnungsliste: ' + k + ' ' + JSON.stringify(r));
  assert.ok(r.zeilen >= 4, 'zu wenige Zeilen ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Rechnungsliste OK (' + r.zeilen + ' Zeilen, Versandfilter, Storno-Verbindung, Plus-Symbole, Menü-Karten)');
} finally {
  await browser.close();
}
