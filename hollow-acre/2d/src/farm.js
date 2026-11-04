/* ================= farming upgrades: corn, seed cycling, Hollis's tool upgrades, sprinklers, the coop, field lanterns ================= */
SEEDS.corn={name:'Corn',grow:30,sell:24};S.seeds.corn=S.seeds.corn||0;
SPR.corn_3=SPR.corn_3||SPR.corn_2;
S.hoe=S.hoe||1;S.sprinklers=S.sprinklers||0;S.coop=S.coop||false;S.eggs=0;S.fieldLamps=S.fieldLamps||false;
// shops gain custom rows with their own buy() handlers
const _renderShop=renderShop;
renderShop=function(){_renderShop();const rows=vendors[shopV].rows();const els=[...$('shopRows').children];rows.forEach((r,i)=>{if(!r.buy||!els[i])return;const old=els[i].querySelector('button');const b=old.cloneNode(true);
    b.disabled=!r.can||S.coins<r.price;b.textContent=r.price?r.price+' coins':'Free';b.addEventListener('click',()=>{if(S.coins<r.price||!r.can)return;S.coins-=r.price;SFX.coin();r.buy();renderShop();updateHud();});old.replaceWith(b);});};
{const _mae=vendors.mae.rows;vendors.mae.rows=()=>{const r=_mae();r.splice(2,0,{k:'corn',name:'Corn seed ×2',desc:'Slowest crop, best price. Sells for 24.',price:16,can:true,buy(){S.seeds.corn+=2;}});return r;};}
vendors.hollis={name:'Pruitt’s Garage',sub:'"I fix things. Sometimes they stay fixed."',rows:()=>{const fr=S.freeUpgrades;return [
  {k:'hoe',name:'Sharpened hoe',desc:S.hoe>1?'Already sharp.':'Tills three tiles in a row with each swing.',price:fr?0:40,can:S.hoe<2,buy(){S.hoe=2;}},
  {k:'spr',name:'Brass sprinkler',desc:S.sprinklers>=4?'Your field has all it can use.':`Waters a patch of field every morning. You have ${S.sprinklers}/4.`,price:fr?0:45,can:S.sprinklers<4,buy(){S.sprinklers++;}},
  {k:'hood',name:'Lantern hood',desc:S.flashlight?'Your light is already focused.':'A reflector for your lantern. Throws the light much further.',price:fr?0:60,can:!S.flashlight,buy(){S.flashlight=true;}}];}};
vendors.plans={name:'Farm Plans',sub:'Grandpa’s plans, pinned up in his careful block capitals.',rows:()=>[
  {k:'coop',name:'Chicken coop',desc:S.coop?'Built. The hens lay every morning.':'A proper coop for the hens. They’ll lay eggs every morning. Eggs sell for 8.',price:60,can:!S.coop,buy(){S.coop=true;rebuildFarm();toast('You build the coop. The hens go straight in, as if they’d been waiting.',3);}},
  {k:'lamps',name:'Field lanterns',desc:S.fieldLamps?'Lit every night.':'Two lanterns on posts by the field gate. A lit place to stand when it gets dark.',price:45,can:!S.fieldLamps,buy(){S.fieldLamps=true;rebuildFarm();}}]};
// talk panel: Hollis trades upgrades
{const b=document.createElement('button');b.id='talkShop2';b.className='close hot';b.textContent='Upgrades';b.hidden=true;$('talkTrade').after(b);
  b.addEventListener('click',()=>{$('talk').hidden=true;talkingTo=null;openShop('hollis');});
  const _t=talk;talk=function(n){_t(n);$('talkShop2').hidden=!(n.def.id==='hollis'&&!isNight());};}
// seed button cycles every crop you have
onSeed=function(){if(S.mode!=='play')return;const ks=Object.keys(SEEDS);let i=ks.indexOf(S.sel);for(let k=0;k<ks.length;k++){i=(i+1)%ks.length;if(S.seeds[ks[i]]>0)break;}S.sel=ks[i];
  if(S.seeds[S.sel]<=0)toast(`No ${SEEDS[S.sel].name.toLowerCase()} seeds. Mae sells them.`,1.6);updateHud();};
const _updHud=updateHud;updateHud=function(){_updHud();ui.seed.textContent=`${SEEDS[S.sel].name} ×${S.seeds[S.sel]}`;};
// sharpened hoe: till the tiles either side too
const _doTill=doTill;doTill=function(t){_doTill(t);if(S.hoe<2)return;const side=Math.abs(P.fx)>Math.abs(P.fz)?[0,1]:[1,0];
  for(const s of [-1,1]){const n=tileAt(t.i+side[0]*s,t.j+side[1]*s);if(n&&!n.tilled)setTimeout(()=>{n.tilled=true;burst(n.x,n.z,8,'#6a4a30',1.2,.5,2);},420);}};
