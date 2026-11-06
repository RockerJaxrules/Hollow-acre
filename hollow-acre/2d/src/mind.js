/* ================= the mind: hidden sanity + hallucinations =================
   Nothing on the HUD says how sane you are. You find out from what the game starts doing to you.
   Drains: night, darkness, the Hollow watching you, scares. Recovers: daylight, lamps, people, sleep. */
const M={v:100,tierSeen:0,invert:0,clockT:0,clockTxt:'',objT:0,obj:null,flashT:0,tearT:0,ghostT:0,figs:[],dop:null,rush:null,prints:[],printAcc:0,
  lastSlam:0,lastFace:0,wasMoving:false,echo:[],banner:null,cd:{whisper:14,steps:10,fig:12,clock:25,obj:30,jacks:40,dop:45,invert:35,flash:22,banner:50,rush:45,tear:18,prints:20},jackSwap:[],blackout:false};
const tierOf=v=>v<20?4:v<40?3:v<60?2:v<80?1:0;
const pick=a=>a[(rand()*a.length)|0];
const WHISPERS=['…{name}…','it walks where you walk','the clock is lying to you','don’t look at the corn','you can hear it breathing, can’t you','you never left the car','grandpa says hello','it likes your face','count the pumpkins again','who is wearing your coat'];
const OBJ_LIES=[['Turn around','It is right behind you.'],['The car','You never left the car.'],['The well','Grandpa is still in the well. He can hear you.'],['Wake up','Wake up wake up wake up wake up'],['Hollow Acre','It knows your name now.'],['Stop','Put the phone down.']];
const BANNERS=[['MESSAGES','Grandpa','why did you leave me down here'],['MESSAGES','Unknown','I can see your hands.'],['MESSAGES','Mom','where are you?? the police found your car. there was nobody in it'],
  ['CALENDAR','Oct 31','Your funeral · All day'],['MESSAGES','You','dont go back inside the house'],['MESSAGES','Unknown','left. no, your other left.'],['PHONE','Missed call','Hollow Acre (3)']];
const NIGHTMARES=['You dreamed you were still in the car, upside down, and something was knocking on the glass with your own hand.',
  'You dreamed of the cornfield. Every stalk had your face. They all turned when you breathed.',
  'You dreamed Grandpa was standing at the foot of the bed. He wasn’t wearing his face.',
  'You dreamed you were planting seeds. They were teeth.'];
const TIER_MSG=['','Your hands won’t stop shaking.','You keep hearing your name. Nobody is saying it.','You’re not sure what is real any more.','Something is very wrong with you.'];
S.mind=100;
function mindPeek(){return M.v;}
function mindHit(n){M.v=clamp(M.v-n,0,100);}
function mindCalm(n){M.v=clamp(M.v+n,0,100);}

// ---------- the clock and the objective lie
const _objective=objective;
objective=function(){if(M.objT>0&&M.obj)return [M.obj[0],M.obj[1],M.obj[2]||null];return _objective();};
function mindHud(){if(M.clockT>0){ui.time.textContent=M.clockTxt;lastHud='';}}

// ---------- nightmares when you sleep badly; sleep itself heals
const _newDay=newDay;
newDay=function(msg,pos){const bad=M.v<55&&!S.bound;_newDay(bad?pick(NIGHTMARES):msg,pos);
  M.v=clamp(Math.max(M.v,bad?55:70)+25,0,100);M.figs.length=0;M.dop=null;M.rush=null;};

