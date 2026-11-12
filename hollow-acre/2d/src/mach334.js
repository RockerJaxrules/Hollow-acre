/* ================= t334 machines for the farm. The owner: "there should be more automation than just a tractor, machinery,
   all this stuff". Five machines from the farm book's new Machines page, each set down in the yard in building mode, each
   seen at work, and each needing something to keep it going:
   - THE WINDMILL: a steel wheel on a lattice tower, pumping into a stock tank. Every morning it waters the growing crops
     nearest to it (up to sixty squares). It wants a tin of axle grease every seven mornings or it seizes.
   - THE FEED MILL: a kerosene engine belted to a burr mill. Load barley or corn in the hopper: at dawn it grinds laying mash
     (two grain a sack) or flour (three barley a sack, worth more than the barley). One can of kerosene a working day.
   - THE HEN FEEDER: a hopper feeder and a water fount by the coop. Keep sacks of mash in it and the hens lay half again.
   - THE MILKING MACHINE: a vacuum pump and a bucket milker by the barn. It milks every cow at dawn, more than hands get, into
     a cooler that keeps thirty bottles. One can of kerosene a working day.
   - THE SEED CLEANER: a fanning mill. Load a crop and it cleans seed from it, two seeds a head, into the hands' seed box (or
     your pocket). A farmhand cranks it at dawn; if you have none, crank it yourself.
   Kerosene and grease come from Pruitt's garage, laying mash from Bell's Feed & Stock (or your own mill). In multiplayer the
   host's farm runs the machines; anyone's purchase, loading or fuelling goes to the host's farm. ================= */
const MC34P={
  steel:['#1f2228','#3c414b','#5d636e','#878e98','#b6bcc2'],
  wood:['#24170f','#432b1b','#674329','#8d6239','#b48752'],
  red:['#33100d','#5e1a14','#8c281c','#b8402a','#d9694a'],
  green:['#13201a','#21392a','#355636','#4f7745','#77995c'],
  iron:['#121214','#212328','#363a42','#545a63','#7c818a'],
  water:['#16222e','#223a4c','#34596e','#5a8296','#9cc0cc'],
  burlap:['#3a2c1a','#5e4a2e','#86704a','#ab9468','#cdb98a'],
  grain:['#5a3e14','#8a6420','#b88a34','#dcb45a','#f0d488'],
  cloth:['#5c5850','#8a8478','#b4ae9e','#d8d2c0','#f2eee0'],
  leather:['#22140c','#3e2616','#5e3c22','#7e5630'],
  brass:['#3e2a0c','#6e4e18','#a07a2c','#cca450','#ecd68a'],
  rust:['#3a1e0e','#5e3418','#86502a','#a8703e']};
// ---------------------------------------------------------------- the drawing kit: a canvas, pixels, shapes, one outline, a shadow
function mc34Kit(W,H){const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const K={c,g,W,H,
    px(x,y,w,h,col){if(!col)return;g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w||1,h||1);},
    line(x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
      for(;;){K.px(x0,y0,1,1,typeof col==='function'?col(x0,y0):col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}},
    // filled ellipse; fn(x,y,nx,ny,d) gives each pixel's colour (nx,ny in -1..1, d the normalised radius)
    ell(cx,cy,rx,ry,fn){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){const nx=(x+.5-cx)/rx,ny=(y+.5-cy)/ry,d=Math.hypot(nx,ny);if(d>1)continue;const col=fn(x,y,nx,ny,d);if(col)K.px(x,y,1,1,col);}},
    poly(pts,fn){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(const [x,y] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
      for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++){let ins=false;for(let a=0,b=pts.length-1;a<pts.length;b=a++){const [xa,ya]=pts[a],[xb,yb]=pts[b];if((ya>y+.5)!==(yb>y+.5)&&x+.5<(xb-xa)*(y+.5-ya)/(yb-ya)+xa)ins=!ins;}
        if(ins){const col=typeof fn==='function'?fn(x,y):fn;if(col)K.px(x,y,1,1,col);}}},
    // one outline round everything drawn so far: a dark version of the colour it borders, a step lighter on the lit top-left
    outline(){const D=g.getImageData(0,0,W,H),d=D.data,out=[];const A=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&d[(y*W+x)*4+3]>40;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(A(x,y))continue;let src=null,lit=false;
        for(const [dx,dy,l] of [[1,0,1],[0,1,1],[-1,0,0],[0,-1,0]]){if(A(x+dx,y+dy)){src=((y+dy)*W+x+dx)*4;lit=!!l;break;}}
        if(src!==null){const k=lit?.5:.32;out.push([x,y,`rgb(${Math.round(d[src]*k+8)},${Math.round(d[src+1]*k+4)},${Math.round(d[src+2]*k+12)})`]);}}
      for(const [x,y,col] of out)K.px(x,y,1,1,col);},
    // the drop shadow: one flat ellipse under the foot, pushed down and right, behind everything
    shadow(cx,cy,rx,ry){g.save();g.globalCompositeOperation='destination-over';g.globalAlpha=.6;K.ell(cx,cy,rx,ry,()=>'#322125');g.restore();},
    // draw another canvas over this one (layers)
    put(c2,x,y){g.drawImage(c2,x||0,y||0);}};
  return K;}
