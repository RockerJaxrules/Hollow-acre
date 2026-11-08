/* ================= world: layout, ground, objects, collision ================= */
const PPM=32;
const B={x0:-74,x1:72,z0:-42,z1:40};
const FIELD={x0:-5,z0:0,w:10,h:8};
const FSTART={i0:3,j0:0,w:4,h:3};   // the patch Grandpa still kept clear; the rest of the field has gone wild
const CORN={x0:-15,x1:11,z0:11.5,z1:24};
const inCorn=(x,z)=>x>CORN.x0&&x<CORN.x1&&z>CORN.z0&&z<CORN.z1;
const pond={x:-30,z:24.5,r:7.5};
const wellPos={x:7.3,z:-10.5},binPos={x:-3.6,z:-8.6},doorPos={x:0,z:-8.9},carPos={x:-60.2,z:-1.4},pumpPos={x:-30.5,z:-10.3},boothPos={x:34.6,z:-9.6};
const crossPos={x:20,z:19},boardPos={x:44.6,z:-3.2},tsPos={x:22.8,z:-8.2},farmSignPos={x:-13.4,z:-10.1},squarePos={x:50,z:2.6};
// ---------- Marrow Hollow, rebuilt as a real little town. Main Street is Route 9; Hill, Market and Elm Streets and Orchard Lane run
// parallel to it; Church Street, the two Green Streets and East Avenue cross them. The town green sits between Main and Market.
// Every building faces the street to the south of it, so each block is one row of fronts with gardens behind.
const TOWN={main:-6,hill:-25,market:11,elm:29,orchard:46,gw:36,ge:64,church:50,east:74,mill:20};
const GREEN={x0:37.3,x1:62.7,z0:-4.4,z1:9.6};
const TB={ // [sprite, x, front z, options]
  store:['store',29,-9.4,{jack:1}],post:['postoffice',38.2,-9.4,{porch:false}],danny:['house_a',44.6,-9.4,{lit:false,porch:false}],hall:['townhall',56.6,-9.4,{porch:false,lit:false}],dunn:['house_d',66.5,-9.4,{jack:1}],
  hale:['house_b',38,-27.2,{}],church:['church',50,-27.6,{}],crane:['house_d',62.5,-27.2,{}],pell:['house_c',70,-27.2,{lit:false,porch:false}],
  vance:['house_c',25,26.6,{}],lindqvist:['house_b',31.5,26.6,{jack:1}],school:['schoolhouse',50,26.6,{jack:1}],oakes:['house_b2',59,26.6,{}],gale:['house_d2',69,26.6,{jack:1}],
  marr:['house_c2',26,44,{lit:false}],wren:['house_a2',68.5,44,{lit:false,porch:false}]};
const tbDoor=k=>[TB[k][1],TB[k][2]+.35],tbOut=k=>({x:TB[k][1],z:TB[k][2]+.7});
const GYARD={x0:41,x1:72,z0:-41.6,z1:-32.6,gate:57},YOURGRAVE={x:66.6,z:-36.8},CHURCH_DOOR={x:50,z:-27.2};
// Hill Street stands on a terrace: a stone retaining wall along the back of the Main Street gardens, steps up at the head of Church Street
const TERRACE={z:-22.4,base:-21.3,x0:29.6,x1:72.4,steps:[48.8,51.2]};
const inTown=(x,z,m)=>{m=m||0;return x>20.6-m&&x<76+m&&z>-42.2-m&&z<45+m;};
const fishSpot={x:pond.x,z:pond.z-pond.r+3.6};
const ALTAR_POS=[[-27,8,'west woods'],[-2,29,'cornfield'],[70.2,-39.6,'churchyard']];
const SCARE_SPOTS=[[6.9,4],[9.8,-1.2],[2.2,-7.6]];
const ROADS=[[-12.5,-6,70,-6,3],[16,-9.4,16,-6,2.8],[0,-8.6,0,-1,2],[20,-6,20,19,2],[20,19,4,19,1.6],[-46,-6,-46,-9,1.8],[-36,-6,-36,-10.6,2],[2,-9,6,-9,1.4],
  // the town's streets
  [33,TOWN.hill,74,TOWN.hill,2],[TOWN.church,TOWN.hill,TOWN.church,TOWN.main,2],[GYARD.gate,TOWN.hill,GYARD.gate,GYARD.z0+.6,1.2],
  [20,TOWN.market,74,TOWN.market,2.4],[20,TOWN.elm,74,TOWN.elm,2],[TOWN.gw,TOWN.main,TOWN.gw,TOWN.elm,2],[TOWN.ge,TOWN.main,TOWN.ge,TOWN.elm,2],[TOWN.east,TOWN.main,TOWN.east,TOWN.orchard,2]];
const SIDEWALKS=[];
// ---------- the north ridge: a cliff face you see from the front, plateau behind it
const RIDGE={x0:-50,x1:30,h:1.85};
const ridgeZ=x=>-21.5+1.5*Math.sin(x*.13)+.8*Math.sin(x*.31);
const ridgeH=x=>x<RIDGE.x0||x>RIDGE.x1?0:RIDGE.h*clamp(Math.min(x-RIDGE.x0,RIDGE.x1-x)/4,0,1);
const onPlateau=(x,z)=>ridgeH(x)>.2&&z<ridgeZ(x);
// ---------- Marrow Creek: falls off the ridge, under the covered bridge on Route 9, down to the pond
const CREEK=[[-19,-30],[-19.2,-22.3],[-21,-17],[-23,-12],[-24,-6],[-27,-1],[-33,4],[-35,10],[-35,15],[-33.4,18.2],[-31.6,20.6]];
const BRIDGE={x:-24.5,z:-2.8},FOOT={x:-35,z:12.4};
function creekDist(x,z){let d=1e9;for(let i=0;i<CREEK.length-1;i++){const a=CREEK[i],b=CREEK[i+1];d=Math.min(d,segDist(x,z,a[0],a[1],b[0],b[1]));}return d;}
const creekW=(x,z)=>1.15+(fbm(x*.4+9,z*.4)-.5)*.7;
const inCreek=(x,z)=>creekDist(x,z)<creekW(x,z)&&!(onPlateau(x,z)&&z>ridgeZ(x)-.6);
const rand=(()=>{let a=0x9e3779b9;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};})();
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
function hash(x,z){let h=Math.imul((x|0)*374761393+(z|0)*668265263,1274126177);h^=h>>>13;h=Math.imul(h,1103515245);return ((h>>>0)&0xffff)/65535;}
function vnoise(x,z){const xi=Math.floor(x),zi=Math.floor(z),xf=x-xi,zf=z-zi,u=smooth(xf),v=smooth(zf);
  return lerp(lerp(hash(xi,zi),hash(xi+1,zi),u),lerp(hash(xi,zi+1),hash(xi+1,zi+1),u),v);}
