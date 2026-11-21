/* ================= the trades: the bait shop and the smith on the corner of Market and Green Street, the carpenter at the east end
   of Market Street, and Bell's feed barn out on Orchard Lane with Ezra's pen beside it; and the people who run them ================= */
const SHOPS_AT={bait:{spr:'shop_bait',x:24.6,front:8.8},forge:{spr:'shop_forge',x:31.6,front:9.8},carp:{spr:'shop_carp',x:68.4,front:8.6},feed:{spr:'shop_feed',x:50.5,front:44}};
const shopDoor=k=>[SHOPS_AT[k].x,SHOPS_AT[k].front+.35],shopOut=k=>({x:SHOPS_AT[k].x,z:SHOPS_AT[k].front+.7});
{const _bw=buildWorld;buildWorld=function(){
  _bw();
  for(const [k,s] of Object.entries(SHOPS_AT))building(s.spr,s.x,s.front,{jack:k==='forge'||k==='feed'});
  // forecourts: the smith's anvil and quench barrel, the carpenter's timber, a crate of tackle at the bait shop
  put('anvil',33.9,10.6,.35);put('barrel',29.1,10.5,.3);put('crate',22.7,9.5,.3);put('wheel',35.3,9.7,0,{kind:'prop'});put('lumber',66.2,9.6);addRect(65.3,9.1,67.1,9.8);obj('mud_b',70.6,10.2,{kind:'flat'});obj('mud_a',30.6,11.6,{kind:'flat'});
  // yards behind, back onto Main Street: nets and traps, the smith's woodpile, the carpenter's seasoning stacks
  for(const x of [21.8,28.1])hedgeLine(x,-3.2,5.3);hedgeLine(35.2,-3.2,6.3);fenceLine(21.8,-3.2,24.2,-3.2,0,'picket');fenceLine(25.8,-3.2,30.6,-3.2);fenceLine(32.2,-3.2,35.2,-3.2);
  for(const x of [65.2,72.6])hedgeLine(x,-3.2,4.3);fenceLine(65.2,-3.2,68.2,-3.2,0,'picket');fenceLine(69.8,-3.2,72.6,-3.2,0,'picket');
  put('wk_rack',24.6,.6,0,{kind:'prop'});put('wk_trap',22.9,1.8,.25);put('barrel',26.9,2.4,.3);
  put('firewood',30,.9);addRect(29.3,.4,30.7,1);put('choppingblock',31.8,1.2,0,{kind:'prop'});put('barrel',33.6,1.6,.3);put('barrel',33,2.1,.3);
  put('lumber',67.2,.8);addRect(66.3,.3,68.1,1);put('lumber',70.6,1.6);addRect(69.7,1.1,71.5,1.8);
  // Ezra's pen beside the feed barn: split rails, a gate onto the lane, three cows and their hay
  fenceLine(55,37.8,55,43.2);fenceLine(63.6,37.8,63.6,43.2);fenceLine(55,37.8,63.6,37.8);fenceLine(55,43.2,58.4,43.2);fenceLine(60.6,43.2,63.6,43.2);obj('mud_a',59.4,42.2,{kind:'flat'});obj('mud_b',57,39.6,{kind:'flat'});
  COWS.push(...[[57.4,39.4,'cow_1'],[61.4,40.6,'cow_2'],[59.4,41.8,'cow_1']].map(([x,z,s])=>({e:obj(s,x,z,{kind:'cow'}),x,z,hx:x,hz:z,t:rand()*6,flip:rand()<.5})));
  put('hay',62.4,39.2);addRect(61.7,38.5,63.2,39.3);put('bucket',56,42.6,0,{kind:'prop'});put('sacks',46.6,44.6);put('hay',54.2,44.3);addRect(53.7,43.6,54.7,44.4);
};}
// cows drift a few steps and graze (the sprite flips with them)
const COWS=[];
{const _u=update;update=function(dt){_u(dt);if(S.room)return;for(const c of COWS){c.t-=dt;if(c.t<0){c.t=4+rand()*6;c.tx=c.hx+(rand()*2-1)*1.4;c.tz=c.hz+(rand()*2-1)*.7;}
  if(c.tx!=null){const dx=c.tx-c.x,dz=c.tz-c.z,d=Math.hypot(dx,dz);if(d>.05){const s=Math.min(d,.35*dt);c.x+=dx/d*s;c.z+=dz/d*s;if(Math.abs(dx)>.05)c.flip=dx<0;}}
  c.e.x=c.x;c.e.z=c.z;c.e.flip=c.flip;}};}
