/* ================= the valley beyond town: four times the land. East along the Old County Road: the Hollow Woods, the quarry, the Black Lake.
   South down Mill Road: Quill Orchard, the abandoned Marsh place, the river and the old mill, and the Tithe House in its clearing. ================= */
B.x1=218;B.z1=124;
const OLD={x1:72,z1:40};
const HOLLOW_TREE={x:108,z:14},LAKE={x:186,z:16,rx:20,rz:13},QUARRY={x0:128,x1:166,z0:-40,z1:-20},TITHE={x:-26,z:88},MILLX=20;
const RIVER=[[176,27],[150,58],[112,82],[70,98],[20,104],[-30,112],[-90,118]];
const LANE_E=46,LANE_W=46;
ROADS.push([70,-6,212,-6,3],[146,-6,146,-24,2],[190,-6,190,1.5,2],[108,-4,108,9,1.4],[70,5,70,15.5,2],
  [20,19,20,120,2.4],[20,LANE_E,70,LANE_E,2],[20,LANE_W,-52,LANE_W,2],[20,88,-20,88,1.6],[20,98,40,98,1.8]);
const riverD=(x,z)=>{let best=1e9;for(let i=0;i<RIVER.length-1;i++){const [a,b]=RIVER[i],[c,d]=RIVER[i+1];best=Math.min(best,segDist(x,z,a,b,c,d));}return best;};
const BRIDGE2={x:MILLX,z:104};
const inLake=(x,z)=>{const dx=(x-LAKE.x)/LAKE.rx,dz=(z-LAKE.z)/LAKE.rz;return dx*dx+dz*dz<1+(fbm(x*.25,z*.25)-.5)*.35;};
const inRiver=(x,z)=>riverD(x,z)<2.1+(fbm(x*.3,z*.3)-.5)*.9&&!(Math.abs(x-BRIDGE2.x)<2&&Math.abs(z-BRIDGE2.z)<5);
const newWater=(x,z)=>(x>OLD.x1||z>OLD.z1)&&(inLake(x,z)||inRiver(x,z));
const inQuarry=(x,z)=>x>QUARRY.x0+(fbm(x*.3,z*.3)-.5)*4&&x<QUARRY.x1&&z>QUARRY.z0&&z<QUARRY.z1+(fbm(x*.2,z*.2)-.5)*3;
const hollowWoods=(x,z)=>x>78&&x<136&&Math.abs(z+6)>3.2&&Math.hypot(x-HOLLOW_TREE.x,z-HOLLOW_TREE.z)>6&&!(Math.abs(x-108)<1.6&&z>-6&&z<10);
const southWoods=(x,z)=>z>108||(z>74&&x<-40)||(x>78&&z>40&&riverD(x,z)>4);
{const W=LAYERS.water,Dt=LAYERS.dirt,St=LAYERS.stone,Dk=LAYERS.dark;
  LAYERS.water=(x,z)=>W(x,z)||newWater(x,z);
  LAYERS.dirt=(x,z)=>(Dt(x,z)||Math.hypot(x-TITHE.x,z-TITHE.z)<7+(fbm(x*.5,z*.5)-.5)*2||Math.hypot(x-HOLLOW_TREE.x,z-HOLLOW_TREE.z)<4.5+(fbm(x*.6,z*.6)-.5)*1.4||
    (riverD(x,z)<3.3&&riverD(x,z)>1.6&&(x>OLD.x1||z>OLD.z1))||(Math.abs(x-LAKE.x)<LAKE.rx+2.5&&inLake(x*.94+LAKE.x*.06,z*.9+LAKE.z*.1)&&!inLake(x,z)))&&!newWater(x,z);
  LAYERS.stone=(x,z)=>St(x,z)||inQuarry(x,z);
  LAYERS.dark=(x,z)=>{if(Math.max(B.x0-x,x-B.x1,B.z0-z,z-B.z1)>-1)return true;if(x<=OLD.x1&&z<=OLD.z1)return Dk(x,z)&&!(z>28&&z<40&&x>-16);
    if(onRoad(x,z,0))return false;return (hollowWoods(x,z)&&fbm(x*.2+5,z*.2)>.42)||(southWoods(x,z)&&fbm(x*.18,z*.2+9)>.46);};}
