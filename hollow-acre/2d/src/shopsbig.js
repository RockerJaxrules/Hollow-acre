/* ================= the shops, bigger and lived in (#152). Each shop gets a larger room and is stocked like a working shop:
   the general store has aisles, a produce stand, seed racks, a candy case, plants and a stove corner where the old men play chess
   (and the store cat asleep on her cushion); the forge has a brick hearth with live coals, a quench trough, a grindstone and a wall
   of tongs; the carpentry has sawhorses, a lathe and furniture for sale; the feed barn has grain bins, a crate of peeping chicks and a
   saddle on its stand; the bait shop has a live-bait tank, a lure board and a fish on the wall. Light comes in through the windows in
   shafts with dust turning in them, the keepers move between the counter and the shelves, and the shop bell rings when you come in. ================= */
const F=(spr,x,z,dep,kind)=>PF(spr,x,z,dep,kind),W_=(spr,x,z)=>[spr,x,z,null,'flat'],FL=(spr,x,z)=>[spr,x,z,null,'flat'];
const SHOPS_BIG={
  store:{shell:'room_shop_store3',back:15.6,till:[14,2.4],counter:[14,4.1],lamp:[9,2.4],
    spots:{mae:[14,2.4],pip:[12.6,2.5]},browse:[[2.4,6.1],[4.2,8.6],[6.6,6.3],[11.6,8.2],[1.1,1.5],[9,1.5],[16.6,4.4],[2.6,10.6]],
    furn:[F('in_shelf_cans',1.1,.62,.4),F('in_shelf_jars',4.7,.62,.4),F('in_shelf_cans',9,.62,.4),F('in_shelf_jars',13.4,.62,.4),W_('in_poster_lost',16.9,-.45),W_('in_poster_seeds',7.75,-.45),
      F('in_counter',14,3.3,.6),F('in_candycase',16.6,3.6,.5),F('in_shelf_cans',2.4,5.4,.4),F('in_shelf_jars',4.2,5.4,.4),F('in_shelf_jars',2.4,7.9,.4),F('in_shelf_cans',4.2,7.9,.4),
      F('in_seedrack',6.6,5.6,.3),F('in_seedrack',6.6,8.0,.3),F('in_produce',11.6,7.4,.5),['pumpkin',13.6,8.1,[-.3,-.2,.3,0]],['pumpkin_b',14.2,8.3,[-.3,-.2,.3,0]],
      ['barrel',.7,2.4,[-.4,-.3,.4,0]],F('in_keg',.7,3.3,.3),['sacks',17.2,6.2,[-.55,-.3,.55,0]],F('in_crates',16.4,9.6,.4),['barrel',17.3,8.0,[-.4,-.3,.4,0]],
      F('in_stove',1.0,9.8,.5),F('in_chess',2.6,10.2,.3),F('in_chair',3.5,10.3,.25),F('in_rocker',1.8,10.6,.3),[ 'in_cat',16.9,7.2,null],
      F('in_plant',7.4,10.4,.25),F('in_plant',10.6,10.4,.25),F('in_plant2',17.3,10.3,.3),FL('in_rug',9,10.5)]},
  shop_forge:{shell:'room_shop_forge3',back:13.4,till:[10.4,3.6],counter:[10.4,5.4],lamp:[2.2,1.4],keeper:'gideon',
    browse:[[7.6,2.2],[13.6,6.4],[4.4,4.2]],
    furn:[F('in_forgehearth',2.2,1.3,.7),F('in_shelf_tools',4.9,.62,.4),W_('in_toolwall',7.6,-.45),F('bench_weapon',7.6,1.2,.45),F('in_grindstone',11,1.4,.3),['barrel',14.5,1.3,[-.4,-.3,.4,0]],
      F('in_quench',4.6,3.1,.4),['anvil',2.6,4.0,[-.45,-.3,.45,0]],['ore_coal',.9,3.4,[-.35,-.25,.35,0]],['ore_coal',1.3,4.4,[-.35,-.25,.35,0]],
      F('in_counter',10.4,4.6,.6),F('bench_armor',13.6,5.4,.45),F('in_crates',1.2,8.2,.4),F('in_keg',2.4,8.3,.3),['sacks',13.8,8.2,[-.55,-.3,.55,0]],F('in_chair',5.2,7.8,.25),['firewood',1.2,6.2,[-.6,-.3,.6,0]],F('in_crates',7.4,6.8,.4),['sacks',8.6,6.9,[-.55,-.3,.55,0]],['barrel',14.4,3.0,[-.4,-.3,.4,0]]]},
  shop_carp:{shell:'room_shop_carp3',back:13.4,till:[11.4,3.6],counter:[11.4,5.4],lamp:[7.5,2.4],keeper:'nell',
    browse:[[4.6,5.0],[13.2,7.8],[8.6,1.6]],
    furn:[['lumber',1.2,1.3,[-.75,-.35,.75,0]],['lumber',1.2,2.8,[-.75,-.35,.75,0]],F('bench_furn',4.4,1.15,.45),F('in_shelf_tools',8.6,.62,.4),F('in_lathe',11,1.6,.4),
      F('in_sawhorse',4.6,4.3,.3),F('in_sawhorse',7.4,4.5,.3),F('in_counter',11.4,4.6,.6),F('in_chairstack',14.2,4.2,.4),
      F('in_table',13.2,7.0,.45),F('in_chair',12,7.05,.25),F('in_chair',14.4,7.05,.25),F('in_rocker',1.4,6.6,.3),F('in_cradle',3.0,7.0,.3),F('in_crates',9.2,8.2,.4),F('in_plant',.8,8.3,.25),FL('in_rug',7.5,8.4),F('in_desk',4.6,7.8,.45),['lumber',13.8,8.3,[-.75,-.35,.75,0]],F('in_shelf_books',2.4,.62,.4)]},
  shop_feed:{shell:'room_shop_feed3',back:13.4,till:[11.4,3.4],counter:[11.4,5.2],lamp:[7.5,2.2],keeper:'ezra',
    browse:[[6.6,3.0],[4.9,5.6],[14.2,4.2]],
    furn:[['hay',1.0,1.4,[-.7,-.4,.7,0]],['hay',1.0,2.9,[-.7,-.4,.7,0]],['sacks',2.5,1.1,[-.55,-.3,.55,0]],['sacks',3.4,1.3,[-.55,-.3,.55,0]],F('in_shelf_cans',9.2,.62,.4),
      F('in_feedbins',6.6,2.2,.5),F('in_counter',11.4,4.4,.6),F('in_saddle',14.4,3.2,.3),F('in_chickcrate',4.4,4.6,.4),F('in_chickcrate',5.8,4.9,.4),['barrel',14.4,6.2,[-.4,-.3,.4,0]],
      F('in_crates',1.2,7.8,.4),['hay',2.6,8.2,[-.7,-.4,.7,0]],['in_cat',3.0,5.6,null],FL('in_rug',7.5,8.4),['hay',9.8,7.6,[-.7,-.4,.7,0]],['hay',11.2,7.9,[-.7,-.4,.7,0]],['sacks',8.6,6.4,[-.55,-.3,.55,0]],['sacks',13.8,8.2,[-.55,-.3,.55,0]],F('in_seedrack',2.4,5.4,.3)]},
  shop_bait:{shell:'room_shop_bait3',back:null,till:[8.6,3.0],counter:[8.6,4.8],lamp:[6,2.2],keeper:'otto',
    browse:[[4.2,3.0],[1.6,2.0],[10.8,5.6]],
    furn:[F('in_rods',.6,.9,.3),W_('in_fishmount',4.2,-.45),W_('in_lures',7.8,-.45),W_('in_sign_open',11.1,-.5),F('in_tank',4.2,2.2,.5),F('in_counter',8.6,4.0,.6),
      ['barrel',11.2,1.4,[-.4,-.3,.4,0]],F('in_keg',.8,6.6,.3),F('in_crates',1.9,6.9,.4),F('in_drum_blue',11.2,6.8,.3),F('in_plant',11.3,4.4,.25),FL('in_rug',6,7.5)]},
  garage:{shell:'room_shop_garage3',back:13.6,lamp:[7.4,.6],
    furn:[F('in_shelf_parts',1.1,.62,.4),F('in_shelf_tools',3.1,.62,.4),F('in_bench',6.6,1.05,.5),F('in_toolbox',8.6,1.3,.35),W_('in_poster_fair',11.2,-.45),F('in_tires',11.8,1.5,.3),F('in_tires',11.8,2.5,.3),
      F('police_blocks',3.6,5.0,1.3),F('in_hoist',7.4,4.4,.3),F('in_drum',.7,7.6,.3),F('in_drum_blue',1.5,7.8,.3),F('in_tires',13.8,6.2,.3),F('in_tires',13.8,7.2,.3),F('in_crates',10.6,8.0,.4),['barrel',14.3,4.2,[-.4,-.3,.4,0]]]}};
