/* ================= t337 story polish (the whole-game review, notes A and B): the chapters, the ending, the candles, the pacing,
   the transitions, and the story told in pictures instead of boxes.
   Chapter cards: each fires once, on the first free moment after its chapter starts, and never stays up over the next note or
   the night's fade. Chapter One ends on "Chapter One complete" with one Continue (no New game, no credit line, no next autumn);
   Chapter Two's card plays once the morning's sale slip has gone, then its opening note. The true ending holds a real end card
   after the credits (the valley at dawn, the ending you got, Jaxon Charlton), the credits roll over the valley at dawn with a
   music box under them, the next morning Caitlyn is at your door and the Tithe House has changed, and the title screen knows
   you finished. ================= */
const ST37={cardOn:0,queue:[],epiT:0};
// ---- small helpers
const st37Free=()=>{try{return S.mode==='play'&&!S.paused&&!SCENE&&!STG&&(typeof cine==='undefined'||!cine)&&$('end').hidden&&!(typeof pl37Busy==='function'&&pl37Busy());}catch(e){return false;}};
function st37After(fn,minWait){const t0=performance.now();const iv=setInterval(()=>{if(performance.now()-t0<(minWait||0))return;if(!st37Free())return;clearInterval(iv);try{fn();}catch(e){}},150);}
const st37Days=n=>n===1?'1 day':`${n} days`;
// ---- chapter cards: once each, then out of the way
function st37Card(n,after){S.saga=S.saga||{done:{}};S.saga.cards=S.saga.cards||{};S.saga.cards[n]=1;const c=$('chCard');const [k,t]=SG_CH[n];
  c.querySelector('.k').textContent=k;c.querySelector('.t').textContent=t;c.classList.remove('on');void c.offsetWidth;c.style.animationDuration='4.2s';c.classList.add('on');
  ST37.cardOn=performance.now();SFX.bell&&SFX.bell();
  const end=()=>{if(!ST37.cardOn)return;ST37.cardOn=0;c.classList.remove('on');c.onclick=null;after&&setTimeout(after,250);};
  c.onclick=end;setTimeout(end,4300);}
function st37CardOff(){const c=$('chCard');if(c&&c.classList.contains('on')){c.classList.remove('on');ST37.cardOn=0;}}
// the old path (a card queued whenever the chapter number went up) is retired: this one fires each card once
setInterval(()=>{try{if(typeof sgCardQ!=='undefined')sgCardQ=0;if(!S.st||!S.saga)return;const ch=sagaChapter();S.saga.cards=S.saga.cards||{};
    // an old save already past a chapter doesn't replay its card
    if(!S.saga.cards37){S.saga.cards37=1;for(let i=2;i<=ch;i++)if(S.st.started||i>2)S.saga.cards[i]=S.saga.cards[i]||1;}
    if(ch===3&&!S.saga.cards[3]&&!S.st.done&&st37Free())st37Card(3);}catch(e){}},250);
// Chapter Two opens the next morning, once the sale slip is put away: the card, then the note
stStart=function(){const st=S.st;st.started=true;st.tithe=0;st.act=2;
  const note=()=>openNote(`<h3>Chapter Two: The Tithe</h3><p>The bell rang on its own the night you bound it. Since then nobody in town will say your name out loud.</p><p>Caitlyn tells you there will be a drawing. Nobody will say when. <q>When the door is quiet,</q> Hale says, and won’t explain. Cora has chalked a number on her blackboard that hasn’t started counting yet.</p><p>Ask people. Caitlyn, Hale and Della know the most. Keep the Ward at the church.</p><p>Find out what the Tithe is.</p>`,'Find out',()=>{});
  st37After(()=>{S.saga=S.saga||{done:{}};S.saga.cards=S.saga.cards||{};if(S.saga.cards[2])note();else st37Card(2,note);},700);};
// a card never sits over the next note, a scene, or the night's fade
{const _on=openNote;openNote=function(){st37CardOff();return _on.apply(this,arguments);};}
{const _nd=newDay;newDay=function(){st37CardOff();return _nd.apply(this,arguments);};}
{const _ps=playScene;playScene=function(){st37CardOff();return _ps.apply(this,arguments);};}
// ---- the end of Chapter One: a chapter's end, not the game's
{const css=document.createElement('style');css.textContent=`#end{background:#0b0908!important}
#end.st37ch1 #again,#end.st37ch1 .small,#end.st37ch1 .stats{display:none!important}#end.st37ch1{background:rgba(10,8,8,.72)!important}
#end37{position:fixed;inset:0;z-index:998;background:#07060a;color:#e8dcc0;display:flex;flex-direction:column;align-items:center;justify-content:safe center;text-align:center;padding:24px 16px;box-sizing:border-box;overflow:auto}
#end37[hidden]{display:none}#end37 .k{font-size:13px;letter-spacing:.3em;text-transform:uppercase;color:#b8402a;margin-bottom:8px}
#end37 h1{font-family:var(--font-display);font-weight:400;font-size:clamp(28px,6vh,56px);margin:0;letter-spacing:.04em;color:#f0d8a8}
#end37 h2{font-family:var(--font-display);font-weight:400;font-size:clamp(18px,3.4vw,26px);margin:4px 0 14px;color:#e8b860}
#end37 canvas{image-rendering:pixelated;width:320px;height:180px;border:3px solid #2a1c12;box-shadow:0 0 0 2px #5a4028,0 6px 0 2px rgba(0,0,0,.4);margin:2px 0 14px}
#end37 .story{max-width:36ch;font-size:14px;line-height:1.5;color:#d6ccb8;margin:0 0 10px;text-wrap:balance}
#end37 .by{font-size:14px;letter-spacing:.12em;color:#c8b898;margin:2px 0 16px}#end37 .row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}`;document.head.appendChild(css);}
setInterval(()=>{try{const e=$('end');if(!e||e.hidden){e&&e.classList.remove('st37ch1');return;}
    if(S.st&&S.st.done){st37EndCard();return;}
    e.classList.add('st37ch1');$('keepFarming').textContent='Continue';const es=$('endStory');if(es&&/Next autumn, then\./.test(es.textContent))es.textContent=es.textContent.replace('"Next autumn, then."','"See you in the morning."');
    if(!$('nx37')){const n=document.createElement('div');n.id='nx37';n.style.cssText='margin-top:14px;font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#b8402a';n.textContent='Next · Chapter Two · The Tithe';$('keepFarming').parentElement.after(n);}
    const d=$('eDays');if(d&&d.nextElementSibling)d.nextElementSibling.textContent=+d.textContent===1?'Day':'Days';}catch(e){}},120);
// after Chapter One, before the morning: the goal points at tomorrow (the true ending keeps "the field is quiet now")
{const _o=objective;objective=function(){if(S.bound&&S.st&&!S.st.started&&!S.st.done)return ['Chapter One complete','Sleep. Something will be different in the morning.',null];
  const r=_o.apply(this,arguments);try{
    // counters that are already full drop out of the goal ("Things known 8/8"), and "in 0 day" reads "tonight"
    if(r&&typeof r[1]==='string'){r[1]=r[1].replace(/ · Things known 8\/8/,'').replace(/The drawing is in 0 day[s]?\./,'The drawing is tonight.').replace(/in 1 days/g,'in 1 day');}}catch(e){}return r;};}
// ---- the true ending: a held end card with the valley at dawn
function st37Dawn(cv){const W=160,H=90;cv.width=W;cv.height=H;const g=cv.getContext('2d');
  // a still of the valley at dawn: banded sky, the far ridge, the church on the rise, the farm and the field in the low light
  const sky=['#2a2238','#4a2e44','#7a4048','#b4604a','#d88a58','#eab070'];for(let i=0;i<sky.length;i++){g.fillStyle=sky[i];g.fillRect(0,i*7,W,7);}
  g.fillStyle='#f6d08a';g.fillRect(104,36,12,4);g.fillRect(106,34,8,2);   // the sun's edge, just up
  const ridge=(y0,amp,col,seed)=>{g.fillStyle=col;for(let x=0;x<W;x++){const h=Math.round(y0+Math.sin(x*.07+seed)*amp+Math.sin(x*.19+seed*2)*amp*.4);g.fillRect(x,h,1,H-h);}};
  ridge(44,3,'#5a3a48',1);ridge(50,2.5,'#3e2c3a',4);
  // pines on the near ridge
  g.fillStyle='#22202c';for(const [x,y,h] of [[8,50,9],[14,49,12],[20,51,8],[132,49,11],[139,50,9],[146,48,13],[152,50,8]]){for(let k=0;k<h;k++){const w=Math.max(1,Math.round((k/h)*4));g.fillRect(x-w,y-h+k,w*2+1,1);}g.fillRect(x,y,1,3);}
  // the church on the rise, the steeple against the sky
  g.fillStyle='#2a2230';g.fillRect(58,40,14,12);g.fillRect(63,30,4,10);g.fillRect(64,26,2,4);g.fillStyle='#f0b060';g.fillRect(61,44,2,3);g.fillRect(67,44,2,3);
  // the fields in rows, catching the light
  ridge(56,1.5,'#4a3a2a',7);for(let y=60;y<H;y+=3){g.fillStyle=y%6?'#6a5232':'#8a6a3a';g.fillRect(0,y,W,1);g.fillStyle='#3a2c20';g.fillRect(0,y+1,W,1);}
  // the cabin, one window lit, smoke going straight up
  g.fillStyle='#1c1418';g.fillRect(24,60,22,12);g.fillStyle='#2a1e1c';for(let k=0;k<7;k++)g.fillRect(22+k,60-k,26-k*2,1);g.fillStyle='#f2c070';g.fillRect(30,64,3,3);
  g.fillStyle='#8a7a84';for(let k=0;k<8;k++)g.fillRect(41+(k%2),50-k*2,1,2);
  // the scarecrow's pole, empty
  g.fillStyle='#1a1214';g.fillRect(96,58,1,14);g.fillRect(92,61,9,1);
  // a road running off to the east
  g.fillStyle='#a08a6a';for(let y=72;y<H;y++){const x=Math.round(118+(y-72)*1.4);g.fillRect(x,y,6+(y-72)>>1,1);}}
function st37EndCard(){const st=S.st;let e=$('end37');if(e&&!e.hidden)return;$('end').hidden=true;
  if(!e){e=document.createElement('div');e.id='end37';e.hidden=true;e.innerHTML=`<div class="k"></div><h1>Hollow Acre</h1><h2></h2><canvas></canvas><p class="story"></p><div class="by">Jaxon Charlton</div>
    <div class="row"><button class="begin" id="e37wake">Wake up</button><button class="begin ghost" id="e37new">New game</button></div>`;document.body.appendChild(e);
    $('e37wake').onclick=()=>{e.hidden=true;$('keepFarming').click();};$('e37new').onclick=()=>{$('again').click();};}
  const k=st.ending,E=ST_END[k]||{t:'The End',k:'An ending',end:''};
  e.querySelector('.k').textContent=`The end · ${E.k} · ${stFound.length} of 6 found`;e.querySelector('h2').textContent=E.t;e.querySelector('.story').textContent=(String(E.end).match(/^.*?[.!?](\s|$)/)||[E.end])[0].trim();
  st37Dawn(e.querySelector('canvas'));e.hidden=false;SFX.bell&&SFX.bell();
  // the save remembers that the story is over, so Continue wakes into the morning after
  if(!st.epi37){st.epiPend37=1;try{saveGame();}catch(err){}}}
// ---- the credits roll over the valley at dawn, with a music box
const ST37_TUNE=[[440,1],[523,1],[659,2],[587,1],[523,1],[494,2],[440,1],[392,1],[440,3],[0,1],[523,1],[659,1],[784,2],[740,1],[659,1],[587,2],[523,1],[494,1],[440,3],[0,2]];
function st37MusicBox(){let i=0,dead=false;const step=()=>{if(dead)return;const [f,d]=ST37_TUNE[i++%ST37_TUNE.length];
    if(f){A.tone(f*2,1.6,'sine',.045,{verb:true,a:.004});A.tone(f*4,.5,'sine',.012,{verb:true,a:.004});A.tone(f,1.2,'triangle',.018,{verb:true,a:.01});}setTimeout(step,d*380);};step();return ()=>{dead=true;};}
{const css=document.createElement('style');css.textContent='#credits2.st37dawn .roll{text-shadow:2px 2px 0 #1a0e08,-1px -1px 0 #1a0e08,0 0 6px rgba(20,10,6,.9)}#credits2 p small{font-size:14px!important;opacity:.82!important}#credits2 p{font-size:16px!important}#credits2 h3{font-size:14px!important}#credits2 .sting{background:rgba(5,5,6,.35)}';document.head.appendChild(css);}
{const _rc=rollCredits;rollCredits=function(k,done){const el=$('credits2');let stop=()=>{};
  const prev={room:S.room,hour:S.hour,storm:S.storm,mode:S.mode,P:{x:P.x,z:P.z}};
  try{
    // the valley at dawn behind the names: the farm, the church on its rise, the Tithe House at the end of the Mill Road
    const way=[{x:8,z:12},{x:doorPos.x+2,z:doorPos.z+3},{x:CHURCH_STEP.x,z:CHURCH_STEP.z+1.5},{x:TITHE_DOOR.x,z:TITHE_DOOR.z+3}];ST37.credits=1;
    S.room=null;S.hour=6.45;S.storm=false;H.vis=false;$('hud').hidden=true;$('buttons').hidden=true;ui.obj.hidden=true;try{$('hotbar').hidden=true;}catch(e){}
    const seg=[];let tot=0;for(let i=1;i<way.length;i++){const d=Math.hypot(way[i].x-way[i-1].x,way[i].z-way[i-1].z);seg.push(d);tot+=d;}
    let u=0;P.x=way[0].x+40;P.z=way[0].z+40;cine={stage:true,hidePlayer:true,cam:{x:way[0].x,z:way[0].z},drawables(){},light(){},
      update(dt){S.hour=Math.min(7.2,S.hour+dt*.012);u=Math.min(1,u+dt/70);let d=u*tot,i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++;}
        const a=way[i],b=way[i+1],t=seg[i]?d/seg[i]:0,sm=t*t*(3-2*t);cine.cam.x=a.x+(b.x-a.x)*sm;cine.cam.z=a.z+(b.z-a.z)*sm;}};
    S.mode='cine';el.style.background='rgba(120,56,30,.18)';el.classList.add('st37dawn');stop=st37MusicBox();setTimeout(()=>{fade(0);try{$('stgBars').classList.remove('on');}catch(e){}},60);}catch(e){}
  return _rc(k,()=>{stop();ST37.credits=0;el.style.background='';el.classList.remove('st37dawn');try{if(cine&&!STG)cine=null;}catch(e){}S.room=prev.room;S.storm=prev.storm;done&&done();});};}
// ---- the morning after: Caitlyn at your door, the Tithe House changed
const ST37_EPI={
  door:['You came back out. Nobody comes back out.','The kettle’s on. Ruth’s asleep on Agnes’s porch. I don’t think she’s slept in twenty-five years.'],
  shore:['You smell of the lake. Don’t tell me where you went.','Come in and eat something. Then we’ll both pretend.'],
  truck:['Tobias went with Walt. I set the table for one fewer.','I keep laughing, and I don’t know why. Come in before I start crying instead.'],
  dunn:['The sheriff’s gone. His door’s open and his kettle’s still warm.','Nobody’s going to say his name, so I will. Dunn. There. Come in.'],
  tag:['Something slept in the straw by your door. It was gone before I got here.','It left this on your step. A brass tag. The number’s gone up by one.']};
function st37Epilogue(){const st=S.st;if(!st||!st.done||st.epi37)return;st.epi37=1;delete st.epiPend37;
  const k=st.ending,lines=ST37_EPI[k];try{saveGame();}catch(e){}
  if(!lines||!npcById('mae'))return;   // taken: the morning is the old loop, and nobody comes
  st37After(()=>{const d=doorPos;const n=npcById('mae');
    stage({hour:Math.max(S.hour,7.1),keepHour:true,player:{x:d.x-.5,z:d.z+1.3,dir:'E'},cast:{mae:{x:d.x+1.9,z:d.z+2.0,dir:'W'}},cam:{x:d.x+.7,z:d.z+1.6},lead:700,
      show:true,beats:[{hold:.6},{who:'mae',text:lines[0]},{who:'mae',text:lines[1]},{hold:.6,emote:{mae:'♥'}}],done(){try{saveGame();}catch(e){}}});},1800);}
$('keepFarming').addEventListener('click',()=>{if(S.st&&S.st.done&&!S.st.epi37)setTimeout(st37Epilogue,600);});
// Continue after finishing wakes into the morning after, not the Tithe House steps at night
{const _lg=loadGame;loadGame=function(d){const r=_lg.apply(this,arguments);try{const st=S.st;if(st&&st.done&&!st.epi37){setTimeout(()=>{newDay(`Day ${S.day+1}. The morning after.`);setTimeout(st37Epilogue,900);},500);}}catch(e){}return r;};}
// the title screen knows how the last run ended
try{const d=readSave();const st=d&&d.S&&d.S.st;if(st&&st.done&&st.ending){const E=ST_END[st.ending];const kk=document.querySelector('#title .kicker'),tg=document.querySelector('#title .tag');
    if(kk)kk.textContent=`After the Tithe · ${E?E.t:'The end'}`;if(tg)tg.textContent=`${stFound.length} of 6 endings found. The field is quiet now. It won’t stay quiet.`;}}catch(e){}

/* ---- the candles: an honest player can always get there. Pastor Hale spares the first one when you ask him; the goal says how
   to raise the coin for the rest when you're short; and the price is what the peddler always charged, no more. ---- */
const ST37_CANDLE=()=>{try{const r=vendors.peddler.rows().find(q=>q.k==='candle');return r&&r.price||25;}catch(e){return 25;}};
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);try{if(r&&r[0]==='Candles'){const need=3-S.candles-lit();const pr=ST37_CANDLE();
    if(need>0){let add='';if(!S.c37hale)add+=' Pastor Hale may spare one if you ask him.';
      const short=need*pr-S.coins-(S.c37hale?0:pr);if(short>0)add+=` You need ${short} more coin${short===1?'':'s'}: ship crops in the bin (they sell overnight), or sell fish to Otto.`;
      const m=/(\d)\/3/.exec(String(r[1]));const have=m?m[1]:String(3-need);
      const base=String(r[1]).replace(/\s*\d\/3\.?/,''),k=base.search(/ · |<span/),head=k<0?base:base.slice(0,k),tail=k<0?'':base.slice(k);
      r[1]=`${have}/3 candles${short>0?' · '+short+' more coin'+(short===1?'':'s'):''}. `+head.trim()+add.replace(/ You need \d+ more coins?:/,' To raise it:')+tail;}}}catch(e){}return r;};}
{const _t=talk;talk=function(n){try{let g=null;try{g=objective();}catch(e){}if(n&&n.def&&n.def.id==='hale'&&!S.c37hale&&g&&g[0]==='Candles'&&(3-S.candles-lit())>0){
      S.c37hale=1;S.candles=(S.candles||0)+1;
      playScene('hale','A candle',`<q>You’ve been to the county line, then. Everyone goes once.</q><br><br>He takes a black candle out of his coat, braided wax, and presses it into your hand.<br><br><q>Your grandfather left this with me. One. The other two you buy from the thing at the crossroads, like everyone does. It takes coin. Only coin.</q>`,()=>{toast('A Ward Candle. 1 of 3.',2.6);});return;}}catch(e){}
    return _t.apply(this,arguments);};}

/* ---- pacing: Chapter Two runs over four days, not one. At most four of its places and finds a day; when the day's are done the
   goal says to go home, and the night does the rest. The cold house and the drowned bell move to the empty days of Chapter Three,
   "Under the church" waits for dark as its text says, and birthdays stop shouting over the worst days. ---- */
const ST37_CAP=4;
function st37Today(){const st=S.st;st.c37=st.c37||{};return st.c37[S.day]||0;}
function st37Count(){const st=S.st;st.c37=st.c37||{};st.c37[S.day]=(st.c37[S.day]||0)+1;}
{const _p=sgPlay;sgPlay=function(b){const was=S.saga&&S.saga.done&&S.saga.done[b.id];const r=_p.apply(this,arguments);try{if(!was&&/^c2/.test(b.gate))st37Count();}catch(e){}return r;};}
// places seen count too
setInterval(()=>{try{const st=S.st;if(!st||!st.seen)return;const n=Object.keys(st.seen).length;if(st.c37n==null){st.c37n=n;return;}if(n>st.c37n){for(let i=st.c37n;i<n;i++)st37Count();st.c37n=n;}}catch(e){}},400);
const st37Capped=()=>{try{const st=S.st;return st&&st.started&&!st.tithe&&!st.done&&st37Today()>=ST37_CAP;}catch(e){return false;}};
{const _c=sgCurrent;sgCurrent=function(){const b=_c.apply(this,arguments);if(b&&/^c2/.test(b.gate)&&st37Capped())return null;return b;};}
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);try{if(st37Capped()&&r&&(r[0]==='The Tithe'||(r[0]==='Three stones'&&!sagaReady('c2b'))||(SAGA.some(b=>/^c2/.test(b.gate)&&pbStrip37(sgVal(b.name))===pbStrip37(r[0])))))
      return ['Rest','Enough for one day. Whatever is out there keeps its own hours. Go home and sleep.',isNight()?null:{x:doorPos.x,z:doorPos.z}];}catch(e){}return r;};}
const pbStrip37=s=>String(s||'').replace(/<[^>]*>/g,'').trim();
// a place you walk into on a capped day still counts as seen (you can't un-see it); only the goal stops pointing
// move the cold house and the drowned bell into the last days, and keep the church cellar for the night
(function(){try{const mv=(id,day)=>{const i=SAGA.findIndex(b=>b.id===id);if(i<0)return;const [b]=SAGA.splice(i,1);b.gate='c3';b.day=day;SAGA.push(b);};
  mv('cold',2);mv('drowned',2);if(SG.crypt)SG.crypt.night=true;}catch(e){}})();
// birthdays: only the people you know, and never on the days the story is at its worst, or over a scene
{const _t=toast;toast=function(msg){try{const m=/^It’s (.+)’s birthday\. A gift counts/.exec(String(msg||''));if(m){
      const st=S.st;if(st&&st.tithe&&!st.done&&stLeft()<=4)return;if(STG||SCENE||(typeof cine!=='undefined'&&cine))return;
      const n=npcs.find(q=>q.def.name.split(' ')[0]===m[1]);if(n&&!(S.friend&&S.friend[n.def.id]>0))return;}}catch(e){}return _t.apply(this,arguments);};}
// the date on the drawing notice is the real one, and "your birthday" shows on the clock on that day only
function st37DrawDate(){try{const st=S.st;if(st&&st.tithe){const d=st.tithe-1;return 'FALL '+(((d-1)%28)+1);}}catch(e){}return 'FALL __';}
stHud=function(){const el=$('titheCd');if(!el)return;if(!S.st.started||S.st.done){el.style.display='none';return;}el.style.display='';if(!S.st.tithe){el.textContent='The drawing: when the door is quiet';return;}const L=stLeft();
  let t=L>1?`The drawing in ${L-1} day${L-1>1?'s':''}`:L===1?'The drawing is tonight. Your birthday.':'Tithe night';
  if(stLast()&&L>1&&Math.floor(performance.now()/2300)%7===0)t=['Day 0','Stay','Stay. Stay.'][Math.floor(performance.now()/16100)%3];el.textContent=t;};
// a goal that changes plays its chime, whatever changed it
setInterval(()=>{try{if(S.mode!=='play'||!ui||!ui.obj||ui.obj.hidden)return;const o=objective();const k=o&&o[0];if(!k)return;if(ST37.goal&&k!==ST37.goal&&!STG&&!SCENE){A.tone(988,.5,'sine',.035,{verb:true,a:.004});A.tone(1319,.6,'sine',.03,{verb:true,a:.004,delay:.12});}ST37.goal=k;}catch(e){}},300);

/* ---- transitions ---- */
// a close-up's caption and hint leave with the picture, and toasts wait for it to finish fading
{const css=document.createElement('style');css.textContent='#ruBox:not(.on) #ruCap,#ruBox:not(.on) #ruHint{opacity:0!important;transition:opacity .12s steps(2)!important}';document.head.appendChild(css);
  try{if(typeof PL37!=='undefined'&&!PL37.modal.includes('ruBox'))PL37.modal.push('ruBox','end37');}catch(e){}}
// the cinema bars go first, quickly, before the HUD comes back
{const css=document.createElement('style');css.textContent='#stgBars:not(.on):before,#stgBars:not(.on):after{transition:height .24s steps(4)!important}';document.head.appendChild(css);
  const _e=stgEnd;stgEnd=function(){try{$('stgBars').classList.remove('on');}catch(e){}return _e.apply(this,arguments);};}
// nobody stands inside a lamp post: stage marks keep a tile clear of posts, lamps and trunks, and so does where a scene leaves you
const ST37_TALL=o=>!o.hide&&!o.room&&(o.kind==='lamp'||o.kind==='tree'||o.kind==='pine'||/post|sign|lamp|pole/i.test(o.spr&&o.spr.name||o.sprName||o.label||''));
function st37Clear(x,z,r){r=r||.9;for(const o of OBJ){if(Math.abs(o.x-x)>r+.3||Math.abs(o.z-z)>r+.3)continue;if(ST37_TALL(o)&&Math.hypot(o.x-x,o.z-z)<r)return false;}return true;}
function st37Free2(x,z){if(st37Clear(x,z))return [x,z];for(let rad=.5;rad<=2.5;rad+=.5)for(let a=0;a<8;a++){const nx=x+Math.cos(a*Math.PI/4+Math.PI/2)*rad,nz=z+Math.sin(a*Math.PI/4+Math.PI/2)*rad;if(st37Clear(nx,nz)){const q={x:nx,z:nz};collide(q,.3);if(Math.hypot(q.x-nx,q.z-nz)<.05)return [nx,nz];}}return [x,z];}
{const _s=stage;stage=function(def){try{if(def&&def.room==null&&!def.indoor){for(const c of Object.values(def.cast||{})){if(c.seat)continue;const f=st37Free2(c.x,c.z);c.x=f[0];c.z=f[1];}
      if(def.player&&def.player.x!=null&&!def.player.seat){const f=st37Free2(def.player.x,def.player.z);def.player.x=f[0];def.player.z=f[1];}
      const _d=def.done;def.done=function(){try{if(!S.room&&!st37Clear(P.x,P.z,.7)){const f=st37Free2(P.x,P.z);P.x=f[0];P.z=f[1];}}catch(e){}return _d&&_d.apply(this,arguments);};}}catch(e){}
    return _s.apply(this,arguments);};}
{const _l=typeof leaveRoom==='function'?leaveRoom:null;if(_l)leaveRoom=function(){const r=_l.apply(this,arguments);setTimeout(()=>{try{if(!S.room&&S.mode==='play'&&!st37Clear(P.x,P.z,.6)){const f=st37Free2(P.x,P.z);P.x=f[0];P.z=f[1];}}catch(e){}},700);return r;};}
// the jump scare: its face in the middle of the screen, nothing over it, the line after the sting
function st37Hush(ms){const h=[$('hud'),$('buttons'),ui.obj,$('toast')];const was=h.map(e=>e&&e.style.visibility);h.forEach(e=>{if(e)e.style.visibility='hidden';});
  setTimeout(()=>h.forEach((e,i)=>{if(e)e.style.visibility=was[i]||'';}),ms);}
{const _j=jumpScare;jumpScare=function(kind){const _t=toast;let line=null;toast=function(m,d,r){line=[m,d,r];};try{_j.apply(this,arguments);}finally{toast=_t;}
    try{// in front, below the eyeline: the player turns to it
      const q={x:P.x,z:P.z+1.35};collide(q,.4);if(Math.hypot(q.x-P.x,q.z-(P.z+1.35))<.3){H.x=q.x;H.z=q.z;P.fx=0;P.fz=1;P.dir='S';H.dir=dirOf(P.x-H.x,P.z-H.z);}}catch(e){}
    st37Hush(1700);if(line)setTimeout(()=>_t(line[0],line[1],line[2]),1800);};}
// Chapter One's climax: the Hollow on open ground in front of you, burning in your light; the hat left where it stood
{const _ru=ritualUpdate;ritualUpdate=function(dt){try{if(ritual&&ritual.flash&&ritual.t>5.9&&ritual.t<8.6){ritual.t+=dt;cam.shake=0;return;}}catch(e){}return _ru.apply(this,arguments);};}
{const _s=startRitualEnd;startRitualEnd=function(){const r=_s.apply(this,arguments);try{
    const tries=[[0,2.6],[1.6,2.2],[-1.6,2.2],[2.4,.6],[-2.4,.6],[0,-2.4]];
    for(const [dx,dz] of tries){const q={x:P.x+dx,z:P.z+dz};collide(q,.4);const mid={x:P.x+dx/2,z:P.z+dz/2};collide(mid,.3);
      if(Math.hypot(q.x-P.x-dx,q.z-P.z-dz)<.2&&Math.hypot(mid.x-P.x-dx/2,mid.z-P.z-dz/2)<.2){H.x=q.x;H.z=q.z;const L=Math.hypot(dx,dz);P.fx=dx/L;P.fz=dz/L;P.dir=dirOf(dx,dz);H.dir=dirOf(-dx,-dz);break;}}
    st37Hush(6400);}catch(e){}return r;};}

/* ================= the pictures: the Tithe House as the story tells it, its ring of standing stones, and the close-ups redrawn at
   their own scale (the slip with your name, Tobias's drawing, the deer by the track, the well's braid, the shoes on the step). ================= */
function st37Cv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const P=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),ww==null?1:ww,hh==null?1:hh);};fn(P,g,w,h);return c;}
const st37H=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%97;
// outline whatever is drawn on a canvas, one pixel, in a dark of its own
function st37Outline(c,col){const g=c.getContext('2d'),W=c.width,H=c.height,d=g.getImageData(0,0,W,H),a=d.data,src=new Uint8Array(W*H);
  for(let i=0;i<W*H;i++)src[i]=a[i*4+3]>128?1:0;g.fillStyle=col||'#0e0b0c';
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(src[y*W+x])continue;if((x>0&&src[y*W+x-1])||(x<W-1&&src[y*W+x+1])||(y>0&&src[(y-1)*W+x])||(y<H-1&&src[(y+1)*W+x]))g.fillRect(x,y,1,1);}}
// ---- the Tithe House: a windowless stone block under a tarred hip roof, the door nailed shut a year at a time, a child's shoes on the step
function st37House(state){return st37Cv(268,245,(P,g)=>{const open=/open/.test(state),night=/night/.test(state);
  const X0=48,X1=220,WY=148,GY=232;   // wall left, right, wall top, ground line
  // the roof: a hip roof of tarred shingles. Left hip lit, front plane mid, right hip dark; quiet in the middle, worn at the edges
  const EX0=38,EX1=230,RY=90,RX0=96,RX1=172,YB=RY+16;   // eave span, ridge height, ridge ends, where the side eaves meet the back
  const xl=y=>y<YB?RX0-(RX0-EX0)*(y-RY)/(YB-RY):EX0,xr=y=>y<YB?RX1+(EX1-RX1)*(y-RY)/(YB-RY):EX1;
  const hl=y=>RX0+(EX0-RX0)*(y-RY)/(WY+2-RY),hr=y=>RX1+(EX1-RX1)*(y-RY)/(WY+2-RY);
  for(let y=RY;y<=WY+2;y++)for(let x=EX0;x<=EX1;x++){if(x<xl(y)||x>xr(y))continue;const k=x<hl(y)?1:x>hr(y)?3:2;const row=Math.floor((y-RY)/5),cy=(y-RY)%5,off=(row%2)*4,cx=(x+off)%9;
    const T={1:['#4c4448','#3e373b','#5a5256'],2:['#342e32','#2a2428','#423a3e'],3:['#221c20','#1a1518','#2c2629']}[k];
    let c=cy===4?T[1]:cx===0?T[1]:T[0];if(cy===0&&cx>1)c=T[2];if(y>WY-1)c='#120e10';if(k===2&&st37H(Math.floor((x+off)/9),row)<5&&cy>0&&cy<4&&cx>0)c='#3a3236';P(x,y,1,1,c);}
  for(let y=RY;y<=WY;y++){P(Math.round(hl(y)),y,1,1,'#6a6266');P(Math.round(hr(y)),y,1,1,'#141012');P(Math.round(xl(y)),y,1,1,'#0e0b0c');P(Math.round(xr(y)),y,1,1,'#0e0b0c');}   // hip lines lit left, dark right
  P(RX0,RY-2,RX1-RX0+1,3,'#6e666a');P(RX0,RY-2,RX1-RX0+1,1,'#8a8286');   // the ridge cap
  for(const [x,y] of [[118,112],[150,128],[134,98]])P(x,y,3,1,'#5a4e48');   // a few lifted shingle lips
  P(EX0,WY+2,EX1-EX0+1,2,'#0e0b0c');
  // the wall: coursed rubble stone, every block its own size, lit from the left, no window anywhere
  let y=WY+4,row=0;while(y<GY-5){const h=6+st37H(row,3)%3;let x=X0-(st37H(row,5)%9);let col=0;
    while(x<X1){const w=9+st37H(row,col)%10;const x0=Math.max(X0,x),x1=Math.min(X1,x+w);const tone=st37H(col,row)%3;const side=(x0+x1)/2<X0+44?0:(x0+x1)/2>X1-36?2:1;
      const base=[['#6c6a72','#646269','#727078'],['#5c5a62','#55535a','#626068'],['#4a4850','#44424a','#504e56']][side][tone];
      for(let yy=y;yy<Math.min(GY-5,y+h);yy++)for(let xx=x0;xx<x1;xx++){const edge=Math.min(xx-X0,X1-xx)<26;let c=base;if(xx===x0||yy===y)c=edge?'#3a3840':'#24222a';else if(yy===y+1)c=edge?(side===2?'#56545c':'#6e6c74'):(side===2?'#5e5c64':'#86848c');else if(yy===y+h-1)c=side===0?'#55535a':'#3e3c44';P(xx,yy,1,1,c);}
      x+=w;col++;}y+=h;row++;}
  P(X0,WY+4,X1-X0,4,'#161416');P(X0,WY+8,X1-X0,1,'#2a282c');   // the eave's shadow on the wall
  for(const [sx,len] of [[X0+22,22],[X0+64,14],[X1-58,26],[X1-24,16]])for(let k=0;k<len;k++)P(sx+(k>len*.6?1:0),WY+9+k,2+(k<len*.4?1:0),1,'#34323a');   // rain streaks from the eaves
  P(X0,GY-5,X1-X0,5,'#3a383c');P(X0,GY-5,X1-X0,1,'#6a686e');   // the plinth
  for(const [mx,mw] of [[X0,12],[X1-16,16],[X0+74,7]])for(let k=0;k<mw;k++){const h=2+st37H(mx+k,7)%3;P(mx+k,GY-h,1,h,k%3?'#2e3a22':'#3e4a2a');}   // moss along the foot
  // the door in a stone surround under a lintel
  const DX=120,DW=28,DY=174;P(DX-6,DY-8,DW+12,GY-DY+8,'#0e0b0c');P(DX-5,DY-7,DW+10,7,'#7a7880');P(DX-5,DY-7,DW+10,1,'#a4a2aa');P(DX-5,DY,5,GY-DY-4,'#66646c');P(DX+DW,DY,5,GY-DY-4,'#46444c');
  if(open){P(DX,DY,DW,GY-DY-4,'#040304');for(let yy=DY;yy<GY-4;yy++){P(DX+DW-8,yy,8,1,(yy%9===0)?'#1a120c':'#3a2a1c');P(DX+DW-8,yy,1,1,'#0e0b0c');}
    for(let yy=DY+12;yy<GY-4;yy+=4)P(DX+4,yy,1,1,'#16101a');}
  else{for(let x=DX;x<DX+DW;x++)for(let yy=DY;yy<GY-4;yy++){const b=(x-DX)%7;P(x,yy,1,1,b===0?'#1a120c':b===1?'#5a4430':'#3e3022');}
    // a hundred and fifty years of boards nailed across it, every way, the oldest grey and split, the newest still pale
    const board=(x0,y0,x1,y1,col,hi)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),yy=Math.round(y0+(y1-y0)*i/n);P(x-1,yy-1,3,5,'#0e0b0c');}
      for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n),yy=Math.round(y0+(y1-y0)*i/n);P(x,yy,1,3,col);P(x,yy,1,1,hi);}
      for(const u of [.08,.92]){const x=Math.round(x0+(x1-x0)*u),yy=Math.round(y0+(y1-y0)*u);P(x,yy,2,2,'#141010');P(x,yy,1,1,'#b8b8c0');P(x+1,yy+2,1,2+st37H(x,yy)%3,'#7a3a1a');}};
    board(DX-2,DY+4,DX+DW+1,DY+9,'#6a6460','#8a847e');board(DX-2,DY+30,DX+DW+1,DY+24,'#5e5650','#7e766e');board(DX+1,DY+12,DX+DW-2,DY+44,'#706650','#908470');
    board(DX+DW-2,DY+14,DX+1,DY+40,'#7a6a4e','#9a8a6a');board(DX-2,DY+36,DX+DW+1,DY+38,'#8a7248','#aa9262');board(DX-2,DY+19,DX+DW+1,DY+16,'#9a7c48','#ba9c68');board(DX-2,DY+47,DX+DW+1,DY+45,'#c49a54','#e4c27e');
    for(let i=0;i<40;i++){const x=DX+1+st37H(i,9)%(DW-2),yy=DY+2+st37H(9,i)%(GY-DY-10);P(x,yy,1,1,'#9a9aa2');P(x,yy+1,1,1,'#6a3418');}}   // the nail heads between, rust under each
  // the cold lamp on its bracket by the door
  const LX=DX+DW+12,LY=DY+4;P(LX-4,LY-5,7,1,'#1a1414');P(LX-4,LY-5,1,3,'#1a1414');P(LX+2,LY-5,1,2,'#1a1414');P(LX,LY-3,5,1,'#0e0b0c');P(LX+1,LY-4,3,1,'#2a2428');P(LX-1,LY-2,7,8,'#0e0b0c');P(LX,LY-1,5,6,night?'#cdeffa':'#1c2024');if(night){P(LX+1,LY,2,4,'#ffffff');}else{P(LX+1,LY,1,1,'#5a6268');P(LX+2,LY+3,1,1,'#3a2a1a');}P(LX,LY+5,5,1,'#3a3236');
  // the step: a deep slab; on it a child's shoes, strap and buckle, toes turned in toward each other, a shadow under each
  P(DX-12,GY-8,DW+24,9,'#0e0b0c');P(DX-11,GY-7,DW+22,7,'#7a7880');P(DX-11,GY-7,DW+22,1,'#a8a6ae');P(DX-11,GY-1,DW+22,1,'#4a4850');
  if(open){for(const [bx,by,bw] of [[DX-30,GY-2,24],[DX+DW+8,GY-1,22],[DX-20,GY+1,18]]){P(bx,by,bw,4,'#0e0b0c');P(bx+1,by+1,bw-2,2,'#8a7248');P(bx+1,by+1,bw-2,1,'#aa9262');}}
  else{const shoe=(x,y,d)=>{const fx=k=>d>0?x+k:x+9-k;P(Math.min(fx(0),fx(9))-1,y-1,12,7,'#0e0b0c');
      for(let yy=0;yy<5;yy++)for(let xx=0;xx<10;xx++){if((yy===0&&(xx<1||xx>6))||(yy===4&&(xx<1))||(xx===9&&(yy<1||yy>3)))continue;let c=xx<3?'#4a2a1c':xx<6?'#6a3e26':'#844e30';if(yy===0)c='#9a6440';if(yy===4)c='#e0d4bc';P(fx(xx),y+yy,1,1,c);}
      P(fx(1),y+1,3,2,'#120a06');P(fx(4),y,1,3,'#2a1a10');P(fx(4),y+1,1,1,'#d8b860');   // the opening, the strap, the buckle
      P(Math.min(fx(0),fx(9)),y+5,10,1,'#3e3c44');};
    shoe(DX+1,GY-7,1);shoe(DX+DW-10,GY-7,-1);}
  if(night){const id=g.getImageData(0,0,268,245),a=id.data,lx=166,ly=180;for(let y=0;y<245;y++)for(let x=0;x<268;x++){const i=(y*268+x)*4;if(!a[i+3])continue;const d=Math.hypot(x-lx,(y-ly)*1.3);
      const f=d<22?1:d<44?.78:d<74?.6:.46;a[i]=a[i]*f*.92;a[i+1]=a[i+1]*f*.96;a[i+2]=a[i+2]*f;}g.putImageData(id,0,0);}
  st37Outline(g.canvas);});}
