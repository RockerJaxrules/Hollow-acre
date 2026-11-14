/* ================= t325 butchery and automation, judged. The knife game at the butcher's block, redrawn and made to feel
   like the job: a plucked hen on her back and a side of beef, drawn by hand-placed shapes (no blobs), lying on a real end-grain
   block; the knife opens each seam, a little juice runs, and when a seam is through the piece comes away from the rest with a
   wet chop. Then the cuts go onto the pan of a hanging butcher's scale, one by one, until the needle settles on the mark.
   All of it wraps the existing steps (S4.trace for the 'hen' and 'beef' surfaces, S4.scale with sp.meat), so nothing else
   changes. ================= */
const BT3={};
// ---- ramps (hue-shifted: shadows toward mauve and plum, lights toward warm cream)
BT3.SKIN=['#56383e','#7a5a60','#a07e80','#c4a29e','#dfc2ba','#efd9d0','#f9ebe4'];
BT3.SKO='#3a2228';
BT3.BONE=['#7c6c58','#b4a284','#d8ccae','#efe6cf','#fbf7ec'];
BT3.MEAT=['#2e0a10','#4e1219','#741e26','#962c32','#b4443f','#cc6656','#e08b74'];
BT3.FAT=['#8e7a5e','#c2ad88','#ddd0b0','#eee6cf','#fbf6e8'];
BT3.MO='#1e0608';
// ---- a mask drawn as a set of filled shapes, then shaded pixel by pixel
BT3.mk=(w,h)=>({w,h,m:new Uint8Array(w*h),c:new Array(w*h).fill(null)});
BT3.ell=(M,cx,cy,rx,ry,id)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){if(x<0||y<0||x>=M.w||y>=M.h)continue;
  const d=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2;if(d<=1)M.m[y*M.w+x]=id;}};
BT3.cap=(M,x0,y0,x1,y1,r0,r1,id)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2);for(let i=0;i<=n;i++){const u=i/n;BT3.ell(M,x0+(x1-x0)*u,y0+(y1-y0)*u,r0+(r1-r0)*u,r0+(r1-r0)*u,id);}};
BT3.poly=(M,pts,id)=>{const ys=pts.map(p=>p[1]);for(let y=Math.max(0,Math.floor(Math.min(...ys)));y<=Math.min(M.h-1,Math.ceil(Math.max(...ys)));y++){const xs=[];const yy=y+.5;
  for(let i=0;i<pts.length;i++){const [ax,ay]=pts[i],[bx,by]=pts[(i+1)%pts.length];if((ay<=yy&&by>yy)||(by<=yy&&ay>yy))xs.push(ax+(yy-ay)/(by-ay)*(bx-ax));}xs.sort((a,b)=>a-b);
  for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.round(xs[k]));x<Math.min(M.w,Math.round(xs[k+1]));x++)M.m[y*M.w+x]=id;}};
// a smooth closed outline through control points (Catmull-Rom), as a polygon
BT3.smooth=(pts,n)=>{const out=[];n=n||8;const L=pts.length;for(let i=0;i<L;i++){const p0=pts[(i-1+L)%L],p1=pts[i],p2=pts[(i+1)%L],p3=pts[(i+2)%L];
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;out.push([0,1].map(j=>.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3)));}}return out;};
BT3.in=(M,x,y)=>x>=0&&y>=0&&x<M.w&&y<M.h&&M.m[y*M.w+x]>0;
// paint the mask into a canvas: f(x,y,id) returns a colour; then a one-pixel outline in o
BT3.paint=(M,f,o)=>{const c=document.createElement('canvas');c.width=M.w;c.height=M.h;const g=c.getContext('2d');
  for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const id=M.m[y*M.w+x];if(!id)continue;const col=f(x,y,id);if(!col)continue;g.fillStyle=col;g.fillRect(x,y,1,1);}
  if(o){g.fillStyle=o;for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){if(M.m[y*M.w+x])continue;if(BT3.in(M,x-1,y)||BT3.in(M,x+1,y)||BT3.in(M,x,y-1)||BT3.in(M,x,y+1))g.fillRect(x,y,1,1);}}
  return c;};
const bt3pick=(P,l)=>P[Math.max(0,Math.min(P.length-1,Math.round(l)))];
// ---- a height field: each part a dome; where parts meet, the field folds into a crease; lit from the top left
BT3.hf=(w,h)=>({w,h,H:new Float32Array(w*h),id:new Uint8Array(w*h)});
BT3.dome=(F,cx,cy,rx,ry,top,id,pow)=>{for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){if(x<0||y<0||x>=F.w||y>=F.h)continue;
  const d=((x+.5-cx)/rx)**2+((y+.5-cy)/ry)**2;if(d>1)continue;const v=top*Math.pow(1-d,pow||.5);const i=y*F.w+x;if(v>F.H[i]||!F.id[i]){if(!F.id[i]||v>F.H[i]){F.H[i]=Math.max(F.H[i],v);F.id[i]=id;}}}};
BT3.limb=(F,x0,y0,x1,y1,r0,r1,top0,top1,id)=>{const n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2);for(let i=0;i<=n;i++){const u=i/n;BT3.dome(F,x0+(x1-x0)*u,y0+(y1-y0)*u,r0+(r1-r0)*u,r0+(r1-r0)*u,top0+(top1-top0)*u,id);}};
BT3.lightOf=(F,x,y)=>{const H=(X,Y)=>X<0||Y<0||X>=F.w||Y>=F.h?0:F.H[Y*F.w+X];const nx=(H(x-1,y)-H(x+1,y))*.5,ny=(H(x,y-1)-H(x,y+1))*.5,nz=.16;const L=Math.hypot(nx,ny,nz);
  return (nx*-.55+ny*-.62+nz*.56)/L;};
BT3.fmask=F=>{const M=BT3.mk(F.w,F.h);for(let i=0;i<F.w*F.h;i++)M.m[i]=F.id[i];return M;};
// ---- THE HEN: plucked, on her back on the block, the neck end at the top; the thighs bulge at the lower sides and the
// drumsticks lie along her, their knuckles meeting at the tail; the wings are folded tight at the shoulders
BT3.henField=()=>{if(BT3._hf)return BT3._hf;const F=BT3.hf(156,108);
  BT3.dome(F,40,30,15,11,7,6);BT3.dome(F,116,30,15,11,7,7);                 // wings, folded at the shoulders
  BT3.limb(F,30,36,24,46,6,3,5,3,6);BT3.limb(F,126,36,132,46,6,3,5,3,7);     // the wing tips tucked back
  BT3.dome(F,78,48,40,36,22,1,.55);                                          // the breast
  BT3.dome(F,50,64,19,17,15,2);BT3.dome(F,106,64,19,17,15,4);               // thighs
  BT3.limb(F,46,72,66,96,8,4.5,12,6,3);BT3.limb(F,110,72,90,96,8,4.5,12,6,5);// drumsticks to the tail
  BT3.dome(F,67,98,4.5,3.5,7,8);BT3.dome(F,89,98,4.5,3.5,7,8);              // the knuckles
  BT3.dome(F,78,13,9,5,6,9);                                                 // the neck flap
  return BT3._hf=F;};
BT3.henParts=()=>BT3.fmask(BT3.henField());
BT3.henShade=()=>{const F=BT3.henField();return (x,y,id)=>{const l=BT3.lightOf(F,x,y);
    if(id===8){return bt3pick(BT3.BONE,2+l*2.4);}
    let k=3.3+l*3.4;
    // the keel down the breast: a lit ridge, its shade to the right
    if(id===1){const dx=x+.5-78;if(y>20&&y<64){if(Math.abs(dx)<.9)k+=.9;else if(dx>=.9&&dx<2.4)k-=.9;}}
    // where the wing folds: one joint line
    if((id===6||id===7)&&Math.abs((y-31)-Math.abs(x-78)*.0-((x<78)?(40-x)*.35:(x-116)*.35))<.6)k-=1;
    if(id===1&&k>3.2&&k<4.6&&(x+((y>>2)%2)*2)%4===0&&y%4===1&&Math.abs(x-78)>3)k-=.7;
    return bt3pick(BT3.SKIN,k);};};
