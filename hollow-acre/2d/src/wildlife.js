/* ================= wildlife. The valley has animals in it now, and they behave like animals:
   deer (does, sometimes a stag) graze at the edges of things, lift their heads when you come near, flag their white tails and
   bound away if you keep coming; rabbits sit and nibble, hop, and zigzag off; red squirrels skitter about the foot of a tree,
   sit up with a nut, and run up the trunk when you get close; robins peck and hop in flocks and burst up into the air as you
   pass; mallards paddle on the pond, the lake and the river, tip up to feed, and paddle off from the bank; at dusk a fox
   trots out of the woods, sometimes sits to look at you, and is gone.
   They live around you, not everywhere: they come in out of sight and leave the same way, so the woods always feel lived in
   without the valley having to keep track of every rabbit. At night most of them are hidden. Something else is out: eyes in
   the trees that blink and aren't there when you look again, and, when your mind is going, a deer that doesn't run. It stands
   at the edge of the light, facing you, and is gone when you get close. ================= */
const WILD=[],WEYES=[];let wildT=0,wEyeT=8,wChirpT=3;
const wFar=(x,z)=>Math.hypot(x-P.x,z-P.z);
const wTown=(x,z)=>Math.hypot(x-48,z+6)<22||(typeof inWick==='function'&&inWick(x,z))||Math.hypot(x-TITHE.x,z-TITHE.z)<9;
const wLand=(x,z)=>x>B.x0+2&&x<B.x1-2&&z>B.z0+2&&z<B.z1-2&&!LAYERS.water(x,z)&&!onRoad(x,z,.4)&&!(typeof inQuarry==='function'&&inQuarry(x,z))&&!BLOCK.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]);
const wFree=(x,z)=>{const p={x,z};collide(p,.3);return Math.hypot(p.x-x,p.z-z)<.05;};
const wDeepWater=(x,z)=>{for(const [dx,dz] of [[0,0],[1.3,0],[-1.3,0],[0,1.1],[0,-1.1]])if(!LAYERS.water(x+dx,z+dz))return false;return true;};
function wRing(min,max){const a=rand()*6.283,d=min+rand()*(max-min);return [P.x+Math.cos(a)*d,P.z+Math.sin(a)*d];}
function wSpawn(kind){const night=isNight();
  if(kind==='duck'){for(let i=0;i<14;i++){const [x,z]=wRing(14,30);if(!wDeepWater(x,z))continue;const n=1+((rand()*3)|0);
      for(let k=0;k<n;k++)WILD.push({kind,spr:k%2?'wild_hen':'wild_drake',x:x+(rand()-.5)*1.5,z:z+(rand()-.5)*1.2,dir:rand()<.5?-1:1,st:'swim',t:rand()*3,at:rand()*2,tx:x,tz:z});return true;}return false;}
  for(let i=0;i<14;i++){const [x,z]=wRing(19,31);if(!wLand(x,z)||!wFree(x,z))continue;
    if(kind!=='bird'&&kind!=='rabbit'&&(wTown(x,z)||Math.hypot(x,z+8)<16))continue;
    if(kind==='deer'){const n=1+((rand()*(night?1:3))|0);for(let k=0;k<n;k++){const px=x+(rand()-.5)*3,pz=z+(rand()-.5)*2;if(!wFree(px,pz))continue;
        WILD.push({kind,spr:k===0&&rand()<.35?'wild_stag':'wild_doe',x:px,z:pz,dir:rand()<.5?-1:1,st:'graze',t:2+rand()*4,at:rand()*4});}return true;}
    if(kind==='rabbit'){WILD.push({kind,spr:'wild_rabbit',x,z,dir:rand()<.5?-1:1,st:'sit',t:1+rand()*3,at:0});return true;}
    if(kind==='bird'){if(wTown(x,z)&&rand()<.5)continue;const n=3+((rand()*4)|0);for(let k=0;k<n;k++)WILD.push({kind,spr:'wild_bird',x:x+(rand()-.5)*2.4,z:z+(rand()-.5)*1.6,dir:rand()<.5?-1:1,st:'peck',t:rand()*2,at:rand()*2,h:0,flock:x});return true;}
    if(kind==='fox'){WILD.push({kind,spr:'wild_fox',x,z,dir:x<P.x?1:-1,st:'trot',t:3+rand()*4,at:0,tx:P.x+(rand()-.5)*20,tz:P.z+(rand()-.5)*14});return true;}
    if(kind==='squirrel'){let best=null;for(const o of OBJ){if(o.kind!=='tree'||o.hide||o.room||Math.abs(o.x-x)>6||Math.abs(o.z-z)>6)continue;best=o;break;}if(!best)continue;
      const sx_=best.x+(rand()-.5)*2.4,sz_=best.z+.8+rand()*.8;if(!wFree(sx_,sz_))continue;WILD.push({kind,spr:'wild_squirrel',x:sx_,z:sz_,dir:rand()<.5?-1:1,st:'sit',t:1+rand()*2,at:0,tree:best,h:0});return true;}}
  return false;}
