# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `e42dfe1a0db7f0ec…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (24 Teile)
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
| `css/0280-bildvergleich.css` | Bildvergleich | 1396 | 36 |
| `html/0290-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1432 | 5 |
| `js/0300-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1437 | 0 |
| `html/0310-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1437 | 13 |
| `js/0320-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1450 | 275 |
| `html/0330-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1725 | 17 |
| `html/0340-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1742 | 28 |
| `html/0350-seite-start.html` | seite START | 1770 | 47 |
| `html/0360-seite-patienten.html` | seite PATIENTEN | 1817 | 28 |
| `html/0370-seite-rechnungen.html` | seite RECHNUNGEN | 1845 | 30 |
| `html/0380-seite-leistungen.html` | seite LEISTUNGEN | 1875 | 33 |
| `html/0390-seite-dokumente.html` | seite DOKUMENTE | 1908 | 19 |
| `html/0400-seite-zahlungen.html` | seite ZAHLUNGEN | 1927 | 22 |
| `html/0410-seite-praxisdaten.html` | seite PRAXISDATEN | 1949 | 47 |
| `html/0420-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1996 | 15 |
| `html/0430-seite-webformulare.html` | seite WEBFORMULARE | 2011 | 18 |
| `html/0440-seite-sicherung.html` | seite SICHERUNG | 2029 | 14 |
| `html/0450-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2043 | 48 |
| `html/0460-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2091 | 9 |
| `html/0470-seite-todos.html` | seite TODOS | 2100 | 16 |
| `html/0480-seite-statistik.html` | seite STATISTIK | 2116 | 34 |
| `html/0490-seite-lager.html` | seite LAGER | 2150 | 20 |
| `html/0500-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2170 | 25 |
| `html/0510-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2195 | 43 |
| `html/0520-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2238 | 71 |
| `html/0530-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2309 | 10 |
| `html/0540-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2319 | 7 |
| `html/0550-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2326 | 17 |
| `html/0560-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2343 | 10 |
| `html/0570-fenster-rezept.html` | fenster REZEPT | 2353 | 23 |
| `html/0580-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2376 | 54 |
| `html/0590-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2430 | 27 |
| `html/0600-fenster-leistung.html` | fenster LEISTUNG | 2457 | 31 |
| `html/0610-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2488 | 20 |
| `html/0620-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2508 | 15 |
| `html/0630-fenster-ausgabe.html` | fenster AUSGABE | 2523 | 18 |
| `html/0640-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2541 | 37 |
| `html/0650-fenster-platzhalter.html` | fenster PLATZHALTER | 2578 | 15 |
| `html/0660-fenster-anrede.html` | fenster ANREDE | 2593 | 16 |
| `html/0670-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2609 | 14 |
| `html/0680-fenster-vorlage.html` | fenster VORLAGE | 2623 | 34 |
| `html/0690-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2657 | 9 |
| `html/0700-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2666 | 18 |
| `html/0710-fenster-zahlung.html` | fenster ZAHLUNG | 2684 | 15 |
| `html/0720-fenster-sicherung.html` | fenster SICHERUNG | 2699 | 15 |
| `html/0730-fenster-fortschritt.html` | fenster FORTSCHRITT | 2714 | 11 |
| `html/0740-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2725 | 10 |
| `html/0750-fenster-dokumentation.html` | fenster DOKUMENTATION | 2735 | 12 |
| `html/0760-fenster-todo.html` | fenster TODO | 2747 | 19 |
| `html/0770-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2766 | 14 |
| `html/0780-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2780 | 12 |
| `html/0790-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2792 | 12 |
| `html/0800-fenster-produkt.html` | fenster PRODUKT | 2804 | 48 |
| `html/0810-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2852 | 13 |
| `html/0820-fenster-wareneingang.html` | fenster WARENEINGANG | 2865 | 20 |
| `html/0830-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2885 | 16 |
| `html/0840-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2901 | 12 |
| `html/0850-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2913 | 9 |
| `html/0860-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2922 | 19 |
| `html/0870-fenster-e-mail.html` | fenster E-MAIL | 2941 | 14 |
| `html/0880-fenster-bild-gross.html` | fenster BILD GROSS | 2955 | 12 |
| `html/0890-fenster-bildvergleich.html` | fenster BILDVERGLEICH | 2967 | 10 |
| `html/0900-fenster-zuordnen.html` | fenster ZUORDNEN | 2977 | 10 |
| `js/0910-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2987 | 224 |
| `js/0920-hinweise-an-patienten.js` | Hinweise an Patienten | 3211 | 358 |
| `js/0930-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3569 | 152 |
| `js/0940-kalender.js` | Kalender | 3721 | 301 |
| `js/0950-startseite.js` | Startseite | 4022 | 280 |
| `js/0960-patienten-termine-doku.js` | Patienten, Termine, Doku | 4302 | 84 |
| `js/0970-dateispeicher.js` | Dateispeicher  | 4386 | 60 |
| `js/0980-rechnungen.js` | Rechnungen | 4446 | 54 |
| `js/0990-leistungskategorien.js` | Leistungskategorien  | 4500 | 148 |
| `js/1000-goae.js` | GOÄ | 4648 | 801 |
| `js/1010-alle-tabellen.js` | Alle Tabellen | 5449 | 239 |
| `js/1020-pdf-erzeugung.js` | PDF-Erzeugung  | 5688 | 48 |
| `js/1030-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5736 | 280 |
| `js/1040-briefumschlag-c6.js` | Briefumschlag C6  | 6016 | 494 |
| `js/1050-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6510 | 498 |
| `js/1060-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 7008 | 263 |
| `js/1070-statistik.js` | Statistik | 7271 | 74 |
| `js/1080-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7345 | 108 |
| `js/1090-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7453 | 281 |
| `js/1100-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7734 | 299 |
| `js/1110-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8033 | 166 |
| `js/1120-medien.js` | Medien | 8199 | 433 |
| `js/1130-webformulare.js` | Webformulare | 8632 | 278 |
| `js/1140-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8910 | 198 |
| `js/1150-produktlager.js` | Produktlager | 9108 | 549 |
| `js/1160-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9657 | 242 |
| `js/1170-sicherung.js` | Sicherung  | 9899 | 219 |
| `js/1180-sicherung-als-zip.js` | Sicherung als ZIP | 10118 | 318 |
| `js/1190-geraete-abgleich.js` | Geräte-Abgleich | 10436 | 69 |
| `js/1200-eingangskorb.js` | Eingangskorb | 10505 | 97 |
| `html/1210-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10602 | 1 |
| `js/1220-app-start.js` | app-start | 10603 | 0 |
| `html/1230-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10603 | 7 |
| `js/1240-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10610 | 12 |
| `html/1250-dokument-ende.html` | dokument-ende | 10622 | 2 |
