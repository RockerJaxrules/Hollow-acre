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
if(K==='fence_h'){            // two 1 m bays: square posts with a lit cap and a shaded side, two rails with a lit top edge, shadows under the rails
  for(const x of [5,37])for(const ry of [7,14]){hl(A,x,ry,28,WD[5]);hl(A,x,ry+1,28,WD[3]);hl(A,x,ry+2,28,WD[2]);hl(A,x,ry+3,28,WD[0]);for(let i=6;i<28;i+=9)P(A,x+i,ry+2,WD[1]);for(let i=0;i<28;i++)P(SHD,x+i,22,PAL.out[0],50);}
  for(const x of [0,32,64]){rect(A,x+1,2,6,20,WD[2]);vl(A,x+1,2,20,WD[4]);vl(A,x+2,2,20,WD[3]);vl(A,x+6,2,20,WD[0]);vl(A,x+5,2,20,WD[1]);rect(A,x,0,8,3,WD[4]);hl(A,x,0,8,WD[5]);hl(A,x,2,8,WD[1]);
    for(let i=0;i<8;i++)P(SHD,x+i,22,PAL.out[0],90);}}
if(K==='fence_v'){            // a 1 m bay going away: the post you see, and a single rail climbing to the next post
  rect(A,5,12,4,34,WD[2]);vl(A,5,12,34,WD[4]);vl(A,8,12,34,WD[0]);for(let y=16;y<46;y+=8)hl(A,6,y,2,WD[1]);
  rect(A,3,44,8,20,WD[2]);vl(A,3,44,20,WD[4]);vl(A,4,44,20,WD[3]);vl(A,10,44,20,WD[0]);vl(A,9,44,20,WD[1]);rect(A,2,42,10,3,WD[4]);hl(A,2,42,10,WD[5]);hl(A,2,44,10,WD[1]);
  for(let i=0;i<10;i++)P(SHD,2+i,64,PAL.out[0],100);}
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
function facetRock(cx,base,rx,ry,seed,R,vein){const pts=[];const n=9;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.82+hsh(i,seed,2)*.3;pts.push([Math.cos(a)*rx*r*(Math.sin(a)>.2?1.12:.96),Math.min(ry*.55,Math.sin(a)*ry*r*(Math.sin(a)>0?1:1.15))]);}
  pts.push([rx*.98,ry*.55],[-rx*.98,ry*.55]);pts.sort((p,q)=>Math.atan2(p[1],p[0])-Math.atan2(q[1],q[0]));
  const inside=(x,y,Q)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [xi,yi]=Q[i],[xj,yj]=Q[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
  const top=pts.map(([x,y])=>[x*.62-rx*.08,y*.5-ry*.42]);const cy=base-Math.round(ry*.55)-1;
  for(let y=-Math.ceil(ry*1.3);y<=ry*1.1;y++)for(let x=-rx-1;x<=rx+1;x++){if(!inside(x,y,pts))continue;let k;
    if(inside(x,y,top))k=(x+y*.6)<-rx*.25?5:4;else if(x<-rx*.15+y*.3)k=y>ry*.5?1:2;else k=y>ry*.3?0:1;
    if(hsh(x+cx,y+cy,seed)>.92&&k>1)k--;P(A,cx+x,cy+y,R[k]);}
  for(let i=0;i<top.length;i++){const [x0,y0]=top[i],[x1,y1]=top[(i+1)%top.length];if(y0>-ry*.3&&y1>-ry*.3)continue;for(let t=0;t<1;t+=.2)P(A,cx+Math.round(x0+(x1-x0)*t),cy+Math.round(y0+(y1-y0)*t),R[5]);}
  for(let j=0;j<ry*.9;j++)P(A,cx+Math.round(rx*.2+Math.sin(j*.9)*1.2),cy+Math.round(-ry*.1+j),R[1]);
  if(vein)for(let i=0;i<8;i++){const x=Math.round((hsh(i,seed,7)-.5)*rx*1.3),y=Math.round((hsh(i,seed,8)-.35)*ry*1.1);if(!inside(x,y,pts))continue;P(A,cx+x,cy+y,vein[0]);P(A,cx+x+1,cy+y,vein[1]);P(A,cx+x,cy+y-1,vein[1]);if(i%3===0)P(B,cx+x+1,cy+y-1,[255,255,240]);}
  for(let x=-rx;x<=rx;x++){if(inside(x,ry*.5,pts))P(A,cx+x,cy+Math.round(ry*.55),R[0]);}
  for(let i=0;i<3;i++)P(A,cx-rx+3+i,cy+Math.round(-ry*.35)+i,PAL.moss[2+(i%2)]);
  const gy=base;for(let x=-rx-2;x<=rx+2;x++){P(SHD,cx+x,gy,PAL.out[0],150);P(SHD,cx+x+1,gy+1,PAL.out[0],90);}
  if(!vein){const GG=['#1f4420','#2f6428','#438232','#62a03e'].map(HEX);for(let i=0;i<9;i++){const x=cx-rx+1+Math.round(hsh(i,seed,9)*(rx*2-2)),h=2+(hsh(i,seed,10)*3|0);for(let k=0;k<h;k++)P(A,x+(k===h-1&&i%2?1:0),gy-k,GG[k===h-1?3:k?2:1]);}}
  else{for(let i=0;i<6;i++){const x=cx-rx+Math.round(hsh(i,seed,9)*rx*2);P(A,x,gy,ST[1]);P(A,x+1,gy,ST[2]);}}}
