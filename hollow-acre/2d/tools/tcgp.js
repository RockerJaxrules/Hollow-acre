const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;");
 const keys=JSON.parse(await ev("JSON.stringify(Object.keys(CG3_RECIPES))"));console.log(keys.length,'games:',keys.slice(0,40).join(' '));
 const pickK=['b_furn:','b_furnace:','build:','craft:','cook:','b_weapon:','b_armor:','b_farm:'].map(p=>keys.find(k=>k.startsWith(p))).filter(Boolean);
 for(const key of pickK){await ev(`cg3Run(CG3_RECIPES['${key}'],'${key}',q=>{},'it_flask');`);await pg.waitForTimeout(900);
   await pg.mouse.click(500,350);await pg.waitForTimeout(500);await pg.screenshot({path:`CGP_${key.replace(/[:]/g,'_')}.png`});
   await ev("$('cgSkip').click()");await pg.waitForTimeout(700);await pg.screenshot({path:`CGP_${key.replace(/[:]/g,'_')}_end.png`});await pg.waitForTimeout(1500);}
 console.log(pickK.join(' '));console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
