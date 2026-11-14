// fishing, second pass: hold-to-cast (keys and pointer), float flight, bite, the catch gauge, the catch card, species items
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:620}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message+' '+(e.stack||'').split('\n')[1]));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const shot=n=>pg.screenshot({path:`TF2_${n}.png`});
 await ev("S.tut.off=true;S.hour=10;S.energy=999;S.room=null;");
 // the icons
 await ev(`(()=>{const w=document.createElement('div');w.id='icw';w.style.cssText='position:fixed;left:0;top:0;z-index:99999;background:#d8c49a;display:flex;flex-wrap:wrap;gap:6px;padding:6px;width:560px';for(const sp in FISH_LOOK){const c=document.createElement('canvas');c.width=128;c.height=128;c.style.cssText='width:128px;height:128px;image-rendering:pixelated';const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(fishIconCanvas(sp),0,0,128,128);w.appendChild(c);}document.body.appendChild(w);})()`);
 await pg.waitForTimeout(200);await pg.screenshot({path:'TF2_icons.png',clip:{x:0,y:0,width:560,height:420}});await ev("$('icw').remove()");
 // stand at the pond facing the water with the rod in hand
 const spot=await ev(`(()=>{for(let r=0;r<12;r+=.5)for(let a=0;a<6.28;a+=.4){const x=pond.x+Math.cos(a)*(pond.r+1+r*.2),z=pond.z+Math.sin(a)*(pond.r+1+r*.2);if(waterAt(x,z))continue;for(const [fx,fz,d] of [[0,1,'S'],[0,-1,'N'],[1,0,'E'],[-1,0,'W']]){P.x=x;P.z=z;P.fx=fx;P.fz=fz;P.dir=d;if(waterAhead()&&!collide(x,z))return [x,z,d];}}return null;})()`).catch(e=>'ERR '+e.message);
 console.log('spot',JSON.stringify(spot));
 await ev("{syncSlots();const i=S.slots.indexOf('T:rod');slotUse(i);}");await pg.waitForTimeout(300);console.log('held',await ev('heldKind()'));
 // keyboard: hold Space to wind up, let go to cast
 await pg.keyboard.down('Space');await pg.waitForTimeout(150);console.log('after press',await ev('fish.state'));await pg.waitForTimeout(500);await shot('1_windup');
 await pg.keyboard.up('Space');await pg.waitForTimeout(60);console.log('after release',await ev('fish.state+" power "+fish.cast.toFixed(2)'));
 await pg.waitForTimeout(200);await shot('2_flight');await pg.waitForTimeout(900);await shot('3_float');
 await ev("fish.t=.01");await pg.waitForTimeout(250);console.log('bite?',await ev('fish.state'));await shot('4_bite');
 await pg.keyboard.press('Space');await pg.waitForTimeout(900);console.log('mg on',await ev('MG.on+" sp "+MG.sp'));
 await ev("MG.tr={at:0,y:.5,vy:0,prog:.6,got:false,pop:0};MG.prog=.6");await pg.keyboard.down('Space');await pg.waitForTimeout(500);await shot('5_gauge');await pg.keyboard.up('Space');
 await ev("MG.tr.got=true;MG.tr.pop=0;MG.prog=.995;MG.zone=Math.max(0,MG.fy-.1)");await pg.waitForTimeout(500);console.log('after catch',await ev('MG.on+" "+fish.state'));await shot('6_card');
 console.log('basket',await ev("JSON.stringify(S.basket.slice(-2))"),'| keys',await ev("allItemKeys().filter(k=>k.startsWith('P:')).join(',')"));
 console.log('info',await ev("(()=>{const k=allItemKeys().find(k=>k.startsWith('P:fish~'));const it=itemInfo(k);return it.name+' x'+it.qty+' | '+it.desc;})()"));
 console.log('count fish',await ev("basketCount('fish')"),'sellables',await ev("JSON.stringify(sellables().filter(s=>s.t==='P'))"));
 await pg.waitForTimeout(1500);
 // pointer: press on yourself at the water, hold, let go
 const pos=await ev(`(()=>{const r=view.getBoundingClientRect();const X=P.x*PPM-cam.px+(VW>>1),Y=P.z*PPM-cam.pz+Math.round(VH*.56);return [r.left+X*r.width/VW,r.top+(Y-10)*r.height/VH];})()`);console.log('player at',JSON.stringify(pos));
 await pg.mouse.move(pos[0],pos[1]);await pg.mouse.down();await pg.waitForTimeout(120);console.log('pointer press',await ev('fish.state'));await pg.waitForTimeout(600);await pg.mouse.up();await pg.waitForTimeout(80);console.log('pointer release',await ev('fish.state'));
 // tap twice still works
 await pg.waitForTimeout(400);await pg.keyboard.press('Space');await pg.waitForTimeout(300);console.log('reel early ->',await ev('fish.state'));
 await pg.waitForTimeout(500);await pg.keyboard.press('Space');await pg.waitForTimeout(150);console.log('tap1',await ev('fish.state'));await pg.waitForTimeout(400);await pg.keyboard.press('Space');await pg.waitForTimeout(150);console.log('tap2',await ev('fish.state'));
 // ship one and take it back
 console.log('ship',await ev("(()=>{const k=sellables().find(s=>s.id.startsWith('fish~')).id;shipPut('P',k,false);const a=S.ship.slice(-1)[0].id;shipTake('P',k,false);return a+' back:'+JSON.stringify(S.basket.slice(-1));})()"));
 console.log(errs.slice(0,8).join('\n')||'no errors');await b.close();})();
