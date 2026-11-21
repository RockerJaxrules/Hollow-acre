const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11;$('hud').style.opacity=.15");
 for(const key of ['KeyS','KeyW']){await ev("P.x=-35;P.z=12.4");await pg.waitForTimeout(200);await pg.keyboard.down(key);await pg.waitForTimeout(1500);await pg.keyboard.up(key);console.log(key,'from deck centre ->',await ev("P.x.toFixed(2)+','+P.z.toFixed(2)"));}
 // from the bank beside the bridge into the creek
 await ev("P.x=-37.2;P.z=10.6");await pg.waitForTimeout(200);await pg.keyboard.down('KeyD');await pg.waitForTimeout(1500);await pg.keyboard.up('KeyD');console.log('bank north of bridge, walking east ->',await ev("P.x.toFixed(2)+','+P.z.toFixed(2)+' water '+LAYERS.water(P.x,P.z)"));
 await ev("P.x=-35;P.z=12.4;P.dir='E'");await pg.waitForTimeout(600);
 const c=await ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(P.x)*r.width/VW, r.top+sz(P.z)*r.height/VH];})()`);await pg.screenshot({path:'TB_cross.png',clip:{x:c[0]-130,y:c[1]-110,width:260,height:180}});
 console.log(errs.join('\n')||'no errors');await b.close();})();
