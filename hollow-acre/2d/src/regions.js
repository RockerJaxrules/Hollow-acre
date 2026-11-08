/* ================= the valley, five times over. The land you knew sits in the middle; around it, eight more places, each its own
   ground, its own trees, its own buildings and its own part of the story:
     ROUTE 9 WEST      the road you came in on, on west past the Pine Rest Motel and a field of dead cars, to the county line
     GREYFIELD         the Home for Children, red brick behind an iron fence, and its numbered graves
     THE FEN           peat bog where the river gives out: black pools, reeds, a cutter's hut on stilts, and what the peat keeps
     THE DEEP CORN     Harlan's fields south of the river, grown into a maze, with a ring of scarecrows at its heart
     THE DROWNED VILLAGE  the reservoir they made in 1931: a steeple and rooftops standing out of the water, the dam
     PINE RIDGE        dark pines and granite north of the quarry, and the fire lookout over all of it
     OLD MARROW        the first settlement, burnt in 1872: a roofless chapel, standing chimneys, ash for ground
     THE WEEPING BIRCHES  white trees north-west, and in them, dolls
   The old land is built exactly as before; the new land is laid round it afterwards with its own dice, so nothing you have
   already cut, cleared or planted moves. ================= */
const OLDB={x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1};
const NEWB={x0:-310,x1:218,z0:-200,z1:290};
const inNewLand=(x,z)=>x<OLDB.x0||z<OLDB.z0||z>OLDB.z1;
const REGS=[
 {k:'r9w',name:'Route 9 West',x0:-310,x1:-74,z0:-42,z1:22},
 {k:'grey',name:'Greyfield',x0:-310,x1:-74,z0:22,z1:124},
 {k:'fen',name:'The Fen',x0:-310,x1:-62,z0:124,z1:290},
 {k:'corn',name:'The Deep Corn',x0:-62,x1:62,z0:124,z1:290},
 {k:'drown',name:'The Drowned Village',x0:62,x1:218,z0:124,z1:290},
 {k:'ridge',name:'Pine Ridge',x0:40,x1:218,z0:-200,z1:-42},
 {k:'marrow',name:'Old Marrow',x0:-120,x1:40,z0:-200,z1:-42},
 {k:'birch',name:'The Weeping Birches',x0:-310,x1:-120,z0:-200,z1:-42}];
const RGK=Object.fromEntries(REGS.map(r=>[r.k,r]));
// how deep inside each region a point is (half at the border, all of it 7 m in), with a ragged edge
function rgWeights(x0_,z0_,out){const j=(fbm(x0_*.07+3,z0_*.07+9)-.5)*10;const x=x0_+(fbm(x0_*.03+17,z0_*.03)-.5)*34,z=z0_+(fbm(x0_*.03,z0_*.03+29)-.5)*34;let sum=0;
  for(let i=0;i<REGS.length;i++){const r=REGS[i];const d=Math.min(r.x0<=NEWB.x0?1e9:x-r.x0,r.x1>=NEWB.x1?1e9:r.x1-x,r.z0<=NEWB.z0?1e9:z-r.z0,r.z1>=NEWB.z1?1e9:r.z1-z);
    const w=clamp(.5+(d+j)/14,0,1);out[i]=w;sum+=w;}
  if(sum>1)for(let i=0;i<REGS.length;i++)out[i]/=sum;return out;}
function rgAt(x,z){if(!inNewLand(x,z))return null;for(const r of REGS)if(x>=r.x0&&x<r.x1&&z>=r.z0&&z<r.z1)return r;return null;}
// the same, with the borders wandering, for where one region's woods give way to the next
function rgAtJ(x,z){const jx=(fbm(x*.03+17,z*.03)-.5)*34,jz=(fbm(x*.03,z*.03+29)-.5)*34;return rgAt(x+jx,z+jz)||rgAt(x,z);}
// ---- the places in each region
const RGP={motel:{x:-140,z:-17},motelSign:{x:-130.6,z:-11.4},cars:{x:-232,z:-27},county:{x:-292,z:-10.6},loopX:-302,
  home:{x:-205,z:52},gate:{x:-205,z:62.3},graves:{x:-176,z:48},hut:{x:-200,z:193},bog:{x:-236,z:226},
  cornC:{x:-26,z:196},harlan:{x:44,z:150},res:{x:140,z:205,rx:52,rz:30},dam:{x:140,z:246},steeple:{x:132,z:207},dock:{x:122,z:178},view:{x:122,z:256},
  tower:{x:150,z:-150},ranger:{x:168,z:-139},chapel:{x:-30,z:-128},spring:{x:-20,z:-104},dolls:{x:-215,z:-125},den:{x:-238,z:-98}};
