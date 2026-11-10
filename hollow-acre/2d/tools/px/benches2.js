// ---- the yard workbenches, redrawn in three-quarter view: a planked top you look down onto, a front apron, legs front and back,
// a lower shelf, and the tools of each trade standing up off the top with their own light and shadow. Light comes from the upper left.
SEED=CFG.seed||7;
const W=CFG.w,H=CFG.h,K=CFG.kind;
const A=layer('art',W,H),B=layer('details',W,H),SHD=layer('shadow',W,H);
const hexR=a=>a.map(HEX);
const RAMP={
  sage:hexR(['#1c2620','#2c4033','#3c5945','#527459','#759670','#a2bb93']),
  honey:hexR(['#28160b','#472913','#6c401f','#915e2e','#b67f42','#d6a562']),
  oak:hexR(['#1e140f','#352418','#4f3724','#694b32','#836142','#9c7a57']),
  dark:hexR(['#1a120e','#2c1f18','#433024','#5c4432','#785a42','#977657']),
  leather:hexR(['#28110b','#472014','#6c321f','#91482b','#b3643c','#cf8858']),
  clay:hexR(['#38150b','#5f2518','#873a22','#ad5732','#cc7a4a','#e49e6c']),
  soil:hexR(['#1a120c','#2a1d14','#3a2a1d','#4e3a28','#644c34']),
  iron:hexR(['#15161c','#25272f','#383b46','#50545f','#6f7480','#959aa5']),
  steel:hexR(['#2a3442','#45546a','#677a92','#93a6bc','#c4d2e0','#eef4fa']),
  burlap:hexR(['#4a3b26','#6c583a','#8e7750','#ad966a','#c9b386','#e0cfa6']),
  stone:hexR(['#211f24','#36333a','#4f4b54','#6c6770','#8c868e','#aea8ae']),
  leaf:hexR(['#1c2c14','#2c4520','#41632c','#5a843a','#7aa64c']),
  copper:hexR(['#4a1e10','#7a3418','#a8522a','#cc7440','#e89a62','#f6c08e']),
  brass:hexR(['#4a3410','#7a5a1a','#a8822c','#cfa646','#ecca6e','#f8e4a0']),
  cream:hexR(['#5a4d3b','#8a7a5e','#b8a682','#d6c8a2','#ece2c4','#f8f2de']),
};
const SHC=[0x32,0x21,0x25];const SH=(x,y,a)=>P(SHD,x,y,SHC,a);
function cast(x0,x1,base){for(let x=x0+2;x<=x1+5;x++){SH(x,base+1,150);SH(x+1,base+2,110);}for(let x=x0+4;x<=x1+6;x++)SH(x,base+3,60);}
// ---------------------------------------------------------------- the bench body
// top: planks running left-right, seams every 4-5 rows, grain flecks, a bright front lip and a dark back edge
function plankTop(x0,y0,w,d,R,opts){opts=opts||{};const seams=[];for(let y=4;y<d-1;y+=4+((hsh(y,3,SEED)*2)|0))seams.push(y);
  for(let y=0;y<d;y++)for(let x=0;x<w;x++){let k=3;const pl=seams.filter(s=>s<=y).length;
    if(seams.includes(y))k=1;else{const g=hsh(x>>2,pl,SEED*7);k=g>.82?4:g<.16?2:3;if(hsh(x,y,SEED)>.93)k=Math.max(1,k-1);}
    if(y===0)k=2;if(y===d-1)k=5;if(y===d-2)k=4;
    // board ends, staggered
    if(!seams.includes(y)&&((x+pl*17)%29===0))k=1;
    if(opts.paint&&hsh(x,y,SEED+5)>.9)k=Math.min(5,k+1);P(A,x0+x,y0+y,R[k]);}
  // a knot or two
  for(let i=0;i<2;i++){const kx=x0+4+((hsh(i,9,SEED)*(w-8))|0),ky=y0+2+((hsh(i,10,SEED)*(d-5))|0);P(A,kx,ky,R[1]);P(A,kx+1,ky,R[2]);}
  // the back edge sits in shade, the far corners a touch darker
  hl(A,x0,y0,w,R[1]);P(A,x0,y0+1,R[2]);P(A,x0+w-1,y0+1,R[1]);}
// front apron with a lip shadow under the top, a pair of nail heads per board end
function apron(x0,y,w,h,R){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=j===0?1:j===h-1?0:2;if(j===1)k=2;if(hsh(i>>3,j,SEED+2)>.86&&j>0&&j<h-1)k=3;P(A,x0+i,y+j,R[k]);}
  for(let i=6;i<w-4;i+=14){P(A,x0+i,y+2,PAL.slate[4]);P(A,x0+i+1,y+2,PAL.slate[2]);}vl(A,x0,y,h,R[3]);vl(A,x0+w-1,y,h,R[0]);}
// a square leg: lit left face, shaded right face, a little foot
function leg(x,y,h,R,back){const r=back?R.map((c,i)=>R[Math.max(0,i-1)]):R;rect(A,x,y,4,h,r[2]);vl(A,x,y,h,r[4]);vl(A,x+1,y,h,r[3]);vl(A,x+3,y,h,r[1]);hl(A,x,y+h-1,4,r[1]);}
// the whole bench: returns where things go
function bench(o){const R=o.R,w=o.w,x0=o.x0!==undefined?o.x0:(W-w)>>1,base=H-3,d=o.d||13,ap=o.ap||6;const top=base-(o.legH||16)-ap-d;const fy=top+d,ly=fy+ap,legH=base-ly+1;
  // back legs: set in from the ends, rising behind the apron, a little higher (they stand further away)
  for(const lx of [x0+4,x0+w-8])leg(lx,top+4,legH+ap+d-8,R,true);
  // lower shelf: boards between the legs, seen from above a little
  if(o.shelf){const sy=base-o.shelf;for(let j=0;j<4;j++)hl(A,x0+3,sy+j,w-6,R[j===0?4:j===3?1:3]);for(let i=x0+5;i<x0+w-5;i+=9)P(A,i,sy+1,R[2]);}
  plankTop(x0,top,w,d,R,o);apron(x0,fy,w,ap,R);
  for(const lx of [x0+1,x0+w-5])leg(lx,ly,legH,R,false);
  // stretcher between the front legs, low
  hl(A,x0+5,base-5,w-10,R[3]);hl(A,x0+5,base-4,w-10,R[1]);
  // shadow: dark under the top, soft on the ground, darkest at the feet
  for(let y=ly;y<=base;y++)for(let x=x0+1;x<x0+w-1;x++){if(G(A,x,y))continue;SH(x,y,Math.round(70+(y-ly)*4));}
  for(let x=x0-3;x<x0+w+4;x++){SH(x,base+1,120);SH(x,base,150);}for(const lx of [x0+1,x0+w-5])for(let i=-1;i<6;i++)SH(lx+i,base+1,200);cast(x0,x0+w,base);
  return {x0,w,top,d,fy,ly,base,cx:x0+(w>>1)};}
