/* ================= #157 the dark road: what the Ward is really for, and the one you love.
   - Every Ward bundle feeds it. The bell rings once, on its own, the night after; in the morning there is a gift on your step.
   - The fourth bundle has a price: something of yours that matters (your savings, your best haul, or a memory of the one you love).
   - The last week opens with a choice nobody should make: who walks into the woods so the drawing can be "fair".
   - Two dark heart events: Dunn listening at his floorboards, and Agnes feeding the drain in her cellar with her own blood.
   - Four days before Tithe night, the one you love is taken. The town says she was never here. Her door, the marks in the
     grass, her voice under your floor, a whisper in town: under the church. Tear the roots out of her before it wakes.
   - On Tithe night, opening the door saves everyone: her, whoever went into the woods, the Tithes, the town. ================= */
function DK(){if(!S.dk)S.dk={};const d=S.dk;d.clue=d.clue||{};d.seen=d.seen||{};if(d.fed==null)d.fed=0;if(d.bell==null)d.bell=0;return d;}
DK();
const dkNm=id=>typeof sgName==='function'?sgName(id):((npcById(id)||{def:{name:id}}).def.name.split(' ')[0]);
const dkTaken=()=>{const d=DK();return d.taken&&!d.freed?d.taken:null;};
const dkHomeDoor=id=>{const L=LIFE&&LIFE[id]||DK().life&&DK().life[id];const h=L&&HOMES[L.home];return h&&h.door?{x:h.door[0],z:h.door[1]+.5}:null;};
let DKCH=null;
function dkChoose(html,opts,cancel,onCancel){DKCH=opts;const h=opts.map((o,i)=>o.ok===false?`<div class="jsub" style="margin:6px 0;opacity:.55">🔒 ${o.why||''}</div>`
  :`<button class="btn dkc" data-i="${i}" style="display:block;width:100%;margin:6px 0;text-align:left">${o.label}</button>`).join('');
  openNote(html+h,cancel||'Not now',()=>{DKCH=null;onCancel&&onCancel();});}
$('noteText').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.dkc');if(!b||!DKCH)return;const o=DKCH[+b.dataset.i];DKCH=null;$('note').hidden=true;noteCb=null;S.paused=false;o&&o.fn&&o.fn();});

// ---------- 1. the Ward feeds it: the bell, then a gift on the step
const DK_GIFTS=[
  ['A basket of apples on your step, perfect and still warm, as if somebody had been holding them all night.',30],
  ['A jar of honey. Something in it is still moving, slowly, the way a thing moves when it has given up.',40],
  ['Grandpa’s straw hat with the faded red band. You left it in the ash. You are sure you left it in the ash.',50],
  ['A matchbox. Inside, on cotton wool: a child’s tooth. Yours. Your mother kept it in her jewellery box. Your mother is dead.',60],
  ['A birthday cake with your name iced on it in the old spelling. One slice is gone. The knife is still in it, and the knife is wet.',70],
  ['A key on a red ribbon, warm as a hand. It fits nothing in your house. You know, without knowing how, that it fits a door down the Mill Road.',90]];
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);const d=DK();const w=typeof wardDone==='function'?wardDone():0;
  if(w>d.fed){const i=Math.min(DK_GIFTS.length-1,w-1),[t,c]=DK_GIFTS[i];d.fed=w;S.coins+=c;
    setTimeout(()=>{if(S.mode!=='play')return;openNote(`<h3>On your step</h3><p>${t}</p><p>Under it, folded small, ${c} coins. Old ones. Every coin is dated the year Grandpa was drawn.</p><p class="jsub">It is pleased with you.</p>`,'Take it in',()=>{mindHit&&mindHit(3);addLore('Gifts on my step after every Ward bundle: '+t.split('.')[0].toLowerCase()+'.');});},5600);}
  // the last week: the woods, then her
  const st=S.st;if(st&&st.started&&!st.done&&typeof stLeft==='function'){const L=stLeft();
    if(L<=6&&L>=2&&!d.exile&&!d.exileT){d.exileT=1;setTimeout(()=>{if(S.mode==='play')dkExileAsk();else d.exileT=0;},7400);}
    if(L===1&&!d.exile)dkExileFor(null);
    if(L<=4&&L>=1&&!d.taken){const id=typeof sgPartner==='function'?sgPartner():'mae';if(npcById(id)){d.taken=id;d.takenDay=S.day;
        setTimeout(()=>{if(S.mode!=='play')return;SFX.stinger&&SFX.stinger();openNote(`<h3>${dkNm(id)}</h3><p>${dkNm(id)} didn’t come home last night.</p><p>Her door is standing open. The lamp in her window is still lit, burned right down. Nobody in town will look you in the eye.</p>`,'Find her',()=>{mindHit&&mindHit(8);addLore(`${dkNm(id)} was taken in the night. The town says she was never here.`);});},9800);}}}
  return r;};}
{const _u=update;update=function(dt){_u(dt);const d=DK();const w=typeof wardDone==='function'?wardDone():0;
  if(w>d.bell&&S.hour>=23.3&&S.mode==='play'&&!S.paused){d.bell=w;SFX.bell&&SFX.bell();toast('Across the valley the church bell rings once, on its own. It sounds, there is no other word for it, satisfied.',4.6,true);}};}

