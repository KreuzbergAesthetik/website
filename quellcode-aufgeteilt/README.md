# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `698fa341e3690b13…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (12 Teile)
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
| `css/0070-terminansicht.css` | Terminansicht | 527 | 52 |
| `css/0080-masken.css` | Masken | 579 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 640 | 89 |
| `css/0100-patientenliste.css` | Patientenliste | 729 | 90 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 819 | 35 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 854 | 32 |
| `css/0130-handy-quer.css` | Handy quer | 886 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 919 | 36 |
| `css/0150-reihenfolge.css` | Reihenfolge | 955 | 29 |
| `css/0160-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 984 | 16 |
| `html/0170-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1000 | 5 |
| `js/0180-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1005 | 0 |
| `html/0190-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1005 | 12 |
| `js/0200-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1017 | 252 |
| `html/0210-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1269 | 36 |
| `html/0220-seite-start.html` | seite START | 1305 | 47 |
| `html/0230-seite-patienten.html` | seite PATIENTEN | 1352 | 30 |
| `html/0240-seite-rechnungen.html` | seite RECHNUNGEN | 1382 | 29 |
| `html/0250-seite-leistungen.html` | seite LEISTUNGEN | 1411 | 33 |
| `html/0260-seite-dokumente.html` | seite DOKUMENTE | 1444 | 19 |
| `html/0270-seite-zahlungen.html` | seite ZAHLUNGEN | 1463 | 22 |
| `html/0280-seite-praxisdaten.html` | seite PRAXISDATEN | 1485 | 47 |
| `html/0290-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1532 | 15 |
| `html/0300-seite-webformulare.html` | seite WEBFORMULARE | 1547 | 18 |
| `html/0310-seite-sicherung.html` | seite SICHERUNG | 1565 | 14 |
| `html/0320-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1579 | 48 |
| `html/0330-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1627 | 9 |
| `html/0340-seite-todos.html` | seite TODOS | 1636 | 16 |
| `html/0350-seite-statistik.html` | seite STATISTIK | 1652 | 34 |
| `html/0360-seite-lager.html` | seite LAGER | 1686 | 20 |
| `html/0370-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1706 | 25 |
| `html/0380-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1731 | 43 |
| `html/0390-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1774 | 71 |
| `html/0400-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1845 | 9 |
| `html/0410-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1854 | 7 |
| `html/0420-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1861 | 17 |
| `html/0430-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1878 | 10 |
| `html/0440-fenster-rezept.html` | fenster REZEPT | 1888 | 23 |
| `html/0450-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1911 | 54 |
| `html/0460-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1965 | 27 |
| `html/0470-fenster-leistung.html` | fenster LEISTUNG | 1992 | 31 |
| `html/0480-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2023 | 20 |
| `html/0490-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2043 | 15 |
| `html/0500-fenster-ausgabe.html` | fenster AUSGABE | 2058 | 18 |
| `html/0510-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2076 | 37 |
| `html/0520-fenster-platzhalter.html` | fenster PLATZHALTER | 2113 | 15 |
| `html/0530-fenster-anrede.html` | fenster ANREDE | 2128 | 16 |
| `html/0540-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2144 | 14 |
| `html/0550-fenster-vorlage.html` | fenster VORLAGE | 2158 | 33 |
| `html/0560-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2191 | 9 |
| `html/0570-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2200 | 18 |
| `html/0580-fenster-zahlung.html` | fenster ZAHLUNG | 2218 | 15 |
| `html/0590-fenster-sicherung.html` | fenster SICHERUNG | 2233 | 15 |
| `html/0600-fenster-fortschritt.html` | fenster FORTSCHRITT | 2248 | 11 |
| `html/0610-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2259 | 10 |
| `html/0620-fenster-dokumentation.html` | fenster DOKUMENTATION | 2269 | 12 |
| `html/0630-fenster-todo.html` | fenster TODO | 2281 | 19 |
| `html/0640-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2300 | 14 |
| `html/0650-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2314 | 12 |
| `html/0660-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2326 | 12 |
| `html/0670-fenster-produkt.html` | fenster PRODUKT | 2338 | 48 |
| `html/0680-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2386 | 13 |
| `html/0690-fenster-wareneingang.html` | fenster WARENEINGANG | 2399 | 20 |
| `html/0700-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2419 | 16 |
| `html/0710-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2435 | 12 |
| `html/0720-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2447 | 9 |
| `html/0730-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2456 | 19 |
| `html/0740-fenster-e-mail.html` | fenster E-MAIL | 2475 | 14 |
| `html/0750-fenster-bild-gross.html` | fenster BILD GROSS | 2489 | 11 |
| `html/0760-fenster-zuordnen.html` | fenster ZUORDNEN | 2500 | 10 |
| `js/0770-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2510 | 195 |
| `js/0780-hinweise-an-patienten.js` | Hinweise an Patienten | 2705 | 314 |
| `js/0790-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3019 | 108 |
| `js/0800-kalender.js` | Kalender | 3127 | 279 |
| `js/0810-startseite.js` | Startseite | 3406 | 270 |
| `js/0820-patienten-termine-doku.js` | Patienten, Termine, Doku | 3676 | 84 |
| `js/0830-dateispeicher.js` | Dateispeicher  | 3760 | 60 |
| `js/0840-rechnungen.js` | Rechnungen | 3820 | 54 |
| `js/0850-leistungskategorien.js` | Leistungskategorien  | 3874 | 148 |
| `js/0860-goae.js` | GOÄ | 4022 | 793 |
| `js/0870-alle-tabellen.js` | Alle Tabellen | 4815 | 239 |
| `js/0880-pdf-erzeugung.js` | PDF-Erzeugung  | 5054 | 48 |
| `js/0890-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5102 | 280 |
| `js/0900-briefumschlag-c6.js` | Briefumschlag C6  | 5382 | 464 |
| `js/0910-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5846 | 497 |
| `js/0920-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6343 | 262 |
| `js/0930-statistik.js` | Statistik | 6605 | 74 |
| `js/0940-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6679 | 113 |
| `js/0950-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6792 | 280 |
| `js/0960-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7072 | 294 |
| `js/0970-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7366 | 136 |
| `js/0980-medien.js` | Medien | 7502 | 362 |
| `js/0990-webformulare.js` | Webformulare | 7864 | 278 |
| `js/1000-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8142 | 198 |
| `js/1010-produktlager.js` | Produktlager | 8340 | 549 |
| `js/1020-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8889 | 242 |
| `js/1030-sicherung.js` | Sicherung  | 9131 | 219 |
| `js/1040-sicherung-als-zip.js` | Sicherung als ZIP | 9350 | 318 |
| `js/1050-geraete-abgleich.js` | Geräte-Abgleich | 9668 | 69 |
| `js/1060-eingangskorb.js` | Eingangskorb | 9737 | 97 |
| `html/1070-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9834 | 1 |
| `js/1080-app-start.js` | app-start | 9835 | 0 |
| `html/1090-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9835 | 7 |
| `js/1100-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9842 | 12 |
| `html/1110-dokument-ende.html` | dokument-ende | 9854 | 2 |
