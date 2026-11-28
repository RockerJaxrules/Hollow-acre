// buys Farm Plans builds, places them, and checks the build game starts and the world pauses/unpauses around it
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:620}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.coins=9999;for(const k of ['wood','stone','copper','iron','copper_bar','iron_bar','fiber'])addInv(k,200);S.room=null;");
 for(const k of ['coop','bench_farm','gh','bench_furnace','lamps']){
   const r=await ev(`(()=>{const r=vendors.plans.rows().find(r=>r.k==='${k}');if(!r)return 'no row';if(r.can===false)return 'cannot';openShop('plans');r.buy();return 'bought';})()`);
   await pg.waitForTimeout(400);
   let placed='n/a';
   if(k!=='lamps'){placed=await ev(`(()=>{if(!PLACE.on)return 'no placement';for(let z=-10;z<10;z+=.5)for(let x=-8;x<20;x+=.5){if(!placeValid(x,z)){PLACE.x=x;PLACE.z=z;PLACE.manual=true;placeConfirm();return 'placed at '+x+','+z;}}return 'no spot';})()`);}
   await pg.waitForTimeout(900);
   const st=await ev(`JSON.stringify({now:window.CG2_NOW,shown:$('cgame').style.display,title:$('cgT').textContent,paused:S.paused})`);
   await pg.screenshot({path:`TB3_${k}.png`});
   await pg.keyboard.press('Escape');await pg.waitForTimeout(2300);
   const after=await ev(`JSON.stringify({shown:$('cgame').style.display,paused:S.paused,coop:S.coop,gh:S.greenhouse,lamps:S.fieldLamps,benches:S.benches})`);
   console.log(k.padEnd(14),r,'|',placed,'|',st,'|',after);
   await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('shop').hidden=true;S.paused=false;");}
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
