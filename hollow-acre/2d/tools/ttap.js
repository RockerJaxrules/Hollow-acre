const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
 const run=async(dev,tag)=>{const pg=await b.newPage(dev);pg.on('pageerror',e=>errs.push(tag+' ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
  await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
  await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(500);
  const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100;P.x=0;P.z=-2;P.fx=0;P.fz=1;P.dir='S';S.slotSel=0");await pg.waitForTimeout(500);
  const client=async(wx,wz)=>pg.evaluate(([wx,wz])=>__game.ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(${wx})*r.width/VW, r.top+sz(${wz})*r.height/VH];})()`),[wx,wz]);
  const tap=async(x,y)=>{if(dev.hasTouch)await pg.touchscreen.tap(x,y);else await pg.mouse.click(x,y);};
  // a starter-patch square a few steps away
  await ev("P.x=0;P.z=0.5");await pg.waitForTimeout(400);
  const t=await ev("(()=>{const r=view.getBoundingClientRect();const ok=t=>{const cx=sx(t.x)*r.width/VW,cy=sz(t.z)*r.height/VH;return cx>r.width*.2&&cx<r.width*.8&&cy>r.height*.3&&cy<r.height*.62;};const t=tiles.find(t=>!t.gh&&!t.tilled&&!t.debris&&Math.hypot(t.x-P.x,t.z-P.z)>2.5&&ok(t))||tiles.find(t=>!t.gh&&!t.tilled&&!t.debris&&ok(t));return [t.x,t.z,tiles.indexOf(t)];})()");
  const [cx,cy]=await client(t[0],t[1]);await ev('S.slotSel=0');await tap(cx,cy);await pg.waitForTimeout(3500);console.log(tag,'tap far square -> tilled',await ev(`tiles[${t[2]}].tilled+' player '+P.x.toFixed(1)+','+P.z.toFixed(1)`));
  // a tree on the farm edge
  await ev("P.anim=null;P.x=-9;P.z=-10;S.energy=100");await pg.waitForTimeout(500);
  const tr=await ev("(()=>{const r=view.getBoundingClientRect();const ok=o=>{const cx=sx(o.x)*r.width/VW,cy=sz(o.z)*r.height/VH;return cx>r.width*.2&&cx<r.width*.8&&cy>r.height*.3&&cy<r.height*.62;};const o=OBJ.filter(o=>o.choppable&&!o.hide&&ok(o)).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];window.__tr=o;return [o.x,o.z-.3];})()");
  const [tx,ty]=await client(tr[0],tr[1]);await tap(tx,ty);await pg.waitForTimeout(4000);console.log(tag,'tap tree -> hits',await ev("(__tr.hits||0)+' anim '+(P.anim?P.anim.clip||'yes':'none')"));
  // placement
  await ev("P.anim=null;P.x=6;P.z=-4;addInv('wood',40);startPlace({spr:'bench_farm',w:2,d:1,name:'farming bench',refund:{},done(x,z){window.__placed=[x,z];}})");await pg.waitForTimeout(300);
  const [px,py]=await client(9,-6);await tap(px,py);await pg.waitForTimeout(300);console.log(tag,'tap moves ghost to',await ev("PLACE.x+','+PLACE.z"));
  await pg.waitForTimeout(700);const [qx,qy]=await client(9,-6);const [rx,ry]=await client(12,-8);
  if(dev.hasTouch){const c=await pg.context().newCDPSession(pg);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:qx,y:qy}]});for(let i=1;i<=8;i++){await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:qx+(rx-qx)*i/8,y:qy+(ry-qy)*i/8}]});await pg.waitForTimeout(30);}await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{await pg.mouse.move(qx,qy);await pg.mouse.down();await pg.mouse.move(rx,ry,{steps:8});await pg.mouse.up();}
  await pg.waitForTimeout(300);console.log(tag,'drag moves ghost to',await ev("PLACE.x+','+PLACE.z+' player stayed '+P.x.toFixed(1)+','+P.z.toFixed(1)"));await pg.screenshot({path:tag+'_place.png'});
  await pg.click('#placeOk');await pg.waitForTimeout(300);console.log(tag,'placed',await ev("JSON.stringify(window.__placed||null)+' on '+PLACE.on"));
  await pg.close();};
 await run({...devices['iPhone 13']},'phone');await run({viewport:{width:1280,height:800}},'pc');
 console.log(errs.slice(0,4).join('\n'));await b.close();})();
