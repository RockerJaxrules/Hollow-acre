/* ================= state ================= */
const SEEDS={turnip:{name:'Turnip',grow:12,sell:6},pumpkin:{name:'Pumpkin',grow:22,sell:18}};
const S={mode:'load',day:1,hour:6.3,coins:10,seeds:{turnip:6,pumpkin:2},sel:'turnip',water:10,waterMax:10,basket:[],candles:0,fuel:100,flasks:1,pages:[],
  shipped:0,caught:0,everTilled:false,everPlanted:false,everWatered:false,paused:false,bound:false,bellRung:false,dusk:false,first:{},bigCan:false,visitedTown:false,storm:false,talked:{},
  foundCabin:false,readLetter:false,parts:{tire:0,battery:0,belt:0,gas:0},carFixed:false,looped:false,q:{},cat:'lost',flashlight:false,fishCaught:0,night:{}};
const tiles=[];for(let i=0;i<FIELD.w;i++)for(let j=0;j<FIELD.h;j++)tiles.push({i,j,x:FIELD.x0+i+.5,z:FIELD.z0+j+.5,tilled:false,crop:null});
const tileAt=(i,j)=>(i<0||j<0||i>=FIELD.w||j>=FIELD.h)?null:tiles[i*FIELD.h+j];
const isNight=()=>S.hour>=20.25;
const P={x:-58.6,z:-6.4,fx:1,fz:0,dir:'E',clip:'idle',t:0,anim:null,spd:0};
const H={state:'gone',timer:6,burn:0,x:0,z:0,spd:1.4,stung:false,whisperT:3,fleeT:0,t:0,lit:false,watchT:0,stepT:0,breathT:0,rise:1,crawl:0,grace:0,dir:'S',ft:0,vis:false,alpha:1,skipT:5};
const altars=ALTAR_POS.map(([x,z,name])=>({x,z,name,lit:false}));
const lit=()=>altars.filter(a=>a.lit).length;
const partsOwned=()=>Object.values(S.parts).filter(v=>v>0).length;
const partsIn=()=>Object.values(S.parts).filter(v=>v===2).length;
const basketCount=k=>S.basket.filter(b=>b.kind===k).length;
function takeBasket(k,n){for(let i=0;i<n;i++){const idx=S.basket.findIndex(b=>b.kind===k);if(idx>=0)S.basket.splice(idx,1);}}
const DIRS=['E','S','W','N'];
const dirOf=(x,z)=>Math.abs(x)>Math.abs(z)?(x>0?'E':'W'):(z>0?'S':'N');
/* ================= people ================= */
//@@STORY@@
const NPCPOS={mae:{day:[31,-8.5],path:[[31,-8.5],[28.6,-8.3],[34,-8.4]]},hale:{day:[48,-17.6],path:[[48,-17.6],[50.6,-16.6],[45.4,-16.8]]},
  tobias:{day:[46,-3.2],path:[[46,-3.2],[50.5,-4],[48,-1.8],[44,-5.6]]},hollis:{day:[-35,-9.6],path:[[-35,-9.6],[-30,-9.4],[-39,-9.8]]},
  agnes:{day:[-46,-8.6],path:[[-46,-8.6],[-44,-8.2],[-48,-8.4]],nightPos:[-46,-8.6]},dunn:{day:[60,-8.6],path:[[60,-8.6],[56,-8.2],[64,-8.4],[58,-4.2]]}};
for(const d of NPCDEF)if(NPCPOS[d.id])Object.assign(d,NPCPOS[d.id]);
const npcs=NPCDEF.map(d=>({def:d,x:d.day[0],z:d.day[1],dir:'S',clip:'idle',t:Math.random()*4,wp:0,wait:Math.random()*4,vis:true,spd:0}));
const npcById=id=>npcs.find(n=>n.def.id===id);
const ruth={x:0,z:0,vis:false,t:0,on:false,done:false};
const cat={x:-8,z:20,vis:true,dir:'S',clip:'idle',t:0,tx:-6,tz:18,tt:0,meow:3};
const crows=[];
const scare={x:6.9,z:4,vis:true};
const pageEnts=PAGES.map((pg,i)=>({x:pg.x,z:pg.z,i}));
const mushrooms=[];for(let i=0;i<12;i++)mushrooms.push({x:0,z:0,taken:true});
function spawnMushrooms(){for(const m of mushrooms){let x,z,k=0;do{x=lerp(-70,-16,rand());z=lerp(6,38,rand());k++;}while(k<60&&(!clearSpot(x,z,.5)||Math.hypot(x-pond.x,z-pond.z)<pond.r+2));m.x=x;m.z=z;m.taken=false;}}
function placeScarecrow(day){const sp=SCARE_SPOTS[Math.min(day-1,SCARE_SPOTS.length-1)];scare.x=sp[0];scare.z=sp[1];}
function resetCat(){cat.vis=true;cat.x=lerp(CORN.x0+1,CORN.x1-1,rand());cat.z=lerp(CORN.z0+1,CORN.z1-1,rand());}
function placeNPCs(){const night=S.hour>=20&&!S.bound;for(const n of npcs){const d=n.def;
  if(night&&S.day>=2){n.vis=true;n.x=d.nightPos[0];n.z=d.nightPos[1];n.dir=d.id==='agnes'?'N':'W';}
  else if(night)n.vis=false;else{n.vis=S.hour<19.5;n.x=d.day[0];n.z=d.day[1];n.wp=0;n.wait=rand()*4;}}}
/* ================= HUD ================= */
const ui={day:$('clock').querySelector('.day'),time:$('clock').querySelector('.time'),bar:$('clock').querySelector('.bar i'),coins:$('iCoins'),turnip:$('iTurnip'),pumpkin:$('iPumpkin'),
  water:$('iWater'),basket:$('iBasket'),candles:$('iCandles'),oil:$('iOil'),oilChip:$('cOil'),pages:$('iPages'),parts:$('iParts'),obj:$('objective'),toast:$('toast'),act:$('btnAct'),seed:$('btnSeed'),arrow:$('arrow'),subs:$('subs')};
let toastT=0;
function toast(msg,dur,red){ui.toast.textContent=msg;ui.toast.classList.add('show');ui.toast.classList.toggle('red',!!red);toastT=dur||3.2;}
function fmtTime(h){const hh=Math.floor(h)%24,mm=Math.floor((h%1)*6)*10;const ap=hh>=12?'PM':'AM';const h12=((hh+11)%12)+1;return `${h12}:${mm<10?'0':''}${mm} ${ap}`;}
let lastHud='';
function updateHud(){const s=[S.day,fmtTime(S.hour),S.coins,S.seeds.turnip,S.seeds.pumpkin,S.water,S.basket.length,S.candles,Math.ceil(S.fuel),S.flasks,S.pages.length,S.sel,S.waterMax,partsIn(),partsOwned()].join('|');
  if(s!==lastHud){lastHud=s;ui.day.textContent='Day '+S.day;ui.time.textContent=fmtTime(S.hour);ui.coins.textContent=S.coins;ui.turnip.textContent=S.seeds.turnip;ui.pumpkin.textContent=S.seeds.pumpkin;
    ui.water.textContent=S.water+'/'+S.waterMax;ui.basket.textContent=S.basket.length;ui.candles.textContent=S.candles;ui.oil.textContent=Math.ceil(S.fuel)+'%'+(S.flasks?' +'+S.flasks:'');
    ui.oilChip.classList.toggle('low',S.fuel<25);ui.pages.textContent=S.pages.length+'/6';ui.parts.textContent=(S.carFixed?'4':Math.max(partsIn(),partsOwned()))+'/4';ui.seed.textContent=SEEDS[S.sel].name;}
  ui.bar.style.width=(clamp((S.hour-6)/20,0,1)*100)+'%';mindHud();}
