/* ================= #379c the rail fence redrawn (owner: "Fences texture could be fixed"). The old rails were flat brown bars sprinkled
   with dark dots, and a fence running away from you was a tall striped pole with a collar every pace (its posts were twice the
   height of the posts across the screen). Drawn again by hand in code, one wood ramp shifted warm in the light and toward purple in
   the shade, lit from the top left:
   - posts as tall as the rails need, cut square at the top (a pale sawn cap), lit down the left, a split in the grain, a shadow at
     the foot thrown down and right;
   - two split rails that sag a pixel between posts, lit along the top edge with only the underside outlined, a few long grain
     streaks and a knot (never a sprinkle of dots), and their shadow lying on the grass under them;
   - a fence running away from you: a post every second pace (the same post), the two rails between seen from above as one
     lit timber, its shadow on the grass to its right, and a post at its far end. ================= */
const W79C={};
const W79C_P=['#281824','#46302e','#664436','#8a6040','#a87c52','#c49a68'];   // outline .. sawn highlight; the shade steps lean violet
const W79C_SH='rgba(50,33,37,.6)';
function w79cCv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');return [c,(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x,y,ww||1,hh||1);}];}
// a soft, broken shadow on the grass: runs of 1-2 px with gaps, never one ruled bar
function w79cShade(P,x0,y,len,seed,vert){const runs=[5,3,7,2,6,4,8,3];let i=seed%runs.length,t=0;
  while(t<len){const r=runs[i%runs.length],d=1+((i+seed)%2);for(let k=0;k<r&&t+k<len;k++){const th=d-((k===0||k===r-1)?1:0)||1;if(vert)P(x0,y+t+k,th,1,W79C_SH);else P(x0+t+k,y,1,th,W79C_SH);}t+=r+1+((i*3+seed)%3);i++;}}
// a post standing with its foot at (x,foot): w wide, h tall; cap rows of pale sawn top, lit left, shaded right, no band at the foot
function w79cPost(P,x,foot,w,h,seed,cap){const Q=W79C_P,y=foot-h;cap=cap||2;
  P(x+w,foot-2,2,2,W79C_SH);P(x+2,foot,w-1,1,W79C_SH);P(x+w-2,foot+1,3,1,W79C_SH);   /* its shadow, broken, down and right of the foot */
  P(x,y,w,h,Q[3]);P(x,y,1,h,Q[4]);P(x+1,y,1,h,Q[4]);P(x+w-2,y,1,h,Q[2]);P(x+w-1,y,1,h,Q[2]);   /* lit left, shaded right */
  P(x,y,w,cap,Q[5]);P(x+w-2,y,2,cap,Q[4]);P(x,y+cap,w,1,Q[2]);   /* the sawn top, a full step paler than the face, a dark lip under it */
  const sx=x+2+(seed%2),sy=y+cap+3+(seed%3);P(sx,sy,1,5,Q[2]);P(sx,sy+7,1,3,Q[2]);   /* a split down the grain */
  P(x-1,y,1,h,Q[1]);P(x+w,y,1,h,Q[0]);P(x,y-1,w,1,Q[1]);}
// a rail from x0 to x1 with its top at y, 4 rows deep: lit along its top edge (worn through in two short places), only its underside
// outlined, a few long grain streaks and one small knot
function w79cRail(P,x0,x1,y,seed,grain){const Q=W79C_P,L=x1-x0;
  for(let x=x0;x<x1;x++){P(x,y,1,1,Q[5]);P(x,y+1,1,1,Q[4]);P(x,y+2,1,1,Q[3]);P(x,y+3,1,1,Q[2]);P(x,y+4,1,1,Q[0]);}
  for(const [wx,wl] of [[Math.round(L*.3)+(seed%4),3],[Math.round(L*.72)-(seed%3),4]])P(x0+wx,y,wl,1,Q[4]);
  for(const [gx,gl,row] of grain)P(x0+gx,y+row,gl,1,Q[2]);
  const kx=x0+Math.round(L*(.2+(seed%5)*.12));P(kx,y+2,1,1,Q[1]);}
// ---- across the screen: one tile is a post and two rails running 2 paces to the next post (the same 72 x 24 frame as before)
function w79cFenceH(){const [c,P]=w79cCv(72,24);
  w79cShade(P,9,19,62,1,false);   /* the rails' shadow on the grass: soft and broken */
  w79cRail(P,5,72,3,3,[[9,8,2],[31,11,1],[50,6,2]]);w79cRail(P,5,72,11,7,[[15,10,1],[40,7,2],[58,5,1]]);
  w79cPost(P,0,22,7,21,1);return c;}
// ---- running away from you: one tile per pace; a post on every second one and on the last. The post is twice the rail's width
// with its sawn top showing; the rail between is lit on its left and shaded on its right; both throw a broken shadow down-right.
function w79cFenceV(post){const [c,P]=w79cCv(16,68);const Q=W79C_P;
  w79cShade(P,10,17,46,post?2:5,true);w79cShade(P,11,24,30,post?4:1,true);   /* the rail's shadow, to its right */
  for(let y=14;y<63;y++){P(4,y,1,1,Q[2]);P(5,y,1,1,Q[5]);P(6,y,1,1,Q[4]);P(7,y,1,1,Q[3]);P(8,y,1,1,Q[2]);P(9,y,1,1,Q[0]);}
  for(const [gy,gl] of (post?[[24,4]]:[[20,5],[44,4]]))P(8,gy,1,gl,Q[1]);   /* grain only on the shaded side */
  if(post)w79cPost(P,2,66,9,20,2,3);
  return c;}