// ---------------------------------------------------------------- things that sit on benches
// a small cast shadow on the bench top under an object, to the lower right
function contact(x,y,w,a){for(let i=0;i<w;i++){const c=G(A,x+i,y);if(c)P(A,x+i,y,shade(c,a||.7));const c2=G(A,x+i+1,y+1);if(c2&&i<w-1)P(A,x+i+1,y+1,shade(c2,.85));}}
function blobL(L,cx,cy,rx,ry,R,lift){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx+.01)+y*y/(ry*ry+.01);if(d>1)continue;
    const l=-x/(rx+.01)*.55-y/(ry+.01)*.65+(lift||0);let k=l>.55?5:l>.25?4:l>-.1?3:l>-.45?2:1;if(d>.8&&(x>0||y>0))k=Math.max(0,k-1);P(L,cx+x,cy+y,R[k]);}}
// clay pot, seen a little from above: rim ellipse, tapering body, soil, an optional sprout
function pot(cx,by,r,sprout){const R=RAMP.clay,h=Math.round(r*1.5);for(let y=0;y<h;y++){const w=Math.round(r-(y/h)*r*.35);for(let x=-w;x<=w;x++){const l=-x/w*.6+(y<2?.4:0);P(A,cx+x,by-h+y,R[l>.45?4:l>.1?3:l>-.3?2:1]);}}
  for(let x=-r-1;x<=r+1;x++){P(A,cx+x,by-h-1,R[x<0?5:4]);P(A,cx+x,by-h,R[x<-r/2?4:3]);}
  for(let x=-r+1;x<=r-1;x++)P(A,cx+x,by-h-2,RAMP.soil[x<0?3:2]);for(let x=-r;x<=r;x++)P(A,cx+x,by-h-3,null);
  for(let x=-r+1;x<=r-1;x++){P(A,cx+x,by-h-2,RAMP.soil[2]);}hl(A,cx-r,by-h-1,2*r+1,R[5]);
  if(sprout){const L=RAMP.leaf;vl(A,cx,by-h-6,4,L[2]);P(A,cx-1,by-h-6,L[3]);P(A,cx-2,by-h-7,L[4]);P(A,cx+1,by-h-5,L[3]);P(A,cx+2,by-h-6,L[4]);P(A,cx+3,by-h-6,L[3]);if(sprout>1){P(A,cx-1,by-h-8,L[3]);P(A,cx,by-h-8,L[4]);}}}
// a seedling tray: wooden rim, dark soil, rows of two-leaf sprouts
function tray(x,y,w,d){const R=RAMP.honey;rect(A,x,y,w,d,R[3]);hl(A,x,y,w,R[4]);hl(A,x,y+d-1,w,R[1]);vl(A,x,y,d,R[4]);vl(A,x+w-1,y,d,R[2]);
  for(let j=1;j<d-1;j++)for(let i=1;i<w-1;i++)P(A,x+i,y+j,RAMP.soil[(i+j)%5===0?3:j===1?1:2]);
  const L=RAMP.leaf;for(let i=2;i<w-2;i+=3)for(let j=2;j<d-1;j+=3){P(A,x+i,y+j,L[2]);P(A,x+i-1,y+j-1,L[4]);P(A,x+i+1,y+j-1,L[3]);}
  hl(A,x+1,y+d,w,RAMP.sage[1]);}
// a burlap sack, slumped, tied at the neck
function sack(cx,by,r,h){const R=RAMP.burlap;for(let y=0;y<h;y++){const t=y/h;const w=Math.round(r*(t<.25?.55+t*1.6:1-(t-.25)*.15));for(let x=-w;x<=w;x++){const l=-x/w*.55-(t-.5)*.5;let k=l>.5?4:l>.15?3:l>-.25?2:1;if((x+y*3)%4===0&&k>1)k--;P(A,cx+x,by-h+y,R[k]);}}
  hl(A,cx-2,by-h+3,5,RAMP.dark[2]);P(A,cx-1,by-h-1,R[3]);P(A,cx,by-h-2,R[4]);P(A,cx+1,by-h-1,R[2]);hl(A,cx-r+1,by,2*r-1,R[0]);}
// seed packets: little paper envelopes with a picture square
function packet(x,y,c){const R=RAMP.cream;rect(A,x,y,5,7,R[2]);hl(A,x,y,5,R[3]);vl(A,x+4,y,7,R[2]);hl(A,x,y+6,5,R[2]);rect(A,x+1,y+2,3,3,c);P(A,x+1,y+2,shade(c,1.25));contact(x+1,y+7,5);}
// a hand trowel lying on the top
function trowel(x,y){const S=RAMP.steel;for(let i=0;i<5;i++){P(A,x+i,y,S[4]);P(A,x+i,y+1,S[2]);}P(A,x+5,y,S[3]);P(A,x+5,y+1,S[1]);P(A,x+6,y,S[2]);
  for(let i=0;i<5;i++){P(A,x-1-i,y+1+(i>2?1:0),RAMP.honey[4]);P(A,x-1-i,y+2+(i>2?1:0),RAMP.honey[2]);}contact(x-5,y+3,11);}
// a vise: iron jaws on the front edge, a wooden screw bar sticking out toward you
function vise(x,y){const I=RAMP.iron;rect(A,x,y,8,5,I[3]);hl(A,x,y,8,I[5]);vl(A,x,y,5,I[4]);vl(A,x+7,y,5,I[1]);hl(A,x,y+4,8,I[1]);rect(A,x+1,y+5,6,4,I[2]);vl(A,x+1,y+5,4,I[3]);
  rect(A,x+3,y+9,2,3,I[2]);for(let i=-4;i<=11;i++){P(A,x+i,y+11,RAMP.honey[4]);P(A,x+i,y+12,RAMP.honey[2]);}P(A,x-5,y+11,RAMP.honey[3]);P(A,x+12,y+11,RAMP.honey[3]);P(A,x-5,y+12,RAMP.honey[1]);P(A,x+12,y+12,RAMP.honey[1]);}
// a plank held across the bench
function board(x,y,w){const R=RAMP.honey;for(let i=0;i<w;i++){P(A,x+i,y,R[5]);P(A,x+i,y+1,R[4]);P(A,x+i,y+2,R[3]);P(A,x+i,y+3,R[1]);if(hsh(i,2,SEED)>.85)P(A,x+i,y+2,R[2]);}vl(A,x+w-1,y,4,R[2]);contact(x+1,y+4,w);}
// a hand plane: wooden body, iron blade, a front knob
function plane(x,y){const R=RAMP.dark,I=RAMP.iron;rect(A,x,y,11,4,R[3]);hl(A,x,y,11,R[5]);hl(A,x,y+3,11,R[1]);vl(A,x,y,4,R[4]);rect(A,x+4,y-2,3,3,I[3]);P(A,x+4,y-2,I[5]);P(A,x+6,y-1,I[1]);
  rect(A,x+8,y-2,2,2,R[4]);P(A,x+8,y-2,R[5]);rect(A,x+1,y-3,3,3,R[2]);P(A,x+1,y-3,R[4]);contact(x+1,y+4,11);}
