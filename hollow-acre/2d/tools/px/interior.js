// ---- interiors: room shells (floor + back wall + side walls + cut-away front wall) and furniture, 3/4 view, light from the upper left
SEED=CFG.seed||7;
const W=CFG.w,H=CFG.h,N=!!CFG.night;
const A=layer('art',W,H),B=layer('details',W,H),SHD=layer('shadow',W,H);
const WD=PAL.wood,ST=PAL.stone,TR=PAL.white,RD=PAL.red,K=CFG.kind;const RK=['#2a2220','#3a302c','#4a3e38','#5e5048'].map(HEX);
function gs(cx,cy,rx,ry,a){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)P(SHD,cx+x,cy+y,PAL.out[0],a||70);}
function planks(L,x0,y0,w,h,R,pw){pw=pw||8;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const row=Math.floor((y-y0)/pw),off=(row*37)%61,seg=Math.floor((x-x0+off)/44);
  let k=2+((hsh(seg,row,3)>.6)?1:0)-((hsh(seg,row,4)>.85)?1:0);if((y-y0)%pw===0)k=0;else if((y-y0)%pw===1)k=Math.min(4,k+1);if((x-x0+off)%44===0)k=0;if(hsh(x,y,9)>.985)k=1;P(L,x,y,R[Math.max(0,Math.min(R.length-1,k))]);}}
function tilesF(L,x0,y0,w,h,R,s){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=Math.floor((x-x0)/s),j=Math.floor((y-y0)/s),u=(x-x0)%s,v=(y-y0)%s;let k=(i+j)%2?2:3;if(hsh(i,j,5)>.8)k--;if(u===0||v===0)k=0;else if(u===1||v===1)k=Math.min(R.length-1,k+1);P(L,x,y,R[k]);}}
function concrete(L,x0,y0,w,h){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const n=hsh(x>>2,y>>2,6)*.6+hsh(x,y,7)*.4;let c=ST[n>.7?3:n<.25?1:2];if(((x-x0)%96===0)||((y-y0)%64===0))c=ST[1];P(L,x,y,c);}
  for(let i=0;i<5;i++){const cx=x0+hsh(i,1,3)*w|0,cy=y0+hsh(i,2,3)*h|0,r=6+hsh(i,3,3)*10|0;for(let y=-r;y<=r;y++)for(let x=-r*1.5;x<=r*1.5;x++){if(x*x/(2.25*r*r)+y*y/(r*r)>1-hsh(cx+x,cy+y,4)*.3)continue;P(L,cx+x,cy+y,PAL.ink[1],150);}}}
function wallpaper(L,x0,y0,w,h,R,stripe){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){let k=2;const u=(x-x0)%stripe;if(u<2)k=3;if(u===stripe>>1)k=1;if((y-y0)%14===7&&u===stripe>>2)k=3;if(hsh(x>>3,y>>3,8)>.92)k=1;P(L,x,y,R[k]);}}
function brick(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const r=Math.floor((y-y0)/6),o=r%2?6:0,b=(x-x0+o)%12;let c=R[(hsh(Math.floor((x-x0+o)/12),r,5)>.6)?3:2];if(b===0||(y-y0)%6===5)c=R[0];else if((y-y0)%6===0)c=R[4];P(L,x,y,c);}}
function plaster(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const n=hsh(x>>3,(y+(x>>4))>>3,5)*.7+hsh(x,y,6)*.3;P(L,x,y,R[n>.8?4:n<.12?2:3]);}
  for(let i=0;i<4;i++){const cx=x0+hsh(i,4,2)*w|0,cy=y0+8+hsh(i,5,2)*(h-16)|0;for(let k=0;k<14;k++)P(L,cx+k-(k>>2),cy+(k>>1)+(k%3===0?1:0),R[1]);}}
