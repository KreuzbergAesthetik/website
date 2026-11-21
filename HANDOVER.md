# Übergabe an Claude

Stand: 16.11.2026 (Abschnitt 0 ist aktuell, die Abschnitte 1 bis 9 stammen teils vom 01.11.2026)
Repository: `KreuzbergAesthetik/website`
Produktiver Branch: `main`

## 0. Stand 16.11.2026 (aktuellste Übergabe, hat Vorrang vor den älteren Abschnitten)

**Wer, wie arbeiten:** Praxisinhaber Manuel Fella. Auf Deutsch, per Du, **sehr kurz antworten** („Frage nicht so viel und mach einfach“, „kürzere Antworten“). Bei Design-Wünschen **Screenshots mit erfundenen Daten** schicken (SendUserFile), erst als Vorschau, dann auf „Veröffentliche“ als Pull Request durch die CI bringen und mergen. Er schickt oft Handy-Screenshots mit roter Handzeichnung: Die Zeichnung ist eine Markierung („hier“), nie ein gewünschter roter Rahmen. Rechts-/Abrechnungsfragen direkt mit Quellen beantworten (siehe `CLAUDE.md`). Keine echten Patientendaten, nie. Kein Passwort in den Chat, nur ins Server-Snippet. **Modellwahl:** Der Praxisinhaber arbeitet normalerweise mit Sonnet bei mittlerem Aufwand und möchte, dass Claude **vorher darauf hinweist**, wenn eine Aufgabe nach seiner Einschätzung ein stärkeres Modell oder mehr Aufwand verdient (Verschlüsselung, Geräte-Abgleich, Datenformate und Migrationen, größere Umbauten in `index.html`, schwer auffindbare Fehler), mit kurzer Begründung. Die Entscheidung trifft er.

**Veröffentlichungsrhythmus (17.11.2026):** höchstens einmal am Tag oder wenn Claude vorschlägt, dass es sich lohnt; sonst nur auf ausdrückliche Aufforderung. Keine Git-Fachbegriffe in Antworten (siehe `CLAUDE.md`).

