// Zerlegt index.html nach Funktionen in einzelne Dateien (Kopie zum Lesen und Nachschlagen).
// Die App selbst nutzt weiterhin nur index.html. Diese Kopie wird weder geladen noch gecacht.
//
//   node werkzeuge/code-aufteilen.mjs            erzeugt quellcode-aufgeteilt/ neu
//   node werkzeuge/code-aufteilen.mjs --pruefen  prüft nur, ob die Kopie zum aktuellen index.html passt
//
// Die Teile sind verlustfrei: In der Reihenfolge aus teile.json aneinandergehängt ergeben sie exakt index.html.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const QUELLE = path.join(ROOT, 'index.html');
const ZIEL = path.join(ROOT, 'quellcode-aufgeteilt');
const pruefen = process.argv.includes('--pruefen');

const src = fs.readFileSync(QUELLE, 'utf8');
const lineOf = pos => src.slice(0, pos).split('\n').length;
const lineStart = pos => src.lastIndexOf('\n', pos - 1) + 1;

function slug(t) {
  return String(t).toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/g, '') || 'teil';
}

// Schnittpunkte: [Position, Art, Bezeichnung]. Ein Teil reicht bis zum nächsten Schnittpunkt.
const cuts = [[0, 'html', 'dokumentkopf']];

// 1) Stil-Block, gegliedert nach den Kommentar-Überschriften
const st = src.indexOf('<style>'), se = src.indexOf('</style>', st);
if (st >= 0 && se > st) {
  const cs = st + '<style>'.length;
  cuts.push([cs, 'css', 'grundlagen']);
  const css = src.slice(cs, se);
  for (const m of css.matchAll(/^[ \t]*\/\*\s*(?:=+\s*)?(.+?)\s*(?:=+\s*)?\*\/?/gm)) {
    const title = m[1].replace(/\*\/.*$/, '').replace(/[,:;.].*$/, '').trim();
    cuts.push([lineStart(cs + m.index), 'css', title]);
  }
  cuts.push([se, 'html', 'oberflaeche']);
}