const RS=[ST[0],ST[1],ST[2],ST[3],ST[4],ST[5]];
if(K==='rock'){const v=CFG.v||0;facetRock(W/2|0,H-3,(W/2|0)-3,(H/2|0)-4,7+v*5,RS);}
if(K==='ore'){const O={copper:[[168,92,48],[230,150,80]],iron:[[150,160,178],[236,240,248]],coal:[[18,16,20],[70,66,78]],gem:[[60,200,190],[200,255,250]],stone:null}[CFG.ore];
  facetRock(W/2|0,H-3,(W/2|0)-3,(H/2|0)-4,11+CFG.ore.length,RS,O);}
if(K==='weeds'){const cx=W/2|0,base=H-3;const G_=['#132c16','#1f4420','#2f6428','#438232','#62a03e','#8cc256'].map(HEX);
  for(const [layer,cnt,len0,k0] of [[0,6,11,1],[1,6,9,2],[2,5,6,3]])for(let i=0;i<cnt;i++){const a=-Math.PI/2+(i-(cnt-1)/2)*.36+(hsh(i,layer,CFG.v||0)-.5)*.2,len=len0+(hsh(i,layer,3)*4|0);
    for(let t=0;t<len;t++){const bend=t*t*.012*(i<cnt/2?-1:1);const x=cx+Math.round(Math.cos(a)*t*.8+bend*6),y=base-1+Math.round(Math.sin(a)*t);const w=t<len*.5?2:1;
      for(let q=0;q<w;q++)P(A,x+q,y,G_[Math.max(0,Math.min(5,k0+(t>len-3?2:t>len*.5?1:0)-(q?1:0)))]);}}
  if((CFG.v||0)%2){for(const [x,y] of [[cx-4,base-11],[cx+5,base-12],[cx,base-14]]){P(A,x,y,PAL.mustard[5]);P(A,x+1,y,PAL.mustard[4]);P(A,x,y+1,PAL.mustard[3]);P(A,x+1,y+1,PAL.rust[3]);}}
  ell(A,cx,base-1,6,2,G_[0]);for(let x=-8;x<=8;x++)P(SHD,cx+x,base,PAL.out[0],120);}
if(K==='twig'){const base=H-4;
  const line=(x0,y0,x1,y1,w)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);for(let q=0;q<w;q++)P(A,x,y+q,q===0?WD[4]:q===w-1?WD[0]:WD[2]);}};
  line(3,base-3,W-5,base-6,3);line(10,base-4,15,base-9,2);line(16,base-5,20,base-1,2);
  P(A,W-5,base-6,PAL.cream[2]);P(A,W-5,base-5,PAL.cream[1]);P(A,W-4,base-6,WD[1]);P(A,3,base-3,PAL.cream[2]);
  P(A,15,base-10,PAL.rust[4]);P(A,16,base-10,PAL.rust[3]);P(A,16,base-11,PAL.rust[4]);
  for(let x=3;x<W-4;x++)P(SHD,x,base-2+Math.round((x-3)*-3/(W-8))+3,PAL.out[0],120);}
