import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Suche mit Plus-Knopf (Pop-up Termin, Patient, Rechnung). Tablet hochkant: schwebend unten, per Lupe einklappbar. Querformat/Desktop: in der Kopfzeile.
// Handy hochkant: Suche und Plus oben in der Kopfzeile (nicht einklappbar), Hauptnavigation als Leiste unten, Akte-Aktionen darüber. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
try {
  for (const [w, h] of [[390, 844], [820, 1180], [915, 412], [1280, 800]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 900, hasTouch: w < 900 });
    await context.addInitScript(() => { try { localStorage.clear(); } catch {} });
    const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
    await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#al-pw', 'CiAppPasswort-123!'); await page.fill('#al-pw2', 'CiAppPasswort-123!'); await page.click('#al-submit');
    await page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
    const r = await page.evaluate(async () => {
      const box = id => { const e = document.getElementById(id), b = e.getBoundingClientRect(), cs = getComputedStyle(e); return { l: b.left, r: b.right, t: b.top, b: b.bottom, w: b.width, vis: cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 0 }; };
      const wait = ms => new Promise(r => setTimeout(r, ms));
      const out = { vw: innerWidth, vh: innerHeight, bar: box('gs-bar'), lupe: box('gs-lupe'), plus: box('gs-plus'), menuAnfang: getComputedStyle(document.getElementById('gs-menu')).display, lupeAlt: getComputedStyle(document.getElementById('gs-fab')).display };
      out.startZu = out.bar.w < 60; if (out.startZu) { gsCollapse(false); await wait(150); out.bar = box('gs-bar'); out.lupe = box('gs-lupe'); out.plus = box('gs-plus'); }
      // Pop-up-Menü über dem Plus-Knopf
      document.getElementById('gs-plus').click(); await wait(100);
      out.menu = { an: getComputedStyle(document.getElementById('gs-menu')).display, kal: box('gs-kal'), pat: box('gs-pat'), rec: box('gs-rec'), plus: box('gs-plus'), exp: document.getElementById('gs-plus').getAttribute('aria-expanded') };
      document.getElementById('gs-plus').click(); await wait(100);
      out.menuZu = getComputedStyle(document.getElementById('gs-menu')).display;
      // Außerhalb tippen schließt das Menü
      document.getElementById('gs-plus').click(); await wait(50); document.body.click(); await wait(50);
      out.menuAussen = getComputedStyle(document.getElementById('gs-menu')).display;
      // Lupe klappt die Suchleiste ein und wieder auf
      document.getElementById('gs-lupe').click(); await wait(150);
      out.zu = { bar: box('gs-bar'), input: getComputedStyle(document.getElementById('gs-in')).display, plus: box('gs-plus'), exp: document.getElementById('gs-lupe').getAttribute('aria-expanded'), gemerkt: localStorage.getItem('ka_gs_zu') };
      document.getElementById('gs-lupe').click(); await wait(150);
      out.auf = { bar: box('gs-bar'), input: getComputedStyle(document.getElementById('gs-in')).display, exp: document.getElementById('gs-lupe').getAttribute('aria-expanded'), gemerkt: localStorage.getItem('ka_gs_zu') };
      document.getElementById('gs-in').value = ''; document.getElementById('gs-res').style.display = 'none';
      // Untere Hauptnavigation (nur Handy hochkant)
      const bn = document.getElementById('bnav'); out.bnav = { vis: getComputedStyle(bn).display !== 'none', b: bn.getBoundingClientRect().bottom, t: bn.getBoundingClientRect().top, n: bn.querySelectorAll('.bnav-it').length };
      if (out.bnav.vis) {
        todos.length = 0; todos.push({ id: 'ul1', text: 'Erfundenes To-Do', prio: 'hoch', done: false }); updateTodoBadge();
        out.bnav.badge = document.getElementById('bnav-todo-badge').textContent;
        document.getElementById('bnav-rechnungen').click(); await wait(150);
        out.bnav.rech = document.getElementById('tab-rechnungen').classList.contains('active') && document.getElementById('bnav-rechnungen').classList.contains('on') && !document.getElementById('bnav-patienten').classList.contains('on');
        document.getElementById('bnav-mehr').click(); await wait(200);
        const nm = document.getElementById('nav-menu'), nr = nm.getBoundingClientRect(); out.bnav.mehr = getComputedStyle(nm).display !== 'none' && nr.bottom <= out.bnav.t + 1 && nr.top >= 0 && nr.height > 100;
        document.body.click(); await wait(100); out.bnav.mehrZu = getComputedStyle(nm).display === 'none';
        switchTab('zahlungen'); await wait(100); out.bnav.praxisAlsMehr = document.getElementById('bnav-mehr').classList.contains('on');
        out.bnav.kopfReiterWeg = getComputedStyle(document.querySelector('header nav')).display === 'none';
      }
      // Akte: Aktionen über der Leiste, Treffer über der Leiste
      patients.length = 0; patients.push({ id: 'l1', nr: 1, anrede: 'Frau', vorname: 'Anna', nachname: 'Beispiel', dob: '01.01.1990', adresse: 'Teststraße 1\n10999 Berlin', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() });
      viewAkte(patients[0]); await wait(500);
      const af = document.querySelector('.a-fab').getBoundingClientRect(); out.akteAktionen = { b: af.bottom, t: af.top, w: af.width, h: af.height, r: af.right, vis: af.height > 0, n: [...document.querySelectorAll('.a-cats .a-cat')].filter(x => x.offsetHeight).length };
      const inp = document.getElementById('gs-in'); inp.value = 'Anna'; gsRun(); await wait(300);
      const res = document.getElementById('gs-res').getBoundingClientRect(); out.treffer = { t: res.top, b: res.bottom, h: res.height, vis: getComputedStyle(document.getElementById('gs-res')).display !== 'none' };
      return out;
    });
    const ph = w < 700 && h > w, kopf = (w >= 700 && w > h) || ph;
    const tag = `${w}x${h} ${JSON.stringify(r)}`;
    assert.equal(r.startZu, w >= 700 && w < 1000 && w > h, 'Startzustand der Suche ' + tag);
    assert.ok(r.bar.vis && r.bar.w > 100 && r.lupe.vis && r.plus.vis, 'Suchleiste, Lupe oder Plus nicht sichtbar ' + tag);
    assert.equal(r.lupeAlt, 'none', 'alter Lupen-Knopf noch sichtbar ' + tag);
    assert.ok(r.bar.r <= r.plus.l + 1 && r.plus.r <= r.vw && (kopf ? r.bar.t >= 0 && r.bar.b <= 60 : r.vh - r.bar.b <= 24), (kopf ? 'Leiste sitzt nicht in der Kopfzeile ' : 'Leiste sitzt nicht richtig unten ') + tag);
    assert.equal(r.menuAnfang, 'none', 'Menü am Anfang offen ' + tag);
    assert.notEqual(r.menu.an, 'none', 'Menü öffnet nicht ' + tag);
    for (const k of ['kal', 'pat', 'rec']) assert.ok(r.menu[k].vis && (kopf ? r.menu[k].t >= r.menu.plus.b : r.menu[k].b <= r.menu.plus.t) && r.menu[k].l >= 0 && r.menu[k].r <= r.vw && r.menu[k].t >= 0, 'Menüpunkt ' + k + ' nicht sichtbar oder nicht über Plus ' + tag);
    assert.equal(r.menu.exp, 'true', 'aria-expanded fehlt ' + tag);
    assert.equal(r.menuZu, 'none', 'Menü schließt nicht beim zweiten Tipp ' + tag);
    assert.equal(r.menuAussen, 'none', 'Menü schließt nicht beim Tippen daneben ' + tag);
    if (ph) assert.ok(r.zu.bar.w > 100 && r.zu.input !== 'none' && r.zu.gemerkt === null && r.auf.bar.w > 100, 'Handy hochkant: Suche oben darf nicht einklappen ' + tag);
    else {
      assert.ok(r.zu.bar.w < 60 && r.zu.input === 'none' && r.zu.exp === 'false' && r.zu.gemerkt === '1' && r.zu.plus.vis, 'Einklappen funktioniert nicht ' + tag);
      assert.ok(r.auf.bar.w > 100 && r.auf.input !== 'none' && r.auf.exp === 'true' && r.auf.gemerkt === '0', 'Aufklappen funktioniert nicht ' + tag);
    }
    assert.equal(r.bnav.vis, ph, 'Untere Hauptnavigation nur am Handy hochkant ' + tag);
    if (ph) {
      assert.ok(r.bnav.n === 5 && Math.abs(r.bnav.b - r.vh) <= 1 && r.bnav.badge === '1', 'Untere Leiste: 5 Reiter, ganz unten, To-Do-Zähler ' + tag);
      assert.ok(r.bnav.rech && r.bnav.mehr && r.bnav.mehrZu && r.bnav.praxisAlsMehr && r.bnav.kopfReiterWeg, 'Untere Leiste: Umschalten, Mehr-Menü über der Leiste, Praxis-Seiten unter Mehr ' + tag);
      assert.ok(r.akteAktionen.b <= r.bnav.t + 1 && r.akteAktionen.n >= 6, 'Akte-Aktionen über der unteren Leiste, viele Streifen ' + tag);
    }
    assert.ok(r.akteAktionen.h > r.akteAktionen.w && r.akteAktionen.r <= r.vw && r.akteAktionen.t >= 40, 'Akte-Aktionen nicht untereinander oder außerhalb ' + tag);
    assert.ok(r.akteAktionen.vis && (kopf || r.akteAktionen.b <= r.bar.t + 1), 'Akte-Aktionen überdecken die Leiste ' + tag);
    assert.ok(r.treffer.vis && r.treffer.h > 20 && (kopf ? r.treffer.t >= r.bar.b : r.treffer.b <= r.bar.t), 'Trefferliste nicht über der Leiste ' + tag);
    await context.close();
  }
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Untere Leiste OK (Suche, Plus-Menü, Hauptnavigation unten am Handy, Akte-Aktionen; 4 Größen)');
} finally {
  await browser.close();
}
