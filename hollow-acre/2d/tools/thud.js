const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 const cfgs=[['H1',{...devices['iPhone 13']}],['H2',{...devices['iPhone 13 landscape']}],['H3',{...devices['iPad (gen 7)']}],['H4',{viewport:{width:1440,height:900}}],['H5',{...devices['iPhone SE']}]];
 for(const [tag,dev] of cfgs){const pg=await b.newPage(dev);pg.on('pageerror',e=>errs.push(tag+' ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
  await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
  await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(500);
  const ev=c=>pg.evaluate(c=>__game.ev(c),c);
  await ev("S.tut.off=false;for(const k of ['move','act','menu','drag','dusk'])S.tut.done[k]=1;S.foundCabin=true;S.hour=10;P.x=0;P.z=-6;S.basket.push({kind:'turnip',value:6});S.q.hollis=1;S.energy=62;S.hp=80");await ev("S.readLetter=true");await pg.waitForTimeout(600);
  for(let i=0;i<10;i++){if(!(await ev("$('scene').style.display==='flex'")))break;await pg.click('#scene');await pg.waitForTimeout(80);}
  await pg.waitForTimeout(1500);await ev("toast('The scarecrow has moved. It is by the well.',6)");await pg.waitForTimeout(400);await pg.screenshot({path:tag+'.png'});await pg.close();}
 console.log(errs.slice(0,5).join('\n'));await b.close();})();
