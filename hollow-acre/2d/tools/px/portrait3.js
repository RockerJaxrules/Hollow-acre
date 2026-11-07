// ---- talking portraits, 64x64 busts in seven expressions, in the detail of the chat portraits we studied: a real face (lidded eyes with
// whites, iris and glint, shaped brows, a nose drawn by its shadow, two-tone lips), hair in big curved locks with bright streaks, soft
// block shading lit from the upper left, collars and folds, coloured outlines. Our own drawings, from each villager's look.
SEED=CFG.seed||3;
const C=CFG.look,KID=!!C.kid;
const PW=64,PH=64,EXS=['neutral','happy','sad','angry','surprised','scared','wrong'];
const SHEET=layer('sheet',PW*EXS.length,PH);
function rgb2hsv(c){const r=c[0]/255,g=c[1]/255,b=c[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx];}
function hsv2rgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60){r=c;g=x;}else if(h<120){r=x;g=c;}else if(h<180){g=c;b=x;}else if(h<240){g=x;b=c;}else if(h<300){r=x;b=c;}else{r=c;b=x;}
  return [Math.round((r+m)*255),Math.round((g+m)*255),Math.round((b+m)*255)];}
function hueToward(h,t,a){let d=((t-h+540)%360)-180;if(Math.abs(d)<a)return t;return (h+Math.sign(d)*a+360)%360;}
// seven-step ramps for portraits: deep, dark, shadow, mid, base, light, shine
function ramp7(hex){const c=HEX(hex);const [h,s,v]=rgb2hsv(c);const cl=x=>Math.max(0,Math.min(1,x));const mk=(tgt,amt,ks,kv,add)=>hsv2rgb(hueToward(h,tgt,amt),cl(s*ks+(ks>1?.04:0)),cl(v*kv+add));
  return [mk(265,30,1.25,.22,0),mk(265,22,1.2,.42,0),mk(265,14,1.12,.6,0),mk(265,6,1.05,.8,0),[c[0],c[1],c[2]],mk(55,12,.8,1.1,.06),mk(55,18,.55,1.2,.16)];}
function outlineRGB(n){const [h,s,v]=rgb2hsv(n);return hsv2rgb(hueToward(h,250,30),Math.max(0,Math.min(1,s*1.15+.15)),Math.max(.07,v*.26));}
const SK=ramp7(C.skin||'#e8b48c'),HR=ramp7(C.hair||'#6a4224'),EY=ramp7(C.eye||'#3a5a7a'),SH=ramp7(C.shirt||'#b8402c'),PN=ramp7(C.pants||'#3a4e7a'),
  EX=ramp7(C.extra||'#6a7a3a'),AC=ramp7(C.acc||'#c83a5a'),HT=ramp7(C.hatColor||'#8a5a2a');
