/* ================= the farm economy: inventory, tools, energy, health, food and cooking, the mine, equipment upgrades, the greenhouse ================= */
Object.assign(S,{energy:100,energyMax:100,hp:100,hpMax:100,inv:{},tools:{hoe:S.hoe||1,can:1,pick:1,axe:1},mineFloor:0,mineDeep:0,greenhouse:false});
const ITEMS={
  wood:{name:'Wood',icon:'wood'},stone:{name:'Stone',icon:'stone'},fiber:{name:'Fiber',icon:'fiber'},
  copper:{name:'Copper ore',icon:'copper'},iron:{name:'Iron ore',icon:'iron'},coal:{name:'Coal',icon:'coal'},gem:{name:'Hollow-glass',icon:'gem',sell:40,desc:'A black gem that is warm to the touch. Sells for 40.'},
  bread:{name:'Caitlyn’s bread',food:[30,5],desc:'Still warm. +30 energy.'},stew:{name:'Caitlyn’s stew',food:[50,15],desc:'+50 energy, +15 health.'},
  soup:{name:'Turnip soup',food:[35,5]},egg_fried:{name:'Fried egg',food:[25,10]},pie:{name:'Pumpkin pie',food:[60,25]},chowder:{name:'Corn chowder',food:[80,30]},hash:{name:'Grandpa’s hash',food:[100,45]},
  glowstew:{name:'Glowcap stew',food:[20,40],desc:'Tastes of nothing at all. +40 health.'}};
const RAW={turnip:[8,0],pumpkin:[12,0],corn:[10,0],egg:[6,2],mushroom:[4,8]};       // eating crops straight from the basket
const inv=k=>S.inv[k]||0, addInv=(k,n)=>{S.inv[k]=inv(k)+(n||1);}, takeInv=(k,n)=>{S.inv[k]=Math.max(0,inv(k)-(n||1));};
function spend(n){if(S.energy>=n){S.energy-=n;return true;}toast(S.energy<=0?'You’re exhausted. Eat something, or go to bed.':'Too tired for that. Eat something first.',2);SFX.deny();return false;}
function eat(e,h,name){S.energy=Math.min(S.energyMax,S.energy+e);S.hp=Math.min(S.hpMax,S.hp+h);SFX.harvest();toast(`${name}. +${e} energy${h?`, +${h} health`:''}.`,1.8);}
function hurt(n,why){S.hp=Math.max(0,S.hp-n);cam.shake=Math.max(cam.shake,.35);flashT=Math.max(flashT,.25);if(why)toast(why,2.2,true);if(S.hp<=0)setTimeout(blackout,400);}
function blackout(){if(S.mode!=='play'&&S.mode!=='scare')return;S.mode='trans';fade(1);setTimeout(()=>{const lost=Math.min(S.coins,Math.ceil(S.coins*.2));S.coins-=lost;
  S.room='cabin';const R=ROOMS.cabin;P.x=R.ox+2.6;P.z=R.oz+2.9;P.dir='S';S.hp=Math.round(S.hpMax*.5);S.energy=Math.round(S.energyMax*.5);S.hour=Math.min(25.5,S.hour+2);S.mineFloor=0;
  if(typeof M!=='undefined'){M.v=Math.max(M.v,40);M.blackout=false;}S.mode='play';fade(0);toast(`You wake in Grandpa’s bed. You don’t remember walking home. Your boots are muddy to the knee.${lost?' '+lost+' coins are gone.':''}`,4.2,true);},1300);}
// ---- energy costs on the farm
{const _t=doTill;doTill=function(t){if(!spend(S.hoe>1?3:2))return;_t(t);};const _w=doWater;doWater=function(t){if(!spend(1))return;_w(t);};}
// sleeping refills you; collapsing in the dirt only half
{const _nd=newDay;newDay=function(msg,pos){_nd(msg,pos);const bad=msg&&/collapsed|dragged/.test(msg);S.energy=Math.round(S.energyMax*(bad?.55:1));S.hp=Math.min(S.hpMax,S.hp+(bad?20:S.hpMax));
  for(const t of tiles)if(t.gh&&t.crop&&t.crop.stage<3)t.crop.watered=true;S.mineFloor=0;};}
// the Hollow catching you now hurts
{const _c=caught;caught=function(){const was=S.mode;_c();if(was==='play')setTimeout(()=>hurt(30,null),900);};}
// ---- HUD bars: energy and health, Stardew-style, at the right edge
{const css=document.createElement('style');css.textContent=`#bars{display:none;position:fixed;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 150px);display:flex;gap:6px;z-index:5;pointer-events:none}
  #bars .bv{width:14px;height:120px;border-radius:5px;background:rgba(20,16,12,.85);border:1px solid var(--line);position:relative;overflow:hidden}#bars .bv i{position:absolute;left:2px;right:2px;bottom:2px;border-radius:3px}
  #bars .bv b{position:absolute;top:-18px;left:0;right:0;text-align:center;font:600 10px/1 system-ui;color:var(--bone)}#bars .wrap{position:relative;padding-top:16px}
  #btnBag{position:fixed;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 140px)}
  #bag .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px}#bag .it{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px solid var(--line);border-radius:8px;background:rgba(233,223,198,.04)}
  #bag .it img{width:32px;height:32px;image-rendering:pixelated}#bag .it span{flex:1;font-size:14px}#bag .it button{font:inherit;font-size:12px;padding:3px 8px;border-radius:6px;border:1px solid rgba(232,146,63,.6);background:rgba(232,146,63,.16);color:var(--bone)}
  #bag h3{font-family:var(--font-display);font-weight:400;margin:12px 0 6px;font-size:17px;color:var(--ember)}`;document.head.appendChild(css);
  const b=document.createElement('div');b.id='bars';b.innerHTML='<div class="wrap"><b>E</b><div class="bv"><i id="barE" style="background:#7cc04a"></i></div></div><div class="wrap"><b>H</b><div class="bv"><i id="barH" style="background:#d8483a"></i></div></div>';document.body.appendChild(b);
  const bag=document.createElement('div');bag.className='sheet';bag.id='bag';bag.hidden=true;bag.innerHTML='<h2>Bag</h2><p class="sub" id="bagSub"></p><div id="bagBody"></div><div class="acts"><button class="close" id="bagClose">Close</button></div>';$('note').after(bag);
  $('bagClose').addEventListener('click',()=>{bag.hidden=true;S.paused=false;});
  const btn=document.createElement('button');btn.className='btn';btn.id='btnBag';btn.textContent='Bag';btn.addEventListener('click',()=>{if(S.mode==='play'&&!S.paused)openBag();});$('buttons').prepend(btn);}
