# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `f84f8c249814919e…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (23 Teile)
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
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1265 | 88 |
| `css/0250-ueberschrift-kalender-entfaellt.css` | Überschrift „Kalender“ entfällt | 1353 | 12 |
| `css/0260-konsequent-ueberall.css` | Konsequent überall | 1365 | 15 |
| `css/0270-werkzeug-knoepfe.css` | Werkzeug-Knöpfe | 1380 | 15 |
| `html/0280-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1395 | 5 |
| `js/0290-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1400 | 0 |
| `html/0300-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1400 | 13 |
| `js/0310-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1413 | 275 |
| `html/0320-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1688 | 17 |
| `html/0330-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1705 | 28 |
| `html/0340-seite-start.html` | seite START | 1733 | 47 |
| `html/0350-seite-patienten.html` | seite PATIENTEN | 1780 | 28 |
| `html/0360-seite-rechnungen.html` | seite RECHNUNGEN | 1808 | 30 |
| `html/0370-seite-leistungen.html` | seite LEISTUNGEN | 1838 | 33 |
| `html/0380-seite-dokumente.html` | seite DOKUMENTE | 1871 | 19 |
| `html/0390-seite-zahlungen.html` | seite ZAHLUNGEN | 1890 | 22 |
| `html/0400-seite-praxisdaten.html` | seite PRAXISDATEN | 1912 | 47 |
| `html/0410-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1959 | 15 |
| `html/0420-seite-webformulare.html` | seite WEBFORMULARE | 1974 | 18 |
| `html/0430-seite-sicherung.html` | seite SICHERUNG | 1992 | 14 |
| `html/0440-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 2006 | 48 |
| `html/0450-seite-textbausteine.html` | seite TEXTBAUSTEINE | 2054 | 9 |
| `html/0460-seite-todos.html` | seite TODOS | 2063 | 16 |
| `html/0470-seite-statistik.html` | seite STATISTIK | 2079 | 34 |
| `html/0480-seite-lager.html` | seite LAGER | 2113 | 20 |
| `html/0490-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2133 | 25 |
| `html/0500-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2158 | 43 |
| `html/0510-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2201 | 71 |
| `html/0520-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2272 | 10 |
| `html/0530-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2282 | 7 |
| `html/0540-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2289 | 17 |
| `html/0550-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2306 | 10 |
| `html/0560-fenster-rezept.html` | fenster REZEPT | 2316 | 23 |
| `html/0570-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2339 | 54 |
| `html/0580-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2393 | 27 |
| `html/0590-fenster-leistung.html` | fenster LEISTUNG | 2420 | 31 |
| `html/0600-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2451 | 20 |
| `html/0610-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2471 | 15 |
| `html/0620-fenster-ausgabe.html` | fenster AUSGABE | 2486 | 18 |
| `html/0630-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2504 | 37 |
| `html/0640-fenster-platzhalter.html` | fenster PLATZHALTER | 2541 | 15 |
| `html/0650-fenster-anrede.html` | fenster ANREDE | 2556 | 16 |
| `html/0660-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2572 | 14 |
| `html/0670-fenster-vorlage.html` | fenster VORLAGE | 2586 | 33 |
| `html/0680-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2619 | 9 |
| `html/0690-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2628 | 18 |
| `html/0700-fenster-zahlung.html` | fenster ZAHLUNG | 2646 | 15 |
| `html/0710-fenster-sicherung.html` | fenster SICHERUNG | 2661 | 15 |
| `html/0720-fenster-fortschritt.html` | fenster FORTSCHRITT | 2676 | 11 |
| `html/0730-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2687 | 10 |
| `html/0740-fenster-dokumentation.html` | fenster DOKUMENTATION | 2697 | 12 |
| `html/0750-fenster-todo.html` | fenster TODO | 2709 | 19 |
| `html/0760-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2728 | 14 |
| `html/0770-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2742 | 12 |
| `html/0780-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2754 | 12 |
| `html/0790-fenster-produkt.html` | fenster PRODUKT | 2766 | 48 |
| `html/0800-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2814 | 13 |
| `html/0810-fenster-wareneingang.html` | fenster WARENEINGANG | 2827 | 20 |
| `html/0820-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2847 | 16 |
| `html/0830-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2863 | 12 |
| `html/0840-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2875 | 9 |
| `html/0850-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2884 | 19 |
| `html/0860-fenster-e-mail.html` | fenster E-MAIL | 2903 | 14 |
| `html/0870-fenster-bild-gross.html` | fenster BILD GROSS | 2917 | 11 |
| `html/0880-fenster-zuordnen.html` | fenster ZUORDNEN | 2928 | 10 |
| `js/0890-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2938 | 224 |
| `js/0900-hinweise-an-patienten.js` | Hinweise an Patienten | 3162 | 358 |
| `js/0910-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3520 | 152 |
| `js/0920-kalender.js` | Kalender | 3672 | 301 |
| `js/0930-startseite.js` | Startseite | 3973 | 280 |
| `js/0940-patienten-termine-doku.js` | Patienten, Termine, Doku | 4253 | 84 |
| `js/0950-dateispeicher.js` | Dateispeicher  | 4337 | 60 |
| `js/0960-rechnungen.js` | Rechnungen | 4397 | 54 |
| `js/0970-leistungskategorien.js` | Leistungskategorien  | 4451 | 148 |
| `js/0980-goae.js` | GOÄ | 4599 | 801 |
| `js/0990-alle-tabellen.js` | Alle Tabellen | 5400 | 239 |
| `js/1000-pdf-erzeugung.js` | PDF-Erzeugung  | 5639 | 48 |
| `js/1010-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5687 | 280 |
| `js/1020-briefumschlag-c6.js` | Briefumschlag C6  | 5967 | 494 |
| `js/1030-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6461 | 498 |
| `js/1040-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6959 | 263 |
| `js/1050-statistik.js` | Statistik | 7222 | 74 |
| `js/1060-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7296 | 108 |
| `js/1070-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7404 | 281 |
| `js/1080-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7685 | 294 |
| `js/1090-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7979 | 136 |
| `js/1100-medien.js` | Medien | 8115 | 394 |
| `js/1110-webformulare.js` | Webformulare | 8509 | 278 |
| `js/1120-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8787 | 198 |
| `js/1130-produktlager.js` | Produktlager | 8985 | 549 |
| `js/1140-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9534 | 242 |
| `js/1150-sicherung.js` | Sicherung  | 9776 | 219 |
| `js/1160-sicherung-als-zip.js` | Sicherung als ZIP | 9995 | 318 |
| `js/1170-geraete-abgleich.js` | Geräte-Abgleich | 10313 | 69 |
| `js/1180-eingangskorb.js` | Eingangskorb | 10382 | 97 |
| `html/1190-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10479 | 1 |
| `js/1200-app-start.js` | app-start | 10480 | 0 |
| `html/1210-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10480 | 7 |
| `js/1220-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10487 | 12 |
| `html/1230-dokument-ende.html` | dokument-ende | 10499 | 2 |