// wood shavings: little cream curls
function shavings(x,y,n){const R=RAMP.cream;for(let i=0;i<n;i++){const sx=x+((hsh(i,1,SEED)*6)|0),sy=y+((hsh(i,2,SEED)*3)|0);P(A,sx,sy,R[5]);P(A,sx+1,sy,R[4]);P(A,sx+1,sy+1,R[3]);P(A,sx,sy+1,R[2]);}}
// a saw leaning up against the back of the bench, its toothed blade standing up past the top
function saw(x,y,h){const S=RAMP.steel,R=RAMP.honey;for(let j=0;j<h;j++){const w=Math.round(4+j*.18);for(let i=0;i<w;i++)P(A,x+i-j*0.25,y+j,S[i===0?5:i===w-1?1:3]);if(j%2===0)P(A,x-1-j*.25,y+j,S[1]);}
  rect(A,x+1-h*.25,y+h,6,5,R[3]);hl(A,x+1-h*.25,y+h,6,R[5]);vl(A,x+6-h*.25,y+h,5,R[1]);rect(A,x+2-h*.25,y+h+1,3,2,R[1]);}
// a pegboard on two uprights behind the bench, with a hanging panel saw, a try-square and a mallet
function toolBoard(x,y,w,h){const R=RAMP.oak,S=RAMP.steel,I=RAMP.iron;for(const px of [x,x+w-3]){rect(A,px,y,3,h+2,R[2]);vl(A,px,y,h+2,R[4]);vl(A,px+2,y,h+2,R[0]);}
  for(let j=0;j<h-2;j++)hl(A,x+3,y+1+j,w-6,j%5===4?R[1]:R[2]);hl(A,x+1,y,w-2,R[5]);hl(A,x+1,y+1,w-2,R[3]);for(let j=y+4;j<y+h-2;j+=4)for(let i=x+6;i<x+w-4;i+=4)P(A,i,j,R[1]);
  // panel saw: a long blade narrowing to the tip, teeth along the bottom, a wooden handle with a hole
  const sx=x+6,sy=y+4;for(let i=0;i<17;i++){const hgt=Math.round(7-i*.25);for(let j=0;j<hgt;j++)P(A,sx+i,sy+j,S[j===0?5:j===hgt-1?1:i<3?4:3]);if(i%2===0)P(A,sx+i,sy+hgt,S[1]);}
  rect(A,sx-5,sy,6,8,R[4]);vl(A,sx-5,sy,8,R[5]);hl(A,sx-5,sy+7,6,R[1]);rect(A,sx-3,sy+2,2,3,R[1]);P(A,sx+3,sy-1,I[4]);
  // try-square: steel blade and a dark stock in an L
  const qx=x+w-16;for(let j=0;j<10;j++){P(A,qx,y+4+j,RAMP.dark[3]);P(A,qx+1,y+4+j,RAMP.dark[2]);}for(let i=0;i<8;i++){P(A,qx+2+i,y+12,S[5]);P(A,qx+2+i,y+13,S[2]);}
  // mallet
  const mx=x+w-8;vl(A,mx+1,y+6,8,R[4]);vl(A,mx+2,y+6,8,R[2]);rect(A,mx-1,y+3,6,4,R[3]);hl(A,mx-1,y+3,6,R[5]);hl(A,mx-1,y+6,6,R[1]);P(A,mx+1,y+2,I[4]);}
// a grindstone: a stone wheel on an axle over a little trough, with a crank
function grindstone(cx,cy,r){const S=RAMP.stone,R=RAMP.dark,I=RAMP.iron;
  // frame posts and trough
  for(const px of [cx-r-3,cx+r+1]){rect(A,px,cy-2,3,r+12,R[2]);vl(A,px,cy-2,r+12,R[4]);vl(A,px+2,cy-2,r+12,R[0]);}
  rect(A,cx-r-1,cy+r-1,2*r+2,5,R[2]);hl(A,cx-r-1,cy+r-1,2*r+2,R[4]);for(let i=0;i<2*r;i++)P(A,cx-r+i,cy+r,[54,84,104]);for(let i=0;i<2*r;i+=3)P(A,cx-r+i,cy+r,[110,150,170]);
  // the wheel: an upright disc seen almost edge-on from the front-left, thick rim, textured face
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=(x*x+y*y)/(r*r);if(d>1)continue;let k=(-x-y)>r*.4?4:3;if(d>.66){const l=-x-y;k=l>1?5:l<-1?1:2;}P(A,cx+x,cy+y,S[k]);}   // a smooth face, its rim lit top-left, dark bottom-right
  rect(A,cx-1,cy-1,3,3,I[3]);P(A,cx-1,cy-1,I[5]);rect(A,cx+2,cy,r+3,2,I[3]);hl(A,cx+2,cy,r+3,I[4]);vl(A,cx+r+5,cy-4,6,I[3]);rect(A,cx+r+4,cy-6,3,3,R[4]);P(A,cx+r+4,cy-6,R[5]);
  // a little spray of sparks
  for(const [dx,dy] of [[r-1,-r+2],[r+1,-r],[r+3,-r+1],[r+2,-r-2],[r+4,-r-1]]){P(B,cx+dx,cy+dy,[255,214,120]);P(B,cx+dx+1,cy+dy,[255,170,80]);}}
// a rack of pegs on two posts behind the bench, with a blade and a club hanging on it
function rack(x,y,w,h){const R=RAMP.dark,S=RAMP.steel;for(const px of [x,x+w-3]){rect(A,px,y,3,h,R[2]);vl(A,px,y,h,R[4]);vl(A,px+2,y,h,R[0]);P(A,px,y,R[5]);}
  for(const ry of [y+3,y+h-6]){hl(A,x+3,ry,w-6,R[4]);hl(A,x+3,ry+1,w-6,R[2]);for(let i=x+6;i<x+w-4;i+=7){P(A,i,ry-1,R[5]);P(A,i,ry-2,R[3]);}}
  // a machete hanging: a long steel blade with a dark grip
  for(let j=0;j<h-6;j++){P(A,x+8,y+4+j,S[j<2?4:3]);P(A,x+9,y+4+j,S[j>h-12?2:5]);P(A,x+10,y+4+j,S[1]);}rect(A,x+8,y+1,3,4,RAMP.leather[2]);hl(A,x+8,y+1,3,RAMP.leather[4]);
  // a club, fat end down
  for(let j=0;j<h-6;j++){const w2=j>h-12?3:2;for(let i=0;i<w2;i++)P(A,x+w-10+i,y+3+j,RAMP.honey[i===0?4:i===w2-1?2:3]);}}
// a sickle lying on the bench: a copper crescent with a wooden grip
function sickle(x,y){const C=RAMP.copper;for(let a=0;a<3.1;a+=.08){const X=Math.round(x+6+Math.cos(a+3.3)*6),Y=Math.round(y+Math.sin(a+3.3)*3.5);P(A,X,Y,C[a<1.2?5:a<2.3?4:2]);P(A,X,Y+1,C[1]);}
  for(let i=0;i<5;i++){P(A,x+12+i,y+i*.4+1,RAMP.honey[4]);P(A,x+12+i,y+i*.4+2,RAMP.honey[2]);}contact(x+2,y+3,15);}