// standing stones for the ring: tall, rough, leaning, lichen on the lit side
function st37Stone(k){const W=[20,24,18][k],H=[44,38,50][k];return st37Cv(W+4,H+4,(P,g)=>{const lean=[1,-1,0][k];
  for(let y=0;y<H;y++){const t=y/H,half=(W/2-1)*(.62+.38*Math.sin(Math.min(1,t*1.4+.15)*Math.PI*.5))-(y<4?2-y*.5:0)+Math.sin(y*.7+k)*.6;const cx=W/2+2+lean*(1-t)*3;
    for(let x=Math.round(cx-half);x<=Math.round(cx+half);x++){const u=(x-(cx-half))/(2*half);let c=u<.3?'#8a8890':u<.7?'#6a6870':'#4c4a52';if(y<3)c='#9a98a0';if(st37H(x,y>>1)<6&&u<.7)c='#7a7a6a';P(x,y+1,1,1,c);}}
  for(let i=0;i<3;i++){const y=6+st37H(k,i)%(H-14);P(4+st37H(i,k)%4,y,2,3,'#7a8a5a');}   // lichen on the lit face
  P(W/2-3,H-1,W-2,2,'#3a383c');st37Outline(g.canvas);});}
// ---- install: the house, the night lamp, and the ring
const ST37_ART={};
function st37Reg(name,cv,ax,ay,extra){const src='c37:'+name;IMG[src]=cv;SPR[name]=Object.assign({src,fw:cv.width,fh:cv.height,ax,ay},extra||{});}
function st37InstallTithe(){try{const base=SPR.h_tithe&&Object.assign({},SPR.h_tithe);const st=S.st||{};const open=st.done&&st.ending==='door';
    const d=open?'open':'nailed';const o=OBJ.find(q=>q.kind==='bld'&&(q.spr==='h_tithe'||q.spr==='h_tithe37')&&Math.abs(q.x-TITHE.x)<.6);if(!o)return;   // (wait for the world to be built)
    if(ST37_ART.tithe!==d||o.spr!=='h_tithe37'){ST37_ART.tithe=d;const ex={foot:base?base.foot:[-3.5,-3.3,3.5,0],bw:7};
      st37Reg('h_tithe37',st37House(d),134,236,ex);st37Reg('h_tithe37n',st37House(d+'_night'),134,236,ex);o.spr='h_tithe37';o.night='h_tithe37n';o.lit=false;}
    // the ring: standing stones where the gravestones stood, and the ring closed round to the path
    if(!ST37_ART.ring&&OBJ.some(q=>/^grave_\d$/.test(q.spr||'')&&Math.hypot(q.x-TITHE.x,q.z-(TITHE.z+1))<7.2)){ST37_ART.ring=1;for(let k=0;k<3;k++)st37Reg('st37_stone'+k,st37Stone(k),[12,14,11][k],[46,40,52][k]);
      const old=OBJ.filter(q=>/^grave_\d$/.test(q.spr||'')&&Math.hypot(q.x-TITHE.x,q.z-(TITHE.z+1))<7.2&&Math.hypot(q.x-TITHE.x,q.z-(TITHE.z+1))>3.5);
      for(const q of old){q.hide=true;for(const it of interact)if(it&&Math.abs(it.x-q.x)<.3&&Math.abs(it.z-(q.z+.5))<.8&&/Read/.test(typeof it.label==='function'?it.label():it.label||'')){const _o=it.on;it.on=()=>false;}}
      for(const q of OBJ)if(q.kind==='flat'&&!q.hide&&q.x>TITHE.x-1&&q.x<TITHE.x+5.6&&q.z>TITHE.z-1.6&&q.z<TITHE.z+1)q.hide=true;   /* the row of stepping stones */
      for(let i=0;i<14;i++){const a=i/14*Math.PI*2+.2;const x=TITHE.x+Math.cos(a)*7.4,z=TITHE.z+.2+Math.sin(a)*5.6;if(Math.sin(a)>.9)continue;   /* the gap: the path in */
        if(Math.abs(x-TITHE.x)<5.6&&z<TITHE.z-1.2&&z>TITHE.z-5)continue;obj('st37_stone'+(i%3),x,z,{kind:'prop',solid:1});addCircle(x,z,.35);}}}catch(e){}}
setInterval(st37InstallTithe,1000);
// the one cold light at night, by the Tithe House door
{const _go=glowObjs;glowObjs=function(){const r=_go.apply(this,arguments);ST37.glowN=(ST37.glowN||0)+1;try{if(typeof nightK!=='undefined'&&nightK>.05&&!S.room){const X=sx(TITHE.x+.95),Y=sz(TITHE.z-1.5)-56;
      if(X>-80&&X<VW+80&&Y>-80&&Y<VH+80){glowAt(X,Y,54,[150,210,255],.7*nightK);glowAt(X,Y,12,[230,248,255],.9*nightK);}}}catch(e){}return r;};}

// ---- close-ups, drawn at their own scale
const st37Txt=(P,str,x,y,col,sc)=>{if(typeof sgtT==='function')sgtT(P,str,x,y,col,sc);};
// a colour ramp from one hex: darker steps toward purple, lighter toward yellow
function st37Ramp(hex){const n=parseInt(String(hex||'#6a4224').slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;const f=(k,dr,dg,db)=>'#'+[r*k+dr,g*k+dg,b*k+db].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
  return [f(.42,2,0,8),f(.66,0,0,4),f(.86,4,4,2),f(1.08,14,12,6),f(1.3,30,26,14)];}
// the well: the bucket comes up with a braid of hair the colour of yours, a milk tooth knotted into it, and a brass tag
function st37Well(){const hair=st37Ramp(S.look&&S.look.hair);return st37Cv(130,104,(P,g)=>{
  for(let y=0;y<104;y++)for(let x=0;x<130;x++)P(x,y,1,1,y<70?'#16161c':'#1c1c22');
  for(let y=0;y<104;y+=6)for(let x=(y/6%2)*10;x<130;x+=20)P(x,y,8,1,'#202028');   // the well's dark stone behind
  const W=['#24160c','#3e2816','#5a3c22','#7a5432','#9a6e44'],I=['#16161c','#2e3038','#4a4e58','#6a707c'];
  for(let y=40;y<98;y++){const t=(y-40)/58,hw=Math.round(30-t*5);for(let x=-hw;x<=hw;x++){const u=x/hw,st=(x+hw)%8;P(52+x,y,1,1,st===0?W[0]:W[u<-.55?3:u<.35?2:1]);}P(52-hw-1,y,1,1,'#0a0604');P(52+hw+1,y,1,1,'#0a0604');}
  for(const y of [46,70,92])for(let x=-30;x<=30;x++)P(52+x,y,1,2,I[Math.abs(x)>26?1:x<0?3:2]);
  for(let x=-29;x<=29;x++){P(52+x,41,1,1,'#7a6a3a');P(52+x,40,1,1,'#9a8a4a');}P(21,39,63,1,'#0a0604');
  for(let x=24;x<81;x++)P(x,38-Math.round(Math.sin((x-24)/57*Math.PI)*22),1,2,I[2]);   // the handle
  for(let y=0;y<17;y++)P(52+(y%2),y,1,1,'#8a7a5a');   // the rope going up
  // the braid: three strands crossing, the player's own colour, over the rim and down the side, a tooth tied in
  const bx=74;for(let i=0;i<46;i++){const y=34+i,x=bx+Math.round(Math.sin(i*.22)*2);const ph=i%6;
    P(x-2,y,6,1,hair[0]);P(x-1,y,4,1,ph<3?hair[2]:hair[1]);P(ph<3?x-1:x+1,y,2,1,hair[3]);if(ph===0||ph===3)P(x-1,y,4,1,hair[1]);if(ph===1)P(x,y,1,1,hair[4]);}
  for(let k=0;k<8;k++)P(bx-2+k%3-1+(k>>2),80+k,1,1,k%2?hair[2]:hair[3]);   // the frayed end
  // the milk tooth, bound in with red thread
  P(bx+4,58,5,7,'#0e0b0c');P(bx+5,59,3,4,'#f2ecd8');P(bx+5,59,1,2,'#ffffff');P(bx+6,63,1,1,'#c8bca0');P(bx+3,60,7,1,'#a82a20');P(bx+3,62,1,2,'#a82a20');
  // the brass tag on its string
  P(bx+3,44,1,4,'#8a7a5a');P(bx+4,47,10,1,'#8a7a5a');P(86,47,42,17,'#0e0b0c');P(87,48,40,15,'#b88a34');P(87,48,40,1,'#e8c870');P(87,62,40,1,'#7a5a1c');P(88,49,2,2,'#5a4010');
  st37Txt(P,'HOLLOW',95,50,'#4a3008');st37Txt(P,'ACRE 1874',89,56,'#4a3008');});}
// the deer on the farm track: on its side, legs out, neck stretched, opened along the flank; twelve pieces of it laid round in a clock,
// and a stick for the hand, pointing up the track at your door
function st37Deer(){return st37Cv(150,104,(P,g)=>{
  const D=['#2a1a10','#3e2a18','#523a22','#6a4c2e','#84603a'];for(let y=0;y<104;y++)for(let x=0;x<150;x++){const rut=Math.abs(y-24-x*.06)<2.5||Math.abs(y-82-x*.06)<2.5;P(x,y,1,1,rut?D[1]:st37H(x>>2,y>>2)<12?D[3]:D[2]);}
  for(let i=0;i<26;i++){const x=(st37H(i,3)*1.5|0)%148,y=st37H(3,i)%102;P(x,y,2,1,D[4]);P(x+1,y+1,1,1,D[1]);}   // grit in small clusters
  const cx=80,cy=50,oc='#2a160c';
  // the barrel of the body: rump high on the right, chest narrower on the left
  const half=x=>{const u=(x-cx)/26;if(Math.abs(u)>1)return 0;return (10+3*Math.max(0,u))*Math.sqrt(1-u*u);};
  for(let x=cx-27;x<=cx+27;x++){const h=half(x);if(h<=0)continue;for(let y=Math.round(cy-h);y<=Math.round(cy+h*.85);y++){const v=(y-(cy-h))/(h*1.85);P(x,y,1,1,v<.14?'#c8945e':v<.55?'#a87a4a':v<.8?'#8e6438':'#e2d4b8');}
    P(x,Math.round(cy-h)-1,1,1,oc);P(x,Math.round(cy+h*.85)+1,1,1,oc);}
  for(const [x0,y0] of [[cx-27,cy],[cx+27,cy]])P(x0,y0-6,1,12,oc);
  // the open flank: dark, wet, three pale ribs
  for(let y=cy-6;y<cy+2;y++)for(let x=cx-4;x<cx+10;x++){const e=((x-cx-3)/7)**2+((y-cy+2)/4)**2;if(e<1)P(x,y,1,1,e>.6?'#5a0e0a':'#8a1a14');}
  for(const k of [0,4,8])for(let t=0;t<5;t++)P(cx-2+k+(t>2?1:0),cy-5+t,1,1,'#efe2c8');
  // the white tail tuft
  P(cx+27,cy-7,4,4,oc);P(cx+28,cy-6,2,2,'#f4ecdc');
  // the neck, stretched out flat to the left, and the head: long, a dark nose, an eye open, the ears back
  for(let i=0;i<16;i++){const x=cx-27-i,y=cy-4-Math.round(i*.25),w=6-Math.round(i*.06);P(x,y-1,1,w+2,oc);P(x,y,1,w,i%5?'#a87a4a':'#8e6438');P(x,y,1,1,'#c8945e');}
  const hx=cx-50,hy=cy-10;P(hx-1,hy-1,13,8,oc);for(let x=0;x<11;x++)for(let y=0;y<6;y++){if((x<2&&(y<1||y>4)))continue;P(hx+x,hy+y,1,1,y<2?'#c8945e':'#a87a4a');}
  P(hx-1,hy+1,3,3,'#141010');P(hx+6,hy+1,2,2,'#141010');P(hx+6,hy+1,1,1,'#f0e8dc');P(hx+4,hy+5,6,1,'#e2d4b8');
  for(const [ex,ey] of [[hx+9,hy-5],[hx+12,hy-4]]){P(ex-1,ey-1,4,7,oc);P(ex,ey,2,5,'#a87a4a');P(ex,ey+1,1,3,'#d8a8a0');}
  // the legs: long, thin, out from the belly, a bend at each knee and hock, black hooves
  const leg=(pts)=>{for(let s=1;s<pts.length;s++){const [a,b]=pts[s-1],[c,d]=pts[s];const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);P(x-1,y-1,4,4,oc);}}
    for(let s=1;s<pts.length;s++){const [a,b]=pts[s-1],[c,d]=pts[s];const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);P(x,y,2,2,'#8e6438');P(x,y,1,1,'#b08050');}}
    const [lx,ly]=pts[pts.length-1];P(lx-1,ly,4,3,'#100c0c');};
  leg([[cx-18,cy+8],[cx-26,cy+18],[cx-22,cy+28]]);leg([[cx-12,cy+9],[cx-14,cy+20],[cx-8,cy+30]]);
  leg([[cx+14,cy+10],[cx+22,cy+16],[cx+20,cy+30]]);leg([[cx+20,cy+9],[cx+32,cy+14],[cx+36,cy+26]]);
  // the clock: twelve pieces at the hours, each its own shape, a pale rind of fat on one edge
  for(let h=0;h<12;h++){const a=h/12*Math.PI*2-Math.PI/2,x=Math.round(cx-4+Math.cos(a)*56),y=Math.round(cy+4+Math.sin(a)*42);const w=3+st37H(h,2)%3,hh=2+st37H(2,h)%2+(h%3===0?1:0);
    P(x-1,y-1,w+2,hh+2,'#2a0806');P(x,y,w,hh,h%2?'#8a1c14':'#a8322a');P(x,y,w,1,'#e8d8c0');P(x+w-1,y+hh-1,1,1,'#3a0606');P(x+1,y+hh+1,w,1,'#4a2a18');}
  // the hand: a peeled stick from the middle, pointing up and left to the door; the hub is a stone
  for(let i=0;i<34;i++){const x=Math.round(cx-6-i*.86),y=Math.round(cy+2-i*.66);P(x,y,2,2,'#2a1a10');P(x,y,1,1,'#d8c098');}
  P(cx-8,cy,6,5,'#1a1210');P(cx-7,cy+1,4,3,'#7a7880');P(cx-7,cy+1,2,1,'#a8a6ae');});}
// the slip from the hat: your name, in Grandpa's hand, spelled his way
function st37OldSpell(n){n=String(n||'').trim();if(!n)return 'MARSHE';const u=n.toUpperCase();const i=u.lastIndexOf('I');if(i>0)return u.slice(0,i)+'Y'+u.slice(i+1);if(/[AEIOU]$/.test(u))return u.slice(0,-1)+'E';return u+'E';}
function st37Slip(){return st37Cv(150,104,(P,g)=>{for(let y=0;y<104;y++)for(let x=0;x<150;x++)P(x,y,1,1,'#120e0c');
  // a hand at the bottom, holding the slip up into the lamp light
  P(52,74,46,30,'#0e0b0c');P(54,76,42,28,'#8a6450');P(54,76,42,3,'#a07a62');for(const fx of [58,68,78])P(fx,72,7,10,'#0e0b0c'),P(fx+1,73,5,8,'#a07a62');
  // the slip: torn at the top, folded once, yellowed, its corner curled
  const X0=26,Y0=20,X1=124,Y1=70;P(X0-1,Y0-1,X1-X0+2,Y1-Y0+2,'#0e0b0c');
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){if(y<Y0+3&&st37H(x,7)%3===0&&y<Y0+1+st37H(x,8)%3)continue;let c=x<75?'#e8dcc0':'#dcd0b2';if(y===Y0+24)c='#b8a888';if(y===Y0+25)c='#f2e8d0';
    if(st37H(x>>1,y>>1)<2)c='#c8b48a';P(x,y,1,1,c);}
  P(X1-7,Y0,7,7,'#c8bca0');for(let k=0;k<6;k++)P(X1-7+k,Y0+6-k,1,1,'#8a7a5a');
  // the name, in iron-gall ink, slanted the old way
  const nm=st37OldSpell(NAME());let x=X0+8,len=nm.length;const sc=len>7?1:2;const ink='#2a1c24';
  for(let i=0;i<nm.length;i++){const ch=nm[i],f=(typeof PXFONT!=='undefined'&&PXFONT[ch])||null;if(!f){x+=4*sc;continue;}
    for(let j=0;j<5;j++)for(let k=0;k<3;k++)if(f[j*3+k]==='1')P(x+k*sc+Math.round((4-j)*.6*sc/2),Y0+30+j*sc+(i%2),sc,sc,ink);x+=4*sc+1;}
  for(let i=0;i<nm.length*4*sc;i+=2)P(X0+8+i,Y0+30+5*sc+2,1,1,'#4a3a44');   // the pen's underline, broken
  st37Txt(P,'1874',X1-22,Y1-8,'#8a7a6a');});}
// Tobias's drawing: crayon on lined paper, the town in a row of round heads, the tall black figure behind with an orange head, and a second small face under it
function st37Crayon(){return st37Cv(150,104,(P,g)=>{for(let y=0;y<104;y++)for(let x=0;x<150;x++)P(x,y,1,1,(y-8)%10===0?'#c8d0dc':'#f0ead8');
  for(let y=0;y<104;y++)P(14,y,1,1,'#e8a8a8');
  const stroke=(pts,col,w)=>{for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);if(st37H(x,y)%6===0)continue;P(x,y,w||2,w||2,col);}}};
  // the church, small, crooked
  stroke([[20,88],[20,66],[44,66],[44,88]],'#7a5a3a');stroke([[18,66],[32,52],[46,66]],'#7a5a3a');stroke([[32,52],[32,42]],'#7a5a3a');stroke([[28,46],[36,46]],'#7a5a3a');
  // the town: little round heads in a row, every one smiling
  for(let i=0;i<9;i++){const x=54+i*9,y=82+(i%2);const col=['#c84a3a','#3a6ac8','#4aa04a','#c89a3a','#8a4ac8'][i%5];for(let a=0;a<6.28;a+=.5)P(Math.round(x+Math.cos(a)*3),Math.round(y+Math.sin(a)*3),1,1,'#3a2a20');
    P(x-1,y,1,1,'#3a2a20');P(x+1,y,1,1,'#3a2a20');stroke([[x,y+4],[x,y+12]],col);}
  // the tall man behind them all, taller than the church: black, stick arms, an orange circle for a head
  stroke([[112,92],[112,30]],'#16141a',3);stroke([[112,44],[94,58]],'#16141a',2);stroke([[112,44],[132,56]],'#16141a',2);stroke([[112,92],[104,100]],'#16141a',2);stroke([[112,92],[120,100]],'#16141a',2);
  for(let a=0;a<6.28;a+=.15){P(Math.round(112+Math.cos(a)*11),Math.round(20+Math.sin(a)*10),2,2,'#e8701a');}for(let k=0;k<30;k++)P(104+st37H(k,1)%16,13+st37H(1,k)%14,1,1,'#f0903a');
  P(108,17,2,2,'#16141a');P(115,17,2,2,'#16141a');for(let x=107;x<118;x+=2)P(x,24,1,1,'#16141a');
  // under the orange head, small and careful, in pencil: your face
  P(108,31,9,8,'#f0ead8');for(let a=0;a<6.28;a+=.4)P(Math.round(112+Math.cos(a)*4),Math.round(35+Math.sin(a)*3.4),1,1,'#5a5a64');P(110,34,1,1,'#3a3a44');P(114,34,1,1,'#3a3a44');P(111,37,3,1,'#5a5a64');
  for(let k=0;k<5;k++)P(108+k*2,30+(k%2),2,1,(S.look&&S.look.hair)||'#6a4224');});}
// the Tithe House's step: shaped shoes, toes in, not barrels
{const _pt=SGT_ART.p_tithe;SGT_ART.p_tithe=()=>{const c=_pt();if(c._st37)return c;c._st37=1;const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  P(60,86,40,7,'#0e0c0c');P(61,87,38,5,'#7a7880');P(61,87,38,1,'#a8a6ae');
  const shoe=(x,y,d)=>{const fx=k=>d>0?x+k:x+10-k;P(Math.min(fx(0),fx(10))-1,y-1,13,8,'#0e0b0c');
    for(let yy=0;yy<6;yy++)for(let xx=0;xx<11;xx++){if((yy===0&&(xx<1||xx>7))||(yy===5&&(xx<1||xx>7))||(xx===10&&(yy<2||yy>3)))continue;let col=xx<3?'#5a3824':xx<7?'#6e4a2e':'#86603a';if(yy===0)col='#9a7448';if(yy===5)col='#2e1c12';P(fx(xx),y+yy,1,1,col);}
    P(fx(1),y+1,4,2,'#140c08');P(fx(5),y+1,1,1,'#e0d4bc');P(fx(6),y+2,1,1,'#e0d4bc');P(fx(6),y+3,1,1,'#e0d4bc');};
  shoe(66,80,1);shoe(83,80,-1);return c;};}
SGT_ART.well=st37Well;SGT_ART.deer37=st37Deer;try{SGT_BEATS.deer={art:'deer37',fx:{flies:5}};}catch(e){}
// Tobias's drawing comes up close; his one line is said, not told
{const _ps=playScene;playScene=function(id,title,html,done){if(id==='tobias'&&title==='The drawing'&&typeof sgtOpen==='function'){const n=npcById('tobias')||P;
    sgtOpen({x:n.x,z:n.z},st37Crayon(),'Under the orange head, small and careful, in pencil, he has drawn a second face. Yours.',{},()=>{
      _ps('tobias','The drawing',`<q>That’s just how it looks.</q>`,done);});return;}
  return _ps.apply(this,arguments);};}
// the drawing: the slip comes up close, your name in Grandpa's hand; then the church turns round to look at you
{const _s=stage;stage=function(def){try{const bs=def&&def.beats;const i=bs?bs.findIndex(b=>b&&typeof b.text==='string'&&/spelled the way Grandpa spelled it/.test(b.text)):-1;
    if(i>=0){bs[i]={hold:9999,act(st){const me=st;setTimeout(()=>{sgtOpen({x:P.x,z:P.z},st37Slip(),'Spelled the way Grandpa spelled it. Not the way you spell it. Somehow more right.',{},()=>{
          // the church turns: everyone in the pews looks round at you at once
          try{for(const [id,c] of Object.entries(me.def.cast||{})){if(id==='hale')continue;const n=npcById(id);if(n)n.dir='S';}for(const id of Object.keys(me.def.cast||{}))if(id!=='hale'&&Math.random()<.4)stgEmote(id,'!',1.4);}catch(e){}
          if(STG===me)setTimeout(()=>{if(STG===me&&me.i===i)stgBeat(i+1);},1200);});},500);}};
      // pin the player to the empty seat for the whole scene
      const _t=def.tick;def.tick=function(dt,st){if(st.i>=4&&P.clip==='sit'&&def._seat37){P.x=def._seat37.x;P.z=def._seat37.z;}else if(st.i>=4&&P.clip==='sit')def._seat37={x:P.x,z:P.z};return _t&&_t.apply(this,arguments);};}}catch(e){}
  return _s.apply(this,arguments);};}
// ---- the rough close-ups, redrawn to the standard of the fen and the lookout
const st37Line=(P,pts,col,w)=>{for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(1,Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++)P(Math.round(a+(c-a)*k/n),Math.round(b+(d-b)*k/n),w||1,w||1,col);}};
// the quarry face: a person-shaped hollow, scratched from the inside, three fingernails still in the stone
function st37Quarry(){return st37Cv(130,104,(P)=>{
  for(let y=0;y<104;y++)for(let x=0;x<130;x++){const band=Math.floor((y+Math.sin(x*.08)*3)/9);let c=['#6a6670','#5e5a64','#727078','#56525c'][band%4];if((y+Math.round(Math.sin(x*.08)*3))%9===0)c='#3a3840';if(x<20)c=band%2?'#7a7880':'#86848c';if(x>112)c='#4a4650';P(x,y,1,1,c);}
  for(const [x,y,l] of [[30,14,20],[96,40,16],[22,70,14],[104,82,18]])st37Line(P,[[x,y],[x+l*.4,y+l*.5],[x+l*.3,y+l]],'#2e2c34');   // cracks
  // the hollow: head, shoulders, arms up as if pushing, legs; cut deep, darkest at the top where the light can't reach
  const hollow=(x,y)=>{const head=((x-64)/7)**2+((y-26)/8)**2<1;const body=x>50&&x<78&&y>33&&y<70;const armL=Math.abs((x-44)-(y-40)*.5)<4&&y>20&&y<52;const armR=Math.abs((x-84)+(y-40)*.5)<4&&y>20&&y<52;
    const legL=x>52&&x<62&&y>=70&&y<98;const legR=x>66&&x<76&&y>=70&&y<98;return head||body||armL||armR||legL||legR;};
  for(let y=6;y<100;y++)for(let x=30;x<100;x++){if(!hollow(x,y))continue;const edge=!hollow(x-1,y)||!hollow(x+1,y)||!hollow(x,y-1);P(x,y,1,1,edge?'#26242a':y<40?'#120f14':'#1c1a20');if(!hollow(x,y-1))P(x,y,1,1,'#0c0a0e');if(!hollow(x,y+1))P(x,y,1,1,'#4a4852');}
  // scratches from the inside: pale gouges at the rim, in fours, where fingers dragged
  for(const [x,y,dx,dy] of [[46,24,-5,-4],[84,24,5,-4],[40,46,-6,1],[88,46,6,1],[56,40,-4,3],[74,40,4,3],[60,92,-3,4],[70,92,3,4],[64,16,0,-5]])
    for(let f=0;f<4;f++){const ox=f*(dy?1:0),oy=f*(dx?1:0);st37Line(P,[[x+ox,y+oy],[x+ox+dx,y+oy+dy]],'#b8b4bc');st37Line(P,[[x+ox+1,y+oy+1],[x+ox+dx+1,y+oy+dy+1]],'#3a3840');}
  // three fingernails, torn off and left in the stone at the reach of the right hand
  for(const [x,y] of [[90,20],[93,24],[88,27]]){P(x-1,y-1,5,4,'#2a1418');P(x,y,3,2,'#e8a0a0');P(x,y,3,1,'#f8d8d0');P(x+1,y+2,1,1,'#7a1a18');}});}
// the bitten orchard: one bare branch, every apple bitten by a child, each its own shape, a milk tooth left in the lowest
function st37Orchard(){return st37Cv(130,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<130;x++)P(x,y,1,1,y<60?(st37H(x>>3,y>>3)<20?'#1e2028':'#1a1c24'):'#16181e');
  const B='#2e2018',BL='#5a4430';st37Line(P,[[0,18],[30,22],[62,16],[96,24],[130,20]],B,3);st37Line(P,[[0,18],[30,22],[62,16],[96,24],[130,20]],BL,1);
  for(const tw of [[[24,22],[22,34]],[[46,19],[52,40]],[[70,18],[66,30]],[[88,22],[96,52]],[[108,23],[104,36]]])st37Line(P,tw,B,2);
  const apple=(x,y,r,bite,ang,tooth)=>{for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const e=(xx*xx+yy*yy)/(r*r);if(e>1)continue;const bx=xx-Math.cos(ang)*r,by=yy-Math.sin(ang)*r;if(bx*bx+by*by<bite*bite)continue;
      const lit=xx+yy<-r*.4;P(x+xx,y+yy,1,1,e>.8?'#4a0a0a':lit?'#d8423a':xx+yy>r*.6?'#7a1414':'#a82a24');}
    // the bite: pale flesh, a dark scalloped edge of small teeth
    for(let k=0;k<12;k++){const a=ang+Math.PI+(k/11-.5)*2.2,px=Math.round(x+Math.cos(ang)*r+Math.cos(a)*bite),py=Math.round(y+Math.sin(ang)*r+Math.sin(a)*bite);if((px-x)**2+(py-y)**2<=r*r){P(px,py,1,1,k%2?'#e8d8a8':'#b8a070');}}
    P(x-1,y-r-3,1,3,'#3a2a1a');P(x-1,y-r-1,3,1,'#5a8a3a');
    if(tooth){const a=ang,tx=Math.round(x+Math.cos(a)*(r-bite*.6)),ty=Math.round(y+Math.sin(a)*(r-bite*.6));P(tx-1,ty-2,3,4,'#2a2018');P(tx,ty-1,1,2,'#fffaf0');}};
  apple(22,40,6,3,-.4,0);apple(52,46,5,3,.6,0);apple(66,36,6,4,2.4,0);apple(96,60,7,4,-2.5,1);apple(104,42,5,3,1.2,0);});}
// the cold house: two sides of meat on hooks, and between them a shape wrapped in sacking, tied, the size of a woman, her shoes showing
function st37Cold(){return st37Cv(130,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<130;x++)P(x,y,1,1,y<8?'#2a2a32':(x%14===0?'#1a1a20':'#22222a'));
  P(0,6,130,4,'#3a2a20');P(0,6,130,1,'#5a4430');   // the rail
  const hook=x=>{P(x,10,1,5,'#8a8a92');P(x-2,15,2,1,'#8a8a92');P(x-3,13,1,2,'#8a8a92');};
  const side=(x)=>{hook(x);for(let y=16;y<80;y++){const t=(y-16)/64,h=Math.round(5+10*Math.sin(Math.min(1,t*1.25)*Math.PI*.8));for(let xx=-h;xx<=h;xx++){const u=(xx+h)/(2*h);P(x+xx,y,1,1,Math.abs(xx)===h?'#3a1010':u<.3?'#d88a80':u<.7?'#b85a50':'#8a3a34');}}
    for(let k=0;k<5;k++){const y=34+k*8;st37Line(P,[[x-8,y],[x+2,y+4]],'#f0dcd0');}};
  side(22);side(108);
  // the bundle: sacking over shoulders and a head, rope at the neck, waist and knees, the toes of two black shoes below
  hook(65);for(let y=16;y<90;y++){const t=(y-16)/74;let h=y<26?Math.round(4+Math.sin((y-16)/10*Math.PI)*2):y<34?6+Math.round((y-26)*.9):14-Math.round(t*5);
    for(let xx=-h;xx<=h;xx++){const u=(xx+h)/(2*h);let c=u<.25?'#a8946a':u<.7?'#8a7650':'#6a5838';if((y*3+xx*5)%11===0)c='#5a4a30';if(Math.abs(xx)===h)c='#2a2018';P(65+xx,y,1,1,c);}}
  for(const y of [27,52,72]){P(56,y,19,2,'#3a2a14');P(56,y,19,1,'#8a6a3a');}
  P(60,90,4,3,'#0e0c0c');P(66,90,4,3,'#0e0c0c');P(60,90,2,1,'#3a3a44');P(66,90,2,1,'#3a3a44');
  for(const [x,y] of [[20,84],[108,86],[34,96]]){P(x,y,2,3,'#5a0a08');P(x,y+3,1,1,'#7a1210');}});}   // drips on the floor
