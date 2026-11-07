/* ================= progression: the Ward (six bundles kept at the church that gate the story) and Mae's lessons (one long,
   guided tutorial that walks you through every system the farm has, with a reward for each). ================= */
// ---------- the Ward
const WARD=[
  {k:'field',name:'The Field',need:[['b','turnip',10,'turnips'],['b','pumpkin',5,'pumpkins'],['b','corn',4,'corn']],coins:120,
   text:'Hale lays the harvest on the altar and lights it. The smoke doesn’t rise. It goes sideways, out of the door, down toward the Mill Road, like something breathing it in.'},
  {k:'timber',name:'Timber & Stone',need:[['i','wood',50,'wood'],['i','stone',50,'stone'],['i','fiber',20,'fiber']],coins:100,
   text:'Hale stacks the timber against the church wall, under the bell. “For the doors,” he says. “Every door in the valley gets mended before the drawing. Nobody remembers why.”'},
  {k:'deep',name:'The Deep',need:[['i','copper_bar',4,'copper bars'],['i','iron_bar',2,'iron bars'],['i','coal',8,'coal']],coins:150,
   text:'Hale melts the bars into the church’s nails. Every one comes out of the mould already bent, as if something had been pulling on it.'},
  {k:'water',name:'The Water',need:[['f',4,'kinds of fish caught']],coins:140,
   text:'You tell Hale about every fish you caught. He writes them down. “Your grandfather caught all of these,” he says. “And one more. He never would say what it was.”'},
  {k:'hearth',name:'The Hearth',need:[['i','soup',1,'turnip soup'],['i','pie',1,'pumpkin pie'],['i','egg_fried',1,'fried egg']],coins:130,
   text:'Hale sets the dishes on the altar and a place beside them, with a fork and a cup. “For whoever’s next,” he says, and then he looks at you and stops talking.'},
  {k:'kin',name:'The Kin',need:[['h',4,4,'people at 4 hearts']],coins:200,
   text:'Hale reads the names of everyone who trusts you out loud, slowly, the way he reads the names of the dead. “That’s a lot of people who’ll miss you,” he says. “That helps. It helps more than you’d think.”'},
];
S.ward=S.ward||{};
const wardDone=()=>WARD.filter(w=>S.ward[w.k]).length;
const fishKinds=()=>Object.keys(S.fishLog||{}).length;
const heartsAt=n=>npcs.filter(x=>PEOPLE[x.def.id]&&hearts(x.def.id)>=n).length;
function wardHave(r){const [t,a,b]=r;if(t==='b')return basketCount(a);if(t==='i')return inv(a);if(t==='f')return fishKinds();if(t==='h')return heartsAt(a);return 0;}
function wardNeed(r){return r[0]==='h'?r[2]:r[0]==='f'?r[1]:r[2];}
function wardReady(w){return w.need.every(r=>wardHave(r)>=wardNeed(r));}
function wardTake(w){for(const r of w.need){if(r[0]==='b')takeBasket(r[1],r[2]);else if(r[0]==='i')takeInv(r[1],r[2]);}}
function openWard(){const rows=WARD.map(w=>{const done=S.ward[w.k],ok=!done&&wardReady(w);
    const req=w.need.map(r=>{const h=Math.min(wardHave(r),wardNeed(r));return `<span style="display:inline-block;margin-right:10px;${h>=wardNeed(r)?'color:#3e7a2e':''}">${h}/${wardNeed(r)} ${r[r.length-1]}</span>`;}).join('');
    return `<div style="margin:8px 0;padding:8px 10px;background:rgba(0,0,0,.06);${done?'opacity:.55':''}"><b>${w.name}</b>${done?' ✓ kept':''}<div style="font-size:13px;margin:3px 0">${req}</div>
      ${done?'':`<div style="font-size:12px;opacity:.75">Reward: ${w.coins} coins</div>`}${ok?`<button class="btn wardb" data-w="${w.k}" style="margin-top:5px">Offer</button>`:''}</div>`;}).join('');
  $('noteText').style.maxHeight='62vh';$('noteText').style.overflowY='auto';
  const first=!S.parishRead;S.parishRead=1;
  const parish=first?`<p style="font-size:13px"><i>Beside it, the parish ledger lies open: a name for every October since 1871, in the same brown ink. 1987 · Ruth Abernathy. 1999 · Daniel Coyle. The last line is already written. The ink is still wet. It is your name.</i></p>`:'';
  if(first)setTimeout(()=>mindHit&&mindHit(5),400);
  openNote(`<h3>The Ward ledger</h3>${parish}<p style="font-size:13px">Every family in the valley used to keep the Ward. The pages for Hollow Acre stop the year your grandfather died. ${wardDone()}/${WARD.length} kept.</p>${rows}`,'Close',()=>{$('noteText').style.maxHeight='';$('noteText').style.overflowY='';});}
