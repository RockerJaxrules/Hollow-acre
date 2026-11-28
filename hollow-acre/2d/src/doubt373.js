/* ================= #292 things you'd swear were different. The mind's other effects are loud; these are quiet and deniable:
   a chair turned the other way, a watered square that looks dry, a crop standing where you picked it, one less in a stack, a word
   changed in a note you've already read, a name spelled wrong in the talk box, someone thanking you for something you didn't do,
   someone looking past you while they talk, your own steps a beat late, the wind stopping for a second, the clock going back ten
   minutes, a crow standing where you just stood, a thing on a shop shelf that was never stocked, a note on the calendar in your
   hand, waking up facing the wall. Each is rare, never explained, and most put themselves back when you look away, so you can't
   prove any of it. Rarer and smaller early on; more often, and a little stronger, as your nerve goes and the story darkens.
   Safe: every one of them is presentation on this device only. Nothing in S, the tiles, the furniture, the townsfolk or the
   wire is changed (drawn changes are made inside one render call and put back before it returns), so saves, story triggers
   and a shared farm are untouched, and a friend on the same farm sees none of it. What is going on is kept under its own key
   (hollowDoubt373), so a reload keeps the illusion without touching the save. Settings, Gameplay, "Mind games": On, Subtle
   (rarer, only the smallest) or Off (none of this runs). window.__doubt.force(name) sets one off for the tests. ===== */
