/* ================= #213 the staged car repair, as its own minigame =================
   The car wrecked completely — folded around the oak. Fixing it is no longer one press:
   it is a run of stages (winch it off the tree, beat the frame, the belt and radiator, the
   wheel, the glass, the wiring, then turn it over), each its own minigame, and the SAME car on
   the canvas mends a part at a time as you go. Two honest mechanics drive them all — cranking a
   handle in even circles (the winch, the ignition) and timing a strike into a moving band (the
   hammer, the torque wrench, the clamps, the glazing, the connectors) — so they read the way the
   rest of the game's making games do, but the picture is all car.  All pixels here are drawn, ours. */

// ---- the car-bay scene: a roadside at dusk, the dead oak, a shoulder, a work light on a pole
(function(){ if(typeof MG4ART==='undefined') return;
  MG4ART.paint.carbay=(K)=>{const g=K.g,W=320,H=180;
    // sky: a cold dusk, lighter at the horizon
    for(let y=0;y<112;y++){const t=y/112;g.fillStyle=`rgb(${Math.round(22+t*46)},${Math.round(20+t*40)},${Math.round(34+t*30)})`;g.fillRect(0,y,W,1);}
    // a far tree line
    for(let x=0;x<W;x+=1){const h=14+Math.sin(x*.07)*5+Math.sin(x*.21+2)*3;K.px(x,96-h,1,h+6,'#17201c');}
    // the dead oak at the right edge — a bent trunk the car was wrapped around
    g.fillStyle='#241a16';for(let y=0;y<96;y++){const x=286+Math.sin(y*.03)*4;K.px(x,16+y,10- (y>60?(y-60)*.12:0),1,'#241a16');}
    K.px(290,14,8,10,'#2c201a');for(const[bx,by,bl,ba] of [[288,34,-30,-.5],[294,48,24,.4],[286,62,-20,-.2]]){for(let i=0;i<Math.abs(bl);i++){const x=288+ (bl<0?-i:i),y=by-i*Math.tan(ba)*.5;K.px(x,y,3,3,'#2c201a');}}
    // the shoulder and the road
    K.px(0,110,W,8,'#3a3a40');K.px(0,110,W,1,'#4a4a52');for(let y=0;y<62;y++){K.px(0,118+y,W,1,`rgb(${28-y*.1|0},${28-y*.1|0},${32-y*.1|0})`);}
    for(let x=10;x<W;x+=40)K.px(x,146,18,3,'#6a6658');// centre line, worn
    // gravel and oil on the shoulder
    for(let i=0;i<70;i++){const x=(i*47%W),y=112+ (i*29%6);K.pa(x,y,1,1,'#55525a',.5);}
    K.pa(120,124,80,10,'#0a0608',.4);
    // the work-light pole on the left
    K.px(20,40,2,80,'#1a1a1e');K.px(14,38,16,6,'#2a2a30');K.px(15,40,14,3,'#ffe6a0');};
  MG4ART.anim.carbay=(K,t)=>{// the work light flickers a little
    const a=.5+Math.sin(t*3.1)*.04+ (Math.sin(t*23)>.9?-.12:0);K.glow(22,43,70,'255,224,150',.22*a);};
  // the light is a data object like the other scenes: a warm pool over the work light and car, then the built-in vignette
  MG4ART.LIGHT.carbay={x:96,y:118,r:168,c:'250,222,150',a:.15,mote:'#9aa0b4'};
})();

