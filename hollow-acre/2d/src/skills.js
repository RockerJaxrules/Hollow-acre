/* ================= skills (Stardew-style): farming, foraging, mining, fishing and combat each level 1-10 from the work you do, and each
   level gives you something. XP is counted from what your work produces (crops in the basket, wood, stone and ore in the bag, fish caught,
   creatures killed), and only while you're playing: nothing bought, crafted, gifted or taken back out of the bin counts. ================= */
S.skills=S.skills||{farming:0,foraging:0,mining:0,fishing:0,combat:0};
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('skills'))PERSONAL.push('skills');
const SK_LV=[0,30,90,180,320,500,750,1050,1450,1950,2600];
const SKILLS={
  farming:{name:'Farming',icon:'turnip',perks:{1:'Every level: crops are worth 2% more.',3:'Hoe and watering can cost 1 less energy.',5:'15% chance of a second crop at harvest.',8:'Hoe and watering can cost 2 less energy.',10:'Crops are worth 25% more on top.'}},
  foraging:{name:'Foraging',icon:'wood',perks:{3:'The axe costs 1 less energy.',5:'25% chance of extra wood.',8:'The axe costs 2 less energy.',10:'Felled trees sometimes leave hollow-glass in the roots.'}},
  mining:{name:'Mining',icon:'copper',perks:{3:'The pickaxe costs 1 less energy.',5:'25% chance of extra stone or ore.',8:'The pickaxe costs 2 less energy.',10:'Ore sometimes has hollow-glass inside.'}},
  fishing:{name:'Fishing',icon:'fish',perks:{1:'Every level: fish are worth 3% more and the catch bar grows.',3:'Casting costs 1 less energy.',5:'The catch bar is wider.',10:'Fish are worth 25% more on top.'}},
  combat:{name:'Combat',icon:'blade',perks:{1:'Every level: +5 max health.',5:'Each kill heals you a little.',10:'+20 more max health.'}}};
const skLvl=k=>{const x=(S.skills&&S.skills[k])||0;let l=0;while(l<10&&x>=SK_LV[l+1])l++;return l;};
const SK_FLOAT=[];
function addXP(k,n){if(!n||!S.skills)return;const before=skLvl(k);S.skills[k]=(S.skills[k]||0)+n;const after=skLvl(k);if(after>before)for(let l=before+1;l<=after;l++)levelUp(k,l);}
function levelUp(k,l){const D=SKILLS[k];if(k==='combat'){const add=5+(l===10?20:0);S.hpMax+=add;S.hp=Math.min(S.hpMax,S.hp+add);}
  SK_FLOAT.push({t:0,text:`${D.name} ${l}!`});SFX.bell&&SFX.bell();
  const perk=D.perks[l]||(D.perks[1]&&D.perks[1].replace('Every level: ',''));setTimeout(()=>toast(`${D.name} level ${l}. ${perk?perk:''}`,3.2),200);}
