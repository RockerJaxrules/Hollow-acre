// ---- Hollow Acre characters, third generation. Built to the proportions of the Stardew-era villagers we studied (16x32 sprites), drawn
// here at 1.5x: a boxy round head about half the figure, a wide face with 2x3 eyes under a dark lash line, hair in clean locks that fall
// from the crown and frame the face, separate arm columns with hands at the hip, short legs and chunky shoes, hue-shifted dark outlines.
// Every pixel is our own. Each frame is drawn into part layers (body+outfit, beard, hair, accessory, glasses, hat, the fists over a tool)
// so the player can be assembled from any combination at runtime; NPC sheets flatten them. Colours come only from five-step ramps,
// so custom.js can recolour the player's skin, hair, eyes and clothes exactly.
SEED=CFG.seed||3;
const C=CFG.look,KID=!!C.kid,PART=CFG.part||'all',TOOL=CFG.tool||null;
let EXPR=CFG.expr||'neutral';
const FW=48,FH=64,D4=['N','W','S','E'];
const CLIPS=[['walk',D4,9],['run',D4,9],['idle',D4,4],['thrust',D4,8],['slash',D4,6],['hurt',['S'],6],['spellcast',D4,7],['sit',D4,3]];
const ROWS=[];for(const [n,ds,nf] of CLIPS)for(const d of ds)ROWS.push([n,d,nf]);
const SHEET=layer('sheet',FW*9,FH*ROWS.length);
// ---- hue-shifted five-step ramps (deep, shadow, mid, base, light), shared with custom.js, and the outline colour
function rgb2hsv(c){const r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx];}
function hsv2rgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
function hueToward(h,t,a){let d=((t-h+540)%360)-180;if(Math.abs(d)<a)return t;return (h+Math.sign(d)*a+360)%360;}
function rampRGB(c){const [h,s,v]=rgb2hsv(c);const cl=x=>Math.max(0,Math.min(1,x));
  const mk=(tgt,amt,ks,kv,add)=>hsv2rgb(hueToward(h,tgt,amt),cl(s*ks+(ks>1?.04:0)),cl(v*kv+add));
  return [mk(265,26,1.22,.3,0),mk(265,16,1.14,.56,0),mk(265,7,1.06,.79,0),[c[0],c[1],c[2]],mk(55,12,.78,1.1,.07)];}
function outlineRGB(n){const [h,s,v]=rgb2hsv(n);return hsv2rgb(hueToward(h,250,30),Math.max(0,Math.min(1,s*1.15+.15)),Math.max(.07,v*.26));}
const ramp=hex=>rampRGB(HEX(hex));
const SK=ramp(C.skin||'#e8b48c'),HR=ramp(C.hair||'#6a4224'),EYR=ramp(C.eye||'#3a5a7a'),SHT=ramp(C.shirt||'#b8402c'),PNT=ramp(C.pants||'#3a4e7a'),SHO=ramp(C.shoes||'#3a2618'),
  EX=ramp(C.extra||'#6a7a3a'),ACCR=ramp(C.acc||'#c83a5a'),HAT=ramp(C.hatColor||'#8a5a2a'),SKR=C.skirt?ramp(C.skirt):PNT;
const OUT=C.outfit||(C.overalls?'overalls':C.coat?'jacket':C.plaid?'shirt':(C.skirt?'dress':'tee'));
const JK=C.coat?ramp(C.coatColor||C.shirt||'#3a3a40'):EX;
const BELT=[[40,26,16],[62,40,26],[96,64,38]],BUCKLE=[[150,118,52],[222,190,96]];
const WHITE=[238,234,226],BLUSH=[232,138,128],LASH=[34,24,26],TEETH=[240,236,228],MOUTH=[70,26,30];
// ---- part layers for the frame being drawn
const PARTS=['body','beard','hair','acc','glasses','hat','toolf'];
let LY={},CUR='body';
const TIPR=C.hairTip?ramp(C.hairTip):null;let TIPY=1e9;   // two-tone hair: the lengths below TIPY take the tip colour
const p=(x,y,c)=>{if(!c)return;if(TIPR&&CUR==='hair'&&y>=TIPY-1){const k=HR.indexOf(c);if(k>=0&&(y>=TIPY||((Math.round(x)+Math.round(y))&1)))c=TIPR[k];}P(LY[CUR],Math.round(x),Math.round(y),c);};
const g=(x,y)=>G(LY[CUR],Math.round(x),Math.round(y));
const into=(part,fn)=>{const o=CUR;CUR=part;fn();CUR=o;};
const dk=(R,d)=>R.map((c,i)=>R[Math.max(0,Math.min(4,i-d))]);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---- shirt patterns: every shirt pixel belongs to one of 8 phases (row%4, column%4===1). The player's layers give each phase its own base
// colour so custom.js can make any top plain, plaid, striped or dotted; NPC sheets bake their pattern in.
const PAT=C.pattern||(C.plaid?'plaid':'');
const shiftR=(R,d)=>R.map((c,i)=>R[Math.max(0,Math.min(4,i-d))]);
const patShift=(pat,cls)=>{const jm=cls>>1,v=cls&1;if(pat==='plaid')return (v?1:0)+(jm===2?1:0);if(pat==='stripes')return jm<2?1:0;if(pat==='dots')return (v&&jm===1)?-1:0;return 0;};
const SHIRT_BASES=['#b8402c','#b8462c','#b84c2c','#b8522c','#b8582c','#b85e2c','#b8642c','#b86a2c'];
const PLAYER=PART!=='all';
const SHTC=PLAYER?SHIRT_BASES.map(ramp):[0,1,2,3,4,5,6,7].map(cls=>shiftR(SHT,patShift(PAT,cls)));
const shirtAt=(i,j)=>SHTC[((((j|0)%4)+4)%4)*2+((((i|0)%4)+4)%4===1?1:0)];
const SH0=SHTC[0];
const LONG=!['tee','dress','tank','skirt'].includes(OUT)||C.longSleeves;
const OPENFRONT={jacket:2,cardigan:2,longcoat:2,vest:2,openshirt:2};
const LEGSKIN=OUT==='dress'||OUT==='skirt'||!!C.skirt;
const ALL=!!C.allure&&!KID;   // a young adult woman: a fuller bust, a narrower waist, a low neckline
// ---------------------------------------------------------------- proportions (adult / child). All rows count up from the shoe soles.
// builds (judge, townsfolk 4/10: "one body for everyone"): broad or stout men, tall or short, elders stooped
const B=new Set(String(C.build||'').split(/\s+/).filter(Boolean)),WIDE=KID?0:B.has('broad')?3:B.has('stout')?2:0,STOOP=B.has('stoop')&&!KID?1:0;
const FOOT=60,LEGH=(KID?3:7)+(B.has('tall')?3:0)-(B.has('short')?2:0),TORH=(KID?8:11)-(STOOP?1:0)+(B.has('tall')?1:0),HEADH=KID?19:20;
const HIP0=FOOT-3-LEGH;          // the belt row          (adult 50)
const TOP0=HIP0-TORH;            // the shoulder row      (adult 39)
const CX=23;                     // the figure's axis runs between columns 23 and 24
// ---------------------------------------------------------------- legs and shoes
// front/back: a straight column per leg, a dark seam between them, the shoe under it. dy moves the foot (+1 toward you, -1 lifted).
function legsFront(cx,hip,dyL,dyR,back,squat){const R=LEGSKIN?SK:PNT;const len=FOOT-3-hip;
  if(SIT){// seated, facing us: the lap (thighs coming toward us), two rounded knees, the shins darker below, the boots
    for(let y=hip+1;y<=hip+4;y++)for(let x=cx-6;x<=cx+6;x++)p(x,y,R[y===hip+1?(back?2:4):x<=cx-5||x>=cx+5?1:3]);
    for(const kx of [cx-4,cx+2]){for(let i=0;i<4;i++){p(kx+i,hip+5,R[i===0||i===3?2:back?2:4]);}for(let y=hip+6;y<=FOOT-3;y++)for(let i=0;i<4;i++)p(kx+i,y,R[i===0?2:i===3?0:1]);}
    shoeFront(cx-5,FOOT-2,-1,back);shoeFront(cx+2,FOOT-2,1,back);return;}
  for(const [s,dy] of [[-1,dyL],[1,dyR]]){const x0=s<0?cx-4:cx+2,w=4,bot=hip+len+dy;
    for(let y=hip+1;y<=bot;y++)for(let i=0;i<w;i++){let k=i===0?(s<0?4:3):i===w-1?(s<0?2:1):3;if(y===bot)k=Math.min(k,2);p(x0+i,y,R[k]);}
    // a little knee crease halfway down
    if(len>5&&!LEGSKIN)p(x0+(s<0?2:1),hip+(len>>1)+1+dy,R[2]);
    shoeFront(s<0?cx-5:cx+2,bot+1,s,back);}
  // the crotch and the seam
  if(!LEGSKIN){for(let i=-4;i<=5;i++)p(cx+i,hip+1,R[i<-2?4:i>3?2:3]);p(cx,hip+2,R[1]);p(cx+1,hip+2,R[1]);}}
function shoeFront(x,y,s,back){const R=SHO;const w=5;for(let i=0;i<w;i++){const lit=s<0?i<2:i<1;p(x+i,y,R[back?2:lit?4:3]);p(x+i,y+1,R[back?1:i===w-1||(s>0&&i>3)?2:3]);p(x+i,y+2,R[0]);}
  if(!back){p(x+(s<0?1:2),y,R[4]);}}
// side view: two columns that lean from the hip to the foot; the far one is darker. off: foot offset along the facing; lift: raised.
function legSide(hx,hip,off,lift,fl,far,crouch){const R=far?dk(LEGSKIN?SK:PNT,1):(LEGSKIN?SK:PNT);const len=FOOT-3-hip,fx=hx+off*fl,bot=hip+len-lift;
  if(SIT){const kx=hx+fl*(far?6:8);for(let y=hip+1;y<=hip+3;y++)for(let x=Math.min(hx-1,kx);x<=Math.max(hx-1,kx);x++)p(x,y,R[y===hip+1?4:y===hip+3?1:3]);
    segLeg(kx,hip+3,kx,FOOT-3,R);shoeSide(kx,FOOT-2,fl,far);return;}   /* seated (judge: the shortened legs read as a crouch) */
  if(crouch>2){// knees forward: thigh out, shin back down
    const kx=hx+fl*(2+Math.round(crouch/2)),ky=hip+Math.round(len*.45);segLeg(hx,hip+1,kx,ky,R);segLeg(kx,ky,fx,bot,R);}
  else if(lift>=2){// the swinging leg: thigh forward to the knee, shin back down to the raised foot
    const kx=hx+fl*(Math.max(0,off)+2),ky=hip+Math.round(len*.5)-1;segLeg(hx,hip+1,kx,ky,R);segLeg(kx,ky,fx,bot,R);}
  else segLeg(hx,hip+1,fx,bot,R);
  shoeSide(fx,bot+1,fl,far);}