BT3.hen=()=>M4.pre('bt3hen3',156,108,(K,g)=>{const M=BT3.henParts();g.drawImage(BT3.paint(M,BT3.henShade(),BT3.SKO),0,0);
  // the pores of plucked skin as a few short darker dashes on the thighs, never specks
  for(const [x,y] of [[44,58],[49,62],[42,66],[108,58],[103,62],[110,66]])K.px(x,y,2,1,BT3.SKIN[2]);});
BT3.henMask=()=>BT3._hm||(BT3._hm=BT3.henParts());
// ---- THE SIDE OF BEEF, hanging from the rail by a hook through the hock, the inside face to you: the round (the hind leg) at
// the top, the loin with its white lump of suet by the spine, the ribs bowing across, the chuck at the bottom where the neck
// was cut; the sawn spine runs down the left edge and the thin streaky flank down the right
BT3.beefOutline=()=>BT3.smooth([[42,0],[52,0],[53,12],[60,22],[69,33],[77,46],[79,58],[75,70],[80,84],[87,98],[88,112],[84,124],[86,132],[78,140],[68,147],[58,153],[48,155],[38,152],[27,144],[18,134],[11,120],[9,104],[10,88],[12,72],[16,54],[24,38],[34,23],[41,12]],6);
BT3.beefField=()=>{if(BT3._bf)return BT3._bf;const F=BT3.hf(100,156);const M=BT3.mk(100,156);BT3.poly(M,BT3.beefOutline(),1);
  const dist=new Float32Array(M.w*M.h).fill(99),q=[];
  for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const i=y*M.w+x;if(!M.m[i])continue;if(!BT3.in(M,x-1,y)||!BT3.in(M,x+1,y)||!BT3.in(M,x,y-1)||!BT3.in(M,x,y+1)){dist[i]=0;q.push(i);}}
  for(let h=0;h<q.length;h++){const i=q[h],x=i%M.w,y=(i/M.w)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(!BT3.in(M,X,Y))continue;const j=Y*M.w+X;if(dist[j]>dist[i]+1){dist[j]=dist[i]+1;q.push(j);}}}
  const domes=[[50,44,22,22,3.5],[46,98,40,28,2.5],[44,138,20,12,2.5]];
  for(let y=0;y<M.h;y++)for(let x=0;x<M.w;x++){const i=y*M.w+x;if(!M.m[i])continue;let h=Math.min(1,dist[i]/5)**.6*5;
    for(const [cx,cy,rx,ry,t] of domes){const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(d<1)h+=t*Math.sqrt(1-d);}F.H[i]=h;F.id[i]=1;}
  BT3.limb(F,47,1,47,12,4,5,6,7,2);   // the hock, where the hook goes through
  // the inner (spine) edge of each row
  F.left=new Int16Array(M.h).fill(-1);F.right=new Int16Array(M.h).fill(-1);for(let y=0;y<M.h;y++){for(let x=0;x<M.w;x++)if(M.m[y*M.w+x]){if(F.left[y]<0)F.left[y]=x;F.right[y]=x;}}
  F.dist=dist;return BT3._bf=F;};
BT3.beefMask=()=>BT3.fmask(BT3.beefField());
// the ribs fan out from the spine: where each leaves the spine, and how steeply it runs down toward the belly
BT3.RIBS=[[78,.12],[87,.22],[93,.3],[101,.4],[105,.47],[111,.55],[114,.62]];
BT3.beefShade=()=>{const F=BT3.beefField(),dist=F.dist;
  const H=(a,b)=>{let h=(a*374761393+b*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;};
  const vb=[];for(let y=40,k=0;y<148;k++){const L=k%2?9:7;vb.push([y,y+L]);y+=L+1;}
  return (x,y,id)=>{const l=BT3.lightOf(F,x,y),i=y*F.w+x;
    if(id===2){const r=Math.hypot(x+.5-47,(y+.5-3)*1.3);if(r<2.2)return '#c87a6a';return bt3pick(BT3.BONE,2.4+l*2.2);}
    const d=dist[i],sx=F.left[y]+1;
    // the backbone down the inner edge: a column of pale knuckles, each rounded and lit on top, a dark gap between
    if(y>40&&y<146&&x<sx+7&&d<9){const v=vb.find(b=>y>=b[0]&&y<b[1]);if(!v)return BT3.MEAT[1];
      const vy=(y-v[0])/(v[1]-v[0]),vx=(x-sx)/7;const r=Math.hypot(vx-.45,(vy-.5)*1.1);if(r>.62)return BT3.MEAT[1];
      return r<.2?'#c98a80':bt3pick(BT3.BONE,3.2-(vy-.35)*2.4-(vx-.3)*.8+l*.6);}
    // the ribs: curved arcs fanning out and down from the spine, uneven, lit on their upper edge, a shadow under each
    if(y>80&&y<140&&x>=sx+7){const re=F.right[y]-3;for(const [r0,sl] of BT3.RIBS){const ux=x-(F.left[r0]+8);if(ux<0)continue;const yy=r0+ux*sl+Math.sin(Math.min(1,ux/60)*Math.PI)*3;
        if(x>re||yy>138)continue;const th=2.8-ux/60;const dy=y-yy;if(dy>=0&&dy<th)return bt3pick(BT3.BONE,(dy<1?3.5:2.5)+l*1.1-(x>re-6?1:0));if(dy>=th&&dy<th+1.4)return BT3.MEAT[1];}
      if(y>84&&y<130)return bt3pick(BT3.MEAT,2.5+l*2.2);}
    // the fat cap down the outer edge
    if(d<3&&x>F.left[y]+12)return bt3pick(BT3.FAT,(d<1?1.4:2.6)+l*1.6);
    // one fat seam across the chuck, broken
    const aC=Math.atan2(y-144,x-44),sC=Math.abs(Math.hypot(x-44,(y-144)*1.3)-18+Math.sin(aC*4)*1.6);if(sC<.75&&aC<-.6&&aC>-2.5)return bt3pick(BT3.FAT,1.6+l*2);
    if(y<56&&H(x>>2,y)>.95&&H(x,y>>2)>.5)return bt3pick(BT3.MEAT,4.4+l);
    return bt3pick(BT3.MEAT,2.9+l*2.7);};};
BT3.beef=()=>M4.pre('bt3beef10',100,156,(K,g)=>{const M=BT3.beefMask();g.drawImage(BT3.paint(M,BT3.beefShade(),BT3.MO),0,0);});
// ---- the block: a heavy table of thick boards, the hollow worn into the middle of it, old stains as shapes; its front edge
// shows its thickness, the end grain of each board as a square with rings
BT3.block=(w,h)=>M4.pre('bt3blk2_'+w+'x'+h,w,h+12,(K,g)=>{const P=['#2e1a10','#46291a','#5e3a22','#77502e','#8c6238','#a07444','#b48852'];
  const H=(a,b,s)=>{let q=(a*374761393+b*668265263+(s||0)*362437)|0;q=(q^(q>>>13))*1274126177|0;return((q^(q>>>16))>>>0)/4294967295;};
  const bh=Math.max(10,Math.round(h/7));
  for(let y=0;y<h;y++){const r=Math.floor(y/bh),ay=y%bh;const tone=H(r,0,3)>.66?.5:H(r,0,3)<.33?-.5:0;for(let x=0;x<w;x++){
      // grain: long streaks that wander along the board, darker, tapered at their ends
      const gy=ay+Math.sin(x*.035+r*2)*1.6+Math.sin(x*.011+r)*2.2;const streak=Math.abs(gy-bh*.5)<.6&&H(Math.floor(x/30),r,7)>.35;
      const worn=1-Math.min(1,((x-w/2)/(w*.4))**2+((y-h*.55)/(h*.48))**2);
      let k=3+tone+worn*1.1-(y/h)*.8-(x/w)*.4+.4;if(streak)k-=.9;if(ay===0)k=1;if(ay===1)k=Math.max(k,4.2+tone);if(ay===bh-1)k-=.6;
      g.fillStyle=bt3pick(P,k);g.fillRect(x,y,1,1);}}
  for(const [sx,sy,rx,ry] of [[w*.22,h*.62,10,5],[w*.72,h*.3,7,4],[w*.56,h*.82,13,3]]){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=(x/rx)**2+(y/ry)**2+Math.sin(x*.9+y)*.12;if(d>1)continue;
      g.globalAlpha=d<.35?.42:.26;g.fillStyle='#2a0c0a';g.fillRect(Math.round(sx+x),Math.round(sy+y),1,1);}}g.globalAlpha=1;
  g.fillStyle=P[6];g.fillRect(0,0,w,1);
  // the front edge: each board's end grain, a square with rings round its heart
  for(let y=h;y<h+12;y++)for(let x=0;x<w;x++){const c=Math.floor(x/14),ax=x%14,ay=y-h;const hx=4+H(c,1,5)*6,hy=3+H(c,2,6)*6;const rr=Math.hypot(ax-hx,ay-hy);
    let k=1.8-ay*.07+(Math.floor(rr/2.2)%2?.4:0)+(H(c,3,9)>.6?.3:0);if(ax===0)k=.5;g.fillStyle=bt3pick(P,k);g.fillRect(x,y,1,1);}
  g.fillStyle=P[4];g.fillRect(0,h,w,1);g.fillStyle=P[0];g.fillRect(0,h+11,w,1);});
