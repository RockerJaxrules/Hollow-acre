/* ================= Chapter Two: the Tithe. Binding the Hollow was only the start. Every year the valley draws one name, and this year the
   drawing falls on your birthday. Learn what the town hides, bring back the three stones that hold the door, live through the last week,
   and choose what happens on Tithe night. Six endings. ================= */
S.st={tithe:0,act:1,seen:{},got:{},set:0,mail:null,mailDay:0,lettersRead:0,drawn:false,done:false,ev:{},frz:0,dopT:30,ending:null};
const ST_ENDS=['door','shore','truck','dunn','tag','taken'];
const stHas=k=>(S.keyItems||[]).includes(k);
const stLeft=()=>S.st.tithe?S.st.tithe-S.day:99;
const stKnown=()=>S.lore.filter(l=>!l.endsWith('|')).length;
const stLast=()=>S.st.tithe&&!S.st.done&&stLeft()<=6;
const stTitheNight=()=>S.st.tithe&&!S.st.done&&S.day===S.st.tithe;
const MAILPOS={x:-13.6,z:-1.9},CHURCH_STEP={x:48,z:-15.6},TITHE_DOOR={x:TITHE.x,z:TITHE.z-1.15};
const BEDPOS={x:ROOMS.cabin.ox+1.3,z:ROOMS.cabin.oz+2.9};
let stFound=[];try{stFound=JSON.parse(localStorage.getItem('hollowEndings')||'[]');}catch(e){}

// ---- the places that tell the story when you stand in them
const ST_PLACES=[
  {k:'marsh',name:'The Marsh place',x:-20,z:LANE_W+1.5,r:5,
   text:`It is your cabin. Not like it. Yours: the same porch board that sticks, the same crack across the window shaped like a river.<br><br>The note nailed to this door is in Grandpa’s handwriting, and it is addressed to you, and it is dated thirty years ago.`,
   lore:'The Marsh place is the same cabin as yours. Its door note is addressed to you, thirty years ago.'},
  {k:'tithe',name:'The Tithe House',x:TITHE.x,z:TITHE.z+3,r:6,
   text:`A small house with no windows, inside a ring of stones. The door has been nailed shut a hundred and fifty times. The holes go right through.<br><br>On the step there is a pair of child’s shoes, lined up neatly, toes pointing in.`,
   lore:'The Tithe House door has been nailed shut every year. Someone leaves shoes on the step, pointing in.'},
  {k:'tree',name:'The hollow tree',x:HOLLOW_TREE.x,z:HOLLOW_TREE.z-3,r:5,
   text:`The dead tree is split down the middle like a door left ajar. Carved inside, over and over, at the height of a child: <i>WHEN THE SUN IS IN.</i><br><br>The carving is fresh. The sap is still wet.`,
   lore:'Inside the hollow tree someone keeps carving WHEN THE SUN IS IN. Something is kept there, and only shows at noon.'},
  {k:'lake',name:'The Black Lake',x:LAKE.x,z:LAKE.z-LAKE.rz-1,r:6,
   text:`The water doesn’t reflect anything. Not the dock, not the sky, not you.<br><br>Under the last plank of the dock someone has tied a cord. It goes straight down. It is pulled tight, the way a cord is when someone at the other end is holding on.`,
   lore:'A cord is tied under the Black Lake dock, pulled tight from below.'},
  {k:'wick',name:'Wickham Crossing',x:130,z:46,r:7,
   text:`Wickham’s square has a noticeboard like Marrow Hollow’s. Every notice is the same notice, printed every year for a hundred and fifty years:<br><br><i>THE DRAWING WILL BE HELD AT MARROW HOLLOW CHURCH. ATTENDANCE IS KIND.</i><br><br>This year’s has your birthday on it.`,
   lore:'Wickham posts the same notice every year: the drawing is at Marrow Hollow church. This year’s date is your birthday.'},
];
// ---- letters from you, in your own handwriting, dated tomorrow
const ST_LETTERS={
  first:`Don’t be scared of the handwriting. It’s yours. I’m you, a little later.<br><br>The three stones that held the Tithe House door shut were moved, years ago, so it would open. One is under the Black Lake dock. One is in the hollow tree, but only when the sun is in. One is under your bed. It has always been under your bed.<br><br>Put them back on the doorstep before the drawing. I didn’t, last time.`,
  6:`Don’t trust the mirror in the cabin. It is a day ahead. I watched myself in it this morning, and I was already gone.`,
  5:`Count the chairs at the table tonight. Then sit down and count them again.`,
  4:`If you see yourself walking away from you, don’t follow. I did. That’s how I got here. I’m writing this from the other end of the week.`,
  3:`The Marsh place is your house. Not like your house. Your house. It’s just later there. Try the door.`,
  2:`They will clap. Don’t look at Mae when they clap. She’ll be the only one crying, and you’ll want to stay for her.`,
  1:`I’ve written this letter twenty-nine times. Every year I forget. Every year you read it anyway.<br><br>Please. This time, open the door from the inside.`,
};
const ST_TALK=['Happy birthday. Early, I know. We’re all early this week.','We’ll set a place for you. We always set a place.','You’ve got your grandfather’s height now. Did you notice? You’re taller than this morning.',
  'Don’t worry. It doesn’t hurt. That’s what they all say afterwards.','What was your name again? No, don’t tell me. It’s bad luck to know it this week.','I already miss you. Isn’t that funny?',
  'The children have been practising their clapping.','Mae’s baking for Sunday. Your favourite. How does she know your favourite?'];

