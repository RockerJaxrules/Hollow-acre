/* ================= the shipping bin: put things in by dragging or tapping; they go on the truck overnight, and in the morning a slip
   says what sold and for how much (Stardew-style). Until nightfall you can take things back out. ================= */
S.ship=S.ship||[];
// what the bin pays for things that aren't produce (produce keeps the value it was harvested with: a full moon doubles it)
const SELL={wood:1,stone:1,fiber:1,coal:6,copper:5,iron:9,copper_bar:30,iron_bar:48,gem:40,milk:14,fert:3,bread:10,stew:18,soup:24,egg_fried:16,pie:48,chowder:56,hash:80,glowstew:34};
const SHIP_CAT={turnip:'Crops',pumpkin:'Crops',corn:'Crops',egg:'Animal goods',milk:'Animal goods',fish:'Fish',mushroom:'Forage',
  wood:'Materials',stone:'Materials',fiber:'Materials',fert:'Materials',coal:'Minerals',copper:'Minerals',iron:'Minerals',copper_bar:'Minerals',iron_bar:'Minerals',gem:'Minerals'};
const SHIP_ORDER=['Crops','Animal goods','Fish','Forage','Cooking','Minerals','Materials','Other'];
const shipCat=id=>SHIP_CAT[id]||(ITEMS[id]&&ITEMS[id].food?'Cooking':'Other');
const sellPrice=id=>(ITEMS[id]&&ITEMS[id].sell)||SELL[id]||0;
const shipName=(t,id)=>t==='P'?(PRODUCE_NAMES[id]||id):((ITEMS[id]||{name:id}).name);
const shipIcon=(t,id)=>t==='P'?id:((ITEMS[id]&&ITEMS[id].icon)||id);
function sellables(){const out=[],kinds={};for(const b of S.basket)(kinds[b.kind]=kinds[b.kind]||[]).push(b.value);
  for(const [k,vs] of Object.entries(kinds))out.push({t:'P',id:k,n:vs.length,each:Math.round(vs.reduce((a,b)=>a+b,0)/vs.length)});
  for(const k of Object.keys(S.inv||{})){const n=inv(k),p=sellPrice(k);if(n>0&&p>0)out.push({t:'I',id:k,n,each:p});}
  return out.sort((a,b)=>SHIP_ORDER.indexOf(shipCat(a.id))-SHIP_ORDER.indexOf(shipCat(b.id)));}
function binGroups(list){const g={};for(const e of list||S.ship){const key=e.t+':'+e.id;(g[key]=g[key]||{t:e.t,id:e.id,n:0,v:0}).n++;g[key].v+=e.value;}return Object.values(g);}
function shipPut(t,id,all){let n=0;do{if(t==='P'){const i=S.basket.findIndex(b=>b.kind===id);if(i<0)break;const b=S.basket.splice(i,1)[0];S.ship.push({t,id,value:b.value});}
    else{if(inv(id)<=0)break;takeInv(id,1);S.ship.push({t,id,value:sellPrice(id)});}n++;S.shipped++;}while(all);
  if(n){SFX.harvest&&SFX.harvest();updateHud&&updateHud();}return n;}
function shipTake(t,id,all){let n=0;do{const i=S.ship.findIndex(e=>e.t===t&&e.id===id);if(i<0)break;const e=S.ship.splice(i,1)[0];
    if(t==='P')S.basket.push({kind:id,value:e.value});else addInv(id,1);S.shipped=Math.max(0,S.shipped-1);n++;}while(all);
  if(n){SFX.page&&SFX.page();updateHud&&updateHud();}return n;}

