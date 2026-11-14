/* ================= #233 more to grow, and more to farming. Six new crops beside turnips, pumpkins and corn: potatoes,
   carrots, cabbages, barley, hops and grapes. Their stages, produce icons and seed packets are drawn in
   tools/px/crops_more.py with the same kit as the turnip (shaped leaves, a full value range, a soft contact shadow, a dark
   line where leaves overlap) and packed with the other crops. Hops climb a pole and grapes a trellis, and both come back
   after picking, so a row of them keeps giving. Barley, hops, grapes, potatoes and corn are what the brewing and the still
   are fed with. Their seeds are sold by Caitlyn and at Bell's Feed & Stock. Underneath: crops that never went thirsty can
   come out fine or prize, and after the story each crop has its seasons. =========================================== */
const CROP2={potato:{name:'Potato',grow:20,sell:14,raw:[9,1],seed:18,shop:'mae'},carrot:{name:'Carrot',grow:14,sell:9,raw:[7,0],seed:12,shop:'mae'},
  cabbage:{name:'Cabbage',grow:26,sell:22,raw:[10,2],seed:22,shop:'mae'},barley:{name:'Barley',grow:16,sell:8,raw:null,seed:10,shop:'v_feed'},
  hops:{name:'Hops',grow:24,sell:12,raw:null,seed:26,shop:'v_feed',regrow:2},grapes:{name:'Grapes',grow:30,sell:20,raw:[6,2],seed:34,shop:'v_feed',regrow:2}};
for(const [id,C] of Object.entries(CROP2)){if(SEEDS[id])continue;SEEDS[id]={name:C.name,grow:C.grow,sell:C.sell};if(S.seeds[id]===undefined)S.seeds[id]=0;
  if(typeof RAW!=='undefined'&&C.raw)RAW[id]=C.raw;if(typeof PRODUCE_NAMES!=='undefined')PRODUCE_NAMES[id]=C.name;}
// seeds for sale
for(const [id,C] of Object.entries(CROP2)){const v=vendors[C.shop];if(!v)continue;const _r=v.rows;v.rows=()=>{const r=_r();
  r.push({k:'seed_'+id,name:`${C.name} seed ×5`,desc:`${C.name}: grows in ${C.grow} hours of care${C.regrow?', and comes back after every picking':''}. Ships for about ${C.sell}.${['barley','hops','grapes','potato'].includes(id)?' Good for brewing.':''}`,price:C.seed,can:true,buy(){S.seeds[id]=(S.seeds[id]||0)+5;updateHud&&updateHud();}});return r;};}

// ---- depth. A crop remembers every day it went thirsty. At harvest it can come out fine (×1.25) or prize (×1.6): better the
// higher your farming, and a crop that was never left dry is the only kind that can be prize.
const CQ={1:{n:'fine',m:1.25,col:'#d8d8e0'},2:{n:'prize',m:1.6,col:'#f0c850'}};
function cropQuality(c){const L=typeof skLvl==='function'?skLvl('farming'):0,d=c.dry||0,r=rand();const prize=d?0:.05+L*.015,fine=Math.max(0,.16+L*.03-d*.06);return r<prize?2:r<prize+fine?1:0;}
{const _nd=newDay;newDay=function(){try{for(const t of tiles){const c=t.crop;if(c&&c.stage<3&&!c.watered&&!t.gh)c.dry=(c.dry||0)+1;}}catch(e){}return _nd.apply(this,arguments);};}
function c2whenPicked(t,c,fn){let n=0;const iv=setInterval(()=>{if(t.crop!==c){clearInterval(iv);try{fn();}catch(e){}}else if(++n>80)clearInterval(iv);},100);}
{const _dh=doHarvest;doHarvest=function(t){const c=t&&t.crop;const r=_dh.apply(this,arguments);if(!c||c.stage<3)return r;
  c2whenPicked(t,c,()=>{let b=null;for(let i=S.basket.length-1;i>=0;i--){const q=S.basket[i];if(q.kind===c.type&&q.q===undefined){b=q;break;}}
    if(b){b.q=cropQuality(c);if(b.q){b.value=Math.round(b.value*CQ[b.q].m);toast(`${b.q===2?'A prize':'A fine'} ${(PRODUCE_NAMES[c.type]||c.type).toLowerCase()}.${b.q===2?' Never once went thirsty.':''}`,1.8);burst(t.x,t.z,b.q===2?16:9,CQ[b.q].col,1.2,.7,2);}}
    const C=CROP2[c.type];if(C&&C.regrow&&!t.crop){t.crop={type:c.type,stage:C.regrow,growth:C.regrow*SEEDS[c.type].grow,watered:false,pop:0,dry:c.dry||0};}
    if(C)setTimeout(()=>{if(P.hold&&P.hold.spr===c.type+'_3'&&SPR['icon32_'+c.type])P.hold.spr='icon32_'+c.type;},380);});return r;};}
