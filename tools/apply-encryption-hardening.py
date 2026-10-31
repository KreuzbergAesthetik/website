from pathlib import Path
import re

index = Path('index.html')
s = index.read_text(encoding='utf-8')


def sub1(pattern, repl, label, flags=re.S):
    global s
    s2, n = re.subn(pattern, repl, s, count=1, flags=flags)
    if n != 1:
        raise SystemExit(f'{label}: erwartet 1 Treffer, gefunden {n}')
    s = s2

# Sperrbildschirm kann beim ersten Start zugleich die Verschlüsselung einrichten.
sub1(
    r'<div id="applock"><form class="al-box" onsubmit="alUnlock\(event\)" autocomplete="off">[\s\S]*?</form></div>',
    '''<div id="applock"><form class="al-box" onsubmit="alUnlock(event)" autocomplete="off">
  <img src="icon-192.png" alt="">
  <h2 id="al-title">Kreuzberg Ästhetik</h2>
  <div id="al-hint" style="display:none; font-size:13px; color:#64748b; line-height:1.45; margin:-4px 0 12px;"></div>
  <input type="password" id="al-pw" class="form-control" placeholder="Passwort" autocomplete="current-password" aria-label="Passwort">
  <input type="password" id="al-pw2" class="form-control" placeholder="Passwort wiederholen" autocomplete="new-password" aria-label="Passwort wiederholen" style="display:none; margin-top:8px;">
  <div class="al-msg" id="al-msg"></div>
  <button type="submit" class="btn btn-save" id="al-submit" style="width:100%; margin-top:6px;">Entsperren</button>
</form></div>''',
    'Sperrbildschirm'
)

# Kein ungeschütztes Aufblitzen beim ersten Start.
sub1(
    r'<script>try \{ if \(localStorage\.getItem\(\'ka_lock\'\)\) document\.documentElement\.classList\.add\(\'locked\'\); \} catch \(e\) \{\}</script>',
    "<script>try { document.documentElement.classList.add('locked'); } catch (e) {}</script>",
    'Frühe Sperre',
    flags=0
)