for(const [k,B] of Object.entries(SHOPS_BIG)){const R=ROOMS[k];if(!R||!SPR[B.shell])continue;
  const old={till:null};R.shell=B.shell;R.furn=B.furn;if(B.lamp)ROOM_LAMP[k]=B.lamp;
  // the back door to where the keeper lives
  const p=typeof PRIV!=='undefined'&&PRIV[k];if(p&&B.back!=null){const it=interact.find(q=>Math.abs(q.x-(R.ox+p.pdoor))<.01&&Math.abs(q.z-(R.oz+.55))<.01);
    p.pdoor=B.back;if(ROOMS[p.key])ROOMS[p.key].pdoor=B.back;if(it)it.x=R.ox+B.back;}}
// the counters, the keepers' places behind them, and where customers stand to browse
{const C=SHOPS_BIG;const ctr=(k)=>interact.filter(q=>q.x>=ROOMS[k].ox-1&&q.x<=ROOMS[k].ox+20&&Math.abs(q.z-ROOMS[k].oz-3)<3&&(()=>{try{return q.label()==='Counter';}catch(e){return false;}})());
  for(const k of ['store','shop_forge','shop_carp','shop_feed','shop_bait']){const B=C[k];for(const it of ctr(k)){it.x=ROOMS[k].ox+B.counter[0];it.z=ROOMS[k].oz+B.counter[1];}}
  INDOOR.store.spots.mae=C.store.spots.mae;INDOOR.store.spots.pip=C.store.spots.pip;INDOOR.store.browse=C.store.browse;
  for(const [job,k] of [['forge','shop_forge'],['carp','shop_carp'],['feed','shop_feed'],['bait','shop_bait']]){const B=C[k];INDOOR[job].spots[B.keeper]=B.till;INDOOR[job].browse=B.browse;}
  const g=k=>interact.find(q=>{try{return q.label()===k&&q.x>=ROOMS.garage.ox&&q.x<ROOMS.garage.ox+20;}catch(e){return false;}});
  const wb=g('Workbench');if(wb){wb.x=ROOMS.garage.ox+6.6;wb.z=ROOMS.garage.oz+1.7;}const cr=g('Cruiser');if(cr){cr.x=ROOMS.garage.ox+3.6;cr.z=ROOMS.garage.oz+5.6;}}
