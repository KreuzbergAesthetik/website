# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `1c05d4992e687851…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (20 Teile)
- `js/`: Programmlogik, nach Funktionsbereichen (35 Teile)
- `html/`: Oberfläche, nach Seiten und Fenstern (65 Teile)

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
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 643 | 91 |
| `css/0100-patientenliste.css` | Patientenliste | 734 | 92 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 826 | 36 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 862 | 33 |
| `css/0130-handy-quer.css` | Handy quer | 895 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 928 | 41 |
| `css/0150-querformat-und-desktop.css` | Querformat und Desktop | 969 | 14 |
| `css/0160-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 983 | 48 |
| `css/0170-reihenfolge.css` | Reihenfolge | 1031 | 29 |
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1060 | 47 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1107 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1128 | 33 |
| `css/0210-namensleiste.css` | Namensleiste | 1161 | 13 |
| `css/0220-hochkant.css` | Hochkant | 1174 | 39 |
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1213 | 48 |
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1261 | 24 |
| `html/0250-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1285 | 5 |
| `js/0260-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1290 | 0 |
| `html/0270-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1290 | 13 |
| `js/0280-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1303 | 275 |
| `html/0290-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1578 | 17 |
| `html/0300-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1595 | 27 |
| `html/0310-seite-start.html` | seite START | 1622 | 47 |
| `html/0320-seite-patienten.html` | seite PATIENTEN | 1669 | 28 |
| `html/0330-seite-rechnungen.html` | seite RECHNUNGEN | 1697 | 30 |
| `html/0340-seite-leistungen.html` | seite LEISTUNGEN | 1727 | 33 |
| `html/0350-seite-dokumente.html` | seite DOKUMENTE | 1760 | 19 |
| `html/0360-seite-zahlungen.html` | seite ZAHLUNGEN | 1779 | 22 |
| `html/0370-seite-praxisdaten.html` | seite PRAXISDATEN | 1801 | 47 |
| `html/0380-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1848 | 15 |
| `html/0390-seite-webformulare.html` | seite WEBFORMULARE | 1863 | 18 |
| `html/0400-seite-sicherung.html` | seite SICHERUNG | 1881 | 14 |
| `html/0410-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1895 | 48 |
| `html/0420-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1943 | 9 |
| `html/0430-seite-todos.html` | seite TODOS | 1952 | 16 |
| `html/0440-seite-statistik.html` | seite STATISTIK | 1968 | 34 |
| `html/0450-seite-lager.html` | seite LAGER | 2002 | 20 |
| `html/0460-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2022 | 25 |
| `html/0470-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2047 | 43 |
| `html/0480-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2090 | 71 |
| `html/0490-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2161 | 10 |
| `html/0500-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2171 | 7 |
| `html/0510-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2178 | 17 |
| `html/0520-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2195 | 10 |
| `html/0530-fenster-rezept.html` | fenster REZEPT | 2205 | 23 |
| `html/0540-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2228 | 54 |
| `html/0550-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2282 | 27 |
| `html/0560-fenster-leistung.html` | fenster LEISTUNG | 2309 | 31 |
| `html/0570-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2340 | 20 |
| `html/0580-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2360 | 15 |
| `html/0590-fenster-ausgabe.html` | fenster AUSGABE | 2375 | 18 |
| `html/0600-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2393 | 37 |
| `html/0610-fenster-platzhalter.html` | fenster PLATZHALTER | 2430 | 15 |
| `html/0620-fenster-anrede.html` | fenster ANREDE | 2445 | 16 |
| `html/0630-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2461 | 14 |
| `html/0640-fenster-vorlage.html` | fenster VORLAGE | 2475 | 33 |
| `html/0650-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2508 | 9 |
| `html/0660-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2517 | 18 |
| `html/0670-fenster-zahlung.html` | fenster ZAHLUNG | 2535 | 15 |
| `html/0680-fenster-sicherung.html` | fenster SICHERUNG | 2550 | 15 |
| `html/0690-fenster-fortschritt.html` | fenster FORTSCHRITT | 2565 | 11 |
| `html/0700-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2576 | 10 |
| `html/0710-fenster-dokumentation.html` | fenster DOKUMENTATION | 2586 | 12 |
| `html/0720-fenster-todo.html` | fenster TODO | 2598 | 19 |
| `html/0730-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2617 | 14 |
| `html/0740-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2631 | 12 |
| `html/0750-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2643 | 12 |
| `html/0760-fenster-produkt.html` | fenster PRODUKT | 2655 | 48 |
| `html/0770-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2703 | 13 |
| `html/0780-fenster-wareneingang.html` | fenster WARENEINGANG | 2716 | 20 |
| `html/0790-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2736 | 16 |
| `html/0800-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2752 | 12 |
| `html/0810-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2764 | 9 |
| `html/0820-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2773 | 19 |
| `html/0830-fenster-e-mail.html` | fenster E-MAIL | 2792 | 14 |
| `html/0840-fenster-bild-gross.html` | fenster BILD GROSS | 2806 | 11 |
| `html/0850-fenster-zuordnen.html` | fenster ZUORDNEN | 2817 | 10 |
| `js/0860-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2827 | 206 |
| `js/0870-hinweise-an-patienten.js` | Hinweise an Patienten | 3033 | 347 |
| `js/0880-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3380 | 135 |
| `js/0890-kalender.js` | Kalender | 3515 | 279 |
| `js/0900-startseite.js` | Startseite | 3794 | 280 |
| `js/0910-patienten-termine-doku.js` | Patienten, Termine, Doku | 4074 | 84 |
| `js/0920-dateispeicher.js` | Dateispeicher  | 4158 | 60 |
| `js/0930-rechnungen.js` | Rechnungen | 4218 | 54 |
| `js/0940-leistungskategorien.js` | Leistungskategorien  | 4272 | 148 |
| `js/0950-goae.js` | GOÄ | 4420 | 801 |
| `js/0960-alle-tabellen.js` | Alle Tabellen | 5221 | 239 |
| `js/0970-pdf-erzeugung.js` | PDF-Erzeugung  | 5460 | 48 |
| `js/0980-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5508 | 280 |
| `js/0990-briefumschlag-c6.js` | Briefumschlag C6  | 5788 | 494 |
| `js/1000-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6282 | 494 |
| `js/1010-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6776 | 263 |
| `js/1020-statistik.js` | Statistik | 7039 | 74 |
| `js/1030-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7113 | 108 |
| `js/1040-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7221 | 281 |
| `js/1050-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7502 | 294 |
| `js/1060-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7796 | 136 |
| `js/1070-medien.js` | Medien | 7932 | 394 |
| `js/1080-webformulare.js` | Webformulare | 8326 | 278 |
| `js/1090-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8604 | 198 |
| `js/1100-produktlager.js` | Produktlager | 8802 | 549 |
| `js/1110-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9351 | 242 |
| `js/1120-sicherung.js` | Sicherung  | 9593 | 219 |
| `js/1130-sicherung-als-zip.js` | Sicherung als ZIP | 9812 | 318 |
| `js/1140-geraete-abgleich.js` | Geräte-Abgleich | 10130 | 69 |
| `js/1150-eingangskorb.js` | Eingangskorb | 10199 | 97 |
| `html/1160-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10296 | 1 |
| `js/1170-app-start.js` | app-start | 10297 | 0 |
| `html/1180-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10297 | 7 |
| `js/1190-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10304 | 12 |
| `html/1200-dokument-ende.html` | dokument-ende | 10316 | 2 |
