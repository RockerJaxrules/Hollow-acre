/* ================= #252 the house grows, the way a farmhouse does. After the hearth, Nell can build:
   - THE BIG HOUSE: the cabin knocked through into a long front room, with two doors in the back wall (one to the dining room,
     one to the stairs). Grandpa's bed moves to the far side of the hearth; there's room to turn round and to put things;
   - THE CELLAR: Nell breaks the chain on the floor hatch (the one that answers when you knock at night) and digs out a stone
     cellar under the cabin. Two kegs and an oak cask are built in down there, and in the cold and the dark everything brews
     and ages a day sooner. The underside of the hatch is scratched;
   - A DINING ROOM through the left-hand door: a long table, a sideboard, a clock. Food eaten at the table goes further (half
     as much again);
   - AN UPSTAIRS through the right-hand door: a bedroom under the eaves with a second bed you can sleep in, and room for
     whatever you make. A narrow door up there leads on to
   - THE ATTIC: Grandpa's trunk, and what he kept in it.
   Every room takes furniture you've made. Orders go in at Nell's counter (or on the Farm Plans board) like the cabin's steps,
   one job at a time. ================= */
HOUSE_TIERS[5]={name:'Build the big house',cost:1600,need:{wood:250,stone:120,iron_bar:8},days:4,ext:'cabin_t3',shell:'room_cabin3',
  desc:'Nell takes out the cabin’s inner wall and builds it through into a proper farmhouse: one long front room with the hearth at the heart of it, and two doors in the back wall, framed and hung, for whatever comes next.',
  done:'The big house is done. Nell walks the length of the front room twice, slowly, knocking on the walls. “Solid,” she says. Then, quieter: “He always said there was more house in here than you could see.”'};
const HX_EXT={
  cellar:{name:'Dig out the cellar',cost:600,need:{stone:80,wood:40},days:3,req:()=>houseTier()>=1,why:'Nell won’t dig under a roof that leaks. Mend the shack first.',
    desc:'Nell breaks the chain on the floor hatch and digs out a stone cellar under the cabin: shelving, two kegs and an oak cask built into the wall. Down there, in the cold and the dark, everything brews and ages a day sooner.',
    done:'The cellar is dug. Nell came up the ladder grey to the elbows and sat on the floor a while before she said anything. “The underside of that hatch,” she said. “You should sand it. Don’t read it first. Just sand it.”'},
  dining:{name:'Build a dining room',cost:900,need:{wood:150,iron_bar:4},days:3,req:()=>houseTier()>=5,why:'It goes through the left-hand door of the big house. Build the big house first.',
    desc:'Through the left-hand door: a dining room with a long table, a sideboard and a clock. Food eaten at that table goes further (half as much again).',
    done:'The dining room is finished. Nell set eight places at the long table “to see it right”, then took up seven again. She left the one at the head.'},
  upstairs:{name:'Put in an upstairs',cost:1200,need:{wood:200,stone:40,iron_bar:4},days:4,req:()=>houseTier()>=5,why:'The stairs go up behind the right-hand door of the big house. Build the big house first.',
    desc:'Behind the right-hand door, stairs up to a bedroom under the eaves: a second bed you can sleep in, a wardrobe, and room for whatever you make. There’s a narrow door up there that doesn’t go anywhere yet.',
    done:'The upstairs is in. Nell says the stairs creak on the seventh step and on no other. She says she’s planed it three times.'},
  attic:{name:'Open up the attic',cost:500,need:{wood:80},days:2,req:()=>!!(S.house.ext&&S.house.ext.upstairs),why:'The way up to the attic is the narrow door upstairs. Put the upstairs in first.',
    desc:'Nell opens the narrow door upstairs onto a ladder and boards out the attic under the roof. Grandpa used to keep his things up there.',
    done:'The attic is open. Nell left Grandpa’s trunk where she found it. “It’s not mine to move,” she said, and wouldn’t go back up.'}};