// ---- pieces: the drawing cut along polygons; each piece comes away from the rest when its seam is through
BT3.piece=(key,img,poly,face)=>M4.pre(key,img.width,img.height,(K,g)=>{g.save();g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();g.drawImage(img,0,0);g.restore();
  // the cut face: where the piece ends but the whole drawing went on, a wet dark edge with a lighter line inside it
  const w=img.width,h=img.height,d=g.getImageData(0,0,w,h),a=d.data;const s=img.getContext('2d').getImageData(0,0,w,h).data;
  const op=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&a[(y*w+x)*4+3]>0,full=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&s[(y*w+x)*4+3]>0;
  const edge=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!op(x,y))continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(!op(x+dx,y+dy)&&full(x+dx,y+dy)){edge.push([x,y]);break;}}
  const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));const band=[hex(face[0]),hex(face[2]||face[1]),hex(face[1])];
  let ring=edge,seen=new Set(edge.map(([x,y])=>y*w+x));
  for(let r=0;r<3&&ring.length;r++){const next=[];for(const [x,y] of ring){const i=(y*w+x)*4;const c=band[r];const cart=r===0&&((x*7+y*13)%29===0);a[i]=cart?236:c[0];a[i+1]=cart?226:c[1];a[i+2]=cart?206:c[2];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(!op(X,Y)||seen.has(Y*w+X))continue;seen.add(Y*w+X);next.push([X,Y]);}}ring=next;}
  g.putImageData(d,0,0);});
// the jobs: where each seam runs (in the drawing's own pixels) and what comes away when it's through
BT3.JOB={
  hen:{img:()=>BT3.hen(),at:[82,40],face:['#6e2a2c','#d49a90','#a8504c'],
    paths:[[[96,14],[94,26],[96,40],[106,50]],[[60,14],[62,26],[60,40],[50,50]],[[78,26],[79,56],[78,88]]],
    pieces:[{id:'legR',poly:[[96,0],[156,0],[156,52],[106,52],[96,42],[94,26]],free:0,to:[11,5,.2]},
            {id:'legL',poly:[[60,0],[0,0],[0,52],[50,52],[60,42],[62,26]],free:1,to:[-11,5,-.2]},
            {id:'brR',poly:[[78,0],[96,0],[94,26],[96,42],[106,52],[156,52],[156,104],[78,104],[79,56]],free:2,to:[6,2,.05]},
            {id:'brL',poly:[[78,0],[60,0],[62,26],[60,42],[50,52],[0,52],[0,104],[78,104],[79,56]],free:2,to:[-6,2,-.05]}]},
  beef:{img:()=>BT3.beef(),at:[16,4],face:['#3e0c12','#c25a50','#7a1e24'],hang:1,hookX:47,
    paths:[[[8,131],[48,133],[88,131]],[[70,131],[69,96],[70,62],[80,58]],[[10,86],[40,87],[70,86]],[[14,58],[46,57],[80,58]]],
    pieces:[{id:'chuck',poly:[[0,156],[0,131],[8,131],[48,133],[88,131],[100,131],[100,156]],free:0,land:[176,156,.06]},
            {id:'flank',poly:[[70,131],[88,131],[100,131],[100,54],[80,58],[70,62],[69,96]],free:1,land:[282,140,1.52]},
            {id:'rib',poly:[[0,131],[0,86],[10,86],[40,87],[70,86],[69,96],[70,131],[48,133],[8,131]],free:2,land:[244,158,-.05]},
            {id:'loin',poly:[[0,86],[0,58],[14,58],[46,57],[80,58],[70,62],[69,96],[70,86],[40,87],[10,86]],free:3,land:[212,136,.04]},
            {id:'round',poly:[[0,0],[100,0],[100,54],[80,58],[46,57],[14,58],[0,58]],free:9}]}};
