// ---- outdoor props, hand-drawn (#196, #204). Spliced into furn_hd.js before its outline pass by render_props.py, so it
// shares the kit: RAMP, P/G/rect/hl/vl, SH (the #322125 cast shadow), cast/under/contact, tuft, mixC, hsh.
// Light from the upper left. Every prop: a lit top-left rim, a dark lower-right, a solid cast shadow, no gradients.
const clampK=k=>Math.max(0,Math.min(5,k));
const COOL=hexR(['#7d8597'])[0];
const RUB=hexR(['#13151b','#1c1f27','#272b35','#343945','#454b59','#5b6272']);      // tyre rubber, dark blue-grey
const DRUM=hexR(['#171a17','#232822','#323a30','#434d3f','#566251','#6f7b66']);     // a green-grey oil drum
const GALV=hexR(['#1f242b','#2f363f','#434b55','#5a636d','#768089','#97a0a8']);     // galvanised steel
const ENDG=hexR(['#3a2a1a','#5e4428','#8a6a42','#a8875a','#c4a676','#d8be90']);     // split end grain
const POOL=hexR(['#0f1a1e','#17282e','#22393f','#30505a','#4a7380','#8fb5bb']);     // still water
const ell1=(dx,dy,rx,ry)=>(dx*dx)/(rx*rx)+(dy*dy)/(ry*ry);
// (judge props r3: one tuft stamp on every prop; no real shadow) a solid drop shadow, #322125 at 60%, an ellipse under the foot pushed down and right
function drop(x0,x1,base){const cx=(x0+x1)/2+2.5,rx=(x1-x0)/2+3,ry=2.6;for(let y=base-3;y<=base+2;y++)for(let x=x0-2;x<=x1+6;x++){if(ell1(x-cx,y-(base+.2),rx,ry)<=1)SH(x,y,153);}}

if(K==='o_tyres'){   // tyres dumped in a heap: one flat on the ground, one thrown on it off-centre and tilted, one rolled against the heap on its edge; warm-grey lights, a wavy tread, holes going dark
  const base=H-3,RB=hexR(['#141417','#1e1e22','#2a2a2f','#38373c','#4a4848','#64605c']),WL=hexR(['#827c76'])[0];
  // a tyre is its face (an ellipse ring, turned by rot) pushed down th px to make the band
  const tyre=(cx,cy,rx,ry,rot,th)=>{const c=Math.cos(rot),s_=Math.sin(rot);
    const face=(x,y)=>{const dx=x-cx,dy=y-cy,u=dx*c+dy*s_,v=-dx*s_+dy*c;return [ell1(u,v,rx+.4,ry+.4),ell1(u,v,rx*.48,ry*.48),u/rx,v/ry];};
    for(let y=cy-rx-1;y<=cy+rx+th+1;y++)for(let x=cx-rx-2;x<=cx+rx+2;x++){if(face(x,y)[0]<=1)continue;let j=0;for(let k=1;k<=th;k++)if(face(x,y-k)[0]<=1){j=k;break;}if(!j)continue;
      const [,, u]=face(x,y-j);let kk=u<-.5?4:u<.3?3:2;if(j===1&&u<.2)kk=5;if(j===th)kk=0;else if(j===Math.round(th/2)+(((x>>1)+(y>>2))%2))kk=Math.max(0,kk-1);   // the band, a wavy tread line
      P(A,x,y,RB[kk]);}
    for(let y=cy-rx-1;y<=cy+rx+1;y++)for(let x=cx-rx-2;x<=cx+rx+2;x++){const [o,i,u,v]=face(x,y);if(o>1)continue;
      if(i<=1){const far=v<0&&face(x,y+1.4)[1]>1;P(A,x,y,far?RB[1]:RB[0]);continue;}   // the hole: a sliver of the far inside wall, then dark
      const l=-u*.7-v*.7;if(o>.7&&l>.3){P(A,x,y,WL);continue;}   // the lit lip, warm grey
      let k=(o>.7&&l<-.3)?2:4;if(i<1.6)k=1;P(A,x,y,RB[k]);}};   // (judge r7: it bulged like a boulder) a flat sidewall of one tone, a dark bead round the hole
  const ring=(cx,cy,rx,ry,rot,lean)=>{const c=Math.cos(rot),s_=Math.sin(rot);   // a tyre on its edge, seen face-on, its tread showing as a crescent on the side it leans from
    for(let y=cy-ry-2;y<=cy+ry+2;y++)for(let x=cx-rx-3;x<=cx+rx+3;x++){const dx=x-cx-lean,dy=y-cy,u=dx*c+dy*s_,v=-dx*s_+dy*c;if(ell1(u,v,rx+.4,ry+.4)<=1)P(A,x,y,RB[((x+y)>>1)%2?1:2]);}
    for(let y=cy-ry-2;y<=cy+ry+2;y++)for(let x=cx-rx-3;x<=cx+rx+3;x++){const dx=x-cx,dy=y-cy,u=dx*c+dy*s_,v=-dx*s_+dy*c,o=ell1(u,v,rx+.4,ry+.4),i=ell1(u,v,rx*.46,ry*.46);if(o>1)continue;
      if(i<=1){const ii=(y*W+x)*4;A.d[ii]=A.d[ii+1]=A.d[ii+2]=A.d[ii+3]=0;continue;}   // the hole: the ground shows through (kept clear of the outline pass below)
      const l=-(u/rx)*.7-(v/ry)*.7;if(o>.74&&l>.4){P(A,x,y,WL);continue;}let k=l>.4?4:l>-.25?3:2;if(i<1.5)k=Math.max(1,k-1);if(o>.8&&l<-.3)k=1;P(A,x,y,RB[k]);}};
  tyre(14,base-8,10,4,0,5);          // flat on the ground
  tyre(17,base-14,9,5,-.18,4);       // thrown on top, off-centre and tilted up on one side
  ring(31,base-8,6.5,8,.22,-2);      // rolled against the heap on its edge
  {const c=Math.cos(.22),s_=Math.sin(.22);NOOL.push((x,y)=>{const dx=x-31,dy=y-(base-8),u=dx*c+dy*s_,v=-dx*s_+dy*c;return ell1(u,v,6.5*.46,8*.46)<=1;});}
  contact(4,base,32,.7);drop(4,37,base);
  {const c=Math.cos(.22),s_=Math.sin(.22);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=x-31,dy=y-(base-8),u=dx*c+dy*s_,v=-dx*s_+dy*c;if(ell1(u,v,6.5*.46,8*.46)<=1)SHD.d[(y*W+x)*4+3]=y>base-6?70:0;}}}   // the ground through the hole, only lightly shaded