// ---- the bin's panel
{const css=document.createElement('style');css.textContent=`
#shipBin .sbcols{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:620px){#shipBin .sbcols{grid-template-columns:1fr}}
#shipBin h3,#saleSlip h3{font-family:var(--font-display);font-weight:400;margin:6px 0;font-size:16px;color:var(--ember)}
#shipBin .sbgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(64px,1fr));gap:4px;min-height:84px;padding:6px;background:rgba(0,0,0,.22);box-shadow:inset 0 0 0 2px rgba(0,0,0,.35)}
#shipBin .sbbin{background:repeating-linear-gradient(90deg,rgba(124,82,46,.35) 0 14px,rgba(84,52,28,.35) 14px 16px);box-shadow:inset 0 0 0 2px #5a3416,inset 0 0 0 4px rgba(0,0,0,.3)}
#shipBin .sbbin.over{box-shadow:inset 0 0 0 2px #f0c060,inset 0 0 0 4px rgba(240,192,96,.35)}
#shipBin .sbit{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:4px 2px;border:0;background:rgba(233,223,198,.06);color:var(--bone);font:inherit;font-size:11px;cursor:grab;touch-action:none;user-select:none}
#shipBin .sbit:hover{background:rgba(240,192,96,.16)}#shipBin .sbit img{width:32px;height:32px;image-rendering:pixelated;pointer-events:none}
#shipBin .sbit b{position:absolute;right:4px;top:22px;font-size:12px;color:#fff;text-shadow:1px 1px 0 #000}#shipBin .sbit i{font-style:normal;color:#f0c060;font-size:10px}
#shipBin .sbit span{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#shipBin .sbempty{grid-column:1/-1;opacity:.6;font-size:12px;padding:8px}
#shipBin .sbtotal{margin:8px 0 0;font-size:14px}#shipBin .sbtotal b{color:#f0c060}#shipBin .sbhint{margin:4px 0 0;font-size:11px;opacity:.7}
#sbGhost{position:fixed;z-index:200;width:40px;height:40px;image-rendering:pixelated;pointer-events:none;transform:translate(-50%,-50%);filter:drop-shadow(2px 2px 0 rgba(0,0,0,.5))}
#saleSlip{z-index:70}#saleSlip .slip{background:#efe2c2;color:#3a2814;padding:10px 14px;box-shadow:inset 0 0 0 2px #c9b48a,3px 3px 0 rgba(0,0,0,.35);font-size:14px}
#saleSlip .scat{display:flex;justify-content:space-between;margin:8px 0 2px;padding-bottom:2px;border-bottom:1px dashed #b49a6a;font-weight:600;color:#7a4a16}
#saleSlip .srow{display:grid;grid-template-columns:28px 1fr 46px 56px;align-items:center;gap:6px;opacity:0;animation:srow .25s forwards}
#saleSlip .srow img{width:24px;height:24px;image-rendering:pixelated}#saleSlip .sq{text-align:right;opacity:.75}#saleSlip .sv{text-align:right}
#saleSlip .stot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;font-size:20px;color:#f0c060}
#saleSlip .coin{display:inline-block;width:12px;height:12px;border-radius:50%;background:#f0c060;box-shadow:inset -2px -2px 0 #b07a20;margin-right:6px;vertical-align:middle}
#saleSlip .teeth{color:#a01010}@keyframes srow{to{opacity:1}}`;document.head.appendChild(css);}
{const el=document.createElement('div');el.className='sheet';el.id='shipBin';el.hidden=true;
  el.innerHTML=`<h2>Shipping bin</h2><p class="sub">Everything in the bin goes on the truck tonight. You’re paid in the morning.</p>
    <div class="sbcols"><div><h3>Yours</h3><div class="sbgrid" id="sbHave"></div></div><div><h3>In the bin</h3><div class="sbgrid sbbin" id="sbBin"></div></div></div>
    <p class="sbtotal" id="sbTotal"></p><p class="sbhint" id="sbHint"></p><div class="acts"><button class="close" id="sbCrops">Ship all crops</button><button class="close hot" id="sbDone">Done</button></div>`;
  document.body.appendChild(el);
  const s=document.createElement('div');s.className='sheet';s.id='saleSlip';s.hidden=true;document.body.appendChild(s);}