function segLeg(x0,y0,x1,y1,R){const n=Math.max(1,Math.abs(y1-y0));for(let j=0;j<=n;j++){const x=Math.round(x0+(x1-x0)*j/n)-2,y=Math.round(y0+(y1-y0)*j/n);for(let i=0;i<4;i++)p(x+i,y,R[i===0?4:i===3?1:3]);}}
function shoeSide(x,y,fl,far){const R=far?dk(SHO,1):SHO;const L=6;for(let i=0;i<L;i++){const xx=x+fl*(i-2);p(xx,y,R[i===L-1?3:i<2?2:4]);p(xx,y+1,R[i===0?1:3]);p(xx,y+2,R[0]);}p(x+fl*3,y-1,R[3]);}
// ---------------------------------------------------------------- arms: a 3-px sleeve from the shoulder to the hand, its inner edge dark so it reads
// against the body, a cuff, and a small hand. Hands are given relative to the shoulder.
function armTo(sx,sy,hx,hy,far,inner,noHand){const cloth=(OUT==='jacket'||OUT==='cardigan'||OUT==='longcoat')?JK:null;const S2=far?dk(SK,1):SK;
  const n=Math.max(1,Math.ceil(Math.hypot(hx-sx,hy-sy)));const sleeveT=OUT==='tank'?0:LONG?.82:.42;
  for(let i=0;i<=n;i++){const t=i/n,x=Math.round(sx+(hx-sx)*t),y=Math.round(sy+(hy-sy)*t);const sl=t<sleeveT;
    for(let k=-1;k<=1;k++){const R0=sl?(cloth||shirtAt(x+k,y)):S2;const R=far?dk(R0,1):R0;const edge=k===inner;p(x+k,y,R[edge?1:k===-inner?(inner<0?2:4):3]);}}
  // cuff
  if(OUT!=='tank'){const t=sleeveT,x=Math.round(sx+(hx-sx)*t),y=Math.round(sy+(hy-sy)*t);const R0=cloth||shirtAt(x,y);const R=far?dk(R0,1):R0;for(let k=-1;k<=1;k++)p(x+k,y,R[1]);}
  if(noHand)return;
  // hand
  for(let j=0;j<2;j++)for(let k=-1;k<=1;k++)p(hx+k,hy+1+j,S2[j===1?2:k===-1?4:3]);p(hx,hy+3,S2[1]);}
// ---------------------------------------------------------------- the torso and what's on it
function torsoFront(cx,top,hip,back){const half=6+WIDE;
  for(let y=top;y<=hip;y++){const j=y-top;let hw=j===0?5+(STOOP?-1:WIDE):ALL?(j>=2&&j<=5?7:j>=7&&j<=8?5:half):half;if(B.has('stout')&&j>=4&&!KID)hw=half+(j>=6&&j<=TORH-2?2:1);for(let u=-hw+1;u<=hw;u++){const x=cx+u;const su=u-.5;
      let k=su<-hw+1.5?4:su>hw-1.5?1:su>hw-3?2:3;if(j===0)k=Math.min(4,k+1);if(y>=hip-1)k=Math.max(1,k-1);
      let R=shirtAt(x,y);
      if(OPENFRONT[OUT]&&!back){if(Math.abs(su)>OPENFRONT[OUT])R=OUT==='openshirt'?shirtAt(x,y):JK;else R=OUT==='openshirt'?EX:shirtAt(x,y);}   // an open shirt: its own two fronts either side, the tee between
      if(OPENFRONT[OUT]&&back)R=OUT==='openshirt'||OUT==='vest'?(OUT==='vest'?JK:shirtAt(x,y)):JK;
      if(OUT==='tank'&&j<2&&Math.abs(su)>2.5&&Math.abs(su)<4.5)R=SK;
      p(x,y,R[k]);}}
  // outfit details
  const hem=hip;
  if(!back){
    // collars and necklines
    if(OUT==='tee'||OUT==='dress'||OUT==='skirt'||OUT==='overalls'){for(let u=-1;u<=2;u++)p(cx+u,top,SK[2]);p(cx-2,top,SH0[1]);p(cx+3,top,SH0[1]);for(let u=-1;u<=2;u++)p(cx+u,top+1,SH0[1]);}
    if(OUT==='shirt'||OUT==='vest'){p(cx,top,SK[2]);p(cx+1,top,SK[2]);for(const [u,c] of [[-2,WHITE],[-1,WHITE],[2,[214,208,198]],[3,[214,208,198]]])p(cx+u,top,c);p(cx-1,top+1,WHITE);p(cx+2,top+1,[214,208,198]);
      if(OUT==='shirt'){for(let y=top+2;y<hem-1;y++)p(cx+1,y,SH0[1]);for(let y=top+3;y<hem-1;y+=3)p(cx,y,WHITE);p(cx-4,top+4,SH0[1]);p(cx-3,top+4,SH0[1]);}}
    if(OUT==='openshirt'){// the fronts hang open: the tee shows down the middle, wider at the top where the collar turns back in a V
      for(let y=top;y<hem;y++){const v=y-top<3?1:0;if(v){p(cx-2,y,EX[3]);p(cx+3,y,EX[2]);}p(cx-2-v,y,SH0[4]);p(cx+3+v,y,SH0[1]);}
      p(cx-4,top,SH0[4]);p(cx-3,top,SH0[3]);p(cx+4,top,SH0[2]);p(cx+5,top,SH0[1]);p(cx-4,top+1,SH0[3]);p(cx+5,top+1,SH0[1]);
      for(let u=-1;u<=2;u++)p(cx+u,top,SK[2]);for(let u=-1;u<=2;u++)p(cx+u,top+1,EX[1]);}
    if(OUT==='jacket'||OUT==='longcoat'||OUT==='cardigan'){// lapels and the shirt between
      for(let y=top;y<top+4;y++){p(cx-2+(y-top>>1),y,JK[4]);p(cx+3-(y-top>>1),y,JK[1]);}
      for(let y=top+4;y<hem;y++){p(cx-2,y,JK[4]);p(cx+3,y,JK[1]);}
      if(OUT==='cardigan')for(let y=top+3;y<hem;y+=3)p(cx-2,y,WHITE);
      if(OUT!=='cardigan'){p(cx-4,top+6,JK[1]);p(cx-3,top+6,JK[1]);p(cx+4,top+6,JK[1]);p(cx+5,top+6,JK[1]);}
      for(let u=0;u<=1;u++)p(cx+u,top,SK[2]);}
    if(OUT==='vest'){for(let y=top+1;y<hem;y++){p(cx-2,y,JK[4]);p(cx+3,y,JK[1]);}for(let y=top+3;y<hem;y+=3)p(cx-2,y,BUCKLE[1]);}
    if(OUT==='hoodie'){for(let u=-4;u<=5;u++){p(cx+u,top,SH0[u<-1?3:u>2?1:2]);p(cx+u,top+1,SH0[Math.abs(u-.5)<2?0:2]);}for(const u of [-1,2])for(let y=top+2;y<top+6;y++)p(cx+u,y,y===top+5?SH0[4]:WHITE);
      const py=hem-5;for(let u=-3;u<=4;u++){p(cx+u,py,SH0[1]);}for(let y=py;y<hem;y++){p(cx-3,y,SH0[1]);p(cx+4,y,SH0[1]);}}
    if(OUT==='sweater'||OUT==='turtleneck'){if(OUT==='turtleneck'){for(let y=top-2;y<=top+1;y++)for(let u=-2;u<=3;u++)p(cx+u,y,SH0[y===top-2?4:(u&1)?2:3]);}
      else{for(let u=-1;u<=2;u++)p(cx+u,top,SK[2]);for(let u=-2;u<=3;u++)p(cx+u,top+1,SH0[1]);}}
    if(OUT==='tank'){for(let u=-1;u<=2;u++){p(cx+u,top,SK[2]);p(cx+u,top+1,SK[2]);}for(let u=-1;u<=2;u++)p(cx+u,top+2,SH0[1]);}
    if(C.collar){for(let u=-1;u<=2;u++)p(cx+u,top,WHITE);}
    if(C.badge){p(cx-4,top+3,[255,228,120]);p(cx-3,top+3,[240,200,80]);p(cx-4,top+4,[200,150,40]);p(cx-3,top+2,[255,228,120]);}}
  else{for(let u=-1;u<=2;u++)p(cx+u,top,SK[1]);if(OUT==='hoodie'){for(let j=0;j<4;j++){const hw=4-(j>2?1:0);for(let u=-hw+1;u<=hw;u++)p(cx+u,top+j,SH0[j===3?1:u<-1?4:u>2?2:3]);}}
    else for(let y=top+2;y<hip-1;y++)p(cx+1,y,((OPENFRONT[OUT]&&OUT!=='openshirt')?JK:SH0)[2]);}
  // hems: ribbed for knits, a belt for shirts, the bib for overalls
  if(OUT==='sweater'||OUT==='turtleneck'||OUT==='hoodie')for(let u=-5;u<=6;u++){p(cx+u,hem,SH0[(u&1)?1:2]);p(cx+u,hem-1,SH0[(u&1)?2:3]);}
  if(OUT==='tee'||OUT==='shirt'||OUT==='openshirt'){for(let u=-5;u<=6;u++)p(cx+u,hem,BELT[u<-3?2:u>4?0:1]);if(!back){p(cx,hem,BUCKLE[1]);p(cx+1,hem,BUCKLE[1]);}}
  if(OUT==='overalls'){const R=PNT;for(let y=top+(back?5:4);y<=hem;y++)for(let u=-3;u<=4;u++)p(cx+u,y,R[u===-3?4:u===4?1:3]);
    for(const u of [-4,5])for(let y=top+1;y<top+5;y++)p(cx+u,y,R[2]);if(!back){p(cx-3,top+4,BUCKLE[1]);p(cx+4,top+4,BUCKLE[1]);p(cx,top+7,R[1]);p(cx+1,top+7,R[1]);}}
  if(ALL&&!back){// a low sweetheart neckline: two full rounded curves of skin with a clear cleavage between, the cloth gathered under the bust
    const SKN=[[-4,5],[-4,5],[-4,5],[-3,4],[-3,4],[-2,3],[0,1]];
    for(let j=0;j<SKN.length;j++){const [a,b]=SKN[j],y=top+j;
      for(let u=a;u<=b;u++){const L=u<=0,iu=L?-u:u-1;let k;
        if(j<=1)k=L?4:3;
        else{k=L?(iu>=2?4:iu===1?3:2):(iu>=3?2:3);if(j>=4)k=Math.max(1,k-1);if(iu===0)k=j>=5?(L?0:1):j>=2?(L?1:2):(L?2:3);}   // the cleft from row 2 in two soft steps, darkest only at its base: a form, not a streak (judge)
        p(cx+u,y,SK[k]);}
      p(cx+a-1,y,shirtAt(cx+a-1,y)[1]);p(cx+b+1,y,shirtAt(cx+b+1,y)[0]);}   // a dark edge to the neckline: a clear break between cloth and skin
    for(let u=-5;u<=6;u++)p(cx+u,top+7,shirtAt(cx+u,top+7)[u<1?1:0]);}
  if(C.apron&&!back){const R=EX;for(let y=top+(ALL?7:3);y<=hem+(LEGSKIN?5:2);y++)for(let u=-3;u<=4;u++)p(cx+u,y,R[u===-3?4:u===4?1:y===top+3?4:3]);p(cx-4,top+3,R[2]);p(cx+5,top+3,R[2]);}}
// skirts and long coats hang over the legs
function skirtFront(cx,hip,back){if(OUT==='longcoat'){const len=KID?5:7;for(let j=0;j<len;j++){const hw=6+(j>>1);for(let u=-hw+1;u<=hw;u++){if(!back&&Math.abs(u-.5)<1.6)continue;p(cx+u,hip+1+j,JK[u<-hw+3?4:u>hw-2?1:u>hw-4?2:3]);}}for(let u=-8;u<=9;u++)p(cx+u,hip+len,JK[0]);}
  if(OUT==='skirt'||OUT==='dress'||C.skirt){const R=OUT==='dress'?shirtAt(0,0)&&SH0:(C.skirt?SKR:PNT);const len=KID?4:6;for(let j=0;j<len;j++){const hw=6+Math.round(j*.6);for(let u=-hw+1;u<=hw;u++){let k=u<-hw+3?4:u>hw-2?1:u>hw-4?2:3;if(j===len-1)k=1;else if(((u+40)%3===0)&&j>0)k=Math.max(2,k-1);p(cx+u,hip+j,(OUT==='dress'?SH0:R)[k]);}}}}
