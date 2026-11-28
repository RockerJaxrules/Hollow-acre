/* ================= blood that reads as liquid (owner: "Blood on screen drip cool ideas looks and same with most blood make all blood
   look more liquid like and less cubey"). The blood was drawn with squares: splats of 2 px dots round a disc, drags as dashed bars,
   the screen's spatter as a circle ringed with square specks and a straight bar for a run, and Extreme's pour over the top of
   the screen at a quarter of the screen's resolution, so every run was a column of big blocks. Now every piece is grown the way
   liquid lies, at the game's own pixel size:
   - pools and splats are soft unions of round blobs: a thin dark rim, the body, a darker belly toward the bottom right, a lit
     inner edge at the top left and one wet glint; round drops thrown off them carry a tail back toward where they came from;
   - drags are smears that start heavy and thin out, breaking into beads at the end;
   - drying goes brown and loses its shine; soaked into soil or wood it is darker, flatter and has no shine at all;
   - on the screen (the "lens"): a splash lands as a round splat with thrown drops, then rivulets run down from it, wobbling a
     little, each ending in a bead with its glint, slowing, and the lot fades. None at Toned, a little at Full, more at Extreme.
     It is drawn on its own canvas just above the world and under everything you read or press, and costs a few drawImage calls
     a frame (every shape is drawn once and kept).
   No blood is ever put on or near a child or anything tied to one (the callers decide where blood goes; none are added). == */
const BLD={c:{},lens:[],cv:null,g:null,raf:0};
const bldH=(a,b)=>{const v=Math.sin(a*127.1+b*311.7+a*b*.013)*43758.5453;return v-Math.floor(v);};
// the ramps: [rim, deep, body, lit, glint, spec]
const BLD_RAMP={fresh:[[34,4,22],[72,8,32],[124,14,30],[180,52,50],[238,160,138],[255,226,206]],
  dry:[[34,10,12],[54,16,14],[74,24,18],[92,34,24],null,null],soak:[[30,6,10],[44,8,12],[60,12,16],[72,18,20],null,null]};
const bldMix=(a,b,f)=>a&&b?a.map((v,i)=>Math.round(v+(b[i]-v)*f)):(f<.5?a:b);
// a mask grown from round blobs (metaballs): blobs [[cx,cy,rx,ry],...]
function bldMask(W,H,blobs,th){const m=new Uint8Array(W*H);th=th||.5;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let f=0;for(const [cx,cy,rx,ry] of blobs){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;f+=Math.exp(-(dx*dx+dy*dy)*1.6);}if(f>th)m[y*W+x]=1;}return m;}
// paint a mask as liquid: rim, lit top-left inner edge, darker bottom-right belly, body; a glint near the top-left of the biggest blob
function bldClean(W,H,m){for(let pass=0;pass<2;pass++)for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!m[y*W+x])continue;let n=0;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){if(!i&&!j)continue;const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<W&&Y<H&&m[Y*W+X])n++;}if(n<=1)m[y*W+x]=0;}return m;}
function bldPaint(W,H,m,ramp,o){o=o||{};bldClean(W,H,m);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),id=g.createImageData(W,H),D=id.data;
  const R=ramp,A=o.alpha||238,inside=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&m[y*W+x];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!m[y*W+x])continue;let col;
    const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
    if(edge)col=R[0];
    else if((!inside(x-1,y-1)||!inside(x,y-2)||!inside(x-2,y))&&(!o.litR||!o.glint||Math.hypot(x-o.glint[0],y-o.glint[1])<o.litR))col=R[3];   // the lit inner edge, top left (near the glint only, on flat pools)
    else if(!inside(x+1,y+1)||!inside(x,y+2)||!inside(x+2,y+1))col=R[1];          // the belly, bottom right
    else col=R[2];
    const i=(y*W+x)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=A;}
  // one wet glint: a 2 px streak and a brighter pixel, in from the top left of the main blob
  if(R[4]&&o.glint){const [gx,gy]=o.glint;for(const [x,y,c] of [[gx,gy,R[4]],[gx+1,gy,R[4]],[gx,gy,R[5]]]){if(!inside(x,y)||!inside(x-1,y)||!inside(x,y-1))continue;const i=(y*W+x)*4;D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2];D[i+3]=A;}}
  g.putImageData(id,0,0);return c;}
