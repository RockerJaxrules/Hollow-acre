const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.carFixed=true;S.hour=12;P.x=carPos.x+3;P.z=carPos.z+.5");await pg.waitForTimeout(900);
 await pg.screenshot({path:'TC_full.png'});console.log(await ev("JSON.stringify({cam:[cam.x,cam.z],P:[P.x,P.z],o:BEATEN.o&&{x:BEATEN.o.x,z:BEATEN.o.z,hide:BEATEN.o.hide,kind:BEATEN.o.kind},inOBJ:OBJ.includes(BEATEN.o),spr:!!SPR.car_beaten,img:!!(SPR.car_beaten&&IMG[SPR.car_beaten.src]),wreckHidden:OBJ.filter(o=>o.kind==='wreck').map(o=>o.spr+':'+o.hide)})"));
 console.log(errs.join('\n')||'no errors');await b.close();})();
