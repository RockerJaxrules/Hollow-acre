const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const list=JSON.parse(await ev(`JSON.stringify((()=>{const L=[];for(const o of OBJ)if(o.stairs)L.push(['stairs_'+o.spr,o.x,o.z]);for(const d of (typeof PORCH_DECKS!=='undefined'?PORCH_DECKS:[]))L.push(['deck',(d.x0+d.x1)/2,d.z1]);
   const seen={};S.hour=12;for(const o of OBJ){if(o.kind!=='bld'||o.room||o.x>=250)continue;const m=SPR[o.spr];if(!m||!m.door_w)continue;const k=(m.steps||'wood')+(m.door_w>40?'w':'n');if(seen[k])continue;seen[k]=1;L.push(['bld_'+o.spr+'_'+k,o.x+(m.door_dx||0)/PPM*(o.flip?-1:1),o.z]);}return L;})())`));
 console.log(JSON.stringify(list));
 let i=0;for(const [nm,x,z] of list){i++;await ev(`(()=>{S.tut.off=true;S.hour=12;S.room=null;P.x=${x}+0.9;P.z=${z}+1.6;P.dir='N';return 1;})()`);await pg.waitForTimeout(1200);
   await pg.screenshot({path:`stp_${i}.png`,clip:{x:250,y:150,width:500,height:400}});
   await ev(`(()=>{P.x=${x};P.z=${z}+2.0;P.dir='N';return 1;})()`);await pg.waitForTimeout(250);
   const tr=[];await pg.keyboard.down('KeyW');for(let k=0;k<14;k++){await pg.waitForTimeout(90);tr.push(await ev(`[+P.z.toFixed(2),typeof porchLift==='function'?porchLift(P.x,P.z):0,S.room||'']`));}await pg.keyboard.up('KeyW');
   await pg.screenshot({path:`stp_${i}b.png`,clip:{x:250,y:150,width:500,height:400}});
   console.log(i,nm,JSON.stringify(tr.map(t=>t.join(':'))));
   await ev(`(()=>{if(S.room){try{leaveRoom();}catch(e){}}S.room=null;return 1;})()`);await pg.waitForTimeout(400);}
 console.log('errors',errs.length?errs.slice(0,3):'none');await b.close();})();
