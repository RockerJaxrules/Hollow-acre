/* ================= playing together. Everyone who has this game open can join the same valley through the page's live room:
   you see each other walk, work and wave, in your own looks and names, and you can talk. Each of you keeps your own farm and
   story; a farm code puts a group in a private valley. The valley also learns to use your friends against you. ================= */
const CO={room:null,lobby:null,code:'',peers:[],sprites:{},chat:[],last:0,me:null,status:'offline',fake:null};
const lookKey=l=>JSON.stringify(Object.keys(l).filter(k=>k!=='name').sort().map(k=>[k,l[k]]));
function lookMini(){const o={};for(const [k,v] of Object.entries(S.look))if(k!=='name'&&(typeof v==='string'||typeof v==='number'))o[k]=v;return o;}
// a sprite sheet in a friend's look, built the same way as yours: the walking sheet and one for each tool, so their hoe, can,
// pick, axe and rod swing in their own colours
const PEER_TOOLS=['','_hoe','_can','_pick','_axe','_rod'];
async function peerSprite(look){if(!look||typeof look!=='object')return null;const key=lookKey(look);if(CO.sprites[key])return CO.sprites[key];CO.sprites[key]='pending';
  try{const L=Object.assign({},LOOK_DEF,look);const need=[];for(const tl of PEER_TOOLS)for(const n of layersFor(L,tl)){const s=SPR[n]&&SPR[n].src;if(s&&!IMG[s]&&!need.includes(s))need.push(s);}if(need.length)await loadImages(need);
    const M=lookMap(L);const name='peer'+Object.keys(CO.sprites).length;
    for(const tl of PEER_TOOLS){const base=SPR['farmer'+tl];if(!base)continue;const src=base.src,prev=IMG[src],prevF=FISTS['farmer'+tl];
      try{composeSheet(L,tl,M);const c=IMG[src];if(c&&c!==prev){SPR[name+tl]=Object.assign({},base,{src:'mem:'+name+tl});IMG['mem:'+name+tl]=c;if(tl&&FISTS['farmer'+tl]&&FISTS['farmer'+tl]!==prevF)FISTS[name+tl]=FISTS['farmer'+tl];}}
      finally{IMG[src]=prev;if(prevF)FISTS['farmer'+tl]=prevF;else delete FISTS['farmer'+tl];}}
    if(typeof SILF!=='undefined')for(const k in SILF)if(k.startsWith('farmer'))delete SILF[k];
    if(!SPR[name]){CO.sprites[key]=null;return null;}CO.sprites[key]=name;return name;}catch(e){CO.sprites[key]=null;return null;}}
const peerName=(look,tl)=>{const k=look&&lookKey(look);const n=k&&CO.sprites[k];if(n&&n!=='pending'&&SPR[n+(tl||'')])return n+(tl||'');return tl?(SPR['farmer'+tl]?'farmer'+tl:null):'farmer';};
// joining
async function coopStart(){let room=null;
  // on claude.ai (where the page can't open outside connections) use Claude's live room; everywhere else, direct peer-to-peer
  try{if(typeof claude!=='undefined'&&claude.use){const r=await claude.use('room');if(r){room=claudeAdapt(r);CO.mode='claude';}}}catch(e){room=null;}
  if(!room&&typeof HollowNet!=='undefined'&&typeof RTCPeerConnection!=='undefined'){try{room=netLobby();CO.mode='p2p';}catch(e){room=null;}}
  if(!room){CO.status='unavailable';return;}CO.lobby=room;CO.status='connecting';
  room.onConnection(c=>{CO.status=c?'online':'connecting';},()=>{CO.status='unavailable';});await coopJoin('');}
