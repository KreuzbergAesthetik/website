# Übergabe an Claude

Stand: 11.11.2026 (Abschnitt 0 ist aktuell, die Abschnitte 1 bis 9 stammen teils vom 01.11.2026)
Repository: `KreuzbergAesthetik/website`
Produktiver Branch: `main`

## 0. Stand 11.11.2026 (aktuellste Übergabe, hat Vorrang vor den älteren Abschnitten)

**Wer, wie arbeiten:** Praxisinhaber Manuel Fella. Auf Deutsch, per Du, **sehr kurz antworten** (er hat ausdrücklich um weniger Text gebeten). Bei Design-Wünschen immer **Screenshots mit erfundenen Daten** schicken (SendUserFile), bei Unsicherheit gern nachfragen, nicht raten. Referenz fürs Design ist die Patientenakte. Rechts-/Abrechnungsfragen direkt mit Quellen beantworten, ohne wiederholte Haftungshinweise (siehe `CLAUDE.md`). Keine echten Patientendaten, nie.

**Git-Stand:**
- Stand beim Schreiben: `main` = Merge von PR #282 (`f8fb727`), Version `2026-11-11-a`. Danach wurde der Branch `ccr-39a25d4d-a2wha6` (Version `2026-11-11-c`) veröffentlicht; er enthält auch den Wiedervorstellung-Hinweis aus dem PR #283 der parallelen Sitzung (Version `2026-11-11-b`, dort schon eingearbeitet). Vor jeder neuen Arbeit `git fetch` und offene Pull Requests prüfen: Es können parallele Sitzungen existieren.
- Branch `ccr-39a25d4d-a2wha6` (der vorgegebene Sitzungsbranch), App-Version `2026-11-11-c`, enthielt zuletzt (jetzt veröffentlicht, falls PR gemergt): Suchleiste und Plus-Knopf in der Kopfzeile bei Querformat/Desktop (ab 700 px; zwischen 700 und 999 px startet die Suche eingeklappt), Schnellknöpfe beim Überfahren einer Patientenzeile mit der Maus (horizontal, nur Icons; Klick auf die Drei Punkte öffnet das senkrechte Pop-up mit Beschriftung), Drei-Punkte-Knopf ohne weißen Knopf. Alle Tests waren grün.
- Nach jedem Merge den Sitzungsbranch neu von `origin/main` aufsetzen (`git checkout -B ccr-39a25d4d-a2wha6 origin/main`), mit `git push --force-with-lease` pushen. Nie auf einen anderen Branch pushen.