// a ramp step by a light value 0..1 (0 dark) clamped to the ramp
const mc34R=(ramp,v)=>ramp[Math.max(0,Math.min(ramp.length-1,Math.round(v*(ramp.length-1))))];
const mc34Hash=(a,b)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};

// ---------------------------------------------------------------- THE WINDMILL (76 x 132; four frames of the wheel turning)
const MC34_WIND={W:76,H:132,gy:126};
function mc34DrawWind(f,still){const {W,H,gy}=MC34_WIND,S_=MC34P.steel,TX=28;
  // the lattice tower, drawn without an outline (thin steel would go heavy), behind the solid parts
  const L=mc34Kit(W,H);
  const legX=(x0,x1,y)=>x0+(x1-x0)*((gy-y)/(gy-36));
  const legs=[[11,TX-3],[45,TX+3]],back=[[17,TX-2],[39,TX+2]];
  for(const [a,b] of back)L.line(a,gy-4,b,38,S_[1]);
  // girts and braces between the front legs
  const lv=[gy-14,gy-32,gy-50,gy-68,gy-84];
  for(let i=0;i<lv.length;i++){const y=lv[i],xa=legX(11,TX-3,y),xb=legX(45,TX+3,y);L.line(xa,y,xb,y,S_[3]);L.line(xa,y+1,xb,y+1,S_[1]);
    const y2=i+1<lv.length?lv[i+1]:40,xa2=legX(11,TX-3,y2),xb2=legX(45,TX+3,y2);L.line(xa+1,y-1,xb2-1,y2+2,S_[2]);L.line(xb-1,y-1,xa2+1,y2+2,S_[1]);}
  for(const [a,b] of legs){const lit=a<TX;L.line(a,gy,b,36,lit?S_[4]:S_[2]);L.line(a+1,gy,b+1,36,lit?S_[2]:S_[1]);L.line(a+(lit?-1:2),gy,b+(lit?-1:2),36,S_[0]);}
  // footings: four concrete pads
  for(const x of [10,44])L.px(x-1,gy,5,2,'#6c6a66'),L.px(x-1,gy+1,5,1,'#4a4844');
  // the pump rod down the middle of the tower, bobbing with the wheel
  const bob=still?0:(f%2?2:0);L.line(TX,40,TX,gy-18,S_[3]);L.px(TX-1,42+bob,3,2,S_[1]);
  // the solid parts: wheel, head, vane, platform, pump, pipe, tank
  const K=mc34Kit(W,H);
  // tail vane (behind the wheel): an arm out to the right and a painted sheet
  K.line(TX+4,22,TX+28,15,S_[2]);K.line(TX+4,23,TX+28,16,S_[1]);
  K.poly([[TX+24,7],[TX+42,4],[TX+42,22],[TX+24,19]],(x,y)=>{const t=(x-TX-24)/18,u=(y-4)/18;return y<8+(x-TX-24)*-.15+1?MC34P.red[4]:mc34R(MC34P.red,.85-t*.35-u*.25);});
  K.px(TX+28,10,9,1,MC34P.cloth[3]);K.px(TX+28,13,6,1,MC34P.cloth[3]);K.px(TX+35,13,2,1,MC34P.cloth[3]);   // stencilled strokes, not letters
  // the platform under the head
  K.px(TX-9,37,19,2,MC34P.wood[3]);K.px(TX-9,39,19,1,MC34P.wood[1]);
  // gearbox head behind the hub
  K.px(TX-2,24,12,8,S_[1]);K.px(TX-2,24,12,2,S_[2]);
  // the wheel: sixteen curved blades between two rings, turning a quarter of a blade a frame
  const cx=TX,cy=21,Ro=19.5,Ri=6,N=16,rot=(still?0:f)*(Math.PI*2/N)/4;
  K.ell(cx,cy,Ro,Ro,(x,y,nx,ny,d)=>{const r=d*Ro;let a=Math.atan2(ny,nx)+rot;a=((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);const fr=(a/(Math.PI*2/N))%1;
    const tl=-(nx*.7+ny*.7)*.18;   // the upper left of the wheel catches the light
    if(r>Ro-1.3)return nx+ny<-.3?S_[4]:nx+ny<.5?S_[3]:S_[2];
    if(r<Ri+1.2&&r>=Ri)return S_[2];
    if(r<Ri){return r<2?S_[0]:r<3.2?(nx+ny<0?S_[3]:S_[1]):S_[1];}
    const v=fr<.12?.15:fr<.5?.82:fr<.8?.6:.38;return mc34R(S_,v+tl);});
  // the pump at the foot, its spout and the pipe over to the tank
  const pb=gy-16;K.px(TX-3,pb,7,14,S_[2]);K.px(TX-3,pb,2,14,S_[3]);K.px(TX+2,pb,2,14,S_[1]);K.px(TX-4,pb-2,9,2,S_[1]);K.px(TX-4,pb-2,9,1,S_[3]);
  K.px(TX-4,gy-2,9,2,S_[1]);
  K.px(TX+4,pb+3,16,2,S_[2]);K.px(TX+4,pb+3,16,1,S_[3]);K.px(TX+19,pb-1,2,6,S_[2]);K.px(TX+19,pb-1,1,6,S_[3]);
  // the stock tank: a round galvanised trough, its side in broad ribs, water inside
  const tx=60,ty=gy-14,rx=13,ry=4,hgt=12;
  for(let x=tx-rx;x<=tx+rx;x++){const nx=(x+.5-tx)/rx;if(Math.abs(nx)>1)continue;const yTop=ty+Math.sqrt(1-nx*nx)*ry,yBot=ty+hgt+Math.sqrt(1-nx*nx)*ry;
    const rib=Math.floor((x-tx+rx)/4)%2,v=.78-nx*.35-(rib?.12:0);for(let y=Math.floor(yTop);y<=yBot;y++)K.px(x,y,1,1,mc34R(S_,v-(y>yBot-2?.15:0)));}
  K.ell(tx,ty,rx,ry,(x,y,nx,ny,d)=>d>.8?(ny<0?S_[2]:S_[4]):null);
  K.ell(tx,ty,rx-1.5,ry-1,(x,y,nx,ny,d)=>ny<-.35&&nx<.4?MC34P.water[3]:d>.75&&ny>0?MC34P.water[1]:MC34P.water[2]);
  K.outline();
  // water from the pipe into the tank (no outline: it's water)
  if(!still){for(let i=0;i<3;i++){const y=pb+5+((f*2+i*3)%7);K.px(TX+20,y,1,2,MC34P.water[4]);}
    const rr=(f%4)+1;K.ell(TX+20,ty+1,rr+1,rr*.45,(x,y,nx,ny,d)=>d>.7?MC34P.water[4]:null);}
  const O=mc34Kit(W,H);O.put(L.c);O.put(K.c);O.shadow(36,gy+1,30,4);return O.c;}

// ---------------------------------------------------------------- THE FEED MILL (88 x 62; six frames: flywheel, belt, exhaust, meal)
const MC34_MILL={W:88,H:62,gy:56};
// a spoked wheel seen face-on: rim, n spokes turned by rot, hub
function mc34Wheel(K,cx,cy,r,n,rot,ramp,rimW){rimW=rimW||2;K.ell(cx,cy,r,r,(x,y,nx,ny,d)=>{const rr=d*r,tl=nx+ny;
    if(rr>r-rimW)return tl<-.5?ramp[4]:tl<.3?ramp[3]:ramp[2];
    if(rr<2.2)return rr<1.2?ramp[0]:(tl<0?ramp[4]:ramp[2]);
    let a=Math.atan2(ny,nx)-rot;a=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n);const off=Math.min(a,Math.PI*2/n-a)*rr;
    if(off<.75)return tl<0?ramp[3]:ramp[2];return null;});}
