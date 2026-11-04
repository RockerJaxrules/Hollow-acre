// ---- terrain autotiles in the LPC 3x6 block layout used by the engine (32 px cells).
// Each non-fill cell is rendered from its corner mask: a corner value of 1 means that corner is inside the layer.
// cell -> mask: (1,0)=14 (0? ) ...see MASKS below. Fill variants live at (1,3) and row 5.
SEED=CFG.seed||5;
const W=CFG.texOnly?CFG.per:96,H=CFG.texOnly?CFG.per:192;const T=layer('tiles',W,H);
const K=CFG.kind;
const GRASS=['#173a1e','#22512a','#2d6a31','#3c8236','#56993e','#76b34c','#9bcc62'].map(HEX);
const FOREST=['#0e2318','#153122','#1d4129','#285331','#356538'].map(HEX);
const DIRT=['#4a2f1c','#6b4528','#8a5c34','#a5753f','#bd8f52','#d3aa6c'].map(HEX);
const STONE=['#2e2c32','#46434b','#5e5a62','#78737a','#938d92','#b0aaab'].map(HEX);
const WATER=['#0c2c48','#123e62','#1a5480','#236c9c','#3c8cb8','#7cbcd8','#d4eef4'].map(HEX);
// cell positions for each corner mask (matches the engine's PIECE table)
const CELLS={1:[0,2],2:[2,2],3:[1,2],4:[0,4],5:[0,3],8:[2,4],10:[2,3],12:[1,4],7:[2,1],11:[1,1],13:[2,0],14:[1,0],15:[1,3]};
const PER=CFG.per||64;const wrap=(v)=>((v%PER)+PER)%PER;
// value noise, tileable every 64 px so neighbouring tiles always match
function vn(x,y,s){const xi=Math.floor(x/s),yi=Math.floor(y/s),fx=x/s-xi,fy=y/s-yi;const n=PER/s;const h=(a,b)=>hsh(((a%n)+n)%n,((b%n)+n)%n,s*7+SEED);
  const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
// pre-painted 64x64 tileable textures
const TX={};
function paint(kind){const A=[];for(let y=0;y<PER;y++){A.push([]);for(let x=0;x<PER;x++)A[y].push(null);}
  const put=(x,y,c)=>{A[((y%PER)+PER)%PER][((x%PER)+PER)%PER]=c;};
  if(kind==='grass'||kind==='forest'){const R=kind==='grass'?GRASS:FOREST,b0=kind==='grass'?3:2;
    for(let y=0;y<PER;y++)for(let x=0;x<PER;x++){const n=vn(x,y,32)*.5+vn(x,y,16)*.3+vn(x,y,8)*.2;put(x,y,R[b0+(n>.7?1:n<.28?-1:0)]);}
    let s=11;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<(kind==='grass'?330:200)*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0,h=2+(r()*3|0),lean=r()<.5?0:(r()<.5?-1:1);
      for(let k=0;k<h;k++){const c=k===h-1?R[Math.min(R.length-1,b0+2)]:k===0?R[b0-1]:R[b0+1];put(x+(k===h-1?lean:0),y-k,c);}}
    if(kind==='grass')for(let i=0;i<6*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0;put(x,y,R[R.length-1]);put(x+1,y,R[5]);}}
  if(kind==='dirt'){for(let y=0;y<PER;y++)for(let x=0;x<PER;x++){const n=vn(x,y,32)*.45+vn(x,y,8)*.35+vn(x,y,4)*.2;put(x,y,DIRT[n>.62?4:n<.36?2:3]);}
    let s=7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<46*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0,big=r()<.3;put(x,y,DIRT[5]);put(x+1,y+1,DIRT[1]);if(big){put(x+1,y,DIRT[4]);put(x,y+1,DIRT[2]);}}
    for(let i=0;i<9*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0;for(let k=0;k<4;k++)put(x+k,y+(k>1?1:0),DIRT[2]);}}
  if(kind==='water'){for(let y=0;y<PER;y++)for(let x=0;x<PER;x++){const n=vn(x,y,32)*.6+vn(x,y,16)*.4;const nn=vn(x,y,8);put(x,y,n>.74&&nn>.5?WATER[3]:WATER[2]);}
    let s=5;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<10*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0,l=3+(r()*4|0);for(let k=0;k<l;k++)put(x+k,y,WATER[k===0||k===l-1?4:5]);}}
  return A;}
