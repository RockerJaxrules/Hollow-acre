// Hollow Acre service worker: the game page and its version file always come fresh from the network when there is one,
// so a home-screen shortcut never keeps an old version. Art and sounds are asked for under the build's name (?b=<build>),
// so a new build's art is always fetched fresh; it is then served from the cache, and older builds' copies are cleared out.
const CACHE='hollow-acre-v2';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
let lastB=null;
function sweep(b){caches.open(CACHE).then(k=>k.keys().then(reqs=>{for(const r of reqs){const u=new URL(r.url);const rb=u.searchParams.get('b');if(rb&&rb!==b)k.delete(r);}}));}
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);if(url.origin!==location.origin)return;
  const page=req.mode==='navigate'||url.pathname.endsWith('.html')||url.pathname.endsWith('/')||url.pathname.endsWith('version.json')||url.pathname.endsWith('manifest.webmanifest')||url.pathname.endsWith('packs.json');
  if(page){e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}return r;}).catch(()=>caches.match(req,{ignoreSearch:true})));return;}
  const b=url.searchParams.get('b');
  if(b){if(b!==lastB){lastB=b;sweep(b);}   // a new build: drop every older build's copies
    e.respondWith(caches.open(CACHE).then(k=>k.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok)k.put(req,r.clone());return r;}))));return;}
  // anything asked for without a build name: the network first, the cache only when offline
  e.respondWith(fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));}return r;}).catch(()=>caches.match(req,{ignoreSearch:true})));});
