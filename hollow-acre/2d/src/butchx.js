/* ================= t375 (butchx.js) butchering at Extreme (owner: "an extra opt in option which brings the gore and butchering to
   the level it's as gruesome disturbing bloody and fleshy and heartless as a pixel game can be"; "to the absolute extreme to the point
   there is a reason why you have to opt in"). Only while the Gore setting is Extreme (window.GORE_EXTREME); Full and Toned are as they
   were. Over every step, done yourself: blood thrown at the lens splats there and runs down it for the rest of the scene, darkening as
   it clots; your fists are soaked to the end; the opened bodies steam and twitch; the guts spill out of her over the tub and onto the
   boards and the floor goes slick; flies come and settle on what's out; the sounds don't let up (wet tearing, bone, gurgling, the
   flies). The kill itself is longer and worse (in butchkill.js): the hen's headless body gets up and runs into the wall and keeps
   going; the cow's eye stays open on you, she thrashes and bawls, her breath bubbles through the cut, and a botched stun means she
   comes round and you have to finish it. Every mistake makes it last longer and louder. Hand-placed: gathered runs and blots, no speckle. ================= */
const BX={lensL:[],flies:[],bloody:0,t0:0,steam:[],drawing:false,spill:0,stepHits:0,nHit:0};
BX.on=()=>!!window.GORE_EXTREME&&!window.GORE_TONED;
BK.XL=BX;   // for steps where BX is a local name (the chopping block's x)
BX.now=()=>performance.now()/1000;
BX.age=()=>BX.now()-BX.t0;
BX.H=(s,i)=>{let v=(s*374761393+i*668265263)|0;v=(v^(v>>>13))*1274126177|0;return((v^(v>>>16))>>>0)/4294967295;};
BX.reset=()=>{BX.lensL=[];BX.flies=[];BX.bloody=0;BX.t0=BX.now();BX.steam=[];BX.spill=0;BX.twT=0;BX.stepHits=0;try{BX.buzz&&BX.buzz.set(0);}catch(e){}};
// ---------------------------------------------------------------- sounds (the game's own synth)
BX.snd={
  gurgle(k){k=k||1;A.hiss(.5,.07*k,'lowpass',MSV(380,.3),{slide:180,wobble:1});for(let i=0;i<6;i++)A.tone(MSV(120+i*18,.35),.07,'sine',.05*k,{slide:70,delay:.04+i*.07});},
  wet(k){k=k||1;A.hiss(.24,.16*k,'bandpass',MSV(700,.3),{q:1.4,slide:260,wobble:1});A.tone(MSV(140,.3),.16,'sine',.06*k,{slide:60,delay:.03});},
  squelch(){A.hiss(.12,.12,'lowpass',MSV(900,.3),{slide:300});A.tone(MSV(220,.3),.08,'sine',.05,{slide:90});},
  splat(k){k=k||1;A.hiss(.09,.22*k,'bandpass',MSV(1500,.2),{q:1.2});A.tone(MSV(180,.2),.07,'sine',.07*k,{slide:70});},
  crack(){BG71.snd.crack();A.tone(MSV(90,.2),.12,'sine',.18,{slide:40,delay:.02});},
  bawl(k){k=k||1;BK.snd.bawl(k);A.hiss(.9*k,.05,'lowpass',420,{wobble:1,delay:.1});}};
