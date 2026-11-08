# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `7802970ab9ebc236…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (10 Teile)
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
| `css/0060-kalender.css` | Kalender | 163 | 353 |
| `css/0070-terminansicht.css` | Terminansicht | 516 | 52 |
| `css/0080-masken.css` | Masken | 568 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 629 | 66 |
| `css/0100-patientenakte-im-querformat.css` | Patientenakte im Querformat | 695 | 18 |
| `css/0110-patientenliste.css` | Patientenliste | 713 | 90 |
| `css/0120-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 803 | 35 |
| `css/0130-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 838 | 32 |
| `css/0140-handy-quer.css` | Handy quer | 870 | 16 |
| `html/0150-oberflaeche-rahmen.html` | oberflaeche-rahmen | 886 | 5 |
| `js/0160-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 891 | 0 |
| `html/0170-oberflaeche-body-applock.html` | oberflaeche-body-applock | 891 | 12 |
| `js/0180-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 903 | 252 |
| `html/0190-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1155 | 33 |
| `html/0200-seite-start.html` | seite START | 1188 | 47 |
| `html/0210-seite-patienten.html` | seite PATIENTEN | 1235 | 30 |
| `html/0220-seite-rechnungen.html` | seite RECHNUNGEN | 1265 | 30 |
| `html/0230-seite-leistungen.html` | seite LEISTUNGEN | 1295 | 33 |
| `html/0240-seite-dokumente.html` | seite DOKUMENTE | 1328 | 19 |
| `html/0250-seite-zahlungen.html` | seite ZAHLUNGEN | 1347 | 22 |
| `html/0260-seite-praxisdaten.html` | seite PRAXISDATEN | 1369 | 47 |
| `html/0270-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1416 | 15 |
| `html/0280-seite-webformulare.html` | seite WEBFORMULARE | 1431 | 18 |
| `html/0290-seite-sicherung.html` | seite SICHERUNG | 1449 | 14 |
| `html/0300-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1463 | 48 |
| `html/0310-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1511 | 9 |
| `html/0320-seite-todos.html` | seite TODOS | 1520 | 16 |
| `html/0330-seite-statistik.html` | seite STATISTIK | 1536 | 34 |
| `html/0340-seite-lager.html` | seite LAGER | 1570 | 20 |
| `html/0350-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1590 | 25 |
| `html/0360-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1615 | 43 |
| `html/0370-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1658 | 71 |
| `html/0380-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1729 | 9 |
| `html/0390-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1738 | 7 |
| `html/0400-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1745 | 17 |
| `html/0410-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1762 | 10 |
| `html/0420-fenster-rezept.html` | fenster REZEPT | 1772 | 23 |
| `html/0430-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1795 | 54 |
| `html/0440-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1849 | 27 |
| `html/0450-fenster-leistung.html` | fenster LEISTUNG | 1876 | 31 |
| `html/0460-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 1907 | 20 |
| `html/0470-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 1927 | 15 |
| `html/0480-fenster-ausgabe.html` | fenster AUSGABE | 1942 | 18 |
| `html/0490-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 1960 | 37 |
| `html/0500-fenster-platzhalter.html` | fenster PLATZHALTER | 1997 | 15 |
| `html/0510-fenster-anrede.html` | fenster ANREDE | 2012 | 16 |
| `html/0520-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2028 | 14 |
| `html/0530-fenster-vorlage.html` | fenster VORLAGE | 2042 | 33 |
| `html/0540-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2075 | 9 |
| `html/0550-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2084 | 18 |
| `html/0560-fenster-zahlung.html` | fenster ZAHLUNG | 2102 | 15 |
| `html/0570-fenster-sicherung.html` | fenster SICHERUNG | 2117 | 15 |
| `html/0580-fenster-fortschritt.html` | fenster FORTSCHRITT | 2132 | 11 |
| `html/0590-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2143 | 10 |
| `html/0600-fenster-dokumentation.html` | fenster DOKUMENTATION | 2153 | 12 |
| `html/0610-fenster-todo.html` | fenster TODO | 2165 | 19 |
| `html/0620-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2184 | 14 |
| `html/0630-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2198 | 12 |
| `html/0640-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2210 | 12 |
| `html/0650-fenster-produkt.html` | fenster PRODUKT | 2222 | 48 |
| `html/0660-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2270 | 13 |
| `html/0670-fenster-wareneingang.html` | fenster WARENEINGANG | 2283 | 20 |
| `html/0680-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2303 | 16 |
| `html/0690-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2319 | 12 |
| `html/0700-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2331 | 9 |
| `html/0710-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2340 | 19 |
| `html/0720-fenster-e-mail.html` | fenster E-MAIL | 2359 | 14 |
| `html/0730-fenster-bild-gross.html` | fenster BILD GROSS | 2373 | 11 |
| `html/0740-fenster-zuordnen.html` | fenster ZUORDNEN | 2384 | 10 |
| `js/0750-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2394 | 195 |
| `js/0760-hinweise-an-patienten.js` | Hinweise an Patienten | 2589 | 314 |
| `js/0770-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 2903 | 62 |
| `js/0780-kalender.js` | Kalender | 2965 | 279 |
| `js/0790-startseite.js` | Startseite | 3244 | 270 |
| `js/0800-patienten-termine-doku.js` | Patienten, Termine, Doku | 3514 | 84 |
| `js/0810-dateispeicher.js` | Dateispeicher  | 3598 | 60 |
| `js/0820-rechnungen.js` | Rechnungen | 3658 | 54 |
| `js/0830-leistungskategorien.js` | Leistungskategorien  | 3712 | 148 |
| `js/0840-goae.js` | GOÄ | 3860 | 742 |
| `js/0850-alle-tabellen.js` | Alle Tabellen | 4602 | 239 |
| `js/0860-pdf-erzeugung.js` | PDF-Erzeugung  | 4841 | 48 |
| `js/0870-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 4889 | 280 |
| `js/0880-briefumschlag-b6.js` | Briefumschlag B6  | 5169 | 444 |
| `js/0890-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5613 | 497 |
| `js/0900-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6110 | 262 |
| `js/0910-statistik.js` | Statistik | 6372 | 74 |
| `js/0920-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6446 | 113 |
| `js/0930-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6559 | 257 |
| `js/0940-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 6816 | 294 |
| `js/0950-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7110 | 136 |
| `js/0960-medien.js` | Medien | 7246 | 362 |
| `js/0970-webformulare.js` | Webformulare | 7608 | 278 |
| `js/0980-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 7886 | 198 |
| `js/0990-produktlager.js` | Produktlager | 8084 | 549 |
| `js/1000-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8633 | 242 |
| `js/1010-sicherung.js` | Sicherung  | 8875 | 219 |
| `js/1020-sicherung-als-zip.js` | Sicherung als ZIP | 9094 | 318 |
| `js/1030-geraete-abgleich.js` | Geräte-Abgleich | 9412 | 69 |
| `js/1040-eingangskorb.js` | Eingangskorb | 9481 | 97 |
| `html/1050-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9578 | 1 |
| `js/1060-app-start.js` | app-start | 9579 | 0 |
| `html/1070-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9579 | 7 |
| `js/1080-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9586 | 12 |
| `html/1090-dokument-ende.html` | dokument-ende | 9598 | 2 |
