/* ================= #249 the farm's own land, and land to buy. Grandpa's place stays where the story put it, but it owns very
   little: the cabin yard and the starting field. All around it the land is staked out and for sale (a deed from the land office
   in the Town Hall): the west meadow, the east paddock, the south acre by the corn, and the long field below it. Each one you
   buy comes to you overgrown, its trees and scrub cleared off for planting but stones and weeds still to pick off, and every
   square of it is field: tilled, planted, watered and sprinkled just like the first one. That's the farm growing, as big as
   you can afford.
   Friends' cabins no longer sit in the farmyard (one was right on the road): they have a section of their own, Homestead Lane,
   across the creek, each cabin with its own garden plot beside it.
   Tiles: the new squares join the field's list after everything else, always in the same order (the parcels in a fixed order,
   then the cabin plots), so a farm shared between friends lists them identically, and old saves are untouched (their squares
   are saved by number). The new squares are saved by where they sit inside their own piece of land. ================= */
const LAND_PARCELS=[
  {id:'west',name:'The west meadow',x0:-23,z0:1,w:9,h:9,price:600,sign:[-18.5,.2],
    desc:'Nine paces by nine of rough meadow past the old hedge, running down to the creek. Flat, well drained, full of stones Grandpa never got round to.'},
  {id:'east',name:'The east paddock',x0:6,z0:1,w:11,h:8,price:900,sign:[11.6,.2],
    desc:'The paddock east of the field, below the coop. Good black soil; the hens will watch you work it.'},
  {id:'south',name:'The south acre',x0:12,z0:11,w:6,h:12,price:1400,sign:[15,10.3],
    desc:'A long strip beside the corn, running down to the creek road. The corn rustles along its whole west edge, day and night.'},
  {id:'long',name:'The long field',x0:-16,z0:26,w:27,h:8,price:3000,sign:[-2.5,25.2],
    desc:'The whole stretch below the corn: twenty-seven paces of open ground. Enough to feed the valley, if anyone would let you.'}];
// Homestead Lane: friends' cabins, each with a garden plot of its own (west side, east side, then the west side again)
const LANE={x:-50,z0:-4,z1:33};
const LANE_SPOTS=[{x:-58,z:11,side:-1},{x:-42,z:11,side:1},{x:-58,z:26.5,side:-1}];   // (#291) the third far enough down the lane for the biggest cabin above it
for(let i=0;i<FH_SPOTS.length&&i<LANE_SPOTS.length;i++){FH_SPOTS[i].x=LANE_SPOTS[i].x;FH_SPOTS[i].z=LANE_SPOTS[i].z;}
const homePlot=i=>{const s=LANE_SPOTS[i];return {id:'home'+i,home:i,name:'Your garden plot',x0:s.x-3,z0:s.z+2.2,w:6,h:4};};
const LAND={built:{},order:[],signs:{},stakes:{},cleared:false};
const landOwnedSet=()=>{S.land=S.land&&typeof S.land==='object'?S.land:{own:{}};S.land.own=S.land.own||{};return S.land.own;};
const landOwns=id=>!!landOwnedSet()[id];
function landActiveHomes(){if(typeof mpOn!=='function'||!mpOn()||!mpOwn())return [];const n=Math.max(0,Math.min(LANE_SPOTS.length,S.world.hands|0));return [...Array(n).keys()].map(homePlot);}
function landWanted(){return LAND_PARCELS.filter(p=>landOwns(p.id)).concat(landActiveHomes());}
// ---- the ground: Homestead Lane and the little paths to each cabin door
{const Dt=LAYERS.dirt;LAYERS.dirt=(x,z)=>{if(x>-70&&x<-30&&z>-6&&z<36){const w=.95+(fbm(x*.7+3,z*.7)-.5)*.5;
      if(Math.abs(x-LANE.x)<w&&z>LANE.z0&&z<LANE.z1)return true;
      for(const s of LANE_SPOTS){const pz=s.z+1.2;if(Math.abs(z-pz)<.7+(fbm(x*.9,z*.9)-.5)*.4&&(s.side<0?(x>s.x-.6&&x<LANE.x):(x<s.x+.6&&x>LANE.x)))return true;
        if(Math.abs(x-s.x)<.8&&z>s.z-.2&&z<pz+.4)return true;}}
    return Dt(x,z);};}
