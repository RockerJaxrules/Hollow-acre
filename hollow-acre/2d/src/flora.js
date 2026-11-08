/* ================= more trees and bushes. The valley's woods stop being only maples and pines: oaks (russet and green) and birches
   (gold and green) mix in through the woods, weeping willows lean over the lake, the river and the pond, spruces stand among
   the pines, Quill Orchard grows real apple trees (red and gold), and the Hollow Woods have dead oaks and broken snags. The
   bushes get holly, juniper, elderberry and sumac; bracken grows under the trees and cattails along the shores (you walk
   through those). Which tree is which comes from where it stands, never from the dice, so every farmer in a shared game
   sees the same woods. The farm, the town square and Wickham keep the trees they were drawn with. ================= */
const FLORA_TREES=new Set(['oak_russet','oak_green','birch_gold','birch_green','willow','spruce_0','spruce_1','apple_tree','apple_gold','deadoak','snag']);
const floraH=(x,z,s)=>{const v=Math.sin(x*12.9898+z*78.233+(s||0)*37.719)*43758.5453;return v-Math.floor(v);};
Object.assign(TREE_COL,{oak_russet:['#7a3214','#c8642a'],oak_green:['#3a5a20','#7aa040'],birch_gold:['#a07818','#f0c040'],birch_green:['#6a7a24','#c0c850'],willow:['#6a7a2a','#b8c058'],
  spruce_0:['#1d3a34','#3e6e60'],spruce_1:['#22402e','#4a7454'],apple_tree:['#4a6020','#8aa040'],apple_gold:['#7a7020','#c8b848'],deadoak:['#3a322c','#7a6e62'],snag:['#5a564e','#a8a296']});
{const _bw=buildWorld;buildWorld=function(){_bw();if(!SPR.oak_russet)return;
  const kept=(x,z)=>Math.hypot(x,z+10)<24||Math.hypot(x-48,z+6)<24||(typeof inWick==='function'&&inWick(x,z))||Math.hypot(x-HOLLOW_TREE.x,z-HOLLOW_TREE.z)<4||Math.hypot(x-TITHE.x,z-TITHE.z)<10;
  const nearWater=(x,z,r)=>{for(let a=0;a<6.28;a+=.785)if(LAYERS.water(x+Math.cos(a)*r,z+Math.sin(a)*r))return true;return false;};
  const orchard=(x,z)=>x>28&&x<66&&z>50&&z<67;
  const hollow=(x,z)=>x>78&&x<136&&Math.abs(z+6)>3.2;
  for(const o of OBJ){if(o.hide||o.room||o.x>=250||!o.spr)continue;const h=floraH(o.x,o.z,1);
    if(o.kind==='tree'&&o.spr.startsWith('maple')){
      if(orchard(o.x,o.z)){o.spr=floraH(o.x,o.z,2)<.7?'apple_tree':'apple_gold';continue;}
      if(kept(o.x,o.z))continue;
      if(nearWater(o.x,o.z,3.4)){if(h<.55)o.spr='willow';continue;}
      if(hollow(o.x,o.z)){o.spr=h<.2?'deadoak':h<.3?'snag':h<.5?'birch_gold':o.spr;continue;}
      o.spr=h<.13?'oak_russet':h<.22?'oak_green':h<.34?'birch_gold':h<.4?'birch_green':o.spr;continue;}
    if(o.kind==='tree'&&/^pine_/.test(o.spr)){if(kept(o.x,o.z))continue;o.spr=h<.28?'spruce_0':h<.42?'spruce_1':o.spr;continue;}
    if(o.kind==='bush'&&/^bush_/.test(o.spr)){if(kept(o.x,o.z))continue;o.spr=h<.14?'holly':h<.25?'juniper':h<.35?'elder':h<.43?'sumac':o.spr;}}
  // ---- plants you walk through: bracken under the trees, cattails at the water's edge
  const G=new Map();const cell=(x,z)=>Math.floor(x/2)+','+Math.floor(z/2);
  for(const o of OBJ){if(o.hide||o.room||o.x>=250)continue;if(!['tree','pine','bld','prop','fence','lamp','bush','wreck','well','plant'].includes(o.kind)&&!o.solid)continue;const k=cell(o.x,o.z);(G.get(k)||G.set(k,[]).get(k)).push(o);}
  const clear=(x,z,r)=>{if(LAYERS.water(x,z)||onRoad(x,z,1)||kept(x,z)||(typeof inQuarry==='function'&&inQuarry(x,z)))return false;
    for(const b of BLOCK)if(x>b[0]-.5&&x<b[2]+.5&&z>b[1]-.5&&z<b[3]+.5)return false;
    for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const L=G.get((Math.floor(x/2)+i)+','+(Math.floor(z/2)+j));if(L)for(const o of L)if(Math.abs(o.x-x)<r&&Math.abs(o.z-z)<r*.8)return false;}return true;};
  const plant=(spr,x,z)=>{const e=obj(spr,x,z,{kind:'plant'});const k=cell(x,z);(G.get(k)||G.set(k,[]).get(k)).push(e);return e;};
  let ferns=0,reeds=0;
  for(const o of OBJ.slice()){if(o.kind!=='tree'||o.hide||o.room||o.x>=250||o.x<-80)continue;if(floraH(o.x,o.z,3)>.42)continue;
    const x=o.x+(floraH(o.x,o.z,4)-.5)*3.2,z=o.z+.9+floraH(o.x,o.z,5)*.9;if(!clear(x,z,1.1))continue;plant(floraH(o.x,o.z,6)<.68?'fern':'fern_green',x,z);ferns++;}
  // now and then a weeping willow leans over the water, a couple of steps back from the edge
  let willows=0;const shore=(x,z,ax,az)=>{if(ax!==undefined&&floraH(x,z,11)<.3){const wx=x+ax*1.8,wz=z+az*1.8;if(clear(wx,wz,2.3)&&!nearRoad(wx,wz)){const e=obj('willow',wx,wz,{kind:'tree',solid:1});addCircle(wx,wz,.45);const k=cell(wx,wz);(G.get(k)||G.set(k,[]).get(k)).push(e);willows++;return;}}
    if(!clear(x,z,1))return;plant('reeds',x,z);reeds++;};
  const nearRoad=(x,z)=>onRoad(x,z,2.2);
  // the Black Lake, all the way round (not on the dock)
  for(let a=0;a<6.28;a+=.11){if(floraH(a,1,7)>.6)continue;let f=.85;while(f<1.4&&LAYERS.water(LAKE.x+Math.cos(a)*LAKE.rx*f,LAKE.z+Math.sin(a)*LAKE.rz*f))f+=.02;
    const x=LAKE.x+Math.cos(a)*LAKE.rx*f,z=LAKE.z+Math.sin(a)*LAKE.rz*f;if(Math.abs(x-LAKE.x)<3&&z<LAKE.z)continue;shore(x,z,Math.cos(a),Math.sin(a));}
  // the river's banks
  for(let i=0;i<RIVER.length-1;i++){const [a,b]=RIVER[i],[c,d]=RIVER[i+1];const L=Math.hypot(c-a,d-b),nx=-(d-b)/L,nz=(c-a)/L;
    for(let t=0;t<L;t+=1.6){if(floraH(t,i,8)>.45)continue;const px=a+(c-a)*t/L,pz=b+(d-b)*t/L;for(const side of [-1,1]){let k=1.6;while(k<4&&LAYERS.water(px+nx*k*side,pz+nz*k*side))k+=.2;shore(px+nx*k*side,pz+nz*k*side,nx*side,nz*side);}}}
  // the pond (clear of its dock and the footbridge)
  for(let a=0;a<6.28;a+=.3){if(floraH(a,2,9)>.55)continue;const x=pond.x+Math.cos(a)*(pond.r+.7),z=pond.z+Math.sin(a)*(pond.r+.7);if(Math.abs(x-pond.x)<2.2&&z<pond.z)continue;shore(x,z,Math.cos(a),Math.sin(a));}
  FLORA_STATS={ferns,reeds,willows};};}
let FLORA_STATS=null;
// the new trees carry their own soft shadow in the art: at night they don't need the old flat one too; ferns and reeds get only the sun's
{const _cs=castShadow;castShadow=function(o,X,Y){if(o.kind==='plant'){sunShadow(o,X,Y);return;}
  if(FLORA_TREES.has(o.spr)){if(sunShadow(o,X,Y)){ctx2.fillStyle='rgba(8,16,6,.22)';ctx2.beginPath();ctx2.ellipse(X+2,Y+1,9,3,0,0,Math.PI*2);ctx2.fill();}return;}
  if(o.kind==='bush'&&!o.spr.startsWith('bush_')){sunShadow(o,X,Y);return;}return _cs(o,X,Y);};}
