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
  {name:'lantern', sec:3.6, settle:300},   // cold open: a pool of light in the dark, a shape at its edge — then gone
  {name:'approach',sec:6.0, settle:300},   // you face us, unaware; the Hollow walks down out of the dark, growing, to right behind you
  {name:'well',    sec:3.8, settle:300},   // the drowned girl rises out of the well and points back down into it
  {name:'corn',    sec:4.2, settle:300},   // down the row toward the scarecrow; its head turns to you; then it is off the post, nearer
  {name:'chase',   sec:3.0, settle:300},   // you run at us, lantern swinging; it crawls after you, gaining
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
window.__endShot=function(){cine=null;S.paused=false;window.__shot=null;};
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
      draw(){const px=sx(6),py=sz(-8.6); const br=180+Math.sin(C.u*7)*6; __dark(px,py,66,br,.975); __vig(.64);}};
  }
  // ---- the approach: you face us; it comes down out of the dark behind you and grows
  else if(name==='approach'){
    S.hour=23.0; P.x=6; P.z=-8.4; P.dir='S'; P.clip='idle'; P.spd=0;
    C.cam={x:6,z:-7.8};
    cine={hidePlayer:false,cam:C.cam,
      update(dt){C.u+=dt; C.cam.z=-7.8-.24*__ss(__cl(.5,3.0,C.u));},   // a slow creep in while it descends
      drawables(D){const u=C.u;
        const t=__ss(__cl(.3,2.9,u));            // it ARRIVES by ~2.9s, then looms over you the rest of the shot
        const hz=-15.5+(-9.4-(-15.5))*t;         // from far up-screen to right behind you (you at -8.4)
        const arr=u>2.9?(u-2.9):0;               // once arrived: it breathes, huge, and leans in
        const sc=(.55+1.6*t)*(1+.05*Math.sin(arr*2.6));
        const lean=Math.round(Math.sin(arr*1.3)*5);
        const al=__cl(.3,1.0,u);
        const wf=frameOf('hollow','walk',u*5.0);
        D.push({z:hz,mind:1,draw(){__hol(6+lean*0.01,hz,'walk','S',wf,sc,al);if(t>.3)__ember(6,hz,sc,Math.min(.9,(t-.3)*1.5));}});},
      draw(){const px=sx(6),py=sz(-8.4);
        const pool=185-52*__cl(2.4,3.6,C.u);     // the safe pool tightens as it arrives over you
        __dark(px,py,56,pool,.93); __vig(.5);}};
  }
  // ---- the well: a pale girl rises out of the mouth and points back down into the water
  else if(name==='well'){
    S.hour=20.6; P.x=7.3; P.z=-8.0; P.dir='N'; P.clip='idle'; P.spd=0;
    C.cam={x:7.3,z:-9.4};
    cine={hidePlayer:true,cam:C.cam,
      update(dt){C.u+=dt;},
      drawables(D){const u=C.u;
        const rise=__ss(__cl(.5,2.6,u));          // she comes up out of the shaft and keeps rising, lifting clear of it
        const yoff=40-96*rise;                    // from deep in the dark shaft to floating above the well mouth
        const al=__cl(.5,1.6,u);
        const pt=u>2.9;                            // then lifts an arm and points back down into the water
        D.push({z:-9.9,mind:1,draw(){const X=sx(7.3),Y=sz(-10.5)-Math.round(yoff);
          const g=ctx2.createRadialGradient(X,Y-36,0,X,Y-36,92);g.addColorStop(0,'rgba(188,222,230,'+(al*.72)+')');g.addColorStop(.5,'rgba(150,200,214,'+(al*.3)+')');g.addColorStop(1,'rgba(150,200,214,0)');ctx2.fillStyle=g;ctx2.fillRect(X-92,Y-130,184,170);  // a cold drowned pallor, bright enough to read as a ghost
          drawSpr('ruth',X,Y,pt?'point':'walk','S',0,{alpha:al,scale:2.0});}});},
      draw(){const px=sx(7.3),py=sz(-12.2); __dark(px,py,110,270,.8); __vig(.6);}};
  }
  // ---- the corn: push down the row; the scarecrow's head turns to you; then it is off the post and nearer
  else if(name==='corn'){
    S.hour=22.4; P.x=-2; P.z=20; P.dir='N'; P.clip='idle'; P.spd=0;
    C.cam={x:-2,z:19.2};
    cine={hidePlayer:true,cam:C.cam,
      update(dt){C.u+=dt; C.cam.z=19.4-3.0*__ss(__cl(0,3.6,C.u));},   // a long slow push up the row toward it
      drawables(D){const u=C.u;
        const post=(X)=>{ctx2.fillStyle='#241810';ctx2.fillRect(Math.round(X)-1,Math.round(sz(13))-64,3,64);ctx2.fillRect(Math.round(X)-20,Math.round(sz(13))-52,41,3);};
        // the scarecrow hangs with its back to you; its head comes round to face you and the carved face lights
        const dir=u<1.8?'N':'S';
        D.push({z:12.9,mind:1,draw(){post(sx(-2));}});
        D.push({z:13,mind:1,draw(){__hol(-2,13,'walk',dir,0,.9,.99);if(dir==='S')__ember(-2,13,.9,__cl(1.8,2.4,u)*.95);}});},
      draw(){__vig(.5);}};
  }
  // ---- the chase: you run at us, lantern swinging; it crawls after you and gains
  else if(name==='chase'){
    S.hour=23.0; P.x=0; P.z=-3; P.dir='S'; P.clip='walk'; P.spd=3;
    C.cam={x:0,z:-2.2};
    cine={hidePlayer:false,cam:C.cam,
      update(dt){C.u+=dt; P.t=(P.t||0)+dt*2.2;},   // drive the run cycle while paused
      drawables(D){const u=C.u;
        const gain=__ss(__cl(0,3,u));
        const cz=-8.2 + (-5.4-(-8.2))*gain;         // crawls from behind, closing on you
        const sc=1.0+gain*.3;
        D.push({z:cz,mind:1,draw(){__hol(.1,cz,'crawl','S',frameOf('hollow','crawl',u*6)||0,sc,1);__ember(.1,cz,sc*.8,.85);}});},
      draw(){const px=sx(0),py=sz(-3); __dark(px,py,120,320,.82); __vig(.5);}};
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