function objective(){const L=lit(),np=S.pages.length;
  if(S.bound)return ['Free play','The field is quiet now. Grow whatever you like.',null];
  if(!S.foundCabin)return ['Stranded','Your car is wrecked. Walk east along the road to Grandpa’s farm.',doorPos];
  if(!S.readLetter)return ['The farm','Read the note nailed to the cabin door.',doorPos];
  if(!S.everTilled)return ['Farm','Walk into the brown field and tap Till. Crops are how you earn coins here.',{x:0,z:3}];
  if(!S.everPlanted)return ['Plant','Plant seeds in the tilled soil. Switch seeds with the small button.',null];
  if(!S.everWatered)return ['Water','Water your seedlings. Refill the can at the well.',null];
  if(S.shipped===0)return ['Sell','Harvest ripe crops and drop them in the bin by the cabin.',S.basket.length?binPos:null];
  if(!S.q.hollis)return ['The car','Find someone to fix your car. Hollis’s garage is west on Route 9.',npcById('hollis')];
  if(!S.carFixed){const miss=Object.keys(S.parts).filter(k=>!S.parts[k]);
    if(!miss.length)return ['The car','You have every part. Install them at your wrecked car.',carPos];
    const where={tire:'tire from Mae',battery:'battery (3 pumpkins to Hollis)',belt:'fan belt (ask Agnes)',gas:'gas from the pump'};
    const tgt={tire:npcById('mae'),battery:npcById('hollis'),belt:npcById('agnes'),gas:pumpPos}[miss[0]];
    return ['The car',`Car parts ${4-miss.length}/4. Still need: ${miss.map(k=>where[k]).join(', ')}.`,tgt];}
  if(!S.looped)return ['Leave','The car runs. Get in and drive away from Marrow Hollow.',carPos];
  if(S.candles+L<3){if(isNight())return ['Candles',`There is no road out. Buy Ward Candles at the crossroads after dark. ${S.candles+L}/3`,crossPos];
    return ['Candles',`There is no road out. Save coins, then buy 3 Ward Candles at the crossroads after dark. ${S.candles+L}/3`+(np<6?` · Diary ${np}/6`:''),null];}
  const next=altars.filter(a=>!a.lit).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];
  if(!isNight())return ['Wait','Wait for the bell, then light the three stones. '+L+'/3 lit',next];
  return ['The rite',`Light the ${next.name} stone. ${L}/3 lit. Keep your light on it.`,next];}
/* ================= sheets ================= */
const vendors={
  mae:{name:'Mae’s Goods',sub:'"Everything fair, dear. Everything fair."',rows:()=>[
    {k:'turnip',name:'Turnip seeds ×3',desc:'Quick to grow. Sells for 6.',price:6,can:true},
    {k:'pumpkin',name:'Pumpkin seeds ×2',desc:'Slow and heavy. Sells for 18.',price:14,can:true},
    {k:'tire',name:'Tire, used',desc:S.parts.tire?'Already yours.':'"Off a hearse, but it’ll fit." A car part.',price:35,can:!S.parts.tire},
    {k:'oil',name:'Lamp oil flask',desc:S.flasks>=3?'You can only carry three.':`Refills your lantern when it runs dry. You have ${S.flasks}.`,price:8,can:S.flasks<3},
    {k:'can',name:'Copper watering can',desc:S.bigCan?'Already yours.':'Holds 20 water instead of 10.',price:30,can:!S.bigCan}]},
  peddler:{name:'The Peddler',sub:'It breathes wetly under the hood. "Wax for coin. Your grandfather paid the same."',rows:()=>{const need=3-S.candles-lit();return [
    {k:'candle',name:'Ward Candle',desc:need>0?`Black wax, braided with hair. You need ${need} more.`:'You have all you need.',price:25,can:need>0},
    {k:'oil',name:'Oil that smells of pennies',desc:S.flasks>=3?'You can only carry three.':`A flask for your lantern. You have ${S.flasks}.`,price:12,can:S.flasks<3},
    {k:'turnip',name:'Grey turnip seeds ×3',desc:'They grow the same. Probably.',price:8,can:true}];}},
};
let shopV='mae';
function openShop(v){shopV=v;S.paused=true;$('shopName').textContent=vendors[v].name;$('shopSub').textContent=vendors[v].sub;$('shop').hidden=false;renderShop();}
function renderShop(){const bx=$('shopRows');bx.innerHTML='';
  for(const r of vendors[shopV].rows()){const d=document.createElement('div');d.className='shop-row';d.innerHTML=`<div><strong>${r.name}</strong><span>${r.desc}</span></div>`;
    const b=document.createElement('button');b.className='buy';b.textContent=r.price+' coins';b.disabled=!r.can||S.coins<r.price;
    b.addEventListener('click',()=>{if(S.coins<r.price)return;S.coins-=r.price;SFX.coin();
      if(r.k==='turnip')S.seeds.turnip+=3;else if(r.k==='pumpkin')S.seeds.pumpkin+=2;else if(r.k==='candle')S.candles++;else if(r.k==='oil')S.flasks++;else if(r.k==='tire')S.parts.tire=1;else{S.bigCan=true;S.waterMax=20;S.water=20;}renderShop();updateHud();});
    d.appendChild(b);bx.appendChild(d);}}
