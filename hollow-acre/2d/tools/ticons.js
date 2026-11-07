const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const rows=await ev(`(()=>{const out=[];
   const how=spr=>{const k=SPR['icon32_'+spr]?'icon32_'+spr:SPR['icon_'+spr]?'icon_'+spr:SPR['icon_'+(ICON_ALIAS[spr]||'')]?'icon_'+ICON_ALIAS[spr]+' (alias)':SPR[spr]?spr+' (world sprite)':'NONE';return k;};
   const add=(group,name,spr)=>{out.push({group,name,spr:spr||'(none)',how:how(spr),url:iconOf(spr)});};
   for(const k of ['hoe','can','pick','axe','rod'])add('tool',k,k);
   for(const k in SEEDS){const it=itemInfo('S:'+k);add('seed',it.name,it.icon);}
   for(const k of ['turnip','pumpkin','corn','egg','mushroom','fish','milk'])add('produce',(PRODUCE_NAMES[k]||k),k);
   for(const k in ITEMS)add('item',ITEMS[k].name,ITEMS[k].icon||k);
   if(typeof FURN!=='undefined')for(const k in FURN)add('furniture',FURN[k][0],FURN[k][1]);
   return out;})()`);
 // blank check
 for(const r of rows){r.blank=await pg.evaluate(u=>new Promise(res=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,32,32).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>20)n++;res(n);};im.src=u;}),r.url);}
 await pg.evaluate(rows=>{const d=document.createElement('div');d.id='iconSheet';d.style.cssText='position:fixed;inset:0;z-index:9999;background:#3a2a1c;color:#f4e6c8;font:11px monospace;display:flex;flex-wrap:wrap;gap:6px;padding:8px;align-content:flex-start;overflow:auto';
   for(const r of rows){const e=document.createElement('div');e.style.cssText='width:120px;display:flex;flex-direction:column;align-items:center;background:#5a3e26;padding:4px';e.innerHTML=`<img src="${r.url}" style="width:64px;height:64px;image-rendering:pixelated;background:#7a5838"><span>${r.name}</span><span style="opacity:.7">${r.how}</span>`;d.appendChild(e);}document.body.appendChild(d);},rows);
 await pg.waitForTimeout(500);await pg.screenshot({path:'TI_sheet.png',fullPage:false});
 for(const r of rows)console.log(r.group.padEnd(10),r.name.padEnd(22),r.spr.padEnd(14),r.how.padEnd(26),'px:'+r.blank);
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
