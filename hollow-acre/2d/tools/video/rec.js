const {chromium}=require('playwright');
// node rec.js URL OUTDIR TAG [x z] [plan]   plan = "Right:2600,Down:900,Right:1500"
(async()=>{const [url,out,tag,tx,tz,plan]=process.argv.slice(2);
 const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:960,height:540},recordVideo:{dir:out,size:{width:960,height:540}}});
 const t0=Date.now();const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.route('**/version.json*',r=>r.fulfill({body:'{}'}));
 await pg.goto(url);
 await pg.waitForFunction(()=>{const l=document.getElementById('loadScr');return !l||l.style.display==='none'||!l.offsetParent;},null,{timeout:90000}).catch(()=>{});
 await pg.waitForTimeout(800);
 for(const id of ['begin','cGo']){await pg.waitForSelector('#'+id,{state:'visible',timeout:60000}).catch(()=>{});await pg.waitForTimeout(400);await pg.evaluate(id=>{const e=document.getElementById(id);if(e)e.click();},id);await pg.waitForTimeout(900);}
 await pg.evaluate(()=>{try{__game.skip&&__game.skip();}catch(e){}});await pg.waitForTimeout(1800);
 await pg.evaluate(([x,z])=>{const S=__game.S;try{S.hour=10;S.tut&&(S.tut.off=true);}catch(e){}if(x!=='-')__game.tp(+x,+z);
   document.querySelectorAll('.toast,#toast').forEach(e=>e.remove());},[tx||'-',tz||'-']);
 await pg.waitForTimeout(1200);
 for(let i=0;i<20;i++){const ok=await pg.evaluate(()=>{const hb=document.querySelector('#hotbar,.hotbar,#bar,#slots');return !!(window.__game&&__game.P&&(!hb||hb.offsetParent!==null));});if(ok)break;await pg.waitForTimeout(500);}
 await pg.evaluate(([x,z])=>{if(x!=='-')__game.tp(+x,+z);},[tx||'-',tz||'-']);await pg.waitForTimeout(600);
 const p0=await pg.evaluate(()=>[__game.P.x,__game.P.z]);
 const tStart=Date.now()-t0;
 for(const step of (plan||'ArrowRight:2500,ArrowDown:1200,ArrowRight:1800').split(',')){const [k,ms]=step.split(':');await pg.keyboard.down(k);await pg.waitForTimeout(+ms);await pg.keyboard.up(k);}
 const p1=await pg.evaluate(()=>[__game.P.x,__game.P.z]);const tEnd=Date.now()-t0;
 await pg.screenshot({path:out+'/'+tag+'_end.png'});
 const v=pg.video();await ctx.close();const vp=await v.path();
 require('fs').renameSync(vp,out+'/'+tag+'.webm');
 console.log(JSON.stringify({tag,tStart,tEnd,p0,p1,errs:errs.slice(0,3)}));await b.close();})();
