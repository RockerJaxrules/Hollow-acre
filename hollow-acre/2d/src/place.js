/* ================= placing things yourself (benches, furniture, buildings), stumps cut from each tree's own trunk,
   real silhouette shadows for people, leaves that fall from the trees in the world, and bigger UI on desktop ================= */

// ---------- stumps that match the tree they came from
// Maples and oaks show their trunk at the base: cut the lowest 15 px of that trunk out of the tree's own sprite and put a sawn top on it.
// Pines hide the trunk under their skirts, so their stump is painted at the trunk width the canopy implies.
function makeStump(spr){const key='stump_of_'+spr;if(SPR[key])return key;const m=SPR[spr],im=m&&IMG[m.src];if(!im)return null;
  const c0=document.createElement('canvas');c0.width=m.fw;c0.height=m.fh;const g0=c0.getContext('2d');g0.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);
  const D=g0.getImageData(0,0,m.fw,m.fh).data,ax=Math.round(m.ax),ay=Math.round(m.ay);
  const bark=(x,y)=>{if(x<0||y<0||x>=m.fw||y>=m.fh)return false;const i=(y*m.fw+x)*4;const r=D[i],g=D[i+1],b=D[i+2],a=D[i+3];return a>200&&r>g+4&&r>b+8&&r<215;};
  // trunk width and bark colours, measured just above the root flare
  const row=ay-8;let x0=ax,x1=ax;while(bark(x0-1,row))x0--;while(bark(x1+1,row))x1++;let w=x1-x0+1;const cols=[];
  // not brown bark (a birch is white, a snag is grey): measure the trunk by its own colour instead, from the middle outwards
  if(w<5){const at=(x,y)=>{const i=(y*m.fw+x)*4;return [D[i],D[i+1],D[i+2],D[i+3]];};const c0=at(ax,row);
    if(c0[3]>200&&c0[0]+c0[1]+c0[2]>90&&!(c0[1]>c0[0]+6&&c0[1]>=c0[2])){const near=(x)=>{if(x<0||x>=m.fw)return false;const q=at(x,row);return q[3]>200&&q[0]+q[1]+q[2]>45&&Math.abs(q[0]-c0[0])+Math.abs(q[1]-c0[1])+Math.abs(q[2]-c0[2])<150;};
      x0=ax;x1=ax;while(near(x0-1))x0--;while(near(x1+1))x1++;w=x1-x0+1;}}
  if(w>=5){for(let x=x0;x<=x1;x++){const i=(row*m.fw+x)*4;cols.push([D[i],D[i+1],D[i+2]]);}}
  if(w<5){w=Math.max(14,Math.round(m.fw*.17));for(const h of ['#2a160c','#4a2a18','#6a3e22','#8a5634','#a87048'])cols.push([parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);}
  w=Math.max(12,w);cols.sort((p,q)=>(p[0]+p[1]+p[2])-(q[0]+q[1]+q[2]));const BK=[0,.2,.45,.7,.95].map(t=>{const c=cols[Math.min(cols.length-1,Math.floor(t*cols.length))];return `rgb(${c[0]},${c[1]},${c[2]})`;});
  const H=20,W=w+40,h=H+12,c=document.createElement('canvas');c.width=W;c.height=h;const g=c.getContext('2d');const bx=(W-w)>>1,by=h-6-H;
  for(let y=0;y<H;y++){const fl=y>H-6?Math.round((y-(H-6))*.9):0;for(let x=-fl;x<w+fl;x++){const u=(x+fl)/(w+2*fl);g.fillStyle=BK[u<.18?4:u<.45?3:u<.8?2:1];if(((x*7+y*3)%9)===0)g.fillStyle=BK[1];if(y>H-3)g.fillStyle=BK[1];g.fillRect(bx+x,by+y,1,1);}}
  // pale bark (birch): the black lenticel dashes it has on the standing tree, so the stump reads as the same tree
  const lum=cols.reduce((t,c)=>t+c[0]+c[1]+c[2],0)/cols.length/3;
  if(lum>150){g.fillStyle='#1c1a1e';for(let y=2;y<H-4;y+=3+((hash(y,spr.length)*3)|0)){const l=2+((hash(y,3)*Math.min(5,w*.4))|0),x=1+((hash(y,9)*(w-l-1))|0);g.fillRect(bx+x,by+y,l,1);if(hash(y,11)>.5)g.fillRect(bx+x+1,by+y+1,Math.max(1,l-2),1);}}
  // roots running into the soil on both sides
  for(const [sd,l] of [[-1,5],[1,6]])for(let i=0;i<l;i++){const xx=sd<0?bx-6-i+1:bx+w+5+i-1,yy=h-7+Math.min(1,i>>1);g.fillStyle=BK[2];g.fillRect(xx,yy,1,1);g.fillStyle=BK[0];g.fillRect(xx,yy+1,1,1);}
  const ox=0;x0=bx;x1=bx+w-1;
  // the sawn top: pale rings, a darker bark lip, a crack
  const cx=Math.round((x0+x1)/2),cy=by,rx=Math.round((x1-x0)/2)+1,ry=Math.max(3,Math.round(rx*.42));
  for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const d=x*x/(rx*rx)+y*y/(ry*ry);if(d>1)continue;const ring=Math.floor(Math.sqrt(d)*4);
    g.fillStyle=d>.72?'#5a3820':ring%2?'#d6b072':'#bf9658';if(d<=.72&&x+y*1.5<-rx*.4)g.fillStyle=ring%2?'#e8c88a':'#d2aa6a';g.fillRect(cx+x,cy+y,1,1);}
  g.fillStyle='#7a5430';g.fillRect(cx,cy,1,1);g.fillStyle='#4a2e18';for(let i=0;i<Math.min(rx,5);i++)g.fillRect(cx+1+i,cy-1+(i>>1),1,1);
  // contact shadow + a few grass blades in front so it sits in the ground
  g.fillStyle='rgba(10,16,6,.55)';g.fillRect(cx-rx-3,h-6,rx*2+7,2);g.fillStyle='rgba(10,16,6,.3)';g.fillRect(cx-rx-5,h-4,rx*2+11,2);
  const GG=['#1f4420','#2f6428','#438232','#62a03e'];for(let i=0;i<10;i++){const x=cx-rx-2+Math.round(hash(i,spr.length)*(rx*2+4)),hh=2+((hash(i,7)*3)|0);for(let k=0;k<hh;k++){g.fillStyle=GG[k===hh-1?3:k?2:1];g.fillRect(x,h-6-k,1,1);}}
  // outline
  const od=g.getImageData(0,0,W,h),o=g.createImageData(W,h);for(let y=0;y<h;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(od.data[i+3]>40)continue;
    for(const [ddx,ddy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+ddx,Y=y+ddy;if(X<0||Y<0||X>=W||Y>=h)continue;const j=(Y*W+X)*4;if(od.data[j+3]>200&&Y<h-6){o.data[i]=od.data[j]*.3;o.data[i+1]=od.data[j+1]*.26;o.data[i+2]=od.data[j+2]*.32;o.data[i+3]=255;break;}}}
  const oc=document.createElement('canvas');oc.width=W;oc.height=h;oc.getContext('2d').putImageData(o,0,0);g.globalCompositeOperation='destination-over';g.drawImage(oc,0,0);g.globalCompositeOperation='source-over';
  IMG[key]=c;SPR[key]={src:key,fw:W,fh:h,ax:W/2,ay:h-6,foot:[-(rx+1)/PPM,-.3,(rx+1)/PPM,0]};return key;}

