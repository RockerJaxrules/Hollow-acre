const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const scr=(x,z)=>ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(${x})*r.width/VW, r.top+sz(${z})*r.height/VH];})()`);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;S.energy=100;S.furnBag=['chair','shelf','pumpkin','rug'];");
 await ev("const R=ROOMS.cabin;S.room='cabin';P.x=R.ox+3;P.z=R.oz+4;P.dir='N';");await pg.waitForTimeout(500);
 const R=await ev("[ROOMS.cabin.ox,ROOMS.cabin.oz]");
 // the chair: open placement from the bag, put it at a spot, turn it twice (S -> W -> N), place
 await ev("startFurn('chair')");await pg.waitForTimeout(200);
 console.log('rotate button shown:',await ev("$('placeRot').style.display!=='none'"),'hint:',await ev("$('placeHint').textContent"));
 const free=await ev("(()=>{for(let z=ROOMS.cabin.oz+1.5;z<ROOMS.cabin.oz+5;z+=.5)for(let x=ROOMS.cabin.ox+1;x<ROOMS.cabin.ox+8.5;x+=.5){PLACE.x=x;PLACE.z=z;PLACE.manual=true;if(!placeValid(x,z)&&Math.abs(x-P.x)>1.2)return [x,z];}return null})()");console.log('free chair spot',free);
 let c=await scr(free[0],free[1]-.25);await pg.mouse.click(c[0],c[1]);await pg.waitForTimeout(150);
 await pg.keyboard.press('r');await pg.waitForTimeout(120);await pg.keyboard.press('r');await pg.waitForTimeout(120);
 console.log('chair spot:',await ev("placeValid(...placeSpot())||'ok'"),await ev('placeSpot()'));console.log('after R R: rot',await ev('PLACE.spec.rot'),'spr',await ev('PLACE.spec.spr'),'flip',await ev('PLACE.spec.flip'),'foot',await ev('[PLACE.spec.w,PLACE.spec.d]'));
 await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
 // the shelf, turned once with the button (S -> W): west-facing side view, footprint swapped
 await ev("startFurn('shelf')");await pg.waitForTimeout(200);c=await scr(R[0]+6.5,R[1]+2.8);await pg.mouse.click(c[0],c[1]);await pg.waitForTimeout(150);
 const rb=await pg.$('#placeRot');const bb=await rb.boundingBox();await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(150);
 console.log('shelf rot',await ev('PLACE.spec.rot'),'foot',await ev('[PLACE.spec.w,PLACE.spec.d]'),'valid?',await ev("placeValid(...placeSpot())||'ok'"));
 await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
 // the pumpkin, turned east (S -> W -> N -> E)
 await ev("startFurn('pumpkin')");await pg.waitForTimeout(200);const fp=await ev("(()=>{for(let z=ROOMS.cabin.oz+1.5;z<ROOMS.cabin.oz+5;z+=.5)for(let x=ROOMS.cabin.ox+8;x>ROOMS.cabin.ox+1;x-=.5){if(!placeValid(x,z)&&Math.abs(x-P.x)>1.2)return [x,z];}return null})()");console.log('pumpkin spot',fp,'(on the chair would be:',await ev("placeValid(...(()=>{const p=S.furnPlaced.find(p=>p.k==='chair');return [p.x,p.z]})())"),')');
 c=await scr(fp[0],fp[1]-.25);await pg.mouse.click(c[0],c[1]);await pg.waitForTimeout(150);
 for(let i=0;i<3;i++){await pg.keyboard.press('r');await pg.waitForTimeout(100);}await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
 console.log('placed:',JSON.stringify(await ev('S.furnPlaced')));
 console.log('objects:',JSON.stringify(await ev("OBJ.filter(o=>o.furnKey&&!o.hide).map(o=>o.furnKey+':'+o.spr+(o.flip?'(flipped)':''))")));
 await ev("P.x=ROOMS.cabin.ox+4;P.z=ROOMS.cabin.oz+4.6;P.dir='N';");await pg.waitForTimeout(400);await pg.screenshot({path:'TF_placed.png'});
 // pick the chair up again: click it twice
 const ch=await ev("(()=>{const p=S.furnPlaced.find(p=>p.k==='chair');return [p.x,p.z]})()");c=await scr(ch[0],ch[1]-.3);
 await pg.mouse.click(c[0],c[1],{button:'right'});for(let i=0;i<30&&!(await ev("/again/.test($('toast').textContent)"));i++)await pg.waitForTimeout(100);console.log('1st click: placing?',await ev('PLACE.on'),'toast:',await ev("$('toast').textContent"));
 c=await scr(ch[0],ch[1]-.3);await pg.mouse.click(c[0],c[1],{button:'right'});await pg.waitForTimeout(500);
 console.log('2nd click: placing?',await ev('PLACE.on'),'moving chair facing',await ev('PLACE.spec&&PLACE.spec.rot'),'chair still listed?',await ev("S.furnPlaced.some(p=>p.k==='chair')"));
 await pg.keyboard.press('r');await pg.waitForTimeout(100);await pg.keyboard.press('Escape');await pg.waitForTimeout(300);
 console.log('after Esc: back?',JSON.stringify(await ev("S.furnPlaced.find(p=>p.k==='chair')")),'toast:',await ev("$('toast').textContent"));
 // save, then rebuild the cabin from the save the way Continue does
 const data=await ev("JSON.stringify(saveData())");
 await ev("for(const o of OBJ)if(o.furnKey)o.hide=true;");
 await ev(`(()=>{const d=JSON.parse(${JSON.stringify(data)});S.furnPlaced=d.S.furnPlaced;benchesBoot();})()`);
 console.log('after reload:',JSON.stringify(await ev("OBJ.filter(o=>o.furnKey&&!o.hide).map(o=>o.furnKey+':'+o.spr+(o.flip?'(flipped)':''))")));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
