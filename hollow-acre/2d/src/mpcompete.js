/* ================= #225 against each other: a market that behaves like a real one. In a world played against each other
   every unit anyone sells pushes that thing's price down, and it only recovers a little each night: whoever gets their
   pumpkins on the truck first gets the good price, and whoever floods the market ruins it for everybody (themselves too).
   The bin sells in the order things went into it. Buyers in town post contracts on the Grange board (Coyle's wants eight
   pumpkins by Thursday, Hartley wants forty planks of wood): the first to deliver gets paid, everyone else gets nothing.
   Two farms off the edge of the map play the same market: the Vance orchard over in Wickham and the Dunn boys on Mill
   Road. They grow every day, hold their crops back when prices are poor, sell into them when they recover, and take
   contracts out from under you. Every seven days the Grange posts who sold the most; the top farm gets the purse. ======== */
const MK_K={turnip:14,pumpkin:10,egg:16,fish:12,mushroom:10,wood:34,stone:34,fiber:30,coal:20,copper:18,iron:14,copper_bar:10,iron_bar:8,gem:6};
const MK_BASE={turnip:6,pumpkin:18,egg:8,fish:14,mushroom:9,wood:2,stone:2,fiber:2,coal:5,copper:6,iron:9};
const MK_NAME={turnip:['turnip','turnips'],pumpkin:['pumpkin','pumpkins'],egg:['egg','eggs'],fish:['fish','fish'],mushroom:['mushroom','mushrooms'],
  wood:['wood','wood'],stone:['stone','stone'],fiber:['fiber','fiber'],coal:['coal','coal'],copper:['copper ore','copper ore'],iron:['iron ore','iron ore']};
const MK_PRODUCE=new Set(['turnip','pumpkin','egg','fish','mushroom']);
const MK_BUYERS=[['Coyle’s store',['turnip','pumpkin','egg']],['The Lamplighter',['fish','pumpkin','egg','turnip']],['Hartley Carpentry',['wood','stone','fiber']],['Pruitt’s garage',['stone','coal','copper','iron']]];
const MK_RIVALS=[{id:'vance',name:'Vance orchard',where:'over in Wickham',grows:{pumpkin:5,egg:6,wood:8},skill:.6},
                 {id:'dunn',name:'the Dunn boys',where:'out on Mill Road',grows:{turnip:9,fish:3,wood:14,stone:10},skill:.45}];
const mkOn=()=>mpOn()&&S.world.play==='compete';
function MK(){const w=S.world;if(!w.mk)w.mk={sat:{},prev:{},earn:{},week:Math.floor((S.day-1)/7),contracts:[],seq:0,
  rivals:MK_RIVALS.map(r=>({id:r.id,stock:{},held:{},earn:0,total:0})),last:''};return w.mk;}
const mkKey=e=>e.id==='fish'||e.kind==='fish'?'fish':(e.id||e.kind);
const mkWord=(k,n)=>{const w=MK_NAME[k]||[k,k];return n===1?w[0]:w[1];};
function mkMult(k){const s=(MK().sat[k]||0),K=MK_K[k]||15;return 1/(1+s/K);}
const mkPct=k=>Math.round(mkMult(k)*100);
function mkBase(k){return MK_BASE[k]||(SEEDS[k]&&SEEDS[k].sell)||(typeof sellPrice==='function'?sellPrice(k):0)||4;}
const mkRiv=id=>MK_RIVALS.find(r=>r.id===id);
// ---- the night: the truck takes the bins in the order they were filled, the rival farms sell or hold, buyers move on
function mkSell(k,n,price0){const mk=MK();let total=0;for(let i=0;i<n;i++){const p=Math.max(1,Math.round(price0*mkMult(k)));total+=p;mk.sat[k]=(mk.sat[k]||0)+1;}return total;}
function mkNight(){const mk=MK();mk.prev={};for(const k of Object.keys(MK_K))mk.prev[k]=mkMult(k);const me=NAME()||'Farmhand';
  // 1) the players' bin, first in first sold
  for(const e of S.ship||[]){const k=mkKey(e);if(e.base==null)e.base=e.value;const v=Math.max(1,Math.round(e.base*mkMult(k)));e.value=v;mk.sat[k]=(mk.sat[k]||0)+1;
    const by=e.by||me;mk.earn[by]=(mk.earn[by]||0)+v;}
  // 2) the rival farms bring in their harvest, and sell what's worth selling
  const wk=Math.floor((S.day-1)/7);
  for(const r of mk.rivals){const R=mkRiv(r.id);if(!R)continue;
    for(const [k,q0] of Object.entries(R.grows)){const q=Math.max(0,Math.round(q0*(1+wk*.22)*(.7+rand()*.6)));r.stock[k]=(r.stock[k]||0)+q;r.held[k]=(r.held[k]||0)+1;
      const want=.78-R.skill*.18;   // a sharper farm holds out for a better price, but nobody holds a crop forever
      if(mkMult(k)>=want||r.held[k]>=3){const n=Math.ceil(r.stock[k]*(r.held[k]>=3?1:.6));const got=mkSell(k,n,mkBase(k));r.stock[k]-=n;r.earn+=got;r.total+=got;r.held[k]=0;}}}
  // 3) the rivals go after the open contracts: the closer the deadline, the likelier one of them has already filled it
  for(const c of mk.contracts){if(c.taken)continue;for(const r of mk.rivals){const R=mkRiv(r.id);if(!R||!R.grows[c.k]||(r.stock[c.k]||0)<c.n)continue;
    const left=c.due-S.day;if(rand()<R.skill*(left<=1?.75:.35)){c.taken=R.name;c.by='rival';r.stock[c.k]-=c.n;r.earn+=c.pay;r.total+=c.pay;break;}}}
  // 4) prices recover a little overnight; old contracts lapse; new ones go up
  for(const k of Object.keys(mk.sat)){mk.sat[k]*=.7;if(mk.sat[k]<.2)delete mk.sat[k];}
  mk.contracts=mk.contracts.filter(c=>!(c.due<S.day+1&&!c.taken)&&!(c.taken&&c.day<S.day-1));
  mkPost();mkWeek();}
