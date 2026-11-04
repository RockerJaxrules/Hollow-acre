// ---- terrain + landmark art for the 3/4 top-down world (CFG.kind, CFG.w, CFG.h, CFG.f = frame)
SEED=CFG.seed||9;
const W=CFG.w,H=CFG.h,F=CFG.f||0,N=!!CFG.night;
const A=layer('art',W,H),B=layer('details',W,H),SHD=layer('shadow',W,H);
const GR=['#002e2d','#004337','#006b46','#2f8136','#499231','#64a42c','#8cc43c'].map(HEX);
const WA=['#0b3f5e','#105577','#156c99','#2f8bb8','#6fb6d8','#cde9f2'].map(HEX);
const RK=['#2a2220','#3f3330','#5a4a42','#76625a','#937e72','#b29c8e'].map(HEX);   // earthy cliff rock
const WD=PAL.wood,ST=PAL.stone,TR=PAL.white,RD=PAL.red;
const K=CFG.kind;
function shingles(L,x0,y0,w,h,RF,course){course=course||5;let ci=0;rect(L,x0,y0,w,h,RF[1]);
  for(let y=y0;y<y0+h;y+=course,ci++){const off=(ci*9)%17;let x=x0-off,ti=0;while(x<x0+w){const tw=14+(hsh(ti,ci,5)*7|0);
      for(let j=0;j<course&&y+j<y0+h;j++)for(let i=0;i<tw;i++){const px=x+i;if(px<x0||px>=x0+w)continue;let c=j===course-1?RF[0]:j===course-2?RF[1]:(j===0&&i>1&&i<tw*.45)?RF[3]:RF[2];
        if((i===0||i===tw-1)&&j===course-2)c=RF[0];if(i===tw-1&&j>0&&j<course-2)c=RF[1];P(L,px,y+j,c);}x+=tw;ti++;}}}
function boards(L,x0,y0,w,h,R,bw){bw=bw||6;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const k=(x-x0)%bw;let c=k===0?R[4]:k===bw-1?R[1]:R[3];if(hsh((x-x0)/bw|0,(y-y0)/23|0,4)>.86)c=shade(c,.86);P(L,x,y,c);}}
function gs(cx,cy,rx,ry,a){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)P(SHD,cx+x,cy+y,PAL.out[0],a||70);}

// ---- volumetric foliage: canopy = overlapping leaf clusters, each lit from the upper left
function leafRamp(name){return {
  orange:['#3a160a','#6e2a0e','#a8441a','#d06a22','#ec9a34','#f8c45a'],
  red:['#2c0c10','#5a1418','#8c2222','#b83a2a','#d8623a','#ee9052'],
  gold:['#3a2a08','#6a4e10','#9c7818','#c8a22a','#e4c84a','#f6e486'],
  green:['#0a2214','#143a1e','#235a26','#357a2e','#52983a','#7cb84c'],
  dead:['#1e1612','#33261e','#4c3a2c','#64503c','#7c6850','#988266']}[name].map(HEX);}