$('shopClose').addEventListener('click',()=>{$('shop').hidden=true;S.paused=false;});
let noteCb=null;
function openNote(html,btn,cb){S.paused=true;$('noteText').innerHTML=html;$('noteClose').textContent=btn||'Put it down';noteCb=cb||null;$('note').hidden=false;A.hiss&&A.hiss(.3,.06,'highpass',3000);}
$('noteClose').addEventListener('click',()=>{$('note').hidden=true;S.paused=false;const cb=noteCb;noteCb=null;if(cb)cb();});
let talkingTo=null;
function questLine(n){const id=n.def.id,q=S.q;
  if(id==='hollis'){if(!q.hollis){q.hollis=1;return 'That your car out by the big oak? Hell of a thing. I can fix it. I need four parts: a tire, Mae sells one in town. A battery, I’ve got one, but I want three pumpkins for it. A fan belt, Agnes has her husband’s old truck rotting in the yard. And gas, from my pump. Twenty in the honor box.';}
    if(!S.parts.battery){if(basketCount('pumpkin')>=3){takeBasket('pumpkin',3);S.parts.battery=1;SFX.coin();return 'Now those are pumpkins. Here’s your battery. Don’t ask whose car it came out of.';}return 'Three pumpkins for the battery. Grow ’em yourself. Nobody else here will sell you any.';}
    if(S.carFixed&&!S.looped)return 'She’ll run. Whether the road lets you go is another thing.';if(S.looped)return 'Came back, huh? They all come back. I’m sorry, friend.';}
  if(id==='agnes'){if(S.cat==='carried'){S.cat='home';S.parts.belt=1;cat.vis=true;cat.x=-44.6;cat.z=-8.2;SFX.meow();return 'Whiskers! Oh, you found her. Here. Harold’s fan belt, off his truck. He won’t be driving it. Nobody drives out of here.';}
    if(!q.agnes&&S.cat==='lost'){q.agnes=1;return 'You need a belt? Harold’s truck has one. I’ll trade it, but find my Whiskers first. She ran into the corn by Elias’s farm. She always runs to the corn.';}
    if(S.cat==='lost')return 'Whiskers is in the corn. Please. I can hear her at night, and sometimes I hear something answer.';}
  if(id==='dunn'){if(!S.flashlight){if(!q.dunn){q.dunn=1;return 'Want something for that dark? I’ll trade my old service flashlight for three fish from the pond. Department budget. Don’t fish after dark.';}
      if(basketCount('fish')>=3){takeBasket('fish',3);S.flashlight=true;SFX.coin();return 'Here. It throws light farther than that lantern. Wider, too. Use it on whatever needs it.';}return 'Three fish. The pond’s west, past the Abernathy place.';}}
  if(id==='tobias'){if(!q.tobias){q.tobias=1;return 'Can you bring me a glowcap? The glowing mushrooms in the west woods. Mama won’t let me go past the road.';}
    if(q.tobias===1&&basketCount('mushroom')>=1){takeBasket('mushroom',1);q.tobias=2;S.coins+=12;SFX.coin();return 'Thanks! Here’s twelve coins. Can I tell you a secret? Ruth Abernathy was the Tithe last year. She still comes to your well when the sun goes down. She’s looking for her mama.';}}
  if(id==='hale'&&!q.hale&&S.pages.length>=3){q.hale=1;S.candles++;return 'You’ve been reading his diary. I can see it on you. He left this with me. One Ward Candle. Don’t tell anyone where you got it.';}
  if(id==='mae'&&S.parts.tire===0&&S.q.hollis)return 'A tire? I have one. Off a hearse, but it’ll fit. Thirty-five coins.';
  return null;}
function talk(n){const d=n.def,night=isNight();S.paused=true;talkingTo=n;$('talkName').textContent=d.name;$('talkRole').textContent=night?'Standing in the dark, facing your farm':d.role;
  let line=null;if(!night)line=questLine(n);
  if(!line)line=night?d.night[(S.day+((S.talked[d.id]||0)))%d.night.length]:d.lines[Math.min(S.day,d.lines.length)-1];S.talked[d.id]=(S.talked[d.id]||0)+1;
  $('talkLine').innerHTML=`<q>${line}</q>`;$('talkTrade').hidden=!(d.id==='mae'&&!night);$('talk').hidden=false;
  if(d.id==='mae'&&!night&&S.day===2&&!S.first.maeOil){S.first.maeOil=true;S.flasks=Math.min(3,S.flasks+1);toast('Mae pressed a flask of oil into your hand.',2.4);}
  if(night)A.hiss&&A.hiss(1,.06,'bandpass',1800,{q:5,wobble:true,verb:true});}
$('talkClose').addEventListener('click',()=>{$('talk').hidden=true;S.paused=false;talkingTo=null;});
$('talkTrade').addEventListener('click',()=>{$('talk').hidden=true;talkingTo=null;openShop('mae');});
function readPage(i){if(!S.pages.includes(i))S.pages.push(i);const pg=PAGES[i];SFX.page();
  openNote(`<p class="date">Grandpa’s diary · ${pg.date}</p><p>${pg.text}</p><p class="date" style="text-align:right">Page ${S.pages.length} of 6</p>`);
  if(S.pages.length===6)setTimeout(()=>toast('You know what the Hollow is now.',3),300);}
