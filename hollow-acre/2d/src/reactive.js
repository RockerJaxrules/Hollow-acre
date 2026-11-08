/* ================= #156 a world that notices you: footsteps that know what they land on, tall grass that parts and
   rustles, birds that burst out of the trees when you run under them, wind that comes in gusts and takes the leaves with
   it, puddles after rain, townsfolk you overhear as you pass, music that follows the hour, the weather and the weeks of
   autumn, and a town that gets tidier and prettier the more of the Ward you feed, while something underneath it gets
   darker. ================= */
const RX={gust:0,gustLen:4.5,gustNext:28,gustDir:1,grid:null,gridN:0,gridT:0,birds:[],treeSeen:{},rustT:0,prints:[],wet:0,
  pud:new Map(),tg:new Map(),bub:[],bubT:6,heard:{},npcStepT:{},mus:{t:2,step:0,ph:null,key:'',n:0},breathT:2};
const rotTier=()=>typeof wardDone==='function'?wardDone():0;
const rotK=()=>clamp(rotTier()/6,0,1);
const autumnK=()=>clamp((S.day-1)/27,0,1);
const outdoors=()=>!S.room&&S.mode==='play';
// ---------- spatial lookup for grass, trees and mud (built once the world exists, refreshed if it changes)
function rxGrid(){const now=performance.now();if(RX.grid&&(RX.gridN===OBJ.length||now-RX.gridT<5000))return RX.grid;RX.gridT=now;const g=new Map();
  for(const o of OBJ){let k=null;if(o.grass)k='g';else if(o.kind==='tree'||o.kind==='pine')k='t';else if(/^mud/.test(o.spr))k='m';else if(/deck|dock|bridge|boardwalk|tsteps_wood|porch/.test(o.spr))k='d';if(!k)continue;
    const key=Math.floor(o.x/8)+','+Math.floor(o.z/8);let c=g.get(key);if(!c)g.set(key,c={g:[],t:[],m:[],d:[]});c[k].push(o);}
  RX.grid=g;RX.gridN=OBJ.length;return g;}
function rxNear(x,z,kind,r){const g=rxGrid(),out=[];const i0=Math.floor((x-r)/8),i1=Math.floor((x+r)/8),j0=Math.floor((z-r)/8),j1=Math.floor((z+r)/8);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const c=g.get(i+','+j);if(!c)continue;for(const o of c[kind])if(!o.hide&&Math.abs(o.x-x)<r&&Math.abs(o.z-z)<r)out.push(o);}return out;}
function sprBox(o){const m=SPR[o.spr];if(!m)return null;const ax=m.ax!=null?m.ax:m.fw/2,ay=m.ay!=null?m.ay:m.fh;return [o.x-ax/PPM,o.z-ay/PPM*.9,o.x+(m.fw-ax)/PPM,o.z+(m.fh-ay)/PPM];}
// ---------- puddles: where the dirt dips, the rain collects; they grow while it rains and dry out over the afternoon
function wetness(){const h=S.hour;if(typeof rainDay!=='function'||!rainDay(S.day))return 0;if(h<9.5)return 0;if(h<15.5)return clamp((h-9.5)/1.4,0,1);return clamp(1-(h-15.5)/5.5,0,1);}
function pudCell(i,j){const key=i+','+j;let p=RX.pud.get(key);if(p!==undefined)return p;p=0;const hh=hash(i*13+5,j*7+11);
  if(hh<.12){const x=i*1.7+.3+hash(i,j*3+1)*1.1,z=j*1.7+.3+hash(i*5+2,j)*1.1;const t=terr(x,z);
    if((t==='dirt'&&hh<.12)||(t==='stone'&&hh<.035)||(typeof townStone==='function'&&townStone(x,z)&&hh<.035))p={x,z,r:.32+hash(i*3,j*9)*.5,ph:hash(i,j)*6};}
  if(RX.pud.size>6000)RX.pud.clear();RX.pud.set(key,p);return p;}
function puddleAt(x,z){const w=wetness();if(w<.2||S.room)return null;const i=Math.floor(x/1.7),j=Math.floor(z/1.7);
  for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){const p=pudCell(a,b);if(p&&Math.hypot((x-p.x)/(p.r*w*1.4),(z-p.z)/(p.r*w*.8))<1)return p;}return null;}
// ---------- what is underfoot
function surfAt(x,z){
  if(S.room){const r=S.room;if(r==='mine'||/cellar|crypt|cave|vault/.test(r))return 'stone';return 'wood';}
  for(const o of rxNear(x,z,'d',6)){const b=sprBox(o);if(b&&x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])return 'wood';}
  const t=terr(x,z);if(t==='water')return 'water';
  if(puddleAt(x,z))return 'puddle';
  const rain=typeof raining==='function'&&raining();
  if(t==='stone'||(typeof townStone==='function'&&townStone(x,z)))return rain?'wetstone':'stone';
  if(rxNear(x,z,'m',3).some(o=>Math.hypot(o.x-x,(o.z-z)*1.4)<1.3))return 'mud';
  if(t==='dirt')return rain||wetness()>.4?'mud':'dirt';
  if((LAYERS.dark&&LAYERS.dark(x,z))||rxNear(x,z,'t',3).some(o=>o.kind==='tree'&&Math.hypot(o.x-x,(o.z-z)*1.3)<2.2))return 'leaves';
  return rain||wetness()>.3?'wetgrass':'grass';}