function canopy(L,cx,cy,rx,ry,R,seed){
  // a few big lumpy masses (lobes); lower lobes sit in front of upper ones
  const lobes=[[0,0,.62,.62]];const n=CFG.lobes||6;
  for(let i=0;i<n;i++){const a=-Math.PI*.95+i/(n-1)*Math.PI*.9*2*.5+Math.PI*.05+(hsh(i,seed)-.5)*.5;const ang=i<n/2?-Math.PI+(i/(n/2))*Math.PI:(-Math.PI+((i-n/2)/(n/2))*Math.PI);
    const rr=.42+hsh(i,seed,2)*.18;lobes.push([Math.cos(ang)*(1-rr)*.95,Math.sin(ang)*(1-rr)*.8+.08,rr,rr*.92]);}
  lobes.push([-.25,.35,.42,.38],[.28,.38,.4,.36]);
  lobes.sort((p,q)=>p[1]-q[1]);
  for(const [lx,ly,lr,lry] of lobes){const bx=cx+lx*rx,by=cy+ly*ry,R1=lr*rx,R2=lry*ry;
    for(let y=-R2-2;y<=R2+2;y++)for(let x=-R1-2;x<=R1+2;x++){const nx=x/R1,ny=y/R2,d=nx*nx+ny*ny;
      const ang=Math.atan2(ny,nx),sc=.1*(.5+.5*Math.sin(ang*9+seed))+.06*hsh(Math.round(ang*14),seed,4);   // scalloped leafy rim
      if(d>1-sc)continue;
      const nz=Math.sqrt(Math.max(0,1-d));let l=-.5*nx-.7*ny+.55*nz;                                       // rounded form lit from the upper left
      const g=(by+y-cy)/ry;let k=1.3+2.4*l-.7*g;
      const px=bx+x|0,py=by+y|0;const clump=hsh((px+(py>>2&1)*2)>>2,py>>2,seed);k+=clump>.78?.8:clump<.2?-.8:0;  // leaf clumps
      if(d>.82-sc&&ny>0)k-=1;                                                                             // dark underside at each lobe's lower edge
      k=Math.max(0,Math.min(5,Math.round(k)));P(L,px,py,R[k]);}}
  for(let i=0;i<rx*.9;i++){const x=cx+(hsh(i,seed,7)-.5)*rx*1.3,y=cy-ry*.62+(hsh(i,seed,8))*ry*.5;const c=G(L,x|0,y|0);if(c&&c[0]+c[1]>R[3][0]+R[3][1])P(L,x,y,R[5]);}}
function trunk(L,cx,top,base,w,BK){for(let y=top;y<base;y++){const flare=y>base-10?Math.round((y-(base-10))*.8):0;for(let x=-w-flare;x<=w+flare;x++){const t=(x+w+flare)/(2*(w+flare));let c=BK[t<.3?4:t<.6?3:t<.85?2:1];if((x*3+y)%7===0)c=BK[1];P(L,cx+x,y,c);}}
  for(let x=-w;x<=w;x++)for(let y=top;y<top+6;y++)P(L,cx+x,y,BK[0]);}
if(K==='maple'){const R=leafRamp(CFG.leaf),cx=W/2|0,base=H-6;
  gs(cx+10,base,W/2-14|0,8,80);
  trunk(A,cx,base-50,base,5,PAL.bark);for(const [dx,dy] of [[-10,-40],[9,-46]])for(let i=0;i<14;i++)rect(A,cx+Math.round(dx*i/14),base-34+Math.round(dy*i/14*.4)-i,3,3,PAL.bark[2]);
  canopy(A,cx,base-82,W/2-4|0,52,R,CFG.seed);
  if(CFG.leaf!=='green')for(let i=0;i<10;i++){const x=cx-30+hsh(i,4)*60|0,y=base-4+(hsh(i,5)*6|0);P(B,x,y,R[3]);P(B,x+1,y,R[4]);}}
if(K==='bush'){const R=leafRamp(CFG.leaf),cx=W/2|0,base=H-4;gs(cx+6,base,W/2-6|0,5,80);canopy(A,cx,base-16,W/2-3|0,16,R,CFG.seed);
  if(CFG.berries)for(let i=0;i<9;i++){const x=cx-14+hsh(i,2)*28|0,y=base-26+hsh(i,3)*18|0;if(G(A,x,y)){P(B,x,y,PAL.red[4]);P(B,x+1,y,PAL.red[3]);P(B,x,y-1,PAL.red[5]);}}}
if(K==='tallgrass'){const cx=W/2|0,base=H-2;const R=CFG.leaf==='gold'?leafRamp('gold'):GR;const sway=F===1?1:0;
  for(let i=0;i<26;i++){const x0=4+hsh(i,1)*(W-8)|0,h=10+hsh(i,2)*12|0,bend=(hsh(i,3)-.5)*4+sway*(h/10);
    for(let y=0;y<h;y++){const x=x0+Math.round(bend*(y/h)*(y/h));const c=y>h-3?R[5]:y>h*.6?R[4]:y>h*.3?R[3]:R[2];P(A,x,base-y,c);if(y<h*.5)P(A,x+1,base-y,R[1]);}}
  for(let x=2;x<W-2;x++)P(SHD,x,base+1,PAL.out[0],70);}
