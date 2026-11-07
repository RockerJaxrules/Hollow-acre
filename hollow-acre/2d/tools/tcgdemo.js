const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_demo.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;window.CG2_SPEED=2;");
 const per=JSON.parse(await ev("(()=>{const o={};for(const [k,d] of Object.entries(CG3_RECIPES))d.steps.forEach((s,i)=>{if(!o[s.m])o[s.m]=[k,i];});return JSON.stringify(o);})()"));
 for(const [m,[k,i]] of Object.entries(per)){
   await ev(`S.cgTut={};const d=CG3_RECIPES['${k}'];cg3Run({scene:d.scene,revealScene:d.revealScene,reveal:d.reveal,steps:[d.steps[${i}]]},'demo ${m}',()=>{});`);
   let t0=Date.now(),res='timeout';while(Date.now()-t0<20000){const n=await ev('window.CG2_NOW');if(/^your/.test(n)){res=await ev('(window.__cg3cur.score!=null?(+window.__cg3cur.score).toFixed(2):"not done")');break;}await pg.waitForTimeout(150);}
   console.log(m.padEnd(8),k.padEnd(18),'demo score',res);await ev("$('cgSkip').click()");await pg.waitForTimeout(2300);}
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