// ---------------------------------------------------------------- blood thrown at the lens. Only where something throws it (the stick,
// the neck), two or three to a scene: big, cut off by the corners and edges of the frame, clear of the prompts and the bodies. Each its own
// shape (and a new one in every scene): a burst with spikes of touching drops round its rim, the wet edge warm orange-pink to the top
// left and violet-black to the lower right, and two or three runs of unequal length leaving its lower edge, thickening into a bead
BX.shape=(seed,r,dir)=>{const H=i=>BX.H(seed,i),pad=Math.ceil(r*2.6)+4,w=pad*2,h=pad*2,cx=pad,cy=pad,disc=[];
  const rx=r*(1.05+.3*H(1)),ry=r*(.78+.2*H(2));disc.push([0,0,rx,ry]);
  const nl=5+Math.floor(H(3)*3);for(let i=0;i<nl;i++){const a=H(10+i)*6.283,d=.55+.3*H(20+i),q=.28+.24*H(30+i);disc.push([Math.cos(a)*rx*d,Math.sin(a)*ry*d,r*q,r*q*.9]);}
  const ns=10+Math.floor(H(4)*6);for(let i=0;i<ns;i++){const a=i*6.283/ns+(H(40+i)-.5)*.5,fw=Math.max(0,Math.cos(a-dir)),len=r*(.18+.32*H(50+i))*(1+1.2*fw*fw);
    const ex=Math.cos(a),ey=Math.sin(a),rim=1/Math.hypot(ex/rx,ey/ry);let d=rim*.85,q=Math.min(3.4,r*(.16+.08*H(60+i)));while(d<rim+len&&q>.8){disc.push([ex*d,ey*d,q,q]);d+=q*1.15;q*=.84;}
    if(fw>.5&&H(65+i)<.45)disc.push([ex*(d+1.8),ey*(d+1.8),1.3,1.2]);}
  const m=new Uint8Array(w*h),inn=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&m[y*w+x]===1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)for(const [dx,dy,ax,ay] of disc)if(((x+.5-cx-dx)/ax)**2+((y+.5-cy-dy)/ay)**2<=1){m[y*w+x]=1;break;}
  const nr=2+Math.floor(H(6)*2),feet=[],xs=[-.5,.08,.52];if(nr===2)xs.splice(1+Math.floor(H(7)*2),1);
  for(const f of xs){const x=Math.round(cx+f*rx+(H(110+feet.length)-.5)*3);let yb=-1;for(let y=h-1;y>=0;y--)if(inn(x,y)&&inn(x+1,y)){yb=y;break;}if(yb>0)feet.push([x,yb]);}
  return {m,w,h,cx,cy,feet,inn};};
BX.mix=(a,b,t)=>{const p=s=>[1,3,5].map(i=>parseInt(s.substr(i,2),16)),A1=p(a),B1=p(b);return '#'+A1.map((v,i)=>Math.round(v+(B1[i]-v)*t).toString(16).padStart(2,'0')).join('');};
// violet-black, deep, body, sheen, the warm wet edge, the glint; and the same clotted
BX.CF=['#1e0616','#5a0e1c','#8a1622','#b82a2c','#f0866a','#ffc8b0'];BX.CC=['#100308','#2e0810','#46100e','#5e1a16','#8a4a3a','#a86a58'];
BX.col=c=>BX.CF.map((f,i)=>BX.mix(f,BX.CC[i],c));
BX.splatImg=(b,clot)=>M4.pre('bx_spl3_'+b.seed+'_'+b.r+'_'+clot,b.S.w,b.S.h,(K,g)=>{const S=b.S,C=clot?BX.CC:BX.CF,inn=S.inn;
  for(let y=0;y<S.h;y++)for(let x=0;x<S.w;x++){if(!inn(x,y))continue;const ul=!inn(x-1,y)||!inn(x,y-1)||!inn(x-1,y-1),lr=!inn(x+1,y)||!inn(x,y+1)||!inn(x+1,y+1);
    let c=C[2];if(ul&&!lr)c=C[4];else if(lr)c=C[0];else if(!inn(x-2,y-1)||!inn(x-1,y-2))c=C[3];else if(!inn(x+2,y+1)||!inn(x+1,y+2))c=C[1];K.px(x,y,1,1,c);}
  // the glint where the light catches the wet, up and left of its middle
  const gx=Math.round(S.cx-b.r*.4),gy=Math.round(S.cy-b.r*.35);if(inn(gx,gy)&&inn(gx+3,gy)){K.px(gx,gy,3,1,C[5]);K.px(gx,gy+1,1,1,C[4]);K.px(gx+3,gy+1,1,1,C[3]);}});