/* ================= interactions ================= */
let phone={ring:false,t:0};
const fish={state:'off',t:0,bx:0,bz:0};
const interact=[
  {x:wellPos.x,z:wellPos.z+.6,r:2.2,label:()=>S.water>=S.waterMax?'Full':'Refill',ok:()=>S.water<S.waterMax,act(){S.water=S.waterMax;SFX.refill();toast('The can is full. The water smells of iron.',2);}},
  {x:binPos.x,z:binPos.z,r:1.8,label:()=>S.basket.length?`Ship ${S.basket.length}`:'Bin',ok:()=>S.basket.length>0,act(){let v=0;for(const b of S.basket)v+=b.value;
    S.coins+=v;S.shipped+=S.basket.length;S.basket=[];SFX.coin();burst(binPos.x,binPos.z,18,'#f1cf7a',2,.8,3);toast(`Shipped for ${v} coins`,2.4);}},
  {x:doorPos.x,z:doorPos.z,r:1.6,label:()=>!S.readLetter?'Read note':S.hour>=18?'Sleep':'Note',ok:()=>true,act(){if(!S.readLetter||S.hour<18){S.readLetter=true;openNote(LETTER.map(p=>p.startsWith('<span')?p:`<p>${p}</p>`).join(''));return;}sleep();}},
  {x:crossPos.x+.6,z:crossPos.z+2.6,r:2.2,on:()=>S.hour>=19.5&&!S.bound,label:()=>'Trade',ok:()=>true,act(){openShop('peddler');}},
  {x:boardPos.x,z:boardPos.z+.4,r:1.5,label:()=>'Read',ok:()=>true,act(){openNote('<p class="date">Nailed to the board, fresh</p><p><b>MARROW HOLLOW HARVEST FESTIVAL</b></p><p>The Tithe will be honored on the last night of the month, as it always has been.</p><p>Welcome home, Elias’s kin. We have been waiting.</p><p style="text-align:right">— The Council of Lots</p>');}},
  {x:tsPos.x,z:tsPos.z+.4,r:1.5,label:()=>'Read',ok:()=>true,act(){toast('MARROW HOLLOW. Pop. 41, scratched out. Someone carved 40.',3);}},
  {x:farmSignPos.x,z:farmSignPos.z+.4,r:1.5,label:()=>'Read',ok:()=>true,act(){toast('HOLLOW ACRE. E. Marsh, prop. Somebody has scratched a tally into the post. 31 marks.',3.2);}},
  {x:carPos.x-.8,z:carPos.z+3.4,r:2.4,label:()=>S.looped?'Wreck':S.carFixed?'Drive away':(partsOwned()>partsIn()?'Install':'Car'),ok:()=>!S.looped,act(){carAct();}},
  {x:pumpPos.x,z:pumpPos.z+.6,r:2,label:()=>S.parts.gas?'Pump':'Gas · 20',ok:()=>!S.parts.gas,act(){if(S.coins<20){toast('The honor box wants 20 coins.',2);SFX.deny();return;}S.coins-=20;S.parts.gas=1;SFX.refill();toast('A full can of gas. The pump hums after you let go of it.',2.6);}},
  {x:fishSpot.x,z:fishSpot.z,r:1.4,label:()=>fish.state==='off'?'Fish':fish.state==='bite'?'Reel!':'Wait…',ok:()=>fish.state!=='wait',act(){fishAct();}},
  {x:boothPos.x,z:boothPos.z+.7,r:1.6,label:()=>phone.ring?'Answer':'Phone',ok:()=>phone.ring,act(){answerPhone();}},
  {cat:true,x:0,z:0,r:1.3,on:()=>S.cat==='lost'&&cat.vis,label:()=>'Pick up',ok:()=>true,act(){S.cat='carried';SFX.meow();toast('Whiskers. She is shaking. Something in the corn scared her.',2.6);}},
  ...mushrooms.map(m=>({mush:m,x:0,z:0,r:1.2,on:()=>!m.taken,label:()=>'Pick',ok:()=>true,act(){m.taken=true;S.basket.push({kind:'mushroom',value:5});SFX.plant();toast('Glowcap mushroom. Sells for 5. Tobias might want one.',2.2);}})),
  ...pageEnts.map(pg=>({x:pg.x,z:pg.z,r:1.4,on:()=>!S.pages.includes(pg.i),label:()=>'Read',ok:()=>true,act(){readPage(pg.i);}})),
  ...altars.map(a=>({x:a.x,z:a.z+.5,r:2.2,label:()=>a.lit?'Burning':(S.candles>0?(isNight()?'Light':'Wait'):'Stone'),ok:()=>!a.lit,
    act(){if(S.candles<=0){toast('An old stone with a carved sign. A stub of black wax sits on top. It wants a candle.',2.8);return;}
      if(!isNight()){toast('The rite needs the moon. Come back after the bell.',2.4);SFX.deny();return;}lightAltar(a);}})),
  ...NPCDEF.map((d,i)=>({npc:i,x:0,z:0,r:1.7,on:()=>npcs[i].vis,label:()=>'Talk',ok:()=>true,act(){talk(npcs[i]);}})),
];
function targetTile(){for(const dd of[.8,.35,1.3]){const x=P.x+P.fx*dd,z=P.z+P.fz*dd+.1;const t=tileAt(Math.floor(x-FIELD.x0),Math.floor(z-FIELD.z0));if(t)return t;}return null;}
let ctx={label:'',ok:false},hlTile=null;
function computeContext(){let best=null,bd=1e9;
  for(const it of interact){if(it.npc!==undefined){it.x=npcs[it.npc].x;it.z=npcs[it.npc].z;}if(it.mush){it.x=it.mush.x;it.z=it.mush.z;}if(it.cat){it.x=cat.x;it.z=cat.z;}
    if(it.on&&!it.on())continue;const d=Math.hypot(P.x-it.x,P.z-it.z);if(d<it.r+.3){const dot=((it.x-P.x)*P.fx+(it.z-P.z)*P.fz)/(d||1);if(d>1&&dot<.3)continue;const sc=d*(1.6-dot);if(sc<bd){bd=sc;best=it;}}}
  hlTile=null;if(best)return {label:best.label(),ok:best.ok(),act:best.act};
  const t=targetTile();if(!t)return {label:'',ok:false};hlTile=t;
  if(!t.tilled)return {label:'Till',ok:true,act:()=>doTill(t)};const c=t.crop;
  if(!c){const has=S.seeds[S.sel]>0,other=S.sel==='turnip'?'pumpkin':'turnip';
    if(!has&&S.seeds[other]>0)return {label:'Plant '+SEEDS[other].name,ok:true,act:()=>{S.sel=other;doPlant(t);}};
    return has?{label:'Plant '+SEEDS[S.sel].name,ok:true,act:()=>doPlant(t)}:{label:'No seeds',ok:false};}
  if(c.stage>=3)return {label:'Harvest',ok:true,act:()=>doHarvest(t)};
  if(!c.watered)return S.water>0?{label:'Water',ok:true,act:()=>doWater(t)}:{label:'Can empty',ok:false};
  return {label:'Growing '+Math.floor(c.growth/(SEEDS[c.type].grow*3)*100)+'%',ok:false};}
function faceTo(x,z){const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);}
function startAnim(clip,dur,t,fire){P.anim={clip,dur,t:0,fire,fired:false};if(t)faceTo(t.x,t.z);}
function doTill(t){startAnim('hoe',.7,t,()=>{t.tilled=true;S.everTilled=true;SFX.till();burst(t.x,t.z,14,'#6a4a30',1.6,.6,2);cam.shake=Math.max(cam.shake,.12);});}
function doPlant(t){if(S.seeds[S.sel]<=0)return;const type=S.sel;startAnim('pick',.7,t,()=>{if(t.crop||S.seeds[type]<=0)return;S.seeds[type]--;S.everPlanted=true;t.crop={type,stage:0,growth:0,watered:false,pop:0};SFX.plant();
  burst(t.x,t.z,6,'#d8c890',.6,.5,1);if(S.seeds[S.sel]<=0){const o=S.sel==='turnip'?'pumpkin':'turnip';if(S.seeds[o]>0)S.sel=o;}});}
function doWater(t){if(S.water<=0)return;startAnim('water',1.1,t,()=>{if(!t.crop)return;S.water--;S.everWatered=true;t.crop.watered=true;SFX.water();
  for(let i=0;i<14;i++)parts.push({x:t.x+(Math.random()-.5)*.5,z:t.z+(Math.random()-.5)*.3,y:.8,vx:0,vz:0,vy:-1-Math.random(),t:0,life:.4,col:'#9cc8e8',size:1});if(S.water===0)toast('The can is empty. Refill it at the well.',2.2);});}
function doHarvest(t){const c=t.crop;startAnim('pick',.7,t,()=>{if(t.crop!==c)return;const moon=isNight();S.basket.push({kind:c.type,value:SEEDS[c.type].sell*(moon?2:1)});t.crop=null;SFX.harvest();
  burst(t.x,t.z,12,'#5a4030',1.4,.6,2);
  if(moon&&!S.first.moon){S.first.moon=true;toast('Moonlit harvest. These sell for double.',2.6);}
  else if(moon&&rand()<.25){A.tone&&A.tone(900,.35,'sawtooth',.06,{slide:1400,filter:['bandpass',1200,3]});toast('The turnip had a face. It was screaming.',2.4,true);}});}
