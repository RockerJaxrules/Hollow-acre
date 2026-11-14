// a tour of the world-art problem spots: facts first, then screenshots at each
const {chromium}=require('playwright');
const spots=JSON.parse(process.argv[2]||'null');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1100,height:760}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.hour=11;S.energy=999;S.room=null;");
 if(!spots){
  console.log(await ev(`(()=>{const out={};
   out.lampsOnDirt=lamps.filter(l=>terr(l.x,l.z)==='dirt').map(l=>[+l.x.toFixed(1),+l.z.toFixed(1)]);
   out.lampsAll=lamps.length;
   const solid=OBJ.filter(o=>o.spr&&!/^(tgold|tgrass|leaves|weeds|rock_|twig)/.test(o.spr)&&o.kind!=='flat'&&o.kind!=='deco');
   const g=OBJ.filter(o=>o.spr==='tgold'||o.spr==='tgrass');let clip=[];for(const t of g){for(const s of solid){if(Math.abs(s.x-t.x)<.9&&Math.abs(s.z-t.z)<.6&&s!==t){clip.push([t.spr,+t.x.toFixed(1),+t.z.toFixed(1),s.spr]);break;}}}
   out.grassCount=g.length;out.grassClip=clip.length;out.grassClipSample=clip.slice(0,12);
   let zmax=-1e9,zmin=1e9,xmax=-1e9,xmin=1e9;for(const o of OBJ){zmax=Math.max(zmax,o.z);zmin=Math.min(zmin,o.z);xmax=Math.max(xmax,o.x);xmin=Math.min(xmin,o.x);}out.bounds=[xmin,xmax,zmin,zmax].map(v=>+v.toFixed(1));
   out.signs=OBJ.filter(o=>o.spr==='signpost').map(o=>[o.label||'',+o.x.toFixed(1),+o.z.toFixed(1),terr(o.x,o.z)]);
   out.sacks=OBJ.filter(o=>o.spr==='sacks'&&!o.room).map(o=>[+o.x.toFixed(1),+o.z.toFixed(1),blockedAt(o.x+.2,o.z-.1,.1)]);
   out.leaves=OBJ.filter(o=>o.kind==="deco").length;out.removedTufts=world67.n;
   return JSON.stringify(out);})()`));
 }else for(const [name,x,z,hour] of spots){await ev(`S.room=null;P.x=${x};P.z=${z};P.dir='S';S.hour=${hour||11};`);await pg.waitForTimeout(700);await pg.screenshot({path:`TT_${name}.png`});console.log('shot',name);}
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
