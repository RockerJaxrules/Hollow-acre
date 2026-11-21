// Directed horror shots for the teaser — MOTION, not static tableaux.
// The game is paused; every shot is driven purely through the `cine` director hook
// (cine.update advances time + actors, cine.cam drives the camera, cine.drawables injects
//  the moving Hollow/Ruth into the world z-sorted, cine.draw lays darkness over the top).
//   node cap_dir.js <outdir> [preview]     ONLY=approach,well node cap_dir.js tf
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2];const PREVIEW=process.argv[3]==='preview';
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const FPS=30,DT=1000/FPS;
const HIDE=`#arrow,#hud,#toast,#joy,#joyHint,#buttons,#saved,#fsBtn,#sndBtn,#fsX,#actChip,#fsTip,#placeBar,#htip,#maecard,#tut,#skip,#talk,#subs,#stgCap{display:none!important}`;

// Each shot: how long to roll, and a settle before capture. The director logic lives in INSTALL below.
const SHOTS=[
  {name:'lantern', sec:3.6, settle:300},   // cold open: a pool of light in the dark
  {name:'stalk',   sec:5.0, settle:400},   // the REAL Hollow stands in the dark, watching, then walks across the yard toward you
  {name:'well',    sec:3.8, settle:300},   // the Agnes heart event: the ghost girl stands by the well and points down into it
  {name:'chase',   sec:3.4, settle:400},   // you run; the REAL Hollow crawls after you down the path, gaining
  {name:'face',    sec:1.8, settle:200},   // the button: the face, held
];

