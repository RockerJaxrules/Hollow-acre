// every home's own room: size, walkable new strip, the back door's prompt and line, a screenshot of each
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:680}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=11;S.energy=100;");
 const homes='agnes hale dunn cora june otto silas quill fenn thorne ashby vale kerrigan pike ward'.split(' ');
 for(const h of homes){const k='home_'+h;
   const info=await ev(`(()=>{const R=ROOMS['${k}'];S.room='${k}';P.x=R.ox+8.35;P.z=R.oz+.75;P.fx=0;P.fz=-1;P.dir='N';const c=computeContext();const strip=collide({x:R.ox+8.4,z:R.oz+2.5},.3);return JSON.stringify({shell:R.shell,w:R.w,label:c&&c.label,stripBlocked:!!strip});})()`);
   await pg.waitForTimeout(250);const said=await ev(`(()=>{const c=computeContext();if(c&&c.label==='Door'){c.act();return document.querySelector('#toast')?document.querySelector('#toast').textContent.slice(0,50):'acted';}return 'no door prompt';})()`);
   await ev(`(()=>{const R=ROOMS['${k}'];P.x=R.ox+4;P.z=R.oz+4.6;P.dir='S';})()`);await pg.waitForTimeout(350);await pg.screenshot({path:`TH_${h}.png`});
   console.log(h.padEnd(9),info,'|',said);}
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