// ---- CARV: the side-view beater, facing left, drawn in whatever repair state it has reached.
//  cx = centre, by = ground contact line, s = scale (1 ≈ 118px long). state has booleans
//  winched/frame/rad/wheel/glass/wires/running. opt.active = the part being worked now; opt.p = its 0..1 progress.
function CARV(K,cx,by,s,state,t,opt){opt=opt||{};const g=K.g;
  const RED=['#1c0c0a','#3a1410','#56201a','#6e2c22','#8a3a2c','#a8503c','#c06a52','#d8907a'];// rust-red beater body
  const PRM=['#14141a','#24242c','#34343e','#46464f','#585863','#6c6c78','#84848f','#a0a0ab'];// grey primer panel
  const GL=['#0e1a1e','#16303a','#1f4a56','#2f6a76','#58a0a8'];// windshield glass
  const px=(x,y,w,h,c)=>K.px(cx+x*s,by+y*s,Math.max(1,w*s),Math.max(1,h*s),c);
  const fr=!!state.frame,bob=state.running?Math.sin(t*20)*.7:0;
  // when still on the tree the whole front rides up; the winch minigame lowers it as you crank
  const nose=state.winched?0:(opt.active==='winch'?(1-(opt.p||0))*6:6);
  const FW=-30,RW=30,wheelY=-7,wr=7;// wheel centres
  // ground shadow
  g.globalAlpha=.38;K.ell(cx+2*s,by+1*s,52*s,7*s,'#0a0608');g.globalAlpha=1;
  // oak trunk the nose is folded into (right side, behind) or the jack under the front (once off)
  if(!state.winched){px(50,-30,13,34,'#281d18');px(50,-30,13,2,'#36271f');px(52,-30,2,34,'#1c140f');}
  else {px(FW-4,-3,8,4,'#30303a');px(FW-3,-6,6,4,'#3a3a46');px(FW-1,1,4,3,'#1c1c22');}// floor jack
  // --- wheels
  const wheel=(wx,wy)=>{const X=cx+wx*s,Y=by+wy*s;
    g.fillStyle='#0a0a0e';g.beginPath();g.arc(X,Y,wr*s,0,6.29);g.fill();
    g.fillStyle='#1c1c22';g.beginPath();g.arc(X,Y,(wr-1)*s,0,6.29);g.fill();
    g.fillStyle='#060608';g.beginPath();g.arc(X,Y,(wr-2.3)*s,0,6.29);g.fill();
    g.fillStyle='#53535e';g.beginPath();g.arc(X,Y,2.4*s,0,6.29);g.fill();g.fillStyle='#24242c';g.beginPath();g.arc(X,Y,1*s,0,6.29);g.fill();
    g.fillStyle='#2c2c34';for(let k=0;k<5;k++){const a=k/5*6.28+.3;g.fillRect(X+Math.cos(a)*3.4*s-.5,Y+Math.sin(a)*3.4*s-.5,1.4,1.4);}};
  wheel(RW,wheelY);
  if(state.wheel)wheel(FW,wheelY);
  else {px(FW-5,-3,10,4,'#2a241c');px(FW-5,-5,10,2,'#201a14');px(FW-4,-1,8,2,'#332b20');}// on blocks
  // === lower body: one mass from nose to tail, fender arches over the wheels ===
  const bC=fr?RED[4]:RED[3];
  px(-47,-11+bob,94,10,bC);           // flank
  px(-47,-11+bob,94,1,RED[6]);        // lit top edge of the flank
  px(-44,-1+bob,88,1,RED[1]);         // sill shadow
  // fender arches
  for(const wx of (state.wheel?[FW,RW]:[RW])){K.ell(cx+wx*s,by+(-10+bob)*s,10*s,6*s,bC);K.ell(cx+wx*s,by+(-11+bob)*s,10*s,5*s,'#1a0c0a');}
  px(-47,-11+bob,94,10,null==null?bC:bC);// (re-lay flank over arch tops)
  for(const wx of (state.wheel?[FW,RW]:[RW])){g.save();g.beginPath();g.rect(cx+(wx-10)*s,by+(-2+bob)*s,20*s,8*s);g.clip();g.fillStyle='#120807';g.beginPath();g.arc(cx+wx*s,by+(wheelY+bob)*s,(wr+1.5)*s,Math.PI,6.29);g.fill();g.restore();}
  // === front: hood (straight) or a crumpled, primered mass (folded) ===
  if(fr){
    px(-47,-12+bob+nose*.2,30,2,RED[5]);     // hood top, lit
    px(-48,-9+bob,3,8,RED[2]);               // nose cap
    px(-48,-6+bob,3,4,'#15151a');            // front grille
    for(let k=0;k<3;k++)px(-48,-6+bob+k*1.3,3,.7,'#33333c');
    const lit=state.wires||state.running;px(-48,-9+bob,2,3,lit?'#ffe9b0':'#6a6652');if(lit)K.glow(cx-47*s,by+(-8+bob)*s,20,'255,226,150',.55);
    px(-49,-2+bob,5,2,'#2a2a32');            // front bumper
  } else {
    // crushed: a bank of jagged, caved panels, bare primer, bumper hanging — all ridden up
    for(let i=0;i<11;i++){const jx=-47+i*2.6,jh=(5+Math.sin(i*1.7+1)*3+(i<5?3:0));px(jx,-7-jh*.5-nose+bob,2.6,jh+5,i%2?RED[2]:PRM[2]);}
    px(-48,-10-nose+bob,6,10,PRM[1]);        // torn-paint primer
    px(-47,-1+bob,8,3,'#1a1a1e');px(-45,1+bob,5,2,'#101014');// bumper torn loose and hanging
    if(opt.active==='frame'){const d=opt.p||0;for(let i=0;i<11;i++){const jx=-47+i*2.6,jh=(5+Math.sin(i*1.7+1)*3)*(1-d)+2;px(jx,-2-jh+bob,2.6,jh,RED[3+(i%2)]);}}
  }
  // === hood seam / open radiator bay with steam, until the rad is done ===
  if(fr){ if(!state.rad){px(-40,-12+bob,16,3,'#0a0a0e');// hood up: a dark gap
      if(opt.active==='rad'){px(-40,-11+bob,16*(opt.p||0),2,RED[4]);}
      for(let i=0;i<4;i++){const a=(t*.8+i*.4)%1;K.pa(cx+(-38+i*4)*s,by+(-13-a*9+bob)*s,3*s,3*s,'#c6c6cc',(1-a)*.4);}
    } else {px(-41,-11+bob,18,1,RED[6]);px(-41,-10+bob,18,1,RED[1]);}// closed seam
  }
  // === the greenhouse cabin, in the MIDDLE, with pillars ===
  // roof
  px(-14,-25+bob,30,2,RED[4]);px(-14,-26+bob,30,1,RED[6]);
  // pillars (front slants forward, rear slants back)
  for(let i=0;i<13;i++){px(-15-i*.5,-24+i+bob,2,1,RED[3]);px(16+i*.5,-24+i+bob,2,1,RED[3]);}
  px(-16,-13+bob,34,2,RED[2]);// belt line under the glass
  // windows: one greenhouse split by a B-pillar
  const winT=-23,winX=-10,winW=24;
  if(state.glass){
    px(winX,winT+bob,winW,9,GL[1]);                 // glass
    px(winX,winT+bob,winW,1,GL[4]);                 // top sheen
    px(winX+1,winT+1+bob,2,7,GL[3]);                // a bright reflection streak
    px(winX+8,winT+bob,1,9,RED[2]);                 // B-pillar
    px(winX+winW-3,winT+1+bob,2,6,'#bfeaf0');
  } else {
    px(winX,winT+bob,winW,9,'#0c1316');px(winX,winT+bob,winW,1,'#203236');
    const ix=cx+(winX+5)*s,iy=by+(winT+5+bob)*s;g.strokeStyle='#7fa0a6';g.lineWidth=Math.max(1,.5*s);
    for(const[dx,dy] of [[-5,-3],[-4,3],[0,4],[5,2],[6,-2],[-2,-4]]){g.beginPath();g.moveTo(ix,iy);g.lineTo(ix+dx*s,iy+dy*s);g.stroke();}
    g.lineWidth=Math.max(1,.4*s);g.beginPath();g.arc(ix,iy,3*s,2.2,5.2);g.stroke();
    px(winX+4,winT+4+bob,2,2,'#aec6ca');
    if(opt.active==='glass')px(winX,winT+bob,winW*(opt.p||0),9,GL[1]);
  }
  // === tail: deck, light ===
  px(40,-13+bob,7,3,RED[5]);px(45,-9+bob,3,3,state.running?'#e86048':'#7a2a22');// tail light
  px(46,-2+bob,4,2,'#2a2a32');// rear bumper
  // door line + handle
  px(2,-13+bob,1,12,RED[1]);px(-4,-16+bob,4,1,'#15151a');
  // wiring tell: a faint green dash glow once wired, before it runs
  if(state.wires&&!state.running)K.glow(cx+(-2)*s,by+(-17+bob)*s,13,'120,200,160',.32);
  // running: exhaust puff off the tail and a lit headlight
  if(state.running){for(let i=0;i<3;i++){const a=(t*1.1+i*.33)%1;K.pa(cx+(49+a*10)*s,by+(-2-a*4+bob)*s,3*s,3*s,'#6a6a70',(1-a)*.5);}}
}

