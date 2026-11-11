/* ================= fishing, our own way.
   The cast: tap the water where you want the float to land (within your rod's reach); no power meter.
   The bite: fish nibble first (the float twitches; strike now and you spook them), then one takes: the float is dragged under
   and a wake runs off. Strike then.
   The fight: a look down into the water. The fish is a shadow at the end of your line (you don't know what it is until it's
   in the net). Hold to reel it toward the net at your feet, let go to give it line. It runs (give it line, or the line takes
   the strain), it jumps (let go, or the line snaps), and it tires (that's when you reel). The strain shows in the line itself
   and on the dial of the reel. It's landed when it reaches the net; it's lost if the line snaps, or if it gets past the deep
   water and throws the hook. ================= */
const FIGHT={W:212,H:92};
const rodRange=()=>2.6+(S.rod||1)*.9;
// a point on the water within reach, on the way to where you tapped (or straight ahead)
function castTarget(wx,wz){let dx=wx-P.x,dz=wz-P.z;const d=Math.hypot(dx,dz)||1;const R=rodRange();const k=Math.min(1,R/d);
  for(let s=k;s>.12;s-=.04){const x=P.x+dx*s,z=P.z+dz*s;if(waterAt(x,z)&&Math.hypot(x-P.x,z-P.z)>.9)return [x,z];}return null;}
function castAhead(){const R=rodRange();for(let d=R*.7;d>=.9;d-=.2){const x=P.x+P.fx*d,z=P.z+P.fz*d;if(waterAt(x,z))return [x,z];}return null;}
// ---------- the cast, the wait, the nibbles, the take, the strike
fishAct=function(){if(MG.on)return;const now=performance.now();
  if(fish.state==='off'){let aim=null;
    if(fish.tap&&now-fish.tap[2]<400){aim=castTarget(fish.tap[0],fish.tap[1]);fish.tap=null;}
    if(!aim)aim=castAhead()||(Math.hypot(P.x-fishSpot.x,P.z-fishSpot.z)<1.6?[fishSpot.x,fishSpot.z+3]:null);
    if(!aim){toast('Face the water and tap where you want to cast.',1.8);return;}
    if(!spend(1))return;faceTo&&faceTo(aim[0],aim[1]);
    fish.state='power';fish.t=0;fish.power=0;fish.p0=now;fish.aim=aim;fish.bx=P.x+P.fx*.8;fish.bz=P.z+P.fz*.8;
    if(!S.castTold||S.castTold<3){S.castTold=(S.castTold||0)+1;toast(fineP()?'Hold to wind up; let go when the power is in the bright band for a perfect cast.':'Hold to wind up; let go in the bright band for a perfect cast.',2.4);}return;}
  if(fish.state==='power'){fishCast3();return;}   // let go: cast now, at whatever power the meter is at
  if(fish.state==='wait'){fish.state='off';F2.rip=[];toast(now-(fish.lastNib||0)<800?'Too soon: that was only a nibble, and now it’s gone. Wait for the float to be pulled right under.':'Nothing has taken it yet. Wait for the float to be pulled right under.',2.2);return;}
  if(fish.state==='bite'){const night=isNight();
    if(night&&!S.bound&&rand()<.12){fish.state='off';SFX.stinger();cam.shake=.4;mindHit&&mindHit(4);toast(pick(['A grey hand comes up with the hook in its palm. It lets go.','The line goes slack. Something below the water says your name, very politely.','You pull up a fistful of long hair. It is the same colour as yours.']),3.2,true);return;}
    const f=rand()<(night?.07:.04)?null:pickFish(fish.where,night);startMG(f);}};
