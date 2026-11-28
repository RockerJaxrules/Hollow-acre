/* ================= the story plan, wave 1 (docs/STORY_PLAN.md: chapter 1 and section 3): you only go where you have a reason to.
   - The character remembers where they have been (an 8 m grid, marked as you walk) and what people have told them. The guide
     arrow and its compass chip only point at a place the character knows; otherwise the goal says to ask someone the way, and
     anyone you talk to points you there and it becomes known.
   - The ordinary start: Grandpa's map in the envelope gives a direction, not a place (east, his sign by the lane); the note on
     the door is short and ordinary (key, stove, seed, who buys crops, who fixes cars, the bell, burn the diary); Hollis's
     parts list reads as Hollis's; the first odd things are noticed, not told (the scarecrow a step closer, a ring of prints in
     the dew round the cabin).
   - Chapter One's beats come from what you notice or are told: crows over the track behind the barn, the well water tasting of
     pennies, the barn door banging with no wind; Caitlyn says who knew Grandpa longest; someone in town says the Pine Rest
     was lit the night you came; someone sends you to Pastor Hale before you know anything about candles.
   - The Journal gets a Leads tab: to follow, followed, and things that aren't right.
   Saves from before this keep the old guidance exactly (S.knOld): only the Leads tab is new for them. ================= */
const LD={cell:8,r:14};
const ldOld=()=>!!S.knOld;
function ldMark(x,z,r){if(!S.kn)return;const c=LD.cell,i0=Math.floor((x-r)/c),i1=Math.floor((x+r)/c),j0=Math.floor((z-r)/c),j1=Math.floor((z+r)/c);
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){if(Math.hypot((i+.5)*c-x,(j+.5)*c-z)<=r+c*.71)S.kn[i+','+j]=1;}}
const ldSeen=(x,z)=>!!(S.kn&&S.kn[Math.floor(x/LD.cell)+','+Math.floor(z/LD.cell)]);
const ldTold=(x,z)=>(S.told||[]).some(t=>Math.hypot(t[0]-x,t[1]-z)<=t[2]);
function ldKnown(t){if(!t||ldOld())return true;
  if(t.def&&t.def.id){const id=t.def.id;return !!((S.talked&&S.talked[id])||(S.toldNpc&&S.toldNpc[id]));}
  const o=typeof outsidePoint==='function'?outsidePoint(t):t;if(!o)return true;
  if(S.foundCabin&&Math.hypot(o.x-doorPos.x,o.z-doorPos.z)<30)return true;   // your own farm, once you've found it
  return ldSeen(o.x,o.z)||ldTold(o.x,o.z);}
function ldTell(t){if(!t)return;if(t.def&&t.def.id){S.toldNpc=S.toldNpc||{};S.toldNpc[t.def.id]=S.day;return;}
  const o=typeof outsidePoint==='function'?outsidePoint(t):t;if(!o)return;(S.told=S.told||[]).push([+o.x.toFixed(1),+o.z.toFixed(1),6]);if(S.told.length>80)S.told.shift();}
// a new game starts knowing nothing; a save from before this keeps the old guidance
{const _lg=loadGame;loadGame=function(d){const r=_lg.apply(this,arguments);try{if(!d||!d.S||d.S.kn===undefined){S.kn={};S.knOld=true;}}catch(e){}return r;};}
const ldLive=()=>S.mode!=='title'&&S.mode!=='load'&&S.mode!=='cine'&&!S.introDrive;
setInterval(()=>{try{if(!ldLive())return;if(S.kn===undefined){S.kn={};S.knOld=!!(S.foundCabin||S.day>1);}
    if(!S.toldCross&&(S.c37hale||(S.candles||0)>0)){S.toldCross=1;ldTell(crossPos);}   // Hale named the crossroads when he spared the candle
    if(S.room){const R=ROOMS[S.room];if(R&&R.out)ldMark(R.out.x,R.out.z,6);return;}ldMark(P.x,P.z,LD.r);}catch(e){}},500);

// ---- the note on the door: short and ordinary (finale.js may have added its own P.S. after the first nine lines: kept)
try{LETTER.splice(0,9,'<span class="date">Nailed to the cabin door</span>','Kid,',
  'Key’s under the flowerpot. Kick the stove low on the left, it sulks. Seed’s in the tin on the shelf.',
  'Caitlyn Coyle at the store buys what you grow. Put it in the shipping bin by the door and she sends for it. Hollis Pruitt at the garage can fix most anything.',
  'Be indoors when the church bell rings. Town’s particular about that.',
  'If you find pages of my diary lying about, don’t read them. Burn them.',
  '<span class="sig">Grandpa Elias</span>','P.S. Leave the scarecrow be.');}catch(e){}

