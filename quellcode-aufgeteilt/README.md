# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `f8dc04ac82f6c387…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (26 Teile)
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
| `css/0220-hochkant.css` | Hochkant | 1175 | 39 |
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1214 | 52 |
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1266 | 88 |
| `css/0250-ueberschrift-kalender-entfaellt.css` | Überschrift „Kalender“ entfällt | 1354 | 12 |
| `css/0260-konsequent-ueberall.css` | Konsequent überall | 1366 | 15 |
| `css/0270-werkzeug-knoepfe.css` | Werkzeug-Knöpfe | 1381 | 15 |
| `css/0280-bildvergleich.css` | Bildvergleich | 1396 | 39 |
| `css/0290-videos-in-der-akte.css` | Videos in der Akte | 1435 | 33 |
| `css/0300-pdf-editor-und-vorlagenfelder-pdfedit.css` | PDF-Editor und Vorlagenfelder (pdfedit | 1468 | 22 |
| `html/0310-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1490 | 6 |
| `js/0320-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1496 | 0 |
| `html/0330-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1496 | 13 |
| `js/0340-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1509 | 339 |
| `html/0350-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1848 | 17 |
| `html/0360-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1865 | 28 |
| `html/0370-seite-start.html` | seite START | 1893 | 47 |
| `html/0380-seite-patienten.html` | seite PATIENTEN | 1940 | 28 |
| `html/0390-seite-rechnungen.html` | seite RECHNUNGEN | 1968 | 30 |
| `html/0400-seite-leistungen.html` | seite LEISTUNGEN | 1998 | 29 |
| `html/0410-seite-dokumente.html` | seite DOKUMENTE | 2027 | 19 |
| `html/0420-seite-zahlungen.html` | seite ZAHLUNGEN | 2046 | 22 |
| `html/0430-seite-praxisdaten.html` | seite PRAXISDATEN | 2068 | 47 |
| `html/0440-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 2115 | 15 |
| `html/0450-seite-webformulare.html` | seite WEBFORMULARE | 2130 | 18 |
| `html/0460-seite-sicherung.html` | seite SICHERUNG | 2148 | 24 |
| `html/0470-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2172 | 48 |
| `html/0480-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2220 | 9 |
| `html/0490-seite-todos.html` | seite TODOS | 2229 | 16 |
| `html/0500-seite-statistik.html` | seite STATISTIK | 2245 | 34 |
| `html/0510-seite-lager.html` | seite LAGER | 2279 | 20 |
| `html/0520-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2299 | 25 |
| `html/0530-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2324 | 43 |
| `html/0540-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2367 | 73 |
| `html/0550-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2440 | 10 |
| `html/0560-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2450 | 7 |
| `html/0570-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2457 | 17 |
| `html/0580-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2474 | 10 |
| `html/0590-fenster-rezept.html` | fenster REZEPT | 2484 | 23 |
| `html/0600-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2507 | 54 |
| `html/0610-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2561 | 27 |
| `html/0620-fenster-leistung.html` | fenster LEISTUNG | 2588 | 31 |
| `html/0630-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2619 | 20 |
| `html/0640-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2639 | 15 |
| `html/0650-fenster-ausgabe.html` | fenster AUSGABE | 2654 | 18 |
| `html/0660-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2672 | 37 |
| `html/0670-fenster-platzhalter.html` | fenster PLATZHALTER | 2709 | 15 |
| `html/0680-fenster-anrede.html` | fenster ANREDE | 2724 | 16 |
| `html/0690-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2740 | 14 |
| `html/0700-fenster-vorlage.html` | fenster VORLAGE | 2754 | 49 |
| `html/0710-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2803 | 9 |
| `html/0720-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2812 | 18 |
| `html/0730-fenster-zahlung.html` | fenster ZAHLUNG | 2830 | 15 |
| `html/0740-fenster-sicherung.html` | fenster SICHERUNG | 2845 | 15 |
| `html/0750-fenster-fortschritt.html` | fenster FORTSCHRITT | 2860 | 11 |
| `html/0760-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2871 | 10 |
| `html/0770-fenster-dokumentation.html` | fenster DOKUMENTATION | 2881 | 12 |
| `html/0780-fenster-todo.html` | fenster TODO | 2893 | 19 |
| `html/0790-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2912 | 14 |
| `html/0800-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2926 | 12 |
| `html/0810-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2938 | 12 |
| `html/0820-fenster-produkt.html` | fenster PRODUKT | 2950 | 48 |
| `html/0830-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2998 | 13 |
| `html/0840-fenster-wareneingang.html` | fenster WARENEINGANG | 3011 | 20 |
| `html/0850-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 3031 | 16 |
| `html/0860-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 3047 | 12 |
| `html/0870-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 3059 | 9 |
| `html/0880-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 3068 | 19 |
| `html/0890-fenster-e-mail.html` | fenster E-MAIL | 3087 | 14 |
| `html/0900-fenster-bild-gross.html` | fenster BILD GROSS | 3101 | 12 |
| `html/0910-fenster-bildvergleich.html` | fenster BILDVERGLEICH | 3113 | 10 |
| `html/0920-fenster-zuordnen.html` | fenster ZUORDNEN | 3123 | 10 |
| `js/0930-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 3133 | 224 |
| `js/0940-hinweise-an-patienten.js` | Hinweise an Patienten | 3357 | 358 |
| `js/0950-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3715 | 167 |
| `js/0960-kalender.js` | Kalender | 3882 | 301 |
| `js/0970-startseite.js` | Startseite | 4183 | 280 |
| `js/0980-patienten-termine-doku.js` | Patienten, Termine, Doku | 4463 | 84 |
| `js/0990-dateispeicher.js` | Dateispeicher  | 4547 | 60 |
| `js/1000-rechnungen.js` | Rechnungen | 4607 | 54 |
| `js/1010-leistungskategorien.js` | Leistungskategorien  | 4661 | 145 |
| `js/1020-goae.js` | GOÄ | 4806 | 801 |
| `js/1030-alle-tabellen.js` | Alle Tabellen | 5607 | 239 |
| `js/1040-pdf-erzeugung.js` | PDF-Erzeugung  | 5846 | 48 |
| `js/1050-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5894 | 280 |
| `js/1060-briefumschlag-c6.js` | Briefumschlag C6  | 6174 | 495 |
| `js/1070-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6669 | 604 |
| `js/1080-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 7273 | 263 |
| `js/1090-statistik.js` | Statistik | 7536 | 74 |
| `js/1100-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7610 | 108 |
| `js/1110-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7718 | 281 |
| `js/1120-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7999 | 305 |
| `js/1130-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8304 | 195 |
| `js/1140-medien.js` | Medien | 8499 | 462 |
| `js/1150-webformulare.js` | Webformulare | 8961 | 278 |
| `js/1160-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 9239 | 198 |
| `js/1170-produktlager.js` | Produktlager | 9437 | 549 |
| `js/1180-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9986 | 242 |
| `js/1190-sicherung.js` | Sicherung  | 10228 | 219 |
| `js/1200-sicherung-als-zip.js` | Sicherung als ZIP | 10447 | 319 |
| `js/1210-geraete-abgleich.js` | Geräte-Abgleich | 10766 | 210 |
| `js/1220-eingangskorb.js` | Eingangskorb | 10976 | 97 |
| `html/1230-oberflaeche-rahmen.html` | oberflaeche-rahmen | 11073 | 1 |
| `js/1240-app-start.js` | app-start | 11074 | 0 |
| `html/1250-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 11074 | 7 |
| `js/1260-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 11081 | 12 |
| `html/1270-dokument-ende.html` | dokument-ende | 11093 | 2 |
