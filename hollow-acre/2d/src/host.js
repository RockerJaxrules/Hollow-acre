/* ================= hosting, like Stardew: one player hosts their farm and gets a farm code; friends join with the code and play
   inside the host's world as farmhands. Shared: the field and crops, cleared ground, money, the time of day and the day itself
   (the day ends when the host goes to bed), and the story. Each farmhand keeps their own backpack, tools, seeds, energy, health,
   look and friendships, and those are saved on their own device. The host's game saves the farm. ================= */
const HOST={role:null,code:'',hostPeer:null,hostName:'',known:[],debKnown:new Set(),coins:0,applying:false,t:0,timeT:0,helloT:0,off:[],members:{}};
const PERSONAL=['inv','slots','slotSel','tools','seeds','sel','basket','energy','energyMax','hp','hpMax','look','water','waterMax','bigCan','flasks','rod','gear',
  'fishLog','fishCaught','bagSize','furnBag','tut','ls','friend','talkedToday','lastTalk','giftsWeek','heartSeen','lore','journal','keyItems','hz','deaths'];
const tileSig=t=>(t.tilled?1:0)+(t.wet?'w':'')+'|'+(t.crop?[t.crop.type,t.crop.stage,t.crop.watered?1:0].join(','):'-');
const debrisObjs=()=>OBJ.filter(o=>o.debris);const dKey=o=>o.x.toFixed(2)+','+o.z.toFixed(2)+','+o.debris;
const canHost=()=>!!(CO.lobby&&(CO.lobby.net||CO.lobby.claude));
function hostReset(){HOST.known=tiles.map(tileSig);HOST.debKnown=new Set(debrisObjs().filter(o=>o.hide).map(dKey));HOST.coins=S.coins;}
function takePersonal(){const o={};for(const k of PERSONAL)if(S[k]!==undefined)o[k]=JSON.parse(JSON.stringify(S[k]));return o;}
function putPersonal(o){for(const [k,v] of Object.entries(o))S[k]=v;}
function newCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ';let c='';for(let i=0;i<4;i++)c+=a[Math.floor(Math.random()*a.length)];return c+(10+Math.floor(Math.random()*90));}
function hostWire(){for(const f of HOST.off)try{f();}catch(e){}HOST.off=[];const r=CO.room;if(!r||!r.on)return;
  const on=(t,f)=>HOST.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m.data,m.peer);}catch(e){}}));
  on('hello',(d,peer)=>{if(HOST.role!=='host')return;const n=clean(d&&d.n);HOST.members[peer]=n;const hand=(S.farmhands||{})[n]||null;r.emit('snap',{data:saveData(true),host:NAME()||'The host',hand},peer);toast(`${clean(d&&d.n)} has joined your farm as a farmhand.`,3);});
  on('snap',(d,peer)=>{if(HOST.role!=='guest'||!d||!d.data)return;HOST.hostPeer=peer;HOST.hostName=clean(d.host);applySnap(d.data,!HOST.joined,d.hand);HOST.joined=true;});
  on('tile',d=>{if(!HOST.role||!d)return;const t=tiles[d.i|0];if(!t)return;t.tilled=!!d.t;t.wet=!!d.w;t.crop=d.c&&typeof d.c==='object'?d.c:null;HOST.known[d.i|0]=tileSig(t);});
  on('deb',d=>{if(!HOST.role||!d||!Array.isArray(d.ids))return;const want=new Set(d.ids.map(String));for(const o of debrisObjs()){const k=dKey(o);if(!want.has(k)||o.hide)continue;o.hide=true;o.goneDay=S.day;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}HOST.debKnown.add(k);}});
  on('tree',d=>{if(!HOST.role||!d||typeof d.k!=='string')return;fellRemote(d.k);});
  on('coin',d=>{if(!HOST.role||!d||!isFinite(d.d))return;const n=Math.max(-100000,Math.min(100000,d.d|0));S.coins=Math.max(0,S.coins+n);HOST.coins=S.coins;updateHud&&updateHud();});
  on('time',(d,peer)=>{if(HOST.role!=='guest'||!d)return;HOST.hostPeer=peer;if((d.day|0)!==S.day){if(performance.now()-HOST.helloT>3000){HOST.helloT=performance.now();r.emit('hello',{n:myFarmName(),id:myPid()},peer);}return;}
    if(isFinite(d.hour)&&Math.abs(S.hour-d.hour)>.08)S.hour=d.hour;});
  on('mine',(d,peer)=>{if(HOST.role!=='host'||!d||!d.p||typeof d.p!=='object')return;const n=clean(d.n);let js='';try{js=JSON.stringify(d.p);}catch(e){return;}if(js.length>200000)return;S.farmhands=S.farmhands||{};S.farmhands[n]=JSON.parse(js);});
  on('bye',(d,peer)=>{if(HOST.role==='guest'&&peer===HOST.hostPeer){if(d&&d.reload)hostWait();else hostGone();}});}
