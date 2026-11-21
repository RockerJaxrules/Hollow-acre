/* ================= #247 #259 townsfolk walk like people. Their routes used to be straightened into lines at any angle, so they
   slid across the town diagonally while their sprite could only face one of four ways (it read as walking sideways, or
   hovering), their legs cycled on the clock rather than with the ground they covered (about twice too fast for their pace),
   and when something was in the way they leaned on it for a second and then skipped ahead to the next corner (walking into
   walls). Now:
   - every route is turned into straight runs along the streets, one direction at a time, each run checked against the same
     map of walkable ground the path search uses (an L round a corner, or a Z when the L would cut through something);
   - they keep a steadier, more natural pace that starts and stops gently, and their legs keep time with the distance walked;
   - stuck against something, they look for a fresh way to where they were going (and after a few tries, step back onto open
     ground first). The player walks exactly as before. ================= */
function npcSpeed(n){const id=n.def&&n.def.id;return id==='tobias'?2.2:id==='agnes'?1.1:(n.def&&n.def.kid)?1.9:1.7;}
// legs keep time with the ground covered (the player's stride, a touch shorter for a stroll)
function npcStride(n,dist){n._wt=(n._wt||0)+dist/2.2;n.t=n._wt;}
function npcUnstick(n){if(!n.route||!n.route.length)return;const fin=n.route[n.route.length-1];n._stuckN=(n._stuckN||0)+1;
  try{if(n._stuckN>=3&&n.x<250&&NAV.g){n._stuckN=0;const c=navNearest(...navCell(n.x,n.z));if(c){const p=navPt(c[0],c[1]);n.x=p[0];n.z=p[1];}}}catch(e){}
  const r=routeTo(n.x,n.z,fin[0],fin[1]);n.route=r&&r.length?r:null;}
// ---- straight runs: is the run from a to b (along one axis) all open ground? (its two ends may sit against a wall: doors do)
function npcRunClear(ax,az,bx,bz){const a=navCell(ax,az),b=navCell(bx,bz);const di=Math.sign(b[0]-a[0]),dj=Math.sign(b[1]-a[1]);if(di&&dj)return navLine(a,b);
  let i=a[0],j=a[1];const n=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));
  for(let k=1;k<n;k++){i+=di;j+=dj;if(!navFree(i,j))return false;}
  return true;}
function npcLegs(ax,az,bx,bz,out,depth){
  if(Math.abs(bx-ax)<.2||Math.abs(bz-az)<.2){out.push([bx,bz]);return;}
  const opts=Math.abs(bx-ax)>=Math.abs(bz-az)?[[bx,az],[ax,bz]]:[[ax,bz],[bx,az]];   // the longer run first, like walking down a street then turning
  for(const [mx,mz] of opts)if(npcRunClear(ax,az,mx,mz)&&npcRunClear(mx,mz,bx,bz)){out.push([mx,mz],[bx,bz]);return;}
  if(depth<3){const mx=(ax+bx)/2,mz=(az+bz)/2;npcLegs(ax,az,mx,mz,out,depth+1);npcLegs(mx,mz,bx,bz,out,depth+1);return;}
  out.push([bx,bz]);}   // nothing square fits (rare, very tight spots): a short slant is better than a wall
function npcSquare(x,z,pts){if(!pts||!pts.length)return pts;if(!NAV.g||NAV.sig!==navSig())navBuild();const out=[];let cx=x,cz=z;
  for(const p of pts){npcLegs(cx,cz,p[0],p[1],out,0);cx=p[0];cz=p[1];}
  // drop runs that go nowhere and merge runs that carry on the same way
  const m=[];let px=x,pz=z;for(const q of out){if(Math.hypot(q[0]-px,q[1]-pz)<.04)continue;const l=m[m.length-1],l2=m[m.length-2]||[x,z];
    if(l&&((Math.abs(l[0]-l2[0])<.02&&Math.abs(q[0]-l[0])<.02)||(Math.abs(l[1]-l2[1])<.02&&Math.abs(q[1]-l[1])<.02)))m[m.length-1]=q;else m.push(q);px=q[0];pz=q[1];}
  if(pts.rg)m.rg=true;return m;}
{const _rt=routeTo;routeTo=function(x,z,tx,tz){const r=_rt.apply(this,arguments);if(x>=250||tx>=250||!r||!r.length)return r;try{return npcSquare(x,z,r);}catch(e){return r;}};}