function w79cInstall(){if(W79C.done)return true;if(!SPR.fence_h||!SPR.fence_v)return false;
  const reg=(k,c,ax,ay)=>{const src='w79c:'+k;IMG[src]=c;SPR[k]=Object.assign({},SPR[k]||{},{src,fw:c.width,fh:c.height,ax,ay,foot:[0,0,0,0]});};
  reg('fence_h',w79cFenceH(),0,22);reg('fence_v',w79cFenceV(true),7,66);reg('w79c_fence_vr',w79cFenceV(false),7,66);
  W79C.done=true;return true;}
// the runs that go away from you: a post on every second pace and at the far end (each run of tiles one pace apart at the same x)
function w79cPosts(){if(W79C.posts||typeof OBJ==='undefined')return;W79C.posts=1;const byX=new Map();
  for(const o of OBJ){if(o.spr!=='fence_v'||o.room)continue;const k=Math.round(o.x*100);let a=byX.get(k);if(!a)byX.set(k,a=[]);a.push(o);}
  for(const a of byX.values()){a.sort((p,q)=>p.z-q.z);let run=[];const flush=()=>{run.forEach((o,i)=>{if(i%2===1&&i<run.length-1)o.spr='w79c_fence_vr';});run=[];};
    for(const o of a){if(run.length&&o.z-run[run.length-1].z>1.05)flush();run.push(o);}flush();}}
w79cInstall();
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{w79cInstall();w79cPosts();}catch(e){console.warn('w79c',e);}return r;};}
setInterval(()=>{try{if(!W79C.done)w79cInstall();if(!W79C.posts&&typeof OBJ!=='undefined'&&OBJ.length>1000)w79cPosts();}catch(e){}},1000);

/* ---------------------------------------------------------------- invisible walls (owner: "some areas there are weird invisible walls").
   Every collider in the valley was checked against what is drawn there. Two kinds stopped you with nothing to see:
   - things taken out of the world later (the old graves round the Tithe house when its new art went in, a bush and an old lane sign
     in your farmyard, an old plot's fence post in the Low Fields, an elder by the Marsh place) kept their colliders: now a thing that
     is hidden for good gives its collider up, and gets it back if it is ever shown again;
   - the road bridge over the creek west of the farm stopped you at its north edge with no rail drawn there: it has a timber rail now
     (the fence's own rail), and the edge stops you where the rail stands. */
const W79C_GONE=/^(grave_|bush|hedge|sign|fence_|elder|tree_|oak_|maple_|pine_|birch_|willow|rock_|stump|weeds_|deadtree|snag|crate|barrel|firewood|lumber|tyres|drum)/;
const W79C_TAKEN=[];
function w79cOrphans(){if(typeof OBJ==='undefined'||typeof cgNear!=='function')return;let n=0;const cand=[];
  for(const o of OBJ){if(!o.hide||o.room||o.x>=250||o._w79c||!W79C_GONE.test(o.spr||''))continue;o._w79c=1;
    const A=cgNear(o.x,o.z,.6);for(const c of A.c){if(c.r>1.2)continue;if(Math.hypot(c.x-o.x,c.z-o.z)<=.22||Math.hypot(c.x-o.x,c.z-(o.z-.1))<=.22)cand.push([o,c]);}}
  if(cand.length){const G=new Map();for(const q of OBJ){if(q.hide||q.room||q.kind==='flat'||q.kind==='grass'||q.x>=250)continue;const k=Math.floor(q.x)+','+Math.floor(q.z);let a=G.get(k);if(!a)G.set(k,a=[]);a.push(q);}
    for(const [o,c] of cand){let held=false;   /* only when nothing that is drawn stands on it */
      for(let i=Math.floor(c.x-.5);i<=Math.floor(c.x+.5)&&!held;i++)for(let j=Math.floor(c.z-.5);j<=Math.floor(c.z+.5)&&!held;j++){const a=G.get(i+','+j);if(a)for(const q of a)if(Math.abs(q.x-c.x)<.5&&Math.abs(q.z-c.z)<.5){held=true;break;}}
      if(held)continue;const i=circles.indexOf(c);if(i>=0){circles.splice(i,1);W79C_TAKEN.push({o,c});n++;}}}
  // shown again: its collider comes back
  for(let i=W79C_TAKEN.length-1;i>=0;i--){const t=W79C_TAKEN[i];if(!t.o.hide){circles.push(t.c);W79C_TAKEN.splice(i,1);t.o._w79c=0;}}
  return n;}
setInterval(()=>{try{if(typeof OBJ!=='undefined'&&OBJ.length>1000)w79cOrphans();}catch(e){}},4000);
// the creek bridge's north rail
function w79cBridge(){if(W79C.bridge||typeof segs==='undefined')return;const s=segs.find(q=>Math.abs(q.x1+29.2)<.05&&Math.abs(q.z1+9.1)<.05&&Math.abs(q.x2+19.8)<.05);if(!s)return;W79C.bridge=1;
  for(let x=-29.2;x<-19.81;x+=2)obj('fence_h',x,-9.0,{kind:'fence',clipw:Math.min(2,-19.8-x)});}
setInterval(()=>{try{if(!W79C.bridge&&typeof OBJ!=='undefined'&&OBJ.length>1000)w79cBridge();}catch(e){}},1500);
