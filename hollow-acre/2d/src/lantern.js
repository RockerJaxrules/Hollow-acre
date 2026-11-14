/* ================= the lantern: after dark it hangs from your belt, swings as you walk, and lights a round, flickering pool
   around you (a lantern, not a torch beam). The light itself is drawn in main.js's light pass with these helpers. ================= */
// the belt hook, in screen pixels from your feet, for each way you can face (the hip nearest the camera)
const LANTERN_HIP={S:[6,-10],N:[-6,-10],E:[2,-10],W:[-2,-10]};
const LANT={sw:0,v:0,px:null,pz:null,t:0};
// a small pendulum: it swings back when you start walking, bobs with your steps and settles when you stop
function lanternSwing(){const now=performance.now()/1000;const dt=Math.min(.05,now-(LANT.t||now));LANT.t=now;if(dt<=0)return;
  const vx=LANT.px==null?0:(P.x-LANT.px)/dt,vz=LANT.pz==null?0:(P.z-LANT.pz)/dt;LANT.px=P.x;LANT.pz=P.z;
  const moving=Math.hypot(vx,vz)>.4;const target=clamp(-vx/7,-.8,.8)+(moving?Math.sin(P.t*10)*.28:0);
  LANT.v+=((target-LANT.sw)*70-LANT.v*6)*dt;LANT.sw=clamp(LANT.sw+LANT.v*dt,-1.2,1.2);}
function lanternPos(){const X=sx(P.x),Y=sz(P.z);const h=LANTERN_HIP[P.dir]||LANTERN_HIP.S;const hx=Math.round(X+h[0]),hy=Math.round(Y+h[1]);
  return {hx,hy,x:hx+LANT.sw*1.6,y:hy+5,gx:X,gy:Y-2};}
// the flame's flutter, about -1..1
function lanternFlicker(t){return .6*Math.sin(t*7.3)+.3*Math.sin(t*13.1+1.7)+.1*Math.sin(t*23.7+.4)+(Math.random()-.5)*.12;}
// a soft ground pool: an ellipse (the ground is seen at an angle), bright in the middle, gone by its edge
function lanternPool(x,y,r,col,a){if(!(a>0))return;lctx.save();lctx.translate(x,y);lctx.scale(1,.78);const g=lctx.createRadialGradient(0,0,0,0,0,r);const c=`${col[0]},${col[1]},${col[2]}`;
  g.addColorStop(0,`rgba(${c},${a})`);g.addColorStop(.18,`rgba(${c},${a*.88})`);g.addColorStop(.42,`rgba(${c},${a*.5})`);g.addColorStop(.68,`rgba(${c},${a*.18})`);g.addColorStop(1,`rgba(${c},0)`);
  lctx.fillStyle=g;lctx.fillRect(-r,-r,r*2,r*2);lctx.restore();}
// the lantern itself: a brass cap and base, a wire bail, and glass with a flame in it
const LANTERN_ART=[
  '...k...',
  '..k.k..',
  '..kbk..',
  '.kbBbk.',
  'kbBBBbk',
  'kgfFfgk',
  'kgFWFgk',
  'kgfFfgk',
  'kgffegk',
  'kbBBBbk',
  '.kbbbk.',
  '..kkk..'];
const LANTERN_PAL={lit:{k:'#24160c',b:'#8a6428',B:'#c8a050',g:'#e8b860',f:'#ff9a2a',F:'#ffd060',W:'#fff6d0',e:'#c86a18'},
  dark:{k:'#24160c',b:'#6a4c22',B:'#9a7c44',g:'#3c4048',f:'#4a4c54',F:'#585a62',W:'#6a6c74',e:'#44464e'}};
const LANTERN_CV={};
function lanternCanvas(lit,fk){const key=(lit?'L':'D')+(lit?(fk>.35?2:fk<-.35?0:1):0);if(LANTERN_CV[key])return LANTERN_CV[key];
  const pal=LANTERN_PAL[lit?'lit':'dark'];const c=document.createElement('canvas');c.width=7;c.height=LANTERN_ART.length;const g=c.getContext('2d');
  LANTERN_ART.forEach((row,y)=>{for(let x=0;x<row.length;x++){let ch=row[x];if(ch==='.')continue;
    // the flame's tip moves with the flicker
    if(lit&&ch==='W'&&key.endsWith('0'))ch='F';if(lit&&ch==='f'&&y===5&&key.endsWith('2'))ch='F';
    g.fillStyle=pal[ch]||'#f0f';g.fillRect(x,y,1,1);}});
  return LANTERN_CV[key]=c;}
function lanternShown(){return S.mode!=='title'&&S.mode!=='scare'&&nightK>.15&&!(typeof S.lanternStowed!=='undefined'&&S.lanternStowed);}
// drawn right after the player's sprite; each row leans a little further with the swing so it stays crisp pixels
function lanternDraw(g,clip,t){lanternSwing();if(!lanternShown()||clip==='hurt'||clip==='sit')return;
  const lp=lanternPos();const lit=lanternOn();const cv=lanternCanvas(lit,lit?lanternFlicker(t):0);const H=cv.height;
  for(let y=0;y<H;y++){const dx=Math.round(LANT.sw*1.8*(y/H));g.drawImage(cv,0,y,7,1,lp.hx-3+dx,lp.hy-1+y,7,1);}}
