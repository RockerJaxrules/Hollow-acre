/* ================= the game menu, Stardew-style: Items (a backpack of slots whose first row is your toolbar), Social, Map, Journal.
   The slots are a view over the stores the rest of the game already uses (tools, seeds, the produce basket, materials and food,
   furniture), so every shop, quest and recipe keeps working; the slots only remember where you put things. ================= */
S.bagSize=S.bagSize||24;S.slots=(S.slots&&S.slots.length===36)?S.slots:new Array(36).fill(null);S.slotSel=S.slotSel||0;
const ROD_NAMES=['Bamboo rod','Ash rod','Greenheart rod'];
const PRODUCE_NAMES={turnip:'Turnip',pumpkin:'Pumpkin',corn:'Corn',fish:'Fish',egg:'Egg',mushroom:'Glowcap'};
function itemInfo(key){if(!key)return null;const i=key.indexOf(':'),t=key.slice(0,i),id=key.slice(i+1);const T=S.tools||{};
  if(t==='T'){const N={hoe:[`${T.hoe>1?'Copper':'Rusty'} hoe`,'Tills soil. Swing it at grass or dirt.'],can:[`${S.waterMax>10?'Copper':'Tin'} watering can`,`Holds ${S.waterMax} water. Refill at the well or pond. ${S.water}/${S.waterMax} now.`],
      pick:[`${T.pick>1?'Steel':'Grandpa’s'} pickaxe`,'Breaks rocks and ore.'],axe:[`${T.axe>1?'Steel':'Old'} axe`,'Chops trees and stumps for wood.'],rod:[ROD_NAMES[Math.max(0,(S.rod||1)-1)],'Cast it at water. Keep the fish inside the green bar until it’s yours.']}[id];
    return {key,type:t,id,name:N[0],desc:N[1],icon:id,qty:1,tool:true};}
  if(t==='S'){const sd=SEEDS[id];if(!sd)return null;return {key,type:t,id,name:sd.name+' seeds',desc:`Plant in tilled soil and water daily. Grows in ${Math.round(sd.grow/2)}–${sd.grow} hours of care.`,icon:'seed',qty:S.seeds[id]||0};}
  if(t==='P'){const n=basketCount(id);const v=S.basket.filter(b=>b.kind===id).reduce((a,b)=>a+b.value,0);const raw=RAW[id];
    return {key,type:t,id,name:PRODUCE_NAMES[id]||id,desc:(raw?`Edible: +${raw[0]} energy${raw[1]?`, +${raw[1]} health`:''}. `:'')+`Ships for ${n?Math.round(v/n):'?'} each.`,icon:id,qty:n,food:raw,sell:n?Math.round(v/n):0};}
  if(t==='I'){const d=ITEMS[id];if(!d)return null;return {key,type:t,id,name:d.name,desc:d.desc||(d.food?`+${d.food[0]} energy${d.food[1]?`, +${d.food[1]} health`:''}.`:'A material for crafting and building.'),icon:d.icon||id,qty:inv(id),food:d.food,sell:d.sell};}
  if(t==='F'){const f=FURN[id];if(!f)return null;return {key,type:t,id,name:f[0],desc:'Furniture. Use it inside the cabin to place it.',icon:f[1],qty:S.furnBag.filter(q=>q===id).length};}
  return null;}
function allItemKeys(){const ks=['T:hoe','T:can','T:pick','T:axe','T:rod'];
  for(const k in SEEDS)if((S.seeds[k]||0)>0)ks.push('S:'+k);
  for(const k of new Set(S.basket.map(b=>b.kind)))ks.push('P:'+k);
  for(const k in ITEMS)if(inv(k)>0)ks.push('I:'+k);
  for(const k of new Set(S.furnBag))ks.push('F:'+k);
  return ks;}
let BAG_OVER=[];
function syncSlots(){const have=new Set(allItemKeys());
  for(let i=0;i<36;i++){const k=S.slots[i];if(!k)continue;const it=itemInfo(k);if(!have.has(k)||!it||(!it.tool&&it.qty<=0)||i>=S.bagSize)S.slots[i]=null;}
  BAG_OVER=[];const placed=new Set(S.slots.filter(Boolean));
  for(const k of have){if(placed.has(k))continue;const e=S.slots.findIndex((q,i)=>!q&&i<S.bagSize);if(e>=0){S.slots[e]=k;placed.add(k);}else BAG_OVER.push(k);}}
