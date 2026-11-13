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

// ---------------------------------------------------------------- THE WINDMILL (80 x 138; 32 frames, half a blade a frame)
// One blade is darker so the turn reads; the tail vane points away from you (seen nearly edge-on); seized, the wheel is furled
// edge-on; the tower's shadow falls down and to the right.
const MC34_WIND={W:80,H:138,gy:126};
function mc34DrawWind(f,still){const {W,H,gy}=MC34_WIND,S_=MC34P.steel,TX=28;
  const L=mc34Kit(W,H);
  const legX=(x0,x1,y)=>x0+(x1-x0)*((gy-y)/(gy-36));
  const legs=[[11,TX-3],[45,TX+3]],back=[[17,TX-2],[39,TX+2]];
  for(const [a,b] of back)L.line(a,gy-4,b,38,S_[1]);
  const lv=[gy-14,gy-32,gy-50,gy-68,gy-84];
  for(let i=0;i<lv.length;i++){const y=lv[i],xa=legX(11,TX-3,y),xb=legX(45,TX+3,y);L.line(xa,y,xb,y,S_[3]);L.line(xa,y+1,xb,y+1,S_[1]);
    const y2=i+1<lv.length?lv[i+1]:40,xa2=legX(11,TX-3,y2),xb2=legX(45,TX+3,y2);L.line(xa+1,y-1,xb2-1,y2+2,S_[2]);L.line(xb-1,y-1,xa2+1,y2+2,S_[1]);}
  for(const [a,b] of legs){const lit=a<TX;L.line(a,gy,b,36,lit?S_[4]:S_[2]);L.line(a+1,gy,b+1,36,lit?S_[2]:S_[1]);L.line(a+(lit?-1:2),gy,b+(lit?-1:2),36,S_[0]);}
  for(const x of [10,44])L.px(x-1,gy,5,2,'#6c6a66'),L.px(x-1,gy+1,5,1,'#4a4844');
  const bob=still?0:(f%4<2?0:2);L.line(TX,40,TX,gy-18,S_[3]);L.px(TX-1,42+bob,3,2,S_[1]);
  const K=mc34Kit(W,H);
  // the tail vane, pointing away from you: a short arm up and back, the sheet seen almost on edge (painted face a sliver)
  K.line(TX+3,23,TX+13,13,S_[2]);K.line(TX+4,23,TX+14,13,S_[1]);
  K.poly([[TX+12,3],[TX+18,1],[TX+18,19],[TX+12,17]],(x,y)=>x<TX+14?MC34P.red[3]:x<TX+16?MC34P.red[2]:MC34P.red[1]);
  K.px(TX+12,3,2,1,MC34P.red[4]);
  K.px(TX-9,37,19,2,MC34P.wood[3]);K.px(TX-9,39,19,1,MC34P.wood[1]);
  K.px(TX-2,24,12,8,S_[1]);K.px(TX-2,24,12,2,S_[2]);
  const cx=TX,cy=21,Ro=19.5,Ri=6,N=16;
  if(still){// furled: the wheel turned edge-on, a tall thin disc of stacked blade edges
    K.ell(cx,cy,3.2,Ro,(x,y,nx,ny,d)=>{const band=Math.floor((y-cy+Ro)/2.4)%2;return d>.85?(nx<0?S_[3]:S_[1]):nx<-.2?(band?S_[4]:S_[3]):band?S_[2]:S_[1];});
    K.px(cx-1,cy-1,3,3,S_[0]);}
  else{const rot=f*(Math.PI*2/N)/2;
    K.ell(cx,cy,Ro,Ro,(x,y,nx,ny,d)=>{const r=d*Ro;let a=Math.atan2(ny,nx)+rot;a=((a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);const bi=Math.floor(a/(Math.PI*2/N)),fr=(a/(Math.PI*2/N))%1;
      const tl=-(nx*.7+ny*.7)*.18;
      if(r>Ro-1.3)return nx+ny<-.3?S_[4]:nx+ny<.5?S_[3]:S_[2];
      if(r<Ri+1.2&&r>=Ri)return S_[2];
      if(r<Ri){return r<2?S_[0]:r<3.2?(nx+ny<0?S_[3]:S_[1]):S_[1];}
      if(bi===0)return fr<.12?S_[2]:'#f4f2ea';   // the marker blade: pale, so the turn reads on the dark side too
      const v=fr<.12?.15:fr<.5?.82:fr<.8?.6:.38;return mc34R(S_,v+tl);});}
  const pb=gy-16;K.px(TX-3,pb,7,14,S_[2]);K.px(TX-3,pb,2,14,S_[3]);K.px(TX+2,pb,2,14,S_[1]);K.px(TX-4,pb-2,9,2,S_[1]);K.px(TX-4,pb-2,9,1,S_[3]);
  K.px(TX-4,gy-2,9,2,S_[1]);
  K.px(TX+4,pb+3,16,2,S_[2]);K.px(TX+4,pb+3,16,1,S_[3]);K.px(TX+19,pb-1,2,6,S_[2]);K.px(TX+19,pb-1,1,6,S_[3]);
  const tx=60,ty=gy-14,rx=13,ry=4,hgt=12;
  for(let x=tx-rx;x<=tx+rx;x++){const nx=(x+.5-tx)/rx;if(Math.abs(nx)>1)continue;const yTop=ty+Math.sqrt(1-nx*nx)*ry,yBot=ty+hgt+Math.sqrt(1-nx*nx)*ry;
    const rib=Math.floor((x-tx+rx)/4)%2,v=.78-nx*.35-(rib?.12:0);for(let y=Math.floor(yTop);y<=yBot;y++)K.px(x,y,1,1,mc34R(S_,v-(y>yBot-2?.15:0)));}
  K.ell(tx,ty,rx,ry,(x,y,nx,ny,d)=>d>.8?(ny<0?S_[2]:S_[4]):null);
  K.ell(tx,ty,rx-1.5,ry-1,(x,y,nx,ny,d)=>ny<-.35&&nx<.4?MC34P.water[3]:d>.75&&ny>0?MC34P.water[1]:MC34P.water[2]);
  K.outline();
  if(!still){for(let i=0;i<3;i++){const y=pb+5+((f*2+i*3)%7);K.px(TX+20,y,1,2,MC34P.water[4]);}
    const rr=(f%4)+1;K.ell(TX+20,ty+1,rr+1,rr*.45,(x,y,nx,ny,d)=>d>.7?MC34P.water[4]:null);}
  const O=mc34Kit(W,H);O.put(L.c);O.put(K.c);
  // only contact shadows under the feet and the tank: the long shadow is thrown by the game itself, with the sun
  O.g.save();O.g.globalCompositeOperation='destination-over';O.g.globalAlpha=.5;
  for(const x of [12,46])O.ell(x,gy+1,4,1.4,()=>'#322125');O.ell(28,gy+1,4,1.2,()=>'#322125');O.ell(60,gy+2,14,3,()=>'#322125');O.g.restore();
  return O.c;}

// ---------------------------------------------------------------- THE FEED MILL (88 x 74; six frames: flywheel, belt, exhaust, meal)
const MC34_MILL={W:88,H:74,gy:68};
// a spoked wheel seen face-on: rim, n spokes turned by rot, hub
function mc34Wheel(K,cx,cy,r,n,rot,ramp,rimW){rimW=rimW||2;K.ell(cx,cy,r,r,(x,y,nx,ny,d)=>{const rr=d*r,tl=nx+ny;
    if(rr>r-rimW)return tl<-.5?ramp[4]:tl<.3?ramp[3]:ramp[2];
    if(rr<2.2)return rr<1.2?ramp[0]:(tl<0?ramp[4]:ramp[2]);
    let a=Math.atan2(ny,nx)-rot;a=((a%(Math.PI*2/n))+Math.PI*2/n)%(Math.PI*2/n);const off=Math.min(a,Math.PI*2/n-a)*rr;
    if(off<.6)return tl<.2?ramp[4]:ramp[3];if(off<1.3)return ramp[1];return null;});}
// a soft pale puff you can see through: two lobes, no outline, no dark edge
function mc34Puff(K,x,y,r,a){K.g.save();K.g.globalAlpha=a;K.ell(x,y,r,r*.8,(xx,yy,nx,ny)=>nx+ny<-.2?'#f0eee8':'#c8c4bc');K.ell(x+r*.8,y-r*.45,r*.65,r*.55,(xx,yy,nx,ny)=>nx+ny<0?'#f0eee8':'#c8c4bc');K.g.restore();}
function mc34DrawMill(f,still){const {W,H,gy}=MC34_MILL,G=MC34P.green,I=MC34P.iron,Wd=MC34P.wood,R=MC34P.red,Gr=MC34P.grain,Bu=MC34P.burlap,Le=MC34P.leather;
  const K=mc34Kit(W,H),fr=still?0:f;
  K.px(4,gy-6,40,4,Wd[3]);K.px(4,gy-6,40,1,Wd[4]);K.px(4,gy-2,40,2,Wd[1]);K.px(4,gy-6,2,6,Wd[2]);K.px(42,gy-6,2,6,Wd[1]);
  for(const x of [54,74]){K.px(x,gy-14,3,14,Wd[2]);K.px(x,gy-14,1,14,Wd[3]);}K.px(52,gy-16,28,3,Wd[3]);K.px(52,gy-16,28,1,Wd[4]);K.line(56,gy-2,76,gy-12,Wd[1]);
  K.px(12,gy-18,30,12,G[2]);K.px(12,gy-18,30,2,G[3]);K.px(12,gy-8,30,2,G[1]);K.px(40,gy-18,2,12,G[1]);
  K.px(16,gy-30,22,13,G[2]);K.px(16,gy-30,22,2,G[4]);K.px(16,gy-28,3,11,G[3]);K.px(35,gy-28,3,11,G[1]);
  for(let i=0;i<4;i++)K.px(20+i*4,gy-24,2,6,G[1]);
  K.px(17,gy-36,16,6,G[2]);K.px(17,gy-36,16,1,G[4]);K.px(18,gy-35,14,2,MC34P.water[1]);K.px(18,gy-35,6,1,MC34P.water[3]);
  K.px(33,gy-46,3,16,I[2]);K.px(33,gy-46,1,16,I[3]);K.px(31,gy-50,7,5,I[2]);K.px(31,gy-50,7,1,I[4]);K.px(31,gy-46,7,1,I[1]);
  // the engine's pulley at its right end, well apart from the mill's (so the belt shows between them)
  mc34Wheel(K,39,gy-24,4.5,3,fr*Math.PI/9,I,1.5);
  K.poly([[56,gy-34],[76,gy-34],[78,gy-30],[78,gy-17],[56,gy-17]],(x,y)=>y<gy-32?R[4]:x<59?R[3]:x>75?R[1]:R[2]);
  K.px(56,gy-20,22,3,R[1]);K.px(64,gy-28,10,1,R[1]);K.px(64,gy-27,10,1,R[3]);
  K.poly([[55,gy-50],[79,gy-50],[73,gy-34],[61,gy-34]],(x,y)=>{const t=(x-55)/24;return y<gy-48?Wd[4]:t<.25?Wd[3]:t>.8?Wd[1]:Wd[2];});
  for(let y=gy-46;y<gy-35;y+=4)K.line(57+(y-gy+50)*.25,y,77-(y-gy+50)*.25,y,Wd[1]);
  K.ell(67,gy-50,11.5,3,(x,y,nx,ny,d)=>ny<-.2&&nx<.3?Gr[4]:d>.8?Gr[1]:Gr[2+((x+y)%5===0?1:0)]);
  K.ell(67,gy-52,7,2.2,(x,y,nx)=>nx<0?Gr[4]:Gr[3]);
  mc34Wheel(K,60,gy-28,6.5,4,-fr*Math.PI/12,I,1.5);
  K.poly([[76,gy-22],[81,gy-19],[81,gy-15],[77,gy-17]],(x,y)=>y<gy-19?R[3]:R[1]);
  K.poly([[74,gy-12],[86,gy-12],[87,gy-1],[73,gy-1]],(x,y)=>{const t=(x-73)/14;return t<.25?Bu[3]:t>.78?Bu[1]:Bu[2];});
  K.px(73,gy-13,14,3,Bu[4]);K.px(73,gy-11,14,1,Bu[1]);K.ell(80,gy-14,5,2,(x,y,nx)=>nx<0?MC34P.cloth[4]:MC34P.cloth[3]);
  mc34Wheel(K,14,gy-22,13.5,6,fr*Math.PI/18,I,3);
  K.outline();
  // the belt: both runs between the pulleys, a pale splice mark travelling along each (over the top one way, back underneath)
  const T0=[39,gy-28.5],T1=[60,gy-34.5],B0=[39,gy-19.5],B1=[60,gy-21.5];
  K.line(T0[0],T0[1],T1[0],T1[1],Le[2]);K.line(T0[0],T0[1]+1,T1[0],T1[1]+1,Le[1]);K.line(B0[0],B0[1],B1[0],B1[1],Le[2]);K.line(B0[0],B0[1]+1,B1[0],B1[1]+1,Le[1]);
  {const t=still?.3:((fr%6)+.5)/6;const mx=Math.round(T0[0]+(T1[0]-T0[0])*t),my=Math.round(T0[1]+(T1[1]-T0[1])*t);K.px(mx-1,my-1,3,3,'#3a2414');K.px(mx-1,my-1,3,2,'#e8d4a8');}   // one bold pale splice, 3.6 px a frame
  if(!still){if(fr<4){const k=fr/4;mc34Puff(K,36+k*6,gy-55-fr*3.5,2.6+fr*1.3,.5-k*.25);}
    // meal dust: pale clumps falling from the spout into the sack, and a haze over its mouth
    for(let i=0;i<3;i++){const y=gy-16+((fr*3+i*4)%9);K.px(80+(i%2),y,2,2,MC34P.cloth[4]);}
    K.g.save();K.g.globalAlpha=.32+(fr%2)*.12;K.ell(80,gy-15,6,2.5,()=>'#f2eee0');K.g.restore();}
  K.shadow(46,gy+1,40,4);return K.c;}

// ---------------------------------------------------------------- THE HEN FEEDER (50 x 32; four frames of grain sliding out)
// Knee-high to a hen-keeper: a squat hopper with a low domed cap in a wide flared pan, a water fount, and the sack it's fed from.
const MC34_FEED={W:60,H:32,gy:27};
function mc34Cyl(K,cx,y0,y1,r,ramp,seam){for(let x=Math.floor(cx-r);x<=Math.ceil(cx+r);x++){const nx=(x+.5-cx)/r;if(Math.abs(nx)>1)continue;const v=.82-nx*.42-(Math.abs(nx)>.85?.15:0);
    for(let y=y0;y<=y1;y++)K.px(x,y,1,1,mc34R(ramp,v));}
  if(seam)K.px(Math.round(cx+r*.35),y0,1,y1-y0+1,ramp[1]);}
function mc34DrawFeed(f,empty){const {W,H,gy}=MC34_FEED,S_=MC34P.steel,Gr=MC34P.grain,Wa=MC34P.water,Bu=MC34P.burlap;const K=mc34Kit(W,H);
  // the sack of mash, leaning: a thick rolled-down mouth and the mash heaped above it in lumps
  if(!empty){K.poly([[2,gy-10],[11,gy-11],[12,gy],[1,gy]],(x,y)=>x<4?Bu[3]:x>9?Bu[1]:Bu[2]);
    K.px(1,gy-13,11,3,Bu[4]);K.px(1,gy-13,11,1,Bu[3]);K.px(1,gy-10,11,1,Bu[1]);
    for(const [x,y,r] of [[4,gy-14,2.2],[7.5,gy-15.5,2.7],[10,gy-14,2]])K.ell(x,y,r,r*.85,(xx,yy,nx,ny)=>nx+ny<-.35?Gr[4]:ny>.35?Gr[1]:Gr[3]);
    K.px(4,gy-6,5,1,Bu[1]);}
  // the pan: a wide dish flaring out to a lit lip, grain lying in it round the hopper
  const fx=24,py=gy-6;
  for(let x=fx-14;x<=fx+14;x++){const nx=(x+.5-fx)/14;if(Math.abs(nx)>1)continue;const yl=py+Math.sqrt(1-nx*nx)*4.2,nb=(x+.5-fx)/11,yb=Math.abs(nb)<1?py+3+Math.sqrt(1-nb*nb)*3.4:yl;
    for(let y=Math.round(yl);y<=Math.round(yb);y++)K.px(x,y,1,1,mc34R(S_,.62-nx*.4-(y-yl)*.06));}
  K.ell(fx,py,14,4.2,(x,y,nx,ny,d)=>d>.84?(ny>0?(nx<.2?S_[4]:S_[3]):S_[2]):empty?(ny<0?S_[1]:S_[2]):(((x>>1)*3+(y>>1)*5)%7===0?Gr[4]:ny<-.2&&nx<.2?Gr[4]:ny>.45?Gr[2]:Gr[3]));
  // the hopper: a short galvanised drum standing in the pan, slots at its foot, a low domed lid with a knob
  mc34Cyl(K,fx,gy-18,gy-8,6.5,S_,true);K.px(fx-7,gy-8,14,1,S_[1]);
  for(const x of [fx-5,fx-1,fx+3])K.px(x,gy-9,2,2,S_[0]);
  K.ell(fx,gy-18,7.4,3.6,(x,y,nx,ny)=>ny>.15?null:nx+ny<-.4?S_[4]:nx<.3?S_[3]:S_[2]);K.px(fx-7,gy-18,15,1,S_[1]);
  K.px(fx-1,gy-23,3,2,S_[2]);K.px(fx-1,gy-23,1,1,S_[4]);
  // the water fount: a small domed jar upside down in its own little pan
  const wx=51;K.ell(wx,gy-3,6.5,2.4,(x,y,nx,ny,d)=>d>.78?(ny>0?S_[4]:S_[2]):ny<0?Wa[3]:Wa[2]);
  mc34Cyl(K,wx,gy-10,gy-4,3.8,S_,false);K.ell(wx,gy-10,3.8,2,(x,y,nx,ny)=>ny<0?(nx<.2?S_[4]:S_[3]):null);
  K.outline();
  // grain sliding out of the slots across the pan, three clumps moving 3 px a frame (no outline)
  // grain trickling out of the right-hand slot, across the pan, over the lit lip and down to a little heap on the ground:
  // two bold clumps on an eight-step path, each moving one step (about 3 px) a frame
  if(!empty){const PATH=[[fx+5,gy-9],[fx+8,gy-8],[fx+11,gy-7],[fx+13,gy-6],[fx+15,gy-5],[fx+16,gy-2],[fx+16,gy+1],[fx+17,gy+2]];
    for(const [x,y] of [[fx+16,gy+2],[fx+18,gy+2],[fx+17,gy+1]]){K.px(x,y,2,1,Gr[3]);K.px(x,y+1,2,1,Gr[1]);}   // the little heap
    for(let j=0;j<2;j++){const [x,y]=PATH[(f+j*4)%8];K.px(x,y,3,2,Gr[4]);K.px(x,y+2,3,1,Gr[1]);K.px(x+2,y,1,2,Gr[2]);}
    K.px(wx-4+((f*3)%7),gy-3,2,1,Wa[4]);}
  K.shadow(29,gy+1,27,2.6);return K.c;}

// ---------------------------------------------------------------- THE MILKING MACHINE (68 x 54; four frames)
// A pump and its engine on a bench, the vacuum tank with a round gauge, the bucket milker on the ground with its pulsator, and
// the claw hung on a hook stand with four slim cups, swinging and pulsing, clear of the pail.
const MC34_MILK={W:86,H:54,gy:49};
function mc34DrawMilk(f,still){const {W,H,gy}=MC34_MILK,S_=MC34P.steel,Wd=MC34P.wood,I=MC34P.iron,G=MC34P.green,Br=MC34P.brass,Le=MC34P.leather;const K=mc34Kit(W,H),fr=still?0:f;
  // the bench
  K.px(4,gy-20,28,3,Wd[3]);K.px(4,gy-20,28,1,Wd[4]);K.px(4,gy-17,28,1,Wd[1]);
  for(const x of [6,27]){K.px(x,gy-17,3,17,Wd[2]);K.px(x,gy-17,1,17,Wd[3]);}K.px(9,gy-7,18,2,Wd[1]);
  // the engine and pump, the stack it puffs from
  K.px(8,gy-31,12,11,G[2]);K.px(8,gy-31,12,2,G[4]);K.px(8,gy-29,2,9,G[3]);K.px(18,gy-29,2,9,G[1]);K.px(11,gy-27,6,1,G[1]);
  K.px(14,gy-36,2,5,I[2]);K.px(14,gy-36,1,5,I[3]);K.px(13,gy-37,4,1,I[3]);
  // the vacuum tank, and its round gauge on a stem above it
  for(let x=21;x<=30;x++){const nx=(x-25.5)/5;for(let y=gy-31;y<=gy-20;y++)K.px(x,y,1,1,mc34R(S_,.8-nx*.4));}K.ell(25.5,gy-31,5,1.6,(x,y,nx)=>nx<.3?S_[4]:S_[3]);
  K.px(25,gy-37,2,6,S_[2]);K.px(25,gy-37,1,6,S_[3]);
  K.ell(25.5,gy-42,5,5,(x,y,nx,ny,d)=>d>.78?(nx+ny<0?S_[4]:S_[1]):'#ece6d4');
  // the pail: tapered, a rolled band, a domed lid; the pulsator on top rising and dropping
  const bx=44;for(let y=gy-18;y<=gy-1;y++){const t=(y-gy+18)/17,r=7.5-t*1.2;for(let x=Math.floor(bx-r);x<=Math.ceil(bx+r);x++){const nx=(x+.5-bx)/r;if(Math.abs(nx)>1)continue;K.px(x,y,1,1,mc34R(S_,.85-nx*.45-(y>gy-3?.2:0)));}}
  K.px(bx-8,gy-12,17,1,S_[1]);K.px(bx-8,gy-11,17,1,S_[4]);
  K.ell(bx,gy-19,9,3,(x,y,nx,ny)=>ny<0?(nx<.3?S_[4]:S_[3]):S_[2]);
  const pu=fr%2?-2:0;K.px(bx-2,gy-26+pu,5,6-pu,S_[2]);K.px(bx-2,gy-26+pu,2,6-pu,S_[4]);K.px(bx-3,gy-27+pu,7,1,Br[3]);K.px(bx-3,gy-27+pu,2,1,Br[4]);
  // the hook stand at the right: an iron post and its arm
  // the stand: a short wooden post on a foot, and a galvanised hook arm (dairy kit, not a black gallows)
  K.px(81,gy-30,3,30,Wd[3]);K.px(81,gy-30,1,30,Wd[4]);K.px(83,gy-30,1,30,Wd[1]);K.px(78,gy-2,9,2,Wd[2]);K.px(78,gy-2,9,1,Wd[3]);K.px(80,gy-31,5,1,Wd[4]);
  K.px(64,gy-30,18,2,S_[3]);K.px(64,gy-30,18,1,S_[4]);K.px(64,gy-29,1,3,S_[3]);
  K.outline();
  // the gauge's needle (it swings with the pump), its ticks
  const ang=[-2.4,-1.6,-2.2,-1.75][fr%4]+(still?0:0),gx=25.5,gyy=gy-42;
  for(const a of [-2.8,-1.6,-.4])K.px(Math.round(gx+Math.cos(a)*3.4),Math.round(gyy+Math.sin(a)*3.4),1,1,'#3a3430');
  K.line(gx,gyy,gx+Math.cos(ang)*3.6,gyy+Math.sin(ang)*3.6,'#a8281c');K.px(gx-.5,gyy-.5,1,1,'#2a2420');
  // the claw on the hook and the four cups below it: slim and tapered, a dark liner ring at each mouth, a short tube each;
  // they swing on the hook and pump in pairs
  // (the claw hangs well clear of the pail on the long arm; each cup on its own short tube, fanned out 5 px apart)
  const sw=still?0:[-2,0,2,0][fr%4],cx=68+sw,cy=gy-24,RB='#241c18';
  // the milk tube from the claw down to the lid first, so the cups hang in front of it
  for(let t=0;t<=1;t+=.03){K.px(Math.round(cx-3+(bx+6-cx+3)*t),Math.round(cy+2+(gy-21-cy-2)*t+Math.sin(t*Math.PI)*4),1,1,RB);}
  K.line(64,gy-27,cx,cy-3,S_[2]);K.px(63,gy-28,2,1,S_[4]);
  K.ell(cx,cy,3.6,2.4,(x,y,nx,ny)=>ny<-.2?(nx<.3?S_[4]:S_[3]):S_[1]);K.px(cx-3,cy+2,7,1,S_[0]);
  for(let i=0;i<4;i++){const ux=Math.round(cx-7.5+i*5),up=still?0:((i+fr)%2?-2:0),uy=cy+5+up;
    K.line(Math.round(cx-1.5+i),cy+2,ux,uy-1,RB);
    // a blunt cup hung mouth-down: the tube narrows into its top, a straight 3 px shell lit on the left, a dark liner ring at the mouth
    K.px(ux,uy,1,1,S_[2]);
    for(let j=1;j<9;j++){K.px(ux-1,uy+j,1,1,S_[4]);K.px(ux,uy+j,1,1,S_[3]);K.px(ux+1,uy+j,1,1,S_[1]);}
    K.px(ux-1,uy+9,3,1,RB);K.px(ux,uy+9,1,1,'#4a3a32');}
  // the vacuum hose from the tank to the pulsator
  for(let t=0;t<=1;t+=.04){K.px(30+(bx-2-30)*t,gy-29+Math.sin(t*Math.PI)*-5+t*3,1,1,Le[2]);}
  // the engine's flywheel turning, and a pale puff from the stack on the firing frame
  mc34Wheel(K,7,gy-26,5.5,4,fr*Math.PI/8,I,1.5);
  if(!still)for(const ph of [fr,(fr+2)%4]){const k=ph/4;mc34Puff(K,15+ph*2,gy-39-ph*3.5,2.2+ph*.9,.55-k*.4);}   // a puff on every frame, rising and thinning
  K.shadow(43,gy+1,40,3.5);return K.c;}

// ---------------------------------------------------------------- THE SEED CLEANER (a fanning mill, 60 x 62; six frames)
// A tall wooden box on short legs: the hopper on top, the fan drum bulging out of its side with the crank on its hub, the
// screens' edges sticking out of the far end, clean seed running from the spout, chaff blowing out in small tufts.
const MC34_SEED={W:60,H:62,gy:57};
function mc34DrawSeed(f,still,empty){const {W,H,gy}=MC34_SEED,Wd=MC34P.wood,I=MC34P.iron,Gr=MC34P.grain;const K=mc34Kit(W,H),fr=still?0:f;
  const P2=['#2a1c12','#4a3220','#6c4c30','#8e6a44','#ad8a5e'];   // weathered painted boards, a dull oxide brown
  // legs, the back pair a step darker and set in
  K.px(19,gy-9,2,9,P2[1]);K.px(40,gy-9,2,9,P2[0]);K.px(15,gy-9,3,9,P2[2]);K.px(15,gy-9,1,9,P2[3]);K.px(37,gy-9,3,9,P2[1]);
  // the box: boards running across, uneven seams, darker corner posts, a lit top edge
  for(let y=gy-42;y<=gy-9;y++)for(let x=14;x<=41;x++){const seam=[gy-36,gy-29,gy-23,gy-15].includes(y),post=x<16||x>39;K.px(x,y,1,1,seam?P2[1]:post?(x<16?P2[3]:P2[1]):x>36?P2[2]:P2[3]);}
  K.px(14,gy-42,28,1,P2[4]);K.px(40,gy-41,2,32,P2[1]);
  // dull stencil lettering: broken strokes one step lighter than the boards
  for(const [x,y,w] of [[20,gy-33,5],[26,gy-33,4],[31,gy-33,5],[22,gy-27,7],[30,gy-27,4]])K.px(x,y,w,1,P2[4]);
  // the hopper on top, wider at its mouth, seed heaped in it
  K.poly([[15,gy-51],[41,gy-51],[37,gy-42],[19,gy-42]],(x,y)=>{const t=(x-15)/26;return y<=gy-50?Wd[4]:t<.22?Wd[3]:t>.8?Wd[1]:Wd[2];});
  K.line(17,gy-47,39,gy-47,Wd[1]);
  if(!empty){for(const [x,y,r] of [[22,gy-51,2.4],[27,gy-52,3],[33,gy-51.5,2.6],[37,gy-51,2]])K.ell(x,y,r,r*.7,(xx,yy,nx,ny)=>nx+ny<-.3?Gr[4]:ny>.3?Gr[1]:Gr[3]);}
  // the screens' edges sticking out of the far end, stepped and lit along their tops; the seed spout below them
  for(let i=0;i<3;i++){const y=gy-31+i*4;K.px(42,y,7-i,1,Wd[4]);K.px(42,y+1,7-i,1,Wd[1]);K.px(48-i,y,1,2,Wd[2]);}
  K.poly([[36,gy-12],[44,gy-10],[44,gy-8],[36,gy-9]],(x,y)=>y<gy-10?P2[3]:P2[1]);
  if(!empty)K.ell(47,gy-1,6,2.4,(x,y,nx,ny)=>ny<0&&nx<.3?Gr[4]:Gr[2]);
  // the fan drum, bulging out of the near side: a round wooden housing, boards curving round it, lit on its upper left
  const dx=16,dy=gy-22;K.ell(dx,dy,12,12,(x,y,nx,ny,d)=>{const lit=-(nx+ny)*.5;if(d>.9)return lit>0?P2[3]:P2[0];const ring=Math.abs(d-.62)<.05;return ring?P2[1]:mc34R(P2,.62+lit*.45-(d>.75?.1:0));});
  K.ell(dx,dy,2.4,2.4,(x,y,nx,ny)=>nx+ny<0?I[4]:I[2]);
  K.outline();
  // the crank going round on the drum's hub: an iron arm and a turned wooden handle that sticks out toward you
  const a=fr*Math.PI/3-Math.PI/2,hx=Math.round(dx+Math.cos(a)*8),hy=Math.round(dy+Math.sin(a)*8);K.line(dx,dy,hx,hy,I[3]);K.line(dx+1,dy+1,hx+1,hy+1,I[1]);
  // the grip: a turned handle standing out toward you (down and right in this view), its shadow on the drum behind it
  K.g.save();K.g.globalAlpha=.55;K.px(hx+2,hy+2,3,4,'#1a120c');K.g.restore();
  K.px(hx-1,hy,4,5,'#2a1c12');K.px(hx,hy,2,4,Wd[3]);K.px(hx,hy,1,4,Wd[4]);K.px(hx+1,hy+3,1,1,Wd[1]);K.px(hx-1,hy-1,4,2,'#2a1c12');K.px(hx,hy-1,2,1,'#e8d0a0');
  // chaff out of the far end in small tufts (3 px each) drifting off right and up; seed trickling from the spout
  if(!still&&!empty){for(let i=0;i<4;i++){const k=((fr*4+i*6)%24),x=Math.round(43+k),y=Math.round(gy-41-k*.45+(i%2)*2);K.px(x,y,2,2,'#c8b47a');K.px(x,y,2,1,'#ecdca8');K.px(x+2,y+1,1,1,'#b8a46a');}
    for(let i=0;i<2;i++){const y=gy-8+((fr*3+i*4)%7);K.px(44+i,y,1,2,Gr[4]);}}
  K.shadow(30,gy+1,26,3.2);return K.c;}

// ---------------------------------------------------------------- item icons (32 x 32)
function mc34Icon(k){const K=mc34Kit(32,32),R=MC34P.red,S_=MC34P.steel,Bu=MC34P.burlap,Cl=MC34P.cloth,Gr=MC34P.grain,Ru=MC34P.rust,Br=MC34P.brass;
  if(k==='kero'){K.px(8,9,15,19,R[2]);K.px(8,9,4,19,R[3]);K.px(20,9,3,19,R[1]);K.px(8,9,15,2,R[4]);K.px(8,26,15,2,R[1]);
    K.px(10,14,11,7,Cl[3]);K.px(10,14,11,1,Cl[4]);K.px(12,16,7,1,R[1]);K.px(12,18,5,1,R[1]);
    K.px(9,22,1,4,Ru[2]);K.px(21,10,1,5,Ru[1]);
    K.px(10,5,9,2,S_[2]);K.px(10,5,9,1,S_[4]);K.px(10,6,1,3,S_[2]);K.px(18,6,1,3,S_[1]);
    K.line(20,9,24,4,S_[4]);K.line(21,9,25,4,S_[3]);K.line(22,9,26,5,S_[1]);K.px(23,1,4,3,R[1]);K.px(23,1,4,1,R[3]);K.px(26,2,1,2,R[0]||R[1]);}
  else if(k==='grease'){K.ell(16,12,10,3.5,(x,y,nx)=>nx<.2?S_[4]:S_[3]);
    for(let x=6;x<=26;x++){const nx=(x-16)/10;for(let y=12;y<=24;y++)K.px(x,y,1,1,y<15?mc34R(S_,.85-nx*.4):y<21?mc34R(Br,.8-nx*.35):mc34R(S_,.7-nx*.4));}
    K.ell(16,24,10,3,(x,y,nx,ny)=>ny>0?mc34R(S_,.5-nx*.3):null);K.px(9,17,10,1,Br[1]);K.px(11,19,6,1,Br[1]);
    K.ell(16,12,8,2.2,(x,y,nx)=>nx<0?'#4a3c2a':'#2e2418');K.px(11,11,4,1,'#6e5a3e');}
  else if(k==='feed'){K.poly([[7,10],[25,10],[27,28],[5,28]],(x,y)=>{const t=(x-5)/22;return t<.22?Bu[3]:t>.78?Bu[1]:Bu[2];});
    K.px(5,27,23,2,Bu[1]);K.px(6,8,21,4,Bu[4]);K.px(6,11,21,1,Bu[1]);
    K.ell(16,8,8,3,(x,y,nx,ny)=>ny<-.1&&nx<.3?Gr[4]:Gr[2]);K.ell(15,6,4,1.6,(x,y,nx)=>nx<0?Gr[4]:Gr[3]);
    K.px(10,17,12,1,Bu[1]);K.px(10,20,9,1,Bu[1]);}
  else if(k==='flour'){// a cotton sack sewn shut across the top, its two corners standing up as ears; a red band
    K.poly([[6,10],[26,10],[27,28],[5,28]],(x,y)=>{const t=(x-5)/22;return t<.22?Cl[4]:t>.78?Cl[2]:Cl[3];});
    K.poly([[6,11],[3,6],[5,5],[10,10]],(x,y)=>x<6?Cl[4]:Cl[3]);K.poly([[22,10],[27,5],[29,6],[26,11]],(x,y)=>x<26?Cl[3]:Cl[2]);
    K.px(6,9,21,2,Cl[4]);for(let x=7;x<26;x+=2)K.px(x,10,1,1,Cl[0]);   // the stitched seam
    K.px(5,27,23,2,Cl[1]);K.px(9,16,14,3,R[2]);K.px(9,16,14,1,R[3]);K.px(12,21,8,1,Cl[1]);}
  K.outline();return K.c;}

// @@GAMEPLAY ---------------------------------------------------------------- (everything above draws; everything below plays)
const MC34_M={
  wind:{name:'The windmill',short:'Windmill',price:1400,dim:MC34_WIND,ax:42,w:2.0,d:.8,frames:32,fps:10,draw:(f,v)=>mc34DrawWind(f,v==='s'),
    desc:'A steel wheel on a lattice tower, pumping into a stock tank. Every morning it waters up to sixty growing crops, the nearest first. It wants a tin of axle grease every seven mornings, or it seizes.'},
  mill:{name:'The feed mill',short:'Feed mill',price:900,dim:MC34_MILL,ax:45,w:2.6,d:.8,frames:6,fps:9,draw:(f,v)=>mc34DrawMill(f,v==='s'),
    desc:'A kerosene engine belted to a burr mill. Load barley or corn in the hopper: at dawn it grinds laying mash (two grain a sack) or flour (three barley a sack, worth more than the barley). A can of kerosene a working day.'},
  feed:{name:'The hen feeder',short:'Hen feeder',price:450,dim:MC34_FEED,ax:29,w:1.7,d:.45,frames:4,fps:4,draw:(f,v)=>mc34DrawFeed(f,v==='e'),
    desc:'A hopper feeder and a water fount for the coop. Keep laying mash in it (a sack a morning feeds four hens) and the hens lay half as many eggs again, and the nest holds twice as many.'},
  milk:{name:'The milking machine',short:'Milking machine',price:1100,dim:MC34_MILK,ax:43,w:2.6,d:.6,frames:4,fps:6,draw:(f,v)=>mc34DrawMilk(f,v==='s'),
    desc:'A vacuum pump and a bucket milker. At dawn it milks every cow, a bottle more each than hands get, into a cooler that keeps thirty. A can of kerosene a working day.'},
  seed:{name:'The seed cleaner',short:'Seed cleaner',price:500,dim:MC34_SEED,ax:31,w:1.5,d:.55,frames:6,fps:9,draw:(f,v)=>mc34DrawSeed(f,v==='s'||v==='e',v==='e'),
    desc:'A fanning mill. Load it with a crop and it cleans the seed out of it, two seeds a head, into the hands’ seed box. A farmhand cranks it at dawn; if you have none, crank it yourself.'}};
const MC34_ORDER=['wind','mill','feed','milk','seed'];
const MC34_CAP={fuel:12,mill:48,seed:24,sacks:20,cool:30};
function mc34Key(k,f,v){const key='mc34_'+k+'_'+(v||(f|0));if(SPR[key])return key;const M=MC34_M[k],c=M.draw(f|0,v);IMG['mem:'+key]=c;
  SPR[key]={src:'mem:'+key,fw:c.width,fh:c.height,ax:M.ax,ay:M.dim.gy+1,foot:[-M.w/2,-M.d,M.w/2,0]};return key;}
// ---- the things the machines use, and where to buy them
Object.assign(ITEMS,{
  mc_kero:{name:'Can of kerosene',icon:'mc_kero',sell:3,desc:'A gallon from Pruitt’s pumps. The feed mill and the milking machine burn a can a working day.'},
  mc_grease:{name:'Tin of axle grease',icon:'mc_grease',sell:5,desc:'Black, thick, and it gets everywhere. One tin keeps the windmill turning seven mornings.'},
  mc_feed:{name:'Sack of laying mash',icon:'mc_feed',sell:9,desc:'Ground grain for the hens. Keep the hen feeder full and they lay half as many eggs again.'},
  mc_flour:{name:'Sack of flour',icon:'mc_flour',sell:46,desc:'Barley flour from your own mill, ground fine. Worth more than the barley ever was.'}});
for(const k of ['kero','grease','feed','flour']){try{const c=mc34Icon(k),key='icon32_mc_'+k;IMG['mem:'+key]=c;SPR[key]={src:'mem:'+key,fw:32,fh:32,ax:16,ay:16};ICON['mc_'+k]=c.toDataURL();}catch(e){}}
{const _r=vendors.hollis.rows;vendors.hollis.rows=()=>{const r=_r();
  r.push({k:'mc_kero',name:'Kerosene ×5',desc:`Five cans from the pumps, for the feed mill and the milking machine. You have ${inv('mc_kero')}.`,price:30,can:true,buy(){addInv('mc_kero',5);updateHud&&updateHud();}});
  r.push({k:'mc_grease',name:'Tin of axle grease',desc:`Keeps a windmill turning seven mornings. You have ${inv('mc_grease')}.`,price:12,can:true,buy(){addInv('mc_grease',1);updateHud&&updateHud();}});return r;};}
{const _r=vendors.v_feed.rows;vendors.v_feed.rows=()=>{const r=_r();
  r.push({k:'mc_feed',name:'Sack of laying mash',desc:`For the hen feeder: a sack a morning feeds four hens. You have ${inv('mc_feed')}.`,price:16,can:true,buy(){addInv('mc_feed',1);updateHud&&updateHud();}});return r;};}
// ---- the book: what's bought, where it stands, what's in it (shared with the farm, like the tractor)
function MC34(){const E=EMP();E.mc=E.mc&&typeof E.mc==='object'?E.mc:{};return E.mc;}
const mc34Placed=k=>{const m=MC34()[k];return !!(m&&m.own&&m.x!=null);};
const mc34Price=k=>(typeof free6==='function'&&free6())?0:MC34_M[k].price;
const mc34Guest=()=>typeof HOST!=='undefined'&&HOST.role==='guest';
const mc34Me=()=>(typeof mlMe==='function'?mlMe():(typeof NAME==='function'&&NAME())||'Farmhand');
const mc34Seized=()=>{const w=MC34().wind;return !!(w&&w.own&&S.day-(w.grease||0)>=7);};
// the one place the machines' book changes; on a shared farm it runs on the host's farm, and a farmhand's screen shows it at once
function mc34Apply(op,a,by,mirror){const st=MC34(),k=a.k,m=k?st[k]:null,give={inv:{},seeds:{}};
  if(op==='buy'){if(!MC34_M[k]||(m&&m.own))return null;st[k]={own:1,x:null,z:null,fuel:0,hop:{},out:{},sacks:0,cool:0,grease:S.day,mode:'feed',box:1,by};}
  else if(!m||!m.own)return null;
  else if(op==='place'){m.x=+a.x;m.z=+a.z;}
  else if(op==='fuel'){m.fuel=Math.min(MC34_CAP.fuel,(m.fuel|0)+Math.max(0,a.n|0));}
  else if(op==='grease'){m.grease=S.day;}
  else if(op==='load'){const n=Math.max(0,a.n|0),kind=String(a.kind||'');if(!SEEDS[kind])return null;m.hop=m.hop||{};const cap=k==='mill'?MC34_CAP.mill:MC34_CAP.seed,have=Object.values(m.hop).reduce((x,y)=>x+y,0);
    m.hop[kind]=(m.hop[kind]||0)+Math.min(n,cap-have);}
  else if(op==='sacks'){m.sacks=Math.min(MC34_CAP.sacks,(m.sacks|0)+Math.max(0,a.n|0));}
  else if(op==='mode'){m.mode=a.mode==='flour'?'flour':'feed';}
  else if(op==='box'){m.box=a.v?1:0;}
  else if(op==='take'){if(k==='mill'){for(const q of ['feed','flour'])if(m.out[q])give.inv['mc_'+q]=m.out[q];m.out={};}
    else if(k==='milk'){if(m.cool)give.inv.milk=m.cool;m.cool=0;}
    else if(k==='seed'){for(const [q,n] of Object.entries(m.out||{}))if(n)give.seeds[q]=n;m.out={};}}
  else if(op==='crank'){if(!mirror)mc34Clean(m,by);}
  if(!mirror){try{mc34Sync(true);}catch(e){}}
  return give;}
function mc34Give(g){if(!g)return;let any=false;for(const [id,n] of Object.entries(g.inv||{}))if(n>0){addInv(id,n);any=true;}
  for(const [id,n] of Object.entries(g.seeds||{}))if(n>0&&SEEDS[id]){S.seeds[id]=(S.seeds[id]||0)+n;any=true;}if(any){SFX.coin&&SFX.coin();updateHud&&updateHud();}}
function mc34Do(op,a){a=a||{};if(mc34Guest()){try{CO.room.emit('mc34',Object.assign({op,by:mc34Me()},a),HOST.hostPeer);}catch(e){}mc34Apply(op,a,mc34Me(),true);try{mc34Sync(true);}catch(e){}return;}
  const g=mc34Apply(op,a,mc34Me());if(op==='take')mc34Give(g);try{saveGame&&saveGame(true);}catch(e){}}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('mc34',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data,by=clean(d.by||'');const g=mc34Apply(String(d.op||''),d,by);
      if(d.op==='take'&&g){const peer=Object.keys(HOST.members||{}).find(q=>HOST.members[q]===by);if(peer)CO.room.emit('mc34give',{n:by,g},peer);}
      if(d.op==='buy')toast(`${by} bought ${MC34_M[d.k]?MC34_M[d.k].name.replace(/^The /,'the '):'a machine'} for the farm.`,3);try{saveGame(true);}catch(e){}}catch(e){}}));
  HOST.off.push(r.on('mc34give',m=>{if(!m||m.isMe||HOST.role!=='guest'||!m.data||clean(m.data.n)!==mc34Me())return;try{mc34Give(m.data.g);}catch(e){}}));
  return r0;};}