// a dress form on a stand wearing a riveted leather vest
function dressForm(cx,by,h){const L=RAMP.steel.map((c,i)=>RAMP.iron[Math.min(5,i+1)]),R=RAMP.dark,Bz=RAMP.brass;rect(A,cx-1,by-12,3,12,R[3]);vl(A,cx-1,by-12,12,R[5]);vl(A,cx+1,by-12,12,R[1]);
  // a three-footed stand
  for(let i=0;i<6;i++){P(A,cx-1-i,by+(i>>1),R[4]);P(A,cx+1+i,by+(i>>1),R[2]);}vl(A,cx,by,3,R[3]);for(let i=-7;i<=7;i++)SH(cx+i,by+3,150);
  const top=by-12-h;for(let y=0;y<h;y++){const t=y/h;const w=Math.round(t<.12?4+t*50:t<.45?10-(t-.12)*6:t<.6?8:8+(t-.6)*5);for(let x=-w;x<=w;x++){const l=-x/w*.6-(t-.4)*.3;let k=l>.45?4:l>.1?3:l>-.3?2:1;P(A,cx+x,top+y,L[k]);}}
  // neck knob, collar, stitching, rivets down the front
  {const I=RAMP.iron;for(let y=-7;y<=0;y++)for(let x=-5;x<=5;x++){if(x*x+(y+1)*(y+1)*1.2>28)continue;const l=-x*.5-y*.4;P(A,cx+x,top-2+y,I[l>1.6?5:l>.4?4:l>-1?3:2]);}hl(A,cx-5,top-1,11,I[1]);hl(A,cx-2,top-3,5,RAMP.ink?RAMP.iron[0]:I[0]);}   // a helmet with a visor slit
  hl(A,cx-3,top+1,7,L[5]);for(let y=top+4;y<top+h-1;y+=3){P(B,cx-2,y,Bz[4]);P(B,cx+2,y,Bz[3]);}
  for(let y=top+3;y<top+h-1;y+=2)P(A,cx,y,L[1]);}
// a leather hide spread on the top, stitched round the edge
function hide(x,y,w,d){const L=RAMP.leather;for(let j=0;j<d;j++)for(let i=0;i<w;i++){const ex=Math.min(i,w-1-i),ey=Math.min(j,d-1-j);if(ex+ey<2)continue;if(hsh(i,j,SEED)>.97&&ex<3)continue;
    const l=.2-j/d*.4+(hsh(i>>1,j>>1,SEED)-.5)*.3;P(A,x+i,y+j,L[l>.15?4:l>-.1?3:2]);}
  for(let i=3;i<w-3;i+=2){P(A,x+i,y+1,RAMP.cream[4]);P(A,x+i,y+d-2,RAMP.cream[3]);}contact(x+2,y+d,w-2);}
// shears: two crossed steel blades with dark loops
function shears(x,y){const S=RAMP.steel;for(let i=0;i<8;i++){P(A,x+i,y+i*.25,S[5]);P(A,x+i,y+3-i*.25,S[3]);}P(A,x+8,y+2,S[4]);
  for(const [dx,dy] of [[-3,-1],[-3,4]]){for(let a=0;a<6.3;a+=.7)P(A,Math.round(x+dx+Math.cos(a)*1.6),Math.round(y+dy+Math.sin(a)*1.4),RAMP.dark[1]);}contact(x-3,y+6,12);}
// a round tin of brass rivets
function rivetTin(cx,cy){const I=RAMP.iron,Bz=RAMP.brass;blobL(A,cx,cy,4,2,I);for(let x=-3;x<=3;x++){P(A,cx+x,cy+2,I[1]);P(A,cx+x,cy+3,I[1]);}for(const [dx,dy] of [[-2,0],[0,-1],[1,0],[2,-1],[-1,1]])P(B,cx+dx,cy+dy,Bz[4]);}
// a hammer lying down
function hammer(x,y){const R=RAMP.honey,I=RAMP.iron;for(let i=0;i<9;i++){P(A,x+i,y,R[4]);P(A,x+i,y+1,R[2]);}rect(A,x+9,y-2,3,6,I[3]);vl(A,x+9,y-2,6,I[5]);vl(A,x+11,y-2,6,I[1]);contact(x,y+2,12);}
// ---------------------------------------------------------------- the benches
const V=CFG.view||'S';
if(V==='S'&&K==='bench_farm'){   // a potting bench in old green paint: shelf of pots behind, a seedling tray, packets, a trowel, a sack below
  const b=bench({R:RAMP.sage,w:56,d:14,ap:6,legH:17,shelf:7,paint:1});
  // the back board and its shelf, standing up from the back edge
  const sy=b.top-12;for(const px of [b.x0+2,b.x0+b.w-5]){rect(A,px,sy-2,3,14,RAMP.sage[2]);vl(A,px,sy-2,14,RAMP.sage[4]);vl(A,px+2,sy-2,14,RAMP.sage[0]);}
  for(let j=0;j<10;j++)hl(A,b.x0+5,sy+j,b.w-10,RAMP.sage[j%4===0?1:2]);hl(A,b.x0+3,sy-3,b.w-6,RAMP.sage[4]);hl(A,b.x0+3,sy-2,b.w-6,RAMP.sage[3]);hl(A,b.x0+3,sy-1,b.w-6,RAMP.sage[1]);
  pot(b.x0+12,sy-3,3,2);pot(b.x0+22,sy-3,2,1);pot(b.x0+40,sy-3,3,0);
  // hanging trowel and twine on the board
  P(A,b.x0+31,sy+1,RAMP.iron[4]);for(let j=0;j<5;j++){P(A,b.x0+31,sy+2+j,RAMP.honey[3]);}for(let j=0;j<4;j++){P(A,b.x0+30,sy+7+j,RAMP.steel[4]);P(A,b.x0+31,sy+7+j,RAMP.steel[2]);P(A,b.x0+32,sy+7+j,RAMP.steel[1]);}
  ell(A,b.x0+44,sy+5,2,2,RAMP.burlap[3]);P(A,b.x0+43,sy+4,RAMP.burlap[5]);
  tray(b.x0+4,b.top+3,17,8);packet(b.x0+24,b.top+3,[200,70,50]);packet(b.x0+30,b.top+4,[220,170,50]);trowel(b.x0+43,b.top+9);
  pot(b.x0+46,b.top+7,4,2);
  // soil spilled on the top
  for(let i=0;i<7;i++)P(A,b.x0+22+((hsh(i,4,SEED)*20)|0),b.top+10+((hsh(i,5,SEED)*3)|0),RAMP.soil[2]);
  sack(b.x0+14,b.base-7,6,9);for(let i=0;i<3;i++)pot(b.x0+36+i*6,b.base-7,2,0);}
