/* Tommy App — permite abrir la app sin internet */
var CACHE = 'tommy-app-v1';
var ARCHIVOS = ['./', './index.html', './manifest.json', './icono-180.png', './icono-192.png', './icono-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARCHIVOS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method!=='GET' || new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(guardado){
      var red = fetch(e.request).then(function(resp){ if (resp && resp.ok) c.put(e.request, resp.clone()); return resp; })
        .catch(function(){ return guardado; });
      return guardado || red;
    });
  }));
});
