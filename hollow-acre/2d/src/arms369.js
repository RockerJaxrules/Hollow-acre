/* ================= #297 your arms in the making games, built like arms. Each hand's arm comes from its own shoulder, off the
   bottom corner on its own side (the right from the bottom right, the left from the bottom left), as two bones of fixed length
   (upper arm 28 cm, forearm 26 cm) joined at an elbow that bends one way, solved in 3D and seen through the game's camera, so a
   forearm only looks shorter when it really points at you. The hand closes round the tool the way hands do (a power grip across
   the palm, a pinch between thumb and index, a hook, a flat palm), and the wrist keeps to its range (about 65 degrees up or down,
   20 toward the thumb, 30 toward the little finger); past that the elbow swings and the shoulder leans in instead. Out of reach,
   the body leans; the arm never grows. Each hand is drawn from a 3D hand (palm, three bones a finger, a thumb on its own pivot)
   seen from the angle it is really at, so its back, palm, thumb side or little-finger side shows as it turns. The sleeve is the
   one you are wearing: its colour, pattern and dye from the wardrobe's own ramps, its cuff (a buttoned shirt cuff, a knit rib, a
   hoodie's gathered cuff, a coat's turned-back cuff over the shirt's, a tee's rolled hem with the bare forearm under it, bare arms
   in a tank top), its folds at the elbow and the cuff, lit from the room's light. ================= */
const AR={f:95,cx:160,cy:50,Lu:28,Lf:26,SH:{1:[17,27,9],'-1':[-17,27,9]},
  L:(()=>{const v=[-.5,-.72,-.48],l=Math.hypot(...v);return v.map(x=>x/l);})(),
  st:new Map(),views:new Map(),slot:0,lastT:-1,log:null,frameN:0};
const v3={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];},
  lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]};
// the camera: screen x right, y down, z into the picture (cm). The work is about half a metre away, a little farther up the picture
const arZ=sy=>Math.max(40,Math.min(66,50+(110-sy)*.15));
const arWorld=(sx,sy,z)=>{z=z==null?arZ(sy):z;return [(sx-AR.cx)*z/AR.f,(sy-AR.cy)*z/AR.f,z];};
const arProj=p=>[AR.cx+AR.f*p[0]/p[2],AR.cy+AR.f*p[1]/p[2]];
// ---------------------------------------------------------------- the hand, in its own frame: f along the fingers from the wrist,
// t toward the thumb, n out of the palm (cm). Grips set each finger's three joints and the thumb's line.
const AR_FING=[{t:2.65,f:8.1,L:[4.2,2.5,2.0],r:[.9,.8,.72]},{t:.9,f:8.35,L:[4.6,2.9,2.1],r:[.94,.84,.74]},{t:-.85,f:8.15,L:[4.3,2.7,2.0],r:[.88,.79,.7]},{t:-2.5,f:7.55,L:[3.4,2.0,1.8],r:[.78,.7,.62]}];
const AR_GRIP={
  // a power grip: the handle across the palm, from the index's root to the heel of the hand on the little-finger side
  power:{off:[6.4,0,3.0],fing:[[62,98,48],[66,100,50],[70,98,50],[74,96,52]],spread:[-4,0,4,9],thumb:[[.5,.45,.75],[.35,-.45,.82],[.1,-.85,.5]],axis:'handle'},
  // a pinch: thumb tip to index tip, the middle finger under them, the ring and little fingers tucked
  pinch:{off:[10.6,1.9,2.4],fing:[[30,58,22],[42,70,30],[70,98,52],[78,100,55]],spread:[-2,2,5,9],thumb:[[.58,.55,.6],[.75,-.05,.66],[.8,-.3,.52]],axis:'fingers'},
  // a hook: fingers bent at the middle joints round a bucket's bail
  hook:{off:[9.2,0,2.4],fing:[[12,92,58],[12,95,60],[14,92,58],[16,90,56]],spread:[-3,0,3,7],thumb:[[.55,.7,.42],[.82,.38,.42],[.9,.2,.38]],axis:'fingers'},
  // a flat palm laid on the work, the fingers a little apart, the thumb out
  palm:{off:[5.2,0,1.2],fing:[[6,8,4],[4,6,4],[5,7,4],[8,9,5]],spread:[-7,-1,5,12],thumb:[[.74,.64,.12],[.9,.42,.05],[.95,.3,.02]],axis:'fingers'},
  // pointing: the index straight, the others curled, the thumb over the middle finger
  point:{off:[7.5,.6,1.4],fing:[[4,6,4],[78,100,56],[80,100,56],[82,98,56]],spread:[-2,0,4,9],thumb:[[.52,.5,.7],[.48,-.4,.78],[.2,-.82,.54]],axis:'fingers'}};
// the hand's parts (capsules and ellipsoids) in its own frame
function arHandParts(kind){const G=AR_GRIP[kind]||AR_GRIP.power;const P=[];const cap=(a,b,r,m)=>P.push({t:0,a,b,r,m:m||'k'});const ell=(c,ax,m)=>P.push({t:1,c,ax,m:m||'k'});
  // the palm: a broad flat block (two flattened ellipsoids), the heel of the hand, the ball of the thumb on the palm side
  ell([4.3,.1,.05],[[4.3,0,0],[0,3.95,0],[0,0,1.25]]);ell([2.2,-.3,.25],[[2.6,0,0],[0,3.3,0],[0,0,1.35]]);ell([2.9,2.15,.85],[[2.5,.3,0],[-.3,1.5,0],[0,0,1.2]]);
  ell([-.6,0,.1],[[2.2,0,0],[0,3.0,0],[0,0,1.7]]);     // the wrist, flattened
  G.fing.forEach((ang,i)=>{const F=AR_FING[i];const sp=(G.spread[i]||0)*Math.PI/180;let p=[F.f,F.t,.15],d=[Math.cos(sp),Math.sin(sp),0];let a=0;
    // the knuckle on the back of the hand
    P.push({t:1,c:[F.f-.2,F.t,-.55],ax:[[.8,0,0],[0,.8,0],[0,0,.55]],m:'k'});
    for(let j=0;j<3;j++){a+=ang[j]*Math.PI/180;const dir=[Math.cos(a)*d[0],Math.cos(a)*d[1],Math.sin(a)];const q=[p[0]+dir[0]*F.L[j],p[1]+dir[1]*F.L[j],p[2]+dir[2]*F.L[j]];
      cap(p,q,F.r[j]);if(j===2&&AR.nails){// the nail on the back of the last bone, toward its tip
        const nb=[-Math.sin(a)*d[0],-Math.sin(a)*d[1],Math.cos(a)];const c=[p[0]+dir[0]*F.L[j]*.62-nb[0]*F.r[j]*.72,p[1]+dir[1]*F.L[j]*.62-nb[1]*F.r[j]*.72,p[2]+dir[2]*F.L[j]*.62-nb[2]*F.r[j]*.72];
        P.push({t:1,c,ax:[dir.map(v=>v*F.L[j]*.36),[-d[1]*F.r[j]*.68,d[0]*F.r[j]*.68,0],nb.map(v=>v*.2)],m:'n'});}
      p=q;}});
  // the thumb from its own pivot at the base of the palm
  let p=[1.6,2.25,.7];const TL=[4.1,3.0,2.5],TR=[1.18,1.0,.88];G.thumb.forEach((d,j)=>{const dn=v3.norm(d);const q=v3.add(p,v3.mul(dn,TL[j]));cap(p,q,TR[j]);
    if(j===2&&AR.nails){const nb=v3.norm(v3.cross(dn,[0,0,1]));const up=v3.norm(v3.cross(nb,dn));const c=v3.add(v3.add(p,v3.mul(dn,TL[j]*.6)),v3.mul(up,-TR[j]*.72));P.push({t:1,c,ax:[v3.mul(dn,TL[j]*.34),v3.mul(nb,TR[j]*.66),v3.mul(up,.2)],m:'n'});}
    p=q;});
  return P;}