const STEPS={
  wood(v,p){A.tone(140+Math.random()*40,.08,'sine',.08*v,{slide:85,pan:p});A.hiss(.05,.035*v,'lowpass',1100,{pan:p});},
  stone(v,p){A.hiss(.035,.07*v,'highpass',2400+Math.random()*600,{q:.7,pan:p});A.tone(900+Math.random()*300,.025,'triangle',.012*v,{pan:p});},
  wetstone(v,p){STEPS.stone(v,p);A.hiss(.07,.03*v,'highpass',4200,{delay:.01,pan:p});},
  dirt(v,p){A.hiss(.09,.06*v,'lowpass',620+Math.random()*260,{pan:p});},
  mud(v,p){A.hiss(.17,.075*v,'lowpass',380,{slide:180,pan:p});A.tone(110,.12,'sine',.05*v,{slide:60,pan:p});},
  grass(v,p){A.hiss(.12,.032*v,'bandpass',1500+Math.random()*500,{q:.7,pan:p});},
  wetgrass(v,p){A.hiss(.12,.035*v,'bandpass',1200+Math.random()*400,{q:.7,pan:p});A.hiss(.06,.02*v,'highpass',4500,{pan:p});},
  leaves(v,p){A.hiss(.15,.055*v,'bandpass',3000+Math.random()*900,{q:1.1,wobble:true,pan:p});},
  water(v,p){A.hiss(.25,.09*v,'bandpass',900,{slide:380,q:1.3,pan:p});},
  puddle(v,p){A.hiss(.2,.08*v,'bandpass',1300,{slide:500,q:1.2,pan:p});A.tone(500+Math.random()*200,.06,'sine',.02*v,{slide:900,pan:p});},
};
const LEAFC=['#c8642a','#d8902e','#a8402a','#e0b040','#8a5a2a'];
{const _st=SFX.step;SFX.step=function(corn){if(!A.ok)return;if(corn)return _st.call(SFX,corn);
  const s=surfAt(P.x,P.z),f=STEPS[s];if(!f)return _st.call(SFX,corn);f(1);
  // whatever is following you keeps step, on the same ground, a beat behind
  if(typeof HZ!=='undefined'&&HZ.follow>0&&!S.room)setTimeout(()=>{A.ok&&f(.55,(Math.random()-.5)*.6);},230+Math.random()*40);
  if(!(P.spd>0))return;
  // what the step leaves behind
  if(s==='leaves'&&Math.random()<.6)for(let i=0;i<2;i++)parts.push({x:P.x+(Math.random()-.5)*.3,z:P.z+.05,y:.05,vx:(Math.random()-.5)*1.2,vz:(Math.random()-.5)*.6,vy:1+Math.random(),t:0,life:.9,col:LEAFC[(Math.random()*5)|0],size:2});
  if(s==='puddle'||s==='water'){burst(P.x,P.z+.05,5,'rgba(220,232,245,.85)',1.1,.5,1.6);RX.wet=8;}
  if(s==='mud'){burst(P.x,P.z+.05,3,'#3a2a1a',.7,.5,.9);RX.wet=Math.max(RX.wet,6);}
  if(s==='wetgrass'||s==='wetstone')RX.wet=Math.max(RX.wet,2);
  if(RX.wet>0&&s!=='water'&&s!=='puddle'){RX.wet--;RX.prints.push({x:P.x+(RX.prints.length%2?.08:-.08),z:P.z,t:performance.now()/1000,mud:s==='mud'||RX.wet>4,dir:P.dir});if(RX.prints.length>90)RX.prints.shift();}};}
