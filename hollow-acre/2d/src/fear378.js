/* ================= W3: the Fear bar. The mind (mind.js, M.v 0-100, 100 calm) comes to the surface: Fear = 100 - M.v, so every
   mindHit and mindCalm already moves it. Beside the clock your own face (built from your look, the same pixels as your sprite) and a
   thin bar under it; no number, no words. Five faces: calm, uneasy, scared, terrified, breaking. The face on your sprite in the world
   shows the same thing, and at rest it no longer grins. Fear slows your hands, costs more stamina and narrows the minigames' timing,
   and the setting "Fear effects on work" (Full / Light / Off) scales all of that. Comforts bring it down: talking, a hot drink or
   meal, a friend close by, sleep. For other modules: fearGet, fearTier, fearAdd(n,why), fearCalm(n,why), fearRate(key,perSec,on),
   fearWork, fearStamina, fearWindow, fearBreath, fearWobble, fearDarkRefuse, fearBalk, and the window event 'fear:tier'. ================= */
const FEAR={tier:0,log:[],rates:{},scale:{},talkT:{},fumbleT:0,fumbleCd:90,balkT:0,sndT:0,glanceT:0,glance:0,glanceCd:4,blinkT:0,blinkCd:3,
  tearT:0,shake:0,shakeT:0,breathT:0,puffs:[],flinchT:0,lastKey:'',faceKey:'',box:null,cv:null,bar:null,barW:-1,barC:'',look:'',vig:null,vigA:-1,cache:new Map(),faces:new Map(),sheet:null};
function fearGet(){return clamp(100-(typeof M!=='undefined'?M.v:100),0,100);}
const fearTierOf=f=>f<20?0:f<40?1:f<60?2:f<80?3:4;
function fearTier(){return fearTierOf(fearGet());}
function fearLog(why,n){FEAR.log.push([why||'?',Math.round(n*10)/10,Math.round(performance.now())]);if(FEAR.log.length>60)FEAR.log.shift();}
function fearAdd(n,why){n=+n||0;if(n<=0)return;n*=FEAR.scale[why]!=null?FEAR.scale[why]:1;mindHit(n);fearLog(why,n);}
function fearCalm(n,why){n=+n||0;if(n<=0)return;mindCalm(n);fearLog(why,-n);}
// a source that runs by the second: call it every frame with on true or false; it counts while any caller has it on (and the game runs)
function fearRate(key,perSec,on){const r=FEAR.rates[key]||(FEAR.rates[key]={});if(on){r.ps=+perSec||0;r.onAt=performance.now();}}
// ---- the setting: how much fear does to your work (Full, Light = half, Off). The bar and the face show either way.
const fearMode=()=>{try{return SET7.fearFx||'full';}catch(e){return 'full';}};
const fearK=()=>{const m=fearMode();return m==='off'?0:m==='light'?.5:1;};
try{SET7_DEF.fearFx='full';if(!['full','light','off'].includes(SET7.fearFx))SET7.fearFx='full';if(SET7_GK.gameplay.indexOf('fearFx')<0)SET7_GK.gameplay.push('fearFx');}catch(e){}
try{const _r=set7Rows;set7Rows=function(g){const R=_r.apply(this,arguments);if(g==='gameplay'&&!R.some(r=>r.k==='fearFx')){let i=R.findIndex(r=>r.k==='mindGames');i=i<0?R.findIndex(r=>r.type==='button'):i+1;
  R.splice(i<0?R.length:i,0,{k:'fearFx',type:'choice',label:'Fear effects on work',opts:[['full','Full'],['light','Light'],['off','Off']],sub:'How much fear slows your hands and narrows your timing. Light: half as much'});}return R;};}catch(e){}
