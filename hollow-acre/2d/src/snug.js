/* ================= placing things snug: in corners, against walls, right up next to other furniture. The outline moves on
   an eighth-of-a-metre grid (it was half a metre, which left gaps), other things only block where they actually stand,
   and when the spot you point at is a near miss (poking into a wall, a corner, the next cupboard) the outline slides to
   the closest spot within a hand's width where it does fit, so it sits flush. ================= */
const SNUG={key:'',out:null};
{const _ps=placeSpot;placeSpot=function(){const r=_ps.apply(this,arguments);if(!PLACE.on||!PLACE.spec||!r)return r;const [x,z]=r;const sp=PLACE.spec;
  const key=[x,z,sp.w,sp.d,sp.rot||'',S.room||'',Math.round(P.x*4),Math.round(P.z*4)].join(',');if(key===SNUG.key&&SNUG.out)return SNUG.out;SNUG.key=key;
  // indoors, pointing past a wall means "against that wall": pull it back inside first, so a corner is just a drag away
  let cx=x,cz=z;if(sp.room&&ROOMS[sp.room]&&S.room===sp.room){const R=ROOMS[sp.room],q=v=>Math.round(v*16)/16;
    cx=Math.max(q(R.ox+.15+sp.w/2+.03),Math.min(q(R.ox+R.w-.15-sp.w/2-.03),x));cz=Math.max(q(R.oz+.45+sp.d+.03),Math.min(q(R.oz+R.d-.3-.03),z));}
  let out=[cx,cz];const bad=placeValid(cx,cz);
  // only a near miss gets nudged; the wrong room, off the farm or the field stays a plain no
  if(bad&&!/inside first|outside|Off the farm|Not in the field|Not on that ground/.test(bad)){
    found:for(let k=1;k<=6;k++){const ring=[];for(let i=-k;i<=k;i++)ring.push([i,-k],[i,k]);for(let j=-k+1;j<k;j++)ring.push([-k,j],[k,j]);
      ring.sort((a,b)=>(a[0]*a[0]+a[1]*a[1])-(b[0]*b[0]+b[1]*b[1]));
      for(const [i,j] of ring){const X=cx+i/16,Z=cz+j/16;if(!placeValid(X,Z)){out=[X,Z];break found;}}}}
  SNUG.out=out;return out;};}
