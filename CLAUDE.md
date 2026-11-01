# Kreuzberg Ästhetik Praxis-App

## Auftrag
Dies ist die produktive Praxismanagement-App von Kreuzberg Ästhetik. Arbeite am bestehenden System weiter. Nicht neu bauen, nicht ohne Auftrag auf ein Framework migrieren und vorhandene Funktionen oder Gestaltung nicht beiläufig verändern.

Aktueller Source of Truth ist `main` im Repository `KreuzbergAesthetik/website`. Vor Beginn einer neuen Aufgabe zuerst `HANDOVER.md` und `LIESMICH.txt` lesen und anschließend den aktuellen Code prüfen. Dokumentation kann hinter dem Code zurückliegen; bei Widersprüchen gilt der aktuelle Code und die Git-Historie.

## Zusammenarbeit
- Auf Deutsch, per Du, knapp und konkret antworten.
- Mehrere zusammengehörige Änderungen aus einer Nachricht gemeinsam umsetzen.
- Möglichst wenig Rückfragen. Nur fragen, wenn eine fachlich relevante Entscheidung wirklich offen ist.
- Bei größeren Umbauten zuerst Vorgehen oder Skizze zeigen.
- Keine Funktionen, Texte, Datenfelder oder Designentscheidungen erfinden.
- Bestehende Funktionen erhalten, sofern nicht ausdrücklich anders beauftragt.
- Nach Änderungen Tests ausführen und nur tatsächlich geprüfte Ergebnisse behaupten.

## Git-Arbeitsweise
- Für neue Arbeit einen eigenen Branch vom aktuellen `main` anlegen.
- Änderungen committen, Pull Request nach `main` erstellen und erst nach erfolgreicher Prüfung mergen.
- Es gibt keinen dauerhaft vorgeschriebenen Claude-Branch. Alte Branch-Namen in früherer Dokumentation sind historisch.
- Offene Pull Requests vor Arbeitsbeginn prüfen, damit keine parallele Arbeit überschrieben wird.

## Veröffentlichung und Version
Die App ist eine PWA. Bei jeder Änderung an ausgeliefertem App-Code oder gecachten Assets muss die App-Version erhöht werden:
- `V` in `sw.js`
- `KA_V` in `index.html`
- beide Werte müssen identisch sein

Schema derzeit: `JJJJ-MM-TT-x`. Reine Dokumentationsänderungen an Markdown/TXT, die nicht von der PWA ausgeliefert oder gecacht werden, benötigen keinen Versionssprung.

Nach einer produktiven Veröffentlichung kurz darauf hinweisen, dass GitHub Pages etwas Zeit benötigen kann und die App ggf. neu geladen bzw. über den Hinweis „Neue Version verfügbar“ aktualisiert werden muss.

## Architektur
Die Anwendung ist bewusst weitgehend clientseitig und ohne klassisches App-Framework aufgebaut.

Wichtige Dateien:
- `index.html`: Hauptoberfläche, CSS und großer Teil der App-Logik. Das Hauptskript liegt als `<script type="text/plain" id="ka-main">` vor und wird nach dem Entsperren aktiviert.
- `sw.js`: Service Worker, Offline-Cache und Versionssteuerung.
- `docs.js`: Dokument- und PDF-Funktionen.
- `dialoge.js`: interne Hinweise, Bestätigungen und Eingabedialoge.
- `sync.js`: Ende-zu-Ende-verschlüsselter Geräte-Abgleich und Postfach.
- `extcal.js`: Einbindung externer privater Kalender.
- `forms.js`, `ftexte.js`, `forms.css`: Webformulare und deren Anpassung.
- `anmeldung.html`, `anamnese.html`, `erinnerung.html`, `aufklaerung.html`: patientenseitige Formulare/Seiten.
- `formular-empfang-wordpress.txt`: Server-Komponente als WordPress/WPCode-Snippet.
- `formular-empfang.php`, `sendmail.php`: ältere/alternative Serverwege; nicht mit dem verschlüsselten Postfach verwechseln.
- `tests/`: statische und Playwright-basierte Regressionstests.
- `.github/workflows/app-ci.yml`: CI für `main` und Pull Requests.