// ---- in the yard: each machine an object you walk round, with its own spot to use it
const MC34W={objs:{},rects:{},sig:'',hold:null,run:{}};
function mc34Var(k){const m=MC34()[k],now=performance.now();if(!m)return 's';
  if(k==='wind')return mc34Seized()?'s':null;
  if(k==='feed')return (m.sacks>0||m.did===S.day)?null:'e';
  const busy=(MC34W.run[k]||0)>now||(m.did===S.day&&S.hour<(k==='milk'?9.5:11.5));
  if(k==='seed'&&!busy&&!Object.values(m.hop||{}).some(n=>n>0))return 'e';
  return busy?null:'s';}
function mc34Sync(force){const st=MC34();const sig=JSON.stringify(MC34_ORDER.map(k=>st[k]&&st[k].own&&st[k].x!=null&&MC34W.hold!==k?[k,st[k].x,st[k].z]:0));
  if(!force&&sig===MC34W.sig)return;MC34W.sig=sig;
  for(const k of MC34_ORDER){const o=MC34W.objs[k];if(o){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);delete MC34W.objs[k];}
    const q=MC34W.rects[k];if(q){const i=rects.indexOf(q);if(i>=0)rects.splice(i,1);delete MC34W.rects[k];}}
  for(const k of MC34_ORDER){const m=st[k];if(!m||!m.own||m.x==null||MC34W.hold===k)continue;const M=MC34_M[k];
    try{MC34W.objs[k]=obj(mc34Key(k,0,mc34Var(k)||undefined),m.x,m.z,{kind:'prop',mc34:k});}catch(e){}
    const q={x0:m.x-M.w/2+.12,z0:m.z-M.d,x1:m.x+M.w/2-.12,z1:m.z-.08};MC34W.rects[k]=q;rects.push(q);}
  if(typeof NAV!=='undefined')NAV.sig='';}
