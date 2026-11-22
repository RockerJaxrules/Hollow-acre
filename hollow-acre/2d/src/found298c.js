/* ================= #298 part three: each Count close-up stands on the ground the thing really lies on. The close-ups were drawn on
   grounds of their own (a stone wall, a board floor, a dark cornfield) that didn't match where the thing lies in the world. The
   picture of the thing is unchanged; behind it is now the world's own ground at that spot, zoomed in, with whatever stands round it
   there (the fence rail it sits on, the step, the wall, the water's edge, the path), drawn again at the close-up's own pixel size
   rather than enlarged. ================= */
// ---- the ground under a close-up, drawn again at the close-up's own pixel size (the gore close-ups' method, t372d), never
// enlarged: enlarged ground made 2x pixels behind 1 px things. Each world pixel under the patch is sorted into its ground (grass,
// dirt, stone, water, the dark wood floor, tarmac, pale paving, sand, a painted line); each ground keeps its own average colour there,
// the borders follow the world's layout with a wandering 1 px edge, and each ground gets its own fine marks at 1 px. The things
// standing or lying there (a wall, a rail, a step, a stalk) are drawn again at this size too: their shapes and colours sampled
// smooth, kept to their own colours, a 1 px outline where they have one, see-through shadows kept see-through.
const F98_GP=[[78,112,52],[112,78,52],[104,102,106],[62,110,150],[44,54,36],[60,60,64],[158,152,142],[172,150,108],[214,210,198]];
const F98_GK=[0,1,2,3,0,5,2,1,8];   // how each is marked: 0 grass tufts, 1 dirt specks, 2 stone specks, 3 ripples, 5 tarmac wear, 8 none
const f98N=(x,y,s)=>{const xi=Math.floor(x),yi=Math.floor(y),fx=x-xi,fy=y-yi,h=(a,b)=>hash(a*7+s,b*13+s*3),u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
const f98Sd=(c,k)=>[Math.max(0,Math.min(255,Math.round(c[0]*k+(k>1?6:0)))),Math.max(0,Math.min(255,Math.round(c[1]*k+(k>1?5:0)))),Math.max(0,Math.min(255,Math.round(c[2]*k*(k>1?.94:1.04))))];
const f98Lum=(L,i)=>L[i*4]*.3+L[i*4+1]*.59+L[i*4+2]*.11;
// one thing's pixels (ww x hh, the world's size) drawn again into D (cw x ch) at S, the world pixel (x,y) landing at ((x-ox)*S, (y-oy)*S)
function f98Up(D,cw,ch,L,ww,hh,ox,oy,S,flat){const N=ww*hh,sol=new Uint8Array(N),edge=new Uint8Array(N);let any=0;
  for(let i=0;i<N;i++)if(L[i*4+3]>=250){sol[i]=1;any=1;}
  if(any)for(let y=0;y<hh;y++)for(let x=0;x<ww;x++){const i=y*ww+x;if(!sol[i])continue;if((x>0&&!sol[i-1])||(x<ww-1&&!sol[i+1])||(y>0&&!sol[i-ww])||(y<hh-1&&!sol[i+ww]))edge[i]=1;}
  const pal=[];{const seen=new Set();for(let i=0;i<N;i++)if(sol[i]&&!edge[i]){const k=(L[i*4]<<16)|(L[i*4+1]<<8)|L[i*4+2];if(!seen.has(k)){seen.add(k);pal.push([L[i*4],L[i*4+1],L[i*4+2]]);}}}
  const memo=new Map(),near=(r,g,b)=>{const k=((r>>2)<<12)|((g>>2)<<6)|(b>>2);let c=memo.get(k);if(c)return c;let bd=1e9;c=pal[0];for(const p of pal){const d=(p[0]-r)**2+(p[1]-g)**2+(p[2]-b)**2;if(d<bd){bd=d;c=p;}}memo.set(k,c);return c;};
  const at=(u,v)=>{const x=ox+(u+.5)/S-.5,y=oy+(v+.5)/S-.5,xi=Math.floor(x),yi=Math.floor(y);return [x,y,xi,yi,x-xi,y-yi];};
  const pix=(x,y)=>(x<0||y<0||x>=ww||y>=hh)?-1:y*ww+x;
  const IN=new Uint8Array(cw*ch);
  if(any)for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){const [,,xi,yi,fx,fy]=at(u,v);let a=0;
    for(const [dx,dy,w] of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){const i=pix(xi+dx,yi+dy);if(i>=0&&sol[i])a+=w;}
    if(a>=.5)IN[v*cw+u]=1;}
  // see-through pixels (drop shadows, glass, smoke) stay see-through: laid over what is under them, crisp edged
  for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){if(IN[v*cw+u])continue;const [x,y]=at(u,v),i=pix(Math.round(x),Math.round(y));if(i<0||sol[i])continue;const al=L[i*4+3]/255;if(al<.04)continue;
    const o=(v*cw+u)*4;if(!D[o+3]){for(let k=0;k<3;k++)D[o+k]=L[i*4+k];D[o+3]=Math.round(al*255);}else for(let k=0;k<3;k++)D[o+k]=Math.round(D[o+k]*(1-al)+L[i*4+k]*al);}
  if(!any)return;
  for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){if(!IN[v*cw+u])continue;const [x,y,xi,yi,fx,fy]=at(u,v),o=(v*cw+u)*4;
    const rim=!flat&&((u>0&&!IN[v*cw+u-1])||(u<cw-1&&!IN[v*cw+u+1])||(v>0&&!IN[(v-1)*cw+u])||(v<ch-1&&!IN[(v+1)*cw+u]));
    let col=null;
    if(rim){let bi=-1,bd=9;for(let dy=-1;dy<=2;dy++)for(let dx=-1;dx<=2;dx++){const i=pix(xi+dx,yi+dy);if(i<0||!edge[i])continue;const d=(xi+dx-x)**2+(yi+dy-y)**2;if(d<bd){bd=d;bi=i;}}
      if(bi>=0)col=[L[bi*4],L[bi*4+1],L[bi*4+2]];}   // the thing's own outline, one pixel wide, its own lit and dark parts kept
    if(!col&&!flat){let bi=-1,bw=0;for(const [dx,dy,ww_] of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){const i=pix(xi+dx,yi+dy);if(i>=0&&ww_>bw){bw=ww_;bi=i;}}
      if(bi>=0&&sol[bi]&&!edge[bi]){const px_=bi%ww,py_=(bi/ww)|0;   // a dark line one world pixel wide (mortar, a seam) stays one pixel wide
        for(const [ax_,ay_,pos] of [[1,0,x-px_],[0,1,y-py_]]){const a=pix(px_-ax_,py_-ay_),b=pix(px_+ax_,py_+ay_);if(a<0||b<0||!sol[a]||!sol[b])continue;
          const da=f98Lum(L,a)-f98Lum(L,bi),db=f98Lum(L,b)-f98Lum(L,bi);   // (a light line, such as pale mortar, too)
          if(S>=1.5&&Math.abs(da)>28&&Math.abs(db)>28&&da*db>0){col=pos<-.01?[L[bi*4],L[bi*4+1],L[bi*4+2]]:[L[b*4],L[b*4+1],L[b*4+2]];break;}}}}
    let bev=0;if(!col&&!flat&&!rim&&S>=1.5){const bi=pix(Math.round(x),Math.round(y));if(bi>=0&&sol[bi]&&!edge[bi]){const px_=bi%ww,py_=(bi/ww)|0,up=pix(px_,py_-1),dn=pix(px_,py_+1),same=(i,j)=>L[i*4]===L[j*4]&&L[i*4+1]===L[j*4+1]&&L[i*4+2]===L[j*4+2];
      // each patch of one colour at least two world pixels tall gets a 1 px lit top and a 1 px shaded foot at this size (a brick, a stone, a board)
      if(y-py_<-.5+1/S&&up>=0&&sol[up]&&!same(up,bi)&&Math.abs(f98Lum(L,up)-f98Lum(L,bi))>12&&dn>=0&&same(dn,bi))bev=1;
      else if(y-py_>.5-1/S&&dn>=0&&sol[dn]&&!same(dn,bi)&&Math.abs(f98Lum(L,dn)-f98Lum(L,bi))>12&&up>=0&&same(up,bi))bev=-1;}}
    if(!col){let r=0,g=0,b=0,w=0;for(const [dx,dy,ww_] of [[0,0,(1-fx)*(1-fy)],[1,0,fx*(1-fy)],[0,1,(1-fx)*fy],[1,1,fx*fy]]){const i=pix(xi+dx,yi+dy);if(i<0||!sol[i]||(edge[i]&&!flat)||ww_<=0)continue;r+=L[i*4]*ww_;g+=L[i*4+1]*ww_;b+=L[i*4+2]*ww_;w+=ww_;}
      if(w>0&&pal.length)col=near(r/w,g/w,b/w);
      else{const i=pix(Math.round(x),Math.round(y));if(i>=0&&sol[i])col=[L[i*4],L[i*4+1],L[i*4+2]];}}   // a part too thin to have an inside keeps its own pixel
    if(!col)continue;if(bev)col=f98Sd(col,bev>0?1.1:.86);D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}}