function mc34DrawMill(f,still){const {W,H,gy}=MC34_MILL,G=MC34P.green,I=MC34P.iron,Wd=MC34P.wood,R=MC34P.red,Gr=MC34P.grain,Bu=MC34P.burlap,Le=MC34P.leather;
  const K=mc34Kit(W,H),fr=still?0:f;
  // wooden skids under the engine and a stand under the mill
  K.px(4,gy-6,40,4,Wd[3]);K.px(4,gy-6,40,1,Wd[4]);K.px(4,gy-2,40,2,Wd[1]);K.px(4,gy-6,2,6,Wd[2]);K.px(42,gy-6,2,6,Wd[1]);
  for(const x of [54,74]){K.px(x,gy-14,3,14,Wd[2]);K.px(x,gy-14,1,14,Wd[3]);}K.px(52,gy-16,28,3,Wd[3]);K.px(52,gy-16,28,1,Wd[4]);K.line(56,gy-2,76,gy-12,Wd[1]);
  // the engine: a green base, a horizontal cylinder with its open water hopper, the muffler up top
  K.px(12,gy-18,30,12,G[2]);K.px(12,gy-18,30,2,G[3]);K.px(12,gy-8,30,2,G[1]);K.px(40,gy-18,2,12,G[1]);
  K.px(16,gy-30,22,13,G[2]);K.px(16,gy-30,22,2,G[4]);K.px(16,gy-28,3,11,G[3]);K.px(35,gy-28,3,11,G[1]);
  for(let i=0;i<4;i++)K.px(20+i*4,gy-24,2,6,G[1]);   // cooling ribs: dark slots, not stripes everywhere
  K.px(17,gy-36,16,6,G[2]);K.px(17,gy-36,16,1,G[4]);K.px(18,gy-35,14,2,MC34P.water[1]);K.px(18,gy-35,6,1,MC34P.water[3]);   // the water hopper, open on top
  K.px(33,gy-46,3,16,I[2]);K.px(33,gy-46,1,16,I[3]);K.px(31,gy-50,7,5,I[2]);K.px(31,gy-50,7,1,I[4]);K.px(31,gy-46,7,1,I[1]);   // exhaust pipe and muffler
  // the engine's belt pulley at its right end
  mc34Wheel(K,44,gy-24,4.5,3,fr*Math.PI/9,I,1.5);
  // the burr mill: a red cast body on the stand, its pulley, the wooden hopper heaped with grain, the spout and a sack
  K.poly([[56,gy-34],[76,gy-34],[78,gy-30],[78,gy-17],[56,gy-17]],(x,y)=>y<gy-32?R[4]:x<59?R[3]:x>75?R[1]:R[2]);
  K.px(56,gy-20,22,3,R[1]);K.px(60,gy-28,12,1,R[1]);K.px(60,gy-27,12,1,R[3]);   // a cast rib and the casting line
  K.poly([[55,gy-50],[79,gy-50],[73,gy-34],[61,gy-34]],(x,y)=>{const t=(x-55)/24;return y<gy-48?Wd[4]:t<.25?Wd[3]:t>.8?Wd[1]:Wd[2];});
  for(let y=gy-46;y<gy-35;y+=4)K.line(57+(y-gy+50)*.25,y,77-(y-gy+50)*.25,y,Wd[1]);   // board seams across the hopper
  K.ell(67,gy-50,11.5,3,(x,y,nx,ny,d)=>ny<-.2&&nx<.3?Gr[4]:d>.8?Gr[1]:Gr[2+((x+y)%5===0?1:0)]);   // grain heaped in it
  K.ell(67,gy-52,7,2.2,(x,y,nx,ny)=>nx<0?Gr[4]:Gr[3]);
  mc34Wheel(K,58,gy-28,6.5,4,-fr*Math.PI/12,I,1.5);
  K.poly([[76,gy-22],[81,gy-19],[81,gy-15],[77,gy-17]],(x,y)=>y<gy-19?R[3]:R[1]);   // spout
  // the sack under the spout: a rolled mouth, meal heaped above it
  K.poly([[74,gy-12],[86,gy-12],[87,gy-1],[73,gy-1]],(x,y)=>{const t=(x-73)/14;return t<.25?Bu[3]:t>.78?Bu[1]:Bu[2];});
  K.px(73,gy-13,14,3,Bu[4]);K.px(73,gy-11,14,1,Bu[1]);K.ell(80,gy-14,5,2,(x,y,nx)=>nx<0?MC34P.cloth[4]:MC34P.cloth[3]);
  // the flywheel in front of the engine, last so nothing crosses it
  mc34Wheel(K,14,gy-22,13.5,6,fr*Math.PI/18,I,3);
  K.outline();
  // the belt (no outline: it's thin leather): two runs between the pulleys, a pale mark travelling along the top run
  const b0=[44,gy-28.5],b1=[58,gy-34.5],c0=[44,gy-19.5],c1=[58,gy-21.5];
  K.line(b0[0],b0[1],b1[0],b1[1],Le[2]);K.line(c0[0],c0[1],c1[0],c1[1],Le[1]);
  if(!still){for(let k=0;k<2;k++){const t=((fr*2+k*7)%14)/14;K.px(b0[0]+(b1[0]-b0[0])*t,b0[1]+(b1[1]-b0[1])*t,2,1,Le[3]);}}
  // exhaust: a soft puff on the firing frames; meal dust falling from the spout
  if(!still){if(fr<3){const k=fr/3;const px=34+k*3,py=gy-55-fr*3,r=2+fr;K.g.save();K.g.globalAlpha=.55-k*.3;K.ell(px,py,r,r*.8,(x,y,nx,ny)=>nx+ny<0?'#c8c4bc':'#8e8a84');K.g.restore();}
    for(let i=0;i<3;i++){const y=gy-16+((fr*2+i*2)%6);K.px(80+(i%2),y,1,1,MC34P.cloth[4]);}}
  K.shadow(46,gy+1,40,4);return K.c;}

