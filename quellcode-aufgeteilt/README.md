# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `6b80aac82109e93d…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

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
| `css/0150-reihenfolge.css` | Reihenfolge | 955 | 39 |
| `css/0160-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 994 | 16 |
| `html/0170-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1010 | 5 |
| `js/0180-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1015 | 0 |
| `html/0190-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1015 | 12 |
| `js/0200-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1027 | 252 |
| `html/0210-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1279 | 36 |
| `html/0220-seite-start.html` | seite START | 1315 | 47 |
| `html/0230-seite-patienten.html` | seite PATIENTEN | 1362 | 30 |
| `html/0240-seite-rechnungen.html` | seite RECHNUNGEN | 1392 | 29 |
| `html/0250-seite-leistungen.html` | seite LEISTUNGEN | 1421 | 33 |
| `html/0260-seite-dokumente.html` | seite DOKUMENTE | 1454 | 19 |
| `html/0270-seite-zahlungen.html` | seite ZAHLUNGEN | 1473 | 22 |
| `html/0280-seite-praxisdaten.html` | seite PRAXISDATEN | 1495 | 47 |
| `html/0290-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1542 | 15 |
| `html/0300-seite-webformulare.html` | seite WEBFORMULARE | 1557 | 18 |
| `html/0310-seite-sicherung.html` | seite SICHERUNG | 1575 | 14 |
| `html/0320-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1589 | 48 |
| `html/0330-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1637 | 9 |
| `html/0340-seite-todos.html` | seite TODOS | 1646 | 16 |
| `html/0350-seite-statistik.html` | seite STATISTIK | 1662 | 34 |
| `html/0360-seite-lager.html` | seite LAGER | 1696 | 20 |
| `html/0370-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1716 | 25 |
| `html/0380-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1741 | 43 |
| `html/0390-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1784 | 71 |
| `html/0400-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1855 | 9 |
| `html/0410-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1864 | 7 |
| `html/0420-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1871 | 17 |
| `html/0430-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1888 | 10 |
| `html/0440-fenster-rezept.html` | fenster REZEPT | 1898 | 23 |
| `html/0450-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1921 | 54 |
| `html/0460-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 1975 | 27 |
| `html/0470-fenster-leistung.html` | fenster LEISTUNG | 2002 | 31 |
| `html/0480-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2033 | 20 |
| `html/0490-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2053 | 15 |
| `html/0500-fenster-ausgabe.html` | fenster AUSGABE | 2068 | 18 |
| `html/0510-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2086 | 37 |
| `html/0520-fenster-platzhalter.html` | fenster PLATZHALTER | 2123 | 15 |
| `html/0530-fenster-anrede.html` | fenster ANREDE | 2138 | 16 |
| `html/0540-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2154 | 14 |
| `html/0550-fenster-vorlage.html` | fenster VORLAGE | 2168 | 33 |
| `html/0560-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2201 | 9 |
| `html/0570-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2210 | 18 |
| `html/0580-fenster-zahlung.html` | fenster ZAHLUNG | 2228 | 15 |
| `html/0590-fenster-sicherung.html` | fenster SICHERUNG | 2243 | 15 |
| `html/0600-fenster-fortschritt.html` | fenster FORTSCHRITT | 2258 | 11 |
| `html/0610-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2269 | 10 |
| `html/0620-fenster-dokumentation.html` | fenster DOKUMENTATION | 2279 | 12 |
| `html/0630-fenster-todo.html` | fenster TODO | 2291 | 19 |
| `html/0640-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2310 | 14 |
| `html/0650-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2324 | 12 |
| `html/0660-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2336 | 12 |
| `html/0670-fenster-produkt.html` | fenster PRODUKT | 2348 | 48 |
| `html/0680-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2396 | 13 |
| `html/0690-fenster-wareneingang.html` | fenster WARENEINGANG | 2409 | 20 |
| `html/0700-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2429 | 16 |
| `html/0710-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2445 | 12 |
| `html/0720-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2457 | 9 |
| `html/0730-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2466 | 19 |
| `html/0740-fenster-e-mail.html` | fenster E-MAIL | 2485 | 14 |
| `html/0750-fenster-bild-gross.html` | fenster BILD GROSS | 2499 | 11 |
| `html/0760-fenster-zuordnen.html` | fenster ZUORDNEN | 2510 | 10 |
| `js/0770-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2520 | 195 |
| `js/0780-hinweise-an-patienten.js` | Hinweise an Patienten | 2715 | 314 |
| `js/0790-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3029 | 108 |
| `js/0800-kalender.js` | Kalender | 3137 | 279 |
| `js/0810-startseite.js` | Startseite | 3416 | 270 |
| `js/0820-patienten-termine-doku.js` | Patienten, Termine, Doku | 3686 | 84 |
| `js/0830-dateispeicher.js` | Dateispeicher  | 3770 | 60 |
| `js/0840-rechnungen.js` | Rechnungen | 3830 | 54 |
| `js/0850-leistungskategorien.js` | Leistungskategorien  | 3884 | 148 |
| `js/0860-goae.js` | GOÄ | 4032 | 793 |
| `js/0870-alle-tabellen.js` | Alle Tabellen | 4825 | 239 |
| `js/0880-pdf-erzeugung.js` | PDF-Erzeugung  | 5064 | 48 |
| `js/0890-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5112 | 280 |
| `js/0900-briefumschlag-c6.js` | Briefumschlag C6  | 5392 | 464 |
| `js/0910-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5856 | 497 |
| `js/0920-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6353 | 262 |
| `js/0930-statistik.js` | Statistik | 6615 | 74 |
| `js/0940-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6689 | 113 |
| `js/0950-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6802 | 280 |
| `js/0960-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7082 | 294 |
| `js/0970-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7376 | 136 |
| `js/0980-medien.js` | Medien | 7512 | 362 |
| `js/0990-webformulare.js` | Webformulare | 7874 | 278 |
| `js/1000-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8152 | 198 |
| `js/1010-produktlager.js` | Produktlager | 8350 | 549 |
| `js/1020-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8899 | 242 |
| `js/1030-sicherung.js` | Sicherung  | 9141 | 219 |
| `js/1040-sicherung-als-zip.js` | Sicherung als ZIP | 9360 | 318 |
| `js/1050-geraete-abgleich.js` | Geräte-Abgleich | 9678 | 69 |
| `js/1060-eingangskorb.js` | Eingangskorb | 9747 | 97 |
| `html/1070-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9844 | 1 |
| `js/1080-app-start.js` | app-start | 9845 | 0 |
| `html/1090-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9845 | 7 |
| `js/1100-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9852 | 12 |
| `html/1110-dokument-ende.html` | dokument-ende | 9864 | 2 |
