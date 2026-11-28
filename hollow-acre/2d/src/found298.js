/* ================= #298 the things you find look like their close-ups. The Count's finds all lay in the world as six stock
   icons (one brown shoe, one grey-blue cap, one horse on wheels...), while each close-up shows that child's own thing: a white
   sneaker, a black button boot, a pink jelly sandal, a blue bonnet hung on a corn leaf, a knitted cap with a bobble on a porch
   rail. Each find now has its own small sprite drawn from its close-up (the same shape, colours, count and facing, at the world's
   scale, outlined and lit from the top left), and lies where the close-up shows it: on the step, on the wall, on the rail, in the
   water under the falls. The close-ups themselves are unchanged. ================= */
const F98={};
// a canvas sprite the world draws like any other: (x,y) in fn is the thing's middle; the ground point is (ax,ay)
function f98Spr(id,w,h,ax,ay,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const P=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),ww||1,hh||1);};try{fn(P,g);}catch(e){}
  const src='f98:'+id;IMG[src]=c;SPR['f98_'+id]={src,fw:w,fh:h,ax,ay,foot:[0,0,0,0]};return 'f98_'+id;}
// a flat drop shadow, pushed down and right (the game's shadow colour)
const f98Sh=(P,x,y,rx,ry)=>{for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(j/(ry+.6))**2)));if(w>0)P(x-w,y+j,2*w,1,'rgba(50,33,37,.6)');}};
const f98Ramp=c=>['#0e0806',sgtShade(c,.6),c,sgtShade(c,1.3)];
// ---- shoes (toe to the left, as in every close-up)
function f98Sneaker(P,x,y,o){const c=o.c||'#d0d0c8',c2=o.c2||'#c83a2a';f98Sh(P,x+1,y+5,11,2);
  sgtBlob(P,[[x-9,y+3,x+8,y+3,1.8]],['#1a1a1a','#9a9a94','#d8d8d0','#f4f4ee']);   // the sole, full length
  sgtBlob(P,[[x-8,y,x+6,y-.6,3.2],[x+4,y-2,x+7,y-4,2.8]],f98Ramp(c));   // the upper, rising to the collar at the heel
  sgtBlob(P,[[x-9,y+1.3,x-6.5,y+.8,2]],['#1a1a1a','#b8b8b0','#e8e8e0','#ffffff']);   // the white toe cap
  for(let i=0;i<3;i++){P(x-3+i*2,y-3-Math.round(i*.6),2,1,c2);P(x-2+i*2,y-2-Math.round(i*.6),1,1,'#ffffff');}   // the laces
  for(let i=0;i<9;i++)P(x-4+i,y+1-Math.round(Math.sin(i/8*3.1)*2),1,1,c2);   // the stripe down the side
  P(x+4,y-6,3,2,'#140c0a');}
function f98Boot(P,x,y){const R=['#060508','#1a1820','#2a2834','#5a5a6c'];f98Sh(P,x,y+4,9,2);
  sgtBlob(P,[[x-8,y+.5,x+3.5,y+.5,2.9],[x+2.5,y-1,x+3.6,y-10,2.9]],R);   // the foot, toe left, and the tall shaft at the heel
  P(x-10,y+3,15,1,'#0a0a0a');P(x+1,y+3,5,2,'#0a0a0a');   // the sole and the heel
  for(let i=0;i<4;i++){P(x+1,y-10+i*2.6,1,1,'#c8c8d0');P(x+4,y-10+i*2.6,2,1,'#6a5a4a');}   // the buttons up the front, the hooks behind
  P(x+1,y-13,5,1,'#0a0a0e');}