function slotsVisible(){return innerWidth>=900?12:Math.min(12,Math.max(6,Math.floor((innerWidth-130)/38)));}
// ---- the toolbar: the first row of the backpack
function slotUse(i){if(S.mode!=='play'||S.paused)return;syncSlots();const k=S.slots[i];const was=S.slotSel;S.slotSel=i;const it=itemInfo(k);if(!it){renderHotbar();return;}
  if(it.type==='S'){S.sel=it.id;toast(`${it.name} ×${it.qty}`,1.2);}
  else if(it.type==='T')toast(it.name+(it.id==='can'?` — ${S.water}/${S.waterMax}`:''),1.2);
  else if(it.food){if(was===i){if(it.type==='P'){takeBasket(it.id,1);eat(it.food[0],it.food[1],it.id==='mushroom'?'You eat the glowcap raw. Your teeth feel loose':'You eat a raw '+it.name.toLowerCase());}else{takeInv(it.id,1);eat(it.food[0],it.food[1],it.name);}updateHud();}
    else toast(`${it.name} ×${it.qty} — tap again to eat`,1.4);}
  else if(it.type==='F'){if(S.room!=='cabin')toast('Carry it into the cabin, then use it to place it.',1.8);else startFurn(it.id);}
  else toast(`${it.name} ×${it.qty}`,1.2);
  renderHotbar();}
const selectedItem=()=>itemInfo(S.slots[S.slotSel]);
hotbarUse=function(k){const i=['hoe','can','pick','axe','seed','food'].indexOf(k);if(i>=0)slotUse(i);};
addEventListener('keydown',e=>{if(S.mode!=='play'||S.paused)return;const m=/^Digit([0-9])$/.exec(e.code);if(m){const n=+m[1];const i=n===0?9:n-1;if(i>=6){slotUse(i);e.preventDefault();}}
  if(e.code==='Minus')slotUse(10);if(e.code==='Equal')slotUse(11);});
