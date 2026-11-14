const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(400);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=false;for(const k of ['move','act','menu','drag','dusk'])S.tut.done[k]=1;S.foundCabin=true;S.hour=8;P.x=0;P.z=-6;P.fx=0;P.fz=1;P.dir='S'");await ev("S.readLetter=true");await pg.waitForTimeout(700);
 console.log('intro mae',await ev("MAEV.on+' '+MAEV.x.toFixed(1)+','+MAEV.z.toFixed(1)"));
 for(let i=0;i<10;i++){if(!(await ev("$('scene').style.display==='flex'")))break;await pg.click('#scene');await pg.waitForTimeout(80);}
 await pg.waitForTimeout(600);await ev("$('maecard').style.display='none'");await pg.screenshot({path:'MAE0.png'});
 await ev("maeSay('Test line from Mae','Lesson',8)");await pg.waitForTimeout(2500);console.log('lesson mae',await ev("MAEV.on+' '+MAEV.x.toFixed(1)+','+MAEV.z.toFixed(1)+' mv '+MAEV.mv+' dir '+MAEV.dir"));await pg.screenshot({path:'MAE1.png'});
 await pg.waitForTimeout(9000);console.log('after',await ev("MAEV.on+' real mae vis '+npcById('mae').vis"));
 console.log(errs.slice(0,4).join('\n'));await b.close();})();
