/* ================= workbenches: farming, weapons, armour, furniture, plus the furnace and the stove. All built from wood; wood and coal are fuel ================= */
Object.assign(ITEMS,{copper_bar:{name:'Copper bar',icon:'ore_copper'},iron_bar:{name:'Iron bar',icon:'ore_iron'},fert:{name:'Bone meal',icon:'icon_seed'}});
S.benches=S.benches||{};S.gear=S.gear||{weapon:null,armor:null};S.furn=S.furn||[];
const WEAPONS={club:['Oak club',1],sickle:['Copper sickle',2],machete:['Iron machete',3]};
const ARMORS={jacket:['Waxed work jacket',.15,10],coat:['Copper-riveted coat',.3,25],mail:['Iron mail shirt',.45,45]};
const fuel=()=>inv('coal')>0?{coal:1}:{wood:2};
const fuelTxt=()=>inv('coal')>0?'1 coal':'2 wood';
const BENCHES=[['farm','bench_farm','Farming bench',{wood:15},'Seed trays, sprinklers and bone meal.'],['furnace','furnace','Furnace',{stone:25,wood:10},'Smelts ore into bars. Burns wood or coal.'],
  ['weapon','bench_weapon','Weapon bench',{wood:20,stone:6},'Clubs and blades, for what lives below the farm.'],['armor','bench_armor','Armour bench',{wood:20,fiber:10},'Coats and mail. Something to stand between you and the teeth.'],
  ['furn','bench_furn','Furniture bench',{wood:25},'Make Grandpa’s cabin into a place you can live.']];
// the yard behind the woodpile: find a clear spot for each bench, near the cabin but off the path to the door
const BENCH_POS={};
function benchSpot(i){const tries=[];for(let r=0;r<40;r++)for(let a=0;a<12;a++){const x=3+Math.cos(a/12*6.28)*(1+r*.4),z=-4.5+Math.sin(a/12*6.28)*(1+r*.3);tries.push([x,z]);}
  for(const [x,z] of tries){if(Math.hypot(x-doorPos.x,z-doorPos.z)<2.6)continue;if(x>FIELD.x0-1&&x<FIELD.x0+FIELD.w+1&&z>FIELD.z0-1.5&&z<FIELD.z0+FIELD.h+1)continue;
    if(terr(x,z)!=='grass'||terr(x-1,z)!=='grass'||terr(x+1,z)!=='grass'||terr(x,z+1)!=='grass')continue;if(OBJ.some(o=>!o.hide&&!['deco','anim','flat','grass'].includes(o.kind)&&Math.abs(o.x-x)<1.8&&Math.abs(o.z-z)<1.3))continue;
    if(Object.values(BENCH_POS).some(p=>Math.hypot(p.x-x,p.z-z)<2.2))continue;if(rects.some(R=>x>R.x0-1&&x<R.x1+1&&z>R.z0-.6&&z<R.z1+.6)||circles.some(c=>Math.hypot(c.x-x,c.z-z)<c.r+1))continue;if(OBJ.some(o=>o.debris&&!o.hide&&Math.hypot(o.x-x,o.z-z)<1.2))continue;return {x,z};}return {x:6+i*2,z:-5};}
function placeBench(k){const d=BENCHES.find(b=>b[0]===k);const p=BENCH_POS[k]||(BENCH_POS[k]=benchSpot(BENCHES.indexOf(d)));obj(d[1],p.x,p.z,{kind:'prop'});addRect(p.x-.8,p.z-.45,p.x+.8,p.z);
  interact.push({x:p.x,z:p.z+.4,r:1.2,label:()=>d[2].split(' ')[0],ok:()=>true,act(){openShop('b_'+k);}});}
{const _pl3=vendors.plans.rows;vendors.plans.rows=()=>{const r=_pl3();for(const [k,spr,name,need,desc] of BENCHES)r.push({k:'bench_'+k,name,desc:S.benches[k]?'Built, in the yard by the woodpile.':desc,price:0,can:!S.benches[k],need,btn:'Build',
  buy(){S.benches[k]=true;placeBench(k);toast(`You knock the ${name.toLowerCase()} together out of Grandpa’s timber.`,2.4);}});return r;};}
