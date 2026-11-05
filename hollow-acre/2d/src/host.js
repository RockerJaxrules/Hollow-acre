/* ================= hosting, like Stardew: one player hosts their farm and gets a farm code; friends join with the code and play
   inside the host's world as farmhands. Shared: the field and crops, cleared ground, money, the time of day and the day itself
   (the day ends when the host goes to bed), and the story. Each farmhand keeps their own backpack, tools, seeds, energy, health,
   look and friendships, and those are saved on their own device. The host's game saves the farm. ================= */
const HOST={role:null,code:'',hostPeer:null,hostName:'',known:[],debKnown:new Set(),coins:0,applying:false,t:0,timeT:0,helloT:0,off:[],members:{}};
const PERSONAL=['inv','slots','slotSel','tools','seeds','sel','basket','energy','energyMax','hp','hpMax','look','water','waterMax','bigCan','flasks','rod','gear',
  'fishLog','fishCaught','bagSize','furnBag','tut','ls','friend','talkedToday','lastTalk','giftsWeek','heartSeen','lore','journal','keyItems','hz','deaths'];
const tileSig=t=>(t.tilled?1:0)+'|'+(t.crop?[t.crop.type,t.crop.stage,t.crop.watered?1:0].join(','):'-');
const debrisObjs=()=>OBJ.filter(o=>o.debris);
const canHost=()=>CO.mode==='p2p'&&CO.lobby&&CO.lobby.net;
function hostReset(){HOST.known=tiles.map(tileSig);HOST.debKnown=new Set(debrisObjs().map((o,i)=>o.hide?i:-1).filter(i=>i>=0));HOST.coins=S.coins;}
function takePersonal(){const o={};for(const k of PERSONAL)if(S[k]!==undefined)o[k]=JSON.parse(JSON.stringify(S[k]));return o;}
function putPersonal(o){for(const [k,v] of Object.entries(o))S[k]=v;}
function newCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ';let c='';for(let i=0;i<4;i++)c+=a[Math.floor(Math.random()*a.length)];return c+(10+Math.floor(Math.random()*90));}
function hostWire(){for(const f of HOST.off)try{f();}catch(e){}HOST.off=[];const r=CO.room;if(!r||!r.on)return;
  const on=(t,f)=>HOST.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m.data,m.peer);}catch(e){}}));
  on('hello',(d,peer)=>{if(HOST.role!=='host')return;const n=clean(d&&d.n);HOST.members[peer]=n;const hand=(S.farmhands||{})[n]||null;r.emit('snap',{data:saveData(true),host:NAME()||'The host',hand},peer);toast(`${clean(d&&d.n)} has joined your farm as a farmhand.`,3);});
  on('snap',(d,peer)=>{if(HOST.role!=='guest'||!d||!d.data)return;HOST.hostPeer=peer;HOST.hostName=clean(d.host);applySnap(d.data,!HOST.joined,d.hand);HOST.joined=true;});
  on('tile',d=>{if(!HOST.role||!d)return;const t=tiles[d.i|0];if(!t)return;t.tilled=!!d.t;t.crop=d.c&&typeof d.c==='object'?d.c:null;HOST.known[d.i|0]=tileSig(t);});
  on('deb',d=>{if(!HOST.role||!d||!Array.isArray(d.ids))return;const ds=debrisObjs();for(const i of d.ids){const o=ds[i|0];if(!o||o.hide)continue;o.hide=true;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}HOST.debKnown.add(i|0);}});
  on('coin',d=>{if(!HOST.role||!d||!isFinite(d.d))return;const n=Math.max(-100000,Math.min(100000,d.d|0));S.coins=Math.max(0,S.coins+n);HOST.coins=S.coins;updateHud&&updateHud();});
  on('time',(d,peer)=>{if(HOST.role!=='guest'||!d)return;HOST.hostPeer=peer;if((d.day|0)!==S.day){if(performance.now()-HOST.helloT>3000){HOST.helloT=performance.now();r.emit('hello',{n:NAME()||'Farmhand'},peer);}return;}
    if(isFinite(d.hour)&&Math.abs(S.hour-d.hour)>.08)S.hour=d.hour;});
  on('mine',(d,peer)=>{if(HOST.role!=='host'||!d||!d.p||typeof d.p!=='object')return;const n=clean(d.n);let js='';try{js=JSON.stringify(d.p);}catch(e){return;}if(js.length>200000)return;S.farmhands=S.farmhands||{};S.farmhands[n]=JSON.parse(js);});
  on('bye',(d,peer)=>{if(HOST.role==='guest'&&peer===HOST.hostPeer)hostGone();});}