if(K==='o_drum'){   // an upright oil drum, green-grey paint: a lit band left of centre, two rolling hoops, rust running from the chime, a bung in the lid
  const base=H-3,cx=10,rx=8,ry=3,cyT=6,cyB=base-ry;
  for(let x=cx-rx;x<=cx+rx;x++){const t=(x-cx)/rx,e=Math.sqrt(Math.max(0,1-t*t)),yT=cyT+Math.round(ry*e),yB=cyB+Math.round(ry*e);
    let k=t<-.8?3:t<-.55?4:t<-.25?5:t<.15?4:t<.5?3:t<.8?2:1;
    for(let y=yT+1;y<=yB;y++){let kk=k;
      for(const f of [.36,.68]){const yr=Math.round(cyT+(cyB-cyT)*f)+Math.round(ry*e);if(y===yr)kk=clampK(k+1);else if(y===yr+1)kk=Math.max(0,k-2);}   // the rolling hoops
      if(y===yB)kk=Math.max(0,k-2);
      P(A,x,y,DRUM[kk]);}}
  for(let y=cyT-ry;y<=cyT+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const dx=x-cx,dy=y-cyT,o=ell1(dx,dy,rx+.4,ry+.4);if(o>1)continue;
    let c;if(o>.62){c=DRUM[dy>0?(dx<1?5:3):3];}else{c=DRUM[dy<0&&o>.3?1:2];}P(A,x,y,c);}   // the chime ring lit along the front, the lid sunk inside it
  P(A,cx-3,cyT,RAMP.ironW[0]);P(A,cx-2,cyT,RAMP.ironW[0]);P(A,cx-3,cyT-1,DRUM[4]);P(A,cx-2,cyT+1,DRUM[1]);   // the bung
  P(A,cx+3,cyT+1,RAMP.ironW[1]);P(A,cx+3,cyT,DRUM[4]);                                                         // the vent
  const RU=hexR(['#24150c','#3c2412','#5a3418','#77461f','#8f5a2a','#a6703a']);
  for(const [sx,len] of [[cx-1,6],[cx+4,4]]){const t=(sx-cx)/rx,yT=cyT+Math.round(ry*Math.sqrt(1-t*t));for(let j=0;j<len;j++)P(A,sx,yT+1+j,RU[j<2?3:2]);}
  for(const [px,py,k] of [[cx-6,base-3,3],[cx-5,base-3,2],[cx-4,base-2,3],[cx-6,base-2,2],[cx-3,base-3,2],[cx+5,base-4,2],[cx+6,base-3,2]])P(A,px,py,RU[k]);
  P(A,cx-6,cyT+1,RU[3]);P(A,cx+5,cyT+2,RU[2]);
  contact(cx-rx,base,2*rx+1,.75);drop(cx-rx,cx+rx,base);}

if(K==='o_crate'){   // a slatted crate: gaps in the lid with straw showing, three planks across the front, a frame and a Z brace, nail heads
  const base=H-3,R=RAMP.pine,x0=2,w=24,dT=7,hF=15,top=base-hF-dT+1,fy=top+dT,I=RAMP.ironW;
  for(let y=top;y<fy;y++){const r=y-top;for(let x=x0;x<x0+w;x++){let k;
    if(r===0)k=3;else if(r===dT-1)k=5;else if(r===3)k=3;else k=5;   // slats with dark gaps between
    if(r>0&&r<dT-1&&r!==3&&((x*5+r*7)%17)<3)k=4;P(A,x,y,R[k]);}
    P(A,x0,y,R[r===0?2:3]);P(A,x0+w-1,y,R[1]);}
  for(let y=fy;y<fy+hF;y++){const r=(y-fy)%5;for(let x=x0;x<x0+w;x++){let k=r===0?5:r===4?1:4;if(r===2&&((x*3+y)%11)<3)k=3;P(A,x,y,R[k]);}}   // three planks across, a step lighter than the frame
  const stile=(x)=>{for(let y=fy;y<fy+hF;y++){P(A,x,y,R[3]);P(A,x+1,y,R[2]);P(A,x+2,y,R[1]);}};
  stile(x0);stile(x0+w-3);for(let y=fy;y<fy+hF;y++){P(A,x0+w-1,y,R[1]);P(A,x0+3,y,shade(G(A,x0+3,y),.8));}
  const rail=(y)=>{for(let x=x0+3;x<x0+w-3;x++){P(A,x,y,R[3]);P(A,x,y+1,R[2]);P(A,x,y+2,R[1]);const c=G(A,x,y+3);if(c&&y+3<fy+hF)P(A,x,y+3,shade(c,.75));}};
  rail(fy);rail(fy+hF-3);
  const bx0=x0+3,bx1=x0+w-4,by0=fy+hF-4,by1=fy+3;   // the brace runs from the bottom left up to the top right
  for(let x=bx0;x<=bx1;x++){const y=Math.round(by0+(by1-by0)*(x-bx0)/(bx1-bx0));P(A,x,y-1,R[3]);P(A,x,y,R[2]);P(A,x,y+1,R[1]);const c=G(A,x,y+2);if(c&&y+2<fy+hF-3)P(A,x,y+2,shade(c,.75));}
  const nail=(x,y)=>{P(A,x,y,I[4]);P(A,x+1,y+1,I[0]);};
  for(const [nx,ny] of [[x0+1,fy+1],[x0+1,fy+hF-2],[x0+w-2,fy+1],[x0+w-2,fy+hF-2],[x0+5,fy+1],[x0+w-6,fy+1],[x0+5,fy+hF-2],[x0+w-6,fy+hF-2],[x0+1,fy+7],[x0+w-2,fy+7]])nail(nx,ny);
  for(let x=x0;x<x0+w;x++)P(A,x,fy+hF-1,R[0]);
  drop(x0,x0+w,base);}

