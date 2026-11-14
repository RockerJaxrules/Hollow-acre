const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;S.energy=100;P.x=20;P.z=109.5;P.dir='N';");await pg.waitForTimeout(400);
 await pg.keyboard.down('w');await pg.waitForTimeout(2600);await pg.keyboard.up('w');console.log('walked north across: z',await ev('P.z.toFixed(2)'),'x',await ev('P.x.toFixed(2)'),'(deck ends at 100.3)');
 await ev("P.x=20;P.z=104.5;");await pg.waitForTimeout(200);await pg.keyboard.down('a');await pg.waitForTimeout(1200);await pg.keyboard.up('a');console.log('step off west mid-span: x',await ev('P.x.toFixed(2)'),'in water?',await ev('LAYERS.water(P.x,P.z)'));
 await ev("P.x=20;P.z=104.5;");await pg.waitForTimeout(200);await pg.keyboard.down('d');for(let i=0;i<8;i++){await pg.waitForTimeout(150);console.log('  ',await ev("P.x.toFixed(2)+','+P.z.toFixed(2)+' water '+LAYERS.water(P.x,P.z)"));}await pg.keyboard.up('d');console.log('step off east mid-span: x',await ev('P.x.toFixed(2)'),'in water?',await ev('LAYERS.water(P.x,P.z)'));
 await ev("P.x=20;P.z=99.2;P.dir='S';");await pg.waitForTimeout(700);await pg.screenshot({path:'TB_north.png'});
 // fish off the side of the bridge: is the river there for the rod?
 console.log('water beside the deck for fishing:',await ev("LAYERS.water(18,104)&&LAYERS.water(22,104)"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