// a drop thrown off a splash: a round head away from the source and a tail pointing back at it (into a mask)
function bldDrop(m,W,H,x,y,ang,r,tail){const put=(px,py)=>{px=Math.round(px);py=Math.round(py);if(px>=0&&py>=0&&px<W&&py<H)m[py*W+px]=1;};
  if(r<=1){put(x,y);put(x+1,y);put(x,y+1);put(x+1,y+1);}   /* a 2 px drop reads round at 1x; a plus reads as a cross, a lone pixel as speckle */
  else for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++)if(i*i+j*j<=r*r+.6)put(x+i,y+j);
  for(let k=1;k<=tail;k++)put(x-Math.cos(ang)*(r+k),y-Math.sin(ang)*(r+k)*.6);}
// ---- the shapes
// a splat on the ground (the drops a wound leaves, the decals): kind fresh/dry/soak, size in px, seed
function bldSplat(W,H,seed,kind,n){const k='sp|'+W+'|'+H+'|'+seed+'|'+kind+'|'+(n||0);if(BLD.c[k])return BLD.c[k];
  // a round splat: one body, two or three small lobes on its rim (never a diamond), a short tongue downhill
  const cx=W/2,cy=H/2,bl=[[cx,cy,W*.22,H*.3],[cx+W*.05,cy+H*.16,W*.12,H*.16]];const nb=2+((bldH(seed,1)*2)|0);
  for(let i=0;i<nb;i++){const a=bldH(seed,i+2)*6.283,d=.12+bldH(seed,i+7)*.06;bl.push([cx+Math.cos(a)*W*d,cy+Math.sin(a)*H*d,W*(.08+bldH(seed,i+3)*.05),H*(.12+bldH(seed,i+4)*.06)]);}
  const m=bldMask(W,H,bl,.55);const nd=n!=null?n:(W>16?3:W>10?1:0);
  for(let i=0;i<nd;i++){const a=bldH(seed,i+11)*6.283,d=.32+bldH(seed,i+13)*.06,x=cx+Math.cos(a)*W*d,y=cy+Math.sin(a)*H*d*.9;bldDrop(m,W,H,x,y,a,1,1);}
  return BLD.c[k]=bldPaint(W,H,m,BLD_RAMP[kind]||BLD_RAMP.fresh,{glint:[Math.round(cx-W*.1),Math.round(cy-H*.14)],litR:W*.2,alpha:kind==='soak'?205:238});}
// a pool that spreads (the Hollow's finds): rx,ry its size; dr 0..3 fresh to dry
function bldPool(seed,rx,ry,dr){const k='pl|'+seed+'|'+rx+'|'+ry+'|'+dr;if(BLD.c[k])return BLD.c[k];const W=rx*2+12,H=ry*2+14,cx=W/2-2,cy=H/2-2;
  // two or three uneven lobes and one tongue running downhill (down and to the right), flat: lit only round the glint
  const bl=[[cx,cy,rx*.55,ry*.6]];const nl=2+((bldH(seed,1)*2)|0);
  for(let i=0;i<nl;i++){const a=(i/nl)*6.283+bldH(seed,i+2)*1.4,d=.35+bldH(seed,i+6)*.15;bl.push([cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d*.8,rx*(.34+bldH(seed,i+3)*.16),ry*(.36+bldH(seed,i+4)*.18)]);}
  for(let j=0;j<3;j++)bl.push([cx+rx*(.45+j*.2),cy+ry*(.5+j*.22),rx*(.2-j*.05),ry*(.24-j*.05)]);   // the tongue
  const m=bldMask(W,H,bl,.55);for(let i=0;i<(rx>10?2:1);i++){const a=bldH(seed,i+21)*3.1+3.4;bldDrop(m,W,H,cx+Math.cos(a)*rx*.98,cy+Math.sin(a)*ry*.98,a,1,1);}
  const f=Math.min(1,dr/3),R=BLD_RAMP.fresh.map((c,i)=>i<4?bldMix(c,BLD_RAMP.dry[i],f):(dr<2?c:null));
  const cv=bldPaint(W,H,m,R,{glint:[Math.round(cx-rx*.32),Math.round(cy-ry*.34)],litR:Math.max(3,rx*.35),alpha:dr>=3?212:238});return BLD.c[k]={cv,ax:Math.round(cx),ay:Math.round(cy)};}