// the frame a hand has when its grip axis runs along a (3D) and it is rolled psi about it
function arFrame(kind,a,psi,left){const G=AR_GRIP[kind]||AR_GRIP.power;const e1=v3.norm(Math.abs(a[2])<.9?v3.cross(a,[0,0,1]):v3.cross(a,[1,0,0])),e2=v3.cross(a,e1);
  const N=v3.add(v3.mul(e1,Math.cos(psi)),v3.mul(e2,Math.sin(psi)));let F,T;
  if(G.axis==='handle'){// the handle's butt runs out of the heel of the hand: a = -cos(b) T - sin(b) F, b about 40 degrees
    const b=.7,w=v3.cross(N,a);T=v3.add(v3.mul(a,-Math.cos(b)),v3.mul(w,Math.sin(b)));F=v3.add(v3.mul(a,-Math.sin(b)),v3.mul(w,-Math.cos(b)));
    const want=left?v3.cross(N,F):v3.cross(F,N);if(v3.dot(want,T)<0){T=v3.add(v3.mul(a,-Math.cos(b)),v3.mul(w,-Math.sin(b)));F=v3.add(v3.mul(a,-Math.sin(b)),v3.mul(w,Math.cos(b)));}}
  else{F=kind==='pinch'?a:v3.mul(a,-1);T=left?v3.cross(N,F):v3.cross(F,N);}   // a pinch's fingers run along what they hold; a flat hand or a point the other way
  return {F,T,N};}
// a point in the hand's frame to the camera's
const arToCam=(R,o,p,left)=>[o[0]+R.F[0]*p[0]+R.T[0]*p[1]*(left?1:1)+R.N[0]*p[2],o[1]+R.F[1]*p[0]+R.T[1]*p[1]+R.N[1]*p[2],o[2]+R.F[2]*p[0]+R.T[2]*p[1]+R.N[2]*p[2]];
// ---------------------------------------------------------------- the solve: where the hand is, how it is turned, where the elbow
// and shoulder go. Searched over the grip's tilt in depth (phi), its roll (psi) and the wrist's bend (th up/down, de sideways)
const AR_LIM={flex:70,ext:65,rad:20,uln:30};const D2R=Math.PI/180;
function arEval(J,p){const {G,kind,left,side}=J;const hb=p[4]<0?[-J.hb[0],-J.hb[1],0]:J.hb;const cphi=Math.cos(p[0]),sphi=Math.sin(p[0]);
  const a=v3.norm([hb[0]*cphi+G[0]/G[2]*sphi,hb[1]*cphi+G[1]/G[2]*sphi,sphi]);const R=arFrame(kind,a,p[1],left);const off=(AR_GRIP[kind]||AR_GRIP.power).off;
  const W=v3.sub(G,v3.add(v3.add(v3.mul(R.F,off[0]),v3.mul(R.T,off[1])),v3.mul(R.N,off[2])));
  const A=v3.norm(v3.add(v3.add(v3.mul(R.F,-Math.cos(p[2])*Math.cos(p[3])),v3.mul(R.N,Math.sin(p[2]))),v3.mul(R.T,Math.sin(p[3]))));
  const E=v3.add(W,v3.mul(A,AR.Lf));const S0=J.S0;const Sh=v3.add(E,v3.mul(v3.norm(v3.sub(S0,E)),AR.Lu));const lean=v3.len(v3.sub(Sh,S0));
  const U=v3.norm(v3.sub(Sh,E)),V=v3.mul(A,-1);const bend=Math.acos(Math.max(-1,Math.min(1,v3.dot(U,A))));   // 180 straight, small = folded
  // a tool is drawn flat on the picture, so a fist's handle stays near that plane; fingertips (a pinch, a flat hand, a point) may tip away
  const T=J.dbg?(n=>{(J.tr||(J.tr=[])).push([n,+c.toFixed(2)]);}):null;let c=lean*lean/30+(kind==='pinch'&&p[4]<0?1.2:0)+(kind==='power'?2.2*(p[0]/.3)**2:.8*(p[0]/.5)**2);
  // the forearm rises into the picture from below: the elbow sits lower on the screen than the wrist (we hold our work in front of us)
  {const ey=AR.cy+AR.f*E[1]/Math.max(4,E[2]),wy=AR.cy+AR.f*W[1]/Math.max(4,W[2]);if(ey<wy+14)c+=2.5*((wy+14-ey)/25)**2;
    // and the arm leaves the picture through its bottom edge, not out of a side
    T&&T('lean+phi+below');const ex=AR.cx+AR.f*E[0]/Math.max(4,E[2]);if(ey<150)c+=.8*((150-ey)/40)**2;const sx=ex<-6?-6-ex:ex>326?ex-326:0;if(sx>0&&ey<175)c+=1.5*(sx/30)**2;}
  T&&T('edges');const fl=p[2]/D2R,de=p[3]/D2R;c+=1.6*((fl>0?fl/AR_LIM.flex:fl/AR_LIM.ext)**2+(de>0?de/AR_LIM.rad:de/AR_LIM.uln)**2);
  T&&T('wrist');if(bend<45*D2R)c+=8*(45*D2R-bend);
  // the elbow hangs down and out, never up and in across the body
  const SW=v3.norm(v3.sub(W,Sh)),pr=v3.add(Sh,v3.mul(SW,v3.dot(v3.sub(E,Sh),SW))),o=v3.sub(E,pr);const pole=v3.norm([left?-.4:.4,1,-.08]);const ol=v3.len(o);if(ol>1.5)c+=2.4*(1-v3.dot(o,pole)/ol);
  if(E[1]<W[1]-3)c+=((W[1]-3-E[1])/7)**2;
  T&&T('elbow');// the forearm's twist: the thumb no more than about 95 degrees either side of "thumb up"
  const t0=v3.sub(U,v3.mul(A,v3.dot(U,A))),tl=v3.len(t0);let twist=0;if(tl>.2){const t0n=v3.mul(t0,1/tl),Tp=v3.norm(v3.sub(R.T,v3.mul(A,v3.dot(R.T,A))));twist=Math.acos(Math.max(-1,Math.min(1,v3.dot(t0n,Tp))))/D2R;if(twist>95)c+=((twist-95)/25)**2*Math.min(1,tl*1.5);}
  T&&T('twist');// we mostly see the backs of our hands; a palm turned full to the eye only for an open hand
  const toEye=v3.norm(v3.mul(G,-1)),pv=v3.dot(R.N,toEye);if(kind!=='palm'&&pv>.35)c+=(pv-.35)*2.2;if(kind==='palm'&&pv>-.1)c+=(pv+.1)*3;
  T&&T('palm');// the thumb on the side of the handle the game asked for (lightly)
  if(side&&kind==='power'){const ts=[R.T[0]-G[0]/G[2]*R.T[2],R.T[1]-G[1]/G[2]*R.T[2]];const cr=hb[0]*ts[1]-hb[1]*ts[0];if(cr*side>0)c+=.25;}
  T&&T('thumb');if(J.prev){const q=J.prev;if((p[4]||1)!==(q[4]||1))c+=6;let d1=p[1]-q[1];d1=Math.atan2(Math.sin(d1),Math.cos(d1));c+=3*((p[0]-q[0])**2+d1*d1+(p[2]-q[2])**2+(p[3]-q[3])**2);}
  T&&T('cont');return {c,R,W,A,E,Sh,lean,bend,fl,de,twist,a};}
