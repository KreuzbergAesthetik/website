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
