/* ================= #240 #257 one night for everyone on a shared farm. The night only ends when every player on the farm
   is in bed (like Stardew): whoever turns in first lies there with a card saying who the farm is waiting for, and can get up
   again. When the last one lies down, the host's night ends and the new morning goes to everyone. At 2 AM everyone drops where
   they stand, together (a farmhand's game no longer "collapses" on its own every few seconds, losing the shared purse 8 coins
   each time, while waiting for the host's morning).
   The day and the weather are the host's: with the clock the host now also sends whether the storm is on, so rain, lightning
   and fog match on every screen, and a farmhand whose day is wrong is sent the farm again straight away. ================= */
const ZZ={me:false,inner:null,asleep:{},card:null,names:{asleep:[],awake:[]},tired:false,off:[]};
// the farmhands connected right now (peer -> name), as the host knows them
function zzOnline(){const live=new Set((CO.peers||[]).filter(p=>!p.isMe).map(p=>p.peer));const o={};for(const [p,n] of Object.entries(HOST.members||{}))if(live.has(p))o[p]=n;return o;}
const zzShared=()=>(HOST.role==='host'&&Object.keys(zzOnline()).length>0)||(HOST.role==='guest'&&HOST.joined);
function zzCardOff(){if(ZZ.card){ZZ.card.remove();ZZ.card=null;}}
function zzCardShow(){const waiting=ZZ.names.awake.filter(n=>n!==myFarmName()&&n!==NAME());
  const who=waiting.length?waiting.join(', ').replace(/, ([^,]*)$/,' and $1'):'';
  const html=`<b style="color:#ffd27a">You’re in bed.</b><div style="margin:6px 0 12px;color:#d8c8a8;font-size:13px">${who?`The night ends when everyone is asleep. Waiting for ${clean(who)}.`:'Everyone’s asleep. Morning is coming…'}</div><button class="btn" id="zzUp">Get up</button>`;
  if(!ZZ.card){const c=document.createElement('div');c.id='zzCard';c.style.cssText='position:fixed;left:50%;bottom:22%;transform:translateX(-50%);z-index:55;max-width:min(420px,90vw);padding:14px 18px;text-align:center;font:15px/1.4 "Hollow Pixel",monospace;color:#f4e6c8;background:#2a1a0e;box-shadow:0 0 0 2px #1a0e06,inset 0 0 0 2px #b8521c,6px 6px 0 rgba(0,0,0,.4)';document.body.appendChild(c);ZZ.card=c;}
  if(ZZ.card._h!==html){ZZ.card._h=html;ZZ.card.innerHTML=html;$('zzUp').onclick=zzGetUp;}}
function zzGetUp(){if(!ZZ.me)return;ZZ.me=false;zzCardOff();toast('You get back up.',1.6);
  try{if(HOST.role==='guest'&&CO.room&&HOST.hostPeer)CO.room.emit('zzz',{on:0},HOST.hostPeer);else if(HOST.role==='host')zzTell();}catch(e){}}
// the host tells everyone who's asleep and who isn't
function zzTell(){if(HOST.role!=='host'||!CO.room||!CO.room.emit)return;const on=zzOnline();const asleep=[],awake=[];const me=NAME()||'The host';
  (ZZ.me?asleep:awake).push(me);for(const [p,n] of Object.entries(on))(ZZ.asleep[p]?asleep:awake).push(n);
  ZZ.names={asleep,awake};try{CO.room.emit('zzs',{asleep,awake});}catch(e){}if(ZZ.me)zzCardShow();}
// turning in
{const _sl=sleep;ZZ.inner=_sl;sleep=function(){if(S.mode!=='play'||!zzShared())return _sl.apply(this,arguments);
  if(HOST.role==='guest'){ZZ.me=true;ZZ.names={asleep:[],awake:[HOST.hostName||'the host']};zzCardShow();try{CO.room.emit('zzz',{on:1},HOST.hostPeer);}catch(e){}return;}
  // the host: lie down and wait unless everyone else is already asleep
  const on=zzOnline();if(Object.keys(on).every(p=>ZZ.asleep[p])){ZZ.me=false;zzCardOff();ZZ.asleep={};return _sl.apply(this,arguments);}
  ZZ.me=true;zzTell();zzCardShow();};}
