// Erzeugt kleine Weiterleitungsseiten für die alten Patienten-Links auf GitHub Pages.
//
//   node werkzeuge/weiterleitungen.mjs https://app.kreuzberg-aesthetik.de [Zielordner]
//
// Pro Patientenseite entsteht eine Datei gleichen Namens, die auf dieselbe Seite der neuen Adresse springt
// und dabei Parameter (?c=…, ?d=…) und Anker (#…) behält. Die Dateien ersetzen NUR im Pages-Stand die echten Seiten,
// sie gehören nie in main und nie in das Webspace-Paket. index.html und sw.js werden bewusst nicht ersetzt,
// damit die auf der alten Adresse installierte App ihre Daten für die Sicherung weiter öffnen kann.
import fs from 'node:fs';
import path from 'node:path';

const SEITEN = ['anmeldung.html', 'anamnese.html', 'erinnerung.html', 'aufklaerung.html', 'info.html', 'postfachtest.html'];
const ziel = (process.argv[2] || '').replace(/\/+$/, '');
const out = path.resolve(process.argv[3] || path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'weiterleitungen'));
if (!/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(ziel)) {
  console.error('Zieladresse fehlt oder ist ungültig. Beispiel: node werkzeuge/weiterleitungen.mjs https://app.kreuzberg-aesthetik.de');
  process.exit(1);
}
if (fs.existsSync(out) && fs.readdirSync(out).some(n => !SEITEN.includes(n))) {
  console.error('Zielordner enthält fremde Dateien: ' + out);
  process.exit(1);
}
fs.mkdirSync(out, { recursive: true });

const seite = name => `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>Seite umgezogen</title>
<style>body{font:16px/1.5 system-ui,sans-serif;margin:0;padding:32px 16px;background:#eef2f6;color:#1e293b}main{max-width:420px;margin:12vh auto 0;background:#fff;border-radius:12px;padding:24px;box-shadow:0 2px 12px rgba(15,23,42,.08)}a{color:#0b5cad}</style>
</head>
<body>
<main>
<p><strong>Diese Seite ist umgezogen.</strong></p>
<p id="w">Sie werden weitergeleitet …</p>
<noscript><p><a href="${ziel}/${name}">Weiter zur neuen Seite</a></p></noscript>
</main>
<script>
(function () {
  var z = ${JSON.stringify(ziel + '/' + name)} + location.search + location.hash;
  document.getElementById('w').innerHTML = '<a href="' + z.replace(/"/g, '&quot;') + '">Weiter zur neuen Seite</a>';
  location.replace(z);
})();
</script>
</body>
</html>
`;
for (const n of SEITEN) fs.writeFileSync(path.join(out, n), seite(n));
console.log(`${SEITEN.length} Weiterleitungen nach ${ziel} in ${out}`);
