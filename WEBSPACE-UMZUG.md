# Entwurf: App auf eigenem Webspace (IONOS) statt GitHub Pages

Stand 08.11.2026. Entwurf zur Entscheidung, noch nichts umgesetzt.

## Ausgangslage

- Die App ist rein statisch (HTML, JS, CSS, Service Worker). Alle Pfade sind relativ. Sie läuft auf jedem Webserver, der Dateien über HTTPS ausliefert. PHP oder eine Datenbank braucht die App selbst nicht.
- Von GitHub Pages hängt nur ab: die Auslieferung, die `ERLAUBT`-Liste im Server-Snippet (`https://kreuzbergaesthetik.github.io`) und die Adresse, unter der Patienten die Formulare öffnen.
- Der Server (`www.kreuzberg-aesthetik.de`: WordPress, `wp-json/ka/v1/…`, `sendmail.php`) liegt schon bei IONOS. Die App spricht ihn bereits an. Die Content-Security-Policy erlaubt Verbindungen zu `www.kreuzberg-aesthetik.de` und `kreuzberg-aesthetik.de`.

## Empfehlung

**Eigene Subdomain `app.kreuzberg-aesthetik.de`, getrennt von WordPress.**

Warum nicht ein Unterordner (`www.kreuzberg-aesthetik.de/app/`)? Im selben Ursprung (gleiche Domain, gleicher Browser-Speicher) teilen sich WordPress samt Plugins und die Praxis-App den lokalen Speicher. Ein Fehler oder eine Lücke in einem WordPress-Plugin könnte dann Akten im Browser erreichen. Eine eigene Subdomain trennt das sauber.

Vorgehen bei IONOS:
1. Subdomain `app` anlegen, eigenes Verzeichnis (nicht im WordPress-Ordner), HTTPS-Zertifikat aktivieren.
2. Dateien hochladen (Liste unten).
3. `.htaccess` mit Kopfzeilen (unten) ablegen.
4. In `formular-empfang-wordpress.txt` die Liste `ERLAUBT` um `https://app.kreuzberg-aesthetik.de` ergänzen und das Snippet in WPCode neu einfügen. Dasselbe in `formular-empfang.php`, falls im Einsatz.
5. `sendmail.php`: unter „Adresse von sendmail.php“ in den Einstellungen die Adresse prüfen. Sie bleibt `https://www.kreuzberg-aesthetik.de/app/sendmail.php`, solange die Datei dort liegt.
6. Sicherung übertragen (siehe „Umzug der Daten“) und alles prüfen. Erst danach die alte Adresse nicht mehr verwenden.

## Umzug der Daten (wichtig)

Browser-Speicher gilt pro Adresse. Eine neue Adresse startet leer:

- Akten, Dateien, Einstellungen: im alten Gerät **Praxis → Sicherung** mit Passwort erstellen, unter der neuen Adresse **Laden**.
- Passkey: ist an den Hostnamen gebunden (`location.hostname`). Unter der neuen Adresse neu einrichten, das Passwort bleibt der Weg zurück.
- Geräte-Abgleich: pro Gerät neu verbinden, danach gleicht er wieder ab. Alternativ nach dem Laden der Sicherung auf einem Gerät die anderen Geräte über den Abgleich befüllen.
- Installierte App (Startbildschirm): neu installieren, die alte bleibt an der alten Adresse.
- Bereits verschickte Formular-Links (zum Beispiel `…github.io/anmeldung.html`) funktionieren nur, solange GitHub Pages erreichbar ist. Offene Frage: Sind Links in Umlauf, die Patienten noch nutzen?

Die alte Adresse bleibt unverändert, bis die neue geprüft ist. Auf dem Tablet **vor** dem Umzug sichern.

## Dateien für den Upload

Hoch: `index.html`, `sw.js`, `manifest.webmanifest`, alle `*.js` und `forms.css` im Hauptordner (`docs.js`, `dialoge.js`, `sync.js`, `extcal.js`, `forms.js`, `ftexte.js`, `pdf-lib.min.js`, `pdfjs.min.js`, `pdfjs.worker.min.js`), `anmeldung.html`, `anamnese.html`, `erinnerung.html`, `aufklaerung.html`, `info.html`, `postfachtest.html`, die vier Icons (`*.png`).

Nicht hoch: `tests/`, `node_modules/`, `werkzeuge/`, `quellcode-aufgeteilt/`, `.github/`, `package*.json`, `*.md`, `LIESMICH.txt`, `formular-empfang*.php/.txt`, `sendmail.php` (die liegen im WordPress-Verzeichnis, nicht bei der App).

Bei jeder neuen Version müssen `V` in `sw.js` und `KA_V` in `index.html` gleich sein. Beim Upload `sw.js` zuletzt hochladen, damit die App nie einen halben Stand ausliefert.

## Entwurf `.htaccess` (IONOS, Apache)

```apache
# Service Worker und Einstiegsseite nie lange zwischenspeichern
<FilesMatch "^(sw\.js|index\.html|manifest\.webmanifest)$">
  Header set Cache-Control "no-cache"
</FilesMatch>
AddType application/manifest+json .webmanifest

# Zusätzlicher Schutz, den die Meta-Tags der Seiten nicht leisten können
Header always set Strict-Transport-Security "max-age=31536000"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "no-referrer"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
Header always set Content-Security-Policy "frame-ancestors 'none'"
Header always set X-Robots-Tag "noindex, nofollow"
```

Das `frame-ancestors` verhindert, dass die App in fremde Seiten eingebettet wird. Das geht nur per Header, nicht per Meta-Tag. Das ist ein Vorteil gegenüber GitHub Pages. Die vorhandene Policy in den Seiten bleibt zusätzlich bestehen. Die Kopfzeile `X-Robots-Tag` hält die Seiten aus Suchmaschinen heraus. Das gilt auch für die Formularseiten, die nur per Link aufgerufen werden. Bitte prüfen, ob das gewollt ist.

## Veröffentlichung künftig

- **Ohne GitHub (sofort möglich):** Ein Skript erzeugt einen Ordner mit genau der Dateiliste oben (und prüft die Versionsgleichheit). Du lädst ihn per SFTP oder im IONOS-Dateimanager hoch. Das baue ich bei Bedarf in `werkzeuge/`.
- **Mit GitHub (nach Freischaltung):** Dieselbe GitHub-Actions-Weiterleitung per SFTP wie beim WordPress-Theme. Das Skript liefert die Dateiliste. Zugangsdaten gehören als GitHub-Secrets in das Repository, nie in den Code.
- GitHub bleibt dann nur noch Ablage und Test, nicht mehr Voraussetzung für den Betrieb.

## Risiken und offene Entscheidungen

1. **Subdomain oder Unterordner?** Empfohlen: Subdomain.
2. **Formular-Links in Umlauf?** Dann sollte GitHub Pages bis zur Umstellung der Links erreichbar bleiben. Ohne Zugang geht das nicht. Alternativ neue Links an Patienten schicken oder die Links in der Seite „Praxis“ neu erzeugen.
3. **Sicherung vor dem Umzug** auf jedem Gerät, mit Passwort, auf einem Datenträger außerhalb des Browsers.
4. **Server-Snippet neu einfügen** (WPCode), sonst blockiert der Server Absendungen von der neuen Adresse.
5. **Auftragsverarbeitung:** Der Webspace liefert nur Programmdateien aus, keine Patientendaten. Formular-Postfach und Sync-Server liegen ohnehin schon bei IONOS. Der Vertrag zur Auftragsverarbeitung mit IONOS sollte vorliegen.
