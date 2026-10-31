import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.APP_URL || 'http://127.0.0.1:4173/index.html';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.addInitScript(() => {
  try { localStorage.clear(); } catch {}
});

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

  const checks = await page.evaluate(async () => {
    const out = {};

    // App und zentrale Funktionen sind wirklich ausführbar.
    out.booted = !!(window.KA && KA.booted);
    const lockCfg = JSON.parse(localStorage.getItem('ka_lock') || 'null');
    out.mandatoryEncryption = !!lockCfg && lockCfg.enc === true && KA.enc === true;
    out.noDisableControls = !document.getElementById('al-off') && !document.getElementById('al-encb') && !document.getElementById('al-decb');
    out.functions = [
      typeof switchTab,
      typeof persist,
      typeof migrateEventPatientIds,
      typeof eventPatient,
      typeof auditOne,
      typeof encryptBackup,
      typeof decryptBackup,
      typeof sha256Hex,
      typeof backupStateHash,
      typeof validateBackupData,
      typeof fCommitStagedFiles,
      typeof verifyZipBackup,
      typeof fillNavMenu
    ].every(x => x === 'function');

    // Hauptnavigation und neu gruppiertes Praxis-Menü.
    out.mainNav = ['btn-kalender','btn-patienten','btn-todos','btn-rechnungen','btn-praxis']
      .every(id => !!document.getElementById(id));
    out.paymentsNotPinned = !document.getElementById('btn-zahlungen');
    fillNavMenu();
    const menuText = document.getElementById('nav-menu').innerText;
    out.menuGroups = ['Finanzen','Praxis','Kommunikation & Vorlagen','Daten & Technik','Geplant']
      .every(t => menuText.includes(t));

    // Hauptseiten müssen ohne Ausnahme umschaltbar sein.
    let tabsOk = true;
    for (const tab of ['kalender','patienten','todos','rechnungen']) {
      try {
        switchTab(tab);
        const el = document.getElementById('tab-' + tab);
        if (!el || !el.classList.contains('active')) tabsOk = false;
      } catch {
        tabsOk = false;
      }
    }
    out.tabs = tabsOk;

    // Patientenspeicherung und Terminmigration auf interne IDs.
    patients.length = 0;
    events.length = 0;
    const p1 = { id:'ci-p1', nr:1, vorname:'Anna', nachname:'Test', medikation:[], log:[], doku:[], dokumente:[], bilder:[] };
    patients.push(p1);
    events.push({ id:9001, patient:'Anna Test', date:'2026-10-31', time:'10:00', dur:30 });
    migrateEventPatientIds();
    out.eventMigrated = events[0].patientId === 'ci-p1';

    // Eine vorhandene ID bleibt maßgeblich, selbst wenn der lesbare Name veraltet ist.
    events.push({ id:9002, patientId:'ci-p1', patient:'Alter Name', date:'2026-10-31', time:'11:00', dur:30 });
    migrateEventPatientIds();
    out.idWins = events[1].patientId === 'ci-p1' && events[1].patient === 'Anna Test';

    // Bei Namensgleichheit darf ohne ID nicht geraten werden.
    patients.push({ id:'ci-p2', nr:2, vorname:'Anna', nachname:'Test', medikation:[], log:[], doku:[], dokumente:[], bilder:[] });
    events.push({ id:9003, patient:'Anna Test', date:'2026-10-31', time:'12:00', dur:30 });
    migrateEventPatientIds();
    out.noGuessOnDuplicate = events[2].patientId == null;

    // Persistenz schreibt den aktuellen Patientenstand in den App-Speicher.
    persist();
    await kaIdle();
    const savedPatients = JSON.parse(kaGet('ka_patients') || '[]');
    const rawPatients = localStorage.getItem('ka_patients') || '';
    out.persist = savedPatients.some(p => p.id === 'ci-p1') && rawPatients.startsWith('enc1:');

    // Änderungshistorie: vorher/nachher und Zeitstempel bleiben erhalten.
    const auditPatient = { id:'ci-audit', audit:[] };
    auditOne(auditPatient, 'Stammdaten', 'Telefon', '030 111', '030 222');
    const ae = auditPatient.audit?.[0];
    out.audit = !!ae && typeof ae.ts === 'number' && ae.changes?.[0]?.from === '030 111' && ae.changes?.[0]?.to === '030 222';

    // Verschlüsseltes Backup muss rundlaufen und ein falsches Passwort ablehnen.
    const plain = JSON.stringify({ patient:'CI Test', value:42 });
    const encryptedText = await encryptBackup(plain, 'CiTestPasswort-123!');
    const encrypted = JSON.parse(encryptedText);
    const decrypted = await decryptBackup(encrypted, 'CiTestPasswort-123!');
    out.backupRoundtrip = decrypted === plain && encrypted.format === 'ka-backup-enc';
    let wrongRejected = false;
    try { await decryptBackup(encrypted, 'falsches-passwort'); } catch { wrongRejected = true; }
    out.backupRejectsWrongPassword = wrongRejected;

    // Neue Sicherungen dürfen nicht mehr unverschlüsselt erstellt werden.
    out.backupMandatoryUi = !document.getElementById('bk-nopw') && !document.getElementById('bk-newpw') && !!document.getElementById('bk-pwbox');

    // SHA-256 und Zustandsintegrität müssen reproduzierbar sein und Manipulation erkennen.
    const hashAbc = await sha256Hex(new TextEncoder().encode('abc'));
    out.sha256Works = hashAbc === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
    const sample = {
      format:'ka-sicherung', version:4, id:'ci-backup', exportiert:'2026-10-31T00:00:00.000Z',
      events:[], patients:[], templates:[], invoices:[], settings:{}, lager:{}, ausgaben:[], entw:[], todos:[], dateien:[]
    };
    const stateHash = await backupStateHash(sample);
    sample.integrity = { alg:'SHA-256', state:stateHash };
    validateBackupData(sample);
    out.backupStateIntegrity = (await backupStateHash(sample)) === stateHash;
    sample.events.push({ id:1 });
    out.backupTamperDetected = (await backupStateHash(sample)) !== stateHash;

    // Restore-Dateien werden erst vorbereitet und dann in einer einzigen IndexedDB-Transaktion umgeschaltet.
    await fClear();
    await fPut('ci-old', 'old.txt', new Blob(['old'], { type:'text/plain' }));
    const pref = '\uffffka_restore_ci_';
    const stage = pref + '0';
    await fPut(stage, 'new.txt', new Blob(['new'], { type:'text/plain' }));
    const swapped = await fCommitStagedFiles(pref, { [stage]:'ci-new' });
    const oldAfter = await fGet('ci-old');
    const newAfter = await fGet('ci-new');
    out.atomicFileSwap = swapped && !oldAfter && !!newAfter && (await newAfter.blob.text()) === 'new';
    await fClear();

    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen.
    out.syncApi = !!window.KS && typeof KS.run === 'function' && typeof KS.abrufen === 'function' && typeof KS.touch === 'function';
    out.autoInboxState = !!window.KS && Object.prototype.hasOwnProperty.call(KS.state, 'autoInbox');

    return out;
  });

  for (const [name, ok] of Object.entries(checks)) {
    assert.equal(ok, true, `Browser smoke check failed: ${name}`);
  }
  assert.deepEqual(pageErrors, [], `Uncaught page errors:\n${pageErrors.join('\n')}`);
  console.log('Browser smoke checks OK', checks);
} finally {
  await browser.close();
}
