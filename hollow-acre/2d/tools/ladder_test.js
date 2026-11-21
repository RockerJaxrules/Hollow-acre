// buys every tool level through Hollis's rows and checks names, grades, costs, and how many tiles each hoe level tills
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d_k.html',{waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{try{localStorage.clear();}catch(e){}document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const r=await pg.evaluate(()=>__game.ev(`(()=>{const out=[];const rows=()=>vendors.hollis.rows();
   for(const k of ['hoe','can','pick','axe']){for(let i=0;i<5;i++){const row=rows().find(x=>x.k===k);out.push(k+' lv'+toolLv(k)+' '+toolName(k)+' ['+toolGrade(k)+'] next: '+row.name+' can='+row.can+' need='+JSON.stringify(row.need)+' price='+row.price+(k==='pick'?' cost='+pickCost():k==='axe'?' cost='+axeCost():k==='can'?' max='+S.waterMax:''));if(!row.can)break;row.buy();}}
   return out.join('\\n');})()`));
 console.log(r);
 // hoe reach: till one tile at each level on the field and count the tiles tilled
 for(const lv of [1,2,3,4]){const n=await pg.evaluate(lv=>__game.ev('(()=>{S.hoe='+lv+';S.tools.hoe='+lv+';S.energy=999;for(const t of tiles){t.tilled=false;if(t.debris)t.debris.hide=true;}const t=tiles.find(t=>!t.gh&&tileAt(t.i+2,t.j+2)&&tileAt(t.i-2,t.j-2)&&tileAt(t.i+2,t.j-2)&&tileAt(t.i-2,t.j+2));if(!t)return "no tile";P.fx=0;P.fz=-1;doTill(t);return t.i+","+t.j;})()'),lv);
   await pg.waitForTimeout(1000);const c=await pg.evaluate(()=>__game.ev('tiles.filter(t=>t.tilled).length'));console.log('hoe lv',lv,'at',n,'tilled',c);}
 console.log(errs.length?errs.join('\n'):'no page errors');await b.close();})();
