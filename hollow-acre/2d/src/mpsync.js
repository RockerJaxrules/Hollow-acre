/* ================= #263 one world for everyone on a shared farm. Players saw different times, different weather and the
   townsfolk in different places, and once it slipped it only got worse. Why:
   - the host's clock stopped whenever the host opened a menu, played a minigame or a cutscene, or put the game in the
     background, while a farmhand's kept running; then it was dragged back, so the bell, the storm and the evening went off
     at the wrong times on the farmhand's screen;
   - a cutscene's staged hour and storm (a night-time heart event) could go out to everyone;
   - once the days differed, a farmhand's game ignored the host's clock and weather altogether and waited for the whole farm
     to be sent again, which could take a while or never arrive, so it sat at 2 AM in the rain while the host had morning;
   - every game moved the townsfolk itself, each with its own dice.
   Now the host keeps one world clock on real time, whatever the host is doing, and sends it every second with the weather;
   a farmhand follows it every time it arrives (a new day included: it asks for the farm again and, if that's slow, takes the
   morning anyway), and the host's townsfolk are the only townsfolk: where they stand, which way they face and whether they're
   walking go out four times a second, and they stop for a farmhand who walks up or talks to them, as they do for the host.
   A farmhand's own heart events and cutscenes still run on their own clock until they end. ================= */
const WC={day:0,hour:0,storm:false,t:0,frameT:0,adopted:0,norm:false,sendT:0,want:0,reqT:0,adoptT:0,got:0,npcAt:0,tgt:{},sent:{},fullT:0,holds:{},holdT:0};
const wcStaged=()=>(typeof STG!=='undefined'&&!!STG)||S.mode!=='play';
const wcShared=()=>HOST.role==='host'?Object.keys(zzOnline()).length>0:HOST.role==='guest'&&HOST.joined;
// ---- the host: the world clock
function wcHostTick(){if(HOST.role!=='host'||!CO.room||!CO.room.emit)return;const now=performance.now();
  if(S.mode==='title'||S.mode==='load'||S.mode==='end'){WC.t=now;return;}
  // alone, the world clock is simply the host's clock (it stops for menus as it always did)
  if(!wcShared()||S.day!==WC.day){WC.day=S.day;WC.hour=S.hour;WC.storm=!!S.storm;WC.t=now;if(!wcShared())return;}
  // the host's own frames keep it while they're playing; otherwise it runs on by itself (to 2 AM, where everyone drops)
  if(!WC.norm||now-WC.frameT>300){WC.hour=Math.min(25.99,WC.hour+(now-WC.t)/1000/(WC.hour<20?DAY_SEC:NIGHT_SEC));WC.t=now;}
  WC.sendT-=.25;if(WC.sendT>0)return;WC.sendT=1;
  try{CO.room.emit('time',{day:WC.day,hour:+WC.hour.toFixed(4),st:WC.storm?1:0,b:S.bound?1:0});}catch(e){}}
setInterval(()=>{try{wcHostTick();}catch(e){}},250);
// ---- a farmhand: follow the host's clock
function wcGuestTime(d){if(!d||!isFinite(d.hour))return;const now=performance.now();WC.got=now;
  if(!HOST.joined)return;const day=d.day|0,hour=+d.hour;
  if(day!==S.day){WC.want=day;
    // ask for the farm (the morning's crops and everything else); keep asking until it comes
    if(now-WC.reqT>4000){WC.reqT=now;try{CO.room.emit('resync',{n:myFarmName(),id:myPid()},HOST.hostPeer||undefined);}catch(e){}}
    if(!WC.adoptT)WC.adoptT=now;
    // the farm is slow to come (a weak connection): take the morning anyway, and the crops will follow
    if(now-WC.adoptT>6000&&!wcStaged()){WC.adoptT=0;wcAdopt(day,hour,d);}
    return;}
  WC.adoptT=0;WC.want=0;
  if(wcStaged())return;   // your own heart event or cutscene keeps its own hour until it ends
  if(Math.abs(S.hour-hour)>.03){
    if(hour<20&&S.bellRung)S.bellRung=false;if(hour<18&&S.dusk)S.dusk=false;   // dragged back past the bell? it'll ring again on time
    S.hour=hour;}
  S.storm=!!d.st;if(d.b!=null)S.bound=!!d.b;}
