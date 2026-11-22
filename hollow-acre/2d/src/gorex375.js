/* ================= (t375) Extreme gore, wave 2: the story's adult remains and the story's blood, over gorex374.js. Full and Toned are
   exactly as they were (except Ida's jars, below, at every level). Only while SET7.gore is 'extreme' (window.GORE_EXTREME):
   - Silas's grave: the older you (grey-haired, your clothes, full grown): the skull with flesh still on it in rags, one eye shrunk in
     its socket and maggots in the other, the scalp peeled back, the neck torn to the bone, the chest opened and hollowed out with the
     maggots in the bottom of it, the guts pulled out over his side onto the floor of the grave, the hands gnawed to the finger bones,
     the soil under him black. In the world and up close (tools/gore6.py), and up close the maggots move and the flies are thick.
   - (not released yet, behind window.GX2_DROWNED) The drowned of Old Wickham: the two grown men in top hats only: a scalp split and peeling, a neck eaten open, eels out of their
     collars, the hands swollen grey-green with the skin coming off like a glove. (The small figure in green could be a child: nothing
     is drawn on or near it, or on the people standing beside it.)
   - The story's red flash: on the beats with no child in them, blood comes over the top of the screen and runs down in thick runs.
   - The deer in the road on the first night: a burst of blood and meat where the car hits it, a long smear where it tumbles, its
     belly burst open where it comes to rest, the blood spreading under it.
   Not done, on purpose: Agnes's drain (the oldest cuts on her arm were "cut by a child", and her cutting stays as the story tells it),
   and everything in GORE_CHILD (gorex374.js).
   Ida's jars, at EVERY level (hard limit: they are the drawn children's): no eyes. The jars hold milk teeth and locks of hair, tied
   off with thread; the words say so too. ================= */
const GX2_SPR={g6_roaddeer:{src:'spr/lpc/obj/g6_roaddeer.png',fw:72,fh:40,ax:36,ay:30,foot:[0,0,0,0]},g6_yourgrave_ov:{src:'spr/lpc/obj/g6_yourgrave_ov.png',fw:168,fh:104,ax:0,ay:0,foot:[0,0,0,0]},g6_drowned_ov:{src:'spr/lpc/obj/g6_drowned_ov.png',fw:160,fh:104,ax:0,ay:0,foot:[0,0,0,0]}};
const GX2={loaded:false,yg:null,ygSpr:null,dr:null,beat:null,intro:null};
// the drowned are not released yet (their gore still reads as things they carry): a dev page sets window.GX2_DROWNED to see them
const gx2Drowned=()=>!!window.GX2_DROWNED;
function gx2Load(){if(GX2.loaded)return;GX2.loaded=true;const L=Object.assign({},GX2_SPR);if(!gx2Drowned())delete L.g6_drowned_ov;Object.assign(SPR,L);
  for(const m of Object.values(L)){if(IMG[m.src])continue;const im=new Image();im.onload=()=>{IMG[m.src]=im;};im.src=(typeof PACK!=='undefined'&&PACK[m.src])||(m.src+'?b='+BUILD_ID);}}   // loose files, Extreme only
if(typeof gxOn==='function'&&gxOn())gx2Load();
if(typeof set7Apply==='function'){const _a=set7Apply;set7Apply=function(k){const r=_a.apply(this,arguments);if((!k||k==='gore')&&gxOn())gx2Load();return r;};}
const gx2Img=n=>{const m=GX2_SPR[n],im=m&&IMG[m.src];return im&&im.width?im:null;};
const gx2Clone=(c,ov)=>{const o=document.createElement('canvas');o.width=c.width;o.height=c.height;const g=o.getContext('2d');g.drawImage(c,0,0);if(ov)g.drawImage(ov,0,0);return o;};

