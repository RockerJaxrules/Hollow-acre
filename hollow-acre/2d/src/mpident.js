/* ================= #239 who's who on a shared farm. Cabins, saved backpacks and pay used to follow the name on your
   character, so a blank name (it becomes "Farmhand"), a changed one, or two friends with the same one made the host think a
   new person had arrived: they got the next empty cabin and none of their things. Now every player has a permanent id
   (myPid, kept with their profile) and the host keeps one name per id. That one name is the key everything else already uses
   (cabins, homes after a wedding, saved backpacks, pay), so rejoining always lands you in your own cabin with your own things.
   Also: an update that reloads a farmhand's game takes them straight back to the farm, a host whose game restarts (an update,
   a refresh) is waited for instead of sending everyone home, a farmhand's backpack is sent to the host every 45 seconds (not
   only on the way out), and the host can empty a cabin that was given out by mistake. ================= */
const IDN={off:[],wait:0,waitT:null,card:null};
// the name to introduce yourself with: the character's name, else the one in your own save, else Farmhand
function myFarmName(){const n=NAME()||(HOST.ownPersonal&&HOST.ownPersonal.look&&String(HOST.ownPersonal.look.name||'').trim())||'';return clean(n||'Farmhand');}
// ---- the host: one name per player id
function idnMap(){S.fhIds=S.fhIds&&typeof S.fhIds==='object'?S.fhIds:{};return S.fhIds;}
function idnTaken(nm,id){return Object.entries(idnMap()).some(([k,v])=>k!==id&&v===nm);}
function idnRename(a,b){if(!a||!b||a===b)return;const w=S.world||{};
  for(const M of [w.slots,w.homes,w.owed,S.farmhands])if(M&&typeof M==='object'&&Object.prototype.hasOwnProperty.call(M,a)){if(!Object.prototype.hasOwnProperty.call(M,b))M[b]=M[a];delete M[a];}
  for(const c of (w.couples||[])){if(c.a===a)c.a=b;if(c.b===a)c.b=b;}
  for(const e of (S.ship||[]))if(e&&e.by===a)e.by=b;
  for(const k of Object.keys(HOST.members||{}))if(HOST.members[k]===a)HOST.members[k]=b;}
function idnCanon(id,n){n=clean(n);if(typeof id!=='string'||!id)return n;id=id.slice(0,40);const M=idnMap();let c=M[id];
  const w=S.world||{},held=nm=>(w.slots&&nm in w.slots)||(w.homes&&nm in w.homes);
  if(c){   // a returning player: they keep their name here, unless they gave their character a new one that nobody else has
    if(n!==c&&n!=='Farmhand'&&!idnTaken(n,id)&&!held(n)){idnRename(c,n);M[id]=n;c=n;}
    return c;}
  // first time with an id: keep the name they've always had here (their cabin and things come with it), unless it's someone else's
  c=n;if(idnTaken(c,id)){let k=2;while(idnTaken(c+' '+k,id))k++;c=c+' '+k;}
  M[id]=c;return c;}
// a guest takes the name the host knows them by, for this farm only (their own save keeps their character as it was)
function idnApply(){if(HOST.role!=='guest'||!HOST.myName||!S.look)return;if(NAME()!==HOST.myName)S.look.name=HOST.myName;}
{const _pp=putPersonal;putPersonal=function(o){const r=_pp.apply(this,arguments);try{idnApply();}catch(e){}return r;};}
// (wired before every other handler, so the name in a hello or a backpack is already the right one when they read it)
{const _hw=hostWire;hostWire=function(){for(const f of IDN.off)try{f();}catch(e){}IDN.off=[];const r=CO.room;
  if(r&&r.on){const on=(t,f)=>IDN.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m.data,m.peer);}catch(e){}}));
    on('hello',(d,peer)=>{if(HOST.role!=='host'||!d||typeof d!=='object')return;const c=idnCanon(d.id,d.n);d.n=c;
      r.emit('who',{id:d.id||null,n:c},peer);
      // a cabin wrongly given to a stand-in name ("Farmhand") while this player's own name already had one: hand it back
      try{const w=S.world;if(w&&w.slots&&c!=='Farmhand'&&Number.isInteger(w.slots[c])&&Number.isInteger(w.slots.Farmhand)&&!Object.values(idnMap()).includes('Farmhand')){delete w.slots.Farmhand;}}catch(e){}});
    on('mine',(d)=>{if(HOST.role!=='host'||!d||typeof d!=='object')return;if(d.id)d.n=idnCanon(d.id,d.n);});
    on('who',(d)=>{if(HOST.role!=='guest'||!d||d.id!==myPid())return;HOST.myName=clean(d.n);idnApply();});}
  return _hw.apply(this,arguments);};}
