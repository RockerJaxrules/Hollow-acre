const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8767/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const rooms=['back_cora','back_dunn','back_fenn','back_june','back_kerrigan','back_otto','back_pike','back_silas','back_thorne','back_vale'];console.log(rooms.length,'rooms');
 for(const r of rooms){try{await ev(`(()=>{S.tut.off=true;S.hour=13;S.room=null;enterRoom('${r}');return 1;})()`);await pg.waitForTimeout(700);
   await ev(`(()=>{const R=ROOMS['${r}'];if(R&&R.ox!=null){P.x=R.ox+(R.w||10)/2;P.z=R.oz+(R.d||8)*.65;}document.querySelectorAll('.toast').forEach(t=>t.remove());return 1;})()`);await pg.waitForTimeout(4500);
   await ev(`(()=>{const R=ROOMS['${r}'];if(R.d+3.5>=VH/PPM)S.roomPan={t0:performance.now()-950};return 1;})()`);await pg.waitForTimeout(40);
   await pg.screenshot({path:'rooms_b5/'+r+'.png'});await ev(`(()=>{try{leaveRoom();}catch(e){}S.room=null;return 1;})()`);await pg.waitForTimeout(300);}catch(e){console.log('fail',r,e.message.slice(0,80));}}
 console.log('errors',errs.length?errs.slice(0,3):'none');await b.close();})();
