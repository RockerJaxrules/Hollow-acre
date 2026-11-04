/* ================= render + main loop ================= */
const FPS_CLIP={walk:[1,8,11],idle:[0,0,1.6],thrust:[0,7,0],slash:[0,5,0],hurt:[0,5,10],spellcast:[0,6,8],sit:[0,2,2]};
function frameOf(name,clip,t,dur){const m=SPR[name];if(!m||!m.clips)return 0;const c=m.clips[clip]||m.clips.idle;if(!c)return 0;const nf=(c.S||Object.values(c)[0])[1];
  const f=FPS_CLIP[clip]||[0,nf-1,8];const a=f[0],b=Math.min(f[1],nf-1);
  if(dur)return a+Math.min(b-a,Math.floor(clamp(t/dur,0,.999)*(b-a+1)));
  if(clip==='idle')return Math.floor(t*f[2])%nf;return a+Math.floor(t*f[2])%(b-a+1);}
function charSprite(e,name){const clip=e.clip||'idle';return [name,clip];}
function shadow(x,y,w){ctx2.fillStyle='rgba(10,14,8,.32)';ctx2.beginPath();ctx2.ellipse(x,y,w,w*.38,0,0,Math.PI*2);ctx2.fill();}
let nightK=0,camT={x:0,z:0},titleT=0;
function render(dt,now){const t=now/1000;
  const amb=ambient(S.hour);nightK=clamp((S.hour-18.4)/1.8,0,1);if(S.hour<6.6)nightK=Math.max(nightK,clamp((6.6-S.hour)/1.6,0,1));nightAmt=nightK;
  // camera
  let fx=P.x,fz=P.z-.6;if(S.mode==='title'){fx=Math.sin(t*.05)*8;fz=-4+Math.cos(t*.04)*4;}
  if(cine&&cine.cam){fx=cine.cam.x;fz=cine.cam.z;}
  camT.x=lerp(camT.x,fx,1-Math.exp(-dt*9));camT.z=lerp(camT.z,fz,1-Math.exp(-dt*9));if(Math.abs(camT.x-fx)<.02)camT.x=fx;if(Math.abs(camT.z-fz)<.02)camT.z=fz;
  if(S.mode==='play'&&!(cine&&cine.cam)){camT.x=fx;camT.z=fz;}cam.x=camT.x;cam.z=camT.z;
  cam.px=Math.round(cam.x*PPM);cam.pz=Math.round(cam.z*PPM);
  if(cam.shake>0){cam.shake=Math.max(0,cam.shake-dt);const k=Math.round(cam.shake*10);cam.px+=((Math.random()*2-1)*k)|0;cam.pz+=((Math.random()*2-1)*k)|0;}
  if(cine&&cine.custom){cine.custom(ctx2,dt,t);return;}
  ctx2.fillStyle='#22301a';ctx2.fillRect(0,0,VW,VH);
  // ground chunks
  const left=cam.px-(VW>>1),top=cam.pz-Math.round(VH*.56);const c0=Math.floor(left/CH),c1=Math.floor((left+VW)/CH),r0=Math.floor(top/CH),r1=Math.floor((top+VH)/CH);
  for(let cz=r0;cz<=r1;cz++)for(let cx=c0;cx<=c1;cx++)ctx2.drawImage(chunk(cx,cz),cx*CH-left,cz*CH-top);
  // water shimmer
  if(onScreen(pond.x,pond.z,260))for(let i=0;i<26;i++){const a=hash(i,7)*6.28,r=hash(i,9)*pond.r*.85;const x=pond.x+Math.cos(a)*r,z=pond.z+Math.sin(a)*r*.9;
    const k=(Math.sin(t*1.7+i)+1)/2;if(k>.6){ctx2.fillStyle=`rgba(200,230,240,${(k-.6)*1.6})`;ctx2.fillRect(Math.round(sx(x)),Math.round(sz(z)),4,1);}}
  // tilled soil (dual grid autotile) + wet darkening
  const til=(x,z)=>{const t_=tileAt(Math.floor(x-FIELD.x0),Math.floor(z-FIELD.z0));return !!(t_&&t_.tilled);};
  for(let j=-1;j<FIELD.h;j++)for(let i=-1;i<FIELD.w;i++){const X=FIELD.x0+i+.5,Z=FIELD.z0+j+.5;const m=maskAt(til,X,Z);if(m)drawAuto(ctx2,'plowed',m,Math.round(sx(X)),Math.round(sz(Z)),hash(i,j));}
  for(const tl of tiles){if(tl.tilled&&tl.crop&&tl.crop.watered){ctx2.fillStyle='rgba(30,16,8,.32)';ctx2.fillRect(Math.round(sx(tl.x-.5)),Math.round(sz(tl.z-.5)),32,32);}}
  if(hlTile&&S.mode==='play'){ctx2.strokeStyle='rgba(255,240,200,.75)';ctx2.lineWidth=1;ctx2.strokeRect(Math.round(sx(hlTile.x-.5))+.5,Math.round(sz(hlTile.z-.5))+.5,31,31);}
  // skid marks & blood at the crash site
  if(onScreen(-56,-5,200)){ctx2.fillStyle='rgba(0,0,0,.3)';for(let k=0;k<2;k++){ctx2.save();ctx2.translate(sx(-58.6+k*.9),sz(-1.6+k*.25));ctx2.rotate(.42);ctx2.fillRect(-200,0,200,3);ctx2.restore();}}
  // collect drawables
  const D=[];const pad=200;
  for(const o of OBJ){if(o.hide)continue;const X=sx(o.x),Y=sz(o.z);if(X<-pad||X>VW+pad||Y<-60||Y>VH+pad+260)continue;
    if(o.kind==='deco'){drawSpr('leaves_'+o.v,X,Y);continue;}D.push({z:o.z,o});}
  for(const tl of tiles)if(tl.crop){const c=tl.crop;D.push({z:tl.z+.2,crop:tl});}
  for(const n of npcs)if(n.vis)D.push({z:n.z,npc:n});
  if(S.mode!=='title'&&!(cine&&cine.hidePlayer))D.push({z:P.z,player:true});
  if(H.vis)D.push({z:H.z,hollow:true});
  if(ruth.vis)D.push({z:ruth.z,ruth:true});
  if(cat.vis)D.push({z:cat.z,cat:true});
  if(scare.vis&&!S.bound)D.push({z:scare.z,scare:true});
  for(const m of mushrooms)if(!m.taken)D.push({z:m.z,mush:m});
  for(const pg of pageEnts)if(!S.pages.includes(pg.i))D.push({z:pg.z,page:pg});
  for(const a of altars)D.push({z:a.z,altar:a});
  if(S.hour>=19.5&&!S.bound)D.push({z:crossPos.z+2.6,peddler:true});
  for(const g of ghosts)if(g.t>0)D.push({z:g.z,ghost:g});
  if(ritual&&ritual.hat)D.push({z:ritual.hat.z,hat:true});
  D.sort((a,b)=>a.z-b.z);
  for(const d of D){
    if(d.o){const o=d.o;const X=sx(o.x),Y=sz(o.z);let a;
      if((o.kind==='tree'||o.kind==='pine'||o.kind==='bld')&&P.z<o.z-.2){const m=SPR[o.spr];if(m){const px=sx(P.x),py=sz(P.z)-30;const f=m.foot||[0,0,0,0];const x0=o.kind==='bld'?X+f[0]*PPM:X-m.fw*.35,x1=o.kind==='bld'?X+f[2]*PPM:X+m.fw*.35;if(px>x0&&px<x1&&py>Y-m.ay&&py<Y&&P.z>o.z-(o.kind==='bld'?8:4))a=.55;}}
      if(o.kind==='tree'||o.kind==='pine')shadow(X,Y,14);
      drawSpr(o.spr,X,Y,null,null,0,{alpha:a});
      if(o.night&&SPR[o.night]&&nightK>0)drawSpr(o.night,X,Y,null,null,0,{alpha:(a||1)*nightK});
      if(o.kind==='bld'){const h=HOUSES.find(q=>q.e===o);if(h&&h.faceT>0){const w=(h.w||6)/2;const fx=Math.round(X-w*PPM+48),fy=Math.round(Y-74);ctx2.fillStyle='#d8d4c8';ctx2.fillRect(fx,fy,8,10);ctx2.fillStyle='#000';ctx2.fillRect(fx+1,fy+3,2,2);ctx2.fillRect(fx+5,fy+3,2,2);ctx2.fillRect(fx+2,fy+7,4,2);}}}
    else if(d.crop){const tl=d.crop,c=tl.crop;const nm=c.type+'_'+c.stage;const s=c.pop<1?.6+.4*c.pop:1;drawSpr(nm,sx(tl.x),sz(tl.z+.2),null,null,0,{scale:s});}
    else if(d.npc){const n=d.npc;const X=sx(n.x),Y=sz(n.z);shadow(X,Y,9);drawSpr(n.def.id,X,Y,'walk',n.dir,n.clip==='walk'?frameOf(n.def.id,'walk',n.t):0);
      if(n.clip==='stand'&&S.day>=2&&nightK>.5){ctx2.fillStyle='#ff2a14';const ey=Math.round(Y-44);ctx2.fillRect(Math.round(X)-3,ey,1,1);ctx2.fillRect(Math.round(X)+2,ey,1,1);}}
    else if(d.player){const X=sx(P.x),Y=sz(P.z);shadow(X,Y,9);let nm='farmer',clip=P.clip,f;
      if(P.anim){const a=P.anim;if(a.clip==='hoe'){nm='farmer_hoe';clip='thrust';}else if(a.clip==='water'){nm='farmer_can';clip='thrust';}else clip='slash';f=frameOf(nm,clip,a.t,a.dur);}
      else{if(clip==='idle'){clip='walk';f=0;}else f=frameOf(nm,clip,P.t);}
      if(S.mode==='scare')clip='hurt';
      drawSpr(nm,X,Y,clip,clip==='hurt'?'S':P.dir,clip==='hurt'?Math.min(5,Math.floor((performance.now()/120)%6)):f);
      if(fish.state!=='off'){ctx2.strokeStyle='rgba(230,230,230,.7)';ctx2.beginPath();ctx2.moveTo(X+8,Y-36);ctx2.lineTo(sx(fish.bx),sz(fish.bz));ctx2.stroke();ctx2.fillStyle=fish.state==='bite'?'#ff4030':'#e83020';ctx2.fillRect(Math.round(sx(fish.bx))-1,Math.round(sz(fish.bz))-1+(fish.state==='bite'?Math.round(Math.sin(t*30)):0),3,3);}}
    else if(d.hollow){const X=sx(H.x),Y=sz(H.z);const clip=H.clip==='walk'||H.clip==='crawl'||H.clip==='idle'?'walk':H.clip==='scream'||H.clip==='lunge'?'spellcast':'hurt';
      const f=clip==='hurt'?(Math.random()<.3?1:0):H.clip==='idle'?0:frameOf('hollow',clip,H.ft*(H.clip==='crawl'?1.6:1));
      const jit=H.clip==='frozen'?(Math.random()-.5)*2:0;const rise=(1-H.rise)*40;
      ctx2.save();ctx2.beginPath();ctx2.rect(0,0,VW,Math.round(Y));ctx2.clip();
      shadow(X,Y,16);drawSpr('hollow',X+jit,Y+rise+(H.clip==='crawl'?18:0),clip,clip==='hurt'?'S':H.dir,f,{scale:H.clip==='crawl'?1.55:2,alpha:H.alpha});ctx2.restore();
      const ey=Y+rise-(H.clip==='crawl'?66:94);const fl=.7+Math.random()*.3;ctx2.fillStyle=`rgba(255,40,20,${fl*H.alpha})`;
      if(H.dir!=='N'){ctx2.fillRect(Math.round(X)-5,Math.round(ey),2,2);ctx2.fillRect(Math.round(X)+3,Math.round(ey),2,2);}}
    else if(d.ruth){const X=sx(ruth.x),Y=sz(ruth.z);drawSpr('ruth',X,Y,'walk',ruth.dir,0,{alpha:.45+Math.random()*.15});}
    else if(d.cat){drawSpr('cat',sx(cat.x),sz(cat.z),cat.clip,cat.dir,frameOf('cat',cat.clip,cat.t));}
    else if(d.scare){const X=sx(scare.x),Y=sz(scare.z);shadow(X,Y,8);ctx2.fillStyle='#4a3020';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-70,3,70);ctx2.fillRect(Math.round(X)-22,Math.round(Y)-56,45,3);drawSpr('hollow',X,Y-14,'walk','S',0);}
    else if(d.mush){drawSpr('mushroom',sx(d.mush.x),sz(d.mush.z));}
    else if(d.page){const X=sx(d.page.x),Y=sz(d.page.z);ctx2.fillStyle='#4a3020';ctx2.fillRect(Math.round(X),Math.round(Y)-16,2,16);ctx2.fillStyle='#e8dcc0';ctx2.fillRect(Math.round(X)-5,Math.round(Y)-24+Math.round(Math.sin(t*2+d.page.i)),12,10);ctx2.fillStyle='#8a7a5a';ctx2.fillRect(Math.round(X)-3,Math.round(Y)-21,8,1);ctx2.fillRect(Math.round(X)-3,Math.round(Y)-18,6,1);}
    else if(d.altar){const a=d.altar,X=sx(a.x),Y=sz(a.z);drawSpr('grave_0',X,Y);if(a.lit){ctx2.fillStyle=Math.random()<.5?'#ffd060':'#ff9a30';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-40,3,4);}else{ctx2.fillStyle='#2a2220';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-37,3,3);}}
    else if(d.peddler){const X=sx(crossPos.x+.6),Y=sz(crossPos.z+2.6);shadow(X,Y,9);drawSpr('hale',X,Y,'idle','S',0,{alpha:.0});ctx2.fillStyle='#120e16';ctx2.beginPath();ctx2.moveTo(X-11,Y);ctx2.lineTo(X+11,Y);ctx2.lineTo(X+6,Y-40);ctx2.lineTo(X,Y-50);ctx2.lineTo(X-6,Y-40);ctx2.closePath();ctx2.fill();
      ctx2.fillStyle='#ffd25a';ctx2.fillRect(Math.round(X)-3,Math.round(Y)-42,1,1);ctx2.fillRect(Math.round(X)+2,Math.round(Y)-42,1,1);ctx2.fillStyle='#6aff90';ctx2.fillRect(Math.round(X)+10,Math.round(Y)-24,4,5);}
    else if(d.ghost){drawSpr('hollow',sx(d.ghost.x),sz(d.ghost.z),'walk','S',0,{scale:2,alpha:d.ghost.t*2});}
    else if(d.hat){drawSpr('pumpkin',sx(ritual.hat.x),sz(ritual.hat.z));}
  }
  partsDraw();
  // weather: falling leaves (day), rain (storm), fog (night)
  if(nightK<.8){for(let i=0;i<24;i++){const s=hash(i,3);const x=((s*977+t*14*(.5+s))%(VW+40))-20,y=((hash(i,5)*VH+t*(18+s*20))%(VH+20))-10;ctx2.fillStyle=['#d0702a','#b8521c','#e0a040','#8a3a18'][i%4];ctx2.globalAlpha=1-nightK;ctx2.fillRect(Math.round(x+Math.sin(t*2+i)*6),Math.round(y),2,1);}ctx2.globalAlpha=1;}
  if(S.storm&&isNight()){ctx2.strokeStyle='rgba(170,190,220,.35)';ctx2.beginPath();for(let i=0;i<90;i++){const x=(hash(i,1)*VW+t*40)%VW,y=(hash(i,2)*VH+t*620)%VH;ctx2.moveTo(Math.round(x),Math.round(y));ctx2.lineTo(Math.round(x-2),Math.round(y+7));}ctx2.stroke();}
  if(nightK>0&&fogTex){ctx2.globalAlpha=nightK*.55;const ox=Math.round((-(cam.px*.7)+t*6)%256),oy=Math.round((-(cam.pz*.7))%256);for(let y=oy-256;y<VH;y+=256)for(let x=ox-256;x<VW;x+=256)ctx2.drawImage(fogTex,Math.round(x),Math.round(y));ctx2.globalAlpha=1;}
  // ---- light map (multiply)
  lctx.globalCompositeOperation='source-over';lctx.fillStyle=`rgb(${amb[0]|0},${amb[1]|0},${amb[2]|0})`;lctx.fillRect(0,0,VW,VH);
  if(nightK>.02){lctx.globalCompositeOperation='lighter';const L=nightK;const fl=.95+.05*Math.sin(t*5.3);
    for(const h of HOUSES){if(!h.lit)continue;const X=sx(h.x),Y=sz(h.z)-40;if(X<-200||X>VW+200||Y<-200||Y>VH+200)continue;glowAt(X,Y,110,[255,170,80],.5*L);}
    for(const lp of lamps){if(lp.dead&&Math.sin(t*9+lp.ph)>.2)continue;const X=sx(lp.x),Y=sz(lp.z)-66;if(X<-150||X>VW+150||Y<-150||Y>VH+150)continue;glowAt(X,Y+50,100,[255,180,90],.75*L*fl);glowAt(X,Y,16,[255,230,170],.9*L);}
    for(const o of OBJ){if(!o.glow)continue;const X=sx(o.x),Y=sz(o.z)-8;if(X<-60||X>VW+60||Y<-60||Y>VH+60)continue;glowAt(X,Y,30,[255,140,40],.6*L*fl);}
    for(const a of altars)if(a.lit){glowAt(sx(a.x),sz(a.z)-36,120,[255,150,60],.8*fl);}
    for(const m of mushrooms)if(!m.taken)glowAt(sx(m.x),sz(m.z)-6,26,[90,255,200],.55*L);
    if(S.hour>=19.5&&!S.bound)glowAt(sx(crossPos.x+.6)+12,sz(crossPos.z+2.6)-22,46,[110,255,150],.7*L);
    if(phone.ring&&Math.sin(t*20)>0)glowAt(sx(boothPos.x),sz(boothPos.z),60,[200,230,255],.7);
    // the player's lantern: warm halo + a cone where you face
    if(S.mode!=='title'){const on=lanternOn()?1:0;const sput=sputT>0?(Math.random()<.5?.15:.6):1;const fuel=S.fuel<15?(.6+.4*Math.random()):1;const k=L*fl*sput*fuel*(on?1:.12);
      const X=sx(P.x),Y=sz(P.z)-22;glowAt(X,Y,S.flashlight?92:78,[255,196,120],.95*k);
      const ang=Math.atan2(P.fz,P.fx);coneAt(X,Y,ang,S.flashlight?.62:.5,(S.flashlight?11:8.5)*PPM,[255,214,150],.8*k);}
    if(H.vis&&H.dir!=='N'){glowAt(sx(H.x),sz(H.z)-94,10,[255,40,20],.9*H.alpha);}
    for(const g of ghosts)if(g.t>0)glowAt(sx(g.x),sz(g.z)-94,8,[255,40,20],g.t*2);}
  if(flashT>0){lctx.globalCompositeOperation='lighter';lctx.fillStyle=`rgba(210,220,255,${clamp(flashT,0,1)})`;lctx.fillRect(0,0,VW,VH);}
  ctx2.globalCompositeOperation='multiply';ctx2.drawImage(lightC,0,0);ctx2.globalCompositeOperation='source-over';
  // vignette + danger pulse + grain
  if(!vig||vig.w!==VW||vig.h!==VH)makeVig();ctx2.drawImage(vig.c,0,0);
  if(danger>.3&&!S.bound){ctx2.fillStyle=`rgba(120,0,0,${(danger-.3)*.25*(.6+.4*Math.sin(t*6))})`;ctx2.fillRect(0,0,VW,VH);}
}
let vig=null;
function makeVig(){const c=document.createElement('canvas');c.width=VW;c.height=VH;const g=c.getContext('2d');const gr=g.createRadialGradient(VW/2,VH*.5,Math.min(VW,VH)*.35,VW/2,VH*.5,Math.max(VW,VH)*.75);
  gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(6,4,10,.55)');g.fillStyle=gr;g.fillRect(0,0,VW,VH);vig={c,w:VW,h:VH};}
/* ================= jumpscare (pixel) ================= */
function drawScare(){const c=$('scare');const W=96,Hh=128;c.width=W;c.height=Hh;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.fillStyle='#050102';g.fillRect(0,0,W,Hh);
  // the pumpkin skull: ribbed, rotten, lit from inside
  const cx=48,cy=62;
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const dx=(x-cx)/42,dy=(y-cy)/46;const d=dx*dx+dy*dy;if(d>1)continue;
    const rib=Math.cos(Math.atan2(dy,dx*1.2)*7);const sh=(1-d)*.7+(-dx*.25-dy*.2)+rib*.12;const n=hash(x>>1,y>>1)*.25;
    let r=150+sh*90+n*40,gg=58+sh*50+n*20,bb=14+sh*12;if(hash(x>>2,(y>>2)+9)>.86){r*=.45;gg*=.4;bb*=.5;}
    g.fillStyle=`rgb(${r|0},${gg|0},${bb|0})`;g.fillRect(x,y,1,1);}
  g.fillStyle='#3a2a10';g.fillRect(44,12,8,8);g.fillRect(46,8,5,5);
  // carved eye holes with a burning core
  const eye=(x0,y0,flip)=>{for(let k=0;k<16;k++){const w=18-k;g.fillStyle='#090102';g.fillRect(flip?x0+k-2:x0+k*.2,y0+k,w,1);}
    g.fillStyle='#ff3a10';g.fillRect(x0+5,y0+5,6,6);g.fillStyle='#ffd070';g.fillRect(x0+7,y0+7,2,2);};
  eye(22,40,false);eye(56,40,true);
  // torn mouth full of needle teeth
  g.fillStyle='#070102';g.beginPath();g.moveTo(18,78);for(let i=0;i<=12;i++){const x=18+i*5,y=78+(i%2?-5:3)+Math.sin(i)*2;g.lineTo(x,y);}g.lineTo(78,98);
  for(let i=12;i>=0;i--){const x=18+i*5,y=104+(i%2?4:-2);g.lineTo(x,y);}g.closePath();g.fill();
  g.fillStyle='#ff5a1a';g.fillRect(30,88,36,3);
  g.fillStyle='#efe4c4';for(let i=0;i<13;i++){const x=20+i*4.6;g.fillRect(x|0,80+(i%2),2,8+(i%3)*2);g.fillRect((x+2)|0,102-(i%2),2,-7-(i%2)*2);}
  // drips
  g.fillStyle='#1a0402';for(let i=0;i<9;i++){const x=24+i*6+(i%2)*2;g.fillRect(x,56,2,6+((i*7)%9));}
  g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,W,6);g.fillRect(0,Hh-8,W,8);
  c.style.imageRendering='pixelated';}