// Caitlyn is at the till when she's standing behind the counter, wherever the counter is now
const STORE_TILL=SHOPS_BIG.store.till[0];
{const it=interact.find(q=>{try{return q.label()==='Counter'&&Math.abs(q.x-(ROOMS.store.ox+SHOPS_BIG.store.counter[0]))<.01;}catch(e){return false;}});
  if(it){it.act=function(){const m=npcById('mae'),p=npcById('pip');const at=n=>n&&n.loc==='in'&&n.inWant==='store';
    if(at(m)&&Math.abs(m.x-(ROOMS.store.ox+STORE_TILL))<1.6)toast('“What’ll it be, farm kid?”',1.6);else if(at(p))toast('Pip stands on a crate to reach the till. “I can do it! I can totally do it.”',2.4);
    else toast('Caitlyn calls from the back room: “Take what you need. Leave the coins by the till. I trust you. Mostly.”',2.8);openShop('mae');};}}
// things to look at in the bigger shops
const SHOP_LOOKS=[
  ['store',2.6,10.9,'The chess game in the corner has been going since before you were born. Whoever plays white has been a different old man every year. Black has not moved in forty years.'],
  ['store',16.9,7.6,'The store cat, asleep on her cushion. Caitlyn says she’s called Biscuit. She opens one eye at you, and it follows you all the way round the shop.'],
  ['store',16.9,.4,'A LOST poster, faded to cream. The face has been scratched out by something with small nails, from the inside of the glass case it was in.'],
  ['shop_forge',2.2,2.1,'The coals are never let go out. Gideon banks them every night and wakes at three to feed them. “If it goes out,” he says, “it doesn’t light again.” He won’t say what he means.'],
  ['shop_carp',3.0,7.6,'A cradle, finished and oiled, with a SOLD tag on it. The name on the tag has been rubbed out. Nell says it was ordered in 1952 and nobody ever came for it.'],
  ['shop_feed',5.1,5.4,'A crate of new chicks, peeping. Every few minutes all of them stop at once and look at the door. Then they start again.'],
  ['shop_bait',4.2,2.9,'The live-bait tank. The minnows all hang facing one corner, very still. The corner that points toward the pond.']];
