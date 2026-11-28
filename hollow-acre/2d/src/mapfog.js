// ================================================================ the map is found by walking it (owner: "Add exploitation system to map
// where you don't know where everything is until you have been there like lots of games do").
//   - The map starts blank paper except where you've been. Wherever you walk, about sixteen metres round you is drawn in (inside a
//     building, the street outside its door), and stays drawn: it's kept in the save.
//   - The edge of what you know is inked by hand in the map's own browns: a ragged line, a second fainter one inside it, and the
//     blank paper past it hatched like an old survey, every pixel crisp at any zoom (no blur).
//   - A place's name, its icon, the people you've met, the bus stops and the milestones show only once you've been there or been
//     told of it: your goal, a place someone you've talked to lives or works, your own pins. Your goal and your pins always show.
//   - Travelling by milestone from the map only goes to milestones you've stood at.
//   - On a shared farm everyone's walking draws the same map: what a friend finds is on yours too, and the farm keeps it.
//   - A game saved before this already knows its map: what you'd walked is worked out from where you've been and what you've done
//     (the farm, the town, the people you've met, their homes and shops, the places in the county you've found, your pins, the
//     milestones; after the first day the whole old valley), so nobody loses any of their map.
const FOG={cs:2,R:16,g:null,gw:0,gh:0,x0:0,z0:0,ver:0,cv:null,cx:null,dirty:null,news:[],sent:0,saveT:0,sid:'',on:true,r:2,itemsC:null,pend:false,noise:null,img:null};
const FOG_COL={paper:[216,192,138],hatch:[203,178,124],speckD:[196,168,116],speckL:[230,212,164],ink:[58,34,16],ring:[176,146,96]};
// ---- the grid: one cell per two metres of the valley, 1 once you've been near it
function fogDims(){FOG.cs=2;FOG.x0=B.x0;FOG.z0=B.z0;FOG.gw=Math.ceil((B.x1-B.x0)/FOG.cs);FOG.gh=Math.ceil((B.z1-B.z0)/FOG.cs);}
function fogIdx(x,z){const i=Math.floor((x-FOG.x0)/FOG.cs),j=Math.floor((z-FOG.z0)/FOG.cs);return i<0||j<0||i>=FOG.gw||j>=FOG.gh?-1:j*FOG.gw+i;}
function fogAt(x,z){if(!FOG.g)return true;const i=fogIdx(x,z);return i>=0&&FOG.g[i]===1;}
// a place counts as found if the ground right round it is (a name on a house at the very edge of what you've seen)
function fogShown(x,z){if(!FOG.g)return true;if(!FOG.bl||FOG.dirty||FOG.full){try{if(FOG.full)fogBlur(0,0,FOG.gw-1,FOG.gh-1);else if(FOG.dirty){const d=FOG.dirty;fogBlur(d[0]-3,d[1]-3,d[2]+3,d[3]+3);}}catch(e){}}return fogField(x,z)>.45;}   // (as the map draws it)
function fogNear(x,z,r){if(!FOG.g)return true;r=r==null?4:r;for(let dz=-r;dz<=r;dz+=FOG.cs)for(let dx=-r;dx<=r;dx+=FOG.cs){if(dx*dx+dz*dz>r*r+.01)continue;if(fogAt(x+dx,z+dz))return true;}return false;}
function fogMark(i){if(FOG.g[i]===1)return false;FOG.g[i]=1;FOG.news.push(i);return true;}
function fogDirty(i0,j0,i1,j1){const d=FOG.dirty;if(!d)FOG.dirty=[i0,j0,i1,j1];else{d[0]=Math.min(d[0],i0);d[1]=Math.min(d[1],j0);d[2]=Math.max(d[2],i1);d[3]=Math.max(d[3],j1);}}
function fogReveal(x,z,R){if(!FOG.g||!isFinite(x)||!isFinite(z))return 0;const cs=FOG.cs,i0=Math.max(0,Math.floor((x-R-FOG.x0)/cs)),i1=Math.min(FOG.gw-1,Math.floor((x+R-FOG.x0)/cs)),
    j0=Math.max(0,Math.floor((z-R-FOG.z0)/cs)),j1=Math.min(FOG.gh-1,Math.floor((z+R-FOG.z0)/cs));let n=0;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const cx=FOG.x0+(i+.5)*cs-x,cz=FOG.z0+(j+.5)*cs-z;if(cx*cx+cz*cz>R*R)continue;if(fogMark(j*FOG.gw+i))n++;}
  if(n){fogDirty(i0,j0,i1,j1);FOG.ver++;}return n;}