function f98Mary(P,x,y,o){const c=o.c||'#4a3424',R=f98Ramp(c),s=.9,X=v=>Math.round(x+v*s),Y=v=>Math.round(y+v*s);f98Sh(P,x+1,y+5,11,2);
  P(X(-13),Y(5),X(12)-X(-13),2,'#140c08');P(X(6),Y(5),X(12)-X(6),3,'#0e0806');   // the sole and the heel
  sgtBlob(P,[[X(-12),Y(2),X(3),Y(1.5),4.6*s],[X(3),Y(0),X(9),Y(-1),4.4*s]],R);
  sgtBlob(P,[[X(3),Y(-3),X(8),Y(-3.5),2.2*s]],[sgtShade(c,1.45),'#0a0604','#140c08','#2e1c10']);P(X(3),Y(-1.5),X(8)-X(3),1,sgtShade(c,.75));   // the opening at the heel
  for(let i=0;i<5;i++)P(X(-11)+i,Y(-2)+Math.round(Math.abs(i-2)*.5),1,1,sgtShade(c,1.5));   // the lit toe
  if(o.rim)for(let i=X(-10);i<X(2);i++)P(i,Y(-1.4)-(i<X(-6)?0:1),1,1,sgtShade(c,1.75));   // a lit rim along the top, where it sits on brown boards
  if(o.st==='mary'){for(let j=0;j<6;j++)P(X(1)-Math.round(j*.4),Y(-4)+j,1,1,R[0]);P(X(-2)-1,Y(2.5)-1,2,2,'#a8a8b0');P(X(-2)-1,Y(2.5)-1,1,1,'#ffffff');}   // the strap and its buckle
  else for(let i=0;i<3;i++)P(X(-4)+i*2,Y(-3)+i,2,1,'#d8ccb0');   // the laces
  for(let i=0;i<4;i++)P(X(-11)+i*4,Y(4.5),1,1,sgtShade(c,.55));   // the welt stitches
  if(o.wet)for(const [dx,dy] of [[-11,5],[-6,6],[3,6],[8,5]])P(x+dx,y+dy,2,1,'#9aa8b0');}
function f98Jelly(P,x,y){const J='#b04a7a';f98Sh(P,x,y+6,6,2);
  sgtBlob(P,[[x+3.6,y+6.4,x+1.2,y+1.9,3.4],[x+1.2,y+1.9,x-2.4,y-5.4,4.4]],[J,'#d070a0b0','#e88ab0a0','#ffc8e0c0']);   // the clear pink sole, toe up and to the left
  for(const [a1,b1,a2,b2] of [[-6.5,-6,3,-.6],[3,-6.6,-6.5,-.6]])for(let t=0;t<=1;t+=.08){P(Math.round(x+a1+(a2-a1)*t),Math.round(y+b1+(b2-b1)*t),2,1,'#d8609a');P(Math.round(x+a1+(a2-a1)*t),Math.round(y+b1+(b2-b1)*t),1,1,'#f4a8cc');}   // the crossed straps
  for(let i=-4;i<=5;i++)P(x+i,y+3+Math.round(Math.abs(i)*.12),1,1,'#d8609a');P(x+5,y+2,2,3,'#d8d8e0');P(x+6,y+3,1,1,'#7a7a84');P(x-1,y-4,1,1,'#ffffff');P(x+2,y-5,1,1,'#ffffff');}   // the heel strap, its buckle, the glints
// ---- caps and bonnets
function f98Folded(P,x,y,o){const c=o.c||'#6a1a28',F=['#120608',sgtShade(c,.62),c,sgtShade(c,1.35)];
  sgtBlob(P,[[x-7.5,y+1.5,x+7.5,y+1.5,2.8],[x-6,y-1,x+6,y-1,3.4],[x-3.5,y-3.8,x+3.5,y-3.8,2.8]],F);
  for(const k of [-1,0,1])for(let t=0;t<7;t++)P(Math.round(x+k*4*(1-t/7)),y+3-t,1,1,F[1]);   // the folds, running up to the crown
  P(x-1,y-6,2,1,F[3]);P(x,y-6,1,1,'#ffffff');P(x-7,y+3,15,1,sgtShade(c,1.2));P(x-7,y+4,15,1,F[0]);for(let i=0;i<3;i++)P(x-5+i*4,y-1,2,1,sgtShade(c,1.6));}
