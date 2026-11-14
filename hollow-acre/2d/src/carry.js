/* ================= you place things by holding them. Furniture and workbenches are things you carry: they sit in your bag
   like anything else, and the moment one is in your hand (picked on the toolbar) where it can go (furniture in the cabin,
   benches out on the farm), its outline appears in front of you, green where it fits and red where it doesn't. Click or tap a
   spot, or just walk, then Place (Enter, or tap it twice). Put something else in your hand and it goes back in the bag. If you
   have more than one, you keep placing until your hand is empty.
   Workbenches can be moved: open one and press Pick up, and it's back in your hand to set down somewhere else (furniture in the
   cabin already lifts with a double click). A bench you move doesn't need building again. ================= */
S.benchBag=S.benchBag||[];S.benchBuilt=S.benchBuilt||{};
for(const [k] of BENCHES)if(S.benches&&S.benches[k])S.benchBuilt[k]=true;
if(typeof PERSONAL!=='undefined')for(const k of ['benchBag'])if(!PERSONAL.includes(k))PERSONAL.push(k);
const BENCH_NAME=k=>{const d=BENCHES.find(b=>b[0]===k);return d?d[2]:'workbench';};
// ---- a workbench is an item: K:<bench>
{const _ii=itemInfo;itemInfo=function(key){if(key&&key.startsWith('K:')){const k=key.slice(2);const d=BENCHES.find(b=>b[0]===k);if(!d)return null;
    return {key,type:'K',id:k,name:d[2],desc:'A workbench. Hold it out on the farm and it shows where it will go.',icon:d[1],qty:(S.benchBag||[]).filter(q=>q===k).length};}
  return _ii.apply(this,arguments);};}
{const _ak=allItemKeys;allItemKeys=function(){const ks=_ak();for(const k of new Set(S.benchBag||[]))ks.push('K:'+k);return ks;};}
// ---- put something in your hand: onto the toolbar if it isn't there, and selected
function holdItem(key){syncSlots();let i=S.slots.indexOf(key);
  if(i<0||i>=12){let j=S.slots.findIndex((q,n)=>n<12&&!q);if(j<0)j=S.slotSel;const was=S.slots[j];if(i>=0)S.slots[i]=was;S.slots[j]=key;i=j;}
  S.slotSel=i;HELD.skip=null;['bag','shop','craft'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});S.paused=false;renderHotbar();
  const it=itemInfo(key);if(!it)return;
  if(it.type==='F'&&S.room!=='cabin')toast(`The ${it.name.toLowerCase()} is in your hand. Carry it into the cabin to place it.`,2.4);
  else if(it.type==='K'&&S.room)toast(`The ${it.name.toLowerCase()} is in your hand. Take it outside to set it up.`,2.4);}
// ---- buying a bench puts it in your bag now; you set it up by holding it
{const _pr=vendors.plans.rows;vendors.plans.rows=()=>_pr().map(r=>{if(!r.k||!r.k.startsWith('bench_'))return r;const k=r.k.slice(6);
  if((S.benchBag||[]).includes(k))return Object.assign(r,{can:false,desc:'In your bag. Hold it out on the farm to set it up.'});
  if(S.benches[k])return r;
  return Object.assign(r,{buy(){S.benchBag.push(k);syncSlots();renderHotbar();toast(`The ${BENCH_NAME(k).toLowerCase()} is in your bag. Hold it out on the farm and choose where it goes.`,3.2);}});});}
// it stays in your hand (and your bag) while you choose; it only leaves the bag when it's set down
function startBench(k,held){const d=BENCHES.find(b=>b[0]===k);if(!d||!S.benchBag.includes(k))return;const [w,dd]=BENCH_FP[k];
  startPlace({spr:d[1],w,d:dd,name:d[2].toLowerCase(),held,_cg3:S.benchBuilt[k]?1:undefined,
    cancel(){},
    done(x,z){const i=S.benchBag.indexOf(k);if(i>=0)S.benchBag.splice(i,1);S.benches[k]=true;const first=!S.benchBuilt[k];S.benchBuilt[k]=true;placeBench(k,x,z);if(!first)toast(`The ${d[2].toLowerCase()} is set down.`,1.6);else toast(`The ${d[2].toLowerCase()} is set up.`,1.8);}});}