// the lane's ground is open meadow: no dark woodland floor left behind where the copse was cleared (it read as mud)
{const Dk=LAYERS.dark;LAYERS.dark=(x,z)=>{if(x>-67+(fbm(z*.3,x*.3)-.5)*2&&x<-33+(fbm(z*.3+5,x*.3)-.5)*2&&z>1+(fbm(x*.3,z*.3+9)-.5)*2&&z<33)return false;return Dk(x,z);};}
// clear the lane's ground once: the trees and scrub that stood where the cabins and plots go
function landClearArea(x0,z0,x1,z1){for(const o of OBJ){if(o.hide||o.room||o.town||o.crashOak||o.mile||o.story||o.landDeb)continue;
    // (the land's own stones and weeds stay until you clear them)
    if(o.x<x0||o.x>x1||o.z<z0||o.z>z1)continue;
    if(!/^(tree|pine|bush|deco|anim|grass|plant)$/.test(o.kind||'')&&!o.debris)continue;o.hide=true;
    for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.6)circles.splice(j,1);}}
function landClearLane(){if(OBJ.length<1000)return;   // (the world isn't built yet)
  if(LAND.clearN!==OBJ.length){landClearArea(-66,2,-34,34);landClearArea(LANE.x-1.6,-4,LANE.x+1.6,2);LAND.clearN=OBJ.length;}
  if(LAND.cleared)return;LAND.cleared=true;
  const sg=obj('signpost',LANE.x+1.5,-3.1,{kind:'prop',label:'HOMESTEAD LANE',face:'P'});try{sg.spr=signSprite(sg.label,'plain');}catch(e){}if(typeof NAV!=='undefined')NAV.sig='';}
// ---- the squares of a piece of land
const landTileId=(k,c)=>1000*(k+1)+c;
function landTiles(){return tiles.filter(t=>t.parcel);}
function landDetach(){const keep=[];for(let i=tiles.length-1;i>=0;i--)if(tiles[i].parcel)keep.unshift(tiles.splice(i,1)[0]);return keep;}
function landAttach(arr){for(const t of arr)tiles.push(t);}
function landRectBlocked(x,z){for(const R of rects)if(x>R.x0-.05&&x<R.x1+.05&&z>R.z0-.05&&z<R.z1+.6)return true;return false;}
function landBuild(P,k){if(LAND.built[P.id])return LAND.built[P.id];
  // trees, scrub and old debris come off the land (stumps and stones you clear yourself)
  landClearArea(P.x0-.4,P.z0-.2,P.x0+P.w+.4,P.z0+P.h+.6);
  const own=P.home!=null?null:landOwnedSet()[P.id];const skip=new Set((own&&own.skip)||[]);
  if(own&&!own.skip){own.skip=[];for(let c=0;c<P.w;c++)for(let r=0;r<P.h;r++)if(landRectBlocked(P.x0+c+.5,P.z0+r+.5))own.skip.push(c*P.h+r);own.skip.forEach(i=>skip.add(i));}
  const B={P,k,grid:new Array(P.w*P.h).fill(null),tiles:[],debris:[]};
  for(let c=0;c<P.w;c++)for(let r=0;r<P.h;r++){if(skip.has(c*P.h+r))continue;
    const t={i:landTileId(k,c),j:r,x:P.x0+c+.5,z:P.z0+r+.5,tilled:false,crop:null,parcel:P.id,pc:c,pr:r};B.grid[c*P.h+r]=t;B.tiles.push(t);
    // overgrown, the same way on every computer: a stone, a weed or a stick on about a third of the squares
    const h=hash(c*31+k*977+7,r*17+k*131+3);if(h<.34&&typeof makeDebris==='function'){const q=hash(c+k*11,r*5+1);const spr=q<.42?'weeds_'+(q<.21?0:1):q<.74?'rock_'+(q<.58?0:1):'twig';
      const o=makeDebris(spr,t.x+(hash(c,r+9)-.5)*.25,t.z+.2+(hash(c+3,r)-.5)*.15,t);o.landDeb=1;B.debris.push(o);}}
  LAND.built[P.id]=B;return B;}