// ---------- 2. the price: the fourth bundle wants something of yours
const DK_VAL={gem:40,iron_bar:30,gold_bar:45,copper_bar:15,iron:6,copper:4,coal:3,wood:1,stone:1,fiber:1};
function dkSacrifice(wk){const d=DK(),p=typeof sgPartner==='function'?sgPartner():'mae',pn=dkNm(p);const opts=[];
  if(S.coins>=60){const half=Math.floor(S.coins/2);opts.push({label:`Your savings: ${half} coins, half of everything you have`,fn(){S.coins-=half;dkPaid('half your savings',`${half} coins`,`${half} coins in an old tobacco tin`);}});}
  let best=null,bv=0;for(const k of Object.keys(S.inv||{})){const n=S.inv[k]|0;if(n<=0)continue;const v=(DK_VAL[k]||(ITEMS[k]&&ITEMS[k].sell)||0)*n;if(v>bv){bv=v;best=k;}}
  if(best){const n=S.inv[best]|0,nm=(ITEMS[best]&&ITEMS[best].name)||best.replace(/_/g,' ');opts.push({label:`Every ${nm.toLowerCase()} you own (${n})`,fn(){takeInv(best,n);dkPaid(`every ${nm.toLowerCase()} I owned`,nm,`every ${nm.toLowerCase()} you gave it, counted, not one missing`);}});}
  opts.push({label:`What you remember of ${pn}’s laugh`,fn(){S.friend[p]=Math.max(0,(S.friend[p]||0)-200);dkPaid(`what I remembered of ${pn}’s laugh`,'memory','');
    setTimeout(()=>toast(`You try to remember the sound of ${pn} laughing. There is a gap there, neat as a pulled tooth.`,4.6,true),1200);}});
  dkChoose(`<h3>The Ward’s price</h3><p>Hale doesn’t take the bundle. He puts his hand flat on top of it.</p><p><q>Goods are goods. Anybody can bring goods. Every keeper puts something of their own in, or it doesn’t take. Your grandfather gave it the hand he wrote with.</q></p><p><q>Something that matters. It knows the difference.</q></p>`,
    opts,'Keep it',()=>toast('Hale nods and slides the bundle back to you. “When you’re ready. It’s patient. It’s the most patient thing there is.”',4));
  d.sacFor=wk;}
function dkPaid(what,short,back){const d=DK();d.sac={what,short,back,day:S.day};mindHit&&mindHit(7);SFX.thud&&SFX.thud(0,.5);addLore(`The Ward took ${what}. Hale says it knows the difference.`);
  setTimeout(()=>{toast('Hale puts it in the ledger box. The box is warm. Then he holds the ledger out for you, open.',3.6,true);setTimeout(()=>openWard(),900);},300);}
$('noteText').addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('.wardb');if(!b)return;const d=DK();if(d.sac||typeof wardDone!=='function'||wardDone()!==3)return;
  const w=WARD.find(x=>x.k===b.dataset.w);if(!w||S.ward[w.k]||!wardReady(w))return;e.stopPropagation();e.preventDefault();$('note').hidden=true;noteCb=null;S.paused=false;setTimeout(()=>dkSacrifice(w.k),120);},true);

// ---------- 3. who goes into the woods
const DK_EXILE_POOL=['silas','gideon','wes','hollis','orla','abel','maud','ezra','otto'];
function dkExileCands(){const d=DK(),p=typeof sgPartner==='function'?sgPartner():null;return DK_EXILE_POOL.filter(id=>npcById(id)&&id!==p&&id!==d.taken).sort((a,b)=>hash(a.length*7+S.day,b.length*3)-hash(b.length*7+S.day,a.length*3)).slice(0,3);}
function dkExileAsk(){const c=dkExileCands();if(!c.length)return;
  dkChoose(`<h3>The woods take one</h3><p>They come to your door at nine in the morning, a dozen of them, in their church clothes. Hale has his hat in his hands.</p><p><q>Before a drawing, one of us walks into the woods. So the drawing is fair. It’s always been that way.</q> He won’t look at you. <q>This year it’s yours to say who. The Tithe always chooses who chooses.</q></p><p>Behind him, three of them have already been sent to stand a little apart from the others.</p>`,
    c.map(id=>{const n=npcById(id);return {label:`${n.def.name} · <span style="opacity:.75">${n.def.role||''}</span>`,fn(){dkExileFor(id,true);}};}),'Refuse to choose',()=>dkExileFor(null,true));}
function dkExileFor(id,asked){const d=DK();if(d.exile)return;const c=dkExileCands();if(!c.length)return;const chose=!!id;id=id||c[(Math.random()*c.length)|0];d.exile=id;d.exileDay=S.day;const n=npcById(id),nm=n.def.name;
  if(!asked){addLore(`The town sent ${nm} into the woods without asking me.`);return;}
  playScene(id,'Into the woods',`${chose?`You say it. ${nm}.`:`You won’t say a name. Hale waits a long time. Then he says one for you: ${nm}.`}<br><br>
${nm} doesn’t argue. Nobody ever argues. Somebody has already packed them a bag: a blanket, a lantern, a tin of matches, a loaf. ${chose?'They look at you once, the way you look at a dog that bit you.':'They look at you once, and then at Hale, and something in their face closes like a door.'}<br><br>
The whole street walks them to the edge of the hill copse, under the trees, where it is dark at noon. Then everyone turns round at the same moment and walks back, and nobody looks back. You look back. ${nm} is standing exactly where they left them, lantern lit, not moving, watching you go.`,
    ()=>{mindHit&&mindHit(chose?9:6);addLore(chose?`I chose ${nm}. They walked into the hill copse with a lantern and a loaf, and nobody looked back but me.`:`I wouldn’t choose, so Hale chose for me: ${nm}. Into the hill copse, with a lantern.`);
      toast(`At night, ${nm}’s lantern can be seen in the hill copse above the church.`,4);});}
