/* ================= #253 business. Two slow ways to make money work, both from the ledger at the Town Hall (and at your own
   shop's sign once you have one):
   - BUY INTO A TOWN SHOP. Coyle's General, the feed store, the forge, the carpenter's, the bait shop, the Lamplighter and the
     Lantern Inn take a stake five per cent at a time (never more than 49: the keeper keeps the shop). Every morning your share
     of what the shop made the day before comes to you. Put a fifth of a shop's worth in and the keeper gives you a little off
     everything you buy there. It's slow: a stake takes a season or so to pay itself back.
   - RUN YOUR OWN. Lease the empty storefront on the square, name it (the name goes up on a sign in town), choose what it sells
     (a farm stand for your crops, a kitchen for cooked food, a taproom for what you brew), hire people from town, and keep it
     stocked from your bag. Each morning it sells what it can (as much as its people can serve, as many as come in, as long as
     the shelves hold out), pays wages and rent from the till, and gains or loses a name in town. Upgrades: a painted sign,
     longer hours, a second line, the back room.
   In a shared world the ledger is the farm's: anyone can stock the shop or buy a stake, the host keeps the books each morning,
   and the till is everyone's. ================= */
S.biz=S.biz||{inv:{},own:null};
const BIZ_SHOPS={mae:{day:220},v_feed:{day:160},v_forge:{day:190},v_carp:{day:180},v_bait:{day:110},tavern:{day:140},inn:{day:200}};
const BIZ_TYPES={
  stand:{name:'Farm stand',sells:'your crops and eggs',markup:1.35,demand:8,take:e=>e.t==='P'},
  kitchen:{name:'Kitchen',sells:'cooked food',markup:1.6,demand:6,take:e=>e.t==='I'&&ITEMS[e.id]&&ITEMS[e.id].food&&!ITEMS[e.id].drink},
  taproom:{name:'Taproom',sells:'ale, wine and spirits',markup:1.6,demand:6,take:e=>e.t==='I'&&ITEMS[e.id]&&ITEMS[e.id].drink}};
const BIZ_HIRE=[{id:'ellie',name:'Ellie Pike',note:'seventeen, quick with sums, wants to leave town',wage:24,skill:4},{id:'tom',name:'Tom Calder',note:'big, quiet, never late',wage:30,skill:5},
  {id:'bell',name:'Mrs. Bell',note:'knows every family’s order by heart',wage:38,skill:7},{id:'ruben',name:'Ruben Moss',note:'cheerful; counts the till twice',wage:26,skill:4},
  {id:'ada',name:'Ada Wren',note:'used to cook at the inn; won’t say why she stopped',wage:42,skill:7},{id:'jonah',name:'Jonah Lark',note:'twelve; works for sweets',wage:12,skill:2}];
const BIZ_UP={sign:{name:'A painted sign',cost:180,desc:'More people come in.'},hours:{name:'Longer hours',cost:320,desc:'Your people can serve a quarter more.'},
  line:{name:'A second line',cost:450,desc:'Sell a second kind of thing too.'},back:{name:'The back room',cost:700,desc:'More stock, more people served: half as much again.'}};
const BIZ_SETUP=1500,BIZ_RENT=15,BIZ_MARGIN=.3,BIZ_STEP=5;
const bizEsc=t=>String(t||'').replace(/&/g,'&amp;');
const bizShopName=k=>(vendors[k]&&vendors[k].name)||k;
const bizValue=k=>BIZ_SHOPS[k].day*25;
const bizMine=()=>typeof HOST==='undefined'||HOST.role!=='guest';   // who keeps the books (the host, or you alone)
function bizStake(k){return (S.biz.inv[k]&&S.biz.inv[k].pct)||0;}
// ---- a little off at a shop you've a fifth of
for(const k of Object.keys(BIZ_SHOPS)){if(!vendors[k])continue;const _r=vendors[k].rows;vendors[k].rows=()=>{const rows=_r();if(bizStake(k)<20)return rows;
  return rows.map(r=>{if(!r||!r.price||r.k==='house'||String(r.k).startsWith('house_'))return r;return Object.assign({},r,{price:Math.max(1,Math.round(r.price*.95)),desc:String(r.desc||'')+' (5% off: you’ve a share in the place.)'});});};}