// ---------- the ground layer: puddles with the sky in them, and the prints you've left
{const _mg=mindGround;mindGround=function(){_mg();if(S.room)return;const w=wetness(),now=performance.now()/1000;
  if(w>.05){const i0=Math.floor((cam.x-VW/2/PPM-2)/1.7),i1=Math.floor((cam.x+VW/2/PPM+2)/1.7),j0=Math.floor((cam.z-VH*.56/PPM-2)/1.7),j1=Math.floor((cam.z+VH*.44/PPM+2)/1.7);
    const rain=typeof raining==='function'&&raining(),am=ambient(S.hour),sk=(k,a)=>`rgba(${Math.round(Math.min(255,62*am[0]/255*k))},${Math.round(Math.min(255,76*am[1]/255*k))},${Math.round(Math.min(255,98*am[2]/255*k))},${a})`,sky=[sk(1,.72),sk(1.9,.5)];
    for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const p=pudCell(i,j);if(!p)continue;const X=Math.round(sx(p.x)),Y=Math.round(sz(p.z)),rx=p.r*w*1.4*PPM,rz=p.r*w*.8*PPM;if(rx<2)continue;
      ctx2.fillStyle='rgba(40,26,14,.35)';ctx2.beginPath();ctx2.ellipse(X,Y+1,rx+3,rz+2,0,0,6.283);ctx2.fill();
      ctx2.fillStyle=sky[0];ctx2.beginPath();ctx2.ellipse(X,Y,rx,rz,0,0,6.283);ctx2.fill();
      ctx2.fillStyle=sky[1];ctx2.beginPath();ctx2.ellipse(X-rx*.12,Y-rz*.18,rx*.72,rz*.5,0,0,6.283);ctx2.fill();
      ctx2.fillStyle='rgba(20,24,30,.35)';ctx2.fillRect(X-Math.round(rx*.8),Y+Math.round(rz*.55),Math.round(rx*1.6),1);
      ctx2.fillStyle='rgba(235,242,250,.5)';ctx2.fillRect(X-Math.round(rx*.5),Y-Math.round(rz*.4),Math.max(2,Math.round(rx*.35)),1);ctx2.fillRect(X+Math.round(rx*.15),Y-Math.round(rz*.1),Math.max(1,Math.round(rx*.15)),1);
      if(rain){ctx2.strokeStyle='rgba(220,230,245,.45)';for(let k=0;k<2;k++){const f=(now*1.6+p.ph+k*.5)%1;ctx2.globalAlpha=1-f;ctx2.beginPath();ctx2.ellipse(X+Math.round((hash(i*3+k,Math.floor(now*1.6+p.ph+k*.5))-.5)*rx),Y,1+f*5,.5+f*2,0,0,6.283);ctx2.stroke();}ctx2.globalAlpha=1;}}}
  for(const p of RX.prints){const a=clamp(1-(now-p.t)/40,0,1);if(a<=0)continue;const X=Math.round(sx(p.x)),Y=Math.round(sz(p.z));if(X<-10||X>VW+10||Y<-10||Y>VH+10)continue;
    ctx2.globalAlpha=a*(p.mud?.55:.3);ctx2.fillStyle=p.mud?'#2a1c10':'#1a2028';
    if(p.dir==='E'||p.dir==='W'){ctx2.fillRect(X-2,Y-1,4,2);ctx2.fillRect(X+(p.dir==='E'?3:-4),Y-1,2,2);}else{ctx2.fillRect(X-1,Y-2,2,4);ctx2.fillRect(X-1,Y+(p.dir==='S'?3:-4),2,2);}}
  ctx2.globalAlpha=1;
  const fk=rxFrostK();if(fk>0){const c0=Math.floor(cam.x-VW/2/PPM)-1,c1=Math.ceil(cam.x+VW/2/PPM)+1,r0=Math.floor(cam.z-VH*.56/PPM)-1,r1=Math.ceil(cam.z+VH*.44/PPM)+1;
    if(!RX.frostT){RX.frostT=[0,1,2,3].map(v=>{const c=document.createElement('canvas');c.width=c.height=PPM;const g=c.getContext('2d');g.fillStyle='rgba(220,232,248,.34)';g.fillRect(0,0,PPM,PPM);g.fillStyle='rgba(250,252,255,.9)';
      for(let k=0;k<26;k++){const h1=hash(v*31+k,17),h2=hash(v*7+k*3,29);g.fillRect((h1*PPM)|0,(h2*PPM)|0,h1>.8?2:1,1);}return c;});}
    ctx2.globalAlpha=fk;for(let i=c0;i<=c1;i++)for(let j=r0;j<=r1;j++){const tk=i*4096+j;let g=RX.tg.get(tk);if(g===undefined){g=terr(i+.5,j+.5)==='grass'?1:0;if(RX.tg.size>20000)RX.tg.clear();RX.tg.set(tk,g);}if(!g)continue;ctx2.drawImage(RX.frostT[(hash(i,j)*4)|0],sx(i),sz(j));}ctx2.globalAlpha=1;}
  // the green, late on: a ring where the grass has died round the memorial
  if(rotTier()>=5&&typeof GREEN_LOOKS!=='undefined'){const X=Math.round(sx(41.4)),Y=Math.round(sz(2.4));ctx2.strokeStyle='rgba(70,56,40,.4)';ctx2.lineWidth=5;ctx2.beginPath();ctx2.ellipse(X,Y,58,24,0,0,6.283);ctx2.stroke();ctx2.lineWidth=1;}};}