if(V==='S'&&K==='bench_furn'){   // a carpenter's bench: a vise on the corner holding a board, a plane and its shavings, a saw leaning, planks on the shelf
  const b=bench({R:RAMP.oak,w:58,d:14,ap:7,legH:16,shelf:7});
  toolBoard(b.x0+6,b.top-19,b.w-12,18);
  board(b.x0+8,b.top+4,30);vise(b.x0+2,b.top+8);plane(b.x0+40,b.top+6);shavings(b.x0+28,b.top+8,7);
  // a chair leg turned on a lathe, lying at the back
  for(let i=0;i<14;i++){const w2=i%5===2?2:1;for(let k=0;k<w2;k++)P(A,b.x0+20+i,b.top+1+k,RAMP.honey[k?2:4]);}
  // planks stacked on the shelf, ends showing
  for(let j=0;j<3;j++){const y=b.base-8-j*2;for(let i=0;i<b.w-14;i++){P(A,b.x0+7+i,y,RAMP.honey[j===2?5:4]);P(A,b.x0+7+i,y+1,RAMP.honey[2]);}rect(A,b.x0+7,y,2,2,RAMP.honey[1]);}}
if(V==='S'&&K==='bench_weapon'){ // a grinding bench: the grindstone at one end, a sickle on the dark top, a rack of blades behind
  const b=bench({R:RAMP.dark,w:58,d:13,ap:7,legH:16,shelf:7});
  rack(b.x0+24,b.top-20,30,20);
  grindstone(b.x0+11,b.top-4,8);
  {const S=RAMP.steel,x=b.x0+24,y=b.top+6;for(let i=0;i<16;i++){P(A,x+i,y,S[5]);P(A,x+i,y+1,S[3]);P(A,x+i,y+2,S[1]);}P(A,x+16,y+1,S[4]);   // a sword on the top: a long bright blade,
   vl(A,x-1,y-2,7,RAMP.iron[4]);vl(A,x-2,y-2,7,RAMP.iron[2]);for(let i=0;i<4;i++){P(A,x-3-i,y+1,RAMP.leather[3]);P(A,x-3-i,y+2,RAMP.leather[1]);}P(A,x-8,y+1,RAMP.iron[4]);contact(x-6,y+3,22);}   // its guard and grip
  hammer(b.x0+40,b.top+9);
  // a whetstone block
  rect(A,b.x0+44,b.top+2,8,3,RAMP.stone[3]);hl(A,b.x0+44,b.top+2,8,RAMP.stone[5]);hl(A,b.x0+44,b.top+4,8,RAMP.stone[1]);contact(b.x0+45,b.top+5,8);
  // iron bars and a coal scuttle below
  for(let j=0;j<2;j++)for(let i=0;i<3;i++){const x=b.x0+8+i*7,y=b.base-9+j*2;rect(A,x,y,6,2,RAMP.iron[3]);hl(A,x,y,6,RAMP.iron[5]);}
  for(let y=0;y<6;y++)for(let x=0;x<9;x++)P(A,b.x0+36+x,b.base-11+y,y<2?[30,30,34]:RAMP.iron[y===5?0:1]);for(let i=0;i<5;i++)P(A,b.x0+37+i*2,b.base-12,[20,20,24]);}
if(V==='S'&&K==='bench_armor'){  // a leatherworker's bench: a dress form in a riveted vest, a hide with its stitching, shears, a tin of rivets, a roll of leather below
  const b=bench({R:RAMP.oak,w:50,d:13,ap:6,legH:16,shelf:7,x0:W-53});
  dressForm(11,b.base-3,22);
  hide(b.x0+12,b.top+2,22,9);shears(b.x0+38,b.top+3);rivetTin(b.x0+44,b.top+9);hammer(b.x0+14,b.top+11);
  // a roll of leather on the shelf
  for(let j=0;j<7;j++)for(let i=0;i<20;i++){const l=.4-j/7*.8;P(A,b.x0+20+i,b.base-13+j,RAMP.leather[l>.2?4:l>-.2?3:2]);}for(let j=0;j<7;j++){P(A,b.x0+19,b.base-13+j,RAMP.leather[1]);P(A,b.x0+40,b.base-13+j,RAMP.leather[2]);}
  for(let a=0;a<6.3;a+=.5)P(A,Math.round(b.x0+40+Math.cos(a)*2),Math.round(b.base-10+Math.sin(a)*2.6),RAMP.leather[a<3?4:1]);}
if(V==='S'&&K==='furnace'){      // a fieldstone furnace: the top seen from above with the chimney rising from the back, a glowing mouth, bellows, coal
  const S=RAMP.stone,cx=W>>1,base=H-3,w=30,topY=base-36,d=8;
  // body: rounded fieldstones with mortar, lit from the left
  const stones=[];for(let y=topY+d;y<base;y+=5)for(let x=cx-w/2+((y/5|0)%2?3:0);x<cx+w/2;x+=6+((hsh(x,y,SEED)*2)|0))stones.push([x,y]);
  for(let y=topY+d;y<base;y++)for(let x=cx-w/2;x<cx+w/2;x++)P(A,x,y,S[1]);
  for(const [sx0,sy0] of stones){const sw=5+((hsh(sx0,sy0,3)*2)|0),sh=4;for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const X=sx0+i,Y=sy0+j;if(X<cx-w/2||X>=cx+w/2||Y>=base)continue;if((i===0||i===sw-1)&&(j===0||j===sh-1))continue;
      const side=(X-(cx-w/2))/w;let k=j===0?4:i===0?4:j===sh-1||i===sw-1?2:3;if(side>.72)k=Math.max(1,k-1);if(side<.2)k=Math.min(5,k+1);P(A,X,Y,S[k]);}}
  // the top: a slab you look down onto
  for(let j=0;j<d;j++)for(let i=-w/2;i<w/2;i++)P(A,cx+i,topY+j,S[j===0?2:j===d-1?5:(hsh(i,j,SEED)>.8?3:4)]);hl(A,cx-w/2,topY+d,w,S[1]);
  // chimney from the back of the top
  const chx=cx+2;for(let y=topY-20;y<topY+3;y++)for(let x=-4;x<=4;x++){const k=x<-2?4:x>2?1:(((y>>2)+(x>0?1:0))%2?3:2);P(A,chx+x,y,S[k]);}
  for(let y=topY-23;y<topY-20;y++)for(let x=-5;x<=5;x++)P(A,chx+x,y,S[y===topY-23?5:x>3?2:4]);for(let x=-3;x<=3;x++)P(A,chx+x,topY-23,[24,22,26]);
  // a wisp of smoke
  for(const [dx,dy] of [[0,-26],[1,-28],[-1,-30],[0,-32],[2,-33]])P(B,chx+dx,topY+dy,[150,146,150],140);
  // the mouth: an arch, red-hot inside, coals glowing
  const my=base-15;for(let y=0;y<13;y++)for(let x=-7;x<=7;x++){const dy=Math.max(0,6-y);if(x*x+dy*dy*1.6>49)continue;const deep=Math.abs(x)/7+y/13;
    P(A,cx+x,my+y,y<3?[52,18,10]:y>9?[(255-Math.abs(x)*10)|0,(180-Math.abs(x)*12)|0,60]:deep<.7?[250,150,50]:[200,80,30]);}
  for(let x=-8;x<=8;x++){P(A,cx+x,my+13,S[5]);P(A,cx+x,my+14,S[3]);}for(let a=3.3;a<6.2;a+=.09)P(A,Math.round(cx+Math.cos(a)*8),Math.round(my+6+Math.sin(a)*7.5),S[a<4.4?5:a<5.4?4:2]);
  for(const [dx,dy] of [[-3,10],[0,11],[3,10],[-1,9],[2,9]])P(B,cx+dx,my+dy,[255,230,140]);
  // bellows leaning on the right
  const bx=cx+w/2-2,by=base-10;for(let j=0;j<9;j++){const ww=Math.round(5-Math.abs(j-4)*.6);for(let i=0;i<ww;i++)P(A,bx+i,by+j,RAMP.leather[i===0?4:i===ww-1?1:3]);}rect(A,bx+1,by-4,2,5,RAMP.honey[3]);vl(A,bx+1,by-4,5,RAMP.honey[5]);P(A,bx+5,by+8,RAMP.iron[3]);P(A,bx+6,by+9,RAMP.iron[2]);
  // a heap of coal at the foot
  for(let i=0;i<12;i++){const X=cx-w/2-1+((hsh(i,1,SEED)*9)|0),Y=base-1-((hsh(i,2,SEED)*4)|0);P(A,X,Y,[34,32,38]);P(A,X+1,Y,[22,20,24]);if(i%3===0)P(A,X,Y-1,[70,68,78]);}
  // ground shadow and the glow on the ground in front
  for(let x=cx-w/2-3;x<cx+w/2+4;x++){SH(x,base,160);SH(x,base+1,110);}cast(cx-w/2,cx+w/2,base);for(let x=-6;x<=6;x++)P(B,cx+x,base,[255,150,60],60);}