// ---- the morning's books
function bizMorning(){if(!bizMine())return null;const B=S.biz,out={div:0,sold:0,rev:0,cost:0,notes:[]};
  for(const [k,v] of Object.entries(B.inv||{})){if(!BIZ_SHOPS[k]||!v.pct)continue;const d=Math.round(BIZ_SHOPS[k].day*(.8+Math.random()*.4)*BIZ_MARGIN*v.pct/100);v.earned=(v.earned||0)+d;out.div+=d;}
  if(out.div){S.coins+=out.div;}
  const O=B.own;if(O){const types=[O.type].concat(O.up&&O.up.line&&O.type2?[O.type2]:[]);
    const cap=Math.round((O.staff||[]).reduce((a,id)=>a+((BIZ_HIRE.find(h=>h.id===id)||{}).skill||0),0)*(O.up.hours?1.25:1)*(O.up.back?1.5:1));
    const demand=Math.round(types.reduce((a,t)=>a+BIZ_TYPES[t].demand,0)*(1+(O.rep||50)/100)*(O.up.sign?1.3:1)*(O.up.back?1.5:1)*(.85+Math.random()*.3));
    const can=(O.stock||[]).filter(e=>types.some(t=>BIZ_TYPES[t].take(e)));let n=Math.min(cap,demand,can.length);
    for(let i=0;i<n;i++){const e=can[i];const t=types.find(t=>BIZ_TYPES[t].take(e));out.rev+=Math.round(e.value*BIZ_TYPES[t].markup);O.stock.splice(O.stock.indexOf(e),1);}
    out.sold=n;const wages=(O.staff||[]).reduce((a,id)=>a+((BIZ_HIRE.find(h=>h.id===id)||{}).wage||0),0);out.cost=wages+BIZ_RENT;
    O.till=(O.till||0)+out.rev-out.cost;
    if(!O.staff.length)out.notes.push('Nobody to open up. The door stayed locked.');
    else if(n<demand&&can.length<=n){O.rep=Math.max(0,(O.rep||50)-4);out.notes.push('The shelves were bare by noon. People went home with nothing.');}
    else if(n>=demand){O.rep=Math.min(100,(O.rep||50)+2);}
    else{O.rep=Math.min(100,(O.rep||50)+1);out.notes.push('More came in than your people could serve.');}
    if(O.till<0){O.unpaid=(O.unpaid||0)+1;out.notes.push('The till couldn’t cover the wages.');if(O.unpaid>=2&&O.staff.length){const q=O.staff.pop();const h=BIZ_HIRE.find(h=>h.id===q);out.notes.push(`${h?h.name:'Someone'} hasn’t been paid in two days and has quit.`);O.unpaid=0;}}else O.unpaid=0;
    O.log=(O.log||[]).concat([{day:S.day,sold:n,rev:out.rev,cost:out.cost}]).slice(-7);}
  return out;}
{const _nd=newDay;newDay=function(m,p){_nd(m,p);try{const r=bizMorning();if(!r)return;const bits=[];if(r.div)bits.push(`your shares paid ${r.div} coins`);
    if(S.biz.own)bits.push(`${S.biz.own.name} sold ${r.sold} thing${r.sold===1?'':'s'} for ${r.rev}, less ${r.cost} in wages and rent`);
    if(bits.length)setTimeout(()=>toast('Overnight, '+bits.join('; ')+'.'+(r.notes.length?' '+r.notes[0]:''),4.6),2600);}catch(e){}};}
// ---- the ledger
function bizRow(l,r,btn){return `<div class="bzr"><div class="bzl">${l}</div><div class="bzm">${r||''}</div>${btn||''}</div>`;}
function bizIcon(e){try{const k=e.t==='P'?e.id:((ITEMS[e.id]&&ITEMS[e.id].icon)||e.id);const u=typeof iconOf==='function'?iconOf(k):'';return u?`<img src="${u}" width="24" height="24" style="image-rendering:pixelated;vertical-align:middle;margin-right:6px">`:'';}catch(x){return '';}}
function bizStockCount(){const O=S.biz.own;return O?(O.stock||[]).length:0;}
function bizBagFor(types){const out=[];
  for(const b of S.basket||[])if(types.some(t=>BIZ_TYPES[t].take({t:'P',id:b.kind})))out.push({t:'P',id:b.kind,value:b.value,name:(typeof PRODUCE_NAMES!=='undefined'&&PRODUCE_NAMES[b.kind])||b.kind});
  for(const [k,n] of Object.entries(S.inv||{}))if(n>0&&ITEMS[k]&&types.some(t=>BIZ_TYPES[t].take({t:'I',id:k})))out.push({t:'I',id:k,value:sellPrice(k)||ITEMS[k].sell||5,name:ITEMS[k].name,n});
  const g={};for(const e of out){const key=e.t+':'+e.id;if(!g[key])g[key]=Object.assign({},e,{n:e.t==='P'?0:e.n});if(e.t==='P')g[key].n++;}return Object.values(g);}
