/* ================= engine: canvas, sprites, ground, lighting, input ================= */
const $=id=>document.getElementById(id);
const view=$('view');const ctx2=view.getContext('2d');
let VW=320,VH=480,SCALE=3;
function resize(){const dpr=Math.min(3,window.devicePixelRatio||1);const W=innerWidth*dpr,H=innerHeight*dpr;
  SCALE=Math.max(1,Math.round(Math.min(W,H)/(innerWidth<innerHeight?400:380)));VW=Math.ceil(W/SCALE);VH=Math.ceil(H/SCALE);
  view.width=VW;view.height=VH;view.style.width=innerWidth+'px';view.style.height=innerHeight+'px';ctx2.imageSmoothingEnabled=false;
  for(const c of [lightC,fogC,fxC]){c.width=VW;c.height=VH;}lctx.imageSmoothingEnabled=false;}
const lightC=document.createElement('canvas'),lctx=lightC.getContext('2d');
const fogC=document.createElement('canvas'),fctx=fogC.getContext('2d');
const fxC=document.createElement('canvas'),xctx=fxC.getContext('2d');
// ---------- sprites
const IMG={};
function loadImages(list,prog){let done=0;return Promise.all(list.map(src=>new Promise(res=>{const im=new Image();im.onload=()=>{IMG[src]=im;prog&&prog(++done,list.length);res();};im.onerror=()=>{prog&&prog(++done,list.length);res();};im.src=src;})));}
function drawSpr(name,x,y,clip,dir,frame,o){const m=SPR[name];if(!m)return;const im=IMG[m.src];if(!im)return;o=o||{};
  let sx=0,sy=0;if(m.clips){const c=(m.clips[clip]||m.clips.idle||Object.values(m.clips)[0]);const r=c[dir]||c.S||Object.values(c)[0];sy=r[0]*m.fh;sx=((frame|0)%r[1])*m.fw;}
  const g=o.ctx||ctx2;const dx=Math.round(x-m.ax),dy=Math.round(y-m.ay);
  if(o.alpha!==undefined)g.globalAlpha=o.alpha;
  if(o.flip){g.save();g.translate(Math.round(x)*2,0);g.scale(-1,1);g.drawImage(im,sx,sy,m.fw,m.fh,dx,dy,m.fw,m.fh);g.restore();}
  else if(o.scale&&o.scale!==1){const s=o.scale;g.drawImage(im,sx,sy,m.fw,m.fh,Math.round(x-m.ax*s),Math.round(y-m.ay*s),Math.round(m.fw*s),Math.round(m.fh*s));}
  else g.drawImage(im,sx,sy,m.fw,m.fh,dx,dy,m.fw,m.fh);
  if(o.alpha!==undefined)g.globalAlpha=1;}
// ---------- ground: LPC autotiles (corner-matched 3x6 blocks)
const CH=256,chunks=new Map();
const TS={grass:['spr/lpc/tiles/terrain.png',0,192],flowers:['spr/lpc/tiles/terrain.png',96,192],dark:['spr/lpc/tiles/terrain.png',192,192],
  dirt:['spr/lpc/tiles/dirt.png',0,0],stone:['spr/lpc/tiles/terrain.png',384,0],water:['spr/lpc/tiles/watergrass.png',0,0],plowed:['spr/lpc/tiles/plowed.png',0,0]};
const PIECE={1:[[0,2]],2:[[2,2]],3:[[1,2]],4:[[0,4]],5:[[0,3]],6:[[0,4],[2,2]],7:[[2,1]],8:[[2,4]],9:[[2,4],[0,2]],10:[[2,3]],11:[[1,1]],12:[[1,4]],13:[[2,0]],14:[[1,0]]};
function drawAuto(g,name,mask,dx,dy,seed){const [src,bx,by]=TS[name];const im=IMG[src];if(!im||!mask)return;
  if(mask===15){const v=seed<.6?[1,3]:[(seed*10|0)%3,5];g.drawImage(im,bx+v[0]*32,by+v[1]*32,32,32,dx,dy,32,32);return;}
  for(const [c,r] of PIECE[mask])g.drawImage(im,bx+c*32,by+r*32,32,32,dx,dy,32,32);}