/* ================= cutscenes ================= */
let cine=null;
function sub(text){ui.subs.textContent=text||'';ui.subs.classList.toggle('show',!!text);}
function startCine(kind){if(kind==='intro')return introCine();if(kind==='escape')return escapeCine();}
function endCine(){cine=null;sub('');$('skip').hidden=true;SFX.engine(false);}
function introCine(){S.mode='cine';$('hud').hidden=true;$('buttons').hidden=true;ui.obj.hidden=true;$('skip').hidden=false;$('title').hidden=true;
  // the woods along Route 9: world-space props, the car drives north (-z)
  const props=[];const PINES=['pine_0','pine_1','pine_o0','pine_o1'];
  for(let i=0;i<340;i++){const side=i%2?1:-1,z=-i*.95+hash(i,9)*.8,x=side*(4.9+Math.pow(hash(i,1),1.6)*9);
    const k=hash(i,3);props.push({x,z,spr:k<.08?'deadtree':k<.16?'tree_green':PINES[(hash(i,4)*4)|0]});}
  for(let z=-20;z>-330;z-=31)props.push({x:4.7,z,post:1},{x:-4.7,z:z-15,post:1});
  props.push({x:5.4,z:-48,spr:'signpost'});
  const st={t:0,carX:1.7,carZ:0,yaw:0,spd:13,deerZ:null,figZ:null,mirror:0,flash:0,crashZ:null,done:{},props};SFX.engine(true);
  const once=k=>st.done[k]?false:(st.done[k]=true);
  cine={hidePlayer:true,custom(g,dt,t){st.t+=dt;const T=st.t;
    if(T<3){g.fillStyle='#000';g.fillRect(0,0,VW,VH);if(once('a'))sub('Route 9. 11:48 PM. Rain since the county line.');return;}
    const slow=T>15.2&&T<16.6?.3:1;if(T<17)st.carZ-=st.spd*dt*slow;
    if(T>15.6&&T<17){st.yaw=lerp(st.yaw,.9,dt*3);st.carX+=st.spd*dt*.5*slow;}
    if(T>4&&once('b'))sub('Voicemail from Grandpa Elias. Three days old.');
    if(T>7.2&&once('c'))sub('"…it already picked you. I’m sorry, kid. Come quick, before the thirty-first."');
    if(T>9.4&&once('lt')){st.flash=1;SFX.thud(0,.9);cam.shake=.15;}
    if(T>10.5&&once('d')){st.deerZ=st.carZ-15;sub('');}
    if(T>11.6&&once('e')){SFX.thud(0,.5);cam.shake=.25;sub('Something was lying in the road.');}
    if(T>12.8&&once('f')){st.mirror=1.4;SFX.stinger();sub('Something in the mirror.');}
    if(T>14.2&&once('g')){sub('Nothing. There’s nothing there.');st.figZ=st.carZ-17;}
    if(T>15.2&&once('h')){SFX.shriek(0);SFX.horn();st.crashZ=st.carZ-12.6;props.push({x:6.6,z:st.crashZ,spr:'tree_green',big:1});}
    if(T>15.5)st.figZ=null;if(T>16.4&&once('i')){SFX.screech();}
    if(T>17&&once('j')){SFX.crash();cam.shake=1;flashT=1;SFX.engine(false);sub('');}
    if(T<17.25)drawRoad(g,st,t,dt);
    if(T>=17.25){g.fillStyle='#000';g.fillRect(0,0,VW,VH);if(flashT>0){g.fillStyle=`rgba(255,255,255,${flashT})`;g.fillRect(0,0,VW,VH);flashT-=dt*1.5;}
      if(T>19&&once('k')){SFX.heart(.6);sub('Rain on your face. Blood in your mouth.');}
      if(T>21.5&&once('l')){cine.custom=null;cine.hidePlayer=false;S.hour=4.6;P.x=-58.6;P.z=-6.4;P.dir='W';P.fx=-1;P.fz=0;H.vis=true;H.x=carPos.x-.6;H.z=carPos.z+1.6;H.state='cutscene';H.clip='crawl';H.dir='W';H.alpha=1;H.rise=1;
        cine.cam={x:-59.5,z:-5.6};sub('Something climbs off the hood.');SFX.breath(0);fade(0);}
      return;}
  },update(dt){if(cine.custom)return;cine.t2=(cine.t2||0)+dt;const k=cine.t2;H.ft+=dt;
    if(k<3.5){H.x-=dt*1.1;H.z+=dt*1.6;H.dir='S';}else if(k<6){H.clip='walk';H.dir='W';H.x-=dt*2.6;H.z+=dt*1.4;}
    if(k>2.6&&!cine.s2){cine.s2=1;sub('It crawls away into the trees. It looked back at you.');SFX.whisper(0);}
    if(k>6.2&&!cine.s3){cine.s3=1;H.vis=false;H.state='gone';fade(1);setTimeout(()=>{finishIntro();fade(0);},900);}}};}
