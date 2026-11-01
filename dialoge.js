/*
 * Meldungen, Rückfragen und Eingaben im Stil der App (statt der grauen Browser-Fenster).
 * alert() zeigt einen Hinweis unten und blockiert nichts. kaConfirm() und kaPrompt() liefern ein Promise.
 */
(function () {
  var css = document.createElement('style');
  css.textContent =
    '#ka-toasts { position:fixed; left:12px; right:12px; bottom:calc(34px + env(safe-area-inset-bottom)); z-index:9999; display:flex; flex-direction:column; align-items:center; gap:8px; pointer-events:none; }' +
    '.ka-toast { pointer-events:auto; max-width:520px; width:100%; background:#0f172a; color:#fff; border-radius:12px; padding:12px 14px; font-size:14px; line-height:1.4; display:flex; gap:10px; align-items:flex-start; box-shadow:0 6px 22px rgba(15,23,42,.35); white-space:pre-line; cursor:pointer; }' +
    '.ka-toast i { flex:none; font-style:normal; font-weight:700; font-size:16px; line-height:1.3; }' +
    '.ka-toast.warn i { color:#fca5a5; } .ka-toast.ok i { color:#86efac; }' +
    '.ka-dlg { position:fixed; inset:0; z-index:9998; background:rgba(15,23,42,.45); display:flex; align-items:center; justify-content:center; padding:16px; }' +
    '.ka-dlg-box { background:#fff; border-radius:16px; padding:18px; width:100%; max-width:420px; box-shadow:0 10px 30px rgba(15,23,42,.35); }' +
    '.ka-dlg-msg { font-size:15px; color:#334155; line-height:1.45; white-space:pre-line; margin-bottom:14px; max-height:50vh; overflow:auto; }' +
    '.ka-dlg-box input { width:100%; margin-bottom:14px; }' +
    '.ka-dlg-foot { display:flex; justify-content:flex-end; gap:8px; }' +
    '.ka-dlg-foot .btn-danger { background:#fff; color:#b91c1c; border:1px solid #dc2626; }' +
    '#al-btn { display:none !important; }' +
    '#pk-unlock { width:100%; margin-top:8px; }' +
    '#pk-unlock[hidden] { display:none !important; }';
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
      if (def !== null) {
        inp = document.createElement('input'); inp.type = o.password ? 'password' : 'text'; inp.className = 'form-control'; inp.value = def;
        inp.autocomplete = o.password ? 'current-password' : 'off'; if (o.readonly) inp.readOnly = true; box.appendChild(inp);
      }
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

  function pkSupported() {
    return !!(window.isSecureContext && window.PublicKeyCredential && navigator.credentials && navigator.credentials.create && navigator.credentials.get && window.crypto && crypto.subtle);
  }
  function pkRand(n) { var a = new Uint8Array(n || 32); crypto.getRandomValues(a); return a; }
  function pkB64u(buf) {
    var a = new Uint8Array(buf), s = '';
    for (var i = 0; i < a.length; i += 8192) s += String.fromCharCode.apply(null, a.subarray(i, i + 8192));
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function pkUnB64u(s) {
    s = String(s || '').replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a;
  }
  async function pkKey(prf) { return crypto.subtle.importKey('raw', new Uint8Array(prf), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']); }
  async function pkWrapRaw(raw, prf) {
    var iv = pkRand(12), ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, await pkKey(prf), raw));
    var out = new Uint8Array(iv.length + ct.length); out.set(iv); out.set(ct, iv.length); return pkB64u(out);
  }
  async function pkUnwrapRaw(wrap, prf) {
    try {
      var u = pkUnB64u(wrap);
      return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.subarray(0, 12) }, await pkKey(prf), u.subarray(12)));
    } catch (x) { return null; }
  }
  async function pkEval(id, salt, transports) {
    var idText = pkB64u(id), allow = { type: 'public-key', id: new Uint8Array(id) };
    if (Array.isArray(transports) && transports.length) allow.transports = transports;
    var by = {}; by[idText] = { first: new Uint8Array(salt) };
    var cred = await navigator.credentials.get({ publicKey: {
      challenge: pkRand(32), allowCredentials: [allow], userVerification: 'required', timeout: 60000,
      extensions: { prf: { evalByCredential: by } }
    }, mediation: 'required' });
    var ext = cred && cred.getClientExtensionResults ? cred.getClientExtensionResults() : {};
    var first = ext && ext.prf && ext.prf.results && ext.prf.results.first;
    if (!first) throw new Error('Dieser Passkey unterstützt die benötigte Schlüsselableitung nicht.');
    return new Uint8Array(first);
  }
  async function pkFinishUnlock(raw) {
    var msg = document.getElementById('al-msg');
    try {
      window.KA.key = await window.alImportKey(raw);
      if (!window.KA.enc) {
        await window.rjEarlyCore(); await window.kaLoadAll(); await window.kaIdle();
      }
      window.alFails = 0;
      var p1 = document.getElementById('al-pw'), p2 = document.getElementById('al-pw2');
      if (p1) p1.value = ''; if (p2) p2.value = ''; if (msg) msg.textContent = '';
      if (!window.KA.booted) window.kaBoot(false);
      var rjr = typeof window.restoreJournalStartup === 'function' ? await window.restoreJournalStartup() : '';
      if (rjr === 'reload') { location.reload(); return true; }
      document.documentElement.classList.remove('locked'); window.alArm();
      var c = window.alGet(); if (c && c.enc && c.sweep && typeof window.kaFilesToEnc === 'function') window.kaFilesToEnc().catch(function () {});
      return true;
    } catch (x) {
      window.KA.key = null;
      if (msg) msg.textContent = 'Der Passkey konnte die Daten nicht entsperren.';
      return false;
    } finally {
      try { new Uint8Array(raw).fill(0); } catch (x) {}
    }
  }
  async function pkUnlock() {
    var c = typeof window.alGet === 'function' ? window.alGet() : null, msg = document.getElementById('al-msg');
    if (!c || !c.pk) { if (msg) msg.textContent = 'Auf diesem Gerät ist noch kein Passkey eingerichtet.'; return false; }
    if (!pkSupported()) { if (msg) msg.textContent = 'Passkeys werden in dieser Ansicht nicht unterstützt.'; return false; }
    if (msg) msg.textContent = 'Passkey wird geprüft …';
    try {
      var prf = await pkEval(pkUnB64u(c.pk.id), pkUnB64u(c.pk.salt), c.pk.transports || []);
      var raw = await pkUnwrapRaw(c.pk.wrap, prf);
      prf.fill(0);
      if (!raw) throw new Error('Passkey-Schlüssel stimmt nicht.');
      return await pkFinishUnlock(raw);
    } catch (x) {
      if (msg) msg.textContent = x && x.name === 'NotAllowedError' ? 'Passkey-Anmeldung abgebrochen.' : (x && x.message ? x.message : 'Passkey konnte nicht verwendet werden.');
      return false;
    }
  }
  async function pkSetup() {
    var c = typeof window.alGet === 'function' ? window.alGet() : null;
    if (!c || !c.enc || document.documentElement.classList.contains('locked')) { alert('Bitte die App zuerst mit Deinem Passwort entsperren.'); return false; }
    if (!pkSupported()) { alert('Dieser Browser oder dieses Gerät unterstützt die benötigte Passkey-Funktion nicht. Das Passwort bleibt unverändert nutzbar.'); return false; }
    if (c.pk && !await window.kaConfirm('Den vorhandenen Passkey durch einen neuen ersetzen?', { ok: 'Ersetzen', danger: false })) return false;
    var pw = await dialog('Zur Einrichtung des Passkeys einmalig Dein aktuelles App-Passwort eingeben.', '', { password: true, ok: 'Weiter' });
    if (pw === null) return false;
    var raw = null, prf = null;
    try {
      raw = await window.alUnwrap(pw, c);
      if (!raw) { alert('Das aktuelle Passwort stimmt nicht.'); return false; }
      var salt = pkRand(32), userId = pkRand(32);
      var cred = await navigator.credentials.create({ publicKey: {
        challenge: pkRand(32),
        rp: { name: 'Kreuzberg Ästhetik' },
        user: { id: userId, name: 'praxis', displayName: 'Kreuzberg Ästhetik' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
        timeout: 60000, attestation: 'none',
        extensions: { prf: { eval: { first: salt } } }
      } });
      if (!cred || !cred.rawId) throw new Error('Es wurde kein Passkey erstellt.');
      var transports = cred.response && typeof cred.response.getTransports === 'function' ? cred.response.getTransports() : [];
      var ext = cred.getClientExtensionResults ? cred.getClientExtensionResults() : {};
      var first = ext && ext.prf && ext.prf.results && ext.prf.results.first;
      prf = first ? new Uint8Array(first) : await pkEval(cred.rawId, salt, transports);
      var wrapped = await pkWrapRaw(raw, prf);
      var fresh = window.alGet();
      fresh.pk = { v: 1, id: pkB64u(cred.rawId), salt: pkB64u(salt), wrap: wrapped, transports: transports, ts: Date.now(), rp: location.hostname };
      window.alPut(fresh);
      pkRefreshUnlockButton();
      alert('Passkey eingerichtet. Ab jetzt kannst Du die App normalerweise per Passkey entsperren. Dein Passwort bleibt als Rückfall erhalten.');
      return true;
    } catch (x) {
      var t = x && x.name === 'NotAllowedError' ? 'Die Passkey-Einrichtung wurde abgebrochen.' : (x && x.message ? x.message : 'Der Passkey konnte nicht eingerichtet werden.');
      alert(t + '\n\nDein bisheriges Passwort wurde nicht verändert.');
      return false;
    } finally {
      try { if (raw) raw.fill(0); } catch (x) {}
      try { if (prf) prf.fill(0); } catch (x) {}
    }
  }
  async function pkRemove() {
    var c = typeof window.alGet === 'function' ? window.alGet() : null;
    if (!c || !c.pk) return false;
    if (!await window.kaConfirm('Passkey aus dieser App entfernen?\n\nDas Passwort bleibt erhalten. Der Passkey kann im Passwortmanager des Geräts weiterhin angezeigt werden, ist für diese App danach aber nicht mehr nutzbar.', { ok: 'Entfernen' })) return false;
    delete c.pk; window.alPut(c); pkRefreshUnlockButton(); alert('Passkey aus der App entfernt.'); return true;
  }
  function pkRefreshUnlockButton() {
    var form = document.querySelector('#applock .al-box'), submit = document.getElementById('al-submit');
    if (!form || !submit) return;
    var b = document.getElementById('pk-unlock');
    if (!b) {
      b = document.createElement('button'); b.type = 'button'; b.id = 'pk-unlock'; b.className = 'btn btn-secondary'; b.textContent = 'Mit Passkey entsperren';
      b.onclick = function () { pkUnlock(); };
      submit.insertAdjacentElement('afterend', b);
    }
    var c = typeof window.alGet === 'function' ? window.alGet() : null;
    b.hidden = !(c && c.pk && pkSupported());
  }
  var pkAutoBusy = false, pkAutoAttempted = false, pkAutoWasLocked = false;
  function pkMaybeAutoUnlock() {
    var locked = document.documentElement.classList.contains('locked');
    if (!locked) { pkAutoWasLocked = false; pkAutoAttempted = false; return; }
    if (!pkAutoWasLocked) { pkAutoWasLocked = true; pkAutoAttempted = false; }
    if (pkAutoBusy || pkAutoAttempted || document.visibilityState === 'hidden') return;
    var c = typeof window.alGet === 'function' ? window.alGet() : null;
    if (!c || !c.pk || !pkSupported()) return;
    pkAutoAttempted = true; pkAutoBusy = true;
    setTimeout(function () {
      Promise.resolve(window.pkUnlock ? window.pkUnlock() : pkUnlock()).catch(function () {}).finally(function () { pkAutoBusy = false; });
    }, 60);
  }
  function pkWatchLockScreen() {
    var root = document.documentElement;
    if (!root._kaPkLockObserver && window.MutationObserver) {
      var ob = new MutationObserver(function () { pkMaybeAutoUnlock(); });
      ob.observe(root, { attributes: true, attributeFilter: ['class'] });
      root._kaPkLockObserver = ob;
    }
    if (!document._kaPkVisibilityBound) {
      document.addEventListener('visibilitychange', function () { if (document.visibilityState !== 'hidden') pkMaybeAutoUnlock(); });
      document._kaPkVisibilityBound = true;
    }
    pkMaybeAutoUnlock();
  }

  function pkPatchPasswordChange() {
    if (typeof window.alSet !== 'function' || window.alSet._kaPkPreserve) return;
    var orig = window.alSet;
    var wrapped = async function () {
      var before = typeof window.alGet === 'function' ? window.alGet() : null;
      var keep = before && before.pk ? JSON.parse(JSON.stringify(before.pk)) : null;
      var r = await orig.apply(this, arguments);
      if (keep) {
        var after = window.alGet();
        if (after && after.enc && !after.pk) { after.pk = keep; window.alPut(after); }
      }
      pkRefreshUnlockButton();
      return r;
    };
    wrapped._kaPkPreserve = true; window.alSet = wrapped;
  }

  function pkPatchBoot() {
    if (typeof window.kaBoot !== 'function' || window.kaBoot._kaPasskeyBoot) return;
    var orig = window.kaBoot;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      pkPatchNavMenu();
      watchSecurityMenu();
      pkRefreshUnlockButton();
      pkMaybeAutoUnlock();
      return r;
    };
    wrapped._kaPasskeyBoot = true;
    window.kaBoot = wrapped;
  }

  function pkPatchNavMenu() {
    if (typeof window.fillNavMenu !== 'function' || window.fillNavMenu._kaSecurity) return;
    var orig = window.fillNavMenu;
    var wrapped = function () {
      var r = orig.apply(this, arguments);
      addLockMenuItem();
      return r;
    };
    wrapped._kaSecurity = true;
    window.fillNavMenu = wrapped;
  }

  function lockUiInit() {
    try {
      if (typeof window.alActivateEncryption === 'function' && !window.alActivateEncryption._kaMin30) {
        var origActivate = window.alActivateEncryption;
        var wrappedActivate = async function (pw, min) { return origActivate(pw, Math.max(30, Number(min) || 30)); };
        wrappedActivate._kaMin30 = true;
        window.alActivateEncryption = wrappedActivate;
      }
      if (typeof window.alGet === 'function' && typeof window.alPut === 'function') {
        var c = window.alGet();
        if (c && (!(+c.min >= 30))) { c.min = 30; window.alPut(c); }
      }
      var sel = document.getElementById('al-min');
      if (sel) {
        var c2 = typeof window.alGet === 'function' ? window.alGet() : null;
        var cur = c2 && +c2.min >= 30 ? +c2.min : 30;
        sel.innerHTML = '<option value="30">Nach 30 Minuten</option><option value="60">Nach 60 Minuten</option><option value="120">Nach 2 Stunden</option>';
        if ([30, 60, 120].indexOf(cur) < 0) cur = cur > 120 ? 120 : 30;
        sel.value = String(cur);
        if (c2 && +c2.min !== cur) { c2.min = cur; window.alPut(c2); }
      }
      pkPatchPasswordChange(); pkPatchBoot(); pkPatchNavMenu(); pkRefreshUnlockButton(); pkWatchLockScreen();
    } catch (x) {}
  }

  function addLockMenuItem() {
    var box = document.getElementById('nav-menu');
    if (!box || box.querySelector('[data-ka-security-root]')) return;
    var ver = box.querySelector('.nav-ver');
    var h = document.createElement('div'); h.className = 'nav-group'; h.textContent = 'Sicherheit'; h.setAttribute('data-ka-lock', '1'); h.setAttribute('data-ka-security-root', '1');
    var c = typeof window.alGet === 'function' ? window.alGet() : null;
    var pk = document.createElement('button'); pk.type = 'button'; pk.textContent = c && c.pk ? 'Passkey ersetzen' : 'Passkey einrichten'; pk.setAttribute('data-ka-lock', '1');
    pk.onclick = function () { box.style.display = 'none'; pkSetup(); };
    var rm = null;
    if (c && c.pk) {
      rm = document.createElement('button'); rm.type = 'button'; rm.textContent = 'Passkey entfernen'; rm.setAttribute('data-ka-lock', '1');
      rm.onclick = function () { box.style.display = 'none'; pkRemove(); };
    }
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'App sperren'; b.setAttribute('data-ka-lock', '1');
    b.onclick = function () { box.style.display = 'none'; if (typeof window.alLockNow === 'function') window.alLockNow(); };
    var add = function (n) { if (ver) box.insertBefore(n, ver); else box.appendChild(n); };
    add(h); add(pk); if (rm) add(rm); add(b);
  }

  function watchSecurityMenu() {
    var ensure = function () {
      var box = document.getElementById('nav-menu');
      if (!box) return false;
      addLockMenuItem();
      if (!box._kaSecurityObserver && window.MutationObserver) {
        var ob = new MutationObserver(function () {
          if (!box.querySelector('[data-ka-security-root]')) addLockMenuItem();
        });
        ob.observe(box, { childList: true });
        box._kaSecurityObserver = ob;
      }
      return true;
    };
    if (ensure()) return;
    if (!document.documentElement._kaSecurityHostObserver && window.MutationObserver) {
      var hostOb = new MutationObserver(function () {
        if (ensure()) { hostOb.disconnect(); document.documentElement._kaSecurityHostObserver = null; }
      });
      hostOb.observe(document.documentElement, { childList: true, subtree: true });
      document.documentElement._kaSecurityHostObserver = hostOb;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    lockUiInit();
    setTimeout(lockUiInit, 1000);
    setTimeout(watchSecurityMenu, 0);
  });

  window.pkSetup = pkSetup;
  window.pkUnlock = pkUnlock;
  window.pkMaybeAutoUnlock = pkMaybeAutoUnlock;
  window.pkRemove = pkRemove;
  window.pkWrapRaw = pkWrapRaw;
  window.pkUnwrapRaw = pkUnwrapRaw;
  window.alert = toast;
  window.kaToast = toast;
  window.kaConfirm = function (msg, o) { return dialog(String(msg), null, o); };
  window.kaPrompt = function (msg, def, o) { return dialog(String(msg), def == null ? '' : String(def), o); };
})();
