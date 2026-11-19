# Aufgeteilte Kopie von index.html

**Nur zum Lesen und Nachschlagen.** Die App lädt diese Dateien nicht. Maßgeblich bleibt `index.html`.
Änderungen gehören weiterhin in `index.html`; danach die Kopie neu erzeugen:

```
node werkzeuge/code-aufteilen.mjs            # neu erzeugen
node werkzeuge/code-aufteilen.mjs --pruefen  # prüfen, ob die Kopie aktuell ist
```

Die Teile sind verlustfrei: In der Reihenfolge aus `teile.json` aneinandergehängt ergeben sie exakt `index.html`
(SHA-256 `973e87da5f305167…`). Die Nummern im Dateinamen geben diese Reihenfolge an.

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
| `css/0230-patientenliste-quer.css` | Patientenliste quer | 1213 | 52 |
| `css/0240-handy-hochkant-bis-699-px.css` | Handy hochkant (bis 699 px) | 1265 | 63 |
| `css/0250-verlaeufe-der-praxis-website.css` | Verläufe der Praxis-Website | 1328 | 12 |
| `html/0260-oberflaeche-rahmen.html` | oberflaeche-rahmen | 1340 | 5 |
| `js/0270-sperre-sofort-aktivieren.js` | sperre-sofort-aktivieren | 1345 | 0 |
| `html/0280-oberflaeche-body-applock.html` | oberflaeche-body-applock | 1345 | 13 |
| `js/0290-speicher-mit-verpflichtender-verschluesselung.js` | Speicher mit verpflichtender Verschlüsselung  | 1358 | 275 |
| `html/0300-oberflaeche-header-btn-kalender.html` | oberflaeche-header-btn-kalender | 1633 | 17 |
| `html/0310-handy-hochkant-hauptnavigation-unten-daumenreich.html` | Handy hochkant: Hauptnavigation unten (Daumenreichweite); Tablet und Querformat behalten die Reiter oben | 1650 | 28 |
| `html/0320-seite-start.html` | seite START | 1678 | 47 |
| `html/0330-seite-patienten.html` | seite PATIENTEN | 1725 | 28 |
| `html/0340-seite-rechnungen.html` | seite RECHNUNGEN | 1753 | 30 |
| `html/0350-seite-leistungen.html` | seite LEISTUNGEN | 1783 | 33 |
| `html/0360-seite-dokumente.html` | seite DOKUMENTE | 1816 | 19 |
| `html/0370-seite-zahlungen.html` | seite ZAHLUNGEN | 1835 | 22 |
| `html/0380-seite-praxisdaten.html` | seite PRAXISDATEN | 1857 | 47 |
| `html/0390-seite-nachrichtenvorlagen.html` | seite NACHRICHTENVORLAGEN | 1904 | 15 |
| `html/0400-seite-webformulare.html` | seite WEBFORMULARE | 1919 | 18 |
| `html/0410-seite-sicherung.html` | seite SICHERUNG | 1937 | 14 |
| `html/0420-seite-geraete-abgleich.html` | seite GERÄTE-ABGLEICH | 1951 | 48 |
| `html/0430-seite-textbausteine.html` | seite TEXTBAUSTEINE | 1999 | 9 |
| `html/0440-seite-todos.html` | seite TODOS | 2008 | 16 |
| `html/0450-seite-statistik.html` | seite STATISTIK | 2024 | 34 |
| `html/0460-seite-lager.html` | seite LAGER | 2058 | 20 |
| `html/0470-fenster-neuer-patient.html` | fenster NEUER PATIENT | 2078 | 25 |
| `html/0480-fenster-neuer-termin.html` | fenster NEUER TERMIN | 2103 | 43 |
| `html/0490-fenster-patientenakte.html` | fenster PATIENTENAKTE | 2146 | 71 |
| `html/0500-schwebender-aktionsknopf-der-akte-eigene-ebene-v.html` | Schwebender Aktionsknopf der Akte (eigene Ebene, verschiebt das Layout nicht) | 2217 | 10 |
| `html/0510-fenster-termin-ansehen.html` | fenster TERMIN ANSEHEN | 2227 | 7 |
| `html/0520-fenster-rechnungen-importieren.html` | fenster RECHNUNGEN IMPORTIEREN | 2234 | 17 |
| `html/0530-fenster-dokumentation-zu-termin.html` | fenster DOKUMENTATION ZU TERMIN | 2251 | 10 |
| `html/0540-fenster-rezept.html` | fenster REZEPT | 2261 | 23 |
| `html/0550-fenster-rechnung-erstellen.html` | fenster RECHNUNG ERSTELLEN | 2284 | 54 |
| `html/0560-fenster-leistungskategorie.html` | fenster LEISTUNGSKATEGORIE | 2338 | 27 |
| `html/0570-fenster-leistung.html` | fenster LEISTUNG | 2365 | 31 |
| `html/0580-fenster-altsystem-import.html` | fenster ALTSYSTEM-IMPORT | 2396 | 20 |
| `html/0590-fenster-unterschrift.html` | fenster UNTERSCHRIFT | 2416 | 15 |
| `html/0600-fenster-ausgabe.html` | fenster AUSGABE | 2431 | 18 |
| `html/0610-fenster-nachrichtenvorlage.html` | fenster NACHRICHTENVORLAGE | 2449 | 37 |
| `html/0620-fenster-platzhalter.html` | fenster PLATZHALTER | 2486 | 15 |
| `html/0630-fenster-anrede.html` | fenster ANREDE | 2501 | 16 |
| `html/0640-fenster-textbaustein.html` | fenster TEXTBAUSTEIN | 2517 | 14 |
| `html/0650-fenster-vorlage.html` | fenster VORLAGE | 2531 | 33 |
| `html/0660-fenster-rechnungen-pruefen.html` | fenster RECHNUNGEN PRÜFEN | 2564 | 9 |
| `html/0670-fenster-rechnung-ansehen.html` | fenster RECHNUNG ANSEHEN | 2573 | 18 |
| `html/0680-fenster-zahlung.html` | fenster ZAHLUNG | 2591 | 15 |
| `html/0690-fenster-sicherung.html` | fenster SICHERUNG | 2606 | 15 |
| `html/0700-fenster-fortschritt.html` | fenster FORTSCHRITT | 2621 | 11 |
| `html/0710-fenster-sicherung-entschluesseln.html` | fenster SICHERUNG ENTSCHLÜSSELN | 2632 | 10 |
| `html/0720-fenster-dokumentation.html` | fenster DOKUMENTATION | 2642 | 12 |
| `html/0730-fenster-todo.html` | fenster TODO | 2654 | 19 |
| `html/0740-fenster-webformular-texte.html` | fenster WEBFORMULAR-TEXTE | 2673 | 14 |
| `html/0750-fenster-webformular-felder.html` | fenster WEBFORMULAR-FELDER | 2687 | 12 |
| `html/0760-fenster-webformular-visuell-bearbeiten.html` | fenster WEBFORMULAR VISUELL BEARBEITEN | 2699 | 12 |
| `html/0770-fenster-produkt.html` | fenster PRODUKT | 2711 | 48 |
| `html/0780-fenster-ausbuchen.html` | fenster AUSBUCHEN | 2759 | 13 |
| `html/0790-fenster-wareneingang.html` | fenster WARENEINGANG | 2772 | 20 |
| `html/0800-fenster-produkt-verwenden.html` | fenster PRODUKT VERWENDEN | 2792 | 16 |
| `html/0810-fenster-akten-zusammenlegen.html` | fenster AKTEN ZUSAMMENLEGEN | 2808 | 12 |
| `html/0820-fenster-datum-und-uhrzeit.html` | fenster DATUM UND UHRZEIT | 2820 | 9 |
| `html/0830-fenster-produktbuchung-bearbeiten.html` | fenster PRODUKTBUCHUNG BEARBEITEN | 2829 | 19 |
| `html/0840-fenster-e-mail.html` | fenster E-MAIL | 2848 | 14 |
| `html/0850-fenster-bild-gross.html` | fenster BILD GROSS | 2862 | 11 |
| `html/0860-fenster-zuordnen.html` | fenster ZUORDNEN | 2873 | 10 |
| `js/0870-app-grundlagen-und-navigation.js` | app-grundlagen-und-navigation | 2883 | 224 |
| `js/0880-hinweise-an-patienten.js` | Hinweise an Patienten | 3107 | 358 |
| `js/0890-globale-suche-im-kopfbereich.js` | Globale Suche im Kopfbereich | 3465 | 152 |
| `js/0900-kalender.js` | Kalender | 3617 | 289 |
| `js/0910-startseite.js` | Startseite | 3906 | 280 |
| `js/0920-patienten-termine-doku.js` | Patienten, Termine, Doku | 4186 | 84 |
| `js/0930-dateispeicher.js` | Dateispeicher  | 4270 | 60 |
| `js/0940-rechnungen.js` | Rechnungen | 4330 | 54 |
| `js/0950-leistungskategorien.js` | Leistungskategorien  | 4384 | 148 |
| `js/0960-goae.js` | GOÄ | 4532 | 801 |
| `js/0970-alle-tabellen.js` | Alle Tabellen | 5333 | 239 |
| `js/0980-pdf-erzeugung.js` | PDF-Erzeugung  | 5572 | 48 |
| `js/0990-qr-code-erzeugung.js` | QR-Code-Erzeugung  | 5620 | 280 |
| `js/1000-briefumschlag-c6.js` | Briefumschlag C6  | 5900 | 494 |
| `js/1010-doppelte-akten-zusammenlegen.js` | Doppelte Akten zusammenlegen | 6394 | 498 |
| `js/1020-dokumentation-eines-termins.js` | Dokumentation eines Termins  | 6892 | 263 |
| `js/1030-statistik.js` | Statistik | 7155 | 74 |
| `js/1040-zahlungen-und-ausgaben.js` | Zahlungen und Ausgaben | 7229 | 108 |
| `js/1050-nachrichtenvorlagen-und-textbausteine.js` | Nachrichtenvorlagen und Textbausteine | 7337 | 281 |
| `js/1060-kategorien-und-vorlagen.js` | Kategorien und Vorlagen | 7618 | 294 |
| `js/1070-unterschrift-am-tablet-in-die-original-pdf-geste.js` | Unterschrift am Tablet, in die Original-PDF gestempelt | 7912 | 136 |
| `js/1080-medien.js` | Medien | 8048 | 394 |
| `js/1090-webformulare.js` | Webformulare | 8442 | 278 |
| `js/1100-rechnungen-aus-pdf-importieren.js` | Rechnungen aus PDF importieren  | 8720 | 198 |
| `js/1110-produktlager.js` | Produktlager | 8918 | 549 |
| `js/1120-import-von-patienten-zips-aus-dem-altsystem.js` | Import von Patienten-ZIPs aus dem Altsystem  | 9467 | 242 |
| `js/1130-sicherung.js` | Sicherung  | 9709 | 219 |
| `js/1140-sicherung-als-zip.js` | Sicherung als ZIP | 9928 | 318 |
| `js/1150-geraete-abgleich.js` | Geräte-Abgleich | 10246 | 69 |
| `js/1160-eingangskorb.js` | Eingangskorb | 10315 | 97 |
| `html/1170-oberflaeche-rahmen.html` | oberflaeche-rahmen | 10412 | 1 |
| `js/1180-app-start.js` | app-start | 10413 | 0 |
| `html/1190-oberflaeche-ks-bar.html` | oberflaeche-ks-bar | 10413 | 7 |
| `js/1200-offline-speicher-mit-update-bestaetigung.js` | Offline-Speicher mit Update-Bestätigung | 10420 | 12 |
| `html/1210-dokument-ende.html` | dokument-ende | 10432 | 2 |