// ---- the watcher
const SKW={primed:false,inv:{},fish:0,eggs:0};
const SK_INV={wood:['foraging',1.5],fiber:['foraging',1],stone:['mining',1],coal:['mining',2],copper:['mining',3],iron:['mining',5],gem:['mining',10],milk:['farming',3]};
const SK_CROP={turnip:6,pumpkin:10,corn:12};
const skBusy=()=>S.paused||S.mode!=='play'||[...document.querySelectorAll('.sheet')].some(s=>!s.hidden)||(typeof $==='function'&&$('note')&&!$('note').hidden);
function skPrime(){for(const b of S.basket)b._sk=1;for(const k in SK_INV)SKW.inv[k]=inv(k);SKW.fish=S.fishCaught||0;SKW.primed=true;}
function skTick(){if(!S.skills)return;if(S.mode!==SKW.mode){SKW.mode=S.mode;SKW.primed=false;}if(!SKW.primed||S.mode!=='play'){skPrime();return;}const quiet=skBusy();
  // the basket: crops, fish, eggs and glowcaps, each counted once
  for(let i=0;i<S.basket.length;i++){const b=S.basket[i];if(b._sk)continue;b._sk=1;if(quiet)continue;
    if(SK_CROP[b.kind]){const L=skLvl('farming');b.value=Math.round(b.value*(1+.02*L)*(L>=10?1.25:1));addXP('farming',SK_CROP[b.kind]);
      if(L>=5&&rand()<.15){S.basket.push({kind:b.kind,value:b.value,_sk:1});toast(`Two ${(PRODUCE_NAMES[b.kind]||b.kind).toLowerCase()}s from one plant.`,1.6);}}
    else if(b.kind==='fish'){const L=skLvl('fishing');b.value=Math.round(b.value*(1+.03*L)*(L>=10?1.25:1));}
    else if(b.kind==='egg')addXP('farming',2);
    else if(b.kind==='mushroom')addXP('foraging',5);}
  // the bag: wood, stone and ore you've won from the ground
  for(const [k,[sk,xp]] of Object.entries(SK_INV)){const now=inv(k),d=now-(SKW.inv[k]||0);SKW.inv[k]=now;if(d<=0||quiet)continue;addXP(sk,Math.round(d*xp));
    if(sk==='foraging'&&k==='wood'){const L=skLvl('foraging');if(L>=5&&rand()<.25){addInv('wood',1);SKW.inv.wood++;}if(L>=10&&d>=3&&rand()<.08){addInv('gem',1);SKW.inv.gem=inv('gem');toast('Something glints in the roots: hollow-glass.',2);}}
    if(sk==='mining'&&k!=='gem'){const L=skLvl('mining');if(L>=5&&rand()<.25){addInv(k,1);SKW.inv[k]++;}if(L>=10&&k!=='stone'&&rand()<.06){addInv('gem',1);SKW.inv.gem=inv('gem');toast('There’s hollow-glass in the ore.',2);}}}
  // fish caught
  const f=S.fishCaught||0;if(f>SKW.fish&&!quiet)addXP('fishing',8*(f-SKW.fish));SKW.fish=f;
  // the catch bar grows with fishing
  if(typeof MG!=='undefined'){if(MG.on&&!MG._sk){MG._sk=1;const L=skLvl('fishing');MG.size=Math.min(.5,MG.size+L*.006+(L>=5?.04:0));}if(!MG.on)MG._sk=0;}}
setInterval(skTick,200);
{const _lg=loadGame;loadGame=function(d){_lg(d);S.skills=Object.assign({farming:0,foraging:0,mining:0,fishing:0,combat:0},S.skills||{});SKW.primed=false;};}
// tilling and watering, and kills in the mine
{const _t=doTill;doTill=function(t){addXP('farming',1);return _t.apply(this,arguments);};}
{const _w=waterSoil;waterSoil=function(t){if(S.water>0&&t&&t.tilled&&!t.wet)addXP('farming',1);return _w.apply(this,arguments);};}
{const _mu=mineUpdate;mineUpdate=function(dt){if(typeof MINE!=='undefined')for(const m of MINE.mobs||[])if(m.dead&&!m._sk){m._sk=1;addXP('combat',8);if(skLvl('combat')>=5)S.hp=Math.min(S.hpMax,S.hp+6);}return _mu(dt);};}
// tools cost less energy as you get better with them
{const _sp=spend;spend=function(n){const k=typeof heldKind==='function'?heldKind():null;const sk={hoe:'farming',can:'farming',axe:'foraging',pick:'mining',rod:'fishing'}[k];
  if(sk&&n>1){const L=skLvl(sk);n=Math.max(1,n-(L>=8&&sk!=='fishing'?2:L>=3?1:0));}return _sp(n);};}

// ---- the level-up mark: gold pixel letters that rise off your head and fade (drawn over the world, so the light doesn't dim it)
{const css=document.createElement('style');css.textContent=`.skfloat{position:fixed;z-index:40;pointer-events:none;transform:translate(-50%,-100%);font-family:'Pixelify Sans',monospace;font-size:20px;color:#ffd27a;white-space:nowrap;
  text-shadow:2px 0 #1a0e06,-2px 0 #1a0e06,0 2px #1a0e06,0 -2px #1a0e06,2px 2px #1a0e06,0 0 10px rgba(255,200,90,.6);animation:skf 2.6s ease-out forwards}
  .skfloat small{display:block;text-align:center;font-size:12px;color:#fff4c0}@keyframes skf{0%{opacity:0;margin-top:8px}12%{opacity:1;margin-top:0}75%{opacity:1}100%{opacity:0;margin-top:-34px}}`;document.head.appendChild(css);}