# Entsperren plus automatische Migration des bisherigen Klartext-Zustands.
sub1(
    r'function alLockNow\(\) \{[\s\S]*?\nfunction alArm\(\) \{',
    '''function alPrepare() {
  var c = alGet(), fresh = !c, inp = document.getElementById('al-pw'), inp2 = document.getElementById('al-pw2');
  var title = document.getElementById('al-title'), hint = document.getElementById('al-hint'), submit = document.getElementById('al-submit');
  if (!inp || !inp2 || !title || !hint || !submit) return;
  title.textContent = fresh ? 'Sicherheit einrichten' : 'Kreuzberg Ästhetik';
  hint.style.display = fresh ? '' : 'none';
  hint.textContent = fresh ? 'Lege einmalig ein Passwort mit mindestens 8 Zeichen fest. Patientendaten und Dateien werden damit auf diesem Gerät verschlüsselt.' : '';
  inp2.style.display = fresh ? '' : 'none'; inp2.value = '';
  inp.autocomplete = fresh ? 'new-password' : 'current-password';
  submit.textContent = fresh ? 'Verschlüsselung aktivieren' : (c && !c.enc ? 'Entsperren & verschlüsseln' : 'Entsperren');
}
function alLockNow() {
  if (!alGet()) return;
  document.querySelectorAll('.modal-overlay.active').forEach(function (m) { m.dataset.dirty = ''; });
  document.documentElement.classList.add('locked');
  document.getElementById('al-pw').value = ''; document.getElementById('al-msg').textContent = ''; alPrepare();
  setTimeout(function () { document.getElementById('al-pw').focus(); }, 50);
}
async function alActivateEncryption(pw, min) {
  var raw = crypto.getRandomValues(new Uint8Array(32)), salt = alHex(crypto.getRandomValues(new Uint8Array(16)));
  KA.key = await alImportKey(raw);
  alPut({ enc: true, salt: salt, wrap: await alWrap(pw, raw, salt), min: Number.isFinite(+min) ? +min : 5, sweep: true });
  await kaLoadAll(); await kaIdle();
  return raw;
}
async function alUnlock(ev) {
  ev.preventDefault();
  var msg = document.getElementById('al-msg'), inp = document.getElementById('al-pw'), inp2 = document.getElementById('al-pw2'), c = alGet();
  var wait = Math.ceil((alUntil - Date.now()) / 1000);
  if (wait > 0) { msg.textContent = 'Bitte ' + wait + ' Sekunden warten.'; return; }
  if (!c) {
    if (!(window.crypto && crypto.subtle)) { msg.textContent = 'Dieser Browser unterstützt die Verschlüsselung nicht.'; return; }
    if (inp.value.length < 8) { msg.textContent = 'Das Passwort braucht mindestens 8 Zeichen.'; return; }
    if (inp.value !== inp2.value) { msg.textContent = 'Die beiden Passwörter sind nicht gleich.'; return; }
    msg.textContent = 'Daten werden verschlüsselt …';
    try { await alActivateEncryption(inp.value, 5); c = alGet(); }
    catch (e) { KA.key = null; msg.textContent = 'Die Verschlüsselung konnte nicht eingerichtet werden. Bitte erneut versuchen.'; return; }
  } else if (!c.enc) {
    var okLegacy = false;
    try { okLegacy = await alCheck(inp.value); } catch (e) {}
    if (!okLegacy) {
      alFails++; inp.value = ''; msg.textContent = 'Passwort falsch.';
      if (alFails >= 3) { alUntil = Date.now() + Math.min(60, Math.pow(2, alFails - 2)) * 1000; msg.textContent = 'Passwort falsch. Bitte kurz warten.'; }
      return;
    }
    msg.textContent = 'Bestehende Daten werden verschlüsselt …';
    try { await alActivateEncryption(inp.value, c.min); c = alGet(); }
    catch (e) { KA.key = null; msg.textContent = 'Die Verschlüsselung konnte nicht abgeschlossen werden. Bitte erneut entsperren.'; return; }
  } else {
    var raw = null;
    try { raw = await alUnwrap(inp.value, c); } catch (e) {}
    if (!raw) {
      alFails++; inp.value = ''; msg.textContent = 'Passwort falsch.';
      if (alFails >= 3) { alUntil = Date.now() + Math.min(60, Math.pow(2, alFails - 2)) * 1000; msg.textContent = 'Passwort falsch. Bitte kurz warten.'; }
      return;
    }
    if (!KA.enc) {
      try { KA.key = await alImportKey(raw); await kaLoadAll(); await kaIdle(); }
      catch (e) { KA.key = null; msg.textContent = 'Die Daten konnten nicht gelesen werden.'; return; }
    }
  }
  alFails = 0; inp.value = ''; inp2.value = ''; msg.textContent = '';
  if (!KA.booted) kaBoot(false);
  document.documentElement.classList.remove('locked'); alArm();
  c = alGet(); if (c && c.enc && c.sweep) kaFilesToEnc().catch(function () {});
}
function alArm() {''',
    'Entsperrlogik'
)

# Sicherheitseinstellungen zeigen nur noch den geschützten Zustand.
sub1(
    r'function alUi\(\) \{[\s\S]*?\n\}\nasync function alSet\(\) \{',
    '''function alUi() {
  var c = alGet();
  document.getElementById('al-info').textContent = c && c.enc
    ? 'Sperre und Verschlüsselung sind eingeschaltet. Alle Patientendaten, Fotos und Dateien auf diesem Gerät werden verschlüsselt gespeichert.'
    : 'Die Verschlüsselung wird beim nächsten Entsperren automatisch eingerichtet.';
  document.getElementById('al-curg').style.display = c ? '' : 'none';
  document.getElementById('al-warn').textContent = 'Ohne das Passwort lassen sich die Daten nicht wieder herstellen. Es gibt keine „Passwort vergessen“-Funktion. Bitte regelmäßig verschlüsselt sichern und das Passwort an einem sicheren Ort aufbewahren.';
  document.getElementById('al-min').value = String(c ? c.min : 5);
  ['al-cur', 'al-new', 'al-new2'].forEach(function (i) { document.getElementById(i).value = ''; });
  document.getElementById('al-btn').style.display = c ? '' : 'none';
}
async function alSet() {''',
    'Sicherheitsanzeige'
)