for(const [k,x,z,t] of SHOP_LOOKS)interact.push({x:ROOMS[k].ox+x,z:ROOMS[k].oz+z,r:1,on:()=>S.room===k,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();toast(t,5,true);
  const key='shop:'+k+':'+x;S.rgLook=S.rgLook||{};if(!S.rgLook[key]){S.rgLook[key]=1;addLore(t);}}});
// the shop bell over the door
{const _er=enterRoom;enterRoom=function(k){_er.apply(this,arguments);if(SHOPS_BIG[k]&&k!=='garage')setTimeout(()=>{try{A.tone(1568,.35,'sine',.08,{verb:true});A.tone(2093,.5,'sine',.05,{delay:.06,verb:true});}catch(e){}},420);};}

// ---- keepers at work: they don't stand still behind the counter all day; they go to the shelves and come back
const KEEPWALK={};
{const _u=update;update=function(dt){_u(dt);if(!S.room||!SHOPS_BIG[S.room])return;const k=S.room,B=SHOPS_BIG[k],R=ROOMS[k];
  for(const n of npcs){if(n.loc!=='in'||!n.inWant||n.inWant==='home')continue;if(Math.abs(n.x-R.ox-R.w/2)>R.w/2+1||Math.abs(n.z-R.oz-R.d/2)>R.d/2+1)continue;
    if(talkingTo===n)continue;const st=KEEPWALK[n.def.id]||(KEEPWALK[n.def.id]={t:4+Math.random()*6,to:null});
    const keeper=(B.keeper===n.def.id)||(k==='store'&&(n.def.id==='mae'||n.def.id==='pip'));
    if(!st.to){st.t-=dt;if(st.t>0){n.clip='idle';continue;}
      const home=keeper?(B.spots?B.spots[n.def.id]:B.till):null;const atHome=home&&Math.hypot(n.x-R.ox-home[0],n.z-R.oz-home[1])<.3;
      const pick=keeper&&!atHome?home:B.browse[(Math.random()*B.browse.length)|0];st.to=[R.ox+pick[0],R.oz+pick[1]];st.back=keeper&&!atHome;}
    const dx=st.to[0]-n.x,dz=st.to[1]-n.z,d=Math.hypot(dx,dz);
    if(d<.08){n.x=st.to[0];n.z=st.to[1];st.to=null;st.t=st.back?8+Math.random()*10:3+Math.random()*4;n.clip='idle';n.dir=st.back?'S':'N';continue;}
    const s=Math.min(d,.9*dt),ox=n.x,oz=n.z;n.x+=dx/d*s;n.z+=dz/d*s;collide(n,.28);n.dir=dirOf(dx,dz);n.clip='walk';
    if(Math.hypot(n.x-ox,n.z-oz)<s*.3){st.stuck=(st.stuck||0)+dt;if(st.stuck>1){st.stuck=0;st.to=null;st.t=1;}}else st.stuck=0;}};}

