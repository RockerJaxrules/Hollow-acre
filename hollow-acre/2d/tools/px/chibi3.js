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
const CLIPS=[['walk',D4,9],['run',D4,9],['idle',D4,4],['thrust',D4,8],['slash',D4,6],['hurt',['S'],6],['spellcast',D4,7],['sit',D4,4]];
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
let SK=ramp(C.skin||'#e8b48c'),HR=ramp(C.hair||'#6a4224'),EYR=ramp(C.eye||'#3a5a7a'),SHT=ramp(C.shirt||'#b8402c'),PNT=ramp(C.pants||'#3a4e7a'),SHO=ramp(C.shoes||'#3a2618'),
  EX=ramp(C.extra||'#6a7a3a'),ACCR=ramp(C.acc||'#c83a5a'),HAT=ramp(C.hatColor||'#8a5a2a'),SKR=C.skirt?ramp(C.skirt):PNT;
let OUT=C.outfit||(C.overalls?'overalls':C.coat?'jacket':C.plaid?'shirt':(C.skirt?'dress':'tee'));
let JK=C.coat?ramp(C.coatColor||C.shirt||'#3a3a40'):EX;
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
let SHTC=PLAYER?SHIRT_BASES.map(ramp):[0,1,2,3,4,5,6,7].map(cls=>shiftR(SHT,patShift(PAT,cls)));
const shirtAt=(i,j)=>SHTC[((((j|0)%4)+4)%4)*2+((((i|0)%4)+4)%4===1?1:0)];
let SH0=SHTC[0];
let LONG=!['tee','dress','tank','skirt','polo'].includes(OUT)||C.longSleeves;
const OPENFRONT={jacket:2,cardigan:2,longcoat:2,vest:2,openshirt:2};
let LEGSKIN=OUT==='dress'||OUT==='skirt'||!!C.skirt;
// shorts (Everett): the trouser colour stops two rows under the hip, bare shins below, a sock band over each shoe
const SHORTS=!!C.shorts,SOX=C.socks?ramp(C.socks):null;
// ---- the wardrobe split (CFG.split): a bare base body, then one garment at a time; the garment's sheet is what differs from the base
const SPLIT=!!CFG.split;let WEARK='base',WEARID='',BOTTOM=null,SHOES=null,SLEEVE=null;
const UNDER=[[58,54,52],[90,86,82],[124,120,114],[160,156,148],[190,186,178]];   // the base's plain undershirt and shorts, never seen with clothes on
const HANDR=ramp('#e6b68e'),WRISTR=ramp('#e7b58a'),ANKR=ramp('#e9b28e'),SHINR=ramp('#e8b189'),KNEER=ramp('#eab090'),BROWR=ramp('#66472a');
const TOPR=ramp('#b8402c'),BOTR=ramp('#3a4e7a'),OUTR=ramp('#6a7a3a'),SHOER=ramp('#3a2618');
const TOPS={tee:{out:'tee'},longtee:{out:'tee',long:1},shirt:{out:'shirt'},sweater:{out:'sweater'},turtleneck:{out:'turtleneck'},hoodie:{out:'hoodie'},tank:{out:'tank'},dress:{out:'dress'},polo:{out:'polo'}};
const OUTERS={jacket:{out:'jacket',sl:1},cardigan:{out:'cardigan',sl:1},longcoat:{out:'longcoat',sl:1},openshirt:{out:'openshirt',sl:1},vest:{out:'vest'},overalls:{out:'overalls'}};
const BOTTOMS={trousers:{rows:null},skirt:{rows:0,skirt:1}};
const SHOESD={shoes:{}};
// ---- wardrobe garments (split). Each top/bottom/shoe adds hooks to the old outfit drawing: front/side details, skirts, sleeve styles, leg bands, shoe shapes.
const TOP2=ramp('#5aa08a'),BOT2=ramp('#9579bd'),SHOE2=ramp('#4ab8b8'),METAL=ramp('#b89a4a');
let TOPDEF=null,SKLEN=0,SKFLARE=0,SKR2=null;
const q=(x,y,R,k)=>p(x,y,R[clamp(k,0,4)]);
Object.assign(TOPS,{
 blouse:{out:'tee',long:1,front(cx,top,hip,back){if(back){for(let u=-5;u<=6;u++){q(cx+u,top,TOP2,u<0?4:3);q(cx+u,top+1,TOP2,1);}return;}
     /* a big round collar: two flaps over the chest */for(const s of [-1,1]){for(let j=0;j<3;j++){const w=j===2?3:4;for(let i=0;i<w;i++){const u=s<0?-1-i:2+i;q(cx+u,top+j,TOP2,j===2&&i===w-1?2:s<0?4:(j===0?4:3));}}q(cx+(s<0?-1:2),top+2,TOP2,2);}},
   side(cx,top,hip,fl){for(let j=0;j<3;j++)for(let u=-1;u<=3-j;u++)q(cx+u*fl+(fl<0?1:0),top+j,TOP2,j===2?1:3);}},
 workshirt:{out:'shirt',long:1,front(cx,top,hip,back){if(back)return;for(const u0 of [-4,3]){for(let i=0;i<3;i++){q(cx+u0+i,top+2,TOPR,1);q(cx+u0+i,top+5,TOPR,1);}for(let y=top+3;y<=top+4;y++){q(cx+u0,y,TOPR,2);q(cx+u0+2,y,TOPR,1);}q(cx+u0+1,top+3,TOPR,2);}},
   side(cx,top,hip,fl){for(let y=top+2;y<=top+4;y++)q(cx+fl*3,y,TOPR,y===top+2?1:2);}},
 raglan:{out:'tee',long:1,sleeveR:TOP2,sleeveT:.86,front(cx,top,hip,back){for(let j=0;j<4;j++){for(let u=-5;u<=-2-j+1;u++)q(cx+u,top+j,TOP2,u<-3?4:3);for(let u=3+j;u<=6;u++)q(cx+u,top+j,TOP2,u>4?1:2);}if(!back)for(let u=-1;u<=2;u++)q(cx+u,top+1,TOP2,2);},
   side(cx,top,hip,fl){for(let j=0;j<4;j++)for(let u=-1-j;u<=1+j;u++)q(cx+u*fl+(fl<0?1:0),top+j,TOP2,3);}},
 western:{out:'shirt',long:1,front(cx,top,hip,back){const yk=u=>top+2+((u===-3||u===4)?2:(Math.abs(u-.5)<4?1:0));
     for(let u=-5;u<=6;u++){for(let y=top+(back?0:1);y<=(back?top+3:yk(u));y++)q(cx+u,y,TOP2,u<-2?4:u>3?2:3);q(cx+u,(back?top+4:yk(u)+1),TOP2,0);}
     if(!back){for(const y of [top+6,top+9])q(cx,y,METAL,4);}},
   side(cx,top,hip,fl){for(let u=-4;u<=3;u++){for(let y=top;y<=top+(u>1?4:3);y++)q(cx+u*fl+(fl<0?1:0),y,TOP2,3);q(cx+u*fl+(fl<0?1:0),top+(u>1?5:4),TOP2,0);}}},
 tunic:{out:'dress',long:1,skirt:{len:4,flare:.35},front(cx,top,hip,back){if(!back){q(cx,top+1,SK,2);q(cx+1,top+1,SK,2);q(cx,top+2,SK,1);}for(let u=-5;u<=6;u++)q(cx+u,hip-1,TOP2,u<-2?4:u>3?2:3);for(let u=-5;u<=6;u++)q(cx+u,hip,TOP2,1);
     if(!back){q(cx+4,hip+1,TOP2,3);q(cx+4,hip+2,TOP2,2);q(cx+5,hip+1,TOP2,2);}},
   side(cx,top,hip,fl){for(let u=-4;u<=4;u++){q(cx+u*fl+(fl<0?1:0),hip-1,TOP2,3);q(cx+u*fl+(fl<0?1:0),hip,TOP2,1);}}},
 cableknit:{out:'sweater',long:1,front(cx,top,hip,back){if(back)return;for(const u0 of [-3,3])for(let y=top+2;y<=hip-2;y++){const ph=(y>>1)&1;q(cx+u0,y,TOPR,ph?4:2);q(cx+u0+1,y,TOPR,ph?2:4);}}},
 uniform:{out:'turtleneck',long:1,front(cx,top,hip,back){for(let u=-5;u<=6;u++){q(cx+u,hip-2,TOP2,u<-2?3:2);q(cx+u,hip-1,TOP2,1);}
     for(const [u0,s] of [[-6,-1],[5,1]])for(let i=0;i<3;i++){q(cx+u0+i,top-1,METAL,s<0?4:3);q(cx+u0+i,top,METAL,s<0?3:2);}
     if(back)return;q(cx,hip-2,METAL,4);q(cx+1,hip-2,METAL,3);q(cx,hip-1,METAL,2);q(cx+1,hip-1,METAL,2);for(let y=top+2;y<hip-2;y++)q(cx+1,y,TOPR,1);},
   side(cx,top,hip,fl){for(let u=-4;u<=4;u++){q(cx+u*fl+(fl<0?1:0),hip-2,TOP2,2);q(cx+u*fl+(fl<0?1:0),hip-1,TOP2,1);}for(let i=-1;i<=1;i++){q(cx+i,top-1,METAL,3);q(cx+i,top,METAL,2);}}},
 sundress:{out:'tank',skirt:{len:7,flare:.75},front(cx,top,hip,back){for(let u=-5;u<=6;u++)q(cx+u,hip-2,TOP2,u<-2?3:2);}},
 longdress:{out:'turtleneck',long:1,skirt:{len:8,flare:.55},front(cx,top,hip,back){if(back)return;for(const y of [top+2,top+4,top+6])q(cx+1,y,TOP2,4);}},
 nightgown:{out:'tee',skirt:{len:9,flare:.65},front(cx,top,hip,back){if(back)return;for(let u=-2;u<=3;u++)q(cx+u,top+1,TOPR,4);for(let y=top+2;y<=top+4;y++)q(cx+1,y,TOPR,1);}},
 robe:{out:'tee',long:1,bell:1,sleeveT:.92,skirt:{len:9,flare:.55},front(cx,top,hip,back){for(let u=-5;u<=6;u++){q(cx+u,hip-2,TOP2,u<-2?4:u>3?2:3);q(cx+u,hip-1,TOP2,1);}
     if(back)return;/* an open front: a dark V to the sash, the lapels lit and shaded */for(let j=0;j<8;j++){const w=Math.max(0,3-Math.floor(j/2));for(let u=1-w;u<=w;u++)q(cx+u,top+j,TOP2,0);q(cx-w,top+j,TOPR,4);q(cx+w+1,top+j,TOPR,1);}
     q(cx+4,hip,TOP2,3);q(cx+4,hip+1,TOP2,2);q(cx+5,hip+1,TOP2,2);q(cx+4,hip+2,TOP2,1);for(let y=hip;y<hip+8;y++)q(cx+1,y,TOPR,0);},
   side(cx,top,hip,fl){for(let u=-4;u<=4;u++){q(cx+u*fl+(fl<0?1:0),hip-2,TOP2,3);q(cx+u*fl+(fl<0?1:0),hip-1,TOP2,1);}}},
 pinafore:{out:'tee',long:1,skirt:{len:7,flare:.6},skirtR:TOP2,front(cx,top,hip,back){if(back){for(let j=0;j<=hip-top-1;j++){for(const s of [-1,1]){const u=Math.round(s*(4-j*.45));q(cx+u,top+j,TOP2,3);q(cx+u+1,top+j,TOP2,2);}}return;}
     for(let y=top+3;y<=hip;y++)for(let u=-3;u<=4;u++){const xx=(u-.5)/3.5;q(cx+u,y,TOP2,y===top+3?4:xx<-.6?4:xx>.6?2:3);}
     for(const u0 of [-4,4])for(let y=top-1;y<=top+3;y++){q(cx+u0,y,TOP2,u0<0?4:2);q(cx+u0+1,y,TOP2,u0<0?3:1);}},
   side(cx,top,hip,fl){for(let y=top+3;y<=hip;y++)for(let u=3;u<=5;u++)q(cx+u*fl+(fl<0?1:0),y,TOP2,u===3?3:2);for(let y=top-1;y<=top+3;y++){q(cx+fl*0+(fl<0?1:0),y,TOP2,3);q(cx+fl*1+(fl<0?1:0),y,TOP2,2);}}},
 jumpsuit:{out:'polo',long:1,legs:1,front(cx,top,hip,back){for(let u=-5;u<=6;u++)q(cx+u,hip-1,TOPR,1);if(back)return;for(let y=top+3;y<hip-1;y++)q(cx,y,TOPR,1);for(let i=0;i<3;i++)q(cx+3+i,top+3,TOPR,1);q(cx+3,top+4,TOPR,1);q(cx+5,top+4,TOPR,1);}},
});
Object.assign(BOTTOMS,{
 jeans:{rows:null,band:(y,hip,bot)=>y>=bot?BOT2:null},
 worktrousers:{rows:null,band:(y,hip,bot)=>(y===bot-5||y===bot-4)?BOT2:null},
 cargo:{rows:null,pockets:1},
 shorts:{rows:3,band:(y,hip)=>y===hip+3?BOT2:null},
 cutoffs:{rows:2,ragged:1},
 midiskirt:{rows:0,skirt:1,len:8,flare:.55},
 longskirt:{rows:0,skirt:1,len:10,flare:.45},
 pleated:{rows:0,skirt:1,len:6,flare:.7,pleat:1},
 breeches:{rows:4,band:(y,hip)=>y===hip+4?BOT2:null},
 flares:{rows:null,flare:1},
 joggers:{rows:null,band:(y,hip,bot)=>y>=bot?BOT2:null},
});
// shoes: the shoe itself and a shaft over the lower leg (boots under trousers, over bare legs and socks)
const shaftF=(x,y,s,h,R,w)=>{const x0=x+(s<0?1:0)-(w?1:0);for(let j=1;j<=h;j++)for(let i=0;i<4+(w?2:0);i++){const k=i===0?(s<0?4:3):i===3+(w?2:0)?(s<0?2:1):3;q(x0+i,y-j,R,j===h&&w?k+1:k);}};
const shaftS=(x,y,fl,h,R,far,w)=>{const RR=far?dk(R,1):R;for(let j=1;j<=h;j++)for(let i=-2-(w?1:0);i<=1+(w?1:0);i++)q(x+i,y-j,RR,i===-2-(w?1:0)?4:i===1+(w?1:0)?1:3);};
function oldShoeF(x,y,s,back,R){const w=5;for(let i=0;i<w;i++){const lit=s<0?i<2:i<1;q(x+i,y,R,back?2:lit?4:3);q(x+i,y+1,R,back?1:i===w-1||(s>0&&i>3)?2:3);q(x+i,y+2,R,0);}if(!back)q(x+(s<0?1:2),y,R,4);}
function oldShoeS(x,y,fl,far,R){R=far?dk(R,1):R;const L=6;for(let i=0;i<L;i++){const xx=x+fl*(i-2);q(xx,y,R,i===L-1?3:i<2?2:4);q(xx,y+1,R,i===0?1:3);q(xx,y+2,R,0);}q(x+fl*3,y-1,R,3);}
Object.assign(SHOESD,{
 shoes:{f:(x,y,s,b)=>oldShoeF(x,y,s,b,SHOER),s:(x,y,fl,far)=>oldShoeS(x,y,fl,far,SHOER)},
 boots:{f:(x,y,s,b)=>{shaftF(x,y,s,2,SHOER);oldShoeF(x,y,s,b,SHOER);},s:(x,y,fl,far)=>{shaftS(x,y,fl,2,SHOER,far);oldShoeS(x,y,fl,far,SHOER);}},
 wellies:{f:(x,y,s,b)=>{shaftF(x,y,s,5,SHOER,1);oldShoeF(x,y,s,b,SHOER);for(let j=1;j<=4;j++)q(x+(s<0?0:1),y-j,SHOER,4);},s:(x,y,fl,far)=>{shaftS(x,y,fl,5,SHOER,far,1);oldShoeS(x,y,fl,far,SHOER);}},
 workboots:{f:(x,y,s,b)=>{shaftF(x,y,s,3,SHOER);oldShoeF(x,y,s,b,SHOER);for(let i=0;i<5;i++)q(x+i,y+2,SHOE2,1);if(!b){q(x+(s<0?2:1),y-1,SHOE2,3);q(x+(s<0?2:1),y-2,SHOE2,3);}},s:(x,y,fl,far)=>{shaftS(x,y,fl,3,SHOER,far);oldShoeS(x,y,fl,far,SHOER);for(let i=0;i<6;i++)q(x+fl*(i-2),y+2,SHOE2,far?0:1);}},
 sneakers:{f:(x,y,s,b)=>{oldShoeF(x,y,s,b,SHOER);for(let i=0;i<5;i++)q(x+i,y+2,SHOE2,i===0||i===4?3:4);if(!b){q(x+(s<0?1:2),y,SHOE2,4);q(x+(s<0?2:3),y,SHOE2,3);}},s:(x,y,fl,far)=>{oldShoeS(x,y,fl,far,SHOER);for(let i=0;i<6;i++)q(x+fl*(i-2),y+2,SHOE2,far?3:4);q(x+fl*3,y+1,SHOE2,far?3:4);}},
 sandals:{f:(x,y,s,b)=>{for(let i=0;i<5;i++){q(x+i,y,SHOER,b?2:3);q(x+i,y+1,SK,b?1:(i===0?4:3));q(x+i,y+2,SHOER,1);}},s:(x,y,fl,far)=>{const F=far?dk(SK,1):SK;for(let i=0;i<5;i++){const xx=x+fl*(i-2);if(i>0)q(xx,y,(i===1||i===3)?SHOER:F,(i===1||i===3)?3:4);q(xx,y+1,F,i===0?2:3);q(xx,y+2,SHOER,1);}}},
 clogs:{f:(x,y,s,b)=>{for(let i=1;i<4;i++)q(x+i,y-1,SHOER,i===1?4:3);oldShoeF(x,y,s,b,SHOER);for(let i=0;i<5;i++)q(x+i,y+2,SHOER,1);},s:(x,y,fl,far)=>{oldShoeS(x,y,fl,far,SHOER);q(x+fl*2,y-1,far?dk(SHOER,1):SHOER,4);q(x+fl*4,y,far?dk(SHOER,1):SHOER,3);}},
 ridingboots:{f:(x,y,s,b)=>{shaftF(x,y,s,5,SHOER);for(let i=-1;i<5;i++){q(x+(s<0?1:0)+i,y-5,SHOE2,i<1?4:i>2?2:3);q(x+(s<0?1:0)+i,y-4,SHOE2,i<1?3:1);}oldShoeF(x,y,s,b,SHOER);},s:(x,y,fl,far)=>{shaftS(x,y,fl,5,SHOER,far);for(let i=-3;i<=2;i++){q(x+i,y-5,far?dk(SHOE2,1):SHOE2,3);q(x+i,y-4,far?dk(SHOE2,1):SHOE2,1);}oldShoeS(x,y,fl,far,SHOER);}},
 heels:{f:(x,y,s,b)=>{for(let i=0;i<5;i++){q(x+i,y,SK,b?2:(i<2?4:3));q(x+i,y+1,SHOER,b?1:(i===0?4:3));q(x+i,y+2,SHOER,0);}},s:(x,y,fl,far)=>{const R=far?dk(SHOER,1):SHOER,F=far?dk(SK,1):SK;for(let i=0;i<6;i++){const xx=x+fl*(i-2);q(xx,y,i>2?F:R,3);q(xx,y+1,R,i===0?1:3);if(i===0||i>=3)q(xx,y+2,R,0);}q(x-fl*2,y+2,R,1);}},
});
const OUT2=ramp('#b8a02c');
Object.assign(OUTERS,{
 barncoat:{out:'jacket',sl:1,front(cx,top,hip,back){if(back){for(let u=-5;u<=6;u++){q(cx+u,top,OUT2,u<0?3:2);q(cx+u,top+1,OUT2,1);}return;}
     /* a wide dark corduroy collar over the shoulders */for(const [u0,u1] of [[-6,-1],[2,7]])for(let y=top;y<=top+2;y++)for(let u=u0;u<=u1;u++){if(y===top+2&&(u<u0+2&&u0<0||u>u1-2&&u1>0))continue;q(cx+u,y,OUT2,y===top?(u<0?3:2):y===top+2?0:1);}
     /* big patch pockets with a lit flap */for(const u0 of [-5,3])for(let i=0;i<4;i++){q(cx+u0+i,hip-4,OUTR,4);for(let y=hip-3;y<=hip-1;y++)q(cx+u0+i,y,OUTR,i===0?2:i===3?0:1);}},
   side(cx,top,hip,fl){for(let u=-4;u<=1;u++){q(cx+u*fl+(fl<0?1:0),top,OUT2,2);q(cx+u*fl+(fl<0?1:0),top+1,OUT2,0);}for(let y=hip-4;y<=hip-1;y++)for(let u=1;u<=3;u++)q(cx+u*fl+(fl<0?1:0),y,OUTR,y===hip-4?4:1);}},
 puffer:{out:'turtleneck',closed:1,puff:1,front(cx,top,hip,back){/* four broad quilted tubes, each lit on top and dark underneath, the outline notched at every seam */
     for(let t=0;t<3;t++){const y0=top+1+t*4;for(let j=0;j<4;j++){const y=y0+j;if(y>hip)continue;for(let u=-7;u<=8;u++){if(j===0&&(u===-7||u===8))continue;const xx=(u-.5)/7.5;q(cx+u,y,OUTR,j===0?0:j===2?(xx<.4?4:xx>.7?2:3):j===1?(xx<-.5?3:xx>.6?1:2):(xx>.5?1:2));}}}
     if(!back)for(let y=top+1;y<hip;y++)q(cx+1,y,OUTR,0);},
   side(cx,top,hip,fl){for(let t=0;t<3;t++){const y0=top+1+t*4;for(let j=0;j<4;j++){const y=y0+j;if(y>hip)continue;for(let u=-6;u<=6;u++){if(j===0&&Math.abs(u)===6)continue;q(cx+u*fl+(fl<0?1:0),y,OUTR,j===0?0:j===2?4:j===1?3:2);}}}},
   post(cx,top,hip,hy,view,fl){if(view==='N')return;/* a stand-up collar to the chin */const side=view==='E'||view==='W';for(let y=top-2;y<=top+1;y++)for(let u=(side?-2:-4);u<=(side?3:5);u++){const X=side?cx+u*fl+(fl<0?1:0):cx+u;q(X,y,OUTR,y===top-2?4:u<(side?-1:-2)?3:u>(side?2:3)?1:2);}}},
 trench:{out:'longcoat',sl:1,front(cx,top,hip,back){for(let u=-6;u<=7;u++){q(cx+u,hip-2,OUT2,u<-3?3:2);q(cx+u,hip-1,OUT2,1);}for(const u0 of [-7,6])for(let i=0;i<2;i++)q(cx+u0+i,top,OUT2,u0<0?3:2);if(back)return;
     q(cx+3,hip-2,METAL,4);q(cx+3,hip-1,METAL,2);q(cx+4,hip,OUT2,2);q(cx+5,hip+1,OUT2,1);q(cx+4,hip+1,OUT2,2);q(cx+5,hip+2,OUT2,1);
     /* wide lapels */for(let j=0;j<5;j++){for(let i=0;i<=Math.max(0,3-j);i++){q(cx-2-i+Math.floor(j/2),top+j,OUTR,4);q(cx+3+i-Math.floor(j/2),top+j,OUTR,1);}}for(const y of [top+5,top+8])for(const u of [-3,4])q(cx+u,y,METAL,3);},
   side(cx,top,hip,fl){for(let u=-4;u<=4;u++){q(cx+u*fl+(fl<0?1:0),hip-2,OUT2,3);q(cx+u*fl+(fl<0?1:0),hip-1,OUT2,1);}q(cx+(fl<0?1:0),top,OUT2,3);q(cx-fl+(fl<0?1:0),top,OUT2,3);}},
 apron:{out:'tank',front(cx,top,hip,back){if(back){for(let j=0;j<=hip-top-3;j++){q(cx-4+Math.round(j*.5),top+2+j,OUTR,2);q(cx+5-Math.round(j*.5),top+2+j,OUTR,1);}
       for(let u=-5;u<=6;u++)q(cx+u,hip-1,OUTR,2);lockBlob(cx+.5,hip-1,2,1,OUTR);q(cx-1,hip+1,OUTR,2);q(cx+2,hip+1,OUTR,1);q(cx-1,hip+2,OUTR,1);q(cx+2,hip+2,OUTR,1);return;}
     q(cx-3,top+1,OUTR,3);q(cx-2,top,OUTR,3);q(cx+4,top+1,OUTR,2);q(cx+3,top,OUTR,2);
     for(let y=top+2;y<=hip+6;y++){const w=y<hip-1?3.5:y<hip+1?4.5:5.5;for(let u=Math.ceil(-w+.5);u<=Math.floor(w+.5);u++){const xx=(u-.5)/w;q(cx+u,y,OUTR,y===hip+6?1:xx<-.6?4:xx>.6?2:3);}}
     for(const u of [-6,7])q(cx+u,hip-1,OUTR,2);for(let i=-1;i<=2;i++){q(cx+i,hip+2,OUTR,1);}q(cx-1,hip+3,OUTR,1);q(cx+2,hip+3,OUTR,1);},
   side(cx,top,hip,fl){for(let y=top+2;y<=hip+6;y++)for(let u=(y<hip?3:3);u<=(y<hip?5:6);u++)q(cx+u*fl+(fl<0?1:0),y,OUTR,y===hip+6?1:u===3?3:2);q(cx-fl*4,hip-1,OUTR,2);q(cx-fl*5,hip,OUTR,1);}},
 peacoat:{out:'sweater',closed:1,skirt:{len:3,flare:.3},front(cx,top,hip,back){for(let y=top+1;y<=hip;y++)q(cx-5,y,OUTR,4);if(back)return;
     for(let j=0;j<3;j++)for(const [u,k] of [[-4+j,4],[-3+j,3],[5-j,1],[4-j,2]])q(cx+u,top+j,OUTR,k);
     for(const y of [top+4,top+7,top+10])for(const u of [-3,3]){q(cx+u,y,METAL,4);q(cx+u+1,y,METAL,2);}for(let y=top+3;y<=hip;y++)q(cx+1,y,OUTR,1);},
   side(cx,top,hip,fl){for(let y=top+1;y<=hip;y++)q(cx-fl*4+(fl<0?1:0),y,OUTR,4);}},
 shawl:{out:'tank',post(cx,top,hip,hy,view,fl){const S=OUTR,F=OUT2,side=view==='E'||view==='W';
     if(view==='N'){for(let y=top-1;y<=hip;y++){const w=Math.round(9.5-(y-top+1)*.75);for(let u=-w+1;u<=w;u++){const xx=(u-.5)/w;q(cx+u,y,S,y===hip||u===w?1:xx<-.5?4:3);}}for(const u of [-1,1,3])q(cx+u,hip+1,F,3);return;}
     if(!side){/* draped over the shoulders and upper arms, the two ends hanging past the arms with fringes */
       for(let y=top-1;y<=top+3;y++)for(let u=-9;u<=10;u++){const a=Math.abs(u-.5);if(a<2.5-(y-top))continue;if(a>9.5)continue;q(cx+u,y,S,y===top-1?4:u<-5?4:u>6?1:y===top+3?2:3);}
       for(const s of [-1,1]){const x0=s<0?cx-9:cx+9;for(let y=top+4;y<=top+11;y++){q(x0,y,S,s<0?4:2);q(x0+(s<0?1:-1),y,S,s<0?3:1);}for(let i=0;i<2;i++){q(x0+(s<0?i:-i),top+12,F,3);q(x0+(s<0?i:-i),top+13,F,2);}}}
     else{for(let y=top-1;y<=top+4;y++)for(let u=-6;u<=3;u++){if(u>3-(y-top))continue;q(cx+u*fl+(fl<0?1:0),y,S,y===top-1?4:u<-3?2:3);}for(let y=top+5;y<=top+11;y++){q(cx+fl*1+(fl<0?1:0),y,S,3);q(cx+(fl<0?1:0),y,S,2);}q(cx+fl+(fl<0?1:0),top+12,F,3);for(let y=top+5;y<=hip-1;y++)q(cx-fl*5+(fl<0?1:0),y,S,2);}}},
 raincoat:{out:'hoodie',closed:1,skirt:{len:6,flare:.45},front(cx,top,hip,back){if(back){/* the hood bunched at the nape, wider than the hair */for(let y=top-1;y<=top+3;y++){const w=y<top+2?9:8;for(let u=-w+1;u<=w;u++)q(cx+u,y,OUTR,y===top-1?4:y===top+3?1:u<-4?3:2);}return;}
     for(const y of [top+3,top+6,top+9]){q(cx+1,y,OUTR,0);q(cx+2,y,OUTR,0);}for(let y=top+2;y<=hip;y++)q(cx,y,OUTR,1);for(let u=-6;u<=7;u++)q(cx+u,top-1,OUTR,u<0?4:3);},
   side(cx,top,hip,fl){for(let y=top-2;y<=top+3;y++)for(let u=-7;u<=-3;u++)q(cx+u*fl+(fl<0?1:0),y,OUTR,y===top-2?4:u===-7?1:3);}},
});
// ---- wardrobe accessories on the body (split): belts, braces, bags, a cape, gauntlet cuffs. Drawn over the base like a garment; only what they change is kept.
let GAUNT=false;
const BACC={
 belt:{front(cx,top,hip,back){for(let u=-6;u<=7;u++){q(cx+u,hip-1,ACCR,u<-3?4:3);q(cx+u,hip,ACCR,1);}if(back)return;for(let i=-1;i<=2;i++){q(cx+i,hip-1,METAL,i<1?4:3);q(cx+i,hip,METAL,i<1?2:1);}q(cx,hip-1,ACCR,1);q(cx+1,hip,ACCR,1);},
   side(cx,top,hip,fl){for(let u=-5;u<=5;u++){q(cx+u*fl+(fl<0?1:0),hip-1,ACCR,3);q(cx+u*fl+(fl<0?1:0),hip,ACCR,1);}q(cx+fl*4+(fl<0?1:0),hip-1,METAL,4);q(cx+fl*4+(fl<0?1:0),hip,METAL,2);}},
 braces:{front(cx,top,hip,back){if(back){for(let j=0;j<=hip-top;j++){for(const s of [-1,1]){const u=Math.round(s*(4-j*.4));q(cx+u,top+j,ACCR,3);q(cx+u+1,top+j,ACCR,1);}}return;}
     for(const u of [-4,4])for(let y=top;y<=hip;y++){q(cx+u,y,ACCR,u<0?4:3);q(cx+u+1,y,ACCR,u<0?3:1);}for(const u of [-4,4]){q(cx+u,hip-1,METAL,4);q(cx+u+1,hip-1,METAL,2);}},
   side(cx,top,hip,fl){for(let y=top;y<=hip;y++){const u=2-Math.round((y-top)*.15);q(cx+u*fl+(fl<0?1:0),y,ACCR,3);q(cx+(u-1)*fl+(fl<0?1:0),y,ACCR,1);}for(let y=top;y<=hip;y++)q(cx-fl*3+(fl<0?1:0),y,ACCR,2);}},
 toolbelt:{front(cx,top,hip,back){for(let u=-6;u<=7;u++){q(cx+u,hip-1,ACCR,u<-3?4:3);q(cx+u,hip,ACCR,1);}if(back)return;q(cx,hip-1,METAL,4);q(cx+1,hip-1,METAL,3);q(cx,hip,METAL,2);q(cx+1,hip,METAL,1);
     for(const u0 of [-5,3]){for(let y=hip;y<=hip+4;y++)for(let i=0;i<3;i++)q(cx+u0+i,y,ACC2,y===hip?4:y===hip+4?1:i===0?3:i===2?1:2);q(cx+u0+1,hip+1,METAL,4);}},
   side(cx,top,hip,fl){const x=u=>cx+u*fl+(fl<0?1:0);for(let u=-5;u<=5;u++){q(x(u),hip-1,ACCR,3);q(x(u),hip,ACCR,1);}for(let y=hip;y<=hip+4;y++)for(let u=-6;u<=-4;u++)q(x(u),y,ACC2,y===hip?4:y===hip+4?1:u===-6?1:3);q(x(-5),hip+1,METAL,4);}},
 satchel:{front(cx,top,hip,back){const s=back?-1:1;const ex=back?cx-8:cx+3;for(let j=0;j<=hip-top;j++){const u=Math.round((-5*s)+(ex-cx+5*s)*j/(hip-top));q(cx+u,top+j,ACCR,3);q(cx+u+1,top+j,ACCR,1);}
     if(back){const bx=cx-10;for(let y=hip-3;y<=hip+2;y++)for(let i=0;i<5;i++)q(bx+i,y,ACCR,y<=hip-2?(i<2?4:3):i===0?3:i===4?1:2);return;}
     const bx=cx+1;for(let y=hip-1;y<=hip+4;y++)for(let i=0;i<6;i++)q(bx+i,y,ACCR,y===hip+4?1:i===0?4:i===5?1:y<=hip+1?2:3);for(let i=0;i<6;i++){q(bx+i,hip-1,ACCR,i<2?4:i<5?3:2);q(bx+i,hip,ACCR,i<1?4:i===5?2:3);q(bx+i,hip+1,ACC2,1);}q(bx+2,hip+1,METAL,4);q(bx+3,hip+1,METAL,2);},
   side(cx,top,hip,fl){for(let y=top;y<=hip;y++)q(cx+fl*Math.round(2-(y-top)*.3)+(fl<0?1:0),y,ACCR,2);if(fl<0)for(let y=hip-2;y<=hip+3;y++)for(let u=-2;u<=2;u++)q(cx+u*fl+(fl<0?1:0),y,y<=hip-1?ACC2:ACCR,y===hip-2?4:u===2?1:3);}},
 backpack:{front(cx,top,hip,back){if(back){for(let y=top+1;y<=hip;y++){const w=y===top+1?5:6;for(let u=-w+1;u<=w;u++){const xx=(u-.5)/w;q(cx+u,y,ACCR,y===hip?1:xx<-.5?4:xx>.55?2:3);}}
       for(let y=top+2;y<=top+4;y++)for(let u=-4;u<=5;u++)q(cx+u,y,ACC2,y===top+4?1:u<0?4:3);for(let i=-2;i<=3;i++)q(cx+i,hip-3,ACCR,1);q(cx+1,top+4,METAL,4);return;}
     for(const s of [-1,1]){const x0=s<0?cx-10:cx+8;for(let y=top-2;y<=top;y++)for(let i=0;i<3;i++){if(y===top-2&&i===(s<0?0:2))continue;q(x0+i,y,ACCR,y===top-2||i===0?4:i===2?1:3);}}
     for(const u of [-4,3])for(let y=top;y<=top+8;y++){q(cx+u,y,ACC2,u<0?4:3);q(cx+u+1,y,ACC2,u<0?3:2);q(cx+u+2,y,ACC2,1);}for(const u of [-4,3]){q(cx+u,top+6,METAL,4);q(cx+u+1,top+6,METAL,3);q(cx+u+2,top+6,METAL,2);}},
   side(cx,top,hip,fl){for(let y=top+1;y<=hip;y++)for(let u=-10;u<=-5;u++)q(cx+u*fl+(fl<0?1:0),y,ACCR,y===top+1?4:u===-10?1:u===-5?2:3);for(let y=top+1;y<=top+3;y++)for(let u=-10;u<=-5;u++)q(cx+u*fl+(fl<0?1:0),y,ACC2,y===top+3?1:3);
     for(let y=top;y<=top+7;y++){q(cx+fl*1+(fl<0?1:0),y,ACC2,3);q(cx+(fl<0?1:0),y,ACC2,1);}}},
 cape:{front(cx,top,hip,back){if(back)return;for(const s of [-1,1])for(let y=top+1;y<=hip+5;y++){const t=Math.max(0,y-hip+2);const x=s<0?cx-7-Math.round(t*.3):cx+8+Math.round(t*.3);q(x,y,ACCR,s<0?(y<top+4?4:3):2);q(x+s,y,ACCR,s<0?2:1);}
     for(const s of [-1,1])for(let j=0;j<=2;j++){const a=s<0?cx-10+j:cx+4,b=s<0?cx-3:cx+11-j;for(let x=a;x<=b;x++)q(x,top+j,ACCR,j===0?(s<0?4:3):j===2?(s<0?2:1):(s<0?3:2));}
     q(cx-2,top,ACCR,3);q(cx+3,top,ACCR,2);q(cx,top,METAL,4);q(cx+1,top,METAL,3);q(cx,top+1,METAL,2);q(cx+1,top+1,METAL,1);},
   side(cx,top,hip,fl){for(let y=top;y<=hip+4;y++){const u0=-4-Math.round((y-top)*.3);for(let u=u0;u<=-2;u++)q(cx+u*fl+(fl<0?1:0),y,ACCR,u===u0?1:y<=top+1?4:u===-2?4:3);}for(let u=-3;u<=2;u++)q(cx+u*fl+(fl<0?1:0),top-1,ACCR,u<0?4:3);q(cx+fl*2+(fl<0?1:0),top,METAL,4);q(cx+fl*2+(fl<0?1:0),top+1,METAL,2);},
   post(cx,top,hip,hy,view,fl){if(view!=='N')return;const F=[[-4,top+5,0],[-1,top+3,1],[3,top+6,0],[6,top+4,1]];
     for(let y=top-2;y<=hip+5;y++){const w=y===top-2?4:y===top-1?6:Math.round(8+(y-top)*.12);for(let u=-w+1;u<=w;u++){const xx=(u-.5)/w;
       const f=F.find(([fu,fy])=>fu===u&&y>=fy),fh=F.find(([fu,fy])=>fu-1===u&&y>=fy);
       if(y===hip+5){if(f&&f[2])q(cx+u,y,ACCR,1);continue;}
       if(y===top-2&&Math.abs(u-.5)>3)continue;
       let k=y<=top?(xx<.3?4:3):xx<-.55?4:xx>.6?2:3;if(y===top+1&&Math.abs(xx)>.7)k=xx<0?3:1;if(f)k=y===f[1]?2:1;else if(fh)k=4;if(y===hip+4)k=f?1:2;if(y===hip+4&&u===w)k=1;
       q(cx+u,y,ACCR,k);}}}},
 gauntlets:{gaunt:1},
};
function setWear(kind,id){WEARK=kind;WEARID=id||'';BOTTOM=null;SHOES=null;SLEEVE=null;TOPDEF=null;SKLEN=0;SKFLARE=0;GAUNT=false;OUT='tank';LONG=false;LEGSKIN=false;PNT=BOTR;EX=OUTR;JK=OUTR;
  const fill=R=>{SHTC=[0,1,2,3,4,5,6,7].map(()=>R);SH0=R;};fill(UNDER);
  if(kind==='top'){const T=TOPS[id];TOPDEF=T;OUT=T.out;fill(TOPR);LONG=!!T.long||!['tee','dress','tank','skirt','polo'].includes(OUT);SLEEVE=OUT==='tank'&&!T.long?null:{t:T.sleeveT||(LONG?.82:.42),R:T.sleeveR||null,bell:!!T.bell};
    if(T.skirt){SKLEN=T.skirt.len;SKFLARE=T.skirt.flare;}if(T.legs)BOTTOM={R:TOPR,rows:null};}
  else if(kind==='outer'){const O=OUTERS[id];OUT=O.out;LONG=!!O.sl||!!O.closed;TOPDEF=O;if(O.closed){fill(OUTR);SLEEVE={t:.82,R:null,puff:!!O.puff};}if(O.skirt){SKLEN=O.skirt.len;SKFLARE=O.skirt.flare;}
    if(OUT==='openshirt'){fill(OUTR);EX=UNDER;SLEEVE={t:.82,R:null};}else if(O.sl)SLEEVE={t:.82,R:OUTR};
    if(OUT==='overalls'){PNT=OUTR;BOTTOM={R:OUTR,rows:null};}}
  else if(kind==='bottom'){BOTTOM=Object.assign({R:BOTR},BOTTOMS[id]);if(BOTTOM.skirt){SKLEN=BOTTOM.len||0;SKFLARE=BOTTOM.flare||0;}}
  else if(kind==='shoes')SHOES=Object.assign({id},SHOESD[id]);
  else if(kind==='acc'){TOPDEF=BACC[id];GAUNT=!!TOPDEF.gaunt;}}