// ---- Chapter One's beats, from what you notice on your own farm
(function(){try{const g={deer:'Crows have been circling over the farm track behind the barn since first light.',
    well:'The water you drew this morning tasted of pennies. Look down the well.',
    barn:'The barn door keeps banging, and there’s no wind. Go and shut it.'};
  for(const b of SAGA)if(g[b.id])b.goal=g[b.id];}catch(e){}})();

// ---- the crows over the barn track while the deer lies there, high enough to see from anywhere on the farm; a caw now and then
const LD_CROWS=[0,1,2,3].map(i=>({x:0,z:0,h:44,st:'fly',dir:1,kind:'crow',ph:i*1.6,a:i*1.57}));let LD_CROWAT=null,LD_CAW=3;
const ldCrowsOn=()=>{try{const b=sgCurrent();return !S.room&&!isNight()&&!!b&&b.id==='deer';}catch(e){return false;}};
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);try{if(!ldCrowsOn()||typeof ambBird!=='function')return;
    if(!LD_CROWAT){const b=ldBeat('deer');LD_CROWAT=b&&b.at?b.at():{x:11,z:-15};}const p=LD_CROWAT,now=performance.now()/1000;
    for(const b of LD_CROWS){const a=b.a+now*.55;b.x=p.x+Math.cos(a)*2.6;b.z=p.z+Math.sin(a)*1.3;b.dir=Math.sin(a)>0?-1:1;b.h=30+Math.sin(now*1.3+b.ph)*5;
      if(!onScreen(b.x,b.z,90))continue;D.push({z:p.z+40,mind:1,draw(){ambBird(b,Math.round(sx(b.x)),Math.round(sz(b.z)));}});}
    LD_CAW-=1/60;if(LD_CAW<=0){LD_CAW=4+Math.random()*5;if(Math.hypot(P.x-p.x,P.z-p.z)<45&&A&&A.tone)A.tone(500,.2,'sawtooth',.022,{slide:360});}}catch(e){}};}

// ---- what people tell you when you ask (new games): the beat waits as a question until someone answers it
const LD_ASK={
  agnes:{who:['mae'],before:'Somebody in town knew Grandpa better than anyone. Caitlyn would know who.',
    line:()=>'“Agnes Abernathy. She knew him longest.” She nods west. “Last house on Route 9, the one with the porch light on.”',
    lead:()=>'Caitlyn said Agnes Abernathy knew Grandpa longest. Last house west, porch light on.'},
  motel:{who:'any',before:'Somebody must have seen your car come in that night. Ask around town.',
    line:n=>`“The Pine Rest had its sign lit the night you came in,” says ${n}. “Nobody’s run that place in years.”`,
    lead:n=>`${n} said the Pine Rest Motel had its sign lit the night I came in. It’s west on Route 9, past the crash. Look in the office.`},
  candles:{who:'nothale',before:'There is no road out. Grandpa was busy with something before he went. Somebody in town knows what.',
    line:n=>`“Ask the pastor,” says ${n}. “Elias was up at that church more than anyone this autumn.”`,
    lead:n=>`${n} said to ask Pastor Hale. Grandpa was up at the church a lot this autumn.`}};
const ldAsked=k=>!!(S.leads&&S.leads['ask_'+k]);
const ldBeat=id=>{try{return SAGA.find(b=>b.id===id)||null;}catch(e){return null;}};
const ldBeatTitle=id=>{const b=ldBeat(id);return b?sgVal(b.name):null;};
function ldCandlesKnown(){return ldOld()||ldAsked('candles')||!!S.c37hale||(S.candles||0)+(typeof lit==='function'?lit():0)>0;}
function ldPending(){// the question the goal is waiting on right now, if any
  if(ldOld())return null;let o;try{o=ldBase();}catch(e){return null;}if(!o)return null;
  for(const k of ['agnes','motel'])if(o[0]===ldBeatTitle(k)&&!ldAsked(k)&&!sgDone(k))return k;
  if(o[0]==='Candles'&&!ldCandlesKnown())return 'candles';return null;}
let LD_INNER=false;const ldBase=()=>{LD_INNER=true;try{return objective();}finally{LD_INNER=false;}};

