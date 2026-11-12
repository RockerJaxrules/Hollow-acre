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
function mirOpen(){if(MIR.on)return;mirEnsure();const L=mirLevel();MIR.L=L;MIR.on=true;MIR.stung=false;MIR.st=null;MIR.skin=undefined;MIR.openAt=performance.now();MIR.wasPaused=!!S.paused;S.paused=true;
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
// the still parts (the wall, the mirror's shadow on it, the frame, the wire) are drawn once per look; the glass is drawn every frame
function mirStatic(W,H,dark){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const P_=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,w|0,h|0);};
  // the cabin wall: boards with their seams, a grain line or two, the odd nail head
  P_(0,0,W,H,'#2a1b10');for(let y=0,k=0;y<H;y+=9,k++){P_(0,y,W,1,'#150c06');P_(0,y+1,W,1,'#3a281a');for(let x=(k*23)%37;x<W;x+=37+(k%3)*6)P_(x,y+4,9,1,'#321f13');if(k%2)for(let x=(k*41)%61+5;x<W;x+=61)P_(x,y+2,1,1,'#0e0805');}
  const gw=Math.min(Math.round(W*.32),92),gh=Math.min(Math.round(H*.7),Math.round(gw*1.36)),gx=Math.round(W/2-gw/2),gy=Math.round(H*.14),fr=8;
  const rx=gw/2,ry=gh/2,cx=gx+rx,cy=gy+ry;const ring=(x,y)=>{const dx=x+.5-cx,dy=y+.5-cy;for(let d=0;d<=fr;d++){const a=rx+d,b=ry+d;if(dx*dx/(a*a)+dy*dy/(b*b)<=1)return d;}return -1;};
  // the shadow the mirror casts down and to the right on the boards
  for(let y=gy-fr-12;y<gy+gh+fr+8;y++)for(let x=gx-fr;x<gx+gw+fr+8;x++){const r=ring(x-5,y-6);if(r<0)continue;g.fillStyle='rgba(6,3,2,.5)';g.fillRect(x,y,1,1);}
  // the wire from the frame to a nail, and the nail
  const ny=gy-fr-13;for(let i=0;i<=16;i++){const t=i/16;P_(Math.round(cx-14+(14)*t),Math.round(gy-fr+2+(ny-(gy-fr+2))*t),1,1,'#7a6a52');P_(Math.round(cx+14-(14)*t),Math.round(gy-fr+2+(ny-(gy-fr+2))*t),1,1,'#7a6a52');}
  P_(cx-1,ny-1,3,3,'#1a120a');P_(cx-1,ny-1,2,1,'#9a8a6a');
  // the frame: a moulded oval. Outer edge dark; a raised bead; a wide flat face; a dark cove; a gilt inner lip. Lit from the top left.
  const PROF={1:['#d8a456','#5a3a18'],2:['#2a1608','#2a1608'],3:['#8a5a2e','#4a2c14'],4:['#7a4e26','#40260f'],5:['#6a4220','#38220e'],6:['#a87440','#3a2410'],7:['#5a3818','#2a180a'],8:['#1a0e06','#1a0e06']};
  for(let y=gy-fr-1;y<gy+gh+fr+1;y++)for(let x=gx-fr-1;x<gx+gw+fr+1;x++){const r=ring(x,y);if(r<1)continue;const nx=(x+.5-cx)/rx,ny2=(y+.5-cy)/ry,l=Math.hypot(nx,ny2)||1;
    // the outward normal against the light from the top left: lit faces point up-left; the cove (2) is concave, so it lights the other way
    let lit=-(nx/l*.7+ny2/l*.7);if(r===2)lit=-lit;const pal=PROF[r];const col=lit>.25?pal[0]:lit<-.25?pal[1]:(r===1||r===6?'#8a5e30':r===2||r===8?pal[0]:mixHex(pal[0],pal[1],.5));P_(x,y,1,1,col);}
  // a carved crest at the top of the frame: a shell of five lobes
  for(let k=-2;k<=2;k++){const bx=Math.round(cx+k*4),by=gy-fr-2-(2-Math.abs(k));for(let j=0;j<4;j++)for(let i=-1;i<=1;i++)P_(bx+i,by+j,1,1,i<0||j===0?'#b07a3e':j===3?'#3a2410':'#7a4e26');}
  P_(cx-1,gy-fr-7,3,2,'#c8904a');
  if(dark){g.fillStyle='rgba(4,4,12,.5)';g.fillRect(0,0,W,H);}
  return {c,gw,gh,gx,gy,rx,ry,cx,cy};}
