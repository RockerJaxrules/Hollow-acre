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
  olive:hexR(['#1a1d18','#2a3027','#3d4638','#525d4b','#6b7862','#8a957e']),
  bluegrey:hexR(['#22282f','#333c46','#48525e','#606b77','#7b8691','#96a0aa']),
  burlap:hexR(['#2e2418','#4a3a26','#6b5638','#8a7350','#a68f68','#c2ac84']),
  straw:hexR(['#3a2e12','#5e4a1c','#836a2a','#a68a3c','#c2a654','#dcc274']),
  bark:hexR(['#1a120d','#2b1e16','#3e2c20','#54402e','#6c553e','#866d50']),
  rust:hexR(['#24100e','#3c1814','#5c221b','#7a2e22','#963d2b','#ad5139']),
  charcoal:hexR(['#141214','#1f1c1f','#2c282b','#3a3538','#4b4548','#5e595c']),
  pumpkin:hexR(['#3a1a0c','#5e2c12','#88421a','#a8571f','#c0712c','#d48c44']),
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
  if(V==='W'){const w=22,x0=(W-w)>>1,d=39,top=base-30-d+8;
    box3(x0-1,top,w+2,d,4,R,{topDir:'y',topPw:4});for(let y=top+1;y<top+d-1;y++)for(let x=x0;x<x0+w;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.1));}vl(A,x0-1,top+1,d-1,R[5]);
    for(let y=top-2;y<top+d-4;y++){P(A,x0+w-2,y,R[4]);P(A,x0+w-1,y,R[1]);if((y-top)%6===0)P(A,x0+w-3,y,R[0]);}                         // the gallery lip along the back (right) edge
    rect(A,x0+3,top+d-14,3,3,RAMP.walnut[0]);hl(A,x0+3,top+d-14,3,RAMP.glass[3]);ln(A,x0+5,top+d-15,x0+9,top+d-21,RAMP.ivory[5]);ln(A,x0+6,top+d-15,x0+10,top+d-20,RAMP.ivory[3]);   // the quill and inkwell, nearer now
    rect(A,x0+4,top+10,8,9,RAMP.cream[4]);vl(A,x0+4,top+10,9,RAMP.cream[5]);for(let j=0;j<4;j++)hl(A,x0+5,top+12+j*2,5,RAMP.cream[1]);lamp(x0+16,top+6);   // the letter, the lamp far off
    box3(x0+1,top+d+4,w-2,0,base-top-d-4,R,{facePw:6});panel(x0+4,top+d+7,w-8,base-top-d-12,R);                                             // the pedestal's end, solid to the floor
    for(let k=0;k<2;k++){const dy=top+d+6+k*7;vl(A,x0,dy,6,R[4]);vl(A,x0-1,dy,6,R[2]);P(A,x0-1,dy+2,RAMP.brass[4]);}                      // a sliver of its drawer fronts on the left, knobs catching light
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='N'){const x0=3,w=W-6,top=base-30;   // the back: the gallery is now the nearest edge, its back panel rising in front of the top; the letter and the lamp beyond it
    box3(x0-1,top-8,w+2,16,4,R,{topPw:3});lamp(x0+w-8,top-12);rect(A,x0+30,top-6,10,5,RAMP.cream[4]);hl(A,x0+30,top-6,10,RAMP.cream[5]);ln(A,x0+20,top-4,x0+24,top-9,RAMP.ivory[5]);
    box3(x0,top+2,w,0,6,R,{facePw:3,faceK:2});hl(A,x0,top+2,w,R[5]);
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
  const end=(tap)=>{const cx=W>>1,cy=base-13,r=10,L=22;stand(cx-11,22);
    for(let t=L;t>=1;t--)for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;const yy=cy-t+y;if(G(A,cx+x,yy))continue;
      const u=x/r,bel=Math.sin(Math.PI*t/(L+1))*.0;let k=u<-.6?4:u<.25?5:u<.65?4:3;if(((x+r+1)%4)===0)k=Math.max(2,k-2);if(Math.abs(u)>.9)k=2;P(A,cx+x,yy,R[k]);}
    for(const ht of [5,L-3])for(let x=-r+1;x<r;x++){const y=-Math.round(Math.sqrt(r*r-x*x));P(A,cx+x,cy-ht+y,I[x<-3?3:2]);P(A,cx+x,cy-ht+y+1,I[1]);}   // two hoops across the body
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=(x*x+y*y)/(r*r);if(d>1)continue;let c;
      if(d>.8)c=I[d>.93?1:(x<0&&y<0?3:2)];else{const l=(-x-y)/r;c=RAMP.pine[l>.5?5:l>-.3?4:3];if(y%4===0&&Math.abs(x)<r-3)c=RAMP.pine[3];}P(A,cx+x,cy+y,c);}
    P(A,cx+4,cy-3,RAMP.walnut[1]);P(A,cx+5,cy-3,RAMP.walnut[0]);rect(A,cx-1,cy-L-r-1,3,2,RAMP.walnut[1]);                                // the bung on top, far along
    if(tap){rect(A,cx-1,cy+4,3,3,RAMP.brass[3]);hl(A,cx-1,cy+4,3,RAMP.brass[5]);vl(A,cx,cy+7,3,RAMP.brass[2]);P(A,cx,cy+10,RAMP.brass[4]);}else{P(A,cx-5,cy+5,RAMP.cream[4]);P(A,cx-4,cy+5,RAMP.cream[4]);P(A,cx-3,cy+6,RAMP.cream[3]);}
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
  const runUp=(cx,w,x0,yNear,L)=>{const Q=RAMP.pine;for(let y=yNear-L;y<yNear;y++){for(let x=x0+2;x<x0+w-2;x++){const t=(y-(yNear-L))/L;P(A,x,y,RAMP.brick[x<x0+4?5:(t<.2?4:(x>x0+w-5?2:3))]);}
      P(A,x0,y,Q[5]);P(A,x0+1,y,Q[4]);P(A,x0+w-2,y,Q[3]);P(A,x0+w-1,y,Q[1]);}                                                        // two pale rails with the bedding between
    for(let y=yNear-L+3;y<yNear-2;y+=4){P(A,x0+2,y,RAMP.brick[2]);P(A,x0+w-3,y,RAMP.brick[1]);}};                                     // the cover's folds over the rails
  if(V==='W'){const cx=W>>1,w=18,x0=cx-9,yN=base-12,L=26;   // the foot end toward you: the bedding and rails run away up the screen, the hood's open mouth far off, the low foot board near
    shellArch(cx,yN-L+4,9,12,true);hl(A,cx-4,yN-L+2,8,RAMP.ivory[5]);hl(A,cx-4,yN-L+3,8,RAMP.ivory[3]);
    runUp(cx,w,x0,yN,L-6);hl(A,x0+3,yN-L+7,w-6,RAMP.cream[5]);hl(A,x0+3,yN-L+8,w-6,RAMP.cream[3]);
    box3(x0,yN-1,w,2,6,R,{});for(let x=x0+3;x<x0+w-2;x+=4){vl(A,x,yN+1,5,R[1]);}                                                       // the low foot board, spindled
    feet(x0,w);under(x0,x0+w,base,base);cast(x0,x0+w,base);}
  if(V==='E'){const cx=W>>1,w=18,x0=cx-9,yN=base-12,L=26;   // the head end toward you: the bedding and rails run away to the low foot board far off; the hood's closed back near
    box3(x0,yN-L-2,w,2,4,R,{});runUp(cx,w,x0,yN,L);
    shellArch(cx,yN+3,9,12,false);panel(x0+4,yN-1,w-8,5,R);feet(x0,w);
    under(x0,x0+w,base,base);cast(x0,x0+w,base);}}
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
  if(V==='W'){crate(19,base-7,24,8,16,false);crate(3,base,22,7,12,true);}
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
  if(V==='E'){const sw=W-6,sx=3,TL=39,tY=topY+TL;   // the side: the top board runs up the screen (one camera for every view), then the framed end panel with a sliver of jars at the open edge
    box3(sx-1,tY-1-TL,sw+2,TL+4,3,R,{topDir:'y',topPw:4});for(let y=tY-TL;y<tY+2;y++)for(let x=sx;x<sx+sw;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.22));}vl(A,sx-1,tY-TL,TL+3,R[5]);for(let y=tY-TL+9;y<tY;y+=13)hl(A,sx,y,sw,R[2]);rect(A,sx,tY+6,sw-3,base-tY-10,R[2]);for(let y=tY+6;y<base-4;y++){P(A,sx,y,R[4]);P(A,sx+1,y,R[3]);P(A,sx+sw-4,y,R[1]);}
    panel(sx+3,tY+9,sw-9,30,R);panel(sx+3,tY+43,sw-9,30,R);
    for(const [a,b,i] of [[tY+8,tY+22,0],[tY+26,tY+42,1],[tY+46,tY+62,2]]){let y=b;let k=0;while(y>a+2){const hgt=6+((i*5+k*3)%5),C=CONT[(i*3+k)%CONT.length][0];for(let j=0;j<hgt&&y-j>a;j++){P(A,sx+sw-3,y-1-j,C[j===hgt-1?5:3]);P(A,sx+sw-2,y-1-j,C[1]);}y-=hgt+2;k++;}}   // jars of different heights and colours along the open edge
    for(const sy of [tY+22,tY+42,tY+62]){P(A,sx+sw-3,sy,R[5]);P(A,sx+sw-2,sy,R[4]);P(A,sx+sw-3,sy+1,R[2]);}
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
  const QUILT={a:[RAMP.brick,RAMP.green,RAMP.cream],b:[RAMP.blue,RAMP.bluegrey,RAMP.plum],c:[RAMP.green,RAMP.green,RAMP.ochre],d:[RAMP.ochre,RAMP.brick,RAMP.ochre],e:[RAMP.plum,RAMP.brick,RAMP.cream]}[Q];
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
  for(let y=qy+3;y<fy;y++)for(let x=x0;x<x0+w;x++){const j=Math.floor((y-qy-3)/7),off=Math.floor(hsh(j,3,SEED*5)*7),pw=6+((hsh(j,4,SEED)*3)|0),i=Math.floor((x-x0+off)/pw);const C=QUILT[Math.floor(hsh(i,j,SEED*9+Q.charCodeAt(0))*3)];
    const st=((x-x0+off)%pw===0)||((y-qy-3)%7===0);const l=(y-qy)/(fy-qy);let k=st?2:(l<.3?4:3);if((((x-x0+off)%pw)===1||(y-qy-3)%7===1)&&!st)k=Math.min(5,k+1);P(A,x,y,C[k]);}
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
  {const L=RAMP.lit,fy=top+19;rect(A,x0+7,top+12,16,8,[30,14,10]);for(const [fx,fh] of [[x0+10,6],[x0+14,8],[x0+19,5]]){for(let j=0;j<fh;j++){const ww=j<fh*.35?1:j<fh*.7?2:2;for(let i=-ww;i<ww;i++){const core=Math.abs(i+.5)<1&&j<fh-1&&j>0;P(A,fx+i,fy-j,core?L[NIGHT?5:5]:L[j>fh*.6?(NIGHT?4:3):(NIGHT?3:2)]);}}}
    hl(A,x0+7,fy,16,RAMP.ironW[4]);for(let i=0;i<16;i+=3)P(A,x0+7+i,fy-1,RAMP.ironW[3]);}                                            // flame tongues of uneven height, pale cores, behind a low grate
  rect(A,x0+w-6,top+15,3,2,RAMP.brass[3]);P(A,x0+w-6,top+15,RAMP.brass[5]);                                                        // the latch
  hl(A,x0+8,top+23,14,I[4]);hl(A,x0+8,top+24,14,I[1]);rect(A,x0+13,top+23,4,1,RAMP.brass[4]);                                     // the ash drawer
  for(const lx of [x0+1,x0+w-4]){for(let y=top+26;y<base;y++){P(A,lx,y,I[3]);P(A,lx+1,y,I[2]);P(A,lx+2,y,I[1]);}hl(A,lx-1,base-1,5,I[2]);}   // cabriole legs
  if(NIGHT){for(let x=-10;x<=10;x++)for(let j=0;j<3;j++){const a=Math.max(0,160-Math.abs(x)*14-j*40);if(a)P(B,cx+x,base-1+j,[255,150,60],a);}warm(cx,top+16,12,.25);}
  fadeUnder(x0+3,x0+w-4,top+26,base-1);cast(x0,x0+w,base);}
