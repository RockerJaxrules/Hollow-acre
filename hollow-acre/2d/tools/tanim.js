const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100;S.water=10;$('hud').style.opacity=.15");
 // a clear tile in the middle of the field
 const T=await ev("(()=>{const t=tiles.find(t=>!t.gh&&!t.tilled&&!(t.debris&&!t.debris.hide)&&!interact.some(q=>(!q.on||q.on())&&Math.hypot(q.x-t.x,q.z-t.z)<1.2));return tiles.indexOf(t);})()");
 const shots=[];
 for(const [d,dx,dz] of [['S',0,-1],['E',-1,0],['N',0,1],['W',1,0]]){
   for(const tool of ['hoe','can']){
     await ev(`(()=>{const t=tiles[${T}];t.tilled=${tool==='can'};t.crop=${tool==='can'?"{type:'turnip',stage:1,growth:5,watered:false,pop:1}":'null'};P.x=t.x+${dx}*.95;P.z=t.z+${dz}*.95-.1;P.anim=null;})()`);await pg.waitForTimeout(250);
     await ev(`${tool==='hoe'?'doTill':'doWater'}(tiles[${T}])`);await pg.waitForTimeout(tool==='hoe'?440:620);
     const c=await ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(P.x)*r.width/VW, r.top+sz(P.z)*r.height/VH, r.width/VW];})()`);
     const f=`TA_${tool}_${d}.png`;await pg.screenshot({path:f,clip:{x:c[0]-90*c[2]*.6,y:c[1]-110*c[2]*.6,width:180*c[2]*.6,height:170*c[2]*.6}});shots.push(f);await pg.waitForTimeout(700);
   }}
 // fishing, cast and waiting
 await ev("P.x=pond.x;P.z=pond.z-pond.r-.2;P.fx=0;P.fz=1;P.dir='S';P.anim=null");await pg.waitForTimeout(300);
 for(let i=0;i<20&&!(await ev("!!waterAhead()"));i++){await ev("P.z+=.25");}
 await ev("fishAct()");await pg.waitForTimeout(500);await ev("fishAct()");await pg.waitForTimeout(150);
 let c=await ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(P.x)*r.width/VW, r.top+sz(P.z)*r.height/VH, r.width/VW];})()`);
 await pg.screenshot({path:'TA_fish_cast.png',clip:{x:c[0]-120,y:c[1]-140,width:240,height:260}});await pg.waitForTimeout(900);await pg.screenshot({path:'TA_fish_wait.png',clip:{x:c[0]-120,y:c[1]-140,width:240,height:260}});
 console.log('fish',await ev('fish.state'),errs.join('\n')||'no errors');await b.close();})();
