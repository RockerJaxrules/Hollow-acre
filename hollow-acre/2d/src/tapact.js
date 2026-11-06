/* ================= tap (or click) to farm: tap a field square, a tree, a rock, a person or anything else you can use. If it's in
   reach you face it and do it at once; if not, you walk over first. Dragging still walks you like before. ================= */
const TAP={auto:null,mark:null};
const screenToWorld=(cx,cy)=>{const r=view.getBoundingClientRect();const X=(cx-r.left)*VW/r.width,Y=(cy-r.top)*VH/r.height;return [(X+cam.px-(VW>>1))/PPM,(Y+cam.pz-Math.round(VH*.56))/PPM];};
function tapTarget(wx,wz){// the nearest usable thing under the finger, else the field square under it
  let best=null,bd=1e9;for(const it of interact){if(it.on&&!it.on())continue;if(it.npc!==undefined&&npcs[it.npc]){it.x=npcs[it.npc].x;it.z=npcs[it.npc].z;}
    if(!isFinite(it.x)||!isFinite(it.z))continue;const d=Math.hypot(it.x-wx,(it.z-.3)-wz);if(d<Math.max(.75,(it.r||1)*.6)&&d<bd){bd=d;best=it;}}
  if(best)return {kind:'item',it:best,x:best.x,z:best.z,r:Math.min(1.1,(best.r||1)*.8)};
  for(const t of tiles){if(!!t.gh!==(S.room==='greenhouse'))continue;if(Math.abs(t.x-wx)<.5&&Math.abs(t.z-wz)<.5)return {kind:'tile',t,x:t.x,z:t.z,r:.85};}
  return null;}
function tapDo(T){if(T.kind==='tile'){const dx=T.x-P.x,dz=T.z-.1-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);TAP.force=T.t;const c=computeContext();TAP.force=null;
    if(c&&c.ok&&c.act){TAP.force=T.t;c.act();setTimeout(()=>{TAP.force=null;},50);}else if(c&&c.label)SFX.deny&&SFX.deny();return;}
  const it=T.it;const dx=it.x-P.x,dz=it.z-P.z,d=Math.hypot(dx,dz)||1;P.fx=dx/d;P.fz=dz/d;P.dir=dirOf(dx,dz);if(it.ok&&!it.ok()){SFX.deny&&SFX.deny();return;}it.act();}
// the chosen square wins while the tap is being acted on
{const _tt=targetTile;targetTile=function(){if(TAP.force)return TAP.force;return _tt.apply(this,arguments);};}
function tapGo(T){const dx=P.x-T.x,dz=P.z-T.z,d=Math.hypot(dx,dz);if(d<=T.r+.35){tapDo(T);return;}
  // stand just short of it, on the side you're coming from
  const k=(T.r)/(d||1);TAP.auto={x:T.x+dx*k,z:T.z+dz*k,T,t:0};TAP.mark={x:T.x,z:T.z,t:0};}
{const _mi=mindInput;mindInput=function(mx,mz){const a=TAP.auto;if(a){if(Math.hypot(mx,mz)>.15||S.paused||S.mode!=='play'||P.anim){if(Math.hypot(mx,mz)>.15)TAP.auto=null;}
    else{a.t+=1/60;const dx=a.x-P.x,dz=a.z-P.z,d=Math.hypot(dx,dz);if(d<.22||a.t>7){TAP.auto=null;if(d<.6||Math.hypot(P.x-a.T.x,P.z-a.T.z)<a.T.r+.5)tapDo(a.T);}
      else{const k=Math.min(1,d*1.6)*.82;return _mi(dx/d*k,dz/d*k);}}}return _mi(mx,mz);};}
// a little ring where you tapped
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);const m=TAP.mark;if(!m)return;m.t+=1/60;if(m.t>.9&&!TAP.auto){TAP.mark=null;return;}
  D.push({z:m.z-.5,mind:1,draw(){const X=sx(m.x),Y=sz(m.z)+2,k=(Math.sin(m.t*8)+1)/2;ctx2.strokeStyle=`rgba(255,230,140,${.5+k*.4})`;ctx2.lineWidth=2;ctx2.beginPath();ctx2.ellipse(X,Y,10+k*3,4+k,0,0,Math.PI*2);ctx2.stroke();}});};}
// a tap is a short press that didn't move: on the game view, not on buttons or panels
{let down=null;const onWorld=e=>e.target===view||(e.target&&e.target.id==='c');
  addEventListener('pointerdown',e=>{if(!onWorld(e))return;if(PLACE&&PLACE.on)return;if(e.pointerType==='mouse'&&e.button!==0)return;down={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};});
  addEventListener('pointerup',e=>{const d0=down;down=null;if(!d0||e.pointerId!==d0.id)return;if(PLACE&&PLACE.on)return;if(S.mode!=='play'||S.paused||P.anim)return;
    if(Math.hypot(e.clientX-d0.x,e.clientY-d0.y)>14||performance.now()-d0.t>420)return;
    const [wx,wz]=screenToWorld(e.clientX,e.clientY);const T=tapTarget(wx,wz);if(!T)return;tapGo(T);});}