// ================================================================ turned views (owner: every bench turns; each view drawn, never rendered)
// E: the bench turned so its front faces right. You see its left end: the planked top running away from you (boards now run
// up the sprite), the end rail, the near legs, the far legs higher up; the back board or rack is a thin wall along the left edge.
// N: seen from behind: the back of the tool board stands nearest, braced boards, the top and the apron peeking out round it.
function plankTopV(x0,y0,w,L,R){const seams=[];for(let x=4;x<w-1;x+=4+((hsh(x,3,SEED)*2)|0))seams.push(x);
  for(let y=0;y<L;y++)for(let x=0;x<w;x++){let k=3;const pl=seams.filter(s=>s<=x).length;
    if(seams.includes(x))k=1;else{const g=hsh(pl,y>>2,SEED*7);k=g>.82?4:g<.16?2:3;if(hsh(x,y,SEED)>.93)k=Math.max(1,k-1);}
    if(y===0)k=1;if(y===L-1)k=5;if(y===L-2)k=4;if(x===0)k=Math.min(5,k+1);if(x===w-1)k=Math.max(0,k-1);
    if(!seams.includes(x)&&((y+pl*13)%23===0))k=1;P(A,x0+x,y0+y,R[k]);}}
function benchSide(o){const R=o.R,wD=o.d*2,L=Math.round(o.w/2),x0=(W-wD)>>1,base=H-3,ap=o.ap||6;const top=base-(o.legH||16)-ap-L;const fy=top+L,ly=fy+ap,legH=base-ly+1;
  for(const lx of [x0+2,x0+wD-6])leg(lx,top+3,legH+ap+L-6,R,true);
  if(o.shelf){const sy=base-o.shelf;for(let j=0;j<4;j++)hl(A,x0+3,sy+j,wD-6,R[j===0?4:j===3?1:3]);}
  plankTopV(x0,top,wD,L,R);apron(x0,fy,wD,ap,R);
  for(const lx of [x0+1,x0+wD-5])leg(lx,ly,legH,R,false);
  hl(A,x0+5,base-5,wD-10,R[3]);hl(A,x0+5,base-4,wD-10,R[1]);
  for(let y=ly;y<=base;y++)for(let x=x0+1;x<x0+wD-1;x++){if(G(A,x,y))continue;SH(x,y,Math.round(70+(y-ly)*4));}
  for(let x=x0-3;x<x0+wD+4;x++){SH(x,base+1,120);SH(x,base,150);}for(const lx of [x0+1,x0+wD-5])for(let i=-1;i<6;i++)SH(lx+i,base+1,200);cast(x0,x0+wD,base);
  return {x0,wD,L,top,fy,ly,base,cx:x0+(wD>>1)};}
// a thin wall standing along the left edge of the top (the back board turned edge-on): its lit top edge runs away up the sprite,
// its near end shows as a narrow post
function edgeWall(x,top,L,h,R,sliver){for(let y=top-h;y<top+L-h;y++){P(A,x,y,R[5]);P(A,x+1,y,R[4]);P(A,x+2,y,R[4]);P(A,x+3,y,R[3]);P(A,x+4,y,R[2]);}   // its top edge, 5 px deep
  for(let y=top+L-h;y<top+L;y++){P(A,x,y,R[3]);P(A,x+1,y,R[2]);P(A,x+2,y,R[2]);P(A,x+3,y,R[1]);P(A,x+4,y,R[0]);}hl(A,x,top+L-h,5,R[5]);         // its near end
  if(sliver)sliver(x+5,top-h,L);for(let y=top-h;y<top+L;y++)SH(x+5+(sliver?2:0),y,80);}
function benchBack(o){const R=o.R,w=o.w,x0=o.x0!==undefined?o.x0:(W-w)>>1,base=H-3,d=o.d||13,ap=o.ap||6;const top=base-(o.legH||16)-ap-d;const fy=top+d,ly=fy+ap,legH=base-ly+1;
  for(const lx of [x0+4,x0+w-8])leg(lx,top+4,legH+ap+d-8,R,true);
  plankTop(x0,top,w,d,R,o);apron(x0,fy,w,ap,R);
  for(const lx of [x0+1,x0+w-5])leg(lx,ly,legH,R,false);
  hl(A,x0+5,base-5,w-10,R[3]);hl(A,x0+5,base-4,w-10,R[1]);
  for(let y=ly;y<=base;y++)for(let x=x0+1;x<x0+w-1;x++){if(G(A,x,y))continue;SH(x,y,Math.round(70+(y-ly)*4));}
  for(let x=x0-3;x<x0+w+4;x++){SH(x,base+1,120);SH(x,base,150);}cast(x0,x0+w,base);
  return {x0,w,top,d,fy,ly,base,cx:x0+(w>>1)};}
