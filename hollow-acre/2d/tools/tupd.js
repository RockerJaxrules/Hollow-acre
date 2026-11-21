const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();let navs=0;pg.on('framenavigated',f=>{if(f===pg.mainFrame())navs++;});
 await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.waitForTimeout(1500);
 console.log('same version: navigations',navs,'url',pg.url());
 fs.writeFileSync('version.json',JSON.stringify({id:'99999'}));navs=0;
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForTimeout(6000);console.log('newer version: navigations',navs,'url',pg.url());
 await b.close();})();