// a whole area (a county place found, the old valley): its edge wanders in and out by up to ten metres, as if walked, not ruled
function fogRect(x0,z0,x1,z1){if(!FOG.g)return;const cs=FOG.cs,M=10,i0=Math.max(0,Math.floor((x0-M-FOG.x0)/cs)),i1=Math.min(FOG.gw-1,Math.floor((x1+M-FOG.x0)/cs)),j0=Math.max(0,Math.floor((z0-M-FOG.z0)/cs)),j1=Math.min(FOG.gh-1,Math.floor((z1+M-FOG.z0)/cs));
  let n=0;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=FOG.x0+(i+.5)*cs,z=FOG.z0+(j+.5)*cs;
    const d=Math.min(x0<=B.x0+1?1e9:x-x0,x1>=B.x1-1?1e9:x1-x,z0<=B.z0+1?1e9:z-z0,z1>=B.z1-1?1e9:z1-z);   // (the valley's own edge is no edge)
    const w=(fogVal(x+101,z+57,26)-.5)*2*M+(fogVal(x+13,z+211,9)-.5)*6;if(d+w>0&&fogMark(j*FOG.gw+i))n++;}
  if(n){fogDirty(i0,j0,i1,j1);FOG.ver++;}}
function fogLine(ax,az,bx,bz,R){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/(R*.7)));for(let k=0;k<=n;k++)fogReveal(ax+(bx-ax)*k/n,az+(bz-az)*k/n,R);}
// ---- kept in the save: runs of found and not found, packed small
function fogPack(){const g=FOG.g,N=g.length,out=[];let i=0,cur=0;while(i<N){let j=i;while(j<N&&g[j]===cur)j++;let v=j-i;do{let b=v&127;v=Math.floor(v/128);if(v)b|=128;out.push(b);}while(v);cur^=1;i=j;}
  let s='';for(let k=0;k<out.length;k+=4096)s+=String.fromCharCode.apply(null,out.slice(k,k+4096));return {v:1,cs:FOG.cs,x0:FOG.x0,z0:FOG.z0,gw:FOG.gw,gh:FOG.gh,d:btoa(s)};}
function fogUnpack(F){try{if(!F||F.v!==1||typeof F.d!=='string')return null;const bin=atob(F.d),g=new Uint8Array(F.gw*F.gh);let p=0,i=0,cur=0;
    while(p<bin.length&&i<g.length){let v=0,mul=1,b;do{b=bin.charCodeAt(p++);v+=(b&127)*mul;mul*=128;}while(b&128);if(cur)g.fill(1,i,Math.min(g.length,i+v));i+=v;cur^=1;}return g;}catch(e){return null;}}
function fogLoad(F){const src=fogUnpack(F);if(!src)return false;if(F.gw===FOG.gw&&F.gh===FOG.gh&&F.x0===FOG.x0&&F.z0===FOG.z0&&F.cs===FOG.cs){for(let i=0;i<src.length;i++)if(src[i])FOG.g[i]=1;}
  else{for(let j=0;j<F.gh;j++)for(let i=0;i<F.gw;i++){if(!src[j*F.gw+i])continue;const x=F.x0+(i+.5)*F.cs,z=F.z0+(j+.5)*F.cs;const k=fogIdx(x,z);if(k>=0)FOG.g[k]=1;}}   /* (the valley grew: the old cells by where they are) */
  return true;}