// ---- the knife game, redrawn on top of the old one's play
{const _tr=S4.trace;S4.trace=(sp,K)=>{const J=BT3.JOB[sp.surface];if(!J)return _tr(sp,K);
  const [ox,oy]=J.at;sp=Object.assign({},sp,{paths:J.paths.map(p=>p.map(([x,y])=>[x+ox,y+oy]))});
  const o=_tr(sp,K);const st=o.st,g=K.g;const img=J.img();
  const bbox=poly=>{const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return [(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];};
  const pcs=J.pieces.map(p=>({p,img:BT3.piece('bt3p_'+sp.surface+'_'+p.id,img,p.poly,J.face),u:0,c:(()=>{const M=J.img().getContext('2d').getImageData(0,0,img.width,img.height).data;
    let x0=1e9,y0=1e9,x1=-1,y1=-1;const c=document.createElement('canvas');return null;})(),bc:null}));
  // each piece's middle (from its own pixels), for turning it as it falls
  for(const P of pcs){const d=P.img.getContext('2d').getImageData(0,0,P.img.width,P.img.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;
    for(let y=0;y<P.img.height;y++)for(let x=0;x<P.img.width;x++)if(d[(y*P.img.width+x)*4+3]>0){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}P.bc=[(x0+x1)/2,(y0+y1)/2];}
  let lastPi=0,dripT=0,order=[];
  const up=o.update;o.update=function(dt,I){up.apply(this,arguments);
    const nowDone=st.end?J.paths.length:st.pi;if(nowDone>lastPi){for(let k=lastPi;k<nowDone;k++){MS.chop();K.shk=Math.max(K.shk,.09);
        const [x,y]=sp.paths[k][sp.paths[k].length-1];K.emit(x,y,6,{c:['#4e1219','#741e26','#962c32'],v:40,g:260,life:.5,spread:2.2});}lastPi=nowDone;}
    for(const P of pcs){const freed=P.p.free<lastPi;if(!freed)continue;if(P.u===0)order.push(P);const was=P.u;P.u=Math.min(1,P.u+dt*(J.hang?2.2:9)*(J.hang?1:(1-P.u)+.02));
      if(J.hang&&was<1&&P.u>=1){MS.thunk();K.shk=Math.max(K.shk,.12);const [cx,cy]=P.p.land;K.emit(cx,cy,5,{c:['#4e1219','#741e26'],v:30,g:240,life:.4,spread:2.4});}}
    if(I&&I.down&&!st.end&&st.spd>8){dripT-=dt;if(dripT<=0){dripT=.18+Math.random()*.2;K.emit(st.tx,st.ty+2,1,{c:['#741e26','#4e1219'],v:12,g:200,life:.45,spread:.8,ang:Math.PI/2});}}};
  const place=P=>{if(!J.hang){const [dx,dy,da]=P.p.to;const e=P.u;return [ox+dx*e,oy+dy*e,da*e];}
    if(!P.p.land)return [ox,oy,0];const u=P.u,[cx,cy,rot]=P.p.land;const sx=ox+P.bc[0],sy=oy+P.bc[1];
    // tossed onto the block: across, a little up, then down; turning as it goes
    const x=sx+(cx-sx)*u,y=sy+(cy-sy)*u*u-Math.sin(u*Math.PI)*14;return [x-P.bc[0],y-P.bc[1],rot*u];};
  const drawP=(P,sh)=>{const [x,y,a]=place(P);if(sh){g.globalAlpha=.25;}
    if(Math.abs(a)>.01){g.save();g.translate(Math.round(x+P.bc[0]+(sh?2:0)),Math.round(y+P.bc[1]+(sh?3:0)));g.rotate(a);g.drawImage(P.img,-P.bc[0],-P.bc[1]);g.restore();}
    else g.drawImage(P.img,Math.round(x+(sh?2:0)),Math.round(y+(sh?3:0)));g.globalAlpha=1;};
  o.draw=function(t){
    if(J.hang){const B=BT3.block(308,40);K.pa(10,140,B.width,B.height,'#000',.35);g.drawImage(B,6,132);
      // the rail, and the iron hook through the hock
      K.px(0,0,320,4,'#2a2420');K.px(0,0,320,1,'#5a5248');K.px(0,3,320,1,'#16120e');for(let x=6;x<320;x+=40){K.px(x,4,3,3,'#3a342c');}
      const hx=ox+(J.hookX||61),hy=oy;K.px(hx-1,3,3,3,'#4a443c');K.px(hx,6,2,4,'#5a544a');K.px(hx-3,9,2,5,'#4a443c');K.px(hx-3,13,6,2,'#4a443c');K.px(hx-1,10,1,1,'#8a8478');
    }else{const B=BT3.block(236,112);K.pa(46,44,B.width,B.height,'#000',.35);g.drawImage(B,42,36);}
    // landed pieces first (on the block), then the ones still hanging or lying where they were
    const done=pcs.filter(P=>P.u>=1&&J.hang),rest=pcs.filter(P=>!(P.u>=1&&J.hang));
    for(const P of order)if(done.includes(P)){drawP(P,true);drawP(P);}
    if(!J.hang)sp.paths.forEach((p,pi)=>{if(pi>=lastPi)return;const L=m4len(p);for(let q=0;q<L;q+=1){const [x,y]=m4at(p,q);K.pa(x,y+1,1,1,'#6a1a16',.75);}});
    for(const P of rest)if(!J.hang)drawP(P,true);
    for(const P of rest)drawP(P);
    const paths=sp.paths;paths.forEach((p,pi)=>{if(pi<st.pi)return;const L=m4len(p);for(let s=pi===st.pi?st.s:0;s<L;s+=4){const [x,y]=m4at(p,s);K.px(x,y,2,1,pi===st.pi?'#fff0d0':'#2a0e08');if(pi===st.pi)K.px(x,y+1,2,1,'#2a0e08');}});
    for(const [x,y,pi] of st.cut)if(pi>=lastPi){K.px(x,y,2,1,'#3a0a08');K.px(x,y+1,2,1,'#741e26');}
    if(!st.end&&st.pi<paths.length){const [sx,sy]=paths[st.pi][0];if(st.s<2){K.pa(sx-3,sy-3,7,7,'#ffd27a',.5+Math.sin(t*10)*.3);}}
    if(!st.end){M4.rot(g,M4S.knife(),st.tx,st.ty,-.5,8,44);const [hx,hy]=M4.tr(st.tx,st.ty,-.5,0,-38);m4sleeve(K,hx+3,hy,hx+30,hy+20);m4hand(K,hx,hy);}
    if(st.jump>0){const [x,y]=paths[st.pi][0];K.pa(x-3,y-3,7,7,'#ffd27a',.6+Math.sin(t*20)*.3);}};
  o.how='Open each seam with the knife, start to end: '+(K.fine?'hold the mouse button and draw along the dotted line':'drag along the dotted line with your finger')+'. Stay in the seam; when it’s through, the piece comes away.';
  return o;};}
// ---- weighing the cuts: a hanging butcher's scale with a pan on three chains; the cuts go on one by one
BT3.cut=(kind,k)=>M4.pre('bt3cut_'+kind+k,20,14,(K,g)=>{const M=BT3.mk(20,14);
  if(kind==='hen'){if(k%3===0){BT3.cap(M,5,9,14,4,4,2,1);BT3.ell(M,15,3,2,2,2);}else if(k%3===1){BT3.ell(M,10,8,8,5,1);}else{BT3.ell(M,9,7,6,4,1);BT3.cap(M,12,9,17,12,2,1,1);}
    g.drawImage(BT3.paint(M,(x,y,id)=>id===2?BT3.BONE[3]:bt3pick(BT3.SKIN,3.4-(x-10)/10-(y-7)/7*1.2),BT3.SKO),0,0);}
  else{if(k%3===0){BT3.ell(M,10,7,8,5,1);}else if(k%3===1){BT3.poly(M,[[2,4],[16,2],[18,10],[4,12]],1);}else{BT3.ell(M,9,7,7,5,1);BT3.cap(M,4,10,17,4,1,1,2);}
    g.drawImage(BT3.paint(M,(x,y,id)=>{if(id===2)return BT3.BONE[3];let e=0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(!BT3.in(M,x+dx,y+dy))e=1;
      return e?bt3pick(BT3.FAT,2-(y-7)/7):bt3pick(BT3.MEAT,3.4-(x-10)/10-(y-7)/7*1.4);},BT3.MO),0,0);}});
{const _sc=S4.scale;S4.scale=(sp,K)=>{const o=_sc(sp,K);if(!sp.meat)return o;const st=o.st,g=K.g,MK=sp.mark||.7,N=sp.meat==='hen'?5:6;
  const pile=[];let shown=0;
  o.how='Hold to lay the cuts on the pan, one after another. The needle swings and takes a moment to settle, so let go early and watch it come to rest on the mark.';
  o.hint='Hold to lay the cuts on. Let go early; it settles.';
  const up=o.update;o.update=function(dt,I){up.apply(this,arguments);const want=Math.min(N+2,Math.floor(Math.min(1.25,st.m)/MK*N+.35));
    while(shown<want){pile.push({k:shown,y:-14,vy:0,x:(shown%3-1)*9+(shown>2?4:0),row:shown>2?1:0});shown++;MS.plop();}
    for(const p of pile){if(p.y<0){p.vy+=420*dt;p.y=Math.min(0,p.y+p.vy*dt);if(p.y===0)p.vy=0;}}};
  o.draw=function(t){const cx=104,cy=28,R=15;
    const B=BT3.block(308,34);K.pa(10,148,B.width,B.height,'#000',.35);g.drawImage(B,6,140);
    K.px(cx-30,2,60,5,'#4a2c18');K.px(cx-30,2,60,1,'#7a5030');K.px(cx-1,7,3,7,'#3a342c');
    K.ball(cx,cy,R+2,['#5a3a10','#8a6420','#b8902e','#dcb85a','#f4dc90']);K.ball(cx,cy,R-1,['#b8ae96','#d8d0bc','#ece6d6','#faf6ec']);
    const ang=f=>-2.4+Math.min(1.12,f)*3.2;for(let k=0;k<=10;k++){const a=ang(k/10);K.px(cx+Math.cos(a)*(R-4),cy+Math.sin(a)*(R-4),1,1,'#3a3020');}
    const am=ang(MK);for(const [r0,r1,c,w] of [[R-8,R-2,'#2f7a24',2],[R+3,R+8,'#c8281e',3]])K.line(cx+Math.cos(am)*r0,cy+Math.sin(am)*r0,cx+Math.cos(am)*r1,cy+Math.sin(am)*r1,c,w);
    const an=ang(st.x);K.line(cx,cy,cx+Math.cos(an)*(R-3),cy+Math.sin(an)*(R-3),'#1a1410',1);K.px(cx-1,cy-1,3,3,'#3a2a10');K.px(cx,cy,1,1,'#e8c060');
    const py=cy+R+44+Math.round(st.x*5);const top=cy+R+7;K.px(cx,cy+R+1,1,5,'#2a2420');K.px(cx-1,cy+R+5,3,3,'#4a443c');
    // three iron chains: links in two tones so they read as chain, not string
    for(const dx of [-24,0,24]){const n=Math.hypot(dx,py-top);for(let s2=0;s2<n;s2+=3){const u=s2/n,x=cx+dx*u,y=top+(py-top)*u;K.px(x,y,2,2,'#2a2622');K.px(x,y,1,1,(s2/3)%2?'#7a746a':'#a8a296');}}
    const PAN=['#2c2e32','#4c5054','#72767a','#9a9ea0','#c6c9c9'];K.ell(cx,py+1,29,5,PAN[0]);K.ell(cx,py,28,4,PAN[1]);K.ell(cx,py-1,26,3,PAN[3]);K.ell(cx,py-1,22,2,PAN[2]);K.px(cx-24,py-2,7,1,PAN[4]);
    for(const p of pile){const im=BT3.cut(sp.meat,p.k);g.drawImage(im,Math.round(cx-10+p.x),Math.round(py-11-p.row*5+p.y));}
    K.px(cx-28,py+2,56,2,PAN[0]);K.px(cx-27,py+4,54,1,PAN[1]);
    // the cuts still to weigh, on the block; your hand takes the next one to the pan while you hold
    const left=Math.max(0,N-shown);for(let k=0;k<left;k++)g.drawImage(BT3.cut(sp.meat,shown+k+1),150+(k%4)*22,128+Math.floor(k/4)*8);
    const reach=st.flow,hx=cx+40+(1-reach)*24,hy=py-18+(1-reach)*40;if(shown<N+2)g.drawImage(BT3.cut(sp.meat,shown),Math.round(hx-12),Math.round(hy+3));m4hand(K,hx,hy);};
  return o;};}
// the two recipes use them
if(typeof MG4R!=='undefined'){for(const [k,m] of [['b_butcher:hen','hen'],['b_butcher:cow','beef']]){const R=MG4R[k];if(!R)continue;const sc=R.steps.find(s=>s.k==='scale');if(sc){sc.meat=m==='beef'?'beef':'hen';sc.t=m==='beef'?'Weigh the cuts':'Weigh the joints';}
  const tr=R.steps.find(s=>s.k==='trace');if(tr)tr.t=m==='beef'?'Break the side down along its seams':'Joint the bird along its seams';}}
/* ---- the farm hands at work, the props they work with drawn as things (they were coloured boxes): the Kettle twins pick into
   a wicker basket and hold up what they picked (a pumpkin, a turnip, whatever the row grows); Old Merritt sows from a burlap
   pouch at his hip; Dell's cans pour in an arc; Hannah's pick throws clods and chips. The twins face each other down the row. */
const HB3={};
HB3.basket=fill=>M4.pre('hb3basket2_'+fill,20,17,(K,g)=>{const W=['#2e1e10','#563a20','#7e5834','#a07848','#c49c64'];
  const C={pumpkin:['#6a2606','#c0581a','#ec9444'],turnip:['#5a2a5a','#d8c8d8','#f4ecf4'],potato:['#5a4028','#9a7448','#c49a68'],carrot:['#8a3a10','#d8701e','#f0a050'],cabbage:['#2e5a32','#5a9a5a','#8ac48a'],corn:['#8a6a10','#d8b030','#f4dc70']}[fill]||['#2e5a32','#5a9a5a','#8ac48a'];
  // the produce heaped above the rim: three rounds, lit on their upper left, each with its own dark edge
  for(const [x,y,r] of [[6,6,3],[10,4,3.4],[14,6,3]])for(let j=-4;j<=4;j++)for(let i=-4;i<=4;i++){const d=Math.hypot(i,j);if(d>r)continue;K.px(x+i,y+j,1,1,d>r-.9?C[0]:i+j<-1.5?C[2]:C[1]);}
  K.px(10,0,1,2,'#3a6a2a');
  // the basket: a lit rim, woven bands in two tones (never a checker), darker toward the bottom, tapering
  for(let x=1;x<19;x++){K.px(x,8,1,1,W[4]);K.px(x,9,1,1,W[2]);}
  for(let y=10;y<16;y++){const ins=y>13?1:0,band=((y-10)>>1)%2,dk=y>13?1:0;for(let x=1+ins;x<19-ins;x++)K.px(x,y,1,1,W[((x+band*2)%4<2?3:2)-dk]);}
  for(let y=8;y<16;y++){const ins=y>13?1:0;K.px(ins,y,1,1,W[0]);K.px(19-ins,y,1,1,W[0]);}for(let x=2;x<18;x++)K.px(x,16,1,1,W[0]);
  for(let a=0;a<=Math.PI;a+=.15)K.px(Math.round(10-Math.cos(a)*7),Math.round(8-Math.sin(a)*6),1,1,a<1.6?W[3]:W[1]);});
HB3.crop=type=>M4.pre('hb3crop2_'+type,11,11,(K,g)=>{const C={pumpkin:['#5a2006','#c0581a','#f09848'],turnip:['#5a2a5a','#dccadc','#faf0fa'],potato:['#5a4028','#9a7448','#c8a070'],carrot:['#8a3a10','#e0782a','#f8b060']}[type]||['#2e5a32','#5a9a5a','#9ad09a'];
  for(let j=-4;j<=4;j++)for(let i=-5;i<=5;i++){const d=Math.hypot(i/1.15,j);if(d>4)continue;const rib=type==='pumpkin'&&Math.abs(i)===2&&d<3.4;K.px(5+i,6+j,1,1,d>3.1?C[0]:rib?C[0]:i+j<-2?C[2]:C[1]);}
  K.px(5,1,1,2,'#5a4a26');K.px(5,0,1,1,'#3a2e18');});
HB3.pouch=()=>M4.pre('hb3pouch',7,8,(K,g)=>{const B=['#3a2a18','#6a5434','#9a8458','#bca878'];K.px(1,0,5,1,B[1]);K.px(2,1,3,1,B[0]);for(let y=2;y<8;y++)for(let x=0;x<7;x++){if((y===7&&(x===0||x===6)))continue;K.px(x,y,1,1,x===0||x===6||y===7?B[0]:x<3?B[3]:B[2]);}K.px(3,0,1,2,'#7a5a3a');});
function handSheet3(id,base){const L=HAND_LOOK[id],key='hand3b_'+id+'_'+base;if(SPR[key])return key;const m=SPR[base];if(!m)return null;const im=IMG[m.src];
  if(!im||!im.width){if(typeof loadImages==='function'&&!(HB3.ask||(HB3.ask={}))[m.src]){HB3.ask[m.src]=1;loadImages([m.src]);}return null;}
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const D=g.getImageData(0,0,c.width,c.height),d=D.data;const fh=m.fh||64;
  for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;const py=((i/4)/c.width|0)%fh;if(py<fh*.5||py>fh*.84)continue;   // the shirt rows only: never the face
    const r=d[i]/255,gg=d[i+1]/255,b=d[i+2]/255,mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),l=(mx+mn)/2,s2=mx===mn?0:(mx-mn)/(1-Math.abs(2*l-1));
    let h=0;if(mx!==mn){h=mx===r?((gg-b)/(mx-mn))%6:mx===gg?(b-r)/(mx-mn)+2:(r-gg)/(mx-mn)+4;h*=60;if(h<0)h+=360;}
    if(!(s2>.42&&(h<14||h>340)&&l>.12&&l<.62))continue;   /* l<.62: the pale pink of a cheek or mouth stays (a bowed head dips it into the shirt rows) */const H=L.hue/60,C=(1-Math.abs(2*l-1))*s2*.85,X=C*(1-Math.abs(H%2-1)),mm=l-C/2;let rr=0,g2=0,bb=0;
    if(H<1){rr=C;g2=X;}else if(H<2){rr=X;g2=C;}else if(H<3){g2=C;bb=X;}else if(H<4){g2=X;bb=C;}else if(H<5){rr=X;bb=C;}else{rr=C;bb=X;}
    d[i]=Math.round((rr+mm)*255);d[i+1]=Math.round((g2+mm)*255);d[i+2]=Math.round((bb+mm)*255);}
  g.putImageData(D,0,0);IMG['mem:'+key]=c;SPR[key]=Object.assign({},m,{src:'mem:'+key});return key;}