function lightAltar(a){S.candles--;a.lit=true;SFX.ignite();burst(a.x,a.z,40,'#ff9040',2.5,1.2,3);const L=lit();
  if(L>=3){startRitualEnd();return;}
  toast(L===1?'The flame takes. Somewhere in the dark, something stops breathing.':'Two burn. It knows what you are doing now. It is running.',3.2,L===2);
  H.spd+=.4;if(H.state==='gone')H.timer=.5;else if(H.state==='watch')H.state='stalk';}
function carAct(){if(S.carFixed){if(S.hour<17){toast('Not yet. You want daylight left when you hit the highway. Come back near sunset.',2.8);return;}startCine('escape');return;}
  let n=0;for(const k in S.parts)if(S.parts[k]===1){S.parts[k]=2;n++;}
  if(n){SFX.till();burst(carPos.x,carPos.z+2,10,'#aaaaaa',1.5,.6,2);
    if(partsIn()===4){S.carFixed=true;toast('You turn the key. The engine coughs, then catches. The radio turns on by itself.',3.6);SFX.engineStart();}
    else toast(`Installed. ${partsIn()}/4 parts in the car.`,2.2);}
  else toast(partsIn()?`${partsIn()}/4 parts installed. The hood is still steaming.`:'The front end is wrapped around the oak. Something left long scratches on the roof.',3);}
function fishAct(){if(fish.state==='off'){fish.state='wait';fish.t=2+rand()*4;P.x=fishSpot.x;P.z=fishSpot.z;P.fx=0;P.fz=1;P.dir='S';fish.bx=fishSpot.x+(rand()-.5);fish.bz=fishSpot.z+3+rand()*1.5;return;}
  if(fish.state==='bite'){const night=isNight();if(night&&rand()<.3&&!S.bound){fish.state='off';SFX.stinger();cam.shake=.4;toast('A grey hand comes up with the hook in its palm. It lets go.',3,true);return;}
    const r=rand();const f=night?(r<.5?{n:'eyeless pike',v:20}:{n:'catfish',v:12}):(r<.15?{n:'catfish',v:12}:{n:'perch',v:6});
    S.basket.push({kind:'fish',value:f.v});S.fishCaught++;SFX.splash();burst(fish.bx,fish.bz,14,'#9fc0e0',2,.6,3);toast(`Caught a ${f.n}. Worth ${f.v}.`,2);fish.state='off';}}
function fishUpdate(dt){if(fish.state==='off')return;if(Math.hypot(P.x-fishSpot.x,P.z-fishSpot.z)>1.2){fish.state='off';return;}fish.t-=dt;
  if(fish.state==='wait'&&fish.t<=0){fish.state='bite';fish.t=.9;SFX.splash(.4);try{navigator.vibrate&&navigator.vibrate(60);}catch(e){}}
  else if(fish.state==='bite'&&fish.t<=0){toast('It got away.',1.4);fish.state='wait';fish.t=2+rand()*4;}}
function answerPhone(){phone.ring=false;S.night.phone=2;A.hiss&&A.hiss(1.2,.1,'bandpass',1400,{q:3,wobble:true});
  toast('Static. Breathing. Then Grandpa’s voice, very close: "Kid. Don’t hang up. Turn around."',3.6,true);
  setTimeout(()=>{if(S.mode!=='play'||S.bound)return;H.x=P.x-P.fx*3.2;H.z=P.z-P.fz*3.2;collide(H,.4);H.state='stalk';H.rise=1;H.burn=0;H.stung=false;H.grace=1.6;H.crawl=0;H.vis=true;SFX.stinger();cam.shake=.5;SFX.breath(0);},2200);}
/* ================= day cycle ================= */
function newDay(msg,pos){S.day++;S.hour=6;S.bellRung=false;S.dusk=false;S.storm=false;S.night={};H.state='gone';H.timer=6;H.vis=false;H.spd=[1.4,1.95,2.45][Math.min(S.day-1,2)]+lit()*.4;
  for(const t of tiles)if(t.crop&&t.crop.stage<3)t.crop.watered=false;phone.ring=false;ruth.done=false;ruth.vis=false;
  const sp=pos||[0,-7.6];P.x=sp[0];P.z=sp[1];P.fx=0;P.fz=1;P.dir='S';P.anim=null;fish.state='off';
  if(!S.bound){scare.vis=true;placeScarecrow(S.day);}S.fuel=100;placeNPCs();spawnMushrooms();if(S.cat==='lost')resetCat();
  toast(msg||(S.day===3&&!S.bound?`Day ${S.day}. The scarecrow is standing at your porch now. Facing the door.`:S.day===2&&!S.bound?`Day ${S.day}. The scarecrow has moved. It is by the well.`:`Day ${S.day}. The soil is dry again.`),3.8);}
function fade(v){$('fade').style.opacity=v;}
function sleep(){if(S.mode!=='play')return;S.mode='trans';fade(1);if(!S.bound&&isNight()){setTimeout(()=>SFX.thud(0,.4),400);setTimeout(()=>SFX.thud(0,.4),800);setTimeout(()=>SFX.thud(0,.4),1200);}
  setTimeout(()=>{newDay(S.day===1?'Day 2. Something knocked three times in the night. The scarecrow has moved to the well.':null);fade(0);S.mode='play';},1500);}
function collapse(){if(S.mode!=='play')return;S.mode='trans';fade(1);setTimeout(()=>{const lost=Math.min(S.coins,8);S.coins-=lost;newDay(`You collapsed in the dirt at 2 AM. Something dragged you home by the ankle.${lost?' '+lost+' coins lost.':''}`);fade(0);S.mode='play';},1200);}
/* ================= the Hollow ================= */
let sputT=0,sputCD=6,darkT=0;
const lanternOn=()=>S.fuel>0&&sputT<=0;
function spawnHollow(near,watch){const back=Math.atan2(-P.fz,-P.fx);
  for(let k=0;k<14;k++){const a=back+(rand()-.5)*1.8,d=near?lerp(9,12,rand()):lerp(13,17,rand());const x=P.x+Math.cos(a)*d,z=P.z+Math.sin(a)*d;H.x=clamp(x,B.x0+2,B.x1-2);H.z=clamp(z,B.z0+2,B.z1-2);if(x>B.x0+2&&x<B.x1-2&&z>B.z0+2&&z<B.z1-2)break;}
  collide(H,.4);H.state=watch?'watch':'stalk';H.watchT=watch?9:0;H.burn=0;H.stung=false;H.vis=true;H.alpha=1;H.rise=0;H.crawl=0;}
