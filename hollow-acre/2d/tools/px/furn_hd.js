// ---- the cabin furniture, hand-drawn in three-quarter view, every turn drawn by hand (owner: "better detail, not blender, still
// multiple angles"). CFG.view: 'S' front, 'E' turned so the front faces right (the left view is this one mirrored), 'N' the back.
// Light from the upper left. Same kit as the workbenches: lit top lips, lit left edges, dark right edges, an LPC cast shadow.
SEED=CFG.seed||7;
const W=CFG.w,H=CFG.h,K=CFG.kind,V=CFG.view||'S',NIGHT=!!CFG.night;
const A=layer('art',W,H),B=layer('details',W,H),SHD=layer('shadow',W,H);
const hexR=a=>a.map(HEX);
const RAMP={
  oak:hexR(['#1e140f','#352418','#4f3724','#694b32','#836142','#9c7a57']),
  walnut:hexR(['#140c0a','#24160f','#382316','#4e3220','#66442d','#7e583c']),
  pine:hexR(['#2a1a0e','#46301a','#664827','#836137','#a07b4b','#b99764']),
  iron:hexR(['#15161c','#25272f','#383b46','#50545f','#6f7480','#959aa5']),
  steel:hexR(['#2a3442','#45546a','#677a92','#93a6bc','#c4d2e0','#eef4fa']),
  brass:hexR(['#3a2810','#5e4318','#866024','#a87e34','#c89c4c','#e0bc70']),
  cream:hexR(['#5a4d3b','#8a7a5e','#b8a682','#d6c8a2','#e8dcbc','#f4ecd4']),
  red:hexR(['#2a1012','#46191a','#662422','#82332b','#9c4636','#b45c46']),
  green:hexR(['#141f17','#213325','#2f4834','#405e43','#577653','#728e64']),
  blue:hexR(['#161b26','#222a3b','#313c52','#43506a','#5a6883','#76849c']),
  ochre:hexR(['#2a200e','#463616','#665020','#836a2c','#a0843c','#b89c52']),
  plum:hexR(['#1e1216','#311c22','#462a30','#5c3a3e','#744c4e','#8a6060']),
  stone:hexR(['#211f24','#36333a','#4f4b54','#6c6770','#8c868e','#aea8ae']),
  glass:hexR(['#121a20','#1c2a32','#2a3e48','#3c5862','#567a82','#7ea0a4']),
  ivory:hexR(['#4a443a','#6e6656','#948a74','#b8ae94','#d4ccb2','#ece6d2']),
  lit:hexR(['#5a2c0e','#9a5320','#d3863a','#f0b65c','#fbdc8f','#fff4c6']),
};
const SHC=[0x32,0x21,0x25];const SH=(x,y,a)=>P(SHD,x,y,SHC,a);
function cast(x0,x1,base){for(let x=x0+1;x<=x1+4;x++){SH(x,base+1,150);SH(x+1,base+2,105);}for(let x=x0+3;x<=x1+5;x++)SH(x,base+3,55);}
function under(x0,x1,y0,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(G(A,x,y))continue;SH(x,y,Math.round(80+(y-y0)*5));}}
function contact(x,y,w,k){for(let i=0;i<w;i++){const c=G(A,x+i,y);if(c)P(A,x+i,y,shade(c,k||.72));}}
function ln(L,x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;for(let i=0;i<=n;i++)P(L,Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),c);}
// a board face: planks along x or y, staggered seams, long grain streaks a step darker (no specks)
function boards(x0,y0,w,h,R,dir,pw,base){pw=pw||5;base=base===undefined?3:base;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=dir==='y'?x:y,v=dir==='y'?y:x;const row=Math.floor(u/pw),off=(hsh(row,7,SEED)*30)|0;
  let k=base;if(u%pw===0)k=base-2;else if(u%pw===1)k=base+1>5?5:base+1;else{const s0=(hsh(row,3,SEED)*20)|0,sl=6+((hsh(row,4,SEED)*12)|0);if(u%pw===((hsh(row,5,SEED)*(pw-2))|0)+2&&((v+off)%30)>=s0&&((v+off)%30)<s0+sl)k=base-1;}
  if(((v+off)%30===0)&&u%pw!==0)k=base-2;P(A,x0+x,y0+y,R[Math.max(0,Math.min(5,k))]);}}
// a box seen in 3/4: a top face (dT rows, lit front lip), a front face (hF rows), lit left edge, dark right edge
function box3(x,y,w,dT,hF,R,o){o=o||{};if(dT>0){boards(x,y,w,dT,R,o.topDir||'x',o.topPw||4,4);hl(A,x,y,w,R[2]);hl(A,x,y+dT-1,w,R[5]);}
  const fy=y+dT;if(o.face!==false)boards(x,fy,w,hF,R,o.faceDir||'y',o.facePw||6,o.faceK||2);
  vl(A,x,fy,hF,R[4]);vl(A,x+w-1,fy,hF,R[0]);hl(A,x,fy+hF-1,w,R[0]);hl(A,x,fy,w,R[1]);return {x,y,w,fy,by:fy+hF};}