const ICON={};const ICON_ALIAS={twig:'wood',rock_0:'stone',weeds_0:'fiber',ore_copper:'copper',ore_iron:'iron',ore_coal:'coal',ore_gem:'gem',in_shelf_tools:'hoe',in_keg:'can',stump:'axe'};
function iconOf(spr){if(ICON[spr])return ICON[spr];const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const key=SPR['icon32_'+spr]?'icon32_'+spr:SPR['icon_'+spr]?'icon_'+spr:SPR['icon_'+(ICON_ALIAS[spr]||'')]?'icon_'+ICON_ALIAS[spr]:SPR[spr]?spr:null;const m=key&&SPR[key],im=m&&IMG[m.src];
  if(im){if(key.startsWith('icon'))g.drawImage(im,0,0,m.fw,m.fh,0,0,32,32);else{const f=Math.max(1,Math.ceil(Math.max(m.fw,m.fh)/32));const w=Math.floor(m.fw/f),h=Math.floor(m.fh/f);g.drawImage(im,0,0,m.fw,m.fh,(32-w)>>1,(32-h)>>1,w,h);}}
  const u=c.toDataURL();if(im&&im.complete!==false)ICON[spr]=u;return u;}   // don't remember a blank icon from before the image loaded
function openBag(){S.paused=true;const B=$('bagBody');const T=S.tools;
  $('bagSub').textContent=`Energy ${Math.round(S.energy)}/${S.energyMax} · Health ${Math.round(S.hp)}/${S.hpMax}${S.mineDeep?` · Deepest mine floor ${S.mineDeep}`:''}`;
  const row=(icon,label,btn)=>`<div class="it"><img src="${iconOf(icon)}" alt=""><span>${label}</span>${btn||''}</div>`;
  let h='<h3>Tools</h3><div class="grid">';
  h+=row('hoe',`${T.hoe>1?'Copper':'Rusty'} hoe`)+row('can',`${S.waterMax>10?'Copper':'Tin'} watering can`)+row('pick',`${T.pick>1?'Steel':'Grandpa’s'} pickaxe`)+row('axe',`${T.axe>1?'Steel':'Old'} axe`);h+='</div>';
  const prod={};for(const b of S.basket)prod[b.kind]=(prod[b.kind]||0)+1;
  if(Object.keys(prod).length){h+='<h3>Produce</h3><div class="grid">';for(const k in prod){const ic=k;h+=row(ic,`${k[0].toUpperCase()+k.slice(1)} ×${prod[k]}`,RAW[k]?`<button data-raw="${k}">Eat</button>`:'');}h+='</div>';}
  const mats=Object.keys(ITEMS).filter(k=>!ITEMS[k].food&&inv(k)>0),foods=Object.keys(ITEMS).filter(k=>ITEMS[k].food&&inv(k)>0);
  if(mats.length){h+='<h3>Materials</h3><div class="grid">';for(const k of mats)h+=row(ITEMS[k].icon,`${ITEMS[k].name} ×${inv(k)}`);h+='</div>';}
  if(foods.length){h+='<h3>Food</h3><div class="grid">';for(const k of foods){const f=ITEMS[k].food;h+=row(k,`${ITEMS[k].name} ×${inv(k)}<br><small style="color:var(--dim)">+${f[0]}E${f[1]?` +${f[1]}H`:''}</small>`,`<button data-food="${k}">Eat</button>`);}h+='</div>';}
  if(!mats.length&&!foods.length&&!Object.keys(prod).length)h+='<p class="sub">Your bag is empty. Clear the farm, mine the cliff, cook at the stove.</p>';
  B.innerHTML=h;
  B.querySelectorAll('[data-raw]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.raw;takeBasket(k,1);eat(RAW[k][0],RAW[k][1],k==='mushroom'?'You eat the glowcap raw. Your teeth feel loose':'You eat a raw '+k);updateHud();openBag();}));
  B.querySelectorAll('[data-food]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.food;takeInv(k,1);eat(ITEMS[k].food[0],ITEMS[k].food[1],ITEMS[k].name);openBag();}));
  $('bag').hidden=false;}
// ---- shops learn about materials: rows may need ore/wood/stone, and say what the button does
renderShop=(function(prev){return function(){prev();const rows=vendors[shopV].rows();const els=[...$('shopRows').children];rows.forEach((r,i)=>{if(!els[i])return;const b=els[i].querySelector('button');if(!b)return;
  if(r.need){const ok=Object.entries(r.need).every(([k,n])=>inv(k)>=n)&&S.coins>=r.price&&r.can;const nb=b.cloneNode(true);nb.disabled=!ok;if(r.btn&&r.price&&r.can)nb.innerHTML=`${r.btn}<br><small style="opacity:.8">${r.price} coins</small>`;else nb.textContent=r.btn||(r.price?r.price+' coins':'Free');
    nb.addEventListener('click',()=>{if(!ok)return;for(const [k,n] of Object.entries(r.need))takeInv(k,n);S.coins-=r.price;SFX.coin();r.buy();renderShop();updateHud();});b.replaceWith(nb);
    // everything it takes, coins included, and exactly what's still missing
    const d=els[i].querySelector('span');const need=' Needs '+(r.price?`${r.price} coins (${S.coins}), `:'')+Object.entries(r.need).map(([k,n])=>`${n} ${(ITEMS[k]||{name:k}).name.toLowerCase()} (${inv(k)})`).join(', ')+'.';
    const miss=[];if(r.can){if(S.coins<r.price)miss.push(`${r.price-S.coins} more coins`);for(const [k,n] of Object.entries(r.need))if(inv(k)<n)miss.push(`${n-inv(k)} more ${(ITEMS[k]||{name:k}).name.toLowerCase()}`);}
    if(d&&!d.dataset.nd){d.textContent+=need;d.dataset.nd=1;if(miss.length){const m=document.createElement('b');m.style.cssText='display:block;color:#e8a040;font-weight:normal';m.textContent='Still need '+miss.join(', ')+'.';d.appendChild(m);}}}
  else if(r.btn){b.textContent=r.btn;}});};})(renderShop);
vendors.hollis.rows=()=>{const fr=S.freeUpgrades,T=S.tools;return [
  {k:'hoe',name:'Copper hoe',desc:S.hoe>1?'Already done.':'Tills three tiles in a row with each swing.',price:fr?0:40,can:S.hoe<2,need:{copper:5},buy(){S.hoe=2;T.hoe=2;}},
  {k:'can',name:'Copper watering can',desc:S.waterMax>10?'Already done.':'Holds twice the water.',price:fr?0:30,can:S.waterMax<=10,need:{copper:4},buy(){S.waterMax=20;S.water=20;S.bigCan=true;}},
  {k:'pick',name:'Steel pickaxe',desc:T.pick>1?'Already done.':'Breaks rock and iron in fewer swings, for less effort.',price:fr?0:60,can:T.pick<2,need:{copper:3,iron:4},buy(){T.pick=2;}},
  {k:'axe',name:'Steel axe',desc:T.axe>1?'Already done.':'Splits stumps in one swing.',price:fr?0:40,can:T.axe<2,need:{iron:3},buy(){T.axe=2;}},
  {k:'spr',name:'Brass sprinkler',desc:S.sprinklers>=4?'Your field has all it can use.':`Waters a patch of field every morning. You have ${S.sprinklers}/4.`,price:fr?0:45,can:S.sprinklers<4,need:{copper:2,iron:1},buy(){S.sprinklers++;}},
  {k:'hood',name:'Lantern hood',desc:S.flashlight?'Your light is already focused.':'A reflector for your lantern. Throws the light much further.',price:fr?0:60,can:!S.flashlight,need:{iron:2},buy(){S.flashlight=true;}}];};
{const _mae=vendors.mae.rows;vendors.mae.rows=()=>{const r=_mae();r.push({k:'bread',name:'Loaf of bread',desc:'+30 energy.',price:10,can:true,buy(){addInv('bread');}},{k:'stew',name:'Bowl of stew',desc:'+50 energy, +15 health. “You look peaky, dear.”',price:25,can:true,buy(){addInv('stew');}},
  {k:'sellgem',name:'Sell Hollow-glass',desc:`Caitlyn buys them without looking at them. You have ${inv('gem')}.`,price:0,can:inv('gem')>0,btn:'Sell 40',buy(){takeInv('gem');S.coins+=40;}});return r;};}
// ---- cooking at Grandpa's stove
const RECIPES=[['soup',{turnip:2},'Turnip soup'],['egg_fried',{egg:1},'Fried egg'],['pie',{pumpkin:1,egg:1},'Pumpkin pie'],['chowder',{corn:2,egg:1},'Corn chowder'],['hash',{turnip:1,pumpkin:1,corn:1},'Grandpa’s hash'],['glowstew',{mushroom:2},'Glowcap stew']];
vendors.cook={name:'Grandpa’s stove',sub:'The recipe cards are in his handwriting. One of them is in yours.',rows:()=>RECIPES.map(([k,need,name])=>{const f=ITEMS[k].food;const ok=Object.entries(need).every(([q,n])=>basketCount(q)>=n);
  return {k,name,desc:`${Object.entries(need).map(([q,n])=>n+' '+q).join(' + ')} → +${f[0]} energy${f[1]?`, +${f[1]} health`:''}.`,price:0,can:ok,btn:'Cook',buy(){for(const [q,n] of Object.entries(need))takeBasket(q,n);addInv(k);SFX.refill();toast(`You cook ${name.toLowerCase()}. It’s in your bag.`,1.8);}};})};
{const st=interact.find(it=>it.on&&ROOMS.cabin&&Math.abs(it.x-(ROOMS.cabin.ox+7.9))<.01);if(st){st.label=()=>'Cook';st.act=()=>openShop('cook');}}
// ---- farm debris now gives materials and costs energy; stumps need the axe
{const add=farmDebris;farmDebris=function(){add();for(const it of interact){if(!it.act||!it.label)continue;const o=OBJ.find(q=>q.debris&&Math.abs(q.x-it.x)<.001&&Math.abs(q.z-it.z)<.001);if(!o)continue;const orig=it.act;
    it.act=function(){if(P.anim)return;const cost=o.debris==='rock'?(S.tools.pick>1?2:3):o.debris==='weeds'?1:0;if(cost&&!spend(cost))return;faceTo(o.x,o.z);startAnim(o.debris==='rock'?'pick':'grab',o.debris==='rock'?.55:.45,null,()=>{orig.call(it);
      if(o.debris==='rock')addInv('stone',1+(rand()<.3?1:0));if(o.debris==='weeds')addInv('fiber');if(o.debris==='twig')addInv('wood');});};}
  fieldDebris();};}
// ---- the old Marrow mine, cut into the cliff behind the farm
const MINE={x:-6,z:0,mobs:[],ores:[],ladder:null};
ROOMS.mine={ox:430,oz:-60,out:{x:0,z:0},name:'The old Marrow mine',furn:[]};
ROOMS.greenhouse={ox:462,oz:-60,out:{x:10.5,z:8.3},name:'The greenhouse',furn:[]};
function placeMine(){MINE.z=ridgeZ(MINE.x)+RIDGE.h+.15;obj('mineportal',MINE.x,MINE.z,{kind:'bld',night:'mineportal_n'});addRect(MINE.x-1.3,MINE.z-1.2,MINE.x-.6,MINE.z);addRect(MINE.x+.6,MINE.z-1.2,MINE.x+1.3,MINE.z);
  ROOMS.mine.out={x:MINE.x,z:MINE.z+.9};interact.push({x:MINE.x,z:MINE.z+.3,r:1,label:()=>'Enter mine',ok:()=>true,act(){mineEnter();}});}
const ORE_HITS={stone:1,copper:2,coal:2,iron:3,gem:3};
function mineFloor(f){S.mineFloor=f;S.mineDeep=Math.max(S.mineDeep,f);const R=ROOMS.mine;for(const o of MINE.ores)o.hide=true;for(const o of MINE.ores)if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}
  MINE.ores.length=0;MINE.mobs.length=0;if(MINE.ladder)MINE.ladder.hide=true;MINE.ladder=null;
  const n=10+Math.min(10,f);const pick=()=>{const r=rand();if(f>=10&&r<.06)return 'gem';if(f>=5&&r<.22)return 'iron';if(f>=3&&r<.36)return 'coal';if(r<.55)return 'copper';return 'stone';};
  for(let i=0,k=0;i<200&&k<n;i++){const x=R.ox+.8+rand()*(R.w-1.6),z=R.oz+1.2+rand()*(R.d-2.2);if(Math.abs(x-(R.ox+R.door))<1.2&&z>R.oz+R.d-2)continue;if(MINE.ores.some(o=>Math.hypot(o.x-x,o.z-z)<1.1))continue;
    const kind=pick();const o=obj('ore_'+kind,x,z,{kind:'prop',ore:kind,hits:0});o.col={x,z:z-.1,r:.32};circles.push(o.col);MINE.ores.push(o);k++;}
  MINE.ladderAt=MINE.ores[(rand()*MINE.ores.length)|0];
  const mobs=f<2?0:Math.min(3,1+(f/4|0));for(let i=0;i<mobs;i++)MINE.mobs.push({x:R.ox+1+rand()*(R.w-2),z:R.oz+1+rand()*2,t:0,stun:0});
  toast(f===1?'The old Marrow mine. The air is cold and smells of pennies.':`Floor ${f}.${f%5===0?' Somebody has scratched tally marks into the wall. They stop at your age.':''}`,2.4,f>=8);}
function mineTarget(){if(S.room!=='mine')return null;let best=null,bd=1.3;for(const o of MINE.ores){if(o.hide)continue;const d=Math.hypot(o.x-P.x,o.z-P.z);const dot=((o.x-P.x)*P.fx+(o.z-P.z)*P.fz)/(d||1);if(d<bd&&(d<.8||dot>.3)){bd=d;best=o;}}return best;}
{const _cc=computeContext;computeContext=function(){if(S.room==='mine'){const L=MINE.ladder;if(L&&!L.hide&&Math.hypot(L.x-P.x,L.z-P.z)<1.1)return {label:'Climb down',ok:true,act(){fade(1);SFX.thud(0,.3);setTimeout(()=>{P.x=ROOMS.mine.ox+ROOMS.mine.door;P.z=ROOMS.mine.oz+ROOMS.mine.d-1;mineFloor(S.mineFloor+1);fade(0);},350);}};
    const o=mineTarget();if(o)return {label:'Mine',ok:true,act(){if(!spend(S.tools.pick>1?2:3))return;faceTo(o.x,o.z);startAnim('pick',.55,null,()=>{o.hits++;SFX.thud(0,.35);burst(o.x,o.z,10,'#8a8690',1.4,.7,2);
      const need=Math.max(1,ORE_HITS[o.ore]-(S.tools.pick>1?1:0))+(o.ore==='iron'&&S.tools.pick<2?1:0);if(o.ore==='iron'&&S.tools.pick<2&&o.hits===1&&!S.first.ironSlow){S.first.ironSlow=1;toast('Iron is tough. Keep swinging: Grandpa’s old pick breaks it in four.',3);}
      if(o.hits<need&&need>2)toast(`${ITEMS[o.ore].name}: cracking ${o.hits}/${need}`,.7);
      if(o.hits>=need){o.hide=true;const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);addInv('stone');if(o.ore!=='stone')addInv(o.ore,1+(rand()<.35?1:0));toast(`+${ITEMS[o.ore].name.toLowerCase()}`,1);
        if(o===MINE.ladderAt||(!MINE.ladder&&MINE.ores.every(q=>q.hide))){MINE.ladder=obj('ladder',o.x,o.z+.05,{kind:'flat'});SFX.stinger();toast('A ladder, going down.',1.4);}}});}};}
  return _cc();};}
