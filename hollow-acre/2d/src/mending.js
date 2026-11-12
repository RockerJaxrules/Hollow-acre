/* ================= #229 mending Marrow Hollow, after the story. With the story over, the chains come off the town hall for the
   first time since the vote in 1952, and on the table inside is a ledger the town started and never dared fill in: MENDING.
   Seven jobs, each paid for in materials or coin, and each one changes the town for good: the dead street lamps lit, the
   tarps off the broken roofs, the boards off the Pell house and the chalk mark scrubbed away, the hall clock wound, the
   schoolroom's DAYS LEFT wiped, the blood scrubbed out of the ground, and last of all every curtain in town opened, so the
   houses glow at night instead of watching. =================================================================== */
const MEND=[
  {k:'lamps',name:'Relight the street lamps',need:{copper_bar:4,coal:12},
    say:'Hollis comes with a ladder and you go lamp to lamp along Main Street together. The last one catches, and for a second the whole street looks like a photograph of itself from before.',
    apply(){for(const L of lamps)L.dead=false;}},
  {k:'roofs',name:'Take the tarps down',need:{wood:90,stone:30},
    say:'New shingles on the Pell house, the inn’s kitchen yard and Grandpa’s barn. The tarps come down stiff and white with years of frost. Somebody burns them on the green and three people cheer.',
    apply(){for(const o of OBJ)if(o.spr==='tarp'||o.spr==='tarp_barn')o.hide=true;}},
  {k:'pell',name:'Unboard the Pell house',need:{wood:20},coins:250,
    say:'The boards come off with a sound like someone breathing out. You scrub the chalk ring off the door until it’s a pale smear. Inside it’s only a house: dust, a calendar, a child’s shoes by the stairs.',
    apply(){TOWN_DOORS.pell.day='The boards are off and the chalk mark is a pale smear. A woman you don’t know is airing the rooms out: the Pells’ grandniece, come back. “It’s only a house,” she says, surprised.';
      TOWN_DOORS.pell.night='A lamp in the front room, and a radio playing low. Nobody is counting.';}},
  {k:'clock',name:'Wind the hall clock',need:{copper_bar:2,iron_bar:2},
    say:'Up in the clock room the works are furred with dust and set at eight minutes to twelve. You oil them, and wind them, and push the long hand round. At noon the hall bell strikes twelve times, the right number, for the first time since the vote.',
    apply(){TOWN_DOORS.hall.day='The doors are open and the chain is coiled on the step. Above them the clock is right. On the notice board inside: TOWN MEETING ON THE QUESTION OF THE TITHE — ABOLISHED, and a hundred signatures.';
      TOWN_DOORS.hall.night='The hall windows are lit. Someone is practising the piano for the dance, badly, and laughing at themselves.';}},
  {k:'slate',name:'Wipe the schoolroom slate',need:{fiber:12},coins:80,
    say:'Cora Vance lets you do it. You rub out DAYS LEFT and every tally mark under it until your arm aches. She writes in its place, in her best hand: SPELLING TEST FRIDAY. Twenty children groan, and it is the best sound you have heard in this valley.',
    apply(){TOWN_DOORS.school.day='Through the window: twenty small desks and a clean blackboard. SPELLING TEST FRIDAY. Somebody has drawn a cat in the corner, and nobody has rubbed it out.';
      TOWN_DOORS.school.night='The schoolroom is dark and quiet, the ordinary kind of quiet.';}},
  {k:'blood',name:'Scrub out the blood',need:{stone:20,coal:6},
    say:'Lye and grit and a stiff brush, on your knees, everywhere the Hollow ever left something. Agnes brings you tea and doesn’t say anything. When you’re done the ground is only ground.',
    apply(){try{if(S.gore){for(const k of S.gore.kills||[])goreKillHide(k.id);S.gore.kills=[];}GORE.dec.length=0;}catch(e){}}},
  {k:'curtains',name:'Open the curtains',coins:500,after:6,
    say:'You go house to house with the last of the money for paint and glass, and one by one they open their curtains, and leave them open. At dusk Marrow Hollow lights up like a town.',
    apply(){for(const h of (typeof HOUSES!=='undefined'?HOUSES:[]))h.lit=true;S.mendLit=1;}}];
