/* ================= every place has its own life. Walk into an area and it is doing something that only it does:
   the town square: pigeons that strut, bob and clatter up when you run through them, and in the afternoon the children playing tag
   the mill: a haze of flour dust drifting from the mill door; around midnight, something red drifts the wrong way
   the quarry: dust puffs off the face and the tink-tink of a pick somewhere you can't see
   the orchard: apples dropping in the grass, bees over the trees in the day
   the Black Lake: a low mist that crawls over the water, thicker at night, and rings where something rises
   the graveyard: crows on the stones that turn their heads to watch you go by, and lift off together
   Wickham's river: fog rolling off the far bank, and fish jumping
   Each also has a sound of its own when you're near. ================= */
const AMBP=[
 {k:'square',x:squarePos.x,z:squarePos.z,r:14},{k:'mill',x:30,z:96,r:10},{k:'quarry',x:146,z:-28,r:14},{k:'orchard',x:46,z:56,r:12},
 {k:'lake',x:LAKE.x,z:LAKE.z,r:LAKE.rx+6},{k:'graves',x:56.5,z:-36.6,r:12},{k:'wkriver',x:134,z:68,r:12}];
const AMBS={pigeons:[],crows:[],acc:0,snd:0,tag:0};
const ambNear=k=>{const a=AMBP.find(q=>q.k===k);return a&&!S.room&&Math.hypot(P.x-a.x,P.z-a.z)<a.r+18;};
// flocks that live in a place: pigeons in the square, crows on the graves
function ambFlock(arr,n,cx,cz,rx,rz,kind){if(arr.length)return;for(let i=0;i<n;i++)arr.push({x:cx+(Math.random()-.5)*rx,z:cz+(Math.random()-.5)*rz,hx:cx,hz:cz,rx,rz,st:'peck',t:Math.random()*3,h:0,dir:Math.random()<.5?-1:1,kind,ph:Math.random()*6});}
function ambFlockTick(arr,dt){for(const b of arr){b.t-=dt;const d=Math.hypot(P.x-b.x,P.z-b.z);const run=typeof HZ!=='undefined'&&(HZ.pspd||0)>4.6;
  if(b.st!=='fly'&&d<(run?3.2:1.6)){b.st='fly';b.t=2.2;b.vx=(b.x-P.x)/(d||1)*3+(Math.random()-.5)*2;b.vz=(b.z-P.z)/(d||1)*2;b.dir=b.vx>=0?1:-1;if(b.kind==='crow'&&Math.random()<.3)A.tone&&A.tone(520,.18,'sawtooth',.03,{slide:380});}
  if(b.st==='fly'){b.h=Math.min(60,b.h+dt*40);b.x+=b.vx*dt;b.z+=b.vz*dt;if(b.t<=0){b.st='land';b.x=b.hx+(Math.random()-.5)*b.rx;b.z=b.hz+(Math.random()-.5)*b.rz;b.t=1.4;}continue;}
  if(b.st==='land'){b.h=Math.max(0,b.h-dt*50);if(b.h<=0){b.st='peck';b.t=1+Math.random()*3;}continue;}
  if(b.t<=0){if(Math.random()<.5){b.st='hop';b.t=.3;const s=Math.random()<.5?-1:1;b.vx=s*.9;b.vz=(Math.random()-.5)*.6;b.dir=s;}else{b.st='peck';b.t=.6+Math.random()*2;}}
  if(b.st==='hop'){b.x+=b.vx*dt;b.z+=b.vz*dt;}
  if(b.kind==='crow'&&b.st==='peck')b.dir=P.x>b.x?1:-1;}}   // crows watch you
