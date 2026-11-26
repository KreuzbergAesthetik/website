# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `c386ec948bd47973…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (27 Teile)
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
| `css/0310-bildvergleich-vergleich.css` | Bildvergleich (vergleich | 1479 | 183 |
| `html/0320-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1662 | 7 |
| `js/0330-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1669 | 0 |
| `html/0340-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1669 | 13 |
| `js/0350-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1682 | 339 |
| `html/0360-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 2021 | 17 |
| `html/0370-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 2038 | 28 |
| `html/0380-seite-start.html` | seite START | 2066 | 47 |
| `html/0390-seite-patienten.html` | seite PATIENTEN | 2113 | 28 |
| `html/0400-seite-rechnungen.html` | seite RECHNUNGEN | 2141 | 30 |
| `html/0410-seite-leistungen.html` | seite LEISTUNGEN | 2171 | 29 |
| `html/0420-seite-dokumente.html` | seite DOKUMENTE | 2200 | 19 |
| `html/0430-seite-zahlungen.html` | seite ZAHLUNGEN | 2219 | 22 |
| `html/0440-seite-praxisdaten.html` | seite PRAXISDATEN | 2241 | 47 |
| `html/0450-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 2288 | 15 |
| `html/0460-seite-webformulare.html` | seite WEBFORMULARE | 2303 | 18 |
| `html/0470-seite-handy-verbindung-test.html` | seite HANDY-VERBINDUNG (Test) | 2321 | 9 |
| `html/0480-seite-sicherung.html` | seite SICHERUNG | 2330 | 19 |
| `html/0490-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2349 | 64 |
| `html/0500-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2413 | 9 |
| `html/0510-seite-todos.html` | seite TODOS | 2422 | 16 |
| `html/0520-seite-statistik.html` | seite STATISTIK | 2438 | 34 |
| `html/0530-seite-lager.html` | seite LAGER | 2472 | 20 |
| `html/0540-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2492 | 25 |
| `html/0550-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2517 | 43 |
| `html/0560-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2560 | 72 |
| `html/0570-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2632 | 10 |
| `html/0580-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2642 | 7 |
| `html/0590-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2649 | 17 |
| `html/0600-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2666 | 10 |
| `html/0610-fenster-rezept.html` | fenster REZEPT | 2676 | 23 |
| `html/0620-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2699 | 54 |
| `html/0630-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2753 | 27 |
| `html/0640-fenster-leistung.html` | fenster LEISTUNG | 2780 | 31 |
| `html/0650-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2811 | 20 |
| `html/0660-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2831 | 15 |
| `html/0670-fenster-ausgabe.html` | fenster AUSGABE | 2846 | 18 |
| `html/0680-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2864 | 37 |
| `html/0690-fenster-platzhalter.html` | fenster PLATZHALTER | 2901 | 15 |
| `html/0700-fenster-anrede.html` | fenster ANREDE | 2916 | 16 |
| `html/0710-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2932 | 14 |
| `html/0720-fenster-vorlage.html` | fenster VORLAGE | 2946 | 52 |
| `html/0730-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2998 | 9 |
| `html/0740-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 3007 | 18 |
| `html/0750-fenster-zahlung.html` | fenster ZAHLUNG | 3025 | 15 |
| `html/0760-fenster-sicherung.html` | fenster SICHERUNG | 3040 | 15 |
| `html/0770-fenster-fortschritt.html` | fenster FORTSCHRITT | 3055 | 11 |
| `html/0780-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 3066 | 10 |
| `html/0790-fenster-dokumentation.html` | fenster DOKUMENTATION | 3076 | 12 |
| `html/0800-fenster-todo.html` | fenster TODO | 3088 | 19 |
| `html/0810-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 3107 | 14 |
| `html/0820-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 3121 | 12 |
| `html/0830-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 3133 | 12 |
| `html/0840-fenster-produkt.html` | fenster PRODUKT | 3145 | 48 |
| `html/0850-fenster-ausbuchen.html` | fenster AUSBUCHEN | 3193 | 13 |
| `html/0860-fenster-wareneingang.html` | fenster WARENEINGANG | 3206 | 20 |
| `html/0870-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 3226 | 16 |
| `html/0880-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 3242 | 12 |
| `html/0890-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 3254 | 9 |
| `html/0900-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 3263 | 19 |
| `html/0910-fenster-e-mail.html` | fenster E-MAIL | 3282 | 14 |
| `html/0920-fenster-bild-gross.html` | fenster BILD GROSS | 3296 | 13 |
| `html/0930-fenster-zuordnen.html` | fenster ZUORDNEN | 3309 | 10 |
| `js/0940-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 3319 | 239 |
| `js/0950-hinweise-an-patienten.js` | Hinweise an Patienten | 3558 | 358 |
| `js/0960-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3916 | 167 |
| `js/0970-kalender.js` | Kalender | 4083 | 301 |
| `js/0980-startseite.js` | Startseite | 4384 | 282 |
| `js/0990-patienten-termine-doku.js` | Patienten, Termine, Doku | 4666 | 84 |
| `js/1000-dateispeicher.js` | Dateispeicher  | 4750 | 60 |
| `js/1010-rechnungen.js` | Rechnungen | 4810 | 54 |
| `js/1020-leistungskategorien.js` | Leistungskategorien  | 4864 | 145 |
| `js/1030-goae.js` | GOÄ | 5009 | 832 |
| `js/1040-alle-tabellen.js` | Alle Tabellen | 5841 | 239 |
| `js/1050-pdf-erzeugung.js` | PDF-Erzeugung  | 6080 | 48 |
| `js/1060-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 6128 | 280 |
| `js/1070-briefumschlag-c6.js` | Briefumschlag C6  | 6408 | 544 |
| `js/1080-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6952 | 686 |
| `js/1090-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 7638 | 263 |
| `js/1100-statistik.js` | Statistik | 7901 | 74 |
| `js/1110-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7975 | 108 |
| `js/1120-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 8083 | 305 |
| `js/1130-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 8388 | 339 |
| `js/1140-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8727 | 240 |
| `js/1150-medien.js` | Medien | 8967 | 466 |
| `js/1160-webformulare.js` | Webformulare | 9433 | 278 |
| `js/1170-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 9711 | 198 |
| `js/1180-produktlager.js` | Produktlager | 9909 | 549 |
| `js/1190-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 10458 | 242 |
| `js/1200-sicherung.js` | Sicherung  | 10700 | 219 |
| `js/1210-sicherung-als-zip.js` | Sicherung als ZIP | 10919 | 319 |
| `js/1220-geraete-abgleich.js` | Geräte-Abgleich | 11238 | 222 |
| `js/1230-eingangskorb.js` | Eingangskorb | 11460 | 97 |
| `html/1240-oberflaeche-rahmen.html` | oberflaeche-rahmen | 11557 | 1 |
| `js/1250-app-start.js` | app-start | 11558 | 0 |
| `html/1260-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 11558 | 7 |
| `js/1270-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 11565 | 12 |
| `html/1280-dokument-ende.html` | dokument-ende | 11577 | 2 |
