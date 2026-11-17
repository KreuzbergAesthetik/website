# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `5f0bb1e107a2f284…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (19 Teile)
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
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1058 | 47 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1105 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1126 | 33 |
| `css/0210-namensleiste.css` | Namensleiste | 1159 | 13 |
| `css/0220-hochkant.css` | Hochkant | 1172 | 39 |
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1211 | 46 |
| `html/0240-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1257 | 5 |
| `js/0250-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1262 | 0 |
| `html/0260-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1262 | 13 |
| `js/0270-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1275 | 275 |
| `html/0280-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1550 | 36 |
| `html/0290-seite-start.html` | seite START | 1586 | 47 |
| `html/0300-seite-patienten.html` | seite PATIENTEN | 1633 | 28 |
| `html/0310-seite-rechnungen.html` | seite RECHNUNGEN | 1661 | 30 |
| `html/0320-seite-leistungen.html` | seite LEISTUNGEN | 1691 | 33 |
| `html/0330-seite-dokumente.html` | seite DOKUMENTE | 1724 | 19 |
| `html/0340-seite-zahlungen.html` | seite ZAHLUNGEN | 1743 | 22 |
| `html/0350-seite-praxisdaten.html` | seite PRAXISDATEN | 1765 | 47 |
| `html/0360-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1812 | 15 |
| `html/0370-seite-webformulare.html` | seite WEBFORMULARE | 1827 | 18 |
| `html/0380-seite-sicherung.html` | seite SICHERUNG | 1845 | 14 |
| `html/0390-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1859 | 48 |
| `html/0400-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1907 | 9 |
| `html/0410-seite-todos.html` | seite TODOS | 1916 | 16 |
| `html/0420-seite-statistik.html` | seite STATISTIK | 1932 | 34 |
| `html/0430-seite-lager.html` | seite LAGER | 1966 | 20 |
| `html/0440-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1986 | 25 |
| `html/0450-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2011 | 43 |
| `html/0460-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2054 | 71 |
| `html/0470-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2125 | 10 |
| `html/0480-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2135 | 7 |
| `html/0490-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2142 | 17 |
| `html/0500-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2159 | 10 |
| `html/0510-fenster-rezept.html` | fenster REZEPT | 2169 | 23 |
| `html/0520-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2192 | 54 |
| `html/0530-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2246 | 27 |
| `html/0540-fenster-leistung.html` | fenster LEISTUNG | 2273 | 31 |
| `html/0550-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2304 | 20 |
| `html/0560-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2324 | 15 |
| `html/0570-fenster-ausgabe.html` | fenster AUSGABE | 2339 | 18 |
| `html/0580-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2357 | 37 |
| `html/0590-fenster-platzhalter.html` | fenster PLATZHALTER | 2394 | 15 |
| `html/0600-fenster-anrede.html` | fenster ANREDE | 2409 | 16 |
| `html/0610-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2425 | 14 |
| `html/0620-fenster-vorlage.html` | fenster VORLAGE | 2439 | 33 |
| `html/0630-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2472 | 9 |
| `html/0640-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2481 | 18 |
| `html/0650-fenster-zahlung.html` | fenster ZAHLUNG | 2499 | 15 |
| `html/0660-fenster-sicherung.html` | fenster SICHERUNG | 2514 | 15 |
| `html/0670-fenster-fortschritt.html` | fenster FORTSCHRITT | 2529 | 11 |
| `html/0680-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2540 | 10 |
| `html/0690-fenster-dokumentation.html` | fenster DOKUMENTATION | 2550 | 12 |
| `html/0700-fenster-todo.html` | fenster TODO | 2562 | 19 |
| `html/0710-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2581 | 14 |
| `html/0720-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2595 | 12 |
| `html/0730-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2607 | 12 |
| `html/0740-fenster-produkt.html` | fenster PRODUKT | 2619 | 48 |
| `html/0750-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2667 | 13 |
| `html/0760-fenster-wareneingang.html` | fenster WARENEINGANG | 2680 | 20 |
| `html/0770-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2700 | 16 |
| `html/0780-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2716 | 12 |
| `html/0790-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2728 | 9 |
| `html/0800-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2737 | 19 |
| `html/0810-fenster-e-mail.html` | fenster E-MAIL | 2756 | 14 |
| `html/0820-fenster-bild-gross.html` | fenster BILD GROSS | 2770 | 11 |
| `html/0830-fenster-zuordnen.html` | fenster ZUORDNEN | 2781 | 10 |
| `js/0840-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2791 | 195 |
| `js/0850-hinweise-an-patienten.js` | Hinweise an Patienten | 2986 | 347 |
| `js/0860-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3333 | 134 |
| `js/0870-kalender.js` | Kalender | 3467 | 279 |
| `js/0880-startseite.js` | Startseite | 3746 | 280 |
| `js/0890-patienten-termine-doku.js` | Patienten, Termine, Doku | 4026 | 84 |
| `js/0900-dateispeicher.js` | Dateispeicher  | 4110 | 60 |
| `js/0910-rechnungen.js` | Rechnungen | 4170 | 54 |
| `js/0920-leistungskategorien.js` | Leistungskategorien  | 4224 | 148 |
| `js/0930-goae.js` | GOÄ | 4372 | 801 |
| `js/0940-alle-tabellen.js` | Alle Tabellen | 5173 | 239 |
| `js/0950-pdf-erzeugung.js` | PDF-Erzeugung  | 5412 | 48 |
| `js/0960-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5460 | 280 |
| `js/0970-briefumschlag-c6.js` | Briefumschlag C6  | 5740 | 494 |
| `js/0980-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6234 | 494 |
| `js/0990-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6728 | 262 |
| `js/1000-statistik.js` | Statistik | 6990 | 74 |
| `js/1010-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7064 | 108 |
| `js/1020-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7172 | 281 |
| `js/1030-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7453 | 294 |
| `js/1040-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7747 | 136 |
| `js/1050-medien.js` | Medien | 7883 | 381 |
| `js/1060-webformulare.js` | Webformulare | 8264 | 278 |
| `js/1070-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8542 | 198 |
| `js/1080-produktlager.js` | Produktlager | 8740 | 549 |
| `js/1090-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9289 | 242 |
| `js/1100-sicherung.js` | Sicherung  | 9531 | 219 |
| `js/1110-sicherung-als-zip.js` | Sicherung als ZIP | 9750 | 318 |
| `js/1120-geraete-abgleich.js` | Geräte-Abgleich | 10068 | 69 |
| `js/1130-eingangskorb.js` | Eingangskorb | 10137 | 97 |
| `html/1140-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10234 | 1 |
| `js/1150-app-start.js` | app-start | 10235 | 0 |
| `html/1160-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10235 | 7 |
| `js/1170-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10242 | 12 |
| `html/1180-dokument-ende.html` | dokument-ende | 10254 | 2 |