// f98Ground(at, cw, ch, S, ax, ay, opt): a cw x ch picture of the world round the point at={x,z} (metres) at S times the world, at
// landing on (ax,ay). opt.skip: objects left out (the thing the close-up shows); opt.skipRe: sprite names left out; opt.noProps.
function f98Ground(at,cw,ch,S,ax,ay,opt){opt=opt||{};const skip=opt.skip||[],sre=opt.skipRe||/^(f98_|rem_)/;
  const W0=at.x*PPM-ax/S,H0=at.z*PPM-ay/S,ww=Math.ceil(cw/S)+3,hh=Math.ceil(ch/S)+3,bx=Math.floor(W0)-1,by=Math.floor(H0)-1,ox=W0-bx,oy=H0-by;
  const src=document.createElement('canvas');src.width=ww;src.height=hh;const sg=src.getContext('2d');sg.imageSmoothingEnabled=false;
  for(let cy=Math.floor(by/CH);cy<=Math.floor((by+hh)/CH);cy++)for(let cx=Math.floor(bx/CH);cx<=Math.floor((bx+ww)/CH);cx++){try{sg.drawImage(chunk(cx,cy),cx*CH-bx,cy*CH-by);}catch(e){}}
  const sd=sg.getImageData(0,0,ww,hh).data,NP=F98_GP.length,cls=new Uint8Array(ww*hh),cnt=new Array(NP).fill(0);
  const nearest=(r,g,b,ok)=>{let best=-1,bd=1e9;for(let k=0;k<NP;k++){if(ok&&!ok[k])continue;const p=F98_GP[k],d=(p[0]-r)**2+(p[1]-g)**2+(p[2]-b)**2;if(d<bd){bd=d;best=k;}}return best;};
  for(let i=0;i<ww*hh;i++){cls[i]=nearest(sd[i*4],sd[i*4+1],sd[i*4+2]);cnt[cls[i]]++;}
  const keep=cnt.map(n=>n>=ww*hh*.015);if(!keep.some(k=>k))keep[cls[0]]=true;   // a ground with only a few stray pixels here isn't a ground here
  const sum=F98_GP.map(()=>[0,0,0,0]);for(let i=0;i<ww*hh;i++){if(!keep[cls[i]])cls[i]=nearest(sd[i*4],sd[i*4+1],sd[i*4+2],keep);const s_=sum[cls[i]];s_[0]+=sd[i*4];s_[1]+=sd[i*4+1];s_[2]+=sd[i*4+2];s_[3]++;}
  const avg=sum.map((s_,k)=>s_[3]?[s_[0]/s_[3],s_[1]/s_[3],s_[2]/s_[3]]:F98_GP[k]);
  const out=document.createElement('canvas');out.width=cw;out.height=ch;const g=out.getContext('2d');const id=g.createImageData(cw,ch),D=id.data,CL=new Uint8Array(cw*ch);
  for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){const x=ox+(u+.5)/S-.5,y=oy+(v+.5)/S-.5,xi=Math.max(0,Math.min(ww-2,x|0)),yi=Math.max(0,Math.min(hh-2,y|0)),fx=x-xi,fy=y-yi,w=new Array(NP).fill(0);
    w[cls[yi*ww+xi]]+=(1-fx)*(1-fy);w[cls[yi*ww+xi+1]]+=fx*(1-fy);w[cls[(yi+1)*ww+xi]]+=(1-fx)*fy;w[cls[(yi+1)*ww+xi+1]]+=fx*fy;
    for(let k=0;k<NP;k++)if(w[k])w[k]+=(f98N(u/3,v/3,k*31)-.5)*.5;   // the border wanders a little at 1 px
    let c=0;for(let k=1;k<NP;k++)if(w[k]>w[c])c=k;CL[v*cw+u]=c;}
  for(let v=0;v<ch;v++)for(let u=0;u<cw;u++){const c=CL[v*cw+u],K=F98_GK[c],A=avg[c],o=(v*cw+u)*4;let col=A;
    const patch=f98N(u/26,v/18,c*7+3);col=f98Sd(A,K===8?1:patch>.62?1.07:patch<.3?.94:1);   // big soft patches, no speckle
    if(K===0){const band=Math.floor(v/4),bo=Math.floor(hash(u,band*3+1)*3),inb=v-band*4-bo,dens=f98N(u/11,v/8,c+11)>.55?.42:.05;   // grass: tufts of blades in clumps, lit tips, a shadow at the foot
      if(hash(u,band*7+2)<dens&&inb>=0&&inb<3)col=inb===0?f98Sd(A,c===4?1.18:1.28):f98Sd(A,1.1);
      else if(hash(u,band*7+2-7)<dens&&v-(band-1)*4-Math.floor(hash(u,(band-1)*3+1)*3)===3)col=f98Sd(A,.8);}
    else if(K===1||K===2){const inCl=f98N(u/9,v/7,c*5+1)>.6;   // dirt and stone: specks gathered in a few clusters, a pebble lit on top
      if(inCl&&hash(u>>2,(v>>2)*5+c)<.45){const px_=u&3,py_=v&3;if(px_<2&&py_<2)col=py_===0?f98Sd(A,K===2?1.25:1.18):f98Sd(A,.76);}
      else if(hash(u,v*3+c)<.012)col=f98Sd(A,.82);}
    else if(K===3){if(hash(u>>2,v)<.06&&(v%3===0))col=f98Sd(A,1.25);}   // ripples
    else if(K===5){if(f98N(u/5,v/4,c*3+7)>.7)col=f98Sd(A,1.07);else if(f98N(u/6,v/3,c*3+9)>.74)col=f98Sd(A,.92);}   // tarmac: worn flat patches in two close tones
    if(v>0){const up=CL[(v-1)*cw+u];if(up!==c&&(K===1||K===2)&&F98_GK[up]===0)col=f98Sd(A,.74);}   // dirt sinks a little under the grass's edge
    D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
  if(!opt.noProps){const L=[];for(const q of OBJ){if(q.room||q.hide||skip.includes(q)||!q.spr||sre.test(q.spr))continue;const m=SPR[q.spr];if(!m||!IMG[m.src])continue;const X=q.x*PPM,Y=q.z*PPM;
      if(X-m.ax>bx+ww||X-m.ax+m.fw<bx||Y-m.ay>by+hh||Y-m.ay+m.fh<by)continue;
      const vis=Math.min(X-m.ax+m.fw,W0+cw/S)-Math.max(X-m.ax,W0);if(q.kind!=='flat'&&vis<Math.min(12,m.fw*.35))continue;   // a sliver of something cut off at the edge reads as a glitch: leave it out
      if(opt.frontZ!=null&&q.kind!=='flat'&&q.z>opt.frontZ&&Y>H0+ch/S+2)continue;   // so does the top of a thing whose foot is below the picture, laid over the find
      L.push(q);}
    let PZ=[];try{const os=typeof onScreen==='function'?onScreen:null;if(os)onScreen=()=>true;PORCH.frame=-1;try{PZ=porchZones().slice();}finally{if(os)onScreen=os;PORCH.frame=-1;}}catch(e){PZ=[];}   // every porch's steps, not only those on screen now
    try{for(const q of PZ){const m=SPR[q.spr];if(!m||!IMG[m.src])continue;const X=q.x*PPM,Y=q.z1*PPM;if(X-m.ax>bx+ww||X-m.ax+m.fw<bx||Y-m.ay>by+hh||Y-m.ay+m.fh<by)continue;L.push({spr:q.spr,x:q.x,z:q.z1,sz:q.z0+.05});}}catch(e){}
    L.sort((a,b)=>((a.kind==='flat')-(b.kind==='flat'))*-1e6+((a.sz!=null?a.sz:a.z)-(b.sz!=null?b.sz:b.z)));
    const lc=document.createElement('canvas');lc.width=ww;lc.height=hh;const lg=lc.getContext('2d');lg.imageSmoothingEnabled=false;
    // with opt.frontZ, what stands in front of the thing (nearer the viewer than frontZ) goes on a layer of its own, out.front,
    // to be laid over the thing as it is in the world
    const fid=opt.frontZ!=null?g.createImageData(cw,ch):null;
    for(const q of L){const fr=fid&&q.kind!=='flat'&&(q.sz!=null?q.sz:q.z)>opt.frontZ;try{lg.clearRect(0,0,ww,hh);drawSpr(q.spr,q.x*PPM-bx,q.z*PPM-by,undefined,undefined,0,{ctx:lg,flip:q.flip});f98Up(fr?fid.data:D,cw,ch,lg.getImageData(0,0,ww,hh).data,ww,hh,ox,oy,S,q.kind==='flat');}catch(e){}}
    if(fid){const f=document.createElement('canvas');f.width=cw;f.height=ch;f.getContext('2d').putImageData(fid,0,0);out.front=f;}}
  g.putImageData(id,0,0);return out;}
// the world round a find, drawn again at the close-up's size; the find's middle lands at (cx,cy) of a cw x ch picture
function f98Backdrop(id,cw,ch,cx,cy){const o=RGC_OBJ[id],d=F98_FIND[id];if(!o)return null;const lift=(d&&d.lift)||0,up=d?((d.gy||d.y+5)-d.y):5;
  return f98Ground({x:o.x,z:o.z-(lift+up)/PPM},cw,ch,2,cx,cy,{skip:[o]});}
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