function applySnap(data,first,hand){const mine=first?(HOST.ownPersonal||hand||takePersonal()):takePersonal();HOST.applying=true;
  try{for(const t of tiles){t.tilled=false;t.crop=null;}loadGame(data);}finally{HOST.applying=false;}
  putPersonal(mine);applyLook();try{syncSlots&&syncSlots();renderHotbar&&renderHotbar();}catch(e){}
  P.x=1.6;P.z=-6.6;P.dir='S';P.fx=0;P.fz=1;S.room=null;
  if(!first&&typeof regenPass==='function')regenPass();hostReset();S.mode='play';S.paused=false;$('title').hidden=true;$('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;
  toast(first?`You’re on ${HOST.hostName}’s farm. Everything you grow here is shared. Your backpack is still yours.`:`Day ${S.day}. ${HOST.hostName} went to bed, so the night is over for everyone.`,4.2);}
async function hostStart(){if(!canHost()){toast('Hosting needs an internet connection.',2.6);return;}HOST.role='host';HOST.code=newCode();await coopJoin('host-'+HOST.code.toLowerCase());hostWire();hostReset();
  toast(`You’re hosting. Farm code: ${HOST.code}. Friends choose Play with friends, then Join a friend’s world, and type it.`,5);if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}
function hostJoin(code){code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);if(!code){toast('Type the host’s farm code first.',2.2);return;}
  if(!canHost()){toast('Joining needs an internet connection.',2.6);return;}try{flushSave&&flushSave();sessionStorage.setItem('hollowJoin',code);}catch(e){}S.mode='trans';fade(1);setTimeout(()=>location.reload(),400);}
async function hostJoinNow(code){HOST.role='guest';HOST.code=code;HOST.joined=false;const own=readSave();HOST.ownPersonal=own?Object.fromEntries(PERSONAL.filter(k=>own.S[k]!==undefined).map(k=>[k,own.S[k]])):null;
  await coopJoin('host-'+code.toLowerCase());hostWire();HOST.helloT=0;toast(`Looking for farm ${code}…`,3);let tries=0;
  const knock=setInterval(()=>{if(HOST.joined||HOST.role!=='guest'||tries++>15){clearInterval(knock);if(!HOST.joined&&HOST.role==='guest'){toast('Couldn’t find that farm. Check the code, and that the host is playing.',3.6);setTimeout(()=>{HOST.role=null;location.reload();},3600);}return;}
    CO.room.emit('hello',{n:myFarmName(),id:myPid()});},2000);CO.room.emit('hello',{n:myFarmName(),id:myPid()});}
// the title screen in join mode
{let jc=null;try{jc=sessionStorage.getItem('hollowJoin');sessionStorage.removeItem('hollowJoin');}catch(e){}
  if(jc){const b=document.createElement('button');b.className='begin';b.textContent=`Join farm ${jc}`;b.style.marginBottom='10px';$('begin').before(b);
    const c=$('cont');if(c)c.style.display='none';$('begin').textContent='Cancel';
    $('begin').addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();location.reload();},true);
    b.addEventListener('click',()=>{A.init&&A.init();$('title').hidden=true;finishIntro();S.readLetter=true;S.foundCabin=true;S.mode='paused';   // (the tutorial is each player's own now, #241)
      
      const go=()=>{if(CO.lobby)hostJoinNow(jc);else setTimeout(go,300);};go();});}}
function hostLeave(quiet){const was=HOST.role;try{CO.room&&CO.room.emit&&CO.room.emit('bye',{});}catch(e){}HOST.role=null;HOST.code='';for(const f of HOST.off)try{f();}catch(e){}HOST.off=[];
  if(was==='guest'){guestPersist();if(!quiet){toast('Going home…',1.6);}setTimeout(()=>location.reload(),quiet?50:900);return;}coopJoin('');if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}
