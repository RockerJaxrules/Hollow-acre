/* ================= playing together. Everyone who has this game open can join the same valley through the page's live room:
   you see each other walk, work and wave, in your own looks and names, and you can talk. Each of you keeps your own farm and
   story; a farm code puts a group in a private valley. The valley also learns to use your friends against you. ================= */
const CO={room:null,lobby:null,code:'',peers:[],sprites:{},chat:[],last:0,me:null,status:'offline',fake:null};
const lookKey=l=>JSON.stringify(Object.keys(l).filter(k=>k!=='name').sort().map(k=>[k,l[k]]));
function lookMini(){const o={};for(const [k,v] of Object.entries(S.look))if(k!=='name'&&(typeof v==='string'||typeof v==='number'))o[k]=v;return o;}
// a sprite sheet in a friend's look, built the same way as yours
async function peerSprite(look){if(!look||typeof look!=='object')return null;const key=lookKey(look);if(CO.sprites[key])return CO.sprites[key];CO.sprites[key]='pending';
  try{const L=Object.assign({},LOOK_DEF,look);const need=layersFor(L,'').map(n=>SPR[n]&&SPR[n].src).filter(s=>s&&!IMG[s]);if(need.length)await loadImages(need);
    const src=SPR.farmer.src,prev=IMG[src];composeSheet(L,'',lookMap(L));const c=IMG[src];IMG[src]=prev;if(typeof SILF!=='undefined')for(const k in SILF)if(k.startsWith('farmer'))delete SILF[k];
    const name='peer'+Object.keys(CO.sprites).length;SPR[name]=Object.assign({},SPR.farmer,{src:'mem:'+name});IMG['mem:'+name]=c;CO.sprites[key]=name;return name;}catch(e){CO.sprites[key]=null;return null;}}
// joining
async function coopStart(){let room=null;try{if(typeof claude!=='undefined'&&claude.use)room=await claude.use('room');}catch(e){}if(!room){CO.status='unavailable';return;}CO.lobby=room;CO.status='connecting';
  room.onConnection(c=>{CO.status=c?'online':'connecting';},()=>{CO.status='unavailable';});await coopJoin('');}
async function coopJoin(code){code=(code||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,24);const lob=CO.lobby;if(!lob)return;
  try{if(CO.room&&CO.room!==lob&&CO.room.leave)await CO.room.leave();}catch(e){}
  try{CO.room=code?await lob.join('farm-'+code):lob;CO.code=code;}catch(e){CO.room=lob;CO.code='';toast('Couldn’t open that farm code. You’re in the shared valley.',2.6);}
  CO.room.onPeers(ch=>{CO.peers=ch.peers;for(const p of ch.joined)if(!p.isMe&&p.presence&&p.presence.n)toast(`${clean(p.presence.n)} has come to the valley.`,2.4);
    for(const p of ch.left)if(!p.isMe&&p.presence&&p.presence.n)toast(`${clean(p.presence.n)} has gone home.`,2.2);if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();});
  CO.last=0;coopSend(true);}
