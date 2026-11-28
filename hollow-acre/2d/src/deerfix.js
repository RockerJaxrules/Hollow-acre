/* ================= the dead deer (owner: "The deer corpse is moving for some reason / Or there is multiple I don't think that's
   meant to happen"). Two causes:
   - The story's deer behind the barn ("Something kept time") was laid at the first free spot near its mark, worked out again
     every time the game opened (and its walk-up spot four times a second). Anything standing near the mark (a stone or weeds
     growing back on the track, a keg or a fence set down, the field's debris) moved it somewhere else.
   - The Hollow's own kills used the very same laid-out deer: one turned up in the fields every few days, and another each time
     it took a deer at night, so there were two or three of the story's deer about at once.
   Now each of the story's things is laid once, where it first lies, and that place is kept in the save (an old save keeps
   wherever it lies the first time it's opened now). The laid-out deer is the story's alone: a deer the Hollow takes leaves its
   ribcage at the end of a drag (the Hollow's "ribs" find), and a laid-out deer from the Hollow already lying in a save becomes
   that too. Two of the Hollow's finds on one spot become one. ================= */
{const at=()=>{S.saga=S.saga||{done:{},ch:0};return S.saga.at=S.saga.at||{};};
  for(const b of (typeof SAGA!=='undefined'?SAGA:[])){if(!b.props||typeof b.at!=='function')continue;const _at=b.at;
    b.at=function(){const A=at();let p=A[b.id];if(!Array.isArray(p)||!isFinite(p[0])||!isFinite(p[1])){const q=_at.apply(this,arguments);if(!q||!isFinite(q.x)||!isFinite(q.z))return q;
        p=A[b.id]=[+q.x.toFixed(2),+q.z.toFixed(2)];}
      return {x:p[0],z:p[1]};};}}
// the place a prop already lies (a game that has it on the ground keeps it exactly there)
{const _sp=sgProps;sgProps=function(){try{const A=S.saga&&(S.saga.at=S.saga.at||{});if(A)for(const [id,os] of Object.entries(SGW.objs||{})){const o=os&&os[0];if(!o||A[id])continue;
      const b=SAGA.find(q=>q.id===id);const pr=b&&b.props&&b.props[0];if(pr)A[id]=[+(o.x-pr[1]).toFixed(2),+(o.z-pr[2]).toFixed(2)];}}catch(e){}
  return _sp.apply(this,arguments);};}
// the Hollow's kills: never the story's deer
if(typeof goreKillAdd==='function'){const _ka=goreKillAdd;goreKillAdd=function(x,z,kind,night){if(kind==='deer')kind='ribs';return _ka.call(this,x,z,kind,night);};}
function deerTidy(){if(typeof goreS!=='function')return;const g=goreS();if(!g||!Array.isArray(g.kills))return;const kept=[];
  for(let i=0;i<g.kills.length;i++){const k=g.kills[i];
    if(kept.some(q=>Math.hypot(q.x-k.x,q.z-k.z)<1.5)){goreKillHide(k.id);g.kills.splice(i--,1);continue;}
    if(k.kind==='deer'){goreKillHide(k.id);k.kind='ribs';goreKillShow(k);}
    kept.push(k);}}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{deerTidy();}catch(e){}return r;};}
setTimeout(()=>{try{deerTidy();}catch(e){}},50);