function arSolve(J){let best=null,bp=null;const tryP=p=>{const r=arEval(J,p);if(!best||r.c<best.c){best=r;bp=p.slice();}};
  if(J.prev){tryP(J.prev);}
  if(!J.prev||J.full){const PH=J.kind==='power'?[-15,0,15]:[-40,-20,0,20,40];for(const ph of PH)for(let j=0;j<8;j++)for(const th of [-40,5,45])for(const de of [-12])for(const sg of (J.kind==='power'||J.kind==='pinch'?[1,-1]:[1]))tryP([ph*D2R,j*Math.PI/4,th*D2R,de*D2R,sg]);}
  let st=J.prev&&!J.full?[.1,.1,.1,.08]:[.22,.26,.2,.16];const lo=[-1.2,-1e9,-AR_LIM.ext*D2R,-AR_LIM.uln*D2R],hi=[1.2,1e9,AR_LIM.flex*D2R,AR_LIM.rad*D2R];
  for(let it=0;it<(J.full?11:5);it++){let moved=false;for(let k=0;k<4;k++)for(const s of [1,-1]){const p=bp.slice();p[k]=Math.max(lo[k],Math.min(hi[k],p[k]+s*st[k]));const r=arEval(J,p);if(r.c<best.c-1e-6){best=r;bp=p;moved=true;}}
    if(!moved)st=st.map(v=>v*.5);}
  best.p=bp;return best;}
// ---------------------------------------------------------------- the views: a hand's turn is kept to the nearest 6 degrees, and
// each view is drawn once from the 3D hand (never another view turned or mirrored), then reused
const AR_Q=6*D2R;
function arQuant(R,left){const F=R.F;let el=Math.asin(Math.max(-1,Math.min(1,F[1]))),az=Math.atan2(F[0],F[2]);
  const ref=v3.norm(Math.abs(F[2])<.97?v3.cross(F,[0,0,1]):v3.cross(F,[1,0,0]));let roll=Math.atan2(v3.dot(R.N,v3.cross(F,ref)),v3.dot(R.N,ref));
  const q=v=>Math.round(v/AR_Q);const k=[q(az),q(el),q(roll)];
  az=k[0]*AR_Q;el=k[1]*AR_Q;roll=k[2]*AR_Q;const Fq=[Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az)];
  const rq=v3.norm(Math.abs(Fq[2])<.97?v3.cross(Fq,[0,0,1]):v3.cross(Fq,[1,0,0]));const Nq=v3.norm(v3.add(v3.mul(rq,Math.cos(roll)),v3.mul(v3.cross(Fq,rq),Math.sin(roll))));
  const Tq=left?v3.cross(Nq,Fq):v3.cross(Fq,Nq);return {R:{F:Fq,T:Tq,N:Nq},k:k.join(',')};}
