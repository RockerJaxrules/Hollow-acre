/* ================= world: layout, ground, objects, collision ================= */
const PPM=32;
const B={x0:-74,x1:72,z0:-42,z1:40};
const FIELD={x0:-5,z0:0,w:10,h:8};
const FSTART={i0:3,j0:0,w:4,h:3};   // the patch Grandpa still kept clear; the rest of the field has gone wild
const CORN={x0:-15,x1:11,z0:11.5,z1:24};
const inCorn=(x,z)=>x>CORN.x0&&x<CORN.x1&&z>CORN.z0&&z<CORN.z1;
const pond={x:-30,z:24.5,r:7.5};
const wellPos={x:7.3,z:-10.5},binPos={x:-3.6,z:-8.6},doorPos={x:0,z:-8.9},carPos={x:-60.2,z:-1.4},pumpPos={x:-30.5,z:-10.3},boothPos={x:44.5,z:-9.6};
const crossPos={x:20,z:19},boardPos={x:52,z:-9.4},tsPos={x:27.5,z:-8.4},farmSignPos={x:-13.4,z:-10.1},squarePos={x:48,z:-6};
const fishSpot={x:pond.x,z:pond.z-pond.r+3.6};
const ALTAR_POS=[[-27,8,'west woods'],[-2,29,'cornfield'],[64,-32,'churchyard']];
const SCARE_SPOTS=[[6.9,4],[9.8,-1.2],[2.2,-7.6]];
const ROADS=[[-12.5,-6,70,-6,3],[16,-9.4,16,-6,2.8],[0,-8.6,0,-1,2],[20,-6,20,19,2],[20,19,4,19,1.6],[48,-18,48,-6,2.4],[26,5,70,5,2],[26,-6,26,5,2],[70,-6,70,5,2],[-46,-6,-46,-9,1.8],[-36,-6,-36,-10.6,2],[2,-9,6,-9,1.4]];
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
const LAYERS={
  dirt:(x,z)=>{const j=(fbm(x*.7,z*.7)-.5)*.8;return onRoad(x,z,j)||(Math.hypot(x-pond.x,z-pond.z)<pond.r+1.6+j&&Math.hypot(x-pond.x,z-pond.z)>pond.r-.4)
    ||(x>CORN.x0-.6&&x<CORN.x1+.6&&z>CORN.z0-.6&&z<CORN.z1+.6)||(x>FIELD.x0+FSTART.i0-.35+j*.3&&x<FIELD.x0+FSTART.i0+FSTART.w+.35-j*.3&&z>FIELD.z0+FSTART.j0-.35+j*.3&&z<FIELD.z0+FSTART.j0+FSTART.h+.35-j*.3)
    ||(Math.hypot(x+60.6,z-1.2)<3.0+j)||(x>-7+j&&x<7-j&&z>-9.6&&z<-7.2+j*.5);},
  stone:(x,z)=>(Math.abs(z+6)<2.6&&x<-12.5)||Math.hypot(x-48,z+6)<6.6||(Math.abs(z+6)<2.1&&x>24&&x<72)||(Math.abs(x-48)<1.4&&z>-18.6&&z<-6),
  water:(x,z)=>(Math.hypot(x-pond.x,z-pond.z)<pond.r+(fbm(x*.8,z*.8)-.5)*.9&&!(x>pond.x-1.1&&x<pond.x+1.1&&z<pond.z-pond.r+4.2))||inCreek(x,z),
  dark:(x,z)=>Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1)>-1||((x<-16&&z>6)||(z>28))&&fbm(x*.22+70,z*.22)>.5,
};
function terr(x,z){if(LAYERS.water(x,z))return 'water';if(LAYERS.stone(x,z))return 'stone';if(LAYERS.dirt(x,z))return 'dirt';return 'grass';}
// ---------- collision
const circles=[],rects=[],segs=[];
function addCircle(x,z,r){circles.push({x,z,r});}
function addRect(x0,z0,x1,z1){rects.push({x0:Math.min(x0,x1),z0:Math.min(z0,z1),x1:Math.max(x0,x1),z1:Math.max(z0,z1)});}
function addSeg(x1,z1,x2,z2,r){segs.push({x1,z1,x2,z2,r});}
function collide(p,r){
  for(const c of circles){const dx=p.x-c.x,dz=p.z-c.z,d=Math.hypot(dx,dz),m=c.r+r;if(d<m&&d>1e-5){p.x=c.x+dx/d*m;p.z=c.z+dz/d*m;}}
  for(const q of rects){const cx=clamp(p.x,q.x0,q.x1),cz=clamp(p.z,q.z0,q.z1);const dx=p.x-cx,dz=p.z-cz,d=Math.hypot(dx,dz);
    if(d<r){if(d>1e-5){p.x=cx+dx/d*r;p.z=cz+dz/d*r;}else{const l=p.x-q.x0,rr=q.x1-p.x,t=p.z-q.z0,bb=q.z1-p.z,mn=Math.min(l,rr,t,bb);
      if(mn===l)p.x=q.x0-r;else if(mn===rr)p.x=q.x1+r;else if(mn===t)p.z=q.z0-r;else p.z=q.z1+r;}}}
  for(const s of segs){const dx=s.x2-s.x1,dz=s.z2-s.z1,L=dx*dx+dz*dz||1;const t=clamp(((p.x-s.x1)*dx+(p.z-s.z1)*dz)/L,0,1);const cx=s.x1+dx*t,cz=s.z1+dz*t;
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
  if(Math.hypot(x-48,z+6)<8.5+m)return false;
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
  // ---------- Marrow Hollow: main street (z=-6), north row faces the street, south row faces the back lane (z=5)
  building('store',31,-9.4,{jack:1});building('house_a',40,-9.4);building('house_b',57,-9.4,{jack:1});building('house_d',66,-9.4);
  building('house_c',31,3.6);building('house_b',40,3.6);building('house_c',57,3.6,{lit:false});building('house_d',66,3.6,{lit:false});
  // side yards: picket runs between the houses, store goods stacked by the door
  fenceLine(35.6,-9.6,35.6,-13.8,0,'picket');fenceLine(61.5,-9.6,61.5,-13.8,0,'picket');fenceLine(35.6,-.6,35.6,3.4,0,'picket');fenceLine(61.5,-.6,61.5,3.4,0,'picket');
  put('crate',34.9,-9.0,.3);put('sacks',32.55,-8.6);put('barrel',26.9,-9.3,.3);put('barrel',27.5,-8.8,.3);put('hay',26.6,-11.6);addRect(25.8,-12.8,27.4,-11.7);
  // street lamps on the kerbs, never in the road
  for(const x of[27,36.4,45.8,50.2,61,70])lamp(x,-8.5);for(const x of[27,36.4,61,70])lamp(x,-3.5);for(const x of[36.4,48,61])lamp(x,6.5);
  put('phone_booth',boothPos.x,boothPos.z+.5,0,{night:'phone_booth_n',kind:'booth'});addRect(boothPos.x-.55,boothPos.z-.4,boothPos.x+.55,boothPos.z+.5);
  put('board',boardPos.x,boardPos.z,0);addSeg(boardPos.x-.8,boardPos.z,boardPos.x+.8,boardPos.z,.12);
  put('signpost',tsPos.x,tsPos.z,.2,{label:'MARROW HOLLOW'});
  // church on its own path north of the square, graveyard to the east
  building('church',48,-18.6);
  const graves=[];for(let r=0;r<3;r++)for(let c=0;c<5;c++)graves.push([56.5+c*2.2,-30+r*2.6]);
  graves.forEach(([x,z],i)=>{if(i===7)return;put('grave_'+((i*7)%4),x,z,.35);});
  put('deadtree',67.5,-31,.35);fenceLine(54.5,-32.5,68.5,-32.5);fenceLine(54.5,-32.5,54.5,-21.5);fenceLine(68.5,-32.5,68.5,-21.5);fenceLine(54.5,-21.5,60.5,-21.5);fenceLine(62.5,-21.5,68.5,-21.5);
  reserve(53.5,-34,70,-20.5);
  // garage + pump on the west road, the widow's house north of the highway
  building('garage',-36,-10.6,{lit:true});put('gas_pump',pumpPos.x,pumpPos.z+1.6,0,{night:'gas_pump_n'});addCircle(pumpPos.x-.4,pumpPos.z,.35);addCircle(pumpPos.x+.4,pumpPos.z,.35);
  put('barrel',-31.6,-11.9,.3);put('barrel',-31.1,-11.5,.3);put('crate',-40.8,-10.9,.3);put('firewood',-41.6,-12);
  building('house_a',-46,-9.6,{jack:1});
  // crossroads shrine
  put('signpost',crossPos.x-1.6,crossPos.z-1.2,.2,{label:'FARM'});
  // ---------- Marrow Creek: covered bridge on Route 9, footbridge in the west woods, falls off the ridge
  put('cbridge',BRIDGE.x,BRIDGE.z,0,{night:'cbridge_n',kind:'bld'});addSeg(BRIDGE.x-4.7,-9.1,BRIDGE.x+4.7,-9.1,.15);addSeg(BRIDGE.x-4.7,-2.9,BRIDGE.x+4.7,-2.9,.15);
  put('footbridge',FOOT.x,FOOT.z,0,{kind:'flat'});put('dock',pond.x,pond.z-pond.r+1.85,0,{kind:'flat'});
  obj('falls',-19.2,ridgeZ(-19.2)+RIDGE.h+.15,{kind:'anim',fps:8});
  {const skip=(x,z)=>(Math.abs(z+6)<3.1&&Math.abs(x-BRIDGE.x)<5.2)||(Math.abs(z-FOOT.z)<.75&&Math.abs(x-FOOT.x)<2);
    for(let i=0;i<CREEK.length-1;i++){const a=CREEK[i],b=CREEK[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/.8);
      for(let k=0;k<n;k++){const x1=lerp(a[0],b[0],k/n),z1=lerp(a[1],b[1],k/n),x2=lerp(a[0],b[0],(k+1)/n),z2=lerp(a[1],b[1],(k+1)/n);if(skip(x1,z1)||skip(x2,z2))continue;addSeg(x1,z1,x2,z2,.95);}}}
  // the ridge face blocks the way north
  for(let x=RIDGE.x0;x<RIDGE.x1;x+=.8){if(ridgeH(x)<.3)continue;addSeg(x,ridgeZ(x)+.9,x+.8,ridgeZ(x+.8)+.9,.5);}
  // ---------- the farm: red barn + silo east of the field, windpump, mailbox, hens
  building('barn',16,-9.6,{porch:false});put('silo',20.6,-12.6,.8);reserve(11.5,-15,22,-8.6);
  put('hay',11.5,-10.4);addRect(10.8,-11.6,12.3,-10.4);put('hay',11.5,-8.9);addRect(10.8,-10.1,12.3,-9);put('cart',21.4,-8.7);addRect(20.2,-9.3,22.6,-8.7);put('hay',12.2,-1.0);
  fenceLine(8.5,-3.9,13.5,-3.9);fenceLine(8.5,-3.9,8.5,-.2);fenceLine(13.5,-3.9,13.5,-.2);fenceLine(8.5,-.2,10,-.2);fenceLine(12,-.2,13.5,-.2);reserve(8,-4.4,14,.4);
  // ---------- planted trees: an avenue along the lane into town, the church walk, the crossroads, the pond's east bank
  {let k=0;for(const [x,z] of [[23.2,-2.6],[23.6,-9.6]]){const n=['maple_red','maple_orange','maple_gold'][k++%3];obj(n,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);}}
  for(const [n,x,z] of [['maple_red',45.2,-14.6],['maple_gold',50.8,-14.6],['maple_orange',23.5,16.4],['maple_red',17,21.6],['maple_gold',-21.5,21],['maple_orange',-21.8,27.5],['maple_green',-24,31.5]]){obj(n,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);}
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
const lamps=[];
function lamp(x,z){const e=obj('lamp',x,z,{kind:'lamp',night:'lamp_n'});lamps.push({e,x,z,dead:rand()<.25,ph:rand()*10});addCircle(x,z,.15);}
const fenceDefs=[];
function fenceLine(x1,z1,x2,z2,skip,type){const fh=(type||'fence')+'_h',fv=(type||'fence')+'_v';const vert=Math.abs(x2-x1)<Math.abs(z2-z1);const len=Math.hypot(x2-x1,z2-z1);
  addSeg(x1,z1,x2,z2,.14);fenceDefs.push([x1,z1,x2,z2]);
  if(vert){const zs=Math.min(z1,z2),ze=Math.max(z1,z2);for(let z=zs+1;z<=ze+.01;z+=1)obj(fv,x1,z,{kind:'fence'});}
  else{const xs=Math.min(x1,x2),xe=Math.max(x1,x2);for(let x=xs;x<xe-.01;x+=2){obj(fh,x,z1+.1,{kind:'fence',clipw:Math.min(2,xe-x)});}}}
// every solid thing gets a collider: anything standing that nothing blocks yet gets one sized from its footprint
function autoCollide(){const SOLID=new Set(['tree','pine','bld','lamp','prop','bush','fence','wreck','furn','bin']);let added=0;
  const blockedAt=(x,z)=>circles.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+.05)||rects.some(r=>x>r.x0-.05&&x<r.x1+.05&&z>r.z0-.05&&z<r.z1+.05)||
    segs.some(s=>{const dx=s.x2-s.x1,dz=s.z2-s.z1,L=dx*dx+dz*dz||1;const t=clamp(((x-s.x1)*dx+(z-s.z1)*dz)/L,0,1);return Math.hypot(s.x1+dx*t-x,s.z1+dz*t-z)<(s.r||.15)+.05;});
  for(const o of OBJ){if(o.hide||!SOLID.has(o.kind)||o.noCol||(o.debris&&o.debris!=='rock'&&o.debris!=='stump'))continue;if(o.kind==='fence'&&o.spr.endsWith('_h')){continue;}
    const cx=o.x,cz=o.z-.1;if(blockedAt(cx,cz))continue;const f=footBox(o);if(!f)continue;const w=f[2]-f[0],d=f[3]-f[1];
    if(w>1.6||d>1.2)addRect(f[0]+.08,Math.max(f[1],o.z-1.2)+.05,f[2]-.08,o.z-.05);else addCircle(cx,cz,clamp(Math.min(w,d+.3)*.45,.18,.6));added++;}
  return added;}