sub1(
    r'async function alSet\(\) \{[\s\S]*?\n\}\nfunction alSetMin',
    '''async function alSet() {
  var c = alGet(), n = document.getElementById('al-new').value;
  if (!c || !c.enc) { alert('Die Verschlüsselung muss zuerst beim Start der App eingerichtet werden.'); return; }
  if (!(window.crypto && crypto.subtle)) { alert('Dieser Browser unterstützt die Verschlüsselung nicht.'); return; }
  var cur = document.getElementById('al-cur').value, raw = null;
  try { raw = await alUnwrap(cur, c); } catch (e) {}
  if (!raw) { alert('Das aktuelle Passwort stimmt nicht.'); return; }
  if (n.length < 8) { alert('Das neue Passwort braucht mindestens 8 Zeichen.'); return; }
  if (n !== document.getElementById('al-new2').value) { alert('Die beiden neuen Passwörter sind nicht gleich.'); return; }
  var salt = alHex(crypto.getRandomValues(new Uint8Array(16))), min = +document.getElementById('al-min').value;
  alPut({ enc: true, salt: salt, wrap: await alWrap(n, raw, salt), min: min, sweep: c.sweep });
  alUi(); alArm(); alert('Das Passwort wurde geändert.');
}
function alSetMin''',
    'Passwortänderung'
)

# Entschlüsseln oder Entfernen der Sperre ist für Praxisdaten nicht mehr möglich.
sub1(
    r'async function alDecryptAll\(silent\) \{[\s\S]*?\n\}\nasync function alRemove\(\) \{[\s\S]*?\n\}\n/\* Start:',
    '''async function alDecryptAll() {
  alert('Die lokale Verschlüsselung ist für Praxisdaten verpflichtend und kann nicht deaktiviert werden.');
  return false;
}
async function alRemove() {
  alert('App-Sperre und Verschlüsselung sind für Praxisdaten verpflichtend und können nicht deaktiviert werden.');
  return false;
}
/* Start:''',
    'Deaktivierungsschutz'
)

# Die App startet immer hinter dem Sicherheitsbildschirm.
sub1(
    r'function kaStart\(\) \{[\s\S]*?\n\}',
    '''function kaStart() {
  document.documentElement.classList.add('locked');
  alPrepare();
  setTimeout(function () { document.getElementById('al-pw').focus(); }, 50);
}''',
    'Startlogik'
)

# Sicherheitseinstellungen vereinfachen.
sub1(
    r'<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;"><button type="button" class="btn btn-save" onclick="alSet\(\)">Passwort festlegen</button><button type="button" class="btn btn-del" id="al-off" onclick="alRemove\(\)">Sperre entfernen</button></div>\s*<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;"><button type="button" class="btn btn-save" id="al-encb" onclick="alEncryptAll\(\)">Daten verschlüsseln</button><button type="button" class="btn btn-cancel" id="al-decb" onclick="alDecryptAll\(\)">Verschlüsselung aufheben</button></div>',
    '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;"><button type="button" class="btn btn-save" onclick="alSet()">Passwort ändern</button></div>',
    'Sicherheitsbuttons'
)
s = s.replace('Neues Passwort (mind. 6 Zeichen)', 'Neues Passwort (mind. 8 Zeichen)', 1)
s = s.replace('/* ===== Speicher mit optionaler Verschlüsselung (AES-GCM) und App-Sperre ===== */', '/* ===== Speicher mit verpflichtender Verschlüsselung (AES-GCM) und App-Sperre ===== */', 1)

# Version erhöhen.
if "var KA_V = '2026-11-01-o';" not in s:
    raise SystemExit('Unerwartete App-Version')
s = s.replace("var KA_V = '2026-11-01-o';", "var KA_V = '2026-11-01-p';", 1)
index.write_text(s, encoding='utf-8')

