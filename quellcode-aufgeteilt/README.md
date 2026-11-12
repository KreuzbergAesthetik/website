# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `4e87d7ab2d13494e…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (17 Teile)
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
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 643 | 91 |
| `css/0100-patientenliste.css` | Patientenliste | 734 | 90 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 824 | 36 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 860 | 33 |
| `css/0130-handy-quer.css` | Handy quer | 893 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 926 | 41 |
| `css/0150-querformat-und-desktop.css` | Querformat und Desktop | 967 | 14 |
| `css/0160-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 981 | 48 |
| `css/0170-reihenfolge.css` | Reihenfolge | 1029 | 29 |
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1058 | 49 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1107 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1128 | 33 |
| `css/0210-hochkant.css` | Hochkant | 1161 | 29 |
| `html/0220-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1190 | 5 |
| `js/0230-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1195 | 0 |
| `html/0240-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1195 | 13 |
| `js/0250-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1208 | 275 |
| `html/0260-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1483 | 36 |
| `html/0270-seite-start.html` | seite START | 1519 | 47 |
| `html/0280-seite-patienten.html` | seite PATIENTEN | 1566 | 30 |
| `html/0290-seite-rechnungen.html` | seite RECHNUNGEN | 1596 | 30 |
| `html/0300-seite-leistungen.html` | seite LEISTUNGEN | 1626 | 33 |
| `html/0310-seite-dokumente.html` | seite DOKUMENTE | 1659 | 19 |
| `html/0320-seite-zahlungen.html` | seite ZAHLUNGEN | 1678 | 22 |
| `html/0330-seite-praxisdaten.html` | seite PRAXISDATEN | 1700 | 47 |
| `html/0340-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1747 | 15 |
| `html/0350-seite-webformulare.html` | seite WEBFORMULARE | 1762 | 18 |
| `html/0360-seite-sicherung.html` | seite SICHERUNG | 1780 | 14 |
| `html/0370-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1794 | 48 |
| `html/0380-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1842 | 9 |
| `html/0390-seite-todos.html` | seite TODOS | 1851 | 16 |
| `html/0400-seite-statistik.html` | seite STATISTIK | 1867 | 34 |
| `html/0410-seite-lager.html` | seite LAGER | 1901 | 20 |
| `html/0420-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1921 | 25 |
| `html/0430-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1946 | 43 |
| `html/0440-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1989 | 71 |
| `html/0450-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2060 | 10 |
| `html/0460-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2070 | 7 |
| `html/0470-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2077 | 17 |
| `html/0480-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2094 | 10 |
| `html/0490-fenster-rezept.html` | fenster REZEPT | 2104 | 23 |
| `html/0500-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2127 | 54 |
| `html/0510-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2181 | 27 |
| `html/0520-fenster-leistung.html` | fenster LEISTUNG | 2208 | 31 |
| `html/0530-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2239 | 20 |
| `html/0540-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2259 | 15 |
| `html/0550-fenster-ausgabe.html` | fenster AUSGABE | 2274 | 18 |
| `html/0560-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2292 | 37 |
| `html/0570-fenster-platzhalter.html` | fenster PLATZHALTER | 2329 | 15 |
| `html/0580-fenster-anrede.html` | fenster ANREDE | 2344 | 16 |
| `html/0590-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2360 | 14 |
| `html/0600-fenster-vorlage.html` | fenster VORLAGE | 2374 | 33 |
| `html/0610-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2407 | 9 |
| `html/0620-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2416 | 18 |
| `html/0630-fenster-zahlung.html` | fenster ZAHLUNG | 2434 | 15 |
| `html/0640-fenster-sicherung.html` | fenster SICHERUNG | 2449 | 15 |
| `html/0650-fenster-fortschritt.html` | fenster FORTSCHRITT | 2464 | 11 |
| `html/0660-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2475 | 10 |
| `html/0670-fenster-dokumentation.html` | fenster DOKUMENTATION | 2485 | 12 |
| `html/0680-fenster-todo.html` | fenster TODO | 2497 | 19 |
| `html/0690-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2516 | 14 |
| `html/0700-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2530 | 12 |
| `html/0710-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2542 | 12 |
| `html/0720-fenster-produkt.html` | fenster PRODUKT | 2554 | 48 |
| `html/0730-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2602 | 13 |
| `html/0740-fenster-wareneingang.html` | fenster WARENEINGANG | 2615 | 20 |
| `html/0750-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2635 | 16 |
| `html/0760-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2651 | 12 |
| `html/0770-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2663 | 9 |
| `html/0780-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2672 | 19 |
| `html/0790-fenster-e-mail.html` | fenster E-MAIL | 2691 | 14 |
| `html/0800-fenster-bild-gross.html` | fenster BILD GROSS | 2705 | 11 |
| `html/0810-fenster-zuordnen.html` | fenster ZUORDNEN | 2716 | 10 |
| `js/0820-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2726 | 195 |
| `js/0830-hinweise-an-patienten.js` | Hinweise an Patienten | 2921 | 338 |
| `js/0840-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3259 | 134 |
| `js/0850-kalender.js` | Kalender | 3393 | 279 |
| `js/0860-startseite.js` | Startseite | 3672 | 270 |
| `js/0870-patienten-termine-doku.js` | Patienten, Termine, Doku | 3942 | 84 |
| `js/0880-dateispeicher.js` | Dateispeicher  | 4026 | 60 |
| `js/0890-rechnungen.js` | Rechnungen | 4086 | 54 |
| `js/0900-leistungskategorien.js` | Leistungskategorien  | 4140 | 148 |
| `js/0910-goae.js` | GOÄ | 4288 | 801 |
| `js/0920-alle-tabellen.js` | Alle Tabellen | 5089 | 239 |
| `js/0930-pdf-erzeugung.js` | PDF-Erzeugung  | 5328 | 48 |
| `js/0940-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5376 | 280 |
| `js/0950-briefumschlag-c6.js` | Briefumschlag C6  | 5656 | 478 |
| `js/0960-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6134 | 494 |
| `js/0970-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6628 | 262 |
| `js/0980-statistik.js` | Statistik | 6890 | 74 |
| `js/0990-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6964 | 108 |
| `js/1000-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7072 | 280 |
| `js/1010-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7352 | 294 |
| `js/1020-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7646 | 136 |
| `js/1030-medien.js` | Medien | 7782 | 381 |
| `js/1040-webformulare.js` | Webformulare | 8163 | 278 |
| `js/1050-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8441 | 198 |
| `js/1060-produktlager.js` | Produktlager | 8639 | 549 |
| `js/1070-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9188 | 242 |
| `js/1080-sicherung.js` | Sicherung  | 9430 | 219 |
| `js/1090-sicherung-als-zip.js` | Sicherung als ZIP | 9649 | 318 |
| `js/1100-geraete-abgleich.js` | Geräte-Abgleich | 9967 | 69 |
| `js/1110-eingangskorb.js` | Eingangskorb | 10036 | 97 |
| `html/1120-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10133 | 1 |
| `js/1130-app-start.js` | app-start | 10134 | 0 |
| `html/1140-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10134 | 7 |
| `js/1150-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10141 | 12 |
| `html/1160-dokument-ende.html` | dokument-ende | 10153 | 2 |