// a drag: heavy where it starts, thinning out along x, breaking into beads (W wide, H tall; dir 1 heavy on the left)
function bldDrag(W,H,seed,kind,flip){const k='dg|'+W+'|'+H+'|'+seed+'|'+kind+'|'+(flip?1:0);if(BLD.c[k])return BLD.c[k];const cy=H/2;
  // a heavy lobed head where the body lay, a smear tapering fast and wandering, then two or three beads, each smaller
  const bl=[[W*.1,cy,W*.07,H*.3],[W*.16,cy+H*.08,W*.06,H*.24],[W*.07,cy-H*.12,W*.04,H*.18]];const m=bldMask(W,H,bl,.55);
  for(let x=Math.round(W*.14);x<W*.66;x++){const f=(x-W*.14)/(W*.52),w=Math.max(.5,(1-f)**1.6*H*.24),y0=cy+Math.sin(x*.21+seed)*1.2+Math.sin(x*.07+seed*2)*1.6;
    for(let y=Math.round(y0-w);y<=Math.round(y0+w*.7);y++)if(y>=0&&y<H)m[y*W+x]=1;}
  [[.72,1.6],[.82,1],[.9,.6]].forEach(([fx,r],i)=>{const x=Math.round(W*fx+bldH(seed,i)*2),y=Math.round(cy+Math.sin(W*fx*.21+seed)*1.2);bldDrop(m,W,H,x,y,0,r>1.2?2:1,0);});
  let cv=bldPaint(W,H,m,BLD_RAMP[kind]||BLD_RAMP.fresh,{glint:[Math.round(W*.08),Math.round(cy-H*.15)],litR:W*.07,alpha:kind==='soak'?205:236});
  if(flip){const f=document.createElement('canvas');f.width=W;f.height=H;const g=f.getContext('2d');g.translate(W,0);g.scale(-1,1);g.drawImage(cv,0,0);cv=f;}
  return BLD.c[k]=cv;}
// ---- the ground decals (gore.js draws g_dec_* fresh and g_dry_* as they dry): the same sizes and anchors, grown as liquid
function bldInstallSprites(){const put=(name,cv)=>{const m=SPR[name];if(!m)return;const src='bld:'+name;IMG[src]=cv;m.src=src;};
  for(const [sz,W,H] of [['s',12,8],['m',20,12],['l',30,16]])for(const v of [0,1]){put('g_dec_'+sz+v,bldSplat(W,H,(sz.charCodeAt(0)*7+v*13),'fresh'));put('g_dry_'+sz+v,bldSplat(W,H,(sz.charCodeAt(0)*7+v*13),'dry'));}
  if(SPR.g_spatter&&SPR.g_spatter.fw===48)put('g_spatter',bldSplat(48,22,77,'fresh',6));
  if(SPR.g_drag&&SPR.g_drag.fw===64)put('g_drag',bldDrag(64,16,5,'fresh',true));   // (ribs: the drag ends at the ribcage, heavy there)
  if(SPR.g_p_drag&&SPR.g_p_drag.fw===64)put('g_p_drag',bldDrag(64,16,9,'fresh'));}
