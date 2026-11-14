const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 const boot=async()=>{await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});};
 await boot();await pg.evaluate(()=>localStorage.clear());await boot();
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const act=async()=>{await pg.evaluate(()=>__game.act());await pg.waitForTimeout(300);};
 await pg.click('#begin');await pg.waitForTimeout(400);await pg.fill('#cName','Sam');await pg.screenshot({path:'HZ0.png'});await pg.click('#cGo');await pg.waitForTimeout(400);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(400);
 console.log('name',await ev("S.look.name"));
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.looped=true;S.bound=true;S.hour=10;tiles[0].tilled=true;tiles[0].crop={type:'turnip',stage:1,growth:3,watered:true}");await pg.waitForTimeout(1300);
 await ev("document.getElementById('noteClose').click();S.st.act=3;S.st.mail=null");console.log('hl',await ev("hl()"));
 // social
 await ev("openBag('social')");await pg.waitForTimeout(600);await ev("document.querySelector('#bagBody .soc').lastElementChild.scrollIntoView()");await pg.screenshot({path:'HZ1.png'});await ev("document.getElementById('bag').hidden=true;S.paused=false");
 // cabin mirror + knock
 await ev("enterRoom('cabin')");await pg.waitForTimeout(900);await ev("P.x=CAB.ox+8.45;P.z=CAB.oz+1.2;P.fx=0;P.fz=-1;P.dir='N'");await pg.waitForTimeout(300);console.log('mirror btn',await pg.evaluate(()=>document.getElementById('btnAct').textContent));await act();console.log('toast',await ev("ui.toast.textContent.slice(0,60)"));
 await ev("S.hour=21;HZ.cd.knockCheck=0;S.hz.knocked=0");for(let i=0;i<8&&!(await ev("S.hz.knock"));i++){await ev("HZ.cd.knockCheck=0");await pg.waitForTimeout(200);}await pg.waitForTimeout(1800);console.log('knock',await ev("!!S.hz.knock+' '+ui.toast.textContent.slice(0,50)"));
 await ev("leaveRoom(1)");await pg.waitForTimeout(500);console.log('still in',await ev("S.room+' | '+ui.toast.textContent.slice(0,50)"));await ev("leaveRoom(1)");await pg.waitForTimeout(800);
 // scarecrows
 await ev("S.hz.crows=5;S.hour=17;P.x=0;P.z=-3");await pg.waitForTimeout(800);await pg.screenshot({path:'HZ2.png'});
 // tip
 await ev("htip(HTIPS[0])");await pg.waitForTimeout(300);await pg.screenshot({path:'HZ3.png'});
 // fake crash
 await ev("S.hour=22;fakeCrash()");await pg.waitForTimeout(500);await pg.screenshot({path:'HZ4.png'});await pg.click('#crash button[data-a="wait"]');await pg.waitForTimeout(3600);await pg.screenshot({path:'HZ5.png'});await pg.waitForTimeout(4500);console.log('crash over',await ev("$('crash').style.display+' paused '+S.paused"));
 // save then reload + continue
 await ev("S.coins=777");await ev("newDay()");await pg.waitForTimeout(1200);console.log('saved',await pg.evaluate(()=>!!localStorage.getItem('hollowSave1')),await ev("$('saved').textContent"));
 await boot();console.log('cont btn',await pg.evaluate(()=>document.getElementById('cont')&&document.getElementById('cont').textContent));await pg.screenshot({path:'HZ6.png'});
 await pg.click('#cont');await pg.waitForTimeout(800);console.log('loaded',await ev("S.day+' coins '+S.coins+' bound '+S.bound+' act '+S.st.act+' tile0 '+tiles[0].tilled+' '+(tiles[0].crop&&tiles[0].crop.type)+' name '+S.look.name+' crows '+S.hz.crows"));
 // tithe night chase
 await ev("S.tut.off=true;S.st.tithe=S.day;S.st.drawn=true;S.hour=21;P.x=20;P.z=36;P.fx=0;P.fz=1;P.dir='S'");await pg.waitForTimeout(400);
 for(let i=0;i<30;i++){await ev("P.spd=4;P.z+=0.2");await pg.waitForTimeout(30);}console.log('tall',await ev("HZ.tall?(HZ.tall.z.toFixed(1)+' vs '+P.z.toFixed(1)):'none'"));await pg.screenshot({path:'HZ7.png'});
 // credits
 await ev("HZ.tall=null;stEnding('tag')");await pg.waitForTimeout(400);for(let i=0;i<10;i++){if(!(await ev("$('scene').style.display==='flex'")))break;await pg.click('#scene');await pg.waitForTimeout(80);}
 await pg.waitForTimeout(3000);await pg.screenshot({path:'HZ8.png'});await pg.click('#credits2');await pg.waitForTimeout(4200);await pg.screenshot({path:'HZ9.png'});
 await pg.click('#credits2');await pg.waitForTimeout(500);console.log('end',await ev("S.mode+' '+document.querySelector('#end h1').textContent"));
 await pg.click('#keepFarming');await pg.waitForTimeout(6500);console.log('epi mail',await ev("S.st.mail"));
 console.log(errs.slice(0,6).join('\n'));await b.close();})();
