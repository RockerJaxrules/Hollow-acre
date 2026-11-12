/* ================= #255 the farming empire, slow and fair. The farm can grow as big as you can make it pay:
   - THE BANK. Marrow Hollow Savings & Loan has a counter in the Town Hall beside the land office. It sells the one piece of
     land it holds, the bottom field below the long field (taken off the Greyfields in 1931 and never farmed since), and it
     lends against any land for sale: a fifth down, then a little every morning for thirty mornings. A short morning is
     carried over with a little on top. The bank never takes land back: old Abernathy says it's done enough of that here.
   - FARMHANDS. Four people from town will work your ground for a fair day's wage, paid at dawn: Dell waters, the Kettle
     twins pick what's ripe into the shipping bin, Old Merritt sows the picked rows again from your seed bag, and Hannah clears
     stone and weed off new land and tills it. No pay in the tin, no work that day; nobody works for nothing on this farm.
   - THE TRACTOR. Pruitt's garage sells Hollis's old red tractor. Climb on in the yard and drive it over the field: it tills
     bare ground three squares wide, sows tilled ground from the seeds you've picked once you buy the seed drill, and reaps
     ripe crops into your bag with the reaper.
   - THE TOWN FUND. Money from the farm can mend the town before you ever save it: a stove for the schoolroom, glass for the
     chapel, the pantry filled for a week. Everyone notices.
   All of it is in the farm book (Grandpa's desk, or the land office). ================= */
LAND_PARCELS.push({id:'bottom',name:'The bottom field',x0:-16,z0:36,w:27,h:7,price:2600,sign:[-2.5,35.3],kk:8,bank:true,
  desc:'Below the long field, running down to the creek road. The bank took it off the Greyfields in 1931 and nobody has farmed it since: twenty-seven paces of good bottom land, gone to thistle.'});
const EMP_HANDS=[{id:'dell',name:'Dell Ames',job:'water',n:40,wage:28,note:'carries two cans at once; lost his own place in the dry year'},
  {id:'kettle',name:'The Kettle twins',job:'pick',n:30,wage:34,note:'fourteen and quick, and they argue the length of every row'},
  {id:'merritt',name:'Old Merritt',job:'plant',n:24,wage:24,note:'sows by the moon whether you like it or not'},
  {id:'hannah',name:'Hannah Royce',job:'clear',n:16,wage:30,note:'clears stone like it owes her money'}];
const EMP_JOB={water:'waters up to 40 growing squares',pick:'picks up to 30 ripe crops into the shipping bin',plant:'sows up to 24 picked rows again from your seed bag',clear:'clears stone and weed off new ground and tills up to 16 squares'};
const EMP_FUND=[{k:'pantry',name:'Fill the chapel pantry for a week',cost:120,again:7,say:'Sacks of meal and tins and a crate of your own turnips go into the chapel pantry. By Sunday it is half empty again, and nobody in Marrow Hollow went to bed hungry that week.'},
  {k:'school',name:'A stove for the schoolroom',cost:260,say:'A pot-bellied stove goes into the schoolroom, and Cora Vance stops teaching in her coat. The children write you a thank-you letter and spell your name three different ways.'},
  {k:'calder',name:'Seed for the Calder garden',cost:180,say:'The Calders lost their garden to the frost. You buy their seed for the spring, and Ma Calder holds your hand too long and says nothing at all.'},
  {k:'doc',name:'Stock Doc Hale’s medicine cabinet',cost:340,say:'Iodine, quinine, bandages, a bottle of something the doctor won’t name. Doc Hale says the cabinet hasn’t been full since before the war.'},
  {k:'rail',name:'A rail along the creek where the children play',cost:300,say:'Hollis and you sink posts and run a rail along the creek bank by the bridge. Two mothers come out to watch, and one of them cries.'},
  {k:'chapel',name:'Glass for the chapel windows',cost:450,say:'New glass in the chapel windows, clear where the old was boarded. On Sunday the light comes in across the pews for the first time in years, and the whole town sits in it.'}];
