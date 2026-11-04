// ---- house builder. CFG is prepended by the driver: {name,bw,siding,roof,trim,door,shutter,wins,chimney,porch,night,out,seed,sign,kind}
SEED=CFG.seed||7;
const bw=CFG.bw, WW=bw*32, OV=8, ox=OV+2, roofH=CFG.roofH||64, y0=CFG.top||22;
const W=WW+OV*2+4, yW=y0+roofH-5, wallH=CFG.wallH||66, yB=yW+wallH, H=yB+9;
const S_=PAL[CFG.siding], RF=PAL[CFG.roof], TR=PAL[CFG.trim||'white'], DR=PAL[CFG.door||'wood'], SH=PAL[CFG.shutter||'slate'];
const Lroof=layer('roof',W,H), Lwall=layer('walls',W,H), Ltrim=layer('trim',W,H), Lwin=layer('windows',W,H), Ldoor=layer('door',W,H), Ldet=layer('details',W,H), Lchim=layer('chimney',W,H), Lsh=layer('shadow',W,H);
// ===== walls: clapboard, 5px courses, lit lip on top of each board, shadow under it
const wx0=ox, wx1=ox+WW-1;
if(CFG.kind==='brick'){
  for(let y=yW;y<yB;y++){const row=(y-yW)/4|0,j=(y-yW)%4,off=row%2?5:0;for(let x=wx0;x<=wx1;x++){const bx=(x-wx0+off)%11;let c=S_[2+((hsh((x-wx0+off)/11|0,row,6)*2)|0)];
    if(j===3||bx===10)c=PAL.stone[2];else if(j===0)c=shade(c,1.12);P(Lwall,x,y,c);}}
}else if(CFG.kind==='stone'){
  for(let y=yW;y<yB;y++)for(let x=wx0;x<=wx1;x++)P(Lwall,x,y,S_[2]);
  let y=yW;let row=0;while(y<yB){const h=7+(hsh(row,3)*3|0);let x=wx0-(row%2?6:0);while(x<=wx1){const w=10+(hsh(x,row)*8|0);
      const c=S_[2+((hsh(x,row,2)*3|0)-1)];for(let j=1;j<h-1;j++)for(let i=1;i<w-1;i++)P(Lwall,x+i,y+j,c);
      hl(Lwall,Math.max(wx0,x+1),y+1,Math.min(w-2,wx1-x),S_[4]);vl(Lwall,x+1,y+1,h-2,S_[3]);hl(Lwall,Math.max(wx0,x+1),y+h-2,Math.min(w-2,wx1-x),S_[1]);
      vl(Lwall,x+w-1,y,h,S_[0]);x+=w;}hl(Lwall,wx0,y+h-1,WW,S_[0]);for(let x2=0;x2<wx0;x2++)for(let j=0;j<h;j++)P(Lwall,x2,y+j,null);y+=h;row++;}
  for(let y2=yW;y2<yB;y2++){for(let x2=0;x2<wx0;x2++){const i=(y2*W+x2)*4;Lwall.d[i+3]=0;}for(let x2=wx1+1;x2<W;x2++){const i=(y2*W+x2)*4;Lwall.d[i+3]=0;}}
}else{
  for(let y=yW;y<yB;y++){const k=(y-yW)%5;const c=k===0?S_[4]:k===4?S_[1]:S_[3];hl(Lwall,wx0,y,WW,c);}
  // a few boards with faded / weathered paint, in board-long runs (clusters, not noise)
  for(let n=0;n<bw*2;n++){const by=yW+5*((rnd()*(wallH/5-1))|0)+6,bx=wx0+8+(rnd()*(WW-30)|0),bl=10+(rnd()*18|0);for(let j=1;j<4;j++)hl(Lwall,bx+(j===1?1:0),by+j,bl-(j===1?2:0),shade(S_[3],.9));if(rnd()<.3)hl(Lwall,bx+bl/2|0,by+2,2,PAL.wood[3]);}
  // a streak of grime under each window sill

}
// shadow the roof throws on the wall top
for(let j=0;j<6;j++)for(let x=wx0;x<=wx1;x++){const c=G(Lwall,x,yW+5+j);if(c)P(Lwall,x,yW+5+j,shade(c,.55+j*.07));}
// corner boards
for(const cx of [wx0,wx1-4]){rect(Ltrim,cx,yW,5,wallH,TR[3]);vl(Ltrim,cx,yW,wallH,TR[4]);vl(Ltrim,cx+4,yW,wallH,TR[1]);for(let j=0;j<6;j++)hl(Ltrim,cx,yW+5+j,5,shade(TR[3],.6+j*.06));}
// foundation: fieldstone
{const fy=yB;rect(Lwall,wx0-1,fy,WW+2,7,PAL.stone[1]);let x=wx0;let i=0;while(x<wx1){const w=7+(hsh(i,9)*6|0);const c=PAL.stone[2+(hsh(i,4)*2|0)];rect(Lwall,x+1,fy+1,Math.min(w-1,wx1-x),4,c);hl(Lwall,x+1,fy+1,Math.min(w-2,wx1-x),PAL.stone[4]);x+=w;i++;}
  hl(Lwall,wx0-1,fy+6,WW+2,PAL.stone[0]);}
