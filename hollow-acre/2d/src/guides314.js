/* ================= #314 side lessons for the rest of the farm (owner: "add the automation and stuff, machines and butchery as
   well", after the business lessons): Caitlyn walks you through each of them the same way, one at a time, a pin on the map and a
   little reward when it's done.
   - Automation: a brass sprinkler set in the field; Hollis's old tractor from Pruitt's garage; the seed drill and the reaper.
   - Machines: Grandpa's brew kettle; a keg filled with wort; then the still, the fruit press and the oak cask.
   - Butchery: the butcher's block, and using it. It is never required, so if you leave it the lesson lets it go after a few days. === */
const GD314={plans:{x:9.9,z:-7.7}};
const gdAt=k=>{try{const p=BENCH_POS[k];if(p)return {x:p.x,z:p.z+.8};}catch(e){}return GD314.plans;};
const gdGarage=()=>{try{const o=ROOMS.garage&&ROOMS.garage.out;if(o)return {x:o.x,z:o.z+.4};}catch(e){}return {x:-33.7,z:-9.5};};
const gdTr=()=>{try{return EMP().tractor||null;}catch(e){return null;}};
const gdFilled=()=>(S.kegs||[]).some(k=>k&&k.f);
const gdAnimals=()=>(S.coop&&typeof HENS!=='undefined'&&HENS.length>0)||(S.cows||0)>0;
const GD314_IDS=['auto_spr','auto_tractor','auto_hitch','mach_kettle','mach_keg','mach_still','butch_block','butch_use'];
LS_SIDE.push(
  {id:'auto_spr',title:'sprinklers',when:()=>!guideBusy()&&!!(S.benches&&S.benches.farm)&&S.day>=6&&!(S.sprPlaced||[]).length,
   say:'Tired of the watering can? At the farming bench you can make a brass sprinkler: one copper bar, one iron bar and three wood. Hold it and set it down in the field. Every morning it waters the squares around it, rain or no rain. You can have four.',
   begin:b=>{b.day=S.day;guidePin('gd_spr',gdAt('farm'),'Farming bench: a sprinkler','star');},ok:()=>(S.sprPlaced||[]).length>0,coins:20,
   done:'There. That patch waters itself now. Put the next one where the can takes you longest.'},
  {id:'auto_tractor',title:'the tractor',when:()=>!guideBusy()&&!gdTr()&&S.day>=10&&(guideOwnsLand()||S.coins>=1500||S.day>=14),
   say:`Hollis Pruitt’s garage, up Route 9 west of the farm, sells his old red tractor for ${typeof TRACTOR_PRICE!=='undefined'?TRACTOR_PRICE:2400}. Climb on in the yard and drive it over the field: it turns bare ground over three squares wide. Get off wherever you like and it stays parked there.`,
   begin:b=>{b.day=S.day;guidePin('gd_tr',gdGarage(),'Pruitt’s garage: the tractor','star');},ok:()=>!!gdTr(),coins:30,
   done:'It starts on the second try. Every time. Drive it slow round the stones.'},
  {id:'auto_hitch',title:'the drill and the reaper',when:()=>!guideBusy()&&!!gdTr()&&!gdTr().drill&&!gdTr().reaper,
   say:`The tractor can do more than plough. At the garage: a seed drill (${typeof DRILL_PRICE!=='undefined'?DRILL_PRICE:450}) sows tilled ground from the seeds you’ve picked as you drive over it, and a reaper (${typeof REAPER_PRICE!=='undefined'?REAPER_PRICE:900}) cuts the ripe crops into your bag. Hitch one on and drive the rows.`,
   begin:b=>{b.day=S.day;guidePin('gd_hitch',gdGarage(),'Pruitt’s garage: drill and reaper','star');},ok:()=>{const t=gdTr();return !!(t&&(t.drill||t.reaper));},coins:30,
   done:'Now one pass does a morning’s work. Your hands will think you’re showing off.'},
  {id:'mach_kettle',title:'the brewery',when:()=>!guideBusy()&&!(S.benches&&S.benches.brew)&&S.day>=9&&(inv('copper_bar')>=2||S.day>=13),
   say:'Grandpa used to brew. It all starts at the brew kettle: build it from his plans on the board by the woodpile, east of the cabin (four copper bars, twenty stone, fifteen wood). Barley and hops make ale wort; corn makes a mash for spirits.',
   begin:b=>{b.day=S.day;guidePin('gd_kettle',GD314.plans,'Plans board: the brew kettle','star');},ok:()=>!!(S.benches&&S.benches.brew),coins:20,
   done:'That’s his kettle. Read what’s chalked on the firebox before you use it.'},
  {id:'mach_keg',title:'a keg',when:()=>!guideBusy()&&!!(S.benches&&S.benches.brew)&&!gdFilled(),
   say:'Wort turns into ale in a keg. Make one at the furniture bench (eighteen wood, an iron bar), hold it and set it down on the farm. Mash barley and hops at the kettle, pour the wort into the keg, and three days later it’s ale. Bubbles at the bung mean it’s working; a glint means it’s ready.',
   begin:b=>{b.day=S.day;guidePin('gd_keg',gdAt('brew'),'Brew kettle: wort for a keg','star');},ok:()=>gdFilled(),coins:30,
   done:'Now leave it alone. Three days. Don’t open it to look.'},
  {id:'mach_still',title:'still, press and cask',when:()=>!guideBusy()&&!!(S.benches&&S.benches.brew)&&(gdFilled()||!!guideS().kegged)&&!(S.benches.still||S.benches.press),
   say:'For stronger things: corn mash in a keg turns to wash in two days, and the copper still on Grandpa’s plans runs it into white dog. An oak cask from the furniture bench ages that into whiskey over a week. The fruit press makes grape must for wine. Build the still or the press.',
   begin:b=>{b.day=S.day;guidePin('gd_still',GD314.plans,'Plans board: still or press','star');},ok:()=>!!(S.benches&&(S.benches.still||S.benches.press)),coins:30,
   done:'That’s a brewery. Ezra will want to know where you’re getting it.'},
  {id:'butch_block',title:'the butcher’s block',when:()=>!guideBusy()&&!(S.benches&&S.benches.butcher)&&S.day>=10&&gdAnimals(),
   say:'I don’t like this one, but you should know. The butcher’s block is on Grandpa’s plans too (twenty-five wood, two iron bars, six stone). A hen gives two dressed birds and bone meal; a cow gives beef, her hide and bone meal. It costs you the animal for good. You don’t have to.',
   begin:b=>{b.day=S.day;guidePin('gd_block',GD314.plans,'Plans board: the butcher’s block','star');},ok:()=>!!(S.benches&&S.benches.butcher),coins:20,
   done:'It’s out in the yard. Nobody’s making you use it.'},
  {id:'butch_use',title:'at the block',when:()=>!guideBusy()&&!!(S.benches&&S.benches.butcher)&&!(S.butchered>0)&&gdAnimals(),
   say:'If you do it: take a hen from the coop or a cow from the barn to the block, follow the knife along the joints, then weigh it out. The meat goes on the stove (a roast hen, a beef stew), the hide to the armour bench for a coat, the bones to bone meal. And don’t leave the yard dark that night.',
   begin:b=>{b.day=S.day;guidePin('gd_butch',gdAt('butcher'),'The butcher’s block','star');},ok:()=>S.butchered>0,coins:20,
   done:'It’s done. Wash your hands before you come in the store.'});
