const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:760}});await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=11;S.room=null;P.x=100;P.z=122.5;");await pg.waitForTimeout(500);
 // which objects are around the dark slab (screen 540-850, 480-650 => world offsets)
 console.log(await ev(`(()=>{const r=view.getBoundingClientRect();const toW=(cx,cy)=>screenToWorld(cx,cy);const a=toW(r.left+540*r.width/1100,r.top+480*r.height/760),b=toW(r.left+850*r.width/1100,r.top+650*r.height/760);
   const near=OBJ.filter(o=>o.x>a[0]-3&&o.x<b[0]+3&&o.z>a[1]-4&&o.z<b[1]+2&&o.kind!=='anim').map(o=>[o.spr,o.kind,+o.x.toFixed(1),+o.z.toFixed(1)]);return JSON.stringify({a,b,near,sun:DX.sun});})()`));
 await pg.screenshot({path:'TP_a.png'});
 await ev("DX.par=[];");await pg.waitForTimeout(400);await pg.screenshot({path:'TP_nosun.png'});
 await b.close();})();
