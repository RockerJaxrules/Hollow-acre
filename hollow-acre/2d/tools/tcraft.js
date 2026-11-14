const {chromium,devices}=require('playwright');
const mode=process.argv[2]||'pc';
(async()=>{const b=await chromium.launch();const pg=await b.newPage(mode==='phone'?{...devices['iPhone 13']}:{viewport:{width:1600,height:900}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;addInv('wood',30);addInv('stone',20);addInv('fiber',20);addInv('copper',6);addInv('iron',6);addInv('coal',4);addInv('copper_bar',3);addInv('iron_bar',3);S.basket.push({kind:'turnip',value:5},{kind:'turnip',value:5},{kind:'egg',value:4},{kind:'pumpkin',value:9})");
 // the farming bench
 await ev("openShop('b_farm')");await pg.waitForTimeout(400);await pg.screenshot({path:`TCR_${mode}_ui.png`});
 // pick the bone meal card and make it, playing the bench game with real taps on the canvas
 const cards=await pg.locator('#crGrid .card').count();console.log('cards',cards);await pg.locator('#crGrid .card').nth(1).click();await pg.waitForTimeout(200);
 const fiber0=await ev("inv('fiber')+'/'+inv('fert')");await pg.click('#crMake');await pg.waitForTimeout(300);await pg.screenshot({path:`TCR_${mode}_bench.png`});
 const box=await pg.locator('#cgC').boundingBox();for(let i=0;i<12;i++){await pg.mouse.click(box.x+box.width/2,box.y+box.height/2);await pg.waitForTimeout(220);}
 await pg.waitForTimeout(2600);console.log('bench game done',await ev("$('cgame').style.display"),'fiber/fert',fiber0,'->',await ev("inv('fiber')+'/'+inv('fert')"),'toast',await ev("$('toast').textContent"));
 // the stove, timed taps
 await ev("$('craft').hidden=true;S.paused=false;openShop('cook')");await pg.waitForTimeout(300);await pg.screenshot({path:`TCR_${mode}_cookui.png`});
 await pg.click('#crMake');await pg.waitForTimeout(300);
 for(let i=0;i<3;i++){await pg.waitForFunction(()=>{const s=__game.ev("(()=>{return 1})()");return true;});await pg.waitForTimeout(700);await pg.screenshot({path:`TCR_${mode}_cook${i}.png`});await pg.mouse.click(box.x+box.width/2,box.y+box.height/2);}
 await pg.waitForTimeout(1200);console.log('cook done',await ev("inv('soup')"),'toast',await ev("$('toast').textContent"),'ev.cook',await ev('S.ls.ev.cook'));
 // the furnace: hold the bellows
 await ev("$('craft').hidden=true;S.paused=false;openShop('b_furnace')");await pg.waitForTimeout(300);await pg.click('#crMake');await pg.waitForTimeout(300);
 const box2=await pg.locator('#cgC').boundingBox();const cb0=await ev("inv('copper_bar')");
 for(let k=0;k<30;k++){const heat=await ev("1");await pg.mouse.move(box2.x+box2.width/2,box2.y+box2.height/2);await pg.mouse.down();await pg.waitForTimeout(260);await pg.mouse.up();await pg.waitForTimeout(220);if(k===6)await pg.screenshot({path:`TCR_${mode}_smelt.png`});if(await ev("$('cgame').style.display")==='none')break;}
 await pg.waitForTimeout(800);console.log('smelt done copper bars',cb0,'->',await ev("inv('copper_bar')"),'toast',await ev("$('toast').textContent"));
 console.log(errs.join('\n')||'no errors');await b.close();})();
