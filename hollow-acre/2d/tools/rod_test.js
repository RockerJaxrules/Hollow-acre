const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html',{waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{try{localStorage.clear();}catch(e){}document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 console.log(await pg.evaluate(()=>__game.ev(`(()=>{const out=[];S.rod=3;let row=vendors.v_bait.rows().find(r=>r.k==='rod4');out.push('rod4 row: '+(row?row.name+' can='+row.can+' need='+JSON.stringify(row.need)+' price='+row.price:'none'));
   if(row){row.buy();out.push('after buy S.rod='+S.rod+' name='+ROD_NAMES[S.rod-1]+' grade icon key ok='+!!gradeIcon('rod'));}
   S.rod=2;row=vendors.v_bait.rows().find(r=>r.k==='rod4');out.push('at rod 2: can='+(row&&row.can));return out.join('\\n');})()`)));
 console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