addEventListener('wheel',e=>{if(S.mode!=='play'||S.paused||!$('hud')||$('hud').hidden)return;const n=slotsVisible();S.slotSel=(S.slotSel+(e.deltaY>0?1:n-1))%n;slotUse(S.slotSel);},{passive:true});
{const css=document.createElement('style');css.textContent=`
#hotbar .slot.sel{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #ffe08a,inset 0 0 0 6px #c88a2a!important;transform:translateY(-3px)}
#hotbar .slot.empty img{display:none}
#gm .tabs{display:flex;gap:4px;margin:-4px 0 10px;flex-wrap:wrap}#gm .tabs button{font:inherit;font-size:14px;padding:7px 12px;cursor:pointer;color:var(--bone);background:#3a2414;border:0;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #6a4424}
#gm .tabs button.on{background:#8a5a2a;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #f0a040}
.invgrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:3px;max-width:540px;touch-action:none;user-select:none}
.invgrid .is{aspect-ratio:1;position:relative;background:#c8955a;box-shadow:inset 0 0 0 2px #5a3418,inset 2px 2px 0 2px #e8b878;image-rendering:pixelated;cursor:pointer}
.invgrid .is.row0{background:#d8a868}.invgrid .is.locked{background:#6a4a2a;box-shadow:inset 0 0 0 2px #3a2010;cursor:default}
.invgrid .is.sel{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #ff5030}.invgrid .is img{position:absolute;inset:8%;width:84%;height:84%;image-rendering:pixelated;pointer-events:none}
.invgrid .is b{position:absolute;right:2px;bottom:0;font:11px/1 'Pixelify Sans',monospace;color:#fff4dc;text-shadow:1px 1px 0 #2a1608,-1px 0 0 #2a1608;pointer-events:none}
.invgrid .is.drag{opacity:.35}.invgrid .is.over{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #fff}
#invTip{min-height:58px;margin-top:8px;padding:8px 10px;background:rgba(20,12,6,.55);box-shadow:inset 0 0 0 2px #5a3418;font-size:13px;line-height:1.35}#invTip b{color:var(--ember);font-size:15px}
.invbar{display:flex;gap:8px;align-items:center;margin-top:8px;flex-wrap:wrap}.invbar .trash{width:44px;height:44px;background:#5a3a2a;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #8a3a2a;display:grid;place-items:center;font-size:20px}
.invbar .trash.over{background:#a8402a}.invstats{font-size:13px;color:var(--dim)}
#dragGhost{position:fixed;width:40px;height:40px;pointer-events:none;z-index:999;image-rendering:pixelated}
.soc{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px}.soc .p{display:flex;gap:8px;align-items:center;padding:6px 8px;background:rgba(233,223,198,.05);box-shadow:inset 0 0 0 2px #3a2414;cursor:pointer}
.soc .p canvas{width:40px;height:40px;image-rendering:pixelated;background:#c8955a;box-shadow:inset 0 0 0 2px #5a3418}.soc .p .h{color:#e8504a;letter-spacing:1px;font-size:13px}.soc .p .h i{color:#6a4a3a;font-style:normal}
.soc .p small{display:block;color:var(--dim);font-size:11px}.soc .p .tk{font-size:11px;color:#9fc07a}
#mapWrap{position:relative;overflow:auto;max-height:60vh;background:#1a120a;box-shadow:inset 0 0 0 3px #5a3418}#mapCv{display:block;image-rendering:pixelated;width:100%}
#mapWrap .lbl{position:absolute;transform:translate(-50%,-50%);font:12px/1 'Pixelify Sans',monospace;color:#fff4dc;text-shadow:1px 1px 0 #000,-1px -1px 0 #000;pointer-events:none;white-space:nowrap}
#mapWrap .you{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;background:#ff3a2a;box-shadow:0 0 0 2px #fff;border-radius:50%;animation:mapPulse .9s steps(2) infinite}
@keyframes mapPulse{50%{transform:scale(1.5)}}`;document.head.appendChild(css);}
function renderHotbar(){const hb=$('hotbar');if(!hb)return;syncSlots();const n=slotsVisible();
  if(hb.children.length!==n){hb.innerHTML='';for(let i=0;i<n;i++){const b=document.createElement('button');b.className='slot';b.dataset.i=i;b.innerHTML=`<i>${i<9?i+1:i===9?0:i===10?'-':'='}</i><img alt=""><b></b>`;
      b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();slotUse(i);});hb.appendChild(b);}}
  const L=($('btnAct').textContent||'');const want=/Till/.test(L)?'T:hoe':/Water/.test(L)?'T:can':/Mine|Break/.test(L)?'T:pick':/Chop/.test(L)?'T:axe':/Plant/.test(L)?'S:'+S.sel:/Fish|Cast/.test(L)?'T:rod':null;
  [...hb.children].forEach((b,i)=>{const it=itemInfo(S.slots[i]);const im=b.querySelector('img');const ct=b.querySelector('b');
    b.classList.toggle('empty',!it);b.classList.toggle('sel',i===S.slotSel);b.classList.toggle('on',!!it&&it.key===want);b.setAttribute('aria-label',it?it.name:'empty slot');
    if(it){const src=iconOf(it.icon);if(im.dataset.k!==it.key||!im.src){im.src=src;im.dataset.k=it.key;}ct.textContent=it.tool?(it.id==='can'?S.water:''):(it.qty>1?it.qty:'');}else{ct.textContent='';im.removeAttribute('src');im.dataset.k='';}});}
setInterval(()=>{if($('hotbar')&&$('hotbar').style.display!=='none')renderHotbar();},150);
// ---- the menu itself: the old bag panel grows tabs
let GM_TAB='items';
const _obChain=openBag;
openBag=function(tab){GM_TAB=tab||GM_TAB||'items';S.paused=true;const bag=$('bag');bag.id='bag';
  if(!bag.querySelector('.tabs')){bag.dataset.gm=1;const t=document.createElement('div');t.className='tabs';t.innerHTML=['items:Items','social:Social','map:Map','journal:Journal'].map(s=>{const [k,l]=s.split(':');return `<button data-t="${k}">${l}</button>`;}).join('');
    bag.querySelector('h2').after(t);t.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.t==='journal'){bag.hidden=true;S.paused=false;openJournal();return;}openBag(b.dataset.t);}));}
  bag.setAttribute('id','bag');document.getElementById('bag').classList.add('gmenu');bag.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===GM_TAB));
  bag.querySelector('h2').textContent={items:'Backpack',social:'Neighbours',map:'Marrow Hollow',journal:'Journal'}[GM_TAB];
  if(GM_TAB==='items'){_obChain();renderItems();}
  else{$('bagSub').textContent='';$('bagBody').innerHTML='';bag.hidden=false;if(GM_TAB==='social')renderSocial();if(GM_TAB==='map')renderMap();}};
