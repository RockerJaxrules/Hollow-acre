/* ================= Wickham Crossing: the river village. A street, a square, an inn, a chapel, the doctor, the ferry, and ten more people.
   Wickham gives its dead to the river, not the corn, and believes that is why it is spared. ================= */
const WK={street:46,lane:58.5,x0:98,x1:162,sq:[130,46]};
ROADS.push([150,-6,150,WK.street,2.4],[WK.x0,WK.street,WK.x1,WK.street,3],[104,WK.lane,156,WK.lane,2],[116,WK.street,116,WK.lane,2],[144,WK.street,144,WK.lane,2],
  [70,LANE_E,WK.x0,WK.street,2],[130,36,130,WK.street,2],[128,WK.lane,128,71,1.6]);
const inWick=(x,z)=>x>92&&x<168&&z>30&&z<70;
{const Dk=LAYERS.dark,St=LAYERS.stone;LAYERS.dark=(x,z)=>!inWick(x,z)&&Dk(x,z);LAYERS.stone=(x,z)=>St(x,z)||Math.hypot(x-WK.sq[0],z-WK.sq[1])<6.2+(fbm(x*.6,z*.6)-.5)*1.2||(Math.abs(z-WK.street)<2&&x>WK.x0&&x<WK.x1);}
const WHOUSES=[ // [key, sprite, x, front z, lit]
  ['harlow','inn',112,42.6],['ashby','house_a',100,42.6],['quinn','church',130,36.2],['vale','house_b',146,42.6],['kerrigan','house_d',158,42.6],
  ['pike','house_c',106,56.6],['wk_empty','house_b',134,56.6],['wk_school','house_a',152,56.6],['ward','house_d',122,56.6]];
{const _bw=buildWorld;buildWorld=function(){reserve(92,30,168,70);_bw();
  for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(inWick(o.x,o.z)&&/tree|bush|deco/.test(o.kind||'')&&Math.abs(o.x-130)>34){}else if(inWick(o.x,o.z)&&/tree|bush|deco/.test(o.kind||'')){for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-o.z)<.6)circles.splice(j,1);OBJ.splice(i,1);}}
  for(const [k,spr,x,z] of WHOUSES)building(spr,x,z,{lit:k!=='wk_empty',jack:k==='harlow'||k==='vale',porch:spr!=='church'&&k!=='wk_empty'});
  // the square: a well, the notice board, benches of crates, lamps
  put('well',WK.sq[0],WK.sq[1]+.9);addCircle(WK.sq[0],WK.sq[1]+.4,1.05);put('board',126,48.4,0);addSeg(125.2,48.4,126.8,48.4,.12);put('signpost',96,47.6,.2,{label:'WICKHAM'});put('signpost',151.6,24,.2,{label:'WICKHAM'});
  for(const x of [104,118,138,156])lamp(x,43.8);for(const x of [104,118,138,156])lamp(x,48.4);for(const x of [110,140])lamp(x,60.8);
  put('barrel',118.4,42.9,.3);put('barrel',119,43.4,.3);put('crate',108.8,43.2,.3);put('sacks',121,43.5);put('cart',136,49.6,0);addRect(134.8,48.9,137.2,50.1);
  fenceLine(127,WK.lane-2,127,WK.lane-6,0,'picket');fenceLine(141,WK.lane-2,141,WK.lane-6,0,'picket');fenceLine(113,WK.lane-2,113,WK.lane-6,0,'picket');
  // the ferry landing below the village
  put('dock',128,71.6,0,{kind:'flat'});put('signpost',130.4,69,.2,{label:'FERRY'});
  // a few gardens behind the south row
  for(const [x,z] of [[104,63],[120,63],[150,63]]){fenceLine(x-3,z-1.5,x+3,z-1.5,0,'picket');for(let i=0;i<4;i++)obj(rand()<.5?'pumpkin':'pumpkin_b',x-2.2+i*1.5,z+.6,{});}};}