function f98Knit(P,x,y,o){const c=o.c||'#8a4a5a',R=f98Ramp(c);
  sgtBlob(P,[[x-6.8,y+1.2,x+6.8,y+1.2,3.1],[x-5.4,y-1.9,x+5.4,y-1.9,3.1],[x-3.6,y-4.4,x+3.6,y-4.4,2.5]],R);
  for(let ry=y-5;ry<y+1;ry+=2)for(let rx=x-6;rx<x+6;rx+=3)P(rx+((ry>>1)&1),ry,1,1,R[1]);   // the knit
  for(let rx=x-7;rx<=x+7;rx++)for(let ry=y+2;ry<y+5;ry++)P(rx,ry,1,1,(rx&1)?R[1]:R[2]);P(x-7,y+2,15,1,R[3]);P(x-7,y+5,15,1,R[0]);   // the ribbed band
  sgtBlob(P,[[x,y-8,x,y-8,2.2]],['#120c08','#c8c0b0','#e8e0d0','#ffffff']);}   // the bobble
function f98Flat(P,x,y,o){const c=o.c||'#7a6248',F=['#140e0a',sgtShade(c,.68),c,sgtShade(c,1.18)];
  sgtBlob(P,[[x-5.4,y-1.8,x+5.4,y-2.4,5]],F);   // the crown from above
  for(const [bx,by] of [[x-6,y-4],[x+1,y-5]])for(let i=0;i<4;i++){P(bx+i,by+(i%2),1,1,sgtShade(c,1.25));P(bx+i,by+1-(i%2),1,1,sgtShade(c,.8));}   // the panels' stitched edges
  for(let i=-4;i<=4;i++)P(x+i,y-7+Math.round((i*i)/9),1,1,F[1]);P(x-1,y-7,2,1,F[1]);   // the seam and the button
  for(let px=x-8;px<=x+8;px++){const t=(px-x)/8,d=Math.round(Math.sqrt(Math.max(0,1-t*t))*3.6);if(d<1)continue;P(px,y+2,1,1,'#0a0806');for(let j=1;j<=d;j++)P(px,y+2+j,1,1,j===1?sgtShade(c,1.55):j===d?sgtShade(c,.95):sgtShade(c,1.32));P(px,y+3+d,1,1,'#0a0806');}   // the peak toward you
  for(let i=0;i<9;i++){const wy=y-6+Math.round(Math.sin(i*.7)*.8)-Math.round(i*.2);P(x+2+i,wy,1,1,'#c8d8dc');}P(x+7,y-9,2,1,'#ffffff');}   // the water over its back
function f98Bonnet(P,x,y,o){const c=o.c||'#7e94b0',F=['#1a1418',sgtShade(c,.62),c,sgtShade(c,1.28)],rb=o.rib||sgtShade(c,.82),lin=o.lining||sgtShade(c,1.45);
  sgtBlob(P,[[x+2.8,y-3.3,x+6.6,y-.6,5]],F);   // the crown behind
  for(let i=0;i<9;i++){const h=3+((i>>1)%2);P(x+1+i,y+3,1,h,i%3===0?F[1]:F[2]);P(x+1+i,y+3+h,1,1,F[0]);}   // the frill at the back of the neck
  sgtBlob(P,[[x-2.2,y-3.3,x-2.2,y+3.3,6]],F);   // the brim, round the face
  for(let py=y-7;py<=y+7;py++)for(let px=x-8;px<=x+1;px++){const e=((px-(x-4))/3.9)**2+((py-(y+.3))/6.4)**2;if(e>1)continue;const dd=Math.hypot((px-(x-2.2))/3.4,(py-(y+1))/5);
    P(px,py,1,1,dd<.5?sgtShade(lin,.45):dd<.85?sgtShade(lin,.66):dd<1.15?sgtShade(lin,.84):lin);}   // the lining, darkening to the back
  for(let a=3.4;a<5.5;a+=.12)P(Math.round(x-2.2+Math.cos(a)*5.6),Math.round(y+Math.sin(a)*8.8),1,1,sgtShade(c,1.5));   // the lit brim edge
  return rb;}
