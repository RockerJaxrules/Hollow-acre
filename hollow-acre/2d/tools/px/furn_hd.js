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
  brick:hexR(['#2a1410','#46201a','#663024','#82402e','#9c5238','#b26848']),
  ironW:hexR(['#141213','#252022','#383233','#4f4746','#6b625e','#8a807a']),
  ivory:hexR(['#4a443a','#6e6656','#948a74','#b8ae94','#d4ccb2','#ece6d2']),
  lit:hexR(['#5a2c0e','#9a5320','#d3863a','#f0b65c','#fbdc8f','#fff4c6']),
};
const SHC=[0x32,0x21,0x25];const SH=(x,y,a)=>P(SHD,x,y,SHC,a);
function cast(x0,x1,base){for(let x=x0+1;x<=x1+4;x++){SH(x,base+1,150);SH(x+1,base+2,105);}for(let x=x0+3;x<=x1+5;x++)SH(x,base+3,55);}
function fadeUnder(x0,x1,y0,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(G(A,x,y))continue;const a=Math.max(0,110-(y-y0)*14);if(a)SH(x,y,a);}}
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
    box3(x0,top-14,w,0,6,R,{facePw:3,faceK:3});hl(A,x0,top-14,w,R[5]);                                               // the low gallery at the back
    for(let i=0;i<3;i++){const cx=x0+8+i*7;rect(A,cx,top-13,5,4,R[1]);hl(A,cx,top-13,5,R[0]);}                        // its pigeonholes
    box3(x0-1,top-8,w+2,16,4,R,{topPw:3});                                                                            // the writing top (three-quarters of its depth, as in every view) and its edge
    // the drawer pedestal on the right, the knee hole, the left leg
    box3(x0+w-20,top+12,20,0,base-top-13,R,{facePw:7});
    for(let k=0;k<2;k++){const dy=top+14+k*7;rect(A,x0+w-18,dy,16,6,R[2]);hl(A,x0+w-18,dy,16,R[1]);hl(A,x0+w-18,dy+5,16,R[4]);knob(x0+w-11,dy+2);}
    rect(A,x0+2,top+12,w-22,base-top-16,R[0]);for(let y=top+12;y<base-4;y++)SH(x0+3,y,60);                            // the dark knee hole
    leg(x0+1,top+12,base-top-12,R,false);hl(A,x0+1,base-1,4,R[1]);
    // things on the top: a letter with lines of writing, an inkwell with a quill, a lamp at the back left
    rect(A,x0+12,top+2,11,6,RAMP.cream[4]);hl(A,x0+12,top+2,11,RAMP.cream[5]);for(let j=0;j<3;j++)hl(A,x0+13,top+3+j*1.5|0,8-(j%2)*2,RAMP.cream[1]);contact(x0+13,top+8,11);
    rect(A,x0+27,top+3,3,3,RAMP.walnut[0]);hl(A,x0+27,top+3,3,RAMP.glass[3]);ln(A,x0+29,top+2,x0+33,top-4,RAMP.ivory[5]);ln(A,x0+30,top+2,x0+34,top-3,RAMP.ivory[3]);
    lamp(x0+6,top-18);
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const w=22,x0=(W-w)>>1,d=39,top=base-30-d+8;   // turned: the writing top runs up the screen at the desk's length; the gallery is a rail along its back (left) edge
    box3(x0-1,top,w+2,d,4,R,{topDir:'y',topPw:4});for(let y=top+1;y<top+d-1;y++)for(let x=x0;x<x0+w;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.1));}
    for(let y=top-2;y<top+d-4;y++){P(A,x0,y,R[5]);P(A,x0+1,y,R[2]);if((y-top)%6===0)P(A,x0+2,y,R[0]);}   // the gallery seen along its length: a thin lit lip, its pigeonholes as slivers
    rect(A,x0+10,top+d-17,8,9,RAMP.cream[4]);vl(A,x0+10,top+d-17,9,RAMP.cream[5]);for(let j=0;j<4;j++)hl(A,x0+11,top+d-15+j*2,5,RAMP.cream[1]);contact(x0+10,top+d-8,8);   // the letter, turned
    rect(A,x0+12,top+12,3,3,RAMP.walnut[0]);hl(A,x0+12,top+12,3,RAMP.glass[3]);ln(A,x0+14,top+11,x0+18,top+5,RAMP.ivory[5]);ln(A,x0+15,top+11,x0+19,top+6,RAMP.ivory[3]);   // the inkwell and quill, further along
    lamp(x0+6,top+d-14);
    // the knee-hole end toward you: through it the far pedestal's inner side in shade, then the apron and two legs
    const ly=top+d+4;rect(A,x0+4,ly,w-8,base-ly-12,R[1]);frame(A,x0+6,ly+2,w-12,base-ly-16,R[2],R[0]);for(let x=x0+4;x<x0+w-4;x++)SH(x,base-11,120);
    box3(x0,top+d+4,w,0,3,R,{facePw:6});
    leg(x0+1,ly+3,base-ly-3,R,false);leg(x0+w-4,ly+3,base-ly-3,R,false);
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='N'){const x0=3,w=W-6,top=base-30;   // the back: a plain modesty panel with two battens, the gallery's back above
    box3(x0-1,top-8,w+2,16,4,R,{topPw:3});lamp(x0+w-8,top-14);box3(x0,top-14,w,0,6,R,{facePw:3,faceK:2});
    box3(x0,top+12,w,0,base-top-13,R,{facePw:7,faceK:2});for(const by of [top+16,base-7]){hl(A,x0+1,by,w-2,R[3]);hl(A,x0+1,by+1,w-2,R[1]);}
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// a plate seen from above: rim lit top-left, a darker well, a shadowed lower rim
function dish(cx,cy){hl(A,cx-2,cy-2,5,RAMP.ivory[5]);hl(A,cx-4,cy-1,9,RAMP.ivory[4]);P(A,cx-4,cy-1,RAMP.ivory[5]);hl(A,cx-4,cy,9,RAMP.ivory[4]);hl(A,cx-2,cy-1,5,RAMP.ivory[3]);hl(A,cx-2,cy,5,RAMP.ivory[3]);
  hl(A,cx-3,cy+1,7,RAMP.ivory[2]);hl(A,cx-1,cy+2,3,RAMP.ivory[1]);P(A,cx+4,cy,RAMP.ivory[2]);}
// a deep bowl: a dark rim ellipse with a lit lip, stew inside
function bowl(cx,cy){for(let x=-4;x<=4;x++){const h=Math.round(Math.sqrt(16-x*x)*.6);for(let y=0;y<=h+1;y++)P(A,cx+x,cy+y,RAMP.ivory[y===0?4:x<0?3:2]);}
  hl(A,cx-3,cy,7,RAMP.ivory[5]);hl(A,cx-2,cy+1,5,RAMP.red[1]);hl(A,cx-3,cy+1,1,RAMP.ivory[4]);P(A,cx-1,cy+1,RAMP.red[3]);hl(A,cx-2,cy+4,5,RAMP.ivory[1]);}
// a candle in a brass stick: a dull wax column and a 3x5 amber flame with a pale core, the brightest thing on the piece; at night it lights the wood round it
function flame(fx,fy){P(A,fx,fy-4,RAMP.lit[4]);P(A,fx-1,fy-3,RAMP.lit[3]);P(A,fx,fy-3,RAMP.lit[5]);P(A,fx+1,fy-3,RAMP.lit[3]);
  P(A,fx-1,fy-2,RAMP.lit[3]);P(A,fx,fy-2,RAMP.lit[5]);P(A,fx+1,fy-2,RAMP.lit[2]);P(A,fx-1,fy-1,RAMP.lit[2]);P(A,fx,fy-1,RAMP.lit[4]);P(A,fx+1,fy-1,RAMP.lit[1]);P(A,fx,fy,RAMP.walnut[0]);}
function warm(cx,cy,r,amt){const L=RAMP.lit[4];for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.sqrt(x*x+y*y*1.4)/r;if(d>1)continue;const c=G(A,cx+x,cy+y);if(!c)continue;const t=amt*(1-d);
  P(A,cx+x,cy+y,[c[0]+(L[0]-c[0])*t|0,c[1]+(L[1]-c[1])*t|0,c[2]+(L[2]-c[2])*t|0]);}}
function candle(x,top){rect(A,x-1,top+1,4,2,RAMP.brass[3]);hl(A,x-1,top+1,4,RAMP.brass[5]);P(A,x+2,top+2,RAMP.brass[1]);
  for(let y=top-6;y<=top;y++){P(A,x,y,RAMP.ivory[3]);P(A,x+1,y,RAMP.ivory[2]);}P(A,x,top-6,RAMP.ivory[4]);P(A,x+1,top-5,RAMP.ivory[3]);
  if(NIGHT)warm(x,top-6,11,.55);flame(x,top-7);}
