const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.coins=10;addInv('wood',5);$('toast').classList.remove('show');");
 const rowBtn=async(i)=>(await pg.$$('#shopRows .shop-row'))[i].$('button');
 // 1. the Farm Plans board, too poor: the cabin row is first, greyed, and says what's missing
 await ev("openShop('plans')");await pg.waitForTimeout(400);
 console.log('plans row 1:',await pg.evaluate(()=>document.querySelector('#shopRows .shop-row').innerText.replace(/\s+/g,' ').slice(0,200)));
 let bt=await rowBtn(0);console.log('  button:',await bt.textContent(),'greyed:',await bt.evaluate(e=>e.classList.contains('nope')));
 const coins0=await ev('S.coins');await bt.click();await pg.waitForTimeout(300);console.log('  click says:',await ev("$('toast').textContent"),'| bought?',await ev('!!S.house.build'),'coins',coins0,'->',await ev('S.coins'));
 await pg.screenshot({path:'TP_plans_poor.png'});
 // 2. a row you can't have for another reason (already-built bench / tool) explains itself too
 await ev("$('shop').hidden=true;S.paused=false;S.coins=500;S.parts.tire=1;openShop('mae');");await pg.waitForTimeout(400);
 const rows=await pg.$$('#shopRows .shop-row');for(const r of rows){const b2=await r.$('button');if(b2&&await b2.evaluate(e=>e.classList.contains('nope'))){const name=(await r.innerText()).split('\n')[0];const c0=await ev('S.coins');await b2.click();await pg.waitForTimeout(250);console.log('mae greyed row',JSON.stringify(name),'says:',await ev("$('toast').textContent"),'| coins',c0,'->',await ev('S.coins'));break;}}
 // 3. order the mend from the Farm Plans with enough
 await ev("$('shop').hidden=true;S.paused=false;S.coins=300;addInv('wood',80);addInv('stone',30);openShop('plans');");await pg.waitForTimeout(400);
 bt=await rowBtn(0);console.log('rich: button',await bt.textContent(),'greyed:',await bt.evaluate(e=>e.classList.contains('nope')));await bt.click();await pg.waitForTimeout(300);
 console.log('  ordered:',JSON.stringify(await ev('S.house.build')),'coins',await ev('S.coins'),'wood',await ev("inv('wood')"),'| says:',await ev("$('toast').textContent"));
 console.log('  plans row now:',await pg.evaluate(()=>document.querySelector('#shopRows .shop-row').innerText.replace(/\s+/g,' ').slice(0,120)));
 await ev("$('shop').hidden=true;S.paused=false;openShop('v_carp');");await pg.waitForTimeout(300);console.log('  Nell row now:',await pg.evaluate(()=>document.querySelectorAll('#shopRows .shop-row')[1].innerText.replace(/\s+/g,' ').slice(0,120)));
 // 4. the map
 await ev("$('shop').hidden=true;S.paused=false;");console.log('map places:',await ev("MAP_PLACES.filter(p=>/Carpentry|Forge|Bait|Feed/.test(p[0])).map(p=>p[0]).join(', ')"));
 await ev("P.x=48;P.z=12;openBag();");await pg.waitForTimeout(400);for(const bt of await pg.$$('button')){const t=((await bt.textContent())||'').trim();if(/^Map$/.test(t)&&await bt.isVisible()){await bt.click();break;}}await pg.waitForTimeout(700);
 await ev("typeof mapZoom==='function'&&mapZoom(3)");await pg.waitForTimeout(700);await pg.screenshot({path:'TP_map.png'});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