// ===== roof
const rx0=ox-OV, rx1=ox+WW+OV-1;
if(CFG.gable){
  // front-gable: the triangular gable wall faces you, two slopes run back and up, ridge recedes upward
  const cx=ox+WW/2, gh=Math.round(WW*.34), D=roofH-16, apY=yW-gh;
  const rake=(x)=>yW+2-Math.round((1-Math.abs(x-cx)/(cx-rx0))*(gh+2));   // y of the rake (front edge of the roof) at column x
  for(let x=rx0;x<=rx1;x++){const ry=rake(x);const left=x<cx;
    for(let y=ry-D;y<=ry;y++){const k=(ry-y);const row=(k/5|0),j=k%5;const off=(row*7)%13;const tab=((x+off+(left?0:3))%13);
      let c=left?RF[3]:RF[1];if(j===0)c=left?RF[1]:RF[0];else if(j===1)c=left?RF[2]:RF[1];if(tab===0)c=left?RF[1]:RF[0];
      if(left&&j===4&&tab<7)c=RF[4];if(y===ry-D)c=left?RF[4]:RF[2];
      if(CFG.moss&&hsh(x/9|0,row,4)>.92&&j>1)c=PAL.moss[left?2:1];P(Lroof,x,y,c);}}
  for(let y=apY-D-2;y<=apY;y++){P(Lroof,cx-1,y,RF[5]);P(Lroof,cx,y,RF[4]);P(Lroof,cx+1,y,RF[2]);}
  // gable wall (siding) and its trim
  for(let y=apY;y<yW;y++){const half=Math.round((y-apY)/(gh)*(WW/2));for(let x=cx-half;x<cx+half;x++){const k=(y-yW+200)%5;P(Lwall,x,y,k===0?S_[4]:k===4?S_[1]:S_[3]);}}
  for(let x=rx0;x<=rx1;x++){const ry=rake(x);for(let t=0;t<4;t++)P(Ltrim,x,ry+t-1,t===0?TR[4]:t===3?TR[1]:TR[3]);}
  // attic window: round-topped vent
  {const aw=12,ah=12,ax0=cx-aw/2,ay0=apY+Math.round(gh*.45);rect(Lwin,ax0-2,ay0-2,aw+4,ah+4,TR[3]);frame(Lwin,ax0-2,ay0-2,aw+4,ah+4,TR[4],TR[1]);
    for(let j=0;j<ah;j++)for(let i=0;i<aw;i++)P(Lwin,ax0+i,ay0+j,CFG.night&&CFG.attic?PAL.lit[3+(j>6?1:0)]:(j<4?PAL.glass[1]:PAL.glass[2]));vl(Lwin,cx,ay0,ah,TR[2]);hl(Lwin,ax0,ay0+6,aw,TR[2]);
    if(CFG.night&&CFG.attic){ell(Lwin,cx+2,ay0+4,2,2,PAL.ink[0]);rect(Lwin,cx,ay0+6,5,6,PAL.ink[0]);}}
}else{
rect(Lroof,rx0,y0,rx1-rx0+1,roofH,RF[1]);
const course=5;let ci=0;
for(let y=y0+7;y<y0+roofH-4;y+=course,ci++){const off=(ci*9)%17;let x=rx0+2-off;let ti=0;
  while(x<rx1-1){const tw=15+(hsh(ti,ci,5)*8|0);let base=RF[2];const v=hsh(ti,ci,8);if(v>.9)base=shade(RF[3],.94);else if(v<.1)base=shade(RF[2],.9);
    const moss=CFG.moss&&hsh(ti,ci,11)>.93&&ci>3;
    for(let j=0;j<course;j++)for(let i=0;i<tw;i++){const px=x+i;if(px<=rx0+1||px>=rx1-1)continue;
      let c=j===course-1?RF[0]:j===course-2?RF[1]:(j===0&&i>1&&i<tw*.45)?RF[3]:base;
      if((i===0||i===tw-1)&&j===course-2)c=RF[0];
      if(i===tw-1&&j>0&&j<course-2)c=RF[1];
      if(moss&&j>0&&j<course-1&&((i*3+j)%4))c=PAL.moss[(i+j)%3?1:2];P(Lroof,px,y+j,c);}
    x+=tw;ti++;}}
// slope lighting: brighter near the ridge, darker towards the eave
for(let y=y0+6;y<y0+roofH;y++){const k=1.08-.16*(y-y0)/roofH;for(let x=rx0;x<=rx1;x++){const c=G(Lroof,x,y);if(c)P(Lroof,x,y,[Math.min(255,c[0]*k),Math.min(255,c[1]*k),Math.min(255,c[2]*k)]);}}
// ridge cap
rect(Lroof,rx0,y0,rx1-rx0+1,6,RF[3]);hl(Lroof,rx0,y0,rx1-rx0+1,RF[5]);hl(Lroof,rx0,y0+1,rx1-rx0+1,RF[4]);hl(Lroof,rx0,y0+5,rx1-rx0+1,RF[1]);for(let x=rx0+5;x<rx1;x+=7)vl(Lroof,x,y0+2,3,RF[2]);
// bargeboards on the gable ends and the eave fascia
for(const [bx,lt] of [[rx0,true],[rx1-3,false]]){rect(Ltrim,bx,y0,4,roofH,TR[3]);vl(Ltrim,bx+(lt?0:3),y0,roofH,TR[lt?4:1]);vl(Ltrim,bx+(lt?3:0),y0,roofH,TR[2]);}
rect(Ltrim,rx0,y0+roofH-4,rx1-rx0+1,4,TR[3]);hl(Ltrim,rx0,y0+roofH-4,rx1-rx0+1,TR[4]);hl(Ltrim,rx0,y0+roofH-1,rx1-rx0+1,TR[1]);
}
// ===== windows: trim frame, sill, mullions, curtains, shutters; lit at night
function archWindow(cx,wy,night){const ww=20,wh=46,x=cx-ww/2|0,r=ww/2;
  for(let y=0;y<wh;y++)for(let i=0;i<ww;i++){const dy=r-y;if(y<r&&(i-r+.5)*(i-r+.5)+dy*dy>r*r)continue;P(Lwin,x+i,wy+y,TR[3]);}
  for(let y=2;y<wh-2;y++)for(let i=2;i<ww-2;i++){const dy=r-y;if(y<r&&(i-r+.5)*(i-r+.5)+dy*dy>(r-2)*(r-2))continue;const t=y/wh;
    let c=night?PAL.lit[t<.3?3:t<.7?4:5]:(t<.25?PAL.glass[1]:t<.65?PAL.glass[2]:PAL.glass[3]);if(!night&&(i+y)%17===0)c=PAL.glass[5];
    if(i===r||i===r-1||(y-2)%9===8)c=TR[2];P(Lwin,x+i,wy+y,c);}
  for(let y=0;y<r;y++){const dy=r-y,w=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy)));P(Lwin,x+r-w,wy+y,TR[4]);P(Lwin,x+r+w-1,wy+y,TR[1]);}
  rect(Lwin,x-2,wy+wh-1,ww+4,3,TR[4]);hl(Lwin,x-2,wy+wh+1,ww+4,TR[1]);}