function ambBird(b,X,Y){const g=ctx2;const flap=b.st==='fly'?Math.sin(performance.now()/60+b.ph):0;const c=b.kind==='crow'?['#141218','#2a2630','#4a4458']:['#5a5a66','#8a8a96','#b8b8c4'];
  if(b.h<4){g.fillStyle='rgba(10,12,8,.3)';g.fillRect(X-3,Y,7,2);}
  const y=Y-b.h-4;g.fillStyle='#16121a';g.fillRect(X-4,y-1,8,5);g.fillRect(X+b.dir*3-1,y-3,4,4);g.fillStyle=c[1];g.fillRect(X-3,y,6,3);g.fillStyle=c[2];g.fillRect(X-2,y,3,1);g.fillStyle=c[0];g.fillRect(X+b.dir*3,y-2+(b.st==='peck'&&Math.sin(performance.now()/180+b.ph)>.6?2:0),2,2);
  if(b.kind==='pigeon'){g.fillStyle='#7aa088';g.fillRect(X+b.dir*2,y,1,1);}
  if(b.kind==='crow'&&b.st!=='fly'){g.fillStyle='#e8d070';g.fillRect(X+b.dir*3+(b.dir>0?1:0),y-2,1,1);}
  if(b.st==='fly'){g.fillStyle=c[1];g.fillRect(X-5,y-1-Math.round(flap*2),3,1);g.fillRect(X+3,y-1-Math.round(flap*2),3,1);}
  else{g.fillStyle=c[0];g.fillRect(X-1,y+3,1,1);g.fillRect(X+1,y+3,1,1);}}
// ---- the particles each place makes
function ambEmit(dt){const night=isNight(),now=performance.now()/1000;
  if(ambNear('mill')){if(Math.random()<.6)for(let i=0;i<2;i++)parts.push({x:31+(Math.random()-.5)*2.6,z:100.4+Math.random()*.6,y:.1+Math.random()*.5,vx:.15+Math.random()*.35,vz:.25,vy:.1,t:0,life:3,col:'rgba(248,242,226,.95)',size:2});
    if(isNight()&&(S.hour>=23.5||S.hour<1)&&Math.random()<.3)parts.push({x:31+(Math.random()-.5)*2,z:99.3,y:1.2,vx:-.4,vz:0,vy:-.1,t:0,life:2,col:'rgba(200,40,40,.6)',size:2});}
  if(ambNear('quarry')&&Math.random()<.25){const x=140+Math.random()*12;for(let i=0;i<5;i++)parts.push({x:x+(Math.random()-.5)*.6,z:-31.5,y:.8+Math.random()*1.5,vx:(Math.random()-.5)*.8,vz:.4,vy:-.2,t:0,life:1.4,col:'rgba(196,186,170,.8)',size:2});}
  if(ambNear('orchard')){if(Math.random()<.02){const x=40+Math.random()*14,z=52+Math.random()*8;parts.push({x,z,y:2.6,vx:0,vz:0,vy:-.2,t:0,life:1.6,col:'#c83a24',size:2});}
    if(!night&&Math.random()<.5){const a=now*3+Math.random()*6;parts.push({x:46+Math.cos(a)*4+(Math.random()-.5)*6,z:56+Math.sin(a)*2+(Math.random()-.5)*5,y:1.4+Math.random()*1.2,vx:(Math.random()-.5)*1.4,vz:(Math.random()-.5)*.8,vy:(Math.random()-.5)*.6,t:0,life:.5,col:'#f0c838',size:1});}}
  if(ambNear('lake')){for(let i=0;i<(night?6:3);i++){const x=P.x+(Math.random()-.5)*28,z=P.z+(Math.random()-.5)*18;if(!LAYERS.water(x,z)||Math.hypot((x-LAKE.x)/LAKE.rx,(z-LAKE.z)/LAKE.rz)>1.05)continue;
    parts.push({x,z,y:.1,vx:.25+Math.random()*.2,vz:(Math.random()-.5)*.1,vy:.02,t:0,life:4,col:night?'rgba(160,178,188,.6)':'rgba(230,236,240,.5)',size:6});}}
  if(ambNear('wkriver')&&Math.random()<.5)parts.push({x:126+Math.random()*16,z:72+Math.random()*3,y:.2,vx:-.3,vz:-.1,vy:.03,t:0,life:4,col:'rgba(220,226,230,.45)',size:6});}
