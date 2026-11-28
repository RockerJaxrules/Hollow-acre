/* ================= the new ending: the drive up the mountain (t346) =================
   After the goodbye, the car is seen driving up a mountain road into a blizzard; the screen fades to black and the game
   turns first person and realistic (Part 2, in Unreal). A pixel cutscene in the game's own style:
     1. (0-7 s)  wide: the mountain at night, the car's lights crawling up the switchbacks, snow blowing across;
     2. (7-15.5) alongside the car (the player's beaten sedan, st37Sedan) on the snowy road under the cliff, the blizzard
        thickening to a white-out; the car drives on into it; a dithered fade to black.
   endingDriveFrame(t, car) renders time t (seconds) into a 320 x 180 RGBA buffer and returns it; `car` is the sedan's
   ImageData (st37Sedan({primer:1,ham:1,glass:'clear',dull:1,steel:1,rust:1})). Seeded, so a frame is always the same
   frame (the video capture and the game agree). Hard pixels only: flat colour steps for fog and light, ordered dither
   only between the steps and for the fades (DESIGN_GUIDE: hard alpha, dithering restraint). */
const ENDING_DRIVE={W:320,H:180,LEN:15.5,CUT:7,FADE:[13.8,15.2]};

function edRng(seed){return function(){seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const ED_BAYER=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const edB=(x,y)=>ED_BAYER[((y|0)&3)*4+((x|0)&3)];
const edC=h=>{const n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255];};
const edHash=(i,j,s)=>{let h=Math.imul(i,374761393)+Math.imul(j,668265263)+Math.imul(s,2246822519);h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296;};
function edN2(x,y,s){const i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);
  const a=edHash(i,j,s),b=edHash(i+1,j,s),c=edHash(i,j+1,s),d=edHash(i+1,j+1,s);return(a*(1-u)+b*u)*(1-v)+(c*(1-u)+d*u)*v;}
function edF2(x,y,s,o){let v=0,a=.5,n=0;for(let k=0;k<(o||4);k++){v+=edN2(x*(1<<k),y*(1<<k),s+k*31)*a;n+=a;a*=.5;}return v/n;}
const edF1=(x,s,o)=>edF2(x,.5,s,o);
const edMix=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
// a smooth amount (0-1) in four flat steps, dithered only across each step's edge
const edStep=(k,x,y)=>{const q=Math.max(0,Math.min(1,k))*4,f=Math.floor(q);return Math.min(4,f+(edB(x,y)<q-f?1:0))/4;};

// the palette: cool, desaturated night; snow lit blue-grey; one warm light (the headlights), one red (the tail lamps)
const EDP={sky0:edC('#070b16'),sky1:edC('#0c1322'),sky2:edC('#131c30'),moon:edC('#1e2840'),
  farSnow:edC('#4a5878'),farShade:edC('#323d5a'),farRock:edC('#222a40'),
  rock:edC('#121722'),rockHi:edC('#1c2332'),snowD:edC('#323c54'),snow:edC('#46526c'),snowHi:edC('#66738e'),
  pine:edC('#081010'),pineHi:edC('#10201f'),pineSnow:edC('#8a98b2'),pineSnowD:edC('#4e5c78'),
  road:edC('#525e78'),roadHi:edC('#6a7690'),rut:edC('#3c4660'),bank:edC('#6e7a94'),bankHi:edC('#96a2ba'),bankD:edC('#3e4a64'),
  lit:edC('#dfe6f0'),litWarm:edC('#f2eac8'),flakeFar:edC('#566482'),flake:edC('#aebad0'),flakeLit:edC('#ffffff'),
  fog:edC('#5c6880'),fogHi:edC('#7a86a0'),pole:edC('#c4602a'),poleD:edC('#7a3a18'),poleBand:edC('#e0e2dc'),
  tail:edC('#c8281e'),tailGlow:edC('#4a1220'),smoke:edC('#465066'),black:[0,0,0]};