const dkCamp=()=>{if(!dkCamp.p)dkCamp.p=typeof SG_PLACE==='function'?SG_PLACE(COPSES[1].x+2.2,COPSES[1].z+3.8):{x:30,z:-29};return dkCamp.p;};
const DK_EXILE_LINES=['Don’t come any closer. It walks round the camp all night. Counting. It always stops at me.','I don’t eat anymore. I’m not hungry. Why am I not hungry?','I can hear the church from here. They’re singing. They sound so happy.','(They hold out their hands. The nails are gone. Not torn. Just gone, as if they were never grown.) It’s fine. It doesn’t hurt. That’s the part that frightens me.','Tell them I forgive them. No. Don’t. Tell them I know which of them chose.'];

// ---------- 4. people who aren't where they should be: the exiled, the taken, and her, after, never more than a step away
function dkHidden(){const d=DK(),out=[];if(d.exile&&!(S.st&&S.st.ending==='door'))out.push(d.exile);if(dkTaken())out.push(d.taken);if(d.freed&&d.freedDay===S.day&&S.hour<20.2)out.push(d.taken);return out;}
{const _tt=townTick;townTick=function(dt){const ids=dkHidden(),saved={};for(const id of ids){if(LIFE[id]){saved[id]=LIFE[id];delete LIFE[id];}}
  try{_tt(dt);}finally{for(const id of Object.keys(saved))LIFE[id]=saved[id];}};}
{const _u=update;update=function(dt){_u(dt);const d=DK();if(S.mode!=='play')return;
  // the exiled: only a lantern in the copse, and only at night
  if(d.exile&&!(S.st&&S.st.ending==='door')){const n=npcById(d.exile);if(n){const c=dkCamp();if(isNight()&&!S.room){n.loc='woods';n.vis=true;n.x=c.x;n.z=c.z;n.route=null;n.clip='idle';n.dir=dirOf(P.x-n.x,P.z-n.z);}else{n.vis=false;n.loc='gone';n.route=null;}}}
  // the taken: nowhere, unless you are standing in the room under the church
  const t=dkTaken();if(t){const n=npcById(t);if(n){if(S.room==='undercroft'){const R=ROOMS.undercroft;n.loc='bound';n.vis=true;n.x=R.ox+4;n.z=R.oz+1.5;n.dir='S';n.clip='idle';n.route=null;}else{n.vis=false;n.loc='gone';n.route=null;}}}
  // her, the day you bring her back: she won't let you out of her sight
  if(d.freed&&d.freedDay===S.day&&S.hour<20.2){const n=npcById(d.taken);if(n){if(S.room){n.vis=false;n.loc='gone';}else{if(n.loc!=='follow'){n.loc='follow';n.x=P.x+.9;n.z=P.z+.6;}n.vis=true;n.route=null;
      const dx=P.x-n.x,dz=P.z-n.z,dd=Math.hypot(dx,dz);if(dd>6){n.x=P.x+.9;n.z=P.z+.6;}if(dd>1.6){const sp=Math.min(dd-1.4,(P.spd||3)*1.05+.4)*dt;n.x+=dx/dd*sp;n.z+=dz/dd*sp;collide(n,.3);n.clip='walk';n.dir=dirOf(dx,dz);}else{n.clip='idle';n.dir=dirOf(dx,dz);}}}}
  else if(d.freed&&npcById(d.taken)&&npcById(d.taken).loc==='follow'){const n=npcById(d.taken);n.loc=null;n.vis=true;}};}

