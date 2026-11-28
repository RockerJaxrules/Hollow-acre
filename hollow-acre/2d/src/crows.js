/* ================= one crow everywhere (owner: "some of the old crows are visible"). The valley's crows were drawn four ways:
   the graveyard flock, the crow that lands where you stood and the crows on the Hollow's finds (Extreme) were boxes, a box
   body and a box head; the flock over Wickham was three bars; only the two on Hollis's broken rail (land335) were birds,
   with a body that tapers to a tail, a head, a thick beak, an eye that catches the light and legs. That bird is now the
   crow everywhere, with the poses the others need drawn the same way: perched, pecking, looking up, and three wing beats in
   flight. The farm's own crows (by the cabin, the field, the square, the graves and the lane), which cawed and flew off but
   were never drawn, are drawn with it, and so are the crows round the Hollow's finds. ================= */
const CRW={c:{}};
// one crow facing right on a 24 x 20 canvas, its feet at (12,17); pose: perch, peck, look, fly0 (wings up), fly1 (level), fly2 (down)
function crwPaint(P,pose){const B=['#0e0c12','#1c1a24','#2e2c3a','#4a4a5e'],BK='#5a5a64',x=12,fly=pose.startsWith('fly');
  const y=fly?7:10,down=pose==='peck',up=pose==='look';
  // the body: a tapered oval, its top a step lighter (l35's crow, point for point)
  for(let j=0;j<5;j++)for(let i=-4;i<=3;i++){if(Math.abs(i+.5)+Math.abs(j-2)*.8>4.6)continue;P(x+i,y+j,1,1,j<1?B[2]:B[1]);}
  // the tail: fanned out behind in flight, down to the ground perched
  if(fly){P(x-5,y+1,1,3,B[1]);P(x-6,y+1,1,3,B[0]);P(x-7,y,1,2,B[0]);P(x-7,y+3,1,1,B[0]);}
  else if(down){P(x-5,y+1,1,2,B[1]);P(x-6,y,1,2,B[0]);P(x-7,y-1,1,2,B[0]);}   // (pecking: the tail tips up as the head goes down)
  else{P(x-5,y+3,1,1,B[1]);P(x-6,y+4,2,1,B[0]);P(x-7,y+5,1,1,B[0]);}
  // the head, the eye that catches the light, the beak
  const hx=x+(down?4:3),hy=y+(down?3:up?-3:-2);P(hx,hy,3,3,B[1]);P(hx+1,hy,1,1,B[3]);P(hx+3,hy+1,2,1,BK);if(up)P(hx,hy+3,2,1,B[1]);   // (a neck under a raised head)
  if(down){P(hx+3,hy+2,2,1,BK);P(hx-1,hy+1,1,2,B[1]);}   // the beak's tip down at the ground, the neck stretched to it
  // the wing's sheen when folded; legs under it
  if(!fly){P(x-2,y+2,3,1,B[3]);P(x-1,y+5,1,2,B[0]);P(x+1,y+5,1,2,B[0]);return;}
  // in flight, seen a little from above: both wings out from the shoulders, the far one a step darker; each wing is a broad
  // blade with its leading edge lit and two fingers of primaries at the tip. Up: raised behind the head; level: the near wing
  // spread toward you, the far one away; down: swept under the body
  const Wg=(rows,c,lit)=>{for(const [dy,a,b] of rows){P(x+a,y+dy,b-a+1,1,c);if(lit)P(x+b,y+dy,1,1,lit);}};
  if(pose==='fly0'){Wg([[-1,1,2],[-2,0,2],[-3,0,1],[-4,-1,0],[-5,-1,-1]],B[0]);
    Wg([[-1,-2,1],[-2,-3,0],[-3,-4,-1],[-4,-4,-2],[-5,-5,-5],[-5,-3,-3],[-6,-6,-6],[-6,-4,-4]],B[1],B[2]);}
  else if(pose==='fly1'){Wg([[-1,-3,1],[-2,-4,-2],[-3,-5,-5],[-3,-3,-3]],B[0]);
    Wg([[4,-4,1],[5,-5,0],[6,-6,-3],[7,-7,-7],[7,-5,-5]],B[1],B[2]);}
  else{Wg([[5,1,2],[6,1,1]],B[0]);Wg([[5,-2,1],[6,-3,0],[7,-4,-1],[8,-5,-5],[8,-3,-3]],B[1],B[2]);}
  P(x-2,y+1,3,1,B[3]);}
