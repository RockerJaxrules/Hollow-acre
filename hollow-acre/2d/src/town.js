/* ================= Marrow Hollow: twelve people, each with a home, a job and a day. They walk the streets to get there. ================= */
// ---- six more townsfolk
const NEWFOLK=[
  {id:'silas',name:'Silas Crane',role:'Sexton and gravedigger',nightPos:[18,-6.2],
    lines:['Digging. Always digging. Ground’s soft this year. Soft ground’s a kindness.','Your grandfather paid for his plot in ’62. Paid for yours too, while he was at it.','I measure everyone who comes through town. Habit. You’re five foot nine. Give or take.'],
    night:['Shovel’s ready.','Don’t mind me. Just counting.','It likes them fresh.']},
  {id:'june',name:'June Pruitt',role:'Carries the mail, knows everything',nightPos:[24,-5.6],
    lines:['You’re the Marsh kid! I’ve had a letter for you since August. Since before you knew you were coming. Isn’t that funny?','Uncle Hollis says I talk too much. I say he talks too little. We balance out.','Everybody’s mail tells you who they are. Yours is all from one address, and it isn’t one I deliver to.'],
    night:['No mail after dark.','I already know what the letter says.','Stamp’s been licked. Not by me.']},
  {id:'otto',name:'Otto Lindqvist',role:'Fishes the pond, reads the weather',nightPos:[-20,-5.8],
    lines:['Red sky at morning, somebody’s mourning. Old saying. My saying.','Fish don’t bite in October. They look up. Like they’re waiting for something to fall in.','Fifty years on that pond. Only thing I ever caught that didn’t want to be caught was your grandfather’s hat.'],
    night:['Wind’s from the corn.','Water’s too still.','Go on home. I’ll keep watch. I always keep watch.']},
  {id:'cora',name:'Cora Vance',role:'Schoolteacher, counts things',nightPos:[26.5,-4.2],
    lines:['Nine pupils this year. Eight next year. I don’t make the numbers, I only teach them.','Tobias is bright. Too bright. Bright children ask why the empty desk is always left empty.','Would you like to know how many days until the thirty-first? I keep the count on the blackboard. The children like to help.'],
    night:['Eleven. Ten. Nine.','Sit up straight. It’s watching.','I’ve marked you present.']},
  {id:'wes',name:'Wes Dunn',role:'The sheriff’s boy, fixes cars with Hollis',nightPos:[-15,-6.2],
    lines:['You drove in? From outside? What’s it like? Is it — never mind. Dad’s watching.','I’ve tried leaving four times. Road just loops back to the farm sign. Don’t tell Dad I told you.','When your car’s fixed, take me with you. Please. I won’t take up much room.'],
    night:['Dad says I have to be out here.','I’m sorry. I’m so sorry.','Run. When it’s time, run.']},
  {id:'ida',name:'Ida Hale',role:'The pastor’s wife, plays the organ',nightPos:[29,-7.8],
    lines:['A slice of pie, dear? It’s rhubarb. Everything’s rhubarb this year. Nothing else would take.','I play the same hymn every Sunday. Nobody knows the words but me now, and I won’t teach them.','Arthur hasn’t slept a whole night since September. I hum to him. It helps one of us.'],
    night:['Hush now. Hush.','The hymn’s for you, dear.','♪ …and the harvest comes in, and the harvest comes in… ♪']}];
for(const d of NEWFOLK){d.day=[0,0];d.path=[[0,0]];NPCDEF.push(d);const n={def:d,x:0,z:0,dir:'S',clip:'idle',t:Math.random()*4,wp:0,wait:0,vis:true,spd:0};npcs.push(n);
  const i=npcs.length-1;interact.push({npc:i,x:0,z:0,r:1.7,on:()=>npcs[i].vis,label:()=>'Talk',ok:()=>true,act(){talk(npcs[i]);}});}