function bizOpen(tab){const B=S.biz,O=B.own;tab=tab||(O?'own':'shares');const tabs=`<div class="bztabs"><button data-tab="shares" class="${tab==='shares'?'on':''}">Shares</button><button data-tab="own" class="${tab==='own'?'on':''}">${O?bizEsc(O.name):'Your own shop'}</button></div>`;
  let h=`<div class="bzled"></div><h3>The ledger <span class="bzpurse">${S.coins} coins</span></h3>${tabs}`;
  if(tab==='shares'){h+=`<p class="bzs">Buy into a town shop, ${BIZ_STEP}% at a time. Every morning your share of the day’s takings comes to you. A fifth of a shop gets you 5% off there.</p>`;
    for(const k of Object.keys(BIZ_SHOPS)){if(!vendors[k])continue;const st=bizStake(k),price=Math.round(bizValue(k)*BIZ_STEP/100),earned=(B.inv[k]&&B.inv[k].earned)||0;
      h+=bizRow(`<b>${bizShopName(k)}</b><small>${st?`You own ${st}%. Paid you ${earned} so far.`:`Makes about ${BIZ_SHOPS[k].day} a day.`}</small>`,`<span class="bzbar" title="49% is as much as a keeper will sell"><i style="width:${Math.round(st/49*100)}%"></i></span><small class="bzcap">${st} of 49%</small>`,
        st>=49?`<button disabled>${st}%</button>`:`<button data-buy="${k}" ${S.coins<price?'class="nope"':''}>+${BIZ_STEP}% · ${price}</button>`);}}
  else if(!O){h+=`<p class="bzs">The storefront on the square has stood empty since the Cranes’ shop closed. The lease and a refit come to ${BIZ_SETUP} coins, then ${BIZ_RENT} a day in rent. Name it, then pick what it sells: that pays and opens it.</p>
      <label class="bzl2">Name it <input id="bzName" maxlength="24" placeholder="Hollow Acre Produce"></label><div class="bzpick">`;
    for(const [k,T] of Object.entries(BIZ_TYPES))h+=`<button data-type="${k}" ${S.coins<BIZ_SETUP?'class="nope"':''}><b>${T.name} · ${BIZ_SETUP}</b><small>Sells ${T.sells}.</small></button>`;
    h+=`</div><p class="bzs" style="opacity:.8">${S.coins<BIZ_SETUP?`You have ${S.coins} coins.`:''}</p>`;}
  else{const types=[O.type].concat(O.up.line&&O.type2?[O.type2]:[]);const wages=O.staff.reduce((a,id)=>a+((BIZ_HIRE.find(x=>x.id===id)||{}).wage||0),0);
    const last=(O.log||[]).slice(-1)[0];
    h+=`<p class="bzs"><b>${bizEsc(O.name)}</b>, ${types.map(t=>BIZ_TYPES[t].name.toLowerCase()).join(' and ')}. Good name in town: <span class="bzbar"><i style="width:${O.rep}%"></i></span></p>`;
    h+=bizRow(`<b>In the till: ${O.till}</b><small>${last?`Yesterday: sold ${last.sold}, took ${last.rev}, paid out ${last.cost}.`:'Nothing sold yet.'}</small>`,'',O.till>0?`<button data-take="1">Take it</button>`:'');
    const bag=bizBagFor(types);h+=`<h4>On the shelves: ${bizStockCount()}</h4>`;
    if(bag.length){for(const e of bag.slice(0,8))h+=bizRow(`${bizIcon(e)}${e.name} <small>×${e.n} in your bag · sells for ${Math.round(e.value*BIZ_TYPES[types.find(t=>BIZ_TYPES[t].take(e))].markup)}</small>`,'',`<button data-stock="${e.t}:${e.id}">Stock 1</button><button data-stockall="${e.t}:${e.id}">All</button>`);}
    else h+=`<p class="bzs">Nothing in your bag that ${bizEsc(O.name)} sells.</p>`;
    h+=`<h4>People (${wages} a day in wages)</h4>`;
    for(const p of BIZ_HIRE){const on=O.staff.includes(p.id);h+=bizRow(`<b>${p.name}</b><small>${p.note}. Serves ${p.skill} a day · wage ${p.wage}</small>`,'',on?`<button data-fire="${p.id}">Let go</button>`:O.staff.length>=4?'':`<button data-hire="${p.id}">Hire</button>`);}
    h+='<h4>Improvements</h4>';
    for(const [k,U] of Object.entries(BIZ_UP)){if(O.up[k]){h+=bizRow(`<b>${U.name}</b> <small>Done.</small>`);continue;}
      if(k==='line'){h+=bizRow(`<b>${U.name}</b><small>${U.desc}</small>`,'',Object.keys(BIZ_TYPES).filter(t=>t!==O.type).map(t=>`<button data-line="${t}">${BIZ_TYPES[t].name} · ${U.cost}</button>`).join(''));continue;}
      h+=bizRow(`<b>${U.name}</b><small>${U.desc}</small>`,'',`<button data-up="${k}">${U.cost}</button>`);}}
  openNote(h,'Close the ledger');const N=$('noteText');if(!N)return;
  const re=t=>setTimeout(()=>bizOpen(t),0),pay=c=>{if(S.coins<c){SFX.deny&&SFX.deny();toast(`That’s ${c} coins. You have ${S.coins}.`,2.2);return false;}S.coins-=c;SFX.coin&&SFX.coin();updateHud&&updateHud();return true;};
  N.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>re(b.dataset.tab));
  N.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const k=b.dataset.buy,price=Math.round(bizValue(k)*BIZ_STEP/100);if(!pay(price))return;B.inv[k]=B.inv[k]||{pct:0,earned:0};B.inv[k].pct=Math.min(49,B.inv[k].pct+BIZ_STEP);
    toast(`You own ${B.inv[k].pct}% of ${bizShopName(k)}.${B.inv[k].pct===20?' The keeper shakes your hand a moment too long.':''}`,2.6);re('shares');});
  N.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{const nm=String(($('bzName')&&$('bzName').value)||'').replace(/[<>"]/g,'').replace(/\s+/g,' ').trim().slice(0,24);if(!nm){toast('Give it a name first.',2);$('bzName')&&$('bzName').focus();return;}
    if(!pay(BIZ_SETUP))return;B.own={name:nm,type:b.dataset.type,type2:null,day0:S.day,staff:[],stock:[],till:0,rep:50,up:{},log:[]};bizSign();toast(`${nm} has its name over the door. Hire someone to open up.`,3.2);re('own');});
  N.querySelectorAll('[data-take]').forEach(b=>b.onclick=()=>{S.coins+=O.till;toast(`You take ${O.till} coins from the till.`,2);O.till=0;SFX.coin&&SFX.coin();updateHud&&updateHud();re('own');});
  const stock=(spec,all)=>{const [t,id]=spec.split(':');let n=0;do{if(t==='P'){const i=S.basket.findIndex(x=>x.kind===id);if(i<0)break;const x=S.basket.splice(i,1)[0];O.stock.push({t,id,value:x.value});}
      else{if(inv(id)<=0)break;takeInv(id,1);O.stock.push({t,id,value:sellPrice(id)||ITEMS[id].sell||5});}n++;}while(all&&n<200);if(n)SFX.thud&&SFX.thud(0,.15);re('own');};
  N.querySelectorAll('[data-stock]').forEach(b=>b.onclick=()=>stock(b.dataset.stock,false));N.querySelectorAll('[data-stockall]').forEach(b=>b.onclick=()=>stock(b.dataset.stockall,true));
  N.querySelectorAll('[data-hire]').forEach(b=>b.onclick=()=>{O.staff.push(b.dataset.hire);toast(`${BIZ_HIRE.find(x=>x.id===b.dataset.hire).name} starts in the morning.`,2.2);re('own');});
  N.querySelectorAll('[data-fire]').forEach(b=>b.onclick=()=>{O.staff=O.staff.filter(x=>x!==b.dataset.fire);re('own');});
  N.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const k=b.dataset.up;if(!pay(BIZ_UP[k].cost))return;O.up[k]=1;if(k==='sign')bizSign();re('own');});
  N.querySelectorAll('[data-line]').forEach(b=>b.onclick=()=>{if(!pay(BIZ_UP.line.cost))return;O.up.line=1;O.type2=b.dataset.line;re('own');});}
{const css=document.createElement('style');css.textContent=`#noteText .bztabs{display:flex;gap:6px;margin:4px 0 8px}#noteText .bztabs button,#noteText .bzr button,#noteText .bzpick button{font:inherit;font-size:13px;padding:4px 10px;background:#3a2210;color:#f4e6c8;border:0;cursor:pointer;box-shadow:inset 0 0 0 1px #120a04,inset 0 2px 0 #5a3a1e}
#noteText .bztabs button.on{background:#a8502a}#noteText .bzr{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed rgba(90,60,30,.35)}#noteText .bzl{flex:1;min-width:0}#noteText .bzl small{display:block;opacity:.75;font-size:12px}
#noteText .bzm{flex:0 0 auto}#noteText .bzbar{display:inline-block;width:80px;height:8px;background:#2a1a0e;box-shadow:inset 0 0 0 1px #120a04;vertical-align:middle}#noteText .bzbar i{display:block;height:100%;background:#d8a050}
#noteText .bzs{font-size:13px;margin:4px 0 8px}#noteText h4{margin:10px 0 2px;font-size:14px}#noteText .bzpick{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:6px;margin:8px 0}
#noteText .bzpick button{text-align:left;padding:8px}#noteText .bzpick small{display:block;opacity:.8}#noteText .bzl2 input{font:inherit;width:100%;margin-top:4px;padding:6px;background:#fbf3e0;border:1px solid #6a4a2a}
#noteText:has(.bzled){background-image:none!important}#noteText h3 .bzpurse{float:right;font-weight:400;font-size:14px;color:#7a4a1a}
#noteText .bzm{display:flex;flex-direction:column;align-items:flex-end;gap:2px}#noteText .bzcap{font-size:11px;opacity:.75}
body:has(#note:not([hidden]) .bzled) #hud{visibility:hidden}
@media (max-width:600px){#noteText .bzr{flex-wrap:wrap}#noteText .bzl{flex:1 1 55%}#noteText .bzm{order:3;flex:1 1 100%!important;flex-direction:row;align-items:center;justify-content:flex-start;gap:8px}#noteText .bzm:empty{display:none}}#noteText button.nope{opacity:.55}#noteText .bzc{font-size:16px}`;document.head.appendChild(css);}
// ---- where the ledger is: the land office at the Town Hall, and your own shop's sign
if(vendors.land){const _r=vendors.land.rows;vendors.land.rows=()=>{const r=_r();r.unshift({k:'ledger',name:'The ledger',desc:'Shares in the town’s shops, and a shop of your own.',price:0,can:true,btn:'Open',buy(){setTimeout(()=>bizOpen(),50);}});return r;};}
const BIZ_SIGN={o:null,it:null,at:{x:47.6,z:-1.2}};
function bizSign(){const O=S.biz.own;if(BIZ_SIGN.o){BIZ_SIGN.o.hide=true;const i=OBJ.indexOf(BIZ_SIGN.o);if(i>=0)OBJ.splice(i,1);BIZ_SIGN.o=null;}if(!O)return;
  try{const o=obj('signpost',BIZ_SIGN.at.x,BIZ_SIGN.at.z,{kind:'prop',label:O.name.toUpperCase(),face:'P'});o.spr=signSprite(O.name.toUpperCase().slice(0,22),O.up&&O.up.sign?undefined:'plain');BIZ_SIGN.o=o;}catch(e){}
  if(!BIZ_SIGN.it){BIZ_SIGN.it={x:BIZ_SIGN.at.x,z:BIZ_SIGN.at.z+.5,r:1,on:()=>!S.room&&!!S.biz.own,label:()=>'Ledger',ok:()=>true,act(){bizOpen('own');}};interact.unshift(BIZ_SIGN.it);}}
// shared: the farm's ledger travels with the farm
if(typeof WORLD_KEYS!=='undefined'&&!WORLD_KEYS.includes('biz'))WORLD_KEYS.push('biz');
{const _lg=loadGame;loadGame=function(d){_lg(d);S.biz=S.biz||{inv:{},own:null};S.biz.inv=S.biz.inv||{};try{bizSign();}catch(e){}};}
{const _wr=typeof worldRebuild==='function'?worldRebuild:null;if(_wr)worldRebuild=function(keys){const r=_wr.apply(this,arguments);if(!keys||keys.has('biz')){S.biz=S.biz||{inv:{},own:null};try{bizSign();}catch(e){}}return r;};}
