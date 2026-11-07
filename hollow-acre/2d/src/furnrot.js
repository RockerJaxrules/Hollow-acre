/* ================= turning furniture: while you place a piece, R (or the Rotate button) turns it a quarter turn. Each facing has
   its own art (west is the east art flipped). Placed pieces can be picked up again to move or turn them: click one twice. ================= */
// facing -> [sprite, flipped]. A missing entry means the piece looks the same from every side (the lamp).
const FURN_VIEWS={
  chair:{S:['in_chair'],W:['in_chairE',1],N:['in_chairN'],E:['in_chairE']},
  shelf:{S:['in_shelf_jars'],W:['in_shelfE',1],N:['in_shelfN'],E:['in_shelfE']},
  pumpkin:{S:['jack_b'],W:['jack_b_e',1],N:['pumpkin'],E:['jack_b_e']},
  rug:{S:['in_rug'],W:['in_rug_r'],N:['in_rug'],E:['in_rug_r']},
  crates:{S:['in_crates'],W:['in_crates',1],N:['in_crates'],E:['in_crates',1]}};
const ROT_NEXT={S:'W',W:'N',N:'E',E:'S'};          // a quarter turn clockwise, seen from above
const ROT_NAME={S:'facing the door',W:'facing west',N:'facing the back wall',E:'facing east'};
function furnView(k,rot){const V=FURN_VIEWS[k];const v=V&&V[rot||'S']||[FURN[k][1]];return {spr:SPR[v[0]]?v[0]:FURN[k][1],flip:!!v[1]};}
function furnFoot(k,rot){const [w,d]=FURN_FP[k];return rot==='E'||rot==='W'?[d,w]:[w,d];}
const FURN_OBJ={};   // index in S.furnPlaced -> {o, rect, it}

// ---- placing it, facing whichever way
placeFurnAt=function(k,x,z,rot){rot=rot||'S';const [name,spr0,need,pos,kind]=FURN[k];const v=furnView(k,rot);
  const o=obj(v.spr,x,z,{kind:kind||'furn',room:'cabin',flip:v.flip,glow:k==='pumpkin'?1:0,night:!v.flip&&SPR[v.spr+'_n']?v.spr+'_n':null,furnKey:k});
  let rect=null;if(!kind){const [w,d]=furnFoot(k,rot);addRect(x-w/2,z-d,x+w/2,z-.02);rect=rects[rects.length-1];}
  if(k==='lamp')S.cabinLamp={x,z};if(!S.furn.includes(k))S.furn.push(k);return {o,rect};};
// the placement preview turns too
{const _pd=placeDraw;placeDraw=function(){const sp=PLACE.on&&PLACE.spec;if(!sp||!sp.furn){_pd();return;}
  const keep=drawSpr;drawSpr=function(n,x,y,c,d,f,o){return keep(n,x,y,c,d,f,Object.assign({},o||{},{flip:sp.flip}));};try{_pd();}finally{drawSpr=keep;}};}
function placeRotate(){const sp=PLACE.on&&PLACE.spec;if(!sp||!sp.furn)return;const k=sp.furn;
  if(!FURN_VIEWS[k]){toast('It looks the same from every side.',1.2);return;}
  sp.rot=ROT_NEXT[sp.rot||'S'];const v=furnView(k,sp.rot);sp.spr=v.spr;sp.flip=v.flip;[sp.w,sp.d]=furnFoot(k,sp.rot);
  SFX.page&&SFX.page();toast(`Turned: ${ROT_NAME[sp.rot]}.`,.9);}