function onScreen(x,z,m){const X=sx(x),Y=sz(z);m=m||0;return X>-m&&X<VW+m&&Y>-m&&Y<VH+m;}
function hollowUpdate(dt){H.t+=dt;H.ft+=dt;if(H.grace>0)H.grace-=dt;
  if(S.bound||!isNight()){if(H.state!=='gone'&&!S.bound){H.state='gone';H.vis=false;}return 99;}
  if(H.state==='gone'){H.timer-=dt;if(H.timer<=0){spawnHollow(false,!S.first['watch'+S.day]);if(H.state==='watch')S.first['watch'+S.day]=1;}return 99;}
  if(H.state==='lunge'){H.lungeT-=dt;H.clip='scream';if(H.lungeT<=0){H.state='flee';H.fleeT=.9;H.grace=3;}return 2;}
  if(H.state==='flee'){H.fleeT-=dt;H.alpha=clamp(H.fleeT/.9,0,1);if(H.fleeT<=0){H.state='gone';H.timer=8+rand()*6;H.vis=false;}return 99;}
  const dx=P.x-H.x,dz=P.z-H.z,d=Math.hypot(dx,dz)||.01;const dot=(-dx*P.fx-dz*P.fz)/d;
  const range=S.flashlight?11:8.5,cone=S.flashlight?.72:.6;
  H.lit=lanternOn()&&d<range&&dot>Math.cos(cone);H.rise=Math.min(1,H.rise+dt*1.2);H.dir=dirOf(dx,dz);
  if(H.state==='watch'){H.watchT-=dt;H.clip=H.lit?'frozen':'idle';
    if(H.lit&&!H.stung&&d<range){H.stung=true;SFX.stinger();cam.shake=.3;if(!S.first.seen){S.first.seen=true;toast('It is standing there. Keep the light on it. It cannot move while seen.',3.6,true);}}
    if(H.watchT<=0||d<6||(H.stung&&!H.lit&&H.watchT<6)){H.state='stalk';if(!H.lit){H.x=P.x-P.fx*(9+rand()*3);H.z=P.z-P.fz*(9+rand()*3);collide(H,.4);H.rise=.4;}}
  }else if(H.lit){H.burn+=dt*(S.flashlight?1.3:1);H.crawl=Math.max(0,H.crawl-dt*.6);H.clip='frozen';
    if(!H.stung&&d<range){H.stung=true;SFX.stinger();cam.shake=.35;if(!S.first.seen){S.first.seen=true;toast('Keep the light on it. It cannot move while seen.',3.2,true);}}
    if(H.burn>2.2){H.state='flee';H.fleeT=.9;H.clip='scream';H.ft=0;SFX.shriek(0);burst(H.x,H.z,30,'#ff5020',2,.9,4);}
  }else{H.burn=Math.max(0,H.burn-dt*.4);const wantCrawl=(d<8&&S.day>=2)||d>14?1:0;
    if(wantCrawl&&H.crawl<.1&&d<8&&!S.night.crawl){S.night.crawl=1;SFX.shriek(0);toast('It drops onto all fours.',2.2,true);}
    H.crawl=lerp(H.crawl,wantCrawl,dt*2.5);H.clip=H.crawl>.5?'crawl':'walk';
    const lurch=.45+.55*Math.abs(Math.sin(H.t*3.1));let spd=H.spd*(1+H.crawl*.55)*lurch*(d<6?1.25:1);if(d>16)spd*=1.6;if(inCorn(H.x,H.z))spd*=1.15;
    H.x+=dx/d*spd*dt;H.z+=dz/d*spd*dt;collide(H,.4);
    H.skipT-=dt;if(H.skipT<=0){H.skipT=4+rand()*4;if(!onScreen(H.x,H.z-1.5,-10)&&d>6&&d<15){H.x+=dx/d*3;H.z+=dz/d*3;collide(H,.4);SFX.breath(0);}}
    H.stepT-=dt*lurch*(1+H.crawl);if(H.stepT<=0&&d<15){H.stepT=.55;SFX.thud(clamp(-dx/10,-1,1),.06+.25*(1-d/15));}
    H.whisperT-=dt;if(H.whisperT<=0&&d<14&&dot<.2){SFX.whisper(clamp(-dx/10,-1,1));H.whisperT=4+rand()*4;}
    H.breathT-=dt;if(H.breathT<=0&&d<5&&dot<0){SFX.breath(0);H.breathT=2.6;}
    sputCD-=dt;if(sputCD<=0&&d<9&&S.fuel>0){sputCD=10+rand()*8;sputT=1.1+rand()*.6;SFX.sputter();H.ambush=sputT-.15;}
    if(H.ambush>0){H.ambush-=dt;if(H.ambush<=0&&H.grace<=0){H.ambush=0;jumpScare('dark');return 2;}}
    const back=(-dx*P.fx-dz*P.fz)/d<-.5;
    if(P.dir!==lastDir&&d<7&&back===false&&H.grace<=0&&S.day>=1&&!S.night.turn&&dot>.7){S.night.turn=1;jumpScare('turn');return 2;}
    peekCD-=dt;if(peekCD<=0&&H.grace<=0&&d<14){peekCD=35+rand()*30;jumpScare('lunge');return 2;}}
  if(d<1.1&&H.rise>=1&&H.state==='stalk'&&H.grace<=0)caught();
  return d;}
function ruthUpdate(dt){
  if(!ruth.on&&!ruth.done&&!S.bound&&S.hour>18.3&&S.hour<20&&S.foundCabin){const p={x:P.x+P.fx*9+(rand()-.5)*4,z:P.z+P.fz*9+(rand()-.5)*4};collide(p,.3);
    ruth.x=p.x;ruth.z=p.z;ruth.vis=true;ruth.on=true;ruth.t=0;A.tone&&A.tone(523,2.5,'sine',.025,{verb:true});A.tone&&A.tone(622,2.5,'sine',.02,{verb:true,delay:.8});}
  if(ruth.on){ruth.t+=dt;const d=Math.hypot(P.x-ruth.x,P.z-ruth.z);ruth.dir=dirOf(P.x-ruth.x,P.z-ruth.z);
    if(d<4||ruth.t>14){ruth.vis=false;ruth.on=false;ruth.done=true;SFX.whisper(0);toast(d<4?'A little girl’s voice, right in your ear: "He’s already behind you."':'The girl is gone. Wet footprints lead toward the corn.',3,true);}}}
function catUpdate(dt){cat.vis=S.cat!=='carried';if(S.cat!=='lost'){cat.clip='idle';cat.t+=dt;return;}
  const dx=cat.tx-cat.x,dz=cat.tz-cat.z,d=Math.hypot(dx,dz);cat.tt-=dt;
  if(d<.3||cat.tt<=0){cat.tx=lerp(CORN.x0+1,CORN.x1-1,rand());cat.tz=lerp(CORN.z0+1,CORN.z1-1,rand());cat.tt=6+rand()*6;}
  const sp=Math.hypot(P.x-cat.x,P.z-cat.z)<3?0:.7;if(d>.3&&sp){cat.x+=dx/d*sp*dt;cat.z+=dz/d*sp*dt;cat.dir=dirOf(dx,dz);cat.clip='walk';}else cat.clip='idle';cat.t+=dt;
  cat.meow-=dt;if(cat.meow<=0&&Math.hypot(P.x-cat.x,P.z-cat.z)<14){SFX.meow(clamp((cat.x-P.x)/10,-1,1));cat.meow=4+rand()*3;}}