// ---- the countdown on the clock
{const el=document.createElement('div');el.className='tithe';el.id='titheCd';el.style.cssText='font-size:11px;letter-spacing:.06em;margin-top:3px;color:#d98a5a;display:none';$('clock').appendChild(el);}
function stHud(){const el=$('titheCd');if(!S.st.tithe||S.st.done){el.style.display='none';return;}const L=stLeft();el.style.display='';
  let t=L>1?`The drawing in ${L-1} day${L-1>1?'s':''}`:L===1?'The drawing is tonight':'Tithe night';
  if(stLast()&&Math.floor(performance.now()/2300)%7===0)t=pick(['Your birthday','Happy birthday','Day 0','Stay']);el.textContent=t;}

// ---- objectives
{const _o=objective;objective=function(){if(!S.bound||!S.st.tithe||S.st.done)return _o();const st=S.st,L=stLeft();
  if(stLeft()<=2&&Math.floor(performance.now()/1700)%6===0)return ['Stay','Stay. Stay. Stay. Stay. Stay. Stay.',null];
  if(L===0)return ['Tithe night',isNight()?'Walk down Mill Road to the Tithe House. They are all waiting.':'Tonight, after the bell, walk to the Tithe House at the end of Mill Road.',TITHE_DOOR];
  if(L===1&&!st.drawn)return ['The drawing','Be at the church at six. Everyone will be.',CHURCH_STEP];
  if(st.mail)return ['A letter','There is a letter in your mailbox. The handwriting is yours.',MAILPOS];
  if(st.act===2){const left=ST_PLACES.filter(p=>!st.seen[p.k]).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    return ['The Tithe',`Learn what the valley hides. Places ${5-left.length}/5 · Things known ${Math.min(stKnown(),8)}/8`+(left.length?` · Next: ${left[0].name}`:' · Make friends, ask questions.'),left[0]||null];}
  const miss=[['dock','under the Black Lake dock',{x:LAKE.x,z:LAKE.z-LAKE.rz+1.6}],['tree','in the hollow tree, at noon',HOLLOW_TREE],['bed','under your bed',doorPos]].filter(m=>!st.got[m[0]]);
  if(miss.length)return ['Three stones',`Bring back what held the door. ${3-miss.length}/3 found. One is ${miss[0][1]}.`,miss[0][2]];
  const carry=Object.keys(st.got).length-st.set;
  if(carry>0)return ['Three stones',`Set the stones on the Tithe House doorstep. ${st.set}/3`,TITHE_DOOR];
  return ['The last days',`The drawing is in ${L-1} day${L-1>1?'s':''}. The stones are set. Make friends. Make plans. Keep what they give you.`,null];};}

// ---- starting Chapter Two once the Hollow is bound
function stStart(){const st=S.st;st.tithe=28*Math.ceil((S.day+12)/28);st.act=2;
  setTimeout(()=>openNote(`<h3>Chapter Two: The Tithe</h3><p>The bell rang on its own the night you bound it. Since then nobody in town will say your name out loud.</p><p>Mae tells you the drawing is on the ${st.tithe-1}th. She says it like you already know what that means. Cora has a number chalked on her blackboard. It goes down by one every morning.</p><p>Find out what the Tithe is.</p>`,'Find out',()=>{}),900);}