// the places on the glass: the top-left corner, the right edge, the left edge low; the spray of each turned into the frame
BX.SLOTS=[[2,-4,.9,24,.8],[0,84,.2,20,.9],[124,-8,1.6,20,.5]];
BX.mkSplat=(x,y,k,dir,r,rs)=>{k=k||1;BX.nHit++;const seed=(BX.nHit*7919+(Math.round(x)*13+Math.round(y)*7)*31)%9973+11;
  r=r||Math.round(4+k*2+BX.H(seed,8)*1.6);const S=BX.shape(seed,r,dir==null?BX.H(seed,9)*6.283:dir);
  const base=[.55,1.4,2.4].map(v=>v*r*(rs||1)*(.85+.3*BX.H(seed,120))),ord=[0,1,2].sort((a,b)=>BX.H(seed,130+a)-BX.H(seed,130+b));
  const runs=S.feet.map((f,i)=>({x:f[0],y:f[1]+1,L:Math.round(base[ord[i]]),sp:.7+.6*BX.H(seed,140+i)}));
  return {x:Math.round(x),y:Math.round(y),seed,r,S,runs,dir,rs};};
BX.hit=(x,y,k,dir)=>{if(!BX.on())return;if(BX.stepHits>=3)return;BX.stepHits++;
  const used=BX.lensL.map(b=>b.slot);let si=(x>160?[2,1,0]:[0,1,2]).find(i=>!used.includes(i));if(si==null){const o=BX.lensL.shift();si=o.slot;}
  const [sx,sy,sd,sr,rs]=BX.SLOTS[si],b=BX.mkSplat(sx,sy,k,sd,sr,rs);b.slot=si;b.t0=BX.now();BX.lensL.push(b);BX.snd.splat(k||1);};
// a new scene: the blood still on the glass, smeared to a new shape, its runs where they'd got to
BX.reshape=()=>{BX.lensL=BX.lensL.map(b=>{const n=BX.mkSplat(b.x,b.y,1,b.dir,b.r,b.rs);n.slot=b.slot;n.t0=b.t0;return n;});BX.lN=-1;};
// one splat, a seconds after it hit: its runs creep down, lit on the left and violet on the right, thickening into a bead at the foot;
// old blood darkens to brown-black as it clots
BX.drawSplat=(K,b,a,dy)=>{const g=K.g,c=Math.min(1,Math.max(0,(a-6)/18)),C=BX.col(c),ox=b.x-b.S.cx,oy=b.y-b.S.cy+(dy||0),ga=g.globalAlpha;g.globalAlpha=.94*ga;
  for(const r of b.runs){const n=Math.round(r.L*(1-Math.exp(-a*r.sp)));if(n<1)continue;const x0=ox+r.x,y0=oy+r.y,wob=i=>Math.round(Math.sin(i*.11+b.seed)*.6);
    for(let i=0;i<n;i++){const x=x0+wob(i),w=i<1?4:i<3?3:n-i<=3&&n>5?3:2,xl=x-(w>3?1:0);K.px(xl,y0+i,w,1,C[2]);K.px(xl,y0+i,1,1,C[3]);K.px(xl+w-1,y0+i,1,1,C[0]);}
    if(n>3){const fx=x0+wob(n)-1,fy=y0+n;K.px(fx,fy,4,3,C[2]);K.px(fx+1,fy+3,2,1,C[1]);K.px(fx,fy+2,1,1,C[1]);K.px(fx+3,fy,1,3,C[0]);K.px(fx+1,fy+3,2,1,C[0]);K.px(fx,fy,1,2,C[4]);K.px(fx+1,fy,1,1,C[5]);}}
  g.globalAlpha=.94*ga*(1-c);g.drawImage(BX.splatImg(b,0),ox,oy);if(c>0){g.globalAlpha=.94*ga*c;g.drawImage(BX.splatImg(b,1),ox,oy);}g.globalAlpha=ga;};
