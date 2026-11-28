/* ================= #379b the coop and the barn have their own places, and the animals live in them (owner, Nov 27: "barns and coops if
   they have set places just auto put them there don't give options because than there are just cows not moving at all outside the
   barn also steps don't align with coops door").
   - The coop goes up where the farm keeps a place for it (beside the field, where the hens already scratch); buying it no longer asks
     you where, and "Move a building" moves benches only. A save whose coop stood somewhere else has it moved home, and the walls the
     old spot left behind (moving it never took the old one away; a reload lost the new one) are cleared: the coop is solid where it
     stands and nowhere else.
   - The coop's steps stand under its door (they were drawn 14 px to the left of it).
   - The hens scratch in the yard in front of the coop by day. At dusk they walk to the ramp, up it and in through the pop-hole one
     by one; in the morning they come out the same way.
   - The cows in Grandpa's barn stood frozen in a row outside it all day and all night. Now they graze and wander in the barnyard by
     day; at dusk the barn door opens and they walk in one by one; in the morning they come out the same way. ================= */
const W79B={};
const W79B_COOP={x:11,z:-2.6};
// ---- the coop's steps under its door: the door leaf runs from x 74 to 93 of the 140 px sprite (its middle 13.5 px right of the anchor)
for(const k of ['coop','coop_n'])if(SPR[k]){SPR[k].door_dx=13.5;SPR[k].door_w=20;}
// ---- the coop's place
function w79bCoopRects(){W79B.coopR=W79B.coopR||[];for(const q of W79B.coopR){const i=rects.indexOf(q);if(i>=0)rects.splice(i,1);}W79B.coopR=[];}
{const _rb=rebuildFarm;rebuildFarm=function(){
  // a coop that was set down somewhere else goes home; its stored "collider added" flag no longer decides anything
  if(S.coop){const c=S.coopPos;if(!c||Math.abs(c.x-W79B_COOP.x)>.01||Math.abs(c.z-W79B_COOP.z)>.01||c.col){
    if(c&&(Math.abs(c.x-W79B_COOP.x)>.01||Math.abs(c.z-W79B_COOP.z)>.01))w79bOldCoop(c);S.coopPos={x:W79B_COOP.x,z:W79B_COOP.z,col:1};}}
  const r=_rb.apply(this,arguments);
  w79bCoopRects();if(S.coop){const c=W79B_COOP;addRect(c.x-1.4,c.z-1.2,c.x+1.4,c.z-.1);W79B.coopR.push(rects[rects.length-1]);}
  return r;};}
// the wall an old coop spot left behind (the same rect the old code added there)
function w79bOldCoop(c){for(let i=rects.length-1;i>=0;i--){const q=rects[i];if(Math.abs(q.x0-(c.x-1.4))<.01&&Math.abs(q.x1-(c.x+1.4))<.01&&Math.abs(q.z0-(c.z-1.2))<.01&&Math.abs(q.z1-(c.z-.1))<.01)rects.splice(i,1);}}
// buying the coop puts it in its place; "Move a building" only offers the benches
{const _pl=vendors.plans.rows;vendors.plans.rows=()=>_pl().map(r=>{if(r.k!=='coop'||S.coop)return r;const b0=r.buy;return Object.assign({},r,{buy(){
    if(typeof startPlace!=='function')return b0.apply(this,arguments);const sp=startPlace;startPlace=function(o){startPlace=sp;if(!o||o.spr!=='coop')return sp.apply(this,arguments);
      // (the shop has already taken the price and the wood and stone, as it always did before the placing)
      o.done(W79B_COOP.x,W79B_COOP.z);};
    try{return b0.apply(this,arguments);}finally{startPlace=sp;}}});});}
