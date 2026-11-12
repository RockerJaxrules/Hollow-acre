/* ================= #250 an account you can log into from any device: a username and a password only you know. There's no game
   server, so the farm is kept the way Nostr apps keep their data: your username and password are stretched (PBKDF2, 150,000
   rounds) into two keys on your own device. One encrypts the save (AES-GCM) before it leaves; the other signs it (BIP-340) so it
   can be stored on several public relays as app data (NIP-78, kind 30078). Logging in anywhere with the same two words finds
   it and unlocks it; without them it's noise. Nothing else is sent: not your name, not your email, not your password.
   The same account is also your id on shared farms, so friends' farms know you on any device.
   Create an account (with a confirm-password box), or log in (both with show-password), from the title screen. ================= */
const CLOUD={relays:['wss://relay.damus.io','wss://nos.lol','wss://relay.primal.net','wss://nostr.mom','wss://relay.nostr.band','wss://offchain.pub'],
  tag:'hollow-acre/save',part:24000,busy:false,last:0,t:null};
if(typeof window!=='undefined'&&Array.isArray(window.HOLLOW_RELAYS))CLOUD.relays=window.HOLLOW_RELAYS;
// ---- BIP-340 Schnorr on secp256k1 (checked against an independent library's signatures)
const CLSK={p:0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn,n:0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n,
  G:[0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n,0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n]};
const clMod=(a,m=CLSK.p)=>{const r=a%m;return r>=0n?r:r+m;};
function clInv(a,m=CLSK.p){let [lo,hi]=[clMod(a,m),m],[x0,x1]=[1n,0n];while(lo>1n){const q=hi/lo;[x0,x1]=[x1-q*x0,x0];[lo,hi]=[hi-q*lo,lo];}return clMod(x0,m);}
// Jacobian points: [X,Y,Z]
function clDbl(P){const [X,Y,Z]=P;if(!Y)return [0n,1n,0n];const p=CLSK.p;const S=clMod(4n*X*Y*Y,p),M=clMod(3n*X*X,p);const X3=clMod(M*M-2n*S,p);return [X3,clMod(M*(S-X3)-8n*Y*Y*Y*Y,p),clMod(2n*Y*Z,p)];}
function clAdd(P,Q){if(!P[2])return Q;if(!Q[2])return P;const p=CLSK.p;const [X1,Y1,Z1]=P,[X2,Y2,Z2]=Q;const Z1Z1=clMod(Z1*Z1,p),Z2Z2=clMod(Z2*Z2,p);
  const U1=clMod(X1*Z2Z2,p),U2=clMod(X2*Z1Z1,p),S1=clMod(Y1*Z2*Z2Z2,p),S2=clMod(Y2*Z1*Z1Z1,p);if(U1===U2)return S1===S2?clDbl(P):[0n,1n,0n];
  const H=U2-U1,R=S2-S1,H2=clMod(H*H,p),H3=clMod(H*H2,p);const X3=clMod(R*R-H3-2n*U1*H2,p);return [X3,clMod(R*(U1*H2-X3)-S1*H3,p),clMod(H*Z1*Z2,p)];}
