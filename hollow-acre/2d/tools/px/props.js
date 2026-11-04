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
if(K==='fence_v'){            // one 1 m bay running away from you: post in front, rails receding up to the next post
  rect(A,4,4,5,44,WD[2]);vl(A,4,4,44,WD[4]);vl(A,8,4,44,WD[0]);for(let y=10;y<44;y+=9)hl(A,5,y,3,WD[1]);
  post(A,3,44,8,22,WD);groundShadow(7,65,6,2,60);}
if(K==='picket_h'){           // white picket fence, 2 m: rails behind, pointed pickets
  for(const ry of [7,16])rail(A,0,ry,W,TR);
  for(let x=1;x<W-2;x+=6){rect(A,x,3,4,20,TR[3]);vl(A,x,3,20,TR[5]);vl(A,x+3,3,20,TR[1]);P(A,x+1,1,TR[4]);P(A,x+2,1,TR[3]);hl(A,x,2,4,TR[4]);if(hsh(x,1)>.7)P(A,x+2,10,PAL.moss[1]);}
  for(let x=0;x<W;x++)P(SHD,x,23,PAL.out[0],60);}
if(K==='picket_v'){            // a picket run seen end-on: a narrow wall of overlapping pickets with their tips stepping away
  for(let y=4;y<64;y++){const k=(y-4)%5;for(let x=4;x<10;x++){let c=TR[3];if(x===4)c=TR[5];if(x===9)c=TR[1];if(k===0)c=TR[x<7?5:4];if(k===4)c=TR[2];P(A,x,y,c);}}
  for(let y=4;y<64;y+=5){P(A,5,y-1,TR[4]);P(A,6,y-2,TR[5]);P(A,7,y-1,TR[3]);}
  rect(A,3,44,8,22,TR[3]);vl(A,3,44,22,TR[5]);vl(A,10,44,22,TR[1]);hl(A,3,44,8,TR[5]);groundShadow(7,65,5,2,60);}
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
if(K==='barrel'){const cx=W/2|0,top=2,base=H-3;for(let y=top;y<base;y++){const t=(y-top)/(base-top),bulge=Math.round(Math.sin(t*Math.PI)*2);const half=9+bulge;
    for(let x=-half;x<half;x++){const st=((x+half)/4|0);let c=x<-half+3?WD[4]:x>half-4?WD[1]:WD[st%2?2:3];if((x+half)%4===0)c=WD[1];P(A,cx+x,y,c);}}
  for(const hy of [5,base-6,((top+base)/2|0)])for(let x=-11;x<11;x++){const half=9+Math.round(Math.sin(((hy-top)/(base-top))*Math.PI)*2);if(x<-half||x>=half)continue;P(A,cx+x,hy,PAL.slate[x<0?4:2]);P(A,cx+x,hy+1,PAL.slate[1]);}
  ell(A,cx,top+1,8,2,WD[2]);ell(A,cx,top+1,6,1,WD[1]);groundShadow(cx+1,base,10,2,70);}
if(K==='crate'){const x0=2,top=2,s=W-5;rect(A,x0,top,s,s,WD[3]);for(let i=0;i<s;i+=5)hl(A,x0,top+i,s,WD[2]);
  frame(A,x0,top,s,s,WD[5],WD[0]);rect(A,x0+1,top+1,s-2,3,WD[4]);rect(A,x0+1,top+s-4,s-2,3,WD[2]);
  for(let i=0;i<s;i++){P(A,x0+i,top+i,WD[4]);P(A,x0+i,top+i+1,WD[1]);}for(const [x,y] of [[2,2],[s-3,2],[2,s-3],[s-3,s-3]])P(A,x0+x,top+y,PAL.slate[4]);
  groundShadow(x0+s/2|0,top+s,s/2+1|0,2,70);}
if(K==='hay'){const x0=2,top=4,w=W-5,h=H-8;const hy=PAL.mustard;for(let y=0;y<h;y++)for(let x=0;x<w;x++){let c=hy[3];const n=hsh(x,y,3);if(n>.8)c=hy[4];else if(n<.2)c=hy[2];if(y<4)c=n>.5?hy[5]:hy[4];if(y>h-3)c=hy[1];if(x<2)c=hy[4];if(x>w-3)c=hy[1];P(A,x0+x,top+y,c);}
  for(const tx of [Math.round(w*.3),Math.round(w*.7)])vl(A,x0+tx,top,h,PAL.bark[2]);for(let i=0;i<8;i++)P(A,x0+(hsh(i,1)*w|0),top-1-(hsh(i,2)*2|0),hy[4]);
  groundShadow(x0+w/2|0,top+h,w/2+1|0,2,70);}
if(K==='sacks'){for(const [cx,cy,rx,ry] of [[10,16,9,9],[22,15,9,10]]){const sk=PAL.cream;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1){let c=x<-rx/3?sk[3]:x>rx/2?sk[1]:sk[2];if((x+y*2)%7===0)c=sk[1];P(A,cx+x,cy+y,c);}
    rect(A,cx-3,cy-ry-2,6,3,sk[1]);hl(A,cx-3,cy-ry+1,6,PAL.bark[1]);}
  groundShadow(16,H-3,14,2,70);}
if(K==='cart'){const base=H-3;for(let y=10;y<22;y++)hl(A,4,y,W-16,WD[(y-10)%4===0?4:(y-10)%4===3?1:3]);frame(A,4,10,W-16,12,WD[5],WD[0]);
  for(let x=4;x<W-12;x+=10)vl(A,x,10,12,WD[1]);
  // load of pumpkins
  for(const [px,py] of [[12,8],[22,7],[32,8]]){ell(A,px,py,5,4,PAL.rust[4]);ell(A,px-1,py-1,2,2,PAL.rust[5]);vl(A,px,py-5,2,PAL.moss[2]);}
  hl(A,W-12,15,10,WD[3]);hl(A,W-12,16,10,WD[1]);
  ell(A,18,base-6,7,7,WD[1]);ell(A,18,base-6,5,5,WD[3]);ell(A,18,base-6,2,2,PAL.slate[2]);for(let a=0;a<8;a++)P(A,18+Math.round(Math.cos(a*.785)*4),base-6+Math.round(Math.sin(a*.785)*4),WD[1]);
  vl(A,W-14,22,base-24,WD[2]);groundShadow(W/2|0,base,W/2-3|0,2,60);}
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
const ART=[SHD,A,B];const flat=flatten([A,B],W,H);const O=outline(flat);
emit([SHD,O,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