function windowAt(cx,wy,night){if(CFG.arched)return archWindow(cx,wy,night);const ww=18,wh=24,x=cx-ww/2|0;
  if(CFG.shutters!==false){for(const sx of [x-6,x+ww+1]){rect(Lwin,sx,wy+1,5,wh-2,SH[2]);frame(Lwin,sx,wy+1,5,wh-2,SH[3],SH[0]);for(let j=wy+4;j<wy+wh-3;j+=3)hl(Lwin,sx+1,j,3,SH[1]);}}
  rect(Lwin,x,wy,ww,wh,TR[3]);frame(Lwin,x,wy,ww,wh,TR[4],TR[1]);
  const gx=x+2,gy=wy+2,gw=ww-4,gh=wh-5;
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){let c;
    if(night){const t=j/gh;c=PAL.lit[t<.25?3:t<.6?4:5];if(i===0||j===0)c=PAL.lit[2];}
    else{c=j<3?PAL.glass[1]:j<gh*.6?PAL.glass[2]:PAL.glass[3];if(i+j===6||i+j===7||i+j===12)c=PAL.glass[5];if(i<2&&j>2)c=PAL.glass[1];}
    P(Lwin,gx+i,gy+j,c);}
  // curtains drawn half-closed
  const cu=CFG.curtain?PAL[CFG.curtain]:PAL.curtain;
  for(let j=0;j<gh-2;j++){const w1=3+(j>gh*.55?1:0);for(let i=0;i<w1;i++){P(Lwin,gx+i,gy+j,night?shade(cu[2],.85):cu[(i===w1-1)?1:2]);P(Lwin,gx+gw-1-i,gy+j,night?shade(cu[2],.85):cu[i===0?3:2]);}}
  vl(Lwin,cx,gy,gh,TR[2]);hl(Lwin,gx,gy+(gh/2|0),gw,TR[2]);
  if(night&&CFG.watcher&&cx===CFG.watcher){ell(Lwin,cx+3,gy+6,2,3,PAL.ink[0]);rect(Lwin,cx+1,gy+9,5,gh-10,PAL.ink[0]);}
  rect(Lwin,x-2,wy+wh-1,ww+4,3,TR[4]);hl(Lwin,x-2,wy+wh+1,ww+4,TR[1]);hl(Lwin,x-1,wy+wh+2,ww+2,shade(S_[1],.7));}