// ---------------------------------------------------------------- Silas's grave
// the picture with the Extreme drawn on, built once (the grave's own cut from sights298 with the overlay laid on it)
function gx2YgCut(){if(GX2.yg)return GX2.yg;const ov=gx2Img('g6_yourgrave_ov');if(!ov||typeof s98GraveCut!=='function')return null;const cut=s98GraveCut('yourgrave');if(!cut)return null;return GX2.yg=gx2Clone(cut,ov);}
function gx2YgSpr(){if(GX2.ygSpr)return GX2.ygSpr;const cut=gx2YgCut(),d=typeof S98_GRAVE!=='undefined'&&S98_GRAVE.yourgrave;if(!cut||!d||typeof s98Shrink!=='function')return null;
  const c=s98Shrink(cut,d.S,{}),[px,py,pw,ph]=d.pit,g=c.getContext('2d'),x0=Math.round(px/d.S),y0=Math.round(py/d.S),x1=Math.round((px+pw)/d.S),y1=Math.round((py+ph*.3)/d.S);
  const im=g.getImageData(x0,y0,x1-x0,y1-y0);for(let i=0;i<im.data.length;i+=4){im.data[i]*=.72;im.data[i+1]*=.7;im.data[i+2]*=.74;}g.putImageData(im,x0,y0);   // the far wall in shadow, as the Full one
  // the chest at the world's size, drawn by hand as the same D-shaped tear (shrunk from the close-up it was a ring: a target)
  const GXC={o:'#160c10',k:'#0a0406',r:'#ca5553',R:'#ec967c',b:'#cebdab',B:'#977f79',s:'#423430',S:'#5c4a42',g:'#cc6254',G:'#ac423c'};
  const GXP=['.soooooos..','soKkrkkrkos','sokRrkRrkos','sorkkRkkro.','sokkrkkkko.','sBbbBbbBbg.','.sSSsSSgGg.','.......Gg..'];
  GXP.forEach((row,j)=>{for(let i=0;i<row.length;i++){const ch=row[i]==='K'?'k':row[i];if(ch==='.')continue;g.fillStyle=GXC[ch];g.fillRect(21+i,22+j,1,1);}});
  return GX2.ygSpr=s98Spr('grave_yourgrave_x',c,d.ax/d.S,d.ay/d.S);}
if(typeof SGT_ART!=='undefined'&&SGT_ART.yourgrave){const _y=SGT_ART.yourgrave;SGT_ART.yourgrave=function(){
  if(gxOn())try{const o=s98Beat('yourgrave'),cut=gx2YgCut(),d=S98_GRAVE.yourgrave;if(o&&cut){const im=s98OnGround('s98gx_yourgrave_'+Math.round(o.x*10)+'_'+Math.round(o.z*10),cut,{x:o.x,z:o.z},d.S,d.ax,d.ay,[o]);if(im)return im;}}catch(e){}
  return _y.apply(this,arguments);};}
// up close at Extreme the maggots in the chest, the grave's floor and the eye socket move, and the flies are thick
const GX2_YGMAG=[[50.6,63.4,3.2,1.4],[55.4,64.4,2.2,1.1],[66.2,80.6,2.6,1.1],[33,59.5,1.3,1]];
if(typeof SGT_BEATS!=='undefined'&&SGT_BEATS.yourgrave){const B=SGT_BEATS.yourgrave,d=Object.getOwnPropertyDescriptor(B,'fx'),v=d&&!d.get?d.value:{flies:2};
  Object.defineProperty(B,'fx',{get(){return gxOn()&&gx2YgCut()?{flies:7,g6mag:GX2_YGMAG}:v;},configurable:true});}

// ---------------------------------------------------------------- the drowned
if(typeof SGT_ART!=='undefined'&&SGT_ART.drowned){const _d=SGT_ART.drowned;SGT_ART.drowned=function(){const c=_d.apply(this,arguments);if(!gxOn()||!c||!gx2Drowned())return c;
  if(GX2.dr&&GX2.drSrc===c)return GX2.dr;const ov=gx2Img('g6_drowned_ov');if(!ov||c.width!==ov.width||c.height!==ov.height)return c;GX2.drSrc=c;return GX2.dr=gx2Clone(c,ov);};}