function f98BonnetHang(P,x,y,o){const st=['#3a2e10','#6a5a24','#8a7434','#b09a4c'],sx=x+10;
  for(let yy=y-24;yy<y+14;yy++){P(sx,yy,3,1,st[2]);P(sx,yy,1,1,st[3]);P(sx+2,yy,1,1,st[1]);if((yy-y+24)%11===7)P(sx,yy,3,1,st[0]);}P(sx-1,y-25,5,1,st[0]);   // a dry stalk at the edge of the corn
  for(let t=0;t<14;t++){const px=sx-t,py=y-16-Math.round(Math.sin(t/13*2.4)*3)+Math.round((t/13)**2*4);P(px,py,1,2,st[2]);P(px,py,1,1,st[3]);}   // the leaf the ties caught on
  for(let t=0;t<10;t++){const px=sx+3+t,py=y-6-Math.round(Math.sin(t/9*2)*2)+Math.round((t/9)**2*5);P(px,py,1,2,st[2]);P(px,py,1,1,st[3]);}
  f98Sh(P,x,y+13,7,1);
  const rb=o.rib||'#6a7e98',kx=x+1,ky=y-16;for(const [sx2,sy2] of [[x-6,y+5],[x+2,y+5]])for(let t=0;t<=1;t+=.05){const px=Math.round(sx2+(kx-sx2)*t+Math.sin(t*3.1)*(sx2<x?-2:2)),py=Math.round(sy2+(ky-sy2)*t);P(px,py,2,1,rb);P(px,py,1,1,sgtShade(rb,1.3));}   // its ties, up to the knot
  P(kx-2,ky-1,4,2,rb);P(kx-3,ky-2,2,2,sgtShade(rb,.8));P(kx+2,ky-2,2,2,sgtShade(rb,.8));P(kx,ky,1,1,sgtShade(rb,.55));
  f98Bonnet(P,x,y,o);}
function f98BonnetLie(P,x,y,o){const rb=o.rib||'#c86a8a';f98Sh(P,x+1,y+8,11,2);
  for(const [sx,sy,d] of [[x-6,y+6,-1],[x+1,y+7,1]])for(let t=0;t<13;t++){const px=sx+d*Math.round(t*.9),py=sy+Math.round(t*.3+Math.sin(t*.5));P(px,py,2,1,rb);P(px,py,1,1,sgtShade(rb,1.35));}   // the ribbons, spread on the grass
  const kx=x+13,ky=y+11;P(kx-2,ky-1,4,2,rb);P(kx-4,ky-2,2,3,sgtShade(rb,.8));P(kx+2,ky-2,2,3,sgtShade(rb,.8));P(kx,ky,1,1,sgtShade(rb,.55));   // the bow
  f98Bonnet(P,x,y,o);}
function f98Rag(P,x,y,o){const c=o.c||'#7a6a50',F=['#0c0806',sgtShade(c,.66),sgtShade(c,1.08),sgtShade(c,1.42)],L=['#3a2c0c','#e0c870'];f98Sh(P,x+1,y+6,11,2);
  for(const [rx,ry] of [[10.6,5.2]])for(let a=0;a<6.283;a+=.05){const px=Math.round(x+Math.cos(a)*rx),py=Math.round(y+1+Math.sin(a)*ry);if(Math.sin(a)<-.2&&Math.abs(px-x)<7)continue;P(px,py,1,1,'#1a1206');}   // the rope's dark edge on the ground
  sgtBlob(P,[[x-1.6,y,x+1.6,y+.5,7.4]],F);   // the soft cap from above
  for(let t=0;t<12;t++){const px=x-5+t,py=y-2+Math.round(Math.sin(t*.5)*1.6);P(px,py,1,1,F[0]);P(px,py-1,1,1,F[3]);}   // its seam
  P(x-6,y+1,4,3,'#5a4a3a');P(x-6,y+1,4,1,'#8a7a5e');P(x-6,y+4,1,1,'#e8dcc0');P(x-4,y+4,1,1,'#e8dcc0');for(let t=0;t<6;t+=2)P(x+1,y+1+t,1,1,'#e8dcc0');   // the patch and the stitches
  for(const [rx,ry,ph] of [[9.4,4.1,0],[10.2,4.7,1]])for(let a=0;a<6.283;a+=.07){const px=Math.round(x+Math.cos(a)*rx),py=Math.round(y+1+Math.sin(a)*ry);if(Math.sin(a)<-.2&&Math.abs(px-x)<7)continue;P(px,py,1,1,L[(Math.round(a*7)+ph)%2]);}   // the grass rope round it
  for(let j=0;j<6;j++)P(x+9+(j%2),y+4+j,1,1,L[j%2]);}