// =================================================================================== the shop counter
if(K==='counter'){const R=RAMP.oak,base=H-3,x0=3,w=W-6;
  const top=base-26;box3(x0-1,top,w+2,9,3,R,{topPw:4});
  box3(x0,top+12,w,0,base-top-14,RAMP.walnut,{facePw:8});{const pw=Math.floor((w-8)/5),dh=base-top-21;for(let i=0;i<5;i++){const dx=x0+4+i*pw,ajar=i===3,dy=top+15+(ajar?1:0);
      rect(A,dx-1,top+14,pw-1,dh+2,RAMP.plum[1]);                                                                                // the recess, plum-dark
      rect(A,dx,dy,pw-3,dh,R[3]);hl(A,dx,dy,pw-3,R[5]);vl(A,dx,dy,dh,R[4]);hl(A,dx,dy+dh-1,pw-3,R[1]);vl(A,dx+pw-4,dy,dh,R[2]);rect(A,dx+2,dy+2,pw-7,dh-4,R[2]);hl(A,dx+2,dy+2,pw-7,R[4]);
      const kx=dx+((pw-3)>>1)-1,ky=dy+(dh>>1)-1;if(i===1){P(A,kx,ky,RAMP.brass[5]);P(A,kx+1,ky,RAMP.brass[3]);P(A,kx-1,ky+1,RAMP.brass[4]);P(A,kx+2,ky+1,RAMP.brass[2]);P(A,kx,ky+2,RAMP.brass[3]);P(A,kx+1,ky+2,RAMP.brass[1]);}
      else knob(kx,ky);if(ajar)hl(A,dx,top+15,pw-3,RAMP.walnut[0]);}}
  hl(A,x0,base-2,w,RAMP.walnut[0]);
  // the till: a brass cash register with keys and a drawer
  {const tx=x0+w-30,ty=top-10;rect(A,tx,ty+4,18,10,RAMP.brass[3]);hl(A,tx,ty+4,18,RAMP.brass[5]);vl(A,tx,ty+4,10,RAMP.brass[4]);vl(A,tx+17,ty+4,10,RAMP.brass[1]);
    rect(A,tx+3,ty,12,4,RAMP.brass[2]);hl(A,tx+3,ty,12,RAMP.brass[4]);rect(A,tx+5,ty+1,8,2,RAMP.ivory[4]);P(A,tx+6,ty+1,RAMP.walnut[1]);P(A,tx+9,ty+1,RAMP.walnut[1]);   // its sign window
    for(let j=0;j<2;j++)for(let i=0;i<5;i++){P(A,tx+3+i*3,ty+6+j*3,RAMP.ivory[5]);P(A,tx+3+i*3,ty+7+j*3,RAMP.walnut[2]);}hl(A,tx+1,ty+13,16,RAMP.brass[1]);contact(tx,ty+14,18);}
  {const jx=x0+12,jy=top-8;rect(A,jx,jy,8,9,RAMP.glass[2]);for(let y=jy+2;y<jy+9;y++)for(let x=jx+1;x<jx+7;x++)P(A,x,y,[RAMP.brick,RAMP.ochre][((x+y)>>1)%2][(x<jx+3?3:2)]);
    vl(A,jx+1,jy+2,6,RAMP.ivory[5]);hl(A,jx,jy-1,8,RAMP.ironW[4]);hl(A,jx,jy,8,RAMP.ironW[2]);contact(jx,jy+9,8);}            // a jar of humbugs
  {const lx=x0+26,ly=top+2;rect(A,lx,ly,12,5,RAMP.brick[2]);hl(A,lx,ly,12,RAMP.cream[5]);hl(A,lx,ly+1,12,RAMP.cream[3]);vl(A,lx+6,ly,5,RAMP.brick[1]);}   // the ledger, open
  {const bx=x0+44,by=top+3;for(let i=-2;i<=2;i++)P(A,bx+i,by,RAMP.brass[i<0?5:3]);hl(A,bx-3,by+1,7,RAMP.brass[2]);P(A,bx,by-1,RAMP.brass[4]);}            // a bell
  under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== the kitchen counter
if(K==='kcounter'){const R=RAMP.oak,base=H-3,x0=3,w=W-6;
  const top=base-28;box3(x0-1,top,w+2,10,3,R,{topPw:4});
  // a white enamel basin set in the top, a cast-iron hand pump at its back
  {const sx=x0+w-30,sy=top+2;rect(A,sx,sy,20,7,RAMP.ivory[4]);hl(A,sx,sy,20,RAMP.ivory[2]);rect(A,sx+2,sy+1,16,5,RAMP.ivory[2]);hl(A,sx+2,sy+1,16,RAMP.ivory[4]);hl(A,sx+2,sy+2,16,RAMP.ivory[3]);rect(A,sx+3,sy+4,14,2,RAMP.glass[2]);hl(A,sx+4,sy+4,6,RAMP.glass[4]);P(A,sx+12,sy+5,RAMP.walnut[0]);hl(A,sx+1,sy+6,18,RAMP.ivory[1]);hl(A,sx,sy+7,20,RAMP.ivory[5]);
    const px=sx+12,I=RAMP.ironW;for(let y=sy-10;y<sy+1;y++){P(A,px,y,RAMP.steel[2]);P(A,px+1,y,I[4]);P(A,px+2,y,I[3]);P(A,px+3,y,I[1]);}   // the pump body, a cool rim on its lit side
    hl(A,px-1,sy-11,6,I[4]);hl(A,px-1,sy-10,6,I[2]);P(A,px+1,sy-12,I[5]);P(A,px+2,sy-12,I[3]);                                          // its cap
    rect(A,px-3,sy-7,3,2,I[3]);hl(A,px-3,sy-7,3,I[5]);P(A,px-3,sy-5,I[2]);P(A,px-3,sy-4,RAMP.glass[5]);                             // the spout out over the basin, a drip
    for(let i=0;i<5;i++)P(A,px+2-i,sy-13-i,i<1?I[3]:I[4]);P(A,px-3,sy-18,I[5]);P(A,px-4,sy-18,I[3]);}                               // the handle tilted up to the left
  {const bx=x0+6,by=top+2;rect(A,bx,by,16,7,RAMP.pine[4]);hl(A,bx,by,16,RAMP.pine[5]);hl(A,bx,by+6,16,RAMP.pine[2]);                   // a bread board with a loaf and a knife
    for(let j=0;j<4;j++)for(let i=0;i<9;i++)P(A,bx+3+i,by+1+j,RAMP.ochre[j===0?5:(i<2?4:3)]);hl(A,bx+4,by+1,6,RAMP.ochre[5]);
    hl(A,bx+3,by+6,10,RAMP.steel[4]);hl(A,bx+13,by+6,3,RAMP.walnut[1]);}
  {const cx=x0+29,cy=top-2;rect(A,cx-3,cy,7,10,RAMP.stone[3]);vl(A,cx-3,cy,10,RAMP.stone[5]);vl(A,cx+3,cy,10,RAMP.stone[1]);hl(A,cx-3,cy+3,7,RAMP.blue[3]);hl(A,cx-3,cy-1,7,RAMP.stone[4]);
    for(const [dx,h] of [[-1,4],[0,6],[1,5]])vl(A,cx+dx,cy-h,h,RAMP.pine[dx===0?5:3]);}                                                  // a crock of spoons
  box3(x0,top+13,w,0,base-top-15,R,{facePw:7});const dw=Math.floor((w-6)/2);for(const dx of [x0+3,x0+3+dw]){panel(dx,top+16,dw-1,base-top-22,R);knob(dx+(dx===x0+3?dw-5:2),top+24);}
  under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== shop shelves: tins, mail, parts (one frame, different stock)
if(K==='cans'||K==='mail'||K==='parts'){const R=K==='mail'?RAMP.oak:RAMP.pine,base=H-3,x0=2,w=W-4,topY=4;
  let rng=SEED*13+(K.length*7);const rr=()=>{rng=(rng*1103515245+12345)&0x7fffffff;return rng/0x7fffffff;};
  rect(A,x0+2,topY+4,w-4,base-topY-8,RAMP.walnut[2]);for(let x=x0+6;x<x0+w-4;x+=8)vl(A,x,topY+4,base-topY-8,RAMP.walnut[1]);
  for(const px of [x0,x0+w-3]){rect(A,px,topY+2,3,base-topY-1,R[3]);vl(A,px,topY+2,base-topY-1,R[5]);vl(A,px+2,topY+2,base-topY-1,R[1]);}
  box3(x0-1,topY-1,w+2,3,3,R,{});
  const n=K==='mail'?4:4,gap=Math.floor((base-topY-10)/n);const shelves=[];for(let i=1;i<=n;i++)shelves.push(topY+3+gap*i);
  for(const sy of shelves){hl(A,x0+3,sy,w-6,R[5]);hl(A,x0+3,sy+1,w-6,R[3]);hl(A,x0+3,sy+2,w-6,R[1]);for(let x=x0+3;x<x0+w-3;x++)SH(x,sy+3,120);}
  const rows=[topY+4].concat(shelves.slice(0,-1).map(v=>v+3));
  const LAB=[RAMP.brick,RAMP.green,RAMP.bluegrey,RAMP.ochre,RAMP.plum,RAMP.ochre];
  const tin=(x,by,w2,h,L)=>{for(let j=0;j<h;j++)for(let i=0;i<w2;i++){let c=i===0?RAMP.steel[3]:i===w2-1?RAMP.steel[1]:RAMP.steel[2];if(j>1&&j<h-1)c=L[i===0?4:i===w2-1?1:(j===2?4:3)];P(A,x+i,by-h+j,c);}
    hl(A,x,by-h,w2,RAMP.steel[4]);};
  const letters=(x,by,w2,h)=>{rect(A,x,by-h,w2,h,RAMP.walnut[1]);for(let i=0;i<w2;i++)P(A,x+i,by-h,RAMP.walnut[0]);
    const r=rr();if(r<.25)return;                                                                                                   // an empty cubby
    if(r<.42){const bh=6;rect(A,x+1,by-bh,w2-2,bh,RAMP.cream[2]);for(let j=0;j<bh;j+=2)hl(A,x+1,by-bh+j,w2-2,RAMP.cream[4]);vl(A,x+(w2>>1),by-bh,bh,RAMP.brick[2]);return;}   // a tied bundle
    if(r<.62){const n=1+((rr()*3)|0);for(let k=0;k<n;k++){hl(A,x+1,by-2-k*2,w2-2,RAMP.cream[4]);hl(A,x+1,by-1-k*2,w2-2,RAMP.cream[2]);}return;}   // a short flat stack
    if(r<.8){for(let k=0;k<3;k++){const ex=x+1+k,eh=4+k;for(let j=0;j<eh;j++)P(A,ex,by-eh+j,RAMP.cream[j===0?4:3]);}return;}             // a fan of letters, upright
    for(let j=0;j<5;j++){const xx=x+1+Math.round((4-j)*.4);for(let i=0;i<w2-2;i++)P(A,xx+i,by-5+j,RAMP.cream[j===0?4:3]);}};             // one leaning
  rows.forEach((ry,ri)=>{const by=shelves[ri];let x=x0+4;
    if(K==='mail'){const cw=Math.floor((w-8)/6);for(let c=0;c<6;c++){const cx=x0+4+c*cw;vl(A,cx,ry,by-ry,R[3]);vl(A,cx+1,ry,by-ry,R[1]);letters(cx+2,by,cw-2,by-ry-1);}
      vl(A,x0+4+6*cw,ry,by-ry,R[3]);return;}
    let gapped=0;while(x<x0+w-8){const r=rr();if(r<.1){x+=3;continue;}
      if(K==='cans'&&r>.8&&gapped<2){x+=7+((rr()*5)|0);gapped++;continue;}
      if(K==='cans'){const w2=5+((rr()*2)|0),h=6+((rr()*4)|0);const L=LAB[(rr()*LAB.length)|0];if(rr()<.3&&x<x0+w-14&&h*2<by-ry-2){tin(x,by,w2,h,L);tin(x,by-h,w2,h,L);}else tin(x,by,w2,Math.min(h,by-ry-2),L);x+=w2+1;}
      else{const t=rr();if(t<.35){const w2=8+((rr()*4)|0),h=5+((rr()*3)|0);rect(A,x,by-h,w2,h,RAMP.ochre[3]);hl(A,x,by-h,w2,RAMP.ochre[5]);vl(A,x+w2-1,by-h,h,RAMP.ochre[1]);hl(A,x+1,by-h+2,w2-3,RAMP.walnut[2]);x+=w2+1;}   // a parts box with a stencil
        else if(t<.65){const h=8;for(let j=0;j<h;j++)for(let i=0;i<5;i++)P(A,x+i,by-h+j,(j<2?RAMP.steel:RAMP.brick)[i===0?5:i===4?1:3]);P(A,x+4,by-h-1,RAMP.steel[4]);P(A,x+5,by-h-2,RAMP.steel[3]);x+=7;}   // an oil can with its spout
        else{if(x>x0+w-14){x+=20;continue;}const r2=3+((rr()*2)|0);for(let yy=-r2-1;yy<=r2+1;yy++)for(let xx=-r2-1;xx<=r2+1;xx++){const d=Math.sqrt(xx*xx+yy*yy);const ang=Math.atan2(yy,xx);const tooth=Math.cos(ang*6)>.5;if(d>r2+(tooth?.8:0))continue;let c=d<1.2?RAMP.steel[3]:(d<2?RAMP.ironW[1]:(xx+yy<-1?RAMP.ironW[4]:RAMP.ironW[3]));if(d>r2-.8&&xx+yy<0)c=RAMP.steel[3];P(A,x+r2+1+xx,by-r2-2+yy,c);}x+=2*r2+4;}}}   // a round gear: a cool lit rim, a few short teeth, a pale hub
  });
  if(K==='parts'){const tx=x0+w-16,ty=base-6,T=RAMP.ironW;for(let y=-4;y<=1;y++)for(let x=-10;x<=10;x++){const d=x*x/100+(y+1.5)*(y+1.5)/9;if(d>1)continue;P(A,tx+x,ty+y,T[y<-2?3:(y<0?2:1)]);}for(let x=-5;x<=5;x++)P(A,tx+x,ty-2,T[0]);}   // a tyre lying on the bottom shelf
  box3(x0,base-3,w,0,4,R,{});under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== the filing cabinet
if(K==='filecab'){const M=RAMP.olive,base=H-3,x0=3,w=W-6;
  const top=base-44;for(let j=0;j<6;j++)for(let i=0;i<w;i++)P(A,x0+i,top+j,M[j===0?3:(i<1?5:j===5?5:4)]);                // the top, lit lip at the front
  rect(A,x0+2,top-3,w-6,3,RAMP.cream[4]);hl(A,x0+2,top-3,w-6,RAMP.cream[5]);hl(A,x0+3,top-2,w-9,RAMP.cream[2]);contact(x0+2,top,w-6);    // papers on top
  rect(A,x0,top+6,w,base-top-7,M[2]);vl(A,x0,top+6,base-top-7,M[4]);vl(A,x0+w-1,top+6,base-top-7,M[0]);
  for(let k=0;k<3;k++){const dy=top+8+k*12+(k===1?1:0);if(k===1)hl(A,x0+2,dy-1,w-4,M[0]);rect(A,x0+2,dy,w-4,10,M[3]);hl(A,x0+2,dy,w-4,M[4]);hl(A,x0+2,dy+9,w-4,M[1]);vl(A,x0+w-3,dy,10,M[1]);
    rect(A,x0+(w>>1)-3,dy+2,6,3,RAMP.brass[2]);rect(A,x0+(w>>1)-2,dy+3,4,1,k===2?RAMP.ochre[3]:RAMP.cream[3]);                                          // a label holder with its card
    hl(A,x0+(w>>1)-3,dy+6,6,RAMP.steel[4]);hl(A,x0+(w>>1)-3,dy+7,6,RAMP.steel[1]);}                                               // the pull
  hl(A,x0,base-1,w,M[0]);under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== the school desk
if(K==='schooldesk'){const R=RAMP.oak,I=RAMP.ironW,base=H-3,x0=3,w=W-6;
  const top=base-24;for(let j=0;j<9;j++)for(let i=0;i<w;i++){let k=j===8?5:(j===0?3:(i<1?5:4));if((j===3&&i>4&&i<15)||(j===6&&i>9&&i<w-3))k=3;P(A,x0+i,top+j,RAMP.pine[k]);}   // the sloped lid, pine, two long grain streaks, a lit front edge
  hl(A,x0,top+1,w,RAMP.pine[3]);rect(A,x0+w-6,top+1,3,2,RAMP.walnut[0]);hl(A,x0+w-6,top+1,3,RAMP.glass[3]);                                // the pen groove, the inkwell
  rect(A,x0+4,top+3,8,5,RAMP.stone[1]);frame(A,x0+4,top+3,8,5,R[2],R[1]);hl(A,x0+5,top+4,4,RAMP.cream[3]);P(A,x0+6,top+6,RAMP.cream[3]);   // a slate with chalk marks
  rect(A,x0,top+9,w,3,RAMP.pine[2]);hl(A,x0,top+9,w,RAMP.pine[3]);hl(A,x0,top+11,w,RAMP.pine[1]);                                 // the apron under the lid
  fadeUnder(x0+4,x0+w-5,top+12,base-1);
  for(const sx of [x0+1,x0+w-4]){for(let y=top+12;y<base;y++){const k=(y-top)%5;P(A,sx,y,RAMP.steel[k===0?2:1]);P(A,sx+1,y,I[1]);P(A,sx+2,y,I[0]);}
    P(A,sx-1,top+16,I[3]);P(A,sx+3,top+19,I[3]);hl(A,sx-1,base-1,5,I[2]);}                                                       // cast-iron scroll legs
  hl(A,x0+3,base-6,w-6,I[3]);hl(A,x0+3,base-5,w-6,I[1]);cast(x0,x0+w,base);}
// =================================================================================== the milking stool
if(K==='stool'){const R=RAMP.oak,base=H-3,cx=W>>1;
  // a milking stool: a round seat two steps lighter than its three splayed legs; floor shows between them
  const sy=base-17;
  for(let j=0;j<12;j++){P(A,cx,sy+3+j,R[1]);P(A,cx+1,sy+3+j,R[0]);}                                                                     // the back leg, darker, shorter
  for(const dir of [-1,1])for(let j=0;j<16;j++){const x=cx+dir*(4+Math.round(j*.45));P(A,x,sy+2+j,R[dir<0?4:3]);P(A,x+1,sy+2+j,R[dir<0?3:1]);}   // two legs splaying toward you, well apart
  for(let y=-3;y<=2;y++)for(let x=-8;x<=8;x++){const d=x*x/64+y*y/7;if(d>1)continue;P(A,cx+x,sy+y,R[d>.7?(y<0?4:5):(x+y<-2?5:5)]);}hl(A,cx-4,sy-1,6,RAMP.pine[5]);   // the seat top, the lightest wood
  for(let x=-7;x<=7;x++)P(A,cx+x,sy+3,R[2]);                                                                                         // its edge
  for(let x=-8;x<=9;x++)SH(cx+x,base,70);cast(cx-6,cx+6,base);}
// =================================================================================== the church pew
if(K==='pew'){const R=RAMP.walnut,base=H-3,x0=7,w=W-14;   // owner: "benches look weird, not like you could sit on them"
  const endPost=(ex,top)=>{for(let y=top+3;y<base;y++){P(A,ex,y,R[5]);P(A,ex+1,y,R[4]);P(A,ex+2,y,R[3]);P(A,ex+3,y,R[2]);P(A,ex+4,y,R[1]);}
    for(let j=0;j<4;j++)for(let i=-1;i<6;i++){if((j===0&&(i<1||i>3))||(j===1&&(i<0||i>4)))continue;P(A,ex+i,top+j,R[j===0?5:(i<2?4:(i>3?1:3))]);}   // a rounded carved cap on each end
    hl(A,ex,base-1,5,R[1]);P(A,ex+2,top+8,R[1]);P(A,ex+2,top+9,R[2]);P(A,ex+1,top+12,R[5]);};
  if(V==='N'){   // seen from behind, as the church sees them: a rounded top rail, the back's boards down to the seat, a hymn-book ledge, open under the seat, a kneeler
    const rt=base-30,sy=base-13;
    for(let y=rt+3;y<sy;y++)for(let i=0;i<w;i++){const u=i%11;P(A,x0+i,y,R[u===0?1:(u===1?3:2)]);}                       // the back: upright boards, in its own shade
    for(let j=0;j<4;j++)hl(A,x0-1,rt+j,w+2,R[j===0?3:(j===1?5:(j===2?4:2))]);                                            // the rounded top rail, lit along its crown
    for(let i=0;i<w;i++){P(A,x0+i,sy,R[4]);P(A,x0+i,sy+1,R[2]);P(A,x0+i,sy+2,R[1]);}                                      // the seat's back edge, under the back
    const ly=rt+11;for(let i=2;i<w-2;i++){P(A,x0+i,ly,R[5]);P(A,x0+i,ly+1,R[4]);P(A,x0+i,ly+2,R[2]);P(A,x0+i,ly+3,R[1]);}   // the book ledge
    const BK=[RAMP.red,RAMP.walnut,RAMP.green,RAMP.red,RAMP.plum];
    for(const [bx,k] of [[x0+9,0],[x0+12,1],[x0+15,2],[x0+44,3],[x0+47,4],[x0+80,0],[x0+83,2],[x0+86,1]])book(bx,ly-4,3,4+(k===1?1:0),BK[k],k===3);   // a few hymnals in threes, gaps where the rest went
    bookFlat(x0+62,ly-2,7,RAMP.red);
    for(let y=sy+3;y<base;y++)for(let x=x0;x<x0+w;x++)SH(x,y,170);                                                         // open and dark under the seat
    for(const bx of [x0+20,x0+w>>1,x0+w-22]){P(A,bx,base-3,R[3]);P(A,bx,base-2,R[1]);}                                    // the kneeler's brackets
    for(let i=0;i<w;i++){P(A,x0+i,base-6,RAMP.brick[i%17===0?2:4]);P(A,x0+i,base-5,RAMP.brick[3]);P(A,x0+i,base-4,RAMP.brick[1]);}   // a worn red kneeler on them
    endPost(x0-5,rt-4);endPost(x0+w,rt-4);cast(x0-5,x0+w+4,base);}
  else{   // from the front: a cushioned seat you can see the top of, a back that leans behind it, the dark under it
    const sF=base-12,sB=sF-9,bt=sB-17;
    for(let y=bt+2;y<sB;y++)for(let i=0;i<w;i++){const u=i%11;P(A,x0+i,y,R[u===0?1:(u===1?4:(y<bt+4?4:3))]);}                // the back: upright boards, lit near the top where it leans into the light
    for(let j=0;j<2;j++)hl(A,x0-1,bt+j,w+2,R[j===0?5:4]);hl(A,x0,sB-1,w,R[1]);
    for(let y=sB;y<sF;y++)for(let i=0;i<w;i++)P(A,x0+i,y,R[y===sB?2:4]);                                                  // the seat board
    for(let y=sB+1;y<sF-1;y++)for(let i=3;i<w-3;i++){const e=y===sB+1||y===sF-2;P(A,x0+i,y,RAMP.brick[e?2:(y<sB+4?4:3)]);}   // a long red cushion, worn pale where people sit
    for(const cx of [x0+18,x0+56,x0+93])for(let i=-5;i<=5;i++)P(A,cx+i,sB+3,RAMP.brick[5]);
    for(const cx of [x0+37,x0+75])P(A,cx,sB+4,RAMP.brick[1]);                                                              // buttons
    bookFlat(x0+26,sB+2,8,RAMP.walnut);
    hl(A,x0,sF,w,R[5]);hl(A,x0,sF+1,w,R[3]);hl(A,x0,sF+2,w,R[2]);hl(A,x0,sF+3,w,R[1]);                                    // the seat's rounded front edge
    for(let y=sF+4;y<base;y++)for(let x=x0;x<x0+w;x++)SH(x,y,y<sF+7?160:130);                                           // the dark under the seat
    endPost(x0-5,bt-5);endPost(x0+w,bt-5);cast(x0-5,x0+w+4,base);}}
// =================================================================================== the tool tote
if(K==='toolbox'){const R=RAMP.pine,base=H-3,x0=4,w=W-8,S=RAMP.steel;
  const top=base-16;box3(x0,top,w,6,10,R,{facePw:4});rect(A,x0+2,top+1,w-4,4,RAMP.walnut[1]);
  for(const [y,k] of [[top+9,2],[top+13,1]])hl(A,x0+1,y,w-2,R[k]);for(const sx of [x0+9,x0+17,x0+22])vl(A,sx,top+6,10,R[2]);              // seams at uneven heights, boards of uneven widths
  // the tools, standing well above the rim: a hand saw (a steel blade with a lit edge, teeth, a wooden handle), a claw hammer, a try square
  for(let j=0;j<15;j++){const yy=top-13+j,xx=x0+w-15+Math.round(j*.35);const ww=2+Math.floor(j/5);for(let i=0;i<ww;i++)P(A,xx+i,yy,S[i===0?5:i===ww-1?1:3]);if(j%2===0)P(A,xx+ww,yy,S[2]);}   // the saw slanting out, tapered, its teeth on the right
  {const hx=x0+w-17,hy=top-19;for(let j=0;j<6;j++)for(let i=0;i<6;i++){if(i>1&&i<4&&j>1&&j<4){P(A,hx+i,hy+j,RAMP.walnut[0]);continue;}P(A,hx+i,hy+j,RAMP.oak[j===0?5:(i===0?4:(i===5?2:3))]);}}   // its handle: dull wood, a grip hole
  for(let j=0;j<13;j++){P(A,x0+8,top-11+j,RAMP.ochre[4]);P(A,x0+9,top-11+j,RAMP.ochre[2]);}rect(A,x0+6,top-14,7,3,S[3]);hl(A,x0+6,top-14,7,S[5]);P(A,x0+5,top-13,S[2]);P(A,x0+12,top-12,S[1]);   // the hammer
  for(const ex of [x0,x0+w-4]){for(let j=0;j<12;j++){const ww=j<2?3:4;for(let i=0;i<ww;i++)P(A,ex+i+(j<2&&ex>x0?1:0),top-11+j,R[i===0?5:(i===ww-1?1:3)]);}}
  for(let i=x0+4;i<x0+w-4;i++){P(A,i,top-9,R[5]);P(A,i,top-8,R[2]);}                                                                 // two raised end boards and the round dowel between them
  under(x0,x0+w,base,base);cast(x0,x0+w,base);}
// =================================================================================== the coffin
if(K==='coffin'){const R=RAMP.walnut,base=H-3,cx=W>>1;
  // a coffin on the floor, lying away from you: the shouldered lid seen from above, the near (foot) end's face, a brass plate and a cross
  const top=4,L=46;const hw=y=>{const t=(y-top)/L;return Math.round(t<.28?9+t*30:17-(t-.28)*12);};
  for(let y=top;y<top+L;y++){const ww=hw(y);for(let x=-ww;x<=ww;x++){let k=x===-ww?5:x===ww?1:(x<0?4:3);if(y===top)k=2;if(Math.abs(x)===ww-2)k=x<0?5:2;P(A,cx+x,y,R[k]);}}   // the lid with a raised border
  const fy=top+L,fw=hw(fy-1);for(let y=fy;y<base;y++)for(let x=-fw;x<=fw;x++)P(A,cx+x,y,R[x===-fw?4:x===fw?0:(y===fy?1:2)]);hl(A,cx-fw,fy,fw*2+1,R[5]);   // the foot end's face
  for(let y=top+8;y<top+26;y++){P(A,cx,y,RAMP.brass[y<top+12?5:3]);P(A,cx+1,y,RAMP.brass[1]);}for(let x=-4;x<=4;x++){P(A,cx+x,top+13,RAMP.brass[x<0?5:3]);P(A,cx+x,top+14,RAMP.brass[1]);}   // a brass cross
  rect(A,cx-4,top+32,9,4,RAMP.brass[3]);hl(A,cx-4,top+32,9,RAMP.brass[5]);hl(A,cx-3,top+34,6,RAMP.brass[1]);                        // the name plate
  for(const [hx,hy] of [[-fw+1,fy+4],[fw-2,fy+4]]){P(A,cx+hx,hy,RAMP.brass[4]);P(A,cx+hx+1,hy,RAMP.brass[2]);}
  cast(cx-fw,cx+fw,base);}
// =================================================================================== outdoor: the upright barrel
if(K==='barrel'){const R=RAMP.oak,I=RAMP.ironW,base=H-3,cx=W>>1,top=4,ry=4;
  const hw=y=>{const t=(y-top)/(base-top);return Math.round(9+3.6*Math.sin(t*Math.PI));};
  for(let y=top;y<=base;y++){const w=hw(y);for(let x=-w;x<=w;x++){const u=x/w;let k=u<-.75?4:u<-.3?5:u<.3?4:u<.7?3:2;if(x===-6||x===1||x===7)k=Math.max(1,k-1);if(y>base-2)k=Math.max(1,k-1);P(A,cx+x,y,R[k]);}}   // a lit band on the left third, two stave seams, the right third shaded
  for(const hy of [top+4,base-4]){const w=hw(hy);for(let x=-w;x<=w;x++){P(A,cx+x,hy,I[x<-w*.3?3:2]);P(A,cx+x,hy+1,I[0]);P(A,cx+x,hy+2,I[0]);}}   // two near-black hoops, a lit top line
  for(let y=-ry;y<=ry;y++)for(let x=-10;x<=10;x++){const d=x*x/100+y*y/(ry*ry);if(d>1)continue;let k=d>.7?(y<0?2:1):(x<0?5:4);P(A,cx+x,top+y,d>.7?I[k]:RAMP.pine[k]);}
  P(A,cx+4,top-1,RAMP.walnut[0]);P(A,cx+5,top-1,RAMP.walnut[1]);cast(cx-10,cx+10,base);}
// =================================================================================== outdoor: a single crate
if(K==='crate'){const R=RAMP.pine,base=H-3,x0=3,w=W-6,d=9,fh=base-d-3;
  for(let j=0;j<d;j++)for(let i=0;i<w;i++)P(A,x0+i,3+j,R[(i%7===6)?4:5]);hl(A,x0,3,w,R[4]);                                                         // the lid, the lightest face
  rect(A,x0,3+d,w,fh,R[1]);for(let j=2;j<fh-2;j++)for(let i=3;i<w-3;i++)P(A,x0+i,3+d+j,R[(j%5===0)?1:(i<5?3:(i>w-6?2:3))]);                                 // the planked panel, lighter, inside a darker frame
  for(const px of [x0,x0+w-3])for(let j=0;j<fh;j++){P(A,px,3+d+j,R[px===x0?3:1]);P(A,px+1,3+d+j,R[2]);P(A,px+2,3+d+j,R[1]);}
  for(const ry of [3+d,3+d+1,base-2,base-1])hl(A,x0,ry,w,R[ry<3+d+2?2:1]);hl(A,x0,3+d,w,R[3]);
  for(let i=0;i<w-6;i++){const y=base-2-Math.round(i*(fh-4)/(w-7));P(A,x0+3+i,y,R[4]);P(A,x0+3+i,y+1,R[1]);}                                     // the diagonal brace
  cast(x0,x0+w,base);}
// =================================================================================== outdoor: grain sacks
if(K==='sacks'){const Bp=RAMP.burlap,base=H-3;
  const sack=(cx,by,rw,h,tied)=>{if(tied){for(let y=0;y<5;y++){const w=y<2?2:1+y%2;for(let x=-w;x<=w;x++)P(A,cx+x,by-h-4+y,Bp[x<0?5:3]);}hl(A,cx-2,by-h,5,RAMP.ochre[2]);hl(A,cx-2,by-h+1,5,RAMP.ochre[4]);}
    for(let y=0;y<h;y++){const t=y/h;const w=Math.round(rw*(t<.18?(tied?.35:.8)+t*(tied?3.4:2):(t<.85?1:1-(t-.85)*1.6)));for(let x=-w;x<=w;x++){const l=-x/w*.55-(t-.45)*.6;let k=l>.45?5:l>.1?4:l>-.25?3:2;P(A,cx+x,by-h+y,Bp[k]);}}
    for(const [f,dx] of [[.45,-2],[.7,3]]){const fy=by-h+Math.round(h*f);for(let x=-rw+3;x<rw-2;x++){const yy=fy+Math.round(Math.sin((x+dx)*.5)*1);P(A,cx+x,yy,Bp[2]);P(A,cx+x,yy-1,Bp[5]);}}   // two broad fold curves: a lit crest over a shade
    hl(A,cx-rw+2,by-1,rw*2-3,Bp[1]);};
  sack(12,base,8,22,true);sack(25,base,9,15,false);for(let x=3;x<34;x++)SH(x,base+1,110);
  for(const [x,y] of [[16,base],[19,base+1],[33,base]]){P(A,x,y,RAMP.straw[4]);P(A,x+1,y,RAMP.straw[3]);P(A,x,y-1,RAMP.straw[5]);P(A,x+1,y-1,RAMP.straw[4]);}}   // spilled grain in small clumps
// =================================================================================== outdoor: a hay bale
if(K==='hay'){const Sw=RAMP.straw,base=H-3,x0=3,w=W-6,d=12,top=base-28;const G2=[Sw[0],Sw[1],Sw[2],Sw[3],RAMP.ochre[4],RAMP.ochre[5]];   // old gold, not lemon
  for(let j=0;j<d;j++)for(let i=0;i<w;i++){let k=(hsh(i>>1,j>>1,SEED)>.8)?4:5;if(j===0)k=4;P(A,x0+i,top+j,G2[k]);}
  for(let j=0;j<base-top-d;j++)for(let i=0;i<w;i++){const st=hsh(i,j>>2,SEED+3);let k=st>.8?3:(st<.15?1:2);if(i<2)k=3;if(i>w-3)k=1;P(A,x0+i,top+d+j,G2[k]);}   // the face two steps darker than the top, fine short straw streaks
  for(const bx of [x0+11,x0+w-12]){for(let j=0;j<base-top;j++)P(A,bx,top+j,j<d?RAMP.ochre[2]:RAMP.burlap[1]);}
  for(let i=0;i<10;i++){const sx=x0+((hsh(i,1,SEED)*w)|0),sy=top+((hsh(i,2,SEED)*3)|0)-1;P(A,sx,sy-1,G2[5]);P(A,sx+1,sy-2,G2[4]);}
  for(let i=0;i<6;i++){const sy=top+d+3+((hsh(i,3,SEED)*14)|0);P(A,x0-1,sy,G2[4]);P(A,x0+w,sy+1,G2[2]);}
  cast(x0,x0+w,base);}
// =================================================================================== outdoor: a stack of split firewood
if(K==='firewood'){const base=H-3;
  const end=(cx,cy,r,split)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.sqrt(x*x+y*y);if(d>r+.3)continue;if(split&&x+y>1.5)continue;let c;
      if(d>r-1.2&&x+y>0)c=RAMP.bark[2];else c=RAMP.oak[x+y<-2?5:(x+y<1?4:3)];P(A,cx+x,cy+y,c);}
    if(!split)P(A,cx+1,cy,RAMP.bark[1]);else for(let i=-r;i<=r;i++){const x=i,y=Math.round(1.5-i);if(x*x+y*y<=r*r)P(A,cx+x,cy+y,RAMP.oak[3]);}};   // dull tan end grain, brightest top-left, one dark heart off centre
  const logs=[[8,base-4,4,0],[17,base-4,5,1],[27,base-4,4,0],[36,base-4,4,1],[12,base-12,4,1],[21,base-13,4,0],[31,base-12,4,0],[17,base-20,4,0],[26,base-20,3,1]];
  for(const [x,y,r,sp] of logs)end(x,y,r,sp);
  for(let x=3;x<41;x++)SH(x,base+1,110);cast(4,38,base);}
// =================================================================================== outdoor: the chopping block
if(K==='choppingblock'){const base=H-3,Bk=RAMP.bark;
  const bx=14,top=base-15,rw=10;
  for(let y=0;y<12;y++){const fl=y>8?y-8:0;for(let x=-rw-fl;x<=rw+fl;x++){let k=x<-rw+3?4:x>rw-3?1:3;if([-7,-2,4,8].includes(x))k=Math.max(1,k-2);P(A,bx+x,top+4+y,Bk[k]);}}   // uneven bark grooves, a lit left edge, a root flare
  for(let y=-4;y<=4;y++)for(let x=-rw;x<=rw;x++){const d=x*x/(rw*rw)+y*y/16;if(d>1)continue;P(A,bx+x,top+y,d>.8?Bk[3]:RAMP.oak[x+y<-3?5:4]);}   // the end grain top, tan
  for(const [x,y] of [[-3,0],[4,-1],[1,2]])P(A,bx+x,top+y,RAMP.oak[2]);
  for(let i=0;i<16;i++){const x=bx+2+Math.round(i*.65),y=top-1-i;P(A,x,y,RAMP.oak[4]);P(A,x+1,y,RAMP.oak[2]);}                                     // the axe's handle
  hl(A,bx-3,top+1,7,Bk[0]);rect(A,bx-2,top-2,5,3,RAMP.steel[2]);hl(A,bx-2,top-2,5,RAMP.steel[4]);P(A,bx+3,top-2,RAMP.steel[3]);P(A,bx+3,top-1,RAMP.steel[1]);   // its blade sunk in a dark cut, the head's side and back lit
  for(const [X,Y] of [[27,base-1],[31,base-3],[34,base],[5,base-1],[29,base+1],[24,base-2]]){P(A,X,Y,RAMP.oak[5]);P(A,X+1,Y,RAMP.oak[3]);}               // flat chips scattered round it
  cast(bx-rw,bx+rw,base);}
// =================================================================================== outdoor: a wooden bucket
if(K==='bucket'){const R=RAMP.oak,I=RAMP.ironW,base=H-3,cx=W>>1,top=base-13;
  for(let y=top;y<=base;y++){const w=Math.round(8-(y-top)*.15);for(let x=-w;x<=w;x++){const u=x/w;let k=u<-.5?4:u<.3?3:2;if(x===-3||x===3)k=Math.max(1,k-1);P(A,cx+x,y,R[k]);}}
  for(const hy of [top+3,base-2])for(let x=-8;x<=8;x++){if(Math.abs(x)>Math.round(8-(hy-top)*.15))continue;P(A,cx+x,hy,I[1]);P(A,cx+x,hy-1,x<0?I[3]:I[2]);}   // dark cast-iron hoops, one lit top line
  for(let y=-3;y<=3;y++)for(let x=-8;x<=8;x++){const d=x*x/64+y*y/9;if(d>1)continue;P(A,cx+x,top+y,d>.7?R[y<0?2:5]:RAMP.glass[y<0?2:3]);}P(A,cx-3,top,RAMP.glass[5]);
  for(let a=0;a<=Math.PI;a+=.08){const X=Math.round(cx+Math.cos(a)*9),Y=Math.round(top-1-Math.sin(a)*8);P(A,X,Y,I[a>1.6?3:2]);}
  cast(cx-8,cx+8,base);}
// =================================================================================== outdoor: an anvil on its stump
if(K==='anvil'){const I=RAMP.ironW,base=H-3,cx=W>>1,Bk=RAMP.bark;
  for(let y=base-8;y<=base;y++)for(let x=-7;x<=7;x++){let k=x<-5?4:x>5?1:3;if((x+7)%3===0)k=Math.max(1,k-1);P(A,cx+x,y,Bk[k]);}                         // the stump: barked
  for(let y=-2;y<=2;y++)for(let x=-7;x<=7;x++){if(x*x/49+y*y/4>1)continue;P(A,cx+x,base-9+y,RAMP.oak[x+y<-2?5:4]);}                                 // its lighter end-grain top
  rect(A,cx-4,base-15,9,5,I[2]);vl(A,cx-4,base-15,5,RAMP.steel[2]);vl(A,cx+4,base-15,5,I[1]);
  for(let j=0;j<5;j++){const ww=j<2?13:11;for(let i=-ww+3;i<=ww-3;i++)P(A,cx+i,base-20+j,j===0?RAMP.steel[4]:(i<-2?I[4]:I[3]));}
  for(let i=0;i<7;i++){const t=i/6;P(A,cx-11-i,base-19+Math.round(t*2),I[3]);P(A,cx-11-i,base-18+Math.round(t*2),I[1]);if(i<5)P(A,cx-11-i,base-20+Math.round(t*2),RAMP.steel[3]);}
  rect(A,cx+10,base-20,3,4,I[2]);hl(A,cx+10,base-20,3,RAMP.steel[3]);hl(A,cx-6,base-20,9,RAMP.steel[5]);P(A,cx+5,base-19,I[0]);
  cast(cx-8,cx+8,base);}
// =================================================================================== outdoor: a rural mailbox on its post
if(K==='mailbox'){const base=H-3,cx=W>>1,M=RAMP.bluegrey;
  for(let y=base-24;y<base;y++){P(A,cx-1,y,RAMP.oak[4]);P(A,cx,y,RAMP.oak[3]);P(A,cx+1,y,RAMP.oak[1]);}
  // the box side-on: a long domed tin tube, its door at the front end, the flag up on the side
  const bx=cx-13,by=base-34,bw=26,bh=10;for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){const dome=y<3?(x<2||x>bw-3?99:0):0;if(y<3&&(x<3-y||x>bw-4+y))continue;let k=y<1?5:y<3?4:(y<7?3:2);if(x===0)k=2;P(A,bx+x,by+y,M[k]);}
  for(let y=1;y<bh;y++)P(A,bx-1,by+y,M[1]);P(A,bx-2,by+5,RAMP.steel[3]);
  for(let y=0;y<7;y++)P(A,bx+bw-5,by-6+y,RAMP.brick[y<1?5:3]);rect(A,bx+bw-5,by-6,5,3,RAMP.brick[4]);hl(A,bx+bw-5,by-6,5,RAMP.brick[5]);              // the red flag, up
  rect(A,cx-11,by+bh+2,22,7,RAMP.cream[3]);hl(A,cx-11,by+bh+2,22,RAMP.cream[4]);hl(A,cx-11,by+bh+8,22,RAMP.oak[2]);vl(A,cx+10,by+bh+2,7,RAMP.cream[1]);drawText(A,'MARSH',cx-9,by+bh+3,RAMP.walnut[0]);   // the name board
  cast(cx-3,cx+3,base);}
// =================================================================================== outdoor: a dented trash can
if(K==='trashcan'){const base=H-3,cx=W>>1,top=base-22;const Gv=hexR(['#26232a','#3a3640','#55525a','#727078','#8e8c92','#aaa8ac']);   // galvanised grey, plum-grey shade
  for(let y=top;y<=base;y++){const w=Math.round(8-(y-top)*.06);for(let x=-w;x<=w;x++){const u=x/w;let k=u<-.6?4:u<.1?3:u<.6?2:1;if((y-top)%7===3)k=Math.max(0,k-1);if(x===3&&y>top+6&&y<top+11)k=1;P(A,cx+x,y,Gv[k]);}}
  for(let y=-3;y<=2;y++)for(let x=-9;x<=9;x++){const d=x*x/81+y*y/9;if(d>1)continue;P(A,cx+x,top-1+y,Gv[d>.75?(y<0?2:1):(x<0?5:4)]);}hl(A,cx-2,top-4,5,Gv[4]);hl(A,cx-2,top-3,5,Gv[1]);
  P(A,cx-6,top+3,RAMP.cream[3]);P(A,cx+5,top+1,RAMP.brick[2]);cast(cx-8,cx+8,base);}
// =================================================================================== outdoor: an oil drum
if(K==='drum'){const base=H-3,cx=W>>1,Rr=RAMP.brick,top=base-24;
  for(let y=top;y<=base;y++)for(let x=-9;x<=9;x++){const u=x/9;let k=u<-.7?4:u<-.3?5:u<.3?3:u<.7?2:1;if(y===top+7||y===top+16)k=Math.max(0,k-2);P(A,cx+x,y,Rr[k]);}
  for(const [rx,len] of [[-4,9],[2,6],[6,12]])for(let j=0;j<len;j++){P(A,cx+rx,top+2+j,RAMP.ochre[j<len/2?3:2]);if(j%3===0)P(A,cx+rx+1,top+2+j,RAMP.ochre[2]);}   // rust running down from the rim
  for(const [rx,len] of [[-6,4],[1,5]])for(let j=0;j<len;j++)P(A,cx+rx,top+17+j,RAMP.ochre[2]);
  for(let y=-3;y<=3;y++)for(let x=-9;x<=9;x++){const d=x*x/81+y*y/9;if(d>1)continue;P(A,cx+x,top+y,d>.7?Rr[y<0?2:4]:Rr[x<0?4:3]);}P(A,cx+4,top-1,RAMP.ironW[1]);P(A,cx+5,top-1,RAMP.ironW[2]);
  cast(cx-9,cx+9,base);}
// =================================================================================== outdoor: a stack of old tyres
if(K==='tyres'){const base=H-3,cx=W>>1,T=[RAMP.charcoal[0],RAMP.charcoal[2],RAMP.charcoal[4],RAMP.steel[1]];
  for(let k=0;k<4;k++){const yb=base-k*6,dx=(k%2?1:-1)*(k>1?1:0);for(let y=-5;y<=1;y++)for(let x=-12;x<=12;x++){const d=x*x/144+(y+2)*(y+2)/12;if(d>1)continue;if(d>.88&&(x+k)%3===0)continue;const l=(-x/12)*.4-(y+2)/3;P(A,cx+x+dx,yb+y,T[l>.5?3:l>.1?2:l>-.4?1:0]);}}   // dark rubber, lit along each upper curve, the tread notching the outline
  {const ty=base-25;for(let y=-3;y<=2;y++)for(let x=-12;x<=12;x++){const d=x*x/144+(y+.5)*(y+.5)/7;if(d>1)continue;const h=x*x/49+(y+.5)*(y+.5)/3;P(A,cx+x,ty+y,h<1?(y<0?T[0]:RAMP.walnut[0]):T[y<0?3:2]);}for(let x=-6;x<=6;x++)if(x*x/49<1)P(A,cx+x,ty+Math.round(Math.sqrt(1-x*x/49)*1.7),T[3]);}   // the top tyre's hole, its lit inner rim
  cast(cx-12,cx+12,base);}
// =================================================================================== outdoor: a pile of lumber
if(K==='lumber'){const base=H-3;
  const plank=(x,y,len)=>{for(let i=0;i<len;i++){P(A,x+i,y,RAMP.pine[5]);P(A,x+i,y+1,RAMP.pine[4]);P(A,x+i,y+2,RAMP.pine[3]);P(A,x+i,y+3,RAMP.pine[1]);}for(let j=0;j<4;j++){P(A,x+len,y+j,RAMP.oak[j===0?5:4]);P(A,x+len+1,y+j,RAMP.oak[2]);}};   // a board: its lit top face, its edge, a tan end in a dark rim
  for(const [x,y,l] of [[3,base-4,34],[8,base-8,30],[2,base-12,26],[12,base-12,30],[6,base-16,21]])plank(x,y,l);
  for(const sx of [7,30])rect(A,sx,base-1,3,2,RAMP.bark[2]);
  for(let x=2;x<44;x++)SH(x,base+1,110);cast(4,40,base);}
// =================================================================================== outdoor: a ladder leaning on nothing (laid against a wall when placed)
if(K==='ladder'){const base=H-3,R=RAMP.pine;
  for(const sx of [4,13]){for(let y=1;y<base;y++){P(A,sx,y,R[5]);P(A,sx+1,y,R[3]);P(A,sx+2,y,R[1]);}}                                           // rails lit on the left
  for(let y=5;y<base-2;y+=6){hl(A,6,y,7,R[5]);hl(A,6,y+1,7,R[3]);hl(A,6,y+2,7,R[0]);}                                                             // rungs: a lit top edge, shade under
  for(const fx of [4,13])for(let i=-1;i<5;i++)SH(fx+i,base+1,170);cast(4,15,base);}
// =================================================================================== outdoor: a weathered signpost
if(K==='signpost'){const base=H-3,cx=W>>1,R=RAMP.oak;
  for(let y=4;y<base;y++){P(A,cx-2,y,R[4]);P(A,cx-1,y,R[3]);P(A,cx,y,R[2]);P(A,cx+1,y,R[1]);}hl(A,cx-2,3,4,R[5]);                                    // the post, its cut top lit
  const arrow=(y,dir,len,tilt)=>{for(let i=0;i<len;i++){const x=dir>0?cx+2+i:cx-3-i,ty=Math.round(i*tilt);const tip=i>len-4?len-1-i:9;for(let j=0;j<7;j++){if(j<3-tip||j>3+tip)continue;P(A,x,y+ty+j,R[j===0?5:(j===6?1:(j<3?4:3))]);}}
    for(let i=4;i<len-6;i+=3){const x=dir>0?cx+3+i:cx-4-i;P(A,x,y+Math.round(i*tilt)+3,RAMP.walnut[1]);P(A,x+1,y+Math.round(i*tilt)+3,RAMP.walnut[1]);}   // worn carved letters
    P(A,dir>0?cx+3:cx-4,y+3,RAMP.ironW[4]);};
  arrow(8,-1,17,0);arrow(19,1,16,.08);                                                                                                  // one sign each way, the lower one sagging
  for(let i=0;i<5;i++)P(A,cx-3+i,base-1-(i%2),RAMP.green[i%2?3:4]);                                                                      // moss at the foot
  cast(cx-3,cx+3,base);}
// =================================================================================== outdoor: an iron street lamp
if(K==='lamp_st'){const base=H-3,cx=W>>1,I=RAMP.ironW,L=RAMP.lit;
  for(let y=18;y<base-4;y++){const wide=y>base-24;P(A,cx-1,y,RAMP.steel[2]);P(A,cx,y,I[3]);P(A,cx+1,y,I[1]);if(wide){P(A,cx-2,y,RAMP.steel[3]);P(A,cx+2,y,I[0]);}}   // the post, tapering up, a cool lit edge
  for(let j=0;j<5;j++){const w=2+Math.round(j*.8);for(let i=-w;i<=w;i++)P(A,cx+i,base-5+j,I[i<0?3:1]);}hl(A,cx-2,base-5,5,I[4]);               // the flared foot
  hl(A,cx-4,24,9,I[3]);hl(A,cx-4,25,9,I[1]);                                                                                                 // the ladder bar
  const ly=6;for(let y=0;y<11;y++){const w=y<2?3:4;for(let x=-w;x<=w;x++){let c;if(Math.abs(x)===w||y===0||y===10)c=I[x<0?3:1];else c=NIGHT?L[Math.abs(x)<2&&y>2&&y<8?5:4]:RAMP.bluegrey[y<4?3:2];P(A,cx+x,ly+y,c);}}if(!NIGHT){P(A,cx-2,ly+3,RAMP.steel[4]);P(A,cx-2,ly+4,RAMP.steel[3]);}
  vl(A,cx,ly+1,9,I[2]);                                                                                                                      // the panes' middle bar
  for(let j=0;j<4;j++){const w=5-j;for(let i=-w;i<=w;i++)P(A,cx+i,ly-1-j,I[j===3?4:(i<0?3:2)]);}P(A,cx,ly-6,I[4]);                               // the cap and finial
  if(NIGHT){hl(A,cx-3,ly-1,7,L[1]);for(let y=ly+11;y<ly+16;y++)P(A,cx-1,y,L[1]);for(let x=-6;x<=6;x++)for(let j=0;j<3;j++){if(Math.abs(x)>6-j*2)continue;P(B,cx+x,base-1+j-1,j===1?L[3]:L[2],170);}}   // warm light on the cap's underside and the post, a hard pool on the ground
  cast(cx-3,cx+3,base);}
// =================================================================================== outdoor: a park bench
if(K==='parkbench'){const base=H-3,x0=7,w=W-14,R=RAMP.oak,I=RAMP.ironW;   // owner: "benches look weird, not like you could sit on them": the seat is a lit plane you can see the top of, the back stands behind it, a dark gap under it
  const sF=base-11,sB=sF-9;                                                       // the seat: its front lip 11 px up, its top running 9 px back (one camera: 3/4 of 12)
  for(let y=base-10;y<base;y++)for(let x=x0;x<x0+w;x++)SH(x,y,y<base-6?150:120);                                     // the dark ground under the seat
  // the back: three slats with daylight between them, standing on the seat's back edge, the top one a broad rail
  for(const [y,h] of [[sB-4,3],[sB-9,3],[sB-15,4]])for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=j===0?4:(j===h-1?1:2);if(j===1&&((i+y*3)%23===0))k=1;P(A,x0+i,y+j,R[k]);}
  for(const bx of [x0+2,x0+w-4])for(let y=sB-14;y<sB;y++){if(G(A,bx,y))continue;P(A,bx,y,I[2]);P(A,bx+1,y,I[1]);}   // the back's iron straps, seen through the gaps
  for(let i=0;i<7;i++)for(let j=0;j<3;j++)P(A,x0+(w>>1)-3+i,sB-14+j,RAMP.brass[j===0?5:(i===6?2:4)]);P(A,x0+(w>>1)-1,sB-13,RAMP.brass[2]);P(A,x0+(w>>1)+1,sB-13,RAMP.brass[2]);   // a small brass plaque
  for(let j=0;j<5;j++)P(A,x0+11+Math.round(j*.6),sB-9+(j>2?1:0)+(j>>1),R[1]);                                          // a split in one slat
  // the seat top: four slats running along it, each lit along its top, a dark slot of shadow between them
  for(let y=sB;y<sF;y++){const r=(y-sB)%3;for(let i=0;i<w;i++){let c=r===2?RAMP.walnut[1]:R[r===0?5:4];if(r===1&&((i*7+y)%31===0))c=R[3];P(A,x0+i,y,c);}}
  hl(A,x0,sF,w,R[5]);hl(A,x0,sF+1,w,R[3]);hl(A,x0,sF+2,w,R[1]);                                                       // the front slat's rounded lip and edge
  for(const ex of [x0-1,x0+w-2])for(let y=sB;y<=sF+2;y++){P(A,ex,y,R[2]);P(A,ex+1,y,R[1]);}                            // end grain where the slats stop
  // cast-iron ends: an upright behind, an arm at elbow height that scrolls down into the front leg, a splayed foot
  for(const [ex,s_] of [[x0-4,-1],[x0+w,1]]){const L=s_<0;
    for(let y=sB-16;y<base;y++){const x=ex+(y>base-3?(L?-1:1):0);P(A,x,y,I[L?4:3]);P(A,x+1,y,I[2]);P(A,x+2,y,I[1]);}
    for(let y=sB-7;y<sF-3;y++){P(A,ex-1,y,I[4]);P(A,ex+3,y,I[1]);}                                                    // the arm, wider than the upright, its top lit
    for(let y=sB-7;y<sF-3;y++)P(A,ex,y,I[5]);
    P(A,ex+(L?-2:4),sF-4,I[3]);P(A,ex+(L?-2:4),sF-3,I[2]);P(A,ex+(L?-1:3),sF-2,I[1]);                                // the scroll at the front of the arm
    hl(A,ex-1,base-1,5,I[2]);hl(A,ex-1,base,5,I[0]);P(A,ex+1,sB-17,I[4]);}
  for(let y=sF+3;y<base;y++){P(A,x0+(w>>1)-1,y,I[3]);P(A,x0+(w>>1),y,I[1]);}                                           // a middle leg
  cast(x0-5,x0+w+3,base);}
