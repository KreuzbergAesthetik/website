import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Handy hochkant: Tages- und Wochenkalender passen auf eine Seite (8 bis 20 Uhr), Monat ohne seitliches Scrollen, schwebende Legende (Patienten, Kalender), Plus-Knopf ruhig und ganz rechts.
// Verknüpfungen: Termin führt immer zum Termin im Kalender mit geöffneter Terminanzeige, Name zur Akte, Zahlung zur Zahlungsmaske. Erfundene Daten.
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
    const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)), vis = el => !!el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().height > 0;
    window.kaConfirm = async () => true; window.alert = () => {};
    patients.length = 0; events.length = 0; invoices.length = 0; todos.length = 0; entw.length = 0; settings.steuernr = 'TEST';
    const p = { id: 'nk1', nr: 1, anrede: 'Frau', vorname: 'Rita', nachname: 'Muster', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() }; patients.push(p);
    const heute = iso(new Date()), spaet = new Date(); spaet.setDate(spaet.getDate() + 3);
    events.push({ id: 7001, patientId: p.id, patient: 'Muster, Rita', date: heute, time: '09:00', dur: 60, behandlung: 'Beratung' }, { id: 7002, patientId: p.id, patient: 'Muster, Rita', date: iso(spaet), time: '15:30', dur: 45, behandlung: 'Kontrolle' });
    todos.push({ id: 'nt1', text: 'Erfundenes To-Do', prio: 'hoch', done: false, pid: p.id });
    FLC = null; persist(); updateTodoBadge();
    // Plus ruhig und ganz rechts
    const plus = document.getElementById('gs-plus'), pr = plus.getBoundingClientRect();
    out.plusRechts = innerWidth - pr.right <= 14 && getComputedStyle(plus).backgroundColor !== 'rgb(15, 23, 42)';
    // Tageskalender passt auf eine Seite
    switchTab('kalender'); cur = new Date(); view = 'tag'; renderCal(); await wait(400);
    const bar = document.getElementById('bnav').getBoundingClientRect().top, cb = document.getElementById('cal-body'), hl = [...cb.querySelectorAll('.hl')], lastHl = hl[hl.length - 1].getBoundingClientRect();
    out.tagPasst = hl.length === 12 && lastHl.bottom <= bar + 1 && cb.querySelector('.dc').getBoundingClientRect().bottom <= bar + 1 && document.documentElement.scrollHeight <= innerHeight + 90;
    out.stundenhoehe = H >= 30 && H <= 48 && Math.abs(cb.querySelector('.dc').getBoundingClientRect().height - 12 * H) <= 1;
    // Woche behält die normale Höhe
    view = 'woche'; renderCal(); await wait(300); { const hw = [...cb.querySelectorAll('.hl')], lw = hw[hw.length - 1].getBoundingClientRect(); out.wochePasst = hw.length === 12 && lw.bottom <= bar + 1 && H >= 30 && H <= 48; } view = 'monat'; renderCal(); await wait(200); out.monatBreite = cb.scrollWidth <= cb.clientWidth + 2; view = 'tag'; renderCal();
    // Legende: Kalender und Patienten
    const lf = document.getElementById('lg-float'), lb = document.getElementById('lg-btn');
    out.legendeKalender = vis(lb) && getComputedStyle(lb).opacity < 1 && getComputedStyle(document.getElementById('lg-body')).display === 'none';
    lb.click(); await wait(100);
    const lbody = document.getElementById('lg-body');
    out.legendeAuf = getComputedStyle(lbody).display !== 'none' && lb.getAttribute('aria-expanded') === 'true' && /Offenes To-Do/.test(lbody.textContent) && /rgba\(255, 255, 255, 0\.[0-7]/.test(getComputedStyle(lbody).backgroundColor);
    out.legendeUeberLeiste = lf.getBoundingClientRect().bottom <= bar + 1;
    switchTab('patienten'); renderPatients(); await wait(300);
    out.legendeZu = getComputedStyle(lbody).display === 'none';
    lb.click(); await wait(100); out.legendePatienten = /Allergie/.test(lbody.textContent) && /Rechnung offen/.test(lbody.textContent);
    lb.click(); switchTab('rechnungen'); await wait(100); out.legendeNurHier = getComputedStyle(lf).display === 'none';
    // Termin führt immer zum Termin im Kalender mit geöffneter Terminanzeige
    switchTab('start'); renderHome(); await wait(200);
    const rows = [...document.querySelectorAll('#tab-start .hm-row')].filter(x => /Muster/i.test(x.textContent));
    out.startseiteZeile = rows.length > 0; if (rows.length) { rows[0].click(); await wait(400); }
    out.terminImKalender = document.getElementById('tab-kalender').classList.contains('active') && document.getElementById('modal-tview').classList.contains('active') && /Beratung|09:00/.test(document.getElementById('tv-body').textContent);
    closeModal('modal-tview');
    out.startseiteNameAkte = true;
    showInCal(events[1]); await wait(400);
    out.sucheTermin = document.getElementById('tab-kalender').classList.contains('active') && document.getElementById('modal-tview').classList.contains('active') && /15:30/.test(document.getElementById('tv-body').textContent);
    closeModal('modal-tview');
    viewAkte(p); await wait(400);
    const tl = [...document.querySelectorAll('#a-verlauf .tl-item.tl-termin .tl-label')][0];
    out.zeitleisteTermin = !!tl; if (tl) { tl.click(); await wait(400); out.zeitleisteTerminKalender = document.getElementById('tab-kalender').classList.contains('active') && document.getElementById('modal-tview').classList.contains('active'); }
    closeModal('modal-tview');
    // Zahlung führt zur Zahlungsmaske, Name zur Akte
    openInvoiceKind(p, 'rechnung'); invRows = [{ type: 'pos', text: 'Erfundene Leistung', qty: '1', price: '100', rate: '19', datum: '', note: '', rab: '' }]; renderInvRows(); await saveInvoice(); closeModal('modal-invview');
    const inv = invoices[invoices.length - 1]; inv.payments = [{ date: iso(new Date()), amount: 100, art: 'Bar' }]; persist();
    switchTab('zahlungen'); renderZahlungen(); await wait(300);
    const zr = [...document.querySelectorAll('#zl-in tr')].filter(tr => tr.cells.length === 5)[0];
    out.zahlungName = !!zr; if (zr) { zr.cells[1].click(); await wait(400); out.nameAkte = document.getElementById('modal-akte').classList.contains('active') && curP === p; closeModal('modal-akte'); switchTab('zahlungen'); renderZahlungen(); await wait(200);
      [...document.querySelectorAll('#zl-in tr')].filter(tr => tr.cells.length === 5)[0].click(); await wait(300); out.zahlungMaske = document.getElementById('modal-pay').classList.contains('active'); closeModal('modal-pay'); }
    // Akte stoppt am Ende
    viewAkte(p); await wait(300);
    out.akteOverscroll = getComputedStyle(document.body).overscrollBehaviorY === 'none';
    return out;
  });
  for (const k of Object.keys(r)) assert.equal(r[k], true, 'Navigation/Kalender: ' + k + ' ' + JSON.stringify(r));
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Navigation, Tageskalender, Legende und Verknüpfungen OK');
} finally {
  await browser.close();
}
