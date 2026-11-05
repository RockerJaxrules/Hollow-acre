const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({...devices['iPhone 13']});
 await ctx.addInitScript(()=>{const friend={peer:'p2',by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,updatedAt:Date.now(),presence:{v:1,n:'Jo',x:2,z:-6,d:'W',c:'idle',r:'',day:3,lk:{style:'long',hair:'#c83a2a',outfit:'dress',shirt:'#3a5a8a'},s:'hi neighbour!',st:Date.now()}};
   const me={peer:'p1',by:null,isMe:true,sameTab:true,kind:'viewer',guest:false,updatedAt:Date.now(),presence:{}};
   const mk=()=>({onConnection(cb){setTimeout(()=>cb(true),10);return()=>{};},onPeers(cb){setTimeout(()=>cb({peers:[me,friend],joined:[me,friend],left:[],updated:[]}),20);return()=>{};},presence(p){window.__pres=p;return Promise.resolve();},emit(){return Promise.resolve();},on(){return()=>{};},peers(){return [me,friend];},connected(){return true;},join(n){window.__joined=n;return Promise.resolve(Object.assign(mk(),{name:n,leave(){return Promise.resolve();}}));}});
   window.claude={use:async n=>n==='room'?mk():null};});
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(400);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const scene=async()=>{for(let i=0;i<20;i++){const on=await ev("document.getElementById('scene').style.display==='flex'");if(!on)break;await pg.click('#scene');await pg.waitForTimeout(80);}};
 await ev("S.tut.off=false;for(const k of ['move','act','menu','drag','dusk'])S.tut.done[k]=1;S.foundCabin=true;S.readLetter=true;S.hour=8;P.x=0;P.z=-6");await pg.waitForTimeout(800);await pg.screenshot({path:'PR1.png'});await scene();await pg.waitForTimeout(400);
 console.log('lesson',await ev("S.ls.i+' '+$('lesson').textContent"));await pg.waitForTimeout(500);await pg.screenshot({path:'PR2.png'});
 const steps=["let n=0;for(const o of OBJ)if(o.debris&&!o.hide&&n<5){o.hide=true;n++;}",
  "fieldTiles().slice(0,6).forEach(t=>t.tilled=true)","fieldTiles().slice(0,6).forEach(t=>t.crop={type:'turnip',stage:0,growth:0,watered:false,pop:0})","fieldTiles().slice(0,6).forEach(t=>t.crop.watered=true)",
  "eat(5,0,'Bread')","S.day++","S.shipped+=3","openShop('mae');S.seeds.turnip+=3;renderShop()","addInv('wood',15);addInv('stone',15)","S.benches.farm=true","S.ls.ev.craft=1","S.fishCaught=(S.fishCaught||0)+1","S.ls.ev.cook=1",
  "for(const id of ['mae','hale','hollis','agnes','dunn'])S.lastTalk[id]=S.day;S.ls.ev.gifts=1","S.ls.ev.map=1;S.ls.ev.journal=1","S.mineDeep=3","addInv('copper_bar',1)","S.tools.pick=2"];
 for(const st of steps){const before=await ev("S.ls.i");await ev(st);await pg.waitForTimeout(250);await ev("document.getElementById('shop').hidden=true;S.paused=false");await pg.waitForTimeout(250);const after=await ev("S.ls.i");if(after===before)console.log('STUCK at',before,await ev("LESSONS[S.ls.i].id+' '+LESSONS[S.ls.i].goal(S.ls.base)"));}
 console.log('after steps lesson',await ev("S.ls.i+' '+(LESSONS[S.ls.i]||{}).id+' coins '+S.coins"));await pg.screenshot({path:'PR3.png'});
 // ward
 await ev("for(let i=0;i<10;i++)S.basket.push({kind:'turnip',value:6});for(let i=0;i<5;i++)S.basket.push({kind:'pumpkin',value:12});for(let i=0;i<4;i++)S.basket.push({kind:'corn',value:10});enterRoom('church')");await pg.waitForTimeout(900);
 await ev("P.x=ROOMS.church.ox+5;P.z=ROOMS.church.oz+3.4;P.fx=0;P.fz=-1;P.dir='N'");await pg.waitForTimeout(300);console.log('ledger btn',await pg.evaluate(()=>document.getElementById('btnAct').textContent));
 await pg.evaluate(()=>__game.act());await pg.waitForTimeout(400);await pg.screenshot({path:'PR4.png'});await pg.click('.wardb[data-w="field"]');await pg.waitForTimeout(500);console.log('ward',await ev("wardDone()+' lesson '+(LESSONS[S.ls.i]||{}).id"));await ev("document.getElementById('noteClose').click()");
 await ev("leaveRoom(1)");await pg.waitForTimeout(800);
 // guide hint
 await ev("S.q.hollis=1");await pg.waitForTimeout(1400);console.log('obj',await ev("$('objective').textContent"));
 // encounter
 await ev("S.enc={id:'mae_basket',day:S.day};S.hour=8;P.x=-9.8;P.z=-6.6;P.fx=-1;P.fz=0;P.dir='W'");await pg.waitForTimeout(600);await pg.screenshot({path:'PR5.png'});console.log('enc btn',await pg.evaluate(()=>document.getElementById('btnAct').textContent));
 const br=await ev("inv('bread')");await pg.evaluate(()=>__game.act());await pg.waitForTimeout(300);console.log('bread',br,'->',await ev("inv('bread')"),await ev("S.enc.done"));
 // request
 await ev("S.req={id:'abel',k:'wood',n:5,t:'i',coins:70,why:'x',due:S.day+3};addInv('wood',5)");const c0=await ev("S.coins");await ev("talk(npcById('abel'))");await pg.waitForTimeout(300);console.log('req',c0,'->',await ev("S.coins"),await ev("!!S.req"));await pg.screenshot({path:'PR6.png'});await ev("document.getElementById('talk').hidden=true;S.paused=false;talkingTo=null");
 // coop
 await ev("S.hour=10;P.x=0;P.z=-6");await pg.waitForTimeout(1500);console.log('peers',await ev("others().length+' status '+CO.status+' pres '+JSON.stringify(window.__pres||{}).slice(0,80)"));await pg.screenshot({path:'PR7.png'});
 await ev("openBag('coop')");await pg.waitForTimeout(400);await pg.screenshot({path:'PR8.png'});await pg.fill('#coIn','hello Jo');await pg.click('#coSend');await pg.waitForTimeout(200);console.log('said',await ev("(window.__pres||{}).s"));
 await pg.fill('#coCode','sams-farm');await pg.click('#coJoin');await pg.waitForTimeout(400);console.log('joined',await ev("window.__joined+' '+CO.code"));
 console.log(errs.slice(0,6).join('\n'));await b.close();})();