startFurn=function(k,opt){opt=opt||{};const [name]=FURN[k];const rot=opt.rot||'S';const v=furnView(k,rot);const [w,d]=furnFoot(k,rot);
  startPlace({spr:v.spr,flip:v.flip,w,d,room:'cabin',furn:k,rot,moving:!!opt.back,name:name.toLowerCase(),
    cancel(){if(opt.back)opt.back();else S.furnBag.push(k);},
    done(x,z){const r=this.rot||'S';const p={k,x,z,rot:r};S.furnPlaced.push(p);furnHook(p,placeFurnAt(k,x,z,r));}});
  S.furnBag=S.furnBag.filter(q=>q!==k);
  if(FURN_VIEWS[k]){const fine=matchMedia('(pointer:fine)').matches;$('placeHint').innerHTML+=fine?' <b>R</b> turns it.':' <b>Rotate</b> turns it.';}
  $('placeRot').style.display=FURN_VIEWS[k]?'':'none';};
// a Rotate button on the placement bar, and R on a keyboard
{const b=document.createElement('button');b.className='close';b.id='placeRot';b.textContent='Rotate';b.style.display='none';$('placeOk').before(b);
  b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();placeRotate();});
  addEventListener('keydown',e=>{if(PLACE.on&&e.code==='KeyR'&&!e.repeat){placeRotate();e.stopImmediatePropagation();e.preventDefault();}},true);
  const _ps=startPlace;startPlace=function(spec){_ps(spec);$('placeRot').style.display=spec&&spec.furn&&FURN_VIEWS[spec.furn]?'':'none';};}

// ---- picking a placed piece up again: click it, then click it again to lift it; Cancel puts it back where it was
function furnHook(p,made){const it={x:p.x,z:p.z-.25,r:.9,on:()=>S.room==='cabin'&&!PLACE.on&&S.furnPlaced.includes(p),label:()=>'Move',ok:()=>true,
  act(){const now=performance.now();if(!it.armed||now-it.armed>2600){it.armed=now;toast(`Click the ${FURN[p.k][0].toLowerCase()} again to pick it up and move it.`,2.2);return;}it.armed=0;liftFurn(p,made,it);}};
  interact.push(it);made.it=it;return it;}
function liftFurn(p,made,it){const k=p.k;made.o.hide=true;if(made.rect){const i=rects.indexOf(made.rect);if(i>=0)rects.splice(i,1);}
  const i=interact.indexOf(it);if(i>=0)interact.splice(i,1);S.furnPlaced=S.furnPlaced.filter(q=>q!==p);if(k==='lamp')S.cabinLamp=false;
  SFX.page&&SFX.page();
  startFurn(k,{rot:p.rot||'S',back(){const q={k,x:p.x,z:p.z,rot:p.rot||'S'};S.furnPlaced.push(q);furnHook(q,placeFurnAt(k,q.x,q.z,q.rot));}});
  PLACE.x=p.x;PLACE.z=p.z;PLACE.manual=true;}
// placing from the bag uses the new start; loading a save puts every piece back facing the way you left it
benchesBoot=function(){for(const [k] of BENCHES)if(S.benches[k]&&BENCH_POS[k])placeBench(k,BENCH_POS[k].x,BENCH_POS[k].z);
  for(const p of S.furnPlaced||[])furnHook(p,placeFurnAt(p.k,p.x,p.z,p.rot));};
// cancelling a move sets the piece back down where it was (not "Put away.")
{const _pc=placeCancel;placeCancel=function(){const sp=PLACE.on&&PLACE.spec;const moving=!!(sp&&sp.moving);_pc();if(moving)toast('Set back where it was.',1.2);};}
// two pieces can't share a spot (a rug can go under anything, and anything can stand on a rug)
{const _pv=placeValid;placeValid=function(x,z){const r=_pv(x,z);if(r)return r;const sp=PLACE.spec;if(!sp||!sp.furn||sp.furn==='rug')return null;
  const x0=x-sp.w/2,x1=x+sp.w/2,z0=z-sp.d,z1=z;
  for(const p of S.furnPlaced){if(p.k==='rug')continue;const [w,d]=furnFoot(p.k,p.rot);if(p.x+w/2>x0+.05&&p.x-w/2<x1-.05&&p.z>z0+.05&&p.z-d<z1-.05)return 'Something is in the way.';}
  return null;};}
