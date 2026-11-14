/* t337: the whole-game playthrough bot. Plays Hollow Acre start to finish, fast, the way a player goes through it, and looks at
   everything a player would see: the title and character creation, the crash, the first lessons, every story beat of all three
   chapters to the ending, the credits and the start again; every region and place by day, dusk, night and in bad weather; every
   room; and every system (farming, fishing, mining, the making games, shops, the farm book, the ledger and businesses, the land
   office, the house, decorating, the festivals, the menus, friends and heart events, a scare, the multiplayer screens and the
   settings). At every stop it saves a screenshot and the game's state, measures the frame rate, and runs the checks a careful
   player would notice (text spilling out of its box, a toast over the player, broken images, NaN in the HUD, page errors).
   Two players run at once: one plays the story through, the other walks the world and tries every system.

   Usage: node playthrough.js <url of a non-mangled test build> <outdir> [--quick]
   Writes <outdir>/shots/*.png, <outdir>/report.json, <outdir>/summary.md and <outdir>/sheets/<section>_NN.png.
   The review that follows is described in REVIEW.md. */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const URL_=process.argv[2]||'http://localhost:8766/t337/base.html',OUT=path.resolve(process.argv[3]||path.join(__dirname,'run')),QUICK=process.argv.includes('--quick');
for(const d of ['shots','sheets'])fs.mkdirSync(path.join(OUT,d),{recursive:true});
const INPAGE=fs.readFileSync(path.join(__dirname,'inpage.js'),'utf8'),STORY=fs.readFileSync(path.join(__dirname,'story.js'),'utf8');
const T0=Date.now();const el=()=>((Date.now()-T0)/1000).toFixed(0)+'s';
const report={url:URL_,started:new Date().toISOString(),stops:[],steps:[],errors:[],forced:[],failed:[],story:{objectives:[]}};
let shotN=0;

async function newPlayer(tag){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:1});
  await ctx.route('**/fonts.googleapis.com/**',r=>r.abort());await ctx.route(/nostr|relay|degmods|peerjs|trystero/,r=>r.abort());await ctx.route('**/version.json*',r=>r.abort());
  const P={tag,b,ctx,errs:[],section:'',W:ms=>new Promise(r=>setTimeout(r,ms))};
  P.attach=pg=>{P.pg=pg;
    pg.on('pageerror',e=>{const m=String(e.message).slice(0,300);P.errs.push(m);report.errors.push({player:tag,section:P.section,t:el(),msg:m});});
    pg.on('console',m=>{if(m.type()==='error'){const t=m.text();if(/Failed to load resource|net::ERR|favicon|fonts\.g|WebSocket connection to 'wss:/.test(t))return;const s=t.slice(0,300);P.errs.push(s);report.errors.push({player:tag,section:P.section,t:el(),msg:'console: '+s});}});
    pg.on('crash',()=>{P.crashed=true;report.errors.push({player:tag,section:P.section,t:el(),msg:'THE PAGE CRASHED'});console.log(`  [${tag}] page crashed`);});
    pg.on('dialog',d=>{report.errors.push({player:tag,section:P.section,t:el(),msg:'dialog: '+d.type()+' '+d.message().slice(0,120)});d.dismiss().catch(()=>{});});};
  P.attach(await ctx.newPage());
  // every call into the page has a time limit, so a frozen or crashed page can never hang the bot
  const lim=(p,ms,dflt)=>Promise.race([p.catch(()=>dflt),new Promise(r=>setTimeout(()=>r(dflt),ms))]);
  P.ev=async(code,ms=8000)=>{try{return await lim(P.pg.evaluate(c=>{try{return __game.ev(c);}catch(e){return {__err:e.message};}},code),ms,{__err:'timeout'});}catch(e){return {__err:String(e.message).slice(0,200)};}};
  P.click=sel=>lim(P.pg.evaluate(s=>{const e=document.querySelector(s);if(e&&e.offsetParent!==null){e.click();return true;}return false;},sel),4000,false);
  P.clickText=(re,scope)=>lim(P.pg.evaluate(([src,sc])=>{const R=new RegExp(src,'i');const e=[...document.querySelectorAll((sc||'')+' button,'+(sc||'')+' .tab,'+(sc||'')+' [role=button]')].find(b=>b.offsetParent!==null&&R.test(b.textContent.trim()));if(e){e.click();return e.textContent.trim().slice(0,30);}return false;},[re.source||re,scope||'']),4000,false);
  // a page that crashed or stopped answering: open the game again in a fresh tab and carry on from the last save
  P.recover=async why=>{report.failed.push({player:tag,section:P.section,step:'the game stopped responding ('+why+'): reopened from the last save',err:why});console.log(`  [${tag}] RECOVER: ${why}`);
    try{await lim(P.pg.close(),5000,null);}catch(e){}P.crashed=false;P.attach(await ctx.newPage());
    try{await P.pg.goto(URL_,{timeout:120000});}catch(e){}
    await lim(P.pg.waitForFunction(()=>window.__game&&__game.S&&__game.S.mode==='title'&&!document.getElementById('loadScr'),null,{timeout:150000}),160000,null);
    const cont=await P.clickText(/Continue|Load|Resume/);await P.W(cont?5000:500);
    if(!cont){await P.click('#begin');await P.W(700);await P.click('#cGo');await P.W(900);}
    await P.ev("try{__game.skip()}catch(e){}1");await P.W(1400);await P.ev(INPAGE);await P.ev(STORY);await P.ev("window.MG4_AUTO=true;window.CG_NO_TUT=true;S.tut&&(S.tut.off=true);1");return !!cont;};
  return P;}

// one stop: a screenshot and everything we can tell about it
async function shot(P,section,label,extra){P.section=section;const file=`shots/${String(shotN++).padStart(4,'0')}_${section}_${String(label).replace(/[^a-z0-9]+/gi,'_').slice(0,48)}.png`;
  try{await P.pg.screenshot({path:path.join(OUT,file),timeout:15000});}catch(e){report.failed.push({player:P.tag,section,step:'screenshot '+label,err:String(e.message).slice(0,120)});return;}
  let st=await P.ev('__pb.state()',4000),ck=await P.ev('__pb.check()',4000),sfx=await P.ev('__pb.takeSfx()',3000);
  let fps=null;if(!(extra&&extra.noFps)){try{fps=await Promise.race([P.pg.evaluate(()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(n<24)requestAnimationFrame(f);else r(Math.round(1000/((performance.now()-t0)/n)));};requestAnimationFrame(f);})),new Promise(r=>setTimeout(()=>r(null),2500))]);}catch(e){}}
  const errs=P.errs.splice(0);
  report.stops.push(Object.assign({n:shotN-1,player:P.tag,section,label,file,t:el(),fps,state:st&&!st.__err?st:null,check:ck&&!ck.__err?ck:null,sfx:sfx&&!sfx.__err?sfx:null,errors:errs},extra||{}));}