sw = Path('sw.js')
sw_text = sw.read_text(encoding='utf-8')
if "var V='2026-11-01-o'" not in sw_text:
    raise SystemExit('Unerwartete Service-Worker-Version')
sw.write_text(sw_text.replace("var V='2026-11-01-o'", "var V='2026-11-01-p'", 1), encoding='utf-8')

# Browser-Test: Ersteinrichtung durchlaufen und echte verschlüsselte Persistenz prüfen.
bp = Path('tests/browser-smoke.mjs')
b = bp.read_text(encoding='utf-8')
old = """  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });\n  await page.waitForFunction(() => window.KA && window.KA.booted === true, null, { timeout: 15000 });\n"""
new = """  await page.goto(base, { waitUntil: 'networkidle', timeout: 30000 });\n  await page.waitForSelector('#al-pw2', { state: 'visible', timeout: 10000 });\n  await page.fill('#al-pw', 'CiAppPasswort-123!');\n  await page.fill('#al-pw2', 'CiAppPasswort-123!');\n  await page.click('#al-submit');\n  await page.waitForFunction(() => window.KA && window.KA.booted === true && !document.documentElement.classList.contains('locked'), null, { timeout: 15000 });\n"""
if old not in b:
    raise SystemExit('Browser-Test Startblock nicht gefunden')
b = b.replace(old, new, 1)
old = """    out.booted = !!(window.KA && KA.booted);\n    out.functions = [\n"""
new = """    out.booted = !!(window.KA && KA.booted);\n    const lockCfg = JSON.parse(localStorage.getItem('ka_lock') || 'null');\n    out.mandatoryEncryption = !!lockCfg && lockCfg.enc === true && KA.enc === true;\n    out.noDisableControls = !document.getElementById('al-off') && !document.getElementById('al-encb') && !document.getElementById('al-decb');\n    out.functions = [\n"""
if old not in b:
    raise SystemExit('Browser-Test Sicherheitsblock nicht gefunden')
b = b.replace(old, new, 1)
old = """    persist();\n    const savedPatients = JSON.parse(kaGet('ka_patients') || '[]');\n    out.persist = savedPatients.some(p => p.id === 'ci-p1');\n"""
new = """    persist();\n    await kaIdle();\n    const savedPatients = JSON.parse(kaGet('ka_patients') || '[]');\n    const rawPatients = localStorage.getItem('ka_patients') || '';\n    out.persist = savedPatients.some(p => p.id === 'ci-p1') && rawPatients.startsWith('enc1:');\n"""
if old not in b:
    raise SystemExit('Browser-Test Persistenzblock nicht gefunden')
b = b.replace(old, new, 1)
bp.write_text(b, encoding='utf-8')

# Statische Invarianten für verpflichtende Verschlüsselung ergänzen.
sp = Path('tests/static-check.mjs')
t = sp.read_text(encoding='utf-8')
needle = """// 9) Manifest und zentrale PWA-Dateien müssen existieren und lesbar sein.\n"""
insert = """// 9) Lokale Praxisdaten müssen verpflichtend verschlüsselt werden.\nfor (const marker of ['function alPrepare()', 'async function alActivateEncryption(', \"document.documentElement.classList.add('locked')\", 'mindestens 8 Zeichen', 'verpflichtend und kann nicht deaktiviert werden']) {\n  assert.ok(html.includes(marker), `Verschlüsselungs-Invariante fehlt: ${marker}`);\n}\nassert.ok(!html.includes('>Sperre entfernen</button>'), 'Sperre darf nicht deaktivierbar sein');\nassert.ok(!html.includes('>Verschlüsselung aufheben</button>'), 'Verschlüsselung darf nicht deaktivierbar sein');\n\n// 10) Manifest und zentrale PWA-Dateien müssen existieren und lesbar sein.\n"""
if needle not in t:
    raise SystemExit('Static-Test Einfügepunkt nicht gefunden')
t = t.replace(needle, insert, 1)
sp.write_text(t, encoding='utf-8')

print('Encryption hardening applied')
