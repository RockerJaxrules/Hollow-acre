const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.room=null;");
 for(const [tag,setup,id] of [['hollis',"S.hour=12;S.storm=false;",'hollis'],['otto_n',"S.hour=21;S.storm=false;",'otto'],['tobias',"S.hour=12;",'tobias'],['agnes_w',"S.hour=21;S.storm=true;",'agnes']]){
   await ev(setup+"document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('talk').hidden=true;S.paused=false;S.room=null;");
   const r=await ev(`(()=>{const n=npcById('${id}');if(!n)return 'none';n.room=null;n.loc='out';P.x=n.x;P.z=n.z+1.2;talk(n);return n.def.name+' '+portraitVariant();})()`);console.log(tag,r);
   await pg.waitForTimeout(500);await pg.screenshot({path:`P6_${tag}.png`,clip:{x:100,y:150,width:800,height:300}});}
 await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('talk').hidden=true;S.paused=false;S.hour=12;S.storm=false;openBag('social')");await pg.waitForTimeout(600);await pg.screenshot({path:'P6_social.png'});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