const WFOLK=[
  {id:'tess',name:'Tess Harlow',role:'Keeps the Lantern Inn',nightPos:[96,-3.6],
    lines:['Room for one? We’ve always got room for one. Never more than one.','The lantern in the window’s been lit since 1871. We just keep it fed.','Breakfast’s at six. If you hear someone at the table before then, that’s just the last guest. He never left.'],
    night:['No vacancy.','Your room’s ready. It’s always been ready.','Sign the book.']},
  {id:'hob',name:'Hob Harlow',role:'Cooks at the inn, traps rabbits',nightPos:[100,-3.2],
    lines:['Rabbit stew. Always rabbit stew. The rabbits round here practically walk into the pot.','Don’t ask what’s in the black pudding. I don’t ask either.','Tess talks to the guest book. I talk to the stew. We’re a good match.'],
    night:['Pot’s on.','Smells like you.','Something in the snares.']},
  {id:'lyle',name:'Dr. Lyle Ashby',role:'Doctor for both villages',nightPos:[104,-3.8],
    lines:['Say ah. Hm. Your tongue’s fine. Your pulse is… early.','I sign the death certificates in September. Saves time.','You have your grandfather’s heart murmur. I could hear it from the door.'],
    night:['Time of death…','Hold still.','You can’t stay here. You’re not well.']},
  {id:'vera',name:'Vera Ashby',role:'The doctor’s daughter, wants out',nightPos:[108,-3.4],
    lines:['You’re the one from outside! Is there music out there? Like, new music?','Dad says the river’s the only clean way out. He means dead. He thinks I don’t know he means dead.','I’ve packed a bag every October since I was ten.'],
    night:['Take me with you.','It’s at the end of the lane.','I can hear Dad crying.']},
  {id:'quinn',name:'Brother Quinn',role:'Lay preacher at Wickham Chapel',nightPos:[112,-4],
    lines:['The river forgives. The corn only remembers.','We baptise in the river every Sunday. Most of us come up.','Marrow Hollow pays with the living. We pay with the dead. It’s cheaper, and nobody asks.'],
    night:['The water is rising.','Wade in.','Come up clean.']},
  {id:'nan',name:'Nan Pike',role:'Runs the ferry, keeps the river',nightPos:[116,-3.6],
    lines:['Ferry’s a penny across. Coming back costs more.','I pole the dead downriver every week. They lie very still for me. They know I’m tired.','The far bank isn’t the same place twice.'],
    night:['Ferry’s closed.','Someone’s waiting on the far bank.','Don’t look at the water.']},
  {id:'finn',name:'Finn Pike',role:'Nan’s boy, skips stones',nightPos:[120,-3.2],kid:1,
    lines:['I can skip a stone nine times! Once it skipped back.','Mom says don’t swim. I swim anyway. There’s a boy down there who swims with me.','Do you want to see my collection? It’s teeth. River teeth. They’re smooth.'],
    night:['The boy is here.','He wants to swap.','He says you know him.']},
  {id:'iris',name:'Iris Vale',role:'Seamstress, sews the Tithe’s clothes',nightPos:[124,-3.8],
    lines:['Hold still, I’ll measure you. Just for fun. Silas sends me numbers but I like to check.','Every year I sew one good suit. The best I can make. It gets worn once.','Your collar’s crooked. Here. There. Now you look ready.'],
    night:['It’s finished.','Try it on.','It fits you perfectly.']},
  {id:'moss',name:'Moss Kerrigan',role:'Trapper in the woods',nightPos:[128,-3.4],
    lines:['Traps are empty all October. Everything in the woods is hiding.','I found a deer once with your grandfather’s face. Well. Near enough.','Woods are bigger at night. I’ve measured.'],
    night:['Hush. It’s close.','I set a trap for it once.','It set one for me.']},
  {id:'ada',name:'Ada Kerrigan',role:'Moss’s mother, blind, sees',nightPos:[132,-3],
    lines:['Come closer, child. Let me look at you. …There you are. And there’s the other one, behind you.','I lost my eyes in ’61. I see better now.','You smell of corn and lamp oil. Like Elias did.'],
    night:['It’s on your porch.','It has your shape.','Don’t let it in.']}];