function f98Sunhat(P,x,y){const S=['#3a2a10','#9a7a3a','#c8a456','#e8cc80'];f98Sh(P,x+1,y+6,13,2);
  for(let a=0;a<6.283;a+=.03)for(let r=7;r<14;r++){const px=Math.round(x+Math.cos(a)*r),py=Math.round(y+2+Math.sin(a)*r*.42);P(px,py,1,1,r>12?S[0]:((r+Math.round(a*8))%3===0?S[1]:Math.sin(a)<-.2?S[3]:S[2]));}   // the woven brim
  sgtBlob(P,[[x-4.6,y-.6,x+4.6,y-.6,4.2]],S);P(x-8,y+2,17,1,'#3a5a9a');P(x-8,y+1,17,1,'#5a7aba');}   // the crown and its blue band
// ---- the setting a few of them need in the picture as in the world
function f98Rocks(P,x,y){for(const [rx,ry,r] of [[x-10,y-1,3.8],[x+10,y-2,3.4]])sgtBlob(P,[[rx,ry-1,rx+.5,ry+1,r]],['#121418','#3a3c42','#54565c','#7a7c84']);P(x-12,y-4,2,1,'#e8f0f4');P(x+8,y-5,2,1,'#e8f0f4');   // wet rocks either side
  for(const [fx,fy] of [[x-6,y+7],[x+5,y+7],[x,y+8]]){P(fx-1,fy,3,1,'#c8d8dc');P(fx,fy-1,1,1,'#ffffff');}}   // foam where the water runs past
// ---- each find: how it is drawn, and how high it sits above its ground point (on a rail, a wall, a step)
const F98_FIND={
  oak:{w:30,h:20,y:12,d:(P,x,y)=>f98Sneaker(P,x,y,{c:'#d0d0c8',c2:'#2a4a9a'})},
  motel:{w:30,h:20,y:12,d:(P,x,y)=>f98Sneaker(P,x,y,{c:'#3a5a9a',c2:'#e8e8e0'})},
  graveyard:{w:24,h:22,y:15,lift:22,d:(P,x,y)=>f98Boot(P,x,y)},
  lane:{w:30,h:20,y:12,d:(P,x,y)=>f98Mary(P,x,y,{st:'mary',c:'#7a4426',rim:1})},
  dam:{w:30,h:20,y:12,d:(P,x,y)=>f98Mary(P,x,y,{st:'mary',c:'#8a2a2a',wet:1})},
  clearing:{w:30,h:20,y:12,d:(P,x,y)=>f98Mary(P,x,y,{st:'small',c:'#4a3424'})},
  lake:{w:22,h:24,y:12,d:(P,x,y)=>f98Jelly(P,x,y)},
  corn:{w:34,h:46,y:28,gy:41,d:(P,x,y)=>f98BonnetHang(P,x,y,{c:'#7e94b0',rib:'#6a7e98'})},
  church:{w:28,h:20,y:11,d:(P,x,y)=>{f98Sh(P,x+1,y+5,9,2);f98Folded(P,x,y,{c:'#6a1a28'});}},
  falls:{w:34,h:24,y:12,d:(P,x,y)=>{f98Rocks(P,x,y);f98Flat(P,x,y,{c:'#7a6248'});}},
  marsh:{w:22,h:20,y:13,lift:15,d:(P,x,y)=>f98Knit(P,x,y,{c:'#8a4a5a'})},
  wkchapel:{w:36,h:28,y:13,d:(P,x,y)=>f98BonnetLie(P,x,y,{c:'#dcd8cc',rib:'#c86a8a',lining:'#f4eee0'})},
  fen:{w:28,h:22,y:10,d:(P,x,y)=>f98Rag(P,x,y,{c:'#7a6a50'})},
  ridge:{w:32,h:20,y:9,d:(P,x,y)=>f98Sunhat(P,x,y)},
};
// make every sprite once (the ground point is under the middle, at the bottom of what it lies on)
function f98Make(){for(const id in F98_FIND){if(F98[id])continue;const d=F98_FIND[id],cx=d.w>>1,cy=d.y,gy=(d.gy||cy+5)+(d.lift||0);
  F98[id]=f98Spr(id,d.w,d.h+(d.lift?0:0),cx,gy,(P)=>d.d(P,cx,cy));}}