if(K==='o_lumber'){   // sawn boards in four layers on spacer battens: a straight left edge, boards of different lengths, tan sawn ends, a dark gap under each layer
  const base=H-3,bh=3,dep=5,R=RAMP.pine;
  const layers=[[3,44,0],[3,40,0],[4,45,0],[3,37,0]];   // x0, x1 (judge r4: butt joints read as brick courses)
  const yb=i=>base-i*(bh+1),yf=i=>yb(i)-bh+1;
  for(let i=0;i<layers.length;i++){const [x0,x1]=layers[i];   // the tops first; the layer above covers most of each
    for(let y=yf(i)-dep;y<yf(i);y++){const r=y-(yf(i)-dep);for(let x=x0;x<=x1;x++){let k=[2,3,1,4,5][r];if((r===1||r===3)&&((x*7+i*13)%17)<4)k=Math.max(1,k-1);P(A,x,y,R[k]);}}
    for(let y=yf(i)-dep;y<yf(i);y++){P(A,x0,y,ENDG[3]);P(A,x1,y,ENDG[2]);}}
  for(let i=0;i<layers.length;i++){const [x0,x1,jt]=layers[i];
    for(let y=yf(i);y<=yb(i);y++){const r=y-yf(i);for(let x=x0;x<=x1;x++){let k=[4,3,2][r];P(A,x,y,R[k]);}}   // the front edge, quiet
    if(jt){for(let y=yf(i);y<=yb(i);y++){P(A,x0+jt,y,R[0]);P(A,x0+jt+1,y,ENDG[y===yf(i)?4:3]);}}   // two boards meeting end to end
    for(let y=yf(i);y<=yb(i);y++){P(A,x0,y,ENDG[y===yf(i)?5:4]);P(A,x0+1,y,ENDG[y===yb(i)?2:3]);P(A,x1-1,y,ENDG[y===yf(i)?4:3]);P(A,x1,y,ENDG[y===yf(i)?3:2]);}   // the sawn ends, tan at both
    if(i<layers.length-1){const [ux0,ux1]=layers[i+1],gy=yf(i)-1;   // the gap under the next layer up, and the two battens it rests on
      for(let x=Math.max(x0,ux0);x<=Math.min(x1,ux1);x++)P(A,x,gy,R[0]);
      for(const bx of [ux0+7,ux0+Math.round((ux1-ux0)*.72)]){P(A,bx,gy,ENDG[4]);P(A,bx+1,gy,ENDG[3]);P(A,bx+2,gy,ENDG[2]);}}}
  contact(3,base,43,.75);drop(3,45,base);}

if(K==='o_ladder'){   // the way down in the mine: a ragged shaft cut in the floor, broken stones round its lip, a ladder standing in it with its top poking out and its rungs lost in the dark
  const base=H-3,S=RAMP.stone,R=RAMP.pine,hx0=4,hx1=23,hy0=13,hy1=base-2;
  const top=x=>hy0+Math.round(hsh(x,1,21)*1.6),bot=x=>hy1-Math.round(hsh(x,2,21)*1.6);
  const lft=y=>hx0+Math.round(hsh(y,3,21)*1.6),rgt=y=>hx1-Math.round(hsh(y,4,21)*1.6);
  const inH=(x,y)=>y>=top(x)&&y<=bot(x)&&x>=lft(y)&&x<=rgt(y);
  for(let y=hy0-1;y<=hy1+1;y++)for(let x=hx0-1;x<=hx1+1;x++){if(!inH(x,y))continue;const d=y-top(x);let c=d<4?S[d<1?2:1]:mixC(S[0],[4,3,6],Math.min(1,(d-3)/4));if(d<4&&hsh(x,y,9)<.2)c=S[d<1?3:2];P(A,x,y,c);}   // the far wall facing you, then the drop
  for(let x=hx0-2;x<=hx1+2;x++){for(let y=hy0-3;y<=hy1+3;y++){if(inH(x,y)||G(A,x,y))continue;let near=false;for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]])if(inH(x+dx,y+dy))near=true;if(!near)continue;
    const below=inH(x,y-1);P(A,x,y,S[below?(hsh(x,y,6)<.5?5:4):(inH(x+1,y)?2:3)]);}}   // the lip: the near edge catches the light, the far edge is in shade
  for(const [rx,ry,k] of [[hx0-3,hy0+2,3],[hx0-2,hy0+3,2],[hx1+3,hy1-1,3],[hx1+2,hy1,2],[hx0+5,hy1+3,4],[hx0+6,hy1+3,3],[hx1-3,hy0-3,3],[hx1-4,hy0-3,4],[hx1-4,hy0-4,3]])P(A,rx,ry,S[k]);   // loose stones
  const dkAt=y=>y<=hy0?0:Math.min(1,(y-hy0)/(hy1-hy0)*1.3);
  const rail=(x)=>{for(let y=2;y<=hy1;y++){const dk=dkAt(y);P(A,x,y,mixC(R[4],[6,4,6],dk));P(A,x+1,y,mixC(R[2],[6,4,6],dk));}P(A,x,2,R[5]);P(A,x+1,2,R[4]);};
  const lx=9,rxx=17;rail(lx);rail(rxx);
  for(let y=5;y<=hy1;y+=4){const dk=dkAt(y);for(let x=lx+2;x<rxx;x++){P(A,x,y,mixC(R[4],[6,4,6],dk));P(A,x,y+1,mixC(R[1],[6,4,6],dk));}}
  for(let y=hy0;y<hy0+4;y++){const c=G(A,rxx+2,y);if(c)P(A,rxx+2,y,shade(c,.6));const c2=G(A,lx+2,y);if(c2&&(y-5)%4>1)P(A,lx+2,y,shade(c2,.75));}}

