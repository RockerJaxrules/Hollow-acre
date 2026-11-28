const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(900);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;S.energy=100;");await pg.waitForTimeout(400);
 await ev("addXP('farming',520);addXP('combat',520);");await pg.waitForTimeout(400);console.log('during the day: pending',await ev("JSON.stringify(S.skPending)"),'toast',await ev("$('toast').textContent"));
 await ev("newDay('',null)");await pg.waitForTimeout(1800);
 let screens=[];for(let i=0;i<14;i++){if(await ev("$('lvlUp').hidden")){await pg.waitForTimeout(400);if(await ev("$('lvlUp').hidden"))break;}
   const t=await pg.evaluate(()=>document.querySelector('#lvlUp .lv b').textContent);const profs=await pg.$$('#lvlUp .prof');
   if(profs.length){const names=await Promise.all(profs.map(p=>p.innerText()));screens.push(t+' -> choose ['+names.map(n=>n.split('\n')[0]).join(' / ')+']');if(screens.length<=6)await pg.screenshot({path:'TPF_choose.png'});
     const want=/Farming/.test(t)?'Tiller':'Fighter';for(const p of profs)if((await p.innerText()).startsWith(want)){await p.click();break;}}
   else{screens.push(t);await (await pg.$('#lvlOk')).click();}await pg.waitForTimeout(350);}
 console.log('morning screens:',screens.join(' | '));
 console.log('professions',await ev("JSON.stringify(S.prof)"),'max health',await ev('S.hpMax'),'paused',await ev('S.paused'));
 await ev("S.basket.push({kind:'turnip',value:10})");await pg.waitForTimeout(500);console.log('a turnip worth 10 with Tiller + farming 5:',await ev('S.basket[S.basket.length-1].value'));
 await ev("openBag('skills')");await pg.waitForTimeout(500);console.log('tab farming line:',await pg.evaluate(()=>[...document.querySelectorAll('#bag .skl')][0].innerText.replace(/\n/g,' | ').slice(0,400)));await pg.screenshot({path:'TPF_tab.png'});
 await ev("$('bag').hidden=true;S.paused=false;saveGame();");await pg.reload();await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>document.getElementById('cont').click());await pg.waitForTimeout(1500);
 console.log('after reload professions',await ev("JSON.stringify(S.prof)"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