const DCF={x0:-60,x1:8,z0:164,z1:228};   // the Deep Corn field
const RG_ROADS=[[-74,-6,-306,-6,3],[-140,-6,-140,-12,2],[-232,-6,-232,-19,1.6],
  [-226,-6,-226,66,2],[-226,66,-205,66,2],[-205,66,-205,53.5,1.8],[-205,66,-172,66,1.4],[-172,66,-172,59,1.2],[-226,66,-232,150,1.6],[-232,150,-206,196,1.6],[-206,196,-234,222.6,1.2],
  [20,120,20,236,2.4],[20,140,-60,150,1.8],[-60,150,-150,178,1.8],[-150,178,-196,196,1.8],[20,150,40,150,1.8],[8,197,20,197,1.8],
  [20,140,96,140,2],[96,140,118,171,2],[118,171,122,175.4,1.6],[118,171,96,178,1.6],[96,178,78,200,1.6],[78,200,80,224,1.6],[80,224,100,252,1.6],[100,252,124,256,1.6],
  [74,-6,74,-46,2],[74,-46,30,-80,2],[30,-80,-4,-112,2],[-4,-112,-26,-122,1.8],[-26,-122,-26,-127.5,1.6],
  [176,-6,176,-60,2],[176,-60,152,-138,1.8],[30,-80,110,-120,1.4],[110,-120,152,-138,1.4],
  [-26,-122,-120,-118,1.6],[-120,-118,-205,-120,1.6],[-148,-6,-152,-26,1.4],[-152,-26,-170,-60,1.4],[-170,-60,-205,-120,1.4]];
// ---- water: the reservoir (wide, narrowing to the dam), the stream below the dam, the fen's black pools
const inRes=(x,z)=>{const R=RGP.res;const dx=(x-R.x)/R.rx,dz=(z-R.z)/R.rz;if(dx*dx+dz*dz<1+(fbm(x*.2,z*.2)-.5)*.3&&z<243.6)return true;
  if(z>222&&z<244.4){const hw=lerp(30,8.2,clamp((z-222)/22,0,1))+(fbm(x*.3,z*.3)-.5)*1.4;return Math.abs(x-R.x)<hw;}return false;};
const inSpill=(x,z)=>z>246&&Math.abs(x-RGP.dam.x-(fbm(z*.2,3)-.5)*3)<1.15;
const inFenPool=(x,z)=>{const r=RGK.fen;if(x>r.x1-6||z<r.z0+6)return false;if(fbm(x*.09+40,z*.09+12)<.6)return false;
  if(Math.hypot(x-RGP.hut.x,z-RGP.hut.z)<10||Math.hypot(x-RGP.bog.x,z-RGP.bog.z)<2.5)return false;
  for(const q of RG_ROADS)if(segDist(x,z,q[0],q[1],q[2],q[3])<q[4]/2+3)return false;return true;};
const rgWater=(x,z)=>inNewLand(x,z)&&(inRes(x,z)||inSpill(x,z)||inFenPool(x,z));
// ---- woods: each region grows its own
const rgDark=(x,z,r)=>{const n=fbm(x*.13+r.x0*.01,z*.13+7);
  switch(r.k){
    case 'r9w':return (z<-14||z>3)&&n>.42&&!(Math.abs(x-RGP.motel.x)<14&&z>-26)&&!(Math.abs(x-RGP.cars.x)<22&&Math.abs(z-RGP.cars.z)<11)&&!(x<RGP.county.x+8&&x>RGP.county.x-4);
    case 'grey':return n>.5&&!(x>-232&&x<-160&&z>24&&z<74);
    case 'fen':return fbm(x*.11+3,z*.11)>.6;
    case 'corn':return (x>50||x<DCF.x0-6||z>DCF.z1+14)&&n>.4&&!(x>DCF.x0-2&&x<DCF.x1+2&&z>DCF.z0-2&&z<DCF.z1+2);
    case 'drown':{const R=RGP.res,d=Math.hypot((x-R.x)/(R.rx+14),(z-R.z)/(R.rz+14));return d>1&&n>.44;}
    case 'ridge':return n>.36&&Math.hypot(x-RGP.tower.x-6,z-RGP.tower.z-4)>16;
    case 'marrow':return n>.64&&Math.hypot(x-RGP.chapel.x-10,z-RGP.chapel.z-8)>34;
    case 'birch':return n>.4&&Math.hypot(x-RGP.dolls.x,z-RGP.dolls.z)>12;}return false;};
{const W=LAYERS.water,Dt=LAYERS.dirt,St=LAYERS.stone,Dk=LAYERS.dark;
  LAYERS.water=(x,z)=>W(x,z)||rgWater(x,z);
  LAYERS.dirt=(x,z)=>{if(!inNewLand(x,z))return Dt(x,z);if(rgWater(x,z))return false;
    if(Dt(x,z))return true;const j=(fbm(x*.6,z*.6)-.5)*1.2;
    if(x>DCF.x0-.6+j&&x<DCF.x1+.6&&z>DCF.z0-.6&&z<DCF.z1+.6)return true;                                  // ploughed under the corn
    if(x>RGP.motel.x-7+j&&x<RGP.motel.x+12-j&&z>-16.5&&z<-8)return true;                                      // the motel's gravel lot
    if(Math.hypot(x-RGP.hut.x,z-RGP.hut.z)<7+j*2)return true;                                             // trodden peat round the hut
    if(Math.hypot(x-RGP.tower.x,z-RGP.tower.z+1)<5+j)return true;                                        // the lookout's yard
    if(Math.hypot(x-RGP.chapel.x-4,z-RGP.chapel.z-3)<12+j*3)return true;                                  // ash and rubble round the chapel
    {const R=RGP.res;const d=Math.hypot((x-R.x)/(R.rx+3.5),(z-R.z)/(R.rz+3.5));if(d<1&&!inRes(x,z)&&z<244)return true;}   // the drawdown mud
    if(Math.hypot(x-RGP.dolls.x,z-RGP.dolls.z)<8+j*2)return true;
    if(x>RGP.cars.x-20&&x<RGP.cars.x+20&&z>RGP.cars.z-9&&z<RGP.cars.z+8)return fbm(x*.5,z*.5)>.38;          // the yard: worn to dirt between the wrecks
    if(inFenPool(x+1.6,z)||inFenPool(x-1.6,z)||inFenPool(x,z+1.6)||inFenPool(x,z-1.6))return true;
    return false;};
  LAYERS.stone=(x,z)=>{if(St(x,z))return true;if(!inNewLand(x,z))return false;
    
    if(Math.abs(x-RGP.home.x)<3&&z>53&&z<62)return true;                                                   // the walk up to the Home's door
    if(Math.abs(x-RGP.dam.x)<12&&z>246&&z<249.5)return !inSpill(x,z);                                     // the apron below the dam
    return false;};
  LAYERS.dark=(x,z)=>{if(!inNewLand(x,z))return Dk(x,z);if(Math.max(NEWB.x0-x,x-NEWB.x1,NEWB.z0-z,z-NEWB.z1)>-1.5-2.5*fbm(x*.3+11,z*.3+7))return true;
    if(onRoad(x,z,0)||rgWater(x,z))return false;const r=rgAtJ(x,z);return !!(r&&rgDark(x,z,r));};}
