/* ================= the story plan, W4 part one (docs/STORY_PLAN.md 1.4 and 3): the rest of the story stops knowing things for you.
   After leads.js (Chapter One), every later turn of the story comes from something you noticed or someone told you:
   - each story beat whose goal used to state a fact nobody had given you ("Maud's quarry men walked off", "Dunn keeps the
     drawing list", "Silas has been digging since dawn"...) now waits as a question until someone in town tells you, in their
     own words; then the goal says who told you and the arrow can point there;
   - Chapter Two's five places are no longer a checklist with the next one named: people tell you about them one at a time;
   - the first letter in your handwriting no longer lists where the three stones are; people who remember tell you;
   - beats you notice yourself (the scarecrow turned to face your cabin, lights in the church at night) keep their words.
   Saves from before leads.js keep the old guidance (S.knOld). ================= */
// beat id: [who can tell you ('any' or ids), the goal before anyone has, what they say (n = their name), what you know after]
const LD2_ASK={
  mill:['any','Somebody keeps the valley’s accounts. Somebody in town would know who.',
    n=>`“The mill,” says ${n}. “Abel Fenn’s family has kept the valley’s books since before there was a store.”`,'the old mill down Mill Road kept the valley’s accounts. Find its ledger.'],
  quarry:['any','Nobody has seen Maud Thorne’s men in town all week. Somebody will know why.',
    n=>`“Maud’s men walked off the quarry job last week,” says ${n}. “Won’t say why. Won’t go back.”`,'Maud’s quarry men walked off the job last week and won’t say why. The quarry is out along the Old County Road.'],
  orchard:['any','The Quills haven’t been at the Saturday market. Somebody will know why.',
    n=>`“The Quills haven’t picked their orchard this year,” says ${n}. “Orla won’t say a word about it.”`,'the Quills haven’t picked their orchard this year. It’s east of the crossroads, down Mill Road.'],
  crypt:['any','Something is going on at the church after dark. Somebody will have seen it.',
    n=>`“Hale keeps the cellar under the church chained,” says ${n}, quietly. “Last night it was standing open.”`,'the cellar door on the side of the church, the one Hale keeps chained, was open last night. Go after dark.'],
  ferry:['any','Grandpa went somewhere every autumn. Somebody in Wickham would know where.',
    n=>`“Elias crossed on Nan’s ferry every autumn,” says ${n}. “Ask her what it costs.”`,'Grandpa crossed on Nan Pike’s ferry every autumn. Ask her what it costs (the landing is south of Wickham).'],
  birches:['any','Somebody in the valley keeps drawing something. Ask around.',
    n=>`“Bram keeps drawing a white wood full of little hanging shapes,” says ${n}. “Up past the motel, north-west.”`,'Bram keeps drawing a white wood full of little hanging shapes, north-west, up the path from the motel.'],
  greyfield:['any','The valley’s old records have to be somewhere. Somebody will know where.',
    n=>`“The old records? Some went out to Greyfield,” says ${n}. “The children’s home. Shut in ’51. Off Route 9 West.”`,'some of the valley’s old records are out at Greyfield, the old children’s home off Route 9 West. Find out why it shut.'],
  cold:['any','Somebody saw smoke out by the Black Lake. Ask around.',
    n=>`“Somebody’s opened the old cold house by the Black Lake,” says ${n}. “Nobody’s opened it since Ruth.”`,'somebody has opened the old cold house by the Black Lake. Nobody had opened it since Ruth.'],
  oldmarrow:['any','There was a Marrow Hollow before this one. Somebody will know where.',
    n=>`“The first Marrow Hollow burned in 1872,” says ${n}. “Up the old road north of the graveyard. Only the chapel’s left.”`,'the first Marrow Hollow burned in 1872, up the old road north of the graveyard. Go to its chapel.'],
  fen:['any','Grandpa’s diary says the river gives things back. Somebody will know where.',
    n=>`“The river always gives back what it’s given,” says ${n}. “Where it gives out, in the fen, south-west.”`,'the river gives back what it’s given, where it runs out in the fen, south-west.'],
  lookout:['any','From somewhere high you could see the whole valley. Somebody will know where.',
    n=>`“The fire tower on Pine Ridge,” says ${n}. “Up Lookout Road, past the quarry. You can see everything from there.”`,'from the fire tower on Pine Ridge you can see the whole valley. Up Lookout Road, past the quarry. Climb it.'],
  drowned:['any','People in Wickham go quiet about the reservoir. Somebody will tell you why.',
    n=>`“They drowned Old Wickham under the reservoir in ’31,” says ${n}. “Its church bell still rings after dark.”`,'Old Wickham’s church bell still rings under the reservoir after dark. Go out on the reservoir dock tonight.'],
  list:['any','Somebody writes the names in the hat. Somebody will know who.',
    n=>`“Sheriff Dunn keeps the drawing list at his house,” says ${n}. “He’ll lock it away before the drawing.”`,'Dunn keeps the drawing list at his house. See it before he locks it away.'],
  yourgrave:['any','Somebody has been digging since first light. You can hear it from town.',
    n=>`“That’s Silas,” says ${n}. “Digging since dawn. He won’t say whose.”`,'Silas has been digging since dawn and won’t say whose grave it is. The graveyard is behind the church.'],
  jars:[['ida'],'Ida Hale wanted a word with you. She bakes in the square most mornings.',
    ()=>`“Come over for jam,” Ida says. “I’ve something of yours.”`,'Ida Hale asked me over for jam. She says she has something of mine.'],
  corn:['any','Something has changed out in the Deep Corn. Somebody will have seen it.',
    n=>`“Something’s been put up in the middle of Harlan’s corn,” says ${n}. “South of the river. Nobody’s going in after it.”`,'something has been put up in the middle of Harlan’s corn, south of the river. Find your way through the maze to it.']};