const winY=yW+CFG.winY||yW+16;
for(const c of CFG.wins)windowAt(ox+c*32+16,winY,CFG.night&&!(CFG.boarded||[]).includes(c));
for(const c of (CFG.boarded||[])){const cx=ox+c*32+16;for(const [dy,ang] of [[5,-1],[12,1],[18,-1]]){for(let i=-12;i<12;i++){const y=winY+dy+Math.round(i*ang*.18);P(Lwin,cx+i,y,PAL.wood[3]);P(Lwin,cx+i,y+1,PAL.wood[3]);P(Lwin,cx+i,y+2,PAL.wood[1]);}
  P(Lwin,cx-10,winY+dy+1,PAL.stone[4]);P(Lwin,cx+9,winY+dy+1,PAL.stone[4]);}}
if(CFG.awning)for(const c of CFG.wins){const cx=ox+c*32+16,ay=winY-7;for(let y=0;y<9;y++)for(let x=-15;x<15;x++){const st=((x+20)/5|0)%2;let col=st?PAL.cream[3]:PAL.red[3];if(y>5)col=st?PAL.cream[2]:PAL.red[2];if(y===8&&(x+20)%5===2)col=null;if(y===0)col=shade(col||PAL.red[3],1.1);if(col)P(Lwin,cx+x,ay+y,col);}
  for(let x=-15;x<15;x++)P(Lsh,cx+x,ay+10,PAL.out[0],90);}