for(const d of WFOLK){d.day=[0,0];d.path=[[0,0]];NPCDEF.push(d);const n={def:d,x:0,z:0,dir:'S',clip:'idle',t:Math.random()*4,wp:0,wait:0,vis:true,spd:0};npcs.push(n);
  const i=npcs.length-1;interact.push({npc:i,x:0,z:0,r:1.7,on:()=>npcs[i].vis,label:()=>'Talk',ok:()=>true,act(){talk(npcs[i]);}});S.friend[d.id]=S.friend[d.id]||0;}
const g3=(l,lk,h,a,b,c)=>({voice:'warm',loves:l,likes:lk,hates:h,talk:[a,b,c],gift:{love:'Oh! Thank you, truly.',like:'That’s kind of you.',hate:'I’d rather not.',meh:'Thanks.'}});
Object.assign(PEOPLE,{
  tess:Object.assign(g3(['pie','stew'],['bread','egg'],['mushroom'],['Kettle’s on.','The book wants your name.'],['Every guest signs the book. The ink is never dry on the last page.','Room four is the one you’ll want. It wants you.'],['If you ever stay, stay in room four. Lock it. Whatever knocks, it isn’t me.']),
    {events:[{h:3,title:'The guest book',text:`Tess opens the Lantern Inn’s guest book for you. Every October there is one guest. They sign in. They never sign out.<br><br>The newest signature is yours. You haven’t stayed here. The ink is still wet.<br><br><q>Happens every year,</q> Tess says kindly. <q>The book always knows who’s coming.</q>`,lore:'The Lantern Inn’s guest book has one guest every October who never signs out. This year’s signature, still wet, is yours.'},
      {h:7,title:'Room four',text:`Room four is made up for you: clean sheets, a jug of water, your initials embroidered on the pillow.<br><br>In the wardrobe hang thirty years of clothes in your size, every one folded with a small card: <i>For next time.</i><br><br><q>We always have your room ready,</q> Tess says. <q>You’ve stayed with us before. You always come back older.</q>`,lore:'Room four at the inn holds thirty years of clothes in your size, each marked “For next time.”'}]}),
  hob:Object.assign(g3(['fish','corn'],['turnip','pumpkin'],['egg'],['Stew’s on.','Rabbit again.'],['Snares are empty. Something takes the rabbits before I can.','I cook for the extra guest. He eats more every year.'],['Don’t eat at the inn on the last night. Promise me.']),
    {events:[{h:3,title:'The extra bowl',text:`Hob ladles out one more bowl of stew than there are people at the table. Nobody comments.<br><br>The spoon in it lifts. Dips. Lifts. The level in the bowl goes down.<br><br><q>Better fed than angry,</q> Hob mutters, and pours you seconds.`,lore:'At the Lantern Inn, something unseen eats an extra bowl every night.'},
      {h:7,title:'What’s in the snares',text:`Hob shows you this morning’s snare. There is no rabbit in it. There is a hand: small, pale, holding the wire.<br><br>It lets go when you look. It slides back into the leaves.<br><br><q>Every day this month,</q> Hob says. <q>It’s practising. It’s learning to hold on.</q>`,lore:'Something in Hob’s snares is learning to hold on.'}]}),
  lyle:Object.assign(g3(['milk','soup'],['egg','bread'],['mushroom'],['Breathe in. Out.','You look pale. Everyone does.'],['I keep the certificates in a drawer. One is signed for this year already.','Your heart beats twice. Once for you.'],['If I tell you you’re dead, don’t argue. Just run.']),
    {events:[{h:3,title:'The certificate',text:`Dr. Ashby shows you the death certificate he signed in September. Cause of death: <i>Taken.</i> Date: the night of the drawing. The name is blank.<br><br><q>I fill the name in afterwards,</q> he says. <q>My handwriting’s never been steady enough to write it before.</q>`,lore:'Dr. Ashby signs the Tithe’s death certificate in September and leaves the name blank.'},
      {h:7,title:'Two heartbeats',text:`He listens to your chest with a cold stethoscope for a long time.<br><br><q>There are two heartbeats,</q> he says. <q>Yours, and one a little behind, like an echo. It’s getting closer to yours every day.</q><br><br><q>When they match, I think it will be wearing you. I am so sorry. I have no medicine for this.</q>`,lore:'Dr. Ashby hears a second heartbeat in your chest, catching up with yours.'}]}),
  vera:Object.assign(g3(['gem','pie'],['corn','fish'],['turnip'],['Got any gum? Outside gum?','Wickham is so boring. Boring and haunted. The worst combination.'],['I tried the ferry once. The far bank was here again.','Dad listens to my heart at night when he thinks I’m asleep.'],['If you find a way out, I’m coming. I’ll hold on. I’m good at holding on.']),
    {events:[{h:3,title:'The packed bag',text:`Vera shows you her bag, packed since she was ten. Clothes she has outgrown. A map with every road crossed out. A cassette with nothing on it but a voice saying her name.<br><br><q>It came in the post,</q> she says. <q>June said it was addressed from your farm.</q>`,lore:'Vera’s been packed to leave since she was ten. Someone mailed her a tape from your farm.'},
      {h:7,title:'Holding on',text:`<q>Corwin says the road past his station goes across, once, the night of the bell. He says you can only take someone who’s already holding on.</q><br><br>Vera takes your hand and grips it, hard. <q>So I’m holding on. From now. Don’t you dare let go.</q>`,lore:'Vera has taken hold of you, so she can cross with you on the night of the bell.',reward:'vera'}]}),
  quinn:Object.assign(g3(['fish','bread'],['egg','soup'],['pumpkin'],['The river forgives.','Have you been baptised? You should be. Soon.'],['We give our dead to the water. The Tall Man doesn’t follow them in.','Wickham’s never been tithed. Not once. We think it’s the river.'],['The truth? Our dead float back up every October. We push them down again. Every year it’s harder.']),
    {events:[{h:3,title:'River baptism',text:`Brother Quinn walks you waist-deep into the river and asks if you renounce the corn. You say yes to be polite.<br><br>Under the water, many hands steady you. Too many. When you come up, his own hands are folded at his chest.<br><br><q>They like you,</q> he says. <q>They don’t usually help.</q>`,lore:'When Brother Quinn baptised you in the river, many hands held you under. Not his.'},
      {h:7,title:'They float back',text:`On Sunday night Quinn takes you to the river with a long pole. The water is crowded with pale shapes, face up, eyes open, floating against the current back toward Wickham.<br><br>He pushes them down, one by one. They rise again.<br><br><q>It isn’t mercy, what we do,</q> he says. <q>It’s just a different door. And it’s full.</q>`,lore:'Wickham’s dead float back every October against the current. The river is a door too, and it is full.'}]}),
  nan:Object.assign(g3(['fish','coal'],['bread','stew'],['egg'],['Penny a crossing.','River’s high tonight.'],['The far bank changes. One night I saw your farm over there.','I pole the dead down. I never pole anyone back.'],['On the last night I’ll take you across for nothing. Once. Don’t look back at this side.']),
    {events:[{h:3,title:'Crossing',text:`Nan poles you across the river at dusk. Halfway over, the far bank is the near bank: Wickham again, but empty, every lamp out.<br><br><q>Don’t worry,</q> she says, turning the ferry. <q>It’s showing you what it’ll look like after. It does that to people it’s fond of.</q>`,lore:'On Nan’s ferry the far bank showed you Wickham after: empty, every lamp out.'},
      {h:7,title:'The ferry fare',text:`Nan gives you a black river stone with a hole worn through it. <q>Ferry fare. The real one. Hold it up to your eye on the last night and you’ll see which bank is which.</q><br><br>You look through it now. Through the hole, Nan has no face, only water, very calm. You lower it. She is smiling.`,lore:'Nan gave you a holed river stone: hold it to your eye to see which bank is which.',reward:'riverstone'}]}),
  finn:Object.assign(g3(['mushroom','fish'],['egg','corn'],['turnip'],['Wanna skip stones?','I found another tooth!'],['The river boy says his name is Danny.','He says your farm’s his house. He says you took his room.'],['Danny wants to swap with me. Just for one night. Is that okay? Mom said ask a grown-up.']),
    {events:[{h:3,title:'The river boy',text:`Finn skips a stone. It skips seven times, sinks, and comes skipping back the other way into his hand.<br><br><q>Thanks!</q> he calls to the water. A small hand waves above the surface, then goes under.<br><br><q>That’s my friend,</q> Finn says. <q>He lives in the river now. He used to live at your farm.</q>`,lore:'Finn has a friend in the river who used to live at your farm.'},
      {h:7,title:'Swap',text:`<q>Danny says if he gets one night dry he’ll tell his sister something important.</q> Finn is serious. <q>He’d use my body. I’d stay in the river and look after his.</q><br><br><q>He says it’s fair. He says Caitlyn deserves to know he pushed. What does that mean?</q>`,lore:'Danny Coyle, in the river, wants to borrow Finn for one night to tell his sister Caitlyn he pushed.'}]}),
  iris:Object.assign(g3(['copper_bar','gem'],['egg','bread'],['fish'],['Stand up straight.','Lovely fabric, terrible fit.'],['The suit is nearly finished. Charcoal grey. Your colour.','I sew a name into the collar of every one. I never chose the names.'],['If I leave the last stitch undone, it can’t be worn. I’ve never had the nerve.']),
    {events:[{h:3,title:'The fitting',text:`Iris holds a charcoal suit against you. It fits perfectly, before she has measured anything.<br><br>Inside the collar, in grey thread, she has already stitched your name. She looks at it as if she’s never seen it before.<br><br><q>My hands know before I do,</q> she says. <q>They always have.</q>`,lore:'Iris has sewn a suit in your size with your name in the collar, before measuring you.'},
      {h:7,title:'The last stitch',text:`<q>I’ll leave it undone.</q> Iris holds up the suit; one seam at the shoulder hangs open. <q>A garment with a stitch missing can’t be worn by anything that isn’t human. My grandmother said so.</q><br><br>She gives you the needle. <q>If it comes to it, you finish it. Or you don’t. I won’t be the one to decide.</q>`,lore:'Iris left the last stitch of the Tithe suit undone and gave you the needle.',reward:'needle'}]}),
  moss:Object.assign(g3(['iron_bar','stew'],['fish','corn'],['pumpkin'],['Quiet. Listen.','Traps are empty.'],['There’s a deer in the Hollow Woods that walks on two legs at night.','I tracked it once. The tracks went in a circle round your farm.'],['If you go to the hollow tree, go at noon. It sleeps at noon. Mostly.']),
    {events:[{h:3,title:'Two-legged deer',text:`Moss shows you prints in the mud at the edge of the Hollow Woods: a deer’s hoofprints, then, without a stumble, bare human feet, then hooves again.<br><br><q>It tries things on,</q> he says. <q>Deer. Men. Children. It’s been trying on your size for a week.</q>`,lore:'In the Hollow Woods, tracks change from hooves to bare feet and back. It has been trying on your size.'},
      {h:7,title:'The hollow at noon',text:`At noon Moss walks you into the hollow tree. Inside it is bigger than the tree, a room of black root and old candle stubs, and in the middle, wrapped in Elias’s scarf, a warm black stone.<br><br><q>Your grandfather’s,</q> Moss whispers. <q>Don’t touch it till you mean it. It knows when you mean it.</q>`,lore:'At noon the hollow tree opens into a root room. Elias’s stone is there, wrapped in his scarf.'}]}),
  ada:Object.assign(g3(['soup','egg'],['bread','milk'],['mushroom'],['Come closer, child.','You walk like him.'],['I see it standing behind you most days. Further away when you’re kind.','My eyes went in ’61, the night I looked straight at it.'],['On the last night, close your eyes. It can only take what sees it.']),
    {events:[{h:3,title:'Behind you',text:`Ada holds your face in both hands. Her clouded eyes move, very precisely, to a point just over your shoulder.<br><br><q>There it is,</q> she says. <q>Taller than yesterday. It’s wearing your coat today, child. Did you lend it your coat?</q>`,lore:'Blind Ada sees something behind you, taller every day, wearing your coat.'},
      {h:7,title:'What sees it',text:`<q>It can only take what looks at it,</q> Ada says. <q>That’s why it waits at windows. That’s why it wears faces you love: so you’ll look.</q><br><br>She ties a strip of black cloth around your wrist. <q>On the last night, cover your eyes. Walk by the sound of the bell. If you look, it has you.</q>`,lore:'Ada says it can only take what looks at it. She gave you a blindfold for the last night.',reward:'blindfold'}]})});
