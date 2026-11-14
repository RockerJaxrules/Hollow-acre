/* ================= skills (Stardew-style): farming, foraging, mining, fishing and combat each level 1-10 from the work you do, and each
   level gives you something. XP is counted from what your work produces (crops in the basket, wood, stone and ore in the bag, fish caught,
   creatures killed), and only while you're playing: nothing bought, crafted, gifted or taken back out of the bin counts. ================= */
S.skills=S.skills||{farming:0,foraging:0,mining:0,fishing:0,combat:0};S.prof=S.prof||{};S.skPending=S.skPending||[];
if(typeof PERSONAL!=='undefined')for(const k of ['skills','prof','skPending'])if(!PERSONAL.includes(k))PERSONAL.push(k);
const SK_LV=[0,30,90,180,320,500,750,1050,1450,1950,2600];
// every level gives a little; at 5 and at 10 you choose a profession (Stardew-style)
const SKILLS={
  farming:{name:'Farming',icon:'turnip',every:'Crops are worth 2% more.',perks:{3:'Hoe and watering can cost 1 less energy.',8:'Hoe and watering can cost 2 less energy.'},
    p5:[['rancher','Rancher','Eggs and milk are worth 25% more.'],['tiller','Tiller','Crops are worth 10% more.']],
    p10:[['agri','Agriculturist','Crops grow 10% faster.'],['harvester','Harvester','20% chance of a second crop at harvest.']]},
  foraging:{name:'Foraging',icon:'wood',perks:{3:'The axe costs 1 less energy.',8:'The axe costs 2 less energy.'},
    p5:[['forester','Forester','25% more wood from everything you chop.'],['gatherer','Gatherer','20% chance of double glowcaps and fibre.']],
    p10:[['lumberjack','Lumberjack','Felled trees sometimes leave hollow-glass in the roots.'],['botanist','Botanist','Glowcaps are worth three times as much.']]},
  mining:{name:'Mining',icon:'copper',perks:{3:'The pickaxe costs 1 less energy.',8:'The pickaxe costs 2 less energy.'},
    p5:[['miner','Miner','A third of the time, a vein gives one more ore or stone.'],['geologist','Geologist','Ore sometimes has hollow-glass inside.']],
    p10:[['blacksmith','Blacksmith','Copper and iron bars sell for 50% more.'],['excavator','Excavator','The pickaxe costs 1 less energy again.']]},
  fishing:{name:'Fishing',icon:'fish',every:'Fish are worth 3% more, and your line takes a little more strain.',perks:{3:'Casting costs 1 less energy.'},
    p5:[['fisher','Fisher','Fish are worth 25% more.'],['trapper','Trapper','Fish bite twice as fast.']],
    p10:[['angler','Angler','Fish are worth 50% more.'],['steady','Steady hand','Your line takes much more strain before it snaps.']]},
  combat:{name:'Combat',icon:'blade',every:'+5 max health.',perks:{},
    p5:[['fighter','Fighter','+15 max health.'],['scout','Scout','Every kill heals you.']],
    p10:[['brute','Brute','+25 max health.'],['warden','Warden','Your lantern burns the creature twice as fast.']]}};
const skLvl=k=>{const x=(S.skills&&S.skills[k])||0;let l=0;while(l<10&&x>=SK_LV[l+1])l++;return l;};
const hasProf=id=>!!(S.prof&&Object.values(S.prof).some(v=>v===id));
const profOf=(k,l)=>S.prof&&S.prof[k+l];
const SK_FLOAT=[];
function addXP(k,n){if(!n||!S.skills)return;const before=skLvl(k);S.skills[k]=(S.skills[k]||0)+n;const after=skLvl(k);if(after>before)for(let l=before+1;l<=after;l++)levelUp(k,l);}
// during the day: a mark over your head; the full level-up (and any choice) comes in the morning, when you've slept on it
function levelUp(k,l){const D=SKILLS[k];if(k==='combat'){S.hpMax+=5;S.hp=Math.min(S.hpMax,S.hp+5);}
  SK_FLOAT.push({t:0,text:`${D.name} ${l}!`});SFX.bell&&SFX.bell();S.skPending.push([k,l]);
  setTimeout(()=>toast(l===5||l===10?`${D.name} level ${l}. Sleep on it: in the morning you choose a profession.`:`${D.name} level ${l}. More in the morning.`,2.6),200);}
