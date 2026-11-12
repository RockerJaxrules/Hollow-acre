/* ================= #314 the rest of the farm, chained into Caitlyn's tutorial (owner: "add the automation and stuff, machines and
   butchery as well" ... "all have to be chained in tutorial"). After the coop, her lessons carry straight on, one after another:
   sprinklers; the land office and the ledger; a share; the farm book, a hand and their seed box; the brew kettle and a keg;
   the butcher's block (optional); your own shop and running it; growing a shop; the tractor and its drill or reaper; the still
   or the press. The business, land and machine lessons that used to pop up on their own on a given day are now these steps.
   A step you've already done is passed over; tapping the lesson bar lets you skip the one you're on; the butchery steps,
   which are never required, move on by themselves after two days. ================= */
const GD314={plans:{x:9.9,z:-7.7}};
const gdAt=k=>{try{const p=BENCH_POS[k];if(p)return {x:p.x,z:p.z+.8};}catch(e){}return GD314.plans;};
const gdGarage=()=>{try{const o=ROOMS.garage&&ROOMS.garage.out;if(o)return {x:o.x,z:o.z+.4};}catch(e){}return {x:-33.7,z:-9.5};};
const gdHall=()=>{try{return guideHall();}catch(e){return {x:57.4,z:-10.2};}};
const gdTr=()=>{try{return EMP().tractor||null;}catch(e){return null;}};
const gdFilled=()=>(S.kegs||[]).some(k=>k&&k.f);
const gdOwn=()=>S.biz&&S.biz.own;
const gdStake=()=>{try{return Object.values(bgS().stakes||{}).some(o=>(o[bgMe()]||0)>0);}catch(e){return false;}};
const gdGrow=()=>{try{return Object.values(bgS().grow||{}).some(g=>Object.values(g).some(v=>v>0));}catch(e){return false;}};
const gdHands=()=>{try{return (EMP().hands||[]).length>0;}catch(e){return false;}};
const gdBox=()=>{try{return Object.values(handBox().seeds).some(n=>n>0);}catch(e){return false;}};
const gdB=k=>!!(S.benches&&S.benches[k]);
const CH314=[
  {id:'c_spr',t:'Sprinklers',at:()=>gdAt('farm'),say:'Tired of the watering can? At the farming bench you can make a brass sprinkler: one copper bar, one iron bar and three wood. Hold it and set it down in the field. Every morning it waters the squares around it, rain or no rain. You can have four.',
   goal:()=>'Make a sprinkler at the farming bench and set it in the field',ok:()=>(S.sprPlaced||[]).length>0,coins:20,done:'There. That patch waters itself now. Put the next one where the can takes you longest.'},
  {id:'c_land',t:'The land office',at:gdHall,say:'Want a bigger field? Deeds are sold at the land office inside the Town Hall in Marrow Hollow, at any hour. Every plot for sale has a FOR SALE sign on it, and the bank counter lends on land: a fifth down, a little each morning.',
   goal:()=>'Open the land office in the Town Hall',ok:()=>!!guideS().land,coins:15,done:'That’s the land office. Buy a plot whenever you’re ready, and it’s yours to clear and plant.'},
  {id:'c_ledger',t:'The ledger',at:gdHall,say:'Money can make money here. At the land office there’s a ledger: buy a share of a town shop and it pays you every day from what the town buys there, or open your own: a produce stand, a kitchen (a little restaurant) or a taproom. Open it and have a look.',
   goal:()=>'Open The ledger at the land office',ok:()=>!!guideS().invest,coins:15,done:'Shares on one page, your own shop on the other. Start small.'},
  {id:'c_share',t:'Buy a share',at:gdHall,say:'Shares first. In the ledger, on the Shares page, pick any shop and buy 5%. Every day the town shops there and you get your share of the till, and a cut whenever another player buys there too.',
   goal:()=>'Buy a share of a town shop',ok:gdStake,coins:20,done:'That’s your first share. Watch the ledger: it shows yesterday’s customers and what you were paid.'},
  {id:'c_book',t:'The farm book',at:gdHall,say:'When there’s more field than you can work, hire hands. Open the farm book (in the land office, or on Grandpa’s desk at home): Dell waters, the Kettle twins pick, Old Merritt sows, Hannah clears and tills. They’re paid at dawn.',
   goal:()=>'Open the farm book',ok:()=>!!guideS().hands,coins:15,done:'That’s the farm book. Everything that grows the farm is in there.'},
  {id:'c_hand',t:'Hire a hand',at:gdHall,say:'Hire one of them in the farm book. Keep a few coins in your purse for their wages each morning, or nobody works that day.',
   goal:()=>'Hire a farmhand',ok:gdHands,coins:20,done:'You’ll see them out on the land in the mornings.'},
  {id:'c_box',t:'The seed box',at:()=>{try{return {x:HAND_BOX_AT.x,z:HAND_BOX_AT.z+.5};}catch(e){return GD314.plans;}},say:'Dell waters and the Kettle twins pick on their own, but Old Merritt can only sow what’s in the seed box at the corner of Grandpa’s field. Put some seeds in it.',
   goal:()=>'Put seeds in the hands’ seed box',ok:gdBox,coins:15,done:'Merritt will sow it tomorrow at first light.'},
  {id:'c_kettle',t:'The brew kettle',at:()=>GD314.plans,say:'Grandpa used to brew. It all starts at the brew kettle: build it from his plans on the board by the woodpile, east of the cabin (four copper bars, twenty stone, fifteen wood). Barley and hops make ale wort; corn makes a mash for spirits.',
   goal:()=>'Build the brew kettle from Grandpa’s plans',ok:()=>gdB('brew'),coins:20,done:'That’s his kettle. Read what’s chalked on the firebox before you use it.'},
  {id:'c_keg',t:'A keg',at:()=>gdAt('brew'),say:'Wort turns into ale in a keg. Make one at the furniture bench (eighteen wood, an iron bar), hold it and set it down on the farm. Mash barley and hops at the kettle, pour the wort into the keg, and three days later it’s ale. Bubbles at the bung mean it’s working; a glint means it’s ready.',
   goal:()=>'Set down a keg and fill it with wort',ok:()=>gdFilled()||!!guideS().kegged,coins:30,done:'Now leave it alone. Three days. Don’t open it to look.'},
  {id:'c_block',t:'The butcher’s block',optional:1,at:()=>GD314.plans,say:'I don’t like this one, but you should know. The butcher’s block is on Grandpa’s plans too (twenty-five wood, two iron bars, six stone). A hen gives two dressed birds and bone meal; a cow gives beef, her hide and bone meal. It costs you the animal for good. You don’t have to.',
   goal:()=>'Build the butcher’s block (you don’t have to)',ok:()=>gdB('butcher'),coins:15,done:'It’s out in the yard. Nobody’s making you use it.'},
  {id:'c_butcher',t:'At the block',optional:1,at:()=>gdAt('butcher'),say:'If you do it: take a hen from the coop or a cow from the barn to the block, follow the knife along the joints, then weigh it out. The meat goes on the stove (a roast hen, a beef stew), the hide to the armour bench for a coat, the bones to bone meal. And don’t leave the yard dark that night.',
   goal:()=>'Use the butcher’s block (you don’t have to)',ok:()=>S.butchered>0||!gdB('butcher'),coins:15,done:'It’s done. Wash your hands before you come in the store.'},
  {id:'c_shop',t:'Your own shop',at:gdHall,say:'Want a place of your own? In the ledger, open the second page. Type a name (spaces and all), then pick what it is: a produce stand, a kitchen (a little restaurant, for meals you cook) or a taproom (for drinks). It costs 1500 for the lease, and your sign goes up on the square.',
   goal:()=>'Open your own shop in the ledger',ok:()=>!!gdOwn(),coins:30,done:'Your name’s over the door. Now it needs someone behind the counter and something on the shelves.'},
  {id:'c_run',t:'Running it',at:()=>{try{return {x:BIZ_SIGN.at.x,z:BIZ_SIGN.at.z+.6};}catch(e){return gdHall();}},say:'Nothing sells without staff and stock. On your shop’s page, hire someone from town (they’re paid each evening from the till), then press Stock to put your produce, meals or drinks on the shelves. Every evening the town buys what it can; take the till whenever you like.',
   goal:()=>'Hire staff and stock your shop',ok:()=>{const o=gdOwn();return !!(o&&(o.staff||[]).length&&(o.stock||[]).length);},coins:30,done:'Open for business. Keep it stocked, keep your people paid, and the till fills up.'},
  {id:'c_grow',t:'Growing a shop',at:gdHall,say:'With 10% of a shop you can help it grow. In the ledger, under the shop: stock a new line (from 10%), hire them a hand (20%), take on the building next door (30%), and at 50% you’re partners and can open a branch in Wickham.',
   goal:()=>'Grow a town shop you own a share of',ok:gdGrow,coins:30,done:'Go and look at the shop: the new goods are out front, and on its list.'},
  {id:'c_tractor',t:'The tractor',at:gdGarage,say:`Hollis Pruitt’s garage, up Route 9 west of the farm, sells his old red tractor for ${typeof TRACTOR_PRICE!=='undefined'?TRACTOR_PRICE:2400}. Climb on in the yard and drive it over the field: it turns bare ground over three squares wide. Get off wherever you like and it stays parked there.`,
   goal:()=>'Buy the tractor at Pruitt’s garage',ok:()=>!!gdTr(),coins:30,done:'It starts on the second try. Every time. Drive it slow round the stones.'},
  {id:'c_hitch',t:'The drill and the reaper',at:gdGarage,say:`The tractor can do more than plough. At the garage: a seed drill (${typeof DRILL_PRICE!=='undefined'?DRILL_PRICE:450}) sows tilled ground from the seeds you’ve picked as you drive over it, and a reaper (${typeof REAPER_PRICE!=='undefined'?REAPER_PRICE:900}) cuts the ripe crops into your bag.`,
   goal:()=>'Hitch a seed drill or a reaper to the tractor',ok:()=>{const t=gdTr();return !!(t&&(t.drill||t.reaper));},coins:30,done:'Now one pass does a morning’s work. Your hands will think you’re showing off.'},
  {id:'c_still',t:'Still, press and cask',at:()=>GD314.plans,say:'For stronger things: corn mash in a keg turns to wash in two days, and the copper still on Grandpa’s plans runs it into white dog. An oak cask from the furniture bench ages that into whiskey over a week. The fruit press makes grape must for wine. Build the still or the press.',
   goal:()=>'Build the copper still or the fruit press',ok:()=>gdB('still')||gdB('press'),coins:30,done:'That’s everything I know about this place. You don’t need me now. …You’ll still come by the store, won’t you? Promise me.'}];