const arHex=c=>'#'+c.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
function arSkin(){const L=(typeof S!=='undefined'&&S.look)||{};const sk=/^#[0-9a-f]{6}$/i.test(L.skin||'')?L.skin:'#e8b48c';return sk;}
// ray against a capsule (iq) and an ellipsoid, the rays all along +z (the hand is small and far enough to see it square on)
function arRayCap(ox,oy,pa,pb,r){const ro=[ox,oy,-80],rd=[0,0,1];const ba=v3.sub(pb,pa),oa=v3.sub(ro,pa);const baba=v3.dot(ba,ba),bard=ba[2],baoa=v3.dot(ba,oa),rdoa=oa[2],oaoa=v3.dot(oa,oa);
  const a=baba-bard*bard,b=baba*rdoa-baoa*bard,c=baba*oaoa-baoa*baoa-r*r*baba;let h=b*b-a*c;
  if(h>=0&&a>1e-9){const t=(-b-Math.sqrt(h))/a,y=baoa+t*bard;if(y>0&&y<baba)return t;const oc=y<=0?oa:v3.sub(ro,pb);const b2=oc[2],c2=v3.dot(oc,oc)-r*r;const h2=b2*b2-c2;if(h2>0)return -b2-Math.sqrt(h2);}
  else if(a<=1e-9){const oc=oa;const b2=oc[2],c2=v3.dot(oc,oc)-r*r;const h2=b2*b2-c2;if(h2>0)return -b2-Math.sqrt(h2);}
  return -1;}
function arInv3(m){const [a,b,c]=m;const det=a[0]*(b[1]*c[2]-b[2]*c[1])-b[0]*(a[1]*c[2]-a[2]*c[1])+c[0]*(a[1]*b[2]-a[2]*b[1]);const id=1/(det||1e-9);
  // m is three column vectors; returns rows of the inverse
  return [[(b[1]*c[2]-c[1]*b[2])*id,(c[0]*b[2]-b[0]*c[2])*id,(b[0]*c[1]-c[0]*b[1])*id],[(c[1]*a[2]-a[1]*c[2])*id,(a[0]*c[2]-c[0]*a[2])*id,(c[0]*a[1]-a[0]*c[1])*id],[(a[1]*b[2]-b[1]*a[2])*id,(b[0]*a[2]-a[0]*b[2])*id,(a[0]*b[1]-b[0]*a[1])*id]];}
function arHandView(kind,left,Rq,qk,sc,sk,tool,ts){const TL=tool&&AR_TOOLS[tool];const key=kind+'|'+(left?1:0)+'|'+qk+'|'+sc.toFixed(1)+'|'+sk+'|'+(TL?tool+'|'+(ts||0):'');let V=AR.views.get(key);if(V)return V;if(AR.views.size>900)AR.views.clear();
  const G=AR_GRIP[kind]||AR_GRIP.power,off=G.off;const loc=p=>{const q=[p[0]-off[0],p[1]-off[1],p[2]-off[2]];return [Rq.F[0]*q[0]+Rq.T[0]*q[1]+Rq.N[0]*q[2],Rq.F[1]*q[0]+Rq.T[1]*q[1]+Rq.N[1]*q[2],Rq.F[2]*q[0]+Rq.T[2]*q[1]+Rq.N[2]*q[2]];};
  const dirC=d=>[Rq.F[0]*d[0]+Rq.T[0]*d[1]+Rq.N[0]*d[2],Rq.F[1]*d[0]+Rq.T[1]*d[1]+Rq.N[1]*d[2],Rq.F[2]*d[0]+Rq.T[2]*d[1]+Rq.N[2]*d[2]];
  // the hand, and what it holds (in the hand's own frame, so the two move as one and the fingers close round the handle)
  const parts=arHandParts(kind).concat(TL?TL.parts(ts||0):[]).map((p,i)=>{if(p.t===0)return Object.assign({},p,{a:loc(p.a),b:loc(p.b),i});const c=loc(p.c),M=p.ax.map(dirC);return Object.assign({},p,{c,M,Mi:arInv3(M),i});});
  let SZ=64;if(TL){let e=0;for(const p of parts){if(p.t===0)e=Math.max(e,Math.hypot(p.a[0],p.a[1])+p.r,Math.hypot(p.b[0],p.b[1])+p.r);else{const m=Math.max(...p.M.map(v=>Math.hypot(v[0],v[1],v[2])));e=Math.max(e,Math.hypot(p.c[0],p.c[1])+m);}}SZ=Math.max(64,2*Math.ceil(e*sc)+6);}
  const C=SZ/2;const id=new Int16Array(SZ*SZ).fill(-1),Z=new Float32Array(SZ*SZ).fill(1e9),NL=new Float32Array(SZ*SZ);const L=AR.L;
  // each part tests only the pixels it can cover (its box on the picture), nearest wins
  const ex3=M=>[0,1,2].map(k=>Math.sqrt(M[0][k]*M[0][k]+M[1][k]*M[1][k]+M[2][k]*M[2][k]));
  for(const p of parts){let lx,hx,ly,hy;if(p.t===0){lx=Math.min(p.a[0],p.b[0])-p.r;hx=Math.max(p.a[0],p.b[0])+p.r;ly=Math.min(p.a[1],p.b[1])-p.r;hy=Math.max(p.a[1],p.b[1])+p.r;}
    else{const e=ex3(p.M);lx=p.c[0]-e[0];hx=p.c[0]+e[0];ly=p.c[1]-e[1];hy=p.c[1]+e[1];}
    const X0=Math.max(0,Math.floor(lx*sc+C-.5)),X1=Math.min(SZ-1,Math.ceil(hx*sc+C-.5)),Y0=Math.max(0,Math.floor(ly*sc+C-.5)),Y1=Math.min(SZ-1,Math.ceil(hy*sc+C-.5));
    if(p.t===0){const ax=p.a[0],ay=p.a[1],az=p.a[2],bx=p.b[0]-ax,by=p.b[1]-ay,bz=p.b[2]-az,bb=bx*bx+by*by+bz*bz,r=p.r,r2=r*r,a_=bb-bz*bz;
      for(let py=Y0;py<=Y1;py++)for(let px=X0;px<=X1;px++){const i=py*SZ+px;const ox=(px+.5-C)/sc,oy=(py+.5-C)/sc;const qx=ox-ax,qy=oy-ay,qz=-80-az;
        const bo=bx*qx+by*qy+bz*qz,oo=qx*qx+qy*qy+qz*qz;let t=-1,nx=0,ny=0,nz=0;
        if(a_>1e-9){const b_=bb*qz-bo*bz,c_=bb*oo-bo*bo-r2*bb,h=b_*b_-a_*c_;if(h>=0){const tt=(-b_-Math.sqrt(h))/a_,y=bo+tt*bz;
            if(y>0&&y<bb){t=tt;const k=y/bb;nx=(qx-bx*k)/r;ny=(qy-by*k)/r;nz=(qz+tt-bz*k)/r;}
            else{const cx=y<=0?qx:ox-p.b[0],cy=y<=0?qy:oy-p.b[1],cz=y<=0?qz:-80-p.b[2];const h2=cz*cz-(cx*cx+cy*cy+cz*cz-r2);if(h2>0){t=-cz-Math.sqrt(h2);nx=cx/r;ny=cy/r;nz=(cz+t)/r;}}}}
        else{const h2=qz*qz-(oo-r2);if(h2>0){t=-qz-Math.sqrt(h2);nx=qx/r;ny=qy/r;nz=(qz+t)/r;}}
        if(t>0&&t-80<Z[i]){id[i]=p.i;Z[i]=t-80;NL[i]=nx*L[0]+ny*L[1]+nz*L[2];}}}
    else{const Mi=p.Mi,cx0=p.c[0],cy0=p.c[1],cz0=p.c[2],dx=Mi[0][2],dy=Mi[1][2],dz=Mi[2][2],aa=dx*dx+dy*dy+dz*dz;
      for(let py=Y0;py<=Y1;py++)for(let px=X0;px<=X1;px++){const i=py*SZ+px;const ox=(px+.5-C)/sc-cx0,oy=(py+.5-C)/sc-cy0,oz=-80-cz0;
        const ux=Mi[0][0]*ox+Mi[0][1]*oy+Mi[0][2]*oz,uy=Mi[1][0]*ox+Mi[1][1]*oy+Mi[1][2]*oz,uz=Mi[2][0]*ox+Mi[2][1]*oy+Mi[2][2]*oz;
        const b_=ux*dx+uy*dy+uz*dz,c_=ux*ux+uy*uy+uz*uz-1,h=b_*b_-aa*c_;if(h<0)continue;const t=(-b_-Math.sqrt(h))/aa;if(!(t>0&&t-80<Z[i]))continue;
        const yx=ux+dx*t,yy=uy+dy*t,yz=uz+dz*t;let nx=Mi[0][0]*yx+Mi[1][0]*yy+Mi[2][0]*yz,ny=Mi[0][1]*yx+Mi[1][1]*yy+Mi[2][1]*yz,nz=Mi[0][2]*yx+Mi[1][2]*yy+Mi[2][2]*yz;
        const l=Math.hypot(nx,ny,nz)||1;id[i]=p.i;Z[i]=t-80;NL[i]=(nx*L[0]+ny*L[1]+nz*L[2])/l;}}}
  // tones: lit from the room, a crease where one part lies over another, then the outline
  const R=rampRGB(hexRGB(sk)),NR=rampRGB([Math.min(255,parseInt(sk.slice(1,3),16)*.9+30),Math.min(255,parseInt(sk.slice(3,5),16)*.8+34),Math.min(255,parseInt(sk.slice(5,7),16)*.8+40)]);
  const T=new Int8Array(SZ*SZ).fill(-1);for(let i=0;i<SZ*SZ;i++)if(id[i]>=0){const s=NL[i];T[i]=s>.74?4:s>.4?3:s>.06?2:s>-.3?1:0;}
  const T2=T.slice();const at=(x,y)=>x<0||y<0||x>=SZ||y>=SZ?-1:id[y*SZ+x];
  for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const i=y*SZ+x;if(id[i]<0)continue;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const j=at(x+dx,y+dy);if(j<0||j===id[i])continue;const zi=Z[i],zj=Z[(y+dy)*SZ+x+dx];
      const pj=parts[j],pi=parts[id[i]];if(pi.m==='n'||pj.m==='n')continue;if(zj<zi-1.0){T2[i]=Math.max(0,Math.min(T2[i],T[i]-1,2));}}}
  // lone pixels melt into their neighbours
  for(let y=1;y<SZ-1;y++)for(let x=1;x<SZ-1;x++){const i=y*SZ+x;if(T2[i]<0)continue;const n4=[T2[i-1],T2[i+1],T2[i-SZ],T2[i+SZ]];if(n4.every(v=>v>=0&&v===n4[0])&&n4[0]!==T2[i]&&parts[id[i]].m!=='n')T2[i]=n4[0];}
  const c=document.createElement('canvas');c.width=SZ;c.height=SZ;const g=c.getContext('2d'),d=g.createImageData(SZ,SZ),D=d.data;
  const put=(i,col)=>{D[i*4]=col[0];D[i*4+1]=col[1];D[i*4+2]=col[2];D[i*4+3]=255;};
  const ramp=m=>m==='k'?R:m==='n'?NR:AR_MAT[m]||R;
  for(let i=0;i<SZ*SZ;i++)if(T2[i]>=0){const m=parts[id[i]].m;put(i,m==='n'?NR[Math.min(4,T2[i]+1)]:ramp(m)[T2[i]]);}
  const OD=outlineRGB(R[1]),OL=arMix(outlineRGB(R[2]),R[0],.45);const edge=new Uint8Array(SZ*SZ);
  const OC={};const oc=m=>{if(OC[m])return OC[m];if(m==='k'||m==='n')return OC[m]=[OD,OL];const r=ramp(m);return OC[m]=[outlineRGB(r[1]),arMix(outlineRGB(r[2]),r[0],.45)];};
  for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const i=y*SZ+x;if(id[i]>=0)continue;let lit=-1,dk=-1;
    if(x+1<SZ&&id[i+1]>=0)lit=id[i+1];if(y+1<SZ&&id[i+SZ]>=0)lit=id[i+SZ];if(x>0&&id[i-1]>=0)dk=id[i-1];if(y>0&&id[i-SZ]>=0)dk=id[i-SZ];
    if(dk>=0){put(i,oc(parts[dk].m)[0]);edge[i]=1;}else if(lit>=0){put(i,oc(parts[lit].m)[1]);edge[i]=2;}}
  g.putImageData(d,0,0);V={c,SZ,id,Z,edge,parts};AR.views.set(key,V);return V;}
const arAsin=x=>{x=x<-1?-1:x>1?1:x;const x2=x*x;return x*(1+x2*(.1667+x2*(.075+x2*.0446)))+(x2>.81?Math.sign(x)*(Math.PI/2-1.2763)*((x2-.81)/.19)**2:0);};
const arMix=(a,b,u)=>[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u];
// ---------------------------------------------------------------- the sleeve you are wearing
function arOutfit(){const L=(typeof S!=='undefined'&&S.look)||{};const ok=h=>/^#[0-9a-f]{6}$/i.test(h||'');const o=L.outfit||'shirt';
  const top=ok(L.shirt)?L.shirt:LOOK_BASE.shirt,ex=ok(L.extra)?L.extra:LOOK_BASE.extra,sk=arSkin(),pat=L.pattern||'';
  const cuff={shirt:'shirt',openshirt:'shirt',vest:'shirt',overalls:'shirt',tee:'tee',tank:'bare',sweater:'knit',turtleneck:'knit',cardigan:'knit',hoodie:'hood',jacket:'coat',longcoat:'coat',skirt:'short',dress:'short'}[o]||'shirt';
  const mat=/^(jacket|longcoat|cardigan)$/.test(o)?'ex':'top';
  return {o,cuff,mat,top,ex,sk,pat,key:[o,top,ex,sk,pat].join('|'),RT:rampRGB(hexRGB(top)),RE:rampRGB(hexRGB(ex)),RS:rampRGB(hexRGB(sk)),RC:[[120,112,100],[170,162,150],[208,202,190],[238,234,226],[252,250,244]]};}
