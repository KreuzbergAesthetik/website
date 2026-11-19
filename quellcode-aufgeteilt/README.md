# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `6afc93462f80324c…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

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
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1265 | 81 |
| `html/0250-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1346 | 5 |
| `js/0260-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1351 | 0 |
| `html/0270-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1351 | 13 |
| `js/0280-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1364 | 275 |
| `html/0290-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1639 | 17 |
| `html/0300-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1656 | 28 |
| `html/0310-seite-start.html` | seite START | 1684 | 47 |
| `html/0320-seite-patienten.html` | seite PATIENTEN | 1731 | 28 |
| `html/0330-seite-rechnungen.html` | seite RECHNUNGEN | 1759 | 30 |
| `html/0340-seite-leistungen.html` | seite LEISTUNGEN | 1789 | 33 |
| `html/0350-seite-dokumente.html` | seite DOKUMENTE | 1822 | 19 |
| `html/0360-seite-zahlungen.html` | seite ZAHLUNGEN | 1841 | 22 |
| `html/0370-seite-praxisdaten.html` | seite PRAXISDATEN | 1863 | 47 |
| `html/0380-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1910 | 15 |
| `html/0390-seite-webformulare.html` | seite WEBFORMULARE | 1925 | 18 |
| `html/0400-seite-sicherung.html` | seite SICHERUNG | 1943 | 14 |
| `html/0410-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1957 | 48 |
| `html/0420-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2005 | 9 |
| `html/0430-seite-todos.html` | seite TODOS | 2014 | 16 |
| `html/0440-seite-statistik.html` | seite STATISTIK | 2030 | 34 |
| `html/0450-seite-lager.html` | seite LAGER | 2064 | 20 |
| `html/0460-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2084 | 25 |
| `html/0470-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2109 | 43 |
| `html/0480-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2152 | 71 |
| `html/0490-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2223 | 10 |
| `html/0500-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2233 | 7 |
| `html/0510-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2240 | 17 |
| `html/0520-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2257 | 10 |
| `html/0530-fenster-rezept.html` | fenster REZEPT | 2267 | 23 |
| `html/0540-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2290 | 54 |
| `html/0550-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2344 | 27 |
| `html/0560-fenster-leistung.html` | fenster LEISTUNG | 2371 | 31 |
| `html/0570-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2402 | 20 |
| `html/0580-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2422 | 15 |
| `html/0590-fenster-ausgabe.html` | fenster AUSGABE | 2437 | 18 |
| `html/0600-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2455 | 37 |
| `html/0610-fenster-platzhalter.html` | fenster PLATZHALTER | 2492 | 15 |
| `html/0620-fenster-anrede.html` | fenster ANREDE | 2507 | 16 |
| `html/0630-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2523 | 14 |
| `html/0640-fenster-vorlage.html` | fenster VORLAGE | 2537 | 33 |
| `html/0650-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2570 | 9 |
| `html/0660-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2579 | 18 |
| `html/0670-fenster-zahlung.html` | fenster ZAHLUNG | 2597 | 15 |
| `html/0680-fenster-sicherung.html` | fenster SICHERUNG | 2612 | 15 |
| `html/0690-fenster-fortschritt.html` | fenster FORTSCHRITT | 2627 | 11 |
| `html/0700-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2638 | 10 |
| `html/0710-fenster-dokumentation.html` | fenster DOKUMENTATION | 2648 | 12 |
| `html/0720-fenster-todo.html` | fenster TODO | 2660 | 19 |
| `html/0730-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2679 | 14 |
| `html/0740-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2693 | 12 |
| `html/0750-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2705 | 12 |
| `html/0760-fenster-produkt.html` | fenster PRODUKT | 2717 | 48 |
| `html/0770-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2765 | 13 |
| `html/0780-fenster-wareneingang.html` | fenster WARENEINGANG | 2778 | 20 |
| `html/0790-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2798 | 16 |
| `html/0800-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2814 | 12 |
| `html/0810-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2826 | 9 |
| `html/0820-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2835 | 19 |
| `html/0830-fenster-e-mail.html` | fenster E-MAIL | 2854 | 14 |
| `html/0840-fenster-bild-gross.html` | fenster BILD GROSS | 2868 | 11 |
| `html/0850-fenster-zuordnen.html` | fenster ZUORDNEN | 2879 | 10 |
| `js/0860-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2889 | 224 |
| `js/0870-hinweise-an-patienten.js` | Hinweise an Patienten | 3113 | 358 |
| `js/0880-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3471 | 152 |
| `js/0890-kalender.js` | Kalender | 3623 | 289 |
| `js/0900-startseite.js` | Startseite | 3912 | 280 |
| `js/0910-patienten-termine-doku.js` | Patienten, Termine, Doku | 4192 | 84 |
| `js/0920-dateispeicher.js` | Dateispeicher  | 4276 | 60 |
| `js/0930-rechnungen.js` | Rechnungen | 4336 | 54 |
| `js/0940-leistungskategorien.js` | Leistungskategorien  | 4390 | 148 |
| `js/0950-goae.js` | GOÄ | 4538 | 801 |
| `js/0960-alle-tabellen.js` | Alle Tabellen | 5339 | 239 |
| `js/0970-pdf-erzeugung.js` | PDF-Erzeugung  | 5578 | 48 |
| `js/0980-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5626 | 280 |
| `js/0990-briefumschlag-c6.js` | Briefumschlag C6  | 5906 | 494 |
| `js/1000-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6400 | 498 |
| `js/1010-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6898 | 263 |
| `js/1020-statistik.js` | Statistik | 7161 | 74 |
| `js/1030-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7235 | 108 |
| `js/1040-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7343 | 281 |
| `js/1050-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7624 | 294 |
| `js/1060-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7918 | 136 |
| `js/1070-medien.js` | Medien | 8054 | 394 |
| `js/1080-webformulare.js` | Webformulare | 8448 | 278 |
| `js/1090-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8726 | 198 |
| `js/1100-produktlager.js` | Produktlager | 8924 | 549 |
| `js/1110-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9473 | 242 |
| `js/1120-sicherung.js` | Sicherung  | 9715 | 219 |
| `js/1130-sicherung-als-zip.js` | Sicherung als ZIP | 9934 | 318 |
| `js/1140-geraete-abgleich.js` | Geräte-Abgleich | 10252 | 69 |
| `js/1150-eingangskorb.js` | Eingangskorb | 10321 | 97 |
| `html/1160-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10418 | 1 |
| `js/1170-app-start.js` | app-start | 10419 | 0 |
| `html/1180-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10419 | 7 |
| `js/1190-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10426 | 12 |
| `html/1200-dokument-ende.html` | dokument-ende | 10438 | 2 |
