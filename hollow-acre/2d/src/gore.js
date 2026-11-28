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
    if(rx<=1.5){ctx2.fillRect(X,Y,2,1);continue;}
    if(SPR.g_dec_s0){const sz=rx<4?'s':rx<7?'m':'l',sh=(Math.floor(d.s)&1);           // drawn splats: wet, drying to brown as it ages
      if(dry<1)drawSpr('g_dec_'+sz+sh,X,Y,null,null,0,{alpha:(1-dry)*a});if(dry>0)drawSpr('g_dry_'+sz+sh,X,Y,null,null,0,{alpha:dry*a});continue;}
    ctx2.beginPath();ctx2.ellipse(X,Y,rx,rz,0,0,6.283);ctx2.fill();
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
// (t372) and the people. The Hollow doesn't only take deer. Strangers come into the valley the way Joseph Cade did, off Route 9,
// off the county bus, sent by the county; some of them are found in the morning, out by the Marsh place, arranged. They start
// after the first few days and come more often as the story darkens. Each is a stranger or someone passing through, never
// anyone the story needs. With the gore setting "Toned down" each is swapped for what is left once the body has gone.
const KILLS={rabbit:{main:'g_rabbit',extra:[['g_spatter',.6,.2]],pool:[.05,.12,.75],look:'A rabbit, opened like a purse. The fur is everywhere, as if it burst. Nothing has been eaten. It was killed and then left, neatly, where you would walk.'},
  deer:{main:'g_deer_open',extra:[['g_spatter',-1.4,.4]],pool:[.1,.22,1.3],look:'A deer laid on its side with its insides arranged round it in a ring. Twelve pieces. The heart at the top. It is the same every time. It is telling the time.'},
  ribs:{main:'g_ribs',prop:1,extra:[['g_drag',-2.6,.1],['g_spatter',.8,.3]],pool:[0,.1,.9],look:'A ribcage standing on its spine at the end of a long red drag, picked almost clean. Whatever did this carried the rest of it somewhere. The crows won’t go near the drag mark.'},
  hiker:{person:1,main:'g_p_hiker',tmain:'g_p_hiker_t',extra:[['g_p_drag',2.34,-.06]],pool:[0,.12,1],crows:4,
    look:'A stranger face-down in the grass, a rucksack torn off one arm. Opened along the spine from collar to belt, the back folded out both ways like a coat coming off. The smear behind goes back toward Route 9. They crawled all this way.',
    tlook:'A long smear through the grass from the direction of Route 9, ending in a dark patch the size of a person. A rucksack lies beside it, torn off at the strap. Nobody has come for it.',
    jot:'A stranger in the grass by the farm, opened along the spine. They had crawled all the way from Route 9.',tjot:'A blood trail through the grass from Route 9, and a stranger’s rucksack.'},
  lantern:{person:1,main:'g_p_lantern',tmain:'g_p_lantern_t',extra:[['g_spatter',-.9,.3]],pool:[-.6,.02,.6],crows:3,glow:[.02,-.17],
    look:'A storm lantern on its side in the grass, still lit, and a hand still holding it, off at the wrist. The knuckles are white round the wire. Whoever it was held on to the light right to the end. You’d have to break the fingers to take it.',
    tlook:'A storm lantern on its side in the grass, still lit. The wire handle is sticky. Whoever was holding it held on for as long as they could.',
    jot:'A hand in the grass, off at the wrist, still holding a lit lantern. The light didn’t help them.',tjot:'A lantern in the grass, still lit, the handle sticky with blood.'},
  boots:{person:1,main:'g_p_boots',tmain:'g_p_boots_t',prop:1,extra:[],pool:[-.22,.03,.6],crows:3,
    look:'A pair of work boots standing side by side in the grass, laced to the top. The feet are still in them, cut through just above the socks. Beside them a surveyor’s stake, and the tape run out to nowhere. The county sent someone to measure the valley.',
    tlook:'One work boot lying in the grass, still laced. Beside it a surveyor’s stake with a pink flag, and the tape run out to nowhere. The county sent someone to measure the valley.',
    jot:'A surveyor’s boots, standing in the grass with the feet still in them.',tjot:'A surveyor’s stake in the grass, and one boot, still laced.'},
  coat:{person:1,main:'g_p_coat',tmain:'g_p_coat_t',prop:1,extra:[['g_spatter',.7,.25]],pool:[0,.03,.55],crows:4,
    look:'A long coat hung on a fence post by its collar, buttoned to the chin. It is full. Whatever is in it was folded small to fit, and it has soaked through at every seam. Fingertips at one cuff. In the pocket, a bus ticket: Route 9, one way.',
    tlook:'A long coat hung on a fence post by its collar, torn open down the back and stiff with something dark. In the pocket, a bus ticket: Route 9, one way.',
    jot:'A coat on a fence post with someone folded up inside it. A bus ticket in the pocket: Route 9, one way.',tjot:'A torn coat on a fence post, stiff with blood. A bus ticket: Route 9, one way.'},
  tree:{person:1,main:'g_p_tree',tmain:'g_p_tree_t',prop:1,extra:[['g_spatter',-1,.35]],pool:[.03,.08,.9],crows:4,
    look:'A hunter sat against a dead tree, his rifle across his knees, every round still in it. His face has been taken off to the teeth, neatly, like the label off a jar. His eyes are in his lap, side by side, looking up at you.',
    tlook:'A rifle and an orange cap at the foot of a dead tree. The bark is dark from head height to the roots, as if someone sat there a long time and bled the whole while.',
    jot:'A hunter against a dead tree. It took his face. It left his eyes in his lap, looking up.',tjot:'A hunter’s rifle and cap under a dead tree, the bark dark with blood.'}};