// run a step with a time limit; a failure is logged, never fatal
async function step(P,name,fn,ms=60000){if(P.crashed&&P.recover)await P.recover('the page crashed before: '+name);const t=Date.now();let ok=true,err=null;
  try{await Promise.race([fn(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timed out after '+ms/1000+'s')),ms))]);}catch(e){ok=false;err=String(e.message).slice(0,240);}
  report.steps.push({player:P.tag,section:P.section,step:name,ok,secs:+((Date.now()-t)/1000).toFixed(1),err});
  if(!ok){report.failed.push({player:P.tag,section:P.section,step:name,err});console.log(`  [${P.tag}] FAILED ${name}: ${err}`);}
  return ok;}

// close whatever is open, the way a player would (its button), up to n layers
async function clear(P,n=25){for(let k=0;k<n;k++){const c=await P.ev('__pb.close1()',3000);if(!c||c.__err)break;await P.W(140);}
  await P.ev("if(S.paused&&typeof SCENE!=='undefined'&&!SCENE&&$('note').hidden&&(!$('talk')||$('talk').hidden))S.paused=false;1");}

// boot a new game: title -> creator -> the drive -> the farm road
async function boot(P,{look=false}={}){await P.pg.goto(URL_);
  if(look){for(const ms of [700,2200]){await P.W(ms);const ld=await P.pg.evaluate(()=>!!document.getElementById('loadScr')).catch(()=>false);if(!ld)break;try{await P.pg.screenshot({path:path.join(OUT,`shots/${String(shotN).padStart(4,'0')}_opening_loading_screen.png`)});report.stops.push({n:shotN,player:P.tag,section:'opening',label:'loading screen',file:`shots/${String(shotN).padStart(4,'0')}_opening_loading_screen.png`,t:el(),errors:[]});shotN++;}catch(e){}}}await P.pg.waitForFunction(()=>window.__game&&__game.S&&__game.S.mode==='title'&&!document.getElementById('loadScr'),null,{timeout:150000}).catch(()=>{});
  await P.pg.evaluate(()=>{try{localStorage.clear();}catch(e){}});
  await P.ev(INPAGE);await P.ev(STORY);await P.ev("window.MG4_AUTO=true;window.CG_NO_TUT=true;1");
  if(look){P.section='opening';await P.W(1600);await shot(P,'opening','title screen');
    if(await P.clickText(/How to play/)){await P.W(500);await shot(P,'opening','how to play');await P.clickText(/How to play/);}}
  await P.click('#begin');await P.W(700);
  if(look){for(const tab of ['Face','Hair','Clothes','Extras']){if(await P.clickText(new RegExp('^'+tab+'$'),'#creator')){await P.W(350);await shot(P,'opening','creator '+tab,{noFps:true});}}
    try{await P.pg.fill('#cName','Robin');}catch(e){}}
  await P.click('#cGo');await P.W(900);
  if(look){for(let i=0;i<5;i++){await P.W(2200);const u=await P.ev('__pb.ui()');if(!u||!u.cine)break;await shot(P,'opening','intro drive '+(i+1),{noFps:true});}}
  await P.ev("try{__game.skip()}catch(e){}1");await P.W(1400);
  await P.ev(INPAGE);await P.ev(STORY);await P.ev("window.MG4_AUTO=true;window.CG_NO_TUT=true;1");}

// ---------------------------------------------------------------- player one: the opening and the whole story
const STORY_BUDGET=(QUICK?5:11)*60e3;
async function playStory(P){
  await step(P,'boot and opening',()=>boot(P,{look:true}),180000);
  P.section='opening';
  // the first lessons, as a new player sees them
  await step(P,'first lessons',async()=>{await shot(P,'opening','arrival on Route 9');
    for(let i=0;i<4;i++){if(!(await P.click('#tutNext')))break;await P.W(450);await shot(P,'opening','tutorial tip '+(i+2),{noFps:true});}
    await P.click('#tutSkip');await P.click('#lsSkip');await P.ev("S.tut&&(S.tut.off=true);1");},60000);
  const t0=Date.now();let last='',same=0,it=0,chapterSeen=0,uiShots=0;
  const sec=st=>st&&st.done?'ending':st&&st.chapter===3?'chapter3':st&&st.chapter===2?'chapter2':'chapter1';
  while(Date.now()-t0<STORY_BUDGET&&it<700){it++;
    const st=await P.ev('__pb.state()');if(!st||st.__err||P.crashed){P.dead=(P.dead||0)+1;if(P.crashed||P.dead>=16){await P.recover(P.crashed?'the page crashed':'no answer for ~10 s at goal '+(last||'?'));P.dead=0;}else await P.W(500);continue;}
    P.dead=0;
    P.section=sec(st);
    if(st.done)break;
    // special modes play out on their own: the ritual, a cutscene, a scare, a fade between places
    // never let one mode hold the story: after a dozen turns stuck in it, step out and say so (a place a player may be stuck too)
    P.modeStuck=(st.mode===P.lastMode&&st.mode!=='play')?(P.modeStuck||0)+1:0;P.lastMode=st.mode;
    if(P.modeStuck>5){await P.ev("try{if(typeof STG!=='undefined'&&STG&&typeof stgEnd==='function')stgEnd();}catch(e){}try{if(typeof RU!=='undefined'&&RU.on)ruClose();}catch(e){}S.mode='play';S.paused=false;1");
      report.forced.push({t:el(),chapter:st.chapter,goal:st.obj,text:st.objText,what:'FORCED out of mode '+st.mode+' (stuck six turns)'});console.log('    FORCED out of mode',st.mode);P.modeStuck=0;continue;}
    // an in-world scene (people walking and talking, a caption box): tap through it like a player, looking at it on the way
    {const u0=await P.ev('__pb.ui()');if(u0&&!u0.__err&&(u0.stage||u0.closeup||u0.note||u0.talk)&&['cine','play','ritual'].includes(st.mode)){
      for(let k=0;k<80;k++){const u1=await P.ev('__pb.ui()');if(!u1||u1.__err||!(u1.stage||u1.closeup||u1.note||u1.talk))break;
        if(u1.stage&&(k===1||k===6||k===14))await shot(P,P.section,'in-world scene '+(st.obj||''),{noFps:true});else if(u1.closeup&&k<2)await shot(P,P.section,'close-up '+(st.obj||''),{noFps:true});
        await P.ev('__pb.close1()');await P.W(u1.stage?700:350);}
      continue;}}
    if(['ritual','cine','scare','trans','scene','caught','dead'].includes(st.mode)&&!(await P.ev('__pb.ui().scene'))){
      const m=st.mode;let k=0;for(;k<40;k++){await P.W(500);const s2=await P.ev('S.mode');if(s2!==m)break;if(k%6===2)await shot(P,P.section,m+' '+(st.obj||''),{noFps:true});}
      if(k>=40){await P.click('#skip');await P.W(800);}continue;}
    const key=st.obj+'|'+(st.objText||'').replace(/\d+ m [a-z-]+|[←→↑↓↖↗↘↙]/g,'').slice(0,60);
    if(key!==last){last=key;same=0;report.story.objectives.push({t:el(),day:st.day,hour:st.hour,chapter:st.chapter,title:st.obj,text:st.objText});
      console.log(`  [story ${el()}] d${st.day} ch${st.chapter} [${st.obj}] ${(st.objText||'').slice(0,90)}`);
      if(st.chapter!==chapterSeen){chapterSeen=st.chapter;await P.W(1500);await shot(P,P.section,'chapter '+st.chapter+' begins');}
      await shot(P,P.section,'goal '+st.obj,{goal:st.objText});}
    else same++;
    let r=await P.ev('__pb.story()');if(r&&r.__err)r='ERR '+r.__err;
    if(same>=6){const f=await P.ev('__pb.force()');if(f&&!f.__err){r+=' || '+f;report.forced.push({t:el(),chapter:st.chapter,goal:st.obj,text:st.objText,what:f});same=0;console.log('   ',f);}}
    // nothing to do but let the days pass
    if(st.room!=='undercroft'&&(r==='sleep'||/^(idle|ward|ask around|wait for)/.test(r)&&same>=3||st.obj==='ERR'&&same>=4)){
      await P.ev("(()=>{try{if(S.room)leaveRoom();}catch(e){}if(S.mode!=='play')return;S.hour=22.5;P.x=doorPos.x;P.z=doorPos.z+.8;try{sleep();}catch(e){newDay();}})()");await P.W(2200);
      const u=await P.ev('__pb.ui()');if(u&&(u.summary||u.note)){if(uiShots++<6)await shot(P,P.section,'morning after the night',{noFps:true});}r+=' -> slept';}
    await P.W(650);
    // what opened over the game
    let u=await P.ev('__pb.ui()');if(!u||u.__err)continue;
    if(u.cine){for(let k=0;k<26&&u.cine;k++){await P.W(500);if(k===3||k===12)await shot(P,P.section,'cutscene '+st.obj,{noFps:true});u=await P.ev('__pb.ui()');}if(u&&u.cine){await P.click('#skip');await P.W(700);}}
    if(u&&u.mg){await P.W(2600);await shot(P,P.section,'minigame '+st.obj,{noFps:true});await P.W(1500);await P.click('#mg4Skip');await P.W(900);
      for(let k=0;k<20;k++){u=await P.ev('__pb.ui()');if(!u||!u.mg)break;await P.W(500);if(k===6)await P.click('#mg4Skip');}}
    u=await P.ev('__pb.ui()');
    const open=u&&!u.__err?Object.keys(u).filter(k=>!['mode','paused','tip'].includes(k)&&u[k]):[];
    const okey=open.join('+')+'|'+st.obj;P.seen=P.seen||{};P.seen[okey]=(P.seen[okey]||0)+1;
    if(open.length&&P.seen[okey]<=2&&!open.every(k=>k==='summary'&&uiShots>8)){
      if(u.scene){await shot(P,P.section,'scene '+st.obj,{noFps:true});for(let k=0;k<30;k++){const s=await P.ev("typeof SCENE!=='undefined'&&!!SCENE");if(!s)break;await P.click('#scene');await P.W(160);if(k===3)await shot(P,P.section,'scene '+st.obj+' (later)',{noFps:true});}}
      else await shot(P,P.section,open.join('+')+' '+st.obj,{noFps:true});}
    await clear(P);}
  // ---- the ending: the choice, the scene, the credits, the end card, the morning after and starting again
  P.section='ending';
  await step(P,'ending',async()=>{const st=await P.ev('__pb.state()');report.story.reached=st;
    if(!(st&&st.done)){report.failed.push({player:P.tag,section:'ending',step:'story not finished in the time budget',err:JSON.stringify(st&&{obj:st.obj,ch:st.chapter,day:st.day})});return;}
    for(let k=0;k<30;k++){const s=await P.ev("typeof SCENE!=='undefined'&&!!SCENE");if(!s)break;if(k%5===0)await shot(P,'ending','ending scene '+(k/5+1),{noFps:true});await P.click('#scene');await P.W(400);}
    for(let k=0;k<8;k++){await P.W(1800);const cr=await P.pg.evaluate(()=>{const e=document.getElementById('credits2');return !!(e&&e.style.display==='block');});if(!cr)break;await shot(P,'ending','credits '+(k+1),{noFps:true});if(k===3){await P.click('#credits2');}}
    await P.click('#credits2');await P.W(3000);await shot(P,'ending','after the credits',{noFps:true});await P.click('#credits2');await P.W(3000);
    await shot(P,'ending','end card');
    if(await P.click('#keepFarming')){await P.W(7000);await shot(P,'ending','keep farming: the morning after');
      const m=await P.ev("S.st.mail?(()=>{__pb.goAct(MAILPOS.x,MAILPOS.z);return 1;})():0");await P.W(900);if(m)await shot(P,'ending','the letter after',{noFps:true});await clear(P);
      await P.ev("S.hour=11;P.x=48;P.z=4;1");await P.W(1500);await shot(P,'ending','the town after the story');}
  },150000);
  await step(P,'new game plus',async()=>{await P.ev("try{saveGame&&saveGame(true);}catch(e){}1");await P.pg.reload();
    await P.pg.waitForFunction(()=>window.__game&&__game.S&&__game.S.mode==='title',null,{timeout:150000}).catch(()=>{});await P.W(1500);await shot(P,'ending','title after finishing');
    if(await P.clickText(/Continue|Load|Resume/)){await P.W(5000);await clear(P);await shot(P,'ending','continued from the save');}},180000);}

// ---------------------------------------------------------------- player two: the world, every room, and every system
async function tour(P){
  await step(P,'boot',()=>boot(P),180000);
  P.section='world';
  await P.ev("S.tut&&(S.tut.off=true);S.readLetter=true;S.foundCabin=true;S.everTilled=S.everPlanted=S.everWatered=true;S.shipped=Math.max(1,S.shipped);S.q.hollis=1;S.day=3;S.hour=11;S.coins=3000;1");
  await P.click('#tutSkip');await clear(P);
  const go=async(x,z,h,d,weather)=>{await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}})()`);await P.W(250);
    await P.ev(`S.day=${d||3};S.hour=${h||11};S.storm=${weather==='storm'};${weather==='rain'?"S.rain=1;S.weather='rain';":"S.rain=0;"}${weather==='fog'?"S.fog=1;S.weather='fog';":""}__pb.near(${x},${z},.2);P.dir='S';1`);await P.W(900);};
  // ---- every region, landmark and place, by day
  const stops=await P.ev(`(()=>{const out=[];const add=(name,x,z,kind)=>{if(!isFinite(x)||!isFinite(z))return;if(out.some(s=>Math.hypot(s.x-x,s.z-z)<(kind==='region'?20:12)))return;out.push({name,x:+(+x).toFixed(1),z:+(+z).toFixed(1),kind});};
    for(const m of (typeof RG_MILES!=='undefined'?RG_MILES:[]))add('region '+m.name,m.x,m.z,'region');
    for(const p of (typeof MAP_PLACES!=='undefined'?MAP_PLACES:[]))add('place '+p[0],p[1],p[2],'place');
    for(const [k,v] of Object.entries(typeof TB!=='undefined'?TB:{}))add('building '+k,v[1],v[2]+2.2,'building');
    for(const p of (typeof LAND_PARCELS!=='undefined'?LAND_PARCELS:[]))add('land '+p.name,p.x0+p.w/2,p.z0+p.h/2,'land');
    return out;})()`);
  const list=(Array.isArray(stops)?stops:[]).slice(0,QUICK?18:70);console.log(`  [tour] ${list.length} places`);
  for(const s of list)await step(P,'visit '+s.name,async()=>{await go(s.x,s.z,s.kind==='region'?12:11,3);await shot(P,'world',s.name,{x:s.x,z:s.z});},30000);
  // ---- dusk, night, rain, fog and a storm in the busiest places
  P.section='night';
  const busy=list.filter(s=>s.kind==='building'||/Hollow Acre|Marrow|Wickham|church|square/i.test(s.name)).slice(0,QUICK?3:7);
  for(const [lab,h,d,w] of [['dusk',18.6,3,null],['night',22.5,3,null],['rain',13,4,'rain'],['fog',8,5,'fog'],['storm night',21.5,6,'storm']])
    for(const s of busy.slice(0,lab==='night'?7:3))await step(P,lab+' '+s.name,async()=>{await go(s.x,s.z,h,d,w);await shot(P,'night',lab+' '+s.name,{x:s.x,z:s.z,weather:lab});},30000);
  await P.ev("S.rain=0;S.fog=0;S.weather=null;S.storm=false;1");
  // ---- every room
  P.section='interiors';
  const rooms=await P.ev(`JSON.stringify(Object.keys(ROOMS).filter(k=>ROOMS[k]&&ROOMS[k].w))`);const rl=JSON.parse(typeof rooms==='string'?rooms:'[]');
  console.log(`  [tour] ${rl.length} rooms`);
  let trN=0;
  for(const k of (QUICK?rl.slice(0,10):rl))await step(P,'room '+k,async()=>{await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}})()`);await P.W(300);
    await P.ev(`S.hour=12;try{enterRoom('${k}')}catch(e){}1`);if(trN++<3){await P.W(120);await shot(P,'interiors','going in: '+k+' (mid-transition)',{noFps:true});await P.W(1380);}else await P.W(1500);await shot(P,'interiors',k+' '+((await P.ev(`(ROOMS['${k}'].name||'')`))||''),{room:k});},30000);
  await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}})()`);await P.W(800);
  await systems(P,go);}

async function systems(P,go){
  const S_=async(section,label)=>shot(P,section,label,{noFps:true});
  // ---- farming: a day in the field, to the shipping bin and the night's summary
  P.section='farming';
  await step(P,'farming day',async()=>{await go(0,3,8,8);await S_('farming','the field in the morning');
    const tl=await P.ev(`(()=>{const f=tiles.filter(t=>!t.parcel&&!t.gh).slice(0,8);for(const t of f){t.tilled=true;}return f.length;})()`);
    await P.ev(`(()=>{const f=tiles.filter(t=>!t.parcel&&!t.gh&&t.tilled&&!t.crop).slice(0,1)[0];if(f){__pb.near(f.x,f.z,.9);P.anim=null;doTill(f);}})()`);await P.W(300);await S_('farming','hoeing a square');
    await P.ev(`(()=>{S.seeds.turnip=Math.max(S.seeds.turnip,8);S.sel='turnip';for(const t of tiles.filter(t=>!t.parcel&&!t.gh&&t.tilled&&!t.crop).slice(0,6))t.crop={type:'turnip',stage:0,growth:0,watered:false,pop:1};})()`);
    await P.ev(`(()=>{S.water=S.waterMax||10;const f=tiles.find(t=>t.crop&&!t.crop.watered);if(f){__pb.near(f.x,f.z,.9);P.anim=null;doWater(f);}})()`);await P.W(450);await S_('farming','watering seedlings');
    await P.ev(`for(const t of tiles)if(t.crop&&!t.gh){t.crop.watered=true;t.crop.growth=SEEDS[t.crop.type].grow*1.5;t.crop.stage=1;}1`);await P.W(500);await S_('farming','crops growing');
    await P.ev(`for(const t of tiles)if(t.crop&&!t.gh){t.crop.growth=SEEDS[t.crop.type].grow*3;t.crop.stage=3;}1`);await P.W(500);await S_('farming','crops ripe');
    await P.ev(`(()=>{const f=tiles.find(t=>t.crop&&t.crop.stage>=3&&!t.gh);if(f){__pb.near(f.x,f.z,.9);P.anim=null;doHarvest(f);}})()`);await P.W(600);await S_('farming','harvesting');
    await P.ev(`for(const t of tiles)if(t.crop&&t.crop.stage>=3&&!t.gh){S.basket.push({kind:t.crop.type,value:SEEDS[t.crop.type].sell});t.crop=null;}1`);
    await P.ev(`__pb.goAct(binPos.x,binPos.z)`);await P.W(600);await S_('farming','the shipping bin');await P.click('#sbCrops');await P.W(300);await S_('farming','shipped');await clear(P);
    await P.ev("(()=>{S.hour=22.5;P.x=doorPos.x;P.z=doorPos.z+.8;try{sleep();}catch(e){newDay();}})()");await P.W(2600);await S_('farming','the night’s takings');await clear(P);
    await P.ev("S.tools.can=Math.max(S.tools.can||1,2);1");await go(-1,6,9,9);await S_('farming','sprinklers and the field');},90000);
  // ---- fishing and the mine
  P.section='fishing';
  await step(P,'fishing',async()=>{await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}S.hour=10;__pb.near(fishSpot.x,fishSpot.z,.1);fishAct();fish.t=.4;})()`);await P.W(2400);await S_('fishing','casting at the pond');
    for(let k=0;k<4;k++){await P.W(1600);await S_('fishing','the catch '+(k+1));}await P.pg.keyboard.press('Escape');await clear(P);await P.ev("fish.state='off';S.paused=false;1");},40000);
  P.section='mining';
  await step(P,'mining',async()=>{await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}S.hour=10;})()`);await P.W(300);await P.ev(`try{mineEnter()}catch(e){enterRoom('mine')}1`);await P.W(2000);await S_('mining','inside the mine');
    await P.ev(`(()=>{const o=(MINE.ores||[]).find(o=>!o.hide);if(o){__pb.near(o.x,o.z,.8);__pb.act();}})()`);await P.W(900);await S_('mining','swinging at the rock');
    await P.ev(`try{mineFloor(5)}catch(e){}1`);await P.W(1200);await S_('mining','deeper floor');await P.ev(`try{mineFloor(12)}catch(e){}1`);await P.W(1200);await S_('mining','the deep');
    await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}})()`);await P.W(800);},60000);
  // ---- the making games: one of each kind
  P.section='making';
  const keys=await P.ev(`(()=>{const seen={},out=[];for(const k of Object.keys(MG4R)){const g=k.split(':')[0].replace(/^b_.*/,m=>m);const grp=g.startsWith('b_')?g:g;if(seen[grp])continue;seen[grp]=1;out.push(k);}return out;})()`);
  const mk=(Array.isArray(keys)?keys:[]).slice(0,QUICK?5:16);console.log(`  [tour] ${mk.length} making games`);
  for(const k of mk)await step(P,'minigame '+k,async()=>{await P.ev(`(()=>{window.MG4_AUTO=true;window.__mgDone=null;mg4Run(MG4R['${k}'],'${k}',q=>{window.__mgDone=q;},null);})()`);
    await P.W(1500);await S_('making',k+' (start)');await P.W(3000);await S_('making',k+' (playing)');
    for(let i=0;i<40;i++){const on=await P.ev('MG4.on');if(!on)break;await P.W(500);if(i===10)await S_('making',k+' (later)');if(i===24)await P.click('#mg4Skip');}
    await S_('making',k+' (result)');await clear(P);},60000);
  // ---- shops, the farm book, the ledger, the land office, the house
  P.section='shops';
  const vend=await P.ev(`Object.keys(vendors).filter(v=>!/^f2_|^fest/.test(v))`);
  for(const v of (Array.isArray(vend)?vend:[]).slice(0,QUICK?6:40))await step(P,'shop '+v,async()=>{await P.ev(`openShop('${v}');1`);await P.W(500);await S_('shops',v);await clear(P);},20000);
  P.section='business';
  for(const t of ['land','hands','tractor','town'])await step(P,'farm book '+t,async()=>{await P.ev(`empOpen('${t}');1`);await P.W(450);await S_('business','farm book: '+t);await clear(P);},20000);
  for(const t of ['shares','own'])await step(P,'ledger '+t,async()=>{await P.ev(`bizOpen('${t}');1`);await P.W(450);await S_('business','ledger: '+t);await clear(P);},20000);
  await step(P,'start a business',async()=>{await P.ev(`(()=>{S.biz=S.biz||{inv:{},own:null};if(!S.biz.own&&typeof BIZ_TYPES!=='undefined'){S.biz.own={name:'Robin’s Stand',type:'stand',staff:[],up:{},till:0,log:[]};}try{bizSign()}catch(e){}})()`);
    await P.ev(`bizOpen('own');1`);await P.W(450);await S_('business','your own shop');await clear(P);
    await go(typeof BIZ_SIGN!=='undefined'?47.6:48,0,11,9);await S_('business','your shop in town');},30000);
  await step(P,'land office',async()=>{await P.ev(`openShop('land');1`);await P.W(450);await S_('business','land office');await clear(P);},20000);
  await step(P,'house',async()=>{await P.ev(`openShop('plans');1`);await P.W(450);await S_('business','building plans');await clear(P);
    await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}enterRoom('cabin');})()`);await P.W(1600);await S_('business','the cabin inside');
    if(await P.ev(`typeof bmOpen==='function'?(bmOpen(),1):typeof buildModeOpen==='function'?(buildModeOpen(),1):0`)){await P.W(600);await S_('business','decorating');}await clear(P);
    await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}})()`);await P.W(800);},40000);
  // ---- festivals: each kind on its day
  P.section='festivals';
  for(const [d,name] of [[7,'Harvest Market'],[14,'Pumpkin Weigh-in'],[21,'Lantern Dance'],[28,'Hollow Fair']])await step(P,'festival '+name,async()=>{
    await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}S.day=${d};S.hour=${d===21?17.5:11};try{fDress()}catch(e){}try{f2D().open=1;}catch(e){}__pb.near(squarePos.x,squarePos.z+4,.2);})()`);await P.W(1800);await S_('festivals',name);
    await P.ev(`__pb.near(squarePos.x+6,squarePos.z+2,.2);1`);await P.W(900);await S_('festivals',name+' (the stalls)');},30000);
  for(const g of ['toss','bell','crows','bob','carve'])await step(P,'fair game '+g,async()=>{await P.ev(`(()=>{window.MG4_AUTO=true;S.day=28;S.hour=12;try{f2Play('${g}')}catch(e){}})()`);await P.W(1200);await P.pg.keyboard.press('Space');await P.W(3200);await S_('festivals','fair game '+g);
    for(let i=0;i<30;i++){const on=await P.ev('MG4.on');if(!on)break;await P.W(500);if(i===12)await P.click('#mg4Skip');}await clear(P);},45000);
  // ---- the menus and screens
  P.section='menus';
  await step(P,'menu tabs',async()=>{await P.ev(`(()=>{try{if(S.room)leaveRoom(true);}catch(e){}S.hour=11;S.day=9;})()`);await P.W(600);
    await P.ev('openBag();1');await P.W(500);
    for(const t of ['Items','Social','Skills','Map','Calendar','Journal','Together','Wardrobe','Dye','Craft']){const c=await P.clickText(new RegExp('^'+t+'$'));if(!c)continue;await P.W(700);await S_('menus','menu: '+t);
      if(t==='Craft'||t==='Wardrobe'||t==='Dye'||t==='Map'){await clear(P,3);await P.ev('openBag();1');await P.W(400);}}
    await clear(P);},90000);
  await step(P,'buttons that do nothing',async()=>{report.buttons=report.buttons||[];await clear(P);await P.ev('openBag();1');await P.W(500);
    const labels=await P.pg.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&b.textContent.trim()).map(b=>b.textContent.trim().slice(0,30)));
    for(const lb of (Array.isArray(labels)?labels:[]).filter(l=>!/quit|new game|delete|reset|log ?out|sign ?out|leave|exit|title/i.test(l)).slice(0,30)){
      const before=await P.pg.evaluate(()=>document.body.innerText.length+'|'+[...document.querySelectorAll('div,section')].filter(e=>e.offsetParent!==null).length).catch(()=>'');
      const ok=await P.clickText(new RegExp('^'+lb.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'));await P.W(450);
      const after=await P.pg.evaluate(()=>document.body.innerText.length+'|'+[...document.querySelectorAll('div,section')].filter(e=>e.offsetParent!==null).length).catch(()=>'');
      report.buttons.push({label:lb,clicked:!!ok,changed:before!==after});await clear(P,4);await P.ev('openBag();1');await P.W(300);}
    await clear(P);},120000);
  await step(P,'inventory and code console',async()=>{await P.ev(`openBag();1`);await P.W(500);await S_('menus','the bag');await clear(P);await P.ev(`try{cheatOpen()}catch(e){}1`);await P.W(400);await S_('menus','code console');await P.pg.keyboard.press('Escape');await clear(P);},30000);
  // ---- friends: talking, a gift, a heart event, romance
  P.section='social';
  await step(P,'friends',async()=>{const ids=await P.ev(`npcs.filter(n=>PEOPLE[n.def.id]).map(n=>n.def.id).slice(0,40)`);const L=Array.isArray(ids)?ids:[];
    for(const id of L.slice(0,QUICK?3:8)){await P.ev(`(()=>{const n=npcById('${id}');S.hour=11;__pb.near(n.x,n.z,.8);talk(n);})()`);await P.W(500);await S_('social','talking to '+id);await clear(P);}
    await P.ev(`(()=>{S.basket.push({kind:'pumpkin',value:18});const n=npcById('${L[0]||'mae'}');openGift(n);})()`);await P.W(500);await S_('social','giving a gift');await clear(P);
    const withEv=await P.ev(`npcs.filter(n=>PEOPLE[n.def.id]&&(PEOPLE[n.def.id].events||[]).length).map(n=>n.def.id)`);
    for(const id of (Array.isArray(withEv)?withEv:[]).slice(0,QUICK?1:3)){await P.ev(`(()=>{addFriend('${id}',400);S.hour=11;S.talkedToday={};const n=npcById('${id}');__pb.near(n.x,n.z,.8);lastQuestLine=null;talk(n);})()`);await P.W(1600);
      await S_('social','heart event: '+id);for(let k=0;k<20;k++){const s=await P.ev("typeof SCENE!=='undefined'&&!!SCENE");if(!s)break;await P.click('#scene');await P.W(250);if(k===4)await S_('social','heart event later: '+id);}await clear(P);}},120000);
  // ---- a scare, in the dark
  P.section='horror';
  await step(P,'a scare',async()=>{await go(2,-2,23,9);await S_('horror','the farm at night');await P.ev(`try{jumpScare('dark')}catch(e){}1`);await P.W(450);await S_('horror','jump scare');await P.W(2500);await clear(P);},30000);
  // ---- the multiplayer screens and the settings, from the title
  P.section='settings';
  await step(P,'settings',async()=>{await P.click('#dispBtn');await P.W(500);await S_('settings','display');await clear(P);await P.click('#sndBtn');await P.W(400);await S_('settings','sound');await clear(P);},30000);
  P.section='multiplayer';
  await step(P,'multiplayer screens',async()=>{await P.pg.goto(URL_);await P.pg.waitForFunction(()=>window.__game&&__game.S&&__game.S.mode==='title',null,{timeout:150000}).catch(()=>{});await P.ev(INPAGE);await P.W(1200);
    await P.click('#mpBtn');await P.W(800);await S_('multiplayer','play with friends');
    for(const t of ['Host','Join','New world','Set up']){if(await P.clickText(new RegExp(t))){await P.W(700);await S_('multiplayer',t);}}
    await P.click('#mpBack');await P.click('#acctOpen');await P.W(600);await S_('multiplayer','profiles');},60000);}

// ---------------------------------------------------------------- the report
function contactSheets(){const groups={};for(const s of report.stops){(groups[s.section]=groups[s.section]||[]).push(s);}
  const py=`