// =================================================================================== the dining table
if(K==='table'){const R=RAMP.oak,base=H-3;
  const things=(x0,top,w,d)=>{const cx=(x0+w/2|0);
    dish(x0+10,top+d-4);bowl(x0+w-14,top+d-8);                                                                          // a plate near you, a bowl further back (not a mirrored pair)
    candle(cx-1,top+7);
    for(let i=0;i<9;i++){const y=top+3+((i===0||i===8)?1:0);P(A,x0+w-21+i+6,y-1,RAMP.pine[i<3?5:4]);P(A,x0+w-21+i+6,y,RAMP.pine[2]);}contact(x0+w-15,top+4,9);   // a loaf
    for(const [ax,ay] of [[x0+6,top+4],[x0+9,top+3],[x0+8,top+5]]){P(A,ax,ay,RAMP.red[5]);P(A,ax+1,ay,RAMP.red[3]);P(A,ax,ay+1,RAMP.red[3]);P(A,ax+1,ay+1,RAMP.red[1]);}};   // three apples
  if(V==='S'||V==='N'){const x0=2,w=W-4,d=19,top=base-31;   // the top at three-quarters of its real depth, as in every view
    for(const lx of [x0+5,x0+w-8])leg(lx,top+4,base-top-4,RAMP.oak.map((c,i)=>RAMP.oak[Math.max(0,i-1)]),false);
    box3(x0,top,w,d,4,R,{topPw:5});for(let y=top+1;y<top+d-1;y++)for(let x=x0+1;x<x0+w-1;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.12));}
    for(const lx of [x0+2,x0+w-5])leg(lx,top+d+4,base-top-d-4,R,false);
    if(V==='S')things(x0,top,w,d);else{dish(x0+w-12,top+6);bowl(x0+11,top+d-7);candle((x0+w/2|0)-1,top+8);}
    under(x0,x0+w,top+d+4,base);cast(x0,x0+w,base);}
  if(V==='E'){const w=26,x0=(W-w)>>1,d=39,top=base-51;   // turned: the top runs up the screen at three-quarters of the table's length, its full depth across
    box3(x0,top,w,d,4,R,{topDir:'y',topPw:5});for(let y=top+1;y<top+d-1;y++)for(let x=x0+1;x<x0+w-1;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.12));}vl(A,x0,top+1,d-1,R[5]);
    for(const lx of [x0+1,x0+w-4])leg(lx,top+d+4,base-top-d-4,R,false);
    dish(x0+6,top+d-8);dish(x0+w-7,top+10);bowl(x0+w-7,top+d-13);
    for(let i=0;i<7;i++){P(A,x0+4,top+6+i,RAMP.pine[i<2?5:4]);P(A,x0+5,top+6+i,RAMP.pine[3]);P(A,x0+6,top+6+i,RAMP.pine[2]);}contact(x0+4,top+13,3);   // a loaf, end-on
    candle(x0+12,top+21);   // the candle at the centre, upright, its flame the brightest thing
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
if(K==='keg'){const R=RAMP.oak,base=H-3,I=RAMP.ironW;
  const stand=(x0,w)=>{for(const lx of [x0,x0+w-3]){rect(A,lx,base-9,3,9,R[2]);vl(A,lx,base-9,9,R[4]);vl(A,lx+2,base-9,9,R[0]);}hl(A,x0,base-9,w,R[3]);hl(A,x0,base-8,w,R[1]);};
  const cup=(x)=>{rect(A,x,base-4,6,4,RAMP.pine[2]);hl(A,x,base-4,6,RAMP.pine[4]);vl(A,x+5,base-4,4,RAMP.pine[1]);for(let i=1;i<5;i++)P(B,x+i,base-4,RAMP.ochre[4],140);};
  // lying on its side along the screen: bellied staves lit along the top, cast-iron hoops, the tap end's head showing as a narrow lit disc
  const side=(dir)=>{const w=W-12,x0=dir>0?4:8,cy=base-14,rr=9;stand(x0+3,w-6);
    for(let x=0;x<w;x++){const t=x/(w-1),r=Math.round(rr+1.3*Math.sin(t*Math.PI));for(let y=-r;y<=r;y++){const l=-y/r;let k=l>.6?5:l>.2?4:l>-.3?3:2;if(y===-r)k=4;if((x+(dir>0?0:2))%6===0&&y>-r)k=Math.max(1,k-1);P(A,x0+x,cy+y,R[k]);}}
    for(const hx of [x0+2,x0+7,x0+w-8,x0+w-3]){const t=(hx-x0)/(w-1),r=Math.round(rr+1.3*Math.sin(t*Math.PI));for(let y=-r;y<=r;y++){P(A,hx,cy+y,I[y<-r*.5?4:y<r*.3?2:1]);}}
    const ex=dir>0?x0+w:x0-1;   // the head: 3 px of end grain, two steps lighter than the staves, in a dark chime
    for(let y=-rr;y<=rr;y++){const ww=Math.abs(y)>rr-2?1:3;for(let i=0;i<ww;i++){const X=ex+dir*i;P(A,X,cy+y,i===ww-1?I[1]:RAMP.pine[y<0?5:4]);}}
    for(let y=-rr+1;y<rr;y+=4)P(A,ex,cy+y,RAMP.pine[3]);
    {const tx=dir>0?ex+2:ex-4;rect(A,tx,cy+3,3,3,RAMP.brass[3]);hl(A,tx,cy+3,3,RAMP.brass[5]);hl(A,tx,cy+5,3,RAMP.brass[1]);const sx=dir>0?tx+2:tx;vl(A,sx,cy+6,3,RAMP.brass[2]);P(A,sx,cy+9,RAMP.brass[4]);cup(dir>0?tx-2:tx-2);}
    rect(A,x0+(w>>1)-1,cy-rr-2,3,2,RAMP.walnut[1]);P(A,x0+(w>>1)-1,cy-rr-2,RAMP.pine[4]);                                         // the bung on top
    under(x0,x0+w,base,base);cast(x0,x0+w,base);};
  // end-on: the head toward you, one lit end-grain disc inside a dark iron ring, a sliver of the staves above it, the tap low
  const end=(tap)=>{const cx=W>>1,cy=base-13,r=10;stand(cx-11,22);
    for(let x=-r+1;x<r;x++){const y0=-Math.round(Math.sqrt(r*r-x*x));for(let t=1;t<=3;t++)P(A,cx+x,cy+y0-t,R[t===3?4:(x<-3?4:3)]);}
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=(x*x+y*y)/(r*r);if(d>1)continue;let c;
      if(d>.8)c=I[d>.93?1:(x<0&&y<0?3:2)];else{const l=(-x-y)/r;c=RAMP.pine[l>.5?5:l>-.3?4:3];if(y%4===0&&Math.abs(x)<r-3)c=RAMP.pine[3];}P(A,cx+x,cy+y,c);}
    P(A,cx+4,cy-3,RAMP.walnut[1]);P(A,cx+5,cy-3,RAMP.walnut[0]);
    if(tap){rect(A,cx-1,cy+4,3,3,RAMP.brass[3]);hl(A,cx-1,cy+4,3,RAMP.brass[5]);vl(A,cx,cy+7,3,RAMP.brass[2]);P(A,cx,cy+10,RAMP.brass[4]);}else{P(A,cx-5,cy+5,RAMP.cream[4]);P(A,cx-4,cy+5,RAMP.cream[4]);P(A,cx-3,cy+6,RAMP.cream[3]);}   // the plain end has a chalk mark
    under(cx-11,cx+11,base,base);cast(cx-11,cx+11,base);};
  if(V==='S')side(1);if(V==='N')side(-1);if(V==='E')end(false);if(V==='W')end(true);}