for(const L of CH314){L.chain=1;L.begin=b=>{b.day=S.day;};LESSONS.push(L);}
// the coop is no longer the last lesson
{const C=LESSONS.find(L=>L.id==='coop');if(C){C.say=C.say.replace(/^Last lesson\.\s*/,'');C.done='That’s the farm on its feet. There’s more to this valley than the farm, though. Keep up.';}}
// a step you've already done is passed over, without its reward and without Caitlyn saying it
{const _lb=lsBegin;lsBegin=function(i){let j=i;while(LESSONS[j]&&LESSONS[j].chain){let done=false;try{done=!!LESSONS[j].ok({});}catch(e){}if(!done)break;j++;}return _lb.call(this,j);};}
// the optional steps move on by themselves after two days left alone
setInterval(()=>{try{if(S.mode!=='play'||S.paused||S.tut.off)return;const L=LESSONS[S.ls.i];if(!L||!L.optional||!S.ls.base||S.ls.base.day==null)return;
  if(S.day-S.ls.base.day>=2)lsBegin(S.ls.i+1);}catch(e){}},2000);
// tapping the lesson bar: as well as skipping all of Caitlyn's lessons, you can skip just this one
{const el=$('lesson');if(el)el.addEventListener('click',()=>{setTimeout(()=>{try{const L=LESSONS[S.ls.i],nt=$('noteText');if(!L||!nt||$('note').hidden||$('lsSkipOne'))return;
  nt.insertAdjacentHTML('beforeend','<p style="font-size:12px;opacity:.7"><a href="#" id="lsSkipOne">Skip this step</a></p>');
  $('lsSkipOne').onclick=ev=>{ev.preventDefault();$('note').hidden=true;S.paused=false;lsBegin(S.ls.i+1);};}catch(e){}},0);});}
// the lessons these replace no longer pop up on their own (their pins come down in games that had them open)
{const GONE=['land','invest','hands','biz_shares','biz_grow','biz_own','biz_run','hands_box'];const PIN={land:'land',invest:'invest',hands:'hands',biz_shares:'bizs',biz_grow:'bizg',biz_own:'bizo',biz_run:'bizr',hands_box:'handbox'};
  for(let k=LS_SIDE.length-1;k>=0;k--)if(GONE.includes(LS_SIDE[k].id))LS_SIDE.splice(k,1);
  setTimeout(()=>{try{S.ls.side=S.ls.side||{};for(const id of GONE){if(S.ls.side[id]&&S.ls.side[id].st==='on')S.ls.side[id].st='done';guideUnpin(PIN[id]);}}catch(e){}},1500);}
// a keg that has been filled once counts, even after it's emptied
setInterval(()=>{try{if(gdFilled())guideS().kegged=1;}catch(e){}},3000);
// the label already says "Side lesson:", so no title repeats it
for(const L of LS_SIDE)if(L.title)L.title=L.title.replace(/^Side lesson:\s*/i,'');
