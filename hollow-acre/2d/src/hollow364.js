/* ================= t364: the Hollow sneaks up on you at night (owner: "the creature the hollow at night should be able to sneak up on
   you better"). Now that nights are truly dark it hunts from outside your light:
   - it keeps to the dark: never steps into your light, and stands still while you look its way or while it's lit;
   - it works round to your back or your blind side along the edge of the light, using the shadows your light throws (behind a
     house, a wall or a tree trunk the light doesn't reach it, so it can be closer there);
   - a lantern's round pool keeps it at the pool's edge, just out of reach, waiting for the flame to gutter or the oil to run out;
     a flashlight lights only its narrow cone, so it comes in from the sides and from behind, all the way;
   - its tells are small and fair: a twig snapping behind you, the crickets going quiet, breathing at the edge of hearing, your
     flame guttering (or your beam flickering) as it gets close, a pair of eyes at the edge of the light, gone when you turn;
   - it grows bolder over the story (hl(): the first days it mostly watches from the dark; the last week it comes in), within the
     game's own rules for when it appears (spawn, story gates, the binding and rooms are untouched), and every scare it had (the
     dark ambush when your light sputters, the turn, the lunge, being caught) still works. Each player's night is their own, as
     before (nothing about it is sent between farms).
   HZ364.setup(...) scripts a night encounter for tests and tuning. ================= */
const HZ4={eyesT:0,eyesCD:7,twigCD:6,gutT:0,gutCD:6,quiet:0,retreat:0,hold:0,last:null};
function hzLevel(){try{return Math.max(0,Math.min(4,typeof hl==='function'?hl():0));}catch(e){return 0;}}
// how bold it is: early nights it hangs back and rarely comes in; the last week it presses
function hzAgg(){return [.45,.6,.75,.88,1][hzLevel()]*(S.day>=3?1:.9);}
const hzWrap=a=>{a%=Math.PI*2;if(a>Math.PI)a-=Math.PI*2;if(a<-Math.PI)a+=Math.PI*2;return a;};
// where the light you carry really is: the lantern at your hip, the flashlight in your hand
function hzLightAt(){if(LI_ON&&liCur()==='flash'){const lp=lanternPos();return {x:P.x+(lp.x-sx(P.x))/PPM,z:P.z+.05+P.fz*.25};}const h=LANTERN_HIP[P.dir]||LANTERN_HIP.S;return {x:P.x+h[0]/PPM,z:P.z+.05};}
// is something between your light and (x,z)? a house's or a wall's footprint, or a tree trunk (it can hide right behind one)
const hzSegRect=(ax,az,bx,bz,q)=>{let t0=0,t1=1;const dx=bx-ax,dz=bz-az;for(const [p,qq] of [[-dx,ax-q.x0],[dx,q.x1-ax],[-dz,az-q.z0],[dz,q.z1-az]]){if(p===0){if(qq<0)return false;continue;}const r=qq/p;if(p<0){if(r>t1)return false;if(r>t0)t0=r;}else{if(r<t0)return false;if(r<t1)t1=r;}}return t0<t1&&t1>.02&&t0<.98;};
const hzSegCirc=(ax,az,bx,bz,cx,cz,r)=>{const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1e-6;let u=((cx-ax)*dx+(cz-az)*dz)/l2;if(u<.05||u>.95)return false;const ex=ax+dx*u-cx,ez=az+dz*u-cz;return ex*ex+ez*ez<r*r;};
function hzBlocked(x,z){if(!isNight()||S.room)return false;const L=hzLightAt();let occ=[];try{occ=nightOccluders();}catch(e){return false;}
  for(const q of occ){if(q.t==='r'&&q.long){if(hzSegRect(L.x,L.z,x,z,q))return true;}else if(q.t==='c'){if(hzSegCirc(L.x,L.z,x,z,q.x,q.z,q.r+.16))return true;}}return false;}
