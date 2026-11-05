/* ================= keeping the story easy to follow: every step names someone to ask, and that person tells you plainly what
   to do next. Plus Stardew-style life around you: help-wanted requests each morning, and chance encounters on the farm and roads. ================= */
const nm=id=>{const n=npcById(id);return n?n.def.name.split(' ')[0]:id;};
// ---------- who to ask, and what they say
function stepGuide(){const ob=objective(),t=ob[0];const st=S.st||{};
  switch(t){
    case 'The car':return ['hollis','Your car needs four parts: a tire from Mae’s store, a battery (I’ll trade one for three pumpkins), a fan belt (Agnes keeps her late husband’s), and gas from the pump on Route 9. Bring them, then fix it at the wreck.'];
    case 'Leave':return ['mae','Your car runs? Then drive, dear. West, the way you came. …Come and tell me what you see.'];
    case 'Candles':return ['hale','The stones need Ward candles. The peddler sells them at the crossroads after dark. Or make tallow candles at your grandfather’s bench: three fiber and a lump of coal each.'];
    case 'Wait':case 'The rite':return ['hale','Three stones: the west woods, the cornfield, and my churchyard. Light all three after the bell, the same night. And keep your lantern pointed at whatever comes.'];
    case 'The Tithe':return ['della','Walk the valley. The Marsh place on the west lane, the Tithe House at the end of Mill Road, the hollow tree in the east woods, the Black Lake, and Wickham across the river. Ask people. Every friend tells you something.'];
    case 'The Ward':return ['hale','The ledger is by my altar. Two bundles and the valley will start to answer you. Crops, timber, ore, fish, food, friends: it takes all kinds.'];
    case 'A letter':return ['mae','Your mailbox flag is up. Go on. Read it. Whatever it says.'];
    case 'Three stones':{const m=!st.got||!st.got.dock?'dock':!st.got.tree?'tree':!st.got.bed?'bed':'';
      return ['maud',{dock:'The lake stone hangs on a cord under the dock. Your hand won’t reach. Otto’s ash rod would hook it. Ninety coins.',tree:'The hollow tree only opens at noon, and it’s grown shut. A steel axe will split it. Hollis needs three iron for one. The mine has iron below floor two.',
        bed:'Under your own bed. The boards are nailed. A steel pickaxe pries them. Three copper, four iron, at Hollis’s.','':'Set the stones on the Tithe House step. All three.'}[m]];}
    case 'The last days':return ['hale','Keep the Ward, all six. Get close to people. Who loves you, and what they give you, decides which door opens on Tithe night.'];
    case 'The drawing':return ['mae','Six o’clock. The church. Wear something nice. …I’m sorry. I’m so sorry.'];
    case 'Tithe night':return ['mae','Mill Road, after dark. Don’t stop walking. Don’t look back. Whatever is behind you.'];}
  return null;}
{const _o=objective;objective=function(){const r=_o();try{if(S.mode==='play'&&!(S.st&&S.st.done)){const g=stepGuideCache;if(g&&r&&r[1]&&!/Ask /.test(r[1]))return [r[0],r[1]+` · Ask ${nm(g[0])}`,r[2]];}}catch(e){}return r;};}
let stepGuideCache=null,stepGuideT=0;
// when you talk to the right person, they tell you
{const _t=talk;talk=function(n){_t(n);const g=stepGuideCache;if(!g||n.def.id!==g[0]||isNight())return;setTimeout(()=>{if($('talk').hidden)return;const l=$('talkLine');
  if(l&&!l.querySelector('.hint'))l.insertAdjacentHTML('beforeend',`<div class="hint" style="margin-top:8px;padding-top:6px;border-top:1px dashed rgba(0,0,0,.25);font-size:13px">💡 ${g[1]}</div>`);},0);};}

// ---------- help wanted: one request at a time, posted in the morning, delivered by talking to whoever asked
const REQ_POOL=[['abel','wood',15,'i',70,'for the mill wheel'],['mae','turnip',5,'b',50,'for soup at the store'],['otto','fish',2,'b',70,'he won’t say what for'],['gideon','copper',5,'i',90,'for nails'],
  ['orla','pumpkin',3,'b',75,'for the orchard pies'],['hollis','stone',20,'i',60,'to patch the garage floor'],['cora','mushroom',2,'b',45,'for the children’s nature table'],['maud','coal',6,'i',80,'to keep the quarry hut warm'],
  ['tess','egg',3,'b',55,'for the inn kitchen'],['nell','fiber',10,'i',50,'to stretch new canvases']];