// a raised panel set into a face
function panel(x,y,w,h,R){rect(A,x,y,w,h,R[2]);hl(A,x,y,w,R[1]);vl(A,x,y,h,R[1]);hl(A,x,y+h-1,w,R[4]);vl(A,x+w-1,y,h,R[3]);rect(A,x+2,y+2,w-4,h-4,R[3]);hl(A,x+2,y+2,w-4,R[4]);vl(A,x+w-3,y+2,h-4,R[2]);}
function knob(x,y){P(A,x,y,RAMP.brass[5]);P(A,x+1,y,RAMP.brass[3]);P(A,x,y+1,RAMP.brass[2]);P(A,x+1,y+1,RAMP.brass[1]);}
function leg(x,y,h,R,turned){for(let j=0;j<h;j++){const bulge=turned&&(j===((h*.3)|0)||j===((h*.7)|0));const w=bulge?4:3,xo=bulge?x-1:x;rect(A,xo,y+j,w,1,R[2]);P(A,xo,y+j,R[4]);P(A,xo+w-1,y+j,R[0]);}hl(A,x,y+h-1,3,R[1]);}
// a book standing on a shelf: lit left column, dark right column, page edge on top, a gilt band on some
function book(x,y,w,h,R,band){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=i===0?4:i===w-1?1:3;if(j===0)k=5;P(A,x+i,y+j,R[k]);}
  if(band){hl(A,x,y+2,w,RAMP.brass[4]);hl(A,x,y+h-3,w,RAMP.brass[3]);}if(w>2)P(A,x+1,y+(h>>1),R[5]);}