// ---- where each lies: the close-up's setting, found in the world (a function returning {x,z} or null to keep rgcSpot's)
const F98_AT={
  motel:()=>f98OnGround('motel',(x,z)=>LAYERS.stone(x,z)||LAYERS.walk(x,z),8),   // the motel's walk
  ridge:()=>f98OnGround('ridge',(x,z)=>LAYERS.dirt(x,z),14),   // the ridge path, on its dirt
  lane:()=>{const s=OBJ.find(o=>o.spr==='shop_carp'&&!o.room);return s?{x:s.x+.42,z:s.z+.32}:null;},
  corn:()=>{const c=RGC.find(c=>c.id==='corn');return {x:CORN.x0-.5,z:c.z};},
  lake:()=>{const c=RGC.find(c=>c.id==='lake');let best=null,bd=1e9;for(let r=0;r<12;r+=.25)for(let a=0;a<32;a++){const X=c.x+Math.cos(a/32*6.283)*r,Z=c.z+Math.sin(a/32*6.283)*r;
      if(LAYERS.water(X,Z)||!(LAYERS.water(X-.4,Z)||LAYERS.water(X,Z-.4)||LAYERS.water(X+.4,Z)))continue;if(f98Hidden(X,Z,'lake'))continue;if(r<bd){bd=r;best={x:X,z:Z};}}return best;},
  falls:()=>{const c=RGC.find(c=>c.id==='falls');let best=null,bd=1e9;for(let r=.5;r<7;r+=.25)for(let a=0;a<24;a++){const X=c.x+Math.cos(a/24*6.283)*r,Z=c.z+Math.sin(a/24*6.283)*r;
      if(!LAYERS.water(X,Z)||LAYERS.water(X,Z+.55))continue;if(r<bd){bd=r;best={x:X,z:Z};}}return best;},
  graveyard:()=>{let best=null,bd=1e9;for(const w of OBJ){if(!/^stonewall/.test(w.spr||'')||w.room||Math.abs(w.z-GYARD.z0)>.6)continue;for(let k=.35;k<1.9;k+=.15){const X=w.x+k,Z=w.z+.02;if(f98Hidden(X,Z,'graveyard',24))continue;const d=Math.abs(X-62.4);if(d<bd){bd=d;best={x:X,z:Z};}}}return best;},
  marsh:()=>{const f=OBJ.filter(o=>o.spr==='fence_h'&&Math.abs(o.z-(NEWHOUSES.marsh.z+5.1))<1.2&&Math.abs(o.x-NEWHOUSES.marsh.x)<6).sort((a,b)=>Math.abs(a.x+1.1-NEWHOUSES.marsh.x-2)-Math.abs(b.x+1.1-NEWHOUSES.marsh.x-2))[0];return f?{x:f.x+1.2,z:f.z+.02}:null;},
};
// a spot is clear when nothing standing in front of it (a tree crown, a bush, a lamp) is drawn over it
// the nearest clear spot on a given kind of ground (well inside it), or null
function f98OnGround(id,test,maxR){const c=RGC.find(c=>c.id===id);if(!c)return null;const ok=(X,Z)=>test(X,Z)&&test(X+.35,Z)&&test(X-.35,Z)&&test(X,Z+.35)&&test(X,Z-.35)&&!LAYERS.water(X,Z);
  for(let r=0;r<(maxR||8);r+=.25)for(let a=0;a<32;a++){const X=c.x+Math.cos(a/32*6.283)*r,Z=c.z+Math.sin(a/32*6.283)*r;if(!ok(X,Z)||f98Hidden(X,Z,id))continue;
    const A=cgNear(X,Z,.6);if(A.c.some(q=>Math.hypot(q.x-X,q.z-Z)<q.r+.45)||A.r.some(q=>X>q.x0-.45&&X<q.x1+.45&&Z>q.z0-.45&&Z<q.z1+.45)||A.s.some(q=>segDist(X,Z,q.x1,q.z1,q.x2,q.z2)<(q.r||.15)+.4))continue;return {x:X,z:Z};}return null;}
