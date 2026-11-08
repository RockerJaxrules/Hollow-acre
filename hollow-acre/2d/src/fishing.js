/* ================= fishing: the kinds of fish (where and when they bite, how hard they fight), the junk, and the first
   version of the cast and catch (replaced by fish3.js). ================= */
S.fishLog=S.fishLog||{};
const FISH=[
  // name, value, difficulty 0..1, behaviour, where ('pond' | 'creek' | 'any'), when ('day' | 'night' | 'any'), min/max length cm
  ['Yellow perch',6,.12,'smooth','any','day',14,26],['Sunfish',8,.18,'smooth','pond','day',10,18],['Mud carp',14,.38,'sinker','pond','any',30,60],
  ['Creek chub',7,.2,'smooth','creek','any',10,22],['Brook trout',16,.5,'dart','creek','day',20,38],['Largemouth bass',18,.48,'dart','pond','day',28,52],
  ['Channel catfish',20,.55,'sinker','any','night',40,80],['Pale eel',26,.62,'floater','pond','night',50,110],['Eyeless pike',30,.78,'dart','any','night',60,120],
  ['Hollow carp',40,.85,'mixed','pond','night',70,140]];
const FISH_ODD={'Eyeless pike':'It has no eyes. Where they should be, smooth skin. It is still looking at you.','Pale eel':'It is warm. Eels are not warm.','Hollow carp':'When you lift it, it is far too light. Something inside it rattles, like teeth in a jar.'};
const JUNK=[['A child’s sneaker',0,'Laces still tied. It’s dry.'],['A hair ribbon',0,'Blue, faded. Agnes would know it.'],['A rusted harmonica',2,'Someone has scratched E.M. into the side.'],['Your own house key',0,'It is your key. Your key is in your pocket.']];
const waterAt=(x,z)=>LAYERS.water(x,z);
function waterAhead(){for(const d of [1.2,1.8,2.4]){const x=P.x+P.fx*d,z=P.z+P.fz*d;if(waterAt(x,z))return [x,z];}return null;}
const hasRod=()=>true;
function fishWhere(x,z){return Math.hypot(x-pond.x,z-pond.z)<pond.r+3?'pond':'creek';}
function pickFish(where,night){const pool=FISH.filter(f=>(f[4]==='any'||f[4]===where)&&(f[5]==='any'||(f[5]==='night')===night));
  const w=pool.map(f=>Math.pow(1.05-f[2],1.6)*(S.rod>=3?1+f[2]:S.rod>=2?1+f[2]*.5:1));let r=rand()*w.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){r-=w[i];if(r<=0)return pool[i];}return pool[0];}
// ---- the cast
fish.power=0;
fishAct=function(){if(MG.on)return;
  if(fish.state==='off'){const w=waterAhead()||(Math.hypot(P.x-fishSpot.x,P.z-fishSpot.z)<1.6?[fishSpot.x,fishSpot.z+3]:null);if(!w){toast('Stand at the water’s edge, then tap the water with your rod.',1.8);return;}
    if(!spend(1))return;fish.state='power';fish.t=0;fish.aim=w;fish.bx=P.x+P.fx*.8;fish.bz=P.z+P.fz*.8;toast((matchMedia('(pointer:fine)').matches?'Click':'Tap')+' again to cast. The longer you wait, the further it goes.',1.8);return;}
  if(fish.state==='power'){const pw=fish.power;const [wx,wz]=fish.aim;let bx=P.x+P.fx*(1.4+pw*3.2),bz=P.z+P.fz*(1.4+pw*3.2);if(!waterAt(bx,bz)){bx=wx;bz=wz;}
    fish.bx=bx;fish.bz=bz;fish.where=fishWhere(bx,bz);fish.state='wait';fish.cast=pw;fish.t=(2+rand()*5)*(inv('bait')>0?.4:1)*(1.15-pw*.3);if(inv('bait')>0)takeInv('bait');
    SFX.splash&&SFX.splash(.3);burst(bx,bz,6,'#9fc0e0',1.2,.5,2);return;}
  if(fish.state==='wait'){fish.state='off';toast('You reel in too early. Nothing.',1.4);return;}
  if(fish.state==='bite'){const night=isNight();
    if(night&&!S.bound&&rand()<.12){fish.state='off';SFX.stinger();cam.shake=.4;mindHit&&mindHit(4);toast(pick(['A grey hand comes up with the hook in its palm. It lets go.','The line goes slack. Something below the water says your name, very politely.','You pull up a fistful of long hair. It is the same colour as yours.']),3.2,true);return;}
    const f=rand()<(night?.07:.04)?null:pickFish(fish.where,night);startMG(f);}};
