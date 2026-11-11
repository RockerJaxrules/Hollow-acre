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
  leather:hexR(['#221208','#3a2012','#58321e','#744628','#8e5a34','#a8764c']),   // (benches r2: "salmon", "raw meat") a duller, browner hide
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
  for(let j=0;j<h-2;j++)hl(A,x+3,y+1+j,w-6,j%6===5?R[0]:R[1]);hl(A,x+1,y,w-2,R[4]);hl(A,x+1,y+1,w-2,R[2]);for(let j=y+5;j<y+h-2;j+=6)for(let i=x+8;i<x+w-4;i+=7)P(A,i,j,R[0]);   // (benches r1) the board behind darker and quieter
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
  const sd=V==='N'?-1:1;for(const [dx,dy] of [[r-1,-r+2],[r+1,-r],[r+3,-r+1],[r+2,-r-2],[r+4,-r-1]]){P(B,cx+sd*dx,cy+dy,[255,214,120]);P(B,cx+sd*(dx+1),cy+dy,[255,170,80]);}}   // sparks fly off the side the wheel turns toward
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
function dressForm(cx,by,h,back){const L=RAMP.steel.map((c,i)=>RAMP.iron[Math.min(5,i+1)]),R=RAMP.dark,Bz=RAMP.brass;rect(A,cx-1,by-12,3,12,R[3]);vl(A,cx-1,by-12,12,R[5]);vl(A,cx+1,by-12,12,R[1]);
  // a three-footed stand
  for(let i=0;i<6;i++){P(A,cx-1-i,by+(i>>1),R[4]);P(A,cx+1+i,by+(i>>1),R[2]);}vl(A,cx,by,3,R[3]);for(let i=-7;i<=7;i++)SH(cx+i,by+3,150);
  const top=by-12-h,lam=[.64,.77,.9].map(f=>Math.round(f*h));for(let y=0;y<h;y++){const t=y/h;const w=Math.round(t<.12?4+t*50:t<.45?10-(t-.12)*6:t<.6?8:8+(t-.6)*5);for(let x=-w;x<=w;x++){
      let k=x<0?(x>-3&&t<.6?5:x>-w*.6?4:3):x===0?(t<.6?5:4):x===1?1:(x<w*.55?2:1);if(t>.5&&x<0)k=Math.max(2,k-1);if(x<=-w+1&&k>2)k--;   // (benches r2: "coat buttons") a centre ridge: lit on its left, a dark crease on its right
      if(lam.includes(y))k=1;else if(lam.includes(y-1))k=Math.min(5,k+1);P(A,cx+x,top+y,L[k]);}}   // the hip plates: overlapping lames, each with a dark lower edge and a lit top
   // (benches r3: "columns of rivets read as buttons") no rivets down the lames; only the pair at the shoulders
  // neck knob, collar, stitching, rivets down the front
  {const I=RAMP.iron;for(let y=-7;y<=0;y++)for(let x=-5;x<=5;x++){if(x*x+(y+1)*(y+1)*1.2>28)continue;const l=-x*.5-y*.4;P(A,cx+x,top-2+y,I[l>1.6?5:l>.4?4:l>-1?3:2]);}hl(A,cx-5,top-1,11,I[1]);if(!back)hl(A,cx-2,top-3,5,RAMP.ink?RAMP.iron[0]:I[0]);}   // a helmet with a visor slit (not from behind)
  hl(A,cx-3,top+1,7,L[5]);if(!back){P(B,cx-4,top+2,Bz[4]);P(B,cx+4,top+2,Bz[3]);}
}
// a leather hide spread on the top, stitched round the edge
// (benches r2: "brown on brown disappears") the hide in a dull oxblood, a hue away from the oak
const HIDE=hexR(['#1e100c','#32180f','#462217','#5a2e1f','#6c3a29','#7e4a35']),ROLL=hexR(['#2a2016','#423424','#5c4a34','#746044','#8a7656']);   // (benches fam r1: the hide and roll read as a red brick at 1x) browner, two steps duller   // the roll below a tan leather, so it is not a second hide
function hide(x,y,w,d){const L=HIDE,top=i=>(hsh(i>>2,1,SEED)>.55?1:0),bot=i=>(hsh(i>>2,2,SEED)>.5?1:0);for(let j=0;j<d;j++)for(let i=0;i<w;i++){const ex=Math.min(i,w-1-i),ey=Math.min(j,d-1-j);if(ex+ey<2)continue;if(j<top(i)||d-1-j<bot(i))continue;if((i<2||i>w-3)&&(j===2||j===d-3))continue;   // (benches r3: "a cushion") a ragged pelt edge, not a neat rectangle
    P(A,x+i,y+j,L[j<2?4:j>d-3?2:3]);}   // flat tones: a lit near-top band, a body, a shaded far edge; no mottle
  for(let i=3;i<w-3;i+=3){P(A,x+i,y+2,L[1]);P(A,x+i+1,y+2,L[1]);}contact(x+2,y+d,w-2);}   // one row of dark stitching, in dashes
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
  const b=bench({R:RAMP.oak,w:58,d:14,ap:7,legH:16,shelf:7});for(let y=b.top;y<b.top+14;y++)for(let x=b.x0;x<b.x0+b.w;x++){const c=G(A,x,y);if(c)P(A,x,y,[0,1,2].map(k=>Math.round(c[k]+([0xc8,0xa8,0x78][k]-c[k])*.22)));}   // the top a step lighter, so the tools on it stand out
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
  for(let j=0;j<7;j++)for(let i=0;i<20;i++){const l=.4-j/7*.8;P(A,b.x0+20+i,b.base-13+j,ROLL[l>.2?4:l>-.2?3:2]);}for(let j=0;j<7;j++){P(A,b.x0+19,b.base-13+j,ROLL[1]);P(A,b.x0+40,b.base-13+j,ROLL[2]);}
  for(let a=0;a<6.3;a+=.5)P(A,Math.round(b.x0+40+Math.cos(a)*2),Math.round(b.base-10+Math.sin(a)*2.6),ROLL[a<3?4:1]);}