// ---- what fear does: per band, eased toward 1 by the setting
const FEAR_FX={work:[1,.95,.85,.7,.55],stam:[1,1.05,1.15,1.3,1.45],win:[1,.95,.9,.8,.7],breath:[1,.9,.8,.65,.5]};
const fearFx=k=>{const v=FEAR_FX[k][fearTier()];return 1+(v-1)*fearK();};
function fearWork(){const t=fearTier();if(t===0&&fearK()>0){try{if(S.energy>=S.energyMax*.6&&S.hp>=S.hpMax*.6&&S.hour<20)return 1.05;}catch(e){}}return fearFx('work');}
function fearStamina(){return fearFx('stam');}
function fearWindow(){return fearFx('win');}
function fearBreath(){return fearFx('breath');}
function fearWobble(){return [0,0,1,2,2.5][fearTier()]*fearK();}
// Terrified with no light: you won't go down into the dark
function fearDarkRefuse(){try{return fearTier()>=3&&!(typeof lanternOn==='function'&&lanternOn());}catch(e){return false;}}
const FEAR_BALK=['You can’t make yourself go down there. Not without a light.','Your legs won’t take you in. It’s too dark.','No. Not in the dark. Not like this.'];
function fearBalk(){if(FEAR.balkT>0)return true;FEAR.balkT=.9;try{P.spd=0;if(P.anim==null)P.clip='idle';}catch(e){}FEAR.shakeT=.9;
  try{toast(FEAR_BALK[(rand()*FEAR_BALK.length)|0],2.4);}catch(e){}try{SFX.breath&&SFX.breath(0);}catch(e){}return true;}

// ---- the sources the mind didn't have yet (night, the dark, the thing watching and the lamps are mind.js's own): alone far from
// home at night, hungry or hurt, and the per-second sources other modules report. Hiding slows what the dark does to you.
const FEAR_HOME=()=>[0,-7.6];   // the farmhouse door, where each morning starts
function fearTick(dt){if(S.mode!=='play'||S.paused)return;const now=performance.now();
  let add=0;const night=typeof isNight==='function'&&isNight()&&!S.bound;
  if(night&&!S.room){const h=FEAR_HOME();if(Math.hypot(P.x-h[0],P.z-h[1])>40)add+=1/20;}
  try{if(S.energy<S.energyMax*.15||S.hp<S.hpMax*.3)add+=1/30;}catch(e){}
  for(const k in FEAR.rates){const r=FEAR.rates[k];if(now-(r.onAt||-1e9)<250){add+=r.ps*(FEAR.scale[k]!=null?FEAR.scale[k]:1);r.acc=(r.acc||0)+r.ps*dt;if(r.acc>=1){fearLog(k,r.acc);r.acc=0;}}}
  if(add>0)mindHit(add*dt);
  // comforts that need no action: a friend close by
  try{for(const k in PEER_RS){const r=PEER_RS[k];if((r.room||'')===(S.room||'')&&Math.hypot(r.x-P.x,r.z-P.z)<3){mindCalm(.5*dt);break;}}}catch(e){}
  if(FEAR.balkT>0)FEAR.balkT-=dt;if(FEAR.shakeT>0)FEAR.shakeT-=dt;if(FEAR.fumbleT>0)FEAR.fumbleT-=dt;
  const t=fearTier();if(t!==FEAR.tier){const prev=FEAR.tier;FEAR.tier=t;try{window.dispatchEvent(new CustomEvent('fear:tier',{detail:{tier:t,prev}}));}catch(e){}}
  fearSound(dt,t);fearFumble(dt,t);}
// the sound of it: a faint high tone, then your own breathing, then your heart, louder as it goes
function fearSound(dt,t){FEAR.sndT-=dt;if(FEAR.sndT>0||t===0)return;try{if(typeof A==='undefined'||!A.ok)return;
  if(t===1){FEAR.sndT=22+rand()*20;A.tone(4100+rand()*700,1.2,'sine',.008,{a:.4});}
  else if(t===2){FEAR.sndT=3.4+rand()*1.2;SFX.breath&&SFX.breath(0);}
  else{const v=t===3?.16:.3;FEAR.sndT=t===3?.95:.68;A.tone(64,.14,'sine',v,{slide:42});A.tone(58,.12,'sine',v*.7,{slide:40,delay:.22});}}catch(e){}}
// Scared and worse: now and then your hands shake and you drop what you hold. It lands at your feet; you pick it up again.
function fearFumble(dt,t){if(t<2||fearK()===0)return;FEAR.fumbleCd-=dt*(t-1);if(FEAR.fumbleCd>0||P.anim)return;FEAR.fumbleCd=70+rand()*90;
  if(rand()>.35*fearK())return;let nm='it';try{const it=S.inv&&S.inv[S.sel];if(it&&(it.name||it.id))nm=String(it.name||it.id).toLowerCase();}catch(e){}
  FEAR.fumbleT=1.3;try{SFX.thud&&SFX.thud(0,.25);toast('Your hands are shaking. You drop '+(nm==='it'?'it':'the '+nm)+', and pick it up again.',2.4);}catch(e){}}

