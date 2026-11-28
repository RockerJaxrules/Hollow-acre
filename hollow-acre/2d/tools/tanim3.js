// node tanim3.js <page> <outdir>: every player action in four directions, frame by frame with the game paused (exact frames, no capture lag)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [page,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));
 await pg.route('**/version.json*',r=>r.abort());
 await pg.goto('http://localhost:'+(process.env.PORT||8766)+'/'+page,{waitUntil:'domcontentloaded'});await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});
 await pg.evaluate(()=>{try{localStorage.clear();}catch(e){}});
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 // LEVELS='hoe=3,can=4,pick=3,axe=2,rod=4': capture with those tool levels (each upgrade's own colours)
 if(process.env.LEVELS)await ev('(()=>{for(const kv of '+JSON.stringify(process.env.LEVELS)+'.split(",")){const [k,v]=kv.split("=");const n=+v;if(k==="hoe"){S.hoe=n;S.tools.hoe=n;}else if(k==="can")S.waterMax=[10,20,30,40][n-1];else if(k==="rod")S.rod=n;else S.tools[k]=n;}for(const key of Object.keys(GRADE_ICON))delete GRADE_ICON[key];return 1;})()');
 await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=10;S.energy=100;S.water=10;$('hud').style.opacity=0");
 const T=await ev("(()=>{const t=tiles.find(t=>!t.gh&&!t.tilled&&!(t.debris&&!t.debris.hide)&&!interact.some(q=>(!q.on||q.on())&&Math.hypot(q.x-t.x,q.z-t.z)<1.5));return tiles.indexOf(t);})()");
 const shot=async(name)=>{const c=await ev(`(()=>{const r=view.getBoundingClientRect();const ax=window._capX!==undefined?_capX:P.x,az=window._capZ!==undefined?_capZ:P.z;return [r.left+sx(ax)*r.width/VW, r.top+sz(az)*r.height/VH, r.width/VW];})()`);
   const big=/^(plant|grab|hoe|axe|pick|water)_/.test(name);const W=(big?96:60)*c[2],H=(big?128:80)*c[2];   // planting and setting down: wide enough to show the square
   await pg.screenshot({path:`${out}/${name}.png`,clip:{x:c[0]-W/2,y:c[1]-(big?80:60)*c[2],width:W,height:H}});};
 const DIRS=[['S',0,-1],['E',-1,0],['N',0,1],['W',1,0]];
 const ONLY=(process.env.CLIPS||'').split(',').filter(Boolean);
 for(const [clip,dur,nf] of [['hoe',.72,8],['axe',.72,8],['pick',.72,8],['water',1.1,8],['plant',.7,6],['grab',.7,6]].filter(c=>!ONLY.length||ONLY.includes(c[0]))){
  // the thing being struck sits on the square, so a judge can see whether the tool actually hits it
  await ev(`(()=>{if(window._tgtObj){const i=OBJ.indexOf(_tgtObj);if(i>=0)OBJ.splice(i,1);window._tgtObj=null;}const t=tiles[${T}];const sp=${JSON.stringify({pick:'rock_1',axe:'stump_oak'})}['${clip}'];if(sp&&typeof obj==='function'){window._tgtObj=obj(sp,t.x,t.z+.05,{kind:'prop',noCol:true});}})()`);
  for(const [d,dx,dz] of DIRS){
   await ev(`(()=>{S.paused=false;const t=tiles[${T}];const g='${clip}'==='grab',nN=g&&'${d}'==='N',sw=['pick','axe'].includes('${clip}');const dd=g?.5:sw?.76:.95;P.x=t.x+(nN?.45:${dx}*dd);P.z=t.z+(g?.12:sw?.05:0)+${dz}*dd-(g||sw?0:.1);P.anim=null;faceTo(t.x,t.z);window._capX=P.x;window._capZ=P.z;window._st=null;})()`);await pg.waitForTimeout(120);
   for(let k=0;k<nf;k++){
     await ev(`(()=>{const t=tiles[${T}];S.paused=true;P.anim={clip:'${clip}',dur:${dur},t:${dur}*${(k+.5)/nf},fire:null,fired:true,item:'${clip==='grab'?'sprinkler':''}',step:window._st,tgt:{x:t.x,z:t.z}};P.clip='${clip}';if(window._st){const e=actStepE(_st,${(k+.5)/nf});P.x=_capX+_st.dx*e;P.z=_capZ+_st.dz*e;}})()`);
     await pg.waitForTimeout(70);await shot(`${clip}_${d}_${k}`);
     if(['hoe','axe','pick','water','plant','grab'].includes(clip)){await ev('window.NO_TOOL_DRAW=true');await pg.waitForTimeout(50);await shot(`${clip}_${d}_${k}_nt`);await ev('window.NO_TOOL_DRAW=false');}}
  }}
 await ev('(()=>{delete window._capX;delete window._capZ;})()');
 for(const [clip,nf,fps,first] of [['walk',8,13,1],['run',8,18,1],['idle',4,3,0]].filter(c=>!ONLY.length||ONLY.includes(c[0]))){
  for(const [d] of DIRS){
   for(let k=0;k<nf;k++){
     await ev(`(()=>{S.paused=true;P.anim=null;P.dir='${d}';P.clip='${clip==='run'?'walk':clip}';P.spd=${clip==='run'?5:3};P.t=${k/fps+.01};})()`);
     await pg.waitForTimeout(60);await shot(`${clip}_${d}_${k}`);}
  }}
 await ev("S.paused=false");console.log(errs.slice(0,3).join('\n')||'no errors');await b.close();})();
