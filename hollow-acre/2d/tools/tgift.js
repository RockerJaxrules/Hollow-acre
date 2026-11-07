const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_demo.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 // jump the tutorial to the 'Meet the town' lesson, the way a player reaches it
 await ev("S.tut.off=false;S.hour=11;S.room=null;const i=LESSONS.findIndex(l=>l.id==='friends');lsBegin(i);S.basket.push({kind:'pumpkin',value:12},{kind:'turnip',value:8});addInv('bread',1);");
 await pg.waitForTimeout(400);console.log('lesson:',await ev("LESSONS[S.ls.i].id+' | '+LESSONS[S.ls.i].goal(S.ls.base)"));
 for(const id of ['mae','hale','tobias','hollis','agnes']){await ev(`(()=>{const n=npcById('${id}');n.room=null;n.loc='out';P.x=n.x;P.z=n.z+1.2;talk(n);$('talk').hidden=true;S.paused=false;})()`);}
 console.log('after talking:',await ev("LESSONS[S.ls.i].goal(S.ls.base)"));
 await ev("(()=>{const n=npcById('mae');talk(n);})()");await pg.waitForTimeout(300);
 console.log('give button hidden?',await ev("$('talkGift').hidden"));await ev("$('talkGift').click()");await pg.waitForTimeout(200);
 console.log('choices:',await ev("[...$('talk').querySelectorAll('.giftrow button')].map(b=>b.textContent).join(' | ')"));
 await ev("[...$('talk').querySelectorAll('.giftrow button')].find(b=>/Pumpkin/i.test(b.textContent)).click()");await pg.waitForTimeout(300);
 console.log('reply:',await ev("$('talkLine').textContent"));await pg.screenshot({path:'GIFT_reply.png'});
 await ev("$('talk').hidden=true;S.paused=false;");await pg.waitForTimeout(1500);
 console.log('lesson now:',await ev("(LESSONS[S.ls.i]||{}).id+' | weekly '+JSON.stringify(S.giftsWeek)+' total '+S.giftsTotal"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
