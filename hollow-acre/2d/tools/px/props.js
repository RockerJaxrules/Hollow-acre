// ---- props builder: CFG.kind picks the drawing; canvas size comes from the driver (CFG.w x CFG.h)
SEED=CFG.seed||5;
const W=CFG.w,H=CFG.h,N=!!CFG.night;
const A=layer('art',W,H),B=layer('details',W,H),SHD=layer('shadow',W,H);
const WD=PAL.wood,ST=PAL.stone,TR=PAL.white;
function post(L,x,y,w,h,ramp){rect(L,x,y,w,h,ramp[2]);vl(L,x,y,h,ramp[4]);vl(L,x+1,y,h,ramp[3]);vl(L,x+w-1,y,h,ramp[0]);vl(L,x+w-2,y,h,ramp[1]);
  hl(L,x,y,w,ramp[5]);hl(L,x+1,y+1,w-2,ramp[4]);for(let j=4;j<h;j+=7)P(L,x+2+(j%3),y+j,ramp[1]);}
function rail(L,x,y,w,ramp){hl(L,x,y,w,ramp[4]);hl(L,x,y+1,w,ramp[3]);hl(L,x,y+2,w,ramp[1]);for(let i=5;i<w;i+=11)P(L,x+i,y+1,ramp[2]);}
function groundShadow(cx,cy,rx,ry,a){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)P(SHD,cx+x,cy+y,PAL.out[0],a||70);}
const K=CFG.kind;
if(K==='fence_h'){            // two 1 m bays of split-rail fence + end post; posts at 0,32,64
  for(const x of [3,35])for(const ry of [6,14])rail(A,x,ry,30,WD);
  for(const x of [0,32,64])post(A,x,0,7,22,WD);
  for(let x=0;x<W;x++)P(SHD,x,22,PAL.out[0],60);}
if(K==='fence_v'){            // one 1 m bay running away from you: post in front, two thin rails receding up to the next post, grass showing between them
  for(const [rx,ry] of [[1,-2],[10,-10]]){for(let y=14+ry;y<52+ry;y++){P(A,rx,y,WD[4]);P(A,rx+1,y,WD[2]);P(A,rx+2,y,WD[0]);}}
  post(A,3,40,8,25,WD);rect(A,3,37,8,4,WD[4]);hl(A,3,37,8,WD[5]);hl(A,4,40,6,WD[1]);P(A,6,44,PAL.slate[3]);P(A,6,50,PAL.slate[3]);
  groundShadow(8,65,6,2,70);}
if(K==='picket_h'){           // white picket fence, 2 m: rails behind, pointed pickets
  for(const ry of [7,16])rail(A,0,ry,W,TR);
  for(let x=1;x<W-2;x+=6){rect(A,x,3,4,20,TR[3]);vl(A,x,3,20,TR[5]);vl(A,x+3,3,20,TR[1]);P(A,x+1,1,TR[4]);P(A,x+2,1,TR[3]);hl(A,x,2,4,TR[4]);if(hsh(x,1)>.7)P(A,x+2,10,PAL.moss[1]);}
  for(let x=0;x<W;x++)P(SHD,x,23,PAL.out[0],60);}
if(K==='picket_v'){            // a picket run seen end-on: two thin rails receding, the pickets crossing them like rungs, each with a pointed lit top
  for(const [rx,ry] of [[2,0],[9,-7]])for(let y=10+ry;y<60+ry;y++){P(A,rx,y,TR[4]);P(A,rx+1,y,TR[2]);}
  for(let y=8;y<62;y+=6){hl(A,1,y,11,TR[5]);hl(A,1,y+1,11,TR[3]);hl(A,1,y+2,11,TR[1]);P(A,6,y-1,TR[5]);P(A,0,y+1,TR[2]);}
  rect(A,3,44,7,21,TR[3]);vl(A,3,44,21,TR[5]);vl(A,9,44,21,TR[1]);P(A,6,43,TR[5]);hl(A,4,44,5,TR[4]);groundShadow(8,65,6,2,60);}
if(K==='lamp'){               // cast-iron street lamp with a four-pane lantern
  const cx=W/2|0,base=H-3,iron=PAL.slate;
  rect(A,cx-5,base-4,10,4,iron[2]);hl(A,cx-5,base-4,10,iron[4]);hl(A,cx-5,base-1,10,iron[0]);rect(A,cx-3,base-8,6,4,iron[2]);hl(A,cx-3,base-8,6,iron[3]);
  rect(A,cx-1,20,3,base-28,iron[2]);vl(A,cx-1,20,base-28,iron[4]);vl(A,cx+1,20,base-28,iron[0]);for(let y=34;y<base-12;y+=14)hl(A,cx-2,y,5,iron[3]);
  rect(A,cx-5,18,11,3,iron[3]);hl(A,cx-5,18,11,iron[4]);
  const gx=cx-5,gy=6;for(let y=0;y<12;y++)for(let x=0;x<11;x++){let c=N?PAL.lit[y<4?5:4]:(y<5?PAL.glass[2]:PAL.glass[3]);if(x===0||x===10||x===5)c=iron[1];if(!N&&x===2&&y>1&&y<6)c=PAL.glass[5];P(A,gx+x,gy+y,c);}
  for(let y=0;y<5;y++){const w=3+y*2;hl(A,cx-(w>>1),1+y,w,y<2?iron[4]:iron[2]);}P(A,cx,0,iron[4]);hl(A,cx-6,6,13,iron[1]);
  groundShadow(cx+1,base,7,2,70);}