function splitLeg(y,hip,bot,far){const d=R=>far?dk(R,1):R;const B=BOTTOM;
  if(B&&B.rows!==0&&(B.rows==null||y<=hip+B.rows)){const bd=B.band&&B.band(y,hip,bot);return d(bd||B.R);}
  if(y<=hip+2)return d(UNDER);const up=bot-y;return d(up<=1?ANKR:up<=3?SHINR:up<=5?KNEER:SK);}
if(SPLIT)setWear('base');
// knee-length: three rows on long legs, two on short ones
const shortRows=()=>LEGH>=6?3:2;
function legRamp(y,hip,bot,R,far){if(SPLIT)return splitLeg(y,hip,bot,far);if(!SHORTS||y<=hip+shortRows())return R;if(SOX&&y>=bot)return far?dk(SOX,1):SOX;return far?dk(SK,1):SK;}
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
  if(SIT){/* seated (motion judge r2): the lap 2 px wider than the hips each side, two rounded knees with a 1 px cleft, the shins
     in the shadow under the knees, the boots. Facing away the seat is wide and dark and the shins hang in shadow */
    const RY=y=>SPLIT?splitLeg(y,hip,FOOT-3,false):R;
    for(let y=hip+1;y<=hip+2;y++)for(let x=cx-6;x<=cx+7;x++)p(x,y,RY(y)[back?(y===hip+1?2:1):(y===hip+1?4:x<=cx-5||x>=cx+6?2:3)]);
    for(const [k0,k1] of [[cx-6,cx],[cx+2,cx+8]]){const w=k1-k0;
      for(let i=0;i<w;i++){const edge=i===0||i===w-1;p(k0+i,hip+3,RY(hip+3)[back?1:edge?2:4]);p(k0+i,hip+4,RY(hip+4)[back?1:edge?1:3]);}}
    p(cx+1,hip+3,RY(hip+3)[0]);p(cx+1,hip+4,RY(hip+4)[0]);
    for(let y=hip+5;y<=FOOT-3;y++){const RS=SPLIT?RY(y):SHORTS?(SOX&&y===FOOT-3?SOX:SK):R;for(let i=0;i<4;i++){p(cx-4+i,y,RS[back?0:i===3?0:1]);p(cx+3+i,y,RS[back?0:i===0?0:1]);}}
    shoeFront(cx-5,FOOT-2,-1,back);shoeFront(cx+2,FOOT-2,1,back);return;}
  for(const [s,dy] of [[-1,dyL],[1,dyR]]){const x0=s<0?cx-4:cx+2,w=4,bot=hip+len+dy;
    for(let y=hip+1;y<=bot;y++){const RR=legRamp(y,hip,bot,R,false);for(let i=0;i<w;i++){let k=i===0?(s<0?4:3):i===w-1?(s<0?2:1):3;if(y===bot&&!SHORTS)k=Math.min(k,2);p(x0+i,y,RR[k]);}
      if(SHORTS&&y===hip+shortRows())for(let i=0;i<w;i++)p(x0+i,y,R[i===0||i===w-1?1:2]);}
    // a little knee crease halfway down
    if(len>5&&!LEGSKIN&&!SHORTS&&(!SPLIT||(BOTTOM&&BOTTOM.rows==null)))p(x0+(s<0?2:1),hip+(len>>1)+1+dy,(SPLIT?BOTTOM.R:R)[2]);
    if(SPLIT&&BOTTOM)legExtras(x0,hip,bot,s,back);
    shoeFront(s<0?cx-5:cx+2,bot+1,s,back);}
  // the crotch and the seam
  if(!LEGSKIN){const RC=SPLIT?splitLeg(hip+1,hip,FOOT-3,false):R;for(let i=-4;i<=5;i++)p(cx+i,hip+1,RC[i<-2?4:i>3?2:3]);p(cx,hip+2,RC[1]);p(cx+1,hip+2,RC[1]);}}
function legExtras(x0,hip,bot,s,back){const B=BOTTOM,R=B.R;
  if(B.flare)for(let y=bot-2;y<=bot;y++)q(s<0?x0-1:x0+4,y,R,s<0?(y===bot?2:3):1);
  if(B.pockets&&!back){const px=s<0?x0:x0+2;for(let i=0;i<2;i++)q(px+i,hip+3,R,1);q(px+(s<0?0:1),hip+4,R,1);q(px+(s<0?0:1),hip+5,R,1);}
  if(B.ragged){const y=hip+B.rows+1;for(let i=0;i<4;i++)if(((x0+i)>>1)&1)q(x0+i,y,R,1);}
  if(B.narrow){const i=s<0?0:3;for(let y=bot-1;y<=bot;y++){const c=G(LY[CUR],x0+i,y);if(c)q(x0+i,y,splitLeg(y,hip,bot+5,false),s<0?3:1);}}}
function shoeFront(x,y,s,back){if(SPLIT&&SHOES&&SHOES.f){SHOES.f(x,y,s,back);return;}if(SPLIT&&!SHOES){const F=SK;for(let i=0;i<4;i++)p(x+i+(s<0?1:0),y,F[back?2:i<1?4:3]);for(let i=0;i<5;i++)p(x+i,y+1,F[back?1:i===4||(s>0&&i>3)?2:3]);for(let i=0;i<5;i++)p(x+i,y+2,F[1]);return;}const R=SHO;const w=5;for(let i=0;i<w;i++){const lit=s<0?i<2:i<1;p(x+i,y,R[back?2:lit?4:3]);p(x+i,y+1,R[back?1:i===w-1||(s>0&&i>3)?2:3]);p(x+i,y+2,R[0]);}
  if(!back){p(x+(s<0?1:2),y,R[4]);}}
// side view: two columns that lean from the hip to the foot; the far one is darker. off: foot offset along the facing; lift: raised.
function legSide(hx,hip,off,lift,fl,far,crouch){const R=far?dk(LEGSKIN?SK:PNT,1):(LEGSKIN?SK:PNT);const len=FOOT-3-hip,fx=hx+off*fl,bot=hip+len-lift;
  if(SIT){const kx=hx+fl*(far?6:8);for(let y=hip+1;y<=hip+3;y++){const RR=SPLIT?splitLeg(y,hip,FOOT-3,far):R;for(let x=Math.min(hx-1,kx);x<=Math.max(hx-1,kx);x++)p(x,y,RR[y===hip+1?4:y===hip+3?1:3]);}
    segLeg(kx,hip+3,kx,FOOT-3,R,hip,FOOT-3,far);shoeSide(kx,FOOT-2,fl,far);return;}   /* seated (judge: the shortened legs read as a crouch) */
  if(crouch>2){// knees forward: thigh out, shin back down
    const kx=hx+fl*(2+Math.round(crouch/2)),ky=hip+Math.round(len*.45);segLeg(hx,hip+1,kx,ky,R,hip,bot,far);segLeg(kx,ky,fx,bot,R,hip,bot,far);}
  else if(lift>=2){// the swinging leg: thigh forward to the knee, shin back down to the raised foot
    const kx=hx+fl*(Math.max(0,off)+2),ky=hip+Math.round(len*.5)-1;segLeg(hx,hip+1,kx,ky,R,hip,bot,far);segLeg(kx,ky,fx,bot,R,hip,bot,far);}
  else segLeg(hx,hip+1,fx,bot,R,hip,bot,far);
  shoeSide(fx,bot+1,fl,far);}
function segLeg(x0,y0,x1,y1,R,hip,bot,far){const n=Math.max(1,Math.abs(y1-y0));for(let j=0;j<=n;j++){const x=Math.round(x0+(x1-x0)*j/n)-2,y=Math.round(y0+(y1-y0)*j/n);const RR=hip==null?R:legRamp(y,hip,bot,R,far);for(let i=0;i<4;i++)p(x+i,y,RR[i===0?4:i===3?1:3]);}}
function shoeSide(x,y,fl,far){if(SPLIT&&SHOES&&SHOES.s){SHOES.s(x,y,fl,far);return;}if(SPLIT&&!SHOES){const F=far?dk(SK,1):SK;const L=5;for(let i=0;i<L;i++){const xx=x+fl*(i-2);if(i>0)p(xx,y,F[i<2?2:4]);p(xx,y+1,F[i===0?1:3]);p(xx,y+2,F[1]);}return;}const R=far?dk(SHO,1):SHO;const L=6;for(let i=0;i<L;i++){const xx=x+fl*(i-2);p(xx,y,R[i===L-1?3:i<2?2:4]);p(xx,y+1,R[i===0?1:3]);p(xx,y+2,R[0]);}p(x+fl*3,y-1,R[3]);}
// ---------------------------------------------------------------- arms: a 3-px sleeve from the shoulder to the hand, its inner edge dark so it reads
// against the body, a cuff, and a small hand. Hands are given relative to the shoulder.
function armTo(sx,sy,hx,hy,far,inner,noHand){let cloth=(OUT==='jacket'||OUT==='cardigan'||OUT==='longcoat')?JK:null;const S2=far?dk(SPLIT?HANDR:SK,1):(SPLIT?HANDR:SK),SA=far?dk(SK,1):SK,SW=far?dk(WRISTR,1):WRISTR;
  const n=Math.max(1,Math.ceil(Math.hypot(hx-sx,hy-sy)));let sleeveT=OUT==='tank'?0:LONG?.82:.42;if(SPLIT){sleeveT=SLEEVE?SLEEVE.t:0;cloth=SLEEVE?SLEEVE.R:null;}
  for(let i=0;i<=n;i++){const t=i/n,x=Math.round(sx+(hx-sx)*t),y=Math.round(sy+(hy-sy)*t);const sl=t<sleeveT;
    if(sl&&SPLIT&&SLEEVE&&SLEEVE.puff&&t>.08){const RB=far?dk(cloth||shirtAt(x,y),1):(cloth||shirtAt(x,y));const notch=(i%3)===0;if(!notch){p(x-2,y,RB[3]);p(x+2,y,RB[1]);}}
    if(sl&&SPLIT&&SLEEVE&&SLEEVE.bell&&t>.5){const RB=far?dk(cloth||shirtAt(x,y),1):(cloth||shirtAt(x,y));p(x-2,y,RB[t>.75?2:3]);p(x+2,y,RB[1]);if(t>.75){p(x-2,y+1,RB[1]);p(x+2,y+1,RB[0]);}}
    for(let k=-1;k<=1;k++){let R0=sl?(cloth||shirtAt(x+k,y)):(SPLIT?(i>=n-1?SW:SA):S2);if(!sl&&SPLIT){const RR=R0;for(let kk=-1;kk<=1;kk++){}const edge=k===inner;p(x+k,y,RR[edge?1:k===-inner?(inner<0?2:4):3]);continue;}const R=far?dk(R0,1):R0;const edge=k===inner;p(x+k,y,R[edge?(SPLIT&&WEARK==='outer'&&sl&&hy<sy?0:1):k===-inner?(SPLIT&&WEARK==='outer'&&sl&&hy<sy?4:(inner<0?2:4)):3]);}}
  // cuff
  if(OUT!=='tank'&&sleeveT>0){const t=sleeveT,x=Math.round(sx+(hx-sx)*t),y=Math.round(sy+(hy-sy)*t);const R0=cloth||shirtAt(x,y);const R=far?dk(R0,1):R0;for(let k=-1;k<=1;k++)p(x+k,y,R[1]);}
  if(SPLIT&&GAUNT){for(let j=0;j<2;j++){const t=.72+j*.08,x=Math.round(sx+(hx-sx)*t),y=Math.round(sy+(hy-sy)*t);const R=far?dk(ACCR,1):ACCR;for(let k=-2;k<=2;k++)p(x+k,y,R[k===-2?4:k===2?1:j===0?3:2]);}}
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
    if(OUT==='shirt'||(OUT==='vest'&&!(SPLIT&&WEARK==='outer'))){p(cx,top,SK[2]);p(cx+1,top,SK[2]);for(const [u,c] of [[-2,WHITE],[-1,WHITE],[2,[214,208,198]],[3,[214,208,198]]])p(cx+u,top,c);p(cx-1,top+1,WHITE);p(cx+2,top+1,[214,208,198]);
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
    if(OUT==='polo'){// a polo: two collar points turned down in a light V (judge: the front read as one flat green), the open neck, a dark placket with one button
      const CL=SH0[4].map(c=>Math.min(255,Math.round(c*1.2+14))),CD=SH0[1];
      p(cx,top,SK[2]);p(cx+1,top,SK[2]);p(cx,top+1,SK[1]);p(cx+1,top+1,SK[1]);
      for(const u of [-3,-2,-1])p(cx+u,top,CL);for(const u of [2,3,4])p(cx+u,top,SH0[4]);p(cx-1,top+1,CL);p(cx-2,top+1,SH0[3]);p(cx+2,top+1,SH0[4]);p(cx+3,top+1,SH0[2]);
      p(cx-3,top+1,CD);p(cx+4,top+1,CD);p(cx,top+2,CD);p(cx+1,top+2,CD);p(cx+1,top+3,CD);p(cx,top+3,[226,222,206]);}
    if(C.collar){for(let u=-1;u<=2;u++)p(cx+u,top,WHITE);}
    if(C.badge){p(cx-4,top+3,[255,228,120]);p(cx-3,top+3,[240,200,80]);p(cx-4,top+4,[200,150,40]);p(cx-3,top+2,[255,228,120]);}}
  else{for(let u=-1;u<=2;u++)p(cx+u,top,SK[1]);if(OUT==='polo')for(let u=-2;u<=3;u++)p(cx+u,top,SH0[u<1?4:3]);if(OUT==='hoodie'){for(let j=0;j<4;j++){const hw=4-(j>2?1:0);for(let u=-hw+1;u<=hw;u++)p(cx+u,top+j,SH0[j===3?1:u<-1?4:u>2?2:3]);}}
    else for(let y=top+2;y<hip-1;y++)p(cx+1,y,((OPENFRONT[OUT]&&OUT!=='openshirt')?JK:SH0)[2]);}
  // hems: ribbed for knits, a belt for shirts, the bib for overalls
  if(OUT==='sweater'||OUT==='turtleneck'||OUT==='hoodie')for(let u=-5;u<=6;u++){p(cx+u,hem,SH0[(u&1)?1:2]);p(cx+u,hem-1,SH0[(u&1)?2:3]);}
  if(OUT==='tee'||OUT==='shirt'||(OUT==='openshirt'&&!(SPLIT&&WEARK==='outer'))){for(let u=-5;u<=6;u++)p(cx+u,hem,BELT[u<-3?2:u>4?0:1]);if(!back){p(cx,hem,BUCKLE[1]);p(cx+1,hem,BUCKLE[1]);}}
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
  const TSK=SPLIT&&(WEARK==='top'||WEARK==='outer')&&TOPDEF&&TOPDEF.skirt;if(OUT==='skirt'||OUT==='dress'||C.skirt||(SPLIT&&BOTTOM&&BOTTOM.skirt)||TSK){const R=(TSK&&TOPDEF.skirtR)||((OUT==='dress'||TSK)?SH0:(C.skirt?SKR:PNT));const len=SKLEN||(KID?4:6);for(let j=0;j<len;j++){const hw=6+Math.round(j*(SKFLARE||.6));for(let u=-hw+1;u<=hw;u++){let k=u<-hw+3?4:u>hw-2?1:u>hw-4?2:3;if(j===len-1)k=1;else if(TSK){if(j>1&&[-3,2,5].includes(u))k=Math.max(1,k-1);}else if(SPLIT&&BOTTOM&&BOTTOM.pleat){if(j>0&&(u+40)%3!==1)k=((u+40)%3===0)?Math.max(1,k-1):Math.min(4,k+1);}else if(((u+40)%3===0)&&j>0)k=Math.max(2,k-1);p(cx+u,hip+j,((OUT==='dress'||TSK)&&!(TSK&&TOPDEF.skirtR)?SH0:R)[k]);}}}}
