// #200 teaser trailer: capture the game frame by frame on a fake clock (smooth 30 fps however slow the browser is).
//   node trailer/cap.js <outdir> [preview]     preview: 3 frames per shot to check framing
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const OUT=process.argv[2];const PREVIEW=process.argv[3]==='preview';const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const FPS=30,DT=1000/FPS;
const HIDE=`#arrow,#hud,#toast,#joy,#joyHint,#buttons,#saved,#fsBtn,#sndBtn,#fsX,#actChip,#fsTip,#placeBar,#htip,#maecard,#tut,#skip{display:none!important}#subs{transform:scale(2.1);transform-origin:50% 100%}`;
// every gameplay shot: where, when, what the player does, what happens on which frame
const SHOTS=[
 // every move is directed: the player walks a navigation path (round fences and walls) to a mark, then does one thing
 {name:'farm_dawn',sec:3.6,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=6.9;P.x=0;P.z=-8.55;P.dir='S';P.fx=0;P.fz=1;camSet(-2.2,-8.4);`,each:{0:`camPan(-2.2,-8.4,1.2,-5.6,3.6)`,8:`walkTo(2.2,-5.2,.7)`}},
 {name:'field_work',sec:5.0,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=8.4;P.x=-4.4;P.z=-0.4;P.dir='E';S.slotSel=2;camSet(-3.0,0.6);`,each:{2:`walkTo(-2.6,0.78,.62)`,32:`window.__drive=null;P.dir='S';P.fx=0;P.fz=1;`,36:`useFront()`,66:`useFront()`,92:`S.slotSel=0;`,96:`useFront()`,122:`S.slotSel=1;`,126:`useFront()`}},
 {name:'chop',sec:4.4,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=9.6;S.tools.axe=2;P.x=-3.9;P.z=-12.5;P.dir='W';P.fx=-1;P.fz=0;S.slotSel=3;camSet(-6.0,-12.6);`,each:{2:`walkLine(-5.75,-12.5,.62)`,30:`window.__drive=null;P.dir='W';P.fx=-1;P.fz=0;`,32:`useFront()`,62:`useFront()`,92:`useFront()`}},
 {name:'town',sec:3.6,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=14.6;P.x=48.5;P.z=6.2;P.dir='S';P.fx=0;P.fz=1;const ids=['silas','otto','ezra','orla','bram','hob','vera'];const sp=[[45,7.5],[51.5,10.5],[52.5,6.8],[45.4,11.6],[54.2,9.2],[50.8,4.6],[43.6,9.6]];ids.forEach((id,i)=>{const n=npcById(id);if(n){n.x=sp[i][0];n.z=sp[i][1];}});camSet(48.5,7.6);`,each:{0:`camFollow(0,-.6,1.5)`,4:`walkTo(48.5,11.4,.6)`}},
 {name:'caitlyn',sec:3.6,setup:`S.day=(()=>{let d=4;while(rainDay(d))d++;return d;})();S.hour=13;P.x=33.6;P.z=-14.5;P.dir='E';camSet(36.2,-14.6);`,every:`{const n=npcById('mae');n.x=37.3;n.z=-14.4;n.dir='W';n.loc='out';n.vis=true;}`,
   each:{3:`walkTo(36.2,-14.45,.7)`,52:`faceTo&&faceTo(37.3,-14.4);P.dir='E';`,56:`__game.talk('mae')`}},
 {name:'festival',sec:3.4,setup:`S.day=21;S.hour=17.6;P.x=F_SQ.x-4.2;P.z=F_SQ.z+1.6;P.dir='E';camSet(F_SQ.x-1.8,F_SQ.z-1.4);`,settle:25000,each:{4:`walkTo(F_SQ.x-2.0,F_SQ.z-.4,.55)`}},
 {name:'tithe_night',sec:3.4,setup:`S.day=12;S.hour=23;P.x=-26;P.z=93.6;P.dir='N';P.fx=0;P.fz=-1;camSet(-26,88.8);`,each:{6:`walkLine(-26,90.7,.5)`}},
 {name:'lake_night',sec:3.0,setup:`S.day=12;S.hour=23.4;P.x=186;P.z=4.3;P.dir='S';P.fx=0;P.fz=1;camSet(186,6.0);`,each:{4:`walkLine(186,7.1,.42)`}},
 {name:'graves_night',sec:3.0,setup:`S.day=12;S.hour=0.5;P.x=54;P.z=-38.6;P.dir='E';P.fx=1;P.fz=0;camSet(55.4,-39.6);`,each:{0:`camFollow(1.2,-1.0,1.4)`,4:`walkLine(59.0,-38.6,.5)`}},
 {name:'corn_watch',sec:4.6,setup:`S.day=12;S.hour=22.5;window.__hfreeze=false;S.fuel=100;sputCD=99;sputT=0;P.x=-1.3;P.z=9.6;P.dir='S';P.fx=0;P.fz=1;H.state='gone';H.vis=false;H.timer=99;camSet(-1.3,9.0);`,
   each:{0:`camFollow(0,-2.3,2)`,2:`walkLine(-1.3,13.4,.55)`,14:`H.x=P.x+.4;H.z=P.z-5.0;collide(H,.4);H.state='stalk';H.vis=true;H.alpha=1;H.rise=.4;H.crawl=0;H.burn=0;H.stung=false;H.grace=0;H.spd=2.3;H.t=0;`,30:`window.__drive=null;`,44:`faceTo(H.x,H.z);`,46:`faceTo(H.x,H.z);`}},
 {name:'scare',sec:1.3,setup:`window.__hfreeze=false;S.day=12;S.hour=23.2;S.fuel=100;sputCD=99;sputT=0;P.x=-5.5;P.z=-6.3;P.dir='E';H.state='gone';H.vis=false;H.timer=99;H.grace=0;camSet(-3.6,-6.6);`,each:{0:`camFollow(.9,-.4,2)`,1:`walkLine(4,-6.3,.62)`,10:`sputT=1.4;SFX.sputter&&SFX.sputter();`,24:`window.__drive=null;jumpScare('dark')`}},
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
 await ev(`window.__drive=null;{const _mi=mindInput;mindInput=function(mx,mz){const d=window.__drive;if(d&&d.i<d.pts.length&&!P.anim&&S.mode==='play'){const [tx,tz]=d.pts[d.i];const dx=tx-P.x,dz=tz-P.z,L=Math.hypot(dx,dz);if(L<.16){d.i++;return _mi(0,0);}const k=d.k*Math.min(1,L*3+.3);return _mi(dx/L*k,dz/L*k);}return _mi(mx,mz);};}
   window.walkTo=(x,z,k)=>{let p=null;try{p=navPath(P.x,P.z,x,z);}catch(e){}const pts=(p&&p.length?p.map(q=>[q[0],q[1]]):[]);pts.push([x,z]);window.__drive={pts,i:0,k:k||.7};};
   window.camSet=(x,z)=>{cine={cam:{x,z}};};
   window.walkLine=(x,z,k)=>{window.__drive={pts:[[x,z]],i:0,k:k||.7};};
   window.__nohl=true;{const _cc=computeContext;computeContext=function(){const r=_cc.apply(this,arguments);if(window.__nohl)hlTile=null;return r;};}
   window.camPan=(x0,z0,x1,z1,dur)=>{const st={t:0};cine={cam:{x:x0,z:z0},update(dt){st.t+=dt;const u=Math.min(1,st.t/dur),e=u*u*(3-2*u);this.cam.x=x0+(x1-x0)*e;this.cam.z=z0+(z1-z0)*e;}};};
   window.camFollow=(ox,oz,lag)=>{const c=cine&&cine.cam?{x:cine.cam.x,z:cine.cam.z}:{x:P.x+ox,z:P.z+oz};cine={cam:c,update(dt){const k=1-Math.exp(-dt*(lag||2));this.cam.x+=(P.x+ox-this.cam.x)*k;this.cam.z+=(P.z+oz-this.cam.z)*k;}};};`);
 await ev("{const _h=hollowUpdate;hollowUpdate=function(dt){if(window.__hfreeze){H.t+=dt;H.ft+=dt;return 2;}return _h(dt);};}");await ev("S.readLetter=true;S.tut&&(S.tut.off=true);S.mode='play';S.paused=false;document.querySelectorAll('#tut,#maecard').forEach(e=>e.style.display='none');");
 for(const s of SHOTS){if(ONLY&&!ONLY.includes(s.name))continue;
   await ev("if(S.room)leaveRoom(true);");await ev("$('talk').hidden=true;cine=null;window.__drive=null;S.mode='play';S.paused=false;H.state='gone';H.timer=999;H.vis=false;cam.shake=0;flashT=0;");
   await ev(s.setup);if(s.every)await ev(s.every);await pg.clock.runFor(s.settle||900);   // settle: the camera arrives, the light catches up
   for(const kk of s.keys||[])await pg.keyboard.down(kk);
   const N=Math.round(s.sec*FPS);
   for(let k=0;k<N;k++){if(s.every)await ev(s.every);if(s.each&&s.each[k])await ev(s.each[k]);if(PREVIEW&&s.name==='corn_watch'&&k%6===0)console.log(k,await ev("H.state+' d='+Math.hypot(P.x-H.x,P.z-H.z).toFixed(2)+' lit='+H.lit+' burn='+(H.burn||0).toFixed(2)+' mode='+S.mode"));await pg.clock.runFor(DT);if(!PREVIEW||k%8===0||k===N-1)await frame(s.name,k);}
   for(const kk of s.keys||[])await pg.keyboard.up(kk);await ev('cine=null;window.__drive=null;');
   log.push({name:s.name,frames:N});}
 fs.writeFileSync(path.join(OUT,'log.json'),JSON.stringify({log,errs:errs.slice(0,5)},null,1));console.log(JSON.stringify(log),'errs',errs.length,errs.slice(0,2));await b.close();})();
