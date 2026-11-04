/* ================= world: layout, ground, objects, collision ================= */
const PPM=32;
const B={x0:-74,x1:72,z0:-42,z1:40};
const FIELD={x0:-5,z0:0,w:10,h:8};
const CORN={x0:-15,x1:11,z0:11.5,z1:24};
const inCorn=(x,z)=>x>CORN.x0&&x<CORN.x1&&z>CORN.z0&&z<CORN.z1;
const pond={x:-30,z:24.5,r:7.5};
const wellPos={x:8.5,z:-4},binPos={x:-3.6,z:-7.4},doorPos={x:0,z:-8.7},carPos={x:-60.2,z:-4.6},pumpPos={x:-27.5,z:-10.2},boothPos={x:44,z:-10};
const crossPos={x:20,z:19},boardPos={x:51.5,z:-9.2},tsPos={x:31.5,z:-8.6},farmSignPos={x:-14.5,z:-9},squarePos={x:48,z:-6};
const fishSpot={x:pond.x,z:pond.z-pond.r+3.6};
const ALTAR_POS=[[-27,8,'west woods'],[-2,29,'cornfield'],[64,-32,'churchyard']];
const SCARE_SPOTS=[[6.9,4],[9.8,-1.2],[2.2,-7.6]];
const ROADS=[[-12,-6,64,-6,3],[0,-9,0,0,2.2],[20,-6,20,19,2],[20,19,4,19,1.6],[48,-28,48,14,2.6],[36,-21,36,10,2],[8,-6,8.5,-4,1.6],[-46,-6,-46,1.5,1.6],[-36,-6,-36,-10.5,2]];
const SIDEWALKS=[[33,45.5,-2.3],[50.5,66,-2.3],[33,45.5,-9.7],[50.5,66,-9.7]];
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
    ||(x>CORN.x0-.6&&x<CORN.x1+.6&&z>CORN.z0-.6&&z<CORN.z1+.6)||(x>FIELD.x0-1&&x<FIELD.x0+FIELD.w+1&&z>FIELD.z0-1&&z<FIELD.z0+FIELD.h+1)
    ||(Math.hypot(x+61,z+3)<3.2+j)||(x>-8&&x<8&&z>-10&&z<-6.5)||(fbm(x*.18+30,z*.18)>.72&&x>B.x0&&x<B.x1);},
  stone:(x,z)=>(Math.abs(z+6)<2.6&&x<-12.5)||Math.hypot(x-48,z+6)<7.2+(fbm(x,z)-.5)*.6||(SIDEWALKS.some(([a,b,zz])=>x>a&&x<b&&Math.abs(z-zz)<.9)),
  water:(x,z)=>Math.hypot(x-pond.x,z-pond.z)<pond.r+(fbm(x*.8,z*.8)-.5)*.9&&!(x>pond.x-1.1&&x<pond.x+1.1&&z<pond.z-pond.r+4.2),
  dark:(x,z)=>Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1)>-1||fbm(x*.22+70,z*.22)>.68,
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
  p.x=clamp(p.x,B.x0-6,B.x1+3);p.z=clamp(p.z,B.z0+.5,B.z1-.5);
}
function clearSpot(x,z,m){m=m||0;
  if(x>-7.5-m&&x<12.5+m&&z>-3-m&&z<10.5+m)return false;
  if(x>-6-m&&x<6+m&&z>-17-m&&z<-6+m)return false;
  if(z>-10.5-m&&z<-2+m&&x>-76&&x<68)return false;
  if(x>-43-m&&x<-24+m&&z>-20-m&&z<-7+m)return false;
  if(x>-53-m&&x<-39+m&&z>-1-m&&z<11+m)return false;
  if(Math.hypot(x-pond.x,z-pond.z)<10.5+m)return false;
  if(Math.hypot(x+61,z+2.6)<5+m)return false;
  if(x>27-m&&x<70&&z>-38&&z<16+m)return false;
  if(Math.abs(x-48)<2.5+m&&z>-28&&z<16)return false;
  if(Math.abs(x-20)<2.2+m&&z>-6&&z<21)return false;
  if(z>17-m&&z<21+m&&x>3&&x<24)return false;
  if(Math.hypot(x-crossPos.x,z-crossPos.z)<5+m)return false;
  if(x>CORN.x0-1.5&&x<CORN.x1+1.5&&z>CORN.z0-1.5&&z<CORN.z1+1.5)return false;
  for(const a of ALTAR_POS)if(Math.hypot(x-a[0],z-a[1])<4+m)return false;
  for(const r of ROADS)if(segDist(x,z,r[0],r[1],r[2],r[3])<r[4]/2+1+m)return false;
  return true;}
// ---------- world objects: {spr, x, z, flip?, night?, kind?, alpha?, hide?}
const OBJ=[];
function obj(spr,x,z,o){const e=Object.assign({spr,x,z},o||{});OBJ.push(e);return e;}
function solid(e,shrink){const m=SPR[e.spr];if(!m||!m.foot)return;const f=m.foot;const s=shrink===undefined?.05:shrink;
  if(f[2]-f[0]<.05&&f[3]-f[1]<.05)return;addRect(e.x+f[0]+s,e.z+f[1]+s,e.x+f[2]-s,e.z+f[3]-s);}
