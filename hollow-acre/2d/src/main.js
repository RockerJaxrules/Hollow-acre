/* ================= render + main loop ================= */
const FPS_CLIP={walk:[1,8,13],run:[1,8,18],idle:[0,3,3],thrust:[0,7,0],slash:[0,5,0],hurt:[0,5,10],spellcast:[0,6,8],sit:[0,2,2]};
function frameOf(name,clip,t,dur){const m=SPR[name];if(!m||!m.clips)return 0;const c=m.clips[clip]||m.clips.idle;if(!c)return 0;const nf=(c.S||Object.values(c)[0])[1];
  const f=FPS_CLIP[clip]||[0,nf-1,8];const a=f[0],b=Math.min(f[1],nf-1);
  if(dur)return a+Math.min(b-a,Math.floor(clamp(t/dur,0,.999)*(b-a+1)));
  if(clip==='idle')return Math.floor(t*f[2])%nf;return a+Math.floor(t*f[2])%(b-a+1);}
function charSprite(e,name){const clip=e.clip||'idle';return [name,clip];}
// shadows: light from the upper left, so everything that stands up throws its shadow down and to the right
function castShadow(o,X,Y){if(sunShadow(o,X,Y)){if(o.kind==='tree'||o.kind==='pine'){ctx2.fillStyle='rgba(8,16,6,.22)';ctx2.beginPath();ctx2.ellipse(X+2,Y+1,9,3,0,0,Math.PI*2);ctx2.fill();}return;}const m=SPR[o.spr];if(!m||o.kind==='fence'||o.kind==='furn'||o.kind==='anim'||o.spr.startsWith('maple')||o.kind==='bush')return;ctx2.fillStyle='rgba(8,16,6,.32)';
  if(o.kind==='bld'){const f=m.foot||[-3,0,3,0];const x0=X+f[0]*PPM,x1=X+f[2]*PPM,h=Math.min(64,m.fh*.42),d=h*.55;
    ctx2.beginPath();ctx2.moveTo(x1,Y-h);ctx2.lineTo(x1+d,Y-h+d*.8);ctx2.lineTo(x1+d,Y+5);ctx2.lineTo(x0+10,Y+5);ctx2.lineTo(x0,Y);ctx2.lineTo(x1,Y);ctx2.closePath();ctx2.fill();return;}
  if(o.kind==='tree'||o.kind==='pine'){ctx2.beginPath();ctx2.ellipse(X+8,Y+2,o.kind==='pine'?17:22,7,0,0,Math.PI*2);ctx2.fill();return;}
  const w=Math.max(5,Math.min(26,m.fw*.42));ctx2.beginPath();ctx2.ellipse(X+w*.35,Y+1,w,w*.32,0,0,Math.PI*2);ctx2.fill();}