// the furnace's cap: a few big flat cap stones with joints, each lit on its left, a lit front lip chipped in two places (benches r1: "speckle" / "a blank slab")
function capTop(cx,w,topY,d){const S=RAMP.stone,x0=cx-w/2,rows=d>12?2:1,rh=d/rows;
  for(let r=0;r<rows;r++){const fr=r?[.36,.7]:[.27,.55,.8],js=fr.map((f,i)=>Math.round(x0+w*f+(hsh(i,r,SEED)-.5)*3));
    for(let j=0;j<rh;j++)for(let i=0;i<w;i++){const X=x0+i,Y=Math.round(topY+r*rh+j);const n=js.filter(q=>q<X).length,lastJ=n?js[n-1]:x0-1;
      let k=(hsh(n,r,SEED*3)>.5?4:3);if(X-lastJ===1)k=Math.min(5,k+1);if(i>w*.78)k=Math.max(2,k-1);if(js.includes(X))k=1;
      if(j===0)k=r?1:2;if(r===rows-1&&j===rh-1)k=5;P(A,X,Y,S[k]);}}
  for(const f of [.18,.66]){const X=Math.round(x0+w*f+hsh(f*10,2,SEED)*3);P(A,X,topY+d-1,S[2]);P(A,X+1,topY+d-1,S[2]);P(A,X+1,topY+d-2,S[3]);}   // chips out of the lip
  hl(A,x0,topY+d,w,S[1]);}
// step a stone pixel along the ramp: soot (down a step, or two near the source) and firelight (a warm ramp) as flat tones, never a blur
const WARM=hexR(['#2a1a16','#4a2a1e','#6e3a22','#93502a','#b86c36','#d88c4a']);
function rampIdx(c){const S=RAMP.stone;let b=0,bd=1e9;for(let i=0;i<S.length;i++){const d=Math.abs(S[i][0]-c[0])+Math.abs(S[i][1]-c[1])+Math.abs(S[i][2]-c[2]);if(d<bd){bd=d;b=i;}}return bd<30?b:-1;}
function soot(x,y,n){const c=G(A,x,y);if(!c)return;const k=rampIdx(c);if(k<0)return;const S=RAMP.stone;const s=Math.max(0,k-n);P(A,x,y,n>1?[Math.round(S[s][0]*.9+6),Math.round(S[s][1]*.8),Math.round(S[s][2]*.85)]:S[s]);}
function warm(x,y,n){const c=G(A,x,y);if(!c)return;const k=rampIdx(c);if(k<0)return;P(A,x,y,WARM[Math.min(5,k+n)]);}
// soft smoke: two puffs, lit top-left, fading as they rise (benches r1: "1 px dots read as hairs")
function puffs(x,y){for(const [dx,dy,r,a] of [[1,-2,1.7,150],[3,-5,2.3,95]])for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++){if(i*i+j*j>r*r+.5)continue;P(B,x+dx+i,y+dy+j,a>120?(i+j<0?[196,190,192]:[150,144,150]):(i+j<0?[176,170,174]:[136,130,138]),a>120?196:150);}}   // alpha under 200: no outline, so it stays soft
if(V==='S'&&K==='furnace'){      // a fieldstone furnace: the top seen from above with the chimney rising from the back, a glowing mouth, bellows, coal
  const S=RAMP.stone,cx=W>>1,base=H-3,w=30,topY=base-36,d=8;
  // body: rounded fieldstones with mortar, lit from the left
  const stones=[];for(let y=topY+d;y<base;y+=5)for(let x=cx-w/2+((y/5|0)%2?3:0);x<cx+w/2;x+=5+((hsh(x,y,SEED)*4)|0))stones.push([x,y]);
  for(let y=topY+d;y<base;y++)for(let x=cx-w/2;x<cx+w/2;x++)P(A,x,y,S[1]);
  for(const [sx0,sy0] of stones){const sw=4+((hsh(sx0,sy0,3)*4)|0),sh=4;for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const X=sx0+i,Y=sy0+j;if(X<cx-w/2||X>=cx+w/2||Y>=base)continue;if((i===0||i===sw-1)&&(j===0||j===sh-1))continue;
      const side=(X-(cx-w/2))/w;let k=j===0?4:i===0?4:j===sh-1||i===sw-1?2:3;if(side>.72)k=Math.max(1,k-1);if(side<.2)k=Math.min(5,k+1);P(A,X,Y,S[k]);}}
  // the top: a slab you look down onto
  capTop(cx,w,topY,d);
  // chimney from the back of the top
  const chx=cx+2;for(let y=topY-20;y<topY+3;y++)for(let x=-4;x<=4;x++){const k=x<-2?4:x>2?1:((y&3)===3||x===((y>>2)%2?-1:1)?1:(x<0?3:2));P(A,chx+x,y,S[k]);}
  for(let y=topY-23;y<topY-20;y++)for(let x=-5;x<=5;x++)P(A,chx+x,y,S[y===topY-23?5:x>3?2:4]);for(let x=-3;x<=3;x++)P(A,chx+x,topY-23,[24,22,26]);
  // a wisp of smoke
  puffs(chx,topY-23);
  // the mouth: an arch, red-hot inside, coals glowing
  const my=base-15;for(let y=0;y<13;y++)for(let x=-7;x<=7;x++){const dy=Math.max(0,6-y);if(x*x+dy*dy*1.6>49)continue;const deep=Math.abs(x)/7+y/13;
    P(A,cx+x,my+y,y<3?[52,18,10]:y>9?[(255-Math.abs(x)*10)|0,(180-Math.abs(x)*12)|0,60]:deep<.7?[250,150,50]:[200,80,30]);}
  for(let x=-8;x<=8;x++){P(A,cx+x,my+13,S[5]);P(A,cx+x,my+14,S[3]);}for(let a=3.3;a<6.2;a+=.09)P(A,Math.round(cx+Math.cos(a)*8),Math.round(my+6+Math.sin(a)*7.5),S[a<4.4?5:a<5.4?4:2]);
  for(const [dx,dy] of [[-3,10],[0,11],[3,10],[-1,9],[2,9]])P(B,cx+dx,my+dy,[255,230,140]);
  for(let y=topY+d+1;y<my;y++){const up=my-y,hw=7-up*.45;for(let x=-Math.floor(hw);x<=Math.floor(hw);x++)soot(cx+x,y,up<4&&Math.abs(x)<4?2:1);}   // soot fanning up from the mouth: the stones a step darker, two right over the arch
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
let CLEAN_TOP=false;   // (benches r2: "a speckled pale top") a clean top: long boards in two tones, no specks or knots
function plankTopV(x0,y0,w,L,R){const seams=[];for(let x=4;x<w-1;x+=4+((hsh(x,3,SEED)*2)|0))seams.push(x);const lift=CFG.view==='S'||CFG.view==='N'?0:1;
  for(let y=0;y<L;y++)for(let x=0;x<w;x++){let k=3;const pl=seams.filter(s=>s<=x).length;
    if(seams.includes(x))k=1;else{const g=hsh(pl,y>>2,SEED*7);k=CLEAN_TOP?(pl%2?3:4):g>.82?4:g<.16?2:3;if(!CLEAN_TOP&&hsh(x,y,SEED)>.93)k=Math.max(1,k-1);}
    if(y===0)k=1;if(y===L-1)k=5;if(y===L-2)k=4;if(x===0)k=Math.min(5,k+1);if(x===w-1)k=Math.max(0,k-1);
    if(!CLEAN_TOP&&!seams.includes(x)&&((y+pl*13)%23===0))k=1;if(lift&&k>1&&k<5)k++;P(A,x0+x,y0+y,R[k]);}}
