/* ================= depth cues: water reflections, flowing water, cloud shadows, sunlit dust, and a parallax layer of near branches ================= */
const DX={rc:null,cloud:null,sil:{}};
function dxCanvas(){if(!DX.rc||DX.rc.width!==VW||DX.rc.height!==VH){DX.rc=document.createElement('canvas');DX.rc.width=VW;DX.rc.height=VH;DX.rg=DX.rc.getContext('2d');DX.rg.imageSmoothingEnabled=false;}return DX.rg;}
// paint the water mask of every on-screen chunk into the scratch canvas, keeping only what lies on water
function dxMask(g){const left=cam.px-(VW>>1),top=cam.pz-Math.round(VH*.56);const c0=Math.floor(left/CH),c1=Math.floor((left+VW)/CH),r0=Math.floor(top/CH),r1=Math.floor((top+VH)/CH);
  g.globalCompositeOperation='destination-in';g.beginPath();let any=false;
  const tmp=DX.mk||(DX.mk=document.createElement('canvas'));if(tmp.width!==VW||tmp.height!==VH){tmp.width=VW;tmp.height=VH;}const tg=tmp.getContext('2d');tg.clearRect(0,0,VW,VH);
  for(let cz=r0;cz<=r1;cz++)for(let cx=c0;cx<=c1;cx++){const ch=chunks.get(cx+','+cz);if(ch&&ch.wm){tg.drawImage(ch.wm,cx*CH-left,cz*CH-top);any=true;}}
  g.drawImage(tmp,0,0);g.globalCompositeOperation='source-over';return any;}
function dxWaterOnScreen(){const left=cam.px-(VW>>1),top=cam.pz-Math.round(VH*.56);for(let cz=Math.floor(top/CH);cz<=Math.floor((top+VH)/CH);cz++)for(let cx=Math.floor(left/CH);cx<=Math.floor((left+VW)/CH);cx++){const ch=chunks.get(cx+','+cz);if(ch&&ch.wm)return true;}return false;}
const DX_REFLECT=new Set(['tree','pine','bld','lamp','prop','bush','fence','wreck']);
function depthWater(t){if(DX.off||S.room||!dxWaterOnScreen())return;const g=dxCanvas();
  // 1) mirrored world: everything standing near the water, flipped about its feet, darkened and tinted by the water
  g.clearRect(0,0,VW,VH);
  if(!DX.refl){DX.refl=OBJ.filter(o=>DX_REFLECT.has(o.kind)&&[[0,1.5],[0,3],[0,5],[1.5,2],[-1.5,2]].some(([dx,dz])=>terr(o.x+dx,o.z+dz)==='water'));}
  for(const o of DX.refl){if(o.hide)continue;const m=SPR[o.spr];if(!m)continue;const im=IMG[m.src];if(!im)continue;const X=Math.round(sx(o.x)),Y=Math.round(sz(o.z));
    if(X<-m.fw||X>VW+m.fw||Y<-20||Y>VH+20)continue;g.save();g.translate(0,Y*2);g.scale(1,-1);g.drawImage(im,0,0,m.fw,m.fh,X-Math.round(m.ax),Y-Math.round(m.ay),m.fw,m.fh);g.restore();}
  for(const n of npcs)if(n.vis){const m=SPR[n.def.id];if(!m)continue;const im=IMG[m.src];const X=Math.round(sx(n.x)),Y=Math.round(sz(n.z));const c=m.clips.idle[n.dir||'S']||m.clips.idle.S;
    g.save();g.translate(0,Y*2);g.scale(1,-1);g.drawImage(im,0,c[0]*m.fh,m.fw,m.fh,X-m.ax,Y-m.ay,m.fw,m.fh);g.restore();}
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
    ctx2.globalAlpha=1;
    // dust and pollen hanging in the sunlight
    for(let i=0;i<10;i++){const h=hash(i,77),wx=(h*VW*1.6+t*(3+h*5))%(VW+60)-30,wy=(hash(i,78)*VH+Math.sin(t*.6+i)*14-t*(2+h*3))%(VH+40);const Y=wy<0?wy+VH+40:wy;
      const tw=.5+.5*Math.sin(t*2.2+i*1.7);ctx2.fillStyle=`rgba(255,240,190,${.3*tw*day})`;ctx2.fillRect(Math.round(wx),Math.round(Y),1,1);if(h>.75){ctx2.fillStyle=`rgba(255,250,220,${.25*tw*day})`;ctx2.fillRect(Math.round(wx)-1,Math.round(Y),3,1);}}}
  // parallax: branches much closer to the camera than the ground, sliding past faster, only at the edges of the woods
  const P1=1.45;DX.nPar=0;if(!DX.par)DX.par=OBJ.filter(o=>(o.kind==='tree'||o.kind==='pine')&&hash(Math.round(o.x*3),Math.round(o.z*3))<=.4&&LAYERS.dark(o.x,o.z));
  for(const o of DX.par){if(o.hide)continue;
    const X=sx(o.x),Y=sz(o.z);const fx=(X-VW/2)*P1+VW/2,fy=(Y-VH*.5)*P1+VH*.5-40;if(fx<-160||fx>VW+160||fy<-200||fy>VH+60)continue;
    const edge=Math.min(Math.abs(fx-VW/2)/(VW*.5),1);if(edge<.45)continue;const m=SPR[o.spr];if(!m)continue;
    let sil=DX.sil[o.spr];if(!sil){const im=IMG[m.src];if(!im)continue;sil=document.createElement('canvas');sil.width=m.fw;sil.height=Math.round(m.fh*.62);const q=sil.getContext('2d');q.drawImage(im,0,0,m.fw,sil.height,0,0,m.fw,sil.height);
      q.globalCompositeOperation='source-in';q.fillStyle='#0b1410';q.fillRect(0,0,sil.width,sil.height);DX.sil[o.spr]=sil;}
    DX.nPar++;ctx2.globalAlpha=(.78-nightK*.25)*Math.min(1,(edge-.45)*4);ctx2.drawImage(sil,Math.round(fx-sil.width*.9),Math.round(fy-sil.height*1.1),Math.round(sil.width*1.8),Math.round(sil.height*1.8));ctx2.globalAlpha=1;}}