// ---- comforts with an action: talking to anyone, a hot drink, a hot meal, the doctor's tonic, sleep
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{const id=n&&n.def&&n.def.id||'?',now=performance.now();if(!(FEAR.talkT[id]>now)){FEAR.talkT[id]=now+90000;fearCalm(5,'talk');}}catch(e){}return r;};}
{const _e=eat;eat=function(e,h,name){const r=_e.apply(this,arguments);try{const n=String(name||'');
  if(/tonic/i.test(n)){if(FEAR.tonicDay!==S.day){FEAR.tonicDay=S.day;fearCalm(25,'tonic');}}
  else if(/\b(tea|coffee|cocoa|cider)\b/i.test(n))fearCalm(10,'drink');
  else if(/\b(pie|stew|soup|chowder|roast|hot|porridge|broth|casserole)\b/i.test(n))fearCalm(15,'meal');}catch(err){}return r;};}
// sleep brings it down to Uneasy at most; a nightmare leaves you a little more shaken
{const _nd=newDay;newDay=function(msg,pos){const before=M.v;const r=_nd.apply(this,arguments);try{const bad=before<55&&!S.bound;M.v=bad?65:Math.max(M.v,80);}catch(e){}return r;};}

// ---- what fear does to your work: tools take longer, stamina goes faster, the minigames' timing narrows
{const _sa=startAnim;startAnim=function(clip,dur,t,fire){if(FEAR.fumbleT>0&&/^(hoe|pick|axe|water|slash|scythe|grab)$/.test(clip))return;
  if(/^(hoe|pick|axe|water|slash|scythe)$/.test(clip))dur=dur/fearWork();return _sa.call(this,clip,dur,t,fire);};}
{const _sp=spend;spend=function(n){return _sp.call(this,n>0?n*fearStamina():n);};}
// Scared and worse, your aim in the minigames drifts a little (a slow wander, not noise; the auto-player's own pointer is left alone)
try{const _mr=mg4Run;mg4Run=function(){const r=_mr.apply(this,arguments);try{const cv=$('mg4C');for(const k of ['onpointermove','onpointerdown']){const f=cv[k];if(!f||f.__fw)continue;
    const g=function(e){const A=fearWobble();if(!(A>0)||e.pointerId===7)return f.call(this,e);const t=performance.now()/1000,rc=cv.getBoundingClientRect(),sc=rc.width/320;
      return f.call(this,{clientX:e.clientX+(A*Math.sin(t*2.3)+A*.5*Math.sin(t*5.9+1))*sc,clientY:e.clientY+(A*.8*Math.sin(t*1.7+2)+A*.4*Math.sin(t*6.7))*sc,pointerId:e.pointerId,button:e.button,target:e.target,preventDefault:()=>e.preventDefault()});};
    g.__fw=1;cv[k]=g;}}catch(e){}return r;};}catch(e){}
try{const _k=mg4Kit;mg4Kit=function(g){const K=_k.apply(this,arguments);const j=K.judge;K.judge=function(s){const f=fearWindow();if(f<1&&s>0&&s<1)arguments[0]=Math.max(0,1-(1-s)/f);return j.apply(this,arguments);};return K;};}catch(e){}