function bookLean(x,y,h,R){for(let j=0;j<h;j++){const xx=x+Math.round(j*.35);P(A,xx,y+h-1-j,R[4]);P(A,xx+1,y+h-1-j,R[3]);P(A,xx+2,y+h-1-j,R[1]);}}
function bookFlat(x,y,w,R){hl(A,x,y,w,R[5]);hl(A,x,y+1,w,R[3]);hl(A,x,y+2,w,R[1]);P(A,x+w-1,y+1,RAMP.cream[4]);}
const BOOKR=[RAMP.red,RAMP.green,RAMP.blue,RAMP.ochre,RAMP.plum,RAMP.oak,RAMP.cream];
// =================================================================================== the bookcase
if(K==='bookcase'){const R=RAMP.walnut,x0=2,w=W-4,base=H-3,topY=4;
  if(V==='S'){
    rect(A,x0+2,topY+4,w-4,base-topY-8,R[1]);for(let x=x0+6;x<x0+w-4;x+=8)vl(A,x,topY+4,base-topY-8,R[0]);     // the dark back boards
    for(const px of [x0,x0+w-3]){rect(A,px,topY+2,3,base-topY-1,R[3]);vl(A,px,topY+2,base-topY-1,R[5]);vl(A,px+2,topY+2,base-topY-1,R[1]);}
    box3(x0-1,topY-1,w+2,3,3,RAMP.oak,{});                                                                        // the top cap, overhanging
    const shelves=[topY+21,topY+40,topY+59];let rng=SEED;const rr=()=>{rng=(rng*1103515245+12345)&0x7fffffff;return rng/0x7fffffff;};
    for(const sy of shelves){hl(A,x0+3,sy,w-6,RAMP.oak[5]);hl(A,x0+3,sy+1,w-6,RAMP.oak[3]);hl(A,x0+3,sy+2,w-6,RAMP.oak[1]);hl(A,x0+3,sy+3,w-6,R[0]);}
    // books on each shelf: varied heights and colours, gaps, one leaning, a flat stack, small things
    const rows=[topY+4,shelves[0]+4,shelves[1]+4];const bottoms=[shelves[0],shelves[1],shelves[2]];
    rows.forEach((ry,ri)=>{let x=x0+4;const by=bottoms[ri];let leaned=false;
      while(x<x0+w-5){const r=rr();
        if(r<.08){x+=3;continue;}
        if(r<.16&&!leaned&&x<x0+w-10){bookLean(x,by-12,12,BOOKR[(rr()*5)|0]);x+=6;leaned=true;continue;}
        if(r<.22&&x<x0+w-11){for(let k=0;k<3;k++)bookFlat(x,by-3-k*3,8-k,BOOKR[(rr()*6)|0]);x+=9;continue;}
        const bw=2+((rr()*3)|0),bh=9+((rr()*5)|0);if(x+bw>x0+w-4)break;book(x,by-bh,bw,bh,BOOKR[(rr()*BOOKR.length)|0],rr()<.35);x+=bw;}});
    // a candle stub and a small skull on the top shelf's corner, a jar on the middle shelf
    {const sx=x0+w-12,sy=shelves[0]-6;for(let y=0;y<5;y++)for(let x=0;x<5;x++){if((x-2)*(x-2)*1.2+(y-2)*(y-2)>6)continue;P(A,sx+x,sy+y,RAMP.ivory[x<2&&y<2?5:x>3?2:4]);}
      P(A,sx+1,sy+2,RAMP.walnut[0]);P(A,sx+3,sy+2,RAMP.walnut[0]);hl(A,sx+1,sy+5,3,RAMP.ivory[3]);}
    // the plinth
    box3(x0,base-4,w,0,5,R,{face:true,facePw:6,faceK:2});hl(A,x0,base-4,w,R[4]);
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const sw=W-6,sx=3;   // the side: a framed end panel, the cap and plinth stepping out, book spines along the open edge
    box3(sx-1,topY-1,sw+2,4,3,RAMP.oak,{topDir:'y'});
    rect(A,sx,topY+6,sw-3,base-topY-10,R[2]);for(let y=topY+6;y<base-4;y++){P(A,sx,y,R[4]);P(A,sx+1,y,R[3]);P(A,sx+sw-4,y,R[1]);}
    panel(sx+3,topY+9,sw-9,30,R);panel(sx+3,topY+43,sw-9,30,R);
    for(const sy of [topY+21,topY+40,topY+59]){P(A,sx+sw-3,sy,RAMP.oak[5]);P(A,sx+sw-2,sy,RAMP.oak[4]);P(A,sx+sw-3,sy+1,RAMP.oak[2]);}   // shelf ends
    const ys=[[topY+8,topY+21],[topY+25,topY+40],[topY+44,topY+59]];ys.forEach(([a,b],i)=>{for(let y=a;y<b;y++){const R2=BOOKR[(i*3+(y>>2))%5];P(A,sx+sw-3,y,R2[3]);P(A,sx+sw-2,y,R2[1]);}});
    box3(sx,base-4,sw-2,0,5,R,{facePw:6});under(sx,sx+sw,base,base);cast(sx,sx+sw,base);}
  if(V==='N'){   // the back: rough vertical boards, two battens, the cap and the plinth
    box3(x0-1,topY-1,w+2,3,3,RAMP.oak,{});for(let y=topY+5;y<base-4;y++)for(let x=x0;x<x0+w;x++){const u=(x-x0)%8;P(A,x,y,R[u===0?0:u===1?4:u===7?1:2]);}
    for(const by of [topY+14,base-18]){hl(A,x0+1,by,w-2,R[4]);hl(A,x0+1,by+1,w-2,R[3]);hl(A,x0+1,by+2,w-2,R[1]);for(let x=x0+4;x<x0+w-3;x+=9)P(A,x,by+1,RAMP.iron[4]);}
    vl(A,x0,topY+5,base-topY-9,R[4]);vl(A,x0+w-1,topY+5,base-topY-9,R[0]);box3(x0,base-4,w,0,5,R,{});under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// =================================================================================== the writing desk
if(K==='desk'){const R=RAMP.walnut,base=H-3;
  const lamp=(x,y)=>{rect(A,x-2,y+6,5,2,RAMP.brass[3]);hl(A,x-2,y+6,5,RAMP.brass[5]);rect(A,x-1,y+4,3,2,RAMP.brass[2]);
    for(let j=0;j<5;j++){const w=j<1||j>3?1:2;for(let i=-w;i<=w;i++)P(A,x+i,y-1+j,NIGHT?RAMP.lit[i===0?5:4]:RAMP.glass[i<0?5:3],NIGHT?255:170);}hl(A,x-1,y-2,3,RAMP.brass[4]);
    if(NIGHT)for(let i=-6;i<=6;i++)for(let j=-3;j<=3;j++){if(i*i/36+j*j/9>1)continue;P(B,x+i,y+8+j,RAMP.lit[4],60);}};
  if(V==='S'){const x0=3,w=W-6,top=base-30;
    box3(x0,top-6,w,0,6,R,{facePw:3,faceK:3});hl(A,x0,top-6,w,R[5]);                                                 // the low gallery at the back
    for(let i=0;i<3;i++){const cx=x0+8+i*7;rect(A,cx,top-5,5,4,R[1]);hl(A,cx,top-5,5,R[0]);}                          // its pigeonholes
    box3(x0-1,top,w+2,8,4,R,{topPw:3});                                                                               // the writing top and its edge
    // the drawer pedestal on the right, the knee hole, the left leg
    box3(x0+w-20,top+12,20,0,base-top-13,R,{facePw:7});
    for(let k=0;k<2;k++){const dy=top+14+k*7;rect(A,x0+w-18,dy,16,6,R[2]);hl(A,x0+w-18,dy,16,R[1]);hl(A,x0+w-18,dy+5,16,R[4]);knob(x0+w-11,dy+2);}
    rect(A,x0+2,top+12,w-22,base-top-16,R[0]);for(let y=top+12;y<base-4;y++)SH(x0+3,y,60);                            // the dark knee hole
    leg(x0+1,top+12,base-top-12,R,false);hl(A,x0+1,base-1,4,R[1]);
    // things on the top: a letter with lines of writing, an inkwell with a quill, a lamp at the back left
    rect(A,x0+12,top+2,11,6,RAMP.cream[4]);hl(A,x0+12,top+2,11,RAMP.cream[5]);for(let j=0;j<3;j++)hl(A,x0+13,top+3+j*1.5|0,8-(j%2)*2,RAMP.cream[1]);contact(x0+13,top+8,11);
    rect(A,x0+27,top+3,3,3,RAMP.walnut[0]);hl(A,x0+27,top+3,3,RAMP.glass[3]);ln(A,x0+29,top+2,x0+33,top-4,RAMP.ivory[5]);ln(A,x0+30,top+2,x0+34,top-3,RAMP.ivory[3]);
    lamp(x0+6,top-10);
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const x0=8,w=W-16,top=base-30;   // the end: the top runs away from you, the gallery stepping up at the back, the pedestal's side
    box3(x0-1,top-9,7,3,7,R,{topDir:'y'});box3(x0-1,top,w+2,14,4,R,{topDir:'y',topPw:4});
    box3(x0+1,top+18,w-2,0,base-top-19,R,{facePw:6});panel(x0+4,top+21,w-10,base-top-26,R);
    for(let k=0;k<2;k++){const dy=top+19+k*7;vl(A,x0+w-2,dy,6,R[4]);vl(A,x0+w-1,dy,6,R[1]);P(A,x0+w-1,dy+2,RAMP.brass[4]);}   // the drawer fronts, edge-on
    rect(A,x0+w-10,top+3,8,5,RAMP.cream[4]);hl(A,x0+w-10,top+3,8,RAMP.cream[5]);contact(x0+w-10,top+8,8);
    rect(A,x0+4,top+8,3,3,RAMP.walnut[0]);ln(A,x0+6,top+7,x0+9,top+1,RAMP.ivory[5]);lamp(x0+5,top-4);
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='N'){const x0=3,w=W-6,top=base-30;   // the back: a plain modesty panel with two battens, the gallery's back above
    box3(x0-1,top,w+2,8,4,R,{topPw:3});lamp(x0+w-8,top-6);box3(x0,top-6,w,0,6,R,{facePw:3,faceK:2});
    box3(x0,top+12,w,0,base-top-13,R,{facePw:7,faceK:2});for(const by of [top+16,base-7]){hl(A,x0+1,by,w-2,R[3]);hl(A,x0+1,by+1,w-2,R[1]);}
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// a plate seen from above: rim lit top-left, a darker well, a shadowed lower rim
function dish(cx,cy){hl(A,cx-2,cy-2,5,RAMP.ivory[5]);hl(A,cx-4,cy-1,9,RAMP.ivory[4]);P(A,cx-4,cy-1,RAMP.ivory[5]);hl(A,cx-4,cy,9,RAMP.ivory[4]);hl(A,cx-2,cy-1,5,RAMP.ivory[3]);hl(A,cx-2,cy,5,RAMP.ivory[3]);
  hl(A,cx-3,cy+1,7,RAMP.ivory[2]);hl(A,cx-1,cy+2,3,RAMP.ivory[1]);P(A,cx+4,cy,RAMP.ivory[2]);}
// =================================================================================== the dining table
if(K==='table'){const R=RAMP.oak,base=H-3;
  const things=(x0,top,w,d)=>{const plate=dish;
    plate(x0+9,top+d-4);plate(x0+w-10,top+d-4);
    rect(A,(x0+w/2|0)-2,top+1,4,2,RAMP.brass[3]);rect(A,(x0+w/2|0)-1,top-6,2,7,RAMP.ivory[4]);P(A,(x0+w/2|0)-1,top-6,RAMP.ivory[5]);   // a candle in a brass stick
    P(A,(x0+w/2|0)-1,top-8,RAMP.lit[NIGHT?5:3]);P(A,(x0+w/2|0)-1,top-7,RAMP.lit[NIGHT?4:2]);
    for(let i=0;i<9;i++){const y=top+3+((i===0||i===8)?1:0);P(A,x0+w-21+i,y,RAMP.pine[i<3?5:4]);P(A,x0+w-21+i,y+1,RAMP.pine[2]);}contact(x0+w-21,top+5,9);   // a loaf
    for(let i=0;i<5;i++){P(A,x0+5+i,top+3,RAMP.red[i<2?5:3]);}ell(A,x0+7,top+4,2,1,RAMP.red[2]);};    // apples in a little heap
  if(V==='S'||V==='N'){const x0=2,w=W-4,d=13,top=base-25;
    for(const lx of [x0+5,x0+w-8])leg(lx,top+4,base-top-4,RAMP.oak.map((c,i)=>RAMP.oak[Math.max(0,i-1)]),false);
    box3(x0,top,w,d,4,R,{topPw:5});for(let y=top+1;y<top+d-1;y++)for(let x=x0+1;x<x0+w-1;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.12));}
    for(const lx of [x0+2,x0+w-5])leg(lx,top+d+4,base-top-d-4,R,false);
    if(V==='S')things(x0,top,w,d);else{dish(x0+10,top+4);dish(x0+w-11,top+4);rect(A,(x0+w/2|0)-2,top+5,4,2,RAMP.brass[3]);rect(A,(x0+w/2|0)-1,top-2,2,7,RAMP.ivory[4]);P(A,(x0+w/2|0)-1,top-4,RAMP.lit[NIGHT?5:3]);}
    under(x0,x0+w,top+d+4,base);cast(x0,x0+w,base);}
  if(V==='E'){const w=26,x0=(W-w)>>1,d=26,top=base-37;   // turned: the long top runs away from you, the short end toward you
    for(const lx of [x0+3,x0+w-6])leg(lx,top+4,base-top-4,RAMP.oak.map((c,i)=>RAMP.oak[Math.max(0,i-1)]),false);
    box3(x0,top,w,d,4,R,{topDir:'y',topPw:5});for(let y=top+1;y<top+d-1;y++)for(let x=x0+1;x<x0+w-1;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.12));}
    for(const lx of [x0+1,x0+w-4])leg(lx,top+d+4,base-top-d-4,R,false);
    dish(x0+8,top+20);dish(x0+18,top+6);
    rect(A,x0+12,top+13,3,2,RAMP.brass[3]);rect(A,x0+12,top+6,2,7,RAMP.ivory[4]);P(A,x0+12,top+5,RAMP.lit[NIGHT?5:3]);P(A,x0+12,top+4,RAMP.lit[NIGHT?4:2]);   // the candle upright at the centre
    under(x0,x0+w,top+d+4,base);cast(x0,x0+w,base);}}
