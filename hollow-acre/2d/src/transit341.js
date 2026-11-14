/* ================= t341 the county transit. The owner: "make it so you can eventually build bus and train systems so the
   town can travel around faster you make a profit and you can travel around faster for free and you can charge other
   players if in competitive mode".
   - It opens after Chapter One (the valley has no road out, so it might as well have a bus). The farm book gets a Transit page,
     and the land office in the Town Hall keeps the county's transit papers.
   - THE BUS: buy the county's old bus, then put up stops where it should call: the farm, the town, Wickham, the quarry and
     ridge road, Black Lake, Route 9 west by the motel, the Deep Corn and the Low Fields. It runs the roads from six in the
     morning to nine at night, there and back, and you can see it go by.
   - THE TRAIN: a light railway laid along the county roads, the way the old lines ran: the Valley line from the farm to Marrow
     Hollow and on to Wickham, and later the South line down Mill Road to the Deep Corn and the Low Fields.
   - The town rides: anyone with a long way to go walks to the nearest stop, waits, gets on, and gets off at the far end.
     Their fares, and the town's, come in every morning, less the upkeep, on the morning slip and on the Transit page.
   - You ride free. In competitive play the owner sets a fare and other players pay it, to the owner, when they ride.
   ================= */
// ---------------------------------------------------------------- the paint box (hue-shifted ramps, dark to light)
const T41P={
  green:['#121c17','#1d2e24','#2b4434','#3f6246','#5e8259'],
  cream:['#4a4234','#776c54','#a49674','#c9bc96','#e6dcbb'],
  roof:['#33322e','#55534c','#7b786e','#a19d90','#c3bfb1'],
  glass:['#0d1218','#161f29','#24323f','#3c5163','#6c8899'],
  tyre:['#0b0b0d','#17171a','#242429','#34343b'],
  steel:['#1f2228','#3c414b','#5d636e','#878e98','#b6bcc2'],
  red:['#33100d','#5e1a14','#8c281c','#b8402a','#d9694a'],
  iron:['#101113','#1c1e22','#2d3036','#454951','#676c75'],
  maroon:['#24100e','#3e1918','#5c2522','#7c3530','#9c4c40'],
  wood:['#24170f','#432b1b','#674329','#8d6239','#b48752'],
  plank:['#2e2318','#4a3826','#6c5438','#8e7450','#b09670'],
  brass:['#3e2a0c','#6e4e18','#a07a2c','#cca450','#ecd68a'],
  lamp:['#5a3a10','#9a6a1c','#d8a838','#f4d478','#fff2c0']};
// M and W five wide: at three wide they print as solid blocks
const T41_W5={M:'1000111011101011000110001',W:'1000110001101011101110001'};
const t41R=(ramp,v)=>ramp[Math.max(0,Math.min(ramp.length-1,Math.round(v)))];
// the kit: mc34's canvas, pixels, ellipses, polygons and one outline pass, plus a filled box and the little 3x5 letters
function t41Kit(W,H){const K=mc34Kit(W,H);
  K.box=(x,y,w,h,col)=>{if(w>0&&h>0)K.px(x,y,w,h,col);};
  K.text=(s,x,y,col)=>{let cx=x;for(const ch of String(s).toUpperCase()){if(ch===' '){cx+=3;continue;}const W5=T41_W5[ch];
      if(W5){for(let i=0;i<25;i++)if(W5[i]==='1')K.px(cx+(i%5),y+Math.floor(i/5),1,1,col);cx+=6;continue;}
      const G=typeof PXFONT!=='undefined'&&PXFONT[ch];
      if(G){for(let i=0;i<15;i++)if(G[i]==='1')K.px(cx+(i%3),y+Math.floor(i/3),1,1,col);cx+=4;}else if(ch==='.'){K.px(cx,y+4,1,1,col);cx+=2;}else cx+=4;}return cx-x-1;};
  K.mirror=()=>{const c2=document.createElement('canvas');c2.width=W;c2.height=H;const g2=c2.getContext('2d');g2.translate(W,0);g2.scale(-1,1);g2.drawImage(K.c,0,0);K.g.clearRect(0,0,W,H);K.g.drawImage(c2,0,0);};
  K.textW=s=>{let n=0;for(const ch of String(s).toUpperCase())n+=ch===' '?3:ch==='.'?2:T41_W5[ch]?6:4;return n-1;};
  return K;}
// an iron ramp with more steps than mc34's, so black iron still turns its form
const T41I=['#141519','#23252b','#34373f','#4a4e58','#666b77','#8a909c'];
// a road wheel seen from the side: tyre lit from the top-left, rim, hub, lug marks that turn (pale, so they show in shade)
function t41Wheel(K,cx,cy,r,f,hubR,lugs){const T=T41P.tyre,S=T41P.steel;
  K.ell(cx,cy,r,r,(x,y,nx,ny,d)=>d>.72?(nx+ny<-.55?T[3]:nx+ny>.6?T[0]:T[1]):(d>.64?T[0]:null));
  const hr=hubR||Math.round(r*.5);K.ell(cx,cy,hr,hr,(x,y,nx,ny,d)=>d>.78?S[1]:(nx+ny<-.4?S[4]:nx+ny>.5?S[2]:S[3]));
  K.px(cx,cy,1,1,S[0]);const n=lugs||3;for(let k=0;k<n;k++){const a=(f/3)*(Math.PI*2/n)+k*Math.PI*2/n;K.px(Math.round(cx+Math.cos(a)*(hr+1.6)),Math.round(cy+Math.sin(a)*(hr+1.6)),1,1,'#8e8e96');}}
// an engine's driving wheel: tyre, eight spokes (lit on the leading edge), a dark counterweight, the crank pin turning
function t41Driver(K,cx,cy,r,f){const I=T41I,S=T41P.steel;
  K.ell(cx,cy,r,r,(x,y,nx,ny,d)=>d>.8?(nx+ny<-.5?S[3]:nx+ny>.5?I[0]:I[2]):null);
  const rot=(f/3)*Math.PI/4;for(let k=0;k<8;k++){const a=rot+k*Math.PI/4;for(let t=2;t<r*.82;t+=.5){const x=Math.round(cx+Math.cos(a)*t),y=Math.round(cy+Math.sin(a)*t);K.px(x,y,1,1,Math.cos(a-2.36)>0?I[4]:I[3]);}}
  const ca=rot+Math.PI;K.ell(Math.round(cx+Math.cos(ca)*r*.45),Math.round(cy+Math.sin(ca)*r*.45),r*.42,r*.3,()=>I[1]);
  K.ell(cx,cy,2.5,2.5,(x,y,nx,ny)=>nx+ny<0?S[4]:S[2]);}
// a glass pane lit from the top-left: sky at the top, a diagonal glint, dark below; slantL/slantR lean one top corner back
function t41Pane(K,a,b,t,bb,o){o=o||{};const GL=T41P.glass;for(let x=a;x<=b;x++){let tt=t;if(o.slantR&&x>b-o.slantR)tt+=Math.round((x-(b-o.slantR))*1.3);if(o.slantL&&x<a+o.slantL)tt+=Math.round((a+o.slantL-x)*1.3);
    for(let y=tt;y<=bb;y++){let col=y<tt+3?GL[2]:GL[1];const d=(x-a)+(y-tt);if(d>=4&&d<=6)col=GL[3];else if(d===7)col=GL[2];if(o.warm){const core=x>a+1&&x<b-1&&y>tt+2&&y<bb-1;col=y<tt+2?'#b8863e':core?(d>=4&&d<=6?'#fff2c8':'#f2d48a'):(d>=4&&d<=6?'#f0cc80':'#d2a052');}K.px(x,y,1,1,col);}}
  if(o.who){const hx=Math.round((a+b)/2)+(o.who%2?-2:2),hc=['#3a2a20','#5a4430','#2a2218','#6a5a48'][o.who%4];K.ell(hx,bb-3,3,4,()=>hc);K.box(hx-4,bb-1,9,2,'#2a2a30');}
  if(o.sill)for(let x=a;x<=b;x++)K.px(x,bb+1,1,1,o.sill);}
// ---------------------------------------------------------------- THE TOWN STOP AND THE SHARED PARTS
// The vehicles, the shelters and the benches are built as models in art41b.js; here: the town's post-and-disc stop (on a
// pavement, square to you), the shelter roof's ramp, and the end-on running gear the models stand on.
const T41_SH=['#2c2a26','#3e3b35','#555148','#6c675c'];
function t41Post(K,px,top,gy){const S=T41P.steel,G=T41P.green,C=T41P.cream;K.box(px,top+8,3,gy-top-8,S[2]);K.px(px,top+8,1,gy-top-8,S[3]);
  K.ell(px+1,top,11,11,(x,y,nx,ny,d)=>d>.8?G[1]:(nx+ny<-.7?C[4]:C[3]));K.text('BUS',px-4,top-2,G[1]);}
const T41_POST={W:40,H:76,gy:72};
function t41StopPost(){const {W,H,gy}=T41_POST,G=T41P.green,C=T41P.cream,Wd=T41P.wood;const K=t41Kit(W,H);
  t41Post(K,12,14,gy);K.box(16,34,16,20,Wd[1]);K.box(17,35,14,18,C[4]);for(let y=38;y<52;y+=3)K.box(19,y,10,1,'#7a6a54');K.box(17,35,14,2,G[2]);
  K.outline();K.shadow(20,gy,12,2);return K.c;}
// the running gear seen end-on: two wheels on the rails 16 px each side of the middle (lit tread, the flange stepping down inside
// it), the axle between them, an axle box outside each wheel with its leaf spring up to the frame. shade=1 puts the dark of
// the space under the car behind it all (drawn after the outline so it never gets one).
function t41EndGear(K,cx,top,gy,shade){const I=T41I,wh=Math.min(20,gy-top-2),wt=gy-wh,ay=Math.round(gy-wh/2);
  for(let x=cx-15;x<=cx+15;x++){K.px(x,ay-1,1,1,I[3]);K.px(x,ay,1,1,I[1]);}
  for(const sx of [-1,1]){const x=cx+sx*16;
    for(let y=wt;y<gy;y++){const end=y===wt||y===gy-1;K.px(x-1,y,1,1,end?null:I[4]);K.px(x,y,1,1,I[2]);K.px(x+1,y,1,1,end?null:I[1]);}
    for(let y=ay;y<gy-1;y++)K.px(x-sx*2,y,1,1,sx<0?I[1]:I[3]);
    const bx=x+sx*4;K.box(bx-2,ay-3,5,6,I[2]);K.box(bx-2,ay-3,5,1,I[4]);K.box(bx-2,ay+2,5,1,I[0]);
    for(let y=top;y<ay-3;y++){const k=(y-top)%3;K.px(bx-2,y,5,1,k===0?I[4]:k===1?I[2]:I[1]);}}
  if(shade)K.under=()=>{const g=K.g;g.save();g.globalCompositeOperation='destination-over';g.fillStyle='rgba(12,10,9,.62)';g.fillRect(cx-13,top,27,gy-top-1);g.restore();};}
// ---------------------------------------------------------------- THE PLATFORM, ITS NAME BOARD, THE CROSSING SIGN, THE BUFFER
// A low timber platform lx by lz metres: plank deck seen from above (nail lines over each joist), the kerb face along its near
// edge, and a strip along the track edge worn pale by boots.
function t41Platform(lx,lz,edge){const Pk=T41P.plank,ppm=32,dw=Math.round(lx*ppm),dd=Math.round(lz*ppm),W=dw+4,H=dd+16,top=3,face=top+dd;const K=t41Kit(W,H);const along=lx>=lz;
  for(let y=top;y<face;y++)for(let x=2;x<dw+2;x++){const u=along?y-top:x-2,v=along?x-2:y-top;
      const bd=Math.floor(u/7),j=Math.floor((v+bd*23)/53);let col=u%7===0?Pk[1]:((bd*5+j*3)%4===1?'#9a7f5a':Pk[3]);
      if((v+bd*23)%53===0)col=Pk[1];
      // nail pairs over the joists, each board's a little off its neighbour's, a few missing
      const sp=((v+bd*23)%53+53)%53,seg=Math.floor((v+bd*23)/53),hh=Math.sin(bd*12.9898+seg*78.233)*43758.5453,hf=hh-Math.floor(hh);if(hf>.45&&(sp===2||sp===51)&&(u%7===2||u%7===4))col=Pk[1];
      const w=edge==='e'?dw+1-x:edge==='w'?x-2:edge==='n'?y-top:face-1-y;if(w<5&&u%7!==0)col=w<1?Pk[2]:'#a89070';   // worn pale along the track edge
      if(x<4||y<top+2)col=w<5?'#b8a080':Pk[4];K.px(x,y,1,1,col);}
  for(let x=2;x<dw+2;x++)for(let y=face;y<face+9;y++)K.px(x,y,1,1,y===face?Pk[2]:y<face+3?Pk[1]:Pk[0]);
  for(let x=10;x<dw-4;x+=26)K.box(x,face+3,2,6,Pk[2]);
  K.outline();return {c:K.c,gy:face+9,ax:W/2};}
function t41NameBoard(name){const Wd=T41P.wood,C=T41P.cream;const K0=t41Kit(1,1),tw=K0.textW(name);
  const W=Math.max(40,tw+18),H=52,gy=48;const K=t41Kit(W,H);
  for(const x of [6,W-9])K.box(x,14,3,gy-14,Wd[2]),K.px(x,14,1,gy-14,Wd[3]);
  K.box(2,5,W-4,14,Wd[1]);K.box(3,6,W-6,12,C[3]);K.box(3,6,W-6,1,C[4]);K.box(3,17,W-6,1,C[1]);K.text(name,Math.round(W/2-tw/2),9,'#2a1a10');
  K.outline();{const g=K.g;g.save();g.globalCompositeOperation='destination-over';g.fillStyle='rgba(14,10,8,.42)';for(const x of [7,W-8]){g.beginPath();g.ellipse(x+4,gy-.5,5,1.8,0,0,7);g.fill();}g.restore();}return {c:K.c,gy,ax:W/2};}
// the crossing sign, twice a man's height: a timber post, two plain boards crossed, lit along their top edges
function t41Crossbuck(){const W=60,H=100,gy=96;const K=t41Kit(W,H);const Wd=T41P.wood;
  K.box(28,26,4,gy-26,Wd[2]);K.px(28,26,1,gy-26,Wd[3]);K.px(31,26,1,gy-26,Wd[1]);K.box(27,gy-4,6,4,Wd[1]);
  for(const [a,top] of [[-Math.PI/5,0],[Math.PI/5,1]]){for(let t=-26;t<=26;t+=.5){const x=Math.round(30+t*Math.cos(a)),y=Math.round(26+t*Math.sin(a));
      K.box(x-1,y-3,3,7,top?'#c8c0ac':'#bcb39e');K.px(x-1,y-3,3,1,'#dcd5c4');K.px(x-1,y+3,3,1,'#8e8676');}}
  K.ell(30,26,2,2,()=>'#4a4238');K.outline();K.shadow(30,gy,8,2);return {c:K.c,gy,ax:30};}
// the end of the line: two timbers set on end, a beam across them banded red, an earth bank heaped behind
function t41Buffer(){const W=64,H=40,gy=36;const K=t41Kit(W,H);const Wd=T41P.wood,R=T41P.red;
  K.ell(32,gy-6,28,9,(x,y,nx,ny)=>y>gy-2?null:(nx+ny<-.3?'#6e5a3c':nx+ny>.4?'#3a2c1c':'#54442c'));
  for(const x of [14,46])K.box(x-3,gy-20,6,18,Wd[2]),K.box(x-3,gy-20,2,18,Wd[3]),K.box(x-3,gy-20,6,1,Wd[4]);
  K.box(8,gy-18,48,7,Wd[2]);K.box(8,gy-18,48,1,Wd[4]);for(let x=8;x<56;x+=12)K.box(x,gy-17,6,5,R[3]);K.box(8,gy-12,48,1,Wd[1]);
  K.outline();K.shadow(32,gy,26,3);return {c:K.c,gy,ax:32};}
// 32 x 32 icons for the slip and the pages: the bus from the front, the engine side-on
function t41Icon(kind){const K=t41Kit(32,32),G=T41P.green,C=T41P.cream,S=T41P.steel,I=T41I,R=T41P.red;
  if(kind==='bus'){K.box(5,5,22,4,T41P.roof[3]);K.box(5,9,22,9,C[3]);K.box(7,10,8,6,T41P.glass[1]);K.box(17,10,8,6,T41P.glass[1]);K.px(8,10,2,1,T41P.glass[3]);K.px(18,10,2,1,T41P.glass[3]);
    K.box(5,18,22,8,G[2]);K.box(5,18,22,1,S[4]);K.box(12,20,8,5,S[3]);K.px(7,21,2,2,T41P.lamp[3]);K.px(23,21,2,2,T41P.lamp[3]);K.box(4,26,24,2,S[3]);K.box(6,28,4,2,T41P.tyre[1]);K.box(22,28,4,2,T41P.tyre[1]);}
  else{K.box(4,10,9,12,I[3]);K.box(3,9,11,2,I[4]);K.box(6,12,5,4,T41P.glass[2]);K.box(13,14,14,8,I[2]);K.box(13,14,14,2,I[4]);K.box(14,18,10,4,G[2]);
    K.box(23,6,4,9,I[3]);K.box(22,5,6,2,I[4]);K.ell(18,13,2,2,()=>T41P.brass[3]);K.box(4,22,24,2,R[3]);
    for(const x of [8,14,20])K.ell(x,26,3,3,(xx,y,nx,ny,d)=>d>.6?I[1]:I[4]);K.poly([[26,22],[30,28],[26,28]],R[3]);}
  K.outline();return K.c.toDataURL();}
// ---------------------------------------------------------------- ONE CAMERA FOR EVERY VIEW
// Every vehicle and shelter is built once as a few solid shapes (boxes, shapes swept along their length, upright cylinders,
// domes) in its own frame: u along it (rear 0 to front L), v across it (left 0 to right Wd), h up, all in pixels at 32 to the
// metre. Each view turns that model under the game's camera: screen x = X, screen y = Z - Y, so a roof is seen from above at
// its true depth, a side or an end at its true height, and the same object turned shows the same roof, the same luggage in the
// same place. A depth buffer keeps near things over far ones; where a near part stands over a far one the far edge is
// darkened (the inner outlines); light comes from the top-left, and every face's colour is stepped down a hand-picked ramp.
const T41LT=(()=>{const l=[-.55,.72,.42],n=Math.hypot(l[0],l[1],l[2]);return l.map(v=>v/n);})();
const T41RGB=new Map();
function t41rgb(c){if(!c)return null;if(Array.isArray(c))return c;let r=T41RGB.get(c);if(r)return r;
  if(c[0]==='#'){const n=parseInt(c.slice(1),16);r=[n>>16&255,n>>8&255,n&255];}else{const m=c.match(/[\d.]+/g).map(Number);r=[m[0]|0,m[1]|0,m[2]|0];}
  T41RGB.set(c,r);return r;}
function t41Cam(L,Wd,view){switch(view){
  case 'E':return{X:(u,v)=>u,Z:(u,v)=>v,N:(a,b)=>[a,b],w:L,d:Wd};
  case 'W':return{X:(u,v)=>L-u,Z:(u,v)=>Wd-v,N:(a,b)=>[-a,-b],w:L,d:Wd};
  case 'S':return{X:(u,v)=>Wd-v,Z:(u,v)=>u,N:(a,b)=>[-b,a],w:Wd,d:L};
  default:return{X:(u,v)=>v,Z:(u,v)=>L-u,N:(a,b)=>[b,-a],w:Wd,d:L};}}
// a texture drawn with the kit, read back as a lookup: tex(s,t) gives [r,g,b] or null where nothing was drawn
function t41Tex(W,H,draw){const K=t41Kit(W,H);draw(K);const d=K.g.getImageData(0,0,W,H).data;
  const f=(s,t)=>{s=Math.floor(s);t=Math.floor(t);if(s<0||t<0||s>=W||t>=H)return null;const i=(t*W+s)*4;return d[i+3]>100?[d[i],d[i+1],d[i+2]]:null;};f.W=W;f.H=H;return f;}
