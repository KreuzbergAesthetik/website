# Prüfbericht Praxis-App, 04.11.2026

Geprüft: Sicherheit, Fehler, Layout, Branding und Design. Stand `main` nach PR #264, Version danach `2026-11-04-a`.
Alle Tests mit erfundenen Daten. Nicht auf echten Geräten und nicht gegen den echten Server getestet.

## Behoben

| Schwere | Befund | Korrektur |
|---|---|---|
| Hoch | **Server-Snippet:** Bei leerem `EINRICHTUNG` konnte jeder einen eigenen Abgleich-Bereich anlegen (bis 5). Damit ließen sich das Formular-Postfach lesen und löschen und der öffentliche Formular-Schlüssel austauschen. Neue Formulare (Gesundheitsdaten) wären dann für den Angreifer lesbar gewesen. | Neue Bereiche gibt es nur noch, wenn keiner existiert, der Einrichtungscode stimmt oder der bisherige Bereich sich beim Passwortwechsel ausweist (`alt`). **Das Snippet muss in WPCode neu eingefügt werden.** |
| Mittel | `ERLAUBT` im Server-Snippet nannte nur `fellamanuel-arch.github.io`, `formular-empfang.php` dagegen `kreuzbergaesthetik.github.io`. | Beide Adressen eingetragen. |
| Mittel | `info.html`: Skriptabbruch (`PRAXIS_F` nicht definiert), sobald für das Blatt ein eigener Name gesetzt ist. | Abfrage mit `typeof`. |
| Klein | Anmeldeformular am Handy: Bricht „Nachname(n) *“ um, rutscht das Feld tiefer als Titel und Vorname. | Felder in diesen Zeilen unten bündig. |
| Klein | PDF-Dateiname der Webformulare nutzt UTC-Datum (kurz nach Mitternacht der Vortag). | Ortsdatum. |

## Geprüft, ohne Befund

- Schadcode aus Webformularen (alle Felder, alle Formulartypen) wird in Start, Kalender (Tag, Woche, Monat), Termin, Patientenliste, Suche, Akte (alle Reiter), To-Dos und Rechnungen nicht ausgeführt. Neuer Test `tests/xss-formulare.mjs` mit Gegenprobe.
- Alle Seiten der App und des Praxis-Menüs auf Desktop und Handy: keine Skriptfehler, kein horizontaler Überlauf.
- Alle Formularseiten am Handy: keine Skriptfehler, kein Überlauf.
- Kein Nachladen von fremden Servern (Schriften, CDN, Tracking).
- Abgleich-Schlüssel und privater Postfach-Schlüssel liegen verschlüsselt im App-Speicher.
- `sendmail.php`: Zugangscode, Schutz gegen eingeschleuste Mail-Header, Mengenbegrenzung.
- Formular-Codes aus der Adresse werden streng geprüft (`[A-Z2-9]{6}`).
- Geldbeträge werden auf Cent gerundet, Umsatzsteuer aus Brutto herausgerechnet.
- Statische Analyse (ESLint) über alle Skripte: keine echten undefinierten Namen in der App, nur unkritische Doppel-Deklarationen.

## Offen (nicht geändert, Entscheidung nötig)

| Schwere | Befund | Empfehlung |
|---|---|---|
| Mittel | Keine Content-Security-Policy. Wegen vieler Inline-Skripte und `onclick` nur mit größerem Umbau möglich. | Später schrittweise. Der XSS-Test sichert den heutigen Stand ab. |
| Mittel | Fotos aus dem Teilen-Menü liegen bis zur Zuordnung unverschlüsselt im Browser-Cache (bekannt). | Zügig zuordnen; bei Bedarf beim Entsperren verschlüsselt übernehmen. |
| Mittel | Patientenformulare: „Zurücksetzen“ steht gleichwertig neben „Absenden“ und fragt mit dem Browser-Fenster `confirm()`. Risiko, dass Patienten alles löschen. | Zurücksetzen kleiner oder entfernen. |
| Mittel | Anrede uneinheitlich: Formulare und Hinweise duzen, die Aufklärungs- und Nachsorgetexte in `docs.js` siezen (68 Stellen). | Einheitlich festlegen. Texte sind rechtlich/medizinisch freizugeben, deshalb nicht geändert. |
| Klein | Design gewachsen: 126 Farbwerte, 25 Schriftgrößen, 12 Eckenradien, 316 Inline-Stile. Zwei Akzent-Blau (`#2563eb`, `#1e3a8a`), mehrere Grüntöne. | Farb- und Größenpalette festlegen und schrittweise vereinheitlichen. |
| Klein | Formulare wirken anders als die App: Hintergrund `#f1f5f9` statt `#e6ebf3`, Hauptknopf dunkelblau statt grün. | Entscheiden, ob Patientenseiten dem App-Design folgen sollen. |
| Klein | Unterschrift-Fenster: Grauer Knopf „Löschen“ leert nur das Feld. | Beschriftung „Neu“ oder „Leeren“. |
| Klein | Symbol `form` doppelt definiert (das zweite gilt). | Aufräumen ohne sichtbare Wirkung. |
| Klein | Server prüft `Origin` nur, wenn mitgeschickt. Das ist ein Filter, kein Schutz. | Sicherheit hängt richtigerweise am Zugangs-Token. |
| Klein | Abgleich-Passwort wird mit festem Salt abgeleitet (nötig für mehrere Geräte). Mit Zugriff auf den Server wären Rateversuche offline möglich. | Langes Abgleich-Passwort (mind. 12 Zeichen ist Pflicht). |
| Hinweis | Offener PR #265 erhöht ebenfalls die Version. | Beim Mergen Version neu setzen. |

## Aufgeteilte Kopie

`quellcode-aufgeteilt/` enthält `index.html` nach Funktionen zerlegt (CSS nach Themen, Skript nach Abschnitten, HTML nach Seiten und Fenstern), verlustfrei und mit `teile.json` wieder zusammensetzbar. Die App nutzt die Kopie nicht. Neu erzeugen mit `npm run code:aufteilen`.