function fbm(x,z){return vnoise(x,z)*.55+vnoise(x*2.1+7,z*2.1+3)*.3+vnoise(x*4.3+1,z*4.3+9)*.15;}
function segDist(px,pz,x1,z1,x2,z2){const dx=x2-x1,dz=z2-z1,L=dx*dx+dz*dz||1;const t=clamp(((px-x1)*dx+(pz-z1)*dz)/L,0,1);return Math.hypot(px-x1-dx*t,pz-z1-dz*t);}
// ---------- terrain layers (membership tested at tile corners; LPC autotiles drawn per cell)
const onRoad=(x,z,extra)=>{for(const r of ROADS)if(segDist(x,z,r[0],r[1],r[2],r[3])<r[4]/2+(extra||0))return true;return false;};
// cobbles: Main Street through town, Market Street, Church Street, and the paths on the green
const greenPath=(x,z)=>x>GREEN.x0&&x<GREEN.x1&&z>GREEN.z0&&z<GREEN.z1&&(Math.hypot(x-squarePos.x,(z-squarePos.z)*1.2)<4.4||Math.abs(x-squarePos.x)<.85||Math.abs(z-squarePos.z)<.75);
const townStone=(x,z)=>(Math.abs(z+6)<2.3&&x>21.4&&x<76)||(Math.abs(z-TOWN.market)<1.5&&x>21&&x<75)||(Math.abs(x-TOWN.church)<1.1&&z>TOWN.hill-1&&z<-6)||greenPath(x,z);
// the schoolyard behind the school is worn to dirt by a hundred years of games
const schoolField=(x,z)=>x>38.4+(fbm(x*.5,z*.5)-.5)*1.4&&x<53.8&&z>14.4+(fbm(x*.6+3,z*.6)-.5)*1.2&&z<21.4;
const LAYERS={
  dirt:(x,z)=>{const j=(fbm(x*.7,z*.7)-.5)*.8;return onRoad(x,z,j)||(Math.hypot(x-pond.x,z-pond.z)<pond.r+1.6+j&&Math.hypot(x-pond.x,z-pond.z)>pond.r-.4)
    ||(x>CORN.x0-.6&&x<CORN.x1+.6&&z>CORN.z0-.6&&z<CORN.z1+.6)||(x>FIELD.x0+FSTART.i0-.35+j*.3&&x<FIELD.x0+FSTART.i0+FSTART.w+.35-j*.3&&z>FIELD.z0+FSTART.j0-.35+j*.3&&z<FIELD.z0+FSTART.j0+FSTART.h+.35-j*.3)
    ||(Math.hypot(x+60.6,z-1.2)<3.0+j)||schoolField(x,z)||(x>-7+j&&x<7-j&&z>-9.6&&z<-7.2+j*.5);},
  stone:(x,z)=>(Math.abs(z+6)<2.6&&x<-12.5)||townStone(x,z),
  water:(x,z)=>(Math.hypot(x-pond.x,z-pond.z)<pond.r+(fbm(x*.8,z*.8)-.5)*.9&&!(x>pond.x-1.1&&x<pond.x+1.1&&z<pond.z-pond.r+4.2))||inCreek(x,z),
  dark:(x,z)=>Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1)>-1.5-2.5*fbm(x*.3+11,z*.3+7)||((x<-16&&z>6)||(z>28))&&fbm(x*.22+70,z*.22)>.5,
};
function terr(x,z){if(LAYERS.water(x,z))return 'water';if(LAYERS.stone(x,z))return 'stone';if(LAYERS.dirt(x,z))return 'dirt';return 'grass';}
// ---------- collision
const circles=[],rects=[],segs=[];
function addCircle(x,z,r){circles.push({x,z,r});}
function addRect(x0,z0,x1,z1){rects.push({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1)});}
function addSeg(x1,z1,x2,z2,r){segs.push({x1,z1,x2,z2,r});}
// a grid over the colliders, so a step only looks at what's near it (the valley is far too big now to test every tree each frame).
// Anything added or taken away marks it stale; it's also redrawn every few seconds for the few things that move in place.
const CGRID={c:6,m:new Map(),dirty:true,t:0,stamp:1,A:{c:[],r:[],s:[]}};
function cgAdd(k,q){const c=CGRID.c,m=CGRID.m;let x0,z0,x1,z1;
  if(k==='c'){x0=q.x-q.r;z0=q.z-q.r;x1=q.x+q.r;z1=q.z+q.r;}else if(k==='r'){x0=q.x0;z0=q.z0;x1=q.x1;z1=q.z1;}
  else{const r=q.r||.15;x0=Math.min(q.x1,q.x2)-r;z0=Math.min(q.z1,q.z2)-r;x1=Math.max(q.x1,q.x2)+r;z1=Math.max(q.z1,q.z2)+r;}
  const i0=Math.floor(x0/c),i1=Math.floor(x1/c),j0=Math.floor(z0/c),j1=Math.floor(z1/c);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const key=i*100003+j;let b=m.get(key);if(!b){b={c:[],r:[],s:[]};m.set(key,b);}b[k].push(q);}}
// adding goes straight into the grid; taking away marks it to be redrawn
for(const [arr,k] of [[circles,'c'],[rects,'r'],[segs,'s']]){arr.push=function(){const n=Array.prototype.push.apply(this,arguments);if(!CGRID.dirty)for(const q of arguments)cgAdd(k,q);return n;};
  arr.splice=function(){CGRID.dirty=true;return Array.prototype.splice.apply(this,arguments);};}