async function coopJoin(code){code=(code||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24);const lob=CO.lobby;if(!lob)return;
  try{if(!lob.net&&CO.room&&CO.room!==lob&&CO.room.leave)await CO.room.leave();}catch(e){}
  try{CO.room=code?await lob.join('farm-'+code):(lob.rejoin&&CO.room?await lob.rejoin():(lob.current||lob));CO.code=code;}catch(e){CO.room=lob.current||lob;CO.code='';toast('Couldn’t open that farm code. You’re in the shared valley.',2.6);}
  CO.room.onPeers(ch=>{CO.peers=ch.peers;for(const p of ch.joined)if(!p.isMe&&p.presence&&p.presence.n)toast(`${clean(p.presence.n)} has come to the valley.`,2.4);
    for(const p of ch.left)if(!p.isMe&&p.presence&&p.presence.n)toast(`${clean(p.presence.n)} has gone home.`,2.2);if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();});
  CO.last=0;coopSend(true);}
const clean=s=>String(s||'').replace(/[<>&"]/g,'').slice(0,24)||'Farmhand';
const MPV={px:null,pz:null,vx:0,vz:0,sig:'',seq:0,an:null};
function coopSend(force){const r=CO.room;if(!r||S.mode==='title'||S.mode==='load')return;const now=performance.now();if(!force&&now-CO.last<100)return;
  const vx=+MPV.vx.toFixed(2),vz=+MPV.vz.toFixed(2),moving=Math.abs(vx)+Math.abs(vz)>.15;
  const rf=typeof rodFrame==='function'&&!P.anim?rodFrame():-1;
  const st={v:2,n:NAME()||'Farmhand',x:+P.x.toFixed(2),z:+P.z.toFixed(2),vx:moving?vx:0,vz:moving?vz:0,d:P.dir,c:(typeof TR!=='undefined'&&TR.ride)?'tractor':P.anim?'work':(moving?'walk':'idle'),r:S.room||'',day:S.day,lk:lookMini(),rf,an:MPV.an};
  if(CO.me&&CO.me.s)Object.assign(st,{s:CO.me.s,st:CO.me.st});if(CO.me&&CO.me.e)Object.assign(st,{e:CO.me.e,et:CO.me.et});
  // nothing new: only a heartbeat every two seconds
  const sig=[st.x,st.z,st.vx,st.vz,st.d,st.c,st.r,st.rf,st.an&&st.an.s,st.s,st.e,st.day].join('|');if(!force&&sig===MPV.sig&&now-CO.last<2000)return;
  MPV.sig=sig;CO.last=now;r.presence(st).catch(()=>{});}
// how fast you're really moving, measured frame to frame and smoothed, so friends can carry you forward between messages
function mpTrack(dt){if(dt<=0)return;if(MPV.px==null||Math.hypot(P.x-MPV.px,P.z-MPV.pz)>3){MPV.px=P.x;MPV.pz=P.z;MPV.vx=MPV.vz=0;return;}
  const k=Math.min(1,dt*10);MPV.vx+=((P.x-MPV.px)/dt-MPV.vx)*k;MPV.vz+=((P.z-MPV.pz)/dt-MPV.vz)*k;MPV.px=P.x;MPV.pz=P.z;}
// every swing, pour and cast goes out at once, so friends see it as it happens
{const _sa=startAnim;startAnim=function(clip,dur){const r=_sa.apply(this,arguments);try{if(P.anim)MPV.an={c:P.anim.clip,d:+P.anim.dur.toFixed(2),s:++MPV.seq,dir:P.dir};coopSend(true);}catch(e){}return r;};}
function coopSay(txt){txt=String(txt||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,120);if(!txt)return;CO.me=Object.assign(CO.me||{},{s:txt,st:Date.now()});CO.chat.push({n:NAME()||'You',t:txt,me:1});coopSend(true);if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}
function coopEmote(e){CO.me=Object.assign(CO.me||{},{e,et:Date.now()});coopSend(true);}
// what the room tells us about others: data, never instructions
const others=()=>CO.peers.filter(p=>!p.isMe&&p.presence&&typeof p.presence.x==='number'&&isFinite(p.presence.x)&&isFinite(p.presence.z));
let coopSeen={};
// friends move smoothly: each one is drawn easing toward where they are heading (their last spot, carried forward by their speed
// for a moment), so a late message never makes them jump or stutter
const PEER_RS={};
function peerStep(p,dt){const q=p.presence,now=performance.now();let r=PEER_RS[p.peer];
  if(!r||(q.r||'')!==r.room||Math.hypot(q.x-r.x,q.z-r.z)>8){r=PEER_RS[p.peer]={x:q.x,z:q.z,tx:q.x,tz:q.z,at:now,room:q.r||'',wt:0,spd:0,anS:q.an&&q.an.s,anim:null};}
  if(q.x!==r.tx||q.z!==r.tz){r.tx=q.x;r.tz=q.z;r.at=now;}
  const age=Math.min(.35,(now-r.at)/1000),vx=isFinite(q.vx)?q.vx:0,vz=isFinite(q.vz)?q.vz:0;
  const gx=r.tx+vx*age,gz=r.tz+vz*age,k=1-Math.exp(-dt*12);const ox=r.x,oz=r.z;r.x+=(gx-r.x)*k;r.z+=(gz-r.z)*k;
  r.spd=r.spd+((Math.hypot(r.x-ox,r.z-oz)/(dt||1/60))-r.spd)*Math.min(1,dt*8);r.wt+=dt*Math.max(1,r.spd/2.6);
  if(q.an&&q.an.s!==r.anS){r.anS=q.an.s;r.anim={clip:String(q.an.c||''),dur:Math.max(.2,Math.min(3,+q.an.d||.6)),t:0,dir:q.an.dir||q.d};}
  if(r.anim){r.anim.t+=dt;if(r.anim.t>=r.anim.dur)r.anim=null;}return r;}
function coopUpdate(dt){mpTrack(dt);coopSend(false);const live=new Set();for(const p of others()){live.add(p.peer);peerStep(p,dt);const q=p.presence;const s=q.st||0;if(q.s&&s>(coopSeen[p.peer]||0)){coopSeen[p.peer]=s;CO.chat.push({n:clean(q.n),t:String(q.s).slice(0,120)});if(CO.chat.length>40)CO.chat.shift();
    if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}if(q.lk&&typeof q.lk==='object')peerSprite(q.lk);}
  for(const k in PEER_RS)if(!live.has(k))delete PEER_RS[k];
  // in the shared valley everyone has their own farm: say so once, the first time someone turns up, so nobody wonders where their crops went
  if(!CO.toldOwn&&!(typeof HOST!=='undefined'&&HOST.role)&&others().length&&S.mode==='play'){CO.toldOwn=true;const n=clean(others()[0].presence.n);
    setTimeout(()=>toast(`${n} is in the valley, but each of you has your own farm. To share one farm, one of you opens Together and taps Host my farm.`,5),1500);}
  // the valley borrows a friend: a copy of one of them stands far off, still, facing you, while the real one is somewhere else
  const L=typeof hl==='function'?hl():0;const os=others();
  if(!CO.fake&&L>=2&&os.length&&!S.room&&isNight()&&rand()<dt/240){const p=pick(os);const a=aroundPlayer(.2,.6,9,11);CO.fake={x:a.x,z:a.z,look:p.presence.lk,n:clean(p.presence.n),t:0};}
  if(CO.fake){const f=CO.fake;f.t+=dt;if(Math.hypot(P.x-f.x,P.z-f.z)<4||f.t>9){toast(`That wasn’t ${f.n}. ${f.n} is nowhere near you.`,3.4,true);mindHit(6);CO.fake=null;}}}
const DIRV={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};
function drawPeer(x,z,look,dir,clip,t,label,bubble,alpha,rs,rf){dir=dir||'S';const X=sx(x),Y=sz(z);let nm=peerName(look,''),cl='idle',f=0;const a=rs&&rs.anim;
  if(a){const tk=a.clip==='hoe'||a.clip==='pick'||a.clip==='axe'?'_'+a.clip:a.clip==='water'?'_can':null;const tn=tk&&peerName(look,tk);dir=a.dir||dir;
    if(tn&&SPR[tn].clips&&SPR[tn].clips.thrust){nm=tn;cl='thrust';if(tk!=='_can'){const k=a.t/a.dur,TH=[.08,.2,.34,.48,.55,.74,.86];f=TH.findIndex(v=>k<v);if(f<0)f=7;}else f=frameOf(nm,'thrust',a.t,a.dur);}
    else{cl=SPR[nm].clips&&SPR[nm].clips.slash?'slash':'walk';f=frameOf(nm,cl,a.t,a.dur);}}
  else if(rf>=0&&peerName(look,'_rod')&&SPR[peerName(look,'_rod')].clips.thrust){nm=peerName(look,'_rod');cl='thrust';f=rf;}
  else if(rs?rs.spd>.35:clip==='walk'){cl=rs&&rs.spd>3.6&&SPR[nm].clips.run?'run':'walk';f=frameOf(nm,cl,rs?rs.wt:t);}
  else if(SPR[nm].clips&&SPR[nm].clips.idle){cl='idle';f=frameOf(nm,'idle',performance.now()/1000+(String(label||'').length*.37));}else{cl='walk';f=0;}
  const fr=[nm,cl,dir,f|0];if(typeof footShadow==='function')footShadow(fr,X,Y);else shadow(X,Y,9);
  const tm=cl==='thrust'&&SPR[nm]&&SPR[nm].tool?SPR[nm]:null;const ox=tm?Math.round(X-tm.ax):0,oy=tm?Math.round(Y-tm.ay):0;
  const pour=tm&&tm.toolKind==='can'&&f>=3&&f<=6;const v=DIRV[dir]||DIRV.S;const wto=pour?(dir==='N'?[sx(x+v[0]*.9)+9,sz(z+v[1]*.9+.1)+12]:[sx(x+v[0]*.9),sz(z+v[1]*.9+.1)+4]):null;
  const op=alpha!=null?{alpha}:undefined;
  if(tm&&alpha==null){const tip=toolOverlay(ctx2,nm,dir,f|0,ox,oy,'back');if(tip&&pour)waterStream(ctx2,tip,wto,t);}
  drawSpr(nm,X,Y,cl,dir,f|0,op);
  if(tm&&alpha==null){const tip=toolOverlay(ctx2,nm,dir,f|0,ox,oy,'front');if(tip&&pour)waterStream(ctx2,tip,wto,t);fistOverlay(ctx2,nm,dir,f|0,ox,oy);}
  if(label){ctx2.font='10px monospace';ctx2.textAlign='center';const w=ctx2.measureText(label).width+8;ctx2.fillStyle='rgba(20,12,6,.75)';ctx2.fillRect(Math.round(X-w/2),Math.round(Y-78),Math.round(w),13);ctx2.fillStyle='#f4e6c8';ctx2.fillText(label,Math.round(X),Math.round(Y-68));}
  if(bubble){ctx2.font='11px monospace';const lines=[];let cur='';for(const w of bubble.split(' ')){if((cur+' '+w).length>22){lines.push(cur);cur=w;}else cur=cur?cur+' '+w:w;}lines.push(cur);
    const h=lines.length*13+8,wd=Math.max(...lines.map(l=>ctx2.measureText(l).width))+12,by=Y-86-h;ctx2.fillStyle='#f4e6c8';ctx2.fillRect(Math.round(X-wd/2),Math.round(by),Math.round(wd),h);ctx2.fillStyle='#2a1a0e';
    lines.forEach((l,i)=>ctx2.fillText(l,Math.round(X),Math.round(by+15+i*13)));}
  ctx2.textAlign='left';}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const here=S.room||'';const now=Date.now();
  for(const p of others()){const q=p.presence;if((q.r||'')!==here)continue;const rs=PEER_RS[p.peer];const x=rs?rs.x:q.x,z=rs?rs.z:q.z;if(!onScreen(x,z,90))continue;
    const bub=q.s&&now-(q.st||0)<6000?String(q.s).slice(0,120):(q.e&&now-(q.et||0)<2500?({wave:'👋',heart:'♥',scared:'!!',laugh:'ha ha'}[q.e]||''):'');
    D.push({z,mind:1,draw(){drawPeer(x,z,q.lk,q.d,q.c,t,clean(q.n),bub,null,rs,+q.rf);}});}
  if(CO.fake&&!S.room){const f=CO.fake;D.push({z:f.z,mind:1,draw(){drawPeer(f.x,f.z,f.look,dirOf(P.x-f.x,P.z-f.z),'idle',0,f.n,null,.9);}});}
  // your own words over your head
  if(CO.me&&CO.me.s&&now-CO.me.st<6000&&CO.room){const s=CO.me.s;D.push({z:P.z+.01,mind:1,draw(){const X=sx(P.x),Y=sz(P.z);ctx2.font='11px monospace';ctx2.textAlign='center';const w=Math.min(200,ctx2.measureText(s).width+12);ctx2.fillStyle='#f4e6c8';ctx2.fillRect(Math.round(X-w/2),Math.round(Y-100),Math.round(w),17);ctx2.fillStyle='#2a1a0e';ctx2.fillText(s.slice(0,30),Math.round(X),Math.round(Y-88));ctx2.textAlign='left';}});}};}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{coopUpdate(dt);}catch(e){}};}