const D373={rec:null,key:'hollowDoubt373'+(typeof ACCT_SUFFIX==='string'?ACCT_SUFFIX:''),force:null,lateT:0,clk:null,crow:null,look:null,mv:null,rcrop:null,
  pollT:0,saveT:0,dirty:false,loaded:false,ringX:new Float32Array(16),ringZ:new Float32Array(16),ringN:0,ringT:0,prevRoom:null,prevPaused:false,
  harvT:0,lastCrop:[],log:[]};
{
const X=D373;
// ---------------------------------------------------------------- the setting (added from here, so the shared settings file isn't touched)
try{SET7_DEF.mindGames='on';if(!['on','subtle','off'].includes(SET7.mindGames))SET7.mindGames='on';if(SET7_GK.gameplay.indexOf('mindGames')<0)SET7_GK.gameplay.push('mindGames');}catch(e){}
{const _r=set7Rows;set7Rows=function(g){const R=_r.apply(this,arguments);if(g==='gameplay'){const i=R.findIndex(r=>r.type==='button');
    R.splice(i<0?R.length:i,0,{k:'mindGames',type:'choice',label:'Mind games',opts:[['on','On'],['subtle','Subtle'],['off','Off']],sub:'Small things you can’t be sure happened. Subtle: rarer and smaller'});}return R;};}
{const _a=set7Apply;set7Apply=function(k){const r=_a.apply(this,arguments);if(k==='mindGames'&&SET7.mindGames==='off')clearAll();return r;};}
const mode=()=>{try{return SET7.mindGames||'on';}catch(e){return 'on';}};
const on=()=>mode()!=='off';
// ---------------------------------------------------------------- small helpers (Math.random, so the game's own dice are never moved)
const R=()=>Math.random();
const pickR=a=>a[(R()*a.length)|0];
const lerpR=(a,b,t)=>a+(b-a)*t;
const guest=()=>typeof HOST!=='undefined'&&HOST.role==='guest';
const inPlay=()=>S.mode==='play'&&!(typeof STG!=='undefined'&&STG)&&!(typeof cine!=='undefined'&&cine);
const night=()=>typeof isNight==='function'&&isNight();
// how hard it leans on you: your nerve (the mind's tier) and how far the story has gone
function k373(){let T=0,L=0;try{T=tierOf(M.v);}catch(e){}try{L=hl();}catch(e){}return Math.min(1,.15+T*.15+L*.12);}
const onScr=(x,z,m)=>{const a=sx(x),b=sz(z);return a>m&&a<VW-m&&b>m&&b<VH-m;};
// ---------------------------------------------------------------- the record, under its own key
function sig(){try{if(guest())return 'g:'+(HOST.code||'');if(S.world&&S.world.code)return 'w:'+S.world.code;}catch(e){}return 'solo';}
function fresh(){return {v:1,sig:sig(),day:S.day,play:0,gap:300,last:{},act:{},loreSeen:-1,harv:null,shopN:0,calN:0};}
function load(){let r=null;try{r=JSON.parse(localStorage.getItem(X.key)||'null');}catch(e){r=null;}
  if(!r||typeof r!=='object'||r.v!==1||r.sig!==sig()||!(r.day<=S.day)||!r.last||typeof r.last!=='object'||!r.act||typeof r.act!=='object')r=fresh();
  if(!isFinite(r.play))r.play=0;if(!isFinite(r.gap))r.gap=300;r.gap=Math.max(r.gap,90);   // never straight away after a load
  for(const k of ['shopN','calN','loreSeen'])if(!isFinite(r[k]))r[k]=k==='loreSeen'?-1:0;
  X.rec=r;X.loaded=true;X.prevRoom=S.room;X.prevPaused=S.paused;dayTurn();X.rcrop=null;bindMoved();}
function save(){X.dirty=false;try{localStorage.setItem(X.key,JSON.stringify(X.rec));}catch(e){}}
// things that belong to one day are let go of when the day turns
function dayTurn(){const r=X.rec;if(!r||r.day===S.day)return;r.day=S.day;
  for(const k of ['shop','dry','moved','regrown'])if(r.act[k]&&r.act[k].day!==S.day)delete r.act[k];
  if(!r.act.moved)X.mv=null;if(!r.act.regrown)X.rcrop=null;X.dirty=true;}
// ---------------------------------------------------------------- the effects (cls 2 waits until your nerve or the story has gone a way)
const FX={
  steps:   {cls:1,days:0,cd:900, frame:1},  // your own footsteps fall half a beat late, for a few steps
  hush:    {cls:1,days:0,cd:1200,frame:1},  // the wind and the drone drop out for a second
  clock:   {cls:1,days:1,cd:0,   frame:1},  // the clock steps back ten minutes, once, then carries on
  bag:     {cls:1,days:2,cd:0,   ev:'bag'},  // one stack in the bag shows one fewer, until you touch anything
  journal: {cls:1,days:2,cd:0,   ev:'journal'},  // a word in a note you've already read is different; next time it isn't
  name:    {cls:1,days:1,cd:0,   ev:'talk'},  // someone's name in the talk box is spelled differently, for this one talk
  moved:   {cls:1,days:2,cd:0,   ev:'room'},  // a chair in your cabin has its back to the table, a little out from it
  wake:    {cls:1,days:4,cd:0,   ev:'morning'},  // you wake facing the wall
  dry:     {cls:2,days:2,cd:0,   frame:1},  // a square you watered looks dry when you come back to it
  regrown: {cls:2,days:5,cd:0,   ev:'morning'},  // a crop you picked yesterday is standing again in the morning
  thanks:  {cls:2,days:2,cd:0,   ev:'talk'},  // someone thanks you for something you never did
  lookpast:{cls:2,days:1,cd:0,   ev:'talk'},  // while they talk, they look past you, at something beside you
  shop:    {cls:2,days:5,cd:0,   ev:'shop'},  // a shop has one thing on the shelf you've never seen; tomorrow it's gone
  calendar:{cls:2,days:4,cd:0,   ev:'cal'},  // a note in your hand on a day that hasn't come yet
  crow:    {cls:2,days:1,cd:0,   frame:1}};  // a crow lands where you were standing a moment ago, and watches you
const EVP={bag:.5,journal:.6,talk:.3,room:.5,morning:.6,shop:.5,cal:.6};
const NAMES=Object.keys(FX);
function ready(){return !!X.rec&&X.rec.gap<=0;}
function allowed(n){const f=FX[n],r=X.rec;if(!f||!r||!on())return false;if(X.force===n)return true;if(!ready())return false;
  const sub=mode()==='subtle';if(f.cls>1&&(sub||k373()<.35))return false;
  const l=r.last[n];if(l){if(f.days&&S.day-l.d<f.days)return false;if(f.cd&&r.play-l.t<f.cd*(sub?1.6:1))return false;}return true;}
function gapNext(){const k=k373();return lerpR(420,150,k)*(mode()==='subtle'?2.2:1)*(.75+R()*.5);}
function fired(n){const r=X.rec;r.last[n]={d:S.day,t:Math.round(r.play)};r.gap=gapNext();if(X.force===n)X.force=null;X.log.push(n);if(X.log.length>40)X.log.shift();save();}
// an event: of the effects that wait for it, maybe one happens
function tryEv(ev,ctx){if(!on()||!X.rec)return null;const c=[];for(const n of NAMES){const f=FX[n];if(f.ev!==ev||!allowed(n))continue;let ok=true;try{ok=!COND[n]||COND[n](ctx);}catch(e){ok=false;}if(ok)c.push(n);}
  if(!c.length)return null;const forced=c.includes(X.force)?X.force:null;if(!forced&&R()>(EVP[ev]||.5))return null;const n=forced||pickR(c);
  let ok=false;try{ok=FIRE[n](ctx)!==false;}catch(e){ok=false;}if(ok)fired(n);else if(forced)X.force=null;return ok?n:null;}
// ---------------------------------------------------------------- when each is possible
const SHOP_V=['mae','hollis','peddler'];
const COND={
  steps:()=>!S.room&&(P.spd||0)>.6,
  hush:()=>typeof A!=='undefined'&&A.ok&&!!A.ctx&&!!A.b7Amb&&!(typeof HZ!=='undefined'&&HZ.silence>0)&&!S.room,
  clock:()=>!(M.clockT>0)&&!!ui.time,
  crow:()=>!S.room&&!night()&&!!crowSpot(),
  dry:()=>!!dryPick(),
  bag:()=>bagPick()>=0,
  journal:()=>true,
  calendar:()=>{try{return dayOfMonth()<=25;}catch(e){return false;}},
  name:ctx=>!!(ctx&&ctx.n&&ctx.n.def&&ctx.n.def.name&&spellOff(ctx.n.def.name)!==ctx.n.def.name),
  thanks:ctx=>!!(ctx&&ctx.txt&&ctx.txt.length<170&&!night()),
  lookpast:ctx=>!!(ctx&&ctx.n&&ctx.n.def&&ctx.n.def.id!=='mae'&&!night()),
  shop:ctx=>!!(ctx&&SHOP_V.includes(ctx.v)),
  moved:()=>!!movedPick(),
  wake:()=>!guest()&&!!S.room,
  regrown:()=>!!regrownPick()};
// ---------------------------------------------------------------- the words (plain, like the rest of the valley)
const THANKS=['Thanks again for last night. I don’t think I’d have found my way back on my own.','You were right, what you said yesterday. About the well. I went and looked.',
  'I kept the gate shut, like you asked.','Thank you for the eggs. You didn’t have to leave them on the step.','Did you get home all right? You left in such a hurry.',
  'I’ve been thinking about what you told me. I don’t think you’re right. I keep thinking about it, though.','You don’t have to keep checking on me. But thank you.','Same time tomorrow, then. Like you said.'];
const SHOP_ODD=[{name:'Door key, cut',desc:'A new key on a paper tag. The tag has your name on it, spelled right.'},
  {name:'Lamp oil, old label',desc:'The label they stopped printing years ago. “Still good,” it says, in pencil.'},
  {name:'Photograph',desc:'Your cabin, at night, from the edge of the field. The light is on.'},
  {name:'Seed packet, blank',desc:'Plain paper, folded twice, no name on it. Something small inside.'}];
const SHOP_WHY='Not for sale. It’s already paid for. It’s waiting to be picked up.';
const CAL_NOTES=['don’t open it','don’t answer it','stay in','leave the light on','count them first'];
const SWAPS=[['unlocked','locked'],['locked','unlocked'],['closed','open'],['open','closed'],['left','right'],['right','left'],['always','never'],['never','always'],
  ['before','after'],['after','before'],['first','last'],['last','first'],['inside','outside'],['outside','inside'],['under','over'],['empty','full'],['awake','asleep'],
  ['asleep','awake'],['nobody','somebody'],['once','twice'],['twice','once'],['three','four'],['dark','light'],['up','down'],['down','up']];
const EXTRA=[' I checked it twice.',' I didn’t tell anyone.',' It was the same again in the morning.',' I wrote this down so I’d remember.'];
// a name as someone might misspell it: a double letter made single, or a spelling the name could have had (Hale, Hail; Pike, Pyke).
// Titles are left alone, and a name with no likely misspelling (Tobias) is never touched
const SPELL=[[/([a-z])\1/,'$1'],[/ey$/,'y'],[/([^aeiouy])y$/,'$1ie'],[/oy/,'oi'],[/ale$/,'ail'],[/ane$/,'ain'],[/orne$/,'orn'],[/ance$/,'anse'],[/ow$/,'owe'],[/ike$/,'yke'],[/in$/,'yn'],[/is$/,'ys']];
function spellOff(name){const w=String(name).split(' ');const order=[w.length-1];for(let i=0;i<w.length-1;i++)order.push(i);
  for(const i of order){const s=w[i];if(s.length<3||/\./.test(s)||/^(Pastor|Sheriff|Doctor|Brother|Sister|Miss|Mr|Mrs)$/.test(s))continue;
    for(const [re,to] of SPELL){if(!re.test(s))continue;const t=s.replace(re,to);if(t!==s&&t.length>=3){w[i]=t;return w.join(' ');}}}
  return name;}
const DIRS={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]};
// ---------------------------------------------------------------- what each does
const FIRE={
  steps(){X.lateT=lerpR(2.6,4.4,k373());},
  hush(){const t=A.ctx.currentTime,m=SET7.vMaster,d=lerpR(.9,1.7,k373());
    for(const [b,v] of [[A.b7Amb,m*SET7.vAmb],[A.b7Music,m*SET7.vMusic]]){if(!b)continue;const g=b.gain;try{g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(0,t+.07);g.setValueAtTime(0,t+.07+d);g.linearRampToValueAtTime(v,t+.07+d+.6);}catch(e){}}},
  clock(){X.clk={ph:0,prev:fmtTime(S.hour),old:'',cur:'',t:0,wait:2};},
  crow(){const s=crowSpot();if(!s)return false;X.crow={x:s[0],z:s[1],h:72,st:'fly',t:0,dir:P.x>s[0]?1:-1,ph:R()*6,kind:'crow',vx:0,vz:0,off:0,life:0,gone:0};},
  dry(){const t=dryPick();if(!t)return false;X.rec.act.dry={day:S.day,i:tiles.indexOf(t),seen:0};},
  bag(){const i=bagPick();if(i<0)return false;const c=document.querySelector(`#invGrid .is[data-i="${i}"] b`);if(!c)return false;const n=+c.textContent;if(!(n>=3))return false;c.textContent=String(n-1);},
  journal(){return journalTwist();},
  calendar(){return calNote();},
  name(ctx){const el=$('talkName');if(!el)return false;const nm=spellOff(ctx.n.def.name);el.textContent=nm;X.nameSw={n:ctx.n,name:nm};nameCap();},
  thanks(ctx){const box=$('talkLine');if(!box)return false;const esc=t=>t.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
    box.innerHTML=`<q>${pickR(THANKS)} ${esc(ctx.txt)}</q>`;   // said first, then whatever they were going to say anyway, so nothing they tell you is lost
   try{if(typeof u37Type==='function')u37Type(ctx.n.def.id,false);}catch(e){}},
  lookpast(ctx){const n=ctx.n;const f=dirOf(P.x-n.x,P.z-n.z);const d=f==='E'||f==='W'?'S':(P.x>=n.x?'W':'E');X.look={n,t0:performance.now(),dir:d};},
  shop(ctx){const r=X.rec;r.act.shop={day:S.day,v:ctx.v,i:(r.shopN++)%SHOP_ODD.length};},
  moved(){const o=movedPick();if(!o)return false;X.rec.act.moved={day:S.day,room:S.room,spr:o.spr,x:+o.x.toFixed(2),z:+o.z.toFixed(2)};bindMoved();if(!X.mv)return false;},
  wake(){const d=pickR(['N','N','E','W']);P.dir=d;P.fx=DIRS[d][0];P.fz=DIRS[d][1];},
  regrown(){const p=regrownPick();if(!p)return false;X.rec.act.regrown={day:S.day,i:p[0],crop:p[1],seen:0};X.rec.harv=null;X.rcrop=null;}};
