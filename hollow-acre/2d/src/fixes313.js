/* ================= #313 owner batch.
   1. The mirror is something you look INTO, not a line of text. Looking in it opens a close-up of the mirror on the wall: your own
      face in it (your sprite, hair, clothes and all, flipped as a mirror flips it) and the room behind you. What is wrong is shown:
      it turns to you a beat late, it blinks when you don't, it watches the door and then smiles too wide, the covers on the bed
      behind you rise and fall, and at the worst there is nobody in it at all and the bed is made, the coat gone, daylight outside.
   2. Story beats can always be finished. A beat that began but never ended (the game closed mid-scene, a farm's morning came over
      it) plays again; the person a beat sends you to has an "Ask" button by them at any hour; it saves the moment it ends; and on a
      shared farm a farmhand's story steps go to the host's farm, so the story moves on for everyone instead of resetting each morning.
   3. A farmhand can buy land at the land office too; the host's farm records the deed.
   4. A "Code" button in the backpack opens the code console, for phones and tablets that have no T key. ================= */

// ---------------------------------------------------------------- 1. the mirror
const MIR={on:false,box:null,cv:null,g:null,hint:null,K:3,W:320,H:180,t:0,raf:0,openAt:0,wasPaused:false,L:0,stung:false};
function mirEnsure(){if(MIR.box)return;const b=document.createElement('div');b.id='mirBox';b.hidden=true;b.setAttribute('role','dialog');b.setAttribute('aria-modal','true');
  b.innerHTML='<canvas id="mirCv"></canvas><div id="mirHint"></div>';document.body.appendChild(b);MIR.box=b;MIR.cv=$('mirCv');MIR.g=MIR.cv.getContext('2d');MIR.hint=$('mirHint');
  const css=document.createElement('style');css.textContent=`#mirBox{position:fixed;inset:0;z-index:75;background:#05050a;overflow:hidden;cursor:pointer;opacity:0;transition:opacity .25s steps(3)}
#mirBox.on{opacity:1}#mirCv{position:absolute;left:0;top:0;image-rendering:pixelated;image-rendering:crisp-edges;transform:scale(.2);transition:transform .32s steps(6);transform-origin:50% 40%}
#mirBox.on #mirCv{transform:none}
#mirHint{position:absolute;left:0;right:0;bottom:max(10px,env(safe-area-inset-bottom,0px));text-align:center;font:12px 'Hollow Pixel',monospace;color:#9a8c70;text-shadow:1px 1px 0 #000;letter-spacing:.06em}`;document.head.appendChild(css);
  const close=e=>{if(!MIR.on||performance.now()-MIR.openAt<300)return;if(e&&e.type==='keydown'&&!/^(e|E|Escape|Enter| |x|X)$/.test(e.key))return;if(e){e.preventDefault();e.stopPropagation();}mirClose();};
  b.addEventListener('pointerdown',close);addEventListener('keydown',e=>{if(MIR.on)close(e);},true);}
// how bad it is: the nights' horror and your nerve, whichever is further gone
function mirLevel(){if(MIR.forceL!=null)return MIR.forceL;let L=0;try{L=Math.max(L,typeof hl==='function'?hl():0);}catch(e){}try{if(typeof tierOf==='function'&&typeof M!=='undefined')L=Math.max(L,tierOf(M.v));}catch(e){}return Math.max(0,Math.min(4,L|0));}
function mirOpen(){if(MIR.on)return;mirEnsure();const L=mirLevel();MIR.L=L;MIR.on=true;MIR.stung=false;MIR.openAt=performance.now();MIR.wasPaused=!!S.paused;S.paused=true;
  const vw=innerWidth,vh=innerHeight,K=Math.max(2,Math.floor(Math.min(vw/170,vh/150))),W=Math.ceil(vw/K),H=Math.ceil(vh/K);MIR.K=K;MIR.W=W;MIR.H=H;
  const cv=MIR.cv;cv.width=W;cv.height=H;cv.style.width=W*K+'px';cv.style.height=H*K+'px';MIR.g.imageSmoothingEnabled=false;
  MIR.hint.textContent=matchMedia('(pointer:coarse)').matches?'Tap to look away':'Click or press E to look away';
  MIR.box.hidden=false;MIR.box.classList.remove('on');void MIR.box.offsetWidth;MIR.box.classList.add('on');
  try{SFX.breath&&SFX.breath();}catch(e){}
  MIR.t=0;cancelAnimationFrame(MIR.raf);let last=performance.now();const tick=now=>{if(!MIR.on)return;MIR.t+=(now-last)/1000;last=now;try{mirFrame();}catch(e){console.warn('mirror',e);}MIR.raf=requestAnimationFrame(tick);};
  MIR.raf=requestAnimationFrame(tick);mirFrame();}
