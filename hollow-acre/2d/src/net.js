/* ================= multiplayer anywhere. On every device (a website, itch.io, the
   desktop build, Android, Steam) the game uses direct peer-to-peer connections (WebRTC through the bundled Trystero library, MIT), finding other
   players through public relays, so no game server is needed. Claude's live room is only a fallback for a browser without WebRTC. ================= */
const NET_APP='hollow-acre-valley-v1';
// Players don't need to share a network: STUN (Google, Cloudflare, built into the library) finds a direct route across the internet.
// Some networks (many mobile carriers, school and office Wi-Fi) block direct routes, so a TURN relay carries the game for them.
// The default is the free public Open Relay server; before launch, swap in your own (Cloudflare or Metered TURN) by setting
// window.HOLLOW_TURN before the game loads.
const NET_TURN=(typeof window!=='undefined'&&window.HOLLOW_TURN)||[{urls:['turn:openrelay.metered.ca:80','turn:openrelay.metered.ca:443','turn:openrelay.metered.ca:443?transport=tcp'],username:'openrelayproject',credential:'openrelayproject'}];
function netRoom(name){const r=HollowNet.joinRoom({appId:NET_APP,turnConfig:NET_TURN},name);let onData=()=>{};
  const act=r.makeAction('pres',{onMessage:(d,ctx)=>onData(d,ctx&&ctx.peerId)});const old=Array.isArray(act);
  const send=old?(d,to)=>act[0](d,to):(d,to)=>{const p=act.send(d,to?{target:to}:undefined);if(p&&p.catch)p.catch(()=>{});};
  const get=fn=>{onData=fn;if(old)act[1](fn);};const onJoin=fn=>{if(old)r.onPeerJoin(fn);else r.onPeerJoin=fn;},onLeave=fn=>{if(old)r.onPeerLeave(fn);else r.onPeerLeave=fn;};
  // game events (world sync for hosted farms): one more channel, any size; the library splits big messages
  const ev=r.makeAction('evt',{onMessage:(d,ctx)=>onEvt(d,ctx&&ctx.peerId)});const evOld=Array.isArray(ev);const evh={};
  const onEvt=(d,id)=>{if(!d||typeof d!=='object'||typeof d.t!=='string')return;for(const f of (evh[d.t]||[]))try{f({topic:d.t,data:d.d,peer:id,isMe:false});}catch(e){}};
  if(evOld)ev[1](onEvt);
  const evSend=(d,to)=>{if(evOld)return ev[0](d,to);const p=ev.send(d,to?{target:to}:undefined);if(p&&p.catch)p.catch(()=>{});};
  const peers=new Map();let mine={};const cbs=[];let tmr=0,dirty=false,open=true;
  const me=()=>Object.freeze({peer:'me',by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,presence:mine,updatedAt:Date.now()});
  const fire=ch=>{const s=[me(),...peers.values()];for(const cb of cbs)try{cb({peers:s,joined:ch.j||[],left:ch.l||[],updated:ch.u||[]});}catch(e){}};
  const flush=()=>{tmr=0;if(!dirty||!open)return;dirty=false;try{send(mine);}catch(e){}};
  onJoin(id=>{try{send(mine,id);}catch(e){}});
  onLeave(id=>{const p=peers.get(id);peers.delete(id);if(p)fire({l:[p]});});
  get((d,id)=>{if(!d||typeof d!=='object'||Array.isArray(d))return;let s='';try{s=JSON.stringify(d);}catch(e){return;}if(s.length>4096)return;
    const prev=peers.get(id);const p=Object.freeze({peer:id,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:Object.freeze(d),updatedAt:Date.now()});peers.set(id,p);fire(prev?{u:[p]}:{j:[p]});});
  return {name,net:true,
    presence(patch){for(const [k,v] of Object.entries(patch||{})){if(v===null)delete mine[k];else mine[k]=v;}mine=Object.assign({},mine);dirty=true;if(!tmr)tmr=setTimeout(flush,100);return Promise.resolve();},
    onPeers(cb){cbs.push(cb);setTimeout(()=>fire({j:[me()]}),0);return ()=>{const i=cbs.indexOf(cb);if(i>=0)cbs.splice(i,1);};},
    onConnection(cb){setTimeout(()=>cb(true),0);return ()=>{};},connected:()=>true,peers:()=>[me(),...peers.values()],
    emit(topic,data,to){if(!open)return Promise.resolve();try{evSend({t:topic,d:data},to);}catch(e){}return Promise.resolve();},
    on(topic,fn){(evh[topic]=evh[topic]||[]).push(fn);return ()=>{const a=evh[topic],i=a?a.indexOf(fn):-1;if(i>=0)a.splice(i,1);};},
    leave(){open=false;cbs.length=0;try{const q=r.leave();if(q&&q.catch)q.catch(()=>{});}catch(e){}return Promise.resolve();}};}
function netLobby(){let cur=netRoom('valley');const L={net:true,
  presence:p=>cur.presence(p),onPeers:cb=>cur.onPeers(cb),onConnection:cb=>cur.onConnection(cb),connected:()=>true,
  async join(n){try{await cur.leave();}catch(e){}cur=netRoom(n||'valley');return cur;},
  async rejoin(){return L.join('valley');},get current(){return cur;}};return L;}