import json,sys,os
from PIL import Image,ImageDraw,ImageFont
out=sys.argv[1];rep=json.load(open(os.path.join(out,'report.json')))
try:font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
except Exception:font=ImageFont.load_default()
groups={}
for s in rep['stops']:groups.setdefault(s['section'],[]).append(s)
for sec,lst in groups.items():
  for i in range(0,len(lst),6):
    sheet=Image.new('RGB',(3*480,2*(270+22)),(14,12,16));d=ImageDraw.Draw(sheet)
    for j,s in enumerate(lst[i:i+6]):
      try:im=Image.open(os.path.join(out,s['file'])).convert('RGB').resize((480,270))
      except Exception:continue
      x=(j%3)*480;y=(j//3)*(270+22);sheet.paste(im,(x,y+22))
      flag=' !' if (s.get('errors') or (s.get('check') or {}).get('overflow') or (s.get('check') or {}).get('nanInHud') or (s.get('check') or {}).get('toastOverPlayer')) else ''
      d.text((x+4,y+4),('#%d %s%s'%(s['n'],s['label'],flag))[:70],fill=(240,220,180),font=font)
    sheet.save(os.path.join(out,'sheets','%s_%02d.png'%(sec,i//6)))
`;fs.writeFileSync(path.join(OUT,'sheets.py'),py);try{require('child_process').execFileSync('python3',[path.join(OUT,'sheets.py'),OUT],{stdio:'inherit',timeout:300000});}catch(e){console.log('contact sheets failed',e.message);}}
function summarise(){const secs={};for(const s of report.stops)secs[s.section]=(secs[s.section]||0)+1;
  const flagged=report.stops.filter(s=>(s.errors&&s.errors.length)||(s.check&&((s.check.overflow||[]).length||s.check.nanInHud||s.check.toastOverPlayer||s.check.brokenImages>0))||(s.fps!=null&&s.fps<50));
  const errCount={};for(const e of report.errors){const k=e.msg.slice(0,140);errCount[k]=(errCount[k]||0)+1;}
  const r=report.story.reached||{};
  const md=[`# Playthrough ${report.started}`,'',`- Build: ${report.url}`,`- Time: ${report.secs}s, ${report.stops.length} stops, ${report.steps.length} steps (${report.failed.length} failed)`,
    `- Story reached: ${r.done?'THE END ('+(r.objText||'')+')':'chapter '+(r.chapter||'?')+', day '+(r.day||'?')+', goal "'+(r.obj||'?')+'"'}; ${report.story.objectives.length} goals seen; ${report.forced.length} steps FORCED`,
    '','## Stops per section',...Object.entries(secs).map(([k,v])=>`- ${k}: ${v}`),
    '','## Forced steps (the bot could not play these through: possible places a player gets stuck)',...report.forced.map(f=>`- ch${f.chapter} [${f.goal}] ${f.what}  (${(f.text||'').slice(0,100)})`),
    '','## Failed steps',...report.failed.map(f=>`- [${f.player}/${f.section}] ${f.step}: ${f.err}`),
    '','## Page errors (count)',...Object.entries(errCount).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`- ${v}x ${k}`),
    '','## Flagged stops',...flagged.map(s=>`- #${s.n} ${s.section} / ${s.label}: ${[(s.errors||[]).length?'errors '+s.errors.length:'',s.fps!=null&&s.fps<50?'fps '+s.fps:'',s.check&&s.check.nanInHud?'NaN in HUD':'',s.check&&(s.check.overflow||[]).length?'overflow '+s.check.overflow.join('; '):'',s.check&&s.check.toastOverPlayer?'toast over player':'',s.check&&s.check.brokenImages?'broken images '+s.check.brokenNames.join(','):''].filter(Boolean).join(', ')}`),
    '','## Sound: stops after an action where the game played no sound (check each: an action with no sound feels unfinished)',
    ...report.stops.filter(s=>s.sfx&&!Object.keys(s.sfx).length&&/hoeing|watering|harvest|shipped|minigame|talking|gift|buy|casting|swinging|fair game|going in|scare|ledger|farm book/i.test(s.label)).map(s=>`- #${s.n} ${s.section} / ${s.label}`),
    '','## Sound: what played most',...Object.entries(report.stops.reduce((a,s)=>{for(const [k,v] of Object.entries(s.sfx||{}))a[k]=(a[k]||0)+v;return a;},{})).sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>`- ${k}: ${v}`),
    '','## Fonts seen in visible text (a finished game uses one or two everywhere)',...Object.entries(report.stops.reduce((a,s)=>{for(const f of ((s.check||{}).fonts||[]))a[f]=(a[f]||[]).concat(s.n);return a;},{})).map(([f,ns])=>`- ${f}: ${ns.length} stops (e.g. #${ns.slice(0,6).join(', #')})`),
    '','## Fonts canvas text is drawn in (speech bubbles, the map, minigames)',...Object.entries(report.stops.reduce((a,s)=>{for(const f of ((s.check||{}).canvasFonts||[]))a[f]=(a[f]||[]).concat(s.n);return a;},{})).map(([f,ns])=>`- ${f}: ${ns.length} stops (e.g. #${ns.slice(0,6).join(', #')})`),
    '','## Emoji and other glyphs the pixel font cannot draw (they fall back to another font)',...report.stops.filter(s=>((s.check||{}).fallbackGlyphs||[]).length).map(s=>`- #${s.n} ${s.section} / ${s.label}: ${s.check.fallbackGlyphs.join(' ')}`),
    '','## Placeholder or debug text a player can see',...report.stops.filter(s=>((s.check||{}).placeholder||[]).length).map(s=>`- #${s.n} ${s.section} / ${s.label}: ${s.check.placeholder.join(', ')}`),
    '','## Menu buttons that did nothing when pressed',...(report.buttons||[]).filter(b=>b.clicked&&!b.changed).map(b=>`- ${b.label}`),
    '','## Story goals in order',...report.story.objectives.map(o=>`- ${o.t} d${o.day} ch${o.chapter} [${o.title}] ${(o.text||'').slice(0,110)}`)];
  fs.writeFileSync(path.join(OUT,'summary.md'),md.join('\n')+'\n');}

(async()=>{console.log('playthrough ->',OUT);
  const A=await newPlayer('story'),B=await newPlayer('tour');
  await Promise.all([playStory(A).catch(e=>report.failed.push({player:'story',step:'crashed',err:String(e.message)})),tour(B).catch(e=>report.failed.push({player:'tour',step:'crashed',err:String(e.message)}))]);
  report.secs=Math.round((Date.now()-T0)/1000);report.finished=new Date().toISOString();
  fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,1));
  contactSheets();summarise();
  console.log(`done in ${report.secs}s: ${report.stops.length} stops, ${report.failed.length} failed steps, ${report.forced.length} forced, ${report.errors.length} errors`);
  await A.b.close();await B.b.close();})();