// ---------- birds that burst out of the trees
function rxBirds(dt){const night=isNight();
  if(outdoors()&&P.spd>0){for(const o of rxNear(P.x,P.z,'t',3)){if(o.kind!=='tree')continue;const d=Math.hypot(o.x-P.x,(o.z-P.z)*1.3);if(d>(P.spd>=4?2.6:1.5))continue;
      const k=Math.round(o.x*10)+','+Math.round(o.z*10),now=performance.now()/1000;if(RX.treeSeen[k]&&now-RX.treeSeen[k]<150)continue;RX.treeSeen[k]=now;if(Math.random()>(P.spd>=4?.7:.35))continue;
      const n=night?1:2+((Math.random()*3)|0),ax=o.x-P.x,az=o.z-P.z,al=Math.hypot(ax,az)||1;
      for(let i=0;i<n;i++)RX.birds.push({x:o.x+(Math.random()-.5)*1.2,z:o.z-.2+(Math.random()-.5)*.6,y:2.2+Math.random()*.8,vx:ax/al*3+(Math.random()-.5)*2.5,vz:az/al*1.6+(Math.random()-.5)*1.2,vy:1.2+Math.random(),t:0,ph:Math.random()*6,crow:night||Math.random()<.2});
      for(let i=0;i<6;i++)parts.push({x:o.x+(Math.random()-.5)*1.6,z:o.z+(Math.random()-.5)*.4,y:2+Math.random()*1.2,vx:(Math.random()-.5)*1,vz:(Math.random()-.5)*.4,vy:.3,t:0,life:2.2,col:LEAFC[(Math.random()*5)|0],size:2});
      if(A.ok){const pan=clamp((o.x-P.x)/6,-1,1);A.hiss(.55,.08,'bandpass',1700,{wobble:true,q:2,pan});if(night)SFX.caw(pan);else for(let i=0;i<2;i++)A.tone(3300+Math.random()*500,.07,'sine',.02,{slide:2500,delay:i*.12,pan});}}}
  for(let i=RX.birds.length-1;i>=0;i--){const b=RX.birds[i];b.t+=dt;b.ph+=dt*(16+b.t*2);b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;b.vy+=dt*.6;if(b.t>4)RX.birds.splice(i,1);}}
function rxBirdsDraw(){if(S.room)return;for(const b of RX.birds){const X=Math.round(sx(b.x)),Y=Math.round(sz(b.z)),H=Math.round(b.y*PPM);if(X<-20||X>VW+20)continue;
  ctx2.fillStyle=`rgba(10,14,8,${clamp(.18-b.y*.02,.04,.18)})`;ctx2.fillRect(X-2,Y,5,1);
  const w=Math.round(Math.sin(b.ph)*3),c=b.crow?'#16120f':'#4a3a2c';ctx2.fillStyle=c;ctx2.fillRect(X-1,Y-H,3,2);ctx2.fillRect(X-4,Y-H-w,3,1);ctx2.fillRect(X+2,Y-H-w,3,1);ctx2.fillRect(X-2,Y-H-Math.round(w/2),1,1);ctx2.fillRect(X+2,Y-H-Math.round(w/2),1,1);}}
// ---------- tall grass that parts as you go through it; wind gusts
function rxGrass(dt){if(!outdoors())return;const now=performance.now()/1000;const near=rxNear(P.x,P.z,'g',1.2);
  for(const o of near){const d=Math.hypot(o.x-P.x,(o.z-P.z)*1.4);if(d>.65||!(P.spd>0))continue;if(!o.rxT||now-o.rxT>.7){o.rxT=now;
      if(now-RX.rustT>.16&&A.ok){RX.rustT=now;A.hiss(.22,.04,'bandpass',2600+Math.random()*900,{q:1.4,wobble:true});}
      for(let i=0;i<2;i++)parts.push({x:o.x+(Math.random()-.5)*.4,z:o.z+.05,y:.3+Math.random()*.2,vx:(Math.random()-.5)*1.4,vz:(Math.random()-.5)*.5,vy:.8+Math.random()*.6,t:0,life:.7,col:o.spr==='tgold'?'#c8a850':'#7a9a4a',size:1});
      // now and then something small and alive flits up out of it
      if(Math.random()<.05)parts.push({x:o.x,z:o.z,y:.2,vx:(Math.random()-.5)*3,vz:(Math.random()-.5)*1.4,vy:3.2,t:0,life:1.1,col:isNight()?'#d8d0b8':'#6a8a2a',size:1});}}
  for(const o of near)if(o.rxT&&now-o.rxT<.6)o.ph=(o.ph||0)+dt*14;
  // gusts
  RX.gustNext-=dt;if(RX.gust<=0&&RX.gustNext<=0){RX.gust=RX.gustLen=3.5+Math.random()*2.5;RX.gustDir=Math.random()<.5?-1:1;RX.gustNext=22+Math.random()*45;
    if(A.ok)A.hiss(RX.gustLen,.1+(isNight()?.04:0),'bandpass',380,{slide:900,q:.6,a:1.4,pan:RX.gustDir*.5});}
  if(RX.gust>0){RX.gust-=dt;const g=Math.sin(Math.PI*clamp(1-RX.gust/RX.gustLen,0,1));
    for(const o of rxNear(cam.x,cam.z,'g',14))o.ph=(o.ph||0)+dt*g*7;
    if(typeof NEAR!=='undefined')for(const l of NEAR.leaves)l.x+=RX.gustDir*g*3.2*dt;
    if(Math.random()<g*.9){const fromT=rxNear(cam.x,cam.z,'t',12).filter(o=>o.kind==='tree');
      if(fromT.length){const o=fromT[(Math.random()*fromT.length)|0];parts.push({x:o.x+(Math.random()-.5)*1.4,z:o.z+(Math.random()-.5)*.4,y:2+Math.random()*1.4,vx:RX.gustDir*(2.5+Math.random()*2.5),vz:(Math.random()-.5)*.8,vy:.6+Math.random()*.6,t:0,life:3.2,col:LEAFC[(Math.random()*5)|0],size:2});}
      else parts.push({x:cam.x-RX.gustDir*(VW/2/PPM)+(Math.random()-.5),z:cam.z+(Math.random()-.5)*VH/PPM*.8,y:1+Math.random()*1.5,vx:RX.gustDir*(4+Math.random()*2),vz:(Math.random()-.5)*.6,vy:1.2,t:0,life:3,col:LEAFC[(Math.random()*5)|0],size:2});}
    if(terr(P.x,P.z)==='dirt'&&Math.random()<g*.5)parts.push({x:P.x+(Math.random()-.5)*6,z:P.z+(Math.random()-.5)*3,y:.1,vx:RX.gustDir*2.5,vz:0,vy:.6,t:0,life:1.6,col:'rgba(196,176,140,.45)',size:4});}}
