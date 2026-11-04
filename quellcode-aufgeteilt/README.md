# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `04ab26f288762703…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (9 Teile)
- `js/`: Programmlogik, nach Funktionsbereichen (33 Teile)
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
| `css/0100-patientenakte-im-querformat.css` | Patientenakte im Querformat | 695 | 15 |
| `css/0110-patientenliste.css` | Patientenliste | 710 | 101 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 811 | 32 |
| `css/0130-handy-quer.css` | Handy quer | 843 | 15 |
| `html/0140-oberflaeche-rahmen.html` | oberflaeche-rahmen | 858 | 5 |
| `js/0150-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 863 | 0 |
| `html/0160-oberflaeche-body-applock.html` | oberflaeche-body-applock | 863 | 12 |
| `js/0170-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 875 | 252 |
| `html/0180-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1127 | 33 |
| `html/0190-seite-start.html` | seite START | 1160 | 47 |
| `html/0200-seite-patienten.html` | seite PATIENTEN | 1207 | 30 |
| `html/0210-seite-rechnungen.html` | seite RECHNUNGEN | 1237 | 30 |
| `html/0220-seite-leistungen.html` | seite LEISTUNGEN | 1267 | 33 |
| `html/0230-seite-dokumente.html` | seite DOKUMENTE | 1300 | 19 |
| `html/0240-seite-zahlungen.html` | seite ZAHLUNGEN | 1319 | 22 |
| `html/0250-seite-praxisdaten.html` | seite PRAXISDATEN | 1341 | 47 |
| `html/0260-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1388 | 15 |
| `html/0270-seite-webformulare.html` | seite WEBFORMULARE | 1403 | 18 |
| `html/0280-seite-sicherung.html` | seite SICHERUNG | 1421 | 14 |
| `html/0290-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1435 | 49 |
| `html/0300-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1484 | 9 |
| `html/0310-seite-todos.html` | seite TODOS | 1493 | 16 |
| `html/0320-seite-statistik.html` | seite STATISTIK | 1509 | 34 |
| `html/0330-seite-lager.html` | seite LAGER | 1543 | 20 |
| `html/0340-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1563 | 25 |
| `html/0350-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1588 | 43 |
| `html/0360-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1631 | 71 |
| `html/0370-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1702 | 9 |
| `html/0380-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1711 | 7 |
| `html/0390-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1718 | 17 |
| `html/0400-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1735 | 10 |
| `html/0410-fenster-rezept.html` | fenster REZEPT | 1745 | 23 |
| `html/0420-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1768 | 43 |
| `html/0430-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1811 | 27 |
| `html/0440-fenster-leistung.html` | fenster LEISTUNG | 1838 | 20 |
| `html/0450-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 1858 | 20 |
| `html/0460-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 1878 | 15 |
| `html/0470-fenster-ausgabe.html` | fenster AUSGABE | 1893 | 18 |
| `html/0480-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 1911 | 37 |
| `html/0490-fenster-platzhalter.html` | fenster PLATZHALTER | 1948 | 15 |
| `html/0500-fenster-anrede.html` | fenster ANREDE | 1963 | 16 |
| `html/0510-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 1979 | 14 |
| `html/0520-fenster-vorlage.html` | fenster VORLAGE | 1993 | 33 |
| `html/0530-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2026 | 9 |
| `html/0540-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2035 | 18 |
| `html/0550-fenster-zahlung.html` | fenster ZAHLUNG | 2053 | 15 |
| `html/0560-fenster-sicherung.html` | fenster SICHERUNG | 2068 | 15 |
| `html/0570-fenster-fortschritt.html` | fenster FORTSCHRITT | 2083 | 11 |
| `html/0580-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2094 | 10 |
| `html/0590-fenster-dokumentation.html` | fenster DOKUMENTATION | 2104 | 12 |
| `html/0600-fenster-todo.html` | fenster TODO | 2116 | 19 |
| `html/0610-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2135 | 14 |
| `html/0620-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2149 | 12 |
| `html/0630-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2161 | 12 |
| `html/0640-fenster-produkt.html` | fenster PRODUKT | 2173 | 48 |
| `html/0650-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2221 | 13 |
| `html/0660-fenster-wareneingang.html` | fenster WARENEINGANG | 2234 | 20 |
| `html/0670-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2254 | 16 |
| `html/0680-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2270 | 12 |
| `html/0690-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2282 | 9 |
| `html/0700-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2291 | 19 |
| `html/0710-fenster-e-mail.html` | fenster E-MAIL | 2310 | 14 |
| `html/0720-fenster-bild-gross.html` | fenster BILD GROSS | 2324 | 11 |
| `html/0730-fenster-zuordnen.html` | fenster ZUORDNEN | 2335 | 10 |
| `js/0740-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2345 | 195 |
| `js/0750-hinweise-an-patienten.js` | Hinweise an Patienten | 2540 | 314 |
| `js/0760-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 2854 | 62 |
| `js/0770-kalender.js` | Kalender | 2916 | 279 |
| `js/0780-startseite.js` | Startseite | 3195 | 270 |
| `js/0790-patienten-termine-doku.js` | Patienten, Termine, Doku | 3465 | 84 |
| `js/0800-dateispeicher.js` | Dateispeicher  | 3549 | 60 |
| `js/0810-rechnungen.js` | Rechnungen | 3609 | 53 |
| `js/0820-leistungskategorien.js` | Leistungskategorien  | 3662 | 673 |
| `js/0830-alle-tabellen.js` | Alle Tabellen | 4335 | 230 |
| `js/0840-pdf-erzeugung.js` | PDF-Erzeugung  | 4565 | 48 |
| `js/0850-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 4613 | 643 |
| `js/0860-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5256 | 497 |
| `js/0870-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 5753 | 262 |
| `js/0880-statistik.js` | Statistik | 6015 | 74 |
| `js/0890-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6089 | 113 |
| `js/0900-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6202 | 257 |
| `js/0910-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 6459 | 288 |
| `js/0920-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 6747 | 136 |
| `js/0930-medien.js` | Medien | 6883 | 362 |
| `js/0940-webformulare.js` | Webformulare | 7245 | 278 |
| `js/0950-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 7523 | 198 |
| `js/0960-produktlager.js` | Produktlager | 7721 | 549 |
| `js/0970-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8270 | 242 |
| `js/0980-sicherung.js` | Sicherung  | 8512 | 219 |
| `js/0990-sicherung-als-zip.js` | Sicherung als ZIP | 8731 | 318 |
| `js/1000-geraete-abgleich.js` | Geräte-Abgleich | 9049 | 70 |
| `js/1010-eingangskorb.js` | Eingangskorb | 9119 | 97 |
| `html/1020-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9216 | 1 |
| `js/1030-app-start.js` | app-start | 9217 | 0 |
| `html/1040-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9217 | 7 |
| `js/1050-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9224 | 12 |
| `html/1060-dokument-ende.html` | dokument-ende | 9236 | 2 |