if(K==='booth'){              // roadside phone booth: aluminium frame, glass, PHONE sign
  const x0=2,x1=W-3,top=10,base=H-3,al=PAL.white,fr=PAL.slate;
  rect(A,x0,top,x1-x0,base-top,fr[2]);
  rect(A,x0-1,top-9,x1-x0+2,9,PAL.blue[2]);frame(A,x0-1,top-9,x1-x0+2,9,PAL.blue[4],PAL.blue[0]);drawText(A,'PHONE',x0+3,top-7,N?PAL.lit[5]:al[5],PAL.blue[0]);
  for(let y=top+3;y<base-6;y++)for(let x=x0+3;x<x1-3;x++){const t=(y-top)/(base-top);let c=N?PAL.lit[t<.3?4:3]:(t<.4?PAL.glass[2]:PAL.glass[3]);if(!N&&(x-y)%13===0)c=PAL.glass[5];P(A,x,y,c);}
  vl(A,(x0+x1)/2|0,top+3,base-top-9,fr[3]);for(const y of [top+20,top+36])hl(A,x0+3,y,x1-x0-6,fr[3]);
  // the phone inside
  rect(A,x0+6,top+14,6,9,N?PAL.ink[1]:PAL.ink[0]);P(A,x0+8,top+16,PAL.stone[3]);vl(A,x0+9,top+23,8,PAL.ink[0]);
  frame(A,x0,top,x1-x0,base-top,fr[4],fr[0]);rect(A,x0,base-6,x1-x0,6,fr[3]);hl(A,x0,base-6,x1-x0,fr[4]);hl(A,x0,base-1,x1-x0,fr[0]);
  groundShadow((x0+x1)/2|0,base+1,14,2,70);}
if(K==='board'){              // town notice board with a little roof and pinned papers
  const x0=4,x1=W-5,top=12,bb=top+30,base=H-3;
  post(A,x0+2,top,6,base-top,WD);post(A,x1-8,top,6,base-top,WD);
  rect(A,x0,top,x1-x0,bb-top,WD[1]);frame(A,x0,top,x1-x0,bb-top,WD[4],WD[0]);rect(A,x0+3,top+3,x1-x0-6,bb-top-6,PAL.bark[3]);
  for(const i of [0,1,3,4]){const px=x0+5+i*10+(hsh(i,2)*3|0),py=top+5+(hsh(i,5)*6|0),pw=7,ph=10+(hsh(i,7)*5|0);const paper=i===2?PAL.cream[3]:PAL.cream[2+(i%2)];
    rect(B,px,py,pw,ph,paper);hl(B,px,py+ph-1,pw,PAL.cream[0]);for(let j=py+3;j<py+ph-2;j+=2)hl(B,px+1,j,pw-2,PAL.cream[1]);P(B,px+3,py,PAL.red[3]);}
  {const mx=x0+(x1-x0)/2-6|0,my=top+4;rect(B,mx,my,13,19,PAL.cream[4]||PAL.cream[3]);frame(B,mx,my,13,19,PAL.cream[3],PAL.cream[0]);rect(B,mx+1,my+1,11,3,PAL.red[3]);rect(B,mx+3,my+6,7,7,PAL.stone[2]);ell(B,mx+6,my+8,2,2,PAL.cream[1]);rect(B,mx+4,my+11,5,2,PAL.cream[1]);hl(B,mx+2,my+15,9,PAL.ink[1]);hl(B,mx+3,my+17,7,PAL.cream[1]);P(B,mx+6,my,PAL.red[4]);}
  for(let y=0;y<8;y++){const w=x1-x0+8-(7-y)*0;hl(A,x0-4,top-8+y,x1-x0+8,y<2?PAL.slate[4]:y===7?PAL.slate[0]:PAL.slate[2]);}
  groundShadow((x0+x1)/2|0,base+1,(x1-x0)/2|0,2,60);}