function hostGone(){toast(`${HOST.hostName||'The host'} has stopped hosting. You head home.`,3.4);guestPersist();HOST.role=null;setTimeout(()=>location.reload(),2600);}
// a farmhand's own things go home with them: their backpack, tools and friendships are written into their own save
function guestPersist(){try{if(CO.room&&CO.room.emit&&HOST.hostPeer)CO.room.emit('mine',{n:NAME()||'Farmhand',p:takePersonal()},HOST.hostPeer);}catch(e){}try{const own=readSave();if(!own)return;const mine=takePersonal();for(const [k,v] of Object.entries(mine)){if(k==='look')continue;own.S[k]=v;}localStorage.setItem(SAVE_KEY,JSON.stringify(own));}catch(e){}}
{const _sg=saveGame;saveGame=function(mid){if(HOST.role==='guest'){guestPersist();return true;}return _sg.apply(this,arguments);};}
// only the host's bed ends the day
{const _sl=sleep;sleep=function(){if(HOST.role==='guest'){toast(`You get into bed. The day ends when ${HOST.hostName||'the host'} goes to sleep.`,3.2);return;}return _sl.apply(this,arguments);};}
{const _nd=newDay;newDay=function(msg,pos){if(HOST.role==='guest'&&!HOST.applying){S.hour=Math.min(S.hour,25.9);return;}const r=_nd.apply(this,arguments);
  if(HOST.role==='host'&&CO.room&&CO.room.emit)setTimeout(()=>{hostReset();CO.room.emit('snap',{data:saveData(true),host:NAME()||'The host'});},800);return r;};}
// keeping everyone's world the same
function hostSync(dt){if(!HOST.role||!CO.room||!CO.room.emit||HOST.applying)return;HOST.t+=dt;if(HOST.t<.3)return;HOST.t=0;const r=CO.room;
  if(HOST.role==='guest'&&!HOST.joined)return;
  for(let i=0;i<tiles.length;i++){const sg=tileSig(tiles[i]);if(sg!==HOST.known[i]){HOST.known[i]=sg;const t=tiles[i];r.emit('tile',{i,t:t.tilled?1:0,w:t.wet?1:0,c:t.crop?JSON.parse(JSON.stringify(t.crop)):null});}}
  const nw=[];for(const o of debrisObjs()){if(!o.hide)continue;const k=dKey(o);if(!HOST.debKnown.has(k)){HOST.debKnown.add(k);nw.push(k);}}if(nw.length)r.emit('deb',{ids:nw.slice(0,200)});
  if(S.coins!==HOST.coins){r.emit('coin',{d:S.coins-HOST.coins});HOST.coins=S.coins;}
  if(HOST.role==='host'){HOST.timeT-=.3;if(HOST.timeT<=0){HOST.timeT=2;r.emit('time',{day:S.day,hour:S.hour});}}}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{hostSync(dt);}catch(e){}};}