// water you can't walk into (the planks of a dock still hold you)
{const _c=collide;collide=function(p,r){_c(p,r);if(p.x>=250||!rgWater(p.x,p.z)||onDock(p.x,p.z))return;
  for(let rr=.25;rr<3.2;rr+=.25)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*Math.PI*2)*rr,z=p.z+Math.sin(a/16*Math.PI*2)*rr;if(!rgWater(x,z)||onDock(x,z)){p.x=x;p.z=z;return;}}};}
// ---- the ground of each region: its own colour, blended in at the borders
const RG_TINT={
  r9w:(r,g,b,l,h)=>[r*.86,g*.93,b*.92],
  grey:(r,g,b,l,h)=>[lerp(r,l*1.1,.6),lerp(g,l*1.03,.6),lerp(b,l*.8,.6)],
  fen:(r,g,b,l,h)=>[lerp(r,l*.86,.45)*.78+6,lerp(g,l*.86,.45)*.78+4,lerp(b,l*.6,.45)*.74],
  corn:(r,g,b,l,h)=>[lerp(r,l*1.34,.6),lerp(g,l*1.14,.6),lerp(b,l*.66,.6)],
  drown:(r,g,b,l,h)=>[lerp(r,l*.92,.5)*.94,lerp(g,l*1.0,.5)*.94,lerp(b,l*.98,.5)*.94],
  ridge:(r,g,b,l,h)=>[lerp(r,l*.7,.35)*.66,lerp(g,l*.9,.35)*.8,lerp(b,l*1.0,.35)*.92+6],
  marrow:(r,g,b,l,h)=>{const k=h<.022?.62:h<.034?1.16:1;return [(lerp(r,l*.76,.82)*.92+8)*k,(lerp(g,l*.71,.82)*.92+5)*k,(lerp(b,l*.68,.82)*.92+3)*k];},
  birch:(r,g,b,l,h)=>[lerp(r,l*1.14,.5)*1.04,lerp(g,l*1.1,.5)*1.04,lerp(b,l*.94,.5)*1.02]};
function rgTint(g,x0,z0,N){let any=false;for(const [x,z] of [[x0,z0],[x0+N,z0],[x0,z0+N],[x0+N,z0+N],[x0+N/2,z0+N/2]])if(inNewLand(x,z)||Math.min(Math.abs(x-OLDB.x0),Math.abs(z-OLDB.z0),Math.abs(z-OLDB.z1))<30)any=true;if(!any)return;
  const M=N+1,K=REGS.length,Wc=new Float32Array(M*M*K),tmp=new Array(K);let used=new Array(K).fill(false),anyW=false;
  for(let j=0;j<M;j++)for(let i=0;i<M;i++){rgWeights(x0+i,z0+j,tmp);for(let k=0;k<K;k++){Wc[(j*M+i)*K+k]=tmp[k];if(tmp[k]>.001){used[k]=true;anyW=true;}}}
  if(!anyW)return;const id=g.getImageData(0,0,CH,CH),D=id.data;const fns=REGS.map(r=>RG_TINT[r.k]);
  for(let py=0;py<CH;py++){const j=py>>5,v=((py&31)+.5)/32;for(let px=0;px<CH;px++){const i=px>>5,u=((px&31)+.5)/32;const o=(py*CH+px)*4;
      let r=D[o],gg=D[o+1],b=D[o+2];const l=r*.3+gg*.59+b*.11;let nr=0,ng=0,nb=0,wt=0;
      for(let k=0;k<K;k++){if(!used[k])continue;const a=Wc[(j*M+i)*K+k],b2=Wc[(j*M+i+1)*K+k],c=Wc[((j+1)*M+i)*K+k],d=Wc[((j+1)*M+i+1)*K+k];
        const w=a*(1-u)*(1-v)+b2*u*(1-v)+c*(1-u)*v+d*u*v;if(w<.002)continue;const t=fns[k](r,gg,b,l,hash(((x0*32+px)/3)|0,((z0*32+py)/3)|0));nr+=t[0]*w;ng+=t[1]*w;nb+=t[2]*w;wt+=w;}
      if(wt<.002)continue;D[o]=clamp(r*(1-wt)+nr,0,255);D[o+1]=clamp(gg*(1-wt)+ng,0,255);D[o+2]=clamp(b*(1-wt)+nb,0,255);}}
  g.putImageData(id,0,0);}
{const _gp=groundPixels;groundPixels=function(g,x0,z0,N){const r=_gp(g,x0,z0,N);try{rgTint(g,x0,z0,N);}catch(e){}return r;};}
// townsfolk only ever walk the old valley: keep their map of it the size it was
{const _nb=navBuild;navBuild=function(){const s={x0:B.x0,x1:B.x1,z0:B.z0,z1:B.z1};Object.assign(B,OLDB);try{_nb();}finally{Object.assign(B,s);}};}
// the big map draws the whole valley a little smaller, so it still fits and still inks quickly
MAPX.s=2.4;
REGIONS.push(['ROUTE 9 WEST',-200,-34],['PINE REST MOTEL',-140,-26],['THE COUNTY LINE',-284,-18],['GREYFIELD',-205,24],['THE FEN',-196,232],['THE DEEP CORN',-26,156],
  ['MARROW RESERVOIR',140,180],['THE DAM',140,264],['PINE RIDGE',130,-110],['THE LOOKOUT',150,-176],['OLD MARROW',-30,-160],['THE WEEPING BIRCHES',-215,-150],['HARLAN’S',44,140]);