if(K==='o_wheel'){   // a cart wheel stood on end, leaning back against a stake: an iron tyre, felloes lit on the upper left and dark on the lower right, the felloe's thickness showing as a crescent, a proud hub
  const base=H-4,R=RAMP.oak,I=RAMP.ironW,cx=22,cy=base-21,ro=21,ri=16,phi=-.12,sq=.9;
  for(let y=5;y<base-4;y++){P(A,36,y,R[5]);P(A,37,y,R[4]);P(A,38,y,R[2]);P(A,39,y,R[1]);}for(let x=35;x<=40;x++){P(A,x,4,R[x<38?5:3]);P(A,x,3,R[x<38?4:2]);}   // the stake it leans on, capped, lit on the left
  const W2=(x,y)=>{const dx=x-cx,dy=y-cy,u=(dx*Math.cos(phi)+dy*Math.sin(phi))/sq,v=-dx*Math.sin(phi)+dy*Math.cos(phi);return [u,v,Math.hypot(u,v),Math.atan2(v,u)];};
  for(let y=cy-ro-1;y<=cy+ro+1;y++)for(let x=cx-ro-1;x<=cx+ro+3;x++){const [u,v,r]=W2(x-2,y);if(r<=ro+.3&&r>ri-.3){const l=(-u-v)/r;const k=l>.5?3:l>-.3?2:1;P(A,x,y,R[Math.max(0,k-1)]);}}   // the felloe's side, set back
  for(let y=cy-ro-1;y<=cy+ro+1;y++)for(let x=cx-ro-1;x<=cx+ro+1;x++){const [u,v,r,a]=W2(x,y);if(r>ro+.3)continue;const l=(-u-v)/Math.max(1,r);
    if(r>ro-1.7){P(A,x,y,I[l>.6?4:l>.15?3:l>-.4?2:1]);continue;}   // the iron tyre
    if(r>ri){let k=l>.55?5:l>.15?4:l>-.35?3:2;if(r<ri+1.2)k=Math.max(1,k-2);const seg=((a+Math.PI)/(Math.PI/3))%1;if(seg<.06)k=1;P(A,x,y,R[k]);continue;}   // the felloes, six joints
    if(r<5.2){let k=l>.35?5:l>-.25?4:2;if(r>4.2)k=1;if(r<1.6)k=I[0]?1:1;P(A,x,y,r<1.6?I[1]:R[k]);continue;}   // the hub, ringed dark so it stands proud
    const sa=((a+Math.PI)/(Math.PI/6)),f=sa-Math.round(sa);const lit=Math.cos(a+Math.PI*.75);   // twelve spokes
    if(Math.abs(f)*r*(Math.PI/6)<1.1){P(A,x,y,R[f<0?(lit>0?4:3):(lit>0?2:1)]);}}
  for(const [hx,hy] of [[2,2],[3,2],[3,3],[2,3],[4,3]])P(A,cx+hx,cy+hy,R[0]);P(A,cx-2,cy-2,R[5]);P(A,cx-1,cy-2,R[5]);P(A,cx-2,cy-1,R[5]);P(A,cx,cy,I[1]);P(A,cx-1,cy-1,I[4]);   // the hub's nose: a lit cap, its shade, the pin
  contact(cx-8,base,18,.7);drop(cx-9,cx+12,base);}

if(K==='o_firewood'){   // a loose pile of split firewood end-on, no frame: rounds and half-moons of three sizes, dull tan ends brightest at the top left with one dark heart off centre, bark wedges between the logs
  const base=H-3,BK=RAMP.bark,DU=hexR(['#3a2c1e','#5a4630','#7c6446','#957c5a','#ab9270','#c0a886']);
  const rows=[[4,3,5,3,4],[4,4,3,4],[3,4,3],[3]],types={1:'half',4:'half',7:'half',10:'half'};
  const placed=[];let n=0;
  rows.forEach((row,ri)=>{let xs;if(ri===0){xs=[];let x=2;for(const r of row){x+=r;xs.push(x);x+=r;}}else{const prev=placed.filter(p=>p.ri===ri-1);xs=row.map((r,i)=>Math.round((prev[i].cx+prev[i+1].cx)/2));}
    row.forEach((r,i)=>{const cx=xs[i];let cy=base-r;for(const q of placed){const dx=Math.abs(q.cx-cx);if(dx<q.r+r-.5)cy=Math.min(cy,q.cy-Math.round(Math.sqrt(Math.max(0,(q.r+r-.6)**2-dx*dx))));}
      cy=Math.max(cy,r+1);placed.push({cx,cy,r,ri,type:types[n]||'round',rot:n%2});n++;});});
  for(const p of placed)for(let y=p.cy-p.r-1;y<=p.cy+p.r+1;y++)for(let x=p.cx-p.r-1;x<=p.cx+p.r+1;x++){const dx=x-p.cx,dy=y-p.cy;if(dx*dx+dy*dy>(p.r+1.3)**2)continue;
    const l=-(dx+dy)/(p.r+1);P(A,x,y,BK[l>.6?3:l>-.2?2:1]);}   // the bark: the logs' sides and the wedges between them
  for(const p of placed){const {cx,cy,r,type,rot}=p;
    for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++){const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy>(r-.35)**2)continue;if(type==='half'&&(rot?dx<0:dy<0))continue;
      const l=-(dx+dy)/(r*1.5);P(A,x,y,DU[l>.4?4:l>-.3?3:2]);}
    P(A,cx+1,cy+(type==='half'&&!rot?1:0),DU[1]);}   // the heart, off centre
  for(const [cx2,y2,k] of [[3,base,2],[4,base,3],[39,base,2],[37,base+1,3]])P(A,cx2,y2,BK[k]);   // chips of bark at the foot
  contact(2,base,38,.75);drop(2,40,base);}

