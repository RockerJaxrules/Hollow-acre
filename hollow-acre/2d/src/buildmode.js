/* ================= #231 building mode, like Stardew's. Placing anything outdoors (a bench, the coop, the greenhouse) or moving
   one now takes you into building mode: you step out of yourself and look down at the farm, the HUD clears away, a faint
   survey grid lies over the ground, and the building hangs where you put it with every square of its footprint marked
   green (clear) or red (something's in the way: a fence post, a rock, the field), so you can see exactly what to move.
   Drag it, or nudge it with the arrow keys; the view follows it. Place or Cancel and you're back on the farm. The
   carpenter's plans also have "Move a building": pick up the coop or a bench and set it down somewhere else. ======== */
const BM={on:false,cine:null,hid:[],near:null,key:'',pick:false};
function bmHud(hide){const ids=['hud','buttons','btnBag','btnDecor','hotbar','bar','mainHotbar'];
  if(hide){BM.hid=[];for(const id of ids){const e=$(id);if(e&&!e.hidden&&e.style.visibility!=='hidden'){e.style.visibility='hidden';BM.hid.push(e);}}document.querySelectorAll('.hotbar,#hotbar').forEach(e=>{if(e.style.visibility!=='hidden'){e.style.visibility='hidden';BM.hid.push(e);}});}
  else{for(const e of BM.hid)e.style.visibility='';BM.hid=[];}}
function bmEnter(x,z){if(BM.on)return;BM.on=true;BM.cine={cam:{x,z},hidePlayer:true,build:1};cine=BM.cine;S.paused=true;bmHud(true);document.body.classList.add('buildmode');}
function bmExit(){if(!BM.on)return;BM.on=false;BM.pick=false;if(cine===BM.cine)cine=null;BM.cine=null;S.paused=false;bmHud(false);document.body.classList.remove('buildmode');}
{const css=document.createElement('style');css.textContent=`body.buildmode #placeBar{top:calc(env(safe-area-inset-top,0px) + 14px)!important}
  #placeBar .bmk{display:block;font-size:10px;letter-spacing:.2em;color:#e8923f;margin-bottom:2px}#bmPick{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}`;document.head.appendChild(css);}
// placing outdoors goes through building mode
{const _sp=startPlace;startPlace=function(spec){const r=_sp.apply(this,arguments);if(spec&&!spec.room&&!S.room){const [x,z]=placeSpot();PLACE.x=x;PLACE.z=z;PLACE.manual=true;bmEnter(x,z-(spec.d||1)/2);
    const N=spec.name[0].toUpperCase()+spec.name.slice(1);$('placeHint').innerHTML=`<span class="bmk">BUILDING MODE</span><b>${N}</b>: ${matchMedia('(pointer:fine)').matches?'click or drag it into place, or nudge it with the arrow keys':'drag it into place'}. Green squares are clear; red ones have something in the way.`;}return r;};}
{const _pc=placeConfirm;placeConfirm=function(){const r=_pc.apply(this,arguments);if(!PLACE.on)bmExit();return r;};}
{const _pn=placeCancel;placeCancel=function(){const r=_pn.apply(this,arguments);if(!PLACE.on)bmExit();return r;};}
// the view follows the building; the arrow keys nudge it half a square
{const _r=render;render=function(dt,now){if(BM.on&&BM.cine&&PLACE.on){const sp=PLACE.spec;const tx=PLACE.x,tz=PLACE.z-(sp.d||1)/2+.6;const c=BM.cine.cam,k=1-Math.exp(-(dt||.016)*5);c.x+=(tx-c.x)*k;c.z+=(tz-c.z)*k;}return _r.apply(this,arguments);};}
addEventListener('keydown',e=>{if(!BM.on||!PLACE.on)return;const d={ArrowLeft:[-.5,0],KeyA:[-.5,0],ArrowRight:[.5,0],KeyD:[.5,0],ArrowUp:[0,-.5],KeyW:[0,-.5],ArrowDown:[0,.5],KeyS:[0,.5]}[e.code];
  if(!d)return;e.preventDefault();e.stopImmediatePropagation();PLACE.manual=true;PLACE.x=Math.round((PLACE.x+d[0])*2)/2;PLACE.z=Math.round((PLACE.z+d[1])*2)/2;SFX.page&&SFX.page();},true);