function windowW(L,x,y,w,h,arched){rect(L,x-3,y-3,w+6,h+7,TR[3]);frame(L,x-3,y-3,w+6,h+7,TR[5],TR[1]);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(arched&&j<w/2){const dx=i-w/2+.5,dy=w/2-j;if(dx*dx+dy*dy>(w/2)*(w/2))continue;}
    let c=N?(j<h*.5?PAL.ink[0]:PAL.ink[1]):(j<h*.45?PAL.glass[4]:PAL.glass[3]);if(!N&&(i-j)%11===0)c=PAL.glass[5];P(L,x+i,y+j,c);}
  vl(L,x+(w>>1),y,h,TR[2]);hl(L,x,y+(h>>1),w,TR[2]);hl(L,x-4,y+h+3,w+8,TR[4]);hl(L,x-4,y+h+4,w+8,TR[1]);
  if(!N)for(let j=0;j<h;j++)P(SHD,x+w+3,y+j,PAL.out[0],40);}
// ---------------- room shells: CFG.room has the floor size in metres
if(K==='room'){const R=CFG.room,fw=R.w*32,fd=R.d*32,side=12,wallH=92,top=wallH+8,x0=side,front=top+fd;
  // back wall
  if(R.theme==='cabin'){wallpaper(A,x0,8,fw,wallH,PAL.sage,16);rect(A,x0,8+wallH-30,fw,30,WD[2]);planks(A,x0,8+wallH-28,fw,26,[WD[1],WD[1],WD[2],WD[3],WD[3]],13);hl(A,x0,8+wallH-30,fw,WD[4]);hl(A,x0,8+wallH-31,fw,WD[5]);}
  if(R.theme==='store'){brick(A,x0,8,fw,wallH,PAL.red);rect(A,x0,8+wallH-22,fw,22,WD[2]);for(let x=x0;x<x0+fw;x+=7)vl(A,x,8+wallH-22,22,WD[1]);hl(A,x0,8+wallH-22,fw,WD[4]);}
  if(R.theme==='church'){plaster(A,x0,8,fw,wallH,TR);rect(A,x0,8+wallH-26,fw,26,WD[1]);for(let x=x0;x<x0+fw;x+=24)frame(A,x+2,8+wallH-23,20,20,WD[3],WD[0]);hl(A,x0,8+wallH-26,fw,WD[3]);}
  if(R.theme==='garage'){for(let y=8;y<8+wallH;y++)for(let x=x0;x<x0+fw;x++){const r=Math.floor((y-8)/10),o=r%2?9:0,b=(x-x0+o)%18;let c=ST[(hsh(Math.floor((x-x0+o)/18),r,5)>.5)?3:2];if(b===0||(y-8)%10===9)c=ST[1];else if((y-8)%10===0)c=ST[4];P(A,x,y,c);}}
  if(R.theme==='mine'){for(let y=8;y<8+wallH;y++)for(let x=x0;x<x0+fw;x++){const n=hsh(x>>3,(y+(x>>4))>>3,5)*.7+hsh(x,y,6)*.3;P(A,x,y,ST[n>.75?3:n<.25?0:1]);}
    for(let x=x0;x<x0+fw;x+=40)for(let y=8;y<8+wallH;y++){P(A,x,y,WD[2]);P(A,x+1,y,WD[1]);}for(let x=x0;x<x0+fw;x++){P(A,x,14,WD[2]);P(A,x,15,WD[0]);}}
  if(R.theme==='glass'){for(let y=8;y<8+wallH;y++)for(let x=x0;x<x0+fw;x++){const i=(x-x0)%24,j=(y-8)%20;let c=N?PAL.ink[1]:PAL.glass[(y-8)<wallH*.5?4:3];if(!N&&(x+y)%23===0)c=PAL.glass[5];if(i===0||j===0)c=TR[3];P(A,x,y,c);}}
  // ceiling beam line, crown moulding
  rect(A,x0,0,fw,8,WD[1]);hl(A,x0,7,fw,WD[3]);for(let x=x0;x<x0+fw;x+=48)rect(A,x,0,10,8,WD[2]);
  for(const w of R.windows||[]){windowW(B,x0+w[0]*32-(w[2]||28)/2|0,14+(w[3]||8),w[2]||28,w[4]||34,R.theme==='church');}
  // floor
  if(R.theme==='cabin'||R.theme==='store')planks(A,x0,top,fw,fd,WD,8);
  if(R.theme==='church')tilesF(A,x0,top,fw,fd,ST,16);
  if(R.theme==='garage')concrete(A,x0,top,fw,fd);
  if(R.theme==='mine'){for(let y=top;y<top+fd;y++)for(let x=x0;x<x0+fw;x++){const n=hsh(x>>4,(y+(x>>3))>>4,8)*.8+hsh(x,y,9)*.2;P(A,x,y,n>.78?RK[3]:n>.45?RK[2]:RK[1]);}
    for(let i=0;i<40;i++){const px=x0+(hsh(i,1,4)*fw|0),py=top+(hsh(i,2,4)*fd|0);P(A,px,py,ST[3]);P(A,px+1,py,ST[2]);}}
  if(R.theme==='glass'){tilesF(A,x0,top,fw,fd,ST,16);const s0x=x0+32,s0y=top+38,sw=7*32,sh=4*32;for(let y=s0y-3;y<s0y+sh+3;y++)for(let x=s0x-3;x<s0x+sw+3;x++){const edge=x<s0x||y<s0y||x>=s0x+sw||y>=s0y+sh;
    const n=hsh(x>>2,y>>2,6)*.6+hsh(x,y,7)*.4;P(A,x,y,edge?WD[y<s0y?4:1]:(n>.75?[150,104,64]:n<.25?[92,60,36]:[120,82,50]));}}
  // skirting where floor meets the back wall + ambient occlusion
  rect(A,x0,top-8,fw,8,WD[1]);hl(A,x0,top-8,fw,WD[3]);for(let y=0;y<10;y++)for(let x=x0;x<x0+fw;x++){const c=G(A,x,top+y);if(c)P(A,x,top+y,shade(c,.62+y*.038));}
  for(let y=top;y<front;y++)for(let x=0;x<14;x++){for(const xx of [x0+x,x0+fw-1-x]){const c=G(A,xx,y);if(c)P(A,xx,y,shade(c,.66+x*.024));}}
  // side walls: dark tops of the left and right walls
  for(const sx of [0,x0+fw]){rect(A,sx,0,side,front+10,PAL.ink[1]);vl(A,sx+(sx?0:side-1),0,front+10,WD[2]);vl(A,sx+(sx?1:side-2),0,front+10,WD[0]);}
  // cut-away front wall: a beam with a gap for the door
  const dg0=x0+R.door*32-22,dg1=x0+R.door*32+22;for(let x=0;x<W;x++){if(x>=dg0&&x<dg1)continue;rect(A,x,front,1,10,x%32===0?WD[0]:WD[2]);P(A,x,front,WD[4]);P(A,x,front+9,PAL.ink[0]);}
  for(let y=front-4;y<front+10;y++)for(const x of [dg0-1,dg1]){P(A,x,y,WD[1]);}
  for(let x=dg0;x<dg1;x++){P(A,x,front+2,WD[3]);P(A,x,front+3,WD[1]);}   // threshold
  console.log('META '+JSON.stringify({w:W,h:H,top,side,front}));}
