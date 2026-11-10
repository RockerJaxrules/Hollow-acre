/* ================= depth cues: water reflections, flowing water, cloud shadows, sunlit dust, and a parallax layer of near branches ================= */
const DX={rc:null,cloud:null,sil:{}};
function dxCanvas(){if(!DX.rc||DX.rc.width!==VW||DX.rc.height!==VH){DX.rc=document.createElement('canvas');DX.rc.width=VW;DX.rc.height=VH;DX.rg=DX.rc.getContext('2d');DX.rg.imageSmoothingEnabled=false;}return DX.rg;}
// paint the water mask of every on-screen chunk into the scratch canvas, keeping only what lies on water
function dxMask(g){const left=cam.px-(VW>>1),top=cam.pz-Math.round(VH*.56);const c0=Math.floor(left/CH),c1=Math.floor((left+VW)/CH),r0=Math.floor(top/CH),r1=Math.floor((top+VH)/CH);
  g.globalCompositeOperation='destination-in';g.beginPath();let any=false;
  // the mask is the same for both passes in a frame: build it once
  const tmp=DX.mk||(DX.mk=document.createElement('canvas'));const key=FRAME_NO+'|'+left+'|'+top+'|'+VW+'x'+VH;
  if(DX.mkKey!==key){if(tmp.width!==VW||tmp.height!==VH){tmp.width=VW;tmp.height=VH;}const tg=tmp.getContext('2d');tg.clearRect(0,0,VW,VH);DX.mkAny=false;
    for(let cz=r0;cz<=r1;cz++)for(let cx=c0;cx<=c1;cx++){const ch=chunks.get(cx+','+cz);if(ch&&ch.wm){tg.drawImage(ch.wm,cx*CH-left,cz*CH-top);DX.mkAny=true;}}DX.mkKey=key;}
  any=DX.mkAny;g.drawImage(tmp,0,0);g.globalCompositeOperation='source-over';return any;}
function dxWaterOnScreen(){const left=cam.px-(VW>>1),top=cam.pz-Math.round(VH*.56);for(let cz=Math.floor(top/CH);cz<=Math.floor((top+VH)/CH);cz++)for(let cx=Math.floor(left/CH);cx<=Math.floor((left+VW)/CH);cx++){const ch=chunks.get(cx+','+cz);if(ch&&ch.wm)return true;}return false;}
const DX_REFLECT=new Set(['tree','pine','bld','lamp','prop','bush','fence','wreck']);
const dxNearWater=(x,z)=>[[0,.6],[0,1.5],[0,3],[1.2,1.5],[-1.2,1.5]].some(([dx,dz])=>terr(x+dx,z+dz)==='water');
// one thing mirrored about its feet, fading out with distance below the waterline: tall things (the covered bridge, the big trees)
// leave a reflection that melts into the water instead of a hard-edged block far down the creek
// each mirror image (a sprite frame, flipped and faded) is made once and kept: by the fen, the reservoir and the river there can be
// dozens of trees at the water's edge on screen at once, and remaking every one every frame was the slowest thing in the game
const DX_MC=new Map();
function dxMirror(g,im,sx0,sy0,m,X,Y,flip){const fw=m.fw,fh=m.fh,ax=Math.round(m.ax),ay=Math.round(m.ay);
  const key=m.src+'|'+sx0+'|'+sy0+'|'+(flip?1:0);let t=DX_MC.get(key);
  if(!t){if(DX_MC.size>600)DX_MC.clear();t=document.createElement('canvas');t.width=fw;t.height=fh;
    const q=t.getContext('2d');q.save();q.translate(flip?fw:0,fh);q.scale(flip?-1:1,-1);q.drawImage(im,sx0,sy0,fw,fh,0,0,fw,fh);q.restore();
    const y0=fh-1-ay,L=Math.max(22,Math.min(110,ay*.55));const gr=q.createLinearGradient(0,y0,0,y0+L);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.55,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(0,0,0,0)');
    q.globalCompositeOperation='destination-in';q.fillStyle=gr;q.fillRect(0,0,fw,fh);q.globalCompositeOperation='source-over';
    if(im.complete!==false&&(im.naturalWidth||im.width))DX_MC.set(key,t);}
  g.drawImage(t,0,0,fw,fh,flip?X+ax-fw+1:X-ax,Y+ay-fh+1,fw,fh);}
