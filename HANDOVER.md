# Übergabe an Claude

Stand: 01.11.2026
Repository: `KreuzbergAesthetik/website`
Produktiver Branch: `main`

## 1. Source of Truth

Der aktuelle produktive Stand ist `main`. Zum Zeitpunkt dieser Übergabe zeigt `main` auf Commit `ab2f88b54acfbe63a5105abd38f275d3670959cd`.

Die App-Version in `sw.js` ist zu diesem Zeitpunkt `2026-11-01-z`.

Wichtig: `LIESMICH.txt` enthält viel wertvolle Fach- und Architekturhistorie, nennt aber im Abschnitt „Stand und offene Wünsche“ noch einen älteren Stand vom 29.10.2026 und einen früheren Claude-Branch. Diese Angaben nicht als aktuellen Git-Stand behandeln.

## 2. Was zuletzt geändert wurde

Die jüngsten Änderungen auf `main` betreffen insbesondere:
- Rechnungsübersicht, Eingabedialog und Praxismenü
- gemeinsame Darstellung von Rechnungen und Kostenvoranschlägen
- Ordnung von Testbereich und Formularen
- schnelleren bzw. deterministischeren Passkey-Start
- Synchronisierung des Sicherheitsbereichs mit dem Praxis-Menü

Vor einer Änderung an diesen Bereichen die jüngsten Commits und den aktuellen Code ansehen, statt ältere Beschreibungen zu reproduzieren.

## 3. Technischer Zustand

Die App ist eine installierbare PWA auf Basis von HTML, CSS und JavaScript ohne klassisches Frontend-Framework. `index.html` ist sehr groß und enthält einen erheblichen Teil der Oberfläche und Logik. Ergänzende Module übernehmen Dokumente, Dialoge, Sync, Kalender und Webformulare.

Die App besitzt automatisierte Regressionstests:
- `npm run test:static`
- `npm run test:browser`

CI läuft über `.github/workflows/app-ci.yml` bei Pushes und Pull Requests gegen `main`.

## 4. Sicherheitsmodell

Die App verarbeitet Gesundheitsdaten. Patientendaten dürfen nicht in GitHub landen. Für Entwicklung und Tests nur fiktive Daten verwenden.

Der Geräte-Abgleich und das Formular-Postfach sind auf Ende-zu-Ende-Verschlüsselung ausgelegt. Änderungen an `sync.js`, Schlüsselableitung, Serverformaten, Backups oder Migrationen sind Hochrisikoänderungen. Vor solchen Änderungen Datenfluss und Rückwärtskompatibilität vollständig nachvollziehen.

Der Serverteil für den aktuellen verschlüsselten Weg steckt im Wesentlichen in `formular-empfang-wordpress.txt`. `formular-empfang.php` und `sendmail.php` dokumentieren ältere bzw. alternative Wege und dürfen nicht versehentlich als aktuelle Sicherheitsarchitektur behandelt werden.

## 5. Dokumentation und Änderungshistorie

Für die weitere Entwicklung gilt fachlich:
- Medizinische Daten wie Anamnese, Diagnosen, Befunde, Behandlungsdokumentation sowie relevante Dokumente und Bilder benötigen nachvollziehbare Änderungsmechanismen.
- Persönliche interne Notizen des Praxisinhabers sollen nicht automatisch wie medizinische Dokumentation behandelt werden.
- Statt fachlich relevante Historieneinträge einfach zu löschen, ist eine ausblendbare Darstellung mit Möglichkeit zum späteren Wiedereinblenden grundsätzlich vorzuziehen. Die konkrete Umsetzung muss am aktuellen Code geprüft werden.

Diese Punkte sind Produktanforderungen, keine Aussage, dass sie im aktuellen Code bereits vollständig umgesetzt sind.

## 6. Noch offene bzw. zu prüfende Themen

Aus der bisherigen Projektdokumentation bleiben unter anderem:
- Eingabemaske für den Abstand der Terminerinnerung
- mögliche Kennzeichnung „Wiedervorstellung fehlt“
- fehlende Stammdaten bei importierten Patienten
- Import alter Termine
- ggf. manuelle Ausgaben unter Zahlungen
- weitere Nachsorge-Hinweise, sobald fachliche Regeln feststehen
- langfristig feinere Konfliktauflösung beim Geräte-Abgleich pro Akte/Objekt statt globaler Bestandsentscheidung

Vor Umsetzung prüfen, ob einer dieser Punkte seit dem letzten Dokumentationsstand bereits erledigt wurde.

## 7. Arbeitsweise für Claude

1. `CLAUDE.md` lesen.
2. `HANDOVER.md` lesen.
3. Für Detailhistorie `LIESMICH.txt` lesen.
4. Aktuellen `main` und offene Pull Requests prüfen.
5. Bei der konkreten Aufgabe die betroffenen Dateien und jüngsten Commits ansehen.
6. Eigenen Branch vom aktuellen `main` erstellen.
7. Änderung minimal und kompatibel umsetzen.
8. Statische Tests und Browser-Smoke-Tests ausführen.
9. Bei App-Code `V` in `sw.js` und `KA_V` in `index.html` identisch erhöhen.
10. Pull Request nach `main` erstellen und erst nach erfolgreicher Prüfung mergen.

## 8. Startprompt für eine neue Claude-Sitzung

Kopiere bei Bedarf folgenden Text als erste Nachricht an Claude:

> Übernimm die Weiterentwicklung meiner Praxis-App „Kreuzberg Ästhetik“ aus dem GitHub-Repository `KreuzbergAesthetik/website`. Der aktuelle produktive Stand liegt auf `main`. Lies zuerst vollständig `CLAUDE.md` und `HANDOVER.md`, danach bei Bedarf `LIESMICH.txt`. Prüfe anschließend den aktuellen Code, die jüngsten Commits und offene Pull Requests. Verlasse Dich bei Widersprüchen nicht auf veraltete Dokumentation, sondern auf den aktuellen Code und die Git-Historie. Erhalte bestehende Funktionen und das bestehende Design, sofern ich keine Änderung daran verlange. Verwende niemals echte Patientendaten in Repository, Tests, Issues oder Pull Requests. Bei Änderungen an Gesundheitsdaten, Sync, Verschlüsselung, Dokumentation oder Backups besonders konservativ vorgehen. Arbeite für jede Aufgabe auf einem neuen Branch vom aktuellen `main`, führe die vorhandenen Tests aus und erhöhe bei ausgeliefertem App-Code die PWA-Version in `sw.js` und `index.html` identisch. Antworte mir auf Deutsch, kurz und konkret. Frage nur nach, wenn eine fachlich relevante Entscheidung wirklich offen ist.

## 9. Nicht automatisch tun

- Kein Framework-Wechsel.
- Keine Komplett-Neustrukturierung von `index.html` nur aus Gründen der Codeästhetik.
- Keine Entfernung alter Datenfelder oder Migrationen ohne Kompatibilitätsplan.
- Keine externen Cloud-Dienste für Patientendaten ergänzen.
- Keine rechtlichen oder medizinischen Texte als geprüft kennzeichnen, wenn keine entsprechende Freigabe vorliegt.
- Keine UI-„Verbesserungen“ außerhalb des konkreten Auftrags.