const HX_ROOMS=['cabin_cellar','cabin_dining','cabin_up','cabin_attic'];
const HX_EXT_ROOM={cellar:'cabin_cellar',dining:'cabin_dining',upstairs:'cabin_up',attic:'cabin_attic'};
function hxHas(k){return !!(S.house&&S.house.ext&&S.house.ext[k]);}
// ---- the rooms, laid out away from everything like the others
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  const F=(spr,x,z,dep,kind,flip)=>{const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;return [spr,x,z,kind==='flat'?null:[-hw,-(dep||.4),hw,0],kind||undefined,flip?1:undefined];};
  const mk=(k,name,from,furn)=>{if(!SPR['room_'+k])return;ROOMS[k]={ox,oz:-60,name,shell:'room_'+k,out:{x:0,z:0},from,furn};ox+=26;};
  mk('cabin_cellar','The cellar','cabin',[F('in_winerack',1.0,.75,.4),['in_walllantern',4.4,-.45,null,'flat'],F('in_shelf_jars',6.8,.62,.4),F('in_crocks',4.6,3.3,.3),
    F('in_floursack',.8,3.7,.3),F('in_crates',7.1,3.8,.4),F('in_eggcrate',6.0,4.3,.3),F('in_caskwine',2.0,4.4,.35)]);
  mk('cabin_dining','The dining room','cabin',[F('in_longtable',4.0,2.85,.45),F('in_chair',2.85,3.5,.25),F('in_chair',4.0,3.5,.25),F('in_chair',5.15,3.5,.25),
    F('in_chairE',1.8,2.75,.25),F('in_chairE',6.2,2.75,.25,undefined,1),F('in_cabinet',6.9,.75,.4),['in_painting_a',4.0,-.45,null,'flat'],['in_painting_b',1.7,-.45,null,'flat'],
    ['in_rugrect',4.0,3.15,null,'flat'],F('in_plant',7.4,4.9,.3),F('in_oillamp',.8,4.8,.3),F('in_lampstand',7.5,2.4,.3)]);
  mk('cabin_up','Upstairs','cabin',[F('in_bed',1.6,2.7,2.1),F('in_nightstand',2.95,1.1,.3),F('in_wardrobe',4.4,.75,.4),F('in_vanity',6.9,.85,.35),['in_rug_d',4.6,3.6,null,'flat'],
    F('in_rocker',7.6,3.4,.3),F('in_toychest',8.9,4.6,.3),F('in_lampstand',.7,4.8,.3)]);
  mk('cabin_attic','The attic','cabin_up',[['in_rafters',4.5,0.02,null,'flat'],F('in_hopechest',4.5,1.35,.45),F('in_crates',1.1,1.1,.4),F('in_archboxes',1.0,3.7,.4),F('in_dressform',7.8,1.2,.3),
    F('in_rockhorse',6.6,3.4,.3),F('in_linentrunk',3.0,4.0,.4),F('in_ironcotbare',7.6,4.2,.3),F('in_lampstand',.6,4.6,.3)]);}
// ---- the big house: its own furniture layout and where Grandpa's things stand in it
const HX_BIG_COMMON=[['in_hearth',3.3,.85,[-.9,-.4,.9,0]],['in_clock',4.75,.55,[-.3,-.3,.3,0]],['in_desk',6.6,1.0,[-.88,-.45,.88,0]],['in_mirror',7.6,-.45,null,'flat'],
  ['in_stove',8.9,1.0,[-.68,-.5,.68,0]],['in_kcounter',11.0,1.05,[-1.19,-.55,1.19,0]],['in_shelf_jars',13.2,.62,[-.7,-.4,.7,0]],['in_runner_h',8.1,1.9,null,'flat'],
  ['in_rug_c',3.4,3.3,null,'flat'],['in_rocker',2.3,3.0,[-.35,-.3,.35,0]],['in_tablecards',3.4,3.05,[-.5,-.3,.5,0]],['in_chairE',4.55,3.05,[-.3,-.25,.3,0]],
  ['in_table',11.0,3.6,[-.85,-.45,.85,0]],['in_chair',10.0,3.65,[-.3,-.25,.3,0]],['in_chair',12.0,3.65,[-.3,-.25,.3,0]],['in_chairE',12.75,3.75,[-.3,-.25,.3,0],undefined,1],['in_placeset',11.62,3.62,null],
  ['in_cellar',5.4,5.6,null,'flat'],['in_coatstand',6.8,6.2,[-.25,-.2,.25,0]],['in_bootbench',9.6,6.35,[-.6,-.25,.6,0]],['barrel',13.6,5.6,[-.4,-.3,.4,0]],['sacks',14.8,5.7,[-.5,-.3,.5,0]]];
