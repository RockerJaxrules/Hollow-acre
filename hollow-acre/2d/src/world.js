/* ================= world: layout, ground, objects, collision ================= */
const PPM=32;
const B={x0:-74,x1:72,z0:-42,z1:40};
const FIELD={x0:-5,z0:0,w:10,h:8};
const FSTART={i0:3,j0:0,w:4,h:3};   // the patch Grandpa still kept clear; the rest of the field has gone wild
const CORN={x0:-15,x1:11,z0:11.5,z1:24};
const inCorn=(x,z)=>x>CORN.x0&&x<CORN.x1&&z>CORN.z0&&z<CORN.z1;
const pond={x:-30,z:24.5,r:7.5};
const wellPos={x:7.3,z:-10.5},binPos={x:-3.6,z:-8.6},doorPos={x:0,z:-8.9},carPos={x:-60.2,z:-1.4},pumpPos={x:-30.5,z:-10.3},boothPos={x:41.65,z:-9.4};
const crossPos={x:20,z:19},boardPos={x:44,z:-3.0},tsPos={x:22.4,z:-8.0},farmSignPos={x:-13.4,z:-10.1},squarePos={x:48.5,z:3.4};
// ---------- Marrow Hollow (#153), settled over a hundred years rather than laid out: shops and the civic buildings along Route 9
// at their own setbacks; a dark alley between the store and the post office opening into the sunny market courtyard; a broken
// line of retaining walls with wooden stairs up to Church Hill, where a walled garden hides behind the parsonage; the green in
// the middle with paths worn across it and the water tower looming over everything; the trades on a crooked row to the west, the
// carpenter's lane to the east, and houses strung along winding lanes to the south, each property fenced its own way.
const TOWN={main:-6,hill:-25.6,market:12,elm:27,orchard:46,gw:36,ge:64,church:50,east:74,mill:20};
const GREEN={x0:36,x1:61,z0:-3.6,z1:11.6,cx:48.5,cz:4,rx:12.4,rz:7.6};
const inGreen=(x,z)=>((x-GREEN.cx)/GREEN.rx)**2+((z-GREEN.cz)/GREEN.rz)**2<1+(fbm(x*.35+4,z*.35)-.5)*.35;
const TB={ // [sprite, x, front z, options]
  store:['store',28,-9.6,{jack:1}],post:['postoffice',38,-9.2,{porch:false}],danny:['house_a',45.2,-10.2,{lit:false,porch:false}],hall:['townhall',57.4,-10.8,{porch:false,lit:false}],
  tavern:['tavern',68,-11.4,{porch:false}],
  hale:['house_b',38.5,-28.4,{}],church:['church',50,-28.2,{}],crane:['house_d',61.5,-27.4,{}],pell:['house_c',69.6,-27.6,{lit:false,porch:false}],
  vance:['h_vance',25.5,22.2,{}],lindqvist:['h_lindqvist',33,21.2,{jack:1}],school:['schoolhouse',46.4,25.6,{jack:1}],dunn:['h_dunn',58.5,24.8,{jack:1}],oakes:['house_b2',67.4,23.1,{}],
  gale:['house_d2',30.5,36.2,{jack:1}],marr:['house_c2',23.8,43.8,{lit:false}],wren:['house_a2',68.6,34.4,{lit:false,porch:false}]};