// ---------- silhouette shadows for people (the same sheared shadow every prop casts, cut from the frame they're showing)
const SILF={};
function frameSil(nm,clip,dir,f){const m=SPR[nm],im=m&&IMG[m.src];if(!im||!m.clips)return null;const c=m.clips[clip]||m.clips.walk;const r=c[dir]||c.S;const key=nm+clip+dir+(f|0);if(SILF[key])return SILF[key];
  const cv=document.createElement('canvas');cv.width=m.fw;cv.height=m.fh;const g=cv.getContext('2d');g.drawImage(im,((f|0)%r[1])*m.fw,r[0]*m.fh,m.fw,m.fh,0,0,m.fw,m.fh);
  g.globalCompositeOperation='source-in';g.fillStyle='#0a1206';g.fillRect(0,0,m.fw,m.fh);if(Object.keys(SILF).length>400)for(const k in SILF)delete SILF[k];return SILF[key]={cv,m};}
sunActor=function(X,Y,h,who){const s=DX.sun;if(!s)return;const g=DX.sg;const fr=who&&who._fr;const sil=fr&&frameSil(fr[0],fr[1],fr[2],fr[3]);
  if(!sil){g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a1206';g.beginPath();g.ellipse(X,Y,6,2.5,0,0,Math.PI*2);g.fill();return;}
  g.setTransform(1,0,-s.sx,-s.sy,Math.round(X),Math.round(Y));g.drawImage(sil.cv,-Math.round(sil.m.ax),-Math.round(sil.m.ay));g.setTransform(1,0,0,1,0,0);};
sunEnd=function(){const s=DX.sun;if(!s)return;const g=DX.sg;g.setTransform(1,0,0,1,0,0);
  if(!s.lamp){for(const n of npcs)if(n.vis){if(!n._fr)n._fr=[n.def.id,'walk',n.dir||'S',0];sunActor(sx(n.x),sz(n.z),40,n);}
    if(S.mode!=='title'&&!(cine&&cine.hidePlayer))sunActor(sx(P.x),sz(P.z),40,P);}
  ctx2.globalAlpha=s.a;ctx2.drawImage(DX.rc,0,0);ctx2.globalAlpha=1;};
// contact shadow cut from the frame itself: the figure squashed flat under the feet, so it widens with a stride, a swing or a kneel
function footShadow(fr,X,Y){const sil=fr&&frameSil(fr[0],fr[1],fr[2],fr[3]);if(!sil){shadow(X,Y,9);return;}const m=sil.m;
  // only the lower body: legs and feet spread the shadow, the hair doesn't
  const top=Math.round(m.ay-22),h=22,dh=5;ctx2.save();ctx2.globalAlpha=S.room?.3:.26;
  for(const dx of [-1,1])ctx2.drawImage(sil.cv,0,top,m.fw,h,Math.round(X-m.ax)+dx,Math.round(Y)-dh+1,m.fw,dh);
  ctx2.globalAlpha=S.room?.3:.24;ctx2.fillStyle='#0a1206';ctx2.beginPath();ctx2.ellipse(X,Y,5.5,1.6,0,0,Math.PI*2);ctx2.fill();ctx2.restore();}
// the soft contact shadow right under the feet stays, smaller and tighter
shadow=function(x,y,w){ctx2.fillStyle='rgba(10,14,8,.38)';ctx2.beginPath();ctx2.ellipse(x,y,Math.max(4,w*.62),2.4,0,0,Math.PI*2);ctx2.fill();};

// ---------- leaves that come off the maples, in the world: they drift down, land at the foot of the tree, lie there, then fade
const LEAVES=[];let leafT=0;
// the trees that drop leaves, and the colours they drop (light, dark)
const LEAF_COL={maple_orange:['#e08a2e','#9a4a14'],maple_red:['#c8402a','#7a1c12'],maple_gold:['#e8b83a','#9a7018'],maple_green:['#6aa040','#2e5a20'],
  oak_russet:['#c8642a','#7a3214'],oak_green:['#7aa040','#3a5a20'],birch_gold:['#f0c040','#a07818'],birch_green:['#c0c850','#6a7a24'],willow:['#b8c058','#6a7a2a'],apple_tree:['#8aa040','#4a6020'],apple_gold:['#c8b848','#7a7020']};
function leavesUpdate(dt){if(S.room||nightK>.7)return;leafT-=dt;if(leafT<=0){leafT=1.6+rand()*2.4;
    const near=OBJ.filter(o=>!o.hide&&o.spr&&LEAF_COL[o.spr]&&onScreen(o.x,o.z,40));if(near.length){const o=near[(rand()*near.length)|0];
      LEAVES.push({x:o.x+(rand()-.5)*2.4,z:o.z+(rand()-.2)*.8,h:70+rand()*40,t:0,ph:rand()*6,col:LEAF_COL[o.spr],land:0});}}
  for(let i=LEAVES.length-1;i>=0;i--){const L=LEAVES[i];L.t+=dt;if(L.h>0){L.h=Math.max(0,L.h-dt*14);L.x+=Math.sin(L.t*1.7+L.ph)*dt*.5+dt*.12;}else{L.land+=dt;if(L.land>6)LEAVES.splice(i,1);}}}
function leavesDraw(){for(const L of LEAVES){const X=Math.round(sx(L.x)),Y=Math.round(sz(L.z)),a=L.land>4?1-(L.land-4)/2:1;ctx2.globalAlpha=a*(1-nightK*.7);
  if(L.h>0){ctx2.fillStyle='rgba(8,14,6,.28)';ctx2.fillRect(X-1,Y,3,1);}
  const y=Y-Math.round(L.h),flip=L.h>0&&Math.sin(L.t*5+L.ph)>0;ctx2.fillStyle=L.col[0];ctx2.fillRect(X-1,y,flip?2:4,2);ctx2.fillRect(X,y-1,2,1);ctx2.fillStyle=L.col[1];ctx2.fillRect(X+(flip?1:2),y+1,1,1);ctx2.globalAlpha=1;}}

// ---------- placement mode (Stardew-style): pick a spot, see it green or red, place or cancel
const PLACE={on:false};
{const css=document.createElement('style');css.textContent=`#placeBar{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 132px);z-index:30;display:none;gap:8px;align-items:center;padding:8px 10px;max-width:560px;margin:0 auto;
  background:var(--px-panel);box-shadow:0 0 0 2px var(--px-dark),inset 0 0 0 2px var(--px-light),inset 0 0 0 4px var(--px-wood)}#placeBar span{font-size:12px;color:var(--bone);flex:1;line-height:1.25}#placeBar button{padding:8px 14px}`;document.head.appendChild(css);
  const bar=document.createElement('div');bar.id='placeBar';bar.innerHTML='<span id="placeHint"></span><button class="close hot" id="placeOk">Place</button><button class="close" id="placeNo">Cancel</button>';document.body.appendChild(bar);
  $('placeOk').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();placeConfirm();});$('placeNo').addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();placeCancel();});}