// ---- interactions
interact.push({x:MAILPOS.x,z:MAILPOS.z,r:1.1,on:()=>!!S.st.mail,label:()=>'Read',ok:()=>true,act(){const L=S.st.mail;S.st.mail=null;S.st.lettersRead++;SFX.page&&SFX.page();
  const day=S.day+1;openNote(`<h3>Day ${day}</h3><p>${ST_LETTERS[L]}</p>${L==='epi_door'?'':'<p style="text-align:right">— you</p>'}`,'Keep it',()=>{mindHit(L==='first'?6:4);if(L==='first'){S.st.act=3;addLore('A letter in my handwriting: the three stones are under the dock, in the hollow tree at noon, and under my bed. Put them back.');}});}});
interact.push({x:LAKE.x,z:LAKE.z-LAKE.rz+1.6,r:1.6,on:()=>S.st.act>=3&&!S.st.got.dock,label:()=>'Reach under',ok:()=>true,act(){S.st.got.dock=1;SFX.thud&&SFX.thud(0,.3);mindHit(6);
  toast('You follow the cord down into the cold. Something takes your wrist. Holds it. Lets go. In your hand: a black stone, warm as skin.',4,true);}});
interact.push({x:HOLLOW_TREE.x,z:HOLLOW_TREE.z-1.3,r:1.8,on:()=>S.st.act>=3&&!S.st.got.tree,label:()=>'Reach in',ok:()=>true,act(){
  if(S.hour<11.5||S.hour>13){toast('The hollow is only dark. The carving says WHEN THE SUN IS IN. Come back at noon.',3);SFX.deny();return;}
  S.st.got.tree=1;mindHit(5);toast('At noon the light goes straight down into the tree. A black stone sits in the bottom, and a child’s tooth beside it. You take the stone.',4,true);}});
{const bd=interact.find(e=>e.on===undefined?false:Math.abs(e.x-BEDPOS.x)<.01&&Math.abs(e.z-BEDPOS.z)<.01&&e.r===1.3);const _l=bd.label,_a=bd.act;const want=()=>S.st.act>=3&&!S.st.got.bed;
  bd.label=()=>want()?'Look under':_l();
  bd.act=function(){if(!want())return _a.call(this);S.st.got.bed=1;mindHit(8);SFX.stinger&&SFX.stinger();
    toast('It was always here. Under where you sleep. The floor beneath it is worn smooth, as if someone has been lying under your bed every night, holding it.',4.2,true);};}
// the Tithe House door: setting the stones, and the choice on Tithe night
{const td=interact.find(e=>e.x===TITHE.x&&Math.abs(e.z-(TITHE.z-1.15))<.01);const _act=td.act;
  td.label=()=>stTitheNight()&&isNight()?'Open':(Object.keys(S.st.got).length>S.st.set?'Set stones':'Door');
  td.act=function(){const st=S.st;if(stTitheNight()&&isNight()){stChoice();return;}
    const carry=Object.keys(st.got).length-st.set;if(carry>0){st.set+=carry;SFX.thud&&SFX.thud(0,.5);mindHit(3);
      toast(st.set>=3?'Three stones on the step. The door is quiet for the first time. Then, from inside, something knocks back. Three times.':`You set ${carry>1?'the stones':'the stone'} on the step. ${st.set}/3. The nails hum.`,3.6,true);return;}
    if(st.tithe&&!st.done&&stLeft()<=3){toast('The nails have been pulled. Every one. Someone has swept the step for you.',3.2,true);mindHit(3);return;}
    _act.call(this);};}
// in the last days, the Marsh place door opens into your own cabin
{const md=interact.find(e=>e.x===NEWHOUSES.marsh.x&&Math.abs(e.z-(NEWHOUSES.marsh.z+.35))<.01);const _act=md.act;
  md.label=()=>stLast()&&stLeft()<=3?'Open':'Door';
  md.act=function(){if(stLast()&&stLeft()<=3){mindHit(6);enterRoom('cabin');setTimeout(()=>toast('This is your cabin. Your bed is unmade. The kettle is warm. You were not here when you left.',4,true),700);return;}_act.call(this);};}

