// save the toolbar icons exactly as the game shows them (with the starting grades' recolouring)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [page,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});const b=await chromium.launch();const pg=await b.newPage();
 await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/'+page,{waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{try{localStorage.clear();}catch(e){}document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 for(const k of ['hoe','axe','pick','can']){const url=await pg.evaluate(k=>__game.ev(`(()=>{const c=gradeIcon('${k}');return typeof c==='string'?c:(c&&c.toDataURL?c.toDataURL():null);})()`),k);
   if(url)fs.writeFileSync(`${out}/${k}.png`,Buffer.from(url.split(',')[1],'base64'));console.log(k,!!url);}
 await b.close();})();