const TRACTOR_PRICE=2400,DRILL_PRICE=450,REAPER_PRICE=900,EMP_PARK={x:-9.4,z:7.2};
function EMP(){S.emp=S.emp&&typeof S.emp==='object'?S.emp:{};const E=S.emp;E.loans=E.loans||[];E.hands=E.hands||[];E.fund=E.fund||{};E.given=E.given||0;return E;}
const empHost=()=>typeof HOST==='undefined'||HOST.role!=='guest';
const empParcel=id=>LAND_PARCELS.find(p=>p.id===id);
const empPer=P=>Math.ceil(P.price*.8*1.25/30);
const empWinter=t=>typeof seasonNow==='function'&&seasonNow()==='winter'&&!t.gh;
function empFriends(n){try{for(const p of npcs)if(PEOPLE&&PEOPLE[p.def.id])addFriend(p.def.id,n);}catch(e){}}
// ---- the morning: the bank takes its due, the hands are paid and go to work
function empPick(t,toBag){const c=t.crop;if(!c||c.stage<3)return false;const q=typeof cropQuality==='function'?cropQuality(c):0;let v=SEEDS[c.type]?SEEDS[c.type].sell:5;
  if(q&&typeof CQ!=='undefined'&&CQ[q])v=Math.round(v*CQ[q].m);
  if(toBag)S.basket.push({kind:c.type,value:v,q});else S.ship.push({t:'P',id:c.type,value:v,q});
  t.lastPick=c.type;t.crop=null;const C=typeof CROP2!=='undefined'&&CROP2[c.type];if(C&&C.regrow)t.crop={type:c.type,stage:C.regrow,growth:C.regrow*SEEDS[c.type].grow,watered:false,pop:0,dry:c.dry||0};return true;}