// things in the dark below: they creep when your light is off them and flinch from it
function mineUpdate(dt){if(S.room!=='mine'||S.mode!=='play')return;for(const m of MINE.mobs){m.t+=dt;const d=Math.hypot(P.x-m.x,P.z-m.z);const lit=lanternOn()&&d<6.5&&facingDot(m.x,m.z)>.82;
    if(m.stun>0){m.stun-=dt;continue;}if(lit){const k=dt*1.6/(d||1);m.x-=(P.x-m.x)*k;m.z-=(P.z-m.z)*k;m.burn=(m.burn||0)+dt;if(m.burn>1.4){m.burn=0;m.stun=2.5;SFX.shriek(0);}}
    else{const k=dt*(.9+S.mineFloor*.06)/(d||1);m.x+=(P.x-m.x)*k;m.z+=(P.z-m.z)*k;}
    const R=ROOMS.mine;m.x=clamp(m.x,R.ox+.5,R.ox+R.w-.5);m.z=clamp(m.z,R.oz+.6,R.oz+R.d-.4);
    if(d<.6){hurt(10+S.mineFloor,'Something bites your ankle in the dark.');m.stun=2.2;m.x+=(m.x-P.x)*3;m.z+=(m.z-P.z)*3;}}}
function mineDrawables(D){if(S.room!=='mine')return;for(const m of MINE.mobs)D.push({z:m.z,mind:1,draw(){const X=sx(m.x),Y=sz(m.z);drawSpr('hollow',X,Y+10,'walk','S',Math.floor(m.t*6)%8,{scale:.42,alpha:m.stun>0?.35:.9});
    if(m.stun<=0){ctx2.fillStyle='rgba(255,40,20,.9)';ctx2.fillRect(X-3,Y-30,2,2);ctx2.fillRect(X+2,Y-30,2,2);}}});}
