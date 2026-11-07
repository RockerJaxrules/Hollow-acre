const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1000,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.room=null;");
 const shots=[];
 for(const [tag,setup,id] of [['day',"S.hour=12;S.storm=false;",'mae'],['night',"S.hour=21;S.storm=false;",'mae'],['wet',"S.hour=21;S.storm=true;",'mae'],['day2',"S.hour=12;S.storm=false;",'tess']]){
   await ev(setup+"document.querySelectorAll('.sheet').forEach(s=>s.hidden=true);$('talk').hidden=true;S.paused=false;S.room=null;");
   const r=await ev(`(()=>{const n=npcById('${id}');n.room=null;n.loc='out';P.x=n.x;P.z=n.z+1.2;talk(n);return portraitVariant()+' '+$('talkLine').textContent.slice(0,60);})()`);console.log(tag,r);
   await pg.waitForTimeout(500);await pg.screenshot({path:`P5_${tag}.png`,clip:{x:100,y:150,width:800,height:300}});}
 // every expression through drawPortrait
 const faces=await ev(`(()=>{const out=[];for(const e of PORTRAITS_HD.expr){const c=document.createElement('canvas');c.width=c.height=128;drawPortrait(c,'mae',e);out.push(c.toDataURL());}return JSON.stringify(out);})()`);
 require('fs').writeFileSync('P5_faces.json',faces);
 console.log('emotions', await ev("['Ha ha, no way.','Don’t make it weird.','I love you, dummy.','Hmm. I wonder.','She is crying in the back room.'].map(t=>emotionOf('mae',t)).join(',')"));
 console.log('fallback man', await ev("(()=>{const c=document.createElement('canvas');c.width=c.height=64;return drawPortrait(c,'hale','laugh');})()"));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