function empSow(t,type){if(!type||!SEEDS[type]||!(S.seeds[type]>0)||t.crop||!t.tilled||empWinter(t))return false;S.seeds[type]--;t.crop={type,stage:0,growth:0,watered:false,pop:0};S.everPlanted=true;return true;}
function empClear(t){const o=t.debris;if(!o||o.hide)return false;o.hide=true;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}return true;}
function empMorning(){if(!empHost())return;const E=EMP(),notes=[];let spent=0;
  for(const L of E.loans){const P=empParcel(L.p);const due=(L.left>0?L.per:0)+(L.owed||0);if(!due){L.done=1;continue;}
    if(S.coins>=due){S.coins-=due;spent+=due;L.owed=0;}else{const pay=Math.max(0,S.coins);S.coins-=pay;spent+=pay;L.owed=Math.ceil((due-pay)*1.05);notes.push(`The bank came up ${L.owed} short on ${P?P.name.replace(/^The /,'the '):'the land'}. Abernathy writes that it can wait, with a little on top.`);}
    if(L.left>0)L.left--;if(L.left<=0&&!L.owed){L.done=1;notes.push(`${P?P.name:'The land'} is paid off. The deed in Grandpa’s desk is clear.`);}}
  E.loans=E.loans.filter(L=>!L.done);
  const did=[];const order=['clear','pick','plant','water'];
  for(const job of order)for(const id of E.hands){const H=EMP_HANDS.find(h=>h.id===id);if(!H||H.job!==job)continue;
    if(S.coins<H.wage){did.push(`${H.name} came at dawn, found nothing in the tin, and went home`);continue;}S.coins-=H.wage;spent+=H.wage;let n=0;
    if(job==='clear'){for(const t of tiles){if(n>=H.n)break;if(t.parcel&&empClear(t))n++;}
      for(const t of tiles){if(n>=H.n)break;if(t.parcel&&!t.tilled&&!(t.debris&&!t.debris.hide)&&!empWinter(t)){t.tilled=true;n++;}}
      did.push(n?`${H.name} cleared and tilled ${n} square${n>1?'s':''}`:`${H.name} found no new ground to clear`);}
    else if(job==='pick'){for(const t of tiles){if(n>=H.n)break;if(empPick(t,false))n++;}did.push(n?`the Kettle twins put ${n} crop${n>1?'s':''} in the shipping bin`:'the Kettle twins found nothing ripe');}
    else if(job==='plant'){const fall=Object.keys(S.seeds||{}).find(k=>S.seeds[k]>0);for(const t of tiles){if(n>=H.n)break;if(t.tilled&&!t.crop&&empSow(t,t.lastPick&&S.seeds[t.lastPick]>0?t.lastPick:(S.seeds[S.sel]>0?S.sel:fall)))n++;}
      did.push(n?`Old Merritt sowed ${n} square${n>1?'s':''}`:'Old Merritt had no seed or no empty rows');}
    else if(job==='water'){for(const t of tiles){if(n>=H.n)break;const c=t.crop;if(c&&c.stage<3&&!c.watered){c.watered=true;n++;}}did.push(n?`Dell watered ${n} square${n>1?'s':''}`:'Dell found nothing to water');}}
  if(E.hands.length)empFriends(1);
  E.last={day:S.day,did,notes,spent};
  if(did.length||notes.length)setTimeout(()=>toast((did.length?'At dawn: '+did.join('; ')+'.':'')+(notes.length?' '+notes[0]:''),5),3600);
  updateHud&&updateHud();}
{const _nd=newDay;newDay=function(m,p){const r=_nd.apply(this,arguments);try{empMorning();}catch(e){console.warn('emp',e);}return r;};}
// ---- the bank's counter, and the farm book, at the land office
{const _r=vendors.land.rows;vendors.land.rows=()=>{const rows=_r();const E=EMP(),host=empHost();
  rows.unshift({k:'farmbook',name:'The farm book',desc:'Your land and what you owe on it, your farmhands, the tractor, and the town fund.',price:0,can:true,btn:'Open',buy(){setTimeout(()=>empOpen('land'),50);}});
  for(const P of LAND_PARCELS){if(landOwns(P.id))continue;const per=empPer(P),down=Math.ceil(P.price*.2);
    rows.push({k:'mort_'+P.id,name:`${P.name}, on the bank’s money`,desc:`Marrow Hollow Savings & Loan: ${down} down, then ${per} a morning for 30 mornings (${per*30} in all). A short morning waits, with a little on top. “We’ve taken enough land off people in this valley,” says old Abernathy. “We’d sooner see it worked.”`,
      price:down,can:host&&!E.loans.some(L=>L.p===P.id),btn:'Sign',buy(){empMortgage(P);}});}
  return rows;};}
function empMortgage(P){const E=EMP();landOwnedSet()[P.id]={day:S.day,bank:1};E.loans.push({p:P.id,per:empPer(P),left:30,owed:0,day:S.day});landSync();try{saveGame&&saveGame();}catch(e){}
  SFX.page&&SFX.page();toast(`You sign for ${P.name.replace(/^The /,'the ')}. The bank will take ${empPer(P)} every morning for thirty mornings.`,4);}
// ---- the tractor: parked in the yard, ridden over the field
const TR={ride:false,obj:null,col:null,it:null,last:'',work:0,hum:0};
function trKey(dir){const flip=dir==='W',v=flip?'E':dir;const key='tractor_park_'+dir;if(SPR[key])return key;const u=SPR['tractor_'+v+'u'],o=SPR['tractor_'+v+'o'];if(!u||!o||!IMG[u.src]||!IMG[o.src])return null;
  const c=document.createElement('canvas');c.width=u.fw;c.height=u.fh;const g=c.getContext('2d');if(flip){g.translate(u.fw,0);g.scale(-1,1);}g.drawImage(IMG[u.src],0,0);g.drawImage(IMG[o.src],0,0);
  IMG[key]=c;SPR[key]={src:key,fw:u.fw,fh:u.fh,ax:u.ax,ay:u.ay,foot:[-1.2,-.4,1.2,0]};return key;}
