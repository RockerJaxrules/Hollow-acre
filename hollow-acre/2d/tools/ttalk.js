const {chromium,devices}=require('playwright');const mode=process.argv[2]||'pc';
(async()=>{const b=await chromium.launch();const pg=await b.newPage(mode==='phone'?{...devices['iPhone 13']}:{viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11");
 await ev("talk(npcById('june'))");await pg.waitForTimeout(500);await pg.screenshot({path:`TT_talk_${mode}.png`});
 console.log(errs.join('\n')||'no errors');await b.close();})();
