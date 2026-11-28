const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const D=process.argv[2];
 await ev("S.tut.off=true;document.querySelectorAll('.toast,#toast').forEach(e=>e.style.visibility='hidden');S.room=null;S.hour=12;const c=dkCamp();P.x=c.x;P.z=c.z+6");await pg.waitForTimeout(900);
 await ev(`playScene('june','Into the woods ','You won’t say a name. Hale waits a long time. Then he says one for you: June Pruitt.<br><br>June Pruitt doesn’t argue. Nobody ever argues. Somebody has already packed them a bag: a blanket, a lantern, a tin of matches, a loaf.<br><br>The whole street walks them to the edge of the hill copse, under the trees, where it is dark at noon. Then everyone turns round at the same moment and walks back, and nobody looks back. You look back. June Pruitt is standing exactly where they left them, lantern lit, not moving, watching you go.',()=>{})`);
 await pg.waitForTimeout(900);await pg.screenshot({path:D+'/old_exile_0.png'});await pg.keyboard.press('Space');await pg.waitForTimeout(500);await pg.keyboard.press('Space');await pg.waitForTimeout(700);await pg.screenshot({path:D+'/old_exile_1.png'});
 await b.close();})();