// ---------------- furniture
const cx=W>>1,base=H-3;
function topBox(x,y,w,tH,fH,R,face){plk(x,y,w,tH,R,1);const fy=y+tH;rect(A,x,fy,w,fH,face||R[2]);hl(A,x,fy,w,R[0]);vl(A,x,fy,fH,R[3]);vl(A,x+w-1,fy,fH,R[0]);hl(A,x,fy+fH-1,w,R[0]);}
function plk(x,y,w,h,R,dir){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let c=R[4];if(dir?(i%7===0):(j%5===0))c=R[3];if(j===0)c=R[5]||R[4];P(A,x+i,y+j,c);}}
if(K==='bed'){ // quilted bed, headboard against the wall, pillow, a dark stain grandpa never washed out
  const x0=4,w=W-8;post(A,x0,6,5,40);post(A,x0+w-5,6,5,40);rect(A,x0,8,w,18,WD[2]);frame(A,x0,8,w,18,WD[4],WD[0]);for(let i=x0+8;i<x0+w-8;i+=8)vl(A,i,10,14,WD[1]);
  const q=[PAL.red,PAL.cream,PAL.sage];const qy=26,qh=H-qy-12;for(let j=0;j<qh;j++)for(let i=0;i<w-4;i++){const R=q[(Math.floor(i/9)+Math.floor(j/9))%3];let c=R[2];if(i%9===0||j%9===0)c=R[1];if(j<3)c=R[3];P(A,x0+2+i,qy+j,c);}
  rect(A,x0+6,20,w-12,10,PAL.cream[3]);frame(A,x0+6,20,w-12,10,PAL.cream[3],PAL.cream[1]);hl(A,x0+7,28,w-14,PAL.cream[2]);
  rect(A,x0+2,qy+qh,w-4,8,PAL.red[1]);hl(A,x0+2,qy+qh,w-4,PAL.red[3]);for(let i=0;i<w-4;i+=4)P(A,x0+2+i,qy+qh+7,PAL.red[0]);
  post(A,x0,qy+qh-6,5,16);post(A,x0+w-5,qy+qh-6,5,16);ell(B,x0+w*.62|0,qy+qh*.55|0,6,3,PAL.rust[1]);gs(cx+3,base,W/2-2|0,3,80);}