// a ramp step from the light on a face: base is the step a face square to the light would get less k
const t41Sh=(ramp,lit,base,k)=>ramp[Math.max(0,Math.min(ramp.length-1,Math.round(base+(k==null?3:k)*(lit-.55))))];
function t41Scene(L,Wd,view,Hmax,o){o=o||{};const cam=t41Cam(L,Wd,view);const px=o.padX==null?6:o.padX,pt=o.padTop==null?4:o.padTop,pb=o.padBot==null?6:o.padBot;
  const W=Math.ceil(cam.w+px*2),oy=Hmax+pt,H=Math.ceil(cam.d+oy+pb),ox=px;
  const col=new Uint8ClampedArray(W*H*4),dep=new Float32Array(W*H).fill(-1e9),pid=new Int16Array(W*H).fill(-1);
  const S={L,Wd,view,cam,W,H,ox,oy,ax:Math.round(ox+cam.w/2),ay:Math.round(cam.d+oy),id:0,idc:0,F:{}};
  const put=(u,v,h,c,bias)=>{if(!c)return;const X=cam.X(u,v),Z=cam.Z(u,v);const sx=Math.floor(X+ox),sy=Math.floor(Z-h+oy);if(sx<0||sy<0||sx>=W||sy>=H)return;
    const i=sy*W+sx,d=Z+h+(bias||0);if(d<=dep[i])return;dep[i]=d;pid[i]=S.id;const rgb=t41rgb(c);col[i*4]=rgb[0];col[i*4+1]=rgb[1];col[i*4+2]=rgb[2];col[i*4+3]=255;};
  S.put=put;
  // screen position of a point in the model's frame, for overlays and for the light pass
  S.P=(u,v,h)=>[cam.X(u,v)+ox,cam.Z(u,v)-h+oy];
  const vis=(nu,nv,nh)=>{const [nX,nZ]=cam.N(nu,nv);return {ok:nh+nZ>.02,lit:nX*T41LT[0]+nh*T41LT[1]+nZ*T41LT[2]};};
  const inPoly=(P,x,y)=>{let ins=false;for(let a=0,b=P.length-1;a<P.length;b=a++){const [xa,ya]=P[a],[xb,yb]=P[b];if((ya>y)!==(yb>y)&&x<(xb-xa)*(y-ya)/(yb-ya)+xa)ins=!ins;}return ins;};
  const area=P=>{let A=0;for(let a=0,b=P.length-1;a<P.length;b=a++)A+=(P[b][0]*P[a][1]-P[a][0]*P[b][1]);return A/2;};
  // a cross-section P (pairs [c,h]) swept along an axis ('u': c is v; 'v': c is u) from a0 to a1.
  // mat(F) gives each sample's colour; F carries the face (side/cap0/cap1), the local normal, the light, the position and
  // s,t: for an upright face, s runs left to right as you'd see it standing outside it and t runs down from the top.
  S.ext=(axis,P,a0,a1,mat,o2)=>{o2=o2||{};S.id=o2.pid||++S.idc;const F=S.F;const ccw=area(P)>0;let cmin=1e9,cmax=-1e9,hmax=-1e9,hmin=1e9;for(const [c,h] of P){cmin=Math.min(cmin,c);cmax=Math.max(cmax,c);hmax=Math.max(hmax,h);hmin=Math.min(hmin,h);}
    const LP=(a,c,h)=>axis==='u'?[a,c,h]:[c,a,h];const rc=o2.round;const tt=o2.ttop==null?hmax:o2.ttop;
    for(let e=0;e<P.length;e++){const [ca,ha]=P[e],[cb,hb]=P[(e+1)%P.length];const dc=cb-ca,dh=hb-ha,len=Math.hypot(dc,dh);if(len<1e-6)continue;
      let nc=ccw?dh/len:-dh/len,nh=ccw?-dc/len:dc/len;const n=Math.max(1,Math.ceil(len/.5));
      for(let i=0;i<n;i++){const q=(i+.5)/n,c=ca+dc*q,h=ha+dh*q;let mc=nc,mh=nh;if(rc){const rx=c-rc[0],ry=h-rc[1],rl=Math.hypot(rx,ry)||1;mc=rx/rl;mh=ry/rl;}
        const nl=axis==='u'?[0,mc,mh]:[mc,0,mh];const V=vis(nl[0],nl[1],nl[2]);if(!V.ok)continue;
        for(let a=a0+.25;a<a1;a+=.5){const [u,v,hh]=LP(a,c,h);F.part='side';F.e=e;F.nl=nl;F.lit=V.lit;F.u=u;F.v=v;F.h=hh;F.a=a-a0;F.c=c;F.q=q;
          F.up=Math.abs(mh)<.25;const pos=axis==='u'?mc>0:mc<0;F.s=o2.sL!=null?(pos?a:o2.sL-a):(pos?a-a0:a1-a);F.t=tt-h;put(u,v,hh,mat(F));}}}
    for(const [cap,a,sg] of [['cap0',a0,-1],['cap1',a1,1]]){const nl=axis==='u'?[sg,0,0]:[0,sg,0];const V=vis(nl[0],nl[1],nl[2]);if(!V.ok||o2.noCaps)continue;
      for(let c=cmin+.25;c<cmax;c+=.5)for(let h=hmin+.25;h<hmax;h+=.5){if(!inPoly(P,c,h))continue;const [u,v,hh]=LP(a-sg*.01,c,h);
        F.part=cap;F.nl=nl;F.lit=V.lit;F.u=u;F.v=v;F.h=hh;F.c=c;F.up=true;F.s=(axis==='u')===(sg>0)?cmax-c:c-cmin;F.t=tt-h;put(u,v,hh,mat(F));}}};
  S.box=(u0,u1,v0,v1,h0,h1,mat,o2)=>S.ext('u',[[v0,h0],[v1,h0],[v1,h1],[v0,h1]],u0,u1,mat,o2);
  // an upright shape: a plan P (pairs [u,v]) raised from h0 to h1; round:[uc,vc] makes it a smooth cylinder
  S.vext=(P,h0,h1,mat,o2)=>{o2=o2||{};S.id=o2.pid||++S.idc;const F=S.F;const ccw=area(P)>0;let umin=1e9,umax=-1e9,vmin=1e9,vmax=-1e9;for(const [u,v] of P){umin=Math.min(umin,u);umax=Math.max(umax,u);vmin=Math.min(vmin,v);vmax=Math.max(vmax,v);}
    const rc=o2.round;let per=0;
    for(let e=0;e<P.length;e++){const [ua,va]=P[e],[ub,vb]=P[(e+1)%P.length];const du=ub-ua,dv=vb-va,len=Math.hypot(du,dv);if(len<1e-6)continue;
      const nu=ccw?dv/len:-dv/len,nv=ccw?-du/len:du/len;const n=Math.max(1,Math.ceil(len/.4));
      for(let i=0;i<n;i++){const q=(i+.5)/n,u=ua+du*q,v=va+dv*q;let mu=nu,mv=nv;if(rc){const rx=u-rc[0],ry=v-rc[1],rl=Math.hypot(rx,ry)||1;mu=rx/rl;mv=ry/rl;}
        const V=vis(mu,mv,0);if(!V.ok)continue;
        for(let h=h0+.25;h<h1;h+=.5){F.part='side';F.e=e;F.nl=[mu,mv,0];F.lit=V.lit;F.u=u;F.v=v;F.h=h;F.up=true;F.s=per+len*q;F.t=h1-h;put(u,v,h,mat(F));}}
      per+=len;}
    const V=vis(0,0,1);for(let u=umin+.25;u<umax;u+=.5)for(let v=vmin+.25;v<vmax;v+=.5){if(!inPoly(P,u,v))continue;F.part='top';F.nl=[0,0,1];F.lit=V.lit;F.u=u;F.v=v;F.h=h1;F.up=false;F.s=u-umin;F.t=v-vmin;put(u,v,h1,mat(F));}};
  S.cyl=(uc,vc,r,h0,h1,mat,seg)=>{const P=[];const n=seg||Math.max(12,Math.round(r*4));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;P.push([uc+Math.cos(a)*r,vc+Math.sin(a)*r]);}S.vext(P,h0,h1,mat,{round:[uc,vc]});};
  // a cylinder lying along u (a boiler): its round face at each end is cap0/cap1
  S.tube=(u0,u1,vc,hc,r,mat,o2)=>{const P=[];const n=Math.max(16,Math.round(r*4));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;P.push([vc+Math.cos(a)*r,hc+Math.sin(a)*r]);}S.ext('u',P,u0,u1,mat,Object.assign({round:[vc,hc]},o2||{}));};
  // a dome: half an ellipsoid on its base
  S.dome=(uc,vc,h0,r,rh,mat,pid)=>{S.id=pid||++S.idc;const F=S.F;const dth=.45/Math.max(r,rh);
    for(let th=dth/2;th<Math.PI/2;th+=dth){const cr=Math.cos(th)*r,dph=.45/Math.max(cr,.5);for(let ph=0;ph<Math.PI*2;ph+=dph){const cu=Math.cos(ph),sv=Math.sin(ph);
        let nu=Math.cos(th)*cu/r,nv=Math.cos(th)*sv/r,nh=Math.sin(th)/rh;const nl=Math.hypot(nu,nv,nh);nu/=nl;nv/=nl;nh/=nl;const V=vis(nu,nv,nh);if(!V.ok)continue;
        const u=uc+cr*cu,v=vc+cr*sv,h=h0+Math.sin(th)*rh;F.part='dome';F.nl=[nu,nv,nh];F.lit=V.lit;F.u=u;F.v=v;F.h=h;F.th=th;F.up=false;put(u,v,h,mat(F));}}};
  // a flat picture standing square to the camera (a wheel, a sign): its pixel (ax,ay) sits at the model point (u,v,h)
  S.bill=(c,u,v,h,ax,ay,bias)=>{S.id=++S.idc;const g=c.getContext('2d').getImageData(0,0,c.width,c.height).data;const X0=cam.X(u,v),Z0=cam.Z(u,v);
    for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++){const k=(j*c.width+i)*4;if(g[k+3]<100)continue;const X=X0+(i-ax)+.5,Y=h+(ay-j)-.5;
      const sx=Math.floor(X+ox),sy=Math.floor(Z0-Y+oy);if(sx<0||sy<0||sx>=W||sy>=H)continue;const ii=sy*W+sx,d=Z0+Y+(bias||0);if(d<=dep[ii])continue;
      dep[ii]=d;pid[ii]=S.id;col[ii*4]=g[k];col[ii*4+1]=g[k+1];col[ii*4+2]=g[k+2];col[ii*4+3]=255;}};
  // finish: inner outlines where a near part stands over a far one, the outer outline, the contact shadow on the ground
  S.done=(o3)=>{o3=o3||{};const T=o3.crease||5;const mark=new Uint8Array(W*H);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!col[i*4+3])continue;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=W||yy>=H)continue;const j=yy*W+xx;
        if(col[j*4+3]&&pid[j]!==pid[i]&&dep[j]>dep[i]+T){mark[i]=1;break;}}}
    for(let i=0;i<W*H;i++)if(mark[i]){col[i*4]=col[i*4]*.42+6|0;col[i*4+1]=col[i*4+1]*.42+5|0;col[i*4+2]=col[i*4+2]*.42+10|0;}
    // cast shadows: whatever stands above a receiving surface (o3.cast: [{id, top, tol}]) throws its shape onto it, down and to
    // the right of itself, away from the light
    for(const R of (o3.cast||[])){const sh=new Uint8Array(W*H);
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!col[i*4+3]||pid[i]===R.id)continue;const d=dep[i],q=y+.5-oy;const Y=(d-q)/2,Z=(d+q)/2,X=x+.5-ox;const dh=Y-R.top;
        if(dh<.5||dh>(R.max||60))continue;const X2=X+.62*dh,Z2=Z+.42*dh;const sx=Math.floor(X2+ox),sy=Math.floor(Z2-R.top+oy);if(sx<0||sy<0||sx>=W||sy>=H)continue;
        const j=sy*W+sx;if(pid[j]!==R.id)continue;const Yj=(dep[j]-(sy+.5-oy))/2;if(Math.abs(Yj-R.top)>(R.tol||1.5))continue;sh[j]=1;}
      // fill the single-pixel holes the sampling leaves, then darken
      for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;if(sh[i]||pid[i]!==R.id)continue;if(sh[i-1]&&sh[i+1]||sh[i-W]&&sh[i+W])sh[i]=2;}
      for(let i=0;i<W*H;i++)if(sh[i]){col[i*4]=col[i*4]*.7+2|0;col[i*4+1]=col[i*4+1]*.7+2|0;col[i*4+2]=col[i*4+2]*.72+8|0;}}
    const K=t41Kit(W,H);K.g.putImageData(new ImageData(col,W,H),0,0);if(o3.before)o3.before(K);K.outline();
    if(o3.shadow!==false){const g=K.g;g.save();g.globalCompositeOperation='destination-over';
      // the contact shadow on the ground under the body (o3.foot: the body's own footprint, not the platforms or the pilot)
      const ft=o3.foot||[0,L,0,Wd];const xs=[cam.X(ft[0],ft[2]),cam.X(ft[1],ft[3])],zs=[cam.Z(ft[0],ft[2]),cam.Z(ft[1],ft[3])];
      const fx=ox+Math.min(...xs)+(o3.inset||0),fw=Math.abs(xs[1]-xs[0])-2*(o3.inset||0),fz=oy+Math.min(...zs),fd=Math.abs(zs[1]-zs[0]);
      g.fillStyle='rgba(14,10,8,.42)';g.fillRect(fx,fz,fw,fd);g.fillStyle='rgba(14,10,8,.22)';g.fillRect(fx-1,fz+fd,fw+2,2);g.restore();}
    if(o3.after)o3.after(K);S.K=K;return K.c;};
  return S;}
// a small canvas to draw a billboard on
function t41Can(W,H,draw){const K=t41Kit(W,H);draw(K);return K.c;}
// a rider's head and shoulders in a pane (seen through glass, so dark against it)
function t41Rider(K,cx,bot,k,warm){const hc=warm?['#4a3020','#3a2418','#5a3a24','#2a1a10'][k%4]:['#2a2018','#3a2c20','#1e1812','#46382a'][k%4];
  const cc=warm?['#5a3a22','#3e2a1c','#6a4428','#4a3020'][(k+1)%4]:['#1e1e26','#2a2420','#22222a','#2e2a24'][(k+1)%4];
  // shoulders: a rounded slope out from the neck to the sill; a head on a short neck
  const lift=k%3;K.ell(cx,bot+1-lift*.5,3.4,3.2,(x,y)=>y<=bot?cc:null);K.ell(cx,bot-4.5-lift,1.6,1.7,()=>hc);}
const T41BR=['#2e2d29','#45433d','#5e5b53','#77736a','#8f8b80','#a6a296'];
// weather on a roof: a smooth field 0..1 with a few large soft patches (no speckle)
function t41Stain(u,v){return .5+.22*Math.sin(u*.071+v*.13)+.18*Math.sin(u*.033-v*.21+1.7)+.1*Math.sin(u*.19+v*.05+.4);}
// ---------------------------------------------------------------- THE COUNTY BUS, built once
// 6 m long (192 px), 2.5 m wide (80), 2.6 m to the crown (84). Bottle green below, a cream window band, a rounded roof, the
// rack aft of the middle with a trunk at the back, a crate and a roped sack. Door on the kerb (right) side ahead of the front
// wheel; the driver sits on the left. The rear wheels are under the 2nd and 3rd windows, the front ones under the 8th.
const T41B={L:192,Wd:80,H:84,wr:15,wu:[40,156]};
function t41BusPoly(crown){crown=crown||84;const c0=crown-16;const P=[[0,10],[80,10]];for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;P.push([64+16*Math.cos(a),c0+16*Math.sin(a)]);}
  for(let i=0;i<=6;i++){const a=Math.PI/2+i/6*Math.PI/2;P.push([16+16*Math.cos(a),c0+16*Math.sin(a)]);}return P;}
// the long sides as you'd see them standing beside the bus: right (door) side has the front at its right end, left side at its left
function t41BusSideTex(right,door,open,riders,lit,f){const {L,wr,wu}=T41B,G=T41P.green,C=T41P.cream,S=T41P.steel,H=75;const tt=h=>84-h;
  const fr=u=>right?u:L-u;   // where a point u along the bus lands on this side's picture
  return t41Tex(L,H,K=>{
    K.box(0,tt(68),L,tt(38)-tt(68),C[3]);K.box(0,tt(38),L,tt(10)-tt(38),G[2]);
    K.box(0,tt(68),L,1,C[4]);K.box(0,tt(68)+1,L,1,C[1]);                                  // the drip rail
    K.box(0,tt(40),L,1,G[1]);K.box(0,tt(39),L,1,G[0]);K.box(0,tt(38),L,1,G[3]);             // the belt
    K.box(0,tt(13),L,3,G[1]);K.box(0,tt(10)-1,L,1,G[0]);                                     // the skirt
    for(const s of [fr(98)-36,fr(98)+36])K.box(Math.round(s),tt(37),1,tt(14)-tt(37),G[1]);   // panel seams
    K.box(0,tt(24),L,1,G[1]);
    // windows: 16 wide with 4 px pillars; the left side opens with the driver's window, the right with the door
    const panes=[];if(right){for(let i=0;i<8;i++)panes.push(10+i*20);}else{for(let i=0;i<8;i++)panes.push(26+i*20);}
    let k=0;for(const a of panes){const who=riders>0&&((k*7+riders*3)%8)<riders?k+1:0;const dark=lit&&k===4;t41Pane(K,a,a+15,tt(62),tt(45),{warm:!!lit&&!dark});if(who)t41Rider(K,a+8+(k%2?-2:2),tt(45),k,!!lit&&!dark);
      if(lit&&(k===1||k===6)){K.box(a,tt(62),16,6,'#a8814e');K.box(a,tt(62)+6,16,1,'#6e4e2c');K.box(a+7,tt(62)+7,2,1,'#6e4e2c');}
      K.box(a,tt(45)+1,16,1,C[1]);K.box(a-1,tt(62)-1,18,1,C[2]);k++;}
    if(!right){t41Pane(K,4,20,tt(62),tt(45),{slantL:5,warm:!!lit});t41Rider(K,13,tt(45),1,!!lit);K.box(4,tt(45)+1,17,1,C[1]);}
    if(right){const d0=172,d1=188;if(open){K.box(d0,tt(64),d1-d0,tt(12)-tt(64),'#120e0c');K.box(d0,tt(22),d1-d0,2,'#6c5a44');K.box(d0,tt(22)+2,d1-d0,1,'#2a2018');
        K.box(d0,tt(36),d1-d0,1,'#3a2c20');K.box(d0+1,tt(30),3,6,'#2a2420');K.box(d0-1,tt(64),2,tt(12)-tt(64),G[0]);K.box(d1-1,tt(64),2,tt(12)-tt(64),G[3]);}
      else{K.box(d0,tt(64),d1-d0,tt(12)-tt(64),G[2]);for(const a of [d0,d0+8]){t41Pane(K,a+1,a+6,tt(61),tt(40),{warm:!!lit});K.box(a+1,tt(36),6,tt(15)-tt(36),G[3]);K.box(a+1,tt(36),6,1,G[4]);}
        K.box(d0,tt(64),1,tt(12)-tt(64),G[0]);K.box(d1-1,tt(64),1,tt(12)-tt(64),G[0]);K.box(d0+8,tt(64),1,tt(12)-tt(64),G[1]);K.box(d0+7,tt(30),1,3,S[4]);}}
    // MARROW CO. LINES between the wheels, cream letters with a dark shadow
    const txt='MARROW CO. LINES',tw=K.textW(txt),tx=Math.round(fr(98)-tw/2);K.text(txt,tx+1,tt(31)+1,G[0]);K.text(txt,tx,tt(31),C[4]);
    // wheel arches: a hole for the wheel and its well, a lit lip round the top
    for(const w of wu){const sc=fr(w),hc=wr;for(let y=0;y<H;y++)for(let x=Math.floor(sc-22);x<=sc+22;x++){const h=84-y-.5,d=Math.hypot(x+.5-sc,h-hc);if(h<10)continue;
        if(d<18){K.g.clearRect(x,y,1,1);}else if(d<20){K.px(x,y,1,1,x+.5<sc?G[4]:G[1]);}}}
    // mud: patches thrown up behind each wheel and along the skirt, two browns; a little rust under two window corners
    // mud: splashes thrown off the back of each tyre, heaviest low down, a few flecks higher up the arc; a crust along the skirt
    const H2=(a,b)=>{const n=Math.sin(a*12.9898+b*78.233)*43758.5453;return n-Math.floor(n);};
    const blot=(x,y,r,k)=>{for(let i=0;i<5;i++){const ox=(H2(k,i)-.5)*r*1.6,oy=(H2(k+7,i)-.5)*r*.9,rr=r*(.45+H2(k+3,i)*.5);
        K.ell(x+ox,y+oy,rr,rr*.7,(px,py,nx,ny)=>ny<-.6&&nx<0?'#6e573c':'#4a3824');}};
    for(const w of wu){const sc=fr(w),bk=right?-1:1;
      blot(sc+bk*24,tt(13),4.5,w);blot(sc+bk*31,tt(12),3.2,w+1);blot(sc+bk*20,tt(19),2.2,w+2);blot(sc+bk*22,tt(25),1.4,w+3);blot(sc+bk*38,tt(12),2,w+4);}
    for(let x=4;x<L-4;x+=7)if(H2(x,9)>.35)K.box(x,tt(11.5),3+Math.round(H2(x,4)*5),1,'#4a3824');
    for(const a of [panes[2],panes[5]]){K.box(a+15,tt(44),1,3,'#6a3a22');K.box(a+15,tt(41),1,2,'#8a5230');}});}
// the front and the back, as you'd see them standing in front of or behind the bus (80 wide; t runs down from the crown)
function t41Wedges(K,RF){for(let t=0;t<15;t++){const a=Math.round(15-t*.7),b=Math.round(65+t*.7);K.box(0,t,a,1,RF[4]);K.box(b,t,80-b,1,RF[1]);}}
function t41BusFrontTex(lit){const G=T41P.green,C=T41P.cream,RF=T41P.roof,S=T41P.steel,LM=T41P.lamp;return t41Tex(80,75,K=>{
  K.box(0,0,80,16,RF[3]);t41Wedges(K,RF);K.box(0,15,80,1,C[1]);
  K.box(22,7,36,8,'#0e0c0a');K.box(22,7,36,1,'#2a2622');const w=K.textW('COUNTY');K.text('COUNTY',40-Math.round(w/2),9,lit?LM[4]:LM[3]);
  K.box(0,16,80,25,C[3]);K.box(0,16,80,1,C[4]);
  t41Pane(K,6,37,18,33,{slantL:3,warm:false});t41Pane(K,42,73,18,33,{slantR:3,warm:false});K.box(38,17,4,17,C[2]);K.box(38,17,1,17,C[4]);
  t41Rider(K,60,33,0,false);
  K.box(0,40,80,1,G[0]);K.box(0,41,80,33,G[2]);K.box(0,41,80,1,G[3]);
  for(let x=28;x<=51;x++){const bar=(x-28)%3!==2;for(let y=45;y<=62;y++)K.px(x,y,1,1,bar?(y===45?S[4]:x<40?S[3]:S[2]):'#0e0e10');}K.box(27,44,26,1,S[4]);K.box(27,63,26,1,S[1]);
  K.box(0,71,80,4,G[0]);});}
function t41BusRearTex(riders,lit){const G=T41P.green,C=T41P.cream,RF=T41P.roof,S=T41P.steel;return t41Tex(80,75,K=>{
  K.box(0,0,80,16,RF[2]);t41Wedges(K,RF);K.box(0,15,80,1,C[1]);K.box(0,16,80,25,C[3]);K.box(0,16,80,1,C[4]);
  t41Pane(K,14,62,19,31,{warm:!!lit});if(riders){t41Rider(K,26,31,1,!!lit);t41Rider(K,47,31,2,!!lit);}K.box(14,32,49,1,C[1]);
  K.box(0,40,80,1,G[0]);K.box(0,41,80,33,G[2]);K.box(0,41,80,1,G[3]);K.box(39,42,1,24,G[1]);
  K.box(29,54,22,8,C[4]);K.box(29,54,22,1,'#fff6dc');K.box(29,61,22,1,C[1]);const w=K.textW('MC 9');K.text('MC 9',40-Math.round(w/2),56,'#2a2218');
  for(let y=4;y<66;y++){K.px(66,y,1,1,S[3]);K.px(72,y,1,1,S[2]);}for(let y=6;y<66;y+=5)K.box(66,y,7,1,S[4]);
  K.box(0,71,80,4,G[0]);});}
