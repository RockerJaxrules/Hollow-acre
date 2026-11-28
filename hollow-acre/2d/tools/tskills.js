const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(900);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const xp=()=>ev("JSON.stringify(S.skills)");
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100;S.energyMax=100;");await pg.waitForTimeout(600);
 console.log('start (nothing earned yet):',await xp());
 // a rock in the field, broken with the pickaxe the real way
 const r=await ev("(()=>{const o=OBJ.find(o=>o.debris==='rock'&&!o.hide&&o.x>-6&&o.x<8);return [o.x,o.z];})()");
 await ev(`P.x=${r[0]};P.z=${r[1]}+1.1;P.dir='N';`);await ev("const i=S.slots.findIndex(k=>k==='T:pick');if(i>=0){S.slotSel=i;}");await pg.waitForTimeout(300);
 await pg.keyboard.press('c');await pg.waitForTimeout(1600);console.log('after breaking a rock: stone',await ev("inv('stone')"),'xp',await xp());
 // a ripe turnip, harvested
 await ev("const t=tiles.find(t=>!t.gh&&!(t.debris&&!t.debris.hide));t.tilled=true;t.crop={type:'turnip',stage:3,growth:99,watered:true,pop:0};window.__t=t;P.x=t.x;P.z=t.z+1;");await pg.waitForTimeout(300);
 const v0=await ev("S.basket.length");await ev("doHarvest(__t)");await pg.waitForTimeout(1500);console.log('after harvesting a turnip: basket',v0,'->',await ev('S.basket.length'),'value',await ev("S.basket[S.basket.length-1].value"),'xp',await xp());
 // wood from a felled tree, a fish caught
 await ev("addInv('wood',6)");await pg.waitForTimeout(400);await ev("S.fishCaught=(S.fishCaught||0)+1;S.basket.push({kind:'fish',value:20})");await pg.waitForTimeout(400);console.log('after 6 wood and a fish:',await xp());
 // buying timber at Nell's (shop open) earns nothing; shipping and taking back earns nothing
 const before=await xp();await ev("S.coins=100;openShop('v_carp');");await pg.waitForTimeout(300);await pg.evaluate(()=>{for(const b of document.querySelectorAll('#shopRows button'))if(/25 coins/.test(b.textContent)){b.click();break;}});await pg.waitForTimeout(400);
 await ev("$('shop').hidden=true;S.paused=false;");await pg.waitForTimeout(500);console.log('bought timber: wood',await ev("inv('wood')"),'xp unchanged?',before===await xp());
 await ev("openShipBin();shipPut('I','wood',true);shipTake('I','wood',true);closeShipBin();");await pg.waitForTimeout(500);console.log('in and out of the bin: xp unchanged?',before===await xp());
 // level up: farming to 3 (the float and the toast), then the hoe costs less
 await ev("addXP('farming',95)");await pg.waitForTimeout(500);await pg.screenshot({path:'TK_level.png'});console.log('farming level',await ev("skLvl('farming')"),'toast:',await ev("$('toast').textContent"));
 await ev("const i=S.slots.findIndex(k=>k==='T:hoe');if(i>=0)S.slotSel=i;S.energy=50;");console.log('held',await ev('heldKind()'),'hoe swing (2) costs',await ev("(()=>{const e=S.energy;spend(2);return e-S.energy})()"));
 // combat level gives health
 const hp0=await ev('S.hpMax');await ev("addXP('combat',30)");await pg.waitForTimeout(300);console.log('combat 1: max health',hp0,'->',await ev('S.hpMax'));
 // the Skills tab
 await ev("openBag('items')");await pg.waitForTimeout(400);const tabs=await pg.evaluate(()=>[...document.querySelectorAll('#bag .tabs button')].map(b=>b.textContent).join(','));console.log('tabs:',tabs);
 for(const bt of await pg.$$('#bag .tabs button')){if((await bt.textContent())==='Skills'){await bt.click();break;}}await pg.waitForTimeout(500);
 console.log('skills tab:',await pg.evaluate(()=>document.querySelector('#bag h2').textContent),await pg.evaluate(()=>document.querySelectorAll('#bag .skl').length),'rows');
 await pg.screenshot({path:'TK_tab.png'});
 // save and load keeps the levels
 await ev("$('bag').hidden=true;S.paused=false;saveGame();");const sv=await xp();await pg.reload();await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>document.getElementById('cont').click());await pg.waitForTimeout(1500);
 console.log('after reload same xp?',sv===await xp(),await xp());
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
