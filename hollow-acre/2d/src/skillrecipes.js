/* ================= #236 recipes you learn as your skills grow. The basics are there from the start (and nothing the story
   needs is ever locked); the better things come with practice: a pie at Farming 3, the iron bar at Mining 1, a machete at
   Combat 5, a bookshelf at Foraging 3. A locked recipe still shows in the list, greyed, saying what it waits for, and
   reaching the level says what you've learned and where to make it. ===================================== */
const RECIPE_LV={'cook:egg_fried':['farming',1],'cook:fish_fried':['fishing',1],'cook:chowder':['fishing',2],'cook:pie':['farming',3],'cook:hash':['farming',4],'cook:glowstew':['foraging',5],
  'craft:scare':['farming',1],'craft:sprinkler':['farming',2],
  'b_furnace:ch':['mining',1],'b_furnace:ib':['mining',1],
  'b_weapon:sickle':['combat',2],'b_weapon:machete':['combat',5],'b_armor:coat':['combat',3],'b_armor:mail':['combat',6],
  'b_farm:fert':['farming',1],'b_farm:spr':['farming',2],'b_farm:charm':['farming',4],
  'b_furn:lamp':['foraging',1],'b_furn:crates':['foraging',2],'b_furn:rug':['farming',2],'b_furn:shelf':['foraging',3],
  'cook:dye_black':['mining',1],'cook:dye_white':['mining',1],'cook:dye_blue':['mining',2],'cook:dye_purple':['farming',2],'cook:dye_red':['foraging',2]};
const RECIPE_WHERE={cook:'Grandpa’s stove',craft:'the workbench',b_furnace:'the furnace',b_weapon:'the weapon bench',b_armor:'the armour bench',b_farm:'the farm bench',b_furn:'the furniture bench'};
const skName=k=>(SKILLS[k]&&SKILLS[k].name)||k[0].toUpperCase()+k.slice(1);
for(const v of Object.keys(RECIPE_WHERE)){if(!vendors[v])continue;const _r=vendors[v].rows;vendors[v].rows=function(){return _r.apply(this,arguments).map(r=>{const q=RECIPE_LV[v+':'+r.k];if(!q||skLvl(q[0])>=q[1])return r;
  return Object.assign({},r,{can:false,locked:q,desc:`Learned at ${skName(q[0])} level ${q[1]} (you’re ${skLvl(q[0])}). `+(r.desc||'')});});};}
// reaching a level: what you've learned, and where
{const _lu=levelUp;levelUp=function(k,l){const r=_lu.apply(this,arguments);try{const got=[];for(const [key,[sk,lv]] of Object.entries(RECIPE_LV)){if(sk!==k||lv!==l)continue;const [v,id]=key.split(':');
    const row=(vendors[v]&&vendors[v].rows().find(q=>q.k===id))||null;got.push(`${row?row.name:id} (${RECIPE_WHERE[v]})`);}
  if(got.length)setTimeout(()=>toast(`${skName(k)} ${l}: you can make ${got.join(', ')} now.`,4.6),1800);}catch(e){}return r;};}
// the craft list marks what's still to learn
{const css=document.createElement('style');css.textContent='#craft .crlock{position:absolute;right:3px;top:2px;font-size:10px;opacity:.85}';document.head.appendChild(css);}