// before the upstairs is in, Grandpa's bed stands in the far corner; after, it's carried up and a bookcase takes its place
const HX_BED_DOWN=[['in_bed',1.3,5.3,[-.85,-2.1,.85,0]]],HX_BED_UP=[['in_shelf_books',1.3,4.3,[-.75,-.4,.75,0]],['in_plant',.7,5.9,[-.25,-.2,.25,0]]];
const hxBig=()=>HX_BIG_COMMON.concat(hxHas('upstairs')?HX_BED_UP:HX_BED_DOWN);
CAB_AT.huge={desk:[6.55,1.4],mirror:[7.65,.3],mirror2:[7.65,.5],stove:[8.9,1.4]};
{const _cf=cabinFurn;cabinFurn=function(t){if(t>=5)return hxBig().filter(q=>SPR[q[0]]).map(q=>q.slice());return _cf(t);};}
{const _rb=rebuildCabin;rebuildCabin=function(t){_rb(t);if(t<5)return;const R=ROOMS.cabin;
    // (the step below the big house built the kitchen cabin; take that down and put the big house up)
    for(const a of roomWalls(R))dropRect(a);
    for(const [spr,lx,lz,f] of R.furn){const x=R.ox+lx,z=R.oz+lz;const o=OBJ.find(o=>!o.hide&&o.room==='cabin'&&!o.furnKey&&o.spr===spr&&Math.abs(o.x-x)<1e-6&&Math.abs(o.z-z)<1e-6);if(o)o.hide=true;if(f)dropRect([x+f[0],z+f[1],x+f[2],z+f[3]]);}
    R.shell='room_cabin3';const m=SPR[R.shell];if(!m){R.shell='room_cabin2';return;}R.w=m.room.w;R.d=m.room.d;R.door=m.room.door;R.furn=cabinFurn(t);
    for(const a of roomWalls(R))addRect(...a);
    for(const [spr,lx,lz,f,kind,flip] of R.furn){const o=obj(spr,R.ox+lx,R.oz+lz,{kind:kind||'furn',night:SPR[spr+'_n']?spr+'_n':null,room:'cabin',flip:!!flip});if(f)addRect(o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]);}};}
// the bed, the cellar hatch and the hearth's glow follow the layout
const HX_IT=(()=>{const R=ROOMS.cabin,f=(lx,lz)=>interact.find(i=>Math.abs(i.x-(R.ox+lx))<.01&&Math.abs(i.z-(R.oz+lz))<.01);return {bed:f(1.3,2.9),hatch:f(1.2,5.1)};})();
{const _hf=houseFit;houseFit=function(t){_hf(t<5?t:3);const R=ROOMS.cabin;
  if(t>=5){const at=CAB_AT.huge;for(const k in CAB_IT){const it=CAB_IT[k];if(it){it.x=R.ox+at[k][0];it.z=R.oz+at[k][1];}}}
  if(HX_IT.bed){HX_IT.bed.x=R.ox+1.3;HX_IT.bed.z=R.oz+(t>=5?5.6:2.9);}if(HX_IT.hatch){HX_IT.hatch.x=R.ox+(t>=5?5.4:1.2);HX_IT.hatch.z=R.oz+(t>=5?5.3:5.1);}};}
// with the upstairs in, you sleep up there
if(HX_IT.bed){const on0=HX_IT.bed.on;HX_IT.bed.on=function(){return (on0?on0.apply(this,arguments):true)&&!(houseTier()>=5&&hxHas('upstairs'));};}
// the place at the end of the table
interact.push({get x(){return ROOMS.cabin.ox+12.6;},get z(){return ROOMS.cabin.oz+4.0;},r:.7,on:()=>S.room==='cabin'&&houseTier()>=5,label:()=>'Look',ok:()=>true,act(){SFX.thud&&SFX.thud(0,.15);
  toast(isNight()?'The chair at the end of the table has been pulled out. It was pushed in when you came in.':'A place is laid at this end every morning: a plate, a cup, a spoon. You don’t lay it. By evening the plate has been eaten from.',4.2,isNight());if(isNight())mindHit&&mindHit(2);}});
// ---- moving between the rooms
function hxGo(k,from,outX,outZ){const R=ROOMS[k];if(!R)return;R.from=from;R.out={x:outX,z:outZ};SFX.thud&&SFX.thud(0,.25);enterRoom(k);}
// the cellar hatch: chained until Nell digs the cellar, then the way down
if(HX_IT.hatch){const it=HX_IT.hatch,a=it.act;it.label=()=>hxHas('cellar')?'Go down':'Cellar';
  it.act=function(){if(!hxHas('cellar'))return a.apply(this,arguments);hxGo('cabin_cellar','cabin',it.x,it.z+.55);
    if(!S.rgLook)S.rgLook={};if(!S.rgLook.hatchUnder&&isNight()){S.rgLook.hatchUnder=1;setTimeout(()=>toast('On the underside of the hatch, scratched deep into the boards, the same three words over and over: LET ME UP.',5,true),900);mindHit&&mindHit(5);}};}