// ---- the region builder: its own dice, its own sense of what's taken
const RR=(()=>{let a=0x2f6b1d3|0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();
const rpick=a=>a[(RR()*a.length)|0];
const RBLOCK=[];const rgReserve=(x0,z0,x1,z1)=>RBLOCK.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);
const OCC=new Map();const occKey=(i,j)=>i*100003+j;
function occFree(x,z,r){const i0=Math.floor((x-r-1)/2),i1=Math.floor((x+r+1)/2),j0=Math.floor((z-r-1)/2),j1=Math.floor((z+r+1)/2);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const L=OCC.get(occKey(i,j));if(!L)continue;for(const q of L)if(Math.hypot(q[0]-x,q[1]-z)<q[2]+r)return false;}return true;}
function occAdd(x,z,r){const k=occKey(Math.floor(x/2),Math.floor(z/2));let L=OCC.get(k);if(!L){L=[];OCC.set(k,L);}L.push([x,z,r]);}
const rgBlocked=(x,z,m)=>RBLOCK.some(b=>x>b[0]-m&&x<b[2]+m&&z>b[1]-m&&z<b[3]+m);
const rgOpen=(x,z,r,road)=>x>NEWB.x0+1&&x<NEWB.x1-1&&z>NEWB.z0+1&&z<NEWB.z1-1&&inNewLand(x,z)&&!LAYERS.water(x,z)&&!onRoad(x,z,road==null?.9:road)&&!rgBlocked(x,z,r*.5)&&occFree(x,z,r);
function rgPut(spr,x,z,o,r){const e=obj(spr,x,z,o);if(r)addCircle(x,z-.1,r);occAdd(x,z,Math.max(.4,r||.4));return e;}
function rgLamp(x,z){const e=obj('lamp',x,z,{kind:'lamp',night:'lamp_n'});lamps.push({e,x,z,dead:RR()<.25,ph:RR()*10});addCircle(x,z,.15);occAdd(x,z,.3);}
function rgBuild(spr,x,z,o){const e=building(spr,x,z,Object.assign({porch:false},o||{}));const f=SPR[spr].foot;rgReserve(x+f[0]-1,z+f[1]-1,x+f[2]+1,z+1.2);occAdd(x,z-1,.1);return e;}
function rgClear(x0,z0,x1,z1){for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(o.x<x0||o.x>x1||o.z<z0||o.z>z1)continue;if(!/^(tree|pine|bush|deco|anim|grass)$/.test(o.kind||''))continue;
  for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.7)circles.splice(j,1);OBJ.splice(i,1);}}
// a region's trees: species by weight, thick in its woods and thin in the open
function rgTrees(k,n,mix,open){const r=RGK[k];const tot=mix.reduce((a,m)=>a+m[1],0);let placed=0;
  for(let t=0;t<n*14&&placed<n;t++){const x=lerp(Math.max(NEWB.x0+1,r.x0-14),Math.min(NEWB.x1-1,r.x1+14),RR()),z=lerp(Math.max(NEWB.z0+1,r.z0-14),Math.min(NEWB.z1-1,r.z1+14),RR());if(!inNewLand(x,z)||rgAtJ(x,z)!==r)continue;
    const woods=LAYERS.dark(x,z);if(!woods&&RR()>(open||.05))continue;if(!rgOpen(x,z,1.1))continue;
    let q=RR()*tot,sp=mix[0][0];for(const m of mix){q-=m[1];if(q<=0){sp=m[0];break;}}
    const kind=/^pine/.test(sp)?'pine':/dolltree/.test(sp)?'prop':/^(holly|sumac|juniper)$/.test(sp)?'bush':'tree';rgPut(sp,x+(RR()-.5)*.3,z,{kind},kind==='prop'?.3:.4);placed++;}
  return placed;}
function rgScatter(spr,k,n,test,o,r){const R=RGK[k];let placed=0;for(let t=0;t<n*20&&placed<n;t++){const x=lerp(R.x0+1,R.x1-1,RR()),z=lerp(R.z0+1,R.z1-1,RR());
  if(!inNewLand(x,z)||(test&&!test(x,z))||!rgOpen(x,z,r||.6,.5))continue;rgPut(typeof spr==='function'?spr():spr,x,z,Object.assign({},o||{}),o&&o.col||0);placed++;}return placed;}