function drawRoad(g,st,t,dt){const W=VW,H_=VH,base=Math.round(H_*.7),cxs=(W>>1)-Math.round((st.carX-1.7)*PPM*.7)-Math.round(1.7*PPM*.5);
  const shk=cam.shake>0?Math.round((Math.random()-.5)*cam.shake*8):0;cam.shake=Math.max(0,cam.shake-dt*1.8);
  const camZ=Math.round(st.carZ*PPM),Y=z=>Math.round(z*PPM)-camZ+base+shk,X=x=>Math.round(x*PPM)+cxs;
  // grass: LPC tiles with dark patches, scrolling with the road
  const z0=Math.floor((camZ-base)/32)-1,z1=z0+Math.ceil(H_/32)+2,x0=-Math.ceil(cxs/32)-1,x1=-x0;
  const dark=(x,z)=>fbm(x*.21+3,z*.21)>.5;
  for(let j=z0;j<=z1;j++)for(let i=x0;i<=x1;i++){const dx=i*32+cxs,dy=j*32-camZ+base+shk;
    drawAuto(g,'grass',15,dx,dy,hash(i*3+1,j*7+2));drawAuto(g,'dark',maskAt(dark,i,j),dx,dy,hash(i+11,j+5));}
  // the road strip (Blender-rendered asphalt, seamless every 12 m)
  const R=SPR.road,rim=IMG[R.src];if(rim){const rh=R.fh;let y0=((-camZ+base+shk)%rh+rh)%rh-rh;for(let y=y0;y<H_;y+=rh)g.drawImage(rim,cxs-R.ax,y);}
  // y-sorted world things
  const D=[];const top=st.carZ-(base+60)/PPM,bot=st.carZ+(H_-base+260)/PPM;
  for(const p of st.props)if(p.z>top-8&&p.z<bot)D.push(p);
  if(st.deerZ!==null)D.push({z:st.deerZ,deer:1});
  if(st.figZ!==null)D.push({z:st.figZ,fig:1});
  if(st.mirror>0)D.push({z:st.carZ+5.2,mir:1});
  D.push({z:st.carZ+.1,car:1});D.sort((a,b)=>a.z-b.z);
  for(const d of D){
    if(d.car){const f=Math.max(0,Math.min(6,Math.round(st.yaw/.15)));drawSpr('car_drive',X(st.carX),Y(st.carZ),'yaw','S',f);}
    else if(d.post){const x=X(d.x),y=Y(d.z);g.fillStyle='#1a1a1a';g.fillRect(x-1,y-14,3,15);g.fillStyle='#d8d8d0';g.fillRect(x-1,y-14,3,11);g.fillStyle='#f2c230';g.fillRect(x-1,y-12,3,2);}
    else if(d.deer){g.save();g.translate(X(.8),Y(d.z));g.rotate(Math.PI/2);drawSpr('deer',0,0);g.restore();}
    else if(d.fig){drawSpr('hollow',X(.15),Y(d.z),'walk','S',0,{scale:2});}
    else if(d.mir){drawSpr('hollow',X(.1),Y(d.z),'walk','N',0,{scale:2,alpha:Math.min(1,st.mirror)});}
    else drawSpr(d.spr,X(d.x),Y(d.z),null,null,0,d.big?{scale:1.3}:undefined);}
  // a lightning flash shows it standing in the tree line
  if(st.flash>0){const f=st.flash;if(f>.55)drawSpr('hollow',X(-6.2),Y(st.carZ-9),'walk','S',0,{scale:2});st.flash=Math.max(0,f-dt*2.6);}
  if(st.mirror>0)st.mirror-=dt;
  // light: night ambient, twin headlight beams, tail lights
  const amb=st.flash>.5?[200,205,235]:st.flash>0?[40+st.flash*120,44+st.flash*120,70+st.flash*120]:[36,42,70];
  lctx.globalCompositeOperation='source-over';lctx.fillStyle=`rgb(${amb.map(v=>v|0).join(',')})`;lctx.fillRect(0,0,W,H_);lctx.globalCompositeOperation='lighter';
  const cx=X(st.carX),cy=Y(st.carZ),sn=Math.sin(st.yaw),cs=Math.cos(st.yaw);
  const nose=(dx,dz)=>[cx+(dx*cs+dz*sn)*PPM,cy+(dx*sn-dz*cs)*PPM];
  for(const s of [-.62,.62]){const [hx,hy]=nose(s,2.2);coneAt(hx,hy,-Math.PI/2+st.yaw,.3,12*PPM,[255,238,196],.75);glowAt(hx,hy,10,[255,240,210],.9);}
  glowAt(cx,cy-20,90,[120,110,100],.35);const [tx,ty]=nose(0,-2.2);glowAt(tx,ty,46,[255,26,16],st.mirror>0?.9:.55);
  if(st.mirror>0)glowAt(X(0),Y(st.carZ+5.2)-40,70,[255,30,20],.6*Math.min(1,st.mirror));
  if(st.figZ!==null){glowAt(X(.15)-4,Y(st.figZ)-96,5,[255,40,20],1);glowAt(X(.15)+6,Y(st.figZ)-96,5,[255,40,20],1);}
  g.globalCompositeOperation='multiply';g.drawImage(lightC,0,0);g.globalCompositeOperation='source-over';
  // mist + rain + splashes
  g.strokeStyle='rgba(170,190,220,.33)';g.beginPath();for(let i=0;i<120;i++){const x=(hash(i,1)*W+t*30)%W,y=(hash(i,2)*H_+t*700)%H_;g.moveTo(Math.round(x),Math.round(y));g.lineTo(Math.round(x-2),Math.round(y+8));}g.stroke();
  g.fillStyle='rgba(200,215,240,.5)';for(let i=0;i<26;i++){const k=Math.floor(t*12+i*7.3);g.fillRect(Math.round(hash(k,i)*W),Math.round(hash(i,k)*H_),1,1);}
  if(!vig||vig.w!==VW||vig.h!==VH)makeVig();g.drawImage(vig.c,0,0);}