// ---- four more townsfolk
const LANEFOLK=[
  {id:'gideon',name:'Gideon Brannock',role:'Armourer and blacksmith',nightPos:[22,-4.6],
    lines:['Iron remembers every blow. So do I.','Your grandfather had me make a lock once. For the inside of a door.','I don’t sell blades to people who’ll be gone by November. You’ll be here. Come back.'],
    night:['The fire’s banked.','Hammer’s down.','Steel won’t help you tonight.']},
  {id:'nell',name:'Nell Hartley',role:'Carpenter',nightPos:[20.5,-7.4],
    lines:['Measure twice, cut once. Measure three times if it’s a coffin.','I built every porch in this town. Every one faces the corn. Nobody asked for that.','If you want something built, bring me timber. I’ll bring the nails and the opinions.'],
    night:['Sawdust in my hair.','I built the platform too.','Don’t look at the stage.']},
  {id:'ezra',name:'Ezra Bell',role:'Keeps the animals, runs the feed barn',nightPos:[-11,-3.6],
    lines:['Animals know before we do. The cows won’t face west since September.','Hens laid nothing but shells last week. Empty. Neat little holes in the top.','You want stock? I’ll sell you stock. Treat ’em kind. They’re all that sleeps easy here.'],
    night:['Cows are lowing.','Something’s in the pasture.','They count heads too, you know.']},
  {id:'pip',name:'Everett Coyle',role:'Store clerk, Caitlyn’s cousin',nightPos:[28,-5],
    lines:['Cait lets me work the till! Mostly. Sometimes. When she’s on her lunch.','You’re the one with the farm! Is it true the scarecrow moves? Tobias says it moves.','Want to know a secret? The price tags change by themselves after dark. They all say the same number.'],
    night:['I’m not supposed to be out.','Cait says don’t look.','Seven. The tags all say seven.']}];
for(const d of LANEFOLK){d.day=[0,0];d.path=[[0,0]];NPCDEF.push(d);const n={def:d,x:0,z:0,dir:'S',clip:'idle',t:Math.random()*4,wp:0,wait:0,vis:true,spd:0};npcs.push(n);
  const i=npcs.length-1;interact.push({npc:i,x:0,z:0,r:1.7,on:()=>npcs[i].vis,label:()=>'Talk',ok:()=>true,act(){talk(npcs[i]);}});S.friend[d.id]=S.friend[d.id]||0;}
