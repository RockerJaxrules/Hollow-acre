// ================================================================ t366 (the patch after): one wind, and the sky's particles live in the world
// What falls or drifts, before: the storm's rain lived in the world (rain366.js); a day's rain was streaks slid across the screen
// (routines.js); snow, spring blossom and summer fireflies were dots slid across the screen (seasons.js); the night fog was a
// texture sliding at seven tenths of the camera's speed; falling leaves (place.js) and the crash's debris in the drive already lived
// in the world. Now every one of them has a place in the world and a height above it, moves with the ground when the view moves,
// and is blown by one wind: a steady breeze from the west with gusts, the same for the rain's slant, the drifting snow and
// petals, the leaves, and the fog. A day's rain is the storm's rain, thinner. Each kind is a few same-coloured rectangles per
// particle, worked out once a frame into fixed pools, and thinned with the rain when frames run long.

// ---- the wind: metres a second toward the east, a breeze with gusts that build and die over several seconds
const WIND={vx:1.1,g:0,t:-1,fog:0,lt:0};
function windNow(t){if(WIND.t===t)return WIND;WIND.t=t;const g=Math.max(0,(Math.sin(t*.31)+Math.sin(t*.17+1.3)*.6+Math.sin(t*.53+2.1)*.3-.55)/1.35);
  WIND.g=Math.min(1,g);WIND.vx=1.1+2.3*WIND.g;const dt=WIND.lt?Math.min(.1,t-WIND.lt):0;WIND.lt=t;WIND.fog+=WIND.vx*dt*PPM*.45;return WIND;}

// ---- rain: the storm's one rain also falls on a rainy day (thinner, as the day's rain comes and goes), slanted by the wind
{const _on=r366On;r366On=function(){if(_on())return true;try{return !!(!S.room&&(S.mode==='play'||S.mode==='cine')&&typeof rainNow==='function'&&rainNow()&&fx60RainK()>0);}catch(e){return false;}};}
{const _fr=r366Frame;r366Frame=function(t){if(R366.fr===FRAME_NO)return;const w=windNow(t);R366.W=Math.round(w.vx*R366.FALL/R366.rate*PPM);
  const storm=S.storm&&isNight();R366.k=storm?1:Math.max(0,Math.min(1,fx60RainK()))*.9;_fr(t);};}
// (the day's own streaks are gone from routines.js; its grey sky and quieter rooms stay)

// ---- the season's sky: snow, petals, fireflies, each at a place in the world
const WX={N:0,max:700,x:new Float32Array(700),y:new Float32Array(700),a:new Float32Array(700),s:new Uint8Array(700),fr:-1,kind:''};
function wxGround(x,z){return typeof r366G==='function'?r366G(x,z):1;}
// snow: a flake per patch, falling slowly, drifting with the wind and swaying, lying a moment where it lands (not under a roof)
// petals: fewer, lighter, swaying more; fireflies: hanging in the air by a patch of ground, wandering, blinking
function wxFrame(t,kind){if(WX.fr===FRAME_NO&&WX.kind===kind)return;WX.fr=FRAME_NO;WX.kind=kind;const w=windNow(t);
  const C=kind==='snow'?1.6:kind==='petal'?3.2:3.4,H=kind==='snow'?150:kind==='petal'?110:0,P=kind==='snow'?5.5:6.5,FALL=.84;
  const left=(cam.px-(VW>>1))/PPM,top=(cam.pz-Math.round(VH*.56))/PPM,drift=w.vx*P*FALL*PPM*(kind==='snow'?.8:1);
  const i0=Math.floor((left-drift/PPM)/C)-1,i1=Math.floor((left+VW/PPM)/C)+1,j0=Math.floor(top/C)-1,j1=Math.floor((top+(VH+H)/PPM)/C)+1;let n=0;const dens=typeof R366!=='undefined'?R366.dens:1;
  for(let i=i0;i<=i1&&n<WX.max;i++)for(let j=j0;j<=j1&&n<WX.max;j++){if(hash(i*3+11,j*7+2)>dens)continue;
    if(kind==='fly'){const cx=(i+.5)*C,cz=(j+.5)*C,ph=hash(i,j)*6.28;const x=cx+Math.sin(t*.6+ph)*1.1,z=cz+Math.cos(t*.5+ph*1.3)*.8,h=14+Math.sin(t*.9+ph)*8;
      WX.x[n]=sx(x);WX.y[n]=sz(z)-h;WX.a[n]=.35+.65*Math.max(0,Math.sin(t*2.3+ph*3));WX.s[n]=2;n++;continue;}
    const ph=t/P+hash(i*7+3,j*13+5),c=Math.floor(ph),f=ph-c,q=Math.floor(hash(i*31+c,j*17+c*5)*16);const x=(i+((q&3)+.5)/4)*C,z=(j+((q>>2)+.5)/4)*C;
    if(f<FALL){const r=1-f/FALL;const sway=Math.sin(t*(kind==='snow'?1.3:2.1)+q)*(kind==='snow'?3:7);WX.x[n]=sx(x)-drift*r+sway;WX.y[n]=sz(z)-H*r;WX.a[n]=1;WX.s[n]=kind==='snow'&&hash(i,j+c)<.25?2:1;}
    else{if(!wxGround(x,z))continue;WX.x[n]=sx(x);WX.y[n]=sz(z);WX.a[n]=f<.93?.8:.4;WX.s[n]=kind==='snow'?3:4;}   // lying: 3 = a flake, 4 = a petal
    n++;}
  WX.N=n;}