// every frame: each machine shows the frame it's on (turning, grinding, cranking) or stands still
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{for(const k of MC34_ORDER){const o=MC34W.objs[k];if(!o)continue;const M=MC34_M[k],v=mc34Var(k);
    let wind=1;if(k==='wind'&&typeof S.weather==='string'&&/rain|storm|wind/.test(S.weather))wind=1.8;
    o.spr=v?mc34Key(k,0,v):mc34Key(k,Math.floor(t*M.fps*wind)%M.frames);}}catch(e){}};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{MC34W.objs={};MC34W.rects={};mc34Sync(true);}catch(e){}return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{MC34W.hold=null;mc34Sync(true);}catch(e){}return r;};}
{const _wr=worldRebuild;worldRebuild=function(keys){const r=_wr.apply(this,arguments);try{if(!keys||keys.has('emp'))mc34Sync(true);}catch(e){}return r;};}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<1.5)return;t=0;try{mc34Sync(false);}catch(e){}};}
for(const k of MC34_ORDER){const M=MC34_M[k];
  interact.push({get x(){const m=MC34()[k];return m&&m.x!=null?m.x:-9999;},get z(){const m=MC34()[k];return m&&m.x!=null?m.z+.3:-9999;},r:Math.max(1.2,M.w/2+.5),
    on:()=>!S.room&&mc34Placed(k)&&MC34W.hold!==k,label:()=>mc34Label(k),ok:()=>true,act(){mc34Open(k);}});}
