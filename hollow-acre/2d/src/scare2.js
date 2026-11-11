/* ================= the jump scare, rebuilt: sudden, close, and alive. The face doesn't fade in: it is there, too big, and
   it moves. A white frame on impact, then the rotting pumpkin fills the screen: its carved eyes flare from embers to white-hot,
   the mouth tears open wider than a carving can, needle teeth top and bottom, the shell splitting from the corners; grey
   fingers curl round the edges of the screen as if it's holding the glass; static and torn scanlines over it. Drawn by code at
   192x256, pixel by pixel, lit from the upper left like everything else. The creature itself also uses its new animations. ================= */
const SC={W:192,H:256,base:null,t0:0,dur:.4,raf:0,seed:0};
// the shell's own ramp — the Hollow's rotting red-brown pumpkin (#4e1e12..#b06a34), NOT a bright Halloween orange, so the face that lunges is the creature you meet
const SCR=(()=>{const c=['#0a0405','#15070a','#22100e','#301612','#421c14','#542617','#66321c','#7a4222','#8a5230'];return c.map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);})();
// the pumpkin itself, lit and ribbed and rotting, drawn once
function scareBase(){if(SC.base)return SC.base;const {W,H}=SC;const id=new ImageData(W,H),D=id.data;const cx=96,cy=126,rx=86,ry=96;const L=[-.5,-.6,.62];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;const u=(x+.5-cx)/rx,v=(y+.5-cy)/ry,d=u*u+v*v;
    if(d>1){const vg=Math.max(0,1-Math.hypot((x-cx)/120,(y-cy)/150));D[i]=8+vg*30;D[i+1]=2+vg*4;D[i+2]=3+vg*4;D[i+3]=255;continue;}
    const nz=Math.sqrt(1-d);const ang=Math.atan2(u,nz);const rib=Math.cos(ang*8);
    let l=.14+Math.max(0,u*L[0]+v*L[1]+nz*L[2])*.70-.28*Math.max(0,-rib)+.07*Math.max(0,rib)-.18*Math.max(0,v-.4);
    if(d>.9)l*=.55;
    let k=Math.max(0,Math.min(8,Math.round(l*8)));let col=SCR[k];
    const rot=fbm(x*.06,y*.06)*.7+hash(x>>1,(y>>1)+7)*.3;
    if(rot>.62&&v>-.2+fbm(x*.03+4,y*.03)*.3){col=[24+k*3,22+k*3,10+k];}   // rot: irregular, wet, creeping up from below                                   // rot: wet, grey-green, spreading up from below
    if(l>.92&&hash(x>>1,y)>.55&&u<-.1&&v<-.1)col=[196,150,96];                         // a dim wet sheen on the lit side (muted, not a bright orange flash)
    D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255;}
  // the stem, crooked, and dead vine
  for(let y=0;y<34;y++)for(let x=0;x<16;x++){const px=88+x+Math.round(y*.25),py=10+y;if(Math.abs(x-8)>6-y*.05)continue;const i=(py*W+px)*4;const s=x<5?72:x<11?52:34;D[i]=s;D[i+1]=s*.8;D[i+2]=s*.45;}
  SC.base=id;return id;}
