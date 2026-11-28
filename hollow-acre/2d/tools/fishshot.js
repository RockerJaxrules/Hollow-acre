// node f199/shot.js <outdir> [w h]: the fishing loop as a player sees it, day and night
const {chromium}=require('playwright');const out=process.argv[2];const W=+process.argv[3]||1100,H=+process.argv[4]||700;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:W,height:H}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/'+(process.env.PAGE||'test2d_k.html')+'');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.readLetter=true;S.tut.off=true;S.mode='play';S.paused=false;document.querySelectorAll('#tut,#maecard').forEach(e=>e.style.display='none');P.x=fishSpot.x;P.z=fishSpot.z-.2;P.fx=0;P.fz=1;S.hour=11;S.inv=S.inv||{};");
 await pg.waitForTimeout(800);
 // the cast
 await ev("fishAct()");for(let i=0;i<6;i++){await pg.waitForTimeout(160);await pg.screenshot({path:`${out}/w_cast${i}.png`});}
 await pg.waitForTimeout(1500);await pg.screenshot({path:`${out}/w_wait.png`});
 const fights=[['day',11,"FISH.find(f=>f[0]==='perch')||FISH[0]"],['big',11,"FISH.slice().sort((a,b)=>b[2]-a[2])[0]"],['night',23,"FISH.find(f=>f[0]==='perch')||FISH[0]"]];
 for(const [nm,h,f] of fights){await ev(`fish.state='off';S.hour=${h};startMG(${f})`);
   for(let k=0;k<8;k++){await ev(k%3<2?"MG.hold=true":"MG.hold=false");await pg.waitForTimeout(700);if(!(await ev("MG.on")))break;await pg.screenshot({path:`${out}/f_${nm}${k}.png`});}
   await ev("window.FISH_AUTO=1");let t=0;while(await ev("MG.on")&&t<40){await pg.waitForTimeout(300);t+=.3;}await ev("window.FISH_AUTO=0");
   await pg.waitForTimeout(400);await pg.screenshot({path:`${out}/f_${nm}_end.png`});await pg.waitForTimeout(2500);}
 console.log(JSON.stringify(errs.slice(0,5)));await b.close();})();