// =================================================================================== outdoor: a planter box of autumn mums
if(K==='planter'){const base=H-3,x0=3,w=W-6,R=RAMP.oak,top=base-16;
  box3(x0,top,w,5,11,R,{facePw:5});rect(A,x0+2,top+1,w-4,3,RAMP.walnut[1]);
  const MUM=[RAMP.brick,RAMP.ochre,RAMP.plum];
  for(let i=0;i<9;i++){const lx=x0+3+i*4+((hsh(i,5,SEED)*2)|0),ly=top-((hsh(i,6,SEED)*3)|0);for(let y=-2;y<=1;y++)for(let x=-2;x<=2;x++){if(x*x+y*y*1.5>5)continue;P(A,lx+x,ly+y,RAMP.green[x+y<-1?4:(x+y<1?3:2)]);}}   // leaf masses first
  for(const [fx,fy,C,r] of [[x0+6,top-4,MUM[0],2],[x0+13,top-6,MUM[1],2],[x0+22,top-3,MUM[2],1],[x0+29,top-7,MUM[0],2],[x0+35,top-4,MUM[1],1]]){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r+1)continue;P(A,fx+x,fy+y,C[x+y<-1?5:(x+y<1?4:3)]);}P(A,fx,fy,RAMP.ochre[5]);}   // heads at different heights, gaps between
  for(let i=0;i<6;i++)P(A,x0+w-3+Math.round(i*.3),top+2+i,RAMP.green[i<2?4:3]);P(A,x0+w-1,top+8,RAMP.brick[4]);                                   // a stem trailing over the lip
  for(let i=0;i<5;i++)P(A,x0+5+i*8,top+1,RAMP.green[3]);cast(x0,x0+w,base);}
