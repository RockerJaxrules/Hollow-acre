const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:700}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>document.getElementById('begin').click());await pg.waitForTimeout(600);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);const shots=[];
 const looks=[{style:'long',hair:'#c85a24',skin:'#f6d8c0',outfit:'dress',shirt:'#5a7ac8',hat:'',glasses:'',beard:'',accessory:'flower'},
  {style:'curly',hair:'#14100e',skin:'#8a5434',outfit:'overalls',shirt:'#d8603a',hat:'straw',glasses:'',beard:'',accessory:''},
  {style:'short',hair:'#6a4224',skin:'#e8b48c',outfit:'jacket',shirt:'#e8e0d0',hat:'',glasses:'round',beard:'full',accessory:''},
  {style:'ponytail',hair:'#d8c27a',skin:'#f2cfb0',outfit:'hoodie',shirt:'#7a4a8a',hat:'cap',glasses:'',beard:'',accessory:''}];
 const fs=require('fs');let i=0;
 for(const L of looks){await ev(`Object.assign(S.look,${JSON.stringify(L)});applyLook();`);await pg.waitForTimeout(250);
   const url=await ev(`(()=>{const c=document.createElement('canvas');c.width=48*3*4;c.height=64*4;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const m=SPR.farmer,im=IMG[m.src];['S','E','N'].forEach((d,k)=>{const r=m.clips.walk[d];g.drawImage(im,0,r[0]*m.fh,m.fw,m.fh,k*48*4,0,48*4,64*4);});return c.toDataURL();})()`);
   fs.writeFileSync(`TCL_${i++}.png`,Buffer.from(url.split(',')[1],'base64'));}
 console.log(errs.join('\n')||'no errors');await b.close();})();