// a new day without the farm (it'll come): the clock, the weather and a night's sleep
function wcAdopt(day,hour,d){const rested=typeof ZZ!=='undefined'&&ZZ.me;WC.adopted=day;S.day=day;S.hour=hour;S.bellRung=hour>=20;S.dusk=hour>=18;S.storm=!!d.st;S.night={};if(d.b!=null)S.bound=!!d.b;
  try{H.state='gone';H.timer=6;H.vis=false;}catch(e){}try{placeNPCs();}catch(e){}try{zzCardOff();ZZ.me=false;}catch(e){}
  wcMorning(rested);try{if(typeof mpOwn==='function'&&mpOwn())mpGoHome(true);}catch(e){}
  toast(`Day ${S.day}. ${HOST.hostName||'The host'} went to bed, so the night is over for everyone.`,4);}
// what a night's sleep does for a farmhand (their own energy, health, nerve and day's talk; the host's game does the farm)
function wcMorning(rested){const bad=!rested;
  S.energy=Math.round(S.energyMax*(bad?.55:1));S.hp=Math.min(S.hpMax,S.hp+(bad?20:S.hpMax));
  try{const low=M.v<55&&!S.bound;M.v=clamp(Math.max(M.v,low?55:70)+25,0,100);M.figs.length=0;M.dop=null;M.rush=null;}catch(e){}
  S.talkedToday={};if((S.day-1)%7===0||(typeof dayOfMonth==='function'&&dayOfMonth()===1))S.giftsWeek={};
  try{updateHud&&updateHud();}catch(e){}}
// the host's own frames: while the host is really playing, the world clock is the host's clock; coming back from a menu,
// a minigame or a cutscene, the host catches up with the world instead of pulling everyone back
{const _u=update;update=function(dt){
  const host=HOST.role==='host'&&wcShared();let hold=null;
  if(host)hold=wcHoldNear();
  _u(dt);
  if(HOST.role==='host'){const norm=S.mode==='play'&&!S.paused&&!(typeof STG!=='undefined'&&STG),now=performance.now();
    if(norm){if(host&&(!WC.norm||now-WC.frameT>300)&&S.day===WC.day&&WC.hour>S.hour)S.hour=WC.hour;
      WC.day=S.day;WC.hour=S.hour;WC.storm=!!S.storm;WC.t=now;WC.frameT=now;}
    WC.norm=norm;}
  if(hold)wcHoldApply(hold);
  if(HOST.role==='guest'&&HOST.joined)wcGuestNpcs(dt);};}
// ---- the townsfolk: the host's are everyone's
const WC_DIR={N:0,E:1,S:2,W:3},WC_DIRS='NESW';
function wcNpcRec(n){return [n.def.id,Math.round(n.x*50)/50,Math.round(n.z*50)/50,WC_DIR[n.dir]|0,n.clip||'idle',n.vis?1:0,n.loc||''];}
setInterval(()=>{try{if(HOST.role!=='host'||!CO.room||!CO.room.emit||!wcShared())return;if(S.mode==='title'||S.mode==='load')return;
    // in the host's own cutscene the townsfolk are actors: farmhands see them carry on as usual (their own games move them meanwhile)
    if(typeof STG!=='undefined'&&STG)return;
    const now=performance.now(),full=now-WC.fullT>3000;if(full)WC.fullT=now;const a=[];
    for(const n of npcs){if(!n.def||!n.def.id)continue;const r=wcNpcRec(n),k=r.join('|');if(!full&&WC.sent[n.def.id]===k)continue;WC.sent[n.def.id]=k;a.push(r);}
    if(a.length)CO.room.emit('npc',{a,f:full?1:0});}catch(e){}},250);
function wcNpcIn(d){if(HOST.role!=='guest'||!d||!Array.isArray(d.a))return;const now=performance.now();WC.npcAt=now;
  for(const r of d.a){if(!Array.isArray(r)||typeof r[0]!=='string'||!isFinite(r[1])||!isFinite(r[2]))continue;
    WC.tgt[r[0]]={x:+r[1],z:+r[2],d:WC_DIRS[r[3]|0]||'S',c:String(r[4]||'idle').slice(0,12),v:!!r[5],l:String(r[6]||'')||null,at:now};}}