// ---- the hand decides: holding a placeable thing where it can go starts placing it; anything else puts it away
const HELD={skip:null};
{const _pc=placeCancel;placeCancel=function(quiet){const sp=PLACE.on&&PLACE.spec;if(sp&&sp.held&&!quiet)HELD.skip=sp.held;   // Cancel/Esc: don't spring straight back
  if(quiet){const t=toast;toast=function(){};try{_pc();}finally{toast=t;}}else _pc();};}
function heldTick(){if(S.mode!=='play'||S.paused)return;const it=selectedItem();const key=it&&it.key;
  if(HELD.skip&&HELD.skip!==key)HELD.skip=null;
  if(PLACE.on){const sp=PLACE.spec;if(sp&&sp.held&&(key!==sp.held||(sp.room&&S.room!==sp.room)||(!sp.room&&S.room)))placeCancel(true);return;}
  if(!it||it.qty<=0||HELD.skip===key)return;
  if(it.type==='F'&&S.room==='cabin')startFurnHeld(it.id,key);
  else if(it.type==='K'&&!S.room)startBench(it.id,key);}
setInterval(()=>{try{heldTick();}catch(e){}},150);
function startFurnHeld(k,key){if(!S.furnBag.includes(k))return;const [name]=FURN[k];const v=furnView(k,'S');const [w,d]=furnFoot(k,'S');
  startPlace({spr:v.spr,flip:v.flip,w,d,room:'cabin',furn:k,rot:'S',held:key,name:name.toLowerCase(),cancel(){},
    done(x,z){const i=S.furnBag.indexOf(k);if(i>=0)S.furnBag.splice(i,1);const r=this.rot||'S';const p={k,x,z,rot:r,fin:this.fin};S.furnPlaced.push(p);furnHook(p,placeFurnAt(k,x,z,r));}});
  if(FURN_VIEWS[k])$('placeHint').innerHTML+=matchMedia('(pointer:fine)').matches?' <b>R</b> turns it.':' <b>Rotate</b> turns it.';}
// ---- moving a workbench: Pick up, from inside its own panel
const BENCH_MADE={};
{const _pb=placeBench;placeBench=function(k){const o0=OBJ.length,r0=rects.length,i0=interact.length;const out=_pb.apply(this,arguments);
  BENCH_MADE[k]={objs:OBJ.slice(o0),rects:rects.slice(r0),its:interact.slice(i0)};return out;};}
function liftBench(k){const m=BENCH_MADE[k];if(!m)return false;
  for(const o of m.objs){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}
  for(const r of m.rects){const i=rects.indexOf(r);if(i>=0)rects.splice(i,1);}
  for(const it of m.its){const i=interact.indexOf(it);if(i>=0)interact.splice(i,1);}
  delete BENCH_MADE[k];S.benches[k]=false;delete BENCH_POS[k];S.benchBag.push(k);return true;}
{const _oc=openCraft;openCraft=function(v){const r=_oc.apply(this,arguments);try{const acts=$('craft').querySelector('.acts');let b=$('crPick');
    const k=v&&v.startsWith('b_')?v.slice(2):null;const can=k&&S.benches[k]&&BENCH_MADE[k]&&!S.room;
    if(!can){if(b)b.style.display='none';return r;}
    if(!b){b=document.createElement('button');b.className='close';b.id='crPick';b.textContent='Pick up';acts.insertBefore(b,acts.firstChild);
      b.addEventListener('click',()=>{const k2=CR.v&&CR.v.slice(2);if(!k2||!liftBench(k2))return;$('craft').hidden=true;S.paused=false;SFX.thud&&SFX.thud(0,.3);
        holdItem('K:'+k2);toast(`You pick up the ${BENCH_NAME(k2).toLowerCase()}. Set it down where you like, or put it in your bag.`,2.8);});}
    b.style.display='';}catch(e){}return r;};}
