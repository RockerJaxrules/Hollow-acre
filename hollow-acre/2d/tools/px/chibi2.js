// ---- Hollow Acre characters, second generation: villagers after Stardew's (big clumped hair framing a small squared face, compact body) with a real walk and run cycle,
// braced tool swings, kneeling to plant, and breathing at rest. Every frame is drawn into separate part layers
// (body+outfit, beard, hair, glasses, hat, the tool in front) so the player can be assembled from any combination at runtime.
// CFG: look, tool, part ('all' | 'body' | 'beard' | 'hair' | 'glasses' | 'hat' | 'toolf'), out.
SEED=CFG.seed||3;
const C=CFG.look,KID=!!C.kid,PART=CFG.part||'all',TOOL=CFG.tool||null;
const FW=48,FH=64,D4=['N','W','S','E'];
const CLIPS=[['walk',D4,9],['run',D4,9],['idle',D4,4],['thrust',D4,8],['slash',D4,6],['hurt',['S'],6],['spellcast',D4,7],['sit',D4,3]];
const ROWS=[];for(const [n,ds,nf] of CLIPS)for(const d of ds)ROWS.push([n,d,nf]);
const SW=FW*9,SH=FH*ROWS.length;
const SHEET=layer('sheet',SW,SH);
// ---- shared with custom.js: hue-shifted five-step ramps (deep, shadow, mid, base, light) and the outline colour
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
const OUT=C.outfit||(C.overalls?'overalls':C.coat?'jacket':C.plaid?'flannel':(C.skirt?'dress':'tee'));
const JK=C.coat?ramp(C.coatColor||C.shirt||'#3a3a40'):EX;        // jacket cloth
const INNER=C.coat?ramp(C.inner||'#d8d0c0'):SHT;                 // shirt under the jacket
const BELT=[[40,26,16],[62,40,26],[96,64,38]],BUCKLE=[[150,118,52],[222,190,96]];
const WHITE=[238,234,226],BLUSH=[232,138,128],LASH=[34,24,26];
// ---- part layers for the frame being drawn
const PARTS=['body','beard','hair','acc','glasses','hat','toolf'];
let LY={},CUR='body';
const p=(x,y,c)=>{if(c)P(LY[CUR],Math.round(x),Math.round(y),c);};
const g=(x,y)=>G(LY[CUR],Math.round(x),Math.round(y));
const into=(part,fn)=>{const o=CUR;CUR=part;fn();CUR=o;};
const dk=(R,d)=>R.map((c,i)=>R[Math.max(0,Math.min(4,i-d))]);      // same ramp, shifted darker (far limbs)
// ---- shapes
function blob(cx,cy,rx,ry,R,flat){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=(x*x)/(rx*rx+.01)+(y*y)/(ry*ry+.01);if(d>1)continue;
    const l=-x/(rx+.01)*.55-y/(ry+.01)*.7;let k=flat?3:(l>.5?4:l>0?3:l>-.5?2:1);if(d>.75&&(x>0||y>0))k=Math.max(0,k-1);p(cx+x,cy+y,R[k]);}}
// a limb of width w along a segment, lit on its left/top edge
function seg(x0,y0,x1,y1,w,R){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2));const vert=Math.abs(y1-y0)>=Math.abs(x1-x0);
  for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;for(let k=0;k<w;k++){const ki=w===1?3:k===0?4:k===w-1?1:(w>3&&k===w-2)?2:3;
      if(vert)p(Math.round(x)+k-(w>>1),Math.round(y),R[ki]);else p(Math.round(x),Math.round(y)+k-(w>>1),R[ki]);}}}
// ---------------------------------------------------------------- proportions after Stardew's villagers (16x32 drawn at 1.5x): head with hair ~45% of the height,
// a narrow squared face framed by big clumped hair, a compact body, short legs and chunky shoes. Everything outlined, inside and out.
const HIP0=KID?49:48,TH=KID?10:12,ANK=56,LT=KID?3.8:4.4,LS=KID?3.8:4.4,TW=KID?12:14,TWS=KID?8:10,HANG=KID?9:11;
const FX=KID?7:8,FY0=KID?-6:-7,FY1=KID?5:6,HW=KID?10:11,HTOP=KID?-13:-14;   // face half-width / top / chin, hair half-width / top (relative to the eye line hy)
const HEADUP=FY1+2;                                                       // hy = shoulders - HEADUP
const HR_X=FX,HR_Y=FY1;
// face: a rounded rectangle, soft top corners, a rounded chin
const faceInset=y=>{const t=y-FY0,b=FY1-y;return t===0?2:t===1?1:b===0?4:b===1?3:b===2?1:b===3?1:0;};
const faceIn=(x,y)=>y>=FY0&&y<=FY1&&Math.abs(x)<=FX-faceInset(y);
// ---- shirt patterns: every shirt pixel belongs to one of 8 phases (row%4, column%4===1) measured on the torso. The player's layers give each phase
// its own base colour, so custom.js can make any top plain, plaid, striped or dotted; NPC sheets bake their pattern in.
const PAT=C.pattern||(C.plaid?'plaid':'');
const shiftR=(R,d)=>R.map((c,i)=>R[Math.max(0,Math.min(4,i-d))]);
const patShift=(pat,cls)=>{const jm=cls>>1,v=cls&1;if(pat==='plaid')return (v?1:0)+(jm===2?1:0);if(pat==='stripes')return jm<2?1:0;if(pat==='dots')return (v&&jm===1)?-1:0;return 0;};
const SHIRT_BASES=['#b8402c','#b8462c','#b84c2c','#b8522c','#b8582c','#b85e2c','#b8642c','#b86a2c'];
const PLAYER=PART!=='all';
const SHTC=PLAYER?SHIRT_BASES.map(ramp):[0,1,2,3,4,5,6,7].map(cls=>shiftR(SHT,patShift(PAT,cls)));
const shirtAt=(i,j)=>SHTC[((((j|0)%4)+4)%4)*2+((((i|0)%4)+4)%4===1?1:0)];
const LONG=!['tee','dress','tank','skirt'].includes(OUT)||C.longSleeves;
const OVER={jacket:1.5,vest:2.5,cardigan:2.5,longcoat:1.5};
// ---- legs: thigh and shin by two-bone IK (knees forward in profile, outward when squatting face-on); a chunky shoe on the end
function leg(hx,hy,fx,fy,side,fl,far,stance,out,knee,rev){const R=far?dk(LEGR(),1):LEGR();const d=Math.hypot(fx-hx,fy-hy);let kx=(hx+fx)/2,ky=(hy+fy)/2;
  if(knee){kx=knee[0];ky=knee[1];}else if(d<LT+LS&&(side||SQUAT)){const h=Math.sqrt(Math.max(0,LT*LT-(d/2)*(d/2)));const nx=-(fy-hy)/d,ny=(fx-hx)/d;const s=side?((nx*fl>0)?1:-1):((nx*out>0)?1:-1);kx+=nx*h*s*(side?1:1.2);ky+=ny*h*s;}
  const w=side?5:(KID?5:6);seg(hx,hy,kx,ky,w,R);seg(kx,ky,fx,fy,w,R);
  if(!side){const inner=out<0?Math.round(hx)+(w>>1)-1:Math.round(hx)-(w>>1);for(let y=Math.round(hy)+1;y<=Math.round(fy);y++)if(g(inner,y))p(inner,y,R[0]);}
  if(!(rev&&!side))shoe(fx,fy,side,rev?-fl:fl,far);
  if(knee&&!side){p(Math.round(kx)-1,Math.round(ky),R[4]);p(Math.round(kx),Math.round(ky),R[4]);}}
const LEGR=()=>(OUT==='dress'||OUT==='skirt'||C.skirt)?SK:PNT;
function shoe(fx,fy,side,fl,far){const R=far?dk(SHO,1):SHO;const x=Math.round(fx),y=Math.round(fy)+1;
  if(side){const len=KID?6:7;for(let i=0;i<len;i++){const xx=x+fl*(i-2);p(xx,y,R[i===0?1:3]);p(xx,y+1,R[i===len-1?3:2]);p(xx,y+2,R[0]);}p(x+fl*(len-3),y,R[4]);p(x+fl*(len-4),y,R[4]);}
  else{const w=KID?5:6;for(let i=0;i<w;i++){const k=i<=1?4:i===w-1?1:3;p(x-3+i,y,R[k]);p(x-3+i,y+1,R[Math.max(1,k-1)]);p(x-3+i,y+2,R[0]);}}}
