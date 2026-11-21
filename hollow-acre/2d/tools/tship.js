const {chromium,devices}=require('playwright');
const mode=process.argv[2]||'pc';
(async()=>{const b=await chromium.launch();const pg=await b.newPage(mode==='phone'?{...devices['iPhone 13']}:{viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const scr=(x,z)=>ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(${x})*r.width/VW, r.top+sz(${z})*r.height/VH];})()`);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=15;S.coins=10;for(let i=0;i<5;i++)S.basket.push({kind:'turnip',value:8});for(let i=0;i<2;i++)S.basket.push({kind:'pumpkin',value:30});S.basket.push({kind:'fish',value:22});addInv('gem',1);addInv('copper_bar',2);addInv('soup',1);addInv('wood',20);$('toast').classList.remove('show');");
 // open the bin by clicking it in the world (interact)
 await ev("P.x=binPos.x+.2;P.z=binPos.z+1.6;P.dir='N';");await pg.waitForTimeout(400);const c=await scr(binPos=await ev('[binPos.x,binPos.z]').then(v=>v)[0]??0,0).catch(()=>null);
 const bp=await ev('[binPos.x,binPos.z]');const cc=await scr(bp[0],bp[1]-.4);
 if(mode==='phone')await pg.touchscreen.tap(cc[0],cc[1]);else await pg.mouse.click(cc[0],cc[1],{button:'right'});await pg.waitForTimeout(900);
 console.log('bin open:',await ev("!$('shipBin').hidden"));
 console.log('yours:',await pg.evaluate(()=>[...document.querySelectorAll('#sbHave .sbit')].map(e=>e.innerText.replace(/\n/g,' ')).join(' | ')));
 await pg.screenshot({path:`TS_bin_${mode}.png`});
 const cell=async(id,bin)=>pg.$(`#${bin?'sbBin':'sbHave'} .sbit[data-id="${id}"]`);
 // tap one turnip in
 let t=await cell('turnip');let bb=await t.boundingBox();if(mode==='phone')await pg.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);else await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(200);
 console.log('after one tap: basket turnips',await ev("basketCount('turnip')"),'bin',await ev('S.ship.length'),'shipped',await ev('S.shipped'));
 // drag the pumpkins across (mouse drag; touch drag on phone)
 t=await cell('pumpkin');bb=await t.boundingBox();const tgt=await (await pg.$('#sbBin')).boundingBox();
 if(mode==='phone'){const cdp=await pg.context().newCDPSession(pg);const pts=(x,y)=>[{x,y}];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts(bb.x+bb.width/2,bb.y+bb.height/2)});
   for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:pts(bb.x+bb.width/2+(tgt.x+tgt.width/2-bb.x-bb.width/2)*i/8,bb.y+bb.height/2+(tgt.y+tgt.height/2-bb.y-bb.height/2)*i/8)});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 else{await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();for(let i=1;i<=8;i++)await pg.mouse.move(bb.x+bb.width/2+(tgt.x+tgt.width/2-bb.x-bb.width/2)*i/8,bb.y+bb.height/2+(tgt.y+tgt.height/2-bb.y-bb.height/2)*i/8);await pg.mouse.up();}
 await pg.waitForTimeout(250);console.log('after dragging pumpkins: basket pumpkins',await ev("basketCount('pumpkin')"),'bin',await ev("JSON.stringify(binGroups().map(g=>g.id+'x'+g.n))"));
 // shift-click the gem and the bars (pc), take one turnip back out
 if(mode!=='phone'){for(const id of ['gem','copper_bar','soup']){t=await cell(id);bb=await t.boundingBox();await pg.keyboard.down('Shift');await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.keyboard.up('Shift');await pg.waitForTimeout(120);}}
 t=await cell('turnip',true);bb=await t.boundingBox();if(mode==='phone')await pg.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);else await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(200);
 console.log('took the turnip back: basket turnips',await ev("basketCount('turnip')"),'bin',await ev("JSON.stringify(binGroups().map(g=>g.id+'x'+g.n))"));
 // ship all crops button
 await (await pg.$('#sbCrops')).click();await pg.waitForTimeout(200);console.log('ship all crops: basket',await ev('S.basket.length'),'bin',await ev("JSON.stringify(binGroups().map(g=>g.id+'x'+g.n))"),'total',await ev('S.ship.reduce((a,e)=>a+e.value,0)'));
 await pg.screenshot({path:`TS_bin2_${mode}.png`});
 await (await pg.$('#sbDone')).click();await pg.waitForTimeout(200);console.log('closed:',await ev("$('shipBin').hidden"),'paused',await ev('S.paused'),'coins still',await ev('S.coins'));
 await pg.waitForTimeout(500);await pg.screenshot({path:`TS_world_${mode}.png`});
 // sleep
 const before=await ev('S.coins');await ev("newDay('',null)");await pg.waitForTimeout(2600);
 console.log('morning: slip shown',await ev("!$('saleSlip').hidden"),'coins',before,'->',await ev('S.coins'),'bin',await ev('S.ship.length'));
 await pg.screenshot({path:`TS_slip_${mode}.png`});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