function post(L,x,y,w,h){rect(A,x,y,w,h,WD[2]);vl(A,x,y,h,WD[4]);vl(A,x+w-1,y,h,WD[0]);hl(A,x,y,w,WD[5]);}
if(K==='table'){topBox(3,10,W-6,12,5,WD);for(const x of [5,W-9])post(A,x,27,4,H-30);
  // supper still laid out: a plate, a cup, a lamp
  ell(B,cx-8,15,5,3,PAL.cream[3]);ell(B,cx-8,15,3,2,PAL.cream[2]);rect(B,cx+3,10,4,5,PAL.slate[3]);hl(B,cx+3,10,4,PAL.slate[5]);
  rect(B,cx+10,6,5,8,N?PAL.lit[4]:PAL.glass[4]);rect(B,cx+9,14,7,2,PAL.brass[2]);hl(B,cx+10,5,5,PAL.brass[3]);gs(cx+3,base,W/2-2|0,3,70);}
if(K==='chair'){rect(A,4,2,W-8,16,WD[2]);frame(A,4,2,W-8,16,WD[4],WD[0]);for(let x=7;x<W-7;x+=4)vl(A,x,4,12,WD[1]);topBox(3,18,W-6,6,3,WD);for(const x of [4,W-7])post(A,x,27,3,H-30);gs(cx+2,base,W/2-2|0,2,70);}
if(K==='stove'){const ir=PAL.slate;topBox(3,14,W-6,9,H-30,ir,ir[1]);for(const x of [10,W-16]){ell(A,x+3,18,4,2,ir[0]);ell(A,x+3,18,2,1,ir[2]);}
  rect(A,cx-1,0,4,14,ir[2]);vl(A,cx-1,0,14,ir[4]);rect(A,cx-8,30,16,12,ir[0]);frame(A,cx-8,30,16,12,ir[3],ir[0]);
  for(let i=0;i<14;i+=3)rect(A,cx-7+i,33,2,6,N?PAL.lit[3]:PAL.rust[2]);rect(A,cx-4,46,8,2,PAL.brass[2]);for(const x of [5,W-9])post(A,x,H-10,4,8);gs(cx+3,base,W/2-2|0,3,80);}