// spec: {spr, w, d (footprint in metres), room (null = outdoors, or a room key), name, refund:{item:n}, coins, done(x,z)}
function startPlace(spec){if(PLACE.on)placeCancel();Object.assign(PLACE,{on:true,spec,x:null,z:null,manual:false});['shop','bag'].forEach(id=>{const el=$(id);if(el&&!el.hidden){el.hidden=true;}});S.paused=false;
  {const N=spec.name[0].toUpperCase()+spec.name.slice(1);$('placeHint').innerHTML=matchMedia('(pointer:fine)').matches?`<b>${N}</b>: click where it goes, or drag it. Then <b>Place</b> (or Enter, or double-click). Esc cancels.`:`<b>${N}</b>: tap where it goes, or drag it. Then <b>Place</b> (or tap it twice).`;}$('placeBar').style.display='flex';}
function placeCancel(){if(!PLACE.on)return;const sp=PLACE.spec;for(const [k,n] of Object.entries(sp.refund||{}))addInv(k,n);if(sp.coins)S.coins+=sp.coins;if(sp.cancel)sp.cancel();PLACE.on=false;$('placeBar').style.display='none';toast('Put away.',1);updateHud();}
function placeSpot(){const sp=PLACE.spec;if(!PLACE.manual){PLACE.x=Math.round((P.x+P.fx*1.6)*8)/8;PLACE.z=Math.round((P.z+P.fz*1.4+(P.fz<0?0:sp.d*.5))*8)/8;}return [PLACE.x,PLACE.z];}
function placeValid(x,z){const sp=PLACE.spec,x0=x-sp.w/2,x1=x+sp.w/2,z0=z-sp.d,z1=z;
  if(sp.room){const R=ROOMS[sp.room];if(S.room!==sp.room)return 'Take it inside first.';if(x0<R.ox+.15||x1>R.ox+R.w-.15||z0<R.oz+.45||z1>R.oz+R.d-.3)return 'Against the wall.';if(Math.abs(x-(R.ox+R.door))<1&&z1>R.oz+R.d-1.4)return 'That blocks the door.';}
  else{if(S.room)return 'Go back outside.';if(x0<-12||x1>25||z0<-16||z1>13)return 'Off the farm.';
    for(let i=x0;i<=x1+.01;i+=.5)for(let j=z0;j<=z1+.01;j+=.5){const t=terr(i,j);if(t==='water'||t==='stone')return 'Not on that ground.';}
    if(x1>FIELD.x0-.2&&x0<FIELD.x0+FIELD.w+.2&&z1>FIELD.z0-.2&&z0<FIELD.z0+FIELD.h+.2)return 'Not in the field.';
    for(const p of [doorPos,wellPos,binPos])if(p.x>x0-1&&p.x<x1+1&&p.z>z0-.6&&p.z<z1+1.6)return 'Too close to that.';}
  for(const r of rects)if(r.x1>x0+.05&&r.x0<x1-.05&&r.z1>z0+.05&&r.z0<z1-.05)return 'Something is in the way.';
  for(const c of circles)if(c.x+c.r>x0&&c.x-c.r<x1&&c.z+c.r>z0&&c.z-c.r<z1)return 'Something is in the way.';
  for(const s of segs){const L=Math.hypot(s.x2-s.x1,s.z2-s.z1),n=Math.max(2,Math.ceil(L/.1));for(let i=0;i<=n;i++){const t=i/n,px=s.x1+(s.x2-s.x1)*t,pz=s.z1+(s.z2-s.z1)*t,r=(s.r||.15);if(px>x0-r&&px<x1+r&&pz>z0-r&&pz<z1+r)return 'A fence is in the way.';}}
  for(const o of OBJ){if(o.hide||['deco','anim','grass','flat'].includes(o.kind))continue;
    // each thing blocks the ground it stands on: its own footprint if it has one, otherwise a box the width of its base
    const m=SPR[o.spr],f=m&&m.foot&&(m.foot[0]||m.foot[2])?m.foot:null,hw=Math.min(.34,Math.max(.12,(m?m.fw:20)/PPM*.3));
    const ox0=o.x+(f?f[0]:-hw),ox1=o.x+(f?f[2]:hw),oz0=o.z+(f?f[1]:-.3),oz1=o.z+(f?f[3]:.02);
    if(ox1>x0+.03&&ox0<x1-.03&&oz1>z0+.03&&oz0<z1-.03)return 'Something is in the way.';}
  if(Math.hypot(P.x-x,P.z-(z-sp.d/2))<Math.max(sp.w,sp.d)*.45)return 'You are standing there.';return null;}
