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
  interact.push({x:b.x,z:b.z+.2,r:1.2,on:()=>!S.room,label:()=>{const n=shipMineN();return n?`Bin (${n})`:'Shipping bin';},ok:()=>true,
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
// ---- #282: every player's shipping is their own. Whatever you put in a bin is yours: you see only your own things in it, you can
// only take your own back out, and the count on the bin is yours. With separate wallets the money for it is paid to you alone.
// (Everything in the bin already carries the name of who put it there.)
const shipMine=e=>{if(!e)return false;const me=NAME()||'Farmhand';if(e.by)return e.by===me;return !(typeof HOST!=='undefined'&&HOST.role==='guest');};
const shipMineN=()=>(S.ship||[]).filter(shipMine).length;
{const _rb=renderBin;renderBin=function(){const all=S.ship;S.ship=(all||[]).filter(shipMine);try{return _rb.apply(this,arguments);}finally{S.ship=all;}};}
{const _st=shipTake;shipTake=function(){const all=S.ship||[];const rest=all.filter(e=>!shipMine(e));S.ship=all.filter(shipMine);
  try{return _st.apply(this,arguments);}finally{S.ship=rest.concat(S.ship);}};}
{const bin=interact.find(e=>typeof binPos!=='undefined'&&e.x===binPos.x&&e.z===binPos.z);if(bin)bin.label=()=>{const n=shipMineN();return n?`Bin (${n})`:'Shipping bin';};}
// each bin shows what its owner has waiting in it: Grandpa's bin the main player's things, a cabin's bin its owner's
{const _ld=lifeDrawables;lifeDrawables=function(D,t){const all=S.ship;const host=NAME&&typeof HOST!=='undefined'&&HOST.role==='guest'?(HOST.hostName||''):(NAME()||'Farmhand');
  S.ship=(all||[]).filter(e=>!e.by||e.by===host);let r;try{r=_ld.apply(this,arguments);}finally{S.ship=all;}
  if(!S.room)for(const [i,B] of Object.entries(FHB.bins)){const who=typeof fhOwner==='function'?fhOwner(+i):null;if(!who)continue;const kinds=[...new Set((all||[]).filter(e=>e.by===who).map(e=>shipIcon(e.t,e.id)))].slice(0,3);if(!kinds.length)continue;
    D.push({z:B.z+.02,mind:1,draw(){const X=Math.round(sx(B.x)),Y=Math.round(sz(B.z));kinds.forEach((k,j)=>{const im=sbImg(k);if(im.complete&&im.naturalWidth)ctx2.drawImage(im,X-14+j*9,Y-31-(j===1?2:0),16,16);});}});}
  return r;};}
// The bins' contents used to travel between players as one whole list, the last one sent replacing the rest: two people shipping
// at the same moment each kept a different list, and things were lost. Now each player only ever sends their own things, and
// everyone puts together what they hear from each player with what they put in themselves.
{const _wo=worldOut;worldOut=function(k){if(k!=='ship')return _wo.apply(this,arguments);
  return {from:NAME()||'Farmhand',host:!(typeof HOST!=='undefined'&&HOST.role==='guest'),list:(S.ship||[]).filter(shipMine)};};}
{const _wa=worldApply;worldApply=function(d){try{const v=d&&d.ship;if(v&&typeof v==='object'&&!Array.isArray(v)&&Array.isArray(v.list)){
      const from=clean(v.from),theirs=e=>v.host?(!e.by||e.by===from):e.by===from;
      const mine=(S.ship||[]).filter(e=>!theirs(e)),got=v.list.slice(0,400).filter(e=>e&&typeof e==='object'&&typeof e.id==='string').map(e=>Object.assign({},e,{by:e.by||from,value:Math.max(0,Math.min(100000,e.value|0))}));
      S.ship=mine.concat(got);d=Object.assign({},d);delete d.ship;}}catch(e){}   // (what you've put in yourself and not yet sent stays unsent until the next sync sends it)
  return _wa.call(this,d);};}
// ---- #285: on a shared farm the story's progress is everyone's, as it happens. Mending the car one stage at a time, the parts
// fitted, the quests and their steps, the diary pages, the bell and the binding, the stones' flames: each change goes to every
// player straight away (it used to reach the others only with the next morning), so the mended car stands mended, and moves
// where it stands, on every screen. Progress only ever adds up: the higher stage, the flag that's set, the page that's found.
const SS_KEYS=['carStage','carFixed','parts','looped','q','pages','bound','bellRung'];const SS={last:'',t:0};
function ssOut(){const o={};for(const k of SS_KEYS)o[k]=S[k]===undefined?null:S[k];try{o._alt=altars.map(a=>a.lit?1:0);}catch(e){}return o;}
function ssMerge(d){if(!d||typeof d!=='object')return false;let ch=false;
  for(const k of SS_KEYS){if(!(k in d))continue;const v=d[k],cur=S[k];
    if(typeof v==='number'&&isFinite(v)){if(typeof cur!=='number'||v>cur){S[k]=v;ch=true;}}
    else if(typeof v==='boolean'){if(v&&!cur){S[k]=true;ch=true;}}
    else if(Array.isArray(v)){const have=Array.isArray(cur)?cur:[];const seen=new Set(have.map(x=>JSON.stringify(x)));const add=v.slice(0,200).filter(x=>!seen.has(JSON.stringify(x)));if(add.length){S[k]=have.concat(add);ch=true;}}
    else if(v&&typeof v==='object'){const o=cur&&typeof cur==='object'?cur:(S[k]={});for(const [kk,vv] of Object.entries(v)){const c=o[kk];
      if(typeof vv==='number'&&typeof c==='number'){if(vv>c){o[kk]=vv;ch=true;}}else if(vv&&!c){o[kk]=vv;ch=true;}}}}
  if(Array.isArray(d._alt))d._alt.forEach((l,i)=>{try{if(l&&altars[i]&&!altars[i].lit){altars[i].lit=true;ch=true;}}catch(e){}});
  if(ch){try{carShow&&carShow();}catch(e){}try{updateHud&&updateHud();}catch(e){}}
  return ch;}
setInterval(()=>{try{if(typeof HOST==='undefined'||!HOST.role||!CO.room||!CO.room.emit)return;if(HOST.role==='guest'&&!HOST.joined)return;if(HOST.applying||S.mode==='title'||S.mode==='load')return;
  const sig=JSON.stringify(ssOut());if(sig===SS.last)return;SS.last=sig;CO.room.emit('story8',JSON.parse(sig));}catch(e){}},600);
{const _hw=hostWire;hostWire=function(){_hw();const r=CO.room;if(!r||!r.on)return;HOST.off.push(r.on('story8',m=>{if(!m||m.isMe||!HOST.role)return;try{ssMerge(m.data);}catch(e){}}));};}