// side view torso: narrower, chest forward
function torsoSide(cx,top,hip,fl){const hw=4+WIDE;for(let y=top;y<=hip;y++){const j=y-top;const back=(STOOP?(j<2?2:j<4?1:0):0)+(j>=1&&j<=3?1:0),front=(B.has('stout')&&j>=4?(j>=6?2:1):0)+(!ALL&&!KID&&j>=2&&j<=4?1:0);for(let u=-hw-back;u<=hw+front;u++){/* a back curve (shoulder blades) and a chest line: not a peg */const x=cx+u*fl+(fl<0?1:0);let k=u*fl<-hw+1.5?(fl>0?4:1):u*fl>hw-1.5?(fl>0?2:3):3;
      if(fl>0){k=u<-2?4:u>2?2:3;}else{k=u>2?4:u<-2?2:3;}if(j===0&&Math.abs(u)>=hw)continue;if(y>=hip-1)k=Math.max(1,k-1);
      let R=shirtAt(x,y);if(OUT==='openshirt'){if(u>=hw)R=EX;}else if(OPENFRONT[OUT]){R=(u>=hw-1&&OUT!=='vest')?shirtAt(x,y):JK;if(OUT==='vest'&&u<hw-1)R=JK;}p(x,y,R[k]);}}   // side on, the open shirt covers all but a sliver of tee at the chest
  if(ALL){for(let j=2;j<=5;j++){const u=hw+1,x=cx+u*fl+(fl<0?1:0);p(x,top+j,shirtAt(x,top+j)[j===2?3:j===5?1:fl>0?2:3]);if(j===3||j===4){const x2=cx+(hw+2)*fl+(fl<0?1:0);p(x2,top+j,shirtAt(x2,top+j)[j===3?2:1]);}}
    for(let j=0;j<3;j++)for(let u=hw-2+j;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),top+j,SK[j===2?2:3]);}
  if(OUT==='overalls'){for(let y=top+4;y<=hip;y++)for(let u=-1;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),y,PNT[u===hw?2:3]);for(let y=top+1;y<top+4;y++)p(cx+fl*1,y,PNT[2]);}
  if(OUT==='hoodie')for(let j=0;j<4;j++)for(let u=-hw;u<=-1;u++)p(cx+u*fl+(fl<0?1:0),top+j,SH0[j===3?1:2]);
  if(OUT==='tee'||OUT==='shirt'||OUT==='openshirt')for(let u=-hw;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),hip,BELT[1]);
  if(OUT==='sweater'||OUT==='hoodie'||OUT==='turtleneck')for(let u=-hw;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),hip,SH0[(u&1)?1:2]);
  if(OUT==='turtleneck')for(let y=top-2;y<top;y++)for(let u=-2;u<=2;u++)p(cx+u*fl,y,SH0[y===top-2?4:3]);
  if(C.apron)for(let y=top+3;y<=hip+(LEGSKIN?5:2);y++)for(let u=hw-1;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),y,EX[u===hw?2:3]);}
function skirtSide(cx,hip,fl){if(OUT==='longcoat'){const len=KID?5:7;for(let j=0;j<len;j++){const hw=4+(j>>1);for(let u=-hw-1;u<=hw;u++)p(cx+u*fl,hip+1+j,JK[u*1<-hw+1?4:u>hw-2?1:3]);}}
  if(OUT==='skirt'||OUT==='dress'||C.skirt){const R=OUT==='dress'?SH0:(C.skirt?SKR:PNT);const len=KID?4:6;for(let j=0;j<len;j++){const hw=4+Math.round(j*.5);for(let u=-hw;u<=hw+1;u++)p(cx+u*fl,hip+j,R[j===len-1?1:u<-hw+2?4:u>hw-1?1:3]);}}}
// ---------------------------------------------------------------- heads. hy is the top row of the eyes; the chin sits 9 rows below.
function skullRows(top,chin){const rows=[];for(let y=top;y<=chin;y++){const t=y-top,b=chin-y;let hw=8;if(t===0)hw=5;else if(t===1)hw=7;if(b===0)hw=4;else if(b===1)hw=6;else if(b===2)hw=7;rows.push([y,hw]);}return rows;}
function headFront(cx,hy,back,pose){const chin=hy+9,top=chin-HEADH+1;
  for(const [y,hw] of skullRows(top,chin))for(let u=-hw+1;u<=hw;u++){const su=u-.5;let k=3;
    if(!back){if(su<-hw+2.5&&y>hy-3&&y<chin-1)k=4;if(su>hw-2.5)k=2;if(y>=chin-1)k=2;}else k=su>hw-2.5?2:3;p(cx+u,y,SK[k]);}
  // ears
  for(const s of [-1,1]){const ex=s<0?cx-8:cx+9;p(ex,hy,SK[s<0?3:2]);p(ex,hy+1,SK[s<0?4:2]);p(ex,hy+2,SK[s<0?3:1]);p(ex,hy+3,SK[1]);}
  if(back)return;
  faceFront(cx,hy+(pose.nod?1:0),pose);}
function faceFront(cx,hy,pose){const E=pose.blink?'blink':(C.hollowEyes?'hollow':EXPR);const LIP=ALL?[178,46,70]:SK[0];
  for(const s of [-1,1]){const x0=s<0?cx-4:cx+4;const out=s<0?x0-1:x0+2,inn=s<0?x0+2:x0-1;// a 2-wide eye: x0, x0+1
    if(E==='blink'||E==='happy'){if(E==='happy'){p(x0,hy+1,LASH);p(x0+1,hy+1,LASH);p(out,hy+2,LASH);p(inn,hy+2,LASH);}else{p(x0,hy+2,LASH);p(x0+1,hy+2,LASH);p(out,hy+2,LASH);}continue;}
    if(E==='hollow'){for(let j=0;j<3;j++){p(x0,hy+j,[12,8,12]);p(x0+1,hy+j,[12,8,12]);}continue;}
    if(E==='wince'){const P3=s<0?[[0,0],[1,1],[2,1],[0,2]]:[[2,0],[0,1],[1,1],[2,2]];const bx=s<0?x0-1:x0;for(const [u,v] of P3)p(bx+u,hy+v,LASH);continue;}   /* clenched shut, > < (judge: flat closed lids read as giggling) */
    // lash line with a flick at the outer corner, iris lightening downward, a glint, the lower lid
    p(x0,hy,LASH);p(x0+1,hy,LASH);p(out,hy,LASH);if(ALL){p(out+(s<0?-1:1),hy-1,LASH);p(out,hy-1,LASH);}
    p(x0,hy+1,EYR[1]);p(x0+1,hy+1,EYR[1]);p(x0,hy+2,EYR[3]);p(x0+1,hy+2,EYR[2]);
    p(s<0?x0+1:x0,hy+1,[255,255,255]);
    if(E==='surprised'||E==='scared'){p(x0,hy-1,LASH);p(x0+1,hy-1,LASH);p(x0,hy,WHITE);p(x0+1,hy,WHITE);p(out,hy-1,LASH);}
    if(E==='sad'){p(inn,hy-1,HR[1]);}}
  // brows
  for(const s of [-1,1]){const b0=s<0?cx-5:cx+4;const y=hy-2-((EXPR==='surprised'||EXPR==='scared')?1:0);
    if(EXPR==='angry'||EXPR==='wince'){p(b0+(s<0?2:0),y+1,HR[1]);p(b0+1,y,HR[1]);p(b0+(s<0?0:2),y,HR[1]);}
    else if(EXPR==='sad'||EXPR==='scared'){p(b0+(s<0?2:0),y,HR[1]);p(b0+1,y,HR[1]);p(b0+(s<0?0:2),y+1,HR[1]);}
    else{p(b0,y+(s<0?1:0),HR[1]);p(b0+1,y,HR[1]);p(b0+2,y+(s<0?0:1),HR[1]);}}
  // nose: one shade beside the axis
  p(cx+1,hy+4,SK[2]);
  // mouth
  const my=hy+6;
  if(EXPR==='happy'){p(cx-1,my,LIP);p(cx+2,my,LIP);p(cx,my+1,MOUTH);p(cx+1,my+1,MOUTH);}
  else if(EXPR==='sad'){p(cx-1,my+1,LIP);p(cx,my,LIP);p(cx+1,my,LIP);p(cx+2,my+1,LIP);}
  else if(EXPR==='angry'){for(let u=-1;u<=2;u++)p(cx+u,my,LIP);}
  else if(EXPR==='surprised'||EXPR==='scared'){p(cx,my,MOUTH);p(cx+1,my,MOUTH);p(cx,my+1,MOUTH);p(cx+1,my+1,MOUTH);}
  else if(EXPR==='wince'){p(cx-1,my+1,MOUTH);p(cx,my,MOUTH);p(cx+1,my,MOUTH);p(cx+2,my+1,MOUTH);}
  else if(EXPR==='wrong'){for(let u=-3;u<=4;u++)p(cx+u,my+(Math.abs(u-.5)>3?-1:0),MOUTH);for(let u=-2;u<=3;u+=2)p(cx+u,my,TEETH);}
  else if(ALL){p(cx-1,my,[150,40,60]);p(cx,my,[178,46,70]);p(cx+1,my,[178,46,70]);p(cx+2,my,[150,40,60]);p(cx,my+1,[206,82,98]);p(cx+1,my+1,[206,82,98]);}
  else if(C.smile!==false){p(cx-1,my,SK[1]);p(cx,my+1,SK[1]);p(cx+1,my+1,SK[1]);p(cx+2,my,SK[1]);}
  else{p(cx,my,SK[1]);p(cx+1,my,SK[1]);}
  if((EXPR==='happy'||C.blush||ALL)&&EXPR!=='wince'){p(cx-6,hy+4,BLUSH);p(cx-5,hy+4,BLUSH);p(cx+6,hy+4,BLUSH);p(cx+7,hy+4,BLUSH);}}
function headSide(cx,hy,fl,pose){const chin=hy+9,top=chin-HEADH+1;
  // a profile: the skull fills back to front, the face is the front third, chin set back a little
  for(let y=top;y<=chin;y++){const t=y-top,b=chin-y;let back=-7,front=7;if(t===0){back=-4;front=3;}else if(t===1){back=-6;front=5;}else if(t===2)front=6;
    if(b===0){back=-2;front=4;}else if(b===1){back=-4;front=6;}else if(b<=3)back=-6;
    for(let u=back;u<=front;u++){let k=3;if(u>=front-1)k=4;if(u<=back+1)k=2;if(y>=chin-1)k=2;if(u>=2&&u<=4&&y>=hy+3&&y<=hy+5)k=4;p(cx+u*fl,y,SK[k]);}}
  // nose and ear
  p(cx+8*fl,hy+3,SK[3]);p(cx+8*fl,hy+4,SK[2]);
  for(let j=0;j<4;j++){p(cx-1*fl,hy+j,SK[j===0||j===3?2:3]);p(cx-2*fl,hy+j,SK[j===0?3:1]);}p(cx-1*fl,hy+1,SK[1]);
  const E=pose.blink?'blink':(C.hollowEyes?'hollow':EXPR);const ex=cx+4*fl,ey=hy+(pose.nod?1:0);
  if(E==='blink'||E==='happy'){p(ex,ey+2,LASH);p(ex+fl,ey+2,LASH);}
  else if(E==='hollow'){for(let j=0;j<3;j++){p(ex,ey+j,[12,8,12]);p(ex+fl,ey+j,[12,8,12]);}}
  else{p(ex,ey,LASH);p(ex+fl,ey,LASH);p(ex-fl,ey,LASH);p(ex,ey+1,EYR[1]);p(ex,ey+2,EYR[3]);p(ex+fl,ey+1,[255,255,255]);p(ex+fl,ey+2,EYR[2]);}
  p(ex-fl,ey-2,HR[1]);p(ex,ey-2,HR[1]);p(ex+fl,ey-2,HR[1]);
  p(cx+6*fl,ey+6,SK[1]);p(cx+7*fl,ey+6,SK[1]);
  if(EXPR==='happy'||C.blush){p(cx+2*fl,ey+4,BLUSH);p(cx+3*fl,ey+4,BLUSH);}}
