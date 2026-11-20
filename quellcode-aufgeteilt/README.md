# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `a5ef58970284dca1…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (25 Teile)
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
| `html/0300-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1468 | 5 |
| `js/0310-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1473 | 0 |
| `html/0320-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1473 | 13 |
| `js/0330-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1486 | 339 |
| `html/0340-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1825 | 17 |
| `html/0350-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1842 | 28 |
| `html/0360-seite-start.html` | seite START | 1870 | 47 |
| `html/0370-seite-patienten.html` | seite PATIENTEN | 1917 | 28 |
| `html/0380-seite-rechnungen.html` | seite RECHNUNGEN | 1945 | 30 |
| `html/0390-seite-leistungen.html` | seite LEISTUNGEN | 1975 | 33 |
| `html/0400-seite-dokumente.html` | seite DOKUMENTE | 2008 | 19 |
| `html/0410-seite-zahlungen.html` | seite ZAHLUNGEN | 2027 | 22 |
| `html/0420-seite-praxisdaten.html` | seite PRAXISDATEN | 2049 | 47 |
| `html/0430-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 2096 | 15 |
| `html/0440-seite-webformulare.html` | seite WEBFORMULARE | 2111 | 18 |
| `html/0450-seite-sicherung.html` | seite SICHERUNG | 2129 | 24 |
| `html/0460-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2153 | 48 |
| `html/0470-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2201 | 9 |
| `html/0480-seite-todos.html` | seite TODOS | 2210 | 16 |
| `html/0490-seite-statistik.html` | seite STATISTIK | 2226 | 34 |
| `html/0500-seite-lager.html` | seite LAGER | 2260 | 20 |
| `html/0510-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2280 | 25 |
| `html/0520-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2305 | 43 |
| `html/0530-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2348 | 73 |
| `html/0540-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2421 | 10 |
| `html/0550-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2431 | 7 |
| `html/0560-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2438 | 17 |
| `html/0570-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2455 | 10 |
| `html/0580-fenster-rezept.html` | fenster REZEPT | 2465 | 23 |
| `html/0590-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2488 | 54 |
| `html/0600-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2542 | 27 |
| `html/0610-fenster-leistung.html` | fenster LEISTUNG | 2569 | 31 |
| `html/0620-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2600 | 20 |
| `html/0630-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2620 | 15 |
| `html/0640-fenster-ausgabe.html` | fenster AUSGABE | 2635 | 18 |
| `html/0650-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2653 | 37 |
| `html/0660-fenster-platzhalter.html` | fenster PLATZHALTER | 2690 | 15 |
| `html/0670-fenster-anrede.html` | fenster ANREDE | 2705 | 16 |
| `html/0680-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2721 | 14 |
| `html/0690-fenster-vorlage.html` | fenster VORLAGE | 2735 | 43 |
| `html/0700-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2778 | 9 |
| `html/0710-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2787 | 18 |
| `html/0720-fenster-zahlung.html` | fenster ZAHLUNG | 2805 | 15 |
| `html/0730-fenster-sicherung.html` | fenster SICHERUNG | 2820 | 15 |
| `html/0740-fenster-fortschritt.html` | fenster FORTSCHRITT | 2835 | 11 |
| `html/0750-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2846 | 10 |
| `html/0760-fenster-dokumentation.html` | fenster DOKUMENTATION | 2856 | 12 |
| `html/0770-fenster-todo.html` | fenster TODO | 2868 | 19 |
| `html/0780-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2887 | 14 |
| `html/0790-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2901 | 12 |
| `html/0800-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2913 | 12 |
| `html/0810-fenster-produkt.html` | fenster PRODUKT | 2925 | 48 |
| `html/0820-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2973 | 13 |
| `html/0830-fenster-wareneingang.html` | fenster WARENEINGANG | 2986 | 20 |
| `html/0840-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 3006 | 16 |
| `html/0850-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 3022 | 12 |
| `html/0860-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 3034 | 9 |
| `html/0870-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 3043 | 19 |
| `html/0880-fenster-e-mail.html` | fenster E-MAIL | 3062 | 14 |
| `html/0890-fenster-bild-gross.html` | fenster BILD GROSS | 3076 | 12 |
| `html/0900-fenster-bildvergleich.html` | fenster BILDVERGLEICH | 3088 | 10 |
| `html/0910-fenster-zuordnen.html` | fenster ZUORDNEN | 3098 | 10 |
| `js/0920-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 3108 | 224 |
| `js/0930-hinweise-an-patienten.js` | Hinweise an Patienten | 3332 | 358 |
| `js/0940-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3690 | 167 |
| `js/0950-kalender.js` | Kalender | 3857 | 301 |
| `js/0960-startseite.js` | Startseite | 4158 | 280 |
| `js/0970-patienten-termine-doku.js` | Patienten, Termine, Doku | 4438 | 84 |
| `js/0980-dateispeicher.js` | Dateispeicher  | 4522 | 60 |
| `js/0990-rechnungen.js` | Rechnungen | 4582 | 54 |
| `js/1000-leistungskategorien.js` | Leistungskategorien  | 4636 | 148 |
| `js/1010-goae.js` | GOÄ | 4784 | 801 |
| `js/1020-alle-tabellen.js` | Alle Tabellen | 5585 | 239 |
| `js/1030-pdf-erzeugung.js` | PDF-Erzeugung  | 5824 | 48 |
| `js/1040-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5872 | 280 |
| `js/1050-briefumschlag-c6.js` | Briefumschlag C6  | 6152 | 495 |
| `js/1060-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6647 | 604 |
| `js/1070-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 7251 | 263 |
| `js/1080-statistik.js` | Statistik | 7514 | 74 |
| `js/1090-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7588 | 108 |
| `js/1100-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7696 | 281 |
| `js/1110-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7977 | 299 |
| `js/1120-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8276 | 166 |
| `js/1130-medien.js` | Medien | 8442 | 460 |
| `js/1140-webformulare.js` | Webformulare | 8902 | 278 |
| `js/1150-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 9180 | 198 |
| `js/1160-produktlager.js` | Produktlager | 9378 | 549 |
| `js/1170-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9927 | 242 |
| `js/1180-sicherung.js` | Sicherung  | 10169 | 219 |
| `js/1190-sicherung-als-zip.js` | Sicherung als ZIP | 10388 | 319 |
| `js/1200-geraete-abgleich.js` | Geräte-Abgleich | 10707 | 210 |
| `js/1210-eingangskorb.js` | Eingangskorb | 10917 | 97 |
| `html/1220-oberflaeche-rahmen.html` | oberflaeche-rahmen | 11014 | 1 |
| `js/1230-app-start.js` | app-start | 11015 | 0 |
| `html/1240-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 11015 | 7 |
| `js/1250-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 11022 | 12 |
| `html/1260-dokument-ende.html` | dokument-ende | 11034 | 2 |