function mirClose(){if(!MIR.on)return;MIR.on=false;cancelAnimationFrame(MIR.raf);MIR.box.classList.remove('on');setTimeout(()=>{if(!MIR.on)MIR.box.hidden=true;},260);S.paused=MIR.wasPaused;
  const L=MIR.L;try{if(L>=2&&typeof mindHit==='function')mindHit(3+L);}catch(e){}
  try{if(L>=3&&typeof once==='function'&&once('mirrorSlam')&&typeof faceSlam==='function')setTimeout(()=>faceSlam(.5,false),900);}catch(e){}}
// the player's own sprite, one frame of a clip, from the composed sheet (hair, clothes, glasses and hat as they look now)
function mirFrameImg(dir,i){const m=SPR.farmer;if(!m)return null;const im=IMG[m.src];if(!im)return null;const c=m.clips&&m.clips.idle&&m.clips.idle[dir];if(!c)return null;
  const n=c[1]||1;return {im,sx:(i%n)*m.fw,sy:c[0]*m.fh,fw:m.fw,fh:m.fh};}
function mirFrame(){const g=MIR.g,W=MIR.W,H=MIR.H,t=MIR.t,L=MIR.L;const P_=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);};
  const night=typeof isNight==='function'&&(isNight()||S.hour<5.5);
  // the wall of the cabin round the mirror: boards, a grain line in each, a nail head here and there
  P_(0,0,W,H,'#24170e');for(let y=0,k=0;y<H;y+=9,k++){P_(0,y,W,1,'#160d07');P_(0,y+1,W,1,'#33221a');for(let x=(k*23)%37;x<W;x+=37+(k%3)*6){P_(x,y+4,9,1,'#2c1d13');}if(k%2)for(let x=(k*41)%61+5;x<W;x+=61)P_(x,y+2,1,1,'#0e0805');}
  // the mirror: an arched top, a wide frame lit from the top left, a wire and a nail above it
  const gw=Math.min(Math.round(W*.36),104),gh=Math.min(Math.round(H*.66),Math.round(gw*1.32)),gx=Math.round(W/2-gw/2),gy=Math.round(H*.13);const arch=Math.round(gw*.22);
  const inGlass=(x,y)=>{if(x<0||x>=gw||y<0||y>=gh)return false;if(y>=arch)return true;const cx=gw/2,r=gw/2,dy=arch-y,dx=x+.5-cx;return dx*dx/(r*r)+dy*dy/(arch*arch)<=1;};
  P_(W/2-1,gy-arch*.2-10,2,2,'#8a7a62');for(let i=0;i<8;i++){P_(W/2-1-i*1.6-6,gy-6-i*.3+arch*.0,2,1,'#5a4a38');P_(W/2+1+i*1.6+4,gy-6-i*.3,2,1,'#5a4a38');}
  const fr=5;for(let y=-fr;y<gh+fr;y++)for(let x=-fr;x<gw+fr;x++){if(inGlass(x,y))continue;let near=false;for(let d=1;d<=fr&&!near;d++)if(inGlass(x+d,y)||inGlass(x-d,y)||inGlass(x,y+d)||inGlass(x,y-d))near=true;if(!near)continue;
    const edge=!(inGlass(x+fr+1,y)||inGlass(x-fr-1,y)||inGlass(x,y+fr+1)||inGlass(x,y-fr-1));const lit=(x<gw/2?1:0)+(y<gh/3?1:0);
    let c=['#4a2c16','#6a4222','#8a5a2e'][lit];if(edge)c='#1a0e06';else if(inGlass(x+1,y)||inGlass(x-1,y)||inGlass(x,y+1)||inGlass(x,y-1))c=lit?'#2e1a0c':'#24140a';
    P_(gx+x,gy+y,1,1,c);}
  // a carved crest on the top of the frame
  for(let i=-6;i<=6;i++)P_(W/2+i,gy-arch-fr-1-Math.round(2.5-Math.abs(i)*.35),1,Math.round(3-Math.abs(i)*.3),Math.abs(i)<3?'#9a6a36':'#6a4222');
  // what the glass shows: the cabin behind you (the wall with the window and the coat hook, the end of the bed)
  const G=document.createElement('canvas');G.width=gw;G.height=gh;const q=G.getContext('2d');q.imageSmoothingEnabled=false;const Q=(x,y,w,h,c)=>{q.fillStyle=c;q.fillRect(x|0,y|0,w|0,h|0);};
  Q(0,0,gw,gh,'#2a2420');for(let y=0;y<gh;y+=8){Q(0,y,gw,1,'#1a1612');Q(0,y+1,gw,1,'#342c26');}
  // the window, back to front: night is deep blue with a moon; at the worst it is daylight in there whatever the hour
  const day=L>=4?true:!night;const wx=Math.round(gw*.5),wy=Math.round(gh*.16),ww=Math.round(gw*.26),wh=Math.round(gh*.22);
  Q(wx-2,wy-2,ww+4,wh+4,'#1a120c');Q(wx,wy,ww,wh,day?'#9ab0c0':'#141c34');if(day){Q(wx,wy+wh*.6,ww,wh*.4,'#b8c4c8');}else{Q(wx+ww*.65,wy+3,3,3,'#d8dcc8');}
  Q(wx+ww/2-1,wy,2,wh,'#1a120c');Q(wx,wy+wh/2-1,ww,2,'#1a120c');
  // the coat on its hook (gone at the worst)
  const hx=Math.round(gw*.88),hy=Math.round(gh*.18);Q(hx,hy,3,2,'#8a7a62');
  if(L<4){Q(hx-5,hy+2,13,4,'#4a3a2a');Q(hx-6,hy+6,15,Math.round(gh*.28),'#3e3024');Q(hx-6,hy+6,2,Math.round(gh*.28),'#2a2018');Q(hx+1,hy+6,1,Math.round(gh*.24),'#2a2018');}
  // the end of the bed, low on the right: the footboard, the blanket over it
  const bx=Math.round(gw*.5),by=Math.round(gh*.68);Q(bx,by,gw-bx,gh-by,'#3a2416');Q(bx,by,gw-bx,3,'#5a3a22');
  const breathe=L>=3&&L<4?Math.round(2.5+2.5*Math.sin(t*1.7)):0;
  if(L>=4){Q(bx+2,by-6,gw-bx-2,6,'#6a6a7a');Q(bx+2,by-6,gw-bx-2,1,'#8a8a9a');}   // made: flat, tucked tight
  else{const base=by-7;Q(bx+2,base,gw-bx-2,by-base,'#6a4a5a');Q(bx+2,base,gw-bx-2,1,'#8a6a7a');
    // the pillow at the far end
    Q(gw-12,base-5,12,5,'#c8c0b0');Q(gw-12,base-5,12,1,'#e0d8c8');
    if(L>=3){// somebody under the covers, the length of the bed, breathing; their hair on the pillow
      const x0=bx+3,x1=gw-4;for(let x=x0;x<x1;x++){const u=(x-x0)/(x1-x0),hh=Math.round((7+breathe*.8)*Math.sin(Math.PI*Math.min(1,u*1.15))*(u>.82?.75:1));if(hh<=0)continue;
        Q(x,base-hh,1,hh,'#6a4a5a');Q(x,base-hh,1,1,u<.5?'#8a6a7a':'#7a5a6a');if(u>.3&&u<.7)Q(x,base-hh+2,1,1,'#5a3a4a');}
      Q(gw-9,base-8,7,4,'#1e1610');Q(gw-10,base-6,2,2,'#1e1610');Q(gw-8,base-9,4,1,'#2e2418');
      if(t>2.2){Q(x0+6,by-2,4,2,'#d8c0b0');Q(x0+5,by-1,1,1,'#d8c0b0');Q(x0+6,by-2,4,1,'#e8d0c0');}}}   // a hand at the edge of the blanket
  // you, flipped as a mirror flips you: front on, from the chest up
  if(L<4){let dir='S',fi=Math.floor(t*2.2)%4;let still=false;
    if(L===1&&t<.9)dir='W';                         // it turns to you a beat after you look
    if(L===2&&t<2.6){dir='W';still=true;}             // it is watching the door
    if(L===2&&t>=2.6)still=true;
    if(still)fi=0;const F=mirFrameImg(dir,fi);
    if(F){const y0=12,y1=54,s=Math.max(2,Math.floor((gh*.8)/(y1-y0)));const dw=F.fw*s,dh=(y1-y0)*s;const dx=Math.round(gw*.3-dw/2),dy=gh-dh+(still?0:(Math.floor(t*1.1)%2));
      q.save();q.translate(dx+dw,dy);q.scale(-1,1);q.drawImage(F.im,F.sx,F.sy+y0,F.fw,y1-y0,0,0,dw,dh);q.restore();
      // the face, in the frame's own pixels: skin sampled from the cheek, the eyes at 19-21 and 28-30 across, 28-31 down
      const fx=x=>dx+dw-(x+1)*s,fy=y=>dy+(y-y0)*s;
      if(dir==='S'){let skin=null;try{const tc=document.createElement('canvas');tc.width=1;tc.height=1;const tg=tc.getContext('2d');tg.drawImage(F.im,F.sx+24,F.sy+34,1,1,0,0,1,1);const d=tg.getImageData(0,0,1,1).data;if(d[3])skin=`rgb(${d[0]},${d[1]},${d[2]})`;}catch(e){}
        // it blinks when you don't
        if(L===1&&skin&&((t>1.5&&t<2.0)||(t>4.4&&t<4.8))){for(const ex of [[19,21],[28,30]])q.fillStyle=skin,q.fillRect(fx(ex[1]),fy(28),(ex[1]-ex[0]+1)*s,4*s);}
        // and then it smiles, too wide, with every tooth
        if(L===2&&t>=2.6){if(!MIR.stung){MIR.stung=true;try{SFX.stinger&&SFX.stinger();}catch(e){}}
          const my=36,xs=[17,18,19,20,21,22,23,24,25,26,27,28,29,30];for(const x of xs){const c=Math.abs(x-23.5);const lift=Math.round(Math.max(0,c-3.5)*.6);
            q.fillStyle='#1a0808';q.fillRect(fx(x),fy(my-lift),s,s*2);if(c<6.5){q.fillStyle='#e8e0d0';q.fillRect(fx(x),fy(my-lift),s,s);if(x%2){q.fillStyle='#9a8a80';q.fillRect(fx(x),fy(my-lift),Math.max(1,s>>1),s);}}}}}}}
  // the old glass: grey-blue over everything, silvering gone in blotches at the edges, a streak of light across
  q.fillStyle='rgba(150,170,190,.12)';q.fillRect(0,0,gw,gh);
  for(let i=0;i<26;i++){const a=(i*137.5)%360*Math.PI/180,r=.42+.08*((i*7)%5)/5;const x=gw/2+Math.cos(a)*gw*r,y=gh/2+Math.sin(a)*gh*r;q.fillStyle=i%3?'rgba(20,16,14,.55)':'rgba(60,52,44,.5)';q.fillRect(x|0,y|0,2+(i%3),1+(i%2));}
  q.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<gh;i++){q.fillRect(Math.round(gw*.15+i*.45),i,3,1);q.fillRect(Math.round(gw*.15+i*.45)+7,i,1,1);}
  if(night){q.fillStyle='rgba(8,10,26,.45)';q.fillRect(0,0,gw,gh);}
  // into the arch: only the pixels inside the glass
  const id=q.getImageData(0,0,gw,gh),dd=id.data;for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)if(!inGlass(x,y))dd[(y*gw+x)*4+3]=0;q.putImageData(id,0,0);g.drawImage(G,gx,gy);
  // the lantern in your hand lights the frame from below left at night
  if(night){g.fillStyle='rgba(6,6,16,.5)';g.fillRect(0,0,W,H);g.globalAlpha=.1+.03*Math.sin(t*9)*Math.sin(t*3.1);g.fillStyle='#f0a040';g.beginPath();g.arc(W*.3,H*.95,H*.7,0,6.29);g.fill();g.globalAlpha=1;}}