// rings on the water: the lake and the Wickham river
const AMBR=[];
function ambRings(dt){if(Math.random()<dt*.5&&ambNear('lake')){const a=Math.random()*6.283,r=Math.sqrt(Math.random())*.8;AMBR.push({x:LAKE.x+Math.cos(a)*LAKE.rx*r,z:LAKE.z+Math.sin(a)*LAKE.rz*r,t:0});}
  if(Math.random()<dt*.6&&ambNear('wkriver')){AMBR.push({x:128+Math.random()*12,z:66+Math.random()*3,t:0,fish:true});}
  for(let i=AMBR.length-1;i>=0;i--){AMBR[i].t+=dt;if(AMBR[i].t>2.2)AMBR.splice(i,1);}}
// ---- the children play tag in the square after school
function ambTag(dt){if(S.room||isNight()||S.hour<14.5||S.hour>16.5||!ambNear('square'))return;const kids=['tobias','pip','bram'].map(npcById).filter(n=>n&&n.vis!==false&&!n.loc&&Math.hypot(n.x-48,n.z+5)<9);
  if(kids.length<2)return;AMBS.tag-=dt;if(AMBS.tag>0)return;AMBS.tag=1.2+Math.random();const it=kids[(Math.random()*kids.length)|0];
  for(const n of kids){const a=Math.random()*6.283;const tx=48+Math.cos(a)*5,tz=-5+Math.sin(a)*2.2;n.route=[[tx,tz]];n.waitT=0;}
  if(Math.random()<.3&&onScreen(it.x,it.z,30))A.tone&&A.tone(880,.08,'triangle',.03);}
// ---- each place's sound
function ambSound(dt){AMBS.snd-=dt;if(AMBS.snd>0||!A.ok)return;AMBS.snd=2+Math.random()*3;
  if(ambNear('quarry')){for(let i=0;i<2;i++)A.tone&&A.tone(2200+Math.random()*300,.05,'square',.012,{delay:i*.35});}
  else if(ambNear('mill'))A.hiss&&A.hiss(1.8,.03,'lowpass',500,{wobble:true});
  else if(ambNear('graves')&&Math.random()<.5)A.tone&&A.tone(480,.22,'sawtooth',.02,{slide:340});
  else if(ambNear('square')&&!isNight()&&Math.random()<.6)A.tone&&A.tone(380,.12,'sine',.015,{slide:300});
  else if(ambNear('orchard')&&!isNight())A.hiss&&A.hiss(.9,.015,'bandpass',260,{q:6,wobble:true});}
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play')return;try{
  if(ambNear('square'))ambFlock(AMBS.pigeons,9,48,-4.6,9,4,'pigeon');ambFlockTick(AMBS.pigeons,dt);
  if(ambNear('graves'))ambFlock(AMBS.crows,6,60.8,-27,7,4,'crow');ambFlockTick(AMBS.crows,dt);
  AMBS.acc+=dt;if(AMBS.acc>.08){ambEmit(AMBS.acc);AMBS.acc=0;}ambRings(dt);ambTag(dt);ambSound(dt);}catch(e){}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;
  for(const arr of [AMBS.pigeons,AMBS.crows])for(const b of arr){if(!onScreen(b.x,b.z,40))continue;if(isNight()&&b.kind==='pigeon')continue;D.push({z:b.z,mind:1,draw(){ambBird(b,Math.round(sx(b.x)),Math.round(sz(b.z)));}});}
  for(const r of AMBR){if(!onScreen(r.x,r.z,40))continue;D.push({z:r.z-.6,mind:1,draw(){const X=sx(r.x),Y=sz(r.z),k=r.t/2.2;ctx2.strokeStyle=`rgba(220,236,255,${.45*(1-k)})`;ctx2.lineWidth=1;ctx2.beginPath();ctx2.ellipse(X,Y,3+k*14,1.2+k*5,0,0,6.283);ctx2.stroke();
    if(r.fish&&r.t<.5){const h=Math.sin(r.t/.5*Math.PI)*10;ctx2.fillStyle='#8a9aa0';ctx2.fillRect(X-2,Y-h-1,5,2);ctx2.fillStyle='#c8d4d8';ctx2.fillRect(X-1,Y-h-1,2,1);}}});}};}