// ---------------------------------------------------------------- the close-up moves (maggots)
if(typeof ruFrame==='function'){const _rf=ruFrame;ruFrame=function(){_rf.apply(this,arguments);const spec=RU.spec;if(!spec||spec.kind!=='sight'||!spec._k||!spec.fx||!spec.fx.g6mag||typeof gxMaggots!=='function')return;
  const g=RU.g,t=RU.t,k=spec._k;g.save();g.translate(spec._x,spec._y);for(const [i,m] of spec.fx.g6mag.entries())gxMaggots(g,m[0],m[1],m[2]*.95,m[3]*.95,k,t,'yg'+i,1);g.restore();};}

// ---------------------------------------------------------------- the world: the grave's sprite follows the setting; the pictures load when Extreme is on
{const _u=update;update=function(dt){_u.apply(this,arguments);try{gx2Tick();}catch(e){}};}
function gx2Tick(){const x=gxOn();if(x)gx2Load();
  if(typeof SGW!=='undefined'&&SGW.objs&&SGW.objs.yourgrave){const o=SGW.objs.yourgrave[0];if(o&&o.spr&&o.spr.startsWith('s98_grave_yourgrave')){const w=x&&gx2YgSpr()?'s98_grave_yourgrave_x':'s98_grave_yourgrave';if(o.spr!==w&&SPR[w])o.spr=w;}}
  gx2LoreFix();}

