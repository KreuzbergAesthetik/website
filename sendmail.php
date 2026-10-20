<?php
// Mailversand für die Praxis-App. Auf den Webspace neben index.html legen.
// 1. TOKEN unten durch einen langen, zufälligen Code ersetzen und denselben Code in der App unter Praxisdaten eintragen.
// 2. ORIGIN auf die Adresse setzen, unter der die App läuft.
$TOKEN  = 'HIER-LANGEN-ZUFAELLIGEN-CODE-EINTRAGEN';
$FROM   = 'manuel.fella@kreuzberg-aesthetik.de';
$ORIGIN = 'https://www.kreuzberg-aesthetik.de';
$LIMIT  = 30; // maximal so viele Mails pro Stunde

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $ORIGIN);
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
function fail($code, $msg) { http_response_code($code); echo json_encode(['ok' => false, 'error' => $msg]); exit; }

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail(405, 'Nur POST erlaubt.');
if ($TOKEN === 'HIER-LANGEN-ZUFAELLIGEN-CODE-EINTRAGEN') fail(500, 'sendmail.php ist noch nicht eingerichtet (Token fehlt).');

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in) || !hash_equals($TOKEN, (string)($in['token'] ?? ''))) fail(403, 'Zugangscode falsch.');

$an = trim((string)($in['an'] ?? ''));
$betreff = trim((string)($in['betreff'] ?? ''));
$text = (string)($in['text'] ?? '');
if (!filter_var($an, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $an)) fail(400, 'Ungültige Empfängeradresse.');
if ($betreff === '' || preg_match('/[\r\n]/', $betreff) || strlen($betreff) > 200) fail(400, 'Ungültiger Betreff.');
if (strlen($text) > 20000) fail(400, 'Nachricht zu lang.');

// einfache Begrenzung gegen Missbrauch
$f = sys_get_temp_dir() . '/ka_mail_rate.json';
$now = time(); $log = [];
if (is_file($f)) { $log = json_decode((string)file_get_contents($f), true) ?: []; }
$log = array_values(array_filter($log, function ($t) use ($now) { return $t > $now - 3600; }));
if (count($log) >= $LIMIT) fail(429, 'Zu viele Mails in der letzten Stunde.');

$headers = "From: $FROM\r\nReply-To: $FROM\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit";
$subj = '=?UTF-8?B?' . base64_encode($betreff) . '?=';
if (!mail($an, $subj, str_replace("\r\n", "\n", $text), $headers, '-f' . $FROM)) fail(500, 'Der Server konnte die Mail nicht senden.');
$log[] = $now; @file_put_contents($f, json_encode($log));
echo json_encode(['ok' => true]);