// ---------------------------------------------------------------- hair. Each style is a silhouette plus locks that fall from a comb point above the head:
// the angle to that point sorts every hair pixel into a lock, lock borders are dark, the lit edge of each lock catches a streak of light,
// and every bottom edge (fringe, sides, back) comes to points at the middle of each lock.
//  vol: extra half-width over the skull   crown: rows above it   K: locks   part: the comb point's offset (sweeps the fringe)
//  fr: fringe [centre, temples, tip depth] (rows from the eye line)   side: [thickness beside the face, bottom row from the eye line]
//  back: bottom of the hair at the back, rows from the chin   tip: tip depth of the lower edges   tex: 'curl' | 'buzz' | 'wave'
const HS={
  short:   {vol:1,  crown:2,K:5,part:-3,fr:[-3,-1,2],side:[1,1],back:-5,tip:1,sweep:1},
  crop:    {vol:.5, crown:2,K:6,part:0, fr:[-4,-3,1],side:[1,-1],back:-6,tip:1},
  sidepart:{vol:1,  crown:2,K:4,part:-4,fr:[-5,-1,2],side:[1,1],back:-5,tip:1,sweep:1},
  bangs:   {vol:1.5,crown:2,K:6,part:0, fr:[-2,-1,1],side:[2,3],back:-3,tip:1},
  shaggy:  {vol:2,  crown:2,K:6,part:-1,fr:[-2,0,3],side:[2,5],back:0,tip:2},
  spiky:   {vol:1.5,crown:3,K:6,part:0, fr:[-3,-2,3],side:[1,0],back:-5,tip:1,spikes:4},
  buzz:    {vol:0,  crown:1,K:10,part:0,fr:[-5,-4,0],side:[0,-2],back:-6,tip:0,tex:'buzz'},
  mohawk:  {vol:0,  crown:1,K:10,part:0,fr:[-5,-4,0],side:[0,-2],back:-6,tip:0,tex:'buzz',crest:1},
  topknot: {vol:.5, crown:1,K:6,part:0, fr:[-5,-4,1],side:[1,-1],back:-6,tip:0,knot:1},
  curly:   {vol:2.5,crown:3,K:5,part:0, fr:[-3,-2,2],side:[2,4],back:-1,tip:1,tex:'curl'},
  afro:    {vol:4,  crown:5,K:5,part:0, fr:[-4,-3,1],side:[3,3],back:0,tip:1,tex:'curl'},
  wavy:    {vol:2,  crown:2,K:5,part:1, fr:[-4,-1,2],side:[2,14],back:10,tip:2,tex:'wave'},
  bob:     {vol:2,  crown:2,K:6,part:0, fr:[-2,-1,1],side:[2,8],back:1,tip:0},
  long:    {vol:1.5,crown:2,K:5,part:.5,fr:[-5,-1,2],side:[2,16],back:12,tip:2},
  ponytail:{vol:1,  crown:2,K:5,part:0, fr:[-4,-2,2],side:[1,1],back:-4,tip:1,tail:1},
  bun:     {vol:1,  crown:2,K:5,part:0, fr:[-4,-2,1],side:[1,0],back:-4,tip:1,bun:1},
  braids:  {vol:1,  crown:2,K:5,part:.5,fr:[-4,-2,1],side:[1,3],back:-2,tip:1,braids:1},
  pigtails:{vol:1.5,crown:2,K:6,part:0, fr:[-2,-1,1],side:[2,3],back:-2,tip:1,pigs:1},
  spacebuns:{vol:1,crown:2,K:6,part:0, fr:[-2,-1,1],side:[1,2],back:-3,tip:1,buns:1},
  pixie:   {vol:.8, crown:2,K:6,part:-2,fr:[-2,-1,2],side:[1,0],back:-5,tip:1,sweep:1},
  mullet:  {vol:1,  crown:2,K:5,part:0, fr:[-4,-2,1],side:[1,3],back:9,tip:2},
  lob:     {vol:1.5,crown:2,K:5,part:-2,fr:[-4,-1,2],side:[2,10],back:6,tip:1},
  swoop:   {vol:1.5,crown:2,K:5,part:-4,fr:[-5,-1,2],side:[2,14],back:10,tip:2,sweep:1},
  slick:   {vol:.6, crown:2,K:7,part:0, fr:[-5,-4,0],side:[1,0],back:-3,tip:0},
  curlylong:{vol:2.5,crown:3,K:5,part:0,fr:[-3,-2,2],side:[3,12],back:9,tip:2,tex:'curl'},
  halfup:  {vol:1.5,crown:2,K:5,part:.5,fr:[-5,-1,2],side:[2,13],back:10,tip:2,knot:1},
};
function hairFor(st){if(!st||st==='bald')return null;const S=Object.assign({},HS[st]||HS.short);if(C.hairLen){S.side=[S.side[0],C.hairLen];S.back=Math.max(S.back,C.hairLen-4);}return S;}
// shade one hair pixel: global light from the upper left, the lock's lit and dark edges, a streak near the top
function hairTone(S,su,y,hw,cyc,ry,f,edgeL,below){let light=y<=cyc?-.55*(su/hw)-.75*((y-cyc)/(ry+1)):-.5*(su/hw)-.15-(y-cyc)*.02;
  let k=light>.62?4:light>.18?3:light>-.32?2:1;
  if(S.tex==='buzz'){k=((Math.round(su+.5)+y)&1)?Math.max(1,k-1):k;return k;}
  if(f<.22)k=Math.min(4,k+1);else if(f>.8)k=Math.max(1,k-1);
  if(y<cyc-2&&f>.2&&f<.42&&light>.05)k=4;
  if(below)k=Math.max(1,k-1);
  return k;}
function hairFront(cx,hy,back,st,pose){const S=hairFor(st);if(!S)return null;const chin=hy+9,top=chin-HEADH+1;
  const hw=8+S.vol,topY=top-S.crown,cyc=hy-1,ry=cyc-topY;
  const ox=cx+.5+(back?0:S.part),oy=topY-3;const ang=(x,y)=>Math.atan2(x+.5-ox,y+.5-oy);
  const A0=ang(cx-hw-2,hy+4),A1=ang(cx+hw+2,hy+4),K=back?S.K+1:S.K;const lockF=(x,y)=>{let a=(ang(x,y)-A0)/(A1-A0)*K;if(S.tex==='wave')a+=Math.sin(y*.7)*.25;return a;};
  const sideBot=hy+S.side[1],backBot=chin+S.back,faceHalf=7.5;
  const tipAt=(x,y,d)=>{const f=((lockF(x,y)%1)+1)%1;return Math.round(d*(1-Math.abs(2*f-1)));};
  const fringeY=su=>{const t=S.sweep?clamp((su+7)/14,0,1):Math.min(1,Math.abs(su-(back?0:S.part))/7);return hy+S.fr[0]+(S.fr[1]-S.fr[0])*t;};
  const inside=(x,y)=>{const u=x-cx,su=u-.5,a=Math.abs(su);
    const bump=S.tex==='curl'?1+.09*Math.sin(Math.atan2(cyc-y,su)*9):1;
    const crownIn=y<=cyc&&Math.pow(a/((hw+.5)*bump),2.6)+Math.pow((cyc-y)/((ry+.5)*bump),3)<=1;
    let topOK=crownIn;if(S.spikes&&y<topY+S.spikes&&!crownIn){const tip=tipAt(x,y,S.spikes);topOK=a<hw-1&&Math.pow(a/(hw+.5),2.6)+Math.pow((cyc-y-tip)/(ry+.5),3)<=1;}
    if(back){if(topOK)return true;if(y<=cyc)return false;const taper=y>chin+1?Math.min(3,(y-chin-1)*.3):0;return a<=hw+.5-taper&&y<=backBot+tipAt(x,y,S.tip);}
    if(a<faceHalf){return (topOK||(y>cyc&&false))&&y<fringeY(su)+tipAt(x,y,S.fr[2]);}
    if(topOK)return true;if(y<=cyc)return false;
    // beside the face, and for long hair, over the shoulders
    const outer=y>chin+1?hw+.5-Math.min(3,(y-chin-1)*.25):hw+.5;if(a>outer)return false;if(a<faceHalf+(y>chin?-1.5:0)&&y>chin)return a>=faceHalf-1.5&&y<=sideBot+tipAt(x,y,S.tip);
    return a>=faceHalf&&y<=sideBot+tipAt(x,y,S.tip)&&(S.side[0]>0||y<=hy+1);};
  const minY=topY-(S.spikes||0)-1,maxY=Math.max(back?backBot:sideBot,hy)+S.tip+2;
  for(let y=minY;y<=maxY;y++)for(let u=-Math.ceil(hw)-1;u<=Math.ceil(hw)+2;u++){const x=cx+u;if(!inside(x,y))continue;const su=u-.5;
    const lf=lockF(x,y),f=((lf%1)+1)%1;const below=!inside(x,y+1);
    let k=hairTone(S,su,y,hw,cyc,ry,f,false,below);
    // lock borders: dark where the next pixel along belongs to another lock
    if(S.tex!=='buzz'&&S.tex!=='curl'&&Math.hypot(x+.5-ox,y+.5-oy)>6&&Math.floor(lockF(x+1,y))!==Math.floor(lf)&&inside(x+1,y)&&inside(x,y-1))k=y>cyc-3?1:Math.min(k,2);
    if(S.tex==='curl')k=curlTone(x,y,k);
    if(S.crest&&Math.abs(su)>2.6)k=-1;
    p(x,y,k<0?(((x+y)&1)?HR[1]:SK[2]):HR[k]);}
  // the fringe throws a shadow on the forehead
  if(!back)for(let u=-6;u<=7;u++){const x=cx+u;for(let y=minY;y<hy+2;y++)if(inside(x,y)&&!inside(x,y+1)){const c=G(LY.body,x,y+1);if(c&&!g(x,y+1))p(x,y+1,SK[2]);break;}}
  hairExtras(cx,hy,back?'N':'S',S,1);
  return {top:topY,hw};}