$('noteText').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.wardb');if(!b)return;const w=WARD.find(x=>x.k===b.dataset.w);if(!w||S.ward[w.k]||!wardReady(w))return;
  wardTake(w);S.ward[w.k]=1;S.coins+=w.coins;SFX.bell&&SFX.bell();updateHud&&updateHud();$('note').hidden=true;noteCb=null;S.paused=false;$('noteText').style.maxHeight='';$('noteText').style.overflowY='';
  setTimeout(()=>openNote(`<h3>${w.name} is kept</h3><p>${w.text}</p><p style="font-size:13px">+${w.coins} coins · The Ward ${wardDone()}/${WARD.length}</p>`,'Good',()=>{mindHit(3);}),200);});
{const R=ROOMS.church;interact.push({x:R.ox+5,z:R.oz+2.5,r:1.4,on:()=>S.room==='church',label:()=>'Ward ledger',ok:()=>true,act(){openWard();}});}

// ---------- Mae's lessons
S.ls=S.ls||{i:-1,base:{},ev:{}};
const debrisCleared=()=>OBJ.filter(o=>o.debris&&o.hide).length;
const fieldTiles=()=>tiles.filter(t=>!t.gh);
const seedsTotal=()=>Object.values(S.seeds).reduce((a,b)=>a+(+b||0),0);
const talkedCount=()=>Object.keys(S.lastTalk||{}).length;
const giftsGiven=()=>Object.values(S.giftsWeek||{}).reduce((a,b)=>a+(+b||0),0)+(S.ls.ev.gifts||0);
const LESSONS=[
  {id:'clear',t:'Clear the field',say:'First things first: Elias let that field go wild. Weeds, rocks, sticks. Hold the pickaxe and tap a rock to break it. Weeds and twigs you can pull with whatever’s in your hand. It costs a little energy each time.',
   goal:b=>`Clear debris from the field ${Math.min(debrisCleared()-b.debris,5)}/5`,ok:b=>debrisCleared()-b.debris>=5,begin:b=>{b.debris=debrisCleared();},coins:15,done:'There. It already looks like somebody lives here.'},
  {id:'till',t:'Till the soil',say:'Now break the ground. Pick the hoe on your toolbar, then tap the brown dirt to till it. Six squares will do for now.',
   goal:()=>`Till soil ${Math.min(fieldTiles().filter(t=>t.tilled).length,6)}/6`,ok:()=>fieldTiles().filter(t=>t.tilled).length>=6,seeds:{turnip:4},done:'Good, straight rows. Here, four more turnip seeds. On the house.'},
  {id:'plant',t:'Plant seeds',say:'Pick the seeds on your toolbar, then tap the tilled soil to plant them. Turnips are quick. Pumpkins are slow and worth it.',
   goal:()=>`Plant seeds ${Math.min(fieldTiles().filter(t=>t.crop).length,6)}/6`,ok:()=>fieldTiles().filter(t=>t.crop).length>=6,items:{bread:2},done:'Take some of my bread. You’ll be hungry by noon. Everybody is, out here.'},
  {id:'water',t:'Water them',say:'Seeds need water every single day. Pick the watering can and tap each one. When it’s empty, refill at the stone well right beside the cabin, or dip it in the pond.',
   goal:()=>`Water your crops ${Math.min(fieldTiles().filter(t=>t.crop&&t.crop.watered).length,6)}/6`,ok:()=>fieldTiles().filter(t=>t.crop&&t.crop.watered).length>=6,coins:10,done:'That’s the whole job, really. Water, wait, worry.'},
  {id:'eat',t:'Eat something',say:'See those two bars? E is energy, H is health. Work drains energy. Open your bag and use the bread to eat it.',
   goal:()=>'Eat something from your bag',ok:()=>S.ls.ev.eat,coins:5,done:'There. Never let that bar run dry out here. People who faint in the fields wake up in strange places.'},
  {id:'sleep',t:'Sleep',say:'When it gets late, go to bed in the cabin. Sleeping saves your day and gives you your energy back. And don’t stay out past two. Please.',
   goal:b=>'Go to bed in the cabin',ok:b=>S.day>b.day,begin:b=>{b.day=S.day;},coins:20,done:'Morning! See? You made it through a night. That’s the hardest part. Well. One of them.'},
  {id:'ship',t:'Harvest and ship',at:()=>binPos,say:'When a crop is ripe, harvest it, then drop it in the wooden shipping bin just left of the cabin door. It’s sold overnight and you’re paid in the morning.',
   goal:b=>`Ship crops ${Math.min(S.shipped-b.shipped,3)}/3`,ok:b=>S.shipped-b.shipped>=3,begin:b=>{b.shipped=S.shipped;},coins:30,done:'Your first coins. Spend them on seeds and they’ll come back to you twice over.'},
  {id:'store',t:'Visit the store',at:()=>ROOMS.store&&ROOMS.store.out,say:'Come see me at the store: Coyle’s General Store, east along Route 9, the first shop past the MARROW HOLLOW sign. Buy some seeds. I’ll show you the shelves.',
   goal:()=>'Buy seeds at Caitlyn’s store',ok:()=>S.ls.ev.buy,seeds:{pumpkin:2},done:'A customer! Here, two pumpkin seeds extra. Don’t tell Hollis I play favourites.'},
  {id:'gather',t:'Wood and stone',say:'You’ll need wood and stone for everything. Hold the axe and tap a tree to chop it; hold the pickaxe and tap a rock to break it. Stumps need two swings.',
   goal:b=>`Gather wood ${Math.min(inv('wood')-b.wood,15)}/15 · stone ${Math.min(inv('stone')-b.stone,15)}/15`,ok:b=>inv('wood')-b.wood>=15&&inv('stone')-b.stone>=15,begin:b=>{b.wood=inv('wood');b.stone=inv('stone');},coins:25,done:'Strong arms. Elias had strong arms. He taught me to split kindling when I was nine and never once let me win.'},
  {id:'build',t:'Build a workbench',at:()=>({x:12.6,z:-5.2}),say:'Elias left his building plans pinned on the board by the woodpile, east of the cabin near the road. Look at them and build the Farming bench. You choose where it goes.',
   goal:()=>'Build a workbench from Grandpa’s plans',ok:()=>Object.values(S.benches||{}).some(Boolean),coins:20,done:'Look at that. It’s even level. You’re better at this than he was.'},
  {id:'craft',t:'Craft something',say:'Open your bag and press Craft, or use a bench. Everything you gather makes something. Try a straw charm or a lamp oil flask.',
   goal:()=>'Craft anything',ok:()=>S.ls.ev.craft,items:{fiber:5},done:'There’s nothing on a farm that isn’t good for something. Here, more fiber.'},
  {id:'fish',t:'Go fishing',say:'Fish are good money and good company. Hold your rod and tap the water. Tap again to cast, wait for the bite, then keep the fish inside the bar until it gives up.',
   goal:b=>'Catch a fish',ok:b=>(S.fishCaught||0)>b.fish,begin:b=>{b.fish=S.fishCaught||0;},coins:20,done:'Otto at the pond will want to hear about that. He wants to hear about every fish.'},
  {id:'cook',t:'Cook a meal',say:'Elias’s stove in the cabin still works. Bring crops and cook. Cooked food gives far more energy than raw.',
   goal:()=>'Cook something at the stove',ok:()=>S.ls.ev.cook,coins:15,done:'Smells like his cooking. Sorry. I’ll be fine.'},
  {id:'friends',t:'Meet the town',say:'Talk to people every day. Give gifts, two a week each. Hearts open their stories, and people here need someone to tell.',
   goal:b=>`Talk to people ${Math.min(talkedCount(),5)}/5 · Give a gift ${Math.min(giftsGiven()-b.gifts,1)}/1`,ok:b=>talkedCount()>=5&&giftsGiven()>b.gifts,begin:b=>{b.gifts=giftsGiven();},coins:25,done:'They like you. I can tell. They’ve started not saying your name, and they only do that for people they want to keep.'},
  {id:'map',t:'The map and journal',say:'Open the menu. The Map shows the whole valley. The Journal keeps what you learn. Check both.',
   goal:()=>`Open the Map ${S.ls.ev.map?'✓':''} · Open the Journal ${S.ls.ev.journal?'✓':''}`,ok:()=>S.ls.ev.map&&S.ls.ev.journal,coins:10,done:'If you ever get lost out there, look at the map. If the map looks wrong, come straight back.'},
  {id:'mine',t:'The old mine',at:()=>({x:MINE.x,z:MINE.z+.6}),say:'There’s ore under the farm: copper, iron, coal. The old Marrow mine is cut into the cliff just north of your cabin; walk round behind it. Go down a few floors. Take food.',
   goal:()=>`Reach mine floor ${Math.min(S.mineDeep||0,3)}/3`,ok:()=>(S.mineDeep||0)>=3,coins:40,done:'You came back up. Good. Some don’t, you know. Not from that mine. Other mines. Somewhere.'},
  {id:'smelt',t:'Smelt a bar',say:'Ore is no good raw. Build a furnace from the plans, then smelt copper into bars. Bars make tools, sprinklers, everything.',
   goal:()=>`Smelt a copper bar ${Math.min(inv('copper_bar'),1)}/1`,ok:()=>inv('copper_bar')>=1,coins:30,done:'Hollis can turn bars like that into better tools. Ask him. You’ll need them.'},
  {id:'upgrade',t:'Upgrade a tool',say:'Hollis at the garage upgrades tools with ore. Otto sells a better rod. Better tools reach things the old ones can’t.',
   goal:()=>'Upgrade a tool (pickaxe, axe or rod)',ok:()=>S.tools.pick>1||S.tools.axe>1||S.rod>1,coins:40,done:'Now you’re a proper farmer. Some things out here only open for proper tools.'},
  {id:'ward',t:'Keep the Ward',say:'Pastor Hale keeps a ledger in the church: the Ward. Every family used to give to it. Bring what it asks for. It helps the valley. It helps you.',
   goal:()=>`Keep a Ward bundle ${Math.min(wardDone(),1)}/1`,ok:()=>wardDone()>=1,coins:50,done:'Hale lit a candle for your family. He hasn’t done that in twenty-five years.'},
  {id:'furnish',t:'Make it home',say:'Build the furniture bench and make something for the cabin. Then place it. A home should look lived in.',
   goal:()=>'Place furniture in the cabin',ok:()=>(S.furnPlaced||[]).length>0||(S.furn||[]).length>0,coins:30,done:'There. Now it looks like someone lives there. Someone who means to stay.'},
  {id:'coop',t:'Build the coop',say:'Last lesson. Build the chicken coop from Elias’s plans. Hens lay every morning. Eggs feed you and sell well.',
   goal:()=>'Build the chicken coop',ok:()=>S.coop,coins:100,done:'That’s everything I know. You don’t need me now. …You’ll still come by the store, won’t you? Promise me.'},
];
// remember what happened
{const _e=eat;eat=function(){S.ls.ev.eat=1;return _e.apply(this,arguments);};}
{const _j=openJournal;openJournal=function(){S.ls.ev.journal=1;return _j.apply(this,arguments);};}
{const _ob=openBag;openBag=function(t){if(t==='map')S.ls.ev.map=1;return _ob.apply(this,arguments);};}
{const wrapV=(k,ev)=>{const v=vendors[k];if(!v)return;const _r=v.rows;v.rows=()=>_r().map(r=>{if(!r.buy||r._w)return r;const b=r.buy;return Object.assign(r,{_w:1,buy(){S.ls.ev[ev]=1;return b.apply(this,arguments);}});});};
  wrapV('craft','craft');wrapV('cook','cook');for(const k of Object.keys(vendors))if(k.startsWith('b_'))wrapV(k,'craft');}