function mkPost(){const mk=MK();const open=mk.contracts.filter(c=>!c.taken).length;
  for(let i=open,tries=0;i<3&&tries<20;tries++){const [who,ks]=MK_BUYERS[Math.floor(rand()*MK_BUYERS.length)];const k=ks[Math.floor(rand()*ks.length)];
    if(mk.contracts.some(c=>!c.taken&&c.k===k))continue;i++;const prod=MK_PRODUCE.has(k);const n=prod?4+Math.floor(rand()*(k==='pumpkin'?5:9)):15+Math.floor(rand()*30);
    const pay=Math.round(mkBase(k)*n*(1.45+rand()*.45));mk.contracts.push({id:++mk.seq,who,k,n,pay,due:S.day+2+Math.floor(rand()*3),day:S.day,taken:''});}}
// every seventh morning the Grange posts the week's sales; the top farm takes the purse
function mkWeek(){const mk=MK();const wk=Math.floor((S.day-1)/7);if(wk<=mk.week)return;mk.week=wk;
  const rows=Object.entries(mk.earn).map(([n,v])=>({n,v,p:true})).concat(mk.rivals.map(r=>({n:mkRiv(r.id).name,v:r.earn,p:false})));rows.sort((a,b)=>b.v-a.v);
  const top=rows[0];mk.lastWeek=rows.slice(0,6).map(r=>[r.n,r.v,r.p]);mk.earn={};for(const r of mk.rivals)r.earn=0;
  if(!top||top.v<=0){mk.last='Nobody sold enough to be worth writing down this week.';return;}
  const purse=150+wk*50;
  if(top.p){mk.last=`${top.n} sold the most this week (${top.v} coins). The Grange purse, ${purse} coins, is theirs.`;mkPay(top.n,purse,mk.last);}
  else mk.last=`${top.n} sold the most this week (${top.v} coins). The Grange purse goes ${mkRiv(mk.rivals.find(r=>mkRiv(r.id).name===top.n).id).where}.`;
  mkNews(mk.last);}
function mkPay(n,total,msg){if(n===(NAME()||'Farmhand')){S.coins+=total;updateHud&&updateHud();return;}
  const peer=Object.keys(HOST.members||{}).find(k=>HOST.members[k]===n);
  if(peer&&CO.room&&CO.room.emit)CO.room.emit('mpay',{n,total,items:[],msg},peer);
  else{S.world.owed=S.world.owed||{};const o=S.world.owed[n]||(S.world.owed[n]={total:0,items:[],day:S.day});o.total+=total;}}
