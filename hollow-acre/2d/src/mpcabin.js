/* ================= #277 a friend's cabin is a home of its own. Each cabin on Homestead Lane gets its own shipping bin by the
   door (it is the same shipping box as Grandpa's bin: what a farmhand drops in is sold overnight and, with separate wallets,
   paid to them), and a farmhand who has a cabin is shown round their own place first, instead of being sent to Grandpa's:
   their cabin, their garden plot (till it, plant it, water it), their bin, and their own bed. The guide arrow follows each
   step. Grandpa's cabin is still the main player's, with the field, the note on the door and the first bin. ================= */
const FHB={bins:{}};
if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('fhT'))PERSONAL.push('fhT');
// beside the door, on the side away from the path down to the lane
const fhBinAt=i=>{const s=FH_SPOTS[i],side=(LANE_SPOTS[i]&&LANE_SPOTS[i].side)||-1;return {x:s.x-side*1.9,z:s.z+.55};};
function fhBin(i){if(FHB.bins[i]||!FH_SPOTS[i]||!MPC.objs[i])return;const b=fhBinAt(i);
  for(const o of OBJ){if(o.hide||!(o.debris||o.kind==='grass'||o.kind==='deco'))continue;if(Math.abs(o.x-b.x)<1&&Math.abs(o.z-b.z)<.9){o.hide=true;if(o.col){const q=circles.indexOf(o.col);if(q>=0)circles.splice(q,1);}}}
  const o=obj('crate',b.x,b.z,{kind:'bin',fhbin:i});addRect(b.x-.5,b.z-.6,b.x+.5,b.z);
  interact.push({x:b.x,z:b.z+.2,r:1.2,on:()=>!S.room,label:()=>S.ship&&S.ship.length?`Bin (${S.ship.length})`:'Shipping bin',ok:()=>true,
    act(){FHB.used=i;if(typeof openShipBin==='function')openShipBin();}});
  FHB.bins[i]={o,x:b.x,z:b.z};if(typeof NAV!=='undefined')NAV.sig='';}
{const _fp=fhPlace;fhPlace=async function(i){const r=await _fp.apply(this,arguments);try{fhBin(i);}catch(e){console.warn('cabin bin',e);}return r;};}
// in case a cabin went up before this file ran
setTimeout(()=>{try{for(const k of Object.keys(MPC.objs||{}))fhBin(+k);}catch(e){}},0);
// ---- the farmhand's own tour
const fhMine=()=>{if(typeof HOST==='undefined'||HOST.role!=='guest'||!mpOwn())return -1;const me=NAME();if(!me)return -1;for(let i=0;i<FH_SPOTS.length;i++)if(fhOwner(i)===me&&MPC.objs[i])return i;return -1;};
const fhPlotTiles=i=>tiles.filter(t=>t.parcel==='home'+i);
const fhT=()=>(S.fhT=S.fhT||{});
const FH_STEPS=[
  {k:'home',title:'Your cabin',text:'This cabin is yours: on Homestead Lane, across the creek from Grandpa’s. Walk home and step inside.',at:i=>({x:FH_SPOTS[i].x,z:FH_SPOTS[i].z+.5}),
    done:i=>!!fhT().home},
  {k:'till',title:'Your plot',text:'The garden plot beside your cabin is yours to farm. Pick the hoe and till a square of it.',at:i=>{const p=homePlot(i);return {x:p.x0+p.w/2,z:p.z0+p.h/2};},
    done:i=>fhPlotTiles(i).some(t=>t.tilled||t.crop)},
  {k:'plant',title:'Plant',text:'Pick your seeds on the toolbar and plant the ground you tilled.',at:i=>{const p=homePlot(i);return {x:p.x0+p.w/2,z:p.z0+p.h/2};},
    done:i=>fhPlotTiles(i).some(t=>t.crop)},
  {k:'water',title:'Water',text:'Water what you planted with the watering can. Crops want it every day.',at:i=>{const p=homePlot(i);return {x:p.x0+p.w/2,z:p.z0+p.h/2};},
    done:i=>fhPlotTiles(i).some(t=>t.crop&&(t.crop.watered||t.wet))},
  {k:'bin',title:'Your bin',text:'Your own shipping bin stands by your door. Whatever you drop in it is sold overnight, and the money is yours.',at:i=>{const b=fhBinAt(i);return {x:b.x,z:b.z};},
    done:i=>!!fhT().bin},
  {k:'bed',title:'Your bed',text:'When it gets late, go home and sleep in your own bed. The night passes once everyone on the farm is asleep.',at:i=>({x:FH_SPOTS[i].x,z:FH_SPOTS[i].z+.5}),
    done:i=>!!fhT().bed}];
function fhStep(){const i=fhMine();if(i<0||fhT().all)return null;for(const s of FH_STEPS)if(!s.done(i))return {s,i};
  fhT().all=S.day;setTimeout(()=>toast('That’s your place. The rest of the valley you share with everyone.',3.4),400);return null;}
{const _e=enterRoom;enterRoom=function(k){const i=fhMine();if(i>=0&&k==='fcab'+i)fhT().home=S.day;return _e.apply(this,arguments);};}
{const _o=openShipBin;openShipBin=function(){const i=fhMine();if(i>=0&&FHB.used===i)fhT().bin=S.day;FHB.used=null;return _o.apply(this,arguments);};}
{const _s=sleep;sleep=function(){const i=fhMine();if(i>=0&&S.room==='fcab'+i)fhT().bed=S.day;return _s.apply(this,arguments);};}
{const _ob=objective;objective=function(){const r=_ob.apply(this,arguments);try{if(S.mode!=='play')return r;const f=fhStep();if(!f)return r;
    const t=f.s.at(f.i);return [f.s.title,f.s.text+(typeof wayChip==='function'?wayChip(t):''),t];}catch(e){return r;}};}