// ---------------------------------------------------------------- THE HEN FEEDER (50 x 46; four frames: grain trickling, water)
const MC34_FEED={W:50,H:46,gy:41};
// an upright galvanised cylinder: lit on the left, a seam, darker to the right
function mc34Cyl(K,cx,y0,y1,r,ramp,seam){for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const nx=(x+.5-cx)/r;if(Math.abs(nx)>1)continue;const v=.82-nx*.42-(Math.abs(nx)>.85?.15:0);
    for(let y=y0;y<=y1;y++)K.px(x,y,1,1,mc34R(ramp,v));}
  if(seam)K.px(Math.round(cx+r*.35),y0,1,y1-y0+1,ramp[1]);}
function mc34DrawFeed(f,empty){const {W,H,gy}=MC34_FEED,S_=MC34P.steel,Gr=MC34P.grain,Wa=MC34P.water;const K=mc34Kit(W,H);
  // the feeder: a round pan with grain round the rim, the hopper standing in it, a cone cap and a bail
  const fx=16;K.ell(fx,gy-5,14,4.5,(x,y,nx,ny,d)=>d>.82?(ny<0?S_[2]:S_[4]):ny>.2?S_[1]:S_[2]);
  K.px(fx-14,gy-5,29,3,S_[3]);K.px(fx-14,gy-3,29,1,S_[1]);
  if(!empty)K.ell(fx,gy-6,12,3.2,(x,y,nx,ny,d)=>d<.55?null:(ny<-.2&&nx<.3?Gr[4]:(x*7+y*3)%5===0?Gr[1]:Gr[3]));
  mc34Cyl(K,fx,gy-30,gy-7,7.5,S_,true);
  K.px(fx-8,gy-9,17,1,S_[1]);for(const x of [fx-5,fx-1,fx+3])K.px(x,gy-9,2,2,S_[0]);   // the feed slots at the foot
  K.poly([[fx-9,gy-30],[fx+9,gy-30],[fx+3,gy-37],[fx-3,gy-37]],(x,y)=>{const t=(x-fx+9)/18;return y===gy-30?S_[1]:t<.35?S_[4]:t>.75?S_[2]:S_[3];});
  K.px(fx-2,gy-39,5,2,S_[2]);K.px(fx-2,gy-39,2,1,S_[4]);
  for(let a=0;a<=Math.PI;a+=.12)K.px(Math.round(fx-Math.cos(a)*9),Math.round(gy-31-Math.sin(a)*4),1,1,a<1.4?S_[3]:S_[1]);   // the wire bail
  // the water fount: a domed can upside-down in its own shallow pan
  const wx=38;K.ell(wx,gy-4,9.5,3.2,(x,y,nx,ny,d)=>d>.8?(ny<0?S_[2]:S_[4]):ny<-.1?Wa[3]:Wa[2]);
  mc34Cyl(K,wx,gy-19,gy-6,5.5,S_,false);K.ell(wx,gy-19,5.5,3,(x,y,nx,ny)=>ny<0?(nx<.2?S_[4]:S_[3]):null);
  K.px(wx-1,gy-23,3,2,S_[2]);K.px(wx-1,gy-23,1,1,S_[4]);
  K.outline();
  // grain sliding out of the slots and water catching the light (no outline)
  if(!empty){for(let i=0;i<3;i++){const s=[fx-5,fx-1,fx+3][i],k=(f+i)%4;K.px(s+(k>1?1:0),gy-8+k,1,1,Gr[4]);}
    const sx=wx-6+((f*2)%9);K.px(sx,gy-5,2,1,Wa[4]);}
  K.shadow(26,gy,22,3.5);return K.c;}