if(typeof bmMovable==='function'){const _bm=bmMovable;bmMovable=function(){return _bm().filter(q=>q[0]!=='coop');};}
// ---- the hens: a yard in front of the coop, the ramp, the pop-hole
// in world metres from the coop's anchor: the ramp's foot (sprite x 8, y 129) and its top at the pop-hole (x 36, y 116)
const W79B_RAMP={fx:(8-70)/32,fz:(129-124)/32,tx:(36-70)/32,tz:(116-124)/32};
function w79bHenBed(){return isNight()||S.hour>=18.6||S.hour<6.1;}
function w79bYard(){const c=W79B_COOP;return {x0:c.x-1.4,x1:c.x+1.8,z0:c.z+.3,z1:c.z+2.1};}
function w79bHenInit(h,i){if(h._w)return;h._w=1;h.mode=w79bHenBed()?'in':'yard';h.vis=h.mode!=='in';const Y=w79bYard();if(h.vis){h.x=lerp(Y.x0,Y.x1,rand());h.z=lerp(Y.z0,Y.z1,rand());h.tx=h.x;h.tz=h.z;}h.dl=i*.9;}
function w79bHens(dt){if(!S.coop)return false;const c=W79B_COOP,R=W79B_RAMP,Y=w79bYard(),bed=w79bHenBed();
  HENS.forEach((h,i)=>{w79bHenInit(h,i);
    if(h.mode==='in'){if(!bed){h.dl-=dt;if(h.dl<=0){h.mode='out';h.u=0;h.vis=true;}}else h.dl=i*1.1+.4;return;}
    if(h.mode==='out'||h.mode==='up'){h.u+=dt/1.1;const u=Math.min(1,h.u),a=h.mode==='out'?1-u:u;h.x=c.x+lerp(R.fx,R.tx,a);h.z=c.z+lerp(R.fz,R.tz,a);h.flip=h.mode==='out';
      if(u>=1){if(h.mode==='out'){h.mode='yard';h.tx=lerp(Y.x0,Y.x1,rand());h.tz=lerp(Y.z0,Y.z1,rand());h.wait=0;}else{h.mode='in';h.vis=false;h.dl=i*1.1+.4;}}return;}
    if(bed&&h.mode==='yard'){h.mode='bed';h.tx=c.x+R.fx;h.tz=c.z+R.fz;h.dl=i*.7;}
    if(h.mode==='bed'&&h.dl>0){h.dl-=dt;return;}
    if(h.peck>0){h.peck-=dt;return;}if(h.mode==='yard'&&h.wait>0){h.wait-=dt;if(h.wait<=0&&rand()<.5)h.peck=.6+rand();return;}
    const pd=Math.hypot(P.x-h.x,P.z-h.z);if(h.mode==='yard'&&pd<1.6){h.tx=clamp(h.x+(h.x-P.x)*2,Y.x0,Y.x1);h.tz=clamp(h.z+(h.z-P.z)*2,Y.z0,Y.z1);}
    const dx=h.tx-h.x,dz=h.tz-h.z,d=Math.hypot(dx,dz);
    if(d<.12){if(h.mode==='bed'){h.mode='up';h.u=0;}else{h.wait=.8+rand()*2.5;h.tx=lerp(Y.x0,Y.x1,rand());h.tz=lerp(Y.z0,Y.z1,rand());}return;}
    const sp=pd<1.6&&h.mode==='yard'?2.6:1.1;h.x+=dx/d*Math.min(d,sp*dt);h.z+=dz/d*Math.min(d,sp*dt);h.flip=dx<0;});
  return true;}
{const _lu=lifeUpdate;lifeUpdate=function(dt){if(!S.coop)return _lu.apply(this,arguments);const keep=HENS.splice(0);try{_lu.apply(this,arguments);}finally{HENS.push(...keep);}try{w79bHens(dt);}catch(e){}};}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){if(!S.coop)return _ld.apply(this,arguments);const keep=HENS.splice(0);try{_ld.apply(this,arguments);}finally{HENS.push(...keep);}
  const c=W79B_COOP;for(const h of HENS){if(!h.vis)continue;const onRamp=h.mode==='up'||h.mode==='out';const z=onRamp?Math.max(h.z,c.z+.02):h.z;
    D.push({z,mind:1,draw(){const f=onRamp?(Math.floor(t*8)%2):h.peck>0?2:h.wait>0&&h.mode==='yard'?0:(Math.floor(t*8)%2);drawSpr('chicken',sx(h.x),sz(h.z),'a','S',f,{flip:h.flip});}});}};}
