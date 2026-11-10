/* ================= houses with more than one room. The door drawn on the back wall of every house now opens: behind it is
   where they sleep and keep what they don't show visitors. Agnes keeps Ruth's room exactly as it was; the parsonage has the
   bedrooms, Ida's sheet music everywhere; Dunn has a back office with a cot for Wes; Cora's bedroom is full of report cards,
   June's of letters, Otto's net loft smells of the lake, Silas sleeps beside his tapes and clocks, the Quills share a room with
   Bram's drawings on every wall, the Fenns' rooms over the mill race, Maud's under the quarry ledgers, Iris's sewing room, Ada's
   room in the trapper's cabin, Nan and Finn's loft over the river. They go there at night and sleep there; in the day they're in
   the front room or out. It's their house: four hearts (or dating them) and you're welcome; otherwise, knock first.
   Each has something worth looking at, a little more of the valley's story. ================= */
const BED_F=[-.85,-2.1,.85,0];
const BF=(spr,lx,lz,dep,kind)=>{const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;return [spr,lx,lz,kind==='flat'?null:[-hw,-(dep||.4),hw,0],kind||undefined];};
const BACKS={
 home_agnes:{name:'Ruth’s room',owners:['agnes'],spots:{agnes:[3.5,3.4]},furn:[['in_bed',1.4,2.6,BED_F],['in_doll',1.4,2.61,null],['in_nightstand',2.55,1.2,[-.3,-.2,.3,0]],['in_vanity',.62,4.4,[-.45,-.25,.45,0]],['in_rug',3.5,3.6,null,'flat'],BF('in_candles',4.65,1.05,.3),['in_mirror',3.5,-.45,null,'flat'],BF('in_shelf_books',5.9,.62,.4)],
  look:[1.4,3.1,'Ruth’s bed is made. The sheets are fresh. There’s a dent in the pillow, warm, the size of a nine-year-old’s head. On the shelf her school shoes, polished every week for thirty years.']},
 home_hale:{name:'The parsonage bedrooms',owners:['hale','ida'],spots:{hale:[2.3,3.5],ida:[4.6,3.5]},furn:[['in_bed',1.1,2.6,BED_F],['in_bed_c',4.4,2.6,BED_F],BF('in_shelf_books',6.2,.62,.4),BF('in_kneeler',.85,4.45,.32),BF('in_candles',2.75,.9,.3),['in_rug_b',4.7,3.95,null,'flat'],BF('in_chairE',6.3,2.9,.25),BF('in_knit',5.45,3.25,.2)],
  look:[3.5,1.2,'Hymn sheets on every surface, Ida’s, covered in pencilled harmonies. In the margin of the Tithe hymn, over and over in Hale’s small hand: forgive me forgive me forgive me.']},
 home_dunn:{name:'Dunn’s back office',owners:['dunn','wes'],spots:{dunn:[2.0,3.6],wes:[5.6,3.6]},furn:[BF('in_filecab',.7,.85,.4),BF('in_desk',2.4,1.0,.45),['in_bed',5.9,2.6,BED_F],['in_mapboard',3.6,-.45,null,'flat'],BF('in_tripod',.9,4.1,.25),BF('in_bottles',6.35,2.85,.1),BF('in_planchest',6.0,4.35,.3)],
  look:[2.4,1.5,'A shoebox of drawing slips, a hundred and fifty years of them. Every slip in this year’s bundle says your name. One, at the bottom, says WES, and has been folded and unfolded until it’s soft.']},
 home_cora:{name:'Cora’s bedroom',owners:['cora'],spots:{cora:[3.5,3.4]},furn:[['in_bed',5.9,2.6,BED_F],['in_alphabet',.75,-.45,null,'flat'],BF('in_desk',1.6,1.0,.45),BF('in_chairN',1.7,1.6,.2),BF('in_shelf_books_b',3.6,.62,.4),BF('in_globe',2.85,1.45,.25),BF('in_satchel',.95,4.2,.3),BF('in_stool',6.35,4.1,.2),BF('in_primers',5.55,4.35,.25)],
  look:[1.6,1.5,'Report cards in neat stacks, one stack a year. Every year one card is never filled in. She has kept the blanks too, in their own drawer, tied with black ribbon.']},
 home_june:{name:'June’s bedroom',owners:['june'],spots:{june:[3.5,3.4]},furn:[['in_bed',1.1,2.6,BED_F],BF('in_shelf_mail',4.6,.62,.4),BF('in_oillamp',2.25,1.0,.2),BF('in_mailsacks',1.0,4.3,.3)],
  look:[4.6,1.2,'Letters June wrote to herself, one every birthday since she was nine, sealed, never opened. The one for this year is addressed to you.']},
 home_otto:{name:'Otto’s net loft',owners:['otto'],spots:{otto:[3.5,3.4]},furn:[['in_bed',5.9,2.6,BED_F],BF('in_rods',.7,.9,.3),['in_netwall',3.9,-.95,null,'flat'],BF('barrel',1.4,3.4,.3),BF('in_creel',1.0,4.4,.3),BF('in_bottles',2.15,3.55,.15)],
  look:[2.8,.8,'A photograph pinned under the nets: two boys in a rowboat, grinning, one holding up a fish. On the back: Otto & Nils, 1961. Nils’s face has been touched so many times it has worn white.']},
 home_silas:{name:'Silas’s bedroom',owners:['silas'],spots:{silas:[3.5,3.4]},furn:[['in_bed',1.1,2.6,BED_F],BF('in_clock',5.9,.55,.3),BF('in_candles',4.75,.9,.3),BF('in_shelf_books',3.0,.62,.4),BF('in_coffinbuild',6.0,4.3,.3),BF('in_coatstand',.8,4.2,.25)],
  look:[3.0,1.2,'Measuring tapes on hooks, dozens of them, each labelled with a year. He measures the drawn child with a new one every year, and never uses it again.']},
 home_quill:{name:'The Quills’ bedroom',owners:['orla','bram'],spots:{orla:[1.6,3.4],bram:[4.6,3.6]},furn:[['in_bed_b',1.1,2.6,BED_F],['in_bed_d',5.7,2.9,BED_F],['in_drawings',3.4,-.45,null,'flat'],['in_rug_c',2.7,3.95,null,'flat'],BF('in_crates',3.3,1.0,.4),BF('in_stool',4.3,3.2,.2),BF('in_plant',6.6,4.4,.25)],
  look:[3.5,1.3,'Bram’s drawings cover the wall, all from the treetops: the valley, the roads like the spokes of a wheel. In the corner of every one, very small, a tall dark shape standing in the corn, looking up at him.']},
 home_fenn:{name:'The mill house rooms',owners:['abel','della'],spots:{abel:[1.6,3.6],della:[2.9,3.9]},furn:[['in_bed_c',1.1,2.6,BED_F],['in_ironcot',6.35,2.6,[-.6,-2.0,.6,0]],BF('in_washstandm',3.9,.95,.4),BF('in_toolbox',6.3,4.45,.3),BF('in_rockS',1.75,4.45,.3),BF('in_floursack',.75,4.3,.3),BF('in_oillamp',6.6,.95,.25)],
  look:[3.5,1.2,'Della’s births books fill the shelf, one for every ten years. Abel has put a sack of the funeral flour under the bed, as if to keep it where he can see it.']},
 home_thorne:{name:'Maud’s room',owners:['maud'],spots:{maud:[3.5,3.4]},furn:[['in_bed',5.9,2.6,BED_F],BF('in_stoneblocks',1.0,.95,.4),BF('in_roughblock',5.9,4.3,.3),BF('in_keg',1.0,3.6,.4)],
  look:[3.0,1.5,'The quarry ledgers, back to 1871. Every block cut for the Tithe House is marked with a little drawing of a door. The last page has one block left uncut, and her great-grandmother’s note: not this one. Never this one.']},
 home_vale:{name:'Iris’s sewing room',owners:['iris'],spots:{iris:[3.5,3.4]},furn:[['in_bed',5.9,2.6,BED_F],BF('in_sewmachine',1.5,1.0,.4),BF('in_dressform',2.9,.95,.3),BF('in_clothbasket',1.5,2.0,.2),['in_mirror',3.6,-.45,null,'flat']],
  look:[1.6,1.5,'Paper patterns pinned to the wall: the Tithe’s good clothes, a hundred and fifty years of one pattern, let out a little each year as the children got older. This year’s is your size, and has been cut into strips.']},
 home_kerrigan:{name:'Ada’s room',owners:['ada','moss'],spots:{ada:[1.6,3.4],moss:[5.0,3.5]},furn:[['in_bed_d',1.1,2.6,BED_F],['in_bedplain',5.0,2.6,BED_F],BF('in_candles',2.9,.9,.3),BF('in_chairE',2.3,3.7,.25),BF('in_cane',2.1,2.3,.1),BF('in_snowshoes',4.9,4.3,.25),BF('in_pelts',6.3,4.1,.3)],
  look:[3.5,1.4,'Ada keeps no mirror and no pictures. Only candles, dozens, every one burned down to the same height: the height of a child’s shoulder.']},
 home_pike:{name:'Nan and Finn’s loft',owners:['nan','finn'],spots:{nan:[1.6,3.4],finn:[4.9,3.6]},furn:[['in_bed_c',1.1,2.6,BED_F],['in_childbed',5.4,2.9,[-.55,-1.9,.55,0]],BF('barrel',6.6,.95,.3),BF('in_toyboat',6.3,4.2,.25),['in_rug_d',2.9,3.95,null,'flat'],BF('in_stool',3.9,2.4,.2)],
  look:[5.6,1.2,'Finn’s windowsill is lined with river stones, painted with faces. One is turned face-down. Under it, scratched into the sill in a child’s writing: OLLIE SAYS NOT YET.']},
};
const BACK_OF_HOME={};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  for(const [parent,b] of Object.entries(BACKS)){const R0=ROOMS[parent];const key='back_'+parent.slice(5);if(!R0||!SPR['room_'+key])continue;
    ROOMS[key]={ox,oz:-60,name:b.name,shell:'room_'+key,out:R0.out,furn:b.furn,parent,pdoor:8.35};b.key=key;ox+=24;
    const home=Object.keys(HOMES).find(h=>HOMES[h].room===parent);if(home)BACK_OF_HOME[home]=b;}}