let lsSeeds=null;
{const _os=openShop;openShop=function(v){S.ls.seed0=seedsTotal();return _os.apply(this,arguments);};const _rs=renderShop;renderShop=function(){if(shopV==='mae'&&S.ls.seed0!=null&&seedsTotal()>S.ls.seed0)S.ls.ev.buy=1;return _rs.apply(this,arguments);};}
// the lesson card under the objective, and Mae's notes
{const c=document.createElement('style');c.textContent=`#lesson{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + var(--lessonTop,128px));z-index:21;max-width:min(460px,92vw);display:none;align-items:center;gap:8px;
  background:rgba(42,26,14,.9);color:#f4e6c8;font-size:12.5px;line-height:1.3;padding:5px 10px 5px 5px;box-shadow:0 0 0 2px #1a0e06,0 0 0 3px #6a8a3a;cursor:pointer}
#lesson canvas{width:28px;height:28px;image-rendering:pixelated;background:#d9b27a;flex:none}#lesson b{color:#b8e07a;font-weight:600;margin-right:4px}
#maecard{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(env(safe-area-inset-bottom,0px) + 150px);z-index:24;width:min(380px,86vw);display:none;gap:10px;align-items:flex-start;background:rgba(42,26,14,.93);color:#f4e6c8;padding:8px 10px;font-size:13px;line-height:1.4;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #6a8a3a}
#maecard canvas{width:48px;height:48px;image-rendering:pixelated;background:#d9b27a;flex:none}#maecard .nm{color:#b8e07a;font-size:12px;letter-spacing:.12em;text-transform:uppercase}#maecard .rw{color:#ffd27a;font-size:12.5px;margin-top:4px}`;document.head.appendChild(c);
  const l=document.createElement('div');l.id='lesson';l.innerHTML='<canvas width="40" height="40"></canvas><div class="tx"></div>';$('app').appendChild(l);
  const m=document.createElement('div');m.id='maecard';m.innerHTML='<canvas width="40" height="40"></canvas><div><div class="nm">Caitlyn</div><div class="tx"></div><div class="rw"></div></div>';$('app').appendChild(m);
  l.addEventListener('click',()=>{const L=LESSONS[S.ls.i];if(!L)return;openNote(`<h3>Caitlyn’s lesson ${S.ls.i+1}/${LESSONS.length}: ${L.t}</h3><p>${L.say}</p><p><b>${L.goal(S.ls.base)}</b></p>`,'Got it');$('noteText').insertAdjacentHTML('beforeend','<p style="font-size:12px;opacity:.7"><a href="#" id="lsSkip">Skip Mae’s lessons</a></p>');$('lsSkip').onclick=ev=>{ev.preventDefault();S.tut.off=true;$('noteClose').click();toast('Mae’s lessons skipped.',2);};});
  m.addEventListener('click',()=>{m.style.display='none';});}
