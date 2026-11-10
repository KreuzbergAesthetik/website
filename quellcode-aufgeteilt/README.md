# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `2bd24bebc87f66a6…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (9 Teile)
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
| `css/0060-kalender.css` | Kalender | 163 | 366 |
| `css/0070-terminansicht.css` | Terminansicht | 529 | 52 |
| `css/0080-masken.css` | Masken | 581 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 642 | 89 |
| `css/0100-patientenliste.css` | Patientenliste | 731 | 90 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 821 | 35 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 856 | 32 |
| `css/0130-handy-quer.css` | Handy quer | 888 | 16 |
| `html/0140-oberflaeche-rahmen.html` | oberflaeche-rahmen | 904 | 5 |
| `js/0150-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 909 | 0 |
| `html/0160-oberflaeche-body-applock.html` | oberflaeche-body-applock | 909 | 12 |
| `js/0170-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 921 | 252 |
| `html/0180-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1173 | 33 |
| `html/0190-seite-start.html` | seite START | 1206 | 47 |
| `html/0200-seite-patienten.html` | seite PATIENTEN | 1253 | 30 |
| `html/0210-seite-rechnungen.html` | seite RECHNUNGEN | 1283 | 30 |
| `html/0220-seite-leistungen.html` | seite LEISTUNGEN | 1313 | 33 |
| `html/0230-seite-dokumente.html` | seite DOKUMENTE | 1346 | 19 |
| `html/0240-seite-zahlungen.html` | seite ZAHLUNGEN | 1365 | 22 |
| `html/0250-seite-praxisdaten.html` | seite PRAXISDATEN | 1387 | 47 |
| `html/0260-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1434 | 15 |
| `html/0270-seite-webformulare.html` | seite WEBFORMULARE | 1449 | 18 |
| `html/0280-seite-sicherung.html` | seite SICHERUNG | 1467 | 14 |
| `html/0290-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1481 | 48 |
| `html/0300-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1529 | 9 |
| `html/0310-seite-todos.html` | seite TODOS | 1538 | 16 |
| `html/0320-seite-statistik.html` | seite STATISTIK | 1554 | 34 |
| `html/0330-seite-lager.html` | seite LAGER | 1588 | 20 |
| `html/0340-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1608 | 25 |
| `html/0350-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1633 | 43 |
| `html/0360-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1676 | 71 |
| `html/0370-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1747 | 9 |
| `html/0380-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1756 | 7 |
| `html/0390-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1763 | 17 |
| `html/0400-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1780 | 10 |
| `html/0410-fenster-rezept.html` | fenster REZEPT | 1790 | 23 |
| `html/0420-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1813 | 54 |
| `html/0430-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1867 | 27 |
| `html/0440-fenster-leistung.html` | fenster LEISTUNG | 1894 | 31 |
| `html/0450-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 1925 | 20 |
| `html/0460-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 1945 | 15 |
| `html/0470-fenster-ausgabe.html` | fenster AUSGABE | 1960 | 18 |
| `html/0480-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 1978 | 37 |
| `html/0490-fenster-platzhalter.html` | fenster PLATZHALTER | 2015 | 15 |
| `html/0500-fenster-anrede.html` | fenster ANREDE | 2030 | 16 |
| `html/0510-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2046 | 14 |
| `html/0520-fenster-vorlage.html` | fenster VORLAGE | 2060 | 33 |
| `html/0530-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2093 | 9 |
| `html/0540-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2102 | 18 |
| `html/0550-fenster-zahlung.html` | fenster ZAHLUNG | 2120 | 15 |
| `html/0560-fenster-sicherung.html` | fenster SICHERUNG | 2135 | 15 |
| `html/0570-fenster-fortschritt.html` | fenster FORTSCHRITT | 2150 | 11 |
| `html/0580-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2161 | 10 |
| `html/0590-fenster-dokumentation.html` | fenster DOKUMENTATION | 2171 | 12 |
| `html/0600-fenster-todo.html` | fenster TODO | 2183 | 19 |
| `html/0610-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2202 | 14 |
| `html/0620-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2216 | 12 |
| `html/0630-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2228 | 12 |
| `html/0640-fenster-produkt.html` | fenster PRODUKT | 2240 | 48 |
| `html/0650-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2288 | 13 |
| `html/0660-fenster-wareneingang.html` | fenster WARENEINGANG | 2301 | 20 |
| `html/0670-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2321 | 16 |
| `html/0680-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2337 | 12 |
| `html/0690-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2349 | 9 |
| `html/0700-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2358 | 19 |
| `html/0710-fenster-e-mail.html` | fenster E-MAIL | 2377 | 14 |
| `html/0720-fenster-bild-gross.html` | fenster BILD GROSS | 2391 | 11 |
| `html/0730-fenster-zuordnen.html` | fenster ZUORDNEN | 2402 | 10 |
| `js/0740-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2412 | 195 |
| `js/0750-hinweise-an-patienten.js` | Hinweise an Patienten | 2607 | 314 |
| `js/0760-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 2921 | 62 |
| `js/0770-kalender.js` | Kalender | 2983 | 279 |
| `js/0780-startseite.js` | Startseite | 3262 | 270 |
| `js/0790-patienten-termine-doku.js` | Patienten, Termine, Doku | 3532 | 84 |
| `js/0800-dateispeicher.js` | Dateispeicher  | 3616 | 60 |
| `js/0810-rechnungen.js` | Rechnungen | 3676 | 54 |
| `js/0820-leistungskategorien.js` | Leistungskategorien  | 3730 | 148 |
| `js/0830-goae.js` | GOÄ | 3878 | 742 |
| `js/0840-alle-tabellen.js` | Alle Tabellen | 4620 | 239 |
| `js/0850-pdf-erzeugung.js` | PDF-Erzeugung  | 4859 | 48 |
| `js/0860-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 4907 | 280 |
| `js/0870-briefumschlag-c6.js` | Briefumschlag C6  | 5187 | 464 |
| `js/0880-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5651 | 497 |
| `js/0890-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6148 | 262 |
| `js/0900-statistik.js` | Statistik | 6410 | 74 |
| `js/0910-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6484 | 113 |
| `js/0920-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6597 | 280 |
| `js/0930-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 6877 | 294 |
| `js/0940-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7171 | 136 |
| `js/0950-medien.js` | Medien | 7307 | 362 |
| `js/0960-webformulare.js` | Webformulare | 7669 | 278 |
| `js/0970-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 7947 | 198 |
| `js/0980-produktlager.js` | Produktlager | 8145 | 549 |
| `js/0990-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8694 | 242 |
| `js/1000-sicherung.js` | Sicherung  | 8936 | 219 |
| `js/1010-sicherung-als-zip.js` | Sicherung als ZIP | 9155 | 318 |
| `js/1020-geraete-abgleich.js` | Geräte-Abgleich | 9473 | 69 |
| `js/1030-eingangskorb.js` | Eingangskorb | 9542 | 97 |
| `html/1040-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9639 | 1 |
| `js/1050-app-start.js` | app-start | 9640 | 0 |
| `html/1060-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9640 | 7 |
| `js/1070-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9647 | 12 |
| `html/1080-dokument-ende.html` | dokument-ende | 9659 | 2 |