function mendS(){S.mend=S.mend||{};return S.mend;}
const mendOpen=()=>!!(S.st&&S.st.done);
const mendDone=k=>!!mendS()[k];
function mendCan(p){if(mendDone(p.k))return false;if(p.after&&Object.keys(mendS()).length<p.after)return false;if(p.coins&&S.coins<p.coins)return false;
  for(const [k,n] of Object.entries(p.need||{}))if(inv(k)<n)return false;return true;}
function mendGive(k){const p=MEND.find(q=>q.k===k);if(!p||!mendCan(p))return;for(const [i,n] of Object.entries(p.need||{}))takeInv(i,n);if(p.coins)S.coins-=p.coins;
  mendS()[k]=S.day;p.apply();for(const n of npcs)if(PEOPLE&&PEOPLE[n.def.id])addFriend(n.def.id,15);SFX.bell&&SFX.bell();updateHud&&updateHud();addLore&&addLore(p.say);
  $('note').hidden=true;S.paused=false;
  const all=MEND.every(q=>mendDone(q.k));
  setTimeout(()=>openNote(`<p class="date">The mending ledger · ${p.name}</p><p>${p.say}</p>${all?'<p><b>Every line in the ledger is filled in. Marrow Hollow is mended.</b></p><p>On the green that evening there is a feast nobody planned. The church bell rings and nobody flinches. Somebody asks you to dance.</p>':''}`,all?'Go to the feast':'Good'),250);}
const MEND_ITEM=k=>(ITEMS[k]&&ITEMS[k].name)||k.replace(/_/g,' ');
function mendHtml(){const done=Object.keys(mendS()).length;let h=`<p class="date">The town hall · the mending ledger</p><p>The town started this book in 1952 and never dared write in it. ${done?`${done} of ${MEND.length} lines are filled in now.`:'Every line is empty.'}</p>`;
  for(const p of MEND){const d=mendDone(p.k);const locked=p.after&&done<p.after&&!d;const parts=Object.entries(p.need||{}).map(([k,n])=>`${n} ${MEND_ITEM(k)} <small style="opacity:.7">(${inv(k)})</small>`);if(p.coins)parts.push(`${p.coins} coins`);
    h+=`<div style="display:flex;gap:8px;align-items:center;padding:6px 8px;margin:4px 0;background:rgba(0,0,0,.12);${d?'opacity:.6':''}"><div style="flex:1;font-size:13px"><b>${d?'✔ ':''}${p.name}</b><br><small>${d?`Done, day ${mendS()[p.k]}.`:locked?'When the rest are done.':parts.join(' · ')}</small></div>${d||locked?'':`<button class="btn" data-mend="${p.k}" ${mendCan(p)?'':'disabled style="opacity:.45"'}>Give</button>`}</div>`;}
  return h;}
function mendLedger(){openNote(mendHtml(),'Close the book');$('noteText').querySelectorAll('button[data-mend]').forEach(b=>b.onclick=()=>{if(!b.disabled)mendGive(b.dataset.mend);});}
// the hall door: chained until the story is over, then the ledger
{const [hx,hz]=tbDoor('hall');const it=interact.find(q=>q.x===hx&&q.z===hz);if(it){const _l=it.label,_a=it.act;
  it.label=()=>mendOpen()?'The mending ledger':_l();it.act=function(){if(mendOpen()){mendLedger();return;}return _a.apply(this,arguments);};}}
// what's been mended stays mended
function mendReapply(){for(const p of MEND)if(mendDone(p.k))try{p.apply();}catch(e){}}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{mendReapply();}catch(e){}return r;};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{if(S.mend)mendReapply();}catch(e){}return r;};}
// the first morning after the story, someone says so
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{if(mendOpen()&&!S.mendTold){S.mendTold=S.day;setTimeout(()=>toast('Word in town: the chains are off the town hall. There’s a ledger on the table inside, and everyone says you should be the one to open it.',5.5),3200);}}catch(e){}return r;};}
// open curtains stay open, whatever the evening would otherwise decide
{const _u=update;update=function(dt){_u(dt);if(S.mendLit&&typeof HOUSES!=='undefined')for(const h of HOUSES)h.lit=true;};}