let maeT=0;
function maeSay(txt,rw,dur){maeCome(dur||6);const m=$('maecard');headIcon&&headIcon('mae',m.querySelector('canvas'));m.querySelector('.tx').innerHTML=txt;m.querySelector('.rw').textContent=rw||'';m.style.display='flex';maeT=dur||6;SFX.page&&SFX.page();}
function lsBegin(i){S.ls.i=i;S.ls.base={};const L=LESSONS[i];if(!L){$('lesson').style.display='none';return;}if(L.begin)L.begin(S.ls.base);
  setTimeout(()=>maeSay(L.say,`Lesson ${i+1}/${LESSONS.length}: ${L.t}`,9),i===0?200:3400);}
function lsReward(L){const out=[];if(L.coins){S.coins+=L.coins;out.push(`+${L.coins} coins`);}
  if(L.seeds)for(const [k,n] of Object.entries(L.seeds)){S.seeds[k]=(S.seeds[k]||0)+n;out.push(`+${n} ${k} seeds`);}
  if(L.items)for(const [k,n] of Object.entries(L.items)){addInv(k,n);out.push(`+${n} ${(ITEMS[k]&&ITEMS[k].name)||k}`);}
  try{syncSlots&&syncSlots();renderHotbar&&renderHotbar();}catch(e){}return out.join(' · ');}
