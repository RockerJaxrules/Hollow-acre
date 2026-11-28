/* ================= fishing v4 (#199, owner: "fishing minigame needs improvement"): a cut through the pond.
   The fight is seen side-on, as if the bank were sliced open: the sky and the far trees above, the surface with the line going
   in, light falling through the water, the weed bed and a sunken log on the bottom, and past the rope of corks the drop-off
   into the deep. The fish is a shape you can read: it runs for the deep (let go), it rises and leaps clear of the water (let go),
   it noses down for the weeds (hold its head up, or the line snags and it rests while you wait), and it tires (reel).
   Same controls as before: hold to reel, let go to give line. ================= */
FIGHT.W=240;FIGHT.H=128;
{const cv=$('fishMG').querySelector('.f3');if(cv){cv.width=FIGHT.W;cv.height=FIGHT.H;}}
const DIVY={floater:.06,dart:.14,mixed:.2,smooth:.16,sinker:.38,junk:0};
const F4={bg:null,key:'',drops:[],motes:null,last:0};
const F4X0=5,F4Y0=5,F4IW=230,F4IH=118,F4SURF=F4Y0+25;
function f4Bed(px){const u=(px-F4X0)/F4IW;if(u<.84)return F4SURF+44+u*36+Math.sin(u*17)*2;return F4SURF+44+.84*36+(u-.84)/.16*70;}
function f4Bank(y){return y<F4SURF?F4X0+22:F4X0+22+(y-F4SURF)*.13+Math.sin(y*.3)*.6;}
const F4PX=x=>F4X0+42+x*(F4IW-58);
const F4PY=(y,x)=>{const px=F4PX(clamp(x,0,1));return F4SURF+6+y*(Math.min(f4Bed(px),F4Y0+F4IH-6)-F4SURF-14);};
function f4Splash(x,n,y){const px=F4PX(clamp(x,0,1.05));for(let k=0;k<n;k++)F4.drops.push({x:px+(rand()-.5)*6,y:(y==null?F4SURF:y)-1,vx:(rand()-.5)*40,vy:-30-rand()*45,t:0});}

const _start3=startMG;
startMG=function(f){_start3(f);Object.assign(MG,{y:.35,ty:.35,vy:0,shk:0,pitch:0,snags:0});F4.drops=[];F4.last=performance.now();
  $('fishMG').querySelector('.fhint').textContent=fineP()?'Hold the mouse button (or Space) to reel · let go when it runs or leaps · hold it up when it dives':'Hold to reel · let go when it runs or leaps · hold it up when it dives';};

function fightNext4(){const M=MG,d=M.d;if(M.beh==='junk'){M.phase='tire';M.pt=9;M.ty=.85;return;}
  if(M.phase!=='tire'){M.phase='tire';M.pt=(1.1+rand()*1.4)*(1.25-d*.55)*(1+(1-M.stam)*.8);return;}
  const r=rand(),jp=JUMPY[M.beh]*(.6+d*.6),dv=DIVY[M.beh]*(.5+d*.8);
  if(r<jp&&M.age>1.2){M.phase='tell';M.pt=.55;M.ty=0;return;}
  if(r<jp+dv&&M.age>1.6&&F4PX(M.x)<F4X0+F4IW*.8){M.phase='dtell';M.pt=.5;return;}
  M.phase='run';M.pt=(.6+rand()*.9)*(.7+d*.8)*(M.beh==='sinker'?1.5:M.beh==='dart'?.65:1);M.ty=clamp(.1+rand()*.7,.08,.85);}

function fishAuto4(){const M=MG;if(M.phase==='tell'||M.phase==='jump'||M.phase==='snag')return false;if(M.tension>.82)return false;
  if(M.phase==='dtell'||M.phase==='dive')return true;if(M.phase==='run')return M.tension<.45&&M.d<.4;return M.escT>0||M.tension<.75;}