// ---------------------------------------------------------------- THE MILKING MACHINE (62 x 50; four frames: pump, pulsator, cups)
const MC34_MILK={W:62,H:50,gy:45};
function mc34DrawMilk(f,still){const {W,H,gy}=MC34_MILK,S_=MC34P.steel,Wd=MC34P.wood,I=MC34P.iron,G=MC34P.green,Br=MC34P.brass,Le=MC34P.leather;const K=mc34Kit(W,H),fr=still?0:f;
  // the bench: a thick top plank and two legs, a stretcher between
  K.px(2,gy-19,28,3,Wd[3]);K.px(2,gy-19,28,1,Wd[4]);K.px(2,gy-16,28,1,Wd[1]);
  for(const x of [4,25]){K.px(x,gy-16,3,16,Wd[2]);K.px(x,gy-16,1,16,Wd[3]);}K.px(7,gy-7,18,2,Wd[1]);
  // the little engine and vacuum pump on the bench: a green box, its cylinder, a flywheel, the tank
  K.px(6,gy-30,14,11,G[2]);K.px(6,gy-30,14,2,G[4]);K.px(6,gy-28,2,9,G[3]);K.px(18,gy-28,2,9,G[1]);
  K.px(9,gy-37,7,7,I[2]);K.px(9,gy-37,2,7,I[3]);K.px(8,gy-38,9,2,I[3]);
  // the vacuum tank: a squat steel cylinder at the bench's right end, with a brass gauge
  for(let x=20;x<=29;x++){const nx=(x-24.5)/5;for(let y=gy-31;y<=gy-20;y++)K.px(x,y,1,1,mc34R(S_,.8-nx*.4));}K.ell(24.5,gy-31,5,1.6,(x,y,nx)=>nx<.3?S_[4]:S_[3]);
  K.ell(24.5,gy-26,2.6,2.6,(x,y,nx,ny,d)=>d>.7?Br[2]:'#e8e2d0');
  // the bucket milker on the ground: a tapered steel pail, domed lid, the pulsator on top, the cups hanging off the claw
  const bx=42;for(let y=gy-18;y<=gy-1;y++){const t=(y-gy+18)/17,r=7.5-t*1.2;for(let x=Math.floor(bx-r);x<=Math.ceil(bx+r);x++){const nx=(x+.5-bx)/r;if(Math.abs(nx)>1)continue;K.px(x,y,1,1,mc34R(S_,.85-nx*.45-(y>gy-3?.2:0)));}}
  K.px(bx-8,gy-12,17,1,S_[1]);K.px(bx-8,gy-11,17,1,S_[4]);   // a rolled band round the pail
  K.ell(bx,gy-19,9,3,(x,y,nx,ny,d)=>ny<0?(nx<.3?S_[4]:S_[3]):S_[2]);
  const pu=still?0:(fr%2);K.px(bx-2,gy-25+pu,5,5,S_[2]);K.px(bx-2,gy-25+pu,2,5,S_[4]);K.px(bx-3,gy-26+pu,7,1,Br[3]);   // pulsator: rises and drops
  // the cups: four short steel tubes on rubber hose, from the claw at the pail's right side
  const sw=still?0:[0,1,0,-1][fr%4];K.px(bx+8,gy-17,3,3,S_[3]);
  for(let i=0;i<4;i++){const cx=bx+10+i*2+sw,cy=gy-11+(i%2)*2;K.line(bx+9,gy-15,cx,cy-3,Le[1]);K.px(cx,cy-3,2,5,S_[3]);K.px(cx,cy-3,1,5,S_[4]);}
  // the hose from the tank to the lid
  for(let t=0;t<=1;t+=.04){const x=29+(bx-29)*t,y=gy-27+Math.sin(t*Math.PI)*-6+t*7;K.px(x,y,1,2,Le[2]);}
  K.outline();
  // the flywheel on the engine turning (no outline round its spokes), and a puff from the engine
  mc34Wheel(K,6,gy-27,5.5,4,fr*Math.PI/8,I,1.5);
  if(!still&&fr===1){K.g.save();K.g.globalAlpha=.45;K.ell(12,gy-42,2.5,2,(x,y,nx,ny)=>nx+ny<0?'#cfcac2':'#8e8a84');K.g.restore();}
  K.shadow(30,gy+1,28,3.5);return K.c;}