// ---------- fake phone banner, drawn over the game in the DOM
function banner(b){let el=M.banner;if(!el){el=document.createElement('div');el.id='mindBanner';document.body.appendChild(el);M.banner=el;
    const st=document.createElement('style');st.textContent=`#mindBanner{position:fixed;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:60;padding:11px 13px;border-radius:16px;
      background:rgba(38,38,42,.86);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);color:#f2f2f2;font:13px/1.35 -apple-system,system-ui,sans-serif;transform:translateY(-140%);transition:transform .35s cubic-bezier(.2,.9,.3,1.2);pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.5)}
      #mindBanner.on{transform:none}#mindBanner .a{font-size:11px;letter-spacing:.04em;opacity:.6;display:flex;justify-content:space-between}#mindBanner .f{font-weight:600;margin-top:3px}`;document.head.appendChild(st);}
  el.innerHTML=`<div class="a"><span>${b[0]}</span><span>now</span></div><div class="f">${b[1]}</div><div>${b[2]}</div>`;
  requestAnimationFrame(()=>el.classList.add('on'));SFX.note(1319,.05);setTimeout(()=>SFX.note(1760,.04),120);clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),4200);}

// ---------- spawn helpers
function aroundPlayer(minA,maxA,d0,d1){const f=Math.atan2(P.fz,P.fx);const s=rand()<.5?-1:1;const a=f+s*lerp(minA,maxA,rand());const d=lerp(d0,d1,rand());return {x:P.x+Math.cos(a)*d,z:P.z+Math.sin(a)*d};}
function facingDot(x,z){const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz)||1;return (dx*P.fx+dz*P.fz)/d;}