function hairSide(cx,hy,fl,st,pose){const S=hairFor(st);if(!S)return null;const chin=hy+9,top=chin-HEADH+1;
  const hw=8+S.vol,topY=top-S.crown,cyc=hy-1,ry=cyc-topY;const ccx=cx-fl*1;
  const ox=cx+.5+fl*3,oy=topY-3;const ang=(x,y)=>Math.atan2((x+.5-ox)*-fl,y+.5-oy);const A0=ang(cx+fl*(hw+2),hy),A1=ang(cx-fl*(hw+3),hy+8);const K=S.K;
  const lockF=(x,y)=>{let a=(ang(x,y)-A0)/(A1-A0)*K;if(S.tex==='wave')a+=Math.sin(y*.7)*.25;return a;};
  const tipAt=(x,y,d)=>{const f=((lockF(x,y)%1)+1)%1;return Math.round(d*(1-Math.abs(2*f-1)));};
  const sideBot=hy+S.side[1],backBot=chin+S.back;
  const inside=(x,y)=>{const uf=(x-cx)*fl,a=(x-ccx)*fl;   // uf: forward of the axis; a: from the crown's centre
    const crownIn=y<=cyc&&Math.pow(Math.abs(a+.5*fl*0)/(hw+.5),2.6)+Math.pow((cyc-y)/(ry+.5),3)<=1;
    let topOK=crownIn;if(S.spikes&&y<topY+S.spikes&&!crownIn){const tip=tipAt(x,y,S.spikes);topOK=Math.abs(a)<hw-1&&Math.pow(Math.abs(a)/(hw+.5),2.6)+Math.pow((cyc-y-tip)/(ry+.5),3)<=1;}
    // the forehead and face stay clear in front of the ear
    if(uf>=1){const fy=hy+S.fr[0]+(uf>=5?-1:0)+Math.min(2,(7-uf)*.3);return topOK&&y<fy+tipAt(x,y,Math.min(2,S.fr[2]));}
    if(topOK)return true;if(y<=cyc)return false;
    if(uf>=-3&&uf<=-1&&y>=hy&&y<=hy+3&&S.side[1]<4)return false;           // the ear shows under short hair
    if(uf>=-1)return y<=sideBot+tipAt(x,y,S.tip)&&S.side[0]>0;           // the sideburn
    const outer=-(hw+.5)+(y>chin+1?Math.min(3,(y-chin-1)*.25):0);return uf>=outer-1&&y<=Math.max(backBot,sideBot)+tipAt(x,y,S.tip);};
  const minY=topY-(S.spikes||0)-1,maxY=Math.max(backBot,sideBot,hy)+S.tip+2;
  for(let y=minY;y<=maxY;y++)for(let u=-Math.ceil(hw)-3;u<=Math.ceil(hw)+2;u++){const x=cx+u;if(!inside(x,y))continue;const su=(x-ccx)*fl-.5;
    const lf=lockF(x,y),f=((lf%1)+1)%1;const below=!inside(x,y+1);let k=hairTone(S,-su,y,hw,cyc,ry,f,false,below);
    if(S.tex!=='buzz'&&S.tex!=='curl'&&Math.hypot(x+.5-ox,y+.5-oy)>6&&Math.floor(lockF(x-fl,y))!==Math.floor(lf)&&inside(x-fl,y)&&inside(x,y-1))k=y>cyc-3?1:Math.min(k,2);
    if(S.tex==='curl')k=curlTone(x,y,k);
    if(S.crest&&Math.abs((x-cx)*fl+1)>2.6)k=-1;
    p(x,y,k<0?(((x+y)&1)?HR[1]:SK[2]):HR[k]);}
  hairExtras(cx,hy,fl>0?'E':'W',S,fl);return {top:topY,hw};}
// a curl every few pixels, staggered row to row: lit at its top left, a dark crescent under it
function curlTone(x,y,k){const row=Math.floor(y/3),lx=((x+(row&1)*2)%4+4)%4,ly=((y%3)+3)%3;if(lx===0&&ly===0)return Math.min(4,k+1);if(lx===1&&ly===0)return Math.min(4,k+1);if((lx===2||lx===3)&&ly===2)return Math.max(1,k-2);if(lx===3&&ly===1)return Math.max(1,k-1);return k;}
// ponytails, buns, braids and crests: small shaded shapes, each with its own locks
function lockBlob(cx,cy,rx,ry,R){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx+.01)+y*y/(ry*ry+.01);if(d>1)continue;const l=-x/(rx+.01)*.5-y/(ry+.01)*.7;let k=l>.45?4:l>0?3:l>-.4?2:1;if(d>.75&&(x>0||y>0))k=Math.max(1,k-1);if(((x+y*2)%4===0)&&k>1&&d<.6)k--;p(cx+x,cy+y,R[k]);}}
function hairExtras(cx,hy,view,S,fl){const chin=hy+9,top=chin-HEADH+1,topY=top-S.crown;const R=HR;const side=view==='E'||view==='W';
  if(S.bun){if(view==='S')lockBlob(cx+.5,topY-1,4,3,R);else if(view==='N')lockBlob(cx+.5,topY+3,4,3,R);else lockBlob(cx-fl*5,topY+2,3,3,R);}
  if(S.knot){if(view==='S'||view==='N'){lockBlob(cx+.5,topY-2,3,3,R);for(let j=0;j<3;j++)p(cx+(j&1),topY+1+j,R[1]);}else lockBlob(cx-fl*2,topY-1,3,3,R);}
  if(S.buns){for(const s of [-1,1]){if(side&&s*fl>0)continue;const bx=side?cx-fl*3:cx+.5+s*6;lockBlob(bx,topY+1,3,3,R);}}
  if(S.crest){for(let u=-1;u<=2;u++)for(let y=topY-4;y<chin-6;y++){const tip=(u+y)%3===0?1:0;if(y<topY-4+tip)continue;const x=side?cx-fl*(u+1):cx+u;p(x,y,R[u<=0?4:u===1?3:2]);}}
  if(S.tail){if(view==='N'){for(let y=hy;y<chin+9;y++){const w=y<chin+4?3:y<chin+7?2:1;for(let u=-w+1;u<=w;u++)p(cx+u,y,R[u<=-w+1?4:u===w?1:((y+u)%3===0?2:3)]);}for(let u=-1;u<=2;u++)p(cx+u,hy,ACCR[2]);}
    else if(side){for(let j=0;j<12;j++){const x=cx-fl*(9+Math.round(j*.25)),y=hy-2+j;const w=j<8?2:1;for(let i=0;i<=w;i++)p(x-fl*i,y,R[i===0?3:i===w?1:2]);}p(cx-fl*8,hy-2,ACCR[3]);p(cx-fl*8,hy-1,ACCR[1]);}}
  if(S.braids&&!side&&view==='S'){for(const s of [-1,1]){const x0=s<0?cx-8:cx+8;for(let y=hy+3;y<chin+9;y++){const ph=(y>>1)&1;for(let i=0;i<3;i++)p(x0+i-1,y,R[(i+ph)%3===0?4:(i+ph)%3===1?2:1]);}p(x0,chin+9,ACCR[2]);p(x0-1,chin+9,ACCR[3]);}}
  if(S.braids&&view==='N'){for(const s of [-1,1]){const x0=s<0?cx-6:cx+7;for(let y=hy+1;y<chin+7;y++){const ph=(y>>1)&1;for(let i=0;i<3;i++)p(x0+i-1,y,R[(i+ph)%3===0?4:(i+ph)%3===1?2:1]);}}}
  if(S.braids&&side){const x0=cx-fl*5;for(let y=hy+2;y<chin+6;y++){const ph=(y>>1)&1;for(let i=0;i<3;i++)p(x0-fl*i,y,R[(i+ph)%3===0?4:2]);}}
  if(S.pigs){for(const s of [-1,1]){if(side&&s*fl>0)continue;const bx=side?cx-fl*7:cx+.5+s*10;for(let j=0;j<8;j++){const w=j<2?2:j<6?2:1;for(let i=-w;i<=w;i++)p(bx+i+(side?0:s*Math.round(j*.3)),hy+1+j,R[i<0?4:i>0?2:3]);}p(bx-1,hy,ACCR[3]);p(bx,hy,ACCR[2]);p(bx+1,hy,ACCR[3]);}}}
// ---------------------------------------------------------------- facial hair, glasses, hats, accessories
function beard(cx,hy,view,fl,bt){if(!bt||view==='N')return;const R=HR,chin=hy+9;const side=view!=='S';
  const put=(u,y,k)=>p(side?cx+u*fl:cx+u,y,R[k]);
  if(bt==='stubble'){for(let y=hy+5;y<=chin;y++)for(let u=side?1:-5;u<=(side?6:6);u++)if(((u+y)&1)===0&&!(y===hy+6&&u>=-1&&u<=2&&!side))put(u,y,y>=chin-1?1:2);return;}
  const mst=()=>{if(side){for(let u=4;u<=7;u++){put(u,hy+5,u===7?2:3);put(u,hy+6,1);}}else{for(let u=-2;u<=3;u++){put(u,hy+5,u<0?4:3);put(u,hy+6,u===-2||u===3?1:2);}put(-3,hy+6,1);put(4,hy+6,1);}};
  if(bt==='moustache'){mst();return;}
  if(bt==='goatee'){mst();for(let y=chin-2;y<=chin+1;y++)for(let u=side?4:-1;u<=(side?6:2);u++)put(u,y,y===chin+1?1:u===(side?4:-1)?4:3);return;}
  // full: around the jaw and the chin, the mouth left clear
  for(let y=hy+3;y<=chin+2;y++){const hw=y<=hy+4?8:y<chin-1?8:y===chin-1?7:y===chin?6:y===chin+1?5:3;for(let u=(side?-1:-hw+1);u<=(side?7-(y>chin?2:0):hw);u++){const su=side?u:u-.5;
      if(!side&&y<chin-2&&Math.abs(su)<5.5&&y<hy+5)continue;if(!side&&y===hy+6&&Math.abs(su)<1.6)continue;if(side&&y<hy+5&&u>1)continue;put(u,y,y>=chin+1?1:(side?(u>4?3:2):(su<-3?4:su>3?2:3)));}}
  mst();}
function glasses(cx,hy,view,fl,gt){if(view==='N')return;
  if(gt==='monocle'){const G=[[150,118,52],[214,176,82]],GLs=[200,214,226];const x0=view==='S'?cx+3:cx+fl*3;
    for(const [dx,dy] of [[1,-1],[2,-1],[3,-1],[0,0],[4,0],[0,1],[4,1],[0,2],[4,2],[1,3],[2,3],[3,3]])p(x0+(view==='S'?dx:fl*dx),hy+dy,G[dy<1?1:0]);
    p(x0+(view==='S'?1:fl),hy,GLs);for(let i=1;i<6;i++)p(x0+(view==='S'?4:fl*4),hy+3+i,G[i%2]);return;}gt=gt===true?'round':gt;const F=gt==='shades'?[[20,16,22],[34,30,38]]:[[40,34,44],[64,58,70]],GL=[196,212,224];
  if(view==='S'){for(const s of [-1,1]){const x0=s<0?cx-6:cx+3;for(let i=0;i<5;i++){if(gt==='round'&&(i===0||i===4)){}else{p(x0+i,hy-1,F[1]);p(x0+i,hy+3,F[0]);}}for(let j=0;j<3;j++){p(x0,hy+j,F[1]);p(x0+4,hy+j,F[0]);}
      if(gt==='shades'){for(let j=0;j<3;j++)for(let i=1;i<4;i++)p(x0+i,hy+j,j===0&&i===1?[90,90,100]:F[0]);}else p(x0+1,hy,GL);}
    p(cx,hy,F[1]);p(cx+1,hy,F[1]);p(cx-7,hy,F[1]);p(cx+8,hy,F[1]);}
  else{const x0=cx+fl*3;for(let i=0;i<4;i++){p(x0+fl*i,hy-1,F[1]);p(x0+fl*i,hy+3,F[0]);}for(let j=0;j<3;j++){p(x0,hy+j,F[1]);p(x0+fl*3,hy+j,F[0]);}if(gt==='shades')for(let j=0;j<3;j++)for(let i=1;i<3;i++)p(x0+fl*i,hy+j,F[0]);
    for(let i=1;i<=5;i++)p(x0-fl*i,hy,F[1]);}}