const OUT=C.outfit||(C.overalls?'overalls':C.coat?'jacket':C.plaid?'shirt':(C.skirt?'dress':'tee'));
const JK=C.coat?ramp7(C.coatColor||C.shirt||'#3a3a40'):EX;
const WHITE=[246,242,236],WHITE2=[214,210,214],LASH=[30,20,26],BLUSH=[236,140,128],MOUTH=[86,30,36],TEETH=[244,240,232],LIPC=null;
const hairHSV=rgb2hsv(HEX(C.hair||'#6a4224'));const ELDER=hairHSV[1]<.12&&hairHSV[2]>.5;   // grey or white hair
let L=null;const p=(x,y,c)=>{if(c)P(L,Math.round(x),Math.round(y),c);};const g=(x,y)=>G(L,Math.round(x),Math.round(y));
const mix=(a,b,t)=>[Math.round(a[0]+(b[0]-a[0])*t),Math.round(a[1]+(b[1]-a[1])*t),Math.round(a[2]+(b[2]-a[2])*t)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---------------------------------------------------------------- geometry. The face axis is x=32 (columns 31|32), the eye line y=EYE.
const CX=31.5,EYE=KID?33:31,CHIN=KID?50:52,FT=KID?15:13;
// half-width of the face at each row: forehead, temples, cheekbones, then the jaw curving in to the chin
function faceHW(y){if(y<FT)return 0;const t=y-FT;if(t<3)return 9+t*1.3;if(y<EYE+5)return 13;const j=(y-(EYE+5))/(CHIN-(EYE+5));if(j>1)return 0;return 13-Math.pow(j,1.6)*(KID?7:8.5)-(j>.85?(j-.85)*14:0);}
// ---------------------------------------------------------------- shoulders and clothes (drawn first)
function torso(){const top=CHIN+1,R=SH;
  // neck
  for(let y=CHIN-6;y<=top+3;y++){const hw=KID?4:5;for(let x=-hw;x<hw;x++){const X=CX+.5+x;let k=x<-hw+2?4:x>hw-3?2:3;if(y<CHIN+2)k=Math.min(k,2);p(X,y,SK[k]);}}
  for(let y=CHIN-1;y<=CHIN+2;y++)for(let x=-5;x<5;x++)if(x>-3)p(CX+.5+x,y,SK[1]);
  // shoulders: a broad curve from the neck out to the frame edge
  const sw=KID?22:27;for(let y=top;y<PH;y++){const t=(y-top)/(PH-top);const hw=Math.min(31,(KID?8:10)+Math.sqrt(t)*sw);for(let x=-Math.ceil(hw);x<Math.ceil(hw);x++){const X=CX+.5+x;const ax=Math.abs(x+.5);if(ax>hw)continue;
      if(ax<(KID?4:5)&&y<top+3)continue;
      let k=x<-hw+4?5:x>hw-5?2:x>hw-9?3:4;if(y>PH-3)k=Math.max(1,k-1);
      let RR=R;if(OUT==='jacket'||OUT==='longcoat'||OUT==='cardigan'){RR=ax>6+(y-top)*.35?JK:R;}if(OUT==='vest'&&ax>5&&ax<hw-5)RR=JK;if(OUT==='openshirt'&&ax<4+(y-top)*.2)RR=EX;
      if(OUT==='overalls'&&ax<11&&y>top+8)RR=PN;if(OUT==='tank'&&ax>9)RR=SK;if((OUT==='dress'||OUT==='skirt')&&C.apron&&ax<9&&y>top+6)RR=EX;
      // pattern
      let kk=k;if(RR===R){const PAT=C.pattern||(C.plaid?'plaid':'');const cx=((x%6)+6)%6,cy=((y%6)+6)%6;if(PAT==='plaid'&&(cx<2||cy<2))kk=Math.max(1,kk-1);if(PAT==='stripes'&&cy<3)kk=Math.max(1,kk-1);if(PAT==='dots'&&cx===2&&cy===2)kk=6;}
      p(X,y,RR[kk]);}}
  // folds under the arms and across the chest
  for(let i=0;i<5;i++){p(CX-17+i,top+9+(i>>1),SH[2]);p(CX+18-i,top+9+(i>>1),SH[1]);}
  // necklines and collars
  const nx=CX+.5;
  if(OUT==='tee'||OUT==='dress'||OUT==='skirt'||OUT==='overalls'||OUT==='tank'){for(let x=-6;x<6;x++){const yy=top+1+Math.round(Math.pow(Math.abs(x+.5)/6,2)*-2+2);p(nx+x,yy,SH[2]);p(nx+x,yy+1,SH[3]);}}
  if(OUT==='shirt'||OUT==='vest'||OUT==='openshirt'){for(const s of [-1,1])for(let i=0;i<7;i++){const x=nx+s*(1+i*.8)-(s<0?1:0),y=top+i*.6;p(x,y,i<2?WHITE:mix(WHITE,WHITE2,i/7));p(x,y+1,WHITE2);}
    if(OUT==='shirt')for(let y=top+5;y<PH;y+=4){p(nx-1,y,WHITE);p(nx,y,WHITE2);}for(let y=top+3;y<PH;y++)p(nx+1,y,SH[1]);}
  if(OUT==='jacket'||OUT==='longcoat'||OUT==='cardigan'){for(const s of [-1,1])for(let y=top;y<PH;y++){const ax=6+(y-top)*.35;const x=nx+s*ax-(s<0?1:0);p(x,y,JK[s<0?6:1]);p(x+s,y,JK[s<0?5:2]);}
    if(OUT!=='cardigan')for(const s of [-1,1])for(let i=0;i<6;i++){const x=nx+s*(5+i),y=top+2+i*1.2;p(x,y,JK[s<0?5:2]);}
    if(OUT==='cardigan')for(let y=top+4;y<PH;y+=4)p(nx-6-(y-top)*.35,y,WHITE);}
  if(OUT==='hoodie'){for(let x=-11;x<11;x++){const yy=top-1+Math.round(Math.abs(x+.5)*.25);for(let j=0;j<4;j++)p(nx+x,yy+j,SH[j===0?5:j===3?2:4]);}for(const s of [-3,3])for(let y=top+3;y<top+12;y++)p(nx+s-(s<0?0:1),y,y===top+11?SH[5]:WHITE);}
  if(OUT==='sweater'||OUT==='turtleneck'){const tall=OUT==='turtleneck'?7:3;for(let y=top-tall+3;y<top+3;y++)for(let x=-6;x<6;x++)p(nx+x,y,SH[(x&1)?3:4]);for(let x=-6;x<6;x++)p(nx+x,top+3,SH[2]);}
  if(OUT==='overalls'){for(const s of [-1,1])for(let y=top;y<top+12;y++){p(nx+s*8-(s<0?1:0),y,PN[3]);p(nx+s*9-(s<0?1:0),y,PN[2]);}for(const s of [-1,1]){p(nx+s*8-(s<0?1:0),top+10,[222,190,96]);p(nx+s*9-(s<0?1:0),top+10,[150,118,52]);}}
  if(C.apron){for(const s of [-1,1])for(let y=top+1;y<top+8;y++)p(nx+s*7-(s<0?1:0),y,EX[3]);}
  if(C.collar)for(let x=-3;x<3;x++){p(nx+x,top,WHITE);p(nx+x,top+1,WHITE2);}
  if(C.badge){for(const [dx,dy,c] of [[-12,8,[255,228,120]],[-11,8,[240,200,80]],[-12,9,[200,150,40]],[-11,7,[255,228,120]],[-13,8,[255,228,120]],[-11,9,[200,150,40]]])p(nx+dx,top+dy,c);}}
// ---------------------------------------------------------------- the head
function head(ex){
  // ears
  for(const s of [-1,1]){const ex0=s<0?CX-14:CX+15;for(let y=EYE;y<EYE+7;y++){const w=y<EYE+2||y>EYE+4?1:2;for(let i=0;i<w;i++)p(ex0+s*i,y,SK[s<0?(i?3:4):(i?2:3)]);}p(ex0,EYE+2,SK[2]);p(ex0,EYE+3,SK[2]);}
  // the face: lit from the upper left, a shadow down the right side and under the jaw, soft cheeks
  for(let y=FT;y<=CHIN;y++){const hw=faceHW(y);if(hw<=0)continue;for(let x=Math.floor(CX-hw+.5);x<=Math.ceil(CX+hw-.5);x++){const dx=x+.5-(CX+.5),u=dx/hw;
      let k=4;if(u>.62)k=3;if(u>.82)k=2;if(u<-.55&&y>EYE-4&&y<EYE+9)k=5;if(y>CHIN-3)k=Math.min(k,3);if(y===CHIN)k=2;
      if(y>EYE+3&&y<EYE+8&&u>.35&&u<.7)k=3;          // the cheekbone's shade
      p(x,y,SK[k]);}}
  // nose: a lit ridge, a shadow down its right side and under it, a nostril
  const nx=Math.round(CX+.5),ny=EYE+3;for(let y=ny;y<ny+6;y++){p(nx+1,y,SK[3]);if(y>ny+1)p(nx-1,y,SK[5]);}p(nx+1,ny+6,SK[2]);p(nx,ny+6,SK[2]);p(nx-1,ny+6,SK[3]);p(nx+2,ny+5,SK[2]);p(nx-2,ny+6,SK[3]);
  for(let x=-2;x<=3;x++)p(nx+x,ny+7,SK[3]);
  // blush
  if(ex==='happy'||C.blush||(!ELDER&&!C.beard)){for(const s of [-1,1])for(let i=0;i<4;i++){const bx=s<0?CX-9+i:CX+7+i;p(bx,EYE+6,mix(SK[4],BLUSH,.45));if(i>0&&i<3)p(bx,EYE+7,mix(SK[4],BLUSH,.35));}}
  if(ELDER){for(const s of [-1,1]){p(s<0?CX-5:CX+6,EYE+8,SK[2]);p(s<0?CX-6:CX+7,EYE+9,SK[2]);p(s<0?CX-6:CX+7,EYE+10,SK[2]);for(let i=0;i<3;i++)p((s<0?CX-6:CX+5)+i,EYE+5,SK[3]);}}
  eyes(ex);brows(ex);mouth(ex);}
// eyes: a thick upper lid that flicks out at the corner, whites, a two-tone iris with a dark pupil and a glint, a soft lower lid
function eyes(ex){const hollow=!!C.hollowEyes;
  for(const s of [-1,1]){const x0=s<0?CX-10:CX+3,y0=EYE;// the eye box is 7 wide, 5 tall
    const out=s<0?x0:x0+6,inn=s<0?x0+6:x0;const ix=s<0?x0+3:x0+2;   // iris centre
    if(ex==='happy'){for(let i=0;i<7;i++){const yy=y0+2-Math.round(Math.sin(i/6*Math.PI)*2);p(x0+i,yy,LASH);p(x0+i,yy+1,SK[2]);}continue;}
    if(hollow||ex==='wrong'){for(let j=0;j<5;j++)for(let i=0;i<7;i++){if((j===0||j===4)&&(i===0||i===6))continue;p(x0+i,y0+j,[10,6,10]);}if(ex==='wrong'){p(ix,y0+2,[200,20,20]);p(ix+1,y0+2,[150,10,10]);}else{p(ix,y0+2,[40,30,40]);}
      for(let i=0;i<7;i++)p(x0+i,y0-1,LASH);continue;}
    const wide=ex==='surprised'||ex==='scared',narrow=ex==='angry',sad=ex==='sad';
    const top=narrow?y0+1:wide?y0-1:y0,bot=y0+4;
    for(let j=top+1;j<bot;j++)for(let i=1;i<6;i++)p(x0+i,j,j===top+1?WHITE2:WHITE);
    // iris
    const ir=wide?1:2,icx=ix,icy=y0+2;for(let j=-2;j<=2;j++)for(let i=-ir;i<=ir;i++){const yy=icy+j;if(yy<=top||yy>=bot)continue;const k=j<=-1?2:j===0?3:j===1?4:5;p(icx+i,yy,EY[k]);}
    if(ex!=='scared'){p(icx,icy,EY[0]);if(!wide)p(icx+(s<0?0:0),icy+1,EY[1]);}else p(icx,icy,EY[1]);
    p(icx-(ir>1?1:0),icy-1,[255,255,255]);if(!wide)p(icx+1,icy+1,mix(EY[5],WHITE,.4));
    // upper lid: thick, with the lash flick past the outer corner; a crease above
    for(let i=0;i<7;i++){const yy=top+(i===0||i===6?1:0);p(x0+i,yy,LASH);if(i>0&&i<6)p(x0+i,yy-1,i===(s<0?1:5)?LASH:null);}
    p(out+(s<0?-1:1),top,LASH);p(out+(s<0?-1:1),top-1,LASH);
    for(let i=1;i<6;i++)p(x0+i,top-2,SK[3]);
    if(sad){p(inn,top-1,LASH);p(inn+(s<0?-1:1),top-1,LASH);}
    // lower lid
    for(let i=1;i<6;i++)p(x0+i,bot,SK[2]);p(out,bot-1,SK[2]);}}
function brows(ex){const R=HR;for(const s of [-1,1]){const x0=s<0?CX-11:CX+3,inner=s<0?7:0;let y0=EYE-4;if(ex==='surprised'||ex==='scared')y0-=2;
    for(let i=0;i<8;i++){const t=i/7;let lift=Math.round(Math.sin(t*Math.PI)*1.6);const innerT=s<0?t:1-t;   // 1 at the inner end
      if(ex==='angry')lift=Math.round(-innerT*3+1.5);if(ex==='sad'||ex==='scared')lift=Math.round(innerT*3-.5);
      const x=x0+i,y=y0-lift;const th=i>1&&i<7?2:1;for(let j=0;j<th;j++)p(x,y+j,j===0?R[2]:R[1]);}}}
function mouth(ex){const mx=CX+.5,my=EYE+12,LP=mix(SK[3],[200,90,90],.35),LP2=mix(SK[2],[150,50,60],.35);
  if(ex==='happy'){for(let x=-5;x<5;x++){const yy=my+Math.round(Math.pow(Math.abs(x+.5)/5,2)*-2+1);p(mx+x,yy,MOUTH);if(Math.abs(x+.5)<4)p(mx+x,yy-1,TEETH);}for(let x=-3;x<3;x++)p(mx+x,my+2,LP);p(mx-6,my-1,SK[2]);p(mx+5,my-1,SK[2]);return;}
  if(ex==='sad'){for(let x=-4;x<4;x++){const yy=my+1-Math.round(Math.pow(Math.abs(x+.5)/4,2)*-1.5)-1;p(mx+x,yy,LP2);}for(let x=-2;x<2;x++)p(mx+x,my+2,LP);return;}
  if(ex==='angry'){for(let x=-4;x<4;x++){p(mx+x,my,LP2);p(mx+x,my+1,x>-3&&x<2?TEETH:LP2);}for(let x=-3;x<3;x++)p(mx+x,my+2,LP);p(mx-5,my+1,SK[2]);p(mx+4,my+1,SK[2]);return;}
  if(ex==='surprised'){for(let y=0;y<4;y++)for(let x=-2;x<2;x++){if((y===0||y===3)&&(x===-2||x===1))continue;p(mx+x,my-1+y,y===0?LP2:MOUTH);}for(let x=-2;x<2;x++)p(mx+x,my+3,LP);return;}
  if(ex==='scared'){for(let x=-4;x<4;x++){p(mx+x,my+((x&1)?1:0),MOUTH);p(mx+x,my+1+((x&1)?1:0),LP2);}const sx=CX+13;for(const [dx,dy,c] of [[0,0,[200,230,250]],[0,1,[150,200,240]],[1,1,[200,230,250]],[0,2,[120,170,230]]])p(sx+dx,EYE-6+dy,c);return;}
  if(ex==='wrong'){for(let x=-8;x<8;x++){const yy=my+Math.round(Math.pow(Math.abs(x+.5)/8,2)*-4+1);p(mx+x,yy,MOUTH);if(Math.abs(x+.5)<7&&(x&1))p(mx+x,yy-1,TEETH);}return;}
  // neutral: a closed mouth, a darker upper lip, a lit lower lip
  if(C.smile===false){for(let x=-3;x<3;x++)p(mx+x,my,LP2);return;}
  for(let x=-4;x<4;x++){const yy=my-(Math.abs(x+.5)>3?1:0);p(mx+x,yy,LP2);}for(let x=-2;x<2;x++)p(mx+x,my+1,LP);p(mx-1,my+2,SK[3]);p(mx,my+2,SK[3]);}
// ---------------------------------------------------------------- hair: the sprite styles, redrawn at portrait size. Locks fall from a comb point; each has a lit
// edge with a bright streak, a dark edge, and comes to a point; every lock border is a dark line.
const HS={
  short:{vol:3,crown:5,K:5,part:-6,fr:[-9,-2,4],side:[2,3],sweep:1},crop:{vol:2,crown:4,K:6,part:0,fr:[-11,-8,2],side:[1,-2]},
  sidepart:{vol:3,crown:5,K:4,part:-8,fr:[-12,-2,4],side:[2,3],sweep:1},bangs:{vol:4,crown:5,K:6,part:0,fr:[-4,-2,2],side:[3,8]},
  shaggy:{vol:5,crown:5,K:6,part:-2,fr:[-5,1,6],side:[4,13]},spiky:{vol:4,crown:7,K:6,part:0,fr:[-7,-4,6],side:[2,1],spikes:8},
  buzz:{vol:1,crown:2,K:12,part:0,fr:[-12,-10,0],side:[0,-4],tex:'buzz'},mohawk:{vol:1,crown:2,K:12,part:0,fr:[-12,-10,0],side:[0,-4],tex:'buzz',crest:1},
  topknot:{vol:2,crown:3,K:6,part:0,fr:[-12,-9,2],side:[1,-2],knot:1},curly:{vol:6,crown:7,K:5,part:0,fr:[-7,-4,4],side:[5,10],tex:'curl'},
  afro:{vol:9,crown:11,K:5,part:0,fr:[-9,-6,2],side:[7,8],tex:'curl'},wavy:{vol:5,crown:5,K:5,part:2,fr:[-10,-2,4],side:[5,40],tex:'wave'},
  bob:{vol:5,crown:5,K:6,part:0,fr:[-4,-2,2],side:[5,20]},long:{vol:4,crown:5,K:5,part:1,fr:[-12,-2,4],side:[4,40]},
  ponytail:{vol:3,crown:5,K:5,part:0,fr:[-10,-4,4],side:[2,2],tail:1},bun:{vol:3,crown:5,K:5,part:0,fr:[-10,-4,3],side:[2,0],bun:1},
  braids:{vol:3,crown:5,K:5,part:1,fr:[-10,-4,3],side:[2,8],braids:1},pigtails:{vol:4,crown:5,K:6,part:0,fr:[-4,-2,2],side:[3,6],pigs:1},
  spacebuns:{vol:3,crown:5,K:6,part:0,fr:[-4,-2,2],side:[2,4],buns:1}};
function hairStyle(){const st=C.hairStyle||'short';if(st==='bald')return null;const S=Object.assign({},HS[st]||HS.short);if(C.hairLen)S.side=[S.side[0],Math.min(40,C.hairLen*2.6)];return S;}
function hair(front){const S=hairStyle();if(!S)return;const hw=13+S.vol,topY=FT-S.crown,cyc=EYE-2,ry=cyc-topY;
  const ox=CX+.5+S.part,oy=topY-6;const ang=(x,y)=>Math.atan2(x+.5-ox,y+.5-oy);const A0=ang(CX-hw-3,EYE+10),A1=ang(CX+hw+3,EYE+10),K=S.K;
  const lockF=(x,y)=>{const d=Math.hypot(x+.5-ox,y+.5-oy);const su=x+.5-ox;let a=(ang(x,y)-A0)/(A1-A0)*K;a+=Math.sign(su)*Math.min(1.2,d*d*.0009)*(S.sweep?0:1);if(S.sweep)a-=Math.min(1.4,d*d*.0011);if(S.tex==='wave')a+=Math.sin(y*.35)*.3;return a;};
  const tipAt=(x,y,d)=>{const f=((lockF(x,y)%1)+1)%1;return Math.round(d*(1-Math.abs(2*f-1)));};
  const sideBot=Math.min(PH,EYE+S.side[1]);const faceAt=y=>faceHW(y)||0;
  const fringeY=su=>{const t=S.sweep?clamp((su+12)/24,0,1):Math.min(1,Math.abs(su-S.part)/12);return EYE+S.fr[0]+(S.fr[1]-S.fr[0])*t;};
  const inside=(x,y)=>{const su=x+.5-(CX+.5),a=Math.abs(su);
    const bump=S.tex==='curl'?1+.06*Math.sin(Math.atan2(cyc-y,su)*12):1;
    let crownIn=y<=cyc&&Math.pow(a/((hw+.5)*bump),2.5)+Math.pow((cyc-y)/((ry+.5)*bump),2.6)<=1;
    if(S.spikes&&!crownIn&&y<topY+S.spikes){const tip=tipAt(x,y,S.spikes);crownIn=a<hw-2&&Math.pow(a/(hw+.5),2.5)+Math.pow((cyc-y-tip)/(ry+.5),2.6)<=1;}
    const fh=faceAt(y);
    if(!front){// the hair behind the head and shoulders (drawn before the face)
      if(y<=cyc)return crownIn;const outer=hw+.5-Math.max(0,(y-CHIN)*.12);return a<=outer&&y<=sideBot+tipAt(x,y,4)&&(S.side[1]>8);}
    if(a<fh-1.5&&y>=FT)return crownIn&&y<fringeY(su)+tipAt(x,y,S.fr[2]);
    if(crownIn)return true;if(y<=cyc)return false;
    // beside the face: from the face edge outward, down to the side length
    const outer=y>CHIN?hw+.5-Math.min(8,(y-CHIN)*.3):hw+.5;if(a>outer)return false;if(a<fh-1.5)return false;
    if(y>CHIN&&a<(KID?9:11))return false;   // keep the neck clear
    return y<=sideBot+tipAt(x,y,4)&&(S.side[0]>0||y<=EYE+1);};
  const minY=Math.max(0,topY-(S.spikes||0)-1),maxY=front?Math.min(PH-1,sideBot+5):Math.min(PH-1,sideBot+5);
  for(let y=minY;y<=maxY;y++)for(let x=Math.floor(CX-hw-3);x<=Math.ceil(CX+hw+3);x++){if(!inside(x,y))continue;const su=x+.5-(CX+.5);
    const lf=lockF(x,y),f=((lf%1)+1)%1;const below=!inside(x,y+1);
    let light=y<=cyc?-.5*(su/hw)-.75*((y-cyc)/(ry+1)):-.5*(su/hw)-.1-(y-cyc)*.012;if(!front)light-=.35;
    let k=light>.6?5:light>.25?4:light>-.1?3:light>-.45?2:1;
    if(S.tex==='buzz'){k=((x+y)&1)?Math.max(1,k-1):k;if(S.crest&&Math.abs(su)>4.5){p(x,y,((x+y)&1)?mix(SK[3],HR[1],.5):SK[3]);continue;}p(x,y,HR[k]);continue;}
    if(f<.2)k=Math.min(6,k+1);else if(f>.78)k=Math.max(1,k-1);
    // the bright streak curving down each lock, strongest near the crown
    if(f>.16&&f<.34&&light>-.15&&y<EYE+6&&(Math.floor(lf)&1)===0)k=y<cyc-3?6:5;
    if(below)k=Math.max(0,k-2);
    if(S.tex==='curl'){const row=Math.floor(y/4),lx=((x+(row&1)*3)%6+6)%6,ly=((y%4)+4)%4;if((lx<2)&&ly===0)k=Math.min(6,k+2);else if((lx===3||lx===4)&&ly===3)k=Math.max(0,k-3);else if(lx===5&&ly===2)k=Math.max(1,k-1);}
    else if(Math.hypot(x+.5-ox,y+.5-oy)>10&&Math.floor(lockF(x+1,y))!==Math.floor(lf)&&inside(x+1,y)&&inside(x,y-1))k=y>cyc-6?0:(y>cyc-12?Math.min(k,2):k);
    p(x,y,HR[k]);}
  if(front){// the fringe's shadow on the forehead
    for(let x=Math.floor(CX-12);x<=Math.ceil(CX+12);x++){for(let y=minY;y<EYE;y++)if(inside(x,y)&&!inside(x,y+1)){const c=g(x,y+1);if(c&&!inside(x,y+1))p(x,y+1,SK[3]);if(c&&!inside(x,y+2)&&g(x,y+2))p(x,y+2,SK[3]);break;}}
    extras(S,topY,hw);}}
function blobH(cx,cy,rx,ry){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx+.01)+y*y/(ry*ry+.01);if(d>1)continue;const l=-x/(rx+.01)*.5-y/(ry+.01)*.7;let k=l>.5?5:l>.15?4:l>-.2?3:l>-.5?2:1;if(d>.78&&(x>0||y>0))k=Math.max(0,k-1);
    if(((x*2+y*3)%7===0)&&k>1&&d<.6)k--;if(Math.abs(x+y*.6+1)<.8&&l>0)k=6;p(cx+x,cy+y,HR[k]);}}
