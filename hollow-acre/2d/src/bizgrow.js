/* ================= #302 / #308 Investing grows into partnership. A stake in a town shop is yours (on a shared farm each player
   holds their own), up to half the business: at 50% you're partners, 50/50 with the keeper. And the shop now runs on real
   custom: every day the town's people come in and buy, the till is counted, and every partner takes their share of it. When
   another player buys there, a cut of what they paid goes to each partner too, straight away. As the money comes in you can
   grow the place with the keeper: stock new lines (which you, and everyone, can then buy there), hire them a hand, take on the
   building next door, and as a full partner open branches over in Wickham. Each one shows: goods out front, an annex stall,
   a branch with its own sign. ================= */
const BG_MAX=50,BG_CUT=.3;
const BG_LINES={mae:[['A preserves shelf',['jam']],['The bread counter',['bread','cornbread']],['Dairy',['cheese','milk']]],
  v_feed:[['Bait and tackle',['bait']],['Rope and twine',['rope']],['Milk and eggs',['milk']]],v_forge:[['Rope and fittings',['rope']]],v_carp:[['Rope',['rope']]],
  v_bait:[['Fresh bait',['bait']],['Hot soup for the bank',['potato_soup']]],tavern:[['Hot suppers',['stew','potato_soup']],['Ale on tap',['ale','pumpkin_ale']],['Puddings',['pie','carrot_cake']]],
  inn:[['Suppers',['beef_stew','soup']],['The wine list',['wine','old_wine']],['Breakfasts',['egg_fried','bread']]]};
const BG_GROW=[{k:'lines',name:'Stock a new line',min:10,max:3,cost:n=>350*(n+1),mult:.12,say:'New goods on the shelves, and in the shop’s list for anyone to buy.'},
  {k:'hands',name:'Hire them a hand',min:20,max:2,cost:n=>450*(n+1),mult:.1,say:'Somebody else behind the counter: longer hours, shorter queues.'},
  {k:'bigger',name:'Take on the building next door',min:30,max:2,cost:n=>1600*(n+1),mult:.25,say:'The shop grows into the next unit: an annex out front, twice the floor.'},
  {k:'branch',name:'Open a branch in Wickham',min:50,max:2,cost:n=>3200*(n+1),mult:.6,say:'Partners only: a second shop in Wickham, under the same name.'}];
const bgMe=()=>(typeof NAME==='function'&&NAME())||'Farmhand';
function bgS(){S.biz=S.biz||{inv:{},own:null};const B=S.biz;B.stakes=B.stakes||{};B.grow=B.grow||{};B.sales=B.sales||{};
  // (old saves: a stake bought before stakes had owners belongs to the main player)
  for(const [k,v] of Object.entries(B.inv||{})){if(v&&v.pct>0){const host=(typeof HOST!=='undefined'&&HOST.role==='guest')?(HOST.hostName||'host'):bgMe();const st=B.stakes[k]=B.stakes[k]||{};st[host]=Math.max(st[host]||0,v.pct);v.pct=0;}}
  return B;}