// ---- arms: thick sleeves (patterned with the shirt), cuffs, small square hands
function arm(sx,sy,hx2,hy2,out,far,edge){const cloth=(OUT==='jacket'||OUT==='cardigan'||OUT==='longcoat')?'jk':'shirt';const S2=far?dk(SK,1):SK;
  const mx=(sx+hx2)/2+out*.5,my=(sy+hy2)/2;const n=Math.max(1,Math.ceil(Math.hypot(hx2-sx,hy2-sy)*2));const AW=KID?3:4;
  const clothAt=(x,y)=>{const R=cloth==='jk'?JK:shirtAt(x,y);return far?dk(R,1):R;};
  for(let i=0;i<=n;i++){const t=i/n;const x=t<.5?sx+(mx-sx)*t*2:mx+(hx2-mx)*(t-.5)*2,y=t<.5?sy+(my-sy)*t*2:my+(hy2-my)*(t-.5)*2;
    const sleeve=OUT==='tank'?false:LONG?t<.86:t<.45;for(let k=0;k<AW;k++){const xx=Math.round(x)+k-(AW>>1),yy=Math.round(y);const R=sleeve?clothAt(xx,yy):S2;p(xx,yy,R[k===0?4:k===AW-1?1:k===1?3:2]);}
    if(edge)p(Math.round(x)+edge*(AW-1),Math.round(y),(sleeve?clothAt(x,y):S2)[0]);}
  if(OUT!=='tank'){const t=LONG?.86:.45;const x=t<.5?sx+(mx-sx)*t*2:mx+(hx2-mx)*(t-.5)*2,y=t<.5?sy+(my-sy)*t*2:my+(hy2-my)*(t-.5)*2;const rib=OUT==='sweater'||OUT==='hoodie'||OUT==='turtleneck'||OUT==='cardigan';
    for(let k=0;k<AW;k++){const R=clothAt(x,y);p(Math.round(x)+k-(AW>>1),Math.round(y),R[rib&&(k&1)?2:1]);if(rib)p(Math.round(x)+k-(AW>>1),Math.round(y)-1,R[(k&1)?1:2]);}}
  for(let j=0;j<3;j++)for(let i=-1;i<=AW-2;i++)p(hx2+i,hy2+j,S2[j===2?1:i===-1?4:i===AW-2?2:3]);}
// ---- torso with the outfit on it
function torso(cx,ty,dir,fl,hipY){const side=dir==='E'||dir==='W',back=dir==='N';const w=side?TWS:TW;const h=hipY-ty+1;const x0=Math.round(cx-w/2);
  const ow=(j)=>OUT==='tank'?(j<2?w-6:w-1):j===0?w-6:j===1?w-4:j===2?w-2:w;const over=!!OVER[OUT],open=OUT==='openshirt';
  for(let j=0;j<h;j++){const ww=ow(j);for(let i=0;i<ww;i++){const x=x0+((w-ww)>>1)+i,y=ty+j;const ii=x-x0;
      let k=i<2?4:i>=ww-1?1:i>=ww-3?2:3;if(j>=h-2)k=Math.max(1,k-1);
      let R=over?JK:shirtAt(ii,j);
      if(over&&!back&&!side&&Math.abs(x-cx+.5)<=OVER[OUT]&&j<h-1)R=shirtAt(ii,j);
      if(over&&side&&(x-cx)*fl>w/2-3&&j<h-2)R=shirtAt(ii,j);
      if(open&&!back&&!side&&Math.abs(x-cx+.5)<=2.5)R=EX;if(open&&side&&(x-cx)*fl>w/2-3)R=EX;
      p(x,y,R[k]);}}
  const S0=SHTC[0];
  if(!back)for(let i=-3;i<=2;i++)p(cx+i+(side?fl*2:0),ty,(over?JK:S0)[1]);                    // the chin's shadow on the collar
  if(OUT==='overalls'){const R=PNT;const bw=side?5:8,bx=side?Math.round(cx-(bw>>1)+fl):Math.round(cx-(bw>>1));
    for(let j=back?6:4;j<h;j++)for(let i=0;i<bw;i++)p(bx+i,ty+j,R[i===0?4:i===bw-1?1:j===4&&!back?2:3]);
    if(!side){for(const sx2 of [x0+3,x0+w-4])for(let j=1;j<5;j++)p(sx2,ty+j,R[j===1?3:2]);if(!back){p(x0+3,ty+4,BUCKLE[1]);p(x0+w-4,ty+4,BUCKLE[1]);p(cx,ty+7,R[1]);p(cx-1,ty+7,R[1]);}}
    else for(let j=1;j<5;j++)p(Math.round(cx),ty+j,R[2]);}
  if(OUT==='jacket'){for(let j=h;j<h+3;j++)for(let i=0;i<w;i++){const x=x0+i;if(!back&&!side&&Math.abs(x-cx+.5)<=1.5)continue;p(x,ty+j,JK[i<2?3:i>=w-2?1:2]);}
    if(!back&&!side){for(let j=0;j<5;j++){p(cx-2,ty+j,JK[4]);p(cx+1,ty+j,JK[1]);}p(x0+2,ty+7,JK[1]);p(x0+3,ty+7,JK[1]);p(x0+w-4,ty+7,JK[1]);}}
  if(OUT==='vest'&&!back&&!side){for(let j=2;j<h-1;j+=3){p(cx-3,ty+j,BUCKLE[1]);}for(let j=0;j<h;j++){p(cx-3,ty+j,j%3===2?BUCKLE[1]:JK[4]);p(cx+2,ty+j,JK[1]);}p(x0+3,ty+6,JK[1]);p(x0+w-4,ty+6,JK[1]);}
  if(OUT==='hoodie'){if(!back&&!side){for(let i=-5;i<=4;i++){p(cx+i,ty,S0[i<-2?3:i>1?1:2]);p(cx+i,ty+1,S0[Math.abs(i+.5)<3?0:2]);}for(const dx of [-2,1])for(let j=2;j<6;j++)p(cx+dx,ty+j,j===5?S0[4]:WHITE);
      const py=ty+h-6;for(let i=3;i<w-3;i++){p(x0+i,py,S0[1]);p(x0+i,py+4,S0[1]);}for(let j=0;j<5;j++){p(x0+3,py+j,S0[1]);p(x0+w-4,py+j,S0[1]);}}
    else if(back){for(let j=0;j<5;j++){const hw=5-(j>3?1:0);for(let i=-hw;i<hw;i++)p(cx+i,ty+j,S0[j===4?1:i<-2?4:i>1?2:3]);}}
    else for(let j=0;j<4;j++)for(let i=0;i<3;i++)p(cx-fl*(w/2-1)-fl*i*0+(fl>0?-i:i),ty+j,S0[i===0?3:2]);
    for(let i=0;i<w;i++){p(x0+i,hipY-1,S0[(i&1)?1:2]);}}
  if(OUT==='sweater'){for(let i=0;i<w;i++){p(x0+i,hipY,S0[(i&1)?1:2]);p(x0+i,hipY-1,S0[(i&1)?2:3]);}if(!back&&!side){for(let i=-2;i<=1;i++){p(cx+i,ty,SK[2]);p(cx+i,ty+1,S0[1]);}p(cx-3,ty,S0[1]);p(cx+2,ty,S0[1]);}}
if(OUT==='tank'&&!back&&!side){for(const sx2 of [x0+3,x0+w-4]){p(sx2,ty,S0[3]);p(sx2,ty+1,S0[2]);}for(let i=4;i<w-4;i++)p(x0+i,ty+1,SK[2]);for(let i=5;i<w-5;i++)p(x0+i,ty+2,S0[1]);}
  if(OUT==='turtleneck'){for(let j=-2;j<=1;j++)for(let i=-3;i<=2;i++){const xx=cx+i+(side?fl:0);p(xx,ty+j,S0[j===-2?4:(i&1)?2:3]);}if(!back)for(let i=-3;i<=2;i++)p(cx+i+(side?fl:0),ty+2,S0[1]);
    for(let i=0;i<w;i++){p(x0+i,hipY,S0[(i&1)?1:2]);p(x0+i,hipY-1,S0[(i&1)?2:3]);}}
  if(OUT==='cardigan'){for(let i=0;i<w;i++){if(!back&&!side&&Math.abs(x0+i-cx+.5)<=2.5)continue;p(x0+i,hipY,JK[(i&1)?1:2]);p(x0+i,hipY+1,JK[(i&1)?0:1]);}
    if(!back&&!side){for(let j=1;j<h;j++){p(cx-3,ty+j,JK[4]);p(cx+2,ty+j,JK[1]);}for(let j=3;j<h;j+=3)p(cx-3,ty+j,WHITE);for(let i=-2;i<=1;i++)p(cx+i,ty,SK[2]);}}
  if(OUT==='openshirt'&&!back&&!side){for(let j=0;j<h;j++){p(cx-3,ty+j,S0[4]);p(cx+2,ty+j,S0[1]);}p(cx-4,ty,WHITE);p(cx-3,ty+1,WHITE);p(cx+3,ty,[214,208,198]);p(cx+2,ty+1,[214,208,198]);for(let i=-2;i<=1;i++)p(cx+i,ty,SK[2]);for(let i=-2;i<=1;i++)p(cx+i,ty+1,EX[1]);}
  if(OUT==='longcoat'){const len=KID?6:9;for(let j=h;j<h+len;j++){const ww=w+Math.round((j-h)*.35);for(let i=0;i<ww;i++){const x=Math.round(cx-ww/2)+i;if(!back&&!side&&Math.abs(x-cx+.5)<=1.5)continue;if(back&&Math.abs(x-cx+.5)<.6&&j>h+3)continue;p(x,ty+j,JK[i<2?4:i>=ww-2?1:i>=ww-4?2:3]);}}
    for(let i=0;i<w+4;i++)p(Math.round(cx-(w+4)/2)+i,ty+h+len-1,JK[0]);
    if(!back&&!side){for(let j=0;j<6;j++){p(cx-2,ty+j,JK[4]);p(cx+1,ty+j,JK[1]);}p(cx-3,ty,JK[4]);p(cx+2,ty,JK[1]);for(let j=4;j<h+len;j+=4)p(cx-3,ty+j,BUCKLE[0]);p(x0+2,ty+h+2,JK[1]);p(x0+w-3,ty+h+2,JK[1]);}}
  if(OUT==='skirt'){const R=PNT;const top=hipY-1,len=KID?5:7;for(let j=0;j<len;j++){const ww=w+Math.round(j*.8);for(let i=0;i<ww;i++){let k=i<2?4:i>=ww-2?1:i>=ww-4?2:3;if(j===len-1)k=0;else if(((i+(j>>1))%3===0)&&j>0)k=Math.max(1,k-1);p(Math.round(cx-ww/2)+i,top+j,R[k]);}}for(let i=0;i<w;i++)p(x0+i,top,BELT[i<2?2:i>=w-2?0:1]);}
  if(OUT==='dress'||C.skirt){const R=C.skirt?SKR:PNT;const top=ty+h-3,len=KID?6:8;for(let j=0;j<len;j++){const ww=w+Math.round(j*.7);for(let i=0;i<ww;i++){let k=i<2?4:i>=ww-2?1:i>=ww-4?2:3;if(j===len-1)k=0;else if((i%4===1)&&j>1)k=Math.max(1,k-1);p(Math.round(cx-ww/2)+i,top+j,R[k]);}}}
  if(C.apron&&!back){const R=EX;const aw=w-6,top=ty+3,len=h-1+(C.skirt||OUT==='dress'?5:1);for(let j=0;j<len;j++)for(let i=0;i<(side?2:aw);i++){const x=side?Math.round(cx+fl*(w/2-1))-(fl>0?i:-i):x0+3+i;p(x,top+j,R[i===0?4:i===aw-1?1:j===0?4:3]);}
    if(!side){p(x0+2,top,R[2]);p(x0+w-3,top,R[2]);}}
  if(OUT==='tee'||OUT==='flannel'||OUT==='shirt'||OUT==='openshirt'){const y=hipY-1;for(let i=0;i<w;i++)p(x0+i,y,BELT[i<2?2:i>=w-2?0:1]);if(!back&&!side){p(cx-1,y,BUCKLE[1]);p(cx,y,BUCKLE[1]);p(cx-1,y-1,BUCKLE[0]);p(cx,y-1,BUCKLE[0]);}}
  if(!back&&!side){
    if(OUT==='tee'||OUT==='dress'||OUT==='overalls'||OUT==='skirt'){for(let i=-2;i<=1;i++)p(cx+i,ty,SK[2]);p(cx-3,ty,S0[0]);p(cx+2,ty,S0[0]);for(let i=-2;i<=1;i++)p(cx+i,ty+1,S0[0]);}
    if(OUT==='flannel'||OUT==='shirt'||OUT==='vest'){p(cx-1,ty,SK[2]);p(cx,ty,SK[2]);p(cx-3,ty,WHITE);p(cx-2,ty,WHITE);p(cx-2,ty+1,WHITE);p(cx+1,ty,[214,208,198]);p(cx+2,ty,[214,208,198]);p(cx+1,ty+1,[214,208,198]);p(cx-1,ty+1,S0[0]);p(cx,ty+1,S0[0]);
      if(OUT!=='vest'){for(let j=2;j<h-2;j++)p(cx,ty+j,S0[1]);for(let j=3;j<h-2;j+=3)p(cx-1,ty+j,WHITE);p(x0+2,ty+4,S0[1]);p(x0+3,ty+4,S0[1]);}}
    if(C.collar){for(let i=-2;i<=1;i++)p(cx+i,ty,WHITE);}
    if(C.badge){p(cx-4,ty+3,[255,228,120]);p(cx-3,ty+3,[240,200,80]);p(cx-4,ty+4,[200,150,40]);p(cx-3,ty+2,[255,228,120]);}}
  if(back){for(let i=-2;i<=1;i++)p(cx+i,ty,SK[1]);if(OUT!=='hoodie')for(let j=2;j<h-2;j++)p(cx,ty+j,(over?JK:S0)[2]);}}