if(K==='pump'){               // 1950s gas pump: lit globe, red body, gauge window, hose
  const cx=W/2|0,x0=cx-10,x1=cx+10,top=18,base=H-3,rd=PAL.red;
  ell(A,cx,9,8,8,N?PAL.lit[4]:PAL.cream[3]);ell(A,cx-2,7,3,3,N?PAL.lit[5]:PAL.white[5]);hl(A,cx-6,9,13,rd[3]);rect(A,cx-4,16,9,3,PAL.slate[2]);
  for(let y=top;y<base;y++){for(let x=x0;x<x1;x++){let c=x<x0+3?rd[4]:x>x1-4?rd[1]:rd[3];if(y>top+30&&y<top+34)c=TR[x<x0+3?5:3];P(A,x,y,c);}}
  hl(A,x0,top,x1-x0,rd[5]);rect(A,x0+4,top+6,12,10,PAL.cream[3]);frame(A,x0+4,top+6,12,10,PAL.slate[3],PAL.slate[0]);
  for(let i=0;i<3;i++)rect(A,x0+6+i*3,top+10,2,3,PAL.ink[0]);rect(A,x0+5,top+20,10,5,PAL.slate[1]);
  rect(A,x0-2,base-4,x1-x0+4,4,PAL.slate[2]);hl(A,x0-2,base-4,x1-x0+4,PAL.slate[4]);
  for(let y=top+12;y<base-6;y++)P(A,x1+1+Math.round(Math.sin((y-top)/9)*1.5),y,PAL.ink[0]);rect(A,x1-1,top+8,4,6,PAL.slate[3]);
  groundShadow(cx+2,base+1,13,2,70);}
if(K==='signpost'){const cx=W/2|0,base=H-3;post(A,cx-3,8,6,base-8,WD);
  for(const [y,dir] of [[10,1],[22,-1]]){const x0=dir>0?cx-6:cx-24,w=30;for(let j=0;j<9;j++)for(let i=0;i<w;i++){const tip=dir>0?i>w-6&&Math.abs(j-4)>(w-i):i<6&&Math.abs(j-4)>i;if(tip)continue;
      P(A,x0+i,y+j,j===0?WD[5]:j===8?WD[0]:WD[3]);}for(let i=4;i<w-6;i+=4)hl(A,x0+(dir>0?3:8)+i/2|0,y+4,2,WD[1]);}
  groundShadow(cx,base+1,7,2,60);}
// ---- 3/4 boxes: every solid prop shows a lit top face above its front face
function plankFace(L,x,y,w,h,R,dir,gap){gap=gap||5;for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=dir?(i%gap):(j%gap);let c=R[3];if(k===0)c=R[1];else if(k===1)c=R[4];
  if(hsh(dir?(i/gap|0):(j/gap|0),dir?(j/9|0):(i/11|0),5)>.82&&k>1)c=R[2];P(L,x+i,y+j,c);}}
if(K==='barrel'){const cx=W/2|0,base=H-3,rx=10,top=8,ry=4;
  // body: staves, bulging, shaded round
  for(let y=top;y<base;y++){const t=(y-top)/(base-top),half=rx+Math.round(Math.sin(t*Math.PI)*1.6);
    for(let x=-half;x<half;x++){const u=(x+half)/(2*half),st=Math.floor(u*7);let k=u<.18?4:u<.45?3:u<.75?2:1;if(Math.floor((u*7-st)*4)===0)k=Math.max(0,k-1);if(t>.9)k=Math.max(0,k-1);P(A,cx+x,y,WD[k]);}}
  // iron hoops with a highlight
  for(const hy of [top+3,((top+base)/2|0)-1,base-5]){const t=(hy-top)/(base-top),half=rx+Math.round(Math.sin(t*Math.PI)*1.6);for(let x=-half;x<half;x++){const u=(x+half)/(2*half);P(A,cx+x,hy,PAL.slate[u<.3?4:u<.7?3:1]);P(A,cx+x,hy+1,PAL.slate[u<.3?2:1]);}}
  // lid: an ellipse of planks with a rim, lighter than the body
  for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx)+y*y/(ry*ry);if(d>1)continue;let c=d>.62?WD[y<0?2:4]:WD[(Math.floor((x+rx)/4))%2?4:3];if(d<=.62&&(x+rx)%4===0)c=WD[2];P(A,cx+x,top+y,c);}
  hl(A,cx-3,top-1,2,WD[5]);P(A,cx+4,top+1,PAL.slate[2]);
  for(let x=-rx;x<=rx;x++){const yy=top+Math.round(Math.sqrt(Math.max(0,1-x*x/(rx*rx)))*ry);P(A,cx+x,yy,WD[1]);}
  groundShadow(cx+2,base,11,2,80);}