// both of the cabin's mirror spots, and every other mirror on a wall (the motel, the farmhands' cabins, the house rooms) open the close-up
{const hook=()=>{for(const it of interact){if(it._mir||!it.label)continue;let lb='';try{lb=it.label();}catch(e){}if(lb!=='Mirror')continue;it._mir=1;it.act=function(){mirOpen();};}
  for(const [k,R] of Object.entries(ROOMS)){if(!R||!R.furn)continue;for(const f of R.furn){if(!Array.isArray(f)||f[0]!=='in_mirror')continue;const x=R.ox+f[1],z=R.oz+f[2]+.75;
      if(interact.some(it=>it._mir&&Math.abs(it.x-x)<1.2&&Math.abs(it.z-z)<1.4))continue;
      interact.push({x,z,r:.9,_mir:2,on:()=>S.room===k,label:()=>'Mirror',ok:()=>true,act(){mirOpen();}});}}};
  try{hook();}catch(e){}const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{hook();}catch(e){}return r;};}

// ---------------------------------------------------------------- 2. story beats you can always finish
S.saga=S.saga||{done:{},ch:0};
// a beat that has begun is marked "pending" until it has really ended (its lore is in the journal); one still pending when a game
// is loaded never finished, so it is opened again
{const _sp=sgPlay;sgPlay=function(b){if(b&&!S.saga.done[b.id]){S.saga.pend=S.saga.pend||{};S.saga.pend[b.id]=S.day;}return _sp.apply(this,arguments);};}
const sgLoreOf=b=>{try{return sgVal(b.lore);}catch(e){return null;}};
function sgPendCheck(){const pd=S.saga&&S.saga.pend;if(!pd)return;const busy=(typeof SCENE!=='undefined'&&SCENE)||(typeof STG!=='undefined'&&STG)||($('note')&&!$('note').hidden);if(busy)return;
  let ended=false;for(const id of Object.keys(pd)){const b=SAGA.find(q=>q.id===id);const lore=b&&sgLoreOf(b);if(!b||!lore||(S.lore||[]).includes(lore)){delete pd[id];ended=true;}}
  if(ended){try{if(!(typeof HOST!=='undefined'&&HOST.role==='guest'))saveGame(true);else if(typeof guestPersist==='function')guestPersist();}catch(e){}sgShare(true);}}