// the two doors in the big house's back wall
for(const [k,lx,label,none] of [['dining',1.0,'Dining room','The door opens on the old outside wall of the cabin, boards and all. Nell framed it for a room that isn’t there yet.'],
    ['upstairs',14.9,'Go upstairs','Behind the door, the bare wall and the underside of the roof. Nell framed it for stairs that aren’t there yet.']])
  interact.push({get x(){return ROOMS.cabin.ox+lx;},get z(){return ROOMS.cabin.oz+.55;},r:.9,on:()=>S.room==='cabin'&&houseTier()>=5,label:()=>hxHas(k)?label:'Door',ok:()=>true,
    act(){if(!hxHas(k)){SFX.deny&&SFX.deny();toast(none,3.4);return;}hxGo(HX_EXT_ROOM[k],'cabin',ROOMS.cabin.ox+lx,ROOMS.cabin.oz+1.15);}});
// the narrow door upstairs
interact.push({get x(){return ROOMS.cabin_up?ROOMS.cabin_up.ox+9.0:0;},get z(){return ROOMS.cabin_up?ROOMS.cabin_up.oz+.55:0;},r:.9,on:()=>S.room==='cabin_up',label:()=>hxHas('attic')?'The attic':'Narrow door',ok:()=>true,
  act(){const R=ROOMS.cabin_up;if(!hxHas('attic')){SFX.thud&&SFX.thud(0,.3);toast(isNight()?'Something on the other side of the door is breathing slowly, in time with you. When you stop, it stops.':'Nailed shut, top and bottom. There are newer nails than the others.',3.6,isNight());if(isNight())mindHit&&mindHit(3);return;}
    hxGo('cabin_attic','cabin_up',R.ox+9.0,R.oz+1.15);}});
// ---- what each room is for
// the cellar's built-in kegs and cask: everything down there is ready a day sooner
function hxCellarKegs(){if(!hxHas('cellar')||typeof S.kegs==='undefined')return;const R=ROOMS.cabin_cellar;if(!R)return;const want=[['brew_keg',2.4],['brew_keg',3.55],['brew_cask',5.2]];let changed=false;
  for(const [t,lx] of want){if(!S.kegs.some(k=>k.cel&&k.t===t&&Math.abs(k.x-(R.ox+lx))<.01)){S.kegs.push({t,x:R.ox+lx,z:R.oz+1.3,f:null,cel:1});changed=true;}}
  if(changed&&typeof kegSync==='function')kegSync();}
{const _ks=typeof kegSync==='function'?kegSync:null;if(_ks)kegSync=function(){for(const k of S.kegs||[])if(k.cel&&k.f&&!k.f.cel){k.f.d=Math.max(S.day+1,k.f.d-1);k.f.cel=1;}return _ks.apply(this,arguments);};}
// in the dining room food goes further
{const _e=eat;eat=function(e,h,name){if(S.room==='cabin_dining'){e=Math.round(e*1.5);h=Math.round((h||0)*1.5);setTimeout(()=>toast('At the table, it goes further.',1.6),1900);}return _e.call(this,e,h,name);};}
// a second bed upstairs, and Grandpa's trunk in the attic
interact.push({get x(){return ROOMS.cabin_up?ROOMS.cabin_up.ox+1.6:0;},get z(){return ROOMS.cabin_up?ROOMS.cabin_up.oz+3.0:0;},r:1.3,on:()=>S.room==='cabin_up',label:()=>'Sleep',ok:()=>true,act(){if(S.hour<18&&typeof sleepEarly==='function'){sleepEarly();return;}sleep();}});
interact.push({get x(){return ROOMS.cabin_attic?ROOMS.cabin_attic.ox+4.5:0;},get z(){return ROOMS.cabin_attic?ROOMS.cabin_attic.oz+1.75:0;},r:1.1,on:()=>S.room==='cabin_attic',label:()=>'Grandpa’s trunk',ok:()=>true,
  act(){SFX.page&&SFX.page();if(!S.rgLook)S.rgLook={};
    if(!S.rgLook.atticTrunk){S.rgLook.atticTrunk=1;const t='Under a quilt: a christening gown, folded small. A photograph of this house with nobody in the windows, except one. A ledger in Grandpa’s hand, one line a year since he was a boy: the date, the weather, “Kept the lantern lit.” The last line is in different handwriting. It says your name, and “Next.”';
      addLore&&addLore('Grandpa’s trunk: '+t);mindHit&&mindHit(6);openNote(`<h3>Grandpa’s trunk</h3><p>${t}</p>`);}
    else openNote('<h3>Grandpa’s trunk</h3><p>The gown, the photograph, the ledger. In the photograph the face in the window has moved to the next window along.</p>');}});