bldInstallSprites();
// the pools under the Hollow's finds (gore.js) and Extreme's thick black pools (gorex374.js), the same sizes as before
if(typeof gorePoolImg==='function'){gorePoolImg=function(seed,sc,st,dr){const rx=Math.round((7+st*5.4)*sc*PPM/32),ry=Math.max(2,Math.round(rx*.42));return bldPool(seed,Math.max(3,rx),Math.max(2,ry),dr);};}
if(typeof gxPool==='function'){const XR=[[24,2,10],[44,6,14],[62,10,18],[84,24,28],null,null];gxPool=function(seed,rx,dr){const k='gx|'+seed+'|'+rx+'|'+dr;if(BLD.c[k])return BLD.c[k];
  const ry=Math.max(3,Math.round(rx*.38)),W=rx*2+10,H=ry*2+10,cx=W/2,cy=H/2,s=String(seed).split('').reduce((a,c)=>a+c.charCodeAt(0),0);
  const bl=[[cx,cy,rx*.64,ry*.64]];for(let i=0;i<6;i++){const a=bldH(s,i+1)*6.283,d=.3+bldH(s,i+6)*.22;bl.push([cx+Math.cos(a)*rx*d,cy+Math.sin(a)*ry*d,rx*(.3+bldH(s,i+3)*.2),ry*(.34+bldH(s,i+4)*.2)]);}
  const m=bldMask(W,H,bl,.55);const f=Math.min(1,dr/3),R=XR.map((c,i)=>i<4?bldMix(c,BLD_RAMP.dry[i],f*.6):(dr<2?[110,40,44]:null));R[5]=dr<2?[150,70,70]:null;
  return BLD.c[k]={cv:bldPaint(W,H,m,R,{glint:[Math.round(cx-rx*.3),Math.round(cy-ry*.4)],alpha:244}),ax:Math.round(cx),ay:Math.round(cy)};};}
// ---- the lens: blood that lands on the screen and runs down it
const BLD_R=[4,6,10,13,16];
const BLD_LENS=[[36,4,24],[84,8,34],[132,16,32],[188,60,56],[240,168,146],[255,228,210]];
const bldLevel=()=>window.GORE_TONED?0:window.GORE_EXTREME?2:1;
function bldLensCv(){if(BLD.cv&&BLD.cv.isConnected)return BLD.cv;const v=$('view');if(!v)return null;const c=document.createElement('canvas');c.id='bldLens';
  c.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges';
  v.after(c);BLD.cv=c;BLD.g=c.getContext('2d');return c;}
// a splash as it lands on glass: a round splat, its lobes, and drops thrown out with their tails back toward the middle
function bldLensSplash(r,seed){const k='ls|'+r+'|'+seed;if(BLD.c[k])return BLD.c[k];const W=r*5,H=r*5,cx=W/2,cy=H/2;const bl=[[cx,cy,r*.85,r*.62]];
  // lobes round the rim, and spikes thrown out along rays (a chain of shrinking blobs), so the outline is torn, never a disc
  for(let i=0;i<6;i++){const a=bldH(seed,i)*6.283,d=r*(.55+bldH(seed,i+5)*.35);bl.push([cx+Math.cos(a)*d,cy+Math.sin(a)*d*.8,r*(.22+bldH(seed,i+9)*.25),r*(.2+bldH(seed,i+13)*.22)]);}
  for(let i=0;i<4;i++){const a=bldH(seed,i+50)*6.283;for(let j=0;j<3;j++){const d=r*(.95+j*.32),q=r*(.2-j*.05);bl.push([cx+Math.cos(a)*d,cy+Math.sin(a)*d*.85,q,q]);}}
  const m=bldMask(W,H,bl,.5);const nd=5+((bldH(seed,20)*5)|0);
  for(let i=0;i<nd;i++){const a=bldH(seed,i+30)*6.283,d=r*(1.5+bldH(seed,i+40)*.7),x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d*.85;bldDrop(m,W,H,x,y,a,r>7&&i%3===0?2:1,2);}
  return BLD.c[k]=bldPaint(W,H,m,BLD_LENS,{glint:[Math.round(cx-r*.45),Math.round(cy-r*.32)],alpha:222});}
// a run down the glass: wide where it leaves, wobbling, thinning; drawn once at its full length and shown as it grows
function bldRun(L,seed,w0){const k='rn|'+L+'|'+seed+'|'+w0;if(BLD.c[k])return BLD.c[k];const W=15,H=L+2,m=new Uint8Array(W*H),xs=[];
  // it wanders as it runs: a slow sway, and a jog sideways where it catches on the glass; thinner as it goes, never under 1 px
  let jog=0;const j1=Math.round(L*(.3+bldH(seed,1)*.2)),j2=Math.round(L*(.6+bldH(seed,2)*.2)),d1=bldH(seed,3)<.5?-1:1,d2=-d1;
  for(let y=0;y<H;y++){if(y>=j1&&y<j1+3)jog+=d1*.7;if(y>=j2&&y<j2+3)jog+=d2*.6;
    const x=7+Math.sin(y*.09+seed)*1.4+Math.sin(y*.031+seed*2)*1.1+jog,w=Math.max(.55,w0*(1-y/H*.45));xs.push(x);
    for(let i=Math.round(x-w);i<=Math.round(x+w-.4);i++)if(i>=0&&i<W)m[y*W+i]=1;}
  const cv=bldPaint(W,H,m,BLD_LENS,{alpha:220,litR:0.0001,glint:[0,0]});return BLD.c[k]={cv,xs};}