$('bag').id='bag';
function renderItems(){const B=$('bagBody');syncSlots();
  // keep what other systems appended (furniture, wardrobe) and swap the old lists for the grid
  [...B.children].forEach(el=>{if(el.tagName==='H3'||el.classList.contains('grid')||(el.tagName==='P'&&el.classList.contains('sub')))el.remove();});
  [...B.querySelectorAll('div')].forEach(d=>{if(d.querySelector('[data-place]'))d.remove();});
  const wrap=document.createElement('div');B.prepend(wrap);
  let h='<div class="invgrid" id="invGrid">';for(let i=0;i<36;i++){const lock=i>=S.bagSize;h+=`<div class="is${i<12?' row0':''}${lock?' locked':''}${i===S.slotSel?' sel':''}" data-i="${i}"></div>`;}h+='</div>';
  h+=`<div id="invTip">Tap an item to see it. Drag to move it; the top row is your toolbar.</div>`;
  h+=`<div class="invbar"><div class="trash" id="invTrash" title="Trash">🗑</div><button class="chip" id="invSort">Sort</button><span class="invstats">${S.coins} coins · Energy ${Math.round(S.energy)}/${S.energyMax} · Health ${Math.round(S.hp)}/${S.hpMax}${S.bagSize<36?` · ${S.bagSize} slots (Mae sells a bigger pack)`:''}${BAG_OVER.length?` · <b style="color:#e8504a">${BAG_OVER.length} won’t fit</b>`:''}</span></div>`;
  wrap.innerHTML=h;
  const G=$('invGrid');const cells=[...G.children];
  const paint=()=>{cells.forEach((c,i)=>{const it=itemInfo(S.slots[i]);c.innerHTML=it?`<img src="${iconOf(it.icon)}" alt=""><b>${it.tool?'':(it.qty>1?it.qty:'')}</b>`:'';c.classList.toggle('sel',i===S.slotSel);c.setAttribute('aria-label',it?`${it.name}${it.qty>1?' ×'+it.qty:''}`:'empty');});};
  const tip=(i)=>{const it=itemInfo(S.slots[i]);const T=$('invTip');if(!it){T.innerHTML='Empty slot.';return;}
    let act='';if(it.food)act=`<button class="chip" data-eat="${i}" style="margin-left:6px">Eat</button>`;if(it.type==='F')act=`<button class="chip" data-place="${it.id}" style="margin-left:6px">Place</button>`;
    T.innerHTML=`<b>${it.name}</b>${it.qty>1?` ×${it.qty}`:''}${act}<br>${it.desc}`;
    const eb=T.querySelector('[data-eat]');if(eb)eb.addEventListener('click',()=>{S.paused=false;S.slotSel=i;slotUse(i);slotUse(i);S.paused=true;renderItems();});
    const pb=T.querySelector('[data-place]');if(pb)pb.addEventListener('click',()=>{if(S.room!=='cabin'){toast('Carry it into the cabin first.',1.6);return;}$('bag').hidden=true;S.paused=false;startFurn(pb.dataset.place);});};
  paint();
  // drag and drop (mouse and touch): press, move past a few pixels to drag; release on a slot to swap, on the bin to throw away
  let drag=null;const ghost=document.createElement('img');ghost.id='dragGhost';
  const cellAt=(x,y)=>{const el=document.elementFromPoint(x,y);return el&&el.closest?el.closest('.is,.trash'):null;};
  G.addEventListener('pointerdown',e=>{const c=e.target.closest('.is');if(!c||c.classList.contains('locked'))return;const i=+c.dataset.i;drag={i,x:e.clientX,y:e.clientY,moved:false,c};G.setPointerCapture&&G.setPointerCapture(e.pointerId);});
  G.addEventListener('pointermove',e=>{if(!drag)return;if(!drag.moved&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6&&S.slots[drag.i]){drag.moved=true;drag.c.classList.add('drag');ghost.src=iconOf(itemInfo(S.slots[drag.i]).icon);document.body.appendChild(ghost);}
    if(drag.moved){ghost.style.left=(e.clientX-20)+'px';ghost.style.top=(e.clientY-20)+'px';document.querySelectorAll('.invgrid .over,.trash.over').forEach(q=>q.classList.remove('over'));const t=cellAt(e.clientX,e.clientY);if(t)t.classList.add('over');}});
  const end=e=>{if(!drag)return;const d=drag;drag=null;ghost.remove();cells.forEach(c=>c.classList.remove('drag','over'));$('invTrash').classList.remove('over');
    if(!d.moved){S.slotSel=d.i<12?d.i:S.slotSel;tip(d.i);paint();return;}
    const t=cellAt(e.clientX,e.clientY);if(!t)return;
    if(t.id==='invTrash'){const it=itemInfo(S.slots[d.i]);if(!it)return;if(it.tool){toast('You can’t throw that away. Grandpa would know.',1.8);return;}
      if(it.type==='I')takeInv(it.id,it.qty);else if(it.type==='P')takeBasket(it.id,it.qty);else if(it.type==='S')S.seeds[it.id]=0;else if(it.type==='F')S.furnBag=S.furnBag.filter(q=>q!==it.id);
      S.slots[d.i]=null;SFX.thud&&SFX.thud(0,.2);toast(`Threw away ${it.name.toLowerCase()}.`,1.4);updateHud();renderItems();return;}
    const j=+t.dataset.i;if(t.classList.contains('locked')||j===d.i)return;const tmp=S.slots[j];S.slots[j]=S.slots[d.i];S.slots[d.i]=tmp;SFX.click?SFX.click():0;paint();tip(j);};
  G.addEventListener('pointerup',end);G.addEventListener('pointercancel',()=>{drag=null;ghost.remove();});
  $('invSort').addEventListener('click',()=>{const order={T:0,S:1,P:2,I:3,F:4};const ks=S.slots.slice(0,S.bagSize).filter(Boolean).sort((a,b)=>(order[a[0]]-order[b[0]])||a.localeCompare(b));
    for(let i=0;i<36;i++)S.slots[i]=i<ks.length?ks[i]:null;syncSlots();paint();});}