// ---- the goal bar: leads, not orders; the arrow only for places the character knows
const ldStrip=s=>String(s).replace(/\s*<span class="odir">[^<]*<\/span>/g,'');
{const _o=objective;objective=function(){const r=_o.apply(this,arguments);if(LD_INNER)return r;try{return ldGoal(r);}catch(e){return r;}};}
function ldGoal(r){if(!r||!Array.isArray(r))return r;const t=r[0];
  if(t==='Stranded'&&!ldOld()){if(ldSeen(farmSignPos.x,farmSignPos.z)||ldSeen(doorPos.x,doorPos.z))return ['Stranded','Grandpa’s lane, by the HOLLOW ACRE sign.',r[2]];
    return ['Stranded','Grandpa’s map, from the envelope on the seat: past Pruitt’s garage, keep east. His sign is by the lane. <span class="odir">→ east</span>',null];}
  if(t==='The car'&&S.q&&S.q.hollis&&/^Car parts /.test(r[1]))r=[t,r[1].replace(/^Car parts (\d)\/4\./,'Hollis’s list: $1 of 4 parts.'),r[2]];
  if(!ldOld()){
    for(const k of ['agnes','motel'])if(t===ldBeatTitle(k)&&!sgDone(k)){
      if(!ldAsked(k))return [t,LD_ASK[k].before,null];
      if(k==='motel')return [t,S.leads.ask_motel.txt,r[2]];
      if(k==='agnes')r=[t,'Caitlyn said: '+r[1],r[2]];}
    if(t==='Candles'&&!ldCandlesKnown())return ['Candles',LD_ASK.candles.before,null];
    if(t==='Candles'&&ldAsked('candles')&&!S.c37hale&&(S.candles||0)+lit()===0){const h=npcById('hale');return ['Candles','Ask Pastor Hale what Grandpa was doing. The church is at the top of town.',h&&h.vis?h:CHURCH_STEP];}}
  if(r[2]&&!ldKnown(r[2]))return [t,ldStrip(r[1])+' <span class="ldask">Ask someone the way.</span>',null];
  return r;}
{const c=document.createElement('style');c.textContent='.ldask{display:inline-block;margin-left:.35em;opacity:.8;font-style:italic}#talkLine .ldsay{display:inline-block;margin-top:.35em}';document.head.appendChild(c);}

// ---- asking: whoever you talk to answers the goal's question, or points you the way
// how people are named when they answer: "Sheriff Dunn", "Pastor Hale", but "Caitlyn", "Otto"
const ldName=n=>{const f=n.def.name;return /^(Sheriff|Pastor|Dr\.|Brother|Mrs?\.|Miss)\s/.test(f)?f.split(' ').slice(0,2).join(' '):f.split(' ')[0];};
const LD_CMP=['north','north-east','east','south-east','south','south-west','west','north-west'];
function ldDir(fx,fz,tx,tz){const a=Math.atan2(tx-fx,-(tz-fz)),i=((Math.round(a/(Math.PI/4))%8)+8)%8;return LD_CMP[i];}
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{ldOnTalk(n);}catch(e){console.warn('leads',e);}return r;};}
function ldOnTalk(n){if(ldOld()||!n||!n.def||isNight())return;const box=$('talk'),line=$('talkLine');if(!box||box.hidden||!line)return;
  const id=n.def.id,nm=ldName(n);S.leads=S.leads||{};
  const k=ldPending();
  if(k){const a=LD_ASK[k];const ok=a.who==='any'||(a.who==='nothale'&&id!=='hale')||(Array.isArray(a.who)&&a.who.includes(id));if(!ok)return;
    S.leads['ask_'+k]={d:S.day,n:nm,txt:a.lead(nm)};line.insertAdjacentHTML('beforeend',`<br><span class="ldsay">${a.line(nm)}</span>`);
    if(k==='agnes')ldTell(npcById('agnes'));if(k==='candles'){ldTell(npcById('hale'));ldTell(CHURCH_STEP);}
    if(k==='motel'&&typeof RGP!=='undefined'&&RGP.motel)ldTell({x:RGP.motel.x,z:RGP.motel.z+.7});SFX.page&&SFX.page();return;}
  const o=objective();if(!o||o[2])return;let base;try{base=ldBase();}catch(e){return;}const tg=base&&base[2];if(!tg||ldKnown(tg))return;
  const p=tg.def?tg:(typeof outsidePoint==='function'?outsidePoint(tg):tg);if(!p)return;const dir=ldDir(n.x,n.z,p.x,p.z);
  line.insertAdjacentHTML('beforeend',`<br><span class="ldsay">“${base[0]}? You want to go ${dir} from here.” ${nm} points.</span>`);
  ldTell(tg);S.leads['way_'+S.day+'_'+id]={d:S.day,n:nm,g:base[0],txt:`Pointed me ${dir}, for ${base[0].replace(/<[^>]+>/g,'').replace(/^The /,'the ')}.`};}