// ---------------------------------------------------------------- the pickers
function crowSpot(){if(X.ringN<10)return null;
  for(let back=5;back<10;back++){const j=(X.ringN-1-back)%16;const x=X.ringX[j],z=X.ringZ[j];const d=Math.hypot(P.x-x,P.z-z);if(d<2.2||d>7||!onScr(x,z,36))continue;
    try{if(terr(x,z)==='water')continue;}catch(e){}return [x,z];}return null;}
function dryPick(){if(!tiles||!tiles.length)return null;let near=false;const c=[];
  for(const t of tiles){const wet=!!((t.crop&&t.crop.watered)||t.wet);if(!wet)continue;if(!S.room&&Math.hypot(P.x-t.x,P.z-t.z)<12)near=true;c.push(t);}
  if(near||!c.length)return null;const wc=c.filter(t=>t.crop);return pickR(wc.length?wc:c);}
function bagPick(){const G=$('invGrid');if(!G)return -1;const c=[],top=[];for(const el of G.querySelectorAll('.is b')){const n=+el.textContent;if(!(n>=3))continue;const i=+el.parentNode.dataset.i;(i>=12?c:top).push(i);}
  const a=c.length?c:top;return a.length?pickR(a):-1;}   // (deeper in the bag first, away from the toolbar)