function extras(S,topY,hw){if(S.bun)blobH(CX+.5,topY-1,7,5);if(S.knot){blobH(CX+.5,topY-3,5,5);for(let j=0;j<3;j++){p(CX,topY+2+j,AC[3]);p(CX+1,topY+2+j,AC[2]);}}
  if(S.buns)for(const s of [-1,1])blobH(CX+.5+s*13,topY+3,6,6);
  if(S.crest)for(let y=topY-8;y<EYE-8;y++)for(let x=-3;x<3;x++){const tip=((x+y+40)%5===0)?2:0;if(y<topY-8+tip)continue;p(CX+.5+x,y,HR[x<-1?6:x<1?5:3]);}
  if(S.tail){for(const s of [1])for(let j=0;j<16;j++){const x=CX+hw-2+Math.round(Math.sin(j*.25)*2),y=EYE-6+j;for(let i=-2;i<=2;i++)p(x+i,y,HR[i<0?5:i>0?2:4]);}p(CX+hw-3,EYE-7,AC[4]);p(CX+hw-2,EYE-7,AC[3]);}
  if(S.braids)for(const s of [-1,1]){const x0=s<0?CX-15:CX+16;for(let y=EYE+4;y<PH;y++){const ph=(y>>1)&1;for(let i=-2;i<=2;i++)p(x0+i,y,HR[((i+ph+5)%3===0)?5:((i+ph+5)%3===1)?3:1]);}}
  if(S.pigs)for(const s of [-1,1]){const x0=s<0?CX-19:CX+20;for(let j=0;j<20;j++){const w=j<3?3:j<15?4:2;for(let i=-w;i<=w;i++)p(x0+i+s*Math.round(j*.3),EYE-2+j,HR[i<-1?5:i>1?2:((i+j)%4===0?3:4)]);}for(let i=-1;i<=1;i++)p(x0+i,EYE-3,AC[4]);}}
