const {chromium,devices}=require('playwright');
const mode=process.argv[2]||'pc';
(async()=>{const b=await chromium.launch();const pg=await b.newPage(mode==='phone'?{...devices['iPhone 13']}:{viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const scr=(x,z)=>ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(${x})*r.width/VW, r.top+sz(${z})*r.height/VH];})()`);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;S.energy=100;addInv('wood',50);addInv('stone',50);addInv('fiber',20);");
 await ev("const R=ROOMS.church;S.room='church';P.x=R.ox+(R.door||R.w/2);P.z=R.oz+R.d-1;P.dir='N';");await pg.waitForTimeout(700);
 const L=await ev("(()=>{const it=interact.find(e=>{try{return e.label()==='Ward ledger'}catch(_){return false}});return [it.x,it.z]})()");
 console.log('ward at',L,'old ledger present:',await ev("interact.some(e=>{try{return e.label()==='Ledger'&&e.on()}catch(_){return false}})"));
 for(const [dz,btn] of [[-1.0,'left'],[-.3,'right']]){
   await ev("$('note').hidden=true;S.paused=false;");await pg.waitForTimeout(200);
   const c=await scr(L[0],L[1]+dz);console.log('click',btn,'at',c.map(v=>Math.round(v)),'element',await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.id||e.tagName)},c));
   await pg.mouse.click(c[0],c[1],{button:btn});for(let i=0;i<30;i++){await pg.waitForTimeout(150);if(await ev("!$('note').hidden"))break;}
   console.log(' note open:',await ev("!$('note').hidden"),JSON.stringify(await ev("$('noteText').textContent.slice(0,60)")),'player',await ev("P.x.toFixed(1)+','+P.z.toFixed(1)"));
 }
 await pg.screenshot({path:'TW_note.png'});
 console.log('offer buttons',(await pg.$$('.wardb')).length);
 const btn=await pg.$('.wardb');
 if(btn){await btn.click();await pg.waitForTimeout(600);console.log('kept timber:',await ev("S.ward.timber"),'wood left',await ev("inv('wood')"),'coins',await ev('S.coins'));console.log(' note:',JSON.stringify(await ev("$('noteText').textContent.slice(0,60)")));}
 await pg.screenshot({path:'TW_done.png'});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