function mc34Label(k){const m=MC34()[k],M=MC34_M[k];if(!m)return M.short;
  if(k==='wind')return mc34Seized()?'Windmill (seized)':'Windmill';
  if(k==='mill')return (m.out&&(m.out.feed||m.out.flour))?`Feed mill (${(m.out.feed||0)+(m.out.flour||0)} sacks)`:'Feed mill';
  if(k==='feed')return `Hen feeder (${m.sacks|0})`;
  if(k==='milk')return m.cool?`Milk cooler (${m.cool})`:'Milking machine';
  return Object.values(m.out||{}).some(n=>n>0)?'Seed cleaner (seed)':'Seed cleaner';}
// ---- placing one: building mode, the same as a bench or the coop
function mc34Place(k){const M=MC34_M[k],m=MC34()[k];if(!m||!m.own)return;if(S.room){toast('Go back outside first.',2);return;}
  $('note').hidden=true;S.paused=false;MC34W.hold=m.x!=null?k:null;mc34Sync(true);
  startPlace({spr:mc34Key(k,0,k==='feed'?'e':'s'),w:M.w,d:M.d,name:M.short.toLowerCase(),
    done(x,z){MC34W.hold=null;mc34Do('place',{k,x,z});mc34Sync(true);toast(`${M.short} set down. Walk up to it to use it.`,2.6);},
    cancel(){MC34W.hold=null;mc34Sync(true);}});}
