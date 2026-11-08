/* ================= people: friendship, personality, gifts, heart events, the journal =================
   Lore in brief (revealed through hearts, finds and pages):
   Since 1871 Marrow Hollow has paid the Tall Man one person every October; in return nothing in the valley fails to grow.
   The town draws lots in the church, and Sheriff Dunn decides how they fall. Ruth Abernathy was taken in 1987, Mae's son Danny in 1999.
   Elias Marsh refused this year, so the Tithe falls to his blood. The thing in the corn is not a monster from outside:
   it is made of everyone it has taken. It wears the last one. If it takes you, you will be what walks next October. */
const FRIEND_MAX=1000;   // ten hearts
S.friend={};S.talkedToday={};S.gifted={};S.heartSeen={};S.lore=[];S.journal=[];
const GIFTS={turnip:'Turnip',pumpkin:'Pumpkin',corn:'Corn',mushroom:'Glowcap',fish:'Fish',egg:'Egg'};
const PEOPLE={
  mae:{voice:'warm',loves:['pumpkin','egg'],likes:['turnip','corn'],hates:['fish'],
    talk:[['Hey, farm kid. Shut the door, you’re letting the cold in. Did you eat? You didn’t eat.','I took first at the fair with Mom’s pumpkin bread. Nobody else entered. It still counts.',
            'Tobias, put that down. …Sorry. Little brothers.','Mom ran this store for thirty years. Two autumns ago she walked into the corn in her apron. So now it’s me.'],
          ['You have Elias’s hands. Big knuckles. He fixed our roof once and wouldn’t take a cent. He let me hold the nails.','I keep the porch light on all night. Mom did. I can’t make myself switch it off.',
           'If you ever hear me calling from the corn, it isn’t me. That’s the last thing Mom ever told me. I don’t go in the corn.'],
          ['You’re kind of a regular now. Don’t let it go to your head.','Some nights I sleep on Tobias’s floor. He thinks it’s silly. I let him think that.','I saved you the good bread. Don’t tell Pip.']],
    gift:{love:'Oh, you didn’t. You did. Okay, I’m making something with this, and you’re eating it.',like:'Huh. You were thinking about me. That’s… nice.',hate:'Oh. Oh, that smell. Thank you. Truly. Please take it back outside.',meh:'For me? You didn’t have to.'},
    events:[{h:2,title:'The photo behind the counter',text:`Caitlyn turns the little frame around so you can see it. A boy, nine or ten, gap-toothed, holding a fish too big for him.<br><br>
      <q>That’s Danny. My big brother. I was a baby when he went, so I only know him from this, and from Mom.</q><br><br>She puts it back face-down, the way it was. <q>Don’t mention him to Tobias. He doesn’t know. Mom never told him, and that’s a kindness I can still give.</q>`,lore:'Caitlyn had a big brother, Danny. She keeps his photo face-down so Tobias never asks.'},
      {h:4,title:'The lots',text:`<q>Every September the whole town goes to the church after dark. Hale reads the names and Dunn draws from the hat.</q> Her hands keep folding the same dish towel.<br><br>
      <q>Danny’s name came out in ’99. In Dunn’s handwriting. Mom told me that once, and never again. I’ve never said it out loud before. I don’t know why I’m telling you.</q>`,lore:'The town draws lots for the Tithe every September. In 1999 Danny Coyle’s name came out of the hat in the Sheriff’s handwriting.'},
      {h:6,title:'Walt’s lantern',text:`She presses a heavy brass lantern into your arms. It has been polished until the engraving is almost gone: <i>W. Coyle</i>.<br><br>
      <q>My dad’s. He carried it the night he went looking for Danny. I was eight months old. It burns brighter than that tin thing of yours. Take it.</q> Then, very quietly: <q>If it comes to it, don’t let them choose Tobias.</q>`,lore:'Walt Coyle, Caitlyn’s father, went into the corn looking for his son and did not come back. His lantern burns brighter than any other.',reward:'lantern'}]},
  hale:{voice:'grave',loves:['turnip'],likes:['corn','egg'],hates:['pumpkin'],
    talk:[['The bell rings at eight. When it does, be indoors. That is the whole of my sermon now.','I was a good preacher once. People cried. Now they just look at their shoes.',
            'Don’t bring gourds into my church. I will not explain that.'],
          ['Your grandfather and I played chess every Thursday for thirty years. He cheated. I let him.','There are names in the belfry I read to myself at night. I am the only one who remembers them all.',
           'Pray if it helps you. It hasn’t helped me, but I am not a reliable sample.'],
          ['You should hate me. Most days I do it for you.','When this is over, whichever way it ends, I would like to be forgiven. I do not expect it.']],
    gift:{love:'A plain turnip. Honest food. Thank you.',like:'Kind of you.',hate:'Take it away. Please. Its face.',meh:'I will put it to use.'},
    events:[{h:2,title:'Seventy-one bells',text:`Hale lets you climb into the belfry. The bell is green with age. Scratched into the beams around it are tally marks, dozens of groups of five.<br><br>
      <q>One for every October since 1871. I add the new one myself. My father did before me.</q> He counts under his breath and stops before he reaches the end.`,lore:'Pastor Hale cuts a tally mark into the belfry beam every October. The first marks date to 1871, the year the covered bridge was built.'},
      {h:4,title:'The ledger',text:`From under the altar cloth he takes a ledger bound in cracked leather. Every page is a year and a name. <i>1987: Ruth Abernathy, aged 8.</i> <i>1999: Daniel Coyle, aged 10.</i><br><br>
      The last line is fresh ink. <i>Elias Marsh</i> has been crossed out so hard the paper tore. Beneath it, in Elias’s own hand: <b>your name</b>.<br><br><q>He wrote that himself,</q> Hale says. <q>The night before he went into the corn. He thought it would change the rules. It did not.</q>`,lore:'The Ledger of the Tithe lists every name since 1871. Elias crossed out his own and wrote yours beneath it.'},
      {h:6,title:'The order of the stones',text:`<q>There is a way. Elias found it and could not finish it.</q> Hale’s voice is barely there.<br><br>
      <q>The three stones are the three times it was cheated: in the woods where it was born, in the corn where it feeds, and in my yard where it is buried. Light them, and it burns. And this valley goes back to being what it should have been in 1871. Stone. Weeds. Graves.</q><br><br><q>I will ring the bell for you, if you do it. Loudly.</q>`,lore:'The three stones mark where the Tall Man was born, where it feeds, and where it is buried. Burning it would end the harvests forever.'}]},
  tobias:{voice:'kid',loves:['mushroom'],likes:['egg','fish'],hates:['turnip'],
    talk:[['Did you know a spider can eat its own web? I watched one do it. It took like an hour.','Mom says I can’t go past the road. I go past the road.',
            'Do you have any glowcaps? They glow. That’s why they’re called that.'],
          ['I’m drawing everybody in town. You can be in it. I’ll give you a cool hat.','There’s a girl who plays by the corn when it gets dark. She doesn’t talk but she’s okay.',
           'If you hear knocking at night you count it. If it’s three, don’t open. Everybody knows that.'],
          ['You’re my best friend. Don’t tell Mom, she thinks it’s her.','When I grow up I’m gonna fix the road so people can leave. It’s easy. You just drive faster.']],
    gift:{love:'WHOA. Is this a GLOWCAP? This is the best day of my whole life.',like:'Cool! Thanks!',hate:'Ugh, turnips taste like dirt that’s sad.',meh:'Okay! I’ll keep it in my box.'},
    events:[{h:2,title:'The drawing',text:`Tobias hands you a crayon drawing. The whole town is there, little round heads in a row. Behind them, taller than the church, is a black stick figure with an orange circle for a head.<br><br>
      Under the orange circle he has drawn a second face, small and careful, in pencil. It is unmistakably yours.<br><br><q>That’s just how it looks,</q> he says, like it’s obvious.`,lore:'Tobias draws the Tall Man with a second face under the pumpkin. He drew yours.'},
      {h:4,title:'The girl by the corn',text:`<q>Her name’s Ruth. She told me, kind of. She writes it in the dirt.</q> Tobias digs his shoe into the ground.<br><br>
      <q>She says she’s not scared of the tall man anymore because she’s already inside it. I don’t get it. She says I will.</q>`,lore:'Ruth Abernathy writes her name in the dirt for Tobias. She says she is already inside the Tall Man.'},
      {h:6,title:'Danny’s slingshot',text:`He gives you a slingshot with <i>D.C.</i> carved in the handle. <q>I found it in Mom’s closet. In a box with my name on it except it isn’t my name.</q><br><br>
      <q>I think I had a brother. I think everybody knows except me.</q> He doesn’t cry. He looks at the corn.`,lore:'Tobias found Danny’s slingshot in a box in his mother’s old closet. He has worked out that he had a brother.'}]},
  hollis:{voice:'gruff',loves:['fish'],likes:['pumpkin','corn'],hates:['mushroom'],
    talk:[['Yep.','Car’s a wreck. I can make it a slightly better wreck. Bring parts.','Don’t eat the glowing mushrooms. Don’t ask me how I know.'],
          ['Route 9 goes in a circle. Not like a road. Like a thought you can’t stop having.','I’ve rebuilt that same Buick four times. Every time somebody new drives in, I think, maybe this one.',
           'Your grandpa was the only man here who never asked me to fix anything. Respected that.'],
          ['Fishing’s the only time it’s quiet in my head.','If you make it out, send a postcard. Nobody ever has. I’d frame it.']],
    gift:{love:'Huh. Nice fish. Real nice. ...Thanks.',like:'Appreciate it.',hate:'Get that fungus out of my shop.',meh:'Mm.'},
    events:[{h:2,title:'The loop',text:`<q>Summer of ’87 I put the Abernathy girl in my truck and drove west till the gas ran out.</q> He wipes the same clean wrench for a long time.<br><br>
      <q>Ran out right in front of Elias’s farm sign. Fourteen hours driving and I was a mile from home. She got out and walked to the corn like she’d been called. I sat in that truck till dawn.</q>`,lore:'In 1987 Hollis tried to drive Ruth Abernathy out of the valley. The road brought them back to the farm.'},
      {h:4,title:'The wall',text:`Behind the garage’s back door is a wall of road maps, every exit circled in red and crossed out in black. Dozens of years of them.<br><br>
      One map is new. Your car’s make and plate are written in the margin. Next to it: <i>maybe this one</i>. It is in your handwriting.<br><br><q>Found it on my bench this morning,</q> Hollis says. <q>Thought you left it.</q>`,lore:'Hollis keeps a wall of failed escape routes. A new one is written in your handwriting. You don’t remember writing it.'},
      {h:6,title:'What the road wants',text:`<q>Figured it out, I think.</q> He doesn’t look at you. <q>The road isn’t keeping people in. It’s keeping the count right. Somebody leaves, somebody’s got to come in.</q><br><br>
      <q>You came in. That’s why the car crashed where it did.</q> He slides a box of tools across the bench. <q>Upgrades are on me from now on. Least I can do.</q>`,lore:'Hollis believes the road keeps the count right: for someone to leave, someone must come in. Your crash was the valley paying itself back.',reward:'tools'}]},
  agnes:{voice:'sharp',loves:['egg'],likes:['turnip','fish'],hates:['pumpkin','corn'],
    talk:[['What. Oh. It’s you. You have his chin. I never liked his chin.','Wipe your feet. On the outside of the house. Over there. Further.',
            'Whiskers is a better judge of character than any person in this town. She hissed at the Sheriff. Good girl.'],
          ['I knit when I can’t sleep. I have knit a great many scarves.','Your grandfather owed me something he could never pay. He knew it. He brought me eggs every Sunday for thirty-seven years anyway.',
           'Don’t say her name in front of me. I mean it kindly.'],
          ['You can call me Agnes. Not "Mrs. Abernathy". That woman had a daughter.','Come by for tea. I’ll pretend not to want you to.']],
    gift:{love:'Fresh eggs. Elias used to... well. Thank you. I mean that.',like:'Hmph. Acceptable.',hate:'Is this a joke? Get it off my step.',meh:'I suppose I’ll find a use.'},
    events:[{h:2,title:'Her birthday',text:`Agnes has set two cups out for tea. She pours into both and only drinks from one.<br><br>
      <q>She would be forty-six on Tuesday. Ruth. There, I said it. Elias promised me he’d get her out. Put her in Hollis’s truck himself. I watched them drive away and I was so happy I was sick in the yard.</q>`,lore:'Agnes still pours a second cup of tea for Ruth. Elias promised to get Ruth out of the valley in 1987.'},
      {h:4,title:'The music box',text:`She puts a small wooden music box in your hand. When you open it a tin song plays, slow and out of tune.<br><br>
      <q>It was hers. She comes closer when it plays. I don’t open it anymore. I couldn’t bear it if she stopped coming.</q>`,lore:'Ruth’s music box. When it plays, she comes closer.'},
      {h:6,title:'What walks in the corn',text:`<q>You think Ruth is the ghost in this story.</q> Agnes’s needles stop. <q>She isn’t. She’s what’s left over.</q><br><br>
      <q>That thing out there is made of all of them. Every one since 1871. It wears the newest like a coat until next year’s comes. I’ve seen it at my window wearing my daughter’s walk.</q><br><br>
      <q>If it takes you, it will wear you next October. It will walk up to some other grandchild with your face. Don’t let it.</q>`,lore:'The Tall Man is made of everyone it has taken. It wears the newest one until the next. If it takes you, you will be what walks next October.'}]},
  dunn:{voice:'jovial',loves:['pumpkin'],likes:['fish','corn'],hates:['egg'],
    talk:[['Well, howdy! Nice to have new blood in town. Figure of speech.','Keep your nose clean, stay off the highway after dark, and we’ll get along fine.',
            'I’m the law here. Such as it is. Mostly I find cats.'],
          ['Elias and I didn’t see eye to eye. Man had principles. Principles get expensive in a small town.','Lot of folks wanted to leave over the years. Road’s funny about that. I just do the paperwork.',
           'You’re looking peaky. Sleeping all right? Nobody sleeps all right in October.'],
          ['I like you, kid. That’s a problem for me.','You ever wonder if the people doing the bad thing know it? I know it. I just do it anyway.']],
    gift:{love:'Now that’s a pumpkin! You trying to bribe an officer? It’s working.',like:'Much obliged.',hate:'Eggs make me think of things. Take it back.',meh:'Well, thank you kindly.'},
    events:[{h:2,title:'A friendly warning',text:`Dunn walks you to the edge of the square with one big hand on your shoulder. Friendly. Heavy.<br><br>
      <q>Folks here are scared, kid. Scared people do math. One stranger versus everybody’s kids? I’m not saying it’s right. I’m saying it’s math.</q> He squeezes once and lets go.`,lore:'Sheriff Dunn warned you: to the town, you are arithmetic.'},
      {h:4,title:'The hat',text:`He is drunk on the bench outside the store, and he doesn’t sound jovial at all.<br><br>
      <q>The lots aren’t random. Never have been. Sheriff writes every slip the same name. My daddy did it, his daddy did it. You pick someone who won’t be missed.</q><br><br><q>This year I wrote your name sixty-one times. I’m sorry. That’s the most I’ve said that in my life.</q>`,lore:'The lots have never been random. The Sheriff writes every slip with the same name. This year it was yours.'},
      {h:6,title:'Run',text:`He presses a set of spark plugs into your hand, still in the box. <q>From my cruiser. Hollis’ll know what to do.</q><br><br>
      <q>Bridge is the line. If you’re across it before the bell, it can’t follow you that night. Don’t ask me how I know. Run, kid.</q>`,lore:'The covered bridge is a line the Tall Man cannot cross the night the bell rings.',reward:'part'}]},
};
// discoveries in the world: a glint you can examine
const FINDS=[
  {id:'tally',x:13.6,z:-9.4,title:'Scratches in the barn door',text:'Deep scratches in the barn door frame, groups of five. Grandpa counted something here every year. The last group has only four marks.',need:()=>true},
  {id:'shoe',x:wellPos.x+.2,z:wellPos.z+1.4,title:'A shoe in the well bucket',text:'The bucket comes up with a child’s sneaker in it, laces still tied. Written inside the tongue in marker: <i>DANNY C.</i> It is dry. The bucket was full of water.',need:()=>true},
  {id:'beam',x:BRIDGE.x+2.4,z:BRIDGE.z+.3,title:'Names in the bridge beam',text:'Carved into the beam of the covered bridge: <i>R.A. 1987</i>. <i>D.C. 1999</i>. Dozens more, worn smooth. The newest letters are pale and fresh: your initials. The knife marks are still sticky with sap.',need:()=>S.day>=2},
  {id:'graves',x:58.2,z:-37.4,title:'The empty graves',text:'Every stone in this row has a name and a year, one for each October. The earth in front of them has never been dug. There is nobody under any of them.',need:()=>true},
  {id:'coat',x:6.4,z:3.6,title:'The scarecrow’s coat',text:'You turn back the scarecrow’s collar. A name has been stitched inside the coat in neat, careful thread. It is yours. The thread is the same color as your hair.',need:()=>S.day>=2},
  {id:'map',x:-36,z:-9.6,title:'A map on the garage door',text:'A road map taped to the garage door, every way out of the valley crossed through in black. Pinned to it with a nail, a polaroid of your crashed car, taken from above. Nobody has a ladder that tall.',need:()=>true},
];
function friend(id){return S.friend[id]||0;}
function hearts(id){return Math.floor(friend(id)/100);}
function addFriend(id,n){const before=hearts(id);S.friend[id]=clamp(friend(id)+n,0,FRIEND_MAX);const after=hearts(id);if(after>before)toast(`${(npcById(id)||{def:{name:id}}).def.name} ♥ ${after}`,1.8);}
function heartStr(id){const h=hearts(id);return '♥'.repeat(h)+'♡'.repeat(6-h);}
function addLore(text){if(!S.lore.includes(text)){S.lore.push(text);toast('Journal updated.',1.6);}}
function journalNote(text){S.journal.push({day:S.day,text});}
// ---------- talking: personality first, quests still take priority
let lastQuestLine=null;
const _questLine=questLine;questLine=function(n){const r=_questLine(n);lastQuestLine=r;return r;};
const GASLIGHT={mae:['Elias! You’re back early. Did you find the boy?','We’ve never met. I’d remember a face like that. Wouldn’t I?','You already bought that. You bought it yesterday. You stood right there and cried.'],
  hale:['You rang the bell yourself last night. Don’t you remember? You rang it and rang it.','I buried you in the spring. I read the words. I am so tired, child.','Which one are you today?'],
  tobias:['Why do you keep coming back? You came back yesterday and yesterday and yesterday.','Ruth says you’re not really here yet. She says you’re early.','Your shadow’s on the wrong side.'],
  hollis:['You fixed that car already. Twice. You don’t remember either time.','Who’s that behind you? ...Never mind.','Stop writing on my maps.'],
  agnes:['Ruth? Ruth, is that you? No. No, you’re too tall.','You were at my window last night. Don’t lie. I saw your walk.','Wipe your feet. You’re tracking corn in. You’ve been in the corn.'],
  dunn:['Already wrote your name, kid. You signed it, too. Want to see?','Funny. I could swear I saw you over by the church just now. Standing very still.','You’re not on my list. Huh. You were yesterday.']};