// the host is marked in presence so farmhands can tell who it is
{setInterval(()=>{if(!CO.room||!HOST.role)return;CO.room.presence({h:HOST.role==='host'?1:0}).catch(()=>{});},3000);}
addEventListener('pagehide',()=>{if(HOST.role&&CO.room&&CO.room.emit)try{CO.room.emit('bye',{reload:1});}catch(e){}});
// the co-op section of the Together tab
{const _rc=renderCoop;renderCoop=function(){_rc();const B=$('bagBody');const box=document.createElement('div');box.style.cssText='margin-top:12px;padding:8px 10px;background:rgba(0,0,0,.18)';
  const fh=others().filter(p=>p.presence).map(p=>clean(p.presence.n));
  if(HOST.role==='host')box.innerHTML=`<b>Hosting your farm</b><div style="font-size:28px;letter-spacing:.18em;margin:6px 0;color:#ffd27a">${HOST.code}</div><p class="jsub" style="font-size:12px">Friends choose Play with friends on the title screen, then Join a friend’s world, and type this code. Farmhands: ${fh.length?fh.join(', '):'nobody yet'}.</p><button class="btn" id="hoStop">Stop hosting</button>`;
  else if(HOST.role==='guest')box.innerHTML=`<b>On ${HOST.hostName?HOST.hostName+'’s':'a friend’s'} farm</b> <small>(${HOST.code})</small><p class="jsub" style="font-size:12px">The field, money and the day are shared. Your backpack and tools are yours and go home with you.</p><button class="btn" id="hoLeave">Go home</button>`;
  else box.innerHTML=`<b>Co-op farm</b><p class="jsub" style="font-size:12px;margin:4px 0">Host your farm and friends can join it as farmhands, like Stardew. Or join a friend’s farm with their code.</p>
    <button class="btn" id="hoHost">Host my farm</button><div style="display:flex;gap:6px;margin-top:8px"><input id="hoCode" maxlength="8" placeholder="Farm code" style="flex:1;font:inherit;padding:7px 9px;background:#2a1a0e;color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06;text-transform:uppercase"><button class="btn" id="hoJoin">Join a farm</button></div>`;
  B.appendChild(box);if(HOST.role)$('bagSub').textContent=HOST.role==='host'?`Hosting your farm · code ${HOST.code}`:`Farmhand on ${HOST.hostName||'a friend'}’s farm`;
  // the old social farm-code row gives way to hosting
  const cc=$('coCode');if(cc){const row=cc.parentElement;row.nextElementSibling&&row.nextElementSibling.remove();row.remove();}
  const stop=e=>e.stopPropagation();if($('hoCode'))['keydown','keyup','keypress'].forEach(t=>$('hoCode').addEventListener(t,stop));
  if($('hoHost'))$('hoHost').onclick=()=>hostStart();if($('hoJoin'))$('hoJoin').onclick=()=>hostJoin($('hoCode').value);
  if($('hoStop'))$('hoStop').onclick=()=>{hostLeave();toast('You stopped hosting.',2);};if($('hoLeave'))$('hoLeave').onclick=()=>hostLeave();};}
/* ================= on a shared farm, what anyone builds shows up for everyone straight away: benches, furniture in the cabin,
   the coop, the greenhouse, the field lamps, sprinklers, the shipping bin and the eggs. Before, they only arrived the next morning. ================= */
const MPW={known:{},t:0,pending:null,reg:{bench:[],furn:[],farm:{rects:[],lamps:[]}}};
const WORLD_KEYS=['benches','furnPlaced','coop','coopPos','fieldLamps','greenhouse','sprinklers','ship','eggs','_bp','_gh'];
function worldOut(k){if(k==='_bp')return BENCH_POS;if(k==='_gh')return S.greenhouse?{x:GH.x,z:GH.z}:null;
  if(k==='coopPos'&&S.coopPos)return {x:S.coopPos.x,z:S.coopPos.z};return S[k]===undefined?null:S[k];}
const wjs=v=>{try{return JSON.stringify(v===undefined?null:v);}catch(e){return 'null';}};
function worldReset(){for(const k of WORLD_KEYS)MPW.known[k]=wjs(worldOut(k));}
// what each bench, piece of furniture and farm building put into the world, so it can be taken out again and put back as the others have it
const unplace=e=>{for(const o of e.objs||[]){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}for(const r of e.rects||[]){const i=rects.indexOf(r);if(i>=0)rects.splice(i,1);}
  for(const it of e.its||[]){const i=interact.indexOf(it);if(i>=0)interact.splice(i,1);}};
{const _pb=placeBench;placeBench=function(k){const o0=OBJ.length,r0=rects.length,i0=interact.length;const out=_pb.apply(this,arguments);
  MPW.reg.bench.push({k,objs:OBJ.slice(o0),rects:rects.slice(r0),its:interact.slice(i0)});return out;};}
{const _pf=placeFurnAt;placeFurnAt=function(){const o0=OBJ.length,r0=rects.length;const out=_pf.apply(this,arguments);MPW.reg.furn.push({objs:OBJ.slice(o0),rects:rects.slice(r0),its:[],made:out});return out;};}
{const _fh=furnHook;furnHook=function(p,made){const it=_fh.apply(this,arguments);const e=MPW.reg.furn.find(q=>q.made===made);if(e&&it)e.its.push(it);return it;};}
{const _rf=rebuildFarm;rebuildFarm=function(){const F=MPW.reg.farm;for(const r of F.rects){const i=rects.indexOf(r);if(i>=0)rects.splice(i,1);}
  for(const L of F.lamps){const i=lamps.indexOf(L);if(i>=0)lamps.splice(i,1);L.e.hide=true;const c=circles.findIndex(q=>q.x===L.x&&q.z===L.z&&q.r===.15);if(c>=0)circles.splice(c,1);}
  if(S.coopPos)delete S.coopPos.col;const r0=rects.length,l0=lamps.length;const out=_rf.apply(this,arguments);F.rects=rects.slice(r0);F.lamps=lamps.slice(l0);return out;};}
