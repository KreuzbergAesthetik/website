
/* Passkey so früh wie möglich anfordern, noch vor dem Laden der übrigen Skripte. Das Ergebnis übernimmt pkEval() in dialoge.js; ohne Passkey passiert hier nichts. */
(function () {
  try {
    if (!window.isSecureContext || !window.PublicKeyCredential || !navigator.credentials || document.visibilityState === 'hidden') return;
    var c = JSON.parse(localStorage.getItem('ka_lock') || 'null'); if (!c || !c.pk || !c.pk.id || !c.pk.salt) return;
    var un = function (s) { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
    var en = function (a) { var s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''); };
    var id = un(c.pk.id), salt = un(c.pk.salt), allow = { type: 'public-key', id: id };
    if (Array.isArray(c.pk.transports) && c.pk.transports.length) allow.transports = c.pk.transports;
    var by = {}; by[en(id)] = { first: salt };
    var p = navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [allow], userVerification: 'required', timeout: 60000, extensions: { prf: { evalByCredential: by } } }, mediation: 'required' });
    p.catch(function () {});
    window.__kaPkEarly = { id: en(id), salt: en(salt), t: Date.now(), p: p };
  } catch (x) {}
})();
