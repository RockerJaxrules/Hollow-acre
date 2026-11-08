/* ================= #158 gore: the body keeps score, and so does the ground.
   - When it catches you it opens you up from shoulder to hip: three claw-slashes across the screen that run, a gash on your
     body that bleeds until you heal, drops where you stand, red footprints where you walk, and a red edge to the world
     that beats with your heart while you're low.
   - Blood stays where it falls, and darkens as it dries. Hurt in the mine, bitten, bled at Agnes's drain: it's all on the floor.
   - The thing hunts at night. In the morning there are kills in the fields and at the edges of the woods: a rabbit torn
     open, a deer laid out like a clock, a ribcage standing on its spine at the end of a long drag, with crows and flies.
     It eats almost none of it. If you're close when it hunts, you hear the animal stop.
   - People notice the blood on you. ================= */
const GORE={dec:[],slash:0,splat:[],dripT:0,printT:0,huntT:20,objs:{},seenNow:{}};
function goreS(){if(!S.gore)S.gore={};const g=S.gore;g.kills=g.kills||[];g.seen=g.seen||{};return g;}
goreS();
const bleedK=()=>S.hpMax?clamp((.55-S.hp/S.hpMax)/.35,0,1):0;
function goreDecal(x,z,r,n){for(let i=0;i<(n||1);i++){const a=Math.random()*6.283,d=n>1?Math.random()*r*2.2:0;GORE.dec.push({x:x+Math.cos(a)*d,z:z+Math.sin(a)*d*.6,r:(n>1?.3+Math.random()*.7:1)*r,t:performance.now()/1000,s:Math.random()*9});}
  if(GORE.dec.length>260)GORE.dec.splice(0,GORE.dec.length-260);}
// ---------- the ground: every drop where it fell, fresh red going to brown
{const _mg=mindGround;mindGround=function(){_mg();const now=performance.now()/1000;
  for(const d of GORE.dec){const age=now-d.t;if(age>420)continue;const X=Math.round(sx(d.x)),Y=Math.round(sz(d.z));if(X<-30||X>VW+30||Y<-30||Y>VH+30)continue;
    const dry=clamp(age/90,0,1),a=age>360?(420-age)/60:1,rx=Math.max(1,d.r*PPM),rz=Math.max(1,d.r*PPM*.55);
    ctx2.fillStyle=`rgba(${Math.round(118-dry*58)},${Math.round(10+dry*6)},${Math.round(8+dry*2)},${.85*a})`;
    if(rx<=1.5){ctx2.fillRect(X,Y,2,1);continue;}ctx2.beginPath();ctx2.ellipse(X,Y,rx,rz,0,0,6.283);ctx2.fill();
    ctx2.fillStyle=`rgba(${Math.round(70-dry*30)},6,4,${.5*a})`;ctx2.beginPath();ctx2.ellipse(X+1,Y+1,rx*.7,rz*.6,0,0,6.283);ctx2.fill();
    if(dry<.6){ctx2.fillStyle=`rgba(230,140,140,${(.6-dry)*a})`;ctx2.fillRect(X-Math.round(rx*.4),Y-Math.round(rz*.4),1,1);}
    for(let k=0;k<3;k++){const h=hash(d.s*7+k,k*3);ctx2.fillStyle=`rgba(100,10,8,${.7*a})`;ctx2.fillRect(X+Math.round((h-.5)*rx*3),Y+Math.round((hash(k,d.s*3)-.5)*rz*3),1,1);}}};}