// ---- the greenhouse: built from the plans board; inside, beds that water themselves and grow faster, safe from whatever walks the field at night
const GH={x:10.5,z:7.6};
{const _pl=vendors.plans.rows;vendors.plans.rows=()=>{const r=_pl();r.push({k:'gh',name:'Greenhouse',desc:S.greenhouse?'Built.':'A second field under glass: 28 plots of soil that never dry out and grow half again as fast. Expensive, and worth it.',price:300,can:!S.greenhouse,need:{wood:50,stone:60,copper:10,iron:5},
  buy(){S.greenhouse=true;buildGreenhouse();toast('The greenhouse is up. Through the glass, the field looks very far away.',3);}});return r;};}
function buildGreenhouse(){obj('greenhouse',GH.x,GH.z,{kind:'bld',night:'greenhouse_n'});addRect(GH.x-2.6,GH.z-3,GH.x+2.6,GH.z-.15);HOUSES.push({e:OBJ[OBJ.length-1],x:GH.x,z:GH.z,lit:false,w:5});
  interact.push({x:GH.x,z:GH.z+.3,r:1,label:()=>'Enter',ok:()=>true,act(){enterRoom('greenhouse');}});
  const R=ROOMS.greenhouse;for(let r=0;r<4;r++)for(let c=0;c<7;c++){const t={i:100+c,j:100+r,x:R.ox+1+c+.5,z:R.oz+1.2+r+.5,tilled:false,crop:null,gh:true};tiles.push(t);}}
{const _tt=targetTile;targetTile=function(){if(S.room==='greenhouse'){let best=null,bd=1.2;for(const t of tiles){if(!t.gh)continue;const x=P.x+P.fx*.6,z=P.z+P.fz*.6+.1;const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;best=t;}}return best;}if(S.room)return null;return _tt();};}
// ---- per-frame hooks
{const _u=update;update=function(dt){_u(dt);mineUpdate(dt);for(const t of tiles)if(t.gh&&t.crop&&t.crop.watered&&t.crop.stage<3)t.crop.growth+=dt*.5*TIME_K();
};}
setInterval(()=>{const b=$('bars');if(!b)return;b.style.display=(S.mode!=='play'||$('hud').hidden||S.paused)?'none':'flex';$('barE').style.height=Math.max(0,S.energy/S.energyMax*100-3)+'%';$('barH').style.height=Math.max(0,S.hp/S.hpMax*100-3)+'%';$('barE').style.background=S.energy<20?'#d8a43a':'#7cc04a';},150);
function econBoot(){placeMine();
  // find open ground for the greenhouse plot and keep it clear of debris
  const cand=[];for(let x=-11;x<=22;x+=.5)for(let z=-1;z<=12;z+=.5)cand.push([x,z]);cand.sort((p,q)=>Math.hypot(p[0]-10,p[1]-7)-Math.hypot(q[0]-10,q[1]-7));const blocked=(x,z)=>OBJ.some(o=>['tree','pine','bld','fence','lamp','prop','bush','wreck'].includes(o.kind)&&o.x>x-4&&o.x<x+4&&o.z>z-4.2&&o.z<z+3.2);
  const fits=(x,z)=>{if(blocked(x,z))return false;if(x+3>FIELD.x0-1&&x-3<FIELD.x0+FIELD.w+1&&z+1.5>FIELD.z0-1&&z-4<FIELD.z0+FIELD.h+1)return false;for(let i=-3;i<=3;i+=1)for(let j=-4;j<=1.5;j+=1)if(terr(x+i,z+j)!=='grass'||!clearSpot(x+i,z+j,0))return false;return true;};
  for(const [x,z] of cand)if(fits(x,z)){GH.x=x;GH.z=z;break;}ROOMS.greenhouse.out={x:GH.x,z:GH.z+.8};reserve(GH.x-3.2,GH.z-3.8,GH.x+3.2,GH.z+1.4);
  if(S.greenhouse)buildGreenhouse();}

