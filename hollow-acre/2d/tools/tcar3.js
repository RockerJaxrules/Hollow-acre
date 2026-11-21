const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1280,height:800}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const scr=(x,z)=>ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(${x})*r.width/VW, r.top+sz(${z})*r.height/VH];})()`);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=11;S.energy=100;");
 console.log('before fixing: wreck wall up?',await ev("rects.some(r=>Math.abs(r.x0-(carPos.x-1.8))<1e-6&&Math.abs(r.z1-(carPos.z+3.1))<1e-6)"),'car interact at',await ev("(()=>{const it=interact.find(q=>/Car|Install|Drive/.test(q.label()));return it.x.toFixed(1)+','+it.z.toFixed(1)})()"));
 await ev("S.carFixed=true;S.looped=false;");await pg.waitForTimeout(900);
 const C=await ev("[CAR_SPOTS.crash.x,CAR_SPOTS.crash.z]");
 console.log('fixed: car drawn at',C,'drive interact at',await ev("(()=>{const it=interact.find(q=>{try{return q.label()==='Drive away'}catch(e){return false}});return it?it.x.toFixed(1)+','+it.z.toFixed(1)+' r'+it.r:'none'})()"),
   'wreck wall up?',await ev("rects.some(r=>Math.abs(r.x0-(carPos.x-1.8))<1e-6&&Math.abs(r.z1-(carPos.z+3.1))<1e-6)"),'car box',await ev("JSON.stringify(BEATEN.rect)"));
 const walk=async(from,key,ms,shot)=>{await ev(`P.x=${from[0]};P.z=${from[1]};P.anim=null;TAP.auto=null;`);await pg.waitForTimeout(250);await pg.keyboard.down(key);await pg.waitForTimeout(ms);await pg.keyboard.up(key);await pg.waitForTimeout(200);
   const p=await ev("[+P.x.toFixed(2),+P.z.toFixed(2)]");if(shot)await pg.screenshot({path:shot,clip:{x:340,y:140,width:600,height:460}});return p;};
 console.log('walk north from the road side, stopped at z',(await walk([C[0],C[1]+3],'w',1500,'TC_south.png'))[1],'(car front edge',(C[1]+.6).toFixed(2)+')');
 console.log('walk south from behind, stopped at z',(await walk([C[0]+.5,C[1]-3.5],'s',1500,'TC_north.png'))[1],'(car back edge',(C[1]-1.05).toFixed(2)+')');
 console.log('walk west from the east end, stopped at x',(await walk([C[0]+4.5,C[1]-.2],'a',1500,'TC_side.png'))[0],'(car end',(C[0]+2.3).toFixed(2)+')');
 console.log('walk through the old wreck spot: from',[-61,4],'north to z',(await walk([-61.6,4],'w',2200))[1],'(old wall ended at',(-1.4-1.2).toFixed(1)+')');
 // click the car's roof to drive
 await ev(`P.x=${C[0]}+.4;P.z=${C[1]}+2.2;P.dir='N';S.hour=17.4;`);await pg.waitForTimeout(300);const c=await scr(C[0],C[1]-1.6);
 console.log('clicking the roof hits:',await ev(`(()=>{const [wx,wz]=screenToWorld(${c[0]},${c[1]});const T=tapTarget(wx,wz);return T?T.kind+' '+(T.it?T.it.label():''):'none'})()`));
 await pg.mouse.click(c[0],c[1],{button:'right'});await pg.waitForTimeout(1500);
 console.log('after click: escape scene running?',await ev("!!(cine&&cine.escape)"),'toast',await ev("$('toast').textContent"));
 for(const [ms,n] of [[300,'TC_p1.png'],[700,'TC_p2.png']]){await pg.waitForTimeout(ms);await pg.screenshot({path:n});}
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