Object.assign(PEOPLE,{
  gideon:{voice:'low',loves:['corn','egg'],likes:['pumpkin'],hates:['mushroom'],
    talk:[['Bring me ore and I’ll bring you bars. Fair trade. Only fair thing in town.','Hollis fixes engines. I fix what engines can’t outrun.'],['I forged the hook on the church bell. It’s on its fourth rope. The rope never wears. It gets cut.','Wes asked me for a knife once. I gave him a file instead. Files open locks.'],['If it comes for you, aim for the knees. It doesn’t have knees. That’s the point. It makes it stop and think.']],
    gift:{love:'Hm. Good. That’s good.',like:'Obliged.',hate:'Keep those off my anvil.',meh:'Mm.'},
    events:[{h:3,title:'The thirteenth nail',text:`Gideon shows you a box of square nails, hand-forged, one for every year. <q>The Tithe’s door gets nailed shut from outside. I make the nails.</q><br><br>This year’s nail is already cooling on the anvil. It is longer than the others.`,lore:'Gideon forges one nail every year for the door of the Tithe. This year’s is longer.'}]},
  nell:{voice:'bright',loves:['pumpkin','turnip'],likes:['corn'],hates:['fish'],
    talk:[['You’ve got Elias’s hands. Look at those knuckles. Builder’s hands.','I sell plans, timber and a good chair. Not necessarily in that order.'],['Every year I build a platform in the square. Every year I burn it after. That’s the job.','Your grandfather’s cabin has a room I never built. I don’t know who did.'],['I’m building something for you. Don’t ask. I’ll tell you if it’s a crib or a box when it’s done.']],
    gift:{love:'Oh, now that’s lovely. Thank you!',like:'Ta!',hate:'Smells like the pond.',meh:'Sure.'},
    events:[{h:3,title:'The measurements',text:`On Nell’s workbench, under a sheet, a long pine box with a lid that hasn’t been fitted yet. Pencilled on the side: your height, to the quarter inch.<br><br><q>Silas gives me the numbers,</q> she says, not looking up. <q>I never ask whose.</q>`,lore:'Nell builds a box every year from Silas’s measurements. This year’s has your height on it.'}]},
  ezra:{voice:'old',loves:['corn','pumpkin'],likes:['turnip','egg'],hates:['mushroom'],
    talk:[['Feed’s by the sack, stock’s by the head. Hens, a cow if you’ve got the barn for it.','Brushed the cows this morning. They like it. They lean in.'],['I lost a calf every October till ’81. Then I stopped breeding in spring. Now it takes something else.','The hens go quiet at the same hour every night. Eight sharp. Same as the bell.'],['When you hear the cows scream, don’t go out to them. They’ll be fine. They’re always fine by morning. It’s us that aren’t.']],
    gift:{love:'Well now. Thank you kindly.',like:'Good of you.',hate:'Cows won’t touch it and neither will I.',meh:'Mm-hm.'},
    events:[{h:3,title:'The tagged ear',text:`Ezra’s ledger lists every animal he’s sold since 1950. Each row has a buyer and a date. Some rows have a third column: a tag number, and a name that isn’t an animal’s.<br><br>The last tag number is blank. The name beside it is yours.`,lore:'Ezra’s stock ledger tags the Tithe like livestock. The last row has your name and no number yet.'}]},
  pip:{voice:'bright',loves:['egg','pumpkin'],likes:['corn','turnip'],hates:['fish'],
    talk:[['Cait says I count change like a banker. I think that’s good?','Tobias is my cousin. He’s braver than me. That’s what worries Cait.'],['Danny used to work the till. Before me. He left his name scratched under the counter.','Cousin Danny… I mean, Danny. Cait says not to say cousin. Tobias might hear.'],['I counted everyone in town. There’s one more than there should be. There always is in October.']],
    gift:{love:'For me?! I’m putting it in the window!',like:'Thanks!',hate:'Eugh, the eyes.',meh:'Oh. Okay!'},
    events:[{h:3,title:'Under the counter',text:`Everett lifts the till drawer out. Scratched into the wood beneath it, one name per line, in different children’s hands: everyone who has ever worked the store counter.<br><br>The last name is Danny’s. Under it, freshly scratched, half a letter: the start of an E.`,lore:'Under the Coyles’ till are the names of every child who worked it. Someone has begun to scratch an E.'}]}});

