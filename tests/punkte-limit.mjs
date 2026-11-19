import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Patientenliste: höchstens drei Hinweis-Punkte untereinander (Allergie oben, mittig ausgerichtet), ab vier wird der dritte zum grauen Plus mit Liste aller Hinweise;
// Spaltenüberschriften stehen links bündig über dem Inhalt (ab 700 px); Antippen der rechten Zone zeigt per Touch die Schnellaktionen. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  for (const [w, h] of [[390, 844], [915, 412]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true });
    await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
    const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
    await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
    const r = await page.evaluate(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
      window.alert = () => {}; patients.length = 0; events.length = 0; todos.length = 0;
      const mkp = (i, n, al) => patients.push({ id: 'pl' + i, nr: i + 1, anrede: 'Frau', vorname: 'Eva', nachname: n, allergien: al, dob: '01.01.1990', phone: '030 1234567', email: 'beispiel@example.invalid', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
      mkp(0, 'Viele', 'Latex'); mkp(1, 'Wenige', 'Nüsse'); mkp(2, 'Keine', '');
      const d = n => { const x = new Date(); x.setDate(x.getDate() + n); return iso(x); };
      events.push({ id: 1, patientId: 'pl0', patient: 'Viele, Eva', date: d(4), time: '11:00', dur: 30, behandlung: 'Kontrolle' });
      todos.push({ id: 't1', text: 'Erfundenes To-Do', prio: 'hoch', done: false, pid: 'pl0' });
      FLC = null; persist(); if (innerWidth < 700) gsCollapse(true, true); switchTab('patienten'); renderPatients(); await wait(500);
      const rows = [...document.querySelectorAll('#patient-table tr')], row = n => rows.find(tr => tr.textContent.includes(n));
      const viele = [...row('VIELE').querySelectorAll('.pt-hints > *')], wenige = [...row('WENIGE').querySelectorAll('.pt-hints > *')];
      out.maxDrei = viele.length === 3 && wenige.length <= 3;
      out.allergieOben = viele[0].classList.contains('d-allergy') && wenige[0].classList.contains('d-allergy');
      out.plusDritter = viele[2].classList.contains('d-more') && viele[2].textContent.trim() === '+' && !wenige.some(x => x.classList.contains('d-more'));
      const a = viele[0].getBoundingClientRect(), t = viele[1].getBoundingClientRect(), m = viele[2].getBoundingClientRect();
      out.mittig = Math.abs((a.left + a.right) / 2 - (t.left + t.right) / 2) <= 1 && Math.abs((a.left + a.right) / 2 - (m.left + m.right) / 2) <= 1 && a.bottom <= t.top + 3 && t.bottom <= m.top + 3;
      out.plusGrau = getComputedStyle(viele[2]).backgroundColor === 'rgba(0, 0, 0, 0)' && Math.abs(m.width - t.width) <= 1;
      viele[2].click(); await wait(200);
      const pop = document.getElementById('pt-hintpop');
      out.liste = !!pop && pop.classList.contains('on') && /Allergie/.test(pop.textContent) && /To-Do/.test(pop.textContent) && /Termin/.test(pop.textContent) && pop.querySelectorAll('.pt-hintrow').length === 4;
      out.akteNichtOffen = !document.getElementById('modal-akte').classList.contains('active');
      document.body.click(); await wait(100); out.listeZu = !pop.classList.contains('on');
      if (innerWidth >= 700) { const hi = document.querySelector('.pt-hi'), ln = row('VIELE').querySelector('.pt-iln'); out.infoLinks = Math.abs(ln.getBoundingClientRect().left - row('VIELE').querySelector('.pt-info').getBoundingClientRect().left) <= 1 && ln.getBoundingClientRect().left - hi.getBoundingClientRect().left <= 20; }
      else out.infoLinks = true;
      if (innerWidth >= 700) {
        const tx = e => { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.trim()) { const g = document.createRange(); g.selectNodeContents(n); return g.getBoundingClientRect().left; } return NaN; };
        const r0 = row('VIELE'), hs = document.querySelectorAll('.pt-hg > *'), th0 = document.querySelector('#tab-patienten table.pt thead th');
        out.ueberschriften = Math.abs(tx(th0) - tx(r0.cells[0])) <= 1 && Math.abs(tx(hs[0]) - tx(r0.querySelector('.pn-row'))) <= 1 && Math.abs(tx(hs[1]) - tx(r0.querySelector('.pt-dobc'))) <= 1 && Math.abs(tx(r0.parentElement.parentElement.querySelector('.pt-hi')) - r0.querySelector('.pt-iln').getBoundingClientRect().left) <= 1;
      } else out.ueberschriften = true;
      if (innerWidth >= 700) {
        const rz = row('VIELE').querySelector('.pt-rz'), q = rz.querySelector('.pt-quick');
        out.quickAus = getComputedStyle(q).opacity === '0';
        rz.click(); await wait(300);
        out.quickAntippen = rz.classList.contains('quick-on') && getComputedStyle(q).opacity === '1' && q.querySelectorAll('.pt-ib').length >= 4 && !document.getElementById('modal-akte').classList.contains('active');
        document.body.click(); await wait(300);
        out.quickZu = !rz.classList.contains('quick-on') && getComputedStyle(q).opacity === '0';
      } else { out.quickAus = out.quickAntippen = out.quickZu = true; }
      return out;
    });
    for (const k of Object.keys(r)) assert.equal(r[k], true, w + 'x' + h + ' Punkte: ' + k + ' ' + JSON.stringify(r));
    await context.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Hinweis-Punkte OK (höchstens drei, Plus mit Liste, mittig zur Allergie, Informationen linksbündig)');
} finally {
  await browser.close();
}