// the deer that doesn't run: only at night, only when your mind is going
function wWatcher(){for(let i=0;i<10;i++){const [x,z]=wRing(11,15);if(!wLand(x,z)||!wFree(x,z)||wTown(x,z))continue;
  WILD.push({kind:'deer',spr:'wild_doe',x,z,dir:P.x>x?1:-1,st:'watch',t:40,at:0,watch:true});return true;}return false;}
const wCount=k=>WILD.filter(a=>a.kind===k&&a.st!=='gone').length;
function wFlee(a,sp){const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz)||1;a.vx=dx/d*sp+(rand()-.5)*.6;a.vz=dz/d*sp*.8+(rand()-.5)*.6;a.dir=a.vx>=0?1:-1;}
function wMove(a,vx,vz,dt,land){const nx=a.x+vx*dt,nz=a.z+vz*dt;if(land&&LAYERS.water(nx,nz)){a.vx=-vx;a.vz=-vz;return false;}
  if(!land&&!LAYERS.water(nx,nz)){a.tx=a.x-vx*3;a.tz=a.z-vz*3;return false;}const p={x:nx,z:nz};if(land)collide(p,.25);a.x=p.x;a.z=p.z;return true;}
// a few small sounds, quiet, and only for what's on screen
const wSnd={chirp(){if(!A.ok)return;const f=2600+rand()*1200;for(let i=0;i<2+((rand()*3)|0);i++)A.tone(f+rand()*400,.05,'sine',.018,{slide:f*1.35,delay:i*.08});},
  flutter(){if(!A.ok)return;A.hiss(.32,.05,'bandpass',2200,{a:.005});for(let i=0;i<3;i++)A.tone(3400+rand()*600,.04,'sine',.02,{slide:4400,delay:.05+i*.06});},
  snort(){if(!A.ok)return;A.hiss(.18,.05,'lowpass',700,{a:.005});A.tone(140,.1,'sine',.06,{delay:.12});A.tone(120,.1,'sine',.05,{delay:.3});},
  quack(){if(!A.ok)return;for(let i=0;i<(rand()<.5?2:3);i++)A.tone(460,.1,'sawtooth',.026,{slide:340,filter:['bandpass',1100,2],delay:i*.16});},
  squeak(){if(!A.ok)return;A.tone(5200,.04,'square',.012,{slide:3800});A.tone(5400,.04,'square',.01,{slide:4000,delay:.07});}};
