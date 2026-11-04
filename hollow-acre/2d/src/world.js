/* ================= world: layout, ground, objects, collision ================= */
const PPM=32;
const B={x0:-74,x1:72,z0:-42,z1:40};
const FIELD={x0:-5,z0:0,w:10,h:8};
const CORN={x0:-15,x1:11,z0:11.5,z1:24};
const inCorn=(x,z)=>x>CORN.x0&&x<CORN.x1&&z>CORN.z0&&z<CORN.z1;
const pond={x:-30,z:24.5,r:7.5};
const wellPos={x:7.3,z:-10.5},binPos={x:-3.6,z:-8.6},doorPos={x:0,z:-8.9},carPos={x:-60.2,z:-1.4},pumpPos={x:-28,z:-10.4},boothPos={x:44.5,z:-9.6};
const crossPos={x:20,z:19},boardPos={x:52,z:-9.4},tsPos={x:27.5,z:-8.4},farmSignPos={x:-11.5,z:-8.6},squarePos={x:48,z:-6};
const fishSpot={x:pond.x,z:pond.z-pond.r+3.6};
const ALTAR_POS=[[-27,8,'west woods'],[-2,29,'cornfield'],[64,-32,'churchyard']];
const SCARE_SPOTS=[[6.9,4],[9.8,-1.2],[2.2,-7.6]];
const ROADS=[[-12.5,-6,70,-6,3],[0,-8.6,0,-1,2],[20,-6,20,19,2],[20,19,4,19,1.6],[48,-18,48,-6,2.4],[26,5,70,5,2],[26,-6,26,5,2],[70,-6,70,5,2],[-46,-6,-46,-9,1.8],[-36,-6,-36,-10.6,2],[2,-9,6,-9,1.4]];
const SIDEWALKS=[];
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
    ||(x>CORN.x0-.6&&x<CORN.x1+.6&&z>CORN.z0-.6&&z<CORN.z1+.6)
    ||(Math.hypot(x+60.6,z-1.2)<3.0+j)||(x>-7+j&&x<7-j&&z>-9.6&&z<-7.2+j*.5);},
  stone:(x,z)=>(Math.abs(z+6)<2.6&&x<-12.5)||Math.hypot(x-48,z+6)<6.6||(Math.abs(z+6)<2.1&&x>24&&x<72)||(Math.abs(x-48)<1.4&&z>-18.6&&z<-6),
  water:(x,z)=>Math.hypot(x-pond.x,z-pond.z)<pond.r+(fbm(x*.8,z*.8)-.5)*.9&&!(x>pond.x-1.1&&x<pond.x+1.1&&z<pond.z-pond.r+4.2),
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
  p.x=clamp(p.x,B.x0-6,B.x1+3);p.z=clamp(p.z,B.z0+.5,B.z1-.5);
}
const BLOCK=[];   // rects reserved by buildings, the field, yards etc.
function reserve(x0,z0,x1,z1){BLOCK.push([Math.min(x0,x1),Math.min(z0,z1),Math.max(x0,x1),Math.max(z0,z1)]);}
function clearSpot(x,z,m){m=m||0;
  for(const r of BLOCK)if(x>r[0]-m&&x<r[2]+m&&z>r[1]-m&&z<r[3]+m)return false;
  if(Math.hypot(x-pond.x,z-pond.z)<pond.r+2.5+m)return false;
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
  // ---------- Grandpa's farm
  building('cabin',0,-9.4,{jack:1});
  put('jack_b',-1.6,-8.85,.25,{glow:1});
  put('well',wellPos.x,wellPos.z+.9);addCircle(wellPos.x,wellPos.z+.4,1.05);reserve(wellPos.x-1.5,wellPos.z-1.2,wellPos.x+1.5,wellPos.z+1.5);
  put('crate',binPos.x,binPos.z,0,{kind:'bin'});addRect(binPos.x-.5,binPos.z-.6,binPos.x+.5,binPos.z);
  put('barrel',-4.6,-9.5,.33);put('barrel',-5.3,-9.9,.33);put('firewood',4.6,-9.6);addRect(3.9,-10.1,5.3,-9.5);
  put('hay',-7.6,-10.3);addRect(-8.4,-11.5,-6.8,-10.4);put('hay',-7.6,-8.6);addRect(-8.4,-9.8,-6.8,-8.7);
  put('cart',-9.6,-12.2);addRect(-10.4,-12.8,-8.8,-12.2);put('sacks',-4.4,-8.7);
  put('signpost',farmSignPos.x,farmSignPos.z,.2,{label:'HOLLOW ACRE'});
  reserve(-11,-15,11,-7.5);
  // the field, fenced with a gate at the top
  fenceLine(-6,-1,-1,-1);fenceLine(1,-1,6,-1);fenceLine(-6,-1,-6,9);fenceLine(6,-1,6,9);fenceLine(-6,9,6,9);
  reserve(-7,-2,7,10);
  put('pumpkin',-5.3,-.3,.25);put('pumpkin_b',5.3,-.4,.25);put('hay',8.2,1.2);addRect(7.4,0,9,1.1);
  // ---------- crash site on Route 9
  put('car_wreck',carPos.x-.8,carPos.z+3.2,0,{night:'car_wreck_n',kind:'wreck'});addRect(carPos.x-1.8,carPos.z-1.2,carPos.x+1.2,carPos.z+3.1);
  put('deadtree',carPos.x+.15,carPos.z+3.45,.35);reserve(-65,-8,-56,4);
  // ---------- Marrow Hollow: main street (z=-6), north row faces the street, south row faces the back lane (z=5)
  building('store',31,-9.4,{jack:1});building('house_a',40,-9.4);building('house_b',57,-9.4,{jack:1});building('house_d',66,-9.4);
  building('house_c',31,3.6);building('house_b',40,3.6);building('house_c',57,3.6,{lit:false});building('house_d',66,3.6,{lit:false});
  // side yards: picket runs between the houses, store goods stacked by the door
  fenceLine(35.6,-9.6,35.6,-13.8,0,'picket');fenceLine(61.5,-9.6,61.5,-13.8,0,'picket');fenceLine(35.6,-.6,35.6,3.4,0,'picket');fenceLine(61.5,-.6,61.5,3.4,0,'picket');
  put('crate',34.9,-9.0,.3);put('sacks',34.6,-8.55);put('barrel',26.9,-9.3,.3);put('barrel',27.5,-8.8,.3);put('hay',26.6,-11.6);addRect(25.8,-12.8,27.4,-11.7);
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
  put('barrel',-31.8,-11.2,.3);put('barrel',-31,-10.8,.3);put('crate',-40.8,-10.9,.3);put('firewood',-41.6,-12);
  building('house_a',-46,-9.6,{jack:1});
  // crossroads shrine
  put('signpost',crossPos.x-1.6,crossPos.z-1.2,.2,{label:'FARM'});
  // ---------- woods & trees: thick pines outside the valley and in the west/south woods, autumn trees in the open
  scatter(560,2.2,()=>{const r=rand();return r<.36?'pine_0':r<.72?'pine_1':r<.86?'pine_o0':'pine_o1';},(x,z)=>{const out=Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1);
    const woods=(x<-14&&z>4)||(z>26&&x<30)||(x>10&&x<26&&z>8&&z<16)||(z<-20&&x<26);return (out>-2||woods)&&clearSpot(x,z,.8);},.35);
  for(const o of OBJ)if(o.kind==='tree'&&o.spr.startsWith('pine'))o.kind='pine';
  scatter(70,3.4,()=>rand()<.75?'tree_orange':'tree_green',(x,z)=>x>B.x0+1&&x<B.x1-1&&z>B.z0+1&&z<B.z1-1&&clearSpot(x,z,1.4),.32);
  for(const [x,z] of[[-24,12],[-29,5],[4,28],[-6,30],[14,4],[16,-14],[24,24]])if(clearSpot(x,z,.5))put('deadtree',x,z,.3);
  for(let i=0;i<24;i++){const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(clearSpot(x,z,1)&&terr(x,z)==='grass'&&(x<-14||z>12))put('stump',x,z,.35);}
  for(let i=0;i<420;i++){const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(terr(x,z)!=='grass'||!clearSpot(x,z,-.8))continue;obj('leaves',x,z,{kind:'deco',v:(rand()*4)|0});}
  // the cornfield in neat rows
  for(let x=CORN.x0+.5;x<CORN.x1;x+=.9)for(let z=CORN.z0+.5;z<CORN.z1;z+=.8){if(Math.abs(x+.5)<1&&z<20)continue;if(rand()<.05)continue;obj('corn_'+((rand()*3)|0),x+(rand()-.5)*.12,z,{kind:'corn'});}
  addSeg(pond.x-.95,pond.z-pond.r-.6,pond.x-.95,pond.z-pond.r+4.2,.1);addSeg(pond.x+.95,pond.z-pond.r-.6,pond.x+.95,pond.z-pond.r+4.2,.1);addSeg(pond.x-.95,pond.z-pond.r+4.2,pond.x+.95,pond.z-pond.r+4.2,.1);
  addRect(B.x0-12,B.z0-14,B.x1+12,B.z0-.5);addRect(B.x0-12,B.z1+.5,B.x1+12,B.z1+14);addRect(B.x1+2.5,B.z0-14,B.x1+14,B.z1+14);
  addRect(B.x0-20,B.z0-14,B.x0-6.5,-9);addRect(B.x0-20,-3,B.x0-6.5,B.z1+14);
}
const lamps=[];
function lamp(x,z){const e=obj('lamp',x,z,{kind:'lamp',night:'lamp_n'});lamps.push({e,x,z,dead:rand()<.25,ph:rand()*10});addCircle(x,z,.15);}
const fenceDefs=[];
function fenceLine(x1,z1,x2,z2,skip,type){const fh=(type||'fence')+'_h',fv=(type||'fence')+'_v';const vert=Math.abs(x2-x1)<Math.abs(z2-z1);const len=Math.hypot(x2-x1,z2-z1);
  addSeg(x1,z1,x2,z2,.14);fenceDefs.push([x1,z1,x2,z2]);
  if(vert){const zs=Math.min(z1,z2),ze=Math.max(z1,z2);for(let z=zs+1;z<=ze+.01;z+=1)obj(fv,x1,z,{kind:'fence'});}
  else{const xs=Math.min(x1,x2),xe=Math.max(x1,x2);for(let x=xs;x<xe-.01;x+=2){obj(fh,x,z1+.1,{kind:'fence',clipw:Math.min(2,xe-x)});}}}