// the arm's radius (cm) s cm up from the wrist: a forearm swelling to the muscle below the elbow, then the upper arm
function arRad(s){const Lf=AR.Lf;if(s<=Lf){const u=s/Lf;return 2.5+1.25*u+.55*Math.pow(Math.sin(Math.PI*Math.max(0,Math.min(1,(u-.38)/.62))),1.4);}const u=Math.min(1.4,(s-Lf)/AR.Lu);return 3.9+.9*u+.3*Math.sin(Math.PI*Math.min(1,u));}
// what covers the arm at s: {m:'S'kin|'T'op|'E'xtra|'C'ream, dr (extra radius), dt (tone step)}
const AR_CL={m:'S',dr:0,dt:0};const arFold=(s,s0,w)=>Math.abs(s-s0)<w;
function arCloth(O,s,ua,lit,inner,bend){const Lf=AR.Lf,sh=Lf+AR.Lu*.48;const r=AR_CL;r.m='S';r.dr=0;r.dt=0;const cl=O.mat==='ex'?'E':'T';
  if(O.cuff==='bare')return r;
  if(O.cuff==='tee'||O.cuff==='short'){const h=O.cuff==='tee'?2.6:1.2;if(s<sh){if(s>sh-1.1)r.dt=-1;return r;}
    r.m='T';r.dr=O.cuff==='tee'?(s<sh+h?.85:.55):.6;if(O.cuff==='tee'&&s<sh+h){if(s<sh+.7)r.dt=1;if(s>sh+h-.6)r.dt=-1;}else if(s<sh+.5)r.dt=1;return r;}
  if(s<1.0)return r;
  if(O.cuff==='shirt'){r.m='T';if(s<4.8){r.dr=.62;if(s<1.4)r.dt=-2;else if(s>4.45)r.dt=-1;}else r.dr=.48+.38*Math.exp(-(((s-6.6)/1.7)**2));}
  else if(O.cuff==='knit'||O.cuff==='hood'){const top=O.cuff==='knit'?6:4.8;r.m=cl;if(s<top){r.dr=O.cuff==='knit'?.3:.18;if(s<1.4)r.dt=-2;else r.dt=(Math.floor((Math.asin(Math.max(-1,Math.min(1,ua)))+3)*arRad(s)/.62)%2)?-1:0;}
    else{r.dr=.5+(O.cuff==='hood'?.85:.45)*Math.exp(-(((s-top-1.6)/1.8)**2));if(s<top+.45)r.dt=-1;}}
  else if(O.cuff==='coat'){if(s<2.6){r.m='T';r.dr=.5;if(s<1.4)r.dt=-2;else if(s>2.25)r.dt=-1;}
    else if(s<7.6){r.m='E';r.dr=1.15;if(s<3.0)r.dt=1;if(s>7.15)r.dt=-1;}
    else{r.m='E';r.dr=.9;}}
  // the folds: two where the sleeve bunches above the cuff, the creases inside a bent elbow, one long one down the upper arm
  if(r.m===cl||r.m==='T'||r.m==='E'){const th=arAsin(ua);const ct=O.cuff==='coat'?7.6:O.cuff==='knit'?6:O.cuff==='hood'?4.8:4.8;
    if(s>ct&&s<ct+8){if(arFold(s,ct+2.1+.9*th,.32)||arFold(s,ct+4.7-.8*th+.4*th*th,.3))r.dt-=1;else if((arFold(s,ct+1.45+.9*th,.28)||arFold(s,ct+4.05-.8*th+.4*th*th,.25))&&lit>0)r.dt+=1;}
    if(bend<150*D2R&&inner>.18){const k=(150*D2R-bend)/(110*D2R);for(const s0 of [Lf-1.7+.5*th,Lf-3.4+.7*th,Lf+1.9-.5*th,Lf+3.5-.4*th])if(arFold(s,s0,.25+.25*k))r.dt-=1;}
    if(s>Lf+6&&arFold(s,Lf+9.5+2.4*th,.3))r.dt-=1;}
  return r;}
function arClothCol(O,m,t,arc,s){if(m==='S')return O.RS[t];if(m==='C')return O.RC[Math.min(4,t+1)];if(m==='K')return O.RE[0];if(m==='E')return O.RE[t];
  // the top keeps its pattern, laid on the sleeve the way the sprite lays it on the shirt (the same eight classes, the same ramp steps)
  const P=.92,cls=((((Math.floor(s/P))%4)+4)%4)<<1|((((Math.floor(arc/P))%4)+4)%4===2?1:0);const d=O.pat?patShift(O.pat,cls):0;return O.RT[Math.max(0,Math.min(4,t-d))];}