function roomRect(){const Rm=S.room&&ROOMS[S.room];return Rm?[Rm.ox,Rm.oz,Rm.ox+(Rm.w||12),Rm.oz+(Rm.d||8)]:null;}
function movedPick(){const rr=roomRect();if(!rr||!/^(cabin|fcab)/.test(S.room))return null;if(!S.first||!S.first['room_'+S.room])return null;const c=[];
  for(const o of OBJ){if(o.hide||o.kind!=='furn'||o.x<rr[0]||o.x>rr[2]||o.z<rr[1]||o.z>rr[3])continue;if(/^(in_chair|in_rock|in_stool|t_mug)/.test(o.spr)||(o.furnKey&&/chair|pumpkin|crates|lamp/.test(o.furnKey)))c.push(o);}
  const ch=c.filter(o=>/chair|rock/.test(o.spr));return c.length?pickR(ch.length?ch:c):null;}
function regrownPick(){const h=X.rec&&X.rec.harv;if(!h||h.day!==S.day-1||!Array.isArray(h.list))return null;const c=[];
  for(const e of h.list){if(!Array.isArray(e))continue;const [i,crop]=e;const t=tiles[i];if(!t||t.crop||!crop||!crop.type||!SPR[crop.type+'_'+crop.stage])continue;c.push([i,crop]);}return c.length?pickR(c):null;}