Object.assign(PEOPLE,{
  silas:{voice:'dry',loves:['pumpkin'],likes:['turnip','egg'],hates:['mushroom'],
    talk:[['Morning. Mind the open graves. They’re not for anyone yet.','I’ve buried everybody you’ve heard of. Some twice.'],['Your grandpa came by every Sunday. Left flowers on graves with no names.','The church floor creaks over the crypt. I oil the boards. It still creaks.'],['When it’s your turn, I’ll dig it proper. Deep. So nothing can come back up wrong.']],
    gift:{love:'A good gourd. I’ll set it on a grave nobody visits.',like:'Thank you kindly.',hate:'Those grow on the dead. Did you know that?',meh:'Hm.'},
    events:[{h:3,title:'The empty plots',text:`Silas leans on his shovel by a row of headstones with names but no dates. <q>One for every Tithe. We put the stone up the day the lot is drawn.</q><br><br>The newest one is still pale and sharp. It already says MARSH.`,lore:'The graveyard keeps a headstone for every Tithe, carved the day the lot is drawn. There is already one marked Marsh.'}]},
  june:{voice:'bright',loves:['egg','corn'],likes:['turnip','pumpkin'],hates:['fish'],
    talk:[['Got anything to post? No? Everybody says no. Then they write at midnight and I find it in the box with no stamp.','Mrs. Abernathy writes to Ruth every week. I deliver them to the well.'],['Here’s a secret: Sheriff Dunn writes letters to himself. Same handwriting as the lots.','The letter with your name on it is warm. Every morning it’s warm.'],['If I opened it, would that count as tampering, or as saving you? I’ve thought about it a lot.']],
    gift:{love:'For me? Nobody gives the mail lady anything!',like:'Aw, thanks!',hate:'Ugh, it’s looking at me.',meh:'Thanks, I guess!'},
    events:[{h:3,title:'The letter',text:`June holds out an envelope, yellowed, addressed in your grandfather’s hand. The postmark is next week.<br><br><q>It keeps coming back to the bag. Every route.</q> Inside, one line: <i>Don’t let them read your name.</i>`,lore:'A letter from Elias, postmarked a week in the future: “Don’t let them read your name.”'}]},
  otto:{voice:'old',loves:['fish','corn'],likes:['egg'],hates:['pumpkin'],
    talk:[['Pond’s deeper than it looks. Deeper than it was.','Mist on the water means somebody’s thinking about you.'],['I pulled a boot out in ’99. Child’s size. I put it back. Was that wrong?','When the geese go quiet, go indoors. They’re smarter than us.'],['If you go in the pond, go in with your eyes open. That’s all I’ll say.']],
    gift:{love:'Now that’s a fish. Or good corn. Either.',like:'Obliged.',hate:'Keep those faces away from the water.',meh:'Mm.'},
    events:[{h:3,title:'What’s under the dock',text:`Otto lifts a plank off the dock. Underneath, tied to the post with fishing line: a ring of keys, a hair ribbon, a pocketknife.<br><br><q>Things it gives back. Every October something floats up.</q> The pocketknife is engraved E.M.`,lore:'Under the dock Otto keeps the things the pond gives back: Ruth’s ribbon, and your grandfather’s pocketknife.'}]},
  cora:{voice:'prim',loves:['turnip','egg'],likes:['corn'],hates:['mushroom'],
    talk:[['Good morning. You’re late. Everyone is late, that’s why I say it.','Tobias spelled “harvest” with two Vs today. I let it stand.'],['There’s a desk at the back of my room nobody sits in. It has a new name carved in it every year.','I counted the stalks in your grandfather’s field once. Ten thousand and one. It’s always one more.'],['I can’t teach the children to run. I can teach them to count to the thirty-first. It’s the same lesson.']],
    gift:{love:'Simple and tidy. Thank you.',like:'How thoughtful.',hate:'Not in my classroom.',meh:'Noted.'},
    events:[{h:3,title:'The empty desk',text:`Cora unlocks the schoolroom cupboard. Inside, a stack of slates, one for every year since 1871. On each one, a child has written the same sum.<br><br>On this year’s slate the answer has been rubbed out and written again in adult handwriting: your initials.`,lore:'Every Tithe year a child writes the same sum on a slate. This year the answer is your initials.'}]},
  wes:{voice:'nervous',loves:['corn','pumpkin'],likes:['egg','turnip'],hates:['fish'],
    talk:[['Hollis says I’ve got good hands. Dad says I’ve got no sense. They’re both right.','You smell like outside. Gas station coffee. I miss that and I’ve never had it.'],['Dad keeps a hat in his closet. A felt hat. I’m not allowed to touch it.','I fixed the radio in your car. It only gets one station. It’s the church.'],['If I don’t make it out, tell someone out there my name. Wes. Just so somebody knows.']],
    gift:{love:'Hey, thanks! Really.',like:'Cool.',hate:'Dad eats those. I hate those.',meh:'Huh. Okay.'},
    events:[{h:3,title:'The road map',text:`Wes unfolds a road map so worn it’s soft. Every route out of the valley is traced in pencil, and every one has been erased at the county line and redrawn curling back to Marrow Hollow.<br><br><q>Four times. I drew them before I drove them.</q>`,lore:'Wes has tried to drive out four times. Every road out of the valley bends back to Marrow Hollow.'}]},
  ida:{voice:'sweet',loves:['pumpkin','egg'],likes:['corn','turnip'],hates:['mushroom'],
    talk:[['Rhubarb pie, dear. Eat. You’re thin.','Arthur rings the bell, but I wind the clock. Somebody has to keep the hours.'],['The hymn has a verse nobody sings. It’s the one with the names in it.','I baked a pie for your grandfather every October. He’d throw it in the corn. It never came back out.'],['When they draw the lot, I play loud. So nobody hears whose name it is.']],
    gift:{love:'Oh, I’ll bake with this! For you!',like:'Bless you.',hate:'Not in my kitchen, dear.',meh:'How kind.'},
    events:[{h:3,title:'The last verse',text:`Ida plays you the last verse on the church organ, very softly. It is a list of names, sung in order, ending with <i>Danny Coyle</i>.<br><br>Then her hands keep going over one more bar. She doesn’t sing it. She doesn’t have to.`,lore:'The last verse of Ida’s hymn is the list of the taken, sung in order. There is one more bar after Danny’s name.'}]}});