// ---------------------------------------------------------------- facial hair, glasses, hats, accessories
function beard(){const bt=C.beard===true?'full':C.beard;if(!bt)return;const R=HR,mx=CX+.5,my=EYE+12;
  if(bt==='stubble'){for(let y=EYE+8;y<=CHIN;y++){const hw=faceHW(y);for(let x=Math.floor(CX-hw+1);x<=Math.ceil(CX+hw-1);x++)if(((x+y*3)%3===0)&&!(y>=my-1&&y<=my+2&&Math.abs(x+.5-mx)<5))p(x,y,mix(SK[3],R[2],.6));}return;}
  const mst=()=>{for(let x=-7;x<7;x++){const ax=Math.abs(x+.5);const yy=my-3+Math.round(ax*.18);for(let j=0;j<3;j++)p(mx+x,yy+j,R[j===0?(x<0?5:4):j===1?3:1]);}p(mx-8,my,R[2]);p(mx+7,my,R[1]);};
  if(bt==='moustache'){mst();return;}
  if(bt==='goatee'){mst();for(let y=my+3;y<=CHIN+2;y++){const hw=4-Math.max(0,y-CHIN)*1.5;for(let x=-Math.ceil(hw);x<Math.ceil(hw);x++)p(mx+x,y,R[x<-1?5:x>1?2:((x+y)%3===0?3:4)]);}return;}
  // full: along the jaw and over the chin, thick and lit at the left, the mouth left clear
  for(let y=EYE+3;y<=CHIN+4;y++){const hw=y>CHIN?faceHW(CHIN-1)+1-(y-CHIN)*1.6:faceHW(y)+1;for(let x=Math.floor(CX-hw);x<=Math.ceil(CX+hw);x++){const dx=x+.5-mx,ax=Math.abs(dx);
      if(y<EYE+9&&ax<faceHW(y)-3)continue;if(y>=my-1&&y<=my+2&&ax<5)continue;const u=dx/(hw||1);let k=u<-.5?5:u>.5?2:((x*3+y*5)%7===0?2:4);if(y>CHIN+2)k=Math.max(1,k-1);p(x,y,R[k]);}}
  mst();}