// Installed once, inside game (eval) scope, so it can assign the module-scoped `cine`.
const INSTALL=`
window.__cl=(a,b,x)=>Math.max(0,Math.min(1,(x-a)/(b-a)));
window.__ss=x=>x*x*(3-2*x);
// a screen-space darkness with a soft pool punched out around (px,py); a>0
window.__dark=function(px,py,rin,rout,a){const g=ctx2.createRadialGradient(px,py,rin,px,py,rout);
  g.addColorStop(0,'rgba(2,2,5,0)');g.addColorStop(.6,'rgba(2,2,5,'+(a*.55)+')');g.addColorStop(1,'rgba(2,2,5,'+a+')');
  ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);};
window.__vig=function(a){const g=ctx2.createRadialGradient(VW/2,VH*.46,VH*.2,VW/2,VH*.5,VH*.85);
  g.addColorStop(0,'rgba(3,3,7,0)');g.addColorStop(1,'rgba(3,3,7,'+a+')');ctx2.fillStyle=g;ctx2.fillRect(0,0,VW,VH);};
window.__hol=function(x,z,clip,dir,wf,scale,alpha){drawSpr('hollow',sx(x),sz(z),clip,dir,wf,{scale:scale,alpha:alpha});};
// a faint carved-face ember so the Hollow reads as itself in the dark: two eyes + a mouth glow at the head
window.__ember=function(x,z,scale,a){const X=sx(x),Y=sz(z)-Math.round(42*scale);const r=Math.round(10*scale);
  for(const dx of [-Math.round(6*scale),Math.round(6*scale)]){const g=ctx2.createRadialGradient(X+dx,Y,0,X+dx,Y,r);
    g.addColorStop(0,'rgba(255,150,40,'+a+')');g.addColorStop(1,'rgba(255,120,30,0)');ctx2.fillStyle=g;ctx2.fillRect(X+dx-r,Y-r,r*2,r*2);}
  const gm=ctx2.createRadialGradient(X,Y+Math.round(10*scale),0,X,Y+Math.round(10*scale),r*1.1);
  gm.addColorStop(0,'rgba(255,110,20,'+(a*.8)+')');gm.addColorStop(1,'rgba(255,90,20,0)');ctx2.fillStyle=gm;ctx2.fillRect(X-r,Y,r*2.2,r*2.2);};
window.__endShot=function(){cine=null;S.paused=false;window.__shot=null;try{H.vis=false;H.state='gone';}catch(e){}};
window.__startShot=function(name){
  S.mode='play';S.paused=true;S.room=null;window.__shot=name;
  if(npcs)npcs.forEach(n=>n.vis=false); if(typeof ruth!=='undefined')ruth.vis=false; H.vis=false;
  const C={u:0, cam:{x:0,z:0}, _t0:performance.now()};
  // ---- cold open: a lantern pool in the black; a pale shape at the rim, gone before you are sure
  if(name==='lantern'){
    S.hour=23.2; P.x=6; P.z=-9; P.dir='N'; P.clip='idle'; P.spd=0;
    C.cam={x:6,z:-8.4};
    cine={hidePlayer:true,cam:C.cam,
      update(dt){C.u+=dt; C.cam.x=6+Math.sin(C.u*.4)*.35;},   // a lone lamp in the black, drifting — the subliminal face is laid in at the edit
      drawables(D){},
      draw(){__vig(.3);}};
  }
  // ---- the stalk: the REAL Hollow (the game's own entity, true size, shadow, burning eyes) stands in the
  //      dark watching, then walks across the yard toward you. Nothing scaled or floating — it's on the ground.
  else if(name==='stalk'){
    S.hour=22.6; P.x=2; P.z=-6.2; P.dir='N'; P.clip='idle'; P.spd=0;   // you stand in your lantern pool, facing it
    C.cam={x:2,z:-7.4};
    H.vis=true; H.x=2; H.z=-13.2; H.dir='S'; H.clip='frozen'; H.rise=1; H.alpha=1; H.burn=0; H.crawl=0; H.ft=0; H.lit=false;
    cine={hidePlayer:false,cam:C.cam,
      update(dt){C.u+=dt;
        if(C.u<1.8){ H.clip='frozen'; H.dir='S'; }                    // it stands still, watching, eyes burning
        else { const dx=P.x-H.x,dz=P.z-H.z,d=Math.hypot(dx,dz)||1;    // then it walks, steadily, over the ground toward you
          if(d>1.5){ H.clip='walk'; H.ft+=dt; const sp=1.9*dt; H.x+=dx/d*sp; H.z+=dz/d*sp;
            H.dir=(Math.abs(dx)>Math.abs(dz))?(dx>0?'E':'W'):(dz>0?'S':'N'); }
          else H.clip='frozen'; }
      },
      drawables(D){}, draw(){__vig(.3);}};
  }
  // ---- the well: a pale girl rises out of the mouth and points back down into the water
  else if(name==='well'){
    // faithful to the Agnes heart event: the ghost girl (Ruth) COMES TO STAND just left of the well,
    // translucent, looking at you, then lifts an arm and points down into the well.
    S.hour=19.0; P.x=7.0; P.z=-8.4; P.dir='N'; P.clip='idle'; P.spd=0;   // the Agnes event is at dusk, not deep night
    C.cam={x:6.8,z:-9.0};
    cine={hidePlayer:true,cam:C.cam,
      update(dt){C.u+=dt;},
      drawables(D){const u=C.u;
        const a=Math.min(.64,__cl(.5,2.2,u)*.64);  // she fades in, translucent — a child in a white dress
        const pt=u>2.5;                              // then turns to the well and points down into it
        const bob=Math.round(Math.sin(u*1.9));
        D.push({z:-9.86,mind:1,draw(){const X=sx(6.18),Y=sz(-9.86)-bob;
          const g=ctx2.createRadialGradient(X,Y-30,0,X,Y-30,66);g.addColorStop(0,'rgba(188,218,228,'+(a*.55)+')');g.addColorStop(1,'rgba(170,205,215,0)');ctx2.fillStyle=g;ctx2.fillRect(X-66,Y-92,132,120);  // a cold drowned pallor
          drawSpr('ruth',X,Y,pt?'point':'walk',pt?'E':'S',0,{alpha:a,scale:1.3});}});},
      draw(){__vig(.34);}};
  }
  // ---- the chase: you run south down the path; the REAL Hollow crawls after you, gaining. World scrolls with you.
  else if(name==='chase'){
    S.hour=23.0; P.x=2; P.z=-4; P.dir='S'; P.clip='walk'; P.spd=3;
    C.cam={x:2,z:-3.4};
    H.vis=true; H.x=2; H.z=-9.5; H.dir='S'; H.clip='crawl'; H.rise=1; H.alpha=1; H.burn=0; H.crawl=1; H.ft=0; H.lit=false;
    cine={hidePlayer:false,cam:C.cam,
      update(dt){C.u+=dt;
        const run=2.5;                                   // you run south; the camera and the whole yard scroll with you
        P.z+=run*dt; P.t=(P.t||0)+dt*2.4; P.clip='walk'; P.dir='S'; P.spd=3;
        C.cam.x=2; C.cam.z=P.z-.6;
        const gap=3.3-1.2*__ss(__cl(0,3.2,C.u));         // it closes from ~3.3 tiles behind to ~2.1
        H.x=2; H.z=P.z-gap; H.clip='crawl'; H.dir='S'; H.ft+=dt;
      },
      drawables(D){}, draw(){__vig(.3);}};
  }
  // ---- the button: the face, held
  else if(name==='face'){
    S.hour=23; cine={hidePlayer:true,cam:{x:0,z:-6},update(dt){},drawables(D){},draw(){}};
    try{const c=document.getElementById('scare');c.hidden=false;c.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:5;display:block;';drawScare(1);}catch(e){}
  }
  cine._t0=performance.now();
};
'ok';`;

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch();
 const pg=await b.newPage({viewport:{width:1920,height:1080}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:120000});
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const hide=()=>pg.addStyleTag({content:HIDE});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});
 await sleep(400);await ev("try{__game.skip();}catch(e){}");await sleep(600);await hide();
 await ev("S.readLetter=true;S.tut&&(S.tut.off=true);S.mode='play';S.paused=false;document.querySelectorAll('#tut,#maecard').forEach(e=>e.style.display='none');");
 const ir=await ev(INSTALL); console.log('install:',ir);
 const log=[];
 for(const s of SHOTS){if(ONLY&&!ONLY.includes(s.name))continue;
   await ev("try{__startShot('"+s.name+"')}catch(e){window.__err=e.message}");
   const er=await ev("window.__err||''"); if(er)console.log(s.name,'ERR',er);
   await sleep(s.settle);await hide();
   const N=Math.round(s.sec*FPS);
   for(let k=0;k<N;k++){await sleep(DT);if(!PREVIEW||k%6===0||k===N-1){await pg.screenshot({path:path.join(OUT,s.name+'_'+String(k).padStart(4,'0')+'.png')});}}
   await ev("try{__endShot()}catch(e){}");await sleep(150);
   log.push({name:s.name,frames:N});console.log(s.name,'done',N,'frames');
 }
 fs.writeFileSync(path.join(OUT,'dir_log.json'),JSON.stringify({log,errs:errs.slice(0,6)},null,1));
 console.log('ERR',errs.slice(0,4));await b.close();})();