function trPark(){const E=EMP(),T=E.tractor;if(TR.obj){TR.obj.hide=true;const i=OBJ.indexOf(TR.obj);if(i>=0)OBJ.splice(i,1);TR.obj=null;}
  if(TR.col){const i=circles.indexOf(TR.col);if(i>=0)circles.splice(i,1);TR.col=null;}
  if(!T||TR.ride)return;const key=trKey(T.dir||'E');if(!key)return;
  try{const o=obj(key,T.x,T.z,{kind:'prop',label:'TRACTOR'});TR.obj=o;}catch(e){}TR.col={x:T.x,z:T.z-.25,r:1.05};circles.push(TR.col);
  if(!TR.it){TR.it={get x(){const T=EMP().tractor;return T?T.x:0;},get z(){const T=EMP().tractor;return T?T.z+.9:0;},r:1.5,on:()=>!S.room&&!!EMP().tractor&&!TR.ride,label:()=>'Drive the tractor',ok:()=>true,act(){trMount();}};interact.push(TR.it);}}
function trMount(){const T=EMP().tractor;if(!T)return;TR.ride=true;P.x=T.x;P.z=T.z;P.walkTo=null;P.anim=null;trPark();SFX.thud&&SFX.thud(0,.3);
  toast(`The engine catches on the second try. ${T.drill||T.reaper?'':'It turns bare ground over, three squares wide. '}${T.drill?'With the seed drill on, it sows tilled ground from the seeds you’ve picked. ':''}${T.reaper?'With the reaper, it cuts ripe crops into your bag.':''}`,4.2);}
function trDismount(){if(!TR.ride)return;const T=EMP().tractor;TR.ride=false;T.x=+P.x.toFixed(2);T.z=+P.z.toFixed(2);T.dir=trView();
  const sx0=-(P.fz||0),sz0=P.fx||0;P.x+=sx0*1.5;P.z+=sz0*1.5;collide(P,.3);trPark();SFX.thud&&SFX.thud(0,.2);}
const trView=()=>Math.abs(P.fx||0)>Math.abs(P.fz||0)?(P.fx>0?'E':'W'):((P.fz||1)>0?'S':'N');
TR.down={get x(){return P.x;},get z(){return P.z;},r:3,on:()=>TR.ride,label:()=>'Get down',ok:()=>true,act(){trDismount();}};interact.push(TR.down);
// the work it does: the squares under the harrow behind it, three wide
function trWork(){const T=EMP().tractor;if(!T)return;const bx=P.x-P.fx*1.25,bz=P.z-P.fz*1.25,px=-P.fz,pz=P.fx;let n=0;
  for(const s of [-1,0,1]){const t=typeof tileAtW==='function'?tileAtW(bx+px*s,bz+pz*s):null;if(!t)continue;const key=t.i+':'+t.j;if(TR.done&&TR.done.has(key))continue;
    let did=false;if(t.crop&&t.crop.stage>=3){if(T.reaper){did=empPick(t,true);if(did)burst(t.x,t.z,8,'#c8a050',1.2,.6,1.8);}}
    else if(!t.tilled&&!(t.debris&&!t.debris.hide)&&!empWinter(t)){t.tilled=true;S.everTilled=true;did=true;burst(t.x,t.z,10,'#6a4a30',1.4,.6,1.6);}
    else if(t.tilled&&!t.crop&&T.drill&&S.sel&&S.seeds[S.sel]>0){did=empSow(t,S.sel);}
    if(did){n++;(TR.done=TR.done||new Set()).add(key);setTimeout(()=>TR.done&&TR.done.delete(key),1500);}}
  if(n&&(TR.work+=n)%9<n)SFX.till&&SFX.till();}
{const _u=update;update=function(dt){_u(dt);if(!TR.ride)return;
  if(S.room||(typeof cine!=='undefined'&&cine)||S.mode!=='play'){trDismount();return;}
  if(P.spd>0){P.x+=P.fx*P.spd*.45*dt;P.z+=P.fz*P.spd*.45*dt;collide(P,.3);trWork();}
  TR.hum+=dt;if(TR.hum>.5&&P.spd>0){TR.hum=0;try{A.hiss&&A.hiss(.25,.03,'lowpass',260);}catch(e){}}};}
{const _sa=startAnim;startAnim=function(){if(TR.ride)return;return _sa.apply(this,arguments);};}
// drawn: the tractor, the farmer on its seat, then whatever of the tractor is nearer the eye than the farmer
const TR_SEAT={E:[-28,-60],W:[28,-60],S:[0,-56],N:[0,-46]};
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(!TR.ride)return;const i=D.findIndex(d=>d.player);if(i>=0)D.splice(i,1);
  D.push({z:P.z,mind:1,draw(){const v=trView(),flip=v==='W',sv=flip?'E':v,X=sx(P.x),Y=sz(P.z),bob=P.spd>0?(Math.floor(t*12)%2):0;
    drawSpr('tractor_'+sv+'u',X,Y-bob*.5,null,'S',0,{flip});const o=TR_SEAT[v];drawSpr('farmer',X+o[0],Y+o[1]-bob,'sit',v==='W'?'W':v,0);
    drawSpr('tractor_'+sv+'o',X,Y,null,'S',0,{flip});}});};}