S.req=S.req||null;
const reqHave=r=>r.t==='b'?basketCount(r.k):inv(r.k);
function postRequest(){if(S.req||S.day<2||rand()<.4)return;const c=REQ_POOL.filter(q=>npcById(q[0]));if(!c.length)return;const q=pick(c);
  S.req={id:q[0],k:q[1],n:q[2],t:q[3],coins:q[4],why:q[5],due:S.day+3};setTimeout(()=>toast(`Help wanted: ${nm(q[0])} needs ${q[2]} ${q[1]} ${q[5]}. ${q[4]} coins.`,4.2),5200);}
{const _t=talk;talk=function(n){_t(n);const r=S.req;if(!r||n.def.id!==r.id)return;setTimeout(()=>{if($('talk').hidden)return;const l=$('talkLine');
  if(reqHave(r)>=r.n){if(r.t==='b')takeBasket(r.k,r.n);else takeInv(r.k,r.n);S.coins+=r.coins;addFriend(r.id,60);S.req=null;SFX.coin&&SFX.coin();updateHud&&updateHud();
    l.insertAdjacentHTML('beforeend',`<div class="hint" style="margin-top:8px;font-size:13px">✓ You hand over the ${r.k}. +${r.coins} coins. ${nm(r.id)} looks at you like you’re worth keeping.</div>`);}
  else l.insertAdjacentHTML('beforeend',`<div class="hint" style="margin-top:8px;font-size:13px">📋 Still need ${r.n} ${r.k} (you have ${reqHave(r)}).</div>`);},0);};}

// ---------- chance encounters
const ENC=[
  {id:'mae_basket',who:'mae',x:-11,z:-6.6,dir:'E',h:[6.5,10.5],when:()=>S.day>=2&&S.day<=8,
   act(e){addInv('bread',3);addFriend('mae',30);say(e,'Mae is at your gate with a basket. “You look thin. Eat. Don’t argue.” Three loaves of bread, still warm.');}},
  {id:'tobias',who:'tobias',x:-6.5,z:-3.6,dir:'E',h:[8,12],when:()=>S.day>=2,
   act(e){if(basketCount('turnip')>0){takeBasket('turnip',1);S.basket.push({kind:'mushroom',value:5},{kind:'mushroom',value:5});addFriend('tobias',50);say(e,'Tobias trades you two glowcaps for a turnip. “Is it true your scarecrow walks? Don’t tell me. Yes, tell me.”');}
     else{addFriend('tobias',15);say(e,'Tobias is poking at your fence with a stick. “Mom says don’t talk to you. Got a turnip? Next time bring a turnip.”');}}},
  {id:'otto_dare',who:'otto',x:fishSpot.x+1.6,z:fishSpot.z-1.2,dir:'W',h:[9,15],when:()=>S.day>=2,
   act(e){e.watch=S.fishCaught||0;say(e,'Otto is at the pond. “Catch me a fish before four and I’ll pay you sixty for the story.”');},
   tick(e){if(e.watch!=null&&(S.fishCaught||0)>e.watch&&S.hour<16){S.coins+=60;addFriend('otto',40);e.watch=null;toast('Otto whoops from the bank. “That’s a story!” +60 coins.',3);}}},
  {id:'pip_lost',who:'pip',x:84,z:2.5,dir:'S',h:[14,18.5],when:()=>S.day>=3&&npcById('pip'),escort:true,
   act(e){e.follow=true;say(e,'Pip is crying at the edge of the Hollow Woods. “The trees moved. I can’t find the road.” Walk her back to the town square.');}},
  {id:'della_herbs',who:'della',x:42,z:51.5,dir:'S',h:[10,14],when:()=>S.day>=3&&npcById('della'),
   act(e){if(inv('fiber')>=4){takeInv('fiber',4);S.coins+=40;addFriend('della',50);say(e,'Della takes four fiber for her poultices and pays you forty. “You’ve got good hands. Steady. That’s rare this time of year.”');}
     else{addFriend('della',15);say(e,'Della is gathering herbs in the orchard. “Bring me four fiber sometime and I’ll pay you. Fiber’s just weeds that learned to be useful.”');}}},
  {id:'nell_paint',who:'nell',x:-1.5,z:10.6,dir:'N',h:[11,16],when:()=>S.day>=2&&npcById('nell'),
   act(e){addFriend('nell',40);mindHit(3);say(e,'Nell is painting your field from the corn. She shows you the canvas. It’s beautiful. In the painting someone is standing in your rows, facing the cabin. “I paint what’s there,” she says.');}},
  {id:'crow_coin',who:null,x:2.4,z:-1.6,h:[8,17],when:()=>true,
   act(e){if(rand()<.8){S.coins+=15;say(e,'A crow drops something shiny at your feet and watches you pick it up. Fifteen coins, warm from its beak.');}
     else{mindHit(6);say(e,'A crow drops something at your feet and watches you pick it up. It is a tooth. It is one of yours. You check with your tongue. They are all there.');}}},
  {id:'stranger',who:'farmer',x:22.8,z:-7.4,dir:'S',h:[17,19.6],when:()=>typeof hl==='function'&&hl()>=2,
   act(e){mindHit(10);SFX.stinger&&SFX.stinger();say(e,'Someone is waiting at the old bus stop, facing the road. Your coat. Your walk. It turns around. It doesn’t have your face yet. “Soon,” it says, kindly. Then the stop is empty.');}},
  {id:'fallen',who:null,obj:'lumber',x:21.2,z:30,h:[7,18],when:()=>S.day>=3,
   act(e){if(S.tools.axe<1){say(e,'A tree has come down across Mill Road.');return;}addInv('wood',8);S.coins+=25;say(e,'A tree came down across Mill Road in the night. You clear it: eight wood, and Abel leaves twenty-five coins on the fence post with a note. “Thanks. It wasn’t the wind.”');}},
];
S.enc=S.enc||null;
function say(e,t){e.done=true;toast(t,4.6,/tooth|Soon|someone is standing/i.test(t));SFX.page&&SFX.page();}
function encPick(){S.enc=null;if(S.day<2||rand()<.3)return;const c=ENC.filter(e=>e.when()&&(S.encLast||{})[e.id]!==S.day-1);if(!c.length)return;const e=pick(c);S.enc={id:e.id,day:S.day};S.encLast=S.encLast||{};S.encLast[e.id]=S.day;}
const encLive=()=>{const s=S.enc;if(!s||s.day!==S.day)return null;const e=ENC.find(x=>x.id===s.id);if(!e||s.done)return null;if(S.hour<e.h[0]||S.hour>e.h[1])return null;return e;};
const ENCX={};   // live position of the actor (escorts move)
const encObjs={};for(const e of ENC)if(e.obj){const o=obj(e.obj,e.x,e.z,{kind:'prop'});o.hide=true;encObjs[e.id]=o;}
interact.push({x:0,z:0,r:1.6,on:()=>{const e=encLive();if(!e||S.room)return false;if(ENCX[e.id]&&ENCX[e.id].follow)return false;const p=ENCX[e.id]||e;this_enc.x=p.x;this_enc.z=p.z;return true;},
  label:()=>{const e=encLive();return e&&e.obj?'Clear it':e&&e.who?'Talk':'Look';},ok:()=>true,act(){const e=encLive();if(!e)return;const L=ENCX[e.id]||(ENCX[e.id]={x:e.x,z:e.z});
    L.done=false;e.act(L);if(L.done&&!e.escort)S.enc.done=true;L.done=false;}});