// side view torso: narrower, chest forward
function torsoSide(cx,top,hip,fl){const hw=4+WIDE;for(let y=top;y<=hip;y++){const j=y-top;const back=(STOOP?(j<2?2:j<4?1:0):0)+(j>=1&&j<=3?1:0),front=(B.has('stout')&&j>=4?(j>=6?2:1):0)+(!ALL&&!KID&&j>=2&&j<=4?1:0);for(let u=-hw-back;u<=hw+front;u++){/* a back curve (shoulder blades) and a chest line: not a peg */const x=cx+u*fl+(fl<0?1:0);let k=u*fl<-hw+1.5?(fl>0?4:1):u*fl>hw-1.5?(fl>0?2:3):3;
      if(fl>0){k=u<-2?4:u>2?2:3;}else{k=u>2?4:u<-2?2:3;}if(j===0&&Math.abs(u)>=hw)continue;if(y>=hip-1)k=Math.max(1,k-1);
      let R=shirtAt(x,y);if(OUT==='openshirt'){if(u>=hw)R=EX;}else if(OPENFRONT[OUT]){R=(u>=hw-1&&OUT!=='vest')?shirtAt(x,y):JK;if(OUT==='vest'&&u<hw-1)R=JK;}p(x,y,R[k]);}}   // side on, the open shirt covers all but a sliver of tee at the chest
  if(ALL){for(let j=2;j<=5;j++){const u=hw+1,x=cx+u*fl+(fl<0?1:0);p(x,top+j,shirtAt(x,top+j)[j===2?3:j===5?1:fl>0?2:3]);if(j===3||j===4){const x2=cx+(hw+2)*fl+(fl<0?1:0);p(x2,top+j,shirtAt(x2,top+j)[j===3?2:1]);}}
    for(let j=0;j<3;j++)for(let u=hw-2+j;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),top+j,SK[j===2?2:3]);}
  if(OUT==='overalls'){for(let y=top+4;y<=hip;y++)for(let u=-1;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),y,PNT[u===hw?2:3]);for(let y=top+1;y<top+4;y++)p(cx+fl*1,y,PNT[2]);}
  if(OUT==='hoodie')for(let j=0;j<4;j++)for(let u=-hw;u<=-1;u++)p(cx+u*fl+(fl<0?1:0),top+j,SH0[j===3?1:2]);
  if(OUT==='tee'||OUT==='shirt'||(OUT==='openshirt'&&!(SPLIT&&WEARK==='outer')))for(let u=-hw;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),hip,BELT[1]);
  if(OUT==='polo'){for(let u=-2;u<=1;u++)p(cx+u*fl+(fl<0?1:0),top,SH0[4]);p(cx+2*fl+(fl<0?1:0),top+1,SH0[4]);}
  if(OUT==='sweater'||OUT==='hoodie'||OUT==='turtleneck')for(let u=-hw;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),hip,SH0[(u&1)?1:2]);
  if(OUT==='turtleneck')for(let y=top-2;y<top;y++)for(let u=-2;u<=2;u++)p(cx+u*fl,y,SH0[y===top-2?4:3]);
  if(C.apron)for(let y=top+3;y<=hip+(LEGSKIN?5:2);y++)for(let u=hw-1;u<=hw;u++)p(cx+u*fl+(fl<0?1:0),y,EX[u===hw?2:3]);}
function skirtSide(cx,hip,fl){if(OUT==='longcoat'&&SPLIT&&SIT){for(let j=0;j<=3;j++)for(let u=-5;u<=6;u++)p(cx+u*fl,hip+1+j,JK[j===3?1:j===0?4:u>4?2:3]);return;}if(OUT==='longcoat'){const len=KID?5:7;for(let j=0;j<len;j++){const hw=4+(j>>1);for(let u=-hw-1;u<=hw;u++)p(cx+u*fl,hip+1+j,JK[u*1<-hw+1?4:u>hw-2?1:3]);}}
  const TSK=SPLIT&&(WEARK==='top'||WEARK==='outer')&&TOPDEF&&TOPDEF.skirt;if(OUT==='skirt'||OUT==='dress'||C.skirt||(SPLIT&&BOTTOM&&BOTTOM.skirt)||TSK){const R=(TSK&&TOPDEF.skirtR)||((OUT==='dress'||TSK)?SH0:(C.skirt?SKR:PNT));const len=SKLEN||(KID?4:6);
    if(SPLIT&&SIT){const coat=WEARK==='outer';for(let j=0;j<=3;j++)for(let u=-5;u<=(coat?6:9);u++)p(cx+u*fl,hip+j,R[j===3?1:j===0?4:u>(coat?4:7)?2:3]);if(coat)return;for(let y=hip+4;y<hip+Math.min(len,9);y++)for(let u=6;u<=9;u++)p(cx+u*fl,y,R[u===9||y===hip+Math.min(len,9)-1?1:u===6?2:3]);return;}
    for(let j=0;j<len;j++){const hw=4+Math.round(j*(SKFLARE?SKFLARE*.85:.5));for(let u=-hw;u<=hw+1;u++)p(cx+u*fl,hip+j,R[j===len-1?1:u<-hw+2?4:u>hw-1?1:3]);}}}
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
  const BR=SPLIT?BROWR:HR;for(const s of [-1,1]){const b0=s<0?cx-5:cx+4;const y=hy-2-((EXPR==='surprised'||EXPR==='scared')?1:0);
    if(EXPR==='angry'||EXPR==='wince'){p(b0+(s<0?2:0),y+1,BR[1]);p(b0+1,y,BR[1]);p(b0+(s<0?0:2),y,BR[1]);}
    else if(EXPR==='sad'||EXPR==='scared'){p(b0+(s<0?2:0),y,BR[1]);p(b0+1,y,BR[1]);p(b0+(s<0?0:2),y+1,BR[1]);}
    else{p(b0,y+(s<0?1:0),BR[1]);p(b0+1,y,BR[1]);p(b0+2,y+(s<0?0:1),BR[1]);}}
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
  {const BR=SPLIT?BROWR:HR;p(ex-fl,ey-2,BR[1]);p(ex,ey-2,BR[1]);p(ex+fl,ey-2,BR[1]);}
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
// ---- wardrobe hairstyles (new): under = [top patch half-width, patch depth from the crown, shaved side (-1 the wearer's right), side-view front limit, side-view back keep];
// lift = [rows, half-width, centre] raises the crown over the forehead; flat squares the crown; recede = [depth, half-width, side-view reach]; jag = ragged ends
Object.assign(HS,{
  undercut: {vol:1,  crown:3,K:5,part:-3,fr:[-6,-2,2],side:[1,1],back:-4,tip:1,sweep:1,under:[5,4],underS:{side:[0,0],back:-3},shave:'skin',quiet:1},
  fade: {vol:1,  crown:3,K:6,part:0, fr:[-5,-4,1],side:[1,-1],back:-6,tip:1,under:[6,4],underS:{side:[0,0],back:-3},shave:'fade'},
  quiff: {vol:1,  crown:2,K:5,part:-1,fr:[-6,-3,1],side:[1,0],back:-5,tip:1,sweep:1,lift:[7,5,-1,2],under:[5,6],shave:'fade',underS:{side:[0,0],back:-3},quiffcurl:1,quiet:1},
  pompadour: {vol:1.5,crown:2,K:5,part:0, fr:[-7,-4,1],side:[1,0],back:-4,tip:1,lift:[6,6,0],quiet:1},
  flattop:  {vol:.5, crown:5,K:8,part:0, fr:[-5,-4,0],side:[1,-1],back:-6,tip:0,flat:1,under:[6,6],underS:{side:[0,-3]}},
  hightop: {vol:1.5,crown:6,K:7,part:0, fr:[-5,-4,0],side:[1,-1],back:-6,tip:0,flat:2,spikes:1,under:[8,8],underS:{side:[0,0],back:-3},shave:'fade',quiet:1},
  caesar:   {vol:.5, crown:2,K:7,part:0, fr:[-4,-4,0],side:[1,-1],back:-6,tip:0},
  curtains: {vol:1.5,crown:2,K:6,part:0, fr:[-6,1,2],side:[2,4],back:-2,tip:1},
  bedhead:  {vol:2,  crown:2,K:7,part:1, fr:[-3,-1,3],side:[2,2],back:-3,tip:2,spikes:3,jag:1},
  fauxhawk: {vol:.5, crown:2,K:6,part:0, fr:[-5,-4,1],side:[1,-1],back:-5,tip:1,lift:[4,2.5,0],spikes:2,under:[4,4],quiet:1},
  combover: {vol:.6, crown:1,K:6,part:-6,fr:[-5,-4,0],side:[1,0],back:-5,tip:0,sweep:1},
  receding: {vol:.8, crown:1,K:5,part:0, fr:[-5,-4,1],side:[1,1],back:-4,tip:1,recede:[6,6,4],quiet:1},
  cornrows: {vol:.3, crown:1,K:7,part:0, fr:[-5,-4,0],side:[0,-2],back:-4,tip:0,tex:'rows'},
  twists:   {vol:2.5,crown:3,K:5,part:0, fr:[-3,-2,2],side:[2,3],back:-1,tip:1,tex:'twist'},
  bowl: {vol:2,  crown:2,K:9,part:0, fr:[-2,-2,0],side:[2,1],back:-2,tip:0,level:1,quiet:1},
  widowpeak: {vol:.6, crown:2,K:7,part:0, fr:[-2,-7,0],side:[1,6],back:3,tip:1,frS:-5},
  tousled:  {vol:1.5,crown:2,K:6,part:-2,fr:[-4,0,3],side:[2,2],back:-2,tip:2,sweep:1,jag:1},
  wolf: {vol:3,  crown:2,K:8,part:-1,fr:[-3,0,3],side:[3,8],back:7,tip:3,spikes:3,jag:3,flare:2},
  sideshave: {vol:1.5,crown:2,K:5,part:-4,fr:[-5,-1,2],side:[2,14],back:10,tip:2,sweep:1,under:[2,5,-1,3,-7,3.5,6],shave:'skin',fall:1,quiet:1,level2:1},
  fingerwave:{vol:.8,crown:2,K:6,part:-3,fr:[-5,-2,0],side:[1,4],back:-2,tip:0,tex:'fwave',sweep:1},
  victory: {vol:1.5,crown:2,K:5,part:0, fr:[-7,-5,0],side:[2,6],back:3,tip:0,rolls2:1},
  emo: {vol:1.5,crown:2,K:6,part:-4,fr:[-5,6,2],side:[2,6],back:0,tip:2,sweep:1,deep:1,spikes:2,jag:1},
  abob: {vol:2,  crown:2,K:6,part:-2,fr:[-4,-1,2],side:[2,13],back:-5,tip:1,slant:1},
  shag:     {vol:2,  crown:2,K:6,part:0, fr:[-4,1,2],side:[2,9],back:5,tip:2,jag:1},
  curlybob: {vol:2,  crown:3,K:5,part:0, fr:[-3,-2,2],side:[3,8],back:1,tip:1,tex:'curl2',flare:3},
  shortlocs:{vol:1.5,crown:2,K:6,part:0, fr:[-3,-1,2],side:[2,1],back:-3,tip:1,ropes:{len:7,w:2}},
  waist: {vol:1.5,crown:2,K:6,part:.5,fr:[-5,-1,2],side:[2,21],back:17,tip:2,jag:2,quiet:1,level2:1},
  longfringe: {vol:1, crown:2,K:8,part:0,fr:[-1,-1,0],side:[2,16],back:12,tip:0},
  beachwaves:{vol:2, crown:2,K:5,part:-2,fr:[-5,-1,2],side:[2,15],back:11,tip:2,tex:'wave',sweep:1},
  bigcurls: {vol:3.5,crown:4,K:5,part:0, fr:[-3,-2,2],side:[3,14],back:10,tip:2,tex:'curl2'},
  lank: {vol:.3, crown:2,K:8,part:-1.5,fr:[-6,10,3],side:[2,20],back:16,tip:3,jag:2,deep:1,sweep:1,quiet:1,level2:1},
  sidetail: {vol:1,  crown:2,K:5,part:-2,fr:[-4,-2,2],side:[1,1],back:-4,tip:1,sidetail:1,sweep:1,quiet:1},
  lowtail: {vol:1,  crown:2,K:5,part:0, fr:[-5,-2,1],side:[1,1],back:-3,tip:1,lowtail:1,quiet:1},
  hightail: {vol:.8, crown:2,K:6,part:0, fr:[-6,-3,1],side:[1,0],back:-5,tip:0,hightail:1},
  plait: {vol:1,  crown:2,K:5,part:.5,fr:[-5,-2,1],side:[1,1],back:-3,tip:1,plait:1,quiet:1},
  plaits2:  {vol:1,  crown:2,K:5,part:.5,fr:[-5,-2,1],side:[1,1],back:-3,tip:1,plaits2:1},
  crownbraid:{vol:1, crown:2,K:5,part:0, fr:[-5,-3,1],side:[1,0],back:-4,tip:0,crownbraid:1},
  boxbraids:{vol:1.5,crown:2,K:6,part:0, fr:[-4,-2,1],side:[2,1],back:-3,tip:1,ropes:{len:20,w:3,mode:'braid'}},
  locs:     {vol:1.5,crown:2,K:6,part:0, fr:[-4,-1,2],side:[2,1],back:-3,tip:1,ropes:{len:19,w:3}},
  lowbun:   {vol:1,  crown:2,K:5,part:.5,fr:[-5,-2,1],side:[1,1],back:-3,tip:1,lowbun:1},
  messybun: {vol:1.5,crown:2,K:6,part:0, fr:[-4,0,3],side:[1,1],back:-4,tip:2,messybun:1,jag:1},
  gibson: {vol:3.5,crown:5,K:6,part:0, fr:[-7,-3,1],side:[3,1],back:-3,tip:1,bigbun:1,quiet:1},
  puffs:    {vol:.8, crown:2,K:6,part:0, fr:[-6,-4,0],side:[1,0],back:-5,tip:0,puffs:1},
  ringlets: {vol:1.5,crown:2,K:5,part:0, fr:[-4,-1,1],side:[1,1],back:-2,tip:1,ringlets:1},
  braidbun: {vol:1,  crown:2,K:5,part:0, fr:[-5,-3,1],side:[1,0],back:-4,tip:0,braidbun:1},
});
function hairFor(st){if(!st||st==='bald')return null;const S=Object.assign({},HS[st]||HS.short);if(C.hairLen){S.side=[S.side[0],C.hairLen];S.back=Math.max(S.back,C.hairLen-4);}return S;}
// shade one hair pixel: global light from the upper left, the lock's lit and dark edges, a streak near the top
function hairTone(S,su,y,hw,cyc,ry,f,edgeL,below){let light=y<=cyc?-.55*(su/hw)-.75*((y-cyc)/(ry+1)):-.5*(su/hw)-.15-(y-cyc)*.02;
  let k=light>.62?4:light>.18?3:light>-.32?2:1;
  if(S.tex==='buzz'){k=((Math.round(su+.5)+y)&1)?Math.max(1,k-1):k;return k;}
  if(f<.22)k=Math.min(4,k+1);else if(f>.8)k=Math.max(1,k-1);
  if(y<cyc-2&&f>.2&&f<.42&&light>.05)k=4;
  if(below)k=Math.max(1,k-1);
  return k;}
// the geometry of a style seen from the front or the back: its silhouette (inside), its locks (lockF) and its extent
const BUZZ={vol:0,crown:1,K:10,part:0,fr:[-5,-4,0],side:[0,-2],back:-6,tip:0,tex:'buzz'};
function hairGeoF(cx,hy,back,S){const chin=hy+9,top=chin-HEADH+1;
  const hw=8+S.vol,topY=top-S.crown,cyc=hy-1,ry=cyc-topY,LIFT=S.lift?Math.round(S.lift[0]*(back?.6:1)):0;
  const EX=S.flat?(S.flat===2?3.6:5):2.6,EY=S.flat?(S.flat===2?5:8):3;   // a flat top: a squarer crown (2: softer corners)
  const ryAt=su=>LIFT?ry+LIFT*Math.sqrt(Math.max(0,1-Math.pow((su-(back?0:(S.lift[2]||0)))/S.lift[1],2))):ry;   // a quiff or pompadour: the crown raised over the forehead
  const ox=cx+.5+(back?0:S.part),oy=topY-3-LIFT;const ang=(x,y)=>Math.atan2(x+.5-ox,y+.5-oy);
  const A0=ang(cx-hw-2,hy+4),A1=ang(cx+hw+2,hy+4),K=back?S.K+1:S.K;const lockF=(x,y)=>{let a=(ang(x,y)-A0)/(A1-A0)*K;if(S.tex==='wave')a+=Math.sin(y*.7)*.25;else if(S.tex==='fwave')a+=Math.sin(y*.9)*.5;return a;};
  const sideBot=hy+S.side[1],backBot=chin+S.back,faceHalf=7.5;
  const tipAt=(x,y,d)=>{const lf=lockF(x,y),f=((lf%1)+1)%1;return Math.round(d*(1-Math.abs(2*f-1)))+(S.jag&&y>hy?Math.round(hsh(Math.floor(lf)+40,7,3)*S.jag):0);};
  const fringeY=su=>{const t=S.sweep?clamp((su+7)/14,0,1):Math.min(1,Math.abs(su-(back?0:S.part))/7);return hy+S.fr[0]+(S.fr[1]-S.fr[0])*t;};
  const inside=(x,y)=>{const u=x-cx,su=u-.5,a=Math.abs(su);
    const bump=S.tex==='curl'?1+.09*Math.sin(Math.atan2(cyc-y,su)*9):1;const ryE=ryAt(su);
    const crownIn=y<=cyc&&Math.pow(a/((hw+.5)*bump),EX)+Math.pow((cyc-y)/((ryE+.5)*bump),EY)<=1;
    let topOK=crownIn;if(S.spikes&&y<topY+S.spikes&&!crownIn){const tip=tipAt(x,y,S.spikes);topOK=a<hw-1&&Math.pow(a/(hw+.5),EX)+Math.pow((cyc-y-tip)/(ryE+.5),EY)<=1;}
    if(back){if(topOK)return true;if(y<=cyc)return false;const taper=y>chin+1?Math.min(3,(y-chin-1)*.3):0;return a<=hw+.5-taper&&y<=backBot+tipAt(x,y,S.tip);}
    if(a<faceHalf){return (topOK||(S.deep&&y>cyc&&a<hw))&&y<fringeY(su)+tipAt(x,y,S.fr[2]);}
    if(topOK)return true;if(y<=cyc)return false;
    const outer=(y>chin+1?hw+.5-Math.min(3,(y-chin-1)*.25):hw+.5)+(S.flare?S.flare*clamp((y-hy+2)/8,0,1):0);if(a>outer)return false;if(a<faceHalf+(y>chin?-1.5:0)&&y>chin)return a>=faceHalf-1.5&&y<=sideBot+tipAt(x,y,S.tip);
    return a>=faceHalf&&y<=sideBot+tipAt(x,y,S.tip)&&(S.side[0]>0||y<=hy+1);};
  const minY=topY-(S.spikes||0)-1-LIFT,maxY=Math.max(back?backBot:sideBot,hy)+S.tip+2+(S.jag||0);
  return {inside,lockF,hw,topY,cyc,ry,ox,oy,minY,maxY,chin,top};}
// which zone a pixel is in: 1 the style's hair, 2 a shaved (undercut / fade / side shave) zone, 0 none
function hairZoneF(cx,back,S,Gm,GB){const U=S.under;return (x,y)=>{const su=x-cx-.5,a=Math.abs(su);let z=Gm.inside(x,y)?1:0;
    if(U){const sd=U[2]||0,sideOK=!sd||(back?su*sd<0:su*sd>0),patch=(back&&!sd?y<=Gm.topY+U[1]+2+Math.round(hsh(x,3,13)*2):(a<=U[0]||y<=Gm.topY+U[1]))||(back&&U[5]!=null&&(a<=U[5]||y>Gm.cyc+U[6]));
      if(z&&sideOK&&!patch)z=0;if(!z&&sideOK&&!patch&&GB.inside(x,y))z=2;}
    if(z===1&&S.recede){const [rh,rw]=S.recede;if(back?(a<rw-2.5&&y<Gm.topY+rh-3):(a<rw&&y<Gm.topY+rh))z=0;}
    return z;};}
// strand textures: locs and box braids hang in round ropes with a dark gap between; cornrows part the scalp in lines
function strandTone(S,lf,f,x,y,k,cyc){if(S.tex==='rows'){if(f>.82)return -2;return f<.35?Math.min(4,k+1):f>.65?Math.max(1,k-1):k;}
  if(y<cyc-3&&S.tex!=='box')return k;
  let t=f<.3?Math.min(4,k+1):f>.72?1:k;if(S.tex==='box'&&f>=.3&&f<=.72&&((y+(Math.floor(lf)&1))%3===0))t=Math.max(1,t-1);return t;}
// a shaved zone: 'skin' shows the scalp under the top's shadow, 'fade' steps from hair down to skin, otherwise short dark hair
function shaveTone(S,zone,x,y,xs,cyc,ry,back){let d=0;while(d<12&&zone(x,y-d-1)===2)d++;let h=0;while(h<12&&zone(x,y+h+1)===2)h++;const under=zone(x,y-1)===1;
  const light=-.5*xs-.6*((y-cyc)/(ry+1));let k=light>.25?2:1;
  const run=hsh(x,Math.floor((y+Math.floor(hsh(x,3,9)*3))/3),23);if(run<.28)k=Math.max(0,k-1);else if(run>.8)k=Math.min(2,k+1);   /* uneven vertical runs */
  if(under&&hsh(x,y,31)>.25)k=0;   /* the longer hair above throws a ragged shadow */
  const fade=S.shave==='fade'?[.85,.55,.2]:[.6,.2,0],ch=hsh(x,7,41);
  if(h<3&&!under&&ch<fade[h])return p(x,y,h===0?SK[2]:SK[1]);   /* skin shows on a wandering edge at the bottom */
  p(x,y,HR[k]);}
// cornrows: a 2-px braid then a 1-px parting of scalp, the braid lit on its left with a notch every other row
function rowTone(f,y,k,alt){if(f>=.67)return -2;if(alt)k=Math.max(1,k-1);const lit=f<.33;let t=lit?Math.min(4,k+1):k;if(!lit&&(y&1))t=Math.max(1,t-1);return t;}
// clustered curls (bigcurls, curly bob, high top): a short lit arc and a dark crescent in about half the cells, the rest quiet
function curl2Tone(x,y,k){const cy=Math.floor(y/4),sx=x+(cy&1)*2,cc=Math.floor(sx/5);if(hsh(cc,cy,17)<.45)return k;const ox=((sx%5)+5)%5,oy=((y%4)+4)%4;
  if(oy===0&&(ox===1||ox===2))return Math.min(4,k+1);if((oy===1&&ox===3)||(oy===2&&(ox===2||ox===3)))return Math.max(1,k-1);return k;}
// tight twists: short coils stacked in staggered columns, lit at the top left, a dark notch under each
function twistTone(x,y,k){const col=Math.floor(x/3),ly=(((y+(col&1)*2)%4)+4)%4,lx=((x%3)+3)%3;if(ly===0&&lx<2)return Math.min(4,k+1);if(ly===3&&lx>0)return Math.max(1,k-2);if(lx===2)return Math.max(1,k-1);return k;}
function hairFront(cx,hy,back,st,pose){const S=hairFor(st);if(!S)return null;
  const Gm=hairGeoF(cx,hy,back,S),{lockF,hw,topY,cyc,ry,ox,oy,minY,maxY}=Gm;
  const GB=S.under?hairGeoF(cx,hy,back,Object.assign({},BUZZ,S.underS||{})):null;const zone=hairZoneF(cx,back,S,Gm,GB),inside=(x,y)=>zone(x,y)===1;
  for(let y=minY;y<=maxY;y++)for(let u=-Math.ceil(hw)-1;u<=Math.ceil(hw)+2;u++){const x=cx+u;const z=zone(x,y);if(!z)continue;const su=u-.5;
    if(z===2){shaveTone(S,zone,x,y,su/8,cyc,ry,back);continue;}
    const lf=lockF(x,y),f=((lf%1)+1)%1;const below=!inside(x,y+1);
    let k=hairTone(S,su,y,hw,cyc,ry,f,false,below);
    // lock borders: dark where the next pixel along belongs to another lock
    if(S.tex!=='buzz'&&S.tex!=='curl'&&S.tex!=='curl2'&&Math.hypot(x+.5-ox,y+.5-oy)>6&&Math.floor(lockF(x+1,y))!==Math.floor(lf)&&inside(x+1,y)&&inside(x,y-1)&&(!S.quiet||!inside(x-3,y)||!inside(x+3,y)||!inside(x,y+3)))k=y>cyc-3?1:Math.min(k,2);
    if(S.tex==='curl')k=curlTone(x,y,k);
    if(S.tex==='twist')k=twistTone(x,y,k);
    if(S.tex==='curl2')k=curl2Tone(x,y,k);
    if(S.tex==='locs'||S.tex==='box')k=strandTone(S,lf,f,x,y,k,cyc);
    if(S.tex==='rows'){const rv=back?Math.atan2(x-cx-.5,(hy+16)-y)*9.5/Math.PI*2:(x-cx+.5)/3;k=rowTone((rv%1+1)%1,y,k,Math.floor(rv)&1);}
    if(S.crest&&Math.abs(su)>2.6)k=-1;
    p(x,y,k===-2?SK[1]:k<0?(CFG.hang?(hsh(x,Math.floor((y+Math.floor(hsh(x,5,3)*3))/3),29)<.35?HR[1]:SK[1]):(((x+y)&1)?HR[1]:SK[2])):HR[k]);}
  // the fringe throws a shadow on the forehead
  if(!back)for(let u=-6;u<=7;u++){const x=cx+u;for(let y=minY;y<hy+2;y++)if(inside(x,y)&&!inside(x,y+1)){const c=G(LY.body,x,y+1);if(c&&!g(x,y+1))p(x,y+1,SK[2]);break;}}
  hairExtras(cx,hy,back?'N':'S',S,1);
  return {top:topY,hw};}
function hairGeoS(cx,hy,fl,S){const chin=hy+9,top=chin-HEADH+1;
  const hw=8+S.vol,topY=top-S.crown,cyc=hy-1,ry=cyc-topY;const ccx=cx-fl*1,LIFT=S.lift?S.lift[0]:0;
  const EX=S.flat?(S.flat===2?3.6:5):2.6,EY=S.flat?(S.flat===2?5:8):3;
  const ryAt=a=>LIFT?ry+LIFT*Math.sqrt(Math.max(0,1-Math.pow((a-hw*.3-(S.lift[3]||0))/(S.lift[1]+1),2))):ry;
  const ox=cx+.5+fl*3,oy=topY-3-LIFT;const ang=(x,y)=>Math.atan2((x+.5-ox)*-fl,y+.5-oy);const A0=ang(cx+fl*(hw+2),hy),A1=ang(cx-fl*(hw+3),hy+8);const K=S.K;
  const lockF=(x,y)=>{let a=(ang(x,y)-A0)/(A1-A0)*K;if(S.tex==='wave')a+=Math.sin(y*.7)*.25;else if(S.tex==='fwave')a+=Math.sin(y*.9)*.5;return a;};
  const tipAt=(x,y,d)=>{const lf=lockF(x,y),f=((lf%1)+1)%1;return Math.round(d*(1-Math.abs(2*f-1)))+(S.jag&&y>hy?Math.round(hsh(Math.floor(lf)+40,7,3)*S.jag):0);};
  const sideBot=hy+S.side[1],backBot=chin+S.back;
  const inside=(x,y)=>{const uf=(x-cx)*fl,a=(x-ccx)*fl;   // uf: forward of the axis; a: from the crown's centre
    const ryE=ryAt(a);const crownIn=y<=cyc&&Math.pow(Math.abs(a+.5*fl*0)/(hw+.5),EX)+Math.pow((cyc-y)/(ryE+.5),EY)<=1;
    let topOK=crownIn;if(S.spikes&&y<topY+S.spikes&&!crownIn){const tip=tipAt(x,y,S.spikes);topOK=Math.abs(a)<hw-1&&Math.pow(Math.abs(a)/(hw+.5),EX)+Math.pow((cyc-y-tip)/(ryE+.5),EY)<=1;}
    // the forehead and face stay clear in front of the ear
    if(uf>=1){const fy=S.level?hy+S.fr[0]+1:hy+(S.frS!=null?S.frS:S.fr[0])+(uf>=5?-1:0)+Math.min(2,(7-uf)*.3);return topOK&&y<fy+tipAt(x,y,Math.min(2,S.fr[2]));}
    if(topOK)return true;if(y<=cyc)return false;
    if(uf>=-3&&uf<=-1&&y>=hy&&y<=hy+3&&S.side[1]<4)return false;           // the ear shows under short hair
    if(uf>=-1)return y<=sideBot+tipAt(x,y,S.tip)&&S.side[0]>0;           // the sideburn
    const outer=-(hw+.5)+(y>chin+1?Math.min(HANGTAPER,(y-chin-1)*.25):0);
    if(S.slant&&uf<-1){const t=clamp((-uf-1)/(hw-1),0,1);return uf>=outer-1&&y<=Math.round(sideBot+(backBot-sideBot)*t)+tipAt(x,y,S.tip);}
    const bot=Math.max(backBot,sideBot);return uf>=outer-1&&y<=bot+(S.level2&&bot>chin+4?Math.min(1,tipAt(x,y,S.tip)):tipAt(x,y,S.tip));};
  const minY=topY-(S.spikes||0)-1-LIFT,maxY=Math.max(backBot,sideBot,hy)+S.tip+2+(S.jag||0);
  return {inside,lockF,hw,topY,cyc,ry,ox,oy,minY,maxY,ccx,chin,top};}