function benchSide(o){const R=o.R,wD=o.sideW||o.d*2,L=o.sideL||Math.round(o.w/2),x0=(W-wD)>>1,base=H-3,ap=o.ap||6;const top=base-(o.legH||16)-ap-L;const fy=top+L,ly=fy+ap,legH=base-ly+1;
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
function edgeWall(x,top,L,h,R,sliver,th){th=th||5;const K=th===5?[5,4,4,3,2]:th===3?[5,3,2]:[5,2];const KE=th===5?[3,2,2,1,0]:th===3?[3,2,0]:[3,1];
  for(let y=top-h;y<top+L-h;y++)for(let i=0;i<th;i++)P(A,x+i,y,R[K[i]]);                                                   // its top edge, th px deep
  for(let y=top+L-h;y<top+L;y++)for(let i=0;i<th;i++)P(A,x+i,y,R[KE[i]]);hl(A,x,top+L-h,th,R[5]);                             // its near end
  if(sliver)sliver(x+th,top-h,L);for(let y=top-h;y<top+L;y++)SH(x+th+(sliver?2:0),y,80);}
function benchBack(o){const R=o.R,w=o.w,x0=o.x0!==undefined?o.x0:(W-w)>>1,base=H-3,d=o.d||13,ap=o.ap||6;const top=base-(o.legH||16)-ap-d;const fy=top+d,ly=fy+ap,legH=base-ly+1;
  for(const lx of [x0+4,x0+w-8])leg(lx,top+4,legH+ap+d-8,R,true);
  plankTop(x0,top,w,d,R,o);apron(x0,fy,w,ap,R);
  for(const lx of [x0+1,x0+w-5])leg(lx,ly,legH,R,false);
  hl(A,x0+5,base-5,w-10,R[3]);hl(A,x0+5,base-4,w-10,R[1]);
  for(let y=ly;y<=base;y++)for(let x=x0+1;x<x0+w-1;x++){if(G(A,x,y))continue;SH(x,y,Math.round(70+(y-ly)*4));}
  for(let x=x0-3;x<x0+w+4;x++){SH(x,base+1,120);SH(x,base,150);}cast(x0,x0+w,base);
  return {x0,w,top,d,fy,ly,base,cx:x0+(w>>1)};}
// the back of a board: vertical boards, two cross battens, nail heads, posts at the ends
// (benches r2: "even ribs read as a glass cabinet") the hutch's back: three long boards of different heights, each with a lit top edge,
// a butt joint in each at a different place, and one batten across them
function farmBack(x,y,w,h,R){const bh=[7,6,h-13];let yy=y;bh.forEach((H2,bi)=>{const jx=x+[17,33,9][bi];for(let j=0;j<H2;j++)for(let i=0;i<w;i++){let k=j===0?4:j===H2-1?1:2;if(x+i===jx)k=1;if(x+i===jx+1&&j>0)k=3;P(A,x+i,yy+j,R[k]);}yy+=H2;});
  const bx=x+(w>>1)-2;for(let j=1;j<h;j++){P(A,bx,y+j,R[4]);P(A,bx+1,y+j,R[3]);P(A,bx+2,y+j,R[3]);P(A,bx+3,y+j,R[1]);}hl(A,x,y,w,R[5]);for(const j of [3,h-4])P(A,bx+1,y+j,RAMP.iron[4]);
  for(const [sx,sy,sl] of [[x+3,y+2,5],[x+w-12,y+4,4],[x+8,y+9,6],[x+w-9,y+11,3],[x+5,y+16,4]])for(let i=0;i<sl;i++)P(A,sx+i,sy,R[3]);   // (benches r3: "freshly painted") paint worn thin in streaks along the grain
  for(const [px,py] of [[x,y],[x+1,y],[x,y+1],[x,y+7],[x+1,y+7],[x,y+13]])P(A,px,py,RAMP.honey[3]);}   // bare wood where hands catch the top-left edges
// the back of a framed board: stiles and rails round two or three raised panels of different widths, each bevel lit top-left
function panelBack(x,y,w,h,R){for(let j=0;j<h;j++)for(let i=0;i<w;i++)P(A,x+i,y+j,R[j===0?4:3]);const cuts=[0,Math.round(w*.32),Math.round(w*.74),w];
  for(let p=0;p<3;p++){const px=x+cuts[p]+3,pw=cuts[p+1]-cuts[p]-5,py=y+3,ph=h-6;if(pw<3)continue;for(let j=0;j<ph;j++)for(let i=0;i<pw;i++){let k=2;if(j===0||i===0)k=4;if(j===ph-1||i===pw-1)k=1;P(A,px+i,py+j,R[k]);}}
  vl(A,x,y,h,R[4]);vl(A,x+w-1,y,h,R[1]);hl(A,x,y+h-1,w,R[1]);}
function boardBack(x,y,w,h,R){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=((i+3)%7===0)?1:(hsh(i>>1,j>>2,SEED+9)>.85?3:2);if(j===0)k=4;P(A,x+i,y+j,R[k]);}
  for(const by of [y+3,y+h-4]){hl(A,x+1,by,w-2,R[3]);hl(A,x+1,by+1,w-2,R[1]);for(let i=x+4;i<x+w-3;i+=7)P(A,i,by,PAL.slate[4]);}
  for(const px of [x-1,x+w-2]){rect(A,px,y-1,3,h+1,R[2]);vl(A,px,y-1,h+1,R[4]);vl(A,px+2,y-1,h+1,R[0]);}hl(A,x-1,y-1,w+2,R[5]);
  for(let i=0;i<w;i++)SH(x+i,y+h,140);}