// ---------------------------------------------------------------- the story's red flash, at Extreme: blood over the top of the screen, running down
{const _sp=sgPlay;sgPlay=function(b){GX2.beat=b&&b.id;return _sp.apply(this,arguments);};}
{const _fx=sgFx;sgFx=function(kind,hit){const r=_fx.apply(this,arguments);if(kind==='blood'&&gxOn()&&!goreChildBeat(GX2.beat))try{gx2Pour();}catch(e){}return r;};}
function gx2Pour(){let cv=$('gxSgPour');if(!cv){cv=document.createElement('canvas');cv.id='gxSgPour';cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:61;display:none';document.body.appendChild(cv);}
  const W=160,Hh=Math.max(90,Math.round(160*innerHeight/Math.max(1,innerWidth)));if(cv.width!==W)cv.width=W;if(cv.height!==Hh)cv.height=Hh;const g=cv.getContext('2d'),runs=[],lip=[];
  for(let x=0;x<W;){const w=2+((Math.random()*3)|0),deep=Math.random()<.45;runs.push({x,w,sp:deep?26+Math.random()*30:8+Math.random()*14,d:Math.random()*.5,max:deep?Hh*(.5+Math.random()*.55):Hh*(.12+Math.random()*.25)});x+=w+1+((Math.random()*6)|0);}
  for(let x=0;x<W;x++)lip.push(Math.round(3+Math.sin(x*.21+Math.random()*.4)*1.4+Math.sin(x*.07)*1.6));   // the edge of what comes over the top
  cv.style.opacity='1';cv.style.transition='';cv.style.display='block';cancelAnimationFrame(GX2.pourRaf);clearTimeout(GX2.pourT);const t0=performance.now();let faded=false;
  const step=()=>{const t=(performance.now()-t0)/1000;g.clearRect(0,0,W,Hh);const top=Math.min(1,t/.35);
    g.fillStyle='#2a0306';for(let x=0;x<W;x++)g.fillRect(x,0,1,Math.round(lip[x]*top));g.fillStyle='#5a0a10';for(let x=0;x<W;x+=1)if(lip[x]>3)g.fillRect(x,Math.round(lip[x]*top)-1,1,1);
    for(const r of runs){const L=Math.min(r.max,Math.max(0,(t-r.d)*r.sp));if(L<=0)continue;const yy=Math.round(L);
      g.fillStyle='#3a0408';g.fillRect(r.x,0,r.w,yy);g.fillStyle='#6a0c12';g.fillRect(r.x,0,1,Math.round(yy*.85));   // lit on its left, as everything is
      g.fillStyle='#3a0408';g.fillRect(r.x-(r.w>2?1:0),yy,r.w+(r.w>2?1:0),2);g.fillStyle='#8a2a2a';g.fillRect(r.x,yy,1,1);}   // the bead at its foot, with its wet glint
    if(t>2.2&&!faded){faded=true;cv.style.transition='opacity 1.1s ease-in';cv.style.opacity='0';}
    if(t<3.4)GX2.pourRaf=requestAnimationFrame(step);else{cv.style.display='none';}};step();}

// ---------------------------------------------------------------- the deer in the road on the first night
const GX2_INTRO_COL=['#7a1418','#4c0a10','#c05a58','#a8484c','#e0b090','#2a0306'];
function gx2Spray(){if(GX2.spray)return GX2.spray;const W=84,Hh=30,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const g=cv.getContext('2d');const cx=10,cy=15;
  const P=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
  for(let y=-4;y<=4;y++)for(let x=-8;x<=8;x++){const d=(x/8)**2+(y/4)**2+.18*Math.sin(Math.atan2(y,x)*3);if(d<1)P(cx+x,cy+y,1,1,d>.7?'#2a0306':d>.3?'#4c0a10':'#5e0c14');}   // where it went under the wheels
  for(const [a,L,w0] of [[-.34,46,3],[-.12,62,3.4],[.06,70,3],[.22,52,2.6],[.4,36,2.2],[-.52,28,2]]){   // streams thrown forward, each one joined run, thinning, a bead at the end
    for(let s=0;s<L;s++){const f=s/L,x=cx+Math.cos(a)*(6+s),y=cy+Math.sin(a)*(3+s*.42)+Math.sin(s*.3+a*9)*.6,w=Math.max(1,Math.round(w0*(1-f*.8)));
      if(f>.55&&((s*7+L)%11)<3)continue;P(x,y-(w>>1),1,w,'#4c0a10');if(w>2)P(x,y-(w>>1),1,1,'#7a1418');}
    const ex=cx+Math.cos(a)*(6+L),ey=cy+Math.sin(a)*(3+L*.42);P(ex,ey-1,2,2,'#3a0408');P(ex,ey-1,1,1,'#7a1418');}
  for(const [x,y] of [[30,12],[47,17],[58,14]]){P(x-1,y-1,4,3,'#2a0306');P(x,y-1,2,2,'#c05a58');P(x,y-1,1,1,'#e0b090');P(x+2,y,1,1,'#7a1418');}   // pieces of it
  return GX2.spray=cv;}
function gx2Guts(){if(GX2.guts)return GX2.guts;const cv=document.createElement('canvas');cv.width=18;cv.height=10;const g=cv.getContext('2d');const P=(x,y,c)=>{g.fillStyle=c;g.fillRect(x,y,1,1);};
  const L=[[2,4],[3,3],[4,3],[5,3],[6,4],[7,5],[8,5],[9,4],[10,4],[11,5],[12,6],[13,6],[14,5],[15,5],[11,7],[10,8],[9,8],[8,7],[7,7],[6,7],[5,6]];   // two loops of gut, creased where they cross
  for(const [x,y] of L){P(x,y+1,'#4c0a10');P(x,y-1,'#2a0306');}for(const [i,[x,y]] of L.entries())P(x,y,i%4===0?'#7a2a34':i%4===1?'#e09a8c':'#c05a58');
  return GX2.guts=cv;}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);if(!gxOn()||typeof cine==='undefined'||!cine||!cine._st||!S.introDrive)return;const st=cine._st,d=st.deer;
  let I=GX2.intro;if(!I||I.st!==st)I=GX2.intro={st,trail:[],hit:false,rest:null};
  if(st.blood&&!I.hit){I.hit=true;const b=st.blood;I.ox=b.x-1;I.oz=b.z-4;I.tc=document.createElement('canvas');I.tc.width=48*PPM;I.tc.height=8*PPM;if(d&&SPR.g6_roaddeer){d.vx=Math.max(d.vx,(st.car&&st.car.v||15)*2);d.vz=Math.min(d.vz,.45);}   // thrown ahead, into the headlights
    for(let i=0;i<26;i++){const a=(Math.random()-.5)*1.4,s=4+Math.random()*7;st.deb.push({x:b.x,z:b.z,y:.4+Math.random()*.5,vx:Math.cos(a)*s+(st.car?st.car.v*.3:0),vz:Math.sin(a)*s*.6,vy:2+Math.random()*3.4,l:1.2+Math.random(),c:GX2_INTRO_COL[i%GX2_INTRO_COL.length],sz:i%3?2:3});}}
  if(I.hit&&I.t0==null)I.t0=t;
  if(d&&d.hit&&SPR.g6_roaddeer&&st.car&&!st.crashed&&t-I.t0<1.7&&d.x<st.car.x+3.7){d.x=st.car.x+3.7;d.vx=Math.max(d.vx,st.car.v||15);}   // caught on the bumper and pushed along in the headlights, then let go
  if(d&&d.hit){const sp=Math.hypot(d.vx,d.vz),last=I.trail[I.trail.length-1];
    if(d.y<.18&&sp>.25&&(!last||Math.hypot(last.x-d.x,last.z-d.z)>.07)&&I.trail.length<400){const p={x:d.x,z:d.z+.06,w:Math.min(3,1+sp*.25)};I.trail.push(p);if(last)gx2TrailSeg(I,last,p);}
    if(!I.rest&&d.y===0&&sp<.25&&I.trail.length>3)I.rest={x:d.x,z:d.z,t:t};}
  if(!I.hit)return;const b=st.blood;
  D.push({z:-1e6+1,mind:1,draw(){const sp=gx2Spray();ctx2.drawImage(sp,Math.round(sx(b.x))-10,Math.round(sz(b.z))-15);
    if(I.tc)ctx2.drawImage(I.tc,sx(I.ox),sz(I.oz));   // the smear, drawn once into its own canvas as it is made (phones)
    if(I.rest&&typeof gxPool==='function'){const age=t-I.rest.t,rx=age<1.2?6:age<3?9:12,o=gxPool(311,rx,0);ctx2.drawImage(o.cv,Math.round(sx(I.rest.x))-o.ax,Math.round(sz(I.rest.z))-o.ay+2);}}});
  if(I.rest&&!SPR.g6_roaddeer)D.push({z:I.rest.z+.02,mind:1,draw(){ctx2.drawImage(gx2Guts(),Math.round(sx(I.rest.x))-4,Math.round(sz(I.rest.z))-7);}});
  // the car carries it with it: the hood and the windscreen splashed, streaked back by the wind (only while she drives straight)
  if(!st.crashed&&st.car&&Math.abs(st.car.yaw||0)<.11)D.push({z:st.car.z+.21,mind:1,draw(){ctx2.drawImage(gx2Hood(),Math.round(sx(st.car.x))+4,Math.round(sz(st.car.z)+(st.jolt||0)+Math.round(st.bob||0))-56);}});};}