**Arbeitsablauf, der sich bewährt hat:**
1. Änderung in `index.html` (und ggf. `sw.js`/Tests). **`V` in `sw.js` und `KA_V` in `index.html` müssen identisch erhöht werden** (Schema `JJJJ-MM-TT-x`).
2. `npm run code:aufteilen` (aufgeteilte Kopie neu erzeugen), `npm run test:static`, `npm run test:browser`. Für die Browser-Tests: `ln -s /opt/node-tools/node_modules node_modules` (nie committen, danach löschen) und lokal `python3 -m http.server 4173 --bind 127.0.0.1` im Repo starten, danach beenden.
3. Screenshots mit Playwright (Handy 390x844 mit `isMobile`, Querformat 915x412, Desktop 1280x700) erzeugen und mit SendUserFile schicken.
4. Commit mit Co-Authored-By-Zeilen aus dem System-Hinweis, push, PR (Beschreibung wie in PR #280 bis #282), CI abwarten (`get_check_runs`, dauert etwa 90 s; Wartezeit mit `sleep` im Hintergrund), dann `merge_pull_request` mit `expectedHeadSha`.
5. Änderungen bündeln, nicht viele kleine Pull Requests (GitHub-Konto war am 08.11.2026 vorübergehend gesperrt, siehe 6a).

**Tests (alle mit erfundenen Daten):** `npm run test:browser` führt 17 Skripte aus: browser-smoke, layout-smoke, formular-zuordnung, xss-formulare, eingang-verschluesselt, csp, rechnung-sperre, goae, rechtslinks, umschlag, weiterleitung, akte-querformat, verlauf-strich, untere-leiste, suche, rechnungen-liste, patienten-liste. Neue Funktionen bekommen einen Test mit Gegenprobe.

**Design-Konventionen (seit 10.11.2026, überall einheitlich):**
- Listen (Rechnungen, Patienten, Zahlungen, Leistungen, Lager, Statistik): weiße Seitenkarte, Kopfzeile weiß mit grauem Strich, darunter die Zeilen in einer **grauen abgerundeten Karte** (`#f1f4f8`, Rand `#d5dde7`, Radius 16), feine eingerückte Trennlinien, **durchgehender Farbstrich** (3 px) zwischen den ersten Spalten, Farbwechsel nur in der Farbe, keine Lücken. Kartenrahmen als eigene Ebene (`listFrames()`, `invPairFrames()`), damit die Karte durchgehend bleibt.
- Rechnungen: Handy zweizeilig (Nr./Nachname/Betrag, Datum/Vorname/bezahlt am bzw. Offen), ab 700 px einzeilig mit Spalten Datum, Versendet, Status. Storno und Original mit grauem Strich, gemeinsamem Rahmen und Kettensymbol. Offen mit Warndreieck, storniert mit rotem X. Briefsymbol in der Kopfzeile schaltet den Versandfilter (alle, versendet, nicht versendet).
- Patienten: Hinweise (To-Do, Rechnung offen, Anamnese, Erinnerung, nächster Termin, nicht versendet) als Strich zwischen ID und Name, blassgrau (`#cbd5e1`) wenn kein Hinweis, sonst Farbabschnitte. Farben bewusst **leuchtend** (Rot `#ef4444`, Blau `#3b82f6`, Türkis `#06b6d4`, Orange `#f97316`, Grün `#22c55e`, Gelb `#eab308`), keine gedeckten dunklen Töne.
- Kein Lila als Hervorhebung bei Storno. Die Akte (`.tl-day`) ist die Vorlage für alles.
- Untere schwebende Leiste (Handy, Hochformat): Plus-Knopf links (Pop-up Termin/Patient/Rechnung), Suchleiste standardmäßig offen, Lupe klappt sie ein (`gsCollapse`, merkt sich `ka_gs_zu` im localStorage). Akte-Aktionen stehen untereinander rechts darüber, „Mehr“ mit drei Punkten.
- Suche (`gsRun`): Patienten, Rechnungen, Termine, To-Dos, Lager, Anlagen, Leistungen.

**Noch offen / Entscheidungen beim Praxisinhaber:**
- **App auf eigenen Webspace:** Entwurf `WEBSPACE-UMZUG.md`, Anleitung `WEBSPACE-ANLEITUNG.md`, Paket `npm run webspace:paket`, Weiterleitungen alter Formular-Links `npm run webspace:weiterleitungen -- https://app.kreuzberg-aesthetik.de`. Stand: Subdomain `app.kreuzberg-aesthetik.de` ist bei IONOS angelegt, aber der Vertrag „WordPress Hosting Grow“ (Nr. 108255312) erlaubt vermutlich keinen eigenen Ordner dafür („Webspace verbinden“ nicht verfügbar). Die Domain `kreuzberg-aesthetik.de` ist Zusatz-Domain, `xberg-aesthetik.de` die Inklusiv-Domain. Plan: kleinen zusätzlichen IONOS-Webhosting-Tarif (etwa 1 bis 6 EUR pro Monat, Rechenzentrum Deutschland, SFTP) buchen und die Subdomain per A-Record darauf zeigen lassen. **Nicht** die Domain umziehen und nicht „Ersetzen/Zurücksetzen“ bei IONOS klicken (würde die Praxis-Website trennen). Danach: Server-Snippet `formular-empfang-wordpress.txt` mit der Subdomain in `ERLAUBT` in WPCode neu einfügen, Sicherung der App-Daten pro Gerät laden (neue Adresse = neuer Browser-Speicher, Passkey neu, Abgleich neu), erst dann Weiterleitungen auf GitHub Pages. Datenschutz: Patientenseiten sollen auf einem deutschen/EU-Hoster liegen, GitHub Pages überträgt IP-Adressen an Microsoft.
- **GitHub-Absicherung (Praxisinhaber selbst):** Zwei-Faktor ist jetzt aktiv (Authenticator, GitHub Mobile), Passkey als Anmeldung. Noch zu bestätigen: Wiederherstellungscodes sicher ablegen, zweiter Passkey, Praxis-Adresse unter Settings/Emails, Apps von OpenAI/Codex unter Settings/Applications widerrufen. Pro Repository nur ein KI-Assistent (Claude Code). Details in `CLAUDE.md`, Abschnitt „Betrieb und Kontosicherheit“.
- **Honorarvereinbarung-Generator:** erst bauen, wenn seine Anwältin die Struktur festgelegt hat (zwei Dokumente: strikte § 2-GOÄ-Vereinbarung mit Nr./Steigerungssatz/Betrag/Erstattungshinweis und getrennte Behandlungsbedingungen).
- Optionale Wünsche: Farbpalette der übrigen Bereiche (Kacheln: Vorlagen, To-Dos, Nachrichtenvorlagen bleiben bewusst Kacheln), Rechnungsliste weitere Spalten, PR #265 (Wiedervorstellung, offen, nicht in `main`, beim Mergen Version neu setzen).
- Backups liegen beim Praxisinhaber (Git-Bundle, Upload-Paket); nach größeren Merges neu erzeugen (`git bundle create praxis-app.bundle --all`, `npm run webspace:paket`).

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

## 6a. Betrieb und Kontosicherheit (Stand 09.11.2026)
- GitHub-Konto war am 08.11.2026 vorübergehend gesperrt (automatische Missbrauchserkennung), danach freigegeben. Regeln zur Vorbeugung stehen in `CLAUDE.md`, Abschnitt „Betrieb und Kontosicherheit (GitHub)“. Kern: ein KI-Assistent pro Repository, ein Branch je Pull Request, wenig Aktivität, Sicherung außerhalb von GitHub.
- Geplant: App auf IONOS-Subdomain `app.kreuzberg-aesthetik.de` (Entwurf `WEBSPACE-UMZUG.md`, Anleitung `WEBSPACE-ANLEITUNG.md`, Paket `npm run webspace:paket`, Weiterleitungen alter Links `npm run webspace:weiterleitungen`). Offen: IONOS-Tarif mit Webspace (WordPress Hosting Grow erlaubt wahrscheinlich keinen eigenen Ordner für die Subdomain), danach Server-Snippet mit neuer Adresse in `ERLAUBT` neu einfügen.
- Briefumschlag C6 (162 × 114 mm quer, mit Logo `logo-umschlag.png`, ab Version `2026-11-10-a`; vorher B6): Aktion in der Patientenakte, Menü Nachrichten.

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