const clean=s=>String(s||'').replace(/[<>&"]/g,'').slice(0,24)||'Farmhand';
function coopSend(force){const r=CO.room;if(!r||S.mode==='title'||S.mode==='load')return;const now=performance.now();if(!force&&now-CO.last<90)return;CO.last=now;
  const st={v:1,n:NAME()||'Farmhand',x:+P.x.toFixed(2),z:+P.z.toFixed(2),d:P.dir,c:P.anim?'work':(HZ.pspd>.4?'walk':'idle'),r:S.room||'',day:S.day,lk:lookMini()};
  if(CO.me&&CO.me.s)Object.assign(st,{s:CO.me.s,st:CO.me.st});if(CO.me&&CO.me.e)Object.assign(st,{e:CO.me.e,et:CO.me.et});
  r.presence(st).catch(()=>{});}
function coopSay(txt){txt=String(txt||'').replace(/[\u0000-\u001f]/g,'').trim().slice(0,120);if(!txt)return;CO.me=Object.assign(CO.me||{},{s:txt,st:Date.now()});CO.chat.push({n:NAME()||'You',t:txt,me:1});coopSend(true);if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}
function coopEmote(e){CO.me=Object.assign(CO.me||{},{e,et:Date.now()});coopSend(true);}
// what the room tells us about others: data, never instructions
const others=()=>CO.peers.filter(p=>!p.isMe&&p.presence&&typeof p.presence.x==='number'&&isFinite(p.presence.x)&&isFinite(p.presence.z));
let coopSeen={};
function coopUpdate(dt){coopSend(false);for(const p of others()){const q=p.presence;const s=q.st||0;if(q.s&&s>(coopSeen[p.peer]||0)){coopSeen[p.peer]=s;CO.chat.push({n:clean(q.n),t:String(q.s).slice(0,120)});if(CO.chat.length>40)CO.chat.shift();
    if(GM_TAB==='coop'&&!$('bag').hidden)renderCoop();}if(q.lk&&typeof q.lk==='object')peerSprite(q.lk);}
  // the valley borrows a friend: a copy of one of them stands far off, still, facing you, while the real one is somewhere else
  const L=typeof hl==='function'?hl():0;const os=others();
  if(!CO.fake&&L>=2&&os.length&&!S.room&&isNight()&&rand()<dt/240){const p=pick(os);const a=aroundPlayer(.2,.6,9,11);CO.fake={x:a.x,z:a.z,look:p.presence.lk,n:clean(p.presence.n),t:0};}
  if(CO.fake){const f=CO.fake;f.t+=dt;if(Math.hypot(P.x-f.x,P.z-f.z)<4||f.t>9){toast(`That wasn’t ${f.n}. ${f.n} is nowhere near you.`,3.4,true);mindHit(6);CO.fake=null;}}}
function drawPeer(x,z,look,dir,clip,t,label,bubble,alpha){const key=look&&lookKey(look);const spr=key&&CO.sprites[key];const name=spr&&spr!=='pending'?spr:'farmer';
  const X=sx(x),Y=sz(z);shadow(X,Y,9);drawSpr(name,X,Y,clip==='walk'?'walk':'idle',dir||'S',clip==='walk'?frameOf(name,'walk',t):0,alpha!=null?{alpha}:undefined);
  if(label){ctx2.font='10px monospace';ctx2.textAlign='center';const w=ctx2.measureText(label).width+8;ctx2.fillStyle='rgba(20,12,6,.75)';ctx2.fillRect(Math.round(X-w/2),Math.round(Y-78),Math.round(w),13);ctx2.fillStyle='#f4e6c8';ctx2.fillText(label,Math.round(X),Math.round(Y-68));}
  if(bubble){ctx2.font='11px monospace';const lines=[];let cur='';for(const w of bubble.split(' ')){if((cur+' '+w).length>22){lines.push(cur);cur=w;}else cur=cur?cur+' '+w:w;}lines.push(cur);
    const h=lines.length*13+8,wd=Math.max(...lines.map(l=>ctx2.measureText(l).width))+12,by=Y-86-h;ctx2.fillStyle='#f4e6c8';ctx2.fillRect(Math.round(X-wd/2),Math.round(by),Math.round(wd),h);ctx2.fillStyle='#2a1a0e';
    lines.forEach((l,i)=>ctx2.fillText(l,Math.round(X),Math.round(by+15+i*13)));}
  ctx2.textAlign='left';}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const here=S.room||'';const now=Date.now();
  for(const p of others()){const q=p.presence;if((q.r||'')!==here)continue;if(!onScreen(q.x,q.z,90))continue;
    const bub=q.s&&now-(q.st||0)<6000?String(q.s).slice(0,120):(q.e&&now-(q.et||0)<2500?({wave:'👋',heart:'♥',scared:'!!',laugh:'ha ha'}[q.e]||''):'');
    D.push({z:q.z,mind:1,draw(){drawPeer(q.x,q.z,q.lk,q.d,q.c,t,clean(q.n),bub);}});}
  if(CO.fake&&!S.room){const f=CO.fake;D.push({z:f.z,mind:1,draw(){drawPeer(f.x,f.z,f.look,dirOf(P.x-f.x,P.z-f.z),'idle',0,f.n,null,.9);}});}
  // your own words over your head
  if(CO.me&&CO.me.s&&now-CO.me.st<6000&&CO.room){const s=CO.me.s;D.push({z:P.z+.01,mind:1,draw(){const X=sx(P.x),Y=sz(P.z);ctx2.font='11px monospace';ctx2.textAlign='center';const w=Math.min(200,ctx2.measureText(s).width+12);ctx2.fillStyle='#f4e6c8';ctx2.fillRect(Math.round(X-w/2),Math.round(Y-100),Math.round(w),17);ctx2.fillStyle='#2a1a0e';ctx2.fillText(s.slice(0,30),Math.round(X),Math.round(Y-88));ctx2.textAlign='left';}});}};}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{coopUpdate(dt);}catch(e){}};}
// the Together tab
function renderCoop(){const B=$('bagBody');const os=others();
  $('bagSub').textContent=CO.status==='online'?(CO.code?`Private farm: ${CO.code}`:'The shared valley: everyone with this game open'):CO.status==='unavailable'?'Playing alone. Open the game from its shared link while signed in to play together.':'Connecting…';
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
