const {chromium}=require('playwright');const fs=require('fs');
// node scene.js URL OUTDIR TAG shots.js BUILD(old|new) [record=1]  (shots.js is the trailer's shot list; compose.py cuts it)
// A scene file exports [{name,steps,phase?}]. phase 'creator' runs on the character screen (before Go), phase 'intro'
// runs right after Go (the opening cutscene still playing); the rest run in play after the intro is skipped.
// A step is [op,...args] or {old:[...steps],new:[...steps]}.
// ops: ev expr | key Code ms | tap Code | act | use | wait ms | mark name | shot name | click sel | mouse x y | clear
(async()=>{const [url,out,tag,file,build,rec]=process.argv.slice(2);const scenes=require(require('path').resolve(file));
 const b=await chromium.launch();const vopt=rec==='0'?{}:{recordVideo:{dir:out,size:{width:960,height:540}}};
 const ctx=await b.newContext({viewport:{width:+(process.env.VW||960),height:+(process.env.VH||540)},...vopt});
 const t0=Date.now();const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const marks={},log=[];
 const ev=e=>pg.evaluate(e=>{try{const r=__game.ev(e);return r===undefined?'':JSON.stringify(r).slice(0,300);}catch(err){return 'ERR '+err.message;}},e);
 async function run(st){if(!Array.isArray(st)){for(const s of (st[build]||[]))await run(s);return;}
  const [op,a,c]=st;
  if(op==='ev'){const r=await ev(a);if(r)log.push(a.slice(0,50)+' => '+r);}
  else if(op==='js'){const r=await pg.evaluate(a).catch(e=>'ERR '+e.message);if(r!==undefined)log.push('js => '+JSON.stringify(r).slice(0,300));}
  else if(op==='key'){await pg.keyboard.down(a);await pg.waitForTimeout(+c);await pg.keyboard.up(a);}
  else if(op==='tap'){await pg.keyboard.press(a);}
  else if(op==='act'){await pg.evaluate(()=>__game.act());}
  else if(op==='use'){await pg.evaluate(()=>{if(__game.ev('typeof useFront')==='function')__game.ev('useFront()');else __game.act();});}
  else if(op==='wait'){await pg.waitForTimeout(+a);}
  else if(op==='mark'){marks[a]=Date.now()-t0;}
  else if(op==='shot'){await pg.screenshot({path:out+'/'+tag+'_'+a+'.png'});}
  else if(op==='click'){await pg.click(a,{timeout:4000}).catch(e=>log.push('click '+a+' fail'));}
  else if(op==='mouse'){await pg.mouse.click(+a,+c);}
  else if(op==='clear'){await ev('(ui.toast.classList.remove("show"),toastT=0,1)');}
 }
 const phase=p=>scenes.filter(s=>(s.phase||'')===p);
 await pg.route('**/version.json*',r=>r.fulfill({body:'{}'}));await pg.goto(url);
 await pg.waitForFunction(()=>{const l=document.getElementById('loadScr');return !l||l.style.display==='none'||!l.offsetParent;},null,{timeout:90000}).catch(()=>{});
 await pg.waitForTimeout(800);
 await pg.waitForSelector('#begin',{state:'visible',timeout:60000}).catch(()=>{});await pg.waitForTimeout(400);
 await pg.evaluate(()=>{const e=document.getElementById('begin');if(e)e.click();});await pg.waitForTimeout(900);
 await pg.waitForSelector('#cGo',{state:'visible',timeout:60000}).catch(()=>{});await pg.waitForTimeout(400);
 for(const sc of phase('creator'))for(const st of sc.steps)await run(st);
 await pg.evaluate(()=>{const e=document.getElementById('cGo');if(e)e.click();});await pg.waitForTimeout(300);
 for(const sc of phase('intro'))for(const st of sc.steps)await run(st);
 await pg.waitForTimeout(600);
 await pg.evaluate(()=>{try{__game.skip&&__game.skip();}catch(e){}});await pg.waitForTimeout(1800);
 for(let i=0;i<20;i++){if(await pg.evaluate(()=>!!(window.__game&&__game.P)))break;await pg.waitForTimeout(500);}
 for(const sc of phase(''))for(const st of sc.steps)await run(st);
 if(rec!=='0'){const v=pg.video();await ctx.close();const vp=await v.path();fs.renameSync(vp,out+'/'+tag+'.webm');}
 fs.writeFileSync(out+'/'+tag+'_marks.json',JSON.stringify(marks));
 console.log(JSON.stringify({tag,marks,log,errs:errs.slice(0,4)},null,0));await b.close();})();