if(K==='stump'){const cx=W/2|0,base=H-3,r=CFG.r||6,top=base-10,BK=CFG.bark.map(HEX);
  for(const [dx,l] of [[-1,4],[1,5]]){for(let i=0;i<l;i++){const y=base-2+Math.min(1,i>>1);P(A,cx+dx*(r-1+i),y,BK[3]);P(A,cx+dx*(r-1+i),y+1,BK[1]);}}
  for(let y=top;y<=base;y++){const fl=y>base-3?1:0;for(let x=-r-fl;x<=r+fl;x++){const u=(x+r)/(2*r);let c=BK[u<.22?4:u<.5?3:u<.8?2:1];if((x*5+y*3)%7===0)c=BK[1];if(y===base)c=BK[0];P(A,cx+x,y,c);}}
  for(let y=-3;y<=3;y++)for(let x=-r;x<=r;x++){const d=x*x/(r*r)+y*y/9;if(d>1)continue;const ring=Math.floor(Math.sqrt(d)*3.5);P(A,cx+x,top+y,d>.72?BK[4]:ring%2?[214,176,118]:[190,148,92]);}
  P(A,cx,top,[150,110,66]);for(let i=0;i<3;i++)P(A,cx+1+i,top-1+(i>>1),[120,84,50]);if(CFG.resin)P(A,cx+r-1,top+4,[230,190,90]);
  for(let x=-r-4;x<=r+5;x++){P(SHD,cx+x,base+1,PAL.out[0],150);}
  const GG=['#1f4420','#2f6428','#438232','#62a03e'].map(HEX);for(let i=0;i<9;i++){const x=cx-r-3+Math.round(hsh(i,4,9)*(r*2+6)),h=2+(hsh(i,5,9)*2|0);for(let k=0;k<h;k++)P(A,x,base+1-k,GG[k===h-1?3:k?2:1]);}}
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
if(K==='icon'){const I=CFG.icon;   // 16x16 inventory icons, lit from the upper left, read at 2x
  const WO=[[58,36,20],[96,62,34],[140,94,54],[184,136,84]],SL=[[46,50,60],[92,98,112],[156,162,176],[222,228,236]];
  const line=(x0,y0,x1,y1,R)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);P(A,x,y,R[3]);P(A,x+1,y,R[2]);P(A,x+1,y+1,R[1]);}};
  const blob2=(cx,cy,rx,ry,R,lift)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx+.01)+y*y/(ry*ry+.01);if(d>1)continue;const l=-x/rx*.5-y/ry*.7;P(A,cx+x,cy+y,R[d>.75&&(x>0||y>0)?0:l>.45?3:l>-.2?2:1]);}if(lift!==false)P(A,cx-Math.round(rx*.4),cy-Math.round(ry*.5),R[3]);};
  const bowl=(top,top2)=>{for(let x=-6;x<=6;x++){const h=Math.round(Math.sqrt(Math.max(0,36-x*x))*.55);for(let y=0;y<=h;y++)P(A,8+x,9+y,y===h?WO[0]:x<-2?WO[3]:x>3?WO[1]:WO[2]);}for(let x=-6;x<=6;x++){P(A,8+x,8,top);P(A,8+x,9,WO[2]);}for(let x=-4;x<=4;x+=2)P(A,8+x,8,top2);hl(A,3,8,2,WO[3]);};
  const rockI=(vein)=>{const R=[[40,38,44],[70,66,76],[108,104,114],[150,146,154],[196,192,198]];for(let y=-5;y<=4;y++)for(let x=-6;x<=6;x++){const d=x*x/36+y*y/(y<0?25:16);if(d>1)continue;let k=y<-1&&x<2?4:x<0?3:y>1?1:2;if(hsh(x,y,3)>.85&&k>1)k--;P(A,8+x,10+y,R[k]);}
    if(vein)for(const [x,y] of [[-3,-1],[1,-3],[3,1],[-1,2]]){P(A,8+x,10+y,vein[0]);P(A,9+x,10+y,vein[1]);}};
  const ingot=(R)=>{for(let y=0;y<6;y++)for(let x=-6+y*.5|0;x<=6-y*.5;x++){}for(let y=0;y<6;y++){const w=4+y;for(let x=-w;x<=w;x++)P(A,8+x,6+y,y===0?R[3]:x>w-2?R[0]:x<-w+2?R[2]:R[1+(y<2?1:0)]);}hl(A,3,12,11,R[0]);P(A,6,7,R[3]);P(A,7,7,R[3]);};
  if(I==='hoe'){line(2,14,11,5,WO);rect(A,10,2,6,2,SL[3]);rect(A,14,4,2,4,SL[2]);P(A,15,7,SL[1]);P(A,10,3,SL[2]);P(A,11,4,SL[1]);}
  if(I==='pick'){line(3,14,9,6,WO);for(let i=-6;i<=6;i++){const y=3+Math.round(6*.09*36/36)-Math.round(-(i*i)*.0)+Math.round(i*i*.0);P(A,9+i,y,SL[Math.abs(i)>4?3:2]);P(A,9+i,y+1,SL[1]);}P(A,9,3,SL[3]);P(A,3,6,SL[3]);P(A,15,6,SL[2]);}
  if(I==='axe'){line(3,14,9,4,WO);for(let j=0;j<8;j++)for(let i=0;i<5-Math.abs(j-3.5)*.5;i++)P(A,9+i,1+j,i===0?SL[1]:i>=3?SL[3]:SL[2]);P(A,13,2,SL[3]);P(A,14,4,SL[3]);P(A,8,2,WO[1]);}
  if(I==='can'){const G=[[30,66,40],[50,104,58],[78,146,80],[132,196,122]];blob2(7,10,5,4,G);for(let i=0;i<5;i++){P(A,11+i,9-i,G[2]);P(A,11+i,10-i,G[1]);}P(A,15,4,[210,210,200]);P(A,15,5,[160,160,150]);
    for(let i=0;i<7;i++){const a=Math.PI+i/6*Math.PI;P(A,7+Math.round(Math.cos(a)*4),6+Math.round(Math.sin(a)*3),G[1]);}}
  if(I==='seed'){const C=PAL.cream;for(let y=0;y<9;y++){const w=3+Math.min(y,3);for(let x=-w;x<=w;x++)P(A,8+x,6+y,C[x<-1?3:x>2?1:2]);}hl(A,5,14,7,C[0]);hl(A,6,5,5,PAL.bark[2]);P(A,7,4,C[2]);P(A,9,4,C[1]);
    P(A,8,2,PAL.moss[3]);P(A,7,1,PAL.moss[3]);P(A,9,1,PAL.moss[2]);P(A,8,3,PAL.moss[2]);for(const [x,y] of [[6,9],[9,11],[8,8]])P(A,x,y,PAL.bark[1]);}
  if(I==='food'){for(let y=0;y<4;y++)for(let x=-6+y;x<=6-y;x++)P(A,8+x,8-y,y===3?PAL.mustard[5]:PAL.mustard[4-(x>2?1:0)]);bowl(PAL.rust[3],PAL.rust[4]);}
  if(I==='wood'){for(let y=0;y<6;y++)for(let x=2;x<13;x++)P(A,x,6+y,WO[y<2?3:y>4?0:2]);for(let x=3;x<12;x+=4)P(A,x,8,WO[1]);for(let y=-3;y<=3;y++)for(let x=-2;x<=2;x++){if(x*x/4+y*y/9>1)continue;P(A,13+x,9+y,(x*x+y*y)%3===0?[214,176,118]:[190,148,92]);}P(A,13,9,WO[1]);}
  if(I==='stone')rockI(null);
  if(I==='fiber'){const G=['#1f4420','#2f6428','#438232','#62a03e','#8cc256'].map(HEX);for(let i=0;i<7;i++){const x=4+i;for(let y=2;y<15;y++)P(A,x+Math.round(Math.sin(y*.5+i)*.8),y,G[1+((i+y)%4)]);}hl(A,4,8,8,PAL.bark[2]);hl(A,4,9,8,PAL.bark[1]);}
  if(I==='copper')rockI([[168,92,48],[236,154,84]]);if(I==='iron')rockI([[150,160,178],[238,242,250]]);
  if(I==='coal'){for(const [cx,cy,r] of [[6,10,3],[10,9,3],[8,12,3]])blob2(cx,cy,r,r-1,[[10,10,14],[24,22,28],[44,42,50],[80,78,90]]);}
  if(I==='gem'){const T=[[20,80,80],[40,140,136],[80,200,190],[200,255,250]];for(let y=0;y<10;y++){const w=y<3?2+y*2:Math.max(0,8-(y-3)*1.2|0);for(let x=-w;x<=w;x++)P(A,8+x,3+y,T[y<3?(x<0?3:2):x<0?2:x>w-2?0:1]);}P(A,6,5,[255,255,255]);}
  if(I==='cbar')ingot([[110,52,22],[168,92,48],[214,132,72],[246,186,120]]);if(I==='ibar')ingot([[60,64,76],[110,118,132],[164,172,186],[226,232,240]]);
  if(I==='bread'){for(let y=-4;y<=3;y++)for(let x=-6;x<=6;x++){const d=x*x/36+y*y/(y<0?16:9);if(d>1)continue;P(A,8+x,10+y,y<-1?PAL.mustard[x<0?5:4]:y>1?PAL.rust[2]:PAL.mustard[3]);}for(const x of [-3,0,3])for(let k=0;k<2;k++)P(A,8+x+k,8-k,PAL.cream[3]);}
  if(I==='stew')bowl([120,70,36],[200,140,60]);if(I==='soup')bowl([214,170,96],[240,214,150]);if(I==='chowder')bowl([236,210,120],[250,236,170]);if(I==='glowstew')bowl([60,200,170],[160,255,230]);
  if(I==='egg'||I==='egg_fried'){if(I==='egg')blob2(8,9,4,5,[[180,168,140],[214,204,180],[240,234,214],[252,250,240]]);else{blob2(8,9,6,4,[[200,196,184],[228,224,212],[244,242,234],[255,255,250]],false);blob2(8,9,2,2,[[200,120,20],[230,160,40],[250,196,70],[255,230,140]]);}}
  if(I==='pie'){for(let y=0;y<7;y++){const w=7-y;for(let x=-7;x<=w-1;x++)P(A,8+x,12-y,y===0?PAL.rust[1]:x>w-3?PAL.mustard[3]:PAL.rust[3]);}for(let x=-7;x<0;x++)P(A,8+x,5+((x+7)>>1),PAL.mustard[5]);hl(A,1,13,13,WO[1]);}
  if(I==='turnip'){for(let y=-4;y<=4;y++)for(let x=-5;x<=5;x++){const dd=x*x/25+y*y/16;if(dd>1)continue;const l=-x/5*.5-y/4*.7;P(A,8+x,10+y,y<-1?[200,90,150][0]&&(l>.3?[236,150,196]:[200,96,160]):(l>.3?[250,244,232]:l>-.3?[226,218,200]:[180,170,150]));}
    for(let i=0;i<3;i++){P(A,8+i-1,13+i,[170,160,140]);}for(const [x,c] of [[-2,PAL.moss[3]],[0,PAL.moss[2]],[2,PAL.moss[3]]])for(let k=0;k<5;k++)P(A,8+x+(k>2?x>0?1:x<0?-1:0:0),5-k,c);}
  if(I==='pumpkin'){const OR=[[110,34,14],[164,62,22],[214,98,34],[240,140,58],[252,184,96]];for(let y=-5;y<=5;y++)for(let x=-7;x<=7;x++){const dd=x*x/49+y*y/25;if(dd>1)continue;const rib=Math.abs(Math.sin(x/7*Math.PI*1.6));const l=-x/7*.5-y/5*.7-rib*.3;P(A,8+x,10+y,OR[l>.45?4:l>.05?3:l>-.35?2:1]);}vl(A,8,2,4,[74,90,36]);P(A,9,2,[110,130,52]);}
  if(I==='corn'){for(let y=3;y<14;y++){const w=y<5||y>11?1:2;for(let x=-w;x<=w;x++)P(A,8+x,y,(x+y)%2?PAL.mustard[5]:PAL.mustard[4]);}for(let y=6;y<15;y++){P(A,5+((y>>2)&1),y,PAL.moss[2]);P(A,11-((y>>2)&1),y,PAL.moss[3]);}P(A,8,2,[220,200,140]);}
  if(I==='mushroom'){for(let y=-3;y<=1;y++)for(let x=-6;x<=6;x++){if(x*x/36+y*y/9>1)continue;P(A,8+x,8+y,y<-1?[120,250,210]:[60,200,170]);}for(const [x,y] of [[-3,-1],[2,-2],[4,0]])P(A,8+x,8+y,[220,255,245]);rect(A,7,9,3,5,PAL.cream[3]);vl(A,9,9,5,PAL.cream[1]);}
  if(I==='milk'){const G=[[120,140,150],[170,190,198],[214,228,232],[248,252,252]];for(let y=0;y<10;y++){const w=y<2?1:y<4?2:4;for(let x=-w;x<=w;x++)P(A,8+x,4+y,y<4?G[x<0?3:x>0?1:2]:(y>4?[246,244,236]:G[2]));}
    for(let y=5;y<14;y++){P(A,4,y,G[1]);P(A,12,y,G[0]);}for(let x=-3;x<=3;x++)P(A,8+x,14,G[0]);rect(A,7,2,3,2,[176,52,40]);P(A,7,2,[220,90,70]);vl(A,5,6,7,[255,255,255]);rect(A,6,8,5,3,[90,130,190]);P(A,7,9,[230,236,244]);P(A,9,9,[230,236,244]);}
  if(I==='bait'){const T=[[70,74,80],[120,126,134],[170,176,184],[214,220,226]];for(let y=0;y<6;y++)for(let x=-6;x<=6;x++)P(A,8+x,8+y,y===5?T[0]:x<-3?T[3]:x>3?T[1]:T[2]);for(let x=-6;x<=6;x++)P(A,8+x,7,T[1]);
    const W=[[150,70,70],[200,110,100],[236,150,140]];for(const [x0,ph] of [[4,0],[8,2],[11,1]])for(let i=0;i<5;i++)P(A,x0+Math.round(Math.sin(i*.9+ph)*1.2),6-i,W[(i+ph)%3]);rect(A,5,10,7,2,[214,170,80]);P(A,6,10,[250,214,120]);}
  if(I==='rod'){line(2,15,14,1,WO);P(A,14,1,[60,50,40]);for(let i=0;i<12;i++)P(A,14,2+i,[220,220,210]);blob2(4,12,2,2,[[90,90,96],[140,140,150],[190,190,200],[240,240,246]]);P(A,14,14,[200,60,40]);P(A,14,13,[250,250,250]);}
  if(I==='fish'){const F=[[60,80,70],[96,128,110],[140,176,150],[200,224,200]];for(let y=-3;y<=3;y++)for(let x=-6;x<=4;x++){if(x*x/36+y*y/9>1)continue;P(A,8+x,9+y,F[y<-1?3:y>1?0:x>1?1:2]);}
    for(let y=-3;y<=3;y++)for(let x=0;x<=Math.abs(y);x++)P(A,13+x,9+y,F[1]);P(A,4,8,[20,20,24]);P(A,5,10,F[0]);for(let x=-3;x<=1;x+=2)P(A,8+x,7,F[0]);}
  if(I==='hash'){for(let x=-7;x<=7;x++){P(A,8+x,12,[200,200,196]);P(A,8+x,13,[150,150,146]);}for(const [x,y,c] of [[-3,10,PAL.rust[3]],[0,9,PAL.mustard[4]],[3,10,PAL.sage[3]],[-1,11,PAL.rust[4]],[2,11,PAL.mustard[3]]]){P(A,8+x,y,c);P(A,9+x,y,c);P(A,8+x,y-1,c);}}}

