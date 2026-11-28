const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.foundCabin=true;S.readLetter=true;S.everTilled=true;S.everPlanted=true;S.everWatered=true;S.shipped=1;S.q.hollis=1;S.carFixed=true;S.looped=true;S.candles=0;S.hour=13;P.x=0;P.z=-7");await pg.waitForTimeout(600);
 console.log(await ev("$('objective').textContent"));await pg.screenshot({path:'TW_obj.png',clip:{x:0,y:0,width:390,height:220}});
 await pg.tap('#objective');await pg.waitForTimeout(500);await pg.screenshot({path:'TW_route.png'});console.log('note open',await ev("!$('note').hidden"));
 await ev("$('noteClose').click()");await ev("openBag('map')");await pg.waitForTimeout(1800);await pg.screenshot({path:'TW_map.png'});
 console.log(errs.join('\n')||'no errors');await b.close();})();
