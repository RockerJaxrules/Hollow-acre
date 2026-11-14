/* ================= finding your way. Whenever the objective (or Mae's lesson) is about a place, the bar says which way it is and how far,
   counting from the door when you're indoors; the map names the places the story sends you to; and every "where is it" line in the game
   now names real landmarks. ================= */
const COMPASS=[['north','↑'],['north-east','↗'],['east','→'],['south-east','↘'],['south','↓'],['south-west','↙'],['west','←'],['north-west','↖']];
// a point indoors is reached through its building's door
function outsidePoint(t){if(!t)return null;let x=t.x,z=t.z,room=null;if(x>=250)for(const k in ROOMS){const R=ROOMS[k];if(R.ox!==undefined&&R.out&&x>=R.ox-1&&x<=R.ox+R.w+1&&z>=R.oz-1&&z<=R.oz+R.d+1){room=k;x=R.out.x;z=R.out.z;break;}}return {x,z,room};}
function wayChip(t){if(!t||S.mode!=='play')return '';const o=outsidePoint(t);if(!o)return '';if(o.room&&S.room===o.room)return '';
  let px=P.x,pz=P.z,inside=false;if(S.room){const R=ROOMS[S.room];if(R&&R.out){px=R.out.x;pz=R.out.z;inside=true;}}
  const dx=o.x-px,dz=o.z-pz,d=Math.hypot(dx,dz);if(d<3&&!inside)return '';const a=Math.atan2(dx,-dz),i=((Math.round(a/(Math.PI/4))%8)+8)%8;
  return ` <span class="odir">${COMPASS[i][1]} ${Math.round(d)} m ${COMPASS[i][0]}${inside?' · go outside first':''}</span>`;}
{const css=document.createElement('style');css.textContent='.odir{color:#ffd27a;white-space:nowrap;margin-left:4px}#note .odir{color:#8a4a10;font-weight:600}';document.head.appendChild(css);}
{const _o=objective;objective=function(){const r=_o();if(!r||!r[2])return r;return [r[0],r[1]+wayChip(r[2]),r[2]];};}
// the map names more of the places you're sent to
for(const p of [['Crossroads',crossPos.x,crossPos.z+5],['Coyle’s store',TB.store[1],-12.2],['Old mine',MINE.x,MINE.z-6],['Your car',carPos.x,carPos.z+3],['Footbridge',FOOT.x,FOOT.z-2],['Hartley Carpentry',SHOPS_AT.carp.x,SHOPS_AT.carp.front+2.2],['Forge',SHOPS_AT.forge.x,SHOPS_AT.forge.front+2.2],['Bait & Tackle',SHOPS_AT.bait.x,SHOPS_AT.bait.front+3.6],['Feed & Stock',SHOPS_AT.feed.x,SHOPS_AT.feed.front+2.4],['Town hall',TB.hall[1],-13],['Post office',TB.post[1],-13],['Schoolhouse',TB.school[1],TB.school[2]-4],['The green',squarePos.x,squarePos.z+5]])
  if(!MAP_PLACES.some(q=>q[0]===p[0]))MAP_PLACES.push(p);
// the mine is set into the cliff after the world is built, so its name follows it there (it was left sitting on the farm road)
{const _ob=openBag;openBag=function(t){const e=MAP_PLACES.find(q=>q[0]==='Old mine');if(e&&MINE&&MINE.z<-12){e[1]=MINE.x;e[2]=MINE.z-6;}return _ob.apply(this,arguments);};}
// a signpost where the dirt road leaves Route 9 for the crossroads
put('signpost',21.4,-2.4,.2,{label:'CROSSROADS',face:'P'});

// tap the objective for the whole route, and a button to the map
const ROUTES={
  'Stranded':'From the wreck, walk east along Route 9. Past the garage and over the covered bridge, a sign reading HOLLOW ACRE marks Grandpa’s lane, on your left.',
  'The farm':'Grandpa’s cabin is at the top of the lane off Route 9. The note is nailed to the front door.',
  'Farm':'The brown field is just south of the cabin, across the lane. Pick the hoe on your toolbar first.',
  'Plant':'The field is just south of the cabin. Seeds go on the dug squares.',
  'Water':'The stone well stands just east of the cabin. Tap it to fill the can, then tap each seedling with the can.',
  'Sell':'The wooden shipping bin stands just left of the cabin door. Tap it with crops in your bag.',
  'The car':'Hollis’s garage: walk west on Route 9 past the HOLLOW ACRE sign, cross the covered bridge, and it’s on the right with a gas pump outside. Caitlyn’s store (Coyle’s General Store) is the other way, east on Route 9, the first shop past the MARROW HOLLOW sign. Agnes lives in the last house west, just before your wrecked car.',
  'Leave':'Your car is where you crashed: far west on Route 9, past Agnes’s house.',
  'Candles':'The crossroads: walk east on Route 9 past the barn. Just past it a sign reads CROSSROADS; turn south there and follow the dirt road along the cornfield to its end, where it meets the lane and the Mill Road. The peddler comes after 7:30 pm. You can also make tallow candles at Grandpa’s workbench (3 fiber and 1 coal each).',
  'Wait':'Three stones: one in the west woods, one in the cornfield south of your farm, one in the churchyard behind the church in town. Light all three after the bell, the same night.',
  'The rite':'Three stones: the west woods, the cornfield south of your farm, and the churchyard behind the church in town.'};
{const css=document.createElement('style');css.textContent='#objective{pointer-events:auto!important;cursor:pointer}';document.head.appendChild(css);
  $('objective').addEventListener('click',e=>{e.stopPropagation();if(S.mode!=='play'||S.paused)return;const ob=objective();if(!ob)return;const route=ROUTES[ob[0]];const chip=ob[2]?wayChip(ob[2]):'';
    openNote(`<h3>${ob[0]}</h3><p>${String(ob[1]).replace(/<span class="odir">.*?<\/span>/,'')}</p>${route?`<p><b>How to get there.</b> ${route}</p>`:''}${chip?`<p>${chip}</p>`:''}<p style="font-size:12px;opacity:.75">The map (Menu, then Map) shows a star where you’re headed.</p>`,'Got it');
    const nb=document.createElement('button');nb.className='close';nb.textContent='Map';nb.style.marginLeft='8px';nb.onclick=()=>{$('noteClose').click();openBag('map');};$('noteText').appendChild(nb);});}