// ---- the field has gone wild outside Grandpa's last patch: clear it plot by plot before you can till it (Stardew-style land clearing)
function makeDebris(spr,x,z,tile){const kind=spr.split('_')[0];const o=obj(spr,x,z,{kind:'prop',debris:kind});if(tile)tile.debris=o;
  if(kind==='rock'||kind==='stump'){o.col={x,z:z-.1,r:kind==='stump'?.36:.3};circles.push(o.col);}
  const verb={rock:'Break',stump:'Chop',weeds:'Pull',twig:'Pick up'}[kind];
  interact.push({x,z,r:.75,on:()=>!o.hide,label:()=>verb,ok:()=>true,act(){if(P.anim)return;const cost={rock:S.tools.pick>1?2:3,stump:S.tools.axe>1?2:4,weeds:1,twig:0}[kind];if(cost&&!spend(cost))return;faceTo(o.x,o.z);
    startAnim(kind==='rock'?'pick':kind==='stump'?'axe':'grab',.5,null,()=>{o.hits=(o.hits||0)+1;const need=kind==='stump'?(S.tools.axe>1?1:2):1;SFX.thud(0,kind==='rock'?.35:.2);
      burst(o.x,o.z,kind==='rock'?14:9,kind==='rock'?'#8a8690':kind==='weeds'?'#4a8a32':'#7d5636',1.3,.6,2);if(o.hits<need)return;
      o.hide=true;o.goneDay=S.day;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}
      if(kind==='rock')addInv('stone',1+(rand()<.3?1:0));if(kind==='weeds'){addInv('fiber');if(rand()<.15){S.seeds.turnip++;toast('A turnip seed was tangled in the roots.',1.6);}}if(kind==='twig')addInv('wood');if(kind==='stump')addInv('wood',3);updateHud();});}});return o;}