function lessonsUpdate(dt){if(maeT>0){maeT-=dt;if(maeT<=0)$('maecard').style.display='none';}
  const el=$('lesson');if(S.mode!=='play'){el.style.display='none';return;}
  if(S.ls.i<0){if(S.readLetter&&!S.paused&&S.mode==='play'&&!S.tut.off){S.ls.i=0;const T=S.tut.done;for(const k of ['till','plant','water','bars','ship','fish','map','sleep','talk'])T[k]=1;
      maeCome(14,true);playScene('mae','Caitlyn drops by',`A young woman in a black tee and square glasses is leaning on your gate, holding up a phone that has no signal out here, as if she has been waiting a while.<br><br><q>Oh. Hi. You must be Elias’s grandkid. You have his walk. I’m Caitlyn. I run the store in town. Coyle’s.</q><br><br><q>He asked me to look in on you, if you ever came. He said you wouldn’t. I said you would.</q> She smiles. It doesn’t quite reach her eyes. <q>I win.</q><br><br><q>Let me show you how this place works. Then you’ll have a chance, at least.</q>`,()=>lsBegin(0));}
    el.style.display='none';return;}
  const L=LESSONS[S.ls.i];if(!L||S.tut.off){el.style.display='none';return;}
  // a purchase at the store counts when seeds go up while Mae's shop is open
  const st=seedsTotal();if(lsSeeds!==null&&st>lsSeeds&&!$('shop').hidden&&shopV==='mae')S.ls.ev.buy=1;lsSeeds=st;
  const ob=$('objective');const r=ob&&!ob.hidden?ob.getBoundingClientRect():null;if(r)el.style.setProperty('--lessonTop',Math.round(r.bottom+4)+'px');
  el.style.display=S.paused||$('bag').hidden===false?'none':'flex';
  const tx=`<b>Caitlyn</b>${L.goal(S.ls.base)}${L.at&&typeof wayChip==='function'?wayChip(L.at()):''}`;if(el.dataset.tx!==tx){el.dataset.tx=tx;el.querySelector('.tx').innerHTML=tx;headIcon&&headIcon('mae',el.querySelector('canvas'));}
  if(L.ok(S.ls.base)&&!S.paused){const rw=lsReward(L);maeSay(L.done,rw,6);SFX.coin&&SFX.coin();lsBegin(S.ls.i+1);}}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);lessonsUpdate(dt);};}