// Hannah's pick: a straight ash handle and a two-pointed iron head, drawn turned to any angle
HB3.pick=()=>M4.pre('hb3pick',24,24,(K,g)=>{for(let i=0;i<14;i++){K.px(11,4+i,1,1,'#c49a64');K.px(12,4+i,1,1,'#8a6438');}K.px(11,17,2,1,'#5a3e22');
  for(let x=2;x<22;x++){const d=Math.abs(x-11.5);const th=d<3?3:d<7?2:1;for(let j=0;j<th;j++)K.px(x,3+j-(d>8?0:0)+Math.round(d*d*.012),1,1,j===0?'#a8acb4':'#5a5e66');}K.px(1,4,1,1,'#3a3e46');K.px(22,4,1,1,'#3a3e46');});
// field stones in three sizes (k: 0 pebble, 1 stone, 2 rock; v: shape), lit on the upper left, each with its own dark rim
HB3.stone=(k,v)=>{v=(v||0)%3;const W=[5,8,12][k],H=[4,6,9][k];return M4.pre('hb3stone2_'+k+'_'+v,W,H,(K,g)=>{const S=['#3a383e','#5e5a62','#86828a','#aaa6ac'];
  const cx=(W-1)/2+(v===1?.4:v===2?-.4:0),cy=(H-1)/2+.3,rx=W/2,ry=H/2;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=((x-cx)/rx)**2+((y-cy)/ry)**2+(v===2&&x>cx&&y<cy?.18:0);if(e>1.02)continue;
    const lit=(x-cx)/rx+(y-cy)/ry;K.px(x,y,1,1,e>.6&&(y>=cy||x>=cx)?S[0]:e>.78?S[1]:lit<-.55&&k>0?S[3]:lit<.2?S[2]:S[1]);}
  if(k===2)K.px(Math.round(cx)+1,Math.round(cy),1,1,S[1]);});};