const ghUp=()=>OBJ.some(o=>o.spr==='greenhouse'&&!o.hide);
// put the world's built things back exactly as the shared farm has them
function worldRebuild(keys){const all=!keys,has=k=>all||keys.has(k);
  if(has('benches')||has('_bp')){for(const e of MPW.reg.bench)unplace(e);MPW.reg.bench=[];for(const [k] of BENCHES)if(S.benches&&S.benches[k]&&BENCH_POS[k])placeBench(k,BENCH_POS[k].x,BENCH_POS[k].z);}
  if(has('furnPlaced')){for(const e of MPW.reg.furn)unplace(e);MPW.reg.furn=[];S.cabinLamp=false;for(const p of S.furnPlaced||[])furnHook(p,placeFurnAt(p.k,p.x,p.z,p.rot));}
  if(has('coop')||has('coopPos')||has('fieldLamps'))rebuildFarm();
  if((has('greenhouse')||has('_gh'))&&S.greenhouse&&!ghUp()){ROOMS.greenhouse.out={x:GH.x,z:GH.z+.8};buildGreenhouse();loadGame.gh=1;}
  if(typeof NAV!=='undefined')NAV.sig='';   // people re-learn the ground
  if(typeof updateHud==='function')updateHud();}
function worldApply(d){if(!d||typeof d!=='object')return;const keys=new Set();
  for(const k of WORLD_KEYS){if(!(k in d))continue;const v=d[k];
    if(k==='_bp'){if(!v||typeof v!=='object')continue;for(const b of Object.keys(BENCH_POS))delete BENCH_POS[b];for(const [b,p] of Object.entries(v))if(p&&isFinite(p.x)&&isFinite(p.z))BENCH_POS[b]=Object.assign({x:+p.x,z:+p.z},/^[SENW]$/.test(p.rot)?{rot:p.rot}:{});}   // (with its facing: without it everyone's copy turned back)
    else if(k==='_gh'){if(v&&isFinite(v.x)&&isFinite(v.z)&&!ghUp()){GH.x=+v.x;GH.z=+v.z;}}
    else if(k==='ship'||k==='furnPlaced'){if(!Array.isArray(v))continue;S[k]=v.slice(0,400);}
    else if(k==='benches'){if(!v||typeof v!=='object')continue;S[k]=v;}
    else if(k==='coopPos'){S[k]=v&&isFinite(v.x)&&isFinite(v.z)?{x:+v.x,z:+v.z}:null;}
    else S[k]=v;
    MPW.known[k]=wjs(worldOut(k));keys.add(k);}
  if(!keys.size)return;MPW.pending=MPW.pending||new Set();for(const k of keys)MPW.pending.add(k);}
function worldSync(dt){if(!HOST.role||!CO.room||!CO.room.emit||HOST.applying)return;if(HOST.role==='guest'&&!HOST.joined)return;
  // something to put in place: wait until nobody here is halfway through placing or moving a piece
  if(MPW.pending&&!PLACE.on){const k=MPW.pending;MPW.pending=null;try{worldRebuild(k);}catch(e){}}
  MPW.t+=dt;if(MPW.t<.4||PLACE.on)return;MPW.t=0;
  const ch={};let n=0;for(const k of WORLD_KEYS){const j=wjs(worldOut(k));if(j!==MPW.known[k]){MPW.known[k]=j;ch[k]=JSON.parse(j);n++;}}
  if(n)CO.room.emit('world',ch);}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{worldSync(dt);}catch(e){}};}
{const _hw=hostWire;hostWire=function(){_hw();const r=CO.room;if(!r||!r.on)return;HOST.off.push(r.on('world',m=>{if(!m||m.isMe||!HOST.role)return;try{worldApply(m.data);}catch(e){}}));};}
{const _hr=hostReset;hostReset=function(){_hr();worldReset();};}
// a fresh copy of the farm (joining, or a new morning) brings its built things with it, not only the first time
{const _as=applySnap;applySnap=function(){const r=_as.apply(this,arguments);try{worldRebuild();worldReset();}catch(e){}return r;};}