if(K==='pumpkin'){const cx=W/2|0,base=H-3,rx=CFG.big?10:8,ry=CFG.big?7:6,cy=base-ry;const OR=CFG.pale?[[120,70,40],[168,112,64],[206,150,92],[230,186,128],[244,214,160]]:[[110,34,14],[164,62,22],[214,98,34],[240,140,58],[252,184,96]];
  for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx)+y*y/(ry*ry);if(d>1)continue;const rib=Math.abs(Math.sin((x/rx)*Math.PI*1.8));const l=-.5*x/rx-.75*y/ry+.25-rib*.35;
    let k=l>.55?4:l>.15?3:l>-.25?2:1;if(rib<.12&&Math.abs(x)<rx-1)k=Math.max(0,k-1);if(y>ry*.6)k=Math.min(k,1);P(A,cx+x,cy+y,OR[k]);}
  for(let x=-rx+2;x<=rx-2;x++)P(A,cx+x,base,OR[0]);P(A,cx-3,cy-ry+2,OR[4]);P(A,cx-2,cy-ry+2,OR[4]);
  vl(A,cx,cy-ry-3,4,[74,90,36]);P(A,cx+1,cy-ry-3,[110,130,52]);P(A,cx+2,cy-ry-4,[74,90,36]);P(A,cx+3,cy-ry-4,[110,130,52]);
  if(CFG.face&&!CFG.side){const F=[[255,214,110],[255,170,60]],face=CFG.face;const ey=cy-2;
    for(const sx of [-4,3]){for(let i=0;i<3;i++)for(let j=0;j<=i;j++)P(A,cx+sx+j-(face===2?0:0),ey-i+2,F[1]);P(A,cx+sx+1,ey+1,F[0]);}
    P(A,cx,cy+1,F[1]);for(let x=-5;x<=5;x++){const yy=cy+3+(face===3?Math.round(Math.abs(x)*.3):Math.round(-Math.abs(x)*.25+1));P(A,cx+x,yy,F[x%3===0?0:1]);if(face!==2&&x%3!==0)P(A,cx+x,yy+1,F[1]);}}
  // the same face turned to the east: it sits toward the right edge, narrower, the far eye smaller, the grin curving round the side
  if(CFG.face&&CFG.side){const F=[[255,214,110],[255,170,60]],ey=cy-2,fx=cx+5;
    for(let i=0;i<3;i++)for(let j=0;j<=i;j++)P(A,fx-3+j,ey-i+2,F[1]);P(A,fx-2,ey+1,F[0]);
    for(let i=0;i<2;i++)for(let j=0;j<=i;j++)P(A,fx+2+j,ey-i+2,F[1]);
    P(A,fx,cy+1,F[1]);for(let x=-4;x<=3;x++){const yy=cy+3+Math.round(-Math.abs(x+.5)*.25+1)+(x>1?-1:0);P(A,fx+x,yy,F[x%3===0?0:1]);}}
  for(let x=-rx-1;x<=rx+1;x++)P(SHD,cx+x,base+1,PAL.out[0],140);}
