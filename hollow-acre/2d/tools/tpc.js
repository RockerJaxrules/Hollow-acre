const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const sizes=process.argv.slice(2).length?process.argv.slice(2):['1920x1080','1366x768','1280x720'];
 for(const sz of sizes){const [w,h]=sz.split('x').map(Number);const pg=await b.newPage({viewport:{width:w,height:h}});pg.on('pageerror',e=>errs.push(sz+' ERR '+e.message));
  await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
  const ev=c=>pg.evaluate(c=>__game.ev(c),c);const shot=async n=>{await pg.waitForTimeout(450);await pg.screenshot({path:`PC_${sz}_${n}.png`});};
  await pg.waitForTimeout(400);await shot('0title');
  await pg.click('#begin');await shot('1creator');await pg.click('#cGo');await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());
  await ev("S.tut.off=false;for(const k of ['move','act','menu','drag','dusk'])S.tut.done[k]=1;S.foundCabin=true;S.hour=10;P.x=0;P.z=-6");await ev("S.readLetter=true");await pg.waitForTimeout(500);
  for(let i=0;i<10;i++){if(!(await ev("$('scene').style.display==='flex'")))break;await pg.click('#scene');await pg.waitForTimeout(80);}
  await pg.waitForTimeout(1200);await shot('2play');
  await ev("$('maecard').style.display='none';openBag('items')");await shot('3bag');
  await ev("openBag('map')");await pg.waitForTimeout(1500);await shot('4map');await ev("$('bag').hidden=true;S.paused=false");
  await ev("talk(npcById('mae'))");await shot('5talk');await ev("$('talk').hidden=true;S.paused=false;talkingTo=null");
  await ev("openShop('mae')");await shot('6shop');await ev("$('shop').hidden=true;S.paused=false");
  console.log(sz,'zoom checks',await ev("['hud','hotbar','buttons','btnBag','objective'].map(id=>id+':'+getComputedStyle($(id)).zoom).join(' ')+' --u '+getComputedStyle(document.documentElement).getPropertyValue('--u')"));
  await pg.close();}
 console.log(errs.slice(0,5).join('\n'));await b.close();})();