**Git-Stand:**
- `main` = Merge von PR #297 (`e3e47d9`), App-Version `2026-11-16-a` (`V` in `sw.js` = `KA_V` in `index.html`). Es gibt keine offenen Pull Requests von dieser Sitzung. **PR #265 (Wiedervorstellung) ist erledigt** (über #283 und #284 in `main`), nicht mehr mergen.
- Es gibt zwei Claude-Sitzungen mit eigenen Branches: `ccr-39a25d4d-a2wha6` (andere Sitzung) und `claude/vibrant-faraday-ff1gfb` (diese). Die andere hat einmal meinen PR in ihren Branch gemergt und ihren PR vor meinem Push gemergt. **Vor jedem Push `git fetch`, offene Pull Requests und Branch-Stand prüfen.** Nach jedem Merge den eigenen Branch neu von `origin/main` aufsetzen (`git checkout -B <branch> origin/main`, danach `git push -f`; erlaubt, weil der Branch nur schon gemergte Commits enthält). Nie auf einen fremden Branch pushen, ohne zu fragen.
- **Vorsicht mit `git add -A`:** Ein Screenshot (`fz.png`) kam so versehentlich in `main` (PR #286 hat ihn entfernt). Vor dem Commit `git status` ansehen, Screenshots nur im Scratchpad ablegen.

**Arbeitsablauf, der sich bewährt hat:**
1. Änderung in `index.html` (und ggf. `sw.js`/Tests). **`V` in `sw.js` und `KA_V` in `index.html` identisch erhöhen** (Schema `JJJJ-MM-TT-x`). Reine Doku (Markdown/TXT) braucht keinen Versionssprung.
2. **Tests nur auf Zuruf:** Der Praxisinhaber will nicht bei jeder Änderung testen lassen (dauert lange, kostet Ressourcen). Zwischendurch nur Screenshots ansehen. Erst wenn er „Veröffentliche“ oder „bereit für eine Version“ sagt: einmal alles (`npm run code:aufteilen`, `npm run test:static`, `npm run test:browser`), nötige Tests anpassen, dann PR und merge. Playwright ist global installiert: `mkdir -p node_modules && ln -sfn "$(npm root -g)/playwright" node_modules/playwright` (ist in `.gitignore`), lokal `python3 -m http.server 4173 --bind 127.0.0.1` im Repo starten, danach beenden (`pkill -f "http.server 4173"`).
3. Screenshots mit Playwright (Handy 390x844 mit `isMobile`, Querformat 915x412 oder 1000x412, Desktop 1280x700, `deviceScaleFactor` 2) mit erfundenen Daten erzeugen und schicken. Hinweis-Einblendung („13 Vorlagen wurden angelegt …“) vorher entfernen. Nach Änderungen an `patients`/`events` im Test `FLC = null` setzen (Hinweis-Zwischenspeicher).
4. Commit mit den Co-Authored-By-Zeilen aus dem System-Hinweis, push, PR (Beschreibung wie die letzten PRs), `subscribe_pr_activity`, bei grüner CI (`get_check_runs`, etwa 2 Minuten) `merge_pull_request`. Benachrichtigungen mit `ReadNotifications` lesen; ein `check_suite.completed` kann zu einem älteren Commit gehören, dann `get_check_runs` und Kopf-SHA prüfen.
5. Änderungen bündeln (GitHub-Konto war am 08.11.2026 vorübergehend gesperrt, siehe 6a).

**Tests (alle mit erfundenen Daten):** `npm run test:browser` führt 22 Skripte aus: browser-smoke, layout-smoke, formular-zuordnung, xss-formulare, eingang-verschluesselt, csp, rechnung-sperre, goae, rechtslinks, umschlag, weiterleitung, akte-querformat, verlauf-strich, untere-leiste, suche, rechnungen-liste, patienten-liste, **einrichtungspasswort**, **akte-rand**, **patienten-quer**. Neue Funktionen bekommen einen Test mit Gegenprobe. **Namensleiste der Akte (Version `2026-11-17-a`, Entwurf des Praxisinhabers):** Rahmen immer dunkles Patientenblau `#1e3a8a`, nur der Zurück-Pfeil trägt die Farbe der Anrede (seit Version `2026-11-19-b`: Frau Rosa `#e879a9`, Herr Blau `#5b87d6`, Divers Grün `#7cc38a`; Alter und Nummer `#718096`), Name einzeilig wenn er passt, sonst zweizeilig (Nachname oben, Vorname darunter, nie dreizeilig, JS `akteNameFit`), rechts Stift, Alter und Nummer untereinander, ♀/♂-Symbol entfällt (Anrede als Tooltip), Test `tests/akte-namensleiste.mjs` (Nr. 22). Seit Version `2026-11-16-b` deckt `tests/zeitleiste-termin-zahlungen.mjs` (Nr. 21) Zeitleiste, Termin-Ansicht (Bestätigung, Absage) und Zahlungen ab.

**Was seit dem 11.11.2026 dazukam (PR #283 bis #294):**
- **Einrichtungspasswort (PR #287, wichtig):** Die Einrichtungsmaske der App verlangt zusätzlich ein Einrichtungspasswort. Es steht nur im Server-Snippet bei `EINRICHTUNG` (WPCode) und wird über die neue Route `/ka/v1/zugang` geprüft (Antwort nur ja/nein, ab 10 Fehlversuchen je Stunde gesperrt). Ohne Verbindung oder mit altem Snippet wird nicht eingerichtet. Lokal (`localhost`, `127.0.0.1`) entfällt die Prüfung, `?zugang=1` erzwingt sie (Test). Der Praxisinhaber hat laut eigener Aussage das neue Snippet mit Passwort in WPCode eingetragen, auf dem echten Server ungetestet. Beim Ändern von `formular-empfang-wordpress.txt` immer das ganze Snippet ersetzen lassen (altes `ka_cfg` würde sonst gewinnen). Details in `LIESMICH.txt`.
- **Kopfzeile:** Querformat/Desktop: Suche und schwarzes Plus rechts, beide ohne Schatten; „Praxis“ nur als Pfeil; schmalere Reiter und Suche, damit „Rechnungen“ sichtbar bleibt; aktiver Reiter hat schwarze Schrift und Unterstreichung in der Bereichsfarbe, nur so breit wie die Schrift. Hochkant: Plus-Knopf schwarz **rechts** neben der Suchleiste (nicht mehr links).
- **Überschriften der Seiten:** schwarz, davor ein kleiner Strich in der Bereichsfarbe (wie in den Fenstern); der farbige Streifen links an den Seitenkarten ist entfernt. Rechnungen hat jetzt eine Überschrift, Umschalter, Suche und Knöpfe stehen breit in einer Zeile.
- **Zahlungen:** offene und überfällige Rechnungen oben wie in Rechnungen (gemeinsame Funktion `invRowBuild(tb, i, zl)`, Tabelle `#zl-open-t`, CSS-Regeln für `#inv-table` sind dafür zeilenweise kopiert), Euro-Symbol statt Text-Knopf „Zahlung“.
- **Akte:** Hochkant liegen die Akte-Aktionen als schmale farbige Streifen am rechten Rand (Antippen, Herausziehen oder Pfeil `.a-fab-tog` klappen aus, JS `aFabOut`). Linke Karte mit grauem Rahmen, Zurück-Pfeil größer, Alter als Zahl neben dem Namen. **Zeitleiste** (PR #290/#291): eine Karte für alles, Datum (erster Eintrag des Tages) und Uhrzeit rechtsbündig links vom durchgehenden Farbstrich, Tageslinie dünn dunkelgrau über die ganze Zeile und über den Strich, Ereignisse mit dünner hellgrauer Linie nur rechts vom Strich, kleiner Abstand zwischen umrandeten Karten.
- **Termin-Ansicht:** Knopf „Bestätigung“ (Vorlage „Terminbestätigung (E-Mail)“ mit Datum/Uhrzeit **dieses** Termins über `phEvent` in `fillPlatzhalter`), Kopieren und Bearbeiten oben neben Schließen, alle Knöpfe einfarbig (nur Löschen rot). Die Absagebestätigung (`tvCancel`) nutzt ebenfalls `phEvent` (Version `2026-11-16-b`).
- **Popups und Menüs:** Suchergebnis-Popup scrollbar und über den Akte-Knöpfen; Praxis-Menü auch am Desktop und im Querformat in Spalten, scrollbar.
- **Patientenliste (Stand 15.11.2026, Version `2026-11-15-a`):** Strich zwischen ID und Name überall **durchgehend blau**. Die Hinweise (Allergie, To-Do, Rechnung offen, Anamnese, Erinnerung, nächster Termin, nicht versendet) sind kleine farbige Punkte senkrecht **zwischen Strich und Name** (hochkant und quer); **Allergie** ist ein etwas größerer dunkelroter Punkt mit Tooltip „Allergie: …“, die Legende schwebt im Querformat unten links (ⓘ-Knopf dort ausgeblendet). Vorname schwarz. Querformat (ab 700 px): Spalten ID, Name, Geburtsdatum (sortierbar), Informationen (Telefon und E-Mail mit Symbol untereinander) und Aktionen; ganze linke Zone (Name, Geburtsdatum, Punkte) öffnet die Akte; beim Überfahren der rechten Zone blenden die Schnellaktionen ein; das Erstelldatum-Symbol steht klein, ohne Fläche, rechts in der Tabellenkopfzeile. **Import** (und Abrufen) stehen oben in der Kopfzeile der Karte. Hochkant: Geburtsdatum unter dem Namen.

- **Neues App-Logo „Praxis Flow“ (PR #297, 16.11.2026):** Nur für die App des Praxisinhabers: `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (mit Schutzrand), `apple-touch-icon.png`, eingebettetes Kopf-Logo (`img.hd-logo`) und Favicon (Data-URIs in `index.html`), Sperrmaske. **Das alte runde Praxis-Logo (Kreuzberg Ästhetik) bleibt** auf den Patientenseiten, im PDF-Kopf der Formulare (`forms.js`), auf Rechnungen (`#inv-logo`) und Briefumschlag (`logo-umschlag.png`). Das alte Symbol liegt dafür als `logo-praxis.png` im Hauptordner und steht in der Offline-Liste von `sw.js`. Beim Austauschen von Symbolen die Quelldatei (PNG mit transparenten Ecken, 5000 px) mit Pillow zuschneiden (Logo füllt 94 % bei den normalen Symbolen, 64 % bei `maskable`). Auf dem Handy wechselt das Startbildschirm-Symbol oft erst nach Neu-Hinzufügen der App.

**Neue Navigation am Handy hochkant (Version `2026-11-18-b`, 18.11.2026):** Nur bei `(max-width:699px) and (orientation:portrait)` (JS `KA_PH`): Reiter oben ausgeblendet, unten Leiste `#bnav` (Kalender, Patienten, To-Dos mit Zähler `#bnav-todo-badge`, Rechnungen, „Mehr“ öffnet das Praxis-Menü nach oben), aktiver Reiter per `bnavSync()` in der Bereichsfarbe. Oben in der Kopfzeile: Logo, Suche (immer offen, `gsCollapse` klappt hier nicht ein) und Plus-Knopf (Pop-up nach unten). Tablet hochkant behält die schwebende Suche unten, Querformat/Desktop unverändert. **Akte-Streifen:** `AM_DOCK` enthält jetzt alle Aktionen (auch Termin und Rechnung); als Streifen (hochkant) zeigt `aFabFit()` so viele, wie die Höhe hergibt, der Rest unter „…“. Breit bleiben es die fünf Grundaktionen. **Allergie** in der Patientenliste: roter Kreis mit weißem Ausrufezeichen. Wunsch (3) aus der Liste unten ist damit erledigt.

**Hinweis-Punkte (Version `2026-11-19-b`):** In der Patientenliste höchstens drei Punkte untereinander, Allergie oben, die anderen mittig darunter; ab vier wird der dritte zum grauen Plus (`.d-more`) mit Pop-up `#pt-hintpop` (alle Hinweise). Spalte „Informationen“ im Querformat linksbündig. Test `tests/punkte-limit.mjs` (Nr. 24). **Kalenderfarbe** Türkis (`--c-kal`), Termine ohne eigene Farbe Schiefergrau (`.ev`, `.mp`). **Startseite:** Strich vor der Überschrift in der Bereichsfarbe statt Seitenstreifen. **Tageskalender** am Handy hochkant passt auf eine Seite (`H` dynamisch in `renderCal`). **Legende** schwebend (`#lg-float`).

**Design-Konventionen (Stand jetzt):**
- Listen (Rechnungen, Patienten, Zahlungen, Leistungen, Lager, Statistik): weiße Seitenkarte, darunter die Zeilen in einer **grauen abgerundeten Karte** (`#f1f4f8`, Rand `#d5dde7`, Radius 16), feine eingerückte Trennlinien, **durchgehender Farbstrich** (3 px) zwischen den ersten Spalten, keine Lücken. Kartenrahmen als eigene Ebene (`listFrames()`, `invPairFrames()`). Die Akte ist die Vorlage für alles.
- Rechnungen: Handy zweizeilig, ab 700 px einzeilig mit Spalten Datum, Versendet, Status. Storno und Original mit grauem Strich, gemeinsamem Rahmen und Kettensymbol. Offen mit Warndreieck, storniert mit rotem X. Briefsymbol schaltet den Versandfilter.
- Farben bewusst leuchtend (Rot `#ef4444`, Blau `#3b82f6`, Türkis `#06b6d4`, Orange `#f97316`, Grün `#22c55e`, Gelb `#eab308`). Buttons möglichst einfarbig/neutral; Grün nur für Speichern/Senden, Löschen als kleines rotes Umriss-Symbol (`CLAUDE.md`).
- Untere schwebende Leiste (Hochkant): Suchleiste mit schwarzem Plus rechts (Pop-up Termin/Patient/Rechnung), Lupe klappt sie ein (`gsCollapse`, `ka_gs_zu`). Suche (`gsRun`): Patienten, Rechnungen, Termine, To-Dos, Lager, Anlagen, Leistungen.

**Noch offen / Entscheidungen beim Praxisinhaber:**
- **Serverpasswort vor die App (nach dem IONOS-Umzug):** Die Sperrmaske allein verhindert nicht, dass ein Fremder auf der öffentlichen Adresse eine eigene App einrichtet (seine Daten bleiben leer, Deine sieht er nicht). Das Einrichtungspasswort (oben) sperrt das jetzt. Zusätzlich ginge ein Apache-Verzeichnisschutz (`.htaccess` mit Basic-Auth, `.htpasswd` außerhalb des Webordners, Passwort nie ins Repository) auf der Subdomain. **Frei bleiben müssen** die Patientenseiten: `anmeldung.html`, `anamnese.html`, `erinnerung.html`, `aufklaerung.html`, `info.html`, `postfachtest.html` und ihre Bausteine `forms.js`, `ftexte.js`, `docs.js`, `pdf-lib.min.js`, `forms.css`, `icon-192.png`, `manifest.webmanifest` (Manifest wird ohne Anmeldedaten abgerufen). Der Praxisinhaber hat gesagt, ihm reicht ein Passwort in der Maske; der Serverschutz ist ein späterer Zusatz, bisher nicht gebaut. Auf GitHub Pages nicht möglich.
- **App auf eigenen Webspace:** Entwurf `WEBSPACE-UMZUG.md`, Anleitung `WEBSPACE-ANLEITUNG.md`, Paket `npm run webspace:paket` (enthält alle `.png` im Hauptordner, daher keine Screenshots dort ablegen), Weiterleitungen `npm run webspace:weiterleitungen -- https://app.kreuzberg-aesthetik.de`. Stand: Subdomain `app.kreuzberg-aesthetik.de` bei IONOS angelegt, aber der Vertrag „WordPress Hosting Grow“ erlaubt vermutlich keinen eigenen Ordner dafür („Webspace verbinden“ nicht verfügbar). Plan: kleinen zusätzlichen IONOS-Webhosting-Tarif buchen und die Subdomain per A-Record darauf zeigen lassen. **Nicht** die Domain umziehen und nicht „Ersetzen/Zurücksetzen“ klicken (würde die Praxis-Website trennen). Danach `ERLAUBT` im Server-Snippet um die Subdomain ergänzen und neu in WPCode einfügen, Sicherung pro Gerät laden (neue Adresse = neuer Browser-Speicher, Passkey und Abgleich neu), erst dann Weiterleitungen auf GitHub Pages.
- **Unsicher gedeutete Wünsche (bei Gelegenheit nachfragen):** (1) Die Pfeile am Reiter „Patienten“ wurden als „Unterstreichung schmaler“ gelesen. (2) „Rechnungen immer ausgeklappt als Standard“ als „Reiter immer sichtbar“ gelesen. (3) Hochkant liegen bei eingeklappter Suche zwei Knöpfe (Plus, Lupe) unten rechts und können die Drei-Punkte der Liste überdecken, Wunsch war wohl Randstreifen wie in der Akte, nicht umgesetzt. (5) To-Do (`#ef4444`) und Allergie (`#b91c1c`) sind zwei ähnliche Rottöne in der Patientenliste; bei Verwechslung das To-Do-Rot ändern. (4) Die Tageslinie (1,5 px) wird auf manchen Bildschirmen unterschiedlich dick dargestellt; Alternative: 1 px in dunklerer Farbe.
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

## 8. Startprompt für eine neue Claude-Sitzung (Stand 16.11.2026)

Kopiere bei Bedarf folgenden Text als erste Nachricht an Claude:

```text
Übernimm die Weiterentwicklung meiner Praxis-App „Kreuzberg Ästhetik“ aus dem GitHub-Repository KreuzbergAesthetik/website. Der aktuelle produktive Stand liegt auf main.

Lies zuerst vollständig CLAUDE.md und in HANDOVER.md den Abschnitt 0 (er hat Vorrang vor den älteren Abschnitten). Bei Bedarf danach LIESMICH.txt. Prüfe dann den aktuellen Code, die jüngsten Commits und die offenen Pull Requests. Bei Widersprüchen gelten Code und Git-Historie, nicht veraltete Dokumentation.

So arbeiten wir:
- Antworte auf Deutsch, per Du, sehr kurz. Frage nur, wenn eine fachlich relevante Entscheidung wirklich offen ist.
- Bei Design-Wünschen zuerst eine Vorschau mit Screenshots (erfundene Daten, per SendUserFile), erst nach meinem „Veröffentliche“ als Pull Request mit CI und Merge.
- Tests nur auf Zuruf: Zwischendurch nur Screenshots ansehen. Erst wenn ich „Veröffentliche“ oder „bereit für eine Version“ sage, einmal alles testen (test:static, test:browser), nötige Tests anpassen, dann PR und merge.
- Eigenen Branch vom aktuellen main, vor jedem Push git fetch (es kann eine zweite Claude-Sitzung geben). V in sw.js und KA_V in index.html bei App-Änderungen identisch erhöhen. Vor dem Commit git status ansehen, keine Screenshots einchecken.
- Erhalte bestehende Funktionen und das Design, sofern ich keine Änderung verlange. Erfinde keine Funktionen, Texte oder Datenfelder.
- Niemals echte Patientendaten in Repository, Tests, Issues oder Pull Requests. Passwörter nie in den Chat, nur ins Server-Snippet.
- Weise mich vorher kurz mit Begründung darauf hin, wenn eine Aufgabe ein stärkeres Modell oder mehr Aufwand verdient (Verschlüsselung, Geräte-Abgleich, Datenformate, Migrationen, größere Umbauten, schwer auffindbare Fehler). Ich entscheide.

Offene Punkte stehen in HANDOVER.md Abschnitt 0 (Serverpasswort nach dem IONOS-Umzug, unsicher gedeutete Wünsche, fehlende Tests für Zeitleiste, Termin-Ansicht und Zahlungen). Frag mich zu Beginn, was ich als Nächstes möchte.
```

## 9. Nicht automatisch tun

- Kein Framework-Wechsel.
- Keine Komplett-Neustrukturierung von `index.html` nur aus Gründen der Codeästhetik.
- Keine Entfernung alter Datenfelder oder Migrationen ohne Kompatibilitätsplan.
- Keine externen Cloud-Dienste für Patientendaten ergänzen.
- Keine rechtlichen oder medizinischen Texte als geprüft kennzeichnen, wenn keine entsprechende Freigabe vorliegt.
- Keine UI-„Verbesserungen“ außerhalb des konkreten Auftrags.


## Schnellzugriffe der Akte (2026-11-21-g)
- Höchstens drei runde, durchsichtige Knöpfe schweben dauerhaft am Rand (kein Ein-/Ausklappen mehr). Auswahl in `settings.akteDock` (Aktions-Kennungen aus `AM_DOCK`), Standard Dokumentation, Termin, Rechnung. Anpassen über das „…“-Menü → „Schnellzugriffe anpassen“ (`aDockEdit`/`aDockSave`).
- Zeitleisten-Zeilen zeigen beim Überfahren (Maus) bzw. Antippen des Pfeils (Touch) dieselben Symbole plus „…“ für die Aktionen des Eintrags (`tlPlus`, `.tl-quick`).

## Sitzung merken und Videos (2026-11-21-e/f)
- Sitzung merken: nach dem Entsperren liegt der nicht exportierbare Datenschlüssel bis 20 Minuten nach der letzten Nutzung in IndexedDB `ka-sitzung`; „App sperren“, Ablauf und Abschalten (Menü Sicherheit) löschen ihn. Tests, die einen gesperrten Neustart brauchen, müssen `alSessSet(false)` aufrufen.
- Videos: nur auf dem Gerät (IndexedDB `ka-videos`, verschlüsselt, höchstens 100 MB), Angaben in `p.videos`; nicht in der normalen Sicherung und nicht im Abgleich. Eigene verschlüsselte Videosicherung unter Sicherung → Videos (`vbkExport`/`vbkImport`).


## PDF bearbeiten und Vorlagenfelder (2026-11-21-q, `pdfedit.js`)
- `pdfEdit(p, rec)`: Arbeitsdokument bearbeiten (Stift, Textmarker, Text, Haken, Kreuz, Radierer, Rückgängig). Erstes Speichern legt die vorige Fassung als ausgeblendetes Dokument an (`vonDok`, `rec.annoBase`), Einträge liegen in `rec.anno` und bleiben bearbeitbar, bis neu unterschrieben wird (`rec.annoSig`). Jede Speicherung im Änderungsprotokoll.
- `tplFields(t)`: Felder der Vorlage (`t.fields`: k, p, x, y, s, txt, w); vorbelegt aus der Akte, fester Text, freies Feld (bleibt leer, im Editor als Platzhalter). `fillStampPdf` nutzt `t.fields`, sonst die alten festen Positionen `FILL_POS` (werden beim ersten Öffnen der Felder übernommen).
- Zweite Unterschrift (Arzt): `t.sig2` (x, y; Seite und Breite wie `t.sig`), `rec.sig2`.

- Kästchen (2026-11-21-r): Feldart `kasten` in `t.fields` (x, y, s, optional `r` = Rahmen mitdrucken). Im Editor setzt ein Tippen mit jedem Werkzeug außer Stift/Textmarker einen Haken (Eintrag `mark` mit `fid`), nochmal Tippen nimmt ihn weg; Blättern-Werkzeug: Fingertipp.

## Unterschrift im Dokument, Nachweis, Logbuch (2026-11-21-u)
- Unterschreiben (`openSign`): Hat die Vorlage ein festes Feld (`t.sig` ohne `free`), wird dort gestempelt (alt). Sonst öffnet der Editor das Unterschriftsfenster (`openSignPad`), danach tippt man ins Dokument (Werkzeuge P/A im Editor, `pdfedit.js`). Vorlagenoption "frei im Dokument platzieren" (`t.sig.free`).
- Nachweis je Unterschrift (`sigRecord`): Zeit, Name, SHA-256 der unterschriebenen Datei und der Fassung davor, Schreibdauer, Punkte. `sigCheck` prüft die Datei gegen die letzte Prüfsumme (Menü "Unterschrift prüfen"). Einfache elektronische Unterschrift, keine qualifizierte Signatur.
- Logbuch (PDF) je Dokument: `logbuchQueue/logbuchOpen` in `pdfedit.js`, liegt im Dateispeicher (`rec.logId`, nicht als eigenes Dokument), wird bei jeder Änderung neu geschrieben, Menü "Logbuch (PDF)". Bewusst nicht an das Dokument angehängt, damit die Prüfsumme der unterschriebenen Datei stabil bleibt.

## Bildvergleich in der Akte (2026-11-21-v, `vergleich.js`)
- Bereich `#md-cmp` im Reiter Anlagen → Bilder: bis zu drei Plätze (A, B, C), Bilder per Ziehen oder Symbol ⇄ am Bild (`cmpAdd`), aus der Bildansicht `cmpPair`. Übereinander (Teilen mit Kante(n) oder Überblenden mit Deckkraft je Bild, jedes Bild einzeln skalier- und verschiebbar) oder Nebeneinander (gemeinsamer Zoom und Verschieben). Der frühere Vergleich als Vollbild-Fenster (`modal-cmp`) entfällt. Bilder und Dateien stehen im Reiter Anlagen jetzt vor den Unterlagen.

## Abgleich-Modus (2026-11-21-x)
- `settings.syncMode`: `taeglich` (Standard: automatischer Abgleich und Postfach höchstens einmal pro Tag beim Öffnen), `manuell` (nur über Knopf), `auto` (wie früher, 6 s nach jeder Änderung). Auswahl im Abgleich-Bereich (`KS.setMode`), `base.conn` = letzte erfolgreiche Verbindung. Zielbild des Praxisinhabers: Tablet als Hauptgerät, Server nur als verschlüsseltes Postfach, einmal täglich abrufen und sichern; direkter Abgleich im lokalen Netz (WebRTC) ist später ein eigenes Vorhaben. Geräte, die weiterhin ständig am Server hängen: Kalender-Feed (`settings.calOn`) und privater Kalender (`settings.extUrl`), wenn eingeschaltet.

- Abgleich und Dateigröße (2026-11-21-z): Der Praxis-Server nimmt je Anfrage nur etwa 6-7 MB an (PHP `post_max_size` 8M, gemessen am 22.11.2026: bis 6 MB Antwort 404, ab 8 MB 400 "Ungültige Anfrage", weil PHP bei Überschreitung den ganzen Body verwirft). Größere Dateien werden im Abgleich übersprungen und in der Statuszeile genannt (`S.skipped`); `KS.diagnose()` testet 1/2/4/8 MB. Dauerhafte Lösung: `post_max_size` und `upload_max_filesize` beim Hoster auf mindestens 64M erhöhen, oder Dateien in Teile zerlegen (eigenes Vorhaben, Datenformat des Abgleichs).