// the bus in one of four views: E (heading east, door side to you), W, S (coming at you), N (going away)
function t41BusPic(view,f,open,riders,lit){const {L,Wd,wr,wu}=T41B,G=T41P.green,C=T41P.cream,RF=T41P.roof,S=T41P.steel,I=T41I,Wo=T41P.wood,PL=T41P.plank,LM=T41P.lamp,B=T41P.brass,R=T41P.red;
  const Sc=t41Scene(L,Wd,view,104,{padX:5,padTop:2,padBot:4});
  const RS=t41BusSideTex(true,true,open,riders,lit,f),LS=t41BusSideTex(false,false,false,riders,lit,f),FT=t41BusFrontTex(lit),RT=t41BusRearTex(riders,lit);
  // the chrome first (it wins where it meets the body): bumpers wrapping the corners, the headlamps on the front fenders,
  // the tail lamps; then underneath, the chassis and the dark of the wheel wells
  const steel=F=>F.part==='side'&&!F.up?S[4]:t41Sh(S,F.lit,2.6,4);
  for(const [a,b] of [[0,3],[L-3,L]])Sc.box(a,b,-1,Wd+1,12,16,steel);for(const [a,b] of [[0,12],[L-12,L]])for(const [c,d] of [[-1,1],[Wd-1,Wd+1]])Sc.box(a,b,c,d,12,16,steel);
  for(const vc of [3,Wd-3]){Sc.tube(L-9,L-1,vc,31,3.6,F=>F.part==='side'&&F.u>L-2.4?S[4]:t41Sh(S,F.lit,2.8,4));
    Sc.tube(L-1,L,vc,31,3.6,F=>{if(F.part==='cap1'){const d=Math.hypot(F.s-3.6,F.t-3.6);if(d>1.9)return d>3?S[2]:S[4];return lit?'#fffbe8':(F.s+F.t<6.6?'#fbf6e6':'#c8c1aa');}return lit?LM[3]:S[4];});
    Sc.box(0,3,vc-3,vc+3,31,37,F=>F.part==='cap0'?(lit?'#ff6a48':R[3]):t41Sh(R,F.lit,2.2,3));}
  Sc.box(6,186,6,74,3,10,F=>F.part==='side'&&F.up?I[1]:I[0]);
  for(const w of wu)Sc.box(w-19,w+19,8,72,9,34,()=>'#100c0a');
  // the wheels, square to you on the near side; turned, only the bottoms of the front (or back) tyres show under the bumper
  if(view==='E'||view==='W'){const vN=view==='E'?Wd-5:5;for(const w of wu){const c=t41Can(34,34,K=>t41Wheel(K,17,17,wr,f,7,4));Sc.bill(c,w,vN,wr,17,17);}}
  else{const TY=T41P.tyre;const tc=t41Can(10,12,K=>{K.box(1,0,8,12,TY[1]);for(let y=0;y<12;y+=2)K.box(3,y,4,1,TY[2]);K.box(2,0,1,12,'#55555e');K.box(7,0,2,12,TY[0]);K.box(2,11,6,1,TY[0]);});
    for(const v of [12,Wd-12])Sc.bill(tc,view==='S'?L-2:2,v,0,5,11);}
  // the body: green sides with the cream band, a roof rounded across and at both ends (the crown comes down over the last few
  // pixels), the front and back faces
  const body=F=>{if(F.part==='cap1')return FT(F.s,F.t);if(F.part==='cap0')return RT(F.s,F.t);
    if(F.up&&F.h<68.5){const T=F.nl[1]>0?RS:LS;return T(F.s,F.t);}
    const BR=T41BR;if(F.h>83.5){if(F.u>12&&F.u<L-12&&(Math.floor(F.u)%48)===24)return BR[2];
      if(Math.sin(F.u*1.9+Math.sin(F.v*.11)*3)>.985&&t41Stain(F.u,F.v)>.5)return BR[2];
      const up=(view==='E'||view==='W')?Sc.cam.Z(F.u,F.v)<Sc.cam.d/2:Sc.cam.X(F.u,F.v)<Sc.cam.w/2;return up?BR[4]:BR[3];}
    return t41Sh(BR,F.lit,2.2,4);};
  const ends=[[0,2,77],[2,4,80],[4,6,82],[6,8,83]];const roofId=++Sc.idc;
  const wedge=F=>{const [nX]=Sc.cam.N(F.nl[0],F.nl[1]);return nX<-.25?RF[4]:nX>.25?RF[1]:RF[3];};
  const endV=view==='S'||view==='N';const bodyIn=F=>(F.part==='cap0'||F.part==='cap1')?(endV?wedge(F):t41Sh(RF,F.lit+.12,2.6,4)):(endV&&!F.up?wedge(F):body(F));
  const bodyEnd=F=>(endV&&!F.up&&F.part==='side')?wedge(F):body(F);
  if(endV)Sc.ext('u',t41BusPoly(84),0,L,body,{ttop:84,sL:L,pid:roofId});
  else for(const [a,b2,cr] of ends){const m=a>0?bodyIn:bodyEnd;Sc.ext('u',t41BusPoly(cr),a,b2,m,{ttop:84,sL:L,pid:roofId});Sc.ext('u',t41BusPoly(cr),L-b2,L-a,m,{ttop:84,sL:L,pid:roofId});}
  if(!endV)Sc.ext('u',t41BusPoly(84),8,L-8,body,{ttop:84,sL:L,noCaps:true,pid:roofId});
  // the rack, aft of the middle: two side rails on short posts, cross bars; a trunk at the back, a crate, a roped sack
  const rail=(m)=>F=>t41Sh(S,F.lit,m||2.4,3);
  for(const v of [8,70])Sc.box(22,124,v,v+2,88,90,rail());for(const u of [22,47,72,97,122])Sc.box(u,u+2,8,72,88,90,rail(2));
  for(const u of [22,72,122])for(const v of [8,70])Sc.box(u,u+2,v,v+2,84,88,rail(1.6));
  Sc.box(28,52,14,42,89,101,F=>{const strap=Math.abs(F.u-40)<1.2||(F.part==='side'&&F.up&&Math.abs(F.v-28)<1.2);if(strap)return T41P.brass[1];
    if(F.part==='side'&&F.up&&F.t<1.2)return Wo[4];return t41Sh(Wo,F.lit,2.4,3);});
  Sc.box(94,110,46,62,89,99,F=>{const slat=F.part==='top'||!F.up?(Math.floor(F.u)%4===0):(Math.floor(F.t)%4===3);return slat?PL[1]:t41Sh(PL,F.lit,2.6,3);});
  Sc.dome(66,26,89,11,9,F=>{const rope=Math.abs(F.u-66)<.8||Math.abs(F.v-26)<.8;if(rope)return '#3a2a18';return t41Sh(['#4a3e2a','#6a5a3c','#8c7a52','#ab9868','#c8b688'],F.lit,2.2,4);});
  const c=Sc.done({crease:4,cast:[{id:roofId,top:84,tol:1.6}]});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// ---------------------------------------------------------------- THE TANK ENGINE, built once
// 4.44 m (142 px) long, 1.75 m (56) wide over the running boards, the rails 16 px each side of its middle. A 2-6-2 tank: a
// pony truck under the smokebox, three coupled wheels, a trailing wheel under the cab. Iron boiler with two steel bands,
// green side tanks with the brass number plate, the cab with round front windows over the boiler and two square ones at the
// back over the coal; a tall chimney, a brass dome and a safety valve standing up off the boiler; a lattice pilot.
const T41E={L:142,Wd:56,rails:[12,44]};
function t41GearCan(Wd,r){const H=2*r+8;return {c:t41Can(Wd+8,H,K=>t41EndGear(K,Wd/2+4,0,H-1,0)),ax:Wd/2+4,ay:H-1};}
// the wheels and rods side-on, as one picture laid along the near rail (x = how far along from the left of the view)
function t41LocoWheels(view,f){const {L}=T41E,I=T41I,S=T41P.steel,R=T41P.red;const fx=u=>view==='E'?u:L-u;const GY=27;
  return t41Can(L+4,GY+2,K=>{const rot=f/3*Math.PI*2/3;
    for(const u of [16,118])t41Wheel(K,fx(u),GY-8,8,f,3,3);
    const pins=[];for(const u of [40,64,88]){t41Driver(K,fx(u),GY-12,12,f);pins.push([fx(u)+Math.cos(rot)*5,GY-12+Math.sin(rot)*5]);}
    // the coupling rod over all three crank pins, the connecting rod forward to the crosshead
    for(let i=0;i<2;i++)K.line(pins[i][0],pins[i][1],pins[i+1][0],pins[i+1][1],S[3]);for(let i=0;i<2;i++)K.line(pins[i][0],pins[i][1]+1,pins[i+1][0],pins[i+1][1]+1,I[1]);
    const ch=[fx(108),GY-15];K.line(pins[1][0],pins[1][1],ch[0],ch[1],S[4]);K.line(pins[1][0],pins[1][1]+1,ch[0],ch[1]+1,I[2]);
    for(const p of pins)K.box(Math.round(p[0])-1,Math.round(p[1])-1,3,3,S[4]);
    K.box(Math.min(fx(104),fx(126)),GY-19,22,8,I[2]);K.box(Math.min(fx(104),fx(126)),GY-19,22,1,I[4]);K.box(Math.min(fx(104),fx(126)),GY-12,22,1,I[0]);});}
function t41SmokeTex(){const I=T41I,S=T41P.steel,B=T41P.brass;return t41Tex(36,36,K=>{
  K.ell(18,18,17.5,17.5,(x,y,nx,ny,d)=>d>.92?I[1]:(nx+ny<-.5?I[3]:nx+ny>.5?I[1]:I[2]));
  K.ell(18,20,12,12,(x,y,nx,ny,d)=>d>.88?(nx+ny<0?I[4]:I[0]):(nx+ny<-.6?I[4]:nx+ny>.5?I[1]:I[2]));
  for(let a=0;a<12;a++){const t=a/12*Math.PI*2;K.px(Math.round(18+Math.cos(t)*15.5),Math.round(18+Math.sin(t)*15.5),1,1,I[4]);}
  K.box(11,19,15,2,S[3]);K.box(11,19,15,1,S[4]);K.box(17,14,3,12,S[2]);K.box(17,14,1,12,S[4]);K.box(17,19,3,3,S[4]);   // the dart handle, a plain cross
  K.ell(18,6,4,3,(x,y,nx,ny)=>nx+ny<0?B[4]:B[2]);K.text('3',17,4,'#2a1a08');});}
function t41LocoPic(view,f){const {L,Wd}=T41E,I=T41I,R=T41P.red,B=T41P.brass,G=T41P.green,S=T41P.steel,LM=T41P.lamp;const vc=Wd/2;
  const Sc=t41Scene(L,Wd,view,102,{padX:4,padTop:2,padBot:4});
  const iron=(F,b)=>t41Sh(I,F.lit,b==null?2.6:b,4);
  // underneath, and the wheels: square to you side-on, end-on (only the axle nearest the end you see shows under the beam)
  Sc.box(10,132,16,40,8,30,()=>I[1]);
  if(view==='E'||view==='W'){const c=t41LocoWheels(view,f);const vN=view==='E'?T41E.rails[1]+3:T41E.rails[0]-3;Sc.bill(c,view==='E'?0:L,vN,0,0,c.height-2);}
  else{const g=t41GearCan(Wd,9);Sc.bill(g.c,view==='S'?118:16,vc,0,g.ax,g.ay);}
  // the buffer beams with their buffers, the lattice pilot, the running board with its red lining
  const beam=F=>{if(F.part==='cap0'||F.part==='cap1'){const s=F.s,t=F.t;for(const bx of [8,Wd-8])if(Math.hypot(s-bx,t-6)<3.2)return Math.hypot(s-bx+.8,t-6+.8)<1.5?S[4]:I[2];if(Math.abs(s-vc)<2&&t>7)return I[1];}
    if(!F.up)return t41Sh(I,F.lit,2.2,3);return t41Sh(R,F.lit,2.7,3);};
  Sc.box(2,8,0,Wd,22,34,beam);Sc.box(128,134,0,Wd,22,34,beam);
  Sc.ext('v',[[128,22],[134,22],[141,3],[128,3]],12,Wd-12,F=>{if(F.part==='side'){if(F.q<.12)return R[4];return Math.floor(F.a)%5>=3?null:t41Sh(R,F.lit,2.4,3);}
    const c=(19*(F.u-128)+7*(F.h-3))/20.3;return Math.floor(c/2.2)%2===0?t41Sh(R,F.lit,2.4,3):'#2a0c08';});
  Sc.box(8,128,0,Wd,30,34,F=>F.part==='top'||!F.up?(F.lit>.6?I[3]:I[2]):(F.t<1?R[4]:F.t<2?R[3]:R[1]));
  Sc.box(104,126,1,Wd-1,22,30,F=>iron(F,2.2));                                                // the cylinders under the front
  // side tanks, green, a rivet line along the top, the number plate; a filler cap on each
  const NP=t41Tex(20,8,K=>{K.box(0,0,20,8,B[1]);K.box(1,1,18,6,B[3]);K.box(1,1,18,1,B[4]);K.text('NO 3',3,2,'#2a1a08');});
  const tank=F=>{if(F.part==='side'&&F.up){if(F.t<1)return G[4];if(F.t>=3&&F.t<4&&Math.floor(F.s)%5===2)return G[4];
      if(F.s>=16&&F.s<36&&F.t>=9&&F.t<17)return NP(F.s-16,F.t-9);}
    if(F.part==='cap0'||F.part==='cap1')return F.t<1?G[4]:G[1];return t41Sh(G,F.lit,2.8,4);};
  Sc.box(52,104,1,12,34,58,tank);Sc.box(52,104,Wd-12,Wd-1,34,58,tank);
  for(const v of [6,Wd-6])Sc.cyl(96,v,2.5,58,61,F=>F.part==='top'?B[3]:t41Sh(B,F.lit,2,3));
  // the boiler (two bright bands), the smokebox ahead of it with its round door, the saddle under it
  Sc.box(110,128,12,44,30,40,()=>I[1]);
  Sc.tube(46,112,vc,51,16,F=>{if(F.part!=='side')return iron(F);if(Math.abs(F.u-70)<1.1||Math.abs(F.u-94)<1.1)return t41Sh(S,F.lit,2.6,4);return iron(F,2.5);});
  const SM=t41SmokeTex();Sc.tube(110,130,vc,51,17.5,F=>F.part==='cap1'?SM(F.s,F.t):iron(F,1.8));
  // standing up off the boiler: the chimney with its flared lip, the dome, the safety valve, the headlamp
  Sc.cyl(122,vc,5,64,90,F=>F.part==='top'?(Math.hypot(F.u-122,F.v-vc)<3.4?'#060607':I[3]):iron(F,2.4));
  Sc.cyl(122,vc,6.8,88,93,F=>F.part==='top'?(Math.hypot(F.u-122,F.v-vc)<3.6?'#060607':I[4]):iron(F,3));
  Sc.cyl(86,vc,9,62,66,F=>F.part==='top'?I[2]:t41Sh(I,F.lit,1.4,3));Sc.cyl(86,vc,7.6,66,68,F=>F.part==='top'?B[1]:t41Sh(B,F.lit,1.4,3));Sc.cyl(86,vc,6.4,68,77,F=>t41Sh(B,F.lit,2.2,4));Sc.dome(86,vc,77,6.4,2.4,F=>t41Sh(B,F.lit,2.8,4));
  Sc.cyl(62,vc,6,62,66,F=>F.part==='top'?I[2]:t41Sh(I,F.lit,1.4,3));Sc.cyl(62,vc,4.6,66,67.5,F=>F.part==='top'?B[1]:t41Sh(B,F.lit,1.4,3));Sc.cyl(62,vc,3.8,67.5,74,F=>t41Sh(B,F.lit,2.2,4));Sc.dome(62,vc,74,3.8,1.6,F=>t41Sh(B,F.lit,2.8,4));
  Sc.box(125,132,vc-5,vc+5,66,75,F=>{if(F.part==='cap1'){const d=Math.hypot(F.s-5,F.t-4.5);if(d<3.3)return d<1.5?LM[4]:LM[3];}return iron(F,2.6);});
  // the cab: round windows in its front over the boiler, a door opening in each side, two square windows at the back
  Sc.box(12,46,0,Wd,34,92,F=>{
    if(F.part==='cap1'){for(const cx of [12,Wd-12]){const d=Math.hypot(F.s-cx,F.t-14);if(d<5.2)return d>4.2?S[4]:(F.s-cx+F.t-14<-2?T41P.glass[3]:T41P.glass[1]);}return t41Sh(G,F.lit,2.6,4);}
    if(F.part==='cap0'){for(const x0 of [8,Wd-20])if(F.s>=x0&&F.s<x0+12&&F.t>=6&&F.t<18){const e=F.s<x0+1||F.t<7;return e?G[0]:((F.s-x0)+(F.t-6)>=5&&(F.s-x0)+(F.t-6)<=7?T41P.glass[3]:T41P.glass[1]);}return t41Sh(G,F.lit,2.6,4);}
    if(F.part==='side'&&F.up){const s=F.s;if(s>13&&s<27&&F.t>6&&F.t<36)return F.t<8||s<14.5?G[0]:(F.t>22?'#0e0c0a':(s-13)+(F.t-8)<6?T41P.glass[2]:'#120f0d');if(F.t<1)return G[4];}
    return t41Sh(G,F.lit,2.6,4);});
  Sc.ext('u',[[-1,92],[Wd+1,92],[Wd+1,94],[Wd-6,97.5],[Wd-16,99.5],[vc,100],[16,99.5],[6,97.5],[-1,94]],10,48,F=>F.part==='side'?t41Sh(I,F.lit,1.7,4):I[1]);
  // the bunker behind the cab, heaped with coal; a red tail lamp and a ladder on its back
  Sc.box(2,12,2,Wd-2,34,64,F=>{if(F.part==='cap0'){if(F.s>=10&&F.s<16&&F.t>=6&&F.t<12)return R[F.t<7?4:3];if(Math.abs(F.s-(Wd-8))<.7||Math.abs(F.s-(Wd-12))<.7)return S[3];if(F.s>Wd-12.5&&F.s<Wd-7.5&&Math.floor(F.t)%5===2)return S[4];}
    return t41Sh(G,F.lit,2.4,4);});
  {const CO=['#060608','#0e0e12','#18181e','#26262e','#3a3a46','#56566a'];Sc.box(3,11,4,Wd-4,63,64.5,()=>CO[1]);
    const lumps=[[5,8,3],[8.5,13,2.6],[5.5,19,3.2],[8,25,2.8],[5,31,3],[8.5,36,2.5],[5.5,42,3.1],[8,48,2.7],[6.8,16,2.2],[6.8,28,2.4],[6.8,40,2.3]];
    const coalId=++Sc.idc;for(const [u,v,r] of lumps)if(v<Wd-3)Sc.dome(u,v,64,r,r*.8,F=>t41Sh(CO,F.lit,2.6,5),coalId);}
  const c=Sc.done({crease:4,inset:2,foot:[4,132,4,Wd-4]});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc,stack:Sc.P(122,vc,93)};}
// ---------------------------------------------------------------- THE COACHES, built once
// 5.13 m (164 px) long over the end platforms, 2 m (64) wide. Maroon boarded sides, ten windows, a curved roof with a raised
// clerestory (its sloped sides carry the little vent windows), open end platforms with a plain railing and a gate, a truck
// of two axles under each end. The dining car: warm curtained windows, a stove pipe, its own board.
const T41K={L:164,Wd:64};
function t41CoachWheels(view,f){const {L}=T41K,I=T41I,S=T41P.steel;const fx=u=>view==='E'?u:L-u;const GY=21;
  return t41Can(L+4,GY+2,K=>{for(const tc of [31,133]){const a=fx(tc);for(const d of [-10,10])t41Wheel(K,a+d,GY-10,10,f,4,3);
      // the side frame: a top arch bar from box to box, a lower tie bar, the axle boxes square over each hub, the bolster spring
      K.box(a-15,GY-17,31,3,I[2]);K.box(a-15,GY-17,31,1,I[4]);K.box(a-12,GY-8,25,2,I[1]);K.box(a-12,GY-8,25,1,I[3]);
      for(const d of [-10,10]){K.box(a+d-3,GY-14,7,7,I[3]);K.box(a+d-3,GY-14,7,1,I[5]);K.box(a+d-3,GY-8,7,1,I[0]);K.box(a+d-1,GY-12,3,3,I[1]);}
      K.box(a-4,GY-16,9,9,I[1]);for(let i=0;i<4;i++)K.box(a-3,GY-15+i*2,7,1,i%2?S[2]:S[3]);}});}
function t41CoachSideTex(riders,dining,lit,right){const M=T41P.maroon,C=T41P.cream,W=128,H=48;return t41Tex(W,H,K=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)K.px(x,y,1,1,y<2?M[4]:(x%4===0?M[1]:M[2]));
  K.box(0,28,W,1,M[1]);K.box(0,29,W,1,M[3]);K.box(0,H-4,W,4,'#1a0c0a');K.box(0,H-4,W,1,M[3]);
  const warm0=dining||lit;for(let i=0;i<10;i++){const a=6+i*12;const warm=warm0&&i!==(right?3:6);t41Pane(K,a,a+7,7,24,{warm});K.box(a-1,6,10,1,M[4]);K.box(a-1,25,10,1,M[1]);
    if(warm&&(i===1||i===5||i===8)){K.box(a,7,8,6,dining?'#7a2a20':'#a8814e');K.box(a,13,8,1,'#5a3a24');}
    const who=riders>0&&((i*7+riders*5+(right?3:0))%10)<riders;if(who)t41Rider(K,a+4,24,i,warm);}
  const txt=dining?'DINING CAR':'MARROW VALLEY',tw=K.textW(txt),tx=Math.round(W/2-tw/2);K.box(tx-4,32,tw+8,9,'#3a2410');K.box(tx-4,32,tw+8,1,'#6a4a24');K.box(tx-4,40,tw+8,1,'#1a0e06');
  K.text(txt,tx,34,T41P.brass[4]);});}
function t41CoachEndTex(dining,lit){const M=T41P.maroon,W=64,H=48;const warm=dining||lit;return t41Tex(W,H,K=>{
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)K.px(x,y,1,1,y<2?M[4]:(x%4===0?M[1]:M[2]));
  K.box(25,4,14,H-4,M[1]);K.box(26,5,12,H-5,M[2]);t41Pane(K,28,35,7,19,{warm});K.box(36,26,2,2,T41P.brass[3]);
  for(const a of [6,46])t41Pane(K,a,a+11,7,19,{warm});K.box(0,H-3,W,3,'#1a0c0a');});}
function t41CoachPic(view,f,riders,dining,lit){const {L,Wd}=T41K,M=T41P.maroon,RF=T41P.roof,S=T41P.steel,I=T41I,Wo=T41P.plank;const vc=Wd/2;
  const Sc=t41Scene(L,Wd,view,104,{padX:4,padTop:2,padBot:4});
  Sc.box(24,140,18,46,18,30,()=>I[1]);
  if(view==='E'||view==='W'){const c=t41CoachWheels(view,f);Sc.bill(c,view==='E'?0:L,view==='E'?51:13,0,0,c.height-2);}
  else{const g=t41GearCan(Wd,9);Sc.bill(g.c,view==='S'?138:26,vc,0,g.ax,g.ay);}
  // the end platforms, their steps, the drawbars
  for(const [a,b] of [[4,18],[146,160]]){Sc.box(a,b,2,Wd-2,30,34,F=>F.nl[2]>.9?t41Sh(Wo,F.lit,3.2,2):t41Sh(I,F.lit,2.2,3));
    for(const v of [2,Wd-6])Sc.box(a+2,a+8,v,v+4,20,30,F=>F.part==='top'||!F.up?Wo[3]:(Math.floor(F.t)%5===0?Wo[3]:I[1]));}
  Sc.box(0,4,vc-4,vc+4,26,30,F=>iron0(F));Sc.box(160,164,vc-4,vc+4,26,30,F=>iron0(F));
  function iron0(F){return t41Sh(I,F.lit,2.4,3);}
  // the body
  const ST=[t41CoachSideTex(riders,dining,lit,false),t41CoachSideTex(riders,dining,lit,true)],ET=t41CoachEndTex(dining,lit);
  Sc.box(18,146,0,Wd,30,78,F=>{if(F.part==='cap0'||F.part==='cap1')return ET(F.s,F.t);if(F.part==='side'&&F.up)return ST[F.nl[1]>0?1:0](F.s,F.t);return M[2];});
  // the railings: a top rail, a middle rail, four posts and the gate between the middle two
  const rail=(w)=>F=>{const s=F.s,t=F.t;const post=s<1.2||s>w-1.2||(w>20&&(Math.abs(s-21)<.7||Math.abs(s-w+21)<.7));if(t<1.6||post||Math.abs(t-8)<.7)return t<1?S[4]:t41Sh(S,F.lit,2.6,3);return null;};
  for(const [a,b] of [[4,6],[158,160]])Sc.box(a,b,2,Wd-2,34,50,rail(Wd-4),{});
  for(const [a,b] of [[4,18],[146,160]])for(const v of [2,Wd-3])Sc.box(a,b,v,v+1,34,50,F=>{const s=F.s,t=F.t,w=14;const post=(a<10?(F.nl[1]>0?s<1.2:s>w-1.2):(F.nl[1]>0?s>w-1.2:s<1.2));if(t<1.6||post||Math.abs(t-8)<.7)return t<1?S[4]:t41Sh(S,F.lit,2.6,3);return null;});
  // the roof: curved, over the platforms too; the clerestory up the middle with vent windows in its sloped sides
  Sc.ext('u',[[-1,77],[Wd+1,77],[Wd+1,79],[Wd-4,83],[Wd-12,86],[Wd-20,87],[20,87],[12,86],[4,83],[-1,79]],9,155,F=>F.part==='side'?((Math.floor(F.u)-9)%32===0&&F.h>80?T41BR[2]:(F.h>84&&Math.sin(F.u*1.7+Math.sin(F.v*.2)*2)>.985?T41BR[2]:t41Sh(T41BR,F.lit,1.9,5))):T41BR[1]);const croofId=Sc.id;
  const cleId=++Sc.idc;Sc.ext('u',[[20,86],[Wd-20,86],[Wd-20.5,92],[Wd-23,93.5],[23,93.5],[20.5,92]],28,136,F=>{if(F.part==='side'&&Math.abs(F.nl[1])>.6){const k=Math.floor(F.a)%12;if(k>=5&&k<7&&F.h>87.5&&F.h<91)return lit?T41P.lamp[2]:T41P.glass[2];}
    if(F.part==='side'&&Math.abs(F.nl[1])>.6){const [,nZ]=Sc.cam.N(F.nl[0],F.nl[1]);return nZ>.3?T41BR[2]:T41BR[3];}return F.part==='side'?t41Sh(T41BR,F.lit,2.4,5):T41BR[1];});
  if(dining){Sc.cyl(44,Wd-26,1.8,92,101,F=>F.part==='top'?'#060607':t41Sh(I,F.lit,2.6,4));Sc.dome(44,Wd-26,101.5,3.4,1.6,F=>t41Sh(I,F.lit,2.6,4));}
  const c=Sc.done({crease:4,inset:2,foot:[16,148,4,Wd-4],cast:[{id:croofId,top:86,tol:3.2}]});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// ---------------------------------------------------------------- where the lights are, for the night pass
// Window rectangles, lamps and the pool a headlamp throws on the road, in sprite pixels, from the same model.
function t41RectP(Sc,a,b){const x0=Math.min(a[0],b[0]),x1=Math.max(a[0],b[0]),y0=Math.min(a[1],b[1]),y1=Math.max(a[1],b[1]);return [Math.round(x0),Math.round(y0),Math.max(1,Math.round(x1-x0)),Math.max(1,Math.round(y1-y0))];}
function t41Fan(Sc,lu,lv,lh,len,half,k){const P=Sc.P,out=[P(lu,lv,lh)];const n=11;for(let i=0;i<=n;i++){const a=-half+2*half*i/n;
    const H=Math.sin(i*12.9898+k*78.233)*43758.5453,j=H-Math.floor(H);const d=len*(.66+.34*j)*(1-.12*Math.abs(a)/half);out.push(P(lu+d*Math.cos(a),lv+d*Math.sin(a),0));}
  return out.map(q=>[Math.round(q[0]),Math.round(q[1])]);}
function t41BusLights(Sc,view){const {L,Wd}=T41B,P=Sc.P,out=[];
  const fans=()=>{for(const [v,len] of [[3,158],[Wd-3,124]]){out.push({t:'cone',k:0,pts:t41Fan(Sc,L,v,31,len,.32,v)},{t:'cone',k:1,pts:t41Fan(Sc,L,v,31,len*.62,.16,v+5)});}};
  if(view==='E'||view==='W'){const v=view==='E'?Wd:0;const panes=[];for(let i=0;i<8;i++)panes.push(view==='E'?10+i*20:L-(26+i*20)-16);
    for(const a of panes)out.push({t:'win',r:t41RectP(Sc,P(a,v,62),P(a+16,v,45))});
    const lv=view==='E'?Wd-3:3;const lp=P(L,lv,31);out.push({t:'lamp',x:lp[0],y:lp[1],r:5,c:[255,236,170]});fans();
    const tp=P(0,lv,34);out.push({t:'lamp',x:tp[0],y:tp[1],r:3,c:[255,70,50]});}
  else if(view==='S'){out.push({t:'win',r:t41RectP(Sc,P(L,Wd-6,66),P(L,6,51))});
    for(const v of [3,Wd-3]){const q=P(L,v,31);out.push({t:'lamp',x:q[0],y:q[1],r:5,c:[255,236,170]});}fans();}
  else{out.push({t:'win',r:t41RectP(Sc,P(0,14,65),P(0,62,53))});for(const v of [3,Wd-3]){const q=P(0,v,34);out.push({t:'lamp',x:q[0],y:q[1],r:3,c:[255,70,50]});}}
  return out;}
function t41CoachLights(Sc,view,dining){const {L,Wd}=T41K,P=Sc.P,out=[];
  if(view==='E'||view==='W'){const v=view==='E'?Wd:0;for(let i=0;i<10;i++){const s=6+i*12;const a=view==='E'?18+s:146-s-8;out.push({t:'win',r:t41RectP(Sc,P(a,v,71),P(a+8,v,54))});}}
  else{const u=view==='S'?146:18;for(const s of [6,28,46]){const w=s===28?8:12;const v0=view==='S'?Wd-s-w:s;out.push({t:'win',r:t41RectP(Sc,P(u,v0,71),P(u,v0+w,59))});}}
  return out;}
function t41LocoLights(Sc,view){const {L,Wd}=T41E,P=Sc.P,out=[];const vc=Wd/2;
  const hl=P(132,vc,70);out.push({t:'lamp',x:hl[0],y:hl[1],r:view==='N'?0:11,c:[255,224,150]});
  if(view!=='N'){const pl=P(L+60,vc,0);out.push({t:'pool',x:pl[0],y:pl[1],rx:view==='S'?30:50,ry:view==='S'?38:18});}
  const fb=P(28,view==='W'?0:Wd,50);if(view==='E'||view==='W')out.push({t:'lamp',x:fb[0],y:fb[1],r:8,c:[255,140,60]});
  if(view==='N'){const tl=P(2,13,58);out.push({t:'lamp',x:tl[0],y:tl[1],r:5,c:[255,70,50]});}
  return out;}
// ---------------------------------------------------------------- THE SHELTER AND THE BENCH, built once
// A plank shelter 2.4 m wide (76 px) and 1 m deep with its open side to the road: a back wall and two side walls that stop a
// hand short of the ground on four corner posts, a lean-to roof rising toward the road, a slatted bench inside (a pale seat
// 4 px deep, its back board on the wall), a pinned timetable, MARROW CO. on the back; the BUS disc on its post at the front
// corner by the road. Model frame: u from the back wall (0) to the road (48), v along the road (0..84).
const T41SH={L:50,Wd:104,v0:4,v1:80,pv:97};
function t41PlankTex(W,H,o){o=o||{};const Wo=T41P.wood;return t41Tex(W,H,K=>{for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=Math.floor(x/5),e=x%5;
    let c=e===0?Wo[1]:(k%3===1?Wo[3]:Wo[2]);K.px(x,y,1,1,c);}
  if(o.board){const w=K.textW('MARROW CO.')+8,x0=Math.round(W/2-w/2);K.box(x0,8,w,9,T41P.cream[3]);K.box(x0,8,w,1,T41P.cream[4]);K.box(x0,16,w,1,T41P.cream[1]);K.text('MARROW CO.',x0+4,10,'#2c241a');}
  if(o.table){const x0=o.table;K.box(x0,8,12,15,'#d8ccb0');K.box(x0,8,12,1,'#f0e6cc');for(let y=11;y<21;y+=2)K.box(x0+2,y,8,1,'#6a5e4c');K.box(x0+5,8,2,1,'#8a2a20');}
  if(o.win){const [a,b,t0,t1]=o.win;K.g.clearRect(a,t0,b-a,t1-t0);K.box(a-1,t0-1,b-a+2,1,Wo[4]);K.box(a-1,t1,b-a+2,1,Wo[1]);}});}
