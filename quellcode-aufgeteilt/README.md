# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `e352909dbe9ac305…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (9 Teile)
- `js/`: Programmlogik, nach Funktionsbereichen (33 Teile)
- `html/`: Oberfläche, nach Seiten und Fenstern (63 Teile)

Bereits vorher eigenständige Dateien (nicht kopiert): `dialoge.js` (Hinweise, Rückfragen, Passkey), `docs.js` (Dokumente, Vorlagen),
`sync.js` (Geräte-Abgleich, Postfach), `extcal.js` (privater Kalender), `forms.js`, `ftexte.js`, `forms.css` (Webformulare),
`sw.js` (Offline-Speicher, Updates).

| Datei | Inhalt | ab Zeile in index.html | Zeilen |
|---|---|---|---|
| `html/0010-dokumentkopf.html` | dokumentkopf | 1 | 5 |
| `js/0020-passkey-so-frueh-wie-moeglich-anfordern.js` | Passkey so früh wie möglich anfordern | 6 | 16 |
| `html/0030-oberflaeche-rahmen.html` | oberflaeche-rahmen | 22 | 7 |
| `css/0040-grundlagen.css` | grundlagen | 29 | 132 |
| `css/0050-kalender.css` | Kalender | 161 | 353 |
| `css/0060-terminansicht.css` | Terminansicht | 514 | 52 |
| `css/0070-masken.css` | Masken | 566 | 61 |
| `css/0080-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 627 | 66 |
| `css/0090-patientenakte-im-querformat.css` | Patientenakte im Querformat | 693 | 15 |
| `css/0100-patientenliste.css` | Patientenliste | 708 | 101 |
| `css/0110-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 809 | 32 |
| `css/0120-handy-quer.css` | Handy quer | 841 | 14 |
| `html/0130-oberflaeche-rahmen.html` | oberflaeche-rahmen | 855 | 5 |
| `js/0140-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 860 | 0 |
| `html/0150-oberflaeche-body-applock.html` | oberflaeche-body-applock | 860 | 12 |
| `js/0160-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 872 | 252 |
| `html/0170-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1124 | 33 |
| `html/0180-seite-start.html` | seite START | 1157 | 47 |
| `html/0190-seite-patienten.html` | seite PATIENTEN | 1204 | 30 |
| `html/0200-seite-rechnungen.html` | seite RECHNUNGEN | 1234 | 29 |
| `html/0210-seite-leistungen.html` | seite LEISTUNGEN | 1263 | 33 |
| `html/0220-seite-dokumente.html` | seite DOKUMENTE | 1296 | 19 |
| `html/0230-seite-zahlungen.html` | seite ZAHLUNGEN | 1315 | 22 |
| `html/0240-seite-praxisdaten.html` | seite PRAXISDATEN | 1337 | 47 |
| `html/0250-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1384 | 15 |
| `html/0260-seite-webformulare.html` | seite WEBFORMULARE | 1399 | 18 |
| `html/0270-seite-sicherung.html` | seite SICHERUNG | 1417 | 14 |
| `html/0280-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1431 | 49 |
| `html/0290-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1480 | 9 |
| `html/0300-seite-todos.html` | seite TODOS | 1489 | 16 |
| `html/0310-seite-statistik.html` | seite STATISTIK | 1505 | 34 |
| `html/0320-seite-lager.html` | seite LAGER | 1539 | 20 |
| `html/0330-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1559 | 25 |
| `html/0340-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1584 | 43 |
| `html/0350-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1627 | 71 |
| `html/0360-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1698 | 9 |
| `html/0370-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1707 | 7 |
| `html/0380-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1714 | 17 |
| `html/0390-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1731 | 10 |
| `html/0400-fenster-rezept.html` | fenster REZEPT | 1741 | 23 |
| `html/0410-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1764 | 43 |
| `html/0420-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1807 | 27 |
| `html/0430-fenster-leistung.html` | fenster LEISTUNG | 1834 | 20 |
| `html/0440-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 1854 | 20 |
| `html/0450-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 1874 | 15 |
| `html/0460-fenster-ausgabe.html` | fenster AUSGABE | 1889 | 18 |
| `html/0470-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 1907 | 37 |
| `html/0480-fenster-platzhalter.html` | fenster PLATZHALTER | 1944 | 15 |
| `html/0490-fenster-anrede.html` | fenster ANREDE | 1959 | 16 |
| `html/0500-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 1975 | 14 |
| `html/0510-fenster-vorlage.html` | fenster VORLAGE | 1989 | 33 |
| `html/0520-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2022 | 9 |
| `html/0530-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2031 | 17 |
| `html/0540-fenster-zahlung.html` | fenster ZAHLUNG | 2048 | 15 |
| `html/0550-fenster-sicherung.html` | fenster SICHERUNG | 2063 | 15 |
| `html/0560-fenster-fortschritt.html` | fenster FORTSCHRITT | 2078 | 11 |
| `html/0570-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2089 | 10 |
| `html/0580-fenster-dokumentation.html` | fenster DOKUMENTATION | 2099 | 12 |
| `html/0590-fenster-todo.html` | fenster TODO | 2111 | 19 |
| `html/0600-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2130 | 14 |
| `html/0610-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2144 | 12 |
| `html/0620-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2156 | 12 |
| `html/0630-fenster-produkt.html` | fenster PRODUKT | 2168 | 48 |
| `html/0640-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2216 | 13 |
| `html/0650-fenster-wareneingang.html` | fenster WARENEINGANG | 2229 | 20 |
| `html/0660-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2249 | 16 |
| `html/0670-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2265 | 12 |
| `html/0680-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2277 | 9 |
| `html/0690-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2286 | 19 |
| `html/0700-fenster-e-mail.html` | fenster E-MAIL | 2305 | 14 |
| `html/0710-fenster-bild-gross.html` | fenster BILD GROSS | 2319 | 11 |
| `html/0720-fenster-zuordnen.html` | fenster ZUORDNEN | 2330 | 10 |
| `js/0730-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2340 | 195 |
| `js/0740-hinweise-an-patienten.js` | Hinweise an Patienten | 2535 | 314 |
| `js/0750-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 2849 | 62 |
| `js/0760-kalender.js` | Kalender | 2911 | 279 |
| `js/0770-startseite.js` | Startseite | 3190 | 270 |
| `js/0780-patienten-termine-doku.js` | Patienten, Termine, Doku | 3460 | 84 |
| `js/0790-dateispeicher.js` | Dateispeicher  | 3544 | 60 |
| `js/0800-rechnungen.js` | Rechnungen | 3604 | 53 |
| `js/0810-leistungskategorien.js` | Leistungskategorien  | 3657 | 651 |
| `js/0820-alle-tabellen.js` | Alle Tabellen | 4308 | 229 |
| `js/0830-pdf-erzeugung.js` | PDF-Erzeugung  | 4537 | 48 |
| `js/0840-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 4585 | 643 |
| `js/0850-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5228 | 497 |
| `js/0860-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 5725 | 262 |
| `js/0870-statistik.js` | Statistik | 5987 | 74 |
| `js/0880-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6061 | 113 |
| `js/0890-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6174 | 257 |
| `js/0900-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 6431 | 288 |
| `js/0910-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 6719 | 136 |
| `js/0920-medien.js` | Medien | 6855 | 362 |
| `js/0930-webformulare.js` | Webformulare | 7217 | 278 |
| `js/0940-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 7495 | 198 |
| `js/0950-produktlager.js` | Produktlager | 7693 | 549 |
| `js/0960-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8242 | 242 |
| `js/0970-sicherung.js` | Sicherung  | 8484 | 219 |
| `js/0980-sicherung-als-zip.js` | Sicherung als ZIP | 8703 | 318 |
| `js/0990-geraete-abgleich.js` | Geräte-Abgleich | 9021 | 70 |
| `js/1000-eingangskorb.js` | Eingangskorb | 9091 | 73 |
| `html/1010-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9164 | 1 |
| `js/1020-app-start.js` | app-start | 9165 | 0 |
| `html/1030-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9165 | 7 |
| `js/1040-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9172 | 12 |
| `html/1050-dokument-ende.html` | dokument-ende | 9184 | 2 |