// ---------- other people's footsteps, close by, on whatever they're walking on
function rxNpcSteps(dt){if(!A.ok||S.mode!=='play')return;let n2=0;
  for(const n of npcs){if(n.vis===false||n.loc==='gone'||n.clip!=='walk')continue;if(S.room?n.loc!=='in':n.loc==='in')continue;const d=Math.hypot(n.x-P.x,n.z-P.z);if(d>6.5)continue;if(++n2>2)break;
    const id=n.def.id;RX.npcStepT[id]=(RX.npcStepT[id]||0)-dt;if(RX.npcStepT[id]>0)continue;RX.npcStepT[id]=.38+Math.random()*.06;
    const s=surfAt(n.x,n.z),f=STEPS[s];if(f)f(clamp(.5-d*.06,.08,.45),clamp((n.x-P.x)/6,-1,1));}}
// ---------- overheard: people talk as you go by, to you or about you
const RX_SAY={
  any:['Morning.','Mind how you go.','You’re the one from the farm.','(They nod, and keep their eyes on you until you’re past.)','Lovely day for it.','(A tune, hummed under the breath. The same four notes.)'],
  rain:['You’ll catch your death out here.','Soaked to the skin, look at you.','Rain’s good for the ground. Softens it.'],
  run:['Slow down, you’ll break your neck!','Where’s the fire?','Running won’t help. (They don’t say with what.)'],
  pair:['…that’s the one. Same eyes as the old man.','…give it till the drawing. You’ll see.','…don’t, they’ll hear you.','…she said the floorboards were warm again.','…three weeks, and then it’s quiet for another twenty years.','…I’m only saying what everyone’s thinking.'],
  rot:[[],
    ['Hale says the bell rang on its own last night. That’s a good sign. That means it’s pleased.','The Ward’s filling up. You’ve done that. Thank you. (They mean it, and it’s worse that they mean it.)'],
    ['Have you seen the green? Flags up, first time in twenty years. Doesn’t it look nice.','Somebody left a bowl on my step. I put it back out. You always put it back out.'],
    ['The crows are back. They always come back, near the end.','The town’s never looked so well. Not since last time.'],
    ['Sunsets have gone a funny colour, haven’t they. Prettier. I don’t like it.','My husband dreamed of the church. He keeps dreaming of the church.'],
    ['The grass round the memorial died overnight. Perfect circle. Hale says not to walk in it.','Everyone’s so happy lately. Have you noticed? Everyone’s smiling.'],
    ['It’s nearly time. You can feel it in your teeth.','Whatever happens, love, it was nothing you did. (They don’t believe that. Neither do you.)']]};
function rxOverheard(dt){RX.bub=RX.bub.filter(b=>(b.t+=dt)<b.life);if(!outdoors()||isNight()||typeof talkingTo!=='undefined'&&talkingTo)return;
  RX.bubT-=dt;if(RX.bubT>0)return;RX.bubT=2.5;const now=S.day*24+S.hour;
  const cand=npcs.filter(n=>n.vis!==false&&n.loc!=='in'&&n.loc!=='gone'&&Math.hypot(n.x-P.x,n.z-P.z)<4.6&&!RX.bub.some(b=>b.n===n)&&!(RX.heard[n.def.id]>now-1.5));if(!cand.length)return;
  if(Math.random()>.45)return;const n=cand[(Math.random()*cand.length)|0],id=n.def.id;RX.heard[id]=now;
  const other=npcs.find(q=>q!==n&&q.vis!==false&&q.loc!=='in'&&Math.hypot(q.x-n.x,q.z-n.z)<2.6);const tier=rotTier();
  let pool=RX_SAY.any;if(other&&Math.random()<.6)pool=RX_SAY.pair;else if(tier&&Math.random()<.55)pool=RX_SAY.rot[Math.min(6,tier)].concat(RX_SAY.rot[Math.max(1,tier-1)]);
  else if(typeof raining==='function'&&raining()&&Math.random()<.6)pool=RX_SAY.rain;else if(P.spd>=4.5&&Math.random()<.7)pool=RX_SAY.run;
  const line=pool[(Math.random()*pool.length)|0];if(!line)return;RX.bub.push({n,line,t:0,life:3.4+line.length*.03});
  if(other&&pool===RX_SAY.pair){n.dir=dirOf(other.x-n.x,other.z-n.z);other.dir=dirOf(n.x-other.x,n.z-other.z);}else n.dir=dirOf(P.x-n.x,P.z-n.z);
  if(A.ok)for(let i=0;i<3;i++)A.tone(220+Math.random()*120,.06,'triangle',.012,{delay:i*.09,filter:['lowpass',900]});}