function renderBin(){const cell=(r,inBin)=>`<button class="sbit" data-t="${r.t}" data-id="${r.id}" data-bin="${inBin?1:0}" title="${shipName(r.t,r.id)}"><img src="${iconOf(shipIcon(r.t,r.id))}" alt=""><b>${r.n>1?r.n:''}</b><span>${shipName(r.t,r.id)}</span><i>${inBin?r.v+' coins':r.each+' each'}</i></button>`;
  const have=sellables(),bin=binGroups();
  $('sbHave').innerHTML=have.map(r=>cell(r,false)).join('')||'<div class="sbempty">Nothing to sell. Crops, fish, eggs, milk, ore, bars and cooked food all go in here.</div>';
  $('sbBin').innerHTML=bin.map(r=>cell(r,true)).join('')||'<div class="sbempty">Empty. Drag things in here.</div>';
  const tot=S.ship.reduce((a,e)=>a+e.value,0);$('sbTotal').innerHTML=S.ship.length?`In the bin: ${S.ship.length} thing${S.ship.length>1?'s':''}, about <b>${tot} coins</b> in the morning.`:'The bin is empty.';
  $('sbCrops').disabled=!S.basket.length;
  $('sbHint').textContent=matchMedia('(pointer:fine)').matches?'Click to put one in. Shift-click, or drag it across, to put in the whole stack. Click something in the bin to take it back out.':'Tap to put one in. Drag a stack across to put it all in. Tap something in the bin to take it back out.';}
