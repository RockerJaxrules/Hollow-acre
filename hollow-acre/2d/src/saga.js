/* ================= the saga: the whole story in three chapters, and a great deal more of it.
   Chapter One · The Hollow   (arriving, the farm, the car, the loop, and the rite that binds the Hollow)
   Chapter Two · The Tithe    (what the valley hides: the places, the letters, the three stones)
   Chapter Three · The Door   (the last week, the drawing, Tithe night and its endings)
   Each chapter now has its own chain of story beats on top of what was there: places you're sent to, people you're sent to,
   and what you find there, written darker and bloodier. A beat shows in the goal bar with the guide arrow on it, plays when
   you get there (or talk to them), leaves something in the world (a carcass, blood, a rack of hooks, an open grave), costs
   you some of your mind, and goes in your journal. Chapter One's beats come before the peddler will sell you candles;
   Chapter Two's before the first letter and before the stones will sit on the step; Chapter Three's come one a day in the
   last week. A card marks each new chapter. ================= */
S.saga=S.saga||{done:{},ch:0};
const SG_PLACE=(x,z)=>{for(let r=0;r<6;r+=.5)for(let a=0;a<12;a++){const X=x+Math.cos(a/12*6.283)*r,Z=z+Math.sin(a/12*6.283)*r;
  if(typeof LAYERS!=='undefined'&&LAYERS.water(X,Z))continue;const p={x:X,z:Z};collide(p,.45);if(Math.hypot(p.x-X,p.z-Z)<.03)return {x:X,z:Z};}return {x,z};};
