/* ================= #264 on a shared farm the story moves on together. Driving out in the mended car, lighting the last of
   the three stones and opening the Tithe House door used to happen to whoever did it, alone, while everyone else carried on
   in a story that had quietly moved on without them. Now those moments wait until every player is there (within a few
   steps, outside, at the same place): whoever starts it sees who the farm is waiting for, the others are pointed to them,
   and when the last one arrives the scene plays on every screen at once (the car pulls away with all of you in it). At the
   Tithe House the one who opened the door makes the choice, and everyone lives the ending it brings. ================= */
const MSG8={pend:null,card:null,off:[],firing:false,choosing:false,waitFor:null,t:0,tellT:0};
const MS_BEATS={
  escape:{r:8,where:'the car',verb:'drive out of the valley',short:'drive out'},
  ritual:{r:10,where:'the third stone',verb:'light the last flame',short:'light it'},
  tithe:{r:8,where:'the Tithe House door',verb:'open the door',short:'open it'}};
const msShared=()=>typeof wcShared==='function'&&wcShared();
// ---- the card for whoever started it
function msCardOff(){if(MSG8.card){MSG8.card.remove();MSG8.card=null;}}
function msCard(k,miss,total){const B=MS_BEATS[k];if(!B)return;MSG8.lastMiss=miss||null;
  const n=total||(miss?miss.length+1:0),here=miss?n-miss.length:0;
  const who=miss&&miss.length?miss.map(m=>`<b style="color:#ffd27a">${clean(m.n)}</b> <span style="color:#c8b48c">· ${m.w}</span>`).join(', '):'';
  const html=`<div style="flex:1;min-width:0;text-align:left"><b style="color:#ffd27a">Everyone has to be here</b>${n?` <span style="color:#c8b48c">· ${here} of ${n}</span>`:''}
    <div style="margin-top:3px;color:#d8c8a8;font-size:13px">${who?`Waiting for ${who}.`:'Waiting for everyone…'} You’ll ${B.short} together.</div></div>
    <button class="btn" id="msStop" style="flex:none;min-height:40px;padding:6px 16px">Not yet</button>`;
  if(!MSG8.card){const c=document.createElement('div');c.id='msCard';
    c.style.cssText='position:fixed;z-index:55;display:flex;align-items:center;gap:12px;box-sizing:border-box;padding:9px 12px;font:15px/1.35 "Hollow Pixel",monospace;color:#f4e6c8;background:#2a1a0e;box-shadow:0 0 0 2px #1a0e06,inset 0 0 0 2px #b8521c,4px 4px 0 rgba(0,0,0,.4)';
    document.body.appendChild(c);MSG8.card=c;}
  // docked under the objective bar, at its width, so the car and whoever is waiting by it stay in view
  const o=ui.obj&&!ui.obj.hidden&&ui.obj.getBoundingClientRect(),c=MSG8.card;
  if(o&&o.width>40){c.style.left=Math.round(o.left)+'px';c.style.width=Math.round(o.width)+'px';c.style.top=Math.round(o.bottom+6)+'px';c.style.transform='';}
  else{c.style.left='50%';c.style.width='min(560px,92vw)';c.style.top='calc(env(safe-area-inset-top,0px) + 70px)';c.style.transform='translateX(-50%)';}
  if(c._h!==html){c._h=html;c.innerHTML=html;$('msStop').onclick=()=>msStop(true);}}
// where someone is, in the same words the other screens use (which way and how far, from where the story is waiting)
function msWhere(p,at){let x=p.x,z=p.z,ins=false;if(p.r){const R=ROOMS[p.r];if(R&&R.out){x=R.out.x;z=R.out.z;ins=true;}}
  const dx=x-at.x,dz=z-at.z,d=Math.hypot(dx,dz),a=Math.atan2(dx,-dz),i=((Math.round(a/(Math.PI/4))%8)+8)%8;
  return (ins?'indoors, ':'')+(d<3?'just here':`${Math.round(d)} m ${COMPASS[i][0]}`);}
// everyone on the farm right now, where they stand (the host's view)
function msPlayers(){const out=[{n:NAME()||'The host',x:P.x,z:P.z,r:S.room||'',me:1}];const on=zzOnline();
  for(const p of (CO.peers||[])){if(p.isMe||!(p.peer in on))continue;const q=p.presence;if(q&&isFinite(q.x)&&isFinite(q.z))out.push({n:on[p.peer],x:+q.x,z:+q.z,r:q.r||'',peer:p.peer});}
  return out;}
