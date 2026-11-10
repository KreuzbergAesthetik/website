# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `aeef2eeb56564fa7…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (11 Teile)
- `js/`: Programmlogik, nach Funktionsbereichen (35 Teile)
- `html/`: Oberfläche, nach Seiten und Fenstern (64 Teile)

Bereits vorher eigenständige Dateien (nicht kopiert): `dialoge.js` (Hinweise, Rückfragen, Passkey), `docs.js` (Dokumente, Vorlagen),
`sync.js` (Geräte-Abgleich, Postfach), `extcal.js` (privater Kalender), `forms.js`, `ftexte.js`, `forms.css` (Webformulare),
`sw.js` (Offline-Speicher, Updates).

| Datei | Inhalt | ab Zeile in index.html | Zeilen |
|---|---|---|---|
| `html/0010-dokumentkopf.html` | dokumentkopf | 1 | 4 |
| `html/0020-sicherheitsrichtlinie-verbindungen-und-bilder-nu.html` | Sicherheitsrichtlinie: Verbindungen und Bilder nur zur eigenen Seite und zum Praxis-Server (verhindert Datenabfluss an fremde Server) | 5 | 3 |
| `js/0030-passkey-so-frueh-wie-moeglich-anfordern.js` | Passkey so früh wie möglich anfordern | 8 | 16 |
| `html/0040-oberflaeche-rahmen.html` | oberflaeche-rahmen | 24 | 7 |
| `css/0050-grundlagen.css` | grundlagen | 31 | 132 |
| `css/0060-kalender.css` | Kalender | 163 | 364 |
| `css/0070-terminansicht.css` | Terminansicht | 527 | 52 |
| `css/0080-masken.css` | Masken | 579 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 640 | 89 |
| `css/0100-patientenliste.css` | Patientenliste | 729 | 90 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 819 | 35 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 854 | 32 |
| `css/0130-handy-quer.css` | Handy quer | 886 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 919 | 50 |
| `css/0150-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 969 | 16 |
| `html/0160-oberflaeche-rahmen.html` | oberflaeche-rahmen | 985 | 5 |
| `js/0170-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 990 | 0 |
| `html/0180-oberflaeche-body-applock.html` | oberflaeche-body-applock | 990 | 12 |
| `js/0190-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1002 | 252 |
| `html/0200-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1254 | 36 |
| `html/0210-seite-start.html` | seite START | 1290 | 47 |
| `html/0220-seite-patienten.html` | seite PATIENTEN | 1337 | 30 |
| `html/0230-seite-rechnungen.html` | seite RECHNUNGEN | 1367 | 29 |
| `html/0240-seite-leistungen.html` | seite LEISTUNGEN | 1396 | 33 |
| `html/0250-seite-dokumente.html` | seite DOKUMENTE | 1429 | 19 |
| `html/0260-seite-zahlungen.html` | seite ZAHLUNGEN | 1448 | 22 |
| `html/0270-seite-praxisdaten.html` | seite PRAXISDATEN | 1470 | 47 |
| `html/0280-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1517 | 15 |
| `html/0290-seite-webformulare.html` | seite WEBFORMULARE | 1532 | 18 |
| `html/0300-seite-sicherung.html` | seite SICHERUNG | 1550 | 14 |
| `html/0310-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1564 | 48 |
| `html/0320-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1612 | 9 |
| `html/0330-seite-todos.html` | seite TODOS | 1621 | 16 |
| `html/0340-seite-statistik.html` | seite STATISTIK | 1637 | 34 |
| `html/0350-seite-lager.html` | seite LAGER | 1671 | 20 |
| `html/0360-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1691 | 25 |
| `html/0370-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1716 | 43 |
| `html/0380-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1759 | 71 |
| `html/0390-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1830 | 9 |
| `html/0400-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1839 | 7 |
| `html/0410-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1846 | 17 |
| `html/0420-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1863 | 10 |
| `html/0430-fenster-rezept.html` | fenster REZEPT | 1873 | 23 |
| `html/0440-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1896 | 54 |
| `html/0450-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1950 | 27 |
| `html/0460-fenster-leistung.html` | fenster LEISTUNG | 1977 | 31 |
| `html/0470-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2008 | 20 |
| `html/0480-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2028 | 15 |
| `html/0490-fenster-ausgabe.html` | fenster AUSGABE | 2043 | 18 |
| `html/0500-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2061 | 37 |
| `html/0510-fenster-platzhalter.html` | fenster PLATZHALTER | 2098 | 15 |
| `html/0520-fenster-anrede.html` | fenster ANREDE | 2113 | 16 |
| `html/0530-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2129 | 14 |
| `html/0540-fenster-vorlage.html` | fenster VORLAGE | 2143 | 33 |
| `html/0550-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2176 | 9 |
| `html/0560-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2185 | 18 |
| `html/0570-fenster-zahlung.html` | fenster ZAHLUNG | 2203 | 15 |
| `html/0580-fenster-sicherung.html` | fenster SICHERUNG | 2218 | 15 |
| `html/0590-fenster-fortschritt.html` | fenster FORTSCHRITT | 2233 | 11 |
| `html/0600-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2244 | 10 |
| `html/0610-fenster-dokumentation.html` | fenster DOKUMENTATION | 2254 | 12 |
| `html/0620-fenster-todo.html` | fenster TODO | 2266 | 19 |
| `html/0630-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2285 | 14 |
| `html/0640-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2299 | 12 |
| `html/0650-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2311 | 12 |
| `html/0660-fenster-produkt.html` | fenster PRODUKT | 2323 | 48 |
| `html/0670-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2371 | 13 |
| `html/0680-fenster-wareneingang.html` | fenster WARENEINGANG | 2384 | 20 |
| `html/0690-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2404 | 16 |
| `html/0700-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2420 | 12 |
| `html/0710-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2432 | 9 |
| `html/0720-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2441 | 19 |
| `html/0730-fenster-e-mail.html` | fenster E-MAIL | 2460 | 14 |
| `html/0740-fenster-bild-gross.html` | fenster BILD GROSS | 2474 | 11 |
| `html/0750-fenster-zuordnen.html` | fenster ZUORDNEN | 2485 | 10 |
| `js/0760-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2495 | 195 |
| `js/0770-hinweise-an-patienten.js` | Hinweise an Patienten | 2690 | 314 |
| `js/0780-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3004 | 108 |
| `js/0790-kalender.js` | Kalender | 3112 | 279 |
| `js/0800-startseite.js` | Startseite | 3391 | 270 |
| `js/0810-patienten-termine-doku.js` | Patienten, Termine, Doku | 3661 | 84 |
| `js/0820-dateispeicher.js` | Dateispeicher  | 3745 | 60 |
| `js/0830-rechnungen.js` | Rechnungen | 3805 | 54 |
| `js/0840-leistungskategorien.js` | Leistungskategorien  | 3859 | 148 |
| `js/0850-goae.js` | GOÄ | 4007 | 756 |
| `js/0860-alle-tabellen.js` | Alle Tabellen | 4763 | 239 |
| `js/0870-pdf-erzeugung.js` | PDF-Erzeugung  | 5002 | 48 |
| `js/0880-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5050 | 280 |
| `js/0890-briefumschlag-c6.js` | Briefumschlag C6  | 5330 | 464 |
| `js/0900-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5794 | 497 |
| `js/0910-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6291 | 262 |
| `js/0920-statistik.js` | Statistik | 6553 | 74 |
| `js/0930-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6627 | 113 |
| `js/0940-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6740 | 280 |
| `js/0950-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7020 | 294 |
| `js/0960-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7314 | 136 |
| `js/0970-medien.js` | Medien | 7450 | 362 |
| `js/0980-webformulare.js` | Webformulare | 7812 | 278 |
| `js/0990-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8090 | 198 |
| `js/1000-produktlager.js` | Produktlager | 8288 | 549 |
| `js/1010-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8837 | 242 |
| `js/1020-sicherung.js` | Sicherung  | 9079 | 219 |
| `js/1030-sicherung-als-zip.js` | Sicherung als ZIP | 9298 | 318 |
| `js/1040-geraete-abgleich.js` | Geräte-Abgleich | 9616 | 69 |
| `js/1050-eingangskorb.js` | Eingangskorb | 9685 | 97 |
| `html/1060-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9782 | 1 |
| `js/1070-app-start.js` | app-start | 9783 | 0 |
| `html/1080-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9783 | 7 |
| `js/1090-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9790 | 12 |
| `html/1100-dokument-ende.html` | dokument-ende | 9802 | 2 |