Object.assign(BDAY,{tess:4,hob:10,lyle:15,vera:23,quinn:17,nan:25,finn:9,iris:12,moss:20,ada:2});
// ---- homes
const wr=(i,paper,name,x,z,furn)=>FROOM(980+i*32,paper,name,{x,z:z+.7},furn);
const BEDS=(a,b)=>[['in_bed',7.1,2.5,[-0.85,-2.1,0.85,0]],['in_table',4.0,3.6,[-0.85,-0.45,0.85,0]],['in_chair',2.9,3.65,[-0.30,-0.25,0.30,0]],['in_rug',4.4,5.0,null,'flat'],a,b];
Object.assign(ROOMS,{
  home_harlow:wr(0,'rust','The Lantern Inn',112,42.6,[['in_counter',6.5,2.5,[-1.56,-0.6,1.56,0]],['in_shelf_jars',1.2,0.62,[-0.80,-0.4,0.80,0]],['in_keg',11.6,1.2,[-0.40,-0.3,0.40,0]],['in_table',2.5,5.0,[-0.85,-0.45,0.85,0]],['in_chair',1.4,5.05,[-0.30,-0.25,0.30,0]],['in_table',10.5,5.0,[-0.85,-0.45,0.85,0]],['in_chair',9.4,5.05,[-0.30,-0.25,0.30,0]],['in_stove',10.4,0.95,[-0.68,-0.5,0.68,0]],['barrel',12.3,3.0,[-0.40,-0.3,0.40,0]]]),
  home_ashby:wr(1,'blue','The doctor’s house',100,42.6,BEDS(['in_filecab',0.6,0.85,[-0.40,-0.4,0.40,0]],['in_shelf_books',2.4,0.62,[-0.80,-0.4,0.80,0]])),
  home_vale:wr(2,'sage','The Vale house',146,42.6,BEDS(['in_knit',1.2,1.2,[-0.30,-0.3,0.30,0]],['in_shelf_mail',3.0,0.62,[-1.00,-0.4,1.00,0]])),
  home_kerrigan:wr(3,'rust','The Kerrigan house',158,42.6,BEDS(['in_rocker',1.0,1.2,[-0.40,-0.45,0.40,0]],['in_shovels',3.0,0.95,[-0.50,-0.3,0.50,0]])),
  home_pike:wr(4,'blue','The Pike house',106,56.6,BEDS(['in_rods',0.6,0.9,[-0.50,-0.3,0.50,0]],['in_netwall',2.6,-0.95,null,'flat'])),
  home_quinn:Object.assign({ox:980+5*32,oz:-60,shell:'room_church',name:'Wickham Chapel',out:{x:130,z:36.9},furn:[['in_altar',5,1.7,[-1.15,-.65,1.15,0]],['in_candles',2.5,1.1,[-.6,-.25,.6,0]],['in_candles',7.5,1.1,[-.6,-.25,.6,0]],['in_pew',2.4,3.6,[-1.95,-.45,1.95,0]],['in_pew',7.6,3.6,[-1.95,-.45,1.95,0]],['in_pew',2.4,5.2,[-1.95,-.45,1.95,0]],['in_pew',7.6,5.2,[-1.95,-.45,1.95,0]]]}),
  home_ward:wr(6,'sage','The schoolhouse',122,56.6,[['in_blackboard',4.3,-0.95,null,'flat'],['in_schooldesk',2.6,3.4,[-0.45,-0.3,0.45,0]],['in_schooldesk',4.0,3.4,[-0.45,-0.3,0.45,0]],['in_schooldesk',5.4,3.4,[-0.45,-0.3,0.45,0]],['in_desk',6.1,1.0,[-0.88,-0.45,0.88,0]],['in_globe',7.5,1.0,[-0.30,-0.3,0.30,0]]])});