function rxBubDraw(){if(S.room)return;ctx2.font='10px monospace';ctx2.textAlign='center';
  for(const b of RX.bub){const n=b.n;if(n.vis===false)continue;const a=clamp(Math.min(b.t/.2,(b.life-b.t)/.4),0,1);const X=Math.round(sx(n.x)),Y=Math.round(sz(n.z));if(X<-80||X>VW+80)continue;
    const lines=[];let cur='';for(const w of b.line.split(' ')){if((cur+' '+w).length>24){lines.push(cur);cur=w;}else cur=cur?cur+' '+w:w;}lines.push(cur);
    const h=lines.length*11+6,wd=Math.min(VW-8,Math.max(...lines.map(l=>ctx2.measureText(l).width))+10),bx=clamp(X-wd/2,4,VW-4-wd),by=Y-62-h;
    ctx2.globalAlpha=a*.95;ctx2.fillStyle='#f2e4c4';ctx2.fillRect(Math.round(bx),by,Math.round(wd),h);ctx2.fillStyle='#5a4028';ctx2.fillRect(Math.round(bx),by+h,Math.round(wd),1);
    ctx2.fillStyle='#f2e4c4';ctx2.fillRect(X-2,by+h,5,2);ctx2.fillRect(X-1,by+h+2,3,2);ctx2.fillStyle='#2a1a0e';lines.forEach((l,i)=>ctx2.fillText(l,Math.round(bx+wd/2),by+10+i*11));}
  ctx2.globalAlpha=1;ctx2.textAlign='left';}
// ---------- the hidden rot made visible: tidier, brighter, and wrong
let RX_GLAMPS=null;
function rxTownDrawables(D,t){if(S.room)return;const tier=rotTier();if(!tier)return;
  if(!RX_GLAMPS&&typeof lamps!=='undefined'&&typeof GREEN!=='undefined'){const g=lamps.filter(l=>((l.x-GREEN.cx)/GREEN.rx)**2+((l.z-GREEN.cz)/GREEN.rz)**2<1.25).sort((a,b)=>Math.atan2(a.z-GREEN.cz,a.x-GREEN.cx)-Math.atan2(b.z-GREEN.cz,b.x-GREEN.cx));
    RX_GLAMPS=[];for(let i=0;i<g.length;i++){const a=g[i],b=g[(i+1)%g.length];if(a!==b&&Math.hypot(a.x-b.x,a.z-b.z)<12)RX_GLAMPS.push([a,b]);}}
  const FL=['#c83a2a','#e8c040','#3a6ab8','#f2ece0','#4a9a4a'];
  if(RX_GLAMPS)for(const [a,b] of RX_GLAMPS){if(!onScreen(a.x,a.z,240)&&!onScreen(b.x,b.z,240))continue;D.push({z:Math.max(a.z,b.z)+.02,mind:1,draw(){const x1=sx(a.x),y1=sz(a.z)-70,x2=sx(b.x),y2=sz(b.z)-70;const n=Math.max(4,Math.round(Math.hypot(x2-x1,y2-y1)/9));
    ctx2.strokeStyle='#3a2a1a';ctx2.beginPath();ctx2.moveTo(Math.round(x1),Math.round(y1));for(let i=1;i<=n;i++){const f=i/n;ctx2.lineTo(Math.round(x1+(x2-x1)*f),Math.round(y1+(y2-y1)*f+Math.sin(f*Math.PI)*12));}ctx2.stroke();
    for(let i=1;i<n;i++){const f=i/n,X=Math.round(x1+(x2-x1)*f),Y=Math.round(y1+(y2-y1)*f+Math.sin(f*Math.PI)*12),fl=Math.round(Math.sin(t*4+i)*1.2);ctx2.fillStyle=FL[i%5];ctx2.beginPath();ctx2.moveTo(X-3,Y);ctx2.lineTo(X+3,Y);ctx2.lineTo(X+fl,Y+6);ctx2.closePath();ctx2.fill();}}});}
  // red ribbons on every lamp post in town
  if(typeof lamps!=='undefined')for(const l of lamps){if(l.x<18||l.x>80||l.z<-45||l.z>50||!onScreen(l.x,l.z,60))continue;D.push({z:l.z+.01,mind:1,draw(){const X=Math.round(sx(l.x)),Y=Math.round(sz(l.z))-40,sw=Math.round(Math.sin(t*2.2+l.ph)*2);
    ctx2.fillStyle='#8a1a14';ctx2.fillRect(X-2,Y,5,3);ctx2.fillStyle='#b8261c';ctx2.fillRect(X-2,Y,5,1);ctx2.fillStyle='#8a1a14';ctx2.fillRect(X+sw,Y+3,1,6);ctx2.fillRect(X+2+sw,Y+3,1,5);ctx2.fillRect(X+sw-1,Y+9,1,1);}});}
  if(tier<2||typeof HOMES==='undefined')return;
  for(const [k,h] of Object.entries(HOMES)){const d=h.door;if(!d||d[0]<15||d[0]>90||!onScreen(d[0],d[1],80))continue;
    // a pot of flowers by the door (new, and bright) and a bowl on the step (newer, and dark)
    D.push({z:d[1]+.15,mind:1,draw(){const X=Math.round(sx(d[0]-.7)),Y=Math.round(sz(d[1]+.15));ctx2.fillStyle='rgba(10,14,8,.3)';ctx2.fillRect(X-4,Y,9,2);ctx2.fillStyle='#a8542e';ctx2.fillRect(X-3,Y-6,7,6);ctx2.fillStyle='#c86a3a';ctx2.fillRect(X-4,Y-7,9,2);
      ctx2.fillStyle='#3a7a2a';ctx2.fillRect(X-3,Y-10,7,3);for(const [dx,dy,c] of [[-3,-12,'#e8c040'],[0,-13,'#d83a5a'],[3,-11,'#f2ece0'],[-1,-10,'#d83a5a'],[2,-14,'#e8c040']]){ctx2.fillStyle=c;ctx2.fillRect(X+dx,Y+dy,2,2);}}});
    D.push({z:d[1]+.12,mind:1,draw(){const X=Math.round(sx(d[0]+.6)),Y=Math.round(sz(d[1]+.12));ctx2.fillStyle='rgba(10,14,8,.3)';ctx2.fillRect(X-4,Y,9,2);ctx2.fillStyle='#4a3a2a';ctx2.fillRect(X-4,Y-3,9,3);ctx2.fillStyle='#6a5440';ctx2.fillRect(X-4,Y-4,9,1);
      ctx2.fillStyle='#4a0c0a';ctx2.fillRect(X-3,Y-4,7,1);if(!isNight())for(let i=0;i<2;i++){const a=t*7+i*3+k.length;ctx2.fillStyle='#101010';ctx2.fillRect(X+Math.round(Math.cos(a)*4),Y-8+Math.round(Math.sin(a*1.3)*2),1,1);}}});
    if(tier>=6)D.push({z:d[1]-.28,mind:1,draw(){const X=Math.round(sx(d[0])),Y=Math.round(sz(d[1]-.35))-26;ctx2.strokeStyle='rgba(30,10,8,.8)';ctx2.beginPath();ctx2.arc(X+.5,Y+.5,3,0,6.283);ctx2.moveTo(X+.5,Y-4);ctx2.lineTo(X+.5,Y+5);ctx2.moveTo(X-4,Y+.5);ctx2.lineTo(X+5,Y+.5);ctx2.stroke();}});}}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);try{rxTownDrawables(D,t);}catch(e){}};}
