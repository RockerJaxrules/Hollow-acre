const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100");
 console.log('choppable trees',await ev("OBJ.filter(o=>o.choppable).length+' of '+OBJ.filter(o=>(o.kind==='tree'||o.kind==='pine')&&!o.room&&o.x<250).length"));
 // a tree deep in the Hollow Woods
 await ev("window.__t=OBJ.filter(o=>o.choppable&&o.x>90&&o.x<120&&o.z>-30&&o.z<-12).sort((a,b)=>a.x-b.x)[0];P.x=__t.x-0.9;P.z=__t.z+0.1;P.fx=1;P.fz=0;P.dir='E'");await pg.waitForTimeout(400);
 console.log('btn',await pg.evaluate(()=>document.getElementById('btnAct').textContent),'at',await ev("__t.x.toFixed(1)+','+__t.z.toFixed(1)"));
 for(let i=0;i<6&&!(await ev("__t.hide"));i++){await ev("S.energy=100;P.anim=null");await pg.evaluate(()=>__game.act());await pg.waitForTimeout(800);}
 console.log('felled',await ev("__t.hide+' stump '+!!__t.stump+' wood '+inv('wood')+' goneDay '+__t.goneDay"));await pg.screenshot({path:'RG1.png'});
 // a weed on an untilled tile, and one on a tilled tile
 await ev("window.__w=tiles.find(t=>t.debris&&!t.gh&&!t.tilled);window.__w2=tiles.filter(t=>t.debris&&!t.gh&&!t.tilled)[1];__w.debris.hide=true;__w.debris.goneDay=S.day;__w2.debris.hide=true;__w2.debris.goneDay=S.day;__w2.tilled=true");
 await ev("P.x=0;P.z=-7.6;newDay()");await pg.waitForTimeout(400);console.log('day+1 tree',await ev("__t.hide+' weed '+__w.debris.hide"));
 await ev("newDay()");await pg.waitForTimeout(400);console.log('day+2 tree hidden?',await ev("__t.hide+' stump hidden '+(__t.stump?__t.stump.hide:'gone')+' weed hidden '+__w.debris.hide+' tilled-tile weed hidden '+__w2.debris.hide"));
 await ev("P.x=__t.x-0.9;P.z=__t.z+0.1;S.hour=11");await pg.waitForTimeout(600);await pg.screenshot({path:'RG2.png'});
 console.log('fps check',await ev("(()=>{const t=performance.now();for(let i=0;i<200;i++)computeContext();return ((performance.now()-t)/200).toFixed(3)+' ms per computeContext, interacts '+interact.length;})()"));
 console.log(errs.slice(0,4).join('\n'));await b.close();})();