// =================================================================================== outdoor: a stone birdbath
if(K==='birdbath'){const base=H-3,cx=W>>1,St=RAMP.stone;
  for(let y=base-18;y<base-3;y++){const w=y<base-14?2:3;for(let x=-w;x<=w;x++)P(A,cx+x,y,St[x<-1?4:x>1?2:3]);}
  for(let j=0;j<4;j++){const w=5+j;for(let x=-w;x<=w;x++)P(A,cx+x,base-4+j,St[j===0?4:(x<0?3:2)]);}
  for(let y=-4;y<=3;y++)for(let x=-12;x<=12;x++){const d=x*x/144+y*y/16;if(d>1)continue;P(A,cx+x,base-22+y,d>.65?St[y<0?4:(x<0?5:4)]:RAMP.glass[y<-1?2:3]);}   // the basin's lip, the lightest stone, and its water
  hl(A,cx-6,base-23,4,RAMP.glass[5]);for(let y=base-19;y<=base-17;y++)for(let x=-11;x<=11;x++)if(Math.abs(x)>8-((y-(base-19))*2))P(A,cx+x,y,St[x<0?3:1]);
  for(const [dx,dy,c] of [[2,-21,RAMP.brick[4]],[3,-21,RAMP.brick[3]],[4,-22,RAMP.ochre[4]],[3,-22,RAMP.brick[4]],[5,-21,RAMP.brick[2]]])P(A,cx+dx,base+dy,c);   // a fallen leaf floating
  P(A,cx+9,base-25,St[1]);P(A,cx+10,base-25,RAMP.glass[2]);for(let y=base-16;y<base-9;y++)P(A,cx+(y%3===0?0:1),y,St[1]);for(let x=2;x<7;x++)P(A,cx+x,base-2+(x%2),RAMP.green[x%2?3:2]);   // a chip in the lip, a crack, moss on the shaded foot
  cast(cx-6,cx+6,base);}
