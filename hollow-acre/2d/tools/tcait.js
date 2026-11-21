const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=12;S.room=null;");
 const talkTo=async(tag)=>{const r=await ev(`(()=>{const n=npcById('mae');S.room=n.room||null;P.x=n.x;P.z=n.z+1.2;P.dir='N';talk(n);return n.def.name+' | '+$('talkRole').textContent+' | '+$('talkLine').textContent;})()`);console.log(tag,r);await pg.waitForTimeout(600);await pg.screenshot({path:`CT_${tag}.png`});};
 await talkTo('talk0');
 await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('talk').hidden=true;S.paused=false;");
 // friendship cap: push to 10 hearts, it should stop at 8
 console.log('cap', await ev("addFriend('mae',2000);[friend('mae'),hearts('mae')].join(',')"));
 // give the bouquet before 8? (it is 8 now) — first try with 7 hearts
 await ev("S.friend.mae=750;addInv('bouquet',2);S.heartSeen.mae2=S.heartSeen.mae4=S.heartSeen.mae6=S.heartSeen.mae7=S.heartSeen.mae8=1;S.talkedToday={};");
 await talkTo('talk7');console.log('giftBtn hidden?', await ev("$('talkGift').hidden"));
 await ev("$('talkGift').click()");await pg.waitForTimeout(300);await pg.screenshot({path:'CT_giftrow.png'});
 console.log('row', await ev("$('talk').querySelector('.giftrow').textContent"));
 await ev("[...$('talk').querySelectorAll('.giftrow button')].find(b=>b.textContent.includes('bouquet')).click()");await pg.waitForTimeout(300);
 console.log('early:', await ev("$('talkLine').textContent+' | inv '+inv('bouquet')"));
 await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('talk').hidden=true;S.paused=false;S.friend.mae=850;S.gifted={};S.giftsWeek={};S.talkedToday={};");
 await talkTo('talk8');await ev("$('talkGift').click()");await pg.waitForTimeout(200);
 await ev("[...$('talk').querySelectorAll('.giftrow button')].find(b=>b.textContent.includes('bouquet')).click()");await pg.waitForTimeout(900);await pg.screenshot({path:'CT_scene.png'});
 for(let i=0;i<6;i++){await ev("$('scene').click()");await pg.waitForTimeout(250);}
 console.log('dating', await ev("JSON.stringify(S.rom)+' hearts '+hearts('mae')+' inv '+inv('bouquet')"));
 await ev("addFriend('mae',200);S.talkedToday={};S.gifted={};");console.log('after dating', await ev("hearts('mae')"));
 await talkTo('talk9');await pg.waitForTimeout(900);await pg.screenshot({path:'CT_ev9.png'});
 console.log('scene?', await ev("SCENE?SCENE.title||document.querySelector('#scene .tx').textContent.slice(0,80):'none'"));
 for(let i=0;i<8;i++){await ev("SCENE&&$('scene').click()");await pg.waitForTimeout(200);}
 await ev("S.friend.mae=1000;S.talkedToday={};");await talkTo('talk10');await pg.waitForTimeout(900);await pg.screenshot({path:'CT_ev10.png'});
 for(let i=0;i<8;i++){await ev("SCENE&&$('scene').click()");await pg.waitForTimeout(200);}
 console.log('promise', await ev("JSON.stringify(S.rom)"));
 await ev("S.talkedToday={};");await talkTo('talkD');
 await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('talk').hidden=true;S.paused=false;openBag('social')");await pg.waitForTimeout(500);await pg.screenshot({path:'CT_social.png'});
 await ev("document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);S.paused=false;openShop('v_feed')");await pg.waitForTimeout(400);await pg.screenshot({path:'CT_feed.png'});
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