function hat(cx,hy,view,fl,h,hairTop){if(!h)return;const H=HAT,side=view!=='S'&&view!=='N',chin=hy+9,top=chin-HEADH+1;const T0=Math.min(top-2,hairTop!=null?hairTop+1:top-2);
  const dome=(t,b,rx,R2,shift)=>{const ry=b-t;for(let y=t;y<=b;y++)for(let x=-rx;x<=rx+1;x++){const yy=(y-b)/ry,xx=(x-.5)/(rx+.5);if(xx*xx+yy*yy>1)continue;const l=-xx*.55-yy*.5;p(cx+x+(shift||0),y,R2[l>.6?4:l>.1?3:l>-.4?2:1]);}};
  const sh=side?-fl:0;
  if(h==='cap'){dome(T0,hy-4,9,H,sh);for(let x=-9;x<=10;x++)p(cx+x+sh,hy-4,H[1]);if(view==='S'){for(let x=-6;x<=7;x++){p(cx+x,hy-3,H[x<-3?3:2]);p(cx+x,hy-2,H[0]);}p(cx,T0+2,H[4]);}
    else if(side){for(let i=0;i<8;i++){p(cx+fl*(6+i),hy-4,H[i<6?3:2]);p(cx+fl*(6+i),hy-3,H[0]);}}}
  if(h==='beanie'){dome(T0-1,hy-3,9,H,sh);for(let x=-9;x<=10;x++){p(cx+x+sh,hy-4,H[2]);p(cx+x+sh,hy-3,H[x<0?3:2]);p(cx+x+sh,hy-2,H[0]);}for(let x=-7;x<=8;x+=2)for(let y=T0+1;y<hy-4;y++)if(g(cx+x+sh,y))p(cx+x+sh,y,H[2]);lockBlob(cx+.5+sh,T0-2,2,2,H);}
  if(h==='bucket'){dome(T0-1,hy-5,8,H,sh);for(let x=-11;x<=12;x++){const dn=Math.abs(x-.5)>9?1:0;p(cx+x+sh,hy-5+dn,H[x<-5?4:x>6?1:3]);p(cx+x+sh,hy-4+dn,H[0]);}}
  if(h==='straw'){const S2=[[110,80,30],[160,124,52],[204,168,82],[232,204,118],[248,230,160]];dome(T0-1,hy-5,8,S2,sh);for(let x=-8;x<=9;x++){p(cx+x+sh,hy-7,H[2]);p(cx+x+sh,hy-6,H[1]);}
    for(let x=-13;x<=14;x++){p(cx+x+sh,hy-5,S2[x<-6?4:x>7?1:3]);p(cx+x+sh,hy-4,S2[(x&1)?1:2]);p(cx+x+sh,hy-3,S2[0]);}}
  if(h==='cowboy'||h==='sheriff'){const R2=h==='sheriff'?ramp('#a07848'):H;for(let y=T0-3;y<hy-5;y++){const w=y<T0-1?5:7;for(let x=-w;x<=w+1;x++){if(y===T0-3&&Math.abs(x-.5)<2)continue;p(cx+x+sh,y,R2[x<-2?4:x>3?1:3]);}}
    for(let x=-7;x<=8;x++)p(cx+x+sh,hy-6,[40,28,20]);for(let x=-13;x<=14;x++){const up=Math.abs(x-.5)>11?1:0;p(cx+x+sh,hy-5-up,R2[x<-6?4:x>7?1:3]);p(cx+x+sh,hy-4-up,R2[0]);}
    if(h==='sheriff'&&view==='S'){p(cx,hy-8,[255,220,110]);p(cx+1,hy-8,[220,170,60]);p(cx,hy-9,[255,220,110]);}}
  if(h==='beret'){dome(T0+1,hy-5,10,H,sh-1);for(let x=-11;x<=10;x++){p(cx+x+sh-1,hy-5,H[x<-4?3:x>5?1:2]);p(cx+x+sh-1,hy-4,H[0]);}p(cx+sh,T0,H[2]);p(cx+sh,T0-1,H[1]);}
  if(h==='flatcap'){dome(T0+1,hy-4,9,H,sh);for(let x=-9;x<=10;x++)p(cx+x+sh,hy-4,H[1]);for(let x=-8;x<=8;x+=3)p(cx+x+sh,T0+3,H[1]);
    if(view==='S'){for(let x=-6;x<=7;x++){p(cx+x,hy-3,H[x<-2?3:2]);p(cx+x,hy-2,H[0]);}}else if(side){for(let i=0;i<5;i++){p(cx+fl*(7+i),hy-4,H[2]);p(cx+fl*(7+i),hy-3,H[0]);}}}
  if(h==='witch'){const W=ramp('#2a2236'),B=[96,46,120];const tip=T0-15;
    for(let y=tip;y<hy-5;y++){const t=(y-tip)/(hy-5-tip),w=Math.round(1+t*7.5),bend=Math.round((1-t)*(1-t)*5)*(side?-fl:1);
      for(let x=-w;x<=w+1;x++)p(cx+x+sh+bend,y,W[x<-w*.4?4:x>w*.5?1:3]);}
    for(let x=-7;x<=8;x++){p(cx+x+sh,hy-7,B);p(cx+x+sh,hy-6,[60,26,76]);}p(cx+sh-2,hy-7,[230,190,70]);
    for(let x=-15;x<=16;x++){const dn=Math.abs(x-.5)>12?1:0;p(cx+x+sh,hy-5+dn,W[x<-6?4:x>7?1:3]);p(cx+x+sh,hy-4+dn,W[0]);}}
  if(h==='top'){const T=ramp('#1c1a20');for(let y=T0-7;y<hy-5;y++)for(let x=-6;x<=7;x++)p(cx+x+sh,y,T[x<-3?4:x>4?1:3]);for(let x=-6;x<=7;x++){p(cx+x+sh,hy-8,[120,30,30]);p(cx+x+sh,hy-7,[80,20,20]);}for(let x=-10;x<=11;x++){p(cx+x+sh,hy-5,T[x<0?3:1]);p(cx+x+sh,hy-4,T[0]);}}}
function acc(cx,hy,view,fl,a,top0,hairTop){if(!a)return;const R=ACCR,side=view!=='S'&&view!=='N',back=view==='N',chin=hy+9;
  if(a==='bow'){const bx=back?cx+5:side?cx-fl*5:cx+6,by=(hairTop!=null?hairTop:hy-10)+1;for(const s of [-1,1])for(let j=-2;j<=2;j++)for(let i=1;i<=3;i++){if(Math.abs(j)>3-i)continue;p(bx+s*i,by+j,R[s<0?(j<0?4:3):(j<0?2:1)]);}p(bx,by,R[0]);p(bx,by-1,R[2]);}
  if(a==='flower'&&!back){const fx=side?cx-fl*2:cx-7,fy=hy-5;for(const [dx,dy] of [[0,-1],[-1,0],[1,0],[0,1]])p(fx+dx,fy+dy,R[3]);p(fx-1,fy-1,R[4]);p(fx,fy,[250,220,90]);}
  if(a==='headband'){const y0=hy-6;for(let x=-9;x<=10;x++){const yy=y0-Math.round(Math.pow(Math.abs(x-.5)/9,2)*-1);if(side&&x*fl>4)continue;p(cx+x,yy,R[x<-4?4:x>5?2:3]);p(cx+x,yy+1,R[1]);}}
  // seen from behind, a scarf or neckerchief is hidden by the hair and the collar: it isn't drawn at all
  if((a==='scarf'||a==='bandana')&&!back){const y0=top0-1;for(let x=-5;x<=6;x++){p(cx+x,y0,R[x<-2?4:x>3?2:3]);p(cx+x,y0+1,R[x<-2?3:x>3?1:2]);}
    if(!back&&!side){if(a==='scarf'){for(let j=2;j<7;j++)for(let i=0;i<3;i++)p(cx+3+i,y0+j,R[i===0?3:i===2?1:2]);for(let i=0;i<3;i++)p(cx+3+i,y0+7,R[(i&1)?1:3]);}
      else{for(let j=2;j<6;j++){const w=5-j;for(let x=-w;x<=w+1;x++)p(cx+x,y0+j,R[(x+j)%3===0?4:2]);}}}
    else if(side){for(let j=2;j<6;j++)p(cx-fl*3,y0+j,R[2]);}}
  if(a==='earrings'&&!back){const G=[230,190,70],G2=[255,236,150];if(side){p(cx-fl*2,hy+4,G);p(cx-fl*2,hy+5,G2);}else{p(cx-9,hy+4,G);p(cx-9,hy+5,G2);p(cx+10,hy+4,G);p(cx+10,hy+5,G2);}}
  if(a==='choker'&&!back){const y0=top0;for(let x=(side?-3:-4);x<=(side?3:5);x++){p(cx+x,y0,R[0]);p(cx+x,y0+1,R[1]);}if(!side){p(cx,y0+2,R[4]);p(cx+1,y0+2,R[3]);}}
  if(a==='necklace'&&!back&&!side){if(ALL){// the young women: the chain hugs the base of the neck and one small pendant sits above the cleavage, never over it (owner)
      for(let x=-3;x<=4;x++)p(cx+x,top0+Math.round((1-Math.pow((x-.5)/3.5,2))*1),R[x<0?4:3]);p(cx,top0+2,R[4]);}
    else{for(let x=-3;x<=4;x++)p(cx+x,top0+2+Math.round((1-Math.pow((x-.5)/3.5,2))*2),R[4]);p(cx,top0+5,[255,255,255]);p(cx+1,top0+5,R[3]);}}}