function mindUpdate(dt){
  if(S.mode!=='play'||S.paused)return;
  const night=isNight()&&!S.bound;
  // ---- drain / recover
  let r=0;
  if(night)r-=.22;if(night&&!lanternOn())r-=.8;
  if(H.vis&&(H.state==='stalk'||H.state==='watch'))r-=.4+danger*1.8;
  if(!night)r+=S.hour<18?.18:.05;
  if(night){for(const lp of lamps)if(!lp.dead&&Math.hypot(P.x-lp.x,P.z-lp.z)<3.2){r+=.45;break;}
    for(const h of HOUSES)if(h.lit&&Math.hypot(P.x-h.x,P.z-h.z+.5)<4){r+=.2;break;}
    for(const a of altars)if(a.lit&&Math.hypot(P.x-a.x,P.z-a.z)<4){r+=.6;break;}}
  for(const n of npcs)if(n.vis&&!night&&Math.hypot(P.x-n.x,P.z-n.z)<2.6){r+=.3;break;}
  M.v=clamp(M.v+r*dt,0,100);
  if(slamT>0&&M.lastSlam<=0)mindHit(11);M.lastSlam=slamT;
  for(const h of HOUSES)if(h.faceT>.5&&M.lastFace!==h){M.lastFace=h;mindHit(6);}
  const T=tierOf(M.v);
  if(T>M.tierSeen){M.tierSeen=T;toast(TIER_MSG[T],3.2,T>=3);}else if(T<M.tierSeen-1)M.tierSeen=T+1;
  for(const k in M.cd)M.cd[k]-=dt;
  if(M.invert>0)M.invert-=dt;if(M.clockT>0)M.clockT-=dt;if(M.objT>0)M.objT-=dt;if(M.flashT>0)M.flashT-=dt;if(M.tearT>0)M.tearT-=dt;
  const ready=(k,t,lo,hi,p)=>{if(T<t||M.cd[k]>0)return false;M.cd[k]=lerp(lo,hi,rand())*(1.25-T*.12);return rand()<(p||1);};
  const hidden=!H.vis||H.state==='gone';

  // ---- 1: whispers in the stereo field
  if(ready('whisper',1,16,32)){const pan=rand()<.5?-.9:.9;SFX.whisper(pan);if(rand()<.55)setTimeout(()=>{if(S.mode==='play')toast(pick(WHISPERS).replace('{name}','your name'),2.4,true);},700);}
  // ---- 1: footsteps that keep going after you stop
  const moving=P.spd>.2;
  if(M.wasMoving&&!moving&&T>=1&&M.cd.steps<=0&&rand()<.55){M.cd.steps=lerp(18,30,rand());const n=2+(rand()*3|0);for(let i=0;i<n;i++)setTimeout(()=>SFX.step(false),330*(i+1));}
  M.wasMoving=moving;
  // ---- 1: a figure at the edge of your vision that is gone when you look
  if(hidden&&ready('fig',1,12,24,night?1:.35)){const p=aroundPlayer(1.15,1.75,6.5,9.5);M.figs.push({x:p.x,z:p.z,t:0,life:7});}
  for(let i=M.figs.length-1;i>=0;i--){const f=M.figs[i];f.t+=dt;const d=Math.hypot(f.x-P.x,f.z-P.z);
    if(facingDot(f.x,f.z)>.8||d<4.2||f.t>f.life){if(f.t>.4&&rand()<.4)SFX.breath(0);M.figs.splice(i,1);}}
  // ---- 1 (night): wet footprints keep appearing beside yours
  if(night&&T>=1){M.printAcc+=P.spd*dt;if(M.printAcc>.7){M.printAcc=0;const s=M.prints.length%2?1:-1;M.prints.push({x:P.x-P.fz*.55*s-P.fx*1.4,z:P.z+P.fx*.55*s-P.fz*1.4,t:0,a:Math.atan2(P.fz,P.fx)});if(M.prints.length>40)M.prints.shift();}}
  for(const p of M.prints)p.t+=dt;while(M.prints.length&&M.prints[0].t>18)M.prints.shift();
  // ---- 2: the clock lies
  if(ready('clock',2,26,44)){M.clockT=2.2+rand()*2;M.clockTxt=pick(['3:33 AM','3:33 AM','??:??','12:00 AM','11:48 PM','—:— —']);}
  // ---- 2: the objective lies, and the arrow points somewhere else
  if(ready('obj',2,30,55)){const o=pick(OBJ_LIES);M.obj=[o[0],o[1],o[0]==='The car'?carPos:o[0]==='The well'?wellPos:(H.vis?{x:H.x,z:H.z}:null)];M.objT=3.4;}
  // ---- 2 (night): every pumpkin is smiling at you
  if(night&&ready('jacks',2,45,70)){M.jackSwap=[];for(const o of OBJ)if((o.spr==='pumpkin'||o.spr==='pumpkin_b')&&Math.hypot(o.x-P.x,o.z-P.z)<14){M.jackSwap.push([o,o.spr,o.glow]);o.spr='jack';o.glow=1;}
    if(M.jackSwap.length){SFX.face();setTimeout(()=>{for(const [o,s,g] of M.jackSwap){o.spr=s;o.glow=g;}M.jackSwap=[];},2600+rand()*1500);}}
  // ---- 2: a notification from someone who shouldn't be able to text you
  if(ready('banner',2,55,95,.8))banner(pick(BANNERS));
  // ---- 3: you, standing over there, doing what you do backwards
  if(!M.dop&&hidden&&ready('dop',3,40,70)){const p=aroundPlayer(.0,.5,8,10);M.dop={x:p.x,z:p.z,t:0,px:P.x,pz:P.z};}
  if(M.dop){const d=M.dop;d.t+=dt;d.x-=(P.x-d.px);d.z-=(P.z-d.pz);d.px=P.x;d.pz=P.z;if(Math.hypot(d.x-P.x,d.z-P.z)<3.5||d.t>6){M.dop=null;M.flashT=.07;SFX.tinnitus&&SFX.tinnitus();}}
  // ---- 3: your legs stop listening
  if(ready('invert',3,35,60,.7)){M.invert=1.2+rand()*1.2;if(!S.first.legs){S.first.legs=1;toast('Your legs don’t feel like yours.',2.2,true);}}
  // ---- 3: the picture tears / flashes negative
  if(ready('flash',3,20,40))M.flashT=.06+rand()*.06;
  if(ready('tear',3,14,26))M.tearT=.25+rand()*.3;
  // ---- 4: it runs at you out of nowhere — and isn't there
  if(!M.rush&&hidden&&ready('rush',4,35,60)){const p=aroundPlayer(0,.35,9,11);M.rush={x:p.x,z:p.z,t:0};SFX.shriek(0);}
  if(M.rush){const q=M.rush;q.t+=dt;const dx=P.x-q.x,dz=P.z-q.z,d=Math.hypot(dx,dz)||1;q.x+=dx/d*11*dt;q.z+=dz/d*11*dt;q.dir=dirOf(dx,dz);
    if(d<1.3){M.rush=null;faceSlam(.3,true);cam.shake=.5;setTimeout(()=>{if(S.mode==='play')toast('There is nothing there. There was never anything there.',2.8,true);},700);}}
  // ---- 0: you black out and wake up somewhere else
  if(M.v<=0&&!M.blackout)mindBlackout();
}
// (named apart from econ.js's blackout, which is passing out from exhaustion: one replaced the other and the screen stayed black)
function mindBlackout(){if(S.mode!=='play'){return;}M.blackout=true;S.mode='trans';fade(1);SFX.tinnitus&&SFX.tinnitus();
  const spots=[[carPos.x+1.5,carPos.z+3.6,'by the wreck of your car'],[CORN.x0+3,CORN.z0+4,'in the middle of the corn'],[58,-26,'between the graves'],[pond.x+pond.r+1.5,pond.z,'at the edge of the pond, ankle-deep']];
  const s=pick(spots);
  setTimeout(()=>{P.x=s[0];P.z=s[1];P.fx=0;P.fz=1;P.dir='S';S.hour=Math.min(25.5,S.hour+2.2);M.v=38;M.figs.length=0;M.dop=null;M.rush=null;M.prints.length=0;
    H.state='gone';H.vis=false;H.timer=10;fade(0);S.mode='play';M.blackout=false;
    toast(`You come to, ${s[2]}. You don’t remember walking here. Your hands are black with dirt.`,4.2,true);},2600);}