function fogSave(){if(!FOG.g||typeof S==='undefined')return;try{S.fog=fogPack();}catch(e){}}
// ---- a game saved before this: what was walked, worked out from where you've been and what you've done
function fogPlace(n){try{const p=MAP_PLACES.find(q=>q[0]===n);return p&&isFinite(p[1])?p:null;}catch(e){return null;}}
function fogEstimate(){const day=S.day|0,talked=S.talked||{};const at=(n,R)=>{const p=fogPlace(n);if(p)fogReveal(p[1],p[2],R);};
  // where you are, and where you came off the road
  try{const y=m6You();fogReveal(y.x,y.z,FOG.R);}catch(e){}at('Your car',20);
  const farm=S.foundCabin||day>1||(typeof tiles!=='undefined'&&tiles.some(t=>t.tilled||t.crop));const town=S.visitedTown||day>1||Object.keys(talked).length>0;
  if(farm){at('Hollow Acre',30);const a=fogPlace('Your car'),b=fogPlace('Hollow Acre');if(a&&b)fogLine(a[1],a[2],b[1],b[2],10);}
  if(town){for(const n of ['Marrow Hollow','Market Lane','Coyle’s store','Church','Post office','The green','Town hall','Schoolhouse','Crossroads','Forge'])at(n,20);
    const a=fogPlace('Hollow Acre'),b=fogPlace('Marrow Hollow');if(a&&b)fogLine(a[1],a[2],b[1],b[2],10);}
  // the people you've talked to: where they live and where they work
  try{for(const id of Object.keys(talked)){const L=LIFE[id];const h=L&&HOMES[L.home];if(h&&h.door)fogReveal(h.door[0],h.door[1],12);
      for(const [n,sh] of Object.entries(M6SHOP))if(sh.who&&sh.who.includes(id))at(n,16);}}catch(e){}
  if(S.carFixed||(S.q&&S.q.hollis))at('Pruitt’s Garage',16);if((S.mineDeep|0)>0||(S.mineFloor|0)>0)at('Old mine',16);
  // the county's places you've found (each whole), the milestones you've stood at, your pins
  try{for(const r of REGS)if(S.rg&&S.rg.seen&&S.rg.seen[r.k])fogRect(r.x0,r.z0,r.x1,r.z1);}catch(e){}
  try{for(const m of RG_MILES)if(S.rg&&S.rg.seen&&S.rg.seen[m.k])fogReveal(m.x,m.z,16);}catch(e){}
  try{for(const m of (S.marks||[]))fogReveal(m.x,m.z,12);}catch(e){}
  // after the first day, the old valley (the farm, the town and the roads between) has been walked
  if(day>1&&typeof OLDB!=='undefined')fogRect(OLDB.x0,OLDB.z0,OLDB.x1,OLDB.z1);}
// ---- told of: your goal, where someone you've talked to lives and works (kept with the farm)
function fogTold(id){if(typeof S==='undefined')return;if(!S.mapTold||typeof S.mapTold!=='object')S.mapTold={};if(S.mapTold[id])return;S.mapTold[id]=S.day||1;FOG.ver++;}
function fogTellPerson(id){try{const L=LIFE[id];if(L&&L.home)fogTold('h:'+L.home);for(const [n,sh] of Object.entries(M6SHOP))if(sh.who&&sh.who.includes(id))fogTold('p:'+n);
    const L2=L&&HOMES[L.home];if(L2&&L2.door)for(const [n,x,z] of MAP_PLACES)if(Math.hypot(x-L2.door[0],z-L2.door[1])<7)fogTold('p:'+n);}catch(e){}}
{const _t=talk;talk=function(n){try{if(n&&n.def)fogTellPerson(n.def.id);}catch(e){}return _t.apply(this,arguments);};}
// ---- starting, loading, joining: the grid from the save (or worked out), once per game
function fogInit(){fogDims();FOG.g=new Uint8Array(FOG.gw*FOG.gh);FOG.full=true;FOG.rowY=0;FOG.dirty=null;FOG.news=[];FOG.ver++;
  if(!(S.fog&&fogLoad(S.fog))){fogEstimate();FOG.news=[];}
  try{for(const id of Object.keys(S.talked||{}))fogTellPerson(id);}catch(e){}
  S.fogId=S.fogId||(Date.now().toString(36)+Math.floor(Math.random()*1e6).toString(36));FOG.sid=S.fogId;fogSave();}