// the one who cares most: whoever you're dating (the closest, if more than one), else the one of them you're closest to
const sgPartner=()=>{let best=null,bh=-1;for(const id of Object.keys(typeof ROMANCE!=='undefined'?ROMANCE:PEOPLE)){if(!npcById(id))continue;const d=typeof romDating==='function'&&romDating(id);const h=hearts(id)+(d?100:0);if(h>bh){bh=h;best=id;}}return best||'mae';};
const sgName=id=>{const n=npcById(id);return n?n.def.name.split(' ')[0]:'Caitlyn';};
// ---- the beats
const SAGA=[
 // ======== Chapter One: after the road loops back, before the candles
 {id:'deer',gate:'c1',name:'Something kept time',at:()=>SG_PLACE(11,-15),r:2.2,
  goal:'Something is lying on the farm track behind the barn. Go and look.',props:[['g_deer_open',0,0,'flat']],
  title:'Something kept time',text:`The deer is lying on the track behind the barn, on its side, opened from the throat to the tail as neatly as a letter.<br><br>Everything that was inside it has been taken out and laid on the gravel around it in a ring. Twelve pieces, evenly spaced, like the numbers on a clock. The heart is at the top, where midnight would be.<br><br>It is still beating. Very slowly. Each beat a fly lifts off it and settles again.<br><br>In the middle of the ring, two ribs have been snapped off and set like the hands of the clock. They point down the track. At your cabin door.`,
  lore:'Something in the valley keeps time with what it kills. The clock it made behind the barn points at your door.',hit:9,fx:'blood'},
 {id:'well',gate:'c1',name:'What the well brought up',at:()=>({x:wellPos.x,z:wellPos.z+.6}),r:1.5,
  goal:'The water from the well has tasted of pennies since the deer. Go and look down the well.',
  title:'What the well brought up',text:`You let the bucket down to see. It comes up heavy, and slow, as if someone is holding the other end.<br><br>In it: water the colour of weak tea, and a braid of hair as long as your arm, tied off at both ends with baling twine. Wrapped in the braid there is a child’s milk tooth, and a brass tag stamped HOLLOW ACRE 1874.<br><br>The hair is the colour of yours. When you hold it up, the end that was in the water is warm.`,
  lore:'A braid of hair came up the well, wrapped round a child’s tooth and a tag: HOLLOW ACRE 1874. The hair is your colour.',hit:6,key:'braid',fx:'cold'},
 {id:'barn',gate:'c1',name:'Grandpa’s calendar',at:()=>SG_PLACE(16,-7.4),r:1.8,
  goal:'Grandpa kept something in the barn he never let anyone see. Go to the barn door.',
  title:'Grandpa’s calendar',text:`There is a calendar nailed inside the barn door. Not one: a hundred and fifty of them, one on top of the other, a page for every year, back to when the paper is brown and soft as cloth.<br><br>On every page one day is circled, in something that was red once. Never the same day. Always somebody’s birthday.<br><br>This year’s page is on top. The circled day is yours.<br><br>Under the calendars someone has drawn a body on the floorboards in chalk, and filled it in with salt. It is exactly your height. Where the face would be, somebody has drawn a little smile.`,
  lore:'Grandpa’s barn holds a calendar for every Tithe for a hundred and fifty years. This year’s circled day is your birthday. A chalk body your height lies under it, filled with salt.',hit:8,fx:'blood'},
 {id:'agnes',gate:'c1',name:'Ruth’s ribbon',npc:'agnes',
  goal:'Agnes Abernathy knew Grandpa longest. Ask her about the calendar (her house is the last one west, near your car).',
  title:'Ruth’s ribbon',text:`Agnes doesn’t ask you in. She stands in the door with a ribbon wound round and round her fingers, so tight the tips have gone white.<br><br><q>Ruth was nine. The night they drew her, I tied this in her hair so I’d be able to find her in the dark. They brought me back the ribbon in the morning. Folded. Very polite.</q><br><br><q>Your grandfather was the one who carried her to the house. He cried the whole way. He still carried her.</q><br><br>She looks at your hands, not your face. <q>Before you buy any candles off that thing at the crossroads, go and look at the small graves. See what they keep in them now.</q>`,
  lore:'Agnes’s daughter Ruth was drawn at nine. Grandpa carried her to the Tithe House, crying. They gave Agnes the ribbon back, folded.',hit:5},
 {id:'graves',gate:'c1',name:'The small graves',at:()=>SG_PLACE(57,-26),r:2.4,
  goal:'Go to the graveyard behind the church and find the small graves Agnes meant.',props:[['g_grave',0,0,'prop'],['g_blood',-1.2,.8,'flat']],
  title:'The small graves',text:`The small graves are in a row along the back wall. Each little stone has only a birthday on it. No names. Somebody has kept the grass short around every one.<br><br>The last one is open.<br><br>Lying in it, wrapped in a bedsheet, is something the shape of a person. The sheet is soaked through, dark, from the inside, and still soaking. It has been here long enough that the flies are fat and slow.<br><br>You don’t pull the sheet back. You don’t have to. Pinned to the chest is a paper label, the kind on a jar of preserves, in Grandpa’s handwriting: <i>for later.</i>`,
  lore:'The last small grave behind the church is open. Something wrapped in a soaked sheet lies in it, labelled in Grandpa’s hand: for later.',hit:11,fx:'blood'},
 // ======== Chapter Two, first part: before the letter
 {id:'mill',gate:'c2a',name:'The miller’s ledger',at:()=>SG_PLACE(30,97.5),r:2.4,
  goal:'Down Mill Road, the old mill kept the valley’s accounts. Find its ledger.',props:[['g_blood',1.4,.4,'flat']],
  title:'The miller’s ledger',text:`The ledger is on the sack scale, open, as if somebody just stepped away. Weights of grain, in a dozen hands, going back to 1871. Bushels. Bushels. Bushels.<br><br>And once a year, in the autumn, a single line in a different, careful hand: <i>The share. 3 st 12 lb.</i> <i>The share. 4 st 2 lb.</i><br><br>Those are the weights of children.<br><br>This year’s line is already written, waiting. The weight is blank. The date is your birthday. There is hair caught in the millstone, long and fine, wound round and round the spindle.`,
  lore:'The mill ledger weighs one “share” every autumn, the weight of a child. This year’s line has your birthday on it and no weight yet.',hit:7,fx:'cold'},
 {id:'quarry',gate:'c2a',name:'The shape in the stone',at:()=>SG_PLACE(146,-27),r:3,
  goal:'Maud’s quarry men walked off the job last week and won’t say why. Go to the quarry.',
  title:'The shape in the stone',text:`Someone has cut a fresh hollow into the quarry face. It is exactly the shape of a person standing with their arms at their sides. A little smaller than you.<br><br>Inside it, the stone is scratched. Thousands of short scratches, all at the height of hands, all going one way: out.<br><br>Three fingernails are still stuck in the rock, torn out at the root. They are painted pink. One of them has a little silver star on it, the kind girls stick on for a birthday.`,
  lore:'There is a person-shaped hollow cut into the quarry face, scratched from the inside. Three pink fingernails are still in the stone.',hit:9,fx:'blood'},
 {id:'orchard',gate:'c2a',name:'The bitten orchard',at:()=>SG_PLACE(46,55),r:3.2,
  goal:'The Quills haven’t picked their orchard this year. Go and see why (east of the crossroads, down Mill Road).',
  title:'The bitten orchard',text:`One tree in the middle of the orchard has no leaves at all, only apples. Every single apple has one bite taken out of it.<br><br>The bites are the wrong shape for deer. They are the shape of a person’s mouth. Small, careful, front teeth first.<br><br>One apple, low down, has the tooth still in it. A milk tooth. When you pull it out the root is wet.<br><br>The scarecrow at the end of the row is wearing Grandpa’s coat. You know it is his: your name is still sewn into the collar, from the summer he lent it to you.`,
  lore:'In the Quill orchard one tree is all apples, every one bitten by a child. The orchard scarecrow wears Grandpa’s coat, your name sewn in the collar.',hit:7,key:'tooth'},
 {id:'crypt',gate:'c2a',name:'Under the church',at:()=>SG_PLACE(53,-17.2),r:1.8,
  goal:'There’s a cellar door on the side of the church that Hale keeps chained. Tonight it isn’t.',props:[['g_coffins',.4,-1.6,'prop']],
  title:'Under the church',text:`The steps go down further than the church is tall. At the bottom are coffins. Small ones, in rows, a hundred and fifty of them, lids off, every one empty.<br><br>The inside of every lid is scratched. You hold your lantern close to read them. They are names, scratched with fingernails, over and over, the way you write your name when you’re learning: <i>RUTH RUTH RUTH RUTH.</i> <i>DANNY DANNY DAN.</i><br><br>At the end of the last row there is one big coffin. New wood. Brass handles. The plate on the lid is engraved with your name, and a date. Tomorrow’s. You come back up the steps backwards. You don’t remember deciding to.`,
  lore:'Under the church: a hundred and fifty small empty coffins, names scratched inside the lids. At the end, a new full-sized one with your name on the plate.',hit:12,fx:'blood'},
 {id:'ferry',gate:'c2a',name:'Nan’s price',npc:'nan',
  goal:'Wickham’s ferry crosses the river to nowhere. Ask Nan, who runs it, what the crossing costs (the ferry landing, south of Wickham).',
  title:'Nan’s price',text:`Nan doesn’t look up from her pole. The far bank is only fog. Nobody you have asked has ever seen anyone come back from it.<br><br><q>No coin,</q> she says. <q>Names.</q> There’s a pickle jar between her boots, packed with folded slips of paper. She unscrews it and takes one out without looking, as if she knew exactly where it was.<br><br>It is your name, in Grandpa’s handwriting.<br><br><q>He paid with yours,</q> Nan says, <q>thirty years ago, so he could stay. Good man. Kept his word. You’re late, that’s all.</q> She folds it, puts it back, and screws the lid down tight.`,
  lore:'Grandpa paid Nan, the Wickham ferrywoman, with your name thirty years ago, so he could stay. She says you’re late.',hit:8},
 // ======== Chapter Two, second part: after the letter, before the stones will sit on the step
 {id:'cold',gate:'c2b',name:'The cold house',at:()=>SG_PLACE(178,2.6),r:2.4,
  goal:'Otto says nobody has opened the old cold house by the Black Lake since Ruth. Somebody has. Go there.',props:[['g_hooks',0,-1.2,'prop']],
  title:'The cold house',text:`The cold house is a turf-roofed cellar dug into the bank, cold as a church. Meat hooks run the length of the ceiling. Two carcasses hang from them, skinned, glistening, still dripping into the sawdust: a pig, and something long-legged that might have been a deer.<br><br>The third is wrapped in sacking and tied with twine. It is the size of a nine-year-old. Its feet stick out at the bottom, bare, and the toenails are painted pink, and they are not rotten. Thirty years and they are not rotten.<br><br>There is a ribbon tied round one ankle. Someone has written on the sacking, in chalk: <i>RUTH — KEEP COLD.</i>`,
  lore:'Ruth Abernathy is in the cold house by the Black Lake, wrapped in sacking on a meat hook. Thirty years and she has not rotted. She was never taken anywhere.',hit:15,fx:'blood'},
 {id:'scare',gate:'c2b',name:'It turned its head',at:()=>({x:SCARE_SPOTS[0][0],z:SCARE_SPOTS[0][1]+1.2}),r:1.8,
  goal:'The scarecrow you bound the Hollow into has turned to face your cabin. Go to it.',
  title:'It turned its head',text:`You bound the Hollow into the scarecrow. You watched it go in. It hasn’t moved since.<br><br>It has now. Its head has turned all the way round to face your cabin, and the burlap where its face is drawn is wet, dark, as if it has been crying for a long time, or bleeding.<br><br>You reach up and touch it. The burlap is warm. Under your hand, something swallows.<br><br>Very quietly, from inside the straw, in Grandpa’s voice: <q>Not long now. Bring the stones home.</q>`,
  lore:'The bound scarecrow turned its head to watch your cabin. Its face is wet and warm. It speaks in Grandpa’s voice.',hit:10,fx:'cold'},
 // ======== Chapter Three: one a day through the last week
 {id:'list',gate:'c3',day:7,name:'Sheriff Dunn’s list',at:()=>({x:66,z:-8.3}),r:1.6,
  goal:'Dunn keeps the drawing list at his house. Go and see it before he locks it away.',
  title:'Sheriff Dunn’s list',text:`The list is pinned to Dunn’s front door with a kitchen knife, as if he wanted you to read it. A hundred and fifty names, one a year, in the same neat capitals. The last one is yours.<br><br>Under it he has pinned photographs. One for every year he’s been sheriff. A child in good clothes on the church step, holding a candle. In every photo the eyes have been scratched out with a pin, carefully, so the paper didn’t tear.<br><br>The newest photo is of you. You are asleep in your bed. It was taken from inside your cabin, from the corner by the stove, last night.`,
  lore:'Dunn keeps the drawing list and a photo of every child drawn, eyes scratched out. The newest is of you asleep, taken from inside your cabin last night.',hit:10,fx:'blood'},
 {id:'yourgrave',gate:'c3',day:6,name:'Silas digs',at:()=>SG_PLACE(63,-25),r:2.4,
  goal:'Silas has been digging since dawn. Go and see whose grave it is.',props:[['g_grave',0,0,'prop'],['g_blood',1.4,.9,'flat']],
  title:'Silas digs',text:`Silas leans on his spade. <q>Measured you the day you came,</q> he says. <q>Never wrong yet.</q><br><br>The grave is your size exactly. There is already somebody in it.<br><br>It is wearing your clothes, the ones you’re wearing now. Its hair is grey. Its hands are yours, older, the same scar across the thumb. The face has been eaten away by something small and patient, down to the teeth, and the teeth are smiling.<br><br>In its fist there is a letter in your handwriting. It says only: <i>Don’t trust the drawing. It isn’t random. It never was.</i>`,
  lore:'Silas dug your grave. An older you is already in it, face eaten to the teeth, holding a note: the drawing isn’t random. It never was.',hit:13,fx:'blood'},
 {id:'jars',gate:'c3',day:5,name:'Ida’s pantry',at:()=>({x:57,z:-8.3}),r:1.6,
  goal:'Ida Hale has asked you over for jam. She says she has something of yours.',props:[['g_jars',1.6,.2,'prop']],
  title:'Ida’s pantry',text:`Ida hums while she takes you through to the pantry, the same hymn she plays loud on Sundays so nobody hears the names.<br><br>The shelves are all jars. Jam, at the front. Behind the jam: teeth, sorted by size. Eyes in brine, pale blue and brown, turning slowly when the floor creaks. Each jar has a neat label with a year.<br><br><q>We keep a little of everyone,</q> she says, kindly. <q>So they’re not forgotten. It’d be a sin to forget.</q><br><br>She gives you an empty jar with a fresh label. It says this year. <q>For your things,</q> she says, <q>after. You can choose which. Most people choose the teeth.</q>`,
  lore:'Ida Hale keeps a jar of every drawn child: teeth, eyes in brine, labelled by year. She gave you an empty jar with this year on it.',hit:11,key:'jar'},
 {id:'rehearsal',gate:'c3',day:4,name:'The rehearsal',at:()=>({x:CHURCH_STEP.x,z:CHURCH_STEP.z+.4}),r:1.8,night:true,
  goal:'After dark there are lights in the church. The whole town is inside. Go to the church door.',
  title:'The rehearsal',text:`The whole town is in the pews, in their good clothes, practising.<br><br>Hale reads the names. Ida plays. Dunn holds the hat. And at the front, on the altar, where the child would stand, there is a dummy stuffed with straw, dressed in your clothes, with your face painted on a flour sack.<br><br>When Hale reads your name, everyone turns round to look at the door, where you are standing. They do it together, like a flock of birds.<br><br>Then Silas walks up to the altar with a butcher’s knife and opens the dummy from the throat down, and what comes out of it is not straw, and it is warm, and it steams in the cold church. Everybody claps.`,
  lore:'The town rehearses the drawing at night with a dummy of you. When Silas opened it on the altar, it bled. Everybody clapped.',hit:14,fx:'blood'},
 {id:'stay',gate:'c3',day:3,name:'Who stays',npc:()=>sgPartner(),
  goal:()=>`${sgName(sgPartner())} is looking for you. Find them before the drawing.`,
  title:'Who stays',text:()=>{const id=sgPartner(),nm=sgName(id),d=typeof romDating==='function'&&romDating(id);
   return `${nm} has been crying. They’ve stopped now and they’re angry about it.<br><br><q>I went to the cold house. I saw Ruth. I saw your grave. I know what they’re going to do and I know everybody in this town is going to stand there and let them.</q><br><br><q>I’m not.</q> ${d?'They take both your hands, hard enough to hurt.':'They grab your sleeve, as if you might walk off.'} <q>Whatever you decide at that door, I’m standing next to you. Not behind you. Next to you. If it takes you, it takes two.</q><br><br><q>${d?'I love you. I should have said it before, without all this blood around it.':'You’re my friend. Out here that means something. It means everything.'}</q>`;},
  lore:()=>`${sgName(sgPartner())} will stand next to you at the Tithe House door, whatever you choose. Not behind you. Next to you.`,hit:-12,partner:true},
];
const SG=Object.fromEntries(SAGA.map(b=>[b.id,b]));
const sgVal=v=>typeof v==='function'?v():v;
const sgDone=id=>!!S.saga.done[id];
// which beats are open for each gate right now
function sgGateOn(g){const st=S.st||{};
  if(g==='c1')return !!S.looped&&!S.bound;
  if(g==='c2a')return !!(S.bound&&st.started&&st.act===2);
  if(g==='c2b')return !!(S.bound&&st.started&&st.act>=3&&!st.tithe);
  if(g==='c3')return !!(st.tithe&&!st.done&&stLeft()>=2);return false;}