// ---- the cows: Grandpa's barnyard by day, the barn by night, the door open while they go in and out
const W79B_BARN={x:16,z:-9.6,door:{x:16,z:-9.05},yard:{x0:11.2,x1:20.6,z0:-8.1,z1:-5.9}};
function w79bCowBed(){return isNight()||S.hour>=18.9||S.hour<6.4;}
function w79bCowSpot(){const Y=W79B_BARN.yard;for(let k=0;k<12;k++){const p={x:lerp(Y.x0,Y.x1,rand()),z:lerp(Y.z0,Y.z1,rand())};const q={x:p.x,z:p.z};collide(q,.55);if(Math.hypot(q.x-p.x,q.z-p.z)<.02&&Math.abs(p.x-W79B_BARN.door.x)>1.1)return p;}return {x:lerp(Y.x0,Y.x1,rand()),z:Y.z1};}
function w79bDoorArt(){if(W79B.doorSpr)return W79B.doorSpr;const W=46,H=51,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  // the doorway with both leaves swung in: the barn's dark inside, straw on the floor in the light that falls through, each leaf a narrow
  // red strip with the ends of its cream brace along the jamb
  for(let y=0;y<H;y++){const t=y/H;P(0,y,W,1,t<.62?(t<.3?'#120b0a':'#1a110e'):'#2a1e14');}
  for(let y=Math.round(H*.62);y<H;y++){const k=(y-H*.62)/(H*.38),x0=Math.round(9-k*5),x1=Math.round(W-9+k*5);P(x0,y,x1-x0,1,y%3===0?'#6e5a34':'#5c4a2a');}
  for(const [x,w] of [[14,3],[24,2],[31,3]])P(x,H-6+(x%3),w,1,'#8a7444');
  P(9,Math.round(H*.6),W-18,1,'#3a2a18');
  for(const left of [true,false]){const x0=left?0:W-5;for(let y=0;y<H;y++){P(x0,y,5,1,'#5a1416');P(left?x0+4:x0,y,1,1,'#3a0c0e');P(left?x0:x0+4,y,1,1,'#7a2420');}
    for(let y=3;y<H-2;y+=7)P(x0+1,y,3,1,'#c8b490');}
  P(0,0,W,1,'#0a0606');
  return W79B.doorSpr=(function(){const src='w79b:barndoor';IMG[src]=c;SPR.w79b_barndoor={src,fw:W,fh:H,ax:130.5-108,ay:215-157,foot:[0,0,0,0]};return 'w79b_barndoor';})();}