function mkNews(t){setTimeout(()=>toast(t,4.6),1600);try{if(CO.room&&CO.room.emit&&HOST.role==='host')CO.room.emit('mknews',{t});}catch(e){}}
{const _nd=newDay;newDay=function(m,p){try{if(mkOn()&&HOST.role!=='guest')mkNight();}catch(e){}return _nd.apply(this,arguments);};}
// ---- delivering a contract: at the Grange board. A farmhand's delivery is checked by the host so two people can't both win it.
function mkHave(k){return MK_PRODUCE.has(k)?S.basket.filter(b=>(b.kind==='fish'?'fish':b.kind)===k).length:inv(k);}
function mkTake(k,n){if(MK_PRODUCE.has(k)){for(let i=0;i<n;i++){const j=S.basket.findIndex(b=>(b.kind==='fish'?'fish':b.kind)===k);if(j<0)return false;S.basket.splice(j,1);}return true;}
  if(inv(k)<n)return false;takeInv(k,n);return true;}
function mkDeliver(id){const mk=MK();const c=mk.contracts.find(q=>q.id===id);if(!c||c.taken){toast('Too late: someone already filled that order.',2.4);mkOpen();return;}
  if(mkHave(c.k)<c.n){toast(`You need ${c.n} ${mkWord(c.k,c.n)}.`,2.2);return;}
  if(HOST.role==='guest'){CO.room&&CO.room.emit&&CO.room.emit('mkdel',{id,n:NAME()||'Farmhand'},HOST.hostPeer);toast('You hand the crate over…',1.6);return;}
  if(!mkTake(c.k,c.n))return;c.taken=NAME()||'Farmhand';c.by='player';c.day=S.day;S.coins+=c.pay;mk.earn[c.taken]=(mk.earn[c.taken]||0)+c.pay;
  SFX.coin&&SFX.coin();updateHud&&updateHud();toast(`${c.who} pays ${c.pay} coins. Nobody else gets that order.`,3);mkBroadcast();mkOpen();}
function mkBroadcast(){try{if(HOST.role==='host'&&CO.room&&CO.room.emit)CO.room.emit('mpw',{world:mpWorldOut()});}catch(e){}}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;const on=(t,f)=>HOST.off.push(r.on(t,m=>{if(!m||m.isMe)return;try{f(m);}catch(e){}}));
  on('mkdel',m=>{if(HOST.role!=='host'||!mkOn()||!m.data)return;const mk=MK();const c=mk.contracts.find(q=>q.id===(m.data.id|0));const n=clean(m.data.n);
    if(!c||c.taken){r.emit('mkno',{id:m.data.id|0,n,by:c?c.taken:''},m.peer);return;}
    c.taken=n;c.by='player';c.day=S.day;mk.earn[n]=(mk.earn[n]||0)+c.pay;r.emit('mkok',{id:c.id,n,k:c.k,cnt:c.n,pay:c.pay,who:c.who},m.peer);mkBroadcast();
    toast(`${n} filled ${c.who}’s order for ${c.n} ${mkWord(c.k,c.n)}.`,3);});
  on('mkok',m=>{if(HOST.role!=='guest'||!m.data||clean(m.data.n)!==(NAME()||'Farmhand'))return;const d=m.data;mkTake(d.k,d.cnt|0);S.coins+=Math.max(0,d.pay|0);updateHud&&updateHud();SFX.coin&&SFX.coin();
    toast(`${d.who} pays ${d.pay} coins. Nobody else gets that order.`,3);setTimeout(()=>{if(!$('note').hidden&&MKUI.open)mkOpen();},300);});
  on('mkno',m=>{if(HOST.role!=='guest'||!m.data||clean(m.data.n)!==(NAME()||'Farmhand'))return;toast(`Too late: ${m.data.by||'someone'} filled that order first.`,2.8);});
  on('mknews',m=>{if(HOST.role!=='guest'||!m.data)return;toast(String(m.data.t||'').slice(0,200),4.6);});
  return r0;};}
