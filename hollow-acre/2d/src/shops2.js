/* ================= the keepers live where they work. Every shop is its own room now (the forge on flagstones under slate
   plaster, the carpentry panelled, the feed store a log barn, the bait shop painted blue, the gas station's kiosk on red
   checkers, the Lantern Inn's common room in red damask), bigger than before, and each has a door at the back to where its
   keeper lives: Caitlyn's rooms behind the store, Hollis's room behind the garage, the rooms behind the forge, Nell's loft,
   Ezra's room in the barn, Corwin's back room, the innkeepers' rooms, the Ashbys' rooms behind the surgery. They go there when
   the shop shuts and sleep there; you'll find them at home. The back door is theirs: if you're not close to them and they're
   behind the counter, they'll stop you (four hearts, or dating them, and you're welcome). Each room has something of theirs in
   it worth looking at. ================= */
const SHOP_SHELL={store:'room_shop_store2',garage:'room_shop_garage2',shop_forge:'room_shop_forge2',shop_carp:'room_shop_carp2',shop_feed:'room_shop_feed2',
  shop_bait:'room_shop_bait2',home_lusk:'room_shop_lusk2',home_harlow:'room_shop_harlow2'};
for(const [k,sh] of Object.entries(SHOP_SHELL))if(ROOMS[k]&&SPR[sh])ROOMS[k].shell=sh;
// a piece of furniture whose collision box comes from its own sprite
const PF=(spr,lx,lz,dep,kind)=>{const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;return [spr,lx,lz,kind==='flat'?null:[-hw,-(dep||.4),hw,0],kind||undefined];};
const BEDF=[-.85,-2.1,.85,0];
const PRIV={
  store:{key:'priv_store',name:'Caitlyn’s rooms',home:'coyle',pdoor:6.5,owners:['mae','tobias','pip'],spots:{mae:[3.4,2.7],tobias:[5.2,3.9],pip:[2.0,3.9]},
    no:'“Hey. That’s where we live, farm kid. The shop’s out here.”',
    furn:[['in_bed',1.1,2.6,BEDF],['in_bed',5.9,2.6,BEDF],PF('in_desk',4.1,.95,.45),['in_mirror',2.3,-.45,null,'flat'],PF('in_floursack',6.55,4.4,.3),PF('in_tincrate',5.75,4.55,.3),PF('in_toychest',1.1,3.1,.3)],
    look:[3.5,1.45,'Danny’s drawings, kept flat under the blotter. Every one is of the cornfield. In the last one a door stands in the middle of the corn, and a very tall man is holding it open for a boy.']},
  garage:{key:'priv_garage',name:'Hollis’s room',home:'pruitt',pdoor:11.3,owners:['hollis'],spots:{hollis:[3.4,2.9]},
    no:'Hollis doesn’t look up. “Private.” He means it.',
    furn:[['in_bed',5.9,2.6,BEDF],PF('in_toolbox',1.2,1.1,.4),PF('in_tires',2.15,1.15,.3),PF('in_table',2.4,3.5,.45),PF('in_chair',1.35,3.55,.25),PF('in_oildrum',.75,4.3,.3),PF('in_enginestand',6.2,4.55,.3),PF('in_trolleyjack',4.9,4.6,.2),['in_photowall',2.6,-.45,null,'flat']],
    look:[3.4,.5,'Photographs of Wes, from the year he started at the garage: Wes with grease to the elbows, Wes asleep under a truck. Under the last one, in Hollis’s square capitals: NOT HIM. NOT THIS YEAR.']},
  shop_forge:{key:'priv_forge',name:'The rooms behind the forge',home:'brannock',pdoor:9.6,owners:['gideon'],spots:{gideon:[3.5,3.0]},
    no:'Gideon puts himself between you and the door without seeming to move. “No.”',
    furn:[['in_bed',1.1,2.6,BEDF],PF('in_stove',5.9,.95,.5),['in_smithhooks',3.6,-.45,null,'flat'],PF('in_candles',3.6,1.0,.3),PF('in_keg',.8,4.45,.4),PF('in_smithcorner',6.0,4.5,.35)],
    look:[3.6,1.15,'A jar on the shelf full of nails, every one bent the same way, toward the Mill Road. A tag tied round the lid: 153. Below it, newer: and one more.']},
  shop_carp:{key:'priv_carp',name:'Nell’s loft',home:'hartley',pdoor:9.6,owners:['nell'],spots:{nell:[3.6,3.2]},
    no:'“Ah ah. The loft’s mine, and it’s a mess.” Nell laughs. She doesn’t move away from the door.',
    furn:[['in_bed',5.9,2.6,BEDF],PF('in_coffin',.55,3.7,1.9),PF('in_sawplank',3.6,1.1,.3),['in_carppegs',5.0,-.45,null,'flat'],PF('in_lumberstack',6.0,4.5,.3)],
    look:[1.3,4.1,'Under a sheet, a long pine box, the lid not nailed down. It’s been measured for someone your height. On the lid Nell has written NOT YET, and then crossed out YET.']},
  shop_feed:{key:'priv_feed',name:'Ezra’s room in the barn',home:'bell',pdoor:9.6,owners:['ezra'],spots:{ezra:[3.0,3.0]},
    no:'“The animals don’t like folk back there,” Ezra says. “Neither do I.”',
    furn:[['in_bed',1.1,2.6,BEDF],PF('in_desk_plank',4.2,.95,.45),['in_feedcal',3.4,-.45,null,'flat'],PF('in_chairN',4.2,1.55,.2),PF('in_feedsack',6.4,3.9,.3),PF('in_sackopen',5.6,4.55,.3),['sacks',6.45,4.75,[-.45,-.3,.45,0]],PF('in_platscale',.8,4.5,.3)],
    look:[4.2,1.45,'A ledger of every animal Ezra has kept: forty years of names in pencil, and the day each one went. In October, every year, the names stop being animals’ names.']},
  home_lusk:{key:'priv_lusk',name:'Corwin’s back room',home:'lusk',pdoor:9.3,owners:['corwin'],spots:{corwin:[3.5,2.9]},
    no:'Corwin shakes his head once. “Employees only.” There have never been any employees.',
    furn:[['in_bedplain',5.9,2.6,BEDF],PF('in_desk_steel',2.2,.95,.45),PF('in_clock',4.7,.55,.3),['in_tinsign',5.95,-.6,null,'flat'],PF('in_chairN',2.2,1.55,.2),PF('in_gasdrum',.75,4.3,.35),PF('in_oilrack',6.35,4.45,.3)],
    look:[2.2,1.45,'A 1979 calendar from the Lusk Oil Company. Every day is crossed out in pen up to October. October has been crossed out so many times the page has torn through.']},
  home_harlow:{key:'priv_harlow',name:'The innkeepers’ rooms',home:'harlow',pdoor:12.9,owners:['tess','hob'],spots:{tess:[2.6,3.1],hob:[4.6,3.3]},
    no:'Tess catches your sleeve, kindly. “Guests stay out front, love.”',
    furn:[['in_bedbrass_w',1.35,2.6,[-1.15,-2.1,1.15,0]],PF('in_nightstand',2.95,1.0,.25),PF('in_desk_bureau',4.0,.95,.45),PF('in_chairN',4.0,1.55,.2),['in_keyboard_b',6.3,-.45,null,'flat'],PF('in_linentrunk',6.0,3.9,.3)],
    look:[4.0,1.45,'The old guest book. Every October the same guest signs in, in the same hand, for one night. This year’s line is blank and waiting, and the pen has been laid across it.']},
  home_ashby:{key:'priv_ashby',name:'The Ashbys’ rooms',home:'ashby',pdoor:8.35,owners:['lyle','vera'],spots:{lyle:[3.2,3.0],vera:[4.6,3.4]},
    no:'Lyle shakes his head. “That’s our home, not the surgery. Please.”',
    furn:[['in_bed',1.1,2.6,BEDF],['in_ironcotdoll',5.9,2.6,[-.6,-2.0,.6,0]],['in_painting_b',6.4,-.45,null,'flat'],PF('in_desk_roll',3.5,.95,.45),PF('in_medcab',.6,4.3,.3),PF('in_washstand',6.4,4.5,.3),PF('in_doctorbag',5.5,4.6,.2)],
    look:[5.9,3.0,'A suitcase under Vera’s bed, packed and strapped shut. On top, a bus timetable with every bus circled. None of the buses leave the valley.']}};