function finishIntro(){endCine();S.mode='play';S.hour=6.3;H.vis=false;H.state='gone';H.timer=6;P.x=-58.6;P.z=-6.4;P.dir='E';P.fx=1;P.fz=0;
  $('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;toast('Day 1. Dawn. Your car is wrapped around the oak. The farm is east.',4);}
function escapeCine(){S.mode='cine';$('skip').hidden=false;$('buttons').hidden=true;SFX.engineStart();SFX.engine(true);const st={t:0,x:carPos.x,loops:0};
  cine={hidePlayer:true,cam:{x:st.x,z:-6},custom:null,update(dt){st.t+=dt;st.x-=dt*14;cine.cam.x=st.x;cine.cam.z=-6;
    if(st.x<-74){st.loops++;st.x=-14;fade(.8);setTimeout(()=>fade(0),300);sub(st.loops===1?'The farm sign goes by. Again.':'HOLLOW ACRE. E. Marsh, prop. 32 marks now.');SFX.whisper(0);}
    if(st.loops>=2&&st.x<-20&&!st.end){st.end=1;SFX.engine(false);fade(1);setTimeout(()=>{endCine();S.looped=true;S.mode='play';P.x=farmSignPos.x+1;P.z=farmSignPos.z+1.4;$('buttons').hidden=false;fade(0);
      toast('The engine dies in front of the farm sign. There is no road out of Marrow Hollow.',4,true);},1000);}},
    draw(){drawSpr('car_side',sx(st.x),sz(-6));}};
  sub('The highway west. The radio plays a hymn you almost know.');}
$('skip').addEventListener('click',()=>{if(!cine)return;if(S.mode==='cine'&&cine.update&&!cine.draw){fade(1);setTimeout(()=>{finishIntro();fade(0);},500);}else if(cine.draw){S.looped=true;endCine();S.mode='play';$('buttons').hidden=false;}});
/* ================= controls ================= */
function onAct(){A.init&&A.init();if(S.mode!=='play'||S.paused||P.anim)return;if(ctx.ok&&ctx.act)ctx.act();else if(ctx.label)SFX.deny();}
function onSeed(){if(S.mode!=='play')return;S.sel=S.sel==='turnip'?'pumpkin':'turnip';if(S.seeds[S.sel]<=0)toast(`No ${SEEDS[S.sel].name.toLowerCase()} seeds. Mae sells them.`,1.6);updateHud();}
function press(el,fn){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();A.init&&A.init();fn();});}
/* ================= loop ================= */
let last=performance.now(),acc=0;
function loop(now){requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;
  if(S.mode==='play'&&!S.paused){update(dt);}
  else if(S.mode==='ritual'){ritualUpdate(dt);}
  else if(S.mode==='title'){S.hour=19.2+Math.sin(now/9000)*.4;}
  if(cine&&cine.update)cine.update(dt);
  if(S.mode==='cine'&&!cine)S.mode='play';
  if(S.mode==='scare'){H.ft+=dt;}
  if(flashT>0&&!(cine&&cine.custom))flashT=Math.max(0,flashT-dt*1.6);
  for(const g of ghosts)g.t-=dt;
  partsUpdate(dt);
  render(dt,now);
  if(cine&&cine.draw)cine.draw();
  if(S.mode==='play'){ctx=computeContext();ui.act.textContent=ctx.label||'—';ui.act.classList.toggle('off',!ctx.ok);ui.act.classList.toggle('hot',!!ctx.ok&&!!ctx.label);updateHud();
    const ob=objective();ui.obj.innerHTML=`<b>${ob[0]}</b> ${ob[1]}`;const tg=ob[2];
    if(tg&&Math.hypot(tg.x-P.x,tg.z-P.z)>3){const X=sx(tg.x),Y=sz(tg.z);const ax=clamp(X,20,VW-20),ay=clamp(Y,60,VH-60);const off=X<0||X>VW||Y<0||Y>VH;
      ui.arrow.style.display=off?'block':'none';if(off){const ang=Math.atan2(Y-VH/2,X-VW/2);ui.arrow.style.left=(ax*innerWidth/VW-15)+'px';ui.arrow.style.top=(ay*innerHeight/VH-15)+'px';ui.arrow.style.transform=`rotate(${ang+Math.PI/2}rad)`;}}
    else ui.arrow.style.display='none';}
  if(toastT>0){toastT-=dt;if(toastT<=0)ui.toast.classList.remove('show');}
}
/* ================= boot ================= */
function boot(){resize();addEventListener('resize',()=>{resize();vig=null;});makeFog();setupTouch();
  press($('btnAct'),onAct);press($('btnSeed'),onSeed);$('btnTurn').hidden=true;
  const list=[...new Set(Object.values(SPR).map(m=>m.src))].concat(Object.values(TS).map(t=>t[0]));
  const lb=$('loadBar'),lt=$('loadTxt');
  loadImages([...new Set(list)],(d,n)=>{lb.style.width=(d/n*100)+'%';lt.textContent='Loading the valley… '+d+' / '+n;}).then(()=>{
    buildWorld();placeScarecrow(1);spawnMushrooms();resetCat();placeNPCs();
    for(const [cx,cz] of[[-6.3,2.2],[1.2,9.4],[48,-9.6],[57,-24],[-14.5,-9]])crows.push({x:cx,z:cz,hx:cx,hz:cz,y:0,state:'perch',t:0,vx:0,vz:0});
    S.mode='title';$('loadScr').style.opacity=0;setTimeout(()=>$('loadScr').remove(),800);requestAnimationFrame(loop);});
  $('begin').addEventListener('click',()=>{A.init&&A.init();startCine('intro');});
  window.__game={S,P,H,tiles,npcs,act:onAct,tp:(x,z)=>{P.x=x;P.z=z;},setHour:h=>{S.hour=h;},skip:()=>{finishIntro();}};}
boot();
