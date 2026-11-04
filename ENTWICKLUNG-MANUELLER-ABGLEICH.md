# Entwicklung: manueller Abgleich

Dieser Branch ist eine isolierte Code-Entwicklung auf Basis von `main`. Er ist **keine** isolierte Laufzeitumgebung.

## Sicherheitsregeln
- Keine Änderungen auf `main` ohne ausdrückliche Freigabe.
- Keine Entwicklungsversion mit produktiven Patientendaten oder dem produktiven WordPress-Abgleich verbinden.
- Vor einer Vorschau: separate Test-URL, getrennte Browser-Speicherbereiche, Testdaten und separate Backend-Konfiguration.
- GitHub Pages kann auch auf nicht standardmäßigen Branches deployen, wenn die Pages-/Actions-Konfiguration entsprechend geändert wird. Die bestehende Konfiguration nicht ändern.
- Kein automatisches Merge und kein Deployment in die produktive App.
- Vor Aktivierung: Backups, Wiederherstellung, Offline-Konflikte, Postfach-Löschbestätigung und Kalender-Netzwerkzugriffe prüfen.

## Ziel
Manueller, getrennt steuerbarer Postfachabruf und Geräteabgleich, lokale Datenhaltung mit geprüfter verschlüsselter Datensicherung.

## Bestehender Code (Prüfung)
- `sync.js`: automatischer Start, Sichtbarkeits-/Online-Trigger, Drei-Minuten-Intervall, verzögerter Abgleich nach Änderung, Kalenderexport.
- `sync.js`: Postfachabruf `abrufen()` vorhanden, derzeit an die Abgleich-Konfiguration gekoppelt.
- `formular-empfang-wordpress.txt`: REST-Schnittstelle und serverseitiges Postfach.
- Konfliktbehandlung derzeit für einen gemeinsamen Datenstand, kein nachgewiesenes feldweises Merge.

## Reihenfolge
1. Testumgebung und Testdaten isolieren.
2. Backup-/Restore-Prozess und Postfach-Import-/Löschverhalten testen.
3. Netzwerkzugriffe inventarisieren und manuelle Trigger implementieren.
4. Postfach und Gerätesynchronisierung logisch trennen.
5. Zwei-Geräte-Konflikte sicher behandeln.
6. Erst nach Abnahme kontrolliert produktiv übernehmen.

## Implementierungsstand (4. November 2026)
- **Nur Entwicklungszweig**: Der produktive Branch `main` und der WordPress-Server bleiben unverändert.
- Netzwerk-Endpunkt in `sync.js` absichtlich `null`; die Testversion kann daher weder produktiv abgleichen noch produktive Postfacheingänge abrufen.
- Geräteabgleich ausschließlich über den ausdrücklich betätigten Button `Geräte jetzt abgleichen`.
- Postfachabruf als separate Aktion `Postfach jetzt abrufen`; ein Geräteabgleich löst keinen Postfachimport aus.
- App-Start, Rückkehr zur App, Online-Ereignis und Drei-Minuten-Intervall lösen keinen Geräteabgleich mehr aus.
- Nach lokalen Datenänderungen kein automatischer Upload; nach Wiederherstellung eines Serverstands kein automatischer Folge-Upload.
- Kalenderexport und Abruf des privaten Kalenders nur noch über explizite Bedienelemente; keine periodischen Kalenderabrufe.
- Manuelle Bedienung ist im Abgleich-Tab ausdrücklich als **ENTWICKLUNGSVERSION** gekennzeichnet.
- Regressionstest und GitHub Actions für den Entwicklungszweig aktiviert.

## Ergänzungen im Entwicklungsstand dev2
- Der Postfachbutton bleibt auch dann sichtbar, wenn die Anzahl neuer Eingänge noch unbekannt ist. Bis zum Abruf heißt der Status ausdrücklich „Postfach noch nicht geprüft“.
- Der Geräteabgleich verändert nicht den Postfach-Zähler und löst keinen Import aus.
- Die Webformular-Editoren speichern jetzt **nur lokal**. Eine eigene Aktion „Formulare jetzt veröffentlichen“ überträgt ausschließlich Formulartexte und -felder, und nur nach ausdrücklichem Klick.
- Das Formular „Gespeichert und veröffentlicht“ wird nicht mehr beim lokalen Speichern angezeigt.
- Bei fehlgeschlagenem PDF-Speichern meldet der Import keinen Erfolg zurück. Der verschlüsselte Eintrag bleibt auf dem Server.
- Vor dem Quittieren eines erfolgreich importierten Postfacheingangs wird `kaIdle()` abgewartet, damit die asynchron verschlüsselte lokale Speicherung abgeschlossen ist.
- Eine fehlende Serverkonfiguration verursacht im Kalenderbereich keine Ausnahme mehr beim Aufbau der Kalenderadresse.
- Zusätzliche statische Assertions in `tests/static-check.mjs` sichern manuelle Aktionen und das Importverhalten ab.
- App-Version und PWA-Cache: `2026-11-04-dev2`. Keine Bereitstellung der Entwicklungsversion auf GitHub Pages.

**Prüfstand:** JavaScript von `sync.js` und allen Inline-Skripten in `index.html` syntaktisch geprüft. Das ist kein Browser-, Geräte- oder Integrationstest. Keine reale Verbindung zu einem Backend hergestellt.

## Noch nicht abgeschlossen
1. Isolierten Test-Backend-Endpunkt mit synthetischen Daten einrichten. **Keinesfalls** den produktiven WordPress-Endpunkt in diese Version eintragen.
2. Echte Trennung der Postfach-Schlüssel und der Gerätesynchronisierung: Der aktuelle Postfachabruf benötigt noch die gemeinsame `ka_sync`-Konfiguration.
3. Dauerhafte, verifizierte Speicherung eingehender Formulare vor einer serverseitigen Löschbestätigung, inklusive Idempotenz und Wiederholungslogik.
4. Zwei-Geräte-Konflikte auf Datensatzebene statt globaler Ganzstand-Entscheidung und Schutz vor stillem Überschreiben.
5. Datensicherung und vollständige Wiederherstellung auf zweitem Gerät unter realistischen Offline-Bedingungen testen.
6. Sicherheitsprüfung der weiteren Netzwerkfunktionen sowie der produktiven Backend-Zugriffskontrolle vor späterer Aktivierung.
7. Separate Test-URL und Test-Storage schaffen, falls interaktive Vorschau erwünscht ist.

**Der Entwicklungszweig ist derzeit kein fertiges, produktiv einsatzfähiges Update.**