function wxDraw(t){if(S.room||S.mode==='title')return false;const sea=outdoorSeason(),night=isNight();
  const kind=sea==='winter'?'snow':sea==='spring'&&!night?'petal':sea==='summer'&&night?'fly':'';if(!kind)return false;wxFrame(t,kind);
  const g=ctx2,N=WX.N,X=WX.x,Y=WX.y,A=WX.a,Z=WX.s;const dk=typeof NIGHT!=='undefined'&&NIGHT.dk>0?NIGHT.dk:0;
  if(kind==='snow'){g.save();g.globalAlpha=1-.8*dk;   // (in the dark, snow is seen where a light falls; night362's rule, kept)
    g.fillStyle='rgba(240,244,250,.85)';for(let n=0;n<N;n++){if(Z[n]>2||A[n]<1)continue;const s=Z[n];g.fillRect(Math.round(X[n]),Math.round(Y[n]),s,s);}
    g.fillStyle='rgba(240,244,250,.6)';for(let n=0;n<N;n++){if(Z[n]!==3)continue;g.fillRect(Math.round(X[n])-1,Math.round(Y[n]),A[n]>.5?3:2,1);}g.restore();}
  else if(kind==='petal'){for(let n=0;n<N;n++){g.fillStyle=n%3?'rgba(244,190,206,.9)':'rgba(255,236,242,.9)';const x=Math.round(X[n]),y=Math.round(Y[n]);
      if(Z[n]===4){if(A[n]>.5)g.fillRect(x,y,2,1);else g.fillRect(x,y,1,1);}else g.fillRect(x,y,2,1);}}
  else{for(let n=0;n<N;n++){g.fillStyle=`rgba(232,255,140,${A[n].toFixed(2)})`;g.fillRect(Math.round(X[n]),Math.round(Y[n]),2,2);}}
  return true;}
{const _ss=seasonSky;seasonSky=function(dt,t){try{if(wxDraw(performance.now()/1000))return;}catch(e){}return _ss.apply(this,arguments);};}

// ---- leaves: blown by the same wind as they fall, and a strong gust slides the ones lying on the ground a little further
{const _lu=leavesUpdate;leavesUpdate=function(dt){_lu(dt);const w=windNow(performance.now()/1000);
  for(const L of LEAVES){if(L.h>0)L.x+=dt*(w.vx*.22-.12);else if(w.g>.55&&L.land<4)L.x+=dt*(w.g-.55)*.9;}};}