// ---------- 5. dark heart events
const DK_SCENES={
  dunnfloor:()=>{const d=DK(),t=dkTaken(),tn=d.taken?dkNm(d.taken):null;return `Dunn is lying on his kitchen floor with his ear pressed to the boards. He doesn’t get up. He holds up one finger: wait.<br><br>
He has pried up a single board. The nails are bent outward, toward him, as if something had pushed them from below. The joists underneath are wet, and it isn’t water. It is darker than water and it doesn’t run.<br><br>
<q>Listen.</q><br><br>Voices. Dozens of them, very far down, as if the house were standing on a well. They are reading out names. Slowly, carefully, the way you read a list you don’t want to get wrong. You know some of the names. They are on the graves behind the church.<br><br>
<q>They get to the end and they start again,</q> Dunn says. <q>Thirty years I’ve listened. This week there’s a new one at the end.</q> He looks at you. <q>Yours.</q><br><br>`+
(t?`And then, so quietly that you might have made it up, a voice that isn’t reading anything. It is ${tn}’s. It says your name the way you’d say it in the dark to find out if someone is still there.<br><br><q>She’s down there with them,</q> Dunn says. <q>Under the church. That’s where it all goes. I’m sorry. I’m sorry. I write the names. I’ve always written the names.</q>`
:`And under yours, so faint you nearly miss it, one more. ${tn||'Someone you love'}. Not read out. Just said, once, the way you’d try a word in your mouth to see how it tastes.<br><br><q>That one’s not on the list,</q> Dunn says. <q>Not yet.</q>`);},
  ritual:()=>`Agnes is kneeling at the drain in the middle of the floor with her sleeves rolled up past the elbow. She is humming the Tithe hymn. She doesn’t stop when you come down the ladder.<br><br>
Her forearms are laddered with scars from wrist to elbow. Hundreds of them. White, and pink, and the newest ones still scabbed. The oldest are small and crooked, cut by a child.<br><br>
She takes the paring knife from beside Ruth’s hairbrush on the altar and draws it along her arm, one rung up from yesterday’s, neat and shallow. The blood runs down her fingers into the bowl, and she tips the bowl into the drain, and the drain <i>swallows</i>. You hear it. A throat.<br><br>
<q>Fifty-one years,</q> she says. <q>Every night. A little keeps it sleepy. A little keeps it off the children.</q> She wraps her arm in a tea towel that is already brown. <q>Your grandfather used to help me, when my arms were bad. He had good strong arms.</q><br><br>
She wipes the knife on her apron and holds it out to you, handle first.`};
function dkScene(k,id,after){const d=DK();if(d.seen[k])return;d.seen[k]=1;setTimeout(()=>{playScene(id,{dunnfloor:'Under the floor',ritual:'The feeding'}[k],DK_SCENES[k](),after);},900);}
{const _er=enterRoom;enterRoom=function(k){const r=_er.apply(this,arguments);const d=DK();try{
  if(k==='home_dunn'&&S.bound&&(S.hour>=18.5||S.hour<2)&&!d.seen.dunnfloor&&typeof hearts==='function'&&hearts('dunn')>=4)dkScene('dunnfloor','dunn',()=>{mindHit&&mindHit(7);if(dkTaken())DK().clue.floor=1;addLore(dkTaken()?`Under Dunn’s floor the dead read out names. ${dkNm(DK().taken)} is down there with them. Under the church.`:'Under Dunn’s floor the dead read out the names of the Tithes, over and over. Mine is the newest.');});
  if(k==='cellar_agnes'&&(S.hour>=18||S.hour<3)&&!d.seen.ritual){setTimeout(()=>{const n=npcById('agnes'),R=ROOMS.cellar_agnes;if(n&&R){n.vis=true;n.x=R.ox+4;n.z=R.oz+2.1;n.dir='N';n.clip='idle';}},800);
    dkScene('ritual','agnes',()=>dkChoose('<h3>The knife</h3><p>Agnes holds it out, handle first, and waits. The drain is waiting too. You can hear it.</p>',[
      {label:'Give it your blood',fn(){d.ritual=1;S.hp=Math.max(1,(S.hp||100)-25);mindHit&&mindHit(9);SFX.breath&&SFX.breath(0);burst(P.x,P.z,10,'#6a0c0a',1.2,.8,1.4);addFriend&&addFriend('agnes',150);
        toast('It stings, and then it doesn’t. The drain swallows twice. Somewhere below the house something turns over in its sleep, contented. Agnes pats your hand. “There. Now it knows you.”',5.4,true);addLore('I bled into Agnes’s drain. It drank. Agnes says now it knows me.');}},
      {label:'Refuse',fn(){d.ritual=-1;addFriend&&addFriend('agnes',-100);mindHit&&mindHit(4);
        toast('Agnes nods, as if you’d said something about the weather. “Then I’ll give a little more,” she says, and rolls up her other sleeve.',5,true);addLore('Agnes offered me the knife. I refused. She cut her other arm instead.');}}],'Back away',()=>{d.ritual=-1;toast('You back up the ladder. Below you, Agnes starts humming again, and the drain starts swallowing.',4,true);}));}
  if(k==='undercroft')dkEnterUnder();}catch(e){console.warn('darkpath',e);}return r;};}

// ---------- 6. her: the clues
const dkCrypt=()=>{if(!dkCrypt.p)dkCrypt.p=typeof SG_PLACE==='function'?SG_PLACE(CHURCH_DOOR.x+5.8,CHURCH_DOOR.z+1.3):{x:CHURCH_DOOR.x+5.8,z:CHURCH_DOOR.z+1.3};return dkCrypt.p;};
interact.push({x:0,z:0,r:1.3,story:true,on:()=>!S.room&&!!dkTaken()&&!!dkHomeDoor(DK().taken),label:()=>DK().clue.door?'Look':'Her door',ok:()=>true,act(){const d=DK(),nm=dkNm(d.taken);
  if(d.clue.door){toast(`The marks go out through the wet grass, round the side of the house, toward the church.`,3.4);return;}d.clue.door=1;SFX.page&&SFX.page();
  openNote(`<h3>${nm}’s door</h3><p>The door is open and the lamp is burned down to the brass. Her shoes are by the mat, side by side. She went wherever she went barefoot.</p><p>On the hall floor, two long marks, the width of heels, and on the doorframe, at hand height, four lines scratched into the paint. Fingernails. One nail is still in the wood.</p><p>The marks go out across the wet grass. They go toward the church.</p>`,'Follow them',()=>{mindHit&&mindHit(6);addLore(`${nm} was dragged out of her house by the heels. She held the doorframe hard enough to leave a nail in it. The marks go toward the church.`);});}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){const p=dkTaken()&&dkHomeDoor(DK().taken);return p?p.x:0;}},z:{get(){const p=dkTaken()&&dkHomeDoor(DK().taken);return p?p.z+.2:0;}}});}
// your own floor, at night: her voice
interact.push({x:0,z:0,r:1.1,story:true,on:()=>S.room==='cabin'&&isNight()&&(!!dkTaken()&&!DK().clue.floor||(typeof wardDone==='function'&&wardDone()>=3&&!DK().seen.cabinfloor)),label:()=>'Listen',ok:()=>true,act(){const d=DK();SFX.whisper&&SFX.whisper(0);
  if(dkTaken()&&!d.clue.floor){d.clue.floor=1;mindHit&&mindHit(6);const nm=dkNm(d.taken);openNote(`<h3>Under the floor</h3><p>You lie down with your ear to the boards. Cold comes up through them, cold like a cellar.</p><p>Far down, through earth, through stone, a voice. ${nm}’s. Hoarse, as if she has been calling for a long time.</p><p><q>…it’s so cold. I can hear the organ. I can hear them singing above me. Please. It’s waking up. It wakes up a little more every time they sing.</q></p>`,'Under the church',()=>addLore(`${nm}’s voice comes up through my cabin floor. She can hear the organ above her. She is under the church.`));return;}
  d.seen.cabinfloor=1;mindHit&&mindHit(4);toast('You put your ear to the boards. Far below, a crowd of people are breathing in, all together, and holding it.',4.4,true);addLore('Under my cabin floor, a crowd of people breathe in and hold it.');}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){const R=ROOMS.cabin;return R?R.ox+(R.door||3)+.9:0;}},z:{get(){const R=ROOMS.cabin;return R?R.oz+(R.d||5)-1.3:0;}}});}