fishUpdate=function(dt){if(fish.state==='off'||MG.on)return;
  if(fish.state==='power'){fish.t+=dt;fish.power=.5-.5*Math.cos(fish.t*3.2);return;}
  if(Math.hypot(P.x-fish.aim[0],P.z-fish.aim[1])>3.2){fish.state='off';return;}
  fish.t-=dt;if(fish.state==='wait'&&fish.t<=0){fish.state='bite';fish.t=.85;SFX.splash&&SFX.splash(.45);try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}toast('!',.6);}
  else if(fish.state==='bite'&&fish.t<=0){toast('It got away.',1.2);fish.state='wait';fish.t=2+rand()*4;}};
// fishing from any shore
{const _cc=computeContext;computeContext=function(){const c=_cc();if((c&&c.label)||S.room)return c;
  if(fish.state!=='off')return {label:fish.state==='power'?'Cast!':fish.state==='bite'?'Hook it!':'Waiting…',ok:true,act:fishAct};
  if(waterAhead()&&!P.anim)return {label:'Fish',ok:true,act:fishAct};return c;};}
{const it=interact.find(q=>q.x===fishSpot.x&&q.z===fishSpot.z);if(it){it.label=()=>fish.state==='off'?'Fish':fish.state==='power'?'Cast!':fish.state==='bite'?'Hook it!':'Waiting…';it.ok=()=>true;}}
// the power meter over your head while you wind up
{const _dp=typeof drawHud==='function'?drawHud:null;
  const css=document.createElement('style');css.textContent=`#fishPow{position:fixed;left:50%;top:38%;width:16px;height:80px;margin-left:30px;background:#2a1608;box-shadow:inset 0 0 0 2px #1a0e06,0 0 0 2px #8a5a2a;display:none;z-index:7}
#fishPow i{position:absolute;left:3px;right:3px;bottom:3px;background:linear-gradient(#e8504a,#f0c040 50%,#7cc04a)}
#fishMG{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;touch-action:none;user-select:none;background:rgba(6,10,14,.35)}
#fishMG .frame{position:relative;width:86px;height:min(62vh,420px);background:#5a3418;box-shadow:inset 0 0 0 3px #1a0e06,inset 0 0 0 6px #b8823c,inset 0 0 0 9px #5a3418,0 6px 0 #1a0e06}
#fishMG .water{position:absolute;left:12px;top:12px;bottom:12px;width:36px;background:linear-gradient(#2a5a8a,#16365a);box-shadow:inset 0 0 0 2px #0a1a2a;overflow:hidden}
#fishMG .zone{position:absolute;left:2px;right:2px;background:rgba(124,220,90,.55);box-shadow:inset 0 0 0 2px #b8f080,inset 0 0 0 4px rgba(40,90,30,.6)}
#fishMG .zone.on{background:rgba(160,250,110,.7)}
#fishMG .fishi{position:absolute;left:4px;width:28px;height:28px;margin-top:-14px;image-rendering:pixelated}
#fishMG .reel{position:absolute;right:12px;top:12px;bottom:12px;width:14px;background:#1a0e06;box-shadow:inset 0 0 0 2px #0a0604}
#fishMG .reel i{position:absolute;left:2px;right:2px;bottom:2px;background:linear-gradient(#f0c040,#e86a2a)}
#fishMG .hint{position:absolute;bottom:-34px;left:50%;transform:translateX(-50%);white-space:nowrap;font:13px 'Pixelify Sans',monospace;color:#fff4dc;text-shadow:1px 1px 0 #000}
#fishMG.horror .water{background:linear-gradient(#3a0a0a,#120404)}#fishMG.horror .fishi{filter:hue-rotate(160deg) brightness(.8)}`;document.head.appendChild(css);
  const pw=document.createElement('div');pw.id='fishPow';pw.innerHTML='<i></i>';document.body.appendChild(pw);
  setInterval(()=>{pw.style.display=fish.state==='power'?'block':'none';pw.firstChild.style.height=(fish.power*74)+'px';},33);}