// the throw itself: a perfect cast (let go inside the sweet band) bites sooner and makes treasure far likelier
function fishCast3(){if(fish.state!=='power')return;const pw=fish.power,good=pw>=FC.lo&&pw<=FC.hi;fish.goodCast=good;
  const [bx,bz]=fish.aim;fish.bx=bx;fish.bz=bz;fish.where=fishWhere(bx,bz);fish.state='wait';const reach=Math.hypot(bx-P.x,bz-P.z)/rodRange();
  let w=(2+rand()*4.5)*(inv('bait')>0?.4:1)*(typeof hasProf==='function'&&hasProf('trapper')?.5:1)*(good?.66:1);if(inv('bait')>0)takeInv('bait');
  fish.t=w;fish.nib=good?(rand()<.6?0:1):(rand()<.25?0:1+Math.floor(rand()*3));fish.dip=0;fish.reach=reach;
  F2.cast=performance.now();F2.landed=false;F2.pw=reach;F2.rip=[];SFX.swing&&SFX.swing();
  if(good){toast('Perfect cast!',1.0);SFX.coin&&SFX.coin();cam&&(cam.shake=Math.max(cam.shake||0,.1));}else if(pw>.95)toast('A wild cast — it slaps the water.',.9);}
fishUpdate=function(dt){if(fish.state==='off'||MG.on)return;const now=performance.now();
  // wind-up: the power swings up and down — let go (tap/Space up) in the bright band; a safety throw if you never do
  if(fish.state==='power'){fish.t+=dt;fish.power=.5-.5*Math.cos(fish.t*3.0);if(fish.t>4.2)fishCast3();return;}
  if(!F2.landed&&now-F2.cast>560){F2.landed=true;burst(fish.bx,fish.bz,9,'#cfe6f8',1.3,.6,2);SFX.splash&&SFX.splash(.3);F2.rip.push(now);}
  if(Math.hypot(P.x-fish.bx,P.z-fish.bz)>rodRange()+1.6){fish.state='off';return;}
  if(!F2.landed)return;fish.t-=dt;fish.dip=Math.max(0,(fish.dip||0)-dt);
  if(fish.state==='wait'&&fish.t<=0){
    if(fish.nib>0){fish.nib--;fish.lastNib=now;fish.dip=.32;fish.t=.55+rand()*.9;F2.rip.push(now);SFX.page&&SFX.page();}
    else{fish.state='bite';fish.t=.8+((S.rod||1)-1)*.08;fish.take=now;F2.rip.push(now);SFX.splash&&SFX.splash(.5);try{navigator.vibrate&&navigator.vibrate([40,30,70]);}catch(e){}}}
  else if(fish.state==='bite'&&fish.t<=0){toast('It took the bait and ran. Strike sooner.',1.6);fish.state='wait';fish.t=2+rand()*4;fish.nib=rand()<.5?1:0;}};