function applyProf(id){if(id==='fighter'){S.hpMax+=15;S.hp=Math.min(S.hpMax,S.hp+15);}if(id==='brute'){S.hpMax+=25;S.hp=Math.min(S.hpMax,S.hp+25);}}
// ---- the morning level-up screen
{const css=document.createElement('style');css.textContent=`#lvlUp{z-index:72}#lvlUp .lv{display:flex;align-items:center;gap:12px;margin:6px 0 10px}#lvlUp .lv img{width:48px;height:48px;image-rendering:pixelated}
  #lvlUp .lv b{font-size:22px;color:#ffd27a;font-weight:400}#lvlUp ul{margin:4px 0 8px;padding-left:18px}#lvlUp .profs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
  #lvlUp .prof{font:inherit;color:var(--bone);text-align:left;padding:12px;background:rgba(0,0,0,.25);border:0;box-shadow:inset 0 0 0 2px #5a3416;cursor:pointer}
  #lvlUp .prof:hover,#lvlUp .prof:focus{box-shadow:inset 0 0 0 2px #f0c060;background:rgba(240,192,96,.12)}#lvlUp .prof b{display:block;font-size:17px;color:#ffd27a;font-weight:400;margin-bottom:4px}
  #lvlUp .prof span{font-size:13px}@media (max-width:560px){#lvlUp .profs{grid-template-columns:1fr}}`;document.head.appendChild(css);
  const el=document.createElement('div');el.className='sheet';el.id='lvlUp';el.hidden=true;document.body.appendChild(el);}