mgStep=function(now){if(!MG.on)return;const M=MG;const dt=Math.min(.05,(now-M.last)/1000);M.last=now;M.age+=dt;const el=$('fishMG');
  if(window.FISH_AUTO)M.hold=fishAuto4();M.shk=Math.max(0,(M.shk||0)-dt*2.5);
  if(M.land>0){if(M.land<.01){f4Splash(0,14);M.shk=.4;}M.land+=dt;fightDraw4(now,dt);if(M.land>1){endMG(true);return;}requestAnimationFrame(mgStep);return;}
  if(M.lost){M.lostT+=dt;fightDraw4(now,dt);if(M.lostT>.7){fightLose(M.lost);return;}requestAnimationFrame(mgStep);return;}
  const d=M.d,hold=M.hold;M.pt-=dt;
  if(M.pt<=0){if(M.phase==='tell'){M.phase='jump';M.pt=.75;SFX.splash&&SFX.splash(.55);f4Splash(M.x,12);M.shk=.5;M.y=0;}
    else if(M.phase==='jump'){M.phase='tire';M.pt=.6;M.ty=.35;f4Splash(M.x,10);SFX.splash&&SFX.splash(.4);M.shk=.35;}
    else if(M.phase==='dtell'){M.phase='dive';M.pt=1.1+rand()*.8;}
    else if(M.phase==='snag'){M.phase='tire';M.pt=.9;M.stam=Math.min(1,M.stam+.25);M.ty=.55;}
    else fightNext4();}
  // the night fish that pulls back
  if(M.horror&&!M.scare&&M.age>2&&rand()<dt*.06){M.scare=true;M.phase='run';M.pt=1.3;M.ty=.9;el.querySelector('.fhint').textContent='It pulls back.';cam.shake=.3;M.shk=.8;SFX.stinger&&SFX.stinger();}
  const str=(.45+.55*M.stam)*(M.scare&&M.phase==='run'?1.8:1);let tgt,mv;
  if(M.phase==='run'){const v=(.07+.17*d)*str;mv=hold?v*.3-M.reel*.3:v*.75;tgt=hold?.62+.62*d*str:.2+.18*d;M.stam=Math.max(.12,M.stam-dt*.2*(1.25-d*.5));}
  else if(M.phase==='tell'){mv=hold?-M.reel*.6:.01;tgt=hold?.5+.2*d:.08;M.ty=0;}
  else if(M.phase==='jump'){mv=hold?-M.reel*.2:.03;tgt=hold?1.35:.06;}
  else if(M.phase==='dtell'){mv=.015;tgt=hold?.42+.15*d:.12;M.ty=Math.min(1,M.y+.2);}
  else if(M.phase==='dive'){mv=hold?-M.reel*.35:.035;tgt=hold?.55+.32*d*str:.1;
    if(hold){M.ty=Math.max(.2,M.y-.6);M.stam=Math.max(.12,M.stam-dt*.22);}else M.ty=1;
    if(!hold&&M.y>.9){M.phase='snag';M.pt=1.2+d*1.2;M.perfect=false;M.snags++;SFX.thud&&SFX.thud(0,.15);M.shk=.3;}}
  else if(M.phase==='snag'){mv=0;tgt=hold?1.2:.3;M.ty=1;}
  else{const heavy=M.beh==='junk';mv=hold?-M.reel*(heavy?.55:1):.012+d*.012;tgt=hold?(heavy?.62:.4+.12*d):.07;M.stam=Math.min(1,M.stam+dt*.035);}
  if(hold)tgt=.07+(tgt-.07)*M.gain;
  M.tension+=(tgt-M.tension)*Math.min(1,dt*(tgt>M.tension?(hold?4.2:2.4):3.4));
  M.x=clamp(M.x+mv*dt,0,1.05);
  if(M.tension>.86&&M.age>.4)M.perfect=false;
  if(M.tension>=1){M.snapT+=dt;if(M.snapT>.28){M.lost='snap';M.lostT=0;SFX.thud&&SFX.thud(0,.4);cam.shake=.2;M.shk=.7;}}else M.snapT=Math.max(0,M.snapT-dt*2);
  if(M.x>=1.0){M.escT+=dt;if(M.escT>1.5){M.lost='hook';M.lostT=0;}}else M.escT=Math.max(0,M.escT-dt*2);
  if(M.x<=.06&&!M.lost&&M.phase!=='jump'){M.land=.001;SFX.splash&&SFX.splash(.6);}
  if(M.phase==='tire'&&rand()<dt*.8)M.ty=clamp(M.y+(rand()-.5)*.5,.12,.8);
  const kk=M.phase==='run'?6:M.phase==='tell'?10:M.phase==='dive'||M.phase==='dtell'?7:2.2;
  if(M.phase!=='jump'){M.vy+=((M.ty-M.y)*kk-M.vy*2.6)*dt;M.y=clamp(M.y+M.vy*dt,0,1);}
  M.heading+=((mv>0?1:-1)-M.heading)*Math.min(1,dt*5);
  const ptg=M.phase==='dtell'||M.phase==='dive'&&!hold?.85:M.phase==='snag'?.6:M.phase==='tell'?-.9:clamp(M.vy*1.4,-.6,.6);M.pitch+=(ptg-M.pitch)*Math.min(1,dt*6);
  if(hold)M.spool+=dt*14;M.wob+=dt*(M.phase==='run'||M.phase==='dive'?18:M.phase==='snag'?24:6);
  if((M.phase==='tire'&&rand()<dt*2.2)||(M.phase==='snag'&&rand()<dt*6))M.bub.push({x:M.x,y:M.y,t:0,px:null});M.bub=M.bub.filter(b=>(b.t+=dt)<2.2);
  if(!M.scare||M.age%3<.05){const h=el.querySelector('.fhint');
    const txt=M.snapT>0?'Ease off! The line can’t take it.':M.phase==='tell'||M.phase==='jump'?'It’s going to leap: let go!':M.phase==='dtell'||M.phase==='dive'?'It’s diving for the weeds: hold its head up!':M.phase==='snag'?'Snagged in the weeds! Ease off and let it work free.':M.escT>0?'It’s nearly away: reel!':M.phase==='run'?'It’s running for the deep: give it line.':'It’s tiring: reel it in.';
    if(M.age>1.5&&h._t!==txt){h._t=txt;h.textContent=txt;}}
  fightDraw4(now,dt);requestAnimationFrame(mgStep);};

