/* ===== Geräte-Abgleich ===== */
function renderSicherung() {
  var lb = null; try { lb = kaGet('ka_lastbackup'); } catch (x) {}
  var el = document.getElementById('sk-state'); if (!el) return;
  if (!lb) { el.textContent = 'Noch keine Sicherung auf diesem Gerät'; el.style.color = '#b91c1c'; return; }
  var d = new Date(lb), days = Math.round((new Date(iso(new Date())) - new Date(iso(d))) / 86400000);
  el.textContent = 'Letzte Sicherung: ' + (days === 0 ? 'heute' : days === 1 ? 'gestern' : 'vor ' + days + ' Tagen') + ' um ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' Uhr';
  el.style.color = days >= 2 ? '#92400e' : '#15803d';
}
function calCopy() { var u = KS.calUrl(); copyText(u, function () { alert('Adresse kopiert.'); }, async function () { await kaPrompt('Adresse zum Kopieren:', u, { readonly: true, ok: 'Schließen', single: true }); }); }
async function calOffAsk() { if (await kaConfirm('Kalender ausschalten? Die Adresse wird ungültig, und der Kalender in Google verschwindet nach der nächsten Aktualisierung.')) KS.calOff(); }
function extSave() {
  var v = (document.getElementById('ext-url').value || '').trim(); if (!v) { alert('Bitte die Adresse einfügen.'); return; }
  settings.extUrl = v.replace(/^webcal:/i, 'https:'); persist(); EXT.ui(); EXT.refresh();
}
async function extOff() { if (!await kaConfirm('Privaten Kalender entfernen? Die Adresse wird aus der App gelöscht.')) return; settings.extUrl = ''; persist(); EXT.clear(); EXT.ui(); try { renderCal(); } catch (x) {} }
function extHide(on) { settings.extHide = !!on; persist(); EXT.ui(); try { renderCal(); } catch (x) {} }
function renderSync() { var m = document.getElementById('sy-msg'); if (m) m.textContent = ''; document.getElementById('sy-baks').innerHTML = ''; KS.ui(); EXT.ui(); }
async function syncGo(mode) {
  var pw = document.getElementById('sy-pw').value, m = document.getElementById('sy-msg'); m.className = ''; m.style.color = '#64748b';
  if (pw.length < 12) { m.style.color = '#b91c1c'; m.textContent = 'Das Passwort braucht mindestens 12 Zeichen.'; return; }
  m.textContent = 'Einen Moment, der Schlüssel wird berechnet …';
  try { if (mode === 'setup') await KS.setup(pw, document.getElementById('sy-code').value.trim()); else await KS.connect(pw); document.getElementById('sy-pw').value = ''; m.textContent = ''; }
  catch (e) { m.style.color = '#b91c1c'; m.textContent = e && e.message ? e.message : 'Das hat nicht geklappt.'; }
  KS.ui();
}
function syncPw() {
  var d = document.createElement('div'); d.className = 'modal-overlay active'; d.style.zIndex = 120;
  d.innerHTML = '<div class="modal-box"><div class="modal-header"><strong>Abgleich-Passwort ändern</strong></div>' +
    '<div class="form-group"><label>Aktuelles Passwort</label><input type="password" id="sp-old" class="form-control" autocomplete="current-password"></div>' +
    '<div class="form-group"><label>Neues Passwort (mindestens 12 Zeichen)</label><input type="password" id="sp-new" class="form-control" autocomplete="new-password"></div>' +
    '<div class="form-group"><label>Neues Passwort wiederholen</label><input type="password" id="sp-new2" class="form-control" autocomplete="new-password"></div>' +
    '<div class="form-group"><label>Einrichtungscode (nur falls im Server-Skript eingetragen)</label><input type="text" id="sp-code" class="form-control" autocomplete="off"></div>' +
    '<div class="hm-warn" style="margin-bottom:10px">Alles wird mit dem neuen Passwort neu verschlüsselt, der alte Bereich auf dem Server wird gelöscht. Andere Geräte tippen danach auf „Trennen“ und verbinden sich mit dem neuen Passwort. Notiere das neue Passwort, ohne es sind die Daten nicht mehr lesbar.</div>' +
    '<div id="sp-msg" style="font-size:13px;min-height:18px;margin-bottom:8px"></div>' +
    '<div class="foot-bar"><button type="button" class="btn btn-cancel" id="sp-no">Abbrechen</button><button type="button" class="btn btn-save" id="sp-ok">Ändern</button></div></div>';
  document.body.appendChild(d);
  var m = d.querySelector('#sp-msg'), ok = d.querySelector('#sp-ok'), no = d.querySelector('#sp-no');
  no.onclick = function () { d.remove(); };
  ok.onclick = async function () {
    var o = d.querySelector('#sp-old').value, n = d.querySelector('#sp-new').value, n2 = d.querySelector('#sp-new2').value;
    m.style.color = '#b91c1c';
    if (!o) { m.textContent = 'Bitte das aktuelle Passwort eingeben.'; return; }
    if (n.length < 12) { m.textContent = 'Das neue Passwort braucht mindestens 12 Zeichen.'; return; }
    if (n !== n2) { m.textContent = 'Die beiden neuen Passwörter sind nicht gleich.'; return; }
    ok.disabled = no.disabled = true; m.style.color = '#64748b'; m.textContent = 'Einen Moment, alles wird neu verschlüsselt …';
    try {
      var sauber = await KS.changePw(o, n, d.querySelector('#sp-code').value.trim());
      d.remove(); alert(sauber ? 'Das Passwort ist geändert. Auf anderen Geräten bitte „Trennen“ tippen und mit dem neuen Passwort verbinden.' : 'Das Passwort ist geändert. Der alte Bereich auf dem Server konnte nicht gelöscht werden, er ist aber mit dem alten Passwort verschlüsselt. Auf anderen Geräten bitte „Trennen“ tippen und mit dem neuen Passwort verbinden.');
    } catch (e) { ok.disabled = no.disabled = false; m.style.color = '#b91c1c'; m.textContent = e && e.message ? e.message : 'Das hat nicht geklappt.'; }
  };
}
async function syncOff() { if (await kaConfirm('Abgleich auf diesem Gerät beenden? Die Daten auf diesem Gerät bleiben erhalten, auf dem Server ändert sich nichts.')) KS.disconnect(); }
async function syncBackups() {
  var box = document.getElementById('sy-baks'); box.innerHTML = 'Lade …';
  try {
    var l = await KS.backups(); box.innerHTML = '';
    if (!l.length) { box.textContent = 'Es gibt keine früheren Stände.'; box.style.cssText = 'font-size:13px;color:#64748b;margin-bottom:14px'; return; }
    var h = mk('div', 'ak-h', 'Frühere Stände (von Konflikten)'); box.appendChild(h);
    l.forEach(function (n) {
      var ts = +n.replace('sich_', ''), r = mk('div'); r.style.cssText = 'display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid #e2e8f0;font-size:14px';
      var t = mk('span', '', new Date(ts).toLocaleString('de-DE')); t.style.flex = '1';
      var b = mk('button', 'btn btn-secondary btn-sm', 'Zurückholen'); b.type = 'button';
      b.onclick = async function () { if (await kaConfirm('Diesen Stand auf diesem Gerät einsetzen? Der aktuelle Stand wird dadurch ersetzt (er bleibt auf dem Server bis zum nächsten Abgleich erhalten).')) KS.restoreBackup(n).catch(function (e) { alert(e.message); }); };
      r.appendChild(t); r.appendChild(b); box.appendChild(r);
    });
  } catch (e) { box.textContent = e.message; }
}

