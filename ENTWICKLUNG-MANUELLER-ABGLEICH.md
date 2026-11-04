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

## Noch nicht abgeschlossen
1. Isolierten Test-Backend-Endpunkt mit synthetischen Daten einrichten. **Keinesfalls** den produktiven WordPress-Endpunkt in diese Version eintragen.
2. Echte Trennung der Postfach-Schlüssel und der Gerätesynchronisierung: Der aktuelle Postfachabruf benötigt noch die gemeinsame `ka_sync`-Konfiguration.
3. Dauerhafte, verifizierte Speicherung eingehender Formulare vor einer serverseitigen Löschbestätigung, inklusive Idempotenz und Wiederholungslogik.
4. Zwei-Geräte-Konflikte auf Datensatzebene statt globaler Ganzstand-Entscheidung und Schutz vor stillem Überschreiben.
5. Datensicherung und vollständige Wiederherstellung auf zweitem Gerät unter realistischen Offline-Bedingungen testen.
6. Sicherheitsprüfung der weiteren Netzwerkfunktionen sowie der produktiven Backend-Zugriffskontrolle vor späterer Aktivierung.
7. Separate Test-URL und Test-Storage schaffen, falls interaktive Vorschau erwünscht ist.

**Der Entwicklungszweig ist derzeit kein fertiges, produktiv einsatzfähiges Update.**