// candles cost more: the rite has to be earned
{const _pr=vendors.peddler.rows;vendors.peddler.rows=()=>_pr().map(r=>r.k==='candle'?Object.assign(r,{price:45}):r);}
setInterval(()=>{if(S.paused&&$('maecard').style.display!=='none'){$('maecard').style.display='none';maeT=0;}},200);
setInterval(()=>{const l=$('lesson');if(S.paused||S.mode!=='play'){l.style.display='none';}
  const on=l.style.display==='flex';const t=$('toast');const want=on?(Math.round(l.getBoundingClientRect().bottom+8)+'px'):'';
  if(on){t.style.top=want;t.style.transform='translate(-50%,0)';}else if(t.style.top){t.style.top='';t.style.transform='';}},150);

// ---- Mae in person: when she talks you through a lesson she walks over and stands beside you, then heads off again
const MAEV={on:false,x:0,z:0,tx:0,tz:0,dir:'S',t:0,mv:0,stay:0,room:null,leave:false};
function maeCome(stay,instant){const v=MAEV;const side=P.fx>=0?-1:1;let tx=P.x+side*1.7,tz=P.z+.25;
  if(S.room){const R=ROOMS[S.room];if(R){tx=clamp(tx,R.ox+.8,R.ox+(R.w||10)-.8);tz=clamp(tz,R.oz+1.2,R.oz+(R.d||7)-.6);}}
  if(!v.on||v.room!==(S.room||null)){const a=Math.atan2(tz-P.z,tx-P.x);v.x=instant?tx:P.x+Math.cos(a)*7;v.z=instant?tz:P.z+Math.sin(a)*4.5;if(S.room){v.x=tx;v.z=tz;}}
  Object.assign(v,{on:true,tx,tz,stay:Math.max(v.stay,stay+1.5),room:S.room||null,leave:false});}