if(K==='crate'){const x0=2,s=W-6,tH=9,fy=2+tH,fH=s-tH-3;
  // top face (lighter, planks running across) and front face (planks + frame + diagonal brace)
  plankFace(A,x0,2,s,tH,[WD[1],WD[1],WD[3],WD[4],WD[5]],true,6);frame(A,x0,2,s,tH,WD[5],WD[2]);
  plankFace(A,x0,fy,s,fH,WD,false,5);frame(A,x0,fy,s,fH,WD[4],WD[0]);rect(A,x0+1,fy+1,3,fH-2,WD[4]);rect(A,x0+s-4,fy+1,3,fH-2,WD[2]);
  for(let i=0;i<s-8;i++){const y=fy+fH-2-Math.round(i*(fH-3)/(s-8));P(A,x0+4+i,y,WD[4]);P(A,x0+4+i,y+1,WD[1]);}
  hl(A,x0,fy,s,WD[1]);for(const [x,y] of [[2,fy+2],[s-3,fy+2],[2,fy+fH-3],[s-3,fy+fH-3]])P(A,x0+x,y,PAL.slate[4]);
  groundShadow(x0+s/2+2|0,fy+fH,s/2+1|0,2,80);}
if(K==='hay'){const x0=2,w=W-5,tH=10,fH=H-tH-6,hy=PAL.mustard;
  for(let y=0;y<tH;y++)for(let x=0;x<w;x++){const n=hsh(x,y,3);let c=n>.75?hy[5]:n<.25?hy[3]:hy[4];if(y===0)c=hy[5];if(hsh(x>>1,y,7)>.9)c=hy[2];P(A,x0+x,3+y,c);}
  for(let y=0;y<fH;y++)for(let x=0;x<w;x++){const n=hsh(x,y,5);let c=hy[3];if(n>.78)c=hy[4];else if(n<.22)c=hy[2];if((x+y*3)%7===0)c=hy[2];if(y>fH-3)c=hy[1];if(x<2)c=hy[4];if(x>w-3)c=hy[1];P(A,x0+x,3+tH+y,c);}
  hl(A,x0,3+tH,w,hy[2]);
  for(const tx of [Math.round(w*.28),Math.round(w*.72)]){vl(A,x0+tx,3,tH+fH,PAL.bark[2]);vl(A,x0+tx+1,3,tH+fH,PAL.bark[4]);}
  for(let i=0;i<12;i++){const x=x0+(hsh(i,1)*w|0),y=2-(hsh(i,2)*2|0);P(A,x,y,hy[4]);P(A,x+1,y+1,hy[5]);}
  for(let i=0;i<8;i++){const x=x0+(hsh(i,4)*w|0);P(A,x,3+tH+fH,hy[2]);P(A,x+1,4+tH+fH,hy[3]);}
  groundShadow(x0+w/2+2|0,3+tH+fH,w/2+1|0,2,80);}
if(K==='sacks'){const sk=PAL.cream;
  for(const [cx,cy,rx,ry,lean] of [[12,17,9,10,-1],[25,18,9,9,1],[18,10,8,7,0]]){
    for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const sq=y>0?1:1-(-y/ry)*.25;if(x*x/(rx*rx*sq*sq)+y*y/(ry*ry)>1)continue;const nx=x/rx,ny=y/ry,l=-.55*nx-.6*ny+.6;let k=l>.55?3:l>.15?2:l>-.25?1:0;
      if(((x+lean*y)*2+y*3)%11===0&&k>0)k--;if(y>ry-2)k=0;P(A,cx+x,cy+y,sk[k]);}
    // gathered neck tied with twine
    rect(A,cx-2+lean,cy-ry-3,5,4,sk[2]);P(A,cx-1+lean,cy-ry-4,sk[3]);P(A,cx+1+lean,cy-ry-4,sk[1]);hl(A,cx-2+lean,cy-ry,5,PAL.bark[1]);hl(A,cx-2+lean,cy-ry+1,5,PAL.bark[3]);}
  drawText(A,'F',8,15,PAL.red[2]);groundShadow(18,H-3,15,2,80);}
if(K==='firewood'){const x0=3,w=W-7,base=H-4,rows=3,lr=4;
  // stacked split logs: round cut ends in front, bark tops, a lit top face
  for(let r=0;r<rows;r++){const y=base-lr-r*(lr*2-1),n=Math.floor((w-(r%2?lr:0))/(lr*2));for(let i=0;i<n;i++){const cx=x0+lr+i*lr*2+(r%2?lr:0);
    for(let yy=-lr;yy<=lr;yy++)for(let xx=-lr;xx<=lr;xx++){const d=xx*xx+yy*yy;if(d>lr*lr)continue;const rr=Math.sqrt(d);let c=rr>lr-1.1?PAL.bark[xx+yy<0?3:1]:(rr<1?PAL.wood[3]:(Math.floor(rr)%2?PAL.wood[5]:PAL.wood[4]));if(rr<=lr-1.1&&xx+yy>2)c=shade(c,.86);P(A,cx+xx,y+yy,c);}
    P(A,cx-1,y-1,PAL.mustard[4]);}}
  const ty=base-lr-(rows-1)*(lr*2-1)-lr;for(let i=0;i<w;i++){P(A,x0+i,ty-1,PAL.bark[(i>>2)%2?3:4]);P(A,x0+i,ty-2,PAL.bark[4]);}
  groundShadow(x0+w/2+2|0,base+1,w/2+1|0,2,80);}