// the Together tab
function renderCoop(){const B=$('bagBody');const os=others();
  $('bagSub').textContent=CO.status==='online'?(CO.code?`Private farm: ${CO.code}`:'The shared valley: everyone playing online right now'):CO.status==='unavailable'?'Playing alone: no connection. Check your internet, then reopen the game.':'Connecting…';
  const list=os.map(p=>{const q=p.presence;const here=(q.r||'')===(S.room||'');return `<div class="p" style="padding:6px 8px"><b>${clean(q.n)}</b>${p.guest?' <small>(guest)</small>':''}<small style="display:block;opacity:.7">Day ${+q.day||1} · ${here?'near you':'somewhere else'}</small></div>`;}).join('')||'<p class="jsub">Nobody else is here right now. Share the game’s link with a friend; when they open it, they appear in your valley.</p>';
  const chat=CO.chat.slice(-12).map(c=>`<div style="font-size:13px;margin:2px 0"><b style="color:${c.me?'#ffd27a':'#b8e07a'}">${clean(c.n)}:</b> ${String(c.t).replace(/[<>&]/g,'')}</div>`).join('');
  B.innerHTML=`<div class="soc">${list}</div>
    <div style="margin-top:10px;max-height:150px;overflow:auto;background:rgba(0,0,0,.2);padding:6px 8px" id="coChat">${chat||'<span class="jsub">Say something.</span>'}</div>
    <div style="display:flex;gap:6px;margin-top:6px"><input id="coIn" maxlength="120" placeholder="Talk to the valley…" style="flex:1;font:inherit;padding:7px 9px;background:#2a1a0e;color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06"><button class="btn" id="coSend">Say</button></div>
    <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">${['wave','heart','laugh','scared'].map(e=>`<button class="btn coE" data-e="${e}">${{wave:'👋 Wave',heart:'♥ Heart',laugh:'Ha ha',scared:'!! Scared'}[e]}</button>`).join('')}</div>
    <div style="display:flex;gap:6px;margin-top:10px;align-items:center"><input id="coCode" maxlength="24" value="${CO.code}" placeholder="Farm code (blank = everyone)" style="flex:1;font:inherit;padding:7px 9px;background:#2a1a0e;color:#f4e6c8;border:0;box-shadow:inset 0 0 0 2px #1a0e06"><button class="btn" id="coJoin">Join</button></div>
    <p class="jsub" style="font-size:12px;margin-top:6px">Each of you keeps your own farm and story. Pick a farm code to play with just your friends.</p>`;
  const stop=e=>e.stopPropagation();for(const id of ['coIn','coCode'])['keydown','keyup','keypress'].forEach(t=>$(id).addEventListener(t,stop));
  $('coSend').onclick=()=>{coopSay($('coIn').value);};$('coIn').addEventListener('keydown',e=>{if(e.key==='Enter')coopSay($('coIn').value);});
  B.querySelectorAll('.coE').forEach(b=>b.onclick=()=>{coopEmote(b.dataset.e);toast('You '+({wave:'wave',heart:'send a heart',laugh:'laugh',scared:'flinch'}[b.dataset.e])+'.',1.4);});
  $('coJoin').onclick=()=>{coopJoin($('coCode').value);setTimeout(renderCoop,600);};
  const cc=$('coChat');cc.scrollTop=cc.scrollHeight;}
coopStart();