// =================================================================================== outdoor: the notice board
if(K==='board'){const base=H-3,x0=5,w=W-10,R=RAMP.oak;
  for(let j=0;j<6;j++){const ww=w+4-j;for(let i=-2;i<ww-2+j;i++){const k=(i+j)%4===0?2:(j<2?4:3);P(A,x0+i+Math.floor(j/2),8+j,RAMP.walnut[k]);}}hl(A,x0-2,8,w+4,RAMP.walnut[5]);   // a little shingled roof
  rect(A,x0,14,w,base-30,R[2]);frame(A,x0,14,w,base-30,R[4],R[0]);rect(A,x0+2,16,w-4,base-34,RAMP.burlap[2]);                                 // the frame and its cork-brown board
  const paper=(x,y,pw,ph,c,mark)=>{rect(A,x,y,pw,ph,c[3]);hl(A,x,y,pw,c[5]);vl(A,x+pw-1,y,ph,c[1]);for(let j=2;j<ph-2;j+=2)hl(A,x+1,y+j,pw-3,c[2]);P(A,x+(pw>>1),y,RAMP.brick[4]);if(mark)mark(x,y);};
  paper(x0+3,19,10,11,RAMP.cream);paper(x0+36,20,9,8,RAMP.ochre);paper(x0+5,32,13,8,RAMP.ochre);paper(x0+44,30,10,11,RAMP.cream);
  {const px=x0+17,py=16;rect(A,px,py,16,20,RAMP.cream[4]);hl(A,px,py,16,RAMP.cream[5]);vl(A,px+15,py,20,RAMP.cream[2]);rect(A,px,py,16,4,RAMP.brick[3]);hl(A,px,py,16,RAMP.brick[5]);hl(A,px+3,py+1,10,RAMP.cream[5]);   // the MISSING poster: the biggest, a red header
    rect(A,px+4,py+6,8,8,RAMP.stone[2]);rect(A,px+6,py+7,4,4,RAMP.stone[3]);hl(A,px+5,py+11,6,RAMP.stone[3]);for(let j=0;j<3;j++)hl(A,px+2,py+15+j*2-(j===2?1:0),12-j*3,RAMP.cream[2]);P(A,px+8,py,RAMP.ironW[4]);}
  {const px=x0+44,py=18;for(let j=0;j<10;j++)for(let i=0;i<9;i++){const xx=px+i+Math.round(j*.2);P(A,xx,py+j,RAMP.cream[j===0?5:(i===8?2:4)]);}}   // one note pinned crooked
  for(const px of [x0+3,x0+w-6]){rect(A,px,base-16,3,16,R[3]);vl(A,px,base-16,16,R[5]);vl(A,px+2,base-16,16,R[1]);}
  cast(x0,x0+w,base);}
