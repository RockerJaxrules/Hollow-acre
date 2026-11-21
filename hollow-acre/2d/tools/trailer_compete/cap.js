// Competitive-mode trailer: capture every shot frame by frame on a fake clock (smooth 30 fps however slow the browser is).
//   node trailer_cmp/cap.js <outdir> [preview]      preview: 3 frames per shot to check framing      ONLY=a,b to capture some
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {SETUP}=require('./scen.js');
const OUT=process.argv[2];const PREVIEW=process.argv[3]==='preview';const ONLY=process.env.ONLY?process.env.ONLY.split(','):null;
const FPS=30,DT=1000/FPS;
const HIDE=`#arrow,#joy,#joyHint,#buttons,#saved,#fsBtn,#sndBtn,#fsX,#actChip,#fsTip,#placeBar,#htip,#maecard,#tut,#skip,#lsBar,#lessonBar,#menuBtn,#objective,#objBar{display:none!important}#objective{visibility:hidden!important}`;
// a pixel cursor and the ring a click leaves
const CURSOR=`{const c=document.createElement('div');c.id='tcur';c.style.cssText='position:fixed;left:0;top:0;width:22px;height:30px;z-index:99999;pointer-events:none;image-rendering:pixelated;display:none';
  const rows=['X','XX','XWX','XWWX','XWWWX','XWWWWX','XWWWWWX','XWWWWWWX','XWWWWWWWX','XWWWWWXXXX','XWWXWWX','XWX XWWX','XX  XWWX','X    XWWX','     XWWX','      XX'];
  const cv=document.createElement('canvas');cv.width=11;cv.height=16;const g=cv.getContext('2d');rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch===' ')return;g.fillStyle=ch==='X'?'#1a1210':'#f4e6c8';g.fillRect(x,y,1,1);}));
  cv.style.cssText='width:22px;height:32px;image-rendering:pixelated';c.appendChild(cv);document.body.appendChild(c);
  const r=document.createElement('div');r.id='tring';r.style.cssText='position:fixed;z-index:99998;pointer-events:none;border:3px solid #f0a040;border-radius:50%;display:none';document.body.appendChild(r);
  window.curAt=(x,y)=>{c.style.display='block';c.style.left=x+'px';c.style.top=y+'px';};
  window.curHide=()=>{c.style.display='none';r.style.display='none';};
  window.ringAt=(x,y,k)=>{if(k>=1){r.style.display='none';return;}const s=10+k*44;r.style.display='block';r.style.left=(x-s/2)+'px';r.style.top=(y-s/2)+'px';r.style.width=s+'px';r.style.height=s+'px';r.style.opacity=String(1-k);};
  window.elAt=sel=>{const e=document.querySelector(sel);if(!e)return null;const b=e.getBoundingClientRect();return [b.left+b.width*.55,b.top+b.height*.62];};
  window.noteScroller=()=>{let e=document.getElementById('noteText');while(e&&e!==document.body){if(e.scrollHeight>e.clientHeight+4&&getComputedStyle(e).overflowY!=='visible')return e;e=e.parentElement;}return null;};}`;