for(const d of NEWFOLK)S.friend[d.id]=S.friend[d.id]||0;
// ---- the general store is twice the size now; its door moved with it
ROOMS.store.out={x:29.5,z:-8.7};{const it=interact.find(q=>q.x===31&&q.z===-9.05);if(it)it.x=29.5;}

// ---- places in town (centre, wander radius)
const PL={store:[29.5,-8.3,1.6],square:[48,-5.6,2.4],church:[48,-17.2,1.4],graves:[60.8,-27.6,3],garage:[-35,-9.4,2],dock:[-30,19.6,.2],board:[52,-8.6,.8],booth:[44.5,-8.7,.4],
  farmgate:[-12.2,-6,.8],road_w:[-68,-5.4,1.4],porch_agnes:[-46,-8.6,.6],school:[46,-3.8,1.6],bake:[43.6,-7.4,.6],corn:[-2,10.6,2.4],farmlane:[-6,-6,1.2],bridge:[-24.5,-5.8,.6]};
// homes: door outside, which side the door faces, and a home room
const HOMES={
  coyle:{door:[29.5,-9.05],face:'N',room:'store',name:'Coyle’s General Store'},  // Caitlyn and Tobias live above the shop
  pruitt:{door:[-33.7,-10.25],face:'N',room:'garage',name:'Pruitt’s Garage'},
  abernathy:{door:[-46,-9.25],face:'N',room:'home_agnes',name:'the Abernathy house'},
  hale:{door:[57,-9.05],face:'N',room:'home_hale',name:'the parsonage'},
  dunn:{door:[66,-9.05],face:'N',room:'home_dunn',name:'the Dunn house'},
  vance:{door:[31,3.95],face:'S',room:'home_cora',name:'the Vance house'},
  june:{door:[40,3.95],face:'S',room:'home_june',name:'June’s rooms'},
  lindqvist:{door:[57,3.95],face:'S',room:'home_otto',name:'the Lindqvist house'},
  crane:{door:[66,3.95],face:'S',room:'home_silas',name:'the Crane house'}};