function glasses(){const gt=C.glasses===true?'round':C.glasses;if(!gt)return;const F=gt==='shades'?[[20,16,22],[40,36,44]]:[[44,36,46],[78,70,84]];
  for(const s of [-1,1]){const x0=s<0?CX-12:CX+2,y0=EYE-2;const w=10,h=8;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const edge=i===0||i===w-1||j===0||j===h-1;const corner=(i===0||i===w-1)&&(j===0||j===h-1);
      if(gt==='round'&&corner)continue;if(edge)p(x0+i,y0+j,j===0||i===0?F[1]:F[0]);else if(gt==='shades')p(x0+i,y0+j,(i+j)<5?[70,70,90]:F[0]);else if(i===1&&j<3)p(x0+i,y0+j,[230,240,250]);}}
  for(let i=0;i<4;i++)p(CX-2+i,EYE-1,F[1]);p(CX-13,EYE,F[1]);p(CX-14,EYE,F[1]);p(CX+12,EYE,F[1]);p(CX+13,EYE,F[1]);}
function hat(){const h=C.hat;if(!h)return;const S=hairStyle()||{vol:2,crown:4};const top=FT-S.crown-2,brim=EYE-8;
  const R=h==='sheriff'?ramp7('#a07848'):h==='straw'?ramp7('#d8b060'):h==='top'?ramp7('#2a2630'):HT;
  const dome=(t,b,rx)=>{for(let y=t;y<=b;y++)for(let x=-rx;x<rx;x++){const yy=(y-b)/(b-t+1),xx=(x+.5)/rx;if(xx*xx+yy*yy>1.02)continue;const l=-xx*.55-yy*.45;p(CX+.5+x,y,R[l>.55?5:l>.2?4:l>-.2?3:l>-.5?2:1]);}};
  if(h==='cap'){dome(top+3,brim-1,16);for(const sx of [-8,0,8])for(let y=top+5;y<brim-1;y++)if(g(CX+.5+sx+(y-top)*sx*.02,y))p(CX+.5+sx+(y-top)*sx*.02,y,R[2]);
    p(CX,top+3,R[5]);p(CX+1,top+3,R[5]);for(let x=-16;x<16;x++)p(CX+.5+x,brim-1,R[1]);
    // the visor: a lit curve sticking out toward you, darker underneath
    for(let x=-15;x<15;x++){const ax=Math.abs(x+.5),dip=Math.round(Math.pow(ax/15,2)*-3+3);for(let j=0;j<4;j++)p(CX+.5+x,brim+dip-3+j,R[j===0?5:j===1?4:j===2?3:1]);}
    for(let x=-12;x<12;x++){const c=g(CX+.5+x,brim+2);if(c)p(CX+.5+x,brim+2,SK[2]);}}
  if(h==='beanie'){dome(top-2,brim+1,17);for(let x=-17;x<17;x++)for(let j=0;j<4;j++)p(CX+.5+x,brim-2+j,R[j===3?1:(x&1)?3:4]);for(let x=-14;x<14;x+=3)for(let y=top+2;y<brim-2;y++)if(g(CX+.5+x,y))p(CX+.5+x,y,R[2]);for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++)if(x*x+y*y<=9)p(CX+.5+x,top-4+y,R[(x+y)<0?5:3]);}
  if(h==='bucket'){dome(top-1,brim-1,16);for(let x=-22;x<22;x++){const dn=Math.abs(x+.5)>16?Math.round((Math.abs(x+.5)-16)*.5):0;p(CX+.5+x,brim-1+dn,R[x<-10?5:x>10?2:4]);p(CX+.5+x,brim+dn,R[2]);p(CX+.5+x,brim+1+dn,R[0]);}}
  if(h==='straw'){dome(top-1,brim-2,15);for(let x=-15;x<15;x++){p(CX+.5+x,brim-4,[120,40,30]);p(CX+.5+x,brim-3,[90,30,20]);}for(let x=-28;x<28;x++){const dn=Math.abs(x+.5)>20?1:0;p(CX+.5+x,brim-2+dn,R[x<-14?5:x>14?2:((x&1)?3:4)]);p(CX+.5+x,brim-1+dn,R[(x&1)?2:3]);p(CX+.5+x,brim+dn,R[0]);}}
  if(h==='cowboy'||h==='sheriff'){for(let y=top-4;y<brim-1;y++){const w=y<top-1?11:14;for(let x=-w;x<w;x++){if(y===top-4&&Math.abs(x+.5)<4)continue;p(CX+.5+x,y,R[x<-6?5:x>6?2:4]);}}for(let x=-14;x<14;x++)p(CX+.5+x,brim-2,[44,30,22]);
    for(let x=-27;x<27;x++){const up=Math.abs(x+.5)>20?Math.round((Math.abs(x+.5)-20)*.6):0;p(CX+.5+x,brim-1-up,R[x<-12?5:x>12?2:4]);p(CX+.5+x,brim-up,R[1]);}
    if(h==='sheriff')for(const [dx,dy,c] of [[0,-6,[255,226,120]],[-1,-5,[255,226,120]],[1,-5,[220,170,60]],[0,-5,[255,240,170]],[0,-4,[200,150,40]],[-2,-5,[220,170,60]],[2,-5,[220,170,60]]])p(CX+.5+dx,brim+dy,c);}
  if(h==='top'){for(let y=top-12;y<brim-1;y++)for(let x=-12;x<12;x++)p(CX+.5+x,y,R[x<-7?5:x>7?2:4]);for(let x=-12;x<12;x++){p(CX+.5+x,brim-5,[140,30,30]);p(CX+.5+x,brim-4,[100,20,20]);}for(let x=-20;x<20;x++){p(CX+.5+x,brim-1,R[x<0?4:2]);p(CX+.5+x,brim,R[0]);}}}