// the rooms themselves, out past every other room
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  for(const [parent,p] of Object.entries(PRIV)){const R0=ROOMS[parent];if(!R0||!SPR['room_'+p.key])continue;
    ROOMS[p.key]={ox,oz:-60,name:p.name,shell:'room_'+p.key,out:R0.out,furn:p.furn,parent,pdoor:p.pdoor};ox+=24;}}
const PRIV_OF_HOME={};for(const p of Object.values(PRIV))PRIV_OF_HOME[p.home]=p;
// ---- the back door: theirs to open
function privGate(parent){const p=PRIV[parent];const best=Math.max(0,...p.owners.map(id=>typeof hearts==='function'?hearts(id):0));
  const dating=p.owners.some(id=>typeof romDating==='function'&&romDating(id));if(best>=4||dating)return null;
  const R=ROOMS[parent];const at=p.owners.map(id=>npcById(id)).find(n=>n&&n.loc==='in'&&n.inWant!=='home'&&Math.abs(n.x-R.ox)<R.w+2&&Math.abs(n.z-R.oz)<R.d+2);
  return at?p.no:'Locked. Someone lives back there.';}
for(const [parent,p] of Object.entries(PRIV)){const R=ROOMS[parent];if(!R||!ROOMS[p.key])continue;
  const x=R.ox+p.pdoor,z=R.oz+.55;let it=interact.find(q=>Math.abs(q.x-x)<.01&&Math.abs(q.z-z)<.01);
  if(!it){it={x,z,r:.95,on:inRoom(parent),label:()=>'Door',ok:()=>true};interact.push(it);}
  it.act=function(){const no=privGate(parent);if(no){SFX.deny&&SFX.deny();toast(no,3);return;}
    const home=p.owners.map(id=>npcById(id)).filter(n=>n&&n.loc==='in'&&n.inWant==='home');
    if(home.length)setTimeout(()=>toast(`${home.map(n=>n.def.name.split(' ')[0]).join(' and ')} ${home.length>1?'look':'looks'} up. “Oh. Come in, then.”`,2.4),500);
    enterRoom(p.key);};
  // and something of theirs in there to look at
  const L=p.look,RP=ROOMS[p.key];interact.push({x:RP.ox+L[0],z:RP.oz+L[1],r:1.1,on:inRoom(p.key),label:()=>'Look',ok:()=>true,act(){toast(L[2],5,true);SFX.page&&SFX.page();}});}
// ---- out through the door you came in by: back into the shop, at its back wall
{const _lr=leaveRoom;leaveRoom=function(){const R=roomOf();if(!R||!R.parent)return _lr.apply(this,arguments);const Pr=ROOMS[R.parent];S.mode='trans';fade(1);SFX.thud(0,.25);
  setTimeout(()=>{S.room=R.parent;P.x=Pr.ox+R.pdoor;P.z=Pr.oz+1.05;P.dir='S';P.fx=0;P.fz=1;S.mode='play';fade(0);},380);};}
// ---- home is the back room now: that's where they are when they're not working, and where they sleep
{const _hp=homeRoomPos;homeRoomPos=function(n){const L=LIFE[n.def.id];const p=L&&PRIV_OF_HOME[L.home];const R=p&&ROOMS[p.key];
  if(R&&p.spots[n.def.id]){const s=p.spots[n.def.id];return [R.ox+s[0],R.oz+s[1]];}return _hp.apply(this,arguments);};}