function t41BusDisc(){const G=T41P.green,C=T41P.cream;return t41Can(17,17,K=>{K.ell(8.5,8.5,8,8,(x,y,nx,ny,d)=>d>.8?(nx+ny<-.3?C[4]:C[1]):(nx+ny<-.5?G[4]:G[3]));K.text('BUS',3,6,C[4]);});}
function t41ShelterPic(view){const {L,Wd,v0,v1}=T41SH,Wo=T41P.wood,S=T41P.steel,G=T41P.green,RF=T41_SH;
  const Sc=t41Scene(L,Wd,view,78,{padX:3,padTop:2,padBot:3});const wood=(F,b)=>t41Sh(Wo,F.lit,b==null?2.6:b,3);
  // the plank floor, the four corner posts

  for(const [a,b] of [[0,4],[26,30]])for(const [c,d] of [[v0,v0+4],[v1-4,v1]])Sc.box(a,b,c,d,0,64,F=>wood(F,2.2));
  // the walls: the back one (MARROW CO. outside, the timetable inside) and the two sides with a little window, all short of the ground
  const BO=t41PlankTex(v1-v0,40,{board:1}),BI=t41PlankTex(v1-v0,40,{table:v1-v0-22}),SW=t41PlankTex(26,50,{});
  Sc.box(0,3,v0,v1,20,60,F=>{if(F.part==='cap0')return BO(F.s,F.t);if(F.part==='cap1')return BI(F.s,F.t);return wood(F,3);});
  // the side walls go up to the bench back and no higher: from the side you see in, the roof stands on the corner posts
  // open at the sides: a beam under the roof from the back wall to each front post, and an arm rail at the bench's height
  for(const [c,d] of [[v0,v0+3],[v1-3,v1]])Sc.box(0,27,c,d,55,59,F=>F.part==='side'&&F.up?(F.t<1?Wo[3]:Wo[2]):wood(F,2.4));
  // the bench: legs, a pale seat four pixels deep, its back board on the wall
  // the bench: iron legs, a pale seat with its end lit, a back of two boards leaning back on iron standards; end-on it reads "h"
  // (a bench for three, at the road end: from the side its near end stands flush with the iron standard, and its top, in the
  // roof's shade, falls back darker than the lit end)
  const PK=T41P.plank,b0=v0+6,b1=v0+50,side=view==='W'||view==='E',du=4;
  // (it stands a hand clear of the back wall, so end-on its back is not lost against the corner post)
  const ironE=F=>side&&F.part!=='side'?(F.h>18?T41I[5]:T41I[3]):t41Sh(T41I,F.lit,2.4,3);
  for(const v of [b0,b1-2]){for(const u of [8,15])Sc.box(u+du,u+du+2,v,v+2,0,17,ironE);Sc.ext('v',side?[[6.6+du,17],[9.4+du,17],[5.4+du,34],[2.6+du,34]]:[[7+du,17],[9+du,17],[5+du,34],[3+du,34]],v,v+2,ironE);}
  // (end-on, the seat's end stands a little proud of the standard, pale against the shaded top behind it)
  const s0=side?b0-1.2:b0+.4,s1=side?b1+1.2:b1-.4;
  const nearEnd=F=>side&&(Math.abs(F.v-s0)<.05||Math.abs(F.v-s1)<.05);
  Sc.box(7+du,18+du,s0,s1,17,side?21:20,F=>{if(F.nl[2]>.9){if(side)return Math.floor(F.u-7-du)%4===3?PK[0]:PK[1];return t41Sh(PK,F.lit,3.7,2);}if(nearEnd(F))return F.h<17.9?PK[3]:PK[4];return F.part!=='side'?PK[4]:PK[2];});
  for(const [h0,h1] of [[22,27],[29,34]])Sc.ext('v',[[du+8.2-(h0-17)*.235,h0],[du+9.8-(h0-17)*.235,h0],[du+9.8-(h1-17)*.235,h1],[du+8.2-(h1-17)*.235,h1]],side?b0+.3:s0,side?b1-.3:s1,F=>nearEnd(F)||F.part!=='side'?(side?Wo[4]:Wo[1]):(F.e===1?(side?Wo[0]:Wo[3]):(side?Wo[0]:Wo[1])));
  // the roof: a plank lean-to, low at the back, overhanging all round
  Sc.ext('v',[[-4,58],[37,66],[37,69],[-4,61]],v0-3,v1+3,F=>{if(F.part==='side'&&F.nl[2]>.5)return (Math.floor(F.a)%6===0)?RF[1]:t41Sh(RF,F.lit,2.9,3);return F.t<1.2?'#a8a294':RF[3];});
  // the BUS disc on its post at the front corner, by the road
  const pv=T41SH.pv;Sc.cyl(44,pv,1.3,0,60,F=>F.part==='top'?S[4]:t41Sh(S,F.lit,2.4,4));const D=t41BusDisc();Sc.bill(D,44,pv,66,8,8,.5);
  const c=Sc.done({crease:4,inset:3,shadow:false,after:K=>{const g=K.g;g.save();g.globalCompositeOperation='destination-over';g.fillStyle='rgba(14,10,8,.42)';const p=Sc.P(44,pv,0);g.beginPath();g.ellipse(p[0]+4,p[1]+1,5,1.8,0,0,7);g.fill();g.restore();}});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// a slatted bench for a platform, 1.4 m long, its front to u: three pale seat slats (a plane seen from above), a two-slat
// backrest leaning back on iron standards, iron legs, and the dark of its shadow on the ground under the seat
function t41BenchPic(view){const L=24,Wd=44,Wo=T41P.wood,Pk=T41P.plank,I=T41I;const Sc=t41Scene(L,Wd,view,36,{padX:3,padTop:2,padBot:3});
  const iron=F=>t41Sh(I,F.lit,2.6,3);const lu=h=>7-(h-13)*4/19;
  for(const v of [3,Wd-5]){for(const u of [6,18])Sc.box(u,u+2,v,v+2,0,13,iron);Sc.ext('v',[[5,13],[7,13],[3,32],[1,32]],v,v+2,iron);}
  Sc.box(5,21,1,Wd-1,13,16,F=>{if(F.nl[2]>.9){const k=Math.floor(F.u-5);return k===5||k===10?Pk[2]:t41Sh(Pk,F.lit,3.7,2);}return F.part==='side'&&F.up?Wo[3]:Wo[2];});
  for(const [h0,h1] of [[20,24.5],[28,32.5]])Sc.ext('v',[[lu(h0)-.1,h0],[lu(h0)+1.2,h0],[lu(h1)+1.2,h1],[lu(h1)-.1,h1]],1,Wd-1,F=>{if(F.part!=='side')return Wo[2];
      if(F.e===1)return t41Sh(Pk,F.lit,3.3,3);if(F.e===3)return t41Sh(Wo,F.lit,2.6,3);return F.nl[2]>0?Pk[3]:Wo[1];});
  const c=Sc.done({crease:3,shadow:false});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// the town stop: a post with the BUS disc and the timetable in its frame, on the pavement, its shadow falling down and right
function t41TownPostPic(){const L=12,Wd=22,Wd2=T41P.wood,C=T41P.cream,G=T41P.green;const Sc=t41Scene(L,Wd,'S',72,{padX:6,padTop:2,padBot:3});
  Sc.cyl(6,11,1.6,0,60,F=>F.part==='top'?G[4]:t41Sh(G,F.lit,2.6,4));Sc.bill(t41BusDisc(),6,11,64,8,8,.5);
  const TT=t41Tex(14,20,K=>{K.box(0,0,14,20,G[1]);K.box(1,1,12,18,C[4]);K.box(1,1,12,3,G[3]);for(let y=6;y<17;y+=3)K.box(3,y,8,1,'#7a6a54');});
  Sc.box(7.6,9,4,18,30,50,F=>F.part==='cap1'?TT(F.s,F.t):t41Sh(G,F.lit,2.2,3));
  const c=Sc.done({crease:3,shadow:false,after:K=>{const g=K.g;g.save();g.globalCompositeOperation='destination-over';g.fillStyle='rgba(14,10,8,.38)';
    const p=Sc.P(6,11,0);g.beginPath();g.ellipse(p[0]+5,p[1]+1.5,7,2.2,0,0,7);g.fill();g.restore();}});
  return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// the end of the line, built in timber: a stack of old sleepers, two posts and a beam across the rails at the front, a red lamp
// on the beam. Model frame: u from the back of the stack (0) to the beam's face (21), v across the track (rails at 12 and 44).
const T41BUF={L:42,Wd:56,face:21};
function t41BufferPic(view){const {L,Wd}=T41BUF,Wo=T41P.wood,R=T41P.red,I=T41I,S=T41P.steel;const Sc=t41Scene(L,Wd,view,32,{padX:3,padTop:2,padBot:3});
  const TIE=['#2a2018','#3a2c20','#4e3c2c','#5e4a36','#6e5840'];const tie=F=>{if(F.part==='side'&&F.up&&Math.floor(F.t)%4===3)return '#1c140e';return t41Sh(TIE,F.lit,2.4,3);};
  // the last of the track runs toward you: four sleepers, the two rails up to the beam
  // (side-on the track is already on the ground under it; only the front and back views carry their own)
  const ends=view==='S'||view==='N';
  if(ends){for(const u of [21.5,30,38.5])Sc.box(u,u+2.6,5,Wd-5,0,1.3,F=>F.nl[2]>.9?(F.t<1?'#8a6c50':'#7a5e44'):'#3e3024');
    for(const v of [12,44])Sc.box(9,42,v-.7,v+.7,1.3,2.9,F=>F.nl[2]>.9?'#e6eaee':'#5c6068');}
  // the stack of old sleepers behind, the two posts, the beam (its face dark, its top lit), two round buffers, the lamp on a bracket
  if(view!=='S')for(let k=0;k<3;k++)Sc.box(1+k*.5,10-k*.5,2+k,Wd-2-k,k*4,k*4+4,tie);
  for(const v of [9,Wd-15])Sc.box(11,16,v,v+6,0,20,F=>F.nl[2]>.9?Wo[3]:t41Sh(Wo,F.lit,2.2,3));
  Sc.box(15,21,4,Wd-4,12,20,F=>{if(F.part==='cap1'){const t=Math.floor(F.t);return t===0?Wo[3]:'#2a1c12';}return F.nl[2]>.9?Wo[4]:t41Sh(Wo,F.lit,2.2,3);});
  for(const v of [12,44]){Sc.tube(21,23,v,15,1.8,F=>t41Sh(I,F.lit,2.4,3));Sc.tube(23,24.5,v,15,3.8,F=>{if(F.part==='cap1'){const d=Math.hypot(F.s-3.8,F.t-3.8);return d>2.9?(F.s+F.t<6?S[4]:S[3]):(d>1.8?I[2]:I[3]);}return t41Sh(S,F.lit,2.6,3);});}
  const lv=Wd-8;Sc.box(17,18.4,lv-.7,lv+.7,20,27,F=>t41Sh(I,F.lit,2.2,3));
  Sc.box(16,20,lv-2.6,lv+2.6,27,32,F=>{if(F.part!=='side'||F.up){if(F.t>1&&F.t<4.5&&(F.part!=='side'||F.nl[2]<.5))return '#e8402a';}return I[2];});
  // the ballast bed the sleepers lie in: loose gravel behind the model, so it shows between the sleepers with no outline round it
  const bed=K=>{if(!ends)return;const g=K.g,A=Sc.P(16,3,0),B=Sc.P(42,Wd-3,0);const x0=Math.round(Math.min(A[0],B[0])),x1=Math.round(Math.max(A[0],B[0])),y0=Math.round(Math.min(A[1],B[1])),y1=Math.round(Math.max(A[1],B[1]));
    const G=['#3e372f','#4e463c','#5c5348','#6c6254','#857a68'];g.save();g.globalCompositeOperation='destination-over';
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const h=Math.sin(x*12.9898+y*78.233)*43758.5453,f=h-Math.floor(h);
      const edge=Math.min(x-x0,x1-x,y1-y);if(edge<2&&f<(edge<1?.6:.3))continue;
      g.fillStyle=G[f<.12?0:f<.5?1:f<.84?2:f<.96?3:4];g.fillRect(x,y,1,1);}g.restore();};
  const c=Sc.done({crease:3,foot:[0,21,2,Wd-2],after:bed});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// where a point of a model lands in the world, given the world point its footprint is centred on (metres)
function t41Loc(view,L,Wd,at,u,v){const cam=t41Cam(L,Wd,view);return [at[0]+(cam.X(u,v)-cam.w/2)/32,at[1]+(cam.Z(u,v)-cam.d/2)/32];}
// @@GAMEPLAY ---------------------------------------------------------------- (everything above draws; everything below plays)
// ---- the network. Bus stops stand on the verge (a plank shelter, or a post in town); the bus stops on the road beside them.
const T41_STOPS=[
  {id:'r9w',name:'Route 9 West',at:[-131.5,-3.65],view:'N',pull:2,note:'by the Pine Rest Motel'},
  {id:'farm',name:'Hollow Acre',at:[3.6,-3.65],view:'N',pull:2,note:'at Grandpa’s gate'},
  {id:'town',name:'Marrow Hollow',at:[49.2,-3.7],view:'post',pull:6,note:'on Main Street'},
  {id:'quarry',name:'Quarry Road',at:[163,-8.35],view:'S',pull:2,note:'for the quarry and Pine Ridge'},
  {id:'lake',name:'Black Lake',at:[182.6,-8.35],view:'S',pull:2,note:'by the Black Lake turn'},
  {id:'wick',name:'Wickham',at:[103.2,47.9],view:'post',pull:4,note:'by the Lantern Inn'},
  {id:'corn',name:'Deep Corn',at:[22.05,191.6],view:'W',pull:2,note:'at the Deep Corn sign'},
  {id:'low',name:'Low Fields',at:[21.71,296.8],view:'W',pull:2,note:'at the Low Fields gate'}];
const T41_STOP_BY={};for(const s of T41_STOPS)T41_STOP_BY[s.id]=s;
// stations: a platform beside the line, its name board, a bench. The Crossroads serves the farm and the town both.
const T41_STATIONS=[
  {id:'xr',name:'Crossroads',sub:'for Hollow Acre and Marrow Hollow',line:'V',plat:{x0:14.3,z0:1.5,x1:16.15,z1:9.5,vert:1,edge:'e'},stop:[16.9,5.5],board:[13.4,9.9],bench:[15.2,3.4]},
  {id:'wick',name:'Wickham',sub:'for Wickham Crossing',line:'V',plat:{x0:86,z0:48.95,x1:95,z1:50.35,vert:0,edge:'n'},stop:[90.5,48.2],board:[93.6,51.8],bench:[88.6,50.2]},
  {id:'corn',name:'Deep Corn',sub:'for the Deep Corn and the reservoir',line:'S',plat:{x0:14.3,z0:181.5,x1:16.15,z1:189.5,vert:1,edge:'e'},stop:[16.9,185.5],board:[13.4,189.9],bench:[15.2,183.4]},
  {id:'low',name:'Low Fields',sub:'for the Low Fields',line:'S',plat:{x0:14.3,z0:283.5,x1:16.15,z1:291.5,vert:1,edge:'e'},stop:[16.9,287.5],board:[13.4,291.9],bench:[15.2,285.4]}];
const T41_STA_BY={};for(const s of T41_STATIONS)T41_STA_BY[s.id]=s;
// the track: laid along Mill Road and the Wickham road (the Valley line), on down Mill Road (the South line)
const T41_TRACK={V:[[16.9,-.2],[16.9,48.2],[95.6,48.2]],S:[[16.9,42],[16.9,236],[17.4,252],[16.5,270],[16.9,290],[16.9,297]]};
const T41_BUFFERS=[[16.9,-.2,'S',0],[95.6,48.2,'W',0],[16.9,297,'N',1]];
const T41_XBUCK=[[15.3,20.4,0],[15.3,89.4,1],[15.3,142.2,1],[15.3,198.5,1]];
// prices, fares, running costs
const T41_PRICE={bus:1800,stop:150,bus2:1500,valley:6000,south:3600,dining:900};
const T41_FARE={bus:3,train:5,dining:2};
const T41_UPKEEP={bus:30,bus2:20,valley:60,south:40};
const T41_SPEED={bus:640,train:700};   // metres an hour of game time, on average: they pull away slowly, run fast between stops, and slow to stop
const T41_SERVICE=[6,21];
// ---- the book: what's built, who owns it (shared with the farm, like the machines)
function TR41(){const E=EMP();E.tr=E.tr&&typeof E.tr==='object'?E.tr:{};const T=E.tr;T.stops=T.stops||{};T.log=T.log||[];T.today=T.today||{day:S.day,bus:0,train:0,named:[],paid:0};return T;}
const t41Free=()=>typeof free6==='function'&&free6();
const t41Price=k=>t41Free()?0:T41_PRICE[k];
const t41Me=()=>(typeof mlMe==='function'?mlMe():(typeof NAME==='function'&&NAME())||'Farmhand');
const t41Guest=()=>typeof HOST!=='undefined'&&HOST.role==='guest';
const t41Host=()=>typeof empHost==='function'?empHost():true;
const t41Compete=()=>typeof mkOn==='function'&&mkOn();
function t41Open(){if(t41Free())return true;try{if(S.st&&S.st.done)return true;if(typeof sagaChapter==='function'&&sagaChapter()>=2)return true;}catch(e){}return !!(S.emp&&S.emp.tr&&S.emp.tr.bus);}
const t41Owner=()=>{const T=S.emp&&S.emp.tr;return T&&(T.by||'')||'';};
const t41Mine=()=>{const o=t41Owner();return !o||o===t41Me()||!(typeof mpOn==='function'&&mpOn());};
// may this player run the line (buy, build, set fares)? On a shared farm anyone can; in a contest only the one who bought it
const t41CanRun=()=>!(t41Compete()&&S.emp&&S.emp.tr&&S.emp.tr.bus&&!t41Mine());
const t41StopsBuilt=()=>{const T=S.emp&&S.emp.tr;if(!T||!T.bus)return [];return T41_STOPS.filter(s=>T.stops&&T.stops[s.id]);};
const t41Stations=()=>{const T=S.emp&&S.emp.tr;if(!T||!T.valley)return [];return T41_STATIONS.filter(s=>s.line==='V'||T.south);};
// ---- geometry: polylines, rounded corners, distance along a path
function t41Poly(pts,r){// a path with each corner rounded to radius r, sampled every 0.25 m: [{x,z,s,dx,dz}]
  const P=[pts[0]];for(let i=1;i<pts.length-1;i++){const [ax,az]=pts[i-1],[bx,bz]=pts[i],[cx,cz]=pts[i+1];const l1=Math.hypot(bx-ax,bz-az),l2=Math.hypot(cx-bx,cz-bz);
    const ux=(bx-ax)/l1,uz=(bz-az)/l1,vx=(cx-bx)/l2,vz=(cz-bz)/l2;const turn=Math.abs(ux*vz-uz*vx);if(!r||turn<.2){P.push(pts[i]);continue;}
    const rr=Math.min(r,l1*.45,l2*.45);const p0=[bx-ux*rr,bz-uz*rr],p1=[bx+vx*rr,bz+vz*rr];
    for(let k=0;k<=12;k++){const t=k/12,a=1-t;P.push([a*a*p0[0]+2*a*t*bx+t*t*p1[0],a*a*p0[1]+2*a*t*bz+t*t*p1[1]]);}}
  P.push(pts[pts.length-1]);
  const out=[];let s=0;for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1];const L=Math.hypot(bx-ax,bz-az);if(L<1e-6)continue;const n=Math.max(1,Math.ceil(L/.25));
    for(let k=0;k<n;k++){const t=k/n;out.push({x:ax+(bx-ax)*t,z:az+(bz-az)*t,s:s+L*t,dx:(bx-ax)/L,dz:(bz-az)/L});}s+=L;}
  const l=P[P.length-1],q=out[out.length-1];out.push({x:l[0],z:l[1],s,dx:q?q.dx:1,dz:q?q.dz:0});out.len=s;return out;}
function t41At(path,s){s=clamp(s,0,path.len);let lo=0,hi=path.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(path[m].s<=s)lo=m;else hi=m;}
  const a=path[lo],b=path[hi],t=b.s>a.s?(s-a.s)/(b.s-a.s):0;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,dx:a.dx,dz:a.dz};}