/* ================= sudden scares ================= */
let slamT=0,peekCD=30,lastDir='S';
function faceSlam(dur,loud){drawScare();const c=$('scare');c.hidden=false;c.classList.remove('slam');void c.offsetWidth;c.classList.add('slam','on');slamT=dur||.38;
  if(loud!==false){SFX.scream();SFX.stinger();}cam.shake=Math.max(cam.shake,.7);flashT=Math.max(flashT,.55);try{navigator.vibrate&&navigator.vibrate([120,40,180]);}catch(e){}}
function slamUpdate(dt){if(slamT>0){slamT-=dt;if(slamT<=0&&S.mode!=='scare'){const c=$('scare');c.hidden=true;c.classList.remove('slam','on');}}}
function popInFront(d){H.x=P.x+P.fx*d;H.z=P.z+P.fz*d;collide(H,.4);H.vis=true;H.alpha=1;H.rise=1;H.crawl=0;H.dir=dirOf(P.x-H.x,P.z-H.z);H.clip='scream';H.ft=0;}
function jumpScare(kind){popInFront(1.3);H.state='lunge';H.lungeT=.75;H.burn=0;faceSlam(.38);
  toast(kind==='turn'?'It was right behind you.':kind==='dark'?'When the light came back, it was there.':'It came out of the dark.',2.4,true);}
/* ================= caught / ending ================= */
function caught(){if(S.mode!=='play')return;S.mode='scare';S.caught++;SFX.scream();cam.shake=.8;fish.state='off';
  try{navigator.vibrate&&navigator.vibrate([200,60,300]);}catch(e){}
  const dx=H.x-P.x,dz=H.z-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);H.clip='lunge';H.ft=0;
  faceSlam(3,false);
  setTimeout(()=>fade(1),1500);
  setTimeout(()=>{$('scare').hidden=true;$('scare').classList.remove('on');const lost=Math.floor(S.coins/2);S.coins-=lost;S.basket=[];if(S.cat==='carried'){S.cat='lost';resetCat();}
    newDay(`You wake in your bed with straw in your mouth. ${lost?lost+' coins are gone.':'Your pockets are empty.'} Someone left the door open.`);fade(0);S.mode='play';},2800);}
let ritual=null;
function startRitualEnd(){S.mode='ritual';ritual={t:0};if(H.state==='gone'||H.state==='flee'){spawnHollow(true);}
  H.x=P.x+P.fx*4;H.z=P.z+P.fz*4;collide(H,.4);H.rise=1;H.vis=true;H.alpha=1;H.dir=dirOf(P.x-H.x,P.z-H.z);SFX.shriek(0);SFX.boom();toast('Three flames. One moon.',3);}
function ritualUpdate(dt){ritual.t+=dt;const t=ritual.t;cam.shake=Math.max(cam.shake,.25);H.clip=t<1?'frozen':'scream';H.ft+=dt;
  if(Math.random()<.6)parts.push({x:H.x+(Math.random()-.5)*.8,z:H.z+.1,y:Math.random()*2.6*H.alpha,vx:(Math.random()-.5)*.4,vz:0,vy:1+Math.random()*1.5,t:0,life:.9,col:Math.random()<.5?'#ff7020':'#ffc040',size:2});
  H.alpha=clamp(1-Math.max(0,t-1.2)/2.6,0,1);
  if(t>1&&!ritual.s2){ritual.s2=true;SFX.shriek(0);toast(S.pages.length>=6?'It screams in Grandpa’s voice.':'For a moment it sounds like a man.',2.6,true);}
  if(t>3.6&&!ritual.flash){ritual.flash=true;flashT=1.2;SFX.boom();H.vis=false;S.bound=true;H.state='gone';ritual.hat={x:H.x,z:H.z};scare.vis=true;SFX.bell();}
  if(t>6){S.mode='end';const full=S.pages.length>=6;
    $('endStory').textContent=full?'In the ash lies a straw hat with a faded red band. Grandpa’s. You lit the stones anyway, like he asked. In town the church bell rings on its own, and Mae is standing at the end of your road, smiling. "Next autumn, then."'
      :`In the ash lies a straw hat with a faded red band. You have seen it before, but where? You found ${S.pages.length} of Grandpa’s 6 pages. In town the church bell rings on its own, and someone is standing at the end of your road, smiling.`;
    $('eDays').textContent=S.day;$('ePages').textContent=S.pages.length+'/6';$('eCaught').textContent=S.caught;$('end').hidden=false;$('hud').hidden=true;$('buttons').hidden=true;ui.obj.hidden=true;}}
$('keepFarming').addEventListener('click',()=>{$('end').hidden=true;$('hud').hidden=false;$('buttons').hidden=false;ui.obj.hidden=false;S.mode='play';newDay('Day '+(S.day+1)+'. Birdsong, for the first time.');});
$('again').addEventListener('click',()=>location.reload());
/* ================= update ================= */
let stepT=0,heartT=0,musicT=1,crickT=2,mel=0,danger=0,hornT=0,flashT=0,lightT=6,ghosts=[],leaves=[],nightAmt=0;
const dayScale=[220,261.6,293.7,329.6,392,440,523.3];
const nightMel=[329.6,392,440,392,329.6,293.7,329.6,0,329.6,392,440,493.9,440,392,329.6,0,261.6,293.7,329.6,293.7,261.6,246.9,220,0];
function lightning(){flashT=1;const n=2+Math.floor(rand()*3);ghosts=[];if(!S.bound)for(let i=0;i<n;i++){const a=rand()*Math.PI*2,d=5+rand()*5;ghosts.push({x:P.x+Math.cos(a)*d,z:P.z+Math.sin(a)*d*.7,t:.35});}
  setTimeout(()=>SFX.thunder(),300+rand()*900);}