// ---- a farmhand's backpack reaches the host now and then, so a dropped connection never costs more than a minute of it
setInterval(()=>{try{if(HOST.role==='guest'&&HOST.joined&&!IDN.wait&&S.mode==='play')guestPersist();}catch(e){}},45000);
// ---- the host's game restarting (an update, a refresh): wait for them, then carry on where the farm is
function hostWait(){if(IDN.wait)return;IDN.wait=performance.now();try{guestPersist();}catch(e){}S.paused=true;
  const c=document.createElement('div');c.id='idnWait';c.style.cssText='position:fixed;left:50%;top:38%;transform:translate(-50%,-50%);z-index:60;max-width:min(420px,90vw);padding:16px 18px;text-align:center;font:15px/1.4 "Hollow Pixel",monospace;color:#f4e6c8;background:#2a1a0e;box-shadow:0 0 0 2px #1a0e06,inset 0 0 0 2px #b8521c,6px 6px 0 rgba(0,0,0,.4)';
  c.innerHTML=`<b style="color:#ffd27a">${clean(HOST.hostName||'The host')}’s game is restarting.</b><div style="margin:6px 0 12px;color:#d8c8a8;font-size:13px">Waiting for them to come back. The farm is just as you left it.</div><button class="btn" id="idnHome">Go home instead</button>`;
  document.body.appendChild(c);IDN.card=c;$('idnHome').onclick=()=>{idnStopWait();hostGone();};
  const tick=()=>{if(!IDN.wait)return;if(performance.now()-IDN.wait>75000){idnStopWait();hostGone();return;}
    try{CO.room&&CO.room.emit&&CO.room.emit('hello',{n:myFarmName(),id:myPid()});}catch(e){}IDN.waitT=setTimeout(tick,3000);};IDN.waitT=setTimeout(tick,2500);}
function idnStopWait(){IDN.wait=0;clearTimeout(IDN.waitT);if(IDN.card){IDN.card.remove();IDN.card=null;}S.paused=false;}
{const _as=applySnap;applySnap=function(data,first,hand){const back=!!IDN.wait;if(back)idnStopWait();const r=_as.apply(this,arguments);
  if(back)setTimeout(()=>toast(`${clean(HOST.hostName||'The host')} is back. Carry on.`,3),50);return r;};}
// ---- after an update reloads a farmhand's game, it goes back into the farm by itself
{let aj=null;try{aj=sessionStorage.getItem('hollowAutoJoin');sessionStorage.removeItem('hollowAutoJoin');}catch(e){}
  if(aj){const go=()=>{const b=[...document.querySelectorAll('#title button')].find(x=>/^Join farm/.test(x.textContent));
      if($('loadScr')||!b||S.mode!=='title'){setTimeout(go,300);return;}b.click();setTimeout(()=>toast('Updated to the newest version. Back on the farm.',3.4),2500);};setTimeout(go,400);}}
// ---- the host's Together tab: who lives where, and emptying a cabin given out by mistake
{const _rc=renderCoop;renderCoop=function(){_rc();try{if(HOST.role!=='host'||!mpOn()||!mpOwn())return;const B=$('bagBody');if(!B)return;const w=S.world;
    const n=Math.min(FH_SPOTS.length,w.hands|0);if(!n)return;const box=document.createElement('div');box.style.cssText='margin-top:10px;padding:8px 10px;background:rgba(0,0,0,.18)';
    const online=new Set(Object.values(HOST.members||{}));
    let h='<b>Cabins</b><p class="jsub" style="font-size:12px;margin:4px 0">If someone ended up in the wrong cabin, empty it. Their own cabin is kept for them, and an empty one goes to whoever moves in next.</p>';
    for(let i=0;i<n;i++){const o=fhOwner(i);h+=`<div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span style="flex:1">The ${FH_PAINT[i].n} cabin: ${o?o+(o.split(' & ').some(x=>online.has(x))?' <small style="color:#9fc07a">· here now</small>':''):'<i style="color:#9a8a70">empty</i>'}</span>${o?`<button class="btn" data-empty="${i}" style="font-size:12px;padding:4px 10px">Empty it</button>`:''}</div>`;}
    box.innerHTML=h;B.appendChild(box);
    box.querySelectorAll('[data-empty]').forEach(b=>b.onclick=()=>{if(!b.dataset.sure){b.dataset.sure=1;b.textContent='Sure? Tap again';return;}
      const i=+b.dataset.empty;for(const [k,v] of Object.entries(w.slots||{}))if(v===i)delete w.slots[k];
      try{CO.room&&CO.room.emit&&CO.room.emit('mpw',{world:mpWorldOut()});}catch(e){}try{saveGame&&saveGame();}catch(e){}
      toast(`The ${FH_PAINT[i].n} cabin is empty now.`,2.4);renderCoop();});}catch(e){}};}