function cgBuild(){CGRID.m.clear();for(const q of circles)cgAdd('c',q);for(const q of rects)cgAdd('r',q);for(const q of segs)cgAdd('s',q);CGRID.dirty=false;CGRID.t=performance.now();}
function cgNear(x,z,r){if(CGRID.dirty||performance.now()-CGRID.t>3000)cgBuild();const c=CGRID.c,A=CGRID.A;A.c.length=0;A.r.length=0;A.s.length=0;const st=++CGRID.stamp;
  const i0=Math.floor((x-r)/c),i1=Math.floor((x+r)/c),j0=Math.floor((z-r)/c),j1=Math.floor((z+r)/c);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const b=CGRID.m.get(i*100003+j);if(!b)continue;
    for(const k of ['c','r','s'])for(const it of b[k]){if(it._cg===st)continue;it._cg=st;A[k].push(it);}}
  return A;}
function collide(p,r){const A=cgNear(p.x,p.z,r+1.2);
  for(const c of A.c){const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-5){p.x=c.x+dx/d*m;p.z=c.z+dz/d*m;}}
  for(const q of A.r){const cx=clamp(p.x,q.x0,q.x1),cz=clamp(p.z,q.z0,q.z1);const dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
    if(d<r){if(d>1e-5){p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{const l=p.x-q.x0,rr=q.x1-p.x,t=p.z-q.z0,bb=q.z1-p.z,mn=Math.min(l,rr,t,bb);
      if(mn===l)p.x=q.x0-r;else if(mn===rr)p.x=q.x1+r;else if(mn===t)p.z=q.z0-r;else p.z=q.z1+r;}}}
  for(const s of A.s){const dx=s.x2-s.x1,dz=s.z2-s.z1,L=dx*dx+dz*dz||1;const t=clamp(((p.x-s.x1)*dx+(p.z-s.z1)*dz)/L,0,1);const cx=s.x1+dx*t,cz=s.z1+dz*t;
    const ex=p.x-cx,ez=p.z-cz,d=Math.hypot(ex,ez),m=s.r+r;if(d<m&&d>1e-5){p.x=cx+ex/d*m;p.z=cz+ez/d*m;}}
  if(Math.hypot(p.x-pond.x,p.z-pond.z)<pond.r-.3&&!(Math.abs(p.x-pond.x)<.9&&p.z<pond.z-pond.r+4.2)){const dx=p.x-pond.x,dz=p.z-pond.z,d=Math.hypot(dx,dz)||1;p.x=pond.x+dx/d*(pond.r-.3);p.z=pond.z+dz/d*(pond.r-.3);}
  if(p.x<250){p.x=clamp(p.x,B.x0-6,B.x1+3);p.z=clamp(p.z,B.z0+.5,B.z1-.5);}
}
const BLOCK=[];   // rects reserved by buildings, the field, yards etc.
function reserve(x0,z0,x1,z1){BLOCK.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);}
function clearSpot(x,z,m){m=m||0;
  for(const r of BLOCK)if(x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m)return false;
  if(Math.hypot(x-pond.x,z-pond.z)<pond.r+2.5+m)return false;
  if(creekDist(x,z)<2+m)return false;
  if(ridgeH(x)>0&&z>ridgeZ(x)-1.4-m&&z<ridgeZ(x)+RIDGE.h+1.4+m)return false;
  if(inTown(x,z,m))return false;
  if(Math.abs(z+6)<3.5+m&&x<-12)return false;
  if(Math.hypot(x-crossPos.x,z-crossPos.z)<4.5+m)return false;
  if(x>CORN.x0-1.5&&x<CORN.x1+1.5&&z>CORN.z0-1.5&&z<CORN.z1+1.5)return false;
  for(const a of ALTAR_POS)if(Math.hypot(x-a[0],z-a[1])<3.5+m)return false;
  for(const r of ROADS)if(segDist(x,z,r[0],r[1],r[2],r[3])<r[4]/2+1.2+m)return false;
  for(const pg of (typeof PAGES!=='undefined'?PAGES:[]))if(Math.hypot(x-pg.x,z-pg.z)<1.5+m)return false;
  return true;}
// ---------- world objects: {spr, x, z, flip?, night?, kind?, alpha?, hide?}
const OBJ=[];
// a bush may not sit on anything solid: fences, trees, props, buildings
function footBox(o){const m=SPR[o.spr];if(!m)return null;let f=m.foot&&(m.foot[0]||m.foot[2])?m.foot:null;
  if(!f){const hw=Math.min(1.2,m.fw/PPM*.35);f=[-hw,-Math.min(.6,hw*.6),hw,.05];}
  if(o.kind==='tree'||o.kind==='pine')f=[-.5,-.4,.5,.2];if(o.kind==='fence')f=o.spr.endsWith('_h')?[-.1,-.25,(o.clipw||2)+.1,.15]:[-.25,-1.1,.25,.1];
  return [o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]];}
function bushOK(x,z){const A=[x-.6,z-.45,x+.6,z+.15];for(const o of OBJ){if(['deco','anim','flat','corn','grass'].includes(o.kind))continue;if(Math.abs(o.x-x)>6||Math.abs(o.z-z)>8)continue;const C=footBox(o);if(!C)continue;
  if(Math.min(A[2],C[2])>Math.max(A[0],C[0])&&Math.min(A[3],C[3])>Math.max(A[1],C[1]))return false;}return true;}
function obj(spr,x,z,o){const e=Object.assign({spr,x,z},o||{});OBJ.push(e);return e;}
function solid(e,shrink){const m=SPR[e.spr];if(!m||!m.foot)return;const f=m.foot;const s=shrink===undefined?.05:shrink;
  if(f[2]-f[0]<.05&&f[3]-f[1]<.05)return;addRect(e.x+f[0]+s,e.z+f[1]+s,e.x+f[2]-s,e.z+f[3]-s);}
const HOUSES=[];
function building(spr,cx,front,o){o=o||{};const e=obj(spr,cx,front,Object.assign({night:SPR[spr+'_n']?spr+'_n':null,kind:'bld'},o));const m=SPR[spr];const f=m.foot;
  addRect(cx+f[0]+.1,front+f[1]+.3,cx+f[2]-.1,front-.15);reserve(cx+f[0]-2,front+f[1]-3,cx+f[2]+2,front+1.6);
  HOUSES.push({e,x:cx,z:front,lit:o.lit!==false,w:m.bw||6});
  if(o.porch!==false&&spr!=='church'&&spr!=='garage'){const w=(m.bw||6)/2;const a=obj(rand()<.5?'pumpkin':'pumpkin_b',cx-w+.6,front+.55);const b=obj(o.jack?'jack':'pumpkin',cx+w-.6,front+.55,{glow:o.jack?1:0});addCircle(a.x,a.z,.3);addCircle(b.x,b.z,.3);}
  return e;}
