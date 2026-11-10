
/* Offline-Speicher mit Update-Bestätigung: eine neue Version wartet, bis "Jetzt aktualisieren" getippt wird */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  var updGo = false;
  navigator.serviceWorker.register('sw.js').then(function (reg) {
    var offer = function (w) { document.getElementById('upd-bar').style.display = 'block'; document.getElementById('upd-go').onclick = function () { updGo = true; w.postMessage('skip'); }; };
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener('updatefound', function () { var w = reg.installing; if (w) w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) offer(w); }); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) reg.update().catch(function () {}); });
  }).catch(function () {});
  navigator.serviceWorker.addEventListener('controllerchange', function () { if (updGo) location.reload(); });
}