// ---- workbenches: a thick plank top seen from above, a front apron, splayed legs, and the tools of each trade lying on it
function benchBase(top,w,h,legH){const x0=(W-w)>>1,base=H-3,fy=top+h;
  for(const lx of [x0+2,x0+w-6]){rect(A,lx,fy,4,legH,WD[2]);vl(A,lx,fy,legH,WD[4]);vl(A,lx+3,fy,legH,WD[0]);}
  rect(A,x0+4,fy+legH-6,w-8,2,WD[1]);hl(A,x0+4,fy+legH-6,w-8,WD[3]);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y%5===0)?3:(x+((y/5|0)*13))%23===0?2:4;P(A,x0+x,top+y,WD[k]);}hl(A,x0,top,w,WD[5]);
  rect(A,x0,fy,w,6,WD[2]);hl(A,x0,fy,w,WD[1]);hl(A,x0,fy+5,w,WD[0]);for(let x=x0+6;x<x0+w-4;x+=12)P(A,x,fy+2,PAL.slate[4]);
  for(let y=fy+6;y<=base;y++)for(let x=x0+1;x<x0+w-1;x++){const c=G(A,x,y);if(!c)P(SHD,x,y,PAL.out[0],Math.round(60+(y-fy)*5));}
  for(let x=x0-2;x<x0+w+3;x++)P(SHD,x,base,PAL.out[0],150);for(const lx of [x0+2,x0+w-6])for(let i=-1;i<6;i++)P(SHD,lx+i,base-1,PAL.out[0],170);
  for(let x=x0;x<x0+w;x++){const c=G(A,x,top+h-1);if(c)P(A,x,top+h-1,shade(c,.8));}return {x0,fy,top};}