// input hook: called from the movement code
function mindInput(mx,mz){if(M.invert>0)return [-mx*.8,-mz*.8];return [mx,mz];}

// ---------- drawing
function mindDrawables(D){
  for(const f of M.figs)D.push({z:f.z,mind:1,draw(){const a=Math.min(1,f.t*2)*.6;drawSpr('hollow',sx(f.x),sz(f.z),'walk','S',0,{alpha:a});}});
  if(M.dop){const d=M.dop;D.push({z:d.z,mind:1,draw(){drawSpr('farmer',sx(d.x),sz(d.z),'walk',P.dir==='E'?'W':P.dir==='W'?'E':P.dir==='N'?'S':'N',P.spd>.2?frameOf('farmer','walk',P.t):0);}});}
  if(M.rush){const q=M.rush;D.push({z:q.z,mind:1,draw(){drawSpr('hollow',sx(q.x),sz(q.z),'walk',q.dir||'S',frameOf('hollow','walk',q.t*2));}});}
}
function mindGround(){if(!M.prints.length)return;ctx2.fillStyle='rgba(14,8,6,.55)';
  for(const p of M.prints){const a=clamp(1-p.t/18,0,1);if(a<=0)continue;ctx2.globalAlpha=a;const X=Math.round(sx(p.x)),Y=Math.round(sz(p.z));ctx2.fillRect(X-1,Y-2,3,4);ctx2.fillRect(X-1,Y+3,3,2);}
  ctx2.globalAlpha=1;}