function maskAt(fn,x,z){return (fn(x,z)?8:0)|(fn(x+1,z)?4:0)|(fn(x,z+1)?2:0)|(fn(x+1,z+1)?1:0);}
function chunk(cx,cz){const k=cx+','+cz;let c=chunks.get(k);if(c)return c;
  c=document.createElement('canvas');c.width=CH;c.height=CH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const N=CH/32,x0=cx*N,z0=cz*N;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const X=x0+i,Z=z0+j,h=hash(X*3+1,Z*7+2);
    drawAuto(g,h>.86?'flowers':'grass',15,i*32,j*32,h);}
  const HW=(x,z)=>Math.abs(z+6)<2.6&&x<-12.5;
  for(const L of ['dark','dirt','stone','water']){const fn=L==='stone'?(x,z)=>LAYERS.stone(x,z)&&!HW(x,z):LAYERS[L];
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const X=x0+i,Z=z0+j;drawAuto(g,L,maskAt(fn,X,Z),i*32,j*32,hash(X+11,Z+5));}}
  // Route 9: the Blender-rendered asphalt strip (rotated to run east-west), ending where the farm lane begins
  const rs=roadStripH();if(rs&&z0*32<(-6+5.2)*32&&(z0+N)*32>(-6-5.2)*32&&x0<-12.5){g.save();g.beginPath();{const ex=(-12.5-x0)*32;g.moveTo(0,0);for(let y=0;y<=CH;y+=4)g.lineTo(ex-Math.round(hash(y+z0*CH,7)*10+fbm(y*.05,z0)*26),y);g.lineTo(0,CH);g.closePath();}g.clip();
    for(let wx=-120;wx<-12.5;wx+=12){const dx=(wx-x0)*32;if(dx>CH||dx+rs.width<0)continue;g.drawImage(rs,dx,(-6-5-z0)*32);}g.restore();}
  chunks.set(k,c);return c;}
let _rsH=null;function roadStripH(){if(_rsH)return _rsH;const m=SPR.road,im=m&&IMG[m.src];if(!im)return null;
  const c=document.createElement('canvas');c.width=im.height;c.height=im.width;const g=c.getContext('2d');g.translate(0,im.width);g.rotate(-Math.PI/2);g.drawImage(im,0,0);return _rsH=c;}
// ---------- camera
const cam={x:0,z:0,shake:0,px:0,pz:0};
// all screen positions come from one integer-snapped camera, so ground and sprites never drift against each other
const sx=x=>Math.round(x*PPM)-cam.px+(VW>>1), sz=z=>Math.round(z*PPM)-cam.pz+Math.round(VH*.56);
// ---------- input
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'||e.code==='KeyE'){e.preventDefault();onAct();}if(e.code==='KeyQ')onSeed();});addEventListener('keyup',e=>keys[e.code]=false);
const joy={x:0,y:0,id:null,ox:0,oy:0};
function setupTouch(){const J=$('joy'),K=$('knob');
  const down=e=>{for(const t of e.changedTouches){if(joy.id!==null)continue;if(t.target.closest&&t.target.closest('button,.sheet,.screen'))continue;
      if(t.clientX>innerWidth*.62&&t.clientY>innerHeight*.55)continue;joy.id=t.identifier;joy.ox=t.clientX;joy.oy=t.clientY;J.style.left=t.clientX+'px';J.style.top=t.clientY+'px';J.classList.add('on');K.style.transform='translate(0,0)';}};
  const move=e=>{for(const t of e.changedTouches){if(t.identifier!==joy.id)continue;let dx=t.clientX-joy.ox,dy=t.clientY-joy.oy;const d=Math.hypot(dx,dy),m=52;if(d>m){dx*=m/d;dy*=m/d;}
      joy.x=dx/m;joy.y=dy/m;K.style.transform=`translate(${dx}px,${dy}px)`;e.preventDefault();}};
  const up=e=>{for(const t of e.changedTouches){if(t.identifier!==joy.id)continue;joy.id=null;joy.x=joy.y=0;J.classList.remove('on');}};
  addEventListener('touchstart',down,{passive:true});addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up);addEventListener('touchcancel',up);
  // mouse drag fallback
  let md=false;addEventListener('mousedown',e=>{if(e.target!==view)return;md=true;joy.ox=e.clientX;joy.oy=e.clientY;});
  addEventListener('mousemove',e=>{if(!md)return;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),m=60;if(d>m){dx*=m/d;dy*=m/d;}joy.x=dx/m;joy.y=dy/m;});
  addEventListener('mouseup',()=>{md=false;joy.x=joy.y=0;});}