function showLevelUps(){const el=$('lvlUp');if(!S.skPending.length||!el.hidden)return;
  if(['saleSlip','shipBin'].some(id=>$(id)&&!$(id).hidden)){setTimeout(showLevelUps,350);return;}
  const [k,l]=S.skPending[0],D=SKILLS[k];const gained=[];if(D.every)gained.push(D.every);if(D.perks[l])gained.push(D.perks[l]);
  let h=`<h2>Level up</h2><div class="lv"><img src="${iconOf(D.icon)}" alt=""><div><b>${D.name} ${l}</b><div class="sub">You’re getting good at this.</div></div></div>`;
  if(gained.length)h+=`<ul>${gained.map(g=>`<li>${g}</li>`).join('')}</ul>`;
  const choice=l===5?D.p5:l===10?D.p10:null;
  if(choice){h+=`<p class="sub">Choose a profession. It’s for good.</p><div class="profs">${choice.map(([id,n,d])=>`<button class="prof" data-p="${id}"><b>${n}</b><span>${d}</span></button>`).join('')}</div>`;}
  else h+=`<div class="acts"><button class="close hot" id="lvlOk">Good</button></div>`;
  el.innerHTML=h;el.hidden=false;S.paused=true;
  const next=()=>{S.skPending.shift();el.hidden=true;S.paused=!$('note').hidden;if(S.skPending.length)setTimeout(showLevelUps,250);};
  if(choice)el.querySelectorAll('.prof').forEach(b=>b.addEventListener('click',()=>{S.prof[k+l]=b.dataset.p;applyProf(b.dataset.p);SFX.coin&&SFX.coin();toast(`You’re a ${choice.find(c=>c[0]===b.dataset.p)[1]} now.`,2);next();}));
  else $('lvlOk').addEventListener('click',next);}
{const _nd=newDay;newDay=function(m,p){_nd(m,p);if(S.skPending&&S.skPending.length)setTimeout(showLevelUps,800);};}
addEventListener('keydown',e=>{const el=$('lvlUp');if(!el||el.hidden)return;if(el.querySelector('.prof'))return;if(e.code==='Enter'||e.code==='Space'||e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();$('lvlOk')&&$('lvlOk').click();}},true);
// ---- the watcher
const SKW={primed:false,inv:{},fish:0,eggs:0};
const SK_INV={wood:['foraging',1.5],fiber:['foraging',1],stone:['mining',1],coal:['mining',2],copper:['mining',3],iron:['mining',5],gem:['mining',10],milk:['farming',3]};
const SK_CROP={turnip:6,pumpkin:10,corn:12};
const skBusy=()=>S.paused||S.mode!=='play'||[...document.querySelectorAll('.sheet')].some(s=>!s.hidden)||(typeof $==='function'&&$('note')&&!$('note').hidden);
function skPrime(){for(const b of S.basket)b._sk=1;for(const k in SK_INV)SKW.inv[k]=inv(k);SKW.fish=S.fishCaught||0;SKW.primed=true;}
function skTick(){if(!S.skills)return;if(S.mode!==SKW.mode){SKW.mode=S.mode;SKW.primed=false;}if(!SKW.primed||S.mode!=='play'){skPrime();return;}const quiet=skBusy();
  // the basket: crops, fish, eggs and glowcaps, each counted once
  for(let i=0;i<S.basket.length;i++){const b=S.basket[i];if(b._sk)continue;b._sk=1;if(quiet)continue;
    if(SK_CROP[b.kind]){const L=skLvl('farming');b.value=Math.round(b.value*(1+.02*L)*(hasProf('tiller')?1.1:1));addXP('farming',SK_CROP[b.kind]);
      if(hasProf('harvester')&&rand()<.2){S.basket.push({kind:b.kind,value:b.value,_sk:1});toast(`Two ${(PRODUCE_NAMES[b.kind]||b.kind).toLowerCase()}s from one plant.`,1.6);}}
    else if(b.kind==='fish'){const L=skLvl('fishing');b.value=Math.round(b.value*(1+.03*L)*(hasProf('fisher')?1.25:1)*(hasProf('angler')?1.5:1));}
    else if(b.kind==='egg'){addXP('farming',2);if(hasProf('rancher'))b.value=Math.round(b.value*1.25);}
    else if(b.kind==='mushroom'){addXP('foraging',5);if(hasProf('botanist'))b.value*=3;if(hasProf('gatherer')&&rand()<.2){S.basket.push({kind:'mushroom',value:b.value,_sk:1});}}}
  // the bag: wood, stone and ore you've won from the ground
  for(const [k,[sk,xp]] of Object.entries(SK_INV)){const now=inv(k),d=now-(SKW.inv[k]||0);SKW.inv[k]=now;if(d<=0||quiet)continue;addXP(sk,Math.round(d*xp));
    if(k==='wood'){if(hasProf('forester')){const x=Math.max(rand()<.5?1:0,Math.round(d*.25));if(x){addInv('wood',x);SKW.inv.wood+=x;}}
      if(hasProf('lumberjack')&&d>=3&&rand()<.1){addInv('gem',1);SKW.inv.gem=inv('gem');toast('Something glints in the roots: hollow-glass.',2);}}
    if(k==='fiber'&&hasProf('gatherer')&&rand()<.2){addInv('fiber',d);SKW.inv.fiber+=d;}
    if(sk==='mining'&&k!=='gem'){if(hasProf('miner')&&rand()<.33){addInv(k,1);SKW.inv[k]++;}if(hasProf('geologist')&&k!=='stone'&&rand()<.1){addInv('gem',1);SKW.inv.gem=inv('gem');toast('There’s hollow-glass in the ore.',2);}}}
  // fish caught
  const f=S.fishCaught||0;if(f>SKW.fish&&!quiet)addXP('fishing',8*(f-SKW.fish));SKW.fish=f;
  // the line gets stronger with fishing (fish3.js); a trapper's fish bite sooner
  if(typeof MG!=='undefined'){if(MG.on&&!MG._sk){MG._sk=1;const L=skLvl('fishing');MG.size=Math.min(.55,MG.size+L*.006+(hasProf('steady')?.09:0));}if(!MG.on)MG._sk=0;}
  if(typeof fish!=='undefined'){if(fish.state==='wait'&&!fish._tp){fish._tp=1;if(hasProf('trapper'))fish.t*=.5;}if(fish.state!=='wait')fish._tp=0;}}