const bgStake=(k,n)=>((bgS().stakes[k]||{})[n||bgMe()])||0;
const bgTotal=k=>Object.values(bgS().stakes[k]||{}).reduce((a,b)=>a+b,0);
const bgG=k=>{const B=bgS();return B.grow[k]=B.grow[k]||{lines:0,hands:0,bigger:0,branch:0};};
const bgMult=k=>{const g=bgG(k);return 1+BG_GROW.reduce((a,G)=>a+(g[G.k]||0)*G.mult,0);};
// the 5%-off perk and everything else that asked "what's my stake?" now asks about yours
bizStake=function(k){return bgStake(k);};
// ---- the day's trade: townsfolk through the door, the till counted, every partner paid their share
function bgDay(){if(typeof bizMine==='function'&&!bizMine())return;const B=bgS();const notes=[];
  for(const k of Object.keys(BIZ_SHOPS)){if(!vendors[k])continue;const day=BIZ_SHOPS[k].day,m=bgMult(k),r=.85+Math.random()*.3;
    const cust=Math.max(3,Math.round(day/9*m*r)),take=Math.round(day*m*r);const prev=B.sales[k]||{};B.sales[k]={day:S.day,cust,take,players:prev.day===S.day?(prev.players||0):0,ptake:prev.day===S.day?(prev.ptake||0):0};
    for(const [n,pct] of Object.entries(B.stakes[k]||{})){if(!pct)continue;const d=Math.round(take*BG_CUT*pct/100);if(!d)continue;
      const inv=B.inv[k]=B.inv[k]||{pct:0,earned:0};if(n===bgMe())inv.earned=(inv.earned||0)+d;
      (B.paid=B.paid||{})[k+'|'+n]=((B.paid||{})[k+'|'+n]||0)+d;
      if(typeof mkPay==='function'&&typeof HOST!=='undefined'&&HOST.role)mkPay(n,d,`Your share of ${bizShopName(k)}: ${d}`);else if(n===bgMe())S.coins+=d;
      if(n===bgMe())notes.push(`${bizShopName(k)}: ${cust} customers, ${take} taken; your ${pct}% is ${d}`);}}
  if(notes.length)setTimeout(()=>toast(notes.slice(0,3).join(' · '),4.2),3000);try{updateHud&&updateHud();}catch(e){}}
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{bgDay();}catch(e){console.warn('shops',e);}return r;};}
// ---- when a player buys at a shop with partners, each partner's cut is paid there and then
function bgSale(k,price,by){if(!price||!BIZ_SHOPS[k])return;
  if(typeof HOST!=='undefined'&&HOST.role==='guest'){try{CO.room.emit('bgsale',{k,price,by:bgMe()},HOST.hostPeer);}catch(e){}return;}
  const B=bgS();const rec=B.sales[k]=B.sales[k]&&B.sales[k].day===S.day?B.sales[k]:{day:S.day,cust:0,take:0,players:0,ptake:0};rec.players++;rec.ptake+=price;
  for(const [n,pct] of Object.entries(B.stakes[k]||{})){if(!pct)continue;const d=Math.round(price*BG_CUT*pct/100);if(!d)continue;(B.paid=B.paid||{})[k+'|'+n]=((B.paid||{})[k+'|'+n]||0)+d;
    if(n!==by&&n===bgMe())setTimeout(()=>toast(`${by} spent ${price} at ${bizShopName(k)}. Your cut: ${d}.`,2.8),300);
    if(typeof mkPay==='function'&&typeof HOST!=='undefined'&&HOST.role)mkPay(n,d,`${by} bought at ${bizShopName(k)}: your cut ${d}`);else if(n===bgMe())S.coins+=d;}}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('bgsale',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{bgSale(String(m.data.k),Math.max(0,Math.min(1e5,m.data.price|0)),clean(m.data.by));}catch(e){}}));return r0;};}
// every row bought at a shop counts as a sale; and the lines you stocked there are on its list
for(const k of Object.keys(BIZ_SHOPS)){if(!vendors[k])continue;const _r=vendors[k].rows;vendors[k].rows=()=>{let rows=_r();
    const g=bgG(k),L=(BG_LINES[k]||[]).slice(0,g.lines||0);for(const [ln,ids] of L)for(const id of ids){const it=ITEMS[id];if(!it)continue;
      rows=rows.concat([{k:'bl_'+id,name:it.name,desc:`New here: ${ln.toLowerCase()}.`,price:Math.max(4,Math.round((it.sell||8)*2.2)),can:true,buy(){addInv(id,1);toast(`${it.name}.`,1.2);}}]);}
    return rows.map(r=>{if(!r||!r.buy||r._bg)return r;const b=r.buy;return Object.assign({},r,{_bg:1,buy(){const res=b.apply(this,arguments);try{bgSale(k,r.price,bgMe());}catch(e){}return res;}});});};}
// ---- the ledger's Shares page, with partners and the shop's growth
function bgGrow(k,G){const B=bgS(),g=bgG(k),n=g[G.k]||0,c=G.cost(n);if(bgStake(k)<G.min||n>=G.max)return;if(S.coins<c){SFX.deny&&SFX.deny();toast(`That’s ${c} coins. You have ${S.coins}.`,2.2);return;}
  S.coins-=c;g[G.k]=n+1;SFX.coin&&SFX.coin();updateHud&&updateHud();try{bgWorld();}catch(e){}
  const line=G.k==='lines'?((BG_LINES[k]||[])[n]||[])[0]:null;toast(`${bizShopName(k)}: ${line?line+' is in.':G.say}`,3.2);}