function landTeardown(){for(const B of Object.values(LAND.built))for(const o of B.debris){o.hide=true;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}
  landDetach();LAND.built={};LAND.order=[];}
// bring the land in the world into line with who owns what (a deed bought, a save loaded, a friend's farm joined)
function landSync(){landClearLane();const want=landWanted();const ids=want.map(p=>p.id).join(',');const have=LAND.order.join(',');
  if(ids!==have){const old=landDetach();
    want.forEach((P,k)=>{const kk=P.home!=null?4+P.home:P.kk!=null?P.kk:LAND_PARCELS.findIndex(q=>q.id===P.id);landBuild(P,kk);});
    for(const P of want)landAttach(LAND.built[P.id].tiles);LAND.order=want.map(p=>p.id);
    for(const t of old)if(!want.some(P=>P.id===t.parcel)){}   // land that's no longer yours (a cabin moved out): its squares simply go
    if(typeof NAV!=='undefined')NAV.sig='';}
  landMarkers();}
// a square on the land at a point in the world, if there is one
function landTileAt(x,z){for(const id of LAND.order){const B=LAND.built[id];if(!B)continue;const P=B.P;const c=Math.floor(x-P.x0),r=Math.floor(z-P.z0);if(c<0||r<0||c>=P.w||r>=P.h)continue;return B.grid[c*P.h+r];}return null;}
// the square next door: within its own piece of land (the first field and the greenhouse keep their own grids)
function tileNb(t,di,dj){if(t.parcel){const B=LAND.built[t.parcel];if(!B)return null;const P=B.P,c=t.pc+di,r=t.pr+dj;if(c<0||r<0||c>=P.w||r>=P.h)return null;return B.grid[c*P.h+r];}
  if(t.gh)return null;return tileAt(t.i+di,t.j+dj);}
{const _tt=targetTile;targetTile=function(){const r=_tt.apply(this,arguments);if(r||S.room)return r;
  for(const dd of [.8,.35,1.3]){const x=P.x+P.fx*dd,z=P.z+P.fz*dd+.1;const t=landTileAt(x,z);if(t&&!(t.debris&&!t.debris.hide))return t;}return null;};}
// ---- stakes at the corners and a sign on land that's for sale
function landMarkers(){for(const P of LAND_PARCELS){const sale=!landOwns(P.id);
    if(sale&&!LAND.signs[P.id]){const s=obj('signpost',P.sign[0],P.sign[1],{kind:'prop',label:'FOR SALE',face:'P',landSign:P.id});try{s.spr=signSprite('FOR SALE','plain');}catch(e){}LAND.signs[P.id]=s;
      LAND.stakes[P.id]=[[P.x0,P.z0],[P.x0+P.w,P.z0],[P.x0,P.z0+P.h],[P.x0+P.w,P.z0+P.h]].map(([x,z])=>obj(SPR.land_stake?'land_stake':'rock_0',x,z+.05,{kind:'prop',noCol:true,landStake:P.id}));}
    if(!sale&&LAND.signs[P.id]){LAND.signs[P.id].hide=true;delete LAND.signs[P.id];for(const o of LAND.stakes[P.id]||[])o.hide=true;delete LAND.stakes[P.id];}}}
// the sign says where to go
for(const P of LAND_PARCELS)interact.push({x:P.sign[0],z:P.sign[1]+.3,r:1.1,on:()=>!S.room&&!landOwns(P.id),label:()=>'Read',ok:()=>true,
  act(){toast(`FOR SALE: ${P.name.replace(/^The /,'the ')}, ${P.w*P.h} squares of ground. ${P.price} coins. Deeds at the land office in the Town Hall.`,4.6);}});