function pot2(cx,by){for(let j=0;j<5;j++){const w=j<1?2:3;for(let i=-w;i<=w;i++)P(A,cx+i,by-5+j,RAMP.iron[i<0?4:i>1?1:3]);}hl(A,cx-2,by-5,5,RAMP.iron[5]);}   // a small iron pot
// the back board turned edge-on: a short lip along the back edge (left when the front faces right, right when it faces left), hung tools as slivers on its front side
function sideRail(b,dir,h,R,sl){const x=dir>0?b.x0+1:b.x0+b.wD-3;for(let y=b.top-h;y<b.top+b.L-h;y++){P(A,x,y,R[3]);P(A,x+1,y,R[1]);}
  for(let y=b.top+b.L-h;y<b.top+b.L;y++){P(A,x,y,R[3]);P(A,x+1,y,R[1]);}hl(A,x,b.top+b.L-h,2,R[5]);if(sl)sl(dir>0?x+2:x-1,b.top-h,b.L);for(let y=b.top-h;y<b.top+b.L;y++)SH(dir>0?x+2:x-1,y,70);}
// an end-on stack of planks: pale end grain with a ring, dark gaps
const TAN=hexR(['#7e6848','#9c8462','#b8a07a']);   // (views r1: "white blocks read as teeth or paper") end grain is dull tan, lit top-left, a dark heart off centre
function plankEnds(x,y,n){for(let k=0;k<n;k++){const py=y-k*3,ox=k%2;rect(A,x+ox,py,6,2,TAN[1]);hl(A,x+ox,py,5,TAN[2]);P(A,x+ox+3,py+1,RAMP.honey[1]);vl(A,x+ox+5,py,2,RAMP.honey[1]);}}
// the grindstone seen edge-on: a tall tread lit along its top, scored as it turns; the axle crossing it with proud hubs both sides; the crank out to one side; posts and a trough
function grindEdge(gx,gy,dir){const St=RAMP.stone,I=RAMP.iron;
  rect(A,gx-6,gy+7,13,5,RAMP.dark[2]);hl(A,gx-6,gy+7,13,RAMP.dark[4]);hl(A,gx-5,gy+8,11,[44,62,66]);hl(A,gx-5,gy+9,11,[34,46,50]);for(let i=-4;i<6;i+=4)P(A,gx+i,gy+8,[92,120,124]);   // the trough, murky water in it
  for(const px of [gx-7,gx+6]){rect(A,px,gy-2,2,11,RAMP.dark[3]);vl(A,px,gy-2,11,RAMP.dark[5]);}
  for(let y=-9;y<=7;y++){const e=Math.abs(y+1)>7?1:0;for(let i=e;i<5-e;i++){let k=i===e?5:i<2?4:i<3?3:i<4-e?2:1;if(y<-6&&k<5)k++;if(y>4&&k>1)k--;P(A,gx-2+i,gy+y,St[k]);}}   // (views r2: "a gas bottle") a slim 5 px band, the disc's 16 px height   // (views r1: "a wrapped sack") the tread shaded as a rim: lit left, dark right, no ribs
  rect(A,gx-1,gy-2,3,3,I[3]);P(A,gx-1,gy-2,I[5]);P(A,gx+1,gy,I[1]);   // the hub standing proud
  rect(A,gx-9,gy-1,19,2,I[3]);hl(A,gx-9,gy-1,19,I[5]);rect(A,gx-11,gy-2,3,4,I[4]);hl(A,gx-11,gy-2,3,I[5]);rect(A,gx+9,gy-2,3,4,I[2]);hl(A,gx+9,gy-2,3,I[4]);   // the axle and its hubs, proud of the posts
  const cx=dir>0?gx+12:gx-12;vl(A,cx,gy-1,7,I[3]);vl(A,cx+(dir>0?1:-1),gy-1,7,I[1]);rect(A,dir>0?cx:cx-4,gy+6,5,2,RAMP.honey[3]);hl(A,dir>0?cx:cx-4,gy+6,5,RAMP.honey[5]);   // the crank, out to one side
  for(const [dx,dy] of [[-4,-11],[-6,-10],[-5,-13],[-8,-12]]){P(B,gx+dx,gy+dy,[255,214,120]);P(B,gx+dx-1,gy+dy,[255,170,80]);}}