function placeConfirm(){if(!PLACE.on)return;const [x,z]=placeSpot();const bad=placeValid(x,z);if(bad){toast(bad,1.4);SFX.deny();return;}
  const sp=PLACE.spec;PLACE.on=false;$('placeBar').style.display='none';SFX.thud(0,.35);burst(x,z-.2,12,'#c8a070',1.2,.6,2);sp.done(x,z);updateHud();}
function placeDraw(){if(!PLACE.on)return;const [x,z]=placeSpot();const sp=PLACE.spec;const bad=placeValid(x,z);const X0=Math.round(sx(x-sp.w/2)),Y0=Math.round(sz(z-sp.d)),W=Math.round(sp.w*PPM),H=Math.round(sp.d*PPM);
  ctx2.fillStyle=bad?'rgba(220,60,40,.35)':'rgba(110,220,90,.32)';ctx2.fillRect(X0,Y0,W,H);ctx2.strokeStyle=bad?'rgba(255,110,90,.9)':'rgba(170,255,150,.9)';ctx2.lineWidth=1;ctx2.strokeRect(X0+.5,Y0+.5,W-1,H-1);
  for(let i=0;i<=sp.w*2;i++)for(let j=0;j<=sp.d*2;j++){ctx2.fillStyle=bad?'rgba(255,140,120,.5)':'rgba(200,255,190,.5)';ctx2.fillRect(X0+Math.round(i*PPM/2),Y0+Math.round(j*PPM/2),1,1);}
  drawSpr(sp.spr,sx(x),sz(z),null,null,0,{alpha:.7});}