// ---- the faces: one painter for the portrait and the sprite. It works on a frame's pixels around the face's anchor (A: the face's
// axis and the eye row), as the wardrobe's face items do: P(dx,dy) is dx right of the axis, dy below the eye row; mirrored pairs are
// dx and 1-dx. Facing you only (from the side it adds the tears and the pallor; from behind there's no face).
const FEAR_WHITE=[238,234,226],FEAR_PALE=[206,214,224],FEAR_TEAR=[150,198,232],FEAR_MOUTH=[58,24,28];
function fearPaint(px,A,dir,st){const cx=A[0],hy=A[1],shut=!!(A[2]&1),side=dir==='E'||dir==='W',f=dir==='E'?1:-1;
  const g=(dx,dy)=>px.get(cx+dx,hy+dy),s=(dx,dy,c)=>{if(c)px.set(cx+dx,hy+dy,c);};const eq=(a,b)=>a&&b&&a[0]===b[0]&&a[1]===b[1]&&a[2]===b[2]&&a[3]>0&&b[3]>0;
  const isSk=c=>c&&c[3]>0&&px.skin.has((c[0]<<16)|(c[1]<<8)|c[2]);
  const t=st.tier;
  // pallor last (every return goes through it), so the features are placed against the skin's own shades
  const pale=()=>{if(t<3)return;const k=t===3?.22:.32;for(let dy=-9;dy<=9;dy++)for(let dx=-8;dx<=9;dx++){const c=g(dx,dy);if(isSk(c))s(dx,dy,[Math.round(c[0]+(FEAR_PALE[0]-c[0])*k),Math.round(c[1]+(FEAR_PALE[1]-c[1])*k),Math.round(c[2]+(FEAR_PALE[2]-c[2])*k),255]);}};
  if(side){const u=(uu,dy)=>[cx+uu*f,hy+dy];
    if(t>=4&&!shut){const [x,y]=u(4,3);if(isSk(px.get(x,y)))px.set(x,y,[...FEAR_TEAR,255]);if(st.tear){const [x2,y2]=u(4,4);if(isSk(px.get(x2,y2)))px.set(x2,y2,[...FEAR_TEAR,255]);}}
    if(t===3&&st.sweat){const [x,y]=u(-1,-3);if(isSk(px.get(x,y)))px.set(x,y,[196,226,240,255]);}
    pale();return;}
  // ---- facing you. Each band moves brows, lids and mouth together. Marks keep two value steps from the skin under them, so they
  // read on dark skin too. The skin beside a pixel is used to paint a feature out (never the mouth's own shade, which is a skin shade).
  const M0=g(0,7);const skinAt=(dx,dy)=>{for(const [ax,ay] of [[0,-1],[0,1],[-1,0],[1,0],[0,-2]]){const c=g(dx+ax,dy+ay);if(isSk(c)&&!eq(c,M0))return c;}return null;};
  const lum=c=>.299*c[0]+.587*c[1]+.114*c[2];
  const dk=(c,dx,dy,min)=>{const b=skinAt(dx,dy)||g(dx,dy)||c;let k=[c[0],c[1],c[2]];for(let n=0;n<14&&lum(b)-lum(k)<min;n++)k=k.map(v=>Math.round(v*.8));return [...k,255];};
  const X=(m,dx)=>m?1-dx:dx,W=[...FEAR_WHITE,255],TEETH=[234,228,214,255];
  // the mouth: the grin's corners go (at rest too); uneasy pulls it thin to one side; scared stretches it over the teeth;
  // terrified drops it open over the teeth; breaking opens it wide with the corners down
  if(M0&&M0[3]&&!eq(M0,g(0,6))&&eq(M0,g(1,7))){for(const dx of [-1,2]){const c=g(dx,6);if(eq(c,M0))s(dx,6,skinAt(dx,6));}
    const md=(dx,dy)=>s(dx,dy,dk(FEAR_MOUTH,dx,dy,70)),tt=(dx,dy)=>s(dx,dy,TEETH);
    if(t===0)for(const dx of [0,1])s(dx,7,dk(M0,dx,7,48));
    else if(t===1){const sd=(st.glance||1)>0?2:-1;for(const dx of [0,1,sd])md(dx,7);md(sd,8);}
    else if(t===2){for(const dx of [-1,0,1,2])md(dx,7);tt(0,6);tt(1,6);}
    else if(t===3){md(-1,6);tt(0,6);tt(1,6);md(2,6);for(const dx of [-1,0,1,2])md(dx,7);md(0,8);md(1,8);}
    else{md(0,6);md(1,6);for(const dx of [-1,0,1,2])md(dx,7);md(-1,8);md(2,8);}}
  // brows, where they lie on bare skin (not under a fringe): uneasy lifts the inner ends; scared lifts them and the inner ends more;
  // terrified lifts them high; breaking keeps the outer ends and lifts the inner ones
  const B=g(-4,-2),brow=B&&!isSk(B)&&!eq(B,M0)&&isSk(g(-4,-4))&&isSk(g(-3,-4));
  if(brow&&t>=1){const BC=dk(B,-4,-3,45);const old=[[-5,-1],[-4,-2],[-3,-2]];
    const nw=t===1?[[-5,-1],[-4,-2],[-3,-3]]:t===2?[[-5,-2],[-4,-3],[-3,-4]]:t===3?[[-5,-3],[-4,-4],[-3,-4]]:[[-6,-1],[-5,-1],[-4,-2],[-3,-3]];
    for(const m of [0,1]){for(const [dx,dy] of old){const c=g(X(m,dx),dy);if(eq(c,B))s(X(m,dx),dy,skinAt(X(m,dx),dy)||c);}for(const [dx,dy] of nw){const c=g(X(m,dx),dy);if(isSk(c))s(X(m,dx),dy,BC);}}}
  if(shut){pale();return;}
  // the eyes: each is two columns (-4,-3, mirrored 5,4); the lashes on row 0, the iris on rows 1 and 2
  const L=[g(-4,1),g(-3,1),g(-4,2),g(-3,2)];if(!L.every(c=>c&&!isSk(c))){pale();return;}
  const dark=L[0],iris=L[2],lash=g(-4,0);
  if(st.blink){for(const m of [0,1])for(const dx of [-5,-4,-3]){const sk=skinAt(X(m,dx),-1)||skinAt(X(m,dx),3);if(sk){s(X(m,dx),0,sk);s(X(m,dx),1,sk);}if(lash&&!isSk(lash))s(X(m,dx),2,dk(lash,X(m,dx),3,50));}}
  else if(t===1){// a wary look aside: the iris on that side of each eye, white on the other
    const gl=st.glance||1;for(const m of [0,1]){const toward=(gl>0)===(m===1)?-4:-3,away=toward===-4?-3:-4;s(X(m,toward),1,dark);s(X(m,toward),2,iris);s(X(m,away),1,W);s(X(m,away),2,W);}}
  else if(t>=2&&t<=3){// wide open: white shows above the iris (and below it when terrified); the lashes go up a row
    for(const m of [0,1]){for(const dx of [-5,-4,-3]){const c=g(X(m,dx),-1);if(isSk(c)&&lash&&!isSk(lash))s(X(m,dx),-1,dk(lash,X(m,dx),-1,50));}
      s(X(m,-4),0,W);s(X(m,-3),0,W);if(isSk(g(X(m,-5),0)))s(X(m,-5),0,skinAt(X(m,-5),1)||g(X(m,-5),0));if(t===3){s(X(m,-4),3,W);s(X(m,-3),3,W);}}}
  if(t>=4){for(const m of [0,1]){s(X(m,-3),1,W);for(const dx of [-4,-3])if(isSk(g(X(m,dx),3)))s(X(m,dx),3,[...FEAR_TEAR,255]);if(st.tear){for(const dy of [4,5,6])if(isSk(g(X(m,-4),dy)))s(X(m,-4),dy,[...FEAR_TEAR,255]);}}}
  if(t===3&&st.sweat){for(const [dx,dy,c] of [[7,-3,[214,236,246,255]],[7,-2,[150,198,232,255]],[-6,-3,[214,236,246,255]]])if(isSk(g(dx,dy)))s(dx,dy,c);}
  pale();}
