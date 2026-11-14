const {chromium,devices}=require('playwright');
const mode=process.argv[2]||'phone';
(async()=>{const b=await chromium.launch();const pg=await b.newPage(mode==='phone'?{...devices['iPhone 13']}:{viewport:{width:1920,height:1080}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100;S.energyMax=100;P.x=0;P.z=-2;S.water=5");await pg.waitForTimeout(500);
 const tgt=async(x,y)=>ev(`(()=>{const [wx,wz]=screenToWorld(${x},${y});const T=tapTarget(wx,wz);return T?(T.kind+' '+(T.it?T.it.label():'')+' need '+(T.it?toolNeed(T.it):'')):'none';})()`);
 const tapW=async(wx,wz,right)=>{const c=await scr(wx,wz);await tap(c[0],c[1],right);};
 const tap=async(x,y,right)=>{if(process.env.V)console.log('   tap ->',await tgt(x,y),'clear',await pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&(e.id||e.tagName);},[x,y]));if(mode==='phone')await pg.touchscreen.tap(x,y);else await pg.mouse.click(x,y,{button:right?'right':'left'});};
 const scr=async(wx,wz)=>ev(`(()=>{const r=view.getBoundingClientRect();return [r.left+sx(${wx})*r.width/VW, r.top+sz(${wz})*r.height/VH];})()`);
 const pick=async k=>{const i=await ev(`slotOf('${k}')`);await pg.locator('#hotbar .slot').nth(i).dispatchEvent('pointerdown');await pg.waitForTimeout(150);return ev('heldKind()');};
 const waitIdle=async(ms)=>{await pg.waitForTimeout(ms||300);for(let i=0;i<40;i++){if(await ev('!TAP.auto&&!P.anim'))break;await pg.waitForTimeout(150);}await pg.waitForTimeout(200);};
 // a square that's on screen and not under a button
 const free=async(pred)=>ev(`(()=>{const r=view.getBoundingClientRect();for(const t of tiles){if(!(${pred}))continue;const x=r.left+sx(t.x)*r.width/VW,y=r.top+sz(t.z)*r.height/VH;if(x<40||y<140||x>innerWidth-40||y>innerHeight-170)continue;const e=document.elementFromPoint(x,y);if(e&&(e===view||e.id==='c'))return [t.x,t.z,tiles.indexOf(t)];}return null;})()`);
 const clear=async(c)=>pg.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return !!e&&(e.id==='view'||e.id==='c'||e.tagName==='CANVAS');},c);
 const toastTxt=()=>ev("document.getElementById('toast').textContent");
 console.log(mode,'btnAct visible',await ev("getComputedStyle($('btnAct')).display"),'btnUse',await ev("getComputedStyle($('btnUse')).display"));
 // 1 till a far tile with the hoe
 console.log('held',await pick('hoe'));
 const t=await free("!t.gh&&!t.tilled&&!t.crop&&!(t.debris&&!t.debris.hide)&&Math.hypot(t.x-P.x,t.z-P.z)>2.5");console.log('tile',t);
 let c=await scr(t[0],t[1]);await tap(c[0],c[1]);await waitIdle(400);console.log('1 till far:',await ev(`tiles[${t[2]}].tilled`));
 // 2 seeds on it
 console.log('held',await pick('seed'));c=await scr(t[0],t[1]);await tap(c[0],c[1]);await waitIdle();console.log('2 plant:',await ev(`JSON.stringify(tiles[${t[2]}].crop&&tiles[${t[2]}].crop.type)`));
 // 3 water it
 console.log('held',await pick('can'));const w0=await ev('S.water');c=await scr(t[0],t[1]);await tap(c[0],c[1]);await waitIdle();console.log('3 water:',await ev(`tiles[${t[2]}].crop.watered`),'water',w0,'->',await ev('S.water'));
 // 4 till a neighbour, water the bare soil, then plant: starts watered
 const t2=await free(`!t.gh&&!t.tilled&&!t.crop&&!(t.debris&&!t.debris.hide)&&Math.abs(t.i-tiles[${t[2]}].i)+Math.abs(t.j-tiles[${t[2]}].j)<=2&&t!==tiles[${t[2]}]`);console.log('t2',t2);
 if(t2){await pick('hoe');await tapW(t2[0],t2[1]);await waitIdle();await pick('can');await tapW(t2[0],t2[1]);await waitIdle();const wet=await ev(`tiles[${t2[2]}].wet`);await pick('seed');await tapW(t2[0],t2[1]);await waitIdle(500);
   console.log('4 wet soil:',wet,'planted watered:',await ev(`!!(tiles[${t2[2]}].crop&&tiles[${t2[2]}].crop.watered)`));}
 // 5 a rock while holding the axe: refused with a hint, then the pickaxe breaks it
 const r=await ev("(()=>{const q=interact.find(q=>(!q.on||q.on())&&q.label()==='Break');return q?[q.x,q.z,interact.indexOf(q)]:null;})()");
 if(r){await ev(`P.x=${r[0]}-2.2;P.z=${r[1]};`);await pg.waitForTimeout(400);await pick('axe');c=await scr(r[0],r[1]-.15);console.log('rock clear',await clear(c));await tap(c[0],c[1]);await waitIdle();console.log('5a axe on rock ->',JSON.stringify(await toastTxt()),'still there',await ev(`interact[${r[2]}].on()`));
   await pick('pick');await tapW(r[0],r[1]-.15);await waitIdle();await pg.waitForTimeout(300);if(await ev(`interact[${r[2]}].on()`)){await tapW(r[0],r[1]-.15);await waitIdle();}console.log('5b pick on rock: gone',!(await ev(`interact[${r[2]}].on()`)));}
 // 6 the hoe on a tree: hint
 const tr=await ev("(()=>{const q=interact.find(q=>(!q.on||q.on())&&q.label()==='Chop'&&!q.x.toString().includes('NaN'));return q?[q.x,q.z]:null;})()");
 if(tr){await ev(`P.x=${tr[0]}-2.5;P.z=${tr[1]}+.6;`);await pg.waitForTimeout(400);await pick('hoe');c=await scr(tr[0],tr[1]-.3);await tap(c[0],c[1]);await waitIdle();console.log('6 hoe on tree ->',JSON.stringify(await toastTxt()));}
 // 7 talk to someone by tapping / right-clicking them
 await ev("(()=>{const n=npcs.find(n=>n.vis);n.x=P.x+2.5;n.z=P.z;window.__n=n;})()");await pg.waitForTimeout(300);
 const n=await ev("[__n.x,__n.z]");c=await scr(n[0],n[1]-.4);await tap(c[0],c[1],true);await waitIdle(600);console.log('7 talk open:',await ev("!$('talk').hidden"),await ev("$('talkLine').textContent.slice(0,50)"));
 await ev("$('talkClose')&&$('talkClose').click()");await pg.waitForTimeout(300);
 // 8 keyboard (pc): face a fresh tile and press Space with the hoe
 if(mode!=='phone'){const t3=await ev("(()=>{const t=tiles.find(t=>!t.gh&&!t.tilled&&!t.crop&&!(t.debris&&!t.debris.hide)&&!interact.some(q=>(!q.on||q.on())&&Math.hypot(q.x-t.x,q.z-t.z)<1.2));P.x=t.x;P.z=t.z-1;P.fx=0;P.fz=1;P.dir='S';return tiles.indexOf(t);})()");
   await pg.keyboard.press('Digit'+(1+await ev("slotOf('hoe')")));await pg.waitForTimeout(150);await pg.keyboard.press('Space');await waitIdle();console.log('8 space tills:',await ev(`tiles[${t3}].tilled`));
   // 9 X at the well refills
   await ev("S.water=0;P.x=wellPos.x;P.z=wellPos.z+1.3;P.fx=0;P.fz=-1;P.dir='N'");await pg.waitForTimeout(200);await pg.keyboard.press('KeyX');await pg.waitForTimeout(300);console.log('9 X at well water:',await ev('S.water'));
   await ev(`P.x=tiles[${t3}].x;P.z=tiles[${t3}].z-1.2;`);await pg.waitForTimeout(500);
   // 10 hover square shows under the mouse with the hoe
   const c4=await scr(await ev(`tiles[${t3}].x+1`),await ev(`tiles[${t3}].z`));await pg.mouse.move(c4[0],c4[1]);await pg.waitForTimeout(300);await pg.screenshot({path:'TT_hover.png',clip:{x:c4[0]-200,y:c4[1]-150,width:400,height:300}});console.log('10 hover tile:',await ev(`!!hlTile&&Math.abs(hlTile.x-tiles[${t3}].x-1)<.1`),await ev('TAP.hlCol'));}
 // 11 fishing: rod, tap the pond
 await ev("P.x=pond.x;P.z=pond.z-pond.r-1.6;P.fx=0;P.fz=1");await pg.waitForTimeout(500);await pg.waitForTimeout(300);await pick('rod');
 const wp=await ev("(()=>{for(let d=0;d<8;d+=.25){const z=P.z+d;if(waterAt(P.x,z)){P.z=z-3.2;return [P.x,z+.8];}}return null;})()");if(mode!=='phone')await ev("P.z+=1.4");await pg.waitForTimeout(500);console.log('pond',await ev("[pond.x,pond.z,pond.r,P.x,P.z]"),'wp',wp);
 if(wp){await tapW(wp[0],wp[1]);await waitIdle(800);console.log('11 rod on pond: fish.state',await ev('fish.state'),'P',await ev("P.x.toFixed(1)+','+P.z.toFixed(1)"));await tapW(wp[0],wp[1]);await pg.waitForTimeout(300);console.log('   tap again:',await ev('fish.state'));}
 await pg.screenshot({path:`TT_${mode}.png`});
 console.log(errs.join('\n')||'no errors');await b.close();})();
