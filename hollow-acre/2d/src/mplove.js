/* ================= #226 marrying another player. In a world for friends you can ask another player to marry you the way
   you'd ask anyone in town: in person, with a Marrow ring. They get a real choice (yes, or not yet). The wedding is three
   days later in the town square, like the town's own weddings, and that morning everyone on the farm hears about it.
   Then you move in together: a farmhand who marries the host moves into Grandpa's cabin; two farmhands share the cabin
   of the one who asked, and the other cabin is swept and left empty for whoever comes next. ====================== */
const ML={asking:null};
const mlMe=()=>NAME()||'Farmhand';
function mlCouples(){return (S.world&&S.world.couples)||[];}
function mlOf(n){return mlCouples().find(c=>c.a===n||c.b===n)||null;}
const mlPartner=(c,n)=>c?(c.a===n?c.b:c.a):'';
function mlNpcMarried(){return Object.values(S.rom||{}).some(r=>r&&(r.married||r.wedding));}
// where someone lives now: 'cabin' (Grandpa's) or a farmhand cabin's number
function homeOf(n){const w=S.world||{};if(w.homes&&w.homes[n]!==undefined)return w.homes[n];if(w.slots&&Number.isInteger(w.slots[n]))return w.slots[n];return HOST.role==='guest'||n!==mlMe()?undefined:'cabin';}
mySlot=function(){const h=homeOf(mlMe());return Number.isInteger(h)?h:-1;};
fhOwner=function(i){const w=S.world||{};const who=new Set();for(const [n,k] of Object.entries(w.slots||{}))if(k===i)who.add(n);for(const [n,k] of Object.entries(w.homes||{}))if(k===i)who.add(n);return [...who].join(' & ');};
// waking up at home: Grandpa's cabin for anyone who married the host
{const _gh=mpGoHome;mpGoHome=function(inside){const h=homeOf(mlMe());
  if(h==='cabin'&&HOST.role==='guest'){const R=ROOMS.cabin;if(inside&&R&&R.w){S.room='cabin';P.x=R.ox+2.3;P.z=R.oz+2.9;P.dir='S';P.fx=0;P.fz=1;}else{S.room=null;P.x=doorPos.x;P.z=doorPos.z+1.1;P.dir='S';P.fx=0;P.fz=1;}return;}
  return _gh.apply(this,arguments);};}
// a farmhand who already lives with someone doesn't need a cabin of their own when they come back
{const _sf=mpSlotFor;mpSlotFor=function(n){const w=S.world;if(w&&w.homes&&w.homes[n]!==undefined)return w.homes[n]==='cabin'?99:w.homes[n];return _sf.apply(this,arguments);};}
// ---- asking
function mlCanAsk(p){const q=p.presence,n=clean(q.n);if(!mpOn())return 'Only in a world made for friends.';
  if(mlOf(mlMe())||mlNpcMarried())return mlOf(mlMe())?'You’re already spoken for.':'You’re already spoken for, in town.';
  if(mlOf(n))return `${n} is already spoken for.`;
  if(inv('ring')<1)return 'You’d need a Marrow ring (Feed & Stock, or the market stall).';
  if((q.r||'')!==(S.room||'')||Math.hypot(q.x-P.x,q.z-P.z)>3.5)return 'Ask in person: walk up to them first.';return '';}
function mlAsk(p){const why=mlCanAsk(p);if(why){toast(why,2.6);return;}const n=clean(p.presence.n);ML.asking=n;
  CO.room.emit('mlprop',{from:mlMe(),to:n},p.peer);$('bag').hidden=true;S.paused=false;
  toast(`You go down on one knee in front of ${n} and hold out the ring.`,3.4);}
function mlRecord(a,b){if(HOST.role==='guest')return;const w=S.world;w.couples=w.couples||[];if(mlOf(a)||mlOf(b))return;
  w.couples.push({a,b,asked:S.day,wed:S.day+3,married:0});mpBroadcastWorld();}
function mpBroadcastWorld(){try{if(HOST.role==='host'&&CO.room&&CO.room.emit)CO.room.emit('mpw',{world:mpWorldOut()});}catch(e){}}
function mlAnswer(from,yes,peer){const me=mlMe();$('note').hidden=true;S.paused=false;
  try{CO.room.emit(yes?'mlyes':'mlno',{from,to:me});}catch(e){}
  if(yes){mlRecord(from,me);toast(`You said yes. The wedding is in three days, day ${S.day+3}, in the town square at ten.`,4.4);addLore&&addLore(`${from} asked you to marry them, and you said yes.`);}
  else toast(`You close ${from}’s hand back around the ring. Not yet.`,3);}
// ---- the wedding morning: the town gathers at ten
function mlWedTick(){if(!mpOn()||HOST.role==='guest'||S.mode!=='play')return;for(const c of mlCouples()){if(c.married||S.day<c.wed||S.hour<10)continue;
  c.married=S.day;mlMoveIn(c);mpBroadcastWorld();try{CO.room&&CO.room.emit&&CO.room.emit('mlwed',{a:c.a,b:c.b});}catch(e){}mlWedSeen(c);}}
function mlMoveIn(c){const w=S.world;if(w.cabins!=='own')return;w.homes=w.homes||{};const host=(HOST.role==='host'||!HOST.role)?mlMe():HOST.hostName;
  if(c.a===host||c.b===host){const fh=c.a===host?c.b:c.a;w.homes[fh]='cabin';if(w.slots)delete w.slots[fh];return;}
  const ha=homeOf(c.a),hb=homeOf(c.b);const keep=Number.isInteger(ha)?ha:hb;const mover=keep===ha?c.b:c.a;w.homes[mover]=keep;w.homes[keep===ha?c.a:c.b]=keep;if(w.slots)delete w.slots[mover];}