function f98Hidden(x,z,id,lift){const X=x*PPM,Z=z*PPM-(lift||0),fx0=X-13,fx1=X+13,fy0=Z-17,fy1=Z+6;for(const o of OBJ){if(o.room||o.hide||o.kind==='flat'||o.kind==='deco'||o===RGC_OBJ[id])continue;if(Math.abs(o.x-x)>5||o.z<=z+.02||o.z-z>7)continue;
    const m=SPR[o.spr];if(!m||/^(tgrass|tgold|weeds|grass|flower|leaf|f98_)/.test(o.spr))continue;const ox=o.x*PPM-m.ax+1,oy=o.z*PPM-m.ay+1,ox1=ox+m.fw-2,oy1=oy+m.fh-2;
    const ix=Math.min(fx1,ox1)-Math.max(fx0,ox),iy=Math.min(fy1,oy1)-Math.max(fy0,oy);if(ix>0&&iy>0&&ix*iy>12)return o;}return null;}
function f98Clear(x,z,id){if(!f98Hidden(x,z,id))return {x,z};for(let r=.5;r<6;r+=.5)for(let a=0;a<16;a++){const X=x+Math.cos(a/16*6.283)*r,Z=z+Math.sin(a/16*6.283)*r;
    if(LAYERS.water(X,Z)||f98Hidden(X,Z,id))continue;const A=cgNear(X,Z,.6);if(A.c.some(c=>Math.hypot(c.x-X,c.z-Z)<c.r+.45)||A.r.some(q=>X>q.x0-.45&&X<q.x1+.45&&Z>q.z0-.45&&Z<q.z1+.45)||A.s.some(s=>segDist(X,Z,s.x1,s.z1,s.x2,s.z2)<(s.r||.15)+.4))continue;return {x:X,z:Z};}return {x,z};}
// sprites swap as the world is built; the places are settled once everything else has been put down (lamps, regions, water), when play starts
function f98Sprites(){f98Make();for(const c of RGC){const o=RGC_OBJ[c.id];if(o&&F98[c.id])o.spr=F98[c.id];}}
function f98Place(){for(const c of RGC){const o=RGC_OBJ[c.id];if(!o)continue;
    let p=null;try{p=F98_AT[c.id]&&F98_AT[c.id]();}catch(e){p=null;}if(!p)p=f98Clear(c.x,c.z,c.id);if(!p||(Math.abs(p.x-c.x)<1e-6&&Math.abs(p.z-c.z)<1e-6))continue;
    const it=interact.find(i=>Math.abs(i.x-c.x)<1e-6&&Math.abs(i.z-(c.z+.15))<1e-6&&i.r===1&&i.label);o.x=p.x;o.z=p.z;
    if(it){it.x=p.x;it.z=p.z+(F98_FIND[c.id]&&F98_FIND[c.id].lift?.55:.15);}c.x=p.x;c.z=p.z;}
  try{if(PG.objs)PG.objs.n=-1;if(PG.ics)PG.ics.n=-1;}catch(e){}}
const F98S={placed:false};setInterval(()=>{try{if(!F98S.placed&&S.mode==='play'&&typeof RGC_OBJ!=='undefined'&&RGC_OBJ.field){F98S.placed=true;f98Place();}}catch(e){}},250);
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{f98Sprites();F98S.placed=false;}catch(e){}return r;};}