// ---- homes and routines (Everett lives over the store with Caitlyn and Tobias; the other three live behind their shops)
const LROOM=(ox,shell,name,out,furn)=>({ox,oz:-60,shell,name,out,furn,paper:shell.slice(10)});
Object.assign(ROOMS,{
  shop_forge:LROOM(724,'room_garage','Brannock’s Forge',shopOut('forge'),[['furnace',1.3,1.25,[-0.70,-0.5,0.70,0]],['in_shelf_tools',3.4,0.62,[-1.00,-0.4,1.00,0]],['bench_weapon',5.6,1.15,[-1.10,-0.45,1.10,0]],['bench_armor',8.0,1.3,[-0.70,-0.45,0.70,0]],
    ['anvil',1.8,3.3,[-0.50,-0.3,0.50,0]],['in_counter',4.4,4.0,[-1.56,-0.6,1.56,0]],['barrel',0.6,5.4,[-0.40,-0.3,0.40,0]],['in_crates',1.8,5.5,[-0.70,-0.4,0.70,0]],['in_drum',8.4,5.3,[-0.35,-0.3,0.35,0]]]),
  shop_carp:LROOM(756,'room_home_rust','Hartley Carpentry',shopOut('carp'),[['lumber',1.2,1.3,[-0.90,-0.4,0.90,0]],['lumber',1.2,2.8,[-0.90,-0.4,0.90,0]],['bench_furn',4.0,1.15,[-1.10,-0.45,1.10,0]],['in_shelf_tools',6.6,0.62,[-1.00,-0.4,1.00,0]],
    ['in_counter',5.9,3.6,[-1.56,-0.6,1.56,0]],['in_rocker',0.9,4.9,[-0.40,-0.45,0.40,0]],['in_chair',2.1,5.1,[-0.30,-0.25,0.30,0]],['in_crates',7.2,5.3,[-0.70,-0.4,0.70,0]]]),
  shop_feed:LROOM(788,'room_home_sage','Bell’s Feed & Stock',shopOut('feed'),[['hay',1.0,1.4,[-0.70,-0.4,0.70,0]],['hay',1.0,2.9,[-0.70,-0.4,0.70,0]],['sacks',2.5,1.1,[-0.55,-0.3,0.55,0]],['sacks',3.4,1.3,[-0.55,-0.3,0.55,0]],
    ['in_shelf_jars',5.4,0.62,[-0.80,-0.4,0.80,0]],['barrel',7.3,1.2,[-0.40,-0.3,0.40,0]],['in_counter',5.9,3.6,[-1.56,-0.6,1.56,0]],['sacks',0.9,5.1,[-0.55,-0.3,0.55,0]],['in_keg',2.1,5.3,[-0.40,-0.3,0.40,0]],['in_crates',7.2,5.3,[-0.70,-0.4,0.70,0]]]),
  shop_bait:LROOM(820,'room_home_blue','Bait & Tackle',shopOut('bait'),[['in_rods',0.6,0.9,[-0.50,-0.3,0.50,0]],['in_netwall',2.6,-0.95,null,'flat'],['in_shelf_cans',5.3,0.62,[-1.00,-0.4,1.00,0]],['barrel',7.3,1.2,[-0.40,-0.3,0.40,0]],
    ['in_counter',5.9,3.6,[-1.56,-0.6,1.56,0]],['in_keg',0.8,4.9,[-0.40,-0.3,0.40,0]],['in_crates',1.9,5.3,[-0.70,-0.4,0.70,0]],['in_drum_blue',7.3,5.3,[-0.35,-0.3,0.35,0]]])});
Object.assign(ROOM_LAMP,{shop_forge:[1.3,1.6],shop_carp:[4,2.2],shop_feed:[4,2.2],shop_bait:[4,2.2]});
// the garage's cruiser is the sheriff's second car, up on blocks
{const f=ROOMS.garage.furn.find(q=>q[0]==='in_car');if(f){f[0]='police_blocks';f[3]=[-1.9,-1.3,1.9,0];}}
Object.assign(HOMES,{brannock:{door:shopDoor('forge'),face:'N',room:'shop_forge',name:'the rooms behind the forge'},hartley:{door:shopDoor('carp'),face:'N',room:'shop_carp',name:'the loft over the workshop'},
  bell:{door:shopDoor('feed'),face:'N',room:'shop_feed',name:'the feed barn'}});
Object.assign(HOME_SPOT,{brannock:[4.4,2.9],hartley:[5.9,2.6],bell:[5.9,2.6]});
Object.assign(PL,{forge_yard:[33.2,11,.4],lumber:[66.2,10.4,.4],pen:[59.4,40.6,1.6],lane:[32.6,-17.8,2.2],bait_porch:[24.6,9.7,.4]});
Object.assign(INDOOR,{
  forge:{room:'shop_forge',door:shopDoor('forge'),spots:{gideon:[4.4,3.0]},browse:[[6.4,3.4],[3.0,5.0]]},
  carp:{room:'shop_carp',door:shopDoor('carp'),spots:{nell:[5.9,2.6]},browse:[[2.8,3.6],[3.4,5.0]]},
  feed:{room:'shop_feed',door:shopDoor('feed'),spots:{ezra:[5.9,2.6]},browse:[[2.8,3.6],[3.4,5.0]]},
  bait:{room:'shop_bait',door:shopDoor('bait'),spots:{otto:[5.9,2.6]},browse:[[2.8,3.6],[3.4,5.0]]}});