function openShipBin(){S.paused=true;renderBin();$('shipBin').hidden=false;}
function closeShipBin(){$('shipBin').hidden=true;S.paused=false;const g=$('sbGhost');if(g)g.remove();}
$('sbDone').addEventListener('click',closeShipBin);
$('sbCrops').addEventListener('click',()=>{for(const k of [...new Set(S.basket.map(b=>b.kind))])shipPut('P',k,true);renderBin();});
addEventListener('keydown',e=>{if($('shipBin').hidden)return;if(e.code==='Escape'||e.code==='Tab'){e.preventDefault();e.stopImmediatePropagation();closeShipBin();}},true);
// tap = one, shift = all, drag across = all
{let dr=null;const ghost=()=>{let g=$('sbGhost');if(!g){g=document.createElement('img');g.id='sbGhost';document.body.appendChild(g);}return g;};
  const over=(x,y,toBin)=>{const t=$(toBin?'sbBin':'sbHave').getBoundingClientRect();return x>=t.left&&x<=t.right&&y>=t.top&&y<=t.bottom;};
  $('shipBin').addEventListener('pointerdown',e=>{const c=e.target.closest&&e.target.closest('.sbit');if(!c)return;e.preventDefault();dr={c,x:e.clientX,y:e.clientY,moved:false,id:e.pointerId,shift:e.shiftKey};try{c.setPointerCapture(e.pointerId);}catch(_){}});
  $('shipBin').addEventListener('pointermove',e=>{if(!dr||e.pointerId!==dr.id)return;if(!dr.moved&&Math.hypot(e.clientX-dr.x,e.clientY-dr.y)>8){dr.moved=true;const g=ghost();g.src=dr.c.querySelector('img').src;}
    if(dr.moved){const g=ghost();g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';const toBin=dr.c.dataset.bin!=='1';$('sbBin').classList.toggle('over',toBin&&over(e.clientX,e.clientY,true));}});
  const up=e=>{if(!dr||e.pointerId!==dr.id)return;const {c,moved,shift}=dr;dr=null;const g=$('sbGhost');if(g)g.remove();$('sbBin').classList.remove('over');
    const t=c.dataset.t,id=c.dataset.id,inBin=c.dataset.bin==='1';
    if(moved){if(!inBin&&over(e.clientX,e.clientY,true))shipPut(t,id,true);else if(inBin&&over(e.clientX,e.clientY,false))shipTake(t,id,true);}
    else{if(inBin)shipTake(t,id,shift);else shipPut(t,id,shift);}
    renderBin();};
  $('shipBin').addEventListener('pointerup',up);$('shipBin').addEventListener('pointercancel',e=>{if(dr&&e.pointerId===dr.id){dr=null;const g=$('sbGhost');if(g)g.remove();}});}
// the bin itself opens the panel (empty or not)
{const bin=interact.find(e=>e.x===binPos.x&&e.z===binPos.z);if(bin){bin.label=()=>S.ship.length?`Bin (${S.ship.length})`:'Shipping bin';bin.ok=()=>true;bin.act=function(){openShipBin();};}}

// ---- overnight: the truck takes it, and the morning slip
function showSale(sold,total,day){const groups=binGroups(sold),cats={};for(const r of groups)(cats[shipCat(r.id)]=cats[shipCat(r.id)]||[]).push(r);
  const horror=typeof tierOf==='function'&&typeof M!=='undefined'&&tierOf(M.v)>=3;let k=0,first=true;
  let h=`<h2>Sold overnight</h2><p class="sub">The truck came in the night. The bin is empty and swept, and a slip is pinned inside the lid for day ${day}:</p><div class="slip">`;
  for(const c of SHIP_ORDER){if(!cats[c])continue;const sub=cats[c].reduce((a,r)=>a+r.v,0);h+=`<div class="scat"><span>${c}</span><span>${sub}</span></div>`;
    for(const r of cats[c].sort((a,b)=>b.v-a.v)){h+=`<div class="srow" style="animation-delay:${.15+k*.12}s"><img src="${iconOf(shipIcon(r.t,r.id))}" alt=""><span class="sn${horror&&first?' teeth':''}" data-real="${shipName(r.t,r.id)}">${horror&&first?'Teeth':shipName(r.t,r.id)}</span><span class="sq">×${r.n}</span><span class="sv">${r.v}</span></div>`;k++;first=false;}}
  h+=`</div><div class="stot"><span>Total</span><span><span class="coin"></span><span id="saleTot">0</span> coins</span></div><div class="acts"><button class="close hot" id="saleOk">Good</button></div>`;
  const s=$('saleSlip');s.innerHTML=h;s.hidden=false;S.paused=true;
  const t0=performance.now(),dur=Math.min(1600,400+k*150);const tick=()=>{const f=Math.min(1,(performance.now()-t0)/dur);$('saleTot').textContent=Math.round(total*f*f*(3-2*f));if(f<1)requestAnimationFrame(tick);else SFX.coin&&SFX.coin();};requestAnimationFrame(tick);
  if(horror)setTimeout(()=>{const n=s.querySelector('.teeth');if(n){n.textContent=n.dataset.real;n.classList.remove('teeth');}},1300);
  $('saleOk').addEventListener('click',()=>{s.hidden=true;S.paused=!$('note').hidden;});}
{const _nd=newDay;newDay=function(m,p){const sold=S.ship.slice();S.ship=[];_nd(m,p);if(!sold.length)return;const total=sold.reduce((a,e)=>a+e.value,0);S.coins+=total;updateHud&&updateHud();
  const day=S.day-1;setTimeout(()=>showSale(sold,total,day),700);};}
addEventListener('keydown',e=>{const s=$('saleSlip');if(!s||s.hidden)return;if(e.code==='Escape'||e.code==='Enter'||e.code==='Space'||e.code==='Tab'){e.preventDefault();e.stopImmediatePropagation();s.hidden=true;S.paused=!$('note').hidden;}},true);

// ---- what's waiting in the bin peeks over its rim
const SB_IMG={};function sbImg(key){if(!SB_IMG[key]){const im=new Image();im.src=iconOf(key);SB_IMG[key]=im;}return SB_IMG[key];}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room||!S.ship.length)return;const kinds=[...new Set(S.ship.map(e=>shipIcon(e.t,e.id)))].slice(0,3);
  D.push({z:binPos.z+.02,mind:1,draw(){const X=Math.round(sx(binPos.x)),Y=Math.round(sz(binPos.z));kinds.forEach((k,i)=>{const im=sbImg(k);if(im.complete&&im.naturalWidth)ctx2.drawImage(im,X-14+i*9,Y-31-(i===1?2:0),16,16);});}});};}
