/* ================= speed: the world holds ~17,000 objects and ~7,000 things you can use. Drawing and the action button used to
   walk every one of them every frame. They now sit in a coarse grid of 8x8 squares, and each frame only the squares around the
   camera (for drawing) or around you (for the action button) are looked at. The exact same per-object tests still run on what the
   grid hands back, so nothing on screen changes; only the work does.
   Staying right: the grid rebuilds whenever its list changes length or gets a new last entry (things placed, picked up or
   removed), a couple of hundred entries are re-checked every frame for having moved (a full pass every second or so), and it
   rebuilds from scratch every 15 seconds as insurance. ?nogrid in the address (or PG.off=true) turns it all off. ================= */
const PG={off:/[?&]nogrid\b/.test(location.search),cell:8,objs:null,ics:null,stats:{rb:0}};
const pgKey=(x,z)=>{const kx=Math.floor(x/8),kz=Math.floor(z/8);return (kx+20000)*40000+(kz+20000);};
function pgMake(arr,tag,isDyn,per){return {arr,tag,isDyn,per,cells:new Map(),n:-1,last:null,built:0,sw:0,dyn:[],big:[],maxR:0,out:[]};}
function pgRebuild(G){const A=G.arr,T=G.tag,C=G.cells;C.clear();G.dyn=[];G.big=[];G.maxR=0;
  for(let i=0;i<A.length;i++){const e=A[i];if(!e)continue;e[T+'i']=i;
    if(G.isDyn&&G.isDyn(e)){e[T+'k']=-1;G.dyn.push(e);continue;}
    if(T==='_q'){const r=+e.r||0;if(r>3){e[T+'k']=-2;G.big.push(e);continue;}if(r>G.maxR)G.maxR=r;}
    const k=pgKey(e.x,e.z);e[T+'k']=k;let c=C.get(k);if(!c)C.set(k,c=[]);c.push(e);}
  G.n=A.length;G.last=A[A.length-1];G.built=performance.now();PG.stats.rb++;}
function pgFresh(G){const A=G.arr;if(A.length!==G.n||A[A.length-1]!==G.last||performance.now()-G.built>15000){pgRebuild(G);return;}
  // the moving-things check: a slice of the list each frame
  const T=G.tag,K=Math.min(A.length,G.per||200);for(let j=0;j<K;j++){const i=(G.sw+j)%A.length,e=A[i];if(!e)continue;const ok=e[T+'k'];
    if(ok===undefined){pgRebuild(G);return;}if(ok<0)continue;const k=pgKey(e.x,e.z);if(k===ok)continue;
    const c=G.cells.get(ok);if(c){const p=c.indexOf(e);if(p>=0)c.splice(p,1);}e[T+'k']=k;let d=G.cells.get(k);if(!d)G.cells.set(k,d=[]);d.push(e);}
  G.sw=(G.sw+K)%Math.max(1,A.length);}
function pgGather(G,x0,z0,x1,z1){const out=G.out;out.length=0;const kx0=Math.floor(x0/8),kx1=Math.floor(x1/8),kz0=Math.floor(z0/8),kz1=Math.floor(z1/8);
  if((kx1-kx0+1)*(kz1-kz0+1)>400)return null;   // a huge view (a zoomed-out map, a cutscene camera far away): just use the whole list
  for(let kx=kx0;kx<=kx1;kx++)for(let kz=kz0;kz<=kz1;kz++){const c=G.cells.get((kx+20000)*40000+(kz+20000));if(c)for(let i=0;i<c.length;i++)out.push(c[i]);}
  return out;}
// what to consider drawing this frame: everything whose anchor could pass render()'s own on-screen test
function objView(pad){if(PG.off)return OBJ;if(!PG.objs)PG.objs=pgMake(OBJ,'_g',null,250);const G=PG.objs;pgFresh(G);
  const a=sx(0),b=sz(0);if(!isFinite(a)||!isFinite(b))return OBJ;
  const x0=(-pad-a)/PPM-1,x1=(VW+pad-a)/PPM+1,z0=(-60-b)/PPM-1,z1=(VH+pad+260-b)/PPM+1;
  const r=pgGather(G,x0,z0,x1,z1);if(!r)return OBJ;
  // keep the list's own order between squares that were far apart in it (flat decals drawn in a fixed order never flicker)
  return r;}
// what the action button should weigh: things near you, everyone who walks about, and the few with a wide reach
// (things parked at 0,0 get their real place from code that runs later, one of them inside its own on(): always weigh those)
const pgDynIc=it=>it.npc!==undefined||!!it.mush||!!it.cat||!!it.dyn||!!it._pgdyn||(it.x===0&&it.z===0&&(it._pgdyn=true));
function icNear(){if(PG.off)return interact;if(!PG.ics)PG.ics=pgMake(interact,'_q',pgDynIc,150);const G=PG.ics;pgFresh(G);
  const R=G.maxR+.3+2;const r=pgGather(G,P.x-R,P.z-R,P.x+R,P.z+R);if(!r)return interact;
  const out=r.slice();for(const e of G.dyn)out.push(e);for(const e of G.big)out.push(e);
  // first come, first served on a tie, exactly as before
  if(out.length>1)out.sort((p,q)=>p._qi-q._qi);return out;}
// lamps and candles that glow at night: a short list, refreshed when the world changes
const PGL={n:-1,last:null,list:[],t:0};
function glowObjs(){if(OBJ.length!==PGL.n||OBJ[OBJ.length-1]!==PGL.last||performance.now()-PGL.t>3000){PGL.n=OBJ.length;PGL.last=OBJ[OBJ.length-1];PGL.t=performance.now();PGL.list=OBJ.filter(o=>o.glow);}
  return PGL.list;}
// HUD writes: only touch the page when what it shows actually changes (each write used to make the browser lay the page out again)
function setTxt(el,s){if(!el)return;s=String(s);if(el.textContent===s)return;el.textContent=s;}
function setHtml(el,s){if(!el)return;if(el._pgH===s&&el.firstChild===el._pgF&&el.childNodes.length===el._pgN)return;el.innerHTML=s;el._pgH=s;el._pgF=el.firstChild;el._pgN=el.childNodes.length;}
function setSty(el,k,v){if(!el)return;const c=el._pgS||(el._pgS={});if(c[k]===v&&FRAME_NO-(el._pgV||0)<20)return;el._pgV=FRAME_NO;c[k]=v;if(el.style[k]!==v)el.style[k]=v;}
// ---- a machine that still can't keep up (under ~33 frames a second for five seconds of play) drops the soft sun and lantern
// shadows for the rest of the session and keeps the simple ones under everything, like the water reflections already do
const PGQ={t0:0,n:0,last:0,lite:/[?&]lite\b/.test(location.search),since:performance.now()};
{const step=now=>{try{if(!PGQ.lite){const play=S.mode==='play'&&!S.paused;const gap=now-PGQ.last;PGQ.last=now;
    if(!play||gap>250||now-PGQ.since<20000){PGQ.t0=0;}else if(!PGQ.t0){PGQ.t0=now;PGQ.n=0;}else{PGQ.n++;if(now-PGQ.t0>5000){if((now-PGQ.t0)/PGQ.n>30)PGQ.lite=true;PGQ.t0=now;PGQ.n=0;}}}}catch(e){}requestAnimationFrame(step);};requestAnimationFrame(step);}
{const _sb=sunBegin;sunBegin=function(){if(PGQ.lite){DX.sun=null;DX.lamp=null;return;}return _sb.apply(this,arguments);};}
