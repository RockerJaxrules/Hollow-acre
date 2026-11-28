/* ================= #360 the owner's bug batch: rain that lands on the ground, ducks that dabble, trees clear of the hedges, the top
   bars on their own steady layer. (Other fixes in this batch live in the modules they belong to: main.js, stage.js, heartshow.js,
   progress.js, menu.js, game.js, coop.js, host.js, mpsleep.js, reactive.js, routines.js, and the ui337 / story337 snapshots.) ================= */

// ---- 1. rain lands on the ground (owner: "rain is making ripple effects on air; it needs to only happen on the ground").
// The splashes were rings at random places on the screen, so they showed on roofs, over the trees and in the sky. Now each one
// belongs to a patch of ground in the world, 1.6 m across: it opens where a drop hits, moves with the ground as you walk, and is
// drawn with the ground, before anything that stands on it, so a roof, a tree or a cart in front of it hides it. None land inside a
// building, a tree, a fence or a prop's footprint; on water they are wider rings.
function fx60Solid(x,z){try{const A=cgNear(x,z,.1);
    for(const c of A.c)if((x-c.x)*(x-c.x)+(z-c.z)*(z-c.z)<c.r*c.r)return true;
    for(const q of A.r)if(x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1)return true;
    for(const s of A.s){const dx=s.x2-s.x1,dz=s.z2-s.z1,L=dx*dx+dz*dz||1,t=clamp(((x-s.x1)*dx+(z-s.z1)*dz)/L,0,1),ex=x-(s.x1+dx*t),ez=z-(s.z1+dz*t);if(ex*ex+ez*ez<s.r*s.r)return true;}}catch(e){}
  return false;}
const FX60_RAIN={cell:1.6,cache:new Map()};
function fx60RainK(){if(S.room)return 0;if(S.storm&&isNight())return 1.15;if(typeof rainNow==='function'&&rainNow()){const h=S.hour;return Math.max(0,Math.min(1,(h-9.5)/.4,(15.5-h)/.4));}return 0;}
function fx60RainGround(t){const k=fx60RainK();if(k<=0)return;const C=FX60_RAIN.cell,left=(cam.px-(VW>>1))/PPM,top=(cam.pz-Math.round(VH*.56))/PPM;
  const i0=Math.floor(left/C)-1,i1=Math.floor((left+VW/PPM)/C)+1,j0=Math.floor(top/C)-1,j1=Math.floor((top+VH/PPM)/C)+1;
  if(FX60_RAIN.cache.size>6000)FX60_RAIN.cache.clear();const storm=S.storm&&isNight();
  ctx2.save();ctx2.lineWidth=1;
  for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){
    const ph=t*(storm?3.4:2.6)+hash(i*7+3,j*13+5),c=Math.floor(ph),f=ph-c;
    // where in its patch this drop lands (a new place each time), and whether that is open ground or water (asked once per place)
    const x=(i+hash(i*31+c,j*17+1))*C,z=(j+hash(i*19+2,j*29+c))*C;const key=Math.round(x*8)+','+Math.round(z*8);
    let g=FX60_RAIN.cache.get(key);if(g===undefined){g=fx60Solid(x,z)?0:(LAYERS.water(x,z)?2:1);FX60_RAIN.cache.set(key,g);}if(!g)continue;
    const X=Math.round(sx(x)),Y=Math.round(sz(z));if(X<-8||X>VW+8||Y<-8||Y>VH+8)continue;
    const w=g===2?1.6:1;ctx2.globalAlpha=Math.min(1,k)*(1-f)*(storm?.95:.85);
    ctx2.strokeStyle=storm?'rgba(215,226,245,.75)':'rgba(200,215,235,.55)';ctx2.beginPath();ctx2.ellipse(X,Y,(1+f*4)*w,(.5+f*1.6)*w,0,0,6.283);ctx2.stroke();
    if(f<.22&&g===1){ctx2.fillStyle='rgba(215,228,245,.8)';ctx2.fillRect(X-1,Y-1-Math.round(f*6),1,1);ctx2.fillRect(X+1,Y-1-Math.round(f*5),1,1);}}   // the crown it throws up, a pixel or two off the ground
  ctx2.restore();}
{const _mr=mindReflection;mindReflection=function(){const r=_mr.apply(this,arguments);try{fx60RainGround(performance.now()/1000);}catch(e){}return r;};}
// the rings stay where the world changes (a building put up, a tree felled): the cache of what's ground is dropped every few seconds
setInterval(()=>{FX60_RAIN.cache.clear();},4000);