// would your light reach it standing at (x,z)?
function hzLitAt(x,z){if(!lanternOn())return false;const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz)||.01,dot=(dx*P.fx+dz*P.fz)/d;return liCatch(d,dot).lit&&!hzBlocked(x,z);}
// the eyes glow only when it's in your light, when it shows itself (the watch, the scream, the lunge), or for a moment at the edge
function hzEyesOn(){if(!(isNight()&&H.sneak&&H.state==='stalk'))return true;return H.lit||HZ4.eyesT>0;}
// the crickets stop when it's near
{const _c=SFX.cricket;if(_c)SFX.cricket=function(){if(HZ4.quiet>.5)return;return _c.apply(this,arguments);};}
// your flame gutters (or your beam flickers) as it comes close: the light dips for a moment, it doesn't go out
function hzGutter(){return HZ4.gutT>0?.5+.25*Math.sin(performance.now()/38):1;}
{const _pl=liPlayerLight;liPlayerLight=function(t,L,DK){return _pl.call(this,t,L*hzGutter(),DK);};}
const hzTwig=pan=>{try{A.hiss(.018,.13,'highpass',3200,{pan});A.hiss(.03,.05,'bandpass',1500,{q:3,delay:.012,pan});A.tone(170,.05,'sine',.04,{slide:110,delay:.01,pan});}catch(e){}};
// one step of the sneak (called from hollowUpdate's stalk, instead of walking straight at you). Returns false to leave it to the
// old walk (by day, in a room, or when the lights module isn't there)
function hzSneak(dt,d,spd){if(!isNight()||S.room||H.state!=='stalk'||S.mode!=='play')return false;H.sneak=true;H.rush=false;
  const agg=hzAgg(),c=liCur(),on=lanternOn();const face=Math.atan2(P.fz,P.fx);const vx=H.x-P.x,vz=H.z-P.z;let rel=hzWrap(Math.atan2(vz,vx)-face);
  const looking=Math.cos(rel)>.42&&d<17;const pan=clamp((H.x-P.x)/8,-1,1);
  // the edge it keeps to: just past a lantern's pool; with the flashlight it can come all the way, round the cone
  const R=c==='flash'?0:c==='walt'?9.4:8.5;let want=!on?0:c==='flash'?0:R+.55+(1-agg)*1.4;
  // the first nights it often only watches from the dark
  if(agg<.6&&on&&c==='flash')want=Math.max(want,4.5);
  // you turned toward it while its eyes were showing: it steps back into the dark
  if(HZ4.retreat>0){HZ4.retreat-=dt;want=Math.max(d+2.6,want);}
  const lit=hzLitAt(H.x,H.z);H.rush=!on&&d<9;
  // it doesn't move while you look its way, or while your light is on it (frozen is handled before this)
  const hold=(looking&&!H.rush)||lit;
  let moved=0;
  if(!hold){const sp=spd*(H.rush?1.25:d<14?(.55+.35*agg):1);
    // round the edge toward your back (the shorter way), and in to the distance it wants
    const tgt=rel>=0?Math.PI:-Math.PI;const da=hzWrap(tgt-rel),wA=sp/Math.max(1.5,d)*(d<R+4?1:.6);const stepA=Math.sign(da)*Math.min(Math.abs(da),wA*dt);
    const behind=Math.abs(hzWrap(rel-Math.PI))<.9;const inSpd=sp*(H.rush?1:behind?(.45+.55*agg):.25);let nd=d+clamp(want-d,-inSpd*dt,sp*dt);
    // try the full step, then round the edge only, then straight in only; never into the light
    const at=(dd,a)=>[P.x+Math.cos(face+a)*dd,P.z+Math.sin(face+a)*dd];
    for(const [dd,aa] of [[nd,rel+stepA],[d,rel+stepA],[nd,rel]]){const [x,z]=at(dd,aa);if(!on||!hzLitAt(x,z)||H.rush){const ox=H.x,oz=H.z;H.x=x;H.z=z;collide(H,.4);moved=Math.hypot(H.x-ox,H.z-oz);break;}}}
  H.dir=dirOf(P.x-H.x,P.z-H.z);if(!moved)H.clip='idle';
  // ---- the tells
  const near=d<15;HZ4.quiet=clamp(HZ4.quiet+(near?dt*.8:-dt*.4),0,1);
  if(moved&&d<11&&Math.abs(rel)>1.1){HZ4.twigCD-=dt*(.6+agg);if(HZ4.twigCD<=0){HZ4.twigCD=6+rand()*7;hzTwig(pan);}}
  if(on&&d<(c==='flash'?6:R+2.6)){HZ4.gutCD-=dt*(.5+agg);if(HZ4.gutCD<=0){HZ4.gutCD=7+rand()*7;HZ4.gutT=.5;try{A.hiss(.28,.025,'lowpass',380,{});}catch(e){}}}
  if(HZ4.gutT>0)HZ4.gutT-=dt;
  // its eyes, for a moment, at the edge of your light, off to the side: gone (and it backs off) if you turn to them
  if(HZ4.eyesT>0){HZ4.eyesT-=dt;if(looking){HZ4.eyesT=0;HZ4.retreat=.7;}}
  else if(on&&Math.abs(rel)>.9&&Math.abs(rel)<2.5&&d>(c==='flash'?3:R-.6)&&d<(c==='flash'?9:R+3.2)){HZ4.eyesCD-=dt*(.4+agg);if(HZ4.eyesCD<=0){HZ4.eyesCD=8+rand()*9;HZ4.eyesT=.55;}}
  HZ4.last={d:+d.toFixed(2),rel:+rel.toFixed(2),want:+want.toFixed(2),hold,lit,moved:+moved.toFixed(3),rush:H.rush};
  return true;}
