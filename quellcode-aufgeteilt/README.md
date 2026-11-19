# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `573eae3393b7ea3b…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

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
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1213 | 52 |
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1265 | 98 |
| `html/0250-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1363 | 5 |
| `js/0260-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1368 | 0 |
| `html/0270-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1368 | 13 |
| `js/0280-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1381 | 275 |
| `html/0290-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1656 | 17 |
| `html/0300-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1673 | 28 |
| `html/0310-seite-start.html` | seite START | 1701 | 47 |
| `html/0320-seite-patienten.html` | seite PATIENTEN | 1748 | 28 |
| `html/0330-seite-rechnungen.html` | seite RECHNUNGEN | 1776 | 30 |
| `html/0340-seite-leistungen.html` | seite LEISTUNGEN | 1806 | 33 |
| `html/0350-seite-dokumente.html` | seite DOKUMENTE | 1839 | 19 |
| `html/0360-seite-zahlungen.html` | seite ZAHLUNGEN | 1858 | 22 |
| `html/0370-seite-praxisdaten.html` | seite PRAXISDATEN | 1880 | 47 |
| `html/0380-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1927 | 15 |
| `html/0390-seite-webformulare.html` | seite WEBFORMULARE | 1942 | 18 |
| `html/0400-seite-sicherung.html` | seite SICHERUNG | 1960 | 14 |
| `html/0410-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1974 | 48 |
| `html/0420-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2022 | 9 |
| `html/0430-seite-todos.html` | seite TODOS | 2031 | 16 |
| `html/0440-seite-statistik.html` | seite STATISTIK | 2047 | 34 |
| `html/0450-seite-lager.html` | seite LAGER | 2081 | 20 |
| `html/0460-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2101 | 25 |
| `html/0470-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2126 | 43 |
| `html/0480-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2169 | 71 |
| `html/0490-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2240 | 10 |
| `html/0500-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2250 | 7 |
| `html/0510-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2257 | 17 |
| `html/0520-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2274 | 10 |
| `html/0530-fenster-rezept.html` | fenster REZEPT | 2284 | 23 |
| `html/0540-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2307 | 54 |
| `html/0550-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2361 | 27 |
| `html/0560-fenster-leistung.html` | fenster LEISTUNG | 2388 | 31 |
| `html/0570-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2419 | 20 |
| `html/0580-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2439 | 15 |
| `html/0590-fenster-ausgabe.html` | fenster AUSGABE | 2454 | 18 |
| `html/0600-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2472 | 37 |
| `html/0610-fenster-platzhalter.html` | fenster PLATZHALTER | 2509 | 15 |
| `html/0620-fenster-anrede.html` | fenster ANREDE | 2524 | 16 |
| `html/0630-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2540 | 14 |
| `html/0640-fenster-vorlage.html` | fenster VORLAGE | 2554 | 33 |
| `html/0650-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2587 | 9 |
| `html/0660-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2596 | 18 |
| `html/0670-fenster-zahlung.html` | fenster ZAHLUNG | 2614 | 15 |
| `html/0680-fenster-sicherung.html` | fenster SICHERUNG | 2629 | 15 |
| `html/0690-fenster-fortschritt.html` | fenster FORTSCHRITT | 2644 | 11 |
| `html/0700-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2655 | 10 |
| `html/0710-fenster-dokumentation.html` | fenster DOKUMENTATION | 2665 | 12 |
| `html/0720-fenster-todo.html` | fenster TODO | 2677 | 19 |
| `html/0730-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2696 | 14 |
| `html/0740-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2710 | 12 |
| `html/0750-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2722 | 12 |
| `html/0760-fenster-produkt.html` | fenster PRODUKT | 2734 | 48 |
| `html/0770-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2782 | 13 |
| `html/0780-fenster-wareneingang.html` | fenster WARENEINGANG | 2795 | 20 |
| `html/0790-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2815 | 16 |
| `html/0800-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2831 | 12 |
| `html/0810-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2843 | 9 |
| `html/0820-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2852 | 19 |
| `html/0830-fenster-e-mail.html` | fenster E-MAIL | 2871 | 14 |
| `html/0840-fenster-bild-gross.html` | fenster BILD GROSS | 2885 | 11 |
| `html/0850-fenster-zuordnen.html` | fenster ZUORDNEN | 2896 | 10 |
| `js/0860-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2906 | 224 |
| `js/0870-hinweise-an-patienten.js` | Hinweise an Patienten | 3130 | 358 |
| `js/0880-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3488 | 152 |
| `js/0890-kalender.js` | Kalender | 3640 | 301 |
| `js/0900-startseite.js` | Startseite | 3941 | 280 |
| `js/0910-patienten-termine-doku.js` | Patienten, Termine, Doku | 4221 | 84 |
| `js/0920-dateispeicher.js` | Dateispeicher  | 4305 | 60 |
| `js/0930-rechnungen.js` | Rechnungen | 4365 | 54 |
| `js/0940-leistungskategorien.js` | Leistungskategorien  | 4419 | 148 |
| `js/0950-goae.js` | GOÄ | 4567 | 801 |
| `js/0960-alle-tabellen.js` | Alle Tabellen | 5368 | 239 |
| `js/0970-pdf-erzeugung.js` | PDF-Erzeugung  | 5607 | 48 |
| `js/0980-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5655 | 280 |
| `js/0990-briefumschlag-c6.js` | Briefumschlag C6  | 5935 | 494 |
| `js/1000-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6429 | 498 |
| `js/1010-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6927 | 263 |
| `js/1020-statistik.js` | Statistik | 7190 | 74 |
| `js/1030-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7264 | 108 |
| `js/1040-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7372 | 281 |
| `js/1050-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7653 | 294 |
| `js/1060-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7947 | 136 |
| `js/1070-medien.js` | Medien | 8083 | 394 |
| `js/1080-webformulare.js` | Webformulare | 8477 | 278 |
| `js/1090-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8755 | 198 |
| `js/1100-produktlager.js` | Produktlager | 8953 | 549 |
| `js/1110-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9502 | 242 |
| `js/1120-sicherung.js` | Sicherung  | 9744 | 219 |
| `js/1130-sicherung-als-zip.js` | Sicherung als ZIP | 9963 | 318 |
| `js/1140-geraete-abgleich.js` | Geräte-Abgleich | 10281 | 69 |
| `js/1150-eingangskorb.js` | Eingangskorb | 10350 | 97 |
| `html/1160-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10447 | 1 |
| `js/1170-app-start.js` | app-start | 10448 | 0 |
| `html/1180-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10448 | 7 |
| `js/1190-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10455 | 12 |
| `html/1200-dokument-ende.html` | dokument-ende | 10467 | 2 |
