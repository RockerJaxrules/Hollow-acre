const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.cgTut={};");
 const cv=await pg.$('#cgC');const shot=async n=>{const bb=await cv.boundingBox();await pg.screenshot({path:`TUT_${n}.png`,clip:{x:bb.x-30,y:bb.y-60,width:bb.width+60,height:bb.height+150}});};
 const now=()=>ev('window.CG2_NOW');
 await ev("window.__q=null;cg3Run(CG3_RECIPES['b_furn:chair'],'Wooden chair',q=>{window.__q=q;},'it_flask');");
 await pg.waitForTimeout(1600);console.log('1',await now());await shot('1demo');
 await pg.waitForTimeout(4800);console.log('2',await now());await shot('2your');
 const bb=await cv.boundingBox();await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(250);console.log('3',await now());await shot('3ready');
 await pg.waitForTimeout(800);console.log('4',await now());
 // do nothing: the saw drifts off the line, the step should be offered again
 for(let i=0;i<40;i++){const n=await now();if(/^retry/.test(n)){await pg.waitForTimeout(200);await shot('4retry');break;}await pg.waitForTimeout(250);}
 console.log('5',await now(),await ev("JSON.stringify({tries:document.getElementById('cgH').textContent})"));
 // a tap-timing step with judgements: run the soup (marks) and press at once
 await ev("$('cgSkip').click()");await pg.waitForTimeout(2300);
 await ev("S.cgTut={marks:1,heat:1,gauge:1};window.__q=null;cg3Run(CG3_RECIPES['cook:soup'],'Turnip soup',q=>{window.__q=q;},'soup');");
 await pg.waitForTimeout(1200);
 for(let i=0;i<14;i++){await ev("(()=>{const c=document.getElementById('cgC');})()");await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(140);if(i===5)await shot('5judge');}
 await pg.waitForTimeout(400);await shot('6after');
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