function mixHex(a,b,t){const p=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const A=p(a),B=p(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');}
function mirFrame(){const g=MIR.g,W=MIR.W,H=MIR.H,t=MIR.t,L=MIR.L;
  const night=typeof isNight==='function'&&(isNight()||S.hour<5.5);const dark=night||L===3;
  if(!MIR.st||MIR.st.W!==W||MIR.st.H!==H||MIR.st.dark!==dark){MIR.st=Object.assign(mirStatic(W,H,dark),{W,H,dark});}
  const ST=MIR.st,gw=ST.gw,gh=ST.gh;g.drawImage(ST.c,0,0);
  const inGlass=(x,y)=>{const dx=(x+.5-gw/2)/(gw/2),dy=(y+.5-gh/2)/(gh/2);return dx*dx+dy*dy<=1;};
  // what the glass shows: the cabin behind you, a step cooler and dimmer than the wall it hangs on
  const G=MIR.G||(MIR.G=document.createElement('canvas'));if(G.width!==gw||G.height!==gh){G.width=gw;G.height=gh;}const q=G.getContext('2d',{willReadFrequently:true});q.imageSmoothingEnabled=false;
  const Q=(x,y,w,h,c)=>{q.fillStyle=c;q.fillRect(x|0,y|0,w|0,h|0);};q.clearRect(0,0,gw,gh);
  Q(0,0,gw,gh,'#262220');for(let y=0;y<gh;y+=8){Q(0,y,gw,1,'#171412');Q(0,y+1,gw,1,'#302a26');}
  // the window: night is black with a moon; at the worst it is daylight in there whatever the hour
  const day=L>=4?true:!dark;const wx=Math.round(gw*.52),wy=Math.round(gh*.17),ww=Math.round(gw*.26),wh=Math.round(gh*.2);
  Q(wx-2,wy-2,ww+4,wh+4,'#1a120c');Q(wx,wy,ww,wh,day?'#9ab0c0':'#080c1a');if(day)Q(wx,wy+wh*.6,ww,wh*.4,'#b8c4c8');else{Q(wx+ww*.62,wy+2,3,3,'#e0e4d0');Q(wx+ww*.62+1,wy+2,2,1,'#fffff0');}
  Q(wx+ww/2-1,wy,2,wh,'#1a120c');Q(wx,wy+wh/2-1,ww,2,'#1a120c');
  // the coat on its hook (gone at the worst)
  const hx=Math.round(gw*.84),hy=Math.round(gh*.28);Q(hx,hy,3,2,'#8a7a62');
  if(L<4){const ch=Math.round(gh*.24);Q(hx-4,hy+2,11,4,'#4a3a2a');Q(hx-5,hy+6,13,ch,'#3e3024');Q(hx-5,hy+6,2,ch,'#2a2018');Q(hx+1,hy+6,1,ch-3,'#2a2018');}
  // the bed, low on the right: the frame, the blanket, the pillow at the far end
  const bx=Math.round(gw*.46),by=Math.round(gh*.7),base=by-7;Q(bx,by,gw-bx,gh-by,'#3a2416');Q(bx,by,gw-bx,2,'#5a3a22');
  if(L>=4){Q(bx+2,by-6,gw-bx-2,6,'#6a6a7a');Q(bx+2,by-6,gw-bx-2,1,'#8a8a9a');Q(gw-14,by-10,12,4,'#c8c0b0');}   // made: flat, tucked tight
  else{Q(bx+2,base,gw-bx-2,by-base,'#6a4a5a');Q(bx+2,base,gw-bx-2,1,'#8a6a7a');Q(gw-14,base-5,12,5,'#c8c0b0');Q(gw-14,base-5,12,1,'#e0d8c8');
    if(L>=3){// somebody under the covers, breathing: a shoulder at the pillow end, the dip of the waist, a hip, the legs to the foot
      const br=1.5+1.5*Math.sin(t*1.7),x0=bx+3,x1=gw-13;
      for(let x=x0;x<x1;x++){const u=(x-x0)/(x1-x0);const prof=u>.78?9:u>.62?6.5:u>.46?8:u>.25?5.5:4-1.5*(1-u/.25);const hh=Math.round(Math.max(1,prof+(u>.6?br:br*.4)));
        Q(x,base-hh,1,hh,'#6a4a5a');Q(x,base-hh,1,1,'#8a6a7a');if(u>.62&&u<.78)Q(x,base-hh+1,1,1,'#5a3a4a');}
      Q(gw-12,base-9,8,5,'#1e1610');Q(gw-13,base-7,2,3,'#1e1610');Q(gw-11,base-10,5,1,'#2e2418');   // the hair on the pillow
      if(t>1.8){const fx0=Math.round(x0+(x1-x0)*.7);for(let f=0;f<4;f++){Q(fx0+f*2,by-1,1,3,'#e0c8b8');Q(fx0+f*2,by+2,1,1,'#b89a8a');}Q(fx0-1,by-2,9,1,'#e0c8b8');}}}   // four fingers curled over the edge
  // you, flipped as a mirror flips you, from the chest up
  if(L<4){let dir='S',fi=Math.floor(t*2.2)%4,still=false;
    if(L===1&&t<.9)dir='W';
    if(L===2&&t<2.6){dir='W';still=true;}
    if(L===2&&t>=2.6)still=true;
    if(still)fi=0;const F=mirFrameImg(dir,fi);
    if(F){const y0=12,y1=54,s=Math.max(2,Math.floor((gh*.8)/(y1-y0)));const dw=F.fw*s,dh=(y1-y0)*s;const dx=Math.round(gw*.34-dw/2),dy=gh-dh+(still?0:(Math.floor(t*1.1)%2));
      q.save();q.translate(dx+dw,dy);q.scale(-1,1);q.drawImage(F.im,F.sx,F.sy+y0,F.fw,y1-y0,0,0,dw,dh);q.restore();
      const fx=x=>dx+dw-(x+1)*s,fy=y=>dy+(y-y0)*s;
      if(dir==='S'){if(MIR.skin===undefined){MIR.skin=null;try{const tc=document.createElement('canvas');tc.width=1;tc.height=1;const tg=tc.getContext('2d');tg.drawImage(F.im,F.sx+24,F.sy+34,1,1,0,0,1,1);const d=tg.getImageData(0,0,1,1).data;if(d[3])MIR.skin=[d[0],d[1],d[2]];}catch(e){}}
        const sk=MIR.skin,skin=sk&&`rgb(${sk[0]},${sk[1]},${sk[2]})`,shade=sk&&`rgb(${sk[0]*.72|0},${sk[1]*.62|0},${sk[2]*.66|0})`;
        // tired: the skin under each eye a shade darker
        if(shade&&L===0)for(const ex of [[19,21],[28,30]]){q.fillStyle=shade;q.fillRect(fx(ex[1]),fy(32),(ex[1]-ex[0]+1)*s,s);}
        // it blinks when you don't, and after the first blink one lid never quite comes back up
        if(L===1&&skin){const shut=(t>1.5&&t<2.0)||(t>4.4&&t<4.8);for(const [i,ex] of [[19,21],[28,30]].entries()){const rows=shut?4:(t>=2.0&&i===1?2:0);if(rows){q.fillStyle=skin;q.fillRect(fx(ex[1]),fy(28),(ex[1]-ex[0]+1)*s,rows*s);q.fillStyle=shade;q.fillRect(fx(ex[1]),fy(28+rows-1),(ex[1]-ex[0]+1)*s,s>>1);}}}
        // and then it smiles, too wide, with every tooth
        if(L===2&&t>=2.6){if(!MIR.stung){MIR.stung=true;try{SFX.stinger&&SFX.stinger();}catch(e){}}
          for(let x=17;x<=30;x++){const c=Math.abs(x-23.5);const lift=Math.round(Math.max(0,c-3.5)*.6);q.fillStyle='#1a0808';q.fillRect(fx(x),fy(36-lift),s,s*2);
            if(c<6.5){q.fillStyle='#e8e0d0';q.fillRect(fx(x),fy(36-lift),s,s);if(x%2){q.fillStyle='#9a8a80';q.fillRect(fx(x),fy(36-lift),Math.max(1,s>>1),s);}}}}}}}
  // the reflection is a step cooler and dimmer than the room
  q.fillStyle='rgba(110,140,170,.16)';q.fillRect(0,0,gw,gh);q.fillStyle='rgba(10,12,20,.12)';q.fillRect(0,0,gw,gh);
  // dark by night (or when something is in the bed): the lantern you hold, low on the left, the only warm light
  if(dark){q.fillStyle='rgba(4,6,16,.62)';q.fillRect(0,0,gw,gh);q.globalCompositeOperation='lighter';const fl=.9+.1*Math.sin(t*9)*Math.sin(t*3.1);
    for(const [r,a] of [[gh*.75,.07],[gh*.5,.08],[gh*.3,.09]]){q.fillStyle=`rgba(255,150,60,${a*fl})`;q.beginPath();q.arc(gw*.22,gh*1.02,r,0,6.29);q.fill();}
    // moonlight from the window falls across the bed, so what is in it can be seen
    q.fillStyle='rgba(110,130,180,.22)';q.beginPath();q.moveTo(wx,wy+wh);q.lineTo(wx+ww,wy+wh);q.lineTo(gw,gh*.95);q.lineTo(bx-4,gh*.95);q.closePath();q.fill();q.globalCompositeOperation='source-over';}
  // the old glass: a pale bevel just inside the frame, silvering lost in dark freckles creeping in from the edges, a streak of light
  const id=q.getImageData(0,0,gw,gh),dd=id.data;const hsh=(x,y)=>{const n=Math.sin(x*12.9898+y*78.233)*43758.5453;return n-Math.floor(n);};
  for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const i=(y*gw+x)*4;if(!inGlass(x,y)){dd[i+3]=0;continue;}
    const ex=(x+.5-gw/2)/(gw/2),ey=(y+.5-gh/2)/(gh/2),e=Math.sqrt(ex*ex+ey*ey);
    if(e>.93){const k=(ex<0&&ey<0)?.34:.12;dd[i]+= (255-dd[i])*k;dd[i+1]+=(255-dd[i+1])*k;dd[i+2]+=(255-dd[i+2])*k;continue;}   // the bevel
    const blot=hsh(Math.floor(x/3),Math.floor(y/3))*.6+hsh(x,y)*.4;const edge=Math.max(0,(e-.66)/.27);
    if(blot<edge*edge*.4){const m=.45+.3*hsh(y,x);dd[i]*=1-m;dd[i+1]*=1-m*.95;dd[i+2]*=1-m*.85;}   // foxing
    else if(hsh(x*3,y*7)>.996){dd[i]=dd[i+1]=dd[i+2]=40;}}
  q.putImageData(id,0,0);q.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<gh;y++){const x=Math.round(gw*.18+y*.42);if(inGlass(x,y))q.fillRect(x,y,3,1);if(inGlass(x+7,y))q.fillRect(x+7,y,1,1);}
  g.drawImage(G,ST.gx,ST.gy);
  // nobody in the mirror, but you are here: your shadow on the boards beside the frame
  if(L>=4){const F=mirFrameImg('S',0);if(F){const s=2,y0=4;const sc=document.createElement('canvas');sc.width=F.fw*s;sc.height=(F.fh-y0)*s;const sg=sc.getContext('2d');sg.imageSmoothingEnabled=false;
      sg.drawImage(F.im,F.sx,F.sy+y0,F.fw,F.fh-y0,0,0,sc.width,sc.height);sg.globalCompositeOperation='source-in';sg.fillStyle='rgba(4,2,2,.62)';sg.fillRect(0,0,sc.width,sc.height);
      g.drawImage(sc,Math.round(ST.gx-sc.width*.62),Math.round(ST.gy+gh*.3));}}
  // the room you're standing in: dim at night, warm where the lantern reaches
  if(dark){g.globalAlpha=.08+.03*Math.sin(t*9)*Math.sin(t*3.1);g.fillStyle='#f0a040';g.beginPath();g.arc(W*.28,H*1.05,H*.75,0,6.29);g.fill();g.globalAlpha=1;}}
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