function socialTalk(n){const id=n.def.id,P_=PEOPLE[id];if(!P_)return;const night=isNight();
  if(!S.talkedToday[id]){S.talkedToday[id]=1;addFriend(id,night?4:14);}
  // heart event?
  const ev=P_.events.find(e=>hearts(id)>=e.h&&!S.heartSeen[id+e.h]);
  if(ev&&!night&&!lastQuestLine){S.heartSeen[id+ev.h]=1;$('talk').hidden=true;
    openNote(`<h3>${n.def.name} — ${ev.title}</h3>${ev.text}`,'Remember this',()=>{addLore(ev.lore);journalNote(`${n.def.name}: ${ev.title}.`);socialReward(ev.reward);S.paused=false;});return;}
  let line=null;
  if(!lastQuestLine&&!night){const tier=Math.min(2,Math.floor(hearts(id)/2));const pool=P_.talk[tier];line=pool[(S.day*3+(S.talked[id]||0))%pool.length];}
  if(tierOf(M.v)>=2&&rand()<(tierOf(M.v)>=3?.5:.28)){line=pick(GASLIGHT[id]);}
  if(line)$('talkLine').innerHTML=`<q>${line}</q>`;
  $('talkRole').innerHTML=`${night?'Standing in the dark, facing your farm':n.def.role} <span class="hearts">${heartStr(id)}</span>`;
  // gift button
  let gb=$('talkGift');if(!gb){gb=document.createElement('button');gb.id='talkGift';gb.className='close';gb.textContent='Give';$('talkClose').after(gb);gb.addEventListener('click',()=>openGift(talkingTo));}
  gb.hidden=night||!S.basket.length||S.gifted[id]===S.day;}
