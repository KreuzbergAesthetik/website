/*
 * Meldungen, Rückfragen und Eingaben im Stil der App (statt der grauen Browser-Fenster).
 * alert() zeigt einen Hinweis unten und blockiert nichts. kaConfirm() und kaPrompt() liefern ein Promise.
 */
(function () {
  var css = document.createElement('style');
  css.textContent =
    '#ka-toasts { position:fixed; left:12px; right:12px; bottom:calc(14px + env(safe-area-inset-bottom)); z-index:9999; display:flex; flex-direction:column; align-items:center; gap:8px; pointer-events:none; }' +
    '.ka-toast { pointer-events:auto; max-width:520px; width:100%; background:#0f172a; color:#fff; border-radius:12px; padding:12px 14px; font-size:14px; line-height:1.4; display:flex; gap:10px; align-items:flex-start; box-shadow:0 6px 22px rgba(15,23,42,.35); white-space:pre-line; cursor:pointer; }' +
    '.ka-toast i { flex:none; font-style:normal; font-weight:700; font-size:16px; line-height:1.3; }' +
    '.ka-toast.warn i { color:#fca5a5; } .ka-toast.ok i { color:#86efac; }' +
    '.ka-dlg { position:fixed; inset:0; z-index:9998; background:rgba(15,23,42,.45); display:flex; align-items:center; justify-content:center; padding:16px; }' +
    '.ka-dlg-box { background:#fff; border-radius:16px; padding:18px; width:100%; max-width:420px; box-shadow:0 10px 30px rgba(15,23,42,.35); }' +
    '.ka-dlg-msg { font-size:15px; color:#334155; line-height:1.45; white-space:pre-line; margin-bottom:14px; max-height:50vh; overflow:auto; }' +
    '.ka-dlg-box input { width:100%; margin-bottom:14px; }' +
    '.ka-dlg-foot { display:flex; justify-content:flex-end; gap:8px; }' +
    '.ka-dlg-foot .btn-danger { background:#fff; color:#b91c1c; border:1px solid #dc2626; }';
  document.head.appendChild(css);

  var WARN = /nicht|kein|fehl|bitte|ungültig|Fehler|konnte|stimmt|zu groß|Zu viele|Offline|Verbindung|gibt es schon/i;

  function toasts() {
    var t = document.getElementById('ka-toasts');
    if (!t) { t = document.createElement('div'); t.id = 'ka-toasts'; document.body.appendChild(t); }
    return t;
  }
  function toast(msg) {
    msg = String(msg == null ? '' : msg); if (!msg) return;
    if (msg.length > 160 || msg.split('\n').length > 4) { dialog(msg, null, { ok: 'OK', single: true }); return; }
    var warn = WARN.test(msg), el = document.createElement('div'), ic = document.createElement('i'), tx = document.createElement('span');
    el.className = 'ka-toast ' + (warn ? 'warn' : 'ok'); ic.textContent = warn ? '!' : '✓'; tx.textContent = msg; el.appendChild(ic); el.appendChild(tx);
    var host = toasts(); host.appendChild(el);
    var gone = function () { if (el.parentNode) el.parentNode.removeChild(el); };
    el.onclick = gone; setTimeout(gone, Math.max(3500, Math.min(9000, 55 * msg.length)) * (warn ? 1.4 : 1));
  }

  function dialog(msg, def, o) {
    o = o || {};
    return new Promise(function (res) {
      var ov = document.createElement('div'), box = document.createElement('div'), tx = document.createElement('div'), foot = document.createElement('div'), inp = null;
      ov.className = 'ka-dlg'; box.className = 'ka-dlg-box'; tx.className = 'ka-dlg-msg'; tx.textContent = msg; foot.className = 'ka-dlg-foot';
      box.setAttribute('role', 'dialog'); box.appendChild(tx);
      if (def !== null) { inp = document.createElement('input'); inp.type = 'text'; inp.className = 'form-control'; inp.value = def; inp.autocomplete = 'off'; if (o.readonly) inp.readOnly = true; box.appendChild(inp); }
      var done = function (v) { document.removeEventListener('keydown', key, true); if (ov.parentNode) ov.parentNode.removeChild(ov); res(v); };
      var ok = document.createElement('button'); ok.type = 'button';
      var danger = o.danger != null ? o.danger : /lösch|entfern|ersetz|überschreib|verwerf/i.test(msg) && def === null;
      ok.className = 'btn ' + (danger ? 'btn-danger' : 'btn-save'); ok.textContent = o.ok || (danger ? (/lösch/i.test(msg) ? 'Löschen' : /ersetz/i.test(msg) ? 'Ersetzen' : /verwerf/i.test(msg) ? 'Verwerfen' : 'Ja') : (inp ? 'Speichern' : 'OK'));
      var no = document.createElement('button'); no.type = 'button'; no.className = 'btn btn-cancel'; no.textContent = o.cancel || 'Abbrechen';
      var yes = function () { done(inp ? inp.value : true); }, cancel = function () { done(inp ? null : false); };
      ok.onclick = yes; no.onclick = cancel;
      if (!o.single) foot.appendChild(no); foot.appendChild(ok); box.appendChild(foot); ov.appendChild(box);
      ov.addEventListener('click', function (ev) { if (ev.target === ov) { o.single ? yes() : cancel(); } });
      var key = function (ev) { if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); o.single ? yes() : cancel(); } else if (ev.key === 'Enter' && !(ev.target && ev.target.tagName === 'BUTTON')) { ev.preventDefault(); ev.stopPropagation(); yes(); } };
      document.addEventListener('keydown', key, true);
      document.body.appendChild(ov);
      setTimeout(function () { if (inp) { inp.focus(); inp.select(); } else ok.focus(); }, 30);
    });
  }

  window.alert = toast;
  window.kaToast = toast;
  window.kaConfirm = function (msg, o) { return dialog(String(msg), null, o); };
  window.kaPrompt = function (msg, def, o) { return dialog(String(msg), def == null ? '' : String(def), o); };
})();
