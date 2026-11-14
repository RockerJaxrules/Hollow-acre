const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({...devices['iPhone 13']});await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.looped=true;S.bound=true;S.st.started=true;S.st.act=3;HZ.cd.tip=1e12");
 const lines=['My pumpkin bread wins the fair every year.','Oh, thank you! I love it, dear!','Ruth would have liked you. She’s gone now.','Get out of my shop. Don’t you dare come back.','You came back? Really?','Don’t look behind you. Please. The scarecrow is watching.','Happy birthday. Early, I know.'];
 await ev("talk(npcById('dunn'))");let i=0;
 for(const l of lines){await ev(`$('talkLine').innerHTML='<q>'+${JSON.stringify(l)}+'</q>'`);await pg.waitForTimeout(200);console.log(await ev("emotionOf('dunn',$('talkLine').textContent)"),'|',l,'| tag',await ev("$('talkPortrait .nm')?'':document.querySelector('#talkPortrait .nm').textContent"));await pg.locator('#talkPortrait').screenshot({path:`PF${i++}.png`});}
 await b.close();})();