if(V!=='S'&&K==='bench_farm'){
  const o={R:RAMP.sage,w:56,d:14,ap:6,legH:17,shelf:7,paint:1};
  if(V==='E'){CLEAN_TOP=true;const b=benchSide(Object.assign({},o,{sideW:20,sideL:42}));CLEAN_TOP=false;   // (benches r3: "57 px reads as an upright panel") about 3/4 of the 56 px front   // (benches r2: "a tall cabinet") the full length runs up the screen, like the other benches turned
    for(let y=b.top+1;y<b.top+b.L-1;y++)for(let x=b.x0;x<b.x0+b.wD;x++){const c=G(A,x,y);if(c)P(A,x,y,[0,1,2].map(k=>Math.round(c[k]+([0xc4,0xd6,0xae][k]-c[k])*.36)));}   // the whole top one lit plane, the lightest green
    edgeWall(b.x0+1,b.top,b.L,2,RAMP.sage,null,3);   // (benches r3: "a standing board") the hutch only a low lit strip along the far (left) edge
    for(let y=b.fy+1;y<b.fy+(o.ap||6);y++)for(let x=b.x0;x<b.x0+b.wD;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,.82));}   // the near end panel a step darker under the lit lip of the top
    tray(b.x0+13,b.top+12,6,14);packet(b.x0+13,b.top+29,[200,70,50]);   // the seed tray turned to run up the screen
    for(const [py,s,r] of [[b.top+10,1,3],[b.top+22,2,3],[b.top+34,0,2]]){contact(b.x0+6,py+1,8);pot(b.x0+8,py,r,s);}   // the pots in a row along the top, each with its shadow down-right
    sack(b.cx,b.base-7,5,9);}
  else{const b=benchBack(o),m=x=>b.x0+b.w-(x-b.x0),R=RAMP.sage;for(let j=0;j<3;j++)hl(A,b.x0+4,b.fy-22+j,b.w-8,R[j===0?3:j===1?4:5]);   // (benches r2: "pots on a 1 px rail") the hutch shelf: a lit strip they stand on
    pot(m(b.x0+14),b.fy-19,3,2);pot(m(b.x0+24),b.fy-19,2,1);pot(m(b.x0+42),b.fy-19,3,0);farmBack(b.x0+6,b.fy-19,b.w-12,20,R);   // (benches r3: "one box") the hutch narrower than the worktop, whose lit ends step out on both sides   // a turn, not a copy: the pots in mirrored order, their feet hidden behind the board
    sack(b.x0+40,b.base-7,6,9);}}
if(V!=='S'&&K==='bench_furn'){
  const o={R:RAMP.oak,w:58,d:14,ap:7,legH:16,shelf:7};
  if(V==='E'||V==='W'){const dir=V==='E'?1:-1;const b=benchSide(Object.assign({},o,{sideW:18,sideL:50}));const near=y=>b.top+b.L-y,far=y=>b.top+y;
    // (views r2: "the tool board stands 20 px in front, 3 px here") the tool board at its front-view height: a thin upright strip along the back edge, the saw hung on its face
    {const xe=dir>0?b.x0+1:b.x0+b.wD-3;edgeWall(xe,b.top+3,b.L-6,16,RAMP.oak,null,2);}
    {const sx=dir>0?b.x0+4:b.x0+b.wD-7,sy=b.top+(dir>0?6:b.L-26)-14;for(let j=0;j<16;j++){P(A,sx,sy+j,RAMP.steel[5]);P(A,sx+1,sy+j,RAMP.steel[3]);if(j%2)P(A,sx+2,sy+j,RAMP.steel[1]);}rect(A,sx-1,sy+16,4,5,RAMP.honey[4]);hl(A,sx-1,sy+16,4,RAMP.honey[5]);P(A,sx,sy+18,RAMP.dark[1]);P(A,sx+1,sy+18,RAMP.dark[1]);contact(sx,sy+21,3);}   // the saw lying flat
    // the left end (vise, the board in it) comes nearest when the front faces right; the right end (plane, shavings) when it faces left
    const vy=dir>0?near(6):far(3),py=dir>0?far(6):near(14);const fx=dir>0?b.x0+b.wD-8:b.x0+1;
    {const bx=dir>0?b.x0+b.wD-7:b.x0+2,by0=dir>0?near(20):b.top-4;for(let j=0;j<24;j++)for(let i=0;i<5;i++)P(A,bx+i,by0+j,RAMP.honey[i===0?5:i===4?2:4]);const ey=dir>0?by0+24:by0-2;rect(A,bx,ey,5,2,TAN[1]);hl(A,bx,ey,5,TAN[2]);}   // (views r1: "sticks straight out") the board in the vise runs along the front edge and out past the end, as in the front
    vise(fx,vy);
    {const x=b.cx-2;rect(A,x,py,4,10,RAMP.dark[3]);vl(A,x,py,10,RAMP.dark[5]);vl(A,x+3,py,10,RAMP.dark[1]);rect(A,x+1,py+3,2,3,RAMP.iron[4]);P(A,x+1,py+3,RAMP.iron[5]);}   // the plane, turned
    shavings(b.cx-4,py+11,6);
    plankEnds(b.cx-3,b.base-6,3);}
  else{const b=benchBack(o);
    for(const [px,h] of [[b.x0+b.w-22,9],[b.x0+b.w-15,12]]){for(let j=0;j<h;j++){const x=px-((h-1-j)>>1);for(let i=0;i<4;i++)P(A,x+i,b.fy-17-h+j,RAMP.honey[i===0?5:i===3?1:j%6===3&&i===2?3:4]);}hl(A,px-((h-1)>>1),b.fy-17-h,4,TAN[2]);}   // (views r1: "two mugs of beer") two long boards leaning over the back, their sawn ends tan
    {const hx=b.x0+16,hy=b.fy-24;for(let j=0;j<7;j++)for(let i=0;i<6;i++){if((i>0&&i<5&&j>1&&j<5))continue;P(A,hx+i,hy+j,RAMP.honey[j===0?5:i===0?4:i===5?1:3]);}}   // the saw's handle hung over the top
    panelBack(b.x0+6,b.fy-17,b.w-12,18,RAMP.oak);   // (views r2: "a crate") the tool board's back: framed raised panels of different widths
    for(let j=0;j<3;j++){const y=b.base-8-j*2;for(let i=0;i<b.w-12;i++){P(A,b.x0+6+i,y,RAMP.honey[j===2?5:4]);P(A,b.x0+6+i,y+1,RAMP.honey[2]);}P(A,b.x0+5,y,RAMP.cream[4]);}}}   // planks on the low shelf