// ---- the Grange board in town (in a world played against each other)
const MKUI={open:false};
function mkHtml(where){const mk=MK();const me=NAME()||'Farmhand';const keys=['pumpkin','turnip','egg','fish','wood','stone','coal','copper'];
  const arrow=k=>{const a=mk.prev[k]==null?mkMult(k):mk.prev[k],b=mkMult(k);return b>a+.02?'<span style="color:#2f6b22">▲</span>':b<a-.02?'<span style="color:#9a2f1c">▼</span>':'<span style="opacity:.5">–</span>';};
  let h=`<p class="date">The Grange board, Marrow Hollow · day ${S.day}</p><p><b>WHAT THE TRUCK PAYS TONIGHT</b></p><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px 10px;font-size:13px;margin:4px 0 10px">`;
  for(const k of keys){const p=mkPct(k);h+=`<div>${mkWord(k,2)} <b style="color:${p>=85?'#2f6b22':p>=60?'#8a5a0e':'#9a2f1c'}">${p}%</b> ${arrow(k)}</div>`;}
  h+=`</div><p><b>WANTED</b> <small style="opacity:.7">first to deliver is paid; nobody else</small></p>`;
  for(const c of mk.contracts){const left=c.due-S.day;const have=mkHave(c.k);
    h+=`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin:3px 0;background:rgba(0,0,0,.14)"><div style="flex:1;font-size:13px"><b>${c.who}</b> wants ${c.n} ${mkWord(c.k,c.n)} · pays <b>${c.pay}</b> coins<br><small style="opacity:.75">${c.taken?`Filled by ${c.taken===me?'you':c.taken}.`:left<=0?'Due today.':`Due in ${left} day${left>1?'s':''}.`}${!c.taken?` You have ${have}.`:''}</small></div>`;
    if(!c.taken)h+=where==='board'?`<button class="btn" data-mk="${c.id}" ${have<c.n?'disabled style="opacity:.45"':''}>Deliver</button>`:`<small style="opacity:.6">at the board</small>`;h+='</div>';}
  const ppl=new Set([me,...Object.keys((S.world&&S.world.slots)||{}),...Object.keys(mk.earn)]);if(HOST.hostName)ppl.add(HOST.hostName);
  const rows=[...ppl].map(n=>[n,mk.earn[n]||0,'']).concat(mk.rivals.map(r=>[mkRiv(r.id).name,r.earn,mkRiv(r.id).where]));rows.sort((a,b)=>b[1]-a[1]);
  h+=`<p style="margin-top:10px"><b>THIS WEEK’S SALES</b> <small style="opacity:.7">the Grange purse goes to the top farm on day ${(mk.week+1)*7+1}</small></p>`;
  rows.forEach(([n,v,w],i)=>{h+=`<div style="font-size:13px">${i+1}. ${n===me?'<b>You</b>':n}${w?` <small style="opacity:.6">${w}</small>`:''} <span style="float:right">${v} coins</span></div>`;});
  if(mk.last)h+=`<p style="font-size:12px;opacity:.75;margin-top:8px"><i>Last week: ${mk.last}</i></p>`;
  return h;}
function mkOpen(){MKUI.open=true;if(HOST.role!=='guest'&&!MK().contracts.length)mkPost();openNote(mkHtml('board'),'Walk away',()=>{MKUI.open=false;});
  $('noteText').querySelectorAll('button[data-mk]').forEach(b=>b.onclick=()=>{if(b.disabled)return;mkDeliver(+b.dataset.mk);});}
// the board in town turns into the Grange board
{const it=interact.find(q=>q.x===boardPos.x&&Math.abs(q.z-(boardPos.z+.4))<.01);if(it){const _l=it.label,_a=it.act;it.label=()=>mkOn()?'The Grange board':_l();it.act=function(){if(mkOn()){mkOpen();return;}return _a.apply(this,arguments);};}}
// the first morning of a contest world has orders up already
{const _mb=mpBegin;mpBegin=function(rules){const r=_mb.apply(this,arguments);if(mkOn()){MK();mkPost();}return r;};}
// the Together tab shows the market (read only), and the bin says what the truck is paying
{const _rc=renderCoop;renderCoop=function(){_rc();if(!mkOn())return;const B=$('bagBody');if(!B)return;const box=document.createElement('div');box.style.cssText='margin-top:12px;padding:8px 10px;background:rgba(0,0,0,.18)';
  box.innerHTML=mkHtml('tab');B.appendChild(box);};}
{const _rb=renderBin;renderBin=function(){_rb.apply(this,arguments);if(!mkOn())return;const el=$('shipBin');if(!el)return;let m=el.querySelector('.mkline');if(!m){m=document.createElement('p');m.className='mkline jsub';m.style.cssText='font-size:12px;margin:2px 0 6px;opacity:.85';const h=el.querySelector('h2,.jsub,p');if(h&&h.parentNode)h.parentNode.insertBefore(m,h.nextSibling);else el.prepend(m);}
  const ks=[...new Set((S.ship||[]).map(e=>mkKey(e)).concat(S.basket.map(b=>mkKey(b))))].filter(k=>MK_K[k]).slice(0,5);
  m.innerHTML='The truck pays tonight: '+(ks.length?ks.map(k=>`${mkWord(k,2)} ${mkPct(k)}%`).join(' · '):'full price, for now')+'. First in the bin, first sold.';};}