if(K==='shelf'){ // tall bookcase / pantry shelf against the wall
  rect(A,2,2,W-4,H-6,WD[1]);frame(A,2,2,W-4,H-6,WD[4],WD[0]);const goods=CFG.goods||'books';
  for(let sy=8;sy<H-8;sy+=CFG.step||18){hl(A,3,sy+12,W-6,WD[4]);hl(A,3,sy+13,W-6,WD[2]);let x=5;while(x<W-6){
    if(goods==='books'){const bw=2+(hsh(x,sy,1)*3|0),bh=7+(hsh(x,sy,2)*5|0),R=[PAL.red,PAL.teal,PAL.mustard,PAL.blue,PAL.sage][hsh(x,sy,3)*5|0];rect(A,x,sy+12-bh,bw,bh,R[2]);vl(A,x,sy+12-bh,bh,R[3]);P(A,x,sy+14-bh,R[4]);x+=bw+(hsh(x,sy,4)>.85?3:0);}
    else if(goods==='jars'){const R=[PAL.rust,PAL.sage,PAL.mustard,PAL.red][hsh(x,sy,3)*4|0];rect(A,x,sy+4,5,8,PAL.glass[3]);rect(A,x+1,sy+6,3,6,R[3]);hl(A,x,sy+3,5,PAL.brass[2]);P(A,x+1,sy+5,PAL.glass[5]);x+=7;}
    else if(goods==='cans'){const R=[PAL.red,PAL.blue,PAL.mustard][hsh(x,sy,3)*3|0];rect(A,x,sy+5,4,7,R[2]);hl(A,x,sy+7,4,PAL.cream[3]);vl(A,x,sy+5,7,R[3]);hl(A,x,sy+5,4,TR[4]);x+=5;}
    else if(goods==='tools'){const t=hsh(x,sy,3);if(t<.4){rect(A,x,sy+2,6,10,PAL.slate[2]);hl(A,x,sy+2,6,PAL.slate[4]);}else if(t<.7){ell(A,x+3,sy+9,3,3,PAL.rust[3]);}else{rect(A,x,sy+7,8,5,PAL.red[2]);hl(A,x,sy+7,8,PAL.red[4]);}x+=9;}}}
  gs(cx+3,base,W/2-2|0,2,70);}
if(K==='rug'){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x-W/2)/(W/2),dy=(y-H/2)/(H/2);const d=dx*dx+dy*dy;if(d>1)continue;let c=PAL.red[2];if(d>.8)c=PAL.mustard[2];else if(d>.7)c=PAL.red[1];else if(d<.18)c=PAL.mustard[3];else if((Math.round(Math.atan2(dy,dx)*4))%2===0&&d>.35&&d<.55)c=PAL.cream[2];P(A,x,y,c);}}
if(K==='counter'){ // shop counter with a till, a bell and a jar of candy
  topBox(2,10,W-4,10,H-24,WD,WD[2]);for(let x=6;x<W-6;x+=16)frame(A,x,24,12,H-32,WD[3],WD[0]);
  rect(B,W-30,1,16,10,PAL.slate[2]);frame(B,W-30,1,16,10,PAL.slate[4],PAL.slate[0]);rect(B,W-27,3,10,3,PAL.cream[3]);for(let i=0;i<4;i++)P(B,W-28+i*3,8,PAL.brass[3]);
  ell(B,20,10,3,2,PAL.brass[3]);P(B,20,7,PAL.brass[3]);rect(B,36,3,7,8,PAL.glass[3]);for(let i=0;i<5;i++)P(B,37+i,6+(i%2),[PAL.red[4],PAL.mustard[5],PAL.sage[4]][i%3]);
  gs(cx+3,base,W/2-2|0,3,80);}
if(K==='crates'){topBox(2,8,W/2-2,7,H-18,WD);topBox(W/2+1,14,W/2-3,7,H-24,WD);for(const [x,w,y] of [[2,W/2-2,15],[W/2+1,W/2-3,21]]){for(let i=0;i<w-4;i++)P(A,x+2+i,y+3+Math.round(i*(H-y-12)/(w-4)),WD[4]);}
  for(let i=0;i<4;i++)ell(B,8+i*6,7,3,2,PAL.rust[4]);gs(cx+3,base,W/2-2|0,3,80);}