// Ida's pantry: real jars, each with what it holds, labelled by year; the last one empty with this year on it
function st37Jars(){return st37Cv(150,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<150;x++)P(x,y,1,1,'#2a1c14');
  for(const sy of [48,96]){P(0,sy,150,5,'#5a3a22');P(0,sy,150,1,'#8a6040');P(0,sy+5,150,2,'#1a100a');}
  const jar=(x,y,w,h,fill,label,kind)=>{P(x-1,y-1,w+2,h+2,'#0e0b0c');P(x+2,y-4,w-4,4,'#6a6a72');P(x+2,y-4,w-4,1,'#9a9aa2');
    for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const rim=yy<3&&(xx<2||xx>w-3);if(rim)continue;let c=yy<h-fill?'#3a3e44':kind==='eye'?'#6a7a5a':'#7a6a5a';if(xx===1)c='#9aa0a8';P(x+xx,y+yy,1,1,c);}
    if(kind==='teeth')for(let k=0;k<6;k++)P(x+2+(k*3)%(w-4),y+h-4-(k%3)*2,2,2,'#f0ead8');
    if(kind==='eye')for(const [ex,ey] of [[3,h-8],[w-7,h-12]]){P(x+ex,y+ey,4,4,'#e8e4dc');P(x+ex+1,y+ey+1,2,2,'#4a6a8a');P(x+ex+1,y+ey+1,1,1,'#101014');}
    P(x+2,y+5,w-4,7,'#e8dcc0');P(x+2,y+5,w-4,1,'#fff6e0');st37Txt(P,label,x+Math.round((w-label.length*4)/2)+1,y+6,'#3a2a1a');P(x+w-3,y+2,1,h-4,'#b8c0c8');};
  jar(10,16,18,28,12,'52','teeth');jar(36,14,20,30,18,'74','eye');jar(64,18,16,26,10,'81','teeth');jar(90,15,18,29,16,'99','eye');
  jar(16,64,18,28,14,'64','eye');jar(42,66,16,26,9,'88','teeth');jar(98,58,26,34,0,"'25",'none');});}
// under the church: rows of small coffins, no two alike, one lid off with names scratched inside; at the end a full-size one with your name on the plate
function st37Crypt(){return st37Cv(168,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<168;x++)P(x,y,1,1,(x+y*2)%16===0?'#1c1a20':'#24222a');
  const cof=(x,y,w,h,col,open)=>{const s=Math.round(w*.3);const sh=(yy)=>{const t=yy/h;return t<.3?Math.round(s+(w/2-s)*(t/.3)):Math.round(w/2-(w/2-s*.7)*((t-.3)/.7));};
    for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++){let c=Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':xx<-hw/3?col[0]:xx<hw/3?col[1]:col[2];if(open&&Math.abs(xx)<hw-1&&yy>0&&yy<h-1)c='#0a0808';P(x+xx,y+yy,1,1,c);}}
    if(open){for(let k=0;k<4;k++)st37Line(P,[[x-2,y+3+k*3],[x+2,y+4+k*3]],'#8a7a6a');}};
  const W=[['#6a4a30','#5a3e28','#46301e'],['#7a5a3a','#6a4c30','#523a24'],['#5a4434','#4a382a','#3a2c20']];
  for(let r=0;r<3;r++)for(let i=0;i<8;i++){const x=10+i*15+(r%2)*6,y=8+r*24;const w=8+st37H(i,r)%3,h=16+st37H(r,i)%5;cof(x,y,w,h,W[(i+r)%3],r===1&&i===2);}
  // the lid that's off, leaning, its underside scratched with names
  P(56,32,10,22,'#0e0b0c');P(57,33,8,20,'#8a6a48');for(let k=0;k<5;k++)st37Line(P,[[58,35+k*4],[63,36+k*4]],'#3a2a1a');
  // the full-size one, new wood, a brass plate
  const nm=(NAME()||'MARSH').toUpperCase().slice(0,7);const bx=140,by=34;cof(bx,by,26,64,['#d0a466','#b8884a','#966a34'],false);
  for(let yy=by+4;yy<by+60;yy+=9)P(bx-6,yy,12,1,'#a87a40');   // new planks, still pale
  const pw=nm.length*4+3;P(bx-Math.ceil(pw/2)-1,by+26,pw+2,10,'#0e0b0c');P(bx-Math.ceil(pw/2),by+27,pw,8,'#d8b050');P(bx-Math.ceil(pw/2),by+27,pw,1,'#f8e090');st37Txt(P,nm,bx-Math.ceil(pw/2)+2,by+29,'#4a3008');});}
SGT_ART.jars=st37Jars;SGT_ART.crypt=st37Crypt;SGT_DRAW.orchard=st37Orchard;SGT_DRAW.quarry=st37Quarry;try{SGT_BEATS.cold={art:'cold37',fx:{drip:1}};SGT_ART.cold37=st37Cold;}catch(e){}

/* ================= the story's big beats, acted out where they happen ================= */
const ST37_FOLK=()=>npcs.filter(n=>n&&n.def&&PEOPLE[n.def.id]).map(n=>n.def.id);
// ---- Tithe night: the whole valley round the house, backs to you, the scarecrow among them; then the choice
{const _sc=stChoice;stChoice=function(){const st=S.st;if(st.tn37==S.day||STG){const r=_sc.apply(this,arguments);st37TrimChoice();return r;}st.tn37=S.day;
  const D=TITHE_DOOR,ids=ST37_FOLK().filter(id=>id!=='hollow').slice(0,22);const cast={};const pos=[];
  for(let r=0;r<3;r++){const n=[6,8,9][r];for(let i=0;i<n;i++){const a=(i/(n-1)-.5)*(1.6+r*.25);pos.push([D.x+Math.sin(a)*(2.2+r*1.1),D.z+1.3+r*1.0+Math.cos(a)*.3]);}}
  ids.forEach((id,i)=>{const p=pos[i+(i>=9?1:0)];if(p)cast[id]={x:p[0],z:p[1],dir:'N'};});
  const sp=pos[9]||[D.x+.6,D.z+2.4];   // the scarecrow stands in the middle row, one of them
  stage({hour:Math.max(S.hour,22),keepHour:true,player:{x:D.x,z:D.z+5.2,dir:'N'},cast,cam:{x:D.x,z:D.z+3.4},lead:900,
    props:[{x:sp[0],z:sp[1],draw(X,Y,t){shadow(X,Y,8);drawSpr('scarecrow',X,Y,'idle','S',0);}},
      {x:TITHE.x,z:TITHE.z-1.49,draw(X,Y,t){const x=Math.round(X)+12,y=Math.round(Y)-61;ctx2.fillStyle='#000000';ctx2.fillRect(x,y,2,50);ctx2.fillStyle='rgba(150,200,255,.35)';ctx2.fillRect(x+2,y,1,50);   // the door, open an inch
        const b=(Math.sin(t*1.7)+1)/2;for(let i=0;i<4;i++){const r=2+i+Math.round(b*3),a=(.34-i*.07)*b;if(a<=0)continue;ctx2.fillStyle=`rgba(226,232,242,${a.toFixed(3)})`;ctx2.fillRect(x+3+i*4+Math.round(b*4),y+22-r+i,r*2,r);}}}],   // its breath, in and out
    beats:[{hold:1.6},{hold:1.2,cam:{x:D.x,z:D.z+2.2},camSpeed:.8},{hold:3.2}],
    done(){_sc();st37TrimChoice();}});};}
function st37TrimChoice(){try{const p=$('noteText').querySelector('p');if(p&&/ring of stones is full of people/.test(p.textContent))p.textContent='Nobody turns around.';}catch(e){}}
// ---- the morning the woods take one: Hale and a dozen of them walk up to your door; three stand apart; you choose by pointing
dkExileAsk=function(){const c=dkExileCands();if(!c.length)return;const d=doorPos;
  const others=ST37_FOLK().filter(id=>id!=='hale'&&!c.includes(id)&&id!==(typeof dkTaken==='function'?dkTaken():null)&&id!==(typeof sgPartner==='function'?sgPartner():null)).slice(0,9);
  const cast={hale:{x:d.x+.3,z:d.z+9,dir:'N'}};const go={hale:[d.x+.3,d.z+2.6]};   /* r4: the crowd in front of the door again, Hale a clear step off the player's feet */
  others.forEach((id,i)=>{const row=i<5?0:1,k=row?i-5:i;const x=d.x-2.5+k*1.2+(row?.6:0),z=d.z+3.8+row*1.3+(k%2)*.2;cast[id]={x:x+(i%2?.4:-.4),z:z+7,dir:'N'};go[id]=[x,z];});
  c.forEach((id,i)=>{const x=d.x+5.4+i*1.2,z=d.z+2.6+(i%2)*.5;cast[id]={x:x+1,z:z+7,dir:'N'};go[id]=[x,z];});
  let picked=null;const pickAt=(cx,cy)=>{const cv=$('c');if(!cv)return null;const R=cv.getBoundingClientRect(),k=R.width/VW;const X=(cx-R.left)/k,Y=(cy-R.top)/k;
    let best=null,bd=1e9;for(const id of c){const n=npcById(id);if(!n)continue;const nx=sx(n.x),ny=sz(n.z)-20;const dd=Math.hypot(X-nx,Y-ny);if(dd<26&&dd<bd){bd=dd;best=id;}}return best;};
  const onTap=e=>{if(!STG||!STG._pick37)return;const id=pickAt(e.clientX,e.clientY);e.stopPropagation();e.preventDefault();if(!id)return;picked=id;stgEmote(id,'!',1.2);setTimeout(()=>{if(STG)stgNext();},700);};
  const keys=e=>{if(!STG||!STG._pick37)return;const k=+e.key;if(k>=1&&k<=c.length){picked=c[k-1];stgEmote(picked,'!',1.2);e.stopPropagation();setTimeout(()=>{if(STG)stgNext();},700);}};
  $('stgTap').addEventListener('pointerdown',onTap,true);addEventListener('keydown',keys,true);
  stage({hour:9,keepHour:true,player:{x:d.x,z:d.z+.9,dir:'S'},cast,cam:{x:d.x+.6,z:d.z+3.2},lead:700,
    beats:[{go,face:Object.fromEntries([...Object.keys(go)].map(id=>[id,'N'])),wait:'arrive',hold:.4},
      {who:'hale',text:'Before a drawing, one of us walks into the woods. So the drawing is fair.',expr:'sad'},
      {who:'hale',text:'This year it’s yours to say who. The Tithe always chooses who chooses.',expr:'neutral',act(){for(const id of c)stgEmote(id,'?',2.4);}},
      {text:`Point at the one who goes. (${c.map((id,i)=>`${i+1} ${npcById(id).def.name.split(' ')[0]}`).join(' · ')}.) Or say nothing.`,act(st){st._pick37=1;ST37.tags=c.map((id,i)=>({id,t:(i+1)+' '+npcById(id).def.name.split(' ')[0].toUpperCase()}));}}],
    done(){ST37.tags=null;$('stgTap').removeEventListener('pointerdown',onTap,true);removeEventListener('keydown',keys,true);dkExileFor(picked,true);}});};
// ---- her door, when she's been taken: open in the world, her shoes by the mat, the marks going out across the grass
function st37Doorway(w){return st37Cv(w,44,(P)=>{P(0,0,w,44,'#060405');P(1,1,w-2,43,'#020102');   // the doorway, black inside, the lamp burned down
  const lw=Math.round(w*.28);P(1,1,lw,43,'#3a2618');P(1,1,lw,1,'#5a3e26');for(let y=5;y<42;y+=7)P(2,y,lw-2,1,'#2a1a10');P(lw,1,2,43,'#d8aa66');P(lw+1,1,1,43,'#f4cc8c');P(3,21,2,2,'#c8a040');   // the door, swung in: its face in shadow, its edge catching the day
  P(w-6,22,2,2,'#c8a040');});}
function st37Mat(){return st37Cv(24,9,(P)=>{P(0,3,24,6,'#0e0b0c');P(1,4,22,4,'#6a4a2c');P(1,4,22,1,'#8a6440');for(let x=2;x<22;x+=3)P(x,5,1,2,'#4a3220');
  for(const [x,d] of [[5,1],[13,-1]]){P(x-1,0,8,6,'#0e0b0c');P(x,1,6,4,'#7a3a3a');P(x+(d>0?3:0),1,3,4,'#9a5048');P(x+(d>0?0:3),2,2,1,'#1a0c0c');P(x+(d>0?4:1),1,1,1,'#e8d8c8');}});}
setInterval(()=>{try{const t=typeof dkTaken==='function'&&dkTaken();const d=typeof DK==='function'&&DK();const p=t&&!d.freed&&dkHomeDoor(t);
    if(p&&!ST37.door){const o=OBJ.filter(q=>q.kind==='bld'&&!q.hide&&Math.abs(q.x-p.x)<7&&Math.abs(q.z-p.z)<4).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];const m=o&&SPR[o.spr];
      if(o&&m&&m.door_w){const w=Math.max(16,m.door_w-4),dx=(m.door_dx||0)/PPM*(o.flip?-1:1);st37Reg('st37_hdoor',st37Doorway(w),w/2,44+7);st37Reg('st37_hmat',st37Mat(),12,8);
        ST37.door=[obj('st37_hdoor',o.x+dx,o.z+.02,{kind:'prop',noCol:true}),obj('st37_hmat',o.x+dx,o.z+.86,{kind:'prop',noCol:true})];}}
    if(ST37.door)for(const q of ST37.door)q.hide=!p||!!d.freed;}catch(e){}},1200);
{const _on=openNote;openNote=function(html){try{if(typeof html==='string'&&/’s door<\/h3><p>The door is open and the lamp is burned down/.test(html))
      html=html.replace(/<p>The door is open and the lamp[^<]*<\/p><p>On the hall floor,[^<]*<\/p>/,'<p>On the doorframe, at hand height, four lines scratched into the paint. One nail is still in the wood.</p>');}catch(e){}
  arguments[0]=html;return _on.apply(this,arguments);};}
// ---- found: she sags forward, you catch her, one line in her own voice; the organ is the caption strip's
{const _ps=playScene;playScene=function(id,title,html,done){if(title==='Found'&&S.room==='undercroft'&&!STG){const n=npcById(id);if(n){
      const m=/I’m not letting go of you again\.[^<]*?(?=<\/q>)/.exec(html);const line=m?m[0].split('.').slice(0,2).join('.')+'.':'I’m not letting go of you again.';
      const ax=n.x,az=n.z,ux=1,uz=0;
      stage({room:'undercroft',show:true,player:{x:ax+ux*1.4,z:az+uz*1.4,dir:dirOf(-ux,-uz)},cast:{[id]:{x:ax,z:az,dir:dirOf(ux,uz)}},cam:{x:ax+ux*.7,z:az+uz*.7},lead:600,
        beats:[{hold:.7},{hold:.5,go:{[id]:[ax+ux*.55,az+uz*.55]},speed:{[id]:2.4},emote:{[id]:'…'}},
          {hold:1.4,go:{you:[ax+ux*.95,az+uz*.95]},speed:{you:2},emote:{you:'♥'},face:{you:dirOf(-ux,-uz)}},
          {who:id,text:line,expr:'cry'},{hold:1.2}],done});return;}}
  return _ps.apply(this,arguments);};}
// ---- Chapter One's climax: Grandpa's straw hat left in the ash, in your lantern's light (it was drawn as a pumpkin)
{const _d=drawSpr;drawSpr=function(name,x,y){if(name==='pumpkin'&&typeof ritual!=='undefined'&&ritual&&ritual.hat&&typeof stgHat2==='function'&&Math.abs(x-sx(ritual.hat.x))<.5&&Math.abs(y-sz(ritual.hat.z))<.5){
    {const X=Math.round(x),Y=Math.round(y);for(let r=0;r<3;r++){const rx=20-r*5,ry=7-r*2;ctx2.fillStyle=['#4a4644','#6a6662','#8a8682'][r];for(let a=0;a<6.283;a+=.05){const px=Math.round(X+Math.cos(a)*rx),py=Math.round(Y+Math.sin(a)*ry);if(hash(px,py*3)<.55)ctx2.fillRect(px,py,2,1);}}
      ctx2.fillStyle='rgba(20,16,14,.5)';ctx2.fillRect(X-11,Y-1,22,3);for(let i=0;i<9;i++){ctx2.fillStyle=i%2?'#9a9692':'#5a5652';ctx2.fillRect(X-12+i*3,Y+3+(i%2),2,1);}}   // a ring of grey ash, the fire's last shape
    stgHat2(Math.round(x),Math.round(y)-4);return;}return _d.apply(this,arguments);};}

/* ---- r2: the close-ups at viewing scale (176 x 112, one art pixel to one zoom pixel), filled by their subject ---- */
const ST37W=176,ST37H=112;
const st37Dirt=(P,W,H,seed)=>{const D=['#2a1a10','#3a2616','#4a3220','#5a3e28','#6e4e32'];for(let y=0;y<H;y++)for(let x=0;x<W;x++){const n=st37H((x>>3)+seed,(y>>2))%10;P(x,y,1,1,n<2?D[1]:n<7?D[2]:D[3]);}
  for(let i=0;i<60;i++){const x=st37H(i,seed+3)*1.9%W|0,y=st37H(seed+5,i)%H;const w=2+st37H(i,7)%3;P(x,y,w,1,D[4]);P(x,y+1,w,1,D[1]);}};
// the deer, laid out on the track: on its side, legs out sideways, the big ear, the head; twelve chunks at the hours; a stick from the middle to the door at the rim
function st37Deer(){return st37Cv(ST37W,ST37H,(P)=>{st37Dirt(P,ST37W,ST37H,11);
  for(let x=0;x<ST37W;x++){P(x,16+(x>>4)%2,1,2,'#2e1e12');P(x,96+(x>>5)%2,1,2,'#2e1e12');}   // the ruts
  const oc='#1e120a',cx=90,cy=58;
  // body: a barrel lying on its right side; the spine along the top edge, belly pale toward us at the bottom
  for(let x=cx-30;x<=cx+30;x++){const u=(x-cx)/30,h=(9+4*Math.max(0,u)+1.5*Math.max(0,-u-.5))*Math.sqrt(Math.max(0,1-u*u));if(h<=0)continue;const top=Math.round(cy-h),bot=Math.round(cy+h*.9);
    for(let y=top;y<=bot;y++){const v=(y-top)/(bot-top+1);P(x,y,1,1,v<.12?'#caa070':v<.45?'#b0844e':v<.7?'#946a3c':v<.8?'#7a5430':'#e4d8c0');}P(x,top-1,1,1,oc);P(x,bot+1,1,1,oc);}
  for(let k=-6;k<=6;k++){P(cx-31,cy+k,1,1,oc);P(cx+31,cy+k,1,1,oc);}
  // the opened flank: a dark wound, wet at the edge, ribs as arcs (not a row of teeth)
  for(let y=cy-7;y<cy+3;y++)for(let x=cx-6;x<cx+14;x++){const e=((x-cx-4)/10)**2+((y-cy+2)/5)**2;if(e<1)P(x,y,1,1,e>.75?'#5a0c08':e>.4?'#7a140e':'#4a0806');}
  for(const r of [0,5,10]){for(let t=0;t<7;t++){const x=cx-3+r+Math.round(t*.4),y=cy-6+t;if(((x-cx-4)/10)**2+((y-cy+2)/5)**2<.9)P(x,y,1,1,t<2?'#f4e8d0':'#d8c8b0');}}
  P(cx+31,cy-9,4,4,oc);P(cx+32,cy-8,2,2,'#f6eee0');   // the white scut
  // the neck stretched out flat, the head: long muzzle, dark nose, eye open, one big ear up
  for(let i=0;i<18;i++){const x=cx-31-i,y=cy-5-Math.round(i*.35),w=7-Math.round(i*.05);P(x,y-1,1,1,oc);P(x,y+w,1,1,oc);for(let k=0;k<w;k++)P(x,y+k,1,1,k<2?'#c09060':k<5?'#a87a48':'#e4d8c0');}
  const hx=cx-62,hy=cy-14;for(let y=0;y<9;y++)for(let x=0;x<15;x++){if(x<3&&(y<2||y>6))continue;if(x<1&&(y<3||y>5))continue;P(hx+x,hy+y,1,1,y<3?'#c89a68':y<6?'#a87a48':'#d8c8a8');}
  for(let x=-1;x<16;x++){P(hx+x,hy-1,1,1,oc);P(hx+x,hy+9,1,1,oc);}P(hx-1,hy+2,2,4,'#141010');P(hx,hy+3,1,1,'#3a3030');P(hx+8,hy+2,3,2,'#141010');P(hx+8,hy+2,1,1,'#f0e8dc');
  for(let i=0;i<10;i++){const ex=hx+11+Math.round(i*.5),ey=hy-1-i;P(ex-1,ey,5,1,oc);P(ex,ey,3,1,i<2?'#a87a48':'#c08a5a');if(i>1&&i<8)P(ex+1,ey,1,1,'#e0a8a0');}   // the ear
  // the legs, out sideways from the belly: thin, a knee, a hock, black hooves
  const leg=(pts)=>{for(let s=1;s<pts.length;s++){const [a,b]=pts[s-1],[c,d]=pts[s];const n=Math.max(1,Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);P(x-1,y-1,4,4,oc);}}
    for(let s=1;s<pts.length;s++){const [a,b]=pts[s-1],[c,d]=pts[s];const n=Math.max(1,Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);P(x,y,2,2,'#946a3c');P(x,y,1,1,'#b88a54');}}
    const [lx,ly]=pts[pts.length-1];P(lx-1,ly,4,3,'#100c0c');P(lx,ly,2,1,'#3a3434');};
  leg([[cx-20,cy+9],[cx-30,cy+22],[cx-40,cy+30]]);leg([[cx-13,cy+10],[cx-18,cy+24],[cx-24,cy+36]]);
  leg([[cx+15,cy+11],[cx+24,cy+20],[cx+22,cy+36]]);leg([[cx+22,cy+10],[cx+36,cy+16],[cx+44,cy+30]]);
  // twelve chunks at the hours of a clock round it: each its own cut, meat with a pale rind, a dark wet underside
  const R=[66,46];for(let h=0;h<12;h++){const a=h/12*Math.PI*2-Math.PI/2,x=Math.round(cx+Math.cos(a)*R[0]),y=Math.round(cy+Math.sin(a)*R[1]);if(y<4||y>ST37H-6)continue;
    const w=5+st37H(h,2)%3,hh=3+st37H(2,h)%2,sk=st37H(h,9)%3-1;
    for(let yy=0;yy<hh;yy++)for(let xx=0;xx<w;xx++){if((xx===0||xx===w-1)&&(yy===0||yy===hh-1))continue;P(x+xx+(yy===0?sk:0),y+yy,1,1,yy===0?'#ecdcc4':xx<w/2?'#a8322a':'#8a1c14');}
    P(x,y+hh,w,1,'#2a0806');P(x+1,y+hh+1,w-1,1,'#3a2214');}
  // the hand: a peeled stick from the middle to the rim, up and left, toward the door; a stone for the hub
  for(let i=0;i<70;i++){const x=Math.round(cx-6-i*1.18),y=Math.round(cy-4-i*.74);if(x<0||y<0)break;P(x,y,2,2,'#2a1a10');P(x,y,1,1,'#e0c8a0');}
  P(0,0,10,14,'#3a2a1c');P(0,0,10,1,'#6a5038');P(9,0,1,14,'#1a1008');P(1,4,2,2,'#b89040');   // the cabin door's edge at the rim, its handle
  P(cx-9,cy-7,7,6,'#141010');P(cx-8,cy-6,5,4,'#7a7880');P(cx-8,cy-6,3,1,'#a8a6ae');});}
// the quarry face: strata, and a person-shaped recess cut into it, dark on its upper-left inner wall, a lit lip lower right; gouges from inside ending at three nails
function st37Quarry(){return st37Cv(ST37W,ST37H,(P)=>{
  const S=['#5e5a62','#6a666e','#76727a','#565260','#625e68'];for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++){const b=Math.floor((y+Math.round(Math.sin(x*.05)*2))/7);let c=S[b%5];const yy=(y+Math.round(Math.sin(x*.05)*2))%7;
    if(yy===0)c='#3e3a44';else if(yy===1)c='#8a8690';if(x<14)c=yy===0?'#4a4650':'#8e8a94';if(x>ST37W-12)c=yy===0?'#2e2a34':'#4e4a54';P(x,y,1,1,c);}
  for(const [x,y,l] of [[24,20,24],[150,30,18],[30,84,16],[160,80,20]])for(let k=0;k<l;k++)P(x+Math.round(Math.sin(k*.4)*2),y+k,1,1,'#2e2a34');
  const cx=88;const fig=(x,y)=>{const head=((x-cx)/8)**2+((y-26)/9)**2<1;const neck=Math.abs(x-cx)<4&&y>=34&&y<38;const body=Math.abs(x-cx)<15-Math.max(0,(y-60)*.2)&&y>=37&&y<78;
    const armL=Math.abs((x-(cx-26))-(y-44)*.55)<4.5&&y>14&&y<62;const armR=Math.abs((x-(cx+26))+(y-44)*.55)<4.5&&y>14&&y<62;const legL=x>cx-12&&x<cx-2&&y>=76&&y<106;const legR=x>cx+2&&x<cx+12&&y>=76&&y<106;
    return head||neck||body||armL||armR||legL||legR;};
  for(let y=4;y<110;y++)for(let x=40;x<140;x++){if(!fig(x,y))continue;const inUL=!fig(x-2,y)||!fig(x,y-2),inLR=!fig(x+2,y)||!fig(x,y+2);
    let c=inUL?'#1a161e':inLR?'#46424e':'#24202a';if(!fig(x-1,y)||!fig(x,y-1))c='#0e0c12';if(!fig(x+1,y)||!fig(x,y+1))c='#9a96a2';P(x,y,1,1,c);}
  // gouges from inside: four fingers dragged outward from the rim, long, pale, each ending where a nail broke off
  const nails=[[cx+40,12],[cx+46,17],[cx+38,20]];
  for(const [i,[nx,ny]] of nails.entries()){const sx0=cx+26-i,sy0=24+i*3;st37Line(P,[[sx0,sy0],[nx,ny]],'#c8c4cc');st37Line(P,[[sx0,sy0+1],[nx,ny+1]],'#3a3640');}
  for(const [x,y,dx,dy] of [[cx-30,22,-10,-6],[cx-34,48,-12,2],[cx-12,104,-6,6],[cx+12,104,6,6]])for(let f=0;f<4;f++){const o=f*2;st37Line(P,[[x,y+o],[x+dx,y+dy+o]],'#b8b4bc');st37Line(P,[[x,y+o+1],[x+dx,y+dy+o+1]],'#3a3640');}
  for(const [nx,ny] of nails){P(nx-1,ny-1,6,4,'#2a1418');P(nx,ny,4,2,'#e8a4a0');P(nx,ny,4,1,'#fbe0d8');P(nx+3,ny+1,1,1,'#c87878');P(nx,ny+2,4,1,'#5a1a18');}});}
// the slip: held up into the light, the thumb over its lower edge, no foxing
function st37Slip(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,(x>>4)%2?'#141010':'#120e0e');
  const X0=30,Y0=16,X1=148,Y1=78;P(X0-1,Y0-1,X1-X0+2,Y1-Y0+2,'#0e0b0c');
  for(let y=Y0;y<Y1;y++)for(let x=X0;x<X1;x++){if(y<Y0+3&&y<Y0+1+st37H(x,8)%3&&st37H(x,7)%3===0)continue;let c=x<88?'#ece0c4':'#dcd0b2';if(y===Y0+30)c='#b8a888';if(y===Y0+31)c='#f4ead2';P(x,y,1,1,c);}
  P(X1-8,Y0,8,8,'#c8bca0');for(let k=0;k<7;k++)P(X1-8+k,Y0+7-k,1,1,'#8a7a5a');   // the curled corner
  const nm=st37OldSpell(NAME());const sc=nm.length>8?1:2;const ink='#2a1c24';let x=X0+10;
  for(let i=0;i<nm.length;i++){const ch=nm[i],f=(typeof PXFONT!=='undefined'&&PXFONT[ch])||null;if(!f){x+=4*sc;continue;}
    for(let j=0;j<5;j++)for(let k=0;k<3;k++)if(f[j*3+k]==='1')P(x+k*sc+Math.round((4-j)*.6*sc/2),Y0+38+j*sc+(i%2),sc,sc,ink);x+=4*sc+1;}
  for(let i=0;i<nm.length*(4*sc+1)-2;i+=3)P(X0+10+i,Y0+38+5*sc+3,2,1,'#4a3a44');
  st37Txt(P,'1874',X1-24,Y1-9,'#8a7a6a');
  // the hand under it, the thumb pressed over the slip's bottom edge, the fingers behind
  const sk=['#6a4636','#8a6450','#a07a62','#b89078'];P(70,Y1+2,60,40,'#0e0b0c');P(72,Y1+4,56,38,sk[1]);P(72,Y1+4,56,3,sk[2]);
  for(const fx of [80,94,108])P(fx,Y1-2,10,8,'#0e0b0c'),P(fx+1,Y1-1,8,7,sk[1]),P(fx+1,Y1-1,8,1,sk[3]);   // fingertips showing past the bottom edge
  P(58,Y1-12,18,22,'#0e0b0c');P(59,Y1-11,16,20,sk[2]);P(60,Y1-11,7,2,sk[3]);P(61,Y1-9,5,4,'#c8a898');P(59,Y1+7,16,2,sk[0]);});}   // the thumb, on the paper, its nail
// the well: the braid in your hair's own colour, a child's tooth (white crown, root) tied in with dark thread, the tag on a wire from the hoop
{const _w=st37Well;st37Well=function(){const c=_w();const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};const bx=74;
  P(bx+2,56,10,12,'#1c1c22');   // clear the old tooth
  P(bx+4,57,6,9,'#0e0b0c');P(bx+5,58,4,4,'#f4eee0');P(bx+5,58,2,1,'#ffffff');P(bx+6,62,2,3,'#d8c8a8');P(bx+6,64,1,1,'#b8a080');P(bx+3,60,8,1,'#2a1418');P(bx+2,61,1,2,'#2a1418');P(bx+11,59,1,3,'#2a1418');
  P(bx+3,43,1,5,'#1c1c22');P(bx+4,47,10,1,'#1c1c22');for(let k=0;k<12;k++)P(80+k,46+(k>>2),1,1,'#9a9aa2');P(86,46,2,2,'#5a5a62');   // the wire from the hoop, a nail
  return c;};SGT_ART.well=st37Well;}
// the Tithe House step, close: shoes twice the size with a strap and buckle, a sole, a shadow, toes turned in; nails of every size; holes right through
{const _pt=SGT_ART.p_tithe;SGT_ART.p_tithe=()=>{const c=_pt();if(c._st37b)return c;c._st37b=1;const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  /* r4: the boards nailed across it as on the house itself: a grey old one slanting at the top, a pale new one, the X, another grey, a pale one; the nails bunched along each board where it meets the frame and where the X crosses; old holes in rows where boards were before */
  {const DX=57,DY=20,DW=48;const board=(x0,y0,x1,y1,t,col,hi,lo)=>{const dx=x1-x0,dy=y1-y0,L2=dx*dx+dy*dy,len=Math.sqrt(L2);
      for(let y=Math.min(y0,y1)-t-2;y<=Math.max(y0,y1)+t+2;y++)for(let x=Math.min(x0,x1)-2;x<=Math.max(x0,x1)+2;x++){const u=((x-x0)*dx+(y-y0)*dy)/L2,v=((x-x0)*dy-(y-y0)*dx)/len;if(u<-.01||u>1.01||Math.abs(v)>t/2+1)continue;
        let c=Math.abs(v)>t/2||u<=0||u>=1?'#0e0b0c':v<-t/2+1.2?hi:v>t/2-1.2?lo:col;if(c===col&&t>4&&st37H(Math.round(u*len/7),Math.round(v))%6===0)c=lo;P(x,y,1,1,c);}};
    const holes=(x0,y0,x1,y1)=>{for(let k=0;k<=8;k++){const x=Math.round(x0+(x1-x0)*k/8),y=Math.round(y0+(y1-y0)*k/8);if(st37H(x,y)%3===0)continue;P(x,y,2,2,'#000000');P(x,y+2,2,1,'#6a5038');}};
    holes(DX+3,DY+11,DX+DW-4,DY+10);holes(DX+3,DY+27,DX+DW-4,DY+25);holes(DX+3,DY+44,DX+DW-4,DY+46);   /* where boards were, the holes right through */
    const B=[[DX-3,DY+8,DX+DW+2,DY+3,6,'#6a6460','#8a847e','#4a4440'],[DX-3,DY+16,DX+DW+2,DY+16,6,'#c49a54','#e4c27e','#9a7438'],[DX-3,DY+32,DX+DW+2,DY+36,6,'#5e5650','#7e766e','#3e3834'],
      [DX+1,DY+23,DX+DW-2,DY+47,4,'#7a6a4e','#9a8a6a','#5a4a34'],[DX+DW-2,DY+23,DX+1,DY+47,4,'#8a7a5a','#a89a78','#5a4a34'],[DX-3,DY+52,DX+DW+2,DY+51,5,'#b48a4c','#d4b070','#8a6838']];
    for(const b of B)board(...b);
    const nail=(x,y)=>{P(x-1,y-1,3,3,'#1a1414');P(x,y,2,2,'#8a8a92');P(x,y,1,1,'#d0d0d8');P(x+1,y+2,1,1+st37H(x,y)%3,'#7a3a1a');};
    for(const [x0,y0,x1,y1,t] of B){if(Math.abs(y1-y0)>12)continue;for(const [ex,ey] of [[x0+4,y0],[x1-5,y1]]){for(let k=0;k<3+st37H(ex,ey)%2;k++)nail(ex+(k%2)*3-1,ey-2+k*2-(k>1?1:0));}
      const mx=(x0+x1)>>1,my=(y0+y1)>>1;nail(mx-2,my-1);nail(mx+1,my);}
    for(const [x,y] of [[DX+DW/2-3,DY+34],[DX+DW/2+1,DY+36],[DX+DW/2-1,DY+33],[DX+4,DY+25],[DX+DW-6,DY+25],[DX+4,DY+45],[DX+DW-6,DY+45]])nail(x,y);}
  P(58,82,44,11,'#0e0c0c');P(59,83,42,9,'#7a7880');P(59,83,42,1,'#a8a6ae');P(59,91,42,1,'#4a4850');
  const shoe=(x,y,d)=>{const fx=k=>d>0?x+k:x+17-k;P(Math.min(fx(0),fx(17))-1,y-1,20,11,'#0e0b0c');
    for(let yy=0;yy<9;yy++)for(let xx=0;xx<18;xx++){const e=((xx-9)/9.2)**2+((yy-4.5)/4.8)**2;if(e>1)continue;let col=xx<5?'#4a2a1c':xx<12?'#6a3e26':'#8a5432';if(yy<2)col='#a06a44';if(yy>6)col='#2e1a10';if(yy===8)col='#e0d4bc';P(fx(xx),y+yy,1,1,col);}
    for(let yy=2;yy<6;yy++)for(let xx=1;xx<7;xx++)if(((xx-4)/3.3)**2+((yy-3.6)/2.2)**2<1)P(fx(xx),y+yy,1,1,'#120a06');   // the opening at the heel
    P(fx(8),y,2,7,'#2a1a10');P(fx(8),y+1,2,2,'#d8b860');P(fx(8),y+1,1,1,'#fff0a0');   // the strap and its buckle
    P(Math.min(fx(1),fx(16)),y+9,16,1,'#3e3c44');P(Math.min(fx(2),fx(15)),y+10,14,1,'#2a2830');};   // the shadow on the slab
  shoe(60,78,1);shoe(81,78,-1);return c;};}
