const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=12;S.room=null;");
 for(const id of ['june','tess']){const r=await ev(`(()=>{const n=npcById('${id}');if(!n)return 'no npc';S.room=n.room||null;P.x=n.x;P.z=n.z+1.2;P.dir='N';talk(n);return 'talking to '+n.def.name;})()`);console.log(r);await pg.waitForTimeout(700);await pg.screenshot({path:`TAL_${id}.png`});
   await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);if($('talk'))$('talk').hidden=true;S.paused=false;");}
 // all eight standing in a row in the square
 await ev("S.room=null;const ids=['nell','june','cora','ida','tess','iris','della','maud'];ids.forEach((id,i)=>{const n=npcById(id);if(n){n.x=44+i*1.1;n.z=-4.8;n.room=null;n.loc='out';n.dir='S';n.target=null;n.hold=99;}});P.x=47.8;P.z=-3.2;P.dir='N';");
 await pg.waitForTimeout(500);await pg.screenshot({path:'TAL_row.png'});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
