const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1400,height:1000}});pg.on('pageerror',e=>console.log('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1500);
 const which=process.argv[2]||'farmer_hoe,farmer_pick';
 const url=await pg.evaluate(w=>__game.ev(`(()=>{const names=${JSON.stringify(w.split(','))};const D=['S','E','N','W'];const K=3,CW=80,CH=96;const cw=document.createElement('canvas');cw.width=8*CW*K;cw.height=names.length*4*CH*K;const G=cw.getContext('2d');G.imageSmoothingEnabled=false;G.fillStyle='#6a9a4a';G.fillRect(0,0,cw.width,cw.height);
   const cell=document.createElement('canvas');cell.width=CW;cell.height=CH;const g=cell.getContext('2d');g.imageSmoothingEnabled=false;
   let row=0;for(const n of names)for(const d of D){const m=SPR[n];const im=IMG[m.src];const c=m.clips.thrust[d];for(let f=0;f<c[1];f++){g.fillStyle='#6a9a4a';g.fillRect(0,0,CW,CH);
       // the square the tool should land on
       const ox=16,oy=12;const fx=ox+24+(d==='E'?32:d==='W'?-32:0),fy=oy+60+(d==='S'?28:d==='N'?-28:0);g.strokeStyle='rgba(255,255,255,.35)';g.strokeRect(fx-16+.5,fy-20+.5,31,31);const wfx=d==='N'?fx+9:fx,wfy=d==='N'?fy+12:fy;
       const tip=toolOverlay(g,n,d,f,ox,oy,'back');if(tip&&m.toolKind==='can'&&f>=3&&f<=6)waterStream(g,tip,[wfx,wfy],f*.1);g.drawImage(im,f*m.fw,c[0]*m.fh,m.fw,m.fh,ox,oy,48,64);const t2=toolOverlay(g,n,d,f,ox,oy,'front');if(t2&&m.toolKind==='can'&&f>=3&&f<=6)waterStream(g,t2,[wfx,wfy],f*.1);fistOverlay(g,n,d,f,ox,oy);
       G.drawImage(cell,0,0,CW,CH,f*CW*K,row*CH*K,CW*K,CH*K);}G.fillStyle='#000';G.font='22px monospace';G.fillText(n.slice(7)+' '+d,6,row*CH*K+22);row++;}
   return cw.toDataURL();})()`),which);
 fs.writeFileSync(process.argv[3]||'TOOLS_new.png',Buffer.from(url.split(',')[1],'base64'));await b.close();})();