function wildUpdate(dt){
  if(S.room||S.mode!=='play'||S.paused){if(S.room){WILD.length=0;WEYES.length=0;}return;}
  const night=isNight(),dusk=S.hour>=17&&S.hour<20.6||S.hour>=5&&S.hour<7,T=typeof tierOf==='function'?tierOf(M.v):0;
  // spawning, a little at a time, out of sight
  wildT-=dt;if(wildT<=0){wildT=1.2;
    const cap=night?{deer:1,rabbit:2,squirrel:0,bird:0,duck:4,fox:1}:{deer:5,rabbit:6,squirrel:4,bird:9,duck:5,fox:dusk?1:0};
    for(const k of Object.keys(cap)){const n=k==='bird'?WILD.filter(a=>a.kind==='bird').length:wCount(k);if(n<cap[k]&&rand()<.35)wSpawn(k);}
    if(night&&T>=1&&!WILD.some(a=>a.watch)&&rand()<.04*T)wWatcher();}
  const pr=typeof HZ!=='undefined'&&(HZ.pspd||0)>4.6;   // running scares things from further away
  for(let i=WILD.length-1;i>=0;i--){const a=WILD[i];a.t-=dt;a.at+=dt;const d=wFar(a.x,a.z);
    if(a.st==='gone'||d>40){WILD.splice(i,1);continue;}
    if(a.kind==='deer'){
      if(a.watch){a.dir=P.x>a.x?1:-1;if(d<7||a.t<=0||!night){a.st='gone';}continue;}
      if(a.st!=='flee'&&(d<(pr?11:6.5)||(a.st==='alert'&&a.t<=0&&d<9))){a.st='flee';wFlee(a,6.8);if(onScreen(a.x,a.z,40))wSnd.snort();
        for(const b of WILD)if(b!==a&&b.kind==='deer'&&b.st!=='flee'&&Math.hypot(b.x-a.x,b.z-a.z)<6){b.st='flee';wFlee(b,6.6);}}
      if(a.st==='flee'){wMove(a,a.vx,a.vz,dt,true);continue;}
      if(d<11&&a.st!=='alert'){a.st='alert';a.t=1+rand()*1.8;a.dir=P.x>a.x?1:-1;continue;}
      if(a.st==='alert'){if(a.t<=0&&d>=11){a.st='graze';a.t=2+rand()*3;}continue;}
      if(a.t<=0){if(a.st==='graze'){a.st='walk';a.t=1.5+rand()*2.5;const ang=rand()*6.28;a.vx=Math.cos(ang)*1.1;a.vz=Math.sin(ang)*.7;a.dir=a.vx>=0?1:-1;}else{a.st='graze';a.t=2+rand()*5;}}
      if(a.st==='walk')wMove(a,a.vx,a.vz,dt,true);continue;}
    if(a.kind==='rabbit'){
      if(a.st!=='flee'&&d<(pr?8:5)){a.st='flee';a.t=0;}
      if(a.st==='flee'){if(a.t<=0){wFlee(a,5.6);a.vx+=(rand()-.5)*4;a.dir=a.vx>=0?1:-1;a.t=.32;}wMove(a,a.vx,a.vz,dt,true);continue;}
      if(a.st==='hop'){wMove(a,a.vx,a.vz,dt,true);if(a.t<=0){a.st='sit';a.t=1+rand()*3;}continue;}
      if(a.t<=0){a.st='hop';a.t=.42;const ang=rand()*6.28;a.vx=Math.cos(ang)*2;a.vz=Math.sin(ang)*1.3;a.dir=a.vx>=0?1:-1;}continue;}
    if(a.kind==='squirrel'){
      if(a.st==='climb'){a.h+=dt*60;if(a.h>70)a.st='gone';continue;}
      if(a.st!=='flee'&&d<(pr?7:4.5)){a.st='flee';if(onScreen(a.x,a.z,40))wSnd.squeak();}
      if(a.st==='flee'){const tx=a.tree.x,tz=a.tree.z+.15,dx=tx-a.x,dz=tz-a.z,dd=Math.hypot(dx,dz);if(dd<.3){a.st='climb';a.x=tx;a.z=tz;continue;}a.dir=dx>=0?1:-1;a.x+=dx/dd*6*dt;a.z+=dz/dd*6*dt;continue;}
      if(a.st==='run'){wMove(a,a.vx,a.vz,dt,true);if(a.t<=0){a.st='sit';a.t=1+rand()*2.5;}continue;}
      if(a.t<=0){a.st='run';a.t=.4+rand()*.7;const ang=rand()*6.28;a.vx=Math.cos(ang)*3.2;a.vz=Math.sin(ang)*2;a.dir=a.vx>=0?1:-1;
        if(Math.hypot(a.x-a.tree.x,a.z-a.tree.z)>3){a.vx=(a.tree.x-a.x)*1.2;a.vz=(a.tree.z+.8-a.z)*1.2;a.dir=a.vx>=0?1:-1;}}continue;}
    if(a.kind==='bird'){
      if(a.st==='fly'){a.h+=dt*(26+a.at*8);a.x+=a.vx*dt;a.z+=a.vz*dt;if(a.t<=0)a.st='gone';continue;}
      if(d<(pr?7:4.2)){const flock=WILD.filter(b=>b.kind==='bird'&&b.flock===a.flock&&b.st!=='fly');for(const b of flock){b.st='fly';b.t=2.6;b.at=0;wFlee(b,7+rand()*3);b.vz-=2;}
        if(onScreen(a.x,a.z,60))wSnd.flutter();continue;}
      if(a.t<=0){const r=rand();if(r<.45){a.st='peck';a.t=.4+rand()*.8;}else if(r<.8){a.st='hop';a.t=.25;const s=rand()<.5?-1:1;a.vx=s*1.4;a.vz=(rand()-.5)*.8;a.dir=s;}else{a.st='stand';a.t=.6+rand()*1.2;}}
      if(a.st==='hop')wMove(a,a.vx,a.vz,dt,true);continue;}
    if(a.kind==='duck'){
      if(night){a.st='swim';continue;}   // asleep on the water, head tucked
      if(d<3.6&&a.st!=='flee'){a.st='flee';wFlee(a,1.8);if(onScreen(a.x,a.z,40))wSnd.quack();}
      if(a.st==='flee'){if(!wMove(a,a.vx,a.vz,dt,false)||d>7){a.st='swim';a.t=2;}continue;}
      if(a.t<=0){if(rand()<.25){a.st='dabble';a.t=1.2+rand()*1.5;}else{a.st='swim';a.t=2+rand()*4;const ang=rand()*6.28;a.vx=Math.cos(ang)*.45;a.vz=Math.sin(ang)*.3;a.dir=a.vx>=0?1:-1;if(rand()<.15&&onScreen(a.x,a.z,40))wSnd.quack();}}
      if(a.st==='swim'&&a.vx!==undefined)wMove(a,a.vx,a.vz,dt,false);continue;}
    if(a.kind==='fox'){
      if(a.st!=='flee'&&d<(pr?9:6)){a.st='flee';wFlee(a,7.5);}
      if(a.st==='flee'){wMove(a,a.vx,a.vz,dt,true);continue;}
      if(a.st==='sit'){a.dir=P.x>a.x?1:-1;if(a.t<=0){a.st='trot';a.t=3+rand()*4;a.tx=a.x+(rand()-.5)*24;a.tz=a.z+(rand()-.5)*14;}continue;}
      if(a.t<=0&&d<16&&rand()<.6){a.st='sit';a.t=2+rand()*2.5;continue;}
      const dx=a.tx-a.x,dz=a.tz-a.z,dd=Math.hypot(dx,dz);if(dd<.5||a.t<=0){a.tx=a.x+(rand()-.5)*24;a.tz=a.z+(rand()-.5)*14;a.t=3+rand()*4;continue;}
      a.dir=dx>=0?1:-1;wMove(a,dx/dd*2.4,dz/dd*2.4,dt,true);continue;}}
  // birdsong in the day, when there are birds about
  if(!night){wChirpT-=dt;if(wChirpT<=0){wChirpT=2.5+rand()*5;if(WILD.some(a=>a.kind==='bird'&&a.st!=='fly'&&onScreen(a.x,a.z,80)))wSnd.chirp();}}
  // eyes in the trees at night
  if(night&&!S.room){wEyeT-=dt;if(wEyeT<=0){wEyeT=9+rand()*14;const t=OBJ.find(o=>o.kind==='tree'&&!o.hide&&!o.room&&Math.hypot(o.x-P.x,o.z-P.z)>7&&Math.hypot(o.x-P.x,o.z-P.z)<14&&rand()<.08);
      if(t)WEYES.push({x:t.x+(rand()-.5)*1.4,z:t.z,h:60+rand()*40,t:4+rand()*5,bl:0});}}
  for(let i=WEYES.length-1;i>=0;i--){const e=WEYES[i];e.t-=dt;e.bl-=dt;if(e.bl<-2.5-rand()*3)e.bl=.14;if(e.t<=0||!night||wFar(e.x,e.z)<5)WEYES.splice(i,1);}}