// ---- the survey grid and the square-by-square check
function bmNear(x0,z0,x1,z1){const pad=1.5,X0=x0-pad,X1=x1+pad,Z0=z0-pad,Z1=z1+pad,inB=(a0,b0,a1,b1)=>a1>X0&&a0<X1&&b1>Z0&&b0<Z1;
  const R=rects.filter(r=>inB(r.x0,r.z0,r.x1,r.z1)),C=circles.filter(c=>inB(c.x-c.r,c.z-c.r,c.x+c.r,c.z+c.r)),G=segs.filter(s=>inB(Math.min(s.x1,s.x2)-.3,Math.min(s.z1,s.z2)-.3,Math.max(s.x1,s.x2)+.3,Math.max(s.z1,s.z2)+.3));
  const O=[];for(const o of OBJ){if(o.hide||['deco','anim','grass','flat'].includes(o.kind)||o.x<X0-3||o.x>X1+3||o.z<Z0-3||o.z>Z1+3)continue;const m=SPR[o.spr],f=m&&m.foot&&(m.foot[0]||m.foot[2])?m.foot:null,hw=Math.min(.34,Math.max(.12,(m?m.fw:20)/PPM*.3));
    const b=[o.x+(f?f[0]:-hw),o.z+(f?f[1]:-.3),o.x+(f?f[2]:hw),o.z+(f?f[3]:.02)];if(inB(...b))O.push(b);}
  return {R,C,G,O};}
function bmCellBad(x0,z0,x1,z1,N){if(x0<-12||x1>25||z0<-16||z1>13)return 1;const t=terr((x0+x1)/2,(z0+z1)/2);if(t==='water'||t==='stone')return 1;
  if(x1>FIELD.x0-.2&&x0<FIELD.x0+FIELD.w+.2&&z1>FIELD.z0-.2&&z0<FIELD.z0+FIELD.h+.2)return 1;
  for(const p of [doorPos,wellPos,binPos])if(p.x>x0-1&&p.x<x1+1&&p.z>z0-.6&&p.z<z1+1.6)return 1;
  for(const r of N.R)if(r.x1>x0+.05&&r.x0<x1-.05&&r.z1>z0+.05&&r.z0<z1-.05)return 1;
  for(const c of N.C)if(c.x+c.r>x0&&c.x-c.r<x1&&c.z+c.r>z0&&c.z-c.r<z1)return 1;
  for(const s of N.G){const L=Math.hypot(s.x2-s.x1,s.z2-s.z1),n=Math.max(2,Math.ceil(L/.1));for(let i=0;i<=n;i++){const q=i/n,px=s.x1+(s.x2-s.x1)*q,pz=s.z1+(s.z2-s.z1)*q,r=(s.r||.15);if(px>x0-r&&px<x1+r&&pz>z0-r&&pz<z1+r)return 1;}}
  for(const b of N.O)if(b[2]>x0+.03&&b[0]<x1-.03&&b[3]>z0+.03&&b[1]<z1-.03)return 1;return 0;}
{const _pd=placeDraw;placeDraw=function(){if(!BM.on||!PLACE.on)return _pd.apply(this,arguments);const sp=PLACE.spec;const [x,z]=placeSpot();
  const g=ctx2;const x0=x-sp.w/2,z0=z-sp.d;
  // the survey grid over everything in view
  g.fillStyle='rgba(255,236,190,.10)';const wx0=Math.floor((cam.px-VW/2)/PPM)-1,wx1=Math.ceil((cam.px+VW/2)/PPM)+1,wz0=Math.floor((cam.pz-VH*.56)/PPM)-1,wz1=Math.ceil((cam.pz+VH*.5)/PPM)+1;
  for(let i=wx0;i<=wx1;i++){const X=Math.round(sx(i));g.fillRect(X,0,1,VH);}for(let j=wz0;j<=wz1;j++){const Y=Math.round(sz(j));g.fillRect(0,Y,VW,1);}
  // each half-metre square of the footprint, clear or not
  const key=x+','+z+','+sp.w+','+sp.d;if(BM.key!==key){BM.key=key;const N=bmNear(x0,z0,x0+sp.w,z);BM.cells=[];for(let i=0;i<sp.w-1e-6;i+=.5)for(let j=0;j<sp.d-1e-6;j+=.5){const cx0=x0+i,cz0=z0+j,cx1=Math.min(x0+sp.w,cx0+.5),cz1=Math.min(z,cz0+.5);BM.cells.push([cx0,cz0,cx1,cz1,bmCellBad(cx0,cz0,cx1,cz1,N)]);}}
  drawSpr(sp.spr,sx(x),sz(z),null,null,0,{alpha:.5,flip:sp.flip});   // the building, see-through, then its footprint over it
  for(const [a,b,c,d,bad] of BM.cells){const X=Math.round(sx(a)),Y=Math.round(sz(b)),W=Math.round(sx(c))-X,H=Math.round(sz(d))-Y;
    g.fillStyle=bad?'rgba(214,62,44,.5)':'rgba(96,206,90,.4)';g.fillRect(X+1,Y+1,W-1,H-1);g.fillStyle=bad?'rgba(255,120,100,.9)':'rgba(170,255,150,.75)';g.fillRect(X,Y,W,1);g.fillRect(X,Y,1,H);}
  const bad=placeValid(x,z);const X0=Math.round(sx(x0)),Y0=Math.round(sz(z0)),W=Math.round(sp.w*PPM),H=Math.round(sp.d*PPM);g.strokeStyle=bad?'rgba(255,110,90,.95)':'rgba(190,255,170,.95)';g.lineWidth=2;g.strokeRect(X0,Y0,W,H);g.lineWidth=1;
};}
// you're not standing anywhere in building mode, so you can't be in the way
{const _pv=placeValid;placeValid=function(x,z){const r=_pv.apply(this,arguments);if(BM.on&&r==='You are standing there.')return null;return r;};}
// ---- Move a building (the carpenter's plans)
function bmMovable(){const out=[];if(S.coop)out.push(['coop','The chicken coop']);if(typeof BENCHES!=='undefined')for(const [k,spr,name] of BENCHES)if(S.benches&&S.benches[k]&&BENCH_POS[k])out.push(['bench:'+k,name]);return out;}
function bmMove(){if(S.room){toast('Go outside first.',1.6);return;}['shop','bag'].forEach(id=>{const el=$(id);if(el)el.hidden=true;});const list=bmMovable();if(!list.length){toast('Nothing on the farm to move yet.',2);S.paused=false;return;}
  bmEnter(P.x,P.z);BM.pick=true;const bar=$('placeBar');bar.style.display='flex';$('placeOk').style.display='none';
  $('placeHint').innerHTML=`<span class="bmk">BUILDING MODE</span><b>Move a building</b>: which one?<span id="bmPick">${list.map(([k,n])=>`<button class="btn" data-bm="${k}">${n}</button>`).join('')}</span>`;
  $('placeHint').querySelectorAll('button[data-bm]').forEach(b=>b.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();bmPickUp(b.dataset.bm);}));
  const no=$('placeNo');const done=()=>{if(BM.pick){BM.pick=false;bar.style.display='none';$('placeOk').style.display='';bmExit();}no.removeEventListener('pointerdown',done,true);};no.addEventListener('pointerdown',done,true);}