// =================================================================================== the cradle
if(K==='cradle'){const R=RAMP.oak,base=H-3;
  const rocker=(x0,x1,y)=>{const Q=RAMP.pine;for(let x=x0-3;x<=x1+3;x++){const u=(x-(x0+x1)/2)/((x1-x0)/2),yy=Math.round(y-u*u*3-(Math.abs(u)>.95?(Math.abs(u)-.95)*14:0));P(A,x,yy,Q[5]);P(A,x,yy+1,Q[4]);P(A,x,yy+2,Q[2]);}};
  if(V==='S'||V==='N'){const x0=4,w=W-8,top=base-17,hoodL=V==='S';rocker(x0-2,x0+w+1,base-2);
    box3(x0,top,w,5,10,R,{});rect(A,x0+2,top+6,w-4,8,R[1]);
    {let x=x0+3,i=0;while(x<x0+w-4){vl(A,x,top+6,8,R[4]);vl(A,x+1,top+6,8,R[3]);P(A,x,top+6,R[5]);x+=[4,5,4,4,5][i++%5];}}           // turned spindles, soft contrast, uneven gaps
    // the hood: a quarter-dome over the head end. The near shell is wood with ribs along its curve; above it the far shell's lip, and between them the plum-dark inside
    {const L=14,Hh=11,hx=hoodL?x0:x0+w-1,dir=hoodL?1:-1,yt=x=>top-Math.round(Hh*Math.sqrt(Math.max(0,1-(x/L)*(x/L))));
      for(let x=0;x<L;x++){const X=hx+dir*x,y0=yt(x);
        for(let y=y0-3;y<y0;y++)P(A,X,y,y===y0-3?R[4]:RAMP.plum[y===y0-2?1:2]);                                        // far lip, then the dark inside
        for(let y=y0;y<=top;y++){const dd=(y-y0)/Math.max(1,top-y0+1),lx=x/L;let k=y===y0?5:(dd+lx*.6<.45?4:dd+lx*.6<.95?3:2);if(y===y0+4||y===y0+8)k=Math.max(1,k-2);if(x===0)k=Math.max(k,4);P(A,X,y,R[k]);}}   // one shell, lit toward the upper left, two rib lines
      for(let y=yt(0)-3;y<=top;y++)P(A,hx,y,R[y<yt(0)?5:4]);}
    // the blanket: a mound over the baby's shape with a sheet turned down at the head, hanging over the near rail in soft folds
    const hb=hoodL?x0+10:x0+2,he=hoodL?x0+w-2:x0+w-10;
    for(let x=x0+2;x<x0+w-2;x++){const u=(x-(x0+w/2))/(w/2),m=Math.round(2.2*Math.max(0,1-u*u*1.6));
      for(let y=top-m;y<top+2;y++){const k=y===top-m?5:4;P(A,x,y,RAMP.brick[k]);}
      P(A,x,top+2,RAMP.cream[5]);P(A,x,top+3,RAMP.cream[4]);P(A,x,top+4,RAMP.cream[2]);                                       // the sheet turned down over the blanket: a broad lit crest
      const hang=3+(Math.abs(u)<.45?1:0)+(((x*3)>>2)%5===0?1:0);for(let y=top+5;y<top+5+hang;y++)P(A,x,y,RAMP.brick[y===top+4+hang?2:(y===top+5?3:4)]);}   // draped over the front rail, soft and uneven
    {const px=hoodL?x0+5:x0+w-9;hl(A,px,top-1,5,RAMP.ivory[5]);hl(A,px,top,5,RAMP.ivory[3]);}
    under(x0,x0+w,top+15,base);cast(x0,x0+w,base);}
  // end-on, a rocker is just its end: a short lit nub under each corner post, the curl of its tip showing
  const feet=(x0,w)=>{const Q=RAMP.pine;for(const fx of [x0,x0+w-4]){rect(A,fx,base-3,4,3,Q[3]);hl(A,fx,base-3,4,Q[5]);vl(A,fx+3,base-3,3,Q[1]);P(A,fx+(fx===x0?0:3),base-4,Q[4]);}
    for(const px of [x0+1,x0+w-3]){rect(A,px,base-8,2,5,R[2]);vl(A,px,base-8,5,R[4]);}};
  const shellArch=(cx,yb,hw,hh,inside)=>{for(let y=0;y<=hh;y++){const t=y/hh,ww=Math.round(hw*Math.pow(Math.max(0,1-Math.pow(1-t,2.6)),1/2.6));for(let x=-ww;x<=ww;x++){
      let k=y===0||Math.abs(x)===ww&&x<0?5:x===ww?1:x<-ww+2?4:3;if(!inside&&(Math.abs(x)===Math.round(ww*.5))&&y>1)k=2;if(inside&&Math.abs(x)<ww-1&&y>1)k=-1;
      const Y=yb-hh+y;if(k<0)P(A,cx+x,Y,RAMP.plum[y<hh*.5?1:2]);else P(A,cx+x,Y,R[k]);}}};
  if(V==='W'){const cx=W>>1,w=16,x0=cx-8,top=base-19,L=22;   // the foot end toward you: open, the blanket and pillow inside, the hood's mouth at the far end, plum inside
    shellArch(cx,top-L+9,8,12,true);hl(A,cx-4,top-L+7,8,RAMP.ivory[5]);hl(A,cx-4,top-L+8,8,RAMP.ivory[3]);
    box3(x0,top-L+8,w,L,9,R,{topDir:'y'});for(let y=top-L+8;y<top+8;y++){P(A,x0,y,R[4]);P(A,x0+1,y,R[(y>>1)%2?3:5]);P(A,x0+w-2,y,R[(y>>1)%2?2:3]);P(A,x0+w-1,y,R[1]);}   // the rims down both long edges
    for(let y=top-L+9;y<top+8;y++)for(let x=x0+2;x<x0+w-2;x++)P(A,x,y,RAMP.brick[y<top-L+12?5:(y<top?4:3)]);hl(A,x0+3,top-L+10,w-6,RAMP.cream[5]);hl(A,x0+3,top-L+11,w-6,RAMP.cream[3]);   // the blanket, its fold at the far end
    for(let x=x0+2;x<x0+w-2;x++){const hang=3+((x*5)%3===0?1:0);for(let y=top+8;y<top+8+hang;y++)P(A,x,y,RAMP.brick[y===top+7+hang?1:3]);}                                   // draped over the foot board
    {let x=x0+2,i=0;while(x<x0+w-2){vl(A,x,top+12,5,R[4]);x+=[4,5,4][i++%3];}}feet(x0,w);
    under(x0,x0+w,top+17,base);cast(x0,x0+w,base);}
  if(V==='E'){const cx=W>>1,w=16,x0=cx-8,top=base-19,L=22;   // the head end toward you: the hood's closed back rising over a panelled head board
    box3(x0,top-L+8,w,L,9,R,{topDir:'y'});for(let y=top-L+8;y<top+8;y++){P(A,x0,y,R[4]);P(A,x0+1,y,R[(y>>1)%2?3:5]);P(A,x0+w-2,y,R[(y>>1)%2?2:3]);P(A,x0+w-1,y,R[1]);}
    for(let y=top-L+9;y<top+7;y++)for(let x=x0+2;x<x0+w-2;x++)P(A,x,y,RAMP.brick[y<top-L+12?5:(y<top?4:3)]);hl(A,x0+3,top-L+12,w-6,RAMP.cream[4]);
    shellArch(cx,top+4,8,13,false);                                                                                                       // the hood seen from behind: a closed dome with two ribs
    panel(x0+3,top+10,w-6,6,R);feet(x0,w);
    for(const sx of [x0-1,x0+w-2])for(let y=top+1;y<top+11+(sx<cx?1:0);y++){P(A,sx,y,RAMP.brick[y===top+1?5:(y>top+9?2:(sx<cx?4:3))]);P(A,sx+1,y,RAMP.brick[y===top+1?4:(sx<cx?3:2)]);}   // the cover hanging out on both sides
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
  if(V==='E'){const x0=6,w=24,d=40,top=base-46-d;   // turned: the lid runs up the screen at the piano's length; the near end is the case's panelled side
    box3(x0-1,top,w+2,d,3,R,{topDir:'y',topPw:6,});for(let y=top+1;y<top+d-1;y++)for(let x=x0;x<x0+w;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.25));}   // the lid, the case's walnut
    box3(x0,top+d+3,w,0,base-top-d-3,R,{facePw:7});panel(x0+3,top+d+6,w-6,16,R);panel(x0+3,top+d+25,w-6,base-top-d-30,R);           // the near end of the case
    const kx=x0+w+1,ky0=top+d-24,ky1=base-18;   // the key bed beside the case (the front faces right), the keys running up the screen
    for(let y=ky0;y<ky1;y++){P(A,kx,y,R[2]);for(let i=1;i<6;i++)P(A,kx+i,y,RAMP.ivory[i===1?3:i===5?2:4]);P(A,kx+6,y,R[1]);}
    for(let y=ky0+1,g=0;y<ky1-1;g++){const n=g%2?3:2;for(let k=0;k<n&&y<ky1-1;k++,y+=2){P(A,kx+1,y,RAMP.walnut[0]);P(A,kx+2,y,RAMP.walnut[0]);P(A,kx+3,y,RAMP.walnut[1]);}y+=2;}   // black keys in twos and threes
    hl(A,kx,ky0-1,7,R[4]);box3(kx,ky1,7,0,5,R,{});for(let y=ky1+5;y<base;y++)P(A,kx+5,y,R[2]);
    sconce(x0+w-3,top+6);sconce(x0+w-3,top+d-4);                                                                                 // the candles at the two ends: one behind the other, the far one higher
    box3(kx+8,base-24,8,14,6,RAMP.red.map((c,i)=>RAMP.red[Math.max(0,i-1)]),{topDir:'y'});leg(kx+8,base-4,4,R,false);leg(kx+13,base-4,4,R,false);   // the bench, turned
    under(x0,x0+w+16,base,base);cast(x0,x0+w+16,base);}
  if(V==='N'){const x0=3,w=W-6,top=base-46;   // the back: the soundboard behind three braces
    box3(x0-1,top,w+2,3,3,RAMP.oak,{});box3(x0,top+6,w,0,base-top-6,R,{facePw:9,faceK:2});boards(x0+4,top+10,w-8,base-top-16,RAMP.pine,'y',5,2);
    for(const ry of [top+9,base-9]){hl(A,x0+3,ry,w-6,R[5]);hl(A,x0+3,ry+1,w-6,R[3]);hl(A,x0+3,ry+2,w-6,R[1]);}
    for(const bx of [x0+5,(W>>1)-2,x0+w-9]){rect(A,bx,top+8,4,base-top-12,R[4]);vl(A,bx,top+8,base-top-12,R[5]);vl(A,bx+3,top+8,base-top-12,R[1]);hl(A,bx,top+8,4,RAMP.oak[5]);}
    sconce(x0+6,top-1);sconce(x0+w-7,top-1);under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// =================================================================================== the chess table (looks the same turned: front only)
if(K==='chess'){const R=RAMP.walnut,base=H-3,cx=W>>1;
  // a pedestal games table: the board lies flat (foreshortened to half its width) on a top with a lit front edge, a turned column, three splayed feet
  const w=34,x0=cx-17,d=14,top=base-28;
  for(let y=top+d+3;y<base-4;y++){const b=(y-top-d-3)%7===3;const hw=b?3:2;for(let i=-hw;i<hw;i++)P(A,cx+i,y,R[i<-hw+2?4:i>=hw-1?1:3]);}   // the turned column
  for(const s of [-1,1])for(let i=0;i<8;i++){const y=base-4+Math.round(i*.45);P(A,cx+(s<0?-1:0)+s*i,y,R[s<0?4:2]);P(A,cx+(s<0?-1:0)+s*i,y+1,R[1]);}
  if(V!=='E')for(let j=0;j<3;j++){P(A,cx-1,base-3+j,R[4]);P(A,cx,base-3+j,R[2]);}
  box3(x0,top,w,d,3,RAMP.oak,{topPw:4});hl(A,x0,top+d,w,RAMP.oak[5]);                                                       // the top and its lit front edge
  const bx=cx-12,by=top+2,cw=3,rows=[1,1,1,2,1,2,1,2];const ry=[];{let y=by;for(const h of rows){ry.push([y,h]);y+=h;}}
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){const lt=(i+j)%2===0;const [y0,h]=ry[j];for(let y=0;y<h;y++)for(let x=0;x<cw;x++)P(A,bx+i*cw+x,y0+y,lt?RAMP.pine[5]:RAMP.walnut[2]);}
  hl(A,bx-1,by-1,26,RAMP.walnut[1]);hl(A,bx-1,by+11,26,RAMP.oak[5]);vl(A,bx-1,by-1,13,RAMP.walnut[1]);vl(A,bx+24,by-1,13,RAMP.walnut[1]);
  // the pieces: 2 px wide, 3-5 tall, a lit left column and a dark right one, a nub for the head; ivory and ebony
  const piece=(i,j,dark,kind)=>{const [y0,h0]=ry[j];const x=bx+i*cw,y=y0+h0-1;const Lt=dark?RAMP.plum[3]:RAMP.ivory[5],Mt=dark?RAMP.walnut[1]:RAMP.ivory[3],Dk=dark?RAMP.walnut[0]:RAMP.ivory[1];
    const h=kind==='k'?5:kind==='q'?4:kind==='p'?2:3;for(let k=0;k<h;k++){P(A,x,y-k,Lt);P(A,x+1,y-k,Mt);}P(A,x+1,y,Dk);P(A,x+2,y,Dk);
    if(kind==='k'){P(A,x,y-h,Lt);P(A,x,y-h-1,Lt);}else if(kind!=='p')P(A,x,y-h,Lt);};
  const game=[[0,7,0,'r'],[4,7,0,'k'],[3,6,0,'q'],[1,5,0,'p'],[5,6,0,'p'],[6,6,0,'p'],[2,5,0,'n'],[7,7,0,'r'],
              [0,0,1,'r'],[3,0,1,'k'],[4,1,1,'q'],[1,1,1,'p'],[6,1,1,'p'],[5,2,1,'p'],[2,2,1,'n'],[7,0,1,'r']];
  const map=(i,j)=>V==='S'?[i,j]:V==='N'?[7-i,7-j]:[7-j,i];
  game.map(([i,j,dk,k])=>{const [I,J]=map(i,j);return [I,J,dk,k];}).sort((p,q)=>p[1]-q[1]).forEach(([I,J,dk,k])=>piece(I,J,dk,k));
  for(let y=top+d+3;y<=top+d+6;y++)for(let x=x0+2;x<x0+w-2;x++)if(!G(A,x,y))SH(x,y,110-(y-top-d-3)*25);
  cast(cx-8,cx+8,base);}