// the orchard: one gnarled branch, short twigs, the apples on them each their own size, colour and bite; the tooth in the lowest
function st37Orchard(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,y<70?((x>>4)+(y>>4))%2?'#1c1e26':'#1a1c24':'#16181e');
  const B='#2a1c14',BL='#5a4430',BM='#3e2c1e';
  const br=[[0,22],[18,26],[34,20],[52,28],[70,24],[92,30],[112,26],[134,32],[156,28],[176,30]];for(let i=1;i<br.length;i++){const [a,b]=br[i-1],[c,d]=br[i];const n=c-a;for(let k=0;k<=n;k++){const y=Math.round(b+(d-b)*k/n),x=a+k,w=5-Math.floor(i/3);P(x,y-1,1,w+2,'#0e0a08');P(x,y,1,w,BM);P(x,y,1,1,BL);if((x+y)%7===0)P(x,y+1,1,1,B);}}
  for(const [x,y] of [[34,20],[70,24],[134,32]])for(let k=0;k<4;k++)P(x-1+k,y-2-(k%2),1,1,'#5a4430');   // knots
  const twig=(x,y,l,dx)=>{for(let k=0;k<l;k++){P(x+Math.round(k*dx),y+k,2,1,'#2a1c14');P(x+Math.round(k*dx),y+k,1,1,'#4a3826');}return [x+Math.round(l*dx),y+l];};
  const apple=(cx,cy,r,col,bite,ang,tooth)=>{const C={red:['#4a0a0a','#7a1414','#a82a24','#d8423a'],dark:['#3a0808','#5a0e0e','#7e1a18','#a83028'],green:['#3a3a10','#5a6a1a','#7a8a2a','#a8b84a'],rot:['#2a1a0a','#4a3014','#6a4a22','#8a6a3a']}[col];
    for(let yy=-r;yy<=r;yy++)for(let xx=-r;xx<=r;xx++){const e=(xx*xx+yy*yy)/(r*r);if(e>1)continue;const bx=xx-Math.cos(ang)*r*.95,by=yy-Math.sin(ang)*r*.95;if(bx*bx+by*by<bite*bite)continue;
      P(cx+xx,cy+yy,1,1,e>.82?C[0]:xx+yy<-r*.7?C[3]:xx+yy>r*.5?C[1]:C[2]);}
    for(let k=0;k<16;k++){const a=ang+Math.PI+(k/15-.5)*2.4,px=Math.round(cx+Math.cos(ang)*r*.95+Math.cos(a)*bite),py=Math.round(cy+Math.sin(ang)*r*.95+Math.sin(a)*bite);if((px-cx)**2+(py-cy)**2<=r*r)P(px,py,1,1,k%2?'#efe0b0':'#c0a874');}   // bite: flesh with tooth scallops
    P(cx-1,cy-r-2,2,3,'#3a2a1a');if(st37H(cx,cy)%2)P(cx+1,cy-r-2,3,2,'#4a6a2a');
    if(tooth){const tx=Math.round(cx+Math.cos(ang)*(r-bite*.5)),ty=Math.round(cy+Math.sin(ang)*(r-bite*.5));P(tx-1,ty-2,4,5,'#1a1410');P(tx,ty-1,2,3,'#fffaf0');P(tx,ty+1,1,1,'#d8c8a8');}};
  let e;e=twig(20,26,10,-.2);apple(e[0],e[1]+6,6,'red',3,-.5,0);
  e=twig(46,26,6,.1);apple(e[0],e[1]+5,5,'dark',3,.7,0);
  e=twig(74,26,16,-.1);apple(e[0],e[1]+7,7,'red',4,2.4,0);
  e=twig(100,30,30,.15);apple(e[0],e[1]+8,8,'red',5,-2.6,1);   // the lowest one, the milk tooth in its bite
  e=twig(122,28,9,.2);apple(e[0],e[1]+5,5,'green',3,1.3,0);
  e=twig(146,31,14,-.1);apple(e[0],e[1]+6,6,'rot',4,-.9,0);
  e=twig(164,30,5,.2);apple(e[0],e[1]+4,4,'dark',2,2,0);});}
SGT_DRAW.orchard=st37Orchard;
// the jars: round eyes with coloured irises at different heights, teeth with crowns and roots, a glint on every jar
{const _j=st37Jars;st37Jars=function(){const c=_j();const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const jars=[[10,16,18,28,12,'teeth'],[36,14,20,30,18,'eye'],[64,18,16,26,10,'teeth'],[90,15,18,29,16,'eye'],[16,64,18,28,14,'eye'],[42,66,16,26,9,'teeth'],[98,58,26,34,0,'none']];
  const iris=['#4a7a9a','#6a8a3a','#7a5a2a','#3a5a8a'];
  for(const [i,[x,y,w,h,fill,kind]] of jars.entries()){
    if(kind==='eye'){for(const [ex,ey,k] of [[3,h-8,0],[w-8,h-13,1],[Math.round(w/2)-2,h-4,2]]){if(ey<h-fill)continue;P(x+ex,y+ey,5,4,'#2a3a24');P(x+ex,y+ey,5,4,'#d8d4cc');P(x+ex+1,y+ey-1,3,1,'#d8d4cc');P(x+ex+1,y+ey+4,3,1,'#b8b4ac');
        P(x+ex+1,y+ey+1,3,2,iris[(i+k)%4]);P(x+ex+2,y+ey+1,1,2,'#0e0c10');P(x+ex+1,y+ey,1,1,'#ffffff');}}
    if(kind==='teeth'){P(x+2,y+h-fill,w-4,fill,'#7a6a5a');for(let k=0;k<5;k++){const tx=x+3+(k*4)%(w-6),ty=y+h-3-(k%3)*3;if(ty<y+h-fill)continue;P(tx,ty-2,3,2,'#f0ead8');P(tx,ty,1,2,'#c8b898');P(tx+2,ty,1,1,'#c8b898');P(tx,ty-2,1,1,'#ffffff');}}
    P(x+w-4,y+3,1,h-6,'#c8d0d8');P(x+w-4,y+3,1,2,'#ffffff');P(x+3,y+h-5,2,1,'#a8b0b8');}   // the glass: a long edge glint, a small one low on the other side
  return c;};SGT_ART.jars=st37Jars;}
// under the church: small coffins no two alike, a third of them open with the lid leaned against them and names scratched inside; the new full-size one at the end
function st37Crypt(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,((x>>3)+(y>>3))%2?'#24222a':'#201e26');
  const shape=(w,h)=>yy=>{const t=yy/h,s=w*.32;return t<.3?Math.round(s+(w/2-s)*(t/.3)):Math.round(w/2-(w/2-s*.75)*((t-.3)/.7));};
  const W=[['#6a4a30','#5a3e28','#46301e'],['#7a5a3a','#6a4c30','#523a24'],['#5a4434','#4a382a','#3a2c20'],['#6e5a42','#5e4a34','#4a3a28']];
  const names=['ANNIE','TOMMY','RUTH','DANNY','MOLLY','ALICE','JO','SAM'];
  const cof=(x,y,w,h,col,open,nm)=>{const sh=shape(w,h);for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++){let c=Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':xx<-hw/3?col[0]:xx<hw/3?col[1]:col[2];
      if(open&&Math.abs(xx)<hw-1&&yy>0&&yy<h-1)c=yy<3?'#1a1210':'#0a0808';P(x+xx,y+yy,1,1,c);}}
    if(open){// the lid leaned against its right side, underside out, a name scratched in it
      const lx=x+Math.ceil(w/2)+2,ly=y-3;for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++)P(lx+xx+Math.round(yy*.15),ly+yy,1,1,Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':'#9a7a58');}
      const L=nm.length;for(let i=0;i<L&&i<4;i++){const f=(typeof PXFONT!=='undefined'&&PXFONT[nm[i]])||null;if(!f)continue;for(let j=0;j<5;j++)for(let k=0;k<3;k++)if(f[j*3+k]==='1')P(lx-1+k+Math.round((3+i*5)*.15),ly+3+i*5+j-(j>2?0:0),1,1,'#3a2414');}}};
  let n=0;for(let r=0;r<3;r++)for(let i=0;i<9;i++){const x=10+i*16+(r%2)*6,y=6+r*30;const w=8+st37H(i,r)%4,h=18+st37H(r,i)%6;const open=(i+r*2)%3===1;if(x>140&&r>0)continue;cof(x,y,w,h,W[(i+r)%4],open,names[(n++)%names.length]);}
  // the full-size one, new wood still pale, a brass plate with your name
  const nm=(NAME()||'MARSH').toUpperCase().slice(0,7);const bx=158,by=40;cof(bx,by,26,66,['#d0a466','#b8884a','#966a34'],false,'');
  for(let yy=by+6;yy<by+62;yy+=9)P(bx-7,yy,14,1,'#a87a40');
  const pw=nm.length*4+3;P(bx-Math.ceil(pw/2)-1,by+27,pw+2,10,'#0e0b0c');P(bx-Math.ceil(pw/2),by+28,pw,8,'#d8b050');P(bx-Math.ceil(pw/2),by+28,pw,1,'#f8e090');st37Txt(P,nm,bx-Math.ceil(pw/2)+2,by+30,'#4a3008');});}
SGT_ART.crypt=st37Crypt;
// the cold house: a side of pork with its trotter and a sheep's carcass, different cuts; between them the sacking bundle; no stray drops
{const _c=st37Cold;st37Cold=function(){return st37Cv(130,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<130;x++)P(x,y,1,1,y<8?'#2a2a32':(x%14===0?'#1a1a20':'#22222a'));
  P(0,6,130,4,'#3a2a20');P(0,6,130,1,'#5a4430');const hook=x=>{P(x,10,1,5,'#8a8a92');P(x-2,15,2,1,'#8a8a92');P(x-3,13,1,2,'#8a8a92');};
  // the side of pork: long, a trotter at the top, rind down one edge, ribs on the cut face
  hook(22);P(20,15,5,7,'#3a1010');P(21,15,3,6,'#d8a8a0');for(let y=22;y<84;y++){const t=(y-22)/62,h=Math.round(6+8*Math.sin(Math.min(1,t*1.15)*Math.PI*.85));for(let xx=-h;xx<=h;xx++){const u=(xx+h)/(2*h);P(22+xx,y,1,1,Math.abs(xx)===h?'#3a1010':u<.18?'#f0d8c8':u<.6?'#c86a5e':'#9a4038');}}
  for(let k=0;k<6;k++){const y=34+k*7;for(let t=0;t<9;t++)P(16+t,y+Math.round(t*.4),1,1,'#f4e4d4');}
  // the sheep: shorter, narrow at the neck, the legs splayed at the top on a gambrel
  hook(108);P(98,15,21,2,'#5a4430');for(const lx of [100,114])for(let y=16;y<28;y++)P(lx+Math.round((y-16)*.2)*(lx<108?1:-1),y,2,1,'#c8a088');
  for(let y=26;y<76;y++){const t=(y-26)/50,h=Math.round(4+9*Math.sin(Math.min(1,t*1.05)*Math.PI));for(let xx=-h;xx<=h;xx++){const u=(xx+h)/(2*h);P(108+xx,y,1,1,Math.abs(xx)===h?'#3a1010':u<.3?'#e8c8b8':u<.7?'#c8988a':'#9a6a5e');}}
  for(let y=76;y<84;y++)P(107,y,3,1,'#9a6a5e');
  // the bundle between them: the size of a woman, sacking over a head and shoulders, rope at the neck, waist and knees, two black shoes below
  hook(65);for(let y=16;y<90;y++){const t=(y-16)/74;let h=y<26?Math.round(4+Math.sin((y-16)/10*Math.PI)*2):y<34?6+Math.round((y-26)*.9):14-Math.round(t*5);
    for(let xx=-h;xx<=h;xx++){const u=(xx+h)/(2*h);let c=u<.25?'#a8946a':u<.7?'#8a7650':'#6a5838';if((y*3+xx*5)%11===0)c='#5a4a30';if(Math.abs(xx)===h)c='#2a2018';P(65+xx,y,1,1,c);}}
  for(const y of [27,52,72]){P(56,y,19,2,'#3a2a14');P(56,y,19,1,'#8a6a3a');}P(60,90,4,3,'#0e0c0c');P(66,90,4,3,'#0e0c0c');P(60,90,2,1,'#3a3a44');P(66,90,2,1,'#3a3a44');
  P(18,92,8,2,'#3a0806');P(104,90,7,2,'#3a0806');});};SGT_ART.cold37=st37Cold;}   // the dark stains under each, not stray drops
// Tobias's drawing in wax crayon: the town as round coloured heads in a row, the church, the tall black man with an orange head over all of them;
// the only grey pencil is the small careful face under the orange one: yours, with your hair
function st37Crayon(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,(y-9)%11===0?'#c8d0dc':'#f2ecdc');for(let y=0;y<ST37H;y++)P(16,y,1,1,'#e8a8a8');
  const wax=(pts,col,w,lt)=>{for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(1,Math.abs(c-a),Math.abs(d-b));for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);
      for(let o=0;o<(w||2);o++){if(st37H(x+o*3,y)%7===0)continue;P(x+(Math.abs(c-a)<Math.abs(d-b)?o:0),y+(Math.abs(c-a)<Math.abs(d-b)?0:o),1,1,st37H(x,y+o)%5===0?(lt||col):col);}}}};
  const blob=(cx,cy,r,col,lt)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const e=(x*x+y*y)/(r*r);if(e>1||st37H(cx+x,cy+y)%6===0)continue;if(e>.55||st37H(x,y)%3===0)P(cx+x,cy+y,1,1,e>.55?col:lt||col);}};
  // the church, small and crooked
  wax([[24,96],[24,72],[50,72],[50,96]],'#8a5a2a',2,'#b07a40');wax([[22,72],[37,56],[52,72]],'#8a5a2a',2,'#b07a40');wax([[37,56],[37,44]],'#8a5a2a',2);wax([[32,48],[42,48]],'#8a5a2a',2);wax([[34,96],[34,86],[40,86],[40,96]],'#5a3a1a',1);
  // the town: round heads in a row in crayon colours, stick bodies, every one smiling
  const cols=[['#d84a3a','#f07a6a'],['#3a6ad8','#6a9af0'],['#3aa04a','#6ad07a'],['#e0a02a','#f8c860'],['#8a4ad0','#b07af0']];
  for(let i=0;i<10;i++){const x=62+i*9,y=82+(i%2);const [c,l]=cols[i%5];blob(x,y,3,c,l);P(x-1,y,1,1,'#2a1a14');P(x+1,y,1,1,'#2a1a14');P(x-1,y+2,3,1,'#2a1a14');wax([[x,y+4],[x,y+12]],c,1);wax([[x,y+12],[x-2,y+17]],c,1);wax([[x,y+12],[x+2,y+17]],c,1);}
  // the tall man behind them, taller than the church: black wax, stick arms out, legs to the ground
  wax([[140,104],[140,34]],'#16141a',3,'#3a3840');wax([[140,50],[118,64]],'#16141a',2);wax([[140,50],[162,62]],'#16141a',2);wax([[140,104],[130,110]],'#16141a',2);wax([[140,104],[150,110]],'#16141a',2);
  for(let a=0;a<6.28;a+=.1){const x=Math.round(140+Math.cos(a)*13),y=Math.round(22+Math.sin(a)*12);P(x,y,2,2,st37H(x,y)%4?'#e8701a':'#f8a040');}
  for(let k=0;k<70;k++){const x=129+st37H(k,1)%23,y=12+st37H(1,k)%21;if(((x-140)/12)**2+((y-22)/11)**2<1&&st37H(k,3)%3)P(x,y,1,1,'#f0903a');}
  P(135,18,3,3,'#16141a');P(143,18,3,3,'#16141a');for(let x=133;x<148;x+=2)P(x,27+(x%4===1?1:0),2,1,'#16141a');
  // under the orange head, small and careful, in pencil: your face, your hair
  const hair=(S.look&&S.look.hair)||'#6a4224';for(let a=0;a<6.28;a+=.35)P(Math.round(140+Math.cos(a)*5),Math.round(39+Math.sin(a)*4.5),1,1,'#6a6a74');
  P(138,38,1,1,'#4a4a54');P(142,38,1,1,'#4a4a54');P(139,41,3,1,'#6a6a74');for(let k=0;k<7;k++)P(135+k*2,34+(k%2),2,1,hair);});}
// the dawn: stepped bands with cloud shapes in them, the sun's rim, the church with one lit window, smoke in wisps, the furrows running in to the cabin
function st37Dawn(cv){const W=160,H=90;cv.width=W;cv.height=H;const g=cv.getContext('2d');const P=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w||1,h||1);};
  const sky=['#241e34','#3a2840','#5a3444','#84444a','#b0604e','#d88a5a','#eaac6e'];const bh=[6,6,6,6,6,6,10];let y0=0;for(let i=0;i<sky.length;i++){P(0,y0,W,bh[i],sky[i]);y0+=bh[i];}
  for(const [cx,cy,w,col] of [[30,10,34,'#4a3048'],[96,16,40,'#6e3c48'],[60,24,28,'#9a5050'],[128,30,26,'#c27456']]){for(let k=0;k<w;k++){const t=k/w,h=Math.round(Math.sin(t*Math.PI)*2.5);P(cx-w/2+k,cy-h,1,h+1,col);}P(cx-w/2,cy+1,w,1,sky[Math.min(6,Math.floor((cy+1)/6))]);}
  P(108,40,14,6,'#fbd88a');P(110,38,10,2,'#fbd88a');P(112,37,6,1,'#fff0c0');   // the sun's rim on the ridge
  const ridge=(y0,amp,col,seed)=>{for(let x=0;x<W;x++){const h=Math.round(y0+Math.sin(x*.07+seed)*amp+Math.sin(x*.19+seed*2)*amp*.4);P(x,h,1,H-h,col);}};ridge(44,3,'#5a3a48',1);ridge(50,2.5,'#3e2c3a',4);
  for(const [x,y,h] of [[8,50,9],[14,49,12],[20,51,8],[134,49,11],[141,50,9],[148,48,13],[154,50,8]]){for(let k=0;k<h;k++){const w=Math.max(1,Math.round((k/h)*4));P(x-w,y-h+k,w*2+1,1,'#22202c');}P(x,y,1,3,'#22202c');}
  P(62,40,14,12,'#2a2230');P(67,30,4,10,'#2a2230');P(68,26,2,4,'#2a2230');P(66,44,3,4,'#f0b060');   // the church, one lit window
  // the field: furrows that run in toward the cabin, catching the light on their ridges
  ridge(56,1.5,'#4a3a2a',7);const vx=34,vy=60;for(let y=58;y<H;y++)for(let x=0;x<W;x++){const ang=Math.atan2(y-vy,x-vx);const k=Math.floor((ang+Math.PI)/(Math.PI/26));P(x,y,1,1,k%2?'#6a5232':'#8a6a3a');}
  // the cabin, one window lit; smoke rising in two wisps
  P(23,59,24,13,'#1c1418');for(let k=0;k<7;k++)P(21+k,59-k,28-k*2,1,'#2a1e1c');P(30,63,3,3,'#f2c070');
  for(const [px,py,r] of [[42,51,2],[44,47,3],[43,42,3],[46,37,4],[49,32,3]]){P(px-r,py-r+1,r*2,r*2-1,'#9a8a90');P(px-r+1,py-r,r*2-2,r*2+1,'#9a8a90');P(px-r+1,py-r,r*2-2,1,'#c0b0b4');}   // smoke, in round puffs
  P(96,57,1,15,'#1a1214');P(92,60,9,1,'#1a1214');P(95,57,3,1,'#1a1214');   // the scarecrow's pole, empty
  P(98,61,1,3,'#3a2a20');P(99,63,1,2,'#3a2a20');P(97,64,2,1,'#3a2a20');   // a snapped rope hanging from the crossbar
  for(const [x,y,c] of [[93,61,'#c8a048'],[92,62,'#a88030'],[94,62,'#d8b058'],[95,72,'#c8a048'],[97,72,'#a88030'],[98,71,'#c8a048']])P(x,y,1,1,c);   // straw left on the bar and at the foot
  for(let y=72;y<H;y++){const x=Math.round(118+(y-72)*1.4);P(x,y,4+((y-72)>>1),1,'#a08a6a');}}
// r2b: the slip's hand as a hand: fingers curled up behind the slip, knuckles lit, the thumb in front, pressing its lower edge
{const _s=st37Slip;st37Slip=function(){const c=_s();const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  P(56,76,80,36,(76>>4)%2?'#141010':'#120e0e');for(let y=79;y<112;y++)for(let x=56;x<136;x++)P(x,y,1,1,(x>>4)%2?'#141010':'#120e0e');P(30,78,118,2,'#ece0c4');P(30,79,118,1,'#c8bc9e');   // redo the paper's bottom edge
  const sk=['#5a3a2c','#7a5444','#9a705c','#b88e76','#d0aa90'];const ell=(cx,cy,rx,ry,f)=>{for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const e=(x*x)/(rx*rx)+(y*y)/(ry*ry);if(e<=1)P(cx+x,cy+y,1,1,f(x,y,e));}};
  // the back of the hand and the wrist, coming up from the bottom
  for(let y=92;y<112;y++){const w=Math.round(22+(y-92)*.3);for(let x=-w;x<=w;x++)P(98+x,y,1,1,Math.abs(x)===w?'#0e0b0c':x<-w*.4?sk[2]:x<w*.3?sk[1]:sk[0]);}
  // four fingers curled up behind the slip: rounded tips showing above the bottom edge, knuckle lines
  for(const [i,fx] of [76,90,104,118].entries()){const top=74-(i===1||i===2?2:0);for(let y=top;y<96;y++)for(let x=-5;x<=5;x++){if(y<top+3&&Math.abs(x)>3)continue;const edge=Math.abs(x)===5||(y===top&&Math.abs(x)<4)||(y<top+3&&Math.abs(x)===4);
      P(fx+x,y,1,1,edge?'#0e0b0c':x<-2?sk[3]:x<2?sk[2]:sk[1]);}P(fx-3,top+1,4,1,sk[4]);P(fx-4,top+8,9,1,sk[0]);P(fx-4,top+14,9,1,sk[0]);}
  P(30,78,118,1,'#c8bc9e');   // the slip's edge stays over the fingers' backs
  // the thumb, in front: from the lower left, its pad pressed on the paper, a pale nail
  for(let y=66;y<96;y++){const t=(y-66)/30,cx=Math.round(66-t*6),w=Math.round(6+t*3);for(let x=-w;x<=w;x++)P(cx+x,y,1,1,Math.abs(x)===w||y===66?'#0e0b0c':x<-w*.3?sk[3]:x<w*.4?sk[2]:sk[1]);}
  P(62,67,8,5,'#e8cfc0');P(62,67,8,1,'#f8e8e0');P(63,71,6,1,'#c8a898');return c;};}
// r2b: the quarry recess reads as a hole: a wide black inner wall top and left, the recess floor mid-dark, a lit lip bottom and right
{const _q=st37Quarry;st37Quarry=function(){const c=_q();const g=c.getContext('2d'),id=g.getImageData(0,0,ST37W,ST37H),a=id.data;const cx=88;
  const fig=(x,y)=>{const head=((x-cx)/8)**2+((y-26)/9)**2<1;const neck=Math.abs(x-cx)<4&&y>=34&&y<38;const body=Math.abs(x-cx)<15-Math.max(0,(y-60)*.2)&&y>=37&&y<78;
    const armL=Math.abs((x-(cx-26))-(y-44)*.55)<4.5&&y>14&&y<62;const armR=Math.abs((x-(cx+26))+(y-44)*.55)<4.5&&y>14&&y<62;const legL=x>cx-12&&x<cx-2&&y>=76&&y<106;const legR=x>cx+2&&x<cx+12&&y>=76&&y<106;return head||neck||body||armL||armR||legL||legR;};
  const set=(x,y,c)=>{const i=(y*ST37W+x)*4;a[i]=c[0];a[i+1]=c[1];a[i+2]=c[2];a[i+3]=255;};
  for(let y=4;y<110;y++)for(let x=40;x<140;x++){if(!fig(x,y))continue;let d=0;while(d<5&&fig(x-d-1,y-d-1))d++;let e=0;while(e<3&&fig(x+e+1,y+e+1))e++;
    let col=d<3?[14,12,18]:d<5?[26,22,30]:[44,40,50];if(e===0)col=[150,146,160];else if(e===1)col=[92,88,100];if(((x*7+y*3)%13)===0&&d>=5&&e>1)col=[56,52,62];set(x,y,col);}
  g.putImageData(id,0,0);return c;};SGT_DRAW.quarry=st37Quarry;}
// r2b: the deer, dead on its side: the head laid flat in line with the spine, the ear back, legs rigid and splayed out from the belly,
// a dark pool hugging it, the flank opened; twelve cuts of it at the hours; a stick from the middle to the door at the rim
function st37Deer(){return st37Cv(ST37W,ST37H,(P)=>{st37Dirt(P,ST37W,ST37H,11);for(let x=0;x<ST37W;x++){P(x,12+(x>>4)%2,1,2,'#2e1e12');P(x,102+(x>>5)%2,1,2,'#2e1e12');}
  const oc='#1a0e08',cx=94,cy=52;
  const back=x=>Math.round(cy-11*Math.sqrt(Math.max(0,1-((x-cx)/34)**2))-(x>cx+10?2*Math.sqrt(Math.max(0,1-((x-cx-18)/16)**2)):0)),belly=x=>Math.round(cy+9*Math.sqrt(Math.max(0,1-((x-cx)/32)**2)));
  // the pool under it: dark, close to the body, spreading below the opened flank
  for(let x=cx-40;x<=cx+40;x++){const b=belly(x);if(b<=cy)continue;for(let y=b;y<b+3+Math.round(3*Math.max(0,1-Math.abs(x-cx-2)/22));y++)P(x,y,1,1,y<b+2?'#2a0806':'#3a0a08');}
  // the legs, rigid, out from the belly at their angles; far legs darker behind the near ones
  const leg=(x0,y0,x1,y1,far)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n),w=k<n*.45?3:2;P(x-1,y-1,w+2,w+2,oc);}
    for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n),w=k<n*.45?3:2;P(x,y,w,w,far?'#6e4c2c':'#9a6e42');P(x,y,1,1,far?'#8a6038':'#c09060');}
    P(x1-1,y1-1,4,3,'#0e0a0a');P(x1,y1-1,2,1,'#4a4444');};
  // a dead deer's legs go out straight, in pairs: the forelegs forward and down, the hind legs back and down, each pair nearly parallel
  leg(cx-26,cy+5,cx-50,cy+24,1);leg(cx-22,cy+7,cx-44,cy+30,0);leg(cx+24,cy+4,cx+52,cy+20,1);leg(cx+21,cy+7,cx+48,cy+28,0);
  // the body: the spine side lit, the belly pale toward you
  for(let x=cx-34;x<=cx+34;x++){const t=back(x),b=belly(x);if(b-t<2)continue;for(let y=t;y<=b;y++){const v=(y-t)/(b-t);P(x,y,1,1,v<.1?'#cfa070':v<.45?'#b08048':v<.8?'#8e6234':'#d8c8aa');}P(x,t-1,1,1,oc);P(x,b+1,1,1,oc);}
  for(let y=cy-8;y<=cy+8;y++){P(cx-35,y,1,1,oc);P(cx+35,y,1,1,oc);}P(cx+34,cy-6,4,4,oc);P(cx+35,cy-5,2,2,'#f6eee0');   // the white scut
  // the opened flank, high on the upward side, and the ribs as pale curves
  for(let y=cy-10;y<cy+1;y++)for(let x=cx-10;x<cx+16;x++){const e=((x-cx-3)/12)**2+((y-cy+5)/5)**2;if(e<1)P(x,y,1,1,e>.7?'#5a0c08':'#3e0605');}
  for(const r of [-6,0,6,12]){for(let t=0;t<8;t++){const x=cx+r+Math.round(Math.sin(t/7*Math.PI)*2),y=cy-9+t;if(((x-cx-3)/12)**2+((y-cy+5)/5)**2<.85)P(x,y,1,1,t<3?'#f4e8d0':'#cdbca2');}}
  // the neck and the head laid flat on the track, in line with the spine; the ear lying back; the eye still open
  for(let i=0;i<16;i++){const x=cx-35-i,t=cy-6+Math.round(i*.15),w=8-Math.round(i*.08);P(x,t-1,1,1,oc);P(x,t+w,1,1,oc);for(let k=0;k<w;k++)P(x,t+k,1,1,k<2?'#c09060':k<w-2?'#a07446':'#e2d4b8');}
  const hx=cx-68,hy=cy-6;for(let y=0;y<10;y++)for(let x=0;x<18;x++){const e=((x-10)/10)**2+((y-5)/5.2)**2;const snout=x<6&&y>2&&y<9;if(e>1&&!snout)continue;P(hx+x,hy+y,1,1,y<3?'#c89a68':y<7?'#a87a48':'#d8c8a8');}
  for(let x=-1;x<19;x++){if(x>4)P(hx+x,hy-1,1,1,oc);P(hx+x,hy+10,1,1,oc);}P(hx-1,hy+3,1,6,oc);P(hx,hy+4,3,3,'#141010');P(hx+10,hy+3,3,2,'#141010');P(hx+10,hy+3,1,1,'#f0e8dc');
  for(let i=0;i<12;i++){const ex=hx+14+i,ey=hy-2+Math.round(i*.2);P(ex,ey-1,1,4,oc);P(ex,ey,1,2,i<3?'#a87a48':'#c08a5a');if(i>2&&i<10)P(ex,ey+1,1,1,'#d8a098');}   // the ear, lying back along the neck
  // twelve cuts at the hours: each its own shape, meat with a pale rind, some with a bone end
  const RX=74,RY=46;for(let h=0;h<12;h++){const a=h/12*Math.PI*2-Math.PI/2,x=Math.round(cx+Math.cos(a)*RX)-4,y=Math.round(cy+4+Math.sin(a)*RY)-2;if(y<3||y>ST37H-8||x<12)continue;
    const w=7+st37H(h,2)%3,hh=4+st37H(2,h)%2;P(x-1,y-1,w+2,hh+2,'#1a0604');for(let yy=0;yy<hh;yy++)for(let xx=0;xx<w;xx++){if((xx===0||xx===w-1)&&(yy===0||yy===hh-1))continue;P(x+xx,y+yy,1,1,yy===0?'#ecd8bc':xx<w*.5?'#a8302a':'#7e1812');}
    if(h%3===0){P(x+w,y+1,3,2,'#f0e8d8');P(x+w+2,y,1,1,'#f0e8d8');}P(x,y+hh+1,w,1,'#2a0806');}
  // the hand: a peeled stick from the middle out to the rim, to the cabin door's edge
  for(let i=0;i<82;i++){const x=Math.round(cx-2-i*1.08),y=Math.round(cy-2-i*.6);if(x<12||y<0)break;P(x,y,2,2,'#2a1a10');P(x,y,1,1,'#e0c8a0');}
  P(0,0,12,20,'#3a2a1c');P(0,0,12,1,'#6a5038');P(11,0,1,20,'#1a1008');P(2,10,2,2,'#b89040');P(0,19,12,1,'#1a1008');   // the door's edge at the rim, its latch
  P(cx-5,cy-5,7,6,'#141010');P(cx-4,cy-4,5,4,'#7a7880');P(cx-4,cy-4,3,1,'#a8a6ae');});}
SGT_ART.deer37=st37Deer;
// ======== the first ten minutes: one car. The sedan from the oak, drawn once in the game's 3/4 view (its near side, and its hood,
// roof and trunk seen from above), for the drive in, the wreck on its wheels as the repairs go in, the beaten car and the drive out.
const ST37_CARPAL={top:'#963e38',topHi:'#c0604a',side:'#7c2e2e',sideHi:'#9a3e34',low:'#5a2434',dark:'#46182a',deep:'#2a1222',glass:'#1a2430',glass2:'#26364a',
  glint:'#5e7a8e',glint2:'#d2dce2',chr:'#9a9aa2',chrD:'#6c6c74',chrL:'#c8c8cc',tyre:'#1a1a1c',tyre2:'#2c2c32',out:'#0e080a',lamp:'#f4ecc8',tail:'#c8281e',
  primer:'#6e6a66',primerT:'#86827c',primerD:'#58544f',rust:'#7a4a24',rustD:'#5a3418'};
