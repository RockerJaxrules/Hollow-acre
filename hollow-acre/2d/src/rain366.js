// ================================================================ t366: one rain for a storm night (the drive in, and the storms after)
// Every drop falls to a spot on the ground and splashes exactly there, in the same slant and colour: the rain's own first
// grey-blue (owner: not the bright blue), the splash a shade lighter. The other storm rains (a second set of streaks in another
// wind, a third drawn as glints, rings at random places on the screen, the drive's sideways speed rain) are gone. The drops are
// drawn over everything; the splashes with the ground, so a roof, a tree or a cart in front hides them, and none land inside a
// building, a tree, a fence or a prop. Steady rain, not a curtain (owner: "too many, and they lag"): one drop per patch of ground,
// every one a few plain rectangles of one colour, worked out once a frame into a fixed pool, and fewer still when frames run long.
const R366_INK='rgba(170,190,220,.42)',R366_SPL='rgba(184,202,228,.55)',R366_SPL2='rgba(184,202,228,.28)';
const R366={C:1.7,FALL:.74,H:200,W:26,rate:1.7,cache:new Map(),N:0,max:900,x:new Float32Array(900),y:new Float32Array(900),f:new Float32Array(900),g:new Uint8Array(900),fr:-1,
  dens:(()=>{try{return matchMedia('(pointer:coarse)').matches?.7:1;}catch(e){return 1;}})(),ft:16.7,last:0};
function r366On(){try{return !!(S.storm&&isNight()&&!S.room&&(S.mode==='play'||S.mode==='cine'));}catch(e){return false;}}
// what's at a landing place (open ground 1, water 2, under something 0), asked once per place (numeric keys: nothing made per frame)
function r366G(x,z){const key=(Math.round(x*8)+262144)*524288+(Math.round(z*8)+262144);let g=R366.cache.get(key);
  if(g===undefined){g=fx60Solid(x,z)?0:(LAYERS.water(x,z)?2:1);if(R366.cache.size>6000)R366.cache.clear();R366.cache.set(key,g);}return g;}
// the frame's drops, once: where each lands on the screen and how far through its fall or splash it is. When frames run long a
// steady share of the patches go dry (and come back slowly when frames are quick again); a phone starts with fewer
function r366Frame(t){if(R366.fr===FRAME_NO)return;R366.fr=FRAME_NO;const now=performance.now();if(R366.last){const d=Math.min(100,now-R366.last);R366.ft=R366.ft*.94+d*.06;
    if(R366.ft>20)R366.dens=Math.max(.3,R366.dens-.01);else if(R366.ft<17.5)R366.dens=Math.min(1,R366.dens+.002);}R366.last=now;
  const C=R366.C,left=(cam.px-(VW>>1))/PPM,top=(cam.pz-Math.round(VH*.56))/PPM;
  const i0=Math.floor(left/C)-1,i1=Math.floor((left+(VW+R366.W)/PPM)/C)+1,j0=Math.floor(top/C)-1,j1=Math.floor((top+(VH+R366.H)/PPM)/C)+1;let n=0;
  for(let i=i0;i<=i1&&n<R366.max;i++)for(let j=j0;j<=j1&&n<R366.max;j++){if(hash(i*5+1,j*11+7)>R366.dens)continue;
    const ph=t*R366.rate+hash(i*7+3,j*13+5),c=Math.floor(ph),q=Math.floor(hash(i*31+c,j*17+c*5)*16);
    const x=(i+((q&3)+.5)/4)*C,z=(j+((q>>2)+.5)/4)*C;R366.x[n]=sx(x);R366.y[n]=sz(z);R366.f[n]=ph-c;R366.g[n]=r366G(x,z);n++;}
  R366.N=n;}
// the drops: a five-pixel streak above where each will land, slanting the way it falls (two rectangles, one colour)
function r366Drops(t){r366Frame(t);const N=R366.N,X=R366.x,Y=R366.y,F=R366.f;ctx2.fillStyle=R366_INK;
  for(let n=0;n<N;n++){const f=F[n];if(f>=R366.FALL)continue;const r=1-f/R366.FALL;const x=Math.round(X[n]-R366.W*r),y=Math.round(Y[n]-R366.H*r);if(x<-6||x>VW+6||y<-6||y>VH+2)continue;
    ctx2.fillRect(x,y-2,1,3);ctx2.fillRect(x-1,y-4,1,2);}}
// the splashes, every other drop's: a small pixel ring that opens where it landed (wider on water) and fades in two steps
function r366Ground(t){r366Frame(t);const N=R366.N,X=R366.x,Y=R366.y,F=R366.f,G=R366.g;
  for(let pass=0;pass<2;pass++){ctx2.fillStyle=pass?R366_SPL2:R366_SPL;
    for(let n=0;n<N;n++){const f=F[n];if(f<R366.FALL||!G[n]||(n&1))continue;const p=(f-R366.FALL)/(1-R366.FALL);if((p>=.5)!==(pass===1))continue;
      const x=Math.round(X[n]),y=Math.round(Y[n]);if(x<-6||x>VW+6||y<-4||y>VH+4)continue;const w=Math.round((1+p*4)*(G[n]===2?1.5:1));
      ctx2.fillRect(x-w,y,1,1);ctx2.fillRect(x+w,y,1,1);ctx2.fillRect(x-1,y-1,2,1);ctx2.fillRect(x-1,y+1,2,1);if(w>2){ctx2.fillRect(x-w+1,y-1,1,1);ctx2.fillRect(x+w-1,y+1,1,1);}}}}
// the ground pass: a storm night's splashes are these (a day's rain keeps its own rings)
{const _g=fx60RainGround;fx60RainGround=function(t){if(r366On()){try{r366Ground(t);}catch(e){}return;}return _g.apply(this,arguments);};}
// the screen pass: the drops, and none of the older storm rains under them
{const _ms=mindScreen;mindScreen=function(t){if(!r366On())return _ms.apply(this,arguments);try{r366Drops(performance.now()/1000);}catch(e){}
  S.storm=false;try{return _ms.apply(this,arguments);}finally{S.storm=true;}};}
setInterval(()=>{R366.cache.clear();},8000);
