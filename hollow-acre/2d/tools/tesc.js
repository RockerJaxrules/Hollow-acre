const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.foundCabin=true;S.readLetter=true;S.carFixed=true;S.hour=17.5");
 // put a couple of villagers on the road the car takes
 await ev("const a=npcs.filter(n=>n.vis).slice(0,3);a.forEach((n,i)=>{n.x=-40+i*8;n.z=-6.6;});");
 await ev("startCine('escape')");
 const shots=[[1500,'TE_1'],[3600,'TE_2'],[5200,'TE_3']];let t0=Date.now();
 for(const [ms,n] of shots){await pg.waitForTimeout(ms-(Date.now()-t0));await pg.screenshot({path:n+'.png'});console.log(n,await ev("cine?'x '+(cine.cam.x).toFixed(1):'no cine'"));}
 // let it run to the end
 for(let i=0;i<40&&(await ev("!!cine"));i++)await pg.waitForTimeout(500);
 console.log('end',await ev("S.mode+' looped '+S.looped+' P '+P.x.toFixed(1)+','+P.z.toFixed(1)+' npcs visible '+npcs.filter(n=>n.vis).length"));
 console.log(errs.join('\n')||'no errors');await b.close();})();