const tbDoor=k=>[TB[k][1],TB[k][2]+.35],tbOut=k=>({x:TB[k][1],z:TB[k][2]+.7});
const GYARD={x0:54,x1:72,z0:-41.6,z1:-33,gate:56.6},YOURGRAVE={x:66.6,z:-37.2},CHURCH_DOOR={x:50,z:-27.85};
// the terrace under Church Hill is three walls at three depths, not one ruled line; wooden stairs where Church Lane climbs it
const TERRACE={walls:[[29.6,44,-21.3],[44,58,-23.6],[58,72.4,-21.8]],steps:[48.8,51.2],stepsBase:-23.6};
const HIDDEN_GARDEN={x0:36.5,x1:44.9,z0:-41,z1:-33,gap:[37.5,39.1]};
const COPSES=[{x:68,z:16.8,rx:6.2,rz:2.8},{x:28,z:-33,rx:5.4,rz:6.6}];
const ALLEY={x0:33.1,x1:34.9,z0:-13.4,z1:-9.4};
const inTown=(x,z,m)=>{m=m||0;return x>20.6-m&&x<76+m&&z>-42.2-m&&z<45+m;};
const fishSpot={x:pond.x,z:pond.z-pond.r+3.6};
const ALTAR_POS=[[-27,8,'west woods'],[-2,29,'cornfield'],[70.2,-39.6,'churchyard']];
const SCARE_SPOTS=[[6.9,4],[9.8,-1.2],[2.2,-7.6]];
function lanePts(P,w){const out=[];for(let i=0;i<P.length-1;i++)out.push([P[i][0],P[i][1],P[i+1][0],P[i+1][1],w]);return out;}
const ROADS=[[-17,-6,-10,-6,8.2],[-10,-6,-6.5,-6,5.4],[-12.5,-6,70,-6,3],[16,-9.4,16,-6,2.8],[0,-8.6,0,-1,2],[20,-6,20,19,2],[20,19,4,19,1.6],[-46,-6,-46,-9,1.8],[-36,-6,-36,-10.6,2],[2,-9,6,-9,1.4],
  // the town's lanes: Church Lane winds up the hill; the lanes south wander between the houses
  ...lanePts([[50,-7.5],[49.6,-14],[51,-19],[50,-23.6],[50,-27.6]],2),...lanePts([[34,-26.6],[44,-25.8],[50,-25.6],[56,-26.1],[66,-25.4],[72.6,-24.8],[74,-24.2]],1.8),
  ...lanePts([[56.6,-26.1],[56.6,-33.4]],1.2),...lanePts([[34,-26.6],[34.4,-32.2],[41,-32.5]],1.1),
  ...lanePts([[21,11],[28,12],[36,12.4]],2),...lanePts([[36,12.4],[37.6,19.8],[39,27.4],[52,28.2],[64,26],[72,24.4],[74,24]],2),
  ...lanePts([[20,24.4],[29,24.2],[37.6,23.4]],1.6),...lanePts([[20,38.8],[28,38.6],[35,38.2],[39.2,28.6]],1.6),...lanePts([[74,36.4],[65,36.6]],1.4),
  ...lanePts([[74,10.6],[66,11.6],[61.6,15.0],[55,14.6]],1.8),[TOWN.east,TOWN.main,TOWN.east,TOWN.orchard,2]];
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
// the ground's ragged road edge: full on the roads, a third of it on the narrow lanes, so a lane stays the width it was laid out at
const onRoadRag=(x,z,j)=>{for(const r of ROADS)if(segDist(x,z,r[0],r[1],r[2],r[3])<r[4]/2+j*(r[4]<3?.35:1))return true;return false;};
// cobbles on Route 9 through town and round the bandstand; desire paths worn across the green and through the gaps people use
const DESIRE=[[[37,-3.6],[48.5,3.4],[60,11]],[[60,-3.6],[48.5,3.4],[37.6,11.2]],[[48.5,-3.8],[48.5,11.8]],[[33.9,-8],[33.9,-14],[31,-16.6]],
  [[62,22.4],[64.6,19.6],[69,16.4]],[[44.6,13.6],[46,15.4]],[[36,12.4],[44,14.4],[55,14.6]],[[60.6,30],[62.2,34],[61,37.6]],[[41.6,-17],[44.6,-17.6],[48.8,-16.4]]];
