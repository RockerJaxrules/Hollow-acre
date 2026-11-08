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
    presence(patch){for(const [k,v] of Object.entries(patch||{})){if(v===null)delete mine[k];else mine[k]=v;}mine=Object.assign({},mine);dirty=true;if(!tmr)tmr=setTimeout(flush,50);return Promise.resolve();},
    onPeers(cb){cbs.push(cb);setTimeout(()=>fire({j:[me()]}),0);return ()=>{const i=cbs.indexOf(cb);if(i>=0)cbs.splice(i,1);};},
    onConnection(cb){setTimeout(()=>cb(true),0);return ()=>{};},connected:()=>true,peers:()=>[me(),...peers.values()],
    emit(topic,data,to){if(!open)return Promise.resolve();try{evSend({t:topic,d:data},to);}catch(e){}return Promise.resolve();},
    on(topic,fn){(evh[topic]=evh[topic]||[]).push(fn);return ()=>{const a=evh[topic],i=a?a.indexOf(fn):-1;if(i>=0)a.splice(i,1);};},
    leave(){open=false;cbs.length=0;try{const q=r.leave();if(q&&q.catch)q.catch(()=>{});}catch(e){}return Promise.resolve();}};}
function netLobby(){let cur=netRoom('valley');const L={net:true,
  presence:p=>cur.presence(p),onPeers:cb=>cur.onPeers(cb),onConnection:cb=>cur.onConnection(cb),connected:()=>true,
  async join(n){try{await cur.leave();}catch(e){}cur=netRoom(n||'valley');return cur;},
  async rejoin(){return L.join('valley');},get current(){return cur;}};return L;}
// ---- on claude.ai the page can't open outside connections, so there the same calls run over Claude's live room.
// Its messages are capped at 4 KB and always go to everyone, so big ones are cut into pieces and private ones carry who they're for.
const NET_CHUNK=3000;
function claudeAdapt(room){let myPeer=null,seq=0;const parts={};const evh={};const subs=[];
  const mark=ps=>{for(const p of ps)if(p.isMe&&p.sameTab)myPeer=p.peer;};
  const deliver=(t,d,peer)=>{for(const f of (evh[t]||[]))try{f({topic:t,data:d,peer,isMe:false});}catch(e){}};
  const listen=t=>{if(subs.includes(t))return;subs.push(t);room.on(t,m=>{if(!m||m.isMe)return;const w=m.data;if(!w||typeof w!=='object')return;if(w.to&&w.to!==myPeer)return;
    if(t==='chunk'){const k=m.peer+':'+w.id;const e=parts[k]||(parts[k]={n:w.n,got:0,s:[],t:w.t,at:Date.now()});if(e.s[w.i]==null){e.s[w.i]=String(w.s||'');e.got++;}
      if(e.got>=e.n){delete parts[k];let d=null;try{d=JSON.parse(e.s.join(''));}catch(x){return;}deliver(e.t,d,m.peer);}
      for(const [kk,v] of Object.entries(parts))if(Date.now()-v.at>30000)delete parts[kk];return;}
    deliver(t,w.d,m.peer);},()=>{});};
  const A={claude:true,
    presence:p=>room.presence(p),onConnection:(cb,er)=>room.onConnection(cb,er),connected:()=>room.connected(),peers:()=>room.peers(),
    onPeers(cb,er){return room.onPeers(ch=>{mark(ch.peers);cb(ch);},er);},
    emit(topic,data,to){let js='';try{js=JSON.stringify({to:to||null,d:data});}catch(e){return Promise.resolve();}
      if(js.length<3800)return room.emit(topic,{to:to||null,d:data}).catch(()=>{});
      const s=JSON.stringify(data),n=Math.ceil(s.length/NET_CHUNK),id=(++seq)+'-'+Date.now()%100000;
      for(let i=0;i<n;i++)setTimeout(()=>room.emit('chunk',{to:to||null,id,i,n,t:topic,s:s.slice(i*NET_CHUNK,(i+1)*NET_CHUNK)}).catch(()=>{}),i*35);return Promise.resolve();},
    on(topic,fn){(evh[topic]=evh[topic]||[]).push(fn);listen(topic);listen('chunk');return ()=>{const a=evh[topic],i=a?a.indexOf(fn):-1;if(i>=0)a.splice(i,1);};},
    async join(n){const r=await room.join(n);const a=claudeAdapt(r);a.leave=()=>r.leave();a.name=n;return a;},
    leave:()=>room.leave?room.leave():Promise.resolve()};
  room.onPeers(ch=>mark(ch.peers),()=>{});return A;}