// ---- dawn: the host's farm runs every machine that has what it needs
function mc34Clean(m){let n=0;m.hop=m.hop||{};m.out=m.out||{};
  for(const q of Object.keys(m.hop)){while((m.hop[q]|0)>0&&n<8){m.hop[q]--;n++;if(m.box&&typeof handBox==='function'){const B=handBox();B.seeds[q]=(B.seeds[q]||0)+2;}else m.out[q]=(m.out[q]||0)+2;}}
  for(const q of Object.keys(m.hop))if(!(m.hop[q]>0))delete m.hop[q];if(n){m.did=S.day;MC34W.run.seed=performance.now()+3500;}return n;}
function mc34Dawn(e0,e1){if(typeof empHost==='function'&&!empHost())return;const st=MC34(),E=EMP(),did=[];if(st.dawn===S.day)return;st.dawn=S.day;
  const w=st.wind;if(w&&w.own&&w.x!=null){if(mc34Seized())did.push('the windmill stood seized (it wants grease)');
    else{const list=tiles.filter(t=>t.crop&&t.crop.stage<3&&!t.crop.watered&&!t.gh).map(t=>[Math.hypot(t.x-w.x,t.z-w.z),t]).sort((a,b)=>a[0]-b[0]).slice(0,60);
      for(const [,t] of list){t.crop.watered=true;t.wet=true;}w.did=S.day;w.n=list.length;if(list.length)did.push(`the windmill watered ${list.length} square${list.length>1?'s':''}`);}}
  const m=st.mill;if(m&&m.own&&m.x!=null){const hop=m.hop=m.hop||{};const flour=m.mode==='flour';const n=flour?Math.min(12,hop.barley|0):Math.min(12,(hop.barley|0)+(hop.corn|0));
    const sacks=Math.floor(n/(flour?3:2)),used=sacks*(flour?3:2);
    if(sacks>0){if((m.fuel|0)<1)did.push('the feed mill had no kerosene');
      else{m.fuel--;let left=used;for(const q of (flour?['barley']:['barley','corn'])){const t=Math.min(left,hop[q]|0);hop[q]=(hop[q]|0)-t;left-=t;if(!(hop[q]>0))delete hop[q];}
        m.out=m.out||{};const kk=flour?'flour':'feed';m.out[kk]=(m.out[kk]||0)+sacks;m.did=S.day;did.push(`the feed mill ground ${sacks} sack${sacks>1?'s':''} of ${flour?'flour':'mash'}`);}}}
  const f=st.feed;if(f&&f.own&&f.x!=null&&S.coop&&HENS.length){const need=Math.ceil(HENS.length/4);
    // the nest holds twice as many (unless someone already gathered them this morning)
    if(e1===Math.min(8,(e0|0)+HENS.length))S.eggs=Math.min(16,(e0|0)+HENS.length);
    if((f.sacks|0)>=need){f.sacks-=need;const extra=Math.ceil(HENS.length/2);S.eggs=Math.min(16,S.eggs+extra);f.did=S.day;did.push(`the hens ate ${need} sack${need>1?'s':''} of mash and laid ${extra} more`);}
    else did.push('the hen feeder is empty');}
  const k2=st.milk;if(k2&&k2.own&&k2.x!=null&&S.cows>0){if((k2.fuel|0)<1)did.push('the milking machine had no kerosene');
    else{k2.fuel--;const got=(S.milk|0)+S.cows;S.milk=0;k2.cool=Math.min(MC34_CAP.cool,(k2.cool|0)+got);k2.did=S.day;did.push(`the milking machine milked ${got} bottle${got>1?'s':''} into the cooler`);}}
  const s=st.seed;if(s&&s.own&&s.x!=null&&Object.values(s.hop||{}).some(n=>n>0)){if((E.hands||[]).length){const n=mc34Clean(s);if(n)did.push(`a hand cranked the seed cleaner (${n*2} seeds)`);}
    else did.push('the seed cleaner waits for someone to crank it');}
  st.last={day:S.day,did};
  if(did.length)setTimeout(()=>toast('Machines at dawn: '+did.join('; ')+'.',5),7200);}
{const _nd=newDay;newDay=function(){const e0=S.eggs;const r=_nd.apply(this,arguments);try{mc34Dawn(e0,S.eggs);}catch(e){console.warn('mc34',e);}return r;};}
// ---- each machine's own page, from the machine itself
function mc34Open(k){const M=MC34_M[k],m=MC34()[k];if(!m)return;const B=(a,l,dis)=>`<button data-mc34="${a}" ${dis?'class="nope"':''}>${l}</button>`;
  const fuelRow=()=>bizRow(`<b><img class="mc34ic" src="${iconOf('mc_kero')}" alt="">Kerosene: ${m.fuel|0} of ${MC34_CAP.fuel} cans</b><small>A can a working day. You carry ${inv('mc_kero')} (Pruitt’s garage sells them).</small>`,'',B('fuel',(()=>{const n=Math.min(inv('mc_kero'),MC34_CAP.fuel-(m.fuel|0));return n>0?`Pour in ${n} can${n>1?'s':''}`:inv('mc_kero')?'Tank full':'No cans';})(),!inv('mc_kero')||(m.fuel|0)>=MC34_CAP.fuel));
  const loadRows=(kinds)=>{let h='';for(const q of kinds){const n=basketCount(q);if(!n)continue;h+=bizRow(`<b>${SEEDS[q].name}</b><small>${n} in your basket</small>`,'',B('load:'+q,'Load them'));}return h||`<p class="bzs">Nothing in your basket it can take.</p>`;};
  const ic=q=>`<img class="mc34ic" src="${iconOf('mc_'+q)}" alt="">`,warn=(q,t)=>`<p class="mc34warn">${ic(q)}${t}</p>`;
  let h=`<div class="bzled"></div><h3>${M.name}</h3>`;
  if((k==='mill'||k==='milk')&&!(m.fuel>0))h+=warn('kero',k==='mill'?'No kerosene: it won’t grind at dawn.':'No kerosene: it won’t milk at dawn.');
  if(k==='wind'&&mc34Seized())h+=warn('grease','Seized: grease it, or it won’t pump.');
  if(k==='feed'&&!(m.sacks>0))h+=warn('feed','No mash: the hens get nothing extra.');
  if(k==='wind'){const left=7-(S.day-(m.grease||0));
    h+=`<p class="bzs">${mc34Seized()?'<b>Seized.</b> The wheel won’t turn and the tank is going stale. It wants a tin of axle grease.':`Greased ${S.day-(m.grease||0)} morning${S.day-(m.grease||0)===1?'':'s'} ago; ${left} more before it wants grease again.`}${m.did===S.day&&m.n?` This morning it watered ${m.n} square${m.n>1?'s':''}.`:''}</p>`;
    h+=bizRow(`<b><img class="mc34ic" src="${iconOf('mc_grease')}" alt="">Axle grease</b><small>You carry ${inv('mc_grease')} tin${inv('mc_grease')===1?'':'s'} (Pruitt’s garage sells them).</small>`,'',B('grease','Grease it',!inv('mc_grease')));}
  else if(k==='mill'){const hop=m.hop||{},o=m.out||{};
    h+=`<p class="bzs">In the hopper: <b>${hop.barley|0} barley</b>, <b>${hop.corn|0} corn</b> (it holds ${MC34_CAP.mill}). It grinds up to twelve at dawn.</p>`;
    h+=bizRow(`<b>Making</b><small>${m.mode==='flour'?'Three barley a sack of flour (corn waits).':'Two grain a sack of mash, barley first.'}</small>`,'',`<span class="mc34sw"><button data-mc34="${m.mode==='flour'?'mode':''}" class="${m.mode!=='flour'?'on':''}">Mash</button><button data-mc34="${m.mode==='flour'?'':'mode'}" class="${m.mode==='flour'?'on':''}">Flour</button></span>`);
    h+=fuelRow()+'<h4>Load the hopper</h4>'+loadRows(['barley','corn']);
    if(o.feed||o.flour)h+=bizRow(`<b>Ground and bagged</b><small>${[o.feed?`${o.feed} sack${o.feed>1?'s':''} of mash`:'',o.flour?`${o.flour} sack${o.flour>1?'s':''} of flour`:''].filter(Boolean).join(', ')}</small>`,'',B('take','Take the sacks'));}
  else if(k==='feed'){h+=`<p class="bzs">${S.coop?`${HENS.length} hen${HENS.length===1?'':'s'}: ${Math.ceil(Math.max(1,HENS.length)/4)} sack a morning.`:'There’s no coop yet: build one from the Farm Plans and it feeds the hens.'} In the hopper: <b>${m.sacks|0} sack${(m.sacks|0)===1?'':'s'}</b> of mash (it holds ${MC34_CAP.sacks}).</p>`;
    h+=bizRow(`<b><img class="mc34ic" src="${iconOf('mc_feed')}" alt="">Laying mash</b><small>You carry ${inv('mc_feed')} (Bell’s Feed & Stock, or your own feed mill).</small>`,'',B('sacks','Put it in',!inv('mc_feed')||(m.sacks|0)>=MC34_CAP.sacks));}
  else if(k==='milk'){h+=`<p class="bzs">${S.cows?`${S.cows} cow${S.cows>1?'s':''} in the barn.`:'No cows in the barn yet (Bell’s Feed & Stock sells them).'} In the cooler: <b>${m.cool|0} bottle${(m.cool|0)===1?'':'s'}</b> (it keeps ${MC34_CAP.cool}).</p>`;
    h+=fuelRow();if(m.cool)h+=bizRow(`<b>The cooler</b><small>${m.cool} bottle${m.cool>1?'s':''} of milk, cold.</small>`,'',B('take','Take the milk'));}
  else if(k==='seed'){const hop=m.hop||{},o=m.out||{},inH=Object.entries(hop).filter(([,n])=>n>0);
    h+=`<p class="bzs">In the hopper: ${inH.length?inH.map(([q,n])=>`<b>${n} ${SEEDS[q]?SEEDS[q].name.toLowerCase():q}</b>`).join(', '):'nothing'} (it holds ${MC34_CAP.seed}). Two seeds a head, eight heads a cranking. ${(EMP().hands||[]).length?'A hand cranks it at dawn.':'With no hands hired, you crank it.'}</p>`;
    h+=bizRow(`<b>The seed goes to</b><small>${m.box?'the hands’ seed box, for Old Merritt to sow':'a tray here, for you to take'}</small>`,'',B('box',m.box?'Keep it here':'Into the seed box'));
    h+=bizRow(`<b>Crank it</b><small>Eight heads through the screens now.</small>`,'',B('crank','Crank',!inH.length));
    h+='<h4>Load the hopper</h4>'+loadRows(Object.keys(SEEDS));
    const outN=Object.values(o).reduce((a,b)=>a+(b|0),0);if(outN)h+=bizRow(`<b>Clean seed in the tray</b><small>${Object.entries(o).filter(([,n])=>n>0).map(([q,n])=>`${n} ${SEEDS[q]?SEEDS[q].name.toLowerCase():q}`).join(', ')}</small>`,'',B('take','Take the seed'));}
  h+=bizRow(`<b>Move it</b><small>Pick it up and set it down somewhere else in the yard.</small>`,'',B('move','Move it'));
  openNote(h,'Done');const N=$('noteText');if(!N)return;const re=()=>setTimeout(()=>mc34Open(k),0);
  N.querySelectorAll('[data-mc34]').forEach(b=>b.onclick=()=>{const a=b.dataset.mc34;if(!a)return;   // (the switch's lit side is already chosen)

    if(a==='move'){mc34Place(k);return;}
    if(a==='fuel'){const n=Math.min(inv('mc_kero'),MC34_CAP.fuel-(m.fuel|0));if(n<1){SFX.deny&&SFX.deny();return;}takeInv('mc_kero',n);mc34Do('fuel',{k,n});SFX.page&&SFX.page();toast(`${n} can${n>1?'s':''} into the tank.`,1.6);}
    else if(a==='grease'){if(!inv('mc_grease')){SFX.deny&&SFX.deny();return;}takeInv('mc_grease',1);mc34Do('grease',{k});SFX.page&&SFX.page();toast('You grease the gearbox. The wheel catches the wind and turns.',2.6);}
    else if(a==='sacks'){const n=Math.min(inv('mc_feed'),MC34_CAP.sacks-(m.sacks|0));if(n<1){SFX.deny&&SFX.deny();return;}takeInv('mc_feed',n);mc34Do('sacks',{k,n});SFX.page&&SFX.page();}
    else if(a.startsWith('load:')){const q=a.slice(5),cap=k==='mill'?MC34_CAP.mill:MC34_CAP.seed,have=Object.values(m.hop||{}).reduce((x,y)=>x+(y|0),0);const n=Math.min(basketCount(q),cap-have);
      if(n<1){SFX.deny&&SFX.deny();toast('It’s full.',1.4);return;}takeBasket(q,n);mc34Do('load',{k,kind:q,n});SFX.page&&SFX.page();updateHud&&updateHud();}
    else if(a==='mode'){mc34Do('mode',{k,mode:m.mode==='flour'?'feed':'flour'});}
    else if(a==='box'){mc34Do('box',{k,v:!m.box});}
    else if(a==='take'){mc34Do('take',{k});}
    else if(a==='crank'){MC34W.run.seed=performance.now()+3500;SFX.thud&&SFX.thud(0,.2);mc34Do('crank',{k});toast(m.box?'You crank it through. The seed goes into the hands’ box.':'You crank it through. Clean seed in the tray.',2.4);}
    re();});}