// ---------- the still part of the picture, cached per light
function fightBg4(night,horror){const key=night+'|'+horror;if(F4.bg&&F4.key===key)return F4.bg;const {W,H}=FIGHT;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const p=(x,y,col)=>{g.fillStyle=col;g.fillRect(x,y,1,1);};const N=(x,y,s)=>{const n=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return n-Math.floor(n);};
  const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*clamp(t,0,1)));const rgb=a=>`rgb(${a[0]},${a[1]},${a[2]})`;const X0=F4X0,Y0=F4Y0,IW=F4IW,IH=F4IH,SURF=F4SURF;
  // the frame: dark wood, lit along the top, nail heads at the corners
  g.fillStyle='#1a0e06';g.fillRect(0,0,W,H);g.fillStyle='#6a4426';g.fillRect(1,1,W-2,H-2);g.fillStyle='#8a5c34';g.fillRect(1,1,W-2,2);g.fillStyle='#4a2c16';g.fillRect(1,H-3,W-2,2);
  for(let x=2;x<W-2;x+=7)if(N(x,1,1)<.5)p(x,2,'#5a381c');for(const [x,y] of [[2,2],[W-3,2],[2,H-3],[W-3,H-3]]){p(x,y,'#c8a070');}
  g.fillStyle='#1a0e06';g.fillRect(X0-1,Y0-1,IW+2,IH+2);
  const P=horror?{sky0:[40,14,14],sky1:[70,30,24],tree:[18,6,6],treeL:[34,12,10],w0:[70,30,28],w1:[34,10,10],w2:[12,3,4],mud:[40,22,18],mudL:[60,36,28],soil:[42,26,18]}
    :night?{sky0:[10,16,28],sky1:[24,34,46],tree:[6,8,12],treeL:[14,18,22],w0:[30,52,60],w1:[12,26,38],w2:[4,10,18],mud:[24,22,22],mudL:[38,34,32],soil:[30,22,16]}
    :{sky0:[120,138,140],sky1:[196,178,136],tree:[46,52,38],treeL:[92,70,40],w0:[84,122,110],w1:[40,82,96],w2:[16,40,60],mud:[70,58,42],mudL:[104,90,64],soil:[74,54,34]};
  // the sky over the far bank, and the far trees in autumn
  for(let y=Y0;y<SURF;y++){const t=(y-Y0)/(SURF-Y0);g.fillStyle=rgb(mix(P.sky0,P.sky1,t));g.fillRect(X0,y,IW,1);}
  for(let x=X0+40;x<X0+IW;x++){const h=6+Math.round(Math.sin(x*.21)*2+Math.sin(x*.07)*3+N(x,0,2)*3);for(let y=SURF-h;y<SURF;y++){const lit=y<SURF-h+2&&N(x,y,3)<.6;
      p(x,y,rgb(lit?P.treeL:(N(x>>3,(y+x%3)>>2,4)<.3&&!night?[104,60,30]:P.tree)));}}
  if(night&&!horror){for(let k=0;k<5;k++){const x=X0+120+k*3,y=Y0+4;p(x,y,'#d8dcc8');}}   // a smear of moon behind thin cloud
  // the water, lighter just under the surface and darkening with depth; the deep beyond the corks darkest of all
  for(let y=SURF;y<Y0+IH;y++)for(let x=X0;x<X0+IW;x++){const bed=f4Bed(x);if(y>=bed)continue;const dpt=(y-SURF)/80,u=(x-X0)/IW;
    let col=mix(P.w0,P.w1,dpt*1.3);if(dpt>.75)col=mix(P.w1,P.w2,(dpt-.75)*2.2);if(u>.86)col=mix(col,P.w2,(u-.86)*5);
    if(N(x>>2,y>>1,5)<.5)col=col.map(v=>v+2);p(x,y,rgb(col));}
  // the bed: mud lit along its top, pebbles, and the drop-off
  for(let x=X0;x<X0+IW;x++){const bed=Math.round(f4Bed(x));for(let y=Math.max(bed,SURF);y<Y0+IH;y++){const e=y-bed;let col=e===0?P.mudL:e<3?mix(P.mudL,P.mud,.5):mix(P.mud,P.w2,Math.min(1,e/30));
      p(x,y,rgb(col));}}
  for(let k=0;k<16;k++){const x=X0+30+Math.round(N(k,1,7)*IW*.78),y=Math.round(f4Bed(x))-1,w=1+Math.round(N(k,2,7)*2);for(let i=0;i<w;i++){p(x+i,y,rgb(mix(P.mudL,[150,140,120],night?.1:.4)));p(x+i,y+1,rgb(P.mud));}}
  // the sunken log lying on the bed, a snapped branch standing up out of it
  {const lx0=X0+Math.round(IW*.6),lx1=X0+Math.round(IW*.74);for(let x=lx0;x<=lx1;x++){const by=Math.round(f4Bed(x)),r=4;
      for(let j=-r;j<=r;j++){const yy=by-r+j;const lit=j<-1;p(x,yy,rgb(lit?(night?[40,32,26]:[96,72,48]):j>2?(night?[14,10,10]:[34,24,18]):(night?[28,22,18]:[66,48,32])));}}
    for(let j=0;j<10;j++)p(lx0+9+Math.round(j*.3),Math.round(f4Bed(lx0+9))-8-j,night?'#2a201a':'#5a4230');
    for(let j=-3;j<=3;j++)p(lx1,Math.round(f4Bed(lx1))-4+j,night?'#3a2e24':'#8a6c48');}
  // the near bank, cut open: grass on top, then dark topsoil, then clay, a few roots and stones set in it; no speckle
  for(let y=SURF-6;y<Y0+IH;y++){const ex=Math.round(f4Bank(y));for(let x=X0;x<ex;x++){const e=ex-x;
      let col=y<SURF-4?(night?[30,40,24]:[86,96,48]):y<SURF+6?mix(P.soil,[24,16,10],.25):mix(P.soil,night?[40,34,30]:[104,84,60],Math.min(1,(y-SURF-6)/40)*.5);
      if(e<=1)col=mix(col,[14,8,6],.6);else if(e<=3&&y>SURF)col=mix(col,P.w1,.25);p(x,y,rgb(col));}}
  for(const [x0,y0,len] of [[X0+2,SURF+3,10],[X0+6,SURF+9,8],[X0+1,SURF+16,7]])for(let i=0;i<len;i++){const x=x0+i,y=y0+Math.round(Math.sin(i*.6)*1.2+i*.25);if(x<f4Bank(y)-1)p(x,y,night?'#1a120c':'#3a2616');}   // roots
  for(const [x,y] of [[X0+5,SURF+24],[X0+11,SURF+38],[X0+4,SURF+52]]){if(x+2<f4Bank(y)){p(x,y,night?'#4a4440':'#8a8070');p(x+1,y,night?'#3a3430':'#6a6256');p(x,y+1,night?'#2a2420':'#4a443c');p(x+1,y+1,night?'#2a2420':'#4a443c');}}   // stones
  for(let k=0;k<7;k++){const rx=X0+3+k*3,h=6+Math.round(N(k,4,8)*6);for(let j=0;j<h;j++)p(rx+(j>h-3?1:0),SURF-6-j,j>h-3?(night?'#5a5a34':'#b0a060'):(night?'#24321c':'#4a6a2c'));}
  // the rope of corks that marks where the deep water starts, its line going down to an anchor stone
  {const cx=X0+Math.round(IW*.86);for(let y=SURF;y<Math.min(Y0+IH-4,SURF+70);y+=2)p(cx,y,horror?'#5a1818':'#8a7a5a');
    for(const dx of [-8,0,8]){p(cx+dx,SURF-1,'#e86a2a');p(cx+dx+1,SURF-1,'#c8501e');p(cx+dx,SURF,'#a03a14');p(cx+dx+1,SURF,'#8a3010');}}
  F4.bg=c;F4.key=key;return c;}

