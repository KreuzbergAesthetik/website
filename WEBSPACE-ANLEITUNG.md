# Anleitung: Praxis-App auf IONOS (Subdomain app.kreuzberg-aesthetik.de)

Stand 08.11.2026. Die Menünamen bei IONOS können abweichen. Maßgeblich sind die Begriffe, nicht die Reihenfolge.

## Goldene Regeln

- Die Hauptdomain `kreuzberg-aesthetik.de` und die WordPress-Seite werden **nicht angefasst**. Nie „Ersetzen“, nie „Domain zurücksetzen“, nie „Bestehende Website verbinden“ (das verbindet mit WordPress und kann die Hauptdomain trennen).
- Die Subdomain muss auf einen **eigenen, neuen Ordner** im Webspace zeigen, nicht auf WordPress und nicht auf eine Weiterleitung.
- Echte Patientendaten kommen erst auf die neue Adresse, wenn alle Prüfpunkte unten bestanden sind.

## Stand

- Subdomain `app.kreuzberg-aesthetik.de` ist in „Domains & SSL“ angelegt, SSL-Zertifikat ist zugewiesen.
- Dort ist „Webspace verbinden“ für diese Subdomain **nicht verfügbar**. Offen: Zuweisung eines Ordners.

## Schritt 1: Subdomain einem Ordner zuweisen

1. IONOS → **Hosting** → den Webspace öffnen, auf dem WordPress liegt → Bereich **Domains**, **Subdomains** oder **Verzeichnisse**.
2. Subdomain `app` mit **neuem Ordner** `praxis-app` anlegen oder die vorhandene diesem Ordner zuweisen.
3. Wenn es dort nicht geht: den IONOS-Assistenten (Chat-Knopf) oder den Kundenservice fragen:

   > Ich habe die Subdomain app.kreuzberg-aesthetik.de angelegt. Ich möchte sie mit einem eigenen, neuen Ordner meines Webspace verbinden, nicht mit der WordPress-Installation und ohne die Hauptdomain zu ändern. Bei „Webspace verbinden“ steht „nicht verfügbar“. Wie geht das?

4. Danach: SSL-Zertifikat der Subdomain prüfen (Domains & SSL → SSL-Zertifikate). Wartezeit meist 5 bis 60 Minuten, selten bis 24 Stunden.

Prüfpunkt: `https://app.kreuzberg-aesthetik.de` lädt ohne Zertifikatswarnung (leere Seite oder „nicht gefunden“ ist hier in Ordnung) und `https://www.kreuzberg-aesthetik.de` lädt unverändert.

## Schritt 2: Dateien hochladen

1. ZIP `praxis-app-webspace-2026-11-08-a.zip` entpacken.
2. Webspace-Explorer im IONOS-Kundenbereich (oder SFTP) → Ordner `praxis-app` öffnen.
3. Alle Dateien hochladen, **auch `.htaccess`** (versteckte Dateien anzeigen).
4. `sw.js` zuletzt hochladen.

Prüfpunkt: `https://app.kreuzberg-aesthetik.de` zeigt die Anmeldeseite der App.

Bei einem 500-Fehler: `.htaccess` in `htaccess-aus.txt` umbenennen und neu laden. Die App läuft auch ohne sie.

## Schritt 3: Server-Snippet anpassen

1. `https://app.kreuzberg-aesthetik.de` in die Liste `ERLAUBT` von `formular-empfang-wordpress.txt` eintragen (macht Claude).
2. WordPress → **WPCode → Snippets** → bisheriges Snippet durch den neuen Text ersetzen, speichern.

Prüfpunkt: Ein Testformular mit erfundenen Daten von der neuen Adresse kommt im Postfach an.

## Schritt 4: Daten übertragen

1. Altes Gerät, alte Adresse: **Praxis → Sicherung** mit Passwort erstellen.
2. Neue Adresse öffnen, Passwort der App festlegen, Sicherung **laden**.
3. Passkey neu einrichten, Geräte-Abgleich neu verbinden, App neu auf dem Startbildschirm installieren.
4. Alte Adresse unverändert lassen, bis alles geprüft ist.

## Schritt 5: Alte Links

Alte Formular-Links (`…github.io/…`) laufen weiter, solange GitHub Pages ausliefert. Erst **nach** dem Umzug und der Prüfung der neuen Adresse:

1. `npm run webspace:weiterleitungen -- https://app.kreuzberg-aesthetik.de` erzeugt im Ordner `weiterleitungen/` sechs kleine Seiten (`anmeldung`, `anamnese`, `erinnerung`, `aufklaerung`, `info`, `postfachtest`). Sie springen auf dieselbe Seite der neuen Adresse und behalten `?c=…`, `?d=…` und `#…`.
2. Diese Dateien ersetzen auf GitHub Pages die gleichnamigen Seiten. Sie gehören nicht nach `main` und nicht in das Webspace-Paket.
3. `index.html` und `sw.js` bleiben auf Pages unverändert, damit die dort installierte App ihre Daten für die Sicherung weiter öffnen kann.
4. Prüfen: Einen alten Link mit erfundenem Code öffnen, er muss auf der neuen Adresse landen.