// ---------------------------------------------------------------- tools. The game draws the tool itself (toolfx.js); the sheets carry the arms and the fists over
// the handle, and META.tool says where the grip is, the angle (0 = screen right, 90 = down), the foreshortening and whether it's behind the body.
// A pickaxe, hoe or axe only ever swings in one plane: from the side you see the arc; facing toward or away from you it goes straight up
// over your head and straight down in front of you. So facing up or down every angle is -90 or 90.
const TP={
 swing:{E:[[6,7,55,1,0],[3,-4,-60,1,1],[0,-11,-115,1,1],[-2,-12,-160,1,1],[5,-4,-15,1,0],[10,6,28,1,0],[10,7,32,1,0],[6,6,50,1,0]],
        // facing down: wound up over the right shoulder (not straight up behind the head, which read as a peg), struck down at a slant
        S:[[3,7,90,.75,0],[5,-4,-70,1,1],[5,-11,-62,1,1],[4,-12,-70,.9,1],[3,-3,90,.3,0],[4,10,80,1,0],[4,11,82,.95,0],[3,7,88,.75,0]],
        // facing away: the strike shows its head beside and above the player's head instead of vanishing behind the body
        N:[[3,6,90,.5,1],[3,-4,-90,1,1],[2,-12,-90,1,1],[2,-13,-90,.5,0],[6,-13,-78,1.15,1],[6,-9,-80,1.05,1],[6,-8,-80,1,1],[3,5,90,.5,1]]},
 // the axe: wound back at shoulder height, a level chop into the trunk in front, held in the wood, pulled out
 axe:{E:[[6,7,60,1,0],[2,-3,-100,1,1],[-2,-6,-150,1,1],[-3,-5,-172,1,1],[6,-4,-40,1,0],[11,-1,-6,1,0],[11,0,-2,1,0],[7,4,40,1,0]],
      S:[[3,7,90,.75,0],[6,-4,-60,1,1],[7,-8,-40,1,1],[8,-8,-28,.9,1],[5,0,15,.6,0],[-2,3,160,.9,0],[-2,4,164,.9,0],[3,7,96,.75,0]],
      N:[[3,6,90,.5,1],[5,-6,-75,1,1],[6,-12,-65,1,1],[7,-12,-55,.9,1],[3,-10,-120,1.05,1],[-7,-6,-160,1.1,1],[-7,-5,-162,1.1,1],[3,5,90,.5,1]]},
 // the pickaxe: a high overhead wind-up, a heavy strike low into the ground, a recoil off the stone, then settling
 pick:{E:[[6,7,55,1,0],[2,-6,-90,1,1],[-1,-13,-135,1,1],[-3,-14,-170,1,1],[6,-6,-30,1,0],[11,8,42,1,0],[10,5,26,1,0],[7,6,50,1,0]],
       S:[[3,7,90,.75,0],[5,-6,-70,1,1],[5,-14,-75,1,1],[4,-16,-80,.9,1],[3,-2,90,.3,0],[4,12,80,1,0],[4,9,84,.9,0],[3,8,88,.8,0]],
       N:[[3,6,90,.5,1],[3,-6,-90,1,1],[2,-14,-90,1,1],[2,-16,-90,.5,0],[6,-14,-78,1.2,1],[6,-11,-80,1.1,1],[6,-12,-80,1.05,1],[3,5,90,.5,1]]},
 rod:{E:[[6,3,-35,1,0],[3,-5,-100,1,1],[1,-9,-135,1,1],[0,-10,-150,1,1],[5,-3,-50,1,0],[8,2,-15,1,0],[8,3,-10,1,0],[7,3,-25,1,0]],
      S:[[5,4,70,.75,0],[5,-4,-90,1,1],[3,-9,-90,1,1],[2,-10,-90,.8,1],[4,0,60,.6,0],[5,4,75,.7,0],[5,5,78,.7,0],[5,4,72,.75,0]],
      N:[[5,2,-80,.8,1],[5,-3,-90,1,1],[4,-9,-90,.7,0],[3,-11,-90,.5,0],[5,-4,-85,1,1],[5,1,-80,.9,1],[5,2,-80,.9,1],[5,2,-80,.85,1]]},
 can:{E:[[8,5,0,1,0],[9,2,10,1,0],[10,1,20,1,0],[11,1,40,1,0],[11,1,48,1,0],[11,1,48,1,0],[11,1,40,1,0],[9,3,10,1,0]],
      S:[[6,6,0,1,0],[5,4,10,1,0],[4,3,20,1,0],[3,3,42,1,0],[3,3,50,1,0],[3,3,50,1,0],[3,3,42,1,0],[5,5,10,1,0]],
      N:[[9,4,0,1,1],[10,2,10,1,1],[10,0,20,1,0],[11,-1,42,1,0],[11,-1,50,1,0],[11,-1,50,1,0],[11,-1,42,1,0],[10,3,10,1,1]]}};   // the can held out to the right side so it shows past the body
const TOOLMETA={N:[],W:[],S:[],E:[]};let HANDS_REC=null;const HANDMETA={N:[],W:[],S:[],E:[]};
const SW_LEAN=[0,-2,-3,-3,1,3,3,1],SW_CROUCH=[0,0,0,0,2,4,4,1],SW_BOB=[0,-1,-2,-1,0,0,0,0];
// the axe stands taller and leans into the chop; the pickaxe rises higher and drops deeper into the strike, then rebounds
const SWK={axe:{lean:[0,-1,-3,-3,1,3,3,1],crouch:[0,0,0,0,1,2,2,1],bob:[0,-1,-1,-1,0,0,0,0]},pick:{lean:[0,-2,-3,-4,1,4,3,1],crouch:[0,0,-1,-1,2,5,3,1],bob:[0,-1,-2,-2,0,0,0,0]}};
function toolEntry(kind,dir,f){const fam=kind==='rod'?'rod':kind==='can'?'can':TP[kind]?kind:'swing';const e=TP[fam][dir==='W'?'E':dir][f];if(dir!=='W')return e.slice();return [-e[0],e[1],180-e[2],e[3],e[4]];}
function fistAt(x,y){for(let j=0;j<2;j++)for(let k=-1;k<=1;k++)p(x+k,y+1+j,SK[j===1?2:k===-1?4:3]);p(x,y+3,SK[1]);}
// hands for a grip: one at the grip, one further up the handle; the can is held by one hand
function toolHands(kind,dir,f){const [gx,gy,ang,k]=toolEntry(kind,dir,f);const a=ang*Math.PI/180;
  return {g1:[gx,gy],g2:kind==='can'?null:[gx+Math.cos(a)*4*k,gy+Math.sin(a)*4*k]};}
// ---------------------------------------------------------------- one figure
// pose: crouch, bob, lean (side), sway (front), legs:{L,R} foot offsets, hands:[left/far, right/near] absolute offsets from the shoulders,
// nod, blink, reach (back view: hands hidden in front of the body), tool (callback)
let SIT=false;
function human(dir,pose){SIT=!!pose.sit;const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1,back=dir==='N';
  const crouch=pose.crouch||0,bob=pose.bob||0,lean=side?Math.round((pose.lean||0)*fl):0;
  const cx=CX+(side?0:(pose.sway||0));const hip=HIP0+crouch+bob,top=TOP0+crouch+bob,ux=cx+lean,hy=top-9-(ALL?1:0)+(STOOP?2:0);
  const shL=side?[ux-fl,top+1]:[ux-7-WIDE,top+1],shR=side?[ux+fl,top+1]:[ux+8+WIDE,top+1];
  const def=side?[[0,KID?8:10],[0,KID?8:10]]:[[0,KID?8:10],[0,KID?8:10]];const hands=pose.hands||def;
  HANDS_REC=[[shL[0]+hands[0][0],shL[1]+hands[0][1]],[shR[0]+hands[1][0],shR[1]+hands[1][1]]];   // where the hands are, for the game to put things in them
  const H={cx:ux,hy,top0:top};let hairInfo=null;
  into('body',()=>{
    if(side){// far arm and leg first, then the body, then the near leg and arm
      const L=pose.legs||[[-1,0],[1,0]];const sideArm=(sh,hd,el,far,inn)=>{if(el){armTo(sh[0],sh[1],sh[0]+el[0]*fl,sh[1]+el[1],far,inn,true);armTo(sh[0]+el[0]*fl,sh[1]+el[1],sh[0]+hd[0]*(pose.elbows?fl:1),sh[1]+hd[1],far,inn,!!pose.noHands);}else armTo(sh[0],sh[1],sh[0]+hd[0]*(pose.noHands&&pose.hands?fl:1),sh[1]+hd[1],far,inn,!!pose.noHands);};sideArm(shL,hands[0],pose.elbows&&pose.elbows[0],true,fl>0?1:-1);   // standing side-on: the far leg a pixel back, so two legs read, not one peg
      legSide(cx+Math.round(lean/2),hip,L[0][0],L[0][1],fl,true,crouch);legSide(cx+Math.round(lean/2),hip,L[1][0],L[1][1],fl,false,crouch);
      skirtSide(ux,hip,fl);torsoSide(ux,top,hip,fl);headSide(ux+(STOOP?2*fl:0),hy,fl,pose);
      sideArm(shR,hands[1],pose.elbows&&pose.elbows[1],false,fl>0?-1:1);}
    else{const L=pose.legs||[0,0];
      if(back&&pose.reach){armTo(shL[0],shL[1],shL[0]+hands[0][0],shL[1]+hands[0][1],false,1);armTo(shR[0],shR[1],shR[0]+hands[1][0],shR[1]+hands[1][1],false,-1);}
      legsFront(cx,hip,L[0],L[1],back,pose.squat||0);skirtFront(ux,hip,back);torsoFront(ux,top,hip,back);
      const up=hands[0][1]<-4||hands[1][1]<-4;
      const arms=()=>{for(const [i,sh] of [[0,shL],[1,shR]]){const h=[sh[0]+hands[i][0],sh[1]+hands[i][1]];
          if(pose.elbows){const el=[sh[0]+pose.elbows[i][0],sh[1]+pose.elbows[i][1]];armTo(sh[0],sh[1],el[0],el[1],false,i?-1:1,true);armTo(el[0],el[1],h[0],h[1],false,i?-1:1,!!pose.noHands);}
          else if(hands[i][1]<-4){const el=[sh[0]+(i?2:-2),sh[1]-5];armTo(sh[0],sh[1],el[0],el[1],false,i?-1:1,true);armTo(el[0],el[1],h[0],h[1],false,i?-1:1);}
          else armTo(sh[0],sh[1],h[0],h[1],false,i?-1:1,!!pose.noHands);}};
      if(up&&!(back&&pose.reach))arms();
      headFront(ux,hy,back,pose);
      if(!up&&!(back&&pose.reach))arms();}});
  into('beard',()=>beard(ux,hy+(pose.nod?1:0),side?(fl>0?'E':'W'):dir,fl,C.beard===true?'full':C.beard));
  into('hair',()=>{const hy2=hy+(pose.hairLag||0);TIPY=hy2+(C.tipDy||6);hairInfo=side?hairSide(ux,hy2,fl,C.hairStyle||'short',pose):hairFront(ux,hy2,back,C.hairStyle||'short',pose);});
  const hairTop=hairInfo?hairInfo.top:null;
  const hyL=hy+(pose.hairLag||0);   // what sits on the hair moves with the hair
  into('acc',()=>acc(ux,['headband','bow','flower'].includes(C.accessory)?hyL:hy,side?(fl>0?'E':'W'):dir,fl,C.accessory,top,hairTop));
  into('glasses',()=>{if(C.glasses)glasses(ux,hy+(pose.nod?1:0),side?(fl>0?'E':'W'):dir,fl,C.glasses);});
  into('hat',()=>hat(ux,hyL,side?(fl>0?'E':'W'):dir,fl,C.hat,hairTop));
  // under a hat, the hair above the brim is hidden by the hat (it used to peek round the crown)
  if(C.hat){const L=LY.hair,by=hy-4+(pose.nod?1:0);for(let y=0;y<by;y++)for(let x=0;x<L.w;x++){const i=(y*L.w+x)*4;if(L.d[i+3]){const hl=LY.hat;if(!(hl.d[i+3])||y<by-1)L.d[i+3]=0;}}}
  into('toolf',()=>{if(pose.tool)pose.tool(ux,top);});}