// ---- the catch bar
const MG={on:false};
{const el=document.createElement('div');el.id='fishMG';el.innerHTML='<div class="frame"><div class="water"><div class="zone"></div><img class="fishi" alt=""></div><div class="reel"><i></i></div><div class="hint">Hold to lift the bar</div></div>';document.body.appendChild(el);
  const down=e=>{if(!MG.on)return;MG.hold=true;e.preventDefault&&e.preventDefault();},up=()=>{MG.hold=false;};
  el.addEventListener('pointerdown',down);addEventListener('pointerup',up);addEventListener('pointercancel',up);
  addEventListener('keydown',e=>{if(MG.on&&(e.code==='Space'||e.code==='Enter'||e.code==='KeyC')){MG.hold=true;e.preventDefault();e.stopPropagation();}},true);
  addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC')MG.hold=false;},true);}
function startMG(f){const el=$('fishMG');Object.assign(MG,{on:true,f,hold:false,zone:.1,zv:0,fy:.3,fv:0,ft:.3,tt:0,prog:.32,
  size:S.rod>=3?.36:S.rod>=2?.31:.26,d:f?f[2]:.25,beh:f?f[3]:'smooth',last:performance.now(),scare:false});
  el.classList.toggle('horror',isNight()&&!!f&&f[2]>.6);el.querySelector('.fishi').src=iconOf(f?'fish':'stone');el.style.display='flex';S.paused=true;fish.state='reel';
  requestAnimationFrame(mgStep);}
function mgStep(now){if(!MG.on)return;const dt=Math.min(.05,(now-MG.last)/1000);MG.last=now;const el=$('fishMG');
  // your bar: lifts while held, falls when let go, bounces off the floor
  MG.zv+=(MG.hold?2.1:-1.9)*dt;MG.zv=clamp(MG.zv,-1.4,1.4);MG.zone+=MG.zv*dt;if(MG.zone<0){MG.zone=0;MG.zv=-MG.zv*.35;}if(MG.zone>1-MG.size){MG.zone=1-MG.size;MG.zv=0;}
  // the fish: picks a new depth now and then and swims toward it in its own way
  MG.tt-=dt;const d=MG.d;if(MG.tt<=0){MG.tt=(MG.beh==='dart'?.35:MG.beh==='mixed'?.5:.9)+rand()*(1.4-d);
    let t=rand();if(MG.beh==='sinker')t=t*t;if(MG.beh==='floater')t=1-t*t;if(MG.beh==='dart'&&rand()<.5)t=MG.fy+(rand()<.5?-1:1)*(.25+d*.3);MG.ft=clamp(t,.02,.98);
    if(isNight()&&!MG.scare&&rand()<.06&&MG.f&&MG.f[2]>.6){MG.scare=true;MG.ft=0;el.querySelector('.hint').textContent='It pulls back.';cam.shake=.3;SFX.stinger&&SFX.stinger();}}
  const spd=(MG.beh==='dart'?2.6:MG.beh==='mixed'?2.2:1.2)*(.5+d);MG.fv+=((MG.ft-MG.fy)*spd*3-MG.fv*2.4)*dt;MG.fy=clamp(MG.fy+MG.fv*dt,0,1);
  const inside=MG.fy>=MG.zone&&MG.fy<=MG.zone+MG.size;MG.prog+=(inside?.24:-.17*(1+d*.6))*dt;
  const W=el.querySelector('.water'),H=W.clientHeight;const z=el.querySelector('.zone');z.style.height=(MG.size*H)+'px';z.style.top=((1-MG.zone-MG.size)*H)+'px';z.classList.toggle('on',inside);
  el.querySelector('.fishi').style.top=((1-MG.fy)*H)+'px';el.querySelector('.reel i').style.height=(clamp(MG.prog,0,1)*100)+'%';
  if(MG.prog>=1){endMG(true);return;}if(MG.prog<=0){endMG(false);return;}requestAnimationFrame(mgStep);}
function endMG(ok){MG.on=false;MG.hold=false;$('fishMG').style.display='none';$('fishMG').querySelector('.hint').textContent='Hold to lift the bar';S.paused=false;fish.state='off';
  if(!ok){toast(MG.f?`The ${MG.f[0].toLowerCase()} got away.`:'It got away.',1.6);SFX.thud&&SFX.thud(0,.2);return;}
  if(!MG.f){const j=pick(JUNK);if(j[1])S.basket.push({kind:'fish',value:j[1]});SFX.splash&&SFX.splash();toast(`You reel in… ${j[0].toLowerCase()}. ${j[2]}`,3,true);if(/key|sneaker/.test(j[0]))mindHit&&mindHit(2);return;}
  const f=MG.f;const len=Math.round(f[6]+rand()*(f[7]-f[6]));const big=(len-f[6])/(f[7]-f[6]);let v=Math.round(f[1]*(.8+big*.5)*(S.rod>=3?2:S.rod>=2?1.5:1));
  S.basket.push({kind:'fish',value:v});S.fishCaught=(S.fishCaught||0)+1;S.fishLog[f[0]]=Math.max(S.fishLog[f[0]]||0,len);
  SFX.splash&&SFX.splash();burst(fish.bx,fish.bz,16,'#9fc0e0',2,.7,3);
  toast(`${S.fishLog[f[0]]===len&&len>0?'New! ':''}${f[0]}, ${len} cm. Worth ${v}.${FISH_ODD[f[0]]?' '+FISH_ODD[f[0]]:''}`,FISH_ODD[f[0]]?3.4:2.2,!!FISH_ODD[f[0]]);
  if(FISH_ODD[f[0]])mindHit&&mindHit(2);updateHud();}