// =================================================================================== outdoor: the stone well
if(K==='well'){const base=H-3,cx=W>>1,St=RAMP.stone,R=RAMP.oak;
  const ry=8,rx=22,rimY=base-24;
  // the posts and the roof come first (behind), the stone ring in front
  for(const px of [cx-rx+3,cx+rx-5]){for(let y=14;y<rimY+2;y++){P(A,px,y,R[5]);P(A,px+1,y,R[3]);P(A,px+2,y,R[1]);}}
  for(let j=0;j<12;j++){const ww=rx-6+Math.round(j*.75);for(let i=-ww;i<=ww;i++){const row=Math.floor(j/3),sh=((i+ww+(row%2)*2)%4===0);let k=j%3===0?4:(i<-ww*.3?3:2);if(sh&&j%3!==0)k=1;if(j===0)k=5;P(A,cx+i,3+j,RAMP.walnut[k]);}}   // the front slope of a pitched roof: staggered shingle rows, the ridge lit
  for(let i=-rx+1;i<=rx-1;i++)P(A,cx+i,15,RAMP.walnut[0]);
  for(let x=cx-rx+5;x<cx+rx-4;x++){P(A,x,21,R[4]);P(A,x,22,R[2]);}rect(A,cx+rx-2,20,2,6,RAMP.ironW[3]);rect(A,cx+rx-2,25,4,2,R[4]);                      // the windlass and its crank
  for(let x=cx-4;x<cx+5;x++)P(A,x,21,RAMP.burlap[4]);for(let y=23;y<rimY-2;y++)P(A,cx,y,RAMP.burlap[3]);                                             // rope wound on it, hanging down
  {const by=rimY-8;for(let y=0;y<6;y++){const w=y<1?4:3;for(let x=-w;x<=w;x++)P(A,cx+x,by+y,R[x<0?4:2]);}hl(A,cx-3,by+1,7,RAMP.ironW[3]);hl(A,cx-3,by+4,7,RAMP.ironW[2]);}   // the bucket
  // the stone ring: dark water inside, the rim's top, uneven stones on the wall
  for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx)+y*y/(ry*ry);if(d>1)continue;const inner=x*x/((rx-4)*(rx-4))+y*y/((ry-3)*(ry-3));
    if(inner<=1){if(y<0||inner<.0)continue;P(A,cx+x,rimY+y,y<-1?RAMP.glass[0]:RAMP.glass[1]);continue;}P(A,cx+x,rimY+y,St[y<0?(x<0?5:4):(x<0?4:3)]);}
  for(let y=-ry+3;y<0;y++)for(let x=-rx+4;x<=rx-4;x++){const inner=x*x/((rx-4)*(rx-4))+y*y/((ry-3)*(ry-3));if(inner<=1&&!(cx+x>=cx-3&&cx+x<=cx+3&&rimY+y<rimY-2))P(A,cx+x,rimY+y,y<-3?St[1]:RAMP.glass[0]);}
  hl(A,cx-6,rimY,5,RAMP.glass[3]);                                                                                                                  // a glint far down
  {const rows=[[0,6],[6,5],[11,5]];for(let y=0;y<16;y++){const yy=rimY+ry-2+y;const ri=y<6?0:y<11?1:2,ry0=rows[ri][0];const seams=[[-22,-12,-1,10],[-22,-17,-5,6,16],[-22,-9,3,13]][ri];for(let x=-rx;x<=rx;x++){let k=x<-rx*.4?4:x<rx*.3?3:2;if(y===ry0)k=1;if(seams.includes(x))k=1;if(y===ry0+1&&!seams.includes(x))k=Math.min(5,k+1);P(A,cx+x,yy,St[k]);}}}   // big irregular stones, a quiet middle
  for(let i=0;i<14;i++){const mx=cx-4+i*2,my=base-1-((i*7)%4);P(A,mx,my,RAMP.green[2+(i%2)]);P(A,mx+1,my,RAMP.green[2]);}                               // moss on the lowest stones
  cast(cx-rx,cx+rx,base);}
// =================================================================================== outdoor: the farm cart with a load of pumpkins
if(K==='cart'){const base=H-3,R=RAMP.oak,I=RAMP.ironW;
  const x0=14,w=56,bedY=base-24,d=10;
  const wheel=(cx,cy,r,far)=>{for(let a=0;a<6.3;a+=.04){const X=Math.round(cx+Math.cos(a)*r),Y=Math.round(cy+Math.sin(a)*r);P(A,X,Y,far?I[1]:(a>3.6&&a<5.6?I[4]:I[2]));const X2=Math.round(cx+Math.cos(a)*(r-1)),Y2=Math.round(cy+Math.sin(a)*(r-1));P(A,X2,Y2,far?R[1]:R[a>3.6&&a<5.6?4:2]);}
    for(let k=0;k<10;k++){const a=k*Math.PI/5;for(let t=2;t<r-1;t++)P(A,Math.round(cx+Math.cos(a)*t),Math.round(cy+Math.sin(a)*t),far?R[1]:R[3]);}rect(A,cx-1,cy-1,3,3,I[far?1:3]);P(A,cx-1,cy-1,far?I[2]:RAMP.steel[2]);};
  wheel(x0+w-12,base-10,10,true);                                                                                                                    // the far wheel, darker, behind
  for(let i=0;i<14;i++){P(A,x0-i,bedY+10+Math.round(i*.8),R[4]);P(A,x0-i,bedY+11+Math.round(i*.8),R[1]);}                                            // the shafts reaching to the ground
  for(let j=0;j<d;j++)for(let i=0;i<w;i++)P(A,x0+i,bedY-d+j,R[1]);                                                                                    // the bed seen from above, dark between the sides
  const PK=RAMP.ochre;for(const [px,py,r] of [[x0+9,bedY-6,5],[x0+19,bedY-8,6],[x0+30,bedY-6,5],[x0+41,bedY-8,6],[x0+50,bedY-5,4],[x0+25,bedY-12,4],[x0+45,bedY-13,4]]){
    for(let y=-r;y<=r;y++)for(let x=-r-1;x<=r+1;x++){const d2=x*x/((r+1)*(r+1))+y*y/(r*r);if(d2>1)continue;const rib=Math.abs(x)===Math.round((r+1)*.45*Math.sqrt(Math.max(0,1-y*y/(r*r))));P(A,px+x,py+y,RAMP.pumpkin[(x+y<-r*.6?5:(x+y<r*.3?4:3))-(rib?1:0)]);}P(A,px-2,py-r+2,RAMP.ochre[5]);P(A,px,py-r,RAMP.green[3]);P(A,px,py-r-1,RAMP.green[2]);}   // pumpkins: dull orange, grooves curving with the shape, a highlight each
  for(let j=0;j<12;j++)for(let i=0;i<w;i++){const pl=Math.floor(j/4);const k=j%4===0?5:(j%4===3?1:(pl===2?2:3));P(A,x0+i,bedY+j,R[k]);}                    // the side boards, a lit top rail
  for(const sx of [x0,x0+w/2|0,x0+w-3]){for(let j=0;j<12;j++){P(A,sx,bedY+j,R[4]);P(A,sx+1,bedY+j,R[3]);P(A,sx+2,bedY+j,R[1]);}}                      // stakes
  wheel(x0+12,base-10,10,false);                                                                                                                     // the near wheel
  for(let x=x0-4;x<x0+w+4;x++)SH(x,base,120);cast(x0,x0+w,base);}
// =================================================================================== outdoor: a cast-iron hydrant
if(K==='hydrant'){const base=H-3,cx=W>>1,Rr=RAMP.rust,I=RAMP.charcoal;
  for(let y=base-18;y<base-3;y++)for(let x=-4;x<=4;x++){let k=x<-2?5:x<1?4:x<3?3:2;P(A,cx+x,y,Rr[k]);}
  for(let j=0;j<3;j++)for(let x=-5-(j>1?1:0);x<=5+(j>1?1:0);x++)P(A,cx+x,base-3+j,I[x<0?4:2]);                                                       // the near-black iron foot
  for(let j=0;j<5;j++){const w=j<1?2:(j<2?4:5);for(let x=-w;x<=w;x++)P(A,cx+x,base-23+j,Rr[j===0?5:(x<0?4:2)]);}P(A,cx,base-24,I[4]);P(A,cx-1,base-24,I[5]);
  for(const s2 of [-1,1]){const nx=s2<0?cx-8:cx+5;rect(A,nx,base-15,4,4,Rr[s2<0?5:3]);hl(A,nx,base-15,4,Rr[5]);rect(A,nx+(s2<0?0:3),base-14,1,2,I[3]);}   // big nozzle caps, lit on top
  for(let i=0;i<4;i++)P(A,cx-7+i,base-10+(i%2),I[4]);for(const [x,y] of [[1,-16],[-2,-9],[2,-7]])P(A,cx+x,base+y,I[3]);
  cast(cx-6,cx+6,base);}
// =================================================================================== wall decor: frames
function gilt(x,y,w,h){for(let i=0;i<w;i++){P(A,x+i,y,RAMP.brass[4]);P(A,x+i,y+1,RAMP.brass[2]);P(A,x+i,y+h-1,RAMP.brass[1]);P(A,x+i,y+h-2,RAMP.brass[3]);}
  for(let j=0;j<h;j++){P(A,x,y+j,RAMP.brass[4]);P(A,x+1,y+j,RAMP.brass[2]);P(A,x+w-1,y+j,RAMP.brass[1]);P(A,x+w-2,y+j,RAMP.brass[3]);}P(A,x,y,RAMP.brass[5]);P(A,x+1,y+1,RAMP.brass[5]);}
function wood(x,y,w,h,R){R=R||RAMP.walnut;for(let i=0;i<w;i++){P(A,x+i,y,R[4]);P(A,x+i,y+1,R[3]);P(A,x+i,y+h-1,R[0]);P(A,x+i,y+h-2,R[2]);}for(let j=0;j<h;j++){P(A,x,y+j,R[4]);P(A,x+1,y+j,R[3]);P(A,x+w-1,y+j,R[0]);P(A,x+w-2,y+j,R[1]);}}
function wallShadow(x0,x1,y0,y1){for(let y=y0;y<=y1;y++)SH(x1+1,y,90);for(let x=x0+1;x<=x1+1;x++)SH(x,y1+1,90);}
if(K==='mirror'){const x0=3,y0=3,w=W-6,h=H-6,R=RAMP.walnut;
  for(let y=y0+2;y<y0+h-2;y++)for(let x=x0+2;x<x0+w-2;x++){const t=(x-x0)+(y-y0)*.5;let c=RAMP.glass[NIGHT?0:((t>8&&t<11)?4:(y<y0+8?2:1))];if(!NIGHT&&y>y0+h-11){c=(x<x0+8)?RAMP.oak[1]:RAMP.walnut[2];if(y===y0+h-11)c=RAMP.oak[2];}P(A,x,y,c);}   // the glass: a sheen, and low down a dim warm slice of the room it faces
  if(NIGHT){const fx=x0+w-9,fy=y0+6;for(let y=0;y<14;y++)for(let x=-3;x<=3;x++){const head=y<7&&x*x/9+(y-3)*(y-3)/12<=1,sh=y>=7&&Math.abs(x)<=2+((y-7)>>1);if(head||sh)P(A,fx+x,fy+y,RAMP.ivory[head?(x<0?2:1):1]);}   // a pale face and shoulders that are not yours
    P(A,fx-1,fy+3,RAMP.walnut[0]);P(A,fx+1,fy+3,RAMP.walnut[0]);for(let i=0;i<5;i++)P(A,x0+4+i,y0+4+i,RAMP.glass[2]);}                       // dark eyes; a faint sheen line so it still reads as glass
  wood(x0,y0,w,h,R);for(let i=0;i<5;i++)P(A,x0+(w>>1)-2+i,y0-1-(i===2?1:0),R[i<2?4:2]);
  wallShadow(x0,x0+w-1,y0,y0+h-1);}
if(K==='painting_a'){const x0=1,y0=1,w=W-2,h=H-2;   // the farm at dusk: hills, the field, the barn, a lone figure
  for(let y=y0+2;y<y0+h-2;y++)for(let x=x0+2;x<x0+w-2;x++){const t=(y-y0)/h;let c=t<.25?RAMP.plum[3]:t<.42?RAMP.brick[3]:RAMP.green[2];if(t>.42&&t<.6&&Math.sin(x*.4)+(y-y0)*.3>4.5)c=RAMP.green[1];if(t>=.6)c=RAMP.ochre[(x+y)%5===0?2:3];P(A,x,y,c);}
  for(let x=x0+2;x<x0+w-2;x++){const hy=y0+8+Math.round(Math.sin(x*.3)*1.5);for(let y=hy;y<y0+13;y++)P(A,x,y,RAMP.green[1]);}                       // the hills against the sky
  rect(A,x0+w-13,y0+10,6,5,RAMP.brick[2]);for(let i=0;i<4;i++)hl(A,x0+w-14+i,y0+10-i,8-2*i,RAMP.walnut[1]);                                        // the barn
  vl(A,x0+10,y0+12,6,RAMP.walnut[0]);hl(A,x0+8,y0+13,5,RAMP.walnut[0]);P(A,x0+10,y0+11,RAMP.walnut[0]);                                            // the figure in the field, arms out
  P(A,x0+6,y0+4,RAMP.cream[5]);gilt(x0,y0,w,h);wallShadow(x0,x0+w-1,y0,y0+h-1);}
