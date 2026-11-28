const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const tag=process.argv[2];const dev=devices[process.argv[3]];const pg=await b.newPage({...dev});
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await pg.waitForTimeout(400);await pg.screenshot({path:tag+'0.png'});
 await pg.evaluate(()=>document.getElementById('begin').click());await pg.waitForTimeout(500);await pg.screenshot({path:tag+'1.png'});
 await pg.evaluate(()=>document.getElementById('cGo').click());await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=9;P.x=0;P.z=-6;toast('A test message so the toast position shows.',6)");await pg.waitForTimeout(700);await pg.screenshot({path:tag+'2.png'});
 await ev("openBag('items')");await pg.waitForTimeout(500);await pg.screenshot({path:tag+'3.png'});
 await b.close();})();