// ---- seasons. The valley's October takes anything you plant. After the story the year turns, and each crop has its months:
// out of season (and outside the greenhouse) it grows at half speed.
const CROP_SEASONS={turnip:['spring','fall'],pumpkin:['fall'],corn:['summer','fall'],potato:['spring','fall'],carrot:['spring','summer'],cabbage:['spring','fall'],
  barley:['spring','summer','fall'],hops:['spring','summer'],grapes:['summer','fall']};
const cropInSeason=(k,sea)=>{sea=sea||(typeof seasonNow==='function'?seasonNow():'october');return sea==='october'||!CROP_SEASONS[k]||CROP_SEASONS[k].includes(sea);};
{const _u=update;update=function(dt){const sea=typeof seasonNow==='function'?seasonNow():'october';if(sea==='october'||sea==='winter'){_u(dt);return;}
  const slow=[];for(const t of tiles){const c=t.crop;if(c&&!t.gh&&c.stage<3&&c.watered&&!cropInSeason(c.type,sea))slow.push([c,c.growth]);}
  _u(dt);for(const [c,g0] of slow){const d=c.growth-g0;if(d>0&&d<5){c.growth-=d*.5;const ns=Math.min(3,Math.floor(c.growth/SEEDS[c.type].grow));if(ns<c.stage)c.stage=ns;}}};}
// ---- the backpack says how many are fine or prize, and (after the story) when a seed likes to go in
{const _ii=itemInfo;itemInfo=function(key){const o=_ii.apply(this,arguments);try{if(!o)return o;
  if(o.type==='P'&&SEEDS[o.id]){const f=S.basket.filter(b=>b.kind===o.id&&b.q===1).length,p=S.basket.filter(b=>b.kind===o.id&&b.q===2).length;if(f||p)o.desc=(o.desc||'')+` ${[p?p+' prize':'',f?f+' fine':''].filter(Boolean).join(', ')}.`;}
  if(o.type==='S'&&S.st&&S.st.done&&CROP_SEASONS[o.id])o.desc+=` In season: ${CROP_SEASONS[o.id].join(' and ')}${cropInSeason(o.id)?' (now)':''}.`;
  if(o.type==='S'&&CROP2[o.id]&&CROP2[o.id].regrow)o.desc+=' Comes back after every picking.';}catch(e){}return o;};}
// ---- when the seed you're holding runs out, any other seed in your pocket will do
{const _cc=computeContext;computeContext=function(){const r=_cc.apply(this,arguments);try{if(r&&r.label==='No seeds'){const k=Object.keys(SEEDS).find(q=>(S.seeds[q]||0)>0),t=targetTile();
  if(k&&t&&t.tilled&&!t.crop)return {label:'Plant '+SEEDS[k].name,ok:true,act:()=>{S.sel=k;doPlant(t);}};}}catch(e){}return r;};}
// ---- the farming skill counts them, and the Grange market prices them
if(typeof SK_CROP!=='undefined')Object.assign(SK_CROP,{potato:9,carrot:7,cabbage:12,barley:6,hops:8,grapes:11});
if(typeof MK_K!=='undefined'){Object.assign(MK_K,{corn:12,potato:14,carrot:16,cabbage:10,barley:20,hops:14,grapes:10});Object.assign(MK_BASE,{corn:24,potato:14,carrot:9,cabbage:22,barley:8,hops:12,grapes:20});
  const B=n=>MK_BUYERS.find(b=>b[0]===n);B('Coyle’s store')&&B('Coyle’s store')[1].push('potato','carrot','cabbage','corn');B('The Lamplighter')&&B('The Lamplighter')[1].push('barley','hops','grapes','cabbage');}