// ---------------------------------------------------------------- the journal and the calendar
function journalTwist(){const el=$('noteText');if(!el||(typeof JTAB!=='undefined'&&JTAB!=='notes'))return false;const h4=[...el.querySelectorAll('h4')].find(h=>/What you know/i.test(h.textContent));if(!h4)return false;
  const ps=[];let p=h4.nextElementSibling;while(p&&p.tagName==='P'){ps.push(p);p=p.nextElementSibling;}
  const seen=Math.min(ps.length,Math.max(0,X.rec.loreSeen));if(seen<1)return false;
  const order=ps.slice(0,seen).filter(q=>!q.children.length).sort(()=>R()-.5);
  for(const q of order){const s=q.textContent;for(const [a,b] of SWAPS.slice().sort(()=>R()-.5)){const m=s.match(new RegExp('\\b'+a+'\\b','i'));if(!m)continue;
      const rep=m[0][0]!==m[0][0].toLowerCase()?b[0].toUpperCase()+b.slice(1):b;q.textContent=s.slice(0,m.index)+rep+s.slice(m.index+m[0].length);return true;}}
  const q=order.find(q=>/[.!?]$/.test(q.textContent.trim()));if(!q)return false;q.textContent=q.textContent.trim()+pickR(EXTRA);return true;}
function calNote(){const B=$('bagBody');if(!B)return false;const grid=[...B.children].find(d=>d.style&&/grid/.test(d.style.display));if(!grid)return false;
  const d=Math.min(28,dayOfMonth()+2+((R()*4)|0));const cell=grid.children[6+d];if(!cell)return false;
  const n=document.createElement('div');n.className='d373n';n.textContent=CAL_NOTES[(X.rec.calN++)%CAL_NOTES.length];cell.appendChild(n);return true;}
{const st=document.createElement('style');st.textContent='#bagBody .d373n{line-height:1.15;margin-top:3px;color:#d6ccb4;font-style:italic;font-size:11px;transform:rotate(-3deg);transform-origin:0 50%}';document.head.appendChild(st);}
// ---------------------------------------------------------------- the hooks
// the bag: one stack, one fewer, until anything in it is touched (the grid repaints from the real numbers)
{const _ri=renderItems;renderItems=function(){const r=_ri.apply(this,arguments);try{tryEv('bag');}catch(e){}return r;};}
// the journal: remember how much of it you've read, so only what you've already seen ever changes
{const _oj=openJournal;openJournal=function(){const r=_oj.apply(this,arguments);try{if(X.rec&&(typeof JTAB==='undefined'||JTAB==='notes')){tryEv('journal');X.rec.loreSeen=(S.lore||[]).filter(l=>!String(l).endsWith('|')).length;X.dirty=true;}}catch(e){}return r;};}
{const _rc=renderCalendar;renderCalendar=function(){const r=_rc.apply(this,arguments);try{tryEv('cal');}catch(e){}return r;};}
// talking: one thing per talk at most; what they were going to say is never taken away
{const _t=talk;talk=function(n){X.nameSw=null;const r=_t.apply(this,arguments);try{X.look=null;if(!on()||!n||!n.def||$('talk').hidden||!X.rec)return r;
    tryEv('talk',{n,txt:($('talkLine').textContent||'').trim()});}catch(e){}return r;};}
// the name under the portrait is spelled the same way, for that talk (the portrait draws its caption a moment after the talk opens)
function nameCap(){const w=X.nameSw;if(!w||$('talk').hidden||(typeof talkWho!=='undefined'&&talkWho!==w.n))return;const el=document.querySelector('#talkPortrait .nm');if(!el)return;
  const p=w.name.split(' ');const cap=/^(Pastor|Sheriff|Dr.?|Doctor|Brother|Sister|Mr.?|Mrs.?|Miss|Old|Aunt|Uncle|Nurse)$/i.test(p[0])&&p[1]?p[1]:p[0];if(el.textContent!==cap)el.textContent=cap;}
