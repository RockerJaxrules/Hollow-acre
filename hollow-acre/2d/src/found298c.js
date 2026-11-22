/* ================= #298 part three: each Count close-up stands on the ground the thing really lies on. The close-ups were drawn on
   grounds of their own (a stone wall, a board floor, a dark cornfield) that didn't match where the thing lies in the world. The
   picture of the thing is unchanged; behind it is now the world's own ground at that spot, zoomed in, with whatever stands round it
   there (the fence rail it sits on, the step, the wall, the water's edge, the path). ================= */
// the world round a find, as the world draws it (its ground and the things standing there, not the find, not people), zoomed 2x
// with Scale2x so edges stay one pixel crisp; the find's middle lands at (cx,cy) of a cw x ch picture
function f98Backdrop(id,cw,ch,cx,cy){const o=RGC_OBJ[id],d=F98_FIND[id];if(!o)return null;const lift=(d&&d.lift)||0,up=d?((d.gy||d.y+5)-d.y):5;
  const wx=Math.round(o.x*PPM),wy=Math.round(o.z*PPM)-lift-up,W=Math.ceil(cw/2)+3,H=Math.ceil(ch/2)+3,x0=wx-Math.round(cx/2)-1,y0=wy-Math.round(cy/2)-1;
  const s=document.createElement('canvas');s.width=W;s.height=H;const g=s.getContext('2d');g.imageSmoothingEnabled=false;
  for(let kz=Math.floor(y0/CH);kz<=Math.floor((y0+H)/CH);kz++)for(let kx=Math.floor(x0/CH);kx<=Math.floor((x0+W)/CH);kx++){const k=chunk(kx,kz);if(k)g.drawImage(k,kx*CH-x0,kz*CH-y0);}
  const L=[];for(const q of OBJ){if(q.room||q.hide||q===o||!q.spr||/^(f98_|rem_)/.test(q.spr))continue;const m=SPR[q.spr];if(!m||!IMG[m.src])continue;const X=q.x*PPM,Y=q.z*PPM;
    if(X-m.ax>x0+W||X-m.ax+m.fw<x0||Y-m.ay>y0+H||Y-m.ay+m.fh<y0)continue;L.push(q);}
  let PZ=[];try{const os=typeof onScreen==='function'?onScreen:null;if(os)onScreen=()=>true;PORCH.frame=-1;try{PZ=porchZones().slice();}finally{if(os)onScreen=os;PORCH.frame=-1;}}catch(e){PZ=[];}   // every porch's steps, not only those on screen now
  try{for(const q of PZ){const m=SPR[q.spr];if(!m||!IMG[m.src])continue;const X=q.x*PPM,Y=q.z1*PPM;if(X-m.ax>x0+W||X-m.ax+m.fw<x0||Y-m.ay>y0+H||Y-m.ay+m.fh<y0)continue;L.push({spr:q.spr,x:q.x,z:q.z1,sz:q.z0+.05});}}catch(e){}   // the porch steps
  L.sort((a,b)=>((a.kind==='flat')-(b.kind==='flat'))*-1e6+((a.sz!=null?a.sz:a.z)-(b.sz!=null?b.sz:b.z)));for(const q of L){try{drawSpr(q.spr,q.x*PPM-x0,q.z*PPM-y0,undefined,undefined,0,{ctx:g,flip:q.flip});}catch(e){}}
  // Scale2x: every pixel becomes four, and a corner takes its neighbours' colour where two of them agree across an edge
  const id0=g.getImageData(0,0,W,H).data,out=document.createElement('canvas');out.width=cw;out.height=ch;const og=out.getContext('2d'),od=og.createImageData(cw,ch),D=od.data;
  const at=(x,y)=>{x=Math.max(0,Math.min(W-1,x));y=Math.max(0,Math.min(H-1,y));return (y*W+x)*4;},same=(a,b)=>id0[a]===id0[b]&&id0[a+1]===id0[b+1]&&id0[a+2]===id0[b+2];
  for(let Y=0;Y<ch;Y++)for(let X=0;X<cw;X++){const sx=(X>>1)+1,sy=(Y>>1)+1,qx=X&1,qy=Y&1;const p=at(sx,sy),A=at(sx,sy-1),B=at(sx+1,sy),C=at(sx-1,sy),Dn=at(sx,sy+1);let r=p;
    if(!qx&&!qy){if(same(C,A)&&!same(C,Dn)&&!same(A,B))r=A;}else if(qx&&!qy){if(same(A,B)&&!same(A,C)&&!same(B,Dn))r=B;}else if(!qx&&qy){if(same(Dn,C)&&!same(Dn,B)&&!same(C,A))r=C;}else{if(same(B,Dn)&&!same(B,A)&&!same(Dn,C))r=Dn;}
    const t=(Y*cw+X)*4;D[t]=id0[r];D[t+1]=id0[r+1];D[t+2]=id0[r+2];D[t+3]=255;}
  og.putImageData(od,0,0);return out;}
// things the close-up's picture needs that the world holds in the find's own sprite (the stalk the bonnet hangs from, the rocks round the cap)
const F98_CU_EXTRA={
  corn:(P,x,y)=>{const st=['#3a2e10','#6a5a24','#8a7434','#b09a4c'],sx=x+20;for(let yy=0;yy<104;yy++){P(sx,yy,4,1,st[2]);P(sx,yy,1,1,st[3]);P(sx+3,yy,1,1,st[1]);if(yy%21===8)P(sx,yy,4,1,st[0]);}
    for(let t=0;t<24;t++){const px=sx-t,py=y-30-Math.round(Math.sin(t/23*2.4)*4)+Math.round((t/23)**2*6);P(px,py,1,2,st[2]);P(px,py,1,1,st[3]);}},
};
// the flat cap at the plunge pool's edge, as it lies: no rocks drawn round it in either picture (the world's edge is its own)
F98_FIND.falls.d=(P,x,y)=>f98Flat(P,x,y,{c:'#7a6248'});
{const _ca=cgArt;cgArt=function(id){const d=CG_FIND[id];if(!d||typeof RGC_OBJ==='undefined'||!RGC_OBJ[id]||!F98S.placed)return _ca(id);
  try{return sgtC('cg2_'+id,96,64,(Q,g)=>{const [cx0,cy0]=d.at||[80,52],ox=Math.max(0,Math.min(64,cx0-48)),oy=Math.max(0,Math.min(40,cy0-30)),P=(x,y,w,h,c)=>Q(x-ox,y-oy,w,h,c);
      const [x,y]=d.pos||d.at||[80,52];const bd=f98Backdrop(id,96,64,x-ox,y-oy);if(bd)g.drawImage(bd,0,0);else cgGround(P,d.g);
      if(F98_CU_EXTRA[id])F98_CU_EXTRA[id](P,x,y);(CG_DRAW[d.k]||cgShoe)(P,x,y,d.o||{});});}catch(e){return _ca(id);}};}