INDOOR.store.spots.pip=[4.7,1.5];
Object.assign(LIFE,{
  gideon:{home:'brannock',job:'Armourer and blacksmith, Brannock’s Forge',personality:'Huge, quiet, exact. Talks to metal more than people. Forges the nails for the Tithe’s door.',day:[[6,'home'],[7,'forge'],[10.5,'forge_yard'],[11.5,'forge'],[12.5,'square'],[13.5,'forge'],[18,'store'],[19,'home']]},
  nell:{home:'hartley',job:'Carpenter, Hartley Carpentry',personality:'Cheerful, blunt, sawdust in her hair. Builds the box every year and never asks whose it is.',day:[[6,'home'],[7.5,'carp'],[10,'lumber'],[11,'carp'],[12.5,'square'],[13.5,'carp'],[17.5,'board'],[18.8,'home']]},
  ezra:{home:'bell',job:'Keeps the animals; Bell’s Feed & Stock',personality:'Weathered, patient, kinder to cows than to people. Reads the animals like a barometer.',day:[[5.5,'pen'],[9,'feed'],[12,'pen'],[14,'feed'],[17,'pen'],[18.5,'home']]},
  pip:{home:'coyle',job:'Clerk at Coyle’s General Store',personality:'Twelve, eager, counts everything. Works Caitlyn’s till and wants to be trusted with it.',day:[[6,'home'],[8,'store'],[12,'lane'],[13,'store'],[16,'pen'],[17,'store'],[18.5,'home']]}});
LIFE.otto.job='Fisherman; runs the bait & tackle shop afternoons';LIFE.otto.day=[[5.5,'dock'],[10.5,'bait'],[12.5,'dock'],[15.5,'bait'],[18,'home']];
for(const n of npcs){const L=LIFE[n.def.id];if(L)n.def.role=L.job;}

// ---- shop doors: open 7 to 18 while the keeper's day says they're working there
const KEEP={forge:'gideon',carp:'nell',feed:'ezra',bait:'otto'};
const keeperIn=job=>{const n=npcById(KEEP[job]);return n&&n.loc==='in'&&n.inWant===job;};
for(const [job,s] of Object.entries(SHOPS_AT)){const R='shop_'+job;
  interact.push({x:s.x,z:s.front+.35,r:.9,label:()=>'Enter',ok:()=>true,act(){
    if(isNight()||S.hour<7||S.hour>=18.5){toast({forge:'Shut. Through the gap the coals are still red, and the anvil is still ringing.',carp:'Shut. Something long and pale lies on the workbench under a sheet.',feed:'Shut. Inside, every animal in the barn is facing the door.',bait:'Shut. A sign on the glass: GONE FISHING. It has been written over many times.'}[job],3,true);SFX.deny();return;}
    enterRoom(R);}});
  const cz=job==='forge'?4.7:4.3,cx=job==='forge'?4.4:5.9;
  interact.push({...rp(R,cx,cz),r:1.3,on:inRoom(R),label:()=>'Counter',ok:()=>true,act(){const k=npcById(KEEP[job]);
    if(!keeperIn(job))toast(`${k.def.name.split(' ')[0]} isn’t at the counter. A note: “Leave the coins. I’ll know.”`,2.6);
    openShop('v_'+job);}});}
// the store counter knows about Everett now
{const it=interact.find(q=>q.x===ROOMS.store.ox+6.5&&q.z===ROOMS.store.oz+3.0);if(it){it.act=function(){const m=npcById('mae'),p=npcById('pip');const at=n=>n&&n.loc==='in'&&n.inWant==='store';
  if(at(m)&&Math.abs(m.x-(ROOMS.store.ox+6.5))<1)toast('“What’ll it be, farm kid?”',1.6);else if(at(p))toast('Everett stands on a crate to reach the till. “I can do it! I can totally do it.”',2.4);else toast('Caitlyn calls from the back room: “Take what you need. Leave the coins by the till. I trust you. Mostly.”',2.8);openShop('mae');};}}

// ---- what they sell
Object.assign(ITEMS,{milk:{name:'Milk',icon:'milk',food:[20,8],sell:14,desc:'Fresh from the barn. +20 energy. Sells for 14.'},bait:{name:'Bait',icon:'bait',desc:'A tin of worms. Fish bite three times as fast while you have some.'},
  fishitem:{name:'Fish',icon:'fish'}});