// ---- the farm book's Machines page
function mc34Thumb(k){const key='mc34_thumb_'+k;if(ICON[key])return ICON[key];const src=IMG['mem:'+mc34Key(k,0,k==='wind'?undefined:'s')];   // (the windmill's 's' is seized: show it turning)
const M=MC34_M[k];
  const cw=k==='wind'?72:Math.min(88,src.width),ch=Math.min(64,src.height);const c=document.createElement('canvas');c.width=cw;c.height=ch;const g=c.getContext('2d');
  g.drawImage(src,k==='wind'?2:Math.max(0,(src.width-cw)>>1),k==='wind'?0:src.height-ch,cw,ch,0,0,cw,ch);return ICON[key]=c.toDataURL();}
const MC34_BLURB={wind:'Waters up to sixty growing crops every morning, the nearest first. A tin of axle grease every seven mornings.',
  mill:'Grinds barley and corn into laying mash, or barley into flour, at dawn. A can of kerosene a working day.',
  feed:'Keeps the hens in mash and water, and they lay half as many eggs again. A sack a morning feeds four hens.',
  milk:'Milks every cow at dawn, a bottle more each, into a cooler that keeps thirty. A can of kerosene a working day.',
  seed:'Cleans two seeds out of every head of a crop, into the hands’ seed box. A hand cranks it, or you do.'};