// ---------- the float at the water: nibbles twitch it, the take drags it under and a wake runs off. No pop-up mark; you watch.
fishDraw=function(g,tip,X,Y,t){const now=performance.now();
  if(F2.show&&now<F2.show.until){const im=fishIconCanvas(F2.show.sp);const bob=Math.round(Math.sin(t*4));g.drawImage(im,0,0,32,32,Math.round(X-11),Math.round(Y-76+bob),22,22);}
  if(fish.state==='off'&&!MG.on)return;const from=tip||[X+8,Y-36];
  if(fish.state==='power'){const bx=from[0],by=from[1]+9;fishLine(g,from,[bx,by-6],true,t);fishFloat(g,bx,by,0,true);fishMeter(g,X+16,Y-60,fish.power);return;}
  const tx=sx(fish.bx),ty=sz(fish.bz);const u=Math.min(1,(now-F2.cast)/560);
  if(!F2.landed&&u<1){const bx=from[0]+(tx-from[0])*u,by=from[1]+(ty-from[1])*u-Math.sin(u*Math.PI)*(14+F2.pw*24);fishLine(g,from,[bx,by-6],true,t);fishFloat(g,bx,by,0,true);return;}
  const bite=fish.state==='bite',mg=MG.on;fishRipples(g,tx,ty,now,bite||mg);
  if(bite||mg){// pulled under, a V of ripples running away from you
    const dx=tx-sx(P.x),dy=ty-sz(P.z),dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl;const run=bite?Math.min(1,(now-(fish.take||now))/700):.6+.4*Math.sin(t*3);
    const hx=tx+ux*(4+run*10),hy=ty+uy*(2+run*5);g.fillStyle='rgba(232,246,255,.75)';
    for(let k=1;k<7;k++){const bx=hx-ux*k*2,by=hy-uy*k*1;g.fillRect(Math.round(bx-uy*k*1.1),Math.round(by+ux*k*.6),1,1);g.fillRect(Math.round(bx+uy*k*1.1),Math.round(by-ux*k*.6),1,1);}
    const jit=Math.round(Math.sin(t*38));fishLine(g,from,[hx+jit,hy-1],true,t);g.fillStyle='rgba(200,40,30,.5)';g.fillRect(Math.round(hx),Math.round(hy),1,1);return;}
  const sub=fish.dip>0?(fish.dip>.18?2:1):0;const jit=fish.dip>0?Math.round(Math.sin(t*44)):0;
  fishLine(g,from,[tx+jit,ty-4],fish.dip>0,t);fishFloat(g,tx+jit,ty+(fish.dip>0?0:Math.round(Math.sin(t*2.4)*.8)),sub,false);};

// ---------- the fight
{const el=$('fishMG');const old=el.querySelector('.fg');if(old)old.style.display='none';
  const cv=document.createElement('canvas');cv.className='f3';cv.width=FIGHT.W;cv.height=FIGHT.H;el.appendChild(cv);
  const css=document.createElement('style');css.textContent=`#fishMG .f3{position:absolute;left:50%;top:max(12px,calc(30% - var(--f3h,140px) * .5));transform:translateX(-50%);image-rendering:pixelated;filter:drop-shadow(0 5px 0 rgba(0,0,0,.45))}
#fishMG .fg{display:none!important}#fishMG .fhint{bottom:auto;top:calc(max(12px,calc(30% - var(--f3h,140px) * .5)) + var(--f3h,140px) + 10px)}`;document.head.appendChild(css);}
const fightLen=f=>f?(f[6]+f[7])/2:30;
startMG=function(f){const el=$('fishMG');const night=isNight();const d=f?f[2]:.15;
  const sk=typeof skLvl==='function'?skLvl('fishing'):0;const steady=typeof hasProf==='function'&&hasProf('steady');
  Object.assign(MG,{on:true,f,hold:false,d,beh:f?f[3]:'junk',sp:f?FISH_SP[f[0]]:null,last:performance.now(),age:0,
    x:.8,y:.45,vy:0,ty:.45,tension:.25,phase:'tire',pt:1.2,stam:1,snapT:0,escT:0,perfect:true,spool:0,jt:0,land:0,lost:null,
    horror:night&&!!f&&d>.6,scare:false,heading:1,wob:0,bub:[],spl:[],
    reel:.14*(1+((S.rod||1)-1)*.18)*(1+sk*.015),gain:(1-((S.rod||1)-1)*.11)*(1-sk*.012)*(steady?.85:1),
    tr:null,len:fightLen(f)});
  // whole pixels when there's room; never wider than the screen
  let k=Math.min(4,innerWidth*.96/FIGHT.W,innerHeight*.46/FIGHT.H);if(k>=2)k=Math.floor(k);const cv=el.querySelector('.f3');cv.style.width=FIGHT.W*k+'px';cv.style.height=FIGHT.H*k+'px';
  el.style.setProperty('--f3h',FIGHT.H*k+'px');
  el.querySelector('.fhint').textContent=fineP()?'Hold the mouse button (or Space) to reel in · let go when it runs or jumps':'Hold to reel in · let go when it runs or jumps';
  el.style.display='flex';S.paused=true;fish.state='reel';requestAnimationFrame(mgStep);};