function acc(){const a=C.accessory;if(!a)return;const R=AC;const S=hairStyle()||{vol:2,crown:4};const topY=FT-S.crown;
  if(a==='bow'){const bx=CX+11,by=topY+4;for(const s of [-1,1])for(let j=-4;j<=4;j++)for(let i=1;i<=6;i++){if(Math.abs(j)>6-i)continue;p(bx+s*i,by+j,R[s<0?(j<0?5:4):(j<0?3:2)]);}for(let j=-1;j<=1;j++){p(bx,by+j,R[1]);p(bx+1,by+j,R[2]);}}
  if(a==='flower'){const fx=CX-13,fy=EYE-9;for(const [dx,dy] of [[0,-2],[-2,0],[2,0],[0,2],[-1,-1],[1,-1],[-1,1],[1,1],[0,-3],[-3,0],[3,0],[0,3]])p(fx+dx,fy+dy,R[(dx+dy)<0?5:4]);for(const [dx,dy] of [[0,0],[1,0],[0,1]])p(fx+dx,fy+dy,[250,220,90]);}
  if(a==='headband'){for(let x=-16;x<16;x++){const yy=topY+6+Math.round(Math.pow(Math.abs(x+.5)/16,2)*6);for(let j=0;j<3;j++)p(CX+.5+x,yy+j,R[j===0?5:j===1?4:2]);}}
  if(a==='scarf'||a==='bandana'){const y0=CHIN-1;for(let x=-11;x<11;x++)for(let j=0;j<5;j++){const yy=y0+j+Math.round(Math.abs(x+.5)*.15);p(CX+.5+x,yy,R[j===0?5:j===4?2:(x<-5?5:x>5?3:4)]);}
    if(a==='scarf'){for(let x=-11;x<11;x+=4)for(let j=1;j<4;j++)p(CX+.5+x+j*.3,y0+j+Math.round(Math.abs(x+.5)*.15),R[2]);
      for(let j=4;j<16;j++){const w=5-(j>12?1:0),sx=CX+4+Math.round(Math.sin(j*.4));for(let i=0;i<w;i++)p(sx+i,y0+j,R[i===0?5:i===w-1?2:((j)%4===0?3:4)]);}for(let i=0;i<5;i++)p(CX+4+i,y0+16,R[(i&1)?1:5]);}else for(let j=5;j<12;j++){const w=8-j*.6;for(let x=-Math.ceil(w);x<Math.ceil(w);x++)p(CX+.5+x,y0+j,R[(x+j)%4===0?5:3]);}}
  if(a==='necklace'){for(let x=-8;x<8;x++){const yy=CHIN+4+Math.round((1-Math.pow((x+.5)/8,2))*5);p(CX+.5+x,yy,R[5]);}p(CX,CHIN+10,[255,255,255]);p(CX+1,CHIN+10,R[4]);p(CX,CHIN+11,R[3]);p(CX+1,CHIN+11,R[2]);}}
// ---------------------------------------------------------------- render each expression: back hair, clothes, face, front hair, extras, outline
EXS.forEach((ex,i)=>{L=layer('p',PW,PH);hair(false);torso();head(ex);beard();hair(true);glasses();acc();hat();
  // a dark outline round everything, then a lighter inner edge on the very outside of hair and clothes
  const O=layer('o',PW,PH);for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){if(G(L,x,y))continue;for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const c=G(L,x+dx,y+dy);if(c){P(O,x,y,outlineRGB(c));break;}}}
  const F=flatten([L,O],PW,PH);for(let y=0;y<PH;y++)for(let x=0;x<PW;x++){const c=G(F,x,y);if(c)P(SHEET,i*PW+x,y,c,c[3]);}});
emit([SHEET],CFG.out);console.log('META '+JSON.stringify({pw:PW,ph:PH,expr:EXS}));
