// plays every recipe's minigame with crude inputs (presses, holds, alternating sides) to check each one finishes, and screenshots every step
const {chromium}=require('playwright');
const only=process.argv[2]||'';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:620}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;window.CG2_SPEED=2.5;");
 const keys=(await ev("Object.keys(CG2_STEPS).join(',')")).split(',').filter(k=>!only||k.startsWith(only));
 const cv=await pg.$('#cgC');
 for(const key of keys){const [v,k]=key.split(':');
   await ev(`window.__q=null;CR.v='${v}';const r=vendors['${v}'].rows().find(r=>r.k==='${k}')||{k:'${k}',name:'${k}'};craftGame(CRAFT_GAME('${v}'),r,q=>{window.__q=q;});`);
   const bb=await cv.boundingBox();let shots=new Set(),t0=Date.now(),flip=0;
   while(Date.now()-t0<30000){const now=await ev('window.CG2_NOW||""');const q=await ev('window.__q');if(q!==null&&q!==undefined)break;
     const m=now.split(':')[0];if(now&&!shots.has(now)){await pg.waitForTimeout(500);shots.add(now);await pg.screenshot({path:`CG_${key.replace(':','_')}_${now.replace(':','')}.png`,clip:{x:bb.x-20,y:bb.y-70,width:bb.width+40,height:bb.height+110}});}
     if(m==='rhythm'){flip=1-flip;await pg.mouse.click(bb.x+bb.width*(flip?.25:.75),bb.y+bb.height/2);await pg.waitForTimeout(240);}
     else if(m==='heat'||m==='saw'||m==='trace'){await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.waitForTimeout(260);await pg.mouse.up();await pg.waitForTimeout(260);}
     else if(m==='pour'){await pg.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2);await pg.mouse.down();await pg.waitForTimeout(900);await pg.mouse.up();await pg.waitForTimeout(600);}
     else if(m==='mash'){await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(60);}
     else{await pg.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await pg.waitForTimeout(350);}}
   const q=await ev('window.__q');console.log(key.padEnd(18),'steps',[...shots].join(' '),'| quality',q===null?'DID NOT FINISH':(+q).toFixed(2));
   await pg.waitForTimeout(300);await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);S.paused=false;");}
 console.log(errs.slice(0,6).join('\n')||'no errors');await b.close();})();