if(K==='bench_farm'){const b=benchBase(14,W-8,14,18);   // seed trays, a trowel, a sack of seed, a sprinkler in pieces
  for(let i=0;i<3;i++){const x=b.x0+4+i*9;rect(A,x,b.top+3,8,6,WD[1]);rect(A,x+1,b.top+4,6,4,[110,74,44]);P(A,x+2,b.top+4,PAL.moss[3]);P(A,x+5,b.top+5,PAL.moss[2]);}
  ell(A,b.x0+W-22,b.top+4,5,4,PAL.cream[2]);ell(A,b.x0+W-23,b.top+3,3,2,PAL.cream[3]);rect(A,b.x0+W-18,b.top+9,6,2,PAL.slate[3]);P(A,b.x0+W-13,b.top+9,PAL.brass[2]);
  for(let i=0;i<5;i++)P(A,b.x0+14+i,b.top+11,PAL.brass[3]);}
if(K==='bench_weapon'){const b=benchBase(16,W-8,12,18);  // a whetstone wheel, a blade on the top, a rack of handles behind
  for(let i=0;i<4;i++){vl(A,b.x0+5+i*6,2,15,WD[3]);vl(A,b.x0+6+i*6,2,15,WD[1]);P(A,b.x0+5+i*6,2,PAL.slate[4]);}hl(A,b.x0+2,6,24,WD[4]);
  for(let i=0;i<16;i++){P(A,b.x0+10+i,b.top+5,PAL.white[4]);P(A,b.x0+10+i,b.top+6,PAL.white[2]);}rect(A,b.x0+6,b.top+4,4,3,WD[1]);
  ell(A,b.x0+W-20,b.top+2,6,6,ST[3]);ell(A,b.x0+W-20,b.top+2,4,4,ST[4]);P(A,b.x0+W-20,b.top+2,ST[1]);}
if(K==='bench_armor'){const b=benchBase(18,W-8,12,16);   // a dress form wearing a work coat, rivets and a hammer on the top
  const cx=b.x0+10;rect(A,cx-1,b.top-2,2,6,WD[1]);for(let y=0;y<14;y++){const w2=5-Math.abs(y-6)*.3|0;for(let x=-w2;x<=w2;x++)P(A,cx+x,2+y,PAL.rust[x<-1?4:x>1?2:3]);}
  hl(A,cx-4,2,9,PAL.rust[5]);for(let y=4;y<15;y+=3)P(A,cx,y,PAL.brass[3]);
  rect(A,b.x0+W-26,b.top+4,10,3,PAL.slate[3]);hl(A,b.x0+W-26,b.top+4,10,PAL.slate[5]);rect(A,b.x0+W-18,b.top+2,3,8,WD[3]);
  for(let i=0;i<6;i++)P(A,b.x0+18+i*2,b.top+8,PAL.brass[3]);}
if(K==='bench_furn'){const b=benchBase(14,W-8,14,18);    // a half-built chair, a saw, wood shavings
  rect(A,b.x0+5,b.top-8,10,12,WD[3]);frame(A,b.x0+5,b.top-8,10,12,WD[5],WD[1]);for(let x=b.x0+7;x<b.x0+14;x+=3)vl(A,x,b.top-6,8,WD[2]);
  for(let i=0;i<14;i++){P(A,b.x0+W-28+i,b.top+6-(i>>2),PAL.slate[4]);if(i%2)P(A,b.x0+W-28+i,b.top+7-(i>>2),PAL.slate[2]);}rect(A,b.x0+W-14,b.top+3,4,4,WD[1]);
  for(let i=0;i<7;i++)P(A,b.x0+20+(hsh(i,2)*12|0),b.top+9+(i%3),PAL.cream[2+(i%2)]);}