// ---- head and face
function head(hx,hy0,dir,fl,pose){const side=dir==='E'||dir==='W',back=dir==='N';let hy=hy0;
  // neck
  for(let j=FY1-1;j<=FY1+1;j++)for(let i=-2;i<=1;i++)p(hx+i-(side?fl:0),hy+j,SK[1]);
  const fin=side?((x,y)=>faceIn(Math.round(x*fl*SQ),y)):faceIn;
  for(let y=FY0;y<=FY1;y++)for(let x=-FX-1;x<=FX+1;x++){if(!fin(x,y))continue;const xs=side?x*fl:x;
    let k=3;if(!side){if(xs<-FX+3&&y>-4&&y<4)k=4;if(xs>FX-3)k=2;if(xs>FX-2&&y>1)k=1;}else{if(xs<-4)k=2;if(xs>=FX-8&&xs<=FX-5&&y>=-3&&y<=2)k=4;if(xs>=FX-3&&y>3)k=2;}if(y>=FY1-1)k=Math.min(k,2);if(y===FY1)k=1;p(hx+x,hy+y,SK[k]);}
  // the skull above the forehead
  for(let y=-13;y<FY0+2;y++)for(let u=-FX-2;u<=FX+2;u++){if(!CRAN(u,y,0,side))continue;if(side&&u<-FX+1)continue;const sx2=hx+(side?u*fl:u);if(g(sx2,hy+y))continue;let k=3;if(u<-3&&y<-6)k=4;if(u>FX-3)k=2;p(sx2,hy+y,SK[k]);}
  // ears
  if(!side){for(const s of [-1,1]){const ex=hx+s*(FX+1);p(ex,hy,SK[s<0?3:2]);p(ex,hy+1,SK[1]);p(ex,hy+2,SK[s<0?3:2]);p(ex,hy+3,SK[2]);}}
  else{const ex=hx-fl*3;p(ex,hy,SK[3]);p(ex,hy+1,SK[1]);p(ex,hy+2,SK[1]);p(ex,hy+3,SK[2]);p(ex-fl,hy,SK[2]);p(ex-fl,hy+1,SK[3]);p(ex-fl,hy+2,SK[3]);p(ex-fl,hy+3,SK[1]);}
  if(back)return;
  if(pose.nod)hy+=1;
  const blink=pose.blink,hollow=C.hollowEyes,EY=hollow?[[6,4,6],[10,8,10],[14,12,14],[20,18,22],[30,28,32]]:EYR,SCL=hollow?[16,12,16]:WHITE;
  const LIP=SK[0];
  if(dir==='S'){
    // eyes: a lash line, white on the outer side, a two-pixel iris that lightens toward the bottom, a glint
    for(const s of [-1,1]){const x0=s<0?hx-6:hx+3,wx=s<0?x0:x0+2,ix=s<0?x0+1:x0;
      if(blink){for(let i=0;i<3;i++)p(x0+i,hy+2,LASH);p(s<0?x0-1:x0+3,hy+1,LASH);continue;}
      for(let i=0;i<3;i++)p(x0+i,hy,LASH);p(s<0?x0-1:x0+3,hy,LASH);p(s<0?x0-1:x0+3,hy-1,LASH);
      p(wx,hy+1,SCL);p(wx,hy+2,SCL);
      p(ix,hy+1,EY[0]);p(ix+1,hy+1,EY[0]);p(ix,hy+2,EY[1]);p(ix+1,hy+2,EY[2]);p(ix,hy+3,EY[3]);p(ix+1,hy+3,EY[2]);
      if(!hollow)p(s<0?ix+1:ix,hy+2,[255,255,255]);
      p(x0,hy+4,SK[2]);p(x0+1,hy+4,SK[2]);p(x0+2,hy+4,SK[2]);}
    // brows, a little arched
    for(const s of [-1,1]){const bx=s<0?hx-6:hx+3;p(bx+(s<0?0:2),hy-1,HR[1]);p(bx+1,hy-2,HR[1]);p(bx+(s<0?2:0),hy-2,HR[1]);p(bx+(s<0?-1:3),hy-1,HR[2]);}
    p(hx,hy+4,SK[1]);p(hx-1,hy+3,SK[4]);                                                    // nose: a shadow and a glint
    if(C.smile!==false){p(hx-2,hy+5,LIP);p(hx-1,hy+6-0,LIP);p(hx,hy+6,LIP);p(hx+1,hy+5,LIP);p(hx-1,hy+5,SK[2]);p(hx,hy+5,SK[2]);}
    else{p(hx-1,hy+5,LIP);p(hx,hy+5,LIP);p(hx+1,hy+5,SK[1]);}
    p(hx-8,hy+4,BLUSH);p(hx-7,hy+4,BLUSH);p(hx+6,hy+4,BLUSH);p(hx+7,hy+4,BLUSH);}
  else{const xi=hx+fl*(FX-4),xw=hx+fl*(FX-5);
    if(blink){p(xw,hy+2,LASH);p(xi,hy+2,LASH);}
    else{p(xw,hy,LASH);p(xi,hy,LASH);p(xi+fl,hy,LASH);p(xi+fl,hy-1,LASH);p(xw,hy+1,SCL);p(xw,hy+2,SCL);p(xi,hy+1,EY[0]);p(xi,hy+2,EY[2]);p(xi,hy+3,EY[3]);if(!hollow)p(xi,hy+2,[255,255,255]);p(xw,hy+3,SK[2]);}
    p(xw,hy-2,HR[1]);p(xi,hy-2,HR[1]);p(xi+fl,hy-1,HR[1]);
    p(hx+fl*(FX-2),hy+3,SK[2]);                                                              // nose: a small shade, inside the outline
    p(hx+fl*(FX-3),hy+5,LIP);p(hx+fl*(FX-4),hy+5,LIP);p(hx+fl*(FX-7),hy+4,BLUSH);p(hx+fl*(FX-6),hy+4,BLUSH);}}