if(K==='o_trash'){   // a galvanised trash can with straight sides, two ribs that bow round it, a dent on the right, and a domed lid lighter than the body with a handle
  const base=H-3,cx=10,rx=7,ry=3,cyT=11,cyB=base-ry,E=GALV;
  for(let x=cx-rx;x<=cx+rx;x++){const t=(x-cx)/rx,e=Math.sqrt(Math.max(0,1-t*t)),yT=cyT+Math.round(ry*e),yB=cyB+Math.round(ry*e);
    let k0=t<-.8?2:t<-.5?3:t<-.2?4:t<.2?3:t<.55?2:1;
    for(let y=yT+1;y<=yB;y++){let k=k0;
      for(const g of [.3,.64]){const yr=Math.round(cyT+(cyB-cyT)*g)+Math.round(ry*e);if(y===yr)k=clampK(k0+2);else if(y===yr+1)k=Math.max(0,k0-1);}
      const ddx=(x-(cx+3))/2.4,ddy=(y-(cyT+12))/2.2;if(ddx*ddx+ddy*ddy<1)k=clampK(k+((ddx+ddy)<0?-2:1));   // the dent
      if(y>=yB-2&&hsh(x,y,6)<.35)k=Math.max(0,k-1);if(y===yB)k=Math.max(0,k-2);
      P(A,x,y,E[k]);}}
  for(let y=cyT-ry-3;y<=cyT+ry+1;y++)for(let x=cx-rx-1;x<=cx+rx+1;x++){const dx=x-cx,dy=y-cyT;const o=ell1(dx,dy,rx+.7,ry+.9);const dome=ell1(dx,dy+1.3,rx-2.2,ry);if(o>1&&dome>1)continue;
    let k;if(dome<=1)k=(dx<-1&&dy<0)?5:dx>3?3:4;else k=dy>0?(dx<1?4:2):3;P(A,x,y,E[k]);}   // the lid: a lit dome inside a rim
  for(let x=cx-2;x<=cx+2;x++)P(A,x,cyT-ry-4,E[x<cx?5:3]);P(A,cx-3,cyT-ry-3,E[4]);P(A,cx+3,cyT-ry-3,E[2]);   // the handle
  P(A,cx-rx-1,cyT+6,E[4]);P(A,cx-rx-1,cyT+7,E[2]);P(A,cx+rx+1,cyT+6,E[2]);P(A,cx+rx+1,cyT+7,E[0]);   // the side grips
  contact(cx-rx,base,2*rx+1,.75);drop(cx-rx,cx+rx,base);}

if(K==='o_birdbath'){   // a stone birdbath: a basin with a lit lip and a darker underside, still water with a sky glint and a fallen leaf, a column with one moulding, moss at the foot
  const base=H-3,S=RAMP.stone,cx=14,Gr=RAMP.green;
  for(let y=base-4;y<=base;y++)for(let x=cx-7;x<=cx+7;x++){const t=(x-cx)/7;let k=y===base-4?(t<.2?5:3):t<-.5?4:t<.3?3:2;if(y===base)k=1;P(A,x,y,S[k]);}   // the foot
  for(let y=19;y<base-4;y++)for(let x=cx-3;x<=cx+3;x++){const t=(x-cx)/3;let k=t<-.6?3:t<0?4:t<.6?3:1;if(y===26)k=Math.min(5,k+1);if(y===27)k=Math.max(0,k-2);P(A,x,y,S[k]);}   // the column, one moulding
  for(let x=cx-4;x<=cx+4;x++){P(A,x,19,S[x<cx?4:2]);P(A,x,20,S[x<cx?3:1]);}
  const rx=12,ry=4,cyT=12;
  for(let x=cx-rx;x<=cx+rx;x++){const t=(x-cx)/rx,e=Math.sqrt(Math.max(0,1-t*t)),yl=cyT+Math.round(ry*e),uh=Math.round(1+4*e);for(let j=1;j<=uh;j++){const k=t<-.5?2:t<.25?1:0;P(A,x,yl+j,S[j===uh&&t<0?k+1:k]);}}   // the underside, in shade
  for(let y=cyT-ry;y<=cyT+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const dx=x-cx,dy=y-cyT,o=ell1(dx,dy,rx+.4,ry+.4),i=ell1(dx,dy,rx-2,ry-1.3);if(o>1)continue;
    if(i>1){const l=-(dx/rx)*.6-(dy/ry)*.8;let k=dy>0?(dx<3?4:3):(l>.3?5:3);if(o>.8&&dy>0&&dx<0)k=5;P(A,x,y,S[k]);continue;}   // the lip
    const far=ell1(dx,dy+1.3,rx-2,ry-1.3)>1&&dy<0;P(A,x,y,far?S[1]:POOL[dy<0?2:3]);}   // the inside wall, then water
  for(const [gx,gy] of [[-6,-1],[-5,-1],[-4,0],[-3,0]])P(A,cx+gx,cyT+gy,POOL[gx<-4?5:4]);   // a glint of sky
  for(const [lx,ly,k] of [[3,1,4],[4,1,3],[4,0,4],[5,1,2]])P(A,cx+lx,cyT+ly,RAMP.pumpkin[k]);   // a leaf, floating
  for(const [mx,my,k] of [[-10,1,3],[-9,2,2],[-11,1,2],[-6,base-cyT-3,3],[-5,base-cyT-3,2],[-7,base-cyT-2,2],[5,base-cyT-1,2]])P(A,cx+mx,cyT+my,Gr[k]);   // moss
  drop(cx-7,cx+7,base);}