// Chapter Two's places: told one at a time, by whoever you ask
const LD2_PLACE={
  wick:n=>`“Go and read Wickham’s noticeboard,” says ${n}. “Every year the same notice. Read the date on this one.”`,
  marsh:n=>`“There’s a house down Mill Road just like yours,” says ${n}. “The Marsh place. Same porch. Same crack in the window.”`,
  tithe:n=>`“At the end of Mill Road there’s a little house with no windows,” says ${n}. “Don’t go in. Nobody goes in.”`,
  tree:n=>`“There’s a dead tree in the Hollow Woods split down the middle,” says ${n}. “Kids won’t go near it.”`,
  lake:n=>`“There’s a cord tied under the last plank of the Black Lake dock,” says ${n}. “Been pulled tight as long as I remember.”`};
// the three stones: the people who remember where each went
// the three stones: the people who remember where each went (the first named says it best; the others in case they're away)
const LD2_STONE={dock:[['otto','corwin','nan'],(n,id)=>id==='otto'?`Otto looks at the lake for a long time. “There’s a cord under my dock that’s been pulled tight for thirty years. You’ll want a stronger rod than that.”`:`“There’s a cord under the Black Lake dock that’s been pulled tight for thirty years,” says ${n}. “Otto sells a rod that might hook it.”`,'the cord under the Black Lake dock (Otto’s ash rod would hook it)'],
  tree:[['bram','orla','moss'],(n,id)=>id==='bram'?`“There’s a tree in the Hollow Woods that only lights up inside at noon,” Bram says. “Something’s down in it. You’d need a proper axe.”`:`“There’s a split tree in the Hollow Woods,” says ${n}. “At noon the sun goes right down inside it. Something’s in there.”`,'the split tree in the Hollow Woods, at noon (a steel axe)'],
  bed:[['agnes','mae','hale'],(n,id)=>id==='agnes'?`“Elias always said the safest place for anything is under your own bed,” Agnes says. “He said it like a joke. He never joked.”`:`“Elias used to say the safest place for anything is under your own bed,” says ${n}. “He never said it like a joke.”`,'under my own bed (a steel pickaxe for the boards)']};