// ---------------------------------------------------------------- the arm: forearm from the wrist to the elbow, upper arm from the elbow
// toward its shoulder (off the bottom corner), each a tapering round limb seen in perspective, so the part nearest your eye is the widest.
// Every pixel finds the nearest bone under it, how far round the limb it is, and what the sleeve is there. Kept while the pose holds.
AR.armC=new Map();
// (owner: "remove the arms": the hands float, with only a short wrist and the end of the sleeve, AR.stub cm of it)
AR.stub=6;
function arArmImg(sol,O){const W=sol.W,f=AR.f,Lf=AR.Lf,Lu=AR.Lu,SB=AR.stub;const E=SB?v3.add(W,v3.mul(v3.norm(v3.sub(sol.E,W)),SB)):sol.E,Sh=SB?v3.add(E,v3.mul(v3.norm(v3.sub(sol.E,W)),.01)):sol.Sh;
  const P=[W,E,Sh].map(arProj);const key=O.key+'|'+P.map(p=>Math.round(p[0])+','+Math.round(p[1])).join('|')+'|'+Math.round(sol.bend*12)+'|'+SB;
  let e=AR.armC.get(key);if(e)return e;if(AR.armC.size>48)AR.armC.clear();
  const bis=SB?[0,0,-1]:v3.norm(v3.add(v3.mul(v3.sub(W,E),1/Lf),v3.mul(v3.sub(Sh,E),1/Lu)));
  const bones=(SB?[[W,E,0,SB,P[0],P[1]]]:[[W,E,0,Lf,P[0],P[1]],[E,Sh,Lf,Lf+Lu,P[1],P[2]]]).map(([A,B,s0,s1,pa,pb])=>{const dx=pb[0]-pa[0],dy=pb[1]-pa[1],l=Math.hypot(dx,dy)||1;
    const a3=v3.norm(v3.sub(B,A)),M=v3.lerp(A,B,.5),v=v3.norm(v3.mul(M,-1));let sv=v3.norm(v3.cross(a3,v));const fv=v3.norm(v3.cross(sv,a3));
    const np=[-dy/l,dx/l];let sg=1;if(sv[0]*np[0]+sv[1]*np[1]<0)sg=-1;
    return {A,B,s0,s1,pa,pb,dx:dx/l,dy:dy/l,l,za:A[2],zb:B[2],sv:v3.mul(sv,sg),fv:v3.dot(fv,v)<0?v3.mul(fv,-1):fv};});
  // the limb's width (with what it wears) every quarter centimetre
  const RT=[];for(let s=0;s<=Lf+Lu+.5;s+=.25)RT.push(arRad(s)+arCloth(O,s,0,0,0,sol.bend).dr);const radAt=s=>RT[Math.max(0,Math.min(RT.length-1,Math.round(s*4)))];
  for(const b of bones)b.rm=Math.max(f*(radAt(b.s0)+.5)/Math.max(4,b.za),f*(radAt(b.s1)+.5)/Math.max(4,b.zb),f*(radAt((b.s0+b.s1)/2)+.5)/Math.max(4,(b.za+b.zb)/2))+1;
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const b of bones)for(const [p,z,s] of [[b.pa,b.za,b.s0],[b.pb,b.zb,b.s1]]){const R=f*(radAt(s)+1)/Math.max(4,z)+2;x0=Math.min(x0,p[0]-R);x1=Math.max(x1,p[0]+R);y0=Math.min(y0,p[1]-R);y1=Math.max(y1,p[1]+R);}
  x0=Math.max(-1,Math.floor(x0));y0=Math.max(-1,Math.floor(y0));x1=Math.min(321,Math.ceil(x1));y1=Math.min(181,Math.ceil(y1));const bw=x1-x0,bh=y1-y0;
  if(bw<=0||bh<=0){e={c:null,bx:0,by:0};AR.armC.set(key,e);return e;}
  const N=bw*bh,col=new Uint8ClampedArray(N*3),bo=new Int8Array(N).fill(-1),ZB=new Float32Array(N);
  for(let py=0;py<bh;py++)for(let px=0;px<bw;px++){const X=x0+px+.5,Y=y0+py+.5;let best=-1,bz=1e9,bu=0,bs=0,br=0;
    for(let k=0;k<bones.length;k++){const b=bones[k];const qx=X-b.pa[0],qy=Y-b.pa[1];const pr=qx*b.dx+qy*b.dy,pp=qx*-b.dy+qy*b.dx;if(pp>b.rm||pp<-b.rm||pr<-b.rm||pr>b.l+(SB?0:b.rm))continue;const tau=Math.max(0,Math.min(1,pr/b.l));
      const t3=tau*b.za/(tau*b.za+(1-tau)*b.zb);const z=b.za+t3*(b.zb-b.za);if(z<3)continue;const s=b.s0+t3*(b.s1-b.s0);const rc=radAt(s),R=f*rc/z;
      const cx=qx-tau*b.l*b.dx,cy=qy-tau*b.l*b.dy;const d=Math.hypot(cx,cy);if(d>R||z>=bz)continue;best=k;bz=z;bu=(cx*-b.dy+cy*b.dx)/R;bs=s;br=rc;}
    if(best<0)continue;const b=bones[best],i=py*bw+px;const ua=Math.max(-1,Math.min(1,bu)),w=Math.sqrt(1-ua*ua);
    const n=[ua*b.sv[0]+w*b.fv[0],ua*b.sv[1]+w*b.fv[1],ua*b.sv[2]+w*b.fv[2]];const lit=v3.dot(n,AR.L),inner=v3.dot(n,bis);
    const cl=arCloth(O,bs,ua,lit,inner,sol.bend);let t=lit>.6?4:lit>.26?3:lit>-.1?2:lit>-.48?1:0;t=Math.max(0,Math.min(4,t+cl.dt));
    if(SB){const b0=bones[0],pr0=(X-b0.pa[0])*b0.dx+(Y-b0.pa[1])*b0.dy;if(pr0>b0.l-1.3)t=Math.max(0,Math.min(t,1)-1);}   // the open end's rim
    const c=arClothCol(O,cl.m,t,arAsin(ua)*br,bs);col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];bo[i]=best;ZB[i]=bz;}
  const c=document.createElement('canvas');c.width=bw;c.height=bh;const g=c.getContext('2d'),d=g.createImageData(bw,bh),D=d.data;
  for(let i=0;i<N;i++)if(bo[i]>=0){let r=col[i*3],gg=col[i*3+1],bb=col[i*3+2];
    // where the nearer bone passes over the farther one (the elbow), a dark seam on the far one
    const x=i%bw,y=(i/bw)|0,bi=bo[i],zi=ZB[i]-1.2;const sea=j=>bo[j]>=0&&bo[j]!==bi&&ZB[j]<zi;
    if((x+1<bw&&sea(i+1))||(x>0&&sea(i-1))||(y+1<bh&&sea(i+bw))||(y>0&&sea(i-bw))){r*=.62;gg*=.6;bb*=.64;}
    D[i*4]=r;D[i*4+1]=gg;D[i*4+2]=bb;D[i*4+3]=255;}
  // the outline: dark on the side away from the light, softer toward it
  for(let y=0;y<bh;y++)for(let x=0;x<bw;x++){const i=y*bw+x;if(bo[i]>=0)continue;let lit=-1,dk=-1;
    if(x+1<bw&&bo[i+1]>=0)lit=i+1;if(y+1<bh&&bo[i+bw]>=0)lit=i+bw;if(x>0&&bo[i-1]>=0)dk=i-1;if(y>0&&bo[i-bw]>=0)dk=i-bw;
    const j=dk>=0?dk:lit;if(j<0)continue;const k=dk>=0?.3:.55;D[i*4]=col[j*3]*k+8*(1-k);D[i*4+1]=col[j*3+1]*k+4*(1-k);D[i*4+2]=col[j*3+2]*k+10*(1-k);D[i*4+3]=255;}
  g.putImageData(d,0,0);e={c,bx:x0,by:y0};AR.armC.set(key,e);return e;}

// ---------------------------------------------------------------- the grip: every making game's hand comes through here (m4grip)
// x, y: where the hand holds (the handle's centre); ang: the way the handle runs on the picture; o.side: which way the thumb goes round it;
// o.kind: power (default), pinch, hook, palm, point; o.armSide (or the old o.arm's lean): which arm, right (1) or left (-1)
AR.on=true;AR.frameT=-1;AR.tick=0;AR.used=new Map();(function arTick(){AR.tick++;requestAnimationFrame(arTick);})();
function arGrip(K,x,y,ang,o){o=o||{};(M4G.fr||(M4G.fr=[])).push([x,y]);
  let arm=o.arm!=null?o.arm:M4G.arm!=null?M4G.arm:ang+.5;M4G.arm=null;const as=o.armSide||(Math.cos(arm)>=0?1:-1),left=as<0;
  const kind=AR_GRIP[o.kind]?o.kind:'power';const dy=K.dy||0,sx=x,sy=y+dy;
  // one hand per arm per frame keeps its own pose from the last frame (so it moves, never jumps)
  const now=performance.now();if(AR.tick!==AR.frameT){AR.frameT=AR.tick;AR.used.clear();}const n=(AR.used.get(as)||0);AR.used.set(as,n+1);
  const sk=as+'|'+n,st=AR.st.get(sk);const keep=st&&now-st.t<400&&st.kind===kind;
  // how far away the hand is can't be read off a flat picture: it is put where its arm is comfortably bent (about 4/5 of its reach),
  // no nearer than 42 cm and no farther than the bench (so the hand stays the size of the tools it holds)
  let zz=arZ(sy);{const S0=AR.SH[as],d=v3.norm([(sx-AR.cx)/AR.f,(sy-AR.cy)/AR.f,1]),b=v3.dot(d,S0),h=b*b-v3.dot(S0,S0)+44*44;if(h>0)zz=Math.min(zz,(b+Math.sqrt(h))*d[2]);zz=Math.max(42,Math.min(62,zz));}
  const G=arWorld(sx,sy,zz);const J={G,hb:[Math.cos(ang),Math.sin(ang),0],kind,left,side:o.side||1,S0:AR.SH[as],prev:keep?st.p:null,full:!keep};
  let sol=arSolve(J);AR.st.set(sk,{p:sol.p,t:now,kind});
  const O=arOutfit();const g=K.g;
  const q=arQuant(sol.R,left),sc=Math.round(AR.f/G[2]*10)/10;const V=arHandView(kind,left,q.R,q.k,sc,O.sk);
  {const off=(AR_GRIP[kind]||AR_GRIP.power).off,R=q.R;const wx=-(R.F[0]*off[0]+R.T[0]*off[1]+R.N[0]*off[2]),wy=-(R.F[1]*off[0]+R.T[1]*off[1]+R.N[1]*off[2]);
    const pw=[sx+wx*sc,sy+wy*sc],z=sol.W[2];sol=Object.assign({},sol,{W:[(pw[0]-AR.cx)*z/AR.f,(pw[1]-AR.cy)*z/AR.f,z]});}
  if(!(o.fpOff&&o.armLen===0)){const a=arArmImg(sol,O);if(a.c)g.drawImage(a.c,a.bx,a.by-dy);}
  g.drawImage(V.c,Math.round(sx-V.SZ/2),Math.round(sy-V.SZ/2)-dy);
  if(window.__handLog)(M4G.seen||(M4G.seen=[])).push([x,y,now,Math.round(v3.len(v3.sub(sol.W,sol.E))),Math.round(sol.bend/D2R),as,Math.round(sol.fl),Math.round(sol.de),Math.round(sol.lean*10)/10]);
  if(window.__arDbg){J.dbg=1;J.tr=[];arEval(J,sol.p);window.__arDbg.push({x:Math.round(x),y:Math.round(y),ang:+ang.toFixed(2),o:JSON.stringify(o),kind,as,full:!keep,tr:J.tr});if(window.__arDbg.length>40)window.__arDbg.shift();}
  AR.last=sol;}