if(typeof talkFace==='function'){const _tf=talkFace;talkFace=function(){const r=_tf.apply(this,arguments);try{nameCap();}catch(e){}return r;};for(const k of Object.keys(_tf))talkFace[k]=_tf[k];}
// the shops: the odd thing goes on the shelf before the shop draws itself; it can't be bought
for(const v of SHOP_V){const V=typeof vendors!=='undefined'&&vendors[v];if(!V||typeof V.rows!=='function')continue;const _rows=V.rows;
  V.rows=function(){const rows=_rows.apply(this,arguments);try{const a=X.rec&&on()&&X.rec.act.shop;if(a&&a.day===S.day&&a.v===v&&Array.isArray(rows)){const o=SHOP_ODD[a.i%SHOP_ODD.length];
      rows.push({k:'d373_odd',name:o.name,desc:o.desc,price:0,can:false,why:SHOP_WHY,buy(){}});}}catch(e){}return rows;};}
// its button says it's put by, not that it's free
{const _rs=renderShop;renderShop=function(){const r=_rs.apply(this,arguments);try{const a=X.rec&&X.rec.act.shop;if(a&&a.day===S.day&&on()){const nm=SHOP_ODD[a.i%SHOP_ODD.length].name;
    for(const el of $('shopRows').children){const st=el.querySelector('strong');if(!st||st.textContent!==nm)continue;const b=el.querySelector('button');if(b&&b.textContent!=='Put by')b.textContent='Put by';}}}catch(e){}return r;};}
{const _os=openShop;openShop=function(v){try{const a=X.rec&&X.rec.act.shop;if(!(a&&a.day===S.day))tryEv('shop',{v});}catch(e){}return _os.apply(this,arguments);};}
// a morning: a crop standing again, or you facing the wall (a farmhand's mornings come from the host, so not there)
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{if(X.rec&&!guest()){dayTurn();tryEv('morning');}}catch(e){}return r;};}
// your footsteps, late
if(typeof SFX!=='undefined'&&typeof SFX.step==='function'){const _st=SFX.step;SFX.step=function(){if(X.lateT>0&&on()){const a=arguments,lag=lerpR(120,190,k373());setTimeout(()=>{try{_st.apply(SFX,a);}catch(e){}},lag);return;}return _st.apply(this,arguments);};}
// the clock: written only when it differs
function clockShow(){const c=X.clk;if(!c||c.ph!==2||!ui.time)return;if(ui.time.textContent!==c.old)ui.time.textContent=c.old;}
{const _uh=updateHud;updateHud=function(){const r=_uh.apply(this,arguments);try{clockShow();}catch(e){}return r;};}
// ---------------------------------------------------------------- drawn things: made inside one render, put back before it returns
const SV={on:0,mo:null,mx:0,mz:0,mf:false,dt:null,dw:false,dcw:false,rt:null,rc:null,ln:null,ld:''};
function bindMoved(){const a=X.rec&&X.rec.act.moved;X.mv=null;if(!a)return;const o=OBJ.find(q=>!q.hide&&q.spr===a.spr&&Math.abs(q.x-a.x)<.02&&Math.abs(q.z-a.z)<.02);if(!o)return;
  // a chair turns its back on the table and comes a little out from it; a mug is at the other end of the table
  let dx=.3;const tb=OBJ.find(q=>!q.hide&&q.spr==='in_table'&&Math.abs(q.z-o.z)<1.2&&Math.abs(q.x-o.x)<2.4);if(tb)dx=(o.x>=tb.x?1:-1)*(/^t_mug/.test(o.spr)?-.42:.26);
  X.mv={o,dx,dz:/chair|rock/.test(o.spr)?.12:0,flip:/chair|rock/.test(o.spr),room:a.room};}
function drawOn(){SV.on=0;if(!on()||S.mode==='title')return;const a=X.rec&&X.rec.act;
  if(X.mv&&S.room===X.mv.room){const o=X.mv.o;SV.mo=o;SV.mx=o.x;SV.mz=o.z;SV.mf=o.flip;o.x+=X.mv.dx;o.z+=X.mv.dz;if(X.mv.flip)o.flip=!o.flip;SV.on|=1;}
  if(a&&a.dry&&a.dry.day===S.day){const t=tiles[a.dry.i];if(t){SV.dt=t;SV.dw=t.wet;SV.dcw=!!(t.crop&&t.crop.watered);t.wet=false;if(t.crop)t.crop.watered=false;SV.on|=2;}}
  if(a&&a.regrown&&a.regrown.day===S.day){const t=tiles[a.regrown.i];if(t&&!t.crop){SV.rt=t;SV.rc=X.rcrop||(X.rcrop=Object.assign({},a.regrown.crop,{pop:1,watered:false}));t.crop=SV.rc;SV.on|=4;}}
  if(X.look&&talkingTo===X.look.n){const e=performance.now()-X.look.t0;if(e>1300&&e<3700){const n=X.look.n;SV.ln=n;SV.ld=n.dir;n.dir=X.look.dir;SV.on|=8;}}}
