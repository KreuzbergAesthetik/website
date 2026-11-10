# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `e7e7683d67410c5c…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (15 Teile)
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
| `css/0140-rechnungen.css` | Rechnungen | 919 | 27 |
| `css/0150-querformat-und-desktop.css` | Querformat und Desktop | 946 | 12 |
| `css/0160-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 958 | 28 |
| `css/0170-reihenfolge.css` | Reihenfolge | 986 | 25 |
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1011 | 49 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1060 | 16 |
| `html/0200-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1076 | 5 |
| `js/0210-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1081 | 0 |
| `html/0220-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1081 | 12 |
| `js/0230-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1093 | 252 |
| `html/0240-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1345 | 36 |
| `html/0250-seite-start.html` | seite START | 1381 | 47 |
| `html/0260-seite-patienten.html` | seite PATIENTEN | 1428 | 30 |
| `html/0270-seite-rechnungen.html` | seite RECHNUNGEN | 1458 | 29 |
| `html/0280-seite-leistungen.html` | seite LEISTUNGEN | 1487 | 33 |
| `html/0290-seite-dokumente.html` | seite DOKUMENTE | 1520 | 19 |
| `html/0300-seite-zahlungen.html` | seite ZAHLUNGEN | 1539 | 22 |
| `html/0310-seite-praxisdaten.html` | seite PRAXISDATEN | 1561 | 47 |
| `html/0320-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1608 | 15 |
| `html/0330-seite-webformulare.html` | seite WEBFORMULARE | 1623 | 18 |
| `html/0340-seite-sicherung.html` | seite SICHERUNG | 1641 | 14 |
| `html/0350-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1655 | 48 |
| `html/0360-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1703 | 9 |
| `html/0370-seite-todos.html` | seite TODOS | 1712 | 16 |
| `html/0380-seite-statistik.html` | seite STATISTIK | 1728 | 34 |
| `html/0390-seite-lager.html` | seite LAGER | 1762 | 20 |
| `html/0400-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1782 | 25 |
| `html/0410-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1807 | 43 |
| `html/0420-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1850 | 71 |
| `html/0430-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1921 | 9 |
| `html/0440-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1930 | 7 |
| `html/0450-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1937 | 17 |
| `html/0460-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1954 | 10 |
| `html/0470-fenster-rezept.html` | fenster REZEPT | 1964 | 23 |
| `html/0480-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1987 | 54 |
| `html/0490-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2041 | 27 |
| `html/0500-fenster-leistung.html` | fenster LEISTUNG | 2068 | 31 |
| `html/0510-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2099 | 20 |
| `html/0520-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2119 | 15 |
| `html/0530-fenster-ausgabe.html` | fenster AUSGABE | 2134 | 18 |
| `html/0540-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2152 | 37 |
| `html/0550-fenster-platzhalter.html` | fenster PLATZHALTER | 2189 | 15 |
| `html/0560-fenster-anrede.html` | fenster ANREDE | 2204 | 16 |
| `html/0570-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2220 | 14 |
| `html/0580-fenster-vorlage.html` | fenster VORLAGE | 2234 | 33 |
| `html/0590-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2267 | 9 |
| `html/0600-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2276 | 18 |
| `html/0610-fenster-zahlung.html` | fenster ZAHLUNG | 2294 | 15 |
| `html/0620-fenster-sicherung.html` | fenster SICHERUNG | 2309 | 15 |
| `html/0630-fenster-fortschritt.html` | fenster FORTSCHRITT | 2324 | 11 |
| `html/0640-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2335 | 10 |
| `html/0650-fenster-dokumentation.html` | fenster DOKUMENTATION | 2345 | 12 |
| `html/0660-fenster-todo.html` | fenster TODO | 2357 | 19 |
| `html/0670-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2376 | 14 |
| `html/0680-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2390 | 12 |
| `html/0690-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2402 | 12 |
| `html/0700-fenster-produkt.html` | fenster PRODUKT | 2414 | 48 |
| `html/0710-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2462 | 13 |
| `html/0720-fenster-wareneingang.html` | fenster WARENEINGANG | 2475 | 20 |
| `html/0730-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2495 | 16 |
| `html/0740-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2511 | 12 |
| `html/0750-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2523 | 9 |
| `html/0760-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2532 | 19 |
| `html/0770-fenster-e-mail.html` | fenster E-MAIL | 2551 | 14 |
| `html/0780-fenster-bild-gross.html` | fenster BILD GROSS | 2565 | 11 |
| `html/0790-fenster-zuordnen.html` | fenster ZUORDNEN | 2576 | 10 |
| `js/0800-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2586 | 195 |
| `js/0810-hinweise-an-patienten.js` | Hinweise an Patienten | 2781 | 321 |
| `js/0820-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3102 | 134 |
| `js/0830-kalender.js` | Kalender | 3236 | 279 |
| `js/0840-startseite.js` | Startseite | 3515 | 270 |
| `js/0850-patienten-termine-doku.js` | Patienten, Termine, Doku | 3785 | 84 |
| `js/0860-dateispeicher.js` | Dateispeicher  | 3869 | 60 |
| `js/0870-rechnungen.js` | Rechnungen | 3929 | 54 |
| `js/0880-leistungskategorien.js` | Leistungskategorien  | 3983 | 148 |
| `js/0890-goae.js` | GOÄ | 4131 | 795 |
| `js/0900-alle-tabellen.js` | Alle Tabellen | 4926 | 239 |
| `js/0910-pdf-erzeugung.js` | PDF-Erzeugung  | 5165 | 48 |
| `js/0920-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5213 | 280 |
| `js/0930-briefumschlag-c6.js` | Briefumschlag C6  | 5493 | 464 |
| `js/0940-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5957 | 497 |
| `js/0950-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6454 | 262 |
| `js/0960-statistik.js` | Statistik | 6716 | 74 |
| `js/0970-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6790 | 113 |
| `js/0980-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6903 | 280 |
| `js/0990-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7183 | 294 |
| `js/1000-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7477 | 136 |
| `js/1010-medien.js` | Medien | 7613 | 362 |
| `js/1020-webformulare.js` | Webformulare | 7975 | 278 |
| `js/1030-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8253 | 198 |
| `js/1040-produktlager.js` | Produktlager | 8451 | 549 |
| `js/1050-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9000 | 242 |
| `js/1060-sicherung.js` | Sicherung  | 9242 | 219 |
| `js/1070-sicherung-als-zip.js` | Sicherung als ZIP | 9461 | 318 |
| `js/1080-geraete-abgleich.js` | Geräte-Abgleich | 9779 | 69 |
| `js/1090-eingangskorb.js` | Eingangskorb | 9848 | 97 |
| `html/1100-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9945 | 1 |
| `js/1110-app-start.js` | app-start | 9946 | 0 |
| `html/1120-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9946 | 7 |
| `js/1130-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9953 | 12 |
| `html/1140-dokument-ende.html` | dokument-ende | 9965 | 2 |