// ---- hair, built like a hand-drawn sprite: a thin cap that hugs the skull, then tapered locks swept from the crown.
// Each lock has a lit edge and a dark edge, so neighbouring locks read as separate clumps; fringes end in points with forehead between them.
const SQ=1.2;const CRAN=(u,y,e,side)=>{const uu=Math.abs(side?u*SQ:u)/(FX+1.2+e),yy=Math.abs(y+3)/(10.6+e);return y<-3?Math.pow(uu,2.05)+Math.pow(yy,1.9)<=1:Math.pow(uu,2.4)+Math.pow(yy,2.2)<=1;};   // a round crown, a fuller jaw
const jit=(i,s)=>{const v=Math.sin(i*12.9898+s*78.233)*43758.5453;return v-Math.floor(v);};
const HSTY={
  //        nape: back hair ends;  sb: sideburn bottom;  fr: fringe [count, sweep, tip y, spread x0..x1, width];  tufts: [u, angle, len];  hl: forehead hairline
  short:    {nape:3, sb:0, hl:-6, fit:.4, fr:[6, 1.6, -3, -7, 6, 2.8], tufts:[[-5,-140,3],[1,-95,2],[5,-50,3]]},
  crop:     {nape:2, sb:-1, hl:-6, fit:.3, fr:[7, .9, -3, -7, 6, 2.4], tufts:[[-3,-120,2],[3,-70,2]]},
  sidepart: {nape:3, sb:0, hl:-7, fit:.4, fr:[5, 2.4, -2, -3, 7, 3], part:-4, tufts:[[-6,-130,2]]},
  bangs:    {nape:4, sb:1, hl:-5, fit:.5, fr:[8, .2, -2, -7, 7, 2.4], tufts:[[-4,-120,2],[4,-60,2]]},
  shaggy:   {nape:6, sb:2, hl:-6, fr:[7, 1.0, -1, -8, 7, 3], tufts:[[-6,-150,4],[-1,-100,3],[4,-60,4],[7,-20,3]], side:[3,1]},
  spiky:    {nape:2, sb:-1, hl:-6, fit:.3, fr:[5, .8, -4, -6, 5, 2.6], tufts:[[-6,-135,5],[-3,-110,6],[0,-90,6],[3,-70,6],[6,-45,5]]},
  buzz:     {nape:2, sb:-1, hl:-6, cap:'buzz'},
  mohawk:   {nape:2, sb:-1, hl:-6, cap:'buzz', tufts:[[-1,-100,5],[0,-90,7],[1,-80,5]], crest:1},
  topknot:  {nape:2, sb:-1, hl:-6, cap:'buzz', knot:1},
  curly:    {nape:5, sb:2, hl:-5, curls:1},
  afro:     {nape:6, sb:3, hl:-5, curls:2},
  wavy:     {nape:9, sb:5, hl:-5, fr:[6, 1.2, -2, -7, 6, 3.2], side:[9,2], wave:1},
  bob:      {nape:6, sb:5, hl:-4, fr:[8, .3, -1, -7, 7, 2.8], side:[5,0], inward:1},
  long:     {nape:15, sb:5, hl:-6, part:0, fr:[6, 0, -3, -6, 6, 3], side:[15,1]},
  ponytail: {nape:3, sb:0, hl:-6, part:0, fr:[4, 0, -4, -6, 6, 3], tail:1},
  pigtails: {nape:3, sb:1, hl:-6, part:0, fr:[4, 0, -3, -6, 6, 3], pig:1},
  bun:      {nape:3, sb:0, hl:-6, part:0, fr:[4, 0, -4, -6, 6, 3], bun:1},
  spacebuns:{nape:3, sb:1, hl:-6, part:0, fr:[4, 0, -3, -6, 6, 3], sbun:1},
  braids:   {nape:4, sb:2, hl:-6, part:0, fr:[4, 0, -3, -6, 6, 3], braid:1},
};
function hair(hx,hy,dir,fl,st){if(!st||st==='bald')return;const S=HSTY[st]||HSTY.short;const side=dir==='E'||dir==='W',back=dir==='N';
  const put=(u,y,k)=>p(hx+Math.round(side?u*fl:u),hy+Math.round(y),HR[Math.max(0,Math.min(4,k))]);
  const SEED=st.length*7+(st.charCodeAt(0)||0);
  // a tapered lock from (u0,y0) to its tip (u1,y1)
  const lock=(u0,y0,u1,y1,w,shade)=>{const L=Math.hypot(u1-u0,y1-y0)||1;const nx=-(y1-y0)/L,ny=(u1-u0)/L;const n=Math.ceil(L*2.2);
    for(let i=0;i<=n;i++){const t=i/n,cx=u0+(u1-u0)*t,cy=y0+(y1-y0)*t,wt=Math.max(.7,w*Math.pow(1-t,.8));
      for(let o=-wt/2;o<=wt/2+.01;o+=.5){const rel=o/(wt/2+.01);let k=rel<-.35?4:rel>.45?1:3;if(t>.7&&k===4)k=3;k+=shade||0;put(cx+nx*o,cy+ny*o,k);}}};
  // ---- the cap: hair over the skull above the hairline
  const capBottom=(u)=>{const au=Math.abs(u);
    if(back)return S.nape-((Math.round(u)+20)%3===0?1:0);
    if(!side){if(au>=FX)return S.sb;return S.hl+(au>FX-4?1:0);}
    if(u<-4)return Math.min(S.nape,FY1)-((Math.round(u)+20)%3===0?1:0);if(u<-3)return S.sb+1;if(u<-1)return -2;if(u<0)return Math.min(S.sb,-1);if(u<3)return S.hl+1;return S.hl;};
  const buzz=S.cap==='buzz';
  const FIT=buzz?0:(S.fit!==undefined?S.fit:.9);
  for(let y=-15;y<=FY1+1;y++)for(let u=-FX-4;u<=FX+4;u++){if(!CRAN(u,y,FIT,side))continue;if(y>capBottom(u))continue;if(buzz&&!back&&!side&&Math.abs(u)<FX-1&&y>-7)continue;
    let k=u>2?2:3;if(y>-1)k=Math.min(k,2);if(!CRAN(u,y+1,FIT,side)||y===Math.floor(capBottom(u)))k=1;
    if(y>=-13&&y<=-11&&u>-6&&u<2&&((u+y)&1))k=4;                                                   // shine across the crown
    if(buzz)k=((u+y)&1)?2:3;put(u,y,k);}
  // ---- curls (curly, afro): clusters of round curls, each lit on its upper left
  if(S.curls){const big=S.curls===2,Rr=big?FX+5:FX+2,n=big?26:20;
    for(let i=0;i<n;i++){const a=Math.PI*(.95+i/(n-1)*1.1)+(jit(i,SEED)-.5)*.2;const r=Rr*(.82+jit(i,SEED+3)*.25);
      let u=Math.cos(a)*r,y=-4+Math.sin(a)*(Rr+1);if(side&&u>FX-1)continue;if(!back&&!side&&y>S.hl-1&&Math.abs(u)<FX-2)continue;
      const cr=big?2.6:1.8;for(let yy=-3;yy<=3;yy++)for(let uu=-3;uu<=3;uu++){const d=(uu*uu+yy*yy)/(cr*cr);if(d>1)continue;put(u+uu,y+yy,d>.6&&(uu>0||yy>0)?1:(uu<0&&yy<0)?4:3);}}
    if(!back&&!side)for(let i=0;i<6;i++){const u=-FX+2+i*3,y=S.hl+(i&1);for(let yy=-1;yy<=1;yy++)for(let uu=-1;uu<=1;uu++)put(u+uu,y+yy,(uu<0&&yy<0)?4:yy>0?1:3);}
    if(big&&!side&&!back)for(const s of [-1,1])for(let j=0;j<3;j++){const u=s*(FX+3),y=-2+j*3;for(let yy=-2;yy<=2;yy++)for(let uu=-2;uu<=2;uu++)if(uu*uu+yy*yy<=5)put(u+uu,y+yy,uu*s>0?1:3);}}
  // ---- locks
  const T=S.fr;
  if(T&&!back){const [n,sweep,tipY,x0,x1,w]=T;
    if(!side){for(let i=0;i<n;i++){const b=x0+(x1-x0)*i/(n-1);let bu=b*.55,by=-11+Math.abs(b)*.2,tu=b+sweep*3+(jit(i,SEED)-.5)*1.2,ty=tipY+Math.round(jit(i,SEED+1)*2)-(Math.abs(b)>FX-3?0:0);
        if(S.part!==undefined){const s=b<S.part?-1:1;bu=S.part+s*1;by=-12;tu=b+s*2.5;ty=tipY+(Math.abs(b-S.part)<3?-1:0)+Math.round(jit(i,SEED)*1.5);}
        lock(bu,by,tu,ty,w,i%2?0:0);}}
    else{const m=Math.max(3,Math.ceil(n/2));for(let i=0;i<m;i++){const tu=1+i*(FX-1)/(m-1)*.8,ty=Math.min(-2,tipY+Math.round(jit(i,SEED)*1.5))-(S.part!==undefined?1:0);lock(-2+i*.8,-12+i*.3,tu+sweep*.6,ty,w,0);}}}
  // side locks over the temples, down past the ear for longer styles
  if(!back&&S.side){const [len,out]=S.side;if(!side){for(const s of [-1,1]){lock(s*(FX-1),-8,s*(FX+1+out),len,3.4,s>0?-1:0);lock(s*(FX-3),-7,s*(FX+.5+out*.5),len-1,2.6,s>0?0:0);}}
    else{lock(-4,-8,-4,Math.min(len,S.sb+2),3,0);}}
  // hair at the back of the head, fanning from the crown to the nape
  if(back||side){const nape=S.nape+(S.side&&side?0:0);const tips=back?[-FX-1,-FX+2,-3,0,3,FX-2,FX+1]:[-FX-1,-FX+1,-6];
    tips.forEach((tu,i)=>lock(back?tu*.35:tu*.7-1.5,-12,tu,nape+Math.round(jit(i,SEED+5)*2)-(Math.abs(tu)>FX-1&&back?1:0),3.4,back&&tu>2?-1:0));
    if(back&&!buzz&&!S.curls)for(let i=0;i<4;i++)lock(-5+i*3.3,-13,-6+i*4,-6,2.6,0);}
  // tufts break the round silhouette on top
  for(const [tu,ang,len] of (S.tufts||[])){if(back&&ang>-60&&ang<-120)continue;const a=ang*Math.PI/180;const u0=side?tu*.4-1:tu*.6,y0=-12.5+Math.abs(tu)*.35;lock(u0,y0,u0+Math.cos(a)*len*(side?.7:1),y0+Math.sin(a)*len,2.6,0);}
  // ---- longer styles: curtains of locks
  if(S.side&&S.side[0]>5){const len=S.side[0];
    if(!side&&!back){for(const s of [-1,1]){for(let j=0;j<2;j++){const u0=s*(FX-1+j),u1=s*(FX+1.5+j*.5+(S.wave?((j)&1):0));lock(u0,-4,u1+(S.inward?-s*2:0),len-j*2,3.2,s>0?-1:0);}
        if(S.wave)for(let y=0;y<len;y+=3)put(s*(FX+2+((y>>1)&1)),y,4);}}
    else if(back){for(let i=0;i<6;i++){const tu=-FX+i*(2*FX)/5;lock(tu*.4,-8,tu+(S.wave?((i&1)?1:-1):0),len+Math.round(jit(i,SEED)*2),3.6,tu>2?-1:0);}}
    else{for(let i=0;i<3;i++)lock(-3-i,-6,-4-i*1.5+(S.wave?(i&1):0),len-i,3.4,0);}}
  if(S.inward&&!back&&!side)for(const s of [-1,1])lock(s*(FX+1),2,s*(FX-1),5,2.4,0);
  // ---- extras
  if(S.crest)for(let y=-16;y<=-7;y++)for(let u=-1;u<=1;u++)put(side?u-1:u,y,u<0?4:u>0?2:3);
  if(S.knot){const u=side?-2:0;for(let yy=-3;yy<=2;yy++)for(let uu=-3;uu<=3;uu++){const d=(uu*uu)/9+(yy*yy)/6;if(d<=1)put(u+uu,-15+yy,(uu<0&&yy<0)?4:d>.6?1:3);}for(let uu=-2;uu<=2;uu++)put(u+uu,-12,0);}
  if(S.bun){const u=side?-6:0,y=side?-11:-15;for(let yy=-3;yy<=3;yy++)for(let uu=-4;uu<=4;uu++){const d=(uu*uu)/16+(yy*yy)/9;if(d<=1)put(u+uu,y+yy,(uu<0&&yy<0)?4:d>.6?1:3);}}
  if(S.sbun){for(const s of (side?[-1]:[-1,1])){const u=side?-4:s*(FX-1),y=-13;for(let yy=-3;yy<=3;yy++)for(let uu=-3;uu<=3;uu++){const d=(uu*uu+yy*yy)/9;if(d<=1)put(u+uu,y+yy,(uu<0&&yy<0)?4:d>.6?1:3);}}}
  if(S.tail){const tie=[[150,50,40],[200,80,60]];if(back){p(hx,hy+2,tie[1]);p(hx-1,hy+2,tie[0]);lock(0,3,0,13,4,0);lock(-1,3,1,12,2.4,-1);}
    else if(side){const u=-FX-1;p(hx+u*fl,hy-3,tie[1]);lock(u,-2,u-3,9,3.6,0);}}
  if(S.pig){const tie=[[200,60,90],[240,110,140]];for(const s of (side?[-1]:[-1,1])){const u=side?-FX:s*(FX+1);if(!side){p(hx+u,hy-1,tie[1]);p(hx+u,hy,tie[0]);}lock(u,0,u+(side?-2:s*3),10,4,0);}}
  if(S.braid){const tie=[[60,90,140],[100,140,190]];for(const s of (side?[-1]:[-1,1])){const u=side?-3:s*(FX-1);for(let y=2;y<14;y++){const k=(y%3===0)?1:(y%3===1)?4:3;put(u,y,k);put(u+1,y,Math.max(1,k-1));put(u-1,y,y%3===1?3:2);}
      p(hx+Math.round(side?u*fl:u),hy+14,tie[1]);p(hx+Math.round(side?(u+1)*fl:u+1),hy+14,tie[0]);}}
}
// ---- accessories in their own colour: bow, flower, headband in the hair; scarf, bandana, necklace at the neck
function acc(hx,hy,dir,fl,a,ty){if(!a)return;const side=dir==='E'||dir==='W',back=dir==='N';const R=ACCR;
  if(a==='bow'){const bx=side?hx-fl*(HW-3):back?hx:hx+HW-3,by=hy+HTOP+3;for(const s of [-1,1]){blob(bx+s*3,by,2,2,R);}p(bx,by,R[1]);p(bx,by-1,R[3]);p(bx,by+1,R[2]);p(bx-1,by+3,R[2]);p(bx+1,by+3,R[1]);}
  if(a==='flower'){if(back)return;const bx=side?hx-fl*(HW-4):hx-HW+3,by=hy-6;for(const [dx,dy] of [[0,-2],[2,0],[0,2],[-2,0],[1,1]])blob(bx+dx,by+dy,1,1,R);p(bx,by,[250,214,90]);p(bx+1,by,[214,160,40]);}
  if(a==='headband'){const y0=hy-9;for(let y=y0;y<y0+2;y++){const t=(y-(-4+hy))/(-4-HTOP);const w=Math.round((HW+.5)*Math.sqrt(Math.max(0,1-t*t)));for(let x=-w;x<=w;x++){const xx=side?x-fl:x;p(hx+xx,y,R[y===y0?(x<0?4:3):(x<0?2:1)]);}}}
  if(a==='scarf'){const y=ty-1;const w=side?6:8;for(let j=0;j<3;j++)for(let x=-w;x<w;x++){const xx=side?x+fl:x;p(hx+xx,y+j,R[j===0?4:j===2?1:(x+j)&1?2:3]);}
    if(!back){const tx=side?hx+fl*3:hx-4;for(let j=3;j<9;j++)for(let i=0;i<3;i++)p(tx+i*(side?fl:1),y+j,R[i===0?4:i===2?1:3]);for(let i=0;i<3;i++)p(tx+i*(side?fl:1),y+9,R[(i&1)?3:1]);}
    else for(let j=3;j<7;j++)for(let i=0;i<3;i++)p(hx-5+i,y+j,R[i===0?3:2]);}
  if(a==='bandana'){if(back){for(let x=-6;x<6;x++)p(hx+x,ty,R[2]);return;}const w=side?5:7;for(let j=0;j<6;j++){const ww=w-j;for(let x=-ww;x<ww;x++){const xx=side?x+fl*2:x;p(hx+xx,ty-1+j,R[(x+j*3+20)%5===0?4:x<0?3:2]);}}p(hx-1,ty-1,R[0]);p(hx,ty-1,R[0]);}
  if(a==='necklace'){if(back||side){if(side)p(hx+fl*3,ty+2,R[3]);return;}for(let x=-4;x<=3;x++){const yy=ty+1+Math.round((x+.5)*(x+.5)/8);p(hx+x,yy,(x&1)?R[4]:R[2]);}p(hx-1,ty+4,[250,214,90]);p(hx,ty+4,[214,160,40]);p(hx-1,ty+5,[214,160,40]);}}