// ---- the furnace: ore + fuel -> bars
vendors.b_furnace={name:'Furnace',sub:'It roars when you feed it. Sometimes it roars when you don’t.',rows:()=>[
  {k:'cb',name:'Copper bar',desc:`3 copper ore + ${fuelTxt()}.`,price:0,can:true,need:Object.assign({copper:3},fuel()),btn:'Smelt',buy(){addInv('copper_bar');SFX.refill();}},
  {k:'ib',name:'Iron bar',desc:`3 iron ore + ${fuelTxt()}.`,price:0,can:true,need:Object.assign({iron:3},fuel()),btn:'Smelt',buy(){addInv('iron_bar');SFX.refill();}},
  {k:'ch',name:'Charcoal',desc:'5 wood burned slow into 1 coal. Better fuel.',price:0,can:true,need:{wood:5},btn:'Burn',buy(){addInv('coal');}}]};
// ---- farming bench
vendors.b_farm={name:'Farming bench',sub:'Grandpa’s seed trays are still labelled. One label just says NO.',rows:()=>[
  {k:'spr',name:'Brass sprinkler',desc:`Waters a patch every morning. ${S.sprinklers||0}/4.`,price:0,can:(S.sprinklers||0)<4,need:{copper_bar:1,iron_bar:1,wood:3},btn:'Make',buy(){S.sprinklers=(S.sprinklers||0)+1;}},
  {k:'fert',name:'Bone meal ×3',desc:'Sprinkle on a crop: it jumps a stage overnight. Don’t ask where Grandpa got the bones.',price:0,can:true,need:{fiber:4,stone:2},btn:'Make',buy(){addInv('fert',3);}},
  {k:'ts',name:'Turnip seeds ×4',desc:'Dry your own seed from the harvest.',price:0,can:basketCount('turnip')>0,need:{fiber:1},btn:'Make',buy(){takeBasket('turnip',1);S.seeds.turnip+=4;}},
  {k:'ps',name:'Pumpkin seeds ×3',desc:'Scoop them out of a pumpkin.',price:0,can:basketCount('pumpkin')>0,need:{},btn:'Make',buy(){takeBasket('pumpkin',1);S.seeds.pumpkin+=3;}},
  {k:'charm',name:'Straw charm',desc:'Hang it by the field. The crows keep away.',price:0,can:true,need:{fiber:6,wood:2},btn:'Make',buy(){S.charm=(S.charm||0)+1;}}]};
// bone meal on a growing crop
{const _cc2=computeContext;computeContext=function(){const c=_cc2();if(c.label&&/^Growing/.test(c.label)&&inv('fert')>0){const t=targetTile();if(t&&t.crop&&t.crop.stage<3)return {label:'Bone meal',ok:true,act(){takeInv('fert');t.crop.growth=(t.crop.stage+1)*SEEDS[t.crop.type].grow;t.crop.stage++;burst(t.x,t.z,10,'#e8e0cc',1,.6,2);SFX.plant();}};}return c;};}
// ---- weapon bench
vendors.b_weapon={name:'Weapon bench',sub:'Hollis says a blade won’t help you up top. He says it like he’s tried.',rows:()=>[
  {k:'club',name:'Oak club',desc:'Hits once. Better than your fists.',price:0,can:S.gear.weapon!=='club',need:{wood:8},btn:'Make',buy(){S.gear.weapon='club';}},
  {k:'sickle',name:'Copper sickle',desc:'Hits twice as hard. Also cuts weeds in one pull.',price:0,can:S.gear.weapon!=='sickle',need:{copper_bar:2,wood:3},btn:'Make',buy(){S.gear.weapon='sickle';}},
  {k:'machete',name:'Iron machete',desc:'Three times as hard. The things below learn to keep their distance.',price:0,can:S.gear.weapon!=='machete',need:{iron_bar:3,wood:3},btn:'Make',buy(){S.gear.weapon='machete';}}]};
// ---- armour bench
vendors.b_armor={name:'Armour bench',sub:'The dress form has your measurements pinned to it. You never gave them to anyone.',rows:()=>Object.entries(ARMORS).map(([k,[name,red,hp]],i)=>({k,name,desc:`Takes ${Math.round(red*100)}% off every bite. +${hp} max health.`,price:0,can:S.gear.armor!==k,need:[{fiber:10,wood:4},{copper_bar:3,fiber:4},{iron_bar:4,copper_bar:1}][i],btn:'Make',
  buy(){S.gear.armor=k;S.hpMax=100+hp;S.hp=Math.min(S.hpMax,S.hp+hp);}}))};
{const _h=hurt;hurt=function(n,why){const a=S.gear.armor&&ARMORS[S.gear.armor];_h(Math.round(n*(1-(a?a[1]:0))),why);};}
// ---- furniture bench: each piece goes into the cabin
const FURN={chair:['Rocking chair','in_chair',{wood:8},[2.4,4.4],'flat'],lamp:['Oil lamp','lamp',{wood:4,copper_bar:1},[.7,1.2],null],shelf:['Bookshelf','in_shelf_jars',{wood:12},[7.0,.62],null],
  rug:['Braided rug','in_rug',{fiber:12},[6.4,5.2],'flat'],pumpkin:['Carved pumpkin','jack_b',{wood:1},[8.5,2.8],null],crates:['Storage crates','in_crates',{wood:10},[8.0,4.9],null]};
