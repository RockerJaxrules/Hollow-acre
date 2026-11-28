const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100;S.energyMax=100;");
 // a rock out in the field, with room around it
 const r=await ev("(()=>{const o=OBJ.find(o=>o.debris==='rock'&&!o.hide&&o.x>-6&&o.x<8);return [o.x,o.z];})()");console.log('rock',r);
 const fr=[];
 for(const [dir,dz] of [['S',-1.0],['N',1.0],['E',0]]){
   await ev(`P.anim=null;P.x=${r[0]}+(${dir==='E'?-1:0});P.z=${r[1]}+(${dz});S.paused=false;`);await pg.waitForTimeout(300);
   await ev(`window.__rk=interact.find(e=>e.x===${r[0]}&&e.z===${r[1]});__rk.act();P.anim.fire=null;`);
   const c=await ev("(()=>{const rr=view.getBoundingClientRect();return [rr.left+sx(P.x)*rr.width/VW, rr.top+sz(P.z)*rr.height/VH];})()");
   for(let i=0;i<8;i++){await ev(`P.anim&&(P.anim.t=P.anim.dur*${(i+.5)/8});`);await pg.waitForTimeout(60);
     const p=`TR_${dir}${i}.png`;await pg.screenshot({path:p,clip:{x:c[0]-70,y:c[1]-110,width:140,height:140}});fr.push(p);}
   console.log(dir,'P.dir',await ev('P.dir'),'anim',await ev("P.anim&&P.anim.clip"));
   await ev('P.anim=null');
 }
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