function bldBead(r){const k='bd|'+r;if(BLD.c[k])return BLD.c[k];const W=2*r+4,H=2*r+4,m=new Uint8Array(W*H);
  for(let j=-r-.5;j<=r+.5;j++)for(let i=-r-.5;i<=r+.5;i++)if(i*i+j*j<=(r+.6)*(r+.6)){const x=Math.round(r+1.5+i),y=Math.round(r+1.5+j);if(x>=0&&y>=0&&x<W&&y<H)m[y*W+x]=1;}
  return BLD.c[k]=bldPaint(W,H,m,BLD_LENS,{glint:[r,r],alpha:232});}
// put splashes on the lens: n of them, big or not; they land toward the edges, as if thrown at you
// never near a child: no blood on the lens at a child-tied place, and none lands over a child on the screen
const BLD_KIDS=['tobias','finn','bram','ruth','pip','vera'];
function bldNearKid(x,y){try{const sc=BLD.cv.width/(VW||BLD.cv.width);for(const n of npcs){if(!n.vis||!BLD_KIDS.includes(n.def.id))continue;if(Math.hypot(sx(n.x)*sc-x,(sz(n.z)-20)*sc-y)<64)return true;}}catch(e){}return false;}
function bldSplash(n,big,opts){const lv=bldLevel();if(!lv||!bldLensCv())return;try{if(typeof goreChildNear==='function'&&goreChildNear(P.x,P.z,12))return;}catch(e){}opts=opts||{};const VWn=BLD.cv.width||VW,VHn=BLD.cv.height||VH;
  n=Math.max(1,Math.round(n*(lv===2?1.4:.8)));for(let i=0;i<n;i++){const edge=Math.random()<.6,r=BLD_R[big?2+((Math.random()*(lv===2?3:2))|0):(Math.random()*2)|0],seed=(Math.random()*8)|0;   /* a few sizes and shapes, drawn once each */
    const x=opts.x!=null?opts.x+(Math.random()-.5)*40:edge?(Math.random()<.5?Math.random()*VWn*.22:VWn-Math.random()*VWn*.22):Math.random()*VWn,y=opts.y!=null?opts.y+(Math.random()-.5)*30:edge?Math.random()*VHn*.8:(Math.random()<.5?Math.random()*VHn*.2:VHn*.5+Math.random()*VHn*.3);
    if(bldNearKid(x,y))continue;
    const runs=[];const nr=big?1+((Math.random()*(lv===2?3:2))|0):(Math.random()<.5?1:0);
    const spots=[-.45,0,.45].sort(()=>Math.random()-.5);
    for(let j=0;j<nr;j++){const L=8*Math.round(((big?26:16)+Math.random()*(lv===2?70:36))/8);runs.push({dx:Math.round(spots[j%3]*r*1.4),L,sp:.45+Math.random()*.5,d:.15+Math.random()*.5,w0:big?(Math.random()<.5?2.5:3):1.5,seed:(Math.random()*8)|0});}
    BLD.lens.push({x:Math.round(x),y:Math.round(y),r,seed,t:0,life:(lv===2?6:4.2)+Math.random()*1.5,runs});}
  bldLoop();}
