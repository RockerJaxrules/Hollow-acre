const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11;S.room=null;P.x=1.5;P.z=-7.2;P.dir='N';$('toast').classList.remove('show');");
 await ev("S.house.tier=1;houseApply();S.house.build={tier:2,done:S.day+3};");await pg.waitForTimeout(900);await ev("$('toast').classList.remove('show')");await pg.screenshot({path:'TS_scaffold.png',clip:{x:140,y:0,width:1000,height:640}});
 await ev("S.house.tier=2;S.house.build=null;houseApply();");await pg.waitForTimeout(600);await pg.screenshot({path:'TS_kitchen.png',clip:{x:140,y:0,width:1000,height:640}});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