// ---- the drawing
function stDrawing(){const st=S.st;if(st.drawn)return;st.drawn=true;S.mode='trans';fade(1);
  const dunn=stHas('dunnslip'),dn=(npcById('dunn')&&npcById('dunn').def.name)||'Dunn';
  setTimeout(()=>{S.room=null;P.x=CHURCH_STEP.x;P.z=CHURCH_STEP.z+.6;P.dir='N';P.fx=0;P.fz=-1;P.anim=null;S.hour=Math.max(S.hour,18.2);S.mode='play';SFX.bell&&SFX.bell();
    playScene('hale','The drawing',`The whole valley is in the church. People you have never seen stand along the back wall, from Wickham, from the orchard, from places that aren’t on the map. Every pew is full except one space in the front row, exactly the width of you.<br><br>
Hale holds up the hat. It is Grandpa’s straw hat with the faded red band. You left it in the ash. You are sure you left it in the ash.<br><br>
Nobody speaks. The children are counting under their breath. Backwards.<br><br>
Hale reaches in without looking and unfolds a slip. He doesn’t need to read it. He reads it anyway.<br><br>`+
(dunn?`<q>${dn}.</q><br><br>Dunn is on his feet before Hale finishes. He looks at you and touches the brim of his hat. Every slip in that hat had your name on it. He burned sixty. He wrote one.<br><br>Nobody claps. Then, slowly, everybody does.`
     :`It is your name. Spelled the way Grandpa spelled it, which is not the way you spell it, and is somehow more right.<br><br>They clap. Politely, all together, like at a recital. Mae is the only one crying. A hand rests on your shoulder and stays there, and when you turn around, nobody is close enough to have done it.`)+
`<br><br><q>Tomorrow night,</q> Hale says. <q>Down the Mill Road. You’ll know the house. You’ve always known the house.</q>`,()=>{fade(0);mindHit(10);addLore(dunn?`At the drawing Hale read out ${dn}’s name. Every other slip had mine.`:'At the drawing Hale read out my name, in Grandpa’s spelling. Tomorrow night I walk to the Tithe House.');});},700);}

// ---- the choice at the door
function stChoice(){const st=S.st,danny=S.lore.some(l=>l.startsWith('Danny’s letter'));
  const opts=[
    ['door','Push the door open from this side',st.set>=3&&stHas('shard')&&stHas('ribbon')&&danny,'Needs the three stones on the step, the fourth shard, Ruth’s ribbon, and Danny’s letter'],
    ['shore','Run for the Black Lake with Vera',stHas('gascan')&&stHas('vera'),'Needs something to start the boat, and someone who won’t let go'],
    ['truck','Go back for Tobias and Walt’s truck',stHas('truckkey'),'Needs a key nobody has used in twenty-five years'],
    ['dunn','Let Dunn go in your place',stHas('dunnslip'),'Needs someone to put their own name in the hat'],
    ['tag','Give it the scarecrow instead',stHas('tag'),'Needs the thing it uses to find its Tithe'],
    ['taken','Open the door and go in',true,'']];
  const h=opts.map(([k,l,ok,why])=>ok?`<button class="btn endc" data-e="${k}" style="display:block;width:100%;margin:6px 0;text-align:left">${l}</button>`
    :`<div class="jsub" style="margin:6px 0;opacity:.55">🔒 ${why}</div>`).join('');
  $('noteText').style.maxHeight='62vh';$('noteText').style.overflowY='auto';openNote(`<h3>The Tithe House</h3><p>The ring of stones is full of people. The whole valley, standing in the dark with their backs to you, facing the door. Nobody turns around. The scarecrow from your field is standing among them.</p><p>The door is open an inch. Something on the other side is breathing in time with you.</p>${h}`,'Not yet',()=>{});}
$('noteClose').addEventListener('click',()=>{$('noteText').style.maxHeight='';$('noteText').style.overflowY='';});
$('noteText').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.endc');if(!b)return;$('note').hidden=true;noteCb=null;S.paused=false;stEnding(b.dataset.e);});

