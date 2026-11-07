const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 for(let i=0;i<20;i++){try{await pg.goto('http://localhost:8766/test2d.html');break;}catch(e){await new Promise(r=>setTimeout(r,500));}}
 await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(900);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=999;S.energyMax=999;");
 console.log('quarry rocks you can work:',await ev("QROCKS.length"),'kinds',await ev("JSON.stringify(QROCKS.reduce((a,q)=>(a[q.kind]=(a[q.kind]||0)+1,a),{}))"));
 // iron in the quarry with Grandpa's pick: keep swinging until it breaks
 await ev("window.__q=QROCKS.find(q=>q.kind==='iron');P.x=__q.o.x;P.z=__q.o.z+1.1;P.dir='N';const i=S.slots.findIndex(k=>k==='T:pick');S.slotSel=i;");await pg.waitForTimeout(400);
 let swings=0;for(;swings<10&&!(await ev('__q.o.hide'));swings++){await ev("P.anim=null;quarryHit(__q)");await pg.waitForTimeout(800);}
 console.log('quarry iron with the old pick: broke after',swings,'swings; iron ore',await ev("inv('iron')"),'| first-swing hint seen',await ev('!!S.first.ironSlow'));
 // and in the mine, floor 5
 await ev("S.room='mine';const R=ROOMS.mine;P.x=R.ox+R.door;P.z=R.oz+R.d-1;mineFloor(5);");await pg.waitForTimeout(400);
 const hasIron=await ev("MINE.ores.some(o=>o.ore==='iron')");console.log('mine floor 5 has iron veins:',hasIron);
 if(hasIron){await ev("window.__m=MINE.ores.find(o=>o.ore==='iron');P.x=__m.x;P.z=__m.z+.7;P.fx=0;P.fz=-1;P.dir='N';");const i0=await ev("inv('iron')");
   let k=0;for(;k<10&&!(await ev('__m.hide'));k++){await ev("P.anim=null;P.x=__m.x;P.z=__m.z+.7;P.fx=0;P.fz=-1;const c=computeContext();if(c&&c.label==='Mine')c.act();");await pg.waitForTimeout(800);}
   console.log('mine iron with the old pick: broke after',k,'swings; iron',i0,'->',await ev("inv('iron')"));}
 await ev("S.room=null;");
 // the steel pickaxe can now be bought with that iron
 await ev("addInv('iron',4);addInv('copper',3);S.coins=100;");console.log('steel pickaxe row can be bought:',await ev("(()=>{const r=vendors.hollis.rows().find(r=>r.k==='pick');return r.can&&Object.entries(r.need).every(([k,n])=>inv(k)>=n)&&S.coins>=r.price})()"));
 // fish: eat one raw, cook one
 await ev("S.basket.push({kind:'fish',value:20},{kind:'fish',value:20});S.energy=50;S.energyMax=100;");
 console.log('raw fish in the bag:',await ev("JSON.stringify((({name,desc,food})=>({name,desc,food}))(itemInfo('P:fish')))"));
 const e0=await ev('S.energy');await ev("const i=S.slots.indexOf('P:fish');if(i>=0){S.slotSel=i;}");console.log('fish slot on the hotbar:',await ev("S.slots.indexOf('P:fish')"));
 await ev("openBag('items')");await pg.waitForTimeout(500);let ate=false;for(const bt of await pg.$$('#bag [data-eat]')){const row=await bt.evaluate(e=>(e.closest('div')||e.parentElement).innerText);if(/fish/i.test(row)){await bt.click();ate=true;break;}}
 if(!ate){const all=await pg.$$('#bag [data-eat]');console.log('eat buttons:',all.length);const i=await ev("(()=>{for(let i=0;i<S.slots.length;i++){const it=itemInfo(S.slots[i]);if(it&&it.id==='fish')return i;}return -1})()");console.log('fish slot',i);if(i>=0){const bt=await pg.$(`#bag [data-eat="${i}"]`);if(bt){await bt.click();ate=true;}}}
 console.log('clicked Eat on the fish:',ate);await pg.waitForTimeout(400);await ev("$('bag').hidden=true;S.paused=false;");
 const fi=await ev("(()=>{for(let i=0;i<S.slots.length;i++){const it=itemInfo(S.slots[i]);if(it&&it.id==='fish')return i;}return -1})()");const key=fi<9?String(fi+1):fi===9?'0':fi===10?'-':'=';
 if(!ate&&fi>=0){await pg.keyboard.press(key);await pg.waitForTimeout(250);await pg.keyboard.press(key);await pg.waitForTimeout(400);console.log('pressed',key,'twice (the fish slot) | toast:',await ev("$('toast').textContent"));}console.log('ate a raw fish: energy',e0,'->',await ev('S.energy'),'fish left',await ev("basketCount('fish')"));
 console.log('stove has pan-fried fish:',await ev("vendors.cook.rows().some(r=>r.k==='fish_fried')"));
 await ev("window.__q2=null;CR.v='cook';craftGame('cook',vendors.cook.rows().find(r=>r.k==='fish_fried'),q=>{window.__q2=q;});window.CG2_SPEED=2;");
 const cv=await pg.$('#cgC');const bb=await cv.boundingBox();let shot=0;
 for(let i=0;i<60&&(await ev('window.__q2'))===null;i++){if(!shot&&(await ev('window.CG2_NOW||""')).startsWith('gauge')){await pg.waitForTimeout(400);await pg.screenshot({path:'TF_fishflip.png',clip:{x:bb.x-20,y:bb.y-70,width:bb.width+40,height:bb.height+110}});shot=1;}
   if(i===3)await pg.screenshot({path:'TF_fishgut.png',clip:{x:bb.x-20,y:bb.y-70,width:bb.width+40,height:bb.height+110}});await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(330);}
 console.log('pan-fried fish minigame finished, quality',await ev('window.__q2'));
 // a broken quarry rock comes back after three days, and is remembered by the save
 await ev("for(let i=0;i<3;i++)newDay('',null);");await pg.waitForTimeout(800);console.log('quarry iron back after 3 days:',await ev('!__q.o.hide'));
 await ev("quarryHit=quarryHit;__q.o.hide=true;__q.o.goneDay=S.day;saveGame();");await pg.reload();await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>document.getElementById('cont').click());await pg.waitForTimeout(1500);
 console.log('after reload the broken rock is still broken:',await ev("QROCKS.find(q=>q.kind==='iron').o.hide"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