if(K==='painting_b'){const x0=1,y0=1,w=W-2,h=H-2;   // a portrait whose eyes someone gouged out
  for(let y=y0+2;y<y0+h-2;y++)for(let x=x0+2;x<x0+w-2;x++)P(A,x,y,RAMP.walnut[(x+y)%9===0?2:1]);
  const cx=x0+(w>>1),cy=y0+13;
  for(let y=y0+21;y<y0+h-2;y++)for(let x=cx-9;x<=cx+9;x++){if(Math.abs(x-cx)>(y-y0-19)+5)continue;P(A,x,y,RAMP.plum[x<cx-3?3:2]);}hl(A,cx-2,y0+21,5,RAMP.ivory[3]);   // dark shoulders, a pale collar
  for(let y=-7;y<=7;y++)for(let x=-5;x<=5;x++){if(x*x/25+y*y/52>1)continue;P(A,cx+x,cy+y,RAMP.ivory[x<-2?4:(x>2?2:3)]);}                          // the face
  for(let y=-11;y<=-1;y++)for(let x=-7;x<=7;x++){if(x*x/49+(y+4)*(y+4)/49>1)continue;if(x*x/25+y*y/52<=1&&y>-5)continue;P(A,cx+x,cy+y,RAMP.walnut[0]);}   // hair
  vl(A,cx,cy-1,3,RAMP.ivory[1]);P(A,cx+1,cy+1,RAMP.ivory[1]);hl(A,cx-2,cy+4,4,RAMP.brick[1]);                                                          // nose shadow, a thin mouth
  for(const ex of [-3,2]){hl(A,cx+ex-1,cy-2,3,RAMP.walnut[0]);hl(A,cx+ex-1,cy-1,3,RAMP.walnut[0]);P(A,cx+ex-2,cy-2,RAMP.cream[5]);P(A,cx+ex+2,cy-1,RAMP.cream[5]);
    for(let i=0;i<4;i++){P(A,cx+ex-2+i,cy-5+i,RAMP.cream[4]);}}                                                                                    // each eye a dark gouged slot with a pale torn rim, a scrape above it
  gilt(x0,y0,w,h);for(let i=0;i<w;i++){if(i%3===0)continue;P(A,x0+i,y0,RAMP.brass[3]);}wallShadow(x0,x0+w-1,y0,y0+h-1);}
if(K==='calendar'){const x0=2,y0=3,w=W-4,h=H-5;   // a paper calendar: October, the days crossed off, the 31st ringed
  for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)P(A,x,y,RAMP.cream[x===x0+w-1?2:(y<y0+8?4:4)]);rect(A,x0,y0,w,7,RAMP.brick[3]);hl(A,x0,y0,w,RAMP.brick[5]);
  drawText(A,'OCT',x0+(w>>1)-5,y0+1,RAMP.cream[5]);
  for(let r=0;r<4;r++)for(let c=0;c<5;c++){const gx=x0+2+c*4,gy=y0+10+r*4;rect(A,gx,gy,3,3,RAMP.cream[2]);if(r*5+c<16){P(A,gx,gy,RAMP.brick[3]);P(A,gx+2,gy+2,RAMP.brick[3]);P(A,gx+1,gy+1,RAMP.brick[4]);P(A,gx+2,gy,RAMP.brick[3]);P(A,gx,gy+2,RAMP.brick[3]);}}
  {const gx=x0+2+4*4,gy=y0+10+3*4;for(let a=0;a<6.3;a+=.4)P(A,Math.round(gx+1+Math.cos(a)*3),Math.round(gy+1+Math.sin(a)*3),RAMP.brick[4]);}            // the 31st, ringed
  P(A,x0+(w>>1),y0-1,RAMP.ironW[3]);wallShadow(x0,x0+w-1,y0,y0+h-1);}
if(K==='photowall'){   // five small frames, sepia photos, one askew, one cracked
  const fr=[[2,3,11,13],[15,1,13,11],[30,4,11,13],[6,18,13,11],[22,15,12,14]];
  fr.forEach(([x,y,w,h],i)=>{for(let j=2;j<h-2;j++)for(let k=2;k<w-2;k++)P(A,x+k,y+j,RAMP.ochre[(j+k)%5===0?1:(j<h/2?2:1)]);
    const cx=x+(w>>1);for(let j=0;j<4;j++)for(let k=-1;k<=1;k++)P(A,cx+k,y+h-3-j,RAMP.walnut[1]);P(A,cx,y+h-7,RAMP.walnut[1]);P(A,cx,y+h-8,RAMP.ochre[3]);   // a figure in each
    wood(x,y,w,h,i===2?RAMP.oak:RAMP.walnut);if(i===4){ln(A,x+3,y+2,x+w-4,y+h-3,RAMP.glass[5]);}wallShadow(x,x+w-1,y,y+h-1);});}
if(K==='coatpegs'){const y0=4;   // a peg rail, a long coat, a scarf, a hat
  for(let x=2;x<W-2;x++){P(A,x,y0,RAMP.oak[5]);P(A,x,y0+1,RAMP.oak[3]);P(A,x,y0+2,RAMP.oak[1]);}for(const px of [9,24,39]){P(A,px,y0+3,RAMP.oak[4]);P(A,px,y0+4,RAMP.oak[2]);}
  for(let y=0;y<34;y++){const w=y<2?2:(y<4?6:(y<26?6:6+Math.round((y-26)*.4)));for(let x=-w;x<=w;x++){let k=x<-w+2?4:(x>w-2?1:3);if(x===0&&y>4)k=2;if(y>=4&&y<20&&(x===-w+2||x===w-2))k=1;P(A,9+x,y0+4+y,RAMP.brick[k]);}}   // the long coat: a collar on the peg, square shoulders, sleeves hanging down its sides, the front opening
  for(const sx of [-6,5])for(let y=4;y<22;y++){P(A,9+sx,y0+4+y,RAMP.brick[sx<0?5:2]);P(A,10+sx,y0+4+y,RAMP.brick[sx<0?4:1]);}hl(A,4,y0+25,4,RAMP.brick[2]);hl(A,14,y0+25,4,RAMP.brick[1]);   // the sleeves and their cuffs
  for(let y=0;y<16;y++){P(A,24,y0+4+y,RAMP.bluegrey[3]);P(A,25,y0+4+y,RAMP.bluegrey[2]);if(y>12){P(A,23,y0+4+y,RAMP.bluegrey[3]);P(A,26,y0+4+y,RAMP.bluegrey[1]);}}   // the scarf
  for(let y=0;y<5;y++)for(let x=-4-(y>3?2:0);x<=4+(y>3?2:0);x++)P(A,39+x,y0+4+y,RAMP.walnut[y===4?2:(x<0?3:2)]);                                     // a hat
  for(let x=3;x<W-1;x++)SH(x,y0+3,80);for(let y=y0+5;y<y0+38;y++)SH(17,y,70);}
function poster(kind){const x0=2,y0=2,w=W-4,h=H-4;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)P(A,x,y,RAMP.cream[x===x0+w-1||y===y0+h-1?2:4]);
  P(A,x0+1,y0+1,RAMP.ironW[3]);P(A,x0+w-2,y0+1,RAMP.ironW[3]);hl(A,x0+w-6,y0+h-1,5,RAMP.cream[1]);                                                 // tacks, a curled corner
  if(kind==='lost'){drawText(A,'LOST',x0+4,y0+3,RAMP.walnut[0]);const px=x0+5,py=y0+10,pw=w-10;rect(A,px,py,pw,14,RAMP.stone[4]);const cx=px+(pw>>1);for(let y=0;y<7;y++)for(let x=-3;x<=3;x++)if(x*x/9+(y-3)*(y-3)/12<1)P(A,cx+x,py+3+y,RAMP.ivory[x<0?3:2]);hl(A,cx-3,py+3,7,RAMP.walnut[1]);hl(A,cx-3,py+4,3,RAMP.walnut[1]);P(A,cx-1,py+6,RAMP.walnut[0]);P(A,cx+1,py+6,RAMP.walnut[0]);hl(A,cx-1,py+8,2,RAMP.brick[2]);for(let x=-4;x<=4;x++)P(A,cx+x,py+11+(Math.abs(x)>2?1:0),RAMP.stone[2]);hl(A,cx-1,py+11,3,RAMP.cream[4]);frame(A,px,py,pw,14,RAMP.stone[5],RAMP.stone[2]);drawText(A,'AGE 9',x0+3,y0+h-8,RAMP.walnut[0]);}
  if(kind==='fair'){rect(A,x0+2,y0+2,w-4,8,RAMP.blue[2]);drawText(A,'FAIR',x0+5,y0+4,RAMP.cream[5]);drawText(A,'OCT',x0+4,y0+14,RAMP.walnut[0]);drawText(A,'31',x0+4,y0+21,RAMP.brick[4]);
    for(let y=y0+h-12;y<y0+h-6;y++)for(let x=x0+w-10;x<x0+w-4;x++)if((x-x0-w+7)*(x-x0-w+7)+(y-y0-h+9)*(y-y0-h+9)<8)P(A,x,y,RAMP.cream[3]);}   // a faint ring stain
  if(kind==='seeds'){rect(A,x0+2,y0+2,w-4,4,RAMP.brick[3]);drawText(A,'SEED',x0+4,y0+8,RAMP.walnut[0]);drawText(A,'CO.',x0+4,y0+15,RAMP.walnut[0]);
    for(let y=-3;y<=3;y++)for(let x=-4;x<=4;x++){if(x*x/16+y*y/9>1)continue;P(A,x0+w-8+x,y0+h-9+y,RAMP.pumpkin[x+y<-2?5:(Math.abs(x)===2?2:4)]);}P(A,x0+w-8,y0+h-13,RAMP.green[3]);}
  wallShadow(x0,x0+w-1,y0,y0+h-1);}
if(K==='poster_lost')poster('lost');if(K==='poster_fair')poster('fair');if(K==='poster_seeds')poster('seeds');
if(K==='hangplant'){const cx=W>>1;   // a macrame hanger, a clay pot, trailing vines
  for(let i=0;i<14;i++){P(A,cx-Math.round(i*.45),2+i,RAMP.burlap[4]);P(A,cx+Math.round(i*.45),2+i,RAMP.burlap[3]);P(A,cx,2+i,RAMP.burlap[4]);}P(A,cx,1,RAMP.ironW[3]);
  for(let y=0;y<7;y++){const w=7-Math.floor(y/2);for(let x=-w;x<=w;x++)P(A,cx+x,16+y,RAMP.pumpkin[y===0?4:(x<-w+2?3:(x>w-2?1:2))]);}hl(A,cx-7,16,15,RAMP.pumpkin[5]);
  for(const [sx,len,dir] of [[-6,21,-1],[-2,13,0],[3,18,1],[6,9,1],[-4,6,-1]])for(let j=0;j<len;j++){const x=cx+sx+Math.round(Math.sin(j*.5)*dir),y=17+j;P(A,x,y,RAMP.green[j%3===0?5:4]);if(j%3===1){P(A,x+(dir||1),y,RAMP.green[5]);P(A,x-(dir||1),y,RAMP.green[3]);}}
  for(let x=-6;x<=6;x++)P(A,cx+x,15,RAMP.green[x%2?3:4]);}
if(K==='plant'||K==='plant2'){const base=H-3,cx=W>>1,tall=K==='plant2';
  const pot=(top,w,h)=>{for(let y=0;y<h;y++){const ww=w-Math.round(y*.25);for(let x=-ww;x<=ww;x++)P(A,cx+x,top+y,RAMP.pumpkin[y<2?(x<0?5:4):(x<-ww+2?4:(x>ww-2?1:2))]);}hl(A,cx-w,top,w*2+1,RAMP.pumpkin[5]);};
  if(!tall){const fronds=[[-2.7,16],[-2.2,14],[-1.7,12],[-1.2,13],[-.6,15],[-.3,11],[-3.0,12]];   // fern fronds: arching midribs with alternating leaflets, two drooping over the rim
    fronds.forEach(([ang,len],i)=>{let x=cx,y=base-12;for(let t=0;t<len;t++){const a=ang+t*.05*(ang<-1.5?-1:1),droop=i===0||i===6?t*.08:0;x+=Math.cos(a);y+=Math.sin(a)*.85+droop;const X=Math.round(x),Y=Math.round(y);P(A,X,Y,RAMP.green[2]);
      if(t>1&&t%2===0){const side=(t%4===0)?1:-1;const nx=Math.round(-Math.sin(a)*side),ny=Math.round(Math.cos(a)*side);P(A,X+nx,Y+ny,RAMP.green[t<len*.6?4:3]);P(A,X+2*nx,Y+2*ny,RAMP.green[t<len*.6?5:4]);}}});
    pot(base-12,7,12);}
  else{for(let y=base-50;y<base-14;y++){P(A,cx-1,y,RAMP.bark[4]);P(A,cx,y,RAMP.bark[3]);P(A,cx+1,y,RAMP.bark[1]);}                                     // a 3 px trunk, its lit edge
    for(const [lx,ly,r,back] of [[cx+5,base-66,6,1],[cx-6,base-64,5,1],[cx-6,base-58,8,0],[cx+7,base-56,6,0],[cx,base-70,5,1],[cx+1,base-60,4,0],[cx-2,base-49,4,0]]){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y*1.3>r*r)continue;const l=-(x+y)/r;P(A,lx+x,ly+y,RAMP.green[(l>.6?4:(l>-.2?3:2))-back]);}}   // three sizes of leaf clump, the back ones a step darker
    pot(base-14,9,14);}
  cast(cx-7,cx+7,base);}
// =================================================================================== shop and workshop props
if(K==='sawhorse'){const base=H-3,R=RAMP.pine;
  const horse=(cx)=>{for(const s2 of [-1,1])for(let j=0;j<16;j++){const x=cx+s2*Math.round(j*.35);P(A,x,base-16+j,R[s2<0?4:2]);P(A,x+1,base-16+j,R[1]);}hl(A,cx-4,base-17,9,R[5]);hl(A,cx-4,base-16,9,R[2]);};
  horse(14);horse(W-16);
  for(let i=4;i<W-4;i++){P(A,i,base-21,RAMP.pine[5]);P(A,i,base-20,RAMP.pine[4]);P(A,i,base-19,RAMP.pine[3]);P(A,i,base-18,RAMP.pine[1]);}rect(A,W-5,base-21,2,4,RAMP.oak[4]);   // a plank across, its sawn end
  const cut=Math.round(W*.58);for(let y=base-21;y<base-17;y++)P(A,cut,y,RAMP.walnut[0]);                                                              // the cut, half through
  for(let j=0;j<12;j++){const x=cut-Math.round(j*.8),y=base-22-Math.round(j*.55);P(A,x,y,RAMP.steel[j%2?3:4]);P(A,x+1,y,RAMP.steel[2]);}rect(A,cut-14,base-31,5,4,RAMP.oak[4]);P(A,cut-12,base-30,RAMP.walnut[0]);   // the saw left in it
  for(let i=0;i<9;i++)P(A,cut-3+((i*5)%9),base-((i*3)%3),RAMP.cream[(i%2)?4:3]);cast(6,W-6,base);}