function shadow(x,y,w){ctx2.fillStyle='rgba(10,14,8,.32)';ctx2.beginPath();ctx2.ellipse(x,y,w,w*.38,0,0,Math.PI*2);ctx2.fill();}
let nightK=0,camT={x:0,z:0},titleT=0;
function render(dt,now){const t=now/1000;
  const amb=ambient(S.hour);nightK=clamp((S.hour-18.4)/1.8,0,1);if(S.hour<6.6)nightK=Math.max(nightK,clamp((6.6-S.hour)/1.6,0,1));if(S.room==='mine')nightK=1;nightAmt=nightK;
  // camera
  let fx=P.x,fz=P.z-.6;if(S.room){const R=ROOMS[S.room];const hw=VW/PPM/2,hh=VH/PPM/2;fx=R.w+.8<hw*2?R.ox+R.w/2:clamp(P.x,R.ox+hw-.4,R.ox+R.w-hw+.4);fz=R.d+3.5<hh*2?R.oz+R.d/2-.5:clamp(P.z-.6,R.oz-3+hh*1.12,R.oz+R.d+.6-hh*.88);}if(S.mode==='title'){fx=Math.sin(t*.05)*8;fz=-4+Math.cos(t*.04)*4;}
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
  interiorGround();
  // build one neighbouring chunk per frame ahead of time so walking never waits on ground generation
  {let done=false;for(let cz=r0-1;cz<=r1+1&&!done;cz++)for(let cx=c0-1;cx<=c1+1&&!done;cx++)if(!chunks.has(cx+','+cz)){chunk(cx,cz);done=true;}}
  // water shimmer
  if(onScreen(pond.x,pond.z,260))for(let i=0;i<26;i++){const a=hash(i,7)*6.28,r=hash(i,9)*pond.r*.85;const x=pond.x+Math.cos(a)*r,z=pond.z+Math.sin(a)*r*.9;
    const k=(Math.sin(t*1.7+i)+1)/2;if(k>.6){ctx2.fillStyle=`rgba(200,230,240,${(k-.6)*1.6})`;ctx2.fillRect(Math.round(sx(x)),Math.round(sz(z)),4,1);}}
  // tilled soil (dual grid autotile) + wet darkening
  // tilled soil: dug into the ground, not sitting on it. A darker patch with ragged edges, the shade of the bank along its top inside edge,
  // a faint lighter crumb rim on the bottom edge, shallow furrows across it and loose clods. Watered soil is darker and a little glossy.
  {const T=(i,j)=>{const t_=tileAt(i,j);return !!(t_&&t_.tilled);};
   for(const tl of tiles){if(!tl.tilled)continue;const X=Math.round(sx(tl.x-.5)),Y=Math.round(sz(tl.z-.5));if(X<-40||X>VW+40||Y<-40||Y>VH+40)continue;
     const wet=(tl.crop&&tl.crop.watered)||tl.wet;const up=T(tl.i,tl.j-1),dn=T(tl.i,tl.j+1),lf=T(tl.i-1,tl.j),rt=T(tl.i+1,tl.j);
     const base=wet?[74,46,30]:[112,74,46],dark=wet?[52,32,20]:[84,54,32],light=wet?[96,64,42]:[140,98,62];
     const rgb=c=>`rgb(${c[0]},${c[1]},${c[2]})`;
     // ragged edge: each side eats 0-2 px in or out, decided per pixel so neighbouring tiles stay seamless
     for(let y=0;y<32;y++)for(let x=0;x<32;x++){const wx=tl.i*32+x,wy=tl.j*32+y;const e=(hash(wx,wy*3)*3)|0;
       if(!up&&y<e)continue;if(!dn&&y>31-e)continue;if(!lf&&x<e)continue;if(!rt&&x>31-e)continue;
       let c=base;const n=hash(wx>>1,wy>>1);if(n>.82)c=light;else if(n<.18)c=dark;
       const fy=(wy+((wx>>3)&1))%11;if(fy===0)c=dark;else if(fy===1)c=[c[0]*.92,c[1]*.92,c[2]*.92];else if(fy===2)c=light;
       if(!up&&y<e+4)c=[c[0]*(.62+.09*(y-e)),c[1]*(.62+.09*(y-e)),c[2]*(.62+.09*(y-e))];   // the bank above shades the dug soil
       if(!lf&&x<e+2)c=[c[0]*.82,c[1]*.82,c[2]*.82];
       if(!dn&&y>31-e-2)c=[Math.min(255,c[0]*1.12+8),Math.min(255,c[1]*1.1+6),Math.min(255,c[2]*1.08+4)];  // the lip you dug up, catching light
       ctx2.fillStyle=rgb(c);ctx2.fillRect(X+x,Y+y,1,1);}
     // a few loose clods with a lit top and a dark underside
     for(let k=0;k<4;k++){const h=hash(tl.i*13+k,tl.j*7+k*3);const cx=X+3+((h*97)%26|0),cy=Y+4+((h*61)%23|0);ctx2.fillStyle=rgb(light);ctx2.fillRect(cx,cy,2,1);ctx2.fillStyle=rgb(dark);ctx2.fillRect(cx,cy+1,2,1);}
     if(wet&&((tl.i+tl.j)&1)){ctx2.fillStyle='rgba(180,200,220,.18)';ctx2.fillRect(X+8,Y+12,3,1);ctx2.fillRect(X+20,Y+22,2,1);}}}
  if(hlTile&&S.mode==='play'){{const X=Math.round(sx(hlTile.x-.5)),Y=Math.round(sz(hlTile.z-.5));ctx2.strokeStyle='rgba(0,0,0,.35)';ctx2.lineWidth=1;ctx2.strokeRect(X+1.5,Y+1.5,29,29);ctx2.strokeStyle=TAP.hlCol||'rgba(255,240,200,.75)';ctx2.strokeRect(X+.5,Y+.5,31,31);ctx2.fillStyle=TAP.hlCol||'rgba(255,240,200,.75)';for(const [a,b] of [[0,0],[28,0],[0,28],[28,28]]){ctx2.fillRect(X+a,Y+b,4,1);ctx2.fillRect(X+a+(a?3:0),Y+b,1,4);ctx2.fillRect(X+a,Y+b+(b?3:0),4,1);}}}
  // skid marks & blood at the crash site
  if(!S.introDrive&&onScreen(-56,-5,200)){ctx2.fillStyle='rgba(0,0,0,.3)';for(let k=0;k<2;k++){ctx2.save();ctx2.translate(sx(-58.6+k*.9),sz(-1.6+k*.25));ctx2.rotate(.42);ctx2.fillRect(-200,0,200,3);ctx2.restore();}}
  mindGround();findsDraw(t);farmDraw();depthWater(t);mindReflection();
  // collect drawables
  const D=[];const pad=200;sunBegin();
  for(const o of OBJ){if(o.hide)continue;const X=sx(o.x),Y=sz(o.z);if(X<-pad||X>VW+pad||Y<-60||Y>VH+pad+260)continue;
    if(o.kind==='deco'){drawSpr('leaves_'+o.v,X,Y);continue;}if(o.kind==='flat'){drawSpr(o.spr,X,Y);continue;}castShadow(o,X,Y);D.push({z:o.z,o});}
  sunEnd();
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
  if(cine&&cine.drawables)cine.drawables(D);mineDrawables(D);mindDrawables(D);mindWatcherDraw(D);lifeDrawables(D,t);D.sort((a,b)=>a.z-b.z);
  for(const d of D){
    if(d.o){const o=d.o;const X=sx(o.x),Y=sz(o.z);let a;if(o.kind==='anim'){drawSpr(o.spr,X,Y-(o.yoff||0),'a','S',Math.floor(t*o.fps+(o.ph||0)+(o.grass?Math.sin(t*.7+o.x*.15)*1.2:0)));continue;}
      if((o.kind==='tree'||o.kind==='pine'||o.kind==='bld')&&P.z<o.z-.2){const m=SPR[o.spr];if(m){const px=sx(P.x),py=sz(P.z)-30;const f=m.foot||[0,0,0,0];const x0=o.kind==='bld'?X+f[0]*PPM:X-m.fw*.35,x1=o.kind==='bld'?X+f[2]*PPM:X+m.fw*.35;if(px>x0&&px<x1&&py>Y-m.ay&&py<Y&&P.z>o.z-(o.kind==='bld'?8:4))a=.55;}}
      if(o.spr==='cbridge'&&Math.abs(P.x-o.x)<4.6&&P.z<o.z&&P.z>o.z-6.6)a=.16;
      if(o.clipw&&o.clipw<1.99){const m=SPR[o.spr],im=IMG[m.src];if(im){const w=Math.round(o.clipw*PPM),dx=Math.round(X-m.ax),dy=Math.round(Y-m.ay);ctx2.drawImage(im,0,0,w,m.fh,dx,dy,w,m.fh);ctx2.drawImage(im,m.fw-9,0,9,m.fh,dx+w-1,dy,9,m.fh);}}
      else if(o.tilt){ctx2.save();ctx2.translate(Math.round(X),Math.round(Y));ctx2.rotate(o.tilt);drawSpr(o.spr,0,0,null,null,0,{alpha:a});ctx2.restore();}
      else drawSpr(o.spr,X,Y,null,null,0,{alpha:a,flip:o.flip});
      if(o.notch){const w=o.trunkW||6,side=o.notchSide||1,nx=Math.round(X+side*w),ny=Math.round(Y-12);const dpt=Math.min(w-1,1+o.notch*1.4)|0;
        for(let j=-2-o.notch;j<=2+o.notch;j++){const k=dpt-Math.abs(j);for(let i=0;i<k;i++){ctx2.fillStyle=i===k-1?'#d8b478':'#3a2414';ctx2.fillRect(nx-side*i-(side<0?1:0),ny+j,1,1);}}
        ctx2.fillStyle='#e8c88a';ctx2.fillRect(nx-side*(dpt-1),ny-1,1,3);}
      if(o.night&&SPR[o.night]&&nightK>0)drawSpr(o.night,X,Y,null,null,0,{alpha:(a||1)*nightK});
      if(o.kind==='bld'){const h=HOUSES.find(q=>q.e===o);if(h&&h.faceT>0){const w=(h.w||6)/2;const fx=Math.round(X-w*PPM+48),fy=Math.round(Y-74);ctx2.fillStyle='#d8d4c8';ctx2.fillRect(fx,fy,8,10);ctx2.fillStyle='#000';ctx2.fillRect(fx+1,fy+3,2,2);ctx2.fillRect(fx+5,fy+3,2,2);ctx2.fillRect(fx+2,fy+7,4,2);}}}
    else if(d.crop){const tl=d.crop,c=tl.crop;const nm=c.type+'_'+c.stage;const s=c.pop<1?.6+.4*c.pop:1;if(c.stage>0)shadow(sx(tl.x)+2,sz(tl.z+.2),4+c.stage*2);drawSpr(nm,sx(tl.x),sz(tl.z+.2),null,null,0,{scale:s});mindCropOver(tl,sx(tl.x),sz(tl.z+.2));}
    else if(d.npc){const n=d.npc;const X=sx(n.x),Y=sz(n.z);const m=SPR[n.def.id];const ncl=n.clip==='walk'?'walk':(m&&m.clips&&m.clips.idle&&n.clip!=='stand')?'idle':'walk';const nf=ncl==='walk'?frameOf(n.def.id,'walk',n.t):ncl==='idle'?frameOf(n.def.id,'idle',performance.now()/1000+(n.def.id.length*.37)):0;n._fr=[n.def.id,ncl,n.dir||'S',nf];footShadow(n._fr,X,Y);drawSpr(n.def.id,X,Y,ncl,n.dir,nf);mindNPCOver(n,X,Y);
      if(n.clip==='stand'&&S.day>=2&&nightK>.5){ctx2.fillStyle='#ff2a14';const ey=Math.round(Y-35);ctx2.fillRect(Math.round(X)-3,ey,1,1);ctx2.fillRect(Math.round(X)+2,ey,1,1);}}
    else if(d.player){const X=sx(P.x),Y=sz(P.z);let nm='farmer',clip=P.clip,f;
      if(P.anim){const a=P.anim;if(a.clip==='hoe'||a.clip==='pick'||a.clip==='axe'){nm='farmer_'+a.clip;clip='thrust';}else if(a.clip==='water'){nm='farmer_can';clip='thrust';}else clip='slash';f=frameOf(nm,clip,a.t,a.dur);
        if(a.clip==='hoe'||a.clip==='pick'||a.clip==='axe'){const k=a.t/a.dur,TH=[.08,.2,.34,.48,.55,.74,.86];f=TH.findIndex(v=>k<v);if(f<0)f=7;}}
      else{if(clip==='walk'&&P.spd>3.6&&SPR[nm].clips.run)clip='run';if(clip==='idle'){if(SPR[nm].clips.idle)f=frameOf(nm,'idle',performance.now()/1000);else{clip='walk';f=0;}}else f=frameOf(nm,clip,P.t);}
      // the rod comes out whenever a line is in the water
      if(!P.anim&&S.mode!=='scare'&&typeof rodFrame==='function'){const rf=rodFrame();if(rf>=0){nm='farmer_rod';clip='thrust';f=rf;}}
      if(S.mode==='scare')clip='hurt';P._fr=[nm,clip,clip==='hurt'?'S':P.dir,f||0];footShadow(P._fr,X,Y);
      const tm=clip==='thrust'&&SPR[nm]&&SPR[nm].tool?SPR[nm]:null;const ox=tm?Math.round(X-tm.ax):0,oy=tm?Math.round(Y-tm.ay):0;let tip=null;
      // water from the can lands on the square you're watering
      const pour=tm&&tm.toolKind==='can'&&f>=3&&f<=6;const wto=pour?(()=>{const a=P.anim,tg=a&&a.tgt;const wx=tg?tg.x:P.x+P.fx*.9,wz=tg?tg.z:P.z+P.fz*.9+.1;return P.dir==='N'?[sx(wx)+9,sz(wz)+12]:[sx(wx),sz(wz)+4];})():null;
      if(tm){tip=toolOverlay(ctx2,nm,P.dir,f|0,ox,oy,'back')||tip;if(tip&&pour)waterStream(ctx2,tip,wto,t);}
      drawSpr(nm,X,Y,clip,clip==='hurt'?'S':P.dir,clip==='hurt'?Math.min(5,Math.floor((performance.now()/120)%6)):f);
      if(typeof lanternDraw==='function')lanternDraw(ctx2,clip,t);
      if(tm){const t2=toolOverlay(ctx2,nm,P.dir,f|0,ox,oy,'front');if(t2){tip=t2;if(pour)waterStream(ctx2,tip,wto,t);}fistOverlay(ctx2,nm,P.dir,f|0,ox,oy);}
      if(fish.state!=='off'){const from=tip&&tm&&tm.toolKind==='rod'?tip:[X+8,Y-36];fishLine(ctx2,from,[sx(fish.bx),sz(fish.bz)],fish.state==='bite'||(typeof MG!=='undefined'&&MG.on),t);
        ctx2.fillStyle=fish.state==='bite'?'#ff4030':'#e83020';ctx2.fillRect(Math.round(sx(fish.bx))-1,Math.round(sz(fish.bz))-1+(fish.state==='bite'?Math.round(Math.sin(t*30)):0),3,3);ctx2.fillStyle='#f4f0e8';ctx2.fillRect(Math.round(sx(fish.bx))-1,Math.round(sz(fish.bz))-2+(fish.state==='bite'?Math.round(Math.sin(t*30)):0),3,1);}}
    else if(d.hollow){const X=sx(H.x),Y=sz(H.z);const clip=H.clip==='walk'||H.clip==='crawl'||H.clip==='idle'?'walk':H.clip==='scream'||H.clip==='lunge'?'spellcast':'hurt';
      const f=clip==='hurt'?(Math.random()<.3?1:0):H.clip==='idle'?0:frameOf('hollow',clip,H.ft*(H.clip==='crawl'?1.6:1));
      const jit=H.clip==='frozen'?(Math.random()-.5)*2:0;const rise=(1-H.rise)*40;
      ctx2.save();ctx2.beginPath();ctx2.rect(0,0,VW,Math.round(Y));ctx2.clip();
      shadow(X,Y,16);drawSpr('hollow',X+jit,Y+rise+(H.clip==='crawl'?18:0),clip,clip==='hurt'?'S':H.dir,f,{scale:H.clip==='crawl'?.8:1,alpha:H.alpha});ctx2.restore();
      const ey=Y+rise-(H.clip==='crawl'?57:94);const fl=.7+Math.random()*.3;ctx2.fillStyle=`rgba(255,40,20,${fl*H.alpha})`;
      if(H.dir!=='N'){ctx2.fillRect(Math.round(X)-5,Math.round(ey),2,2);ctx2.fillRect(Math.round(X)+3,Math.round(ey),2,2);}}
    else if(d.ruth){const X=sx(ruth.x),Y=sz(ruth.z);drawSpr('ruth',X,Y,'walk',ruth.dir,0,{alpha:.45+Math.random()*.15});}
    else if(d.cat){drawSpr('cat',sx(cat.x),sz(cat.z),cat.clip,cat.dir,frameOf('cat',cat.clip,cat.t));}
    else if(d.scare){const X=sx(scare.x),Y=sz(scare.z);shadow(X,Y,8);ctx2.fillStyle='#4a3020';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-70,3,70);ctx2.fillRect(Math.round(X)-22,Math.round(Y)-56,45,3);drawSpr('hollow',X,Y-6,'walk','S',0,{scale:.62});}
    else if(d.mush){drawSpr('mushroom',sx(d.mush.x),sz(d.mush.z));}
    else if(d.page){const X=Math.round(sx(d.page.x)),Y=Math.round(sz(d.page.z));const fl=Math.round(Math.sin(t*3+d.page.i)*1);
      ctx2.fillStyle='rgba(8,16,6,.3)';ctx2.fillRect(X-6,Y-1,14,3);ctx2.fillStyle='#d8ccb0';ctx2.fillRect(X-6,Y-7+fl,12,7-fl);ctx2.fillStyle='#efe6d0';ctx2.fillRect(X-6,Y-8+fl,11,6-fl);
      ctx2.fillStyle='#8a7a5a';for(let k=0;k<3;k++)ctx2.fillRect(X-4,Y-6+fl+k*2,7-k,1);ctx2.fillStyle='#6a6670';ctx2.fillRect(X+2,Y-4,5,4);ctx2.fillStyle='#9a96a0';ctx2.fillRect(X+3,Y-4,3,1);}
    else if(d.altar){const a=d.altar,X=sx(a.x),Y=sz(a.z);drawSpr('grave_0',X,Y);if(a.lit){ctx2.fillStyle=Math.random()<.5?'#ffd060':'#ff9a30';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-40,3,4);}else{ctx2.fillStyle='#2a2220';ctx2.fillRect(Math.round(X)-1,Math.round(Y)-37,3,3);}}
    else if(d.peddler){const X=sx(crossPos.x+.6),Y=sz(crossPos.z+2.6);shadow(X,Y,9);drawSpr('hale',X,Y,'idle','S',0,{alpha:.0});ctx2.fillStyle='#120e16';ctx2.beginPath();ctx2.moveTo(X-11,Y);ctx2.lineTo(X+11,Y);ctx2.lineTo(X+6,Y-40);ctx2.lineTo(X,Y-50);ctx2.lineTo(X-6,Y-40);ctx2.closePath();ctx2.fill();
      ctx2.fillStyle='#ffd25a';ctx2.fillRect(Math.round(X)-3,Math.round(Y)-42,1,1);ctx2.fillRect(Math.round(X)+2,Math.round(Y)-42,1,1);ctx2.fillStyle='#6aff90';ctx2.fillRect(Math.round(X)+10,Math.round(Y)-24,4,5);}
    else if(d.ghost){drawSpr('hollow',sx(d.ghost.x),sz(d.ghost.z),'walk','S',0,{alpha:d.ghost.t*2});}
    else if(d.mind){d.draw();}
    else if(d.hat){drawSpr('pumpkin',sx(ritual.hat.x),sz(ritual.hat.z));}
  }
  partsDraw();holdDraw();lifeOver(t);depthOver(t);leavesDraw();placeDraw();
  // weather: falling leaves (day), rain (storm), fog (night)

  if(S.storm&&isNight()&&!S.room){ctx2.strokeStyle='rgba(170,190,220,.35)';ctx2.beginPath();for(let i=0;i<90;i++){const x=(hash(i,1)*VW+t*40)%VW,y=(hash(i,2)*VH+t*620)%VH;ctx2.moveTo(Math.round(x),Math.round(y));ctx2.lineTo(Math.round(x-2),Math.round(y+7));}ctx2.stroke();}
  if(nightK>0&&fogTex&&!S.room){ctx2.globalAlpha=nightK*.55;const ox=Math.round((-(cam.px*.7)+t*6)%256),oy=Math.round((-(cam.pz*.7))%256);for(let y=oy-256;y<VH;y+=256)for(let x=ox-256;x<VW;x+=256)ctx2.drawImage(fogTex,Math.round(x),Math.round(y));ctx2.globalAlpha=1;}
  // ---- light map (multiply)
  lctx.globalCompositeOperation='source-over';lctx.fillStyle=`rgb(${amb[0]|0},${amb[1]|0},${amb[2]|0})`;lctx.fillRect(0,0,VW,VH);
  if(nightK>.02){lctx.globalCompositeOperation='lighter';const L=nightK;const fl=.95+.05*Math.sin(t*5.3);
    for(const h of HOUSES){if(!h.lit)continue;const X=sx(h.x),Y=sz(h.z)-40;if(X<-200||X>VW+200||Y<-200||Y>VH+200)continue;glowAt(X,Y+20,120,[255,170,80],.45*L);
      const m=SPR[h.e.spr];const wy=Y-(m&&m.fh>200?40:24);for(const dx of [-(h.w/2-1.5),h.w/2-1.5])glowAt(X+dx*PPM,wy,34,[255,190,110],.85*L);}
    for(const lp of lamps){if(lp.dead&&Math.sin(t*9+lp.ph)>.2)continue;const X=sx(lp.x),Y=sz(lp.z)-66;if(X<-150||X>VW+150||Y<-150||Y>VH+150)continue;glowAt(X,Y+50,100,[255,180,90],.75*L*fl);glowAt(X,Y,16,[255,230,170],.9*L);}
    for(const o of OBJ){if(!o.glow)continue;const X=sx(o.x),Y=sz(o.z)-8;if(X<-60||X>VW+60||Y<-60||Y>VH+60)continue;glowAt(X,Y,30,[255,140,40],.6*L*fl);}
    for(const a of altars)if(a.lit){glowAt(sx(a.x),sz(a.z)-36,120,[255,150,60],.8*fl);}
    for(const m of mushrooms)if(!m.taken)glowAt(sx(m.x),sz(m.z)-6,26,[90,255,200],.55*L);
    if(S.hour>=19.5&&!S.bound)glowAt(sx(crossPos.x+.6)+12,sz(crossPos.z+2.6)-22,46,[110,255,150],.7*L);
    if(phone.ring&&Math.sin(t*20)>0)glowAt(sx(boothPos.x),sz(boothPos.z),60,[200,230,255],.7);
    // the player's lantern: a round, warm pool of light that flickers with the flame (no beam; it's a lantern, not a torch)
    if(S.mode!=='title'){const on=lanternOn()?1:0;const sput=sputT>0?(Math.random()<.5?.15:.6):1;const fuel=S.fuel<15?(.6+.4*Math.random()):1;const k=L*sput*fuel*(on?1:.12);
      const lp=lanternPos();const fk=lanternFlicker(t);const R=(S.flashlight?11:8.5)*PPM*(.97+.03*fk);
      // the pool sits on the ground under the lantern, leaning a little the way you face
      lanternPool(lp.gx+P.fx*.6*PPM,lp.gy+P.fz*.5*PPM,R,[255,186,104],.95*k*(.92+.08*fk));
      // the hood throws a soft lobe forward, still round-edged
      if(S.flashlight)lanternPool(lp.gx+P.fx*3*PPM,lp.gy+P.fz*2.4*PPM,4.2*PPM,[255,206,140],.42*k);
      // the flame and the glass
      glowAt(lp.x,lp.y,18+2*fk,[255,232,170],.95*k);glowAt(lp.x,lp.y,46,[255,170,80],.55*k*(.85+.15*fk));}
    lifeLight(t,L);if(cine&&cine.light)cine.light(L);interiorLight(L);
    if(H.vis&&H.dir!=='N'){glowAt(sx(H.x),sz(H.z)-94,10,[255,40,20],.9*H.alpha);}
    for(const g of ghosts)if(g.t>0)glowAt(sx(g.x),sz(g.z)-94,8,[255,40,20],g.t*2);}
  if(flashT>0){lctx.globalCompositeOperation='lighter';lctx.fillStyle=`rgba(210,220,255,${clamp(flashT,0,1)})`;lctx.fillRect(0,0,VW,VH);}
  ctx2.globalCompositeOperation='multiply';ctx2.drawImage(lightC,0,0);ctx2.globalCompositeOperation='source-over';
  // vignette + danger pulse + grain
  if(!vig||vig.w!==VW||vig.h!==VH)makeVig();ctx2.drawImage(vig.c,0,0);
  if(danger>.3&&!S.bound){ctx2.fillStyle=`rgba(120,0,0,${(danger-.3)*.25*(.6+.4*Math.sin(t*6))})`;ctx2.fillRect(0,0,VW,VH);}
  mindScreen(t);
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
  // the drive happens on the real Route 9, in the real valley: east toward the farm, until the oak at the crash site
  const TC=15.2,XS=-69.3,LANE=-4.75,HIT={x:-60.4,z:.5},V=9;
  const carAt=T=>T<TC?{x:XS-V*(TC-T),z:LANE,yaw:0}:(()=>{const k=Math.min(1,(T-TC)/1.8),e=k*k*(3-2*k);return {x:lerp(XS,HIT.x,Math.min(1,k*1.15)),z:lerp(LANE,HIT.z,e),yaw:Math.min(.9,k*1.25)};})();
  const wreck=OBJ.filter(o=>o.kind==='wreck');for(const o of wreck)o.hide=true;
  for(const n of npcs)n.vis=false;H.vis=false;S.storm=true;S.hour=23.8;S.introDrive=true;fade(1);
  const st={t:0,done:{},car:carAt(3),deer:null,fig:null,mir:0,crashed:false};const once=k=>st.done[k]?false:(st.done[k]=true);
  sub('Route 9. 11:48 PM. Rain since the county line.');
  cine={hidePlayer:true,cam:{x:st.car.x+4.6,z:-6.2},
    drawables(D){const T=st.t;
      if(!st.crashed)D.push({z:st.car.z+.2,mind:1,draw(){const f=Math.max(0,Math.min(6,Math.round(st.car.yaw/.15)));drawSpr('car_east',sx(st.car.x),sz(st.car.z)+(T>11.55&&T<11.75?-2:0),'yaw','S',f);}});
      if(st.deer)D.push({z:st.deer.z,mind:1,draw(){drawSpr('deer_dead',sx(st.deer.x),sz(st.deer.z));}});
      if(st.fig)D.push({z:st.fig.z,mind:1,draw(){drawSpr('hollow',sx(st.fig.x),sz(st.fig.z),'walk',st.fig.dir,0,{alpha:st.fig.a});}});},
    light(L){glowAt(VW*.5,VH*.45,Math.max(VW,VH)*.7,[34,40,62],.55);if(st.crashed){DX.carLamp=null;return;}const c=st.car,X=sx(c.x),Y=sz(c.z)-12,a=c.yaw,cs=Math.cos(a),sn=Math.sin(a);DX.carLamp={x:X+2.3*cs*PPM,y:Y+2.3*sn*PPM*.8+12};
      for(const s of [-.55,.55]){const hx=X+(2.1*cs-s*sn)*PPM,hy=Y+(2.1*sn+s*cs)*PPM*.8;coneAt(hx,hy,a,.28,13*PPM,[255,238,196],.8);glowAt(hx,hy,10,[255,240,210],.9);}
      glowAt(X-2.2*cs*PPM,Y-2.2*sn*PPM,40,[255,26,16],st.mir>0?.95:.55);glowAt(X,Y,70,[120,110,100],.3);
      if(st.fig&&st.fig.a>.5){const fx=sx(st.fig.x),fy=sz(st.fig.z)-94;glowAt(fx-4,fy,5,[255,40,20],1);glowAt(fx+6,fy,5,[255,40,20],1);}},
    update(dt){st.t+=dt;const T=st.t;if(cine.phase2)return phase2(dt);
      if(T<17)st.car=carAt(Math.max(3,T));cine.cam.x=lerp(cine.cam.x,st.car.x+(T<TC?4.6:0),1-Math.exp(-dt*(T<3.2?50:6)));cine.cam.z=lerp(cine.cam.z,T<TC?-6.2:-3,1-Math.exp(-dt*3));
      if(T>3&&once('a0'))fade(0);
      if(T>4&&once('b'))sub('Voicemail from Grandpa Elias. Three days old.');
      if(T>7.2&&once('c'))sub('"…it already picked you. I’m sorry, kid. Come quick, before the thirty-first."');
      if(T>9.4&&once('lt')){flashT=1;SFX.thud(0,.9);cam.shake=.15;st.fig={x:st.car.x+7,z:-12.6,dir:'S',a:1};}
      if(T>9.4&&T<10.2&&st.fig)st.fig.a=flashT>.5?1:0;if(T>10.2&&once('lt2'))st.fig=null;
      if(T>10.5&&once('d')){st.deer={x:XS-V*(TC-11.6),z:LANE+.1};sub('');}
      if(T>11.6&&once('e')){SFX.thud(0,.5);cam.shake=.25;sub('Something was lying in the road.');}
      if(T>12.8&&once('f')){st.mir=1.4;SFX.stinger();sub('Something in the mirror.');}
      if(st.mir>0){st.mir-=dt;st.fig={x:st.car.x-5.5,z:LANE-.3,dir:'E',a:Math.min(1,st.mir)};if(st.mir<=0)st.fig=null;}
      if(T>14.2&&once('g')){sub('Nothing. There’s nothing there.');st.fig={x:XS+4.2,z:LANE,dir:'W',a:1};}
      if(T>15.2&&once('h')){SFX.shriek(0);SFX.horn();}
      if(T>15.6&&once('h2'))st.fig=null;if(T>16.2&&once('i'))SFX.screech();
      if(T>17&&once('j')){SFX.crash();cam.shake=1;flashT=1;SFX.engine(false);sub('');st.crashed=true;for(const o of wreck)o.hide=false;burst(HIT.x,HIT.z,26,'#9a9690',2.4,1.4,4);}
      if(T>17.35&&once('k0'))fade(1);
      if(T>19&&once('k')){SFX.heart(.6);sub('Rain on your face. Blood in your mouth.');}
      if(T>21.5&&once('l')){cine.phase2=true;cine.hidePlayer=false;S.hour=4.6;P.x=-58.6;P.z=-4.2;P.dir='S';P.fx=-.3;P.fz=1;H.vis=true;H.x=carPos.x-.6;H.z=carPos.z+1.6;H.state='cutscene';H.clip='crawl';H.dir='W';H.alpha=1;H.rise=1;H.ft=0;
        cine.cam={x:-59.5,z:-2.6};cine.drawables=null;cine.light=()=>{glowAt(sx(carPos.x-.4),sz(carPos.z+1.2)-20,90,[255,200,140],.45);glowAt(VW*.5,VH*.45,Math.max(VW,VH)*.7,[34,40,62],.5);};sub('Something climbs off the hood.');SFX.breath(0);fade(0);}}};
  SFX.engine(true);
  function phase2(dt){cine.t2=(cine.t2||0)+dt;const k=cine.t2;H.ft+=dt;
    if(k<3.5){H.x-=dt*1.1;H.z+=dt*1.6;H.dir='S';}else if(k<6){H.clip='walk';H.dir='W';H.x-=dt*2.6;H.z+=dt*1.4;}
    if(k>2.6&&!cine.s2){cine.s2=1;sub('It crawls away into the trees. It looked back at you.');SFX.whisper(0);}
    if(k>6.2&&!cine.s3){cine.s3=1;H.vis=false;H.state='gone';fade(1);setTimeout(()=>{finishIntro();fade(0);},900);}}}