// ---- the Deep Corn's maze: a grid of 6 m cells carved with a walk that never crosses itself, a clearing in the middle
const DCM={c:6,paths:[]};
function dcMaze(){const W=Math.floor((DCF.x1-DCF.x0)/DCM.c),Hh=Math.floor((DCF.z1-DCF.z0)/DCM.c);const seen=new Set(),st=[[W-1,Math.floor(Hh/2)]];seen.add(st[0].join());
  const cx=i=>DCF.x0+DCM.c*(i+.5),cz=j=>DCF.z0+DCM.c*(j+.5);
  while(st.length){const [i,j]=st[st.length-1];const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[i+a,j+b]).filter(([a,b])=>a>=0&&b>=0&&a<W&&b<Hh&&!seen.has(a+','+b));
    if(!nb.length){st.pop();continue;}const [a,b]=nb[(RR()*nb.length)|0];seen.add(a+','+b);DCM.paths.push([cx(i),cz(j),cx(a),cz(b)]);st.push([a,b]);}
  DCM.paths.push([cx(W-1),cz(Math.floor(Hh/2)),DCF.x1+1,cz(Math.floor(Hh/2))]);   // the way in from Mill Road
  // a few loops knocked through so it isn't one long corridor
  for(let k=0;k<6;k++){const i=(RR()*(W-1))|0,j=(RR()*(Hh-1))|0;if(RR()<.5)DCM.paths.push([cx(i),cz(j),cx(i+1),cz(j)]);else DCM.paths.push([cx(i),cz(j),cx(i),cz(j+1)]);}}
