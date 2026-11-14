const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:620}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));pg.on('requestfailed',r=>{if(/spr\//.test(r.url()))errs.push('MISSING '+r.url());});await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=11;S.energy=200;");
 for(const t of ['hoe','pick','axe']){await ev(`{syncSlots();slotUse(S.slots.indexOf('T:${t}'));}`);await pg.waitForTimeout(200);await ev("(()=>{const t=tiles[12];S.room=null;P.x=(t?t.x:2);P.z=(t?t.z:2)-1;P.fx=0;P.fz=1;P.dir='S';})()").catch(()=>0);await pg.waitForTimeout(150);await ev("useFront()");await pg.waitForTimeout(180);await pg.screenshot({path:`TD_${t}.png`,clip:{x:330,y:200,width:240,height:240}});
   console.log(t,await ev(`(()=>{const m=SPR['farmer_${t}'];const im=IMG[m.src];return m.src+' loaded:'+!!(im&&(im.width||im.naturalWidth));})()`));}
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
