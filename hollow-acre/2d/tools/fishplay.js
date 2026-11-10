// node f199/play.js : many fights with a sensible auto player (FISH_AUTO) on the new fight: outcomes, phases seen, lengths
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/'+(process.env.PAGE||'test2d_f4.html'));await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1200);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.readLetter=true;S.tut.off=true;S.mode='play';S.paused=false;P.x=fishSpot.x;P.z=fishSpot.z-.2;S.hour=11;window.FISH_AUTO=1;window.__ph={};const _ms=mgStep;mgStep=function(n){if(MG.on){__ph[MG.phase]=(__ph[MG.phase]||0)+1;}return _ms(n);};");
 const kinds=await ev("FISH.map(f=>[f[0],f[2],f[3]])");const res={};
 for(const [nm,d,beh] of kinds){if(beh==='junk')continue;const r=res[nm]={d:+d.toFixed(2),beh,won:0,lost:0,snags:0,t:0};
   for(let k=0;k<3;k++){const c0=await ev("S.fishCaught||0");await ev(`fish.state='off';startMG(FISH.find(f=>f[0]==='${nm}'))`);let t=0;
     while(await ev("MG.on")&&t<45){await pg.waitForTimeout(250);t+=.25;}r.snags+=await ev("MG.snags||0");r.t+=t;
     const c1=await ev("S.fishCaught||0");if(c1>c0)r.won++;else r.lost++;await ev("toastQ&&(toastQ.length=0)").catch(()=>{});await pg.waitForTimeout(300);}
   r.t=+(r.t/3).toFixed(1);}
 console.log(JSON.stringify(await ev("__ph")));for(const [k,v] of Object.entries(res))console.log(k.padEnd(18),JSON.stringify(v));
 console.log('errs',JSON.stringify(errs.slice(0,4)));await b.close();})();