ROOMS.home_harlow.shell='room_store';
Object.assign(HOMES,{harlow:{door:[112,42.95],face:'N',room:'home_harlow',name:'the Lantern Inn'},ashby:{door:[100,42.95],face:'N',room:'home_ashby',name:'the doctor’s house'},
  vale:{door:[146,42.95],face:'N',room:'home_vale',name:'the Vale house'},kerrigan:{door:[158,42.95],face:'N',room:'home_kerrigan',name:'the Kerrigan house'},
  pike:{door:[106,56.95],face:'S',room:'home_pike',name:'the Pike house'},quinn:{door:[130,36.55],face:'N',room:'home_quinn',name:'Wickham Chapel'}});
Object.assign(HOME_SPOT,{harlow:[6.5,1.4],ashby:[3.4,2.4],vale:[3.4,2.4],kerrigan:[3.4,2.4],pike:[3.4,2.4],quinn:[5,2.6]});
for(const k of ['harlow','ashby','vale','kerrigan','pike','quinn']){const h=HOMES[k];const [x,z]=h.door;const shop=k==='harlow'||k==='quinn';
  interact.push({x,z,r:.9,label:()=>shop?'Enter':'Knock',ok:()=>true,act(){const who=npcs.filter(n=>n.loc==='in'&&n.homeKey===k);
    if(S.hour>=20&&!S.bound){toast(k==='harlow'?'The inn door is locked. The lantern in the window is lit. Someone inside says, “No vacancy,” in your voice.':'Nobody answers. Something inside counts, slowly, to three.',3,true);SFX.deny();return;}
    if(!who.length&&!shop){toast(`Nobody’s home at ${h.name}.`,1.8);SFX.thud(0,.2);return;}enterRoom(h.room);}});}