if(K==='furnace'){const cx=W/2|0,base=H-3,w=26,top=10;   // a fieldstone furnace with a chimney and a glowing mouth
  for(let y=top;y<base;y++)for(let x=-w/2;x<w/2;x++){const r=((y-top)/5|0),o=r%2?4:0,bk=(x+w+o)%8;let c=ST[(hsh((x+w+o)>>3,r,4)>.5)?3:2];if(bk===0||(y-top)%5===4)c=ST[1];if(x<-w/2+3)c=ST[4];if(x>w/2-4)c=ST[1];P(A,cx+x,y,c);}
  for(let y=0;y<8;y++)for(let x=-6;x<=5;x++)P(A,cx+x,top-8+y,ST[x<-3?4:x>3?1:2]);rect(A,cx-7,top-10,14,3,ST[4]);hl(A,cx-7,top-10,14,ST[5]);
  for(let y=0;y<10;y++)for(let x=-6;x<6;x++){const dy=Math.max(0,4-y);if(y<4&&x*x+dy*dy*2.2>36)continue;P(A,cx+x,base-14+y,y<3?[60,20,10]:[(240-y*8)|0,(140-y*8)|0,40]);}
  hl(A,cx-8,base-4,16,ST[4]);hl(A,cx-w/2,top,w,ST[5]);for(let x=-w/2-1;x<=w/2+1;x++)P(SHD,cx+x,base+1,PAL.out[0],150);}
if(K==='icon32'){const I=CFG.icon;   // 32x32 hotbar icons: the same tool art the farmer swings, plus detailed seed pouch and meal
  if(I==='pick'){   // hand-drawn: haft from the lower left, a symmetric head across its top, both points curving back toward the hands
    const WO=[[52,32,18],[96,62,34],[140,94,54],[184,136,84]],SLV=[[46,50,60],[92,98,112],[156,162,176],[214,220,230],[244,248,252]];
    for(let t=0;t<=1;t+=.02){const x=4+t*15,y=28-t*15;for(let o=-1.6;o<=1.6;o+=.5){const X=Math.round(x+o*.707),Y=Math.round(y+o*.707);P(A,X,Y,WO[o<-.6?3:o>.8?1:2]);}}
    const C=[19.5,10.5],pp=[.707,.707],hh=[.707,-.707];
    for(let t=-12;t<=12;t+=.2){const bend=t*t*.05,cx=C[0]+pp[0]*t-hh[0]*bend,cy=C[1]+pp[1]*t-hh[1]*bend,th=Math.max(.8,2.3-Math.abs(t)*.12);
      for(let o=-th;o<=th;o+=.35){const X=Math.round(cx+hh[0]*o),Y=Math.round(cy+hh[1]*o);P(A,X,Y,SLV[o>th*.4?4:o>-.2?3:o>-th*.6?2:1]);}}
    for(let o=-2;o<=2;o++){P(A,Math.round(C[0]+pp[0]*o),Math.round(C[1]+pp[1]*o),SLV[1]);P(A,Math.round(C[0]+pp[0]*o-.7),Math.round(C[1]+pp[1]*o+.7),SLV[0]);}}
  else if(TOOLART[I]){stampTool(I,9,27,-45,false,1,(x,y,c)=>P(A,x,y,c),1.42);}
  if(I==='can'){const G=[[26,58,34],[44,94,52],[70,136,74],[118,186,108],[176,222,160]];
    for(let y=-8;y<=8;y++)for(let x=-10;x<=10;x++){const d=x*x/100+y*y/64;if(d>1)continue;const l=-x/10*.55-y/8*.65+.15;let k=l>.55?4:l>.2?3:l>-.2?2:l>-.55?1:0;if(d>.86)k=Math.max(0,k-1);P(A,13+x,20+y,G[k]);}
    for(let x=-9;x<=9;x++){P(A,13+x,12,G[3]);P(A,13+x,13,G[1]);}for(let i=0;i<11;i++){const a=Math.PI+i/10*Math.PI;for(let t=0;t<2;t++)P(A,13+Math.round(Math.cos(a)*(7+t)),11+Math.round(Math.sin(a)*(6+t)),G[t?0:2]);}
    for(let i=0;i<9;i++){for(let t=0;t<3;t++)P(A,21+i,18-i+t,G[t===0?3:t===1?2:0]);}for(let y=-3;y<=3;y++)for(let x=0;x<3;x++)P(A,29+x,8+y,[x===0?150:200,x===0?150:200,x===0?140:190]);for(let y=-2;y<=2;y+=2)P(A,31,8+y,[90,90,84]);
    for(let i=0;i<3;i++){P(A,6+i*3,19,G[4]);}P(A,7,16,[255,255,255]);P(A,8,16,G[4]);}
  if(I==='seed'){const C=[[90,72,50],[138,114,82],[184,160,120],[222,206,168],[242,232,206]];
    for(let y=0;y<18;y++){const w=Math.round(4+Math.min(y,7)*1.1-(y>14?(y-14)*.8:0));for(let x=-w;x<=w;x++){const l=-x/w*.6+(.3-y/18*.4);P(A,16+x,11+y,C[l>.45?4:l>.1?3:l>-.25?2:1]);}}
    for(let x=-8;x<=8;x++)P(A,16+x,28,C[0]);for(let x=-5;x<=5;x++){P(A,16+x,10,C[3]);P(A,16+x,11,C[1]);}rect(A,12,9,9,2,PAL.bark[2]);hl(A,12,9,9,PAL.bark[4]);
    for(let i=0;i<4;i++){P(A,16,8-i,PAL.moss[2]);}for(const [x,y] of [[14,5],[13,4],[18,5],[19,4],[18,6]])P(A,x,y,PAL.moss[3]);P(A,12,4,PAL.moss[2]);
    for(const [x,y] of [[13,17],[18,20],[15,23],[19,15],[12,21]]){P(A,x,y,PAL.bark[1]);P(A,x+1,y,PAL.bark[2]);}}
  if(I==='food'){const R=[[110,52,22],[168,92,48],[214,132,72],[240,176,104],[250,212,150]];
    for(let y=0;y<8;y++){const w=13-Math.round(y*.4);for(let x=-w;x<=w;x++){const l=-x/w*.4;P(A,16+x,22+y,y===7?R[0]:y<1?R[4]:l>.2?R[3]:R[2]);}}
    for(let y=-6;y<=0;y++)for(let x=-12;x<=12;x++){if(x*x/144+y*y/36>1)continue;const l=-x/12*.5-y/6*.6;P(A,16+x,22+y,l>.4?PAL.mustard[5]:l>0?PAL.mustard[4]:PAL.mustard[3]);}
    for(const [x0,x1] of [[-9,-3],[-1,5],[7,11]])for(let x=x0;x<=x1;x++){P(A,16+x,18+Math.round(Math.abs(x-(x0+x1)/2)*.3),PAL.rust[2]);}
    for(let i=0;i<5;i++){P(A,10+i*3,15,PAL.cream[3]);P(A,10+i*3,14,PAL.cream[3]);}for(let x=-14;x<=14;x++){P(A,16+x,30,[210,210,206]);P(A,16+x,31,[150,150,146]);}}}