// a new game (the drive in): a blank map, whatever the page held before
if(typeof startCine==='function'){const _sc=startCine;startCine=function(n){if(n==='intro'){try{delete S.fog;delete S.fogId;delete S.mapTold;FOG.g=null;FOG.sid='';}catch(e){}}return _sc.apply(this,arguments);};}
{const _lg=loadGame;loadGame=function(){try{delete S.fog;delete S.fogId;delete S.mapTold;}catch(e){}const r=_lg.apply(this,arguments);try{fogInit();}catch(e){console.warn(e);}return r;};}
if(typeof applySnap==='function'){const _as=applySnap;applySnap=function(){const keep=FOG.g&&FOG.g.slice();const r=_as.apply(this,arguments);
    // (the host's map, and anything walked here that hasn't reached them yet)
    try{fogDims();FOG.g=new Uint8Array(FOG.gw*FOG.gh);if(S.fog)fogLoad(S.fog);if(keep&&keep.length===FOG.g.length)for(let i=0;i<keep.length;i++)if(keep[i])FOG.g[i]=1;FOG.full=true;FOG.rowY=0;FOG.ver++;FOG.sid=S.fogId||'';}catch(e){}return r;};}
// ---- walking draws the map in: around you, or the street outside the building you're in
setInterval(()=>{try{if(typeof S==='undefined'||S.mode!=='play')return;if(!FOG.g||(S.fogId&&S.fogId!==FOG.sid)||(!S.fogId&&FOG.sid))fogInit();
    const y=m6You();const R=y.inside?10:FOG.R;fogReveal(y.x,y.z,R);
    const now=performance.now();if(FOG.news.length&&now-FOG.saveT>3000){FOG.saveT=now;fogSave();fogShare();}}catch(e){}},300);
// ---- a shared farm: everyone's finds go to everyone (and the host keeps them in the farm's save)
function fogShare(){try{if(typeof HOST==='undefined'||!HOST.role||typeof CO==='undefined'||!CO.room||!CO.room.emit){FOG.news=[];return;}const L=FOG.news.splice(0,4000);if(L.length)CO.room.emit('fog',{v:1,gw:FOG.gw,gh:FOG.gh,c:L});}catch(e){}}
if(typeof hostWire==='function'){const off=[];const _hw=hostWire;hostWire=function(){const r=_hw.apply(this,arguments);for(const f of off.splice(0))try{f();}catch(e){}const R=CO.room;
  if(R&&R.on)off.push(R.on('fog',m=>{try{if(!m||m.isMe)return;const d=m.data;if(!d||d.v!==1||d.gw!==FOG.gw||d.gh!==FOG.gh||!Array.isArray(d.c)||!FOG.g)return;let n=0;
      for(const i of d.c.slice(0,6000)){const k=i|0;if(k>=0&&k<FOG.g.length&&FOG.g[k]!==1){FOG.g[k]=1;n++;const ci=k%FOG.gw,cj=(k/FOG.gw)|0;fogDirty(ci,cj,ci,cj);}}
      if(n){FOG.ver++;if(HOST.role==='host')fogSave();}}catch(e){}}));
  return r;};}