function w79bCows(dt){if(!S.cows||!FARM_COWS.length)return;const B=W79B_BARN,bed=w79bCowBed();if(!W79B.door){W79B.door=obj(w79bDoorArt(),B.x,B.z+.004,{kind:'prop',noCol:true});W79B.door.hide=true;}
  let moving=false;
  FARM_COWS.forEach((e,i)=>{let c=e._w;if(!c){c=e._w={mode:bed?'in':'yard',t:rand()*4,dl:i*2.2};if(c.mode==='in')e.hide=true;else{const p=w79bCowSpot();e.x=p.x;e.z=p.z;}}
    if(c.mode==='in'){if(!bed){c.dl-=dt;if(c.dl<=0){c.mode='out';e.hide=false;e.x=B.door.x;e.z=B.door.z+.25;const p=w79bCowSpot();c.tx=p.x;c.tz=p.z;}}else c.dl=i*2.4+.5;return;}
    if(bed&&c.mode==='yard'){c.mode='bed';c.dl=i*2.6;c.tx=B.door.x;c.tz=B.door.z+.5;}
    if(c.mode==='bed'&&c.dl>0){c.dl-=dt;return;}
    if(c.mode==='yard'){c.t-=dt;if(c.t<0){c.t=5+rand()*7;if(c.tx==null||rand()<.7){const p=w79bCowSpot();c.tx=p.x;c.tz=p.z;}}}
    if(c.tx==null)return;const dx=c.tx-e.x,dz=c.tz-e.z,d=Math.hypot(dx,dz);
    if(c.mode==='bed'&&d<.15){if(c.tz>B.door.z+.1){c.tz=B.door.z-.05;moving=true;return;}c.mode='in';e.hide=true;c.dl=i*2.4+.5;return;}
    if(c.mode==='out'&&d<.15){c.mode='yard';c.t=3+rand()*4;return;}
    if(d>.05){const sp=(c.mode==='yard'?.32:.75)*dt;e.x+=dx/d*Math.min(d,sp);e.z+=dz/d*Math.min(d,sp);if(Math.abs(dx)>.05)e.flip=dx<0;}
    if(c.mode!=='yard'&&Math.hypot(e.x-B.door.x,e.z-B.door.z)<1.6)moving=true;});
  // the door stands open while one of them is in the doorway, and a moment after
  W79B.dt=moving?1.4:Math.max(0,(W79B.dt||0)-dt);W79B.door.hide=!(W79B.dt>0);}
{const _u=update;update=function(dt){_u(dt);try{if(!S.room)w79bCows(dt);}catch(e){}};}

/* ---------------------------------------------------------------- seats face what they are for (owner: "All natural already existing
   furniture should not be placed randomly and oriented in one way like chairs and benches"). Every chair in every house, shop,
   tavern and cabin was drawn facing the room, the same way, even the two either side of a table. Now a chair beside a table turns to
   it (the east-facing chair, or the same flipped for west), one in front of a table sits with its back to you, one behind it faces
   you; a rocking chair at a table does the same with its own turned art. Chairs with no table keep facing into the room. The pieces
   you place yourself keep the way you turned them. */
const W79B_SEATS={chair:{S:['in_chair'],N:['in_chairN'],E:['in_chairE'],W:['in_chairE',1]},rock:{S:['in_rockS'],N:['in_rockN'],E:['in_rockE'],W:['in_rockE',1]}};
const W79B_FAM={in_chair:'chair',in_chairN:'chair',in_chairE:'chair',in_rockS:'rock',in_rockN:'rock',in_rockE:'rock'};
const W79B_TAB=/^(in_table|in_table_e|in_table_bk|in_longtable|in_desk|in_desk_[a-z]+|in_schooldesk|in_tablecards|in_goodstable|in_phonetable|in_chess[a-z_]*|f2_table\d?)(_n)?$/;
function w79bSeatPass(){const byRoom={};for(const o of OBJ){if(!o.room||o.hide)continue;if(W79B_TAB.test(o.spr))(byRoom[o.room]=byRoom[o.room]||[]).push(o);}
  let n=0;for(const c of OBJ){if(c._w79s||!c.room||c.furnKey)continue;const fam=W79B_FAM[c.spr];if(!fam)continue;c._w79s=1;const T=byRoom[c.room];if(!T)continue;
    let best=null,bd=1e9;for(const t of T){const m=SPR[t.spr];if(!m)continue;const hw=Math.max(.3,m.fw/64-.08),dx=Math.max(0,Math.abs(c.x-t.x)-hw),dz=Math.max(0,Math.abs((c.z-.1)-(t.z-.25))-.35),d=Math.hypot(dx,dz);if(d<bd){bd=d;best=t;}}
    if(!best||bd>.75)continue;const m=SPR[best.spr],hw=Math.max(.3,m.fw/64-.08);
    const f=Math.abs(c.x-best.x)<hw-.05?(c.z>best.z-.25?'N':'S'):(c.x<best.x?'E':'W');const v=W79B_SEATS[fam][f];if(!SPR[v[0]])continue;
    if(c.spr!==v[0]||!!c.flip!==!!v[1]){c.spr=v[0];c.flip=!!v[1];n++;}}
  return n;}