// the town says she was never here; one of them, once, tells the truth
{const _t=talk;talk=function(n){_t(n);const d=DK(),t=dkTaken();if(!t||!n||!n.def||n.def.id===t||isNight()||!$('talkLine'))return;
  if(n.def.id===d.exile)return;if(Math.random()>.6)return;const nm=dkNm(t);d.gl=(d.gl||0)+1;
  const L=[`${nm}? She went to her sister’s in Wickham. She told everyone. She didn’t tell you?`,`Stop asking about ${nm}. People are starting to talk.`,`Who? (They frown, politely.) I don’t know anyone called ${nm}. Are you feeling all right? You look like you haven’t slept.`,
    `(They glance over their shoulder and whisper, very fast.) Under the church. The crypt door, round the side. Don’t tell them I told you. They’d put me down there too.`][Math.min(3,d.gl-1)];
  if(d.gl===4){d.clue.whisper=1;addLore(`Somebody whispered it to me: ${nm} is under the church. The crypt door, round the side.`);}
  $('talkLine').innerHTML=`<q>${L}</q>`;};}
// the marks in the grass, from her door toward the church
let DK_TRAIL=null;
function dkTrail(){const d=DK();if(DK_TRAIL&&DK_TRAIL.id===d.taken)return DK_TRAIL;const a=dkHomeDoor(d.taken),b=dkCrypt();if(!a||!b)return null;let pts=null;
  try{const p=typeof navPath==='function'?navPath(a.x,a.z+.3,b.x,b.z):null;if(p&&p.length)pts=[[a.x,a.z-.2],[a.x,a.z+.3]].concat(p.map(q=>[q[0],q[1]]));}catch(e){}
  if(!pts)pts=[[a.x,a.z],[b.x,b.z]];const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  DK_TRAIL={id:d.taken,pts,cum,len:cum[cum.length-1]};return DK_TRAIL;}
{const _mg=mindGround;mindGround=function(){_mg();const d=DK();if(S.room||!d.taken||(!dkTaken()&&d.freedDay!==S.day))return;const T=dkTrail();if(!T)return;
  for(let i=1;i<T.pts.length;i++){const [x0,z0]=T.pts[i-1],[x1,z1]=T.pts[i],L=Math.hypot(x1-x0,z1-z0);if(L<.01)continue;const ux=(x1-x0)/L,uz=(z1-z0)/L;
    if(!onScreen((x0+x1)/2,(z0+z1)/2,L*PPM+60))continue;
    for(let s=0;s<L;s+=.3){const g=T.cum[i-1]+s,fade=g<16?1:g>T.len-10?1:.35,x=x0+ux*s,z=z0+uz*s;
      for(const o of [-.17,.17]){const X=Math.round(sx(x-uz*o)),Y=Math.round(sz(z+ux*o));ctx2.fillStyle=`rgba(84,10,6,${.7*fade})`;ctx2.fillRect(X-1,Y-1,3,3);ctx2.fillStyle=`rgba(30,6,4,${.35*fade})`;ctx2.fillRect(X,Y+1,2,1);}
      const h=hash((g*10)|0,13);if(h<.18){ctx2.fillStyle=`rgba(120,12,8,${.75*fade})`;const X=Math.round(sx(x+(h-.09)*4)),Y=Math.round(sz(z+(h*7%1-.5)*.6));ctx2.fillRect(X,Y,2,2);if(h<.05)ctx2.fillRect(X+2,Y+1,1,1);}}}};}
// the crypt door
interact.push({x:0,z:0,r:1.3,story:true,on:()=>!S.room&&!!dkTaken()&&(DK().clue.door||DK().clue.floor||DK().clue.whisper),label:()=>'Go down',ok:()=>true,act(){SFX.thud&&SFX.thud(0,.4);mindHit&&mindHit(3);const c=dkCrypt();ROOMS.undercroft.out={x:c.x,z:c.z+.7};enterRoom('undercroft');}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return dkCrypt().x;}},z:{get(){return dkCrypt().z;}}});}
// what the goal bar says while she's gone
{const _o=objective;objective=function(){const r=_o();try{const d=DK(),t=dkTaken();if(!t||(S.st&&S.st.done))return r;const nm=dkNm(t);const wc=p=>p&&typeof wayChip==='function'?wayChip(p):'';
  if(S.room==='undercroft')return ['Cut her free',`Tear the roots out of ${nm} before it wakes. (${(d.roots||[]).filter(q=>q.hp>0).length} left)`,null];
  if(!d.clue.door&&!d.clue.floor&&!d.clue.whisper){const p=dkHomeDoor(t);return ['Taken',`${nm} is gone. Start at her house.`+wc(p),p];}
  const c=dkCrypt();return ['Taken',`${nm} is under the church. The crypt door is round the side.`+wc(c),c];}catch(e){return r;}};}