function sagaReady(g){return SAGA.filter(b=>b.gate===g).every(b=>sgDone(b.id));}
function sgCurrent(){for(const b of SAGA){if(sgDone(b.id)||!sgGateOn(b.gate))continue;
    if(b.gate==='c3'&&stLeft()>b.day)return null;   // not yet: one a day in the last week
    // c1 beats only gate the candles for a new run of the chapter; an old save already holding candles has them as extras
    return b;}return null;}
function sagaChapter(){if(!S.bound)return 1;const st=S.st||{};return st.tithe?3:2;}
const SG_CH={1:['Chapter One','The Hollow'],2:['Chapter Two','The Tithe'],3:['Chapter Three','The Door']};
// ---- the things the story leaves in the world
const SGW={objs:{}};
function sgProps(){for(const b of SAGA){if(!b.props)continue;const show=sgDone(b.id)||sgCurrent()===b;const have=SGW.objs[b.id];
  if(show&&!have){const p=b.at();SGW.objs[b.id]=b.props.map(([spr,dx,dz,kind])=>obj(spr,p.x+dx,p.z+dz,{kind:kind==='flat'?'flat':'prop',noCol:kind==='flat'}));}
  if(have)for(const o of have)o.hide=!show;}}
// ---- effects
function sgFx(kind,hit){if(hit>0)mindHit(hit);else if(hit<0&&typeof M!=='undefined')M.v=Math.min(100,M.v-hit);
  if(kind==='blood'){SFX.stinger&&SFX.stinger();cam.shake=Math.max(cam.shake,.35);const f=$('sgBlood');f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}
  else if(kind==='cold'){A.hiss&&A.hiss(1.6,.08,'bandpass',900,{q:2,wobble:true});cam.shake=Math.max(cam.shake,.12);}}
{const d=document.createElement('div');d.id='sgBlood';document.body.appendChild(d);
 const c=document.createElement('div');c.id='chCard';c.innerHTML='<div class="k"></div><div class="t"></div>';c.addEventListener('click',()=>c.classList.remove('on'));document.body.appendChild(c);
 const st=document.createElement('style');st.textContent=`#sgBlood{position:fixed;inset:0;pointer-events:none;z-index:60;opacity:0;
  background:radial-gradient(ellipse at center,rgba(90,0,0,0) 38%,rgba(110,4,10,.55) 72%,rgba(60,0,4,.92) 100%),linear-gradient(180deg,rgba(120,0,8,.5),rgba(0,0,0,0) 22%)}
#sgBlood.on{animation:sgB 2.4s ease-out}@keyframes sgB{0%{opacity:0}8%{opacity:1}100%{opacity:0}}
#chCard{position:fixed;inset:0;z-index:4000;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(6,4,6,.92);color:#e8d8c0;cursor:pointer;text-align:center}
#chCard.on{display:flex;animation:chC 5s ease forwards}#chCard .k{font-size:14px;letter-spacing:.32em;text-transform:uppercase;color:#b8402a;margin-bottom:10px}
#chCard .t{font-size:44px;letter-spacing:.04em;font-family:inherit}@keyframes chC{0%{opacity:0}15%{opacity:1}80%{opacity:1}100%{opacity:0;visibility:hidden}}`;document.head.appendChild(st);}
function sgCard(n){const c=$('chCard');const [k,t]=SG_CH[n];c.querySelector('.k').textContent=k;c.querySelector('.t').textContent=t;c.classList.remove('on');void c.offsetWidth;c.classList.add('on');
  SFX.bell&&SFX.bell();setTimeout(()=>c.classList.remove('on'),5200);}