function hairZoneS(cx,fl,S,Gm,GB){const U=S.under;return (x,y)=>{const uf=(x-cx)*fl;let z=Gm.inside(x,y)?1:0;
    if(U){const sd=U[2]||0,sideOK=!sd||(sd<0?fl>0:fl<0),patch=y<=Gm.topY+U[1]||uf>=(U[3]!=null?U[3]:-2)||(U[4]!=null&&uf<=U[4]);
      if(z&&sideOK&&!patch)z=0;if(!z&&sideOK&&!patch&&GB.inside(x,y))z=2;}
    if(z===1&&S.recede){const [rh,,rb]=S.recede;if(uf>-(rb||3)&&y<Gm.topY+rh)z=0;}
    return z;};}
function hairSide(cx,hy,fl,st,pose){const S=hairFor(st);if(!S)return null;
  const Gm=hairGeoS(cx,hy,fl,S),{lockF,hw,topY,cyc,ry,ox,oy,minY,maxY,ccx}=Gm;
  const GB=S.under?hairGeoS(cx,hy,fl,Object.assign({},BUZZ,S.underS||{})):null;const zone=hairZoneS(cx,fl,S,Gm,GB),inside=(x,y)=>zone(x,y)===1;
  for(let y=minY;y<=maxY;y++)for(let u=-Math.ceil(hw)-3;u<=Math.ceil(hw)+2;u++){const x=cx+u;const z=zone(x,y);if(!z)continue;const su=(x-ccx)*fl-.5;
    if(z===2){shaveTone(S,zone,x,y,-su/8,cyc,ry);continue;}
    const lf=lockF(x,y),f=((lf%1)+1)%1;const below=!inside(x,y+1);let k=hairTone(S,-su,y,hw,cyc,ry,f,false,below);
    if(S.tex!=='buzz'&&S.tex!=='curl'&&S.tex!=='curl2'&&Math.hypot(x+.5-ox,y+.5-oy)>6&&Math.floor(lockF(x-fl,y))!==Math.floor(lf)&&inside(x-fl,y)&&inside(x,y-1)&&(!S.quiet||!inside(x-3,y)||!inside(x+3,y)||!inside(x,y+3)))k=y>cyc-3?1:Math.min(k,2);
    if(S.tex==='curl')k=curlTone(x,y,k);
    if(S.tex==='twist')k=twistTone(x,y,k);
    if(S.tex==='curl2')k=curl2Tone(x,y,k);
    if(S.tex==='locs'||S.tex==='box')k=strandTone(S,lf,f,x,y,k,cyc);
    if(S.tex==='rows'){const ex_=(x-ccx)*fl/(hw+.5),ey_=(cyc+2-y)/(ry+3),r_=Math.hypot(ex_,ey_);k=rowTone((r_*5.2%1+1)%1,y,k);}
    if(S.crest&&Math.abs((x-cx)*fl+1)>2.6)k=-1;
    p(x,y,k===-2?SK[1]:k<0?(CFG.hang?(hsh(x,Math.floor((y+Math.floor(hsh(x,5,3)*3))/3),29)<.35?HR[1]:SK[1]):(((x+y)&1)?HR[1]:SK[2])):HR[k]);}
  hairExtras(cx,hy,fl>0?'E':'W',S,fl);
  if(CFG.hang&&HAIRLEAN){const L=LY[CUR],ch=hy+9;const T=new Uint8ClampedArray(L.d);for(let y=ch+1;y<FH;y++){const s=-Math.round(HAIRLEAN*.5*Math.min(1,(y-ch)/10));if(!s)continue;for(let x=0;x<FW;x++){const i=(y*FW+x)*4;L.d[i+3]=0;}for(let x=0;x<FW;x++){const sx=x-s;if(sx<0||sx>=FW)continue;const j=(y*FW+sx)*4,i=(y*FW+x)*4;if(T[j+3]){for(let c=0;c<4;c++)L.d[i+c]=T[j+c];}}}}
  return {top:topY,hw};}
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
  if(S.pigs){for(const s of [-1,1]){if(side&&s*fl>0)continue;const bx=side?cx-fl*7:cx+.5+s*10;for(let j=0;j<8;j++){const w=j<2?2:j<6?2:1;for(let i=-w;i<=w;i++)p(bx+i+(side?0:s*Math.round(j*.3)),hy+1+j,R[i<0?4:i>0?2:3]);}p(bx-1,hy,ACCR[3]);p(bx,hy,ACCR[2]);p(bx+1,hy,ACCR[3]);}}
  hairExtras2(cx,hy,view,S,fl);}
// ---- wardrobe hair extras (new styles): ropes, plaits, tails, buns, puffs, rolls and ringlets
// a pixel of hair's deepest step along the edge of a strand, wherever something (body or hair) lies under it, so a tail reads over a shirt
const hairEdge=(x,y)=>{x=Math.round(x);y=Math.round(y);if(g(x,y))return;if(G(LY.body,x,y))p(x,y,HR[0]);};
// a hanging strand along a path of points, one row at a time; w(y,t,seg) gives its width.
// mode 'braid' (lobes alternating left and right), 'rope' (lit left, dark right, a lock line), 'ring' (a corkscrew curl), 'loc' (a round rope, a soft segment line)
function strandPath(pts,wAt,R,mode,noEdge){const rows=[];for(let s=0;s<pts.length-1;s++){const [x0,y0]=pts[s],[x1,y1]=pts[s+1];const n=Math.max(1,Math.abs(y1-y0));
    for(let j=(s?1:0);j<=n;j++){const t=j/n,x=x0+(x1-x0)*t,y=Math.round(y0+(y1-y0)*t);const w=wAt(y,t,s);rows.push([Math.round(x-(w-1)/2),y,w]);}}
  rows.forEach(([xl,y,w],ri)=>{
    for(let i=0;i<w;i++){let k;
      if(mode==='braid'){const q=((y%4)+4)%4,L=q<2;// a lobe on the left for two rows, then one on the right
        if(w>=4){const lob=L?[3,4,2,1]:[1,2,4,2];const lob2=L?[2,3,2,1]:[1,2,3,1];k=(q&1?lob2:lob)[Math.min(3,Math.round(i*3/(w-1)))];}
        else if(w===3)k=L?[4,2,1][i]:[1,3,2][i];else k=L?[3,1][i]:[2,2][i];}
      else if(mode==='ring'){const q=(((y>>1)+(ri>>3))&1);k=i===w-1?1:q?(i===0?4:3):(i===0?2:2);}
      else if(mode==='loc'){k=i===0?3:i===w-1?1:2;if(((y+ri)%5)===0&&i<w-1)k=Math.max(1,k-1);}
      else k=i===0?(w>2?3:4):i===w-1?1:(i===1&&w>3?4:(w>3&&i===w-2)?2:3);
      p(xl+i,y,R[k]);}
    if(!noEdge){hairEdge(xl-1,y);hairEdge(xl+w,y);}});
  if(!noEdge&&rows.length){const [xl,y,w]=rows[rows.length-1];for(let i=0;i<w;i++)hairEdge(xl+i,y+1);}}
// a braid lying across the head (a crown braid): rows y(x) from x0 to x1, h rows thick, a deep line above and below so it reads over the hair
const BRAIDTILE=[[3,1,3,4],[4,3,1,3],[4,3,1,3],[2,1,2,3]];
function braidAcross(x0,x1,yAt,h,R){for(let x=x0;x<=x1;x++){const y0=Math.round(yAt(x)),q=((x%4)+4)%4;
    p(x,y0-1,R[0]);for(let j=0;j<h;j++)p(x,y0+j,R[BRAIDTILE[Math.min(3,j)][q]]);p(x,y0+h,R[0]);}}
function tieAt(x,y,w){for(let i=0;i<w;i++)p(x+i,y,ACCR[i===0?3:i===w-1?1:2]);}
// a deep ring round a blob that sits over hair, so a bun or puff stands off the head
function blobRing(cx,cy,rx,ry){for(let y=-ry-1;y<=ry+1;y++)for(let x=-rx-1;x<=rx+1;x++){const d=x*x/((rx+.5)*(rx+.5))+y*y/((ry+.5)*(ry+.5)),d2=x*x/((rx+1.5)*(rx+1.5))+y*y/((ry+1.5)*(ry+1.5));if(d>1&&d2<=1&&(y>0||x>0)){const X=Math.round(cx+x),Y=Math.round(cy+y);if(g(X,Y))p(X,Y,HR[0]);}}}
// a blob with the curl texture (puffs)
function curlBlob(cx,cy,rx,ry,R){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx+.01)+y*y/(ry*ry+.01);const bump=1+.1*Math.sin(Math.atan2(y,x)*7);if(d>bump*bump)continue;
    const l=-x/(rx+.01)*.5-y/(ry+.01)*.7;let k=l>.45?4:l>0?3:l>-.4?2:1;if(d>.7&&(x>0||y>0))k=Math.max(1,k-1);k=curlTone(Math.round(cx+x),Math.round(cy+y),k);p(cx+x,cy+y,R[k]);}}
// a roll seen end-on: a lit ring around a dark core
function rollEnd(cx,cy,r,R){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d>r+.3)continue;const l=-x*.5-y*.7;let k=d<r*.45?1:l>.8?4:l>-.6?3:2;if(d>r-.7&&(x>0||y>0))k=Math.max(1,k-1);p(cx+x,cy+y,R[k]);}}
// locs and box braids: separate ropes hanging from under the hair
function ropesView(cx,hy,view,fl,S,R){const chin=hy+9,L=S.ropes,len=L.len,mode=L.mode||'loc',w=L.w||2;const hs=(i)=>hsh(i+3,11,5),R2=dk(R,1);
  const rope=(x0,y0,x1,y1,ww,RR,sw)=>strandPath([[x0,y0],[(x0+x1)/2+sw,(y0+y1)/2],[x1,y1]],(y)=>y>y1-2&&ww>2?ww-1:ww,RR,mode);
  if(view==='S'){for(const s of [-1,1])for(let i=0;i<3;i++){const x=cx+.5+s*(7.5+i*1.35+(hs(i+7)-.5)*.6),y0=hy-2+i,y1=hy+len-i*2-Math.round(hs(i+(s>0?5:0))*6);rope(x,y0,x+s*.8,y1,w,(i+(s>0?1:0))%2?R2:R,s*(hs(i+40)-.5));}}
  else if(view==='N'){for(let y=hy-2;y<=chin+len-12;y++){const w=Math.round(8.5-Math.max(0,y-chin-2)*.15);for(let x=-w+1;x<=w;x++)p(cx+x,y,R[y>chin+len-14?0:1]);}const xs=[-7.2,-4.6,-1.5,1.2,4.4,7.3],ws=[w,w+1,w,w+1,w,w];const ord=[0,2,4,5,3,1];for(const i of ord){const x=cx+.5+xs[i]+(hs(i+20)-.5)*1.2,y1=chin+len-6-Math.round(hs(i)*8)-(i===0||i===5?2:0);rope(x,hy-3,x+(x-cx)*.1,y1,ws[i],i%2?R2:R,(hs(i+50)-.5)*1.6);}}
  else{for(let y=hy;y<=hy+len-8;y++)for(let u=-9;u<=-1;u++)p(cx+u*fl,y,R[1]);for(let i=3;i>=0;i--){const x=cx-fl*(1+i*2.5+(hs(i+30)-.5)*.8),y1=hy+len-1-(i===0?3:0)-Math.round(hs(i+9)*7);rope(x,hy-1,x-fl*.9,y1,i===1?w+1:w,i%2?R2:R,-fl*(hs(i+60)-.3));}}}
function hairExtras2(cx,hy,view,S,fl){const chin=hy+9,top=chin-HEADH+1,topY=top-S.crown;const R=HR;const side=view==='E'||view==='W';
  if(S.ropes)ropesView(cx,hy,view,fl,S,R);
  if(S.lowtail){if(view==='N'){tieAt(cx-1,hy+6,4);strandPath([[cx+.5,hy+7],[cx+.5,chin+4],[cx+1,chin+11]],y=>y<chin+4?5:y<chin+8?4:3,R,'rope');}
    else if(side){tieAt(cx-fl*7-(fl>0?1:0),hy+5,2);strandPath([[cx-fl*7.5,hy+6],[cx-fl*8,chin+2],[cx-fl*7,chin+10]],y=>y<chin+4?4:3,R,'rope');}}
  if(S.hightail){if(view==='N'){strandPath([[cx+.5,topY+6],[cx+.5,hy+4],[cx+1,chin+2],[cx+.5,chin+7]],y=>y<hy+5?5:y<chin+3?4:3,R,'rope');lockBlob(cx+.5,topY+3,2,2,R);tieAt(cx-1,topY+5,4);}
    else if(side){strandPath([[cx-fl*5,topY+1],[cx-fl*9,topY+3],[cx-fl*11,hy],[cx-fl*11,hy+6],[cx-fl*10,chin+4]],(y,t,s)=>s<2?5:s<3?4:3,R,'rope');tieAt(cx-fl*5-(fl>0?1:0),topY+1,2);}
    else lockBlob(cx+.5,topY,3,1,R);}
  if(S.sidetail){// tied low on the left side and brought forward over the left shoulder (screen right from the front)
    if(view==='S'){strandPath([[cx+8.5,hy+4],[cx+9,chin],[cx+7.5,chin+5],[cx+7,chin+11]],y=>y<hy+7?3:y<chin+6?4:y<chin+9?3:2,R,'rope');tieAt(cx+7,hy+3,3);}
    else if(view==='N'){strandPath([[cx-8,hy+4],[cx-9,chin+1]],y=>4,R,'rope');tieAt(cx-9,hy+3,3);}
    else if(view==='W'){strandPath([[cx+3.5,hy+5],[cx+3,chin+2],[cx+1,chin+11]],y=>y<hy+8?3:y<chin+7?4:y<chin+9?3:2,R,'rope');tieAt(cx+2,hy+4,3);}}
  if(S.plait){if(view==='N'){strandPath([[cx+.5,hy+4],[cx+.5,chin+6],[cx+1,chin+14]],y=>y<chin+10?4:3,R,'braid');tieAt(cx,chin+15,2);}
    else if(side){strandPath([[cx-fl*7.5,hy+4],[cx-fl*8,chin+5],[cx-fl*7,chin+12]],y=>y<chin+8?4:3,R,'braid');tieAt(cx-fl*7-1,chin+13,2);}}
  if(S.plaits2){// two long plaits behind the shoulders
    if(view==='N'){for(const s of [-1,1])strandPath([[cx+.5+s*4,hy+4],[cx+.5+s*5,chin+6],[cx+.5+s*5,chin+13]],y=>y<chin+9?4:3,R,'braid');tieAt(cx-6,chin+14,2);tieAt(cx+5,chin+14,2);}
    else if(side){strandPath([[cx-fl*6.5,hy+4],[cx-fl*7.5,chin+5],[cx-fl*7,chin+12]],y=>y<chin+8?4:3,R,'braid');tieAt(cx-fl*7-1,chin+13,2);}
    else{for(const s of [-1,1])strandPath([[cx+.5+s*8.5,hy+2],[cx+.5+s*9,chin+2]],y=>3,R,'braid');}}
  if(S.crownbraid){if(view==='S')braidAcross(cx-8,cx+9,x=>topY+2+Math.pow(Math.abs(x-cx-.5)/8.5,2)*5,4,R);
    else if(view==='N')braidAcross(cx-8,cx+9,x=>topY+4+Math.pow(Math.abs(x-cx-.5)/8.5,2)*4,4,R);
    else{for(let j=-1;j<=11;j++){const t=j/10,x=Math.round(cx+fl*(5-t*10)),y=Math.round(topY+1+Math.pow(Math.max(0,t),1.6)*9);const q=((j%4)+4)%4;
      p(x,y-1,R[0]);for(let i=0;i<4;i++)p(x,y+i,R[BRAIDTILE[i][q]]);p(x,y+4,R[0]);}}}
  if(S.lowbun){if(view==='N'){lockBlob(cx+.5,chin-3,4,3,R);blobRing(cx+.5,chin-3,4,3);}else if(side)lockBlob(cx-fl*8,hy+5,3,3,R);}
  if(S.messybun){if(view==='S'){lockBlob(cx+3.5,topY-2,5,4,R);for(const [x0,y0,y1] of [[cx-7,hy-2,hy+7],[cx+8,hy-1,hy+5]])for(let y=y0;y<=y1;y++)p(x0+(y>y0+4?(x0<cx?-1:1):0),y,R[y===y1?1:2]);}
    else if(view==='N'){lockBlob(cx-2.5,topY+1,5,4,R);blobRing(cx-2.5,topY+1,5,4);}else lockBlob(cx-fl*2,topY-2,4,4,R);}
  if(S.bigbun){if(view==='N'){for(let x=-7;x<=8;x++){const y0=hy+2-Math.round(Math.pow(Math.abs(x-.5)/7.5,2)*2);p(cx+x,y0-1,R[0]);p(cx+x,y0,R[x<-2?4:3]);p(cx+x,y0+1,R[3]);p(cx+x,y0+2,R[1]);}for(let y=topY+5;y<=hy;y++)p(cx+1,y,R[1]);}
    if(view==='S')lockBlob(cx+.5,topY-1,3,2,R);else if(view==='N'){lockBlob(cx+.5,topY+2,4,3,R);blobRing(cx+.5,topY+2,4,3);}else lockBlob(cx-fl*4,topY,3,3,R);}
  if(S.braidbun){const B=(bx,by,r)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d>r+.3)continue;const ang=Math.atan2(y,x),sp=((d*1.4+ang*.95)%3+3)%3;let k=sp<1?4:sp<2?2:1;if(d>r-.8&&(x>0||y>0))k=Math.max(1,Math.min(k,2));p(bx+x,by+y,R[k]);}blobRing(bx,by,r,r);};
    if(view==='N')B(cx+.5,hy-5,5);else if(side)B(cx-fl*7,hy-4,4);else{const L=LY[CUR],keep=new Uint8ClampedArray(L.d);B(cx+.5,topY,5);for(let i=0;i<FW*FH;i++)if(keep[i*4+3]){for(let c=0;c<4;c++)L.d[i*4+c]=keep[i*4+c];}}}
  if(S.puffs){for(const s of [-1,1]){if(side&&s*fl>0)continue;const bx=side?cx-fl*2:cx+.5+s*8,by=topY+(side?0:3)+(s>0&&!side?1:0);curlBlob(bx,by,5,5,R);}}
  if(S.bangroll){// a victory roll: one fat roll across the forehead, its ends seen as curls at the temples
    if(view==='S'){for(let x=cx-6;x<=cx+7;x++){const y0=topY+5-Math.round(Math.cos((x-cx-.5)/7.5*1.4)*2);const T=[2,3,4,3,2,1];for(let j=0;j<6;j++)p(x,y0+j,R[T[j]]);p(x,y0+6,R[0]);}rollEnd(cx-6.5,topY+7,3,R);rollEnd(cx+7.5,topY+7,3,R);}
    else if(side)rollEnd(cx+fl*4,topY+5,3,R);}
  if(S.rolls2){if(view==='S'||view==='N'){const m=view==='S'?1:-1;rollEnd(cx+.5-m*3,topY+2,3.6,R);rollEnd(cx+.5+m*3.5,topY+3,3,R);}else{for(let y=-3;y<=3;y++)for(let x=-6;x<=5;x++){if(x*x/40+y*y/10>1)continue;const l=-y*.6-x*.06;p(cx+fl*(x+1),topY+1+y,R[l>.8?4:l>-.3?3:y>1?1:2]);}rollEnd(cx+fl*6,topY+1,3,R);}}
  if(S.ringlets){const RL=(x,y0,len)=>strandPath([[x,y0],[x,y0+len]],y=>3,R,'ring');
    if(view==='S'){for(const s of [-1,1]){RL(cx+.5+s*8.5,hy,chin+4-hy);RL(cx+.5+s*10.5,hy+2,chin+7-hy);}}
    else if(view==='N'){for(const dx of [-7,-3.5,0,3.5,7])RL(cx+.5+dx,chin-3,9+((dx*2)&3));}
    else{RL(cx-fl*1,hy+1,chin+4-hy);RL(cx-fl*5,hy+2,chin+6-hy);RL(cx-fl*8,hy+1,chin+8-hy);}}
  if(S.quiffcurl){if(view==='S'){strandPath([[cx-1,topY-1],[cx-2,topY+3],[cx-1,hy-3]],y=>y<topY+3?3:2,R,'rope',true);}else if(side){const rows=[[-3,3,6],[-2,4,8],[-1,5,9],[0,6,9],[1,6,9],[2,7,8]];for(const [dy,u0,u1] of rows)for(let u=u0;u<=u1;u++)p(cx+u*fl,topY+dy,R[dy<=-2?4:u===u1?1:dy>=1?2:3]);}}
  if(S.fall){const F=(pts,wd,bot)=>{strandPath(pts,y=>y<bot-6?wd:y<bot-3?wd-1:wd-2,R,'rope');const [xe,ye]=pts[pts.length-1];p(Math.round(xe)-1,ye+1,R[2]);p(Math.round(xe)+1,ye+2,R[1]);};
    if(view==='S'){F([[cx+6.5,hy-5],[cx+9,hy+1],[cx+9.5,chin+3],[cx+8.5,chin+9]],6,chin+9);for(let y=hy+2;y<chin+6;y++)if(g(cx+9,y))p(cx+9,y,R[(y>>2)&1?1:2]);}
    else if(view==='W'){F([[cx+1,hy-4],[cx+3,hy+2],[cx+3,chin+3],[cx+2,chin+9]],5,chin+9);}}
  if(S.rowtails){if(view==='N'){for(const dx of [-3,1,4])strandPath([[cx+dx,chin-5],[cx+dx,chin+3]],y=>2,R,'braid');}else if(side)strandPath([[cx-fl*7,hy+5],[cx-fl*7,chin+3]],y=>2,R,'braid');}}
// ---------------------------------------------------------------- facial hair, glasses, hats, accessories
// ---- wardrobe facial hair (new): drawn in the hair ramp, lit from the upper left, a deep lower edge
function beard2(cx,hy,view,fl,bt){const R=HR,chin=hy+9,side=view!=='S';const put=(u,y,k)=>p(side?cx+u*fl:cx+u,y,R[clamp(k,0,4)]);
  const faceHW=y=>{const b=chin-y;return b===0?4:b===1?6:b===2?7:8;};   // the face's half-width on a row (front view): x from cx-hw+1 to cx+hw
  const mst=(w,thick)=>{if(side){for(let u=4;u<=7;u++){put(u,hy+5,u===7?2:3);if(thick)put(u,hy+6,1);}}else{for(let u=-w+1;u<=w;u++){put(u,hy+5,u<0?4:3);if(thick)put(u,hy+6,u===-w+1||u===w?1:2);}}};
  switch(bt){
  case 'chinstrap':if(side){/* down in front of the ear, then along the lower edge of the jaw to the chin */for(let y=hy+3;y<=chin-1;y++){put(0,y,3);put(1,y,2);}for(let u=0;u<=5;u++){put(u,chin-1,u<2?2:3);put(u,chin,1);}}else{for(let y=hy+3;y<=chin;y++){const w=faceHW(y);put(-w+1,y,3);put(w,y,2);}for(let u=-3;u<=4;u++)put(u,chin+1,u<0?2:1);}return true;
  case 'mutton':if(side){for(let y=hy-3;y<=hy+7;y++){const u1=y<hy+1?1:y<hy+3?2:y<hy+6?4:3;for(let u=-1;u<=u1;u++)put(u,y,y===hy+7||u===u1?1:(u===-1||y<hy?4:(y>hy+4&&u>1?2:3)));}}else{for(let y=hy+1;y<=hy+7;y++){const w=faceHW(y),t=y<hy+3?2:y<hy+6?4:3;for(let i=0;i<t;i++){put(-w+1+i,y,y===hy+7?1:i===0?3:4);put(w-i,y,y===hy+7?1:i===0?1:2);}}}return true;
  case 'handlebar':mst(3,true);if(side){put(8,hy+5,2);put(9,hy+4,3);put(9,hy+3,2);}else{put(-3,hy+5,4);put(-4,hy+4,4);put(-4,hy+3,3);put(4,hy+5,2);put(5,hy+4,2);put(5,hy+3,1);}return true;
  case 'walrus':if(side){for(let y=hy+5;y<=hy+7;y++)for(let u=4;u<=8;u++){if(y===hy+7&&(u&1))continue;put(u,y,y===hy+7?1:u>6?2:3);}}else{for(let y=hy+5;y<=hy+7;y++)for(let u=-3;u<=4;u++){if(y===hy+7&&((u+10)%2===0))continue;put(u,y,y===hy+5?(u<0?4:3):y===hy+7?1:(u<0?3:2));}}return true;
  case 'horseshoe':mst(3,true);if(side){for(let y=hy+6;y<=chin;y++)put(5,y,y===chin?1:2);}else{for(let y=hy+6;y<=chin;y++){put(-3,y,y===chin?1:3);put(4,y,y===chin?1:2);}}return true;
  case 'pencil':if(side){for(let u=5;u<=7;u++)put(u,hy+5,2);}else{for(const u of [-2,-1,2,3])put(u,hy+5,u<0?3:2);}return true;
  case 'soulpatch':if(side){put(6,hy+7,2);put(6,hy+8,1);}else{put(0,hy+7,3);put(1,hy+7,2);put(0,hy+8,2);put(1,hy+8,1);}return true;
  case 'vandyke':if(side){for(let u=4;u<=7;u++)put(u,hy+5,u===7?2:3);for(let y=chin-2;y<=chin+2;y++)for(let u=4;u<=(y>chin?5:6);u++)put(u,y,y>=chin+1?1:u===4?3:2);}
    else{for(const u of [-2,-1,2,3])put(u,hy+5,u<0?4:3);for(const u of [-3,4])put(u,hy+6,1);for(let y=chin-2;y<=chin+2;y++){const w=y<=chin?2:y===chin+1?1:0;for(let u=-w+1;u<=w;u++)put(u,y,y>=chin+1?1:u<1?3:2);}}return true;
  case 'long':case 'braided':case 'scruffy':{const L=bt==='long'?8:bt==='scruffy'?3:3;
    if(side){for(let y=hy+3;y<=chin+L;y++){const t=Math.max(0,y-chin);let u0=y<hy+5?-1:0,u1=y<hy+5?1:Math.min(8,7-Math.round(t*.5));if(y>chin){u0=1+Math.round(t*.3);}
        for(let u=u0;u<=u1;u++){if(y<hy+7&&u>3&&y>hy+4&&u<8&&!(y===hy+5))continue;const jag=bt==='scruffy'&&y===chin+L&&((u+20)%2===0);if(jag)continue;put(u,y,y>=chin+L-1?1:(u===u0?4:u<3?3:2));}}mst(0,true);}
    else{for(let y=hy+3;y<=chin+L;y++){const t=Math.max(0,y-chin);let w=y<=chin?(y<=hy+4?8:faceHW(y)+(y>chin-3?1:0)):Math.max(1,Math.round(6-t*(bt==='long'?.6:1.2)));
        for(let u=-w+1;u<=w;u++){const su=u-.5;if(y<chin-2&&Math.abs(su)<5.5&&y<hy+5)continue;if(y===hy+6&&Math.abs(su)<1.6)continue;if(y<=hy+5&&Math.abs(su)<4.5)continue;
          if(bt==='scruffy'&&y===chin+L&&((u+20)%3!==0))continue;const cl=y>chin-1&&(Math.abs(su-(bt==='scruffy'?-2.5:-1.5))<.6||(bt==='scruffy'&&Math.abs(su-2.5)<.6&&y>chin+1));put(u,y,y>=chin+L?1:cl?2:(su<-3?4:su>3?2:3));}}mst(3,true);}
    if(bt==='braided'){const bx=side?cx+fl*4:cx+.5,y0=chin+L,RL=R.map((c,i)=>R[Math.min(4,i+1)]);for(let y=y0;y<=y0+6;y++){const q=((y-y0)%4+4)%4;for(let i=0;i<3;i++)p(Math.round(bx)-1+i,y,RL[BRAIDTILE[q][i+1]]);p(Math.round(bx)-2,y,R[0]);p(Math.round(bx)+2,y,R[0]);}for(let i=-1;i<=1;i++)p(Math.round(bx)+i,y0+7,ACCR[i?2:3]);}
    return true;}
  case 'sideburns':if(side){for(let y=hy-1;y<=hy+5;y++){put(0,y,y===hy+5?1:3);put(1,y,y===hy+5?1:2);}}else{for(let y=hy-1;y<=hy+5;y++){const w=8;put(-w+1,y,y===hy+5?1:3);put(-w+2,y,y===hy+5?1:4);put(w,y,y===hy+5?1:2);put(w-1,y,y===hy+5?1:2);}}return true;}
  return false;}