// one stretch of the drag smear, into the road canvas: unbroken, a little uneven, streaked in lanes along its length
function gx2TrailSeg(I,a,p){if(!I.tc)return;const g=I.tc.getContext('2d'),o=x=>Math.round(x*PPM),X0=o(a.x)-o(I.ox),Y0=o(a.z)-o(I.oz),X1=o(p.x)-o(I.ox),Y1=o(p.z)-o(I.oz),n=Math.max(1,Math.ceil(Math.hypot(X1-X0,Y1-Y0)));
  // (round 3) wide and splashed where it was first dragged, tapering as it slid, broken into patches where it skipped
  for(let k=0;k<n;k++){const f=k/n,X=Math.round(X0+(X1-X0)*f),Y=Math.round(Y0+(Y1-Y0)*f),L=(I.len=(I.len||0)+1),hh=gxH('tr'+(X>>2)+'_'+(Y>>3));
    const w=Math.max(1,Math.round((L<36?4.6-L/18:2.6)+Math.sin(L*.045)*.9+Math.sin(L*.13)*.4)),e1=gxH('e'+(L>>3))<.35,e2=gxH('f'+(L>>3))<.35;   // ragged edges, in runs
    g.fillStyle='#2a0306';g.fillRect(X,Y-w-(e1?1:0),1,w*2+1+(e1?1:0)+(e2?1:0));for(let r=-w+1;r<w;r++){const h=gxH('ln'+((L>>3)*7+r*31))*10|0;g.fillStyle=h<3?'#3a0408':h>7?'#7a1418':'#5e0c14';g.fillRect(X,Y+r,1,1);}}}
