// ---- chibi characters for Hollow Acre (Stardew-like proportions: big head, short body), plus the too-tall Hollow.
// One sprite sheet per character. Rows follow the game's clip table; each frame is FW x FH, feet at (FW/2, FH-4).
SEED=CFG.seed||3;
const C=CFG.look,TALL=!!C.tall,KID=!!C.kid;
const FW=TALL?80:48,FH=TALL?160:64;
const CLIPS=[['walk',['N','W','S','E'],9],['idle',['N','W','S','E'],2],['thrust',['N','W','S','E'],8],['slash',['N','W','S','E'],6],['hurt',['S'],6],['spellcast',['N','W','S','E'],7],['sit',['N','W','S','E'],3]];
const ROWS=[];for(const [n,ds,nf] of CLIPS)for(const d of ds)ROWS.push([n,d,nf]);
const SW=FW*9,SH=FH*ROWS.length;
const SHEET=layer('sheet',SW,SH);
const ramp=(hex)=>{const c=HEX(hex);return [shade(c,.42),shade(c,.66),c,[Math.min(255,c[0]*1.18+12),Math.min(255,c[1]*1.18+12),Math.min(255,c[2]*1.14+12)]];};
const SK=ramp(C.skin||'#e8b48c'),HR=ramp(C.hair||'#5a3a22'),SHT=ramp(C.shirt||'#b8402c'),PNT=ramp(C.pants||'#3a4e7a'),SHO=ramp(C.shoes||'#3a2618'),EX=ramp(C.extra||'#e8e0cc');
const EYE=HEX(C.eye||'#1a1418');
let L=null,OX=0,OY=0;           // current frame target
const p=(x,y,c)=>P(L,OX+x,OY+y,c);
const g=(x,y)=>G(L,OX+x,OY+y);
function blob(cx,cy,rx,ry,R,lit){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=(x*x)/(rx*rx+.01)+(y*y)/(ry*ry+.01);if(d>1)continue;
    const l=(-x/rx*.55-y/ry*.7);let k=lit===false?1:(l>.45?3:l<-.45?1:2);if(d>.78&&(x>0||y>0))k=Math.max(0,k-1);p(cx+x,cy+y,R[k]);}}