## Daten und Datenschutz
Die App verarbeitet Gesundheitsdaten und damit besonders schützenswerte Daten.

Verbindliche Regeln:
- Niemals echte Patientendaten, echte Akten, Screenshots mit Patientendaten oder Secrets ins Repository, in Issues, PRs oder Tests schreiben.
- Tests ausschließlich mit erfundenen Daten.
- Gesundheitsdaten dürfen das Gerät nur über die dafür vorgesehene Ende-zu-Ende-verschlüsselte Architektur verlassen.
- Keine Patientendaten an Gmail, Google, Slack oder andere nicht ausdrücklich dafür vorgesehene Dienste anbinden.
- Persönliche interne Notizen des Praxisinhabers sind von medizinischer Dokumentation zu unterscheiden. Medizinisch relevante Anamnese, Diagnosen, Befunde, Behandlungsdokumentation, Dokumente und Bilder müssen hinsichtlich Änderungsnachvollziehbarkeit besonders behandelt werden. Interne persönliche Notizen sollen nicht automatisch denselben Dokumentationsmechanismen unterliegen.
- Datenschutz-, Aufklärungs- und Nachsorgetexte sind nicht automatisch rechtlich oder medizinisch freigegeben.
- Keine Zugangsdaten, Tokens, Passwörter, privaten Schlüssel oder personenbezogenen Praxisgeheimnisse hardcoden.

## Persistenz und Sync
- Strukturierte Daten liegen primär im Browser-Speicher; Dateien/Bilder in IndexedDB.
- `persist()` ist zentral für das Speichern.
- Geräte-Abgleich in `sync.js` ist Ende-zu-Ende-verschlüsselt. Der Schlüssel wird aus dem Abgleich-Passwort auf dem Gerät abgeleitet und soll das Gerät nicht verlassen.
- Konfliktlogik und Datenmigrationen besonders vorsichtig ändern. Vor Änderungen an Datenformaten Rückwärtskompatibilität, Sicherung und Migration bedenken.

## UI-Regeln
- Ruhig, kompakt und funktional.
- Grau: Abbrechen/Bearbeiten.
- Grün: Speichern/Senden.
- Löschen: kleines rotes Umriss-Symbol, nach Möglichkeit links und nicht direkt neben einer grünen Primäraktion.
- Wenige unnötige Beschriftungen, Symbole sinnvoll einsetzen.
- Einzeilige kompakte Zeilen bevorzugen, Textfelder dürfen mit Inhalt wachsen.
- Bestehende visuelle Sprache erhalten, sofern kein Redesign beauftragt ist.

## Dialoge
Neuer Code darf keine nativen `confirm()`- oder `prompt()`-Dialoge einführen. Verwende die vorhandenen Mechanismen in `dialoge.js`, insbesondere `kaConfirm()` und `kaPrompt()`, korrekt mit `await` innerhalb asynchroner Funktionen.

## Tests
Vor dem Merge mindestens:
- `npm run test:static`
- `npm run test:browser`

Die Browser-Tests verwenden Playwright/Chromium. Zusätzlich bei UI-Änderungen die betroffenen Ansichten gezielt prüfen. Bei Änderungen an Service Worker, Sync, Verschlüsselung, Import/Export oder Dokumentation nicht allein auf einen visuellen Smoke-Test vertrauen.

## Fachliche Leitplanken
Diese App ist kein Demo-Projekt. Änderungen können medizinische Dokumentation, Datenschutz, Abrechnung und Patientendaten betreffen. Bei Unsicherheit keine Annahme als Tatsache implementieren. Risiken benennen und bei rechtlich oder medizinisch relevanten Punkten klar zwischen technischer Umsetzung und fachlicher Freigabe unterscheiden.
