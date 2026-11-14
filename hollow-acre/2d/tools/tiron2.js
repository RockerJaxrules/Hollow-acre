const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=10;S.room=null;S.energy=999;S.energyMax=999;");
 // quarry: tap an iron vein with the starting pick, through the same path a player's tap takes
 console.log('pick tier', await ev("S.tools.pick"));
 const q=await ev("(()=>{const q=QROCKS.find(q=>q.kind==='iron'&&!q.o.hide);if(!q)return 'no iron in quarry';P.x=q.o.x;P.z=q.o.z+1.0;faceAt(q.o.x,q.o.z);const i=S.slots.findIndex(k=>k&&k==='T:pick');S.sel_slot=i;return 'iron at '+q.o.x.toFixed(1)+','+q.o.z.toFixed(1)+' slot '+i+' held '+heldKind();})()");console.log(q);
 // select the pick slot properly
 console.log(await ev("(()=>{for(let i=0;i<12;i++){const it=itemInfo(S.slots[i]);if(it&&it.type==='T'&&it.id==='pick'){S.slotSel=i;}}return heldKind();})()"));
 for(let k=0;k<9;k++){const r=await ev("(()=>{const q=QROCKS.find(q=>q.kind==='iron'&&Math.hypot(q.o.x-P.x,q.o.z-P.z)<1.5);const T=tapTarget(q.o.x,q.o.z);const ok=useOn(T,'tool');return (T?T.kind:'none')+' ok='+ok+' hits='+q.hits+' hide='+q.o.hide+' iron='+inv('iron');})()");console.log(k,r);await pg.waitForTimeout(800);}
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