// ---------- the body: the gash, the drops, the prints
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const g=goreS(),b=bleedK();if(S.mode==='title'||(!(b>.15)&&g.gash!==S.day))return;
  D.push({z:P.z+.002,mind:1,draw(){if(P.anim&&/hoe|pick|axe|water/.test(P.anim.clip||''))return;const X=Math.round(sx(P.x)),Y=Math.round(sz(P.z));const k=Math.max(b,g.gash===S.day?.6:0);const back=P.dir==='N',fl=P.dir==='W'?-1:1;
    const x0=X-5*fl,y0=Y-21,x1=X+4*fl,y1=Y-11;ctx2.strokeStyle='#3a0402';ctx2.lineWidth=3;ctx2.beginPath();ctx2.moveTo(x0,y0);ctx2.lineTo(x1,y1);ctx2.stroke();
    ctx2.strokeStyle=back?'#6a0806':'#9a0e0a';ctx2.lineWidth=1;ctx2.beginPath();ctx2.moveTo(x0,y0);ctx2.lineTo(x1,y1);ctx2.stroke();ctx2.lineWidth=1;
    // the shirt soaking through under it, and runs to the belt
    ctx2.fillStyle=`rgba(110,8,6,${.35+k*.35})`;for(let i=0;i<5;i++){const f=i/4,x=Math.round(x0+(x1-x0)*f),y=Math.round(y0+(y1-y0)*f);ctx2.fillRect(x-1,y+1,3,1+Math.round(k*2*((i*7)%3)));}
    const dr=(t*1.3)%1;ctx2.fillStyle='#8a0a08';ctx2.fillRect(x1,y1+1,1,2+Math.round(k*3));if(k>.4)ctx2.fillRect(x1,y1+4+Math.round(dr*7),1,2);}});};}
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused)return;const b=bleedK();
  if(b>0){GORE.dripT-=dt;if(GORE.dripT<=0){GORE.dripT=1.25-b*.85+Math.random()*.3;const x=P.x+(Math.random()-.5)*.25,z=P.z+.03;parts.push({x,z,y:.75,vx:0,vz:0,vy:-.6,t:0,life:.45,col:'#7a0a08',size:1});goreDecal(x,z,.05+b*.07);}
    if(P.spd>0&&b>.3){GORE.printT-=dt;if(GORE.printT<=0&&typeof RX!=='undefined'){GORE.printT=.36;RX.prints.push({x:P.x+(RX.prints.length%2?.08:-.08),z:P.z,t:performance.now()/1000,blood:1,dir:P.dir});if(RX.prints.length>90)RX.prints.shift();}}}
  if(GORE.slash>0)GORE.slash-=dt;GORE.splat=GORE.splat.filter(s=>(s.t+=dt)<s.life);};}
// ---------- the screen: claws, spatter, and the red edge that beats with your heart
{const _do=depthOver;depthOver=function(t){_do(t);if(S.mode==='title')return;const b=bleedK();
  if(b>.25){const p=.5+.5*Math.sin(t*(4+b*4));const g=ctx2.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.32,VW/2,VH/2,Math.max(VW,VH)*.72);g.addColorStop(0,'rgba(90,0,0,0)');g.addColorStop(1,`rgba(110,0,0,${(b-.2)*(.35+p*.25)})`);ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
  for(const s of GORE.splat){const a=clamp(1-s.t/s.life,0,1)*.85;ctx2.fillStyle=`rgba(120,6,4,${a})`;ctx2.beginPath();ctx2.arc(s.x,s.y+s.t*s.run,s.r,0,6.283);ctx2.fill();
    for(let k=0;k<6;k++){const an=hash(s.seed,k)*6.283,rr=s.r*(1.2+hash(k,s.seed)*1.3);ctx2.fillRect(Math.round(s.x+Math.cos(an)*rr),Math.round(s.y+Math.sin(an)*rr),2,2);}
    ctx2.fillRect(Math.round(s.x)-1,Math.round(s.y),2,Math.round(s.t*s.run*2+s.r));}
  if(GORE.slash>0){const T=6-GORE.slash,a=clamp(GORE.slash/2.5,0,1);
    for(let i=0;i<3;i++){const x0=VW*(.18+i*.13),y0=VH*(.08+i*.03),x1=VW*(.52+i*.15),y1=VH*(.9-i*.04);
      ctx2.strokeStyle=`rgba(40,0,0,${.8*a})`;ctx2.lineWidth=8-i;ctx2.beginPath();ctx2.moveTo(x0,y0);ctx2.lineTo(x1,y1);ctx2.stroke();
      ctx2.strokeStyle=`rgba(150,8,6,${.85*a})`;ctx2.lineWidth=4-i*.5;ctx2.beginPath();ctx2.moveTo(x0+1,y0);ctx2.lineTo(x1+1,y1);ctx2.stroke();
      ctx2.fillStyle=`rgba(130,6,4,${.85*a})`;for(let k=1;k<8;k++){const f=k/8,x=x0+(x1-x0)*f,y=y0+(y1-y0)*f,len=Math.min(30,T*(7+hash(i,k)*16));ctx2.fillRect(Math.round(x),Math.round(y),2,Math.round(len));ctx2.fillRect(Math.round(x)-1,Math.round(y+len),4,3);ctx2.fillRect(Math.round(x),Math.round(y+len)+3,2,1);}}
    ctx2.lineWidth=1;}};}