function box(x,y,w,h,R){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let k=2;if(i===0||j===0)k=3;if(i>=w-2)k=1;if(j===h-1)k=1;p(x+i,y+j,R[k]);}}
function limb(x0,y0,x1,y1,w,R){const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),y=Math.round(y0+(y1-y0)*i/n);for(let k=0;k<w;k++)p(x+k-(w>>1),y,R[k===0?3:k===w-1?1:2]);}}
// ---------- human chibi
function human(dir,pose){
  const bob=pose.bob||0,kid=KID,legTop=kid?47:46,footY=FH-5,torsoTop=kid?37:35,torsoH=kid?10:11,hx=FW/2,hy=(kid?24:23)+bob+(pose.crouch||0);
  const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1;
  const tw=side?11:15,tx=hx-(tw>>1);
  // legs + shoes
  const legs=side?[[-2+(pose.legA||0),0],[2+(pose.legB||0),0]]:[[-3,pose.liftA||0],[3,pose.liftB||0]];
  const drawLegs=()=>{for(const [lx,lift] of legs){const x=hx+lx*fl-2;const top=legTop+(pose.crouch||0);const len=footY-top-2+(lift?-1:0)-(pose.sit?4:0);
      if(C.skirt&&!side)continue;box(x,top,4,Math.max(2,len),PNT);box(x-(side?(fl>0?0:1):0),top+len,side?5:5,3,SHO);}};
  // arms
  const armY=torsoTop+2+(pose.crouch||0)+bob;
  const arm=(sx,swing,up)=>{const ex=sx+(up?swing*.4:swing*.3),ey=up?armY-9:armY+8+(pose.crouch?-2:0);limb(sx,armY,ex,ey,3,SHT);blob(Math.round(ex),Math.round(ey)+(up?-1:1),2,2,SK);};
  const back=dir==='N';
  // order: back arm, legs, torso, front arm, head
  if(side)arm(hx-fl*2,-(pose.swing||0)*fl,pose.up);
  drawLegs();
  // torso (with skirt / coat / overalls)
  const ty=torsoTop+bob+(pose.crouch||0);box(tx,ty,tw,torsoH,SHT);
  if(C.coat)box(tx-1,ty+4,tw+2,torsoH+(kid?3:6),SHT);
  if(C.skirt){const sk=ramp(C.skirt);for(let j=0;j<9;j++){const w=tw+Math.round(j*.6);for(let i=0;i<w;i++)p(tx-((w-tw)>>1)+i,ty+torsoH-2+j,sk[i===0?3:i>=w-2?1:2]);}}
  if(C.apron&&!back){box(tx+2,ty+3,tw-4,torsoH+(C.skirt?6:1),EX);}
  if(C.overalls){const ov=ramp(C.overalls);box(tx+(side?1:2),ty+4,tw-(side?2:4),torsoH-3,ov);box(tx,ty+torsoH-2,tw,4,ov);if(!side&&!back){p(tx+3,ty+1,ov[2]);p(tx+tw-4,ty+1,ov[2]);}}
  if(C.collar&&!back){for(let i=-2;i<=2;i++)p(hx+i,ty,[240,240,236]);}
  if(C.badge&&!back&&!side){p(tx+3,ty+3,[240,200,80]);p(tx+4,ty+3,[255,226,120]);p(tx+3,ty+4,[200,150,40]);}
  if(C.plaid&&!back){for(let j=0;j<torsoH;j++)for(let i=0;i<tw;i++)if((i+j)%4===0&&g(tx+i,ty+j))p(tx+i,ty+j,shade(SHT[2],.75));}
  if(!side){arm(tx-1,-(pose.swing||0),pose.up);arm(tx+tw,(pose.swing||0),pose.up);}
  else arm(hx+fl*3,(pose.swing||0)*fl,pose.up);
  if(pose.tool)pose.tool(hx,armY,dir,fl);
  // head: soft-shaded skin, then face, then hair framing it
  const R=kid?11:12,RY=kid?10:11;
  for(let y=-RY;y<=RY;y++)for(let x=-R;x<=R;x++){const d=(x*x)/(R*R)+(y*y)/(RY*RY);if(d>1)continue;
    let k=2;if((x>R*.45&&d>.45)||y>RY-2)k=1;if(x<-R*.25&&y<-RY*.1&&d<.7)k=3;p(hx+x,hy+y,SK[k]);}
  if(!back){
    if(dir==='S'){const ey=hy+2;for(const ex of [hx-5,hx+4]){for(let j=0;j<3;j++){p(ex,ey+j-1,EYE);p(ex+1,ey+j-1,EYE);}if(!C.hollowEyes)p(ex,ey-1,[245,245,245]);
        p(ex-1,ey-3,HR[0]);p(ex,ey-3,HR[0]);p(ex+1,ey-3,HR[0]);}
      p(hx-8,ey+3,[232,132,128]);p(hx-7,ey+3,[232,132,128]);p(hx+7,ey+3,[232,132,128]);p(hx+8,ey+3,[232,132,128]);
      if(C.smile!==false){p(hx-1,ey+5,SK[0]);p(hx,ey+5,SK[0]);p(hx-2,ey+4,SK[1]);p(hx+1,ey+4,SK[1]);}
      if(C.glasses){for(const ex of [hx-7,hx+2]){frame(L,OX+ex,OY+ey-2,5,5,[210,210,220],[80,80,92]);}p(hx-2,ey,[80,80,92]);p(hx+1,ey,[80,80,92]);}
      if(C.beard){for(let y=ey+3;y<=hy+RY;y++)for(let x=-R+2;x<=R-2;x++){if(y-hy>RY-1&&Math.abs(x)>R-5)continue;if((x*x)/(R*R)+((y-hy)*(y-hy))/(RY*RY)>1)continue;p(hx+x,y,HR[(x+y)%4===0?1:2]);}p(hx-1,ey+5,SK[1]);p(hx,ey+5,SK[1]);}}
    else{const ex=hx+fl*6,ey=hy+2;for(let j=0;j<3;j++)p(ex,ey+j-1,EYE);p(ex-fl,ey-3,HR[0]);p(ex,ey-3,HR[0]);
      p(hx+fl*3,ey+3,[232,132,128]);p(hx+fl*4,ey+3,[232,132,128]);
      for(let j=0;j<4;j++){p(hx-fl*1,hy+j,SK[1]);p(hx-fl*2,hy+j,SK[1]);}p(hx-fl*1,hy+1,SK[0]);   // ear
      if(C.glasses){for(let i=-2;i<=2;i++)p(ex+i,ey-2,[110,110,122]);p(ex-fl*3,ey-1,[110,110,122]);}
      if(C.beard){for(let y=ey+3;y<=hy+RY;y++)for(let x=-1;x<=R;x++){const px=hx+x*fl;if((x*x)/(R*R)+((y-hy)*(y-hy))/(RY*RY)>1)continue;p(px,y,HR[(x+y)%4===0?1:2]);}}}}
  hair(hx,hy,R,RY,dir,fl);
  if(C.hat)hat(hx,hy,R,RY,dir);
}
function hair(hx,hy,R,RY,dir,fl){const st=C.hairStyle||'short';const R1=R+1,RY1=RY+1;
  const inHead=(x,y)=>(x*x)/(R1*R1)+(y*y)/(RY1*RY1)<=1;
  const cover=(x,y)=>{if(st==='bald')return dir==='N'?y<2&&Math.abs(x)>3:(dir==='S'?false:(x*fl<-5&&y>-5&&y<3));
    if(dir==='N')return y<RY-2;
    if(dir==='S'){const fringe=-3+((x+20)%4<2?1:0)+(st==='bangs'?2:0);if(Math.abs(x)>R-3)return y<3;return y<fringe;}
    const back=x*fl<-1;return y<-4+((x*fl+20)%4<2?1:0)||(back&&y<RY-3)||(x*fl<3&&y<-1);};
  for(let y=-RY1;y<=RY1;y++)for(let x=-R1;x<=R1;x++){if(!inHead(x,y)||!cover(x,y))continue;
    const l=(-x/R*.45-y/RY*.75);let k=l>.5?3:l<-.25?1:2;if(st!=='bald'&&!cover(x,y+1))k=0;           // dark lower edge where hair meets skin
    if(k===2&&(x*5+y*3)%11===0)k=1;p(hx+x,hy+y,HR[k]);}
  if(st==='long'){const len=C.hairLen||14;for(let y=0;y<len;y++)for(let x=-R;x<=R;x++){if(dir==='S'&&Math.abs(x)<R-3)continue;if((dir==='E'||dir==='W')&&x*fl>-1)continue;
      const k=Math.abs(x)>R-2||y>len-2?1:2;p(hx+x,hy+RY-5+y,HR[k]);}}
  if(st==='bun'){blob(hx+(dir==='E'?-7:dir==='W'?7:0),hy-RY-1,5,4,HR);}
  if(st==='spiky'&&dir!=='N')for(let i=-3;i<=3;i++){p(hx+i*3,hy-RY-2,HR[3]);p(hx+i*3+1,hy-RY-1,HR[2]);p(hx+i*3-1,hy-RY-1,HR[2]);}
}
function hat(hx,hy,R,RY,dir){const h=C.hat;
  if(h==='top'){const H2=ramp('#1c1a20');box(hx-8,hy-RY-12,16,12,H2);for(let i=-13;i<=13;i++){p(hx+i,hy-RY,H2[i<0?3:1]);p(hx+i,hy-RY+1,H2[0]);}hlBand(hx-8,hy-RY-3,16,ramp('#6a1a1a'));}
  if(h==='cap'){const H2=ramp(C.hatColor||'#2a4a7a');for(let y=-RY-2;y<-3;y++)for(let x=-R;x<=R;x++){if((x*x)/(R*R)+(y*y)/((RY+2)*(RY+2))>1)continue;p(hx+x,hy+y,H2[y<-RY+2?3:2]);}
    if(dir==='S')for(let i=-8;i<=8;i++)p(hx+i,hy-3,H2[1]);if(dir==='E'||dir==='W')for(let i=0;i<7;i++)p(hx+(dir==='E'?R-2+i:-R+2-i),hy-3,H2[1]);}
  if(h==='sheriff'){const H2=ramp('#a07848');box(hx-7,hy-RY-7,14,7,H2);for(let i=-15;i<=15;i++){p(hx+i,hy-RY,H2[2]);p(hx+i,hy-RY+1,H2[0]);}for(let i=-7;i<7;i++)p(hx+i,hy-RY-2,[60,40,24]);}
  if(h==='straw'){const H2=ramp('#d8b860');for(let i=-15;i<=15;i++){p(hx+i,hy-RY+1,H2[2]);p(hx+i,hy-RY+2,H2[1]);}box(hx-7,hy-RY-5,14,6,H2);for(let i=-7;i<7;i++)p(hx+i,hy-RY-1,[150,40,30]);}
}
function hlBand(x,y,w,R){for(let i=0;i<w;i++){p(x+i,y,R[2]);p(x+i,y+1,R[1]);}}
// ---------- the Hollow: twice as tall as anyone, stick-thin, a carved gourd for a head
function hollowBody(dir,pose){
  const hx=FW/2,foot=FH-5,hip=foot-58+(pose.crouch||0),sh=hip-46,hy=sh-14+(pose.bob||0);   // eye level ~94 px above the feet
  const side=dir==='E'||dir==='W',fl=dir==='W'?-1:1;const robe=ramp('#16131a'),bone=ramp('#cfc6b4'),gourd=ramp('#c86a1e');
  // legs: long, too thin, knees that bend the wrong way
  const legs=side?[[-3+(pose.legA||0)*1.8,0],[3+(pose.legB||0)*1.8,0]]:[[-5,pose.liftA||0],[5,pose.liftB||0]];
  for(const [lx,lift] of legs){const x=hx+lx*fl,kx=x+fl*4,ky=hip+30-(lift?3:0);limb(hx+(lx>0?2:-2),hip,kx,ky,3,robe);limb(kx,ky,x,foot-1-(lift?2:0),2,robe);for(let i=-2;i<3;i++)p(x+i*fl,foot-(lift?2:0),robe[0]);}
  // robe torso, hunched, tattered hem
  for(let y=sh;y<hip+10;y++){const w=Math.round(7+(y-sh)*.12);for(let x=-w;x<=w;x++){const t=(x+w)/(2*w);let k=t<.3?2:t<.75?1:0;if(y>hip+4&&hsh(x,y,3)>.55)continue;p(hx+x+Math.round((y-sh)*.05*fl),y,robe[k]);}}
  // arms that hang to the knees, long white fingers
  const arm=(sx,swing,up)=>{const ex=sx+swing*.6+(up?swing:0),ey=up?sh-28:hip+22;limb(sx,sh+3,Math.round(ex),ey,3,robe);for(let f=-1;f<=1;f++)limb(Math.round(ex)+f,ey,Math.round(ex)+f*2,ey+(up?-9:9),1,bone);};
  if(!side){arm(hx-8,-(pose.swing||0),pose.up);arm(hx+8,(pose.swing||0),pose.up);}else arm(hx+fl*2,(pose.swing||0)*fl,pose.up);
  // neck + gourd head, carved face glowing from inside (front views)
  limb(hx,sh,hx,hy+9,2,bone);
  for(let y=-11;y<=11;y++)for(let x=-12;x<=12;x++){const d=(x*x)/144+(y*y)/121;if(d>1)continue;const rib=Math.abs(Math.cos(Math.atan2(y,x*1.1)*4))>.92;
    const l=(-x/12*.5-y/11*.7);let k=l>.35?3:l<-.4?1:2;if(rib)k=Math.max(0,k-1);if(d>.8&&(x>0||y>0))k=0;p(hx+x,hy+y,gourd[k]);}
  for(let i=0;i<4;i++)p(hx-1+(i>>1),hy-12-i,[60,40,20]);
  if(dir!=='N'){const glow=[255,120,30],hot=[255,230,140];const eyes=dir==='S'?[hx-6,hx+3]:[hx+fl*5];
    for(const ex of eyes){for(let j=0;j<4;j++)for(let i=0;i<4-j;i++)p(ex+i+(j>>1),hy-3+j,j<2?glow:hot);}
    if(dir==='S'){for(let i=-6;i<=6;i++){const y=hy+5+((i+7)%3===0?1:0);p(hx+i,y,i%2?glow:[30,8,4]);p(hx+i,y+1,(i%3===0)?[240,230,210]:[30,8,4]);}}
    else for(let i=0;i<5;i++)p(hx+fl*(4+i),hy+5,i%2?glow:[30,8,4]);}
}
// ---------- tools
const HOE=(hx,ay,dir,fl,t)=>{};
function toolFor(kind,t,dir){if(!kind)return null;return (hx,ay,dir,fl)=>{const up=t<.5;const a=up?-1.2+t*2*.3:-.9+(t-.5)*2*2.0;
    const len=18,bx=hx+(dir==='W'?-6:dir==='E'?6:5),by=ay-2;const ex=Math.round(bx+Math.cos(a)*len*(dir==='W'?-1:1)),ey=Math.round(by+Math.sin(a)*len);
    if(kind==='hoe'){limb(bx,by,ex,ey,2,ramp('#8a5a30'));for(let i=0;i<5;i++)p(ex+(dir==='W'?-i:i)*(dir==='N'||dir==='S'?0:1),ey+(dir==='N'||dir==='S'?i:0),[150,154,160]);}
    if(kind==='can'){const cx=hx+(dir==='W'?-9:9),cy=ay+4-(up?0:-2);box(cx-4,cy-4,9,7,ramp('#4a8a4a'));limb(cx+(dir==='W'?-4:4),cy-2,cx+(dir==='W'?-9:9),cy+(up?-1:3),2,ramp('#4a8a4a'));
      if(!up)for(let i=0;i<4;i++)p(cx+(dir==='W'?-10:10)+(i%2),cy+4+i*2,[140,200,240]);}};}