function applySnap(data,first,hand){const mine=first?(HOST.ownPersonal||hand||takePersonal()):takePersonal();HOST.applying=true;
  try{for(const t of tiles){t.tilled=false;t.crop=null;}loadGame(data);}finally{HOST.applying=false;}
  putPersonal(mine);applyLook();try{syncSlots&&syncSlots();renderHotbar&&renderHotbar();}catch(e){}
  P.x=1.6;P.z=-6.6;P.dir='S';P.fx=0;P.fz=1;S.room=null;
  hostReset();S.mode='play';S.paused=false;$('title').hidden=true;$('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;
  toast(first?`You’re on ${HOST.hostName}’s farm. Everything you grow here is shared. Your backpack is still yours.`:`Day ${S.day}. ${HOST.hostName} went to bed, so the night is over for everyone.`,4.2);}
async function hostStart(){if(!canHost()){toast('Hosting needs an internet connection.',2.6);return;}HOST.role='host';HOST.code=newCode();await coopJoin('host-'+HOST.code.toLowerCase());hostWire();hostReset();
  toast(`You’re hosting. Farm code: ${HOST.code}. Friends type it under Join a farm.`,5);if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}
function hostJoin(code){code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);if(!code){toast('Type the host’s farm code first.',2.2);return;}
  if(!canHost()){toast('Joining needs an internet connection.',2.6);return;}try{flushSave&&flushSave();sessionStorage.setItem('hollowJoin',code);}catch(e){}S.mode='trans';fade(1);setTimeout(()=>location.reload(),400);}
async function hostJoinNow(code){HOST.role='guest';HOST.code=code;HOST.joined=false;const own=readSave();HOST.ownPersonal=own?Object.fromEntries(PERSONAL.filter(k=>own.S[k]!==undefined).map(k=>[k,own.S[k]])):null;
  await coopJoin('host-'+code.toLowerCase());hostWire();HOST.helloT=0;toast(`Looking for farm ${code}…`,3);let tries=0;
  const knock=setInterval(()=>{if(HOST.joined||HOST.role!=='guest'||tries++>15){clearInterval(knock);if(!HOST.joined&&HOST.role==='guest'){toast('Couldn’t find that farm. Check the code, and that the host is playing.',3.6);setTimeout(()=>{HOST.role=null;location.reload();},3600);}return;}
    CO.room.emit('hello',{n:NAME()||'Farmhand'});},2000);CO.room.emit('hello',{n:NAME()||'Farmhand'});}