// ---- wardrobe eyewear (new): frames in the frame colour, lenses in the lens colour, wire in metal
function glasses2(cx,hy,view,fl,gt){const F=ramp(C.frame||'#535163'),L=ramp(C.lens||'#6a8a9a'),M=ramp(C.metal||'#b89a4a'),side=view!=='S'&&view!=='N',N=view==='N';const GL=[214,220,230];
  const lensA=(x,y,c,a)=>P(LY[CUR],x,y,c,a);   // a see-through lens
  const strapN=(y,R,h)=>{for(let x=-9;x<=10;x++)for(let j=0;j<(h||1);j++)p(cx+x,y+j,R[j===(h||1)-1?1:(x<0?3:2)]);};
  // a lens box per eye in the front view: x0 = its left column, w x h
  const eyeBox=(fn)=>{for(const s of [-1,1]){const x0=s<0?cx-6:cx+3;fn(s,x0);}};
  if(N){if(gt==='goggles'||gt==='welding')strapN(hy,F,2);else if(gt==='eyepatch'){for(let x=-9;x<=10;x++)p(cx+x,hy-3+Math.round((x+9)*.2),F[2]);}else if(gt==='blindfold'){strapN(hy-1,F,3);lockBlob(cx+.5,hy,2,1,F);for(const s of [-1,1])for(let j=0;j<5;j++)p(cx+.5+s*(1+j*.4)-(s<0?1:0),hy+2+j,F[j===4?1:2]);}return true;}
  if(!side){switch(gt){
    case 'aviator':eyeBox((s,x0)=>{const rows=[[0,4],[0,4],[0,4],[1,4],[1,3],[2,3]].map(r=>s<0?r:[4-r[1],4-r[0]]);rows.forEach(([a,b],j)=>{for(let i=a;i<=b;i++){const edge=i===a||i===b||j===0||j===5;if(edge)p(x0+i,hy-1+j,M[j===0?3:1]);else lensA(x0+i,hy-1+j,L[j<2?1:2],175);}});p(x0+(s<0?1:3),hy,GL);});
      p(cx,hy-1,M[3]);p(cx+1,hy-1,M[3]);p(cx,hy+1,M[2]);p(cx+1,hy+1,M[2]);p(cx-7,hy,M[2]);p(cx+8,hy,M[2]);return true;
    case 'cateye':eyeBox((s,x0)=>{for(let i=0;i<5;i++){p(x0+i,hy-1,F[3]);p(x0+i,hy+3,F[1]);}for(let j=0;j<3;j++){p(x0,hy+j,F[2]);p(x0+4,hy+j,F[1]);}const ox=s<0?x0-1:x0+5;p(ox,hy-1,F[3]);p(ox+(s<0?-1:1),hy-2,F[4]);p(ox,hy-2,F[3]);p(x0+(s<0?1:3),hy,GL);});p(cx,hy,F[2]);p(cx+1,hy,F[2]);p(cx-7,hy,F[2]);p(cx+8,hy,F[2]);return true;
    case 'browline':eyeBox((s,x0)=>{for(let i=0;i<5;i++){p(x0+i,hy-1,F[i<2?3:2]);p(x0+i,hy-2,F[3]);}for(let i=1;i<4;i++)p(x0+i,hy+3,M[2]);for(let j=0;j<3;j++){p(x0,hy+j,M[3]);p(x0+4,hy+j,M[1]);}p(x0+1,hy,GL);});p(cx,hy,M[3]);p(cx+1,hy,M[3]);p(cx-7,hy-1,F[2]);p(cx+8,hy-1,F[2]);return true;
    case 'wire':eyeBox((s,x0)=>{const a=x0+(s<0?1:0);for(let i=1;i<3;i++){p(a+i,hy-1,M[3]);p(a+i,hy+3,M[1]);}for(let j=0;j<3;j++){p(a,hy+j,M[3]);p(a+3,hy+j,M[1]);}p(a+1,hy,GL);});p(cx,hy,M[3]);p(cx+1,hy,M[3]);for(let i=0;i<2;i++){p(cx-7+i,hy,M[2]);p(cx+7+i,hy,M[2]);}return true;
    case 'owl':for(const s of [-1,1]){const xc=s<0?cx-3.5:cx+4.5;K_ell(xc,hy+1,3.6,3.6,(x,y,xx,yy)=>{const d=Math.hypot(xx,yy);if(d>.66)p(x,y,F[yy<-.3?(xx<0?4:3):xx>.3?1:2]);else if(xx<-.1&&yy<-.1&&d>.35)p(x,y,GL);});}p(cx,hy,F[2]);p(cx+1,hy,F[2]);return true;
    case 'pincenez':eyeBox((s,x0)=>{const a=x0+(s<0?1:0);for(let i=1;i<3;i++){p(a+i,hy-1,M[3]);p(a+i,hy+3,M[1]);}for(let j=0;j<3;j++){p(a,hy+j,M[3]);p(a+3,hy+j,M[1]);}p(a+1,hy,GL);});p(cx,hy+1,M[3]);p(cx+1,hy+1,M[3]);
      for(let j=0;j<10;j++){const x=Math.round(cx+7+Math.sin(j*.35)*1.2),y=hy+2+j;p(x,y,M[(j&1)?2:3]);}return true;
    case 'goggles':case 'welding':{const W2=gt==='welding';eyeBox((s,x0)=>{for(let j=-1;j<=4;j++)for(let i=-1;i<=5;i++){const edge=j===-1||j===4||i===-1||i===5;const corner=(j===-1||j===4)&&(i===-1||i===5);if(corner)continue;
        if(edge||(W2&&(j===0||j===3||i===0||i===4)))p(x0+i,hy+j,(W2?M:F)[j<=0?3:i>=4?1:2]);else if(W2)p(x0+i,hy+j,[24,22,28]);else lensA(x0+i,hy+j,L[j<1?4:3],150);}if(W2)p(x0+1,hy+1,[90,96,110]);else p(x0+1,hy,GL);});
      for(const x of [cx-8,cx-9,cx+9,cx+10]){p(x,hy,F[2]);p(x,hy+1,F[1]);}p(cx,hy+1,F[1]);p(cx+1,hy+1,F[1]);return true;}
    case 'eyepatch':{const x0=cx+3;for(let j=-1;j<=3;j++)for(let i=0;i<=4;i++){if((j===-1||j===3)&&(i===0||i===4))continue;p(x0+i,hy+j,F[j===-1?3:j===3?0:i===0?2:1]);}
      for(let x=-8;x<=2;x++)p(cx+x,hy-1-Math.round((x+8)*.35),F[2]);p(cx+8,hy-1,F[2]);p(cx+9,hy-2,F[2]);return true;}
    case 'halfmoon':eyeBox((s,x0)=>{for(let i=0;i<5;i++){p(x0+i,hy+2,F[2]);p(x0+i,hy+4,F[1]);}p(x0,hy+3,F[2]);p(x0+4,hy+3,F[1]);p(x0+1,hy+3,GL);});p(cx,hy+3,F[2]);p(cx+1,hy+3,F[2]);p(cx-7,hy+1,F[2]);p(cx+8,hy+1,F[2]);return true;
    case 'thickframe':eyeBox((s,x0)=>{for(let i=0;i<5;i++){p(x0+i,hy-2,F[i<2?3:2]);p(x0+i,hy-1,F[2]);p(x0+i,hy+3,F[0]);}for(let j=0;j<3;j++){p(x0,hy+j,F[2]);p(x0+4,hy+j,F[1]);}p(x0+1,hy,GL);});for(let y=hy-1;y<=hy;y++){p(cx,y,F[2]);p(cx+1,y,F[2]);}p(cx-7,hy-1,F[2]);p(cx+8,hy-1,F[2]);return true;
    case 'mirror':eyeBox((s,x0)=>{for(let i=0;i<5;i++){p(x0+i,hy-1,F[2]);p(x0+i,hy+3,F[0]);}for(let j=0;j<3;j++){p(x0,hy+j,F[2]);p(x0+4,hy+j,F[1]);for(let i=1;i<4;i++){const band=(i+j)===2||(i+j)===3;p(x0+i,hy+j,band?L[4]:L[1]);}}});p(cx,hy,F[2]);p(cx+1,hy,F[2]);p(cx-7,hy,F[2]);p(cx+8,hy,F[2]);return true;
    case 'cracked':eyeBox((s,x0)=>{for(let i=1;i<4;i++){p(x0+i,hy-1,F[3]);p(x0+i,hy+3,F[1]);}for(let j=0;j<3;j++){p(x0,hy+j,F[2]);p(x0+4,hy+j,F[1]);}if(s<0)p(x0+1,hy,GL);else{p(x0+1,hy,[200,206,214]);p(x0+2,hy+1,[200,206,214]);p(x0+3,hy+1,[236,240,246]);p(x0+2,hy+2,[200,206,214]);p(x0+1,hy+2,[236,240,246]);}});p(cx,hy,F[2]);p(cx+1,hy,F[2]);p(cx-7,hy,F[2]);p(cx+8,hy,F[2]);return true;
    case 'blindfold':for(let y=hy-1;y<=hy+2;y++)for(let x=-8;x<=9;x++)p(cx+x,y,F[y===hy-1?3:y===hy+2?1:(x<-3?3:x>4?1:2)]);for(let x=-7;x<=8;x+=5)p(cx+x,hy+1,F[1]);return true;}}
  else{const x0=cx+fl*3,box=(w,top,bot,fn)=>{for(let j=top;j<=bot;j++)for(let i=0;i<w;i++)fn(x0+fl*i,hy+j,i,j);},arm=(y,R)=>{for(let i=1;i<=5;i++)p(x0-fl*i,y,R[2]);};
    switch(gt){
    case 'aviator':box(4,-1,4,(x,y,i,j)=>{if(j===4&&i===0)return;const edge=i===0||i===3||j===-1||j===4||(j===3&&i===0);if(edge)p(x,y,M[j<=-1?3:1]);else lensA(x,y,L[j<1?1:2],175);});arm(hy,M);return true;
    case 'cateye':box(4,-1,3,(x,y,i,j)=>{const edge=i===0||i===3||j===-1||j===3;if(edge)p(x,y,F[j===-1?3:1]);});p(x0+fl*3,hy-2,F[4]);arm(hy,F);p(x0+fl,hy,GL);return true;
    case 'browline':box(4,-2,3,(x,y,i,j)=>{if(j<=-1)p(x,y,F[3]);else if(i===0||i===3||j===3)p(x,y,M[2]);});arm(hy-1,F);return true;
    case 'wire':box(3,-1,3,(x,y,i,j)=>{if(i===0||i===2||j===-1||j===3)p(x,y,M[j<0?3:2]);});arm(hy,M);return true;
    case 'owl':K_ell(cx+.5+fl*4.5,hy+1,3,3.6,(x,y,xx,yy)=>{if(Math.hypot(xx,yy)>.62)p(x,y,F[yy<0?3:1]);});arm(hy,F);return true;
    case 'pincenez':box(3,-1,3,(x,y,i,j)=>{if(i===0||i===2||j===-1||j===3)p(x,y,M[2]);});for(let j=0;j<9;j++)p(x0-fl*Math.round(1+Math.sin(j*.4)),hy+3+j,M[(j&1)?2:3]);return true;
    case 'goggles':case 'welding':{const W2=gt==='welding';box(4,-1,4,(x,y,i,j)=>{const edge=i===0||i===3||j===-1||j===4;if(edge)p(x,y,(W2?M:F)[j<0?3:1]);else if(W2)p(x,y,[24,22,28]);else lensA(x,y,L[3],150);});for(let i=1;i<=9;i++){p(x0-fl*i,hy,F[2]);p(x0-fl*i,hy+1,F[1]);}return true;}
    case 'eyepatch':if(fl<0){box(4,-1,3,(x,y,i,j)=>p(x,y,F[j===-1?3:j===3?0:2]));}for(let i=1;i<=9;i++)p(x0-fl*i,hy-1-Math.round(i*.25),F[2]);return true;
    case 'halfmoon':box(4,2,4,(x,y,i,j)=>{if(i===0||i===3||j===2||j===4)p(x,y,F[j===2?2:1]);});arm(hy+1,F);return true;
    case 'thickframe':box(4,-2,3,(x,y,i,j)=>{if(j<=-1||i===0||i===3||j===3)p(x,y,F[j<=-1?3:1]);});p(x0+fl,hy,GL);arm(hy-1,F);return true;
    case 'mirror':box(4,-1,3,(x,y,i,j)=>{const edge=i===0||i===3||j===-1||j===3;p(x,y,edge?F[j<0?2:0]:((i+j)===2?L[4]:L[1]));});arm(hy,F);return true;
    case 'cracked':box(4,-1,3,(x,y,i,j)=>{if(i===0||i===3||j===-1||j===3)p(x,y,F[j<0?3:1]);});if(fl>0){p(x0+fl,hy+1,[236,240,246]);p(x0+fl*2,hy,[200,206,214]);}else p(x0+fl,hy,GL);arm(hy,F);return true;
    case 'blindfold':for(let y=hy-1;y<=hy+2;y++)for(let u=-8;u<=8;u++)p(cx+u*fl,y,F[y===hy-1?3:y===hy+2?1:2]);lockBlob(cx-fl*8,hy,1,1,F);for(let j=0;j<5;j++)p(cx-fl*(9+(j>>1)),hy+1+j,F[2]);return true;}}
  return false;}
function K_ell(xc,yc,rx,ry,fn){for(let y=Math.floor(yc-ry);y<=Math.ceil(yc+ry);y++)for(let x=Math.floor(xc-rx);x<=Math.ceil(xc+rx);x++){const xx=(x+.5-xc)/(rx+.01),yy=(y+.5-yc)/(ry+.01);if(xx*xx+yy*yy<=1)fn(x,y,xx,yy);}}
function beard(cx,hy,view,fl,bt){if(!bt||view==='N')return;if(beard2(cx,hy,view,fl,bt))return;const R=HR,chin=hy+9;const side=view!=='S';
  const put=(u,y,k)=>p(side?cx+u*fl:cx+u,y,R[k]);
  if(bt==='stubble'){   /* (judge townsfolk: "beards as shapes, not speckle") stubble as one soft shadow along the jaw and chin in a hair-and-skin mix, no checker */
    const mix=(a,b,t)=>a.map((v,i)=>Math.round(v*(1-t)+b[i]*t)),S1=mix(SK[2],HR[1],.45),S2=mix(SK[1],HR[0],.5);
    for(let y=hy+5;y<=chin;y++)for(let u=side?1:-5;u<=6;u++){const su=side?u:u-.5,jaw=side?(u>=3||y>=chin-1):(Math.abs(su)>=3.5||y>=chin-1);if(!jaw)continue;if(!side&&y===hy+6&&u>=-1&&u<=2)continue;
      p(side?cx+u*fl:cx+u,y,y>=chin?S2:S1);}return;}
  const mst=()=>{if(side){for(let u=4;u<=7;u++){put(u,hy+5,u===7?2:3);put(u,hy+6,1);}}else{for(let u=-2;u<=3;u++){put(u,hy+5,u<0?4:3);put(u,hy+6,u===-2||u===3?1:2);}put(-3,hy+6,1);put(4,hy+6,1);}};
  if(bt==='moustache'){mst();return;}
  if(bt==='goatee'){mst();for(let y=chin-2;y<=chin+1;y++)for(let u=side?4:-1;u<=(side?6:2);u++)put(u,y,y===chin+1?1:u===(side?4:-1)?4:3);return;}
  // full: around the jaw and the chin, the mouth left clear
  for(let y=hy+3;y<=chin+2;y++){const hw=y<=hy+4?8:y<chin-1?8:y===chin-1?7:y===chin?6:y===chin+1?5:3;for(let u=(side?-1:-hw+1);u<=(side?7-(y>chin?2:0):hw);u++){const su=side?u:u-.5;
      if(!side&&y<chin-2&&Math.abs(su)<5.5&&y<hy+5)continue;if(!side&&y===hy+6&&Math.abs(su)<1.6)continue;if(side&&y<hy+5&&u>1)continue;put(u,y,y>=chin+1?1:(side?(u>4?3:2):(su<-3?4:su>3?2:3)));}}
  mst();}
function glasses(cx,hy,view,fl,gt){if(glasses2(cx,hy,view,fl,gt))return;if(view==='N')return;
  if(gt==='monocle'){const G=[[150,118,52],[214,176,82]],GLs=[200,214,226];const x0=view==='S'?cx+3:cx+fl*3;
    for(const [dx,dy] of [[1,-1],[2,-1],[3,-1],[0,0],[4,0],[0,1],[4,1],[0,2],[4,2],[1,3],[2,3],[3,3]])p(x0+(view==='S'?dx:fl*dx),hy+dy,G[dy<1?1:0]);
    p(x0+(view==='S'?1:fl),hy,GLs);for(let i=1;i<6;i++)p(x0+(view==='S'?4:fl*4),hy+3+i,G[i%2]);return;}gt=gt===true?'round':gt;const F=gt==='shades'?[[20,16,22],[34,30,38]]:[[40,34,44],[64,58,70]],GL=[196,212,224];
  if(view==='S'){for(const s of [-1,1]){const x0=s<0?cx-6:cx+3;for(let i=0;i<5;i++){if((gt==='round'||gt==='tint')&&(i===0||i===4)){}else{p(x0+i,hy-1,F[1]);p(x0+i,hy+3,F[0]);}}for(let j=0;j<3;j++){p(x0,hy+j,F[1]);p(x0+4,hy+j,F[0]);}
      if(gt==='shades'){for(let j=0;j<3;j++)for(let i=1;i<4;i++)p(x0+i,hy+j,j===0&&i===1?[90,90,100]:F[0]);}
      else if(gt==='tint'){for(let j=0;j<3;j++)for(let i=1;i<4;i++)p(x0+i,hy+j,j===0?[150,142,150]:[128,120,130]);p(x0+2,hy+1,[34,26,34]);p(x0+(s<0?2:2),hy+2,[96,86,98]);p(x0+1,hy,[214,220,230]);}else p(x0+1,hy,GL);}
    p(cx,hy,F[1]);p(cx+1,hy,F[1]);p(cx-7,hy,F[1]);p(cx+8,hy,F[1]);}
  else{const x0=cx+fl*3;for(let i=0;i<4;i++){p(x0+fl*i,hy-1,F[1]);p(x0+fl*i,hy+3,F[0]);}for(let j=0;j<3;j++){p(x0,hy+j,F[1]);p(x0+fl*3,hy+j,F[0]);}if(gt==='shades')for(let j=0;j<3;j++)for(let i=1;i<3;i++)p(x0+fl*i,hy+j,F[0]);
    if(gt==='tint'){for(let j=0;j<3;j++)for(let i=1;i<3;i++)p(x0+fl*i,hy+j,j===0?[150,142,150]:[128,120,130]);p(x0+fl*1,hy+1,[34,26,34]);p(x0+fl*2,hy,[214,220,230]);}
    for(let i=1;i<=5;i++)p(x0-fl*i,hy,F[1]);}}
// ---- wardrobe hats (new). Each is drawn per view (S front, N back, E/W side). cut marks the hair (and beard) a hat hides: the sheet carries it as
// #ff00ff wherever the hat itself has no pixel, and the game clears hair and beard there. Colours: hat (main), hat2 (band, trim, veil), metal, lens.
const H2R=ramp(C.hat2||'#b84a8a'),MTR=ramp(C.metal||'#b89a4a'),LNR=ramp(C.lens||'#6a8a9a'),STRAW=[[110,80,30],[160,124,52],[204,168,82],[232,204,118],[248,230,160]];
const LAMP=[[200,140,60],[240,200,110],[255,238,170],[255,250,224]];
const SHADE_A=[22,12,26];
function hatKit(cx,hy,view,fl){const side=view==='E'||view==='W',S=view==='S',N=view==='N',chin=hy+9,top=chin-HEADH+1,sh=side?-fl:0,hx=cx+.5+sh;
  const K={side,S,N,fl,cx,hy,chin,top,sh,hx,
    X:u=>side?Math.round(cx+.5+u*fl-.5*fl):Math.round(cx+u),   // side views: u forward of the axis; front/back: u across
    put:(x,y,R,k)=>p(x,y,R[clamp(Math.round(k),0,4)]),
    lit:(xx,yy,b)=>{const l=-xx*.55-yy*.5+(b||0);return l>.6?4:l>.1?3:l>-.4?2:1;},
    // a half-ellipse crown standing on row b
    dome:(t,b,rx,R,shift,kf)=>{const ry=Math.max(1,b-t);for(let y=t;y<=b;y++)for(let x=-Math.ceil(rx)-1;x<=Math.ceil(rx)+1;x++){const xx=(x-.5)/(rx+.5),yy=(y-b)/ry;if(xx*xx+yy*yy>1)continue;let k=K.lit(xx,yy);if(kf)k=kf(x,y,k,xx,yy);if(k<0)continue;p(cx+x+(shift||0),y,R[clamp(k,0,4)]);}},
    // any ellipse (centre xc,yc): fn(x,y,xx,yy) draws each pixel
    ell:(xc,yc,rx,ry,fn)=>{for(let y=Math.floor(yc-ry);y<=Math.ceil(yc+ry);y++)for(let x=Math.floor(xc-rx);x<=Math.ceil(xc+rx);x++){const xx=(x+.5-xc)/(rx+.01),yy=(y+.5-yc)/(ry+.01);if(xx*xx+yy*yy<=1)fn(x,y,xx,yy);}},
    // a brim seen nearly edge-on: a lit top row and a dark lip; end(x) lifts (-) or droops (+) the ends
    brim:(y,rx,R,end,rows)=>{rows=rows||2;for(let x=-Math.ceil(rx);x<=Math.ceil(rx)+1;x++){const xx=(x-.5)/(rx+.5);if(Math.abs(xx)>1)continue;const dy=end?end(x,xx):0;
        p(cx+x+sh,y+dy,R[xx<-.45?4:xx>.5?1:3]);for(let r=1;r<rows;r++)p(cx+x+sh,y+dy+r,R[r===rows-1?0:(xx>.5?1:2)]);}},
    // a wide brim seen from above: the top surface as an ellipse ring, its far edge lit, the near lip dark, the underside one row deeper
    ebrim:(yc,rx,ry,R,droop)=>{const pts=[];K.ell(hx,yc,rx,ry,(x,y,xx,yy)=>{const d=droop?droop(xx):0;pts.push([x,y+d,xx,yy]);});
      const low={};for(const [x,y] of pts)low[x]=Math.max(low[x]==null?-1e9:low[x],y);
      for(const [x,y,xx,yy] of pts){let k=yy<-.3?(xx<.2?4:3):yy<.5?(xx<-.3?3:xx>.5?1:2):(xx<-.4?2:1);if(Math.hypot(xx,yy)>.82&&yy<0&&xx>.3)k=Math.min(k,2);p(x,y,R[k]);}
      for(const x in low){p(+x,low[x],R[1]);p(+x,low[x]+1,R[0]);}},
    band:(y0,y1,rx,R,shift)=>{for(let y=y0;y<=y1;y++)for(let x=-Math.ceil(rx);x<=Math.ceil(rx)+1;x++){const xx=(x-.5)/(rx+.5);if(Math.abs(xx)>1)continue;p(cx+x+sh+(shift||0),y,R[y===y1?1:xx<-.4?3:xx>.5?1:2]);}},
    cut:(x,y)=>{x=Math.round(x);y=Math.round(y);if(LY.cut)P(LY.cut,x,y,[255,0,255]);},
    cutBox:(x0,x1,y0,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)K.cut(x,y);},
    cutAbove:(y,rx)=>{rx=rx||17;K.cutBox(cx-rx,cx+rx+1,0,y-1);},
    cutEll:(xc,yc,rx,ry,keep)=>K.ell(xc,yc,rx,ry,(x,y,xx,yy)=>{if(!keep||!keep(x,y))K.cut(x,y);}),
    shade:(x,y,a)=>{x=Math.round(x);y=Math.round(y);if(g(x,y)||!G(LY.body,x,y))return;P(LY[CUR],x,y,SHADE_A,a||80);},
    vis:(x,y,R,k)=>{if(!g(x,y))p(x,y,R[k]);},
    bow:(x,y,R)=>{for(const s of [-1,1])for(let j=-1;j<=1;j++)for(let i=1;i<=2;i++){if(Math.abs(j)>2-i+0)continue;p(x+s*i,y+j,R[s<0?(j<0?4:3):(j<0?2:1)]);}p(x,y,R[1]);p(x+1,y,R[0]);}};
  return K;}