function bgShares(){const B=bgS();let h=`<div class="bzled"></div><h3>The ledger <span class="bzpurse">${S.coins} coins</span></h3><div class="bztabs"><button data-tab="shares" class="on">Shares</button><button data-tab="own">${B.own?bizEsc(B.own.name):'Your own shop'}</button></div>
  <p class="bzs">Buy into a town shop, ${BIZ_STEP}% at a time, up to half: at 50% you’re the keeper’s partner. Every day the town comes in and buys; each partner takes their share of the till, and a cut whenever another player buys there. Grow the place together: new lines from 10%, a hired hand from 20%, the building next door from 30%, a branch in Wickham as a full partner.</p>`;
  for(const k of Object.keys(BIZ_SHOPS)){if(!vendors[k])continue;const st=bgStake(k),tot=bgTotal(k),price=Math.round(bizValue(k)*bgMult(k)*BIZ_STEP/100),sale=B.sales[k],g=bgG(k);
    const others=Object.entries(B.stakes[k]||{}).filter(([n,p])=>n!==bgMe()&&p>0).map(([n,p])=>`${bizEsc(n)} ${p}%`).join(', ');
    const paid=(B.paid||{})[k+'|'+bgMe()]||0;
    let grow='';for(const G of BG_GROW){const n=g[G.k]||0;if(st<G.min){grow+=`<button disabled title="from ${G.min}%">${G.name} (${G.min}%)</button>`;continue;}
      grow+=n>=G.max?`<button disabled>${G.name}: done</button>`:`<button data-grow="${k}|${G.k}" ${S.coins<G.cost(n)?'class="nope"':''}>${G.name} · ${G.cost(n)}</button>`;}
    h+=`<div class="bgshop"><div class="bghead"><b>${bizShopName(k)}</b>${st>=BG_MAX?'<span class="bgp">PARTNERS 50/50</span>':''}</div>
      <small>${sale?`Yesterday: ${sale.cust} customers, ${sale.take} taken${sale.players?`, and ${sale.players} sale${sale.players>1?'s':''} to players (${sale.ptake})`:''}.`:`Makes about ${Math.round(BIZ_SHOPS[k].day*bgMult(k))} a day.`} ${st?`You hold ${st}%; it has paid you ${paid}.`:''}${others?` Other partners: ${others}.`:''}</small>
      <div class="bgrow"><span class="bzbar" title="half the business is the most a keeper will sell"><i style="width:${Math.round(st/BG_MAX*100)}%"></i></span><small class="bzcap">${st} of ${BG_MAX}%</small>
      ${st>=BG_MAX||tot>=100?`<button disabled>${st}%</button>`:`<button data-buy2="${k}" ${S.coins<price?'class="nope"':''}>+${BIZ_STEP}% · ${price}</button>`}</div>
      <div class="bggrow">${grow}</div></div>`;}
  openNote(h,'Close the ledger');const N=$('noteText');if(!N)return;const re=t=>setTimeout(()=>bizOpen(t),0);
  N.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>re(b.dataset.tab));
  N.querySelectorAll('[data-buy2]').forEach(b=>b.onclick=()=>{const k=b.dataset.buy2,price=Math.round(bizValue(k)*bgMult(k)*BIZ_STEP/100);if(bgStake(k)>=BG_MAX)return;
    if(S.coins<price){SFX.deny&&SFX.deny();toast(`That’s ${price} coins. You have ${S.coins}.`,2.2);return;}S.coins-=price;SFX.coin&&SFX.coin();updateHud&&updateHud();
    const st=bgS().stakes[k]=bgS().stakes[k]||{};st[bgMe()]=Math.min(BG_MAX,(st[bgMe()]||0)+BIZ_STEP);
    toast(st[bgMe()]>=BG_MAX?`You and the keeper shake on it: partners, 50/50, in ${bizShopName(k)}.`:`You hold ${st[bgMe()]}% of ${bizShopName(k)}.`,3);re('shares');});
  N.querySelectorAll('[data-grow]').forEach(b=>b.onclick=()=>{const [k,gk]=b.dataset.grow.split('|');const G=BG_GROW.find(x=>x.k===gk);if(G)bgGrow(k,G);re('shares');});}
{const _bo=bizOpen;bizOpen=function(tab){const O=S.biz&&S.biz.own;const t=tab||(O?'own':'shares');if(t==='shares'){bgShares();return;}return _bo.apply(this,arguments);};}
{const css=document.createElement('style');css.textContent=`#noteText .bgshop{margin:8px 0;padding:6px 8px;background:rgba(90,60,30,.08);box-shadow:inset 0 0 0 1px rgba(90,60,30,.25)}
#noteText .bghead{display:flex;gap:8px;align-items:center}#noteText .bgp{font-size:11px;color:#fff6e0;background:#2d5a30;padding:1px 6px}
#noteText .bgrow{display:flex;gap:8px;align-items:center;margin:4px 0}#noteText .bggrow{display:flex;flex-wrap:wrap;gap:4px}#noteText .bggrow button{font-size:12px;padding:3px 6px}`;document.head.appendChild(css);}
// ---- what it looks like: the new lines' goods out front, an annex stall beside the door, branches over in Wickham
const BG_DOOR=k=>{try{if(k==='mae')return tbDoor('store');if(k.startsWith('v_'))return shopDoor(k.slice(2));if(k==='tavern')return tbDoor('tavern');if(k==='inn'&&ROOMS.home_harlow&&ROOMS.home_harlow.out)return [ROOMS.home_harlow.out.x,ROOMS.home_harlow.out.z-.35];}catch(e){}return null;};
const BG_BRANCH=[[110.5,59.2],[125.5,59.2],[110.5,50.4],[125.5,50.4],[106,55],[130,55],[114,63],[122,63]];
const BGW={objs:[],its:[],sig:''};
function bgFree(x,z){try{return typeof blockedAt==='function'?!blockedAt(x,z,.6):true;}catch(e){return true;}}
function bgWorld(){const B=bgS();const sig=JSON.stringify(B.grow);if(sig===BGW.sig)return;BGW.sig=sig;
  for(const o of BGW.objs){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}for(const it of BGW.its){const i=interact.indexOf(it);if(i>=0)interact.splice(i,1);}BGW.objs=[];BGW.its=[];
  let bi=0;
  for(const k of Object.keys(BIZ_SHOPS)){const g=bgG(k),d=BG_DOOR(k);if(!d)continue;const [dx,dz]=d;
    // goods out front, one display per line
    const goods=['crate','in_crates','in_eggcrate'];for(let i=0;i<(g.lines||0);i++){const sx0=dx+(i%2?1.6:-1.6)+(i>1?(i%2?.9:-.9):0),sz0=dz+.9;if(!SPR[goods[i%3]])continue;BGW.objs.push(obj(goods[i%3],sx0,sz0,{kind:'prop',noCol:true,bg:k}));}
    // the annex: a market stall beside the shop, one per expansion
    for(let i=0;i<(g.bigger||0);i++){const ax=dx+(i?-4.2:4.2),az=dz+1.6;if(!SPR.wk_stall)break;BGW.objs.push(obj('wk_stall',ax,az,{kind:'prop',bg:k}));
      const it={x:ax,z:az+.6,r:1.2,on:()=>!S.room,label:()=>`${bizShopName(k)} annex`,ok:()=>true,act(){openShop(k);}};interact.push(it);BGW.its.push(it);}
    // branches in Wickham: a stall under the shop's own name, open to buy from
    for(let i=0;i<(g.branch||0);i++){let at=null;while(bi<BG_BRANCH.length&&!at){const c=BG_BRANCH[bi++];if(bgFree(c[0],c[1]))at=c;}if(!at)break;const [bx,bz]=at;
      if(SPR.wk_stall)BGW.objs.push(obj('wk_stall',bx,bz,{kind:'prop',bg:k}));
      try{const sg=obj('signpost',bx+2.1,bz+.3,{kind:'prop',label:(bizShopName(k)+' BRANCH').toUpperCase().slice(0,22),face:'P'});sg.spr=signSprite(sg.label,'plain');BGW.objs.push(sg);}catch(e){}
      const it={x:bx,z:bz+.6,r:1.3,on:()=>!S.room,label:()=>`${bizShopName(k)} (Wickham)`,ok:()=>true,act(){openShop(k);}};interact.push(it);BGW.its.push(it);}}
  if(typeof NAV!=='undefined')NAV.sig='';}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{BGW.sig='';bgWorld();}catch(e){}return r;};}
{const _wr=worldRebuild;worldRebuild=function(keys){const r=_wr.apply(this,arguments);try{if(!keys||keys.has('biz'))bgWorld();}catch(e){}return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);setTimeout(()=>{try{BGW.sig='';bgWorld();}catch(e){}},400);return r;};}
{const _bm=bizMorning;bizMorning=function(){try{bgS();}catch(e){}return _bm.apply(this,arguments);};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{bgS();}catch(e){}return r;};}
/* ================= #303 Competitive mode: your prices are what other players pay. In a versus world another player's shop
   sign now opens their shop: what's on their shelves, at the price they've set (cheap, fair or dear), bought for real. The
   money goes to the owner straight away (or waits for them if they're away), and the goods come off their shelf. ============ */