// ---- the door at the back: theirs to open
function backGate(b){const best=Math.max(0,...b.owners.map(id=>typeof hearts==='function'?hearts(id):0));const dating=b.owners.some(id=>typeof romDating==='function'&&romDating(id));
  if(best>=4||dating)return null;const n=b.owners.map(id=>npcById(id)).find(n=>n&&n.loc==='in');
  return n?`${n.def.name.split(' ')[0]} glances at the back door, and then at you. “That’s just where we sleep.” They don’t move.`:'Locked. It’s their bedroom.';}
for(const [parent,b] of Object.entries(BACKS)){const R=ROOMS[parent];if(!R||!b.key)continue;
  const x=R.ox+8.35,z=R.oz+.55;let it=interact.find(q=>Math.abs(q.x-x)<.01&&Math.abs(q.z-z)<.01);
  if(!it){it={x,z,r:.95,on:inRoom(parent),label:()=>'Door',ok:()=>true};interact.push(it);}
  it.act=function(){const no=backGate(b);if(no){SFX.deny&&SFX.deny();toast(no,3);return;}
    const home=b.owners.map(id=>npcById(id)).filter(n=>n&&n.loc==='in'&&n.inBack);
    if(home.length)setTimeout(()=>toast(`${home.map(n=>n.def.name.split(' ')[0]).join(' and ')} ${home.length>1?'look':'looks'} up. “Oh. Hello. Come in.”`,2.4),500);
    enterRoom(b.key);};
  const L=b.look,RB=ROOMS[b.key];interact.push({x:RB.ox+L[0],z:RB.oz+L[1],r:1.1,on:inRoom(b.key),label:()=>'Look',ok:()=>true,act(){toast(L[2],5.5,true);SFX.page&&SFX.page();}});}
// ---- at night they sleep in the back; in the day, the front room
{const _hp=homeRoomPos;homeRoomPos=function(n){const L=LIFE[n.def.id];const b=L&&BACK_OF_HOME[L.home];const R=b&&ROOMS[b.key];
  const night=S.hour>=21||S.hour<6.5;n.inBack=!!(R&&night&&b.spots[n.def.id]);
  if(n.inBack){const s=b.spots[n.def.id];return [R.ox+s[0],R.oz+s[1]];}return _hp.apply(this,arguments);};}
// bedtime and morning: whoever's at home moves between the front room and the back
setInterval(()=>{try{for(const n of npcs){if(n.loc!=='in'||n.inWant!=='home')continue;const L=LIFE[n.def.id];if(!L||!BACK_OF_HOME[L.home])continue;
  const want=S.hour>=21||S.hour<6.5;if(!!n.inBack!==want){const p=homeRoomPos(n);if(p){n.x=p[0];n.z=p[1];}}}}catch(e){}},2000);