// a clawed screen: three gashes from top left to bottom right, each bleeding runs from its lower lip (at Toned, dark scratches)
function bldSlash(){if(!bldLensCv())return;let near=false;try{near=typeof goreChildNear==='function'&&goreChildNear(P.x,P.z,12);}catch(e){}const lv=near?0:bldLevel(),VWn=BLD.cv.width||VW,VHn=BLD.cv.height||VH;
  // three curved rakes down one side of the screen, of different lengths, never across the middle where you are
  const side=Math.random()<.5?-1:1,base=side<0?VWn*(.08+Math.random()*.08):VWn*(.74+Math.random()*.08);
  for(let i=0;i<3;i++){const len=VHn*(.3+Math.random()*.16),x0=base+i*VWn*.045,y0=VHn*(.1+Math.random()*.12)+i*6,x1=x0+side*VWn*(.05+Math.random()*.04),y1=y0+len,bend=side*VWn*(.03+Math.random()*.03),runs=[];
    if(lv)for(let k=0;k<4+lv;k++){const f=.15+k*.7/(3+lv)+(Math.random()-.5)*.04;runs.push({fx:f,L:8*Math.round((14+Math.random()*(lv===2?60:34))/8),sp:.5+Math.random()*.5,d:.1+Math.random()*.6,w0:Math.random()<.5?1.5:2.5,seed:(Math.random()*8)|0});}
    BLD.lens.push({gash:[x0,y0,x1,y1,5-i,bend],t:0,life:5,runs,dark:!lv});}
  bldLoop();}
function bldGashCv(x0,y0,x1,y1,w,bend,dark){const k='gs|'+[x0,y0,x1,y1,w,bend].map(Math.round).join(',')+'|'+(dark?1:0);if(BLD.c[k])return BLD.c[k];
  const pad=w+bend*(bend<0?-1:1)+4,X0=Math.floor(Math.min(x0,x1)-pad),Y0=Math.floor(Math.min(y0,y1)-4),W=Math.ceil(Math.abs(x1-x0)+pad*2),H=Math.ceil(Math.abs(y1-y0)+8),m=new Uint8Array(W*H);
  const mx=(x0+x1)/2+bend,my=(y0+y1)/2;const pts=[];
  for(let i=0;i<=200;i++){const t=i/200,x=(1-t)*(1-t)*x0+2*(1-t)*t*mx+t*t*x1,y=(1-t)*(1-t)*y0+2*(1-t)*t*my+t*t*y1,hw=Math.max(.5,w*Math.sin(t*Math.PI)**.7);pts.push([x,y]);
    for(let j=-Math.ceil(hw);j<=Math.ceil(hw);j++)for(let q=-Math.ceil(hw);q<=Math.ceil(hw);q++){if(q*q+j*j>hw*hw+.3)continue;const X=Math.round(x+q-X0),Y=Math.round(y+j-Y0);if(X>=0&&Y>=0&&X<W&&Y<H)m[Y*W+X]=1;}}
  const cv=bldPaint(W,H,m,dark?[[20,6,14],[34,10,18],[48,14,22],[60,22,26],null,null]:BLD_LENS,{alpha:228,litR:.0001,glint:[0,0]});return BLD.c[k]={cv,X0,Y0,pts};}
// the edge of what comes over the top of the screen: a row of round lobes, heavier in places
function bldLip(W,seed){const k='lp|'+W+'|'+seed;if(BLD.c[k])return BLD.c[k];const H=30,bl=[];
  // a thick ragged band: lobes of different weights hanging off the top edge, the heavier ones where the runs leave
  for(let x=-6;x<W+10;x+=6+((bldH(seed,x)*9)|0)){const r=5+bldH(x,seed)*7;bl.push([x,2+bldH(seed,x+3)*4,r,r*(.8+bldH(seed,x+1)*.6)]);}
  return BLD.c[k]=bldPaint(W,H,bldMask(W,H,bl,.5),BLD_LENS,{alpha:234,litR:.0001,glint:[0,0]});}
function bldDrawRun(g,x,y,r,t){const f=Math.max(0,t-r.d);if(f<=0)return;const L=Math.round(r.L*(1-Math.exp(-f*r.sp*2.2)));if(L<2)return;const R=bldRun(r.L,r.seed,r.w0);
  g.drawImage(R.cv,0,0,15,L,x-7,y,15,L);const b=bldBead(r.w0>2.2?2:1),hx=Math.round(x-7+R.xs[Math.min(L-1,R.xs.length-1)]);g.drawImage(b,hx-((b.width)>>1),y+L-((b.height)>>1)-1);}