// ---- playing a beat
function sgPlay(b){if(S.saga.done[b.id])return;S.saga.done[b.id]=S.day;const id=b.npc?sgVal(b.npc):null;const text=sgVal(b.text),lore=sgVal(b.lore);
  const fin=()=>{addLore(lore);journalNote(`${sgVal(b.title)}.`);if(b.key){S.keyItems=S.keyItems||[];if(!S.keyItems.includes(b.key))S.keyItems.push(b.key);}sgFx(b.fx,b.hit||0);sgProps();
    const nx=sgCurrent();if(!nx&&b.gate==='c1')setTimeout(()=>toast('Now the peddler at the crossroads will sell you candles. After 7:30 pm.',3.6),900);};
  if(id)playScene(id,sgVal(b.title),text,fin);else{SFX.page&&SFX.page();openNote(`<h3>${sgVal(b.title)}</h3><p>${text.replace(/<br>\s*<br>/g,'</p><p>')}</p>`,'Remember this',fin);}}
let sgCardQ=0,sgCardT=0;
function sagaTick(){if(S.mode!=='play'||S.paused||SCENE){sgCardT=0;return;}const ch=sagaChapter();
  if(S.saga.ch&&ch>S.saga.ch)sgCardQ=ch;S.saga.ch=ch;
  // the card waits until whatever note or scene opened the chapter has been read and closed
  if(sgCardQ){sgCardT+=.25;if(sgCardT>1.2){sgCard(sgCardQ);sgCardQ=0;sgCardT=0;}}
  sgProps();const b=sgCurrent();if(!b||b.npc||S.room)return;if(b.night&&!isNight()&&S.hour<19)return;
  const p=b.at();if(Math.hypot(P.x-p.x,P.z-p.z)<(b.r||2))sgPlay(b);}
