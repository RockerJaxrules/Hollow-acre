/* ================= the quarry east of town is worked again: its boulders and veins break with the pickaxe (stone, copper, iron, coal) and
   grow back a few days later. Iron is slow work with Grandpa's old pick, the same as in the mine. ================= */
const QUARRY_ORE={rock_0:'stone',rock_1:'stone',ore_stone:'stone',ore_copper:'copper',ore_iron:'iron',ore_coal:'coal'};
const QROCKS=[];
function quarrySetup(){if(QROCKS.length||typeof QUARRY==='undefined')return;
  for(const o of OBJ){const kind=QUARRY_ORE[o.spr];if(!kind||o.room||o.debris)continue;if(o.x<QUARRY.x0-4||o.x>QUARRY.x1+4||o.z<QUARRY.z0-4||o.z>QUARRY.z1+4)continue;
    const c=circles.find(q=>Math.abs(q.x-o.x)<1e-6&&Math.abs(q.z-(o.z-.1))<1e-6)||null;const q={o,kind,c,hits:0};QROCKS.push(q);
    interact.push({x:o.x,z:o.z,r:.8,on:()=>!o.hide&&!S.room,label:()=>q.kind==='stone'?'Break':'Mine',ok:()=>true,act(){quarryHit(q);}});}
  // a working quarry: always a few veins of each ore among the boulders
  for(const [kind,want] of [['iron',3],['copper',3],['coal',2]]){let have=QROCKS.filter(q=>q.kind===kind).length;for(const q of QROCKS){if(have>=want)break;if(q.kind!=='stone')continue;q.kind=kind;q.o.spr='ore_'+kind;have++;}}}
function quarryHit(q){if(P.anim)return;const o=q.o;if(!spend(pickCost()))return;faceTo(o.x,o.z);
  startAnim('pick',.55,null,()=>{q.hits++;SFX.thud(0,.35);burst(o.x,o.z,12,q.kind==='copper'?'#c87a40':q.kind==='iron'?'#b8a090':q.kind==='coal'?'#2a2a2a':'#8a8690',1.4,.7,2);
    const need=Math.max(1,(ORE_HITS[q.kind]||1)-(toolLv('pick')-1))+(q.kind==='iron'&&S.tools.pick<2?1:0);
    if(q.kind==='iron'&&S.tools.pick<2&&q.hits===1&&!S.first.ironSlow){S.first.ironSlow=1;toast('Iron is tough. Keep swinging: Grandpa’s old pick breaks it in four.',3);}
    if(q.hits<need){if(need>2)toast(`${ITEMS[q.kind]?ITEMS[q.kind].name:'Rock'}: cracking ${q.hits}/${need}`,.7);return;}q.hits=0;o.hide=true;o.goneDay=S.day;if(q.c){const k=circles.indexOf(q.c);if(k>=0)circles.splice(k,1);}
    addInv('stone',1+(rand()<.4?1:0));if(q.kind!=='stone')addInv(q.kind,1+(rand()<.35?1:0));toast(q.kind==='stone'?'+stone':`+${ITEMS[q.kind].name.toLowerCase()}`,1);updateHud&&updateHud();});}
// the world is built after the scripts load, so set up once it exists
{const _b=buildWorld;buildWorld=function(){_b.apply(this,arguments);quarrySetup();};}
// what you broke is back three days later (if nothing is standing on it)
{const _nd=newDay;newDay=function(m,p){_nd(m,p);for(const q of QROCKS){const o=q.o;if(!o.hide||o.goneDay==null||S.day-o.goneDay<3)continue;if(Math.hypot(P.x-o.x,P.z-o.z)<1.2)continue;
  o.hide=false;o.goneDay=null;if(q.c&&!circles.includes(q.c))circles.push(q.c);}};}
// saved with the game: which quarry rocks are broken, and since when
{const _sd=saveData;saveData=function(mid){const d=_sd(mid);d.quarry=QROCKS.map(q=>q.o.hide?(q.o.goneDay==null?0:q.o.goneDay):-1);return d;};}
{const _lg=loadGame;loadGame=function(d){_lg(d);quarrySetup();if(Array.isArray(d.quarry))d.quarry.forEach((g,i)=>{const q=QROCKS[i];if(!q||g<0)return;q.o.hide=true;q.o.goneDay=g;if(q.c){const k=circles.indexOf(q.c);if(k>=0)circles.splice(k,1);}});};}

/* ================= fish you can eat: raw from the basket for a little, or pan-fried at the stove for a proper meal ================= */
RAW.fish=[12,3];
if(typeof PRODUCE_NAMES!=='undefined')PRODUCE_NAMES.fish=PRODUCE_NAMES.fish||'Fish';
ITEMS.fish_fried={name:'Pan-fried fish',food:[45,15],desc:'Crisp skin, a squeeze of something sharp. +45 energy, +15 health.'};
if(!RECIPES.some(r=>r[0]==='fish_fried'))RECIPES.push(['fish_fried',{fish:1},'Pan-fried fish']);
if(typeof SELL!=='undefined')SELL.fish_fried=34;
if(typeof CG2_STEPS!=='undefined')CG2_STEPS['cook:fish_fried']=[{m:'marks',tool:'knife',items:['fish','fish'],t:'Gut and scale it'},{m:'gauge',art:'fishflip',t:'Turn it when the skin crisps',zone:.1}];
if(typeof CG2_ART!=='undefined')CG2_ART.fish=['#c8d8d0','#6a8a7a'];