if(K==='chickcrate'){const base=H-3,x0=3,w=W-6,R=RAMP.pine,top=base-20;
  box3(x0,top,w,7,13,R,{facePw:5});rect(A,x0+3,top+9,w-6,9,RAMP.walnut[1]);                                                                       // the crate, its open front
  for(let x=x0+3;x<x0+w-3;x+=3)vl(A,x,top+9,9,RAMP.steel[2]);hl(A,x0+3,top+13,w-6,RAMP.steel[2]);                                                    // wire mesh
  for(const [cx,cy] of [[x0+8,top+15],[x0+15,top+14],[x0+23,top+15],[x0+30,top+14],[x0+36,top+15]]){for(let y=-2;y<=1;y++)for(let x=-2;x<=2;x++){if(x*x+y*y>5)continue;P(A,cx+x,cy+y,RAMP.ochre[x+y<-1?5:4]);}P(A,cx+1,cy-1,RAMP.walnut[0]);P(A,cx+2,cy,RAMP.pumpkin[4]);}   // chicks behind the wire
  for(let i=0;i<8;i++)P(A,x0+2+i*5,top+1+(i%2),RAMP.straw[4]);cast(x0,x0+w,base);}
if(K==='feedbins'){const base=H-3,R=RAMP.oak;const names=['OAT','CORN','MASH'];const bw=Math.floor((W-8)/3);
  for(let i=0;i<3;i++){const x0=4+i*bw,top=base-30;box3(x0,top+6,bw-2,6,18,R,{facePw:6});
    if(i===1){for(let y=top+7;y<top+12;y++)for(let x=x0+2;x<x0+bw-4;x++)P(A,x,y,RAMP.ochre[(x+y)%3===0?5:4]);for(let j=0;j<6;j++)for(let k=0;k<bw-2;k++)P(A,x0+k,top+j-2,R[j===0?5:(k<2?4:3)]);}   // one lid propped open, the corn showing
    else{rect(A,x0,top+3,bw-2,3,R[4]);hl(A,x0,top+3,bw-2,R[5]);}
    rect(A,x0+3,top+15,bw-8,7,RAMP.cream[3]);hl(A,x0+3,top+15,bw-8,RAMP.cream[4]);drawText(A,names[i],x0+4,top+16,RAMP.walnut[1]);                 // a stencilled card
    if(i!==1){rect(A,x0+bw-10,top+1,6,3,RAMP.steel[3]);hl(A,x0+bw-10,top+1,6,RAMP.steel[4]);hl(A,x0+bw-14,top+2,4,RAMP.oak[4]);}}                    // a scoop on the lid
  cast(4,W-4,base);}
if(K==='mailsacks'){const base=H-3,Bp=RAMP.burlap;
  const sack=(cx,by,rw,h)=>{for(let y=0;y<h;y++){const t=y/h;const w=Math.round(rw*(t<.2?.5+t*2.5:1));for(let x=-w;x<=w;x++){const l=-x/w*.55-(t-.45)*.6;P(A,cx+x,by-h+y,Bp[l>.45?5:l>.1?4:l>-.25?3:2]);}}};
  sack(11,base,8,20);sack(25,base,8,15);drawText(A,'US',7,base-12,RAMP.blue[1]);drawText(A,'US',21,base-9,RAMP.blue[1]);
  for(const [x,y] of [[16,base-1],[31,base-2]]){rect(A,x,y-2,5,3,RAMP.cream[4]);hl(A,x,y-2,5,RAMP.cream[5]);P(A,x+3,y-2,RAMP.brick[4]);}               // letters spilling out
  for(let x=2;x<34;x++)SH(x,base+1,110);}
if(K==='produce'){const base=H-3,R=RAMP.oak,x0=3,w=W-6;
  const tier=(y,depth,face)=>{for(let j=0;j<depth;j++)for(let i=0;i<w;i++)P(A,x0+i,y+j,R[1]);for(let j=0;j<face;j++)for(let i=0;i<w;i++)P(A,x0+i,y+depth+j,R[j===0?5:(j===face-1?1:3)]);};
  const fruit=(x0b,y0b,wb,kind)=>{for(let i=0;i<Math.floor(wb/4);i++)for(let j=0;j<2;j++){const cx=x0b+2+i*4+(j%2)*2,cy=y0b+2+j*3;const C=kind==='apple'?RAMP.brick:kind==='squash'?RAMP.ochre:kind==='gourd'?RAMP.pumpkin:RAMP.straw;
    for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){if(Math.abs(x)+Math.abs(y)>(kind==='corn'?2:1))continue;P(A,cx+x,cy+y,C[x+y<0?5:(x+y===0?4:2)]);}if(kind==='apple')P(A,cx,cy-2,RAMP.green[3]);}};
  tier(base-46,9,4);tier(base-29,9,4);for(const lx of [x0+1,x0+w-4])for(let y=base-33;y<base;y++){P(A,lx,y,R[4]);P(A,lx+1,y,R[2]);P(A,lx+2,y,R[1]);}
  const kinds=[['apple','gourd','squash','corn'],['gourd','apple','corn','squash']];
  for(let t=0;t<2;t++){const ty=t===0?base-48:base-31;const bw=Math.floor(w/4);for(let k=0;k<4;k++){fruit(x0+k*bw,ty,bw-1,kinds[t][k]);if(t===1)rect(A,x0+k*bw+bw/2-4|0,ty+11,8,4,RAMP.cream[4]);}}
  for(let k=0;k<4;k++){const bw=Math.floor(w/4);P(A,x0+k*bw+(bw>>1)-2,base-19,RAMP.walnut[1]);P(A,x0+k*bw+(bw>>1),base-19,RAMP.walnut[1]);}             // chalk prices, smudged
  cast(x0,x0+w,base);}
if(K==='seedrack'){const base=H-3,x0=3,w=W-6,R=RAMP.oak;
  rect(A,x0,4,w,base-8,R[1]);wood(x0,4,w,base-8,R);
  const PK=[RAMP.brick,RAMP.green,RAMP.ochre,RAMP.pumpkin,RAMP.plum,RAMP.blue];
  for(let r=0;r<6;r++)for(let c=0;c<4;c++){const px=x0+3+c*10,py=8+r*11;if((r*4+c)%7===5)continue;const C=PK[(r*3+c*2)%PK.length];
    rect(A,px,py,8,9,RAMP.cream[4]);hl(A,px,py,8,RAMP.cream[5]);rect(A,px+1,py+2,6,5,C[3]);P(A,px+2,py+3,C[5]);P(A,px+4,py+4,RAMP.green[3]);hl(A,px+1,py+8,6,RAMP.cream[2]);}   // packets with a picture each, one or two sold
  for(let r=0;r<6;r++)hl(A,x0+2,17+r*11,w-4,RAMP.ironW[3]);cast(x0,x0+w,base);}
if(K==='tank'){const base=H-3,x0=3,w=W-6,R=RAMP.walnut;
  const top=base-30;box3(x0-1,top+22,w+2,0,8,R,{facePw:6});rect(A,x0+6,top+24,w-12,5,RAMP.cream[3]);hl(A,x0+6,top+24,w-12,RAMP.cream[4]);drawText(A,'LIVE BAIT',x0+9,top+24,RAMP.walnut[1]);
  for(let y=top;y<top+22;y++)for(let x=x0;x<x0+w;x++){let c=RAMP.glass[y<top+4?3:(y<top+12?2:1)];if(x===x0||x===x0+w-1||y===top)c=RAMP.steel[3];P(A,x,y,c);}   // the glass tank, murky water
  for(let i=0;i<7;i++){const fx=x0+6+((i*13)%(w-14)),fy=top+6+((i*7)%12);hl(A,fx,fy,3,RAMP.steel[4]);P(A,fx+3,fy,RAMP.steel[2]);}                    // minnows
  for(let i=0;i<5;i++)P(A,x0+8+i*11,top+2+(i%2),RAMP.glass[5]);for(let x=x0+2;x<x0+w-2;x+=7)vl(A,x,top+18,4,RAMP.green[2]);cast(x0,x0+w,base);}
if(K==='toolwall'){const x0=2,y0=3,w=W-4,h=H-6;   // a pegboard: painted outlines show where each tool hangs; one outline is empty
  for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++)P(A,x,y,(x%3===1&&y%3===1)?RAMP.burlap[1]:RAMP.burlap[3]);wood(x0,y0,w,h,RAMP.oak);
  const outline=(x,y,ww,hh)=>{for(let i=0;i<ww;i++){P(A,x+i,y,RAMP.cream[2]);P(A,x+i,y+hh-1,RAMP.cream[2]);}for(let j=0;j<hh;j++){P(A,x,y+j,RAMP.cream[2]);P(A,x+ww-1,y+j,RAMP.cream[2]);}};
  const hammer=(x,y)=>{for(let j=0;j<14;j++){P(A,x+1,y+3+j,RAMP.oak[4]);P(A,x+2,y+3+j,RAMP.oak[2]);}rect(A,x-2,y,8,3,RAMP.steel[3]);hl(A,x-2,y,8,RAMP.steel[4]);};
  const saw=(x,y)=>{for(let j=0;j<16;j++){const ww=3+Math.floor(j/4);for(let i=0;i<ww;i++)P(A,x+i,y+5+j,RAMP.steel[i===0?4:2]);if(j%2)P(A,x+ww,y+5+j,RAMP.steel[1]);}rect(A,x-1,y,6,5,RAMP.oak[4]);P(A,x+1,y+2,RAMP.walnut[0]);};
  const wrench=(x,y,l)=>{for(let j=0;j<l;j++){P(A,x,y+j,RAMP.steel[4]);P(A,x+1,y+j,RAMP.steel[2]);}hl(A,x-1,y,4,RAMP.steel[3]);P(A,x,y+1,RAMP.burlap[3]);};
  hammer(x0+6,y0+6);saw(x0+18,y0+5);wrench(x0+34,y0+7,12);wrench(x0+39,y0+7,15);wrench(x0+44,y0+7,18);
  outline(x0+51,y0+5,7,22);                                                                                                                             // an empty outline: something is missing
  hammer(x0+63,y0+6);vl(A,x0+70,y0+8,16,RAMP.steel[3]);hl(A,x0+68,y0+8,5,RAMP.oak[3]);wallShadow(x0,x0+w-1,y0,y0+h-1);}
if(K==='saddle'){const base=H-3,cx=W>>1,L=RAMP.brick;
  for(const s2 of [-1,1])for(let j=0;j<18;j++){const x=cx+s2*(4+Math.round(j*.4));P(A,x,base-18+j,RAMP.oak[s2<0?4:2]);P(A,x+1,base-18+j,RAMP.oak[1]);}   // a saddle stand
  hl(A,cx-8,base-19,17,RAMP.oak[5]);hl(A,cx-8,base-18,17,RAMP.oak[2]);
  for(let y=-8;y<=4;y++)for(let x=-14;x<=14;x++){const d=x*x/196+(y+2)*(y+2)/40;if(d>1)continue;let k=y<-4?5:(y<0?4:3);if(x>8)k-=1;if(Math.abs(x)===10&&y>-5)k=2;P(A,cx+x,base-26+y,L[Math.max(1,k)]);}   // the seat and skirts
  for(let y=-14;y<=-9;y++)for(let x=-3;x<=3;x++){if(x*x/9+(y+11)*(y+11)/9>1)continue;P(A,cx-11+x,base-26+y+4,L[x<0?5:3]);}                                // the horn
  for(let x=-12;x<=12;x+=3)P(A,cx+x,base-25,RAMP.cream[3]);                                                                                             // stitching
  for(let j=0;j<10;j++)P(A,cx+9,base-24+j,L[1]);rect(A,cx+7,base-14,5,3,RAMP.steel[3]);hl(A,cx+7,base-14,5,RAMP.steel[4]);                                  // a stirrup hanging
  cast(cx-10,cx+10,base);}
if(K==='shovels'||K==='rods'){const base=H-3,x0=3,w=W-6,R=RAMP.oak;
  hl(A,x0,base-30,w,R[5]);hl(A,x0,base-29,w,R[2]);hl(A,x0,base-4,w,R[4]);hl(A,x0,base-3,w,R[1]);for(const lx of [x0,x0+w-2])for(let y=base-34;y<base;y++){P(A,lx,y,R[4]);P(A,lx+1,y,R[1]);}   // a rack: two rails, two posts
  if(K==='shovels'){const tools=[['spade',x0+6],['fork',x0+14],['shovel',x0+22]];
    for(const [t,x] of tools){for(let y=4;y<base-14;y++){P(A,x,y,RAMP.oak[4]);P(A,x+1,y,RAMP.oak[2]);}hl(A,x-1,3,4,RAMP.oak[4]);
      const by=base-14;if(t==='fork'){for(const dx of [-2,0,2,4])for(let j=0;j<9;j++)P(A,x+dx-1+(dx>0?1:0),by+j,RAMP.steel[dx<1?4:2]);hl(A,x-2,by,6,RAMP.steel[3]);}
      else{for(let j=0;j<10;j++){const ww=t==='shovel'?(j<7?3:2-Math.floor((j-7)/2)):3;for(let i=-ww;i<=ww;i++)P(A,x+i,by+j,RAMP.steel[i<0?4:(i>1?1:3)]);}}}}
  else{for(let k=0;k<4;k++){const x=x0+5+k*6,top=3+k*3;for(let y=top;y<base-4;y++){P(A,x,y,y<top+20?RAMP.walnut[3]:RAMP.oak[3]);if(y>base-16)P(A,x+1,y,RAMP.walnut[1]);}
      rect(A,x+1,base-18,3,3,RAMP.steel[3]);P(A,x+2,base-17,RAMP.steel[5]);for(let y=top;y<base-18;y+=5)P(A,x+1,y,RAMP.brass[3]);                             // a reel, the line guides
      for(let y=top;y<top+10;y++)if(k%2===0)P(A,x-1+Math.round((y-top)*.1),y,RAMP.cream[2]);}}
  cast(x0,x0+w,base);}
const flat=flatten([A,B],W,H);const O=outline(flat);for(let i=0;i<O.d.length;i+=4)if(O.d[i+3]){O.d[i]=Math.max(O.d[i],40);O.d[i+1]=Math.max(O.d[i+1],25);O.d[i+2]=Math.max(O.d[i+2],22);}const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