function mc34St(icon,txt,warn){const k=!icon?'':icon[0]==='@'?((ITEMS[icon.slice(1)]&&ITEMS[icon.slice(1)].icon)||icon.slice(1)):'mc_'+icon;return `<span class="mc34st${warn?' warn':''}">${k?`<img src="${iconOf(k)}" alt="">`:''}${txt}</span>`;}
function mc34State(k){const m=MC34()[k];if(!m||!m.own)return '';if(m.x==null)return mc34St('','Not set down yet.',true);
  const hop=Object.values(m.hop||{}).reduce((a,b)=>a+(b|0),0);
  if(k==='wind'){const d=S.day-(m.grease||0);return mc34Seized()?mc34St('grease','Seized: it wants grease',true):mc34St('grease',`Greased ${d===0?'today':d===1?'yesterday':d+' days ago'}`,false);}
  if(k==='mill')return mc34St('kero',`Kerosene ${m.fuel|0} of ${MC34_CAP.fuel}`,!(m.fuel>0))+mc34St('@'+(Object.keys(m.hop||{}).find(q=>m.hop[q]>0)||'barley'),`${hop} grain in the hopper`,false)+(m.out&&(m.out.feed||m.out.flour)?mc34St('feed',`${(m.out.feed||0)+(m.out.flour||0)} sacks to take`,false):'');
  if(k==='feed')return mc34St('feed',`Mash ${m.sacks|0} of ${MC34_CAP.sacks}`,!(m.sacks>0))+(S.coop?'':mc34St('@egg','No coop yet',true));
  if(k==='milk')return mc34St('kero',`Kerosene ${m.fuel|0} of ${MC34_CAP.fuel}`,!(m.fuel>0))+mc34St('@milk',`${m.cool|0} bottles in the cooler`,false)+(S.cows?'':mc34St('@milk','No cows yet',true));
  return mc34St('@'+(Object.keys(m.hop||{}).find(q=>m.hop[q]>0)||'pumpkin'),`${hop} in the hopper`,false)+mc34St(m.box?'@hand_seedbox':'feed',m.box?'Seed to the hands’ box':'Seed to its tray',false);}