function tex(x,y){
  if(K==='stone'){if(!TX.pts){let q=3;const r=()=>{q=(q*16807)%2147483647;return q/2147483647;};TX.pts=[];const g=13;for(let gy=0;gy<PER;gy+=g)for(let gx=0;gx<PER;gx+=g)TX.pts.push([gx+r()*g,gy+r()*g,r()]);}
    const bx=wrap(x),by=wrap(y);let d1=1e9,d2=1e9,best=null;for(const pt of TX.pts){for(const ox of [-PER,0,PER])for(const oy of [-PER,0,PER]){const dx=bx-(pt[0]+ox),dy=(by-(pt[1]+oy))*1.25,d=dx*dx+dy*dy;if(d<d1){d2=d1;d1=d;best=[pt,dx,dy];}else if(d<d2)d2=d;}}
    if(Math.sqrt(d2)-Math.sqrt(d1)<1.6)return STONE[1];const [pt,dx,dy]=best;let k=pt[2]>.66?4:pt[2]>.33?3:2;const l=-dx*.5-dy*.6;if(l>3)k++;if(l<-3.5)k--;return STONE[Math.max(1,Math.min(5,k))];}
  if(!TX[K])TX[K]=paint(K);return TX[K][wrap(y)][wrap(x)];}
// draw one cell for a corner mask
function cell(mask,cx,cy,variant){const c=[(mask>>3)&1,(mask>>2)&1,(mask>>1)&1,mask&1];   // TL,TR,BL,BR
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const u=(x+.5)/32,v=(y+.5)/32;
    const val=c[0]*(1-u)*(1-v)+c[1]*u*(1-v)+c[2]*(1-u)*v+c[3]*u*v;const jit=(vn(x+cx*32+variant*13,y+cy*32,8)-.5)*.32;const f=val+jit;
    if(mask!==15&&f<.5)continue;
    const wx=x+variant*32,wy=y;let col=tex(wx,wy);
    if(mask!==15){const edge=f-.5;     // distance-ish inside the boundary
      // where is the outside? the direction of increasing "outside" decides lighting: outside above => the bank shades us
      const gy=(c[2]+c[3])-(c[0]+c[1]),gx=(c[1]+c[3])-(c[0]+c[2]);   // gradient of inside-ness
      if(K==='dirt'||K==='stone'){if(edge<.08)col=K==='dirt'?DIRT[1]:STONE[1];else if(edge<.16&&gy>0)col=shade(col,.72);else if(edge<.13&&gx>0)col=shade(col,.82);else if(edge<.12&&gy<0)col=shade(col,1.12);}
      if(K==='water'){if(edge<.07)col=DIRT[2];else if(edge<.11)col=DIRT[1];else if(edge<.2&&gy>0)col=WATER[1];else if(edge<.16)col=WATER[5];}
      if(K==='forest'){if(edge<.06)col=FOREST[0];}}
    P(T,cx*32+x,cy*32+y,col);}
  // grass tufts hanging over the edge of paths and banks
  if(mask!==15&&(K==='dirt'||K==='water'||K==='stone'))for(let i=0;i<14;i++){const x=(hsh(i,mask,3)*30|0)+1,y0=(hsh(i,mask,4)*30|0)+1;const u=(x+.5)/32,v=(y0+.5)/32;
    const val=c[0]*(1-u)*(1-v)+c[1]*u*(1-v)+c[2]*(1-u)*v+c[3]*u*v+(vn(x+cx*32,y0+cy*32,8)-.5)*.32;if(val<.48||val>.58)continue;
    for(let k=0;k<3;k++){P(T,cx*32+x,cy*32+y0-k,GRASS[k===2?5:4]);}P(T,cx*32+x+1,cy*32+y0-1,GRASS[3]);}}
if(CFG.texOnly){for(let y=0;y<PER;y++)for(let x=0;x<PER;x++)P(T,x,y,tex(x,y));}else{for(const m in CELLS){const [cx,cy]=CELLS[m];cell(+m,cx,cy,0);}
for(let v=0;v<3;v++)cell(15,v,5,v+1);}
// a fill variant with a little extra life
if(K==='grass'){for(let i=0;i<4;i++){const x=(hsh(i,1)*28|0)+2,y=(hsh(i,2)*28|0)+2+160;P(T,x,y,HEX('#f2e9c8'));P(T,x+1,y,HEX('#e4d39a'));P(T,x,y+1,GRASS[2]);}}
emit([T],CFG.out);console.log('META '+JSON.stringify({w:W,h:H}));