const onDesire=(x,z,w)=>{for(const P of DESIRE)for(let i=0;i<P.length-1;i++)if(segDist(x,z,P[i][0],P[i][1],P[i+1][0],P[i+1][1])<(w||.55))return true;return false;};
const greenPath=(x,z)=>Math.hypot(x-squarePos.x,(z-squarePos.z-.4)*1.25)<4.2&&Math.hypot(x-squarePos.x,(z-squarePos.z-.4)*1.25)>2.6||Math.hypot(x-squarePos.x,(z-squarePos.z-.4)*1.25)<2.7;
const townStone=(x,z)=>(Math.abs(z+6)<2.3&&x>21.4&&x<76)||greenPath(x,z)||(x>23.5&&x<41.4&&z>-20.6&&z<-13.6&&fbm(x*.5,z*.5)>.36)||(x>HIDDEN_GARDEN.x0+1&&x<HIDDEN_GARDEN.x1-1&&Math.abs(z-(-37))<.7);
const schoolField=(x,z)=>x>40.4+(fbm(x*.5,z*.5)-.5)*1.4&&x<53.8&&z>15.6+(fbm(x*.6+3,z*.6)-.5)*1.2&&z<21.4;
const wornGround=(x,z)=>onDesire(x,z,.6)&&fbm(x*1.4+3,z*1.4)>.34||schoolField(x,z);
// the town streets are blacktop now, with poured sidewalks and curbs either side and a faded line down the middle
const STREETS=[{x0:21.4,x1:76,z:-6,hw:1.55,sw:.9}];
const inStreet=(x,z,w)=>{for(const s of STREETS)if(x>s.x0&&x<s.x1&&Math.abs(z-s.z)<s.hw+(w?s.sw:0))return true;return false;};
function tarLine(x,z){for(const s of STREETS)if(x>s.x0+1&&x<s.x1-1&&Math.abs(z-s.z)<.06&&((x*32)%96)<52)return true;return false;}
const LAYERS={
  tar:(x,z)=>inStreet(x,z,false),
  walk:(x,z)=>inStreet(x,z,true),
  dirt:(x,z)=>{const j=(fbm(x*.7,z*.7)-.5)*.8;return onRoadRag(x,z,j)||(Math.hypot(x-pond.x,z-pond.z)<pond.r+1.6+j&&Math.hypot(x-pond.x,z-pond.z)>pond.r-.4)
    ||(x>CORN.x0-.6&&x<CORN.x1+.6&&z>CORN.z0-.6&&z<CORN.z1+.6)||(x>FIELD.x0+FSTART.i0-.35+j*.3&&x<FIELD.x0+FSTART.i0+FSTART.w+.35-j*.3&&z>FIELD.z0+FSTART.j0-.35+j*.3&&z<FIELD.z0+FSTART.j0+FSTART.h+.35-j*.3)
    ||(Math.hypot(x+60.6,z-1.2)<3.0+j)||wornGround(x,z)||(x>-7+j&&x<7-j&&z>-9.6&&z<-7.2+j*.5);},
  stone:(x,z)=>(Math.abs(z+6)<2.6&&x<-16)||townStone(x,z),
  water:(x,z)=>(Math.hypot(x-pond.x,z-pond.z)<pond.r+(fbm(x*.8,z*.8)-.5)*.9&&!(x>pond.x-1.1&&x<pond.x+1.1&&z<pond.z-pond.r+4.2))||inCreek(x,z),
  dark:(x,z)=>Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1)>-1.5-2.5*fbm(x*.3+11,z*.3+7)||((x<-16&&z>6)||(z>28))&&fbm(x*.22+70,z*.22)>.5,
};
function terr(x,z){if(LAYERS.water(x,z))return 'water';if(LAYERS.stone(x,z))return 'stone';if(LAYERS.dirt(x,z))return 'dirt';return 'grass';}
// ---------- collision
const circles=[],rects=[],segs=[];
function addCircle(x,z,r){circles.push({x,z,r});}
const PORCH_DECKS=[];   // raised decks you walk up onto (the inn's porch): a floor at sill height, steps down at the front
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
  hedgeLine(-12.6,-17,-11);hedgeLine(-12.6,-1,4);
  put('signpost',-13.4,-10.1,.2,{label:'HOLLOW ACRE'});put('mailbox',-13.6,-1.9,.15);
  // the field, fenced with a gate at the top; scarecrow inside, pumpkins at the corners
  fenceLine(-6,-1,-1,-1);fenceLine(1,-1,6,-1);fenceLine(-6,-1,-6,9);fenceLine(6,-1,6,9);fenceLine(-6,9,-1.4,9);fenceLine(.4,9,6,9);
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
  building('h_widow',-46,-9.6,{jack:1});
  // crossroads shrine
  put('signpost',crossPos.x-1.6,crossPos.z-1.2,.2,{label:'FARM',face:'L'});
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
  building('barn',16,-9.6,{porch:false});put('silo',18.4,-17.0,.8);hedgeLine(21.2,-17.5,-8.8);
  for(const [n,x,z] of [['maple_orange',20.2,-16.2],['oak_russet',22.4,-13.6],['maple_red',20.4,-10.4]]){obj(n,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);}reserve(11.5,-15,22,-8.6);
  put('hay',11.5,-10.4);addRect(10.8,-11.6,12.3,-10.4);put('hay',11.5,-8.9);addRect(10.8,-10.1,12.3,-9);put('cart',13.6,-8.2);addRect(12.4,-8.8,14.8,-8.2);put('hay',12.2,-1.0);
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
  for(let x=CORN.x0+.5;x<CORN.x1;x+=.9)for(let z=CORN.z0+.5;z<CORN.z1;z+=.8){if(Math.abs(x+.5)<1&&z<20)continue;if(Math.abs(z-19)<1.1&&x>-1.5)continue;if(rand()<.05)continue;obj('corn_'+(1+((rand()*2)|0)),x+(rand()-.5)*.12,z,{kind:'corn'});}
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
  const Y=(spr,x,z,o)=>put(spr,x,z,0,Object.assign({kind:'prop',town:1},o||{}));
  const D=(spr,x,z)=>obj(spr,x,z,{kind:'flat',town:1});   // decals on the ground
  const L=(x,z,crooked)=>{lamp(x,z);if(crooked&&SPR.wk_lamp){const l=lamps[lamps.length-1];l.e.spr='wk_lamp';l.e.night='wk_lamp_n';}};
  const W=(spr,x0,x1,z)=>{for(let x=x0;x<x1-.05;x+=2)obj(spr,Math.min(x,x1-2),z,{kind:'prop',noCol:true,town:1});addSeg(x0,z-.15,x1,z-.15,.3);};   // a run of wall pieces
  const done=new Set(),side=(x,zf,zb,gap)=>{const k=x+':'+zf;if(done.has(k))return;done.add(k);if(gap==null)hedgeLine(x,zf,zb);else{hedgeLine(x,zf,gap+(zb<zf?1.3:-1.3));hedgeLine(x,gap-(zb<zf?1.3:-1.3),zb);}};
  for(const [k,[spr,x,z,o]] of Object.entries(TB)){const e=building(spr,x,z,o);e.tb=k;}

  // ===== Route 9: the shops and the town's business, each at its own setback
  put('sacks',32.4,-8.7);put('barrel',22.6,-9.4,.3);put('barrel',23.1,-8.9,.3);
  put('phone_booth',boothPos.x,boothPos.z+.5,0,{night:'phone_booth_n',kind:'booth'});addRect(boothPos.x-.55,boothPos.z-.4,boothPos.x+.55,boothPos.z+.5);
  put('signpost',tsPos.x,tsPos.z,.2,{label:'MARROW HOLLOW'});
  for(const x of [26,36.4,48.6,51.6,62.8])L(x,-8.15);for(const x of [24,35.6,47.4,52.6,65.4])L(x,-3.75);
  put('hydrant',33,-8.1,.18);put('trashcan',47.6,-8.1,.22);put('trashcan',41.2,-3.75,.22);put('planter',54.4,-8.6,0,{kind:'prop'});put('planter',60.4,-8.6,0,{kind:'prop'});put('planter',27,-8.3,0,{kind:'prop'});
  put('st_church',48.4,-7.95,.12);put('st_main',37.4,-3.7,.12);put('st_east',75.5,-3.9,.12);
  // the tavern's raised patio, tables out on it; its yard behind: woodpile, axe in the block, empties, mud where the barrels roll
  D('inn_deck',68,-8.5);D('inn_steps',68,-7.906);Y('inn_stoop',68,-11.38,{kind:'prop',town:1,noCol:true});obj('inn_rail',68,-8.5,{kind:'prop',town:1,noCol:true});   // the porch built onto the inn's front at sill height (owner: "the porch to the inn looks bad"): the deck, its front railing, its steps
  {const tv=OBJ.find(o=>o.spr==='tavern'&&o.kind==='bld');if(tv)tv.noSteps=1;PORCH_DECKS.push({x0:64.75,x1:71.22,z0:-11.45,z1:-8.5,h:7,sx:68,shw:.53,sz0:-8.5,sz1:-7.9,st:{x:68,w:.6,z1:-10.84,zm:-11.0,h1:12,h2:17}});
   addRect(64.6,-11.4,64.95,-8.45);addRect(71.02,-11.4,71.37,-8.45);addRect(64.6,-8.62,67.45,-8.4);addRect(68.52,-8.62,71.37,-8.4);}   // the railings have weight: the sides and the front, the opening for the steps left clear
  for(const x of [65.6,70.4]){Y('in_table',x,-9.4,{kind:'prop',lift:7});addRect(x-.8,-9.8,x+.8,-9.42);}Y('barrel',63.6,-9.3);
  Y('firewood',64.6,-19.6);Y('choppingblock',66.4,-20.0);Y('barrel',70.6,-19.4);Y('barrel',71.2,-20.0);Y('crate',69.6,-20.6);D('mud_a',68.6,-18.6);
  // Danny's: a house among the shops, its little front garden gone to seed behind a broken wall
  W('stonewall',42.2,44.2,-8.3);W('stonewall_b',46.2,48.2,-8.3);for(let k=0;k<6;k++)obj('weeds_'+(k&1),42.6+k,-8.9-(k%2)*.4,{kind:'deco',town:1});
  // the town hall: a lawn, a flagpole, ivy up the chimney
  Y('vines',53.2,-10.78,{noCol:true});
  // ===== the alley between the store and the post office: dark, narrow, and then the courtyard opens up in the sun
  put('trashcan',34.4,-12.4,.22);put('crate',33.5,-13,.3);
  Y('well',31,-16.4,{kind:'prop'});addCircle(31,-16.9,1.05);Y('bucket',32.6,-16.2);Y('wk_stall',37,-15.4);Y('applespill',37.8,-17.4);Y('crate',39.4,-16.4);Y('crate',40,-16.9);
  Y('parkbench',27.6,-19.8);Y('sacks',25,-16.6);Y('crate',25.6,-15.4);Y('barrel',24.2,-16.6);Y('cart',29.8,-20.2);L(35.6,-19.4,true);L(26.2,-16.4,true);
  for(const [n,x,z] of [['maple_gold',39.6,-20]])TREE_T(n,x,z);
  side(41.6,-12.9,-21.1,-17);side(23.2,-12.9,-18.8);
  // Danny's garden and the hall lawn, walled and hedged their own ways; the tavern yard fenced with whatever was to hand
  side(48.6,-13.4,-23,-16.8);for(let k=0;k<8;k++)obj('weeds_'+(k&1),42.6+((k*37)%6),-14.6-((k*53)%7),{kind:'deco',town:1});TREE_T('apple_tree',44,-19.6);Y('rg_swing',46.2,-18);
  L(48.9,-12);L(51.1,-18);side(51.6,-15,-23,-17.6);TREE_T('maple_red',54.4,-19.6);TREE_T('oak_russet',60,-18.8);Y('parkbench',55.6,-20.4);
  hedgeLine(62.8,-21,-18.2);
  // ===== the terrace: three walls at three depths, wooden stairs where the lane climbs, ivy and long grass at the joins
  for(const [x0,x1,base] of TERRACE.walls){const st=x0<TERRACE.steps[0]&&x1>TERRACE.steps[1];
    const run=(a,b)=>{for(let x=a;x<b-.05;x+=2)obj('twall',Math.min(x,b-2),base,{kind:'wall',town:1});addSeg(a,base-.5,b,base-.5,.5);};
    if(st){run(x0,TERRACE.steps[0]);run(TERRACE.steps[1],x1);}else run(x0,x1);}
  obj('tsteps_wood',(TERRACE.steps[0]+TERRACE.steps[1])/2,TERRACE.stepsBase,{kind:'wall',town:1});
  addSeg(TERRACE.steps[0]-.05,TERRACE.stepsBase-1.1,TERRACE.steps[0]-.05,TERRACE.stepsBase,.12);addSeg(TERRACE.steps[1]+.05,TERRACE.stepsBase-1.1,TERRACE.steps[1]+.05,TERRACE.stepsBase,.12);
  addSeg(44,-22.4,44,-24.7,.4);addSeg(58,-22.9,58,-24.7,.4);Y('vines',44.2,-21.28,{noCol:true});Y('vines',58.2,-21.78,{noCol:true});
  put('rock_1',29.4,-21.1,.4).town=1;obj('bush_green',44.6,-22.9,{kind:'bush',town:1});obj('bush_red',57.4,-23.0,{kind:'bush',town:1});
  // ===== Church Hill
  for(const x of [37,44.4,55.6,63,71])L(x,-24.6,true);put('st_hill',52.2,-24.8,.12);
  // the parsonage: a picket garden, ivy on the wall, cellar doors that are always locked
  hedgeLine(33.2,-30.8,-27.8);Y('vines',41,-28.38,{noCol:true});D('cellardoor',42.6,-28.2);Y('gardenbed_b',36.4,-30.4,{kind:'flat'});
  // the churchyard: iron railings on the town side, an old dry-stone wall at the back where it meets the woods
  const G=GYARD;fenceLine(G.x0,G.z1,G.gate-1,G.z1,0,'rgiron');fenceLine(G.gate+1,G.z1,G.x1,G.z1,0,'rgiron');fenceLine(G.x1,G.z0,G.x1,G.z1,0,'rgiron');fenceLine(G.x0,G.z0,G.x0,G.z1,0,'rgiron');
  W('stonewall',G.x0,G.x0+8,G.z0);W('stonewall_b',G.x0+8,G.x0+10,G.z0);W('stonewall',G.x0+10,G.x1,G.z0);reserve(G.x0-1,G.z0-1,G.x1+1,G.z1+.5);
  for(let r=0;r<4;r++)for(let c=0;c<8;c++){const x=55.6+c*2.15+(r&1)*.5,z=G.z1-2.2-r*1.95;if(Math.abs(x-G.gate)<1.3)continue;if(Math.hypot(x-YOURGRAVE.x,z-YOURGRAVE.z)<1.3)continue;
    if(Math.hypot(x-ALTAR_POS[2][0],z-ALTAR_POS[2][1])<2)continue;if(r===0&&x>57&&x<66)continue;put('grave_'+((r*5+c*3)%4),x,z,.35);}
  put('deadtree',71,-34.4,.35);Y('shed_b',63.4,-40.4);
  // pell's: boarded, a tarp over the hole in the roof
  obj('tarp',69.2,-27.58,{kind:'prop',noCol:true,town:1});
  // the hidden garden, behind the parsonage, through a gap in the wall: a fountain nobody tends, and somebody does
  const HG=HIDDEN_GARDEN;W('stonewall',HG.x0,HG.gap[0],HG.z1);W('stonewall',HG.gap[1],HG.x1,HG.z1);W('stonewall_b',HG.x0,HG.x0+2,HG.z0);W('stonewall',HG.x0+2,HG.x1,HG.z0);
  hedgeLine(HG.x0,HG.z0,HG.z1);hedgeLine(HG.x1,HG.z0,HG.z1);reserve(HG.x0,HG.z0,HG.x1,HG.z1);
  Y('fountain',40.9,-36.2);Y('parkbench',41,-34.05);Y('parkbench',43.6,-34.6);Y('planter',37.9,-39.8);Y('planter',43.9,-39.8);Y('birdbath',38.5,-38);TREE_T('apple_gold',43.5,-39.4);
  // the copse on the hill: close-grown and dark, the light barely gets in
  {const C=COPSES[1];for(let i=0;i<16;i++){const a=i*2.4,r=.25+((i*.37)%1)*.8;const x=C.x+Math.cos(a)*C.rx*r,z=C.z+Math.sin(a)*C.rz*r;if(Math.hypot(x-34,z+28)<2)continue;
    const e=obj(['pine_0','pine_1','spruce_0','spruce_1'][i%4],x,z,{kind:'pine',solid:1,town:1});addCircle(x,z,.4);}}
  // the hilltop west of the parsonage: a wood edge along the back, and a lookout bench at the cliff's lip over the farm,
  // reached by a footpath from the end of Hill Street
  for(let x=17.6,k=0;x<34;x+=2.1+((k*37)%10)/10,k++){const z=-41.2+((k*53)%17)/10;if(Math.hypot(x-28,(z+33)*.8)<5.6)continue;
    const e=obj(['pine_0','spruce_1','pine_o0','spruce_0','pine_1'][k%5],x,z,{kind:'pine',solid:1,town:1});addCircle(x,z,.4);}
  ROADS.push([34,-26.6,24.2,-23.9,1.1]);Y('parkbench',23.5,-23.2);TREE_T('maple_red',21.6,-24.6);
  // ===== the green: lawn, a ring of cobbles round the bandstand, paths worn across it where people actually walk
  put('bandstand',squarePos.x,squarePos.z+1.4,0,{kind:'prop'});addRect(squarePos.x-2.1,squarePos.z+.35,squarePos.x+2.1,squarePos.z+1.4);
  put('memorial',41.4,1.6,0,{kind:'prop'});addRect(40.7,1.1,42.1,1.6);
  put('board',boardPos.x,boardPos.z,0);addSeg(boardPos.x-.8,boardPos.z,boardPos.x+.8,boardPos.z,.12);
  for(const [x,z] of [[42.6,6.8],[55.2,-.8],[53.6,8.6]])put('parkbench',x,z,0,{kind:'prop'});put('birdbath',55,3,.25);
  for(const [x,z] of [[45.4,.6],[51.6,.6],[45.4,7.2],[51.6,7.2]])L(x,z);
  for(const [n,x,z] of [['maple_red',37.6,8.8],['maple_gold',42.2,10.6],['oak_russet',55.6,-2.2],['maple_orange',60.4,6.0],['birch_gold',38,-1.4]])TREE_T(n,x,z);   // on the green's rim, not in it
  W('stonewall',40.4,48,12);W('stonewall_b',50.4,52.4,12);W('stonewall',52.4,57.6,12);   // a low wall along its south side, open where the paths come in
  // the water tower over the green: you can see it from anywhere in town, and at night its light watches you
  put('watertower',60.8,13.0,0,{night:'watertower_n',kind:'prop',glow:1});addRect(59.3,11.9,62.3,13.0);
  // ===== Smith's Row and the carpenter's lane: work, mud, a wheel that broke and was never mended
  for(const x of [24,31,38])L(x,13.6,true);put('st_market',35.2,10.8,.12);put('st_mill',21.6,12.6,.12);
  // ===== the lanes south: houses strung along them, each property fenced its own way
  for(const [x,z] of [[38.6,16],[41.8,29.6],[52,30.2],[64.6,28.4],[71,26.4],[26,26],[33.4,25.6],[27,40.4],[36.6,39.8],[70.4,38.2]])L(x,z,true);
  put('st_elm',40.6,22.6,.12);put('st_orchard',72.9,44.8,.12);put('signpost',66.4,37.8,.2,{label:'FOR SALE'});
  // the school: its yard picketed, the field behind worn to dirt
  hedgeLine(41.8,22.4,25.8);Y('rg_swing',53.4,19);Y('parkbench',51.6,16.6);Y('rg_swing',45,18.4);fenceLine(40.6,15,46.8,15,0,'picket');fenceLine(48.6,15,54,15,0,'picket');side(54.2,15,21.4);
  // Vance: hedged and neat; Lindqvist: split rail, nets and an upturned boat
  side(22.2,19.4,14.4);side(28.8,18.8,14.4);fenceLine(22.2,14.4,24.4,14.4,0,'picket');fenceLine(26.2,14.4,28.8,14.4,0,'picket');Y('gardenbed',25.6,16.4,{kind:'flat'});Y('birdbath',27,17.6);
  fenceLine(30,14.4,36.2,14.4);Y('wk_boat',33.6,15.4);Y('wk_nets',31,15.6);Y('barrel',35.4,15.8);
  // the Dunns: the sheriff's car in the lane, a shed, cellar doors; the Oakes: an old stone wall round a vegetable garden
  put('police',61.2,26.7,0,{kind:'car'});addRect(58.8,25.4,63.6,26.7);Y('shed',57.6,16.6);D('cellardoor',62.8,24.6);Y('clothesline_b',60.4,17.2);
  W('stonewall',64.6,68.6,15.2);W('stonewall_b',68.6,70.6,15.2);Y('gardenbed_b',67.4,16.6,{kind:'flat'});
  // the Gales: money's short, the roof leaks; marr's hedge has swallowed his gate; wren's is going back to the woods
  obj('tarp',29.6,36.24,{kind:'prop',noCol:true,town:1});fenceLine(26.6,37.4,29.8,37.4,0,'picket');fenceLine(31.2,37.4,34.4,37.4,0,'picket');Y('clothesline',24.2,35);Y('wheel',35.4,33.6);
  for(let k=0;k<3;k++)Y('hedge',20.8+k*2.1,40.6);obj('bush_green',27,41.2,{kind:'bush',town:1});
  for(let k=0;k<8;k++)obj('weeds_'+(k&1),65.6+((k*29)%6),30.6+((k*41)%5)*.6,{kind:'deco',town:1});TREE_T('deadoak',72.4,31);
  // the copse in the south-east: kids are told not to play in it, so of course they do
  {const C=COPSES[0];for(let i=0;i<14;i++){const a=i*2.4,r=.2+((i*.41)%1)*.85;const x=C.x+Math.cos(a)*C.rx*r,z=C.z+Math.sin(a)*C.rz*r;
    if(x>64&&x<71.5&&z>15&&z<19.2)continue;   // the Oakes garden is cut out of the copse
    const e=obj(['pine_1','spruce_0','pine_o0','spruce_1','pine_0'][i%5],x,z,{kind:'pine',solid:1,town:1});addCircle(x,z,.4);}}
  // street trees along the lanes, never in a row
  for(const [n,x,z] of [['maple_orange',44.6,13.6],['oak_green',36.8,30.4],['maple_gold',47,30.6],['birch_gold',57.6,29.2],['maple_red',66.2,28.4],['oak_russet',24,27.6],['maple_orange',38.4,40]])TREE_T(n,x,z);
  reserve(20.6,-24,76,-12.6);reserve(20.6,12.6,76,45.4);reserve(GREEN.x0,GREEN.z0,GREEN.x1,GREEN.z1);reserve(20.6,-42,76,-24);
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