// ---- facial hair, in the hair colour
function beard(hx,hy,dir,fl,bt){if(!bt||dir==='N')return;const side=dir==='E'||dir==='W';
  const jaw=(x,y)=>side?faceIn(Math.round(x*fl*SQ),y):faceIn(x,y);
  if(bt==='stubble'){for(let y=hy+3;y<=hy+FY1;y++)for(let x=-FX;x<=FX;x++){if(side&&x*fl<0)continue;if(!jaw(x,y-hy))continue;if((x+y)&1)p(hx+x,y,HR[1]);}return;}
  if(bt==='goatee'){if(dir==='S'){for(let i=-2;i<=1;i++)p(hx+i,hy+4,HR[i<0?3:2]);for(let y=hy+6;y<=hy+FY1+1;y++)for(let i=-1;i<=0;i++)p(hx+i+(y>hy+FY1?0:0),y,HR[i<0?3:1]);p(hx-2,hy+6,HR[2]);p(hx+1,hy+6,HR[1]);}else{for(let i=0;i<3;i++)p(hx+fl*(FX-3+i),hy+4,HR[2]);for(let y=hy+6;y<=hy+FY1+1;y++){p(hx+fl*(FX-2),y,HR[2]);p(hx+fl*(FX-3),y,HR[1]);}}return;}
  if(bt==='moustache'){if(dir==='S'){for(let i=-3;i<=2;i++)p(hx+i,hy+4+(i===-3||i===2?1:0),HR[i<-1?3:2]);p(hx-1,hy+4,HR[1]);p(hx,hy+4,HR[1]);}else for(let i=0;i<3;i++)p(hx+fl*(FX-3+i),hy+4,HR[2]);return;}
  for(let y=hy+1;y<=hy+FY1+3;y++)for(let x=-FX-1;x<=FX+1;x++){const yy=y-hy;const xs=side?x*fl:x;if(side&&xs<0)continue;
    const inside=yy<=FY1?(side?faceIn(Math.round(xs*SQ),yy):faceIn(x,yy)):Math.abs(side?xs-2:x)<=FX-2-(yy-FY1)*1.5;if(!inside)continue;
    if(!side&&yy<4&&Math.abs(x)<FX-1)continue;if(side&&yy<4&&xs>2)continue;
    let k=xs<-FX*.3?3:xs>FX*.4?1:2;if(((x+40)*3+y)%5===0)k=Math.max(1,k-1);if(yy>FY1+1)k=Math.max(1,k-1);p(hx+x,y,HR[k]);}
  if(dir==='S'){p(hx-1,hy+5,SK[0]);p(hx,hy+5,SK[0]);for(let i=-3;i<=2;i++)p(hx+i,hy+4,HR[2]);}}
