# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `d22f6041d4681aaa…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (18 Teile)
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
| `css/0210-hochkant.css` | Hochkant | 1159 | 43 |
| `css/0220-patientenliste-quer.css` | Patientenliste quer | 1202 | 42 |
| `html/0230-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1244 | 5 |
| `js/0240-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1249 | 0 |
| `html/0250-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1249 | 13 |
| `js/0260-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1262 | 275 |
| `html/0270-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1537 | 36 |
| `html/0280-seite-start.html` | seite START | 1573 | 47 |
| `html/0290-seite-patienten.html` | seite PATIENTEN | 1620 | 30 |
| `html/0300-seite-rechnungen.html` | seite RECHNUNGEN | 1650 | 30 |
| `html/0310-seite-leistungen.html` | seite LEISTUNGEN | 1680 | 33 |
| `html/0320-seite-dokumente.html` | seite DOKUMENTE | 1713 | 19 |
| `html/0330-seite-zahlungen.html` | seite ZAHLUNGEN | 1732 | 22 |
| `html/0340-seite-praxisdaten.html` | seite PRAXISDATEN | 1754 | 47 |
| `html/0350-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1801 | 15 |
| `html/0360-seite-webformulare.html` | seite WEBFORMULARE | 1816 | 18 |
| `html/0370-seite-sicherung.html` | seite SICHERUNG | 1834 | 14 |
| `html/0380-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1848 | 48 |
| `html/0390-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1896 | 9 |
| `html/0400-seite-todos.html` | seite TODOS | 1905 | 16 |
| `html/0410-seite-statistik.html` | seite STATISTIK | 1921 | 34 |
| `html/0420-seite-lager.html` | seite LAGER | 1955 | 20 |
| `html/0430-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1975 | 25 |
| `html/0440-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2000 | 43 |
| `html/0450-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2043 | 71 |
| `html/0460-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2114 | 10 |
| `html/0470-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2124 | 7 |
| `html/0480-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2131 | 17 |
| `html/0490-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2148 | 10 |
| `html/0500-fenster-rezept.html` | fenster REZEPT | 2158 | 23 |
| `html/0510-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2181 | 54 |
| `html/0520-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2235 | 27 |
| `html/0530-fenster-leistung.html` | fenster LEISTUNG | 2262 | 31 |
| `html/0540-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2293 | 20 |
| `html/0550-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2313 | 15 |
| `html/0560-fenster-ausgabe.html` | fenster AUSGABE | 2328 | 18 |
| `html/0570-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2346 | 37 |
| `html/0580-fenster-platzhalter.html` | fenster PLATZHALTER | 2383 | 15 |
| `html/0590-fenster-anrede.html` | fenster ANREDE | 2398 | 16 |
| `html/0600-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2414 | 14 |
| `html/0610-fenster-vorlage.html` | fenster VORLAGE | 2428 | 33 |
| `html/0620-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2461 | 9 |
| `html/0630-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2470 | 18 |
| `html/0640-fenster-zahlung.html` | fenster ZAHLUNG | 2488 | 15 |
| `html/0650-fenster-sicherung.html` | fenster SICHERUNG | 2503 | 15 |
| `html/0660-fenster-fortschritt.html` | fenster FORTSCHRITT | 2518 | 11 |
| `html/0670-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2529 | 10 |
| `html/0680-fenster-dokumentation.html` | fenster DOKUMENTATION | 2539 | 12 |
| `html/0690-fenster-todo.html` | fenster TODO | 2551 | 19 |
| `html/0700-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2570 | 14 |
| `html/0710-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2584 | 12 |
| `html/0720-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2596 | 12 |
| `html/0730-fenster-produkt.html` | fenster PRODUKT | 2608 | 48 |
| `html/0740-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2656 | 13 |
| `html/0750-fenster-wareneingang.html` | fenster WARENEINGANG | 2669 | 20 |
| `html/0760-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2689 | 16 |
| `html/0770-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2705 | 12 |
| `html/0780-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2717 | 9 |
| `html/0790-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2726 | 19 |
| `html/0800-fenster-e-mail.html` | fenster E-MAIL | 2745 | 14 |
| `html/0810-fenster-bild-gross.html` | fenster BILD GROSS | 2759 | 11 |
| `html/0820-fenster-zuordnen.html` | fenster ZUORDNEN | 2770 | 10 |
| `js/0830-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2780 | 195 |
| `js/0840-hinweise-an-patienten.js` | Hinweise an Patienten | 2975 | 346 |
| `js/0850-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3321 | 134 |
| `js/0860-kalender.js` | Kalender | 3455 | 279 |
| `js/0870-startseite.js` | Startseite | 3734 | 280 |
| `js/0880-patienten-termine-doku.js` | Patienten, Termine, Doku | 4014 | 84 |
| `js/0890-dateispeicher.js` | Dateispeicher  | 4098 | 60 |
| `js/0900-rechnungen.js` | Rechnungen | 4158 | 54 |
| `js/0910-leistungskategorien.js` | Leistungskategorien  | 4212 | 148 |
| `js/0920-goae.js` | GOÄ | 4360 | 801 |
| `js/0930-alle-tabellen.js` | Alle Tabellen | 5161 | 239 |
| `js/0940-pdf-erzeugung.js` | PDF-Erzeugung  | 5400 | 48 |
| `js/0950-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5448 | 280 |
| `js/0960-briefumschlag-c6.js` | Briefumschlag C6  | 5728 | 478 |
| `js/0970-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6206 | 494 |
| `js/0980-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6700 | 262 |
| `js/0990-statistik.js` | Statistik | 6962 | 74 |
| `js/1000-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7036 | 108 |
| `js/1010-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7144 | 281 |
| `js/1020-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7425 | 294 |
| `js/1030-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7719 | 136 |
| `js/1040-medien.js` | Medien | 7855 | 381 |
| `js/1050-webformulare.js` | Webformulare | 8236 | 278 |
| `js/1060-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8514 | 198 |
| `js/1070-produktlager.js` | Produktlager | 8712 | 549 |
| `js/1080-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9261 | 242 |
| `js/1090-sicherung.js` | Sicherung  | 9503 | 219 |
| `js/1100-sicherung-als-zip.js` | Sicherung als ZIP | 9722 | 318 |
| `js/1110-geraete-abgleich.js` | Geräte-Abgleich | 10040 | 69 |
| `js/1120-eingangskorb.js` | Eingangskorb | 10109 | 97 |
| `html/1130-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10206 | 1 |
| `js/1140-app-start.js` | app-start | 10207 | 0 |
| `html/1150-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10207 | 7 |
| `js/1160-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10214 | 12 |
| `html/1170-dokument-ende.html` | dokument-ende | 10226 | 2 |