function mlWedSeen(c){const me=mlMe();const k='hollowWed:'+((S.world&&S.world.code)||'')+':'+c.a+'&'+c.b+':'+me;try{if(localStorage.getItem(k))return;localStorage.setItem(k,'1');}catch(e){}
  if(c.a!==me&&c.b!==me){toast(`${c.a} and ${c.b} were married in the town square this morning.`,4.2);return;}
  const other=mlPartner(c,me);
  openNote(`<p class="date">The town square, day ${c.married||S.day}, ten in the morning</p><p>The whole town is in the square. Everyone. Even Dunn, at the back, hat in his hands.</p>
    <p>Hale reads the words. For once he doesn’t read a name off a slip. He reads yours, and then ${other}’s, and nobody claps politely: they cheer.</p>
    <p>${other} holds your hands so hard your knuckles go white. Ida plays the organ out of the church’s open doors, badly, wonderfully. For one morning the valley forgets to be afraid.</p>
    <p><b>You’re married to ${other}.</b> ${S.world&&S.world.cabins==='own'?'You’ll live under one roof from tonight.':''}</p>`,'Go home together',()=>{try{mpGoHome(false);}catch(e){}});
  addLore&&addLore(`You married ${other} in the town square.`);if(typeof journalNote==='function')journalNote(`Married ${other}.`);}
{const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{mlWedTick();}catch(e){}};}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;const on=(t,f)=>HOST.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m);}catch(e){}}));
  on('mlprop',m=>{const d=m.data||{};if(clean(d.to)!==mlMe())return;const from=clean(d.from);
    if(mlOf(mlMe())||mlNpcMarried()){r.emit('mlno',{from,to:mlMe(),busy:1},m.peer);return;}
    openNote(`<p class="date">Out on the farm</p><p><b>${from}</b> goes down on one knee in the dirt and holds out a Marrow ring: old iron, a red stone, the kind the valley has always married with.</p>
      <p><q>Marry me. Here. Whatever this place is.</q></p><p style="margin-top:12px;display:flex;gap:10px"><button class="btn" id="mlYes">Yes</button><button class="btn" id="mlNo">Not yet</button></p>`,'Say nothing',()=>{});
    $('mlYes').onclick=()=>mlAnswer(from,true,m.peer);$('mlNo').onclick=()=>mlAnswer(from,false,m.peer);});
  on('mlyes',m=>{const d=m.data||{};const from=clean(d.from),to=clean(d.to);mlRecord(from,to);
    if(from===mlMe()){if(inv('ring')>0)takeInv('ring',1);ML.asking=null;toast(`${to} said yes. The wedding is in three days, day ${S.day+3}, in the town square at ten.`,4.6);addLore&&addLore(`${to} said yes.`);}});
  on('mlno',m=>{const d=m.data||{};if(clean(d.from)!==mlMe())return;ML.asking=null;toast(d.busy?`${clean(d.to)} is already spoken for.`:`${clean(d.to)} closes your hand back around the ring. Not yet.`,3.2);});
  on('mlwed',m=>{const d=m.data||{};const c=mlCouples().find(q=>q.a===clean(d.a)&&q.b===clean(d.b))||{a:clean(d.a),b:clean(d.b),married:S.day};setTimeout(()=>mlWedSeen(c),900);});
  return r0;};}
// ---- the Together tab: each other player, with Ask (or why not), and who you're engaged or married to
{const _rc=renderCoop;renderCoop=function(){_rc();if(!mpOn())return;const B=$('bagBody');if(!B)return;const me=mlMe();const c=mlOf(me);
  const box=document.createElement('div');box.style.cssText='margin-top:12px;padding:8px 10px;background:rgba(0,0,0,.18)';
  let h=`<b>Hearts</b>`;if(c)h+=`<p class="jsub" style="font-size:12px;margin:4px 0">${c.married?`Married to ${mlPartner(c,me)}.`:`Engaged to ${mlPartner(c,me)}. The wedding is on day ${c.wed}, in the square at ten.`}</p>`;
  const os=others();if(!os.length)h+=`<p class="jsub" style="font-size:12px;margin:4px 0">Nobody else is on the farm right now.</p>`;
  os.forEach((p,i)=>{const n=clean(p.presence.n);const pc=mlOf(n);const why=mlCanAsk(p);
    h+=`<div style="display:flex;align-items:center;gap:8px;margin-top:6px"><span style="flex:1">${n}${pc?` <small style="opacity:.7">${pc.married?'married':'engaged'}${mlPartner(pc,n)===me?' to you':''}</small>`:''}</span>${pc?'':why?`<small style="opacity:.65;max-width:58%;text-align:right">${why}</small>`:`<button class="btn" data-ml="${i}">Propose</button>`}</div>`;});
  box.innerHTML=h;B.appendChild(box);box.querySelectorAll('button[data-ml]').forEach(b=>b.onclick=()=>mlAsk(os[+b.dataset.ml]));};}
// on the wedding morning a player who wasn't there still hears about it when they next come in
{const _as=applySnap;applySnap=function(){const r=_as.apply(this,arguments);try{for(const c of mlCouples())if(c.married)setTimeout(()=>mlWedSeen(c),1200);}catch(e){}return r;};}