// the lens is drawn into its own layer, at most ten times a second, and that layer is laid over each frame (phones stay fast)
BX.lens=K=>{if(!BX.lensL.length)return;const now=BX.now();if(!BX.LC){BX.LC=document.createElement('canvas');BX.LC.width=320;BX.LC.height=180;}
  if(now-(BX.lT||0)>.1||BX.lN!==BX.lensL.length){BX.lT=now;BX.lN=BX.lensL.length;const g2=BX.LC.getContext('2d');g2.clearRect(0,0,320,180);g2.imageSmoothingEnabled=false;BX.lensPaint(caKit(g2,320,180),g2,now);}
  K.g.drawImage(BX.LC,0,0);};
BX.lensPaint=(K,g,now)=>{K.g=g;for(const b of BX.lensL)BX.drawSplat(K,b,now-b.t0,0);g.globalAlpha=1;};
// ---------------------------------------------------------------- your fists soaked (laid over the original hands, never instead):
// the same fist, its fingers and knuckles dyed through with blood, a few runs up the back, the cuff end clean
BX.coat=(kind,dir)=>{const src=kind==='palm'?M4S.palm(dir):M4S.hand(dir);return M4.pre('bx_coat3_'+kind+dir,src.width,src.height,(K,g,w,h)=>{g.drawImage(src,0,0);g.globalCompositeOperation='multiply';
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=BX.H(x*31+y*17+7,kind==='palm'?3:5),col=BX.H(x,11),edge=h*.22+Math.sin(x*1.7)*1.6+(col<.35?-h*.2:0);
    if(y>=edge||v<.08){g.fillStyle=v<.16?'#8a1c1c':v>.8?'#d86050':'#c4342e';g.fillRect(x,y,1,1);}}
  g.globalCompositeOperation='destination-in';g.drawImage(src,0,0);g.globalCompositeOperation='source-over';});};
{const _g=m4grip,wrap=a=>a-Math.PI*Math.round(a/Math.PI);m4grip=function(K,x,y,ang,o){const r=_g.apply(this,arguments);try{if(BX.drawing&&BX.bloody&&BX.on()){o=o||{};const g=K.g;
    if(o.kind==='palm'){const dir=Math.cos(ang)>0?'l':'r',base=dir==='l'?0:Math.PI;M4.rot(g,BX.coat('palm',dir),x+(dir==='l'?2:-2),y,wrap(ang-base),13,8);}
    else M4.rot(g,BX.coat('hand',(o.side||1)<0?'l':'r'),x,y,wrap(ang),11,9);}}catch(e){}return r;};}
// ---------------------------------------------------------------- flies: they come one by one and don't leave. Most settle on what's
// out and sit; a few circle it close. Each a dark body three pixels long with a pale wing
BX.flyDraw=(K,t,pts)=>{if(!pts||!pts.length)return;for(const f of BX.flies){const [px,py]=pts[f.p%pts.length];let x,y,fl=false;
    if(f.sit>0){x=Math.round(px+f.ox);y=Math.round(py+f.oy);}else{const a=t*f.sp+f.ph;x=Math.round(px+Math.cos(a)*f.rx+Math.sin(a*2.3)*2);y=Math.round(py-3+Math.sin(a)*f.ry);fl=true;}
    K.px(x,y,3,2,'#0a0608');K.px(x+2,y,1,1,'#3a2a2e');
    if(fl){const up=Math.floor(t*28+f.ph)%2;K.g.globalAlpha=.9;K.px(x+1,y-1-up,2,1,'#dfe6ee');K.g.globalAlpha=1;}else{K.px(x+1,y-1,2,1,'#dde6ee');K.px(x+3,y-1,1,1,'#aab6c4');}}};