const bgPP=(sh,e)=>Math.max(2,Math.round((e.value||5)*1.3*((BW_PRICE[sh.price]||BW_PRICE.fair).mk||1)));
if(typeof bwCost==='function'){const _c=bwCost;bwCost=function(d){if(d&&d.a==='pbuy')return Math.max(0,d.price|0);return _c.apply(this,arguments);};}
if(typeof bwApply==='function'){const _a=bwApply;bwApply=function(n,d){if(!d||d.a!=='pbuy')return _a.apply(this,arguments);
  const B=BW(),sh=B.shops[d.from];if(!sh||sh.ai||d.from===n)return {ok:false,msg:'That shop isn’t selling to you.'};const i=d.i|0,e=sh.stock[i];
  if(!e||e.id!==d.id)return {ok:false,msg:'Somebody else bought that a moment ago.'};const price=bgPP(sh,e);if(price!==(d.price|0))return {ok:false,msg:`The price has changed: ${price} now.`};
  sh.stock.splice(i,1);sh.log=sh.log||[];sh.log.unshift({day:S.day,note:`${n} bought ${(ITEMS[e.id]&&ITEMS[e.id].name)||e.id} for ${price}`});sh.log=sh.log.slice(0,12);
  try{mkPay(sh.owner,price,`${n} bought from ${sh.name}: ${price}`);}catch(er){}
  if(n===bgMe())bgGive(e);else{const peer=Object.keys(HOST.members||{}).find(k=>HOST.members[k]===n);if(peer&&CO.room&&CO.room.emit)CO.room.emit('bggive',{n,e},peer);}
  return {ok:true,msg:`Bought from ${sh.name}: ${(ITEMS[e.id]&&ITEMS[e.id].name)||e.id}.`};};}