function t41Near(path,x,z){let best=0,bd=1e9;for(const p of path){const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;best=p.s;}}return {s:best,d:bd};}
// ---- the bus route: the roads from stop to stop, in the order the stops lie along the valley
const T41_ORDER=['r9w','farm','town','quarry','lake','wick','corn','low'];
// where the bus draws up: on the road by the stop, a bus length along from the shelter so it stands beside it, not over it
function t41Kerb(st){try{if(!RGN.built)rgnBuild();const p=rgnSnap(st.at[0],st.at[1]);if(!p)return st.at;if(!p.s)return [p.x,p.z];
    if(st.view==='post'){let dx=p.s[2]-p.s[0],dz=p.s[3]-p.s[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;if(dx<0||(Math.abs(dx)<.01&&dz<0)){dx=-dx;dz=-dz;}const q=rgnSnap(p.x-dx*2.6,p.z-dz*2.6);return q?[q.x,q.z]:[p.x,p.z];}
    let dx=p.s[2]-p.s[0],dz=p.s[3]-p.s[1];const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;if(dx<0||(Math.abs(dx)<.01&&dz<0)){dx=-dx;dz=-dz;}
    const q=rgnSnap(p.x+dx*4.2,p.z+dz*4.2);return q?[q.x,q.z]:[p.x,p.z];}catch(e){return st.at;}}
const T41C={sig:'',bus:null,train:null};
function t41BusRoute(){const ids=T41_ORDER.filter(id=>TR41().stops[id]);if(ids.length<2)return null;
  const pts=[];const marks=[];
  for(let i=0;i<ids.length;i++){const st=T41_STOP_BY[ids[i]],k=t41Kerb(st);
    if(i===0){pts.push(k);marks.push({id:ids[i],at:0});continue;}
    const prev=pts[pts.length-1];let seg=null;try{seg=rgnPath(prev[0],prev[1],k[0],k[1]);}catch(e){}
    if(!seg||!seg.length)seg=[k];for(const q of seg)if(Math.hypot(q[0]-pts[pts.length-1][0],q[1]-pts[pts.length-1][1])>.3)pts.push([q[0],q[1]]);
    marks.push({id:ids[i],pt:pts.length-1});}
  const path=t41Poly(pts,3.2);
  // where along the path each stop is
  for(const m of marks){const st=T41_STOP_BY[m.id],k=t41Kerb(st);m.s=m.at===0?0:t41Near(path,k[0],k[1]).s;}
  marks.sort((a,b)=>a.s-b.s);return {path,stops:marks};}
// the rail: the Valley line's path, and the South line's (it shares the Mill Road stretch from the Crossroads)
function t41RailPaths(){const V=t41Poly(T41_TRACK.V,5);const S2=t41Poly([[16.9,-.2]].concat(T41_TRACK.S),0);return {V,S:S2};}
// ---- the timetable. Each vehicle runs a loop of moves and waits starting at six; the clock says where it is.
function t41Legs(route,speed,dwell,endDwell){// there and back along a route with stops at s positions: [{t0,t1,s0,s1,stop}]
  const L=[];let t=0;const st=route.stops;
  const go=(order)=>{for(let i=0;i<order.length;i++){const m=order[i];if(i>0){const s0=order[i-1].s,s1=m.s;const dt=Math.abs(s1-s0)/speed;L.push({t0:t,t1:t+dt,s0,s1});t+=dt;}
      const d=(i===order.length-1)?endDwell:dwell;L.push({t0:t,t1:t+d,s0:m.s,s1:m.s,stop:m.id,dir:i===order.length-1?(order===st?-1:1):(order===st?1:-1)});t+=d;}};
  go(st);go(st.slice().reverse());
  // (the turn at each end is one long wait, not two)
  return {legs:L,period:t};}
function t41Build(){const T=S.emp&&S.emp.tr;const sig=JSON.stringify(T?[T.bus,T.bus2,Object.keys(T.stops||{}).sort(),T.valley,T.south]:0);if(sig===T41C.sig)return;T41C.sig=sig;
  T41C.bus=null;T41C.train=null;if(!T)return;
  if(T.bus){const R=t41BusRoute();if(R){const tt=t41Legs(R,T41_SPEED.bus,.03,.08);T41C.bus={route:R,tt};}}
  if(T.valley){const RP=t41RailPaths();T41C.rail=RP;
    const stOn=(path,ids)=>ids.map(id=>{const S0=T41_STA_BY[id];return {id,s:t41Near(path,S0.stop[0],S0.stop[1]).s};}).sort((a,b)=>a.s-b.s);
    const trips=[{path:RP.V,stops:stOn(RP.V,['xr','wick'])}];if(T.south)trips.push({path:RP.S,stops:stOn(RP.S,['xr','corn','low'])});
    // one train: out and back on the Valley line, then out and back on the South line, and round again
    let t=0;const legs=[];for(const tr of trips){const one=t41Legs({stops:tr.stops},T41_SPEED.train,.05,.1);for(const l of one.legs)legs.push(Object.assign({},l,{t0:l.t0+t,t1:l.t1+t,path:tr.path}));t+=one.period+.06;
      legs.push({t0:t-.06,t1:t,s0:tr.stops[0].s,s1:tr.stops[0].s,stop:'xr',path:tr.path,dir:1});}
    T41C.train={tt:{legs,period:t}};}
  try{t41Sync(true);}catch(e){console.warn('t41 sync',e);}try{T41RAIL.sig='';t41RailDirty();}catch(e){}try{if(typeof MAPX!=='undefined')MAPX.cv=null;}catch(e){}}
// where a vehicle is at a given hour: {x,z,dx,dz,moving,stop,dist}. Out of hours it waits at its first stop.
function t41Where(V,hour,phase,path){const tt=V.tt,legs=tt.legs;const P=path||(V.route&&V.route.path);
  const t0=T41_SERVICE[0],t1=T41_SERVICE[1];let h=hour;if(h<t0||h>=t1){const l=phase?(legs.find(q=>q.stop&&q.t0>=phase-.001)||legs[0]):legs[0];const pth=l.path||P;const p=t41At(pth,l.s0);return {x:p.x,z:p.z,dx:p.dx,dz:p.dz,moving:false,stop:l.stop,parked:true,leg:l,s:l.s0,path:pth};}
  let u=((h-t0+(phase||0))%tt.period+tt.period)%tt.period;let lo=0,hi=legs.length-1;while(lo<hi){const m=(lo+hi)>>1;if(legs[m].t1<=u)lo=m+1;else hi=m;}
  const l=legs[lo],pth=l.path||P;const k=l.t1>l.t0?clamp((u-l.t0)/(l.t1-l.t0),0,1):0;const ke=l.s0===l.s1?k:k*k*(3-2*k);const s=l.s0+(l.s1-l.s0)*ke;const p=t41At(pth,s);const back=l.s1<l.s0;
  return {x:p.x,z:p.z,dx:back?-p.dx:p.dx,dz:back?-p.dz:p.dz,moving:l.s0!==l.s1,stop:l.stop||null,dirSign:l.dir||(back?-1:1),leg:l,s,path:pth,u,k};}
// the next time (game hours, from now) a vehicle waits at stop A and then reaches stop B: {dep, arr}
function t41Next(V,phase,A,B,from){const tt=V.tt,legs=tt.legs;const t0=T41_SERVICE[0],t1=T41_SERVICE[1];if(from<t0)from=t0;
  for(let cyc=0;cyc<12;cyc++){const base=t0+cyc*tt.period-(phase||0);
    for(let i=0;i<legs.length;i++){const l=legs[i];if(l.stop!==A)continue;const dep=base+l.t1;if(dep<from-.001||dep>=t1)continue;
      // ride on from here until B comes up (or the vehicle turns back at the end without reaching it)
      for(let j=i+1;j<legs.length;j++){const q=legs[j];if(q.stop===B){const arr=base+q.t0;return {dep,arr,depWait:base+l.t0};}if(q.stop===A)break;}}
    if(base>t1)break;}
  return null;}
// ---- the pictures, made once each and kept as sprites
function t41Flip(c){const d=document.createElement('canvas');d.width=c.width;d.height=c.height;const g=d.getContext('2d');g.translate(c.width,0);g.scale(-1,1);g.drawImage(c,0,0);return d;}
function t41Spr(key,make,ax,ay,foot){if(SPR[key])return key;const c=make();IMG['mem:'+key]=c;SPR[key]={src:'mem:'+key,fw:c.width,fh:c.height,ax:typeof ax==='function'?ax(c):ax,ay,foot:foot||[0,0,0,0]};return key;}
const t41View=(dx,dz)=>Math.abs(dx)>=Math.abs(dz)*.9?(dx>=0?'E':'W'):(dz>0?'S':'N');
// the vehicles' sprites: built from the one model per view, anchored on the ground at the middle of their near edge; the
// night lights (windows, lamps, the pool a headlamp throws) ride along with each sprite
function t41SprPic(key,make,lights){if(SPR[key])return key;const r=make();t41Spr(key,()=>r.c,r.ax,r.ay);const m=SPR[key];
  m.lights=(lights?lights(r.S):[]).map(q=>q.t==='win'?{t:'win',r:[q.r[0]-r.ax,q.r[1]-r.ay,q.r[2],q.r[3]]}:q.t==='cone'?{t:'cone',k:q.k,pts:q.pts.map(p=>[p[0]-r.ax,p[1]-r.ay])}:Object.assign({},q,{x:q.x-r.ax,y:q.y-r.ay}));
  if(r.stack)m.stack=[Math.round(r.stack[0]-r.ax),Math.round(r.stack[1]-r.ay)];return key;}
function t41BusKey(v,f,open,riders,lit){riders=Math.min(8,riders|0);lit=lit?1:0;open=open&&v==='E'?1:0;if(v==='S')riders=0;
  return t41SprPic(`t41b_${v}_${f}_${open}_${riders}_${lit}`,()=>t41BusPic(v,f,open,riders,lit),Sc=>t41BusLights(Sc,v));}
function t41LocoKey(v,f){return t41SprPic(`t41e_${v}_${f}`,()=>t41LocoPic(v,f),Sc=>t41LocoLights(Sc,v));}
function t41CoachKey(v,f,riders,dining,lit){riders=Math.min(10,riders|0);if(v==='S'||v==='N')riders=0;const dn=dining?1:0,lt=lit?1:0;
  return t41SprPic(`t41k_${v}_${f}_${riders}_${dn}_${lt}`,()=>t41CoachPic(v,f,riders,dining,lit),Sc=>t41CoachLights(Sc,v,dining));}
const T41_FACE={S:[0,1],N:[0,-1],W:[-1,0],E:[1,0]};
function t41StopKey(view){if(view==='post')return t41SprPic('t41_tpost',()=>t41TownPostPic());return t41SprPic('t41_shel_'+view,()=>t41ShelterPic(view));}
function t41BenchKey(view){return t41SprPic('t41_bench_'+view,()=>t41BenchPic(view));}
// in front of the shelter's open side (where you stand to read it), and beside it (where the town waits, in sight)
function t41StopFront(st){if(st.view==='post')return [st.at[0],st.at[1]+.55];const d=T41_FACE[st.view];return [st.at[0]+d[0]*1.1,st.at[1]+d[1]*1.1];}
function t41StopWait(st){if(st.view==='post')return [st.at[0]+.6,st.at[1]+.3,1,0];const d=T41_FACE[st.view];
  if(d[1])return [st.at[0]+1.75,st.at[1]+(d[1]>0?.45:-.15),1,0];return [st.at[0]+d[0]*.3,st.at[1]+1.75,0,1];}
// the shelter's walls as one block to walk round, in world metres
function t41ShelterRect(st){const {L,Wd,v0,v1}=T41SH;const a=t41Loc(st.view,L,Wd,st.at,0,v0),b=t41Loc(st.view,L,Wd,st.at,30,v1);return {x0:Math.min(a[0],b[0]),z0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),z1:Math.max(a[1],b[1])};}
function t41PlatKey(st){const p=st.plat;const r=t41Platform(p.x1-p.x0,p.z1-p.z0,p.edge);return t41Spr('t41_plat_'+st.id,()=>r.c,r.ax,r.gy);}
// ---- in the world: the stops and the stations, set out (and taken away) to match the book
const T41W={objs:[],rects:[],circs:[],hid:[],cut:[],rcut:[],moved:[],near:[],sig:''};
function t41Clear(x0,z0,x1,z1){for(const o of OBJ){if(o.hide||o.room||o.town||o.story||o.mile||o.crashOak||o.t41)continue;if(o.x<x0||o.x>x1||o.z<z0||o.z>z1)continue;
    if(!/^(tree|pine|bush|deco|anim|grass|plant)$/.test(o.kind||'')&&!o.debris)continue;o.hide=true;T41W.hid.push(o);
    for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.6)T41W.cut.push(circles.splice(j,1)[0]);}}
function t41Sync(force){const T=S.emp&&S.emp.tr;const stops=t41StopsBuilt(),stas=t41Stations();
  const sig=JSON.stringify([stops.map(s=>s.id),stas.map(s=>s.id)]);if(!force&&sig===T41W.sig)return;T41W.sig=sig;
  for(const o of T41W.objs){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}T41W.objs=[];
  for(const q of T41W.rects){const i=rects.indexOf(q);if(i>=0)rects.splice(i,1);}T41W.rects=[];
  for(const q of T41W.circs){const i=circles.indexOf(q);if(i>=0)circles.splice(i,1);}T41W.circs=[];
  for(const o of T41W.hid)o.hide=false;T41W.hid=[];for(const q of T41W.cut)circles.push(q);T41W.cut=[];for(const R of T41W.rcut)rects.push(R);T41W.rcut=[];
  for(const [o,dz] of T41W.moved){o.z-=dz;if(o.t41moved)o.t41moved=0;}T41W.moved=[];
  if(OBJ.length<1000)return;   // (the world isn't built yet)
  const add=(key,x,z,kind,extra)=>{try{const o=obj(key,x,z,Object.assign({kind,t41:1},extra||{}));T41W.objs.push(o);return o;}catch(e){return null;}};
  for(const st of stops){const [x,z]=st.at;
    if(st.view==='post'){t41Clear(x-.5,z-.6,x+.6,z+.3);add(t41StopKey('post'),x,z,'prop',{label:'BUS STOP',t41sh:{sil:1}});const q={x:x-.15,z:z-.1,r:.25};circles.push(q);T41W.circs.push(q);continue;}
    const {L,Wd}=T41SH,cam=t41Cam(L,Wd,st.view);const ex=cam.w/64,ez=cam.d/64;t41Clear(x-ex-.4,z-ez-.4,x+ex+.4,z+ez+.4);
    {const a=t41Loc(st.view,T41SH.L,T41SH.Wd,st.at,-4,1),b=t41Loc(st.view,T41SH.L,T41SH.Wd,st.at,37,83);add(t41StopKey(st.view),x,z+ez,'prop',{label:'BUS STOP',t41sh:{fp:[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])],h:64}});}
    const q=t41ShelterRect(st);rects.push(q);T41W.rects.push(q);
    const pp=t41Loc(st.view,L,Wd,st.at,42,T41SH.v1-2);const c={x:pp[0],z:pp[1],r:.15};circles.push(c);T41W.circs.push(c);}
  for(const st of stas){const p=st.plat;t41Clear(p.x0-.6,p.z0-.8,p.x1+.6,p.z1+(p.vert?.6:1.6));
    const key=t41PlatKey(st);add(key,(p.x0+p.x1)/2,p.z1+.28,'flat',{});
    t41Clear(st.board[0]-1.4,st.board[1]-.8,st.board[0]+1.4,st.board[1]+.4);
    const bk=t41Spr('t41_board_'+st.id,()=>t41NameBoard(st.name.toUpperCase()).c,c=>c.width/2,48);add(bk,st.board[0],st.board[1],'prop',{label:st.name.toUpperCase(),t41sh:{sil:1}});
    for(const dx of [-.7,.7]){const q={x:st.board[0]+dx*(SPR[bk].fw/64),z:st.board[1]-.05,r:.12};circles.push(q);T41W.circs.push(q);}
    {const bv=st.plat.vert?(st.plat.edge==='e'?'E':'W'):(st.plat.edge==='n'?'N':'S');const bk=t41BenchKey(bv);add(bk,st.bench[0],st.bench[1],'prop',{t41sh:{sil:1}});
      const q={x:st.bench[0],z:st.bench[1]-.15,r:.3};circles.push(q);T41W.circs.push(q);}}
  if(T&&T.valley){// nothing growing on the line: trees, bushes, grass and loose stones along the track bed are taken up (hidden,
    // never removed, so saves line up); anything else standing within reach of it is listed for the tests
    const paths=[t41Poly(T41_TRACK.V,5)];if(T.south)paths.push(t41Poly(T41_TRACK.S,0));T41W.near=[];
    for(const o of OBJ){if(o.hide||o.room||o.t41)continue;let dmin=9;for(const P of paths)for(let i=0;i<P.length;i+=4){const q=P[i];const dd=Math.hypot(q.x-o.x,q.z-o.z);if(dd<dmin)dmin=dd;}
      if(dmin>1.8)continue;const veg=/^(tree|pine|bush|deco|anim|grass|plant)$/.test(o.kind||'')||o.debris;
      if(veg&&dmin>1.25)continue;
      if(veg&&!o.story&&!o.town&&!o.mile&&!o.crashOak){o.hide=true;T41W.hid.push(o);for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.6)T41W.cut.push(circles.splice(j,1)[0]);}
      else if((/^(crate|hay|barrel|sack|sacks|bale)/.test(o.spr||'')||(/^fence/.test(o.spr||'')&&dmin<1.45))&&!o.story&&!o.label){o.hide=true;T41W.hid.push(o);
        for(let j=rects.length-1;j>=0;j--){const R=rects[j];if(o.x>R.x0-.3&&o.x<R.x1+.3&&o.z>R.z0-.3&&o.z<R.z1+.9){T41W.rcut.push(R);rects.splice(j,1);}}
        for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.8)T41W.cut.push(circles.splice(j,1)[0]);}
      else if(/^cart/.test(o.spr||'')&&!o.story&&!o.t41moved){const dz=1.2;   // the orchard cart stood where the train's side now passes: it goes back a step
        for(const R of rects)if(o.x>R.x0-.2&&o.x<R.x1+.2&&o.z>R.z0-.2&&o.z<R.z1+.9){R.z0+=dz;R.z1+=dz;T41W.moved.push([{get z(){return R.z0;},set z(v){const d=v-R.z0;R.z0+=d;R.z1+=d;}},dz]);}
        for(const it of interact)if(it&&typeof it.x==='number'&&Math.hypot(it.x-o.x,it.z-o.z)<1.5){it.z+=dz;T41W.moved.push([it,dz]);}
        for(const q of circles)if(Math.hypot(q.x-o.x,q.z-(o.z-.1))<.8){q.z+=dz;T41W.moved.push([q,dz]);}o.z+=dz;o.t41moved=1;T41W.moved.push([o,dz]);}
      else if(dmin>1.25)continue;
      else if(/QUILL ORCHARD/.test(o.label||'')&&!o.t41moved){const dz=2.7;for(const it of interact)if(it&&typeof it.x==='number'&&Math.hypot(it.x-o.x,it.z-o.z)<1.2){it.z+=dz;T41W.moved.push([it,dz]);}
        for(const q of circles)if(Math.hypot(q.x-o.x,q.z-(o.z-.1))<.6){q.z+=dz;T41W.moved.push([q,dz]);}o.z+=dz;o.t41moved=1;T41W.moved.push([o,dz]);}
      else T41W.near.push([o.kind,o.label||o.spr||'',+o.x.toFixed(1),+o.z.toFixed(1),+dmin.toFixed(2)]);}}
  if(T&&T.valley)for(const [ex,ez,vw,ln] of T41_BUFFERS){if(ln&&!T.south)continue;const f=T41_FACE[vw],{L,Wd,face}=T41BUF;const at=[ex-f[0]*(face-L/2)/32,ez-f[1]*(face-L/2)/32];
    const cam=t41Cam(L,Wd,vw);t41Clear(at[0]-cam.w/64-.3,at[1]-cam.d/64-.3,at[0]+cam.w/64+.3,at[1]+cam.d/64+.3);const a=t41Loc(vw,L,Wd,at,0,4),b=t41Loc(vw,L,Wd,at,face,Wd-4);const q={x0:Math.min(a[0],b[0]),z0:Math.min(a[1],b[1]),x1:Math.max(a[0],b[0]),z1:Math.max(a[1],b[1])};
    add(t41SprPic('t41_buf_'+vw,()=>t41BufferPic(vw)),at[0],at[1]+cam.d/64,'prop',{t41sh:{fp:[q.x0,q.z0,q.x1,q.z1],h:22}});rects.push(q);T41W.rects.push(q);}
  if(T&&T.valley)for(const [x,z,ln] of T41_XBUCK){if(ln&&!T.south)continue;t41Clear(x-.6,z-.5,x+.6,z+.3);add(t41Spr('t41_xbuck2',()=>t41Crossbuck().c,30,96),x,z,'prop',{label:'RAILROAD CROSSING',t41sh:{sil:1}});const q={x,z:z-.05,r:.15};circles.push(q);T41W.circs.push(q);}
  if(typeof NAV!=='undefined')NAV.sig='';}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{T41W.objs=[];T41W.rects=[];T41W.circs=[];T41W.hid=[];T41W.cut=[];T41W.rcut=[];T41W.moved=[];T41W.sig='';T41C.sig='';t41Build();t41Sync(true);}catch(e){console.warn('t41',e);}return r;};}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);try{T41C.sig='';t41Build();t41Sync(true);}catch(e){}return r;};}
{const _wr=worldRebuild;worldRebuild=function(keys){const r=_wr.apply(this,arguments);try{if(!keys||keys.has('emp')){t41Build();t41Sync(false);}}catch(e){}return r;};}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<1.5)return;t=0;try{t41Build();t41Sync(false);}catch(e){}};}
// ---- the track, laid into the ground beside the road: a ballast strip, pale sleepers with a dark edge where they stand up
// out of it, two steel rails with a lit top and a shadow; plank crossings where a road comes over; and a trodden dirt pad
// from the road to every bus stop.
const T41RAIL={buckets:null,sig:''};
function t41RailDirty(){const T=S.emp&&S.emp.tr;const sig=JSON.stringify(T?[T.valley,T.south,Object.keys(T.stops||{}).sort()]:0);if(sig===T41RAIL.sig)return;T41RAIL.sig=sig;T41RAIL.buckets=null;
  try{chunks.clear();}catch(e){}}
function t41Pads(){const out=[];if(true)return out;for(const st of t41StopsBuilt()){if(st.view==='post')continue;let p=null;try{if(!RGN.built)rgnBuild();p=rgnSnap(st.at[0],st.at[1]);}catch(e){}if(!p)continue;
    const w=(p.s&&p.s[4])||2;const dx=st.at[0]-p.x,dz=st.at[1]-p.z,d=Math.hypot(dx,dz)||1;const ex=p.x+dx/d*w/2,ez=p.z+dz/d*w/2;const R=t41ShelterRect(st);const ns=Math.abs(dz)>Math.abs(dx);
    out.push(ns?{x0:R.x0-.3,x1:R.x1+2.3,z0:Math.min(ez,R.z0)-.3,z1:Math.max(ez,R.z1)+.3}:{x0:Math.min(ex,R.x0)-.3,x1:Math.max(ex,R.x1)+.3,z0:R.z0-.3,z1:R.z1+2.3});}return out;}
