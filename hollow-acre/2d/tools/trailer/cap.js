// #200 teaser trailer: capture the game frame by frame on a fake clock (smooth 30 fps however slow the browser is).
//   node trailer/cap.js <outdir> [preview]     preview: 3 frames per shot to check framing
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2];const PREVIEW=process.argv[3]==='preview';const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const FPS=30,DT=1000/FPS;
const HIDE=`#arrow,#hud,#toast,#joy,#joyHint,#buttons,#saved,#fsBtn,#sndBtn,#fsX,#actChip,#fsTip,#placeBar,#htip,#maecard,#tut,#skip{display:none!important}#subs{transform:scale(2.1);transform-origin:50% 100%}`;
// every gameplay shot: where, when, what the player does, what happens on which frame
const SHOTS=[
 {name:'farm_morning',sec:3.2,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=7.2;P.x=-2;P.z=-7.5;P.dir='E';`,keys:['KeyD'],},
 {name:'farm_work',sec:3.4,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=8.2;S.slotSel=0;P.x=-4;P.z=-3;P.dir='S';`,each:{3:`useFront()`,24:`useFront()`,44:`S.slotSel=1;`,48:`useFront()`,72:`useFront()`}},
 {name:'green_noon',sec:3.0,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=14.5;P.x=44;P.z=9.6;P.dir='E';const ids=['silas','otto','ezra','orla','bram','hob','vera'];const sp=[[47,7],[50.5,11],[52,6.5],[45.5,12.5],[54,9.5],[49,4.5],[42.5,6]];ids.forEach((id,i)=>{const n=npcById(id);if(n){n.x=sp[i][0];n.z=sp[i][1];}});`,keys:['KeyD']},
 {name:'market',sec:2.6,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=10.5;P.x=33;P.z=-15.2;P.dir='E';`,keys:['KeyD']},
 {name:'festival',sec:3.0,setup:`S.day=21;S.hour=17.6;P.x=F_SQ.x-1.5;P.z=F_SQ.z+3.2;P.dir='N';`,settle:25000,keys:[]},
 {name:'caitlyn',sec:3.0,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=13;P.x=36;P.z=-14.4;P.dir='E';`,every:`{const n=npcById('mae');n.x=P.x+1.1;n.z=P.z;n.dir='W';n.loc='out';n.vis=true;}`,each:{8:`__game.talk('mae')`}},
 {name:'orchard',sec:2.6,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=17.4;P.x=40;P.z=55;P.dir='E';`,keys:['KeyD']},
 {name:'tithe_night',sec:3.0,setup:`S.day=12;S.hour=23;P.x=-24;P.z=90.5;P.dir='N';`,keys:['KeyW']},
 {name:'lake_night',sec:2.6,setup:`S.day=12;S.hour=23.4;P.x=186;P.z=3.6;P.dir='N';`,keys:[]},
 {name:'graves_night',sec:2.6,setup:`S.day=12;S.hour=0.5;P.x=55;P.z=-34;P.dir='N';`,keys:['KeyA']},
 {name:'corn_watch',sec:3.6,setup:`S.day=12;S.hour=22.5;P.x=-2;P.z=11.4;P.dir='S';window.__hfreeze=true;H.x=P.x+1.2;H.z=P.z-1.45;H.state='watch';H.watchT=99;H.vis=true;H.alpha=1;H.rise=1;H.crawl=0;H.burn=0;H.dir='S';H.clip='idle';H.lit=false;`,keys:[]},
 {name:'scare',sec:1.6,setup:`window.__hfreeze=false;S.day=12;S.hour=23.2;P.x=-2;P.z=12;P.dir='S';H.state='gone';H.timer=99;`,each:{12:`jumpScare('dark')`}},
];
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch();
 const pg=await b.newPage({viewport:{width:1920,height:1080}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
 await pg.clock.install({time:new Date('2026-10-04T21:40:00')});
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:120000});
 await pg.addStyleTag({content:HIDE});
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 let fi=0;const log=[];
 const frame=async(name,k)=>{const f=path.join(OUT,`${name}_${String(k).padStart(4,'0')}.png`);await pg.screenshot({path:f});fi++;};
 const pause=async()=>{const nw=await pg.evaluate(()=>Date.now());await pg.clock.pauseAt(nw+20);};
 // ---- the cold open: the drive, the voicemail, the crash
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});
 await pause();
 if(!ONLY||ONLY.includes('intro')){
   for(let g=0;g<400&&await ev("!(cine&&cine._st&&cine._st.t>=5.0)");g++)await pg.clock.runFor(100);
   let k=0;const t0=await ev("cine._st.t");
   while(await ev("!!(cine&&cine._st&&cine._st.t<"+(+process.env.INTRO_END||16.6)+")")&&k<460){await pg.clock.runFor(DT);if(!PREVIEW||k%60===0)await frame('intro',k);k++;}
   log.push({name:'intro',frames:k,t0});}
 await ev("__game.skip()");await pg.clock.runFor(1500);
 await ev("{const _h=hollowUpdate;hollowUpdate=function(dt){if(window.__hfreeze){H.t+=dt;H.ft+=dt;return 2;}return _h(dt);};}");await ev("S.readLetter=true;S.tut&&(S.tut.off=true);S.mode='play';S.paused=false;document.querySelectorAll('#tut,#maecard').forEach(e=>e.style.display='none');");
 for(const s of SHOTS){if(ONLY&&!ONLY.includes(s.name))continue;
   await ev("if(S.room)leaveRoom(true);");await ev("$('talk').hidden=true;S.mode='play';S.paused=false;H.state='gone';H.timer=999;H.vis=false;cam.shake=0;flashT=0;");
   await ev(s.setup);if(s.every)await ev(s.every);await pg.clock.runFor(s.settle||900);   // settle: the camera arrives, the light catches up
   for(const kk of s.keys||[])await pg.keyboard.down(kk);
   const N=Math.round(s.sec*FPS);
   for(let k=0;k<N;k++){if(s.every)await ev(s.every);if(s.each&&s.each[k])await ev(s.each[k]);await pg.clock.runFor(DT);if(!PREVIEW||k===0||k===Math.floor(N/2)||k===N-1)await frame(s.name,k);}
   for(const kk of s.keys||[])await pg.keyboard.up(kk);
   log.push({name:s.name,frames:N});}
 fs.writeFileSync(path.join(OUT,'log.json'),JSON.stringify({log,errs:errs.slice(0,5)},null,1));console.log(JSON.stringify(log),'errs',errs.length,errs.slice(0,2));await b.close();})();