function drawOff(){const f=SV.on;SV.on=0;if(f&8){SV.ln.dir=SV.ld;SV.ln=null;}if(f&4){if(SV.rt.crop===SV.rc)SV.rt.crop=null;SV.rt=null;}
  if(f&2){SV.dt.wet=SV.dw;if(SV.dt.crop)SV.dt.crop.watered=SV.dcw;SV.dt=null;}if(f&1){const o=SV.mo;o.x=SV.mx;o.z=SV.mz;o.flip=SV.mf;SV.mo=null;}}
const anyDrawn=()=>!!(X.mv||X.look||(X.rec&&(X.rec.act.dry||X.rec.act.regrown)));
{const _r=render;render=function(){if(!anyDrawn())return _r.apply(this,arguments);drawOn();try{return _r.apply(this,arguments);}finally{drawOff();}};}
// insurance: should anything ever save in the middle of a frame, it saves the real farm
if(typeof saveData==='function'){const _sd=saveData;saveData=function(){if(!SV.on)return _sd.apply(this,arguments);drawOff();try{return _sd.apply(this,arguments);}finally{drawOn();}};}
// the crow, drawn as the valley's own crows are (ambient.js)
const CROW_D={z:0,mind:1,draw(){const b=X.crow;if(b&&typeof ambBird==='function')ambBird(b,Math.round(sx(b.x)),Math.round(sz(b.z)));}};
{const _ld=lifeDrawables;lifeDrawables=function(D,t){const r=_ld.apply(this,arguments);if(X.crow&&!S.room&&on()){CROW_D.z=X.crow.z;D.push(CROW_D);}return r;};}
// ---------------------------------------------------------------- every frame
function crowTick(dt){const b=X.crow;if(!b)return;b.t+=dt;b.life+=dt;if(S.room){X.crow=null;return;}const d=Math.hypot(P.x-b.x,P.z-b.z);
  if(b.gone){b.h=Math.min(80,b.h+dt*40);b.x+=b.vx*dt;b.z+=b.vz*dt;if(b.t>1.8)X.crow=null;return;}
  if(b.st==='fly'){b.h=Math.max(0,b.h-dt*62);if(b.h<=0){b.st='peck';b.t=0;try{A.hiss&&A.hiss(.18,.02,'lowpass',700,{});}catch(e){}}return;}
  b.dir=P.x>b.x?1:-1;   // it watches you
  if(!onScr(b.x,b.z,0))b.off+=dt;else b.off=0;
  if(d<1.7||b.life>45){b.gone=1;b.st='fly';b.t=0;b.vx=(b.x-P.x)/(d||1)*3+(R()-.5);b.vz=(b.z-P.z)/(d||1)*2;b.dir=b.vx>=0?1:-1;return;}
  if(b.off>2)X.crow=null;}
function clockTick(dt){const c=X.clk;if(!c)return;if(M.clockT>0||!inPlay()){X.clk=null;return;}const now=fmtTime(S.hour);c.t+=dt;
  if(c.ph===0){if(now!==c.prev){c.old=c.prev;c.nw=now;c.ph=1;c.t=0;c.wait=lerpR(1.4,3,R());}else if(c.t>240)X.clk=null;return;}
  if(c.ph===1){if(now!==c.nw){X.clk=null;return;}if(c.t>=c.wait){c.ph=2;c.t=0;c.cur=now;clockShow();}return;}
  if(now!==c.cur||c.t>25){X.clk=null;if(ui.time.textContent!==now)ui.time.textContent=now;}else clockShow();}
// it goes back when you look away (a door, a menu, off the screen), when you reach for it, or when you stand on it
function seenTick(dt,a,key,x,z,blink){const vis=!S.room&&onScr(x,z,20);
  if(vis)a.seen=(a.seen||0)+dt;else if(a.seen>1)a.gone=(a.gone||0)+dt;
  const near=S.room?99:Math.hypot(P.x-x,P.z-z);
  if((a.seen>1&&(blink||a.gone>1))||(P.anim&&near<2)||near<.8||a.seen>90){delete X.rec.act[key];if(key==='regrown')X.rcrop=null;X.dirty=true;}}
// what you picked today (only whole crops, ripe), so one can stand there again tomorrow morning
function harvestTick(){const L=X.lastCrop;for(let i=0;i<tiles.length;i++){const t=tiles[i],c=t.crop;
    if(c){L[i]=c.stage>=3?c:null;continue;}
    const was=L[i];if(!was)continue;L[i]=null;if(!t.tilled)continue;
    const h=X.rec.harv&&X.rec.harv.day===S.day?X.rec.harv:(X.rec.harv={day:S.day,list:[]});
    if(h.list.length<12&&!h.list.some(e=>e[0]===i)){h.list.push([i,{type:was.type,stage:was.stage,growth:was.growth||0}]);X.dirty=true;}}}