const LIFE={
  mae:{home:'coyle',job:'Runs the general store',personality:'Twenty-five. Took over the store when her mother walked into the corn. Raising her little brother. Dry, warm, tired, funny. Never says Danny’s name.',day:[[6,'home'],[7,'store'],[12,'square'],[13,'store'],[18.5,'home']]},
  tobias:{home:'coyle',job:'Goes to school, gets into the corn',personality:'Nine, nosy, fearless. Sings the rhyme nobody lets him finish.',day:[[6,'home'],[8,'school'],[12,'corn'],[14.5,'square'],[16,'store'],[18,'home']]},
  hale:{home:'hale',job:'Pastor; rings the bell at eight',personality:'Grave, guilty, still kind underneath. Plays chess with the dead.',day:[[6,'home'],[8.5,'church'],[12,'graves'],[13.5,'church'],[17.5,'square'],[19,'church']]},
  hollis:{home:'pruitt',job:'Mechanic, Route 9 garage',personality:'Few words, steady hands. Fixes things so he doesn’t have to talk about them.',day:[[6,'home'],[7,'garage'],[18,'store'],[19,'home']]},
  agnes:{home:'abernathy',job:'Retired; keeps the porch light on for Ruth',personality:'Sharp-tongued, grieving, the only one who says things plainly.',day:[[6,'home'],[8,'porch_agnes'],[14,'graves'],[16,'porch_agnes'],[18.5,'home']]},
  dunn:{home:'dunn',job:'Sheriff',personality:'Friendly on the surface. Writes every name in the hat himself.',day:[[6,'home'],[7.5,'square'],[10,'farmgate'],[12,'garage'],[14,'board'],[16,'farmlane'],[18,'square'],[19.2,'home']]},
  silas:{home:'crane',job:'Sexton and gravedigger',personality:'Morbid, dry, oddly gentle. Measures everyone he meets.',day:[[6,'graves'],[11,'church'],[13,'graves'],[18.5,'home']]},
  june:{home:'june',job:'Mail carrier',personality:'Chatty, curious, reads everyone’s envelopes but never opens them.',day:[[6,'home'],[7.5,'route'],[11,'store'],[12.5,'route'],[17,'square'],[18.5,'home']],route:['board','booth','farmgate','porch_agnes','garage','store']},
  otto:{home:'lindqvist',job:'Fisherman on the pond',personality:'Old, superstitious, talks in weather sayings. Keeps watch on the water.',day:[[5.5,'dock'],[12,'store'],[13.5,'dock'],[18,'home']]},
  cora:{home:'vance',job:'Schoolteacher',personality:'Prim and precise. Counts down the days on the blackboard.',day:[[6,'home'],[7.8,'school'],[12,'board'],[13,'school'],[16,'church'],[17.5,'home']]},
  wes:{home:'dunn',job:'Apprentice at Pruitt’s Garage',personality:'Seventeen, restless, desperate to get out. Tried four times.',day:[[6,'home'],[8,'garage'],[17,'road_w'],[18.6,'home']]},
  ida:{home:'hale',job:'Pastor’s wife and organist; bakes',personality:'Sweet, hums constantly, plays loud so no one hears the names.',day:[[6,'home'],[10,'bake'],[14,'church'],[17.5,'home']]}};
for(const n of npcs){const L=LIFE[n.def.id];if(L)n.def.role=L.job;}