// ===== door with frame, panels, knob, transom; stone step
if(CFG.bigdoor){const dw=60,dh=50,dx=(ox+WW/2-dw/2+(CFG.bigdoorX||0)*32)|0,dy=yB-dh;rect(Ldoor,dx-4,dy-4,dw+8,dh+4,PAL.stone[3]);frame(Ldoor,dx-4,dy-4,dw+8,dh+4,PAL.stone[5],PAL.stone[1]);
  for(let y=0;y<dh;y++){const j=y%6;hl(Ldoor,dx,dy+y,dw,j===0?PAL.slate[4]:j===5?PAL.slate[1]:PAL.slate[3]);}for(let y=dh-14;y<dh;y++)hl(Ldoor,dx+2,dy+y,dw-4,shade(PAL.slate[2],.8));rect(Ldoor,dx+dw/2-4,dy+dh-8,8,2,PAL.stone[1]);
  for(let k=0;k<5;k++)rect(Ldoor,dx+6+k*11,dy+10,7,4,CFG.night?PAL.lit[4]:PAL.glass[2]);}
{const dw=20,dh=CFG.doorH||38,dx=(ox+WW/2-dw/2+(CFG.doorX||0)*32)|0,dy=yB-dh;
  rect(Ldoor,dx-3,dy-4,dw+6,dh+4,TR[3]);frame(Ldoor,dx-3,dy-4,dw+6,dh+4,TR[4],TR[1]);
  rect(Ldoor,dx,dy,dw,dh,DR[2]);vl(Ldoor,dx,dy,dh,DR[1]);hl(Ldoor,dx,dy,dw,DR[1]);
  for(const [px,py,pw,ph] of [[3,4,6,13],[11,4,6,13],[3,21,6,dh-25],[11,21,6,dh-25]]){rect(Ldoor,dx+px,dy+py,pw,ph,DR[3]);frame(Ldoor,dx+px,dy+py,pw,ph,DR[1],DR[4]);}
  if(CFG.night){rect(Ldoor,dx+3,dy+4,14,4,PAL.lit[4]);}
  rect(Ldoor,dx+dw-5,dy+dh/2|0,2,2,PAL.brass[3]);P(Ldoor,dx+dw-4,(dy+dh/2|0)+1,PAL.brass[1]);
  rect(Ldet,dx-6,yB,dw+12,5,PAL.stone[3]);hl(Ldet,dx-6,yB,dw+12,PAL.stone[5]);hl(Ldet,dx-6,yB+4,dw+12,PAL.stone[1]);
  rect(Ldet,dx-3,yB+5,dw+6,3,PAL.stone[2]);hl(Ldet,dx-3,yB+5,dw+6,PAL.stone[4]);hl(Ldet,dx-3,yB+7,dw+6,PAL.stone[0]);
  if(CFG.porchLamp){rect(Ldet,dx-8,dy+2,3,5,PAL.brass[1]);P(Ldet,dx-7,dy+3,CFG.night?PAL.lit[5]:PAL.brass[3]);}}
