// capture every beat of a staged scene (spoken beats once typed; silent beats near the end of their hold)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const D=process.argv[2],which=process.argv[3];
 await ev("S.tut.off=true;S.hour=11;document.querySelectorAll('.toast,#toast').forEach(e=>e.style.visibility='hidden')");
 await ev(process.argv[4]);
 const st=()=>pg.evaluate(()=>{const s=__game.ev('STG');if(!s)return null;const b=s.def.beats[s.i]||{};return {i:s.i,text:b.text||'',hold:b.hold||0,typed:s.typed,cap:document.getElementById('stgCap').classList.contains('on'),mv:Object.keys(s.movers).length,bt:s.bt};});
 let last=-2,k=0;const t0=Date.now();
 while(Date.now()-t0<180000){const s=await st();if(!s)break;
   if(s.i!==last&&s.i>=0){last=s.i;
     if(s.text){while(true){const r=await st();if(!r||r.i!==last)break;if(r.cap&&r.typed>=r.text.length)break;await pg.waitForTimeout(120);}
       await pg.waitForTimeout(500);await pg.screenshot({path:`${D}/${which}_${String(k++).padStart(2,'0')}.png`});await pg.keyboard.press('Space');}
     else{while(true){const r=await st();if(!r||r.i!==last)break;if(!r.mv&&r.bt>=Math.max(.2,r.hold*.7))break;await pg.waitForTimeout(100);}
       const r=await st();if(r&&r.i===last){await pg.screenshot({path:`${D}/${which}_${String(k++).padStart(2,'0')}.png`});}}}
   await pg.waitForTimeout(80);}
 await pg.waitForTimeout(1500);console.log('frames',k,'errors',errs.slice(0,3));await b.close();})();
