// plays every v3 making game (recipes and builds) with crude inputs, checks each finishes, screenshots each step and the reveal
const {chromium}=require('playwright');
const only=process.argv[2]||'';
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:620}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;window.CG2_SPEED=2;");
 const keys=JSON.parse(await ev("JSON.stringify(Object.keys(CG3_RECIPES))")).filter(k=>!only||only.split(',').some(p=>k.startsWith(p)));
 const cv=await pg.$('#cgC');const out=[];
 for(const key of keys){
   await ev(`window.__q=null;window.CG2_NOW='';cg3Run(CG3_RECIPES['${key}'],'${key}',q=>{window.__q=q;});`);
   const alts=JSON.parse(await ev(`JSON.stringify(CG3_RECIPES['${key}'].steps.map(s=>!!s.alt))`));
   const bb=await cv.boundingBox();let shots=new Set(),t0=Date.now(),flip=0,seen={};
   while(Date.now()-t0<45000){const now=await ev('window.CG2_NOW||""');const q=await ev('window.__q');if(q!==null&&q!==undefined)break;
     const [m,ix]=now.split(':');if(now&&!seen[now])seen[now]=Date.now();
     if(now&&!shots.has(now)){await pg.waitForTimeout(now==='reveal'?700:420);shots.add(now);await pg.screenshot({path:`C3_${key.replace(':','_')}_${now.replace(':','')}.png`,clip:{x:bb.x,y:bb.y,width:bb.width,height:bb.height}});}
     const cx=bb.x+bb.width/2,cy=bb.y+bb.height/2;
     if(m==='rhythm'||m==='level'||(m==='mash'&&alts[+ix])){flip=1-flip;await pg.mouse.click(bb.x+bb.width*(flip?.25:.75),cy);await pg.waitForTimeout(m==='mash'?50:220);}
     else if(m==='heat'||m==='saw'||m==='trace'){await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.waitForTimeout(240);await pg.mouse.up();await pg.waitForTimeout(240);}
     else if(m==='fill'){await pg.mouse.move(cx,cy);await pg.mouse.down();await pg.waitForTimeout(1100);await pg.mouse.up();await pg.waitForTimeout(800);}
     else if(m==='mash'||m==='spin'){await pg.mouse.click(cx,cy);await pg.waitForTimeout(m==='spin'?180:50);}
     else if(m==='reveal'){await pg.waitForTimeout(150);}
     else{await pg.mouse.click(cx,cy);await pg.waitForTimeout(380);}}
   const q=await ev('window.__q');const line=key.padEnd(20)+' steps '+[...shots].join(' ')+' | quality '+(q===null?'DID NOT FINISH':(+q).toFixed(2));console.log(line);out.push(line);
   await pg.waitForTimeout(300);await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);S.paused=false;");}
 console.log(errs.slice(0,8).join('\n')||'no errors');await b.close();})();