interact.push({x:134,z:56.95,r:.9,label:()=>'Door',ok:()=>true,act(){toast('Boarded. Through a gap: a child’s bedroom, a fishing rod, a calendar stopped on October 1999.',3.2,true);}});
// the inn sells food and a bed
vendors.inn={name:'The Lantern Inn',sub:'“Room for one. Never more than one.”',rows:()=>[
  {k:'stew',name:'Rabbit stew',desc:'+50 energy, +15 health.',price:22,can:true,buy(){addInv('stew');}},
  {k:'pie',name:'Hob’s pie',desc:'+60 energy, +25 health. There is a tooth in it. It is probably a rabbit’s.',price:35,can:true,buy(){addInv('pie');}},
  {k:'room',name:'Room four, one night',desc:'Sleep here; wake at six, rested. Lock the door.',price:30,can:S.hour>=17,buy(){setTimeout(()=>{$('shop').hidden=true;S.paused=false;newDay(`Day ${S.day+1}. You wake in room four. The door is unlocked. You locked it.`,[112,44.2]);},50);}}]};
interact.push({...rp('home_harlow',6.5,3.0),r:1.4,on:inRoom('home_harlow'),label:()=>'Counter',ok:()=>true,act(){openShop('inn');}});
// ---- routines
Object.assign(PL,{wk_square:[130,48,4],wk_inn:[112,44.4,1],wk_chapel:[130,38,1.2],wk_ferry:[128,69.8,.6],wk_river:[136,66,2],wk_lane:[130,WK.lane,8],wk_woods:[96,30,3],wk_gardens:[120,63,6],wk_board:[126,49.4,.6],wk_road:[150,20,2]});
Object.assign(LIFE,{
  tess:{home:'harlow',job:'Keeps the Lantern Inn',personality:'Kind, tired, unflappable. Talks to the guest book.',day:[[6,'home']]},
  hob:{home:'harlow',job:'Cooks at the inn, traps rabbits',personality:'Gruff and gentle. Feeds the guest nobody can see.',day:[[6,'wk_woods'],[10,'home'],[14,'wk_woods'],[17,'home']]},
  lyle:{home:'ashby',job:'Doctor for both villages',personality:'Precise, sorrowful, honest to a fault. Hears what is coming.',day:[[7,'home'],[10,'wk_square'],[12,'wk_inn'],[13,'wk_road'],[16,'home']]},
  vera:{home:'ashby',job:'The doctor’s daughter, wants out',personality:'Sixteen, sharp, restless. Has been packed to leave since she was ten.',day:[[8,'wk_board'],[10,'wk_lane'],[13,'wk_ferry'],[16,'wk_square'],[18,'home']]},
  quinn:{home:'quinn',job:'Lay preacher at Wickham Chapel',personality:'Serene, devout, quietly drowning in what he knows.',day:[[6,'home'],[9,'wk_river'],[12,'home'],[15,'wk_square'],[17,'home']]},
  nan:{home:'pike',job:'Runs the ferry, keeps the river',personality:'Weathered, dry, fond of the dead. Never poles anyone back.',day:[[6,'wk_ferry'],[12,'wk_inn'],[13,'wk_ferry'],[18,'home']]},
  finn:{home:'pike',job:'Nan’s boy, skips stones',personality:'Nine, cheerful, best friends with someone in the river.',day:[[7,'wk_river'],[10,'home'],[11,'wk_gardens'],[14,'wk_river'],[17,'home']]},
  iris:{home:'vale',job:'Seamstress, sews the Tithe’s clothes',personality:'Fussy, warm, afraid of her own hands.',day:[[7,'home'],[11,'wk_square'],[12,'home'],[16,'wk_board'],[17,'home']]},
  moss:{home:'kerrigan',job:'Trapper in the woods',personality:'Wary, quiet, a tracker of things that should not leave tracks.',day:[[5.5,'wk_woods'],[12,'wk_inn'],[13,'wk_woods'],[18,'home']]},
  ada:{home:'kerrigan',job:'Moss’s mother, blind, sees',personality:'Ancient, sharp, gentle. Sees what stands behind you.',day:[[6,'home'],[10,'wk_square'],[13,'home']]}});