// picking a spot: press anywhere to move the building there, drag to slide it around, then press Place (or Enter, or tap it twice).
// The same on a touch screen and with a mouse. While placing, dragging moves the building, not you.
{const toWorld=(e)=>{const r=view.getBoundingClientRect();const X=(e.clientX-r.left)*VW/r.width,Y=(e.clientY-r.top)*VH/r.height;
    const sp=PLACE.spec;return [Math.round(((X+cam.px-(VW>>1))/PPM)*8)/8,Math.round(((Y+cam.pz-Math.round(VH*.56))/PPM+sp.d/2)*8)/8];};
  let drag=null,lastTap={t:0,x:0,y:0};const onWorld=e=>e.target===view||(e.target&&e.target.id==='c');
  addEventListener('pointerdown',e=>{if(!PLACE.on||!onWorld(e))return;if(e.pointerType==='mouse'&&e.button!==0)return;e.stopImmediatePropagation();e.preventDefault();
    const now=performance.now();const again=now-lastTap.t<380&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<28;lastTap={t:now,x:e.clientX,y:e.clientY};
    if(again){placeConfirm();drag=null;return;}
    [PLACE.x,PLACE.z]=toWorld(e);PLACE.manual=true;drag={id:e.pointerId};SFX.page&&SFX.page();},true);
  addEventListener('pointermove',e=>{if(!PLACE.on||!drag||e.pointerId!==drag.id)return;const [x,z]=toWorld(e);if(x!==PLACE.x||z!==PLACE.z){PLACE.x=x;PLACE.z=z;PLACE.manual=true;}},true);
  const end=e=>{if(drag&&e.pointerId===drag.id){drag=null;}};
  addEventListener('pointerup',end,true);addEventListener('pointercancel',end,true);
  addEventListener('keydown',e=>{if(!PLACE.on)return;if(e.code==='Escape'){placeCancel();e.stopImmediatePropagation();}if(e.code==='Enter'){placeConfirm();e.stopImmediatePropagation();}
    if(/^Arrow|^Key[WASD]$/.test(e.code))PLACE.manual=false;},true);}