// what the professions change elsewhere: crops grow faster, the lantern burns harder, milk and bars ship for more
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play')return;
  if(hasProf('agri'))for(const t of tiles){const c=t.crop;if(c&&c.watered&&c.stage<3)c.growth+=dt*TIME_K()*.1;}
  if(hasProf('warden')&&typeof H!=='undefined'&&H.lit&&H.state!=='gone')H.burn+=dt;};}
if(typeof shipPut==='function'){const _shp=shipPut;shipPut=function(t,id,all){const n=_shp.apply(this,arguments);for(const e of S.ship){if(e._pr)continue;e._pr=1;
  if(id==='milk'&&e.id==='milk'&&hasProf('rancher'))e.value=Math.round(e.value*1.25);if((e.id==='copper_bar'||e.id==='iron_bar')&&hasProf('blacksmith'))e.value=Math.round(e.value*1.5);}return n;};}
setInterval(skTick,200);
{const _lg=loadGame;loadGame=function(d){_lg(d);S.skills=Object.assign({farming:0,foraging:0,mining:0,fishing:0,combat:0},S.skills||{});S.prof=S.prof||{};S.skPending=S.skPending||[];SKW.primed=false;if(S.skPending.length)setTimeout(showLevelUps,1500);};}
// tilling and watering, and kills in the mine
{const _t=doTill;doTill=function(t){addXP('farming',1);return _t.apply(this,arguments);};}
{const _w=waterSoil;waterSoil=function(t){if(S.water>0&&t&&t.tilled&&!t.wet)addXP('farming',1);return _w.apply(this,arguments);};}
{const _mu=mineUpdate;mineUpdate=function(dt){if(typeof MINE!=='undefined')for(const m of MINE.mobs||[])if(m.dead&&!m._sk){m._sk=1;addXP('combat',8);if(hasProf('scout'))S.hp=Math.min(S.hpMax,S.hp+10);}return _mu(dt);};}
// tools cost less energy as you get better with them
{const _sp=spend;spend=function(n){const k=typeof heldKind==='function'?heldKind():null;const sk={hoe:'farming',can:'farming',axe:'foraging',pick:'mining',rod:'fishing'}[k];
  if(sk&&n>1){const L=skLvl(sk);n=Math.max(1,n-(L>=8&&sk!=='fishing'?2:L>=3?1:0)-(sk==='mining'&&hasProf('excavator')?1:0));}return _sp(n);};}

// ---- the level-up mark: gold pixel letters that rise off your head and fade (drawn over the world, so the light doesn't dim it)
{const css=document.createElement('style');css.textContent=`.skfloat{position:fixed;z-index:40;pointer-events:none;transform:translate(-50%,-100%);font-family:'Hollow Pixel',monospace;font-size:20px;color:#ffd27a;white-space:nowrap;
  text-shadow:2px 0 #1a0e06,-2px 0 #1a0e06,0 2px #1a0e06,0 -2px #1a0e06,2px 2px #1a0e06,0 0 10px rgba(255,200,90,.6);animation:skf 2.6s ease-out forwards}
  .skfloat small{display:block;text-align:center;font-size:12px;color:#fff4c0}@keyframes skf{0%{opacity:0;margin-top:8px}12%{opacity:1;margin-top:0}75%{opacity:1}100%{opacity:0;margin-top:-34px}}`;document.head.appendChild(css);}
setInterval(()=>{if(!SK_FLOAT.length)return;const f=SK_FLOAT.shift();const r=view.getBoundingClientRect();const x=r.left+sx(P.x)*r.width/VW,y=r.top+(sz(P.z)-58)*r.height/VH;
  const d=document.createElement('div');d.className='skfloat';d.innerHTML=`${f.text}<small>level up</small>`;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),2700);},250);
