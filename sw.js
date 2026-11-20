/* Room Checkout Log service worker. Build 7e9c867c77 */
var CACHE='hlog-7e9c867c77';
var CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE);}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function timeout(ms){return new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'));},ms);});}
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;               /* report submissions pass straight through */
  var url=new URL(req.url);
  if(url.origin!==location.origin){           /* fonts etc: cache after first load */
    e.respondWith(caches.open(CACHE).then(function(c){return c.match(req).then(function(hit){
      var net=fetch(req).then(function(r){if(r&&(r.ok||r.type==='opaque'))c.put(req,r.clone());return r;}).catch(function(){return hit;});
      return hit||net;});}));
    return;
  }
  if(req.mode==='navigate'||url.pathname.slice(-1)==='/'||/index\.html$/.test(url.pathname)){
    /* app shell: newest copy if the network answers within 3s, otherwise the saved copy */
    e.respondWith(Promise.race([fetch(req),timeout(3000)]).then(function(r){var cp=r.clone();caches.open(CACHE).then(function(c){c.put('index.html',cp);});return r;}).catch(function(){return caches.match('index.html').then(function(h){return h||caches.match('./');});}));
    return;
  }
  e.respondWith(caches.match(req).then(function(h){return h||fetch(req);}));
});
