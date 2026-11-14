// ---- faceted stone: an irregular outline, a lit top plane, a mid left face, a shadowed right face, a dark rim where it meets the ground
function facetRock(cx,base,rx,ry,seed,R,vein){const pts=[];const n=9;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,r=.82+hsh(i,seed,2)*.3;pts.push([Math.cos(a)*rx*r,Math.sin(a)*ry*r*(Math.sin(a)>0?.9:1.15)]);}
  const inside=(x,y,Q)=>{let c=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const [xi,yi]=Q[i],[xj,yj]=Q[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c;}return c;};
  const top=pts.map(([x,y])=>[x*.62-rx*.08,y*.5-ry*.42]);const cy=base-ry-1;
  for(let y=-Math.ceil(ry*1.3);y<=ry*1.1;y++)for(let x=-rx-1;x<=rx+1;x++){if(!inside(x,y,pts))continue;let k;
    if(inside(x,y,top))k=(x+y*.6)<-rx*.2?5:4;else if(x<-rx*.15+y*.3)k=y>ry*.45?2:3;else k=y>ry*.35?1:2;
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
if(K==='deer'){ // a deer lying dead on its side across the lane: stiff legs, white belly, the head thrown back, dark blood under it
  const cx=W/2|0,base=H-4,BR=[[40,26,18],[74,46,28],[110,70,40],[146,98,58],[176,130,84]];
  ell(SHD,cx+2,base-1,26,4,PAL.out[0]);for(let y=-3;y<=3;y++)for(let x=-24;x<=20;x++)if(x*x/576+y*y/9<1)P(A,cx+x,base-2+y,[52,8,10]);
  for(let y=-8;y<=6;y++)for(let x=-17;x<=15;x++){const d=x*x/(17*17)+y*y/(8*8);if(d>1)continue;let k=y<-4?4:y<0?3:y<3?2:1;if(y>3&&x>-12&&x<10)k=0;P(A,cx+x,base-9+y,BR[k]);if(y>1&&y<4&&x>-10&&x<8)P(A,cx+x,base-9+y,[220,210,190]);}
  for(const [lx,ly,ex,ey] of [[-10,-3,-16,4],[-6,-3,-9,5],[8,-3,14,4],[11,-3,19,3]]){for(let t=0;t<=1;t+=.1){const x=Math.round(cx+lx+(ex-lx)*t),y=Math.round(base-6+ly+(ey-ly)*t);P(A,x,y,BR[2]);P(A,x+1,y,BR[1]);}P(A,cx+ex,base-6+ey,BR[0]);P(A,cx+ex+1,base-6+ey,BR[0]);}
  for(let y=-4;y<=4;y++)for(let x=-6;x<=5;x++){if(x*x/36+y*y/16>1)continue;P(A,cx-21+x,base-12+y,BR[y<0?3:2]);}P(A,cx-26,base-12,BR[0]);P(A,cx-25,base-11,[20,12,10]);
  for(let i=0;i<4;i++){P(A,cx-19+i,base-18+i,BR[3]);P(A,cx-17+i,base-19+i,BR[2]);}P(A,cx-23,base-13,[16,10,10]);P(A,cx+16,base-12,[236,232,224]);P(A,cx+17,base-11,[220,214,204]);}
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