function gx2Hood(){if(GX2.hood)return GX2.hood;const cv=document.createElement('canvas');cv.width=78;cv.height=60;const g=cv.getContext('2d');
  // drawn in the car's own frame pixels (it faces right: the hood, its lit front edge at x 168, the grey bumper x 169-172), then the
  // canvas is that frame from (100,56): the front stove in where it hit, the blood thrown from that point (critic r1: streaks along
  // the hood read as a speed trail)
  const P=(fx,fy,w,h,c)=>{g.fillStyle=c;g.fillRect(fx-100,fy-56,w,h);};
  for(let y=84;y<=97;y++){const k=Math.round(2.2*Math.sin((y-84)/13*Math.PI));if(!k)continue;P(169-k,y,k,1,'#9a9aa2');P(173-k,y,k,1,'#0e0a0c');P(168-k,y,1,1,'#4e1a1c');}   // the bumper bent in
  for(const [x0,y0] of [[166,80],[166,92]]){for(let i=0;i<6;i++){P(x0-i,y0+i,1,1,'#4e1a1c');P(x0-i-1,y0+i,1,1,'#b0504a');}}   // folds in the metal behind it
  for(let y=-5;y<=5;y++)for(let x=-5;x<=3;x++){const d=(x/5)**2+(y/5.5)**2+.2*Math.sin(Math.atan2(y,x)*3+.5);if(d<1)P(167+x,99+y,1,1,d>.7?'#2a0306':(x+y<-3?'#7a1418':'#4c0a10'));}   // where it hit: the grille, between the lamps
  for(const [x,y0,L] of [[169,86,8],[171,88,6]]){for(let i=0;i<L;i++)P(x,y0+i,1,1,i%3?'#7a1418':'#a02a24');}P(170,86,1,1,'#4c0a10');   // blood run down the lamp glass, the light still showing between
  for(const [x,L,w] of [[165,7,2],[168,11,2],[170,5,1]]){for(let i=0;i<L;i++)P(x,104+i,w,1,i<L-1?'#4c0a10':'#2a0306');P(x,104+L,w+1,1,'#3a0408');}   // down the bumper in runs of different lengths, a bead at each foot
  for(const [x,y,w,h] of [[158,83,3,2],[159,85,2,1],[153,88,2,2],[148,84,2,1],[155,94,2,2],[150,97,1,2]]){P(x,y,w,h,'#4c0a10');P(x,y,1,1,'#7a1418');}   // thrown back over the hood from that point, gathered
  P(164,96,2,1,'#8a6a44');P(165,97,1,1,'#6a4a30');P(164,101,2,1,'#c05a58');P(164,101,1,1,'#e0a090');   // fur and meat in the dent
  P(166,86,1,1,'#e06050');P(161,84,1,1,'#e06050');   // wet
  return GX2.hood=cv;}