const _talk=talk;talk=function(n){lastQuestLine=null;_talk(n);socialTalk(n);};
function openGift(n){if(!n)return;const id=n.def.id,P_=PEOPLE[id];const kinds=[...new Set(S.basket.map(b=>b.kind))];
  $('talkLine').innerHTML='<span class="sub">What will you give?</span>';const acts=$('talk').querySelector('.acts');const row=document.createElement('div');row.className='giftrow';
  for(const k of kinds){const b=document.createElement('button');b.className='buy';b.textContent=`${GIFTS[k]||k} ×${basketCount(k)}`;b.addEventListener('click',()=>{takeBasket(k,1);S.gifted[id]=S.day;
      const r=P_.loves.includes(k)?'love':P_.likes.includes(k)?'like':P_.hates.includes(k)?'hate':'meh';addFriend(id,{love:80,like:45,hate:-30,meh:20}[r]);SFX[r==='hate'?'deny':'coin']();
      $('talkLine').innerHTML=`<q>${P_.gift[r]}</q>`;row.remove();$('talkGift').hidden=true;updateHud();});row.appendChild(b);}
  acts.before(row);}
function socialReward(r){if(r==='lantern'){S.flashlight=true;toast('Walt’s lantern: your light reaches further now.',3);}
  if(r==='tools'){S.freeUpgrades=true;toast('Hollis will upgrade your tools for free.',3);}
  if(r==='part'){const miss=Object.keys(S.parts).find(k=>!S.parts[k]);if(miss){S.parts[miss]=1;toast('A car part, from the Sheriff’s own cruiser.',3);}}}