const HATDEF={
 trucker(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-14,hy-4,9,H,sh,(x,y,k)=>{const uf=side?x*-1:0;if(N||(side&&(x*fl<-1)))return k;if(S&&Math.abs(x-.5)<5&&y<hy-5)return Math.min(4,k+1);return k;});
   if(N||side){const M=H2R;for(let y=hy-13;y<hy-4;y++)for(let x=-10;x<=11;x++){const X=cx+x+sh;if(!g(X,y))continue;if(side&&x*fl>-1)continue;const c=g(X,y);const k=H.findIndex(r=>r[0]===c[0]&&r[1]===c[1]&&r[2]===c[2]);if(k<0)continue;p(X,y,M[((y&1)&&hsh(Math.floor((x+(y>>1))/3),y,5)<.6)?Math.max(1,k-1):k]);}}
   for(let x=-9;x<=10;x++)p(cx+x+sh,hy-4,H[1]);p(cx+sh,hy-14,H2R[3]);p(cx+1+sh,hy-14,H2R[2]);
   if(S){for(let x=-6;x<=7;x++){p(cx+x,hy-3,H[x<-3?3:2]);p(cx+x,hy-2,H[0]);}for(let x=-6;x<=7;x++)K.shade(cx+x,hy-1,60);}
   else if(side){for(let i=0;i<8;i++){p(cx+fl*(6+i),hy-4,H[i<6?3:2]);p(cx+fl*(6+i),hy-3,H[0]);}}
   else{for(let x=-2;x<=3;x++){p(cx+x,hy-6,H2R[0]);}for(let x=-2;x<=3;x++)p(cx+x,hy-5,H[1]);p(cx,hy-5,MTR[3]);}},
 backcap(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-13,hy-4,9,H,sh);for(let x=-9;x<=10;x++)p(cx+x+sh,hy-4,H[1]);p(cx+sh,hy-13,H[4]);p(cx+1+sh,hy-13,H[3]);
   if(S){/* the strap opening at the front shows the hair through it */for(let y=hy-7;y<=hy-5;y++)for(let x=-2;x<=3;x++){if(y===hy-7&&(x===-2||x===3))continue;const i=(y*FW+cx+x)*4;LY.hat.d[i+3]=0;LY.cut.d[i+3]=0;}
     for(const x of [-3,4])for(let y=hy-7;y<=hy-5;y++)p(cx+x,y,H[0]);for(let x=-2;x<=3;x++)p(cx+x,hy-8,H[0]);for(let x=-3;x<=4;x++)p(cx+x,hy-4,H[0]);p(cx,hy-4,MTR[3]);p(cx+1,hy-4,MTR[2]);}
   else if(N){for(let x=-6;x<=7;x++){p(cx+x,hy-3,H[x<-3?3:2]);p(cx+x,hy-2,H[0]);}}
   else{for(let i=0;i<8;i++){p(cx-fl*(7+i),hy-4,H[i<6?2:1]);p(cx-fl*(7+i),hy-3,H[0]);}}},
 sunhat(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT;K.cutAbove(hy-5);K.cutEll(hx,hy-6,15,3);
   K.ebrim(hy-6,15,3.2,H,xx=>Math.abs(xx)>.7?Math.round((Math.abs(xx)-.7)*6):0);
   K.dome(hy-13,hy-7,7,H,sh);K.band(hy-8,hy-7,7.5,H2R);
   if(S)K.bow(cx+6,hy-8,H2R);else if(N)K.bow(cx-5,hy-8,H2R);else K.bow(cx-fl*6,hy-8,H2R);
   if(S)for(let x=-8;x<=9;x++)K.shade(cx+x,hy-2,70);},
 bonnet(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;
   if(S){K.cutBox(cx-17,cx+18,0,hy+4);K.ell(hx,hy+1,11,13,(x,y,xx,yy)=>{if(y>hy+5)return;const ix=(x+.5-hx)/7.5,iy=(y+.5-(hy+2.5))/9.5;if(ix*ix+iy*iy<1)return;const inner=ix*ix+iy*iy<1.35;
       p(x,y,H[inner?1:K.lit(xx,yy)]);});
     // the hair at the parting shows inside the opening
     K.ell(hx,hy+2.5,7.5,9.5,(x,y)=>{if(y>=hy-6){const i=(y*FW+x)*4;if(LY.cut.d[i+3]&&y>=hy-7)LY.cut.d[i+3]=0;}});
     for(const s of [-1,1]){const x0=s<0?cx-8:cx+9;for(let y=hy+6;y<=chin;y++)p(x0+s*-Math.round((y-hy-6)*.6),y,H2R[s<0?3:2]);}K.bow(cx,chin+1,H2R);}
   else if(N){K.cutBox(cx-17,cx+18,0,hy+5);K.ell(hx,hy-2,10.5,10.5,(x,y,xx,yy)=>p(x,y,H[K.lit(xx,yy)]));K.ell(hx,hy-1,3.5,3.5,(x,y,xx,yy)=>{const d=Math.hypot(xx,yy);if(d>.65)p(x,y,H[1]);});
     for(let y=hy+5;y<=hy+10;y++)for(let x=-10;x<=11;x++){const xx=(x-.5)/10.5;p(cx+x,y,H[y===hy+10?1:((x+40)%3===0?1:xx<-.3?3:2)]);}}
   else{K.cutBox(cx-17,cx+18,0,hy+4);/* side on: the bonnet's crown over the back of the head, its stiff brim standing up beside the face and jutting over the brow */
     K.ell(cx+.5-fl*3,hy-2,8.5,10.5,(x,y,xx,yy)=>{const uf=(x-cx)*fl;if(uf>3||y>hy+5)return;p(x,y,H[K.lit(xx*fl,yy)]);});
     for(let y=hy-13;y<=hy+5;y++){const t=(y-hy+13)/18,u0=Math.round(4.5-t*2.2+(y<hy-10?-(hy-10-y)*.7:0));for(let i=0;i<3;i++)p(cx+(u0+i)*fl,y,H[i===0?4:i===1?3:1]);}
     for(let y=hy+5;y<=hy+10;y++)for(let u=-10;u<=2;u++)p(cx+u*fl,y,H[y===hy+10?1:((u+40)%3===0?1:2)]);
     for(let y=hy+6;y<=chin+1;y++)p(cx+fl*(3+((y-hy-6)>>2)),y,H2R[2]);
     K.ell(cx+.5,hy+2,9,9,(x,y)=>{const uf=(x-cx)*fl;if(uf>=4&&y>=hy-8){const i=(y*FW+x)*4;LY.cut.d[i+3]=0;}});}},
 headscarf(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;
   if(S){K.cutBox(cx-17,cx+18,0,chin);K.ell(hx,hy+3,7,8.5,(x,y)=>{if(y>=hy-4){const i=(y*FW+x)*4;LY.cut.d[i+3]=0;}});
     K.ell(hx,hy-1,10,13.5,(x,y,xx,yy)=>{if(y>chin)return;const ix=(x+.5-hx)/7,iy=(y+.5-(hy+3))/8.5;const d=ix*ix+iy*iy;if(d<1)return;p(x,y,d<1.3?H[1]:H[K.lit(xx,yy)]);});
     for(let x=-1;x<=2;x++){p(cx+x,chin,H[x<1?3:2]);p(cx+x,chin+1,H[x<1?2:1]);}p(cx-2,chin+2,H[2]);p(cx-3,chin+3,H[1]);p(cx+3,chin+2,H[1]);p(cx+4,chin+3,H[1]);}
   else if(N){K.cutBox(cx-17,cx+18,0,chin);K.ell(hx,hy-1,10,13.5,(x,y,xx,yy)=>{if(y>hy+5)return;p(x,y,H[K.lit(xx,yy)]);});
     for(let y=hy+5;y<=chin+5;y++){const w=Math.round(10*(1-(y-hy-5)/11));for(let x=-w+1;x<=w;x++)p(cx+x,y,H[x===w?1:x<-w+3?3:((x-y+60)%4===0?1:2)]);}}
   else{K.cutBox(cx-17,cx+18,0,chin);K.ell(cx+.5-fl*1.5,hy-1,10,13.5,(x,y,xx,yy)=>{const uf=(x-cx)*fl;if(y>chin||uf>5)return;if(uf>=3&&y>hy-5&&y<hy+7)return;p(x,y,(uf>=2&&y>=hy-5)?H[1]:H[K.lit(xx*fl,yy)]);});
     for(let y=hy+5;y<=chin+1;y++)for(let u=3;u<=6;u++)if(y>=hy+7||u<=4)p(cx+u*fl,y,H[u===6?1:2]);
     for(let y=hy+5;y<=chin+4;y++){const w=Math.max(1,4-((y-hy-5)>>1));for(let i=0;i<w;i++)p(cx-fl*(9-i+Math.round((y-hy-5)*.3)),y,H[i===0?1:2]);}}},
 headwrap(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-17,hy-4,10,H,sh+(side?-fl:0),(x,y,k)=>((x*2+y+40)%6===0)?Math.max(1,k-1):k);
   for(let x=-9;x<=10;x++){p(cx+x+sh,hy-5,H[x<-4?3:2]);p(cx+x+sh,hy-4,H[1]);}
   if(S){lockBlob(cx+.5,hy-15,3,2,H2R);}else if(side)lockBlob(cx+fl*3,hy-15,2,2,H2R);},
 bandanna(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   K.dome(hy-13,hy-5,9,H,sh);for(let x=-9;x<=10;x++){p(cx+x+sh,hy-5,H2R[x<-4?3:2]);}
   if(N){lockBlob(cx+.5,hy-4,2,1,H);for(const s of [-1,1])for(let j=0;j<6;j++)p(cx+.5+s*(1+j*.5)-(s<0?1:0),hy-2+j,H[j===5?1:2]);}
   else if(side){lockBlob(cx-fl*8,hy-5,1,1,H);for(let j=0;j<6;j++)p(cx-fl*(9+(j>>1)),hy-4+j,H[2]);}},
 hardhat(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-14,hy-5,9,H,sh,(x,y,k)=>{if(side)return k;if(x===0||x===1)return Math.min(4,k+1);if(x===2)return Math.max(1,k-1);return k;});
   if(side)for(let y=hy-14;y<hy-5;y++){const u=Math.round(Math.sqrt(Math.max(0,1-Math.pow((y-hy+5)/9,2)))*9);}
   K.brim(hy-4,11,H);
   if(S)for(let x=-5;x<=6;x++)p(cx+x,hy-2,H[0]);else if(side){for(let i=10;i<=13;i++){p(cx+fl*i,hy-4,H[2]);p(cx+fl*i,hy-3,H[0]);}}
   if(S)for(let x=-7;x<=8;x++)K.shade(cx+x,hy-1,60);},
 boater(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT;K.cutAbove(hy-6);K.cutEll(hx,hy-5,13,2);
   K.ebrim(hy-5,13,2.2,H);
   for(let y=hy-11;y<=hy-6;y++)for(let x=-6;x<=7;x++){const xx=(x-.5)/6.5;p(cx+x+sh,y,H[xx<-.5?4:xx>.55?1:xx>.2?2:3]);}
   for(let x=-6;x<=7;x++){const xx=(x-.5)/6.5;p(cx+x+sh,hy-12,H[xx<.3?4:3]);p(cx+x+sh,hy-13,H[xx<-.6||xx>.6?3:4]);}
   K.band(hy-8,hy-7,6.5,H2R);if(S)for(let x=-8;x<=9;x++)K.shade(cx+x,hy-2,55);},
 boonie(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;K.cutAbove(hy-5);K.cutEll(hx,hy-5,13,3);
   K.ebrim(hy-5,13,3,H,xx=>Math.abs(xx)>.6?Math.round((Math.abs(xx)-.6)*5):0);
   K.dome(hy-13,hy-6,8,H,sh,(x,y,k)=>((x+40)%5===0&&y<hy-8)?Math.max(1,k-1):k);K.band(hy-8,hy-7,8.5,H2R);
   if(S){for(let y=hy-2;y<=chin;y++){const t=(y-hy+2)/(chin-hy+2);p(Math.round(cx-8+t*5),y,H[1]);p(Math.round(cx+9-t*5),y,H[1]);}for(let x=-3;x<=4;x++)p(cx+x,chin+1,H[1]);
     for(let x=-8;x<=9;x++)K.shade(cx+x,hy-1,60);}
   else if(side){for(let y=hy-2;y<=chin;y++)p(cx+fl*Math.round(1+(y-hy+2)*.25),y,H[1]);}},
 newsboy(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT;K.cutAbove(hy-4);
   K.ell(hx+(side?-fl:0),hy-9,11,4.6,(x,y,xx,yy)=>{let k=K.lit(xx,yy);if(yy>.55)k=Math.max(1,k-1);p(x,y,H[k]);});
   for(const a of [-.7,-.25,.25,.7]){for(let j=1;j<6;j++){const x=Math.round(hx+(side?-fl:0)+a*j*1.9),y=hy-13+j;if(g(x,y))p(x,y,H[1]);}}
   p(Math.round(hx-.5),hy-14,H[4]);p(Math.round(hx+.5),hy-14,H[2]);
   if(S){for(let x=-6;x<=7;x++){p(cx+x,hy-4,H[x<-2?3:2]);p(cx+x,hy-3,H[0]);}}else if(side){for(let i=0;i<5;i++){p(cx+fl*(8+i),hy-5,H[2]);p(cx+fl*(8+i),hy-4,H[0]);}}
   else for(let x=-8;x<=9;x++)p(cx+x,hy-5,H[1]);},
 deerstalker(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-14,hy-4,9,H,sh,(x,y,k)=>(x===0&&y>hy-13)?Math.max(1,k-1):k);for(let x=-9;x<=10;x++)p(cx+x+sh,hy-4,H[1]);
   if(S||N){for(let x=-6;x<=7;x++){p(cx+x,hy-3,H[x<-3?3:2]);p(cx+x,hy-2,H[0]);}
     for(const s of [-1,1]){const x0=s<0?cx-7:cx+8;for(let j=0;j<4;j++)for(let i=0;i<3-(j>>1);i++)p(x0-s*i,hy-11+j,H[s<0?(i===0?3:2):(i===0?1:2)]);}p(cx,hy-14,H2R[3]);p(cx+1,hy-14,H2R[2]);p(cx,hy-15,H2R[2]);}
   else{for(let i=0;i<6;i++){p(cx+fl*(7+i),hy-4,H[i<4?3:2]);p(cx+fl*(7+i),hy-3,H[0]);p(cx-fl*(8+i),hy-4,H[2]);p(cx-fl*(8+i),hy-3,H[0]);}
     for(let j=0;j<4;j++)for(let i=0;i<3;i++)p(cx-fl*(1+i),hy-11+j,H[i===2?1:2]);p(cx-fl,hy-14,H2R[3]);}},
 trapper(K){const {S,N,side,fl,cx,hy,chin,sh}=K,H=HAT,F=H2R;K.cutAbove(hy-4);
   K.dome(hy-14,hy-6,9,H,sh);
   const fur=(x,y,k)=>p(x,y,F[clamp(k,1,4)]);
   if(S||N){for(let y=hy-8;y<=hy-4;y++)for(let x=-9;x<=10;x++){if(y===hy-8&&((x+40)%3===0))continue;const xx=(x-.5)/9.5;fur(cx+x,y,y===hy-4?1:xx<-.4?4:xx>.5?2:3);}
     if(N){K.cutBox(cx-10,cx+11,hy-4,hy+4);for(let y=hy-4;y<=hy+3;y++)for(let x=-9;x<=10;x++){if(y===hy+3&&(x+40)%3===0)continue;const xx=(x-.5)/9.5;fur(cx+x,y,y===hy+3?1:xx<-.5?3:xx>.5?2:((x+y+40)%5===0?2:3));}}
     for(const s of [-1,1]){const x0=s<0?cx-10:cx+8;K.cutBox(x0,x0+3,hy-4,hy+6);for(let y=hy-4;y<=hy+6;y++)for(let i=0;i<4;i++){if(y===hy+6&&(i===0||i===3))continue;fur(x0+i,y,(s<0?i===0:i===3)?1:(s<0?(i===1?4:3):(i===2?2:3)));}}}
   else{for(let y=hy-8;y<=hy-4;y++)for(let u=-10;u<=9;u++){if(u<-1&&y>hy-8)continue;if(y===hy-8&&((u+40)%3===0))continue;fur(cx+u*fl,y,y===hy-4?1:3);}
     K.cutBox(Math.min(cx-fl*4,cx),Math.max(cx-fl*4,cx),hy-4,hy+6);for(let y=hy-4;y<=hy+6;y++)for(let u=-5;u<=-1;u++){if(y===hy+6&&(u===-5||u===-1))continue;fur(cx+u*fl,y,u===-5?1:u===-1?4:3);}}},
 ushanka(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT,F=H2R;K.cutAbove(hy-4);
   const fur=(x,y,xx,yy)=>{let k=K.lit(xx,yy);if(((x*2+y+60)%5)===0)k=Math.max(1,k-1);p(x,y,F[k]);};
   K.ell(hx,hy-8,10.5,7.5,(x,y,xx,yy)=>{if(y>hy-4)return;fur(x,y,xx,yy);});
   K.dome(hy-15,hy-10,7,H,sh);
   for(let x=-10;x<=11;x++){const b=((x+40)%3===0);p(cx+x+sh,hy-4,F[1]);if(!b)p(cx+x+sh,hy-11+(Math.abs(x-.5)>7?2:0),F[4]);}
   if(!N){for(let x=-1;x<=2;x++)p(cx+x+sh+(side?fl*6:0),hy-15,H[0]);}},
 slouch(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT;K.cutAbove(hy-3);
   const rib=(x,y,k)=>(y<hy-5&&((x+40)%2===0))?Math.max(1,k-1):k;
   if(N)K.ell(hx,hy-6,10,8,(x,y,xx,yy)=>p(x,y,H[rib(x,y,K.lit(xx,yy))]));
   if(side)K.ell(cx+.5-fl*5,hy-7,7,6,(x,y,xx,yy)=>p(x,y,H[rib(x,y,K.lit(xx*fl,yy))]));
   K.dome(hy-15,hy-4,9,H,sh,rib);
   for(let x=-9;x<=10;x++){p(cx+x+sh,hy-4,H[(x&1)?2:3]);p(cx+x+sh,hy-3,H[(x&1)?1:2]);}},
 watchcap(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   K.dome(hy-14,hy-8,9,H,sh);
   for(let y=hy-8;y<=hy-5;y++)for(let x=-9;x<=10;x++){const xx=(x-.5)/9.5;let k=xx<-.4?4:xx>.5?2:3;if([-7,-4,-2,1,3,6,8].includes(x))k--;if(y===hy-8)k=Math.min(4,k+1);if(y===hy-5)k=1;p(cx+x+sh,y,H[clamp(k,0,4)]);}},
 earmuffs(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT,B=H2R;
   const muff=(xc,yc,r)=>K.ell(xc,yc,r,r+.4,(x,y,xx,yy)=>{const d=Math.hypot(xx,yy);let k=K.lit(xx,yy);if(d>.86&&(x+y+40)%3===0)return;p(x,y,H[k]);});
   if(S||N){for(let a=0;a<=40;a++){const t=Math.PI*(a/40),x=Math.round(cx+.5-Math.cos(t)*9.6-.5),y=Math.round(hy-1-Math.sin(t)*12.5);p(x,y,B[a<20?3:2]);p(x,y+1,B[1]);}
     muff(cx-8.5,hy+1.5,3);muff(cx+9.5,hy+1.5,3);}
   else{for(let y=hy-11;y<=hy-2;y++){const x=Math.round(cx+.5-fl*2-.5*fl);p(x,y,B[2]);p(x-fl,y,B[1]);}muff(cx+.5-fl*2.5,hy+1.5,3.4);}},
 hood(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;
   if(S){K.cutBox(cx-17,cx+18,0,chin+5);
     K.ell(hx,hy-1,12,14.5,(x,y,xx,yy)=>{if(y>hy+5)return;const ix=(x+.5-hx)/7,iy=(y+.5-(hy+3.2))/9;const d=ix*ix+iy*iy;if(d<1){if(y<=hy-3)p(x,y,H[0]);else{const i=(y*FW+x)*4;LY.cut.d[i+3]=0;}return;}p(x,y,H[d<1.12?4:d<1.3?2:Math.min(4,K.lit(xx,yy)+(xx<-.2&&yy<-.2?1:0))]);});
     for(let y=hy+5;y<=chin+4;y++){const w=Math.round(10+(y-hy-5)*.35);for(let x=-w+1;x<=w;x++){if(Math.abs(x-.5)<4.5-(y-hy-5)*.5&&y<chin)continue;const xx=(x-.5)/w;p(cx+x,y,H[y===chin+4?1:((x+40)%5===0?1:xx<-.4?3:xx>.5?1:2)]);}}}
   else if(N){K.cutBox(cx-17,cx+18,0,chin+5);K.ell(hx,hy-2,12,13,(x,y,xx,yy)=>p(x,y,H[K.lit(xx,yy)]));p(cx,hy-16,H[3]);p(cx+1,hy-16,H[2]);
     for(let y=hy-14;y<=hy+8;y++)if(g(cx+1,y))p(cx+1,y,H[1]);
     for(let y=hy+9;y<=chin+4;y++){const w=Math.round(11+(y-hy-9)*.35);for(let x=-w+1;x<=w;x++)p(cx+x,y,H[y===chin+4?1:((x+40)%5===0?1:(x-.5)/w<-.4?3:2)]);}}
   else{K.cutBox(cx-17,cx+18,0,chin+5);
     K.ell(cx+.5-fl*2.5,hy-1,11,14,(x,y,xx,yy)=>{const uf=(x-cx)*fl;if(y>hy+6)return;if(uf>=4&&y>=hy-4)return;if(uf>=5&&y>=hy-6){const i=(y*FW+x)*4;LY.cut.d[i+3]=0;return;}p(x,y,H[uf>=3&&y>=hy-6?1:K.lit(xx*fl,yy)]);});
     for(let y=hy-6;y<=hy+6;y++){const u=4+Math.round((y-hy+6)*-.15);p(cx+u*fl,y,H[0]);}
     for(let y=hy+6;y<=chin+4;y++)for(let u=-12;u<=3;u++)p(cx+u*fl,y,H[y===chin+4?1:((u+40)%5===0?1:2)]);
     K.ell(cx+.5-fl*2.5,hy-1,11,14,(x,y)=>{const uf=(x-cx)*fl;if(uf<5||y<hy-6){}else{const i=(y*FW+x)*4;LY.cut.d[i+3]=0;}});}},
 sackhood(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;K.cutBox(cx-20,cx+21,0,63);
   const weave=(x,y,k)=>(((y+40)%3===0)&&k>=3&&hsh(Math.floor(x/4),y,23)<.5)?k-1:k;
   const body=(xc)=>K.ell(xc,hy-1,10,11.5,(x,y,xx,yy)=>p(x,y,H[weave(x,y,K.lit(xx*(side?fl:1),yy))]));
   body(hx+(side?-fl*.5:0));
   for(let y=hy+9;y<=chin+1;y++){const w=y<=hy+10?7:6;for(let x=-w+1;x<=w;x++)p(cx+x+sh,y,H[weave(cx+x,y,(x-.5)/w<-.4?3:2)]);}
   for(let x=-6;x<=7;x++){p(cx+x+sh,chin,H2R[x<0?3:2]);p(cx+x+sh,chin+1,H2R[1]);}
   for(let y=chin+2;y<=chin+4;y++){const w=7+(y-chin-2);for(let x=-w+1;x<=w;x++)p(cx+x+sh,y,H[y===chin+4?1:((x+40)%3===0?1:2)]);}
   if(!N){lockBlob(side?cx-fl*6:cx+7.5,hy-12,3,2,H);}else lockBlob(cx-6.5,hy-12,3,2,H);
   const hole=(x0)=>{for(let j=-1;j<=3;j++)for(let i=-1;i<=2;i++){const edge=j===-1||j===3||i===-1||i===2;const X=x0+i,Y=hy+j;if(edge){if((i+j+40)%3!==0||j===3)p(X,Y,H[0]);}else{const k=(Y*FW+X)*4;LY.hat.d[k+3]=0;}}};
   if(S){hole(cx-4);hole(cx+4);for(let x=-2;x<=3;x++){p(cx+x,hy+6,H[0]);if((x&1)===0){p(cx+x,hy+5,H[1]);p(cx+x,hy+7,H[1]);}}}
   else if(side){hole(cx+fl*4+(fl<0?-1:0));for(let u=5;u<=7;u++){p(cx+u*fl,hy+6,H[0]);}p(cx+fl*6,hy+5,H[1]);p(cx+fl*6,hy+7,H[1]);}
   else{for(let j=0;j<4;j++){p(cx-1,chin+2+j,H2R[2]);p(cx+2,chin+2+j,H2R[2]);}}},
 veil(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT,V=H2R;
   const ox=side?-fl*1:2;K.cutBox(Math.round(hx+ox-6),Math.round(hx+ox+6),hy-16,hy-11);
   for(let y=hy-15;y<=hy-11;y++)for(let x=-5;x<=6;x++){const xx=(x-.5)/5.5;p(Math.round(cx+x+ox+sh),y,H[y===hy-15?(xx<.3?4:3):y===hy-11?1:xx<-.4?3:xx>.5?1:2]);}
   lockBlob(Math.round(cx+ox+sh)-4,hy-13,1,1,V);
   /* the net: a scalloped lace hem at the chin and three fine strands from the hat, nothing over the face's colour */
   const hem=(x,y)=>{if(!g(x,y))p(x,y,V[1]);},strand=(x,y)=>{if(!g(x,y))P(LY[CUR],x,y,V[2],200);};
   if(S||N){for(let x=-9;x<=10;x++){const y=chin-1-((x+40)%3===0?0:1);hem(cx+x,y);if((x+40)%3===0)hem(cx+x,y+1);}for(const x of [-8,-3,4,9])for(let y=hy-10;y<chin-2;y++)if((y+x+40)%2===0||Math.abs(x)>7)strand(cx+x,y);}
   else{for(let u=-9;u<=9;u++){const y=chin-1-((u+40)%3===0?0:1)-(u<-4?2:0);hem(cx+u*fl,y);}for(const u of [-8,-2,8])for(let y=hy-10;y<chin-3;y++)strand(cx+u*fl,y);}},
 fedora(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   for(let y=hy-13;y<=hy-6;y++)for(let x=-6;x<=7;x++){const xx=(x-.5)/6.5;if(y===hy-13&&(Math.abs(xx)>.75||(!side&&Math.abs(x-.5)<2)))continue;if(y===hy-12&&Math.abs(xx)>.9)continue;
       let k=xx<-.45?4:xx>.55?1:xx>.15?2:3;if(y<=hy-12)k=Math.min(4,k+1);if(!side&&!N&&y===hy-11&&(x===-3||x===4))k=1;if(!side&&Math.abs(x-.5)<1&&y<=hy-11)k=Math.max(1,k-1);p(cx+x+sh,y,H[k]);}
   K.band(hy-8,hy-6,6.5,H2R);
   K.brim(hy-5,12,H,(x,xx)=>N?(Math.abs(xx)<.5?-1:0):0);
   if(S){for(let x=-4;x<=5;x++)p(cx+x,hy-3,H[1]);for(let x=-7;x<=8;x++)K.shade(cx+x,hy-2,60);}else if(side){p(cx+fl*13,hy-4,H[1]);p(cx+fl*12,hy-3,H[0]);}},
 bowler(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   K.dome(hy-14,hy-6,7.5,H,sh,(x,y,k,xx,yy)=>(xx<-.2&&yy<-.5)?Math.min(4,k+1):k);K.band(hy-7,hy-6,7.5,H2R);
   K.brim(hy-5,10,H,(x,xx)=>Math.abs(xx)>.82?-1:0);},
 tricorn(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT,T=MTR;K.cutAbove(hy-4);
   K.dome(hy-15,hy-8,7.5,H,sh);
   if(S){for(let x=-11;x<=12;x++){const a=Math.abs(x-.5);const yb=Math.round(hy-3-a*.33),yt=Math.round(hy-7-a*.22)-(a>9?0:0);for(let y=yt;y<=yb;y++)p(cx+x,y,H[y===yb?0:y===yb-1?1:(x<-1?3:x>2?2:3)]);if(a<10.5)p(cx+x,yt-1,T[x<0?3:2]);}}
   else if(N){for(let x=-11;x<=12;x++){const a=Math.abs(x-.5);const yt=Math.round(hy-9-(a>8?(a-8)*.5:0)),yb=hy-5;for(let y=yt;y<=yb;y++)p(cx+x,y,H[y===yb?0:y===yt?3:2]);if(a<10.5)p(cx+x,yt-1,T[2]);}}
   else{for(let u=-11;u<=11;u++){const a=Math.abs(u);const yt=Math.round(hy-8-(a>6?(a-6)*.45:0)),yb=Math.round(hy-4-(u>0?u*.15:0));for(let y=yt;y<=yb;y++)p(cx+u*fl,y,H[y===yb?0:y===yt?3:u>0?3:2]);p(cx+u*fl,yt-1,T[2]);}}},
 porkpie(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT;K.cutAbove(hy-5);
   for(let y=hy-10;y<=hy-6;y++)for(let x=-6;x<=7;x++){const xx=(x-.5)/6.5;p(cx+x+sh,y,H[xx<-.45?4:xx>.55?1:xx>.15?2:3]);}
   for(let x=-6;x<=7;x++){const xx=(x-.5)/6.5;p(cx+x+sh,hy-11,H[Math.abs(xx)<.65?2:4]);p(cx+x+sh,hy-12,H[Math.abs(xx)>.85?3:4]);}
   K.band(hy-7,hy-6,6.5,H2R);K.brim(hy-5,10,H,(x,xx)=>Math.abs(xx)>.75?-1:0);},
 panama(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   for(let y=hy-13;y<=hy-6;y++)for(let x=-6;x<=7;x++){const xx=(x-.5)/6.5;if(y===hy-13&&(Math.abs(xx)>.75||(!side&&Math.abs(x-.5)<2)))continue;if(y===hy-12&&Math.abs(xx)>.9)continue;
       let k=xx<-.45?4:xx>.55?2:3;if((y+40)%2===0&&k>2)k--;p(cx+x+sh,y,H[k]);}
   K.band(hy-8,hy-6,6.5,H2R);K.brim(hy-5,13,H,(x,xx)=>N?(Math.abs(xx)<.5?-1:0):0);
   if(S){for(let x=-5;x<=6;x++)p(cx+x,hy-3,H[1]);for(let x=-8;x<=9;x++)K.shade(cx+x,hy-2,55);}},
 cloche(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-3);K.cutBox(cx-11,cx-6,hy-3,hy);K.cutBox(cx+7,cx+12,hy-3,hy);
   K.dome(hy-14,hy-3,9.5,H,sh);K.band(hy-5,hy-4,9.5,H2R);
   for(let x=-10;x<=11;x++){const a=Math.abs(x-.5);const dn=a>8?Math.round(a-8):0;p(cx+x+sh,hy-3+dn,H[x<-4?2:1]);p(cx+x+sh,hy-2+dn,H[0]);}
   if(S)lockBlob(cx+6.5,hy-5,2,2,H2R);else if(side)lockBlob(cx-fl*3,hy-5,2,2,H2R);},
 mobcap(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-15,hy-5,10.5,H,sh,(x,y,k)=>((x+40)%3===0&&y>hy-13)?Math.max(1,k-1):k);
   for(let x=-11;x<=12;x++){const b=((x+40)%3===0);p(cx+x+sh,hy-5,H[b?2:3]);p(cx+x+sh,hy-4,H[b?3:2]);if(!b)p(cx+x+sh,hy-3,H[1]);}
   K.band(hy-7,hy-7,10,H2R);if(S)K.bow(cx-6,hy-7,H2R);else if(side)K.bow(cx-fl*7,hy-7,H2R);},
 nightcap(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   const dir=S?1:N?-1:-fl;   /* a long soft cone that flops over to one side and hangs beside the head, a pom at its end */
   const P=[[0,-6],[0,-11],[1.5,-15],[5,-16.5],[8.5,-15],[10,-11],[10.5,-6],[10.5,-2]];
   for(let j=0;j<P.length-1;j++){const [u0,v0]=P[j],[u1,v1]=P[j+1];const n=Math.max(1,Math.ceil(Math.hypot(u1-u0,v1-v0)*2));
     for(let i=0;i<=n;i++){const t=(j+i/n)/(P.length-1),u=u0+(u1-u0)*i/n,v=v0+(v1-v0)*i/n,r=Math.max(1.2,8.5*(1-t*.86));
       K.ell(cx+.5+sh+dir*u,hy+v,r,Math.min(r,2.2),(x,y,xx,yy)=>{if(g(x,y)&&yy>-.2)return;p(x,y,H[yy<-.3?(xx*dir<0?4:3):yy<.4?(xx*dir<.3?3:2):1]);});}}
   lockBlob(Math.round(cx+sh+dir*10.5),hy,2,2,H2R);
   for(let x=-9;x<=10;x++){p(cx+x+sh,hy-6,H2R[x<-4?4:3]);p(cx+x+sh,hy-5,H2R[x<-4?3:2]);p(cx+x+sh,hy-4,H2R[1]);}},
 minerhat(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   K.dome(hy-14,hy-5,9,H,sh);K.brim(hy-4,10.5,H);
   const lamp=(x0)=>{for(let j=0;j<4;j++)for(let i=0;i<4;i++)p(x0+i,hy-11+j,MTR[i===0?3:i===3?1:2]);p(x0+1,hy-10,LAMP[3]);p(x0+2,hy-10,LAMP[2]);p(x0+1,hy-9,LAMP[2]);p(x0+2,hy-9,LAMP[1]);};
   if(S)lamp(cx-1);else if(side){for(let j=0;j<4;j++)for(let i=0;i<2;i++)p(cx+fl*(8+i),hy-11+j,MTR[i?1:3]);p(cx+fl*10,hy-10,LAMP[3]);p(cx+fl*10,hy-9,LAMP[2]);}
   else{for(let y=hy-3;y<=hy+5;y++)p(cx+1,y,H2R[y&1?1:2]);}},
 beekeeper(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT,V=H2R;K.cutAbove(hy-6);
   /* the net hangs from the brim to the collar: its two edges, a gathered hem and two fine strands, the face left on its own skin */
   const line=(x,y,a)=>{if(!g(x,y))P(LY[CUR],x,y,V[2],a||220);};
   for(let y=hy-5;y<=chin+2;y++){const w=Math.round(12-(y-hy+5)*.12);line(cx-w+1+sh,y);line(cx+w+sh,y);if(!side){if((y&1)===0){line(cx-4+sh,y,170);line(cx+5+sh,y,170);}}}
   for(let x=-10;x<=11;x++){p(cx+x+sh,chin+3,V[x&1?1:2]);}
   K.ebrim(hy-6,13,2.4,H);K.dome(hy-13,hy-7,7,H,sh);K.band(hy-8,hy-7,7.5,H2R);},
 toque(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT;K.cutAbove(hy-4);
   K.ell(hx,hy-14,10,6.5,(x,y,xx,yy)=>{let k=K.lit(xx,yy);if([-7,-4,-2,2,5,8].includes(Math.round(x-hx+.5))&&yy>-.6)k=Math.max(1,k-1);p(x,y,H[k]);});
   for(let y=hy-9;y<=hy-4;y++)for(let x=-8;x<=9;x++){const xx=(x-.5)/8.5;p(cx+x+sh,y,H[y===hy-4?1:y===hy-9?2:xx<-.4?4:xx>.5?2:3]);}},
 peaked(K){const {S,N,side,fl,cx,hy,sh,hx}=K,H=HAT,B=H2R;K.cutAbove(hy-4);
   for(let y=hy-10;y<=hy-6;y++){const w=Math.round(10-(y-hy+10)*.45);for(let x=-w+1;x<=w;x++){const xx=(x-.5)/w;p(cx+x+sh,y,H[xx<-.4?3:xx>.5?1:2]);}}
   K.ell(hx,hy-11,10,2.2,(x,y,xx,yy)=>p(x,y,H[yy<0?4:xx>.5?2:3]));
   K.band(hy-7,hy-5,8.5,B);
   if(S){p(cx,hy-9,MTR[4]);p(cx+1,hy-9,MTR[2]);p(cx,hy-8,MTR[2]);p(cx+1,hy-8,MTR[1]);for(let x=-6;x<=7;x++){p(cx+x,hy-4,B[x<-2?3:1]);p(cx+x,hy-3,B[0]);}p(cx-3,hy-4,B[4]);for(let x=-6;x<=7;x++)K.shade(cx+x,hy-2,60);}
   else if(side){for(let i=0;i<5;i++){p(cx+fl*(8+i),hy-5,B[i<2?3:1]);p(cx+fl*(8+i),hy-4,B[0]);}}},
 kepi(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   for(let y=hy-13;y<=hy-5;y++)for(let x=-7;x<=8;x++){const xx=(x-.5)/7.5;if(side){const u=x*fl;if(y<hy-13+Math.round((u+7)*.2))continue;}p(cx+x+sh,y,H[y<=hy-12?4:xx<-.45?3:xx>.55?1:2]);}
   K.band(hy-6,hy-5,7.5,H2R);
   if(S){for(let x=-6;x<=7;x++){p(cx+x,hy-4,H[0]);p(cx+x,hy-3,H[0]);}p(cx-3,hy-4,H[2]);}else if(side){for(let i=0;i<5;i++){p(cx+fl*(8+i),hy-5,H[1]);p(cx+fl*(8+i),hy-4,H[0]);}}},
 balaclava(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;K.cutBox(cx-20,cx+21,0,63);
   const rib=(x,y,k)=>((x===-5||x===6)&&y>hy+4)?Math.max(1,k-1):k;
   K.ell(hx,hy-1,9.5,11.5,(x,y,xx,yy)=>{if(y>chin)return;p(x,y,H[rib(x,y,K.lit(side?xx*fl:xx,yy))]);});
   for(let y=chin-1;y<=chin+3;y++)for(let x=-6;x<=7;x++)p(cx+x+sh,y,H[rib(cx+x,y,(x-.5)/6.5<-.4?3:y===chin+3?1:2)]);
   const slot=(x0,x1)=>{for(let y=hy-1;y<=hy+3;y++)for(let x=x0;x<=x1;x++){const edge=y===hy-1||y===hy+3||x===x0||x===x1;if(edge)p(x,y,H[1]);else{const i=(y*FW+x)*4;LY.hat.d[i+3]=0;}}};
   if(S)slot(cx-7,cx+8);else if(side){const a=cx+fl*2,b=cx+fl*9;slot(Math.min(a,b),Math.max(a,b));}},
 souwester(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;K.cutAbove(hy-5);K.cutEll(hx,hy-5,12,3);
   const gloss=(x,y,k,xx,yy)=>(xx<-.3&&xx>-.55&&yy<-.2)?4:k;
   if(N){K.cutBox(cx-13,cx+14,hy-5,hy+2);for(let y=hy-5;y<=hy+2;y++){const w=Math.round(10+(y-hy+5)*.4);for(let x=-w+1;x<=w;x++){const xx=(x-.5)/w;p(cx+x,y,H[y===hy+2?0:y===hy+1?1:xx<-.5?4:xx>.5?2:3]);}}}
   K.ebrim(hy-5,12,2.6,H,xx=>Math.round(Math.abs(xx)*1.5));
   K.dome(hy-13,hy-6,8,H,sh,gloss);
   if(side){K.cutBox(Math.min(cx-fl*4,cx-fl*13),Math.max(cx-fl*4,cx-fl*13),hy-5,hy+2);for(let u=-12;u<=-4;u++){const yb=hy-4+Math.round((-4-u)*.75);for(let y=hy-4;y<=yb;y++)p(cx+u*fl,y,H[y===yb?0:2]);}}
   if(S){for(let y=hy-2;y<=chin;y++){const t=(y-hy+2)/(chin-hy+2);p(Math.round(cx-8+t*5),y,H[1]);p(Math.round(cx+9-t*5),y,H[1]);}for(let x=-8;x<=9;x++)K.shade(cx+x,hy-2,60);}},
 visor(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;
   for(let x=-9;x<=10;x++){if(S||N||x*fl<6){p(cx+x+sh,hy-7,H[x<-4?3:2]);p(cx+x+sh,hy-6,H[1]);}}
   if(S){for(let x=-7;x<=8;x++){p(cx+x,hy-5,H[x<-3?3:2]);p(cx+x,hy-4,H[0]);}for(let x=-7;x<=8;x++)K.shade(cx+x,hy-3,55);}
   else if(side){for(let i=0;i<9;i++){p(cx+fl*(6+i),hy-6,H[i<6?3:2]);p(cx+fl*(6+i),hy-5,H[0]);}}
   else{p(cx,hy-7,MTR[3]);p(cx+1,hy-7,MTR[2]);}},
 scarecrow(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   for(let y=hy-15;y<=hy-6;y++){const t=(hy-6-y)/9,w=Math.round(6.5-t*1.5+(y===hy-11?1:0)),bend=t>.6?Math.round((t-.6)*9)*(S?-1:N?1:fl):0;for(let x=-w+1;x<=w;x++){const xx=(x-.5)/w;p(cx+x+sh+bend,y,H[xx<-.4?3:xx>.45?1:2]);}}
   if(!N)for(let j=0;j<3;j++)for(let i=0;i<3;i++)p(cx+(side?-fl*2:1)+sh+i,hy-10+j,H2R[j===0?3:2]);if(!N){p(cx+(side?-fl*2:1)+sh-1,hy-11,H[0]);p(cx+(side?-fl*2:1)+sh+3,hy-8,H[0]);}
   for(let x=-6;x<=7;x++)p(cx+x+sh,hy-7,H[(x&1)?0:1]);
   for(let x=-13;x<=14;x++){if(x===-11||x===9||x===12)continue;const dn=(x>8?1:0);p(cx+x+sh,hy-6+dn,H[x<-5?3:x>6?1:2]);p(cx+x+sh,hy-5+dn,H[0]);}
   for(const [x0,d] of [[-8,-1],[-9,-1],[9,1],[10,1]])for(let j=0;j<3+((x0+40)%2);j++)p(cx+x0+sh+d*(j>>1),hy-4+j,STRAW[j===0?3:2]);},
 aviator(K){const {S,N,side,fl,cx,hy,chin,sh,hx}=K,H=HAT;
   if(S||N){K.cutBox(cx-17,cx+18,0,hy+6);if(S)K.ell(hx,hy+3,6.5,8.5,(x,y)=>{if(y>=hy-4){const i=(y*FW+x)*4;LY.cut.d[i+3]=0;}});
     K.ell(hx,hy-1,9.5,12.5,(x,y,xx,yy)=>{if(y>hy+7)return;if(S){const ix=(x+.5-hx)/6.5,iy=(y+.5-(hy+3))/8.5;if(ix*ix+iy*iy<1)return;}p(x,y,H[K.lit(xx,yy)]);});
     if(S){for(let x=-5;x<=6;x++)p(cx+x,chin,H[1]);p(cx+4,chin,MTR[3]);
       for(const s of [-1,1]){const xc=cx+.5+s*3.5;K.ell(xc,hy-7,2.2,1.8,(x,y,xx,yy)=>{const d=Math.hypot(xx,yy);p(x,y,d>.62?MTR[yy<0?3:1]:LNR[yy<0?4:2]);});}p(cx,hy-7,MTR[2]);p(cx+1,hy-7,MTR[2]);}
     else{for(let x=-9;x<=10;x++)p(cx+x,hy-7,H2R[2]);}}
   else{K.cutBox(cx-17,cx+18,0,hy+6);K.ell(cx+.5-fl*1.5,hy-1,9.5,12.5,(x,y,xx,yy)=>{const uf=(x-cx)*fl;if(y>hy+7)return;if(uf>=2&&y>=hy-4){if(uf<4&&y<hy+7)p(x,y,H[1]);else{const i=(y*FW+x)*4;LY.cut.d[i+3]=0;}return;}p(x,y,H[K.lit(xx*fl,yy)]);});
     K.ell(cx+.5+fl*5.5,hy-7,1.8,1.8,(x,y,xx,yy)=>{const d=Math.hypot(xx,yy);p(x,y,d>.6?MTR[2]:LNR[3]);});for(let u=-8;u<=4;u++)p(cx+u*fl,hy-7,H2R[2]);}},
 alpine(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-5);
   for(let y=hy-14;y<=hy-6;y++){const t=(hy-6-y)/8,w=Math.round(6.5-t*2.2);for(let x=-w+1;x<=w;x++){const xx=(x-.5)/w;let k=xx<-.4?4:xx>.5?1:xx>.1?2:3;if(!side&&Math.abs(x-.5)<1&&y<hy-10)k=1;p(cx+x+sh,y,H[k]);}}
   for(let x=-6;x<=7;x++){p(cx+x+sh,hy-7,H[0]);p(cx+x+sh,hy-6,H2R[(x&1)?2:3]);}
   K.brim(hy-5,10,H,(x,xx)=>N?-1:(Math.abs(xx)>.8?-1:0));
   /* a feather tucked in the band: a quill and a soft vane swept back */
   const d=S?1:N?-1:-fl,fx=S?cx+5:N?cx-4:cx-fl*4;
   if(!N)for(let j=0;j<7;j++){const x=Math.round(fx+d*j*.7),y=hy-7-Math.round(j*.9);p(x,y,H2R[j<3?2:j<6?3:4]);if(j>1&&j<8){p(x+d,y,H2R[j<5?2:3]);p(x+d,y+1,H2R[1]);}}},
 furhat(K){const {S,N,side,fl,cx,hy,sh}=K,H=HAT;K.cutAbove(hy-4);
   for(let y=hy-16;y<=hy-4;y++)for(let x=-10;x<=11;x++){const xx=(x-.5)/9.5;const bump=((x+y*2+60)%3===0)?1:0;if(Math.abs(xx)>1+bump*.06)continue;if(y===hy-16)continue;
     let k=xx<-.5?4:xx>.55?2:3;if(hsh(x,Math.floor((y+Math.floor(hsh(x,2,7)*3))/3),19)<.22)k=Math.max(1,k-1);if(y===hy-4)k=1;if(y<=hy-15)k=Math.min(4,k+1);p(cx+x+sh,y,H[k]);}},
};
const LITTOP={backcap:1,minerhat:1,hood:1,balaclava:1,hardhat:1,peaked:1,bowler:1,furhat:1};
function hatNew(cx,hy,view,fl,h){const D=HATDEF[h];if(!D)return false;D(hatKit(cx,hy,view,fl));
  if(LITTOP[h]){const L=LY.hat,mid=cx+.5+(view==='E'||view==='W'?-fl:0);for(let x=0;x<FW;x++)for(let y=0;y<FH;y++){const i=(y*FW+x)*4;if(!L.d[i+3])continue;if(L.d[i+3]<250)break;p(x,y,HAT[x<mid+1?4:3]);break;}}
  return true;}