const dcPath=(x,z)=>Math.hypot(x-RGP.cornC.x,z-RGP.cornC.z)<7.5||DCM.paths.some(p=>segDist(x,z,p[0],p[1],p[2],p[3])<1.15);
// ---------------------------------------------------------------- the build
function rgBuildAll(){const t0=performance.now();
  // the old valley's edge walls come down; the new edge goes up round everything
  for(let i=rects.length-1;i>=0;i--){const q=rects[i];if(Math.abs(q.z1-(OLDB.z0-.5))<.01||Math.abs(q.z0-(OLDB.z1+.5))<.01||Math.abs(q.x0-(OLDB.x1+2.5))<.01||Math.abs(q.x1-(OLDB.x0-6.5))<.01)rects.splice(i,1);}
  Object.assign(B,NEWB);
  addRect(B.x0-12,B.z0-14,B.x1+12,B.z0-.5);addRect(B.x0-12,B.z1+.5,B.x1+12,B.z1+14);addRect(B.x1+2.5,B.z0-14,B.x1+14,B.z1+14);addRect(B.x0-20,B.z0-14,B.x0-9,B.z1+14);
  // the river runs on west and gives out in the fen; Marrow Creek rises at the founders' spring in Old Marrow
  RIVER.push([-140,134],[-178,150]);
  const oldHead=CREEK[0];CREEK.unshift([RGP.spring.x,RGP.spring.z],[-15,-88],[-23,-68],[-17,-50]);
  for(let i=0;i<4;i++){const a=CREEK[i],b=CREEK[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/.8);for(let k=0;k<n;k++)addSeg(lerp(a[0],b[0],k/n),lerp(a[1],b[1],k/n),lerp(a[0],b[0],(k+1)/n),lerp(a[1],b[1],(k+1)/n),.95);}
  for(const q of RG_ROADS)ROADS.push(q);
  // nothing old left standing in the new roads or the new water
  for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(!/^(tree|pine|bush|deco|anim|grass)$/.test(o.kind||''))continue;
    const onNew=RG_ROADS.some(q=>segDist(o.x,o.z,q[0],q[1],q[2],q[3])<q[4]/2+.9);let nc=1e9;for(let k=0;k<4;k++)nc=Math.min(nc,segDist(o.x,o.z,CREEK[k][0],CREEK[k][1],CREEK[k+1][0],CREEK[k+1][1]));
    if(!onNew&&!(inNewLand(o.x,o.z)&&LAYERS.water(o.x,o.z))&&nc>1.8)continue;
    for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.7)circles.splice(j,1);OBJ.splice(i,1);}
  // everything already standing out here (the old road's trees, the woods past the old edge) counts as taken
  for(const o of OBJ)if(o.x<250&&inNewLand(o.x,o.z))occAdd(o.x,o.z,.6);
  // ================= ROUTE 9 WEST
  rgClear(RGP.motel.x-8,-24,RGP.motel.x+13,-8);rgBuild('rg_motel',RGP.motel.x,RGP.motel.z,{lit:true});
  rgPut('rg_motelsign',RGP.motelSign.x,RGP.motelSign.z,{kind:'prop',night:'rg_motelsign_n',glow:1},.25);rgReserve(RGP.motel.x-8,-17,RGP.motel.x+13,-8);
  rgLamp(RGP.motel.x-5,-9.6);rgLamp(RGP.motel.x+9,-9.6);put('board',RGP.motel.x+10.5,-16.3,0);rgPut('rg_car_a',RGP.motel.x-4,-13,{kind:'prop',flip:true},0);addRect(RGP.motel.x-5.85,-13.55,RGP.motel.x-2.15,-13.05);
  rgClear(RGP.cars.x-22,RGP.cars.z-10,RGP.cars.x+22,RGP.cars.z+9);rgReserve(RGP.cars.x-21,RGP.cars.z-9,RGP.cars.x+21,RGP.cars.z+8);
  for(let row=0;row<3;row++)for(let i=0;i<5;i++){if(i===2)continue;const x=RGP.cars.x-16+i*8+(RR()-.5)*1.2,z=RGP.cars.z-6+row*6;const e=obj('rg_car_'+'abc'[(row*5+i)%3],x,z,{kind:'prop',flip:RR()<.5});addRect(x-1.85,z-.55,x+1.85,z-.05);occAdd(x,z,2);}
  put('tyres',RGP.cars.x+3,RGP.cars.z+1.2,.35);put('tyres',RGP.cars.x-12,RGP.cars.z+6.6,.35);put('signpost',RGP.cars.x+1,-9.8,.2,{label:'NO DUMPING'});
  rgClear(RGP.county.x-5,-16,RGP.county.x+5,-8.5);rgPut('rg_countysign',RGP.county.x,RGP.county.z,{kind:'prop'},0);addRect(RGP.county.x-1.4,RGP.county.z-.2,RGP.county.x+1.4,RGP.county.z);
  put('signpost',-80,-9.8,.2,{label:'PINE REST 1 MI'});put('signpost',-224,-9.8,.2,{label:'GREYFIELD'});put('signpost',-152,-9.8,.2,{label:'BIRCH WOOD'});
  rgTrees('r9w',650,[['pine_0',3],['pine_1',3],['pine_o0',1],['pine_o1',1],['maple_red',1],['maple_orange',1],['spruce_0',1],['deadtree',.4]],.04);
  // ================= GREYFIELD
  rgClear(-232,24,-158,74);rgReserve(-224,26,-184,64);rgBuild('rg_home',RGP.home.x,RGP.home.z,{lit:false});
  fenceLine(-221,30,-221,62,0,'rgiron');fenceLine(-187,30,-187,62,0,'rgiron');fenceLine(-221,30,-187,30,0,'rgiron');fenceLine(-221,62,-207.2,62,0,'rgiron');fenceLine(-202.8,62,-187,62,0,'rgiron');
  rgPut('rg_gate',RGP.gate.x,RGP.gate.z,{kind:'prop',noCol:true},0);addRect(RGP.gate.x-2.1,RGP.gate.z-.3,RGP.gate.x-1.6,RGP.gate.z+.05);addRect(RGP.gate.x+1.6,RGP.gate.z-.3,RGP.gate.x+2.1,RGP.gate.z+.05);
  rgPut('rg_swing',-214,58,{kind:'prop'},0);addRect(-215.4,57.7,-212.6,58.05);rgLamp(RGP.gate.x-3,RGP.gate.z+1);
  // the numbered graves: rows of little iron crosses in their own railing, east of the Home
  rgReserve(-184,38,-160,64);fenceLine(-183,38,-161,38,0,'rgiron');fenceLine(-183,38,-183,62,0,'rgiron');fenceLine(-161,38,-161,62,0,'rgiron');fenceLine(-183,62,-174,62,0,'rgiron');fenceLine(-170,62,-161,62,0,'rgiron');
  for(let row=0;row<5;row++)for(let i=0;i<8;i++){const x=-180.5+i*2.4+(RR()-.5)*.3,z=41.5+row*4;rgPut('rg_marker_'+((RR()*3)|0),x,z,{kind:'prop'},.18);}
  put('signpost',-167.6,64.8,.2,{label:'GREYFIELD 1902'});
  rgTrees('grey',700,[['oak_green',2],['oak_russet',2],['maple_red',1],['maple_gold',1],['pine_0',1.5],['pine_1',1.5],['deadtree',.8],['deadoak',.6]],.05);
  // ================= THE FEN
  rgClear(RGP.hut.x-8,RGP.hut.z-8,RGP.hut.x+8,RGP.hut.z+4);rgBuild('rg_hut',RGP.hut.x,RGP.hut.z,{lit:true});
  for(const [dx,dz] of [[-4.6,1.4],[4.8,1.2],[5.6,-1.2]])rgPut('rg_peat',RGP.hut.x+dx,RGP.hut.z+dz,{kind:'prop'},.4);
  rgPut('rg_bogbody',RGP.bog.x,RGP.bog.z,{kind:'flat'},0);
  rgTrees('fen',620,[['snag',3],['deadtree',2],['willow',2],['spruce_1',1.2],['deadoak',.6]],.09);
  {let n=0;for(let t=0;t<9000&&n<900;t++){const R=RGK.fen;const x=lerp(R.x0+2,R.x1-2,RR()),z=lerp(R.z0+2,R.z1-2,RR());if(LAYERS.water(x,z))continue;
    let near=false;for(let a=0;a<6&&!near;a++)near=LAYERS.water(x+Math.cos(a)*1.4,z+Math.sin(a)*1.2);if(!near&&RR()>.12)continue;if(!rgOpen(x,z,.3,.4))continue;obj(RR()<.75?'reeds':'fern',x,z,{kind:'anim',grass:1,fps:1.2,ph:RR()*2});occAdd(x,z,.3);n++;}}
  put('signpost',-190,192,.2,{label:'THE FEN'});
  // ================= THE DEEP CORN
  dcMaze();rgReserve(DCF.x0-1,DCF.z0-1,DCF.x1+1,DCF.z1+1);
  for(let x=DCF.x0+.5;x<DCF.x1;x+=1.0)for(let z=DCF.z0+.5;z<DCF.z1;z+=.9){if(dcPath(x,z))continue;if(RR()<.06)continue;obj('corn_'+((RR()*3)|0),x+(RR()-.5)*.14,z,{kind:'corn'});}
  {const C=RGP.cornC;for(let i=0;i<12;i++){const a=i/12*6.283;const x=C.x+Math.cos(a)*5.6,z=C.z+Math.sin(a)*3.8;rgPut(['rg_scare_a','rg_scare_b','rg_scare_c'][i%3],x,z,{kind:'prop',flip:Math.cos(a)>0},.22);}
    rgPut('rg_scare_b',C.x,C.z-.4,{kind:'prop',scareYou:1},.22);}
  rgClear(RGP.harlan.x-8,RGP.harlan.z-14,RGP.harlan.x+18,RGP.harlan.z+3);rgReserve(RGP.harlan.x-8,RGP.harlan.z-12,RGP.harlan.x+18,RGP.harlan.z+2);
  building('h_harlan',RGP.harlan.x,RGP.harlan.z,{lit:false,porch:false});building('barn_c',RGP.harlan.x+11,RGP.harlan.z-1,{porch:false,lit:false});put('silo',RGP.harlan.x+16.6,RGP.harlan.z-4,.8);
  put('signpost',24,193.5,.2,{label:'THE DEEP CORN'});put('signpost',24,147.5,.2,{label:'HARLAN’S'});put('cart',RGP.harlan.x-5,RGP.harlan.z+1.4);addRect(RGP.harlan.x-6.2,RGP.harlan.z+.8,RGP.harlan.x-3.8,RGP.harlan.z+1.4);
  rgTrees('corn',380,[['maple_red',2],['maple_orange',2],['maple_gold',2],['sumac',1],['oak_russet',1],['pine_0',1]],.04);
  // ================= THE DROWNED VILLAGE
  {const R=RGP.res;obj('rg_steeple',RGP.steeple.x,RGP.steeple.z,{kind:'prop',noCol:true});
    for(const [x,z] of [[152,198],[121,214],[158,221],[140,190]])obj('rg_roofpeak',x,z,{kind:'prop',noCol:true,flip:x>140});
    rgPut('rg_dam',RGP.dam.x,RGP.dam.z,{kind:'bld'},0);addRect(RGP.dam.x-8.6,RGP.dam.z-1.3,RGP.dam.x+8.6,RGP.dam.z);rgReserve(RGP.dam.x-10,RGP.dam.z-6,RGP.dam.x+10,RGP.dam.z+3);
    for(const sd of [-1,1])for(let k=0;k<3;k++)rgPut('rg_outcrop',RGP.dam.x+sd*(12+k*7),RGP.dam.z-4-k*5,{kind:'prop',flip:sd>0},0);
    put('dock',RGP.dock.x,RGP.dock.z,0,{kind:'flat'});addDock(RGP.dock.x,RGP.dock.z);put('signpost',RGP.dock.x+2.4,RGP.dock.z-3.4,.2,{label:'NO SWIMMING'});
    put('wk_boat',RGP.dock.x-2.6,RGP.dock.z+2.2,0,{kind:'prop',noCol:true});
    put('signpost',RGP.view.x-6,RGP.view.z-1.6,.2,{label:'MARROW DAM'});put('crate',RGP.view.x+1.4,RGP.view.z+.8,.3);}
  rgTrees('drown',560,[['willow',2],['birch_gold',1.5],['spruce_0',1.5],['pine_1',1.5],['maple_gold',1]],.05);
  {let n=0;for(let t=0;t<6000&&n<320;t++){const R=RGP.res;const a=RR()*6.283,d=1+RR()*.12;const x=R.x+Math.cos(a)*R.rx*d,z=R.z+Math.sin(a)*R.rz*d;if(LAYERS.water(x,z)||!rgOpen(x,z,.3,.4))continue;obj('reeds',x,z,{kind:'anim',grass:1,fps:1.2,ph:RR()*2});occAdd(x,z,.3);n++;}}
  // ================= PINE RIDGE
  rgClear(RGP.tower.x-10,RGP.tower.z-6,RGP.tower.x+24,RGP.tower.z+16);rgReserve(RGP.tower.x-3,RGP.tower.z-3,RGP.tower.x+3,RGP.tower.z+2);
  rgPut('rg_tower',RGP.tower.x,RGP.tower.z,{kind:'bld',night:'rg_tower_n'},0);addRect(RGP.tower.x-1.1,RGP.tower.z-1.2,RGP.tower.x+1.1,RGP.tower.z);
  rgBuild('rg_logcabin',RGP.ranger.x,RGP.ranger.z,{lit:false});put('firewood',RGP.ranger.x+3.2,RGP.ranger.z+.6,.3);put('signpost',RGP.tower.x+3,RGP.tower.z+3.4,.2,{label:'LOOKOUT'});
  rgScatter('rg_outcrop','ridge',38,null,{kind:'prop',col:0},2.2);
  for(const o of OBJ.slice(-38))if(o.spr==='rg_outcrop')addRect(o.x-1.8,o.z-1,o.x+1.8,o.z-.05);
  rgScatter(()=>rpick(['rock_0','rock_1']),'ridge',90,null,{kind:'prop',col:0},.6);
  rgTrees('ridge',1100,[['pine_0',3],['pine_1',3],['spruce_0',2.5],['spruce_1',2.5],['juniper',1],['pine_o0',.5]],.06);
  // ================= OLD MARROW
  {const C=RGP.chapel;rgClear(C.x-12,C.z-8,C.x+12,C.z+3);rgBuild('rg_chapel',C.x,C.z,{lit:false});
    for(const [x,z] of [[-2,-114],[10,-103],[-50,-112],[-60,-127],[8,-129],[-12,-94],[-44,-98]]){rgClear(x-2,z-2,x+2,z+1);rgPut('rg_chimney',x,z,{kind:'prop'},.6);}
    rgPut('rg_oldwell',RGP.spring.x+3.2,RGP.spring.z-1.4,{kind:'prop'},.75);
    for(let i=0;i<10;i++){const x=-19+(i%5)*2.6,z=-133+((i/5)|0)*2.4;rgPut('grave_'+((RR()*4)|0),x,z,{kind:'prop'},.3);}
    put('signpost',4,-110,.2,{label:'OLD MARROW'});}
  rgTrees('marrow',520,[['rg_burnt_a',3],['rg_burnt_b',3],['deadoak',1],['snag',1],['deadtree',1]],.07);
  // ================= THE WEEPING BIRCHES
  {const D=RGP.dolls;for(let i=0;i<9;i++){const a=i/9*6.283+.3;const x=D.x+Math.cos(a)*7.4,z=D.z+Math.sin(a)*5.2;rgPut(i%2?'rg_dolltree_a':'rg_dolltree_b',x,z,{kind:'prop'},.3);}
    rgPut('rg_den',RGP.den.x,RGP.den.z,{kind:'prop'},.8);put('signpost',-196,-116,.2,{label:'BIRCH WOOD'});}
  rgTrees('birch',1150,[['birch_gold',4],['birch_green',3],['rg_dolltree_a',.35],['rg_dolltree_b',.35],['deadtree',.3],['holly',.3]],.05);
  // milestones: the old county posts at the heart of each place, and three in the old valley
  for(const m of RG_MILES)rgPut('rg_mile',m.x,m.z,{kind:'prop',mile:m.k},.28);
  console.log('regions built',((performance.now()-t0)|0)+'ms',OBJ.length);}