// how the stones lie on one square of the clearing row: some bare, some a lone rock, some a scatter of pebbles round a stone
HB3.lay=q=>{const h=n=>{let x=Math.sin(q*127.1+n*311.7)*43758.5453;return x-Math.floor(x);};const m=h(0);if(m<.22)return [];
  const out=[],n=m<.45?1:m<.7?2:m<.88?3:4;for(let j=0;j<n;j++){const k=j===0?(h(1)<.45?2:1):(h(2+j)<.6?0:1);
    out.push([Math.round(-9+h(5+j)*16),Math.round(-5+h(9+j)*8),k,Math.floor(h(13+j)*3)]);}return out;};
{const _ld=lifeDrawables;lifeDrawables=function(D,t){let E=null,W=null;try{E=EMP();W=E.work;if(W)E.work=null;}catch(e){}
  try{_ld.apply(this,arguments);}finally{if(E&&W)E.work=W;}
  try{if(S.room||!E||!W||W.day!==S.day||S.hour<6||S.hour>=12.2)return;
  const hands=(E.hands||[]);let i=0;const placed=[[P.x,P.z]];for(const id of hands){const L=HAND_LOOK[id];if(!L)continue;const pts=W[L.job];if(!pts||!pts.length)continue;
    for(let tw=0;tw<(L.twins?2:1);tw++){const n=pts.length,T=(S.hour-6)/6.2*n+Math.floor((i*n)/4)+tw*Math.max(1,Math.floor(n/2))+i*.37+tw*.29;
      const k=Math.floor(T)%n,f=T-Math.floor(T),a=pts[k],b=pts[(k+1)%n];const walk=f>.78;const u=walk?(f-.78)/.22:0;
      let x=a[0]+(b[0]-a[0])*u,z=a[1]+(b[1]-a[1])*u+.25;for(let rep=0;rep<3;rep++)for(const q of placed)if(Math.abs(q[0]-x)<1.1&&Math.abs(q[1]-z)<2.2){x+=1.25;}
      placed.push([x,z]);if(!onScreen(x,z,80))continue;
      // the second twin works the row from the other end, facing the first
      const dir=walk?dirOf(b[0]-a[0],b[1]-a[1]):(L.twins&&tw?'W':'E');const sgn=dir==='W'?-1:1;
      const ownPick=L.job==='clear';const base=ownPick?L.spr:(walk||!SPR[L.spr+L.tool]?L.spr:L.spr+L.tool),clip=walk?'walk':ownPick?'slash':(base===L.spr&&L.tool?'walk':L.clip),key=handSheet3(id,base);if(!key)continue;
      const ph=(f/.78)%1,fr=clip==='walk'?frameOf(key,'walk',performance.now()/1000+i):frameOf(key,clip,ph,1),job=L.job,working=!walk;
      const tile=typeof tileAtW==='function'?tileAtW(a[0],a[1]):null,type=(tile&&tile.crop&&tile.crop.type)||(tile&&tile.lastPick)||'pumpkin';
      if(job==='clear')for(let q=0;q<n;q++){if(q<k||(q===k&&!walk&&ph>.55)||(q===k&&walk))continue;const [qx,qz]=pts[q];if(!onScreen(qx,qz,40))continue;
        D.push({z:qz-.02,mind:1,draw(){const X=Math.round(sx(qx)),Y=Math.round(sz(qz));for(const [dx,dy,kk,vv] of HB3.lay(q).sort((p,r)=>p[1]-r[1])){const im=HB3.stone(kk,vv);ctx2.fillStyle='rgba(20,12,6,.35)';ctx2.fillRect(X+dx+1,Y+dy,im.width-1,1);ctx2.drawImage(im,X+dx,Y+dy-im.height+1);}}});}
      D.push({z:z+.01,mind:1,draw(){const X=Math.round(sx(x)),Y=Math.round(sz(z));if(typeof shadow==='function')shadow(X,Y,7);
        // the basket stands on the ground behind the picker's heels
        if(job==='pick')ctx2.drawImage(HB3.basket(type),X-sgn*14-10,Y-15);
        drawSpr(key,X,Y,clip,dir,fr);
        if(job==='clear'){const pk=HB3.pick();let ang,hx,hy;if(!working){ang=sgn*-.5;hx=X-sgn*4;hy=Y-36;}else{const sw=ph<.45?-1.9+ph/.45*.4:ph<.58?-1.5+(ph-.45)/.13*2.9:1.4;ang=sgn*sw;hx=X+sgn*6;hy=Y-30;}
          ctx2.save();ctx2.translate(hx,hy);ctx2.rotate(ang);ctx2.drawImage(pk,-12,-17);ctx2.restore();
          if(working&&ph>.55&&ph<.85){const q=(ph-.55)/.3;for(const [cx,cy,c] of [[12,-3,'#86828a'],[16,-6,'#5e5a62'],[19,-2,'#aaa6ac'],[14,-8,'#6a4a2e']]){ctx2.fillStyle='#24180e';ctx2.fillRect(X+sgn*(cx+Math.round(q*5))-1,Y+cy-Math.round(q*6)-1,4,4);ctx2.fillStyle=c;ctx2.fillRect(X+sgn*(cx+Math.round(q*5)),Y+cy-Math.round(q*6),2,2);}
            ctx2.globalAlpha=.5*(1-q);ctx2.fillStyle='#b8a890';ctx2.beginPath();ctx2.arc(X+sgn*14,Y-3,4+q*5,0,6.3);ctx2.fill();ctx2.globalAlpha=1;}return;}
        if(!working){if(job==='plant')ctx2.drawImage(HB3.pouch(),X-sgn*6-3,Y-20);return;}const tt=performance.now()/1000;
        if(job==='water'){ctx2.fillStyle='rgba(40,70,110,.5)';ctx2.fillRect(X+sgn*14-(sgn<0?12:0),Y-1,12,3);
          for(let d=0;d<10;d++){const q=d/9,xx=X+sgn*(11+Math.round(q*8))-(sgn<0?2:0),yy=Y-15+Math.round(q*q*13);ctx2.fillStyle=d%3?'#cfeaff':'#f4fbff';ctx2.fillRect(xx,yy,2,2);}
          for(const o of [0,.33,.66]){const q2=(tt*2.4+o)%1;ctx2.fillStyle='#e8f6ff';ctx2.fillRect(X+sgn*(17+Math.round(o*4)),Y-6+Math.round(q2*5),1,2);}}
        else if(job==='clear'){const up=ph<.5;if(!up&&ph<.85){const q=(ph-.5)/.35;for(const [cx,cy,c] of [[10,-4,'#5a3e26'],[15,-7,'#6a4a2e'],[19,-3,'#4a3220'],[13,-9,'#8a8478']]){ctx2.fillStyle='#24180e';ctx2.fillRect(X+sgn*(cx+Math.round(q*4))-1,Y+cy-Math.round(q*5)-1,4,4);ctx2.fillStyle=c;ctx2.fillRect(X+sgn*(cx+Math.round(q*4)),Y+cy-Math.round(q*5),2,2);}}
          ctx2.fillStyle='rgba(60,40,20,.45)';ctx2.fillRect(X+sgn*10-(sgn<0?10:0),Y-1,10,3);}
        else if(job==='plant'){ctx2.drawImage(HB3.pouch(),X-sgn*6-3,Y-20);for(let d=0;d<4;d++){const q=((tt*1.4+d*.25)%1),xx=X+sgn*(8+Math.round(q*7))-1,yy=Y-16+Math.round(q*q*15);ctx2.fillStyle='#3a2a14';ctx2.fillRect(xx-1,yy-1,4,4);ctx2.fillStyle=d%2?'#f4e4b0':'#d8b868';ctx2.fillRect(xx,yy,2,2);}
          ctx2.fillStyle='rgba(60,40,20,.4)';ctx2.fillRect(X+sgn*8-(sgn<0?10:0),Y-1,10,2);}
        else if(job==='pick'){const lift=Math.sin(Math.min(1,ph*1.6)*Math.PI);ctx2.drawImage(HB3.crop(type),X+sgn*9-5,Y-17-Math.round(lift*3));}}});}
    i++;}}catch(e){}};}