if(K==='pew'){const x0=2,w=W-4;rect(A,x0,2,w,16,WD[2]);frame(A,x0,2,w,16,WD[4],WD[0]);hl(A,x0,2,w,WD[5]);topBox(x0,18,w,7,4,WD);
  for(const x of [x0,x0+w-6])post(A,x,2,6,H-6);for(let x=x0+8;x<x0+w-8;x+=26){rect(B,x,12,8,3,PAL.red[2]);}gs(cx+3,base,W/2-2|0,2,70);}
if(K==='altar'){topBox(4,22,W-8,10,H-36,TR,TR[3]);for(let x=8;x<W-8;x+=12)vl(A,x,34,H-40,TR[2]);rect(B,cx-14,24,28,6,PAL.red[2]);hl(B,cx-14,24,28,PAL.red[4]);
  for(const x of [10,W-14]){rect(B,x,8,4,14,PAL.cream[3]);P(B,x+1,5,N?PAL.lit[5]:PAL.lit[3]);P(B,x+2,6,PAL.lit[4]);rect(B,x-1,21,6,2,PAL.brass[2]);}
  // the ledger, open
  rect(B,cx-9,18,18,6,PAL.cream[3]);vl(B,cx,18,6,PAL.cream[1]);for(let i=0;i<3;i++){hl(B,cx-7,19+i*2,6,PAL.ink[1]);hl(B,cx+2,19+i*2,6,PAL.ink[1]);}gs(cx+3,base,W/2-2|0,3,80);}
if(K==='bench'){ // Hollis's workbench: vice, pegboard back, scattered parts
  rect(A,2,0,W-4,24,WD[1]);frame(A,2,0,W-4,24,WD[3],WD[0]);for(let y=4;y<22;y+=5)for(let x=6;x<W-6;x+=5)P(A,x,y,WD[0]);
  for(const [x,t] of [[10,0],[22,1],[34,2],[48,0],[60,1]]){if(t===0){vl(B,x,3,14,PAL.slate[4]);rect(B,x-2,3,5,4,PAL.slate[2]);}else if(t===1){vl(B,x,5,12,WD[4]);rect(B,x-3,3,7,3,PAL.slate[3]);}else{ell(B,x,9,5,5,PAL.slate[3]);ell(B,x,9,3,3,PAL.ink[1]);}}
  topBox(2,24,W-4,10,H-38,WD,WD[2]);rect(B,W-20,18,10,8,PAL.slate[2]);hl(B,W-20,18,10,PAL.slate[4]);rect(B,10,27,6,3,PAL.slate[3]);ell(B,30,29,3,2,PAL.rust[2]);rect(B,44,26,9,4,PAL.red[3]);
  for(const x of [5,W-9])post(A,x,H-12,4,10);gs(cx+3,base,W/2-2|0,3,80);}
if(K==='cellar'){ // a cellar door set into the floor, chained, with scratch marks from the inside
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(x%8);let c=k===0?WD[0]:k===1?WD[3]:WD[2];if(y<2||y>H-3||x<2||x>W-3)c=WD[1];P(A,x,y,c);}
  for(let i=0;i<W;i++){const y=(H/2|0)+Math.round(Math.sin(i*.5));P(B,i,y,PAL.slate[i%3?3:1]);}rect(B,cx-4,(H/2|0)-3,8,7,PAL.slate[2]);frame(B,cx-4,(H/2|0)-3,8,7,PAL.slate[4],PAL.slate[0]);
  for(let i=0;i<5;i++){const x=6+i*5;for(let j=0;j<7;j++)P(B,x+(j>>1),4+j,PAL.ink[0]);}}