// the big button places while you're in placement mode
{const _oa=onAct;onAct=function(){if(PLACE.on){placeConfirm();return;}_oa();};const _cc4=computeContext;computeContext=function(){if(PLACE.on){const [x,z]=placeSpot();const b=placeValid(x,z);return {label:b?'Can’t place':'Place',ok:!b,act:placeConfirm};}return _cc4();};}

// ---------- benches, furniture and buildings now go where you put them
const BENCH_FP={farm:[1.7,.6],furnace:[1.1,.6],weapon:[1.7,.6],armor:[1.7,.6],furn:[1.7,.6]};
placeBench=function(k,x,z){const d=BENCHES.find(b=>b[0]===k);BENCH_POS[k]={x,z};const [w,dd]=BENCH_FP[k];obj(d[1],x,z,{kind:'prop'});addRect(x-w/2,z-dd,x+w/2,z-.02);
  interact.push({x,z:z+.45,r:1.2,label:()=>d[2].split(' ')[0],ok:()=>true,act(){openShop('b_'+k);}});};
{const _pl4=vendors.plans.rows;vendors.plans.rows=()=>_pl4().map(r=>{if(!r.k||!r.k.startsWith('bench_'))return r;const k=r.k.slice(6);const d=BENCHES.find(b=>b[0]===k);
  return Object.assign(r,{buy(){const [w,dd]=BENCH_FP[k];startPlace({spr:d[1],w,d:dd,name:d[2].toLowerCase(),refund:Object.assign({},d[3]),done(x,z){S.benches[k]=true;placeBench(k,x,z);toast(`The ${d[2].toLowerCase()} is set up.`,1.8);}});}});});}
benchesBoot=function(){for(const [k] of BENCHES)if(S.benches[k]&&BENCH_POS[k])placeBench(k,BENCH_POS[k].x,BENCH_POS[k].z);for(const f of S.furnPlaced||[])placeFurnAt(f.k,f.x,f.z);};
// furniture: made at the bench, carried in your bag, placed anywhere inside the cabin
S.furnBag=S.furnBag||[];S.furnPlaced=S.furnPlaced||[];
const FURN_FP={chair:[.85,.55],lamp:[.6,.4],shelf:[1.6,.45],rug:[2.4,1.4],pumpkin:[.7,.5],crates:[1.3,.7]};
function placeFurnAt(k,x,z){const [name,spr,need,pos,kind]=FURN[k];const o=obj(spr,x,z,{kind:kind||'furn',room:'cabin',glow:k==='pumpkin'?1:0,night:SPR[spr+'_n']?spr+'_n':null});
  if(!kind){const [w,d]=FURN_FP[k];addRect(x-w/2,z-d,x+w/2,z-.02);}if(k==='lamp'){S.cabinLamp={x,z};}if(!S.furn.includes(k))S.furn.push(k);}
const furnCount=k=>(S.furnPlaced||[]).filter(p=>p.k===k).length+S.furnBag.filter(q=>q===k).length;
vendors.b_furn.rows=()=>Object.entries(FURN).map(([k,[name,spr,need]])=>({k,name,desc:`Made here, placed wherever you like inside the cabin. Make as many as you like.${furnCount(k)?` You have ${furnCount(k)}.`:''}`,price:0,
  can:(k!=='pumpkin'||basketCount('pumpkin')>0),need,btn:'Make',buy(){if(k==='pumpkin')takeBasket('pumpkin',1);S.furnBag.push(k);toast(`The ${name.toLowerCase()} is in your bag. Place it from the bag inside the cabin.`,2.6);}}));
