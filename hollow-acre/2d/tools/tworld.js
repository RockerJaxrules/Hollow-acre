const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();});await pg.waitForTimeout(800);await pg.screenshot({path:'TW_creator.png'});
 await pg.evaluate(()=>document.getElementById('cGo').click());await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11;$('hud').style.opacity=.2");
 // walk the player into town among people
 await ev("(()=>{const n=npcById('mae');P.x=n.x-1.5;P.z=n.z+.6;for(const q of npcs.slice(0,6)){if(q!==n&&q.vis){q.x=P.x+((npcs.indexOf(q)%3)-1)*1.6;q.z=P.z-1.4+(npcs.indexOf(q)>2?2.6:0);}}})()");await pg.waitForTimeout(900);
 await pg.screenshot({path:'TW_town.png',clip:{x:240,y:120,width:480,height:360}});console.log(errs.join('\n')||'no errors');await b.close();})();