S.leads2=S.leads2||{};
const ld2Has=k=>!!(S.leads2&&S.leads2[k]);
const ld2Beat=t=>{try{return SAGA.find(b=>!sgDone(b.id)&&LD2_ASK[b.id]&&sgVal(b.name)===t)||null;}catch(e){return null;}};
// a teller who isn't in the valley (gone, or not here at all) hands the telling on: if none of a beat's tellers are here, anyone tells
const ld2Here=id=>{try{const n=npcById(id);return !!(n&&!n.gone&&!n.dead);}catch(e){return false;}};
const ld2Tells=(list,id)=>list==='any'||list.includes(id)||!list.some(ld2Here);
const ld2Places=()=>{try{return ST_PLACES.filter(p=>!S.st.seen[p.k]);}catch(e){return [];}};
const ld2Stones=()=>{try{return ['dock','tree','bed'].filter(k=>!S.st.got[k]);}catch(e){return [];}};
let LD2_IN=false;const ld2Base=()=>{LD2_IN=true;try{return objective();}finally{LD2_IN=false;}};

// ---- the first letter in your handwriting no longer says where the stones are
try{ST_LETTERS.first='Don’t be scared of the handwriting. It’s yours. I’m you, a little later.<br><br>The three stones that held the Tithe House door shut were moved, years ago, so it would open. You’ll find them. You always do. Ask the ones who remember.<br><br>Put them back on the doorstep before the drawing. I didn’t, last time.';}catch(e){}
{const _ad=addLore;addLore=function(t){if(typeof t==='string'&&t.startsWith('A letter in my handwriting: the three stones are under the dock'))t='A letter in my handwriting: the three stones that held the Tithe House door were moved. Find them and put them back on the step.';return _ad.apply(this,arguments.length>1?[t,...[].slice.call(arguments,1)]:[t]);};}

// ---- the goal bar
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);if(LD2_IN)return r;try{return ld2Goal(r);}catch(e){return r;}};}
function ld2Goal(r){if(!r||!Array.isArray(r)||typeof ldOld!=='function'||ldOld())return r;const t=r[0];
  const b=ld2Beat(t);if(b){if(!ld2Has('beat_'+b.id))return [t,LD2_ASK[b.id][1],null];const x=S.leads2['beat_'+b.id];return [t,`${x.n} said ${LD2_ASK[b.id][3]}`,r[2]];}
  if(t==='The Tithe'){const left=ld2Places();if(left.length){const told=left.filter(p=>ld2Has('place_'+p.k));
      if(!told.length)return [t,'Nobody will say what the Tithe is. Ask people what they’ve seen, and where.'+(/Ward/.test(r[1])?' '+(r[1].match(/Ward \d+\/\d+/)||[''])[0]+'.':''),null];
      const p=told.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];const x=S.leads2['place_'+p.k];
      return [t,`${x.n} told me about ${p.name}.`,{x:p.x,z:p.z}];}}
  if(t==='Three stones'&&/One is /.test(r[1])){const miss=ld2Stones();const told=miss.filter(k=>ld2Has('stone_'+k));const n=3-miss.length;
    if(!told.length)return [t,`Bring back what held the door. ${n}/3 found. Ask the ones who remember where they went.`,null];
    const k=told[0],need=r[1].match(/ You need [^.]*\.(?: [^.]*\.)?/);return [t,`Bring back what held the door. ${n}/3 found. One is ${LD2_STONE[k][2]}.${need?need[0]:''}`,r[2]];}
  return r;}

// ---- asking
let LD2_CALM=null;
{const _t=talk;talk=function(n){LD2_CALM=null;const r=_t.apply(this,arguments);try{ld2OnTalk(n);}catch(e){console.warn('leads2',e);}
  try{const l=$('talkLine');if(l&&l.querySelector('.ldsay'))LD2_CALM=n;}catch(e){}return r;};}