// =================================================================================== the grandfather clock
if(K==='clock'){const R=RAMP.walnut,base=H-3,cx=W>>1;
  const hood=(x0,w,glass)=>{box3(x0-1,3,w+2,3,2,RAMP.oak,{});for(let i=-2;i<=2;i++)P(A,cx+i,2-(2-Math.abs(i)>>1),RAMP.oak[4]);P(A,cx,0,RAMP.brass[5]);P(A,cx,1,RAMP.brass[3]);
    box3(x0,8,w,0,16,R,{facePw:4});if(glass){ell(A,cx,16,5,5,RAMP.brass[2]);ell(A,cx,16,4,4,RAMP.ivory[4]);ell(A,cx-1,15,2,2,RAMP.ivory[5]);
      for(const [dx,dy] of [[0,-3],[3,0],[0,3],[-3,0]])P(A,cx+dx,16+dy,RAMP.walnut[1]);ln(A,cx,16,cx,13,RAMP.walnut[0]);ln(A,cx,16,cx+2,17,RAMP.walnut[0]);}};
  if(V==='S'){const x0=cx-7,w=14;hood(x0,w,true);
    box3(x0+2,24,w-4,0,26,R,{facePw:5});rect(A,x0+4,27,w-8,16,RAMP.glass[1]);vl(A,x0+4,27,16,RAMP.glass[3]);hl(A,x0+4,27,w-8,RAMP.glass[2]);   // the trunk's glass door
    ln(A,cx,28,cx,38,RAMP.brass[3]);ell(A,cx,39,2,2,RAMP.brass[4]);P(A,cx-1,38,RAMP.brass[5]);                                         // the pendulum
    box3(x0,50,w,2,base-52,R,{facePw:4});hl(A,x0,50,w,RAMP.oak[5]);under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const x0=cx-5,w=10;hood(x0,w,false);rect(A,x0+2,11,5,9,RAMP.glass[1]);for(let y=12;y<19;y++){P(A,x0+5,y,RAMP.ivory[y<15?5:4]);P(A,x0+6,y,RAMP.brass[3]);}P(A,x0+2,11,RAMP.glass[4]);   // the side light, the dial's rim behind it
    box3(x0+1,24,w-2,0,26,R,{facePw:4});panel(x0+2,27,w-4,20,R);box3(x0,50,w,2,base-52,R,{facePw:4});under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='N'){const x0=cx-7,w=14;hood(x0,w,false);box3(x0+2,24,w-4,0,26,R,{facePw:4,faceK:2});box3(x0,50,w,2,base-52,R,{facePw:4,faceK:2});
    for(const by of [30,44])hl(A,x0+3,by,w-6,R[3]);under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// =================================================================================== the cider keg on its stand
if(K==='keg'){const R=RAMP.oak,base=H-3;
  const stand=(x0,w)=>{for(const lx of [x0,x0+w-3]){rect(A,lx,base-9,3,9,R[2]);vl(A,lx,base-9,9,R[4]);vl(A,lx+2,base-9,9,R[0]);}hl(A,x0,base-9,w,R[3]);hl(A,x0,base-8,w,R[1]);};
  const head=(cx,cy,r,tap)=>{const cuts=[];for(let y=-r+3,i=0;y<r;y+=[3,2,4,3,2][i%5],i++)cuts.push(y);
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=(x*x+y*y)/(r*r);if(d>1)continue;let k;
      if(d>.74)k=d>.9?0:1;else{const bi=cuts.filter(c=>c<=y).length;k=cuts.includes(y)?1:(bi%3===0?3:bi%3===1?4:3);if(d>.5&&x<0&&y<0)k=Math.min(5,k+1);}
      P(A,cx+x,cy+y,(d>.74?RAMP.iron:RAMP.pine)[k]);}
    P(A,cx+3,cy-2,RAMP.walnut[1]);P(A,cx+4,cy-2,RAMP.walnut[0]);                                                                     // the bung
    for(let a=0;a<6.3;a+=.15){const X=Math.round(cx+Math.cos(a)*(r-1)),Y=Math.round(cy+Math.sin(a)*(r-1));if(a>3.4&&a<5.0)P(A,X,Y,RAMP.iron[3]);}
    if(tap){rect(A,cx-1,cy+r-4,3,2,RAMP.brass[3]);hl(A,cx-1,cy+r-4,3,RAMP.brass[5]);vl(A,cx,cy+r-2,3,RAMP.brass[2]);P(A,cx,cy+r+1,RAMP.brass[4]);}};
  if(V==='S'||V==='N'){const cx=W>>1,cy=base-16,r=11;stand(cx-11,22);head(cx,cy,r,V==='S');
    if(V==='S'){rect(A,cx-4,base-5,8,4,RAMP.pine[2]);hl(A,cx-4,base-5,8,RAMP.pine[4]);for(let i=-3;i<=3;i++)P(B,cx+i,base-5,RAMP.ochre[4],140);}   // a cup catching the drip
    under(cx-11,cx+11,base,base);cast(cx-11,cx+11,base);}
  if(V==='E'){const x0=3,w=W-6,cy=base-15,rr=10;stand(x0+2,w-4);
    for(let x=0;x<w;x++){const t=x/(w-1),r=Math.round(rr+1.4*Math.sin(t*Math.PI));for(let y=-r;y<=r;y++){const l=-y/r;let k=l>.55?5:l>.15?4:l>-.35?3:2;if(x%5===0)k=Math.max(1,k-1);P(A,x0+x,cy+y,R[k]);}}   // the bellied staves
    for(const hx of [x0+2,x0+8,x0+w-9,x0+w-3]){const t=(hx-x0)/(w-1),r=Math.round(rr+1.4*Math.sin(t*Math.PI));for(let y=-r;y<=r;y++)P(A,hx,cy+y,RAMP.iron[y<-r/2?3:1]);}   // iron hoops
    rect(A,x0+w-1,cy+4,3,2,RAMP.brass[3]);vl(A,x0+w+1,cy+6,2,RAMP.brass[2]);rect(A,x0+(w>>1)-1,cy-rr-1,3,1,RAMP.walnut[1]);                          // the tap, the bung
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// =================================================================================== the cradle
if(K==='cradle'){const R=RAMP.oak,base=H-3;
  const rocker=(x0,x1,y)=>{const Q=RAMP.pine;for(let x=x0-3;x<=x1+3;x++){const u=(x-(x0+x1)/2)/((x1-x0)/2),yy=Math.round(y-u*u*3-(Math.abs(u)>.95?(Math.abs(u)-.95)*14:0));P(A,x,yy,Q[5]);P(A,x,yy+1,Q[4]);P(A,x,yy+2,Q[2]);}};
  if(V==='S'||V==='N'){const x0=4,w=W-8,top=base-17,hoodL=V==='S';rocker(x0-2,x0+w+1,base-2);
    box3(x0,top,w,5,10,R,{});for(let x=x0+3;x<x0+w-2;x+=3){vl(A,x,top+6,8,R[1]);vl(A,x+1,top+6,8,R[4]);}                        // spindled sides
    rect(A,x0+2,top+1,w-4,3,RAMP.red[3]);hl(A,x0+2,top+1,w-4,RAMP.red[5]);for(let x=x0+3;x<x0+w-3;x+=4)P(A,x,top+2,RAMP.cream[4]);       // a quilt
    const hx=hoodL?x0:x0+w-12;   // the hood: an arched canopy over the head end, its open mouth toward the foot, dark inside
    for(let y=0;y<13;y++){const arch=y<4?Math.round(Math.sqrt(16-(4-y)*(4-y))*3):12;for(let x=0;x<12;x++){const xx=hoodL?x:11-x;if(xx>arch)continue;
      let k=y===0?5:xx===0?4:2;if(xx>=arch-1)k=1;if(y>3&&xx>2&&xx<arch-1&&y>5)k=(hoodL?x>6:x<5)?0:k;P(A,hx+x,top-12+y,R[k]);}}
    for(let y=top-6;y<top+1;y++)for(let x=3;x<9;x++)P(A,hx+(hoodL?x:11-x),y,RAMP.plum[y<top-3?1:2]);                                      // the shadowed inside
    {const px=hoodL?x0+5:x0+w-9;hl(A,px,top-1,5,RAMP.ivory[5]);hl(A,px,top,5,RAMP.ivory[3]);}
    under(x0,x0+w,top+15,base);cast(x0,x0+w,base);}
  if(V==='W'){const cx=W>>1,w=16,x0=cx-8,top=base-19;   // the foot end toward you: open, the blanket and pillow inside, the hood's mouth at the far end
    for(let y=0;y<13;y++){const ww=y<3?Math.round(Math.sqrt(9-(3-y)*(3-y))*2.4):7;for(let x=-ww;x<=ww;x++){P(A,cx+x,top-12+y,y===0?R[5]:x===-ww?R[4]:x===ww?R[1]:RAMP.plum[y<5?1:2]);}}
    box3(x0,top,w,8,9,R,{topDir:'y'});rect(A,x0+2,top+1,w-4,6,RAMP.red[3]);hl(A,x0+2,top+1,w-4,RAMP.red[5]);hl(A,x0+4,top-1,w-8,RAMP.ivory[5]);hl(A,x0+4,top,w-8,RAMP.ivory[3]);
    for(let x=x0+2;x<x0+w-2;x+=3){vl(A,x,top+9,7,R[1]);vl(A,x+1,top+9,7,R[4]);}
    const Q=RAMP.pine;for(let x=x0-4;x<=x0+w+3;x++){const u=(x-cx)/12,yy=Math.round(base-1-(1-u*u)*3);P(A,x,yy,Q[5]);P(A,x,yy+1,Q[3]);}
    under(x0,x0+w,top+17,base);cast(x0,x0+w,base);}
  if(V==='E'){const cx=W>>1,w=16,x0=cx-8,top=base-19;   // end-on: the rocker's curve under you, the hood rising at the back
    for(let y=0;y<14;y++){const ww=y<3?Math.round(Math.sqrt(9-(3-y)*(3-y))*2.4):7;for(let x=-ww;x<=ww;x++){let k=y===0?5:x===-ww?4:x===ww?1:2;if(y>3&&Math.abs(x)<ww-1)k=y<7?1:0;P(A,cx+x,top-13+y,k===0||k===1&&y>3?RAMP.plum[k+1]:R[k]);}}   // the hood seen end-on: an arch, dark inside
    box3(x0,top,w,8,9,R,{topDir:'y'});rect(A,x0+2,top+1,w-4,6,RAMP.red[3]);hl(A,x0+2,top+1,w-4,RAMP.red[5]);
    {const Q=RAMP.pine;for(let x=x0-4;x<=x0+w+3;x++){const u=(x-cx)/12,yy=Math.round(base-1-(1-u*u)*3);P(A,x,yy,Q[5]);P(A,x,yy+1,Q[3]);}}
    under(x0,x0+w,top+17,base);cast(x0,x0+w,base);}}
// =================================================================================== the upright piano
if(K==='piano'){const R=RAMP.walnut,base=H-3;
  const keys=(x0,y,w)=>{rect(A,x0,y,w,4,RAMP.ivory[4]);hl(A,x0,y,w,RAMP.ivory[5]);hl(A,x0,y+3,w,RAMP.ivory[2]);for(let x=x0+3;x<x0+w;x+=3)vl(A,x,y+1,3,RAMP.ivory[3]);
    for(let g=0,x=x0+2;x<x0+w-2;g++){const n=g%2?3:2;for(let k=0;k<n&&x<x0+w-2;k++,x+=3){vl(A,x,y,2,RAMP.walnut[0]);vl(A,x+1,y,2,RAMP.walnut[1]);}x+=3;}};
  const sconce=(x,y)=>{hl(A,x-1,y,3,RAMP.brass[4]);rect(A,x,y-5,1,5,RAMP.ivory[4]);P(A,x,y-6,RAMP.lit[NIGHT?5:3]);if(NIGHT)P(B,x,y-7,RAMP.lit[4],180);};
  if(V==='S'){const x0=3,w=W-6,top=base-46;
    box3(x0-1,top,w+2,3,3,RAMP.oak,{});box3(x0,top+6,w,0,24,R,{facePw:8});panel(x0+5,top+9,(w>>1)-8,16,R);panel(x0+(w>>1)+3,top+9,(w>>1)-8,16,R);
    rect(A,(W>>1)-7,top+11,14,10,RAMP.cream[4]);hl(A,(W>>1)-7,top+11,14,RAMP.cream[5]);for(let j=0;j<4;j++)hl(A,(W>>1)-6,top+13+j*2,12,RAMP.cream[1]);    // music on the stand
    box3(x0-2,top+30,w+4,6,3,R,{topPw:6});keys(x0+1,top+31,w-2);                                                                   // the keybed
    for(const lx of [x0+1,x0+w-5])leg(lx,top+39,base-top-39,R,true);box3(x0+2,top+39,w-4,0,base-top-42,R,{facePw:6,faceK:1});
    sconce(x0+6,top-1);sconce(x0+w-7,top-1);
    box3((W>>1)-9,base-11,18,4,7,RAMP.red,{});for(const lx of [(W>>1)-8,(W>>1)+5])leg(lx,base-4,4,R,false);                       // the bench
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const x0=8,w=20,top=base-46;   // the side: a tall case side, the keybed standing out to the right, the bench beside it
    box3(x0-1,top,w+2,4,3,RAMP.oak,{topDir:'y'});box3(x0,top+7,w,0,base-top-7,R,{facePw:7});panel(x0+3,top+10,w-6,18,R);panel(x0+3,top+32,w-6,base-top-36,R);
    box3(x0+w-1,top+28,12,5,5,R,{});rect(A,x0+w,top+29,10,3,RAMP.ivory[4]);hl(A,x0+w,top+29,10,RAMP.ivory[5]);hl(A,x0+w,top+31,10,RAMP.ivory[2]);   // the key bed, sticking out
    for(let x=x0+w+1;x<x0+w+10;x+=3){P(A,x,top+29,RAMP.walnut[0]);P(A,x,top+30,RAMP.walnut[1]);}
    leg(x0+w+8,top+38,base-top-38,R,false);box3(x0+w+1,base-12,8,5,6,RAMP.red.map((c,i)=>RAMP.red[Math.max(0,i-1)]),{topDir:'y'});leg(x0+w+2,base-6,6,R,false);leg(x0+w+6,base-6,6,R,false);sconce(x0+w-4,top-1);
    under(x0,x0+w+10,base,base);cast(x0,x0+w+10,base);}
  if(V==='N'){const x0=3,w=W-6,top=base-46;   // the back: the soundboard behind three braces
    box3(x0-1,top,w+2,3,3,RAMP.oak,{});box3(x0,top+6,w,0,base-top-6,R,{facePw:9,faceK:1});rect(A,x0+4,top+10,w-8,base-top-16,RAMP.pine[1]);
    for(const bx of [x0+5,(W>>1)-2,x0+w-9]){rect(A,bx,top+8,4,base-top-12,R[3]);vl(A,bx,top+8,base-top-12,R[5]);vl(A,bx+3,top+8,base-top-12,R[0]);}
    sconce(x0+6,top-1);sconce(x0+w-7,top-1);under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// =================================================================================== the chess table (looks the same turned: front only)
if(K==='chess'){const R=RAMP.oak,base=H-3,cx=W>>1,top=base-24;
  rect(A,cx-1,top+8,3,base-top-10,R[3]);vl(A,cx-1,top+8,base-top-10,R[5]);vl(A,cx+1,top+8,base-top-10,R[1]);ell(A,cx,top+14,2,1,R[4]);
  for(const s of [-1,1]){ln(A,cx,base-3,cx+s*8,base,R[3]);ln(A,cx,base-2,cx+s*8,base+1,R[1]);}
  box3(cx-19,top-2,38,18,3,R,{topPw:4});
  const bx=cx-16,by=top,cw=4,ch=2;for(let j=0;j<8;j++)for(let i=0;i<8;i++){const c=(i+j)%2?RAMP.ivory[4]:RAMP.walnut[1];const y0=by+Math.floor(j*ch),y1=by+Math.floor((j+1)*ch);for(let y=y0;y<Math.max(y1,y0+1);y++)for(let x=0;x<cw;x++)P(A,bx+i*cw+x,y,c);}
  hl(A,bx-1,by-1,34,RAMP.walnut[0]);hl(A,bx-1,by+16,34,RAMP.oak[5]);vl(A,bx-1,by-1,18,RAMP.walnut[0]);vl(A,bx+32,by-1,18,RAMP.walnut[1]);
  const piece=(x,y,dark,h)=>{const Rr=dark?RAMP.plum:RAMP.ivory;for(let j=0;j<h;j++){P(A,x,y-j,Rr[dark?4:5]);P(A,x+1,y-j,Rr[dark?2:4]);P(A,x+2,y-j,Rr[dark?1:2]);}hl(A,x,y-h,3,Rr[dark?5:5]);hl(A,x-1,y+1,5,RAMP.walnut[0]);};
  for(const [i,j,d,h] of [[0,0,1,4],[3,1,1,3],[6,0,1,5],[5,3,1,3],[1,6,0,3],[4,7,0,5],[7,6,0,3],[2,4,0,4]])piece(bx+i*4,by+j*2+1,d,h);
  under(cx-17,cx+17,top+17,base);cast(cx-10,cx+10,base);}
const flat=flatten([A,B],W,H);const O=outline(flat);const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
