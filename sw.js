/* Tommy App — permite abrir la app sin internet */
var CACHE = 'tommy-app-v4';
var ARCHIVOS = ['./', './index.html', './manifest.json', './icono-180.png', './icono-192.png', './icono-512.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(ARCHIVOS.map(function(u){
      return fetch(u, {cache:'no-store'}).then(function(r){ if (!r.ok) throw new Error(u); return c.put(u, r); });
    }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
function conLimite(p, ms){ return new Promise(function(ok, mal){ var t=setTimeout(function(){ mal(new Error('lento')); }, ms); p.then(function(v){ clearTimeout(t); ok(v); }, function(e){ clearTimeout(t); mal(e); }); }); }
self.addEventListener('fetch', function(e){
  if (e.request.method!=='GET' || new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(guardado){
      var red = fetch(e.request, {cache:'no-store'}).then(function(resp){ if (resp && resp.ok) c.put(e.request, resp.clone()); return resp; });
      // La página principal: primero internet (hasta 3 s) para traer siempre la última versión; si no hay señal, la guardada
      if (e.request.mode==='navigate') return conLimite(red, 3000).catch(function(){ return guardado || red; });
      red.catch(function(){});
      return guardado || red;
    });
  }));
});