function tick(dt){if(S.mode==='title'||S.mode==='load'||!S.day)return;if(!X.loaded)load();if(!on())return;const r=X.rec;
  if(r.day!==S.day)dayTurn();
  const play=inPlay()&&!S.paused;if(play){r.play+=dt;if(r.gap>0)r.gap-=dt;}
  // where you've been, a quarter-second apart (for the crow)
  if(S.room)X.ringN=0;else{X.ringT+=dt;if(X.ringT>=.25){X.ringT=0;const j=X.ringN%16;X.ringX[j]=P.x;X.ringZ[j]=P.z;X.ringN++;}}
  if(X.lateT>0)X.lateT-=dt;
  // a blink: a door, a menu, a talk
  const roomCh=S.room!==X.prevRoom,blink=roomCh||(S.paused&&!X.prevPaused);X.prevRoom=S.room;X.prevPaused=S.paused;
  if(roomCh&&X.mv&&S.room!==X.mv.room){X.mv=null;delete r.act.moved;X.dirty=true;}
  if(roomCh&&S.room){try{tryEv('room');}catch(e){}}
  if(X.look&&talkingTo!==X.look.n)X.look=null;
  const a=r.act;
  if(a.dry){const t=tiles[a.dry.i];if(!t||!((t.crop&&t.crop.watered)||t.wet)||a.dry.day!==S.day){delete a.dry;X.dirty=true;}else seenTick(dt,a.dry,'dry',t.x,t.z,blink);}
  if(a.regrown){const t=tiles[a.regrown.i];if(!t||t.crop||a.regrown.day!==S.day){delete a.regrown;X.rcrop=null;X.dirty=true;}else seenTick(dt,a.regrown,'regrown',t.x,t.z,blink);}
  crowTick(dt);clockTick(dt);
  X.harvT+=dt;if(X.harvT>1){X.harvT=0;harvestTick();}
  // the frame effects: when it's time, now and then one of them
  if(play){X.pollT-=dt;if(X.pollT<=0){X.pollT=3;const forced=X.force&&FX[X.force]&&FX[X.force].frame?X.force:null;if(forced||ready()){const c=[];
      for(const n of NAMES){if(!FX[n].frame||!allowed(n))continue;let ok=false;try{ok=COND[n]();}catch(e){}if(ok)c.push(n);}
      const pick=c.includes(forced)?forced:(c.length&&R()<.35?pickR(c):null);if(pick){let ok=false;try{ok=FIRE[pick]()!==false;}catch(e){}if(ok)fired(pick);}}}}
  X.saveT+=dt;if(X.dirty&&X.saveT>2){X.saveT=0;save();}else if(X.saveT>60){X.saveT=0;save();}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{tick(dt);}catch(e){}return r;};}
function clearAll(){X.lateT=0;X.crow=null;X.look=null;X.mv=null;X.rcrop=null;X.force=null;
  if(X.clk){X.clk=null;try{const now=fmtTime(S.hour);if(ui.time.textContent!==now)ui.time.textContent=now;}catch(e){}}
  if(X.rec){X.rec.act={};save();}}
// ---------------------------------------------------------------- for the tests
window.__doubt={list:NAMES.slice(),
  force(n){if(!FX[n])return 'unknown';if(!on())return 'off';if(S.mode==='title')return 'not in play';if(!X.loaded)load();X.force=n;
    if(FX[n].frame){if(n==='crow'&&!crowSpot()){X.ringN=0;for(let i=0;i<12;i++){const j=X.ringN%16;X.ringX[j]=P.x-P.fx*3.2;X.ringZ[j]=P.z-P.fz*3.2+.5;X.ringN++;}}
      let ok=false;try{ok=COND[n]()&&FIRE[n]()!==false;}catch(e){X.force=null;return 'error '+e.message;}if(ok){fired(n);return 'fired';}X.force=null;return 'not possible here';}
    if(n==='regrown'){const t=tiles.find(t=>t.tilled&&!t.crop);if(!t)return 'needs an empty tilled square';X.rec.harv={day:S.day-1,list:[[tiles.indexOf(t),{type:'turnip',stage:3,growth:99}]]};}
    return 'armed';},
  active(){const o=[];if(!X.rec)return o;for(const k in X.rec.act)o.push(k);if(X.mv&&!o.includes('moved'))o.push('moved');if(X.crow)o.push('crow');if(X.clk)o.push('clock');if(X.lateT>0)o.push('steps');if(X.look)o.push('lookpast');return o;},
  state(){return JSON.parse(JSON.stringify(X.rec||null));},log(){return X.log.slice();},
  morning(){return tryEv('morning');},room(){return tryEv('room');},
  clear(){clearAll();},mode,k:()=>k373(),drawnNow:()=>SV.on,allowed:n=>allowed(n)};
}