// brighter days, and redder dusks, as the Ward fills
{const _am=ambient;ambient=function(h){const a=_am(h);const tier=rotTier();if(!tier||S.room)return a;
  const day=h>9&&h<16?.025*tier:0,dusk=tier>=4?Math.max(0,1-Math.abs(h-18.6)/1.8)*(tier-3)/3:0;
  return [a[0]*(1+day+.12*dusk),a[1]*(1+day-.04*dusk),a[2]*(1+day*.6-.1*dusk)];};}
function rxFrostK(){const h=S.hour;if(S.room||S.day<15||h<5.5||h>=9.4||(typeof raining==='function'&&rainDay(S.day)&&h>9))return 0;return clamp(Math.min((h-5.5)/.5,(9.4-h)/1.6),0,1)*clamp((S.day-14)/7,.5,1);}
// ---------- the music follows the hour, the weather, the place and the weeks; and the Ward darkens it
const MOODS={
  morning:{root:261.6,sc:[0,2,4,7,9],step:.4,oct:2,vol:.03},
  noon:{root:196,sc:[0,2,4,5,7,9,10],step:.5,oct:2,vol:.028},
  evening:{root:220,sc:[0,3,5,7,10],step:.7,oct:1,vol:.026},
  rain:{root:293.7,sc:[0,2,3,5,7,9,10],step:.85,oct:1,vol:.022},
  indoor:{root:329.6,sc:[0,2,4,7,9],step:.62,oct:2,vol:.018,box:1},
  wick:{root:164.8,sc:[0,1,3,5,7,8,10],step:.8,oct:2,vol:.024},
  frost:{root:246.9,sc:[0,2,3,7,8],step:.75,oct:2,vol:.022,box:1}};
function rxMood(){const h=S.hour;if(S.room)return 'indoor';if(typeof raining==='function'&&raining())return 'rain';if(P.x>92)return 'wick';if(S.day>=15&&h<9)return 'frost';if(h<11)return 'morning';if(h<16.5)return 'noon';return 'evening';}
function rxPhrase(key){let s=(hash(S.day*31+key.length*7,RX.mus.n*13+5)*1e6)|0;const r=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
  const M=MOODS[key],N=M.sc.length*M.oct,dark=clamp(rotK()*.9+autumnK()*.25,0,1);const A_=[];let deg=(r()*N/2)|0;
  for(let i=0;i<8;i++){if(i&&r()<.22+dark*.18){A_.push(-1);continue;}deg=clamp(deg+((r()*5)|0)-2,0,N-1);A_.push(deg);}
  const A2=A_.slice();A2[6]=clamp((A_[6]<0?deg:A_[6])+1,0,N-1);A2[7]=A_[0]<0?0:A_[0];
  const B=A_.map(d=>d<0?(r()<.5?-1:(r()*N)|0):clamp(N-1-d+((r()*3)|0)-1,0,N-1));
  return {notes:A_.concat(A2,B,A_,[-1,-1,-1,-1]),dark};}