// ---- the land office, at the Town Hall door
vendors.land={name:'Land office',sub:'Agnes Abernathy keeps the deeds in a tin box under the counter. She doesn’t ask what you want them for.',rows:()=>{
  const rs=LAND_PARCELS.map(P=>{const mine=landOwns(P.id);return {k:'land_'+P.id,name:P.name,desc:mine?'Yours. The deed is in Grandpa’s desk.':`${P.desc} <b>${P.w*P.h} squares of ground, ${P.price} coins.</b>`,price:P.price,can:!mine&&(typeof HOST==='undefined'||HOST.role!=='guest'),btn:'Buy the deed',
    buy(){landOwnedSet()[P.id]={day:S.day,by:(typeof mlMe==='function'?mlMe():'')};landSync();try{saveGame&&saveGame();}catch(e){}SFX.page&&SFX.page();
      toast(`The deed to ${P.name.toLowerCase()} is yours. Out there, the stakes are coming up and the scrub's been cut. The stones are your problem.`,4.8);}};});
  if(typeof HOST!=='undefined'&&HOST.role==='guest')rs.unshift({k:'land_note',name:'The farm is the host’s',desc:'Only the farm’s owner can buy land for it. Anything they buy is yours to work too.',price:0,can:false,buy(){}});
  return rs;}};
{const HALL=[57.4,-10.8];interact.push({x:HALL[0],z:HALL[1]+.45,r:1.2,on:()=>!S.room,label:()=>'Land office',ok:()=>true,act(){openShop('land');}});}
// nothing built over your fields, the same as the first one
{const _pv=placeValid;placeValid=function(x,z){const r=_pv.apply(this,arguments);if(r)return r;const sp=PLACE.spec;if(!sp||sp.room)return null;const x0=x-sp.w/2,x1=x+sp.w/2,z0=z-sp.d;
  for(const id of LAND.order){const P=LAND.built[id].P;if(x1>P.x0-.2&&x0<P.x0+P.w+.2&&z>P.z0-.2&&z0<P.z0+P.h+.2)return 'Not in the field.';}return null;};}
// ---- saving: the new squares by where they sit in their land, the rest exactly as before
{const _sd=saveData;saveData=function(){const L=landDetach();let d;try{d=_sd.apply(this,arguments);}finally{landAttach(L);}
  try{const out={};for(const id of LAND.order){const B=LAND.built[id];out[id]=B.tiles.filter(t=>t.tilled||t.crop||t.wet||(t.debris&&t.debris.hide)).map(t=>[t.pc,t.pr,t.tilled?1:0,t.crop||null,t.wet?1:0,t.debris&&t.debris.hide?1:0]);}d.land=out;}catch(e){}return d;};}
{const _lg=loadGame;loadGame=function(d){landTeardown();const r=_lg.apply(this,arguments);try{landSync();const L=(d&&d.land)||{};
    for(const [id,arr] of Object.entries(L)){const B=LAND.built[id];if(!B||!Array.isArray(arr))continue;for(const a of arr){const P=B.P;const t=B.grid[(a[0]|0)*P.h+(a[1]|0)];if(!t)continue;
      t.tilled=!!a[2];t.crop=a[3]||null;t.wet=!!a[4];if(a[5]&&t.debris){t.debris.hide=true;const o=t.debris;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}}}}catch(e){console.warn('land load',e);}return r;};}
