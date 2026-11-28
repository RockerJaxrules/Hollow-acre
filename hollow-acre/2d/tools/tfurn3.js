const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;addInv('wood',99);addInv('fiber',99);addInv('stone',99);");
 for(let i=0;i<3;i++)console.log('chair',i,await ev("(()=>{const r=vendors.b_furn.rows().find(r=>r.k==='chair');const ok=r.can;if(ok)r.buy();return 'can='+ok+' bag='+S.furnBag.filter(k=>k==='chair').length+' | '+vendors.b_furn.rows().find(r=>r.k==='chair').desc;})()"));
 // place two of them in the cabin, one at a time
 console.log(await ev("(()=>{S.room='cabin';P.x=ROOMS.cabin.ox+ROOMS.cabin.w/2;P.z=ROOMS.cabin.oz+ROOMS.cabin.d/2;const R=ROOMS.cabin;const out=[];for(const dx of [-1.6,1.6]){startFurn('chair');out.push('bag after pick '+S.furnBag.length);PLACE.manual=true;PLACE.x=Math.round((R.ox+R.w/2+dx)*2)/2;PLACE.z=Math.round((R.oz+R.d/2+1)*2)/2;const bad=placeValid(PLACE.x,PLACE.z);placeConfirm();out.push('placed '+S.furnPlaced.filter(p=>p.k==='chair').length+(bad?' ('+bad+')':''));}return out.join(' | ');})()"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