setInterval(()=>{try{if(S.mode==='play')sgPendCheck();}catch(e){}},1000);
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{if(!(typeof HOST!=='undefined'&&(HOST.applying||HOST.role==='guest'))){const pd=S.saga&&S.saga.pend;
      if(pd)for(const id of Object.keys(pd)){const b=SAGA.find(q=>q.id===id);const lore=b&&sgLoreOf(b);if(b&&lore&&!(S.lore||[]).includes(lore))delete S.saga.done[id];delete pd[id];}}}catch(e){}return r;};}
// the person a beat sends you to: talking to them plays it at any hour, and an "Ask" button stands by them so it can't be missed
const SG_ASK={ferry:'Ask Nan what the crossing costs',agnes:'Ask Agnes',stay:'Ask them to stay'};
{const _t=talk;talk=function(n){try{const b=sgCurrent();if(b&&b.npc&&n&&n.def&&n.def.id===sgVal(b.npc)&&!(typeof SCENE!=='undefined'&&SCENE)){if(typeof lastQuestLine!=='undefined')lastQuestLine=null;sgPlay(b);return;}}catch(e){}return _t.apply(this,arguments);};}
{const _cc=computeContext;computeContext=function(){try{if(S.mode==='play'&&!(typeof SCENE!=='undefined'&&SCENE)&&!(typeof STG!=='undefined'&&STG)){const b=sgCurrent();
      if(b&&b.npc){const id=sgVal(b.npc),n=npcById(id);if(n&&n.vis!==false&&n.loc!=='stage'&&Math.hypot(n.x-P.x,n.z-P.z)<1.9)return {label:SG_ASK[b.id]||`Ask ${sgName(id)}`,ok:true,act(){sgPlay(b);}};}}}catch(e){}
  return _cc.apply(this,arguments);};}