setInterval(()=>{if(!SK_FLOAT.length)return;const f=SK_FLOAT.shift();const r=view.getBoundingClientRect();const x=r.left+sx(P.x)*r.width/VW,y=r.top+(sz(P.z)-58)*r.height/VH;
  const d=document.createElement('div');d.className='skfloat';d.innerHTML=`${f.text}<small>level up</small>`;d.style.left=x+'px';d.style.top=y+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),2700);},250);
// ---- the Skills tab in the menu
{const css=document.createElement('style');css.textContent=`#bag .skl{display:grid;grid-template-columns:40px 1fr;gap:6px 10px;align-items:center;margin:8px 0;padding:8px;background:rgba(0,0,0,.18)}
  #bag .skl img{width:36px;height:36px;image-rendering:pixelated}#bag .skl .nm{display:flex;justify-content:space-between;font-size:15px}#bag .skl .nm b{color:#ffd27a;font-weight:400}
  #bag .skl .pips{display:flex;gap:3px;margin:4px 0 2px}#bag .skl .pips i{flex:1;height:9px;background:#3a2414;box-shadow:inset 0 0 0 1px #1a0e06}#bag .skl .pips i.on{background:#e8a040;box-shadow:inset 0 0 0 1px #8a5020,inset 0 2px 0 #ffd27a}
  #bag .skl .pips i.part{background:linear-gradient(90deg,#b07a30 var(--p),#3a2414 var(--p))}#bag .skl .xp{font-size:11px;opacity:.7}
  #bag .skl ul{grid-column:2;margin:2px 0 0;padding-left:16px;font-size:12px}#bag .skl li.got{color:#bfe0a0}#bag .skl li{opacity:.85}`;document.head.appendChild(css);}
function renderSkills(){$('bagSub').textContent='You get better at what you do. Each level makes the work a little lighter.';let h='';
  for(const [k,D] of Object.entries(SKILLS)){const L=skLvl(k),x=S.skills[k]||0,lo=SK_LV[L],hi=SK_LV[Math.min(10,L+1)],p=L>=10?1:(x-lo)/(hi-lo);
    const pips=Array.from({length:10},(_,i)=>i<L?'<i class="on"></i>':i===L&&L<10?`<i class="part" style="--p:${Math.round(p*100)}%"></i>`:'<i></i>').join('');
    const perks=Object.entries(D.perks).map(([lv,t])=>`<li class="${L>=+lv?'got':''}">${+lv===1?'':'Level '+lv+': '}${t}</li>`).join('');
    h+=`<div class="skl"><img src="${iconOf(D.icon)}" alt=""><div><div class="nm"><span>${D.name}</span><b>Level ${L}</b></div><div class="pips">${pips}</div><div class="xp">${L>=10?'Mastered':`${x-lo} / ${hi-lo} to level ${L+1}`}</div></div><ul>${perks}</ul></div>`;}
  $('bagBody').innerHTML=h;$('bag').hidden=false;}
{const _ob=openBag;openBag=function(tab){const t=tab||GM_TAB;if(t==='skills'){_ob('social');GM_TAB='skills';const bag=$('bag');bag.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t==='skills'));bag.querySelector('h2').textContent='Skills';renderSkills();return;}
  _ob.apply(this,arguments);const bag=$('bag');const tabs=bag.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-t="skills"]')){const b=document.createElement('button');b.dataset.t='skills';b.textContent='Skills';
    const soc=tabs.querySelector('[data-t="social"]');(soc?soc.nextSibling:null)?tabs.insertBefore(b,soc.nextSibling):tabs.appendChild(b);b.addEventListener('click',()=>openBag('skills'));}};}