function endingDriveFrame(t,car){
  const W=ENDING_DRIVE.W,H=ENDING_DRIVE.H,D=new Uint8ClampedArray(W*H*4);
  const px=(x,y,c)=>{x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;D[i]=c[0];D[i+1]=c[1];D[i+2]=c[2];D[i+3]=255;};
  const dpx=(x,y,c,a)=>{if(a>0&&edB(x,y)<a)px(x,y,c);};            // dithered: covers a share a of the pixels
  const get=(x,y)=>{x=Math.max(0,Math.min(W-1,x|0));y=Math.max(0,Math.min(H-1,y|0));const i=(y*W+x)*4;return[D[i],D[i+1],D[i+2]];};
  if(t<ENDING_DRIVE.CUT)edWide(t,px,dpx);else edSide(t,car,px,dpx,get);
  // fades: in from black at the start, out to black at the end (ordered dither, like the game's night overlay)
  let fade=0;if(t<1)fade=1-t;const[f0,f1]=ENDING_DRIVE.FADE;if(t>f0)fade=Math.min(1,(t-f0)/(f1-f0));
  if(fade>0)for(let y=0;y<H;y++)for(let x=0;x<W;x++)dpx(x,y,EDP.black,fade);
  return D;
}

// sky: flat bands, darker overhead, a dim glow where the moon is behind the cloud; dither only at the band edges
function edSky(x,y,top,mx,my){const g=(y+top)/120,q=g*3,f=Math.floor(q),fr=q-f;let k=f+(fr>.8&&edB(x,y)<(fr-.8)*5?1:0);
  let c=k<=0?EDP.sky0:k===1?EDP.sky1:EDP.sky2;if(mx!==undefined){const m=1-Math.hypot(x-mx,(y-my)*1.6)/70;if(m>.35||(m>.2&&edB(x,y)<(m-.2)*6))c=EDP.moon;}return c;}

// ---- snow: two layers (far, dim and slow; near, bright and fast), blown by the wind; short streaks when moving fast
const ED_FLAKES=(()=>{const r=edRng(77),a=[];for(let i=0;i<460;i++)a.push({x:r()*360,y:r()*220,near:r()<.42,s:.6+r()*.8,ph:r()*6.3,d:r()});return a;})();
function edSnow(t,px,o){
  for(const f of ED_FLAKES){if(!f.near&&o.nearOnly)continue;if(f.near&&o.farOnly)continue;if(o.dense!==undefined&&f.d>o.dense)continue;
    const sp=f.near?1:.45,vx=(o.wind+o.cam*(f.near?1.15:.6))*sp*f.s,vy=(f.near?34:18)*f.s;
    const x=((f.x+vx*t+4*Math.sin(t*1.7+f.ph))%360+360)%360-20,y=((f.y+vy*t)%220+220)%220-20;
    const lit=o.lit?o.lit(x,y):0,c=lit>.2?EDP.flakeLit:f.near?EDP.flake:EDP.flakeFar;
    const len=f.near?Math.min(3,Math.round(Math.abs(vx)/80)):0;
    for(let k=0;k<=len;k++)px(x+k,y,c);
    if(f.near&&f.s>1.2)px(x,y+1,c);}}

// ---- a pixel spruce: tiers of drooping boughs (each tier narrow at its top, wide at its hem, ragged), snow lying on
// every exposed top, brighter on the moonlit left; its foot at (x, y), h tall. dark=true: a near silhouette.
const ED_PINES=new Map();
function edPineMask(h,seed){const key=h+'/'+seed;if(ED_PINES.has(key))return ED_PINES.get(key);const r=edRng(seed),w=Math.ceil(h*.42)+2,m=[];
  const th=Math.max(3,Math.round(h/7+r()*2));for(let i=0;i<h;i++){const u=i/h,p=(i%th)/th,wmax=(u*.9+.1)*h*.36+1;
    const jag=(r()-.5)*1.6;const hw=Math.max(0,Math.round(wmax*(.38+.62*p)+jag));m.push(hw);}
  const out={m,w,th};ED_PINES.set(key,out);return out;}