setInterval(()=>{try{if(typeof OBJ==='undefined'||!OBJ.length||!OBJ.some(o=>o.room))return;w79bSeatPass();}catch(e){}},1500);

/* ---------------------------------------------------------------- roads that stopped in the grass (owner: "Roads should connect they can
   become dirt or gravel roads but shouldn't abruptly end"). Every end of every road was checked: most end at a door, a yard, a dock, a
   field gate, the quarry or a graveyard. These did not, and now do:
   - the track along the top of the farm's north lane ran on past the lane at both ends into grass: its east end now goes on as a
     narrow dirt path to the path by the bench below Church Hill, and its west end widens into Grandpa's woodlot (a chopping block,
     split wood, sawn lumber);
   - the dirt road east runs on into the dark woods at the edge of the valley instead of stopping just short of them;
   - the Low Fields' two long tracks are joined at their west ends and at their east ends, so they make one loop; the track south
     through the fields runs on into the woods at the valley's edge.
   The new stretches are added after the world is laid out (nothing already placed moves, so saves keep every tree and stone), the
   ground is redrawn with them, and only the trees, bushes, rocks and grass standing on them are taken away. */
const W79B_ROADS=[[212,-6,224,-6,3],[11.2,-29.4,24.2,-23.9,1.4],[12.2,-29.35,16.2,-28.3,1.9],[-11,-29.4,-13.4,-29.6,2.4],[-62,302.4,-62.2,353.5,1.3],[196,301.9,196.2,354.1,1.3],[19.5,398,19.8,415,1.6]];
const W79B_CLEAR=/^(tree|bush|deco|deco2|grass|weed|flower|rock|stump)$/;
function w79bRoads(){if(W79B.roads||typeof ROADS==='undefined')return;W79B.roads=1;
  for(const r of W79B_ROADS){ROADS.push(r);const pad=r[4]/2+.55;
    for(const o of OBJ){if(o.hide||o.room||o.x>=250)continue;const d=segDist(o.x,o.z,r[0],r[1],r[2],r[3]);if(d>pad+(o.kind==='tree'?.4:0))continue;
      const tree=o.kind==='tree'||/^(oak|maple|pine|spruce|birch|willow|tree|apple|deadoak|deadtree|snag)/.test(o.spr);
      if(W79B_CLEAR.test(o.kind||'')||tree||/^(rock_|bush|hedge|weeds_|grass|tuft|fern|reed|stump)/.test(o.spr)){o.hide=true;o._w79road=1;}}
    for(let i=circles.length-1;i>=0;i--){const c=circles[i];if(c.r<1.6&&segDist(c.x,c.z,r[0],r[1],r[2],r[3])<pad+.2)circles.splice(i,1);}}
  // Grandpa's woodlot at the end of the north track
  const W=[['choppingblock',-12.9,-28.5],['firewood',-14.2,-29.9],['lumber',-12.1,-30.7],['stump_oak',-14.6,-28.2]];
  for(const [s,x,z] of W){if(!SPR[s])continue;obj(s,x,z,{kind:'prop'});addCircle(x,z-.1,s==='lumber'?.5:.35);}
  try{chunks.clear();}catch(e){}try{if(typeof CGRID!=='undefined')CGRID.dirty=true;}catch(e){}}
if(typeof buildWorld==='function'){const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{w79bRoads();}catch(e){console.warn('w79b roads',e);}return r;};}
setInterval(()=>{try{if(!W79B.roads&&typeof OBJ!=='undefined'&&OBJ.length>1000)w79bRoads();}catch(e){}},1000);