// ---------- discoveries
const finds=FINDS.map(f=>Object.assign({},f));
for(const f of finds)interact.push({x:f.x,z:f.z,r:1.3,on:()=>!S.lore.includes(f.title+'|')&&f.need(),label:()=>'Look',ok:()=>true,
  act(){S.lore.push(f.title+'|');openNote(`<h3>${f.title}</h3><p>${f.text}</p>`,'Remember this',()=>{addLore(f.text.replace(/<[^>]+>/g,''));journalNote(f.title+'.');mindHit(4);S.paused=false;});}});
function findsDraw(t){for(const f of finds){if(S.lore.includes(f.title+'|')||!f.need())continue;if(!onScreen(f.x,f.z,40))continue;const k=(Math.sin(t*3+f.x)+1)/2;if(k<.5)continue;
    const X=Math.round(sx(f.x)),Y=Math.round(sz(f.z))-12-Math.round(k*3);ctx2.fillStyle=`rgba(255,245,200,${(k-.5)*1.6})`;ctx2.fillRect(X,Y-2,1,5);ctx2.fillRect(X-2,Y,5,1);}}
// ---------- the journal
// a gift's name, whether it's farm produce or something from the bag (iron bars, stew, hollow-glass)
function giftName(k){return GIFTS[k]||(typeof itemInfo==='function'&&(itemInfo('I:'+k)||{}).name)||(typeof PRODUCE_NAMES!=='undefined'&&PRODUCE_NAMES[k])||String(k).replace(/_/g,' ');}
function openJournal(){S.paused=true;const T=tierOf(M.v);
  const corrupt=s=>T<2?s:s.split(' ').map(w=>hash(w.length*13,S.day+w.charCodeAt(0))>(T>=3?.86:.94)?pick(['it','is','inside','behind you','YOU','wake up','corn','31']):w).join(' ');
  let h=`<h3>Journal</h3><p class="jsub">Day ${T>=3&&rand()<.4?31:S.day}. ${S.pages.length}/6 of Grandpa’s pages.</p>`;
  h+='<h4>People</h4>';for(const n of npcs){const id=n.def.id;if(!PEOPLE[id])continue;h+=`<div class="jrow"><b>${n.def.name}</b> <span class="hearts">${heartStr(id)}</span><br><span class="jsub">${corrupt(n.def.role)}. Loves ${PEOPLE[id].loves.map(giftName).join(', ')}.</span></div>`;}
  const lore=S.lore.filter(l=>!l.endsWith('|'));h+='<h4>What you know</h4>'+(lore.length?lore.map(l=>`<p>• ${corrupt(l)}</p>`).join(''):'<p class="jsub">Nothing yet. Ask around. Look closer.</p>');
  if(S.pages.length){h+='<h4>Grandpa’s pages</h4>'+S.pages.map(i=>`<p>• <i>${PAGES[i].date}</i> — ${corrupt(PAGES[i].text.slice(0,90))}…</p>`).join('');}
  if(T>=3)h+=`<p class="jsub" style="color:#b33">${pick(['You did not write this page.','There is a page here in your handwriting. It just says: STOP COUNTING.','Someone has drawn a tall figure in the margin of every page.'])}</p>`;
  openNote(h,'Close',()=>{S.paused=false;});}
{const b=document.createElement('button');b.className='btn';b.id='btnJournal';b.textContent='Journal';b.addEventListener('click',()=>{if(S.mode==='play'&&!S.paused)openJournal();});$('buttons').prepend(b);
 const st=document.createElement('style');st.textContent=`.hearts{color:#e0605a;letter-spacing:1px;font-size:.92em;margin-left:6px}.giftrow{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}
  #noteText h3{margin:.1em 0 .5em;font-size:1.15em}#noteText h4{margin:.9em 0 .3em;font-size:.95em;opacity:.8;text-transform:uppercase;letter-spacing:.06em}.jrow{margin:.35em 0}.jsub{opacity:.7;font-size:.9em}
  #btnJournal{position:fixed;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 96px)}`;document.head.appendChild(st);}
// new day resets daily social flags
const _newDay2=newDay;newDay=function(msg,pos){S.talkedToday={};_newDay2(msg,pos);};