if(K==='o_signpost'){   // a fingerpost: a weathered post with a capped top, two arrow boards in old cream paint with painted lettering, chips showing the wood
  const base=H-3,R=RAMP.oak,C=RAMP.cream,px=18;
  for(let y=6;y<=base;y++){P(A,px,y,R[4]);P(A,px+1,y,R[3]);P(A,px+2,y,R[2]);P(A,px+3,y,R[1]);if(y%9===3)P(A,px+1,y,R[2]);}
  for(let x=px-1;x<=px+4;x++){P(A,x,5,R[x<px+1?5:3]);P(A,x,4,R[x<px+2?5:4]);}P(A,px+1,3,R[5]);P(A,px+2,3,R[4]);
  const glyphs=['11|01|11','101|101|111','010|111|010','11|11|10','111|001|011','10|11|10','011|110|011','1|1|1'];
  const board=(x0,x1,y0,dir,seed)=>{const h=7;
    for(let y=y0;y<y0+h;y++){const r=y-y0,mid=y0+3,ins=3-Math.abs(y-mid);for(let x=x0;x<=x1;x++){
      if(dir<0&&x<x0+3-ins)continue;if(dir>0&&x>x1-3+ins)continue;
      let c=r===0?C[4]:r===h-1?R[1]:C[2];if(r===1)c=C[3];
      if(r>0&&r<h-1&&hsh(x,y,seed)<.08)c=R[3];   // paint worn through
      P(A,x,y,c);}}
    let x=dir<0?x0+5:x0+3;const end=dir<0?x1-2:x1-5;let gi=seed;
    while(x+2<end){if(hsh(gi,1,seed)<.18){x+=2;gi++;continue;}const g=glyphs[(gi*5+seed)%glyphs.length].split('|');for(let j=0;j<3;j++)for(let i=0;i<g[j].length;i++)if(g[j][i]==='1')P(A,x+i,y0+2+j,R[0]);x+=g[0].length+1;gi++;}
    for(let x=x0+1;x<x1;x++){const c=G(A,x,y0+h);if(!c&&x>px-2&&x<px+5)continue;}
    for(let y=y0;y<y0+h;y++){P(A,px+4,y+1,shade(G(A,px+4,y+1)||R[1],.8));}};
  board(2,26,9,-1,3);board(12,37,19,1,7);
  for(const [nx,ny] of [[px+1,12],[px+1,22]]){P(A,nx,ny,RAMP.ironW[1]);P(A,nx-1,ny-1,C[5]);}
  drop(px,px+3,base);}

if(K==='o_hay'){   // three bales in muted straw: lit tops with strands along them, bristly cut ends, two twine bands each, loose straws
  const base=H-3,Y=hexR(['#2e2614','#4a3e22','#6a5a32','#857245','#9d8a58','#b3a070']),TW=hexR(['#2a2016','#4a3828']);
  const bale=(x0,top,w,dT,hF,seed)=>{
    for(let y=top;y<top+dT;y++)for(let x=x0;x<x0+w;x++){let k=y===top?3:y===top+dT-1?5:4;if(hsh(x>>1,y,seed)<.22)k=Math.max(2,k-1);else if(hsh(x>>1,y,seed+1)<.15)k=5;P(A,x,y,Y[k]);}   // the top, strands along it
    const fy=top+dT;for(let y=fy;y<fy+hF;y++)for(let x=x0;x<x0+w;x++){let k=x<x0+2?3:x>x0+w-3?1:2;const r=hsh((x+y*3)>>2,y,seed+2);if(r<.25)k=Math.min(4,k+1);else if(r>.82)k=Math.max(0,k-1);if(y===fy)k=Math.min(5,k+1);if(y===fy+hF-1)k=Math.max(0,k-1);P(A,x,y,Y[k]);}
    for(let y=top+1;y<fy+hF-1;y+=2){if(hsh(y,1,seed)<.6)P(A,x0-1,y,Y[3]);if(hsh(y,2,seed)<.5)P(A,x0+w,y,Y[1]);}   // bristly cut ends
    for(const f of [.3,.7]){const tx=x0+Math.round(w*f);for(let y=top;y<top+dT;y++)P(A,tx,y,TW[1]);for(let y=fy;y<fy+hF;y++)P(A,tx,y,TW[0]);P(A,tx,fy,TW[1]);}   // the twine
    return fy+hF;};
  bale(3,base-11-9+1,28,6,11-2,3);bale(31,base-9-6+1,12,5,9,5);   // the bottom row
  bale(6,base-11-9+1-14,24,6,9,7);                                   // one stacked on top
  for(const [sx,sy,dx] of [[2,base,1],[44,base-1,-1],[20,base+1,1],[29,base-17,1]]){P(A,sx,sy,Y[3]);P(A,sx+dx,sy-1,Y[4]);}   // loose straws
  contact(3,base,40,.75);drop(3,43,base);}

