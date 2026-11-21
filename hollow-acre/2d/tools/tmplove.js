// multiplayer worlds: host makes a world for friends from the title screen, a farmhand joins, gets a cabin, separate wallets
const {chromium}=require('playwright');const fs=require('fs');
const src=fs.readFileSync('/home/user/Minecraftbot/hollow-acre/2d/tools/thost.js','utf8');const mock=eval('('+src.slice(src.indexOf('const mock=')+11,src.indexOf('};};')+3)+')');
const OUT=process.argv[2]||'.';
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:960,height:540}});await ctx.addInitScript(mock);
 const open=async(name)=>{const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(name+' ERR '+e.message));await pg.route('**/version.json*',r=>r.fulfill({body:'{}'}));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
   await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr')||!document.getElementById('loadScr').offsetParent,null,{timeout:90000});await pg.waitForTimeout(600);return pg;};
 const ev=(pg,c)=>pg.evaluate(c=>{try{return __game.ev(c);}catch(e){return 'ERR '+e.message;}},c);
 const A=await open('host');await A.evaluate(()=>localStorage.clear());
 // title -> Play with friends -> Make a world -> rules -> Next -> creator -> Drive
 await A.click('#mpBtn');await A.waitForTimeout(300);await A.screenshot({path:OUT+'/mp_pick.png'});await A.click('#mpHost');await A.waitForTimeout(300);
 await A.click('.chip[data-k="money"][data-v="split"]');await A.click('.chip[data-k="hands"][data-v="2"]');await A.waitForTimeout(200);await A.screenshot({path:OUT+'/mp_rules.png'});
 await A.click('#mpGo');await A.waitForTimeout(500);console.log('creator open',await A.evaluate(()=>!document.getElementById('creator').hidden));
 await A.fill('#cName','Sam');await A.click('#cGo');await A.waitForTimeout(400);await A.evaluate(()=>__game.skip());await A.waitForTimeout(800);
 await ev(A,"S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=9;S.coins=100");await A.waitForTimeout(5500);
 console.log('A world',JSON.stringify(await ev(A,"S.world")),'role',await ev(A,"HOST.role+' '+HOST.code"));
 console.log('cabins placed',await ev(A,"OBJ.filter(o=>o.fhcab!==undefined).map(o=>o.spr+'@'+o.x+','+o.z).join(' ')"));
 const code=await ev(A,"HOST.code");
 await A.evaluate(()=>{const L=JSON.parse(localStorage.getItem('hollowLook')||'{}');localStorage.setItem('hollowAccounts',JSON.stringify([{id:'default',name:'Player 1',created:1},{id:'jo',name:'Jo',created:2}]));localStorage.setItem('hollowProfile','jo');localStorage.setItem('hollowLook@jo',JSON.stringify(Object.assign({},L,{name:'Jo',hair:'#c8a050',style:'long'})));});
 const B=await open('guest');await B.click('#mpBtn');await B.waitForTimeout(200);await B.click('#mpJoin');await B.waitForTimeout(200);await B.fill('#mpCode',code);await B.click('#mpGo');
 await B.waitForTimeout(3000);await B.waitForFunction(()=>!document.getElementById('loadScr')||!document.getElementById('loadScr').offsetParent,null,{timeout:90000});await B.waitForTimeout(800);
 console.log('B title',await B.evaluate(()=>[...document.querySelectorAll('#title button')].filter(b=>b.offsetParent).map(b=>b.textContent).join(' | ')));
 await B.evaluate(()=>{const e=document.getElementById('cName');});
 await B.evaluate(()=>{localStorage.setItem('hollowLook',JSON.stringify(Object.assign({},JSON.parse(localStorage.getItem('hollowLook')||'{}'),{name:'Jo'})));});
 await B.evaluate(()=>{__game.S.look.name='Jo';[...document.querySelectorAll('#title button')].find(b=>/Join farm/.test(b.textContent)).click();});await B.waitForTimeout(4500);
 console.log('B joined',await ev(B,"HOST.role+' joined '+HOST.joined+' coins '+S.coins+' slot '+mySlot()+' P '+P.x.toFixed(1)+','+P.z.toFixed(1)+' room '+S.room"));
 console.log('B world slots',JSON.stringify(await ev(B,"S.world&&S.world.slots")),'A slots',JSON.stringify(await ev(A,"S.world.slots")));
 console.log('B cabins',await ev(B,"OBJ.filter(o=>o.fhcab!==undefined).length"));

 // Sam has a ring and walks up to Jo; the Together tab offers Propose
 await ev(A,"addInv('ring',1)");const bp=await ev(B,"[P.x,P.z,S.room||'']");await ev(A,`S.room=null;__game.tp(${bp[0]+1.2},${bp[1]})`);await A.waitForTimeout(1500);
 await ev(A,"openBag('coop')");await A.waitForTimeout(500);await A.bringToFront();await A.screenshot({path:OUT+'/ml_tab.png'});
 console.log('propose button',await A.evaluate(()=>!!document.querySelector('button[data-ml]')));
 await A.click('button[data-ml]');await A.waitForTimeout(1500);
 await B.bringToFront();await B.screenshot({path:OUT+'/ml_ask.png'});console.log('B sees the question',await B.evaluate(()=>!!document.getElementById('mlYes')));
 await B.click('#mlYes');await B.waitForTimeout(1500);
 console.log('couples A',JSON.stringify(await ev(A,"S.world.couples")),'ring left on A',await ev(A,"inv('ring')"),'B sees',JSON.stringify(await ev(B,"S.world.couples")));
 // the wedding morning
 const wed=await ev(A,"S.world.couples[0].wed");await ev(A,`S.day=${wed};S.hour=10.2`);await A.waitForTimeout(2500);
 console.log('married',JSON.stringify(await ev(A,"[S.world.couples[0].married,S.world.homes,S.world.slots]")),'B note',await B.evaluate(()=>!document.getElementById('note').hidden&&document.getElementById('noteText').textContent.slice(0,60)));
 await B.bringToFront();await B.screenshot({path:OUT+'/ml_wed.png'});
 await ev(B,"$('note').hidden=true;S.paused=false");await ev(A,"newDay()");await A.waitForTimeout(3500);
 console.log('next morning B wakes in',await ev(B,"S.room+' home '+homeOf(NAME())"),'cabin label',await ev(A,"fhOwner(0)||'(empty)'"));
 console.log(errs.slice(0,8).join('\n'));await b.close();})();