function clMul(k){let R=[0n,1n,0n],A=[CLSK.G[0],CLSK.G[1],1n];while(k>0n){if(k&1n)R=clAdd(R,A);A=clDbl(A);k>>=1n;}const zi=clInv(R[2]);return [clMod(R[0]*zi*zi),clMod(R[1]*zi*zi*zi)];}
const clB2n=b=>BigInt('0x'+([...b].map(x=>x.toString(16).padStart(2,'0')).join('')||'0'));
const clN2b=n=>{const h=n.toString(16).padStart(64,'0');return Uint8Array.from(h.match(/../g).map(x=>parseInt(x,16)));};
const clHex=b=>[...b].map(x=>x.toString(16).padStart(2,'0')).join('');
const clCat=(...a)=>{const o=new Uint8Array(a.reduce((s,x)=>s+x.length,0));let i=0;for(const x of a){o.set(x,i);i+=x.length;}return o;};
async function clSha(b){return new Uint8Array(await crypto.subtle.digest('SHA-256',b));}
async function clTagged(tag,...m){const t=await clSha(new TextEncoder().encode(tag));return clSha(clCat(t,t,...m));}
async function clSign(msg,dBytes,aux){let d=clMod(clB2n(dBytes),CLSK.n);const P=clMul(d);if(P[1]&1n)d=CLSK.n-d;const px=clN2b(P[0]);
  aux=aux||crypto.getRandomValues(new Uint8Array(32));const t=clN2b(d^clB2n(await clTagged('BIP0340/aux',aux)));
  let k=clMod(clB2n(await clTagged('BIP0340/nonce',t,px,msg)),CLSK.n);if(!k)throw new Error('bad nonce');const R=clMul(k);if(R[1]&1n)k=CLSK.n-k;const rx=clN2b(R[0]);
  const e=clMod(clB2n(await clTagged('BIP0340/challenge',rx,px,msg)),CLSK.n);return clCat(rx,clN2b(clMod(k+e*d,CLSK.n)));}
const clPub=dBytes=>clN2b(clMul(clMod(clB2n(dBytes),CLSK.n))[0]);
// ---- your two keys, from your two words
async function cloudKeys(user,pass){const u=String(user).trim().toLowerCase();
  const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(pass),'PBKDF2',false,['deriveBits']);
  const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode('hollow-acre/account/'+u),iterations:150000,hash:'SHA-256'},base,512));
  let d=bits.slice(0,32);if(!clMod(clB2n(d),CLSK.n))d=await clSha(d);const enc=bits.slice(32);return {user:u,d:clHex(d),pub:clHex(clPub(d)),enc:clHex(enc)};}
const clUnhex=h=>Uint8Array.from((h.match(/../g)||[]).map(x=>parseInt(x,16)));
const clB64=b=>{let s='';for(let i=0;i<b.length;i+=0x8000)s+=String.fromCharCode.apply(null,b.subarray(i,i+0x8000));return btoa(s);};
const clUnb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function clGz(bytes,un){if(typeof CompressionStream==='undefined')return bytes;const s=new Blob([bytes]).stream().pipeThrough(un?new DecompressionStream('gzip'):new CompressionStream('gzip'));return new Uint8Array(await new Response(s).arrayBuffer());}
async function cloudSeal(K,obj){const key=await crypto.subtle.importKey('raw',clUnhex(K.enc),'AES-GCM',false,['encrypt']);const iv=crypto.getRandomValues(new Uint8Array(12));
  const z=typeof CompressionStream!=='undefined';const plain=await clGz(new TextEncoder().encode(JSON.stringify(obj)));
  return (z?'z':'p')+clB64(clCat(iv,new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,plain))));}
async function cloudOpen(K,s){const key=await crypto.subtle.importKey('raw',clUnhex(K.enc),'AES-GCM',false,['decrypt']);const raw=clUnb64(s.slice(1));
  let plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:raw.slice(0,12)},key,raw.slice(12)));if(s[0]==='z')plain=await clGz(plain,true);return JSON.parse(new TextDecoder().decode(plain));}
async function cloudEvent(K,dtag,content,t){const ev={pubkey:K.pub,created_at:t||Math.floor(Date.now()/1000),kind:30078,tags:[['d',dtag]],content};
  const id=await clSha(new TextEncoder().encode(JSON.stringify([0,ev.pubkey,ev.created_at,ev.kind,ev.tags,ev.content])));ev.id=clHex(id);ev.sig=clHex(await clSign(id,clUnhex(K.d)));return ev;}
// ---- talking to the relays: the first ones to answer win, nobody waits forever
function cloudRelay(url,send,onMsg,ms){return new Promise(res=>{let ws,done=false;const end=v=>{if(done)return;done=true;try{ws&&ws.close();}catch(e){}res(v);};
  try{ws=new WebSocket(url);}catch(e){return res(null);}const to=setTimeout(()=>end(null),ms||8000);
  ws.onopen=()=>{try{for(const m of send)ws.send(JSON.stringify(m));}catch(e){end(null);}};
  ws.onmessage=e=>{let m=null;try{m=JSON.parse(e.data);}catch(x){return;}const r=onMsg(m);if(r!==undefined){clearTimeout(to);end(r);}};ws.onerror=()=>end(null);ws.onclose=()=>end(null);});}