function goreSplat(n,big){for(let i=0;i<n;i++){const edge=Math.random()<.5;GORE.splat.push({x:edge?(Math.random()<.5?Math.random()*VW*.22:VW-Math.random()*VW*.22):Math.random()*VW,y:edge?Math.random()*VH:(Math.random()<.5?Math.random()*VH*.2:VH-Math.random()*VH*.25),
  r:(big?6:3)+Math.random()*(big?10:5),t:0,life:2.2+Math.random()*1.6,run:6+Math.random()*14,seed:(Math.random()*999)|0});}}
// being caught, being hurt
{const _c=caught;caught=function(){const was=S.mode;_c.apply(this,arguments);if(was!=='play')return;GORE.slash=6;goreS().gash=S.day;goreSplat(7,true);
  burst(P.x,P.z,22,'#7a0a08',2.6,1.2,2.6);goreDecal(P.x,P.z,.22,9);};}
{const _h=hurt;hurt=function(n,why){_h.apply(this,arguments);if(!(n>=6))return;goreSplat(Math.min(6,2+Math.round(n/10)),n>=25);burst(P.x,P.z,6+Math.round(n/4),'#7a0a08',1.6,.8,1.8);goreDecal(P.x,P.z,.1+n/250,Math.min(6,1+Math.round(n/10)));};}
// the roots under the church bleed onto the flagstones, and the drain at Agnes's
if(typeof dkTear==='function'){const _dt=dkTear;dkTear=function(i){_dt(i);try{const R=ROOMS.undercroft;goreDecal(R.ox+DK_ROOTS[i][0],R.oz+DK_ROOTS[i][1]-.4,.12,3);}catch(e){}};}

// ---------- the night's kills, found in the morning
const KILLS={rabbit:{main:'g_rabbit',extra:[['g_spatter',.6,.2]],look:'A rabbit, opened like a purse. The fur is everywhere, as if it burst. Nothing has been eaten. It was killed and then left, neatly, where you would walk.'},
  deer:{main:'g_deer_open',extra:[['g_spatter',-1.4,.4]],look:'A deer laid on its side with its insides arranged round it in a ring. Twelve pieces. The heart at the top. It is the same every time. It is telling the time.'},
  ribs:{main:'g_ribs',prop:1,extra:[['g_drag',-2.6,.1],['g_spatter',.8,.3]],look:'A ribcage standing on its spine at the end of a long red drag, picked almost clean. Whatever did this carried the rest of it somewhere. The crows won’t go near the drag mark.'}};
function goreKillSpot(){const C=[[-38,24,-32,22],[20,80,-52,52],[-60,-20,-40,-14]];for(let i=0;i<60;i++){const B=C[(Math.random()*C.length)|0];const x=B[0]+Math.random()*(B[1]-B[0]),z=B[2]+Math.random()*(B[3]-B[2]);
    if(inTown(x,z,2)||terr(x,z)!=='grass'||Math.hypot(x,z+8)<9)continue;if(typeof FIELD!=='undefined'&&x>FIELD.x0-2&&x<FIELD.x0+FIELD.w+2&&z>FIELD.z0-2&&z<FIELD.z0+FIELD.h+2)continue;
    const p={x,z};collide(p,.6);if(Math.hypot(p.x-x,p.z-z)>.02)continue;if(goreS().kills.some(k=>Math.hypot(k.x-x,k.z-z)<6))continue;return {x,z};}return null;}
function goreKillShow(k){if(GORE.objs[k.id])return;const K=KILLS[k.kind];if(!K)return;const os=[obj(K.main,k.x,k.z,K.prop?{kind:'prop',noCol:true}:{kind:'flat',noCol:true})];
  for(const [s,dx,dz] of K.extra)os.push(obj(s,k.x+dx,k.z+dz,{kind:'flat',noCol:true}));GORE.objs[k.id]=os;
  if(!k.night)for(let i=0;i<(k.kind==='rabbit'?2:3);i++){const cx=k.x+(Math.random()-.5)*2.2,cz=k.z+(Math.random()-.5)*1.2;crows.push({x:cx,z:cz,hx:cx,hz:cz,y:0,state:'perch',t:0,vx:0,vz:0,kill:k.id});}}