const put=(spr,x,z,r,o)=>{const e=obj(spr,x,z,o);if(r)addCircle(x,z-.1,r);return e;};
function scatter(n,spacing,pick,test,rad){const placed=[];let tries=0;while(placed.length<n&&tries<n*60){tries++;const x=Math.round(lerp(B.x0-14,B.x1+12,rand())*2)/2,z=Math.round(lerp(B.z0-10,B.z1+12,rand())*2)/2;
    if(!test(x,z))continue;if(OBJ.some(o=>o.solid&&Math.hypot(o.x-x,(o.z-z)*1.3)<spacing))continue;const e=obj(pick(),x,z,{kind:'tree',solid:1});if(rad)addCircle(x,z,rad);placed.push(e);}}
function buildWorld(){
  // ---------- Grandpa's farm (laid out by hand)
  building('cabin',0,-9.4,{jack:1});
  put('jack_b',-1.6,-8.85,.25,{glow:1});
  // porch-side: shipping crate by the door, rain barrels at the left corner, firewood + chopping block at the right
  put('crate',binPos.x,binPos.z,0,{kind:'bin'});addRect(binPos.x-.5,binPos.z-.6,binPos.x+.5,binPos.z);
  put('barrel',-4.1,-9.55,.33);put('barrel',-4.75,-9.95,.33);put('sacks',-5.35,-8.8);
  put('firewood',4.5,-9.7);addRect(3.8,-10.2,5.2,-9.6);
  put('well',wellPos.x,wellPos.z+.9);addCircle(wellPos.x,wellPos.z+.4,1.05);reserve(wellPos.x-1.6,wellPos.z-1.3,wellPos.x+1.6,wellPos.z+1.6);
  // two old trees framing the house, a grove behind it under the ridge
  for(const [n,x,z] of [['maple_orange',-6.6,-12.6],['maple_gold',6.8,-14.2],['maple_red',-1.5,-16.2],['maple_green',3.6,-17.4],['maple_orange',9.5,-17.6]]){obj(n,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);}
  for(const [x,z] of [[-8.3,-12.2],[8.4,-13.6],[-3.4,-15.5]]){obj('bush_green',x,z,{kind:'bush'});addCircle(x,z-.15,.55);}
  reserve(-11,-19,12,-7.5);
  // the farm gate: fence along the west edge, an open gate where the lane comes in, the sign and mailbox outside it
  fenceLine(-12.6,-17,-12.6,-7.6);fenceLine(-12.6,-4.4,-12.6,4);
  put('signpost',-13.4,-10.1,.2,{label:'HOLLOW ACRE'});put('mailbox',-13.6,-1.9,.15);
  // the field, fenced with a gate at the top; scarecrow inside, pumpkins at the corners
  fenceLine(-6,-1,-1,-1);fenceLine(1,-1,6,-1);fenceLine(-6,-1,-6,9);fenceLine(6,-1,6,9);fenceLine(-6,9,6,9);
  reserve(-7,-2,7,10);
  put('pumpkin',-5.3,-.3,.25);put('pumpkin_b',5.3,-.4,.25);put('pumpkin',-5.3,8.3,.25);put('pumpkin',5.3,8.2,.25);
  // windpump on its own patch west of the field, a water trough at its foot
  put('windpump',-9.2,1.4,.45);obj('blades',-9.2,1.42,{kind:'anim',fps:6,yoff:135});put('barrel',-8.2,1.6,.3);reserve(-11.5,-1.5,-7,3.5);
  // ---------- crash site on Route 9
  put('car_wreck',carPos.x-.8,carPos.z+3.2,0,{night:'car_wreck_n',kind:'wreck'});addRect(carPos.x-1.8,carPos.z-1.2,carPos.x+1.2,carPos.z+3.1);
  put('deadtree',carPos.x+.15,carPos.z+3.45,.35);reserve(-65,-8,-56,4);
  // ---------- Marrow Hollow
  buildTown();
  // garage + pump on the west road, the widow's house north of the highway
  building('garage',-36,-10.6,{lit:true});put('gas_pump',pumpPos.x,pumpPos.z+1.6,0,{night:'gas_pump_n'});addCircle(pumpPos.x-.4,pumpPos.z,.35);addCircle(pumpPos.x+.4,pumpPos.z,.35);
  put('barrel',-31.6,-11.9,.3);put('barrel',-31.1,-11.5,.3);put('crate',-40.8,-10.9,.3);put('firewood',-41.6,-12);
  building('house_a',-46,-9.6,{jack:1});
  // crossroads shrine
  put('signpost',crossPos.x-1.6,crossPos.z-1.2,.2,{label:'FARM'});
  // ---------- Marrow Creek: covered bridge on Route 9, footbridge in the west woods, falls off the ridge
  put('cbridge',BRIDGE.x,BRIDGE.z,0,{night:'cbridge_n',kind:'bld'});addSeg(BRIDGE.x-4.7,-9.1,BRIDGE.x+4.7,-9.1,.15);addSeg(BRIDGE.x-4.7,-2.9,BRIDGE.x+4.7,-2.9,.15);
  put('footbridge',FOOT.x,FOOT.z,0,{kind:'flat'});put('footbridge_rail',FOOT.x,FOOT.z+.5,0,{kind:'prop',noCol:true});put('dock',pond.x,pond.z-pond.r+1.85,0,{kind:'flat'});
  obj('falls',-19.2,ridgeZ(-19.2)+RIDGE.h+.15,{kind:'anim',fps:8});
  {const skip=(x,z)=>(Math.abs(z+6)<3.1&&Math.abs(x-BRIDGE.x)<5.2)||(Math.abs(z-FOOT.z)<1.6&&Math.abs(x-FOOT.x)<3);
    for(const s of [-1,1])addSeg(FOOT.x-2.3,FOOT.z+s*.95,FOOT.x+2.3,FOOT.z+s*.95,.12);
    for(let i=0;i<CREEK.length-1;i++){const a=CREEK[i],b=CREEK[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/.8);
      for(let k=0;k<n;k++){const x1=lerp(a[0],b[0],k/n),z1=lerp(a[1],b[1],k/n),x2=lerp(a[0],b[0],(k+1)/n),z2=lerp(a[1],b[1],(k+1)/n);if(skip(x1,z1)||skip(x2,z2))continue;addSeg(x1,z1,x2,z2,.95);}}}
  // the ridge face blocks the way north
  for(let x=RIDGE.x0;x<RIDGE.x1;x+=.8){if(ridgeH(x)<.3)continue;addSeg(x,ridgeZ(x)+.9,x+.8,ridgeZ(x+.8)+.9,.5);}
  // ---------- the farm: red barn + silo east of the field, windpump, mailbox, hens
  building('barn',16,-9.6,{porch:false});put('silo',20.6,-12.6,.8);reserve(11.5,-15,22,-8.6);
  put('hay',11.5,-10.4);addRect(10.8,-11.6,12.3,-10.4);put('hay',11.5,-8.9);addRect(10.8,-10.1,12.3,-9);put('cart',21.4,-8.7);addRect(20.2,-9.3,22.6,-8.7);put('hay',12.2,-1.0);
  fenceLine(8.5,-3.9,13.5,-3.9);fenceLine(8.5,-3.9,8.5,-.2);fenceLine(13.5,-3.9,13.5,-.2);fenceLine(8.5,-.2,10,-.2);fenceLine(12,-.2,13.5,-.2);reserve(8,-4.4,14,.4);
  // ---------- planted trees: an avenue along the lane into town, the church walk, the crossroads, the pond's east bank
  for(const [n,x,z] of [['maple_orange',23.5,16.4],['maple_red',17,21.6],['maple_gold',-21.5,21],['maple_orange',-21.8,27.5],['maple_green',-24,31.5]]){obj(n,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);}
  // ---------- woods & trees: thick pines outside the valley and in the west/south woods, autumn trees in the open
  scatter(560,2.2,()=>{const r=rand();return r<.36?'pine_0':r<.72?'pine_1':r<.86?'pine_o0':'pine_o1';},(x,z)=>{const out=Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1);
    const woods=(x<-14&&z>4)||(z>26&&x<30)||(x>10&&x<26&&z>8&&z<16)||(z<-20&&x<26);return (out>-2||woods)&&clearSpot(x,z,.8);},.35);
  for(const o of OBJ)if(o.kind==='tree'&&o.spr.startsWith('pine'))o.kind='pine';
  scatter(45,3.6,()=>{const r=rand();return r<.34?'maple_orange':r<.6?'maple_red':r<.82?'maple_gold':'maple_green';},(x,z)=>{const woods=(x<-14&&z>4)||(z>26&&x<30)||(x>10&&x<26&&z>8&&z<16)||onPlateau(x,z);return woods&&x>B.x0+1&&x<B.x1-1&&z>B.z0+1&&z<B.z1-1&&clearSpot(x,z,1.4);},.32);
  // bushes hugging fences, yards and the edges of the woods; tall grass in the meadows
  for(const h of OBJ.filter(o=>o.kind==='bld')){const m=SPR[h.spr];if(!m||!m.foot)continue;for(const side of [-1,1]){if(rand()<.25)continue;
      const x=h.x+(side<0?m.foot[0]-.7:m.foot[2]+.7),z=h.z-.4-rand()*1.2;if(terr(x,z)!=='grass')continue;if(bushOK(x,z)){obj(['bush_green','bush_red','bush_gold'][(rand()*3)|0],x,z,{kind:'bush'});addCircle(x,z-.15,.55);}}}
  for(const f of OBJ.filter(o=>o.kind==='fence'))if(rand()<.16){const x=f.x+(rand()-.5)*1.2,z=f.z+.7;if(terr(x,z)!=='grass'||!clearSpot(x,z,-.3)||OBJ.some(o=>o.kind==='bush'&&Math.hypot(o.x-x,o.z-z)<2))continue;
      if(bushOK(x,z)){obj(['bush_green','bush_red','bush_gold'][(rand()*3)|0],x,z,{kind:'bush'});addCircle(x,z-.15,.55);}}
  for(let i=0;i<2500&&OBJ.filter(o=>o.kind==='bush').length<130;i++){const x=lerp(B.x0+2,B.x1-2,rand()),z=lerp(B.z0+2,B.z1-2,rand());
    if(terr(x,z)!=='grass'||!LAYERS.dark(x,z+1)||!clearSpot(x,z,.2)||OBJ.some(o=>(o.kind==='bush'||o.kind==='tree')&&Math.hypot(o.x-x,o.z-z)<1.8))continue;
    if(bushOK(x,z)){obj(['bush_green','bush_red','bush_gold'][(rand()*3)|0],x,z,{kind:'bush'});addCircle(x,z-.15,.55);}}
  {const FENCES=OBJ.filter(o=>o.kind==='fence'),edgeOK=(x,z)=>{
      if(creekDist(x,z)<2.6&&creekDist(x,z)>1.3)return true;                                   // creek banks
      if(ridgeH(x)>.3&&z>ridgeZ(x)+RIDGE.h&&z<ridgeZ(x)+RIDGE.h+1.6)return true;               // foot of the cliff
      if(Math.hypot(x-pond.x,z-pond.z)<pond.r+3.4&&Math.hypot(x-pond.x,z-pond.z)>pond.r+1.8)return true;
      if(terr(x,z)==='grass'&&LAYERS.dark(x,z+1.2))return true;                                 // where the woods begin
      for(const f of FENCES)if(Math.abs(f.x-x)<1.6&&Math.abs(f.z-z)<.9)return true;            // fence lines
      return false;};
    let n=0;for(let i=0;i<9000&&n<1300;i++){const cx=lerp(B.x0+2,B.x1-2,rand()),cz=lerp(B.z0+2,B.z1-2,rand());
    if(terr(cx,cz)!=='grass'||!clearSpot(cx,cz,0)||!edgeOK(cx,cz))continue;const gold=rand()<.35,k=5+(rand()*6|0);
    for(let j=0;j<k;j++){const x=cx+(rand()-.5)*2.2,z=cz+(rand()-.5)*1.2;if(terr(x,z)!=='grass'||!clearSpot(x,z,-.6))continue;obj(gold?'tgold':'tgrass',x,z,{kind:'anim',grass:1,fps:1.4,ph:hash(x*9|0,z*9|0)*2});n++;}}}
  for(const t_ of OBJ.filter(o=>o.spr&&o.spr.startsWith('maple')&&o.spr!=='maple_green'))for(let k=0;k<5;k++){const a=rand()*6.28,r=.6+rand()*1.9;const x=t_.x+Math.cos(a)*r*1.3,z=t_.z+Math.sin(a)*r*.6+.3;if(terr(x,z)!=='grass')continue;obj('leaves',x,z,{kind:'deco',v:(rand()*4)|0});}
  // the cornfield in neat rows
  for(let x=CORN.x0+.5;x<CORN.x1;x+=.9)for(let z=CORN.z0+.5;z<CORN.z1;z+=.8){if(Math.abs(x+.5)<1&&z<20)continue;if(rand()<.05)continue;obj('corn_'+((rand()*3)|0),x+(rand()-.5)*.12,z,{kind:'corn'});}
  addSeg(pond.x-.95,pond.z-pond.r-.6,pond.x-.95,pond.z-pond.r+4.2,.1);addSeg(pond.x+.95,pond.z-pond.r-.6,pond.x+.95,pond.z-pond.r+4.2,.1);addSeg(pond.x-.95,pond.z-pond.r+4.2,pond.x+.95,pond.z-pond.r+4.2,.1);
  addRect(B.x0-12,B.z0-14,B.x1+12,B.z0-.5);addRect(B.x0-12,B.z1+.5,B.x1+12,B.z1+14);addRect(B.x1+2.5,B.z0-14,B.x1+14,B.z1+14);
  // Route 9 west of the valley: only ever seen from the car on the night you arrive
  for(let x=-196;x<-75;x+=1.7+rand()*1.6)for(const side of [-1,1]){if(rand()<.18)continue;const z=side<0?-11.2-rand()*5.5:-.6+rand()*5.5;const r=rand();
    const sp=r<.07?'deadtree':r<.32?['maple_orange','maple_red','maple_gold'][(rand()*3)|0]:['pine_0','pine_1','pine_o0','pine_o1'][(rand()*4)|0];obj(sp,x+(rand()-.5),z,{kind:sp.startsWith('pine')?'pine':'tree'});}
  put('mailbox',-121,-9.7);put('signpost',-88,-10.2);
  // farms along the old road: split-rail fences with gaps, a farmstand, barrels, hay, a broken cart left in the ditch
  for(const [x0,x1,z] of [[-190,-176,-10.9],[-166,-150,-10.9],[-140,-128,-1.3],[-118,-104,-10.9],[-98,-86,-1.3]]){fenceLine(x0,z,x1,z);for(let x=x0;x<x1;x+=1.7)for(const o of OBJ)if((o.kind==='tree'||o.kind==='pine')&&Math.abs(o.x-x)<1&&Math.abs(o.z-z)<.9)o.hide=true;}
  for(const o of OBJ)if((o.kind==='tree'||o.kind==='pine')&&o.x>-127&&o.x<-113&&o.z<-9&&o.z>-16)o.hide=true;
  put('crate',-124.6,-10.2,.3);put('crate',-123.8,-10.5,.3);put('sacks',-122.9,-10.1);put('jack',-124.2,-9.7,0,{glow:1});put('pumpkin',-123.3,-9.6);put('pumpkin_b',-125.1,-9.8);
  put('board',-121.9,-10.9,0);put('hay',-119.6,-11.2);put('barrel',-118.4,-10.4,.3);put('barrel',-117.8,-10.1,.3);lamp(-120.6,-9.9);
  put('cart',-145.5,.4);put('barrel',-147.2,.1,.3);put('hay',-160.2,-11.6);put('hay',-158.8,-11.4);put('barrel',-100.5,-.1,.3);put('crate',-99.6,-.3,.3);
  for(const [x,z] of [[-180,-.4],[-136,-11.4],[-110,-.6],[-92,-11.1]])put('signpost',x,z);
  addRect(B.x0-20,B.z0-14,B.x0-6.5,-9);addRect(B.x0-20,-3,B.x0-6.5,B.z1+14);
}
// ---------- Marrow Hollow, street by street
const TREE_T=(n,x,z)=>{const e=obj(n,x,z,{kind:'tree',solid:1,town:1});addCircle(x,z,.4);return e;};
function buildTown(){
  // the rows: every building faces the street south of it
  for(const [k,[spr,x,z,o]] of Object.entries(TB)){const e=building(spr,x,z,o);e.tb=k;}
  // ---- Main Street: shopfronts facing the green
  put('sacks',32.55,-8.6);put('barrel',23.4,-9.3,.3);put('barrel',23.9,-8.8,.3);put('hay',22.4,-11.6);addRect(21.6,-12.8,23.2,-11.7);
  put('phone_booth',boothPos.x,boothPos.z+.5,0,{night:'phone_booth_n',kind:'booth'});addRect(boothPos.x-.55,boothPos.z-.4,boothPos.x+.55,boothPos.z+.5);
  put('signpost',tsPos.x,tsPos.z,.2,{label:'MARROW HOLLOW'});
  for(const x of [26,41.4,48.2,51.8,62.3,71.6])lamp(x,-8.25);
  for(const x of [23.5,35.2,45.4,54.6,65.4])lamp(x,-3.75);
  put('hydrant',33.3,-8.05,.18);put('hydrant',62.9,-3.7,.18);put('trashcan',47.7,-8.05,.22);put('trashcan',36.2,-8.05,.22);put('trashcan',57.4,-3.75,.22);
  put('planter',54.2,-8.15,0,{kind:'prop'});put('planter',59,-8.15,0,{kind:'prop'});put('planter',27.1,-8.15,0,{kind:'prop'});
  put('st_church',48.7,-7.95,.12);put('st_main',37.9,-3.6,.12);put('st_green',34.5,-3.6,.12);put('st_east',75.5,-3.9,.12);
  // ---- the green: cobbled paths crossing at the bandstand, the memorial, the notice board, benches and old maples
  put('bandstand',squarePos.x,squarePos.z+1.4,0,{kind:'prop'});addRect(squarePos.x-2.1,squarePos.z+.35,squarePos.x+2.1,squarePos.z+1.4);
  put('memorial',42.4,.3,0,{kind:'prop'});addRect(41.7,-.2,43.1,.3);
  put('board',boardPos.x,boardPos.z,0);addSeg(boardPos.x-.8,boardPos.z,boardPos.x+.8,boardPos.z,.12);
  for(const [x,z] of [[41.2,4.8],[58.8,4.8],[57.6,.6]])put('parkbench',x,z,0,{kind:'prop'});
  put('birdbath',58.4,-1.9,.25);put('planter',48.4,-3.85,0,{kind:'prop'});put('planter',51.6,-3.85,0,{kind:'prop'});put('planter',45.4,9.3,0,{kind:'prop'});put('planter',54.6,9.3,0,{kind:'prop'});
  for(const [x,z] of [[46.7,-.7],[53.3,-.7],[46.7,5.9],[53.3,5.9]])lamp(x,z);
  for(const [n,x,z] of [['maple_red',39.2,-3],['oak_russet',61,-3],['maple_gold',39.2,8.6],['maple_orange',61,8.6]])TREE_T(n,x,z);
  reserve(GREEN.x0,GREEN.z0,GREEN.x1,GREEN.z1);
  // ---- Hill Street: the parsonage, the church at the head of Church Street, the sexton's house; the churchyard behind
  const G=GYARD;
  fenceLine(G.x0,G.z0,G.x1,G.z0,0,'rgiron');fenceLine(G.x0,G.z0,G.x0,G.z1,0,'rgiron');fenceLine(G.x1,G.z0,G.x1,G.z1,0,'rgiron');
  fenceLine(G.x0,G.z1,G.gate-1.1,G.z1,0,'rgiron');fenceLine(G.gate+1.1,G.z1,G.x1,G.z1,0,'rgiron');reserve(G.x0-1,G.z0-1,G.x1+1,G.z1+.5);
  for(let r=0;r<4;r++)for(let c=0;c<13;c++){const x=42.8+c*2.3+(r&1)*.6,z=G.z1-2.2-r*2;if(Math.abs(x-G.gate)<1.4)continue;if(Math.hypot(x-YOURGRAVE.x,z-YOURGRAVE.z)<1.3)continue;
    if(Math.hypot(x-ALTAR_POS[2][0],z-ALTAR_POS[2][1])<2)continue;put('grave_'+((r*5+c*3)%4),x,z,.35);}
  put('deadtree',43.2,-40.4,.35);put('shed_b',70.6,-33.6,0,{kind:'prop'});
  for(const x of [35,43,47.6,52.6,61,67.6])lamp(x,-23);put('st_hill',53.2,-23.2,.12);
  // the terrace wall: cut stone with a lit coping, steps at Church Street, a boulder where it meets the farm ridge
  {const T=TERRACE;const run=(a,b)=>{for(let x=a;x<b-.05;x+=2){const x0=Math.min(x,b-2);obj('twall',x0,T.base,{kind:'wall'});}addSeg(a,T.base-.5,b,T.base-.5,.5);};
    run(T.x0,T.steps[0]);run(T.steps[1],T.x1);obj('tsteps',(T.steps[0]+T.steps[1])/2,T.base,{kind:'wall'});
    addSeg(T.steps[0]-.05,T.z,T.steps[0]-.05,T.base,.12);addSeg(T.steps[1]+.05,T.z,T.steps[1]+.05,T.base,.12);put('rock_1',T.x0-.2,T.base+.2,.4).town=1;}
  // ---- Market Street: the trades on the west corner, the carpenter on the east, the green between
  for(const x of [24,31,38.6,45,55,61.4,69])lamp(x,12.6);lamp(39.6,9.3);lamp(60.4,9.3);
  put('st_market',34.7,9.5,.12);put('st_mill',21.6,12.7,.12);put('hydrant',37.9,12.7,.18);
  // ---- Elm Street: houses, and the schoolhouse with its yard
  for(const x of [24,32,40,48,56,64,72])lamp(x,30.6);put('st_elm',34.7,27.7,.12);
  hedgeLine(37.6,21.2,26.4);put('rg_swing',41.6,23.6,0,{kind:'prop'});put('parkbench',43.6,26.8,0,{kind:'prop'});
  // ---- Orchard Lane and East Avenue
  put('st_orchard',72.9,44.8,.12);put('signpost',66.4,45,.2,{label:'FOR SALE'});for(const z of [2,18,36])lamp(72.6,z);
  // ---- street trees: an avenue of maples down Market Street, oaks on Hill and Elm
  for(const [i,x] of [27.5,34.4,41.6,48.4,51.6,58.4,65.6,72.4].entries())TREE_T(['maple_red','maple_orange','maple_gold'][i%3],x,13);
  for(const [i,x] of [39,45.2,55,58.4,64.4,70.4].entries())TREE_T(i%2?'oak_russet':'maple_gold',x,-23.4);
  for(const [i,x] of [28,36,44,52,60,68].entries())TREE_T(['oak_green','maple_orange','birch_gold'][i%3],x,31);
  // ---- back gardens: picket fences between the plots, a gate onto the street behind, and what people keep there
  const done=new Set(),side=(x,zf,zb,gap)=>{const k=x+':'+zf;if(done.has(k))return;done.add(k);if(gap==null)hedgeLine(x,zf,zb);else{hedgeLine(x,zf,gap+(zb<zf?1.3:-1.3));hedgeLine(x,gap-(zb<zf?1.3:-1.3),zb);}};
  const plot=(x0,x1,zf,zb,gate,gap)=>{side(x0,zf,zb,gap);side(x1,zf,zb,gap);
    if(gate){const gx=(x0+x1)/2;fenceLine(x0,zb,gx-.8,zb,0,'picket');fenceLine(gx+.8,zb,x1,zb,0,'picket');}};
  side(23.6,-12.9,-18.8);side(34.6,-12.9,-21.1,-16.6);for(const [x0,x1] of [[34.6,41.4],[41.4,48.6],[51.4,62.3],[62.3,72.6]])plot(x0,x1,-12.9,-21.1,0,-16.6);fenceLine(29.6,-21.1,34.6,-21.1,0,'picket');fenceLine(34.6,-21.1,48.6,-21.1,0,'picket');fenceLine(51.4,-21.1,72.6,-21.1,0,'picket');
  for(const [x0,x1] of [[21.6,28],[28,34.8],[54.6,62.6],[65.2,72.6]])plot(x0,x1,23,13.9,1);
  side(37.6,21.2,13.9);side(54.6,23,13.9);fenceLine(37.6,13.9,44.6,13.9,0,'picket');fenceLine(47.4,13.9,54.6,13.9,0,'picket');   // the school field
  for(const [x0,x1] of [[21.6,34],[34,46],[64.6,72.6]])plot(x0,x1,40.6,31.6,1);
  const Y=(spr,x,z,o)=>put(spr,x,z,0,Object.assign({kind:'prop',town:1},o||{}));
  // Coyle's: stock waiting by the back door
  Y('crate',25.4,-15.8);Y('crate',26.3,-16.3);Y('barrel',31.8,-15.9);Y('barrel',32.5,-16.5);put('hay',28.4,-17.8);addRect(27.6,-19,29.2,-17.9);put('cart',31.4,-19.6);addRect(30.2,-20.2,32.6,-19);
  // the post office: June's vegetables and her washing
  Y('gardenbed',36.8,-16.4,{kind:'flat'});Y('clothesline',38.2,-19.8);Y('birdbath',40.4,-17);
  // Danny's: nobody has touched the garden since; his swing still hangs from the apple tree
  TREE_T('apple_tree',43.6,-19.2);Y('rg_swing',45.4,-17.2);for(let k=0;k<7;k++)obj('weeds_'+(k&1),42+((k*37)%6),-14.2-((k*53)%7),{kind:'deco',town:1});
  // the town hall's lawn
  TREE_T('maple_red',54.4,-19.2);TREE_T('maple_gold',59.6,-18.4);Y('parkbench',57,-15.8);
  // the Dunns: a shed, the sheriff's washing, tomatoes gone over
  Y('shed',64.8,-16.4);Y('clothesline_b',68.6,-19.8);Y('gardenbed_b',70.4,-16.2,{kind:'flat'});
  // Elm Street gardens
  Y('gardenbed',25.8,15.4,{kind:'flat'});Y('birdbath',26.6,19.8);
  Y('wk_boat',31.4,16.6);Y('wk_nets',30.2,20.6);Y('barrel',33.6,15.2);
  Y('rg_swing',46.6,18.4);Y('parkbench',51.4,16.2);
  TREE_T('apple_tree',57.2,15.6);Y('gardenbed_b',60.6,18.2,{kind:'flat'});Y('shed_b',56.6,21.2);
  Y('clothesline_b',68.6,16.6);Y('gardenbed',70.6,20.2,{kind:'flat'});
  // Orchard Lane gardens
  Y('shed',30.6,33.6);Y('gardenbed_b',25.6,34.6,{kind:'flat'});for(let k=0;k<3;k++)Y('hedge',22.2+k*2.1,38.4);
  TREE_T('apple_tree',39.2,34.2);TREE_T('apple_gold',43.4,33);
  for(let k=0;k<6;k++)obj('weeds_'+(k&1),66+((k*29)%6),33.6+((k*41)%5),{kind:'deco',town:1});TREE_T('deadoak',70.6,35.4);
  reserve(20.6,-24,76,-12.6);reserve(20.6,40.6,76,45.4);reserve(20.6,12.2,76,23.4);reserve(20.6,30.2,76,40.8);
}
// a hedge along a north-south line (the sideways view of a picket fence reads as a string of beads; a hedge reads as a hedge)
function hedgeLine(x,z1,z2){const za=Math.min(z1,z2),zb=Math.max(z1,z2);let k=0;for(let z=za+1;z<=zb+.01;z+=1)obj(k++%3===1?'hedge_v_b':'hedge_v',x,z,{kind:'prop',noCol:true,town:1});addSeg(x,za,x,zb,.32);}
const lamps=[];
function lamp(x,z){const e=obj('lamp',x,z,{kind:'lamp',night:'lamp_n'});lamps.push({e,x,z,dead:rand()<.25,ph:rand()*10});addCircle(x,z,.15);}
const fenceDefs=[];
function fenceLine(x1,z1,x2,z2,skip,type){const fh=(type||'fence')+'_h',fv=(type||'fence')+'_v';const vert=Math.abs(x2-x1)<Math.abs(z2-z1);const len=Math.hypot(x2-x1,z2-z1);
  addSeg(x1,z1,x2,z2,.14);fenceDefs.push([x1,z1,x2,z2]);
  if(vert){const zs=Math.min(z1,z2),ze=Math.max(z1,z2);for(let z=zs+1;z<=ze+.01;z+=1)obj(fv,x1,z,{kind:'fence'});}
  else{const xs=Math.min(x1,x2),xe=Math.max(x1,x2);for(let x=xs;x<xe-.01;x+=2){obj(fh,x,z1+.1,{kind:'fence',clipw:Math.min(2,xe-x)});}}}