function msMissing(pd){const B=MS_BEATS[pd.k];return msPlayers().filter(p=>(p.r||'')!==(pd.at.r||'')||Math.hypot(p.x-pd.at.x,p.z-pd.at.z)>B.r).map(p=>({n:p.n,w:msWhere(p,pd.at)}));}
// ---- asking to move the story on
function msAsk(k,a){const at={x:+P.x.toFixed(2),z:+P.z.toFixed(2),r:S.room||''};
  if(HOST.role==='host'){MSG8.pend={k,a,at,by:NAME()||'The host',peer:null,mine:true};msHostLoop(true);return;}
  MSG8.pend={k,a,at,by:myFarmName(),mine:true};msCard(k,null);
  try{CO.room.emit('sreq',{k,a,at},HOST.hostPeer||undefined);}catch(e){}}
function msStop(tell){const pd=MSG8.pend;MSG8.pend=null;msCardOff();if(!pd)return;
  if(tell)try{if(HOST.role==='host')CO.room.emit('sstop',{k:pd.k});else CO.room.emit('sstop',{k:pd.k},HOST.hostPeer||undefined);}catch(e){}}
// the host decides: when everyone's in range, everyone goes
function msHostLoop(now){const pd=MSG8.pend;if(HOST.role!=='host'||!pd)return;
  if(!msShared()){MSG8.pend=null;msCardOff();msRun(pd.k,pd.a,true);return;}
  const miss=msMissing(pd);
  if(!miss.length){MSG8.pend=null;msCardOff();const go={k:pd.k,a:pd.a,by:pd.by};try{CO.room.emit('sgo',go);}catch(e){}msGo(go,!!pd.mine);return;}
  const total=msPlayers().length;if(pd.mine)msCard(pd.k,miss,total);
  else{const me=clean(NAME()||'The host'),meIn=!miss.some(m=>clean(m.n)===me);   // a farmhand is waiting: the host is pointed to them like anyone else
    if(!MSG8.waitFor||MSG8.waitFor.k!==pd.k){if(!meIn)toast(`${clean(pd.by)} is waiting at ${MS_BEATS[pd.k].where}. Everyone has to be there for the story to move on.`,3.4);}
    MSG8.waitFor={k:pd.k,by:pd.by,at:{x:pd.at.x,z:pd.at.z},t:performance.now()};}
  if(now||performance.now()-MSG8.tellT>1500){MSG8.tellT=performance.now();try{CO.room.emit('swait',{k:pd.k,by:pd.by,at:pd.at,miss,n:total});}catch(e){}}}
setInterval(()=>{try{msHostLoop(false);
    // whoever started it walked off: it's off
    const pd=MSG8.pend;if(pd&&pd.mine&&S.mode==='play'&&((S.room||'')!==(pd.at.r||'')||Math.hypot(P.x-pd.at.x,P.z-pd.at.z)>MS_BEATS[pd.k].r+3)){msStop(true);toast('You walk away. It can wait.',2);}}catch(e){}},400);
// everyone plays it, at the same moment
function msGo(g,mine){MSG8.waitFor=null;msCardOff();if(MSG8.pend&&MSG8.pend.k===g.k)MSG8.pend=null;msRun(g.k,g.a,mine,g.by);}
function msRun(k,a,mine,by){MSG8.firing=true;try{
    if(k==='escape')startCine('escape');
    else if(k==='ritual'){const al=altars[a|0];if(!al)return;if(mine&&!al.lit)lightAltar(al);else{al.lit=true;SFX.ignite&&SFX.ignite();burst(al.x,al.z,40,'#ff9040',2.5,1.2,3);startRitualEnd();}}
    else if(k==='tithe'){if(mine){MSG8.choosing=msShared();stChoice();}
      else openNote(`<h3>The Tithe House</h3><p>The ring of stones is full of people. The whole valley, standing in the dark with their backs to you, facing the door.</p><p><b>${clean(by||'Someone')}</b> has their hand on it. Whatever they choose, all of you will live with it.</p>`,'Wait');}
  }finally{MSG8.firing=false;}}