function edPine(px,x,y,h,seed,dark){x=Math.round(x);y=Math.round(y);const P=edPineMask(h,seed||1),m=P.m;
  for(let i=0;i<h;i++){const yy=y-h+i,hw=m[i],above=i>0?m[i-1]:-1;for(let dx=-hw;dx<=hw;dx++){
    let c=dx<0?EDP.pineHi:EDP.pine;const exposed=Math.abs(dx)>above||i===0;
    if(exposed)c=dark?EDP.pineSnowD:(dx<=0?EDP.pineSnow:EDP.pineSnowD);px(x+dx,yy,c);}}
  for(let i=0;i<Math.max(2,h/12);i++)px(x,y+i,EDP.pine);}

// ================= shot 1: wide, the mountain at night =================
const ED_ROAD=[[18,232],[262,190],[128,152],[286,118],[176,92],[300,66]];   // the switchbacks, world pixels
function edRoadAt(u){const segs=[];let tot=0;for(let i=1;i<ED_ROAD.length;i++){const a=ED_ROAD[i-1],b=ED_ROAD[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push([a,b,l]);tot+=l;}
  let d=u*tot;for(const[a,b,l]of segs){if(d<=l){const k=d/l;return[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,(b[0]-a[0])/l,(b[1]-a[1])/l];}d-=l;}
  const[a,b,l]=segs[segs.length-1];return[b[0],b[1],(b[0]-a[0])/l,(b[1]-a[1])/l];}
function edWide(t,px,dpx){const W=320,H=180,k=t/ENDING_DRIVE.CUT;
  const car=edRoadAt(.05+.3*k);                                             // the car climbs the first legs
  const camX=Math.max(0,Math.min(40,car[0]-150)),camY=Math.max(0,Math.min(80,car[1]-115));
  const mass=x=>30+Math.pow((x-330)/22,2)*.55+edF1(x/40,5,4)*20;            // the mountain the road climbs (its face above every leg)
  const far=x=>70+edF1(x/55,9,5)*44-Math.max(0,90-Math.abs(x-150))*.25;    // the range behind it
  for(let sy=0;sy<H;sy++){const y=sy+camY;for(let sx=0;sx<W;sx++){const x=sx+camX;let c=edSky(sx,sy,camY,90-camX,34-camY);
    const fy=far(x);if(y>=fy){c=y-fy<2?EDP.farSnow:far(x+1)>fy?EDP.farShade:EDP.farSnow;if(edF2(x/10,y/8,21,3)>.6)c=EDP.farRock;}
    const my=mass(x);if(y>=my){const n=edF2(x/14,y/9,33,4),flat=Math.max(0,1-Math.abs(mass(x+2)-mass(x-2))/5);
      const s=n+flat*.12-(y-my)*.0012;c=s>.62?EDP.snowHi:s>.55?EDP.snow:s>.5?EDP.snowD:edF2(x/5,y/5,44,2)>.6?EDP.rockHi:EDP.rock;
      if(y-my<1)c=EDP.snowHi;}
    px(sx,sy,c);}}
  // trees on the slopes below the snowline
  const r=edRng(12);for(let i=0;i<170;i++){const x=r()*360,yy=mass(x)+24+r()*180;if(yy-camY<0||yy-camY>H+12)continue;edPine(px,x-camX,yy-camY,6+Math.round(r()*7),1+(i%9));}
  // the road: a shelf cut across the face, its outer edge in shadow, little posts along the drop
  for(let i=1;i<ED_ROAD.length;i++){const a=ED_ROAD[i-1],b=ED_ROAD[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1]));
    for(let s=0;s<=n;s++){const x=a[0]+(b[0]-a[0])*s/n-camX,y=a[1]+(b[1]-a[1])*s/n-camY;px(x,y-1,EDP.roadHi);px(x,y,EDP.road);px(x,y+1,EDP.bankD);if(s%6===0)px(x,y+2,EDP.pineSnowD);}}
  // the car: a dark body, its headlights reaching up the road, a red tail lamp
  const cx=car[0]-camX,cy=car[1]-camY,dx=car[2],dy=car[3];
  for(let s=1;s<28;s++)for(let w=-1;w<=1;w++){const x=cx+dx*(3+s)-dy*w*(1+s*.1),y=cy+dy*(3+s)+dx*w*(1+s*.1)-1;dpx(x,y,s<7?EDP.litWarm:EDP.lit,(1-s/28)*.95);}
  for(let s=-2;s<=2;s++)px(cx+dx*s,cy+dy*s-1,EDP.pine);px(cx+dx*3,cy+dy*3-1,EDP.litWarm);px(cx-dx*3,cy-dy*3-1,EDP.tail);
  // framing: big spruces at the edges, close to the camera
  for(const[x,h,s]of[[-6,170,3],[22,128,4],[300,176,5],[326,140,6]])edPine(px,x-camX*.25,H+4,h,s,true);
  edSnow(t,px,{wind:-26,cam:0,lit:(x,y)=>Math.hypot(x-cx-dx*14,y-cy-dy*14)<10?1:0});
}