if(K==='o_parkbench'){   // a park bench: slatted back and seat with a gap of air between, cast-iron ends whose arms roll over at seat height
  const base=H-3,R=RAMP.oak,I=RAMP.ironW,x0=6,x1=55,sy=base-17,bk0=base-34;
  const slat=(y,h,k)=>{for(let x=x0;x<=x1;x++)for(let j=0;j<h;j++){let kk=j===0?k+1:j===h-1?k-2:k;if(((x*7+y*3)%23)<3&&j===1)kk=k-1;P(A,x,y+j,R[Math.max(0,Math.min(5,kk))]);}P(A,x0,y+1,R[5]);P(A,x1,y+1,R[1]);};
  for(const ux of [x0+1,x1-2]){for(let y=bk0-1;y<sy;y++){P(A,ux,y,I[3]);P(A,ux+1,y,I[1]);}}   // the back uprights
  slat(bk0,4,3);slat(bk0+6,4,3);                                   // the back, two boards
  for(let y=sy;y<sy+8;y++){const r=y-sy;for(let x=x0-1;x<=x1+1;x++){let k=[3,4,1,4,5,1,4,5][r];if(r%3===1&&((x*5+r)%19)<3)k--;P(A,x,y,R[k]);}}   // the seat from above: three slats with dark gaps
  for(let x=x0-1;x<=x1+1;x++){P(A,x,sy+8,R[2]);P(A,x,sy+9,R[1]);}   // its front edge
  for(let y=sy+10;y<=base;y++)for(let x=x0+3;x<=x1-3;x++)if(y<sy+13)SH(x,y,120);   // shade under the seat
  const end=(ax,dir)=>{for(let y=sy+8;y<=base;y++){const lx=ax+(y>base-3?dir*(base-3-y)*-1:0);P(A,lx,y,I[3]);P(A,lx+1,y,I[1]);}   // the front leg, its foot kicked out
    for(let y=sy-5;y<sy+1;y++){P(A,ax,y,I[3]);P(A,ax+1,y,I[1]);}   // the arm post
    for(let x=ax-4;x<=ax+3;x++){P(A,x,sy-6,I[x<ax?4:3]);P(A,x,sy-5,I[1]);}   // the arm, level at seat height plus a hand
    const rx=ax+(dir<0?-4:3);P(A,rx,sy-7,I[4]);P(A,rx+dir,sy-6,I[3]);P(A,rx+dir,sy-5,I[2]);P(A,rx,sy-4,I[1]);P(A,rx-dir,sy-5,I[0]);};   // the roll at its front
  end(x0+1,-1);end(x1-2,1);
  contact(x0,base,x1-x0+1,.7);drop(x0,x1,base);}

if(K==='o_pumpkin'){   // a field pumpkin: five lobes with dark rib grooves curving round it, lit on the upper left, a dry stem
  const base=H-3,PK=hexR(['#2e1508','#4c2410','#723816','#934a1e','#ad5f2a','#c27a3c']),cx=12,cy=base-8,rx=11,ry=8;
  for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++){const dx=x-cx,dy=y-cy;if(ell1(dx,dy,rx+.4,ry+.4)>1)continue;
    const e=Math.sqrt(Math.max(.05,1-(dy/ry)**2)),u=dx/(rx*e);   // u: -1..1 across the curve at this height
    const lobe=Math.floor((u+1)/2*5-1e-6),f=((u+1)/2*5)%1;let k=lobe<=1?4:lobe===2?3:lobe===3?2:1;
    if(f<.2||f>.86)k=Math.max(0,k-2);else if(f<.45&&lobe<3)k=Math.min(5,k+1);   // grooves dark, each lobe lit on its left
    if(dy<-ry*.55)k=Math.max(1,k-1);if(dy>ry*.6)k=Math.max(0,k-1);
    P(A,x,y,PK[k]);}
  for(let x=cx-3;x<=cx+3;x++)P(A,x,cy-ry,PK[1]);   // the dip round the stem
  for(const [sx,sy,c] of [[cx,cy-ry-1,'#6a5a30'],[cx,cy-ry-2,'#7a6a38'],[cx+1,cy-ry-3,'#8a7a44'],[cx+2,cy-ry-3,'#5a4a26'],[cx-1,cy-ry-1,'#8a7a44']])P(A,sx,sy,hexR([c])[0]);
  contact(cx-rx,base,2*rx,.75);drop(cx-rx,cx+rx,base);}