function glasses(hx,hy,dir,fl,gt){if(dir==='N')return;gt=gt===true?'round':gt;const F=gt==='shades'?[[20,16,22],[34,30,38]]:[[40,34,44],[64,58,70]],GL=[196,212,224];
  if(gt==='shades'){if(dir==='S'){for(const x0 of [hx-6,hx+2])for(let j=-1;j<3;j++)for(let i=0;i<5;i++){if(j===2&&(i===0||i===4))continue;p(x0+i,hy+j,j===-1?F[1]:(i===1&&j===0)?[120,120,140]:F[0]);}for(let i=-1;i<=1;i++)p(hx+i,hy,F[1]);}
    else{const x0=hx+fl*3;for(let j=-1;j<3;j++)for(let i=0;i<4;i++)p(x0+fl*i,hy+j,j===-1?F[1]:F[0]);for(let i=1;i<6;i++)p(x0-fl*i,hy,F[1]);}return;}
  if(gt==='square'){if(dir==='S'){for(const x0 of [hx-6,hx+2]){for(let i=0;i<5;i++){p(x0+i,hy-1,F[1]);p(x0+i,hy+3,F[1]);}for(let j=-1;j<4;j++){p(x0,hy+j,F[1]);p(x0+4,hy+j,F[0]);}p(x0+1,hy,GL);}for(let i=-1;i<=1;i++)p(hx+i,hy,F[1]);}
    else{const x0=hx+fl*3;for(let i=0;i<4;i++){p(x0+fl*i,hy-1,F[1]);p(x0+fl*i,hy+3,F[1]);}for(let j=-1;j<4;j++)p(x0+fl*3,hy+j,F[0]);for(let i=1;i<6;i++)p(x0-fl*i,hy,F[1]);}return;}
  if(dir==='S'){for(const x0 of [hx-6,hx+2]){for(let i=0;i<5;i++){p(x0+i,hy-1,F[1]);p(x0+i,hy+3,F[0]);}for(let j=0;j<3;j++){p(x0,hy+j,F[1]);p(x0+4,hy+j,F[0]);}p(x0+1,hy,GL);}for(let i=-1;i<=1;i++)p(hx+i,hy,F[1]);}
  else{const x0=hx+fl*(FX-6);for(let i=0;i<4;i++){p(x0+fl*i,hy-1,F[1]);p(x0+fl*i,hy+3,F[0]);}for(let j=0;j<3;j++)p(x0+fl*3,hy+j,F[0]);for(let i=1;i<7;i++)p(x0-fl*i,hy,F[1]);}}
// ---- hats, sitting on the hair
function hat(hx,hy,dir,fl,h){if(!h)return;const side=dir==='E'||dir==='W',back=dir==='N';const H=HAT,T0=hy+HTOP;
  const dome=(top,bot,rx,R2)=>{const ry=bot-top;for(let y=top;y<=bot;y++)for(let x=-rx;x<=rx;x++){const yy=(y-bot)/ry;if((x*x)/(rx*rx)+yy*yy>1)continue;const l=-x/rx*.55-yy*.5;p(hx+x+(side?-fl:0),y,R2[l>.6?4:l>.1?3:l>-.4?2:1]);}};
  if(h==='cap'){dome(T0-1,hy-5,HW+1,H);for(let i=-HW;i<=HW;i++)p(hx+i+(side?-fl:0),hy-5,H[1]);
    if(dir==='S'){for(let i=-FX;i<=FX;i++){p(hx+i,hy-4,H[i<-3?3:2]);p(hx+i,hy-3,H[0]);}for(let i=-1;i<=1;i++)p(hx+i,T0+2,EX[4]);p(hx,T0-1,H[4]);}
    else if(side){for(let i=0;i<8;i++){p(hx+fl*(FX-3+i),hy-4,H[i<6?3:2]);p(hx+fl*(FX-3+i),hy-3,H[0]);}}}
  if(h==='bucket'){const top=T0-1,bY=hy-6;for(let y=top;y<bY;y++){const w=FX+(y-top>2?1:0);for(let x=-w;x<=w;x++)p(hx+x+(side?-fl:0),y,H[y===top?4:x<-3?4:x>3?1:3]);}
    for(let x=-FX;x<=FX;x++)p(hx+x+(side?-fl:0),bY-1,H[1]);const bw=side?HW+1:HW+2;for(let i=-bw;i<=bw;i++){const dn=Math.abs(i)>bw-4?1:0;p(hx+i,bY+dn,H[i<-bw/2?4:i>bw/2?1:3]);p(hx+i,bY+1+dn,H[0]);}}
  if(h==='beanie'){dome(T0-2,hy-4,HW+1,H);for(let i=-HW-1;i<=HW+1;i++){p(hx+i,hy-5,H[2]);p(hx+i,hy-4,H[i<0?3:2]);p(hx+i,hy-3,H[0]);}
    for(let x=-HW+1;x<=HW-1;x+=2)for(let y=T0;y<hy-5;y++)if(g(hx+x,y))p(hx+x,y,H[2]);blob(hx,T0-3,2,2,H);}
  if(h==='straw'){const S2=[[110,80,30],[160,124,52],[204,168,82],[232,204,118],[248,230,160]];const bY=hy-7;
    for(let y=T0-2;y<bY;y++)for(let x=-FX+1;x<=FX-1;x++)p(hx+x,y,S2[(x+y+40)%3===0?2:x<-3?4:x>3?1:3]);for(let x=-FX+1;x<=FX-1;x++){p(hx+x,bY-2,H[2]);p(hx+x,bY-1,H[1]);}
    const bw=side?HW+2:HW+4;for(let i=-bw;i<=bw;i++){p(hx+i,bY,S2[i<-bw/2?4:i>bw/2?1:3]);p(hx+i,bY+1,S2[(i&1)?1:2]);p(hx+i,bY+2,S2[0]);}}
  if(h==='cowboy'||h==='sheriff'){const R2=h==='sheriff'?ramp('#a07848'):H;const bY=hy-7;
    for(let y=T0-3;y<bY;y++){const w=y<T0-1?FX-3:FX-1;for(let x=-w;x<=w;x++){if(y===T0-3&&Math.abs(x)<2)continue;p(hx+x,y,R2[x<-2?4:x>2?1:3]);}}
    for(let x=-FX+1;x<=FX-1;x++)p(hx+x,bY-1,[40,28,20]);
    const bw=side?HW+2:HW+4;for(let i=-bw;i<=bw;i++){const up=Math.abs(i)>bw-3?1:0;p(hx+i,bY-up,R2[i<-bw/2?4:i>bw/2?1:3]);p(hx+i,bY+1-up,R2[0]);}
    if(h==='sheriff'&&!back&&!side){p(hx,bY-4,[255,220,110]);p(hx-1,bY-4,[220,170,60]);p(hx+1,bY-4,[220,170,60]);p(hx,bY-5,[255,220,110]);p(hx,bY-3,[200,150,40]);}}
  if(h==='top'){const T=ramp('#1c1a20');const bY=hy-7;for(let y=T0-6;y<bY;y++)for(let x=-FX+2;x<=FX-2;x++)p(hx+x,y,T[x<-3?4:x>3?1:3]);for(let x=-FX+2;x<=FX-2;x++){p(hx+x,bY-3,[120,30,30]);p(hx+x,bY-2,[80,20,20]);}
    for(let i=-HW-1;i<=HW+1;i++){p(hx+i,bY,T[i<0?3:1]);p(hx+i,bY+1,T[0]);}}}
