# Praxis-App Kreuzberg Ästhetik

Einzelne Webseite (index.html, sw.js, docs.js, sync.js, Webformulare) für die Praxisverwaltung, läuft als installierte Seite auf GitHub Pages: https://fellamanuel-arch.github.io/ka-praxis-8957/
Branch für die Arbeit: `claude/new-session-40fqjl`. Genauer Stand, Gestaltungsregeln und offene Wünsche: LIESMICH.txt, Abschnitt "Stand und offene Wünsche".

## Zusammenarbeit
- Auf Deutsch, per Du, kurz antworten. Screenshots nur auf Wunsch.
- Mehrere Änderungen aus einer Nachricht zusammen umsetzen und einmal veröffentlichen.
- Bei größeren Umbauten vorher Skizze oder Vorschlag zeigen. Bei Unsicherheit fragen.
- Den lokalen Testserver nicht in Antworten erwähnen.

## Veröffentlichen
1. Version erhöhen: `V` in sw.js und `KA_V` in index.html (beide gleich, Schema JJJJ-MM-TT-x).
2. Committen, auf den Branch pushen, Pull Request nach `main` erstellen und mergen (merge_method "merge").
3. Danach kurz melden: GitHub Pages braucht 1 bis 2 Minuten, die App zweimal neu laden, bei "Neue Version verfügbar" auf "Jetzt aktualisieren" tippen.

## Gestaltung
- Grau = Abbrechen und Bearbeiten, Grün = Speichern und Senden. Löschen als kleines rotes Umriss-Symbol ganz links. Rot und Grün nie nebeneinander.
- Ruhig und platzsparend, wenige Beschriftungen, Symbole mit Farbe, Zeilen einzeilig, Textfelder wachsen mit.
- Suchleisten hinter einer Lupe, Rechnungen und Termine ohne Zusatzvermerke wie gewünscht.

## Datenschutz und Sicherheit
- Keine echten Patientendaten ins öffentliche Repository und nicht in Tests. Mit erfundenen Daten testen.
- Gesundheitsdaten verlassen das Gerät nur Ende-zu-Ende-verschlüsselt (Geräte-Abgleich, Formular-Postfach). Keine Verbindung zu Gmail, Google, Slack oder ähnlichen Diensten mit Patientendaten.
- Texte für Datenschutz, Aufklärung und Nachsorge sind Entwürfe und müssen geprüft werden.

## Technik in Kürze
- Hauptskript steht als `<script type="text/plain" id="ka-main">` in index.html und wird nach dem Entsperren eingefügt.
- Daten: localStorage (optional verschlüsselt) und IndexedDB für Dateien. `persist()` schreibt alles. Geräte-Abgleich in sync.js, Server-Teil in formular-empfang-wordpress.txt (WPCode-Snippet).
- Prüfen mit Playwright gegen `python3 -m http.server`, Service Worker blockieren.