// ================================================================ drawing it: the unknown as blank paper, the edge inked by hand
// The fog is a picture the size of half the map's paper (each of its pixels two of the paper's), drawn over the paper with the paper's
// own transform and no smoothing, so its edge is in crisp steps at every zoom. Only the part that changed is painted again.
function fogNoiseTab(){if(FOG.noise)return FOG.noise;const N=64,t=new Float32Array(N*N);for(let i=0;i<N*N;i++)t[i]=m6Hash(i%N,(i/N)|0);FOG.noise={N,t};return FOG.noise;}
function fogVal(x,z,sc){const {N,t}=fogNoiseTab();const X=x/sc,Z=z/sc,i=Math.floor(X),j=Math.floor(Z),fx=X-i,fz=Z-j,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
  const a=t[((j&63)*N)+(i&63)],b=t[((j&63)*N)+((i+1)&63)],c=t[(((j+1)&63)*N)+(i&63)],d=t[(((j+1)&63)*N)+((i+1)&63)];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
// the grid softened (each cell the mean of the 5 x 5 round it), so an edge can wander a few metres either way
const FOG_BR=2;
function fogBlur(i0,j0,i1,j1){const W=FOG.gw,H=FOG.gh,G=FOG.g;if(!FOG.bl||FOG.bl.length!==W*H){FOG.bl=new Float32Array(W*H);i0=0;j0=0;i1=W-1;j1=H-1;}
  i0=Math.max(0,i0);j0=Math.max(0,j0);i1=Math.min(W-1,i1);j1=Math.min(H-1,j1);const r=FOG_BR,n=2*r+1;const tw=i1-i0+1,th=j1-j0+1+2*r;const T=new Float32Array(tw*th);
  for(let jj=0;jj<th;jj++){const j=j0-r+jj;if(j<0||j>=H)continue;for(let ii=0;ii<tw;ii++){const i=i0+ii;let a=0;for(let d=-r;d<=r;d++){const q=i+d;if(q>=0&&q<W)a+=G[j*W+q];}T[jj*tw+ii]=a/n;}}
  for(let jj=0;jj<j1-j0+1;jj++)for(let ii=0;ii<tw;ii++){let a=0;for(let d=0;d<n;d++)a+=T[(jj+d)*tw+ii];FOG.bl[(j0+jj)*W+i0+ii]=a/n;}}
// the explored field round a point: the softened grid read smoothly, roughened by three scales of noise, then cut at a half
function fogField(wx,wz){const cs=FOG.cs,gx=(wx-FOG.x0)/cs-.5,gz=(wz-FOG.z0)/cs-.5,i=Math.floor(gx),j=Math.floor(gz),fx=gx-i,fz=gz-j;const G=FOG.bl,W=FOG.gw,H=FOG.gh;
  if(!G)return 0;const at=(a,b)=>a<0||b<0||a>=W||b>=H?0:G[b*W+a];const e=at(i,j)*(1-fx)*(1-fz)+at(i+1,j)*fx*(1-fz)+at(i,j+1)*(1-fx)*fz+at(i+1,j+1)*fx*fz;
  if(e<=0||e>=1)return e;return e+(fogVal(wx+7,wz+3,17)-.5)*.42+(fogVal(wx,wz,6)-.5)*.42+(fogVal(wx+31,wz+17,2.1)-.5)*.22;}
function fogCanvas(){const P=M6.base||M6.quick;if(!P)return null;const W=Math.ceil(P.width/FOG.r),H=Math.ceil(P.height/FOG.r);
  if(!FOG.cv||FOG.cv.width!==W||FOG.cv.height!==H){FOG.cv=document.createElement('canvas');FOG.cv.width=W;FOG.cv.height=H;FOG.cx=FOG.cv.getContext('2d');FOG.img=null;FOG.full=true;FOG.rowY=0;}return FOG.cv;}
// paint fog pixels [x0,x1) x [y0,y1)
function fogPaintRect(x0,y0,x1,y1){const cv=FOG.cv,W=cv.width,H=cv.height;x0=Math.max(0,x0|0);y0=Math.max(0,y0|0);x1=Math.min(W,Math.ceil(x1));y1=Math.min(H,Math.ceil(y1));if(x1<=x0||y1<=y0)return;
  const pad=MAPX.pad,s=MAPX.s,r=FOG.r;const mw=x1-x0+4,mh=y1-y0+4;const M=new Uint8Array(mw*mh);   // 1 = known, with a two-pixel margin for the inked edge
  const inWorld=(fx,fy)=>{const bx=fx*r+r/2,by=fy*r+r/2;return bx>=pad&&by>=pad&&bx<P0.width-pad&&by<P0.height-pad;};const P0=M6.base||M6.quick;
  for(let yy=0;yy<mh;yy++){const fy=y0-2+yy;for(let xx=0;xx<mw;xx++){const fx=x0-2+xx;if(fx<0||fy<0||fx>=W||fy>=H||!inWorld(fx,fy)){M[yy*mw+xx]=1;continue;}
      const wx=(fx*r+r/2-pad)/s+B.x0,wz=(fy*r+r/2-pad)/s+B.z0;M[yy*mw+xx]=fogField(wx,wz)>.5?1:0;}}
  const id=FOG.cx.createImageData(x1-x0,y1-y0),D=id.data;const C=FOG_COL;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const mx=x-x0+2,my=y-y0+2,k=my*mw+mx,o=((y-y0)*(x1-x0)+(x-x0))*4;if(M[k]){D[o+3]=0;continue;}
    const n1=M[k-1]|M[k+1]|M[k-mw]|M[k+mw];const n2=n1?0:(M[k-2]|M[k+2]|M[k-2*mw]|M[k+2*mw]|M[k-mw-1]|M[k-mw+1]|M[k+mw-1]|M[k+mw+1]);
    let c;if(n1)c=C.ink;else if(n2)c=C.ring;else{const h=m6Hash(x*3+1,y*7+5);const hat=((x+y)%9===0)&&fogVal(x*1.3,y*1.3,5)>.32;c=hat?C.hatch:h<.035?C.speckD:h>.975?C.speckL:C.paper;}
    D[o]=c[0];D[o+1]=c[1];D[o+2]=c[2];D[o+3]=255;}
  FOG.cx.putImageData(id,x0,y0);}