// ---- sun shadows: each object throws its own silhouette across the ground, sheared by the sun's position.
// Morning shadows fall long to the west, noon shadows are short, evening shadows stretch east. All shadows go into one buffer, so overlaps don't double up.
const ROOM_LAMP={cabin:[6.5,3.0],store:[4.55,2.0],church:[5,1.2],garage:[5.3,.6]};
function sunState(){const h=S.hour;
  if(S.room){const R=ROOMS[S.room];if(S.room!=='mine'&&!isNight()&&h>6.5&&h<19)return {sx:.12,sy:.4,a:.2};   // daylight from the back windows: soft shadows toward you
    const L=ROOM_LAMP[S.room];if(L){DX.lamp={x:sx(R.ox+L[0]),y:sz(R.oz+L[1])-10};return {sx:0,sy:0,a:.42,lamp:1};}
    if(lanternOn()){DX.lamp={x:sx(P.x),y:sz(P.z)-6};return {sx:0,sy:0,a:.5,lamp:1};}return null;}
  if(h<6.2||h>19.4)return null;const t=clamp((h-12.5)/6,-1,1);const fade=clamp((h-6.2)/1.2,0,1)*clamp((19.4-h)/1.2,0,1);
  return {sx:t*1.05,sy:.32+Math.abs(t)*.22,a:.34*fade};}
function dxSil(spr){let c=DX.sil['s_'+spr];if(c)return c;const m=SPR[spr],im=m&&IMG[m.src];if(!im)return null;c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const q=c.getContext('2d');
  q.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);q.globalCompositeOperation='source-in';q.fillStyle='#0a1206';q.fillRect(0,0,m.fw,m.fh);DX.sil['s_'+spr]=c;return c;}
const SUN_SKIP=new Set(['deco','flat','anim','corn']);
function sunBegin(){DX.lamp=null;DX.sun=sunState();if(S.introDrive&&DX.carLamp&&cine){DX.lamp={x:DX.carLamp.x,y:DX.carLamp.y,a:.6};DX.sun={sx:0,sy:0,a:.6,lamp:1};}else if(!DX.sun&&!S.room&&S.mode!=='title'&&isNight()&&lanternOn()){DX.lamp={x:sx(P.x),y:sz(P.z)-6,a:.55};DX.sun={sx:0,sy:0,a:.55,lamp:1};}if(!DX.sun)return;const g=dxCanvas();g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,VW,VH);DX.sg=g;}
// returns true when it handled the shadow (so the flat ellipse isn't needed)
function sunShadow(o,X,Y){const s=DX.sun;if(!s||SUN_SKIP.has(o.kind))return false;const m=SPR[o.spr];if(!m)return false;const c=dxSil(o.spr);if(!c)return false;
  let shx=s.sx,shy=s.sy;if(s.lamp){const dx=X-DX.lamp.x,dy=Y-DX.lamp.y,d=Math.hypot(dx,dy);if(d>230||d<6)return true;const k=clamp(d/110,.25,1.5);shx=dx/d*k;shy=dy/d*k;}
  const g=DX.sg;g.setTransform(1,0,-shx,-shy,Math.round(X),Math.round(Y));g.drawImage(c,-Math.round(m.ax),-Math.round(m.ay));return true;}
function sunActor(X,Y,h){const s=DX.sun;if(!s)return;const g=DX.sg;g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a1206';g.beginPath();
  const L=h*s.sy,dx=h*s.sx;g.ellipse(X+dx*.5,Y+L*.5,7+Math.abs(dx)*.5,3+L*.4,Math.atan2(L,dx||.001)-Math.PI/2,0,Math.PI*2);g.fill();}
function sunEnd(){const s=DX.sun;if(!s)return;const g=DX.sg;g.setTransform(1,0,0,1,0,0);
  if(!s.lamp){for(const n of npcs)if(n.vis)sunActor(sx(n.x),sz(n.z),40);if(S.mode!=='title'&&!(cine&&cine.hidePlayer))sunActor(sx(P.x),sz(P.z),40);}
  ctx2.globalAlpha=s.a;ctx2.drawImage(DX.rc,0,0);ctx2.globalAlpha=1;}
