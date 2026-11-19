# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `fa493cd536e4b138…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (23 Teile)
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
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1265 | 88 |
| `css/0250-ueberschrift-kalender-entfaellt.css` | Überschrift „Kalender“ entfällt | 1353 | 12 |
| `css/0260-konsequent-ueberall.css` | Konsequent überall | 1365 | 15 |
| `css/0270-werkzeug-knoepfe.css` | Werkzeug-Knöpfe | 1380 | 25 |
| `html/0280-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1405 | 5 |
| `js/0290-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1410 | 0 |
| `html/0300-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1410 | 13 |
| `js/0310-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1423 | 275 |
| `html/0320-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1698 | 17 |
| `html/0330-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1715 | 28 |
| `html/0340-seite-start.html` | seite START | 1743 | 47 |
| `html/0350-seite-patienten.html` | seite PATIENTEN | 1790 | 28 |
| `html/0360-seite-rechnungen.html` | seite RECHNUNGEN | 1818 | 30 |
| `html/0370-seite-leistungen.html` | seite LEISTUNGEN | 1848 | 33 |
| `html/0380-seite-dokumente.html` | seite DOKUMENTE | 1881 | 19 |
| `html/0390-seite-zahlungen.html` | seite ZAHLUNGEN | 1900 | 22 |
| `html/0400-seite-praxisdaten.html` | seite PRAXISDATEN | 1922 | 47 |
| `html/0410-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1969 | 15 |
| `html/0420-seite-webformulare.html` | seite WEBFORMULARE | 1984 | 18 |
| `html/0430-seite-sicherung.html` | seite SICHERUNG | 2002 | 14 |
| `html/0440-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2016 | 48 |
| `html/0450-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2064 | 9 |
| `html/0460-seite-todos.html` | seite TODOS | 2073 | 16 |
| `html/0470-seite-statistik.html` | seite STATISTIK | 2089 | 34 |
| `html/0480-seite-lager.html` | seite LAGER | 2123 | 20 |
| `html/0490-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2143 | 25 |
| `html/0500-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2168 | 43 |
| `html/0510-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2211 | 71 |
| `html/0520-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2282 | 10 |
| `html/0530-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2292 | 7 |
| `html/0540-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2299 | 17 |
| `html/0550-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2316 | 10 |
| `html/0560-fenster-rezept.html` | fenster REZEPT | 2326 | 23 |
| `html/0570-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2349 | 54 |
| `html/0580-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2403 | 27 |
| `html/0590-fenster-leistung.html` | fenster LEISTUNG | 2430 | 31 |
| `html/0600-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2461 | 20 |
| `html/0610-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2481 | 15 |
| `html/0620-fenster-ausgabe.html` | fenster AUSGABE | 2496 | 18 |
| `html/0630-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2514 | 37 |
| `html/0640-fenster-platzhalter.html` | fenster PLATZHALTER | 2551 | 15 |
| `html/0650-fenster-anrede.html` | fenster ANREDE | 2566 | 16 |
| `html/0660-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2582 | 14 |
| `html/0670-fenster-vorlage.html` | fenster VORLAGE | 2596 | 33 |
| `html/0680-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2629 | 9 |
| `html/0690-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2638 | 18 |
| `html/0700-fenster-zahlung.html` | fenster ZAHLUNG | 2656 | 15 |
| `html/0710-fenster-sicherung.html` | fenster SICHERUNG | 2671 | 15 |
| `html/0720-fenster-fortschritt.html` | fenster FORTSCHRITT | 2686 | 11 |
| `html/0730-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2697 | 10 |
| `html/0740-fenster-dokumentation.html` | fenster DOKUMENTATION | 2707 | 12 |
| `html/0750-fenster-todo.html` | fenster TODO | 2719 | 19 |
| `html/0760-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2738 | 14 |
| `html/0770-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2752 | 12 |
| `html/0780-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2764 | 12 |
| `html/0790-fenster-produkt.html` | fenster PRODUKT | 2776 | 48 |
| `html/0800-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2824 | 13 |
| `html/0810-fenster-wareneingang.html` | fenster WARENEINGANG | 2837 | 20 |
| `html/0820-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2857 | 16 |
| `html/0830-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2873 | 12 |
| `html/0840-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2885 | 9 |
| `html/0850-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2894 | 19 |
| `html/0860-fenster-e-mail.html` | fenster E-MAIL | 2913 | 14 |
| `html/0870-fenster-bild-gross.html` | fenster BILD GROSS | 2927 | 12 |
| `html/0880-fenster-bildvergleich.html` | fenster BILDVERGLEICH | 2939 | 10 |
| `html/0890-fenster-zuordnen.html` | fenster ZUORDNEN | 2949 | 10 |
| `js/0900-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2959 | 224 |
| `js/0910-hinweise-an-patienten.js` | Hinweise an Patienten | 3183 | 358 |
| `js/0920-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3541 | 152 |
| `js/0930-kalender.js` | Kalender | 3693 | 301 |
| `js/0940-startseite.js` | Startseite | 3994 | 280 |
| `js/0950-patienten-termine-doku.js` | Patienten, Termine, Doku | 4274 | 84 |
| `js/0960-dateispeicher.js` | Dateispeicher  | 4358 | 60 |
| `js/0970-rechnungen.js` | Rechnungen | 4418 | 54 |
| `js/0980-leistungskategorien.js` | Leistungskategorien  | 4472 | 148 |
| `js/0990-goae.js` | GOÄ | 4620 | 801 |
| `js/1000-alle-tabellen.js` | Alle Tabellen | 5421 | 239 |
| `js/1010-pdf-erzeugung.js` | PDF-Erzeugung  | 5660 | 48 |
| `js/1020-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5708 | 280 |
| `js/1030-briefumschlag-c6.js` | Briefumschlag C6  | 5988 | 494 |
| `js/1040-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6482 | 498 |
| `js/1050-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6980 | 263 |
| `js/1060-statistik.js` | Statistik | 7243 | 74 |
| `js/1070-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7317 | 108 |
| `js/1080-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7425 | 281 |
| `js/1090-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7706 | 294 |
| `js/1100-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8000 | 136 |
| `js/1110-medien.js` | Medien | 8136 | 433 |
| `js/1120-webformulare.js` | Webformulare | 8569 | 278 |
| `js/1130-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8847 | 198 |
| `js/1140-produktlager.js` | Produktlager | 9045 | 549 |
| `js/1150-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9594 | 242 |
| `js/1160-sicherung.js` | Sicherung  | 9836 | 219 |
| `js/1170-sicherung-als-zip.js` | Sicherung als ZIP | 10055 | 318 |
| `js/1180-geraete-abgleich.js` | Geräte-Abgleich | 10373 | 69 |
| `js/1190-eingangskorb.js` | Eingangskorb | 10442 | 97 |
| `html/1200-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10539 | 1 |
| `js/1210-app-start.js` | app-start | 10540 | 0 |
| `html/1220-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10540 | 7 |
| `js/1230-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10547 | 12 |
| `html/1240-dokument-ende.html` | dokument-ende | 10559 | 2 |