// what the fish does next: run, jump, or rest. Every kind has its own temper
const JUMPY={floater:.42,dart:.26,mixed:.3,smooth:.12,sinker:.04,junk:0};
function fightNext(){const M=MG,d=M.d;if(M.beh==='junk'){M.phase='tire';M.pt=9;return;}
  if(M.phase!=='tire'){M.phase='tire';M.pt=(1.1+rand()*1.4)*(1.25-d*.55)*(1+(1-M.stam)*.8);return;}
  const r=rand();if(r<JUMPY[M.beh]*(.6+d*.6)&&M.age>1.2){M.phase='tell';M.pt=.45;return;}
  M.phase='run';M.pt=(.6+rand()*.9)*(.7+d*.8)*(M.beh==='sinker'?1.5:M.beh==='dart'?.65:1);M.ty=clamp(M.y+(rand()<.5?-1:1)*(.2+rand()*.3),.12,.88);}
mgStep=function(now){if(!MG.on)return;const M=MG;const dt=Math.min(.05,(now-M.last)/1000);M.last=now;M.age+=dt;const el=$('fishMG');
  if(window.FISH_AUTO)M.hold=fishAuto();
  if(M.land>0){M.land+=dt;fightDraw(now);if(M.land>.55){endMG(true);return;}requestAnimationFrame(mgStep);return;}
  if(M.lost){M.lostT+=dt;fightDraw(now);if(M.lostT>.6){fightLose(M.lost);return;}requestAnimationFrame(mgStep);return;}
  const d=M.d,hold=M.hold;M.pt-=dt;if(M.pt<=0){if(M.phase==='tell'){M.phase='jump';M.pt=.55;SFX.splash&&SFX.splash(.5);M.spl.push({x:M.x,y:M.y,t:0});}else fightNext();}
  // the night fish that pulls back
  if(M.horror&&!M.scare&&M.age>2&&rand()<dt*.06){M.scare=true;M.phase='run';M.pt=1.3;M.ty=.5;el.querySelector('.fhint').textContent='It pulls back.';cam.shake=.3;SFX.stinger&&SFX.stinger();}
  const str=(.45+.55*M.stam)*(M.scare&&M.phase==='run'?1.8:1);let tgt,mv;
  if(M.phase==='run'){const v=(.07+.17*d)*str;mv=hold?v*.3-M.reel*.3:v*.75;tgt=hold?.62+.62*d*str:.2+.18*d;M.stam=Math.max(.12,M.stam-dt*.2*(1.25-d*.5));}
  else if(M.phase==='tell'){mv=hold?-M.reel*.6:.01;tgt=hold?.5+.2*d:.08;}
  else if(M.phase==='jump'){mv=hold?-M.reel*.2:.03;tgt=hold?1.35:.06;}
  else{const heavy=M.beh==='junk';mv=hold?-M.reel*(heavy?.55:1):.012+d*.012;tgt=hold?(heavy?.62:.4+.12*d):.07;M.stam=Math.min(1,M.stam+dt*.035);}
  if(hold)tgt=.07+(tgt-.07)*M.gain;
  M.tension+=(tgt-M.tension)*Math.min(1,dt*(tgt>M.tension?(hold?4.2:2.4):3.4));
  M.x=clamp(M.x+mv*dt,0,1.05);
  if(M.tension>.86&&M.age>.4)M.perfect=false;
  if(M.tension>=1){M.snapT+=dt;if(M.snapT>.28){M.lost='snap';M.lostT=0;SFX.thud&&SFX.thud(0,.4);cam.shake=.2;}}else M.snapT=Math.max(0,M.snapT-dt*2);
  if(M.x>=1.0){M.escT+=dt;if(M.escT>1.5){M.lost='hook';M.lostT=0;}}else M.escT=Math.max(0,M.escT-dt*2);
  if(M.x<=.06&&!M.lost){M.land=.001;SFX.splash&&SFX.splash(.6);}
  // sideways: it swims about while it rests and cuts across while it runs
  if(M.phase==='tire'&&rand()<dt*.8)M.ty=clamp(M.y+(rand()-.5)*.5,.15,.85);
  M.vy+=((M.ty-M.y)*(M.phase==='run'?6:2.2)-M.vy*2.6)*dt;M.y=clamp(M.y+M.vy*dt,.08,.92);M.heading+=((mv>0?1:-1)-M.heading)*Math.min(1,dt*5);
  if(hold)M.spool+=dt*14;M.wob+=dt*(M.phase==='run'?16:6);
  if(M.phase==='tire'&&rand()<dt*2.2)M.bub.push({x:M.x,y:M.y,t:0});M.bub=M.bub.filter(b=>(b.t+=dt)<1.1);M.spl=M.spl.filter(s=>(s.t+=dt)<.9);
  // the hint follows what's happening
  if(!M.scare||M.age%3<.05){const h=el.querySelector('.fhint');const txt=M.snapT>0?'Ease off! The line can’t take it.':M.phase==='tell'||M.phase==='jump'?'It’s going to jump: let go!':M.escT>0?'It’s nearly away: reel!':M.phase==='run'?'It’s running: give it line.':'It’s tiring: reel it in.';
    if(M.age>1.5&&h._t!==txt){h._t=txt;h.textContent=txt;}}
  fightDraw(now);requestAnimationFrame(mgStep);};