// bring the picture up to date: all of it once, then only where the grid changed (cells to fog pixels, with the edge's reach)
function fogUpdate(rows){const cv=fogCanvas();if(!cv)return false;
  if(FOG.full){if(!FOG.rowY){FOG.bl=null;fogBlur(0,0,FOG.gw-1,FOG.gh-1);}const y1=Math.min(cv.height,(FOG.rowY|0)+(rows||cv.height));fogPaintRect(0,FOG.rowY|0,cv.width,y1);FOG.rowY=y1;
    if(y1>=cv.height){FOG.full=false;FOG.rowY=0;}return true;}
  const d0=FOG.dirty;if(!d0)return false;FOG.dirty=null;const b=FOG_BR+1,d=[d0[0]-b,d0[1]-b,d0[2]+b,d0[3]+b];fogBlur(d[0],d[1],d[2],d[3]);const k=FOG.cs*MAPX.s/FOG.r,m=6;
  fogPaintRect((MAPX.pad/FOG.r)+d[0]*k-m,(MAPX.pad/FOG.r)+d[1]*k-m,(MAPX.pad/FOG.r)+(d[2]+1)*k+m,(MAPX.pad/FOG.r)+(d[3]+1)*k+m);return true;}
// drawn over the paper and the railway, under the way to your goal, the names and the marks (the map asks for your goal just there)
function fogDraw(){if(!FOG.on||!FOG.g||!M6.cv)return;const PAPER=M6.base||M6.quick;if(!PAPER)return;fogUpdate();const cv=FOG.cv;if(!cv)return;
  const g=M6.g,dp=M6.dpr,v=M6.v,k=v.k,sk=k*dp,tx=Math.round(dp*(M6.cw/2-v.x*k)),ty=Math.round(dp*(M6.ch/2-v.y*k));const r=FOG.r;
  const vx0=v.x-M6.cw/2/k,vy0=v.y-M6.ch/2/k,vx1=v.x+M6.cw/2/k,vy1=v.y+M6.ch/2/k;const sx0=Math.max(0,Math.floor(vx0/r)-1),sy0=Math.max(0,Math.floor(vy0/r)-1),sx1=Math.min(cv.width,Math.ceil(vx1/r)+1),sy1=Math.min(cv.height,Math.ceil(vy1/r)+1);
  if(sx1<=sx0||sy1<=sy0)return;g.save();g.setTransform(sk,0,0,sk,tx,ty);g.imageSmoothingEnabled=false;g.drawImage(cv,sx0,sy0,sx1-sx0,sy1-sy0,sx0*r,sy0*r,(sx1-sx0)*r,(sy1-sy0)*r);g.restore();}
{const _d=m6Draw;m6Draw=function(){FOG.pend=true;try{return _d.apply(this,arguments);}finally{FOG.pend=false;}};}
{const _g=m6Goal;m6Goal=function(){if(FOG.pend){FOG.pend=false;try{fogDraw();}catch(e){console.warn(e);}}return _g.apply(this,arguments);};}
// the picture is made ahead, a few rows at a time while you play (a slow phone's map then opens at once, never waiting for it)
{const idle=f=>window.requestIdleCallback?requestIdleCallback(f,{timeout:400}):setTimeout(f,60);let busy=false;
  setInterval(()=>{if(busy||typeof S==='undefined'||S.mode!=='play'||!FOG.g||(typeof M6!=='undefined'&&M6.on))return;if(!FOG.full&&!FOG.dirty)return;busy=true;
    idle(()=>{busy=false;try{if(!(M6.base||M6.quick))return;if(FOG.full)fogUpdate(40);else if(FOG.dirty)fogUpdate();}catch(e){}});},120);}