// ---------- lighting
const AMB=[[0,[22,26,52]],[4.5,[24,28,56]],[6,[150,120,130]],[7.5,[235,226,214]],[9,[255,252,244]],[16,[255,248,236]],[17.6,[250,196,150]],[18.8,[170,104,112]],[19.8,[62,52,92]],[20.6,[26,30,62]],[26,[18,22,48]]];
function ambient(h){let i=0;while(i<AMB.length-2&&AMB[i+1][0]<=h)i++;const a=AMB[i],b=AMB[i+1];const t=smooth(clamp((h-a[0])/(b[0]-a[0]),0,1));return a[1].map((v,k)=>v+(b[1][k]-v)*t);}
function glowAt(x,y,r,col,a){const g=lctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);g.addColorStop(.45,`rgba(${col[0]},${col[1]},${col[2]},${a*.45})`);g.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
  lctx.fillStyle=g;lctx.fillRect(x-r,y-r,r*2,r*2);}
function coneAt(x,y,ang,spread,len,col,a){lctx.save();lctx.beginPath();lctx.moveTo(x,y);const n=14;for(let i=0;i<=n;i++){const t=ang-spread+spread*2*i/n;lctx.lineTo(x+Math.cos(t)*len,y+Math.sin(t)*len*.92);}lctx.closePath();lctx.clip();
  const g=lctx.createRadialGradient(x,y,4,x,y,len);g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);g.addColorStop(.55,`rgba(${col[0]},${col[1]},${col[2]},${a*.55})`);g.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
  lctx.fillStyle=g;lctx.fillRect(x-len,y-len,len*2,len*2);lctx.restore();}
// ---------- particles (pixel squares)
const parts=[];
function burst(x,z,n,col,spd,life,up,size){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=spd*(.3+Math.random()*.7);parts.push({x,z,y:0,vx:Math.cos(a)*s,vz:Math.sin(a)*s*.6,vy:(up||1)*(1+Math.random()),t:0,life:life*(.6+Math.random()*.6),col,size:size||1});}}
function partsUpdate(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue;}p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=dt*4;if(p.y<0){p.y=0;p.vy*=-.3;p.vx*=.6;p.vz*=.6;}}}
function partsDraw(){for(const p of parts){const x=Math.round(sx(p.x)),y=Math.round(sz(p.z)-p.y*PPM);ctx2.globalAlpha=1-p.t/p.life;ctx2.fillStyle=p.col;ctx2.fillRect(x,y,p.size,p.size);}ctx2.globalAlpha=1;}
// ---------- fog/noise textures
let fogTex=null,grainTex=null;
function makeFog(){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');const id=g.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const v=fbm(x/38,y/38)*.8+fbm(x/12+5,y/12)*.2;const a=clamp((v-.42)*2.4,0,1);const o=(y*256+x)*4;id.data[o]=170;id.data[o+1]=176;id.data[o+2]=196;id.data[o+3]=a*140;}
  g.putImageData(id,0,0);fogTex=c;
  const n=document.createElement('canvas');n.width=128;n.height=128;const ng=n.getContext('2d');const nd=ng.createImageData(128,128);
  for(let i=0;i<128*128;i++){const v=Math.random()*255;nd.data[i*4]=nd.data[i*4+1]=nd.data[i*4+2]=v;nd.data[i*4+3]=22;}ng.putImageData(nd,0,0);grainTex=n;}