function bgGive(e){if(!e)return;if(e.t==='P')S.basket.push({kind:e.id,value:e.value});else if(ITEMS[e.id])addInv(e.id,1);try{updateHud&&updateHud();}catch(er){}}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('bggive',m=>{if(!m||m.isMe||HOST.role!=='guest'||!m.data||clean(m.data.n)!==bgMe())return;const e=m.data.e||{};if(typeof e.id!=='string')return;bgGive({t:e.t==='P'?'P':'I',id:e.id.slice(0,24),value:Math.max(1,Math.min(999,e.value|0))});}));return r0;};}
function bgTheirShop(owner){const B=BW(),sh=B.shops[owner];if(!sh){bwOpen('town');return;}const pr=BW_PRICE[sh.price]||BW_PRICE.fair;
  let h=`<div class="bzled"></div><h3>${bizEsc(sh.name)} <span class="bzpurse">${S.coins} coins</span></h3><p class="bzs">${bizEsc(owner)}’s shop. Their prices are <b>${pr.name.toLowerCase()}</b> (${pr.say}); what you pay goes to them.</p>`;
  const groups={};sh.stock.forEach((e,i)=>{(groups[e.id]=groups[e.id]||[]).push(i);});const ids=Object.keys(groups);
  if(!ids.length)h+='<p><i>The shelves are bare.</i></p>';
  for(const id of ids.slice(0,24)){const i=groups[id][0],e=sh.stock[i],p=bgPP(sh,e);h+=`<div class="bgshop"><div class="bgrow"><b>${bizEsc((ITEMS[id]&&ITEMS[id].name)||id)}</b><small>${groups[id].length} on the shelf</small><button data-pbuy="${i}|${bizEsc(id)}|${p}" ${S.coins<p?'class="nope"':''}>Buy · ${p}</button></div></div>`;}
  h+=`<p><button data-town="1">The town ledger</button></p>`;openNote(h,'Leave');const N=$('noteText');if(!N)return;
  N.querySelectorAll('[data-pbuy]').forEach(b=>b.onclick=()=>{const [i,id,p]=b.dataset.pbuy.split('|');bwDo({a:'pbuy',from:owner,i:+i,id,price:+p});setTimeout(()=>bgTheirShop(owner),900);});
  const t=N.querySelector('[data-town]');if(t)t.onclick=()=>bwOpen('town');}