async function cloudPublish(evs){const ok=await Promise.all(CLOUD.relays.map(u=>{let n=0;const ids=new Set(evs.map(e=>e.id));
    return cloudRelay(u,evs.map(e=>['EVENT',e]),m=>{if(m[0]==='OK'&&ids.has(m[1])){if(m[2])n++;else return false;if(n===evs.length)return true;}},9000);}));
  return ok.filter(Boolean).length;}
async function cloudFetch(K){const sub='h'+Math.random().toString(36).slice(2,8);const got=new Map();
  await Promise.all(CLOUD.relays.map(u=>cloudRelay(u,[['REQ',sub,{kinds:[30078],authors:[K.pub],limit:60}]],m=>{
    if(m[0]==='EVENT'&&m[1]===sub&&m[2]&&m[2].pubkey===K.pub){const e=m[2];const d=(e.tags.find(t=>t[0]==='d')||[])[1];if(d&&d.startsWith(CLOUD.tag)){const o=got.get(d);if(!o||o.created_at<e.created_at)got.set(d,e);}}
    else if(m[0]==='EOSE'&&m[1]===sub)return true;},7000)));
  const head=got.get(CLOUD.tag);if(!head)return null;let man;try{man=JSON.parse(head.content);}catch(e){return null;}
  const parts=[];for(let i=0;i<(man.n|0);i++){const e=got.get(CLOUD.tag+'/'+i);if(!e||!e.content.startsWith(man.v+':'))return {partial:true,man};parts.push(e.content.slice(man.v.length+1));}
  return {man,data:await cloudOpen(K,parts.join(''))};}
// ---- what's kept for an account: this profile's save, its morning save and its look
function cloudBundle(){const k=acctKeys(ACCT.cur);const g=x=>{try{return localStorage.getItem(x);}catch(e){return null;}};return {save:g(k.save),morning:g(k.morning),look:g(k.look),name:(acctMe()||{}).name,t:Date.now()};}
async function cloudUpload(K){const sealed=await cloudSeal(K,cloudBundle());const v=Math.floor(Date.now()/1000).toString(36);const n=Math.ceil(sealed.length/CLOUD.part);const t=Math.floor(Date.now()/1000);
  const evs=[];for(let i=0;i<n;i++)evs.push(await cloudEvent(K,CLOUD.tag+'/'+i,v+':'+sealed.slice(i*CLOUD.part,(i+1)*CLOUD.part),t));
  evs.push(await cloudEvent(K,CLOUD.tag,JSON.stringify({v,n,t:Date.now(),app:'hollow-acre',ver:1}),t));return cloudPublish(evs);}