function mc34Book(){const st=MC34();let h=`<p class="bzs">Machines from Pruitt’s garage and Bell’s, set down in the yard. Each one works at dawn while you sleep, so long as it has what it needs.</p>`;
  for(const k of MC34_ORDER){const M=MC34_M[k],m=st[k],p=mc34Price(k);
    const need=!m||!m.own?(k==='feed'&&!S.coop?' You’ll want the chicken coop first.':k==='milk'&&!S.cows?' You’ll want a cow first.':''):'';
    const btn=!m||!m.own?`<button data-mc34buy="${k}" ${S.coins<p?'class="nope"':''}>${p?'Buy · '+p:'Free'}</button>`:m.x==null?`<button data-mc34put="${k}">Set it down</button>`:`<button data-mc34put="${k}">Move it</button>`;
    h+=`<div class="mc34r"><img class="mc34th" src="${mc34Thumb(k)}" alt=""><div class="mc34t"><b>${M.name}</b><small>${MC34_BLURB[k]}${need}</small>${m&&m.own?`<div class="mc34sts">${mc34State(k)}</div>`:''}</div><div class="mc34b">${btn}</div></div>`;}
  const L=st.last;if(L&&L.day===S.day&&L.did.length)h+=`<p class="bwlead">This morning: ${L.did.join('; ')}.</p>`;return h+'<div style="height:18px"></div>';}
function mc34TabBtn(on){const N=$('noteText');const tabs=N&&N.querySelector('.bztabs');if(!tabs||tabs.querySelector('[data-mc34tab]'))return;const b=document.createElement('button');b.dataset.mc34tab='1';b.textContent='Machines';if(on)b.className='on';
  b.onclick=()=>setTimeout(()=>empOpen('machines'),0);tabs.appendChild(b);}
{const _eo=empOpen;empOpen=function(tab){if(tab!=='machines'){const r=_eo.apply(this,arguments);try{mc34TabBtn(false);}catch(e){}return r;}
  _eo.call(this,'town');const N=$('noteText');if(!N)return;const tabs=N.querySelector('.bztabs');if(!tabs)return;while(tabs.nextSibling)tabs.nextSibling.remove();
  tabs.querySelectorAll('button').forEach(b=>b.classList.remove('on'));mc34TabBtn(true);const box=document.createElement('div');box.innerHTML=mc34Book();N.appendChild(box);
  box.querySelectorAll('[data-mc34buy]').forEach(b=>b.onclick=()=>{const k=b.dataset.mc34buy,p=mc34Price(k);if(MC34()[k]&&MC34()[k].own)return;
    if(S.coins<p){SFX.deny&&SFX.deny();toast(`That’s ${p} coins. You have ${S.coins}.`,2.2);return;}S.coins-=p;SFX.coin&&SFX.coin();updateHud&&updateHud();
    mc34Do('buy',{k});toast(`${MC34_M[k].name} comes out on the truck. Choose where it stands.`,2.6);setTimeout(()=>mc34Place(k),60);});
  box.querySelectorAll('[data-mc34put]').forEach(b=>b.onclick=()=>mc34Place(b.dataset.mc34put));};}
{const css=document.createElement('style');css.textContent=`#noteText .mc34r{display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px dashed rgba(90,60,30,.35)}
#noteText .mc34th{flex:0 0 76px;width:76px;height:auto;max-height:64px;object-fit:contain;object-position:center bottom;image-rendering:pixelated}
#noteText .mc34t{flex:1 1 auto;min-width:0}#noteText .mc34t small{display:block;line-height:1.3}#noteText .mc34b{flex:0 0 auto}
#noteText .mc34sts{margin-top:3px}#noteText .mc34st+.mc34st::before{content:'·';margin:0 7px 0 -3px;color:#7a5a3a}#noteText .mc34st{display:inline-block;margin-right:10px;font-size:12px;white-space:nowrap}
#noteText .mc34st img,#noteText .mc34ic{width:16px;height:16px;vertical-align:-3px;margin-right:4px;image-rendering:pixelated}
#noteText .mc34st.warn,#noteText .mc34warn{color:#a8281c;font-weight:bold}#noteText .mc34warn{margin:4px 0 6px}
#noteText .mc34sw{display:inline-flex}#noteText .mc34sw button{font:inherit;font-size:13px;padding:4px 10px;background:#c8b48c;color:#3a2210;border:0;cursor:pointer;box-shadow:inset 0 0 0 1px #120a04}#noteText .mc34sw button.on{background:#a8502a;color:#f4e6c8;cursor:default}
#noteText .mc34b button{font:inherit;font-size:13px;padding:4px 10px;background:#3a2210;color:#f4e6c8;border:0;cursor:pointer;box-shadow:inset 0 0 0 1px #120a04,inset 0 2px 0 #5a3a1e}`;document.head.appendChild(css);}
