# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `24e699131d4520cd…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (17 Teile)
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
| `css/0180-patientenliste-kompakt.css` | Patientenliste kompakt | 1058 | 49 |
| `css/0190-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1107 | 21 |
| `css/0200-rechnungen.css` | Rechnungen | 1128 | 33 |
| `css/0210-hochkant.css` | Hochkant | 1161 | 30 |
| `html/0220-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1191 | 5 |
| `js/0230-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1196 | 0 |
| `html/0240-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1196 | 13 |
| `js/0250-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1209 | 275 |
| `html/0260-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1484 | 36 |
| `html/0270-seite-start.html` | seite START | 1520 | 47 |
| `html/0280-seite-patienten.html` | seite PATIENTEN | 1567 | 30 |
| `html/0290-seite-rechnungen.html` | seite RECHNUNGEN | 1597 | 30 |
| `html/0300-seite-leistungen.html` | seite LEISTUNGEN | 1627 | 33 |
| `html/0310-seite-dokumente.html` | seite DOKUMENTE | 1660 | 19 |
| `html/0320-seite-zahlungen.html` | seite ZAHLUNGEN | 1679 | 22 |
| `html/0330-seite-praxisdaten.html` | seite PRAXISDATEN | 1701 | 47 |
| `html/0340-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1748 | 15 |
| `html/0350-seite-webformulare.html` | seite WEBFORMULARE | 1763 | 18 |
| `html/0360-seite-sicherung.html` | seite SICHERUNG | 1781 | 14 |
| `html/0370-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1795 | 48 |
| `html/0380-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1843 | 9 |
| `html/0390-seite-todos.html` | seite TODOS | 1852 | 16 |
| `html/0400-seite-statistik.html` | seite STATISTIK | 1868 | 34 |
| `html/0410-seite-lager.html` | seite LAGER | 1902 | 20 |
| `html/0420-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1922 | 25 |
| `html/0430-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1947 | 43 |
| `html/0440-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1990 | 71 |
| `html/0450-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2061 | 10 |
| `html/0460-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2071 | 7 |
| `html/0470-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2078 | 17 |
| `html/0480-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2095 | 10 |
| `html/0490-fenster-rezept.html` | fenster REZEPT | 2105 | 23 |
| `html/0500-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2128 | 54 |
| `html/0510-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2182 | 27 |
| `html/0520-fenster-leistung.html` | fenster LEISTUNG | 2209 | 31 |
| `html/0530-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2240 | 20 |
| `html/0540-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2260 | 15 |
| `html/0550-fenster-ausgabe.html` | fenster AUSGABE | 2275 | 18 |
| `html/0560-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2293 | 37 |
| `html/0570-fenster-platzhalter.html` | fenster PLATZHALTER | 2330 | 15 |
| `html/0580-fenster-anrede.html` | fenster ANREDE | 2345 | 16 |
| `html/0590-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2361 | 14 |
| `html/0600-fenster-vorlage.html` | fenster VORLAGE | 2375 | 33 |
| `html/0610-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2408 | 9 |
| `html/0620-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2417 | 18 |
| `html/0630-fenster-zahlung.html` | fenster ZAHLUNG | 2435 | 15 |
| `html/0640-fenster-sicherung.html` | fenster SICHERUNG | 2450 | 15 |
| `html/0650-fenster-fortschritt.html` | fenster FORTSCHRITT | 2465 | 11 |
| `html/0660-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2476 | 10 |
| `html/0670-fenster-dokumentation.html` | fenster DOKUMENTATION | 2486 | 12 |
| `html/0680-fenster-todo.html` | fenster TODO | 2498 | 19 |
| `html/0690-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2517 | 14 |
| `html/0700-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2531 | 12 |
| `html/0710-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2543 | 12 |
| `html/0720-fenster-produkt.html` | fenster PRODUKT | 2555 | 48 |
| `html/0730-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2603 | 13 |
| `html/0740-fenster-wareneingang.html` | fenster WARENEINGANG | 2616 | 20 |
| `html/0750-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2636 | 16 |
| `html/0760-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2652 | 12 |
| `html/0770-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2664 | 9 |
| `html/0780-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2673 | 19 |
| `html/0790-fenster-e-mail.html` | fenster E-MAIL | 2692 | 14 |
| `html/0800-fenster-bild-gross.html` | fenster BILD GROSS | 2706 | 11 |
| `html/0810-fenster-zuordnen.html` | fenster ZUORDNEN | 2717 | 10 |
| `js/0820-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2727 | 195 |
| `js/0830-hinweise-an-patienten.js` | Hinweise an Patienten | 2922 | 338 |
| `js/0840-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3260 | 134 |
| `js/0850-kalender.js` | Kalender | 3394 | 279 |
| `js/0860-startseite.js` | Startseite | 3673 | 280 |
| `js/0870-patienten-termine-doku.js` | Patienten, Termine, Doku | 3953 | 84 |
| `js/0880-dateispeicher.js` | Dateispeicher  | 4037 | 60 |
| `js/0890-rechnungen.js` | Rechnungen | 4097 | 54 |
| `js/0900-leistungskategorien.js` | Leistungskategorien  | 4151 | 148 |
| `js/0910-goae.js` | GOÄ | 4299 | 801 |
| `js/0920-alle-tabellen.js` | Alle Tabellen | 5100 | 239 |
| `js/0930-pdf-erzeugung.js` | PDF-Erzeugung  | 5339 | 48 |
| `js/0940-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5387 | 280 |
| `js/0950-briefumschlag-c6.js` | Briefumschlag C6  | 5667 | 478 |
| `js/0960-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6145 | 494 |
| `js/0970-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6639 | 262 |
| `js/0980-statistik.js` | Statistik | 6901 | 74 |
| `js/0990-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6975 | 108 |
| `js/1000-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7083 | 281 |
| `js/1010-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7364 | 294 |
| `js/1020-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7658 | 136 |
| `js/1030-medien.js` | Medien | 7794 | 381 |
| `js/1040-webformulare.js` | Webformulare | 8175 | 278 |
| `js/1050-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8453 | 198 |
| `js/1060-produktlager.js` | Produktlager | 8651 | 549 |
| `js/1070-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9200 | 242 |
| `js/1080-sicherung.js` | Sicherung  | 9442 | 219 |
| `js/1090-sicherung-als-zip.js` | Sicherung als ZIP | 9661 | 318 |
| `js/1100-geraete-abgleich.js` | Geräte-Abgleich | 9979 | 69 |
| `js/1110-eingangskorb.js` | Eingangskorb | 10048 | 97 |
| `html/1120-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10145 | 1 |
| `js/1130-app-start.js` | app-start | 10146 | 0 |
| `html/1140-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10146 | 7 |
| `js/1150-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10153 | 12 |
| `html/1160-dokument-ende.html` | dokument-ende | 10165 | 2 |