// for tests: reels when it's sensible
function fishAuto(){const M=MG;if(M.phase==='tell'||M.phase==='jump')return false;if(M.tension>.8)return false;if(M.phase==='run')return M.tension<.45&&M.d<.4;return M.escT>0||M.tension<.75;}
function fightLose(why){MG.on=false;MG.hold=false;$('fishMG').style.display='none';S.paused=false;fish.state='off';F2.rip=[];
  const nm=MG.f?MG.f[0].toLowerCase():'whatever it was';
  toast(why==='snap'?`Snap! The line broke and the ${nm} is gone. Let go when it runs or jumps.`:`The ${nm} reached the deep water and threw the hook.`,2.6);SFX.thud&&SFX.thud(0,.2);}
// landing: now and then something else comes up tangled in the line
{const _end=endMG;endMG=function(ok){if(ok&&MG.f&&rand()<.12)MG.tr={got:true};else MG.tr=null;return _end.apply(this,arguments);};}
fishTreasure=function(){const R=[['coins',20+Math.floor(rand()*30)],['bait',3],['copper',4],['iron',2],['coal',4],['gem',1]].filter(r=>r[0]==='coins'||ITEMS[r[0]]);const r=pick(R);
  if(r[0]==='coins')S.coins+=r[1];else addInv(r[0],r[1]);SFX.coin&&SFX.coin();
  toast(`Something was tangled in the line: ${r[0]==='coins'?'a pouch with '+r[1]+' coins':r[1]+' × '+((ITEMS[r[0]]&&ITEMS[r[0]].name)||r[0]).toLowerCase()}.`,2.6);updateHud();};