// world shots: where, when, what the player does   (the friend, Sam, is a second farmer drawn the way the game draws a friend)
const W={
 farm:{sec:3.6,setup:`S.hour=8.6;P.x=binPos.x-3.6;P.z=binPos.z+1.6;P.dir='E';P.fx=1;P.fz=0;camSet(binPos.x-1.2,binPos.z+.6);samAt(binPos.x+3.4,binPos.z+2.8,'W');`,
   each:{0:`camPan(binPos.x-1.4,binPos.z+.6,binPos.x-.2,binPos.z+.2,3.6)`,4:`walkTo(binPos.x-.6,binPos.z+1.1,.62)`,6:`samWalk(binPos.x+1.4,binPos.z+1.5,2.2)`}},
 square:{sec:4.2,setup:`S.hour=10.4;bwSigns();P.x=48.6;P.z=5.2;P.dir='N';P.fx=0;P.fz=-1;camSet(47.6,1.2);samAt(42.6,0.4,'E');townAt();`,
   each:{0:`camPan(47.4,1.3,47.8,0.5,4.2)`,4:`walkTo(50.4,-0.7,.62)`,10:`samWalk(44.9,-0.7,1.5)`}},
 night:{sec:3.4,setup:`S.hour=22.6;window.__hfreeze=false;S.fuel=100;sputCD=99;sputT=0;P.x=-1.3;P.z=9.6;P.dir='S';P.fx=0;P.fz=1;H.state='gone';H.vis=false;H.timer=99;camSet(-1.3,9.0);samGone();`,
   each:{0:`camFollow(0,-2.3,2)`,2:`walkLine(-1.3,13.0,.5)`,16:`H.x=P.x+2.6;H.z=P.z-1.4;collide(H,.4);H.state='stalk';H.vis=true;H.alpha=1;H.rise=.4;H.crawl=0;H.burn=0;H.stung=false;H.grace=0;H.spd=1.6;H.t=0;`}},
};
// UI shots: the ledger and the Grange board, worked by a cursor.  acts: [frame, 'move', selector, frames] [frame,'click',selector] [frame,'js',code]
const U={
 prices:{sec:3.8,setup:`MK().sat.pumpkin=0;MK().prev.pumpkin=1;mkOpen();`,acts:[[0,'js','curHide()'],...Array.from({length:9},(_,i)=>[10+i*9,'js',`MK().prev.pumpkin=mkMult('pumpkin');MK().sat.pumpkin+=3;S.ship.push({t:'P',id:'pumpkin',value:18,by:'Jax'});mkOpen();SFX.coin&&SFX.coin();`])]},
 deliver:{sec:4.0,setup:`deliverSetup();mkOpen();`,acts:[[0,'js','curAt(980,640)'],[2,'move','button[data-mk="901"]',26],[34,'click','button[data-mk="901"]']]},
 stolen:{sec:4.2,setup:`stolenSetup();mkOpen();`,acts:[[0,'js','curAt(760,420)'],[2,'move','button[data-mk="902"]',22],[26,'js',`MK().contracts.find(c=>c.id===902).taken='the Dunn boys';MK().contracts.find(c=>c.id===902).by='rival';`],[30,'click','button[data-mk="902"]'],[66,'scroll',260,40]]},
 ledger:{sec:4.8,setup:`bwOpen('own');`,acts:[[0,'js','curAt(900,560)'],[2,'move',`[data-bw*='"p":"cheap"']`,20],[24,'click',`[data-bw*='"p":"cheap"']`],[44,'scroll',150,24],[70,'move',`[data-bw*='"k":"courier"']`,22],[96,'click',`[data-bw*='"k":"courier"']`]]},
 poach:{sec:4.0,setup:`bwPoachOdds=()=>.99;bwOpen('town');noteScroller()&&(noteScroller().scrollTop=200);`,acts:[[0,'js','curAt(700,500)'],[2,'move',`[data-bw*='"a":"poach","w":"rosa"']`,24],[30,'click',`[data-bw*='"a":"poach","w":"rosa"']`]]},
 deal:{sec:4.0,setup:`dealSetup();bwOpen('deals');`,acts:[[0,'js','curAt(800,560)'],[2,'move','input[data-bwunit]',18],[22,'js',`{const i=document.querySelector('input[data-bwunit]');i.value=String(Math.max(1,(+i.value)-3));}`],[30,'move','button[data-bwbid]',16],[48,'click','button[data-bwbid]']]},
 clean:{sec:3.2,setup:`bwOpen('own');noteScroller()&&(noteScroller().scrollTop=99999);`,acts:[[0,'js','curAt(900,500)'],[2,'move',`[data-bw*='"k":"supper"']`,22],[28,'click',`[data-bw*='"k":"supper"']`]]},
 dirty:{sec:4.6,setup:`BW().shops.Jax.caught=9;bwOpen('town');{const e=document.querySelector("[data-bw*='\\"t\\":\\"Sam\\"']");const sc=noteScroller();if(e&&sc)sc.scrollTop+=e.getBoundingClientRect().top-560;}`,
   acts:[[0,'js','curAt(760,520)'],[2,'move',`[data-bw*='"k":"spoil"'][data-bw*='"t":"Sam"']`,22],[26,'click',`[data-bw*='"k":"spoil"'][data-bw*='"t":"Sam"']`],[50,'click',`[data-bw*='"k":"spoil"'][data-bw*='"t":"Sam"']`],[56,'js',`BW().shops.Jax.caught=1;`]]},
 purse:{sec:4.6,setup:`purseSetup();mkOpen();{const sc=noteScroller();if(sc)sc.scrollTop=99999;}`,acts:[[0,'js','curHide()'],[34,'js',`S.day=15;mkWeek();mkOpen();{const sc=noteScroller();if(sc)sc.scrollTop=99999;}SFX.coin&&SFX.coin();`]]},
};
const ORDER=['farm','prices','deliver','stolen','square','ledger','poach','deal','clean','dirty','night','purse'];
const HELP=`
 window.samLook={style:'long',beard:'',outfit:'shirt',pattern:'',hat:'cap',glasses:'',accessory:'',skin:'#c88a64',hair:'#2a1c16',eye:'#4a3a2a',shirt:'#3a6a8a',pants:'#4a4038',shoes:'#2a1a12',extra:'#8a6a3a',hatColor:'#6a2a22',acc:'#c8a03a'};
 window.SAM={peer:'sam1',isMe:false,updatedAt:Date.now(),presence:{v:2,n:'Sam',x:0,z:0,vx:0,vz:0,d:'S',c:'idle',r:'',day:S.day,lk:samLook,rf:-1,pid:'sam'}};
 CO.peers=[SAM];
 window.samAt=(x,z,d)=>{Object.assign(SAM.presence,{x,z,d,c:'idle',vx:0,vz:0});SAM.updatedAt=Date.now();delete PEER_RS.sam1;window.__sam=null;};
 window.samWalk=(x,z,spd)=>{window.__sam={x,z,spd};};
 window.samGone=()=>{SAM.presence.r='elsewhere';};
 window.samTick=dt=>{SAM.updatedAt=Date.now();const w=window.__sam,q=SAM.presence;if(!w){q.vx=q.vz=0;q.c='idle';return;}const dx=w.x-q.x,dz=w.z-q.z,L=Math.hypot(dx,dz);
   if(L<.05){window.__sam=null;q.c='idle';q.vx=q.vz=0;return;}const s=Math.min(L,w.spd*dt);q.x+=dx/L*s;q.z+=dz/L*s;q.vx=dx/L*w.spd;q.vz=dz/L*w.spd;q.c='walk';
   q.d=Math.abs(dx)>Math.abs(dz)?(dx>0?'E':'W'):(dz>0?'S':'N');};
 window.townAt=()=>{const ids=['silas','orla','bram','hob','vera','otto'];const sp=[[45.2,5.6,'E'],[51.6,6.4,'W'],[44.8,0.6,'S'],[53.0,-0.2,'W'],[46.4,4.0,'N'],[51.0,4.4,'N']];
   ids.forEach((id,i)=>{try{const n=npcById(id);if(!n)return;n.x=sp[i][0];n.z=sp[i][1];n.dir=sp[i][2];n.loc='out';n.vis=true;n.hold=6;}catch(e){}});};
 window.deliverSetup=()=>{const mk=MK();mk.contracts=mk.contracts.filter(c=>c.id<900);mk.contracts.unshift({id:901,who:'Coyle’s store',k:'pumpkin',n:6,pay:164,due:S.day+2,day:S.day,taken:''});
   S.basket=S.basket.filter(b=>b.kind!=='pumpkin');for(let i=0;i<8;i++)S.basket.push({kind:'pumpkin',value:18});};
 window.stolenSetup=()=>{const mk=MK();mk.contracts=mk.contracts.filter(c=>c.id<900||c.id===901);mk.contracts.splice(1,0,{id:902,who:'The Lamplighter',k:'turnip',n:9,pay:96,due:S.day+1,day:S.day,taken:''});
   S.basket=S.basket.filter(b=>b.kind!=='turnip');for(let i=0;i<9;i++)S.basket.push({kind:'turnip',value:6});};
 window.dealSetup=()=>{const B=BW();B.tenders=[];B.lastT=0;const T={id:++B.seq,who:'The Lamplighter',cat:'stand',n:4,days:6,due:S.day+1,ref:BW_REF.stand,bids:{},done:false};B.tenders.push(T);
   T.bids['ai:vance']={unit:13,bribe:0};T.bids['Sam']={unit:12,bribe:0};};
 window.purseSetup=()=>{const mk=MK();mk.earn={Jax:2140,Sam:1985};mk.rivals.forEach((r,i)=>r.earn=[1630,1720][i]||900);S.day=14;S.hour=7.6;mk.week=1;mk.prev={};};
`;
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1280,height:720},deviceScaleFactor:2});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 for(const p of [pg]){await p.route('**/fonts.googleapis.com/**',r=>r.abort());await p.route('**/version.json*',r=>r.abort());await p.route(/nostr|relay|degmods/,r=>r.abort());}
 await pg.clock.install({time:new Date('2026-10-04T10:00:00')});
 await pg.goto('http://localhost:8766/test2d_k.html');await pg.waitForFunction(()=>!document.getElementById('loadScr')&&window.__game&&__game.S.mode==='title',null,{timeout:120000});
 const ev=c=>pg.evaluate(c=>__game.ev(c),c);
 let fiTot=0;const log=[];
 const frame=async(name,k)=>{await pg.screenshot({path:path.join(OUT,`${name}_${String(k).padStart(4,'0')}.png`)});fiTot++;};
 const pause=async()=>{const nw=await pg.evaluate(()=>Date.now());await pg.clock.pauseAt(nw+20);};
 // ---- the rules screen first (the title is still up)
 await pause();
 await pg.addStyleTag({content:HIDE});await ev(CURSOR);
 if(!ONLY||ONLY.includes('rules')){
   await pg.evaluate(()=>{document.getElementById('mpBtn').click();});await pg.clock.runFor(500);await pg.evaluate(()=>{const h=document.getElementById('mpHost');h&&h.click();});await pg.clock.runFor(700);
   const N=Math.round(4.0*FPS);let from=[640,520],to=null,m0=0,m1=0;
   const acts=[[0,'move',`[data-k="play"][data-v="compete"]`,26],[32,'click',`[data-k="play"][data-v="compete"]`],[62,'move',`#mpGo`,30]];
   let cur=from.slice(),ring=null;
   for(let k=0;k<N;k++){for(const a of acts)if(a[0]===k){if(a[1]==='move'){const t=await ev(`elAt(${JSON.stringify(a[2])})`);if(t){from=cur.slice();to=t;m0=k;m1=k+a[3];}}
       if(a[1]==='click'){const t=await ev(`elAt(${JSON.stringify(a[2])})`);await ev(`document.querySelector(${JSON.stringify(a[2])}).click()`);ring={x:cur[0],y:cur[1],k:0};}}
     if(to&&k<=m1){const u=Math.min(1,(k-m0)/Math.max(1,m1-m0)),e=u*u*(3-2*u);cur=[from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e];}
     await ev(`curAt(${cur[0].toFixed(1)},${cur[1].toFixed(1)})`);if(ring){await ev(`ringAt(${ring.x},${ring.y},${ring.k/10})`);ring.k++;if(ring.k>10)ring=null;}
     await pg.clock.runFor(DT);if(!PREVIEW||k%40===0)await frame('rules',k);}
   log.push({name:'rules',frames:N});await ev('curHide()');}
 // ---- into the game: a world played against each other
 await pg.evaluate(()=>{const s=document.getElementById('mpScr');if(s)s.hidden=true;document.getElementById('begin').click();});await pg.clock.runFor(400);
 await pg.evaluate(()=>{const b=document.getElementById('cGo');b&&b.click();});
 for(let i=0;i<24;i++){await ev("try{__game.skip()}catch(e){}");await pg.clock.runFor(250);}
 console.log('setup',JSON.stringify(await ev(SETUP)));
 await ev(HELP);
 await pg.clock.runFor(2600);await ev("toastT=0;ui.toast.classList.remove('show');1");
 await ev(`window.__drive=null;{const _mi=mindInput;mindInput=function(mx,mz){const d=window.__drive;if(d&&d.i<d.pts.length&&!P.anim&&S.mode==='play'){const [tx,tz]=d.pts[d.i];const dx=tx-P.x,dz=tz-P.z,L=Math.hypot(dx,dz);if(L<.16){d.i++;return _mi(0,0);}const k=d.k*Math.min(1,L*3+.3);return _mi(dx/L*k,dz/L*k);}return _mi(mx,mz);};}
   window.walkTo=(x,z,k)=>{let p=null;try{p=navPath(P.x,P.z,x,z);}catch(e){}const pts=(p&&p.length?p.map(q=>[q[0],q[1]]):[]);pts.push([x,z]);window.__drive={pts,i:0,k:k||.7};};
   window.camSet=(x,z)=>{cine={cam:{x,z}};};
   window.walkLine=(x,z,k)=>{window.__drive={pts:[[x,z]],i:0,k:k||.7};};
   window.__nohl=true;{const _cc=computeContext;computeContext=function(){const r=_cc.apply(this,arguments);if(window.__nohl)hlTile=null;return r;};}
   window.camPan=(x0,z0,x1,z1,dur)=>{const st={t:0};cine={cam:{x:x0,z:z0},update(dt){st.t+=dt;const u=Math.min(1,st.t/dur),e=u*u*(3-2*u);this.cam.x=x0+(x1-x0)*e;this.cam.z=z0+(z1-z0)*e;}};};
   window.camFollow=(ox,oz,lag)=>{const c=cine&&cine.cam?{x:cine.cam.x,z:cine.cam.z}:{x:P.x+ox,z:P.z+oz};cine={cam:c,update(dt){const k=1-Math.exp(-dt*(lag||2));this.cam.x+=(P.x+ox-this.cam.x)*k;this.cam.z+=(P.z+oz-this.cam.z)*k;}};};
   {const _h=hollowUpdate;hollowUpdate=function(dt){if(window.__hfreeze){H.t+=dt;H.ft+=dt;return 2;}return _h(dt);};}
   {const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);try{samTick(dt);}catch(e){}};}
   S.readLetter=true;S.foundCabin=true;S.tut&&(S.tut.off=true);S.mode='play';S.paused=false;document.querySelectorAll('#tut,#maecard').forEach(e=>e.style.display='none');1`);
 for(const name of ORDER){if(ONLY&&!ONLY.includes(name))continue;
   await ev("if(S.room)leaveRoom(true);");await ev("$('note').hidden=true;$('talk').hidden=true;cine=null;window.__drive=null;S.mode='play';S.paused=false;H.state='gone';H.timer=999;H.vis=false;cam.shake=0;flashT=0;MKUI.open=false;BWUI.open=false;window.__sam=null;SAM.presence.r='';curHide();toastT=0;ui.toast.classList.remove('show');1");
   const N0=errs.length;
   if(W[name]){const s=W[name];await ev(s.setup);await pg.clock.runFor(s.settle||1200);
     const N=Math.round(s.sec*FPS);
     for(let k=0;k<N;k++){if(s.each&&s.each[k])await ev(s.each[k]);await pg.clock.runFor(DT);if(!PREVIEW||k%45===0)await frame(name,k);}
     await ev('cine=null;window.__drive=null;');log.push({name,frames:N});}
   else{const s=U[name];await ev(s.setup);await pg.clock.runFor(300);
     const N=Math.round(s.sec*FPS);let cur=null,from=null,to=null,m0=0,m1=0,ring=null,scr=null;
     for(let k=0;k<N;k++){for(const a of s.acts)if(a[0]===k){
         if(a[1]==='js')await ev(a[2]);
         if(a[1]==='move'){const t=await ev(`elAt(${JSON.stringify(a[2])})`);if(t){from=(cur||t).slice();to=t;m0=k;m1=k+a[3];}else console.log('no target',name,a[2]);}
         if(a[1]==='click'){const ok=await ev(`{const e=document.querySelector(${JSON.stringify(a[2])});e?(e.click(),true):false}`);if(!ok)console.log('no click',name,a[2]);if(cur)ring={x:cur[0],y:cur[1],k:0};}
         if(a[1]==='scroll'){const s0=await ev('noteScroller()?noteScroller().scrollTop:0');scr={s0,s1:s0+a[2],k0:k,k1:k+a[3]};}}
       if(cur===null){const c=await ev("(()=>{const e=document.getElementById('tcur');return e.style.display==='block'?[parseFloat(e.style.left),parseFloat(e.style.top)]:null})()");if(c)cur=c;}
       if(to&&k<=m1){const u=Math.min(1,(k-m0)/Math.max(1,m1-m0)),e=u*u*(3-2*u);cur=[from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e];}
       if(scr&&k<=scr.k1){const u=Math.min(1,(k-scr.k0)/Math.max(1,scr.k1-scr.k0)),e=u*u*(3-2*u);await ev(`noteScroller()&&(noteScroller().scrollTop=${Math.round(scr.s0+(scr.s1-scr.s0)*e)})`);
         if(to&&k>m1){}}
       if(cur)await ev(`curAt(${cur[0].toFixed(1)},${cur[1].toFixed(1)})`);if(ring){await ev(`ringAt(${ring.x},${ring.y},${ring.k/10})`);ring.k++;if(ring.k>10)ring=null;}
       await pg.clock.runFor(DT);if(!PREVIEW||k%40===0)await frame(name,k);}
     await ev('curHide()');log.push({name,frames:N});}
   if(errs.length>N0)console.log('errors in',name,errs.slice(N0,N0+3));}
 fs.writeFileSync(path.join(OUT,'log.json'),JSON.stringify({log,errs:errs.slice(0,8)},null,1));console.log(JSON.stringify(log),'errs',errs.length,errs.slice(0,3));await b.close();})();