// furniture you've made goes in whichever room of the house you're standing in
{const _sp=startPlace;startPlace=function(o){if(o&&o.room==='cabin'&&HX_ROOMS.includes(S.room))o=Object.assign({},o,{room:S.room});return _sp.call(this,o);};}
{const _pf=placeFurnAt;placeFurnAt=function(k,x,z){const n=OBJ.length;const r=_pf.apply(this,arguments);if(HX_ROOMS.includes(S.room))for(let i=n;i<OBJ.length;i++)if(OBJ[i].room==='cabin')OBJ[i].room=S.room;return r;};}
// ---- ordering: the big house after the hearth, then the rooms, one job at a time
function hxBusy(){return !!(S.house.build||S.house.xbuild);}
{const _hr=houseRow;houseRow=function(where){const t=houseTier(),X=S.house.xbuild;
  if(X){const E=HX_EXT[X.k],left=Math.max(0,X.done-S.day);return {k:'house',name:`House: ${E.name.toLowerCase()}`,desc:`Nell’s working on it. ${left<=1?'Done tomorrow morning.':`Done in ${left} days.`}`,price:0,can:false,btn:'Building',why:'Nell’s already building it. One job at a time.'};}
  if(t===4&&!S.house.build){const T=HOUSE_TIERS[5];return {k:'house',name:`House: ${T.name.toLowerCase()}`,desc:`${where==='plans'?'Nell Hartley builds it (Hartley Carpentry on Market Lane, just east of the crossroads). ':''}${T.desc} Takes ${T.days} days.`,price:T.cost,need:T.need,can:true,btn:'Order',
    buy(){S.house.build={tier:5,done:S.day+T.days};toast(where==='plans'?'You pin the order to the board. By evening Nell has taken it.':'Nell writes it in her book. “Big job. I’ll start in the morning.”',3);}};}
  if(t>=5&&!S.house.build)return {k:'house',name:'The big house',desc:'“That’s the house,” Nell says. “The rest is rooms.”',price:0,can:false,btn:'Done',why:'The big house is finished.'};
  return _hr(where);};}
function hxRows(where){S.house.ext=S.house.ext||{};const out=[];for(const [k,E] of Object.entries(HX_EXT)){if(hxHas(k)||(S.house.xbuild&&S.house.xbuild.k===k))continue;const ok=E.req();
    out.push({k:'house_'+k,name:`House: ${E.name.toLowerCase()}`,desc:`${E.desc} Takes ${E.days} days.`,price:E.cost,need:E.need,can:ok&&!hxBusy(),btn:'Order',why:!ok?E.why:'Nell’s already building something. One job at a time.',
      buy(){S.house.xbuild={k,done:S.day+E.days};toast(where==='plans'?'You pin the order to the board. By evening Nell has taken it.':'Nell writes it in her book. “I’ll start in the morning.”',3);}});}
  return out;}
{const _carp=vendors.v_carp.rows;vendors.v_carp.rows=()=>{const r=_carp();r.splice(2,0,...hxRows('carp'));return r;};}
{const _pl=vendors.plans.rows;vendors.plans.rows=()=>{const r=_pl();r.splice(1,0,...hxRows('plans'));return r;};}
// the morning a room is finished
{const _nd=newDay;newDay=function(m,p){_nd(m,p);const X=S.house&&S.house.xbuild;if(!X)return;
  if(S.day>=X.done){S.house.ext=S.house.ext||{};S.house.ext[X.k]=1;S.house.xbuild=null;if(X.k==='cellar')hxCellarKegs();if(X.k==='upstairs'&&houseTier()>=5){HCAB.built=-1;houseApply();}const E=HX_EXT[X.k];setTimeout(()=>openNote(`<h3>${E.name}</h3><p>${E.done}</p>`),900);}
  else setTimeout(()=>toast(X.k==='cellar'?'A pick, somewhere under the floor. Nell’s been down there since dawn.':'Sawing from inside the house. Nell’s been here since dawn.',2.4),1200);};}
// saves: the rooms and the cellar's kegs come back with them
{const _lg=loadGame;loadGame=function(d){_lg(d);S.house.ext=S.house.ext||{};try{hxCellarKegs();}catch(e){}};}
S.house.ext=S.house.ext||{};