// ---- 11. a duck that stops to feed (owner: "ducks sometimes stop and their whole texture looks weird and glitched"): the dabbling frame
// was a thin grey diagonal stick that read as a broken sprite. A feeding duck is now its own swimming picture with its head and neck
// under the water (the body sits a pixel lower, and the rings open where its head went in), facing the way it was going.
{const _d=drawSpr;drawSpr=function(name,x,y,clip,dir,frame,o){
  if(clip==='dabble'&&(name==='wild_hen'||name==='wild_drake')){const m=SPR[name];const g=(o&&o.ctx)||ctx2;if(!m)return;
    const X=Math.round(x),dx=Math.round(x-m.ax),dy=Math.round(y+1-m.ay),fl=!!(o&&o.flip);
    // the head: the front 9 columns above the waterline's top 7 rows (mirrored when it faces left)
    const hx=fl?(2*X-dx-m.fw):dx+12,hw=9;g.save();g.beginPath();g.rect(dx-m.fw,dy+7,m.fw*3,m.fh);g.rect(fl?hx+hw:dx-m.fw,dy-2,fl?m.fw*2:m.fw+12,9);g.clip();
    const r=_d.call(this,name,x,y+1,'swim',dir,0,o);g.restore();
    const t=performance.now()/1000,f=(t*1.3+(x*.37)%1)%1,hxw=fl?hx+3:hx+5;g.strokeStyle=`rgba(225,238,255,${(.55*(1-f)).toFixed(3)})`;g.lineWidth=1;g.beginPath();g.ellipse(hxw,dy+8,2+f*3,.8+f*1.2,0,0,6.283);g.stroke();
    return r;}
  return _d.apply(this,arguments);};}

// ---- 12. trees clear of the hedges (owner: "tree glitching through bush hedges"). A hedge is many short pieces, each sorted on its own,
// so a tree standing on a hedge line had the pieces behind its trunk drawn under the crown and the pieces in front drawn over it: the
// hedge seemed to run through the tree. A tree whose trunk stands in a hedge, or on a hedge that runs past it, is taken out (with its
// collider), once the world has been built and again whenever it changes. Story trees, the crash oak and kept trees stay.
const FX60_HEDGE={n:-1,cut:0};
function fx60HedgeSegs(){const segs=[];const runs={};
  for(const o of OBJ){if(o.hide||o.room)continue;const s=o.spr||'';
    if(s==='hedge_v'||s==='hedge_v_b')segs.push([o.x,o.z-1.05,o.x,o.z+.05]);
    else if(s==='hedge')segs.push([o.x-.05,o.z,o.x+2.15,o.z]);
    else if(o.f39hg){const m=/^f39hg_(.*)_(\d+)$/.exec(s);if(m)(runs[m[1]]=runs[m[1]]||[]).push(o);}}
  // the farm's hedges: the pieces of one run share their x (it runs down the screen) or their z (across); each reaches halfway to the next
  for(const L of Object.values(runs)){if(!L.length)continue;const m0=SPR[L[0].spr];if(L.length<2&&!(m0&&m0.fw>1))continue;const vert=L.length>1?Math.abs(L[0].x-L[1].x)<.01:m0.fh>m0.fw;
    L.sort((a,b)=>vert?a.z-b.z:a.x-b.x);for(let i=0;i<L.length;i++){const o=L[i],a=vert?o.z:o.x,pa=i?(vert?L[i-1].z:L[i-1].x):a-1.2,na=i<L.length-1?(vert?L[i+1].z:L[i+1].x):a+1.2;
      const a0=(a+pa)/2,a1=(a+na)/2;segs.push(vert?[o.x,a0,o.x,a1]:[a0,o.z,a1,o.z]);}}
  return segs;}