if(K==='cart'){const base=H-3,bx=12,bw=W-24,bedTop=10,inH=9,sideH=13;
  // far wheels peeking out above/behind the bed
  for(const wx of [bx+10,bx+bw-10]){ell(A,wx,bedTop+sideH+inH-10,6,7,WD[1]);ell(A,wx,bedTop+sideH+inH-10,4,5,WD[0]);}
  // the open bed seen from above: back rail, floor planks inside, a load of pumpkins
  rect(A,bx,bedTop,bw,3,WD[4]);hl(A,bx,bedTop,bw,WD[5]);
  plankFace(A,bx+2,bedTop+3,bw-4,inH,[WD[0],WD[0],WD[1],WD[2],WD[3]],true,6);vl(A,bx,bedTop,inH+3,WD[3]);vl(A,bx+1,bedTop,inH+3,WD[4]);vl(A,bx+bw-2,bedTop,inH+3,WD[2]);vl(A,bx+bw-1,bedTop,inH+3,WD[1]);
  for(const [px,py,r] of [[bx+9,bedTop+7,5],[bx+19,bedTop+5,6],[bx+30,bedTop+8,5],[bx+bw-10,bedTop+6,5]]){for(let y=-r+1;y<=r-1;y++)for(let x=-r;x<=r;x++){const d=x*x/(r*r)+y*y/((r-1)*(r-1));if(d>1)continue;const rib=Math.abs(x)%3===0&&Math.abs(x)<r-1;
      P(A,px+x,py+y,PAL.rust[rib?2:(x<-1&&y<0?5:x>1||y>1?3:4)]);}vl(A,px,py-r,2,PAL.moss[2]);P(A,px+1,py-r,PAL.moss[3]);}
  // front side board: two planks, iron straps, a rail lip
  const sy=bedTop+3+inH;rect(A,bx,sy,bw,sideH,WD[3]);for(let i=0;i<bw;i++){P(A,bx+i,sy,WD[5]);P(A,bx+i,sy+6,WD[1]);P(A,bx+i,sy+7,WD[4]);P(A,bx+i,sy+sideH-1,WD[0]);}
  for(const sx of [bx+3,bx+bw/2|0,bx+bw-5]){vl(A,sx,sy+1,sideH-2,PAL.slate[2]);vl(A,sx+1,sy+1,sideH-2,PAL.slate[1]);P(A,sx,sy+3,PAL.slate[4]);P(A,sx,sy+sideH-4,PAL.slate[4]);}
  for(let i=0;i<bw;i+=9)if(hsh(i,3)>.5)P(A,bx+i+4,sy+3,WD[2]);
  // chassis beam + tongue out to the left with a crossbar
  hl(A,bx-2,sy+sideH,bw+4,WD[1]);hl(A,bx-2,sy+sideH+1,bw+4,WD[0]);
  for(let i=0;i<bx+2;i++){const y=sy+sideH-1+Math.round(i*.15);P(A,bx-i,y,WD[3]);P(A,bx-i,y+1,WD[1]);}rect(A,0,sy+sideH-1,3,4,WD[2]);
  // near wheels: spoked, iron tyre, hub
  for(const wx of [bx+10,bx+bw-10]){const wy=base-8,R=8;for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++){const d=Math.sqrt(x*x+y*y);if(d>R+.4)continue;
      if(d>R-1.6)P(A,wx+x,wy+y,PAL.slate[x+y<0?3:1]);else if(d>R-3)P(A,wx+x,wy+y,WD[x+y<0?4:2]);else{const a=Math.atan2(y,x);if(Math.abs(Math.sin(a*4))<.26)P(A,wx+x,wy+y,WD[x+y<0?4:2]);}}
    ell(A,wx,wy,2,2,PAL.slate[2]);P(A,wx-1,wy-1,PAL.slate[4]);}
  groundShadow(W/2+2|0,base,W/2-6|0,3,80);}