// the late-story "wrong" face (portraits.js) reads as a glitch when it lands on someone telling you where to go: keep it off then
if(typeof emotionOf==='function'){const _e=emotionOf;emotionOf=function(){const e=_e.apply(this,arguments);try{if(e==='wrong'&&LD2_CALM&&typeof talkWho!=='undefined'&&LD2_CALM===talkWho)return 'neutral';}catch(x){}return e;};}
function ld2OnTalk(n){if(typeof ldOld!=='function'||ldOld()||!n||!n.def||isNight())return;const box=$('talk'),line=$('talkLine');if(!box||box.hidden||!line)return;
  const id=n.def.id,nm=typeof ldName==='function'?ldName(n):n.def.name.split(' ')[0];let base;try{base=ld2Base();}catch(e){return;}if(!base)return;const t=base[0];
  const say=(k,txt,tell)=>{S.leads2[k]={d:S.day,n:nm};line.insertAdjacentHTML('beforeend',`<br><span class="ldsay">${txt}</span>`);if(tell)ldTell(tell);SFX.page&&SFX.page();};
  const b=ld2Beat(t);if(b&&!ld2Has('beat_'+b.id)){if(!ld2Tells(LD2_ASK[b.id][0],id))return;let at=null;try{at=b.npc?npcById(typeof b.npc==='function'?b.npc():b.npc):(b.at&&b.at());}catch(e){}
    say('beat_'+b.id,LD2_ASK[b.id][2](nm),at);return;}
  if(t==='The Tithe'){const left=ld2Places().filter(p=>!ld2Has('place_'+p.k));if(left.length){const p=left[0];say('place_'+p.k,LD2_PLACE[p.k](nm),{x:p.x,z:p.z});}return;}
  if(t==='Three stones'){const k=ld2Stones().find(k=>!ld2Has('stone_'+k)&&ld2Tells(LD2_STONE[k][0],id));if(k){const at={dock:()=>({x:LAKE.x,z:LAKE.z-LAKE.rz+2.6}),tree:()=>HOLLOW_TREE,bed:()=>doorPos}[k];let pt=null;try{pt=at();}catch(e){}say('stone_'+k,LD2_STONE[k][1](nm,id),pt);}}}

// ---- the Leads tab: what people told you after Chapter One
// the open question (nobody has told you yet) heads the Leads tab
function ld2Question(){try{if(typeof ldOld!=='function'||ldOld())return null;const base=ld2Base();if(!base||!base[0])return null;const t=base[0],b=ld2Beat(t);
  if(b)return ld2Has('beat_'+b.id)?null:[t,LD2_ASK[b.id][1]];
  if(t==='The Tithe'){const left=ld2Places();return left.length&&!left.some(p=>ld2Has('place_'+p.k))?[t,'Nobody will say what the Tithe is. Ask people what they’ve seen, and where.']:null;}
  if(t==='Three stones'&&/One is /.test(base[1]))return ld2Stones().some(k=>ld2Has('stone_'+k))?null:[t,'Bring back what held the door. Ask the ones who remember where the stones went.'];}catch(e){}return null;}
if(typeof leadsHtml==='function'){const _lh=leadsHtml;leadsHtml=function(){let h=_lh.apply(this,arguments);try{const rows=[],fin=[];
    for(const [k,x] of Object.entries(S.leads2||{})){const [kind,id]=k.split(/_(.+)/);let txt='',done=false;
      if(kind==='beat'&&LD2_ASK[id]){txt=LD2_ASK[id][3];txt=txt[0].toUpperCase()+txt.slice(1);done=sgDone(id);}
      else if(kind==='place'){const p=(ST_PLACES||[]).find(q=>q.k===id);if(!p)continue;txt=p.name;done=!!(S.st&&S.st.seen[id]);}
      else if(kind==='stone'&&LD2_STONE[id]){txt='A stone: '+LD2_STONE[id][2]+'.';done=!!(S.st&&S.st.got[id]);}
      (done?fin:rows).push(`<p class="ldrow${done?' lddone':''}"><b>${x.n} said</b> ${txt}${done?' <span class="ldtick">✓</span>':''}</p>`);}
    const q=ld2Question();if(q){h=h.replace(/(<h4>To follow<\/h4>)(<p class="ldrow"><b>Now<\/b>[^]*?<\/p>|<p class="jsub">Nothing right now\.<\/p>)/,'$1');rows.push(`<p class="ldrow ldq"><b>${q[0]}</b> ${q[1]}</p>`);}
    if(rows.length)h=h.replace('<h4>To follow</h4>','<h4>To follow</h4>'+rows.reverse().join(''));
    if(fin.length)h=h.includes('<h4>Followed</h4>')?h.replace('<h4>Followed</h4>','<h4>Followed</h4>'+fin.reverse().join('')):h+'<h4>Followed</h4>'+fin.reverse().join('');}catch(e){}return h;};}
{const c=document.createElement('style');c.textContent='#noteText .ldq{font-style:italic}';document.head.appendChild(c);}
window.__leads2={has:ld2Has,goal:ld2Goal,question:ld2Question,here:ld2Here,calm:()=>LD2_CALM};