// the back of a board: vertical boards, two cross battens, nail heads, posts at the ends
function boardBack(x,y,w,h,R){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=((i+3)%7===0)?1:(hsh(i>>1,j>>2,SEED+9)>.85?3:2);if(j===0)k=4;P(A,x+i,y+j,R[k]);}
  for(const by of [y+3,y+h-4]){hl(A,x+1,by,w-2,R[3]);hl(A,x+1,by+1,w-2,R[1]);for(let i=x+4;i<x+w-3;i+=7)P(A,i,by,PAL.slate[4]);}
  for(const px of [x-1,x+w-2]){rect(A,px,y-1,3,h+1,R[2]);vl(A,px,y-1,h+1,R[4]);vl(A,px+2,y-1,h+1,R[0]);}hl(A,x-1,y-1,w+2,R[5]);
  for(let i=0;i<w;i++)SH(x+i,y+h,140);}
if(V!=='S'&&K==='bench_farm'){
  const o={R:RAMP.sage,w:56,d:14,ap:6,legH:17,shelf:7,paint:1};
  if(V==='E'){const b=benchSide(o);edgeWall(b.x0+1,b.top,b.L,12,RAMP.sage);
    tray(b.x0+8,b.top+6,14,7);pot(b.x0+11,b.top+b.L-2,3,2);pot(b.x0+19,b.top+b.L-2,3,1);packet(b.x0+16,b.top+15,[200,70,50]);
    sack(b.cx,b.base-7,5,9);}
  else{const b=benchBack(o);pot(b.x0+12,b.top-11,3,2);pot(b.x0+40,b.top-11,3,0);boardBack(b.x0+3,b.top-8,b.w-6,14,RAMP.sage);
    pot(b.x0+46,b.top+12,3,1);sack(b.x0+40,b.base-7,6,9);}}
if(V!=='S'&&K==='bench_furn'){
  const o={R:RAMP.oak,w:58,d:14,ap:7,legH:16,shelf:7};
  if(V==='E'){const b=benchSide(o);edgeWall(b.x0+1,b.top,b.L,18,RAMP.oak,(x,y,L)=>{for(let j=0;j<16;j++){P(A,x,y+4+j,RAMP.steel[5]);P(A,x+1,y+4+j,RAMP.steel[2]);}rect(A,x,y+1,3,4,RAMP.oak[4]);
      for(let j=0;j<9;j++)P(A,x,y+L-12+j,RAMP.dark[3]);hl(A,x,y+L-4,4,RAMP.steel[4]);rect(A,x,y+L-18,4,3,RAMP.oak[3]);});
    for(let j=0;j<b.L-6;j++){P(A,b.x0+9,b.top+3+j,RAMP.honey[5]);P(A,b.x0+10,b.top+3+j,RAMP.honey[4]);P(A,b.x0+11,b.top+3+j,RAMP.honey[3]);P(A,b.x0+12,b.top+3+j,RAMP.honey[1]);}
    contact(b.x0+10,b.top+b.L-3,4);plane(b.x0+15,b.top+16);shavings(b.x0+14,b.top+6,5);vise(b.x0+b.wD-10,b.top+b.L-6);
    for(let j=0;j<3;j++){const y=b.base-8-j*2;for(let i=0;i<b.wD-8;i++){P(A,b.x0+4+i,y,RAMP.honey[j===2?5:4]);P(A,b.x0+4+i,y+1,RAMP.honey[2]);}}}
  else{const b=benchBack(o);boardBack(b.x0+6,b.top-17,b.w-12,18,RAMP.honey);for(let i=0;i<4;i++)P(A,b.x0+20+i*5,b.top-18,RAMP.steel[4]);}}
if(V!=='S'&&K==='bench_weapon'){
  const o={R:RAMP.dark,w:58,d:13,ap:7,legH:16,shelf:7};
  if(V==='E'){const b=benchSide(o);edgeWall(b.x0+1,b.top,b.L,20,RAMP.dark,(x,y,L)=>{for(const yy of [y+3,y+12]){for(let j=0;j<12;j++){P(A,x,yy+j,RAMP.steel[5]);P(A,x+1,yy+j,RAMP.steel[3]);}hl(A,x-1,yy-1,4,RAMP.iron[4]);rect(A,x,yy-4,2,3,RAMP.leather[2]);}});
    // the grindstone turned: a wheel seen edge-on, 6 px wide, its tread lit, the hub and axle standing out, the crank toward you, the trough under it
    const gx=b.x0+b.wD-10,gy=b.top+b.L-12;rect(A,gx-6,gy+6,12,4,RAMP.dark[2]);hl(A,gx-6,gy+6,12,RAMP.dark[4]);
    for(let y=-8;y<=8;y++){const ww=Math.round(3.2*Math.sqrt(1-(y*y)/72));for(let x=-ww;x<=ww;x++)P(A,gx+x,gy+y,RAMP.stone[x<=-ww+1?5:x>=ww-1?1:(y<0?4:3)]);}
    rect(A,gx-7,gy-1,14,3,RAMP.iron[3]);hl(A,gx-7,gy-1,14,RAMP.iron[5]);rect(A,gx-2,gy-2,4,5,RAMP.iron[2]);hl(A,gx-2,gy-2,4,RAMP.iron[4]);vl(A,gx+6,gy-6,6,RAMP.iron[3]);rect(A,gx+5,gy-8,3,3,RAMP.dark[4]);
    for(const [dx,dy] of [[-4,-9],[-6,-8],[-5,-11]])P(B,gx+dx,gy+dy,[255,214,120]);
    {const S=RAMP.steel,x=b.x0+9,y=b.top+3;for(let j=0;j<14;j++){P(A,x,y+j,S[5]);P(A,x+1,y+j,S[3]);P(A,x+2,y+j,S[1]);}hl(A,x-2,y+14,7,RAMP.iron[4]);for(let j=0;j<4;j++){P(A,x+1,y+15+j,RAMP.leather[3]);}contact(x,y+19,4);}
    hammer(b.x0+14,b.top+20);
    for(let i=0;i<3;i++){rect(A,b.x0+5+i*7,b.base-9,6,2,RAMP.iron[3]);hl(A,b.x0+5+i*7,b.base-9,6,RAMP.iron[5]);}}
  else{const b=benchBack(o);boardBack(b.x0+4,b.top-19,30,20,RAMP.dark);
    grindstone(b.x0+b.w-14,b.top-4,8);}}