// sold at Pruitt's garage
{const _r=vendors.hollis.rows;vendors.hollis.rows=()=>{const rows=_r();const T=EMP().tractor;
  rows.push({k:'tractor',name:'Hollis’s old tractor',desc:T?'Yours. It’s parked where you left it.':'Red under the rust, from before the war. “Starts on the second try. Every time. You can set your watch by it.” Turns over bare ground three squares wide as you drive it.',price:TRACTOR_PRICE,can:!T,buy(){EMP().tractor={x:EMP_PARK.x,z:EMP_PARK.z,dir:'E',drill:false,reaper:false};trPark();toast('Hollis drives it out to the farm himself, and walks back.',3.2);}});
  rows.push({k:'drill',name:'A seed drill for the tractor',desc:!T?'For the tractor, when you have one.':T.drill?'Hitched on.':'Sows tilled ground from the seeds you’ve picked, as you drive over it.',price:DRILL_PRICE,can:!!T&&!T.drill,buy(){EMP().tractor.drill=true;}});
  rows.push({k:'reaper',name:'A reaper for the tractor',desc:!T?'For the tractor, when you have one.':T.reaper?'Hitched on.':'Cuts ripe crops into your bag as you drive over them.',price:REAPER_PRICE,can:!!T&&!T.reaper,buy(){EMP().tractor.reaper=true;}});
  return rows;};}
