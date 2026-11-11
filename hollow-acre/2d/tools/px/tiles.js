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
  if(kind==='dirt'){
    // broad trodden ground in three flat tones (coherent patches, not per-pixel grain)
    for(let y=0;y<PER;y++)for(let x=0;x<PER;x++){const n=vn(x,y,48)*.62+vn(x,y,24)*.38;put(x,y,DIRT[n>.60?4:n<.40?2:3]);}
    let s=7;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    // sparse clods of earth: each a little mound, lit top-left, shaded under
    for(let i=0;i<12*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0,big=r()<.4;
      put(x,y,DIRT[4]);put(x+1,y,DIRT[3]);put(x,y+1,DIRT[2]);put(x+1,y+1,DIRT[1]);
      if(big){put(x,y-1,DIRT[5]);put(x-1,y,DIRT[4]);put(x+2,y+1,DIRT[1]);put(x+1,y+2,DIRT[1]);}}
    // a few embedded pebbles: a dark stone with a lit top-left corner
    for(let i=0;i<4*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0;put(x,y,DIRT[1]);put(x+1,y,DIRT[1]);put(x,y+1,DIRT[1]);put(x+1,y+1,DIRT[0]||DIRT[1]);put(x,y,DIRT[5]);}
    // shallow dry cracks: short dark furrows with a lit lip along the top edge
    for(let i=0;i<5*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0,l=3+(r()*3|0),dir=r()<.5;
      for(let k=0;k<l;k++){const px=dir?x+k:x,py=dir?y:y+k;put(px,py,DIRT[1]);put(dir?px:px-1,dir?py-1:py,DIRT[4]);}}}
  if(kind==='walk'){
    // concrete sidewalk: 32 px slabs (one world tile each), flat tones, a lit top-left bevel and a shaded
    // bottom-right edge on every slab, dark joints. Details are hand-placed in several varied copies so
    // nothing appears only once per 192 px repeat.
    const WK=['#38323a','#4a4448','#5a5456','#69635f','#77716a','#857f76','#968f83','#a8a192','#b8b0a0'].map(HEX);
    const JN=WK[0],DEEP=WK[1],SH=WK[2],LIT=WK[7],HI=WK[8];
    const B=['#79736c','#7f7971','#868077'].map(HEX);   // slab tones only a few levels apart: concrete varies subtly
    let s=19;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let q=0;q<64;q++)r();   // a small Lehmer seed starts with tiny values: warm it up or the first rows all come out dark
    const ns=PER/32,tone=[];
    for(let j=0;j<ns;j++){tone.push([]);for(let i=0;i<ns;i++){const h=hsh(i*7+3,j*13+5,77);tone[j].push(h<.3?0:h<.72?1:2);}}
    for(let y=0;y<PER;y++)for(let x=0;x<PER;x++){const i=x>>5,j=y>>5,lx=x&31,ly=y&31;const t=tone[j][i];let c=B[t];
      if(lx===0||ly===0)c=JN;else if(ly===1||lx===1)c=t===2?HI:LIT;else if(ly===31||lx===31)c=SH;
      put(x,y,c);}
    // worn patches: flat hard-edged shapes one step off the slab tone, in about a third of the slabs
    for(let j=0;j<ns;j++)for(let i=0;i<ns;i++){if(r()>.38)continue;const dark=r()<.6;const col=dark?HEX('#6f6964'):HEX('#8f897e');
      const cx=i*32+5+r()*22,cy=j*32+5+r()*22,a1=3+r()*6,a2=2+r()*4,tall=r()<.45,rx=tall?a2:a1,ry=tall?a1:a2;
      for(let y=-ry|0;y<=ry;y++)for(let x=-rx|0;x<=rx;x++){const px=Math.round(cx+x),py=Math.round(cy+y);const lx=px&31,ly=py&31;if(lx<3||ly<3||lx>29||ly>29)continue;
        const e=(x*x)/(rx*rx)+(y*y)/(ry*ry)+(hsh(px,py,9)-.5)*.35;if(e<1)put(px,py,col);}}
    // hairline cracks with a lit lip on the upper side, wandering across a slab
    for(let k=0;k<6;k++){const i=r()*ns|0,j=r()*ns|0;let x=i*32+4+(r()*24|0),y=j*32+3+(r()*8|0);const len=8+(r()*12|0);let dx=r()<.5?1:-1;
      for(let n=0;n<len;n++){const lx=x&31,ly=y&31;if(lx<3||lx>29||ly<3||ly>29)break;put(x,y,DEEP);put(x,y-1,LIT);
        if(r()<.55)y++;else x+=dx;if(r()<.12)dx=-dx;}}
    // chipped slab corners: a 3-6 px bite out of the corner that breaks the lit lip and shows the joint
    for(let k=0;k<9;k++){const i=r()*ns|0,j=r()*ns|0,cr=r()*4|0,sz=3+(r()*4|0);const sxn=cr&1?-1:1,syn=cr&2?-1:1;
      const ox=i*32+(cr&1?31:1),oy=j*32+(cr&2?31:1);
      for(let a=0;a<sz;a++)for(let b=0;b<sz-a;b++){const e=a+b;put(ox+sxn*a,oy+syn*b,e<sz-2?JN:DEEP);}}
    // stains: a few broken low-contrast shapes of different sizes (no lone dots, none one of a kind)
    for(let k=0;k<7;k++){const i=r()*ns|0,j=r()*ns|0;const cx=i*32+7+(r()*18|0),cy=j*32+7+(r()*18|0);const n=4+(r()*5|0);
      let x=cx,y=cy;for(let q=0;q<n;q++){put(x,y,HEX('#6d6762'));const d=r()*4|0;x+=d===0?1:d===1?-1:0;y+=d===2?1:d===3?-1:0;}}
    // weeds and moss pushing up in the joints, at many crossings and along a few seams
    const GW=[HEX('#2c4a24'),HEX('#3d6630'),HEX('#56853c')];
    for(let k=0;k<11;k++){const i=r()*ns|0,j=r()*ns|0;const x=i*32,y=j*32;const big=r()<.4;
      put(x,y,GW[0]);put(x,y-1,GW[1]);put(x+1,y,GW[1]);if(big){put(x-1,y-1,GW[1]);put(x,y-2,GW[2]);put(x+1,y-1,GW[2]);}}
    for(let k=0;k<6;k++){const horiz=r()<.5;const i=r()*ns|0,j=r()*ns|0;const l=3+(r()*5|0);const x0=i*32+(horiz?6+(r()*18|0):0),y0=j*32+(horiz?0:6+(r()*18|0));
      for(let n=0;n<l;n++)put(horiz?x0+n:x0,horiz?y0:y0+n,n%3===1?GW[1]:GW[0]);}}
  if(kind==='water'){for(let y=0;y<PER;y++)for(let x=0;x<PER;x++){const n=vn(x,y,32)*.6+vn(x,y,16)*.4;const nn=vn(x,y,8);put(x,y,n>.74&&nn>.5?WATER[3]:WATER[2]);}
    let s=5;const r=()=>{s=(s*16807)%2147483647;return s/2147483647;};
    for(let i=0;i<10*(PER*PER)/4096;i++){const x=r()*PER|0,y=r()*PER|0,l=3+(r()*4|0);for(let k=0;k<l;k++)put(x+k,y,WATER[k===0||k===l-1?4:5]);}}
  return A;}
function tex(x,y){
  if(K==='stone'){if(!TX.pts){let q=3;const r=()=>{q=(q*16807)%2147483647;return q/2147483647;};TX.pts=[];const g=13;for(let gy=0;gy<PER;gy+=g)for(let gx=0;gx<PER;gx+=g)TX.pts.push([gx+r()*g,gy+r()*g,r()]);}
    const bx=wrap(x),by=wrap(y);let d1=1e9,d2=1e9,best=null;for(const pt of TX.pts){for(const ox of [-PER,0,PER])for(const oy of [-PER,0,PER]){const dx=bx-(pt[0]+ox),dy=(by-(pt[1]+oy))*1.25,d=dx*dx+dy*dy;if(d<d1){d2=d1;d1=d;best=[pt,dx,dy];}else if(d<d2)d2=d;}}
    if(Math.sqrt(d2)-Math.sqrt(d1)<1.7)return STONE[0];const [pt,dx,dy]=best;let k=pt[2]>.66?4:pt[2]>.33?3:2;const l=-dx*.62-dy*.72;if(l>2)k++;if(l>5)k++;if(l<-2)k--;if(l<-5)k--;return STONE[Math.max(1,Math.min(5,k))];}
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
