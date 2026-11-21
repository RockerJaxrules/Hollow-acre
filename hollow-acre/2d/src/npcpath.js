/* ================= townsfolk find their way: a map of the ground a person can stand on (no fences, walls, trees, water), and a
   proper path search over it, straightened out where the way is clear. They walk round the pond, through gates and along the
   fences instead of through them. The map is redrawn whenever something new is built. ================= */
const NAV={c:.5,g:null,w:0,h:0,x0:0,z0:0,sig:''};
function navSig(){return rects.length+','+circles.length+','+segs.length;}
function navBuild(){const c=NAV.c,R=.32;NAV.x0=Math.floor(B.x0)-1;NAV.z0=Math.floor(B.z0)-1;NAV.w=Math.ceil((B.x1-NAV.x0+2)/c);NAV.h=Math.ceil((B.z1-NAV.z0+2)/c);
  const W=NAV.w,Hh=NAV.h,g=new Uint8Array(W*Hh);
  const box=(x0,z0,x1,z1,fn)=>{const i0=Math.max(0,Math.floor((x0-NAV.x0)/c)),i1=Math.min(W-1,Math.floor((x1-NAV.x0)/c)),j0=Math.max(0,Math.floor((z0-NAV.z0)/c)),j1=Math.min(Hh-1,Math.floor((z1-NAV.z0)/c));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=NAV.x0+(i+.5)*c,z=NAV.z0+(j+.5)*c;if(fn(x,z))g[j*W+i]=1;}};
  for(const q of rects)box(q.x0-R,q.z0-R,q.x1+R,q.z1+R,(x,z)=>Math.hypot(x-clamp(x,q.x0,q.x1),z-clamp(z,q.z0,q.z1))<R);
  for(const q of circles){const m=q.r+R;box(q.x-m,q.z-m,q.x+m,q.z+m,(x,z)=>Math.hypot(x-q.x,z-q.z)<m);}
  for(const s of segs){const m=s.r+R;box(Math.min(s.x1,s.x2)-m,Math.min(s.z1,s.z2)-m,Math.max(s.x1,s.x2)+m,Math.max(s.z1,s.z2)+m,(x,z)=>{const dx=s.x2-s.x1,dz=s.z2-s.z1,L=dx*dx+dz*dz||1;const t=clamp(((x-s.x1)*dx+(z-s.z1)*dz)/L,0,1);return Math.hypot(x-(s.x1+dx*t),z-(s.z1+dz*t))<m;});}
  // water is no place to walk, except on the two bridges (the same decks the player crosses by)
  const deck=(x,z)=>(Math.abs(z+6)<3.1&&Math.abs(x-BRIDGE.x)<5.2)||(Math.abs(z-FOOT.z)<.8&&Math.abs(x-FOOT.x)<3);
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){if(g[j*W+i])continue;const x=NAV.x0+(i+.5)*c,z=NAV.z0+(j+.5)*c;if(LAYERS.water(x,z)&&!deck(x,z))g[j*W+i]=1;}
  // which open ground joins up with which: little pockets cut off by water or fences are no use to anyone
  const comp=new Int32Array(W*Hh).fill(-1);let label=0,best=-1,bestN=0;const q=new Int32Array(W*Hh);
  for(let k0=0;k0<W*Hh;k0++){if(g[k0]||comp[k0]>=0)continue;let h=0,t=0;q[t++]=k0;comp[k0]=label;let n=0;
    while(h<t){const k=q[h++];n++;const i=k%W,j=(k/W)|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const ni=i+di,nj=j+dj;if(ni<0||nj<0||ni>=W||nj>=Hh)continue;const nk=nj*W+ni;if(g[nk]||comp[nk]>=0)continue;comp[nk]=label;q[t++]=nk;}}
    if(n>bestN){bestN=n;best=label;}label++;}
  NAV.g=g;NAV.comp=comp;NAV.main=best;NAV.sig=navSig();}