// ---- the Skills tab in the menu
{const css=document.createElement('style');css.textContent=`#bag .skl{display:grid;grid-template-columns:40px 1fr;gap:6px 10px;align-items:center;margin:8px 0;padding:8px;background:rgba(0,0,0,.18)}
  #bag .skl img{width:36px;height:36px;image-rendering:pixelated}#bag .skl .nm{display:flex;justify-content:space-between;font-size:15px}#bag .skl .nm b{color:#ffd27a;font-weight:400}
  #bag .skl .pips{display:flex;gap:3px;margin:4px 0 2px}#bag .skl .pips i{flex:1;height:9px;background:#3a2414;box-shadow:inset 0 0 0 1px #1a0e06}#bag .skl .pips i.on{background:#e8a040;box-shadow:inset 0 0 0 1px #8a5020,inset 0 2px 0 #ffd27a}
  #bag .skl .pips i.part{background:linear-gradient(90deg,#b07a30 var(--p),#3a2414 var(--p))}#bag .skl .xp{font-size:11px;opacity:.7}
  #bag .skl ul{grid-column:2;margin:2px 0 0;padding-left:16px;font-size:12px}#bag .skl li.got{color:#bfe0a0}#bag .skl li b{color:#ffd27a;font-weight:400}#bag .skl li{opacity:.85}`;document.head.appendChild(css);}
function renderSkills(){$('bagSub').textContent='You get better at what you do. At level 5 and level 10 you choose a profession.';let h='';
  for(const [k,D] of Object.entries(SKILLS)){const L=skLvl(k),x=S.skills[k]||0,lo=SK_LV[L],hi=SK_LV[Math.min(10,L+1)],p=L>=10?1:(x-lo)/(hi-lo);
    const pips=Array.from({length:10},(_,i)=>i<L?'<i class="on"></i>':i===L&&L<10?`<i class="part" style="--p:${Math.round(p*100)}%"></i>`:'<i></i>').join('');
    const pr=lv=>{const c=profOf(k,lv),opts=D['p'+lv];if(c){const o=opts.find(q=>q[0]===c);return `<li class="got">Level ${lv}: <b>${o[1]}</b>. ${o[2]}</li>`;}return `<li>Level ${lv}: choose ${opts.map(o=>o[1]).join(' or ')}.</li>`;};
    const perks=(D.every?`<li class="${L>=1?'got':''}">Every level: ${D.every}</li>`:'')+Object.entries(D.perks).filter(([lv])=>+lv<5).map(([lv,t])=>`<li class="${L>=+lv?'got':''}">Level ${lv}: ${t}</li>`).join('')+pr(5)+Object.entries(D.perks).filter(([lv])=>+lv>5).map(([lv,t])=>`<li class="${L>=+lv?'got':''}">Level ${lv}: ${t}</li>`).join('')+pr(10);
    h+=`<div class="skl"><img src="${iconOf(D.icon)}" alt=""><div><div class="nm"><span>${D.name}</span><b>Level ${L}</b></div><div class="pips">${pips}</div><div class="xp">${L>=10?'Mastered':`${x-lo} / ${hi-lo} to level ${L+1}`}</div></div><ul>${perks}</ul></div>`;}
  $('bagBody').innerHTML=h;$('bag').hidden=false;}
{const _ob=openBag;openBag=function(tab){const t=tab||GM_TAB;if(t==='skills'){_ob('social');GM_TAB='skills';const bag=$('bag');bag.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==='skills'));bag.querySelector('h2').textContent='Skills';renderSkills();return;}
  _ob.apply(this,arguments);const bag=$('bag');const tabs=bag.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-t="skills"]')){const b=document.createElement('button');b.dataset.t='skills';b.textContent='Skills';
    const soc=tabs.querySelector('[data-t="social"]');(soc?soc.nextSibling:null)?tabs.insertBefore(b,soc.nextSibling):tabs.appendChild(b);b.addEventListener('click',()=>openBag('skills'));}};}