function t41RailBuckets(){if(T41RAIL.buckets)return T41RAIL.buckets;const T=S.emp&&S.emp.tr;const B=new Map();T41RAIL.buckets=B;if(!T)return B;
  const N=CH/32,add=(k,e)=>{let b=B.get(k);if(!b)B.set(k,b=[]);b.push(e);};
  for(const pd of t41Pads())for(let cx=Math.floor(pd.x0/N);cx<=Math.floor(pd.x1/N);cx++)for(let cz=Math.floor(pd.z0/N);cz<=Math.floor(pd.z1/N);cz++)add(cx+','+cz,{pad:pd});
  if(!T.valley)return B;
  const paths=[t41Poly(T41_TRACK.V,5)];if(T.south)paths.push(t41Poly(T41_TRACK.S,0));
  const cross=[];for(const q of ROADS){for(const P of paths){for(let i=0;i<P.length-1;i+=2){const a=P[i];const qx=q[2]-q[0],qz=q[3]-q[1],ql=Math.hypot(qx,qz)||1;const along=Math.abs(a.dx*qx+a.dz*qz)/ql;
        if(along>.3||Math.max(Math.abs(a.dx),Math.abs(a.dz))<.97||Math.hypot(a.x-T41_TRACK.V[1][0],a.z-T41_TRACK.V[1][1])<8.5)continue;const d=segDist(a.x,a.z,q[0],q[1],q[2],q[3]);if(d<q[4]/2+.2)cross.push([a.x,a.z]);}}}
  const step=1/32;
  // the turnout where the Valley line leaves Mill Road: long timbers under both tracks from the points to where they part, and
  // the frog where the branch's outer rail crosses the main line's
  for(let z=43.35;z<47.6;z+=.62){const dz=z-43.2,xc=21.9-Math.sqrt(Math.max(0,25-dz*dz));const e={tim:1,z,x0:16.9-.85,x1:xc+.85};
    for(const kk of new Set([16.9-1,xc+1].map(x=>Math.floor(x/N)+','+Math.floor(z/N))))add(kk,e);}
  {const e={frog:1,x:17.4,z:46.36};add(Math.floor(17.4/N)+','+Math.floor(46.36/N),e);}
  for(const P of paths){const L=P.len;for(let s=0;s<=L;s+=step){const p=t41At(P,s);const pl=cross.some(c=>Math.abs(c[0]-p.x)<.5&&Math.abs(c[1]-p.z)<.5);
      const tz=p.z>43.0&&p.z<47.7&&p.x>16.2&&p.x<21.5;const e={x:p.x,z:p.z,dx:p.dx,dz:p.dz,sl:(s%.62)<step&&!tz,pl};
      for(const kk of new Set([[0,0],[-1.2,-1.2],[1.2,1.2],[1.2,-1.2],[-1.2,1.2]].map(([ox,oz])=>Math.floor((p.x+ox)/N)+','+Math.floor((p.z+oz)/N))))add(kk,e);}}
  return B;}
function t41PaintRail(c,cx,cz){const B=t41RailBuckets();const list=B.get(cx+','+cz);if(!list||!list.length)return;const N=CH/32,x0=cx*N,z0=cz*N;
  const g=c.getContext('2d');const id=g.getImageData(0,0,CH,CH),d=id.data;
  const at=(px,py)=>px>=0&&py>=0&&px<CH&&py<CH?(py*CH+px)*4:-1;
  const set=(px,py,col,a)=>{const i=at(px,py);if(i<0)return;if(a===undefined||a>=1){d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];return;}d[i]=d[i]*(1-a)+col[0]*a;d[i+1]=d[i+1]*(1-a)+col[1]*a;d[i+2]=d[i+2]*(1-a)+col[2]*a;};
  const P=(x,z)=>[Math.round((x-x0)*32),Math.round((z-z0)*32)];
  const H=(a,b)=>{const n=Math.sin(a*12.9898+b*78.233)*43758.5453;return n-Math.floor(n);};
  // 0. the trodden pads under the bus stops: packed dirt, a little paler at the middle, a soft edge
  for(const e of list){if(!e.pad)continue;const pd=e.pad;for(let z=Math.max(pd.z0,z0);z<Math.min(pd.z1,z0+N);z+=1/32)for(let x=Math.max(pd.x0,x0);x<Math.min(pd.x1,x0+N);x+=1/32){
      const cxp=(pd.x0+pd.x1)/2,czp=(pd.z0+pd.z1)/2,rx=(pd.x1-pd.x0)/2,rz=(pd.z1-pd.z0)/2;const ang=Math.atan2((z-czp)/rz,(x-cxp)/rx);
      const r=Math.hypot((x-cxp)/rx,(z-czp)/rz),edge=.82+.1*Math.sin(ang*3+cxp)+.07*Math.sin(ang*7+czp)+.06*(H(Math.floor(x*3),Math.floor(z*3))-.5);if(r>edge)continue;
      const [px,py]=P(x,z);const i=at(px,py);if(i<0||d[i+1]<d[i]+6)continue;set(px,py,H(Math.floor(x*6),Math.floor(z*6))>.8?[104,84,60]:[116,94,66],.92);}}
  const rails=list.filter(e=>!e.pad);if(!rails.length){g.putImageData(id,0,0);return;}
  const paved=e=>{const [px,py]=P(e.x,e.z);const i=at(px,py);if(i<0)return false;const r=d[i],gg=d[i+1],b=d[i+2];return Math.abs(r-gg)<14&&Math.abs(gg-b)<16&&r<120;};
  const wet=e=>{try{return LAYERS.water(e.x,e.z)||LAYERS.water(e.x+.9,e.z)||LAYERS.water(e.x-.9,e.z);}catch(_){return false;}};
  for(const e of rails){if(!wet(e))continue;const nx=-e.dz,nz=e.dx;for(let t=-1.1;t<=1.1;t+=1/32){const [px,py]=P(e.x+nx*t,e.z+nz*t);const edge=Math.abs(t)>.95;
      set(px,py,edge?(t<0?[132,104,70]:[52,38,26]):(e.sl?[96,74,50]:[74,56,38]));}}
  // 1. the ballast: a pale strip of grey stone, darker at its shoulders, stones clustered in twos and threes
  for(const e of rails){if(paved(e)||wet(e))continue;const nx=-e.dz,nz=e.dx;for(let t=-1.02;t<=1.02;t+=1/32){const x=e.x+nx*t,z=e.z+nz*t;const [px,py]=P(x,z);
      const sh=Math.abs(t)>.9;const h=H(Math.floor(x*6),Math.floor(z*6));let col=sh?[96,90,80]:[124,118,108];if(!sh&&h>.93)col=[140,134,122];else if(!sh&&h<.05)col=[106,100,90];set(px,py,col,sh?.8:.94);}}
  // 2. the ties: dark weathered timber, one colour everywhere. On a north-south line they're seen side-on: lit along the edge
  // toward the light, darkest on the edge facing you. On an east-west line they're seen end-on: just the dark end facing you.
  for(const e of rails){if(!e.sl||e.pl||paved(e)||wet(e))continue;const nx=-e.dz,nz=e.dx;const ew=Math.abs(e.dx)>Math.abs(e.dz);
    for(let t=-.85;t<=.85;t+=1/32)for(let w=-.11;w<=.11;w+=1/32){const [px,py]=P(e.x+nx*t+e.dx*w,e.z+nz*t+e.dz*w);
      let col=ew?[98,76,56]:[96,74,54];
      if(ew){if(nz*Math.sign(t)>.5&&Math.abs(t)>.8)col=[58,44,32];}
      else{let ox=0,oz=0;if(Math.abs(w)>.07){ox=e.dx*Math.sign(w);oz=e.dz*Math.sign(w);}else if(Math.abs(t)>.8){ox=nx*Math.sign(t);oz=nz*Math.sign(t);}
        if(ox||oz){if(oz>.5)col=[56,42,30];else if(-ox-oz>.5)col=[122,98,74];else col=[78,60,44];}}
      if(Math.abs(t)<.3&&Math.abs(w)<.03&&H(Math.floor(e.x*2),3)>.5)col=[80,62,46];
      set(px,py,col);}}
  for(const e of list){if(!e.tim)continue;for(let x=e.x0;x<=e.x1;x+=1/32)for(let w=-.11;w<=.11;w+=1/32){const [px,py]=P(x,e.z+w);
      let col=[96,74,54];if(w>.07)col=[56,42,30];else if(w<-.07)col=[122,98,74];if(x<e.x0+.04||x>e.x1-.04)col=[66,50,36];set(px,py,col);}}
  // 3. planks where a road crosses: boards laid along the rails, a flangeway beside each rail, seams between the boards
  for(const e of rails){if(!e.pl)continue;const nx=-e.dz,nz=e.dx;for(let t=-.9;t<=.9;t+=1/32){if(Math.abs(Math.abs(t)-.5)<.06)continue;const [px,py]=P(e.x+nx*t,e.z+nz*t);
      const k=Math.floor((t+.9)*32/6),seam=Math.round((t+.9)*32)%6===0;set(px,py,seam?[66,50,34]:k%2?[150,124,88]:[134,110,78]);}}
  // 4. the rails: a bright head, the steel under it, and a dark shadow on the ballast beside it; flush with a groove in paving
  for(const e of rails){const nx=-e.dz,nz=e.dx,pv=paved(e);const horiz=Math.abs(e.dx)>=Math.abs(e.dz);
    for(const side of [-.5,.5]){const [px,py]=P(e.x+nx*side,e.z+nz*side);
      if(horiz){set(px,py-1,pv?[150,154,160]:[222,226,232]);set(px,py,pv?[30,30,34]:[112,116,124]);if(!pv){set(px,py+1,[30,24,20],.85);set(px,py+2,[30,24,20],.35);}}
      else{set(px-1,py,pv?[150,154,160]:[222,226,232]);set(px,py,pv?[30,30,34]:[112,116,124]);if(!pv){set(px+1,py,[30,24,20],.85);set(px+2,py,[30,24,20],.35);}}}}
  // the switch blades: two tapered rails at the toe, closing on the stock rails
  for(const e of list){if(!e.frog)continue;for(const [bx,dir] of [[16.4,1],[17.4,-1]])for(let z=43.15;z<=44.7;z+=1/64){const k=(z-43.15)/1.55,x=bx+dir*(.03+k*k*.32)*(dir>0?1:.35);const [px,py]=P(x,z);set(px,py,[214,218,224]);set(px+1,py,[60,62,68],.7);}}
  for(const e of list){if(!e.frog)continue;for(let z=-.55;z<=.45;z+=1/32){const hw=Math.max(0,(z+.55)/1*.16);for(let x=-hw;x<=hw;x+=1/32){const [px,py]=P(e.x+x,e.z+z);set(px,py,Math.abs(x)>hw-.04?[150,154,160]:[40,40,46]);}}}
  g.putImageData(id,0,0);}
{const _ch=chunk;chunk=function(cx,cz){const k=cx+','+cz;const had=chunks.has(k);const c=_ch.apply(this,arguments);if(!had&&c&&S.emp&&S.emp.tr&&(S.emp.tr.valley||S.emp.tr.bus)){try{t41PaintRail(c,cx,cz);}catch(e){console.warn('t41 rail',e);}}return c;};}
// ---- the vehicles on the road and the rails: where each one is this frame, and its cars
const T41V={frame:-1,cars:[],riding:{}};
const t41Hash=(a,b)=>{const n=Math.sin(a*12.9898+b*78.233)*43758.5453;return n-Math.floor(n);};
function t41BusPhases(P2){const more=!!(S.emp&&S.emp.tr&&S.emp.tr.bus2);const n=more?6:3;const out=[];for(let i=0;i<n;i++)out.push(['bus'+(i+1),P2*i/n]);return out;}
function t41Fleet(){t41Build();const out=[];const h=S.hour;
  if(T41C.bus){const B=T41C.bus,P2=B.tt.period;for(const [id,ph] of t41BusPhases(P2))out.push({kind:'bus',id,w:t41Where(B,h,ph),V:B,phase:ph});}
  if(T41C.train)out.push({kind:'train',id:'train',w:t41Where(T41C.train,h,0),V:T41C.train,phase:0});
  return out;}
const T41_LEN={bus:6,loco:4.44,coach:5.13};
// the right-hand lane where the road is wide enough for it; on a narrow county road the bus keeps to the crown
const T41LANE=new Map();function t41Lane(x,z){const k=Math.round(x*2)+','+Math.round(z*2);let v=T41LANE.get(k);if(v!=null)return v;
  let w=3;try{if(!RGN.built)rgnBuild();const p=rgnSnap(x,z);if(p&&p.s)w=p.s[4];}catch(e){}v=Math.max(0,Math.min(.7,w/2-1.35));if(T41LANE.size>4000)T41LANE.clear();T41LANE.set(k,v);return v;}
const t41Lit=()=>S.hour>=18.6||S.hour<6.6||(typeof nightK!=='undefined'&&nightK>.35);
function t41Cars(){if(T41V.frame===FRAME_NO)return T41V.cars;T41V.frame=FRAME_NO;const cars=[];T41V.cars=cars;if(S.room||!S.emp||!S.emp.tr)return cars;const lit=t41Lit();
  for(const F of t41Fleet()){const w=F.w;if(!w)continue;if(Math.hypot(w.x-P.x,w.z-P.z)>80&&!(T41R.on&&T41R.veh===F.id))continue;
    const seen=w.leg?Math.floor(w.leg.t0*31):0,amb=Math.floor(t41Hash(seen,F.id.length)*4)+(T41V.riding[F.id]||0);
    const door=!w.moving&&w.stop&&!w.parked&&w.k>.08&&w.k<.92;
    if(F.kind==='bus'){const v=t41View(w.dx,w.dz);const f=w.moving?Math.floor(w.s/.5)%3:0;
      // the right-hand lane, or the kerb on the stop's side when it has pulled in
      let nx=-w.dz,nz=w.dx,lane=t41Lane(w.x,w.z);if(w.stop&&!w.moving&&T41_STOP_BY[w.stop]){const st=T41_STOP_BY[w.stop];const side=(st.at[0]-w.x)*nx+(st.at[1]-w.z)*nz;const kl=Math.max(.2,t41Lane(w.x,w.z)+.25);lane=side>=0?kl:-kl;}
      const x=w.x+nx*lane,z=w.z+nz*lane;const key=t41BusKey(v,f,door&&v==='E',Math.min(6,amb),lit);
      cars.push({F,key,x,z:z+(v==='E'||v==='W'?T41B.Wd/64:T41_LEN.bus/2),cz:z,v,door,lit,what:'bus',len:T41_LEN.bus,wid:T41B.Wd/32});continue;}
    // the train: the engine leads, the coach and the dining car behind it, nose to tail along the track
    const back=(w.leg&&w.leg.s1<w.leg.s0)?-1:1,list=[['loco',0]];let off=(T41_LEN.loco+T41_LEN.coach)/2;list.push(['coach',off]);if(TR41().dining)list.push(['dining',off+T41_LEN.coach+.05]);
    for(const [what,o] of list){const p=t41At(w.path,w.s-back*o);const dx=back*p.dx,dz=back*p.dz;const v=t41View(dx,dz);const f=w.moving?Math.floor((w.s-back*o)/.45)%3:0;
      const L=what==='loco'?T41_LEN.loco:T41_LEN.coach;
      const key=what==='loco'?t41LocoKey(v,f):t41CoachKey(v,f,what==='coach'?Math.min(10,amb*2):0,what==='dining',lit);
      const wid=(what==='loco'?T41E.Wd:T41K.Wd)/32;
      cars.push({F,key,x:p.x,z:p.z+(v==='E'||v==='W'?wid/2:L/2),cz:p.z,v,what,lit,steam:what==='loco'&&w.moving,len:L,wid});}}
  return cars;}
// drawn among everything else, by depth; their shadows go in with the sun's
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{for(const c of t41Cars()){if(!onScreen(c.x,c.z,320))continue;
    D.push({z:c.z,mind:1,draw(){drawSpr(c.key,sx(c.x),sz(c.z));if(c.steam)t41Steam(c,t);}});}}catch(e){console.warn('t41 draw',e);}};}
// shadows: everything of the transit's throws its shadow down and to the right, away from the top-left light the art is lit
// by, like the trees. A box (bus, engine, coach, shelter, buffer) throws the hull of its footprint and its roof moved along the
// light; a thin thing (a bench, a sign, a post) throws its own outline, sheared the same way.
const T41SHD={dx:.42,dy:.3};
function t41Hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
  for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
  for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}up.pop();lo.pop();return lo.concat(up);}
function t41BoxShadow(g,x0,z0,x1,z1,H){const C=[[sx(x0),sz(z0)],[sx(x1),sz(z0)],[sx(x1),sz(z1)],[sx(x0),sz(z1)]];const hl=t41Hull(C.concat(C.map(p=>[p[0]+T41SHD.dx*H,p[1]+T41SHD.dy*H])));
  g.beginPath();hl.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();}
{const _ss=sunShadow;sunShadow=function(o,X,Y){if(o&&o.t41)return true;return _ss.apply(this,arguments);};}
{const _se=sunEnd;sunEnd=function(){try{const s=DX.sun;if(s&&!s.lamp&&DX.sg){const g=DX.sg;g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a1206';
    for(const c of t41Cars()){if(!onScreen(c.x,c.z,320))continue;const side=c.v==='E'||c.v==='W';const hx=(side?c.len:c.wid)/2,hz=(side?c.wid:c.len)/2;
      t41BoxShadow(g,c.x-hx,c.cz-hz,c.x+hx,c.cz+hz,c.what==='bus'?84:c.what==='loco'?96:90);}
    for(const o of T41W.objs){const f=o.t41sh;if(!f||o.hide||!onScreen(o.x,o.z,220))continue;
      if(f.fp)t41BoxShadow(g,f.fp[0],f.fp[1],f.fp[2],f.fp[3],f.h);
      else{const m=SPR[o.spr],c=m&&dxSil(o.spr);if(!c)continue;g.setTransform(1,0,-T41SHD.dx,-T41SHD.dy,Math.round(sx(o.x)),Math.round(sz(o.z)));g.drawImage(c,-Math.round(m.ax),-Math.round(m.ay));g.setTransform(1,0,0,1,0,0);}}}
  }catch(e){console.warn('t41 shadow',e);}return _se.apply(this,arguments);};}
// the engine's breath: soft puffs out of the stack, drifting back over the train
function t41Steam(c,t){const m=SPR[c.key];if(!m||!m.stack)return;const X=sx(c.x)+m.stack[0],Y=sz(c.z)+m.stack[1];const dir=c.v==='E'?-1:c.v==='W'?1:0;
  // the engine's breath: puffs leave the chimney small and dense, swell and thin as they roll back over the train
  const night=isNight();for(let i=0;i<7;i++){const k=((t*1.25+i/7)%1);const px=X+dir*k*54+Math.sin(i*2.1+t*1.3)*2.5,py=Y-3-k*20-(c.v==='N'?k*10:0)+(c.v==='S'?-k*6:0);const r=2.5+k*9;
    const a=(1-k)*.78;ctx2.fillStyle=`rgba(${night?'92,94,104':'226,224,218'},${a})`;ctx2.beginPath();ctx2.arc(Math.round(px),Math.round(py),Math.round(r),0,Math.PI*2);ctx2.fill();
    ctx2.fillStyle=`rgba(${night?'60,62,70':'176,172,166'},${a*.7})`;ctx2.beginPath();ctx2.arc(Math.round(px+r*.25),Math.round(py+r*.35),Math.round(r*.7),0,Math.PI*2);ctx2.fill();}}
// ---- riding: you wait at the stop, it pulls in, you get on, the doors shut, it goes; later it pulls in where you're going
const T41R={on:false};
function t41TimeStr(h){h=((h%24)+24)%24;const hh=Math.floor(h),mm=Math.round((h-hh)*60)%60;const ap=hh>=12?'pm':'am';return `${((hh+11)%12)+1}:${String(mm).padStart(2,'0')} ${ap}`;}
function t41Trip(kind,A,B){t41Build();const now=S.hour;
  if(kind==='bus'){const BB=T41C.bus;if(!BB)return null;let best=null;for(const [id,ph] of t41BusPhases(BB.tt.period)){const r=t41Next(BB,ph,A,B,now);if(r&&(!best||r.arr<best.arr))best=Object.assign(r,{veh:id,phase:ph});}return best;}
  const T=T41C.train;if(!T)return null;const r=t41Next(T,0,A,B,now);return r?Object.assign(r,{veh:'train',phase:0}):null;}
function t41RideFare(){return t41Compete()&&!t41Mine()?(TR41().fare|0):0;}
function t41Ride(kind,A,B){if(T41R.on)return;const trip=t41Trip(kind,A,B);if(!trip){toast(kind==='bus'?'No bus gets there before the last one goes in at nine.':'No train gets there before nine.',2.6);return;}
  const fare=t41RideFare();if(fare){if(S.coins<fare){SFX.deny&&SFX.deny();toast(`The fare is ${fare}. You have ${S.coins}.`,2.2);return;}S.coins-=fare;updateHud&&updateHud();t41PayOwner(fare,'fare');}
  const toS=kind==='bus'?T41_STOP_BY[B]:T41_STA_BY[B];
  $('note').hidden=true;S.paused=false;fade(1);
  setTimeout(()=>{S.hour=Math.max(S.hour,trip.depWait+.004);T41R.on=true;T41R.kind=kind;T41R.veh=trip.veh;T41R.trip=trip;T41R.B=B;T41R.st='board';T41R.t=0;T41R.hide=false;
    P.walkTo=null;P.anim=null;fade(0);},520);}
// the train's whistle: two notes a third apart, breathy, and a hiss of steam
function t41Whistle(){try{if(!A.ok)return;A.tone(523,1,'triangle',.045,{a:.06});A.tone(659,1,'triangle',.035,{a:.06});A.hiss(.7,.035,'bandpass',1800);}catch(e){}}
// boarding, the first stretch with the camera riding along, the jump to the arrival, getting off
{const _u=update;update=function(dt){_u(dt);if(!T41R.on)return;try{
  if(S.room||S.mode!=='play'){T41R.on=false;T41R.hide=false;SFX.engine&&SFX.engine(false);return;}
  T41R.t+=dt;const F=t41Fleet().find(f=>f.id===T41R.veh);if(!F){T41R.on=false;T41R.hide=false;return;}const w=F.w;
  if(T41R.st==='board'){// stand by the door until it closes, then step in
    if(T41R.t>.9&&!T41R.hide){T41R.hide=true;SFX.thud&&SFX.thud(0,.25);}
    if(T41R.t>1.6){S.hour=Math.max(S.hour,T41R.trip.dep+.001);T41R.st='go';T41R.t=0;if(T41R.kind==='train')t41Whistle();else{SFX.engineStart&&SFX.engineStart();SFX.engine&&SFX.engine(true);}}}
  if(T41R.hide){P.x=w.x;P.z=w.z+.2;}
  if(T41R.st==='go'&&T41R.t>2.4){T41R.st='jump';fade(1);setTimeout(()=>{S.hour=Math.max(S.hour,T41R.trip.arr-.045);T41R.st='arrive';T41R.t=0;fade(0);},480);}
  if(T41R.st==='arrive'&&(!w.moving&&w.stop===T41R.B||T41R.t>6)){T41R.st='off';T41R.t=0;}
  if(T41R.st==='off'&&T41R.t>.7&&T41R.hide){const kind=T41R.kind,B=T41R.B;const at=kind==='bus'?T41_STOP_BY[B].at:(()=>{const st=T41_STA_BY[B],p=st.plat;return [(p.x0+p.x1)/2,(p.z0+p.z1)/2];})();
    P.x=kind==='bus'?w.x:at[0];P.z=kind==='bus'?w.z+1.3:at[1];collide(P,.3);T41R.hide=false;T41R.on=false;SFX.engine&&SFX.engine(false);SFX.thud&&SFX.thud(0,.2);
    const nm=kind==='bus'?T41_STOP_BY[B].name:T41_STA_BY[B].name;const TT=TR41();TT.today=TT.today&&TT.today.day===S.day?TT.today:{day:S.day,bus:0,train:0,named:[],paid:0};TT.rides=(TT.rides|0)+1;
    toast(`${nm}. ${t41TimeStr(S.hour)}.`,2.2);try{guideS&&(guideS().rode41=1);}catch(e){}}}catch(e){console.warn('t41 ride',e);T41R.on=false;T41R.hide=false;SFX.engine&&SFX.engine(false);}};}
