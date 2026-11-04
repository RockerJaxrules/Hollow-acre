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
  camT.x=lerp(camT.x,fx,1-Math.exp(-dt*6));camT.z=lerp(camT.z,fz,1-Math.exp(-dt*6));cam.x=camT.x;cam.z=camT.z;
  if(cam.shake>0){cam.shake=Math.max(0,cam.shake-dt);cam.x+=(Math.random()-.5)*cam.shake*.3;cam.z+=(Math.random()-.5)*cam.shake*.3;}
  if(cine&&cine.custom){cine.custom(ctx2,dt,t);return;}
  ctx2.fillStyle='#22301a';ctx2.fillRect(0,0,VW,VH);
  // ground chunks
  const left=cam.x*PPM-VW/2,top=cam.z*PPM-VH*.56;const c0=Math.floor(left/CH),c1=Math.floor((left+VW)/CH),r0=Math.floor(top/CH),r1=Math.floor((top+VH)/CH);
  for(let cz=r0;cz<=r1;cz++)for(let cx=c0;cx<=c1;cx++)ctx2.drawImage(chunk(cx,cz),Math.round(cx*CH-left),Math.round(cz*CH-top));
  // water shimmer
  if(onScreen(pond.x,pond.z,260))for(let i=0;i<26;i++){const a=hash(i,7)*6.28,r=hash(i,9)*pond.r*.85;const x=pond.x+Math.cos(a)*r,z=pond.z+Math.sin(a)*r*.9;
    const k=(Math.sin(t*1.7+i)+1)/2;if(k>.6){ctx2.fillStyle=`rgba(200,230,240,${(k-.6)*1.6})`;ctx2.fillRect(Math.round(sx(x)),Math.round(sz(z)),4,1);}}
  // tilled soil (dual grid autotile) + wet darkening
  const til=(x,z)=>{const t_=tileAt(Math.floor(x-FIELD.x0),Math.floor(z-FIELD.z0));return !!(t_&&t_.tilled);};
  for(let j=-1;j<FIELD.h;j++)for(let i=-1;i<FIELD.w;i++){const X=FIELD.x0+i+.5,Z=FIELD.z0+j+.5;const m=maskAt(til,X,Z);if(m)drawAuto(ctx2,'plowed',m,Math.round(sx(X)),Math.round(sz(Z)),hash(i,j));}
  for(const tl of tiles){if(tl.tilled&&tl.crop&&tl.crop.watered){ctx2.fillStyle='rgba(30,16,8,.32)';ctx2.fillRect(Math.round(sx(tl.x-.5)),Math.round(sz(tl.z-.5)),32,32);}}
  if(hlTile&&S.mode==='play'){ctx2.strokeStyle='rgba(255,240,200,.75)';ctx2.lineWidth=1;ctx2.strokeRect(Math.round(sx(hlTile.x-.5))+.5,Math.round(sz(hlTile.z-.5))+.5,31,31);}
  // skid marks & blood at the crash site
  if(onScreen(-56,-5,200)){ctx2.fillStyle='rgba(0,0,0,.35)';for(let k=0;k<2;k++){ctx2.save();ctx2.translate(sx(-55.5),sz(-5+k*1.3));ctx2.rotate(.4);ctx2.fillRect(-180,0,180,4);ctx2.restore();}}
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
      if((o.kind==='tree'||o.kind==='pine'||o.kind==='bld')&&P.z<o.z-.2){const m=SPR[o.spr];if(m){const px=sx(P.x),py=sz(P.z)-30;if(px>X-m.ax&&px<X-m.ax+m.fw&&py>Y-m.ay&&py<Y-m.ay+m.fh&&P.z>o.z-(o.kind==='bld'?8:4))a=.55;}}
      if(o.kind==='tree'||o.kind==='pine')shadow(X,Y,14);
      drawSpr(o.spr,X,Y,null,null,0,{alpha:a});
      if(o.night&&SPR[o.night]&&nightK>0)drawSpr(o.night,X,Y,null,null,0,{alpha:(a||1)*nightK});}
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
  if(nightK>0&&fogTex){ctx2.globalAlpha=nightK*.55;const ox=(-(cam.x*PPM*.7)+t*6)%256,oy=(-(cam.z*PPM*.7))%256;for(let y=oy-256;y<VH;y+=256)for(let x=ox-256;x<VW;x+=256)ctx2.drawImage(fogTex,Math.round(x),Math.round(y));ctx2.globalAlpha=1;}
  // ---- light map (multiply)
  lctx.globalCompositeOperation='source-over';lctx.fillStyle=`rgb(${amb[0]|0},${amb[1]|0},${amb[2]|0})`;lctx.fillRect(0,0,VW,VH);
  if(nightK>.02){lctx.globalCompositeOperation='lighter';const L=nightK;const fl=.88+.12*Math.sin(t*23)*Math.sin(t*7.3);
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
  if(grainTex){ctx2.globalAlpha=.5;ctx2.drawImage(grainTex,(Math.random()*-64)|0,(Math.random()*-64)|0,VW+128,VH+128);ctx2.globalAlpha=1;}
}
let vig=null;
function makeVig(){const c=document.createElement('canvas');c.width=VW;c.height=VH;const g=c.getContext('2d');const gr=g.createRadialGradient(VW/2,VH*.5,Math.min(VW,VH)*.35,VW/2,VH*.5,Math.max(VW,VH)*.75);
  gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(6,4,10,.55)');g.fillStyle=gr;g.fillRect(0,0,VW,VH);vig={c,w:VW,h:VH};}
/* ================= jumpscare (pixel) ================= */
function drawScare(){const c=$('scare');c.width=96;c.height=128;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#080102';g.fillRect(0,0,96,128);
  const m=SPR.hollow,im=IMG[m.src];const r=m.clips.walk.S[0];g.drawImage(im,16,r*64+2,32,30,-8,2,112,105);
  g.fillStyle='#000';g.fillRect(28,48,12,10);g.fillRect(56,46,12,11);
  g.fillStyle='#ff2010';g.fillRect(32,51,4,4);g.fillRect(60,50,4,4);g.fillStyle='#ffe0c0';g.fillRect(33,52,1,1);g.fillRect(61,51,1,1);
  g.fillStyle='#120000';g.beginPath();g.ellipse(48,86,22,16,0,0,7);g.fill();g.fillStyle='#e8dcc0';for(let i=0;i<11;i++){g.fillRect(28+i*4,72+(i%2),2,6+(i%3));g.fillRect(29+i*4,96-(i%2),2,-5-(i%2));}
  g.fillStyle='rgba(90,0,0,.6)';for(let i=0;i<5;i++)g.fillRect(30+i*9,58,1,8+i%3);
  c.style.imageRendering='pixelated';}
/* ================= cutscenes ================= */
let cine=null;
function sub(text){ui.subs.textContent=text||'';ui.subs.classList.toggle('show',!!text);}
function startCine(kind){if(kind==='intro')return introCine();if(kind==='escape')return escapeCine();}
function endCine(){cine=null;sub('');$('skip').hidden=true;SFX.engine(false);}
function introCine(){S.mode='cine';$('hud').hidden=true;$('buttons').hidden=true;ui.obj.hidden=true;$('skip').hidden=false;$('title').hidden=true;
  const trees=[];for(let i=0;i<40;i++)trees.push({x:(i%2?1:-1)*(3.2+hash(i,1)*5),z:-i*2.2-hash(i,2)*2,k:hash(i,3)});
  const st={t:0,carX:0,carZ:0,yaw:0,spd:13,deerZ:-150,figZ:-999,mirror:0,done:{}};SFX.engine(true);
  const once=k=>st.done[k]?false:(st.done[k]=true);
  cine={hidePlayer:true,custom(g,dt,t){st.t+=dt;const T=st.t;
    if(T<3){g.fillStyle='#000';g.fillRect(0,0,VW,VH);if(once('a'))sub('Route 9. 11:48 PM. Rain since the county line.');return;}
    const slow=T>15.2&&T<16.6?.3:1;st.carZ-=st.spd*dt*slow;if(T>15.6&&T<17){st.yaw=lerp(st.yaw,.9,dt*3);st.carX+=st.spd*dt*.5*slow;}
    if(T<17)drawRoad(g,st,trees,t);
    if(T>4&&once('b'))sub('Voicemail from Grandpa Elias. Three days old.');
    if(T>7.2&&once('c'))sub('"…it already picked you. I’m sorry, kid. Come quick, before the thirty-first."');
    if(T>10.5&&once('d')){st.deerZ=st.carZ-14;sub('');}
    if(T>11.6&&once('e')){SFX.thud(0,.5);cam.shake=.25;sub('Something was lying in the road.');}
    if(T>12.8&&once('f')){st.mirror=1.2;SFX.stinger();sub('Something in the mirror.');}
    if(T>14.2&&once('g')){sub('Nothing. There’s nothing there.');st.figZ=st.carZ-16;}
    if(T>15.2&&once('h')){SFX.shriek(0);SFX.horn();}
    if(T>16.4&&once('i')){SFX.screech();}
    if(T>17&&once('j')){SFX.crash();cam.shake=1;flashT=1;SFX.engine(false);sub('');}
    if(T>=17){g.fillStyle='#000';g.fillRect(0,0,VW,VH);if(flashT>0){g.fillStyle=`rgba(255,255,255,${flashT})`;g.fillRect(0,0,VW,VH);flashT-=dt*1.5;}
      if(T>19&&once('k')){SFX.heart(.6);sub('Rain on your face. Blood in your mouth.');}
      if(T>21.5&&once('l')){cine.custom=null;cine.hidePlayer=false;S.hour=4.6;P.x=-58.6;P.z=-6.4;P.dir='W';P.fx=-1;P.fz=0;H.vis=true;H.x=carPos.x-.6;H.z=carPos.z+1.6;H.state='cutscene';H.clip='crawl';H.dir='W';H.alpha=1;H.rise=1;
        cine.cam={x:-59.5,z:-5.6};sub('Something climbs off the hood.');SFX.breath(0);fade(0);}
      return;}
  },update(dt){if(cine.custom)return;cine.t2=(cine.t2||0)+dt;const k=cine.t2;H.ft+=dt;
    if(k<3.5){H.x-=dt*1.1;H.z+=dt*1.6;H.dir='S';}else if(k<6){H.clip='walk';H.dir='W';H.x-=dt*2.6;H.z+=dt*1.4;}
    if(k>2.6&&!cine.s2){cine.s2=1;sub('It crawls away into the trees. It looked back at you.');SFX.whisper(0);}
    if(k>6.2&&!cine.s3){cine.s3=1;H.vis=false;H.state='gone';fade(1);setTimeout(()=>{finishIntro();fade(0);},900);}}};}
function drawRoad(g,st,trees,t){const W=VW,H_=VH;g.fillStyle='#0c1410';g.fillRect(0,0,W,H_);const cx=W/2+st.carX*PPM*.0,cz=st.carZ;
  const rx=Math.round(W/2-2.6*PPM);g.fillStyle='#1c1c20';g.fillRect(rx,0,Math.round(5.2*PPM),H_);
  g.fillStyle='#b89430';for(let y=((-cz*PPM)%64+64)%64-64;y<H_;y+=64)g.fillRect(Math.round(W/2)-1,Math.round(y),2,30);
  g.fillStyle='#6a6a6a';g.fillRect(rx+4,0,1,H_);g.fillRect(rx+Math.round(5.2*PPM)-5,0,1,H_);
  const base=H_*.72;
  for(const tr of trees){let z=((tr.z-cz)%88+88)%88-70;const Y=base+z*PPM*-1*-1;const y=base-(-z)*PPM;const yy=base+((tr.z-st.carZ)%88+88)%88*PPM-60*PPM*.0;
    const sy=(((tr.z-st.carZ)*-PPM)%(88*PPM)+88*PPM)%(88*PPM)-30*PPM;drawSpr(tr.k<.5?'pine_0':'pine_o1',W/2+tr.x*PPM,base-sy+120);}
  if(st.deerZ>-100){const dy=base-(st.deerZ-st.carZ)*-PPM*-1;drawSpr('deer',W/2+20,base-(st.carZ-st.deerZ)*PPM*-1+60);}
  if(st.figZ>-900){const fy=base+(st.figZ-st.carZ)*PPM;drawSpr('hollow',W/2+6,fy+40,'walk','S',0,{scale:2});g.fillStyle='#ff2a14';g.fillRect(Math.round(W/2)+1,Math.round(fy+40-94),2,2);g.fillRect(Math.round(W/2)+9,Math.round(fy+40-94),2,2);}
  if(st.mirror>0){st.mirror-=1/60;const my=base+150;drawSpr('hollow',W/2,my,'spellcast','N',3,{scale:2,alpha:Math.min(1,st.mirror)});}
  g.save();g.translate(Math.round(W/2+st.carX*PPM),Math.round(base));g.rotate(-st.yaw);drawSpr('car_wreck',0,70);g.restore();
  // darkness + headlights + taillights
  lctx.globalCompositeOperation='source-over';lctx.fillStyle='rgb(14,16,34)';lctx.fillRect(0,0,W,H_);lctx.globalCompositeOperation='lighter';
  const hx=W/2+st.carX*PPM;coneAt(hx,base-60,-Math.PI/2-st.yaw,.42,11*PPM,[255,240,200],.95);glowAt(hx,base-40,60,[255,230,190],.4);glowAt(hx,base+60,40,[255,30,20],.6);
  if(st.mirror>0)glowAt(W/2,base+90,90,[255,30,20],.7*Math.min(1,st.mirror));
  g.globalCompositeOperation='multiply';g.drawImage(lightC,0,0);g.globalCompositeOperation='source-over';
  g.strokeStyle='rgba(170,190,220,.35)';g.beginPath();for(let i=0;i<110;i++){const x=(hash(i,1)*W+t*30)%W,y=(hash(i,2)*H_+t*700)%H_;g.moveTo(Math.round(x),Math.round(y));g.lineTo(Math.round(x-2),Math.round(y+8));}g.stroke();
  if(!vig||vig.w!==VW||vig.h!==VH)makeVig();g.drawImage(vig.c,0,0);}
function finishIntro(){endCine();S.mode='play';S.hour=6.3;H.vis=false;H.state='gone';H.timer=6;P.x=-58.6;P.z=-6.4;P.dir='E';P.fx=1;P.fz=0;
  $('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;toast('Day 1. Dawn. Your car is wrapped around the oak. The farm is east.',4);}
function escapeCine(){S.mode='cine';$('skip').hidden=false;$('buttons').hidden=true;SFX.engineStart();SFX.engine(true);const st={t:0,x:carPos.x,loops:0};
  cine={hidePlayer:true,cam:{x:st.x,z:-6},custom:null,update(dt){st.t+=dt;st.x-=dt*14;cine.cam.x=st.x;cine.cam.z=-6;
    if(st.x<-74){st.loops++;st.x=-14;fade(.8);setTimeout(()=>fade(0),300);sub(st.loops===1?'The farm sign goes by. Again.':'HOLLOW ACRE. E. Marsh, prop. 32 marks now.');SFX.whisper(0);}
    if(st.loops>=2&&st.x<-20&&!st.end){st.end=1;SFX.engine(false);fade(1);setTimeout(()=>{endCine();S.looped=true;S.mode='play';P.x=farmSignPos.x+1;P.z=farmSignPos.z+1.4;$('buttons').hidden=false;fade(0);
      toast('The engine dies in front of the farm sign. There is no road out of Marrow Hollow.',4,true);},1000);}},
    draw(){const X=sx(st.x),Y=sz(-6);ctx2.save();ctx2.translate(Math.round(X),Math.round(Y));ctx2.rotate(-Math.PI/2);drawSpr('car_wreck',0,70);ctx2.restore();}};
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