function maeUpdate(dt){const v=MAEV;if(!v.on)return;v.t+=dt;if((S.room||null)!==v.room){v.on=false;return;}
  if(!S.paused)v.stay-=dt;if(v.stay<=0&&!v.leave){v.leave=true;const a=Math.atan2(v.z-P.z,v.x-P.x)||0;v.tx=v.x+Math.cos(a)*9;v.tz=v.z+Math.sin(a)*6;}
  const dx=v.tx-v.x,dz=v.tz-v.z,d=Math.hypot(dx,dz);
  if(d>.15){const sp=v.leave?2.2:2.8;const st=Math.min(d,sp*dt);v.x+=dx/d*st;v.z+=dz/d*st;v.dir=dirOf(dx,dz);v.mv=1;}
  else{v.mv=0;v.dir=dirOf(P.x-v.x,P.z-v.z);if(v.leave){v.on=false;return;}}
  if(v.leave&&(!onScreen(v.x,v.z,60)||Math.hypot(v.x-P.x,v.z-P.z)>12))v.on=false;
  // she follows if you wander off while she's still talking
  if(!v.leave&&Math.hypot(P.x-v.tx,P.z-v.tz)>3.2){const side=v.x<P.x?-1:1;v.tx=P.x+side*1.7;v.tz=P.z+.25;}}
{const _lu=lifeUpdate;lifeUpdate=function(dt){_lu(dt);maeUpdate(dt);if(MAEV.on){const n=npcById('mae');if(n)n.vis=false;}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const v=MAEV;if(!v.on||(S.room||null)!==v.room||!onScreen(v.x,v.z,80))return;
  const m=SPR.mae;if(!m)return;const clip=v.mv?'walk':(m.clips.idle?'idle':'walk');
  D.push({z:v.z,mind:1,draw(){shadow(sx(v.x),sz(v.z),9);drawSpr('mae',sx(v.x),sz(v.z),clip,v.dir,v.mv?frameOf('mae','walk',v.t):(m.clips.idle?frameOf('mae','idle',v.t):0));}});};}