// ---- routes along the streets: everything connects through Main Street / Route 9 (z = -6)
const STREET=-6;
function routeTo(x,z,tx,tz){const pts=[];const far=Math.hypot(tx-x,tz-z)>5;
  const down=(px,pz)=>{if(pz>2){const gaps=[34.4,48,60.5,24];if(px>24&&px<72){const g=gaps.reduce((a,b)=>Math.abs(b-px)<Math.abs(a-px)?b:a);return [[g,STREET],[g,5.3],[px,5.3]];}}
    if(pz>8&&px<-15)return [[-35,STREET],[-35,12.4],[px,pz-1.5]];if(pz<-21&&px>50)return [[53,STREET],[53,-22]];return [[px,STREET]];};
  if(!far)return [[tx,tz]];
  const a=down(x,z),b=down(tx,tz);
  // leave: from here back to the street (reverse of the way in), cross along the street, then go in
  const out=a.slice().reverse().filter(p=>Math.hypot(p[0]-x,p[1]-z)>.5);
  pts.push(...out,...b,[tx,tz]);return pts;}
function placeXY(key,n){const p=PL[key];if(!p)return null;const r=p[2];return [p[0]+(rand()*2-1)*r,p[1]+(rand()*2-1)*r*.5];}
// ---- home rooms: one per house, furnished for who lives there
const HROOM=(ox,paper)=>({ox,oz:-60,furn:[],paper,shell:'room_home_'+paper});
Object.assign(ROOMS,{home_agnes:Object.assign(HROOM(500,'rust'),{name:'The Abernathy house',out:{x:-46,z:-8.7},furn:[['in_bed',1.3,2.6,[-0.85,-2.1,0.85,0]],['in_shelf_jars',3.2,0.62,[-0.80,-0.4,0.80,0]],['in_clock',4.5,0.55,[-0.30,-0.3,0.30,0]],['in_photowall',6.0,-0.9,null,'flat'],['in_stove',7.1,0.95,[-0.68,-0.5,0.68,0]],['in_rocker',3.3,3.7,[-0.40,-0.45,0.40,0]],['in_knit',4.1,3.9,[-0.30,-0.3,0.30,0]],['in_cradle',6.6,4.5,[-0.55,-0.5,0.55,0]],['in_rug',3.8,4.7,null,'flat'],['in_mirror',0.5,-0.45,null,'flat']]}),
  home_hale:Object.assign(HROOM(532,'blue'),{name:'The parsonage',out:{x:57,z:-8.7},furn:[['in_piano',1.7,1.0,[-1.10,-0.5,1.10,0]],['in_shelf_books',4.0,0.62,[-0.80,-0.4,0.80,0]],['in_shelf_books',5.6,0.62,[-0.80,-0.4,0.80,0]],['in_stove',7.2,0.95,[-0.68,-0.5,0.68,0]],['in_chess',5.1,3.5,[-0.55,-0.4,0.55,0]],['in_chair',4.2,3.55,[-0.30,-0.25,0.30,0]],['in_chair',6.0,3.55,[-0.30,-0.25,0.30,0]],['in_table',2.0,3.9,[-0.85,-0.45,0.85,0]],['in_chair',0.9,3.95,[-0.30,-0.25,0.30,0]],['in_rug',4.4,4.9,null,'flat']]}),
  home_dunn:Object.assign(HROOM(564,'sage'),{name:'The Dunn house',out:{x:66,z:-8.7},furn:[['in_filecab',0.6,0.85,[-0.40,-0.4,0.40,0]],['in_desk',2.0,1.0,[-0.88,-0.45,0.88,0]],['in_mapboard',3.9,-0.9,null,'flat'],['in_shelf_parts',5.5,0.62,[-1.00,-0.4,1.00,0]],['in_bed',7.1,2.5,[-0.85,-2.1,0.85,0]],['in_bed',1.2,5.1,[-0.85,-2.1,0.85,0]],['in_table',4.2,3.8,[-0.85,-0.45,0.85,0]],['in_chair',3.1,3.85,[-0.30,-0.25,0.30,0]],['in_chair',5.3,3.85,[-0.30,-0.25,0.30,0]],['in_tires',7.4,5.2,[-0.45,-0.3,0.45,0]]]}),
  home_cora:Object.assign(HROOM(596,'sage'),{name:'The Vance house',out:{x:31,z:4.5},furn:[['in_shelf_books',0.9,0.62,[-0.80,-0.4,0.80,0]],['in_shelf_books',2.5,0.62,[-0.80,-0.4,0.80,0]],['in_blackboard',4.3,-0.95,null,'flat'],['in_desk',6.1,1.0,[-0.88,-0.45,0.88,0]],['in_globe',7.5,1.0,[-0.30,-0.3,0.30,0]],['in_schooldesk',2.6,3.4,[-0.45,-0.3,0.45,0]],['in_schooldesk',4.0,3.4,[-0.45,-0.3,0.45,0]],['in_schooldesk',5.4,3.4,[-0.45,-0.3,0.45,0]],['in_schooldesk',2.6,4.8,[-0.45,-0.3,0.45,0]],['in_schooldesk',5.4,4.8,[-0.45,-0.3,0.45,0]],['in_bed',7.1,5.2,[-0.85,-2.1,0.85,0]]]}),
  home_june:Object.assign(HROOM(628,'rust'),{name:'June’s rooms',out:{x:40,z:4.5},furn:[['in_shelf_mail',1.2,0.62,[-1.00,-0.4,1.00,0]],['in_shelf_mail',3.3,0.62,[-1.00,-0.4,1.00,0]],['in_desk',5.4,1.0,[-0.88,-0.45,0.88,0]],['in_bed',7.1,2.6,[-0.85,-2.1,0.85,0]],['in_table',3.6,3.8,[-0.85,-0.45,0.85,0]],['in_chair',2.5,3.85,[-0.30,-0.25,0.30,0]],['in_mailsacks',1.0,4.9,[-0.55,-0.4,0.55,0]],['in_mailsacks',2.3,5.1,[-0.55,-0.4,0.55,0]],['in_rug',5.0,4.8,null,'flat']]}),
  home_otto:Object.assign(HROOM(660,'blue'),{name:'The Lindqvist house',out:{x:57,z:4.5},furn:[['in_rods',0.6,0.9,[-0.50,-0.3,0.50,0]],['in_netwall',2.6,-0.95,null,'flat'],['barrel',1.5,1.3,[-0.40,-0.3,0.40,0]],['in_stove',4.3,0.95,[-0.68,-0.5,0.68,0]],['in_bed',7.1,2.6,[-0.85,-2.1,0.85,0]],['in_table',3.5,3.6,[-0.85,-0.45,0.85,0]],['in_chair',2.4,3.65,[-0.30,-0.25,0.30,0]],['in_keg',0.8,4.8,[-0.40,-0.3,0.40,0]],['in_crates',2.1,5.1,[-0.70,-0.4,0.70,0]],['in_drum_blue',6.5,5.3,[-0.35,-0.3,0.35,0]]]}),
  home_silas:Object.assign(HROOM(692,'sage'),{name:'The Crane house',out:{x:66,z:4.5},furn:[['in_shovels',0.7,0.95,[-0.50,-0.3,0.50,0]],['in_shelf_tools',2.5,0.62,[-1.00,-0.4,1.00,0]],['in_candles',5.8,1.2,[-0.60,-0.25,0.60,0]],['in_coffin',5.8,3.6,[-0.60,-1.9,0.60,0]],['in_bed',1.3,5.1,[-0.85,-2.1,0.85,0]],['in_table',3.6,3.6,[-0.85,-0.45,0.85,0]],['in_chair',2.5,3.65,[-0.30,-0.25,0.30,0]],['in_clock',7.4,0.55,[-0.30,-0.3,0.30,0]],['in_photowall',4.1,-0.9,null,'flat']]})});