// pixel access to an ImageData (or a region of one starting at x0,y0 in frame coordinates)
function fearPx(d,W,H,x0,y0,skin){return {skin,get:(x,y)=>{x-=x0;y-=y0;if(x<0||y<0||x>=W||y>=H)return null;const i=(y*W+x)*4;return [d[i],d[i+1],d[i+2],d[i+3]];},
  set:(x,y,c)=>{x-=x0;y-=y0;if(x<0||y<0||x>=W||y>=H||!c)return;const i=(y*W+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=c[3]==null?255:c[3];}};}
function fearSkinSet(w){const s=new Set();try{for(const c of wdRamp(wdColD(w,'skin')))s.add((c[0]<<16)|(c[1]<<8)|c[2]);}catch(e){}return s;}

// ---- at rest your face doesn't grin: in every frame facing you, the mouth's turned-up corners go back to skin (a painted lip that
// follows the same smile loses its corners too; full lips keep their shape). Done as the wardrobe builds your sheets, so your sprite,
// your friends' view of you, the wardrobe and the portrait all agree.
function fearRestMouth(tool,r0,r1,dst,W,X0){for(let row=r0;row<r1;row++){if(WD_ROWDIR[row]!=='S')continue;
    for(let col=0;col<9;col++){const fx0=col*WD_FW-X0;if(fx0+WD_FW<=0||fx0>=W)continue;const A=wdAnchor(tool,row,col);if(!A||(A[2]&6))continue;const y0=(row-r0)*WD_FH;
      const at=(dx,dy)=>{const x=fx0+A[0]+dx,y=y0+A[1]+dy;return x<0||x>=W?-1:(y*W+x)*4;};const k=i=>i<0||!dst[i+3]?-1:(dst[i]<<16)|(dst[i+1]<<8)|dst[i+2];
      const m=k(at(0,7));if(m<0||k(at(1,7))!==m||k(at(-1,6))!==m||k(at(2,6))!==m||k(at(0,6))===m)continue;
      for(const dx of [-1,2]){const i=at(dx,6),j=at(dx,5);if(i<0||j<0||k(j)<0||k(j)===m)continue;dst[i]=dst[j];dst[i+1]=dst[j+1];dst[i+2]=dst[j+2];dst[i+3]=255;}}}}
if(typeof WD!=='undefined'){const _fp=WD.facePass;WD.facePass=function(w,tool,r0,r1,a,dst,W,X0){const r=_fp?_fp.apply(this,arguments):undefined;try{fearRestMouth(tool,r0,r1,dst,W,X0);}catch(e){}return r;};
  try{if(WD_RAWC)WD_RAWC.clear();if(typeof applyLook==='function'&&S.look&&S.look.w&&S.mode!=='title')applyLook();}catch(e){}}

// ---- the portrait beside the clock: your face (brows to chin), cut from your own front-facing frame at three times, with a thin bar under it
function fearHudBuild(){const clock=$('clock');if(!clock||FEAR.box)return;const st=document.createElement('style');st.textContent=`
#clock.fear378,#hud #clock.fear378{position:relative!important;padding-right:72px}
#fearBox{position:absolute;right:8px;top:4px;width:57px;pointer-events:none}
#fearBox canvas{display:block;width:57px;height:48px;image-rendering:pixelated;background:#1a120c;box-shadow:0 0 0 1px #5a3e22}
#fearBox .fb{height:3px;margin-top:2px;background:#2a1c12;border:1px solid #3a2818}#fearBox .fb i{display:block;height:100%;width:0;background:#c8b27a}`;
  document.head.appendChild(st);const b=document.createElement('div');b.id='fearBox';b.innerHTML='<canvas width="19" height="16"></canvas><div class="fb"><i></i></div>';
  clock.appendChild(b);clock.classList.add('fear378');FEAR.box=b;FEAR.cv=b.querySelector('canvas');FEAR.bar=b.querySelector('.fb i');}
function fearHud(dt){if(!FEAR.box)fearHudBuild();if(!FEAR.box)return;const f=fearGet(),t=fearTierOf(f);
  // the bar: only touched when its width or colour changes
  const w=Math.round(f),c=t>=4?'#c8402a':t>=3?'#d0683a':t>=2?'#d09a4a':t>=1?'#c8b27a':'#8aa07a';
  if(w!==FEAR.barW){FEAR.barW=w;FEAR.bar.style.width=w+'%';}if(c!==FEAR.barC){FEAR.barC=c;FEAR.bar.style.background=c;}
  // the face's small motions: a blink now and then, the eyes flicking aside when uneasy, a tremble when terrified
  FEAR.blinkCd-=dt;if(FEAR.blinkT>0)FEAR.blinkT-=dt;else if(FEAR.blinkCd<=0){FEAR.blinkT=.13;FEAR.blinkCd=2.2+rand()*3.5/(1+t*.4);}
  // uneasy, the eyes stay to one side and flick across now and then
  if(t===1){if(!FEAR.glance)FEAR.glance=1;FEAR.glanceCd-=dt;if(FEAR.glanceCd<=0){FEAR.glance=-FEAR.glance;FEAR.glanceCd=1.6+rand()*3.4;}}else FEAR.glance=0;
  FEAR.tearT=(FEAR.tearT+dt)%3.2;const tear=t>=4&&FEAR.tearT>2.2;const sweat=t===3;
  let shake=0;if(t>=3||FEAR.shakeT>0){FEAR.shakeTk=(FEAR.shakeTk||0)+dt;if(FEAR.shakeTk>(t>=4?.09:.14)){FEAR.shakeTk=0;FEAR.shake=FEAR.shake?0:(rand()<.5?-1:1);}shake=FEAR.shake;}
  const key=[FEAR.look,t,FEAR.blinkT>0?1:0,FEAR.glance,tear?1:0,sweat?1:0,shake,typeof __w79!=='undefined'&&__w79.threat&&__w79.threat()==='in'?1:0].join('|');
  if(key===FEAR.faceKey)return;fearFaceDraw(t,{blink:FEAR.blinkT>0,glance:FEAR.glance,tear,sweat,shake},key);}
function fearFaceDraw(t,o,key){const w=S.look&&S.look.w;if(!w||typeof wdFrame!=='function')return;const A=wdAnchor('',10,0);if(!A)return;
  const fk=[FEAR.look,t,o.blink?1:0,o.glance,o.tear?1:0,o.sweat?1:0].join('|');let c=FEAR.faces.get(fk);
  if(!c){let d;try{d=wdFrame(w,'',10,0);}catch(e){return;}let any=0;for(let i=3;i<d.data.length;i+=4)if(d.data[i]){any=1;break;}if(!any)return;   // its layers aren't in yet: try again next frame
    fearPaint(fearPx(d.data,WD_FW,WD_FH,0,0,fearSkinSet(w)),A,'S',{tier:t,blink:o.blink,glance:o.glance,tear:o.tear,sweat:o.sweat});
    c=document.createElement('canvas');c.width=WD_FW;c.height=WD_FH;c.getContext('2d').putImageData(d,0,0);if(FEAR.faces.size>40)FEAR.faces.clear();FEAR.faces.set(fk,c);}
  const cv=FEAR.cv,g=cv.getContext('2d');g.clearRect(0,0,cv.width,cv.height);g.imageSmoothingEnabled=false;g.drawImage(c,A[0]-9+o.shake,A[1]-6,19,16,0,0,19,16);FEAR.faceKey=key;}
// the look changed (the wardrobe, a dye): draw the face again
let fearLookT=0;function fearLookChk(dt){fearLookT-=dt;if(fearLookT>0)return;fearLookT=.5;try{const k=wdEnc(S.look.w);if(k!==FEAR.look){FEAR.look=k;FEAR.cache.clear();FEAR.faces.clear();}}catch(e){}}

// ---- Scared and worse, the lantern's flame won't hold still in your hand
try{const _lf=lanternFlicker;lanternFlicker=function(t){const v=_lf.apply(this,arguments);const tr=fearTier();if(tr<2)return v;return v*(1+.45*(tr-1))+(Math.random()-.5)*.22*(tr-1);};}catch(e){}

// ---- the view narrows when it breaks (a dark ring, drawn by the page; written only when its strength changes)
function fearVignette(){const t=fearTier();const a=t>=4?Math.min(4,Math.floor((fearGet()-80)/5)):-1;if(a===FEAR.vigA)return;FEAR.vigA=a;let v=FEAR.vig;
  if(!v){v=FEAR.vig=document.createElement('div');v.id='fearVig';v.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:0;transition:opacity 1.2s';const h=$('hud');if(h&&h.parentNode)h.parentNode.insertBefore(v,h);else document.body.appendChild(v);}   // under the HUD, over the world
  // the clear middle shrinks as it gets worse: from a third of the screen to about a fifth, the edges near black
  if(a<0){v.style.opacity='0';return;}const r0=34-a*4;v.style.background=`radial-gradient(ellipse 62% 58% at 50% 54%,rgba(0,0,0,0) ${r0}%,rgba(4,1,1,.55) ${r0+22}%,rgba(4,1,1,.97) 100%)`;v.style.opacity='1';}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);const d=Math.min(.1,dt||0);try{fearTick(d);}catch(e){}
  try{const hud=$('hud');if(hud&&!hud.hidden){fearLookChk(d);fearHud(d);}}catch(e){}try{fearVignette();}catch(e){}return r;};}
