const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10");
 const pos=await ev("(()=>{const bs=OBJ.filter(o=>o.kind==='bush'&&!o.room);let best=null,bn=0;for(const a of bs){const n=bs.filter(c=>Math.hypot(c.x-a.x,c.z-a.z)<6).length;if(n>bn){bn=n;best=a;}}return [best.x,best.z,bn];})()");
 console.log('bush cluster',pos);await ev(`P.x=${pos[0]}+1.5;P.z=${pos[1]}+2`);await pg.waitForTimeout(800);await pg.screenshot({path:'BUSHG.png'});
 await ev("P.x=-8.3;P.z=-10.5");await pg.waitForTimeout(800);await pg.screenshot({path:'BUSHG2.png'});await b.close();})();
