# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `3332f234c11b754d…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (16 Teile)
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
| `css/0070-terminansicht.css` | Terminansicht | 527 | 55 |
| `css/0080-masken.css` | Masken | 582 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 643 | 90 |
| `css/0100-patientenliste.css` | Patientenliste | 733 | 90 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 823 | 36 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 859 | 33 |
| `css/0130-handy-quer.css` | Handy quer | 892 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 925 | 41 |
| `css/0150-querformat-und-desktop.css` | Querformat und Desktop | 966 | 14 |
| `css/0160-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 980 | 48 |
| `css/0170-reihenfolge.css` | Reihenfolge | 1028 | 29 |
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1057 | 49 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1106 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1127 | 12 |
| `html/0210-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1139 | 5 |
| `js/0220-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1144 | 0 |
| `html/0230-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1144 | 13 |
| `js/0240-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1157 | 275 |
| `html/0250-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1432 | 36 |
| `html/0260-seite-start.html` | seite START | 1468 | 47 |
| `html/0270-seite-patienten.html` | seite PATIENTEN | 1515 | 30 |
| `html/0280-seite-rechnungen.html` | seite RECHNUNGEN | 1545 | 30 |
| `html/0290-seite-leistungen.html` | seite LEISTUNGEN | 1575 | 33 |
| `html/0300-seite-dokumente.html` | seite DOKUMENTE | 1608 | 19 |
| `html/0310-seite-zahlungen.html` | seite ZAHLUNGEN | 1627 | 22 |
| `html/0320-seite-praxisdaten.html` | seite PRAXISDATEN | 1649 | 47 |
| `html/0330-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1696 | 15 |
| `html/0340-seite-webformulare.html` | seite WEBFORMULARE | 1711 | 18 |
| `html/0350-seite-sicherung.html` | seite SICHERUNG | 1729 | 14 |
| `html/0360-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1743 | 48 |
| `html/0370-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1791 | 9 |
| `html/0380-seite-todos.html` | seite TODOS | 1800 | 16 |
| `html/0390-seite-statistik.html` | seite STATISTIK | 1816 | 34 |
| `html/0400-seite-lager.html` | seite LAGER | 1850 | 20 |
| `html/0410-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1870 | 25 |
| `html/0420-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1895 | 43 |
| `html/0430-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1938 | 71 |
| `html/0440-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2009 | 9 |
| `html/0450-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2018 | 7 |
| `html/0460-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2025 | 17 |
| `html/0470-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2042 | 10 |
| `html/0480-fenster-rezept.html` | fenster REZEPT | 2052 | 23 |
| `html/0490-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2075 | 54 |
| `html/0500-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2129 | 27 |
| `html/0510-fenster-leistung.html` | fenster LEISTUNG | 2156 | 31 |
| `html/0520-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2187 | 20 |
| `html/0530-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2207 | 15 |
| `html/0540-fenster-ausgabe.html` | fenster AUSGABE | 2222 | 18 |
| `html/0550-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2240 | 37 |
| `html/0560-fenster-platzhalter.html` | fenster PLATZHALTER | 2277 | 15 |
| `html/0570-fenster-anrede.html` | fenster ANREDE | 2292 | 16 |
| `html/0580-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2308 | 14 |
| `html/0590-fenster-vorlage.html` | fenster VORLAGE | 2322 | 33 |
| `html/0600-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2355 | 9 |
| `html/0610-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2364 | 18 |
| `html/0620-fenster-zahlung.html` | fenster ZAHLUNG | 2382 | 15 |
| `html/0630-fenster-sicherung.html` | fenster SICHERUNG | 2397 | 15 |
| `html/0640-fenster-fortschritt.html` | fenster FORTSCHRITT | 2412 | 11 |
| `html/0650-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2423 | 10 |
| `html/0660-fenster-dokumentation.html` | fenster DOKUMENTATION | 2433 | 12 |
| `html/0670-fenster-todo.html` | fenster TODO | 2445 | 19 |
| `html/0680-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2464 | 14 |
| `html/0690-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2478 | 12 |
| `html/0700-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2490 | 12 |
| `html/0710-fenster-produkt.html` | fenster PRODUKT | 2502 | 48 |
| `html/0720-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2550 | 13 |
| `html/0730-fenster-wareneingang.html` | fenster WARENEINGANG | 2563 | 20 |
| `html/0740-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2583 | 16 |
| `html/0750-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2599 | 12 |
| `html/0760-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2611 | 9 |
| `html/0770-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2620 | 19 |
| `html/0780-fenster-e-mail.html` | fenster E-MAIL | 2639 | 14 |
| `html/0790-fenster-bild-gross.html` | fenster BILD GROSS | 2653 | 11 |
| `html/0800-fenster-zuordnen.html` | fenster ZUORDNEN | 2664 | 10 |
| `js/0810-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2674 | 195 |
| `js/0820-hinweise-an-patienten.js` | Hinweise an Patienten | 2869 | 338 |
| `js/0830-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3207 | 134 |
| `js/0840-kalender.js` | Kalender | 3341 | 279 |
| `js/0850-startseite.js` | Startseite | 3620 | 270 |
| `js/0860-patienten-termine-doku.js` | Patienten, Termine, Doku | 3890 | 84 |
| `js/0870-dateispeicher.js` | Dateispeicher  | 3974 | 60 |
| `js/0880-rechnungen.js` | Rechnungen | 4034 | 54 |
| `js/0890-leistungskategorien.js` | Leistungskategorien  | 4088 | 148 |
| `js/0900-goae.js` | GOÄ | 4236 | 801 |
| `js/0910-alle-tabellen.js` | Alle Tabellen | 5037 | 239 |
| `js/0920-pdf-erzeugung.js` | PDF-Erzeugung  | 5276 | 48 |
| `js/0930-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5324 | 280 |
| `js/0940-briefumschlag-c6.js` | Briefumschlag C6  | 5604 | 477 |
| `js/0950-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6081 | 497 |
| `js/0960-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6578 | 262 |
| `js/0970-statistik.js` | Statistik | 6840 | 74 |
| `js/0980-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6914 | 108 |
| `js/0990-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7022 | 280 |
| `js/1000-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7302 | 294 |
| `js/1010-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7596 | 136 |
| `js/1020-medien.js` | Medien | 7732 | 362 |
| `js/1030-webformulare.js` | Webformulare | 8094 | 278 |
| `js/1040-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8372 | 198 |
| `js/1050-produktlager.js` | Produktlager | 8570 | 549 |
| `js/1060-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9119 | 242 |
| `js/1070-sicherung.js` | Sicherung  | 9361 | 219 |
| `js/1080-sicherung-als-zip.js` | Sicherung als ZIP | 9580 | 318 |
| `js/1090-geraete-abgleich.js` | Geräte-Abgleich | 9898 | 69 |
| `js/1100-eingangskorb.js` | Eingangskorb | 9967 | 97 |
| `html/1110-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10064 | 1 |
| `js/1120-app-start.js` | app-start | 10065 | 0 |
| `html/1130-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10065 | 7 |
| `js/1140-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10072 | 12 |
| `html/1150-dokument-ende.html` | dokument-ende | 10084 | 2 |