if(V!=='S'&&K==='bench_weapon'){
  const o={R:RAMP.dark,w:58,d:13,ap:7,legH:16,shelf:7};
  if(V==='E'||V==='W'){const dir=V==='E'?1:-1;const b=benchSide(Object.assign({},o,{sideW:18,sideL:50}));const near=y=>b.top+b.L-y,far=y=>b.top+y;
    // (views r2: "the rack stands 20 px in front, 3 px here") the rack of blades at its front-view height: a thin upright strip along the back edge,
    // over the far half (E) or the near half (W), with two hilts standing off its face
    {const xe=dir>0?b.x0+1:b.x0+b.wD-3,ys=dir>0?b.top+2:b.top+(b.L>>1),ln=(b.L>>1)-2;edgeWall(xe,ys,ln,18,RAMP.dark,null,2);
      for(const hy of [ys-18+5,ys-18+14]){const hx=xe+(dir>0?2:-3);hl(A,hx,hy,3,RAMP.iron[5]);P(A,hx+(dir>0?1:1),hy-1,RAMP.leather[2]);P(A,hx+1,hy-2,RAMP.leather[3]);}}
    // a sword lying along the middle of the top, running up the screen
    {const x=b.cx-1,y0=far(14);for(let j=0;j<17;j++){P(A,x,y0+j,RAMP.steel[5]);P(A,x+1,y0+j,RAMP.steel[2]);}hl(A,x-2,y0+17,6,RAMP.iron[4]);for(let j=0;j<4;j++)P(A,x,y0+18+j,RAMP.leather[3]);contact(x,y0+22,3);}
    {const wy=dir>0?far(4):near(10);rect(A,b.cx-3,wy,7,3,RAMP.stone[3]);hl(A,b.cx-3,wy,7,RAMP.stone[5]);hl(A,b.cx-3,wy+2,7,RAMP.stone[1]);}   // the whetstone at the right end's place
    grindEdge(dir>0?b.x0+b.wD-5:b.x0+4,dir>0?near(14):far(13),dir);   // the same wheel both sides, standing on the top                                                                                   // the grindstone at the left end's place
    if(dir>0){for(let i=0;i<3;i++){rect(A,b.x0+3+i*5,b.base-9,4,2,RAMP.iron[3]);hl(A,b.x0+3+i*5,b.base-9,4,RAMP.iron[5]);}}
    else{for(let y=0;y<6;y++)for(let x=0;x<9;x++)P(A,b.x0+5+x,b.base-12+y,y<2?[30,30,34]:RAMP.iron[y===5?0:1]);for(let i=0;i<5;i++)P(A,b.x0+6+i*2,b.base-13,[20,20,24]);}}   // (views r2) the near end's shelf: iron bars in E, the coal scuttle in W, as in the front
  else{{const x0b=(W-o.w)>>1,topb=H-3-o.legH-o.ap-o.d;grindstone(x0b+o.w-14,topb-3,8);}const b=benchBack(o);   // from behind, the wheel stands on the far side: its lower part hidden by the top
    {const hx=b.x0+10,I=RAMP.iron,Lw=RAMP.leather;hl(A,hx-4,b.fy-21,10,I[5]);hl(A,hx-4,b.fy-20,10,I[2]);P(A,hx-5,b.fy-20,I[3]);P(A,hx+6,b.fy-20,I[1]);for(let j=0;j<5;j++){P(A,hx,b.fy-26+j,Lw[j%2?1:3]);P(A,hx+1,b.fy-26+j,Lw[j%2?0:2]);}rect(A,hx-1,b.fy-29,4,3,I[3]);hl(A,hx-1,b.fy-29,4,I[5]);}   // (views r2: "twin knobs") the sword's hilt
    {const cx=b.x0+22,H2=RAMP.honey;for(let j=0;j<7;j++){P(A,cx,b.fy-25+j,H2[4]);P(A,cx+1,b.fy-25+j,H2[3]);P(A,cx+2,b.fy-25+j,H2[1]);}rect(A,cx-1,b.fy-28,5,3,H2[3]);hl(A,cx-1,b.fy-28,5,H2[5]);P(A,cx+3,b.fy-26,H2[1]);}   // and the club's tan handle beside it
    farmBack(b.x0+4,b.fy-19,30,20,RAMP.dark);   // (views r2: "one reused crate panel") long boards, not the carpentry bench's planks
    for(let i=0;i<3;i++){rect(A,b.x0+b.w-16+i*5,b.base-9,4,2,RAMP.iron[3]);hl(A,b.x0+b.w-16+i*5,b.base-9,4,RAMP.iron[5]);}pot2(b.x0+12,b.base-6);}}