// ---------- drawing the fight: looking down into the water from the bank
const F3C={bg:null,key:''};
function fightBg(night,horror){const key=night+'|'+horror;if(F3C.bg&&F3C.key===key)return F3C.bg;const {W,H}=FIGHT;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const p=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};const N=(x,y,s)=>{const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return n-Math.floor(n);};
  const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));const rgb=a=>`rgb(${a[0]},${a[1]},${a[2]})`;
  // the frame: dark wood, lit along the top
  g.fillStyle='#1a0e06';g.fillRect(0,0,W,H);g.fillStyle='#6a4426';g.fillRect(1,1,W-2,H-2);g.fillStyle='#8a5c34';g.fillRect(1,1,W-2,2);g.fillStyle='#4a2c16';g.fillRect(1,H-3,W-2,2);
  for(let x=2;x<W-2;x+=7)if(N(x,1,1)<.5)p(x,2,'#5a381c');g.fillStyle='#1a0e06';g.fillRect(4,4,W-8,H-8);
  // the water: shallow and brown-green by the bank, deep blue far out; the deep water at the far edge darkest of all
  const sh=horror?[70,40,36]:night?[44,62,66]:[96,122,96],dp=horror?[26,8,10]:night?[10,22,40]:[24,64,104],far=horror?[14,4,6]:night?[6,12,24]:[14,40,72];
  const X0=5,Y0=5,IW=W-10,IH=H-10;
  for(let y=0;y<IH;y++)for(let x=0;x<IW;x++){const u=x/IW;let col=u<.85?mix(sh,dp,Math.min(1,u/.8)):mix(dp,far,(u-.85)/.15);const n=N(x>>1,y>>1,3);col=col.map(v=>v+Math.round((n-.5)*8));
    if(u<.3&&N(x,y,4)<.05)col=mix(col,horror?[90,60,50]:[140,128,96],.5);   // stones on the shallow bottom
    if((y+Math.round(Math.sin(x*.21)*2))%9===0&&N(x,y,5)<.5)col=col.map(v=>v+6);p(X0+x,Y0+y,rgb(col));}
  // the bank you stand on, reeds along it, and the net in the shallows
  for(let y=0;y<IH;y++){const bw=13+Math.round(Math.sin(y*.35)*1.5+N(1,y,6)*2);for(let x=0;x<bw;x++){const e=bw-x;p(X0+x,Y0+y,e<=1?'#3a2a18':N(x,y,7)<.12?'#7a6a4a':e<4?'#5a4630':'#6a5438');}}
  for(let k=0;k<9;k++){const ry=Y0+4+k*9+Math.round(N(k,2,8)*4),rx=X0+10+Math.round(N(k,3,8)*4);for(let j=0;j<5;j++)p(rx+(j>3?1:0),ry-j,j>3?'#a8b060':'#4a6a2c');p(rx+1,ry-2,'#5a7a34');}
  // depth marks: little cork floats on a rope across the far side
  for(const u of [.25,.5,.75]){const x=X0+18+Math.round(u*(IW-26));p(x,Y0+1,'#e86a2a');p(x+1,Y0+1,'#c8501e');p(x,Y0+2,'#a03a14');p(x,Y0+IH-3,'#e86a2a');p(x+1,Y0+IH-3,'#c8501e');}
  for(let y=0;y<IH;y+=2)p(X0+IW-3,Y0+y,horror?'#5a1010':'#2a5a8a');
  F3C.bg=c;F3C.key=key;return c;}