// ---------------------------------------------------------------- tools (same swing tables the game's timings were tuned to)
const SWING={axe:[40,-105,-150,-170,-20,10,16,-25],pick:[45,-105,-150,-170,-10,45,48,-20],hoe:[45,-105,-150,-170,-10,48,50,-20]};
const GRIP={axe:[[5,6],[-1,-10],[-3,-14],[-4,-15],[6,0],[7,4],[7,5],[4,1]],pick:[[5,6],[-1,-10],[-3,-14],[-4,-15],[6,1],[6,5],[6,6],[4,2]],hoe:[[5,6],[-1,-10],[-3,-14],[-4,-15],[6,1],[6,5],[6,6],[4,2]]};
const FGRIP=[[3,6],[2,-12],[1,-16],[1,-17],[2,-6],[2,3],[2,4],[3,2]];
const FANG_S=[115,-100,-92,-84,58,88,86,120],FK_S=[.9,1,1,1,.8,.62,.62,.85];
const FANG_N=[-80,-95,-92,-86,-84,-90,-90,-84],FK_N=[.55,1,1,1,.85,.5,.5,.7];
const BACK=[0,1,1,1,0,0,0,0];
// body language of a swing: lean back on the wind-up, drive forward through the strike, knees give at impact
const SW_LEAN=[0,-1,-2,-2,1,2,2,1],SW_CROUCH=[0,0,0,0,1,3,3,1],SW_BOB=[0,-1,-1,-1,0,0,0,0];
const gripOf=(kind,f,front)=>front?FGRIP[f]:GRIP[kind][f];
function drawTool(kind,f,hx,ay,dir,fl){const side=dir==='E'||dir==='W';
  if(kind==='hoe'||kind==='pick'||kind==='axe'){const front=!side,back=dir==='N';const [gdx,gdy]=gripOf(kind,f,front);
    let gx=hx+(front?gdx:fl*gdx),gy=ay+gdy;let ang,mir=false,k=1;
    if(side){const a=SWING[kind][f];if(fl>0)ang=a;else{ang=180-a;mir=true;}}else if(!back){ang=FANG_S[f];k=FK_S[f];}else{ang=FANG_N[f];k=FK_N[f];gx+=BACK[f]?1:-4;}
    const rad=ang*Math.PI/180,dx=Math.cos(rad),dy=Math.sin(rad);
    if(f===4){const a0=(side?(fl>0?SWING[kind][3]:180-SWING[kind][3]):back?FANG_N[3]:FANG_S[3])*Math.PI/180;let a1=rad;if(side&&fl<0&&a1>a0)a1-=2*Math.PI;if(side&&fl>0&&a1<a0)a1+=2*Math.PI;
      for(let i=4;i<=24;i++){const aa=a0+(a1-a0)*i/24;for(const [rr,c] of [[19,[244,238,222]],[18,[206,198,180]]]){const X=Math.round(gx+Math.cos(aa)*rr*k),Y=Math.round(gy+Math.sin(aa)*rr*k);if(Math.hypot(X-hx,Y-(ay-14))>14)p(X,Y,c);}}}
    stampTool(kind,gx,gy,ang,mir,k,(x,y,c)=>p(x,y,c));
    if(!BACK[f]&&!back){for(const u of [-1,4]){blob(Math.round(gx+dx*u*k),Math.round(gy+dy*u*k),2,2,SK);}}
    if(f===5){const hx2=Math.round(gx+dx*18*k),hy2=Math.round(gy+dy*18*k);const col=kind==='hoe'?[[96,62,36],[140,98,60]]:kind==='pick'?[[128,124,136],[196,192,204]]:[[160,118,66],[214,174,112]];
      for(let i=0;i<7;i++)p(hx2+(i-3)*2+(i%2),hy2-1-(i%3)-(i>4?2:0),col[i%2]);}}
  if(kind==='can'){const G2=[[30,66,40],[50,104,58],[78,146,80],[132,196,122],[180,226,168]];const tilt=f>=3&&f<=6;const cx=hx+(side?fl*10:9),cy=ay+5-(f>=1&&f<=6?3:0);
    for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++){const d=x*x/36+y*y/25;if(d>1)continue;const l=-x/6*.5-y/5*.7;p(cx+x,cy+y,G2[d>.8?(l>0?2:0):l>.45?4:l>.1?3:l>-.3?2:1]);}
    for(let x=-5;x<=5;x++)p(cx+x,cy-6,G2[x<0?3:2]);for(let i=0;i<9;i++){const aa=Math.PI+i/8*Math.PI;p(cx+Math.round(Math.cos(aa)*5),cy-7+Math.round(Math.sin(aa)*4),G2[1]);}
    for(const [rx,ry] of [[-3,-1],[-2,2]])p(cx+rx,cy+ry,G2[4]);
    const sx2=cx+(side?fl*8:8),sy2=cy-(tilt?-1:4);seg(cx+(side?fl*4:4),cy-1,sx2,sy2,2,G2);p(sx2+(side?fl:1),sy2,[210,210,200]);p(sx2+(side?fl:1),sy2+1,[150,150,140]);p(sx2+(side?fl*2:2),sy2,[180,180,170]);
    if(tilt)for(let i=0;i<11;i++){const ddx=(side?fl*(2+(i>>1)):2+(i>>1)),ddy=1+i*1.6+((f+i)%2);p(sx2+ddx,sy2+Math.round(ddy),[150,205,240]);if(i%2)p(sx2+ddx+(side?fl:1),sy2+Math.round(ddy),[220,240,252]);}}}
// ---------------------------------------------------------------- one figure
let SQUAT=false;
function human(dir,pose){SQUAT=(pose.crouch||0)>=3;const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1,back=dir==='N';
  const crouch=pose.crouch||0,bob=pose.bob||0,lean=side?Math.round((pose.lean||0)*fl):0;
  const cx=FW/2+(side?0:(pose.sway||0)),hipY=HIP0+crouch+bob,ux=cx+lean,ty=hipY-TH+(pose.slouch||0),hy=ty-HEADUP,armY=ty+3;
  const tool=pose.tool;
  // legs: [x offset along facing (side) or across (front), screen y offset, lift]
  const legs=pose.legs||(side?[[-1,0,0],[1,0,0]]:[[-3,0,0],[3,0,0]]);
  const legHip=(i)=>side?[cx+Math.round(lean/2),hipY]:[cx+(i?3:-3),hipY];
  const drawLeg=(i,far)=>{const [ox,oy,lift,kx,ky,rev]=legs[i];const [hx0,hy0]=legHip(i);const fx=side?cx+fl*ox:cx+ox,fy=ANK+oy-lift;
    const knee=kx!==undefined?[side?cx+fl*kx:cx+kx,ANK+ky]:null;leg(hx0,hy0,fx,fy,side,fl,far,!lift,i?1:-1,knee,rev);};
  // arms: hands relative to the shoulder
  const shL=side?[ux-fl*1,armY]:[ux-Math.round(TW/2),armY],shR=side?[ux+fl*1,armY]:[ux+Math.round(TW/2)-1,armY];
  const hands=pose.hands||(side?[[fl*-1,HANG-2],[fl*1,HANG-2]]:[[-1,HANG-2],[1,HANG-2]]);
  const drawArm=(i,far)=>{const sh=i?shR:shL;const h=hands[i];const hx2=sh[0]+h[0],hy2=sh[1]+h[1];arm(sh[0],sh[1],hx2,hy2,side?0:(i?1:-1),far,far?0:side?-fl:(i?-1:1));};
  into('body',()=>{
    if(tool&&back)tool(ux,armY,dir,fl);
    if(side){drawArm(0,true);drawLeg(0,true);drawLeg(1,false);}else{drawLeg(0,false);drawLeg(1,false);}
    if(back&&pose.reach){drawArm(0,false);drawArm(1,false);}
    torso(ux,ty,dir,fl,hipY);
    if(side)drawArm(1,false);else if(!(back&&pose.reach)){drawArm(0,false);drawArm(1,false);}
    if(tool&&!back&&pose.toolBack)tool(ux,armY,dir,fl);
    head(ux,hy,dir,fl,pose);});
  into('beard',()=>beard(ux,hy,dir,fl,C.beard===true?'full':C.beard));
  into('hair',()=>hair(ux,hy,dir,fl,C.hairStyle||'short'));
  into('acc',()=>acc(ux,hy,dir,fl,C.accessory,ty));
  into('glasses',()=>{if(C.glasses)glasses(ux,hy,dir,fl,C.glasses);});
  into('hat',()=>hat(ux,hy,dir,fl,C.hat));
  into('toolf',()=>{if(tool&&!back&&!pose.toolBack)tool(ux,armY,dir,fl);});}