function fieldDebris(){for(const t of tiles){if(t.gh)continue;const inStart=t.i>=FSTART.i0&&t.i<FSTART.i0+FSTART.w&&t.j>=FSTART.j0&&t.j<FSTART.j0+FSTART.h;if(inStart)continue;
  const r=rand();if(r>.82)continue;const spr=r<.4?'weeds_'+((rand()*2)|0):r<.66?'rock_'+((rand()*2)|0):'twig';makeDebris(spr,t.x+(rand()-.5)*.25,t.z+.2+(rand()-.5)*.15,t);}}
// a tile with something still on it can't be tilled
{const _tt2=targetTile;targetTile=function(){const t=_tt2();if(t&&t.debris&&!t.debris.hide)return null;return t;};}
// the note nailed to Grandpa's door, until you read it
function noteDrawables(D){if(S.readLetter||S.room)return;D.push({z:-9.38,mind:1,draw(){const X=sx(doorPos.x+.18),Y=sz(-9.4)-26+Math.round(Math.sin(performance.now()/500)*.6);drawSpr('doornote',X,Y);
  if(Math.sin(performance.now()/260)>.6){ctx2.fillStyle='rgba(255,250,220,.9)';ctx2.fillRect(X+3,Y-13,1,1);ctx2.fillRect(X+2,Y-12,3,1);ctx2.fillRect(X+3,Y-11,1,1);}}});}
{const _md=mineDrawables;mineDrawables=function(D){_md(D);noteDrawables(D);};}
// ---- hotbar: your tools, the seed you're holding and a quick snack. The slot for what the big button will do lights up.
{const css=document.createElement('style');css.textContent=`#hotbar{position:fixed;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);display:flex;gap:4px;z-index:6}
  #hotbar .slot{width:44px;height:44px;position:relative;padding:0;border:0;background:#3a2414;box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #8a5a2a,inset 0 0 0 6px #5a3818;image-rendering:pixelated;cursor:pointer}
  #hotbar .slot img{width:32px;height:32px;image-rendering:pixelated;position:absolute;left:6px;top:6px}#hotbar .slot.on{box-shadow:inset 0 0 0 2px #1a0e06,inset 0 0 0 4px #f0a040,inset 0 0 0 6px #b8602a}
  #hotbar .slot b{position:absolute;right:4px;bottom:2px;font:10px/1 'Hollow Pixel',monospace;color:#f4e4c0;text-shadow:1px 1px 0 #000}#hotbar .slot i{position:absolute;left:4px;top:3px;font:8px/1 monospace;color:#c8a070;font-style:normal}
  #btnSeed{display:none!important}`;document.head.appendChild(css);
  const hb=document.createElement('div');hb.id='hotbar';const SL=[['hoe','hoe'],['can','can'],['pick','pick'],['axe','axe'],['seed','seed'],['food','food']];
  hb.innerHTML=SL.map(([k,ic],i)=>`<button class="slot" data-k="${k}" aria-label="${k}"><i>${i+1}</i><img data-ic="${ic}" alt=""><b id="hb_${k}"></b></button>`).join('');$('buttons').appendChild(hb);
  hb.querySelectorAll('.slot').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();hotbarUse(b.dataset.k);}));}