INDOOR.wk_innwork={room:'home_harlow',door:[112,42.95],spots:{tess:[6.5,1.4]},browse:[[2.5,4.2],[10.5,4.2]]};
LIFE.tess.day=[[6,'home'],[7,'wk_innwork'],[21,'home']];
for(const n of npcs){const L=LIFE[n.def.id];if(L)n.def.role=L.job;}
// ---- roads to Wickham in the routing graph, and the map
Object.assign(RG,{w0:[150,-6],w1:[150,24],w2:[150,WK.street],w3:[130,WK.street],w4:[WK.x0,WK.street],g2:[70,LANE_E],w5:[128,WK.lane]});
for(const [a,b] of [['n','w0'],['w0','p'],['w0','w1'],['w1','w2'],['w2','w3'],['w3','w4'],['w4','g2'],['g2','g'],['w3','w5']]){(RADJ[a]=RADJ[a]||[]).push(b);(RADJ[b]=RADJ[b]||[]).push(a);}
MAP_PLACES.push(['Wickham Crossing',130,32],['Lantern Inn',112,39],['Ferry',128,74],['Wickham Road',153,12]);
{const _rs=socialReward;socialReward=function(r){_rs(r);const K={vera:'Vera’s hand in yours',riverstone:'Nan’s river stone',needle:'Iris’s needle',blindfold:'Ada’s blindfold'};if(K[r]){S.keyItems=S.keyItems||[];if(!S.keyItems.includes(r))S.keyItems.push(r);toast(`${K[r]} — kept in your journal.`,2.6);}};}