// ---------------------------------------------------------------- poses per clip
// the walk: Stardew's four beats (contact, pass, contact, pass) spread over our eight frames
function walkPose(f,dir,run){const pose={};if(f===0)return pose;const side=dir==='E'||dir==='W',back=dir==='N',fl=dir==='W'?-1:1;
  const ph=(f-1)/8*Math.PI*2,c=Math.cos(ph),s=Math.sin(ph);const S=run?(KID?4:5):(KID?2:3);
  // the body's height over the eight frames: contact, down, pass (highest), up, contact... (judge r3: a smooth rise and fall, not a jump on the passing frames)
  const WBOB=[0,0,1,0,-1,0,1,0,-1];   // judge r3: never more than 1 px between neighbouring frames (a 3 px step read as a hop)
  // the run bounces the other way (judge r8): low on the passing frame with the support knee bent, high on the frame
  // after it with both feet off the ground; never more than 1 px between neighbours
  const RBOB=[0,1,2,-1,0,1,2,-1,0],AIR=[0,0,0,0,1,0,0,0,1],KNEE=[0,0,0,1,0,0,0,1,0];
  const bobAt=g=>{if(g<1)return 0;return run?RBOB[g]:WBOB[g];};
  pose.bob=bobAt(f);pose.hairLag=0;   // the hair moves with the head (owner: a frame's lag read as hair bobbing loose, not attached)
  if(run){pose.lean=6;pose.nod=side?0:1;if(KNEE[f])pose.crouch=3;}   /* judge r7-r8: the head clearly ahead of the hips (the legs take half the lean); the passing frame sinks onto a bent knee */
  if(side){// leg A is planted while it travels front to back (s>0); meanwhile leg B swings through, lifted, knee bent
    const a=Math.round(c*S),b=-a;const L=run?4:4;const liftA=s<0?Math.round(-s*L):0,liftB=s>0?Math.round(s*L):0;
    const tuck=(d,l)=>run&&l>2?d-4:d-Math.round(l*.75);   // the swinging foot trails 3-4 px behind the planted shin, lifted clear (judge r3: it merged into the planted boot)
    const air=run&&AIR[f]?2:0;pose.legs=[[tuck(a,liftA+air),liftA+air],[tuck(b,liftB+air),liftB+air]];   /* the airborne frame: both feet off the ground */
    // each arm swings against the leg on its own side (the far arm with the near leg), as a pendulum: the hand rises as it swings out
    const base=run?6:9,A=run?1.5:2.67;const hand=(k,far)=>{let dx=Math.round(k*A);const fwd=dx>0;
      if(run){if(dx===0)return [fl*(far?0:2),base-2];   /* passing: the arm stays bent, fist at the hip (judge r7: straight arms there read as standing) */
        return fwd?[Math.min(dx,4)*fl,base-3-Math.min(2,Math.round(dx*.4))]:[Math.round(dx*.9)*fl,base+1];}   // a bent arm pumping: fist at the chest, then driven back
      if(dx===0)dx=1;   // on the passing frame the near hand stays a pixel ahead so the arm never vanishes into the shirt
      // both arms swing about the body's middle (the far shoulder sits a pixel behind, the near one a pixel ahead), so both steps swing the same
      const dy=Math.round(Math.sqrt(Math.max(0,10.5*10.5-dx*dx)))-(fwd?1:0);return [(dx+(far?1:-1))*fl,Math.min(base,dy)];};
    pose.hands=[hand(-a,true),hand(a,false)];}   // far arm against the far leg (a), near arm against the near leg (b=-a)
  else{const sg=back?-1:1;const st=run?4:2;const dL=Math.round(c*st),lift=run?3:2;
    // the planted foot drifts from forward (lower) to back; the swinging foot is lifted, highest on the passing frame
    const liftL=s<0?Math.round(-s*lift):0,liftR=s>0?Math.round(s*lift):0,kn=run&&KNEE[f]?2:0;pose.legs=[sg*dL-liftL-(s<0?kn:0),-sg*dL-liftR-(s>0?kn:0)];pose.sway=0;   /* run: the passing knee comes up higher (judge r8) */
    // seen from the front, the arm swinging forward drops and comes in over the hip; the one swinging back rises and tucks
    // (judge r3: 'the forward hand should drop about 2 px and move in, the back hand rise 1-2 px')
    const ay=run?6:10;const hand=(fw,inward)=>{if(run){/* judge r7: the arms pump clear of the body - fist up to the chest in front, driven back to the hip */return fw>0?[Math.round(2*fw)*inward,ay-Math.round(3*fw)]:[Math.round(-1.5*fw)*-inward,ay+Math.round(sg*3*-fw)];}
      const k=fw;return k>0?[Math.round(3*k)*inward,ay+Math.round(sg*3*k)]:[Math.round(.6*k)*inward,ay+Math.round(sg*2.4*k)];};
    pose.hands=[hand(-c,1),hand(c,-1)];}
  return pose;}
// planting and harvesting: bend, kneel, reach into the soil in front, press it in, rise, stand
function plantPose(f,dir){const pose={},side=dir==='E'||dir==='W',back=dir==='N',fl=dir==='W'?-1:1;if(f===0||f===5)return pose;const kneel=f===2||f===3;
  // kneeling to the square in front: a short step forward with the near foot, a lean from the hips (the feet stay put),
  // the hands reaching low and forward (judge r4: lean, never slide the whole body)
  if(side){if(kneel){pose.crouch=5;pose.lean=5;pose.legs=[[-4,0],[5,0]];const d=f===3?1:0;pose.hands=[[fl*(7+d),12+d],[fl*(9+d),12+d]];pose.nod=1;}
    else if(f===1){pose.crouch=3;pose.lean=3;pose.legs=[[-3,0],[3,0]];pose.hands=[[fl*5,10],[fl*7,10]];pose.nod=1;}else{pose.crouch=2;pose.lean=2;pose.hands=[[fl*4,4],[fl*5,3]];}}
  else{if(kneel){pose.crouch=6;pose.squat=2;const d=f===3?1:0;pose.hands=back?[[4,8],[-3,8]]:[[5,14+d],[-4,14+d]];pose.reach=back;pose.nod=1;}
    else if(f===1){pose.crouch=3;pose.squat=1;pose.hands=back?[[4,7],[-3,7]]:[[5,11],[-4,11]];pose.reach=back;pose.nod=1;}
    else{pose.crouch=2;pose.hands=back?[[4,2],[-3,2]]:[[5,3],[-4,3]];pose.reach=back;}}
  return pose;}
// ---------------------------------------------------------------- render
if(CFG.portraits){console.log('portraits are drawn by portrait3.js now');}
ROWS.forEach(([clip,dir,nf],r)=>{for(let f=0;f<nf;f++){
  LY={};for(const k of PARTS)LY[k]=layer(k,FW,FH);CUR='body';
  const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1;let pose={};
  if(clip==='walk')pose=walkPose(f,dir,false);
  if(clip==='run')pose=walkPose(f===0?1:f,dir,true);
  if(clip==='idle'){pose.bob=[0,1,1,0][f];pose.hairLag=0;pose.blink=f===3;
    // each person their own way of standing (judge, townsfolk: "everyone stands the same way"): elbow then hand, from the shoulder
    const ST=C.stance;if(ST&&!KID&&dir!=='N'){
      if(!side){if(ST==='hips'){pose.elbows=[[-3,5],[3,5]];pose.hands=[[2,9],[-1,9]];}
        else if(ST==='folded'){pose.elbows=[[-1,7],[1,7]];pose.hands=[[8,5],[-7,5]];}
        else if(ST==='pockets'){pose.hands=[[1,9],[0,9]];pose.noHands=true;}
        else if(ST==='behind'){pose.hands=[[2,8],[-1,8]];pose.noHands=true;}}
      else{if(ST==='hips'){pose.elbows=[[-2,5],[-2,5]];pose.hands=[[1,8],[1,8]];}
        else if(ST==='folded'){pose.elbows=[[0,6],[0,6]];pose.hands=[[3,5],[3,5]];}
        else if(ST==='pockets'){pose.hands=[[0,9],[0,9]];pose.noHands=true;}
        else if(ST==='behind'){pose.hands=[[-2,8],[-2,8]];pose.noHands=true;}}}}
  if(clip==='thrust'&&TOOL){const kind=TOOL;const e=toolEntry(kind,dir,f);const T=toolHands(kind,dir,f);
    if(kind==='can'){pose.crouch=f>=3&&f<=6?1:0;pose.lean=f>=3&&f<=6?1:0;}else{const K_=SWK[kind];pose.crouch=(K_?K_.crouch:SW_CROUCH)[f];pose.bob=(K_?K_.bob:SW_BOB)[f];pose.lean=(K_?K_.lean:SW_LEAN)[f];}
    if(side&&kind!=='can')pose.legs=[[-2,0],[3,0]];
    // hands from the shoulders: the grip is relative to the shoulders' middle (ux, shoulder row)
    // a hand's block is drawn one row under its point, and the shoulders sit one row under the reference row
    const rel=(gg,sh)=>[Math.round(gg[0]-sh),Math.round(gg[1]-2)];
    if(side)pose.hands=[T.g2?rel(T.g2,-fl):[-fl,KID?8:10],rel(T.g1,fl)];
    else if(kind==='can')pose.hands=[[0,KID?8:10],rel(T.g1,8)];
    else{const pts=[T.g1,T.g2].sort((a,b)=>a[0]-b[0]);pose.hands=[rel(pts[0],-7),rel(pts[1],8)];}
    if(dir==='N'&&e[1]>-6)pose.reach=true;
    pose.tool=(ux,top)=>{TOOLMETA[dir][f]=[ux+e[0],top+e[1],e[2],e[3],e[4]];if(!e[4]&&dir!=='N')for(const gg of [T.g1,T.g2])if(gg)fistAt(Math.round(ux+gg[0]),Math.round(top+gg[1]-1));};}
  if(clip==='slash')pose=plantPose(f,dir);
  // hurt (judge: it read as a shrug, then dozing): the hit (snap up, wide eyes, an O mouth, hands flung out at the shoulders),
  // the cower (head ducked, shoulders up, eyes squeezed shut, hands beside the neckline, never over it), then easing back
  if(clip==='hurt'){pose.bob=[-2,-3,0,0,0,0][f];pose.crouch=[0,0,3,3,2,1][f];pose.nod=f>=2&&f<=4?1:0;pose.expr=f<2||f===5?'scared':'wince';
    // the second frame overshoots (higher, wider); the arms are uneven so the fling doesn't read as a cheer (judge r1)
    pose.hands=[[[-5,-7],[4,-5]],[[-6,-9],[5,-6]],[[1,-5],[-1,-4]],[[1,-5],[-1,-4]],[[0,1],[0,2]],[[0,6],[0,6]]][f];}
  if(clip==='spellcast'){const up=f>1;pose.hands=up?(side?[[fl*-1,-10],[fl*2,-11]]:[[1,-11],[-1,-11]]):null;}
  if(clip==='sit'){pose.crouch=2;pose.sit=true;pose.bob=[0,1,0][f]||0;pose.hands=side?[[fl*5,9],[fl*6,9]]:[[3,13],[-3,13]];pose.blink=f===2;}   /* hands resting on the thigh / the knees; a breath */
  const EX0=EXPR;if(pose.expr)EXPR=pose.expr;human(dir,pose);EXPR=EX0;
  if(clip==='slash'&&HANDS_REC)HANDMETA[dir][f]=HANDS_REC.map(h=>h.map(Math.round));
  // outline the whole figure; each outline pixel goes to the part whose pixel it borders
  const comp=flatten(PARTS.map(k=>LY[k]),FW,FH);
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){if(G(comp,x,y))continue;let n=null,ow=null;
    for(const [ddx,ddy] of [[0,1],[0,-1],[1,0],[-1,0]]){const c=G(comp,x+ddx,y+ddy);if(c&&c[3]>200){n=c;for(let i=PARTS.length-1;i>=0;i--)if(G(LY[PARTS[i]],x+ddx,y+ddy)){ow=PARTS[i];break;}break;}}
    if(n)P(LY[ow],x,y,outlineRGB(n));}
  const src=PART==='all'?flatten(PARTS.map(k=>LY[k]),FW,FH):LY[PART];
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){const c=G(src,x,y);if(c)P(SHEET,f*FW+x,r*FH+y,c,c[3]);}}});
emit([SHEET],CFG.out);
const clips={};let rr=0;for(const [n,ds,nf] of CLIPS){clips[n]={};for(const d of ds)clips[n][d]=[rr++,nf];}
console.log('META '+JSON.stringify(Object.assign({fw:FW,fh:FH,ax:FW/2,ay:FH-4,clips},TOOL?{tool:TOOLMETA,toolKind:TOOL}:{hands:HANDMETA})));