// ---- the first odd things: noticed, not told
S.odd=S.odd||{};
{const sp=()=>({x:scare.x,z:scare.z+.7});
  interact.push({get x(){return sp().x;},get z(){return sp().z;},r:1.3,on:()=>!S.bound&&S.day>=2&&!S.room&&!isNight(),label:()=>'Look',ok:()=>true,
    act(){if(!S.odd.scare){S.odd.scare=S.day;mindHit&&mindHit(2);}toast('“Wasn’t it by the fence?”',2.6);}});}
// the morning after your first night: a ring of prints in the dew round the cabin, your size; gone by eleven
const ldDew=()=>!S.bound&&S.day===2&&S.hour>=6&&S.hour<11&&!S.room;
{const _mg=mindGround;mindGround=function(){_mg.apply(this,arguments);try{if(!ldDew())return;const a=clamp((11-S.hour)/2,0,1)*.5;const c=doorPos;
    ctx2.fillStyle=`rgba(20,26,30,${a.toFixed(2)})`;for(let i=0;i<22;i++){const t=i/22*Math.PI*2,R=4.6+(i%2?.35:-.35),x=c.x+Math.cos(t)*R,z=c.z+1.2+Math.sin(t)*R*.62;
      if(!onScreen(x,z,40))continue;const X=Math.round(sx(x)),Y=Math.round(sz(z));ctx2.fillRect(X-1,Y-2,3,4);ctx2.fillRect(X-1,Y+3,3,2);}}catch(e){}};}
setInterval(()=>{try{if(S.mode==='play'&&ldDew()&&!S.odd.prints&&Math.hypot(P.x-doorPos.x,P.z-doorPos.z)<7){S.odd.prints=S.day;mindHit&&mindHit(3);}}catch(e){}},700);

// ---- the Journal's Leads tab
const LD_LIST=[ // [source, text, learned(), done(), where the arrow could point]
  ['Grandpa’s envelope','His map: past Pruitt’s garage, keep east. His sign is by the lane.',()=>true,()=>!!S.foundCabin],
  ['Grandpa’s note','Hollis Pruitt at the garage can fix most anything.',()=>!!S.readLetter,()=>!!(S.q&&S.q.hollis)],
  ['Grandpa’s note','Caitlyn Coyle at the store buys what I grow, if I put it in the shipping bin by the door.',()=>!!S.readLetter,()=>S.shipped>0],
  ['Grandpa’s note',()=>`If I find pages of his diary I’m to burn them, unread. (${S.pages.length} of 6 found.)`,()=>!!S.readLetter,()=>S.pages.length>=6],
  ['Hollis said','A tire: Coyle’s store, east on Route 9.',()=>!!(S.q&&S.q.hollis),()=>S.carFixed||S.parts.tire>0],
  ['Hollis said','A battery: he’ll trade one for three of Grandpa’s pumpkins.',()=>!!(S.q&&S.q.hollis),()=>S.carFixed||S.parts.battery>0],
  ['Hollis said','A fan belt: Agnes Abernathy’s late husband’s truck has sat in her shed twenty years. Last house west, porch light on.',()=>!!(S.q&&S.q.hollis),()=>S.carFixed||S.parts.belt>0],
  ['Hollis said','Gas: the pump outside his garage.',()=>!!(S.q&&S.q.hollis),()=>S.carFixed||S.parts.gas>0],
  ['The car runs','West, the way I came in.',()=>!!S.carFixed,()=>!!S.looped],
  ['I saw','Crows circling over the farm track behind the barn.',()=>sgVisible('deer'),()=>sgDone('deer')],
  ['I tasted','The well water, tasting of pennies.',()=>sgVisible('well'),()=>sgDone('well')],
  ['I heard','The barn door banging with no wind.',()=>sgVisible('barn'),()=>sgDone('barn')],
  ['Caitlyn said','Agnes Abernathy knew Grandpa longest. Last house west.',()=>ldAsked('agnes')||(ldOld()&&sgDone('agnes')),()=>sgDone('agnes')],
  ['Agnes said','Look at the small graves before buying anything from the thing at the crossroads.',()=>sgDone('agnes'),()=>sgDone('graves')],
  [()=>S.leads&&S.leads.ask_motel?S.leads.ask_motel.n+' said':'Someone said','The Pine Rest Motel had its sign lit the night I came in.',()=>ldAsked('motel')||(ldOld()&&sgDone('motel')),()=>sgDone('motel')],
  [()=>S.leads&&S.leads.ask_candles?S.leads.ask_candles.n+' said':'In town','Ask Pastor Hale what Grandpa was doing.',()=>ldAsked('candles'),()=>!!S.c37hale||(S.candles||0)+lit()>0],
  ['Pastor Hale','Ward candles for the three stones: the thing at the crossroads sells them after dark, for coin.',()=>!!S.c37hale||(S.candles||0)+lit()>0,()=>(S.candles||0)+lit()>=3||!!S.bound],
  ['Grandpa’s diary','Light the three stones after the bell, and keep my light on it.',()=>(S.candles||0)+lit()>=3||!!S.bound,()=>!!S.bound]];
