# Prüfbericht Praxis-App, 04.11.2026

Geprüft: Sicherheit, Fehler, Layout, Branding und Design. Stand `main` nach PR #264, Version danach `2026-11-04-b`.
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

## Nachträglich erledigt (Version `2026-11-04-c`)

| Befund | Umsetzung |
|---|---|
| Keine Content-Security-Policy | CSP in App und allen Formularseiten. Verbindungen und Bilder nur zur eigenen Seite und zum Praxis-Server, kein `eval`, keine Plugins. Damit kann selbst eingeschleuster Code keine Daten an fremde Server schicken. `'unsafe-inline'` bleibt vorerst nötig (Inline-Skripte, `onclick`). Test `tests/csp.mjs` mit Gegenprobe. Hinweis: Eine `sendmail.php` auf einer anderen Domain als kreuzberg-aesthetik.de würde blockiert. |
| Fotos aus dem Teilen-Menü unverschlüsselt bis zur Zuordnung | Direkt nach dem Entsperren werden sie im Zwischenspeicher mit dem App-Schlüssel verschlüsselt (inklusive Dateiname), nicht im Dateispeicher, damit der Abgleich sie nicht überträgt. Unverschlüsselt nur noch zwischen Teilen und Entsperren, weil der Service Worker ohne Entsperren keinen Schlüssel hat. Test `tests/eingang-verschluesselt.mjs`. |
| „Zurücksetzen“ in Patientenformularen | Unauffälliger Knopf, Rückfrage per zweitem Tipp („Wirklich alles löschen?“, 4 s) statt Browser-Fenster `confirm()`. |
| Unterschrift: „Löschen“ leert nur das Feld | In App und Formularen jetzt „Leeren“. |
| Symbol `form` doppelt | Wirkungsloser erster Eintrag entfernt. |

## Offen (Entscheidung oder fachliche Freigabe nötig)

| Befund | Warum offen |
|---|---|
| Design gewachsen: 126 Farbwerte, 25 Schriftgrößen, zwei Akzent-Blau, mehrere Grüntöne. | Vereinheitlichen verändert das Aussehen der App. Dafür eine Palette festlegen (Vorschlag mit Vorschau möglich). |

## Entschieden

- Anrede: Du oder Sie je nach Dokument, bewusst so (Entscheidung Praxisinhaber, 04.11.2026).
- Formularseiten folgen dem App-Design: blaugrauer Hintergrund, weiße Karten mit Schatten, grüner Absende-Knopf (Version `2026-11-04-d`).

- Texte: Datenschutztext der Formulare, Aufklärungen und Nachsorge-Hinweise vom Praxisinhaber gegengelesen und freigegeben (04.11.2026). Der Zusatz „(Entwurf)“ ist entfernt; bereits angelegte Vorlagen mit unverändertem Namen werden einmalig umbenannt.
- WhatsApp als Versandweg entfernt (Patientendaten nicht über Meta). Das allgemeine Teilen-Menü des Geräts für Rechnungs-PDFs bleibt.
- Kalender-Freigabe für Google/Apple: nur noch „Belegt“, die Option mit Patientenkürzeln ist entfernt. Eine bereits veröffentlichte Datei wird beim nächsten App-Start ersetzt.

- Rechnungen: versendete, bezahlte und stornierte Rechnungen sind gesperrt; Korrektur über Stornorechnung mit eigener Nummer und neue Rechnung; Löschen nur für die letzte, unversendete, unbezahlte Nummer (Version `2026-11-04-f`, Test `tests/rechnung-sperre.mjs`).
- Löschschutz: Akten mit medizinischer Dokumentation 10 Jahre nach der letzten Behandlung nicht löschbar.

- GOÄ: Leistungen mit optionaler GOÄ-Nummer, Punktzahl, Analog-Kennzeichen; Festpreis bleibt, Faktor wird zurückgerechnet; Rechnung zeigt Nummer, Faktor und Hinweis auf die Honorarvereinbarung (Datum aus der Akte). Nummern/Punktzahlen trägt der Praxisinhaber ein (Version `2026-11-04-g`, Test `tests/goae.mjs`). Ob Rechnungen und Honorarvereinbarung den Anforderungen von § 2 und § 12 GOÄ genügen, ist fachlich prüfen zu lassen.

- GOÄ erweitert: mehrere Positionen je Leistung, Präparat als Auslage nach § 10 GOÄ, gemeinsamer zurückgerechneter Faktor, Auswahlliste belegter Nummern mit Hinweisen (Version `2026-11-04-i`).

## Kein Handlungsbedarf

- `Origin`-Prüfung des Servers: nur Filter, die Sicherheit hängt am Zugangs-Token.
- Fester Salt beim Abgleich-Passwort: nötig, damit alle Geräte denselben Schlüssel ableiten. Eine Änderung würde alle Geräte trennen. Schutz über die Passwortlänge (mind. 12 Zeichen).
- PR #265: beim Mergen Version neu setzen.

## Aufgeteilte Kopie

`quellcode-aufgeteilt/` enthält `index.html` nach Funktionen zerlegt (CSS nach Themen, Skript nach Abschnitten, HTML nach Seiten und Fenstern), verlustfrei und mit `teile.json` wieder zusammensetzbar. Die App nutzt die Kopie nicht. Neu erzeugen mit `npm run code:aufteilen`.