function update(dt){slamUpdate(dt);mindUpdate(dt);
  const rate=S.hour<20?1/11:1/15;S.hour+=dt*rate;
  if(!S.dusk&&S.hour>=18){S.dusk=true;toast('The sun is going down. Your lantern is lit.',2.6);}
  if(!S.bellRung&&S.hour>=20){S.bellRung=true;SFX.bell();S.storm=S.day>=2&&!S.bound;placeNPCs();
    if(!S.bound){scare.vis=false;toast(S.day===1?'The church bell tolls. The scarecrow’s post is empty.':S.day===2?'The bell. The post is empty again. And the town has come out to watch.':'The bell. It is already walking.',3.8,true);}}
  if(S.hour>=26){S.bound?newDay('Day '+(S.day+1)+'. You slept in the dirt, and nothing came.'):collapse();}
  if(!S.foundCabin&&Math.hypot(P.x-doorPos.x,P.z-doorPos.z)<9){S.foundCabin=true;toast('Grandpa’s cabin. The door is shut. There’s a note nailed to it.',3);}
  if(!S.visitedTown&&P.x>30){S.visitedTown=true;toast('Marrow Hollow. Every curtain moves as you pass.',3.2);}
  if(isNight()&&!S.bound){S.fuel=Math.max(0,S.fuel-dt*1.25);if(S.fuel<=0){darkT+=dt;if(darkT>2.4&&S.flasks>0){S.flasks--;S.fuel=100;darkT=0;SFX.refill();toast('You refill the lantern with shaking hands.',2.2);}
    else if(darkT>.05&&darkT<.1&&S.flasks===0)toast('Your lantern is dry.',2.4,true);}}
  if(sputT>0)sputT-=dt;
  // movement
  let mx=joy.x,mz=joy.y;if(keys.KeyW||keys.ArrowUp)mz-=1;if(keys.KeyS||keys.ArrowDown)mz+=1;if(keys.KeyA||keys.ArrowLeft)mx-=1;if(keys.KeyD||keys.ArrowRight)mx+=1;
  [mx,mz]=mindInput(mx,mz);
  let mag=Math.hypot(mx,mz);if(mag>1){mx/=mag;mz/=mag;mag=1;}
  const corn=inCorn(P.x,P.z);const moving=mag>.15&&!P.anim,run=mag>.85||keys.ShiftLeft;const spd=moving?(run?5:3)*mag*(corn?.7:1):0;
  lastDir=P.dir;
  if(moving){P.fx=mx/mag;P.fz=mz/mag;P.dir=dirOf(mx,mz);P.x+=P.fx*spd*dt;P.z+=P.fz*spd*dt;collide(P,.3);if(fish.state!=='off')fish.state='off';}
  P.spd=spd;
  if(P.anim){const a=P.anim;a.t+=dt;P.clip=a.clip;if(!a.fired&&a.t>a.dur*.55){a.fired=true;a.fire&&a.fire();}if(a.t>=a.dur)P.anim=null;}
  else P.clip=moving?'walk':'idle';
  P.t+=dt*(moving?spd/2.6:1);
  if(moving){stepT-=dt*(run?1.5:1);if(stepT<=0){stepT=.33;SFX.step(corn);if(rand()<.5&&!corn)burst(P.x,P.z+.05,2,'#6a5a46',.5,.4,.6);}}
  fishUpdate(dt);
  for(const t of tiles){const c=t.crop;if(!c)continue;c.pop=Math.min(1,c.pop+dt*3);if(c.stage>=3||!c.watered)continue;c.growth+=dt;const ns=Math.min(3,Math.floor(c.growth/SEEDS[c.type].grow));
    if(ns!==c.stage){c.stage=ns;c.pop=0;burst(t.x,t.z,5,'#bfe08a',.8,.6,1.5);if(ns===3)c.watered=false;}}
  const d=hollowUpdate(dt);
  danger=H.state==='stalk'||H.state==='watch'?clamp((11-d)/9,0,1):0;
  if(d<12&&H.state==='stalk'){heartT-=dt;if(heartT<=0){SFX.heart(.25+danger*.5);heartT=lerp(1.05,.3,danger);}}
  // people
  const night=S.hour>=20&&!S.bound;
  for(const n of npcs){if(!n.vis)continue;n.t+=dt;const dx=P.x-n.x,dz=P.z-n.z,dd=Math.hypot(dx,dz);let sp=0;
    if(night){n.clip='stand';n.dir=dirOf(dx,dz);}
    else if(talkingTo===n||dd<2.2){n.dir=dirOf(dx,dz);n.clip=talkingTo===n?'talk':'idle';}
    else{const path=n.def.path;if(n.wait>0){n.wait-=dt;n.clip='idle';}else{const tg=path[n.wp];const tx=tg[0]-n.x,tz=tg[1]-n.z,td=Math.hypot(tx,tz);
        if(td<.3){n.wp=(n.wp+1)%path.length;n.wait=4+rand()*7;}else{sp=n.def.id==='tobias'?1.5:1.1;n.x+=tx/td*sp*dt;n.z+=tz/td*sp*dt;collide(n,.3);n.dir=dirOf(tx,tz);n.clip='walk';}}}}
  ruthUpdate(dt);catUpdate(dt);
  if(isNight()&&!S.bound)for(const h of HOUSES){if(h.faceDone===S.day||!h.lit)continue;if(Math.hypot(P.x-h.x,P.z-h.z)<4.5){h.faceDone=S.day;h.faceT=.55;SFX.face();}}
  for(const h of HOUSES)if(h.faceT>0)h.faceT-=dt;
  if(isNight()&&!S.bound&&S.day>=2&&!S.night.phone&&Math.hypot(P.x-boothPos.x,P.z-boothPos.z)<22){S.night.phone=1;phone.ring=true;phone.t=0;}
  if(phone.ring){phone.t-=dt;if(phone.t<=0){phone.t=3;SFX.ring(clamp((boothPos.x-P.x)/15,-1,1),clamp(1-Math.hypot(P.x-boothPos.x,P.z-boothPos.z)/36,.1,1));}}
  if(isNight()&&!S.bound&&S.day>=2&&!S.night.horn&&Math.hypot(P.x-carPos.x,P.z-carPos.z)<24){S.night.horn=1;hornT=2.2;SFX.horn();}
  if(hornT>0)hornT-=dt;
  if(S.storm&&isNight()){lightT-=dt;if(lightT<=0){lightning();lightT=7+rand()*10;}}
  for(const c of crows){c.t+=dt;const dp=Math.hypot(P.x-c.x,P.z-c.z);
    if(c.state==='perch'){if(dp<3){c.state='fly';const dx=c.x-P.x,dz=c.z-P.z,dd=Math.hypot(dx,dz)||1;c.vx=dx/dd*5;c.vz=dz/dd*5;c.y=0;SFX.caw(0);c.t=0;}}
    else{c.x+=c.vx*dt;c.z+=c.vz*dt;c.y+=dt*2.5;if(c.t>12&&dp>9){c.state='perch';c.x=c.hx;c.z=c.hz;c.y=0;}}}
  if(A.ok){const nt=nightAmt,ct=A.ctx.currentTime;A.drone.gain.setTargetAtTime(S.bound?0:nt*.14+danger*.12,ct,.5);A.wind.gain.setTargetAtTime(.04+nt*.05+(S.storm?.05:0),ct,.5);
    A.tense.gain.setTargetAtTime(H.lit&&H.state!=='gone'?.03:danger>.6?.012:0,ct,.15);
    A.rain.gain.setTargetAtTime(S.storm&&isNight()?.07:0,ct,1);A.rainLow.gain.setTargetAtTime(S.storm&&isNight()?.1:0,ct,1);
    musicT-=dt;if(musicT<=0){const nightM=nt>.5&&!S.bound;if(nightM){const f=nightMel[mel++%nightMel.length];if(f)SFX.note(f*(danger>.5?.94:1)*.5,.035,true);musicT=.9+danger*.4;}
      else{SFX.note(dayScale[(rand()*dayScale.length)|0]*(rand()<.2?2:1),.03,false);musicT=rand()<.25?1.4:.55;}}
    if(nt>.6&&!S.storm){crickT-=dt;if(crickT<=0){SFX.cricket((rand()-.5)*1.6);crickT=.3+rand()*1.2;}}}
}
