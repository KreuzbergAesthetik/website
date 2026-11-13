# Übergabe an Claude

Stand: 13.11.2026 (Abschnitt 0 ist aktuell, die Abschnitte 1 bis 9 stammen teils vom 01.11.2026)
Repository: `KreuzbergAesthetik/website`
Produktiver Branch: `main`

## 0. Stand 13.11.2026 (aktuellste Übergabe, hat Vorrang vor den älteren Abschnitten)

**Wer, wie arbeiten:** Praxisinhaber Manuel Fella. Auf Deutsch, per Du, **sehr kurz antworten** („Frage nicht so viel und mach einfach“, „kürzere Antworten“). Bei Design-Wünschen **Screenshots mit erfundenen Daten** schicken (SendUserFile), erst als Vorschau, dann auf „Veröffentliche“ als Pull Request durch die CI bringen und mergen. Er schickt oft Handy-Screenshots mit roter Handzeichnung: Die Zeichnung ist eine Markierung („hier“), nie ein gewünschter roter Rahmen. Rechts-/Abrechnungsfragen direkt mit Quellen beantworten (siehe `CLAUDE.md`). Keine echten Patientendaten, nie. Kein Passwort in den Chat, nur ins Server-Snippet.

**Git-Stand:**
- `main` = Merge von PR #294 (`4470ddf`), App-Version `2026-11-13-a` (`V` in `sw.js` = `KA_V` in `index.html`). Es gibt keine offenen Pull Requests von dieser Sitzung. **PR #265 (Wiedervorstellung) ist erledigt** (über #283 und #284 in `main`), nicht mehr mergen.
- Es gibt zwei Claude-Sitzungen mit eigenen Branches: `ccr-39a25d4d-a2wha6` (andere Sitzung) und `claude/vibrant-faraday-ff1gfb` (diese). Die andere hat einmal meinen PR in ihren Branch gemergt und ihren PR vor meinem Push gemergt. **Vor jedem Push `git fetch`, offene Pull Requests und Branch-Stand prüfen.** Nach jedem Merge den eigenen Branch neu von `origin/main` aufsetzen (`git checkout -B <branch> origin/main`, danach `git push -f`; erlaubt, weil der Branch nur schon gemergte Commits enthält). Nie auf einen fremden Branch pushen, ohne zu fragen.
- **Vorsicht mit `git add -A`:** Ein Screenshot (`fz.png`) kam so versehentlich in `main` (PR #286 hat ihn entfernt). Vor dem Commit `git status` ansehen, Screenshots nur im Scratchpad ablegen.

**Arbeitsablauf, der sich bewährt hat:**
1. Änderung in `index.html` (und ggf. `sw.js`/Tests). **`V` in `sw.js` und `KA_V` in `index.html` identisch erhöhen** (Schema `JJJJ-MM-TT-x`). Reine Doku (Markdown/TXT) braucht keinen Versionssprung.
2. `npm run code:aufteilen`, `npm run test:static`, `npm run test:browser`. Playwright ist global installiert: `mkdir -p node_modules && ln -sfn "$(npm root -g)/playwright" node_modules/playwright` (ist in `.gitignore`), lokal `python3 -m http.server 4173 --bind 127.0.0.1` im Repo starten, danach beenden (`pkill -f "http.server 4173"`).
3. Screenshots mit Playwright (Handy 390x844 mit `isMobile`, Querformat 915x412 oder 1000x412, Desktop 1280x700, `deviceScaleFactor` 2) mit erfundenen Daten erzeugen und schicken. Hinweis-Einblendung („13 Vorlagen wurden angelegt …“) vorher entfernen. Nach Änderungen an `patients`/`events` im Test `FLC = null` setzen (Hinweis-Zwischenspeicher).
4. Commit mit den Co-Authored-By-Zeilen aus dem System-Hinweis, push, PR (Beschreibung wie die letzten PRs), `subscribe_pr_activity`, bei grüner CI (`get_check_runs`, etwa 2 Minuten) `merge_pull_request`. Benachrichtigungen mit `ReadNotifications` lesen; ein `check_suite.completed` kann zu einem älteren Commit gehören, dann `get_check_runs` und Kopf-SHA prüfen.
5. Änderungen bündeln (GitHub-Konto war am 08.11.2026 vorübergehend gesperrt, siehe 6a).

**Tests (alle mit erfundenen Daten):** `npm run test:browser` führt 19 Skripte aus: browser-smoke, layout-smoke, formular-zuordnung, xss-formulare, eingang-verschluesselt, csp, rechnung-sperre, goae, rechtslinks, umschlag, weiterleitung, akte-querformat, verlauf-strich, untere-leiste, suche, rechnungen-liste, patienten-liste, **einrichtungspasswort**, **akte-rand**. Neue Funktionen bekommen einen Test mit Gegenprobe. Es gibt noch keine eigenen Tests für die neue Zeitleiste, die Termin-Ansicht, die Zahlungen-Zeilen und die Spalte Geburtsdatum.

**Was seit dem 11.11.2026 dazukam (PR #283 bis #294):**
- **Einrichtungspasswort (PR #287, wichtig):** Die Einrichtungsmaske der App verlangt zusätzlich ein Einrichtungspasswort. Es steht nur im Server-Snippet bei `EINRICHTUNG` (WPCode) und wird über die neue Route `/ka/v1/zugang` geprüft (Antwort nur ja/nein, ab 10 Fehlversuchen je Stunde gesperrt). Ohne Verbindung oder mit altem Snippet wird nicht eingerichtet. Lokal (`localhost`, `127.0.0.1`) entfällt die Prüfung, `?zugang=1` erzwingt sie (Test). Der Praxisinhaber hat laut eigener Aussage das neue Snippet mit Passwort in WPCode eingetragen, auf dem echten Server ungetestet. Beim Ändern von `formular-empfang-wordpress.txt` immer das ganze Snippet ersetzen lassen (altes `ka_cfg` würde sonst gewinnen). Details in `LIESMICH.txt`.
- **Kopfzeile:** Querformat/Desktop: Suche und schwarzes Plus rechts, beide ohne Schatten; „Praxis“ nur als Pfeil; schmalere Reiter und Suche, damit „Rechnungen“ sichtbar bleibt; aktiver Reiter hat schwarze Schrift und Unterstreichung in der Bereichsfarbe, nur so breit wie die Schrift. Hochkant: Plus-Knopf schwarz **rechts** neben der Suchleiste (nicht mehr links).
- **Überschriften der Seiten:** schwarz, davor ein kleiner Strich in der Bereichsfarbe (wie in den Fenstern); der farbige Streifen links an den Seitenkarten ist entfernt. Rechnungen hat jetzt eine Überschrift, Umschalter, Suche und Knöpfe stehen breit in einer Zeile.
- **Zahlungen:** offene und überfällige Rechnungen oben wie in Rechnungen (gemeinsame Funktion `invRowBuild(tb, i, zl)`, Tabelle `#zl-open-t`, CSS-Regeln für `#inv-table` sind dafür zeilenweise kopiert), Euro-Symbol statt Text-Knopf „Zahlung“.
- **Akte:** Hochkant liegen die Akte-Aktionen als schmale farbige Streifen am rechten Rand (Antippen, Herausziehen oder Pfeil `.a-fab-tog` klappen aus, JS `aFabOut`). Linke Karte mit grauem Rahmen, Zurück-Pfeil größer, Alter als Zahl neben dem Namen. **Zeitleiste** (PR #290/#291): eine Karte für alles, Datum (erster Eintrag des Tages) und Uhrzeit rechtsbündig links vom durchgehenden Farbstrich, Tageslinie dünn dunkelgrau über die ganze Zeile und über den Strich, Ereignisse mit dünner hellgrauer Linie nur rechts vom Strich, kleiner Abstand zwischen umrandeten Karten.
- **Termin-Ansicht:** Knopf „Bestätigung“ (Vorlage „Terminbestätigung (E-Mail)“ mit Datum/Uhrzeit **dieses** Termins über `phEvent` in `fillPlatzhalter`), Kopieren und Bearbeiten oben neben Schließen, alle Knöpfe einfarbig (nur Löschen rot). Bekannt: Die Absagebestätigung (`tvCancel`) nimmt weiter den nächsten statt des abgesagten Termins.
- **Popups und Menüs:** Suchergebnis-Popup scrollbar und über den Akte-Knöpfen; Praxis-Menü auch am Desktop und im Querformat in Spalten, scrollbar.
- **Patientenliste quer (ab 700 px, PR #293/#294):** Geburtsdatum als eigene sortierbare Spalte, Strich zwischen ID und Name **durchgehend blau**, die Hinweise (To-Do, Rechnung offen, Anamnese, Erinnerung, nächster Termin, nicht versendet) als kleine farbige Punkte hinter dem Namen. Hochkant unverändert (Strich in Hinweisfarben, Geburtsdatum unter dem Namen).

**Design-Konventionen (Stand jetzt):**
- Listen (Rechnungen, Patienten, Zahlungen, Leistungen, Lager, Statistik): weiße Seitenkarte, darunter die Zeilen in einer **grauen abgerundeten Karte** (`#f1f4f8`, Rand `#d5dde7`, Radius 16), feine eingerückte Trennlinien, **durchgehender Farbstrich** (3 px) zwischen den ersten Spalten, keine Lücken. Kartenrahmen als eigene Ebene (`listFrames()`, `invPairFrames()`). Die Akte ist die Vorlage für alles.
- Rechnungen: Handy zweizeilig, ab 700 px einzeilig mit Spalten Datum, Versendet, Status. Storno und Original mit grauem Strich, gemeinsamem Rahmen und Kettensymbol. Offen mit Warndreieck, storniert mit rotem X. Briefsymbol schaltet den Versandfilter.
- Farben bewusst leuchtend (Rot `#ef4444`, Blau `#3b82f6`, Türkis `#06b6d4`, Orange `#f97316`, Grün `#22c55e`, Gelb `#eab308`). Buttons möglichst einfarbig/neutral; Grün nur für Speichern/Senden, Löschen als kleines rotes Umriss-Symbol (`CLAUDE.md`).
- Untere schwebende Leiste (Hochkant): Suchleiste mit schwarzem Plus rechts (Pop-up Termin/Patient/Rechnung), Lupe klappt sie ein (`gsCollapse`, `ka_gs_zu`). Suche (`gsRun`): Patienten, Rechnungen, Termine, To-Dos, Lager, Anlagen, Leistungen.

**Noch offen / Entscheidungen beim Praxisinhaber:**
- **Serverpasswort vor die App (nach dem IONOS-Umzug):** Die Sperrmaske allein verhindert nicht, dass ein Fremder auf der öffentlichen Adresse eine eigene App einrichtet (seine Daten bleiben leer, Deine sieht er nicht). Das Einrichtungspasswort (oben) sperrt das jetzt. Zusätzlich ginge ein Apache-Verzeichnisschutz (`.htaccess` mit Basic-Auth, `.htpasswd` außerhalb des Webordners, Passwort nie ins Repository) auf der Subdomain. **Frei bleiben müssen** die Patientenseiten: `anmeldung.html`, `anamnese.html`, `erinnerung.html`, `aufklaerung.html`, `info.html`, `postfachtest.html` und ihre Bausteine `forms.js`, `ftexte.js`, `docs.js`, `pdf-lib.min.js`, `forms.css`, `icon-192.png`, `manifest.webmanifest` (Manifest wird ohne Anmeldedaten abgerufen). Der Praxisinhaber hat gesagt, ihm reicht ein Passwort in der Maske; der Serverschutz ist ein späterer Zusatz, bisher nicht gebaut. Auf GitHub Pages nicht möglich.
- **App auf eigenen Webspace:** Entwurf `WEBSPACE-UMZUG.md`, Anleitung `WEBSPACE-ANLEITUNG.md`, Paket `npm run webspace:paket` (enthält alle `.png` im Hauptordner, daher keine Screenshots dort ablegen), Weiterleitungen `npm run webspace:weiterleitungen -- https://app.kreuzberg-aesthetik.de`. Stand: Subdomain `app.kreuzberg-aesthetik.de` bei IONOS angelegt, aber der Vertrag „WordPress Hosting Grow“ erlaubt vermutlich keinen eigenen Ordner dafür („Webspace verbinden“ nicht verfügbar). Plan: kleinen zusätzlichen IONOS-Webhosting-Tarif buchen und die Subdomain per A-Record darauf zeigen lassen. **Nicht** die Domain umziehen und nicht „Ersetzen/Zurücksetzen“ klicken (würde die Praxis-Website trennen). Danach `ERLAUBT` im Server-Snippet um die Subdomain ergänzen und neu in WPCode einfügen, Sicherung pro Gerät laden (neue Adresse = neuer Browser-Speicher, Passkey und Abgleich neu), erst dann Weiterleitungen auf GitHub Pages.
- **Unsicher gedeutete Wünsche (bei Gelegenheit nachfragen):** (1) Die Pfeile am Reiter „Patienten“ wurden als „Unterstreichung schmaler“ gelesen. (2) „Rechnungen immer ausgeklappt als Standard“ als „Reiter immer sichtbar“ gelesen. (3) Hochkant liegen bei eingeklappter Suche zwei Knöpfe (Plus, Lupe) unten rechts und können die Drei-Punkte der Liste überdecken, Wunsch war wohl Randstreifen wie in der Akte, nicht umgesetzt. (4) Die Tageslinie (1,5 px) wird auf manchen Bildschirmen unterschiedlich dick dargestellt; Alternative: 1 px in dunklerer Farbe.
- **GitHub-Absicherung (Praxisinhaber selbst):** Wiederherstellungscodes ablegen, zweiter Passkey, Apps von OpenAI/Codex widerrufen. Pro Repository nur ein KI-Assistent. Details in `CLAUDE.md`.
- **Honorarvereinbarung-Generator:** erst bauen, wenn die Anwältin die Struktur festgelegt hat.
- Backups liegen beim Praxisinhaber (Git-Bundle `git bundle create praxis-app.bundle --all`, `npm run webspace:paket`); nach größeren Merges neu erzeugen.

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