function goreKillHide(id){for(const o of GORE.objs[id]||[])o.hide=true;delete GORE.objs[id];for(let i=crows.length-1;i>=0;i--)if(crows[i].kill===id)crows.splice(i,1);}
function goreKillAdd(x,z,kind,night){const g=goreS();const k={id:'k'+S.day+'_'+((Math.random()*1e5)|0),x,z,kind,day:S.day,night:!!night};g.kills.push(k);goreKillShow(k);return k;}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);const g=goreS();
  for(const k of g.kills.slice())if(k.day<S.day-1){goreKillHide(k.id);g.kills.splice(g.kills.indexOf(k),1);}
  for(const k of g.kills)if(k.night){k.night=false;goreKillHide(k.id);goreKillShow(k);}   // last night's kills have their crows by morning
  if(S.day>=2&&g.kills.length<4&&Math.random()<(S.bound?.75:.5)){const p=goreKillSpot();if(p){const r_=Math.random();goreKillAdd(p.x,p.z,r_<.5?'rabbit':r_<.8?'deer':'ribs');}}
  GORE.dec.length=0;return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);for(const id of Object.keys(GORE.objs))goreKillHide(id);for(const k of goreS().kills)goreKillShow(k);return r;};}
setTimeout(()=>{try{for(const k of goreS().kills)goreKillShow(k);}catch(e){}},0);
// walking up on one; and the flies
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused||S.room)return;const g=goreS();
  for(const k of g.kills){if(g.seen[k.id])continue;if(Math.hypot(P.x-k.x,P.z-k.z)<2.6){g.seen[k.id]=1;mindHit&&mindHit(2);toast(KILLS[k.kind].look,4.6,true);if(!g.seen['kind_'+k.kind]){g.seen['kind_'+k.kind]=1;addLore(KILLS[k.kind].look);}}}
  // it hunts at night: anything it gets near stops
  if(isNight()&&H.vis&&H.state!=='gone'){GORE.huntT-=dt;if(GORE.huntT<=0){GORE.huntT=14+Math.random()*12;const a=typeof WILD!=='undefined'&&WILD.find(w=>(w.kind==='rabbit'||w.kind==='deer')&&w.st!=='gone'&&Math.hypot(w.x-H.x,w.z-H.z)<8);
    if(a){a.st='gone';const k=goreKillAdd(a.x,a.z,a.kind==='deer'?'deer':'rabbit',true);goreDecal(a.x,a.z,.2,6);const d=Math.hypot(a.x-P.x,a.z-P.z);
      if(d<26&&A.ok){const pan=clamp((a.x-P.x)/12,-1,1);A.tone(a.kind==='deer'?620:1300,.5,'sawtooth',.06*(1-d/26),{slide:a.kind==='deer'?300:700,pan,filter:['bandpass',1400,2],verb:true});A.hiss(.25,.08*(1-d/26),'lowpass',500,{delay:.45,pan});
        if(d<16)toast(a.kind==='deer'?'Somewhere close, a deer screams. Then something wet. Then nothing.':'Something small screams in the grass, very close, and then stops all at once.',3.8,true);}}}}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room||isNight())return;for(const k of goreS().kills){if(!onScreen(k.x,k.z,80))continue;
  D.push({z:k.z+.3,mind:1,draw(){for(let i=0;i<5;i++){const a=t*(5+i)+i*2.1;ctx2.fillStyle='#0c0c0c';ctx2.fillRect(Math.round(sx(k.x)+Math.cos(a)*(6+i*2)),Math.round(sz(k.z)-6-Math.abs(Math.sin(a*1.3))*8),1,1);}}});}};}
// ---------- people notice
if(typeof RX_SAY!=='undefined')RX_SAY.hurt=['You’re bleeding all over the step.','Good Lord. Sit down before you fall down.','(They look at the blood on you, then at your face, and smile.) It likes that, you know. When we bleed a bit.','Go and see Della. Go now. Don’t drip on the flowers.','You want to get that looked at. Before it gets the smell of you.'];