const GORE_PEOPLE=Object.keys(KILLS).filter(k=>KILLS[k].person);
const goreToned=()=>!!window.GORE_TONED;
function goreKillSpot(){const C=[[-38,24,-32,22],[20,80,-52,52],[-60,-20,-40,-14]];for(let i=0;i<60;i++){const B=C[(Math.random()*C.length)|0];const x=B[0]+Math.random()*(B[1]-B[0]),z=B[2]+Math.random()*(B[3]-B[2]);
    if(inTown(x,z,2)||terr(x,z)!=='grass'||Math.hypot(x,z+8)<9)continue;if(typeof FIELD!=='undefined'&&x>FIELD.x0-2&&x<FIELD.x0+FIELD.w+2&&z>FIELD.z0-2&&z<FIELD.z0+FIELD.h+2)continue;
    const p={x,z};collide(p,.6);if(Math.hypot(p.x-x,p.z-z)>.02)continue;if(goreS().kills.some(k=>Math.hypot(k.x-x,k.z-z)<6))continue;return {x,z};}return null;}
function goreKillShow(k){if(GORE.objs[k.id])return;const K=KILLS[k.kind];if(!K)return;const ton=!!((K.person||K.tmain)&&goreToned());k.ton=ton;
  const os=[obj(ton?K.tmain:K.main,k.x,k.z,K.prop?{kind:'prop',noCol:true}:{kind:'flat',noCol:true})];
  for(const [s,dx,dz] of K.extra)os.push(obj(s,k.x+dx,k.z+dz,{kind:'flat',noCol:true}));GORE.objs[k.id]=os;
  if(!k.night)for(let i=0;i<(K.crows||(k.kind==='rabbit'?2:3));i++){const cx=k.x+(Math.random()-.5)*2.4,cz=k.z+(Math.random()-.5)*1.3;crows.push({x:cx,z:cz,hx:cx,hz:cz,y:0,state:'perch',t:0,vx:0,vz:0,kill:k.id});}}
function goreKillHide(id){for(const o of GORE.objs[id]||[])o.hide=true;delete GORE.objs[id];for(let i=crows.length-1;i>=0;i--)if(crows[i].kill===id)crows.splice(i,1);}
function goreKillAdd(x,z,kind,night){const g=goreS();const k={id:'k'+S.day+'_'+((Math.random()*1e5)|0),x,z,kind,day:S.day,night:!!night};g.kills.push(k);goreKillShow(k);return k;}
// how likely a person is found on a given morning: none in the first days, then more as the chapters darken
function gorePersonChance(){if(S.day<4)return 0;const ch=(S.saga&&S.saga.ch)||0,tier=typeof rotTier==='function'?rotTier():0;return Math.min(.5,.1+ch*.09+tier*.02+(S.bound?.06:0));}
function gorePersonAdd(x,z,kind){const g=goreS();g.pUsed=g.pUsed||[];let pool=GORE_PEOPLE.filter(k=>!g.pUsed.includes(k));if(!pool.length){g.pUsed=[];pool=GORE_PEOPLE.slice();}
  kind=kind||pool[(Math.random()*pool.length)|0];if(x==null){const p=goreKillSpot();if(!p)return null;x=p.x;z=p.z;}g.pUsed.push(kind);g.lastP=S.day;return goreKillAdd(x,z,kind);}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);const g=goreS();
  for(const k of g.kills.slice())if(k.day<S.day-1){goreKillHide(k.id);g.kills.splice(g.kills.indexOf(k),1);}
  for(const k of g.kills)if(k.night){k.night=false;goreKillHide(k.id);goreKillShow(k);}   // last night's kills have their crows by morning
  if(S.day>=2&&g.kills.length<4&&Math.random()<(S.bound?.75:.5)){const p=goreKillSpot();if(p){const r_=Math.random();goreKillAdd(p.x,p.z,r_<.5?'rabbit':r_<.8?'deer':'ribs');}}
  if(S.day-(g.lastP==null?-99:g.lastP)>=2&&Math.random()<gorePersonChance())gorePersonAdd();
  GORE.dec.length=0;return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);for(const id of Object.keys(GORE.objs))goreKillHide(id);for(const k of goreS().kills)goreKillShow(k);return r;};}