// ===== dormers (on the side-gable roof)
if(!CFG.gable&&CFG.dormers)for(const dc of CFG.dormers){const dw=28,dx=(ox+dc*32+16-dw/2)|0,db=y0+roofH-14,dt=db-20;
  for(let y=dt;y<db;y++){const k=(y-dt)%5;hl(Lchim,dx,y,dw,k===0?S_[4]:k===4?S_[1]:S_[3]);}
  vl(Lchim,dx,dt,db-dt,TR[4]);vl(Lchim,dx+dw-1,dt,db-dt,TR[1]);
  const gx=dx+7,gy=dt+4;rect(Lchim,gx-2,gy-2,18,15,TR[3]);frame(Lchim,gx-2,gy-2,18,15,TR[4],TR[1]);
  for(let j=0;j<11;j++)for(let i=0;i<14;i++)P(Lchim,gx+i,gy+j,CFG.night?PAL.lit[j<4?3:4]:(j<3?PAL.glass[1]:(i+j===8?PAL.glass[5]:PAL.glass[2])));vl(Lchim,gx+7,gy,11,TR[2]);
  // its little gable roof
  const ah=12;for(let y=0;y<ah;y++){const half=Math.round((y/ah)*(dw/2+3));for(let x=-half;x<half;x++){const px=dx+dw/2+x,py=dt-ah+y;P(Lchim,px,py,x<0?RF[3]:RF[1]);if((y%4)===3)P(Lchim,px,py,x<0?RF[2]:RF[0]);}
    P(Lchim,dx+dw/2-half-1,dt-ah+y,TR[4]);P(Lchim,dx+dw/2+half,dt-ah+y,TR[1]);}
  hl(Lchim,dx-4,dt,dw+8,TR[3]);hl(Lchim,dx-4,dt+1,dw+8,TR[1]);
  for(let x=dx-2;x<dx+dw+3;x++)for(let y=db;y<db+3;y++){const c=G(Lroof,x,y);if(c)P(Lroof,x,y,shade(c,.6));}}
// ===== window flower boxes (dead autumn plants)
if(CFG.flowers)for(const c of CFG.wins){const cx=ox+c*32+16,by=winY+26;rect(Ldet,cx-12,by,24,5,PAL.wood[2]);hl(Ldet,cx-12,by,24,PAL.wood[4]);hl(Ldet,cx-12,by+4,24,PAL.wood[0]);
  for(let i=0;i<10;i++){const fx=cx-11+i*2+(hsh(i,c)*2|0),fh=2+(hsh(i,c,3)*4|0);vl(Ldet,fx,by-fh,fh,i%3?PAL.moss[1]:PAL.bark[2]);P(Ldet,fx,by-fh-1,[PAL.rust[3],PAL.mustard[3],PAL.red[2]][i%3]);}}
// ===== covered porch across the front: shed roof, posts, plank deck, steps
if(CFG.porch){const p0=wx0-6,p1=wx1+6,pr=yB-48,ph=10;
  for(let y=pr;y<pr+ph;y++)for(let x=p0;x<=p1;x++){const j=(y-pr)%5,tab=(x+((y-pr)/5|0)*6)%11;P(Ldet,x,y,j===4||tab===0?RF[0]:j===0?RF[3]:RF[2]);}
  rect(Ldet,p0,pr+ph,p1-p0+1,3,TR[3]);hl(Ldet,p0,pr+ph,p1-p0+1,TR[4]);hl(Ldet,p0,pr+ph+2,p1-p0+1,TR[1]);
  for(let y=pr+ph+3;y<pr+ph+9;y++)for(let x=wx0;x<=wx1;x++){const c=G(Lwall,x,y)||G(Ltrim,x,y);if(c){P(Lwall,x,y,shade(c,.62));if(G(Ltrim,x,y))P(Ltrim,x,y,shade(c,.62));}
    for(const Lz of [Lwin,Ldoor]){const c2=G(Lz,x,y);if(c2)P(Lz,x,y,shade(c2,.62));}}
  const posts=[p0+1,p1-4];const n=Math.max(1,Math.round(WW/80));for(let k=1;k<n;k++)posts.push(Math.round(p0+(p1-p0)*k/n)-2);
  const doorX=(ox+WW/2)|0;for(const px of posts){if(Math.abs(px+2-doorX)<16)continue;rect(Ldet,px,pr+ph+3,4,yB-pr-ph-2,TR[3]);vl(Ldet,px,pr+ph+3,yB-pr-ph-2,TR[4]);vl(Ldet,px+3,pr+ph+3,yB-pr-ph-2,TR[1]);}
  // railing between posts (skips the doorway)
  for(let x=p0;x<=p1;x++){if(Math.abs(x-doorX)<15)continue;P(Ldet,x,yB-12,TR[4]);P(Ldet,x,yB-11,TR[2]);if((x-p0)%5===0)vl(Ldet,x,yB-10,10,TR[2]);}
  rect(Ldet,p0-1,yB,p1-p0+3,6,PAL.wood[3]);for(let x=p0;x<p1;x+=9)vl(Ldet,x,yB,6,PAL.wood[1]);hl(Ldet,p0-1,yB,p1-p0+3,PAL.wood[5]);hl(Ldet,p0-1,yB+5,p1-p0+3,PAL.wood[0]);
  rect(Ldet,doorX-14,yB+6,28,3,PAL.wood[2]);hl(Ldet,doorX-14,yB+6,28,PAL.wood[4]);}