function st37Sedan(cfg){cfg=cfg||{};const C=ST37_CARPAL,W=156,H=80,D=28,BL=46,GY=74,WY=63,WR=11,RX=36,FX=120,nose=cfg.crumple?134:146;
  const cv=st37Cv(W,H,(P,g)=>{
    const inP=(pts,x,y)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
    const poly=(pts,col)=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++)
      if(inP(pts,x+.5,y+.5)){const c=typeof col==='function'?col(x,y):col;if(c)P(x,y,1,1,c);}};
    const line=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let k=0;k<=n;k++)P(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),1,1,col);};
    const prim=(x,top)=>cfg.primer&&x>=112?(top?C.primerT:C.primer):null;
    // the tops: trunk, hood (a centre crease), roof; lit from the upper left, a bright near edge
    const topCol=(x,y,y0,y1)=>{const p=prim(x,1);if(y>=y1-1)return p?'#a09a92':C.topHi;if(y<=y0)return p?C.primerD:C.side;return p||C.top;};
    poly([[8,BL],[48,BL],[48,BL-D],[8,BL-D]],(x,y)=>topCol(x,y,BL-D,BL));
    if(!cfg.crumple||cfg.vnose)poly([[110,BL],[nose,BL],[nose,BL-D],[110,BL-D]],(x,y)=>{const c=topCol(x,y,BL-D,BL);if(y===BL-14&&x>112&&x<nose-2)return prim(x,1)?'#a09a92':C.topHi;return c;});
    else{poly([[110,BL],[nose,BL],[nose,BL-2],[122,BL-8]],'#1a1414');P(116,BL-4,6,2,'#4a4648');P(126,BL-3,4,2,'#3a3a40');   // the engine bay, open under the buckled hood
      poly([[110,BL],[122,BL-8],[nose,BL-2],[nose,BL-D+2],[122,BL-D-8],[110,BL-D]],(x,y)=>{const k=(y-(BL-D))/D;return x<122?(k>.85?C.topHi:C.top):(k>.8?C.sideHi:'#7a3430');});
      line(110,BL,122,BL-8,C.topHi);line(122,BL-8,nose,BL-2,C.deep);line(122,BL-8,122,BL-D-8,C.deep);line(123,BL-8,123,BL-D-7,C.topHi);line(110,BL-D,122,BL-D-8,C.side);line(122,BL-D-8,nose,BL-D+2,C.side);}

    line(12,BL-D+2,12,BL-1,C.side);P(26,BL-6,3,2,C.chrD);   // the trunk lid seam, the lock
    poly([[58,33],[100,33],[100,5],[58,5]],(x,y)=>y>=32?C.topHi:y<=5?C.side:(y===10&&x>62&&x<96)?C.topHi:C.top);
    // the glass: windscreen and rear window as slanted panes between the roof and the hood/trunk; the near side windows
    const glassCol=(x,y,pane)=>{if(cfg.glass==='smash'&&pane==='w'){const h=st37H(x,y);if(Math.abs(x-104)+Math.abs(y-24)<3)return C.out;return h%6===0?C.glint2:h%4===0?'#a8b4c0':'#7a8896';}
      return y<(pane==='s'?36:14)?C.glass2:C.glass;};
    poly([[110,BL],[100,33],[100,5],[110,BL-D]],(x,y)=>glassCol(x,y,'w'));
    poly([[48,BL],[58,33],[58,5],[48,BL-D]],(x,y)=>glassCol(x,y,'r'));
    poly([[48,BL],[110,BL],[100,33],[58,33]],(x,y)=>glassCol(x,y,'s'));
    line(48,BL,58,33,C.side);line(49,BL,59,33,C.sideHi);line(110,BL,100,33,C.side);line(109,BL,99,33,C.sideHi);P(79,33,3,13,C.deep);P(79,33,1,13,C.side);   // pillars
    line(110,BL-D,100,5,C.side);line(48,BL-D,58,5,C.side);
    if(cfg.glass!=='smash'){line(64,44,70,35,C.glint);line(67,44,73,35,C.glint);line(88,44,93,36,C.glint);P(102,9,2,1,C.glint2);line(103,12,107,28,C.glint);line(52,40,55,24,C.glint);}
    if(cfg.glass==='smash'){for(const [dx,dy] of [[1,2],[-1,2],[1,-2],[-1,-1],[0,3],[1,0]])line(104,24,104+dx*5,24+dy*5,C.glint2);P(84,38,3,2,'#a8b4c0');line(84,38,90,44,C.glint2);line(85,38,82,44,C.glint2);}
    if(cfg.glass==='crack')for(const [dx,dy] of [[1,2],[-1,2],[1,-2],[0,-3]])line(104,26,104+dx*4,26+dy*4,C.glint2);
    // the near side: shoulder highlight, the body, a chrome strip, the rocker in shadow
    poly([[8,BL],[nose,BL],[nose,61],[nose-3,66],[11,66],[8,62]],(x,y)=>{const p=prim(x,0);if(y===BL)return p?C.primerT:C.topHi;if(y===BL+1)return p?C.primer:C.sideHi;if(y===56)return cfg.dull?C.chrD:C.chrL;if(y===57)return C.chrD;
      if(y>=64)return C.deep;if(y>=58)return p?C.primerD:C.low;return p||C.side;});
    for(const x of [50,81,108])if(x<nose-2)line(x,BL+2,x,64,C.deep);   // door seams
    for(const x of [70,99]){P(x,50,5,1,C.chrL);P(x,51,5,1,C.chrD);}
    if(cfg.mirror!==0){P(107,41,5,4,C.side);P(107,41,5,1,C.topHi);P(107,44,5,1,C.deep);}
    if(cfg.rust){   /* r4: rust in shapes, creeping up from the sill: a ragged top edge darker than its middle, bubbles of paint lifting just above it, a hole or two */
      for(const [x0,x1,hmax] of [[9,24,7],[52,61,4],[84,101,6]])for(let x=x0;x<=x1;x++){const t=(x-x0)/(x1-x0),h=Math.round(hmax*Math.sin(t*Math.PI)*.75+1+st37H(x,9)%3);const top=65-h;
        for(let y=top;y<=65;y++){const hh=st37H(x,y);P(x,y,1,1,y===top?'#4a2810':y===top+1&&hh%2?'#5a3418':hh%6===0?'#b0703a':hh%3===0?'#6a3c1c':'#8a5226');}
        if(st37H(x,4)%4===0)P(x,top-2,1,1,'#a06a3c');}
      P(92,63,2,1,'#140a06');P(15,62,1,2,'#140a06');}
    if(cfg.dents)for(const [dx0,dy0,dw,dh] of [[86,BL+4,16,9],[60,BL+8,10,6]])for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const e=((x-dw/2+.5)/(dw/2))**2+((y-dh/2+.5)/(dh/2))**2;if(e>1)continue;P(dx0+x,dy0+y,1,1,e>.62?(x<dw/2?C.deep:C.sideHi):(x<dw/2?C.dark:C.low));}   // two dents, each its own shape
    if(cfg.ham)for(const [dx0,dy0,dw,dh] of [[118,BL+5,9,5],[128,BL-16,10,4]]){if(dx0+dw>nose-2)continue;for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const e=((x-dw/2+.5)/(dw/2))**2+((y-dh/2+.5)/(dh/2))**2;if(e>1)continue;P(dx0+x,dy0+y,1,1,e>.6?(x<dw/2?C.primerD:'#a8a29a'):(x<dw/2?'#5a5650':C.primer));}}   // two dents hammered most of the way out
    if(cfg.vnose){const vx=nose-14;for(let y=BL-D;y<66;y++){const mid=(BL-D+66)/2,v=Math.round(16*(1-Math.abs(y-mid)/((66-BL+D)/2)));for(let x=nose-v;x<=nose+2;x++)g.clearRect(x,y,1,1);P(nose-v-1,y,2,1,y%3?C.deep:C.topHi);if(y%4===0)P(nose-v-4,y,3,1,C.deep);}   /* r4: the front folded IN round the oak: a V notch, deepest at the middle, the trunk sits in it */
      for(let k=0;k<4;k++)line(nose-30+k*5,BL+2,nose-26+k*5,64,k%2?C.deep:C.sideHi);   // the fender buckled in folds
      line(112,BL-D+2,nose-16,BL-D/2|0,C.topHi);line(112,BL-D+3,nose-16,(BL-D/2|0)+1,C.deep);}
    if(cfg.crumple){for(let y=BL;y<64;y++){const z=(y>>1)%2;P(nose-1-z,y,2,1,z?C.deep:C.topHi);}
      line(112,58,nose-2,52,C.deep);line(112,57,nose-2,51,C.topHi);P(nose-4,49,4,4,C.out);}   // the lamp is gone
    // the ends: chrome bumpers (their tops run the width of the car), lamps at the corners
    const bump=(x0)=>{P(x0,BL-D+8,5,26,cfg.dull?C.chrD:C.chr);P(x0,BL-D+8,1,26,C.chrL);P(x0,54,5,8,C.chrL);P(x0,58,5,2,C.chr);P(x0,60,5,2,C.chrD);};
    if(cfg.bumper!==0)bump(nose);else if(cfg.crumple){P(nose+3,70,15,3,C.chrD);P(nose+3,70,15,1,C.chrL);}   // torn off, lying in the grass
    bump(3);
    if(!cfg.crumple){P(nose-4,50,4,4,C.chrL);P(nose-3,51,3,2,C.lamp);P(nose,23,2,3,C.lamp);}
    P(8,49,3,4,C.tail);P(8,49,3,1,'#e86048');P(6,21,2,3,C.tail);
    // the wheels: the arches cut from the body, black tyres, hubcaps (a bare steel spare where the tyre was changed)
    for(const [wx,front] of [[RX,0],[FX,1]]){const flat=front&&cfg.flat,steel=front&&cfg.steel,cy=WY+(flat?2:0);
      for(let y=WY-WR-3;y<GY;y++)for(let x=wx-WR-3;x<=wx+WR+3;x++){const d=Math.hypot(x-wx,y-WY);if(d<WR+2.5)g.clearRect(x,y,1,1);else if(d<WR+3.5&&y<WY+2)P(x,y,1,1,C.deep);}
      for(let y=cy-WR;y<=cy+WR+(flat?1:0);y++)for(let x=wx-WR-(flat?2:0);x<=wx+WR+(flat?2:0);x++){const d=Math.hypot(x-wx,(y-cy)*(flat&&y>cy?1.25:1));if(d>WR+.4&&!(flat&&y>=cy+WR-2&&y<=cy+WR&&Math.abs(x-wx)<WR-1))continue;
        P(x,y,1,1,d>WR-2.2?C.tyre:C.tyre2);}
      for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const d=Math.hypot(x,y);if(d>6.4)continue;P(wx+x,cy+y,1,1,steel?(d>5?'#3a3a40':d<2?'#5a5a62':'#2e2e34'):(d>5?C.chrD:d<2.5?C.chrD:C.chr));}
      if(steel)for(const [a,b] of [[-3,-1],[3,1],[-1,3],[1,-3]])P(wx+a,cy+b,1,1,C.chrD);else{P(wx-3,cy-4,3,1,C.chrL);P(wx-4,cy-3,1,2,C.chrL);}}
  });
  if(cfg.flat){const g=cv.getContext('2d'),id=g.getImageData(0,0,W,H),out=g.createImageData(W,H);for(let x=0;x<W;x++){const s=x>60?Math.round((x-60)/(W-60)*3):0;for(let y=0;y<H;y++){const yy=y-s;if(yy<0)continue;const i=(y*W+x)*4,j=(yy*W+x)*4;for(let k=0;k<4;k++)out.data[i+k]=id.data[j+k];}}g.putImageData(out,0,0);}
  st37Outline(cv,ST37_CARPAL.out);
  {const g=cv.getContext('2d');g.save();g.globalCompositeOperation='destination-over';g.fillStyle='rgba(12,8,14,.42)';g.fillRect(18,BL+2,W-18,GY-BL+1);g.fillStyle='rgba(12,8,14,.24)';g.fillRect(22,GY+1,W-22,4);g.restore();}
  return cv;}
const ST37_CARS={clean:{glass:'clear'},s0:{crumple:1,vnose:1,glass:'smash',bumper:0,flat:1,dents:1,mirror:0},s1:{crumple:1,glass:'smash',bumper:0,flat:1,dents:1,mirror:0},s2:{primer:1,ham:1,glass:'smash',bumper:0,flat:1,mirror:0},
  s4:{primer:1,ham:1,glass:'smash',bumper:0,steel:1,mirror:0},s5:{primer:1,ham:1,glass:'clear',bumper:0,steel:1,mirror:0},beaten:{primer:1,ham:1,glass:'clear',dull:1,steel:1,rust:1}};
for(const k in ST37_CARS)st37Reg('st37_car_'+k,st37Sedan(ST37_CARS[k]),78,50);st37Reg('st37_car_s0f',IMG['c37:st37_car_s0'],78,60);   /* r4: the crash car sorted just in front of the oak it is wrapped round */
// the beaten car (parked, and on the drive out) is the same sedan now: clear glass, a primer front, a steel spare
Object.assign(SPR.car_beaten||(SPR.car_beaten={}),{src:'c37:st37_car_beaten',fw:156,fh:80,ax:78,ay:50});delete SPR.car_beaten.clips;
// the drive in: while the car runs straight down the lane it is this sedan; the skid's turning frames stay the rendered model of the same car
{const _d=drawSpr;drawSpr=function(name,x,y,clip,dir,frame,o){if(name==='car_east'&&clip==='yaw'&&(frame|0)===4&&SPR.st37_car_clean)return _d.call(this,'st37_car_clean',x,y,null,null,0,o);return _d.apply(this,arguments);};}
// the wreck as the repairs go in: on the oak; down on its wheels, crumpled, steaming, a flat; straightened in primer; a new wheel; new glass
const ST37_CAR={o:null,want:null,orig:null,cx:-61.6,cz:1.4};
function st37CarSync(){try{if(typeof WRECK_RECT==='undefined'||!WRECK_RECT)return;const cs=S.carStage||0,fixed=!!S.carFixed;
  const want=(!fixed&&cs>=1&&!S.introDrive)?(cs>=5?'s5':cs>=4?'s4':cs>=2?'s2':'s1'):null;ST37_CAR.want=want;
  for(const o of OBJ)if(o.kind==='wreck'&&String(o.spr||'').startsWith('car_wreck')&&!o.__h37){o.__h37=1;let h=o.hide;Object.defineProperty(o,'hide',{configurable:true,get(){return h||!!ST37_CAR.want;},set(v){h=v;}});}
  if(!ST37_CAR.o)ST37_CAR.o=obj('st37_car_s1',ST37_CAR.cx,ST37_CAR.cz,{kind:'prop',noCol:true,hide:true});
  const o=ST37_CAR.o;o.hide=!want;if(want)o.spr='st37_car_'+want;
  const R=WRECK_RECT;if(!ST37_CAR.orig)ST37_CAR.orig=[R.x0,R.z0,R.x1,R.z1];const tgt=want?[ST37_CAR.cx-2.3,ST37_CAR.cz-1.05,ST37_CAR.cx+2.2,ST37_CAR.cz+.6]:ST37_CAR.orig;
  if(R.x0!==tgt[0]||R.z0!==tgt[1]||R.x1!==tgt[2]||R.z1!==tgt[3]){[R.x0,R.z0,R.x1,R.z1]=tgt;CGRID.dirty=true;}
  if(want&&cs<3&&S.mode==='play'&&Math.abs(P.x-ST37_CAR.cx)<14&&Math.abs(P.z-ST37_CAR.cz)<10)for(let i=0;i<2;i++)parts.push({x:ST37_CAR.cx+1.7+Math.random()*.4,z:ST37_CAR.cz-.5,y:.9,vx:.15+Math.random()*.2,vz:-.1,vy:.5+Math.random()*.3,t:0,life:1.3,col:Math.random()<.5?'#c8c8cc':'#a8a8b0',size:2});
}catch(e){}}
setInterval(st37CarSync,300);
// wake by the wreck: the first thing you see is the car on the oak, from beside its crumpled nose
{const _fi=finishIntro;finishIntro=function(){_fi.apply(this,arguments);try{P.x=-57.2;P.z=1.0;P.dir='W';P.fx=-1;P.fz=0;const t=$('toast');if(t)t.classList.remove('show');}catch(e){}};}
// the tutorial tip waits for the toast to finish, so the two never sit on top of each other
{const _ts=tutShow;tutShow=function(step){try{if(step&&step!==TUT_CUR&&$('toast')&&$('toast').classList.contains('show'))return;}catch(e){}return _ts.apply(this,arguments);};}
// the drive out: the same sedan, clear glass, and no narration. The road brings it back and the HOLLOW ACRE sign slides by in the frame, twice.
{const _sub=sub;sub=function(t){if(typeof t==='string'&&(/^The highway west\./.test(t)||/^The farm sign goes by/.test(t)||/^HOLLOW ACRE\. E\. Marsh/.test(t)))t='';return _sub.call(this,t);};}
escapeCine=function(){S.mode='cine';$('skip').hidden=false;$('buttons').hidden=true;$('hud').hidden=true;ui.obj.hidden=true;SFX.engineStart();SFX.engine(true);
  const LANE=-7.1,V=11;const P0=typeof CAR_SPOTS!=='undefined'?CAR_SPOTS.crash:{x:carPos.x+1.5,z:LANE};const st={t:0,x:P0.x,z:P0.z,z0:P0.z,loops:0,bob:0};
  const moved=[];for(const n of npcs)if(n.vis&&!n.room&&Math.abs(n.z+6)<3.4&&n.x>-90&&n.x<0){moved.push([n,n.vis]);n.vis=false;}
  const wreck=OBJ.filter(o=>o.kind==='wreck');for(const o of wreck)o.hide=true;if(typeof BEATEN!=='undefined'&&BEATEN.o)BEATEN.o.hide=true;
  const done=()=>{for(const [n,v] of moved)n.vis=v;for(const o of wreck)o.hide=false;$('hud').hidden=false;ui.obj.hidden=false;if(typeof carShow==='function')setTimeout(carShow,0);};
  fade(1);setTimeout(()=>fade(0),350);
  cine={hidePlayer:true,escape:true,cam:{x:st.x-3,z:-6.4},
    drawables(D){D.push({z:st.z+.25,mind:1,draw(){const X=sx(st.x),Y=sz(st.z)+Math.round(st.bob);ctx2.fillStyle='rgba(10,8,14,.3)';ctx2.beginPath();ctx2.ellipse(X,Y+18,74,6,0,0,Math.PI*2);ctx2.fill();
      drawSpr('car_beaten',X,Y,null,null,0,{flip:true});}});},
    light(L){const X=sx(st.x),Y=sz(st.z);if(L>.25)for(const hy of [Y+2,Y-26]){const hx=X-68;coneAt(hx,hy,Math.PI,.28,12*PPM,[255,238,196],.8*L);glowAt(hx,hy,9,[255,240,210],.85*L);}
      for(const hy of [Y+1,Y-27])glowAt(X+70,hy,14,[255,26,16],.6*Math.max(.3,L));},
    update(dt){st.t+=dt;const acc=Math.min(1,st.t/1.6);st.x-=dt*V*acc*acc;{const k=Math.min(1,st.t/1.5);st.z=st.z0+(LANE-st.z0)*k*k*(3-2*k);}st.bob=Math.sin(st.t*22)*.6;
      cine.cam.x=lerp(cine.cam.x,st.x-3,1-Math.exp(-dt*4));cine.cam.z=lerp(cine.cam.z,st.loops?-8.7:-6.4,1-Math.exp(-dt*3));
      if(Math.random()<.6)parts.push({x:st.x+2.3,z:LANE+.1,y:.15,vx:1+Math.random(),vz:(Math.random()-.5)*.6,vy:.4+Math.random()*.4,t:0,life:.6,col:Math.random()<.5?'#8a7a64':'#5a5250',size:2});
      if(st.x<-76){st.loops++;st.x=farmSignPos.x+11;cine.cam.x=st.x-3;cine.cam.z=-8.7;fade(.85);setTimeout(()=>fade(0),320);SFX.whisper(0);}
      if(st.loops>=2&&st.x<farmSignPos.x+3&&!st.end){st.end=1;SFX.engine(false);fade(1);setTimeout(()=>{done();endCine();S.looped=true;S.mode='play';P.x=farmSignPos.x+1;P.z=farmSignPos.z+1.4;$('buttons').hidden=false;fade(0);
        toast('The engine dies in front of the farm sign. There is no road out of Marrow Hollow.',4,true);},1000);}}};
  cine.st37=st;cine.finish=()=>{done();};};
// ======== the rest of the scenes
// a line of speech cut into bubble-sized pieces at its sentences
const st37Chunks=(s,max)=>{max=max||84;const out=[];let cur='';for(const sen of String(s).match(/[^.!?]+[.!?]+[’”]?\s*|[^.!?]+$/g)||[s]){const t=sen.trim();if(!t)continue;if(cur&&(cur+' '+t).length>max){out.push(cur);cur=t;}else cur=cur?cur+' '+t:t;}if(cur)out.push(cur);return out;};
const st37Lines=html=>(String(html).match(/<q>[\s\S]*?<\/q>/g)||[]).map(q=>q.replace(/<\/?q>/g,'').replace(/<[^>]+>/g,'').trim());
// Agnes: on her top step behind a half-open door, the ribbon wound round her hand; she speaks, she doesn't get narrated
function st37DoorAjar(w){return st37Cv(w,44,(P)=>{P(0,0,w,44,'#060405');P(1,1,w-2,43,'#0a0708');
  for(let y=3;y<42;y+=4)P(2,y,w-12,1,'#140e10');P(4,12,6,8,'#2a1e14');P(5,13,4,6,'#3a2a1c');   // the hall: papered wall, a picture in the dark
  P(w-8,1,7,43,'#3a2618');P(w-8,1,1,43,'#6e4c30');P(w-2,1,1,43,'#20140c');for(let y=6;y<40;y+=9)P(w-6,y,4,1,'#2a1a10');P(w-7,22,2,2,'#c8a050');});}   // the door, swung in, its edge and its knob
function st37Ribbon(X,Y,t){const r='#b81e1a',rh='#e85040',rd='#701010';ctx2.fillStyle=rd;ctx2.fillRect(X-1,Y-1,7,6);
  for(let i=0;i<3;i++){ctx2.fillStyle=i%2?rh:r;ctx2.fillRect(X,Y+i*1.5|0,5,1);}ctx2.fillStyle='#f0e0c8';ctx2.fillRect(X+1,Y-2,3,1);   // white knuckles over the coil
  for(let k=0;k<9;k++){const sw=Math.round(Math.sin(t*2.4+k*.6)*(k/4));ctx2.fillStyle=k%3===2?rh:r;ctx2.fillRect(X+3+sw,Y+5+k,2,1);}}
{const _ps=playScene;playScene=function(id,title,html,done){try{if(id==='agnes'&&title==='Ruth’s ribbon'&&!STG&&S.mode==='play'&&!S.room&&typeof dkHomeDoor==='function'){
      const d=dkHomeDoor('agnes');const o=d&&OBJ.filter(q=>q.kind==='bld'&&!q.hide&&Math.abs(q.x-d.x)<7&&Math.abs(q.z-d.z)<4).sort((a,b)=>Math.abs(a.x-d.x)-Math.abs(b.x-d.x))[0];const m=o&&SPR[o.spr];
      if(o&&m&&m.door_w){const w=Math.max(16,m.door_w-4),x=o.x+(m.door_dx||0)/PPM*(o.flip?-1:1);st37Reg('st37_ajar',st37DoorAjar(w),w/2,44+7);
        const door=obj('st37_ajar',x,o.z+.02,{kind:'prop',noCol:true});const lines=[];for(const q of st37Lines(html))lines.push(...st37Chunks(q));const n=npcById('agnes');
        const ribbon={x,z:o.z+.14,draw(X,Y,t){const a=npcById('agnes');if(!a)return;const L=typeof porchLift==='function'?porchLift(a.x,a.z):0;st37Ribbon(Math.round(sx(a.x))+4,Math.round(sz(a.z))-23-L,t);}};
        sub('');stage({player:{x,z:o.z+2.3,dir:'N'},cast:{agnes:{x,z:o.z+.62,dir:'S'}},cam:{x,z:o.z+.5},lead:300,show:true,props:[ribbon],   /* r4: she stands out on the step, in front of her door */
          beats:[{hold:.9},{hold:.2,act(){stgTitle('Agnes Abernathy — Ruth’s ribbon');}},...lines.map(t=>({who:'agnes',text:t})),{hold:.7,face:{agnes:'N'}}],
          done(){door.hide=true;const i=OBJ.indexOf(door);if(i>=0)OBJ.splice(i,1);done&&done();}});return;}}}catch(e){}return _ps.apply(this,arguments);};}
// Nan: at the end of the ferry dock with her pole in the water and the far bank gone to fog; she says the price herself
function st37Fog(X,Y,t){   // stepped banks of fog, thicker the further they go, until the far bank is gone
  const A=['rgba(186,192,198,.38)','rgba(190,196,202,.55)','rgba(194,200,206,.72)','rgba(198,204,210,.86)'];
  for(let b=0;b<4;b++){const y0=Math.round(Y-58+b*16);ctx2.fillStyle=A[b];for(let x=0;x<VW;x+=8){const wob=Math.round((Math.sin(x*.045+t*.3+b*1.9)+1)*3)*2;ctx2.fillRect(x,y0+wob,8,VH-(y0+wob));}}
  ctx2.fillStyle='rgba(230,234,238,.18)';for(let i=0;i<6;i++){const x=Math.round((i*61+t*6)%(VW+80))-40;ctx2.fillRect(x,Math.round(Y-50+(i%3)*14),46,4);}}
function st37Pole(X,Y,t,slip){const x0=X-4,y0=Y-66,x1=X+31,y1=Y+10;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);ctx2.fillStyle='#2a1a10';ctx2.fillRect(x-1,y,3,1);ctx2.fillStyle=k%7===3?'#9a7a52':'#6a4a2e';ctx2.fillRect(x,y,1,1);}
  const r=3+Math.round((Math.sin(t*2)+1)*1.5);ctx2.fillStyle='rgba(200,220,230,.45)';ctx2.fillRect(x1-r,y1+1,r*2+1,1);ctx2.fillRect(x1-r+2,y1-1,r*2-3,1);   // the ripple where it goes in
  if(slip){ctx2.fillStyle='#1a1410';ctx2.fillRect(X+3,Y-29,8,6);ctx2.fillStyle='#ece4cc';ctx2.fillRect(X+4,Y-28,6,4);ctx2.fillStyle='#4a4250';ctx2.fillRect(X+5,Y-27,4,1);ctx2.fillRect(X+5,Y-25,3,1);}}
function st37Jar(X,Y){ctx2.fillStyle='#14100c';ctx2.fillRect(X-4,Y-11,9,12);ctx2.fillStyle='#8a9a8c';ctx2.fillRect(X-3,Y-10,7,10);ctx2.fillStyle='#c8b070';ctx2.fillRect(X-3,Y-12,7,2);
  for(const [a,b] of [[-2,-8],[0,-6],[1,-9],[-1,-4],[2,-3]]){ctx2.fillStyle='#ece4cc';ctx2.fillRect(X+a,Y+b,2,1);}ctx2.fillStyle='#e8f0ea';ctx2.fillRect(X-3,Y-9,1,5);}
{const _ps=playScene;playScene=function(id,title,html,done){try{if(id==='nan'&&title==='Nan’s price'&&!STG&&S.mode==='play'&&!S.room){
      const D=(typeof DOCKS!=='undefined'&&DOCKS.find(q=>Math.abs(q.x-128)<.5&&Math.abs(q.z-71.6)<.5))||{x:128,z:71.6};const nx=D.x+.42,nz=D.z+1.55;   // the end of the jetty, out over the river; the far bank is south
      const hid=OBJ.filter(q=>(q.kind==='tree'||q.kind==='pine')&&!q.hide&&Math.abs(q.x-nx)<6.5&&q.z>nz-2&&q.z<nz+5.5);for(const q of hid)q.hide=true;
      const pole={x:nx,z:nz+.05,draw(X,Y,t){const a=npcById('nan');if(!a)return;st37Pole(Math.round(sx(a.x)),Math.round(sz(a.z)),t,ST37.nanSlip);}};
      const jar={x:nx+.05,z:nz+.12,draw(X,Y){if(!ST37.nanSlip)st37Jar(X+2,Y);}};const fog={x:nx,z:nz+3.4,draw(X,Y,t){st37Fog(X,Y,t);}};
      ST37.nanSlip=0;sub('');
      stage({player:{x:D.x-.5,z:nz-.85,dir:'S'},cast:{nan:{x:nx,z:nz,dir:'S'}},cam:{x:nx-.2,z:nz+1.1},lead:300,show:true,props:[fog,pole,jar],
        beats:[{hold:1.1},{hold:.2,act(){stgTitle('Nan Pike — Nan’s price');}},{who:'nan',text:'No coin.'},{who:'nan',text:'Names.',face:{nan:'W'},act(){ST37.nanSlip=1;}},
          {who:'nan',text:'This one’s in his hand. It’s yours.'},{who:'nan',text:'He paid with it. Thirty years ago.'},{who:'nan',text:'So he could stay.'},{who:'nan',text:'Good man. Kept his word.'},
          {who:'nan',text:'You’re late, that’s all.',act(){setTimeout(()=>{ST37.nanSlip=0;},900);}},{hold:.9,face:{nan:'S'}}],
        done(){ST37.nanSlip=0;for(const q of hid)q.hide=false;done&&done();}});return;}}catch(e){}return _ps.apply(this,arguments);};}
// the reveals: the same punchline (your name, your face) kept for the photo of you asleep, the older you in the grave and the dummy;
// the others now say something new about the Tithe: whose name is on the big coffin, and who signs the notice
(function(){try{const b=SAGA.find(q=>q.id==='crypt');if(b&&typeof b.text==='string'){
    b.text=b.text.replace(/At the end of the last row there is one big coffin\.[\s\S]*?Tomorrow’s\./,'At the end of the last row there is one big coffin. New wood. Brass handles. The plate on the lid has been filed blank, over and over, until the brass is thin as paper. Under it, scratched small with a nail, the way a boy writes his name: <i>ELIAS.</i>');
    b.lore='Under the church: a hundred and fifty small empty coffins, names scratched inside the lids. At the end, a full-sized one with its plate filed blank, and scratched under it in a boy’s hand: ELIAS. Grandpa’s name.';}
  const w=ST_PLACES.find(p=>p.k==='wick');if(w){w.text=w.text.replace(/This year’s has your birthday on it\./,'Every one is signed at the bottom, in the same small hand, in the same brown ink: <i>H. Hale, churchwarden.</i> The one from 1871 too.');
    w.lore='Wickham posts the same notice every year: the drawing is at Marrow Hollow church. Every one, back to 1871, is signed in the same hand: H. Hale, churchwarden.';}
  if(SGT_PLACE&&SGT_PLACE.wick)SGT_PLACE.wick.cap=SGT_PLACE.wick.cap.replace(/This year’s has your birthday on it\./,'Every one is signed in the same hand: H. HALE, CHURCHWARDEN. The one from 1871 too.');
  {const _a=SGT_ART.p_wick;if(_a)SGT_ART.p_wick=function(){const c=_a.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
    const nx=46,ny=16,ink='#3a2414',t='H HALE';sgtT(P,t,nx+33-Math.floor((t.length*4-1)/2),ny+60,ink);}catch(e){}return c;};}
}catch(e){}})();
// the big coffin's plate in the crypt close-up: filed blank, ELIAS scratched under it
{const _c=st37Crypt;st37Crypt=function(){const c=_c.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};const bx=158,by=40,pw=20;
    {const nm=(NAME()||'MARSH').toUpperCase().slice(0,7);const ow=nm.length*4+3;P(bx-Math.ceil(ow/2)-1,by+27,ow+2,10,'#b8884a');}P(bx-Math.ceil(pw/2)-1,by+27,pw+2,10,'#0e0b0c');P(bx-Math.ceil(pw/2),by+28,pw,8,'#c8a048');P(bx-Math.ceil(pw/2),by+28,pw,1,'#f0d888');for(let y=0;y<7;y++)for(let x=0;x<pw;x+=1)if(st37H(x,y*3)%5<2)P(bx-Math.ceil(pw/2)+x,by+29+y,1,1,y%2?'#e8cc78':'#a88038');   // filed, file marks across it
    const t='ELIAS';const tx=bx-Math.ceil((t.length*4-1)/2);st37Txt(P,t,tx+1,by+42,'#5a3a18');st37Txt(P,t,tx,by+41,'#f0dcb4');}catch(e){}return c;};SGT_ART.crypt=st37Crypt;}
// Old Marrow: the line about the hearths only comes with a hearth in view, and then they glow, and the chimney breathes
{const _ro=rgnOnce;rgnOnce=function(k,text,hit){if(k==='marrow'){const ch=OBJ.filter(o=>o.spr==='rg_chimney'&&!o.hide);const near=ch.some(o=>Math.hypot(o.x-P.x,o.z-P.z)<6.5);if(!near)return false;
    const r=_ro.apply(this,arguments);if(r)ST37.hearth=S.day;return r;}return _ro.apply(this,arguments);};}
{const _go=glowObjs;glowObjs=function(){const r=_go.apply(this,arguments);try{if(ST37.hearth===S.day&&typeof nightK!=='undefined'&&nightK>.05&&!S.room){const t=performance.now()/1000;
    for(const o of OBJ){if(o.spr!=='rg_chimney'||o.hide)continue;const X=sx(o.x),Y=sz(o.z)-6;if(X<-80||X>VW+80||Y<-80||Y>VH+80)continue;const f=.85+.15*Math.sin(t*4.1+o.x);glowAt(X,Y,70,[255,120,30],1*nightK*f);glowAt(X,Y-4,30,[255,170,70],1*nightK*f);glowAt(X,Y-5,12,[255,236,180],1*nightK*f);
      const ph=(t+o.x*.37)%2.8;if(ph<.25&&Math.random()<.5){const top=(SPR.rg_chimney?SPR.rg_chimney.ay:60)/PPM;parts.push({x:o.x+(Math.random()-.5)*.3,z:o.z,y:top,vx:(Math.random()-.5)*.3,vz:0,vy:.6+Math.random()*.4,t:0,life:2,col:Math.random()<.5?'#b8b0aa':'#9a928c',size:5});}}}}catch(e){}return r;};}
// Ruth's wet footprints toward the corn: drawn when the line says so
const ST37_FP=[];function st37Print(){return st37Cv(5,7,(P)=>{P(1,0,3,4,'#1a1c22');P(1,5,3,2,'#1a1c22');P(2,1,1,2,'#3a4250');});}st37Reg('st37_fp',st37Print(),2,6);
{const _t=toast;toast=function(m){try{if(typeof m==='string'&&/Wet footprints lead toward the corn/.test(m)&&typeof ruth!=='undefined'){const fx=FIELD.x0+FIELD.w/2,fz=FIELD.z0+FIELD.h/2;let x=ruth.x||P.x,z=ruth.z||P.z;const d=Math.hypot(fx-x,fz-z)||1,ux=(fx-x)/d,uz=(fz-z)/d;
      for(let i=0;i<14;i++){const s=i%2?.12:-.12;ST37_FP.push(obj('st37_fp',x+ux*i*.55-uz*s,z+uz*i*.55+ux*s,{kind:'flat',noCol:true}));}ST37.fpDay=S.day;}}catch(e){}return _t.apply(this,arguments);};}
setInterval(()=>{try{if(ST37_FP.length&&ST37.fpDay!==S.day){for(const o of ST37_FP){const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}ST37_FP.length=0;}}catch(e){}},2000);
// rain on a storm night, drawn after the light so it can be seen: 2 px streaks, many more, splashes, brighter in the lightning
{const _ms=mindScreen;mindScreen=function(t){try{if(S.storm&&isNight()&&!S.room&&(S.mode==='play'||S.mode==='cine')){const fl=Math.min(1,(typeof flashT!=='undefined'?flashT:0));
      ctx2.fillStyle=`rgba(150,170,205,${(.32+.4*fl).toFixed(3)})`;for(let i=0;i<260;i++){const x=((hash(i,7)*VW*1.2+t*70)%(VW*1.2))-VW*.1,y=(hash(i,8)*VH+t*(560+hash(i,9)*160))%VH;const X=Math.round(x),Y=Math.round(y);for(let k=0;k<8;k++)ctx2.fillRect(X-(k>>2),Y+k,2,1);}
      ctx2.fillStyle=`rgba(190,205,230,${(.35+.3*fl).toFixed(3)})`;for(let i=0;i<70;i++){const ph=(t*3+hash(i,11))%1;if(ph>.35)continue;const X=Math.round(hash(i,12)*VW),Y=Math.round(hash(i,13)*VH+Math.floor(t*3+hash(i,11))*37)%VH;const w=ph<.15?3:5;ctx2.fillRect(X-(w>>1),Y,w,1);if(ph<.15)ctx2.fillRect(X,Y-1,1,1);}}}catch(e){}return _ms.apply(this,arguments);};}
// the Count's find that lay in the Tithe House's clearing (a child's shoe, which read as a second pair of shoes) is moved out past the ring
setTimeout(function st37MoveFind(){try{if(typeof RGC==='undefined'||!RGC.length||RGC.some(c=>c.x==null)){setTimeout(st37MoveFind,1000);return;}
  for(const c of RGC){if(Math.hypot(c.x-TITHE.x,c.z-TITHE.z)>10.5)continue;const ox=c.x,oz=c.z;const s=rgcSpot(TITHE.x+11.5,TITHE.z+7.5);c.x=s.x;c.z=s.z;
    const o=RGC_OBJ[c.id];if(o){o.x=s.x;o.z=s.z;}const it=interact.find(q=>Math.abs(q.x-ox)<.01&&Math.abs(q.z-(oz+.15))<.01);if(it){it.x=s.x;it.z=s.z+.15;}}}catch(e){}},1500);