function fightDraw(now){const M=MG,cv=$('fishMG').querySelector('.f3');if(!cv)return;const g=cv.getContext('2d');const {W,H}=FIGHT;const t=now/1000;
  const night=isNight();g.drawImage(fightBg(night,M.horror),0,0);
  const p=(x,y,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),1,1);};const X0=5,Y0=5,IW=W-10,IH=H-10;
  const PX=x=>X0+18+x*(IW-26),PY=y=>Y0+6+y*(IH-12);
  // moving glints on the surface
  for(let k=0;k<14;k++){const u=((k*.137+t*.03*(1+k%3))%1),v=(k*.291)%1;const x=X0+16+u*(IW-20),y=Y0+3+v*(IH-6);g.fillStyle=`rgba(220,240,255,${.25+.2*Math.sin(t*3+k)})`;g.fillRect(Math.round(x),Math.round(y),3,1);}
  // the net in the shallows (it lifts when the fish is in)
  const nx=X0+19,ny=PY(.5),lift=M.land>0?Math.min(1,M.land/.3):0;
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(nx-5,ny-4+2,11,9);for(let a=0;a<24;a++){const an=a/24*Math.PI*2;p(nx+Math.cos(an)*5,ny-lift*3+Math.sin(an)*4,'#b89a6a');}
  for(let k=-3;k<=3;k+=2){p(nx+k,ny-lift*3-2,'rgba(220,210,180,.6)');p(nx+k,ny-lift*3+2,'rgba(220,210,180,.6)');p(nx+k+1,ny-lift*3,'rgba(220,210,180,.6)');}
  for(let k=0;k<7;k++)p(nx-5-k,ny-lift*3-k*.4,'#7a5232');   // its handle back to the bank
  // the fish: a dark shadow, its size from the kind it is; lighter as it rises to jump; in the air when it leaps
  const fx=PX(clamp(M.x,0,1.02)),fy=PY(M.y);const L=clamp(8+M.len*.22,10,34)*(M.horror?1.35:1),Hh=L*.3;const hd=M.heading>=0?1:-1;
  const air=M.phase==='jump'?Math.sin(clamp(1-M.pt/.55,0,1)*Math.PI):0,rise=M.phase==='tell'?1-M.pt/.45:0;
  if(M.phase==='run'){g.fillStyle='rgba(225,240,255,.5)';for(let k=1;k<8;k++){p(fx-hd*L*.5-hd*k*2,fy-k*1.1,'rgba(225,240,255,.45)');p(fx-hd*L*.5-hd*k*2,fy+k*1.1,'rgba(225,240,255,.45)');}}
  if(rise>0)for(let a=0;a<20;a++){const an=a/20*Math.PI*2,r=4+rise*7;p(fx+Math.cos(an)*r,fy+Math.sin(an)*r*.6,`rgba(225,240,255,${(.6*(1-rise*.5)).toFixed(2)})`);}
  const dy=-air*14,sha=.6-air*.35;
  // its shadow on the water (always), and the fish above it while it's in the air
  for(let k=0;k<2;k++){if(k===1&&air<=0)continue;const oy=k===0?0:dy,col=k===0?(M.horror?`rgba(30,4,6,${sha})`:`rgba(6,16,26,${(sha*(1-M.x*.25)+rise*.15).toFixed(2)})`):(M.horror?'#3a1a1a':'#5a6a70');
    const sw=Math.sin(M.wob)*(M.phase==='run'?2:1);
    for(let i=-L/2;i<=L/2;i++){const u=(i+L/2)/L;const w=Hh*Math.sqrt(Math.max(0,1-Math.pow(u*2-1.1,2)))*(u<.15?.6:1);const yy=fy+oy+Math.sin(u*3+M.wob)*sw*.5*(1-u);
      const xx=fx+hd*i;for(let j=-Math.ceil(w);j<=Math.ceil(w);j++){if(Math.abs(j)>w)continue;g.fillStyle=col;g.fillRect(Math.round(xx),Math.round(yy+j),1,1);}}
    const tx=fx-hd*L/2;for(let j=-3;j<=3;j++){g.fillStyle=col;g.fillRect(Math.round(tx-hd*(2+Math.abs(j)*.4)),Math.round(fy+oy+j+sw),1,1);}
    if(k===0&&(night||M.horror)){g.fillStyle=M.horror?'rgba(220,200,180,.22)':'rgba(190,215,235,.2)';for(let i=-L/2;i<=L/2;i+=1){const u=(i+L/2)/L;const w=Hh*Math.sqrt(Math.max(0,1-Math.pow(u*2-1.1,2)))*(u<.15?.6:1);g.fillRect(Math.round(fx+hd*i),Math.round(fy-w-1),1,1);g.fillRect(Math.round(fx+hd*i),Math.round(fy+w+1),1,1);}}
    if(k===1){g.fillStyle='rgba(230,240,245,.8)';g.fillRect(Math.round(fx+hd*L*.2),Math.round(fy+dy-Hh*.4),2,1);}}
  if(M.horror&&((now/700|0)%5===0)){p(fx+hd*L*.32,fy-1,'#e8e0c8');p(fx+hd*L*.32,fy+1,'#e8e0c8');}   // something pale where its eyes should be
  // spray when it jumps or lands, bubbles while it rests
  for(const s of M.spl){const r=2+s.t*12,a=(1-s.t/.9)*.7;for(let k=0;k<16;k++){const an=k/16*Math.PI*2;p(PX(s.x)+Math.cos(an)*r,PY(s.y)+Math.sin(an)*r*.55,`rgba(235,245,255,${a.toFixed(2)})`);}}
  for(const b of M.bub){const r=b.t*3;p(PX(b.x)+Math.sin(b.t*9)*2,PY(b.y)-r,`rgba(220,240,255,${(.7-b.t*.6).toFixed(2)})`);}
  // the rod over the bank, and the line from its tip to the fish: slack and sagging, taut, straining (amber), about to go (red)
  const rt=[X0+17,Y0+9],rb=[X0+4,Y0+IH-20];const bend=1+clamp(M.tension,0,1)*4;   // the rod, from the reel up to its tip, bending under the strain
  for(let i=0;i<=90;i++){const u=i/90,x=rb[0]+(rt[0]-rb[0])*u+Math.sin(u*Math.PI*.5)*u*bend,y=rb[1]+(rt[1]-rb[1])*u;p(x-1,y,'#1a0e06');p(x+1,y,'#1a0e06');p(x,y,u<.3?'#3a2410':'#9a6a3a');if(u<.85)p(x,y+1,u<.3?'#2a1808':'#7a5232');}
  rt[0]+=bend;
  const T=M.tension,lc=T<.55?'#ece6d6':T<.75?'#f2d27a':T<.9?'#f09040':'#ff4a30';const sag=Math.pow(1-clamp(T,0,1),2)*16;
  const hx=fx+hd*L*.5,hy=fy+dy*.6;const n=Math.max(12,Math.ceil(Math.hypot(hx-rt[0],hy-rt[1])));
  for(let i=0;i<=n;i++){const u=i/n;const x=rt[0]+(hx-rt[0])*u,y=rt[1]+(hy-rt[1])*u+Math.sin(u*Math.PI)*sag;const v=T>.75?Math.round(Math.sin(now/22+i)*(T>.9?1.2:.6)):0;
    if(M.lost==='snap'&&u>.35&&u<.65)continue;p(x,y+v,lc);}
  // the reel's dial: green, then amber, then red; the needle shows the strain, the handle turns as you reel
  const cx=X0+8,cy=Y0+IH-10,R=7;g.fillStyle='#1a0e06';g.beginPath();g.arc(cx,cy,R+1.5,0,Math.PI*2);g.fill();g.fillStyle='#e8dcc0';g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.fill();
  for(let a=0;a<=20;a++){const u=a/20,an=Math.PI*.8+u*Math.PI*1.4;p(cx+Math.cos(an)*(R-1),cy+Math.sin(an)*(R-1),u<.6?'#5a9a3a':u<.85?'#d8a030':'#c8301e');}
  const na=Math.PI*.8+clamp(T,0,1.05)*Math.PI*1.4;for(let r=0;r<R-1;r+=.5)p(cx+Math.cos(na)*r,cy+Math.sin(na)*r,'#2a1a10');p(cx,cy,'#2a1a10');
  const ha=M.spool;p(cx+Math.cos(ha)*(R+3),cy+Math.sin(ha)*(R+3),'#c8a070');p(cx+Math.cos(ha)*(R+2),cy+Math.sin(ha)*(R+2),'#8a5c34');
  // getting away: the deep water flashes
  if(M.escT>0&&((now/150|0)%2))for(let y=0;y<IH;y+=1)p(X0+IW-2,Y0+y,'#ff6040');
  if(M.lost==='snap'){g.fillStyle=`rgba(255,60,40,${(.25*(1-M.lostT/.6)).toFixed(2)})`;g.fillRect(X0,Y0,IW,IH);}}