setTimeout(()=>{try{for(const k of goreS().kills)goreKillShow(k);}catch(e){}},0);
// the first time you come on each person, you see it close (sights.js draws the close-up), with the line underneath
// the detailed close-up drawn for this sprite (its name + '_cu'), laid on a sights canvas; null if there is none or it isn't loaded
function goreCloseImg(name){const n=name+'_cu',m=SPR[n],im=m&&IMG[m.src];if(!im||!im.width||typeof sgtC!=='function')return null;return sgtC('gcu_'+n,m.fw,m.fh,(P,g)=>{g.drawImage(im,0,0);});}
function goreUp(im){if(im.width>=64||im.height>=34)return im;if(im._up)return im._up;const c=document.createElement('canvas');c.width=im.width*2;c.height=im.height*2;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0,c.width,c.height);return im._up=c;}
function goreSightP(k,ton,look){if(typeof sgtSprites!=='function'||typeof sgtOpen!=='function'||S.mode!=='play'||S.paused||(typeof H!=='undefined'&&H.state==='chase'))return false;
  const g=goreS(),K=KILLS[k.kind],sk='sight_'+k.kind+(ton?'_t':'');if(g.seen[sk])return false;let img=goreCloseImg(ton?K.tmain:K.main,{x:k.x,z:k.z},(GORE.objs[k.id]||[]).slice(0,1));try{if(!img){img=sgtSprites('killp_'+k.kind+(ton?'_t':''),[[ton?K.tmain:K.main,0,0]]);if(img)img=goreUp(img);}}catch(e){}if(!img)return false;
  g.seen[sk]=1;return sgtOpen({x:k.x,z:k.z},img,look,ton?{flies:1}:{flies:5,drip:K.prop?1:0});}
// walking up on one; and the flies
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused)return;const g=goreS();
  if(goreToned()!==GORE.toned){const was=GORE.toned;GORE.toned=goreToned();if(was!==undefined)for(const k of g.kills)if(KILLS[k.kind]&&(KILLS[k.kind].person||KILLS[k.kind].tmain)){goreKillHide(k.id);goreKillShow(k);}}   // the setting changed: swap the people
  if(S.room)return;
  for(const k of g.kills){if(g.seen[k.id])continue;const K=KILLS[k.kind];if(!K)continue;if(Math.hypot(P.x-k.x,P.z-k.z)<(K.person?3:2.6)){g.seen[k.id]=1;
    if(K.person){const ton=!!k.ton,look=ton?K.tlook:K.look;mindHit&&mindHit(ton?3:5);if(!goreSightP(k,ton,look))toast(look,7,true);
      if(!g.seen['kind_'+k.kind]){g.seen['kind_'+k.kind]=1;addLore(look);if(typeof journalNote==='function')journalNote(ton?K.tjot:K.jot);}continue;}
    mindHit&&mindHit(2);if(!(typeof goreSight==='function'&&goreSight(k))&&!g.seen['sight_'+k.kind])toast((k.ton&&K.tlook)||K.look,4.6,true);if(!g.seen['kind_'+k.kind]){g.seen['kind_'+k.kind]=1;addLore((k.ton&&K.tlook)||K.look);}}}
  // flies: you hear them before you see them
  if(!isNight()&&A.ok){GORE.buzzT=(GORE.buzzT||0)-dt;if(GORE.buzzT<=0){GORE.buzzT=.7+Math.random()*.8;let near=null,nd=4.5;for(const k of g.kills){const d=Math.hypot(P.x-k.x,P.z-k.z);if(d<nd){nd=d;near=k;}}
    if(near){const v=(1-nd/4.5)*(goreToned()?.006:.011),pan=clamp((near.x-P.x)/4,-1,1);A.tone(170+Math.random()*60,.5+Math.random()*.5,'sawtooth',v,{slide:150+Math.random()*90,pan,filter:['bandpass',620+Math.random()*260,5]});}}}
  // it hunts at night: anything it gets near stops
  if(isNight()&&H.vis&&H.state!=='gone'){GORE.huntT-=dt;if(GORE.huntT<=0){GORE.huntT=14+Math.random()*12;const a=typeof WILD!=='undefined'&&WILD.find(w=>(w.kind==='rabbit'||w.kind==='deer')&&w.st!=='gone'&&Math.hypot(w.x-H.x,w.z-H.z)<8&&!(typeof npSeen==='function'&&npSeen(w.x,w.z)));
    if(a){a.st='gone';const k=goreKillAdd(a.x,a.z,a.kind==='deer'?'deer':'rabbit',true);goreDecal(a.x,a.z,.2,6);const d=Math.hypot(a.x-P.x,a.z-P.z);
      if(d<26&&A.ok){const pan=clamp((a.x-P.x)/12,-1,1);A.tone(a.kind==='deer'?620:1300,.5,'sawtooth',.06*(1-d/26),{slide:a.kind==='deer'?300:700,pan,filter:['bandpass',1400,2],verb:true});A.hiss(.25,.08*(1-d/26),'lowpass',500,{delay:.45,pan});
        if(d<16)toast(a.kind==='deer'?'Somewhere close, a deer screams. Then something wet. Then nothing.':'Something small screams in the grass, very close, and then stops all at once.',3.8,true);}}}}};}