if(K==='o_clothesline'){   // a clothesline: T-topped posts, a sagging line, a shirt, a sheet, trousers and a towel hung with pegs, each with folds lit on the left
  const base=H-3,R=RAMP.oak,P1=4,P2=W-8,ly0=9;
  const post=x=>{for(let y=ly0-2;y<=base;y++){P(A,x,y,R[4]);P(A,x+1,y,R[3]);P(A,x+2,y,R[1]);}for(let i=-3;i<=5;i++){P(A,x+i,ly0-3,R[i<1?5:4]);P(A,x+i,ly0-2,R[2]);}};
  post(P1);post(P2);
  const lineY=x=>ly0+Math.round(6*(1-((x-(P1+P2)/2)/((P2-P1)/2))**2));
  for(let x=P1+3;x<P2;x++)P(A,x,lineY(x),hexR(['#c8c0a8'])[0]);
  const peg=x=>{const y=lineY(x);P(A,x,y-1,RAMP.pine[5]);P(A,x,y,RAMP.pine[4]);P(A,x,y+1,RAMP.pine[3]);P(A,x+1,y,RAMP.pine[2]);};
  const cloth=(x0,x1,len,ramp,shape,folds)=>{for(let x=x0;x<=x1;x++){const top=lineY(x)+1,t=(x-x0)/(x1-x0);let L=len(t);
      for(let y=top;y<top+L;y++){const ph=Math.sin(t*Math.PI*folds);let k=ph>.45?4:ph>-.2?3:2;if(x===x0)k=Math.min(5,k+1);if(x===x1)k=1;if(y===top+L-1)k=Math.max(1,k-1);
        if(shape&&!shape(t,y-top))continue;P(A,x,y,ramp[k]);}
      if(L>4)SH(x+5,base-1+Math.round(t),70);}   // a faint shade of it on the grass below
    peg(x0+1);peg(x1-1);};
  const SHIRT=hexR(['#1c2330','#2a3446','#3c4a60','#4e5e78','#64748e','#7c8ca4']),SHEET=hexR(['#4a473e','#6e6a5c','#8e8a78','#aaa592','#c0bba6','#d2cdb8']);
  const TRS=hexR(['#211c16','#342c22','#4a3f30','#5e5240','#726552','#877a66']),TOW=hexR(['#2a1210','#461c18','#662a22','#82382c','#9c4a3a','#b05e4c']);
  cloth(14,32,t=>18,SHIRT,(t,y)=>!(y>6&&(t<.2||t>.8))&&!(y<2&&t>.4&&t<.6),2.5);   // a shirt: sleeves stop short, a collar notch
  cloth(38,62,t=>30+Math.round(2*Math.sin(t*5)),SHEET,null,3.5);                   // a sheet, its hem lifting in the wind
  cloth(68,80,t=>22,TRS,(t,y)=>!(y>5&&t>.4&&t<.6),2);                               // trousers: two legs
  cloth(86,98,t=>15,TOW,null,1.5);for(const yy of [11,13])for(let x=86;x<=98;x++){const y=lineY(x)+1+yy;if(G(A,x,y))P(A,x,y,SHEET[3]);}   // a towel with two stripes
  drop(P1,P1+2,base);drop(P2,P2+2,base);}

if(K==='b_boot'){   // (benches fam r2: a full-height board read as a hutch) a low cobbler's seat-bench: a short tool rail, a lit seat, one warm tan boot on an iron last as the brightest shape, a tin of tacks and a pot of wax
  const base=H-3,R=RAMP.walnut,I=RAMP.ironW,TN=hexR(['#3a2414','#5a3a20','#7c5430','#9c6e40','#b88a54','#cfa56c']);
  const x0=5,w=48,top=base-17;
  for(const px_ of [x0+w-12,x0+w-4])for(let y=top-11;y<top;y++){P(A,px_,y,R[4]);P(A,px_+1,y,R[3]);P(A,px_+2,y,R[1]);}   // a short rail at the far end only
  for(let x=x0+w-13;x<x0+w-1;x++){P(A,x,top-12,R[5]);P(A,x,top-11,R[3]);P(A,x,top-10,R[1]);}
  for(const [tx,len,c] of [[x0+w-9,6,I[4]],[x0+w-7,4,I[3]],[x0+w-5,5,RAMP.oak[4]]]){for(let j=0;j<len;j++)P(A,tx,top-9+j,c);}   // awls and a knife hanging from it
  box3(x0,top,w,6,4,R,{faceK:3});for(let x=x0+2;x<x0+w-2;x++){SH(x,top+10,220);SH(x,top+11,150);}   // the seat: a 6 px lit plane
  for(const lx of [x0+1,x0+w-4])for(let y=top+10;y<base;y++){P(A,lx,y,R[4]);P(A,lx+1,y,R[2]);P(A,lx+2,y,R[1]);}
  for(let x=x0+4;x<x0+w-4;x++){P(A,x,base-5,R[4]);P(A,x,base-4,R[1]);}   // the lower shelf
  for(const [sx,c] of [[x0+9,0],[x0+15,1],[x0+21,0]]){for(let y=base-10;y<base-5;y++)for(let i=0;i<4;i++)P(A,sx+i,y,TN[i===0?3:i===3?0:1]);hl(A,sx,base-10,4,TN[3]);}   // boot lasts waiting on the shelf, dark, a hue off the wood
  {const tx=x0+6,ty=top-2;for(let y=ty;y<ty+3;y++)for(let x=tx;x<tx+5;x++)P(A,x,y,I[x===tx?4:x===tx+4?1:3]);hl(A,tx,ty,5,I[5]);}   // a tin of tacks
  {const wx=x0+13,wy=top-1;for(let y=wy;y<wy+2;y++)for(let x=wx;x<wx+3;x++)P(A,x,y,RAMP.straw[y===wy?4:2]);}   // a cake of wax
  {const lx=26,ly=top+2;for(let y=ly-6;y<ly+1;y++){P(A,lx,y,I[3]);P(A,lx+1,y,I[1]);}   // the iron last's post, and the tan boot on it, the brightest thing on the bench
    const bx=lx-3,by=ly-6;for(let y=by-9;y<by;y++)for(let i=0;i<5;i++)P(A,bx+i,y,TN[i===0?5:i===4?2:4]);hl(A,bx,by-9,5,TN[5]);
    for(let y=by;y<by+4;y++)for(let i=0;i<12;i++){if(i>9&&y===by)continue;P(A,bx+i,y,TN[y===by?5:i===11?2:4]);}
    hl(A,bx,by+4,12,RAMP.charcoal[1]);P(A,bx,by+3,RAMP.charcoal[0]);P(A,bx+1,by+3,RAMP.charcoal[0]);
    for(const [dx,dy] of [[2,-7],[3,-6],[2,-4],[3,-3],[4,-1],[5,0]])P(A,bx+dx,by+dy,TN[1]);}
  contact(x0,base,w,.7);drop(x0,x0+w,base);}