// a bigger pack at the store, like the one in town
{const _m=vendors.mae.rows;vendors.mae.rows=()=>{const r=_m();r.push({k:'pack',name:'Large backpack',desc:S.bagSize>=36?'You already carry the big one.':'Twelve more slots. “Your grandfather’s. He won’t be needing it.”',price:400,can:S.bagSize<36,buy(){S.bagSize=36;toast('Your backpack has 36 slots now.',2);}});return r;};}
// ---- Social: everyone you’ve met, their hearts, whether you’ve talked or given a gift
function headIcon(id,cv){const m=SPR[id],im=m&&IMG[m.src];const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,cv.width,cv.height);if(!im||!m.clips)return;
  const r=(m.clips.walk.S||m.clips.idle.S)[0];g.drawImage(im,0,r*m.fh+6,m.fw,30,-4,-1,m.fw*30/30*1.0+8,38);}
function renderSocial(){const B=$('bagBody');const list=npcs.filter(n=>PEOPLE[n.def.id]);$('bagSub').textContent='Talk every day. Two gifts a week. Hearts open new scenes.';
  B.innerHTML='<div class="soc">'+list.map(n=>{const id=n.def.id,hh=hearts(id),max=HEART_MAX();return `<div class="p" data-id="${id}"><canvas width="40" height="40"></canvas><div style="flex:1"><b>${n.def.name}</b>
    <div class="h">${'♥'.repeat(hh)}<i>${'♥'.repeat(Math.max(0,max-hh))}</i></div><small>${n.def.role}</small><span class="tk">${S.talkedToday[id]===S.day?'✓ talked today ':''}${(S.giftsWeek&&S.giftsWeek[id]||0)?`🎁 ${S.giftsWeek[id]}/2 this week`:''}</span></div></div>`;}).join('')+'</div><div id="socInfo" style="margin-top:8px;font-size:13px"></div>';
  B.querySelectorAll('.p').forEach(p=>{headIcon(p.dataset.id,p.querySelector('canvas'));p.addEventListener('click',()=>{const id=p.dataset.id,P2=PEOPLE[id];const nx=(P2.events||[]).find(e=>!S.heartSeen[id+e.h]);
    $('socInfo').innerHTML=`<b>${npcById(id).def.name}</b> loves ${P2.loves.map(k=>GIFTS[k]||k).join(', ')}; likes ${P2.likes.map(k=>GIFTS[k]||k).join(', ')}; hates ${P2.hates.map(k=>GIFTS[k]||k).join(', ')}.${nx?` Something will happen at ${nx.h} hearts.`:' You know everything they are willing to tell.'}`;});});
  $('bag').hidden=false;}