const ST_END={
  door:{t:'The Door Opens',who:'ruth',k:'The true ending',text:`You set the fourth shard on the step beside the other three. Ruth’s ribbon catches from the heat of it alone and burns blue.<br><br>
Behind the door something is pushing. Not one thing. Many hands, at many heights. A hundred and fifty-three of them.<br><br>
Danny’s letter was right. It was never a monster. It is a door, and everyone it took is still inside, holding it shut, every year, with their whole weight.<br><br>
You push from your side.<br><br>
The door opens outward. The Tall Man is only a frame of dark with nothing behind it, and out of it walk the Tithes, one for every year, back to the first. They are exactly the age they were. They are all looking for their houses.<br><br>
Last out is a man in a straw hat with a faded red band. He doesn’t know you. He says, <q>Is it still October?</q>`,
    end:'By morning the valley has a hundred and fifty-three more people in it and nowhere to put them. Next September, nobody is drawn. Nobody knows what to do with that. The man in the straw hat helps you in the field. Some mornings he calls you by your name, and some mornings by his.',
    epi:'The first morning after. Every house in the valley has a stranger asleep on the porch.'},
  shore:{t:'The Far Shore',who:'vera',k:'An ending',text:`Corwin’s can of gas still sloshes. The boat at the Black Lake dock has an outboard that has never once started. It starts.<br><br>
Vera is already in the boat. She doesn’t ask. She takes your hand and doesn’t let go: not when the water goes flat as glass, not when the fog closes over you.<br><br>
Halfway across you stop being able to hear the motor. Then the water. Then her.<br><br>
The far shore is a field. Your field. Your cabin. A light in the window.<br><br>
Someone is standing between your rows with a watering can, waving at the boat. They are wearing your coat. Vera’s hand is still in yours. It is very cold, and it has been for some time.`,
    end:'You made it out of the valley. You made it to Marrow Hollow. You always do. The person in your coat hands you the watering can and walks down to the boat, and Vera goes with them, and neither of them looks back.',
    epi:'You wake in a bed that is yours. There is lake water in your boots.'},
  truck:{t:'Walt’s Truck',who:'tobias',k:'An ending',text:`Walt’s truck starts on the first try, as if it has been waiting twenty-five years for someone to ask. Tobias climbs in with a backpack and a jar of glowcaps.<br><br>
Mill Road. Route 9. The sign for the county line. The headlights find it, and the engine dies exactly at the line.<br><br>
<q>Run,</q> you tell him. <q>Don’t look back. Don’t ever come back for me.</q><br><br>
He runs. You watch his little torch cross the line, and keep going, and keep going, and go out.<br><br>
The passenger door opens. Something folds itself into the seat beside you. It is very tall. It has been very patient. It puts its seatbelt on.`,
    end:'Years from now a man with a jar of dead mushrooms on his dashboard drives a long way toward a valley he doesn’t remember, because he keeps dreaming about a farm. His car breaks down on Route 9.',
    epi:'Tobias’s bed is made. Mae has set the table for one fewer. She is smiling.'},
  dunn:{t:'Dunn’s Name',who:'dunn',k:'An ending',text:`Dunn is already on the step of the Tithe House when you arrive, in his good coat. The nails are pulled. The door is open an inch.<br><br>
<q>Sixty times I burned it,</q> he says. <q>Your name. Then I wrote mine on the last slip. Steady hand. First time in years.</q><br><br>
He takes off his hat and puts it on your head. <q>Somebody has to be sheriff.</q><br><br>
He goes in. The door shuts behind him softly, as if it has manners.<br><br>
In July, Della writes a new name in her birth list. The baby has Dunn’s eyes, and cries whenever anyone wears a hat.`,
    end:'You keep his badge in a drawer. Sometimes it is warm. Next September someone will have to draw a name again, and the whole town keeps looking at you, waiting to see whose you’ll write.',
    epi:'Day after the Tithe. The sheriff’s office is unlocked. The kettle on his stove is still warm.'},
  tag:{t:'The Scarecrow',who:'ezra',k:'An ending',text:`The scarecrow has followed you all the way here. It stands at the edge of the clearing in its straw hat with the faded red band, facing the door.<br><br>
You push Ezra’s brass tag through its ear. The number stamped on the tag is the number of people in the valley, plus one.<br><br>
The door opens. A long arm reaches out and finds the tag the way a hand finds a light switch in the dark, and draws the scarecrow inside.<br><br>
From inside, a voice that sounds like Grandpa’s says <q>That’s not—</q> and the door shuts.<br><br>
In the morning your field has no scarecrow. You don’t miss it. But you keep finding straw in your bed, and in the mirror your face takes a second longer than it should to arrive.`,
    end:'It took a scarecrow. It counts what it is given. Next autumn it will come back to count again, and it will know that it was short.',
    epi:'The pole in your field is empty. Something has been sleeping in the straw by your door.'},
  taken:{t:'Taken',who:'hollow',k:'An ending',text:`You open the door. Inside is the cabin. Your cabin. The table is set for two, and the kettle is on.<br><br>
Grandpa is in the other chair. He is so tall now that he has to bend his neck against the ceiling.<br><br>
<q>I kept your place,</q> he says. <q>Every year. I kept it warm.</q><br><br>
You sit. The door shuts. Outside, very politely, the whole town claps.`,
    end:'Next October something walks the Mill Road wearing your coat. In July a child is born with straw-coloured hair. And on Route 9 a car breaks down, and a stranger starts walking east toward a farm they have never seen, where a note is nailed to the door in their own handwriting.',
    epi:'Day 1. Your car is wrecked. The note on the cabin door is in your handwriting.'},
};
function stEnding(k){const E=ST_END[k],st=S.st;if(st.done)return;st.done=true;st.ending=k;S.mode='scene';H.vis=false;M.dop=null;M.figs.length=0;
  if(!stFound.includes(k)){stFound.push(k);try{localStorage.setItem('hollowEndings',JSON.stringify(stFound));}catch(e){}}
  SFX.bell&&SFX.bell();fade(.6);
  playScene(E.who,E.t,E.text,()=>rollCredits(k,()=>{fade(0);S.mode='end';
    $('end').querySelector('.kicker').textContent=`${E.k} · ${ST_ENDS.indexOf(k)+1} of 6 · ${stFound.length} found`;
    {const h=$('end').querySelector('h1');h.textContent=E.t;h.style.fontSize='clamp(30px,8vw,58px)';h.style.lineHeight='1.08';}ui.toast.classList.remove('show');ui.toast.style.visibility='hidden';$('endStory').textContent=E.end;
    $('eDays').textContent=S.day;$('ePages').textContent=stFound.length+'/6';$('ePages').nextElementSibling.textContent='Endings';$('eCaught').textContent=S.caught;
    $('end').hidden=false;$('hud').hidden=true;$('buttons').hidden=true;ui.obj.hidden=true;}));}
