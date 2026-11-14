const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push(e.stack.slice(0,400)));await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const which=process.argv[3],D=process.argv[2];
 await ev("S.tut.off=true;S.hour=11;document.querySelectorAll('.toast,#toast').forEach(e=>e.style.visibility='hidden')");
 if(which==='gate')await ev("P.x=doorPos.x;P.z=doorPos.z+1.2;stgCaitlynGate(()=>{window.__done=1})");
 else await ev("P.x=CHURCH_STEP.x;P.z=CHURCH_STEP.z;"+(which==='drawdunn'?"stHas=()=>true;":"")+"stgDrawing(()=>{window.__done=1})");
 await pg.waitForTimeout(2200);let k=0;
 for(let i=0;i<30;i++){
   const s=await pg.evaluate(()=>{const st=__game.ev('STG');if(!st)return null;const b=st.def.beats[st.i];return {i:st.i,n:st.def.beats.length,text:b&&b.text||'',typed:st.typed,mv:Object.keys(st.movers).length};});
   if(!s)break;
   if(s.text){const t0=Date.now();while(Date.now()-t0<12000){const r=await pg.evaluate(()=>{const st=__game.ev('STG');const b=st&&st.def.beats[st.i];return st&&b&&b.text?(st.typed>=b.text.length&&document.getElementById('stgCap').classList.contains('on')):true;});if(r)break;await pg.waitForTimeout(150);}
     await pg.waitForTimeout(600);await pg.screenshot({path:`${D}/${which}_${String(k++).padStart(2,'0')}.png`});await pg.keyboard.press('Space');await pg.waitForTimeout(250);}
   else{await pg.waitForTimeout(900);}
 }
 await pg.waitForTimeout(1500);await pg.screenshot({path:`${D}/${which}_end.png`});
 console.log('done',await pg.evaluate(()=>window.__done),'errors',errs.slice(0,3));await b.close();})();