function bldLoop(){if(BLD.raf)return;let last=performance.now();const step=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;const c=BLD.cv,g=BLD.g;if(!c){BLD.raf=0;return;}
    const v=$('view');if(v&&(c.width!==v.width||c.height!==v.height)){c.width=v.width;c.height=v.height;}g.clearRect(0,0,c.width,c.height);
    for(const s of BLD.lens){s.t+=dt;const a=s.t<1.1?1:Math.pow(Math.max(0,1-(s.t-1.1)/(s.life-1.1)),1.3);if(a<=0)continue;g.globalAlpha=a*.92;
      if(s.gash){const [x0,y0,x1,y1,w,bend]=s.gash,G=bldGashCv(x0,y0,x1,y1,w,bend,s.dark),grow=Math.min(1,s.t/.15),h=Math.max(1,Math.round(G.cv.height*grow));
        g.drawImage(G.cv,0,0,G.cv.width,h,G.X0,G.Y0,G.cv.width,h);
        for(const r of s.runs){const p=G.pts[Math.min(G.pts.length-1,Math.round(r.fx*200))];bldDrawRun(g,Math.round(p[0]),Math.round(p[1]+w*.5),r,s.t);}continue;}
      for(const r of s.runs)bldDrawRun(g,s.x+r.dx,s.y+Math.round(s.r*.35),r,s.t);
      if(s.lip){const lp=bldLip(c.width,s.seed),h=Math.max(1,Math.round(lp.height*Math.min(1,s.t/.35)));g.drawImage(lp,0,lp.height-h,lp.width,h,0,0,lp.width,h);continue;}
      const sp=bldLensSplash(s.r,s.seed),k=Math.min(1,s.t/.08);g.drawImage(sp,Math.round(s.x-sp.width/2*k),Math.round(s.y-sp.height/2*k),Math.round(sp.width*k),Math.round(sp.height*k));}
    g.globalAlpha=1;BLD.lens=BLD.lens.filter(s=>s.t<s.life);
    if(BLD.lens.length)BLD.raf=requestAnimationFrame(step);else{g.clearRect(0,0,c.width,c.height);BLD.raf=0;}};BLD.raf=requestAnimationFrame(step);}
// gore.js's spatter and claws go on the lens now (its own square specks and bars are left empty)
if(typeof goreSplat==='function'){goreSplat=function(n,big){try{bldSplash(n,big);}catch(e){}};}
if(typeof caught==='function'){const _c=caught;caught=function(){const r=_c.apply(this,arguments);try{if(GORE.slash>0){GORE.slash=0;bldSlash();}}catch(e){}return r;};}
// Extreme's pour over the top of the screen on the story's worst beats (gorex375.js): a lip of blood along the top and the runs
// coming down from it, at the game's own pixel size
if(typeof gx2Pour==='function'){gx2Pour=function(){if(!bldLensCv())return;const VWn=BLD.cv.width||VW,VHn=BLD.cv.height||VH,runs=[];
  for(let x=10;x<VWn-10;){const deep=Math.random()<.5;runs.push({dx:x,L:8*Math.round((deep?VHn*(.3+Math.random()*.4):VHn*(.1+Math.random()*.14))/8),sp:deep?.35+Math.random()*.35:.6+Math.random()*.4,d:Math.random()*.4,w0:3,seed:(Math.random()*8)|0});x+=28+((Math.random()*44)|0);}
  BLD.lens.push({lip:1,x:0,y:10,r:0,t:0,life:4.6,runs,seed:(Math.random()*99)|0});bldLoop();};}
// the lens's shapes drawn ahead, a few at a time when the game is idle, so the first splash costs nothing
{let i=0;const J=[];for(const r of BLD_R)for(let sd=0;sd<8;sd++)J.push(()=>bldLensSplash(r,sd));for(let L=16;L<=104;L+=8)for(const w of [1.5,2.5,3])for(let sd=0;sd<8;sd+=3)J.push(()=>bldRun(L,sd,w));
  const tick=d=>{const until=performance.now()+6;while(i<J.length&&performance.now()<until)try{J[i++]();}catch(e){i++;}if(i<J.length)(window.requestIdleCallback||setTimeout)(tick,{timeout:2000});};
  setTimeout(()=>(window.requestIdleCallback||setTimeout)(tick,{timeout:2000}),8000);}