setInterval(()=>{try{sagaTick();}catch(e){}},250);
// talking to the person a beat sends you to plays it instead of the usual chat
{const _t=talk;talk=function(n){const b=sgCurrent();if(b&&b.npc&&n&&n.def&&n.def.id===sgVal(b.npc)&&!isNight()){if(typeof lastQuestLine!=='undefined')lastQuestLine=null;sgPlay(b);return;}return _t.apply(this,arguments);};}
// ---- the goal bar and the guide arrow follow the beat
{const _o=objective;objective=function(){const r=_o();try{const b=sgCurrent();if(!b)return r;if(S.st&&S.st.done)return r;
  // in Chapter One the beats come once the road has looped, and only while you're still working toward the candles
  if(b.gate==='c1'&&(S.candles+lit())>0)return r;
  // Chapter Two's first part: the five places first, then these
  if(b.gate==='c2a'&&ST_PLACES.some(p=>!S.st.seen[p.k]))return r;
  if(b.gate==='c3'&&r&&/Stay|Tithe night|drawing/i.test(r[0]))return r;
  if(b.night&&!isNight()&&S.hour<19)return [sgVal(b.name),sgVal(b.goal).replace('After dark','Tonight, after dark,'),null];
  const at=b.npc?npcById(sgVal(b.npc)):b.at();const n=SAGA.filter(q=>q.gate===b.gate);const k=n.filter(q=>sgDone(q.id)).length;
  return [sgVal(b.name),`${sgVal(b.goal)} (${k+1}/${n.length})`+(at&&typeof wayChip==='function'?wayChip(at):''),at];}catch(e){return r;}};}
