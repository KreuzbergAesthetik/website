// Erzeugt den Upload-Ordner für den eigenen Webspace (z. B. IONOS-Subdomain), unabhängig von GitHub.
//
//   node werkzeuge/webspace-paket.mjs [Zielordner]     Standard: webspace-paket/
//
// Prüft vorher: V (sw.js) und KA_V (index.html) sind gleich, alle Dateien aus dem Offline-Speicher von sw.js
// und alle lokal eingebundenen Skripte, Stile, Bilder und Seiten sind im Paket. Fehlt etwas, bricht das Skript ab.
// Das Paket enthält nur ausgelieferte Dateien (keine Tests, Werkzeuge, Dokumentation, Server-Dateien).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const ZIEL = path.resolve(process.argv[2] || path.join(ROOT, 'webspace-paket'));
const fehler = [];
const lies = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Dateien im Hauptordner, die ausgeliefert werden
const ENDUNGEN = new Set(['.html', '.js', '.css', '.png', '.webmanifest']);
const alle = fs.readdirSync(ROOT, { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name).sort();
const dateien = alle.filter(n => ENDUNGEN.has(path.extname(n)));
const draussen = alle.filter(n => !dateien.includes(n));

// 1) Versionen
const v = (lies('sw.js').match(/var V='([^']+)'/) || [])[1];
const kaV = (lies('index.html').match(/KA_V\s*=\s*'([^']+)'/) || [])[1];
if (!v || !kaV) fehler.push('Version nicht gefunden (V in sw.js oder KA_V in index.html).');
else if (v !== kaV) fehler.push(`Versionen verschieden: sw.js ${v}, index.html ${kaV}.`);

// 2) Dateien aus dem Offline-Speicher von sw.js
const swListe = ((lies('sw.js').match(/F=\[([^\]]*)\]/) || [])[1] || '').split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean);
for (const u of swListe) {
  const f = u.replace(/^\.\//, '').split('?')[0];
  if (f && !dateien.includes(f)) fehler.push(`sw.js nennt ${u}, die Datei ist nicht im Paket.`);
}

// 3) Lokal eingebundene Dateien in den Seiten und im Manifest
for (const seite of dateien.filter(n => n.endsWith('.html'))) {
  const html = lies(seite);
  for (const m of html.matchAll(/(?:src|href)\s*=\s*["']([^"'#?]+)/g)) {
    const u = m[1];
    if (/^(https?:|data:|blob:|mailto:|tel:|javascript:|\/\/)/.test(u)) continue;
    const f = u.replace(/^\.\//, '');
    if (f && !dateien.includes(f)) fehler.push(`${seite} verweist auf ${u}, die Datei ist nicht im Paket.`);
  }
}
for (const m of lies('manifest.webmanifest').matchAll(/"src"\s*:\s*"([^"]+)"/g)) {
  const f = m[1].replace(/^\.\//, '');
  if (!dateien.includes(f)) fehler.push(`manifest.webmanifest nennt ${m[1]}, die Datei ist nicht im Paket.`);
}

if (fehler.length) {
  console.error('Paket NICHT erzeugt:\n- ' + fehler.join('\n- '));
  process.exit(1);
}

// 4) Ziel leeren und befüllen (nur unser eigener Ordner; Sicherheitsprüfung gegen versehentliches Löschen anderer Ordner)
if (fs.existsSync(ZIEL)) {
  const inhalt = fs.readdirSync(ZIEL);
  if (inhalt.length && !fs.existsSync(path.join(ZIEL, 'PAKET-VERSION.txt'))) {
    console.error('Zielordner ist nicht leer und kein früheres Paket: ' + ZIEL);
    process.exit(1);
  }
  fs.rmSync(ZIEL, { recursive: true, force: true });
}
fs.mkdirSync(ZIEL, { recursive: true });
for (const n of dateien) fs.copyFileSync(path.join(ROOT, n), path.join(ZIEL, n));

fs.writeFileSync(path.join(ZIEL, '.htaccess'), `# Praxis-App: Kopfzeilen für die Subdomain (Apache, IONOS)
<FilesMatch "^(sw\\.js|index\\.html|manifest\\.webmanifest)$">
  Header set Cache-Control "no-cache"
</FilesMatch>
AddType application/manifest+json .webmanifest
Header always set Strict-Transport-Security "max-age=31536000"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Content-Security-Policy "frame-ancestors 'none'"
Header always set X-Robots-Tag "noindex, nofollow"
`);

const sum = f => crypto.createHash('sha256').update(fs.readFileSync(path.join(ZIEL, f))).digest('hex');
const inPaket = [...dateien, '.htaccess'];
fs.writeFileSync(path.join(ZIEL, 'pruefsummen.txt'), inPaket.map(f => sum(f) + '  ' + f).join('\n') + '\n');
fs.writeFileSync(path.join(ZIEL, 'PAKET-VERSION.txt'), `Version ${v}\nDateien: ${inPaket.length}\nReihenfolge beim Hochladen: alle Dateien, sw.js zuletzt.\n`);

console.log(`Paket ${v}: ${inPaket.length} Dateien in ${ZIEL}`);
console.log('Nicht im Paket (Absicht): ' + draussen.join(', '));
console.log('Beim Hochladen sw.js zuletzt hochladen.');