// r2c: the deer's body as a deer, not a disc: a deep chest, a dip behind the withers, a round haunch, the belly tucked up between;
// bent legs with dark hooves; a big ear standing off the head; the flank opened as a gash with the ribs showing in it
function st37Deer(){return st37Cv(ST37W,ST37H,(P)=>{st37Dirt(P,ST37W,ST37H,11);for(let x=0;x<ST37W;x++){P(x,12+(x>>4)%2,1,2,'#2e1e12');P(x,102+(x>>5)%2,1,2,'#2e1e12');}
  const oc='#1a0e08',cx=96,cy=54;
  const lerpK=(pts,x)=>{for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];if(x<=x1){const u=(x-x0)/(x1-x0),s=(1-Math.cos(Math.PI*u))/2;return y0+(y1-y0)*s;}}return pts[pts.length-1][1];};
  const BACK=[[-30,-6],[-24,-11],[-14,-10],[-2,-9],[10,-11],[20,-12],[28,-8],[33,-1]],BELLY=[[-30,5],[-24,10],[-14,9],[-2,6],[8,6],[18,10],[27,8],[33,1]];
  const top=x=>Math.round(cy+lerpK(BACK,x-cx)),bot=x=>Math.round(cy+lerpK(BELLY,x-cx));
  // the pool under it, close to the belly and spreading below the wound
  for(let x=cx-30;x<=cx+30;x++){const b=bot(x);const d=Math.round(4*Math.max(0,1-Math.abs(x-cx+2)/26));for(let y=b+1;y<=b+1+d;y++)P(x,y,1,1,y<b+3?'#2a0806':'#3c0a08');}
  // the legs: far pair darker, behind; each bends once (knee forward on the forelegs, hock back on the hind legs); dark hooves
  const leg=(pts,far)=>{for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b),1);for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n),w=i===1?3:2;P(x-1,y-1,w+2,w+2,oc);}}
    for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b),1);for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n),w=i===1?3:2;P(x,y,w,w,far?'#6a4628':'#9a6c40');P(x,y,1,1,far?'#7e5632':'#b88654');}}
    const [hx,hy]=pts[pts.length-1];P(hx-1,hy-1,4,4,oc);P(hx,hy,3,2,'#141010');P(hx,hy,1,1,'#4a4444');};
  leg([[cx-22,cy+6],[cx-34,cy+16],[cx-46,cy+20]],1);leg([[cx-18,cy+8],[cx-28,cy+20],[cx-40,cy+27]],0);
  leg([[cx+16,cy+6],[cx+30,cy+12],[cx+44,cy+22]],1);leg([[cx+20,cy+8],[cx+32,cy+20],[cx+46,cy+30]],0);
  // the body: dark along the spine, warm brown, a lighter side, the pale belly only along its edge; the haunch rounded with its own light
  for(let x=cx-30;x<=cx+33;x++){const t=top(x),b=bot(x);for(let y=t;y<=b;y++){const v=(y-t)/Math.max(1,b-t);let c=v<.14?'#6e4a2a':v<.5?'#a07040':v<.8?'#b8884e':'#e2d2b2';
      const hh=((x-(cx+20))/11)**2+((y-(cy-2))/8)**2;if(hh<1&&hh>.72&&y<cy)c='#c89a62';const sh=((x-(cx-21))/8)**2+((y-(cy-3))/7)**2;if(sh<1&&sh>.75&&y<cy+1)c='#8a5e34';P(x,y,1,1,c);}
    P(x,t-1,1,1,oc);P(x,b+1,1,1,oc);}
  for(let y=top(cx-30);y<=bot(cx-30);y++)P(cx-31,y,1,1,oc);for(let y=top(cx+33);y<=bot(cx+33);y++)P(cx+34,y,1,1,oc);
  P(cx+32,cy-6,4,4,oc);P(cx+33,cy-5,3,2,'#f6eee0');   // the white scut
  // the flank opened: a long gash, dark red, the ribs pale curves inside it
  for(let x=cx-10;x<=cx+12;x++){const k=1-Math.abs(x-cx-1)/11.5;const h=Math.round(5*k);for(let y=cy-2-h;y<=cy-1+Math.round(h*.6);y++)P(x,y,1,1,y===cy-2-h||y===cy-1+Math.round(h*.6)?'#5a0c08':'#3a0605');}
  for(const r of [-6,-1,4,9]){for(let t=0;t<7;t++){const x=cx+r+Math.round(Math.sin(t/6*Math.PI)*1.6),y=cy-6+t;const k=1-Math.abs(x-cx-1)/11.5,h=Math.round(5*k);if(y>cy-2-h&&y<cy-1+Math.round(h*.6))P(x,y,1,1,t<3?'#f4e8d0':'#cdbca2');}}
  // the neck from the chest, the head laid flat in line with it, the eye open, a big ear standing off the skull
  for(let i=0;i<14;i++){const x=cx-31-i,t=cy-7+Math.round(i*.25),w=11-Math.round(i*.35);P(x,t-1,1,1,oc);P(x,t+w,1,1,oc);for(let k=0;k<w;k++)P(x,t+k,1,1,k<2?'#7a5230':k<w-3?'#a87a48':'#e2d2b2');}
  const hx=cx-62,hy=cy-5;for(let y=0;y<11;y++)for(let x=0;x<19;x++){const e=((x-11)/9)**2+((y-5)/5.4)**2;const snout=x<7&&y>2&&y<10&&x>(9-y)*.4;if(e>1&&!snout)continue;P(hx+x,hy+y,1,1,y<3?'#8a5e36':y<7?'#a87a48':'#dccaa8');}
  for(let x=0;x<20;x++){P(hx+x,hy-1+(x<6?2:0),1,1,oc);P(hx+x,hy+11,1,1,oc);}P(hx-1,hy+3,1,7,oc);P(hx,hy+4,3,3,'#141010');P(hx,hy+4,1,1,'#4a4444');
  P(hx+10,hy+3,3,2,'#141010');P(hx+10,hy+3,1,1,'#f0e8dc');P(hx+9,hy+2,5,1,'#5a3a20');   // the open eye under its brow
  const ear=[[0,0],[3,-4],[8,-8],[13,-9],[15,-7],[12,-3],[6,1]];const ex=hx+13,ey=hy+1;   // the ear, big, cupped, standing up and back
  {const xs=ear.map(p=>p[0]),ys=ear.map(p=>p[1]);const inE=(x,y)=>{let c=false;for(let i=0,j=ear.length-1;i<ear.length;j=i++){const [xi,yi]=ear[i],[xj,yj]=ear[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
    for(let y=Math.min(...ys)-1;y<=Math.max(...ys)+1;y++)for(let x=Math.min(...xs)-1;x<=Math.max(...xs)+1;x++){const i=inE(x+.5,y+.5);const nb=inE(x+1.5,y+.5)||inE(x-.5,y+.5)||inE(x+.5,y+1.5)||inE(x+.5,y-.5);if(!i&&nb)P(ex+x,ey+y,1,1,oc);}
    for(let y=Math.min(...ys);y<=Math.max(...ys);y++)for(let x=Math.min(...xs);x<=Math.max(...xs);x++){if(!inE(x+.5,y+.5))continue;const inner=inE(x+1.5,y+1.5)&&inE(x-.5,y+.5)&&inE(x+.5,y-.5)&&x>2;P(ex+x,ey+y,1,1,inner?(y<-5?'#c88a80':'#a86a62'):'#9a6c40');}}
  // twelve cuts at the hours: each its own shape, meat with a pale rind, some with a bone end
  const RX=74,RY=46;for(let h=0;h<12;h++){const a=h/12*Math.PI*2-Math.PI/2,x=Math.round(cx+Math.cos(a)*RX)-4,y=Math.round(cy+2+Math.sin(a)*RY)-2;if(y<3||y>ST37H-8||x<12)continue;
    const w=6+st37H(h,2)%4,hh=4+st37H(2,h)%2;P(x-1,y-1,w+2,hh+2,'#1a0604');for(let yy=0;yy<hh;yy++)for(let xx=0;xx<w;xx++){if((xx===0||xx===w-1)&&(yy===0||yy===hh-1))continue;P(x+xx,y+yy,1,1,yy===0?'#ecd8bc':xx<w*.5?'#a8302a':'#7e1812');}
    if(h%3===0){P(x+w,y+1,3,2,'#f0e8d8');P(x+w+2,y,1,1,'#f0e8d8');}P(x,y+hh+1,w,1,'#2a0806');}
  // the hand: a peeled stick from the middle out to the rim, to the cabin door's edge
  for(let i=0;i<84;i++){const x=Math.round(cx-2-i*1.06),y=Math.round(cy-4-i*.6);if(x<12||y<0)break;P(x,y,2,2,'#2a1a10');P(x,y,1,1,'#e0c8a0');}
  P(0,0,12,20,'#3a2a1c');P(0,0,12,1,'#6a5038');P(11,0,1,20,'#1a1008');P(2,10,2,2,'#b89040');P(0,19,12,1,'#1a1008');
  P(cx-5,cy-7,7,6,'#141010');P(cx-4,cy-6,5,4,'#7a7880');P(cx-4,cy-6,3,1,'#a8a6ae');});}
SGT_ART.deer37=st37Deer;
// r3: the credits roll over the valley at dawn itself, painted (the same picture as the end card), at a whole-number scale, edge to edge
{const css=document.createElement('style');css.textContent=`#credits2.st37dawn{background:#3a2430!important}#credits2.st37dawn>*:not(#st37cbg){position:relative;z-index:1}
#credits2.st37dawn *{text-shadow:0 2px 0 rgba(20,10,16,.85),0 0 6px rgba(20,10,16,.6)}#st37cbg{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);image-rendering:pixelated;z-index:0;pointer-events:none}
#st37cbgv{position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(to bottom,rgba(40,20,30,0) 45%,rgba(30,14,22,.55) 100%)}`;document.head.appendChild(css);}
setInterval(()=>{try{const el=$('credits2');if(!el)return;const on=el.classList.contains('st37dawn')&&getComputedStyle(el).display!=='none';let c=$('st37cbg');
  if(!on){if(c)c.remove();const v=$('st37cbgv');if(v)v.remove();return;}
  if(!c){c=document.createElement('canvas');c.id='st37cbg';st37Dawn(c);el.prepend(c);const v=document.createElement('div');v.id='st37cbgv';c.after(v);}
  const k=Math.max(1,Math.ceil(Math.max(innerWidth/160,innerHeight/90)));c.style.width=(160*k)+'px';c.style.height=(90*k)+'px';}catch(e){}},200);
// r3: Chapter One's end: the hat in the ash is the picture; the words sit above it, and the dark lifts off the bottom of the screen
{const css=document.createElement('style');css.textContent=`#end.st37ch1{background:linear-gradient(to bottom,rgba(10,8,8,.86) 0%,rgba(10,8,8,.78) 52%,rgba(10,8,8,.12) 74%,rgba(10,8,8,0) 100%)!important;justify-content:flex-start!important;padding-top:6vh!important}`;document.head.appendChild(css);}
setInterval(()=>{try{const e=$('end');if(!e||e.hidden||!e.classList.contains('st37ch1')||typeof ritual==='undefined'||!ritual||!ritual.hat){if(cine&&cine._hat37){P.x=cine._px;P.z=cine._pz;cine=null;}return;}
  if(!cine||!cine._hat37){const px=P.x,pz=P.z;P.x=ritual.hat.x+40;cine={_hat37:1,_px:px,_pz:pz,hidePlayer:true,cam:{x:ritual.hat.x,z:ritual.hat.z-2.1},drawables(D){},light(L){const X=sx(ritual.hat.x),Y=sz(ritual.hat.z);glowAt(X,Y-2,58,[255,176,96],.95);glowAt(X,Y-4,16,[255,220,160],.9);}};}}catch(e){}},300);
// ======== r3 close-ups
// shared: fill a polygon; a soft-free ellipse; a groove scratched into a surface (dark cut, lit lip below-right)
const st37Poly=(P,pts,col)=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);const inP=(x,y)=>{let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
  for(let y=Math.floor(Math.min(...ys));y<=Math.ceil(Math.max(...ys));y++)for(let x=Math.floor(Math.min(...xs));x<=Math.ceil(Math.max(...xs));x++)if(inP(x+.5,y+.5)){const c=typeof col==='function'?col(x,y):col;if(c)P(x,y,1,1,c);}};
const st37Ell=(P,cx,cy,rx,ry,col)=>{for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));if(w>0)P(cx-w,cy+y,w*2,1,typeof col==='function'?col(y):col);}};
const st37Groove=(P,pts,dark,lip)=>{for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b),1);for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);P(x+1,y+1,1,1,lip);}}
  for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b),1);for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);P(x,y,1,1,dark);}}};
// ELIAS, scratched by a child: uneven strokes, each a dark groove with a lit lip
function st37ScratchName(P,x0,y0,dark,lip,kx){kx=kx||1;const L={E:[[[0,0],[0,7]],[[0,0],[4,0]],[[0,3],[3,4]],[[0,7],[4,7]]],L:[[[0,0],[0,7]],[[0,7],[4,7]]],I:[[[1,0],[1,7]]],A:[[[0,7],[2,0]],[[2,0],[4,7]],[[1,4],[3,4]]],S:[[[4,0],[0,1]],[[0,1],[1,3]],[[1,3],[4,4]],[[4,4],[3,7]],[[3,7],[0,6]]]};
  let x=x0;['E','L','I','A','S'].forEach((ch,i)=>{const dy=[0,1,-1,1,0][i],sl=[0,1,0,-1,1][i];for(const s of L[ch])st37Groove(P,s.map(([a,b])=>[x+Math.round(a*kx)+Math.round(b*sl/7),y0+dy+b+(i===3&&b===0?-1:0)]),dark,lip);x+=ch==='I'?3:Math.round(4*kx)+2+(i%2);});}
// the well: the bucket seen from above its rim, the braid coiled inside on the black water, its plaited end over the rim, tied off, the tooth in the tie
function st37Well3(){const hair=st37Ramp(S.look&&S.look.hair);return st37Cv(ST37W,ST37H,(P)=>{
  for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++){const r=(y+((x>>4)%2)*3)%9,c=(x+((y/9|0)%2)*8)%16;P(x,y,1,1,r===0||c===0?'#141218':st37H(x>>2,y>>2)<14?'#24222a':'#1e1c24');}   // the well shaft's stones, wet
  for(let y=0;y<14;y++)P(87,y,2,1,y%3?'#8a7a5a':'#a8946a');   // the rope
  const cx=88,ry=12,rx=46,ty=34;
  // the bail, iron, from the rope to the bucket's ears
  for(let a=0;a<=Math.PI;a+=.02){const x=Math.round(cx+Math.cos(a)*(rx+2)),y=Math.round(ty-2-Math.sin(a)*20);P(x,y,1,2,'#3a3a44');P(x,y,1,1,'#7a7a86');}
  // the bucket: staves gone grey with the wet, darkening into the curve, three iron hoops
  for(let y=ty;y<104;y++){const k=(y-ty)/70,w=Math.round(rx-k*7);for(let x=-w;x<=w;x++){const u=(x+w)/(2*w),st=Math.floor((x+w)/7);let c=u<.12||u>.88?'#2c2a28':u<.3?'#46443e':u<.7?'#5e5a50':'#4a4740';if((x+w)%7===0)c='#1c1a18';if(st37H(st,y>>3)<10&&u>.3&&u<.7)c='#6a665a';P(cx+x,y,1,1,c);}
    P(cx-w-1,y,1,1,'#120a06');P(cx+w+1,y,1,1,'#120a06');}
  for(const hy of [ty+16,ty+40,ty+62]){const k=(hy-ty)/70,w=Math.round(rx-k*7);P(cx-w,hy,2*w+1,3,'#2c2c34');P(cx-w,hy,2*w+1,1,'#6a6a76');P(cx-w+4,hy+1,3,1,'#9a9aa6');}
  // the rim and, inside it, black water
  st37Ell(P,cx,ty,rx+1,ry+1,'#120a06');st37Ell(P,cx,ty,rx,ry,'#7a766a');st37Ell(P,cx,ty+1,rx-3,ry-2,'#3a3832');st37Ell(P,cx,ty+2,rx-5,ry-3,y=>y<-3?'#101418':'#080a0e');
  for(let x=-30;x<30;x+=7)P(cx+x,ty+4,4,1,'#1e2a30');
  // the braid, coiled once round inside the rim on the water: three strands plaited (alternating chevrons), the colour of your hair
  const strand=(pts,w0,w1)=>{let tot=0;const seg=[];for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(d);tot+=d;}
    let acc=0;for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(1,Math.ceil(seg[i-1]));for(let k=0;k<=n;k++){const u=(acc+seg[i-1]*k/n)/tot,w=Math.max(1,Math.round(w0+(w1-w0)*u)),x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);
      P(x-Math.floor(w/2)-1,y-Math.floor(w/2)-1,w+2,w+2,'#0e0806');}acc+=seg[i-1];}
    acc=0;for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i],n=Math.max(1,Math.ceil(seg[i-1]));for(let k=0;k<=n;k++){const t=acc+seg[i-1]*k/n,u=t/tot,w=Math.max(1,Math.round(w0+(w1-w0)*u)),x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n);
      const ph=Math.floor(t/2.5)%3;for(let yy=0;yy<w;yy++)for(let xx=0;xx<w;xx++){const side=(xx+yy+ph)%3;P(x-Math.floor(w/2)+xx,y-Math.floor(w/2)+yy,1,1,side===0?hair[3]||hair[2]:side===1?hair[1]:hair[0]);}}acc+=seg[i-1];}};
  const coil=[];for(let a=Math.PI*.9;a<=Math.PI*2.75;a+=.12)coil.push([cx+Math.cos(a)*24,ty+3+Math.sin(a)*4.5]);strand(coil,4,4);
  const end=[coil[coil.length-1],[cx+30,ty+2],[cx+38,ty],[cx+45,ty+4],[cx+46,ty+14],[cx+45,ty+24]];strand(end,4,2);
  for(let i=0;i<coil.length;i+=2){const [x,y]=coil[i];if(y<ty+3)P(Math.round(x),Math.round(y)-2,2,1,hair[3]||'#8a6040');}   // the sheen along the top of the plait
  // the tie: dark thread wound three times; the tooth knotted into it, crown down, root up, a little red at the root
  const tx=cx+45,tyy=ty+25;P(tx-3,tyy,6,4,'#0e0806');for(let i=0;i<3;i++)P(tx-2,tyy+i,5,1,i%2?'#2a1a14':'#4a2a20');P(tx+3,tyy+1,4,1,'#2a1a14');P(tx+6,tyy+2,1,3,'#2a1a14');
  P(tx-3,tyy+4,7,8,'#0e0806');P(tx-2,tyy+5,5,6,'#f2ece0');P(tx-2,tyy+5,1,6,'#ffffff');P(tx+2,tyy+5,1,6,'#c8bfae');P(tx-1,tyy+10,3,1,'#d8d0c0');P(tx-1,tyy+11,1,2,'#d0c4b0');P(tx+1,tyy+11,1,2,'#d0c4b0');   // the crown, two roots
  P(tx-1,tyy+12,1,1,'#a8342c');P(tx+1,tyy+12,1,1,'#a8342c');
  // the brass tag on a wire from the bail
  for(let i=0;i<10;i++)P(cx-40+Math.round(i*.3),ty-14+i,1,1,'#8a8a96');const gx=cx-56,gy=ty-4;P(gx-1,gy-1,42,16,'#1a1206');P(gx,gy,40,14,'#b89040');P(gx,gy,40,1,'#e8c870');P(gx,gy+13,40,1,'#7a5a20');P(gx+2,gy+2,2,2,'#5a4010');
  st37Txt(P,'HOLLOW',gx+7,gy+1,'#4a3008');st37Txt(P,'ACRE 1874',gx+2,gy+7,'#4a3008');
  for(const [x,y] of [[cx-20,103],[cx+12,100],[cx+30,106]])P(x,y,1,3,'#3a5a6a');});}
st37Well=st37Well3;SGT_ART.well=st37Well3;
// the drawing slip: ROBYN, Grandpa's spelling of your name, in plain upright capitals; Hale's thumb over the front, his knuckles and his black cuff
function st37Slip3(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,(x>>3)%2?'#16110f':'#120e0c');
  const sx0=24,sy0=14,sw=128,sh=60;P(sx0-1,sy0-1,sw+2,sh+2,'#0a0706');P(sx0,sy0,sw,sh,'#e8dcc0');P(sx0,sy0,sw,1,'#f6eedc');P(sx0,sy0+sh-1,sw,1,'#b8aa8a');
  for(let x=sx0;x<sx0+sw;x++){if(st37H(x,3)%4===0)P(x,sy0,1,1,'#120e0c');if(st37H(x,5)%5===0)P(x,sy0+1,1,1,'#d0c2a2');}   // torn from a page along the top
  P(sx0,sy0+29,sw,1,'#c8b898');P(sx0,sy0+30,sw,1,'#f2e8d0');P(sx0+sw/2|0,sy0,1,sh,'#d8caa8');   // the folds it was kept in
  const nm=st37OldSpell(NAME()||'Robin').replace(/[^A-Z]/g,'').slice(0,8);const sc=nm.length>6?2:3;const tw=nm.length*4*sc-sc;const tx=sx0+Math.round((sw-tw)/2),ty=sy0+16;
  st37Txt(P,nm,tx+1,ty+1,'#c8b898',sc);st37Txt(P,nm,tx,ty,'#2a1c24',sc);
  // under it, smaller, the first time it was written: thirty years ago, in the same hand
  P(sx0+18,ty+sc*5+8,sw-36,1,'#b0a080');
  // the thumb, over the front of the slip at its lower left; the knuckles below; the black sleeve and its white cuff
  const sk=['#3a2016','#8a5a3e','#a8704e','#c08a62','#d8a47a'];
  for(let y=0;y<20;y++){const w=Math.round(10-Math.max(0,y-14)*.5);for(let x=0;x<w;x++){const c=x===0||x===w-1?sk[0]:x<2?sk[1]:x<w-3?sk[3]:sk[2];P(30+x+Math.round(y*.15),sy0+sh-14+y,1,1,c);}}
  P(32,sy0+sh-13,5,4,'#e8c8b0');P(32,sy0+sh-13,5,1,'#f4dcc8');P(33,sy0+sh-10,3,1,'#c8a088');   // the thumbnail
  for(let i=0;i<4;i++){const kx=44+i*14,ky=sy0+sh+2;st37Ell(P,kx,ky,7,4,sk[0]);st37Ell(P,kx,ky,6,3,sk[2]);P(kx-3,ky-2,5,1,sk[4]);P(kx-1,ky-1,2,1,sk[3]);}   // knuckles, the fingers behind the paper
  for(let i=0;i<3;i++){const kx=51+i*14;for(let y=sy0+sh+1;y<sy0+sh+12;y++)P(kx,y,1,1,sk[0]);}
  for(let y=sy0+sh+4;y<ST37H;y++){const x0=30+Math.round((y-sy0-sh)*.6),x1=104-Math.round((y-sy0-sh)*.3);for(let x=x0;x<x1;x++)P(x,y,1,1,x<x0+3?sk[1]:x>x1-4?sk[1]:sk[2]);}
  for(let y=ST37H-12;y<ST37H;y++){P(36,y,78,1,y<ST37H-9?'#e8e4dc':'#c8c4bc');}P(36,ST37H-13,78,1,'#0a0706');for(let y=ST37H-8;y<ST37H;y++)P(38,y,74,1,'#141418');P(38,ST37H-8,74,1,'#2a2a32');   // the cuff and the sleeve
  });}
st37Slip=st37Slip3;SGT_ART.slip37=st37Slip3;
// the slip: ROBYN in Hale's upright capitals; Hale's hand holds it from below: his thumb pressed on the front with its nail and joint,
// the fingers behind it (their tips show faintly through the thin paper), the index knuckle where it bends round the edge; a white cuff, a black sleeve
function st37Slip4(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,(x>>3)%2?'#16110f':'#120e0c');
  const sx0=24,sy0=14,sw=128,sh=60,pb=sy0+sh-1;P(sx0-1,sy0-1,sw+2,sh+2,'#0a0706');P(sx0,sy0,sw,sh,'#e8dcc0');P(sx0,sy0,sw,1,'#f6eedc');P(sx0,pb,sw,1,'#b8aa8a');
  for(let x=sx0;x<sx0+sw;x++){if(st37H(x,3)%4===0)P(x,sy0,1,1,'#120e0c');if(st37H(x,5)%5===0)P(x,sy0+1,1,1,'#d0c2a2');}
  P(sx0,sy0+29,sw,1,'#c8b898');P(sx0,sy0+30,sw,1,'#f2e8d0');P(sx0+sw/2|0,sy0,1,sh,'#d8caa8');
  const nm=st37OldSpell(NAME()||'Robin').replace(/[^A-Z]/g,'').slice(0,8);const sc=nm.length>6?2:3;const tw=nm.length*4*sc-sc;const tx=sx0+Math.round((sw-tw)/2),ty=sy0+16;
  st37Txt(P,nm,tx+1,ty+1,'#c8b898',sc);st37Txt(P,nm,tx,ty,'#2a1c24',sc);P(sx0+18,ty+sc*5+8,sw-36,1,'#b0a080');
  const seg=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay;let t=((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy);t=Math.max(0,Math.min(1,t));return [Math.hypot(px-ax-t*dx,py-ay-t*dy),t];};
  // the fingers behind the paper, shadowed through it
  for(const [fx,fy] of [[52,66],[60,67],[67,69]])for(let y=fy;y<=pb;y++)for(let x=fx-3;x<=fx+3;x++){const r=((x-fx)/3.4)**2+((y-fy)/4)**2;if(y>fy+3||r<1)P(x,y,1,1,y<fy+2?'#ddd0b2':'#d6c8a8');}
  const thumb=(x,y)=>seg(x+.5,y+.5,40,87,45,63)[0]<5;
  const hand=(x,y)=>{if(y<=pb)return false;if(seg(x+.5,y+.5,43,81,66,72)[0]<4.6)return true;   // the index finger, bending round the edge
    if(((x+.5-46)/13)**2+((y+.5-86)/10)**2<1)return true;if(y>=86&&y<100&&x>=37-(y-86)*.1&&x<=57-(y-86)*.2)return true;return false;};
  const all=(x,y)=>thumb(x,y)||hand(x,y);
  const O='#3a2016',S2='#6e4430',S1='#8e5c3e',M='#ac7450',L='#c68c62',H='#dcaa80';
  for(let y=50;y<104;y++)for(let x=28;x<76;x++){const th=thumb(x,y),hd=hand(x,y);
    if(!th&&!hd){if(y<=pb&&x>=sx0&&(thumb(x-1,y-1)||thumb(x-2,y-1)))P(x,y,1,1,'#c4b494');continue;}   // the thumb's shadow on the paper
    const mine=th?thumb:all;let col=M;
    if(!mine(x-1,y)||!mine(x+1,y)||!mine(x,y-1)||!mine(x,y+1))col=O;
    else if(!mine(x-1,y-1)||!mine(x-2,y-1)||!mine(x-1,y-2))col=H;else if(!mine(x-2,y-2))col=L;
    else if(!mine(x+1,y+1)||!mine(x+2,y+1))col=S1;else if(!mine(x+2,y+2))col=S1;
    if(!th&&col!==O&&thumb(x-1,y-1))col=S2;   // where the thumb lies over the hand
    if(!th&&col!==O&&thumb(x-1,y)&&thumb(x-1,y-1))col=S2;
    P(x,y,1,1,col);}
  // the thumbnail and the joint
  const nail=(x,y)=>{const [d,t]=seg(x+.5,y+.5,40,87,45,63);return t>.78&&d<3&&thumb(x,y);};
  for(let y=56;y<66;y++)for(let x=40;x<52;x++)if(nail(x,y)){P(x,y,1,1,'#e8c2aa');if(!nail(x-1,y-1))P(x,y,1,1,'#f6dccc');if(!nail(x+1,y+1))P(x,y,1,1,'#c89a84');}
  P(41,71,6,1,'#8e5c3e');P(42,72,4,1,'#c68c62');   // the joint crease of the thumb
  // the index knuckle, round where it bends behind the paper, and the creases of the hand
  P(55,75,3,1,'#dcaa80');P(54,76,1,1,'#dcaa80');P(57,78,3,1,'#8e5c3e');P(58,77,2,1,'#8e5c3e');P(49,79,2,1,'#c68c62');P(50,80,1,2,'#8e5c3e');P(53,83,4,1,'#8e5c3e');P(44,92,6,1,'#8e5c3e');
  // the cuff and the black sleeve
  for(let y=97;y<104;y++)P(33,y,29,1,y===97?'#0a0706':y<99?'#f4f0e8':y<102?'#e2ded6':'#b8b4ac');P(33,97,1,7,'#0a0706');P(61,97,1,7,'#0a0706');P(47,99,2,2,'#9a968e');
  for(let y=104;y<ST37H;y++){P(31,y,33,1,'#1a1a20');P(31,y,1,1,'#0a0706');P(63,y,1,1,'#0a0706');P(32,y,3,1,'#2c2c36');}P(31,104,33,1,'#0a0706');
  });}
st37Slip=st37Slip4;SGT_ART.slip37=st37Slip4;
// the quarry: blocky strata, and a person-shaped recess cut into them: its upper-left inner walls in black shadow, its lower-right inner walls
// catching the light, a dark back, a lit lip along the lower rim; long gouges on the back wall end in three fingernails
function st37Quarry3(){return st37Cv(ST37W,ST37H,(P)=>{const G=['#5e5a64','#6a6670','#56525c','#726e78','#625e68'];let y=0,b=0;
  while(y<ST37H){const h=[7,5,9,6,8,4,7,10,6,5,8][b%11],c=G[b%5];for(let yy=y;yy<y+h&&yy<ST37H;yy++)for(let x=0;x<ST37W;x++){let col=c;if(yy===y)col='#86828c';else if(yy===y+h-1)col='#3e3a44';else if(st37H(x>>2,yy>>2)<6)col='#4e4a54';P(x,yy,1,1,col);}
    let x=st37H(b,7)%18;while(x<ST37W){P(x,y+1,1,h-2,'#3a3640');P(x+1,y+1,1,h-2,'#7e7a84');x+=14+st37H(x,b)%20;}y+=h;b++;}
  const cx=88,fig=(x,y)=>{const head=((x-cx)/8)**2+((y-24)/9)**2<1;const neck=Math.abs(x-cx)<4&&y>=32&&y<36;const body=Math.abs(x-cx)<15-Math.max(0,(y-60)*.2)&&y>=35&&y<76;
    const armL=Math.abs((x-(cx-26))-(y-44)*.55)<4.5&&y>12&&y<60;const armR=Math.abs((x-(cx+26))+(y-44)*.55)<4.5&&y>12&&y<60;const legL=x>cx-12&&x<cx-2&&y>=74&&y<106;const legR=x>cx+2&&x<cx+12&&y>=74&&y<106;return head||neck||body||armL||armR||legL||legR;};
  for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++){if(!fig(x,y)){if(fig(x-1,y-1)&&!fig(x,y))P(x,y,1,1,'#c4c0ca');else if(fig(x+1,y+1))P(x,y,1,1,'#2a2630');continue;}
    let d=0;while(d<7&&fig(x-d-1,y-d-1))d++;let e=0;while(e<4&&fig(x+e+1,y+e+1))e++;
    let col=d<4?'#0a080c':d<6?'#16141a':'#2a2830';if(e===0)col='#a29eac';else if(e===1)col='#7e7a88';else if(e===2&&d>=4)col='#5a5664';
    if(col==='#2a2830'&&((x*3+y*5)%17===0))col='#34323a';P(x,y,1,1,col);}
  // the gouges, scratched from inside: long, pale, ending in the nails at the top of the right arm
  const ends=[[cx+31,14],[cx+34,17],[cx+29,19]];ends.forEach(([ex,ey],i)=>{const sx=ex-14-i*3,sy=ey+22+i*4;st37Groove(P,[[sx,sy],[ex,ey]],'#08060a','#8a8692');});
  ends.forEach(([ex,ey])=>{P(ex-1,ey-1,4,3,'#2a0e10');P(ex,ey-1,2,1,'#f0b0b0');P(ex-1,ey,1,1,'#e09898');P(ex+2,ey,1,1,'#e09898');P(ex,ey,2,1,'#c87878');});
  for(const [x0,y0,x1,y1] of [[cx-6,40,cx-14,62],[cx+4,42,cx+10,66],[cx-30,24,cx-24,40]])st37Groove(P,[[x0,y0],[x1,y1]],'#08060a','#6e6a76');
  });}
/* r4: superseded by st37Quarry4 (r2's wavy strata) */
// the orchard: the lowest apple, big, with a child's bite scalloped out of it and the milk tooth still in the bite
{const _o=SGT_DRAW.orchard;const st37Orchard3=function(){const c=_o.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
    const ax=106,ay=78,r=10;g.clearRect(ax-12,ay-20,26,34);for(let y=ay-20;y<ay+14;y++)for(let x=ax-12;x<ax+14;x++)P(x,y,1,1,y<70?(((x>>4)+(y>>4))%2?'#1c1a22':'#1e1c24'):'#16141a');
    for(let y=ay-24;y<ay-r;y++)P(ax+Math.round((y-ay+24)*.1),y,1,1,'#3a2a1a');P(ax+1,ay-r-2,4,2,'#4a6a28');   // the stalk from the twig, a leaf
    st37Ell(P,ax,ay,r+1,r+1,'#1a0806');st37Ell(P,ax,ay,r,r,y=>y<-5?'#c8302a':y<3?'#a8221e':'#7a1614');P(ax-6,ay-7,3,2,'#e86858');P(ax-7,ay-5,1,2,'#e86858');
    // the bite, scalloped (three tooth-marks deep), pale flesh browning at the edge
    for(let y=-6;y<=6;y++)for(let x=-r-1;x<=0;x++){const inBite=[[-9,-4],[-10,0],[-9,4]].some(([bx,by])=>((x-bx)/4)**2+((y-by)/3.2)**2<1);if(!inBite)continue;const px=ax+x,py=ay+y;if(((px-ax)/r)**2+((py-ay)/r)**2>1.05)continue;P(px,py,1,1,'#f0dcae');}
    for(let y=-7;y<=7;y++)for(let x=-r-1;x<=1;x++){const px=ax+x,py=ay+y;const a=g.getImageData(px,py,1,1).data;const n=g.getImageData(px+1,py,1,1).data;if(a[0]===240&&a[1]===220&&!(n[0]===240&&n[1]===220))P(px+1,py,1,1,'#a87a40');}
    P(ax-9,ay-2,6,7,'#4a3a2a');P(ax-8,ay-2,4,5,'#f8f4ea');P(ax-8,ay-2,1,5,'#ffffff');P(ax-5,ay-1,1,4,'#c8c0ae');P(ax-8,ay+3,4,1,'#9a8a70');   // the milk tooth, set in the bite, its shadow under it
  }catch(e){}return c;};SGT_DRAW.orchard=st37Orchard3;}