// =================================================================================== the globe on its stand
if(K==='globe'){const R=RAMP.walnut,base=H-3,cx=W>>1,cy=13,r=8,Bz=RAMP.brass;
  // turned legs: a tripod of three splayed feet under a turned column
  const col=(x,y0,y1)=>{for(let y=y0;y<y1;y++){const b=(y-y0)%6===2;const w=b?2:1;for(let i=-w;i<=w;i++)P(A,x+i,y,R[i<0?4:i>0?1:3]);}};
  col(cx,cy+r+2,base-3);
  if(V==='S'){for(const [dx,dy] of [[-1,0],[1,0]])for(let i=0;i<6;i++){P(A,cx+dx*(1+i),base-3+Math.round(i*.5),R[dx<0?4:2]);P(A,cx+dx*(1+i),base-2+Math.round(i*.5),R[1]);}
    vl(A,cx,base-3,4,R[3]);P(A,cx,base,R[4]);}
  else{for(const [dx] of [[-1],[1]])for(let i=0;i<6;i++){P(A,cx+dx*(1+i),base-3+Math.round(i*.35),R[dx<0?4:2]);P(A,cx+dx*(1+i),base-2+Math.round(i*.35),R[1]);}
    for(let i=0;i<3;i++)P(A,cx-1-i,base-2-i,R[3]);}
  rect(A,cx-2,cy+r+1,5,2,Bz[3]);hl(A,cx-2,cy+r+1,5,Bz[5]);                                                                // the brass cup
  // the sphere: muted sea, dull land masses that change with the turn, lit top-left, a soft terminator, one specular glint
  const land=V==='S'?[[-4,-4,3,2],[-5,0,2,3],[1,-2,3,4],[3,3,2,2]]:V==='E'?[[-3,-5,4,2],[0,-1,2,5],[-5,2,3,2]]:[[-2,-3,5,3],[2,2,3,2],[-5,1,2,2]];
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=x*x+y*y;if(d>r*r)continue;const l=(-x*.55-y*.65)/r+.25;let k=l>.6?5:l>.25?4:l>-.15?3:l>-.5?2:1;
    let isL=false;for(const [lx,ly,lw,lh] of land){const u=(x-lx-lw/2)/(lw/2+.6),v=(y-ly-lh/2)/(lh/2+.6);if(u*u+v*v<1)isL=true;}
    let c=isL?RAMP.ochre[Math.min(5,k)]:RAMP.glass[Math.min(5,k)];if(d>(r-1)*(r-1))c=isL?RAMP.ochre[Math.max(0,k-2)]:RAMP.glass[Math.max(0,k-2)];P(A,cx+x,cy+y,c);}
  P(A,cx-3,cy-4,RAMP.ivory[5]);P(A,cx-4,cy-3,RAMP.ivory[4]);
  // the meridian ring: a brass half-hoop round the sphere, tilted; from the side it crosses in front as a narrow band
  if(V==='S'||V==='N'){const sd=V==='S'?1:-1;for(let a=-1.75;a<=1.75;a+=.05){const X=Math.round(cx+sd*(Math.cos(a)*(r+2))),Y=Math.round(cy+Math.sin(a)*(r+2));P(A,X,Y,Bz[a<0?5:3]);P(A,X+sd,Y,Bz[1]);}
    P(A,cx,cy-r-2,Bz[5]);P(A,cx,cy+r+2,Bz[3]);}
  else{for(let y=-r-2;y<=r+2;y++){P(A,cx,cy+y,Bz[y<0?4:3]);}P(A,cx,cy-r-2,Bz[5]);P(A,cx,cy+r+2,Bz[3]);}
  cast(cx-6,cx+6,base);}
// =================================================================================== the candelabra
if(K==='candles'){const I=RAMP.ironW,base=H-3,cx=W>>1;
  // a wrought-iron floor candelabrum: a tripod, a twisted stem, three arms (five turned sideways show as three), wax drips, 3x5 flames
  const stemTop=base-30;for(let y=stemTop;y<base-4;y++){P(A,cx,y,I[(y%3===0)?5:3]);P(A,cx+1,y,I[(y%3===1)?3:1]);}
  for(const s of [-1,1])for(let i=0;i<7;i++){P(A,cx+(s<0?0:1)+s*i,base-4+Math.round(i*.45),I[s<0?4:2]);P(A,cx+(s<0?0:1)+s*i,base-3+Math.round(i*.45),I[1]);}
  if(V==='S')vl(A,cx,base-4,4,I[3]);
  rect(A,cx-1,base-18,4,2,I[3]);hl(A,cx-1,base-18,4,I[5]);                                                                 // a knop on the stem
  const cup=(x,y)=>{hl(A,x-1,y,4,I[4]);hl(A,x-1,y+1,4,I[2]);};
  const cnd=(x,y,h)=>{for(let j=0;j<h;j++){P(A,x,y-j,RAMP.ivory[NIGHT?4:3]);P(A,x+1,y-j,RAMP.ivory[NIGHT?3:2]);}P(A,x,y-h+1,RAMP.ivory[5]);if(h>4)P(A,x+1,y-2,RAMP.ivory[4]);if(NIGHT)warm(x,y-h,7,.45);flame(x,y-h);};
  const arms=V==='S'||V==='N'?[[-9,stemTop+6,7],[9,stemTop+6,6]]:[[-4,stemTop+5,6],[5,stemTop+7,7]];
  for(const [dx,ay,h] of arms){const sx=Math.sign(dx);for(let i=0;i<=Math.abs(dx);i++){const t=i/Math.abs(dx);const y=Math.round(ay+3-Math.sin(t*Math.PI*.9)*3+t*0);P(A,cx+(sx<0?0:1)+sx*i,y,I[sx<0?4:3]);P(A,cx+(sx<0?0:1)+sx*i,y+1,I[1]);}
    const x=cx+(sx<0?0:1)+dx;cup(x,ay);cnd(x,ay-1,h);}
  cup(cx,stemTop);cnd(cx,stemTop-1,8);
  cast(cx-7,cx+7,base);}
