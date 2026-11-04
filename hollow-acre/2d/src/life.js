/* ================= life: hens, butterflies, fireflies, chimney smoke, creek glints ================= */
const HENS=[];for(let i=0;i<4;i++)HENS.push({x:9.5+i*1.1,z:-2.5+(i%2),tx:10,tz:-2,t:rand()*5,wait:rand()*2,peck:0,flip:false});
const FLIES=[];for(let i=0;i<7;i++){const a=[[-2,5],[3,7],[-8,-3],[28,-12],[46,-14],[-30,9],[12,12]][i];FLIES.push({ax:a[0],az:a[1],x:a[0],z:a[1],ph:rand()*9});}
const BUGS=[];for(let i=0;i<46;i++){const k=i%3;const c=k===0?[pond.x,pond.z,11]:k===1?[-2,18,13]:[-28,-1,10];BUGS.push({cx:c[0]+(rand()-.5)*c[2]*2,cz:c[1]+(rand()-.5)*c[2],ph:rand()*20,sp:.4+rand()*.6});}
const PUFFS=[];let puffT=0;
function lifeUpdate(dt){const day=!isNight();
  for(const h of HENS){h.t+=dt;if(!day)continue;if(h.peck>0){h.peck-=dt;continue;}
    if(h.wait>0){h.wait-=dt;if(h.wait<=0&&rand()<.5)h.peck=.6+rand();continue;}
    const dx=h.tx-h.x,dz=h.tz-h.z,d=Math.hypot(dx,dz);
    const pd=Math.hypot(P.x-h.x,P.z-h.z);if(pd<1.6){h.tx=clamp(h.x+(h.x-P.x)*2,9.2,12.8);h.tz=clamp(h.z+(h.z-P.z)*2,-3.3,-.8);}
    if(d<.15){h.wait=.8+rand()*2.5;h.tx=lerp(9.2,12.8,rand());h.tz=lerp(-3.3,-.8,rand());continue;}
    const sp=pd<1.6?2.6:1.1;h.x+=dx/d*sp*dt;h.z+=dz/d*sp*dt;h.flip=dx<0;}
  for(const f of FLIES){f.ph+=dt;f.x=f.ax+Math.sin(f.ph*.7)*2.2+Math.sin(f.ph*1.9)*.6;f.z=f.az+Math.cos(f.ph*.5)*1.4;}
  // chimney smoke from every lit (or daytime) house
  puffT-=dt;if(puffT<=0){puffT=.28;for(const h of HOUSES){const m=SPR[h.e.spr];if(!m||!m.chim)continue;if(isNight()&&!h.lit)continue;if(!onScreen(h.x,h.z,300))continue;
      PUFFS.push({hx:h.x,hz:h.z,ox:m.chim[0],oy:m.chim[1],t:0,r:2+rand()*1.5,dx:(rand()-.3)*4});}}
  for(let i=PUFFS.length-1;i>=0;i--){const p=PUFFS[i];p.t+=dt;if(p.t>3.2)PUFFS.splice(i,1);}}
function lifeDrawables(D,t){const day=!isNight();
  if(day)for(const h of HENS)D.push({z:h.z,mind:1,draw(){const f=h.peck>0?2:h.wait>0?0:(Math.floor(t*8)%2);drawSpr('chicken',sx(h.x),sz(h.z),'a','S',f,{flip:h.flip});}});
  if(day&&nightAmt<.3)for(const f of FLIES)D.push({z:f.z+.5,mind:1,draw(){drawSpr('butterfly',sx(f.x),sz(f.z)-22-Math.round(Math.abs(Math.sin(f.ph*3))*6),'a','S',Math.floor(t*10)%2);}});}
function lifeOver(t){ // smoke rises above the roofs, drifting with the wind
  for(const p of PUFFS){const k=p.t/3.2;const X=sx(p.hx)+p.ox+p.dx*k*6+k*k*14,Y=sz(p.hz)+p.oy-p.t*13;const r=p.r+k*6;
    ctx2.fillStyle=`rgba(${isNight()?'70,72,86':'196,196,204'},${(1-k)*.42})`;ctx2.beginPath();ctx2.arc(Math.round(X),Math.round(Y),r,0,Math.PI*2);ctx2.fill();}}
function lifeLight(t,L){ // fireflies over the pond, the corn and the creek
  if(L<.4)return;for(const b of BUGS){const x=b.cx+Math.sin(t*b.sp+b.ph)*1.6,z=b.cz+Math.cos(t*b.sp*.7+b.ph)*1.2;if(!onScreen(x,z,40))continue;
    const on=(Math.sin(t*2.3+b.ph*3)+1)/2;if(on<.35)continue;glowAt(sx(x),sz(z)-14-Math.sin(t+b.ph)*6,9,[200,255,120],on*.9*L);}}
