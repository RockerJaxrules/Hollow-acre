const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const pg=await b.newPage({viewport:{width:900,height:600}});const errs=[];pg.on('pageerror',e=>errs.push('ERR '+e.message));await pg.route('**/fonts.googleapis.com/**',r=>r.abort());
 await pg.goto('http://localhost:8766/test2d.html');await pg.waitForFunction(()=>!document.getElementById('loadScr'),null,{timeout:90000});await pg.evaluate(()=>localStorage.clear());
 await pg.evaluate(()=>{document.getElementById('begin').click();document.getElementById('cGo').click();});await pg.waitForTimeout(300);await pg.evaluate(()=>__game.skip());await pg.waitForTimeout(800);
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);await ev("S.tut.off=true;S.readLetter=true;S.foundCabin=true;S.hour=12;S.energy=100;S.coins=500;window.__A=[]");
 const n=await ev("interact.length");console.log('interactables',n);
 const res={ok:[],fail:[],skip:[]};const seen={};const fs=require('fs');pg.on('framenavigated',f=>{if(f===pg.mainFrame())console.log('NAVIGATED at',cur);});let cur='';
 for(let i=0;i<n;i++){
   const info=await ev(`(()=>{const it=interact[${i}];if(it.npc!==undefined||it.mush||it.cat)return null;let lab='';try{lab=it.label();}catch(e){}
     // which room is it in?
     let room=null;for(const k in ROOMS){const R=ROOMS[k];if(R.ox!==undefined&&it.x>=R.ox-1&&it.x<=R.ox+R.w+1&&it.z>=R.oz-1&&it.z<=R.oz+R.d+1){room=k;break;}}
     return {lab,room,x:it.x,z:it.z,r:it.r};})()`);
   if(!info){continue;}const key=info.lab.split(/[\s(]/)[0]+'@'+(info.room||'out');seen[key]=(seen[key]||0)+1;if(seen[key]>2)continue;cur=i+' '+info.lab+'@'+info.room;fs.appendFileSync('taudit.log',cur+'\n');
   const r=await ev(`(()=>{const it=interact[${i}];const room=${JSON.stringify(info.room)};S.room=room;if(room){const R=ROOMS[room];P.x=R.ox+(R.door||R.w/2);P.z=R.oz+R.d-1;}
     if(it.on&&!it.on())return 'off';
     // a free spot near it to start from
     let start=null;for(const d of [2.6,2,3.2,1.6,4])for(const [dx,dz] of [[0,1],[1,0],[-1,0],[.7,.7],[-.7,.7],[0,-1]]){const p={x:it.x+dx*d,z:it.z+dz*d};const q={x:p.x,z:p.z};collide(q,.3);if(Math.hypot(q.x-p.x,q.z-p.z)<.01&&!(typeof LAYERS!=='undefined'&&!room&&LAYERS.water(p.x,p.z))){start=p;break;}if(start)break;}
     if(!start)return 'nostart';P.x=start.x;P.z=start.z;P.anim=null;S.paused=false;
     window.__hit=false;if(!it.__wrapped){const a=it.act;it.act=function(){window.__hit=true;try{return a.apply(this,arguments);}catch(e){window.__hit='threw '+e.message;}};it.__wrapped=1;}
     const T={kind:'item',it,x:it.x,z:it.z,r:Math.min(1.1,(it.r||1)*.8),reach:(it.r||1)+.3,mode:'interact'};tapGo(T);return 'go';})()`);
   if(r!=='go'){res.skip.push(`${info.lab}@${info.room||'out'}:${r}`);continue;}
   for(let t=0;t<40;t++){await pg.waitForTimeout(150);if(await ev("window.__hit||!TAP.auto"))break;}
   await pg.waitForTimeout(150);const hit=await ev("window.__hit");const where=await ev("P.x.toFixed(1)+','+P.z.toFixed(1)");
   (hit===true?res.ok:res.fail).push(`${info.lab}@${info.room||'out'} (${info.x.toFixed(1)},${info.z.toFixed(1)}) r${info.r} ${hit===true?'':'player '+where+' '+(hit||'')}`);
   // put things back
   await ev("for(const s of document.querySelectorAll('.sheet'))s.hidden=true;['note','talk','shop','bag','craft','scene'].forEach(id=>{const e=$(id);if(e)e.hidden=true;});S.paused=false;if(S.mode!=='play'){S.mode='play';}fade&&fade(0);P.anim=null;TAP.auto=null;");
 }
 console.log('OK',res.ok.length);console.log('FAIL',res.fail.length+'\n  '+res.fail.join('\n  '));console.log('SKIP',res.skip.length+'\n  '+res.skip.slice(0,40).join('\n  '));
 console.log(errs.slice(0,5).join('\n')||'no errors');await b.close();})();