// ---------------------------------------------------------------- THE SEED CLEANER (fanning mill, 56 x 52; six frames: crank, chaff)
const MC34_SEED={W:56,H:52,gy:47};
function mc34DrawSeed(f,still,empty){const {W,H,gy}=MC34_SEED,Wd=MC34P.wood,R=MC34P.red,I=MC34P.iron,Gr=MC34P.grain;const K=mc34Kit(W,H),fr=still?0:f;
  // four splayed legs
  for(const [x0,x1] of [[12,9],[38,41]]){K.line(x0,gy-14,x1,gy,Wd[2]);K.line(x0+1,gy-14,x1+1,gy,Wd[1]);}
  // the body: a painted box, its left end the round fan drum, boards showing at the edges
  const dx=16,dy=gy-26;K.ell(dx,dy,10.5,10.5,(x,y,nx,ny,d)=>d>.86?(nx+ny<0?R[3]:R[1]):mc34R(R,.7-(nx+ny)*.25));
  K.px(16,gy-36,26,22,R[2]);K.px(16,gy-36,26,2,R[4]);K.px(40,gy-34,2,20,R[1]);K.px(16,gy-16,26,2,R[1]);
  K.px(20,gy-29,18,1,MC34P.cloth[3]);K.px(20,gy-26,12,1,MC34P.cloth[3]);K.px(34,gy-26,4,1,MC34P.cloth[3]);   // a stencilled name, as strokes
  K.px(16,gy-22,26,1,R[1]);
  // the hopper on top, heaped with whatever's in it
  K.poly([[20,gy-46],[42,gy-46],[39,gy-36],[23,gy-36]],(x,y)=>{const t=(x-20)/22;return y===gy-46?Wd[4]:t<.25?Wd[3]:t>.78?Wd[1]:Wd[2];});
  if(!empty){K.ell(31,gy-46,10,2.4,(x,y,nx,ny)=>ny<-.1&&nx<.3?Gr[4]:Gr[2]);K.ell(31,gy-47,6,1.6,(x,y,nx)=>nx<0?Gr[4]:Gr[3]);}
  // the screens sliding out at the right end, the spout, and clean seed heaped below
  K.poly([[42,gy-19],[52,gy-16],[52,gy-14],[42,gy-16]],(x,y)=>y<gy-16?Wd[4]:Wd[2]);
  K.ell(48,gy-2,6,2.6,(x,y,nx,ny)=>empty?null:ny<0&&nx<.3?Gr[4]:Gr[2]);
  // the crank at the drum's hub: an iron spider wheel and its handle going round
  mc34Wheel(K,dx,dy,6.5,5,fr*Math.PI/3,I,1.5);
  K.outline();
  const a=fr*Math.PI/3,hx=dx+Math.cos(a)*6,hy=dy+Math.sin(a)*6;K.line(dx,dy,hx,hy,I[3]);K.px(hx-1,hy-1,3,3,Wd[3]);K.px(hx-1,hy-1,1,1,Wd[4]);
  // chaff blowing out of the far end (no outline): pale flecks drifting right and up
  if(!still&&!empty){for(let i=0;i<5;i++){const k=((fr+i*1.3)%6)/6;K.px(43+k*12+(i%2),gy-34-k*8+(i%3),1,1,i%2?'#d8c890':'#b8a46a');}
    for(let i=0;i<2;i++){const y=gy-13+((fr+i*3)%6);K.px(47+i,y,1,1,Gr[4]);}}
  K.shadow(28,gy+1,24,3.5);return K.c;}