$('keepFarming').addEventListener('click',()=>{const st=S.st;ui.toast.style.visibility='';if(st.done&&st.ending&&!st.epiShown){st.epiShown=true;setTimeout(()=>toast(ST_END[st.ending].epi,4.5,true),400);}});

// ---- days: letters, missed drawings, the night you don't go
{const _nd=newDay;newDay=function(msg,pos){const st=S.st;
  if(stTitheNight()&&S.mode!=='end'){S.mode='play';fade(0);stEnding('taken');return;}
  _nd(msg,pos);if(!st.tithe||st.done)return;const L=stLeft();
  if(L<=0&&!st.drawn){st.drawn=true;setTimeout(()=>toast('You don’t remember the drawing. Everyone says you were there. Everyone says you stood up when they read your name.',5,true),4200);}
  if(st.act===2&&L<=8){st.act=3;st.mail='first';st.mailDay=S.day;}
  else if(L>=1&&L<=6&&ST_LETTERS[L]&&!st.mail){st.mail=L;}
  if(st.mail)setTimeout(()=>toast('The flag on your mailbox is up.',2.6),4300);
  if(L===0)setTimeout(()=>toast('Tithe night. The whole valley is quiet. Even the birds are waiting.',4,true),4300);};}
{const _sl=sleep;sleep=function(){if(stTitheNight()&&isNight()&&S.mode==='play'){S.mode='trans';fade(1);setTimeout(()=>{S.mode='play';fade(0);
  toast('You lie down. The bed is already warm. Someone underneath it whispers your name, kindly.',3.6,true);setTimeout(()=>stEnding('taken'),2200);},1200);return;}_sl();};}