// ---- the flexible car-repair step. one of two mechanics, the car drawn in the given state.
S4.car=(sp,K,run,def)=>{const g=K.g,W=320,H=180;
  const state=sp.state||{},N=sp.n|| (sp.mech==='crank'?7:5);
  const cx=168,by=118,s=sp.s||1.45;
  const st={t:0,done:false,score:0, ang:0,last:null,spd:0,coils:[],ok:0,end:0, pos:40,dir:1,vel:(sp.fast||110),zc:.5,zw:.16,hits:[],reps:0,miss:0,flash:0,snap:0};
  let amb=null;
  const mech=sp.mech;
  // the band wanders to a new spot after each strike
  const moveZone=()=>{st.zc=.22+Math.random()*.56;st.zw=(sp.zw||.15)*(sp.hard?.8:1);};
  moveZone();
  const prog=()=>mech==='crank'?Math.min(1,st.coils.length/N):Math.min(1,st.reps/N);
  const finishStep=()=>{st.done=true;st.score=Math.max(.3,Math.min(1,
    mech==='crank'?(st.coils.length?st.ok/st.coils.length:.5):(st.hits.length?st.hits.reduce((a,b)=>a+b,0)/st.hits.length-st.miss*.04:.5)));};
  return {
    title:sp.title||'Repair',
    how:mech==='crank'
      ?(K.fine?'Turn the handle in even circles with the mouse (or hold Space). Keep a steady pace — not too fast, not too slow.':'Turn the handle by drawing even circles with your finger. Keep a steady pace.')
      :(K.fine?'A marker sweeps the bar. Click (or press Space) when it is inside the green band. '+N+' times.':'A marker sweeps the bar. Tap when it is inside the green band. '+N+' times.'),
    hint:mech==='crank'?'Even circles. Watch the pace gauge.':'Strike inside the green band.',
    st,
    update(dt,I,t){st.t+=dt;if(st.flash>0)st.flash-=dt;if(st.snap>0)st.snap-=dt;
      if(!amb)amb=MS.loop('bandpass',mech==='crank'?700:520,2);
      if(st.end){st.end+=dt;amb.set(0);if(st.end>.5)finishStep();return;}
      if(mech==='crank'){
        let da=0;const ccx=252,ccy=62;
        if(I.key&&I.down)da=dt*6.0;
        else if(I.down){const a=Math.atan2(I.y-ccy,I.x-ccx);if(st.last!=null){let d=a-st.last;if(d>Math.PI)d-=6.283;if(d<-Math.PI)d+=6.283;da=Math.max(0,d);}st.last=a;}
        else st.last=null;
        st.ang+=da;st.spd+=(da/Math.max(.001,dt)-st.spd)*Math.min(1,dt*5);
        amb.set(da>0?Math.min(.09,st.spd*.011):0,480+st.spd*70,2);
        while(st.ang>=6.283){st.ang-=6.283;const sdv=st.spd,good=sdv>3.0&&sdv<9.2;st.coils.push(good?1:0);if(good){st.ok++;A.tone(820,.04,'triangle',.05);}else{A.tone(560,.05,'sawtooth',.05);K.judge(.25,cx,by-54,true);}st.snap=.25;}
        if(st.coils.length>=N&&!st.end){st.end=.001;MS.good();}
      } else {
        // a marker bounces 0..1 across the bar; strike it inside the green band
        if(st._p==null)st._p=.5;st._p+=st.dir*st.vel*dt*.0016;if(st._p>1){st._p=1;st.dir=-1;}if(st._p<0){st._p=0;st.dir=1;}
        amb.set(.02,480+Math.abs(st._p-.5)*200,2);
        if(I.pressed&&!st.end){const d=Math.abs(st._p-st.zc),half=st.zw;
          if(d<=half){const acc=1-d/half;st.hits.push(acc);st.reps++;st.flash=.2;K.judge(acc>.75?1:.6,cx+(st._p-.5)*120,by-52);A.tone(760+acc*300,.05,'triangle',.06);MS.good();
            st.vel=Math.min(260,st.vel+10);moveZone();if(st.reps>=N){st.end=.001;}}
          else {st.miss++;K.judge(.1,cx+(st._p-.5)*120,by-52);A.tone(300,.06,'sawtooth',.05);MS.miss();st.flash=.12;}
        }
      }
    },
    draw(t,phase){
      // draw the car in its state so far, with the active part animating toward done
      CARV(K,cx,by,s,state,t,{active:sp.fix,p:prog()});
      if(mech==='crank'){
        // the winch/crank handle, top-right, with its rope/cable running to the car's frame
        const ccx=252,ccy=62,CR=15;
        g.strokeStyle='#5a5048';g.lineWidth=Math.max(1,1.2);g.beginPath();g.moveTo(ccx-6,ccy+2);g.lineTo(cx-40,by-10);g.stroke();
        K.px(ccx-10,ccy-10,20,20,'#20202a');K.px(ccx-10,ccy-10,20,2,'#30303c');
        g.fillStyle='#15151c';g.beginPath();g.arc(ccx,ccy,CR,0,6.29);g.fill();g.fillStyle='#3a3a44';g.beginPath();g.arc(ccx,ccy,CR-3,0,6.29);g.fill();
        const hx=ccx+Math.cos(st.ang)*CR,hy=ccy+Math.sin(st.ang)*CR;K.line(ccx,ccy,hx,hy,'#8a8490',3);K.px(hx-3,hy-3,6,6,'#b85a2a');m4hand(K,hx,hy+1);
        g.strokeStyle='rgba(255,244,192,.25)';g.lineWidth=1;g.beginPath();g.arc(ccx,ccy,CR,0,6.29);g.stroke();
      } else {
        // the strike bar across the bottom
        const bx=46,bw=228,byb=150;
        K.px(bx-2,byb-2,bw+4,12,'#1a0e06');K.px(bx,byb,bw,8,'#20140a');
        const z0=bx+bw*(st.zc-st.zw),zw=bw*st.zw*2;K.px(z0,byb,zw,8,'#2c5a1c');K.px(z0,byb,zw,1,'#9be07a');K.px(z0,byb+7,zw,1,'#1c3a12');
        const mx=bx+bw*(st._p==null?.5:st._p);K.px(mx-1,byb-3,3,14,st.flash>0?'#fff4c0':'#e8c060');K.px(mx,byb-4,1,16,'#1a0e06');
        for(let i=0;i<N;i++){const dot=i<st.reps;K.px(bx+4+i*7,byb-10,5,4,dot?'#7cc04a':'#4a4038');}
      }
    },
    hud(t){if(mech==='crank'){K.label('PACE',150,14,'#f4ecd8','r');K.gauge(156,14,96,6,3.0/12,9.2/12,Math.min(12,st.spd)/12);K.meter(prog(),st.coils.length?st.ok/st.coils.length:1);}
      else {K.label(sp.hudlabel||'FIT',150,14,'#f4ecd8','r');K.meter(prog(),st.hits.length?st.hits.reduce((a,b)=>a+b,0)/st.hits.length:.6);}},
    auto(dt,AP,t){const a=m4ai(this,AP,dt);if(mech==='crank'){if(this._a==null)this._a=0;this._a+=dt*5.6;m4move(a,252+Math.cos(this._a)*30,62+Math.sin(this._a)*30);m4hold(a,true);}
      else {const bx=46,bw=228;m4move(a,bx+bw*st.zc,150);m4hold(a,false);if(Math.abs((st._p==null?.5:st._p)-st.zc)<st.zw*.5)AP.press=true;}AP.hand=[a.x+2,a.y-10];},
    stop(){amb&&amb.stop();amb=null;}
  };
};

// ---- launch one stage's minigame; state reflects fixes already done.
function carMg(stage,done){S.cgTut=S.cgTut||{};
  const cs=S.carStage||0;
  const state={winched:cs>=1,frame:cs>=2,rad:cs>=3,wheel:cs>=4,glass:cs>=5,wires:cs>=6,running:false};
  const def={scene:'carbay',icon:stage.icon||'wrench',steps:[{k:'car',mech:stage.mg.mech,n:stage.mg.n,fix:stage.id,title:stage.mg.title,state,hudlabel:stage.mg.hud}]};
  mg4Run(def,stage.mg.name,done,stage.icon||'wrench');
}