function depthWater(t){if(DX.off||S.room||!dxWaterOnScreen())return;const g=dxCanvas();
  // 1) mirrored world: everything standing near the water, flipped about its feet, darkened and tinted by the water
  g.clearRect(0,0,VW,VH);
  if(!DX.refl){DX.refl=OBJ.filter(o=>DX_REFLECT.has(o.kind)&&[[0,1.5],[0,3],[0,5],[1.5,2],[-1.5,2]].some(([dx,dz])=>terr(o.x+dx,o.z+dz)==='water'));}
  for(const o of DX.refl){if(o.hide)continue;const m=SPR[o.spr];if(!m)continue;const im=IMG[m.src];if(!im)continue;const X=Math.round(sx(o.x)),Y=Math.round(sz(o.z));
    if(X<-m.fw||X>VW+m.fw||Y<-20||Y>VH+m.fh)continue;dxMirror(g,im,0,0,m,X,Y,!!o.flip);}
  // people by the water, in the pose they're in right now (not frozen standing still)
  for(const n of npcs)if(n.vis){const m=SPR[n.def.id];if(!m||!m.clips)continue;const im=IMG[m.src];if(!im)continue;if(!dxNearWater(n.x,n.z))continue;const X=Math.round(sx(n.x)),Y=Math.round(sz(n.z));
    if(X<-m.fw||X>VW+m.fw||Y<-20||Y>VH+m.fh)continue;const fr=n._fr&&n._fr[0]===n.def.id?n._fr:null;const c=fr&&m.clips[fr[1]]||m.clips.idle||m.clips.walk;const r=c[fr?fr[2]:(n.dir||'S')]||c.S||Object.values(c)[0];
    dxMirror(g,im,((fr?fr[3]:0)|0)%r[1]*m.fw,r[0]*m.fh,m,X,Y,false);}
  g.globalCompositeOperation='source-atop';g.fillStyle=`rgba(16,44,72,${.45+nightK*.3})`;g.fillRect(0,0,VW,VH);g.globalCompositeOperation='source-over';
  if(dxMask(g)){ctx2.globalAlpha=.42-nightK*.2;for(let y=0;y<VH;y+=6){const off=Math.round(Math.sin(y*.15+t*2.4)*1.4);ctx2.drawImage(DX.rc,0,y,VW,6,off,y,VW,6);}ctx2.globalAlpha=1;}
  // 2) moving water: short bright streaks drifting down the creek and lapping round the pond
  g.clearRect(0,0,VW,VH);const day=1-nightK*.8;
  const gx0=Math.floor((cam.px-(VW>>1))/24)-1,gx1=gx0+Math.ceil(VW/24)+2,gz0=Math.floor((cam.pz-VH*.56)/24)-2,gz1=gz0+Math.ceil(VH/24)+3;
  for(let j=gz0;j<=gz1;j++)for(let i=gx0;i<=gx1;i++){const h=hash(i*13+5,j*7+3);if(h<.35)continue;const wx=i*24+((h*977)%24|0),ph=(t*(14+h*10)+h*200)%48;const wy=j*24+ph-24;
    const X=wx-cam.px+(VW>>1),Y=Math.round(wy-cam.pz+VH*.56);const a=Math.sin(ph/48*Math.PI);g.fillStyle=`rgba(${h>.85?235:200},${h>.85?245:232},255,${.8*a*day})`;g.fillRect(X,Y,h>.75?8:5,1);g.fillStyle=`rgba(10,40,70,${.35*a*day})`;g.fillRect(X+1,Y+1,h>.75?7:4,1);if(h>.9){g.fillStyle=`rgba(255,255,255,${.8*a*day})`;g.fillRect(X+2,Y-1,3,1);}}
  if(dxMask(g))ctx2.drawImage(DX.rc,0,0);}
