/* ================= the dead never appear in front of you (owner: "corpses just loading in from nowhere in front of you doesn't
   look good"). Every place the game lays out remains was gone through: the Hollow's finds (gore.js: the morning's kills, the
   people, and the animal it takes at night), and the story's things (saga.js: the deer, the barn's blood, the graves, the
   cold house's hooks, Ida's jars, the coffins). The morning's are laid while you sleep, and a game opens with them in place;
   the others could land in plain view: the Hollow killed a rabbit or a deer right where you were looking, and a story step's
   remains appeared the moment the step before it was done. Now:
   - A find is only laid where you can't see it at that moment: off the screen, indoors, behind the fade of sleep or a door,
     or (after dark) out past your lantern, where your light finds it when it comes round. Until then it waits, kept in the
     save, and goes down the moment the spot is out of sight.
   - The Hollow only takes an animal you can't see (gore.js), so nothing vanishes from in front of you either.
   - A story step's remains that would land in view wait the same way; if you walk straight up to the spot, they're laid
     while its close-up covers the screen. ================= */
const NP={sg:new Set()};
function npSeen(x,z){try{if(S.mode!=='play'||S.room)return false;const f=$('fade');if(f&&+getComputedStyle(f).opacity>.55)return false;
  if(!onScreen(x,z,110))return false;
  if(typeof isNight==='function'&&isNight()&&Math.hypot(x-P.x,z-P.z)>12)return false;   // in the dark past the lantern
  return true;}catch(e){return false;}}
// ---- the Hollow's finds
if(typeof goreKillAdd==='function'){const _ka=goreKillAdd;NP.add=_ka;
  goreKillAdd=function(x,z,kind,night){if(!npSeen(x,z))return _ka.apply(this,arguments);const g=goreS();g.pend=g.pend||[];g.pend.push({x,z,kind,night:!!night,day:S.day});
    return {id:null,x,z,kind,day:S.day,night:!!night,pend:true};};}
function npKills(all){const g=typeof goreS==='function'&&goreS();if(!g||!g.pend||!g.pend.length||!NP.add)return;
  for(let i=0;i<g.pend.length;i++){const p=g.pend[i];if(S.day-p.day>1){g.pend.splice(i--,1);continue;}   // (a find nobody saw for two days is gone)
    if(!all&&npSeen(p.x,p.z))continue;g.pend.splice(i--,1);const k=NP.add(p.x,p.z,p.kind,p.night&&p.day===S.day);if(k&&p.day!==S.day)k.day=p.day;}
  if(!g.pend.length)delete g.pend;}
// ---- the story's remains
if(typeof sgProps==='function'){const _sp=sgProps;sgProps=function(){const had=new Set(Object.keys(SGW.objs||{}));const r=_sp.apply(this,arguments);
  try{for(const [id,os] of Object.entries(SGW.objs||{})){if(had.has(id)||!os||!os[0]||os[0].hide)continue;if(npSeen(os[0].x,os[0].z))NP.sg.add(id);}
    for(const id of NP.sg)for(const o of SGW.objs[id]||[])o.hide=true;}catch(e){}return r;};}
function npProps(all){let ch=false;for(const id of [...NP.sg]){const os=SGW.objs[id];if(!os||!os[0]){NP.sg.delete(id);continue;}if(all||!npSeen(os[0].x,os[0].z)){NP.sg.delete(id);ch=true;}}if(ch)try{sgProps();}catch(e){}}
// walking straight up to it: laid under its close-up
if(typeof sgPlay==='function'){const _pl=sgPlay;sgPlay=function(b){try{if(b&&NP.sg.has(b.id)){NP.sg.delete(b.id);sgProps();}}catch(e){}return _pl.apply(this,arguments);};}
setInterval(()=>{try{npKills(false);npProps(false);}catch(e){}},300);
// a game opening, or a new morning: everything waiting goes down at once (the screen is dark or the game isn't showing yet)
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{npKills(true);npProps(true);}catch(e){}return r;};}