function fx60HedgeSweep(){if(OBJ.length===FX60_HEDGE.n)return;FX60_HEDGE.n=OBJ.length;
  const segs=fx60HedgeSegs();if(!segs.length)return;const G=new Map(),K=(i,j)=>i*100003+j;
  for(const s of segs){const i0=Math.floor((Math.min(s[0],s[2])-2)/4),i1=Math.floor((Math.max(s[0],s[2])+2)/4),j0=Math.floor((Math.min(s[1],s[3])-2)/4),j1=Math.floor((Math.max(s[1],s[3])+2)/4);
    for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=K(i,j);let a=G.get(k);if(!a){a=[];G.set(k,a);}a.push(s);}}
  for(const o of OBJ){if(o.hide||o.room||(o.kind!=='tree'&&o.kind!=='pine'))continue;if(o.crashOak||o.keep||o.story||o.mile||o.town||o.t41)continue;
    const a=G.get(K(Math.floor(o.x/4),Math.floor(o.z/4)));if(!a)continue;const m=SPR[o.spr];const rc=Math.min(1.4,Math.max(.6,(m?m.fw:60)*.3/PPM));let hit=false;
    // down the screen: a hedge within the crown either side that reaches the trunk's line and runs on behind it and in front of it
    let at=false,back=false,front=false;
    for(const s of a){if(s[0]===s[2]){if(Math.abs(o.x-s[0])>=rc+.3)continue;const lo=Math.min(s[1],s[3]),hi=Math.max(s[1],s[3]);if(lo<o.z+.3&&hi>o.z-.3)at=true;if(lo<o.z-.15)back=true;if(hi>o.z+.15)front=true;}
      else if(Math.abs(o.z-s[1])<.5&&o.x>Math.min(s[0],s[2])-.45&&o.x<Math.max(s[0],s[2])+.45){hit=true;break;}}   // across: the trunk stands in it
    if(at&&back&&front)hit=true;
    if(!hit)continue;o.hide=true;o.fx60cut=1;FX60_HEDGE.cut++;
    for(let j=circles.length-1;j>=0;j--){const c=circles[j];if(c.r<1.2&&Math.hypot(c.x-o.x,c.z-o.z)<.6)circles.splice(j,1);}}}
setTimeout(function fx60H(){try{if(S.mode!=='title'&&S.mode!=='load')fx60HedgeSweep();}catch(e){}setTimeout(fx60H,2500);},1500);

// ---- 8/9. the bars along the top (owner: "the text bars at the top that show actions and what people are doing flicker; the leaving
// message too"): the message box, the goal bar, the mind banner and the host's waiting card each sit on their own compositing layer
// with no blur behind them, so a fade or a docking move repaints only them; their text is written only when it changes (game.js toast)
{const css=document.createElement('style');css.textContent=
  '#toast,#objective,#mindBanner,#idnWait,#hudC{will-change:opacity;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}';
  document.head.appendChild(css);}

// ---- 10. a farmhand on a host's farm (see host.js): every farm that arrives is remembered for Continue; one that arrives because the
// host opened the farm again (Continue on their side, a reload) is taken in place, without moving you, and said once
{const _as=applySnap;applySnap=function(data,first,hand){HOST.wasGuest=true;const waiting=!!(typeof IDN!=='undefined'&&IDN.wait),re=HOST.resync;HOST.resync=false;if(re)HOST.quiet=true;
  const r=_as.apply(this,arguments);
  try{mpLastFarm({code:HOST.code,host:HOST.hostName||'',at:Date.now()});if(re&&!waiting&&!first)toast(`${HOST.hostName||'The host'}’s farm is open again. You’re back in step with it.`,3.2);}catch(e){}return r;};}
