const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=10;S.energy=999;S.energyMax=999;");
 await ev("(()=>{for(let i=0;i<12;i++){const it=itemInfo(S.slots[i]);if(it&&it.type==='T'&&it.id==='pick')S.slotSel=i;}})()");
 // into the mine, floor 6, find an iron ore
 await ev("S.room='mine';P.x=ROOMS.mine.ox+3;P.z=ROOMS.mine.oz+3;mineFloor(6);");await pg.waitForTimeout(400);
 // capture every toast
 await ev("window.__toasts=[];const _t=toast;toast=function(m){window.__toasts.push(String(m));return _t.apply(this,arguments);};");
 const info=await ev("(()=>{let o=MINE.ores.find(q=>q.ore==='iron'&&!q.hide);if(!o){o=MINE.ores.find(q=>!q.hide);o.ore='iron';}P.x=o.x;P.z=o.z+.7;faceAt(o.x,o.z);return 'iron at '+o.x.toFixed(1)+','+o.z.toFixed(1)+' held '+heldKind();})()");console.log(info);
 for(let k=0;k<6;k++){const r=await ev("(()=>{const o=MINE.ores.find(q=>q.ore==='iron'&&Math.hypot(q.x-P.x,q.z-P.z)<1.5);const T=tapTarget(o.x,o.z);const ok=useOn(T,'tool');return (T?T.kind:'none')+' ok='+ok+' hits='+o.hits+' hide='+o.hide+' iron='+inv('iron');})()");console.log(k,r);await pg.waitForTimeout(800);}
 // and by the action button (interactFront / useFront)
 console.log('toasts:',await ev("window.__toasts.join(' | ')"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
