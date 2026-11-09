/* ================= porches you actually walk up. Every door sits up on its building's foundation (the sill is 7 px above the
   ground), so in front of each one there are real steps (stone or wood to match the house, a plank ramp for barn and garage
   doors). They are drawn as their own piece just in front of the building, and anyone who walks onto them, you or the townsfolk,
   rises step by step until they stand at the sill. Footsteps on them sound of wood or stone. ================= */
const PORCH={zones:[],frame:-1};
const STEP_W=[18,22,26,30,32],RAMP_W=[34,44,60];
const nearestW=(L,w)=>L.reduce((a,b)=>Math.abs(b-w)<Math.abs(a-w)?b:a);
function porchZones(){const f=typeof frameCount!=='undefined'?frameCount:Math.floor(performance.now()/16);if(PORCH.frame===f)return PORCH.zones;PORCH.frame=f;
  const Z=[];for(const o of OBJ){if(o.kind!=='bld'||o.hide||o.room||o.x>=250)continue;const m=SPR[o.spr];if(!m||!m.door_w)continue;
    if(typeof onScreen==='function'&&!onScreen(o.x,o.z,140))continue;
    const ramp=m.steps==='ramp',w=ramp?nearestW(RAMP_W,m.door_w):nearestW(STEP_W,m.door_w);const spr=ramp?'ramp_'+w:'steps_'+(m.steps==='stone'?'stone':'wood')+'_'+w;
    if(!SPR[spr])continue;const dx=(m.door_dx||0)/PPM*(o.flip?-1:1);
    Z.push({o,spr,x:o.x+dx,z0:o.z,z1:o.z+.62,hw:(SPR[spr].fw-6)/2/PPM,ramp,mat:m.steps});}
  PORCH.zones=Z;return Z;}
function porchAt(x,z){for(const q of porchZones())if(Math.abs(x-q.x)<q.hw&&z>q.z0&&z<q.z1)return q;return null;}
// how far up someone standing here is lifted, in screen pixels
function porchLift(x,z){const q=porchAt(x,z);if(!q)return 0;const t=clamp((q.z1-z)/(q.z1-q.z0-.15),0,1);if(q.ramp)return Math.round(t*7);return t>.8?7:t>.5?5:t>.2?2:0;}
// the steps themselves: just in front of the building, behind anyone on them
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;for(const q of porchZones())D.push({z:q.z0+.05,mind:1,draw(){drawSpr(q.spr,sx(q.x),sz(q.z1));}});};}
// footsteps on them
if(typeof surfAt==='function'){const _sa=surfAt;surfAt=function(x,z){const q=porchAt(x,z);if(q)return q.mat==='stone'?'stone':'wood';return _sa.apply(this,arguments);};}
