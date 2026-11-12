/* ================= #215 fishing remade: the Stardew-style catch bar, but ours =================
   The feel you wanted: keep the fish inside a bar you raise and lower to fill the catch meter — the
   skill and challenge of Stardew's. What's different: THE FISH FIGHTS HARDER THE CLOSER IT GETS to
   landing (the end is the hard part, not the start), with a sudden surface lunge right before you
   win; and in the dark a hard fish is a wrong-coloured shadow that only resolves when it breaks the
   surface. Self-contained — its own hold input, loop, draw and catch recording — so it replaces
   fish3's reel-to-net fight cleanly while keeping the cast, the fish list and the catch card. ====== */
(function(){ if(typeof startMG!=='function'||typeof MG==='undefined') return;
  const FG={W:54,H:160,tnx:6,tnw:5,tx:14,ty:9,tw:19,th:134,px:38,pw:7};  // left: line tension · middle: the water · right: the catch meter
  const el=()=>$('fishMG');
  let raf=0;
  const hold=v=>{if(MG.on)MG.hold=v;};
  const pd=()=>hold(true), pu=()=>hold(false);
  const kd=e=>{if((e.code==='Space'||e.code==='KeyC')&&MG.on){e.preventDefault();e.stopPropagation();hold(true);}};
  const ku=e=>{if((e.code==='Space'||e.code==='KeyC')&&MG.on)hold(false);};
  function attach(){const E=el();E.addEventListener('pointerdown',pd);addEventListener('pointerup',pu,true);addEventListener('pointercancel',pu,true);addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);}
  function detach(){const E=el();E.removeEventListener('pointerdown',pd);removeEventListener('pointerup',pu,true);removeEventListener('pointercancel',pu,true);removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);}

  function fishTreasure(){const coins=16+Math.floor(rand()*34)+(S.rod>=4?40:S.rod>=3?22:S.rod>=2?10:0);S.coins=(S.coins||0)+coins;
    let item=null,n=1;const r=rand();
    if(r<.42){item='bait';n=2+Math.floor(rand()*3);}else if(r<.66){item='coal';n=1+Math.floor(rand()*2);}
    else if(r<.82){item=rand()<.5?'copper_bar':'iron_bar';}else if(r<.95){item='gem';}
    if(item&&typeof addInv==='function')addInv(item,n);
    const nm=item?` and ${n>1?n+' ':'a '}${(((typeof ITEMS!=='undefined'&&ITEMS[item])||{name:item}).name||item).toLowerCase()}${n>1?'s':''}`:'';
    toast(`A treasure chest! +${coins} coins${nm}.`,3.2);SFX.coin&&SFX.coin();if(typeof updateHud==='function')updateHud();}
  startMG=function(f){const E=el();const night=isNight();
    const f3=E.querySelector('.f3');if(f3)f3.style.setProperty('display','none','important');  // hide the old reel canvas
    const cv=E.querySelector('.fg');if(cv)cv.style.setProperty('display','block','important'); // show the bar canvas (beat fish3's display:none!important)
    const pw=fish.castPow||0;fish.castPow=0;   // the further you cast, the better the odds of a treasure (pairs the throw skill with the reward)
    const tr=(f&&!(night&&f[2]>.6)&&rand()<clamp(.08+pw*.5,.08,.6))?{at:1+rand()*2,y:.2+rand()*.6,vy:0,prog:0,got:false,pop:0}:null;
    Object.assign(MG,{on:true,f,hold:false,zone:.1,zv:0,fy:.3,fv:0,ft:.3,tt:0,prog:.34,
      size:S.rod>=4?.40:S.rod>=3?.36:S.rod>=2?.31:.26,d:f?f[2]:.25,beh:f?f[3]:'smooth',
      last:performance.now(),scare:false,perfect:true,age:0,reelA:0,sp:f?FISH_SP[f[0]]:null,
      horror:night&&!!f&&f[2]>.6,lunge:0,tr,tn:0,snapT:0,snapped:false,landed:0,splash:[]});   // (landed must start at 0: left over from the last catch it ended every later fight at once with a free fish)
    if(cv){const k=Math.max(2,Math.min(4,Math.floor(innerHeight*.62/FG.H)));cv.width=FG.W;cv.height=FG.H;cv.style.width=FG.W*k+'px';cv.style.height=FG.H*k+'px';}
    const h=E.querySelector('.fhint');if(h)h.textContent=fineP()?'Hold to raise the bar onto the fish — but ease off before the line (left) snaps':'Hold to raise the bar onto the fish — ease off before the line snaps';
    E.style.display='flex';S.paused=true;fish.state='reel';attach();MG.last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);};

  function loop(now){if(!MG.on)return;const dt=Math.min(.05,(now-MG.last)/1000);MG.last=now;MG.age+=dt;const E=el();
    MG.zv+=(MG.hold?2.1:-1.9)*dt;MG.zv=clamp(MG.zv,-1.4,1.4);MG.zone+=MG.zv*dt;
    if(MG.zone<0){MG.zone=0;MG.zv=-MG.zv*.35;}if(MG.zone>1-MG.size){MG.zone=1-MG.size;MG.zv=0;}
    const d=MG.d,panic=1+MG.prog*.9;                                        // TWIST: the nearer the surface, the harder it fights
    MG.tt-=dt;
    if(MG.tt<=0){MG.tt=((MG.beh==='dart'?.35:MG.beh==='mixed'?.5:.9)+rand()*(1.4-d))/panic;
      let t=rand();if(MG.beh==='sinker')t=t*t;if(MG.beh==='floater')t=1-t*t;
      if(MG.beh==='dart'&&rand()<.5)t=MG.fy+(rand()<.5?-1:1)*(.25+d*.3);MG.ft=clamp(t,.02,.98);
      if(isNight()&&!MG.scare&&rand()<.06&&MG.f&&MG.f[2]>.6){MG.scare=true;MG.ft=0;if(E.querySelector('.fhint'))E.querySelector('.fhint').textContent='It pulls back.';cam&&(cam.shake=.3);SFX.stinger&&SFX.stinger();}}
    if(MG.prog>.82&&MG.lunge<=0){MG.lunge=.55;MG.ft=clamp(MG.fy+(rand()<.5?-1:1)*.5,.02,.98);SFX.till&&SFX.till();}  // the surface lunge
    if(MG.lunge>0)MG.lunge-=dt;
    const spd=(MG.beh==='dart'?2.6:MG.beh==='mixed'?2.2:1.2)*(.5+d)*panic;
    MG.fv+=((MG.ft-MG.fy)*spd*3-MG.fv*2.4)*dt;MG.fy=clamp(MG.fy+MG.fv*dt,0,1);
    const inside=MG.fy>=MG.zone&&MG.fy<=MG.zone+MG.size;
    MG.prog+=(inside?.24:-.17*(1+d*.6))*dt;if(!inside&&MG.age>.6)MG.perfect=false;
    if(MG.hold)MG.reelA+=dt*14;else if(inside)MG.reelA+=dt*5;
    // TREASURE: a chest you can also haul up — keep the bar over it (as well as the fish) to fill it before you land the catch
    const tr=MG.tr;if(tr&&!tr.got&&MG.age>tr.at){if(!tr.shown){tr.shown=1;const hh=E.querySelector('.fhint');if(hh)hh.textContent='Treasure! Cover it with the bar too — without losing the fish.';}
      tr.vy+=(rand()-.5)*dt*.8;tr.vy*=.98;tr.y=clamp(tr.y+tr.vy*dt,.05,.92);const tin=tr.y>=MG.zone&&tr.y<=MG.zone+MG.size;tr.prog=clamp(tr.prog+(tin?.5:-.3)*dt,0,1);if(tr.prog>=1){tr.got=true;tr.pop=1;SFX.coin&&SFX.coin();const hh=E.querySelector('.fhint');if(hh)hh.textContent='Got the treasure! Now land the fish.';}}
    if(tr&&tr.pop>0)tr.pop=Math.max(0,tr.pop-dt*1.5);
    // LINE TENSION: reeling (holding) strains the line, and it strains faster against a fighting fish or a lunge — ease off or it snaps
    const strain=(MG.hold?(.40+(!inside?.30:0)+(MG.lunge>0?.45:0)):-.62)*(.72+d*.8);
    MG.tn=clamp(MG.tn+strain*dt,0,1);if(MG.snapT>0)MG.snapT-=dt;
    if(MG.tn>.82&&MG.snapT<=0){MG.snapT=.6;cam&&(cam.shake=Math.max(cam.shake||0,.18));}
    if(MG.tn>=1){MG.snapped=true;endMG(false);return;}
    if(MG.prog>=1&&!MG.landed){MG.landed=.001;MG.splash=[];for(let i=0;i<14;i++)MG.splash.push({x:(Math.random()-.5)*16,vy:-30-Math.random()*40,vx:(Math.random()-.5)*40,t:0});SFX.splash&&SFX.splash();cam&&(cam.shake=.45);const h=E.querySelector('.fhint');if(h)h.textContent='Landed!';}
    if(MG.landed){MG.landed+=dt;for(const s of MG.splash){s.t+=dt;s.vy+=180*dt;s.x+=s.vx*dt;s.y=(s.y||0)+s.vy*dt;}draw(now/1000,true);if(MG.landed>.55){endMG(true);return;}raf=requestAnimationFrame(loop);return;}
    draw(now/1000,inside);
    if(MG.prog<=0){endMG(false);return;}
    raf=requestAnimationFrame(loop);}

  function draw(t,inside){const cv=el().querySelector('.fg');if(!cv)return;const g=cv.getContext('2d');g.imageSmoothingEnabled=false;const {W,H,tnx,tnw,tx,ty,tw,th,px,pw}=FG;g.clearRect(0,0,W,H);const p=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
    p(0,0,W,H,'#1a0e06');p(1,1,W-2,H-2,'#7a4a20');for(let x=2;x<W-2;x+=5)p(x,1,1,H-2,'#6a3e1a');p(1,1,W-2,1,'#b8823c');p(1,1,1,H-2,'#a8763a');p(W-2,1,1,H-2,'#4a2a10');p(1,H-2,W-2,1,'#4a2a10');
    for(const [cx,cy] of [[3,3],[W-4,3],[3,H-4],[W-4,H-4]]){p(cx,cy,2,2,'#e8c060');p(cx,cy,1,1,'#fff2c8');}
    p(tx-1,ty-1,tw+2,th+2,'#1a0e06');const top=MG.horror?[58,10,10]:[58,122,176],bot=MG.horror?[18,4,4]:[18,48,80];
    for(let y=0;y<th;y++){const u=y/th;p(tx,ty+y,tw,1,`rgb(${Math.round(top[0]+(bot[0]-top[0])*u)},${Math.round(top[1]+(bot[1]-top[1])*u)},${Math.round(top[2]+(bot[2]-top[2])*u)})`);}
    for(let k=0;k<6;k++){const y=ty+((k*23+t*10)%th);p(tx+1+((k*7)%(tw-6)),Math.round(y),4,1,'rgba(255,255,255,.12)');}
    for(let k=0;k<4;k++){const y=ty+th-((k*37+t*18)%th);p(tx+3+((k*5)%(tw-6)),Math.round(y),1,1,'rgba(220,240,255,.5)');}
    p(tx,ty+th-6,tw,6,MG.horror?'#2a0606':'#4a3a24');for(let x=0;x<tw;x+=3)p(tx+x,ty+th-7-((x*7)%3),1,2+((x*5)%3),MG.horror?'#3a0a0a':'#3a6a2a');
    // a lit line at the surface (the top): hauling it here is the goal
    p(tx,ty,tw,1,'#e8ecf0');p(tx,ty+1,tw,1,'rgba(255,255,255,.25)');
    const bh=Math.round(MG.size*th),by=ty+Math.round((1-MG.zone-MG.size)*th);p(tx+1,by,tw-2,bh,inside?'rgba(150,240,110,.62)':'rgba(120,210,90,.45)');p(tx+1,by,tw-2,1,inside?'#d8ffb0':'#b8f080');p(tx+1,by+bh-1,tw-2,1,'#3a7a2a');p(tx+1,by,1,bh,'rgba(220,255,200,.5)');
    // the treasure chest (when there is one): a little strongbox in the water, a fill bar under it; it bursts gold when hauled
    const tr=MG.tr;if(tr&&MG.age>tr.at&&(!tr.got||tr.pop>0)){const cy=ty+Math.round((1-tr.y)*th)-4,cx=tx+6,open=tr.got;
      p(cx-1,cy-1,11,9,'#1a0e06');p(cx,cy+(open?2:0),9,7-(open?2:0),'#8a5a2a');p(cx,cy+3,9,1,'#e8c060');p(cx+4,cy+3,1,2,'#fff2c8');
      if(!open)p(cx,cy,9,2,'#a87038');else{p(cx,cy-2,9,2,'#a87038');for(let k=0;k<5;k++)p(cx+((k*3+Math.round(t*20))%9),cy-3-((k*5)%5),1,1,'#fff2a0');}
      if(!open){p(cx-1,cy+9,11,2,'#1a0e06');p(cx,cy+9,Math.round(9*tr.prog),1,'#ffd27a');}}
    const im=MG.sp?fishIconCanvas(MG.sp):null;
    const fy=MG.landed?ty-Math.round(Math.min(1,MG.landed/.55)*34):ty+Math.round((1-MG.fy)*th);
    const sh=(inside?0:Math.round(Math.sin(t*50)))+(MG.lunge>0?Math.round(Math.sin(t*90)*2):0);
    if(MG.landed){for(const s of (MG.splash||[]))p(tx+tw/2+s.x,ty+(s.y||0),1,2,'#cfe8f2');p(tx,ty-1,tw,2,'#dfeef4');}  // it breaks the surface
    const fr=MG.landed?(-Math.PI/2*.85-0.6*Math.min(1,MG.landed/.3)):(-Math.PI/2*.85+Math.sin(t*6)*.08);
    if(im){g.save();g.translate(tx+tw/2+sh,fy);if(MG.horror)g.filter='hue-rotate(160deg) brightness(.8)';g.rotate(fr);g.drawImage(im,0,0,32,32,-9,-9,18,18);g.restore();}
    else{p(tx+5+sh,fy-3,9,6,'#5a5a5a');p(tx+6+sh,fy-3,7,1,'#9a9a9a');}
    p(px-1,ty-1,pw+2,th+2,'#1a0e06');p(px,ty,pw,th,'#2a1608');const ph=Math.round(clamp(MG.prog,0,1)*th);const pc=MG.prog<.33?'#d84a2a':MG.prog<.66?'#e8b030':'#7cc04a';p(px+1,ty+th-ph,pw-2,ph,pc);p(px+1,ty+th-ph,pw-2,1,'#fff4c0');
    if(MG.perfect&&MG.age>.6)for(let k=0;k<2;k++)p(px+1+((Math.round(t*8)+k*3)%(pw-2)),ty+th-ph+1+k,1,1,'#ffffff');
    // the line-tension gauge (left): green when slack, amber, then red near snapping — ease off before it fills
    p(tnx-1,ty-1,tnw+2,th+2,'#1a0e06');p(tnx,ty,tnw,th,'#241208');
    const th2=Math.round(clamp(MG.tn,0,1)*th),tc=MG.tn<.5?'#4a8a3a':MG.tn<.8?'#e0a828':'#e23a1a';
    p(tnx,ty+th-th2,tnw,th2,tc);if(th2)p(tnx,ty+th-th2,tnw,1,'#ffeab0');
    p(tnx-1,ty+Math.round(th*.17),tnw+2,1,'#8a1a10');                    // the red line: hold past here and it goes
    if(MG.tn>.82&&Math.floor(t*10)%2)for(let y=ty;y<ty+th;y+=2)p(tnx,y,tnw,1,'rgba(255,70,40,.55)');
    const rx=tx+Math.round(tw/2),ry=H-8;g.fillStyle='#1a0e06';g.beginPath();g.arc(rx,ry,6.5,0,Math.PI*2);g.fill();g.fillStyle='#c8a050';g.beginPath();g.arc(rx,ry,5.5,0,Math.PI*2);g.fill();g.fillStyle='#8a6a2a';g.beginPath();g.arc(rx,ry,3,0,Math.PI*2);g.fill();
    const a=MG.reelA;p(Math.round(rx+Math.cos(a)*5)-1,Math.round(ry+Math.sin(a)*5)-1,3,3,'#efe2b8');p(Math.round(rx+Math.cos(a)*5),Math.round(ry+Math.sin(a)*5),1,1,'#5a3a1a');p(rx,ry,1,1,'#fff2c8');
    const bend=MG.hold?3:1+Math.round(Math.abs(Math.sin(t*9)));for(let k=0;k<12;k++)p(W-9+Math.round(k*k*bend/90),ty+3+k*2,2,2,k<4?'#5a3a1a':'#8a5a2a');}

  endMG=function(ok){if(!MG.on&&!ok&&raf===0){/*already closed*/}MG.on=false;MG.hold=false;MG.landed=0;detach();cancelAnimationFrame(raf);raf=0;
    el().style.display='none';S.paused=false;fish.state='off';if(typeof F2!=='undefined')F2.rip=[];
    if(!ok){const snap=MG.snapped;toast(snap?(MG.f?`The line snaps. The ${MG.f[0].toLowerCase()} takes it down with it.`:'The line snaps.'):(MG.f?`The ${MG.f[0].toLowerCase()} got away.`:'It got away.'),snap?2.2:1.6,snap);SFX.thud&&SFX.thud(0,.2);if(snap&&cam)cam.shake=.4;return;}
    if(!MG.f){SFX.splash&&SFX.splash();toast('You reel in a tangle of weed and nothing else.',2);return;}
    const f=MG.f,sp=MG.sp;const len=Math.round(f[6]+rand()*(f[7]-f[6]));const big=(len-f[6])/Math.max(1,(f[7]-f[6]));const q=MG.perfect?2:big>.7?1:0;
    const v=Math.round(f[1]*(.8+big*.5)*(S.rod>=4?2.5:S.rod>=3?2:S.rod>=2?1.5:1)*[1,1.25,1.5][q]);
    S.fishLog=S.fishLog||{};const isNew=!S.fishLog[f[0]],rec=!isNew&&len>S.fishLog[f[0]];
    S.basket.push({kind:'fish',sp,value:v,len,q});S.fishCaught=(S.fishCaught||0)+1;S.fishLog[f[0]]=Math.max(S.fishLog[f[0]]||0,len);
    SFX.splash&&SFX.splash();if(typeof burst==='function')burst(fish.bx,fish.bz,16,'#9fc0e0',2,.7,3);if(typeof F2!=='undefined')F2.show={sp,until:performance.now()+2400};
    if(MG.perfect&&typeof addXP==='function')addXP('fishing',6);
    if(typeof fishCard==='function')fishCard(f,sp,len,v,q,isNew,rec,MG.perfect);
    if(MG.tr&&MG.tr.got)setTimeout(fishTreasure,1100);   // the chest you also hauled up pays out after the catch card
    if(FISH_ODD[f[0]]){setTimeout(()=>toast(FISH_ODD[f[0]],3.4,true),700);mindHit&&mindHit(2);}
    if(typeof updateHud==='function')updateHud();};
})();