/* ---- the tractor's implements say their job (judge: "each implement says its job"): once bought, the seed drill rides behind
   the harrow (a red hopper on a wheel, seed tubes down to the discs) and the reaper rides in front (a reel of bats that turns as
   you drive, a toothed cutter bar at the ground). Sprites: tractor_drill_E/N, tractor_reaper_E0-3/S0-3 (tools/px/tractor_art.py). */
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{if(!TR.ride)return;const T=EMP().tractor;if(!T||!(T.drill||T.reaper))return;
  const v=trView(),flip=v==='W',sv=flip?'E':v,moving=P.spd>0,f=moving?Math.floor(t*10)%4:0;
  if(T.drill&&SPR.tractor_drill_E){if(sv==='E')D.push({z:P.z-.02,mind:1,draw(){drawSpr('tractor_drill_E',sx(P.x)+(flip?86:-86),sz(P.z)+2,null,'S',0,{flip});}});
    else if(v==='N')D.push({z:P.z+.03,mind:1,draw(){drawSpr('tractor_drill_N',sx(P.x),sz(P.z)+34,null,'S',0);}});}
  if(T.reaper&&SPR.tractor_reaper_E0){if(sv==='E')D.push({z:P.z+.9,mind:1,draw(){drawSpr('tractor_reaper_E'+f,sx(P.x)+(flip?-56:56),sz(P.z)+3,null,'S',0,{flip});}});
    else if(v==='S')D.push({z:P.z+.04,mind:1,draw(){drawSpr('tractor_reaper_S'+f,sx(P.x),sz(P.z)+12,null,'S',0);}});}}catch(e){}};}
/* ---- the implements at work (judge: "no frame shows either implement working"). What the drill and the reaper really do
   (empSow, empPick from the tractor) now shows: the drill drops seed from its tubes and leaves a dark sown furrow behind it on
   every square it sows (it fades in a while, as the seedlings come); the reaper's cut stalks tip back over the cutter bar and
   are lifted over the reel into the pan. Nothing shows when nothing is done (no seed picked, nothing ripe). */
const TRW={sown:[],stalks:[],sowAt:-9,reapAt:-9};
{const _s=empSow;empSow=function(t,type){const r=_s.apply(this,arguments);try{if(r&&TR.ride){const now=performance.now()/1000;TRW.sowAt=now;
  TRW.sown.push({x:t.x,z:t.z,t:now,tile:t,h:Math.abs(P.fx||0)>=Math.abs(P.fz||0)});if(TRW.sown.length>160)TRW.sown.shift();}}catch(e){}return r;};}
{const _p=empPick;empPick=function(t,toBag){const r=_p.apply(this,arguments);try{if(r&&TR.ride&&toBag){const now=performance.now()/1000;TRW.reapAt=now;
  for(let i=0;i<4;i++)TRW.stalks.push({t:now+i*.09,s:Math.random(),l:5+Math.floor(Math.random()*3)});if(TRW.stalks.length>48)TRW.stalks.splice(0,TRW.stalks.length-48);}}catch(e){}return r;};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{const now=performance.now()/1000;
  // the sown furrows: a short dark groove through each sown square, a few pale seeds in it; they fade after twenty seconds
  TRW.sown=TRW.sown.filter(s=>now-s.t<24&&s.tile.crop&&s.tile.crop.stage<2);for(const s of TRW.sown){if(!onScreen(s.x,s.z,30))continue;
    D.push({z:s.z-.45,mind:1,draw(){const X=Math.round(sx(s.x)),Y=Math.round(sz(s.z)),a=Math.min(1,(24-(now-s.t))/6);ctx2.globalAlpha=a;
      const hw=Math.ceil((sx(s.x+.5)-sx(s.x-.5))/2),hh=Math.ceil((sz(s.z+.5)-sz(s.z-.5))/2);   /* a whole square long, so a sown run reads as one furrow */
      if(s.h){ctx2.fillStyle='#24160c';ctx2.fillRect(X-hw,Y+3,hw*2,2);ctx2.fillStyle='#6a4a30';ctx2.fillRect(X-hw,Y+5,hw*2,1);ctx2.fillStyle='#e8d090';for(let dx=-hw+3;dx<hw;dx+=6)ctx2.fillRect(X+dx,Y+3,1,1);}
      else{ctx2.fillStyle='#24160c';ctx2.fillRect(X-1,Y-hh,2,hh*2);ctx2.fillStyle='#6a4a30';ctx2.fillRect(X+1,Y-hh,1,hh*2);ctx2.fillStyle='#e8d090';for(let dy=-hh+3;dy<hh;dy+=6)ctx2.fillRect(X,Y+dy,1,1);}
      ctx2.globalAlpha=1;}});}
  if(!TR.ride)return;const T=EMP().tractor;if(!T)return;const v=trView(),flip=v==='W',sv=flip?'E':v,d=flip?-1:1;
  // seed falling from the drill's tubes while it sows
  if(T.drill&&now-TRW.sowAt<.7){if(sv==='E')D.push({z:P.z-.015,mind:1,draw(){const X=Math.round(sx(P.x))-d*86,Y=Math.round(sz(P.z))+2;
      for(const tx of [-13,-7,-1,5,11])for(let k=0;k<2;k++){const q=(now*3.2+k*.5+tx*.07)%1;ctx2.fillStyle=k?'#e8d090':'#c8a050';ctx2.fillRect(X+d*tx,Y-4+Math.round(q*6),1,2);}}});
    else if(v==='N')D.push({z:P.z+.035,mind:1,draw(){const X=Math.round(sx(P.x)),Y=Math.round(sz(P.z))+34;
      for(let tx=-17;tx<=18;tx+=5)for(let k=0;k<2;k++){const q=(now*3.2+k*.5+tx*.05)%1;ctx2.fillStyle=k?'#e8d090':'#c8a050';ctx2.fillRect(X+tx,Y-3+Math.round(q*5),1,2);}}});}
  // the reaper's cut stalks: each tips back off the cutter bar, is lifted over the reel and drops into the pan
  if(T.reaper){TRW.stalks=TRW.stalks.filter(s=>now-s.t<.9);if(TRW.stalks.length)D.push({z:P.z+(sv==='E'?.91:.045),mind:1,draw(){
    for(const s of TRW.stalks){const q=(now-s.t)/.9;if(q<0)continue;let bx,by,ang;
      if(sv==='E'){const X0=Math.round(sx(P.x))+d*56,Y0=Math.round(sz(P.z))+3;bx=X0+d*(19-q*20+s.s*3);by=Y0-3-Math.round(Math.sin(Math.min(1,q*1.3)*Math.PI)*16)-Math.round(q*6);ang=-d*(q*2.2);}
      else if(v==='S'){const X0=Math.round(sx(P.x)),Y0=Math.round(sz(P.z))+12;bx=X0-24+s.s*48;by=Y0-3-Math.round(q*16);ang=0;}else continue;
      const L=s.l;for(let i=0;i<L;i++){const px=Math.round(bx+Math.sin(ang)*i),py=Math.round(by-Math.cos(ang)*i*(v==='S'?1-q*.6:1));ctx2.fillStyle=i>=L-2?'#a87828':i%2?'#e8c870':'#c8a050';ctx2.fillRect(px,py,i>=L-2?2:1,1);}}}});}
}catch(e){}};}
/* the reaper rides in front of the tractor, so it cuts there: ripe squares under the reaper (three wide, a square and a half
   ahead) are cut as it reaches them, instead of the tractor driving through standing grain and cutting it from behind */
{const _w=trWork;trWork=function(){try{const T=EMP().tractor;if(T&&T.reaper){const fx=P.fx||0,fz=P.fz||0,bx=P.x+fx*1.6,bz=P.z+fz*1.6,px=-fz,pz=fx;
  for(const s of [-1,0,1]){const t=typeof tileAtW==='function'?tileAtW(bx+px*s,bz+pz*s):null;if(!t||!t.crop||t.crop.stage<3)continue;const key=t.i+':'+t.j;
    if(TR.done&&TR.done.has(key))continue;if(empPick(t,true)){burst(t.x,t.z,8,'#c8a050',1.2,.6,1.8);(TR.done=TR.done||new Set()).add(key);setTimeout(()=>TR.done&&TR.done.delete(key),1500);}}}}catch(e){}
  return _w.apply(this,arguments);};}