// ---- the farm book
function empOpen(tab){tab=tab||'land';const E=EMP(),host=empHost();const T=(k,l)=>`<button data-emtab="${k}" class="${tab===k?'on':''}">${l}</button>`;
  let h=`<div class="bzled"></div><h3>The farm book <span class="bzpurse">${S.coins} coins</span></h3><div class="bztabs">${T('land','Land')}${T('hands','Hands')}${T('tractor','Tractor')}${T('town','Town fund')}</div>`;
  if(tab==='land'){const own=LAND_PARCELS.filter(P=>landOwns(P.id));const fld=tiles.length,planted=tiles.filter(t=>t.crop).length;
    h+=`<p class="bzs">The farm is <b>${fld} squares</b> of field now, ${planted} of them planted.${E.loans.length?'':' You owe the bank nothing.'}</p>`;
    for(const L of E.loans){const P=empParcel(L.p);const rest=L.left*L.per+(L.owed||0);
      h+=bizRow(`<b>${P?P.name:'Land'}: the mortgage</b><small>${L.per} a morning, ${L.left} morning${L.left===1?'':'s'} to go${L.owed?` · ${L.owed} carried over`:''}.</small>`,'',host?`<button data-empay="${L.p}" ${S.coins<rest?'class="nope"':''}>Pay it off · ${rest}</button>`:'');}
    h+='<h4>The land</h4>';
    for(const P of LAND_PARCELS){const mine=landOwns(P.id);const down=Math.ceil(P.price*.2);
      h+=bizRow(`<b>${P.name}</b><small>${mine?`Yours. ${P.w*P.h} squares.`:`${P.w*P.h} squares. ${P.bank?'The bank’s land. ':''}${P.price} coins, or ${down} down and ${empPer(P)} a morning for 30 mornings.`}</small>`,'',
        mine||!host?'':`<button data-embuy="${P.id}" ${S.coins<P.price?'class="nope"':''}>Buy · ${P.price}</button><button data-emmort="${P.id}" ${S.coins<down?'class="nope"':''}>Bank · ${down}</button>`);}
    if(!host)h+=`<p class="bzs">Only the farm’s owner can sign for land. Anything they buy is yours to work too.</p>`;}
  else if(tab==='hands'){const L=E.last;h+=`<p class="bzs">People from town who’ll work your ground for a fair day’s wage, paid at dawn. No pay in the tin, no work that day.</p>`;
    if(L&&L.day===S.day&&L.did.length)h+=`<p class="bwlead">This morning: ${L.did.join('; ')}.</p>`;
    for(const H of EMP_HANDS){const on=E.hands.includes(H.id);h+=bizRow(`<b>${H.name}</b><small>${H.note}. ${EMP_JOB[H.job][0].toUpperCase()+EMP_JOB[H.job].slice(1)} · wage ${H.wage}</small>`,'',!host?'':on?`<button data-emfire="${H.id}">Let go</button>`:`<button data-emhire="${H.id}">Hire</button>`);}
    const w=E.hands.reduce((a,id)=>a+((EMP_HANDS.find(h=>h.id===id)||{}).wage||0),0);h+=`<p class="bzs">Wages: <b>${w} a morning</b>.${E.loans.length?` The bank takes ${E.loans.reduce((a,L)=>a+L.per,0)} a morning too.`:''}</p>`;}
  else if(tab==='tractor'){const t=E.tractor;
    if(!t)h+=`<p class="bzs">Pruitt’s garage has Hollis’s old red tractor for ${TRACTOR_PRICE}. Drive it over the field and it turns bare ground over three squares wide; a seed drill (${DRILL_PRICE}) sows as it goes, and a reaper (${REAPER_PRICE}) cuts what’s ripe.</p>`;
    else{h+=`<p class="bzs">Hollis’s old tractor, parked ${Math.hypot(t.x-EMP_PARK.x,t.z-EMP_PARK.z)<3?'in the yard':'where you left it'}. Walk up to it and climb on.</p>`;
      h+=bizRow('<b>The harrow</b><small>Turns bare ground over, three squares wide. Always on.</small>','','<small>Hitched</small>');
      h+=bizRow(`<b>The seed drill</b><small>Sows tilled ground from the seeds you’ve picked.</small>`,'',t.drill?'<small>Hitched</small>':`<small>At Pruitt’s · ${DRILL_PRICE}</small>`);
      h+=bizRow(`<b>The reaper</b><small>Cuts ripe crops into your bag.</small>`,'',t.reaper?'<small>Hitched</small>':`<small>At Pruitt’s · ${REAPER_PRICE}</small>`);}}
  else{h+=`<p class="bzs">What the farm makes can mend the town, now, before anything else is saved. ${E.given?`The farm has given <b>${E.given} coins</b> so far.`:''}</p>`;
    for(const F of EMP_FUND){const d=E.fund[F.k];const wait=F.again&&d?d+F.again-S.day:0;const done=d&&!F.again;
      h+=bizRow(`<b>${F.name}</b><small>${done?`Done, day ${d}.`:wait>0?`Done, day ${d}. Again in ${wait} day${wait>1?'s':''}.`:F.again?`Every week, if you like.`:''}</small>`,'',done||wait>0?'':`<button data-emfund="${F.k}" ${S.coins<F.cost?'class="nope"':''}>Give · ${F.cost}</button>`);}}
  openNote(h,'Close the book');const N=$('noteText');if(!N)return;const re=t=>setTimeout(()=>empOpen(t),0);
  const pay=c=>{if(S.coins<c){SFX.deny&&SFX.deny();toast(`That’s ${c} coins. You have ${S.coins}.`,2.2);return false;}S.coins-=c;SFX.coin&&SFX.coin();updateHud&&updateHud();return true;};
  N.querySelectorAll('[data-emtab]').forEach(b=>b.onclick=()=>re(b.dataset.emtab));
  N.querySelectorAll('[data-empay]').forEach(b=>b.onclick=()=>{const L=E.loans.find(q=>q.p===b.dataset.empay);if(!L)return;const rest=L.left*L.per+(L.owed||0);if(!pay(rest))return;E.loans=E.loans.filter(q=>q!==L);toast('Paid off. The deed is clear.',2.4);re('land');});
  N.querySelectorAll('[data-embuy]').forEach(b=>b.onclick=()=>{const P=empParcel(b.dataset.embuy);if(!P||landOwns(P.id)||!pay(P.price))return;landOwnedSet()[P.id]={day:S.day};landSync();try{saveGame&&saveGame();}catch(e){}toast(`${P.name} is yours.`,2.6);re('land');});
  N.querySelectorAll('[data-emmort]').forEach(b=>b.onclick=()=>{const P=empParcel(b.dataset.emmort);if(!P||landOwns(P.id))return;if(!pay(Math.ceil(P.price*.2)))return;empMortgage(P);re('land');});
  N.querySelectorAll('[data-emhire]').forEach(b=>b.onclick=()=>{if(!E.hands.includes(b.dataset.emhire))E.hands.push(b.dataset.emhire);const H=EMP_HANDS.find(h=>h.id===b.dataset.emhire);toast(`${H.name} will be at the gate at dawn.`,2.4);re('hands');});
  N.querySelectorAll('[data-emfire]').forEach(b=>b.onclick=()=>{E.hands=E.hands.filter(x=>x!==b.dataset.emfire);re('hands');});
  N.querySelectorAll('[data-emfund]').forEach(b=>b.onclick=()=>{const F=EMP_FUND.find(f=>f.k===b.dataset.emfund);if(!F||!pay(F.cost))return;E.fund[F.k]=S.day;E.given+=F.cost;empFriends(F.cost>=300?8:5);
    try{if(S.biz&&S.biz.own)S.biz.own.rep=Math.min(100,(S.biz.own.rep||50)+3);if(typeof bwOn==='function'&&bwOn()&&BW().shops[bwMe()])BW().shops[bwMe()].rep=Math.min(100,BW().shops[bwMe()].rep+3);}catch(e){}
    SFX.bell&&SFX.bell();addLore&&addLore(F.say);setTimeout(()=>openNote(`<p class="date">The town fund · ${F.name}</p><p>${F.say}</p>`,'Close',()=>empOpen('town')),60);});}