function hotbarUse(k){if(S.mode!=='play'||S.paused)return;const T=S.tools;
  if(k==='seed'){onSeed();return;}
  if(k==='food'){const best=Object.keys(ITEMS).filter(q=>ITEMS[q].food&&inv(q)>0).sort((a,b)=>ITEMS[a].food[0]-ITEMS[b].food[0])[0];if(best){takeInv(best);eat(ITEMS[best].food[0],ITEMS[best].food[1],ITEMS[best].name);}else{const raw=Object.keys(RAW).find(q=>basketCount(q)>0);if(raw){takeBasket(raw,1);eat(RAW[raw][0],RAW[raw][1],'A raw '+raw);}else toast('Nothing to eat.',1.4);}updateHud();return;}
  const nm={hoe:`${T.hoe>1?'Copper':'Rusty'} hoe — till soil`,can:`${S.waterMax>10?'Copper':'Tin'} can — ${S.water}/${S.waterMax}`,pick:`${T.pick>1?'Steel':'Grandpa’s'} pickaxe — break stone`,axe:`${T.axe>1?'Steel':'Old'} axe — chop stumps`}[k];toast(nm,1.4);}
setInterval(()=>{const hb=$('hotbar');if(!hb)return;hb.style.display=(S.mode!=='play'||$('hud').hidden||S.paused)?'none':'flex';if(!$('hb_seed'))return;
  for(const im of hb.querySelectorAll('img'))if(!im.src&&(SPR['icon32_'+im.dataset.ic]||SPR['icon_'+im.dataset.ic])&&IMG[(SPR['icon32_'+im.dataset.ic]||SPR['icon_'+im.dataset.ic]).src])im.src=iconOf(im.dataset.ic);
  $('hb_seed').textContent=S.seeds[S.sel]||0;$('hb_can').textContent=S.water;const fc=Object.keys(ITEMS).filter(q=>ITEMS[q].food).reduce((a,q)=>a+inv(q),0);$('hb_food').textContent=fc||'';
  const L=($('btnAct').textContent||'');const on=/Till/.test(L)?'hoe':/Water/.test(L)?'can':/Mine|Break/.test(L)?'pick':/Chop/.test(L)?'axe':/Plant/.test(L)?'seed':null;
  for(const b of hb.children)b.classList.toggle('on',b.dataset.k===on);},120);

// ---- trees on the farm can be felled with the axe: that's where wood comes from. Each one leaves a stump to grub out.
const TREE_COL={maple_orange:['#a8441a','#ec9a34'],maple_red:['#8c2222','#d8623a'],maple_gold:['#9c7818','#e4c84a'],maple_green:['#235a26','#52983a']};
function treeChop(){for(const o of OBJ){if(o.hide||(o.kind!=='tree'&&o.kind!=='pine'))continue;if(o.room||o.x>=250)continue;if(o.spr==='deadtree')continue;o.choppable=1;
  o.col=circles.find(c=>Math.hypot(c.x-o.x,c.z-(o.z-.1))<.35)||null;
  interact.push({x:o.x,z:o.z+.2,r:1.2,on:()=>!o.hide,label:()=>'Chop',ok:()=>true,act(){if(P.anim)return;if(!spend(S.tools.axe>1?2:4))return;
    {if(!o.trunkW){const sk=makeStump(o.spr);o.trunkW=sk?Math.round((SPR[sk].foot[2]||.2)*PPM)-1:6;}const vert=Math.abs(P.z-o.z)>Math.abs(P.x-o.x)*1.1;if(vert){P.x=o.x+.04;P.z=P.z>o.z?o.z+.55:o.z-.62;}else{const side=P.x<o.x?-1:1,d=(15+o.trunkW)/PPM;P.x=o.x+side*d;P.z=o.z+.06;}}faceTo(o.x,o.z);
    startAnim('axe',.55,null,()=>{o.hits=(o.hits||0)+1;SFX.thud(0,.45);cam.shake=Math.max(cam.shake,.14);const cc=TREE_COL[o.spr]||['#1d4129','#356538'];
      // the trunk takes a bite on your side, the tree rocks away from you on its base, chips fly from the cut, a few leaves come down
      o.notch=o.hits;o.notchSide=P.x<o.x?-1:1;if(!o.trunkW){const sk=makeStump(o.spr);o.trunkW=sk?Math.round((SPR[sk].foot[2]||.2)*PPM)-1:6;}o.rock={t:0,dir:P.x<o.x?1:-1};
      for(let i=0;i<9;i++)parts.push({x:o.x+o.notchSide*o.trunkW/PPM,z:o.z+.02,y:.38,vx:o.notchSide*(.8+Math.random()*1.6),vz:(Math.random()-.5)*.6,vy:1.2+Math.random()*1.4,t:0,life:.5+Math.random()*.3,col:i%3?'#d8b478':'#8a5c34',size:i%2?2:1});
      if(typeof LEAVES!=='undefined'&&typeof LEAF_COL!=='undefined'&&LEAF_COL[o.spr]){const C=LEAF_COL[o.spr];for(let i=0;i<3;i++)LEAVES.push({x:o.x+(Math.random()-.5)*2.2,z:o.z+(Math.random()-.3)*.6,h:60+Math.random()*30,t:0,ph:Math.random()*6,col:C,land:0});}
      if(o.hits<(S.tools.axe>1?3:5))return;
      // it leans, then comes down away from you, and the crown bursts when it hits
      o.hide=true;o.goneDay=S.day;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}SFX.screech&&SFX.screech();FALLING.push({o,t:0,dir:P.x<o.x?1:-1,cc,landed:false});if(typeof onTreeFelled==='function')onTreeFelled(o);
      const w=o.kind==='pine'?6:8;addInv('wood',w);toast(`Timber. +${w} wood.`,1.6);updateHud();
      if(rand()<.08)setTimeout(()=>toast('Carved into the heartwood, where no one could have reached it: your initials.',3,true),900);
      const sk=makeStump(o.spr)||'stump_maple';const st=obj(sk,o.x,o.z,{kind:'prop',debris:'stump',stumpOf:o});o.stump=st;st.col={x:o.x,z:o.z-.1,r:Math.max(.3,(SPR[sk].foot[2]||.4)*.85)};circles.push(st.col);
      interact.push({x:o.x,z:o.z+.2,r:.85,on:()=>!st.hide,label:()=>'Chop',ok:()=>true,act(){if(P.anim)return;if(!spend(S.tools.axe>1?2:4))return;faceTo(st.x,st.z);
        startAnim('axe',.55,null,()=>{st.hits=(st.hits||0)+1;SFX.thud(0,.4);burst(st.x,st.z,10,'#7d5636',1.4,.7,2);if(st.hits<(S.tools.axe>1?1:2))return;
          st.hide=true;st.goneDay=S.day;const k=circles.indexOf(st.col);if(k>=0)circles.splice(k,1);addInv('wood',3);toast('The stump comes out. +3 wood.',1.4);});}});});}});}}