// ===== chimney
if(CFG.chimney!==undefined&&CFG.chimney!==null){const cw=16,cx=(ox+WW/2+CFG.chimney*32-cw/2)|0,ct=6,cb=y0+18;
  for(let y=ct;y<cb;y++)for(let x=cx;x<cx+cw;x++){const row=(y-ct)/4|0,off=row%2?4:0;const mort=(y-ct)%4===3||((x-cx+off)%8===7);P(Lchim,x,y,mort?PAL.red[1]:PAL.red[(x-cx)<3?4:(x-cx)>cw-4?2:3]);}
  rect(Lchim,cx-2,ct-3,cw+4,4,PAL.stone[3]);hl(Lchim,cx-2,ct-3,cw+4,PAL.stone[5]);hl(Lchim,cx-2,ct,cw+4,PAL.stone[1]);rect(Lchim,cx+3,ct-3,cw-6,2,PAL.ink[0]);
  for(let x=cx;x<cx+cw;x++)P(Lchim,x,cb,PAL.red[0]);
  for(let y=cb-10;y<cb+3;y++)for(let x=cx+cw;x<cx+cw+5;x++){const c=G(Lroof,x,y);if(c)P(Lroof,x,y,shade(c,.62));}}
// ===== steeple: clapboard tower in front, louvred belfry with a bell, shaded spire and cross
if(CFG.steeple){const tw=46,tx=(ox+WW/2-tw/2)|0,bt=y0+roofH-30,bh=34,belT=bt-bh,spH=CFG.spire||86,apex=belT-6-spH;
  for(let y=bt;y<yB;y++){const k=(y-bt)%5;hl(Lchim,tx,y,tw,k===0?S_[4]:k===4?S_[1]:S_[3]);}
  rect(Lchim,tx,bt,5,yB-bt,TR[3]);vl(Lchim,tx,bt,yB-bt,TR[4]);rect(Lchim,tx+tw-5,bt,5,yB-bt,TR[3]);vl(Lchim,tx+tw-1,bt,yB-bt,TR[1]);
  // tower double door, arched
  {const dw=26,dh=40,dx=tx+tw/2-dw/2,dy=yB-dh,r=dw/2;for(let y=0;y<dh;y++)for(let i=0;i<dw;i++){const dy2=r-y;if(y<r&&(i-r+.5)**2+dy2*dy2>r*r)continue;
      let c=(i<2||i>dw-3||y<2)?TR[3]:DR[(i===r||i===r-1)?0:((i%6)===0?1:2)];if(CFG.night&&y<r&&y>2&&i>2&&i<dw-3)c=PAL.lit[4];P(Lchim,dx+i,dy+y,c);}
    rect(Lchim,dx-4,yB,dw+8,5,PAL.stone[3]);hl(Lchim,dx-4,yB,dw+8,PAL.stone[5]);}
  // round window above the door
  ell(Lchim,tx+tw/2,yB-58,7,7,TR[3]);ell(Lchim,tx+tw/2,yB-58,5,5,CFG.night?PAL.lit[3]:PAL.glass[2]);vl(Lchim,tx+tw/2,yB-63,11,TR[2]);hl(Lchim,tx+tw/2-5,yB-58,11,TR[2]);
  // cornice
  rect(Lchim,tx-4,bt-4,tw+8,5,TR[3]);hl(Lchim,tx-4,bt-4,tw+8,TR[5]);hl(Lchim,tx-4,bt,tw+8,TR[1]);
  // belfry
  const bx=tx+4,bw2=tw-8;rect(Lchim,bx,belT,bw2,bh-4,TR[3]);vl(Lchim,bx,belT,bh-4,TR[4]);vl(Lchim,bx+bw2-1,belT,bh-4,TR[1]);
  {const ow=bw2-12,oxx=bx+6,oy=belT+6,oh=bh-14,r=ow/2;for(let y=0;y<oh;y++)for(let i=0;i<ow;i++){const dy2=r-y;if(y<r&&(i-r+.5)**2+dy2*dy2>r*r)continue;P(Lchim,oxx+i,oy+y,PAL.ink[1]);}
    ell(Lchim,oxx+r,oy+r+4,7,6,PAL.brass[2]);ell(Lchim,oxx+r-2,oy+r+2,3,3,PAL.brass[3]);hl(Lchim,oxx+r-7,oy+r+9,15,PAL.brass[1]);vl(Lchim,oxx+r,oy+2,4,PAL.brass[1]);
    for(let y=oy+oh-6;y<oy+oh;y+=2)hl(Lchim,oxx,y,ow,TR[2]);}
  rect(Lchim,bx-3,belT-4,bw2+6,5,TR[3]);hl(Lchim,bx-3,belT-4,bw2+6,TR[5]);hl(Lchim,bx-3,belT,bw2+6,TR[1]);
  // spire: two lit/shaded faces with shingle bands
  const sb=belT-5,sw=bw2+2,scx=tx+tw/2;for(let y=0;y<spH;y++){const half=Math.round((y/spH)*sw/2);for(let x=-half;x<half;x++){let c=x<0?RF[3]:RF[1];if(y%6===5)c=x<0?RF[2]:RF[0];if(x===-1)c=RF[4];P(Lchim,scx+x,apex+y+6,c);}}
  for(let x=-sw/2;x<sw/2;x++){P(Lchim,scx+x,sb,TR[3]);P(Lchim,scx+x,sb+1,TR[1]);}
  vl(Lchim,scx,apex-8,14,PAL.brass[2]);hl(Lchim,scx-3,apex-4,7,PAL.brass[2]);P(Lchim,scx-1,apex-7,PAL.brass[3]);}
// ===== optional sign board over the door (store / garage)
if(CFG.sign){const sw=CFG.sign.length*4+7,sx=(ox+WW/2-sw/2)|0,sy=yW+4;rect(Ldet,sx,sy,sw,11,PAL.wood[2]);frame(Ldet,sx,sy,sw,11,PAL.wood[4],PAL.wood[0]);
  drawText(Ldet,CFG.sign,sx+4,sy+3,PAL.cream[3],PAL.wood[0]);}
// ===== ground contact shadow
for(let x=wx0-2;x<=wx1+4;x++)for(let j=0;j<2;j++)P(Lsh,x,yB+7+j,PAL.out[0],j?40:80);
const ART=[Lsh,Lroof,Lwall,Ltrim,Lwin,Ldoor,Ldet,Lchim];
const flat=flatten(ART,W,H);const Lout=outline(flat);
emit([Lsh,Lout,Lroof,Lwall,Ltrim,Lwin,Ldoor,Ldet,Lchim],CFG.out);
console.log('META '+JSON.stringify({w:W,h:H,ax:W/2,ay:yB+6,bw:bw}));