const HOME_SPOT={coyle:[6.5,1.4],pruitt:[5.9,2.0],abernathy:[3.3,4.3],hale:[3.2,2.6],dunn:[4.2,2.6],vance:[6.1,1.9],june:[5.4,1.9],lindqvist:[3.5,4.4],crane:[3.6,4.5]};
// knock to visit: you can go in when someone's home in the day; locked after the bell
for(const [k,h] of Object.entries(HOMES)){if(h.room==='store'||h.room==='garage')continue;const [x,z]=h.door;
  interact.push({x,z,r:.9,label:()=>'Knock',ok:()=>true,act(){const who=npcs.filter(n=>n.loc==='in'&&n.homeKey===k);
    if(S.hour>=20&&!S.bound){toast(['Nobody answers. Someone inside is holding their breath.','The curtain twitches. The door stays shut.','A voice through the wood: “Go home. Please.”'][(rand()*3)|0],2.6,true);SFX.deny();return;}
    if(!who.length){toast(`Nobody’s home at ${h.name}.`,1.8);SFX.thud(0,.2);return;}
    toast(`${who.map(n=>n.def.name.split(' ')[0]).join(' and ')} ${who.length>1?'let':'lets'} you in.`,1.8);enterRoom(h.room);}});}
// the house nobody lives in
interact.push({x:40,z:-9.05,r:.9,label:()=>'Door',ok:()=>true,act(){toast('Locked. Through the window: a boy’s room, bed made, dusted this morning. A fishing rod by the door. Danny’s.',3.4,true);}});