const sgVisible=id=>{try{const b=sgCurrent();return sgDone(id)||!!(b&&b.id===id);}catch(e){return false;}};
const LD_ODD={scare:'The scarecrow. Wasn’t it by the fence?',prints:'A ring of footprints in the dew round the cabin. My size.'};
function leadsHtml(){const v=x=>typeof x==='function'?x():x;const open=[],done=[];
  for(const L of LD_LIST){let learned=false,fin=false;try{learned=L[2]();fin=L[3]();}catch(e){}if(!learned)continue;(fin?done:open).push([v(L[0]),v(L[1])]);}
  for(const [k,x] of Object.entries(S.leads||{}))if(/^way_/.test(k)){let cur='';try{cur=String(objective()[0]);}catch(e){}(cur===x.g?open:done).push([x.n,x.txt]);}
  let now='';try{const o=objective();if(o&&o[0]&&!open.length)now=`<p class="ldrow"><b>Now</b> ${o[0]}: ${ldStrip(o[1])}</p>`;}catch(e){}
  const row=(s,t,d)=>`<p class="ldrow${d?' lddone':''}"><b>${s}</b> ${t}${d?' <span class="ldtick">✓</span>':''}</p>`;
  const odd=Object.keys(S.odd||{}).filter(k=>LD_ODD[k]);
  return '<p class="jsub">What you know, and who told you. The arrow only points where you know the way: if it doesn’t, ask someone.</p>'+
    '<h4>To follow</h4>'+(open.length?open.slice().reverse().map(([s,t])=>row(s,t)).join(''):now||'<p class="jsub">Nothing right now.</p>')+
    (odd.length?'<h4>Things that aren’t right</h4>'+odd.map(k=>row('I noticed',LD_ODD[k])).join(''):'')+
    (done.length?'<h4>Followed</h4>'+done.slice().reverse().map(([s,t])=>row(s,t,1)).join(''):'');}
{const c=document.createElement('style');c.textContent='#noteText .ldrow{margin:.35em 0}#noteText .ldrow b{display:block;font-size:.82em;letter-spacing:.04em;opacity:.75}#noteText .lddone{opacity:.55}#noteText .ldtick{color:#4a8a2a}';document.head.appendChild(c);}
{const _jt=journalTabs;journalTabs=function(which){const r=_jt.apply(this,arguments);try{const el=$('noteText');const bar=el&&el.querySelector('.jtabs');if(!bar)return r;
  let b=bar.querySelector('[data-t="leads"]');if(!b){b=document.createElement('button');b.dataset.t='leads';b.textContent='Leads';const first=bar.querySelector('[data-t="notes"]');first?first.after(b):bar.appendChild(b);
    b.addEventListener('click',e=>{e.stopPropagation();if(JTAB==='leads')return;journalTabs('leads');});}
  bar.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.t===which));
  if(which==='leads'){JTAB='leads';el.innerHTML='<h3>Leads</h3>';el.appendChild(bar);el.insertAdjacentHTML('beforeend',leadsHtml());el.scrollTop=0;}}catch(e){console.warn(e);}return r;};}
{const _oj=openJournal;openJournal=function(){const was=JTAB;const r=_oj.apply(this,arguments);try{if(was==='leads')journalTabs('leads');}catch(e){}return r;};}
window.__leads={known:ldKnown,seen:ldSeen,pending:ldPending,html:leadsHtml,goal:ldGoal};