// the HUD's own refresh (paused, talking, between scenes) keeps the bar and face current too
{const _uh=updateHud;updateHud=function(){const r=_uh.apply(this,arguments);try{fearHud(0);}catch(e){}return r;};}

// ---- your sprite: the same face, drawn over the frame as it's drawn; at rest it doesn't grin. Scared, you glance over your
// shoulder when idle; terrified you tremble and your breath shows; breaking, you hunch. Cached per frame and face.
function fearSprFace(nm,row,f,dir,st){const m=SPR[nm];const im=m&&IMG[m.src];if(!im||!im.width)return null;if(FEAR.sheet!==im){FEAR.sheet=im;FEAR.cache.clear();}
  const tool=nm.slice(6);const A=wdAnchor(tool,row,f);if(!A||(A[2]&6))return null;
  const key=nm+'|'+row+'|'+f+'|'+dir+'|'+st.tier+'|'+st.glance+'|'+(st.tear?1:0)+'|'+(st.sweat?1:0);let c=FEAR.cache.get(key);if(c!==undefined)return c;
  // read through a small scratch canvas: reading the sheet itself would take it off the GPU and slow every frame after
  const X0=A[0]-9,Y0=A[1]-5,W=19,H=15;let sc=FEAR.rd;if(!sc){sc=FEAR.rd=document.createElement('canvas');sc.width=W;sc.height=H;FEAR.rdg=sc.getContext('2d',{willReadFrequently:true});}
  FEAR.rdg.clearRect(0,0,W,H);FEAR.rdg.drawImage(im,f*WD_FW+X0,row*WD_FH+Y0,W,H,0,0,W,H);const d=FEAR.rdg.getImageData(0,0,W,H);const before=d.data.slice();
  fearPaint(fearPx(d.data,W,H,X0,Y0,fearSkinSet(S.look.w)),A,dir,st);let diff=0;for(let i=0;i<before.length;i++)if(before[i]!==d.data[i]){diff=1;break;}
  if(!diff)c=null;else{c=document.createElement('canvas');c.width=W;c.height=H;c.getContext('2d').putImageData(d,0,0);c.x0=X0;c.y0=Y0;}
  if(FEAR.cache.size>400)FEAR.cache.clear();FEAR.cache.set(key,c);return c;}
{const _ds=drawSpr;drawSpr=function(name,x,y,clip,dir,frame,o){
  const mine=typeof name==='string'&&(name==='farmer'||name.startsWith('farmer_'))&&P._fr&&P._fr[0]===name&&!(o&&(o.flip||o.ctx||(o.scale&&o.scale!==1)));
  if(!mine)return _ds.apply(this,arguments);
  const now=performance.now()/1000,dt=Math.min(.1,now-(FEAR.sprAt||now));FEAR.sprAt=now;
  const t=fearTier(),idle=!P.anim&&clip==='idle'&&S.mode==='play';let dx=0,dy=0,d2=dir;
  if(idle&&t>=3&&FEAR.shake)dx=FEAR.shake;if(t>=4&&!P.anim)dy=1;if(FEAR.shakeT>0)dx=FEAR.shake||1;
  // a look over the shoulder when you've stood still a while
  if(idle&&t>=2){FEAR.overT=(FEAR.overT||0)-dt;if(FEAR.overT<=0){FEAR.overT=5+rand()*5;FEAR.over=.7;}if(FEAR.over>0){FEAR.over-=dt;d2=dir==='S'?(FEAR.overSide||(FEAR.overSide=rand()<.5?'E':'W')):'S';}else FEAR.overSide=null;}
  const r=_ds.call(this,name,x+dx,y+dy,clip,d2,frame,o);
  try{if(d2!=='N'&&S.look&&S.look.w){const m=SPR[name],c0=m.clips[clip]||m.clips.idle,rr=c0&&(c0[d2]||c0.S);if(rr){const row=rr[0],f=((frame|0)%rr[1]);
      const st={tier:t,glance:t===1?FEAR.glance:0,tear:t>=4&&FEAR.tearT>2.2,sweat:t===3};const c=fearSprFace(name,row,f,d2,st);
      if(c){const g=ctx2;g.drawImage(c,Math.round(x+dx-m.ax)+c.x0,Math.round(y+dy-m.ay)+c.y0);}
      // breath in the cold air
      if(t>=3&&typeof isNight==='function'&&isNight()&&!S.room){if(!FEAR.breathAt||now-FEAR.breathAt>2.3){FEAR.breathAt=now;const A=wdAnchor('',row,f);if(A)FEAR.puffs.push({t:0,x:Math.round(x+dx-m.ax)+A[0]+(d2==='E'?6:d2==='W'?-6:0),y:Math.round(y+dy-m.ay)+A[1]+7});}
        for(let i=FEAR.puffs.length-1;i>=0;i--){const p=FEAR.puffs[i];p.t+=dt;if(p.t>.9){FEAR.puffs.splice(i,1);continue;}const g=ctx2;g.globalAlpha=.45*(1-p.t/.9);g.fillStyle='#dfe6ee';
          g.fillRect(p.x-1,Math.round(p.y-p.t*6),2,1);g.fillRect(p.x+(p.t>.4?1:0),Math.round(p.y-1-p.t*7),1,1);g.globalAlpha=1;}}}}}catch(e){}
  return r;};}

// for tests: set the fear, read the state
window.__fear={set:v=>{M.v=clamp(100-v,0,100);return fearGet();},state:()=>({fear:fearGet(),tier:fearTier(),work:fearWork(),stam:fearStamina(),win:fearWindow(),breath:fearBreath(),mode:fearMode(),log:FEAR.log.slice(-12)}),
  face:()=>FEAR.cv&&FEAR.cv.toDataURL()};