function bmPickUp(k){BM.pick=false;$('placeOk').style.display='';const keep=BM.on;if(keep){BM.on=false;if(cine===BM.cine)cine=null;bmHud(false);}   // startPlace re-enters building mode
  if(k==='coop'){const was=Object.assign({},S.coopPos||{x:11,z:-2.6});S.coop=false;rebuildFarm();
    startPlace({spr:'coop',w:3,d:1.6,name:'chicken coop',moving:1,cancel(){S.coop=true;S.coopPos=was;rebuildFarm();},done(x,z){S.coop=true;S.coopPos={x,z};rebuildFarm();toast('The coop is in its new spot. The hens complain about it for a day.',2.6);}});return;}
  if(k.startsWith('bench:')){const b=k.slice(6);const d=BENCHES.find(q=>q[0]===b);const was=Object.assign({},BENCH_POS[b]);const reg=(typeof MPW!=='undefined'&&MPW.reg)?MPW.reg.bench:[];
    for(let i=reg.length-1;i>=0;i--)if(reg[i].k===b){unplace(reg[i]);reg.splice(i,1);}
    const [w,dd]=BENCH_FP[b];startPlace({spr:d[1],w,d:dd,name:d[2].toLowerCase(),moving:1,cancel(){placeBench(b,was.x,was.z);},done(x,z){placeBench(b,x,z);toast(`The ${d[2].toLowerCase()} is in its new spot.`,2);}});}}
{const _pl=vendors.plans.rows;vendors.plans.rows=()=>{const r=_pl();r.push({k:'move',name:'Move a building',desc:'Pick up the coop or one of your benches and set it down somewhere else on the farm. No charge for that.',price:0,can:bmMovable().length>0,btn:'Move',buy(){bmMove();}});return r;};}