drawScare=function(k){const c=$('scare');const {W,H}=SC;if(c.width!==W){c.width=W;c.height=H;}const g=c.getContext('2d');g.imageSmoothingEnabled=false;k=k==null?1:k;
  if(k<.07){g.fillStyle='#fff8f0';g.fillRect(0,0,W,H);return;}   // the white frame on impact
  g.putImageData(scareBase(),0,0);const cx=96,cy=126,rx=86,ry=96;const t=performance.now()/1000;
  const jaw=Math.min(1,Math.max(0,(k-.1)/.45)),flare=Math.min(1,k*2)*(.8+.2*Math.sin(t*40));
  // the glow leaking out of every hole onto the shell around it
  const glow=(x,y,r,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(255,120,30,${a})`);gr.addColorStop(1,'rgba(255,60,10,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);};
  // the eyes: slanted, deep, the carved wall of the shell visible inside, embers that flare white
  for(const s of [-1,1]){const pts=[[-.64*s,-.42],[-.14*s,-.14],[-.56*s,.06]].map(([u,v])=>[cx+u*rx,cy+v*ry]);
    glow(cx+s*-.44*rx,cy-.16*ry,30,.35*flare);
    g.fillStyle='#9a5a2c';g.beginPath();g.moveTo(...pts[0]);g.lineTo(...pts[1]);g.lineTo(...pts[2]);g.closePath();g.fill();   // the cut flesh of the shell
    const inner=pts.map(([x,y])=>[x+(cx-s*.44*rx-x)*.18,y+(cy-.16*ry-y)*.18+2]);
    g.fillStyle='#070102';g.beginPath();g.moveTo(...inner[0]);g.lineTo(...inner[1]);g.lineTo(...inner[2]);g.closePath();g.fill();
    const ex=cx-s*.42*rx,ey=cy-.15*ry;const er=7+flare*5;const eg=g.createRadialGradient(ex,ey,0,ex,ey,er);
    eg.addColorStop(0,flare>.8?'#ffffff':'#fff2b0');eg.addColorStop(.35,'#ffb030');eg.addColorStop(.75,'#ff4010');eg.addColorStop(1,'rgba(120,10,0,0)');g.fillStyle=eg;g.fillRect(ex-er,ey-er,er*2,er*2);
    g.fillStyle='#120000';g.fillRect(Math.round(ex)-1,Math.round(ey-er*.7),2,Math.round(er*1.4));}   // a slit of a pupil
  // the mouth: a jagged tear that opens wider than any carving; needle teeth above and below; a throat that burns
  const top=x=>cy+.26*ry+Math.sin(x*.31)*3+Math.sin(x*.13)*2,mh=12+jaw*62,x0=cx-.66*rx,x1=cx+.66*rx;
  glow(cx,cy+.38*ry+jaw*20,46,.45);
  g.fillStyle='#76381a';g.beginPath();g.moveTo(x0,top(x0));for(let x=x0;x<=x1;x+=4)g.lineTo(x,top(x)-2);for(let x=x1;x>=x0;x-=4)g.lineTo(x,top(x)+mh*(1-Math.pow((x-cx)/(x1-cx),2)*.6)+3);g.closePath();g.fill();
  const th=g.createLinearGradient(0,top(cx),0,top(cx)+mh);th.addColorStop(0,'#0a0102');th.addColorStop(.55,'#3a0604');th.addColorStop(1,'#ff5a14');g.fillStyle=th;
  g.beginPath();g.moveTo(x0+3,top(x0));for(let x=x0+3;x<=x1-3;x+=4)g.lineTo(x,top(x));for(let x=x1-3;x>=x0+3;x-=4)g.lineTo(x,top(x)+mh*(1-Math.pow((x-cx)/(x1-cx),2)*.6));g.closePath();g.fill();
  for(let x=x0+6;x<x1-4;x+=7){const w=(x-cx)/(x1-cx),len=(9+((x*7)%5)*2)*(1-w*w*.5);const yt=top(x),yb=top(x)+mh*(1-Math.pow(w,2)*.6);
    for(const [y0,dir] of [[yt,1],[yb,-1]]){for(let j=0;j<len;j++){const ww=Math.max(1,3-j*3/len);g.fillStyle=j<2?'#bfb490':'#efe6c8';g.fillRect(Math.round(x-ww/2),Math.round(y0+dir*j),Math.ceil(ww),1);}}}
  if(jaw>.55){g.strokeStyle='#160402';g.lineWidth=2;for(const s of [-1,1]){g.beginPath();let px=cx+s*.66*rx,py=top(px)+mh*.2;g.moveTo(px,py);for(let n=0;n<6;n++){px+=s*(5+n*2);py+=(n%2?-1:1)*7-(jaw-.55)*6;g.lineTo(px,py);}g.stroke();}}
  // fingers round the edges of the screen, as if it's holding the glass
  if(k>.3){const kk=Math.min(1,(k-.3)/.3);for(const s of [-1,1])for(let f=0;f<4;f++){const yy=78+f*22+(s>0?8:0),len=(26+f%2*8)*kk;let x=s<0?0:W,y=yy;const segs=[.45,.35,.2];g.lineCap='round';
      for(let q=0;q<3;q++){const a=(s<0?0:Math.PI)+(s<0?1:-1)*(q*.55)+(f-1.5)*.05;const nx=x+Math.cos(a)*len*segs[q],ny=y+Math.sin(a)*len*segs[q];
        g.strokeStyle='#0c100e';g.lineWidth=7-q;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();g.strokeStyle=q===0?'#4a564e':'#6a786e';g.lineWidth=4.5-q;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();
        g.fillStyle='#8a968c';g.fillRect(Math.round(x),Math.round(y)-1,2,1);x=nx;y=ny;}
      g.fillStyle='#d6d0b8';g.fillRect(Math.round(x)-1,Math.round(y)-1,3,2);}}   // the nail
  // static, torn scanlines, the edges going dark
  const id=g.getImageData(0,0,W,H),D=id.data;SC.seed=(SC.seed+1)%9973;
  for(let y=0;y<H;y++){const tear=(hash(y>>2,SC.seed)>.94)?Math.round((hash(y,SC.seed+3)-.5)*14):0;
    if(tear){const row=D.slice(y*W*4,(y+1)*W*4);for(let x=0;x<W;x++){const sx_=Math.min(W-1,Math.max(0,x-tear));D[(y*W+x)*4]=row[sx_*4];D[(y*W+x)*4+1]=row[sx_*4+1];D[(y*W+x)*4+2]=row[sx_*4+2];}}
    for(let x=0;x<W;x++){const i=(y*W+x)*4;const n=hash(x+SC.seed*13,y)*(k<.35?.5:.18);if(n>.12){const v=n*255;D[i]=D[i]*.6+v*.4;D[i+1]=D[i+1]*.6+v*.35;D[i+2]=D[i+2]*.6+v*.35;}
      const vg=Math.hypot((x-96)/110,(y-128)/150);if(vg>.75){const m=Math.max(.2,1-(vg-.75)*2.2);D[i]*=m;D[i+1]*=m;D[i+2]*=m;}
      if(y%3===0){D[i]*=.86;D[i+1]*=.86;D[i+2]*=.86;}}}
  g.putImageData(id,0,0);c.style.imageRendering='pixelated';};
// faceSlam keeps it alive while it's on screen: the face moves for as long as it's there
{const _fs=faceSlam;faceSlam=function(dur,loud){SC.t0=performance.now();SC.dur=dur||.38;_fs.apply(this,arguments);cancelAnimationFrame(SC.raf);
  const tick=()=>{const c=$('scare');if(c.hidden)return;const k=Math.min(1,(performance.now()-SC.t0)/1000/Math.max(.3,Math.min(SC.dur,1.2)));drawScare(k);SC.raf=requestAnimationFrame(tick);};tick();};}
