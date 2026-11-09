// every grade of every tool: the toolbar icon and the tool as drawn in the hand (side-on, swing pose; facing down; for the can
// also facing up), exported straight from the game's own drawing code
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [page,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});const b=await chromium.launch();const pg=await b.newPage();
 await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/'+page,{waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{try{localStorage.clear();}catch(e){}document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const G={hoe:[['rust',1],['copper',2]],axe:[['iron',1],['steel',2],['gold',3]],pick:[['iron',1],['steel',2],['gold',3]],can:[['tin',10],['copper',20]]};
 for(const [k,list] of Object.entries(G))for(const [grade,lv] of list){
   const res=await pg.evaluate(([k,grade,lv])=>__game.ev(`(()=>{S.tools=S.tools||{};
     if('${k}'==='hoe')S.hoe=${lv};else if('${k}'==='can')S.waterMax=${lv};else S.tools['${k}']=${lv};
     for(const key of Object.keys(GRADE_ICON))delete GRADE_ICON[key];
     const icon=gradeIcon('${k}');const o={icon};
     const st=(nm,ang)=>{const s=toolStamp(nm,'${grade}',ang,1,false);return s.cv.toDataURL();};
     if('${k}'==='can'){o.side=st('can',-90);o.down=st('can_f',-90);o.up=st('can_b',-90);o.pour=st('can_ft',-90);}
     else{o.side=st('${k}',-45);o.down=st('${k}_f',-90);}
     return JSON.stringify(o);})()`),[k,grade,lv]);
   const o=JSON.parse(res);for(const [n,u] of Object.entries(o))if(u)fs.writeFileSync(`${out}/${k}_${grade}_${n}.png`,Buffer.from(u.split(',')[1],'base64'));console.log(k,grade,Object.keys(o).join(','));}
 await b.close();})();