// ---------- (t372) full gore: under every kill the blood keeps coming out after you find it. The pool spreads through the
// morning and dries from red to brown by evening; yesterday's is a brown crust. Drawn once per size and dryness, then reused.
const GORE_POOLS={};
function gorePoolImg(seed,sc,st,dr){const key=seed+'|'+sc+'|'+st+'|'+dr;let o=GORE_POOLS[key];if(o)return o;
  const rx=Math.round((7+st*5.4)*sc*PPM/32),ry=Math.max(2,Math.round(rx*.42)),W=rx*2+10,Hh=ry*2+10,cv=document.createElement('canvas');cv.width=W;cv.height=Hh;const g=cv.getContext('2d'),im=g.createImageData(W,Hh),D=im.data;
  const f=dr/3,mix=(a,b)=>a.map((v,i)=>Math.round(v+(b[i]-v)*f));
  const rim=mix([48,0,18],[34,12,14]),body=mix([102,7,22],[70,26,22]),deep=mix([75,0,20],[52,18,16]),crust=[30,12,12];
  const cx=W/2,cy=Hh/2,s1=hash(seed,1)*6,s2=hash(seed,2)*6;
  const put=(x,y,c,a)=>{if(x<0||y<0||x>=W||y>=Hh)return;const i=(y*W+x)*4;D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2];D[i+3]=a;};
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry,an=Math.atan2(dy,dx),w=1+.2*Math.sin(an*3+s1)+.12*Math.sin(an*5+s2),d=(dx*dx+dy*dy)/(w*w);
    if(d<1)put(x,y,d>.8?(dr>=2&&d>.9?crust:rim):d>.3?body:deep,dr>=3?205:235);}
  for(let i=0;i<4+st;i++){const an=hash(seed,i+5)*6.283,rr=1.12+hash(seed,i+9)*.45,x=Math.round(cx+Math.cos(an)*rx*rr),y=Math.round(cy+Math.sin(an)*ry*rr);put(x,y,rim,220);if(hash(i,seed)<.5)put(x+1,y,rim,220);}
  if(dr<2){const gx=Math.round(cx-rx*.38),gy=Math.round(cy-ry*.35);put(gx,gy,dr?[176,96,90]:[226,150,132],230);put(gx+1,gy,dr?[120,40,44]:[172,70,70],230);}
  g.putImageData(im,0,0);o={cv,ax:Math.round(cx),ay:Math.round(cy)};GORE_POOLS[key]=o;return o;}
function gorePoolStage(k){if(k.day<S.day)return [3,3];const h=clamp(S.hour-6,0,15);return [Math.min(3,Math.floor(h/3.4)),Math.min(3,Math.floor(h/3.8))];}
{const _mg=mindGround;mindGround=function(){_mg();if(S.room||goreToned())return;for(const k of goreS().kills){const K=KILLS[k.kind];if(!K||!K.pool||k.night)continue;
  const px=k.x+K.pool[0],pz=k.z+K.pool[1];if(!onScreen(px,pz,90))continue;const [st,dr]=gorePoolStage(k);const o=gorePoolImg((k.id.length*31+(k.x*7|0))&1023,K.pool[2],st,dr);
  ctx2.drawImage(o.cv,Math.round(sx(px))-o.ax,Math.round(sz(pz))-o.ay);}};}