if(typeof m4grip!=='undefined'){AR.old=m4grip;m4grip=function(K,x,y,ang,o){if(!AR.on)return AR.old(K,x,y,ang,o);try{arGrip(K,x,y,ang,o);}catch(e){AR.on=false;console.warn('arms',e);AR.old(K,x,y,ang,o);}};}
// ================================================================ held tools: the tool is a 3D object in the hand's own frame, drawn in
// the same picture as the hand (fingers in front of the handle, the handle into the fist and out of the other side). The body moves
// the tool: a game gives where the tool's working end is and which way it faces, the hand follows from the grip, the forearm from the
// wrist's range, the elbow and shoulder from the bones.
// you stand at the bench and look down at the work (about 24 degrees): "down" in the picture's own 3D is down and a little away
let AR_HCAM;AR.pitch=24*Math.PI/180;AR.down=[0,Math.cos(AR.pitch),Math.sin(AR.pitch)];AR.fwd=[0,-Math.sin(AR.pitch),Math.cos(AR.pitch)];
// where a point on the picture lies on a level surface h cm below the eye (a bench top, a floor)
AR_HCAM={f:170,cx:160,cy:60,pitch:30*Math.PI/180};
function arCam(c){if(c){AR._cam=[AR.f,AR.cx,AR.cy,AR.down,AR.fwd];AR.f=c.f;AR.cx=c.cx;AR.cy=c.cy;AR.down=[0,Math.cos(c.pitch),Math.sin(c.pitch)];AR.fwd=[0,-Math.sin(c.pitch),Math.cos(c.pitch)];}
  else if(AR._cam){[AR.f,AR.cx,AR.cy,AR.down,AR.fwd]=AR._cam;AR._cam=null;}}
const arOnLevel=(sx,sy,h)=>{const d=[(sx-AR.cx)/AR.f,(sy-AR.cy)/AR.f,1];const t=h/Math.max(.05,v3.dot(d,AR.down));return v3.mul(d,t);};
const arRGB=a=>a.map(h=>[1,3,5].map(o=>parseInt(h.slice(o,o+2),16)));
const AR_MAT={w:arRGB(['#4a2e14','#7a5228','#a87a44','#cfa266','#e8c890']),     // hickory handle
  s:arRGB(['#25272e','#474b55','#717784','#a3a9b4','#dce0e6']),                  // forged steel
  d:arRGB(['#17171c','#2a2c33','#41444c','#5c6068','#7c8088'])};                 // the dark steel of a wedge, a claw's throat
// the power grip's handle line in the hand's frame (see arFrame: the butt runs out of the heel, b = 0.7): u toward the head, v the
// face's way (out past the knuckles), the third axis out of the palm
const AR_PG={b:.7};AR_PG.u=[Math.sin(AR_PG.b),Math.cos(AR_PG.b),0];AR_PG.v=[Math.cos(AR_PG.b),-Math.sin(AR_PG.b),0];
const arHP=(u,v,w=0)=>{const P=AR_GRIP.power.off,U=AR_PG.u,V=AR_PG.v;return [P[0]+U[0]*u+V[0]*v,P[1]+U[1]*u+V[1]*v,P[2]+w];};
const AR_TOOLS={
  // a claw hammer: a 30 cm hickory handle held near its end, a forged head with a round face and a split claw
  hammer:{kind:'power',reach:23,face:4.6,parts:()=>{const P=[];const cap=(a,b,r,m)=>P.push({t:0,a,b,r,m});const ell=(c,ax,m)=>P.push({t:1,c,ax,m});
    const U=AR_PG.u,V=AR_PG.v,W=[0,0,1],sc=(d,k)=>d.map(x=>x*k);
    cap(arHP(-6,0,0),arHP(21.5,0,0),1.2,'w');ell(arHP(-5.4,0,0),[sc(U,1.1),sc(V,1.6),sc(W,1.5)],'w');     // the handle, its butt flared
    ell(arHP(19,0,0),[sc(U,2.2),sc(V,1.5),sc(W,1.35)],'w');                                                // the swell under the head
    cap(arHP(23,-3,0),arHP(23,3.7,0),1.5,'s');ell(arHP(23,4.3,0),[sc(U,1.85),sc(V,.55),sc(W,1.85)],'s');  // the head, its round face
    ell(arHP(23,1,0),[sc(U,1.75),sc(V,.9),sc(W,1.7)],'s');ell(arHP(24.6,0,0),[sc(U,.45),sc(V,1.1),sc(W,.95)],'d'); // the cheek, the wedge
    for(const w of [-.6,.6]){cap(arHP(23,-2.6,w),arHP(22,-5,w),.62,'s');cap(arHP(22,-5,w),arHP(20.3,-6.6,w),.45,'s');}   // the claw
    return P;}}};
// the frame of a hand that holds a tool whose head lies along u from the grip and faces v (both unit, at right angles)
function arToolFrame(u,v,left){const U=AR_PG.u,V=AR_PG.v;const F=v3.norm(v3.add(v3.mul(u,U[0]),v3.mul(v,V[0]))),T=v3.norm(v3.add(v3.mul(u,U[1]),v3.mul(v,V[1])));
  return {F,T,N:left?v3.cross(F,T):v3.cross(T,F)};}
