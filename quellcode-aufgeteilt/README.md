# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `389704b0f49799f9…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (14 Teile)
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
| `css/0150-rechnungen-in-queransicht-und-am-desktop.css` | Rechnungen in Queransicht und am Desktop | 946 | 28 |
| `css/0160-reihenfolge.css` | Reihenfolge | 974 | 25 |
| `css/0170-patientenliste-kompakt.css` | Patientenliste kompakt | 999 | 38 |
| `css/0180-suchleiste-mit-lupe-zum-einklappen.css` | Suchleiste mit Lupe zum Einklappen | 1037 | 16 |
| `html/0190-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1053 | 5 |
| `js/0200-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1058 | 0 |
| `html/0210-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1058 | 12 |
| `js/0220-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1070 | 252 |
| `html/0230-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1322 | 36 |
| `html/0240-seite-start.html` | seite START | 1358 | 47 |
| `html/0250-seite-patienten.html` | seite PATIENTEN | 1405 | 30 |
| `html/0260-seite-rechnungen.html` | seite RECHNUNGEN | 1435 | 29 |
| `html/0270-seite-leistungen.html` | seite LEISTUNGEN | 1464 | 33 |
| `html/0280-seite-dokumente.html` | seite DOKUMENTE | 1497 | 19 |
| `html/0290-seite-zahlungen.html` | seite ZAHLUNGEN | 1516 | 22 |
| `html/0300-seite-praxisdaten.html` | seite PRAXISDATEN | 1538 | 47 |
| `html/0310-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1585 | 15 |
| `html/0320-seite-webformulare.html` | seite WEBFORMULARE | 1600 | 18 |
| `html/0330-seite-sicherung.html` | seite SICHERUNG | 1618 | 14 |
| `html/0340-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1632 | 48 |
| `html/0350-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1680 | 9 |
| `html/0360-seite-todos.html` | seite TODOS | 1689 | 16 |
| `html/0370-seite-statistik.html` | seite STATISTIK | 1705 | 34 |
| `html/0380-seite-lager.html` | seite LAGER | 1739 | 20 |
| `html/0390-fenster-neuer-patient.html` | fenster NEUER PATIENT | 1759 | 25 |
| `html/0400-fenster-neuer-termin.html` | fenster NEUER TERMIN | 1784 | 43 |
| `html/0410-fenster-patientenakte.html` | fenster PATIENTENAKTE | 1827 | 71 |
| `html/0420-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 1898 | 9 |
| `html/0430-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 1907 | 7 |
| `html/0440-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 1914 | 17 |
| `html/0450-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 1931 | 10 |
| `html/0460-fenster-rezept.html` | fenster REZEPT | 1941 | 23 |
| `html/0470-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 1964 | 54 |
| `html/0480-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2018 | 27 |
| `html/0490-fenster-leistung.html` | fenster LEISTUNG | 2045 | 31 |
| `html/0500-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2076 | 20 |
| `html/0510-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2096 | 15 |
| `html/0520-fenster-ausgabe.html` | fenster AUSGABE | 2111 | 18 |
| `html/0530-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2129 | 37 |
| `html/0540-fenster-platzhalter.html` | fenster PLATZHALTER | 2166 | 15 |
| `html/0550-fenster-anrede.html` | fenster ANREDE | 2181 | 16 |
| `html/0560-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2197 | 14 |
| `html/0570-fenster-vorlage.html` | fenster VORLAGE | 2211 | 33 |
| `html/0580-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2244 | 9 |
| `html/0590-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2253 | 18 |
| `html/0600-fenster-zahlung.html` | fenster ZAHLUNG | 2271 | 15 |
| `html/0610-fenster-sicherung.html` | fenster SICHERUNG | 2286 | 15 |
| `html/0620-fenster-fortschritt.html` | fenster FORTSCHRITT | 2301 | 11 |
| `html/0630-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2312 | 10 |
| `html/0640-fenster-dokumentation.html` | fenster DOKUMENTATION | 2322 | 12 |
| `html/0650-fenster-todo.html` | fenster TODO | 2334 | 19 |
| `html/0660-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2353 | 14 |
| `html/0670-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2367 | 12 |
| `html/0680-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2379 | 12 |
| `html/0690-fenster-produkt.html` | fenster PRODUKT | 2391 | 48 |
| `html/0700-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2439 | 13 |
| `html/0710-fenster-wareneingang.html` | fenster WARENEINGANG | 2452 | 20 |
| `html/0720-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2472 | 16 |
| `html/0730-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2488 | 12 |
| `html/0740-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2500 | 9 |
| `html/0750-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2509 | 19 |
| `html/0760-fenster-e-mail.html` | fenster E-MAIL | 2528 | 14 |
| `html/0770-fenster-bild-gross.html` | fenster BILD GROSS | 2542 | 11 |
| `html/0780-fenster-zuordnen.html` | fenster ZUORDNEN | 2553 | 10 |
| `js/0790-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2563 | 195 |
| `js/0800-hinweise-an-patienten.js` | Hinweise an Patienten | 2758 | 317 |
| `js/0810-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3075 | 129 |
| `js/0820-kalender.js` | Kalender | 3204 | 279 |
| `js/0830-startseite.js` | Startseite | 3483 | 270 |
| `js/0840-patienten-termine-doku.js` | Patienten, Termine, Doku | 3753 | 84 |
| `js/0850-dateispeicher.js` | Dateispeicher  | 3837 | 60 |
| `js/0860-rechnungen.js` | Rechnungen | 3897 | 54 |
| `js/0870-leistungskategorien.js` | Leistungskategorien  | 3951 | 148 |
| `js/0880-goae.js` | GOÄ | 4099 | 795 |
| `js/0890-alle-tabellen.js` | Alle Tabellen | 4894 | 239 |
| `js/0900-pdf-erzeugung.js` | PDF-Erzeugung  | 5133 | 48 |
| `js/0910-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5181 | 280 |
| `js/0920-briefumschlag-c6.js` | Briefumschlag C6  | 5461 | 464 |
| `js/0930-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 5925 | 497 |
| `js/0940-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6422 | 262 |
| `js/0950-statistik.js` | Statistik | 6684 | 74 |
| `js/0960-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 6758 | 113 |
| `js/0970-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 6871 | 280 |
| `js/0980-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7151 | 294 |
| `js/0990-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7445 | 136 |
| `js/1000-medien.js` | Medien | 7581 | 362 |
| `js/1010-webformulare.js` | Webformulare | 7943 | 278 |
| `js/1020-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8221 | 198 |
| `js/1030-produktlager.js` | Produktlager | 8419 | 549 |
| `js/1040-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 8968 | 242 |
| `js/1050-sicherung.js` | Sicherung  | 9210 | 219 |
| `js/1060-sicherung-als-zip.js` | Sicherung als ZIP | 9429 | 318 |
| `js/1070-geraete-abgleich.js` | Geräte-Abgleich | 9747 | 69 |
| `js/1080-eingangskorb.js` | Eingangskorb | 9816 | 97 |
| `html/1090-oberflaeche-rahmen.html` | oberflaeche-rahmen | 9913 | 1 |
| `js/1100-app-start.js` | app-start | 9914 | 0 |
| `html/1110-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 9914 | 7 |
| `js/1120-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 9921 | 12 |
| `html/1130-dokument-ende.html` | dokument-ende | 9933 | 2 |