function hat(cx,hy,view,fl,h,hairTop){if(!h)return;if(hatNew(cx,hy,view,fl,h))return;const H=HAT,side=view!=='S'&&view!=='N',chin=hy+9,top=chin-HEADH+1;const T0=Math.min(top-2,hairTop!=null?hairTop+1:top-2);
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
// ---- wardrobe accessories on the head and neck (new): acc main colour, acc2 second colour, metal, gem
const ACC2=ramp(C.acc2||'#4a6ab8'),GEMR=ramp(C.gem||'#34a5c2');
function acc2(cx,hy,view,fl,a,top0){const S=view==='S',N=view==='N',side=!S&&!N,R=ACCR;const X=u=>side?Math.round(cx+.5+u*fl-.5*fl):cx+u;
  switch(a){
  case 'beads':if(N)return true;{const bead=(x,y,Rr)=>{q(x,y,Rr,4);q(x+1,y,Rr,3);q(x+2,y,Rr,2);q(x,y+1,Rr,3);q(x+1,y+1,Rr,3);q(x+2,y+1,Rr,1);q(x,y+2,Rr,2);q(x+1,y+2,Rr,1);q(x+2,y+2,Rr,1);};
    if(side){bead(X(3)-1,top0,R);bead(X(5)-1,top0+2,ACC2);return true;}
    [[-7,-1],[-4,1],[-1,2],[2,2],[5,1],[8,-1]].forEach(([u,v],i)=>bead(cx+u-1,top0+v,i%2?ACC2:R));}return true;
  case 'longscarf':{const wrap=(u0,u1,y0)=>{for(let y=y0;y<=y0+2;y++)for(let u=u0;u<=u1;u++)q(X(u),y,R,y===y0?4:y===y0+2?1:((u+40)%3===0?2:3));};
    const tail=(xa,y0,len,w0)=>{for(let j=0;j<len;j++){const w=w0+(j>len-4?1:0);for(let i=0;i<w;i++){const x=xa(i,w),last=j===len-1;if(last&&i%2)continue;q(x,y0+j,R,last?1:i===0?4:i===w-1?1:3);}}};
    if(N){wrap(-6,7,top0-1);tail((i,w)=>cx+3+i,top0+2,8,3);return true;}
    if(side){wrap(-3,4,top0-1);tail((i,w)=>X(2+i),top0+2,8,2);return true;}
    wrap(-6,7,top0-1);tail((i,w)=>cx-4-(w-3)+i,top0+2,10,3);return true;}
  case 'hoops':{const ring=(x0,y0)=>{for(const [i,j,k] of [[1,0,4],[0,1,4],[0,2,3],[2,1,2],[2,2,1],[1,3,1],[1,1,0],[1,2,0]])q(x0+i,y0+j,METAL,k);};
    if(side){ring(Math.round(cx-fl*1.5)-1,hy+3);return true;}ring(cx-11,hy+3);ring(cx+10,hy+3);return true;}
  case 'flowercrown':{const y0=hy-8;const cur=u=>y0+Math.round(Math.pow(Math.abs(u-.5)/8.5,2)*3)+(N?1:0);
    const fl3=(x,y)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){if(!i&&!j){q(x,y,GEMR,4);continue;}q(x+i,y+j,R,i&&j?(i<0&&j<0?3:1):(i<0||j<0)?4:2);}};
    const fl2=(x,y)=>{q(x,y-1,R,4);q(x-1,y,R,3);q(x+1,y,R,2);q(x,y+1,R,2);q(x,y,GEMR,4);};const leaf=(x,y,s)=>{q(x,y,ACC2,3);q(x+s,y-1,ACC2,4);q(x+s,y,ACC2,2);};
    if(side){const c2=u=>y0+Math.round(Math.abs(u+1)*.25);for(let u=-6;u<=4;u++)q(X(u),c2(u),ACC2,2);for(const u of [-3,1])leaf(X(u),c2(u)-1,fl);fl3(X(-5),c2(-5)-1);fl2(X(3),c2(3)-1);return true;}
    for(let u=-8;u<=9;u++)q(cx+u,cur(u),ACC2,u<0?3:2);for(const u of (N?[-3,4]:[-4,0,5]))leaf(cx+u,cur(u)-1,u<1?-1:1);for(const u of (N?[-6,0,7]:[-7,-2,3,8]))((u===-2||u===8||u===0)?fl3:fl2)(cx+u,cur(u)-1);return true;}
  case 'bandage':{const sp=(x,y)=>q(x,y,ACC2,2);
    if(side){for(let u=-7;u<=6;u++){const y=hy-6+Math.round(Math.abs(u+.5)*.12);for(let k=0;k<3;k++)q(X(u),y+k,R,k===0?4:k===2?1:((u+k+40)%4===0?2:3));}
      q(X(-8),hy-5,R,3);q(X(-8),hy-4,R,2);q(X(-9),hy-3,R,2);q(X(-9),hy-2,R,1);q(X(-8),hy-2,R,1);sp(X(4),hy-5);return true;}
    const yc=u=>hy-5-Math.round(Math.pow(Math.abs(u-.5)/8.5,2)*2)+(N?1:0);
    for(let u=-8;u<=9;u++){const y=yc(u);for(let k=0;k<3;k++)q(cx+u,y+k,R,k===0?(u<4?4:3):k===2?1:((u+k+40)%4===0?2:3));}
    if(N){for(const [i,j,k] of [[0,0,4],[1,0,3],[0,1,3],[1,1,2],[-1,2,3],[-1,3,2],[-2,4,1],[2,2,2],[2,3,2],[3,4,1]])q(cx+i,yc(0)+j,R,k);return true;}
    q(cx+9,yc(9)+3,R,2);q(cx+9,yc(9)+4,R,1);sp(cx-4,yc(-4)+1);sp(cx-3,yc(-3)+1);return true;}
  case 'plaguemask':{const L=R;if(N){for(let u=-8;u<=9;u++){q(cx+u,hy,ACC2,u<0?3:2);q(cx+u,hy+1,ACC2,1);}return true;}
    if(side){for(let y=hy-3;y<=hy+8;y++)for(let u=2;u<=8;u++){if(y<hy-1&&u>6)continue;q(X(u),y,L,u===2?2:y<hy?4:3);}K_ell(X(5)+.5,hy+1,2.2,2.2,(x,y)=>q(x,y,ACC2,1));K_ell(X(5)+.5,hy+1,1.3,1.3,(x,y)=>q(x,y,GEMR,y<=hy+1?4:2));
      for(let j=0;j<8;j++){const y=hy+3+j,u0=8+Math.round(j*.6);for(let u=8;u<=u0+1;u++)q(X(u),y,L,j===7||u===u0+1?1:u===8&&j<5?4:2);}for(let u=-7;u<=1;u++){q(X(u),hy,ACC2,3);q(X(u),hy+1,ACC2,1);}return true;}
    for(let y=hy-3;y<=hy+8;y++)for(let u=-6;u<=7;u++){if(y>hy+5&&Math.abs(u-.5)>5)continue;if(y===hy-3&&Math.abs(u-.5)>5)continue;q(cx+u,y,L,y<hy-1&&u<4?4:u<-3?4:u>4?2:3);}
    for(const x0 of [cx-4,cx+4]){K_ell(x0+1,hy+1.5,2.4,2.4,(x,y)=>q(x,y,ACC2,1));K_ell(x0+1,hy+1.5,1.6,1.6,(x,y,xx,yy)=>q(x,y,GEMR,yy<0?4:2));}
    for(let j=0;j<9;j++){const y=hy+3+j,w=Math.max(0,2-Math.floor(j/3));for(let u=-w;u<=w+1;u++)q(cx+u,y,L,j===8?1:u===0?4:u<0?3:u===1?2:1);}q(cx,hy+1,L,4);q(cx,hy+2,L,4);q(cx+1,hy+2,L,2);
    q(cx-8,hy,ACC2,2);q(cx+9,hy,ACC2,2);q(cx-8,hy+1,ACC2,1);q(cx+9,hy+1,ACC2,1);return true;}
  case 'porcelain':{const L=R;
    if(N){for(let u=-8;u<=9;u++){q(cx+u,hy+1,ACC2,u<0?3:2);q(cx+u,hy+2,ACC2,1);}for(const [i,j,k] of [[0,0,4],[1,0,3],[0,1,3],[1,1,2],[-1,2,2],[-1,3,1],[2,2,2],[2,3,1]])q(cx+i,hy+1+j,ACC2,k);return true;}
    if(side){for(let y=hy-4;y<=hy+8;y++)for(let u=3;u<=(y>hy+5?6:8);u++)q(X(u),y,L,u===3?2:y<hy-1?4:y>hy+5?2:u>=7&&y>hy+2?2:3);q(X(4),hy+1,[18,14,18],0);q(X(5),hy+1,[18,14,18],0);q(X(5),hy,L,1);q(X(6),hy+6,L,1);
      for(let u=-6;u<=2;u++){q(X(u),hy+1,ACC2,3);q(X(u),hy+2,ACC2,1);}return true;}
    for(let y=hy-4;y<=hy+8;y++){const w=y>hy+6?4:y>hy+4?6:7;for(let u=-w+1;u<=w;u++){const xx=(u-.5)/w;let k=xx<-.45?4:xx>.5?2:3;if(u===w)k=1;if(y===hy-4&&xx<.5)k=4;if(y>=hy+7)k=xx<0?2:1;if(y===hy-1&&Math.abs(u-.5)>1.5&&Math.abs(u-.5)<6)k=Math.min(k,2);q(cx+u,y,L,k);}}
    for(const x0 of [cx-4,cx+3])for(const [i,j] of [[0,1],[1,0],[2,0],[1,1],[2,1],[3,1]])P(LY[CUR],x0+i,hy+j,[18,14,18]);q(cx+1,hy+3,L,2);q(cx+1,hy+4,L,1);q(cx,hy+6,L,1);q(cx+1,hy+6,L,1);q(cx-4,hy+4,L,4);q(cx-3,hy+4,L,4);for(const x of [cx-6,cx+7])q(x,hy+3,ACC2,3);return true;}
  case 'antlers':{const ant=(x0,y0,s)=>{const pts=[[0,0],[s*1,-2],[s*2,-4],[s*2,-6],[s*3,-8]];for(let k=0;k<pts.length-1;k++){const [a1,b1]=pts[k],[a2,b2]=pts[k+1];for(let t=0;t<=2;t++){const x=Math.round(x0+a1+(a2-a1)*t/2),y=Math.round(y0+b1+(b2-b1)*t/2);q(x,y,R,s<0?4:3);q(x+1,y,R,s<0?3:1);}}
      for(const [a1,b1,a2,b2] of [[s*1,-3,s*5,-6],[s*2,-6,s*1,-10]])for(let t=0;t<=3;t++){q(Math.round(x0+a1+(a2-a1)*t/3),Math.round(y0+b1+(b2-b1)*t/3),R,t===3?2:3);}};
    if(side){ant(X(-2),hy-10,-fl);return true;}ant(cx-5,hy-10,-1);ant(cx+5,hy-10,1);return true;}
  case 'clothmask':{const L=R;if(N){for(let u=-8;u<=9;u++)q(cx+u,hy+3,L,1);return true;}
    if(side){for(let y=hy+3;y<=hy+8;y++)for(let u=2;u<=8;u++)q(X(u),y,L,y===hy+3?4:y===hy+8?1:u===2?2:3);for(let u=-1;u<=1;u++)q(X(u),hy+3,L,2);return true;}
    for(let y=hy+3;y<=hy+8;y++){const w=y>hy+6?5:7;for(let u=-w+1;u<=w;u++)q(cx+u,y,L,y===hy+3?4:y===hy+8?1:(y===hy+5||y===hy+7)&&Math.abs(u-.5)<4?2:u<-4?4:3);}q(cx-7,hy+2,L,2);q(cx+8,hy+2,L,2);return true;}
  }
  return false;}
