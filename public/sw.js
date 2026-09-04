/* OrthoScope — service worker
   Objectif : que l'application s'ouvre et fonctionne sans connexion après
   le premier lancement, modèles d'analyse vidéo compris. */
const CACHE='orthoscope-v2';
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com|storage\.googleapis\.com)\//;

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(['./','./index.html']).catch(function(){return null;});
  }).then(function(){return self.skipWaiting();}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.filter(function(x){return x!==CACHE;}).map(function(x){return caches.delete(x);}));
  }).then(function(){return self.clients.claim();}));
});

self.addEventListener('fetch',function(e){
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  const local=(url.origin===self.location.origin);

  /* la page elle-même : réseau d'abord, cache en secours */
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(r){
      const cp=r.clone();caches.open(CACHE).then(function(c){c.put('./index.html',cp);});return r;
    }).catch(function(){return caches.match('./index.html').then(function(r){return r||caches.match('./');});}));
    return;
  }

  /* modèles et bibliothèques : cache d'abord, mise à jour en tâche de fond */
  if(local||CDN.test(req.url)){
    e.respondWith(caches.match(req).then(function(hit){
      const net=fetch(req).then(function(r){
        if(r&&(r.status===200||r.type==='opaque')){
          const cp=r.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});
        }
        return r;
      }).catch(function(){return hit;});
      return hit||net;
    }));
  }
});