// the title screen in join mode
{let jc=null;try{jc=sessionStorage.getItem('hollowJoin');sessionStorage.removeItem('hollowJoin');}catch(e){}
  if(jc){const b=document.createElement('button');b.className='begin';b.textContent=`Join farm ${jc}`;b.style.marginBottom='10px';$('begin').before(b);
    const c=$('cont');if(c)c.style.display='none';$('begin').textContent='Cancel';
    $('begin').addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();location.reload();},true);
    b.addEventListener('click',()=>{A.init&&A.init();$('title').hidden=true;finishIntro();S.readLetter=true;S.foundCabin=true;S.tut.off=true;S.mode='paused';
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
  for(let i=0;i<tiles.length;i++){const sg=tileSig(tiles[i]);if(sg!==HOST.known[i]){HOST.known[i]=sg;const t=tiles[i];r.emit('tile',{i,t:t.tilled?1:0,c:t.crop?JSON.parse(JSON.stringify(t.crop)):null});}}
  const ds=debrisObjs(),nw=[];ds.forEach((o,i)=>{if(o.hide&&!HOST.debKnown.has(i)){HOST.debKnown.add(i);nw.push(i);}});if(nw.length)r.emit('deb',{ids:nw});
  if(S.coins!==HOST.coins){r.emit('coin',{d:S.coins-HOST.coins});HOST.coins=S.coins;}
  if(HOST.role==='host'){HOST.timeT-=.3;if(HOST.timeT<=0){HOST.timeT=2;r.emit('time',{day:S.day,hour:S.hour});}}}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{hostSync(dt);}catch(e){}};}
// the host is marked in presence so farmhands can tell who it is
{setInterval(()=>{if(!CO.room||!HOST.role)return;CO.room.presence({h:HOST.role==='host'?1:0}).catch(()=>{});},3000);}
addEventListener('pagehide',()=>{if(HOST.role&&CO.room&&CO.room.emit)try{CO.room.emit('bye',{});}catch(e){}});
// the co-op section of the Together tab
{const _rc=renderCoop;renderCoop=function(){_rc();const B=$('bagBody');const box=document.createElement('div');box.style.cssText='margin-top:12px;padding:8px 10px;background:rgba(0,0,0,.18)';
  const fh=others().filter(p=>p.presence).map(p=>clean(p.presence.n));
  if(HOST.role==='host')box.innerHTML=`<b>Hosting your farm</b><div style="font-size:28px;letter-spacing:.18em;margin:6px 0;color:#ffd27a">${HOST.code}</div><p class="jsub" style="font-size:12px">Friends open Together, type this code under Join a farm, and arrive on your farm. Farmhands: ${fh.length?fh.join(', '):'nobody yet'}.</p><button class="btn" id="hoStop">Stop hosting</button>`;
  else if(HOST.role==='guest')box.innerHTML=`<b>On ${HOST.hostName?HOST.hostName+'’s':'a friend’s'} farm</b> <small>(${HOST.code})</small><p class="jsub" style="font-size:12px">The field, money and the day are shared. Your backpack and tools are yours and go home with you.</p><button class="btn" id="hoLeave">Go home</button>`;
  else box.innerHTML=`<b>Co-op farm</b><p class="jsub" style="font-size:12px;margin:4px 0">Host your farm and friends can join it as farmhands, like Stardew. Or join a friend’s farm with their code.</p>
    <button class="btn" id="hoHost">Host my farm</button><div style="display:flex;gap:6px;margin-top:8px"><input id="hoCode" maxlength="8" placeholder="Farm code" style="flex:1;font:inherit;padding:7px 9px;background:#2a1a0e;color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06;text-transform:uppercase"><button class="btn" id="hoJoin">Join a farm</button></div>`;
  B.appendChild(box);if(HOST.role)$('bagSub').textContent=HOST.role==='host'?`Hosting your farm · code ${HOST.code}`:`Farmhand on ${HOST.hostName||'a friend'}’s farm`;
  // the old social farm-code row gives way to hosting
  const cc=$('coCode');if(cc){const row=cc.parentElement;row.nextElementSibling&&row.nextElementSibling.remove();row.remove();}
  const stop=e=>e.stopPropagation();if($('hoCode'))['keydown','keyup','keypress'].forEach(t=>$('hoCode').addEventListener(t,stop));
  if($('hoHost'))$('hoHost').onclick=()=>hostStart();if($('hoJoin'))$('hoJoin').onclick=()=>hostJoin($('hoCode').value);
  if($('hoStop'))$('hoStop').onclick=()=>{hostLeave();toast('You stopped hosting.',2);};if($('hoLeave'))$('hoLeave').onclick=()=>hostLeave();};}
