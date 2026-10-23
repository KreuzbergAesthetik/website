<?php
/*
 * Empfang für die Webformulare von Kreuzberg Ästhetik.
 *
 * Nimmt das ausgefüllte PDF (mit eingebetteten Formulardaten) entgegen und schickt es per E-Mail an die Praxis.
 * Diese Datei gehört auf den Webspace der Praxis-Website (bei WordPress in den Hauptordner, neben wp-config.php).
 * Danach in forms.js bei ENDPOINT die Adresse dieser Datei eintragen, z. B.
 *   var ENDPOINT = 'https://www.kreuzberg-aesthetik.de/formular-empfang.php';
 *
 * Es wird nichts gespeichert. Das PDF geht direkt als Anhang per Mail weiter.
 */

$EMPFAENGER = 'info@kreuzberg-aesthetik.de';           // Hierhin gehen die Formulare
$ERLAUBT    = ['https://fellamanuel-arch.github.io'];            // Seiten, die senden dürfen (Adresse der Formulare)
$MAX_BYTES  = 8 * 1024 * 1024;                                   // größtes erlaubtes PDF

header('Content-Type: application/json; charset=utf-8');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin && in_array($origin, $ERLAUBT, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function fail($code, $msg) { http_response_code($code); echo json_encode(['ok' => false, 'error' => $msg]); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail(405, 'Nur POST erlaubt.');
if ($origin && !in_array($origin, $ERLAUBT, true)) fail(403, 'Nicht erlaubt.');
if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; }   // Spam-Falle: Menschen lassen das Feld leer

$typ = $_POST['typ'] ?? '';
$labels = ['anmeldung' => 'Patientenanmeldung', 'anamnese' => 'Anamnese'];
if (!isset($labels[$typ])) fail(400, 'Unbekanntes Formular.');
if (!isset($_FILES['pdf']) || $_FILES['pdf']['error'] !== UPLOAD_ERR_OK) fail(400, 'Das PDF fehlt.');
if ($_FILES['pdf']['size'] > $MAX_BYTES) fail(413, 'Das PDF ist zu groß.');
$pdf = file_get_contents($_FILES['pdf']['tmp_name']);
if (substr($pdf, 0, 4) !== '%PDF') fail(400, 'Das ist kein PDF.');

$name = trim(preg_replace('/[^\p{L}\p{N} ._,\-]/u', '', $_POST['name'] ?? ''));
if ($name === '') $name = 'ohne Namen';
$fname = preg_replace('/[^A-Za-z0-9._\-]/', '_', $_FILES['pdf']['name'] ?: 'formular.pdf');
$betreff = 'Neues Formular: ' . $labels[$typ] . ' - ' . $name;
$text = "Über die Website wurde ein Formular ausgefüllt:\n\n" . $labels[$typ] . "\nPatient: " . $name . "\nZeitpunkt: " . date('d.m.Y H:i') . "\n\n"
      . "Das PDF hängt an. Zum Übernehmen in die Praxis-App: PDF speichern, in der App unter Patienten auf Import tippen und die Datei wählen.\n";

$gesendet = false;
$wp = __DIR__ . '/wp-load.php';
if (file_exists($wp)) {
    /* WordPress: nutzt die dort eingerichtete Mailkonfiguration (zuverlässiger als das einfache PHP-Mailen) */
    require_once $wp;
    $tmp = sys_get_temp_dir() . '/' . uniqid('form_', true) . '_' . $fname;
    file_put_contents($tmp, $pdf);
    $gesendet = wp_mail($EMPFAENGER, $betreff, $text, ['Content-Type: text/plain; charset=UTF-8'], [$tmp]);
    @unlink($tmp);
} else {
    $b = md5(uniqid('', true));
    $kopf = "From: Webformular <" . $EMPFAENGER . ">\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"$b\"";
    $body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" . $text . "\r\n"
          . "--$b\r\nContent-Type: application/pdf; name=\"$fname\"\r\nContent-Transfer-Encoding: base64\r\nContent-Disposition: attachment; filename=\"$fname\"\r\n\r\n"
          . chunk_split(base64_encode($pdf)) . "--$b--";
    $gesendet = mail($EMPFAENGER, '=?UTF-8?B?' . base64_encode($betreff) . '?=', $body, $kopf);
}
if (!$gesendet) fail(500, 'Die E-Mail konnte nicht gesendet werden.');
echo json_encode(['ok' => true]);