// sprinklers sit at fixed spots in the field and water a 3x3 patch at dawn
const SPRINK=[[2,2],[7,2],[2,5],[7,5]];
function sprinklerWater(){for(let k=0;k<S.sprinklers;k++){const [ci,cj]=SPRINK[k];for(let di=-1;di<=1;di++)for(let dj=-1;dj<=1;dj++){const t=tileAt(ci+di,cj+dj);if(t&&t.crop&&t.crop.stage<3)t.crop.watered=true;}}}
const _newDay3=newDay;newDay=function(msg,pos){_newDay3(msg,pos);sprinklerWater();if(S.coop)S.eggs=Math.min(8,S.eggs+HENS.length);};
function farmDraw(){for(let k=0;k<S.sprinklers;k++){const [ci,cj]=SPRINK[k];const t=tileAt(ci,cj);if(!t)continue;const X=Math.round(sx(t.x)),Y=Math.round(sz(t.z));
    ctx2.fillStyle='#5a4010';ctx2.fillRect(X-3,Y-3,7,4);ctx2.fillStyle='#d9a93c';ctx2.fillRect(X-2,Y-4,5,3);ctx2.fillStyle='#f6dc8a';ctx2.fillRect(X-1,Y-5,2,1);
    if(S.hour<7.2&&!isNight())for(let i=0;i<6;i++){const a=i/6*6.28+S.hour*20;ctx2.fillStyle='rgba(160,210,240,.7)';ctx2.fillRect(X+Math.round(Math.cos(a)*10),Y-6+Math.round(Math.sin(a)*4),1,1);}}
  if(S.coop&&S.eggs>0){const X=Math.round(sx(11.9)),Y=Math.round(sz(-2.2));for(let i=0;i<Math.min(S.eggs,4);i++){ctx2.fillStyle='#f4ecd8';ctx2.fillRect(X+i*4,Y,3,3);ctx2.fillStyle='#c8b890';ctx2.fillRect(X+i*4+1,Y+2,2,1);}}}
// coop + field lanterns become real objects when built
const farmObjs=[];
function rebuildFarm(){for(const o of farmObjs){o.hide=true;}farmObjs.length=0;
  if(S.coop){const o=obj('coop',11,-2.6,{kind:'bld',night:'coop_n'});farmObjs.push(o);addRect(9.6,-3.8,12.4,-2.7);}
  if(S.fieldLamps){for(const x of [-2,2]){lamp(x,-1.6);farmObjs.push(lamps[lamps.length-1].e);lamps[lamps.length-1].dead=false;}}}
interact.push({x:12.6,z:-5.2,r:1.4,label:()=>'Plans',ok:()=>true,act(){openShop('plans');}});
interact.push({x:11.9,z:-2.0,r:1.5,on:()=>S.coop&&S.eggs>0,label:()=>`Eggs ${S.eggs}`,ok:()=>true,act(){for(let i=0;i<S.eggs;i++)S.basket.push({kind:'egg',value:8});toast(`You collect ${S.eggs} eggs. One is still warm. One is cold as a stone.`,2.6);S.eggs=0;SFX.harvest();updateHud();}});
put('board',12.6,-5.6,0);addSeg(11.8,-5.6,13.4,-5.6,.12);

// Stardew-style: after a harvest, hold the crop up over your head for a moment
const _doHarvest=doHarvest;doHarvest=function(t){const type=t.crop&&t.crop.type;_doHarvest(t);if(type)setTimeout(()=>{P.hold={spr:type+'_3',t:1.1};},420);};
function holdDraw(){if(!P.hold||P.hold.t<=0)return;const X=Math.round(sx(P.x)),Y=Math.round(sz(P.z));const m=SPR[P.hold.spr];if(!m)return;
  drawSpr(P.hold.spr,X,Y-48+Math.round(Math.sin(P.hold.t*9)),null,null,0,{scale:.7});}
const _upd=update;update=function(dt){_upd(dt);if(P.hold&&P.hold.t>0){P.hold.t-=dt;if(P.spd>.2)P.hold.t=0;}};

// ---- the farm has gone wild since Grandpa stopped: weeds, field stones and fallen twigs to clear, Stardew-style
function farmDebris(){let n=0;for(let i=0;i<4000&&n<56;i++){const x=lerp(-12,24,rand()),z=lerp(-14,12,rand());
    if(terr(x,z)!=='grass'||!clearSpot(x,z,.3)||!bushOK(x,z))continue;if(x>FIELD.x0-1.2&&x<FIELD.x0+FIELD.w+1.2&&z>FIELD.z0-1.2&&z<FIELD.z0+FIELD.h+1.2)continue;
    if(OBJ.some(o=>o.debris&&Math.hypot(o.x-x,o.z-z)<1.3))continue;
    const r=rand(),spr=r<.42?'weeds_'+((rand()*2)|0):r<.72?'rock_'+((rand()*2)|0):'twig';const o=obj(spr,x,z,{kind:'prop',debris:spr.split('_')[0]});
    if(o.debris==='rock'){o.col={x,z:z-.1,r:spr==='rock_1'?.42:.3};circles.push(o.col);}
    interact.push({x,z,r:.75,on:()=>!o.hide,label:()=>o.debris==='rock'?'Break':o.debris==='weeds'?'Pull':'Pick up',ok:()=>true,act(){o.hide=true;if(o.col){const k=circles.indexOf(o.col);if(k>=0)circles.splice(k,1);}
      burst(o.x,o.z,o.debris==='rock'?14:8,o.debris==='rock'?'#8a8690':o.debris==='weeds'?'#4a8a32':'#7d5636',1.2,.6,2);SFX.thud(0,o.debris==='rock'?.35:.15);
      const q=rand();if(o.debris==='weeds'&&q<.22){S.seeds.turnip++;toast('A turnip seed was tangled in the roots.',1.8);}
      else if(o.debris==='rock'&&q<.18){S.coins++;toast('A coin under the stone. Old. The date has been scratched off.',2);}
      else if(o.debris==='rock'&&q<.24){toast('Under the stone, a child’s milk tooth. You put the stone back. It isn’t there anymore.',2.8,true);mindHit&&mindHit(2);}
      updateHud();}});n++;}}