if(V!=='S'&&K==='bench_armor'){
  const o={R:RAMP.oak,w:50,d:13,ap:6,legH:16,shelf:7};
  if(V==='E'){const b=benchSide(o);
    // the hide lies along the top, the shears and the rivet tin; the dress form stands behind, seen from its side (narrower)
    hide(b.x0+3,b.top+3,b.wD-6,b.L-8);shears(b.x0+8,b.top+b.L-6);rivetTin(b.x0+b.wD-6,b.top+4);
    const fx=b.x0+b.wD-4;const L=RAMP.iron.map((c,i)=>RAMP.iron[Math.min(5,i)]);
    const fy0=b.base-30;for(let y=0;y<20;y++){const t=y/20;const w=Math.round(t<.12?2+t*16:t<.6?3.6-(t-.12)*1.5:3+(t-.6)*3);for(let x=-w;x<=w;x++){const l=-x/w*.6-(t-.4)*.3;P(A,fx+x+(t>.2&&t<.6?1:0),fy0+y,L[l>.45?5:l>.1?4:l>-.3?3:1]);}}
    {const I=RAMP.iron;for(let y=-7;y<=0;y++)for(let x=-4;x<=5;x++){if(x*x*1.2+(y+1)*(y+1)*1.2>26)continue;const l=-x*.5-y*.4;P(A,fx+x,fy0-2+y,I[l>1.6?5:l>.4?4:l>-1?3:2]);}hl(A,fx-1,fy0-4,6,I[0]);}
    rect(A,fx-1,fy0+20,3,b.base-fy0-20,RAMP.dark[3]);vl(A,fx-1,fy0+20,b.base-fy0-20,RAMP.dark[5]);for(let i=0;i<5;i++){P(A,fx-1-i,b.base+(i>>1),RAMP.dark[4]);P(A,fx+1+i,b.base+(i>>1),RAMP.dark[2]);}
    for(let j=0;j<7;j++)for(let i=0;i<b.wD-8;i++){const l=.4-j/7*.8;P(A,b.x0+4+i,b.base-13+j,RAMP.leather[l>.2?4:l>-.2?3:2]);}}
  else{const b=benchBack(Object.assign({},o,{x0:3}));
    const cx=W-11;dressForm(cx,b.base-3,22);const top=b.base-15-22;for(let y=top+3;y<top+21;y++){P(A,cx,y,RAMP.leather[1]);if(y%2===0){P(A,cx-1,y,RAMP.cream[3]);P(A,cx+1,y,RAMP.cream[2]);}}   // laced up the back, no rivets
    for(let y=top+4;y<top+21;y+=3){P(B,cx-2,y,null);P(B,cx+2,y,null);}
    hide(b.x0+16,b.top+2,22,9);for(let j=0;j<7;j++)for(let i=0;i<20;i++){const l=.4-j/7*.8;P(A,b.x0+10+i,b.base-13+j,RAMP.leather[l>.2?4:l>-.2?3:2]);}}}
if(V!=='S'&&K==='furnace'){
  const S=RAMP.stone,base=H-3;
  const body=(cx,w,topY,d)=>{const stones=[];for(let y=topY+d;y<base;y+=5)for(let x=cx-w/2+((y/5|0)%2?3:0);x<cx+w/2;x+=6+((hsh(x,y,SEED)*2)|0))stones.push([x,y]);
    for(let y=topY+d;y<base;y++)for(let x=cx-w/2;x<cx+w/2;x++)P(A,x,y,S[1]);
    for(const [sx0,sy0] of stones){const sw=5+((hsh(sx0,sy0,3)*2)|0),sh=4;for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const X=sx0+i,Y=sy0+j;if(X<cx-w/2||X>=cx+w/2||Y>=base)continue;if((i===0||i===sw-1)&&(j===0||j===sh-1))continue;
      const side=(X-(cx-w/2))/w;let k=j===0?4:i===0?4:j===sh-1||i===sw-1?2:3;if(side>.72)k=Math.max(1,k-1);if(side<.2)k=Math.min(5,k+1);P(A,X,Y,S[k]);}}
    for(let j=0;j<d;j++)for(let i=-w/2;i<w/2;i++)P(A,cx+i,topY+j,S[j===0?2:j===d-1?5:(hsh(i,j,SEED)>.8?3:4)]);hl(A,cx-w/2,topY+d,w,S[1]);};
  const chim=(chx,topY,lo)=>{for(let y=topY-20;y<topY+lo;y++)for(let x=-4;x<=4;x++){const k=x<-2?4:x>2?1:(((y>>2)+(x>0?1:0))%2?3:2);P(A,chx+x,y,S[k]);}
    for(let y=topY-23;y<topY-20;y++)for(let x=-5;x<=5;x++)P(A,chx+x,y,S[y===topY-23?5:x>3?2:4]);for(let x=-3;x<=3;x++)P(A,chx+x,topY-23,[24,22,26]);
    for(const [dx,dy] of [[0,-26],[1,-28],[-1,-30],[0,-32],[2,-33]])P(B,chx+dx,topY+dy,[150,146,150],140);};
  if(V==='E'){   // turned so the mouth faces right: a narrower stone body, the chimney at the back (left), the fire's glow spilling out on the right
    const cx=W>>1,w=20,topY=base-36,d=14;chim(cx-4,topY+4,3);body(cx,w,topY,d);
    for(let y=base-14;y<base;y++){const a=Math.max(0,170-(base-y)*8);P(B,cx+w/2,y,[255,140,50],a);P(B,cx+w/2-1,y,[220,100,40],a>>1);}
    for(let x=0;x<8;x++)P(B,cx+w/2+x,base,[255,150,60],70-x*8);
    const bx=cx-w/2-3,by=base-10;for(let j=0;j<9;j++){const ww=Math.round(4-Math.abs(j-4)*.5);for(let i=0;i<ww;i++)P(A,bx+i,by+j,RAMP.leather[i===0?4:i===ww-1?1:3]);}
    for(let i=0;i<8;i++){const X=cx+2+((hsh(i,1,SEED)*8)|0),Y=base-1-((hsh(i,2,SEED)*3)|0);P(A,X,Y,[34,32,38]);}
    for(let x=cx-w/2-3;x<cx+w/2+4;x++){SH(x,base,160);SH(x,base+1,110);}cast(cx-w/2,cx+w/2,base);}
  else{          // from behind: the chimney nearest, rising out of the back wall; no mouth
    const cx=W>>1,w=30,topY=base-36,d=8;body(cx,w,topY,d);chim(cx-2,topY+18,6);
    rect(A,cx+5,base-9,8,6,RAMP.iron[2]);hl(A,cx+5,base-9,8,RAMP.iron[4]);vl(A,cx+12,base-9,6,RAMP.iron[0]);P(A,cx+11,base-6,RAMP.iron[5]);   // an ash door
    for(let x=cx+5;x<cx+13;x++)P(B,x,base-3,[230,110,40],150);hl(A,cx+5,base-3,8,[120,40,20]);
    for(let j=0;j<3;j++)for(let i=0;i<3-j;i++){const lx=cx-w/2+2+i*4+j*2,ly=base-3-j*3;rect(A,lx,ly,4,3,RAMP.honey[2]);hl(A,lx,ly,4,RAMP.honey[4]);P(A,lx+3,ly+1,RAMP.cream[3]);}   // split logs stacked
    for(let x=cx-w/2-3;x<cx+w/2+4;x++){SH(x,base,160);SH(x,base+1,110);}cast(cx-w/2,cx+w/2,base);
    for(let i=0;i<10;i++){const X=cx+w/2-6+((hsh(i,1,SEED)*8)|0),Y=base-1-((hsh(i,2,SEED)*3)|0);P(A,X,Y,[34,32,38]);P(A,X+1,Y,[22,20,24]);}}}
const flat=flatten([A,B],W,H);const O=outline(flat);const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