// ---------------------------------------------------------------- Ida's jars, at EVERY level: milk teeth and locks of hair, never eyes
const GX2_JARHAIR=[[36,14,20,30,['#5a3c1c','#8a6232','#b88a48','#dcb470']],[90,15,18,29,['#241a16','#3e2c22','#5c4232','#7a5c44']],[16,64,18,28,['#4a1e10','#7a3418','#a44e26','#c87444']]];
function gx2JarsFix(c){if(!c||c._gx2||!c.getContext)return c;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const glint=new Set(['184,192,200','200,208,216','255,255,255','168,176,184','154,160,168']);
  for(const [x,y,w,h,R] of GX2_JARHAIR){const im=g.getImageData(x,y,w,h),dd=im.data;
    for(let yy=12;yy<h;yy++)for(let xx=0;xx<w;xx++){if(xx===1)continue;const i=(yy*w+xx)*4,gl=(xx>=w-4||(xx<=4&&yy===h-5))&&glint.has(dd[i]+','+dd[i+1]+','+dd[i+2]);if(gl)continue;dd[i]=0x3a;dd[i+1]=0x3e;dd[i+2]=0x44;dd[i+3]=255;}   // emptied: no brine (the glass's own edge and glints stay)
    g.putImageData(im,x,y);
    // a lock of hair: single strands, each its own wave, gathered at the thread and fanning out from it, lying on the bottom of the
    // jar (a solid band reads as a pipe or a sausage); the top strands lit; one milk tooth beside it
    const by=y+h-2,tie=x+6,xr=x+w-4;
    for(let k=0;k<5;k++){const col=k===0?R[3]:k===4?R[0]:k%2?R[1]:R[2];
      for(let X=x+2;X<=xr;X++){const d=X-tie,fan=d>=0?(.35+.16*d):(.6-.5*d),Y=Math.min(by+1,Math.round(by-.6+(k-2.6)*fan*.62+Math.sin(X*.7+k*1.9)*.7-(d>0?d*.1*(4-k)*.35:0)));
        if(d>0&&X>xr-((k*3)%4))continue;   // uneven tips
        P(X,Y,1,1,col);}}
    P(tie,by-3,1,4,'#e0d4b8');P(tie+1,by-2,1,3,'#9a8c6c');   // the thread round it
    const tx=x+3,ty=by-5;P(tx,ty,3,2,'#f0ead8');P(tx,ty,1,1,'#ffffff');P(tx+2,ty+1,1,1,'#d8ccb0');P(tx,ty+2,1,1,'#c8b898');P(tx+2,ty+2,1,1,'#c8b898');}   // the tooth, its two little roots
  c._gx2=1;return c;}
try{if(typeof s98JarsCut==='function')gx2JarsFix(s98JarsCut());}catch(e){}   // the world's jars and the close-up are both drawn from this
if(typeof SGT_ART!=='undefined'&&SGT_ART.jars){const _j=SGT_ART.jars;SGT_ART.jars=function(){return gx2JarsFix(_j.apply(this,arguments));};}
const GX2_JARTXT=[['Behind the jam: teeth, sorted by size. Eyes in brine, pale blue and brown, turning slowly when the floor creaks.','Behind the jam: milk teeth, sorted by size. Locks of hair, fair and brown and black, each tied off with thread, each with one small tooth.'],
  ['Ida Hale keeps a jar of every drawn child: teeth, eyes in brine, labelled by year.','Ida Hale keeps a jar of every drawn child: milk teeth and a lock of hair, labelled by year.']];
if(typeof SAGA!=='undefined'){const b=SAGA.find(q=>q.id==='jars');if(b)for(const k of ['text','lore'])if(typeof b[k]==='string')for(const [a,z] of GX2_JARTXT)b[k]=b[k].split(a).join(z);}
// a journal written before this keeps its own words: they change to match the jars
function gx2LoreFix(){if(GX2.loreS===S||!S||!Array.isArray(S.lore))return;GX2.loreS=S;for(let i=0;i<S.lore.length;i++)if(typeof S.lore[i]==='string')for(const [a,z] of GX2_JARTXT)if(S.lore[i].includes(a))S.lore[i]=S.lore[i].split(a).join(z);}
// the dead deer in the road is drawn opened (its own picture) through the first night's drive at Extreme
{const _ds=drawSpr;drawSpr=function(name,x,y,clip,dir,frame,o){if(name==='deer_dead'&&S.introDrive&&gxOn()){const m=SPR.g6_roaddeer;if(m&&IMG[m.src])return _ds.call(this,'g6_roaddeer',x,y,null,null,0,o);}return _ds.apply(this,arguments);};}