// ---- drawing: each one sits on its own soft shadow, sorted in with everything else
function wClip(a){const fps={walk:6,run:10,trot:9,graze:1.6,hop:10,swim:2,fly:12,peck:5}[a.st]||4;
  switch(a.kind){case 'deer':return [a.st==='flee'?'run':a.st==='walk'?'walk':a.st==='graze'?'graze':'alert',a.st==='flee'||a.st==='walk'||a.st==='graze'?Math.floor(a.at*fps):0];
    case 'rabbit':return a.st==='sit'?['sit',Math.floor(a.at*1.5)%2]:['hop',Math.floor(a.at*(a.st==='flee'?14:10))];
    case 'squirrel':return a.st==='sit'?['sit',Math.floor(a.at*2)%2]:['run',Math.floor(a.at*14)];
    case 'bird':return a.st==='fly'?['fly',Math.floor(a.at*14)]:a.st==='hop'?['hop',Math.floor(a.at*8)]:[a.st==='peck'?(Math.floor(a.at*5)%2?'peck':'stand'):'stand',0];
    case 'duck':return a.st==='dabble'?['dabble',0]:['swim',Math.floor(a.at*fps)];
    case 'fox':return a.st==='sit'?['sit',0]:['trot',Math.floor(a.at*(a.st==='flee'?14:9))];}return ['walk',0];}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;
  for(const a of WILD){if(a.st==='gone'||!onScreen(a.x,a.z,60))continue;
    D.push({z:a.z,mind:1,draw(){const X=Math.round(sx(a.x)),Y=Math.round(sz(a.z));const m=SPR[a.spr];if(!m)return;
      if(a.kind==='duck'){// rings on the water round it, and a little V of wake when it's moving
        ctx2.strokeStyle='rgba(220,236,255,.28)';ctx2.lineWidth=1;const k=(a.at*.6)%1;ctx2.beginPath();ctx2.ellipse(X,Y-1,8+k*7,2.4+k*2,0,0,Math.PI*2);ctx2.stroke();
        if(a.st!=='dabble'&&!isNight()){ctx2.beginPath();ctx2.moveTo(X-a.dir*8,Y-2);ctx2.lineTo(X-a.dir*16,Y-4);ctx2.moveTo(X-a.dir*8,Y);ctx2.lineTo(X-a.dir*16,Y+2);ctx2.stroke();}}
      else{const h=a.h||0,w=Math.max(4,m.fw*.3)*(a.kind==='bird'&&h>0?Math.max(.3,1-h/80):1);ctx2.fillStyle=`rgba(10,14,8,${a.kind==='bird'&&h>0?.18:.3})`;ctx2.beginPath();ctx2.ellipse(X+1,Y,w,w*.32,0,0,Math.PI*2);ctx2.fill();}
      const [clip,fr]=wClip(a);const alpha=a.kind==='squirrel'&&a.st==='climb'?Math.max(0,1-a.h/70):undefined;
      drawSpr(a.spr,X,Y-(a.h||0),clip,'S',fr,{flip:a.dir<0,alpha});}});}};}
// eyeshine: the watcher's eyes, and the eyes in the trees
{const _ll=lifeLight;lifeLight=function(t,L){_ll(t,L);if(S.room||L<.3)return;
  for(const a of WILD)if(a.watch&&a.st!=='gone'&&onScreen(a.x,a.z,40)){const X=sx(a.x)+a.dir*13,Y=sz(a.z)-33;glowAt(X,Y,5,[255,250,210],.9*L);glowAt(X-a.dir*2,Y,4,[255,250,210],.7*L);}
  for(const e of WEYES){if(e.bl>0||!onScreen(e.x,e.z,40))continue;const X=sx(e.x),Y=sz(e.z)-e.h;glowAt(X-3,Y,4,[255,220,120],.85*L);glowAt(X+3,Y,4,[255,220,120],.85*L);}};}
{const _lu=lifeUpdate;lifeUpdate=function(dt){_lu(dt);try{wildUpdate(dt);}catch(e){}};}