if(K==='cliff'){   // seamless 64px-wide cliff face: grass lip on top, layered rock, roots, darker base
  for(let x=0;x<W;x++){const lip=7+Math.round(Math.sin(x*Math.PI*2/32)*1.2+hsh(x%64,1)*2.2);
    for(let y=0;y<lip;y++)P(A,x,y,y===0?GR[5]:y===1?GR[4]:y>=lip-2?GR[2]:GR[3]);
    if(hsh(x%64,7)>.7)for(let y=lip;y<lip+2+(hsh(x%64,3)*4|0);y++)P(A,x,y,GR[2]);            // hanging grass tufts
    for(let y=lip;y<H;y++){const band=((y-lip+Math.round(Math.sin((x+7)*Math.PI*2/64)*2))/9|0),j=(y-lip)%9;let c=RK[2+(band%2)];
      if(j===0)c=RK[4];else if(j===8)c=RK[1];if(hsh(((x/6)|0)%11,band,3)>.82)c=shade(c,.85);
      const crack=(x%64)===(13+band*17)%64||(x%64)===(41+band*11)%64;if(crack&&j>1&&j<8)c=RK[0];
      const t=(y-lip)/(H-lip);c=shade(c,1.08-.4*t);if(y>H-4)c=RK[0];P(A,x,y,c);}
    if(hsh(x%64,9)>.86)for(let y=lip;y<lip+6+(hsh(x%64,10)*8|0);y++)P(B,x,y,PAL.bark[1]);       // roots
    if(hsh((x/5|0)%13,2)>.75){const my=lip+12+(hsh((x/5|0)%13,5)*20|0);for(let y=my;y<my+3;y++)P(B,x,y,PAL.moss[2]);}}
}
if(K==='falls'){   // waterfall over the cliff, 4 frames
  for(let y=0;y<H;y++)for(let x=2;x<W-2;x++){const edge=x<5||x>W-6;const s=((x*7+((y-F*6+600)>>2))%9);let c=s<2?WA[5]:s<5?WA[4]:WA[3];if(edge)c=WA[2];if(y<4)c=WA[4];P(A,x,y,c);}
  for(let i=0;i<14;i++){const fx=2+((hsh(i,F)*(W-4))|0),fy=H-8+((hsh(i,F,2)*7)|0);ell(B,fx,fy,2+(i%2),1+(i%2),WA[5]);}
}
if(K==='cbridge'){ // red New England covered bridge seen from the south: shingled roof, board-and-batten wall, stone abutments
  const roofH=CFG.roofH||58,wy=roofH-4,wh=60,ab=24;
  shingles(A,0,6,W,roofH-6,PAL.slate);rect(A,0,0,W,7,PAL.slate[3]);hl(A,0,0,W,PAL.slate[5]);hl(A,0,6,W,PAL.slate[1]);
  for(const bx of [0,W-4]){rect(A,bx,0,4,roofH,TR[2]);vl(A,bx,0,roofH,TR[bx?1:4]);}rect(A,0,roofH-4,W,4,TR[2]);hl(A,0,roofH-4,W,TR[4]);hl(A,0,roofH-1,W,TR[0]);
  boards(B,4,wy,W-8,wh,RD,6);for(let j=0;j<6;j++)hl(B,4,wy+j,W-8,shade(RD[2],.55+j*.07));
  for(const wx of [W*.3|0,W*.7|0]){rect(B,wx-9,wy+16,18,12,TR[3]);rect(B,wx-7,wy+18,14,8,N?PAL.lit[3]:PAL.ink[1]);hl(B,wx-9,wy+28,18,TR[1]);}
  drawText(B,'MARROW CREEK 1871',(W/2-34)|0,wy+8,PAL.cream[3],RD[0]);
  for(const ax of [0,W-ab]){for(let y=wy+wh-10;y<H-2;y++)for(let x=ax;x<ax+ab;x++){const r=(y/6|0),o=r%2?5:0,b=(x+o)%10;P(B,x,y,b===0||y%6===5?ST[1]:ST[(x-ax)<4?4:3]);}hl(B,ax,wy+wh-10,ab,ST[5]);}
  for(let y=wy+wh;y<H-2;y++)for(let x=ab;x<W-ab;x++)P(B,x,y,y<wy+wh+3?PAL.ink[0]:WA[2+((x+y)%7===0?1:0)]);
  gs(W/2|0,H-2,W/2-4|0,2,60);
}
if(K==='cportal'){ // covered bridge seen end-on (road runs north): long ridged roof going away, gable portal facing you
  const cx=W/2|0,rw=W-6,portalH=86,gab=46,base=H-4,wallTop=base-portalH,roofTop=4;
  // roof: two slopes either side of a ridge running up the screen
  for(let x=3;x<W-3;x++)for(let y=roofTop;y<wallTop-gab+2+Math.round(Math.min(1,Math.abs(x-cx)/(rw/2))*gab);y++){const left=x<cx;const row=((y-roofTop)/5|0),j=(y-roofTop)%5,tab=(x+row*7)%15;
    let c=left?PAL.slate[3]:PAL.slate[1];if(j===4||tab===0)c=left?PAL.slate[1]:PAL.slate[0];else if(j===0)c=left?PAL.slate[4]:PAL.slate[2];P(A,x,y,c);}
  for(let y=roofTop;y<wallTop-gab+6;y++){P(A,cx-1,y,PAL.slate[5]);P(A,cx,y,PAL.slate[4]);P(A,cx+1,y,PAL.slate[2]);}
  // gable face: boards, with the eaves sloping from the ridge
  for(let y=wallTop-gab;y<base;y++){const g=y<wallTop?Math.round((y-(wallTop-gab))/gab*(rw/2)):rw/2;for(let x=cx-g;x<cx+g;x++){const k=(x-cx+200)%6;P(B,x,y,k===0?RD[4]:k===5?RD[1]:RD[3]);}}
  for(let y=wallTop-gab;y<wallTop;y++){const g=Math.round((y-(wallTop-gab))/gab*(rw/2));for(const [x,c] of [[cx-g-1,TR[4]],[cx-g-2,TR[3]],[cx+g,TR[2]],[cx+g+1,TR[1]]])P(B,x,y,c);}
  // the dark mouth of the bridge, a rounded portal wide enough for the road
  const ow=rw-34,oh=portalH-4,ox0=cx-ow/2;for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){const r=ow/2,dy=Math.max(0,22-y);if(dy>0&&((x-r)**2)/(r*r)+(dy*dy)/(22*22)>1&&y<22)continue;
    P(B,ox0+x,base-oh+y,y<10?PAL.ink[0]:PAL.ink[1]);}
  for(let x=0;x<ow;x++)P(B,ox0+x,base-oh+22+((x*7)%3===0?1:0),PAL.ink[0]);
  rect(B,cx-34,wallTop-20,68,11,PAL.cream[3]);frame(B,cx-34,wallTop-20,68,11,PAL.cream[2],PAL.wood[0]);drawText(B,'MARROW CREEK',cx-23,wallTop-17,RD[1]);
  for(const ax of [3,W-16])for(let y=base-26;y<base;y++)for(let x=ax;x<ax+13;x++){const r=(y/6|0),o=r%2?5:0;P(B,x,y,(x+o)%10===0||y%6===5?ST[1]:ST[3]);}
}
if(K==='footbridge'){ // plank footbridge, spans east-west over the creek
  const top=10,dh=30;for(let y=top;y<top+dh;y++)for(let x=6;x<W-6;x++){const k=(x-6)%6;P(A,x,y,k===0?WD[1]:k===5?WD[2]:WD[3+((hsh((x-6)/6|0,1)>.7)?1:0)]);}
  hl(A,6,top,W-12,WD[5]);hl(A,6,top+dh-1,W-12,WD[0]);
  for(const ry of [top-6,top+dh-8]){for(let x=4;x<W-4;x+=14)rect(A,x,ry,4,10,WD[2]);hl(A,4,ry,W-8,WD[4]);hl(A,4,ry+1,W-8,WD[2]);hl(A,4,ry+2,W-8,WD[1]);}
  rect(A,6,top+dh,W-12,4,WD[0]);gs(W/2|0,top+dh+6,W/2-6|0,2,50);
}
if(K==='barn'){   // gambrel-roof barn: red boards, white trim, X-braced doors, hay loft
  const ox=6,ww=W-12,roofTop=4,brk=34,roofH=70,wy=roofTop+roofH-4,wh=H-wy-8;
  shingles(A,ox-4,roofTop,ww+8,brk,PAL.slate,5);for(let y=roofTop;y<roofTop+brk;y++)for(let x=ox-4;x<ox+ww+4;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,1.12));}
  shingles(A,ox-6,roofTop+brk,ww+12,roofH-brk,PAL.slate,5);for(let y=roofTop+brk;y<roofTop+roofH;y++)for(let x=ox-6;x<ox+ww+6;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,.82));}
  hl(A,ox-6,roofTop+brk,ww+12,PAL.slate[5]);rect(A,ox-4,roofTop,ww+8,4,PAL.slate[4]);hl(A,ox-4,roofTop,ww+8,PAL.slate[5]);
  rect(A,ox-6,roofTop+roofH-4,ww+12,4,TR[3]);hl(A,ox-6,roofTop+roofH-4,ww+12,TR[4]);hl(A,ox-6,roofTop+roofH-1,ww+12,TR[1]);
  // cupola on the ridge
  {const cx=W/2|0;rect(A,cx-9,roofTop-14,18,14,TR[3]);for(let i=0;i<3;i++)rect(A,cx-6+i*5,roofTop-11,3,8,PAL.ink[1]);for(let y=0;y<8;y++)hl(A,cx-11+y/2|0,roofTop-22+y,22-y,PAL.slate[3-(y>5?1:0)]);vl(A,cx,roofTop-30,8,PAL.slate[1]);
    for(let x=-5;x<6;x++)P(A,cx+x,roofTop-29+(Math.abs(x)>3?1:0),PAL.slate[2]);}
  boards(B,ox,wy,ww,wh,RD,6);for(let j=0;j<7;j++)hl(B,ox,wy+j,ww,shade(RD[2],.5+j*.07));
  for(const cx of [ox,ox+ww-5]){rect(B,cx,wy,5,wh,TR[3]);vl(B,cx,wy,wh,TR[4]);vl(B,cx+4,wy,wh,TR[1]);}
  // big sliding doors with white X bracing
  const dw=70,dx=(W/2-dw/2)|0,dh=wh-6,dy=wy+wh-dh;rect(B,dx,dy,dw,dh,RD[2]);
  for(const hx of [dx,dx+dw/2]){const hw=dw/2;frame(B,hx,dy,hw,dh,TR[4],TR[1]);rect(B,hx,dy,hw,3,TR[3]);rect(B,hx,dy+dh-3,hw,3,TR[3]);
    for(let t=0;t<1;t+=.004){const x1=hx+Math.round(t*(hw-3)),y1=dy+3+Math.round(t*(dh-7)),y2=dy+dh-4-Math.round(t*(dh-7));rect(B,x1,y1,3,2,TR[3]);rect(B,x1,y2,3,2,TR[3]);}}
  rect(B,dx-4,dy-5,dw+8,4,PAL.slate[2]);hl(B,dx-4,dy-5,dw+8,PAL.slate[4]);
  // hay loft hood breaking the roof line
  {const lw=30,lx=(W/2-lw/2)|0,ly=roofTop+brk-6;boards(A,lx,ly,lw,26,RD,5);rect(A,lx+5,ly+5,lw-10,18,N?PAL.lit[2]:PAL.ink[1]);for(let i=0;i<5;i++)P(A,lx+7+i*4,ly+20-(i%2),PAL.mustard[4]);
    for(let y=0;y<12;y++)hl(A,lx-3+y/2|0,ly-12+y,lw+6-y,PAL.slate[y<3?4:2]);rect(A,lx-3,ly,lw+6,2,TR[3]);}
  for(const wx of [ox+22,ox+ww-34]){rect(B,wx,wy+22,14,14,TR[3]);rect(B,wx+2,wy+24,10,10,N?PAL.lit[3]:PAL.glass[2]);vl(B,wx+7,wy+24,10,TR[2]);hl(B,wx+2,wy+29,10,TR[2]);}
  rect(B,ox-1,H-8,ww+2,4,ST[2]);hl(B,ox-1,H-8,ww+2,ST[4]);for(let x=ox;x<ox+ww;x+=9)vl(B,x,H-8,4,ST[1]);
  gs(W/2|0,H-3,W/2-4|0,2,70);
}
if(K==='silo'){   // grain silo: shaded cylinder, metal bands, domed cap, ladder
  const x0=4,w=W-8,top=20,base=H-4;
  for(let y=top;y<base;y++)for(let x=0;x<w;x++){const t=x/w;const k=t<.18?5:t<.4?4:t<.7?3:t<.88?2:1;let c=PAL.stone[k];if((y-top)%14===0)c=shade(c,.75);if((y-top)%14===1)c=shade(c,1.1);P(A,x0+x,y,c);}
  for(let y=0;y<20;y++){const r=Math.round(Math.sqrt(1-((20-y)/20)**2)*w/2);for(let x=-r;x<r;x++){const t=(x+w/2)/w;P(A,x0+w/2+x,top-20+y+3,PAL.rust[t<.3?4:t<.6?3:2]);}}
  for(let y=top+4;y<base-4;y+=4){P(B,x0+w-10,y,PAL.slate[1]);P(B,x0+w-6,y,PAL.slate[1]);}vl(B,x0+w-10,top+4,base-top-8,PAL.slate[2]);vl(B,x0+w-6,top+4,base-top-8,PAL.slate[2]);
  rect(A,x0-2,base-2,w+4,3,ST[1]);gs(W/2|0,base,w/2+2|0,3,70);
}
if(K==='windpump'){ // farm windpump tower (blades are a separate animated sprite)
  const cx=W/2|0,top=14,base=H-4;for(let y=top;y<base;y++){const t=(y-top)/(base-top),half=Math.round(3+t*16);P(A,cx-half,y,PAL.slate[3]);P(A,cx-half+1,y,PAL.slate[2]);P(A,cx+half,y,PAL.slate[1]);
    if((y-top)%16===0){hl(A,cx-half,y,half*2+1,PAL.slate[2]);}if((y-top)%16<16){const k=(y-top)%16;const a=Math.round(cx-half+(k/16)*half*2);P(A,a,y,PAL.slate[2]);P(A,cx+half-Math.round((k/16)*half*2),y,PAL.slate[1]);}}
  rect(A,cx-6,top-4,12,5,PAL.slate[3]);hl(A,cx-6,top-4,12,PAL.slate[4]);
  for(let i=0;i<22;i++){P(A,cx+4+i,top-6-Math.round(i*.15),PAL.slate[2]);}for(let y=0;y<10;y++)hl(A,cx+20,top-11+y,8-Math.abs(y-5),PAL.red[3]);
  rect(A,cx-2,base-14,5,14,PAL.slate[2]);rect(A,cx-8,base-6,16,6,WD[2]);hl(A,cx-8,base-6,16,WD[4]);gs(cx,base,20,3,60);
}
if(K==='blades'){ // 4-frame rotating fan for the windpump
  const cx=W/2,cy=H/2,R=W/2-2,n=14;for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+F*(Math.PI*2/n/4);for(let r=5;r<R;r++){const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.9;P(A,x,y,i%2?PAL.white[3]:PAL.white[4]);P(A,x+Math.cos(a+1.57),y+Math.sin(a+1.57)*.9,PAL.white[2]);}}
  for(let t=0;t<6.29;t+=.02){P(A,cx+Math.cos(t)*R,cy+Math.sin(t)*R*.9,PAL.slate[2]);P(A,cx+Math.cos(t)*5,cy+Math.sin(t)*4.5,PAL.slate[2]);}
  ell(A,cx,cy,3,3,PAL.slate[3]);
}
if(K==='chicken'){ // 16x16 hen, facing right. f: 0,1 walk, 2 peck
  const by=F===2?3:0,leg=F===1;ell(A,7,9+by*.3,5,4,TR[4]);ell(A,6,8,4,3,TR[5]);ell(A,11,5+by,3,3,TR[5]);P(A,12,4+by,PAL.ink[0]);
  rect(A,14,5+by,2,1,PAL.mustard[4]);P(A,14,6+by,PAL.mustard[3]);rect(A,10,1+by,3,2,RD[3]);P(A,13,7+by,RD[3]);
  ell(A,4,8,2,2,TR[3]);hl(A,3,10,6,TR[2]);vl(A,6,13,2,PAL.mustard[3]);vl(A,leg?9:8,13,2,PAL.mustard[3]);gs(7,15,5,1,70);
}
if(K==='butterfly'){const open=F===0;const o=PAL.rust;if(open){ell(A,2,2,2,2,o[4]);ell(A,7,2,2,2,o[4]);ell(A,2,4,1,1,o[3]);ell(A,7,4,1,1,o[3]);P(A,2,2,PAL.ink[0]);P(A,7,2,PAL.ink[0]);}else{rect(A,3,0,1,4,o[4]);rect(A,5,0,1,4,o[3]);}vl(A,4,1,4,PAL.ink[0]);}
if(K==='mailbox'){const cx=W/2|0,base=H-3;rect(A,cx-2,14,4,base-14,WD[2]);vl(A,cx-2,14,base-14,WD[4]);
  for(let y=0;y<12;y++){const w=y<3?14-((3-y)*2):16;hl(A,cx-8+(16-w)/2|0,4+y,w,y<2?PAL.slate[4]:PAL.slate[3-(y>8?1:0)]);}hl(A,cx-8,15,16,PAL.slate[1]);
  rect(A,cx+8,2,2,9,RD[3]);rect(A,cx+8,2,5,3,RD[4]);drawText(A,'MARSH',cx-9,8,PAL.white[5]);gs(cx,base,6,2,60);}