// the map open while you walk (or a friend finds something): drawn again when the grid changes
setInterval(()=>{try{if(M6.on&&FOG.g&&(FOG.dirty||FOG.drawnVer!==FOG.ver)){FOG.drawnVer=FOG.ver;M6.ver++;m6Kick();}}catch(e){}},500);

// ================================================================ what shows: only what you know
function fogKnown(it){try{if(!FOG.g)return true;const t=it.t;if(t==='you'||t==='goal'||t==='pin'||t==='draft')return true;
    if(S.mapTold&&S.mapTold[it.id])return true;
    if(t==='region'){if(it.rk&&S.rg&&S.rg.seen&&S.rg.seen[it.rk])return true;return fogShown(it.x,it.z);}
    if(t==='mile')return fogShown(it.x,it.z)||!!(S.rg&&S.rg.seen&&S.rg.seen[it.m.k]);
    return fogShown(it.x,it.z);}catch(e){return true;}}
{const _mi=m6Items;m6Items=function(sc){const L=_mi.apply(this,arguments);if(!FOG.on||!FOG.g)return L;const c=FOG.itemsC;
  if(c&&c.src===L&&c.ver===FOG.ver)return c.out;const out=L.filter(fogKnown);out.ids=out.map(i=>i.id).join(',');FOG.itemsC={src:L,ver:FOG.ver,out};return out;};}
// travelling from the map: only to a milestone you've stood at
function fogBeen(m){try{return !!(S.rg&&S.rg.seen&&S.rg.seen[m.k])||fogNear(m.x,m.z,4);}catch(e){return true;}}
{const _ch=m6CardHtml;m6CardHtml=function(it){let h=_ch.apply(this,arguments);try{if(it&&it.t==='mile'&&it.m&&!fogBeen(it.m)&&/data-m6="travel"/.test(h)){
    h=h.replace(/<button data-m6="travel"[^>]*>[^<]*<\/button>/,'').replace(/<div class="acts2"><\/div>/,'');h=h.replace(/(<p>From [^<]*<\/p>)/,'$1<p>You haven’t been there yet. Walk there once and you can travel to it.</p>');}}catch(e){}return h;};}
{const _a=m6Act;m6Act=function(a,it){if(a==='travel'&&it&&it.m&&!fogBeen(it.m)){toast('You haven’t been there yet.',2);return;}return _a.apply(this,arguments);};}
// your goal is something you've been told of: its place is marked for you from then on
setInterval(()=>{try{if(typeof S==='undefined'||S.mode!=='play'||!FOG.g)return;const g=m6Goal();if(!g)return;let best=null,bd=9;for(const [n,x,z] of MAP_PLACES){const d=Math.hypot(x-g.x,z-g.z);if(d<bd){bd=d;best=n;}}if(best)fogTold('p:'+best);}catch(e){}},2000);
if(typeof PERSONAL!=='undefined')for(const k of ['fog','fogId','mapTold']){const i=PERSONAL.indexOf(k);if(i>=0)PERSONAL.splice(i,1);}   /* (the farm's, not one player's) */