// the crypt: ELIAS scratched in as grooves in a child's uneven hand; the plate filed in one direction only
/* r4: the r3 crypt lid (ELIAS scratched) is set aside for r2's readable ELIAS: st37Crypt4 */{const _c=SGT_ART.crypt;const st37CryptR3=function(){const c=_c.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};const bx=158,by=40,pw=20;
    P(bx-Math.ceil(pw/2),by+28,pw,8,'#c8a048');P(bx-Math.ceil(pw/2),by+28,pw,1,'#f0d888');for(let y=0;y<7;y++)for(let x=0;x<pw;x++)if((x+y*2)%5===0)P(bx-Math.ceil(pw/2)+x,by+29+y,1,1,'#a07c30');else if((x+y*2)%5===1)P(bx-Math.ceil(pw/2)+x,by+29+y,1,1,'#e0c070');   // file strokes, all one way
    {const src=g.getImageData(bx-13,by+50,27,1).data;for(let y=by+37;y<by+49;y++)for(let i=0;i<27;i++){const a=src[i*4+3];if(!a)continue;g.fillStyle=`rgb(${src[i*4]},${src[i*4+1]},${src[i*4+2]})`;g.fillRect(bx-13+i,y,1,1);}}st37ScratchName(P,bx-9,by+14,'#3a2208','#f0dcb4',.62);}catch(e){}return c;};}
// Ida's jars: this year's jar is glass: the wall through it, a lit rim, one diagonal highlight
{const _j=SGT_ART.jars;SGT_ART.jars=function(){const c=_j.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};const x0=98,y0=56,w=26,h=34;
    for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const wall=((x>>3)+(y>>3))%2?'#33241a':'#2e2016';P(x,y,1,1,wall);}
    for(let y=y0;y<y0+h;y++){P(x0,y,1,1,'#7a8a86');P(x0+w-1,y,1,1,'#4a5654');P(x0+1,y,1,1,'#3e3a30');}P(x0,y0+h-1,w,1,'#5a6662');P(x0+1,y0+h-2,w-2,1,'#3a4440');
    P(x0-1,y0-4,w+2,5,'#0e0b0c');P(x0,y0-3,w,3,'#8a8e90');P(x0,y0-3,w,1,'#e4e8ea');P(x0+2,y0,w-4,1,'#b8c4c2');   // the lid and the lit rim of the glass
    for(let i=0;i<14;i++){P(x0+5+i,y0+22-i,2,1,'rgba(226,240,240,.55)');}P(x0+4,y0+4,1,10,'rgba(226,240,240,.35)');   // one highlight, at forty-five degrees
    P(x0+4,y0+12,18,10,'#e8dcc0');P(x0+4,y0+12,18,1,'#f6eedc');st37Txt(P,"'25",x0+7,y0+15,'#3a2a20');}catch(e){}return c;};}
// Tobias's crayon: your face under the orange head, bigger, with your hair and your eyes, in grey pencil
{const _cr=st37Crayon;st37Crayon=function(){const c=_cr.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};const fx=138,fy=39;
    for(let y=fy-6;y<fy+8;y++)for(let x=fx-7;x<fx+8;x++){const d=g.getImageData(x,y,1,1).data;if(d[0]<200&&d[2]<200&&!(d[0]>200))P(x,y,1,1,'#f0ead8');}
    for(let a=0;a<6.283;a+=.2)P(Math.round(fx+Math.cos(a)*5),Math.round(fy+Math.sin(a)*6),1,1,'#6a6a72');
    for(const [x,y] of [[-5,-4],[-4,-5],[-3,-6],[-1,-6],[1,-6],[3,-6],[4,-5],[5,-4],[5,-2],[-5,-2],[-6,-3],[6,-3]])P(fx+x,fy+y,1,1,'#5a4a3a');   // your hair, pencilled dark
    P(fx-2,fy-1,1,2,'#3a3a42');P(fx+2,fy-1,1,2,'#3a3a42');P(fx-1,fy+3,3,1,'#6a6a72');}catch(e){}return c;};}
// Wickham's notice: H HALE on the corners of the older layers too, and the red ring moved clear of the date
{const _w=SGT_ART.p_wick;SGT_ART.p_wick=function(){const c=_w.apply(this,arguments);try{const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
    const id=g.getImageData(0,0,c.width,c.height),a=id.data;for(let i=0;i<a.length;i+=4){if(a[i]===184&&a[i+1]===42&&a[i+2]===32){a[i]=236;a[i+1]=228;a[i+2]=208;}}g.putImageData(id,0,0);
    const nx=46,ny=16,y=ny+5+6*7;for(let t=0;t<6.283;t+=.06){const px=Math.round(nx+33+Math.cos(t)*21),py=Math.round(y+6+Math.sin(t)*6.5);P(px,py,1,1,'#b82a20');}
    for(const [x,yy,cl] of [[24,74,'#9a8a5a'],[114,62,'#a89868'],[118,30,'#8a7a50']]){P(x-1,yy-1,28,8,cl);st37Txt(P,'H HALE',x,yy,'#5a4628');}}catch(e){}return c;};}
// r3: the deer: legs out rigid from a deer lying on its side, a deer's muzzle, twelve different pieces, the stick lying on the ground to the door
function st37Deer3(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++){const h=st37H(x,y),hc=st37H(x>>2,y>>2),hb=st37H((x+3)>>3,(y+1)>>3);P(x,y,1,1,hc<12?'#3a2616':hb<20?'#5a3e28':h<8?'#6e4e32':h<20?'#3e2a18':'#4a3220');}for(let x=0;x<ST37W;x++){P(x,10+Math.round(Math.sin(x*.07)*1.5),1,2,'#2a1a0e');P(x,104+Math.round(Math.sin(x*.05+1)*1.5),1,2,'#2a1a0e');}
  const oc='#1a0e08',cx=96,cy=54;
  const lerpK=(pts,x)=>{for(let i=1;i<pts.length;i++){const [x0,y0]=pts[i-1],[x1,y1]=pts[i];if(x<=x1){const u=(x-x0)/(x1-x0),s=(1-Math.cos(Math.PI*u))/2;return y0+(y1-y0)*s;}}return pts[pts.length-1][1];};
  const BACK=[[-30,-6],[-24,-11],[-14,-10],[-2,-9],[10,-11],[20,-12],[28,-8],[33,-1]],BELLY=[[-30,5],[-24,10],[-14,9],[-2,6],[8,6],[18,10],[27,8],[33,1]];
  const top=x=>Math.round(cy+lerpK(BACK,x-cx)),bot=x=>Math.round(cy+lerpK(BELLY,x-cx));
  // the pool under it, close to the belly and spreading below the wound
  for(let x=cx-30;x<=cx+30;x++){const b=bot(x);const d=Math.round(4*Math.max(0,1-Math.abs(x-cx+2)/26));for(let y=b+1;y<=b+1+d;y++)P(x,y,1,1,y<b+3?'#2a0806':'#3c0a08');}
  // the legs: far pair darker, behind; each bends once (knee forward on the forelegs, hock back on the hind legs); dark hooves
  const leg=(pts,far)=>{for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b),1);for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n),w=i===1?3:2;P(x-1,y-1,w+2,w+2,oc);}}
    for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];const n=Math.max(Math.abs(c-a),Math.abs(d-b),1);for(let k=0;k<=n;k++){const x=Math.round(a+(c-a)*k/n),y=Math.round(b+(d-b)*k/n),w=i===1?3:2;P(x,y,w,w,far?'#6a4628':'#9a6c40');P(x,y,1,1,far?'#7e5632':'#b88654');}}
    const [hx,hy]=pts[pts.length-1];P(hx-1,hy-1,4,4,oc);P(hx,hy,3,2,'#141010');P(hx,hy,1,1,'#4a4444');};
  leg([[cx-24,cy+6],[cx-31,cy+15],[cx-37,cy+23]],1);leg([[cx-19,cy+8],[cx-25,cy+18],[cx-29,cy+28]],0);
  leg([[cx+17,cy+6],[cx+26,cy+14],[cx+33,cy+21]],1);leg([[cx+21,cy+8],[cx+30,cy+17],[cx+35,cy+27]],0);
  // the body: dark along the spine, warm brown, a lighter side, the pale belly only along its edge; the haunch rounded with its own light
  for(let x=cx-30;x<=cx+33;x++){const t=top(x),b=bot(x);for(let y=t;y<=b;y++){const v=(y-t)/Math.max(1,b-t);let c=v<.14?'#6e4a2a':v<.5?'#a07040':v<.8?'#b8884e':'#e2d2b2';
      const hh=((x-(cx+20))/11)**2+((y-(cy-2))/8)**2;if(hh<1&&hh>.72&&y<cy)c='#c89a62';const sh=((x-(cx-21))/8)**2+((y-(cy-3))/7)**2;if(sh<1&&sh>.75&&y<cy+1)c='#8a5e34';P(x,y,1,1,c);}
    P(x,t-1,1,1,oc);P(x,b+1,1,1,oc);}
  for(let y=top(cx-30);y<=bot(cx-30);y++)P(cx-31,y,1,1,oc);for(let y=top(cx+33);y<=bot(cx+33);y++)P(cx+34,y,1,1,oc);
  P(cx+32,cy-6,4,4,oc);P(cx+33,cy-5,3,2,'#f6eee0');   // the white scut
  // the flank opened: a long gash, dark red, the ribs pale curves inside it
  for(let x=cx-10;x<=cx+12;x++){const k=1-Math.abs(x-cx-1)/11.5;const h=Math.round(5*k);for(let y=cy-2-h;y<=cy-1+Math.round(h*.6);y++)P(x,y,1,1,y===cy-2-h||y===cy-1+Math.round(h*.6)?'#5a0c08':'#3a0605');}
  for(const r of [-6,-1,4,9]){for(let t=0;t<7;t++){const x=cx+r+Math.round(Math.sin(t/6*Math.PI)*1.6),y=cy-6+t;const k=1-Math.abs(x-cx-1)/11.5,h=Math.round(5*k);if(y>cy-2-h&&y<cy-1+Math.round(h*.6))P(x,y,1,1,t<3?'#f4e8d0':'#cdbca2');}}
  // the neck from the chest, the head laid flat in line with it, the eye open, a big ear standing off the skull
  for(let i=0;i<14;i++){const x=cx-31-i,t=cy-7+Math.round(i*.25),w=11-Math.round(i*.35);P(x,t-1,1,1,oc);P(x,t+w,1,1,oc);for(let k=0;k<w;k++)P(x,t+k,1,1,k<2?'#7a5230':k<w-3?'#a87a48':'#e2d2b2');}
  const hx=cx-64,hy=cy-5;for(let y=0;y<11;y++)for(let x=0;x<21;x++){const e=((x-13)/8.5)**2+((y-5)/5.4)**2;const snout=x<9&&y>=3&&y<=9&&(y-3)>=(9-x)*.25&&(9-y)>=(9-x)*.2;if(e>1&&!snout)continue;P(hx+x,hy+y,1,1,y<3?'#8a5e36':y<7?'#a87a48':(x<8?'#f0e8d8':'#dccaa8'));}
  for(let x=0;x<20;x++){P(hx+x,hy-1+(x<6?2:0),1,1,oc);P(hx+x,hy+11,1,1,oc);}P(hx-1,hy+4,1,5,oc);P(hx,hy+4,3,3,'#141010');P(hx,hy+4,1,1,'#5a5454');P(hx+1,hy+8,4,1,'#f4ecdc');
  P(hx+12,hy+3,3,2,'#141010');P(hx+12,hy+3,1,1,'#f0e8dc');P(hx+11,hy+2,5,1,'#5a3a20');   // the open eye under its brow
  const ear=[[0,0],[3,-4],[8,-8],[13,-9],[15,-7],[12,-3],[6,1]];const ex=hx+15,ey=hy+1;   // the ear, big, cupped, standing up and back
  {const xs=ear.map(p=>p[0]),ys=ear.map(p=>p[1]);const inE=(x,y)=>{let c=false;for(let i=0,j=ear.length-1;i<ear.length;j=i++){const [xi,yi]=ear[i],[xj,yj]=ear[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;}return c;};
    for(let y=Math.min(...ys)-1;y<=Math.max(...ys)+1;y++)for(let x=Math.min(...xs)-1;x<=Math.max(...xs)+1;x++){const i=inE(x+.5,y+.5);const nb=inE(x+1.5,y+.5)||inE(x-.5,y+.5)||inE(x+.5,y+1.5)||inE(x+.5,y-.5);if(!i&&nb)P(ex+x,ey+y,1,1,oc);}
    for(let y=Math.min(...ys);y<=Math.max(...ys);y++)for(let x=Math.min(...xs);x<=Math.max(...xs);x++){if(!inE(x+.5,y+.5))continue;const inner=inE(x+1.5,y+1.5)&&inE(x-.5,y+.5)&&inE(x+.5,y-.5)&&x>2;P(ex+x,ey+y,1,1,inner?(y<-5?'#c88a80':'#a86a62'):'#9a6c40');}}
  // twelve pieces at the hours, each its own: rib racks, a haunch, a hoof, hide, a shoulder, a liver
  const RX=74,RY=46;const piece=(k,x,y)=>{const o='#1a0604';
    if(k===0){P(x-1,y-1,10,7,o);P(x,y,8,5,'#9a2a24');for(let i=0;i<4;i++)P(x+1+i*2,y,1,5,'#f0e4cc');}   // ribs
    else if(k===1){st37Ell(P,x+4,y+3,6,4,o);st37Ell(P,x+4,y+3,5,3,'#a8302a');P(x+1,y+1,4,1,'#ecd8bc');P(x+8,y+2,3,2,'#f0e8d8');}   // a haunch, the ball of the joint
    else if(k===2){P(x+1,y-1,3,8,o);P(x+2,y,1,5,'#b08458');P(x,y+5,5,3,o);P(x+1,y+5,3,2,'#141010');}   // a lower leg and its hoof
    else if(k===3){P(x-1,y-1,11,5,o);P(x,y,9,3,'#a07040');P(x,y+2,9,1,'#e2d2b2');for(let i=1;i<9;i+=3)P(x+i,y,1,1,'#7a5230');}   // a strip of hide
    else if(k===4){P(x-1,y-1,8,8,o);P(x,y,6,6,'#8e2420');P(x,y,6,1,'#ecd8bc');P(x+2,y+2,2,2,'#f0e8d8');}   // a shoulder, the bone end
    else {st37Ell(P,x+3,y+3,4,3,o);st37Ell(P,x+3,y+3,3,2,'#5a1012');P(x+2,y+2,2,1,'#8a2a2a');}};   // something dark from inside
  for(let h=0;h<12;h++){const a=h/12*Math.PI*2-Math.PI/2,x=Math.round(cx+Math.cos(a)*RX)-4,y=Math.round(cy+2+Math.sin(a)*RY)-2;if(y<3||y>ST37H-8||x<12)continue;piece([0,3,1,5,4,2,0,1,3,4,5,2][h],x,y);P(x,y+8,8,1,'#2a0806');}
  // r4: the cabin's corner at the top right, past the ring: log wall, the plank door with its Z-brace, latch and stone step; the hand of the clock,
  // a peeled stick lying from the middle of the deer out past the 1 o'clock piece to the foot of that door
  for(let y=0;y<24;y++)for(let x=146;x<ST37W;x++){const r=y%5;P(x,y,1,1,r===4?'#1a1008':r===0?'#7a5636':'#5e4228');}for(let y=0;y<24;y+=5)P(146,y,1,4,'#2a1a0e');
  P(153,0,19,21,'#0e0806');for(let y=0;y<20;y++)for(let x=155;x<170;x++){const k=(x-155)%5;P(x,y,1,1,k===4?'#3a2414':k===0?'#8a6440':'#6e4c2e');}
  for(let k=0;k<15;k++){const x=155+k,y=Math.round(16-k*12/14);P(x,y,1,2,'#4a301a');P(x,y,1,1,'#9a7048');}P(155,3,15,2,'#4a301a');P(155,3,15,1,'#9a7048');P(155,16,15,2,'#4a301a');P(155,16,15,1,'#9a7048');   // the Z-brace
  P(166,9,2,3,'#1a1008');P(166,10,2,1,'#c8a048');   // the latch
  P(150,20,25,4,'#0e0b0c');P(151,20,23,3,'#8a8890');P(151,20,23,1,'#b0aeb6');   // the stone step
  for(let i=0;i<70;i++){const x=Math.round(cx+4+i*.86),y=Math.round(cy-8-i*.44);if(x>152)break;P(x,y+2,3,1,'#24160c');P(x,y,3,2,'#c8a878');P(x,y,3,1,'#e8d0a0');}
  P(cx-5,cy-7,7,6,'#141010');P(cx-4,cy-6,5,4,'#7a7880');P(cx-4,cy-6,3,1,'#a8a6ae');});}

st37Deer=st37Deer3;SGT_ART.deer37=st37Deer3;
// the cold house at viewing scale: a side of pork, Ruth in sacking (a lock of hair at the top, fingers at the hem), a sheep on a gambrel
function st37Cold3(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,x%16===0?'#16161c':(st37H(x>>1,y>>3)<8?'#22222a':'#1e1e26'));
  for(let y=96;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,y===96?'#3a3a44':(x+y)%9===0?'#2a2a32':'#26262e');
  P(0,7,ST37W,4,'#2a1e14');P(0,7,ST37W,1,'#5a4430');P(0,10,ST37W,1,'#140e0a');   // the rail
  const hook=(x,y0,y1)=>{for(let y=y0;y<y1;y++)P(x,y,1,1,'#9a9aa6');P(x-1,y1-2,1,2,'#9a9aa6');P(x+1,y1-1,2,1,'#6a6a76');};
  // a side of pork: a long slab, rind down one edge, the ribs inside
  hook(34,11,20);st37Poly(P,[[24,20],[44,20],[48,34],[47,78],[42,90],[27,90],[22,78],[21,34]],(x,y)=>x<25?'#e8d0c0':x>44?'#8a2a26':x<29?'#f0dcd0':((y-22)%9<2&&x>30&&x<44)?'#f4e4d8':'#b03c34');
  for(let y=20;y<90;y++){P(21+(y>34&&y<78?0:1),y,1,1,'#3a1010');P(47+(y>34&&y<78?1:0),y,1,1,'#3a1010');}P(30,92,10,2,'#3a0806');
  // Ruth, sewn into sacking: a head, shoulders, a narrow body, ropes at neck, waist and knees; a lock of hair at the top; small fingers at the hem
  hook(88,11,18);const sack=(x,y)=>{const t=((x>>1)+(y>>1))%2?'#9a845a':'#8a7448';return st37H(x,y)<10?'#6e5c38':t;};
  st37Poly(P,[[84,18],[92,18],[95,24],[94,30],[101,34],[102,52],[99,76],[96,92],[80,92],[77,76],[74,52],[75,34],[82,30],[81,24]],sack);
  for(const [y,w] of [[29,15],[56,26],[78,22]]){P(88-(w>>1),y,w,2,'#3a2a14');P(88-(w>>1),y,w,1,'#6a5030');}
  for(const [x,y] of [[86,19],[87,18],[89,18],[90,19],[85,20],[91,21],[92,22]])P(x,y,1,1,'#3a2418');P(90,20,1,4,'#4a2c1c');P(91,23,1,3,'#3a2418');   // her hair, out at the top
  for(let i=0;i<4;i++){P(84+i*2,93,1,3+(i%2),'#d8c4b4');P(84+i*2,96+(i%2),1,1,'#b89a8a');}P(83,92,10,1,'#4a3a22');   // her fingers, at the hem
  for(let y=18;y<92;y++){const xl=y<24?81:y<30?82:y<34?75:y<52?74:y<76?77:80,xr=y<24?95:y<30?94:y<34?101:y<52?102:y<76?99:96;P(xl-1,y,1,1,'#2a2014');P(xr+1,y,1,1,'#2a2014');}
  // a sheep on a gambrel: the hind legs spread on the bar, the body hanging, its belly opened on the ribs
  hook(140,11,16);P(126,16,29,3,'#4a4a54');P(126,16,29,1,'#8a8a96');
  st37Poly(P,[[128,18],[132,18],[134,32],[146,32],[148,18],[152,18],[151,36],[152,50],[149,68],[144,80],[141,88],[137,88],[134,80],[129,68],[127,50],[128,36]],(x,y)=>x<131||x>149?'#c8a094':(x>135&&x<145&&y>44&&y<72)?(((y-44)%6<2)?'#f0e4d8':'#6a1414'):x<134?'#e8ccbc':'#d8b4a4');
  for(let y=18;y<88;y++){P(127+(y<36?1:0)-(y>50&&y<68?1:0),y,1,1,'#2a1010');}P(136,90,8,2,'#3a0806');
  });}
SGT_ART.cold37=st37Cold3;
// the Tithe House step close-up: the same door as in the world (boards nailed across a plain door), nails driven in clusters along the boards,
// and on the slab a child's pair of shoes seen from behind, heels toward you, toes turned in at the door
function st37Step3(){return st37Cv(ST37W,ST37H,(P)=>{
  for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++){const r=(y+((x>>4)%2)*4)%8,c=(x+((y>>3)%2)*9)%18;P(x,y,1,1,r===0||c===0?'#3a3a42':st37H(x>>2,y>>2)<12?'#6a6a74':'#7a7a84');}
  const dx=50,dw=76,dy=8,dh=80;P(dx-4,dy-4,dw+8,dh+4,'#2a2a30');P(dx-3,dy-3,dw+6,2,'#9a9aa4');
  for(let y=dy;y<dy+dh;y++)for(let x=dx;x<dx+dw;x++){const pl=(x-dx)%12;P(x,y,1,1,pl===0?'#2a1a10':pl<3?'#5a3e24':(st37H(x,y>>2)<10?'#4a3220':'#523822'));}
  const board=(x0,y0,x1,y1)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);P(x-1,y-4,3,9,'#1a1008');P(x,y-3,1,7,'#8a6a44');P(x,y-3,1,1,'#b08a5a');}};
  board(dx+2,dy+10,dx+dw-2,dy+dh-12);board(dx+dw-2,dy+12,dx+2,dy+dh-10);for(const by of [dy+6,dy+40,dy+dh-8]){P(dx-2,by-4,dw+4,9,'#1a1008');P(dx-1,by-3,dw+2,7,'#7a5a38');P(dx-1,by-3,dw+2,1,'#a8845a');}
  const nail=(x,y)=>{P(x,y,2,2,'#1a1a1e');P(x,y,1,1,'#b0b0ba');P(x+1,y+2,1,2,'#6a2a14');};
  for(const [cx,cy,n] of [[dx+4,dy+6,7],[dx+dw-7,dy+6,6],[dx+3,dy+40,8],[dx+dw-6,dy+40,7],[dx+dw/2|0,dy+42,9],[dx+5,dy+dh-8,6],[dx+dw-8,dy+dh-8,8],[dx+12,dy+14,5],[dx+dw-14,dy+16,5],[dx+dw/2-4|0,dy+dh/2-2|0,6]])
    for(let i=0;i<n;i++)nail(cx+st37H(i,cx)%7-3,cy+st37H(cx,i)%5-2);
  for(let i=0;i<14;i++){const x=dx+6+st37H(i,3)%(dw-12),y=dy+10+st37H(3,i)%(dh-20);P(x,y,1,1,'#0a0606');}   // the old holes, right through
  // the slab
  P(dx-14,dy+dh,dw+28,4,'#9a9aa4');P(dx-14,dy+dh,dw+28,1,'#c4c4cc');for(let y=dy+dh+4;y<ST37H;y++)P(dx-14,y,dw+28,1,y<dy+dh+6?'#6a6a74':'#56565e');P(dx-14,ST37H-1,dw+28,1,'#2a2a30');
  // the shoes: child's, from behind; heel counters toward you, the dark openings, toes pointed in toward each other at the door
  const shoe=(x,y,inward)=>{P(x+2,y+11,14,2,'rgba(10,8,10,.45)');st37Poly(P,[[x,y+3],[x+3,y],[x+11,y],[x+14,y+3],[x+14,y+9],[x+11,y+11],[x+3,y+11],[x,y+9]],'#1a0e0a');
    st37Poly(P,[[x+1,y+3],[x+3,y+1],[x+11,y+1],[x+13,y+3],[x+13,y+9],[x+11,y+10],[x+3,y+10],[x+1,y+9]],(px,py)=>py<y+3?'#7a4a2c':py>y+8?'#5a3420':'#6a3e24');
    P(x+3,y+2,8,4,'#0a0606');P(x+4,y+2,6,1,'#1a1010');P(x+2,y+9,10,1,'#d8d0c0');P(x+5,y+6,4,1,'#b89060');P(x+6,y+1,2,1,'#c8a070');   // the opening, the sole edge, the heel tab
    const tx=inward>0?x+12:x-2;P(tx,y-3,4,4,'#1a0e0a');P(tx+1,y-2,2,2,'#6a3e24');};   // the toe, turned in, just showing past the heel
  shoe(dx+dw/2-17|0,dy+dh+2,1);shoe(dx+dw/2+3|0,dy+dh+2,-1);});}
/* r4: back to the r2 door close-up (with its boards), not st37Step3 */
// r3: the one car everywhere: the crash itself is this sedan too, its nose folded round the oak; the drive in's crash frames draw it
function st37CarSync(){try{if(typeof WRECK_RECT==='undefined'||!WRECK_RECT)return;const cs=S.carStage||0,fixed=!!S.carFixed;
    const driving=S.introDrive&&!(cine&&cine._st&&cine._st.crashed);
    const want=(!fixed&&!driving)?(cs>=5?'s5':cs>=4?'s4':cs>=2?'s2':cs>=1?'s1':'s0'):null;ST37_CAR.want=want;
    for(const o of OBJ)if(o.kind==='wreck'&&String(o.spr||'').startsWith('car_wreck')&&!o.__h37){o.__h37=1;let h=o.hide;Object.defineProperty(o,'hide',{configurable:true,get(){return h||!!ST37_CAR.want;},set(v){h=v;}});}
    const at=want==='s0'?{x:-60.9,z:2.0}:{x:ST37_CAR.cx,z:ST37_CAR.cz};
    if(!ST37_CAR.o)ST37_CAR.o=obj('st37_car_s1',at.x,at.z,{kind:'prop',noCol:true,hide:true});
    const o=ST37_CAR.o;o.hide=!want||(S.introDrive&&!!cine);if(want){o.spr='st37_car_'+(want==='s0'?'s0f':want);o.x=at.x;o.z=want==='s0'?at.z+.32:at.z;}
    const R=WRECK_RECT;if(!ST37_CAR.orig)ST37_CAR.orig=[R.x0,R.z0,R.x1,R.z1];const tgt=want?[at.x-2.3,at.z-1.05,at.x+2.2,at.z+.6]:ST37_CAR.orig;
    if(R.x0!==tgt[0]||R.z0!==tgt[1]||R.x1!==tgt[2]||R.z1!==tgt[3]){[R.x0,R.z0,R.x1,R.z1]=tgt;CGRID.dirty=true;}
    if(false)for(let i=0;i<3;i++)parts.push({x:at.x+1.6+Math.random()*.4,z:at.z-.5,y:.9,vx:.12+Math.random()*.2,vz:-.1,vy:.55+Math.random()*.3,t:0,life:1.4,col:Math.random()<.5?'#d8d8dc':'#b8b8c0',size:3});
  }catch(e){}}
{const _d=drawSpr;drawSpr=function(name,x,y){if(name==='car_wreck'&&S.introDrive&&SPR.st37_car_s0)return _d.call(this,'st37_car_s0',x+3,y+6,null,null,0);return _d.apply(this,arguments);};}
if(typeof CAR_SPOTS!=='undefined')CAR_SPOTS.crash.z=-1.4;   // the repaired car waits with all four wheels on the shoulder
// the drive out: when the farm sign comes up, the headlights find it
// r4: the loop made visible. Past the farm, the HOLLOW ACRE sign stands at the road's edge again, and again, each one caught in the headlights
// as the car comes up on it (the beams turned onto the sign from the car's real headlights, never across the car)
const ST37_PHSIGN=[-62,-75],ST37_PHZ=-8.85;
{const _ec=escapeCine;escapeCine=function(){_ec.apply(this,arguments);try{if(typeof WILD!=='undefined')WILD.length=0;}catch(e){}   /* no grazing deer on the road out */
  try{const c=cine,_l=c.light,_dr=c.drawables;
    c.drawables=function(D){_dr.apply(this,arguments);const st=c.st37;if(!st||!st.loops)return;for(const x of ST37_PHSIGN){if(Math.abs(x-st.x)>16)continue;
      D.push({z:ST37_PHZ,mind:1,draw(){const X=Math.round(sx(x)),Y=Math.round(sz(ST37_PHZ));ctx2.fillStyle='rgba(10,8,14,.35)';ctx2.fillRect(X-14,Y-1,28,3);drawSpr('sign:HOLLOW ACRE',X,Y);}});}};
    c.light=function(L){_l.apply(this,arguments);try{const st=c.st37;if(!st||!st.loops)return;const X=sx(st.x),Y=sz(st.z)+Math.round(st.bob||0),hx=X-68,hy=Y-12;
      for(const x of ST37_PHSIGN){const d=st.x-x;if(d<2||d>13)continue;const sx2=sx(x),sy2=sz(ST37_PHZ)-20;const ang=Math.atan2(sy2-hy,sx2-hx);const k=Math.max(.45,L)*Math.min(1,(13-d)/3);
        coneAt(hx,hy,ang,.16,Math.hypot(sx2-hx,sy2-hy)+26,[255,238,196],.6*k);glowAt(sx2,sy2,30,[255,240,210],.9*k);}}catch(e){}};}catch(e){}};}
// rain on a storm night: slanted streaks of different lengths, rings where it lands, and a wet shine in your lantern's pool
{const _ms=mindScreen;mindScreen=function(t){try{if(S.storm&&isNight()&&!S.room&&(S.mode==='play'||S.mode==='cine')){
      ctx2.fillStyle='rgba(200,214,236,.55)';for(let i=0;i<46;i++){const ph=(t*2.2+hash(i,21))%1;if(ph>.45)continue;const X=Math.round(hash(i,22)*VW),Y=Math.round((hash(i,23)*VH+Math.floor(t*2.2+hash(i,21))*53)%VH);const r=1+Math.round(ph*8);
        for(let a=0;a<6.283;a+=.5)ctx2.fillRect(Math.round(X+Math.cos(a)*r),Math.round(Y+Math.sin(a)*r*.4),1,1);}
      if(typeof lanternOn==='function'&&lanternOn()&&typeof lanternPos==='function'){const lp=lanternPos();ctx2.fillStyle='rgba(255,226,170,.5)';for(let i=0;i<10;i++){const ph=(t*.8+hash(i,31))%1,X=Math.round(lp.gx+(hash(i,32)-.5)*70),Y=Math.round(lp.gy+(hash(i,33)-.5)*30);ctx2.fillRect(X,Y,3+Math.round(ph*4),1);}}
      ctx2.fillStyle='rgba(170,190,225,.4)';for(let i=0;i<120;i++){const len=6+Math.round(hash(i,41)*8),x=((hash(i,42)*VW*1.3+t*140)%(VW*1.3))-VW*.15,y=(hash(i,43)*VH+t*(620+hash(i,44)*200))%VH;for(let k=0;k<len;k++)ctx2.fillRect(Math.round(x-k*.55),Math.round(y+k),1,1);}}}catch(e){}return _ms.apply(this,arguments);};}
// wet footprints: a child's bare feet, heel and toes, a lit rim and a wet shine, left and right, all the way to the corn
function st37Foot(left){return st37Cv(8,6,(P)=>{const o='#0e1014';P(4,1,4,4,o);P(5,2,2,2,'#3a4250');P(1,2,3,3,o);P(2,3,1,1,'#3a4250');for(const [x,y] of [[0,0],[0,5],[1,0],[1,5]])P(x,y,1,1,o);P(4,1,3,1,'#9aaabb');P(1,2,1,1,'#9aaabb');P(6,3,1,1,'#d8e8f8');P(2,2,1,1,'#c8d8e8');
  if(left){const c=document.createElement('canvas');}});}
(function(){for(const [k,dir] of [['W',0],['E',1],['S',2],['N',3]])for(const side of [0,1]){const base=st37Foot(side);const c=document.createElement('canvas');const vert=dir>=2;c.width=vert?6:8;c.height=vert?8:6;const g=c.getContext('2d');
  g.save();if(dir===1){g.translate(8,0);g.scale(-1,1);}else if(dir===2){g.translate(6,0);g.rotate(Math.PI/2);}else if(dir===3){g.translate(0,8);g.rotate(-Math.PI/2);}if(side&&!vert){g.translate(0,6);g.scale(1,-1);}if(side&&vert){g.translate(dir===2?8:0,0);}
  g.drawImage(base,0,0);g.restore();st37Reg('st37_fp'+k+side,c,c.width/2,c.height-1);}})();
{const _t=toast;toast=function(m){try{if(typeof m==='string'&&/Wet footprints lead toward the corn/.test(m)&&typeof ruth!=='undefined'){for(const o of ST37_FP){const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}ST37_FP.length=0;
      const x0=ruth.x||P.x,z0=ruth.z||P.z;const corn=OBJ.filter(o=>/^corn_/.test(o.spr||'')&&!o.room).sort((a,b)=>Math.hypot(a.x-x0,a.z-z0)-Math.hypot(b.x-x0,b.z-z0))[0];
      const tx=corn?corn.x:FIELD.x0+FIELD.w/2,tz=corn?corn.z:FIELD.z0+FIELD.h/2;const d=Math.hypot(tx-x0,tz-z0)||1,ux=(tx-x0)/d,uz=(tz-z0)/d;const dir=Math.abs(ux)>Math.abs(uz)?(ux<0?'W':'E'):(uz>0?'S':'N');
      const n=Math.min(40,Math.floor((d-.2)/.48));for(let i=0;i<n;i++){const side=i%2,s=side?.13:-.13;ST37_FP.push(obj('st37_fp'+dir+side,x0+ux*(i*.48+.3)-uz*s,z0+uz*(i*.48+.3)+ux*s,{kind:'flat',noCol:true}));}ST37.fpDay=S.day;const r=_t.apply(this,arguments);for(let i=OBJ.length-1;i>=0;i--)if(OBJ[i].spr==='st37_fp')OBJ.splice(i,1);return r;}}catch(e){}return _t.apply(this,arguments);};}
// Agnes's ribbon: three red bands across a pale hand, and a trailing end
function st37RibbonR3(X,Y,t){const r='#c0201a',rh='#ee5a46',rd='#6a0e0c';   /* r4: set aside; r2's red coil (st37Ribbon above) is back */ctx2.fillStyle='#3a2420';ctx2.fillRect(X-1,Y-2,8,8);ctx2.fillStyle='#ecd6c4';ctx2.fillRect(X,Y-1,6,6);ctx2.fillStyle='#f8e8dc';ctx2.fillRect(X,Y-1,2,1);
  for(let i=0;i<3;i++){ctx2.fillStyle=rd;ctx2.fillRect(X-1,Y+i*2,8,1);ctx2.fillStyle=i===1?rh:r;ctx2.fillRect(X,Y+i*2,6,1);}
  for(let k=0;k<10;k++){const sw=Math.round(Math.sin(t*2.4+k*.6)*(k/4));ctx2.fillStyle=k%3===2?rh:r;ctx2.fillRect(X+5+sw,Y+5+k,2,1);ctx2.fillStyle=rd;ctx2.fillRect(X+7+sw,Y+5+k,1,1);}}
