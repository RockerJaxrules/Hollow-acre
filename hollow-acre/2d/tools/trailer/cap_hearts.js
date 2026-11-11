// Capture heart-event cutscene shots for the teaser, on the REAL clock (the stage beat-system drives cleanly there).
//   node cap_hearts.js <outdir> [preview]
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2];const PREVIEW=process.argv[3]==='preview';const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const FPS=30,DT=1000/FPS;
const HIDE=`#arrow,#hud,#toast,#joy,#joyHint,#buttons,#saved,#fsBtn,#sndBtn,#fsX,#actChip,#fsTip,#placeBar,#htip,#maecard,#tut,#skip,#talk,#subs,#stgCap{display:none!important}`;
// each heart shot: the scene, the beat to reach, extra settle for a ramp (ghost fade / Hollow loom), how long to roll
const SHOTS=[
  {name:'hs_agnes', id:'agnes', title:'The music box, played', target:6, ramp:1400, sec:3.4},   // Ruth at the well, pointing in
  {name:'hs_june',  id:'june',  title:'The route',             target:5, ramp:200,  sec:3.2},   // a watcher at every lit window
  {name:'hs_ada',   id:'ada',   title:'What stands behind you',target:3, ramp:4200, sec:3.2},   // the Hollow looms behind you
];
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
 await ev("if(STG){cine=null;STG=null;}S.mode='play';S.paused=false;S.room=null;P.x=0;P.z=-6;playScene('silas','warm','x',()=>{});");
 await sleep(1200);await ev("if(STG){try{stgEnd()}catch(e){}}");await sleep(400);
 const beatI=()=>ev("STG?STG.i:-1");const log=[];
 for(const s of SHOTS){if(ONLY&&!ONLY.includes(s.name))continue;
   await ev("if(STG){cine=null;STG=null;}if(S.room)try{leaveRoom(true)}catch(e){}S.mode='play';S.paused=false;S.room=null;P.x=0;P.z=-6;playScene('"+s.id+"','"+s.title.replace(/'/g,"\\'")+"','x',()=>{});");
   // wait for the scene (interiors need a room transition) to come up
   for(let w=0;w<30;w++){if(await beatI()>=0)break;await sleep(300);}
   await sleep(1000);await hide();
   // advance one beat at a time (double-next completes typing then advances); hold beats get real time so ramps accumulate
   for(let k=0;k<40;k++){const i=await beatI();if(i>=s.target)break;if(i<0){await sleep(300);continue;}await ev("try{stgNext()}catch(e){}");await sleep(1400);}
   await sleep(s.ramp);await hide();
   const N=Math.round(s.sec*FPS);const i0=await beatI();
   for(let k=0;k<N;k++){await sleep(DT);if(!PREVIEW||k%8===0||k===N-1){await pg.screenshot({path:path.join(OUT,`${s.name}_${String(k).padStart(4,'0')}.png`)});}}
   await ev("if(STG){try{stgEnd()}catch(e){}}");await sleep(300);
   log.push({name:s.name,frames:N,landedBeat:i0});console.log(s.name,'landed beat',i0,'frames',N);
 }
 fs.writeFileSync(path.join(OUT,'hearts_log.json'),JSON.stringify({log,errs:errs.slice(0,5)},null,1));
 console.log('ERR',errs.slice(0,3));await b.close();})();