// ---- daylight through the windows: shafts of light falling across the floor, with dust turning in them
const SHAFTS={motes:[]};
{const _do=depthOver;depthOver=function(t){_do(t);if(!S.room||S.room==='mine')return;const R=ROOMS[S.room],m=R&&SPR[R.shell||('room_'+S.room)];if(!m||!m.room||!m.room.windows)return;
  const h=S.hour;if(isNight()||h<7||h>18.6)return;const k=clamp((h-7)/1.2,0,1)*clamp((18.6-h)/1.2,0,1)*(S.storm?.35:1);if(k<=0)return;
  const lean=clamp((h-12.5)/6,-1,1);   // morning light slants one way, evening the other
  ctx2.save();ctx2.globalCompositeOperation='lighter';
  for(const w of m.room.windows){const wx=w[0],ww=(w[2]?w[2]/32:1.1)*.5;const x0=sx(R.ox+wx-ww),x1=sx(R.ox+wx+ww),y0=sz(R.oz)-38;
    const fz=R.oz+2.6+Math.abs(lean)*.6,fx=-lean*2.2;const X0=sx(R.ox+wx-ww*1.4+fx),X1=sx(R.ox+wx+ww*1.4+fx),Y1=sz(fz);
    const g=ctx2.createLinearGradient(0,y0,0,Y1);g.addColorStop(0,`rgba(255,226,160,${(.16*k).toFixed(3)})`);g.addColorStop(1,`rgba(255,214,140,${(.06*k).toFixed(3)})`);
    ctx2.fillStyle=g;ctx2.beginPath();ctx2.moveTo(x0,y0);ctx2.lineTo(x1,y0);ctx2.lineTo(X1,Y1);ctx2.lineTo(X0,Y1);ctx2.closePath();ctx2.fill();
    // the patch of sun on the floor
    ctx2.fillStyle=`rgba(255,220,150,${(.09*k).toFixed(3)})`;ctx2.beginPath();ctx2.ellipse((X0+X1)/2,Y1,(X1-X0)/2+4,7,0,0,6.283);ctx2.fill();
    // dust motes turning in the light
    for(let i=0;i<7;i++){const ph=t*.25+i*1.7+wx*3;const u=(Math.sin(ph*1.3+i)*.5+.5),v=((ph*.18+i*.143)%1);
      const px=lerp(lerp(x0,x1,u),lerp(X0,X1,u),v),py=lerp(y0,Y1,v)+Math.sin(ph*2.1)*3;ctx2.fillStyle=`rgba(255,240,200,${(.55*k*(1-Math.abs(v-.5)*1.6)).toFixed(3)})`;ctx2.fillRect(Math.round(px),Math.round(py),1,1);}}
  ctx2.restore();};}
// a shop in the daytime is a bright place: the windows are big and the lamps are lit for customers
{const _am=ambient;ambient=function(h){const a=_am(h);if(!S.room||!SHOPS_BIG[S.room]||S.room==='garage')return a;const d=clamp((h-6)/1.5,0,1)*clamp((19.5-h)/1.5,0,1);
  return [lerp(a[0],244,d*.85),lerp(a[1],234,d*.85),lerp(a[2],214,d*.85)];};}