function acc(cx,hy,view,fl,a,top0,hairTop){if(!a)return;if(acc2(cx,hy,view,fl,a,top0))return;const R=ACCR,side=view!=='S'&&view!=='N',back=view==='N',chin=hy+9;
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
        S:[[3,7,90,.75,0],[5,-4,-70,1,1],[5,-11,-62,1,1],[4,-12,-70,.9,1],[3,-3,90,.3,0],[3,13,88,1.3,0],[3,12,88,1.2,0],[3,7,88,.75,0]],   /* the strike reaches the square in front (motion check: it landed at the feet) */
        // facing away: the strike shows its head beside and above the player's head instead of vanishing behind the body
        N:[[3,6,90,.5,1],[3,-4,-90,1,1],[2,-12,-90,1,1],[2,-13,-90,.5,0],[6,-13,-78,1.15,1],[6,-9,-80,1.05,1],[6,-8,-80,1,1],[3,5,90,.5,1]]},
 // the axe: wound back at shoulder height, a level chop into the trunk in front, held in the wood, pulled out
 axe:{E:[[6,7,60,1,0],[2,-3,-100,1,1],[-2,-6,-150,1,1],[-3,-5,-172,1,1],[6,-4,-40,1,0],[11,-1,-6,1,0],[11,0,-2,1,0],[7,4,40,1,0]],
      S:[[3,7,90,.75,0],[6,-4,-60,1,1],[6,-10,-70,1,1],[5,-13,-75,.9,1],[3,-2,90,.35,0],[3,13,88,1.3,0],[3,12,88,1.2,0],[3,8,88,.8,0]],   /* owner: front and back swings went sideways; now over the shoulder and down onto what's in front */
      N:[[3,6,90,.5,1],[3,-6,-90,1,1],[2,-14,-90,1,1],[2,-16,-90,.5,0],[6,-14,-78,1.2,1],[6,-11,-80,1.1,1],[6,-12,-80,1.05,1],[3,5,90,.5,1]]},
 // the pickaxe: a high overhead wind-up, a heavy strike low into the ground, a recoil off the stone, then settling
 pick:{E:[[6,7,55,1,0],[2,-6,-90,1,1],[-1,-13,-135,1,1],[-3,-14,-170,1,1],[6,-6,-30,1,0],[11,8,42,1,0],[10,5,26,1,0],[7,6,50,1,0]],
       S:[[3,7,90,.75,0],[5,-6,-70,1,1],[5,-14,-75,1,1],[4,-16,-80,.9,1],[3,-2,90,.3,0],[3,13,88,1.3,0],[3,11,88,1.15,0],[3,8,88,.8,0]],   /* facing down: struck straight down, point first, reaching the stone (owner) */
       N:[[3,6,90,.5,1],[3,-6,-90,1,1],[2,-14,-90,1,1],[2,-16,-90,.5,0],[6,-14,-78,1.2,1],[6,-11,-80,1.1,1],[6,-12,-80,1.05,1],[3,5,90,.5,1]]},
 rod:{E:[[6,3,-35,1,0],[3,-5,-100,1,1],[1,-9,-135,1,1],[0,-10,-150,1,1],[5,-3,-50,1,0],[8,2,-15,1,0],[8,3,-10,1,0],[7,3,-25,1,0]],
      S:[[5,4,70,.75,0],[5,-4,-90,1,1],[3,-9,-90,1,1],[2,-10,-90,.8,1],[4,0,60,.6,0],[5,4,75,.7,0],[5,5,78,.7,0],[5,4,72,.75,0]],
      N:[[5,2,-80,.8,1],[5,-3,-90,1,1],[4,-9,-90,.7,0],[3,-11,-90,.5,0],[5,-4,-85,1,1],[5,1,-80,.9,1],[5,2,-80,.9,1],[5,2,-80,.85,1]]},
 can:{E:[[8,5,0,1,0],[9,2,10,1,0],[10,1,20,1,0],[11,1,40,1,0],[11,1,48,1,0],[11,1,48,1,0],[11,1,40,1,0],[9,3,10,1,0]],
      S:[[6,6,0,1,0],[6,6,10,1,0],[7,7,20,1,0],[8,9,42,1,0],[8,9,50,1,0],[8,9,50,1,0],[8,9,42,1,0],[7,7,10,1,0]],   /* motion judge r2: held out at the waist beside the hip, not hugged to the chest */
      N:[[9,4,0,1,1],[10,2,10,1,1],[11,-4,20,1,0],[11,-11,42,1,0],[11,-12,50,1,0],[11,-12,50,1,0],[11,-11,42,1,0],[10,3,10,1,1]]}};   /* judge r4: raised above the shoulder so the stream falls onto the square behind him */   /* facing away: raised and out past his right side so the stream shows */   // the can held out to the right side so it shows past the body
const TOOLMETA={N:[],W:[],S:[],E:[]};let HANDS_REC=null;const HANDMETA={N:[],W:[],S:[],E:[]};
const SW_LEAN=[0,-2,-3,-3,1,3,3,1],SW_CROUCH=[0,0,0,0,2,4,4,1],SW_BOB=[0,-1,-2,-1,0,0,0,0];
// the axe stands taller and leans into the chop; the pickaxe rises higher and drops deeper into the strike, then rebounds
const SWK={axe:{lean:[0,-1,-3,-3,1,3,3,1],crouch:[0,0,0,0,1,2,2,1],bob:[0,-1,-1,-1,0,0,0,0]},pick:{lean:[0,-2,-3,-4,1,4,3,1],crouch:[0,0,-1,-1,2,5,3,1],bob:[0,-1,-2,-2,0,0,0,0]}};
function toolEntry(kind,dir,f){const fam=kind==='rod'?'rod':kind==='can'?'can':TP[kind]?kind:'swing';const e=TP[fam][dir==='W'?'E':dir][f];if(dir!=='W')return e.slice();return [-e[0],e[1],180-e[2],e[3],e[4]];}
function fistAt(x,y){const F=SPLIT?HANDR:SK;for(let j=0;j<2;j++)for(let k=-1;k<=1;k++)p(x+k,y+1+j,F[j===1?2:k===-1?4:3]);p(x,y+3,F[1]);}
// hands for a grip: one at the grip, one further up the handle; the can is held by one hand
function toolHands(kind,dir,f){const [gx,gy,ang,k]=toolEntry(kind,dir,f);const a=ang*Math.PI/180;
  return {g1:[gx,gy],g2:kind==='can'?null:[gx+Math.cos(a)*4*k,gy+Math.sin(a)*4*k]};}
// ---------------------------------------------------------------- one figure
// pose: crouch, bob, lean (side), sway (front), legs:{L,R} foot offsets, hands:[left/far, right/near] absolute offsets from the shoulders,
// nod, blink, reach (back view: hands hidden in front of the body), tool (callback)
let SIT=false;let ANCREC=null;let HANDS_OVER=false;let HAIRLEAN=0,HANGTAPER=3;const ANCH={},ANCT={};
function human(dir,pose){SIT=!!pose.sit;const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1,back=dir==='N';
  const crouch=pose.crouch||0,bob=pose.bob||0,lean=side?Math.round((pose.lean||0)*fl):0,breath=pose.breath||0;
  const cx=CX+(side?0:(pose.sway||0));const hip=HIP0+crouch+bob,top=TOP0+crouch+bob+breath,ux=cx+lean,hy=top-9-(ALL?1:0)+(STOOP?2:0);
  const shL=side?[ux-fl,top+1]:[ux-7-WIDE,top+1],shR=side?[ux+fl,top+1]:[ux+8+WIDE,top+1];
  const def=side?[[0,KID?8:10],[0,KID?8:10]]:[[0,KID?8:10],[0,KID?8:10]];const hands=pose.hands||def;
  HANDS_REC=[[shL[0]+hands[0][0],shL[1]+hands[0][1]],[shR[0]+hands[1][0],shR[1]+hands[1][1]]];   // where the hands are, for the game to put things in them
  const H={cx:ux,hy,top0:top};let hairInfo=null;
  ANCREC={cx:ux,hy:hy+(pose.nod?1:0)-((EXPR==='scared'||EXPR==='surprised')&&!pose.blink?1:0),top,fl:((pose.blink||EXPR==='wince')?1:0)|(back?2:0),side,fl0:fl};   /* per-frame anchors for the wardrobe: the head (eye top row as drawn, after a nod) and the torso */
  into('body',()=>{
    if(side){// far arm and leg first, then the body, then the near leg and arm
      const L=pose.legs||[[-1,0],[1,0]];const sideArm=(sh,hd,el,far,inn)=>{if(el){armTo(sh[0],sh[1],sh[0]+el[0]*fl,sh[1]+el[1],far,inn,true);armTo(sh[0]+el[0]*fl,sh[1]+el[1],sh[0]+hd[0]*(pose.elbows?fl:1),sh[1]+hd[1],far,inn,!!pose.noHands);}else armTo(sh[0],sh[1],sh[0]+hd[0]*(pose.noHands&&pose.hands?fl:1),sh[1]+hd[1],far,inn,!!pose.noHands);};sideArm(shL,hands[0],pose.elbows&&pose.elbows[0],true,fl>0?1:-1);   // standing side-on: the far leg a pixel back, so two legs read, not one peg
      legSide(cx+Math.round(lean/2),hip,L[0][0],L[0][1],fl,true,crouch);legSide(cx+Math.round(lean/2),hip,L[1][0],L[1][1],fl,false,crouch);
      skirtSide(ux,hip,fl);torsoSide(ux,top,hip,fl);if(SPLIT&&TOPDEF&&TOPDEF.side)TOPDEF.side(ux,top,hip,fl);headSide(ux+(STOOP?2*fl:0),hy,fl,pose);
      sideArm(shR,hands[1],pose.elbows&&pose.elbows[1],false,fl>0?-1:1);into('arms',()=>sideArm(shR,hands[1],pose.elbows&&pose.elbows[1],false,fl>0?-1:1));}
    else{const L=pose.legs||[0,0];
      if(back&&pose.reach){armTo(shL[0],shL[1],shL[0]+hands[0][0],shL[1]+hands[0][1],false,1);armTo(shR[0],shR[1],shR[0]+hands[1][0],shR[1]+hands[1][1],false,-1);}
      legsFront(cx,hip,L[0],L[1],back,pose.squat||0);skirtFront(ux,hip,back);torsoFront(ux,top,hip,back);if(SPLIT&&TOPDEF&&TOPDEF.front)TOPDEF.front(ux,top,hip,back);
      const up=hands[0][1]<-4||hands[1][1]<-4;
      const arms=(only)=>{for(const [i,sh] of [[0,shL],[1,shR]]){if(only!=null&&i!==only)continue;const h=[sh[0]+hands[i][0],sh[1]+hands[i][1]];
          if(pose.elbows){const el=[sh[0]+pose.elbows[i][0],sh[1]+pose.elbows[i][1]];armTo(sh[0],sh[1],el[0],el[1],false,i?-1:1,true);armTo(el[0],el[1],h[0],h[1],false,i?-1:1,!!pose.noHands);}
          else if(hands[i][1]<-4){const el=[sh[0]+(i?2:-2),sh[1]-5];armTo(sh[0],sh[1],el[0],el[1],false,i?-1:1,true);armTo(el[0],el[1],h[0],h[1],false,i?-1:1);}
          else armTo(sh[0],sh[1],h[0],h[1],false,i?-1:1,!!pose.noHands);}};
      if(pose.guard!=null){arms(1-pose.guard);headFront(ux,hy,back,pose);arms(pose.guard);}
      else{/* raised arms pass behind the head; where they stand clear of it (hands above the crown, forearms at the sides) they show over hair, hats and glasses (wardrobe renders) */
      if(up&&!(back&&pose.reach)){arms();if(CFG.hang&&!back){into('arms',()=>arms());into('headfp',()=>headFront(ux,hy,back,pose));for(let i=0;i<FW*FH;i++)if(LY.headfp.d[i*4+3])LY.arms.d[i*4+3]=0;
        /* winding up seen from behind, the hands come back over the crown: a pale knot over the hair */
        if(back&&HANDS_OVER)for(const i of [0,1]){const h=[shL,shR][i],hx=h[0]+hands[i][0],hyy=h[1]+hands[i][1];for(let j=0;j<3;j++)for(let k=-1;k<=1;k++)P(LY.arms,hx+k,hyy+1+j,[255,255,255]);}}}
      headFront(ux,hy,back,pose);
      if(!up&&!(back&&pose.reach))arms();}}
    if(SPLIT&&TOPDEF&&TOPDEF.post)TOPDEF.post(ux,top,hip,hy,side?(fl>0?'E':'W'):dir,fl);});
  into('beard',()=>beard(ux,hy+(pose.nod?1:0),side?(fl>0?'E':'W'):dir,fl,C.beard===true?'full':C.beard));
  HAIRLEAN=side?lean:0;HANGTAPER=CFG.hang?2:3;
  into('hair',()=>{const hy2=hy+(pose.hairLag||0);TIPY=hy2+(C.tipDy||6);hairInfo=side?hairSide(ux,hy2,fl,C.hairStyle||'short',pose):hairFront(ux,hy2,back,C.hairStyle||'short',pose);});
  const hairTop=hairInfo?hairInfo.top:null;
  const hyL=hy+(pose.hairLag||0);   // what sits on the hair moves with the hair
  into('acc',()=>acc(ux,['headband','bow','flower'].includes(C.accessory)?hyL:hy,side?(fl>0?'E':'W'):dir,fl,C.accessory,top,hairTop));
  into('glasses',()=>{if(C.glasses)glasses(ux,hy+(pose.nod?1:0),side?(fl>0?'E':'W'):dir,fl,C.glasses);});
  into('hat',()=>hat(ux,hyL,side?(fl>0?'E':'W'):dir,fl,C.hat,hairTop));
  // under a hat, the hair above the brim is hidden by the hat (it used to peek round the crown)
  if(C.hat){const L=LY.hair,by=hy-4+(pose.nod?1:0);for(let y=0;y<by;y++)for(let x=0;x<L.w;x++){const i=(y*L.w+x)*4;if(L.d[i+3]){const hl=LY.hat;if(!(hl.d[i+3])||y<by-1)L.d[i+3]=0;}}}
  into('toolf',()=>{if(pose.tool)pose.tool(ux,top);});
  /* the near arm (side on) and arms raised seen from behind are nearer than the head: they show over hair, beard, hats, glasses and accessories */
  if(CFG.hang)for(let i=0;i<FW*FH;i++){if(!LY.arms.d[i*4+3])continue;for(const k of ['hair','beard','hat','glasses','acc']){if(k==='hat'&&C.hat==='sackhood')continue;LY[k].d[i*4+3]=0;}if(LY.cut)LY.cut.d[i*4+3]=0;}}
// ---------------------------------------------------------------- poses per clip
// the walk: Stardew's four beats (contact, pass, contact, pass) spread over our eight frames
// the run (owner, Nov 10: "I miss the old one. The arm swing is good but the tilting and legs look weird"): the old run's
// lean, bounce and legs, with the new arm pump (each bent arm against its own-side leg, still bent on the passing frames)
function runPose(f,dir){const pose={};const side=dir==='E'||dir==='W',back=dir==='N',fl=dir==='W'?-1:1;
  const ph=(f-1)/8*Math.PI*2,c=Math.cos(ph);
  /* motion judge r3: a run is not a fast walk. Each leg follows its own table (foot offset forward, lift): contact in front,
     support under the hips, push off on the toe, AIRBORNE (both feet up), heel kicked up behind, tucked high through the
     pass, knee forward, reaching. The other leg is the same table half a cycle on. A stride longer than the walk's, a
     moderate lean (owner: the old run's 3 read better than 6), the body low on the support frames, never 1 px more between
     neighbours; the arm pump the owner liked stays */
  const K=KID?.75:1;const LT=[[6,0],[3,0],[0,0],[-4,2],[-5,4],[-2,5],[2,4],[5,2]].map(([o,l])=>[Math.round(o*K),Math.round(l*K)]);
  const i=(f-1+8)%8,A=LT[i],B=LT[(i+4)%8];
  pose.crouch=(i%4===1||i%4===2)?1:0;pose.bob=0;pose.hairLag=0;pose.lean=4;pose.nod=side?0:1;
  if(side){pose.legs=[A,B];
    const a=Math.round(c*(KID?4:5));const base=6,AA=1.5;const hand=(k,far)=>{const dx=Math.round(k*AA);if(dx===0)return [fl*(far?0:2),base-2];
      return dx>0?[Math.min(dx,4)*fl,base-3-Math.min(2,Math.round(dx*.4))]:[Math.round(dx*.9)*fl,base+1];};
    pose.hands=[hand(-a,true),hand(a,false)];}
  else{const sg=back?-1:1;const fy=([o,l])=>Math.max(-4,sg*Math.round(o*.6)-Math.round(l*.75));pose.legs=[fy(A),fy(B)];pose.sway=0;const ay=6;
    const hand=(fw,inward)=>fw>0?[Math.round(2*fw)*inward,ay-Math.round(3*fw)]:[Math.round(-1.5*fw)*-inward,ay+Math.round(sg*3*-fw)];
    pose.hands=[hand(-c,1),hand(c,-1)];}
  return pose;}
function walkPose(f,dir,run){const pose={};if(f===0)return pose;if(run)return runPose(f,dir);const side=dir==='E'||dir==='W',back=dir==='N',fl=dir==='W'?-1:1;
  const ph=(f-1)/8*Math.PI*2,c=Math.cos(ph),s=Math.sin(ph);const S=run?(KID?4:5):(KID?3:5);   /* motion judge r2: the planted foot travelled 1.5 px a frame against 6 px of ground; a longer stride and a faster cadence halve the skate */
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
    const ka=Math.round(c*(KID?2:3));pose.hands=[hand(-ka,true),hand(ka,false)];}   // far arm against the far leg (a), near arm against the near leg (b=-a); the arms keep their own swing when the stride grows
  else{const sg=back?-1:1;const st=run?4:2;const dL=Math.round(c*st),lift=run?3:2;
    // the planted foot drifts from forward (lower) to back; the swinging foot is lifted, highest on the passing frame
    const liftL=s<0?Math.round(-s*lift):0,liftR=s>0?Math.round(s*lift):0,kn=run&&KNEE[f]?2:0;pose.legs=[sg*dL-liftL-(s<0?kn:0),-sg*dL-liftR-(s>0?kn:0)];pose.sway=0;   /* run: the passing knee comes up higher (judge r8) */
    // seen from the front, the arm swinging forward drops and comes in over the hip; the one swinging back rises and tucks
    // (judge r3: 'the forward hand should drop about 2 px and move in, the back hand rise 1-2 px')
    const ay=run?6:10;const hand=(fw,inward)=>{if(run){/* judge r7: the arms pump clear of the body - fist up to the chest in front, driven back to the hip */return fw>0?[Math.round(2*fw)*inward,ay-Math.round(3*fw)]:[Math.round(-1.5*fw)*-inward,ay+Math.round(sg*3*-fw)];}
      const k=fw;return k>0?[Math.round(2*k)*inward,ay+Math.round(sg*4*k)]:[Math.round(.6*k)*inward,ay+Math.round(sg*3.4*k)];};   /* motion judge r2: 1-2 px could not be seen at 1x */
    pose.hands=[hand(-c,1),hand(c,-1)];}
  return pose;}
// planting and harvesting: bend, kneel, reach into the soil in front, press it in, rise, stand
function plantPose(f,dir){const pose={},side=dir==='E'||dir==='W',back=dir==='N',fl=dir==='W'?-1:1;if(f===0||f===5)return pose;const kneel=f===2||f===3;
  // kneeling to the square in front: a short step forward with the near foot, a lean from the hips (the feet stay put),
  // the hands reaching low and forward (judge r4: lean, never slide the whole body)
  if(side){if(kneel){pose.crouch=5;pose.lean=5;pose.legs=[[-4,0],[5,0]];const d=f===3?1:0;pose.hands=[[fl*(7+d),12+d],[fl*(9+d),12+d]];pose.nod=1;}
    else if(f===1){pose.crouch=3;pose.lean=3;pose.legs=[[-3,0],[3,0]];pose.hands=[[fl*5,10],[fl*7,10]];pose.nod=1;}
    else{pose.crouch=3;pose.lean=3;pose.legs=[[-2,0],[3,0]];pose.hands=[[fl*5,7],[fl*6,6]];}}   /* the rise (motion judge r2: kneel to upright in one frame, the foot snapping back): half up, the foot half back */
  else{if(kneel){pose.crouch=6;pose.squat=2;const d=f===3?1:0;pose.hands=back?[[4,8],[-3,8]]:[[5,14+d],[-4,14+d]];pose.reach=back;pose.nod=1;}
    else if(f===1){pose.crouch=3;pose.squat=1;pose.hands=back?[[4,7],[-3,7]]:[[5,11],[-4,11]];pose.reach=back;pose.nod=1;}
    else{pose.crouch=3;pose.squat=1;pose.hands=back?[[4,5],[-3,5]]:[[5,7],[-4,7]];pose.reach=back;}}
  return pose;}
// each person their own way of standing (judge, townsfolk: "everyone stands the same way"): elbow then hand, from the shoulder
function stance(pose,side,dir,fl){const ST=C.stance;if(!ST||KID||dir==='N')return;
  if(!side){if(ST==='hips'){pose.elbows=[[-3,5],[3,5]];pose.hands=[[2,9],[-1,9]];}
    else if(ST==='folded'){pose.elbows=[[-1,7],[1,7]];pose.hands=[[8,5],[-7,5]];}
    else if(ST==='pockets'){pose.hands=[[1,9],[0,9]];pose.noHands=true;}
    else if(ST==='behind'){pose.hands=[[2,8],[-1,8]];pose.noHands=true;}}
  else{if(ST==='hips'){pose.elbows=[[-2,5],[-2,5]];pose.hands=[[1,8],[1,8]];}
    else if(ST==='folded'){pose.elbows=[[0,6],[0,6]];pose.hands=[[3,5],[3,5]];}
    else if(ST==='pockets'){pose.hands=[[0,9],[0,9]];pose.noHands=true;}
    else if(ST==='behind'){pose.hands=[[-2,8],[-2,8]];pose.noHands=true;}}}
// ---------------------------------------------------------------- render
if(CFG.portraits){console.log('portraits are drawn by portrait3.js now');}
function outlinePass(){const comp=flatten(PARTS.map(k=>LY[k]),FW,FH);
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){if(G(comp,x,y))continue;let n=null,ow=null;
    for(const [ddx,ddy] of [[0,1],[0,-1],[1,0],[-1,0]]){const c=G(comp,x+ddx,y+ddy);if(c&&c[3]>200){n=c;for(let i=PARTS.length-1;i>=0;i--)if(G(LY[PARTS[i]],x+ddx,y+ddy)){ow=PARTS[i];break;}break;}}
    if(n)P(LY[ow],x,y,outlineRGB(n));}}
if(SPLIT&&CFG.wear)setWear(CFG.wear[0],CFG.wear[1]);
ROWS.forEach(([clip,dir,nf],r)=>{for(let f=0;f<nf;f++){
  LY={};for(const k of PARTS)LY[k]=layer(k,FW,FH);LY.cut=layer('cut',FW,FH);LY.arms=layer('arms',FW,FH);LY.headfp=layer('headfp',FW,FH);CUR='body';
  const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1;let pose={};
  if(clip==='walk')pose=walkPose(f,dir,false);
  if(clip==='run')pose=walkPose(f===0?1:f,dir,true);
  /* idle (motion judge: the breath was the whole body dropping a pixel, legs too, so it read as a nod): the chest, shoulders,
     arms and head settle a pixel on the out-breath while the hips, legs and boots stay locked */
  if(clip==='idle'){pose.breath=[0,1,1,0][f];pose.hairLag=0;pose.blink=f===3;stance(pose,side,dir,fl);}
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
  /* motion judge r3: frame 3 is now an in-between (head part way down, the flung arm half way to the face) so the cower doesn't
     pop; the guarding forearm comes up from an elbow out at the side so it never crosses a neckline (Nell r3: BLOCKING); the
     last frame wears the idle face */
  if(clip==='hurt'){pose.bob=[-2,-3,-1,0,0,0][f];pose.crouch=[0,0,1,3,1,0][f];pose.nod=f>=3&&f<=4?1:0;pose.expr=f<2||f===4?'scared':f<4?'wince':null;
    /* motion judge r2: the fling read as a shrug ("ta-da") because both arms went up alike. Now one arm flies up and out, the
       other folds to guard the chin (hands 6+ px apart in height); the cower shivers a pixel so frames 3 and 4 differ; the last
       frame lands exactly on the idle (crouch 0, the person's own stance) so nothing pops when the idle resumes */
    if(f===0){pose.elbows=[[-3,-5],[3,4]];pose.hands=[[-5,-10],[-4,-5]];pose.guard=1;}
    else if(f===1){pose.elbows=[[-4,-6],[3,4]];pose.hands=[[-6,-12],[-4,-6]];pose.guard=1;}
    else if(f===2){pose.elbows=[[-2,-2],[3,4]];pose.hands=[[-1,-7],[-4,-6]];pose.guard=1;}
    else if(f===3){pose.hands=[[1,-5],[-1,-4]];}
    else if(f===4){pose.hands=[[0,3],[0,4]];}
    else{pose.hands=null;stance(pose,side,dir,fl);}
    /* motion judge r3 (Hob): on broad shoulders both fists at the chin sit level beside the beard and read as a shrug; there
       the screen-right arm drops out to the hip while the other fist guards the cheek. (After the chain: put inside it, its
       else swallowed the impact frames and they fell back to the idle stance.) */
    if(WIDE&&(f===2||f===3)){pose.elbows=null;pose.guard=null;pose.hands=[f===2?[-1,-7]:[1,-5],[2,7]];}}
  /* spellcast frame 0 is the CARRY pose (motion judge r2, the sprinkler: it must start in his hand, not hang at his hip and
     slide): side-on both hands forward at chest height on the post; facing down the right forearm up from an elbow at his
     side; facing away the left hand out past his body. Its hand points go to the game as hands[dir][6] */
  if(clip==='spellcast'&&f===0){if(side)pose.hands=[[fl*6,3],[fl*7,2]];else if(dir==='S'){pose.elbows=[[0,5],[1,6]];pose.hands=[[0,10],[-1,2]];}
    else{pose.elbows=[[-2,6],[0,5]];pose.hands=[[-2,3],[0,10]];}}
  else if(clip==='spellcast'){const up=f>1;pose.hands=up?(side?[[fl*-1,-10],[fl*2,-11]]:[[1,-11],[-1,-11]]):null;}
  /* sit (motion judge: facing us it read as a standing person made shorter; one low frame in three read as a twitch): facing
     us the lap is drawn, two knees and the shins below them, hands resting on the thighs; the breath holds two frames and
     moves only the chest, shoulders and head (hands stay on the lap) */
  if(clip==='sit'){pose.sit=true;const br=[0,1,1,0][f];pose.breath=br;pose.crouch=side?2:1;
    pose.hands=side?[[fl*5,9-br],[fl*6,9-br]]:[[4+WIDE,11-br],[-4-WIDE,11-br]];pose.blink=f===3;}   /* the last frame is the blink; the game shows it one loop in three */   /* hands resting on the thigh / the knees; a breath */
  let BASEL=null;
  if(SPLIT&&CFG.wear&&CFG.wear[0]!=='base'){setWear('base');const E1=EXPR;if(pose.expr)EXPR=pose.expr;human(dir,pose);EXPR=E1;outlinePass();BASEL=new Uint8ClampedArray(LY.body.d);
    LY={};for(const k of PARTS)LY[k]=layer(k,FW,FH);LY.cut=layer('cut',FW,FH);LY.arms=layer('arms',FW,FH);LY.headfp=layer('headfp',FW,FH);CUR='body';setWear(CFG.wear[0],CFG.wear[1]);}
  HANDS_OVER=false;   /* the hands sit inside the head's outline in these poses: showing them over the hair revealed the skull, so they stay behind it */
  const EX0=EXPR;if(pose.expr)EXPR=pose.expr;human(dir,pose);EXPR=EX0;
  if(!(ANCREC.fl&3)){const ex=ANCREC.side&&ANCREC.fl0>0?ANCREC.cx+4:ANCREC.cx-4,ec=G(LY.body,ex,ANCREC.hy);if(!ec||ec[0]!==LASH[0]||ec[1]!==LASH[1]||ec[2]!==LASH[2])ANCREC.fl|=4;}   /* bit 2: an arm is in front of the eyes */
  ((ANCH[clip]=ANCH[clip]||{})[dir]=ANCH[clip][dir]||[])[f]=[ANCREC.cx,ANCREC.hy,ANCREC.fl];((ANCT[clip]=ANCT[clip]||{})[dir]=ANCT[clip][dir]||[])[f]=[ANCREC.cx,ANCREC.top];
  if(clip==='slash'&&HANDS_REC)HANDMETA[dir][f]=HANDS_REC.map(h=>h.map(Math.round));
  if(clip==='spellcast'&&f===0&&HANDS_REC)HANDMETA[dir][6]=HANDS_REC.map(h=>h.map(Math.round));   // the carry pose
  // outline the whole figure; each outline pixel goes to the part whose pixel it borders
  outlinePass();
  if(BASEL){const d=LY.body.d;for(let i=0;i<d.length;i+=4)if(d[i]===BASEL[i]&&d[i+1]===BASEL[i+1]&&d[i+2]===BASEL[i+2]&&d[i+3]===BASEL[i+3])d[i+3]=0;}
  const src=PART==='all'?flatten(PARTS.map(k=>LY[k]),FW,FH):LY[PART];
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){const c=G(src,x,y);if(c)P(SHEET,f*FW+x,r*FH+y,c,c[3]);else if(PART==='hat'&&G(LY.cut,x,y))P(SHEET,f*FW+x,r*FH+y,[255,0,255],255);}}});
emit([SHEET],CFG.out);
const clips={};let rr=0;for(const [n,ds,nf] of CLIPS){clips[n]={};for(const d of ds)clips[n][d]=[rr++,nf];}
console.log('META '+JSON.stringify(Object.assign({fw:FW,fh:FH,ax:FW/2,ay:FH-4,clips},TOOL?{tool:TOOLMETA,toolKind:TOOL}:{hands:HANDMETA})));
if(CFG.anchors)console.log('ANCH '+JSON.stringify({head:ANCH,anc:ANCT}));
