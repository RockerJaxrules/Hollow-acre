/* ================= turning (owner): every piece you set down turns a quarter at a time (R, or the Rotate button) unless it
   hangs on a wall or looks the same from every side. A piece turns when its art has side and back views (<spr>_e, _bk, _w; _n is night art, so the back view is _bk;
   the 3D blockouts give all four from one model; without _w the east view is mirrored). The benches and the furnace turn
   too, and every piece keeps its facing in the save. ================= */
function sprViews(spr){if(!spr||!SPR[spr+'_e'])return null;return {S:[spr],E:[spr+'_e'],N:[SPR[spr+'_bk']?spr+'_bk':spr],W:SPR[spr+'_w']?[spr+'_w']:[spr+'_e',1]};}
const TURN_FP=(w,d,rot)=>rot==='E'||rot==='W'?[d+.15,Math.max(.5,w-.2)]:[w,d];
// cabin furniture: any piece whose art has its views turns, even without a hand-made entry
for(const k in FURN){const v=sprViews(FURN[k][1]);if(v&&!FURN_VIEWS[k])FURN_VIEWS[k]=v;}
// the benches and the furnace
{const _pb=placeBench;placeBench=function(k,x,z,rot){const d=BENCHES.find(b=>b[0]===k);if(!d)return _pb.apply(this,arguments);
  rot=rot||(BENCH_POS[k]&&BENCH_POS[k].rot)||'S';const v=sprViews(d[1]);const s0=d[1],f0=BENCH_FP[k];
  if(v&&rot!=='S'&&v[rot]&&!v[rot][1]){d[1]=v[rot][0];BENCH_FP[k]=TURN_FP(f0[0],f0[1],rot);}
  try{return _pb.call(this,k,x,z);}finally{d[1]=s0;BENCH_FP[k]=f0;if(BENCH_POS[k])BENCH_POS[k].rot=rot;}};}
{const _sb=startBench;startBench=function(k,held){_sb.apply(this,arguments);const sp=PLACE.on&&PLACE.spec;const d=BENCHES.find(b=>b[0]===k);if(!sp||!d)return;
  const v=sprViews(d[1]);if(!v)return;sp.views=v;sp.rot='S';sp.fp=BENCH_FP[k];const d0=sp.done;
  sp.done=function(x,z){BENCH_POS[k]=Object.assign(BENCH_POS[k]||{},{rot:this.rot||'S'});return d0.call(this,x,z);};
  $('placeRot').style.display='';$('placeHint').innerHTML+=matchMedia('(pointer:fine)').matches?' <b>R</b> turns it.':' <b>Rotate</b> turns it.';};}
{const _pr=placeRotate;placeRotate=function(){const sp=PLACE.on&&PLACE.spec;if(!sp||!sp.views)return _pr();
  sp.rot=ROT_NEXT[sp.rot||'S'];const v=sp.views[sp.rot];sp.spr=v[0];sp.flip=!!v[1];const fp=sp.fp||[sp.w,sp.d];[sp.w,sp.d]=TURN_FP(fp[0],fp[1],sp.rot);
  SFX.page&&SFX.page();toast(`Turned: ${ROT_NAME[sp.rot]}.`,.9);};}
{const _ps=startPlace;startPlace=function(spec){_ps(spec);if(spec&&spec.views)$('placeRot').style.display='';};}
