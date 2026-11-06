const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 const url=await ev(`(()=>{const K=4,W=6*40,H=3*90;const cv=document.createElement('canvas');cv.width=W*K;cv.height=H*K;const G=cv.getContext('2d');G.imageSmoothingEnabled=false;G.fillStyle='#5a8a3a';G.fillRect(0,0,cv.width,cv.height);
   const cell=document.createElement('canvas');cell.width=W;cell.height=H;const g=cell.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#5a8a3a';g.fillRect(0,0,W,H);
   const pend=[];
   [[1,1,1,1,10,1],[2,2,2,2,20,2],[2,2,2,2,20,3]].forEach(([h,p,a,_,w,r],row)=>{S.hoe=h;S.tools.hoe=h;S.tools.pick=p;S.tools.axe=a;S.waterMax=w;S.rod=r;
     ['hoe','can','pick','axe','rod'].forEach((k,i)=>{const u=iconOf(k);const im=new Image();im.src=u;pend.push([im,i*40+4,row*90+4]);});
     // in hand: impact frame facing east
     ['farmer_hoe','farmer_pick','farmer_axe'].forEach((n,i)=>{toolOverlay(g,n,'E',6,i*70+10,row*90+26-0,'front');});
     toolOverlay(g,'farmer_can','E',4,200,row*90+30,'front');toolOverlay(g,'farmer_rod','E',6,140+60,row*90+0,'front');});
   return new Promise(res=>setTimeout(()=>{for(const [im,x,y] of pend)g.drawImage(im,x,y,32,32);G.drawImage(cell,0,0,W*K,H*K);res(cv.toDataURL());},300));})()`);
 fs.writeFileSync('GRADES.png',Buffer.from(url.split(',')[1],'base64'));console.log(errs.join('\n')||'no errors');await b.close();})();
