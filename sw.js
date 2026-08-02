const CACHE='ddmg-v6-8-2026-08-02-1';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./hero-v6.svg','./apple-touch-icon.png','./massive-01-trailhead.jpg','./massive-02-sunrise-silhouette.jpg','./massive-03-caleb-camera.jpg','./massive-04-outcrop.jpg','./massive-05-summit-together.jpg','./holy-cross-01-approach-landscape.jpg','./holy-cross-02-peak-ahead.jpg','./holy-cross-03-steep-basin-view.jpg','./holy-cross-04-summit-portrait.jpg','./holy-cross-05-forest-descent.jpg','./princeton-01-trailhead-family.jpg','./princeton-02-don-vonda-ascent.jpg','./princeton-03-caleb-shelby-trail.jpg','./princeton-04-family-high-route.jpg','./princeton-05-family-summit-announcement.jpg','./princeton-06-don-vonda-summit.jpg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;
 if(event.request.mode==='navigate'){
  event.respondWith(caches.match('./index.html').then(cached=>{
   const network=fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy))}
    return response.ok?response:(cached||response)
   }).catch(()=>cached);
   return cached||network
  }));
  return;
 }
 event.respondWith(caches.match(event.request).then(cached=>{
  const network=fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response}).catch(()=>cached);
  return cached||network
 }))
});