// water you can't walk into
{const _c=collide;collide=function(p,r){_c(p,r);if(p.x>=250||!newWater(p.x,p.z))return;
  for(let rr=.25;rr<3;rr+=.25)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*Math.PI*2)*rr,z=p.z+Math.sin(a/16*Math.PI*2)*rr;if(!newWater(x,z)){p.x=x;p.z=z;return;}}};}
// ---- building the new land
const NEWHOUSES={quill:{spr:'house_c',x:40,z:LANE_E-2},fenn:{spr:'house_b',x:6,z:96},marsh:{spr:'house_a',x:-20,z:LANE_W-2},tithe:{spr:'house_d',x:TITHE.x,z:TITHE.z-1.5},
  thorne:{spr:'house_d',x:156,z:-26},lusk:{spr:'garage',x:200,z:-9.6}};
{const _bw=buildWorld;buildWorld=function(){
  for(const h of Object.values(NEWHOUSES))reserve(h.x-6,h.z-6,h.x+6,h.z+3);
  reserve(28,49,66,68);reserve(-44,49,-6,66);reserve(26,94,42,102);reserve(HOLLOW_TREE.x-5,HOLLOW_TREE.z-5,HOLLOW_TREE.x+5,HOLLOW_TREE.z+5);reserve(TITHE.x-8,TITHE.z-8,TITHE.x+8,TITHE.z+7);
  _bw();
  for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if((o.x>OLD.x1||o.z>OLD.z1)&&(LAYERS.water(o.x,o.z)||onRoad(o.x,o.z,.6)||inQuarry(o.x,o.z))&&/tree|bush|deco|anim/.test(o.kind||'')){OBJ.splice(i,1);}}
  // houses
  for(const [k,h] of Object.entries(NEWHOUSES)){if(k==='lusk')building(h.spr,h.x,h.z,{lit:true});else building(h.spr,h.x,h.z,{lit:k!=='marsh'&&k!=='tithe',jack:k==='quill',porch:k!=='marsh'&&k!=='tithe'});}
  put('gas_pump',196,-7.6,0,{night:'gas_pump_n'});addCircle(195.6,-7.9,.35);addCircle(196.4,-7.9,.35);put('signpost',204,-5,.2,{label:'GAS'});
  building('barn',32,99,{porch:false});obj('blades',38.2,98.2,{kind:'anim',fps:3,yoff:135});put('windpump',38.2,98.2,.45);
  put('footbridge',BRIDGE2.x,BRIDGE2.z,0,{kind:'flat'});
  // the orchard: rows of maples, crates of windfalls
  for(let r=0;r<4;r++)for(let c=0;c<7;c++){const x=30+c*5.4+(r&1)*2.7,z=52+r*4.4;const n=['maple_red','maple_orange','maple_gold'][(r+c)%3];obj(n,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);}
  put('crate',34,49.2,.3);put('crate',35,49.6,.3);put('cart',52,49.5,0);addRect(50.8,48.8,53.2,50);put('hay',58,49.3);addRect(57.2,48.6,58.8,49.6);
  fenceLine(26,48.4,26,68,0);fenceLine(26,68,68,68,0);fenceLine(68,48.4,68,68,0);
  // the Marsh place: the same cabin as yours, abandoned; dead corn in the old fields
  fenceLine(-44,49,-6,49,3);fenceLine(-44,49,-44,66,0);fenceLine(-44,66,-6,66,0);fenceLine(-6,49,-6,66,0);
  for(let r=0;r<5;r++)for(let c=0;c<12;c++){if(rand()<.25)continue;const x=-41+c*3,z=52+r*3;obj('corn_'+(rand()<.6?2:1),x,z,{kind:'deco2'});}
  put('signpost',-12,LANE_W+1.6,.2,{label:'MARSH'});put('well',-30,LANE_W-1,0);addCircle(-30,LANE_W-1.5,1);
  // the quarry
  for(let i=0;i<26;i++){const x=lerp(QUARRY.x0+3,QUARRY.x1-3,rand()),z=lerp(QUARRY.z0+3,QUARRY.z1-3,rand());if(Math.hypot(x-156,z+26)<6||Math.abs(x-146)<2)continue;const s=pick(['rock_0','rock_1','ore_stone','ore_copper','ore_iron','ore_coal']);put(s,x,z,.4);}
  put('cart',140,-21,0);addRect(138.8,-21.6,141.2,-20.4);put('lumber',150,-22);addRect(149.1,-22.5,150.9,-21.8);put('signpost',143.6,-8.4,.2,{label:'QUARRY'});
  // the Black Lake: a dock, a boat, nothing on the far shore
  put('dock',LAKE.x,LAKE.z-LAKE.rz+1.4,0,{kind:'flat'});put('signpost',186.4,-8.4,.2,{label:'BLACK LAKE'});
  // the hollow tree
  obj('deadtree',HOLLOW_TREE.x,HOLLOW_TREE.z,{kind:'tree',solid:1,scale:1.6});addCircle(HOLLOW_TREE.x,HOLLOW_TREE.z,1.1);put('signpost',109.6,-8.4,.2,{label:'HOLLOW WOODS'});
  // the Tithe House: a ring of standing stones in the clearing
  for(let i=0;i<9;i++){const a=i/9*Math.PI*2+.3;const x=TITHE.x+Math.cos(a)*6,z=TITHE.z+1+Math.sin(a)*4.5;if(Math.sin(a)<-.5&&Math.abs(Math.cos(a))<.5)continue;put('grave_'+(i%4),x,z,.35);}
  // Mill Road signs and lamps
  put('signpost',22,24,.2,{label:'MILL ROAD'});for(const z of[34,58,82])lamp(22,z);put('signpost',22.4,LANE_E+1.6,.2,{label:'QUILL ORCHARD'});
  for(const x of [82,118,160,200])lamp(x,-8.4);
  // forests for the new land
  const free=(x,z)=>!onRoad(x,z,1.2)&&!LAYERS.water(x,z)&&!inQuarry(x,z)&&!inLake(x*.85+LAKE.x*.15,z*.8+LAKE.z*.2)&&!BLOCK.some(r=>x>r[0]-1&&x<r[2]+1&&z>r[1]-1&&z<r[3]+1)&&!OBJ.some(o=>o.solid&&Math.abs(o.x-x)<2&&Math.abs(o.z-z)<2);
  let n=0;for(let i=0;i<26000&&n<1100;i++){const x=lerp(OLD.x1-2,B.x1,rand()),z=lerp(B.z0,B.z1,rand());const zx=x>OLD.x1||z>OLD.z1;if(!zx)continue;
    const dense=hollowWoods(x,z)||southWoods(x,z);if(!dense&&rand()>.18)continue;if(!free(x,z))continue;
    const s=dense&&rand()<.75?pick(['pine_0','pine_1','pine_o0','pine_o1']):pick(['maple_orange','maple_red','maple_gold','maple_green']);obj(s,x,z,{kind:'tree',solid:1});addCircle(x,z,.4);n++;}
  for(let i=0;i<9000;i++){const x=lerp(B.x0,B.x1,rand()),z=lerp(B.z0,B.z1,rand());if(x<=OLD.x1&&z<=OLD.z1)continue;if(!free(x,z))continue;if(rand()<.08){obj('bush_'+pick(['green','gold','red']),x,z,{kind:'bush'});addCircle(x,z-.15,.5);}}
  // the world's edges move out with it
  addRect(B.x0-12,B.z1+.5,B.x1+12,B.z1+14);addRect(B.x1+2.5,B.z0-14,B.x1+14,B.z1+14);};}