// ---- Map: the valley, painted from the terrain itself, with the places named and a blinking mark where you are
const MAP_PLACES=[['Hollow Acre',0,-4],['Marrow Hollow',48,-11],['Market Lane',48,16.5],['Church',48,-21],['Graveyard',60,-31],['Route 9',-62,-8],['Pruitt’s Garage',-36,-14],['The pond',-30,25],['Covered bridge',BRIDGE.x,BRIDGE.z-2],['The corn',-2,18],['Abernathy house',-46,-13],['Feed barn',65.5,10]];
let MAP_CV=null;
function buildMapCanvas(){const s=3;const W=Math.round((B.x1-B.x0)*s),H=Math.round((B.z1-B.z0)*s);const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const img=g.createImageData(W,H);const put=(x,y,col)=>{const i=(y*W+x)*4;img.data[i]=col[0];img.data[i+1]=col[1];img.data[i+2]=col[2];img.data[i+3]=255;};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wx=B.x0+x/s,wz=B.z0+y/s;let col=[86,128,62];const n=hash(Math.floor(wx*2),Math.floor(wz*2));
    if(LAYERS.dark&&LAYERS.dark(wx,wz))col=[40,64,36];if(LAYERS.dirt(wx,wz))col=[176,134,82];if(LAYERS.stone(wx,wz))col=[150,146,140];if(LAYERS.water(wx,wz))col=[70,120,176];
    if(wx>CORN.x0&&wx<CORN.x1&&wz>CORN.z0&&wz<CORN.z1)col=[200,168,72];
    if(n>.8)col=col.map(v=>Math.min(255,v+10));else if(n<.2)col=col.map(v=>v-8);put(x,y,col);}
  g.putImageData(img,0,0);
  for(const o of OBJ){if(o.room)continue;const X=(o.x-B.x0)*s,Y=(o.z-B.z0)*s;
    if(o.kind==='tree'||o.kind==='pine'){g.fillStyle='#2a4a22';g.fillRect(X-2,Y-3,4,4);g.fillStyle='#3e6a2e';g.fillRect(X-1,Y-3,2,2);}
    else if(o.kind==='bld'){const m=SPR[o.spr];const f=m&&m.foot;if(!f)continue;const x0=X+f[0]*s,x1=X+f[2]*s,y0=Y+(f[1]-1.2)*s,y1=Y;g.fillStyle='#2a1810';g.fillRect(x0-1,y0-1,x1-x0+2,y1-y0+2);g.fillStyle='#8a3a2a';g.fillRect(x0,y0,x1-x0,(y1-y0)*.6);g.fillStyle='#c8a878';g.fillRect(x0,y0+(y1-y0)*.6,x1-x0,(y1-y0)*.4);}
    else if(o.kind==='fence'){g.fillStyle='#6a4a2a';g.fillRect(X,Y,2,1);}}
  return c;}
function renderMap(){const B2=$('bagBody');$('bagSub').textContent=S.room?'You are indoors.':'Where you are now blinks.';if(!MAP_CV)MAP_CV=buildMapCanvas();
  B2.innerHTML='<div id="mapWrap"><canvas id="mapCv"></canvas></div>';const cv=$('mapCv');cv.width=MAP_CV.width;cv.height=MAP_CV.height;cv.getContext('2d').drawImage(MAP_CV,0,0);
  const wrap=$('mapWrap');const pct=(x,z)=>[((x-B.x0)/(B.x1-B.x0))*100,((z-B.z0)/(B.z1-B.z0))*100];
  for(const [n,x,z] of MAP_PLACES){const [l,t]=pct(x,z);const d=document.createElement('div');d.className='lbl';d.style.left=l+'%';d.style.top=t+'%';d.textContent=n;wrap.appendChild(d);}
  let px=P.x,pz=P.z;const R=roomOf&&roomOf();if(R&&R.out){px=R.out.x;pz=R.out.z;}const [l,t]=pct(px,pz);const y=document.createElement('div');y.className='you';y.style.left=l+'%';y.style.top=t+'%';wrap.appendChild(y);
  $('bag').hidden=false;requestAnimationFrame(()=>{wrap.scrollLeft=(l/100)*wrap.scrollWidth-wrap.clientWidth/2;wrap.scrollTop=(t/100)*wrap.scrollHeight-wrap.clientHeight/2;});}
const HEART_MAX=()=>Math.round(FRIEND_MAX/100);
addEventListener('keydown',e=>{if(S.mode!=='play')return;if(e.code==='KeyM'&&!S.paused){openBag('map');e.preventDefault();}if((e.code==='KeyE'||e.code==='Tab')&&!S.paused){openBag('items');e.preventDefault();}});
{const bb=$('btnBag');if(bb)bb.textContent='Menu';}