// ---------------------------------------------------------------- poses per clip
function walkPose(f,dir,run){const pose={};if(f===0)return pose;const side=dir==='E'||dir==='W',back=dir==='N';const ph=(f-1)/8*Math.PI*2;const fl=dir==='W'?-1:1;
  const S=run?(KID?5:7):(KID?4:5),LF=run?4:3;
  // a foot moves back along the ground while it carries weight, then lifts and swings forward
  const foot=(u)=>{u=((u%(2*Math.PI))+2*Math.PI)%(2*Math.PI);const x=S*Math.cos(u);const lift=u<Math.PI?0:Math.round(LF*(-Math.sin(u)));return [x,lift];};
  const [xa,la]=foot(ph),[xb,lb]=foot(ph+Math.PI);
  const spread=Math.abs(Math.cos(ph));
  pose.bob=run?(spread>.8?1:spread<.4?-2:0):(spread>.8?1:spread<.35?-1:0);         // down on contact, up as the legs pass
  if(run)pose.lean=2;
  if(side){pose.legs=[[Math.round(xa),0,la],[Math.round(xb),0,lb]];
    // arms swing opposite the legs in a shallow arc: the near arm (index 1) goes with the far leg (a)
    const A=run?.9:1.15,arc=x=>Math.round(Math.abs(x)*.35);
    if(run)pose.hands=[[Math.round(-xb*A)*fl,HANG-5-arc(xb)],[Math.round(-xa*A)*fl,HANG-5-arc(xa)]];
    else pose.hands=[[Math.round(-xb*A)*fl,HANG-arc(xb)],[Math.round(-xa*A)*fl,HANG-arc(xa)]];}
  else{const s=back?-1:1;
    // face-on: the stepping foot comes toward / away from us, the lifted leg rides higher; hips sway over the planted foot
    pose.legs=[[-3,Math.round(s*xa*.55),la],[3,Math.round(s*xb*.55),lb]];pose.sway=Math.round(Math.sin(ph)*.9);
    const a=run?4:3;pose.hands=[[ -(run?1:0)+Math.round(-xb/S),(run?HANG-4:HANG)+Math.round(s*xb/S*a)],[(run?1:0)+Math.round(xa/S),(run?HANG-4:HANG)+Math.round(s*xa/S*a)]];}
  return pose;}
// planting / harvesting: bend, drop to one knee, reach into the soil in front, press it in, rise holding it, stand
function plantPose(f,dir){const pose={},side=dir==='E'||dir==='W',back=dir==='N',fl=dir==='W'?-1:1;
  if(f===0||f===5)return pose;
  const kneel=f===2||f===3;
  if(side){
    if(kneel){pose.crouch=6;pose.lean=2;pose.legs=[[-6,1,0,-1,1,true],[4,0,0,4,-5]];const d=f===3?1:0;pose.hands=[[fl*(4+d),12+d],[fl*(6+d),13+d]];pose.nod=1;}
    else if(f===1){pose.crouch=3;pose.lean=2;pose.legs=[[-2,0,0],[3,0,0]];pose.hands=[[fl*3,10],[fl*5,10]];pose.nod=1;}
    else{pose.crouch=2;pose.lean=1;pose.legs=[[-2,0,0],[3,0,0]];pose.hands=[[fl*4,3],[fl*5,2]];}}
  else{
    if(kneel){pose.crouch=6;const d=f===3?1:0;
      pose.legs=back?[[-3,0,0,-3,-4],[3,1,0,3,1,true]]:[[-3,1,0,-3,1,true],[3,0,0,3,-4]];   // one knee down, one foot planted
      pose.hands=back?[[5,9],[-4,9]]:[[6,13+d],[-5,13+d]];pose.reach=back;pose.nod=1;}
    else if(f===1){pose.crouch=3;pose.hands=back?[[4,8],[-3,8]]:[[5,10],[-4,10]];pose.reach=back;pose.nod=1;}
    else{pose.crouch=2;pose.hands=back?[[4,1],[-3,1]]:[[5,2],[-4,2]];pose.reach=back;}}
  return pose;}
// ---------------------------------------------------------------- render
ROWS.forEach(([clip,dir,nf],r)=>{for(let f=0;f<nf;f++){
  LY={};for(const k of PARTS)LY[k]=layer(k,FW,FH);CUR='body';
  const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1;let pose={};
  if(clip==='walk')pose=walkPose(f,dir,false);
  if(clip==='run')pose=walkPose(f===0?1:f,dir,true);
  if(clip==='idle'){pose.bob=[0,0,0,0][f];pose.slouch=[0,0,-1,0][f];pose.hands=side?[[fl*-1,HANG+(f===2?-1:0)],[fl*1,HANG+(f===2?-1:0)]]:[[0,HANG+(f===2?-1:0)],[0,HANG+(f===2?-1:0)]];}
  if(clip==='thrust'&&TOOL){const kind=TOOL;pose.tool=(hx,ay,d,fl2)=>drawTool(kind,f,hx,ay,d,fl2);
    if(kind==='can'){pose.crouch=f>=3&&f<=6?1:0;pose.lean=f>=3&&f<=6?1:0;pose.legs=side?[[-2,0,0],[2,0,0]]:[[-3,0,0],[3,0,0]];
      pose.hands=side?[[fl*-1,HANG-1],[fl*7,f>=1&&f<=6?1:4]]:[[1,HANG-1],[6,f>=1&&f<=6?1:4]];}
    else{pose.crouch=SW_CROUCH[f];pose.bob=SW_BOB[f];pose.lean=SW_LEAN[f];pose.toolBack=!!BACK[f];
      pose.legs=side?[[-3,0,0],[4,0,0]]:[[-3,0,0],[4,0,0]];                   // braced stance: front foot forward, back foot behind
      const [gx,gy]=gripOf(kind,f,!side);const a=SWING[kind][f]*Math.PI/180;
      if(side){const near=[fl*(gx+Math.round(Math.cos(a)*4)),gy+Math.round(Math.sin(a)*4)],farH=[fl*(gx),gy+1];pose.hands=[[farH[0]+fl*1,farH[1]],[near[0]-fl*1,near[1]]];}
      else if(dir==='N'){pose.hands=BACK[f]?[[5,-12],[-5,-12]]:[[4,3],[-4,3]];}
      else{const L=Math.round(TW/2);pose.hands=[[gx+L-1,gy+(BACK[f]?0:4)],[gx-L+3,gy]];}}}
  if(clip==='slash')pose=plantPose(f,dir);
  if(clip==='hurt'){pose.crouch=[0,2,4,5,6,6][f];pose.lean=-1;pose.hands=[[4,-5],[-4,-5]];pose.blink=f>1;}
  if(clip==='spellcast'){const up=f>1;pose.hands=up?(side?[[fl*-1,-11],[fl*3,-12]]:[[-1,-12],[1,-12]]):(side?[[fl*-1,HANG],[fl*1,HANG]]:[[0,HANG],[0,HANG]]);}
  if(clip==='sit'){pose.crouch=6;pose.legs=side?[[3,-1,0],[5,-1,0]]:[[-2,-2,0],[3,-2,0]];pose.hands=side?[[fl*3,HANG-3],[fl*4,HANG-3]]:[[1,HANG-3],[-1,HANG-3]];}
  human(dir,pose);
  // outline the whole figure, and give each outline pixel to the part whose pixel it borders
  const comp=flatten(PARTS.map(k=>LY[k]),FW,FH);
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){if(G(comp,x,y))continue;let n=null,ow=null;
    for(const [ddx,ddy] of [[0,1],[0,-1],[1,0],[-1,0]]){const c=G(comp,x+ddx,y+ddy);if(c&&c[3]>200){n=c;for(let i=PARTS.length-1;i>=0;i--)if(G(LY[PARTS[i]],x+ddx,y+ddy)){ow=PARTS[i];break;}break;}}
    if(n)P(LY[ow],x,y,outlineRGB(n));}
  const src=PART==='all'?flatten(PARTS.map(k=>LY[k]),FW,FH):LY[PART];
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){const c=G(src,x,y);if(c)P(SHEET,f*FW+x,r*FH+y,c,c[3]);}}});
emit([SHEET],CFG.out);
const clips={};let rr=0;for(const [n,ds,nf] of CLIPS){clips[n]={};for(const d of ds)clips[n][d]=[rr++,nf];}
console.log('META '+JSON.stringify({fw:FW,fh:FH,ax:FW/2,ay:FH-4,clips}));
