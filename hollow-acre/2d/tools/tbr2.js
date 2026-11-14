const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const X=+(process.argv[2]||20),Z=+(process.argv[3]||108);
 await ev(`S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;P.x=${X};P.z=${Z};P.dir='N';$('toast').classList.remove('show');`);await pg.waitForTimeout(1200);
 await pg.screenshot({path:process.argv[4]||'TB_south.png'});
 // what the ground is under and around the bridge
 let s='';for(let z=98;z<=110;z+=1){let r='';for(let x=14;x<=26;x+=1)r+=await ev(`LAYERS.water(${x},${z})?'~':onRoad(${x},${z},0)?'=':'.'`);s+=z+' '+r+'\n';}console.log(s);
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
