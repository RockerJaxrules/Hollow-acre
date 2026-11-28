const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.click('#begin');await pg.click('#cGo');await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(300);const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=9;tiles[0].tilled=true;tiles[0].crop={type:'turnip',stage:0,growth:0,watered:true,pop:1}");
 const h0=await ev("S.hour");const t0=Date.now();await pg.waitForTimeout(10000);const h1=await ev("S.hour");const real=(Date.now()-t0)/1000;
 console.log('real s per game hour',(real/(h1-h0)).toFixed(1),'| turnip growth per game hour',(await ev("tiles[0].crop.growth")/(h1-h0)).toFixed(1),'(old clock: 11 per hour)');
 await b.close();})();