// ---- the day: each person follows their routine and walks there by the streets
function wantFor(n){const L=LIFE[n.def.id];if(!L)return null;let cur=L.day[0][1];for(const [h,k] of L.day)if(S.hour>=h)cur=k;if(S.hour>=19.6&&cur!=='church')cur='home';return cur;}
function homeRoomPos(n){const h=HOMES[LIFE[n.def.id].home];const R=ROOMS[h.room];if(!R)return null;const s=HOME_SPOT[LIFE[n.def.id].home]||[3,3];const off=npcs.filter(q=>q.loc==='in'&&q.homeKey===n.homeKey).indexOf(n);return [R.ox+s[0]+(off>0?1.4:0),R.oz+s[1]];}
const INDOOR={store:{room:'store',door:[29.5,-9.05],spots:{mae:[6.5,1.4]},browse:[[3.3,3.4],[9.8,3.4],[6.5,5.6],[1.4,6.0],[11.6,6.0]]}};
function goInside(n,job){n.route=null;n.loc='in';if(job&&INDOOR[job]){const J=INDOOR[job],R=ROOMS[J.room];n.inWant=job;n.inDoor=J.door;const s=J.spots[n.def.id]||J.browse[(npcs.indexOf(n)*3)%J.browse.length];n.x=R.ox+s[0];n.z=R.oz+s[1];n.vis=true;n.dir='S';return;}
  const h=HOMES[LIFE[n.def.id].home];n.homeKey=LIFE[n.def.id].home;n.inWant='home';n.inDoor=h.door;const p=homeRoomPos(n);if(p){n.x=p[0];n.z=p[1];n.vis=true;n.dir='S';}else n.vis=false;}