// ---- the gates
{const _sc=startCine;startCine=function(kind){if(kind==='escape'&&!MSG8.firing&&msShared()){msAsk('escape',0);return;}return _sc.apply(this,arguments);};}
{const _la=lightAltar;lightAltar=function(a){if(!MSG8.firing&&msShared()&&!a.lit&&lit()>=2){msAsk('ritual',altars.indexOf(a));return;}return _la.apply(this,arguments);};}
{const _ch=stChoice;stChoice=function(){if(!MSG8.firing&&msShared()){msAsk('tithe',0);return;}return _ch.apply(this,arguments);};}
// the chosen ending goes to everyone
{const _se=stEnding;stEnding=function(k){if(MSG8.choosing){MSG8.choosing=false;try{CO.room.emit('send',{k});}catch(e){}}return _se.apply(this,arguments);};}
{const _nc=$('noteClose');if(_nc)_nc.addEventListener('click',()=>{MSG8.choosing=false;},true);}
// ---- the others: who's waiting, and where
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);try{const pd=MSG8.pend;
    if(pd&&pd.mine&&S.mode==='play'){const B=MS_BEATS[pd.k],m=MSG8.lastMiss||[];   // waiting: stay put, rather than being sent off to the day's chores
      return ['Together',`Waiting for ${m.length?m.map(q=>clean(q.n)).join(', '):'everyone'} at ${B.where}. Stay close.`,null];}
    const w=MSG8.waitFor;if(w&&S.mode==='play'&&performance.now()-w.t<5000){const B=MS_BEATS[w.k];const t={x:w.at.x,z:w.at.z};
    return ['Together',`${clean(w.by)} is waiting for you at ${B.where}, ready to ${B.verb}.`+(typeof wayChip==='function'?wayChip(t):''),t];}}catch(e){}return r;};}
// in the car together: nobody is left standing in the road while it drives off
{const _dp=drawPeer;drawPeer=function(){if(typeof cine!=='undefined'&&cine&&cine.escape)return;return _dp.apply(this,arguments);};}
// ---- the wire
{const _hw=hostWire;hostWire=function(){const r=_hw.apply(this,arguments);for(const f of MSG8.off.splice(0))try{f();}catch(e){}const R=CO.room;
  if(R&&R.on){const on=(t,f)=>MSG8.off.push(R.on(t,m=>{if(!m||m.isMe)return;try{f(m.data,m.peer);}catch(e){}}));
    on('sreq',(d,peer)=>{if(HOST.role!=='host'||!d||!MS_BEATS[d.k]||!d.at||!isFinite(d.at.x)||!isFinite(d.at.z))return;
      MSG8.pend={k:d.k,a:d.a|0,at:{x:+d.at.x,z:+d.at.z,r:String(d.at.r||'')},by:(HOST.members||{})[peer]||'A farmhand',peer,mine:false};msHostLoop(true);});
    on('sstop',(d,peer)=>{if(HOST.role==='host'){if(MSG8.pend&&!MSG8.pend.mine&&MSG8.pend.peer===peer){MSG8.pend=null;try{R.emit('sstop',{k:d&&d.k});}catch(e){}}return;}
      MSG8.waitFor=null;});
    on('swait',d=>{if(HOST.role!=='guest'||!d||!MS_BEATS[d.k]||!d.at)return;const mine=MSG8.pend&&MSG8.pend.mine&&MSG8.pend.k===d.k;
      if(mine){msCard(d.k,Array.isArray(d.miss)?d.miss.slice(0,8).map(m=>({n:String(m.n||''),w:clean(m.w).slice(0,40)})):null,d.n|0);return;}
      const meIn=Array.isArray(d.miss)&&!d.miss.some(m=>clean(m.n)===clean(myFarmName())||clean(m.n)===clean(NAME()));
      if(!MSG8.waitFor||MSG8.waitFor.k!==d.k){if(!meIn)toast(`${clean(d.by)} is waiting at ${MS_BEATS[d.k].where}. Everyone has to be there for the story to move on.`,3.4);}
      MSG8.waitFor={k:d.k,by:d.by,at:{x:+d.at.x,z:+d.at.z},t:performance.now()};});
    on('sgo',d=>{if(!d||!MS_BEATS[d.k])return;msGo(d,!!(HOST.role==='guest'&&MSG8.pend&&MSG8.pend.mine&&MSG8.pend.k===d.k));});
    on('send',d=>{if(!d||!ST_END[d.k]||S.st.done)return;$('note').hidden=true;noteCb=null;S.paused=false;MSG8.choosing=false;stEnding(d.k);});}
  return r;};}