// Grandpa's desk keeps the farm book too
{const it=interact.find(q=>q.on&&String(q.act).includes('Grandpa’s desk'));if(it){const _a=it.act;it.act=function(){const r=_a.apply(this,arguments);try{const N=$('noteText');if(N&&!N.querySelector('[data-farmbook]')){const b=document.createElement('p');b.innerHTML='<button data-farmbook="1" class="btn" style="font:inherit;padding:4px 10px;background:#3a2210;color:#f4e6c8;border:0">Open the farm book</button>';N.appendChild(b);b.querySelector('button').onclick=()=>empOpen('land');}}catch(e){}return r;};}}
// the farm is shared: the book travels with it; the tractor comes back after a load
if(typeof WORLD_KEYS!=='undefined'&&!WORLD_KEYS.includes('emp'))WORLD_KEYS.push('emp');
{const _lg=loadGame;loadGame=function(d){const r=_lg.apply(this,arguments);try{TR.ride=false;EMP();trPark();}catch(e){}return r;};}
{const _wr=typeof worldRebuild==='function'?worldRebuild:null;if(_wr)worldRebuild=function(keys){const r=_wr.apply(this,arguments);if(!keys||keys.has('emp')){try{if(!TR.ride)trPark();}catch(e){}}return r;};}
// (the parked tractor waits for its picture to load before it appears)
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<2)return;t=0;try{const E=S.emp;if(E&&E.tractor&&!TR.ride&&!TR.obj)trPark();}catch(e){}};}