if(K==='well'){const cx=W/2|0,base=H-3,top=6;
  // stone ring (back half, water, front half)
  ell(A,cx,base-22,22,9,ST[1]);ell(A,cx,base-22,17,6,PAL.ink[1]);ell(A,cx,base-21,14,4,PAL.glass[1]);
  for(let y=base-22;y<base;y++)for(let x=-22;x<=22;x++){const e=x*x/(22*22)+((y-(base-22))*(y-(base-22)))/(9*9);if(y<base-22&&e>1)continue;if(y>=base-22){const r=(y-(base-22))/4|0,o=r%2?4:0,b=(x+22+o)%9;
      let c=ST[b===0||(y-(base-22))%4===3?1:(x<-12?4:x>12?2:3)];if(y===base-1)c=ST[0];P(A,cx+x,y,c);}}
  for(let x=-22;x<=22;x++){const yy=base-22+Math.round(Math.sqrt(Math.max(0,1-x*x/484))*9);P(A,cx+x,yy-1,ST[5]);}
  // posts, crank roof
  post(A,cx-24,top+12,5,base-top-20,WD);post(A,cx+19,top+12,5,base-top-20,WD);
  hl(A,cx-20,top+22,40,WD[3]);hl(A,cx-20,top+23,40,WD[1]);rect(A,cx-4,top+19,8,7,WD[2]);vl(A,cx,top+24,14,PAL.bark[1]);
  rect(A,cx-4,top+38,8,7,WD[2]);hl(A,cx-4,top+38,8,WD[4]);hl(A,cx-5,top+38,10,PAL.slate[3]);
  for(let y=0;y<14;y++){const w=58-(13-y)*0;for(let x=0;x<w;x++){const j=y%5;P(A,cx-29+x,top+y,j===4?PAL.rust[0]:j===0?PAL.rust[4]:PAL.rust[2+((x+y*3)%11===0?1:0)]);}}
  hl(A,cx-29,top,58,PAL.rust[5]);hl(A,cx-29,top+14,58,PAL.wood[1]);groundShadow(cx,base,24,3,70);}
// ---- faceted stone: an irregular outline, a lit top plane, a mid left face, a shadowed right face, a dark rim where it meets the ground
function facetRock(cx,base,rx,ry,seed,R,vein){const pts=[];const n=9;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.82+hsh(i,seed,2)*.3;pts.push([Math.cos(a)*rx*r,Math.sin(a)*ry*r*(Math.sin(a)>0?.9:1.15)]);}
  const inside=(x,y,Q)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [xi,yi]=Q[i],[xj,yj]=Q[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
  const top=pts.map(([x,y])=>[x*.62-rx*.08,y*.5-ry*.42]);const cy=base-ry-1;
  for(let y=-Math.ceil(ry*1.3);y<=ry*1.1;y++)for(let x=-rx-1;x<=rx+1;x++){if(!inside(x,y,pts))continue;let k;
    if(inside(x,y,top))k=(x+y*.6)<-rx*.25?5:4;else if(x<-rx*.15+y*.3)k=y>ry*.5?1:2;else k=y>ry*.3?0:1;
    if(hsh(x+cx,y+cy,seed)>.92&&k>1)k--;P(A,cx+x,cy+y,R[k]);}
  for(let i=0;i<top.length;i++){const [x0,y0]=top[i],[x1,y1]=top[(i+1)%top.length];if(y0>-ry*.3&&y1>-ry*.3)continue;for(let t=0;t<1;t+=.2)P(A,cx+Math.round(x0+(x1-x0)*t),cy+Math.round(y0+(y1-y0)*t),R[5]);}
  for(let j=0;j<ry*.9;j++)P(A,cx+Math.round(rx*.2+Math.sin(j*.9)*1.2),cy+Math.round(-ry*.1+j),R[1]);
  if(vein)for(let i=0;i<8;i++){const x=Math.round((hsh(i,seed,7)-.5)*rx*1.3),y=Math.round((hsh(i,seed,8)-.35)*ry*1.1);if(!inside(x,y,pts))continue;P(A,cx+x,cy+y,vein[0]);P(A,cx+x+1,cy+y,vein[1]);P(A,cx+x,cy+y-1,vein[1]);if(i%3===0)P(B,cx+x+1,cy+y-1,[255,255,240]);}
  for(let x=-rx;x<=rx;x++){if(inside(x,ry*.85,pts))P(A,cx+x,cy+Math.round(ry*.85)+1,R[0]);}
  for(let i=0;i<3;i++)P(A,cx-rx+3+i,cy+Math.round(-ry*.35)+i,PAL.moss[2+(i%2)]);
  groundShadow(cx+2,base,rx+2,2,90);}
const RS=[ST[0],ST[1],ST[2],ST[3],ST[4],ST[5]];
if(K==='rock'){const v=CFG.v||0;facetRock(W/2|0,H-3,(W/2|0)-3,(H/2|0)-4,7+v*5,RS);}
if(K==='ore'){const O={copper:[[168,92,48],[230,150,80]],iron:[[150,160,178],[236,240,248]],coal:[[18,16,20],[70,66,78]],gem:[[60,200,190],[200,255,250]],stone:null}[CFG.ore];
  facetRock(W/2|0,H-3,(W/2|0)-3,(H/2|0)-4,11+CFG.ore.length,RS,O);}
