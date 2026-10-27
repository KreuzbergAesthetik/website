/* Offline-Speicher der Praxis-App. Eine neue Version wird im Hintergrund geladen und erst nach Tipp auf "Jetzt aktualisieren" aktiv.
   WICHTIG: Bei jeder Veröffentlichung V ändern, sonst erkennt das Gerät keine neue Version. */
var V='2026-10-30-b',C='ka-praxis-'+V,F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png','./pdf-lib.min.js','./pdfjs.min.js','./pdfjs.worker.min.js','./anmeldung.html','./anamnese.html','./erinnerung.html','./forms.js','./ftexte.js','./forms.css','./docs.js','./sync.js','./extcal.js','./info.html','./aufklaerung.html'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return Promise.all(F.map(function(u){return fetch(new Request(u,{cache:'reload'})).then(function(r){if(r.ok)return c.put(u,r)}).catch(function(){})}))}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}));});
self.addEventListener('message',function(e){if(e.data==='skip')self.skipWaiting();});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(C).then(function(c){return c.match(e.request,{ignoreSearch:true}).then(function(m){
    return m||fetch(e.request).then(function(r){if(r.ok&&new URL(e.request.url).origin===location.origin)c.put(e.request,r.clone());return r;}).catch(function(){return c.match('./index.html')});
  })}));
});