// the crickets come back once it has gone
{const _hu=hollowUpdate;hollowUpdate=function(dt){const r=_hu.apply(this,arguments);if(!(H.vis&&H.state==='stalk'&&isNight())){HZ4.quiet=Math.max(0,HZ4.quiet-dt*.4);HZ4.gutT=0;HZ4.eyesT=0;}return r;};}
// after it flees, it stays away longer on the early nights
{const _hu=hollowUpdate;hollowUpdate=function(dt){const was=H.state;const r=_hu.apply(this,arguments);if(was==='flee'&&H.state==='gone'&&isNight())H.timer+=(1-hzAgg())*24;return r;};}
// ---- tuning and tests: script a night encounter. HZ364.setup({light:'tin'|'walt'|'flash', hood:0|1, behind:9, side:0 (radians
// round from straight behind), level:0-4 (story boldness), x,z,dir}) puts you there at 23:00 with it stalking behind you and the
// random scares (the lunge, the dark ambush, the turn) held off; HZ364.turn() faces you toward it; HZ364.state() reports
const HZ364={setup(o){o=o||{};S.mode='play';S.paused=false;S.room=null;S.hour=o.hour||23;S.bound=false;S.storm=false;S.dusk=true;S.bellRung=true;cine=null;
    if(o.x!=null){P.x=o.x;P.z=o.z;}const dir=o.dir||'E';P.dir=dir;P.fx=dir==='E'?1:dir==='W'?-1:0;P.fz=dir==='S'?1:dir==='N'?-1:0;P.anim=null;
    liS();S.lit.v=1;S.lit.own={tin:1,walt:1,flash:1,hood:o.hood?1:0};S.lit.hood=o.hood?1:0;S.lit.cur=o.light||'tin';S.lit.batt=100;S.fuel=100;liChanged();
    if(o.level!=null)HZ364.lvl=o.level;sputT=0;sputCD=o.sputter?6:1e9;peekCD=1e9;S.night=Object.assign(S.night||{},{turn:1,crawl:1});S.first=Object.assign(S.first||{},{seen:true});
    const a=Math.atan2(P.fz,P.fx)+Math.PI+(o.side||0),r=o.behind||9;H.x=P.x+Math.cos(a)*r;H.z=P.z+Math.sin(a)*r;collide(H,.4);H.state='stalk';H.vis=true;H.alpha=1;H.rise=1;H.crawl=0;H.burn=0;H.stung=true;H.grace=o.grace==null?99:o.grace;H.timer=0;
    HZ4.eyesT=0;HZ4.eyesCD=o.eyes?.5:7;HZ4.twigCD=2;HZ4.gutCD=3;HZ4.retreat=0;return JSON.stringify(HZ364.state());},
  turn(){const dx=H.x-P.x,dz=H.z-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);return JSON.stringify(HZ364.state());},
  state(){return {P:[+P.x.toFixed(2),+P.z.toFixed(2),P.dir],H:[+H.x.toFixed(2),+H.z.toFixed(2),H.state,H.clip],lit:!!H.lit,eyes:HZ4.eyesT>0,quiet:+HZ4.quiet.toFixed(2),gut:HZ4.gutT>0,last:HZ4.last,lvl:hzLevel()};}};
{const _l=hzLevel;hzLevel=function(){return HZ364.lvl!=null?HZ364.lvl:_l();};}
window.HZ364=HZ364;
// (tests only) HZ364.mark=true outlines where it stands, over the dark, so a recorded strip can show the approach it makes unseen
{const _ms=mindScreen;mindScreen=function(t){const r=_ms.apply(this,arguments);try{if(HZ364.mark&&H.vis&&H.state!=='gone'){const X=Math.round(sx(H.x)),Y=Math.round(sz(H.z));ctx2.save();ctx2.globalAlpha=.8;ctx2.strokeStyle='#ff3a3a';ctx2.lineWidth=1;ctx2.setLineDash([3,3]);ctx2.strokeRect(X-12.5,Y-150.5,25,152);ctx2.setLineDash([]);ctx2.fillStyle='#ff3a3a';ctx2.font='10px monospace';ctx2.fillText(HZ4.last?HZ4.last.d+' m':'',X-12,Y-154);ctx2.restore();}}catch(e){}return r;};}