// every solid thing gets a collider: anything standing that nothing blocks yet gets one sized from its footprint
function autoCollide(){const SOLID=new Set(['tree','pine','bld','lamp','prop','bush','fence','wreck','furn','bin']);let added=0;
  const blockedAt=(x,z)=>{const A=cgNear(x,z,.2);return A.c.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+.05)||A.r.some(r=>x>r.x0-.05&&x<r.x1+.05&&z>r.z0-.05&&z<r.z1+.05)||
    A.s.some(s=>{const dx=s.x2-s.x1,dz=s.z2-s.z1,L=dx*dx+dz*dz||1;const t=clamp(((x-s.x1)*dx+(z-s.z1)*dz)/L,0,1);return Math.hypot(s.x1+dx*t-x,s.z1+dz*t-z)<(s.r||.15)+.05;});};
  for(const o of OBJ){if(o.hide||!SOLID.has(o.kind)||o.noCol||(o.debris&&o.debris!=='rock'&&o.debris!=='stump'))continue;if(o.kind==='fence'&&o.spr.endsWith('_h')){continue;}
    const cx=o.x,cz=o.z-.1;if(blockedAt(cx,cz))continue;const f=footBox(o);if(!f)continue;const w=f[2]-f[0],d=f[3]-f[1];
    if(w>1.6||d>1.2)addRect(f[0]+.08,Math.max(f[1],o.z-1.2)+.05,f[2]-.08,o.z-.05);else addCircle(cx,cz,clamp(Math.min(w,d+.3)*.45,.18,.6));added++;}
  return added;}
