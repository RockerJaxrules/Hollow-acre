const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.click('#begin');await pg.click('#cGo');await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(400);const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=21;P.x=0;P.z=-6;M.v=0.5");
 for(let i=0;i<5;i++){await pg.waitForTimeout(2000);console.log('t+'+(i+1)*2+'s','mode',await ev("S.mode+' fade '+getComputedStyle($('fade')).opacity+' M.v '+M.v.toFixed(1)+' room '+S.room+' hour '+S.hour.toFixed(1)"));}
 await pg.screenshot({path:'BLK.png'});console.log(errs.slice(0,3).join('\n'));await b.close();})();