// cloud shadows: big soft blobs that drift across the whole valley, ground and roofs alike
function cloudTex(){if(DX.cloud)return DX.cloud;const N=256,c=document.createElement('canvas');c.width=N;c.height=N;const g=c.getContext('2d'),id=g.createImageData(N,N);const V=new Float32Array(N*N);let lo=9,hi=-9;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const F=(X,Y)=>fbm(X/60,Y/60)*.75+fbm(X/22+9,Y/22)*.25,u=x/N,w=y/N;const v=F(x,y)*(1-u)*(1-w)+F(x-N,y)*u*(1-w)+F(x,y-N)*(1-u)*w+F(x-N,y-N)*u*w;V[y*N+x]=v;lo=Math.min(lo,v);hi=Math.max(hi,v);}
  for(let i=0;i<N*N;i++){const v=(V[i]-lo)/(hi-lo);const a=clamp((v-.55)*6,0,1);id.data[i*4]=12;id.data[i*4+1]=20;id.data[i*4+2]=34;id.data[i*4+3]=Math.round(a*255);}g.putImageData(id,0,0);DX.cloud=c;return c;}
function depthOver(t){if(DX.off||S.room)return;const day=clamp(1-nightK*1.6,0,1);
  if(day>0){if(!DX.cloudBig){const ct=cloudTex();const b=document.createElement('canvas');b.width=b.height=ct.width*4;const q=b.getContext('2d');q.imageSmoothingEnabled=true;q.drawImage(ct,0,0,b.width,b.height);DX.cloudBig=b;}
    const T=DX.cloudBig.width;ctx2.globalAlpha=.3*day;
    const ox=((-(cam.px)+t*9)%T+T)%T-T,oy=((-(cam.pz)+t*4)%T+T)%T-T;for(let y=oy;y<VH;y+=T)for(let x=ox;x<VW;x+=T)ctx2.drawImage(DX.cloudBig,Math.round(x),Math.round(y));
    ctx2.globalAlpha=1;}
  // parallax: branches much closer to the camera than the ground, sliding past faster, only at the edges of the woods
  const P1=1.45;DX.nPar=0;if(!DX.par)DX.par=[];   // the near-branch silhouettes read as random hard shadows on the ground, so there are none
  for(const o of DX.par){if(o.hide)continue;
    const X=sx(o.x),Y=sz(o.z);const fx=(X-VW/2)*P1+VW/2,fy=(Y-VH*.5)*P1+VH*.5-40;if(fx<-160||fx>VW+160||fy<-200||fy>VH+60)continue;
    const edge=Math.min(Math.abs(fx-VW/2)/(VW*.5),1);if(edge<.45)continue;const m=SPR[o.spr];if(!m)continue;
    let sil=DX.sil[o.spr];if(!sil){const im=IMG[m.src];if(!im)continue;sil=document.createElement('canvas');sil.width=m.fw;sil.height=Math.round(m.fh*.62);const q=sil.getContext('2d');q.drawImage(im,0,0,m.fw,sil.height,0,0,m.fw,sil.height);
      q.globalCompositeOperation='source-in';q.fillStyle='#0b1410';q.fillRect(0,0,sil.width,sil.height);DX.sil[o.spr]=sil;}
    DX.nPar++;ctx2.globalAlpha=(.78-nightK*.25)*Math.min(1,(edge-.45)*4);ctx2.drawImage(sil,Math.round(fx-sil.width*.9),Math.round(fy-sil.height*1.1),Math.round(sil.width*1.8),Math.round(sil.height*1.8));ctx2.globalAlpha=1;}}