S.cows=S.cows||0;S.milk=S.milk||0;S.rod=S.rod||1;
const sellAll=(kind,mul,who)=>{const n=basketCount(kind);const v=S.basket.filter(b=>b.kind===kind).reduce((a,b)=>a+b.value,0);const pay=Math.round(v*mul);takeBasket(kind,n);S.coins+=pay;toast(`${who} pays ${pay} coins for ${n}.`,2);};
vendors.v_forge={name:'Brannock’s Forge',sub:'“Iron remembers. So do I.”',rows:()=>[
  {k:'cbar',name:'Copper bar',desc:'Smelted, ready for the bench.',price:30,can:true,buy(){addInv('copper_bar');}},
  {k:'ibar',name:'Iron bar',desc:'Good, grey, honest iron.',price:50,can:true,buy(){addInv('iron_bar');}},
  {k:'smc',name:'Smelt copper',desc:'Gideon smelts 3 ore into a bar on his own coal.',price:6,can:true,need:{copper:3},btn:'6 coins',buy(){addInv('copper_bar');SFX.refill();}},
  {k:'smi',name:'Smelt iron',desc:'3 ore into a bar on his coal.',price:10,can:true,need:{iron:3},btn:'10 coins',buy(){addInv('iron_bar');SFX.refill();}},
  {k:'sickle',name:'Copper sickle',desc:S.gear.weapon==='sickle'?'You carry one.':'Hits twice as hard. Cuts weeds in one pull.',price:120,can:S.gear.weapon!=='sickle'&&S.gear.weapon!=='machete',buy(){S.gear.weapon='sickle';}},
  {k:'machete',name:'Iron machete',desc:S.gear.weapon==='machete'?'You carry one.':'Three times as hard.',price:240,can:S.gear.weapon!=='machete',buy(){S.gear.weapon='machete';}},
  ...Object.entries(ARMORS).map(([k,[name,red,hp]],i)=>({k:'a_'+k,name,desc:S.gear.armor===k?'You’re wearing it.':`Takes ${Math.round(red*100)}% off every bite. +${hp} max health.`,price:[60,150,280][i],can:S.gear.armor!==k,buy(){S.gear.armor=k;S.hpMax=100+hp;S.hp=Math.min(S.hpMax,S.hp+hp);}})),
  {k:'sello',name:'Sell ore',desc:`Copper 5 each, iron 9 each. You have ${inv('copper')} copper, ${inv('iron')} iron.`,price:0,can:inv('copper')+inv('iron')>0,btn:'Sell all',buy(){const p=inv('copper')*5+inv('iron')*9;takeInv('copper',inv('copper'));takeInv('iron',inv('iron'));S.coins+=p;toast(`Gideon weighs it in his palm. ${p} coins.`,2);}}]};
vendors.v_carp={name:'Hartley Carpentry',sub:'“Measure twice. Measure three times if it’s a box.”',rows:()=>[
  {k:'wood',name:'Timber ×10',desc:'Seasoned planks, cut to length.',price:25,can:true,buy(){addInv('wood',10);}},
  {k:'plans',name:'Building plans',desc:'Nell draws it, you choose where it goes on the farm.',price:0,can:true,btn:'Look',buy(){setTimeout(()=>openShop('plans'),0);}},
  ...Object.entries(FURN).map(([k,[name,spr,need]])=>({k:'f_'+k,name:name+' (made to order)',desc:'Nell builds it; you place it in the cabin. As many as you like.',price:Object.values(need).reduce((a,b)=>a+b,0)*4,can:true,
    buy(){S.furnBag.push(k);toast(`Nell carries the ${name.toLowerCase()} out. It’s in your bag; place it inside the cabin.`,2.6);}})),
  {k:'sellw',name:'Sell timber',desc:`2 coins a plank. You have ${inv('wood')}.`,price:0,can:inv('wood')>=10,btn:'Sell 10',buy(){takeInv('wood',10);S.coins+=20;}}]};