function goOutside(n){const d=n.inDoor||HOMES[LIFE[n.def.id].home].door;n.loc='out';n.x=d[0];n.z=d[1]+(d[1]>0?.6:.4);n.vis=true;n.route=null;n.inWant=null;}
function townTick(dt){const vigil=S.hour>=20&&S.day>=2&&!S.bound;if(vigil)return;
  for(const n of npcs){const L=LIFE[n.def.id];if(!L)continue;n.def.path=[[n.x,n.z]];const want=wantFor(n);
    if(!n.loc){if(want==='home')goInside(n);else if(INDOOR[want])goInside(n,want);else{goOutside(n);const p=placeXY(want==='route'?L.route[0]:want,n);if(p){n.x=p[0];n.z=p[1];}n.target=want;}}
    if(n.loc==='in'){if(want!==n.inWant){goOutside(n);n.target=null;}else{n.clip='idle';if(talkingTo===n)n.dir=dirOf(P.x-n.x,P.z-n.z);continue;}}
    // decide where to go next
    if(n.target!==want||(!n.route&&n.waitT<=0)){
      n.target=want;let tx,tz;
      if(want==='home'){const h=HOMES[L.home];[tx,tz]=[h.door[0],h.door[1]+(h.face==='S'?.5:.3)];n.goingHome=true;}
      else if(INDOOR[want]){const d=INDOOR[want].door;[tx,tz]=[d[0],d[1]+.3];n.goingHome=want;}
      else if(want==='route'){n.ri=((n.ri||0)+1)%L.route.length;[tx,tz]=placeXY(L.route[n.ri],n);n.goingHome=false;}
      else{[tx,tz]=placeXY(want,n);n.goingHome=false;}
      n.route=routeTo(n.x,n.z,tx,tz);n.waitT=want==='route'?6+rand()*5:9+rand()*14;}
    const near=Math.hypot(P.x-n.x,P.z-n.z)<1.6;if(talkingTo===n||near){n.clip=talkingTo===n?'talk':'idle';n.dir=dirOf(P.x-n.x,P.z-n.z);continue;}
    if(n.route&&n.route.length){const [tx,tz]=n.route[0];const dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);const sp=(n.def.id==='tobias'?1.6:n.def.id==='agnes'?.75:1.15);
      if(d<.12){n.route.shift();if(!n.route.length){n.route=null;if(n.goingHome){goInside(n,n.goingHome===true?null:n.goingHome);continue;}}}
      else{n.x+=dx/d*Math.min(d,sp*dt);n.z+=dz/d*Math.min(d,sp*dt);n.dir=dirOf(dx,dz);n.clip='walk';n.t+=0;}}
    else{n.clip='idle';n.waitT=(n.waitT||0)-dt;
      // little bits of business at the job: face the work, not the street
      const face={store:'N',church:'N',graves:'N',garage:'N',dock:'S',board:'N',porch_agnes:'S',school:'N',bake:'S',corn:'S',road_w:'W',farmgate:'W',bridge:'W'}[n.target];if(face&&!n.facedT){n.dir=face;}}}}
{const _u7=update;update=function(dt){_u7(dt);townTick(dt);};}
// a new morning (or the bell) resets everyone to where their day says
{const _pn=placeNPCs;placeNPCs=function(){_pn();if(S.hour>=20&&S.day>=2&&!S.bound){for(const n of npcs){if(!n.def.nightPos)continue;n.loc='vigil';n.vis=true;n.x=n.def.nightPos[0];n.z=n.def.nightPos[1];}return;}
  for(const n of npcs){if(!LIFE[n.def.id])continue;n.loc=null;n.route=null;n.target=null;}};}
// the journal says who they are and what they do
{const _oj=openJournal;openJournal=function(){_oj();const el=document.querySelector('#noteText');if(!el)return;el.querySelectorAll('.jrow').forEach(r=>{const nm=r.querySelector('b');if(!nm)return;const n=npcs.find(q=>q.def.name===nm.textContent);const L=n&&LIFE[n.def.id];
  if(L&&!r.dataset.life){r.dataset.life=1;const d=document.createElement('div');d.className='jsub';const h=HOMES[L.home];const where=n.loc==='in'?'at home':n.target?{store:'at the store',square:'in the square',church:'at the church',graves:'in the graveyard',garage:'at the garage',dock:'on the dock',board:'by the notice board',booth:'by the phone booth',farmgate:'by your farm gate',road_w:'out on Route 9',porch_agnes:'on her porch',school:'teaching in the square',bake:'at the bake table',corn:'by the corn',farmlane:'on your lane',route:'on the mail route',bridge:'on the bridge'}[n.target]||'':'';
    d.innerHTML=`${L.job}. Lives at ${h.name}. ${L.personality}${where?` <i>Now: ${where}.</i>`:''}`;r.appendChild(d);}});};}
