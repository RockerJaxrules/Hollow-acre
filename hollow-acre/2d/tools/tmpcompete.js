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
 await A.click('.chip[data-k="play"][data-v="compete"]');await A.click('.chip[data-k="hands"][data-v="2"]');await A.waitForTimeout(200);await A.screenshot({path:OUT+'/mp_rules.png'});
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

 console.log('A world',JSON.stringify(await ev(A,"{play:S.world.play,money:S.world.money,contracts:S.world.mk&&S.world.mk.contracts.map(c=>c.who+':'+c.n+' '+c.k+' '+c.pay)}")));
 // both ship pumpkins: the guest first, so the host's sell lower
 await ev(B,"for(let i=0;i<6;i++)S.basket.push({kind:'pumpkin',value:18});shipPut('P','pumpkin',true)");await A.waitForTimeout(1500);
 await ev(A,"for(let i=0;i<6;i++)S.basket.push({kind:'pumpkin',value:18});shipPut('P','pumpkin',true)");await A.waitForTimeout(1500);
 const a0=await ev(A,"S.coins"),b0=await ev(B,"S.coins");await ev(A,"newDay()");await A.waitForTimeout(3500);
 console.log('night: A',a0,'->',await ev(A,"S.coins"),'B',b0,'->',await ev(B,"S.coins"));
 console.log('market',JSON.stringify(await ev(A,"{pumpkin:mkPct('pumpkin'),turnip:mkPct('turnip'),earn:S.world.mk.earn,rivals:S.world.mk.rivals.map(r=>r.id+':'+r.earn)}")));
 // a contract race: give both enough of the first contract's goods, the guest delivers first
 const c=await ev(A,"(()=>{const c=S.world.mk.contracts.find(q=>!q.taken);return c&&{id:c.id,k:c.k,n:c.n,pay:c.pay};})()");console.log('contract',JSON.stringify(c));
 const give=k=>["turnip","pumpkin","egg","fish","mushroom"].includes(k)?`for(let i=0;i<${c.n};i++)S.basket.push({kind:'${c.k}',value:5})`:`addInv('${c.k}',${c.n})`;
 await ev(A,give(c.k));await ev(B,give(c.k));await B.waitForTimeout(600);const bc=await ev(B,"S.coins");
 await ev(B,`mkDeliver(${c.id})`);await B.waitForTimeout(1200);await ev(A,`mkDeliver(${c.id})`);await A.waitForTimeout(600);
 console.log('after race: B coins',bc,'->',await ev(B,"S.coins"),'B has',await ev(B,`mkHave('${c.k}')`),'A has',await ev(A,`mkHave('${c.k}')`),'taken',await ev(A,`S.world.mk.contracts.find(q=>q.id===${c.id}).taken`));
 // a week later the Grange pays the top farm
 await ev(A,"S.day=8;S.world.mk.week=0");await ev(A,"newDay()");await A.waitForTimeout(3000);console.log('week:',await ev(A,"S.world.mk.last"));
 await A.bringToFront();await ev(A,"S.mode='play';S.paused=false;$('saleSlip')&&($('saleSlip').hidden=true);mkOpen()");await A.waitForTimeout(600);await A.screenshot({path:OUT+'/mk_board.png'});
 console.log(errs.slice(0,8).join('\n'));await b.close();})();