// ================= shot 2: alongside the car =================
function edSide(t,car,px,dpx,get){const W=320,H=180,tt=t-ENDING_DRIVE.CUT;
  const SPD=64,S=SPD*tt;                                                    // the camera keeps pace with the car
  const go=Math.max(0,t-12.3),carX=58+.5*300*go*go,bob=Math.round(Math.sin(t*9.3)*.6+Math.sin(t*13.1+1)*.45);
  const ROAD=134,GROUND=158;                                                // the road's far edge and where the tyres touch
  const white=Math.min(.85,.1+Math.max(0,tt-1)*.11);                        // the white-out builds
  const far=x=>56+edF1(x/60,9,5)*40,cliff=x=>6+edF1(x/34,41,4)*46;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let c=edSky(x,y,0),depth=1;
    const xf=x+S*.06;if(y>=far(xf)){c=y-far(xf)<2?EDP.farSnow:edF2(xf/10,y/8,21,3)>.62?EDP.farRock:EDP.farShade;depth=.9;}
    const xc=x+S*.45,cy=cliff(xc);
    if(y>=cy&&y<ROAD){depth=.62;c=edF2(xc/9,y/6,61,3)>.56?EDP.rockHi:EDP.rock;   // the rock face, ledges holding snow
      const lv=(y+edF2(xc/26,y/40,51,3)*16)/19,lf=lv-Math.floor(lv);if(lf<.09)c=EDP.snowHi;else if(lf<.16)c=EDP.snow;
      if(edF2(xc/16,y/10,52,3)>.68)c=EDP.snowD;if(y-cy<2)c=EDP.snowHi;}
    if(y>=ROAD-5&&y<ROAD){const top=ROAD-5+Math.round(edF1((x+S)/9,71,3)*3);if(y>=top){c=y===top?EDP.bankHi:EDP.bank;depth=.4;}}   // the plough's bank
    if(y>=ROAD&&y<GROUND+8){depth=.3;c=y<ROAD+2?EDP.roadHi:EDP.road;const rx=(x+S)%23;if((y===GROUND-6||y===GROUND+2)&&rx>2)c=EDP.rut;}   // ruts streaming past
    if(y>=GROUND+8){depth=.15;const top=GROUND+8+Math.round(edF1((x+S*1.4)/14,81,3)*6);c=y<top?EDP.road:y===top?EDP.bankHi:y<top+3?EDP.bank:EDP.bankD;}
    // the white-out: flat steps toward the fog colour, the far things first
    const fk=edStep(white*depth*(1.1-y/H*.3),x,y);if(fk>0)c=edMix(c,fk>.6?EDP.fogHi:EDP.fog,fk);
    px(x,y,c);}
  // spruces along the top of the cliff (fogged with it) and snow poles on the road's edge
  const r=edRng(5);for(let i=0;i<40;i++){const wx=r()*900,x=((wx-S*.45)%900+900)%900-60,h=10+Math.round(r()*14);if(x<-20||x>W+20)continue;edPine(px,x,cliff(x+S*.45)+2,h,10+(i%7));}
  for(let i=0;i<8;i++){const x=((i*170+40-S)%1360+1360)%1360-40;if(x<-4||x>W)continue;for(let y=ROAD-24;y<ROAD+1;y++){const c=y<ROAD-19&&y>ROAD-23?EDP.poleBand:y<ROAD-14?EDP.pole:EDP.poleD;px(x,y,c);px(x+1,y,c);}}
  if(white>.2){const fk=white*.6;for(let y=0;y<ROAD;y++)for(let x=0;x<W;x++){const s=edStep(fk*.5,x,y);if(s>0){const c=get(x,y);px(x,y,edMix(c,EDP.fog,s));}}}
  edSnow(t,px,{wind:-30,cam:-SPD,farOnly:true,dense:Math.min(1,.5+tt*.08)});
  // the car: the game's beaten sedan, wheels turning, the tail lamp glowing, exhaust blowing back
  const sx=Math.round(carX),sy=GROUND-74+bob;
  if(car){const cw=car.width,ch=car.height,cd=car.data;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const i=(y*cw+x)*4,a=cd[i+3];if(a<8)continue;
      if(a<250){if(edB(sx+x,sy+y)<a/255*1.2){const b=get(sx+x,sy+y);px(sx+x,sy+y,[b[0]*.5,b[1]*.5,b[2]*.55]);}continue;}   // its shadow on the snow
      px(sx+x,sy+y,[cd[i],cd[i+1],cd[i+2]]);}
    for(const[wx,wy]of[[36,63],[120,63]]){const a=-t*7.5;for(let k=0;k<2;k++){const aa=a+k*Math.PI;px(sx+wx+Math.round(Math.cos(aa)*4),sy+wy+Math.round(Math.sin(aa)*4),EDP.black);}}
    for(let k=0;k<3;k++)dpx(sx+6-k,sy+49+k%2,EDP.tailGlow,.7-k*.2);px(sx+8,sy+49,EDP.tail);px(sx+9,sy+49,EDP.tail);
    for(let k=0;k<14;k++){const age=((t*1.7+k/14)%1),x=sx+4-age*40-k%3,y=sy+62-age*10+Math.sin(k*2.1+t*3)*2;dpx(x,y,EDP.smoke,(1-age)*.55);dpx(x-1,y,EDP.smoke,(1-age)*.4);}}
  // the headlights: a warm cone down the road ahead, two flat steps of light, lighting the snow in it
  const lx=sx+146,ly=sy+51;
  const inBeam=(x,y)=>{const d=x-lx;if(d<1)return 0;const top=ly-d*.07,bot=ly+d*.42;if(y<top||y>bot)return 0;return Math.max(0,1-d/230)*(1-Math.abs((y-ly-d*.16)/(d*.3+2))*.6);};
  for(let y=Math.max(0,ly-20);y<H;y++)for(let x=Math.max(0,lx);x<W;x++){const b=inBeam(x,y);if(b<=0)continue;
    const on=y>=ROAD-5&&y<GROUND+10,s=edStep(on?b*.9:b*.22,x,y);if(s>0){const c=get(x,y);px(x,y,edMix(c,s>.5?EDP.litWarm:EDP.lit,on?s*.85:s*.5));}}
  px(lx,ly,EDP.litWarm);px(lx,ly+1,EDP.litWarm);px(lx-1,ly,EDP.lit);
  // near snow in front of everything (lit in the beam), now and then a spruce very close to the camera
  edSnow(t,px,{wind:-30,cam:-SPD,nearOnly:true,dense:Math.min(1,.45+tt*.09),lit:inBeam});
  for(let i=0;i<2;i++){const x=((i*700+520-S*1.8)%1400+1400)%1400-140;if(x>-80&&x<W+80)edPine(px,x,H+40,190,20+i,true);}
}
