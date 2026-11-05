// Hollow Acre service worker: the game page and its version file always come fresh from the network when there is one,
// so a home-screen shortcut never keeps an old version; art and sounds load from the cache and refresh in the background.
const CACHE='hollow-acre-v1';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim());});
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin)return;
  const page=req.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/')||url.pathname.endsWith('version.json')||url.pathname.endsWith('manifest.webmanifest');
  if(page){e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}return r;}).catch(()=>caches.match(req,{ignoreSearch:true})));return;}
  // art and sounds: answer from the cache at once, and refresh the cache in the background so changed art arrives next time
  e.respondWith(caches.open(CACHE).then(k=>k.match(req).then(hit=>{const net=fetch(req).then(r=>{if(r.ok)k.put(req,r.clone());return r;}).catch(()=>hit);return hit||net;})));});