// =================================================================================== the oil lamp on its side table
if(K==='lamp'){const R=RAMP.walnut,base=H-3,cx=W>>1,Bz=RAMP.brass;
  const ty=base-17;   // a small round tripod table
  for(let x=-9;x<=9;x++){const h=Math.round(Math.sqrt(81-x*x)*.3);for(let y=-h;y<=h;y++)P(A,cx+x,ty+y,RAMP.oak[y===-h?5:x>4?3:4]);for(let y=h+1;y<=h+1;y++)P(A,cx+x,ty+y,R[x<-5?3:x>5?1:2]);}   // a flat round top with a thin lit lip, its edge one dark band
  for(let y=ty+3;y<base-3;y++){P(A,cx,y,R[4]);P(A,cx+1,y,R[2]);}rect(A,cx-1,ty+8,4,2,R[3]);hl(A,cx-1,ty+8,4,R[4]);
  for(const s of [-1,1])for(let i=0;i<5;i++){P(A,cx+s*(1+i),base-3+Math.round(i*.5),R[s<0?4:2]);P(A,cx+s*(1+i),base-2+Math.round(i*.5),R[1]);}vl(A,cx,base-3,4,R[3]);
  // the lamp: a brass foot and fount, a glass chimney that itself glows (a flame inside opaque glass is invisible), a lit pool on the table
  const ly=ty-1;rect(A,cx-3,ly-1,7,2,Bz[3]);hl(A,cx-3,ly-1,7,Bz[5]);hl(A,cx-3,ly,7,Bz[1]);
  for(let y=0;y<5;y++){const w=y<1?2:y<4?3:2;for(let x=-w;x<=w;x++)P(A,cx+x,ly-2-y,Bz[x<-1?5:x>1?1:3]);}hl(A,cx-1,ly-6,3,Bz[5]);                 // the fount
  rect(A,cx-2,ly-8,5,2,Bz[2]);hl(A,cx-2,ly-8,5,Bz[4]);P(A,cx+3,ly-7,Bz[4]);                                                                   // the burner and its knob
  const L=RAMP.lit;for(let y=0;y<9;y++){const w=y<2||y>6?1:2;for(let x=-w;x<=w;x++){let k=NIGHT?(Math.abs(x)<1&&y>2&&y<7?5:4):(Math.abs(x)<1&&y>2&&y<7?4:3);if(x===w&&!NIGHT)k=2;P(A,cx+x,ly-9-y,L[k]);}}   // the chimney glowing
  P(A,cx,ly-13,L[5]);P(A,cx,ly-12,L[5]);hl(A,cx-1,ly-18,3,Bz[3]);
  if(NIGHT){warm(cx,ty-2,10,.5);}else warm(cx,ty-1,7,.2);
  cast(cx-8,cx+8,base);}