// ---------- render every frame of the sheet
const draw=TALL?hollowBody:human;
ROWS.forEach(([clip,dir,nf],r)=>{for(let f=0;f<nf;f++){
  const Lf=layer('f',FW,FH);L=Lf;OX=0;OY=0;const pose={};const ph=(f-1)/8*Math.PI*2;
  if(clip==='walk'&&f>0){const s=Math.sin(ph);pose.bob=(f%4===2||f%4===0)?-1:0;pose.swing=Math.round(s*3);if(dir==='E'||dir==='W'){pose.legA=Math.round(s*2);pose.legB=-Math.round(s*2);}else{pose.liftA=s>.3?1:0;pose.liftB=s<-.3?1:0;}}
  if(clip==='idle')pose.bob=f?0:0;
  if(clip==='thrust'){const t=f/(nf-1);pose.up=t<.5;pose.swing=t<.5?2:4;pose.tool=toolFor(CFG.tool,t,dir);pose.crouch=t>.6?1:0;}
  if(clip==='slash'){pose.swing=[-3,-1,2,5,4,2][f];pose.up=f<2;}
  if(clip==='hurt'){pose.crouch=Math.min(8,f*2);pose.swing=4;}
  if(clip==='spellcast'){pose.up=f>1;pose.swing=f>1?5:1;}
  if(clip==='sit'){pose.crouch=6;pose.sit=true;}
  draw(dir,pose);
  if(TALL&&clip==='hurt'){/* flicker frame */}
  const O=outline(Lf);
  const comp=flatten([O,Lf],FW,FH);
  for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){const c=G(comp,x,y);if(c)P(SHEET,f*FW+x,r*FH+y,c,c[3]);}}});
emit([SHEET],CFG.out);
const clips={};let r=0;for(const [n,ds,nf] of CLIPS){clips[n]={};for(const d of ds)clips[n][d]=[r++,nf];}
console.log('META '+JSON.stringify({fw:FW,fh:FH,ax:FW/2,ay:FH-4,clips}));