// the account a profile is linked to (kept on this device so it can save without asking again)
const cloudK=()=>{const p=acctMe();return p&&p.cloud&&p.cloud.d?p.cloud:null;};
function cloudSoon(){const K=cloudK();if(!K||!navigator.onLine)return;clearTimeout(CLOUD.t);CLOUD.t=setTimeout(async()=>{if(CLOUD.busy)return cloudSoon();CLOUD.busy=true;
    try{const n=await cloudUpload(K);if(n>0){CLOUD.last=Date.now();const p=acctMe();p.cloud.synced=Date.now();acctStore();}}catch(e){console.warn('cloud',e);}finally{CLOUD.busy=false;}},CLOUD.last&&Date.now()-CLOUD.last<60000?60000:4000);}
{const _sg=saveGame;saveGame=function(){const r=_sg.apply(this,arguments);try{cloudSoon();}catch(e){}return r;};}
// account ids on shared farms
{const p=acctMe();if(p&&p.cloud&&p.cloud.pub)p.uid=p.cloud.pub.slice(0,20);}
// ---- the account screen
function cloudShow(view){const box=$('acctPanel').querySelector('.box');$('acctPanel').hidden=false;const K=cloudK();
  const msg=t=>{const m=box.querySelector('.msg');if(m)m.innerHTML=t;};const eye=id=>`<button type="button" class="eye" data-eye="${id}" aria-label="Show password">Show</button>`;
  if(K&&view!=='create'&&view!=='login'){box.innerHTML=`<h3>Your account</h3><p>Logged in as <b>${acctEsc(K.user)}</b>. Your farm is saved to your account a few seconds after it saves here, and you can open it on any device by logging in with the same username and password.</p>
      <p style="opacity:.75;font-size:13px">${K.synced?'Last saved to your account: '+new Date(K.synced).toLocaleString():'Not saved to your account yet.'}</p>
      <div class="acts"><button data-a="now">Save to my account now</button><button data-a="out" class="warn">Log out on this device</button><button data-a="back">Back</button></div><div class="msg"></div>`;
    box.querySelector('[data-a=back]').onclick=()=>acctShow('list');
    box.querySelector('[data-a=now]').onclick=async()=>{msg('Saving…');try{const n=await cloudUpload(K);if(n){K.synced=Date.now();acctStore();msg(`Saved to your account (${n} relays have it).`);}else msg('Couldn’t reach the account servers. Check your connection and try again.');}catch(e){msg('That didn’t work: '+acctEsc(e.message));}};
    box.querySelector('[data-a=out]').onclick=()=>{const p=acctMe();delete p.cloud;delete p.uid;acctStore();msg('Logged out on this device. Your farm is still on this device, and in your account.');setTimeout(()=>acctShow('list'),1200);};return;}
  const create=view==='create';
  box.innerHTML=`<h3>${create?'Create an account':'Log in'}</h3><p style="font-size:13px;opacity:.8">${create?'Pick a username and a password only you know. With them you can open this farm on any device.':'Log in to open your farm from your account on this device.'}</p>
    Username<input id="clUser" maxlength="24" autocomplete="username" autocapitalize="off" spellcheck="false">
    Password<div class="pw"><input id="clPass" type="password" maxlength="64" autocomplete="${create?'new-password':'current-password'}">${eye('clPass')}</div>
    ${create?`Confirm password<div class="pw"><input id="clPass2" type="password" maxlength="64" autocomplete="new-password">${eye('clPass2')}</div>`:''}
    <div class="acts"><button data-a="go">${create?'Create account':'Log in'}</button><button data-a="swap">${create?'I already have one: log in':'New here? Create an account'}</button><button data-a="back">Back</button></div><div class="msg"></div>
    <p style="font-size:12px;opacity:.6;margin-top:8px">Nobody can reset a forgotten password, not even us: your farm is locked with it. Write it down somewhere safe.</p>`;
  box.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')box.querySelector('[data-a=go]').click();}));
  box.querySelectorAll('[data-eye]').forEach(b=>b.onclick=()=>{const i=$(b.dataset.eye);const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Hide':'Show';b.setAttribute('aria-label',show?'Hide password':'Show password');});
  box.querySelector('[data-a=back]').onclick=()=>acctShow('list');box.querySelector('[data-a=swap]').onclick=()=>cloudShow(create?'login':'create');
  box.querySelector('[data-a=go]').onclick=async()=>{const u=$('clUser').value.trim(),p=$('clPass').value;
    if(!/^[A-Za-z0-9_.\- ]{3,24}$/.test(u)){msg('A username needs 3 to 24 letters, numbers, spaces, dots, dashes or underscores.');return;}
    if(p.length<6){msg('A password needs at least 6 characters.');return;}
    if(create&&p!==$('clPass2').value){msg('The two passwords don’t match.');return;}
    if(!navigator.onLine){msg('You need to be online for this.');return;}
    box.querySelectorAll('button').forEach(b=>b.disabled=true);msg(create?'Making your account…':'Looking for your farm…');
    try{const K2=await cloudKeys(u,p);const found=await cloudFetch(K2);
      if(create){if(found){msg('There’s already a farm under that username and password. Log in instead.');return;}
        const me=acctMe();me.cloud=Object.assign(K2,{since:Date.now()});me.uid=K2.pub.slice(0,20);acctStore();const n=await cloudUpload(K2);
        if(!n){msg('Your account is made, but the account servers couldn’t be reached to save to it. It will save the next time you’re online.');return;}
        me.cloud.synced=Date.now();acctStore();msg(`Account made. This farm is saved to it. Log in as <b>${acctEsc(u)}</b> on any device to open it.`);setTimeout(()=>cloudShow(),1800);return;}
      if(!found){msg('No farm under that username and password. Check them (they’re case-sensitive for the password), or create an account.');return;}
      if(found.partial){msg('Your account was found but part of the farm hasn’t reached the servers yet. Try again in a minute.');return;}
      // open it in a profile of its own on this device
      const D=found.data;let p2=ACCT.list.find(q=>q.cloud&&q.cloud.pub===K2.pub);if(!p2){p2={id:'c'+Date.now().toString(36),name:u.slice(0,16),created:Date.now()};ACCT.list.push(p2);}
      p2.cloud=Object.assign(K2,{since:Date.now(),synced:Date.now()});p2.uid=K2.pub.slice(0,20);const k=acctKeys(p2.id);
      for(const [f,key] of [['save',k.save],['morning',k.morning],['look',k.look]]){if(D[f])localStorage.setItem(key,D[f]);}
      acctStore();msg('Found it. Opening your farm…');setTimeout(()=>acctSwitch(p2.id),900);}
    catch(e){msg('That didn’t work: '+acctEsc(e.message||String(e)));}
    finally{box.querySelectorAll('button').forEach(b=>b.disabled=false);}};
  $('clUser').focus();}
{const st=document.createElement('style');st.textContent=`#acctPanel .pw{display:flex;gap:6px;align-items:center}#acctPanel .pw input{flex:1}#acctPanel .pw .eye{white-space:nowrap;min-width:58px}#acctBar .acl{color:#9fc07a}`;document.head.appendChild(st);}
// the bar on the title screen gets an Account button, and the profiles list says who's logged in
{const bar=$('acctBar');if(bar){const b=document.createElement('button');b.id='acctCloud';const K=cloudK();b.textContent=K?'Account ✓':'Log in';b.title=K?'Logged in as '+K.user:'Log in or create an account';
    b.addEventListener('click',()=>cloudShow(K?undefined:'login'));bar.appendChild(b);}}
{const _as=acctShow;acctShow=function(view,arg){_as(view,arg);try{if(view!=='list')return;const box=$('acctPanel').querySelector('.box');const acts=box.querySelector('.acts');if(!acts||box.querySelector('[data-a=cloud]'))return;
    const K=cloudK();const b=document.createElement('button');b.dataset.a='cloud';b.textContent=K?'Account: '+K.user:'Log in / create an account';b.onclick=()=>cloudShow(K?undefined:'login');acts.prepend(b);
    for(const p of ACCT.list){if(!p.cloud)continue;const row=box.querySelector(`.row[data-id="${p.id}"] .who b`);if(row)row.insertAdjacentHTML('afterend',' <span class="acl" title="Saved to an account">☁</span>');}}catch(e){}};}
// a newer save from another device: on opening the game, if this profile's account has a newer farm, it's brought down first
{const K=cloudK();if(K&&navigator.onLine)setTimeout(async()=>{try{if(S.mode!=='title')return;const f=await cloudFetch(K);if(!f||f.partial||!f.data||!f.data.save)return;
    const local=readSave();const lt=local&&local.t||0;let rt=0;try{rt=JSON.parse(f.data.save).t||0;}catch(e){}if(rt<=lt+1000)return;
    const k=acctKeys(ACCT.cur);localStorage.setItem(k.save,f.data.save);if(f.data.morning)localStorage.setItem(k.morning,f.data.morning);if(f.data.look)localStorage.setItem(k.look,f.data.look);
    toast('Your farm was saved more recently on another device. That save is loaded here now.',4);setTimeout(()=>location.reload(),1600);}catch(e){}},1500);}