const this_enc=interact[interact.length-1];
function encUpdate(dt){const e=encLive();for(const [k,o] of Object.entries(encObjs))o.hide=!(e&&e.id===k);if(!e)return;const L=ENCX[e.id]||(ENCX[e.id]={x:e.x,z:e.z});
  if(e.tick)e.tick(L);
  if(L.follow){const dx=P.x-L.x,dz=P.z-L.z,d=Math.hypot(dx,dz);if(d>1.8){const sp=Math.min(4.2,d*1.4);L.x+=dx/d*sp*dt;L.z+=dz/d*sp*dt;L.dir=dirOf(dx,dz);L.mv=1;}else L.mv=0;L.t=(L.t||0)+dt;
    if(Math.hypot(L.x-squarePos.x,L.z-squarePos.z)<7){L.follow=false;S.enc.done=true;S.coins+=50;addFriend('pip',80);toast('Pip lets go of your hand and runs to the bakery. “I won’t tell anyone you were nice,” she shouts. +50 coins.',4);}
    if(d>30){L.follow=false;L.x=e.x;L.z=e.z;toast('You lost Pip. She’s gone back to where you found her.',3);}}}
{const _lu=lifeUpdate;lifeUpdate=function(dt){_lu(dt);encUpdate(dt);if(stepGuideT<=0){stepGuideT=1;try{stepGuideCache=null;stepGuideCache=stepGuide();}catch(e){}}else stepGuideT-=dt;
  const e=encLive();if(e&&e.who&&e.who!=='farmer'){const n=npcById(e.who);if(n)n.vis=false;}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const e=encLive();if(!e||e.obj||S.room)return;const L=ENCX[e.id]||e;if(!e.who){if(onScreen(L.x,L.z,40))D.push({z:L.z,mind:1,draw(){const k=(Math.sin(t*6)+1)/2;ctx2.fillStyle=`rgba(255,230,140,${.4+k*.6})`;const X=Math.round(sx(L.x)),Y=Math.round(sz(L.z));ctx2.fillRect(X-1,Y-4,2,8);ctx2.fillRect(X-4,Y-1,8,2);}});return;}const m=SPR[e.who];if(!m)return;
  if(!onScreen(L.x,L.z,80))return;const clip=L.mv?'walk':(m.clips.idle?'idle':'walk');
  D.push({z:L.z,mind:1,draw(){shadow(sx(L.x),sz(L.z),9);drawSpr(e.who,sx(L.x),sz(L.z),clip,L.dir||e.dir||'S',L.mv?frameOf(e.who,'walk',L.t||0):0);}});};}
{const _nd=newDay;newDay=function(msg,pos){_nd(msg,pos);for(const k in ENCX)delete ENCX[k];if(S.req&&S.day>S.req.due){toast(`${nm(S.req.id)} found someone else for the job.`,2.6);S.req=null;}postRequest();encPick();};}