if(K==='anvil'){const IR=[[30,32,38],[54,58,68],[86,92,106],[130,136,150],[180,186,198]];const cx=W/2|0,base=H-3;
  rect(A,cx-6,base-12,12,12,WD[2]);vl(A,cx-6,base-12,12,WD[4]);vl(A,cx+5,base-12,12,WD[0]);hl(A,cx-7,base-1,14,WD[1]);
  for(let y=0;y<5;y++)for(let x=-12;x<=10;x++){if(x<-8&&y>2-(x+12)*.6)continue;P(A,cx+x,base-19+y,y===0?IR[4]:x>7?IR[1]:IR[2+(y<2?1:0)]);}rect(A,cx-4,base-14,8,2,IR[1]);hl(A,cx-12,base-19,23,IR[4]);P(A,cx+6,base-18,[240,140,60]);
  for(let x=-8;x<=8;x++)P(SHD,cx+x+1,base+1,PAL.out[0],150);}
if(K==='lumber'){const base=H-3;for(let r=0;r<4;r++){const y=base-4-r*5;for(let x=2+r;x<W-2-r;x++){P(A,x,y,WD[4]);P(A,x,y+1,WD[3]);P(A,x,y+2,WD[2]);P(A,x,y+3,WD[0]);}for(const ex of [2+r,W-3-r]){vl(A,ex,y,4,PAL.mustard[4]);}}
  for(let x=1;x<W-1;x++)P(SHD,x,base+1,PAL.out[0],140);}
if(K==='cow'){const base=H-3,cx=W/2|0;const Wt=[[60,56,54],[150,144,138],[214,208,200],[240,236,230]],Bk=[[16,14,14],[34,30,30],[54,50,50]];
  for(let y=-7;y<=6;y++)for(let x=-14;x<=12;x++){const dd=x*x/196+y*y/49;if(dd>1)continue;const spot=hsh((x+20)>>2,(y+10)>>2,CFG.v||1)>.62;const l=-x/14*.4-y/7*.7;P(A,cx+x,base-13+y,spot?Bk[l>.2?2:1]:Wt[l>.4?3:l>-.2?2:1]);}
  for(const lx of [-10,-5,5,9])for(let y=0;y<8;y++){P(A,cx+lx,base-7+y,y>5?Bk[0]:Wt[1]);P(A,cx+lx+1,base-7+y,y>5?Bk[0]:Wt[2]);}
  for(let y=-4;y<=4;y++)for(let x=-4;x<=4;x++){if(x*x/16+y*y/16>1)continue;P(A,cx-16+x,base-15+y,Wt[x<0?3:2]);}rect(A,cx-21,base-14,5,4,[220,160,150]);P(A,cx-20,base-13,Bk[0]);P(A,cx-18,base-13,Bk[0]);
  P(A,cx-17,base-17,Bk[0]);P(A,cx-13,base-18,Wt[1]);P(A,cx-12,base-19,Wt[2]);P(A,cx-19,base-18,Wt[2]);P(A,cx-20,base-19,Wt[1]);for(let y=0;y<6;y++)P(A,cx+13,base-15+y,Wt[1]);P(A,cx+13,base-9,Bk[0]);
  rect(A,cx-1,base-6,4,2,[230,170,170]);groundShadow(cx+1,base,14,2,90);}
if(K==='ladder'){for(let y=2;y<H-4;y++){P(A,4,y,WD[4]);P(A,5,y,WD[2]);P(A,W-6,y,WD[3]);P(A,W-5,y,WD[1]);}for(let y=6;y<H-4;y+=6){hl(A,5,y,W-10,WD[4]);hl(A,5,y+1,W-10,WD[1]);}
  ell(A,W/2|0,H-4,W/2-2|0,3,PAL.ink[0]);}
const ART=[SHD,A,B];const flat=flatten([A,B],W,H);const O=outline(flat);const O2=outline(flatten([O,flat],W,H),'outline2');for(let i=0;i<O2.d.length;i+=4)if(O2.d[i+3]){O2.d[i]*=.6;O2.d[i+1]*=.6;O2.d[i+2]*=.6;O2.d[i+3]=(CFG.thin||/^fence|^picket|^icon/.test(K))?0:150;}
emit([SHD,O2,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