// ---- gates: the peddler, and the doorstep
{const _pr=vendors.peddler.rows;vendors.peddler.rows=function(){const rs=_pr.apply(this,arguments);if(sagaReady('c1')||(S.candles+lit())>0)return rs;
  return rs.map(r=>r.k==='candle'?Object.assign(r,{can:false,desc:'“Not yet. You haven’t seen what the valley is. Come back when you have.”'}):r);};}
{const td=interact.find(e=>Math.abs(e.x-TITHE_DOOR.x)<.6&&Math.abs(e.z-TITHE_DOOR.z)<.8&&e.act);if(td){const _a=td.act;td.act=function(){const st=S.st;
    if(!(stTitheNight()&&isNight())&&Object.keys(st.got).length>st.set&&!sagaReady('c2b')){const b=sgCurrent();toast(`The stones won’t sit. They roll off the step as if the step is tilting. Not yet.${b?' '+sgVal(b.goal):''}`,4,true);SFX.deny&&SFX.deny();return;}
    return _a.apply(this,arguments);};}}
// ---- the title screen and the journal speak in chapters
{const k=document.querySelector('#title .kicker');if(k&&/Chapter One/.test(k.textContent))k.textContent='Chapter One · The Hollow';}
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{const el=$('noteText');const h4=[...el.querySelectorAll('h4')].find(h=>/story so far/i.test(h.textContent));if(!h4)return r;
    const ch=sagaChapter();const tick=b=>b?'<b style="color:#8fd06a">✓</b>':'<span style="opacity:.5">○</span>';
    let h=`<p><b>${SG_CH[ch][0]} · ${SG_CH[ch][1]}</b></p>`;const gates=ch===1?['c1']:ch===2?['c2a','c2b']:['c3'];
    for(const g of gates){const bs=SAGA.filter(b=>b.gate===g);if(!sgGateOn(g)&&!bs.some(b=>sgDone(b.id)))continue;
      h+=bs.map(b=>`<p>${tick(sgDone(b.id))} ${sgDone(b.id)?sgVal(b.title):(b.gate==='c3'&&stLeft()>b.day?'<i>Not yet</i>':sgVal(b.name))}</p>`).join('');}
    h4.insertAdjacentHTML('afterend',h);}catch(e){}return r;};}