// ---------- a fish seen side-on: body, forked tail beating, a fin on its back, an eye; nose up or down as it climbs or dives
function f4Fish(g,cx,cy,L,hd,pitch,wob,body,back,eye){const H=L*.3,ax=hd*Math.cos(pitch),ay=Math.sin(pitch);let nx=-ay,ny=ax;if(ny<0||(ny===0&&nx<0)){nx=-nx;ny=-ny;}
  const put=(x,y,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1);};const steps=Math.ceil(L*2);
  for(let i=0;i<=steps;i++){const s=i/steps;const sw=Math.sin(wob-s*3)*s*s*2.2;let h;
    if(s<.8)h=H*Math.pow(Math.sin(Math.PI*Math.min(1,s*.95+.06)),.7);else if(s<.87)h=H*.2;else h=H*(.25+(s-.87)/.13*.75);
    const px=cx+(.5-s)*L*ax+nx*sw,py=cy+(.5-s)*L*ay+ny*sw;
    for(let j=-Math.ceil(h);j<=Math.ceil(h);j++){if(Math.abs(j)>h)continue;if(s>.87&&Math.abs(j)<h*(1-(s-.87)/.13)*.7)continue;   // the tail's fork
      put(px+nx*j,py+ny*j,j<-h+1.2&&s<.8&&back?back:body);}
    if(s>.28&&s<.5){const fh=H*.55*Math.sin((s-.28)/.22*Math.PI);for(let j=0;j<fh;j++)put(px-nx*(h+j),py-ny*(h+j),body);}}
  if(eye){const s=.1,h=H*.3;put(cx+(.5-s)*L*ax-nx*h*.4,cy+(.5-s)*L*ay-ny*h*.4,eye);}}