// trees shake when hit
{const _u3=update;update=function(dt){_u3(dt);for(const o of OBJ)if(o.rock){const r=o.rock;r.t+=dt;o.tilt=r.dir*.06*Math.exp(-r.t*5)*Math.cos(r.t*26);if(r.t>1){o.rock=null;o.tilt=0;}}};}
// ---- crafting from what you gather: wood, stone, fiber, ore
const CRAFT=[['flask','Lamp oil flask',{coal:2,fiber:2},'Refills your lantern once when it runs dry.',()=>{S.flasks++;}],
  ['sprinkler','Brass sprinkler',{copper:3,iron:1,wood:2},'Waters a patch of field every morning (up to 4).',()=>{S.sprinklers=Math.min(4,(S.sprinklers||0)+1);},()=>(S.sprinklers||0)<4],
  ['scare','Straw charm',{fiber:6,wood:2},'Hang it by the field. The crows keep away. Something else does not.',()=>{S.charm=(S.charm||0)+1;toast('You tie the charm to the fence. It turns to face the cornfield on its own.',3,true);}],
  ['candle','Tallow candle',{fiber:3,coal:1},'For the altars in the woods.',()=>{S.candles++;}]];
vendors.craft={name:'Crafting',sub:'Grandpa’s workbench. Everything you gather is good for something.',rows:()=>CRAFT.map(([k,name,need,desc,fn,can])=>({k,name,desc,price:0,can:can?can():true,need,btn:'Craft',buy(){fn();SFX.refill();}}))};
{const bb=$('bagClose');const c=document.createElement('button');c.className='close hot';c.textContent='Craft';c.addEventListener('click',()=>{$('bag').hidden=true;S.paused=false;openShop('craft');});bb.after(c);}
// building now costs timber and stone too
{const _pl2=vendors.plans.rows;vendors.plans.rows=()=>_pl2().map(r=>r.k==='coop'?Object.assign(r,{need:{wood:30,stone:12}}):r.k==='lamps'?Object.assign(r,{need:{wood:10,copper:2}}):r);}

// falling trees: they tip slowly, then fast, then the crown bursts and fades
const FALLING=[];
function fallUpdate(dt){for(let i=FALLING.length-1;i>=0;i--){const f=FALLING[i];f.t+=dt;if(f.t>.85&&!f.landed){f.landed=true;SFX.crash&&SFX.crash();cam.shake=.45;const o=f.o;
      for(let k=0;k<5;k++)burst(o.x+f.dir*(1+k*.7),o.z-.2,12,f.cc[k%2],2.2,1.2,4);burst(o.x+f.dir*2,o.z,10,'#9e7146',1.4,.5,2);}
    if(f.t>1.5)FALLING.splice(i,1);}}
function fallDrawables(D){for(const f of FALLING){const o=f.o;D.push({z:o.z+.05,mind:1,draw(){const k=Math.min(1,f.t/.85),ang=f.dir*1.45*k*k,a=f.t<.85?1:Math.max(0,1-(f.t-.85)/.6);
  ctx2.save();ctx2.translate(Math.round(sx(o.bx!==undefined?o.bx:o.x)),Math.round(sz(o.z)));ctx2.rotate(ang);drawSpr(o.spr,0,0,null,null,0,{alpha:a});ctx2.restore();}});}}
{const _md2=mineDrawables;mineDrawables=function(D){_md2(D);fallDrawables(D);};const _u4=update;update=function(dt){_u4(dt);fallUpdate(dt);};}