if(K==='decor'){   // 8 ground decals, 16px apart: 3 grass tufts, 2 stones, 2 wildflower clumps, twigs
  const tuft=(ox,n,h)=>{for(let i=0;i<n;i++){const x=ox+3+i*2+(hsh(i,ox)*2|0),hh=h+(hsh(i,ox,2)*3|0);for(let y=0;y<hh;y++)P(A,x+(y>hh-3&&i%2?1:0),13-y,y>hh-2?GR[5]:y>hh/2?GR[4]:GR[3]);}};
  tuft(0,5,5);tuft(16,6,7);tuft(32,4,4);
  ell(A,48+8,11,5,3,ST[3]);ell(A,48+7,10,3,2,ST[4]);hl(A,48+4,14,9,ST[1]);ell(A,64+6,12,3,2,ST[3]);ell(A,64+11,11,2,2,ST[2]);P(A,64+5,11,ST[5]);
  for(const [ox,col] of [[80,PAL.white],[96,PAL.mustard]])for(let i=0;i<5;i++){const x=ox+3+i*2+(hsh(i,ox)*2|0),y=6+(hsh(i,ox,3)*5|0);vl(A,x,y+1,13-y,GR[3]);P(A,x,y,col[5]);P(A,x+1,y,col[4]);P(A,x,y-1,col[4]);}
  for(let i=0;i<9;i++){P(A,112+3+i,10+Math.round(i*.3),WD[2]);}for(let i=0;i<5;i++)P(A,112+6+i,12-i,WD[3]);
}
const flat=flatten([A,B],W,H);const outlined=CFG.noOutline?[]:[outline(flat)];
emit([SHD,...outlined,A,B],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