function fightDraw4(now,dt){const M=MG,cv=$('fishMG').querySelector('.f3');if(!cv)return;const g=cv.getContext('2d');const {W,H}=FIGHT;const t=now/1000;
  const night=isNight(),hor=M.horror;const X0=F4X0,Y0=F4Y0,IW=F4IW,IH=F4IH,SURF=F4SURF;
  g.setTransform(1,0,0,1,0,0);g.drawImage(fightBg4(night,hor),0,0);
  const sk=M.shk>0?Math.round(Math.sin(t*70)*M.shk*2):0;g.save();g.beginPath();g.rect(X0,Y0,IW,IH);g.clip();g.translate(sk,0);
  const p=(x,y,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),1,1);};
  // light falling through the water in slow-moving shafts (by day), a sheen of moon on the surface (by night)
  if(!night){for(let k=0;k<4;k++){const x0=X0+50+k*46+Math.sin(t*.25+k*1.7)*8;g.fillStyle=`rgba(255,246,210,${(.05+.025*Math.sin(t*.6+k)).toFixed(3)})`;
      for(let y=SURF;y<SURF+70;y+=1){const w=6+k%2*3;g.fillRect(Math.round(x0+(y-SURF)*.35),y,w,1);}}}
  // drifting motes
  if(!F4.motes){F4.motes=[];for(let k=0;k<26;k++)F4.motes.push([rand(),rand(),rand()]);}
  for(const m of F4.motes){const x=X0+30+((m[0]+t*.006*(1+m[2]))%1)*(IW-34),y=SURF+4+((m[1]+t*.01*m[2])%1)*70;if(y>=f4Bed(x)-1)continue;p(x,y+Math.sin(t+m[2]*9)*1.5,night?'rgba(150,170,180,.35)':'rgba(230,236,210,.4)');}
  // the weed bed, swaying, and harder when the fish is in it
  const fxp=F4PX(clamp(M.x,0,1.03)),fyp=F4PY(M.y,M.x);
  for(let k=0;k<22;k++){const bx=X0+IW*.33+k*2.6+((k*7)%5),by=f4Bed(bx)-1,h=12+((k*13)%11);const near=Math.abs(bx-fxp)<18&&(M.phase==='dive'||M.phase==='snag'||M.phase==='dtell');
    for(let j=0;j<h;j++){const f=j/h;const sw=Math.sin(t*1.4+k*.7+f*2)*f*f*(near?5:2.2);const col=night?(f>.7?'#2a3a24':'#18241a'):(f>.75?'#8a8a3a':f>.4?'#5a6a2c':'#3a4a22');p(bx+sw,by-j,col);}}
  // the net down in the shallows by the bank; it comes up out of the water with the fish in it
  const lift=M.land>0?clamp(M.land/.45,0,1):0;const nx=F4PX(0)-3,ny=F4PY(.35,0)-lift*(F4PY(.35,0)-SURF+14);
  for(let a=0;a<24;a++){const an=a/24*Math.PI*2;p(nx+Math.cos(an)*5,ny+Math.sin(an)*3,'#b89a6a');}
  for(let k=-3;k<=3;k+=2)for(let j=0;j<5;j++)p(nx+k+(j%2),ny+1+j,'rgba(220,210,180,.5)');
  for(let k=0;k<26;k++){const x=nx-4-k*.55,y=ny-2-k*1.15;if(y<Y0)break;p(x,y,'#7a5232');}
  // the fish: hidden in the water as a dark shape (you won't know what it is until it's in the net); in the air you see it
  const L=clamp(10+M.len*.24,12,40)*(hor?1.35:1);const hd=M.heading>=0?1:-1;
  const jumpU=M.phase==='jump'?clamp(1-M.pt/.75,0,1):0,air=jumpU>0?Math.sin(jumpU*Math.PI)*22:0;
  let fx=fxp,fy=fyp,pitch=M.pitch;if(air>0){fy=SURF-2-air;pitch=(jumpU-.5)*2.4;}
  if(M.land>0){fx=nx;fy=ny-1;pitch=.2;}
  const inWater=fy>SURF+1&&M.land<=0;const sh=1-clamp(M.y,0,1)*.35;
  const body=hor?`rgba(28,4,6,${(.8*sh).toFixed(2)})`:inWater?(night?`rgba(4,10,16,${(.75*sh).toFixed(2)})`:`rgba(12,28,34,${(.72*sh).toFixed(2)})`):(hor?'#3a1416':night?'#4a565a':'#6a7a70');
  const back=inWater?(night?'rgba(120,150,170,.35)':'rgba(170,200,190,.45)'):(night?'#8a9aa0':'#aab8a8');
  f4Fish(g,fx,fy,L,M.land>0?-1:hd,pitch,M.wob,body,back,inWater?(hor&&((now/700|0)%5===0)?'#e8e0c8':null):'#f0f0e0');
  if(M.phase==='run'&&inWater)for(let k=1;k<7;k++){p(fx-hd*(L*.55+k*3),fy+Math.sin(t*20+k)*1.5,`rgba(220,236,240,${(.4-k*.05).toFixed(2)})`);}
  // spray: drops thrown up when it leaps or comes in, falling back
  F4.drops=F4.drops.filter(d=>{d.t+=dt;d.vy+=160*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;if(d.y>SURF+1&&d.vy>0)return false;p(d.x,d.y,'rgba(235,245,255,.85)');return d.t<1.5;});
  // bubbles rising to the surface while it rests, a burst when it's snagged
  for(const b of M.bub){if(b.px==null){b.px=F4PX(clamp(b.x,0,1.03));b.py=F4PY(b.y,b.x);}const y=b.py-b.t*28;if(y<SURF+1)continue;p(b.px+Math.sin(b.t*9)*1.5,y,`rgba(220,240,255,${Math.max(0,.8-b.t*.35).toFixed(2)})`);}
  // the surface: a bright line broken by moving glints, rings over a fish about to leap
  for(let x=X0+Math.round(f4Bank(SURF));x<X0+IW;x++){const s=Math.sin(x*.5+t*2)+Math.sin(x*.13-t*1.3);if(s>.6)p(x,SURF,night?'rgba(170,190,200,.55)':'rgba(236,244,240,.8)');else if(s>-.4)p(x,SURF,night?'rgba(90,110,120,.4)':'rgba(170,200,196,.5)');}
  if(M.phase==='tell'){const r=2+(1-M.pt/.55)*8;for(let k=-1;k<=1;k+=2)for(let i=0;i<3;i++)p(fxp+k*(r+i),SURF+(i===1?0:-1)*0,'rgba(240,248,255,.85)');}
  // the rod, held from the bank above the left edge, bending toward the fish under the strain; the line goes into the water
  const T=clamp(M.tension,0,1.05);const bend=1+T*6;const rb=[X0-6,Y0+30],rt0=[X0+32,Y0+3];
  let tip=null;for(let i=0;i<=70;i++){const u=i/70;const x=rb[0]+(rt0[0]-rb[0])*u+Math.sin(u*Math.PI*.5)*u*bend*.6,y=rb[1]+(rt0[1]-rb[1])*u+u*u*bend;
    p(x,y-1,'#1a0e06');p(x,y+1,'#1a0e06');p(x,y,u<.35?'#3a2410':'#a8743e');tip=[x,y];}
  for(const [x,y] of [[rb[0]+10,rb[1]-7],[rb[0]+20,rb[1]-14],[rb[0]+29,rb[1]-20]])p(x,y-1,'#d8c8a0');   // the line guides
  const lc=T<.55?'#ece6d6':T<.75?'#f2d27a':T<.9?'#f09040':'#ff4a30';const vib=T>.75?Math.sin(now/22)*(T>.9?1.2:.6):0;
  const mx=M.land>0?nx:fx+hd*L*.5*Math.cos(pitch),my=M.land>0?ny-3:fy+L*.5*Math.sin(pitch)*(hd>0?1:1);
  const seg=(a,b,col,sag)=>{const n=Math.max(8,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])));for(let i=0;i<=n;i++){const u=i/n;if(M.lost==='snap'&&u>.35&&u<.65&&col===lc)continue;p(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u+Math.sin(u*Math.PI)*sag+(i%3===0?vib:0),col);}};
  const sag=Math.pow(1-T,2)*10;
  if(my<=SURF+1){seg(tip,[mx,my],lc,sag);}
  else{const ex=Math.max(X0+Math.round(f4Bank(SURF))+3,tip[0]+(mx-tip[0])*.35);seg(tip,[ex,SURF],lc,sag*.6);
    seg([ex,SURF+1],[mx,my],T<.75?'rgba(236,230,214,.5)':lc,sag*.4);
    for(const k of [-2,-1,1,2])p(ex+k,SURF-(Math.abs(k)===1?1:0),'rgba(240,248,255,.7)');
    if(M.phase==='snag'){for(let k=0;k<6;k++)p(mx+Math.sin(k*1.7+t*5)*3,my-k*1.2,night?'#3a4a2a':'#7a7a34');}}
  g.restore();
  // the reel's dial on the bank: green, then amber, then red; the needle shows the strain, the handle turns as you reel
  const cx=X0+10,cy=Y0+IH-11,R=7;g.fillStyle='#1a0e06';g.beginPath();g.arc(cx,cy,R+1.5,0,Math.PI*2);g.fill();g.fillStyle='#e8dcc0';g.beginPath();g.arc(cx,cy,R,0,Math.PI*2);g.fill();
  for(let a=0;a<=20;a++){const u=a/20,an=Math.PI*.8+u*Math.PI*1.4;p(cx+Math.cos(an)*(R-1),cy+Math.sin(an)*(R-1),u<.6?'#5a9a3a':u<.85?'#d8a030':'#c8301e');}
  const na=Math.PI*.8+T*Math.PI*1.4;for(let r=0;r<R-1;r+=.5)p(cx+Math.cos(na)*r,cy+Math.sin(na)*r,'#2a1a10');p(cx,cy,'#2a1a10');
  const ha=M.spool;p(cx+Math.cos(ha)*(R+3),cy+Math.sin(ha)*(R+3),'#c8a070');p(cx+Math.cos(ha)*(R+2),cy+Math.sin(ha)*(R+2),'#8a5c34');
  // getting away: the deep water past the corks flashes; a snapped line flashes the whole pond red
  if(M.escT>0&&((now/150|0)%2)){g.fillStyle='rgba(255,70,40,.22)';g.fillRect(X0+Math.round(IW*.86),SURF,Math.round(IW*.14),IH-(SURF-Y0));}
  if(M.lost==='snap'){g.fillStyle=`rgba(255,60,40,${(.25*(1-M.lostT/.7)).toFixed(2)})`;g.fillRect(X0,Y0,IW,IH);}}
