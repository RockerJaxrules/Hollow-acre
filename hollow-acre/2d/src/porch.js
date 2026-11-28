/* ================= porches you actually walk up. Every door sits up on its building's foundation (the sill is 7 px above the
   ground), so in front of each one there are real steps (stone or wood to match the house, a plank ramp for barn and garage
   doors). They are drawn as their own piece just in front of the building, and anyone who walks onto them, you or the townsfolk,
   rises step by step until they stand at the sill. Footsteps on them sound of wood or stone. ================= */
const PORCH={zones:[],frame:-1};
const STEP_W=[18,22,26,30,32],RAMP_W=[34,44,60];
const nearestW=(L,w)=>L.reduce((a,b)=>Math.abs(b-w)<Math.abs(a-w)?b:a);
function porchZones(){const f=FRAME_NO;if(PORCH.frame===f)return PORCH.zones;PORCH.frame=f;
  // the buildings themselves, kept between frames (rebuilt when the world changes, and every couple of seconds)
  if(!PORCH.blds||PORCH.n!==OBJ.length||PORCH.last!==OBJ[OBJ.length-1]||f-PORCH.bf>120||f<PORCH.bf){PORCH.bf=f;PORCH.n=OBJ.length;PORCH.last=OBJ[OBJ.length-1];PORCH.blds=OBJ.filter(o=>o.kind==='bld');}
  const Z=[];for(const o of PORCH.blds){if(o.kind!=='bld'||o.hide||o.room||o.x>=250||o.noSteps)continue;const m=SPR[o.spr];if(!m||!m.door_w)continue;
    if(typeof onScreen==='function'&&!onScreen(o.x,o.z,140))continue;
    const ramp=m.steps==='ramp',w=ramp?nearestW(RAMP_W,m.door_w):nearestW(STEP_W,m.door_w);const spr=ramp?'ramp_'+w:'steps_'+(m.steps==='stone'?'stone':'wood')+'_'+w;
    if(!SPR[spr])continue;const dx=(m.door_dx||0)/PPM*(o.flip?-1:1);
    Z.push({o,spr,x:o.x+dx,z0:o.z,z1:o.z+.62,hw:(SPR[spr].fw-6)/2/PPM,ramp,mat:m.steps});}
  PORCH.zones=Z;return Z;}
function porchAt(x,z){for(const q of porchZones())if(Math.abs(x-q.x)<q.hw&&z>q.z0&&z<q.z1)return q;return null;}
// how far up someone standing here is lifted, in screen pixels
function deckLift(x,z){for(const d of PORCH_DECKS){if(d.st&&Math.abs(x-d.st.x)<d.st.w&&z<d.st.z1&&z>d.z0)return z<d.st.zm?d.st.h2:d.st.h1;if(x>d.x0&&x<d.x1&&z>d.z0&&z<d.z1)return d.h;if(Math.abs(x-d.sx)<d.shw&&z>=d.sz0&&z<d.sz1){const t=clamp((d.sz1-z)/(d.sz1-d.sz0),0,1);return t>.8?7:t>.5?5:t>.2?2:0;}}return -1;}   // on a deck: up at its floor; on its steps: a step at a time
function porchLift(x,z){const dl=deckLift(x,z);if(dl>=0)return dl;const q=porchAt(x,z);if(!q)return 0;const t=clamp((q.z1-z)/(q.z1-q.z0-.15),0,1);if(q.ramp)return Math.round(t*7);return t>.8?7:t>.5?5:t>.2?2:0;}
// the steps themselves: just in front of the building, behind anyone on them
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room)return;for(const q of porchZones())D.push({z:q.z0+.05,mind:1,draw(){drawSpr(q.spr,sx(q.x),sz(q.z1));}});};}
// footsteps on them
if(typeof surfAt==='function'){const _sa=surfAt;surfAt=function(x,z){if(deckLift(x,z)>=0)return 'wood';const q=porchAt(x,z);if(q)return q.mat==='stone'?'stone':'wood';return _sa.apply(this,arguments);};}
