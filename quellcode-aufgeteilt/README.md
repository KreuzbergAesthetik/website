# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `d45f52024988d180…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

- `css/`: Gestaltung, nach Themen (21 Teile)
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
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1213 | 29 |
| `css/0240-groessere-klickflaeche-fuer-die-akte.css` | Größere Klickfläche für die Akte | 1242 | 15 |
| `css/0250-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1257 | 48 |
| `html/0260-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1305 | 5 |
| `js/0270-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1310 | 0 |
| `html/0280-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1310 | 13 |
| `js/0290-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1323 | 275 |
| `html/0300-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1598 | 17 |
| `html/0310-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1615 | 28 |
| `html/0320-seite-start.html` | seite START | 1643 | 47 |
| `html/0330-seite-patienten.html` | seite PATIENTEN | 1690 | 28 |
| `html/0340-seite-rechnungen.html` | seite RECHNUNGEN | 1718 | 30 |
| `html/0350-seite-leistungen.html` | seite LEISTUNGEN | 1748 | 33 |
| `html/0360-seite-dokumente.html` | seite DOKUMENTE | 1781 | 19 |
| `html/0370-seite-zahlungen.html` | seite ZAHLUNGEN | 1800 | 22 |
| `html/0380-seite-praxisdaten.html` | seite PRAXISDATEN | 1822 | 47 |
| `html/0390-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1869 | 15 |
| `html/0400-seite-webformulare.html` | seite WEBFORMULARE | 1884 | 18 |
| `html/0410-seite-sicherung.html` | seite SICHERUNG | 1902 | 14 |
| `html/0420-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1916 | 48 |
| `html/0430-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1964 | 9 |
| `html/0440-seite-todos.html` | seite TODOS | 1973 | 16 |
| `html/0450-seite-statistik.html` | seite STATISTIK | 1989 | 34 |
| `html/0460-seite-lager.html` | seite LAGER | 2023 | 20 |
| `html/0470-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2043 | 25 |
| `html/0480-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2068 | 43 |
| `html/0490-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2111 | 71 |
| `html/0500-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2182 | 10 |
| `html/0510-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2192 | 7 |
| `html/0520-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2199 | 17 |
| `html/0530-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2216 | 10 |
| `html/0540-fenster-rezept.html` | fenster REZEPT | 2226 | 23 |
| `html/0550-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2249 | 54 |
| `html/0560-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2303 | 27 |
| `html/0570-fenster-leistung.html` | fenster LEISTUNG | 2330 | 31 |
| `html/0580-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2361 | 20 |
| `html/0590-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2381 | 15 |
| `html/0600-fenster-ausgabe.html` | fenster AUSGABE | 2396 | 18 |
| `html/0610-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2414 | 37 |
| `html/0620-fenster-platzhalter.html` | fenster PLATZHALTER | 2451 | 15 |
| `html/0630-fenster-anrede.html` | fenster ANREDE | 2466 | 16 |
| `html/0640-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2482 | 14 |
| `html/0650-fenster-vorlage.html` | fenster VORLAGE | 2496 | 33 |
| `html/0660-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2529 | 9 |
| `html/0670-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2538 | 18 |
| `html/0680-fenster-zahlung.html` | fenster ZAHLUNG | 2556 | 15 |
| `html/0690-fenster-sicherung.html` | fenster SICHERUNG | 2571 | 15 |
| `html/0700-fenster-fortschritt.html` | fenster FORTSCHRITT | 2586 | 11 |
| `html/0710-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2597 | 10 |
| `html/0720-fenster-dokumentation.html` | fenster DOKUMENTATION | 2607 | 12 |
| `html/0730-fenster-todo.html` | fenster TODO | 2619 | 19 |
| `html/0740-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2638 | 14 |
| `html/0750-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2652 | 12 |
| `html/0760-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2664 | 12 |
| `html/0770-fenster-produkt.html` | fenster PRODUKT | 2676 | 48 |
| `html/0780-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2724 | 13 |
| `html/0790-fenster-wareneingang.html` | fenster WARENEINGANG | 2737 | 20 |
| `html/0800-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2757 | 16 |
| `html/0810-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2773 | 12 |
| `html/0820-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2785 | 9 |
| `html/0830-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2794 | 19 |
| `html/0840-fenster-e-mail.html` | fenster E-MAIL | 2813 | 14 |
| `html/0850-fenster-bild-gross.html` | fenster BILD GROSS | 2827 | 11 |
| `html/0860-fenster-zuordnen.html` | fenster ZUORDNEN | 2838 | 10 |
| `js/0870-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2848 | 224 |
| `js/0880-hinweise-an-patienten.js` | Hinweise an Patienten | 3072 | 347 |
| `js/0890-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3419 | 135 |
| `js/0900-kalender.js` | Kalender | 3554 | 289 |
| `js/0910-startseite.js` | Startseite | 3843 | 280 |
| `js/0920-patienten-termine-doku.js` | Patienten, Termine, Doku | 4123 | 84 |
| `js/0930-dateispeicher.js` | Dateispeicher  | 4207 | 60 |
| `js/0940-rechnungen.js` | Rechnungen | 4267 | 54 |
| `js/0950-leistungskategorien.js` | Leistungskategorien  | 4321 | 148 |
| `js/0960-goae.js` | GOÄ | 4469 | 801 |
| `js/0970-alle-tabellen.js` | Alle Tabellen | 5270 | 239 |
| `js/0980-pdf-erzeugung.js` | PDF-Erzeugung  | 5509 | 48 |
| `js/0990-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5557 | 280 |
| `js/1000-briefumschlag-c6.js` | Briefumschlag C6  | 5837 | 494 |
| `js/1010-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6331 | 498 |
| `js/1020-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6829 | 263 |
| `js/1030-statistik.js` | Statistik | 7092 | 74 |
| `js/1040-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7166 | 108 |
| `js/1050-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7274 | 281 |
| `js/1060-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7555 | 294 |
| `js/1070-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7849 | 136 |
| `js/1080-medien.js` | Medien | 7985 | 394 |
| `js/1090-webformulare.js` | Webformulare | 8379 | 278 |
| `js/1100-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8657 | 198 |
| `js/1110-produktlager.js` | Produktlager | 8855 | 549 |
| `js/1120-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9404 | 242 |
| `js/1130-sicherung.js` | Sicherung  | 9646 | 219 |
| `js/1140-sicherung-als-zip.js` | Sicherung als ZIP | 9865 | 318 |
| `js/1150-geraete-abgleich.js` | Geräte-Abgleich | 10183 | 69 |
| `js/1160-eingangskorb.js` | Eingangskorb | 10252 | 97 |
| `html/1170-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10349 | 1 |
| `js/1180-app-start.js` | app-start | 10350 | 0 |
| `html/1190-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10350 | 7 |
| `js/1200-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10357 | 12 |
| `html/1210-dokument-ende.html` | dokument-ende | 10369 | 2 |
