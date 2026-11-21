// the rocking chair and the oil lamp in the cabin: depth, collision, rotation, night glow; the craft lists' icons
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;S.energy=100;S.furnBag=['chair','lamp'];const R=ROOMS.cabin;S.room='cabin';P.x=R.ox+2;P.z=R.oz+5;P.dir='N';");await pg.waitForTimeout(500);
 const place=async(k,x,z,rots)=>{await ev(`startFurn('${k}')`);await pg.waitForTimeout(150);for(let i=0;i<rots;i++){await ev("$('placeRot').click()");await pg.waitForTimeout(80);}
   return ev(`(()=>{const R=ROOMS.cabin;for(let dz=0;dz<3;dz+=.5)for(let dx=0;dx<3;dx+=.5){const x=R.ox+${x}+dx,z=R.oz+${z}+dz;if(!placeValid(x,z)){PLACE.x=x;PLACE.z=z;PLACE.manual=true;placeConfirm();return 'placed '+x.toFixed(1)+','+z.toFixed(1);}}return 'no spot: '+placeValid(R.ox+${x},R.oz+${z});})()`);};
 console.log('chair',await place('chair',3,2.5,0));console.log('lamp',await place('lamp',5.5,2.2,0));
 await ev("P.x=ROOMS.cabin.ox+4.2;P.z=ROOMS.cabin.oz+2.3;P.dir='S';");await pg.waitForTimeout(400);await pg.screenshot({path:'TFU2_day.png'});
 const blocked=await ev("(()=>{const f=S.furnPlaced.find(q=>q.k==='chair');return f?collide(f.x,f.z-.25):'no chair';})()");console.log('chair blocks walking:',blocked);
 await ev("S.hour=22.5;");await pg.waitForTimeout(600);await pg.screenshot({path:'TFU2_night.png'});
 // rotate the chair round with the move tool if it exists
 console.log('views',await ev("JSON.stringify(['S','E','N','W'].map(r=>furnView('chair',r)))"));
 await ev("S.hour=12;S.room=null;document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);S.paused=false;");
 for(const v of ['craft','b_weapon','b_armor','b_furn']){await ev(`openShop('${v}')`);await pg.waitForTimeout(400);await pg.screenshot({path:`TFU2_${v}.png`});await ev("$('shop').hidden=true;S.paused=false;");}
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
