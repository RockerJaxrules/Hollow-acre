const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11;S.energy=100;");
 console.log('found cabin:',await ev("!!hcab()"),'wall rect:',await ev("!!HCAB.rect"),'porch pumpkins:',await ev("HCAB.pumps.length"));
 const order=async(tier)=>{await ev(`S.coins+=2000;addInv('wood',300);addInv('stone',300);addInv('iron_bar',10);addInv('copper_bar',10);S.room=null;openShop('v_carp');`);await pg.waitForTimeout(400);
   const btns=await pg.$$('button');let hit=null;for(const bt of btns){const t=(await bt.textContent()||'').trim();if(t==='Order'&&await bt.isVisible()){hit=bt;break;}}
   if(!hit){console.log('  no Order button visible; row:',await ev("JSON.stringify(vendors.v_carp.rows().find(r=>r.k==='house'))"));return;}
   await hit.click();await pg.waitForTimeout(300);
   // the bench-style sheet may need a confirm/craft step
   for(let i=0;i<3&&!(await ev('!!S.house.build'));i++){const more=await pg.$$('button');for(const bt of more){const t=(await bt.textContent()||'').trim();if(/^(Order|Make|Buy|Craft)$/.test(t)&&await bt.isVisible()){await bt.click();break;}}await pg.waitForTimeout(400);}
   console.log(`ordered tier ${tier}:`,JSON.stringify(await ev('S.house')),'coins',await ev('S.coins'));
   await ev("for(const id of ['shop','craft','note']){const e=$(id);if(e)e.hidden=true;}document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);S.paused=false;");};
 const sleepUntilDone=async()=>{for(let i=0;i<5&&S_build();i++){await ev("newDay&&newDay('',null)");await pg.waitForTimeout(400);}};
 const S_build=()=>true;
 const days=async(n)=>{for(let i=0;i<n;i++){await ev("newDay('',null)");await pg.waitForTimeout(300);}await pg.waitForTimeout(1200);await ev("$('note').hidden=true;S.paused=false;S.mode='play';S.room=null;S.hour=11;");};
 const outside=async(name)=>{await ev("S.room=null;P.x=0;P.z=-4.6;P.dir='N';S.hour=11;");await pg.waitForTimeout(500);await pg.screenshot({path:name});};
 const inside=async(name,hour)=>{await ev(`S.room='cabin';const R=ROOMS.cabin;P.x=R.ox+R.door;P.z=R.oz+R.d-.6;P.dir='N';S.hour=${hour||11};`);await pg.waitForTimeout(500);await pg.screenshot({path:name});};
 // tier 1
 await order(1);await ev("S.hour=11");await outside('TH_scaffold.png');
 const em0=await ev('S.energyMax');await days(2);
 console.log('tier',await ev('houseTier()'),'cabin sprite',await ev('HCAB.bld.e.spr'),'room',await ev("ROOMS.cabin.shell"),'energyMax',em0,'->',await ev('S.energyMax'));
 await outside('TH_t1_out.png');await inside('TH_t1_in.png');
 // tier 2
 await order(2);await days(3);
 console.log('tier',await ev('houseTier()'),'cabin sprite',await ev('HCAB.bld.e.spr'),'room w',await ev('ROOMS.cabin.w'),'wall x',await ev('[HCAB.rect.x0,HCAB.rect.x1]'),'pumpkins',await ev("HCAB.pumps.map(p=>p.o.x.toFixed(1)).join(',')"));
 console.log('things inside the wider cabin footprint:',await ev("OBJ.filter(o=>!o.hide&&!o.room&&o!==HCAB.bld.e&&['prop','bld','furn','tree'].includes(o.kind)&&o.x>-4.2&&o.x<4.2&&o.z>-12.9&&o.z<-9.3).map(o=>o.spr+'@'+o.x.toFixed(1)+','+o.z.toFixed(1)).join(' ')||'none'"));
 console.log('cook rows need fuel?',await ev("JSON.stringify(vendors.cook.rows()[0].need)"),await ev("vendors.cook.rows()[0].desc"));
 // can you walk into the kitchen end of the room?
 await ev("S.room='cabin';const R=ROOMS.cabin;P.x=R.ox+R.door;P.z=R.oz+3.6;");await pg.keyboard.down('d');await pg.waitForTimeout(2200);await pg.keyboard.up('d');console.log('walked east to x',await ev("(P.x-ROOMS.cabin.ox).toFixed(2)"),'of',await ev('ROOMS.cabin.w'));
 await outside('TH_t2_out.png');await inside('TH_t2_in.png');
 // tier 3
 await order(3);await days(3);
 console.log('tier',await ev('houseTier()'),'cabin sprite',await ev('HCAB.bld.e.spr'),'hearth in room',await ev("ROOMS.cabin.furn.some(f=>f[0]==='in_hearth')"),'hp/mind after a night',await ev("S.hp+'/'+S.hpMax+' '+Math.round(M.v)"));
 await inside('TH_t3_night.png',22);await outside('TH_t3_out.png');
 console.log('row now:',await ev("vendors.v_carp.rows().find(r=>r.k==='house').desc"));
 // save, reload, continue
 await ev("saveGame()");await pg.reload();await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>document.getElementById('cont').click());await pg.waitForTimeout(1500);
 console.log('after reload: tier',await ev('houseTier()'),'sprite',await ev('HCAB.bld.e.spr'),'room w',await ev('ROOMS.cabin.w'),'shell',await ev('ROOMS.cabin.shell'),'hearth objs',await ev("OBJ.filter(o=>!o.hide&&o.spr==='in_hearth').length"),'counter objs',await ev("OBJ.filter(o=>!o.hide&&o.spr==='in_kcounter').length"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