BX.flyTick=(dt,pts)=>{if(!pts||!pts.length)return;BX.ft=(BX.ft||0)-dt;if(BX.ft<=0&&BX.flies.length<10){BX.ft=1.8;const n=BX.flies.length;BX.flies.push({p:n,rx:4+Math.random()*6,ry:2+Math.random()*3,sp:3+Math.random()*3,ph:Math.random()*6,sit:n%3?0:1.5,ox:(Math.random()-.5)*14,oy:(Math.random()-.5)*6,hop:2+Math.random()*3});}
  for(const f of BX.flies){f.hop-=dt;if(f.hop<=0){f.hop=1.5+Math.random()*3;if(f.sit>0){f.sit=0;}else{f.sit=1;f.ox=(Math.random()-.5)*14;f.oy=(Math.random()-.5)*6;}}}
  if(!BX.buzz&&typeof MS!=='undefined'&&MS.loop)BX.buzz=MS.loop('bandpass',230,7);if(BX.buzz)BX.buzz.set(Math.min(.05,BX.flies.length*.006),200+Math.sin(BX.now()*13)*40,7);};
// ---------------------------------------------------------------- steam off the opened body: thin pale wisps curling up and thinning out
BX.wisps=(K,L,t)=>{const g=K.g;for(let i=L.length-1;i>=0;i--){const p=L[i],a=t-p.t0;if(a>2.2){L.splice(i,1);continue;}const n=Math.round(6+a*10),y0=Math.round(p.y-a*14);
    for(let j=0;j<n;j++){const y=y0-j,x=Math.round(p.x+Math.sin(j*.32+a*2.4+p.ph)*(1+j*.12)),al=Math.max(0,.85-a*.32)*(1-j/(n+2));if(al<=.03)continue;g.globalAlpha=al;K.px(x,y,j<n*.7?2:1,1,'#f4f0ea');K.px(x+(j<n*.7?2:1),y,1,1,'#9a948e');}}
  g.globalAlpha=1;};
// ---------------------------------------------------------------- guts at Extreme: warm pink-red, each length swelling and pinching in
// turn with a wet crease at every pinch, lying in a film of fat and blood, not smooth tubes
BX.GX1=['#2c0a12','#5e1a22','#943432','#c25a4c','#e2846e','#f8b49a'];BX.GX2=['#24060e','#4c1220','#7c2430','#a83c44','#cc6662','#eea294'];
BX.FAT=['#4a1a18','#7a3a30','#a8604a','#c88a6a','#e0b088'];
BX.guts=(key,w,h,T,k,web,post)=>{const sh=[];if(web)for(const [cx,cy,rx,ry,wk] of web)if(k>=(wk||0))sh.push({t:'dome',cx,cy,rx,ry,top:2,z:-9,P:BX.FAT,base:2.2,gain:2,soft:1});
  T.forEach(([pts,r,P,a,b],i)=>{const f=Math.max(0,Math.min(1,(k-a)/(b-a)));if(f<=0)return;let L=0;for(let q=0;q+1<pts.length;q++)L+=Math.hypot(pts[q+1][0]-pts[q][0],pts[q+1][1]-pts[q][1]);
    sh.push({t:'tube',pts:BG71.cutPath(pts,f),r0:r+1.1,r1:r*.8+1,z:i*7-3,P:BG71.BL,base:2.6,gain:2.4,soft:1});
    // lengths of uneven size, each tapering from where it lies over the last to where the next lies over it: a wet crease at each join
    const Lf=L*f;let u=0,c=0;while(u<Lf-.5){const ln=Math.min(Lf-u,9+((c*2654435761+i*97)>>>0)%9),u0=u/L,u1=(u+ln)/L,R=r*(1-.18*u0)*(.92+.16*(((c*40503+i*17)>>>0)%7)/6),z=i*7+c*.8;
      sh.push({t:'tube',pts:BG71.subPath(pts,u0,u1),r0:R,r1:R*.7,z,z1:z+.25,P,base:3,gain:3.4,glint:'#ffe6da',gl:.84});u+=ln;c++;}});
  return BG71.spr('bx_'+key+'_'+k,w,h,sh,post,'#16040e');};
