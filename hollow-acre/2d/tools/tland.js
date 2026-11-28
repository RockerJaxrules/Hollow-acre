const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13 landscape']});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 const tag=process.argv[2]||'L';const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await pg.screenshot({path:tag+'0.png'});
 await pg.evaluate(()=>document.getElementById('begin').click());await pg.waitForTimeout(500);await pg.screenshot({path:tag+'1.png'});
 await pg.evaluate(()=>document.getElementById('cGo').click());await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 await ev("S.tut.off=false;for(const k of ['move','act','menu','drag','dusk'])S.tut.done[k]=1;S.foundCabin=true;S.hour=9;P.x=0;P.z=-6");await ev("S.readLetter=true");await pg.waitForTimeout(700);await pg.screenshot({path:tag+'2.png'});
 for(let i=0;i<10;i++){if(!(await ev("$('scene').style.display==='flex'")))break;await pg.click('#scene');await pg.waitForTimeout(80);}
 await pg.waitForTimeout(800);await pg.screenshot({path:tag+'3.png'});
 await ev("$('maecard').style.display='none';openBag('items')");await pg.waitForTimeout(500);await pg.screenshot({path:tag+'4.png'});
 await ev("openBag('map')");await pg.waitForTimeout(1500);await pg.screenshot({path:tag+'5.png'});await ev("$('bag').hidden=true;S.paused=false");
 await ev("talk(npcById('mae'))");await pg.waitForTimeout(400);await pg.screenshot({path:tag+'6.png'});await ev("$('talk').hidden=true;S.paused=false;talkingTo=null");
 await ev("openShop('mae')");await pg.waitForTimeout(400);await pg.screenshot({path:tag+'7.png'});await ev("$('shop').hidden=true;S.paused=false");
 await ev("openNote(LETTER.map(p=>'<p>'+p+'</p>').join(''))");await pg.waitForTimeout(400);await pg.screenshot({path:tag+'8.png'});
 console.log(errs.slice(0,3).join('\n'));await b.close();})();