// ---- the story each frame
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);storyUpdate(dt);};}
function storyUpdate(dt){const st=S.st;stHud();if(!S.bound)return;if(!st.tithe){if(S.mode==='play'&&!S.paused&&$('end').hidden)stStart();return;}if(st.done)return;
  const L=stLeft(),out=!S.room;
  // the places
  if(out&&st.act>=2)for(const p of ST_PLACES){if(st.seen[p.k])continue;if(Math.hypot(P.x-p.x,P.z-p.z)<p.r&&!S.paused&&S.mode==='play'){st.seen[p.k]=1;SFX.page&&SFX.page();
    openNote(`<h3>${p.name}</h3><p>${p.text}</p>`,'Remember this',()=>{addLore(p.lore);mindHit(4);});break;}}
  if(st.act===2&&ST_PLACES.every(p=>st.seen[p.k])&&stKnown()>=8){st.act=3;st.mail='first';st.mailDay=S.day;toast('Back at the farm, the flag on your mailbox goes up. Nobody walked past it.',4,true);}
  // the drawing at six on the eve
  if(L===1&&!st.drawn&&S.hour>=18&&S.mode==='play'&&!S.paused)stDrawing();
  // the last week
  if(!stLast())return;
  if(st.frz>0){st.frz-=dt;for(const n of npcs)if(n.vis){n.wait=Math.max(n.wait,.4);n.dir=dirOf(P.x-n.x,P.z-n.z);}
    if(st.frz<=0){toast('And then, all at once, everybody goes back to what they were doing.',3);}}
  else if(out&&!isNight()&&(L===6||L===3)&&st.ev['frz'+S.day]!==1&&S.mode==='play'&&!S.paused){
    const near=npcs.filter(n=>n.vis&&Math.hypot(n.x-P.x,n.z-P.z)<14);if(near.length>=3){st.ev['frz'+S.day]=1;st.frz=7;SFX.tinnitus&&SFX.tinnitus();mindHit(6);toast('Everyone has stopped.',2.4,true);}}
  if(S.room==='cabin'&&S.hour>=17&&L===5&&!st.ev.table&&S.mode==='play'&&!S.paused){st.ev.table=1;mindHit(8);SFX.stinger&&SFX.stinger();
    openNote('<h3>Dinner</h3><p>The table has been set for two. Your plate, your fork, your cup. The other chair is pulled out, and the seat is warm.</p><p>You count the chairs. Two. You sit down and count again. Three.</p>','Don’t look up',()=>{});}
  if(out&&isNight()&&L<=4&&!st.ev['win'+S.day]&&Math.hypot(P.x-squarePos.x,P.z-squarePos.z)<22&&S.mode==='play'){st.ev['win'+S.day]=1;mindHit(5);
    toast('Every lit window on the street has someone standing in it, with their back to the glass. All of them are facing in. All of them are facing you, from the other side.',5,true);}
  if(out&&!isNight()&&L<=4&&!M.dop&&S.mode==='play'){st.dopT-=dt;if(st.dopT<=0){st.dopT=50+rand()*40;const p=aroundPlayer(.0,.5,8,10);M.dop={x:p.x,z:p.z,t:0,px:P.x,pz:P.z};}}
  if(L<=2&&rand()<dt/40)M.hudLie=1.6;
  // Tithe night: the valley lines the Mill Road, facing you as you pass
  if(L===0&&isNight()){if(!st.lined){st.lined=1;let i=0;for(const n of npcs){n._line=[i%2?18.4:21.6,30+Math.floor(i/2)*3.6];i++;}}
    for(const n of npcs){if(!n._line)continue;n.vis=true;n.x=n._line[0];n.z=n._line[1];n.wait=1;}
    if(!st.ev.road&&P.x>15&&P.x<25&&P.z>32&&P.z<86){st.ev.road=1;SFX.whisper&&SFX.whisper();toast('As you pass, each of them says it quietly. Happy birthday. Happy birthday. Happy birthday.',4.5,true);mindHit(6);}
    if(S.hour>=25.4&&S.mode==='play'&&!S.paused)stEnding('taken');}
}
// ---- what people say in the last week
{const _t=talk;talk=function(n){_t(n);if(stLast()&&rand()<.35&&$('talkLine'))setTimeout(()=>{if(!$('talk').hidden)$('talkLine').innerHTML=`<q>${pick(ST_TALK)}</q>`;},0);};}
// ---- the map shows the Tithe House once you know
if(typeof MAP_PLACES!=='undefined'&&!MAP_PLACES.some(p=>/Tithe/.test(p[0])))MAP_PLACES.push(['Tithe House',TITHE.x,TITHE.z]);