// ---------------------------------------------------------------- item icons (32 x 32)
function mc34Icon(k){const K=mc34Kit(32,32),R=MC34P.red,S_=MC34P.steel,Bu=MC34P.burlap,Cl=MC34P.cloth,Gr=MC34P.grain,Ru=MC34P.rust,Br=MC34P.brass;
  if(k==='kero'){// a square red can, a handle across the top, a spout leaning out, rust at the seams
    K.px(8,9,15,19,R[2]);K.px(8,9,4,19,R[3]);K.px(20,9,3,19,R[1]);K.px(8,9,15,2,R[4]);K.px(8,26,15,2,R[1]);
    K.px(10,14,11,7,Cl[3]);K.px(10,14,11,1,Cl[4]);K.px(12,16,7,1,R[1]);K.px(12,18,5,1,R[1]);   // a paper label with two strokes
    K.px(9,22,1,4,Ru[2]);K.px(21,10,1,5,Ru[1]);
    K.px(10,5,9,2,S_[2]);K.px(10,5,9,1,S_[4]);K.px(10,6,1,3,S_[2]);K.px(18,6,1,3,S_[1]);   // the handle
    K.line(20,9,25,3,S_[3]);K.line(21,9,26,3,S_[1]);K.px(25,2,2,2,S_[2]);}
  else if(k==='grease'){// a squat round tin, its lid a step lighter and barely wider, a band of label
    K.ell(16,12,10,3.5,(x,y,nx)=>nx<.2?S_[4]:S_[3]);
    for(let x=6;x<=26;x++){const nx=(x-16)/10;for(let y=12;y<=24;y++)K.px(x,y,1,1,y<15?mc34R(S_,.85-nx*.4):y<21?mc34R(Br,.8-nx*.35):mc34R(S_,.7-nx*.4));}
    K.ell(16,24,10,3,(x,y,nx,ny)=>ny>0?mc34R(S_,.5-nx*.3):null);K.px(9,17,10,1,Br[1]);K.px(11,19,6,1,Br[1]);
    K.ell(16,12,8,2.2,(x,y,nx)=>nx<0?'#4a3c2a':'#2e2418');K.px(11,11,4,1,'#6e5a3e');}   // dark grease showing at the open lid's lip
  else if(k==='feed'||k==='flour'){const Sk=k==='feed'?Bu:Cl,Fill=k==='feed'?Gr:Cl;
    K.poly([[7,10],[25,10],[27,28],[5,28]],(x,y)=>{const t=(x-5)/22;return t<.22?Sk[3]:t>.78?Sk[1]:Sk[2];});
    K.px(5,27,23,2,Sk[1]);K.px(6,8,21,4,Sk[4]);K.px(6,11,21,1,Sk[1]);   // the rolled-down mouth
    K.ell(16,8,8,3,(x,y,nx,ny)=>ny<-.1&&nx<.3?Fill[4]:Fill[k==='feed'?2:3]);K.ell(15,6,4,1.6,(x,y,nx)=>nx<0?Fill[4]:Fill[3]);
    if(k==='feed'){K.px(10,17,12,1,Sk[1]);K.px(10,20,9,1,Sk[1]);}else{K.px(10,17,12,3,R[2]);K.px(10,17,12,1,R[3]);K.px(13,22,6,1,Sk[1]);}}   // a stencil; the flour sack's red band
  K.outline();return K.c;}