function finishIntro(){endCine();fade(0);if($('creator'))$('creator').hidden=true;applyLook();for(const o of OBJ)if(o.kind==='wreck')o.hide=false;S.storm=false;S.introDrive=false;S.mode='play';S.hour=6.3;H.vis=false;H.state='gone';H.timer=6;P.x=-58.6;P.z=-6.4;P.dir='E';P.fx=1;P.fz=0;
  $('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;toast('Day 1. Dawn. Your car is wrapped around the oak. The farm is east.',4);}
function escapeCine(){S.mode='cine';$('skip').hidden=false;$('buttons').hidden=true;$('hud').hidden=true;ui.obj.hidden=true;SFX.engineStart();SFX.engine(true);
  // the car pulls out on the westbound lane of Route 9 and drives for the county line; the road loops it back past the farm sign, twice.
  // It is drawn in the world, sorted with everything else, so it goes under the covered bridge's roof and past people, not over them.
  const LANE=-7.1,V=11;const st={t:0,x:carPos.x+1.5,loops:0,bob:0};
  const moved=[];for(const n of npcs)if(n.vis&&!n.room&&Math.abs(n.z+6)<3.4&&n.x>-90&&n.x<0){moved.push([n,n.vis]);n.vis=false;}
  const wreck=OBJ.filter(o=>o.kind==='wreck');for(const o of wreck)o.hide=true;if(typeof BEATEN!=='undefined'&&BEATEN.o)BEATEN.o.hide=true;
  const done=()=>{for(const [n,v] of moved)n.vis=v;for(const o of wreck)o.hide=false;$('hud').hidden=false;ui.obj.hidden=false;if(typeof carShow==='function')setTimeout(carShow,0);};
  fade(1);setTimeout(()=>fade(0),350);
  cine={hidePlayer:true,escape:true,cam:{x:st.x-3,z:-6.4},
    drawables(D){D.push({z:LANE+.25,mind:1,draw(){const X=sx(st.x),Y=sz(LANE)+Math.round(st.bob);ctx2.fillStyle='rgba(10,8,14,.35)';ctx2.beginPath();ctx2.ellipse(X,Y+2,58,9,0,0,Math.PI*2);ctx2.fill();
      drawSpr('car_beaten',X,Y,'yaw','S',0,{flip:true});}});},
    light(L){const X=sx(st.x),Y=sz(LANE)-12;if(L>.25)for(const s2 of [-.5,.5]){const hx=X-2.1*PPM,hy=Y+s2*PPM*.8;coneAt(hx,hy,Math.PI,.28,12*PPM,[255,238,196],.8*L);glowAt(hx,hy,9,[255,240,210],.85*L);}glowAt(X+2.2*PPM,Y,36,[255,26,16],.5*Math.max(.3,L));},
    update(dt){st.t+=dt;const acc=Math.min(1,st.t/1.6);st.x-=dt*V*acc*acc;st.bob=Math.sin(st.t*22)*.6;
      cine.cam.x=lerp(cine.cam.x,st.x-3,1-Math.exp(-dt*4));cine.cam.z=lerp(cine.cam.z,-6.4,1-Math.exp(-dt*3));
      // dust and exhaust behind
      if(Math.random()<.6)parts.push({x:st.x+2.3,z:LANE+.1,y:.15,vx:1+Math.random(),vz:(Math.random()-.5)*.6,vy:.4+Math.random()*.4,t:0,life:.6,col:Math.random()<.5?'#8a7a64':'#5a5250',size:2});
      if(st.x<-76){st.loops++;st.x=-12;cine.cam.x=st.x-3;fade(.85);setTimeout(()=>fade(0),320);sub(st.loops===1?'The farm sign goes by. Again.':'HOLLOW ACRE. E. Marsh, prop. 32 marks now.');SFX.whisper(0);}
      if(st.loops>=2&&st.x<farmSignPos.x+3&&!st.end){st.end=1;SFX.engine(false);fade(1);setTimeout(()=>{done();endCine();S.looped=true;S.mode='play';P.x=farmSignPos.x+1;P.z=farmSignPos.z+1.4;$('buttons').hidden=false;fade(0);
        toast('The engine dies in front of the farm sign. There is no road out of Marrow Hollow.',4,true);},1000);}}};
  cine.finish=()=>{done();};
  sub('The highway west. The radio plays a hymn you almost know.');}
$('skip').addEventListener('click',()=>{if(!cine)return;if(cine.escape){cine.finish&&cine.finish();S.looped=true;endCine();S.mode='play';P.x=farmSignPos.x+1;P.z=farmSignPos.z+1.4;$('buttons').hidden=false;fade(0);return;}if(S.mode==='cine'&&cine.update){cine.update=null;fade(1);setTimeout(()=>{finishIntro();fade(0);},500);}});
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
  press($('btnAct'),onAct);press($('btnSeed'),()=>onSeed());$('btnTurn').hidden=true;
  const list=[...new Set(Object.values(SPR).map(m=>m.src))].concat(Object.values(TS).map(t=>t[0]));
  const lb=$('loadBar'),lt=$('loadTxt');
  loadImages([...new Set(list)],(d,n)=>{lb.style.width=(d/n*100)+'%';lt.textContent='Loading the valley… '+d+' / '+n;}).then(()=>{
    buildWorld();econBoot();buildInteriors();farmDebris();S.autoCol=autoCollide();treeChop();benchesBoot();placeScarecrow(1);spawnMushrooms();resetCat();placeNPCs();
    for(const [cx,cz] of[[-6.3,2.2],[1.2,9.4],[48,-9.6],[57,-24],[-14.5,-9]])crows.push({x:cx,z:cz,hx:cx,hz:cz,y:0,state:'perch',t:0,vx:0,vz:0});
    applyLook();S.mode='title';$('loadScr').style.opacity=0;setTimeout(()=>$('loadScr').remove(),800);requestAnimationFrame(loop);});
  $('begin').addEventListener('click',()=>{A.init&&A.init();startCine('intro');});
  window.__game={S,P,H,tiles,npcs,act:onAct,tp:(x,z)=>{P.x=x;P.z=z;},setHour:h=>{S.hour=h;},skip:()=>{finishIntro();},get M(){return M;},talk:(id)=>talk(npcById(id)),ev:(c)=>eval(c),big:(w,h)=>{VW=w;VH=h;view.width=w;view.height=h;for(const c of [lightC,fogC,fxC]){c.width=w;c.height=h;}vig=null;window.onresize=null;}};}
boot();