// ---------- 7. the room under the church, and the roots
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;const F=(spr,x,z,dep,kind)=>{const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;return [spr,x,z,kind==='flat'?null:[-hw,-(dep||.4),hw,0],kind||undefined];};
  ROOMS.undercroft={ox,oz:-60,name:'Under the church',shell:'room_cellar_agnes',out:{x:0,z:0},furn:[F('in_coffin',1,3.7,1.9),F('in_coffin',7,3.7,1.9),F('in_candles',2.6,.9,.3),F('in_candles',5.4,.9,.3),
    ['in_stain',4,2.3,null,'flat'],['in_stain',2.2,3.2,null,'flat'],['in_stain',5.9,2.8,null,'flat'],['in_stain',4.6,3.9,null,'flat']]};}
const DK_ROOTS=[[1.7,1.3,.2,.5],[6.3,1.3,7.8,.5],[2.9,2.75,3.1,2.35]];   // where you stand to tear at it, and where it comes out of the wall/floor
function dkEnterUnder(){const d=DK();if(!dkTaken())return;if(!d.roots)d.roots=DK_ROOTS.map(()=>({hp:6}));d.fear=Math.min(d.fear||0,.2);d.flash=0;
  setTimeout(()=>{const nm=dkNm(d.taken);SFX.stinger&&SFX.stinger();toast(`${nm}. Roots have come out of the walls and the floor and gone into her. Not round her wrists. Into them.`,5,true);mindHit&&mindHit(8);},900);}
DK_ROOTS.forEach((rt,i)=>{interact.push({x:0,z:0,r:1.15,story:true,on:()=>S.room==='undercroft'&&!!dkTaken()&&!!DK().roots&&DK().roots[i].hp>0,label:()=>'Tear the root',ok:()=>true,act(){dkTear(i);}});
  const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.undercroft.ox+rt[0];}},z:{get(){return ROOMS.undercroft.oz+rt[1];}}});});
function dkTear(i){const d=DK(),R=ROOMS.undercroft,q=d.roots[i];if(!q||q.hp<=0)return;q.hp--;d.fear=Math.min(1,(d.fear||0)+.035);
  const x=R.ox+DK_ROOTS[i][0],z=R.oz+DK_ROOTS[i][1]-.4;burst(x,z,7,'#5a0806',1.6,.7,1.8);burst(x,z,3,'#2a1810',1,.6,1.2);cam.shake=Math.max(cam.shake||0,.18);
  if(A.ok){A.hiss(.14,.22,'bandpass',520,{q:1.4});A.tone(90,.18,'sine',.25,{slide:50});if(Math.random()<.5)A.tone(240+Math.random()*80,.4,'sawtooth',.04,{slide:160,filter:['bandpass',700,3]});}
  const n=npcById(d.taken);if(n&&typeof RX!=='undefined'&&Math.random()<.4)RX.bub.push({n,line:['Don’t stop. Don’t stop.','It’s listening.','Pull. Please. Pull.','I can feel it in my teeth.','Faster. It’s waking.'][(Math.random()*5)|0],t:0,life:2.6});
  if(q.hp<=0){SFX.shriek&&SFX.shriek(0);burst(x,z,16,'#6a0a08',2.2,1,2.4);toast(['The root comes out of her with a wet sound, a long way, longer than her arm. It thrashes on the floor and goes still.','The second root lets go of her the way a fist lets go. She screams, and then she laughs, and then she screams.','The last one is in her side. It comes out slowly, and at the end there is something on it like a small black seed, and it is beating.'][3-d.roots.filter(r=>r.hp>0).length-1]||'It lets go.',4.2,true);}
  if(d.roots.every(r=>r.hp<=0))setTimeout(dkFreed,700);}
