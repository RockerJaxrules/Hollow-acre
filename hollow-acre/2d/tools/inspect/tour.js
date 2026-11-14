/* The inspector's legs and eyes: walks the whole game like a player and records what it sees.
   Visits every building front, gathering place, named place, region milestone and room; looks at the town by day, at dusk,
   at night and in the rain; on a phone and on a PC. At every stop it takes a screenshot and measures the things a careful
   player would notice: things standing in each other or in water, places you can't reach, screens that are empty or
   cluttered, the same prop repeated over and over, two identical buildings side by side, people inside walls, and the frame rate.
   Usage: node tour.js <url> <outdir> [--quick]
   Writes <outdir>/shots/*.png, <outdir>/report.json and <outdir>/sheets/*.png (contact sheets for the reviewer). */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2],OUT=process.argv[3]||'inspect',QUICK=process.argv.includes('--quick');
fs.mkdirSync(path.join(OUT,'shots'),{recursive:true});fs.mkdirSync(path.join(OUT,'sheets'),{recursive:true});
(async()=>{const b=await chromium.launch();const report={stops:[],errors:[],started:new Date().toISOString()};
 async function open(vp){const pg=await b.newPage({viewport:vp});pg.on('pageerror',e=>report.errors.push(e.message));
   await pg.route('**/fonts.googleapis.com/**',r=>r.abort());await pg.route('**/version.json*',r=>r.abort());
   await pg.goto(URL);await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:120000});
   await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);
   await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(1200);await pg.addStyleTag({content:'#tut{display:none!important}'});
   await pg.evaluate(()=>__game.ev(`S.tut&&(S.tut.off=true);S.day=3;S.hour=11;`));return pg;}
 const pg=await open({width:1000,height:640});const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 // ---- the measuring tape, run inside the game at each stop
 await ev(`window.__insp=function(){const R={};const L=cam.x-VW/2/PPM,Rr=cam.x+VW/2/PPM,T=cam.z-VH*.56/PPM,B=cam.z+VH*.44/PPM;
  const vis=OBJ.filter(o=>!o.hide&&o.x>L-1&&o.x<Rr+1&&o.z>T-1&&o.z<B+3);const solid=vis.filter(o=>!['deco','flat','grass','anim'].includes(o.kind)&&!o.grass);
  R.objects=solid.length;R.flat=vis.length-solid.length;
  const foot=o=>{const m=SPR[o.spr];if(!m||!m.foot)return null;const f=m.foot;if(!(f[2]-f[0]>0.05&&f[3]-f[1]>0.02))return null;return [o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]];};
  const ov=[];const fs=solid.map(o=>[o,foot(o)]).filter(q=>q[1]&&!q[0].noCol);
  for(let i=0;i<fs.length;i++)for(let j=i+1;j<fs.length;j++){const a=fs[i][1],b=fs[j][1];const w=Math.min(a[2],b[2])-Math.max(a[0],b[0]),h=Math.min(a[3],b[3])-Math.max(a[1],b[1]);if(w<=0||h<=0)continue;
    const ar=w*h,sm=Math.min((a[2]-a[0])*(a[3]-a[1]),(b[2]-b[0])*(b[3]-b[1]));if(ar>sm*.3)ov.push(fs[i][0].spr+'@'+fs[i][0].x.toFixed(1)+','+fs[i][0].z.toFixed(1)+' x '+fs[j][0].spr+'@'+fs[j][0].x.toFixed(1)+','+fs[j][0].z.toFixed(1));}
  R.overlaps=ov.slice(0,12);
  R.inWater=solid.filter(o=>typeof LAYERS!=='undefined'&&LAYERS.water(o.x,o.z)&&!/dock|bridge|boat|reed|lily|pier|buoy|rock/.test(o.spr)).map(o=>o.spr+'@'+o.x.toFixed(1)+','+o.z.toFixed(1)).slice(0,8);
  const cnt={};for(const o of solid){if(/tree|pine|spruce|maple|bush|birch|oak/.test(o.spr))continue;cnt[o.spr]=(cnt[o.spr]||0)+1;}R.repeats=Object.entries(cnt).filter(([k,v])=>v>=6).map(([k,v])=>k+' x'+v);
  const blds=solid.filter(o=>o.kind==='bld');R.twinBuildings=[];for(let i=0;i<blds.length;i++)for(let j=i+1;j<blds.length;j++)if(blds[i].spr===blds[j].spr&&Math.hypot(blds[i].x-blds[j].x,blds[i].z-blds[j].z)<16)R.twinBuildings.push(blds[i].spr);
  R.peopleInWalls=npcs.filter(n=>n.vis!==false&&n.loc!=='in'&&n.x>L&&n.x<Rr&&n.z>T&&n.z<B&&blds.some(o=>{const f=foot(o);return f&&n.x>f[0]+.1&&n.x<f[2]-.1&&n.z>f[1]+.1&&n.z<f[3]-.05;})).map(n=>n.def.id);
  R.people=npcs.filter(n=>n.vis!==false&&n.x>L&&n.x<Rr&&n.z>T&&n.z<B).length;
  if(!S.room){const pts=[];for(let i=0;i<9;i++){const x=L+(Rr-L)*(.1+.8*((i%3)/2)),z=T+(B-T)*(.15+.7*(Math.floor(i/3)/2));const p={x,z};collide(p,.3);if(Math.hypot(p.x-x,p.z-z)<.02&&!LAYERS.water(x,z))pts.push([x,z]);}
    let unreach=0;for(const [x,z] of pts){let pa=null;try{pa=navPath(P.x,P.z,x,z);}catch(e){}if(!pa||!pa.length||Math.hypot(pa[pa.length-1][0]-x,pa[pa.length-1][1]-z)>1.5)unreach++;}R.walkableSamples=pts.length;R.unreachableSamples=unreach;}
  return JSON.stringify(R);};`);
 const fps=()=>pg.evaluate(()=>new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(n<40)requestAnimationFrame(f);else r(Math.round(1000/((performance.now()-t0)/n)));};requestAnimationFrame(f);}));
 // ---- where to go
 const stops=JSON.parse(await ev(`(()=>{const out=[];const add=(name,x,z,kind)=>{if(x>=250)return;if(out.some(s=>Math.hypot(s.x-x,s.z-z)<7))return;out.push({name,x,z,kind});};
  for(const [k,v] of Object.entries(typeof TB!=='undefined'?TB:{}))add('building:'+k,v[1],v[2]+2.2,'building');
  for(const p of (typeof MAP_PLACES!=='undefined'?MAP_PLACES:[]))add('place:'+p[0],p[1],p[2],'place');
  for(const m of (typeof RG_MILES!=='undefined'?RG_MILES:[]))add('region:'+m.name,m.x,m.z,'region');
  for(const [k,p] of Object.entries(PL))add('spot:'+k,p[0],p[1],'spot');
  return JSON.stringify(out);})()`));
 const rooms=JSON.parse(await ev(`JSON.stringify(Object.keys(ROOMS).filter(k=>ROOMS[k].w))`));
 const list=QUICK?stops.filter((s,i)=>i%4===0):stops;
 console.log('stops',list.length,'rooms',rooms.length);
 let n=0;const shot=async(name,extra)=>{const file=`shots/${String(n++).padStart(3,'0')}_${name.replace(/[^a-z0-9]+/gi,'_').slice(0,40)}.png`;await pg.screenshot({path:path.join(OUT,file)});
   const m=JSON.parse(await ev('__insp()'));const f=await fps();report.stops.push(Object.assign({name,file,fps:f},extra||{},m));};
 const goTo=async(x,z,hour,day)=>{await ev(`if(S.room)leaveRoom(true);`);await pg.waitForTimeout(S_WAIT);await ev(`S.day=${day||3};S.hour=${hour||11};P.x=${x};P.z=${z};P.dir='S';`);await pg.waitForTimeout(650);};
 var S_WAIT=0;
 for(const s of list){await goTo(s.x,s.z,s.kind==='region'?12:11,2);await shot(s.name,{x:s.x,z:s.z,kind:s.kind,time:'day'});}
 // the town at other times
 for(const [lab,h,d] of [['dusk',18.6,2],['night',22.5,2],['rain',12,3]]){for(const s of list.filter(q=>q.kind==='building'&&q.x>15&&q.x<80).slice(0,QUICK?3:8)){await goTo(s.x,s.z,h,d);await shot(lab+':'+s.name,{x:s.x,z:s.z,kind:s.kind,time:lab});}}
 // every room
 for(const k of (QUICK?rooms.slice(0,6):rooms)){await ev(`if(S.room)leaveRoom(true);`);await pg.waitForTimeout(300);await ev(`S.hour=12;enterRoom('${k}')`);await pg.waitForTimeout(1500);
   const furn=JSON.parse(await ev(`(()=>{const R=ROOMS['${k}'];const f=OBJ.filter(o=>!o.hide&&o.x>=R.ox-.5&&o.x<=R.ox+R.w+.5&&o.z>=R.oz-1&&o.z<=R.oz+R.d+.5);return JSON.stringify({w:R.w,d:R.d,items:f.length,outside:f.filter(o=>o.x<R.ox||o.x>R.ox+R.w||o.z>R.oz+R.d).map(o=>o.spr)});})()`));
   await shot('room:'+k,{kind:'room',room:k,roomInfo:furn});}
 await ev(`if(S.room)leaveRoom(true);`);await pg.waitForTimeout(800);
 // a phone's view of the busiest places
 const ph=await open({width:390,height:844});
 for(const s of list.filter(q=>q.kind==='building').slice(0,QUICK?2:6)){await ph.evaluate(([x,z])=>__game.ev(`P.x=${x};P.z=${z};S.hour=11;`),[s.x,s.z]);await ph.waitForTimeout(700);const file=`shots/${String(n++).padStart(3,'0')}_phone_${s.name.replace(/[^a-z0-9]+/gi,'_').slice(0,30)}.png`;await ph.screenshot({path:path.join(OUT,file)});report.stops.push({name:'phone:'+s.name,file,kind:'phone'});}
 report.finished=new Date().toISOString();
 // ---- the summary a reviewer starts from
 const flag=report.stops.filter(s=>(s.overlaps&&s.overlaps.length)||(s.inWater&&s.inWater.length)||(s.repeats&&s.repeats.length)||(s.twinBuildings&&s.twinBuildings.length)||(s.peopleInWalls&&s.peopleInWalls.length)||(s.unreachableSamples>0)||(s.kind!=='room'&&s.kind!=='phone'&&(s.objects<4||s.objects>70))||(s.fps&&s.fps<50));
 report.summary={stops:report.stops.length,flagged:flag.length,emptyScreens:report.stops.filter(s=>s.kind!=='room'&&s.kind!=='phone'&&s.objects<4).map(s=>s.name),
   cluttered:report.stops.filter(s=>s.objects>70).map(s=>s.name),overlapStops:report.stops.filter(s=>s.overlaps&&s.overlaps.length).length,slow:report.stops.filter(s=>s.fps&&s.fps<50).map(s=>s.name+' '+s.fps)};
 fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,1));
 // ---- contact sheets: six stops per sheet, labelled, for the reviewer's eyes
 const files=report.stops.map(s=>s.file);const sheet=await b.newPage({viewport:{width:1500,height:690}});
 for(let i=0;i<files.length;i+=6){const grp=report.stops.slice(i,i+6);const html=`<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(3,500px);gap:0">`+grp.map(s=>`<div style="position:relative;width:500px;height:345px;overflow:hidden;background:#000"><img src="file://${path.resolve(OUT,s.file)}" style="width:500px;height:320px;object-fit:contain"><div style="position:absolute;left:0;right:0;bottom:0;background:#000c;color:#fd8;font:12px monospace;padding:4px">${String(i+grp.indexOf(s)).padStart(3,'0')} ${s.name} ${s.time||''}</div></div>`).join('')+'</body>';
   const hf=path.resolve(OUT,'sheets',`sheet_${String(i/6).padStart(2,'0')}.html`);fs.writeFileSync(hf,html);await sheet.goto('file://'+hf);await sheet.waitForTimeout(300);await sheet.screenshot({path:path.join(OUT,'sheets',`sheet_${String(i/6).padStart(2,'0')}.png`),fullPage:true});}
 console.log(JSON.stringify(report.summary,null,1));console.log('errors',report.errors.slice(0,5));await b.close();})();