// the hen's guts drawn out of her (the same size and hold as the Full ones, so they hang from the vent where those do)
BX.HG=[[[[40,4],[36,10],[30,14],[22,13],[14,16],[8,22],[12,28],[22,29],[31,26],[38,28],[46,30],[54,27],[58,21],[52,18]],3.7,BX.GX1,0,1],
  [[[38,7],[44,12],[42,19],[35,18]],3,BX.GX2,0,1],[[[18,18],[25,21],[21,25],[14,23]],2.8,BX.GX2,0,1]];
BX.henGuts=gib=>BX.guts('hguts3'+(gib?'g':''),64,35,BX.HG,1,[[28,21,18,8]],(K,g)=>{const B=BG71.BL;for(const [x,y,w] of [[29,17,4],[6,30,5],[46,33,4]]){K.px(x,y,w,1,B[3]);K.px(x,y+1,w-1,1,B[1]);}
  // still in the heap until you draw them out: the liver in its two lobes, the heart, the gizzard with its sheen
  if(gib){g.drawImage(BS.liverS(),4,6);g.drawImage(BS.heartS(),28,1);g.drawImage(BS.giz(),46,18);K.px(20,14,3,1,B[3]);K.px(36,9,2,2,B[3]);}});
// her own blood on her: your hand-prints on her white skin, dragged; and a run down from the vent to the board
BX.print=(K,x,y,a,P,v)=>{const g=K.g;g.save();g.translate(x,y);g.rotate(a);g.globalAlpha=.9;
  // each print its own: how many fingers took, how long they dragged, the heel of the hand smeared off one way
  const nf=v===1?3:v===2?2:4,fl=[[7,9,9,6],[5,8,6],[10,7]][v||0],sp=v===2?4:3;
  for(let i=0;i<nf;i++){const h=fl[i],fx=-6+i*sp+(v===1&&i===2?1:0);K.px(fx,-h,2,h,P[3]);K.px(fx,-h,2,1,P[2]);K.px(fx,-h+1,1,h-3,P[4]);if(v===0&&i===3)K.px(fx+2,-h+2,1,3,P[3]);}
  if(v!==2){K.px(-7,0,11+(v?1:0),4,P[3]);K.px(-6,4,8,2,P[3]);K.px(-7,1,1,3,P[2]);K.px(-5,0,5,1,P[4]);}else{K.px(-6,0,7,3,P[3]);K.px(-5,3,4,1,P[2]);}
  g.globalAlpha=.5;if(v===1){K.px(5,1,9,3,P[3]);K.px(13,2,4,1,P[2]);}else if(v===2){K.px(-4,4,4,9,P[3]);K.px(-3,13,2,3,P[2]);}else{K.px(-5,6,8,3,P[3]);K.px(-4,9,5,3,P[3]);}g.restore();};
// the cow's loops inside her, the same frames as the Full ones in the warm colours
BX.CL=BG71.CLOOP.map(([p,r,P,a,b],i)=>[p,r*1.05,i%2?BX.GX2:BX.GX1,a,b]);
BX.cowLoops=k=>BX.guts('cloops2',32,40,BX.CL,k);
// what spilled out of her: a rope out of the bottom of the cavity, the heap in the tub, and over its near lip down to the boards,
// coiled there in a slick. Drawn in two parts so the tub's front goes between the heap and what's over the lip (screen coordinates)
BX.SO=[50,100];
BX.HEAP=[[[[162,124],[159,131],[161,138],[156,145]],3.4,BX.GX2,0,.6],[[[127,149],[131,141],[140,138],[148,142],[145,149],[136,151]],4.6,BX.GX1,.2,1],
  [[[150,150],[156,142],[166,139],[176,142],[184,147],[194,150]],4.2,BX.GX2,.3,1.1],[[[158,150],[167,146],[176,150]],3.8,BX.GX1,.5,1.2],
  [[[130,145],[137,135],[149,131],[159,135],[165,143]],4.3,BX.GX1,.6,1.4],[[[171,147],[179,139],[189,140],[194,147]],3.9,BX.GX2,.7,1.5]];