// 2) Inline-Skripte (ohne src), das Hauptskript nach seinen Abschnittsmarken
for (const m of src.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  const attrs = m[1] || '';
  if (/\bsrc=/.test(attrs) || !m[2].trim()) continue;
  const cs = m.index + m[0].indexOf('>') + 1, ce = cs + m[2].length;
  const isMain = /id="ka-main"/.test(attrs);
  const first = (m[2].match(/\/\*\s*(?:=+\s*)?(.+?)\s*(?:=+\s*)?\*\//) || [])[1];
  const label = isMain ? 'app-grundlagen-und-navigation' : first ? first.replace(/[,:;.(].*$/, '')
    : /classList\.add\('locked'\)/.test(m[2]) ? 'sperre-sofort-aktivieren' : /kaStart\(\)/.test(m[2]) ? 'app-start' : 'skript';
  cuts.push([cs, 'js', label]);
  if (isMain) {
    for (const mm of m[2].matchAll(/^\/\* ={3,}\s*(.+?)\s*={3,}/gm)) cuts.push([cs + mm.index, 'js', mm[1].replace(/[:(].*$/, '')]);
  }
  cuts.push([ce, 'html', 'oberflaeche']);
}

// 3) HTML-Bereiche: Seiten (TAB) und Fenster (MODAL) laut Kommentar
for (const m of src.matchAll(/^[ \t]*<!-- ([A-ZÄÖÜ][^\n]*?) -->/gm)) {
  const pos = m.index;
  // nur außerhalb von Stil und Skripten
  const inStyle = pos > st && pos < se;
  const inScript = [...src.slice(0, pos).matchAll(/<script\b/g)].length > [...src.slice(0, pos).matchAll(/<\/script>/g)].length;
  if (inStyle || inScript) continue;
  const t = m[1].replace(/^TAB\s*\d*:\s*/, 'seite ').replace(/^MODAL:\s*/, 'fenster ');
  cuts.push([pos, 'html', t]);
}

cuts.sort((a, b) => a[0] - b[0]);
// gleiche Position: der spätere (spezifischere) Schnitt gewinnt
const uniq = [];
for (const c of cuts) { if (uniq.length && uniq[uniq.length - 1][0] === c[0]) uniq[uniq.length - 1] = c; else uniq.push(c); }

// sehr kleine Teile mit dem vorherigen zusammenlegen (gleiche Art), damit keine Splitter entstehen
const MIN = { css: 12, js: 8, html: 3 };
const merged = [];
for (let i = 0; i < uniq.length; i++) {
  const c = uniq[i], next = uniq[i + 1] ? uniq[i + 1][0] : src.length;
  const lines = src.slice(c[0], next).split('\n').length - 1;
  const prev = merged[merged.length - 1];
  if (prev && prev[1] === c[1] && lines < MIN[c[1]] && i > 0) continue;
  merged.push(c);
}

// Allgemeine Oberflächen-Teile nach ihrem ersten Element mit id benennen
for (let i = 0; i < merged.length; i++) {
  const c = merged[i]; if (c[1] !== 'html' || c[2] !== 'oberflaeche') continue;
  const seg = src.slice(c[0], merged[i + 1] ? merged[i + 1][0] : src.length);
  if (!merged[i + 1]) { c[2] = 'dokument-ende'; continue; }
  const id = (seg.match(/<(?!script|style|\/)[a-z0-9]+[^>]*\bid="([^"]+)"/) || [])[1];
  const tag = (seg.match(/<(header|nav|main|footer|body)\b/) || [])[1];
  c[2] = 'oberflaeche-' + (tag ? tag + (id ? '-' + id : '') : id || (/<\/head>/.test(seg) ? 'kopf-ende' : 'rahmen'));
}
const ext = { html: '.html', css: '.css', js: '.js' };
const parts = merged.map((c, i) => {
  const end = merged[i + 1] ? merged[i + 1][0] : src.length;
  const nr = String((i + 1) * 10).padStart(4, '0');
  const file = path.posix.join(c[1], nr + '-' + slug(c[2]) + ext[c[1]]);
  return { file, art: c[1], titel: c[2], zeile: lineOf(c[0]), text: src.slice(c[0], end) };
});

// Prüfung: Zusammensetzen ergibt exakt das Original
const joined = parts.map(p => p.text).join('');
if (joined !== src) { console.error('Fehler: Die Teile ergeben nicht das Original.'); process.exit(1); }
const sha = crypto.createHash('sha256').update(src).digest('hex');

const teile = { quelle: 'index.html', sha256: sha, hinweis: 'Teile in dieser Reihenfolge aneinanderhängen = index.html', teile: parts.map(p => ({ datei: p.file, art: p.art, titel: p.titel, ab_zeile: p.zeile, zeilen: p.text.split('\n').length - 1 })) };

if (pruefen) {
  let ok = false;
  try { ok = JSON.parse(fs.readFileSync(path.join(ZIEL, 'teile.json'), 'utf8')).sha256 === sha; } catch {}
  console.log(ok ? 'Aufgeteilte Kopie ist aktuell.' : 'Aufgeteilte Kopie ist veraltet: node werkzeuge/code-aufteilen.mjs ausführen.');
  process.exit(ok ? 0 : 1);
}

fs.rmSync(ZIEL, { recursive: true, force: true });
for (const p of parts) { const f = path.join(ZIEL, p.file); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, p.text); }
fs.writeFileSync(path.join(ZIEL, 'teile.json'), JSON.stringify(teile, null, 2) + '\n');

const rows = parts.map(p => `| \`${p.file}\` | ${p.titel.replace(/\|/g, '/')} | ${p.zeile} | ${p.text.split('\n').length - 1} |`).join('\n');
const sum = a => parts.filter(p => p.art === a).length;
fs.writeFileSync(path.join(ZIEL, 'README.md'), `# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt \`index.html\`.
Änderungen gehören weiterhin in \`index.html\`; danach die Kopie neu erzeugen:

\`\`\`
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
\`\`\`

Die Teile sind verlustfrei: In der Reihenfolge aus \`teile.json\` aneinandergehängt ergeben sie exakt \`index.html\`
(SHA-256 \`${sha.slice(0, 16)}…\`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- \`css/\`: Gestaltung, nach Themen (${sum('css')} Teile)
- \`js/\`: Programmlogik, nach Funktionsbereichen (${sum('js')} Teile)
- \`html/\`: Oberfläche, nach Seiten und Fenstern (${sum('html')} Teile)

Bereits vorher eigenständige Dateien (nicht kopiert): \`dialoge.js\` (Hinweise, Rückfragen, Passkey), \`docs.js\` (Dokumente, Vorlagen),
\`sync.js\` (Geräte-Abgleich, Postfach), \`extcal.js\` (privater Kalender), \`forms.js\`, \`ftexte.js\`, \`forms.css\` (Webformulare),
\`sw.js\` (Offline-Speicher, Updates).

| Datei | Inhalt | ab Zeile in index.html | Zeilen |
|---|---|---|---|
${rows}
`);
console.log(`Aufgeteilt in ${parts.length} Teile (css ${sum('css')}, js ${sum('js')}, html ${sum('html')}), verlustfrei geprüft.`);