// one lesson at a time: these count as Caitlyn being busy too, so the other side lessons wait for them and they wait for the others
if(typeof GUIDE_ONE!=='undefined')for(const id of GD314_IDS)if(!GUIDE_ONE.includes(id))GUIDE_ONE.push(id);
// the keg lesson counts a keg that has been filled once, even after it was emptied
setInterval(()=>{try{if(gdFilled())guideS().kegged=1;}catch(e){}},3000);
// pins come down when their lesson is done; the butchery lessons are never required, so they let go after three days unused
setInterval(()=>{try{const L=S.ls&&S.ls.side;if(!L)return;
  for(const [id,pin] of [['auto_spr','gd_spr'],['auto_tractor','gd_tr'],['auto_hitch','gd_hitch'],['mach_kettle','gd_kettle'],['mach_keg','gd_keg'],['mach_still','gd_still'],['butch_block','gd_block'],['butch_use','gd_butch']]){
    const e=L[id];if(!e)continue;
    if(e.st==='on'&&/^butch_/.test(id)&&e.b&&e.b.day!=null&&S.day-e.b.day>=3){e.st='done';e.quiet=1;}
    if(e.st==='done')guideUnpin(pin);}}catch(e){}},2000);
// the label already says "Side lesson:", so no title repeats it (the business lessons' titles did: "Side lesson: Side lesson: shares")
for(const L of LS_SIDE)if(L.title)L.title=L.title.replace(/^Side lesson:\s*/i,'');