// while you ride, you're on the bus, not standing in the road
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);if(!T41R.on||!T41R.hide)return;const i=D.findIndex(d=>d.player);if(i>=0)D.splice(i,1);};}
{const _sa=startAnim;startAnim=function(){if(T41R.on)return;return _sa.apply(this,arguments);};}
// ---- the town rides. Anyone setting off on a long walk looks for a stop near them and one near where they're going; if the
// ride saves them more than half the walk, they walk to the stop, wait for the bus (or the train), get on, and get off at the
// far end. (The host's townsfolk; everyone else sees them where the host's game says they are.)
function t41RouteLen(x,z,r){let L=0,px=x,pz=z;for(const [a,b] of r){L+=Math.hypot(a-px,b-pz);px=a;pz=b;}return L;}
function t41Places(){const out=[];for(const s of t41StopsBuilt()){const w=t41StopWait(s);out.push({kind:'bus',id:s.id,x:w[0],z:w[1],ox:w[2],oz:w[3],name:s.name});}
  for(const s of t41Stations()){const p=s.plat;out.push({kind:'train',id:s.id,x:p.vert?(p.x0+p.x1)/2:(p.x0+p.x1)/2,z:p.vert?(p.z0+p.z1)/2:p.z1+.4,name:s.name});}return out;}
function t41NpcTick(){if(!t41Host()||!S.emp||!S.emp.tr||S.room===undefined)return;const T=S.emp.tr;if(!T.bus&&!T.valley)return;
  if(S.hour<T41_SERVICE[0]||S.hour>=T41_SERVICE[1]-.3)return;const places=t41Places();if(places.length<2)return;T41V.riding={};
  for(const n of npcs){if(!n.def||!LIFE[n.def.id])continue;let R=n.t41;
    if(R&&(R.day!==S.day||R.want!==n.target)){if(R.st==='ride'||n.vis===false&&R.st!=='done'){n.vis=true;const b=R.b;n.x=b.x;n.z=b.z;}if(R.gh!==undefined)n.goingHome=R.gh;delete n.t41;continue;}
    if(!R){if(n.loc!=='out'||!n.route||n.route.t41chk||talkingTo===n)continue;n.route.t41chk=1;if(n.route.length<2)continue;
      const L=t41RouteLen(n.x,n.z,n.route);if(L<110)continue;const tgt=n.route[n.route.length-1];
      let best=null;for(const a of places)for(const b of places){if(a===b||a.kind!==b.kind)continue;const wa=Math.hypot(a.x-n.x,a.z-n.z),wb=Math.hypot(b.x-tgt[0],b.z-tgt[1]);
        if(wa>45||wb>90)continue;const walk=wa+wb;if(walk>L*.5)continue;const trip=t41Trip(a.kind,a.id,b.id);if(!trip||trip.arr>T41_SERVICE[1])continue;
        if(!best||walk+(trip.arr-S.hour)*200<best.score)best={a,b,trip,score:walk+(trip.arr-S.hour)*200};}
      if(!best)continue;
      R=n.t41={st:'walk',a:best.a,b:best.b,kind:best.a.kind,trip:best.trip,tgt:[tgt[0],tgt[1]],want:n.target,day:S.day,gh:n.goingHome};n.goingHome=false;
      const off=(t41Hash(n.def.id.length,S.day)-.5)*1.0;const ox=best.a.ox==null?1:best.a.ox,oz=best.a.oz||0;n.route=routeTo(n.x,n.z,best.a.x+off*ox,best.a.z+off*oz+(oz?0:.3));if(n.route)n.route.t41chk=1;continue;}
    if(R.st==='walk'){if(!n.route||!n.route.length){const tr=t41Trip(R.kind,R.a.id,R.b.id);if(!tr||tr.arr>T41_SERVICE[1]){n.goingHome=R.gh;n.route=routeTo(n.x,n.z,R.tgt[0],R.tgt[1]);if(n.route)n.route.t41chk=1;delete n.t41;continue;}
        R.trip=tr;R.st='wait';n.dir=R.kind==='bus'?({S:'S',N:'N',W:'W',E:'E'}[(T41_STOP_BY[R.a.id]||{}).view]||'S'):'E';}else continue;}
    if(R.st==='wait'){n.route=null;n.waitT=5;n.clip='idle';
      if(S.hour>=R.trip.dep-.002){const F=t41Fleet().find(f=>f.id===R.trip.veh);n.vis=false;R.st='ride';T.today=T.today&&T.today.day===S.day?T.today:{day:S.day,bus:0,train:0,named:[],paid:0};
        T.today[R.kind]=(T.today[R.kind]|0)+1;if(!T.today.named.includes(n.def.id))T.today.named.push(n.def.id);}
      continue;}
    if(R.st==='ride'){n.route=null;n.waitT=5;T41V.riding[R.trip.veh]=(T41V.riding[R.trip.veh]||0)+1;
      if(S.hour>=R.trip.arr+.01){n.x=R.b.x+(t41Hash(n.def.id.length,3)-.5);n.z=R.b.z+.4;n.vis=true;n.goingHome=R.gh;n.route=routeTo(n.x,n.z,R.tgt[0],R.tgt[1]);if(n.route)n.route.t41chk=1;R.st='done';}
      continue;}
    if(R.st==='done'&&!n.route)delete n.t41;}}
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused)return;try{t41NpcTick();}catch(e){console.warn('t41 npc',e);}};}
// ---- the takings: every morning, yesterday's riders (the town's, counted, and those you saw), less the upkeep
function t41Riders(T,kind,day){// a quiet valley: a few riders a stop, more in town, more in the rain, more once people are used to it
  const rain=typeof S.weather==='string'&&/rain|storm/.test(S.weather)?1.25:1;
  if(kind==='bus'){let n=0;for(const s of t41StopsBuilt()){const age=day-((T.stops[s.id]&&T.stops[s.id].day)||day);n+=(4+s.pull*2)*clamp(.35+age/6,.35,1);}return Math.round(n*(T.bus2?1.5:1)*rain);}
  let n=0;for(const s of t41Stations()){const age=day-((s.line==='V'?T.valley:T.south)||day);n+=(s.id==='xr'?14:8)*clamp(.35+age/6,.35,1);}return Math.round(n*rain);}
function t41Dawn(){if(!t41Host())return;const T=S.emp&&S.emp.tr;if(!T||!(T.bus||T.valley))return;if(T.dawn===S.day)return;T.dawn=S.day;const yd=S.day-1;
  const td=T.today&&T.today.day===yd?T.today:{bus:0,train:0,named:[]};
  const bus=T.bus?Math.max(t41Riders(T,'bus',yd),td.bus|0):0,train=T.valley?Math.max(t41Riders(T,'train',yd),td.train|0):0;
  const fareB=bus*T41_FARE.bus,fareT=train*(T41_FARE.train+(T.dining?T41_FARE.dining:0));
  const up=(T.bus?T41_UPKEEP.bus:0)+(T.bus2?T41_UPKEEP.bus2:0)+(T.valley?T41_UPKEEP.valley:0)+(T.south?T41_UPKEEP.south:0);
  const net=fareB+fareT-up;const named=(td.named||[]).map(id=>{try{return npcById(id).def.name;}catch(e){return null;}}).filter(Boolean);
  const row={day:yd,bus,train,fareB,fareT,up,net,named:named.slice(0,4),paid:td.paid|0};T.log.unshift(row);T.log=T.log.slice(0,7);T.total=(T.total|0)+net;
  T.today={day:S.day,bus:0,train:0,named:[],paid:0};
  const owner=T.by||t41Me();if(typeof mpOn==='function'&&mpOn()&&typeof mkPay==='function'&&owner!==t41Me())mkPay(owner,net,`The county line: ${net>=0?'+':''}${net} coins yesterday.`);else{S.coins+=net;updateHud&&updateHud();}
  T41S.row=row;}
const T41S={row:null};
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{t41Dawn();}catch(e){console.warn('t41 dawn',e);}
  try{const row=T41S.row;if(row&&row.day===S.day-1&&!T41S.shown){T41S.shown=row;setTimeout(()=>{try{const s=$('saleSlip');if(s&&!s.hidden&&s.querySelector('.slip'))t41SlipAdd(s,row);else t41SlipOwn(row);}catch(e){}},1500);}}catch(e){}return r;};}
const T41ICON={};const t41Ico=k=>T41ICON[k]||(T41ICON[k]=k==='kero'?(typeof iconOf==='function'?iconOf('mc_kero'):''):t41Icon(k));
function t41SlipRows(row){const L=[];if(row.bus)L.push(['bus',`The county bus · ${row.bus} rider${row.bus===1?'':'s'}`,'',row.fareB]);if(row.train)L.push(['train',`The Marrow Valley line · ${row.train} rider${row.train===1?'':'s'}`,'',row.fareT]);
  L.push(['kero','Upkeep: fuel, coal, wages','',-row.up]);return L;}
const t41SlipRow=([ic,n,q,v],cls)=>`<div class="srow${cls||''}"><img src="${t41Ico(ic)}" alt=""><span class="sn">${n}</span><span class="sq">${q!==''?'×'+q:''}</span><span class="sv" style="white-space:nowrap;display:inline-flex;align-items:baseline;justify-content:flex-end;gap:3px;${v<0?'color:#a8281c':''}">${v>=0?'+':''}${v}<small style="font-size:9px;opacity:.8">coins</small></span></div>`;
function t41SlipAdd(s,row){const box=s.querySelector('.slip');if(!box||box.querySelector('.t41'))return;let h=`<div class="scat t41"><span>The county line</span><span>${row.net>=0?'+':''}${row.net}</span></div>`;
  for(const r of t41SlipRows(row))h+=t41SlipRow(r,' t41');
  if(row.named.length)h+=`<p class="t41seen">Seen riding: ${row.named.join(', ')}</p>`;box.insertAdjacentHTML('beforeend',h);}
function t41SlipOwn(row){const s=$('saleSlip');if(!s||!s.hidden)return;let h=`<h2>The county line</h2><p class="sub">Yesterday’s takings, pinned to the cabin door with the timetable:</p><div class="slip">`;
  for(const r of t41SlipRows(row))h+=t41SlipRow(r,'');
  if(row.named.length)h+=`<p class="t41seen">Seen riding: ${row.named.join(', ')}</p>`;
  h+=`</div><div class="stot"><span>${row.net>=0?'Profit':'Loss'}</span><span><span class="coin"></span>${row.net} coins</span></div><div class="acts"><button class="close hot" id="t41Ok">Good</button></div>`;
  s.innerHTML=h;s.hidden=false;S.paused=true;SFX.coin&&SFX.coin();$('t41Ok').addEventListener('click',()=>{s.hidden=true;S.paused=!$('note').hidden;});}
// ---- the book changes in one place; on a shared farm the host's book is the real one and a farmhand's screen mirrors it
function t41Apply(op,a,by){const T=TR41();
  if(op==='bus'){if(T.bus)return false;T.bus=S.day;T.by=T.by||by;T.stops.farm=T.stops.farm||{day:S.day};}
  else if(op==='stop'){if(!T.bus||!T41_STOP_BY[a.id]||T.stops[a.id])return false;T.stops[a.id]={day:S.day};}
  else if(op==='bus2'){if(!T.bus||T.bus2)return false;T.bus2=S.day;}
  else if(op==='valley'){if(T.valley||!T.bus)return false;T.valley=S.day;T.by=T.by||by;}
  else if(op==='south'){if(!T.valley||T.south)return false;T.south=S.day;}
  else if(op==='dining'){if(!T.valley||T.dining)return false;T.dining=S.day;}
  else if(op==='fare'){T.fare=clamp(a.v|0,0,20);}
  else return false;
  try{t41Build();t41Sync(true);}catch(e){}return true;}
function t41Do(op,a){a=a||{};if(t41Guest()){try{CO.room.emit('tr41',Object.assign({op,by:t41Me()},a),HOST.hostPeer);}catch(e){}t41Apply(op,a,t41Me());return;}
  if(t41Apply(op,a,t41Me())){try{saveGame&&saveGame(true);}catch(e){}}}
// a fare paid by someone who isn't the owner goes to the owner, through the host
function t41PayOwner(n,why){const o=t41Owner();if(!o||o===t41Me()||!n)return;const T=TR41();
  if(t41Guest()){try{CO.room.emit('tr41pay',{to:o,n,by:t41Me()},HOST.hostPeer);}catch(e){}return;}
  if(typeof mkPay==='function')mkPay(o,n,`${t41Me()} paid ${n} to ride the county line.`);T.paidIn=(T.paidIn|0)+n;}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('tr41',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data,by=clean(d.by||'');if(t41Apply(String(d.op||''),d,by)){
      const nm={bus:'the county bus',stop:'a bus stop',bus2:'a second bus',valley:'the Valley line',south:'the South line',dining:'a dining car'}[d.op];if(nm&&d.op!=='fare')toast(`${by} paid for ${nm}.`,3);try{saveGame(true);}catch(e){}}}catch(e){}}));
  HOST.off.push(r.on('tr41pay',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data,n=Math.max(0,Math.min(20,d.n|0)),to=clean(d.to||''),by=clean(d.by||'');
      if(!n||!to||to!==t41Owner())return;if(typeof mkPay==='function')mkPay(to,n,`${by} paid ${n} to ride the county line.`);const T=TR41();T.paidIn=(T.paidIn|0)+n;T.today=T.today&&T.today.day===S.day?T.today:{day:S.day,bus:0,train:0,named:[],paid:0};T.today.paid=(T.today.paid|0)+n;}catch(e){}}));
  return r0;};}
// ---- the farm book's Transit page
function t41Map(w,h){// a small map of the county line: the roads in pale ink, the rail in black with ties, the stops and stations
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const x0=-140,x1=200,z0=-20,z1=305;
  const sc=Math.min(w/(x1-x0),h/(z1-z0)),ox=(w-(x1-x0)*sc)/2,oz=(h-(z1-z0)*sc)/2;const X=x=>ox+(x-x0)*sc,Y=z=>oz+(z-z0)*sc;
  g.fillStyle='#e8dcbc';g.fillRect(0,0,w,h);g.strokeStyle='#cbb88e';g.lineWidth=2;
  for(const q of ROADS){if(Math.max(q[0],q[2])<x0||Math.min(q[0],q[2])>x1||Math.max(q[1],q[3])<z0||Math.min(q[1],q[3])>z1)continue;g.beginPath();g.moveTo(X(q[0]),Y(q[1]));g.lineTo(X(q[2]),Y(q[3]));g.stroke();}
  const T=S.emp&&S.emp.tr;
  if(T41C.bus){g.strokeStyle='#3f6246';g.lineWidth=3;g.setLineDash([5,3]);g.beginPath();T41C.bus.route.path.forEach((p,i)=>i?g.lineTo(X(p.x),Y(p.z)):g.moveTo(X(p.x),Y(p.z)));g.stroke();g.setLineDash([]);}
  if(T&&T.valley){const RP=t41RailPaths();for(const P of T.south?[RP.V,RP.S]:[RP.V]){g.strokeStyle='#2a1a10';g.lineWidth=3;g.beginPath();P.forEach((p,i)=>i?g.lineTo(X(p.x),Y(p.z)):g.moveTo(X(p.x),Y(p.z)));g.stroke();
    g.strokeStyle='#2a1a10';g.lineWidth=1;for(let i=0;i<P.length;i+=24){const p=P[i];g.beginPath();g.moveTo(X(p.x)-p.dz*4,Y(p.z)+p.dx*4);g.lineTo(X(p.x)+p.dz*4,Y(p.z)-p.dx*4);g.stroke();}}}
  g.font='bold 10px "Hollow Pixel",monospace';g.textAlign='left';
  for(const st of T41_STOPS){const built=T&&T.stops&&T.stops[st.id];const x=X(st.at[0]),y=Y(st.at[1]);g.fillStyle=built?'#3f6246':'#e8dcbc';g.strokeStyle='#3f6246';g.lineWidth=2;g.beginPath();g.arc(x,y,4.5,0,7);g.fill();g.stroke();}
  for(const st of T41_STATIONS){const on=T&&T.valley&&(st.line==='V'||T.south);const p=st.plat;const x=X((p.x0+p.x1)/2),y=Y((p.z0+p.z1)/2);g.fillStyle=on?'#2a1a10':'#e8dcbc';g.strokeStyle='#2a1a10';g.lineWidth=2;g.fillRect(x-4,y-4,8,8);g.strokeRect(x-4,y-4,8,8);}
  g.fillStyle='#2a1a10';for(const [t,x,z] of [['Marrow Hollow',30,-14],['Wickham',104,58],['Deep Corn',30,196],['Low Fields',30,292],['Route 9 W',-138,-12],['Black Lake',166,-16]])g.fillText(t,X(x),Y(z));
  return c.toDataURL();}
// the line diagram printed on the timetable: every stop a dot along its line (filled when it's built), where the bus and the
// train are right now, and the stop you're standing at ringed
// the line diagram: the bus line across the top, the railway's two lines under it, each station straight below the bus stop
// of the same place (the Crossroads between Hollow Acre and Marrow Hollow, which it serves), so the two read together
function t41Diagram(here){const T=TR41();t41Build();const fleet=t41Fleet();
  const line=(cls,label,items,veh,r0,r1)=>{let h=`<div class="t41ln ${cls}"><div class="t41lab">${label}</div><div class="t41track"><div class="t41rule" style="left:${r0==null?0:r0}%;right:${100-(r1==null?100:r1)}%"></div>`;
    items.forEach((it,i)=>{const x=it.x!=null?it.x:(items.length>1?i/(items.length-1)*100:50);h+=`<span class="t41st${it.on?' on':''}${it.here?' here':''}" style="left:${x}%">${it.here?'<em>you are here</em>':''}<i></i><b>${it.name}</b></span>`;});
    for(const v of veh)h+=`<img class="t41veh" src="${t41Ico(v.kind)}" style="left:${v.x}%" alt="${v.kind}">`;return h+'</div></div>';};
  const ids=T41_ORDER;const BX=id=>ids.indexOf(id)/(ids.length-1)*100;const busItems=ids.map(id=>({name:T41_STOP_BY[id].name,on:!!(T.bus&&T.stops[id]),here:here==='bus:'+id}));
  const busVeh=[];if(T41C.bus){const st=T41C.bus.route.stops;const pos=s=>{for(let i=0;i<st.length-1;i++)if(s<=st[i+1].s){const a=ids.indexOf(st[i].id),b=ids.indexOf(st[i+1].id),k=(s-st[i].s)/Math.max(1,st[i+1].s-st[i].s);return (a+(b-a)*k)/(ids.length-1)*100;}return 100;};
    for(const f of fleet)if(f.kind==='bus'&&!f.w.parked)busVeh.push({kind:'bus',x:pos(f.w.s)});}
  let h='<div class="t41dia">'+line('bus','MARROW CO. LINES · bus',busItems,busVeh);
  const xX=(BX('farm')+BX('town'))/2,xW=BX('wick'),xC=BX('corn'),xL=BX('low');
  const it=(id,nm,x,on)=>({name:nm,x,on,here:here==='train:'+id});
  const vVeh=[],sVeh=[];const tr=fleet.find(f=>f.kind==='train');if(tr&&!tr.w.parked&&tr.w.path){const W=tr.w;const onV=T41C.rail&&W.path===T41C.rail.V;
    const nr=st=>t41Near(W.path,st.stop[0],st.stop[1]).s;const sXr=nr(T41_STA_BY.xr);
    if(onV){const sW=nr(T41_STA_BY.wick);vVeh.push({kind:'train',x:xX+clamp((W.s-sXr)/Math.max(1,sW-sXr),0,1)*(xW-xX)});}
    else{const sC=nr(T41_STA_BY.corn),sL=nr(T41_STA_BY.low);const x=W.s<sC?xX+clamp((W.s-sXr)/Math.max(1,sC-sXr),0,1)*(xC-xX):xC+clamp((W.s-sC)/Math.max(1,sL-sC),0,1)*(xL-xC);sVeh.push({kind:'train',x});}}
  h+=line('rail','MARROW VALLEY LINE · to Wickham',[it('xr','Crossroads',xX,!!T.valley),it('wick','Wickham',xW,!!T.valley)],vVeh,xX,xW);
  h+=line('rail','SOUTH LINE · down Mill Road',[it('xr','Crossroads',xX,!!T.valley),it('corn','Deep Corn',xC,!!(T.valley&&T.south)),it('low','Low Fields',xL,!!(T.valley&&T.south))],sVeh,xX,xL);
  return h+'</div>';}
function t41Row(title,small,btn){return `<div class="mc34r"><div class="mc34t"><b>${title}</b><small>${small}</small></div><div class="mc34b">${btn}</div></div>`;}
function t41NextBuy(T){const coin=p=>p?`· ${p}`:'· free';const btn=(op,lab,id)=>`<button data-t41="${op}"${id?` data-id="${id}"`:''} ${S.coins<t41Price(op)?'class="nope"':''}>${lab} ${coin(t41Price(op))}</button>`;
  if(!T.bus)return t41Row('The county bus','Three old county buses and a stop at your gate. They run 6 am to 9 pm.',btn('bus','Buy'));
  const st=T41_STOPS.find(s=>!T.stops[s.id]);if(st)return t41Row(st.name,`${st.note}. The next stop to put up.`,btn('stop','Put up a stop',st.id));
  if(!T.bus2)return t41Row('Three more buses','Half the wait at every stop.',btn('bus2','Buy'));
  if(!T.valley)return t41Row('The Valley line','Rail from the Crossroads to Wickham, an engine and a coach.',btn('valley','Lay it'));
  if(!T.south)return t41Row('The South line','On down Mill Road to the Deep Corn and the Low Fields.',btn('south','Lay it'));
  if(!T.dining)return t41Row('A dining car','A second coach with a stove and four tables.',btn('dining','Buy'));return '';}
