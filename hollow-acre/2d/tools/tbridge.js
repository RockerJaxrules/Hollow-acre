const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11;S.energy=100");
 for(const [name,fx,fz,dx,dz] of [['foot',-35,12.4,1,0],['foot back',-35,12.4,-1,0],['mill',null,null,0,1]]){
   const start=await ev(name==='mill'?`(()=>{P.x=BRIDGE2.x;P.z=BRIDGE2.z-4;return [P.x,P.z,BRIDGE2.x,BRIDGE2.z];})()`:`(()=>{P.x=${fx}-(${dx})*3;P.z=${fz};return [P.x,P.z];})()`);
   await pg.waitForTimeout(300);const key=dx>0?'KeyD':dx<0?'KeyA':'KeyS';await pg.keyboard.down(key);await pg.waitForTimeout(2600);await pg.keyboard.up(key);
   const end=await ev("[+P.x.toFixed(2),+P.z.toFixed(2)]");console.log(name,'start',start.map(v=>+v.toFixed?+v.toFixed(2):v),'end',end);
   if(name==='foot')await pg.screenshot({path:'TB_foot.png',clip:{x:300,y:150,width:300,height:300}});}
 console.log(errs.join('\n')||'no errors');await b.close();})();
