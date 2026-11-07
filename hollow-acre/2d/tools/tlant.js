const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:960,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 // keep the creature away so the shots are just the lantern
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=21.5;S.fuel=100;S.energy=100;P.x=2;P.z=-3;H.state='gone';H.timer=9999;H.vis=false;S.paused=false;");
 const hold=async(k,ms)=>{await pg.keyboard.down(k);await pg.waitForTimeout(ms);await pg.keyboard.up(k);};
 await pg.waitForTimeout(500);await pg.screenshot({path:'TL_idle.png'});
 await pg.keyboard.down('d');await pg.waitForTimeout(500);await pg.screenshot({path:'TL_walkE.png'});await pg.keyboard.up('d');
 await hold('w',300);await pg.waitForTimeout(400);await pg.screenshot({path:'TL_N.png'});
 await ev("S.flashlight=true;H.timer=9999;");await hold('a',300);await pg.waitForTimeout(500);await pg.screenshot({path:'TL_hood.png'});
 // zoomed crop of the lantern itself
 const c=await ev("(()=>{const r=view.getBoundingClientRect();return [r.left+sx(P.x)*r.width/VW, r.top+sz(P.z)*r.height/VH, r.width/VW];})()");
 await ev("S.flashlight=false;P.dir='S';H.timer=9999;");await pg.waitForTimeout(300);
 await pg.screenshot({path:'TL_close.png',clip:{x:c[0]-60,y:c[1]-90,width:120,height:110}});
 console.log('scale',c[2],'nightK',await ev('nightK.toFixed(2)'),'sw',await ev('LANT.sw.toFixed(2)'));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