const navCell=(x,z)=>[Math.floor((x-NAV.x0)/NAV.c),Math.floor((z-NAV.z0)/NAV.c)];
const navFree=(i,j)=>i>=0&&j>=0&&i<NAV.w&&j<NAV.h&&!NAV.g[j*NAV.w+i];
const navPt=(i,j)=>[NAV.x0+(i+.5)*NAV.c,NAV.z0+(j+.5)*NAV.c];
// the nearest open ground to a point (doors sit right against walls, spots by the pond are half in it)
// open ground near a point; with comp given, only ground joined to that piece (you can't walk to the far bank without the ferry)
const navIn=(i,j,comp)=>navFree(i,j)&&(comp==null||NAV.comp[j*NAV.w+i]===comp);
function navNearest(i,j,comp){if(navIn(i,j,comp))return [i,j];for(let r=1;r<40;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;if(navIn(i+di,j+dj,comp))return [i+di,j+dj];}return null;}
// can you walk straight from one cell to the other?
function navLine(a,b){const [i0,j0]=a,[i1,j1]=b;const n=Math.max(Math.abs(i1-i0),Math.abs(j1-j0))*2;for(let k=0;k<=n;k++){const i=Math.round(i0+(i1-i0)*k/n),j=Math.round(j0+(j1-j0)*k/n);if(!navFree(i,j))return false;}return true;}
function navPath(x,z,tx,tz){if(!NAV.g||NAV.sig!==navSig())navBuild();const W=NAV.w;
  const s=navNearest(...navCell(x,z));if(!s)return null;const cs=NAV.comp[s[1]*W+s[0]];const e=navNearest(...navCell(tx,tz),cs);if(!e)return null;const S0=s[1]*W+s[0],E0=e[1]*W+e[0];
  if(S0===E0)return [[tx,tz]];
  // A* with a binary heap, eight ways round, no cutting corners
  const N=W*NAV.h,gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N);const heap=[];
  const push=(k,f)=>{heap.push([f,k]);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p;}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m;}}return top;};
  const hh=(i,j)=>{const dx=Math.abs(i-e[0]),dz=Math.abs(j-e[1]);return Math.max(dx,dz)+.414*Math.min(dx,dz);};
  gs[S0]=0;push(S0,hh(s[0],s[1]));let found=false,it=0;
  while(heap.length&&it++<60000){const [,k]=pop();if(closed[k])continue;closed[k]=1;if(k===E0){found=true;break;}const i=k%W,j=(k/W)|0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=i+di,nj=j+dj;if(!navFree(ni,nj))continue;if(di&&dj&&(!navFree(i+di,j)||!navFree(i,j+dj)))continue;
      const nk=nj*W+ni;if(closed[nk])continue;const ng=gs[k]+(di&&dj?1.414:1);if(ng<gs[nk]){gs[nk]=ng;from[nk]=k;push(nk,ng+hh(ni,nj));}}}
  if(!found)return null;
  const cells=[];for(let k=E0;k!==-1;k=from[k])cells.push([k%W,(k/W)|0]);cells.reverse();
  // straighten: keep only the corners you can't see past
  const out=[];let a=0;while(a<cells.length-1){let b=cells.length-1;while(b>a+1&&!navLine(cells[a],cells[b]))b--;out.push(navPt(...cells[b]));a=b;}
  // finish on the exact spot if it's open ground, otherwise on the open ground nearest it
  const [ei,ej]=navCell(tx,tz);if(navIn(ei,ej,cs))out.push([tx,tz]);return out;}
// people use it; the old street-by-street route is kept for anything it can't solve
{const _rt=routeTo;routeTo=function(x,z,tx,tz){if(x>=250||tx>=250)return _rt.apply(this,arguments);try{const p=navPath(x,z,tx,tz);if(p&&p.length)return p;}catch(e){}return _rt.apply(this,arguments);};}
// a spot in someone's day that lands in the water or inside a fence moves to the nearest open ground
{const _px=placeXY;placeXY=function(key,n){const p=_px.apply(this,arguments);if(!p||p[0]>=250)return p;try{if(!NAV.g||NAV.sig!==navSig())navBuild();const c=navCell(p[0],p[1]);if(navFree(c[0],c[1]))return p;const f=navNearest(c[0],c[1]);return f?navPt(f[0],f[1]):p;}catch(e){return p;}};}
