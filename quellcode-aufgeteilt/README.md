# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `ef0b1a04e99f3ed8…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (27 Teile)
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
| `css/0060-kalender.css` | Kalender | 163 | 367 |
| `css/0070-terminansicht.css` | Terminansicht | 530 | 55 |
| `css/0080-masken.css` | Masken | 585 | 61 |
| `css/0090-akten-optisch-voneinander-trennen.css` | Akten optisch voneinander trennen | 646 | 91 |
| `css/0100-patientenliste.css` | Patientenliste | 737 | 92 |
| `css/0110-zeilen-buttons-erst-bei-hover-maus-oder-nach-tip.css` | Zeilen-Buttons erst bei Hover (Maus) oder nach Tipp auf die Zeile zeigen | 829 | 36 |
| `css/0120-markierte-layoutkorrekturen.css` | Markierte Layoutkorrekturen | 865 | 33 |
| `css/0130-handy-quer.css` | Handy quer | 898 | 33 |
| `css/0140-rechnungen.css` | Rechnungen | 931 | 41 |
| `css/0150-querformat-und-desktop.css` | Querformat und Desktop | 972 | 14 |
| `css/0160-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 986 | 48 |
| `css/0170-reihenfolge.css` | Reihenfolge | 1034 | 29 |
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1063 | 47 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1110 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1131 | 33 |
| `css/0210-namensleiste.css` | Namensleiste | 1164 | 13 |
| `css/0220-hochkant.css` | Hochkant | 1177 | 39 |
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1216 | 52 |
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1268 | 88 |
| `css/0250-ueberschrift-kalender-entfaellt.css` | Überschrift „Kalender“ entfällt | 1356 | 12 |
| `css/0260-konsequent-ueberall.css` | Konsequent überall | 1368 | 15 |
| `css/0270-werkzeug-knoepfe.css` | Werkzeug-Knöpfe | 1383 | 15 |
| `css/0280-bildvergleich.css` | Bildvergleich | 1398 | 39 |
| `css/0290-videos-in-der-akte.css` | Videos in der Akte | 1437 | 33 |
| `css/0300-pdf-editor-und-vorlagenfelder-pdfedit.css` | PDF-Editor und Vorlagenfelder (pdfedit | 1470 | 24 |
| `css/0310-bildvergleich-vergleich.css` | Bildvergleich (vergleich | 1494 | 29 |
| `html/0320-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1523 | 7 |
| `js/0330-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1530 | 0 |
| `html/0340-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1530 | 13 |
| `js/0350-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1543 | 339 |
| `html/0360-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1882 | 17 |
| `html/0370-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1899 | 28 |
| `html/0380-seite-start.html` | seite START | 1927 | 47 |
| `html/0390-seite-patienten.html` | seite PATIENTEN | 1974 | 28 |
| `html/0400-seite-rechnungen.html` | seite RECHNUNGEN | 2002 | 30 |
| `html/0410-seite-leistungen.html` | seite LEISTUNGEN | 2032 | 29 |
| `html/0420-seite-dokumente.html` | seite DOKUMENTE | 2061 | 19 |
| `html/0430-seite-zahlungen.html` | seite ZAHLUNGEN | 2080 | 22 |
| `html/0440-seite-praxisdaten.html` | seite PRAXISDATEN | 2102 | 47 |
| `html/0450-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 2149 | 15 |
| `html/0460-seite-webformulare.html` | seite WEBFORMULARE | 2164 | 18 |
| `html/0470-seite-sicherung.html` | seite SICHERUNG | 2182 | 24 |
| `html/0480-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2206 | 50 |
| `html/0490-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2256 | 9 |
| `html/0500-seite-todos.html` | seite TODOS | 2265 | 16 |
| `html/0510-seite-statistik.html` | seite STATISTIK | 2281 | 34 |
| `html/0520-seite-lager.html` | seite LAGER | 2315 | 20 |
| `html/0530-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2335 | 25 |
| `html/0540-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2360 | 43 |
| `html/0550-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2403 | 74 |
| `html/0560-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2477 | 10 |
| `html/0570-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2487 | 7 |
| `html/0580-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2494 | 17 |
| `html/0590-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2511 | 10 |
| `html/0600-fenster-rezept.html` | fenster REZEPT | 2521 | 23 |
| `html/0610-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2544 | 54 |
| `html/0620-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2598 | 27 |
| `html/0630-fenster-leistung.html` | fenster LEISTUNG | 2625 | 31 |
| `html/0640-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2656 | 20 |
| `html/0650-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2676 | 15 |
| `html/0660-fenster-ausgabe.html` | fenster AUSGABE | 2691 | 18 |
| `html/0670-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2709 | 37 |
| `html/0680-fenster-platzhalter.html` | fenster PLATZHALTER | 2746 | 15 |
| `html/0690-fenster-anrede.html` | fenster ANREDE | 2761 | 16 |
| `html/0700-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2777 | 14 |
| `html/0710-fenster-vorlage.html` | fenster VORLAGE | 2791 | 52 |
| `html/0720-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2843 | 9 |
| `html/0730-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2852 | 18 |
| `html/0740-fenster-zahlung.html` | fenster ZAHLUNG | 2870 | 15 |
| `html/0750-fenster-sicherung.html` | fenster SICHERUNG | 2885 | 15 |
| `html/0760-fenster-fortschritt.html` | fenster FORTSCHRITT | 2900 | 11 |
| `html/0770-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2911 | 10 |
| `html/0780-fenster-dokumentation.html` | fenster DOKUMENTATION | 2921 | 12 |
| `html/0790-fenster-todo.html` | fenster TODO | 2933 | 19 |
| `html/0800-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2952 | 14 |
| `html/0810-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2966 | 12 |
| `html/0820-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2978 | 12 |
| `html/0830-fenster-produkt.html` | fenster PRODUKT | 2990 | 48 |
| `html/0840-fenster-ausbuchen.html` | fenster AUSBUCHEN | 3038 | 13 |
| `html/0850-fenster-wareneingang.html` | fenster WARENEINGANG | 3051 | 20 |
| `html/0860-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 3071 | 16 |
| `html/0870-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 3087 | 12 |
| `html/0880-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 3099 | 9 |
| `html/0890-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 3108 | 19 |
| `html/0900-fenster-e-mail.html` | fenster E-MAIL | 3127 | 14 |
| `html/0910-fenster-bild-gross.html` | fenster BILD GROSS | 3141 | 13 |
| `html/0920-fenster-zuordnen.html` | fenster ZUORDNEN | 3154 | 10 |
| `js/0930-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 3164 | 224 |
| `js/0940-hinweise-an-patienten.js` | Hinweise an Patienten | 3388 | 358 |
| `js/0950-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3746 | 167 |
| `js/0960-kalender.js` | Kalender | 3913 | 301 |
| `js/0970-startseite.js` | Startseite | 4214 | 280 |
| `js/0980-patienten-termine-doku.js` | Patienten, Termine, Doku | 4494 | 84 |
| `js/0990-dateispeicher.js` | Dateispeicher  | 4578 | 60 |
| `js/1000-rechnungen.js` | Rechnungen | 4638 | 54 |
| `js/1010-leistungskategorien.js` | Leistungskategorien  | 4692 | 145 |
| `js/1020-goae.js` | GOÄ | 4837 | 801 |
| `js/1030-alle-tabellen.js` | Alle Tabellen | 5638 | 239 |
| `js/1040-pdf-erzeugung.js` | PDF-Erzeugung  | 5877 | 48 |
| `js/1050-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5925 | 280 |
| `js/1060-briefumschlag-c6.js` | Briefumschlag C6  | 6205 | 512 |
| `js/1070-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6717 | 621 |
| `js/1080-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 7338 | 263 |
| `js/1090-statistik.js` | Statistik | 7601 | 74 |
| `js/1100-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7675 | 108 |
| `js/1110-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7783 | 305 |
| `js/1120-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 8088 | 305 |
| `js/1130-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 8393 | 240 |
| `js/1140-medien.js` | Medien | 8633 | 439 |
| `js/1150-webformulare.js` | Webformulare | 9072 | 278 |
| `js/1160-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 9350 | 198 |
| `js/1170-produktlager.js` | Produktlager | 9548 | 549 |
| `js/1180-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 10097 | 242 |
| `js/1190-sicherung.js` | Sicherung  | 10339 | 219 |
| `js/1200-sicherung-als-zip.js` | Sicherung als ZIP | 10558 | 319 |
| `js/1210-geraete-abgleich.js` | Geräte-Abgleich | 10877 | 210 |
| `js/1220-eingangskorb.js` | Eingangskorb | 11087 | 97 |
| `html/1230-oberflaeche-rahmen.html` | oberflaeche-rahmen | 11184 | 1 |
| `js/1240-app-start.js` | app-start | 11185 | 0 |
| `html/1250-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 11185 | 7 |
| `js/1260-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 11192 | 12 |
| `html/1270-dokument-ende.html` | dokument-ende | 11204 | 2 |