vendors.v_feed={name:'Bell’s Feed & Stock',sub:'“Treat ’em kind. They’re all that sleeps easy here.”',rows:()=>[
  {k:'hen',name:'Laying hen',desc:S.coop?`Lives in your coop, lays every morning. You have ${HENS.length}/8.`:'Build a chicken coop first (Farm Plans).',price:40,can:S.coop&&HENS.length<8,buy(){HENS.push({x:10.5,z:-2.2,tx:10,tz:-2,t:rand()*5,wait:rand()*2,peck:0,flip:false});toast('Ezra hands you a hen in a sack. She settles in the coop.',2.2);}},
  {k:'cow',name:'Milk cow',desc:`Lives in Grandpa’s barn. Milk her every morning. You have ${S.cows}/3.`,price:300,can:S.cows<3,buy(){S.cows++;S.milk=Math.max(S.milk,1);placeFarmCows();toast('Ezra walks her up the lane to your barn himself. She doesn’t look back.',2.8);}},
  {k:'fert',name:'Bone meal ×3',desc:'Jumps a crop a stage overnight.',price:18,can:true,buy(){addInv('fert',3);}},
  {k:'seedc',name:'Corn seed ×3',desc:'Feed corn. Slow and worth it.',price:22,can:true,buy(){S.seeds.corn=(S.seeds.corn||0)+3;}},
  {k:'selle',name:'Sell eggs',desc:`Ezra pays 10 apiece. You have ${basketCount('egg')}.`,price:0,can:basketCount('egg')>0,btn:'Sell all',buy(){sellAll('egg',1.25,'Ezra');}},
  {k:'sellm',name:'Sell milk',desc:`18 a bottle. You have ${inv('milk')}.`,price:0,can:inv('milk')>0,btn:'Sell all',buy(){const n=inv('milk');takeInv('milk',n);S.coins+=n*18;toast(`Ezra pays ${n*18} coins.`,2);}}]};
vendors.v_bait={name:'Bait & Tackle',sub:'“Fish don’t bite in October. They look up.”',rows:()=>[
  {k:'bait',name:'Bait ×5',desc:`Worms in a tin. Fish bite three times as fast. You have ${inv('bait')}.`,price:12,can:true,buy(){addInv('bait',5);}},
  {k:'rod2',name:'Ash rod',desc:S.rod>=2?'You fish with it.':'Lands bigger fish: every catch is worth half again.',price:90,can:S.rod<2,buy(){S.rod=2;}},
  {k:'rod3',name:'Otto’s old greenheart rod',desc:S.rod>=3?'You fish with it.':'Every catch worth double. “It caught your grandfather’s hat.”',price:220,can:S.rod===2,buy(){S.rod=3;}},
  ...(typeof ROD4_OK!=='undefined'&&ROD4_OK?[{k:'rod4',name:'Hollow-glass rod',desc:S.rod>=4?'You fish with it.':'A rod set with black glass. Every catch worth two and a half times, and the fish fight less. “Don’t ask me where the glass came from. Don’t ask it either.”',price:380,can:S.rod===3,need:{gem:2,iron:2},buy(){S.rod=4;}}]:[]),
  {k:'sellf',name:'Sell fish',desc:`Otto pays more than the bin. You have ${basketCount('fish')}.`,price:0,can:basketCount('fish')>0,btn:'Sell all',buy(){sellAll('fish',1.4,'Otto');}}]};
// bait and a better rod change the fishing
{const _fa=fishAct;fishAct=function(){const was=fish.state,nb=S.basket.length;_fa();
  if(was==='off'&&fish.state==='wait'&&inv('bait')>0){fish.t*=.33;takeInv('bait');}
  if(S.basket.length>nb&&S.rod>1){const f=S.basket[S.basket.length-1];if(f.kind==='fish')f.value=Math.round(f.value*[1,1,1.5,2,2.5][Math.min(4,S.rod)]);}};}
// cows in Grandpa's barn: they stand in the yard by day, give milk each morning
const FARM_COWS=[];
function placeFarmCows(){for(const c of FARM_COWS){const i=OBJ.indexOf(c);if(i>=0)OBJ.splice(i,1);}FARM_COWS.length=0;
  const spots=[[12.6,-7.6,'cow_1'],[18.4,-7.4,'cow_2'],[10.9,-6.9,'cow_2']];for(let i=0;i<S.cows;i++){const [x,z,s]=spots[i];FARM_COWS.push(obj(s,x,z,{kind:'cow',flip:i===1}));}}
{const _nd=newDay;newDay=function(m,p){_nd(m,p);if(S.cows)S.milk=Math.min(6,S.milk+S.cows);};}
interact.push({x:16,z:-9.1,r:1.3,on:()=>S.cows>0&&S.milk>0&&!S.room,label:()=>`Milk ${S.milk}`,ok:()=>true,act(){addInv('milk',S.milk);toast(`You milk the cow${S.cows>1?'s':''}. ${S.milk} bottle${S.milk>1?'s':''}.`,2);S.milk=0;SFX.refill();}});
{const _bt=benchesBoot;benchesBoot=function(){_bt();placeFarmCows();};}