// the flies: a cloud over each kill by day, more the longer it lies there, and some of them down on it, walking about
let GORE_GLOW=null;
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;const night=isNight(),ton=goreToned();for(const k of goreS().kills){if(!onScreen(k.x,k.z,80))continue;const K=KILLS[k.kind]||{};
  if(K.glow){const gx=k.x+K.glow[0],gz=k.z+K.glow[1];D.push({z:k.z+.31,mind:1,draw(){if(!GORE_GLOW){const cv=document.createElement('canvas');cv.width=cv.height=40;const g=cv.getContext('2d'),gr=g.createRadialGradient(20,20,1,20,20,20);gr.addColorStop(0,'rgba(255,200,110,.55)');gr.addColorStop(.35,'rgba(240,150,60,.22)');gr.addColorStop(1,'rgba(240,120,40,0)');g.fillStyle=gr;g.fillRect(0,0,40,40);GORE_GLOW=cv;}
    ctx2.globalAlpha=(night?1:.55)*(.85+.15*Math.sin(t*9.1)*Math.sin(t*3.7));ctx2.drawImage(GORE_GLOW,Math.round(sx(gx))-20,Math.round(sz(gz))-20);ctx2.globalAlpha=1;}});}
  if(night)continue;const n=ton?5:(K.person?11:7)+(k.day<S.day?5:0),land=ton?0:Math.round(n*.45),sd=k.id.length*13+(k.x*3|0);
  D.push({z:k.z+.3,mind:1,draw(){const X=sx(k.x),Y=sz(k.z);
    for(let i=0;i<n-land;i++){const a=t*(5+i*.7)+i*2.1,r=6+(i%5)*2.4,fx=Math.round(X+Math.cos(a)*r),fy=Math.round(Y-6-Math.abs(Math.sin(a*1.3+i))*9);ctx2.fillStyle='#0c0a0a';ctx2.fillRect(fx,fy,1,1);
      if(((t*24+i)|0)%2){ctx2.fillStyle='rgba(170,170,180,.7)';ctx2.fillRect(fx-1,fy-1,1,1);ctx2.fillRect(fx+1,fy-1,1,1);}}
    for(let i=0;i<land;i++){const slot=Math.floor(t*.6+hash(i,sd)*3),hx=hash(i*7+slot,sd),hy=hash(slot,i*3+sd);ctx2.fillStyle='#0a0808';ctx2.fillRect(Math.round(X+(hx-.5)*18),Math.round(Y-2+(hy-.5)*8),1,1);}}});}};}
// ---------- people notice
if(typeof RX_SAY!=='undefined')RX_SAY.hurt=['You’re bleeding all over the step.','Good Lord. Sit down before you fall down.','(They look at the blood on you, then at your face, and smile.) It likes that, you know. When we bleed a bit.','Go and see Della. Go now. Don’t drip on the flowers.','You want to get that looked at. Before it gets the smell of you.'];
// (t372) and when someone has been found out by the Marsh place, the town talks about it the way it talks about weather
if(typeof RX_SAY!=='undefined'){RX_SAY.found=['Leave it be. Hale’s men will see to it. They always do.','Not one of ours. (They look relieved, then ashamed of it, then just relieved.)','Did you touch it? Don’t touch it.','No use telephoning the county. The county doesn’t come out this far.','Poor soul. Still. Better a stranger.','It never used to leave them where we’d find them.','They will keep getting off that bus.','(They’re scrubbing their front step, hard, though there’s nothing on it.)','Don’t look at the face. Whatever’s left of it.'];
  RX_SAY.foundPair=['…another one, out by the Marsh place.','…nobody we know. Nobody anyone knows.','…right out in the open. Like it’s proud of it.','…Hale says it’s a good sign. Hale would.','…burn the coat. Don’t ask me why, just burn it.'];
  if(typeof rxOverheard==='function'){const _ro=rxOverheard;rxOverheard=function(dt){const g=goreS();if(!(g.kills.some(k=>KILLS[k.kind]&&KILLS[k.kind].person&&k.day>=S.day-1)&&Math.random()<.5))return _ro.apply(this,arguments);
    const a=RX_SAY.any,p=RX_SAY.pair;RX_SAY.any=RX_SAY.found;RX_SAY.pair=RX_SAY.foundPair;try{return _ro.apply(this,arguments);}finally{RX_SAY.any=a;RX_SAY.pair=p;}};}}