function mindScreen(t){const k=1-M.v/100;if(S.mode==='title')return;
  // colour drains out of the world
  if(k>.15){ctx2.globalCompositeOperation='saturation';ctx2.fillStyle=`rgba(128,128,128,${Math.min(.75,(k-.15)*1.1)})`;ctx2.fillRect(0,0,VW,VH);ctx2.globalCompositeOperation='source-over';}
  // double vision that breathes
  const T=tierOf(M.v);
  if(T>=3){const o=Math.round(Math.sin(t*1.3)*(T>=4?3:2));if(o){ctx2.globalAlpha=.16;ctx2.drawImage(view,o,0);ctx2.globalAlpha=1;}}
  // the edges close in, in time with a heartbeat
  if(T>=2){const p=(Math.sin(t*(T>=4?7:4.4))+1)/2;const g=ctx2.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*(.42-k*.15),VW/2,VH/2,Math.max(VW,VH)*.7);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(10,0,2,${.25+k*.35+p*.12})`);ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
  // scanline tear
  if(M.tearT>0){for(let i=0;i<4;i++){const y=(hash(i,(t*20)|0)*VH)|0,h=4+((hash(i+3,(t*20)|0)*14)|0),dx=Math.round((hash(i+7,(t*30)|0)-.5)*24);ctx2.drawImage(view,0,y,VW,h,dx,y,VW,h);}}
  // one frame of negative
  if(M.flashT>0){ctx2.globalCompositeOperation='difference';ctx2.fillStyle='#fff';ctx2.fillRect(0,0,VW,VH);ctx2.globalCompositeOperation='source-over';}
}

/* ---------- more ways to lose it ---------- */
const TRAIL=[];let trailT=0;const CROPGLOW=[];   // where you were, for a reflection that lags behind you
M.cd.mimic=60;M.cd.watcher=40;M.cd.death=200;M.cd.hud=30;M.watcher=null;M.deathT=0;M.hudLie=0;
const MIMIC={mae:'Dear? Dear, come here. I have oil for you. Come into the corn, it’s warmer.',tobias:'I found a glowcap! It’s really big! Come see, it’s just past the trees!',
  hale:'Child. The bell. I need your help with the bell. This way.',agnes:'Ruth? Ruth, baby, is that you? Come back to the house.',hollis:'Got your part. Left it in the field. Don’t make me walk out there.',dunn:'Over here, kid. Over here. That’s it.'};
function mindUpdate2(dt){if(S.mode!=='play'||S.paused)return;const T=tierOf(M.v),night=isNight()&&!S.bound;
  trailT+=dt;if(trailT>.1){trailT=0;TRAIL.push({x:P.x,z:P.z,dir:P.dir,clip:P.clip,t:P.t});if(TRAIL.length>40)TRAIL.shift();}
  if(M.hudLie>0)M.hudLie-=dt;
  const ready=(k,t,lo,hi,p)=>{if(T<t||M.cd[k]>0)return false;M.cd[k]=lerp(lo,hi,rand())*(1.25-T*.12);return rand()<(p||1);};
  // a friend's voice from the dark, and something waiting where it came from
  if(night&&ready('mimic',2,55,90)){const ids=Object.keys(MIMIC);const id=pick(ids);const n=npcById(id);toast(`${n?n.def.name:'Someone'}, from the dark: “${MIMIC[id]}”`,4,true);
    SFX.whisper(rand()<.5?-.8:.8);if(H.state==='gone'&&rand()<.6)H.timer=Math.min(H.timer,2);}
  // someone you know, standing very still, watching
  if(!M.watcher&&ready('watcher',2,40,70,.8)){const ids=npcs.filter(n=>n.vis).map(n=>n.def.id);if(ids.length){const p=aroundPlayer(.6,1.2,3.8,4.8);M.watcher={id:pick(ids),x:p.x,z:p.z,t:0};}}
  if(M.watcher){const w=M.watcher;w.t+=dt;if(Math.hypot(w.x-P.x,w.z-P.z)<2.6||w.t>9||facingDot(w.x,w.z)>.93&&w.t>1.2){M.watcher=null;if(w.t>1)SFX.breath(0);}}
  // the HUD lies about the day
  if(ready('hud',2,35,60,.7)){M.hudLie=1.8;}
  if(M.hudLie>0)ui.day.textContent=pick(['Day 31','Day 0','Day 1','Day 1','Day 7']);else if(ui.day.textContent!=='Day '+S.day)ui.day.textContent='Day '+S.day;
  // you die. you don't.
  if(night&&T>=4&&ready('death',4,160,260,.6))fakeDeath();}
function fakeDeath(){S.mode='trans';const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;background:#000;z-index:80;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#b01818;font:700 42px Georgia,serif;letter-spacing:.12em;opacity:0;transition:opacity .2s';
  d.innerHTML='<div>YOU DIED</div><div id="fd2" style="font:400 15px Georgia,serif;color:#888;margin-top:18px;letter-spacing:.04em;opacity:0;transition:opacity 1s">Day '+S.day+'. Taken in the corn.</div>';document.body.appendChild(d);
  SFX.boom&&SFX.boom();requestAnimationFrame(()=>d.style.opacity=1);setTimeout(()=>{d.querySelector('#fd2').style.opacity=1;},700);
  setTimeout(()=>{d.firstChild.textContent='no.';d.firstChild.style.color='#ddd';d.querySelector('#fd2').textContent='not yet.';SFX.whisper(0);},2600);
  setTimeout(()=>{d.style.opacity=0;S.hour=Math.min(25.6,S.hour+.7);S.mode='play';mindHit(6);setTimeout(()=>d.remove(),400);},4200);}
const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);mindUpdate2(dt);};
// drawing hooks used by the renderer
function mindNPCOver(n,X,Y){if(!(isNight()&&tierOf(M.v)>=3))return;if(hash(n.def.id.length*7,S.day)>.6)return;ctx2.fillStyle='#d8c4ae';ctx2.fillRect(Math.round(X)-6,Math.round(Y)-40,12,9);ctx2.fillStyle='#c4ae98';ctx2.fillRect(Math.round(X)-6,Math.round(Y)-32,12,1);}
function mindCropOver(tl,X,Y){if(!(isNight()&&tierOf(M.v)>=2)||!tl.crop||tl.crop.stage<2)return;if(hash(tl.i*5+1,tl.j*3+S.day)>.55)return;
  const dx=clamp(Math.round((P.x-tl.x)*1.2),-1,1);CROPGLOW.push([X+dx,Y-8]);ctx2.fillStyle='#ffb24a';ctx2.fillRect(Math.round(X)-3+dx,Math.round(Y)-9,2,2);ctx2.fillRect(Math.round(X)+1+dx,Math.round(Y)-9,2,2);ctx2.fillRect(Math.round(X)-2+dx,Math.round(Y)-5,4,1);}
function mindWatcherDraw(D){if(!M.watcher)return;const w=M.watcher;D.push({z:w.z,mind:1,draw(){drawSpr(w.id,sx(w.x),sz(w.z),'walk',dirOf(P.x-w.x,P.z-w.z),0,{alpha:Math.min(1,w.t*1.5)});}});}
function mindReflection(){ // your reflection in the water, a little behind you. when you're far gone it stops copying you
  if(!onScreen(P.x,P.z,10))return;if(Math.abs(P.x-BRIDGE.x)<4.8&&P.z<-1.5&&P.z>-10)return;const T=tierOf(M.v);if(terr(P.x,P.z+1.1)!=='water'&&terr(P.x,P.z+1.6)!=='water')return;
  const lag=T>=1?Math.min(TRAIL.length-1,4+T*5):0;const r=T>=1&&TRAIL.length>lag?TRAIL[TRAIL.length-1-lag]:{x:P.x,z:P.z,dir:P.dir,clip:P.clip,t:P.t};
  const X=Math.round(sx(r.x)),Y=Math.round(sz(P.z))+4;ctx2.save();ctx2.beginPath();ctx2.rect(0,Y,VW,VH);ctx2.clip();ctx2.translate(0,Y*2);ctx2.scale(1,-1);ctx2.globalAlpha=.32;
  const dir=T>=3?'S':r.dir;drawSpr('farmer',X,Y,'walk',dir,r.clip==='walk'&&T<3?frameOf('farmer','walk',r.t):0);ctx2.restore();ctx2.globalAlpha=1;
  if(T>=3){ctx2.fillStyle='rgba(10,4,4,.6)';ctx2.fillRect(X-3,Y+26,6,1);}}
// shipping lies too
{const bin=interact.find(e=>e.x===binPos.x&&e.z===binPos.z);if(bin){const _a=bin.act;bin.act=function(){const n=S.basket.length;_a.call(this);if(tierOf(M.v)>=3&&n){toast(`Shipped ${n} teeth for 0 coins.`,1.2,true);setTimeout(()=>toast('No. You shipped crops. You shipped crops.',2),1300);}};}}