// the forearm for a hand already placed: searched inside the wrist's range for the elbow and shoulder that sit best
function arArmFor(W,R,as,prev){const S0=AR.SH[as],left=as<0;let best=null;
  const ev=(th,de)=>{const A=v3.norm(v3.add(v3.add(v3.mul(R.F,-Math.cos(th)*Math.cos(de)),v3.mul(R.N,Math.sin(th))),v3.mul(R.T,Math.sin(de))));
    const E=v3.add(W,v3.mul(A,AR.Lf));const Sh=v3.add(E,v3.mul(v3.norm(v3.sub(S0,E)),AR.Lu));const lean=v3.len(v3.sub(Sh,S0));
    const U=v3.norm(v3.sub(Sh,E));const bend=Math.acos(Math.max(-1,Math.min(1,v3.dot(U,A))));
    const fl=th/D2R,dv=de/D2R;let c=lean*lean/30+1.6*((fl>0?fl/AR_LIM.flex:fl/AR_LIM.ext)**2+(dv>0?dv/AR_LIM.rad:dv/AR_LIM.uln)**2);
    if(bend<45*D2R)c+=8*(45*D2R-bend);
    const SW=v3.norm(v3.sub(W,Sh)),pr=v3.add(Sh,v3.mul(SW,v3.dot(v3.sub(E,Sh),SW))),o=v3.sub(E,pr);const pole=v3.norm(v3.add(AR.down,[left?-.4:.4,0,0]));const ol=v3.len(o);if(ol>1.5)c+=2.4*(1-v3.dot(o,pole)/ol);
    const ey=AR.cy+AR.f*E[1]/Math.max(4,E[2]),ex=AR.cx+AR.f*E[0]/Math.max(4,E[2]);if(ey<150)c+=.5*((150-ey)/40)**2;if(E[2]<26)c+=((26-E[2])/4.5)**2;const sx=ex<-6?-6-ex:ex>326?ex-326:0;if(sx>0&&ey<175)c+=1.2*(sx/30)**2;
    if(prev)c+=3*((th-prev[0])**2+(de-prev[1])**2);
    if(!best||c<best.c)best={c,W,A,E,Sh,lean,bend,fl,de:dv,th,dr:de,R};};
  if(prev)ev(prev[0],prev[1]);else for(let th=-60;th<=66;th+=14)for(let de=-28;de<=18;de+=11.5)ev(th*D2R,de*D2R);
  let st=prev?[.06,.05]:[.12,.09];for(let it=0;it<(prev?4:8);it++){const b=best;let mv=false;for(const [dt,dd] of [[st[0],0],[-st[0],0],[0,st[1]],[0,-st[1]]]){const th=Math.max(-AR_LIM.ext*D2R,Math.min(AR_LIM.flex*D2R,b.th+dt)),de=Math.max(-AR_LIM.uln*D2R,Math.min(AR_LIM.rad*D2R,b.dr+dd));ev(th,de);if(best!==b)mv=true;}if(!mv)st=st.map(v=>v/2);}
  best.p=[best.th,best.dr];return best;}
// draw a held tool and the arm that holds it. G: the grip point (cm, camera); u: from the grip toward the tool's head; v: the way its
// working face looks; as: which arm (1 right, -1 left); key: this hand's own memory from frame to frame
function arHold(K,tool,G,u,v,as,key){const TL=AR_TOOLS[tool],left=as<0,dy=K.dy||0,g=K.g;
  v=v3.norm(v3.sub(v,v3.mul(u,v3.dot(v,u))));const R=arToolFrame(u,v,left);
  const off=AR_GRIP[TL.kind].off;const W=v3.sub(G,v3.add(v3.add(v3.mul(R.F,off[0]),v3.mul(R.T,off[1])),v3.mul(R.N,off[2])));
  const now=performance.now(),st=AR.st.get(key);const sol=arArmFor(W,R,as,st&&now-st.t<400?st.p:null);AR.st.set(key,{p:sol.p,t:now});
  const O=arOutfit();const q=arQuant(R,left),sc=Math.round(AR.f/G[2]*10)/10;const V=arHandView(TL.kind,left,q.R,q.k,sc,O.sk,tool);
  const pg=arProj(G);{const wx=-(q.R.F[0]*off[0]+q.R.T[0]*off[1]+q.R.N[0]*off[2]),wy=-(q.R.F[1]*off[0]+q.R.T[1]*off[1]+q.R.N[1]*off[2]);const z=sol.W[2];
    sol.W=[(pg[0]+wx*sc-AR.cx)*z/AR.f,(pg[1]+wy*sc-AR.cy)*z/AR.f,z];}
  const a=arArmImg(sol,O);if(a.c)g.drawImage(a.c,a.bx,a.by-dy);
  g.drawImage(V.c,Math.round(pg[0]-V.SZ/2),Math.round(pg[1]-V.SZ/2)-dy);AR.lastHold=sol;return sol;}
// a rotation of p about the axis k (unit) by t
const arRot=(p,k,t)=>{const c=Math.cos(t),s=Math.sin(t),d=v3.dot(k,p);return v3.add(v3.add(v3.mul(p,c),v3.mul(v3.cross(k,p),s)),v3.mul(k,d*(1-c)));};
// ---------------------------------------------------------------- the hammer game, held. The face lands square on the nail's head; the
// handle runs back from the head toward your right hand and a little into the room; raising it turns the wrist up (cocking, inside its
// 20 degrees) and the rest at the elbow; on the way down the head leads and the wrist snaps through. The other hand holds the nail under
// its head while it stands tall, then moves clear and lays flat on the board.
const HOLD4={hammer(K,o){const {st,n,top,TOP,X0}=o;const TL=AR_TOOLS.hammer;arCam(AR_HCAM);try{
  // the nail stands on the bench top, 50 cm below the eye; its head is where the face lands
  const dy=K.dy||0;const base=arOnLevel(n.x,TOP+6+dy,50),N=arWorld(n.x,top+dy,base[2]);   // (the scene is drawn shifted by dy)
  // the strike: the face square on the nail (looking straight down), the handle level. It runs from the fist toward the head along
  // the line from your shoulder to the nail, turned 35 degrees to the left, as a forearm and a cocked wrist hold it
  const v=AR.down.slice(),S0=AR.SH[1];let h=v3.sub(N,S0);h=v3.norm(v3.sub(h,v3.mul(v,v3.dot(h,v))));const u=arRot(h,v3.mul(v,-1),.6);
  const Hc=v3.sub(N,v3.mul(v,TL.face));let G=v3.sub(Hc,v3.mul(u,TL.reach));
  // the swing: about the axis across the swing plane; the wrist cocks up to 0.4 rad of it, the arm (about the elbow) turns the rest
  const ax=v3.norm(v3.cross(u,v)),th=Math.max(-.12,st.ang*.9),tw=Math.max(-.1,Math.min(.4,th*.45)),ta=th-tw;
  const piv=v3.add(G,v3.add(v3.mul(u,-22),v3.mul(AR.down,-6)));
  const rot=p=>arRot(p,ax,-ta);G=v3.add(piv,rot(v3.sub(G,piv)));let uu=rot(u),vv=rot(v);uu=arRot(uu,ax,-tw);vv=arRot(vv,ax,-tw);
  const lift=st.move>0?Math.sin(Math.PI*Math.min(1,st.move))*3:0;G=v3.add(G,v3.mul(AR.down,-lift-(st.kick||0)*.4));
  // while you line up a blow, the pictures of the whole swing are drawn in idle moments (so the first swing doesn't stutter on a phone)
  if(st.ph==='ready'&&HOLD4._warm!==n){HOLD4._warm=n;const G0=v3.sub(Hc,v3.mul(u,TL.reach)),cam=AR_HCAM,sk=arOutfit().sk,todo=[];
    for(let t=-.1;t<=1.3;t+=.08)todo.push(t);
    const step=dl=>{arCam(cam);try{while(todo.length&&(!dl||dl.timeRemaining()>5)){const t=todo.shift(),w=Math.max(-.1,Math.min(.4,t*.45)),a=t-w;
        const Gt=v3.add(piv,arRot(v3.sub(G0,piv),ax,-a)),R=arToolFrame(arRot(u,ax,-t),arRot(v,ax,-t),false),q=arQuant(R,false);
        arHandView('power',false,q.R,q.k,Math.round(AR.f/Gt[2]*10)/10,sk,'hammer');if(!dl)break;}}finally{arCam(null);}
      if(todo.length)(window.requestIdleCallback||(f=>setTimeout(()=>f(null),30)))(step);};
    (window.requestIdleCallback||(f=>setTimeout(()=>f(null),30)))(step);}
  // the other hand first (it is under the hammer on screen)
  // (it steadies a new nail for the first tap only, pinched low on its shank, and is out of the way before the head comes down)
  if(!n.hits&&(st.ph==='ready'||st.ph==='raise')&&!st.move){m4grip(K,n.x-2,top+Math.max(4,n.h*.6),-.6,{side:1,kind:'pinch',armSide:-1});}
  else m4grip(K,Math.max(X0+14,n.x-30),TOP+5,Math.PI,{kind:'palm',side:-1,armSide:-1});
  arHold(K,'hammer',G,uu,vv,1,'hammer');}finally{arCam(null);}return true;}};