// it wakes while you work
{let hb=0;const _u=update;update=function(dt){_u(dt);const d=DK();if(S.room!=='undercroft'||!dkTaken()||!d.roots||S.mode!=='play'||S.paused)return;
  d.fear=Math.min(1,(d.fear||0)+dt/(isNight()?16:22));if(d.flash>0)d.flash-=dt;hb-=dt;if(hb<=0){hb=lerp(1.1,.32,d.fear);SFX.heart&&SFX.heart(.2+d.fear*.6);}
  if(d.fear>=1){d.fear=.2;d.flash=1.1;SFX.scream&&SFX.scream();mindHit&&mindHit(8);cam.shake=.6;
    const cut=d.roots.map((r,i)=>[r,i]).filter(([r])=>r.hp<6).sort((a,b)=>a[0].hp-b[0].hp)[0];if(cut){cut[0].hp=Math.min(6,cut[0].hp+3);toast(cut[0].hp===3&&d.roots.filter(r=>r.hp<=0).length===0?'Something in the dark comes at you along the ceiling, and then it is gone, and the root you were tearing at has grown back into her.':'It comes out of the dark at you, all teeth and no face, and when you can see again, one of the roots has grown back. Into her wrist. She doesn’t scream this time. That’s worse.',4.8,true);}}};}
{const _do=depthOver;depthOver=function(t){_do(t);const d=DK();if(S.room!=='undercroft'||!d.roots)return;const R=ROOMS.undercroft;const px=sx(R.ox+4),py=sz(R.oz+1.5);
  // the roots: out of the walls and the floor, into her
  DK_ROOTS.forEach((rt,i)=>{const q=d.roots[i];if(!q||q.hp<=0)return;const fl=i===2;const ax=sx(R.ox+rt[2]),ay=sz(R.oz+rt[3])-(fl?0:46),bx=px+(i===0?-7:i===1?7:-3),by=py-(fl?20:30);const w=2+q.hp;
    const mx=(ax+bx)/2+Math.sin(t*1.7+i)*3+(fl?-10:0),my=fl?Math.min(ay,by)-10:(ay+by)/2+16+Math.cos(t*1.3+i)*3;
    for(const [col,ww] of [['#0e0604',w+3],['#2e140c',w+1],['#4a2414',Math.max(2,w-1)],['#6a3a22',Math.max(1,(w>>1)-1)]]){ctx2.strokeStyle=col;ctx2.lineWidth=ww;ctx2.beginPath();ctx2.moveTo(Math.round(ax),Math.round(ay));ctx2.quadraticCurveTo(mx,my,Math.round(bx),Math.round(by));ctx2.stroke();}
    // knots, little side roots, and where it goes into her
    for(let k=1;k<6;k++){const f=k/6,x=(1-f)*(1-f)*ax+2*(1-f)*f*mx+f*f*bx,y=(1-f)*(1-f)*ay+2*(1-f)*f*my+f*f*by;ctx2.fillStyle='#1a0a06';ctx2.fillRect(Math.round(x)-1,Math.round(y)-1,3,3);ctx2.fillStyle='#7a4a2a';ctx2.fillRect(Math.round(x),Math.round(y)-1,1,1);
      if(k%2){ctx2.strokeStyle='#2a120a';ctx2.lineWidth=1;ctx2.beginPath();ctx2.moveTo(Math.round(x),Math.round(y));ctx2.lineTo(Math.round(x+Math.sin(t*2+k*3+i)*6),Math.round(y+5+k));ctx2.stroke();}}
    if(fl){ctx2.fillStyle='#120806';ctx2.beginPath();ctx2.ellipse(Math.round(ax),Math.round(ay),7,3,0,0,6.283);ctx2.fill();ctx2.fillStyle='#3a1a10';ctx2.fillRect(Math.round(ax)-5,Math.round(ay)-1,3,1);ctx2.fillRect(Math.round(ax)+2,Math.round(ay),3,1);}
    ctx2.fillStyle='#7a0c08';ctx2.fillRect(Math.round(bx)-2,Math.round(by)-1,5,3);const dr=(t*1.4+i*.37)%1;ctx2.fillStyle='#8a0e0a';ctx2.fillRect(Math.round(bx),Math.round(by)+2+Math.round(dr*14),1,2);});
  ctx2.fillStyle='rgba(70,6,4,.55)';ctx2.beginPath();ctx2.ellipse(Math.round(px),Math.round(py)+2,13,4,0,0,6.283);ctx2.fill();
  ctx2.lineWidth=1;
  // how awake it is
  const f=d.fear||0,W=Math.min(160,VW-40),X0=Math.round((VW-W)/2),Y0=VH-74;ctx2.fillStyle='rgba(10,4,4,.7)';ctx2.fillRect(X0-2,Y0-2,W+4,9);ctx2.fillStyle=`rgb(${120+Math.round(f*120)},20,16)`;ctx2.fillRect(X0,Y0,Math.round(W*f),5);
  ctx2.font='10px monospace';ctx2.textAlign='center';ctx2.fillStyle='#e8d0c0';ctx2.fillText(f>.75?'IT IS WAKING':'It is asleep. For now.',VW/2,Y0+18);ctx2.textAlign='left';
  if(f>.3){const g=ctx2.createRadialGradient(VW/2,VH/2,VH*.25,VW/2,VH/2,VH*.75);g.addColorStop(0,'rgba(80,0,0,0)');g.addColorStop(1,`rgba(80,0,0,${(f-.3)*.7})`);ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);}
  if(d.flash>0){ctx2.fillStyle=`rgba(200,20,10,${Math.min(.55,d.flash*.5)})`;ctx2.fillRect(0,0,VW,VH);}};}
// talking to her while she's bound
{const _t=talk;talk=function(n){_t(n);const d=DK();if(!n||!n.def||n.def.id!==dkTaken()||S.room!=='undercroft'||!$('talkLine'))return;
  $('talkLine').innerHTML=`<q>${['You came. You actually came. Nobody comes. The roots. Please. It wakes up a bit more every time I scream.','Don’t look at my arms. Look at me. Look at me and pull.','I could hear you above me. Walking around. I counted your steps.'][(d.roots||[]).filter(r=>r.hp<=0).length%3]}</q>`;};}
function dkFreed(){const d=DK();if(d.freed)return;const id=d.taken,nm=dkNm(id),dating=typeof romDating==='function'&&romDating(id);d.freed=1;d.freedDay=S.day;d.roots=null;d.fear=0;
  playScene(id,'Found',`She falls forward into you, and she is so cold, and so light, as if the roots had been drinking her.<br><br>
For a while neither of you says anything. You can feel her heart going, too fast, against your chest. ${dating?'She kisses you, hard, with her eyes open, as if to make sure you are real.':'She holds on to your coat with both fists.'}<br><br>
<q>They walked me through the church,</q> she says. <q>All of them. In their good clothes. Hale opened the floor and they sang while they put me down here. They sang so nicely.</q><br><br>
<q>It said I was the deposit. Something to hold until the drawing. So you’d come quietly.</q> She looks up at you. <q>I’m not letting go of you again. Not until it’s over. Whatever you do at that door, I’m standing next to you. Not behind you.</q><br><br>
Above you, the organ starts to play. Nobody is sitting at it.`,()=>{mindHit&&mindHit(-12);addFriend&&addFriend(id,300);addLore(`I found ${nm} under the church with roots grown into her, and I tore them out. She says she was the deposit. She won’t leave my side.`);
    if(typeof sgDone==='function'&&!sgDone('stay')){S.saga=S.saga||{done:{}};S.saga.done.stay=1;addLore(`${nm} will stand next to you at the Tithe House door, whatever you choose. Not behind you. Next to you.`);}
    if(typeof leaveRoom==='function')leaveRoom(true);
    setTimeout(()=>{const n=npcById(id);if(n){n.loc='follow';n.vis=true;n.x=P.x+.9;n.z=P.z+.7;}toast(`${nm} won’t let go of your hand. She’ll stay with you until dark.`,4);},1600);});}