const HOUSES=[];
function building(spr,cx,cz,d,o){o=o||{};const m=SPR[spr];const e=obj(spr,cx,cz+d/2+(m&&m.porchZ||0),Object.assign({night:SPR[spr+'_n']?spr+'_n':null,kind:'bld'},o));
  const w=m?m.bw:6;addRect(cx-w/2,cz-d/2,cx+w/2,cz+d/2);HOUSES.push({e,x:cx,z:cz,lit:o.lit!==false});return e;}
function building(spr,cx,cz,d,o){o=o||{};const e=obj(spr,cx,cz+d/2,Object.assign({night:spr+'_n',kind:'bld'},o));const m=SPR[spr];const f=m.foot;
  addRect(cx+f[0]+.1,cz+d/2+f[1]+.3,cx+f[2]-.1,cz+d/2-.15);HOUSES.push({e,x:cx,z:cz+d/2,lit:o.lit!==false,w:m.bw||6});return e;}
function buildWorld(){
  // farm
  building('cabin',0,-12,5.2);
  obj('jack',-2.4,-8.6,{night:'jack',glow:1});obj('jack_b',2.6,-8.5,{glow:1});obj('pumpkin',-3.2,-8.3);
  obj('well',wellPos.x,wellPos.z+1);addCircle(wellPos.x,wellPos.z+.3,1.1);
  obj('crate',binPos.x,binPos.z+.4,{kind:'bin'});addRect(binPos.x-.5,binPos.z-.3,binPos.x+.5,binPos.z+.4);
  obj('barrel',-4.4,-9.2);addCircle(-4.4,-9.4,.35);obj('barrel',4.4,-9.4);addCircle(4.4,-9.6,.35);obj('firewood',5.6,-9.2);addCircle(5.6,-9.4,.6);
  for(const [x,z] of[[10,1],[11.6,2.6],[-9,-1]]){obj('hay',x,z+.6);addRect(x-.8,z-.6,x+.8,z+.5);}
  obj('cart',-8.6,-5.6);addRect(-9.4,-6.1,-7.8,-5.4);obj('sacks',-7.6,-8.6);addRect(-8.4,-9,-6.8,-8.5);
  obj('signpost',farmSignPos.x,farmSignPos.z,{label:'HOLLOW ACRE'});addCircle(farmSignPos.x,farmSignPos.z,.2);
  fenceLine(-6.3,-.6,-6.3,9.4);fenceLine(-6.3,9.4,6.3,9.4,i=>i===3);
  // town
  building('store',40,2,6);obj('crate',43.9,-1.9);obj('barrel',36.2,-2.2);obj('sacks',44.6,-1.2);
  building('house_a',40,-14,5.5);building('house_c',57,2,5);building('house_b',62,-14,5.5);building('house_d',57,12.5,6);
  building('house_b',30,10,5.5);building('house_c',65,4.6,5);
  building('church',48,-30,11);
  building('garage',-36,-14.5,7);building('house_a',-46,4.5,5.5);
  obj('barrel',-31.5,-11.2);obj('barrel',-32.3,-10.6);obj('crate',-40.5,-11.8);obj('firewood',-39,-10.6);
  obj('signpost',boardPos.x,boardPos.z,{label:'NOTICES'});obj('signpost',tsPos.x,tsPos.z,{label:'MARROW HOLLOW'});
  for(const x of[28,36,44,52,60])lamp(x,-8.4);for(const x of[32,40,56,64])lamp(x,-3.6);lamp(46,-17);lamp(50,6);lamp(22,4);lamp(21.5,15);
  const gs=[[57,-27],[59.5,-28],[62,-27.2],[57.5,-31],[60,-31.5],[66,-27],[66.5,-31],[57,-35],[60,-35],[63.5,-35.5]];
  gs.forEach(([x,z],i)=>{obj('grave_'+(i%4),x,z);addCircle(x,z-.2,.35);});
  fenceLine(54,-38,54,-24,i=>i===3);fenceLine(54,-24,69,-24,i=>i===2);
  obj('car_wreck',carPos.x-.8,carPos.z+3.2,{night:'car_wreck_n',kind:'wreck'});addRect(carPos.x-1.9,carPos.z-1.2,carPos.x+.3,carPos.z+3);
  obj('deadtree',-61.6,.9);addCircle(-61.6,.9,.35);
  fenceLine(-51,1.2,-48.5,1.2);fenceLine(-43.5,1.2,-41,1.2);fenceLine(-51,1.2,-51,9);fenceLine(-41,1.2,-41,9);
  obj('signpost',crossPos.x-1.6,crossPos.z-1.2,{label:'FARM →'});
  for(const [x,z] of[[46,-1.6],[50.5,-10.8],[38.4,-2.6],[58,-2.4],[-2,-8.6],[2.8,-8.4],[-35,-10],[-45,1.2],[28.6,-7.6],[44.6,-7.6],[52.6,-7.6]]){obj(rand()<.5?'pumpkin':'pumpkin_b',x+.4,z+.2);obj(rand()<.4?'jack_c':'pumpkin',x-.4,z+.3,{glow:1});}
  obj('hay',46.4,-8.6);addRect(45.6,-9.8,47.2,-8.7);obj('hay',50.2,-1.8);addRect(49.4,-3,51,-1.9);
  // trees: autumn and green broadleaf
  const spots=[[34,-12.5],[45,-12.8],[54,-12.5],[67,-9.5],[35,6.2],[45.6,9],[61.5,8.6],[52.5,-19.5],[42,-21],[58.5,-19.5],[30,-15],[68,-1],[-9,-13],[9,-13.5],[-10.5,-3.4],[13.5,6],[-12,8],[4,-18],[-30,-15.5],[-50,-1.8],[-39.5,8],[-22,-12],[26.5,-2],[24,-11],[-66,-10.5],[-55,-11],[-45.5,-12],[16,-3],[-17,-2.6],[38,-24],[66,-20]];
  for(let i=0;i<40;i++){const x=lerp(-70,70,rand()),z=lerp(-36,36,rand());if(clearSpot(x,z,2.5))spots.push([x,z]);}
  spots.forEach(([x,z],i)=>{obj(i%4===3?'tree_green':'tree_orange',x,z,{kind:'tree'});addCircle(x,z,.32);});
  for(const [x,z] of[[-24,12],[-29,5],[4,27],[-6,30],[12,12],[67,-29],[55,-36],[16,-14],[24,24]]){obj('deadtree',x,z);addCircle(x,z,.3);}
  let n=0,tries=0;while(n<560&&tries<22000){tries++;const x=lerp(B.x0-14,B.x1+12,rand()),z=lerp(B.z0-10,B.z1+12,rand());
    const out=Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1);const woods=(x<-14&&z>4)||(z>24&&x<30)||(x>8&&x<27&&z>8)||(z<-20&&x<26);
    if(out<-2&&!woods&&rand()<.9)continue;if(!clearSpot(x,z,1.2))continue;
    if(OBJ.some(o=>o.kind==='pine'&&Math.abs(o.x-x)<2.2&&Math.abs(o.z-z)<1.7))continue;
    const r=rand();obj(r<.36?'pine_0':r<.72?'pine_1':r<.86?'pine_o0':'pine_o1',x,z,{kind:'pine'});if(out<1)addCircle(x,z,.35);n++;}
  for(let i=0;i<30;i++){const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(!clearSpot(x,z,.8))continue;obj('stump',x,z);addCircle(x,z,.4);}
  for(let i=0;i<500;i++){const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(terr(x,z)!=='grass'||!clearSpot(x,z,0))continue;obj('leaves',x,z,{kind:'deco',flat:1,v:(rand()*4)|0});}
  for(let x=CORN.x0+.4;x<CORN.x1;x+=.85)for(let z=CORN.z0+.4;z<CORN.z1;z+=.7){if(Math.abs(x+.5)<.9&&z<20)continue;if(rand()<.06)continue;
    obj('corn_'+((rand()*3)|0),x+(rand()-.5)*.3,z+(rand()-.5)*.3,{kind:'corn'});}
  addSeg(pond.x-.95,pond.z-pond.r-.6,pond.x-.95,pond.z-pond.r+4.2,.1);addSeg(pond.x+.95,pond.z-pond.r-.6,pond.x+.95,pond.z-pond.r+4.2,.1);addSeg(pond.x-.95,pond.z-pond.r+4.2,pond.x+.95,pond.z-pond.r+4.2,.1);
  addRect(B.x0-12,B.z0-14,B.x1+12,B.z0-.5);addRect(B.x0-12,B.z1+.5,B.x1+12,B.z1+14);addRect(B.x1+2.5,B.z0-14,B.x1+14,B.z1+14);
  addRect(B.x0-20,B.z0-14,B.x0-6.5,-9);addRect(B.x0-20,-3,B.x0-6.5,B.z1+14);
}
const lamps=[];
function lamp(x,z){const e=obj('lamp',x,z,{kind:'lamp'});lamps.push({e,x,z,dead:rand()<.25,ph:rand()*10});addCircle(x,z,.15);}
const fenceDefs=[];
function fenceLine(x1,z1,x2,z2,skip){const len=Math.hypot(x2-x1,z2-z1),n=Math.max(1,Math.round(len/2));const vert=Math.abs(x2-x1)<Math.abs(z2-z1);
  for(let i=0;i<n;i++){if(skip&&skip(i))continue;const a=i/n,b=(i+1)/n;const ax=lerp(x1,x2,a),az=lerp(z1,z2,a),bx=lerp(x1,x2,b),bz=lerp(z1,z2,b);
    fenceDefs.push([ax,az,bx,bz]);addSeg(ax,az,bx,bz,.12);
    if(vert)obj('fence_v',ax,Math.max(az,bz),{kind:'fence'});else obj('fence_h',Math.min(ax,bx),az+.1,{kind:'fence'});}}