if(V!=='S'&&K==='bench_armor'){
  const o={R:RAMP.oak,w:50,d:13,ap:6,legH:16,shelf:7};
  // the dress form in profile, facing the way the bench's front faces
  const formSide=(fx,fby,dir)=>{const L=RAMP.iron.map((c,i)=>RAMP.iron[Math.min(5,i)]);const fy0=fby-36;
    const lam=[18,21,24];   // (views r1: "a hooded ghost") in profile: the breastplate bulges toward the front, a shoulder plate, hip lames, a visor slit facing front
    for(let y=0;y<28;y++){const t=y/28;const w=Math.round(t<.12?3+t*18:t<.6?5-(t-.12)*2:4+(t-.6)*3),bul=t>.12&&t<.55?Math.round(2.4*Math.sin(Math.PI*(t-.12)/.43)):0;
      const xa=dir>0?-w:-w-bul,xb=dir>0?w+bul:w;for(let x=xa;x<=xb;x++){const l=-x/w*.6-(t-.4)*.3;let k=l>.45?5:l>.1?4:l>-.3?3:1;if(x===xa)k=Math.min(5,k+1);if(lam.includes(y))k=1;else if(lam.includes(y-1))k=Math.min(5,k+1);P(A,fx+x,fy0+y,L[k]);}}
    {const sx=fx-dir;for(let y=-2;y<=3;y++)for(let x=-4;x<=4;x++){if(x*x/16+y*y/7>1)continue;P(A,sx+x,fy0+5+y,L[y<-1?5:y>1?1:x<0?4:3]);}}   // the shoulder plate, lit on top
    {const I=RAMP.iron;for(let y=-9;y<=0;y++)for(let x=-5;x<=6;x++){if(x*x*1.1+(y+1)*(y+1)*1.1>36)continue;const l=-x*.5-y*.4;P(A,fx+x,fy0-2+y,I[l>1.8?5:l>.5?4:l>-1.2?3:2]);}for(let i=1;i<=5;i++)P(A,fx+i*dir,fy0-5,I[0]);P(A,fx+3*dir,fy0-3,I[1]);}
    rect(A,fx-1,fy0+26,3,fby-fy0-26,RAMP.dark[3]);vl(A,fx-1,fy0+26,fby-fy0-26,RAMP.dark[5]);for(let i=0;i<5;i++){P(A,fx-1-i,fby+(i>>1),RAMP.dark[4]);P(A,fx+1+i,fby+(i>>1),RAMP.dark[2]);}
    for(let i=-6;i<8;i++)SH(fx+i,fby+2,150);};
  if(V==='E'||V==='W'){
    // E: the form (at the front's left end) stands in front of the near end, overlapping it; W: it stands beyond the far end, mostly hidden behind the bench
    if(V==='W'){const x0=(W-18)>>1,top=H-3-16-6-50;formSide(x0-7,top+26,-1);}   // (views r2: "a bust on the top") beside the far end on the front's side, pole and feet showing   // (views r1: "peering round the edge") W: the stand beyond the far end, centred, the bench hiding its lower half
    const b=benchSide(Object.assign({},o,{sideW:18,sideL:50}));
    // the top stays a lit plane running away from you; the hide lies on it smaller, foreshortened, the wood showing round it
    hide(b.x0+4,b.top+14,b.wD-8,20);if(V==='E'){shears(b.x0+6,b.top+3);rivetTin(b.x0+b.wD-6,b.top+8);}else{shears(b.x0+6,b.top+b.L-9);rivetTin(b.x0+b.wD-6,b.top+b.L-5);}   // (views r1: "W is a mirror") the shears and tin keep to the stand's far end: far in E, near in W
    for(let j=0;j<7;j++)for(let i=0;i<b.wD-8;i++){const l=.4-j/7*.8;P(A,b.x0+4+i,b.base-13+j,ROLL[l>.2?4:l>-.2?3:2]);}
    if(V==='E')formSide(b.x0+b.wD+3,b.base-2,1);}
  else{const cx=W-11;dressForm(cx,H-3-3-12,22,true);const top=H-3-15-22-12;const b=benchBack(Object.assign({},o,{x0:3}));   // from behind, the stand is beyond the bench's end, raised and partly hidden
    for(let y=top+3;y<top+19;y++){P(A,cx,y,RAMP.iron[4]);P(A,cx+1,y,RAMP.iron[1]);}   // (views r2: "rivets read as buttons") a spine ridge down the backplate, lit left, creased right
    for(let y=top+4;y<top+21;y+=3){P(B,cx-2,y,null);P(B,cx+2,y,null);}
    hide(b.x0+16,b.top+2,22,9);rivetTin(b.x0+6,b.top+9);shears(b.x0+11,b.top+3);   // (views r1: "tin and shears missing") they swap to the left end from behind
    for(let j=0;j<7;j++)for(let i=0;i<20;i++){const l=.4-j/7*.8;P(A,b.x0+10+i,b.base-13+j,ROLL[l>.2?4:l>-.2?3:2]);}}}