// the greenhouse's squares go in before the land's, so the order never changes underneath a save or a friend
{const _bg=buildGreenhouse;buildGreenhouse=function(){const L=landDetach();try{return _bg.apply(this,arguments);}finally{landAttach(L);}};}
// a shared farm: the deeds travel with the rest of the farm
if(typeof WORLD_KEYS!=='undefined'&&!WORLD_KEYS.includes('land'))WORLD_KEYS.push('land');
{const _wr=worldRebuild;worldRebuild=function(keys){const r=_wr.apply(this,arguments);try{if(!keys||keys.has('land'))landSync();}catch(e){}return r;};}
// the cabin plots come and go with the cabins (a world opened to friends, a rule changed)
setInterval(()=>{try{if(S.mode==='play'&&!(typeof HOST!=='undefined'&&HOST.applying))landSync();}catch(e){}},1500);
// a new game, or the first time an old save is played with this: the lane is there and the land is staked
{const _bw=typeof buildWorld==='function'?buildWorld:null;if(_bw){buildWorld=function(){const r=_bw.apply(this,arguments);try{landSync();}catch(e){}return r;};}}
setTimeout(()=>{try{landSync();}catch(e){}},0);
// ---- #276: a comment dropped into the middle of a line above once commented out landClearArea's bounds check, so clearing
// the lane cleared the whole world, and every stone, weed and stick in Grandpa's field was gone from the start. A save made
// while that was true has the field down as cleared; the first time such a save loads, the field grows over again (every
// square you haven't tilled or planted gets its stone, weeds or sticks back). New games are marked so it never happens twice.
{const _sd=saveData;saveData=function(){if(S.fieldFix276==null)S.fieldFix276=1;return _sd.apply(this,arguments);};}
{const _lg=loadGame;loadGame=function(d){const had=!!(d&&d.S&&d.S.fieldFix276);const r=_lg.apply(this,arguments);
  try{if(!had){S.fieldFix276=1;let n=0;
    for(const t of tiles){if(t.parcel||t.gh||t.tilled||t.crop)continue;if(t.i>=FSTART.i0&&t.i<FSTART.i0+FSTART.w&&t.j>=FSTART.j0&&t.j<FSTART.j0+FSTART.h)continue;
      const o=t.debris;if(!o||!o.hide||o.stumpOf)continue;o.hide=false;o.goneDay=null;if(o.col&&!circles.includes(o.col))circles.push(o.col);n++;}
    if(n)setTimeout(()=>toast('Grandpa’s field has grown over again: stones, weeds and sticks to clear before you can plant it.',4.4),2600);}}catch(e){console.warn('field regrow',e);}
  return r;};}
// ---- #278: the field's layout goes in the save, square by square (what lies there and exactly where), and comes back exactly.
// It used to be scattered fresh each time the game opened, from the same random stream the rest of the world is built from,
// so any update that added a tree or a fence somewhere shifted the whole field: squares you'd cleared grew over again and the
// "cleared" marks landed on empty ground. Now the stones you broke stay broken, nothing grows on a square you've tilled or
// planted, and a friend who joins gets the host's field stone for stone.
const fdBase=()=>tiles.filter(t=>!t.parcel);
const FD_SPR=/^(weeds_[01]|rock_[01]|twig)$/;
function fdDrop(o){o.hide=true;o.debris=null;o.goneDay=null;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}
function fdLayout(arr){const base=fdBase();let n=0;
  for(let i=0;i<base.length&&i<arr.length;i++){const t=base[i];if(t.gh)continue;const a=arr[i];
    const want=Array.isArray(a)&&FD_SPR.test(a[0])&&isFinite(a[1])&&isFinite(a[2])&&Math.abs(a[1]-t.x)<1&&Math.abs(a[2]-t.z)<1?a:null;
    const o=t.debris;if(o&&o.stumpOf)continue;
    if(want&&o&&o.spr===want[0]&&Math.abs(o.x-want[1])<.006&&Math.abs(o.z-want[2])<.006)continue;if(!want&&!o)continue;
    if(o)fdDrop(o);t.debris=null;if(want)makeDebris(want[0],+want[1],+want[2],t);n++;}
  if(n&&typeof NAV!=='undefined')NAV.sig='';return n;}
function fdTidy(){for(const t of fdBase()){const o=t.debris;if(!o||o.hide||!(t.tilled||t.crop))continue;o.hide=true;o.goneDay=S.day;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}}
{const _sd=saveData;saveData=function(){const d=_sd.apply(this,arguments);
  try{d.fdeb=fdBase().map(t=>{const o=t.debris;return t.gh||!o||o.stumpOf||!FD_SPR.test(o.spr)?0:[o.spr,+o.x.toFixed(3),+o.z.toFixed(3)];});}catch(e){}return d;};}
{const _lg=loadGame;loadGame=function(d){try{if(d&&Array.isArray(d.fdeb))fdLayout(d.fdeb);}catch(e){console.warn('field layout',e);}
  const r=_lg.apply(this,arguments);try{fdTidy();}catch(e){}return r;};}