// ---- sun shadows: each object throws its own silhouette across the ground, sheared by the sun's position.
// Morning shadows fall long to the west, noon shadows are short, evening shadows stretch east. All shadows go into one buffer, so overlaps don't double up.
const ROOM_LAMP={cabin:[6.5,3.0],store:[6.5,2.0],church:[5,1.2],garage:[5.9,.6]};
function sunState(){const h=S.hour;
  if(S.room){const R=ROOMS[S.room];const sh=SPR[R.shell||('room_'+S.room)],win=sh&&sh.room&&sh.room.windows;if(win&&!win.length&&!lanternOn())return null;   /* (b30: "phantom window beams in a cellar") no windows, no daylight shadows */
    if(S.room!=='mine'&&!isNight()&&h>6.5&&h<19)return {sx:.12,sy:.4,a:.2};   // daylight from the back windows: soft shadows toward you
    const L=ROOM_LAMP[S.room]||(S.room.startsWith('home_')?[3.6,2.4]:null);if(L){DX.lamp={x:sx(R.ox+L[0]),y:sz(R.oz+L[1])-10};return {sx:0,sy:0,a:.42,lamp:1};}
    if(lanternOn()){DX.lamp={x:sx(P.x),y:sz(P.z)-6};return {sx:0,sy:0,a:.5,lamp:1};}return null;}
  if(h<6.2||h>19.4)return null;const t=clamp((h-12.5)/6,-1,1);const fade=clamp((h-6.2)/1.2,0,1)*clamp((19.4-h)/1.2,0,1);
  return {sx:t*1.05,sy:.32+Math.abs(t)*.22,a:.34*fade};}
function dxSil(spr){let c=DX.sil['s_'+spr];if(c)return c;const m=SPR[spr],im=m&&IMG[m.src];if(!im)return null;c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const q=c.getContext('2d');
  q.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);
  // only the solid body casts the sun shadow: soft painted-on shadows under a sprite must not be projected again
  try{const d=q.getImageData(0,0,m.fw,m.fh),a=d.data;for(let i=0;i<a.length;i+=4){const on=a[i+3]>=200;a[i]=10;a[i+1]=18;a[i+2]=6;a[i+3]=on?255:0;}q.putImageData(d,0,0);}
  catch(e){q.globalCompositeOperation='source-in';q.fillStyle='#0a1206';q.fillRect(0,0,m.fw,m.fh);}
  DX.sil['s_'+spr]=c;return c;}
const SUN_SKIP=new Set(['deco','flat','anim']);   // corn casts its shadow too: a field of it without shadows looks painted on
// trees and bushes throw soft shade: the silhouette blurred a little and fading toward the far end of the crown, so neighbouring
// crowns don't merge into one hard-edged slab of shadow
function dxSilSoft(spr){const k='ss_'+spr;if(DX.sil[k])return DX.sil[k];const base=dxSil(spr);if(!base)return null;const m=SPR[spr];const c=document.createElement('canvas');c.width=m.fw+8;c.height=m.fh+8;const g=c.getContext('2d');
  try{g.filter='blur(1.6px)';}catch(e){}g.drawImage(base,4,4);g.filter='none';g.globalCompositeOperation='destination-in';const gr=g.createLinearGradient(0,0,0,c.height);
  gr.addColorStop(0,'rgba(0,0,0,.22)');gr.addColorStop(.55,'rgba(0,0,0,.6)');gr.addColorStop(.85,'rgba(0,0,0,.9)');gr.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=gr;g.fillRect(0,0,c.width,c.height);return DX.sil[k]=c;}