/* ---- the hands' seed box, redrawn as a box with depth (t325): a plank box seen from above and in front, its top rim lit, its
   right side in shade, the lid tipped back on two iron hinges with its pale inside toward you, seed packets standing up out of
   it (each a printed paper packet: coloured top, pale foot, a little picture of what it grows), a paper tag tacked to the front
   with a drawn sprout on it (no letters: words in a sprite read as a stamp). Same size and foot as before. */
function handBoxSpr(){const W=40,H=40,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};const OL='#140c08';
  const WD=['#2a1a10','#4a3220','#64462c','#7e5a38','#9c7448','#b88e5c'];   // wood, dark to light
  P(5,35,30,2,'rgba(0,0,0,.32)');P(8,37,24,1,'rgba(0,0,0,.2)');                                    // contact shadow
  // the lid, tipped back: narrower at the top as it leans away, inside face pale, two planks, a dark top edge
  for(let y=3;y<14;y++){const ins=Math.round((13-y)*.25),x0=7+ins,x1=31-ins;P(x0-1,y,x1-x0+2,1,OL);P(x0,y,x1-x0,1,y===3?WD[2]:(y===8?'#a88458':y<8?'#d2b080':'#c4a272'));}
  for(let y=4;y<13;y+=1)P(19,y,1,1,'#a88458');P(7,12,4,2,'#3a3a42');P(28,12,4,2,'#3a3a42');P(8,12,2,1,'#8a8a94');P(29,12,2,1,'#8a8a94');   // the seam, the hinges
  // the box: the right side in shade (it turns away), the front lit, the top rim seen from above
  for(let y=16;y<35;y++){P(33,y,1,1,OL);P(34,y,2,1,y<18?WD[2]:WD[1]);P(36,y,1,1,OL);}P(34,15,2,1,WD[3]);P(33,34,4,1,OL);
  P(4,17,30,19,OL);for(let y=18;y<35;y++){const pl=Math.floor((y-18)/6),py=(y-18)%6;P(5,y,28,1,py===0?WD[4]:py===5?WD[1]:WD[3-(pl===1?1:0)]);}   // three front planks, each lit along its top edge
  for(const gx of [9,15,22,28])P(gx,20+(gx%3),2,1,WD[2]);for(const gx of [7,18,26])P(gx,27+(gx%2),3,1,WD[2]);   // grain
  P(5,18,2,17,WD[4]);P(5,18,1,17,WD[5]);P(31,18,2,17,WD[2]);                                          // corner battens, lit left, shaded right
  for(const ny of [20,26,32]){P(6,ny,1,1,'#2a2a30');P(31,ny,1,1,'#2a2a30');}                           // nail heads
  // the rim: the open top seen from above: back rim, the dark inside, the lit front rim
  P(4,13,33,5,OL);P(5,14,31,1,WD[3]);P(5,15,31,2,'#1a100a');P(5,17,28,1,WD[5]);P(33,15,2,2,WD[2]);P(5,15,1,2,WD[4]);
  // the packets standing up out of the box: different heights and leans; coloured top, pale foot, a small picture
  const PK=[[7,'#d07a2a','#f0a050','#5a8a3a',8,0],[12,'#4a7a3a','#7aa85a','#d8c060',11,1],[17,'#a8302a','#d8584a','#f0e0a0',7,0],[22,'#6a4a8a','#9a78b8','#e0c8f0',10,-1],[27,'#c8a030','#ecc85a','#7a5a2a',8,0]];
  for(const [x,cA,cB,pic,h,lean] of PK){const top=16-h;for(let k=0;k<h+1;k++){const dx=lean*(k<3?1:0),yy=top+k;P(x-1+dx,yy,6,1,OL);
      P(x+dx,yy,4,1,k===0?OL:k<4?(k===1?cB:cA):'#efe4c8');P(x+dx,yy,1,1,k===0?OL:k<4?cB:'#fbf4e2');}
    P(x+1,top+5,2,2,pic);P(x+1,top+5,1,1,'#ffffff40');}
  P(5,17,28,1,WD[5]);                                                                                  // the front rim stays over the packet feet
  // a paper tag tacked to the front, a drawn sprout on it
  P(12,21,14,10,OL);P(13,22,12,8,'#e8dcc0');P(13,22,12,1,'#f8f0dc');P(24,23,1,7,'#c8bc9c');P(18,21,2,1,'#5a5a62');
  P(18,24,1,5,'#4a7a2a');P(16,25,2,1,'#6aa83a');P(15,24,2,1,'#8ac850');P(19,23,2,1,'#6aa83a');P(20,22,2,1,'#8ac850');P(16,28,5,1,'#7a5a3a');
  IMG['mem:hand_seedbox']=c;SPR.hand_seedbox={src:'mem:hand_seedbox',fw:W,fh:H,ax:W>>1,ay:H-3,foot:[-.5,-.3,.5,0]};}
try{if(typeof SPR!=='undefined'&&SPR.hand_seedbox)handBoxSpr();}catch(e){}