// lying in bed: no walking about, no swinging tools
{const _mi=mindInput;mindInput=function(mx,mz){const r=_mi(mx,mz);return ZZ.me?[0,0]:r;};}
{const _oa=onAct;onAct=function(){if(ZZ.me)return;return _oa.apply(this,arguments);};}
// the host checks whether the last one has lain down
setInterval(()=>{try{if(HOST.role!=='host'||!ZZ.me||S.mode!=='play')return;const on=zzOnline();
  if(Object.keys(on).every(p=>ZZ.asleep[p])){ZZ.me=false;zzCardOff();ZZ.asleep={};ZZ.inner();}}catch(e){}},500);
// 2 AM on a shared farm: a farmhand waits for the host's collapse (which brings everyone the morning) instead of their own
{const _co=collapse;collapse=function(){if(HOST.role==='guest'&&HOST.joined){S.hour=Math.min(S.hour,25.95);
    if(!ZZ.tired){ZZ.tired=true;toast('You’re dead on your feet. The moment the farm’s night ends, you drop.',3.4,true);}return;}return _co.apply(this,arguments);};}
// a new morning (or a fresh copy of the farm) gets everyone out of bed
{const _nd=newDay;newDay=function(){if(HOST.role!=='guest'||HOST.applying){ZZ.asleep={};ZZ.me=false;zzCardOff();ZZ.tired=false;}return _nd.apply(this,arguments);};}
{const _as=applySnap;applySnap=function(){const r=_as.apply(this,arguments);ZZ.me=false;ZZ.tired=false;zzCardOff();return r;};}
// the wire: who's in bed, and the host's weather along with the clock
{const _hw=hostWire;hostWire=function(){for(const f of ZZ.off)try{f();}catch(e){}ZZ.off=[];const r=CO.room;
  if(r&&r.on){const on=(t,f)=>ZZ.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m.data,m.peer);}catch(e){}}));
    on('zzz',(d,peer)=>{if(HOST.role!=='host'||!d)return;ZZ.asleep[peer]=!!d.on;const n=(HOST.members||{})[peer];if(n&&d.on&&!ZZ.me)toast(`${n} has gone to bed.`,2.4);zzTell();});
    on('zzs',d=>{if(HOST.role!=='guest'||!d||!Array.isArray(d.asleep)||!Array.isArray(d.awake))return;ZZ.names={asleep:d.asleep.map(clean),awake:d.awake.map(clean)};if(ZZ.me)zzCardShow();
      else if(d.asleep.length&&!ZZ.saidT){ZZ.saidT=1;toast(`${d.asleep.map(clean).join(', ')} ${d.asleep.length>1?'are':'is'} in bed. The night ends when everyone is.`,3);setTimeout(()=>ZZ.saidT=0,20000);}});
    on('wx',d=>{if(HOST.role!=='guest'||!d)return;HOST.hostPeer=HOST.hostPeer||null;
      if(typeof STG!=='undefined'&&STG)return;S.storm=!!d.storm;if(typeof d.bound==='boolean')S.bound=d.bound;});}   // (#263) whatever the day; the clock fixes the day
  return _hw.apply(this,arguments);};}
// the host sends the weather every two seconds, and whenever it changes
{let t=0,last='';const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{if(HOST.role!=='host'||!CO.room||!CO.room.emit)return;t-=dt;const k=S.day+'|'+S.storm+'|'+S.bound;
    // (#263) the weather now rides on the world clock (mpsync.js), so a cutscene's staged storm never goes out to anyone
    // someone who left while lying in bed shouldn't keep the night going
    if(ZZ.me){const on=zzOnline();for(const p of Object.keys(ZZ.asleep))if(!(p in on))delete ZZ.asleep[p];}}catch(e){}};}