if(V!=='S'&&K==='furnace'){
  const S=RAMP.stone,base=H-3;
  const body=(cx,w,topY,d)=>{const stones=[];{let y=topY+d,r=0;while(y<base){const rh=4+((hsh(r,7,SEED)*3)|0);let x=cx-w/2-((hsh(r,8,SEED)*6)|0);while(x<cx+w/2){const sw=[3,5,6,8][(hsh(x,y,SEED)*4)|0];stones.push([x,y,sw-1,rh-1]);x+=sw;}y+=rh;r++;}}   // (benches r3: "even courses read as cinder block") rows of different heights, stones in four widths, no seam running through
    for(let y=topY+d;y<base;y++)for(let x=cx-w/2;x<cx+w/2;x++)P(A,x,y,S[1]);
    for(const [sx0,sy0,sw,sh] of stones){for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){const X=sx0+i,Y=sy0+j;if(X<cx-w/2||X>=cx+w/2||Y>=base)continue;if((i===0||i===sw-1)&&(j===0||j===sh-1))continue;
      const side=(X-(cx-w/2))/w;let k=j===0?4:i===0?4:j===sh-1||i===sw-1?2:3;if(side>.72)k=Math.max(1,k-1);if(side<.2)k=Math.min(5,k+1);P(A,X,Y,S[k]);}}
    capTop(cx,w,topY,d);};
  const chim=(chx,topY,lo)=>{for(let y=topY-20;y<topY+lo;y++)for(let x=-4;x<=4;x++){const k=x<-2?4:x>2?1:((y&3)===3||x===((y>>2)%2?-1:1)?1:(x<0?3:2));P(A,chx+x,y,S[k]);}
    for(let y=topY-23;y<topY-20;y++)for(let x=-5;x<=5;x++)P(A,chx+x,y,S[y===topY-23?5:x>3?2:4]);for(let x=-3;x<=3;x++)P(A,chx+x,topY-23,[24,22,26]);
    puffs(chx,topY-23);};
  if(V==='E'){   // turned so the mouth faces right: a narrower stone body, the chimney at the back (left), the fire's glow spilling out on the right
    const cx=W>>1,w=20,topY=base-36,d=12;chim(cx-4,topY+4,3);body(cx,w,topY,d);   // one row of big cap stones lit as a top, not a pale coursed block
    {const lx=cx+w/2;for(let y=base-15;y<base;y++){const r=y<base-12?(y-(base-15)):3;for(let i=0;i<Math.min(3,r+1);i++){let k=i===0?4:i===2?1:3;if(y===base-15)k=5;P(A,lx+i,y,S[k]);}}   // (benches r1: "orange planks") the mouth's arched stone lip seen edge-on, a sliver standing out past the side
      for(let y=base-6;y<base;y++){P(B,lx+3,y,[255,150,60],Math.max(0,150-(base-y)*18));}   // only a thin warm glow at the foot of the lip
      for(let y=base-12;y<base;y++){const t=(y-(base-12))/12;P(A,lx-1,y,t>.6?[255,200,90]:t>.25?[240,130,46]:[150,52,22]);}   // a sliver of the lit arch, seen at a grazing angle
      for(let y=base-15;y<base;y++)for(let i=2;i<(y>base-8?6:4);i++)warm(lx-i,y,i<3?1:0);   // warm firelight on the stones of the front edge, flat tones
      for(let x=0;x<11;x++)for(let j=0;j<3;j++){const a=Math.max(0,(150-x*13)-j*35);if(a>0)P(B,lx+4+x,base-1+j,[255,150,60],a);}}   // spilling over the ground
    // (benches r2: "fire cues at both ends") no bellows here: it leans on the far side now, hidden; every warm cue is on the mouth's end
    for(let i=0;i<8;i++){const X=cx+2+((hsh(i,1,SEED)*8)|0),Y=base-1-((hsh(i,2,SEED)*3)|0);P(A,X,Y,[34,32,38]);}
    for(let x=cx-w/2-3;x<cx+w/2+4;x++){SH(x,base,160);SH(x,base+1,110);}cast(cx-w/2,cx+w/2,base);}
  else{          // from behind: the chimney nearest, rising out of the back wall; no mouth
    const cx=W>>1,w=30,topY=base-36,d=8;body(cx,w,topY,d);chim(cx-2,topY+18,6);
    {const bx=cx-w/2-3,by=base-10;for(let j=0;j<9;j++){const ww=Math.round(4-Math.abs(j-4)*.5);for(let i=0;i<ww;i++)P(A,bx+i,by+j,RAMP.leather[i===0?4:i===ww-1?1:3]);}rect(A,bx+1,by-4,2,5,RAMP.honey[3]);vl(A,bx+1,by-4,5,RAMP.honey[5]);}   // (benches r3: "no bellows") from behind, the bellows lean at the left edge
    rect(A,cx+5,base-9,8,6,RAMP.iron[2]);hl(A,cx+5,base-9,8,RAMP.iron[4]);vl(A,cx+12,base-9,6,RAMP.iron[0]);P(A,cx+11,base-6,RAMP.iron[5]);   // an ash door
    hl(A,cx+6,base-4,6,[150,60,30]);P(A,cx+8,base-4,[230,120,50]);
    {const EN=hexR(['#7e6848','#9c8462','#b8a07a']),BK=hexR(['#2a1e14','#4a3624']);const logs=[[cx-w/2+3,base-3,2.6,0],[cx-w/2+9,base-3,3.2,1],[cx-w/2+15,base-3,2.2,0],[cx-w/2+6,base-8,2.4,2],[cx-w/2+12,base-8,2.8,0]];   // (benches r1: "eggs") logs in three sizes, dull tan ends, off-centre hearts, one split wedge
      for(const [lx,ly,r,kd] of logs){for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){const d=Math.hypot(x,y);if(d>r+.4)continue;if(kd===2&&x>0&&y<0)continue;P(A,lx+x,ly+y,d>r-.8?BK[(x+y)<0?1:0]:EN[(x+y)<-1?2:(x+y)<1?1:0]);}P(A,lx+1,ly,BK[0]);}
      // (benches r2: "a dark heap at 1x") no log lying along the top of the pile
      for(let y=0;y<4;y++)for(let x=0;x<=y;x++)P(A,cx-w/2+19+x,base-6+y,x===0?EN[2]:x===y?BK[0]:EN[1]);}   // a split wedge, its fresh face lit
    for(let x=cx-w/2-3;x<cx+w/2+4;x++){SH(x,base,160);SH(x,base+1,110);}cast(cx-w/2,cx+w/2,base);
    for(let i=0;i<10;i++){const X=cx+w/2-6+((hsh(i,1,SEED)*8)|0),Y=base-1-((hsh(i,2,SEED)*3)|0);P(A,X,Y,[34,32,38]);P(A,X+1,Y,[22,20,24]);}}}
const flat=flatten([A,B],W,H);const O=outline(flat);const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