vendors.b_furn={name:'Furniture bench',sub:'The cabin will feel less like his and more like yours.',rows:()=>Object.entries(FURN).map(([k,[name,spr,need]])=>({k,name,desc:S.furn.includes(k)?'In the cabin.':'Goes straight into Grandpa’s cabin.',price:0,can:!S.furn.includes(k)&&(k!=='pumpkin'||basketCount('pumpkin')>0),need,btn:'Make',
  buy(){if(k==='pumpkin')takeBasket('pumpkin',1);S.furn.push(k);placeFurn(k);toast(`You carry the ${name.toLowerCase()} into the cabin.`,2);}}))};
function placeFurn(k){const [name,spr,need,[lx,lz],kind]=FURN[k];const R=ROOMS.cabin;const o=obj(spr,R.ox+lx,R.oz+lz,{kind:kind||'furn',room:'cabin',glow:k==='pumpkin'?1:0,night:SPR[spr+'_n']?spr+'_n':null});
  if(!kind)addCircle(o.x,o.z-.15,.35);if(k==='lamp')S.cabinLamp=true;}
// furniture makes the cabin calmer
{const _u5=update;update=function(dt){_u5(dt);if(S.room==='cabin'&&S.mode==='play')M.v=Math.min(100,M.v+S.furn.length*.04*dt);};}
{const _il=interiorLight;interiorLight=function(L){_il(L);if(S.room==='cabin'&&S.cabinLamp){const R=ROOMS.cabin;glowAt(sx(R.ox+.7),sz(R.oz+1.2)-60,120,[255,190,110],.8*L);}};}
// ---- the stove now burns fuel too
{const _cook=vendors.cook.rows;vendors.cook.rows=()=>_cook().map(r=>Object.assign(r,{need:fuel(),desc:r.desc+` Burns ${fuelTxt()}.`}));}
// ---- fighting in the mine: if something is close in front of you, the big button strikes
function mobAhead(){if(S.room!=='mine')return null;let best=null,bd=1.4;for(const m of MINE.mobs){if(m.dead)continue;const d=Math.hypot(m.x-P.x,m.z-P.z);const dot=((m.x-P.x)*P.fx+(m.z-P.z)*P.fz)/(d||1);if(d<bd&&(d<.7||dot>.2)){bd=d;best=m;}}return best;}
{const _cc3=computeContext;computeContext=function(){const m=mobAhead();if(m)return {label:S.gear.weapon?'Strike':'Shove',ok:true,act(){if(P.anim)return;if(!spend(2))return;faceTo(m.x,m.z);startAnim(S.gear.weapon?'axe':'grab',.4,null,()=>{
  const dmg=S.gear.weapon?WEAPONS[S.gear.weapon][1]:.5;m.hp=(m.hp===undefined?2+Math.floor(S.mineFloor/4):m.hp)-dmg;m.stun=1.2;m.x+=(m.x-P.x)*1.2;m.z+=(m.z-P.z)*1.2;SFX.thud(0,.5);burst(m.x,m.z,10,'#2a1a1a',1.2,.8,3);cam.shake=Math.max(cam.shake,.15);
  if(m.hp<=0){m.dead=true;SFX.shriek(0);burst(m.x,m.z,20,'#120808',1.8,1,4);if(rand()<.4)addInv('coal');if(rand()<.08+S.mineFloor*.01)addInv('gem');toast(['It comes apart like wet paper.','It stops moving. It was wearing a child’s mitten.','Quiet again. Too quiet.'][(rand()*3)|0],2,true);}});}};return _cc3();};}
{const _mu=mineUpdate;mineUpdate=function(dt){MINE.mobs=MINE.mobs.filter(m=>!m.dead);_mu(dt);};}
function benchesBoot(){for(const [k] of BENCHES)if(S.benches[k])placeBench(k);for(const k of S.furn)placeFurn(k);}