function sunBegin(){DX.lamp=null;DX.sun=sunState();if(S.introDrive&&DX.carLamp&&cine){DX.lamp={x:DX.carLamp.x,y:DX.carLamp.y,a:.6};DX.sun={sx:0,sy:0,a:.6,lamp:1};}else if(!DX.sun&&!S.room&&S.mode!=='title'&&isNight()&&lanternOn()){DX.lamp={x:sx(P.x),y:sz(P.z)-6,a:.55};DX.sun={sx:0,sy:0,a:.55,lamp:1};}if(!DX.sun)return;const g=dxCanvas();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,VW,VH);DX.sg=g;}
// returns true when it handled the shadow (so the flat ellipse isn't needed)
function sunShadow(o,X,Y){const s=DX.sun;if(!s||SUN_SKIP.has(o.kind))return false;const m=SPR[o.spr];if(!m)return false;const c=dxSil(o.spr);if(!c)return false;
  let shx=s.sx,shy=s.sy;if(s.lamp){const dx=X-DX.lamp.x,dy=Y-DX.lamp.y,d=Math.hypot(dx,dy);if(d>230||d<6)return true;const k=clamp(d/110,.25,1.5);shx=dx/d*k;shy=dy/d*k;}
  // trees and bushes are tall: a long low-sun shadow of the whole crown thrown down the screen reads as a dark blob, so theirs stay short
  if(!s.lamp&&(o.kind==='tree'||o.kind==='pine'||o.kind==='bush'||o.kind==='corn')){shx=clamp(shx,-.5,.5);shy=clamp(shy,.06,.3);}
  const g=DX.sg;g.setTransform(1,0,-shx,-shy,Math.round(X),Math.round(Y));const soft=(o.kind==='tree'||o.kind==='pine'||o.kind==='bush')&&dxSilSoft(o.spr);
  if(soft)g.drawImage(soft,-Math.round(m.ax)-4,-Math.round(m.ay)-4);else g.drawImage(c,-Math.round(m.ax),-Math.round(m.ay));return true;}
function sunActor(X,Y,h){const s=DX.sun;if(!s)return;const g=DX.sg;g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a1206';g.beginPath();
  const L=h*s.sy,dx=h*s.sx;g.ellipse(X+dx*.5,Y+L*.5,7+Math.abs(dx)*.5,3+L*.4,Math.atan2(L,dx||.001)-Math.PI/2,0,Math.PI*2);g.fill();}
function sunEnd(){const s=DX.sun;if(!s)return;const g=DX.sg;g.setTransform(1,0,0,1,0,0);
  if(!s.lamp){for(const n of npcs)if(n.vis)sunActor(sx(n.x),sz(n.z),40);if(S.mode!=='title'&&!(cine&&cine.hidePlayer))sunActor(sx(P.x),sz(P.z),40);}
  ctx2.globalAlpha=s.a;ctx2.drawImage(DX.rc,0,0);ctx2.globalAlpha=1;}
// ---- on a slow phone the water reflections are the heaviest thing on screen: if the game can't keep up (under ~38 frames a
// second, measured over a few seconds with water in view) they switch off for the rest of the session. Fast machines never notice.
const DXQ={t0:0,n:0,last:0,lite:false};
function dxQualityTick(now){if(DXQ.lite)return;if(S.mode!=='play'||S.paused||S.room||!dxWaterOnScreen()){DXQ.n=0;DXQ.t0=0;DXQ.last=now;return;}
  if(!DXQ.t0){DXQ.t0=now;DXQ.n=0;DXQ.last=now;return;}const gap=now-DXQ.last;DXQ.last=now;if(gap>250){DXQ.t0=now;DXQ.n=0;return;}   // a pause or a hidden tab isn't slowness
  DXQ.n++;if(now-DXQ.t0>4000){const avg=(now-DXQ.t0)/DXQ.n;if(avg>26)DXQ.lite=true;DXQ.t0=now;DXQ.n=0;}}
{const _dw=depthWater;depthWater=function(t){if(DXQ.lite)return;return _dw.apply(this,arguments);};}
{const step=now=>{try{dxQualityTick(now);}catch(e){}requestAnimationFrame(step);};requestAnimationFrame(step);}