function t41Book(){const T=TR41(),run=t41CanRun();const coin=p=>p?`· ${p}`:'· free';
  if(!t41Open())return `<p class="bzs">The county won’t license a line to a farm that might not be here next week. Once the first chapter of this is behind you, the papers are yours to sign.</p>`;
  let h=t41Diagram('');
  const L=T.log[0];if(L)h+=`<p class="bwlead">Yesterday: ${L.bus?`${L.bus} on the bus`:''}${L.bus&&L.train?', ':''}${L.train?`${L.train} on the train`:''}. Fares ${L.fareB+L.fareT}, upkeep ${L.up}: <b style="color:${L.net>=0?'#3a5a2a':'#a8281c'}">${L.net>=0?'+':''}${L.net}</b>.${L.named.length?` Seen riding: ${L.named.join(', ')}.`:''}</p>`;
  else if(T.bus||T.valley)h+=`<p class="bwlead">The first takings come in tomorrow morning.</p>`;
  if(run){const nx=t41NextBuy(T);if(nx)h+='<h4>Next for the line</h4>'+nx;}
  if(!run)h+=`<p class="bzs">${T.by}’s line. You can ride it; ${T.fare?`the fare is <b>${T.fare}</b>, paid to ${T.by}.`:'it’s free for now.'}</p>`;
  h+='<h4>The county bus</h4>';
  if(!T.bus)h+=t41Row('The county bus',`The county’s three old bottle-green buses, MARROW CO. LINES on their sides, laid up since the last driver went into the reservoir. Buy them and they call at the stops you put up, 6 am to 9 pm. Upkeep ${T41_UPKEEP.bus} a day; fares ${T41_FARE.bus} a rider. Comes with the stop at your gate.`,run?`<button data-t41="bus" ${S.coins<t41Price('bus')?'class="nope"':''}>Buy ${coin(t41Price('bus'))}</button>`:'');
  else{for(const st of T41_STOPS){const b=T.stops[st.id];h+=t41Row(`${b?'✓ ':''}${st.name}`,`${st.note}.${b?' Built day '+b.day+'.':''}`,b||!run?'':`<button data-t41="stop" data-id="${st.id}" ${S.coins<t41Price('stop')?'class="nope"':''}>Put up a stop ${coin(t41Price('stop'))}</button>`);}
    h+=t41Row(`${T.bus2?'✓ ':''}Three more buses`,`Six buses on the road instead of three: half the wait at every stop, and more riders for it. Upkeep ${T41_UPKEEP.bus2} a day.`,T.bus2||!run?'':`<button data-t41="bus2" ${S.coins<t41Price('bus2')?'class="nope"':''}>Buy ${coin(t41Price('bus2'))}</button>`);}
  h+='<h4>The Marrow Valley line</h4>';
  const nst=Object.keys(T.stops).length;
  if(!T.valley)h+=t41Row('The Valley line',`Rail laid along Mill Road from the Crossroads (for the farm and the town) and out along the Wickham road, a little tank engine and a coach. ${T.bus&&nst>=4?'':'The county wants to see the bus running to four stops first.'} Upkeep ${T41_UPKEEP.valley} a day; fares ${T41_FARE.train} a rider.`,run&&T.bus&&nst>=4?`<button data-t41="valley" ${S.coins<t41Price('valley')?'class="nope"':''}>Lay it ${coin(t41Price('valley'))}</button>`:'');
  else{h+=t41Row('✓ The Valley line',`Crossroads to Wickham. Laid day ${T.valley}.`,'');
    h+=t41Row(`${T.south?'✓ ':''}The South line`,T.south?`On down Mill Road to the Deep Corn and the Low Fields. Laid day ${T.south}.`:`On down Mill Road from the junction to the Deep Corn and the Low Fields: two more stations. Upkeep ${T41_UPKEEP.south} a day.`,T.south||!run?'':`<button data-t41="south" ${S.coins<t41Price('south')?'class="nope"':''}>Lay it ${coin(t41Price('south'))}</button>`);
    h+=t41Row(`${T.dining?'✓ ':''}A dining car`,`A second coach with a stove and four tables. Riders pay ${T41_FARE.dining} more for the coffee.`,T.dining||!run?'':`<button data-t41="dining" ${S.coins<t41Price('dining')?'class="nope"':''}>Buy ${coin(t41Price('dining'))}</button>`);}
  if(t41Compete()&&(T.bus||T.valley)&&run)h+=`<h4>The fare for other players</h4><p class="bzs">Other farms ride your line for <b>${T.fare|0}</b> a ride, paid to you.${T.paidIn?` They’ve paid you ${T.paidIn} so far.`:''} You ride free.</p><p><span class="mc34sw"><button data-t41fare="-1">− 1</button><b style="margin:0 10px">${T.fare|0}</b><button data-t41fare="1">+ 1</button></span></p>`;
  else if(T.bus||T.valley)h+=`<p class="bzs">You ride free.${typeof mpOn==='function'&&mpOn()?' So does everyone on this farm.':''}</p>`;
  if(T.log.length>1){h+='<h4>The last week</h4>';for(const r of T.log.slice(0,6))h+=`<div class="t41log"><span>Day ${r.day}</span><span>${r.bus+r.train} riders</span><span style="color:${r.net>=0?'#3a5a2a':'#a8281c'}">${r.net>=0?'+':''}${r.net}</span></div>`;}
  return h+'<div style="height:6px"></div>';}
function t41TabBtn(on){const N=$('noteText');const tabs=N&&N.querySelector('.bztabs');if(!tabs||tabs.querySelector('[data-t41tab]'))return;const b=document.createElement('button');b.dataset.t41tab='1';b.textContent='Transit';if(on)b.className='on';
  b.onclick=()=>setTimeout(()=>empOpen('transit'),0);tabs.appendChild(b);}
{const _eo=empOpen;empOpen=function(tab){if(tab!=='transit'){const r=_eo.apply(this,arguments);try{t41TabBtn(false);}catch(e){}return r;}
  _eo.call(this,'town');const N=$('noteText');if(!N)return;const tabs=N.querySelector('.bztabs');if(!tabs)return;while(tabs.nextSibling)tabs.nextSibling.remove();
  tabs.querySelectorAll('button').forEach(b=>b.classList.remove('on'));try{mc34TabBtn(false);}catch(e){}t41TabBtn(true);const box=document.createElement('div');box.innerHTML=(T41UI.msg?`<p class="t41msg">${T41UI.msg}</p>`:'')+t41Book();T41UI.msg='';N.appendChild(box);t41Modal();
  try{mc34Fit(N,box);}catch(e){}try{guideS&&(guideS().transit41=1);}catch(e){}
  const re=()=>setTimeout(()=>empOpen('transit'),0);
  box.querySelectorAll('[data-t41]').forEach(b=>b.onclick=()=>{const op=b.dataset.t41,p=t41Price(op);
    if(S.coins<p){SFX.deny&&SFX.deny();T41UI.msg=`That’s ${p} coins. You have ${S.coins}.`;re();return;}S.coins-=p;SFX.coin&&SFX.coin();updateHud&&updateHud();t41Do(op,{id:b.dataset.id});
    const msg={bus:'Hollis tows the old bus out of the county shed and gets it going on the third try. The first stop goes up at your gate.',stop:`The stop goes up by ${(T41_STOP_BY[b.dataset.id]||{}).name}. The bus will call there from the morning.`,
      bus2:'Three more buses out of the county shed, as tired as the first three. Half the wait now.',valley:'The rail goes down along Mill Road overnight; nobody saw the gang that laid it. The engine is at the Crossroads with steam up.',
      south:'The South line runs on down Mill Road, past the Deep Corn and out to the Low Fields.',dining:'A dining car, with a stove that smells of coffee and coal.'}[op];T41UI.msg=msg;re();});
  box.querySelectorAll('[data-t41fare]').forEach(b=>b.onclick=()=>{t41Do('fare',{v:(TR41().fare|0)+(+b.dataset.t41fare)});re();});};}
{const css=document.createElement('style');css.textContent=`#noteText .t41dia{margin:4px 0 8px;padding:6px 8px 4px;background:#efe4c6;box-shadow:inset 0 0 0 1px #8a6a42}
#noteText .t41ln{margin:2px 0 6px}#noteText .t41lab{font-size:11px;letter-spacing:.06em;color:#5a3a1e;margin-bottom:2px}
#noteText .t41track{position:relative;height:32px;margin:23px 22px 0}#noteText .t41rule{position:absolute;left:0;right:0;top:6px;height:3px;background:#b8a27a}
#noteText .bus .t41rule{background:repeating-linear-gradient(90deg,#3f6246 0 7px,transparent 7px 10px)}#noteText .rail .t41rule{background:#2a1a10;box-shadow:0 2px 0 -1px #2a1a10,0 -2px 0 -1px #2a1a10}
#noteText .t41st{position:absolute;top:0;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;width:56px}
#noteText .t41st i{display:block;width:9px;height:9px;border-radius:50%;background:#efe4c6;box-shadow:0 0 0 2px #6a5a40}#noteText .rail .t41st i{border-radius:1px}
#noteText .t41st.on i{background:#3f6246;box-shadow:0 0 0 2px #1d2e24}#noteText .rail .t41st.on i{background:#2a1a10;box-shadow:0 0 0 2px #120a04}
#noteText .t41st.here i{box-shadow:0 0 0 2px #1d2e24,0 0 0 5px #d8a038}#noteText .t41st b{font-size:10px;line-height:1.05;text-align:center;font-weight:normal;margin-top:3px;color:#3a2210}#noteText .t41st:not(.on) b{opacity:.55}
#noteText .t41veh{position:absolute;top:-24px;z-index:1;transform:translateX(-50%);width:16px;height:16px;image-rendering:pixelated;filter:drop-shadow(0 1px 0 #2a1a10)}\n#noteText .t41st em{position:absolute;bottom:100%;margin-bottom:3px;font-style:normal;font-size:9px;letter-spacing:.04em;white-space:nowrap;color:#a0501c;text-transform:uppercase}\n#noteText .t41svc{font-size:12px;margin:2px 0 6px}#noteText .t41dest{display:grid;grid-template-columns:1fr 1fr;gap:5px 8px}\n#noteText .t41go{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font:inherit;font-size:13px;padding:5px 8px;background:#3a2210;color:#f4e6c8;border:0;cursor:pointer;box-shadow:inset 0 0 0 1px #120a04,inset 0 2px 0 #5a3a1e;text-align:left}\n#noteText .t41go .t{font-size:11px;opacity:.8;white-space:nowrap}#noteText .t41go.slow{background:#5a4430}#noteText .t41go.off{opacity:.5;cursor:default}
#noteText .t41map{display:block;width:100%;max-height:220px;object-fit:contain;margin:4px 0;image-rendering:pixelated;box-shadow:inset 0 0 0 1px #6a4a2a}
#saleSlip .t41seen{font-size:12px;opacity:.85;margin:4px 0 0 34px}#saleSlip .srow.t41 .sv{white-space:nowrap}#saleSlip .srow.t41{grid-template-columns:42px 1fr 20px 92px;min-height:40px;align-items:center}#saleSlip .srow.t41 img{width:36px;height:36px;image-rendering:pixelated}#noteText .t41msg{margin:6px 0 2px;padding:5px 8px;background:#efe3c4;border:1px solid #b89a68;border-radius:3px;font-size:12px;color:#3a2a18}#noteText .t41go{position:relative;flex-wrap:wrap}#noteText .t41go .t41slow{flex-basis:100%;text-align:right}#noteText .t41go .t41slow{display:block;margin-top:2px;font-size:10px;font-weight:bold;color:#f0d890;letter-spacing:.03em}#noteText .t41st.here{z-index:2}body.t41m #objective{visibility:hidden}body.t41m #noteText{-webkit-mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 30px),rgba(0,0,0,.66) calc(100% - 30px),rgba(0,0,0,.66) calc(100% - 20px),rgba(0,0,0,.33) calc(100% - 20px),rgba(0,0,0,.33) calc(100% - 10px),transparent calc(100% - 10px));mask-image:linear-gradient(to bottom,#000 0,#000 calc(100% - 30px),rgba(0,0,0,.66) calc(100% - 30px),rgba(0,0,0,.66) calc(100% - 20px),rgba(0,0,0,.33) calc(100% - 20px),rgba(0,0,0,.33) calc(100% - 10px),transparent calc(100% - 10px))}#noteText .t41st.here em{bottom:auto;top:100%;margin:2px 0 0;padding:0 3px;background:#d8a038;color:#2a1608;border-radius:2px;font-weight:bold}#saleSlip .srow.t41{opacity:1;animation:none}
#noteText .t41log{display:flex;gap:14px;font-size:13px;padding:2px 0;border-bottom:1px dashed rgba(90,60,30,.3)}#noteText .t41log span:first-child{width:56px}#noteText .t41log span:nth-child(2){flex:1}`;document.head.appendChild(css);}
// the Town Hall's land office keeps the county's transit papers too
{const _r=vendors.land.rows;vendors.land.rows=()=>{const rows=_r();if(!t41Open())return rows;const T=S.emp&&S.emp.tr;
  rows.splice(1,0,{k:'transit41',name:'County transit',desc:T&&(T.bus||T.valley)?'The county line’s papers: your bus, your stops, your rail, and yesterday’s takings.':'The county’s bus and rail franchise is up for whoever will run it. The papers are in the farm book.',price:0,can:true,btn:'Open',buy(){setTimeout(()=>empOpen('transit'),50);}});return rows;};}
// ---- at a stop or a station: the timetable, where it goes, and when you'd get there
function t41OpenStop(kind,id){if(T41R.on)return;const T=TR41();const here=kind==='bus'?T41_STOP_BY[id]:T41_STA_BY[id];if(!here)return;
  const dests=kind==='bus'?t41StopsBuilt().filter(s=>s.id!==id):t41Stations().filter(s=>s.id!==id);
  const fare=t41RideFare();let h=`<h3>${kind==='bus'?'Bus stop':'Station'} · ${here.name}</h3>`;
  h+=t41Diagram(kind+':'+id);
  if(S.hour<T41_SERVICE[0]||S.hour>=T41_SERVICE[1]-.05)h+=`<p>${kind==='bus'?'The last bus went in at 9 pm. The first one comes at 6 am.':'The engine is cold at the Crossroads. The first train is at 6 am.'} ${isNight()?'Whatever stops here before then, don’t get on it.':''}</p>`;
  else{h+=`<p class="t41svc">${kind==='bus'?'MARROW CO. LINES':'MARROW VALLEY LINE'} · every day, 6 am to 9 pm · ${fare?`fare <b>${fare}</b>, paid to ${T.by}`:'you ride free'}</p><div class="t41dest">`;
    const herePt=kind==='bus'?here.at:[(here.plat.x0+here.plat.x1)/2,(here.plat.z0+here.plat.z1)/2];
    for(const d of dests){const tr=t41Trip(kind,id,d.id);const there=kind==='bus'?d.at:[(d.plat.x0+d.plat.x1)/2,(d.plat.z0+d.plat.z1)/2];
      const walk=Math.hypot(there[0]-herePt[0],there[1]-herePt[1])*1.3/168;
      if(!tr){h+=`<button class="t41go off" disabled><span class="n">${d.name}</span><span class="t">no more today</span></button>`;continue;}
      const mins=Math.max(1,Math.round((tr.arr-S.hour)*60)),slow=(tr.arr-S.hour)>walk;
      h+=`<button class="t41go${slow?' slow':''}" data-k="${d.id}"><span class="n">${d.name}</span><span class="t">${mins<60?mins+' min':Math.floor(mins/60)+' h'+(mins%60?' '+(mins%60)+' min':'')} · ${t41TimeStr(tr.arr)}</span>${slow?'<span class="t41slow">walk it, it’s quicker</span>':''}</button>`;}
    h+='</div>';}
  openNote(h,'Not now',()=>{});t41Modal();
  document.querySelectorAll('#noteText .t41go[data-k]').forEach(b=>b.addEventListener('click',()=>{t41Ride(kind,id,b.dataset.k);},{once:true}));}
for(const st of T41_STOPS){const id=st.id;const fp=t41StopFront(st);interact.push({x:fp[0],z:fp[1],r:1.7,on:()=>!S.room&&!T41R.on&&!!(S.emp&&S.emp.tr&&S.emp.tr.bus&&S.emp.tr.stops&&S.emp.tr.stops[id]),
  label:()=>`Bus stop · ${st.name}`,ok:()=>true,act(){t41OpenStop('bus',id);}});}
for(const st of T41_STATIONS){const id=st.id,p=st.plat;const half=Math.max(p.x1-p.x0,p.z1-p.z0)/2;
  interact.push({x:(p.x0+p.x1)/2,z:(p.z0+p.z1)/2+(p.vert?0:.4),r:half+.6,on:()=>!S.room&&!T41R.on&&t41Stations().includes(st),label:()=>`Station · ${st.name}`,ok:()=>true,act(){t41OpenStop('train',id);}});}
// ---- the world map: the rail in black with its ties, the bus stops as green discs, the stations as black squares
{const _mp=mapPaint;mapPaint=function(){const c=_mp.apply(this,arguments);try{t41MapPaint(c);}catch(e){console.warn('t41 map',e);}return c;};}
function t41MapPaint(c){const T=S.emp&&S.emp.tr;if(!T||!(T.bus||T.valley))return;t41Build();const g=c.getContext('2d'),s=MAPX.s,pad=MAPX.pad,X=x=>pad+(x-B.x0)*s,Y=z=>pad+(z-B.z0)*s;g.save();
  if(T.valley){const RP=t41RailPaths();for(const P of T.south?[RP.V,RP.S]:[RP.V]){g.strokeStyle='#1a120c';g.lineWidth=2.4;g.beginPath();P.forEach((p,i)=>i?g.lineTo(X(p.x),Y(p.z)):g.moveTo(X(p.x),Y(p.z)));g.stroke();
    g.lineWidth=1.2;for(let i=0;i<P.length;i+=14){const p=P[i];g.beginPath();g.moveTo(X(p.x)-p.dz*3.4,Y(p.z)+p.dx*3.4);g.lineTo(X(p.x)+p.dz*3.4,Y(p.z)-p.dx*3.4);g.stroke();}}
    for(const st of t41Stations()){const p=st.plat,x=X((p.x0+p.x1)/2),y=Y((p.z0+p.z1)/2);g.fillStyle='#1a120c';g.fillRect(x-5,y-5,10,10);g.fillStyle='#f0e4c4';g.fillRect(x-2,y-2,4,4);}}
  for(const st of t41StopsBuilt()){const x=X(st.at[0]),y=Y(st.at[1]);g.fillStyle='#f0e4c4';g.beginPath();g.arc(x,y,5.2,0,7);g.fill();g.fillStyle='#2b4434';g.beginPath();g.arc(x,y,3.8,0,7);g.fill();}
  g.restore();}
// ---- Caitlyn's side lessons: when the county line opens, and the first ride
if(typeof LS_SIDE!=='undefined')LS_SIDE.push(
  {id:'transit41',title:'The county line',when:()=>t41Open()&&!(S.emp&&S.emp.tr&&S.emp.tr.bus)&&S.hour>=8&&S.hour<18,
   say:'The county’s been trying to give away the bus franchise since the last driver went into the reservoir. Nobody wants it. You could have it: open the farm book (Grandpa’s desk, or the land office) to the Transit page. Buy the old bus, put up stops, and it’ll carry the whole valley about. They pay fares. You ride free.',
   begin:b=>{b.day=S.day;},ok:()=>!!(S.emp&&S.emp.tr&&S.emp.tr.bus),coins:25,done:'The county bus, running again. Hollis says it’ll last the winter. He said that last winter too.'},
  {id:'transit41b',title:'Ride it',when:()=>!!(S.emp&&S.emp.tr&&S.emp.tr.bus&&Object.keys(S.emp.tr.stops||{}).length>=2)&&S.hour>=7&&S.hour<19,
   say:'Stand at any stop and open it: pick where you’re going and wait for the bus. It costs you nothing and saves your legs. Once the bus runs to four stops, the county will let you lay rail.',
   begin:b=>{b.day=S.day;},ok:()=>{try{return !!guideS().rode41;}catch(e){return false;}},coins:20,done:'See? Half an hour to the Low Fields. My mother walked it every day of her life.'});
// ---- what the town says about it, once it runs
const T41_SAY={generic:['Rode your bus to the Deep Corn. The driver wouldn’t take my coins past the maze. Said nobody pays out there.','The bus was on time today. Nothing in this valley is on time. I didn’t like it.',
  'Somebody waves from the back seat of your bus every evening. It’s always empty when it pulls in.','Cheaper than shoe leather, your bus. And you don’t have to walk past the reservoir.'],
  train:['The train whistles at the Crossroads after dark. There’s no train after dark. You know that.','I took the train to Wickham and back for the ride. First time I’ve left town in eleven years. Felt like getting away with something.'],
  hollis:['That bus is older than I am. I keep it running out of spite. Don’t let anyone else touch the carburettor.'],agnes:['I took the bus out the west road. It stopped where there’s no stop and the door opened on its own. I didn’t get off.'],
  mae:['You built a bus line. Half the town comes into the store to tell me they rode it. The other half comes in to say they won’t.'],dunn:['The sheriff’s office rides free. That isn’t a request.'],
  hale:['The bus passes the church at noon and at six. People cross themselves when it does. I haven’t asked them why.'],june:['I put the mail on the bus now. It gets there faster. Some days it gets there before I’ve written it.'],
  otto:['Nils would have liked a train. He liked anything that went somewhere.']};
{const _t=talk;talk=function(n){const r=_t.apply(this,arguments);try{const T=S.emp&&S.emp.tr;if(!T||!(T.bus||T.valley)||!n||!n.def||(typeof SCENE!=='undefined'&&SCENE)||talkingTo!==n||$('talk').hidden)return r;
    S.t41say=S.t41say||{};const key=n.def.id+':'+Math.floor(S.day/4);if(S.t41say[key])return r;if(t41Hash(S.day,n.def.id.length+S.hour)>.22)return r;S.t41say[key]=1;
    const pool=(T41_SAY[n.def.id]||[]).concat(T41_SAY.generic,T.valley?T41_SAY.train:[]);const line=pool[Math.floor(t41Hash(S.day*7,n.def.id.length)*pool.length)];
    if(line&&$('talkLine'))$('talkLine').innerHTML=`<q>${line}</q>`;}catch(e){}return r;};}
// the dev hook the tests use
if(typeof window!=='undefined')window.__t41={TR41,t41Build,t41Fleet,t41Trip,t41Ride,t41OpenStop,t41Do,t41Dawn,T41C,T41R,T41_STOPS,T41_STATIONS};
// ---- after dark: the lit windows drawn into the light itself (so they glow over the night instead of going brown), lamps
// forward, the firebox under the engine's cab
{const _ll=lifeLight;lifeLight=function(t,L){_ll.apply(this,arguments);if(L<.15)return;try{lctx.save();lctx.globalCompositeOperation='lighter';
  for(const c of t41Cars()){if(!onScreen(c.x,c.z,320))continue;const X=Math.round(sx(c.x)),Y=Math.round(sz(c.z));const m=SPR[c.key];if(!m||!m.lights)continue;
    for(const q of m.lights){if(q.t==='win'){const [rx,ry,w,h]=q.r;if(!c.lit)continue;lctx.fillStyle=`rgba(255,196,120,${.7*L})`;lctx.fillRect(X+rx,Y+ry,w,h);glowAt(X+rx+w/2,Y+ry+h/2,w*.8+6,[255,180,100],.22*L);}
      else if(q.t==='lamp'){if(q.r){glowAt(X+q.x,Y+q.y,q.r*2.6,q.c,.95*L);glowAt(X+q.x,Y+q.y,q.r*.9,[255,250,230],.9*L);}}
      else if(q.t==='cone'){lctx.fillStyle=q.k?`rgba(255,238,190,${.85*L})`:`rgba(255,214,150,${.42*L})`;lctx.beginPath();q.pts.forEach((p,i)=>i?lctx.lineTo(X+p[0],Y+p[1]):lctx.moveTo(X+p[0],Y+p[1]));lctx.closePath();lctx.fill();}
      else if(q.t==='pool'){const g=lctx.createRadialGradient(X+q.x,Y+q.y,2,X+q.x,Y+q.y,Math.max(q.rx,q.ry));g.addColorStop(0,`rgba(255,226,160,${.8*L})`);g.addColorStop(.5,`rgba(255,210,140,${.36*L})`);g.addColorStop(1,'rgba(255,200,120,0)');
        lctx.save();lctx.translate(X+q.x,Y+q.y);lctx.scale(q.rx/Math.max(q.rx,q.ry),q.ry/Math.max(q.rx,q.ry));lctx.translate(-(X+q.x),-(Y+q.y));lctx.fillStyle=g;lctx.beginPath();lctx.arc(X+q.x,Y+q.y,Math.max(q.rx,q.ry),0,Math.PI*2);lctx.fill();lctx.restore();}}}
  lctx.restore();}catch(e){try{lctx.restore();}catch(_){}}};}
// ---- the Transit page and the stop page hold the town's messages while they're open (they wait, then play in order once
// the page shuts), and clear one already showing when they open: nothing lands on the book's tabs or the stop's title.
const T41UI={msg:'',q:[]};
function t41Modal(){const n=$('note');if(!n)return;n.dataset.modal='t41';document.body.classList.add('t41m');try{if(typeof PL37!=='undefined'&&!PL37.modal.includes('note'))PL37.modal.push('note');}catch(e){}
  try{ui.toast.classList.remove('show');toastT=0;}catch(e){}}
function t41Held(){const n=$('note');return !!(n&&!n.hidden&&n.dataset.modal==='t41');}
{const _t=toast;toast=function(msg,dur,red){if(t41Held()){if(!T41UI.q.some(q=>q[0]===msg))T41UI.q.push([msg,dur,red]);if(T41UI.q.length>5)T41UI.q.shift();return;}return _t.apply(this,arguments);};
  setInterval(()=>{const n=$('note');if(n&&n.hidden&&n.dataset.modal==='t41'){delete n.dataset.modal;document.body.classList.remove('t41m');}if(!T41UI.q.length||t41Held())return;if(typeof toastT!=='undefined'&&toastT>.35)return;const q=T41UI.q.shift();_t(q[0],q[1],q[2]);},350);}
// ---- nobody stands inside a bus or a train: if one comes through where you are, you're put beside it
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.room||T41R.on)return;try{for(const c of t41Cars()){const side=c.v==='E'||c.v==='W';const hx=(side?c.len:c.wid)/2,hz=(side?c.wid:c.len)/2;
      const dx=P.x-c.x,dz=P.z-c.cz;if(Math.abs(dx)>=hx+.2||Math.abs(dz)>=hz+.2)continue;const px=hx+.2-Math.abs(dx),pz=hz+.2-Math.abs(dz);
      if(px<pz)P.x=c.x+Math.sign(dx||1)*(hx+.21);else P.z=c.cz+Math.sign(dz||1)*(hz+.21);}}catch(e){}};}