// the drawing: if she's still under the church, her place in the pew is empty
{const _ps=playScene;playScene=function(id,title,html,done){if(typeof html==='string'&&dkTaken()&&html.includes('Caitlyn is the only one crying.'))html=html.replace('Caitlyn is the only one crying.',`Nobody is crying. ${dkNm(DK().taken)}’s place in the pew is empty, and somebody has laid a hymn book on it, open, face down, as if she just stepped out.`);return _ps.call(this,id,title,html,done);};}
// ---------- 8. the endings: who you saved, and who you didn't
{const _se=stEnding;stEnding=function(k){const E=ST_END[k],d=DK();const keep=E&&{end:E.end,epi:E.epi};const before=E?E.end:'';const r=_se.apply(this,arguments);
  try{if(E){const t=d.taken,tn=t&&dkNm(t),lost=t&&!d.freed,ex=d.exile&&npcById(d.exile)?npcById(d.exile).def.name:null;
    if(k==='door'){let add='';
      if(lost)add+=` Last but one out of the door, barefoot, with the ends of roots still knotted in her wrists, is ${tn}. She walks straight through the crowd to you and doesn’t say anything at all.`;
      if(ex)add+=` At first light ${ex} comes down out of the hill copse with an empty lantern, and the whole street goes out to meet them, and nobody can look them in the eye, and they don’t ask anybody to.`;
      add+=` Every bowl on every doorstep is empty and washed. Somebody has cut the red ribbons off every lamp post in town.${d.sac?` On your step, wrapped in a clean cloth: ${d.sac.short==='memory'?`nothing you can see. But that evening ${tn||'she'} laughs at something you say, and you remember the sound of it, all of it, all at once.`:`${d.sac.back||d.sac.short}.`}`:''} You saved them. All of them.`;
      E.end=(lost?before:E.end)+add;d.savedAll=1;}
    else if(lost)E.end=before+` You never found ${tn}. Some nights you hear her under the floor, very far down, saying your name like a question.`;}}catch(e){}
  if(keep)setTimeout(()=>Object.assign(E,keep),61000);return r;};}

// ---------- 9. the journal: what it has cost
{const _oj=openJournal;openJournal=function(){_oj.apply(this,arguments);const el=$('noteText');const sub=el&&el.querySelector('.jsub');if(!sub)return;const d=DK();const rows=[];
  if(d.sac)rows.push(`The Ward’s price: ${d.sac.what}.`);
  if(d.exile&&npcById(d.exile))rows.push(`In the woods: ${npcById(d.exile).def.name}.${S.st&&S.st.ending==='door'?' Home again.':''}`);
  if(d.taken){const nm=dkNm(d.taken);rows.push(d.freed?`${nm}: found under the church, and brought home.`:`${nm}: taken. ${d.clue.door||d.clue.floor||d.clue.whisper?'She is under the church. The crypt door is round the side.':'Start at her house.'}`);}
  if(d.ritual)rows.push(d.ritual>0?'Agnes’s drain knows the taste of you.':'You refused Agnes’s knife.');
  if(rows.length)sub.insertAdjacentHTML('afterend','<h4>What it has cost</h4>'+rows.map(x=>`<p>${x}</p>`).join(''));};}
// the exiled person, at night, at their camp
{const _t=talk;talk=function(n){_t(n);const d=DK();if(!n||!n.def||n.def.id!==d.exile||n.loc!=='woods'||!$('talkLine'))return;d.exT=(d.exT||0)+1;$('talkLine').innerHTML=`<q>${DK_EXILE_LINES[(d.exT-1)%DK_EXILE_LINES.length]}</q>`;if(d.exT===1){mindHit&&mindHit(4);addLore(`${n.def.name} is living in the hill copse. Something walks round their camp all night, counting.`);}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const d=DK();if(S.room||!d.exile||!isNight()||(S.st&&S.st.ending==='door'))return;const c=dkCamp();if(!onScreen(c.x,c.z,120))return;
  D.push({z:c.z+.4,mind:1,draw(){const X=Math.round(sx(c.x+.8)),Y=Math.round(sz(c.z+.4));ctx2.fillStyle='rgba(10,8,6,.4)';ctx2.fillRect(X-7,Y-1,15,3);ctx2.fillStyle='#3a2a1a';ctx2.fillRect(X-6,Y-2,13,2);
    const fl=Math.sin(t*14)*1.5;ctx2.fillStyle='#ff9a30';ctx2.fillRect(X-2,Y-6-Math.round(fl),5,4+Math.round(fl));ctx2.fillStyle='#ffd25a';ctx2.fillRect(X-1,Y-5,3,3);
    const g=ctx2.createRadialGradient(X,Y-4,0,X,Y-4,46);g.addColorStop(0,`rgba(255,150,60,${.22+Math.random()*.05})`);g.addColorStop(1,'rgba(255,120,40,0)');ctx2.fillStyle=g;ctx2.fillRect(X-46,Y-50,92,92);
    ctx2.fillStyle='#5a4a34';ctx2.fillRect(X-22,Y-1,12,3);ctx2.fillStyle='#7a6448';ctx2.fillRect(X-22,Y-2,12,1);}});};}
// old saves: nothing to do but make sure the state exists
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);DK();return r;};}