function startFurn(k){const [name,spr]=FURN[k];const [w,d]=FURN_FP[k];startPlace({spr,w,d,room:'cabin',name:name.toLowerCase(),cancel(){S.furnBag.push(k);},done(x,z){placeFurnAt(k,x,z);S.furnPlaced.push({k,x,z});}});const i=S.furnBag.indexOf(k);if(i>=0)S.furnBag.splice(i,1);}
{const _ob=openBag;openBag=function(){_ob();if(!S.furnBag.length)return;const B=$('bagBody');const h=document.createElement('div');
  h.innerHTML='<h3>Furniture</h3><div class="grid">'+S.furnBag.map(k=>`<div class="it"><img src="${iconOf(FURN[k][1])}" alt=""><span>${FURN[k][0]}</span><button data-place="${k}">Place</button></div>`).join('')+'</div>';B.appendChild(h);
  h.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>holdItem('F:'+b.dataset.place)));};}
{const _il2=interiorLight;interiorLight=function(L){const was=S.cabinLamp;if(was&&typeof was==='object'){S.cabinLamp=false;_il2(L);S.cabinLamp=was;if(S.room==='cabin')glowAt(sx(was.x),sz(was.z)-60,120,[255,190,110],.8*L);}else _il2(L);};}
// buildings: the coop and the greenhouse go where you choose
{const _pl5=vendors.plans.rows;vendors.plans.rows=()=>_pl5().map(r=>{
  if(r.k==='coop'&&!S.coop)return Object.assign(r,{buy(){startPlace({spr:'coop',w:3,d:1.6,name:'chicken coop',refund:Object.assign({},r.need),coins:r.price,done(x,z){S.coop=true;S.coopPos={x,z};rebuildFarm();toast('The coop is up. The hens go straight in, as if they’d been waiting.',2.6);}});}});
  if(r.k==='gh'&&!S.greenhouse)return Object.assign(r,{buy(){startPlace({spr:'greenhouse',w:5.2,d:3,name:'greenhouse',refund:Object.assign({},r.need),coins:r.price,done(x,z){S.greenhouse=true;GH.x=x;GH.z=z;ROOMS.greenhouse.out={x,z:z+.8};buildGreenhouse();toast('The greenhouse is up. Through the glass, the field looks very far away.',3);}});}});
  return r;});}
rebuildFarm=(function(){return function(){for(const o of farmObjs)o.hide=true;farmObjs.length=0;
  if(S.coop){const c=S.coopPos||{x:11,z:-2.6};const o=obj('coop',c.x,c.z,{kind:'bld',night:'coop_n'});farmObjs.push(o);if(!c.col){c.col=1;addRect(c.x-1.4,c.z-1.2,c.x+1.4,c.z-.1);}}
  if(S.fieldLamps){for(const x of [-2,2]){lamp(x,-1.6);farmObjs.push(lamps[lamps.length-1].e);lamps[lamps.length-1].dead=false;}}};})();
{const egg=interact.find(it=>it.label&&String(it.label).includes('Eggs'));if(egg)Object.defineProperties(egg,{x:{get(){return S.coopPos?S.coopPos.x+.9:11.9;}},z:{get(){return S.coopPos?S.coopPos.z+.6:-2;}}});}

// ---------- rooms: you only leave by walking out through the doorway, never because you were still holding "down" as you came in
{const _lr=leaveRoom;let since=0;leaveRoom=function(force){if(!force&&(performance.now()-since<700||P.fz<=0))return;_lr();};const _er=enterRoom;enterRoom=function(k){since=performance.now()+400;_er(k);};}

// ---------- desktop: scale the HTML interface up with the window so it isn't tiny on a monitor
function uiScale(){}   // desktop scaling lives in hud2.js now (one scale, --u, for everything)

// ---------- per-frame hooks
{const _u6=update;update=function(dt){_u6(dt);leavesUpdate(dt);};}

function findPlace(cx,cz){for(let r=0;r<12;r+=.5)for(let a=0;a<16;a++){const x=Math.round((cx+Math.cos(a/16*6.283)*r)*2)/2,z=Math.round((cz+Math.sin(a/16*6.283)*r)*2)/2;if(!placeValid(x,z))return [x,z];}return null;}