function rxFreq(M,deg,dark){const sc=M.sc,o=Math.floor(deg/sc.length);let semi=sc[deg%sc.length];
  if(dark>0&&(semi===4||semi===9||semi===11)&&Math.random()<dark*.85)semi-=1;           // the major notes slip to minor
  if(dark>.6&&semi===7&&Math.random()<(dark-.6)*.6)semi=6;                              // and late on, the fifth goes sour
  return M.root*Math.pow(2,o+semi/12);}
const rxNote=SFX.note;SFX.note=function(f,v,night){if(night===false&&!RX.mus.own)return;if(night===true){const k=rotK();if(k>.3&&Math.random()<k*.25)f*=Math.pow(2,-1/12);
    return rxNote.call(SFX,f,v*(1-k*.25),true);}return rxNote.apply(SFX,arguments);};
function rxMusic(dt){if(!A.ok||S.mode!=='play')return;if(typeof nightAmt!=='undefined'&&nightAmt>.5&&!S.bound)return;
  const mu=RX.mus;mu.t-=dt;if(mu.t>0)return;const key=rxMood(),M=MOODS[key];
  if(key!==mu.key||!mu.ph||mu.step>=mu.ph.notes.length){mu.key=key;mu.n++;mu.ph=rxPhrase(key);mu.step=0;}
  const ph=mu.ph,deg=ph.notes[mu.step],dark=ph.dark;mu.t=M.step*(1+dark*.25)*(mu.step%8===7?1.4:1);
  if(mu.step%8===0&&mu.step<24){const bf=M.root/2*(mu.step===16?1.5:1);A.tone(bf,M.step*5,'sine',M.vol*.7,{verb:true,a:.05,detune:(Math.random()-.5)*dark*30});}
  mu.step++;if(deg<0)return;const f=rxFreq(M,deg,dark),v=M.vol*(S.room?.8:1);
  mu.own=1;if(M.box){A.tone(f,1.3,'sine',v,{verb:true,a:.005,detune:(Math.random()-.5)*dark*40});A.tone(f*3,.4,'sine',v*.22,{verb:true,a:.005});}else SFX.note(f,v,false);mu.own=0;}
// ---------- autumn moves on: frosty mornings from the third week, your breath in the cold
{const _do=depthOver;depthOver=function(t){_do(t);if(S.room||S.mode!=='play')return;rxBirdsDraw();
  const h=S.hour;const k=rxFrostK();if(k>0){ctx2.fillStyle=`rgba(222,234,250,${.08*k})`;ctx2.fillRect(0,0,VW,VH);
    for(let i=0;i<70;i++){const x=(hash(i,91)*VW)|0,y=(hash(i,92)*VH)|0,tw=Math.sin(t*3+i*1.7);if(tw<.6)continue;const wx=cam.x+(x-VW/2)/PPM,wz=cam.z+(y-VH*.56)/PPM;if(terr(wx,wz)!=='grass')continue;ctx2.fillStyle=`rgba(255,255,255,${(tw-.6)*2*k})`;ctx2.fillRect(x,y,1,1);if(tw>.9){ctx2.fillRect(x-1,y,3,1);ctx2.fillRect(x,y-1,1,3);}}}
  rxBubDraw();};}
function rxBreath(dt){if(S.mode!=='play')return;const cold=(S.day>=15&&S.hour<9.4)||(S.day>=8&&(isNight()||S.hour<6.5));if(!cold||(S.room&&S.room!=='mine'&&!/cellar/.test(S.room)))return;
  RX.breathT-=dt;if(RX.breathT>0)return;RX.breathT=1.8+Math.random()*.8;const fx=P.dir==='E'?.25:P.dir==='W'?-.25:0,fz=P.dir==='S'?.12:P.dir==='N'?-.1:0;
  for(let i=0;i<3;i++)parts.push({x:P.x+fx,z:P.z+fz,y:1.45,vx:fx*1.4+(Math.random()-.5)*.3,vz:fz,vy:4+Math.random()*.6,t:0,life:.9,col:'rgba(235,240,250,.45)',size:3});}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);const say={8:'Mid-autumn. The orchard is nearly bare and the mornings smell of smoke.',15:'Late autumn. Frost on the grass at first light; your breath hangs in the air.',22:'The last of the leaves are down. Everything sounds closer now.'}[S.day];
  if(say)setTimeout(()=>{if(S.mode==='play')toast(say,4);},8200);RX.prints.length=0;return r;};}
// ---------- tie it into the frame
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused)return;try{rxGrass(dt);rxBirds(dt);rxNpcSteps(dt);rxOverheard(dt);rxMusic(dt);rxBreath(dt);
    if(rotTier()>=3&&typeof NEAR!=='undefined'&&!NEAR.flock)NEAR.next-=dt*.8;}catch(e){if(!RX.err){RX.err=1;console.warn('reactive',e);}}};}
