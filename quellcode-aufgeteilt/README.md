# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `ba5fa4b8c3b9dcb4…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (28 Teile)
- `js/`: Programmlogik, nach Funktionsbereichen (35 Teile)
- `html/`: Oberfläche, nach Seiten und Fenstern (66 Teile)

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
| `css/0060-kalender.css` | Kalender | 163 | 365 |
| `css/0070-terminansicht.css` | Terminansicht | 528 | 55 |
| `css/0080-masken.css` | Masken | 583 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 644 | 91 |
| `css/0100-patientenliste.css` | Patientenliste | 735 | 92 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 827 | 36 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 863 | 33 |
| `css/0130-handy-quer.css` | Handy quer | 896 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 929 | 41 |
| `css/0150-querformat-und-desktop.css` | Querformat und Desktop | 970 | 14 |
| `css/0160-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 984 | 48 |
| `css/0170-reihenfolge.css` | Reihenfolge | 1032 | 29 |
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1061 | 47 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1108 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1129 | 33 |
| `css/0210-namensleiste.css` | Namensleiste | 1162 | 13 |
| `css/0220-hochkant.css` | Hochkant | 1175 | 30 |
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1205 | 48 |
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1253 | 88 |
| `css/0250-ueberschrift-kalender-entfaellt.css` | Überschrift „Kalender“ entfällt | 1341 | 12 |
| `css/0260-konsequent-ueberall.css` | Konsequent überall | 1353 | 15 |
| `css/0270-werkzeug-knoepfe.css` | Werkzeug-Knöpfe | 1368 | 15 |
| `css/0280-bildvergleich.css` | Bildvergleich | 1383 | 39 |
| `css/0290-videos-in-der-akte.css` | Videos in der Akte | 1422 | 33 |
| `css/0300-pdf-editor-und-vorlagenfelder-pdfedit.css` | PDF-Editor und Vorlagenfelder (pdfedit | 1455 | 24 |
| `css/0310-bildvergleich-vergleich.css` | Bildvergleich (vergleich | 1479 | 167 |
| `css/0320-zeitleiste-der-akte.css` | Zeitleiste der Akte | 1646 | 17 |
| `html/0330-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1663 | 7 |
| `js/0340-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1670 | 0 |
| `html/0350-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1670 | 13 |
| `js/0360-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1683 | 339 |
| `html/0370-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 2022 | 17 |
| `html/0380-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 2039 | 28 |
| `html/0390-seite-start.html` | seite START | 2067 | 47 |
| `html/0400-seite-patienten.html` | seite PATIENTEN | 2114 | 28 |
| `html/0410-seite-rechnungen.html` | seite RECHNUNGEN | 2142 | 30 |
| `html/0420-seite-leistungen.html` | seite LEISTUNGEN | 2172 | 29 |
| `html/0430-seite-dokumente.html` | seite DOKUMENTE | 2201 | 19 |
| `html/0440-seite-zahlungen.html` | seite ZAHLUNGEN | 2220 | 22 |
| `html/0450-seite-praxisdaten.html` | seite PRAXISDATEN | 2242 | 47 |
| `html/0460-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 2289 | 15 |
| `html/0470-seite-webformulare.html` | seite WEBFORMULARE | 2304 | 18 |
| `html/0480-seite-handy-verbindung-test.html` | seite HANDY-VERBINDUNG (Test) | 2322 | 9 |
| `html/0490-seite-sicherung.html` | seite SICHERUNG | 2331 | 19 |
| `html/0500-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2350 | 64 |
| `html/0510-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2414 | 9 |
| `html/0520-seite-todos.html` | seite TODOS | 2423 | 16 |
| `html/0530-seite-statistik.html` | seite STATISTIK | 2439 | 34 |
| `html/0540-seite-lager.html` | seite LAGER | 2473 | 20 |
| `html/0550-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2493 | 25 |
| `html/0560-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2518 | 43 |
| `html/0570-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2561 | 72 |
| `html/0580-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2633 | 10 |
| `html/0590-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2643 | 7 |
| `html/0600-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2650 | 17 |
| `html/0610-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2667 | 10 |
| `html/0620-fenster-rezept.html` | fenster REZEPT | 2677 | 23 |
| `html/0630-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2700 | 54 |
| `html/0640-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2754 | 27 |
| `html/0650-fenster-leistung.html` | fenster LEISTUNG | 2781 | 31 |
| `html/0660-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2812 | 20 |
| `html/0670-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2832 | 15 |
| `html/0680-fenster-ausgabe.html` | fenster AUSGABE | 2847 | 18 |
| `html/0690-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2865 | 37 |
| `html/0700-fenster-platzhalter.html` | fenster PLATZHALTER | 2902 | 15 |
| `html/0710-fenster-anrede.html` | fenster ANREDE | 2917 | 16 |
| `html/0720-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2933 | 14 |
| `html/0730-fenster-vorlage.html` | fenster VORLAGE | 2947 | 52 |
| `html/0740-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2999 | 9 |
| `html/0750-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 3008 | 18 |
| `html/0760-fenster-zahlung.html` | fenster ZAHLUNG | 3026 | 15 |
| `html/0770-fenster-sicherung.html` | fenster SICHERUNG | 3041 | 15 |
| `html/0780-fenster-fortschritt.html` | fenster FORTSCHRITT | 3056 | 11 |
| `html/0790-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 3067 | 10 |
| `html/0800-fenster-dokumentation.html` | fenster DOKUMENTATION | 3077 | 12 |
| `html/0810-fenster-todo.html` | fenster TODO | 3089 | 19 |
| `html/0820-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 3108 | 14 |
| `html/0830-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 3122 | 12 |
| `html/0840-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 3134 | 12 |
| `html/0850-fenster-produkt.html` | fenster PRODUKT | 3146 | 48 |
| `html/0860-fenster-ausbuchen.html` | fenster AUSBUCHEN | 3194 | 13 |
| `html/0870-fenster-wareneingang.html` | fenster WARENEINGANG | 3207 | 20 |
| `html/0880-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 3227 | 16 |
| `html/0890-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 3243 | 12 |
| `html/0900-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 3255 | 9 |
| `html/0910-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 3264 | 19 |
| `html/0920-fenster-e-mail.html` | fenster E-MAIL | 3283 | 14 |
| `html/0930-fenster-bild-gross.html` | fenster BILD GROSS | 3297 | 13 |
| `html/0940-fenster-zuordnen.html` | fenster ZUORDNEN | 3310 | 10 |
| `js/0950-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 3320 | 239 |
| `js/0960-hinweise-an-patienten.js` | Hinweise an Patienten | 3559 | 358 |
| `js/0970-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3917 | 167 |
| `js/0980-kalender.js` | Kalender | 4084 | 301 |
| `js/0990-startseite.js` | Startseite | 4385 | 282 |
| `js/1000-patienten-termine-doku.js` | Patienten, Termine, Doku | 4667 | 84 |
| `js/1010-dateispeicher.js` | Dateispeicher  | 4751 | 60 |
| `js/1020-rechnungen.js` | Rechnungen | 4811 | 54 |
| `js/1030-leistungskategorien.js` | Leistungskategorien  | 4865 | 145 |
| `js/1040-goae.js` | GOÄ | 5010 | 832 |
| `js/1050-alle-tabellen.js` | Alle Tabellen | 5842 | 239 |
| `js/1060-pdf-erzeugung.js` | PDF-Erzeugung  | 6081 | 48 |
| `js/1070-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 6129 | 280 |
| `js/1080-briefumschlag-c6.js` | Briefumschlag C6  | 6409 | 544 |
| `js/1090-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6953 | 686 |
| `js/1100-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 7639 | 263 |
| `js/1110-statistik.js` | Statistik | 7902 | 74 |
| `js/1120-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7976 | 108 |
| `js/1130-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 8084 | 305 |
| `js/1140-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 8389 | 339 |
| `js/1150-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8728 | 240 |
| `js/1160-medien.js` | Medien | 8968 | 466 |
| `js/1170-webformulare.js` | Webformulare | 9434 | 278 |
| `js/1180-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 9712 | 198 |
| `js/1190-produktlager.js` | Produktlager | 9910 | 549 |
| `js/1200-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 10459 | 242 |
| `js/1210-sicherung.js` | Sicherung  | 10701 | 219 |
| `js/1220-sicherung-als-zip.js` | Sicherung als ZIP | 10920 | 319 |
| `js/1230-geraete-abgleich.js` | Geräte-Abgleich | 11239 | 222 |
| `js/1240-eingangskorb.js` | Eingangskorb | 11461 | 97 |
| `html/1250-oberflaeche-rahmen.html` | oberflaeche-rahmen | 11558 | 1 |
| `js/1260-app-start.js` | app-start | 11559 | 0 |
| `html/1270-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 11559 | 7 |
| `js/1280-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 11566 | 12 |
| `html/1290-dokument-ende.html` | dokument-ende | 11578 | 2 |