BX.OVER=[[[[134,146],[124,145],[117,148],[113,154],[112,160],[109,165],[101,169],[91,170],[83,167],[79,161],[85,157],[94,159],[97,164]],4.6,BX.GX1,.9,2.2],
  [[[127,141],[119,140],[112,145],[107,151],[105,157],[99,161],[90,161]],4.1,BX.GX2,1.1,2.3],
  [[[118,150],[122,156],[119,161]],3.4,BX.GX2,1.3,2],[[[95,166],[87,171],[76,171],[68,167],[66,161],[71,157]],4,BX.GX2,1.8,3],
  [[[101,167],[109,171],[117,172],[124,169]],4,BX.GX1,2.1,3]];
BX.rel=T=>T.map(([p,r,P,a,b])=>[p.map(([x,y])=>[x-BX.SO[0],y-BX.SO[1]]),r,P,a,b]);
BX.heap=k=>BX.guts('heap3',160,62,BX.rel(BX.HEAP),k,[[160-BX.SO[0],144-BX.SO[1],28,6,1.2]]);
BX.lip=k=>BX.guts('over3',160,80,BX.rel(BX.OVER),k,[[86-BX.SO[0],165-BX.SO[1],18,5,2.6],[112-BX.SO[0],153-BX.SO[1],6,8,1.6]]);
BX.KS=[0,.4,.8,1.2,1.6,2,2.5,3];BX.kq=k=>{let q=0;for(const v of BX.KS)if(k>=v)q=v;return q;};
// a slick: the blood and the wet off the guts spread on the boards, catching the light in a few long glints
BX.slick=(K,x,y,q,rx,seed)=>{const im=BK.flat(seed,q,rx,true);K.g.drawImage(im,Math.round(x-im.width/2),Math.round(y-im.height/2));
  const s=rx*q/10;if(s<6)return;for(let i=0;i<3;i++){const gx=Math.round(x-s*.5+BX.H(seed,i)*s),gy=Math.round(y-1+(BX.H(seed,i+5)-.5)*s*.3),gw=2+Math.round(BX.H(seed,i+9)*4);K.px(gx,gy,gw,1,'#e8705a');K.px(gx+1,gy,1,1,'#ffc8b0');}};
// where each step's open body is: the flies settle on it, the steam comes off it
BX.SPOT={hnPluck:[[160,70]],hnRinse:[[160,110]],cwHead:[[118,120]],cwSkin:[[200,110]],cwSplit:[[161,100]],cwWash:[[66,90]],trace:[[150,100]],scale:[[160,100]]};
BX.spots=k=>{if(k==='hnGut'){try{const f=BH.find(),vx=BH.X+f.vent[0],vy=BH.Y+f.vent[1];return [[vx-22,vy+14],[vx-4,vy+6],[vx-32,vy+22]];}catch(e){return [[150,120]];}}
  if(k==='cwGut')return BS.after().rollAt?[[90,166],[150,144],[161,110]]:[[161,100]];return BX.SPOT[k];};
// ---------------------------------------------------------------- every step, at Extreme
BX.overlay=(k,K,t,o)=>{const sp=BX.spots(k),g=K.g;
  // the guts out of her: down out of the cavity, heaped in the tub, over its lip, coiled on the boards in a slick
  if(k==='cwGut'&&BS.after().rollAt){const a=BX.now()-BS.after().rollAt;if(a>.6){const kk=BX.kq(Math.min(3,(a-.6)*2.2)),[tx,ty]=BC.TUB,[ox,oy]=BX.SO;
      BX.slick(K,92,171,Math.min(10,2+Math.round(a*2)),30,97);
      g.drawImage(BS.paunch2(),134,121);g.drawImage(BX.heap(kk),ox,oy);
      const T=BS.tub();g.drawImage(T,0,6,T.width,T.height-6,tx,ty+6,T.width,T.height-6);
      g.drawImage(BX.lip(kk),ox,oy);}}
  if(k==='hnGut'){try{const f=BH.find(),vx=BH.X+f.vent[0],vy=BH.Y+f.vent[1],P=BG71.BL;BX.print(K,126,106,.25,P,0);BX.print(K,196,114,-.5,P,1);BX.print(K,186,80,.2,P,2);
      K.px(vx-1,vy+3,2,9,P[3]);K.px(vx-1,vy+3,1,9,P[4]);K.px(vx-2,vy+12,4,2,P[3]);K.px(vx-1,vy+14,2,1,P[1]);
      if(BS.after().henOut){const a=BX.now()-BS.after().henOut;if(a>.3)BX.slick(K,vx-22,vy+26,Math.min(10,3+Math.round(a*2)),22,98);}}catch(e){}}
  if((k==='hnGut'||k==='cwGut'||k==='cwSkin')&&sp)BX.wisps(K,BX.steam,BX.now());
  if(sp&&BX.flies.length)BX.flyDraw(K,t,sp);
  BX.lens(K);};