const wcFresh=()=>HOST.role==='guest'&&HOST.joined&&performance.now()-WC.npcAt<2500;
// a farmhand's game stops deciding where the townsfolk go while the host's word is fresh
{const _tt=townTick;townTick=function(dt){if(wcFresh()&&!wcStaged())return;return _tt.apply(this,arguments);};}
function wcGuestNpcs(dt){if(!wcFresh()||wcStaged())return;const byId={};
  for(const n of npcs){const id=n.def&&n.def.id,T=id&&WC.tgt[id];if(!T)continue;
    if(talkingTo===n){n.clip='talk';n.dir=dirOf(P.x-n.x,P.z-n.z);continue;}
    n.vis=T.v;if(T.l)n.loc=T.l;n.route=null;n.def.path=[[T.x,T.z]];n.wait=1;
    const dx=T.x-n.x,dz=T.z-n.z,dd=Math.hypot(dx,dz);
    if(dd>5||!n.vis){n.x=T.x;n.z=T.z;n.clip=T.c;n.dir=T.d;continue;}   // through a door, or out of sight: just be there
    if(dd<.004){n.x=T.x;n.z=T.z;n.clip=T.c==='walk'?'idle':T.c;n.dir=T.d;continue;}
    // glide after the host's position at about their walking pace, legs keeping time with the ground covered
    const sp=Math.max(typeof npcSpeed==='function'?npcSpeed(n)*1.1:1.9,dd*3),step=Math.min(dd,sp*dt);
    n.x+=dx/dd*step;n.z+=dz/dd*step;n.dir=T.c==='walk'||dd>.15?dirOf(dx,dz):T.d;n.clip=step>.0015?'walk':T.c;
    if(typeof npcStride==='function')npcStride(n,step);}}
// ---- walking up to someone, or talking to them, stops them on the host's farm too
function wcHoldNear(){const on=zzOnline(),now=performance.now(),out=[];
  const near=[];for(const p of (CO.peers||[])){if(p.isMe||!(p.peer in on))continue;const q=p.presence;if(q&&isFinite(q.x)&&isFinite(q.z))near.push(q);}
  for(const n of npcs){if(!n.vis||!n.def)continue;const h=WC.holds[n.def.id];let who=null;
    if(h&&h.until>now)who=h;else for(const q of near)if(Math.hypot(q.x-n.x,q.z-n.z)<1.6){who=q;break;}
    if(who)out.push({n,x:n.x,z:n.z,who,talk:!!(h&&h.until>now)});}
  return out;}
function wcHoldApply(list){for(const h of list){const n=h.n;if(!n.vis)continue;n.x=h.x;n.z=h.z;n.clip=h.talk?'talk':'idle';n.dir=dirOf(h.who.x-n.x,h.who.z-n.z);n._v=0;}}
setInterval(()=>{try{if(HOST.role!=='guest'||!HOST.joined||!talkingTo||!talkingTo.def||!CO.room)return;
    CO.room.emit('npchold',{id:talkingTo.def.id,x:+P.x.toFixed(2),z:+P.z.toFixed(2)},HOST.hostPeer||undefined);}catch(e){}},800);
// ---- the wire
{const off=[];const _hw=hostWire;hostWire=function(){const r=_hw.apply(this,arguments);for(const f of off.splice(0))try{f();}catch(e){}const R=CO.room;
  if(R&&R.on){const on=(t,f)=>off.push(R.on(t,m=>{if(!m||m.isMe)return;try{f(m.data,m.peer);}catch(e){}}));
    on('npc',d=>wcNpcIn(d));
    on('npchold',d=>{if(HOST.role!=='host'||!d||typeof d.id!=='string'||!isFinite(d.x)||!isFinite(d.z))return;WC.holds[d.id]={until:performance.now()+1800,x:+d.x,z:+d.z};});}
  return r;};}
// a farmhand's game never runs the night itself, not even the parts other modules add after the host's check
{const _nd=newDay;newDay=function(){if(HOST.role==='guest'&&!HOST.applying){S.hour=Math.min(S.hour,25.9);return;}return _nd.apply(this,arguments);};}