function crwCanvas(pose,flip){const k=pose+(flip?'L':'R');if(CRW.c[k])return CRW.c[k];const W=24,H=20,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w||1,h||1);};crwPaint(P,pose);
  // one outline round the bird, its own darkest colour (as the rail's crows have)
  const d=g.getImageData(0,0,W,H),a=d.data,o=new Uint8Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(a[(y*W+x)*4+3])continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const qx=x+dx,qy=y+dy;if(qx>=0&&qy>=0&&qx<W&&qy<H&&a[(qy*W+qx)*4+3]){o[y*W+x]=1;break;}}}
  for(let i=0;i<W*H;i++)if(o[i]){a[i*4]=8;a[i*4+1]=6;a[i*4+2]=10;a[i*4+3]=255;}g.putImageData(d,0,0);
  if(flip){const f=document.createElement('canvas');f.width=W;f.height=H;const fg=f.getContext('2d');fg.translate(W,0);fg.scale(-1,1);fg.drawImage(c,0,0);return CRW.c[k]=f;}
  return CRW.c[k]=c;}
// draw a crow at a ground point (X,Y on the screen), lifted h px, facing dir (1 right, -1 left); alpha optional
function crwDraw(X,Y,pose,dir,h,alpha,shadow){const c=crwCanvas(pose,dir<0);const g=ctx2;
  if(shadow!==false&&(h||0)<6){g.fillStyle='rgba(50,33,37,.45)';g.fillRect(Math.round(X)-3,Math.round(Y)-1,7,2);}
  if(alpha!=null&&alpha<1){g.globalAlpha=alpha;g.drawImage(c,Math.round(X)-12,Math.round(Y-(h||0))-17);g.globalAlpha=1;}
  else g.drawImage(c,Math.round(X)-12,Math.round(Y-(h||0))-17);}
const crwFlap=(t,ph)=>['fly0','fly1','fly2','fly1'][Math.floor(t*10+(ph||0))&3];
// ---- the graveyard flock and the crow that lands where you stood (ambient.js, doubt373.js): pigeons stay as they are
if(typeof ambBird==='function'){const _ab=ambBird;ambBird=function(b,X,Y){if(!b||b.kind!=='crow')return _ab.apply(this,arguments);const t=performance.now()/1000;
  const pose=b.st==='fly'?crwFlap(t,b.ph):(Math.sin(t*5.5+(b.ph||0))>.6?'peck':'perch');crwDraw(X,Y,pose,b.dir||1,Math.round(b.h||0));};}
// ---- the crows on the Hollow's finds at Extreme (gorex374.js): the same bird, pecking and tugging a strip loose
if(typeof gxCrowDraw==='function'){gxCrowDraw=function(D,k,t){const L=GX.crows[k.id];if(!L)return;const K=KILLS[k.kind];
  for(const [i,c] of L.entries()){if(c.st==='fly'&&c.t>5)continue;D.push({z:k.z+.31+i*.001,mind:1,draw(){const [dx,dy]=gxW(K,c.p),X=Math.round(sx(k.x)+dx+c.ox),Y=Math.round(sz(k.z)+dy+c.oy),g=ctx2;
    const fly=c.st==='fly',ph=(c.t+i*1.1)%2.2,tug=!fly&&ph>1.4,pull=tug?Math.round(Math.sin((ph-1.4)/.8*Math.PI)*2):0,peck=!fly&&ph<1.4&&Math.sin(c.t*9+i)>.55,dir=c.dir||1,bx=X-pull*dir;
    crwDraw(bx,Y,fly?crwFlap(t,i):(peck||tug)?'peck':'perch',dir,Math.round(c.h||0));
    if(tug){const sx0=bx+dir*9,sy0=Y-2;g.fillStyle='#7a1420';for(let s=0;s<=pull+1;s++)g.fillRect(sx0+dir*s,sy0+Math.round(s*.6),1,1);g.fillStyle='#4c0a10';g.fillRect(sx0+dir*(pull+2),sy0+1+Math.round(pull*.6),1,2);}}});}};}
// ---- the farm's own crows (game.js): they perch, peck, caw and fly off as you come near, and come back. Drawn at last. At
// Extreme the crows on a find are drawn on the body instead (above); after dark the perched ones have gone to roost.
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{if(S.room||typeof crows==='undefined')return;const night=isNight(),ext=!!window.GORE_EXTREME,now=performance.now()/1000;
  for(const c of crows){if(c.kill&&ext)continue;if(night&&c.state==='perch')continue;if(!onScreen(c.x,c.z,70))continue;
    D.push({z:c.z,mind:1,draw(){const fly=c.state!=='perch',dir=fly?(c.vx>=0?1:-1):(P.x>c.x?1:-1);
      crwDraw(sx(c.x),sz(c.z),fly?crwFlap(now,c.hx):(Math.sin(now*1.4+c.hx*3)>.75?'peck':'perch'),dir,fly?Math.round(c.y*PPM*.5):0);}});}}catch(e){}};}