BX.tick=(k,dt,K,o)=>{const sp=BX.spots(k);if(sp&&BX.bloody)BX.flyTick(dt,sp);
  if((k==='hnGut'||k==='cwGut'||k==='cwSkin')&&sp){BX.sT=(BX.sT||0)-dt;if(BX.sT<=0){BX.sT=.22;const p=sp[Math.floor(Math.random()*sp.length)];BX.steam.push({x:p[0]+(Math.random()-.5)*16,y:p[1]-2,t0:BX.now(),ph:Math.random()*6});}
    // still warm: now and then the body twitches under your hands
    BX.twT=(BX.twT||0)-dt;if(BX.twT<=0){BX.twT=1.6+Math.random()*2.2;K.shk=Math.max(K.shk||0,.04);BX.snd.squelch();}}};
// ---------------------------------------------------------------- the guts in their warm colours wherever they're drawn at Extreme
{const _hg=BS.hguts;BS.hguts=()=>BX.on()?BX.henGuts(!BS.after().gibOut):_hg();const _cl=BG71.cowLoops;BG71.cowLoops=k=>BX.on()?BX.cowLoops(k):_cl(k);}
// ---------------------------------------------------------------- the steps wear it all
BX.STEPS=['bgPin','bgChop','bgStun','bgThroat','hnScald','hnPluck','hnGut','hnRinse','cwHead','cwSkin','cwGut','cwSplit','cwWash'];
BX.wrap=(k,o,K)=>{if(!o||o._bx)return o;o._bx=1;BX.stepHits=0;if(BX.lensL.length&&k!=='bgThroat')BX.reshape();const d0=o.draw,u0=o.update;
  if(k==='cwGut'&&BX.on())BK.warm([()=>{for(const v of BX.KS){BX.heap(v);BX.lip(v);}BX.cowLoops(5);BX.cowLoops(6);}]);if(k==='hnGut'&&BX.on())BK.warm([()=>{BX.henGuts(1);BX.henGuts(0);}]);
  o.update=function(dt,I){BX.I=I;const r=u0.apply(this,arguments);try{if(BX.on())BX.tick(k,dt,K,o);}catch(e){}return r;};
  o.draw=function(t){BX.drawing=true;try{d0.apply(this,arguments);}finally{BX.drawing=false;}try{if(BX.on())BX.overlay(k,K,t,o);}catch(e){}};return o;};
for(const k of BX.STEPS){const f=S4[k];if(!f)continue;S4[k]=(sp,K)=>{if(k==='bgPin'||k==='bgStun')BX.reset();return BX.wrap(k,f(sp,K),K);};}
// the jointing and the weighing after, when they belong to butchering
{const _tr=S4.trace;S4.trace=(sp,K)=>{const o=_tr(sp,K);return sp&&(sp.surface==='hen'||sp.surface==='beef')?BX.wrap('trace',o,K):o;};}
// the tugs at Extreme: every tear is wetter and louder
{const _tu=BS.tugUp;BS.tugUp=(T,dt,I)=>{const r=_tu(T,dt,I);if(BX.on()){if(r==='ok')BX.snd.wet(.8);else if(r==='tear'){BX.snd.wet(1.4);BX.snd.gurgle(.6);}}return r;};}