if(K==='mirror'){rect(A,2,2,W-4,H-4,WD[3]);frame(A,2,2,W-4,H-4,WD[5],WD[0]);for(let y=5;y<H-5;y++)for(let x=5;x<W-5;x++){let c=N?PAL.ink[1]:PAL.glass[(y<H/2?3:2)];if(!N&&(x-y)%9===0)c=PAL.glass[4];P(A,x,y,c);}}
if(K==='clock'){rect(A,cx-6,0,12,H-2,WD[1]);frame(A,cx-6,0,12,H-2,WD[3],WD[0]);ell(A,cx,9,5,5,PAL.cream[3]);P(A,cx,6,PAL.ink[0]);P(A,cx,7,PAL.ink[0]);P(A,cx+1,9,PAL.ink[0]);P(A,cx+2,9,PAL.ink[0]);
  rect(A,cx-3,20,6,H-26,PAL.ink[0]);vl(A,cx,20,H-30,PAL.brass[2]);ell(A,cx,H-10,2,2,PAL.brass[3]);gs(cx+2,base,7,2,70);}
if(K==='car'){ // a car up on blocks in Hollis's bay: the sheriff's old cruiser, hood open
  const x0=6,w=W-12;for(const x of [x0+10,x0+w-18])rect(A,x,base-14,10,12,ST[2]);
  rect(A,x0,20,w,26,PAL.slate[3]);frame(A,x0,20,w,26,PAL.slate[5],PAL.slate[0]);rect(A,x0+w*.3|0,8,w*.42|0,14,PAL.slate[2]);rect(A,x0+w*.33|0,10,w*.36|0,9,N?PAL.ink[0]:PAL.glass[3]);
  rect(A,x0+4,28,w-8,4,TR[4]);drawText(A,'SHERIFF',x0+w/2-14|0,36,TR[5]);rect(A,x0+w-14,2,14,20,PAL.slate[4]);frame(A,x0+w-14,2,14,20,PAL.slate[5],PAL.slate[1]);
  for(const x of [x0+14,x0+w-14]){ell(A,x,48,7,5,PAL.ink[1]);ell(A,x,48,3,2,PAL.slate[3]);}rect(B,x0+w/2-6|0,14,4,6,PAL.red[3]);rect(B,x0+w/2|0,14,4,6,PAL.blue[3]);gs(cx+3,base,W/2-2|0,3,90);}
if(K==='candles'){for(let i=0;i<7;i++){const x=4+i*5,h=6+(hsh(i,1)*8|0);rect(A,x,base-h,3,h,PAL.cream[3]);vl(A,x,base-h,h,PAL.cream[2]);P(A,x+1,base-h-1,N?PAL.lit[5]:PAL.lit[4]);P(A,x+1,base-h-2,PAL.lit[3]);}gs(cx,base,W/2-2|0,2,50);}
if(K==='desk'){topBox(3,12,W-6,10,H-28,WD,WD[2]);frame(A,8,26,W/2-10,H-34,WD[3],WD[0]);P(A,W/4|0,30,PAL.brass[3]);
  rect(B,10,8,14,7,PAL.cream[3]);hl(B,12,10,9,PAL.ink[1]);hl(B,12,12,7,PAL.ink[1]);rect(B,W-20,4,8,10,PAL.slate[2]);ell(B,W-16,3,4,2,N?PAL.lit[4]:PAL.cream[3]);
  for(const x of [5,W-9])post(A,x,H-8,4,6);gs(cx+3,base,W/2-2|0,3,70);}
if(K==='keg'){const x0=4,w=W-8;for(let y=6;y<base;y++){const t=(y-6)/(base-6),half=w/2+Math.round(Math.sin(t*Math.PI)*1.5);for(let x=-half;x<half;x++){const u=(x+half)/(2*half);P(A,cx+x,y,PAL.red[u<.2?4:u<.6?3:u<.85?2:1]);}}
  for(const y of [10,base-6])for(let x=-w/2;x<w/2;x++)P(A,cx+x,y,PAL.slate[3]);ell(A,cx,6,w/2,3,PAL.red[4]);ell(A,cx,6,3,1,PAL.ink[1]);gs(cx+2,base,w/2+1|0,2,70);}
const flat=flatten([A,B],W,H);const O=K==='room'||K==='rug'?layer('o',W,H):outline(flat);
emit([SHD,O,A,B],CFG.out);if(K!=='room')console.log('META '+JSON.stringify({w:W,h:H}));