// on a shared farm a farmhand's story steps go to the host, so they are part of the farm's story and survive the morning
if(typeof PROG_KEYS!=='undefined'&&!PROG_KEYS.includes('st'))PROG_KEYS.push('st');
let SGSH_LAST='';
function sgShare(force){try{if(typeof HOST==='undefined'||HOST.role!=='guest'||!HOST.hostPeer||!CO.room||!CO.room.emit)return;const pay={done:S.saga.done||{},st:S.st||{}};const j=JSON.stringify(pay);
    if(!force&&j===SGSH_LAST)return;if(j.length>40000)return;SGSH_LAST=j;CO.room.emit('sgprog',pay,HOST.hostPeer);}catch(e){}}
setInterval(()=>{try{if(S.mode==='play')sgShare(false);}catch(e){}},5000);
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('sgprog',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data;let moved=false;
      if(d.done&&typeof d.done==='object')for(const [id,v] of Object.entries(d.done)){if(!SAGA.some(q=>q.id===id)||S.saga.done[id])continue;S.saga.done[id]=isFinite(v)?Math.max(1,v|0):S.day;moved=true;}
      if(d.st&&typeof d.st==='object'&&!Array.isArray(d.st)&&typeof progMerge==='function'){const before=JSON.stringify(S.st||{});S.st=progMerge(S.st||{},d.st);if(JSON.stringify(S.st)!==before)moved=true;}
      if(moved){try{sgProps();}catch(e){}try{saveGame(true);}catch(e){}}}catch(e){}}));
  // ---------------------------------------------------------------- 3. a farmhand's deed, recorded on the host's farm
  HOST.off.push(r.on('landbuy',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data,id=String(d.id||''),by=clean(d.by||'');const P_=LAND_PARCELS.find(q=>q.id===id);if(!P_||!by)return;
      if(landOwns(id)){const o=landOwnedSet()[id];if(o&&o.by!==by&&typeof mkPay==='function')mkPay(by,P_.price,`${P_.name} was already sold. Agnes gives the money back.`);return;}
      landOwnedSet()[id]={day:S.day,by};landSync();try{saveGame(true);}catch(e){}toast(`${by} bought ${P_.name.replace(/^The /,'the ')}.`,3);}catch(e){}}));
  return r0;};}

// ---------------------------------------------------------------- 4. the code console without a keyboard
{const bb=$('bagClose');if(bb&&!$('bagCode')){const C=document.createElement('button');C.className='close';C.id='bagCode';C.textContent='Code';
  C.addEventListener('click',()=>{try{bb.click();}catch(e){}setTimeout(()=>{try{if(typeof cheatOpen==='function')cheatOpen();}catch(e){}},80);});
  bb.parentNode.insertBefore(C,bb);}}