// the Tithe House shoes, readable at 1x: a child's pale pair from behind, heels to you, toes to the door
{const _h=st37House;st37House=function(state){const c=_h.apply(this,arguments);try{if(/open/.test(state))return c;const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};const DX=120,DW=28,GY=232;
    /* r4: a child's dark leather shoes, wider than tall, heels out and toes turned in toward each other, a buckled strap, a contact shadow under each */
    const shoe=(x,y,d)=>{const fx=k=>d>0?x+k:x+9-k;const rows=[[2,5],[1,7],[0,8],[0,9],[1,8]];
      P(Math.min(fx(0),fx(11))-1,y+5,13,1,'rgba(10,8,10,.55)');P(Math.min(fx(1),fx(10)),y+6,11,1,'rgba(10,8,10,.3)');
      rows.forEach(([a,b],yy)=>{for(let k=a-1;k<=b+1;k++)P(fx(k),y+yy-(k>=6?1:0),1,1,'#0e0a0a');});P(fx(0),y-1,fx(9)>fx(0)?9:1,1,'#0e0a0a');
      rows.forEach(([a,b],yy)=>{for(let k=a;k<=b;k++){let c=yy===0?'#6a4630':yy===4?'#140c08':k<4?'#2e1c14':'#3a2418';if(yy===1&&k>=4)c='#5a3a28';P(fx(k),y+yy-(k>=6?1:0),1,1,c);}});
      P(Math.min(fx(1),fx(3)),y+1,3,2,'#140a06');P(fx(5),y,1,4,'#2a1810');P(fx(5),y+1,1,1,'#f0d070');};   // the opening at the heel; the strap and its buckle
    P(DX-1,GY-11,DW+2,1,'#1a1416');P(DX-1,GY-10,DW+2,8,'#86848c');P(DX-1,GY-10,DW+2,1,'#a8a6ae');for(let i=0;i<5;i++)P(DX+2+st37H(i,7)%(DW-4),GY-8+st37H(7,i)%5,1,1,'#76747c');   /* the step's top, clear in front of the door */
    shoe(DX+3,GY-8,1);shoe(DX+DW-13,GY-8,-1);}catch(e){}return c;};}
// embers in each Old Marrow hearth on the night the hearths glow
st37Reg('st37_embers',st37Cv(12,6,(P)=>{P(0,2,12,4,'#2a0e06');for(const [x,y,c] of [[1,3,'#c83a10'],[3,2,'#ff9a30'],[4,3,'#ffd060'],[6,2,'#ff7a20'],[7,3,'#ffe090'],[9,3,'#e05a18'],[10,4,'#a82a0a'],[5,4,'#ff8a28'],[2,4,'#902a0a']])P(x,y,1,1,c);}),6,9);
setInterval(()=>{try{const on=ST37.hearth===S.day&&isNight();ST37.emb=ST37.emb||[];if(on&&!ST37.emb.length)for(const o of OBJ)if(o.spr==='rg_chimney'&&!o.hide)ST37.emb.push(obj('st37_embers',o.x,o.z+.02,{kind:'prop',noCol:true}));
  for(const e of ST37.emb)e.hide=!on;}catch(e){}},500);
// the fake "tutorial" tips keep out of staged scenes
{const _ht=htip;htip=function(){if(typeof STG!=='undefined'&&STG)return;return _ht.apply(this,arguments);};}

/* ======================================== r4 ======================================== */
// the quarry: r2's wavy strata, and the person-shaped recess cut into them: the upper-left inner walls in black shadow, the lower-right
// inner walls lit, a 1 px lit lip on the rim's upper-left, the dark back wall scored with finger scratches, and three nails at the top of the right arm
function st37Quarry4(){return st37Cv(ST37W,ST37H,(P)=>{
  const S5=['#5e5a62','#6a666e','#76727a','#565260','#625e68'];const band=(x,y)=>{const yy=y+Math.round(Math.sin(x*.05)*2);return [Math.floor(yy/7),((yy%7)+7)%7];};
  for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++){const [b,yy]=band(x,y);let c=S5[((b%5)+5)%5];if(yy===0)c='#3e3a44';else if(yy===1)c='#8a8690';if(x<14)c=yy===0?'#4a4650':'#8e8a94';if(x>ST37W-12)c=yy===0?'#2e2a34':'#4e4a54';P(x,y,1,1,c);}
  const cx=88;const fig=(x,y)=>{const head=((x-cx)/8)**2+((y-26)/9)**2<1;const neck=Math.abs(x-cx)<4&&y>=34&&y<38;const body=Math.abs(x-cx)<15-Math.max(0,(y-60)*.2)&&y>=37&&y<78;
    const armL=Math.abs((x-(cx-26))-(y-44)*.55)<4.5&&y>14&&y<62;const armR=Math.abs((x-(cx+26))+(y-44)*.55)<4.5&&y>14&&y<62;const legL=x>cx-12&&x<cx-2&&y>=76&&y<106;const legR=x>cx+2&&x<cx+12&&y>=76&&y<106;
    return head||neck||body||armL||armR||legL||legR;};
  for(let y=0;y<ST37H;y++)for(let x=30;x<150;x++){if(!fig(x,y)){if(fig(x+1,y+1)&&(!fig(x,y+1)||!fig(x+1,y)))P(x,y,1,1,'#c8c4d0');continue;}   // the lit lip along the rim's upper-left
    let d=0;while(d<7&&fig(x-d-1,y-d-1))d++;let e=0;while(e<4&&fig(x+e+1,y+e+1))e++;
    const [b,yy]=band(x,y);let col=yy===0?'#1e1c24':'#2a2830';   // the back wall, the strata running on faintly into it
    if(d<=e||d<=1){if(d<=1)col='#060508';else if(d<=2)col='#0c0a10';else if(d<=4)col='#14121a';}   // the upper-left inner wall, in shadow
    else if(e<=2){col=e===0?'#b8b4c0':e===1?'#9a96a4':'#7a7684';if(yy===0)col=e===0?'#8e8a98':'#6e6a78';}   // the lower-right inner wall, lit, the strata on it
    else if(d<=4)col='#16141a';
    P(x,y,1,1,col);}
  // scratches on the back wall, inside the hollow: fingers dragged in fours, pale where they cut the stone
  const scr=(x0,y0,x1,y1,n,sd)=>{for(let f=0;f<n;f++){const o=f*2,l=1-.12*((st37H(f,sd)%4));const ex=x0+o+(x1-x0)*l,ey=y0+(y1-y0)*l;let px=x0+o,py=y0;const N=Math.ceil(Math.abs(ey-y0));
      for(let k=1;k<=N;k++){const qx=Math.round(x0+o+(ex-x0-o)*k/N+(st37H(k>>2,f+sd)%4===0?1:0)),qy=Math.round(y0+(ey-y0)*k/N);if(fig(qx,qy)&&fig(qx+1,qy)){P(qx,qy,1,1,'#a6a2b0');P(qx+1,qy,1,1,'#08060a');}}}};
  scr(cx-10,44,cx-6,70,4,1);scr(cx+3,48,cx+6,74,3,2);scr(cx-4,20,cx-2,31,3,3);scr(cx-8,82,cx-7,102,2,4);
  // up the right arm: three scratches ending in three nails broken off in the stone
  const nails=[[cx+33,26],[cx+37,21],[cx+41,16]];
  nails.forEach(([nx,ny],i)=>{st37Line(P,[[nx-8,ny+14],[nx,ny+2]],'#a6a2b0');st37Line(P,[[nx-7,ny+14],[nx+1,ny+2]],'#0a080c');});
  for(const [nx,ny] of nails){P(nx-2,ny-1,5,4,'#2a0c10');P(nx-1,ny,3,2,'#e8a4a0');P(nx-1,ny,3,1,'#fbe4dc');P(nx+1,ny+1,1,1,'#b86c6c');}
  });}
SGT_DRAW.quarry=st37Quarry4;st37Quarry=st37Quarry4;

// the crypt: rows of small coffins that run on past both edges of the picture and back into the dark (a hundred and fifty, not thirty),
// a third of them open with names scratched in the lids; the full-size one at the end in the same old wood, its plate filed blank, ELIAS under it
function st37Crypt4(){return st37Cv(ST37W,ST37H,(P)=>{for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,((x>>3)+(y>>3))%2?'#24222a':'#201e26');
  const shape=(w,h)=>yy=>{const t=yy/h,s=w*.32;return t<.3?Math.round(s+(w/2-s)*(t/.3)):Math.round(w/2-(w/2-s*.75)*((t-.3)/.7));};
  const W=[['#6a4a30','#5a3e28','#46301e'],['#7a5a3a','#6a4c30','#523a24'],['#5a4434','#4a382a','#3a2c20'],['#6e5a42','#5e4a34','#4a3a28']];
  const dim=(col,k)=>col.map(h=>{const n=parseInt(h.slice(1),16);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v*k).toString(16).padStart(2,'0')).join('');});
  const names=['ANNIE','TOMMY','RUTH','DANNY','MOLLY','ALICE','JO','SAM','NELL','BEN','IDA','KIT'];
  const cof=(x,y,w,h,col,open,nm)=>{const sh=shape(w,h);for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++){let c=Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':xx<-hw/3?col[0]:xx<hw/3?col[1]:col[2];
      if(open&&Math.abs(xx)<hw-1&&yy>0&&yy<h-1)c=yy<3?'#1a1210':'#0a0808';P(x+xx,y+yy,1,1,c);}}
    if(open&&nm){const lx=x+Math.ceil(w/2)+2,ly=y-3;for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++)P(lx+xx+Math.round(yy*.15),ly+yy,1,1,Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':'#9a7a58');}
      for(let i=0;i<nm.length&&i<4;i++){const f=(typeof PXFONT!=='undefined'&&PXFONT[nm[i]])||null;if(!f)continue;for(let j=0;j<5;j++)for(let k=0;k<3;k++)if(f[j*3+k]==='1')P(lx-1+k+Math.round((3+i*5)*.15),ly+3+i*5+j,1,1,'#3a2414');}}};
  // five rows, the far ones smaller and darker, every row running off both sides (the near rows stop at the big coffin)
  const rows=[[-6,6,13,10,.45],[8,7,15,12,.6],[26,8,18,13,.78],[48,9,20,15,.92],[72,10,22,16,1]];let n=0;
  rows.forEach(([y0,w0,h0,sp,k],r)=>{for(let x=-10+(r%2)*(sp>>1);x<ST37W+12;x+=sp){if(y0+h0>34&&x>132)continue;const i=Math.round(x/sp);const w=w0+st37H(i,r)%3,h=h0+st37H(r,i)%4;const open=(i+r*2)%3===1&&k>.7;
    cof(x,y0+st37H(i,r+7)%3,w,h,dim(W[((i+r)%4+4)%4],k),open,open?names[(n++)%names.length]:'');}});
  // the full-size one: the same old wood as the rest, only longer
  const bx=156,by=40;cof(bx,by,26,66,['#8a6440','#765434','#5c4026'],false,'');for(let yy=by+6;yy<by+62;yy+=9)P(bx-7,yy,14,1,'#6a4a2c');
  const pw=20;P(bx-Math.ceil(pw/2)-1,by+27,pw+2,10,'#0e0b0c');P(bx-Math.ceil(pw/2),by+28,pw,8,'#c8a048');P(bx-Math.ceil(pw/2),by+28,pw,1,'#f0d888');
  for(let y=0;y<7;y++)for(let x=0;x<pw;x++)if(st37H(x,y*3)%5<2)P(bx-Math.ceil(pw/2)+x,by+29+y,1,1,y%2?'#e8cc78':'#a88038');   // filed, the file marks across it
  const t='ELIAS';const tx=bx-Math.ceil((t.length*4-1)/2);st37Txt(P,t,tx+1,by+42,'#2a1808');st37Txt(P,t,tx,by+41,'#f0dcb4');});}
SGT_ART.crypt=st37Crypt4;st37Crypt=st37Crypt4;

// the three who stand apart wear their names while you choose: a small tag over each head, its number and name as the prompt gives them
const ST37_TAGC={};
{const _ms=mindScreen;mindScreen=function(t){const r=_ms.apply(this,arguments);try{if(ST37.tags&&typeof STG!=='undefined'&&STG){for(const g of ST37.tags){const n=npcById(g.id);if(!n)continue;
      let cv=ST37_TAGC[g.t];if(!cv){const w=g.t.length*4+7;cv=ST37_TAGC[g.t]=st37Cv(w,13,(P)=>{P(0,0,w,10,'#1a0e08');P(1,1,w-2,8,'#f0e2c0');P(1,8,w-2,1,'#c8b088');st37Txt(P,g.t,4,3,'#3a1a0a');P((w>>1)-2,10,5,1,'#1a0e08');P((w>>1)-1,11,3,1,'#1a0e08');P(w>>1,12,1,1,'#1a0e08');P((w>>1)-1,10,3,1,'#f0e2c0');P(w>>1,11,1,1,'#f0e2c0');});}
      ctx2.drawImage(cv,Math.round(sx(n.x)-cv.width/2),Math.round(sz(n.z)-62));}}}catch(e){}return r;};}
// r4: the hat in the ash is one hat everywhere: in the climax as at Chapter One's end, Grandpa's straw hat with its faded red band, in a grey
// ash ring with live embers, and the warm light of those embers on it, the same light the Chapter One end shows
{const _d=drawSpr;drawSpr=function(name,x,y){const r=_d.apply(this,arguments);try{if(name==='pumpkin'&&typeof ritual!=='undefined'&&ritual&&ritual.hat&&Math.abs(x-sx(ritual.hat.x))<.5&&Math.abs(y-sz(ritual.hat.z))<.5){
      const X=Math.round(x),Y=Math.round(y),t=performance.now()/1000;for(let i=0;i<9;i++){const a=i*.7+.3,rx=15+(i%3)*2,ry=5+(i%2);const f=(Math.sin(t*3+i*1.7)+1)/2;
        ctx2.fillStyle=f>.66?'#ffd060':f>.33?'#ff8a28':'#b8380e';ctx2.fillRect(Math.round(X+Math.cos(a)*rx),Math.round(Y+2+Math.sin(a)*ry),i%3?1:2,1);}}}catch(e){}return r;};}
{const _go=glowObjs;glowObjs=function(){const r=_go.apply(this,arguments);try{if(typeof ritual!=='undefined'&&ritual&&ritual.hat&&!S.room&&!(cine&&cine._hat37)&&typeof nightK!=='undefined'&&nightK>.05){
      const X=sx(ritual.hat.x),Y=sz(ritual.hat.z),f=.9+Math.sin(performance.now()/180)*.05;glowAt(X,Y-2,58,[255,176,96],.95*f);glowAt(X,Y-4,16,[255,220,160],.9*f);}}catch(e){}return r;};}

// r4: the wet prints are a child's shoe prints, heel and toe: a broad sole pad and a small heel with the arch between, dark with wet,
// a sheen along each pad where the light catches the water, left and right in turn, all the way into the corn
function st37Foot4(){return st37Cv(12,7,(P)=>{const o='#0a0c10',m='#1c2430',d='#121820',sh='#7e94ac',hi='#dceaf8';
  // the sole (toes to the left), 6 x 7, rounded; the heel, 4 x 5; the arch gap between
  for(const [y,x0,x1] of [[0,1,4],[1,0,5],[2,0,5],[3,0,5],[4,0,5],[5,0,5],[6,1,4]])for(let x=x0;x<=x1;x++)P(x,y,1,1,(y===0||y===6||x===x0||x===x1)?o:m);
  for(const [y,x0,x1] of [[1,8,10],[2,7,11],[3,7,11],[4,7,11],[5,8,10]])for(let x=x0;x<=x1;x++)P(x,y,1,1,(y===1||y===5||x===x0||x===x1)?o:d);
  P(6,3,1,1,o);   // the arch, barely touching
  P(1,2,3,1,sh);P(1,3,1,1,sh);P(2,2,1,1,hi);P(8,2,2,1,sh);P(8,2,1,1,hi);P(3,5,2,1,'#2a3440');});}
(function(){const base=st37Foot4();for(const [k,dir] of [['W',0],['E',1],['S',2],['N',3]])for(const side of [0,1]){const c=document.createElement('canvas');const vert=dir>=2;c.width=vert?7:12;c.height=vert?12:7;const g=c.getContext('2d');
  g.save();if(dir===1){g.translate(12,0);g.scale(-1,1);}else if(dir===2){g.translate(0,12);g.rotate(-Math.PI/2);}else if(dir===3){g.translate(7,0);g.rotate(Math.PI/2);}   /* S: toes down; N: toes up */
  if(side&&!vert){g.translate(0,7);g.scale(1,-1);}g.drawImage(base,0,0);g.restore();st37Reg('st37_fp'+k+side,c,c.width/2,c.height-1);}})();
// r4: Old Marrow's hearths: the burnt houses' chimneys stand close enough together to be seen at once, and on the hearth night one of them
// breathes: ash and smoke puffing up from it, slow, in and out
const ST37_HEARTHS=[[14,-112],[-7,-105],[15,-105.5]];
{const iv=setInterval(()=>{try{if(!OBJ.some(o=>o.spr==='rg_chimney'&&Math.abs(o.x+2)<.6&&Math.abs(o.z+114)<.6))return;clearInterval(iv);
    for(const [x0,z0] of ST37_HEARTHS){if(OBJ.some(o=>o.spr==='rg_chimney'&&Math.hypot(o.x-x0,o.z-z0)<3))continue;const q={x:x0,z:z0};collide(q,.6);if(Math.hypot(q.x-x0,q.z-z0)>.05)continue;
      obj('rg_chimney',x0,z0,{kind:'prop',solid:1});addCircle(x0,z0+.1,.55);}if(typeof CGRID!=='undefined')CGRID.dirty=true;}catch(e){}},700);}
{const _go=glowObjs;glowObjs=function(){const r=_go.apply(this,arguments);try{if(ST37.hearth===S.day&&typeof nightK!=='undefined'&&nightK>.05&&!S.room){const t=performance.now()/1000;
      const o=OBJ.find(q=>q.spr==='rg_chimney'&&!q.hide&&Math.abs(q.x+7)<.6&&Math.abs(q.z+105)<.6)||OBJ.find(q=>q.spr==='rg_chimney'&&!q.hide);if(!o)return r;
      const br=(Math.sin(t*2.2)+1)/2;if(Math.random()<.25+.5*br){const top=(SPR.rg_chimney?SPR.rg_chimney.ay:60)/PPM;parts.push({x:o.x+(Math.random()-.5)*.25,z:o.z,y:top,vx:(Math.random()-.5)*.25+.1,vz:0,vy:.5+Math.random()*.5,t:0,life:2.4,col:Math.random()<.4?'#d0c8c0':Math.random()<.5?'#a8a09a':'#ff8a30',size:Math.random()<.3?6:4});}}}catch(e){}return r;};}
// r4: the orchard close-up: the one tree, its crown packed with apples, every one bitten (a child's bites, each its own size and side, two or
// three tooth-marks deep, the flesh browning at the edge); the lowest apple hangs big on its stalk, and in its bite a milk tooth, white, roots and all
function st37Orchard4(){return st37Cv(ST37W,ST37H,(P)=>{
  for(let y=0;y<ST37H;y++)for(let x=0;x<ST37W;x++)P(x,y,1,1,y<96?(y<40?'#2a2436':y<70?'#322a3a':'#3a3038'):(st37H(x>>1,y)%5===0?'#3a4a22':'#2e3e1c'));   // dusk; the grass
  // the trunk, gnarled, to the left of the middle, and one low branch reaching right
  for(let y=58;y<ST37H;y++){const w=9+Math.round((y-58)*.12)+(st37H(1,y>>2)%2),x0=58-Math.round(Math.sin(y*.13)*2);for(let x=x0;x<x0+w;x++)P(x,y,1,1,x===x0?'#140c08':x<x0+3?'#5a3e28':x<x0+w-2?'#3e2a1a':'#24180e');P(x0+w,y,1,1,'#140c08');}
  for(let i=0;i<46;i++){const x=64+i,y=Math.round(62+Math.sin(i*.12)*2-i*.08);P(x,y-1,1,4,'#140c08');P(x,y,1,2,'#4a3220');P(x,y,1,1,'#6a4a30');}
  // the crown: a dense mass of leaves, lit from the upper left, the first yellow of autumn in it
  const crown=(x,y)=>((x-86)/80)**2+((y-34)/32)**2+(st37H(x>>2,y>>2)%10)*.018<1&&y<66;
  for(let y=0;y<70;y++)for(let x=0;x<ST37W;x++){if(!crown(x,y))continue;const h=st37H(x,y),hc=st37H(x>>1,y>>1);const lit=(x-86)/80+(y-34)/32<-.35;
    P(x,y,1,1,hc%9===0?'#7a7a2a':lit?(h%3?'#5a6a2a':'#6e7a32'):(h%4===0?'#2a3818':h%3?'#3a4a22':'#46562a'));if(!crown(x,y+1))P(x,y+1,1,1,'#1a2410');}
  // the apples, packed in, every one bitten
  const apple=(cx,cy,r,col,bite)=>{st37Ell(P,cx,cy,r+1,r+1,'#2a0a08');st37Ell(P,cx,cy,r,r,yy=>yy<-r/3?col[2]:yy<r/3?col[0]:col[1]);P(cx-Math.ceil(r/2),cy-Math.ceil(r/2),Math.max(1,r>>1),1,'#f8a088');
    if(bite){const [ang,marks,depth]=bite;const bx=cx+Math.cos(ang)*r,by=cy+Math.sin(ang)*r;for(let m=0;m<marks;m++){const off=(m-(marks-1)/2)*Math.max(1.6,r*.42),px=bx-Math.sin(ang)*off,py=by+Math.cos(ang)*off,rr=Math.max(1.2,r*depth);
        for(let yy=-Math.ceil(rr)-1;yy<=Math.ceil(rr)+1;yy++)for(let xx=-Math.ceil(rr)-1;xx<=Math.ceil(rr)+1;xx++){const d=Math.hypot(xx,yy);const X=Math.round(px+xx),Y=Math.round(py+yy);if(Math.hypot(X-cx,Y-cy)>r+.3)continue;
          if(d<rr-.6)P(X,Y,1,1,'#f0e2c4');else if(d<rr+.4)P(X,Y,1,1,'#b0884e');}}}
    P(cx,cy-r-2,1,2,'#3a2a14');};
  const REDS=[['#b8302a','#7a1814','#d8483a'],['#a8281e','#6a140e','#c84030'],['#c8402a','#8a2014','#e86040'],['#a89030','#6a5a18','#c8b048'],['#c8782a','#8a4a14','#e8983a']];
  let n=0;for(let gy=8;gy<62;gy+=8)for(let gx=14;gx<164;gx+=9){const x=gx+(st37H(gx,gy)%5)-2+((gy>>3)%2)*4,y=gy+(st37H(gy,gx)%4)-1;if(!crown(x,y)||!crown(x+3,y+3)||!crown(x-3,y-3))continue;if(x>88&&x<114&&y>54)continue;
    const r=2+st37H(x,y)%2;const ang=(st37H(x,y+5)%8)/8*Math.PI*2;apple(x,y,r,REDS[st37H(x+1,y)%5],[ang,2+st37H(y,x)%2,.38+(st37H(x,3)%3)*.08]);n++;}
  // the lowest apple: big, on a long stalk from the branch, a child's bite out of its left side, and the tooth in the bite
  for(let y=60;y<66;y++)P(104,y,1,1,'#3a2a14');P(105,61,3,2,'#4a6a28');
  const ax=107,ay=77,ar=10;apple(ax,ay,ar,REDS[0],[Math.PI*1.0,3,.42]);
  // the milk tooth, set in the bite: a white crown with its lit edge, and two roots, the tips still red
  const tx=97,ty=74;P(tx-1,ty-1,7,7,'#2a1a14');P(tx,ty,5,5,'#fbf8f0');P(tx,ty,5,1,'#ffffff');P(tx,ty,1,5,'#ffffff');P(tx+4,ty+1,1,4,'#d8d0c0');P(tx+1,ty+4,4,1,'#e2dacb');P(tx+2,ty+2,1,1,'#e8e2d6');
  for(const ry of [ty+1,ty+3]){P(tx-4,ry-1,4,3,'#2a1a14');P(tx-3,ry,3,1,'#ece2cc');P(tx-4,ry,1,1,'#b03028');}   /* the two roots, out of the bite, their tips still red */
  P(tx+4,ty,1,1,'#2a1a14');P(tx+4,ty+4,1,1,'#2a1a14');P(tx+5,ty,1,1,'#f0e2c4');P(tx+5,ty+4,1,1,'#f0e2c4');P(tx+4,ty+2,1,1,'#b8ac98');P(tx,ty,1,1,'#2a1a14');P(tx,ty+4,1,1,'#2a1a14');   /* the crown rounded, a cusp in its biting edge */
  });}
SGT_DRAW.orchard=st37Orchard4;
// r4: the credits' valley drawn at the game's own pixel scale (320 x 180, four screen pixels to one, as the world is), not the end card's
// picture blown up: the same dawn, with room for its detail: banded sky dithered between bands, lit cloud edges, the sun's rim and its
// glow on the ridge, two ridges and a pine line, the church with its lit window, the cabin with smoke, the furrows running in, the empty pole
function st37DawnBig(cv){const W=320,H=180;cv.width=W;cv.height=H;const g=cv.getContext('2d');const P=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w||1,h||1);};const hs=st37H;
  const sky=['#201a30','#2c2238','#3a2840','#4a2e44','#5a3444','#6e3a48','#84444a','#9a5250','#b0604e','#c47456','#d88a5a','#e49c64','#eaac6e','#f0bc7a'];const bh=7;
  for(let y=0;y<96;y++){const i=Math.min(sky.length-1,Math.floor(y/bh)),f=(y%bh)/bh;for(let x=0;x<W;x++){const up=i+1<sky.length&&f>.6&&((x+y)%2===0)&&(f>.8||(x%4===0));P(x,y,1,1,up?sky[i+1]:sky[i]);}}
  // clouds: long low streaks, lit along their lower edge by the sun below the ridge
  for(const [cx,cy,w,col,lit] of [[60,20,70,'#4a3048','#7a4458'],[190,30,84,'#6e3c48','#a85a5a'],[120,46,56,'#9a5050','#d8805e'],[262,58,52,'#c27456','#f0a46a'],[30,64,40,'#b06650','#e0905e']]){
    for(let k=0;k<w;k++){const t=k/w,h=Math.round(Math.sin(t*Math.PI)*(4+hs(k,cy)%2));P(Math.round(cx-w/2+k),cy-h,1,h+1,col);P(Math.round(cx-w/2+k),cy+1,1,1,lit);}}
  // the sun's rim on the ridge, its glow spread along the skyline
  for(let r=26;r>0;r-=2){const a=['#e8a464','#eeb070','#f2be7c','#f6cc8a'][Math.min(3,Math.floor((26-r)/6))];for(let x=-r;x<=r;x++){const h=Math.round(Math.sqrt(r*r-x*x)*.35);P(232+x,88-h,1,h,a);}}
  st37Ell(P,232,88,14,13,'#fbd88a');st37Ell(P,232,88,12,11,'#fde6a4');st37Ell(P,229,85,6,5,'#fff4cc');
  const ridge=(y0,amp,col,seed,top)=>{for(let x=0;x<W;x++){const h=Math.round(y0+Math.sin(x*.035+seed)*amp+Math.sin(x*.095+seed*2)*amp*.4);P(x,h,1,H-h,col);if(top)P(x,h,1,1,top);}};
  ridge(88,6,'#5a3a48',1,'#7a4a52');ridge(100,5,'#3e2c3a',4,'#5a3a44');
  // pines on the near ridge, two clumps
  for(const [x,y,h] of [[16,100,18],[28,98,24],[40,102,16],[52,99,20],[262,98,22],[276,100,17],[288,96,26],[300,99,19],[312,101,15]]){for(let k=0;k<h;k++){const w=Math.max(1,Math.round((k/h)*7)+((k%4===3)?-1:0));P(x-w,y-h+k,w*2+1,1,'#22202c');}P(x,y,1,4,'#1a1820');}
  // the church on the far ridge: nave, tower and spire, one window lit
  P(122,78,30,24,'#2a2230');P(132,58,10,20,'#2a2230');P(135,48,4,10,'#2a2230');P(136,42,2,6,'#2a2230');P(136,40,2,2,'#4a4050');P(128,86,5,7,'#f0b060');P(129,87,3,1,'#fff0c0');P(144,86,4,6,'#3a2a34');
  // the field: furrows running in toward the cabin, their ridges catching the light
  ridge(112,3,'#4a3a2a',7,'#6a5236');const vx=68,vy=120;for(let y=116;y<H;y++)for(let x=0;x<W;x++){const ang=Math.atan2(y-vy,x-vx);const k=Math.floor((ang+Math.PI)/(Math.PI/40));
    const c=k%2?(y<140?'#5e4830':'#6a5232'):(y<140?'#7a5e34':'#8a6a3a');P(x,y,1,1,(hs(x,y)%13===0&&k%2===0)?'#a08048':c);}
  // the cabin: logs, a shingled roof, the porch, one window lit, and the smoke in soft round puffs
  P(44,116,52,28,'#1c1418');for(let k=0;k<14;k++)P(40+k,116-k,60-k*2,1,k%3?'#2a1e1c':'#342422');for(let y=120;y<144;y+=4)P(44,y,52,1,'#140e10');
  P(58,124,7,7,'#f2c070');P(58,124,7,1,'#fff0c0');P(61,124,1,7,'#a8783a');P(58,127,7,1,'#a8783a');P(76,128,8,16,'#120c0e');P(40,142,60,3,'#2a1e1a');
  P(84,96,6,12,'#2a1e1c');for(const [px,py,r] of [[87,90,3],[90,82,4],[88,73,5],[93,63,6],[98,52,5],[104,43,4]]){st37Ell(P,px,py,r+1,r,'#8a7a84');st37Ell(P,px,py,r,r-1,'#a8969a');st37Ell(P,px-1,py-1,r-2>0?r-2:1,r-2>0?r-2:1,'#c4b2b2');}
  // the scarecrow's pole, empty, a snapped rope from the crossbar and straw at its foot
  P(192,114,2,30,'#1a1214');P(184,120,18,2,'#1a1214');P(190,114,6,2,'#1a1214');P(197,122,1,6,'#3a2a20');P(198,127,1,3,'#3a2a20');P(196,129,2,1,'#3a2a20');
  for(const [x,y,c] of [[186,122,'#c8a048'],[185,123,'#a88030'],[188,123,'#d8b058'],[189,144,'#c8a048'],[193,144,'#a88030'],[195,143,'#c8a048'],[191,145,'#d8b058']])P(x,y,1,1,c);
  // the road out, pale, toward the light
  for(let y=144;y<H;y++){const x=Math.round(236+(y-144)*1.5);P(x,y,8+((y-144)>>1),1,'#a08a6a');P(x,y,1,1,'#7a6a52');}}
setInterval(()=>{try{const c=$('st37cbg');if(!c||c._big)return;c._big=1;st37DawnBig(c);}catch(e){}},150);
setInterval(()=>{try{const c=$('st37cbg');if(!c||!c._big)return;const k=Math.max(1,Math.ceil(Math.max(innerWidth/320,innerHeight/180)));c.style.width=(320*k)+'px';c.style.height=(180*k)+'px';}catch(e){}},200);

// r4: the crash's steam: a plume off the folded hood, round puffs rising and leaning away from the oak, thinning as they go
{const _md=mindDrawables;mindDrawables=function(D){_md.apply(this,arguments);try{const w=ST37_CAR&&ST37_CAR.want;if(!w||(S.carStage||0)>=3||S.room)return;const o=ST37_CAR.o;if(!o||o.hide)return;
    D.push({z:o.z+.4,mind:1,draw(){const t=performance.now()/1000,X0=sx(o.x)+48,Y0=sz(o.z)-(w==='s0'?52:42);for(let i=0;i<12;i++){const ph=(t*.55+i/12)%1,r=Math.round(2+ph*7);const x=Math.round(X0+ph*26+Math.sin(t*1.3+i)*3),y=Math.round(Y0-ph*58);const a=(.5*(1-ph)).toFixed(3);
      ctx2.fillStyle=`rgba(226,228,234,${a})`;ctx2.fillRect(x-r,y-r+1,r*2,r*2-2);ctx2.fillRect(x-r+1,y-r,r*2-2,r*2);ctx2.fillStyle=`rgba(250,250,252,${(a*.6).toFixed(3)})`;ctx2.fillRect(x-r+1,y-r+1,r,r-1);}}});}catch(e){}};}
// r4: the repair in progress at the crash site: the torn-off bumper lying where it fell by the oak, an open toolbox, a wrench and a jack in
// the grass; and no glowcaps sprouting in the middle of it all
const ST37_WIP=[];
{const o='#0e0a0a';
  st37Reg('st37_bumper',st37Cv(34,10,(P)=>{P(1,8,32,2,'rgba(10,8,10,.35)');const pts=[[1,3],[12,4],[17,6],[22,4],[33,2]];for(let i=1;i<pts.length;i++){const [a,b]=pts[i-1],[c,d]=pts[i];for(let x=a;x<=c;x++){const y=Math.round(b+(d-b)*(x-a)/Math.max(1,c-a));P(x,y-1,1,5,o);P(x,y,1,1,'#e8e8ec');P(x,y+1,1,1,'#a8a8b0');P(x,y+2,1,1,'#6a6a74');}}
    P(15,5,3,2,'#7c2e2e');P(16,5,1,1,'#a84438');P(28,2,3,1,'#7c2e2e');P(4,5,2,1,'#3a3a40');}),17,9);   // chrome, bent in the middle, a scrap of red paint still on it
  st37Reg('st37_toolbox',st37Cv(18,14,(P)=>{P(1,12,17,2,'rgba(10,8,10,.4)');P(1,5,16,8,o);P(2,6,14,6,'#a82820');P(2,6,14,1,'#d04838');P(2,11,14,1,'#6a1410');P(8,8,3,1,'#c8c8cc');   // the box
    P(2,0,14,6,o);P(3,1,12,4,'#8a2018');P(3,1,12,1,'#b83a2c');   // the lid, open, leaning back
    P(4,4,1,3,'#9a9aa2');P(4,3,2,1,'#c8c8cc');P(11,3,1,4,'#9a9aa2');P(10,2,3,1,'#c8c8cc');P(7,4,2,2,'#e0a020');}),9,13);   // tool handles standing up in it
  st37Reg('st37_wrench',st37Cv(14,6,(P)=>{P(1,5,12,1,'rgba(10,8,10,.35)');P(2,1,9,3,o);P(3,2,7,1,'#b8b8c0');P(10,0,3,5,o);P(11,1,2,1,'#c8c8cc');P(11,3,2,1,'#c8c8cc');P(1,1,2,3,o);P(1,2,1,1,'#9a9aa2');}),7,5);
  st37Reg('st37_jack',st37Cv(16,10,(P)=>{P(1,9,14,1,'rgba(10,8,10,.4)');P(1,7,14,2,o);P(2,7,12,1,'#5a5a64');for(let k=0;k<5;k++){P(3+k,6-k,1,1,'#8a8a94');P(12-k,6-k,1,1,'#8a8a94');}P(6,1,4,2,o);P(7,1,2,1,'#a8a8b0');P(13,4,3,1,'#c8a048');}),8,9);}
{const iv=setInterval(()=>{try{if(typeof mushrooms==='undefined'||!OBJ.some(o=>o.crashOak))return;clearInterval(iv);
    for(let i=mushrooms.length-1;i>=0;i--){const m=mushrooms[i];if(Math.abs(m.x+59)<14&&Math.abs(m.z-3)<9){m.taken=true;mushrooms.splice(i,1);}}
    for(const [spr,x,z] of [['st37_bumper',-58.0,3.15],['st37_toolbox',-63.3,2.9],['st37_wrench',-61.4,3.05],['st37_jack',-60.2,2.55]])ST37_WIP.push(obj(spr,x,z,{kind:'prop',noCol:true,hide:true}));}catch(e){}},700);}
setInterval(()=>{try{const cs=S.carStage||0,on=!S.carFixed&&cs>=1&&cs<=4&&!(S.introDrive);for(const o of ST37_WIP)o.hide=!on;}catch(e){}},400);
