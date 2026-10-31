import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = p => fs.readFileSync(p, 'utf8');
const html = read('index.html');
const sw = read('sw.js');

// 1) Alle relevanten JavaScript-Dateien müssen syntaktisch gültig sein.
for (const file of ['dialoge.js','docs.js','sync.js','extcal.js','forms.js','ftexte.js','sw.js']) {
  new vm.Script(read(file), { filename: file });
}

// 2) Inline-Skripte und der text/plain-Hauptblock müssen ebenfalls parsbar sein.
const blocks = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m => m[1]).filter(Boolean);
assert.ok(blocks.length >= 2, 'Zu wenige Script-Blöcke in index.html');
blocks.forEach((code, i) => new vm.Script(code, { filename: `index-inline-${i}.js` }));

// 3) App- und Service-Worker-Version müssen identisch sein.
const appVersion = html.match(/var KA_V = '([^']+)'/i)?.[1];
const swVersion = sw.match(/var V='([^']+)'/i)?.[1];
assert.ok(appVersion, 'KA_V fehlt');
assert.ok(swVersion, 'Service-Worker-Version fehlt');
assert.equal(appVersion, swVersion, 'KA_V und Service-Worker-Version weichen voneinander ab');

// 4) Kritische UI-Bereiche dürfen nicht versehentlich verschwinden.
for (const id of ['tab-start','tab-kalender','tab-patienten','tab-todos','tab-rechnungen','tab-zahlungen','nav-menu']) {
  assert.ok(html.includes(`id="${id}"`), `UI-Bereich fehlt: ${id}`);
}
for (const id of ['btn-kalender','btn-patienten','btn-todos','btn-praxis']) {
  assert.ok(html.includes(`id="${id}"`), `Navigationsknopf fehlt: ${id}`);
}

// 5) Aktuelle Navigationsarchitektur: Rechnungen angeheftet, Zahlungen im Praxis-Menü.
assert.ok(html.includes("var NAV_PINNED = ['rechnungen'];"), 'Rechnungen sind nicht als Hauptnavigation markiert');
for (const group of ['Finanzen','Praxis','Kommunikation & Vorlagen','Daten & Technik','Geplant']) {
  assert.ok(html.includes(`['#', '${group}']`), `Navigationsgruppe fehlt: ${group}`);
}

// 6) Datenintegrität: ID-Migration und Audit-Historie müssen vorhanden bleiben.
for (const marker of ['function eventPatient(e)', 'function migrateEventPatientIds()', 'patientId:', 'function auditPush(', 'function auditOne(', 'function auditDiff(']) {
  assert.ok(html.includes(marker), `Kritische Datenlogik fehlt: ${marker}`);
}

// 7) Backup muss weiterhin verschlüsseln und entschlüsseln können.
for (const marker of ['async function encryptBackup(', 'async function decryptBackup(', "format: 'ka-backup-enc'", "AES-GCM", "PBKDF2-SHA256"]) {
  assert.ok(html.includes(marker), `Backup-Schutz fehlt: ${marker}`);
}

// 8) Sync und automatischer Formularimport dürfen nicht still verschwinden.
const sync = read('sync.js');
for (const marker of ["/wp-json/ka/v1/abgleich", 'autoInbox', 'abrufen', 'inboxSig()', 'AES-GCM']) {
  assert.ok(sync.includes(marker), `Sync-Invariante fehlt: ${marker}`);
}

// 9) Lokale Praxisdaten müssen verpflichtend verschlüsselt werden.
for (const marker of ['function alPrepare()', 'async function alActivateEncryption(', "document.documentElement.classList.add('locked')", 'mindestens 8 Zeichen', 'verpflichtend und kann nicht deaktiviert werden']) {
  assert.ok(html.includes(marker), `Verschlüsselungs-Invariante fehlt: ${marker}`);
}
assert.ok(!html.includes('>Sperre entfernen</button>'), 'Sperre darf nicht deaktivierbar sein');
assert.ok(!html.includes('>Verschlüsselung aufheben</button>'), 'Verschlüsselung darf nicht deaktivierbar sein');

// 10) Manifest und zentrale PWA-Dateien müssen existieren und lesbar sein.
JSON.parse(read('manifest.webmanifest'));
for (const file of ['icon-192.png','icon-512.png','manifest.webmanifest','index.html','sw.js']) {
  assert.ok(fs.existsSync(file), `PWA-Datei fehlt: ${file}`);
}

console.log(`Static checks OK · Version ${appVersion}`);