if(K==='weeds'){const cx=W/2|0,base=H-3;const G_=['#132c16','#1f4420','#2f6428','#438232','#62a03e','#8cc256'].map(HEX);
  for(const [layer,cnt,len0,k0] of [[0,6,11,1],[1,6,9,2],[2,5,6,3]])for(let i=0;i<cnt;i++){const a=-Math.PI/2+(i-(cnt-1)/2)*.36+(hsh(i,layer,CFG.v||0)-.5)*.2,len=len0+(hsh(i,layer,3)*4|0);
    for(let t=0;t<len;t++){const bend=t*t*.012*(i<cnt/2?-1:1);const x=cx+Math.round(Math.cos(a)*t*.8+bend*6),y=base-1+Math.round(Math.sin(a)*t);const w=t<len*.5?2:1;
      for(let q=0;q<w;q++)P(A,x+q,y,G_[Math.max(0,Math.min(5,k0+(t>len-3?2:t>len*.5?1:0)-(q?1:0)))]);}}
  if((CFG.v||0)%2){for(const [x,y] of [[cx-4,base-11],[cx+5,base-12],[cx,base-14]]){P(A,x,y,PAL.mustard[5]);P(A,x+1,y,PAL.mustard[4]);P(A,x,y+1,PAL.mustard[3]);P(A,x+1,y+1,PAL.rust[3]);}}
  ell(A,cx,base-1,6,2,G_[0]);groundShadow(cx+2,base,8,2,80);}
if(K==='twig'){const base=H-4;
  const line=(x0,y0,x1,y1,w)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);for(let q=0;q<w;q++)P(A,x,y+q,q===0?WD[4]:q===w-1?WD[0]:WD[2]);}};
  line(3,base-3,W-5,base-6,3);line(10,base-4,15,base-9,2);line(16,base-5,20,base-1,2);
  P(A,W-5,base-6,PAL.cream[2]);P(A,W-5,base-5,PAL.cream[1]);P(A,W-4,base-6,WD[1]);P(A,3,base-3,PAL.cream[2]);
  P(A,15,base-10,PAL.rust[4]);P(A,16,base-10,PAL.rust[3]);P(A,16,base-11,PAL.rust[4]);
  groundShadow(W/2|0,base+1,W/2-3|0,2,80);}
if(K==='stump'){const cx=W/2|0,base=H-4,r=9,top=base-14;
  for(const [dx,l] of [[-1,6],[1,7],[-1,3]]){for(let i=0;i<l;i++){P(A,cx+dx*(r-1+i),base-3+(i>>1),WD[2]);P(A,cx+dx*(r-1+i),base-2+(i>>1),WD[0]);}}
  for(let y=top;y<base;y++)for(let x=-r;x<=r;x++){const u=(x+r)/(2*r);let c=WD[u<.25?3:u<.6?2:1];if((x*3+y)%5===0)c=WD[0];P(A,cx+x,y,c);}
  for(let y=-4;y<=4;y++)for(let x=-r;x<=r;x++){const d=x*x/(r*r)+y*y/16;if(d>1)continue;const ring=Math.floor(Math.sqrt(d)*4);P(A,cx+x,top+y,d>.8?WD[3]:ring%2?PAL.mustard[4]:PAL.mustard[3]);}
  P(A,cx,top,WD[2]);for(let i=0;i<4;i++)P(A,cx+1+i,top-1+(i>>1),WD[1]);groundShadow(cx+2,base,r+4,2,90);}
if(K==='deer'){ // a deer dead on its side across the lane: long stiff legs, pale belly and rump, neck thrown back, ears, dark blood
  const cx=W/2|0,base=H-4,BR=[[40,26,18],[84,54,32],[124,82,48],[160,112,66],[190,146,94]];
  for(let y=-3;y<=3;y++)for(let x=-26;x<=22;x++)if(x*x/676+y*y/9<1)P(A,cx+x,base-1+y,[58,8,10]);
  for(let y=-6;y<=5;y++)for(let x=-14;x<=13;x++){const d=x*x/196+y*y/36;if(d>1)continue;let k=y<-3?4:y<0?3:2;if(y>2)k=1;P(A,cx+x,base-8+y,BR[k]);}
  for(let x=-10;x<=8;x++){P(A,cx+x,base-4,[226,216,196]);P(A,cx+x,base-5,[206,194,172]);}for(let y=-4;y<=1;y++){P(A,cx+13,base-8+y,[232,226,214]);P(A,cx+14,base-8+y,[220,212,198]);}
  for(const [lx,ex,ey] of [[-9,-15,7],[-5,-8,8],[7,13,7],[10,19,6]]){for(let t=0;t<=1;t+=.07){const x=Math.round(cx+lx+(ex-lx)*t),y=Math.round(base-4+ey*t);P(A,x,y,BR[2]);P(A,x+1,y,BR[1]);}P(A,cx+ex,base-4+ey,[30,22,18]);P(A,cx+ex+1,base-4+ey,[30,22,18]);}
  for(let t=0;t<=1;t+=.08){const x=Math.round(cx-13-t*7),y=Math.round(base-10-t*5);for(let q=0;q<3;q++)P(A,x,y+q,BR[q===0?4:2]);}
  for(let y=-3;y<=3;y++)for(let x=-5;x<=4;x++){if(x*x/25+y*y/9>1)continue;P(A,cx-23+x,base-16+y,BR[y<0?3:2]);}for(let i=0;i<4;i++)P(A,cx-28-i,base-15+(i>>1),BR[2]);P(A,cx-31,base-14,[20,14,12]);
  for(let i=0;i<5;i++){P(A,cx-21+i,base-20-i,BR[3]);P(A,cx-19+i,base-21-i,BR[2]);}P(A,cx-24,base-17,[12,8,8]);P(A,cx-23,base-17,[200,200,200]);}
