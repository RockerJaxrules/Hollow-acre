const {chromium,devices}=require('playwright');
const mock=()=>{const me=Math.random().toString(36).slice(2,8);
  const mkRoom=name=>{const bc=new BroadcastChannel('cr-'+name);const peers=new Map();let mine={};const pcb=[],ccb=[];const ev={};const self={peer:me,by:null,isMe:true,sameTab:true,kind:'viewer',guest:false};
    const snap=()=>[Object.freeze(Object.assign({},self,{presence:mine,updatedAt:Date.now()})),...peers.values()];const fire=(j,l,u)=>pcb.forEach(f=>f({peers:snap(),joined:j||[],left:l||[],updated:u||[]}));
    bc.onmessage=e=>{const m=e.data;if(m.peer===me)return;if(m.k==='p'){const prev=peers.has(m.peer);const p=Object.freeze({peer:m.peer,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false,presence:m.p,updatedAt:Date.now()});peers.set(m.peer,p);fire(prev?[]:[p],[],prev?[p]:[]);if(!prev)bc.postMessage({k:'p',peer:me,p:mine});}
      else if(m.k==='e'){(ev[m.t]||[]).forEach(f=>f({topic:m.t,data:m.d,peer:m.peer,by:null,isMe:false,sameTab:false,kind:'viewer',guest:false}));}else if(m.k==='bye'){const p=peers.get(m.peer);peers.delete(m.peer);if(p)fire([],[p]);}};
    return {name,presence(p){for(const [k,v] of Object.entries(p))if(v===null)delete mine[k];else mine[k]=v;mine=Object.assign({},mine);bc.postMessage({k:'p',peer:me,p:mine});return Promise.resolve();},
      onPeers(f){pcb.push(f);setTimeout(()=>fire([snap()[0]]),0);return()=>{};},onConnection(f){setTimeout(()=>f(true),0);return()=>{};},connected:()=>true,peers:snap,
      emit(t,d){const n=JSON.stringify(d===undefined?null:d).length;if(n>4096){window.__over=(window.__over||0)+1;return Promise.reject({code:'invalid_argument'});}window.__msgs=(window.__msgs||0)+1;bc.postMessage({k:'e',t,d,peer:me});return Promise.resolve();},
      on(t,f){(ev[t]=ev[t]||[]).push(f);return()=>{};},join(n){return Promise.resolve(mkRoom('named-'+n));},leave(){bc.postMessage({k:'bye',peer:me});bc.close();return Promise.resolve();}};};
  window.claude={use:async n=>n==='room'?mkRoom('lobby'):null};};
(async()=>{const b=await chromium.launch();const errs=[];
 const mk=async(name)=>{const ctx=await b.newContext({...devices['iPhone 13']});await ctx.addInitScript(mock);const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(name+' ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
   await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});return pg;};
 // BroadcastChannel only links pages in the same context, so put both in one context
 const ctx=await b.newContext({...devices['iPhone 13']});await ctx.addInitScript(mock);
 const open=async(name)=>{const pg=await ctx.newPage();pg.on('pageerror',e=>errs.push(name+' ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});return pg;};
 const ev=(pg,c)=>pg.evaluate(c=>__game.ev(c),c);
 const A=await open('host');await A.evaluate(()=>localStorage.clear());
 await A.evaluate(()=>{document.getElementById('begin').click();});await A.waitForTimeout(300);await A.fill('#cName','Sam');await A.click('#cGo');await A.waitForTimeout(300);await A.evaluate(()=>__game.skip());await A.waitForTimeout(300);
 await ev(A,"S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=9;S.coins=100;for(let i=0;i<400;i++)S.lore.push('padding lore line number '+i+' to make the snapshot large')");console.log('mode',await ev(A,"CO.mode"),'snap bytes',await ev(A,"JSON.stringify(saveData(true)).length"));await ev(A,"hostStart()");await A.waitForTimeout(800);const code=await ev(A,"HOST.code");console.log('host code',code,await ev(A,"HOST.role+' room '+CO.room.name"));
 const B=await open('guest');await B.evaluate(()=>{document.getElementById('begin').click();});await B.waitForTimeout(300);await B.fill('#cName','Jo');await B.click('#cGo');await B.waitForTimeout(300);await B.evaluate(()=>__game.skip());await B.waitForTimeout(300);
 await ev(B,"S.tut.off=true;addInv('wood',9)");await ev(B,`hostJoin('${code}')`);await B.waitForTimeout(2500);
 console.log('B title join btn',await B.evaluate(()=>[...document.querySelectorAll('#title button')].map(b=>b.textContent).join(' | ')));
 await B.evaluate(()=>[...document.querySelectorAll('#title button')].find(b=>/Join farm/.test(b.textContent)).click());await B.waitForTimeout(3500);
 console.log('B joined',await ev(B,"HOST.role+' joined '+HOST.joined+' day '+S.day+' hour '+S.hour.toFixed(1)+' coins '+S.coins+' host '+HOST.hostName+' wood '+inv('wood')"));
 await ev(A,"tiles[0].tilled=true;tiles[1].tilled=true");await A.waitForTimeout(900);console.log('B sees tilled',await ev(B,"tiles[0].tilled+' '+tiles[1].tilled"));
 await ev(B,"tiles[1].crop={type:'turnip',stage:0,growth:0,watered:false,pop:0}");await B.waitForTimeout(900);console.log('A sees crop',await ev(A,"tiles[1].crop&&tiles[1].crop.type"));
 await ev(B,"S.coins+=40");await B.waitForTimeout(900);console.log('coins A',await ev(A,"S.coins"),'B',await ev(B,"S.coins"));
 await ev(B,"const o=OBJ.filter(o=>o.debris).find(o=>!o.hide);o.hide=true;window.__dx=o.x");await B.waitForTimeout(900);console.log('A debris cleared',await ev(A,"OBJ.filter(o=>o.debris).some(o=>o.hide)"));
 await ev(B,"sleep()");await B.waitForTimeout(300);console.log('B sleep',await ev(B,"S.day+' '+ui.toast.textContent.slice(0,50)"));
 await ev(A,"newDay()");await A.waitForTimeout(2500);console.log('after host sleeps: A day',await ev(A,"S.day"),'B day',await ev(B,"S.day+' wood '+inv('wood')+' tile1 '+(tiles[1].crop&&tiles[1].crop.type)"));
 await ev(A,"openBag('coop')");await A.waitForTimeout(400);await A.bringToFront();await A.screenshot({path:'HOST1.png'});await ev(A,"$('bag').hidden=true;S.paused=false");
 await ev(B,"openBag('coop')");await B.waitForTimeout(400);await B.bringToFront();await B.screenshot({path:'HOST2.png'});await ev(B,"$('bag').hidden=true;S.paused=false");
 await ev(A,"P.x=2.5;P.z=-6");await B.waitForTimeout(800);await B.screenshot({path:'HOST3.png'});
 console.log('over-limit sends',await A.evaluate(()=>window.__over||0),await B.evaluate(()=>window.__over||0));console.log(errs.slice(0,6).join('\n'));await b.close();})();