// =================================================================================== storage crates
if(K==='crates'){const R=RAMP.pine,base=H-3;
  // a plank crate: a top of boards with a lit front lip, a face of three boards with dark seams, corner posts lit on the left, a few nail heads
  const crate=(x,by,w,d,h,open)=>{const top=by-h-d;
    if(open){for(let j=0;j<d;j++)for(let i=0;i<w;i++){const rim=i<2||i>=w-2||j<2;P(A,x+i,top+j,rim?R[j<1?5:i<2?4:3]:RAMP.walnut[1]);}
      hl(A,x+2,top+2,w-4,R[2]);
      const ap=[[3,4],[7,3],[11,4],[15,3],[5,6],[9,6],[13,6],[17,5]];for(const [ax,ay] of ap){if(ax>w-4||ay>d)continue;const X=x+ax,Y=top+ay;P(A,X,Y,RAMP.red[5]);P(A,X+1,Y,RAMP.red[3]);P(A,X,Y+1,RAMP.red[3]);P(A,X+1,Y+1,RAMP.red[1]);P(A,X,Y-1,RAMP.green[3]);}}
    else{for(let j=0;j<d;j++)for(let i=0;i<w;i++){const seam=(i%6===5);P(A,x+i,top+j,R[seam?2:(j===0?5:4)]);}hl(A,x,top+d-1,w,R[5]);}
    const fy=top+d;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const b=Math.floor(j/Math.ceil(h/3));const seam=(j%Math.ceil(h/3)===0&&j>0);let k=seam?1:(b===0?3:b===1?3:2);if(j%Math.ceil(h/3)===1)k=4;P(A,x+i,fy+j,R[k]);}
    for(const px of [x,x+w-3]){for(let j=0;j<h;j++){P(A,px,fy+j,R[px===x?5:3]);P(A,px+1,fy+j,R[px===x?4:2]);P(A,px+2,fy+j,R[px===x?3:1]);}}
    for(let b=0;b<3;b++){const ny=fy+1+b*Math.ceil(h/3);P(A,x+1,ny,RAMP.ironW[4]);P(A,x+w-2,ny,RAMP.ironW[3]);}
    hl(A,x,by-1,w,R[1]);contact(x,by-1,w,.8);for(let i=0;i<w+3;i++){SH(x+i+1,by,150);SH(x+i+2,by+1,90);}};
  if(V==='S'){crate(3,base-6,24,8,16,false);crate(20,base,22,7,12,true);}
  if(V==='E'){crate(22,base-7,20,7,12,true);crate(3,base,24,8,16,false);}
  if(V==='N'){crate(4,base-7,22,7,12,true);crate(19,base,24,8,16,false);}
  for(let i=0;i<12;i++){const X=6+((hsh(i,1,SEED)*34)|0),Y=base-((hsh(i,2,SEED)*2)|0);if(!G(A,X,Y))P(B,X,Y,RAMP.ochre[2],160);}   // a few straws on the floor
}
// =================================================================================== the pantry shelf of jars
if(K==='jars'){const R=RAMP.pine,base=H-3,x0=2,w=W-4,topY=4;
  const CONT=[[RAMP.red,'cloth'],[RAMP.green,'tin'],[RAMP.ochre,'cloth'],[RAMP.plum,'tin'],[RAMP.red,'tin'],[RAMP.ochre,'tin'],[RAMP.green,'cloth'],[RAMP.cream,'cloth']];
  const jar=(x,by,w2,h,Cr,lid,lab)=>{for(let j=0;j<h;j++)for(let i=0;i<w2;i++){const sh=(j<2&&(i===0||i===w2-1));if(sh)continue;let c=Cr[i===0?4:i===w2-1?1:(j<h*.3?3:2)];if(j<2)c=RAMP.glass[i===1?5:3];P(A,x+i,by-h+j,c);}
    P(A,x+1,by-h+3,RAMP.ivory[5]);P(A,x+1,by-h+4,RAMP.ivory[4]);                                                          // the glass glint
    if(lid==='cloth'){hl(A,x-1,by-h-1,w2+2,RAMP.red[4]);hl(A,x,by-h,w2,RAMP.cream[4]);P(A,x-1,by-h,RAMP.red[3]);P(A,x+w2,by-h,RAMP.red[2]);hl(A,x,by-h+1,w2,RAMP.brass[1]);}
    else{hl(A,x,by-h-1,w2,RAMP.ironW[4]);hl(A,x,by-h,w2,RAMP.ironW[2]);}
    if(lab){rect(A,x+1,by-h+Math.round(h*.45),w2-2,3,RAMP.cream[4]);hl(A,x+1,by-h+Math.round(h*.45),w2-2,RAMP.cream[5]);P(A,x+2,by-h+Math.round(h*.45)+1,RAMP.walnut[2]);}};
  if(V==='S'){
    rect(A,x0+2,topY+4,w-4,base-topY-8,RAMP.walnut[2]);for(let x=x0+6;x<x0+w-4;x+=8)vl(A,x,topY+4,base-topY-8,RAMP.walnut[1]);   // the back boards, a step lighter than the jars' darks
    for(const px of [x0,x0+w-3]){rect(A,px,topY+2,3,base-topY-1,R[3]);vl(A,px,topY+2,base-topY-1,R[5]);vl(A,px+2,topY+2,base-topY-1,R[1]);}
    box3(x0-1,topY-1,w+2,3,3,R,{});
    const shelves=[topY+22,topY+42,topY+62];for(const sy of shelves){hl(A,x0+3,sy,w-6,R[5]);hl(A,x0+3,sy+1,w-6,R[3]);hl(A,x0+3,sy+2,w-6,R[1]);for(let x=x0+3;x<x0+w-3;x++)SH(x,sy+3,120);}
    let rng=SEED*7+1;const rr=()=>{rng=(rng*1103515245+12345)&0x7fffffff;return rng/0x7fffffff;};
    [topY+4,shelves[0]+3,shelves[1]+3].forEach((ry,ri)=>{const by=[shelves[0],shelves[1],shelves[2]][ri];let x=x0+4;
      while(x<x0+w-9){if(rr()<.12){x+=3;continue;}const w2=5+((rr()*3)|0),h=8+((rr()*5)|0);const [Cr,lid]=CONT[(rr()*CONT.length)|0];jar(x,by,w2,h,Cr,lid,rr()<.5);x+=w2+1+((rr()*2)|0);}});
    // the floor shelf: a stoneware crock and a basket of potatoes
    {const cx=x0+12,by=base-3;for(let j=0;j<11;j++){const ww=j<1?4:j<9?5:4;for(let i=-ww;i<=ww;i++)P(A,cx+i,by-11+j,RAMP.stone[i<-ww+2?5:i>ww-2?2:(j<3?4:3)]);}hl(A,cx-3,by-11,7,RAMP.stone[1]);hl(A,cx-5,by-7,11,RAMP.blue[3]);}
    {const bx=x0+w-24,by=base-3;for(let j=0;j<7;j++)for(let i=0;i<16;i++)P(A,bx+i,by-7+j,RAMP.ochre[(i+j)%3===0?2:(j===0?4:3)]);
      for(const [px,py] of [[2,-9],[5,-10],[8,-9],[11,-10],[4,-8],[9,-8],[13,-8]]){P(A,bx+px,by+py,RAMP.oak[5]);P(A,bx+px+1,by+py,RAMP.oak[4]);P(A,bx+px,by+py+1,RAMP.oak[3]);P(A,bx+px+1,by+py+1,RAMP.oak[2]);}}
    box3(x0,base-3,w,0,4,R,{});under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const sw=W-6,sx=3;   // the side: a framed end panel set back so a sliver of jars shows at the open edge
    box3(sx-1,topY-1,sw+2,4,3,R,{topDir:'y'});rect(A,sx,topY+6,sw-3,base-topY-10,R[2]);for(let y=topY+6;y<base-4;y++){P(A,sx,y,R[4]);P(A,sx+1,y,R[3]);P(A,sx+sw-4,y,R[1]);}
    panel(sx+3,topY+9,sw-9,30,R);panel(sx+3,topY+43,sw-9,30,R);
    for(const [a,b,i] of [[topY+8,topY+22,0],[topY+26,topY+42,1],[topY+46,topY+62,2]]){for(let y=b-9;y<b;y++){const C=CONT[(i*3+(y>>2))%CONT.length][0];P(A,sx+sw-3,y,C[3]);P(A,sx+sw-2,y,C[1]);}P(A,sx+sw-3,b-10,RAMP.red[4]);P(A,sx+sw-2,b-10,RAMP.cream[4]);P(A,sx+sw-3,b-6,RAMP.ivory[5]);}
    for(const sy of [topY+22,topY+42,topY+62]){P(A,sx+sw-3,sy,R[5]);P(A,sx+sw-2,sy,R[4]);P(A,sx+sw-3,sy+1,R[2]);}
    box3(sx,base-4,sw-2,0,5,R,{facePw:6});under(sx,sx+sw,base,base);cast(sx,sx+sw,base);}
  if(V==='N'){box3(x0-1,topY-1,w+2,3,3,R,{});for(let y=topY+5;y<base-4;y++)for(let x=x0;x<x0+w;x++){const u=(x-x0)%8;P(A,x,y,R[u===0?1:u===1?4:u===7?2:3]);}
    for(const by of [topY+14,base-18]){hl(A,x0+1,by,w-2,R[5]);hl(A,x0+1,by+1,w-2,R[3]);hl(A,x0+1,by+2,w-2,R[1]);for(let x=x0+4;x<x0+w-3;x+=9)P(A,x,by+1,RAMP.ironW[4]);}
    vl(A,x0,topY+5,base-topY-9,R[5]);vl(A,x0+w-1,topY+5,base-topY-9,R[1]);box3(x0,base-4,w,0,5,R,{});under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
// =================================================================================== the rocking chair
if(K==='rocker'){const R=RAMP.oak,Q=RAMP.pine,base=H-3;
  const post=(x,y0,y1,w)=>{for(let y=y0;y<y1;y++){P(A,x,y,R[4]);for(let i=1;i<w-1;i++)P(A,x+i,y,R[3]);P(A,x+w-1,y,R[1]);}};
  const cushion=(x,y,w,d)=>{for(let j=0;j<d;j++)for(let i=0;i<w;i++){const ck=((i>>1)+(j>>1))%2===0;P(A,x+i,y+j,ck?RAMP.red[j===0?5:4]:RAMP.cream[j===0?5:3]);}
    hl(A,x,y+d,w,RAMP.red[2]);P(A,x+2,y+d+1,RAMP.cream[2]);P(A,x+w-3,y+d+1,RAMP.cream[2]);};   // a checked pad with two ties hanging
  if(V==='S'||V==='N'){const cx=W>>1,sx=cx-9,sw=19,sy=29,back=V==='N';
    // the runners seen from the front: each one a lighter pine strip under its legs, its tip curling up well in front of the feet
    for(const rx of [sx-1,sx+sw-3]){for(let y=base-6;y<=base;y++){P(A,rx,y,Q[5]);P(A,rx+1,y,Q[4]);P(A,rx+2,y,Q[3]);P(A,rx+3,y,Q[1]);}
      if(!back){P(A,rx+1,base+1,Q[4]);P(A,rx+2,base+1,Q[2]);hl(A,rx,base-7,4,Q[5]);}else{hl(A,rx,base-7,4,Q[5]);P(A,rx+1,base+1,Q[3]);}}
    for(const lx of [sx,sx+sw-3])post(lx,sy+4,base-5,3);                                                                     // front legs (rear legs hide behind them)
    const drawBack=()=>{for(const px of [sx+1,sx+sw-3])post(px,8,sy+1,2);                                                    // the back posts
      for(let x=sx+1;x<sx+sw-1;x++){const u=(x-cx)/(sw/2),y=Math.round(6-(1-u*u)*3);for(let j=0;j<3;j++)P(A,x,y+j,R[j===0?5:j===1?3:1]);}   // the arched crest rail
      for(const [k,dx] of [[0,4],[1,7],[2,10],[3,13]]){const x=sx+dx+(k>1?1:0);for(let y=9;y<sy;y++){P(A,x,y,R[4]);P(A,x+1,y,R[2]);}}};   // four spindles, a little uneven
    const drawSeat=()=>{box3(sx-1,sy-1,sw+2,4,3,R,{topPw:4});if(!back)cushion(sx+1,sy-1,sw-2,3);};
    if(!back){drawBack();drawSeat();}else{drawSeat();for(let y=sy-1;y<sy+2;y++)for(let x=sx+2;x<sx+sw-2;x+=3)P(A,x,y,RAMP.red[3]);drawBack();}
    for(const [ax,dir] of [[sx-4,-1],[sx+sw+1,1]]){for(let y=18;y<sy+1;y++){P(A,ax,y,R[y===18?5:4]);P(A,ax+1,y,R[y===18?5:3]);P(A,ax+2,y,R[1]);}hl(A,ax-1,18,4,R[5]);   // the arms running toward you, their turned front posts
      for(let y=sy+1;y<sy+5;y++){P(A,ax,y,R[3]);P(A,ax+1,y,R[2]);}}
    fadeUnder(sx,sx+sw,sy+4,base-6);cast(sx-2,sx+sw+1,base);}
  if(V==='E'){   // in profile, facing right: one long runner rocking on its curve, the back raked, the arm reaching forward
    const y=x=>Math.round(base-1-Math.pow((x-21)/19,2)*6);for(let x=2;x<=40;x++){const yy=y(x);P(A,x,yy-1,Q[5]);P(A,x,yy,Q[4]);P(A,x,yy+1,Q[2]);}
    P(A,1,y(2)-3,Q[5]);P(A,2,y(2)-2,Q[4]);P(A,41,y(40)-3,Q[5]);P(A,40,y(40)-2,Q[4]);                                          // the curled tips
    const sy=28;post(12,sy+2,y(13)-1,3);post(29,sy+2,y(30)-1,3);                                                               // rear and front legs
    for(let t=0;t<=22;t++){const x=Math.round(13-t*.32),yy=sy-t;P(A,x,yy,R[5]);P(A,x+1,yy,R[3]);P(A,x+2,yy,R[1]);}               // the raked back post
    for(let t=4;t<=20;t+=4){const x=Math.round(13-t*.32);P(A,x+3,sy-t,R[2]);}hl(A,6,sy-23,5,R[5]);hl(A,6,sy-22,5,R[2]);       // the spindles' edges, the crest
    rect(A,11,sy-1,22,3,R[3]);hl(A,11,sy-1,22,R[5]);hl(A,11,sy+1,22,R[1]);cushion(14,sy-3,16,2);                                // the seat and its pad
    for(let x=10;x<=32;x++){const yy=sy-11+Math.round((x-10)*.08);P(A,x,yy,R[5]);P(A,x,yy+1,R[2]);}post(30,sy-9,sy-1,2);         // the arm and its front post
    fadeUnder(12,31,sy+2,base-3);cast(4,38,base);}}
// =================================================================================== the braided rug (flat: the turned copy is the same rug lying the other way)
if(K==='rug'){const cx=(W-1)/2,cy=(H-2)/2,rx=(W-4)/2,ry=(H-5)/2;
  const BANDS=[RAMP.red,RAMP.ochre,RAMP.plum,RAMP.green,RAMP.ochre,RAMP.red,RAMP.cream,RAMP.plum,RAMP.ochre,RAMP.red];const N=BANDS.length;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=(x-cx)/rx,v=(y-cy)/ry,t=Math.sqrt(u*u+v*v);if(t>1)continue;
    const bi=Math.min(N-1,Math.floor((1-t)*N*1.0));const Rb=BANDS[bi];const f=((1-t)*N)%1;
    const ang=Math.atan2(v,u),circ=Math.max(8,(1-bi/N)*2*Math.PI*Math.max(rx,ry)*.8);let ph=Math.floor((ang/(2*Math.PI))*circ/2.2+bi*.5+(f<.5?0:.5));
    let k=(ph%2===0)?3:2;if(f<.18)k=1;if(f>.82)k=Math.min(5,k+1);const lit=-(u*.5+v*.7);if(lit>.35)k=Math.min(5,k+1);if(lit<-.5)k=Math.max(0,k-1);
    if(t>.965)k=Math.max(0,k-1);P(A,x,y,Rb[k]);}
  for(let x=0;x<W;x++)for(let y=0;y<H;y++){if(G(A,x,y)&&!G(A,x,y+1))SH(x,y+1,120);}}
// =================================================================================== the bed (quilt variants)
if(K==='bed'){const R=RAMP.walnut,base=H-3,x0=6,w=W-12,Q=CFG.q||'a';
  const QUILT={a:[RAMP.brick,RAMP.green,RAMP.cream],b:[RAMP.blue,RAMP.cream,RAMP.blue],c:[RAMP.green,RAMP.green,RAMP.ochre],d:[RAMP.ochre,RAMP.brick,RAMP.ochre],e:[RAMP.plum,RAMP.brick,RAMP.cream]}[Q];
  const post=(x,y0,y1)=>{for(let y=y0;y<y1;y++){P(A,x,y,R[5]);P(A,x+1,y,R[4]);P(A,x+2,y,R[3]);P(A,x+3,y,R[1]);}const b=(y0+3);hl(A,x-1,b,6,R[4]);hl(A,x-1,b+1,6,R[2]);
    for(let i=0;i<3;i++)hl(A,x+(i===0?1:0),y0-3+i,i===0?2:4,R[i===0?5:4]);};
  // the headboard: a lit top rail, a raised panel with three spindles, posts with finials
  const hy=5,hb=19;rect(A,x0,hy+3,w,hb-hy-3,R[2]);hl(A,x0,hy+2,w,R[5]);hl(A,x0,hy+3,w,R[3]);panel(x0+4,hy+6,w-8,hb-hy-8,R);
  for(const sx of [x0+12,x0+(w>>1)-1,x0+w-14]){vl(A,sx,hy+7,hb-hy-10,R[4]);vl(A,sx+1,hy+7,hb-hy-10,R[1]);}
  post(x0-3,hy,hb+6);post(x0+w-1,hy,hb+6);
  // the mattress top: pillow, the sheet turned down, the quilt; the quilt hangs over both sides
  const my=hb-2,fy=H-13;
  for(let y=my;y<fy;y++)for(let x=x0;x<x0+w;x++)P(A,x,y,RAMP.cream[2]);
  {const px0=x0+5,pw=w-10;for(let j=0;j<9;j++)for(let i=0;i<pw;i++){const ex=Math.min(i,pw-1-i);if(ex<2&&(j<2||j>6))continue;const l=j<3?5:j<6?4:3;P(A,px0+i,my+1+j,RAMP.cream[ex<2?Math.max(2,l-1):l]);}
    hl(A,px0+3,my+9,pw-6,RAMP.cream[1]);for(let j=2;j<7;j++)P(A,px0+(pw>>1),my+1+j,RAMP.cream[3]);}                                    // a plump pillow with a dent
  const qy=my+12;for(let x=x0-1;x<x0+w+1;x++){P(A,x,qy,RAMP.cream[5]);P(A,x,qy+1,RAMP.cream[4]);P(A,x,qy+2,RAMP.cream[2]);}               // the sheet turned down: a broad lit crest
  for(let y=qy+3;y<fy;y++)for(let x=x0;x<x0+w;x++){const i=Math.floor((x-x0)/7),j=Math.floor((y-qy-3)/7);const C=QUILT[(i+j*2)%3];
    const st=((x-x0)%7===0)||((y-qy-3)%7===0);const l=(y-qy)/(fy-qy);let k=st?2:(l<.3?4:3);if(((x-x0)%7===1||(y-qy-3)%7===1)&&!st)k=Math.min(5,k+1);P(A,x,y,C[k]);}
  for(let y=qy+3;y<fy+4;y++){for(const [sx,k] of [[x0-2,3],[x0-1,2],[x0+w,2],[x0+w+1,1]]){const C=QUILT[(Math.floor((y-qy)/7))%3];P(A,sx,y,C[k]);}}   // the drape over the sides
  // the footboard: lower than the head, a lit rail, a raised panel, posts
  const fb=fy;rect(A,x0,fb,w,base-fb-2,R[2]);hl(A,x0,fb,w,R[5]);hl(A,x0,fb+1,w,R[3]);panel(x0+4,fb+3,w-8,base-fb-6,R);hl(A,x0,base-3,w,R[1]);
  post(x0-3,fb-2,base-2);post(x0+w-1,fb-2,base-2);
  cast(x0-3,x0+w+2,base);}
// =================================================================================== the wardrobe
if(K==='wardrobe'){const R=RAMP.walnut,base=H-3,x0=4,w=W-8;
  const top=6;box3(x0-2,top-3,w+4,3,4,R,{});for(let x=x0;x<x0+w;x+=3)P(A,x,top+3,R[1]);                                   // the crown, overhanging, a dentil row under it
  box3(x0,top+5,w,0,base-top-14,R,{facePw:7});
  const dw=(w-6)>>1;for(const dx of [x0+3,x0+3+dw]){rect(A,dx,top+8,dw,base-top-22,R[2]);frame(A,dx,top+8,dw,base-top-22,R[4],R[0]);   // two tall doors
    panel(dx+3,top+11,dw-6,30,R);panel(dx+3,top+45,dw-6,base-top-61,R);}
  vl(A,x0+3+dw,top+8,base-top-22,R[0]);for(const kx of [x0+1+dw,x0+4+dw]){rect(A,kx,top+40,2,4,RAMP.brass[3]);P(A,kx,top+40,RAMP.brass[5]);P(A,kx+1,top+43,RAMP.brass[1]);}   // the pulls
  P(A,x0+3+dw-2,top+36,RAMP.walnut[0]);P(A,x0+3+dw-2,top+37,RAMP.walnut[0]);                                                // a keyhole
  box3(x0-1,base-14,w+2,0,8,R,{facePw:6});hl(A,x0-1,base-14,w+2,R[5]);                                                     // the plinth
  for(const fx of [x0,x0+w-6]){for(let j=0;j<6;j++){const ww=6-Math.floor(j*.6);rect(A,fx+(fx===x0?0:6-ww),base-6+j,ww,1,R[j===0?4:2]);}}   // bracket feet
  under(x0,x0+w,base-5,base);cast(x0-1,x0+w+1,base);}
// =================================================================================== the dish hutch (cabinet)
if(K==='cabinet'){const R=RAMP.oak,base=H-3,x0=3,w=W-6;
  const top=6;box3(x0-2,top-3,w+4,3,3,R,{});
  // the upper case: glazed doors over a rack of plates and cups
  box3(x0,top+3,w,0,40,R,{facePw:6});rect(A,x0+3,top+6,w-6,34,RAMP.walnut[1]);
  for(const sy of [top+17,top+29])hl(A,x0+3,sy,w-6,R[4]);
  for(let i=0;i<5;i++){const cx=x0+8+i*7;for(let y=top+8;y<top+17;y++){const t=(y-(top+12.5))/4.5;const ww=Math.round(3*Math.sqrt(Math.max(0,1-t*t)));for(let x=-ww;x<=ww;x++)P(A,cx+x,y,RAMP.ivory[x<0?5:x>1?3:4]);}P(A,cx,top+12,RAMP.blue[3]);P(A,cx+1,top+12,RAMP.blue[3]);}   // plates standing in the rack
  for(let i=0;i<4;i++){const cx=x0+8+i*9;rect(A,cx-2,top+24,5,5,RAMP.cream[4]);hl(A,cx-2,top+24,5,RAMP.cream[5]);vl(A,cx+2,top+24,5,RAMP.cream[2]);P(A,cx+3,top+25,RAMP.cream[3]);P(A,cx+3,top+26,RAMP.cream[3]);}   // cups
  for(let i=0;i<3;i++){const cx=x0+9+i*11;rect(A,cx-3,top+33,7,7,[RAMP.brick,RAMP.green,RAMP.ochre][i][3]);hl(A,cx-3,top+33,7,[RAMP.brick,RAMP.green,RAMP.ochre][i][5]);hl(A,cx-2,top+32,5,RAMP.cream[4]);}   // preserves
  const dw=(w-6)>>1;for(const dx of [x0+3,x0+3+dw]){frame(A,dx,top+6,dw,34,R[4],R[1]);vl(A,dx+(dw>>1),top+6,34,R[3]);hl(A,dx,top+18,dw,R[3]);hl(A,dx,top+30,dw,R[3]);   // glazing bars
    for(let y=top+8;y<top+38;y+=6)P(A,dx+2,y,RAMP.glass[5]);}
  // the counter ledge, then the lower cupboard
  box3(x0-2,top+43,w+4,5,3,R,{topPw:4});
  box3(x0,top+51,w,0,base-top-55,R,{facePw:7});for(const dx of [x0+3,x0+3+dw]){panel(dx,top+54,dw,base-top-62,R);knob(dx+(dx===x0+3?dw-4:2),top+66);}
  box3(x0-1,base-4,w+2,0,4,R,{});under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== the wood stove
if(K==='stove'){const I=RAMP.ironW,base=H-3,cx=W>>1,x0=cx-15,w=30;
  const top=base-30;
  for(let y=0;y<top-1;y++){const band=(y%9===0);for(let x=-2;x<=2;x++)P(A,cx+3+x,y,band?I[4]:I[x<-1?4:x>1?1:2]);}             // the stovepipe, banded
  for(let x=-3;x<=3;x++)P(A,cx+3+x,top-1,I[3]);
  for(let j=0;j<8;j++)for(let i=0;i<w;i++)P(A,x0+i,top+j,I[j===0?4:(i<2?3:j===7?4:2)]);                                        // the top plate
  for(const bx of [x0+8,x0+21]){for(let j=0;j<5;j++)for(let i=-4;i<=4;i++){const d=i*i/16+(j-2)*(j-2)/4;if(d>1)continue;P(A,bx+i,top+1+j,d>.6?I[1]:(i<0&&j<2?I[4]:I[3]));}P(A,bx-1,top+2,RAMP.steel[2]);}   // two lids with rims, a cool glint
  rect(A,x0,top+8,w,18,I[2]);vl(A,x0,top+8,18,RAMP.steel[1]);vl(A,x0+1,top+8,18,I[3]);vl(A,x0+w-1,top+8,18,I[0]);hl(A,x0,top+8,w,I[4]);   // the body, a cool rim on its lit side
  rect(A,x0+6,top+11,18,10,I[1]);frame(A,x0+6,top+11,18,10,I[4],I[0]);                                                         // the fire door
  for(let i=0;i<4;i++){const gx=x0+9+i*4;for(let y=top+13;y<top+19;y++)P(A,gx,y,RAMP.lit[y>top+15?(NIGHT?5:4):(NIGHT?4:2)]);}           // glowing slits in the grille
  rect(A,x0+w-6,top+15,3,2,RAMP.brass[3]);P(A,x0+w-6,top+15,RAMP.brass[5]);                                                        // the latch
  hl(A,x0+8,top+23,14,I[4]);hl(A,x0+8,top+24,14,I[1]);rect(A,x0+13,top+23,4,1,RAMP.brass[4]);                                     // the ash drawer
  for(const lx of [x0+1,x0+w-4]){for(let y=top+26;y<base;y++){P(A,lx,y,I[3]);P(A,lx+1,y,I[2]);P(A,lx+2,y,I[1]);}hl(A,lx-1,base-1,5,I[2]);}   // cabriole legs
  if(NIGHT){for(let x=-10;x<=10;x++)for(let j=0;j<3;j++){const a=Math.max(0,160-Math.abs(x)*14-j*40);if(a)P(B,cx+x,base-1+j,[255,150,60],a);}warm(cx,top+16,12,.25);}
  fadeUnder(x0+3,x0+w-4,top+26,base-1);cast(x0,x0+w,base);}
// =================================================================================== the shop counter
if(K==='counter'){const R=RAMP.oak,base=H-3,x0=3,w=W-6;
  const top=base-26;box3(x0-1,top,w+2,9,3,R,{topPw:4});
  box3(x0,top+12,w,0,base-top-14,RAMP.walnut,{facePw:8});for(let i=0;i<5;i++){const pw=Math.floor((w-8)/5);panel(x0+4+i*pw,top+15,pw-3,base-top-21,RAMP.walnut);}
  hl(A,x0,base-2,w,RAMP.walnut[0]);
  // the till: a brass cash register with keys and a drawer
  {const tx=x0+w-30,ty=top-10;rect(A,tx,ty+4,18,10,RAMP.brass[3]);hl(A,tx,ty+4,18,RAMP.brass[5]);vl(A,tx,ty+4,10,RAMP.brass[4]);vl(A,tx+17,ty+4,10,RAMP.brass[1]);
    rect(A,tx+3,ty,12,4,RAMP.brass[2]);hl(A,tx+3,ty,12,RAMP.brass[4]);rect(A,tx+5,ty+1,8,2,RAMP.ivory[4]);P(A,tx+6,ty+1,RAMP.walnut[1]);P(A,tx+9,ty+1,RAMP.walnut[1]);   // its sign window
    for(let j=0;j<2;j++)for(let i=0;i<5;i++){P(A,tx+3+i*3,ty+6+j*3,RAMP.ivory[5]);P(A,tx+3+i*3,ty+7+j*3,RAMP.walnut[2]);}hl(A,tx+1,ty+13,16,RAMP.brass[1]);contact(tx,ty+14,18);}
  {const jx=x0+12,jy=top-8;rect(A,jx,jy,8,9,RAMP.glass[2]);for(let y=jy+2;y<jy+9;y++)for(let x=jx+1;x<jx+7;x++)P(A,x,y,[RAMP.brick,RAMP.ochre,RAMP.green][((x+y)>>1)%3][4]);
    vl(A,jx+1,jy+2,6,RAMP.ivory[5]);hl(A,jx,jy-1,8,RAMP.ironW[4]);hl(A,jx,jy,8,RAMP.ironW[2]);contact(jx,jy+9,8);}            // a jar of humbugs
  {const lx=x0+26,ly=top+2;rect(A,lx,ly,12,5,RAMP.brick[2]);hl(A,lx,ly,12,RAMP.cream[5]);hl(A,lx,ly+1,12,RAMP.cream[3]);vl(A,lx+6,ly,5,RAMP.brick[1]);}   // the ledger, open
  {const bx=x0+44,by=top+3;for(let i=-2;i<=2;i++)P(A,bx+i,by,RAMP.brass[i<0?5:3]);hl(A,bx-3,by+1,7,RAMP.brass[2]);P(A,bx,by-1,RAMP.brass[4]);}            // a bell
  under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== the kitchen counter
if(K==='kcounter'){const R=RAMP.oak,base=H-3,x0=3,w=W-6;
  const top=base-28;box3(x0-1,top,w+2,10,3,R,{topPw:4});
  // a white enamel basin set in the top, a cast-iron hand pump at its back
  {const sx=x0+w-30,sy=top+2;rect(A,sx,sy,20,7,RAMP.ivory[4]);hl(A,sx,sy,20,RAMP.ivory[2]);rect(A,sx+2,sy+1,16,5,RAMP.glass[2]);hl(A,sx+2,sy+1,16,RAMP.ivory[1]);hl(A,sx+3,sy+3,8,RAMP.glass[4]);hl(A,sx,sy+6,20,RAMP.ivory[5]);
    const px=sx+15;for(let y=sy-14;y<sy+1;y++){P(A,px,y,RAMP.ironW[4]);P(A,px+1,y,RAMP.ironW[2]);P(A,px+2,y,RAMP.ironW[1]);}
    for(let i=0;i<6;i++)P(A,px-1-i,sy-10+Math.round(i*.5),RAMP.ironW[3]);P(A,px-7,sy-7,RAMP.ironW[2]);P(A,px-7,sy-6,RAMP.glass[5]);   // the spout
    for(let i=0;i<7;i++)P(A,px+3+i,sy-13-Math.round(i*.4),RAMP.ironW[i<1?4:3]);P(A,px+10,sy-17,RAMP.ironW[4]);}                         // the handle
  {const bx=x0+6,by=top+2;rect(A,bx,by,16,7,RAMP.pine[4]);hl(A,bx,by,16,RAMP.pine[5]);hl(A,bx,by+6,16,RAMP.pine[2]);                   // a bread board with a loaf and a knife
    for(let j=0;j<4;j++)for(let i=0;i<9;i++)P(A,bx+3+i,by+1+j,RAMP.ochre[j===0?5:(i<2?4:3)]);hl(A,bx+4,by+1,6,RAMP.ochre[5]);
    hl(A,bx+3,by+6,10,RAMP.steel[4]);hl(A,bx+13,by+6,3,RAMP.walnut[1]);}
  {const cx=x0+29,cy=top-2;rect(A,cx-3,cy,7,10,RAMP.stone[3]);vl(A,cx-3,cy,10,RAMP.stone[5]);vl(A,cx+3,cy,10,RAMP.stone[1]);hl(A,cx-3,cy+3,7,RAMP.blue[3]);hl(A,cx-3,cy-1,7,RAMP.stone[4]);
    for(const [dx,h] of [[-1,4],[0,6],[1,5]])vl(A,cx+dx,cy-h,h,RAMP.pine[dx===0?5:3]);}                                                  // a crock of spoons
  box3(x0,top+13,w,0,base-top-15,R,{facePw:7});const dw=Math.floor((w-6)/2);for(const dx of [x0+3,x0+3+dw]){panel(dx,top+16,dw-1,base-top-22,R);knob(dx+(dx===x0+3?dw-5:2),top+24);}
  under(x0,x0+w,base,base);cast(x0,x0+w,base);}
const flat=flatten([A,B],W,H);const O=outline(flat);for(let i=0;i<O.d.length;i+=4)if(O.d[i+3]){O.d[i]=Math.max(O.d[i],40);O.d[i+1]=Math.max(O.d[i+1],25);O.d[i+2]=Math.max(O.d[i+2],22);}const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