if(K==='doornote'){rect(A,1,2,W-2,H-3,PAL.cream[3]);for(let y=5;y<H-3;y+=2)hl(A,3,y,W-6-(y%4?2:0),PAL.ink[1]);vl(A,W-2,3,H-4,PAL.cream[1]);hl(A,1,H-2,W-2,PAL.cream[1]);P(A,W-3,H-3,PAL.cream[2]);P(A,W-2,H-2,PAL.cream[0]);
  P(A,W/2|0,2,PAL.slate[4]);P(A,W/2|0,3,PAL.slate[1]);P(A,(W/2|0)+1,3,PAL.rust[2]);}
if(K==='icon'){const I=CFG.icon,c=W/2|0;const wood=WD,ir=[[52,56,66],[92,98,110],[150,156,168],[206,212,220]];
  const handle=(x0,y0,x1,y1)=>{for(let t=0;t<=1;t+=.05){const x=Math.round(x0+(x1-x0)*t),y=Math.round(y0+(y1-y0)*t);P(A,x,y,wood[3]);P(A,x+1,y,wood[1]);}};
  if(I==='hoe'){handle(4,16,13,5);for(let i=0;i<6;i++){P(A,12+i,4,ir[3]);P(A,12+i,5,ir[2]);P(A,13+i,6,ir[1]);}P(A,17,7,ir[0]);}
  if(I==='pick'){handle(5,16,11,6);for(let i=-6;i<=6;i++){const y=5+Math.round(Math.abs(i)*.45);P(A,11+i,y,ir[Math.abs(i)>4?3:2]);P(A,11+i,y+1,ir[1]);}}
  if(I==='axe'){handle(4,17,12,5);for(let j=0;j<8;j++)for(let i=0;i<6-Math.abs(j-3.5)*.6;i++)P(A,12+i,2+j,i===0?ir[1]:i>=4?ir[3]:ir[2]);}
  if(I==='can'){const G2=[[34,70,40],[54,110,58],[80,150,80],[130,196,120]];for(let y=-5;y<=5;y++)for(let x=-6;x<=6;x++){if(x*x/36+y*y/25>1)continue;P(A,c-1+x,12+y,G2[x<-2?3:x>2?1:2]);}
    for(let i=0;i<6;i++){P(A,c+5+i,10-i,G2[2]);P(A,c+5+i,11-i,G2[1]);}P(A,c+11,4,[200,200,190]);P(A,c+11,5,[200,200,190]);for(let i=0;i<7;i++){const a=Math.PI+i/6*Math.PI;P(A,c-1+Math.round(Math.cos(a)*5),7+Math.round(Math.sin(a)*4),G2[0]);}}
  if(I==='seed'){for(let y=0;y<11;y++)for(let x=-6+(y<3?2:0);x<=6-(y<3?2:0);x++)P(A,c+x,7+y,PAL.cream[x<-2?3:x>3?1:2]);hl(A,c-3,6,7,PAL.bark[2]);for(let i=0;i<3;i++){P(A,c-2+i*2,12,PAL.bark[1]);P(A,c-1+i*2,14,PAL.bark[1]);}P(A,c-1,3,PAL.moss[3]);P(A,c,4,PAL.moss[2]);P(A,c+1,3,PAL.moss[3]);}
  if(I==='food'){for(let y=-3;y<=3;y++)for(let x=-8;x<=8;x++){if(x*x/64+y*y/9>1)continue;P(A,c+x,13+y,y<0?PAL.mustard[4]:PAL.cream[1]);}for(let x=-7;x<=7;x++){P(A,c+x,11,PAL.rust[3]);P(A,c+x,10,PAL.rust[4]);}for(let i=0;i<3;i++){P(A,c-3+i*3,6-(i%2),PAL.cream[3]);P(A,c-3+i*3,8,PAL.cream[2]);}}}
if(K==='ladder'){for(let y=2;y<H-4;y++){P(A,4,y,WD[4]);P(A,5,y,WD[2]);P(A,W-6,y,WD[3]);P(A,W-5,y,WD[1]);}for(let y=6;y<H-4;y+=6){hl(A,5,y,W-10,WD[4]);hl(A,5,y+1,W-10,WD[1]);}
  ell(A,W/2|0,H-4,W/2-2|0,3,PAL.ink[0]);}
const ART=[SHD,A,B];const flat=flatten([A,B],W,H);const O=outline(flat);const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=CFG.thin?0:150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
