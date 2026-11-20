import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Sitzung merken: Nach dem Entsperren übersteht die App ein Neuladen ohne Passwort (bis 20 Minuten nach der letzten Nutzung).
// "App sperren", Ablauf und Abschalten beenden die Sitzung. Erfundene Daten.
const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
const pageErrors = [];
const PW = 'CiAppPasswort-123!';
const offen = page => page.waitForFunction(() => window.KA && KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });
const gesperrt = async page => { await page.waitForFunction(() => window.alResuming === false || !window.alResuming, null, { timeout: 15000 }); await page.waitForTimeout(400); return page.evaluate(() => document.documentElement.classList.contains('locked')); };
const sitzung = page => page.evaluate(() => new Promise(res => { const r = indexedDB.open('ka-sitzung', 1); r.onupgradeneeded = () => r.result.createObjectStore('s'); r.onsuccess = () => { const db = r.result, q = db.transaction('s').objectStore('s').get('k'); q.onsuccess = () => { const v = q.result; db.close(); res(v ? { exp: v.exp, istSchluessel: v.key instanceof CryptoKey, exportierbar: v.key && v.key.extractable } : null); }; }; }));
try {
  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  // localStorage nur beim allerersten Laden leeren, damit Neuladen die Einrichtung behält
  await context.addInitScript(() => { try { if (!sessionStorage.getItem('t-init')) { localStorage.clear(); sessionStorage.setItem('t-init', '1'); } } catch {} });
  const page = await context.newPage(); page.on('pageerror', e => pageErrors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#al-pw', PW); await page.fill('#al-pw2', PW); await page.click('#al-submit');
  await offen(page);
  await page.evaluate(() => { patients.push({ id: 'sm1', nr: 1, anrede: 'Frau', vorname: 'Sina', nachname: 'Sitzung', medikation: [], log: [], doku: [], dokumente: [], bilder: [], erstellt: Date.now() }); persist(); });
  await page.waitForTimeout(600);
  const s1 = await sitzung(page);
  assert.ok(s1 && s1.istSchluessel && s1.exportierbar === false, 'Sitzung mit nicht exportierbarem Schlüssel gespeichert: ' + JSON.stringify(s1));
  assert.ok(s1.exp > Date.now() + 19 * 60000 && s1.exp <= Date.now() + 20 * 60000 + 5000, 'Ablauf nach 20 Minuten: ' + JSON.stringify(s1));
  assert.equal(await page.evaluate(() => !!localStorage.getItem('ka_lock') && !Object.keys(localStorage).some(k => /sitzung/i.test(k))), true, 'kein Schlüssel im localStorage');
  // 1. Neuladen: ohne Passwort offen, Daten lesbar
  await page.reload({ waitUntil: 'networkidle' });
  await offen(page);
  assert.equal(await page.evaluate(() => patients.some(p => p.nachname === 'Sitzung')), true, 'Daten nach Neuladen lesbar');
  // 2. App sperren beendet die Sitzung
  await page.evaluate(() => alLockNow()); await page.waitForTimeout(400);
  assert.equal(await sitzung(page), null, 'Sperren löscht die Sitzung');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await gesperrt(page), true, 'nach Sperren und Neuladen gesperrt');
  await page.fill('#al-pw', PW); await page.click('#al-submit'); await offen(page); await page.waitForTimeout(400);
  // 3. Abgelaufene Sitzung: gesperrt
  await page.evaluate(() => new Promise(res => { const r = indexedDB.open('ka-sitzung', 1); r.onsuccess = () => { const db = r.result, st = db.transaction('s', 'readwrite').objectStore('s'), q = st.get('k'); q.onsuccess = () => { const v = q.result; v.exp = Date.now() - 1000; st.put(v, 'k'); st.transaction.oncomplete = () => { db.close(); res(); }; }; }; }));
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await gesperrt(page), true, 'abgelaufene Sitzung bleibt gesperrt');
  assert.equal(await sitzung(page), null, 'abgelaufene Sitzung wird gelöscht');
  await page.fill('#al-pw', PW); await page.click('#al-submit'); await offen(page); await page.waitForTimeout(400);
  // 4. Abgeschaltet: kein Speichern, Neuladen fragt wieder
  await page.evaluate(() => alSessSet(false)); await page.waitForTimeout(300);
  assert.equal(await sitzung(page), null, 'Abschalten löscht die Sitzung');
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await gesperrt(page), true, 'abgeschaltet: nach Neuladen gesperrt');
  await page.fill('#al-pw', PW); await page.click('#al-submit'); await offen(page); await page.waitForTimeout(400);
  assert.equal(await sitzung(page), null, 'abgeschaltet: nach Entsperren keine Sitzung');
  // 5. Wieder einschalten über das Menü Sicherheit
  await page.evaluate(() => { window.kaConfirm = async () => true; });
  await page.evaluate(async () => { fillNavMenu && fillNavMenu(); });
  const label = await page.evaluate(() => { const b = [...document.querySelectorAll('#nav-menu [data-ka-lock] span')].map(x => x.textContent).find(t => /Sitzung merken/.test(t)); return b || ''; });
  assert.match(label, /Sitzung merken \(20 Min\.\): aus/, 'Menüeintrag zeigt aus');
  await page.evaluate(() => alSessSet(true)); await page.waitForTimeout(300);
  assert.ok(await sitzung(page), 'Einschalten speichert die Sitzung sofort');
  assert.deepEqual(pageErrors, [], 'JavaScript-Fehler im Browser');
  console.log('Sitzung merken OK (Neuladen ohne Passwort, Sperren, Ablauf, Abschalten, Menü)');
} finally {
  await browser.close();
}