setInterval(()=>{try{if(typeof BWS==='undefined'||!BWS.its)return;for(const it of BWS.its){if(it._bg)continue;it._bg=1;const a=it.act,lb=it.label;
  it.act=function(){const own=Object.values(BW().shops).find(s=>!s.ai&&it.label()===s.name);if(own&&own.owner!==bwMe()){bgTheirShop(own.owner);return;}return a.apply(this,arguments);};}}catch(e){}},800);
// ---- each shop's own stall (the annex and the branches): a striped awning in the shop's colour, its name board, its goods
const BG_LOOK={mae:{n:'COYLE GENERAL',c:'#8a2a2a',g:'jars'},v_feed:{n:'BELL FEED',c:'#3a5a2a',g:'sacks'},v_forge:{n:'BRANNOCK',c:'#3a3a48',g:'iron'},v_carp:{n:'HARTLEY',c:'#6a4a20',g:'planks'},
  v_bait:{n:'BAIT',c:'#2a4a6a',g:'buckets'},tavern:{n:'LAMPLIGHTER',c:'#5a2a4a',g:'mugs'},inn:{n:'HARLOW INN',c:'#2a4a4a',g:'mugs'}};
function bgStallSpr(k){const key='bg_stall_'+k;if(SPR[key])return key;const L=BG_LOOK[k]||{n:'SHOP',c:'#6a4a2a',g:'jars'};const W=112,H=96;
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const sh=(hex,f)=>{const n=parseInt(hex.slice(1),16);const r=Math.min(255,Math.round((n>>16)*f)),gg=Math.min(255,Math.round(((n>>8)&255)*f)),b=Math.min(255,Math.round((n&255)*f));return `rgb(${r},${gg},${b})`;};
  const WD=['#1e140c','#4a3220','#6a4a2e','#8a6440','#a8804e'];
  P(8,90,96,5,'rgba(0,0,0,.35)');   // contact shadow
  for(const x of [10,98]){P(x-1,26,6,66,'#120c08');P(x,26,4,65,WD[2]);P(x,26,1,65,WD[4]);P(x+3,26,1,65,WD[1]);}   // posts
  // the counter: a plank front with a top lit from the left
  P(6,60,100,32,'#120c08');P(7,61,98,30,WD[2]);for(let y=66;y<91;y+=6)P(7,y,98,1,WD[1]);P(7,61,98,4,WD[4]);P(7,64,98,1,WD[3]);for(let x=20;x<104;x+=21)P(x,66,1,25,WD[1]);
  // goods on the counter top
  const gd=L.g;
  if(gd==='mugs'){   // a keg on its cradle at one end, a tap, the mugs in a huddle (one tipped), a chalkboard of the day's pours
    P(10,38,24,22,'#120c08');P(11,39,22,20,'#7a4a24');for(const yy of [42,49,56])P(11,yy,22,2,'#5a5a62');P(11,39,22,2,'#9a6a3a');P(13,59,4,3,'#120c08');P(27,59,4,3,'#120c08');   // keg and cradle
    P(33,47,4,3,'#120c08');P(34,48,3,1,'#c8a04a');P(35,50,1,3,'#c8a04a');
    for(const [x,y,tip] of [[44,51,0],[51,50,0],[57,52,0],[48,55,0],[63,55,1]]){if(tip){P(x,y,10,7,'#120c08');P(x+1,y+1,8,5,'#c8a050');P(x+1,y+1,2,5,'#f0e8d0');P(x+9,y+2,1,2,'#d8b860');continue;}
      P(x,y,8,10,'#120c08');P(x+1,y+1,6,8,'#c8a050');P(x+1,y+1,6,2,'#f0e8d0');P(x+7,y+3,2,4,'#120c08');}
    P(78,34,24,26,'#120c08');P(79,35,22,22,'#2a2e2a');P(79,35,22,1,'#4a4e4a');for(const [yy,w] of [[39,14],[44,18],[49,11]])P(82,yy,w,1,'#c8c8b8');P(83,57,3,4,'#120c08');P(95,57,3,4,'#120c08');}   // chalkboard on legs
  else if(gd==='jars'){   // jars of different sizes, two in a crate, a gap, a hand-lettered price card
    const J=[[12,9,12,'#a83a2a'],[22,7,9,'#c8a03a'],[30,8,11,'#6a8a3a'],[48,10,13,'#a83a2a'],[59,7,8,'#c8783a'],[67,8,10,'#6a8a3a']];
    for(const [x,w,h,col] of J){const y=61-h;P(x,y,w,h,'#120c08');P(x+1,y+2,w-2,h-3,col);P(x+1,y+2,2,h-3,'rgba(255,255,255,.35)');P(x+1,y,w-2,2,'#d8ccb0');}
    P(76,50,22,11,'#120c08');P(77,51,20,9,'#8a6440');P(77,51,20,2,'#a8804e');for(const xx of [79,87])P(xx,46,7,7,'#120c08'),P(xx+1,47,5,5,'#c8a03a');   // a crate with two jars
    P(38,44,9,8,'#120c08');P(39,45,7,6,'#e8dcc0');P(40,47,5,1,'#3a2a1a');P(40,49,3,1,'#3a2a1a');P(42,52,1,8,'#120c08');}   // the price card on a stick
  else for(let i=0;i<7;i++){const x=12+i*13;
    if(gd==='sacks'){P(x-1,47,11,14,'#120c08');P(x,48,9,12,'#c8b088');P(x,48,3,12,'#e0cca4');P(x+2,46,5,3,'#8a7050');}
    else if(gd==='iron'){P(x,54,10,7,'#120c08');P(x+1,55,8,5,'#6a6a74');P(x+1,55,8,1,'#9a9aa4');}
    else if(gd==='planks'){P(x-1,52,12,9,'#120c08');P(x,53,10,7,'#b08858');P(x,55,10,1,'#8a6440');P(x,58,10,1,'#8a6440');}
    else{P(x,50,10,11,'#120c08');P(x+1,51,8,9,'#7a8a98');P(x+1,51,8,2,'#3a6a9a');}}
  // the awning: stripes in the shop's colour and cream, a scalloped edge, darker under the fold
  P(2,14,108,16,'#120c08');for(let x=3;x<109;x++){const st=Math.floor((x-3)/9)%2;P(x,15,1,12,st?L.c:'#e8dcc0');P(x,15,1,2,st?sh(L.c,1.35):'#f6eedc');P(x,25,1,2,st?sh(L.c,.7):'#c8bca0');}
  for(let x=3;x<109;x+=9){P(x,27,9,2,'#120c08');P(x+1,27,7,2,Math.floor((x-3)/9)%2?sh(L.c,.85):'#d8ccb0');P(x+2,29,5,1,'#120c08');}
  P(3,30,106,3,'rgba(0,0,0,.25)');
  // the name board on top
  const tw=L.n.length*4-1,bx=Math.round(56-tw/2)-4;P(bx,2,tw+8,12,'#120c08');P(bx+1,3,tw+6,10,WD[1]);P(bx+1,3,tw+6,1,WD[3]);
  if(typeof sgtT==='function'){sgtT(P,L.n,bx+4,6,'#2a1a0e');sgtT(P,L.n,bx+4,5,'#f0dca8');}
  IMG['mem:'+key]=c;SPR[key]={src:'mem:'+key,fw:W,fh:H,ax:W>>1,ay:H-4,foot:[-1.6,-.4,1.6,0]};return key;}
{const _bw=bgWorld;bgWorld=function(){BGW.sig+='';const before=BGW.objs.length;_bw.apply(this,arguments);for(const o of BGW.objs)if(o.spr==='wk_stall'&&o.bg)o.spr=bgStallSpr(o.bg);};}
// (#301) the kitchen is a restaurant: say so where you choose it
try{if(BIZ_TYPES.kitchen)BIZ_TYPES.kitchen.name='Kitchen (a small restaurant)';if(BIZ_TYPES.stand)BIZ_TYPES.stand.name='Farm stand (a store)';}catch(e){}