const RG_MILES=[{k:'farm',name:'Hollow Acre',x:-13.2,z:-10.2},{k:'town',name:'Marrow Hollow green',x:38.6,z:3.2},{k:'wick',name:'Wickham',x:118.8,z:51.6},
  {k:'r9w',name:'Pine Rest Motel',x:-126.4,z:-9.4},{k:'grey',name:'Greyfield',x:-209,z:65.2},{k:'fen',name:'The Fen',x:-192.4,z:197.6},{k:'corn',name:'The Deep Corn',x:23.4,z:198.2},
  {k:'drown',name:'Marrow Reservoir',x:115,z:170},{k:'ridge',name:'The Lookout',x:155.4,z:-137},{k:'marrow',name:'Old Marrow',x:-2.6,z:-108.6},{k:'birch',name:'The Weeping Birches',x:-205,z:-114.6}];
{const _bw=buildWorld;buildWorld=function(){_bw();try{rgBuildAll();}catch(e){console.error('regions',e);}};}
// Route 9's asphalt runs on to the county line
// the map shows each region in its own colour too
function rgMapTint(c){const s=MAPX.s,pad=MAPX.pad,W=c.width,H=c.height;const g=c.getContext('2d');const id=g.getImageData(0,0,W,H),D=id.data;const tmp=new Array(REGS.length);const fns=REGS.map(r=>RG_TINT[r.k]);
  for(let by=pad;by<H-pad;by+=3)for(let bx=pad;bx<W-pad;bx+=3){const wx=B.x0+(bx+1.5-pad)/s,wz=B.z0+(by+1.5-pad)/s;
    if(!inNewLand(wx,wz)&&Math.min(Math.abs(wx-OLDB.x0),Math.abs(wz-OLDB.z0),Math.abs(wz-OLDB.z1))>28)continue;if(onRoad(wx,wz,.5))continue;rgWeights(wx,wz,tmp);
    for(let y=by;y<Math.min(by+3,H-pad);y++)for(let x=bx;x<Math.min(bx+3,W-pad);x++){const o=(y*W+x)*4;const r=D[o],gg=D[o+1],b=D[o+2],l=r*.3+gg*.59+b*.11;let nr=0,ng=0,nb=0,wt=0;
      for(let k=0;k<tmp.length;k++){const w=tmp[k];if(w<.002)continue;const t=fns[k](r,gg,b,l,.5);nr+=t[0]*w;ng+=t[1]*w;nb+=t[2]*w;wt+=w;}
      if(wt<.002)continue;D[o]=clamp(r*(1-wt)+nr,0,255);D[o+1]=clamp(gg*(1-wt)+ng,0,255);D[o+2]=clamp(b*(1-wt)+nb,0,255);}}
  g.putImageData(id,0,0);}
{const _mp=mapPaint;mapPaint=function(){const c=_mp.apply(this,arguments);try{rgMapTint(c);}catch(e){console.warn('map tint',e);}return c;};}
