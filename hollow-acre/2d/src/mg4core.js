/* ================= the making games, fourth generation (built from scratch): a bigger, sharper stage (320x180), real physics,
   particles and light, sounds made for each action, and steps you play with your hands the way the job is really done:
   drag the saw, swing the hammer, push the plane, chop, tilt to pour, keep the pot on the boil.
   Recipes are lists of steps (mg4games.js); this file is the stage, the sounds and the flow:
   a title for each step, a demo the first time you meet it, Ready / Go, three tries (the best counts), the reveal. ================= */
const MG4R={};          // recipe key -> {scene, steps:[{k:'saw', ...}], reveal(K,t), icon}
const S4={};            // step kinds: (sp, K) -> {how, hint, st, update(dt,I), draw(t), auto(dt,I), done, score}
const MG4={on:false};
// the pixel font gets the punctuation the plaques need
Object.assign(PXFONT,{'!':'010010010000010',':':'000010000010000','/':'001001010100100','-':'000000111000000','+':'000010111010000',"'":'010010000000000','’':'010010000000000','?':'110001010000010',',':'000000000010100','%':'101001010100101'});
// ---------------------------------------------------------------- sounds for every action
const MS={
  loop(type,f,q){if(!A.ok||!A.ctx)return {set(){},stop(){}};const c=A.ctx;const s=c.createBufferSource();s.buffer=A.noise;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||1;
    const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(A.master);s.start(0,Math.random());let dead=false;
    return {set(v,f2,q2){if(dead)return;g.gain.setTargetAtTime(Math.max(0,v),c.currentTime,.04);if(f2)fl.frequency.setTargetAtTime(f2,c.currentTime,.05);if(q2)fl.Q.setTargetAtTime(q2,c.currentTime,.05);},
      stop(){if(dead)return;dead=true;g.gain.setTargetAtTime(0,c.currentTime,.05);setTimeout(()=>{try{s.stop();}catch(e){}},400);}};},
  saw(dir,k){k=k||1;A.hiss(.17,.16*k,'bandpass',dir>0?2600:1800,{q:3,slide:dir>0?3400:1300,wobble:1});A.hiss(.12,.06*k,'highpass',5200,{});},
  rasp(){A.hiss(.1,.12,'bandpass',3000,{q:1.5,wobble:1});},
  tink(p){A.tone(1200+p*900,.18,'triangle',.07,{slide:900+p*600});A.tone(2900+p*600,.06,'sine',.04);A.hiss(.03,.18,'highpass',3500);},
  thunk(){A.tone(150,.16,'sine',.3,{slide:70});A.hiss(.06,.2,'lowpass',700);},
  knock(){A.tone(220,.09,'sine',.22,{slide:120});A.hiss(.04,.14,'bandpass',1200,{q:1});},
  chop(){A.hiss(.035,.32,'bandpass',2200,{q:1});A.tone(120,.11,'sine',.32,{slide:60});A.hiss(.05,.1,'bandpass',600,{delay:.02});},
  crunch(){for(let k=0;k<3;k++)A.hiss(.035,.16,'bandpass',900+Math.random()*1600,{q:2,delay:k*.025});},
  shave(){A.hiss(.22,.12,'bandpass',4200,{q:.7,slide:2400,wobble:1});},
  whoosh(){A.hiss(.3,.22,'bandpass',260,{slide:1300,q:.8});},
  plop(){A.tone(480,.13,'sine',.18,{slide:150});},
  pop(){A.tone(820,.05,'sine',.14,{slide:380});},
  drip(){A.tone(1500,.07,'sine',.07,{slide:700});},
  sizzleHit(){A.hiss(.45,.2,'highpass',3200,{wobble:1});},
  steam(){A.hiss(1.1,.28,'highpass',2400,{slide:6500});},
  anvil(p){p=p||1;[1,2.76,5.4].forEach((m,i)=>A.tone(390*p*m,1.1-.25*i,'sine',.13/(i+1),{verb:1}));A.hiss(.03,.3,'highpass',4200);},
  snip(){A.hiss(.03,.22,'highpass',5200);A.tone(2600,.03,'square',.025);},
  rustle(){A.hiss(.13,.11,'bandpass',2600,{q:.6,wobble:1});},
  good(){A.tone(784,.12,'triangle',.08);A.tone(1047,.16,'triangle',.07,{delay:.07});},
  perfect(){A.tone(784,.1,'triangle',.08);A.tone(1047,.1,'triangle',.08,{delay:.06});A.tone(1568,.22,'triangle',.07,{delay:.12});},
  miss(){A.tone(160,.22,'sawtooth',.06,{slide:95,filter:['lowpass',900]});},
  tick(){A.tone(1900,.025,'square',.025);},
  fanfare(q){const n=q>.9?[523,659,784,1047]:q>.6?[523,659,784]:[523,587];n.forEach((f,i)=>A.tone(f,.28,'triangle',.08,{delay:i*.11}));if(q>.9)A.tone(1568,.5,'sine',.05,{delay:.5,verb:1});},
};
// ---------------------------------------------------------------- each room's own quiet sounds, under the work
const MAMB={workshop:{bed:['bandpass',380,.6,.018],ev:[[3.5,()=>A.tone(2600+Math.random()*900,.07,'sine',.018,{slide:3400})],[6,()=>A.tone(180+Math.random()*60,.25,'sawtooth',.008,{filter:['lowpass',500]})]]},
  kitchen:{bed:['lowpass',300,.7,.015],ev:[[1,()=>A.tone(2100,.012,'square',.006)],[7,()=>A.tone(3000+Math.random()*600,.06,'sine',.012,{slide:3600})]]},
  stove:{bed:['lowpass',260,.7,.03],ev:[[1,()=>A.tone(2100,.012,'square',.006)],[2.5,()=>A.hiss(.04,.03,'highpass',3000)]]},
  forge:{bed:['lowpass',220,.8,.045],ev:[[.8,()=>A.hiss(.03,.04,'highpass',2600)],[4,()=>A.tone(90,.4,'sine',.02,{slide:70})]]},
  sewing:{bed:['lowpass',320,.6,.012],ev:[[1,()=>A.tone(1800,.012,'square',.005)],[9,()=>A.hiss(.5,.012,'bandpass',600,{slide:300})]]},
  yard:{bed:['bandpass',500,.5,.03],ev:[[2.2,()=>{const f=2400+Math.random()*1200;A.tone(f,.08,'sine',.02,{slide:f*1.3});A.tone(f*1.1,.08,'sine',.016,{delay:.12,slide:f*.9});}],[11,()=>A.tone(160,.6,'sawtooth',.01,{slide:130,filter:['lowpass',400]})]]},
  barn:{bed:['bandpass',420,.5,.025],ev:[[3,()=>{for(let k=0;k<3;k++)A.tone(700+Math.random()*200,.06,'square',.008,{delay:k*.11,filter:['bandpass',900,3]});}],[5,()=>A.hiss(.4,.015,'bandpass',800)]]}};
function mg4Ambience(scene){const M=MAMB[scene]||MAMB.workshop;const bed=MS.loop(M.bed[0],M.bed[1],M.bed[2]);bed.set(M.bed[3]);const timers=M.ev.map(([every,fn])=>{let h;const go=()=>{h=setTimeout(()=>{try{fn();}catch(e){}go();},every*1000*(.6+Math.random()*.8));};go();return ()=>clearTimeout(h);});
  return {stop(){bed.stop();timers.forEach(f=>f());}};}
// ---------------------------------------------------------------- the window
{const css=document.createElement('style');css.textContent=`
#mg4{position:fixed;inset:0;z-index:63;display:none;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,rgba(20,10,4,.4),rgba(6,3,1,.84))}
#mg4 .box{display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px 16px 12px;
  background:radial-gradient(circle at 9px 9px,#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),radial-gradient(circle at calc(100% - 9px) 9px,#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),
  radial-gradient(circle at 9px calc(100% - 9px),#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),radial-gradient(circle at calc(100% - 9px) calc(100% - 9px),#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),
  repeating-linear-gradient(90deg,#7a4a20 0 4px,#6a3e1a 4px 5px,#7e4e22 5px 9px,#6a3e1a 9px 10px);
  box-shadow:0 0 0 3px #1a0e06,0 0 0 6px #b8823c,0 0 0 9px #3a2410,0 12px 0 9px rgba(0,0,0,.4),inset 0 2px 0 #b8823c,inset 0 -2px 0 #4a2a10}
#mg4 .t{background:#f2e2bc;color:#3a2410;font:18px 'Hollow Pixel',monospace;padding:3px 16px;box-shadow:0 0 0 2px #5a3418,0 0 0 4px #b8823c,0 0 0 6px #3a2410,0 4px 0 6px rgba(0,0,0,.3)}
#mg4 canvas{width:min(94vw,880px,calc((100vh - 170px)*16/9));aspect-ratio:16/9;image-rendering:pixelated;touch-action:none;cursor:pointer;background:#1a110a;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #4a2a10,0 0 0 6px #b8823c,0 0 0 8px #1a0e06}
#mg4 .h{color:#fff4dc;text-shadow:1px 1px 0 #000;background:rgba(26,14,6,.6);padding:4px 12px;box-shadow:0 0 0 1px #4a2a10;font:13px 'Hollow Pixel',monospace;text-align:center;max-width:min(94vw,880px)}
#mg4 .h b{color:#ffd27a}#mg4 .row{display:flex;gap:8px}`;document.head.appendChild(css);
  const d=document.createElement('div');d.id='mg4';d.innerHTML='<div class="box"><div class="t" id="mg4T"></div><canvas id="mg4C" width="320" height="180"></canvas><div class="h" id="mg4H"></div><div class="row"><button class="close" id="mg4Skip">Skip</button></div></div>';document.body.appendChild(d);}
// ---------------------------------------------------------------- the kit: drawing, text, particles, judging
function mg4Kit(g){const W=320,H=180;const K=caKit(g,W,H);K.g=g;K.W=W;K.H=H;K.parts=[];K.pops=[];K.shk=0;K.flash=0;K.combo=0;K.best=0;
  K.fine=matchMedia('(pointer:fine)').matches;
  K.text=(t,x,y,c,sc,al)=>{if(typeof sc==='string'){al=sc;sc=1;}t=String(t).toUpperCase();sc=sc||1;const w=t.length*4*sc;let X=Math.round(al==='l'?x:al==='r'?x-w:x-w/2);
    for(const ch of t){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){K.px(X+i*sc+sc,y+j*sc+sc,sc,sc,'#140a04');}X+=4*sc;}
    X=Math.round(al==='l'?x:al==='r'?x-w:x-w/2);for(const ch of t){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1')K.px(X+i*sc,y+j*sc,sc,sc,c);X+=4*sc;}};
  // text outlined all round in dark plum, for verdicts that must read on any ground
  K.textO=(t,x,y,c,sc)=>{sc=sc||1;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1]]){const u=String(t).toUpperCase(),w=u.length*4*sc;let X=Math.round(x-w/2)+dx*sc;for(const ch of u){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1')K.px(X+i*sc,y+dy*sc+j*sc,sc,sc,'#1a0c12');X+=4*sc;}}
    const u=String(t).toUpperCase(),w=u.length*4*sc;let X=Math.round(x-w/2);for(const ch of u){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1')K.px(X+i*sc,y+j*sc,sc,sc,c);X+=4*sc;}};
  // a label that reads on any wall: the same letters on a dark rounded strip
  K.label=(t,x,y,c,sc,al)=>{if(typeof sc==='string'){al=sc;sc=1;}t=String(t);sc=sc||1;const w=t.length*4*sc,X=Math.round(al==='l'?x:al==='r'?x-w:x-w/2);K.pa(X-3,y-2,w+5,5*sc+4,'#140a04',.62);K.pa(X-2,y-3,w+3,1,'#140a04',.62);K.pa(X-2,y+5*sc+2,w+3,1,'#140a04',.62);K.text(t,x,y,c,sc,al);};
  // particles: chips, dust, sparks, drops, steam, curls; each with gravity, drag, life and a colour ramp
  K.emit=(x,y,n,o)=>{o=o||{};for(let i=0;i<n;i++){const a=(o.ang!=null?o.ang:-Math.PI/2)+(Math.random()-.5)*(o.spread!=null?o.spread:2.4),v=(o.v||60)*(.4+Math.random()*.8);
    K.parts.push({x:x+(Math.random()-.5)*(o.w||0),y:y+(Math.random()-.5)*(o.h||0),vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:(o.life||.8)*(.6+Math.random()*.6),g:o.g!=null?o.g:220,drag:o.drag||0,
      c:o.c||['#e8c890'],sz:o.sz||1,kind:o.kind||'dot',glow:o.glow,hi:o.hi,rot:Math.random()*6});}};
  K.burst=(x,y,n,c,sp)=>K.emit(x,y,n,{c:[c],v:sp||70});
  K.judge=(s,x,y,quiet)=>{const J=s>=.95?['PERFECT','#ffd27a']:s>=.6?['GOOD','#9be07a']:s>=.25?['OK','#e8c070']:['MISS','#e8542a'];
    for(let k=K.pops.length-1;k>=0;k--){const p=K.pops[k];if(Math.abs(p.x-x)<40&&Math.abs(p.y-y)<24)K.pops.splice(k,1);}   // a new verdict replaces the one still rising there
    if(s>=.6){K.combo++;K.best=Math.max(K.best,K.combo);}else K.combo=0;
    K.pops.push({txt:J[0]+(K.combo>=3&&s>=.6?' x'+K.combo:''),c:J[1],x:Math.max(30,Math.min(W-30,x)),y:Math.max(12,y),t:0,big:s>=.95});
    if(!quiet){if(s>=.95){MS.perfect();K.flash=.3;K.shk=.14;K.emit(x,y,10,{c:['#fff4c0','#ffd27a'],v:90,g:60,life:.6});}else if(s>=.6)MS.good();else if(s<.25)MS.miss();}};
  // the bar at the right edge shows the whole recipe: the steps done plus this step's share, with a tick between steps
  K.meter=(p,acc,x,y,h)=>{const whole=x==null&&K.run&&K.run.n>1;x=x==null?W-10:x;y=y==null?16:y;h=h||120;p=Math.max(0,Math.min(1,p||0));if(whole)p=(K.run.i+p)/K.run.n;K.px(x-1,y-1,8,h+2,'#1a0e06');K.px(x,y,6,h,'#2a1608');if(whole)for(let k=1;k<K.run.n;k++)K.px(x-2,y+h-Math.round(h*k/K.run.n),10,1,'#6a4a20');
    const ph=Math.round(p*h),q=acc==null?p:acc;const c=q<.4?'#d84a2a':q<.7?'#e8b030':'#7cc04a';K.px(x+1,y+h-ph,4,ph,c);if(ph)K.px(x+1,y+h-ph,4,1,'#fff4c0');
    if(q>=.7&&ph>2)K.px(x+1+((Math.floor(performance.now()/90))%4),y+h-ph+1,1,1,'#ffffff');};
  // a carved gauge like the fishing one: frame, a track, a zone, a needle
  K.gauge=(x,y,w,h,zoneLo,zoneHi,val,o)=>{o=o||{};const vert=h>w;K.px(x-2,y-2,w+4,h+4,'#1a0e06');K.px(x-1,y-1,w+2,h+2,'#7a4a20');K.px(x-1,y-1,w+2,1,'#b8823c');K.px(x,y,w,h,o.bg||'#20140a');
    if(vert){const z0=y+h*(1-zoneHi),z1=y+h*(1-zoneLo);K.px(x,z0,w,z1-z0,o.zone||'#2c5a1c');K.px(x,z0,w,1,'#9be07a');K.px(x,z1-1,w,1,'#1c3a12');const vy=y+h*(1-Math.max(0,Math.min(1,val)));K.px(x-1,vy-1,w+2,3,'#1a0e06');K.px(x,vy,w,1,o.needle||'#fff4c0');}
    else{const z0=x+w*zoneLo,z1=x+w*zoneHi;K.px(z0,y,z1-z0,h,o.zone||'#2c5a1c');K.px(z0,y,1,h,'#9be07a');const vx=x+w*Math.max(0,Math.min(1,val));K.px(vx-1,y-2,3,h+4,'#1a0e06');K.px(vx,y-1,1,h+2,o.needle||'#fff4c0');}
    for(const [cx,cy] of [[x-2,y-2],[x+w,y-2],[x-2,y+h],[x+w,y+h]]){K.px(cx,cy,2,2,'#e8c060');}};
  K.plaque=(txt,col,y,w,sc)=>{sc=sc||1;w=w||Math.max(80,txt.length*4*sc+28);const bx=Math.round(160-w/2),bh=12+6*sc;K.pa(bx+2,y+3,w,bh,'#000',.35);K.px(bx-1,y-1,w+2,bh+2,'#1a0e06');K.px(bx,y,w,bh,'#7a4a20');
    for(let x=2;x<w;x+=5)K.px(bx+x,y,1,bh,'#6a3e1a');K.px(bx,y,w,1,'#b8823c');K.px(bx,y+bh-1,w,1,'#4a2a10');for(const [cx,cy] of [[bx+2,y+2],[bx+w-4,y+2],[bx+2,y+bh-4],[bx+w-4,y+bh-4]]){K.px(cx,cy,2,2,'#e8c060');K.px(cx,cy,1,1,'#fff2c8');}
    K.px(bx+6,y+4,w-12,bh-8,'#2a1608');K.text(txt,160,y+Math.round((bh-5*sc)/2),col,sc);};
  // the hand of the demo
  K.hand=(x,y,pressed)=>{const P=['..##....','.#..#...','.#..#...','.#..###.','##..#..#','#.#....#','#......#','.#.....#','..#...#.','...###..'];const dy=pressed?2:0;
    P.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='#')K.px(x+i,y+j+dy,1,1,'#1a0e06');else if(j>0&&j<9&&i>0&&i<7&&r.slice(0,i).includes('#')&&r.slice(i).includes('#'))K.px(x+i,y+j+dy,1,1,'#f4e6c8');});
    if(pressed){g.strokeStyle='rgba(255,244,192,.85)';g.lineWidth=1;g.beginPath();g.arc(x+3,y+1,7,0,Math.PI*2);g.stroke();}};
  return K;}
// ---------------------------------------------------------------- running a recipe
const MG4_TRIES=3;
function mg4Run(def,name,done,icon){if(MG4.closeCur)MG4.closeCur(true);const box=$('mg4'),cv=$('mg4C'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;const W=320,H=180;const K=mg4Kit(g);
  const steps=def.steps;const run={i:0,scores:[],best:[],tries:[],name};S.cgTut=S.cgTut||{};A.init&&A.init();
  let cur=null,phase='title',pt=0,last=performance.now(),result=null,banner=null,reveal=0,ended=false;const I={x:160,y:90,down:false,pressed:false,released:false,dx:0,dy:0,side:0,ax:0,ay:0,demo:false};const AP={};
  box.style.display='flex';MG4.on=true;CG.on=true;S.paused=true;$('mg4T').textContent=name;
  const spd=()=>steps[run.i];
  const mk=demo=>{if(cur&&cur.stop)cur.stop();const sp=spd();cur=S4[sp.k](sp,K,run,def);cur.demo=demo;K.combo=0;window.__mg4cur=cur;
    // a step may keep its finish on its state
    if(cur.st&&!('done' in cur))Object.defineProperties(cur,{done:{get(){return !!cur.st.done;}},score:{get(){return cur.st.score||0;}}});};
  const hint=()=>{const sp=spd(),tr=run.tries[run.i]||0;$('mg4H').innerHTML=`<b>${steps.length>1?`${run.i+1}/${steps.length} · `:''}${sp.t||cur.title}.</b> ${cur.hint}${tr>0?` <span style="color:#e8b030">Try ${tr+1} of ${MG4_TRIES}</span>`:''}`;};
  const begin=()=>{mk(false);phase='title';pt=0;$('mg4H').innerHTML=`<b>${spd().t||cur.title}.</b>`;};
  const afterTitle=()=>{const k=spd().k;if(!S.cgTut['v4'+k]&&!window.CG_NO_TUT){mk(true);phase='demo';pt=0;$('mg4H').innerHTML=`<b>New: ${spd().t||cur.title}.</b> Watch how it’s done. ${cur.how}`;}else{phase='ready';pt=0;hint();}};
  const finish=()=>{if(result!==null)return;if(cur&&cur.stop)cur.stop();result=run.scores.reduce((a,b)=>a+b,0)/run.scores.length;reveal=.001;phase='reveal';MS.fanfare(result);
    $('mg4H').innerHTML=`<b>${result>.9?'Beautifully made.':result>.65?'Well made.':result>.35?'It’ll do.':'Rough, but it works.'}</b>${K.best>=4?` Best run: ${K.best} in a row.`:''}`;
    typeof cg3Card==='function'&&cg3Card(name,icon||def.icon,result);
    setTimeout(close,2200);};
  const close=quiet=>{if(ended)return;ended=true;try{amb.stop();}catch(e){}if(MG4.closeCur===close)MG4.closeCur=null;if(quiet===true){if(cur&&cur.stop)cur.stop();removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);return;}box.style.display='none';MG4.on=false;CG.on=false;S.paused=false;if(cur&&cur.stop)cur.stop();removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);
    cv.onpointerdown=cv.onpointermove=cv.onpointerup=cv.onpointercancel=null;done(result==null?.5:result);};
  const toXY=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];};
  const press=()=>{A.init&&A.init();if(result!==null)return;
    if(phase==='title'){afterTitle();return;}
    if(phase==='demo'){phase='your';pt=0;$('mg4H').innerHTML=`<b>Your turn.</b> ${cur.how} ${K.fine?'Click or press Space':'Tap'} to start.`;return;}
    if(phase==='your'){if(pt<.3)return;S.cgTut['v4'+spd().k]=1;mk(false);phase='ready';pt=0;hint();return;}
    if(phase!=='play')return;I.down=true;I.pressed=true;};
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);[I.x,I.y]=toXY(e);I.px=I.x;I.py=I.y;press();};
  cv.onpointermove=e=>{const [x,y]=toXY(e);I.x=x;I.y=y;I.ptrT=performance.now();};
  cv.onpointerup=cv.onpointercancel=()=>{if(I.down)I.released=true;I.down=false;};
  // keys held for steering (move the pan, guide the knife): A/D or arrows across, W/S or arrows up and down
  const HK={KeyA:'l',ArrowLeft:'l',KeyD:'r',ArrowRight:'r',KeyW:'u',ArrowUp:'u',KeyS:'d',ArrowDown:'d'};const held={l:0,r:0,u:0,d:0};
  const axes=()=>{I.ax=held.r-held.l;I.ay=held.d-held.u;};
  const kd=e=>{if(e.code==='Escape'){e.preventDefault();e.stopPropagation();while(run.scores.length<steps.length)run.scores.push(.5);finish();return;}
    if(HK[e.code]){e.preventDefault();e.stopPropagation();held[HK[e.code]]=1;axes();if(!e.repeat&&phase==='play'&&/KeyA|ArrowLeft|KeyD|ArrowRight/.test(e.code)){I.side=/KeyA|ArrowLeft/.test(e.code)?-1:1;I.sideT=performance.now();}return;}
    if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC'){e.preventDefault();e.stopPropagation();if(!e.repeat){I.key=true;press();}}};
  const ku=e=>{if(HK[e.code]){held[HK[e.code]]=0;axes();return;}if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC'){if(I.down)I.released=true;I.down=false;I.key=false;}};addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  $('mg4Skip').onclick=()=>{while(run.scores.length<steps.length)run.scores.push(.5);finish();};
  const amb=mg4Ambience(def.scene);MG4.closeCur=close;begin();
  const frame=now=>{if(ended)return;const dt=Math.min(.05,(now-last)/1000)*(window.CG2_SPEED||1);last=now;const t=now/1000;pt+=dt;
    window.CG2_NOW=result!==null?'reveal':phase==='play'?spd().k+':'+run.i:phase+':'+run.i;
    I.dx=I.x-(I.lx==null?I.x:I.lx);I.dy=I.y-(I.ly==null?I.y:I.ly);I.lx=I.x;I.ly=I.y;
    if(phase==='title'){if(pt>1.1)afterTitle();}
    else if(phase==='demo'){I.demo=true;cur.auto(dt,AP,t);cur.update(dt,AP.I||I,t);if(cur.done||pt>8){phase='your';pt=0;$('mg4H').innerHTML=`<b>Your turn.</b> ${cur.how} ${K.fine?'Click or press Space':'Tap'} to start.`;}}
    else if(phase==='ready'){if(pt>.9){phase='play';pt=0;I.pressed=I.released=false;}}
    else if(phase==='play'){I.demo=false;if(window.MG4_AUTO){cur.auto(dt,AP,t);cur.update(dt,AP.I||I,t);}else cur.update(dt,I,t);
      if(cur.done){const s=Math.max(0,Math.min(1,cur.score||0));window.__mg4last=+s.toFixed(2);const tr=run.tries[run.i]=(run.tries[run.i]||0)+1;run.best[run.i]=Math.max(s,run.best[run.i]||0);
        if(s<.5&&tr<MG4_TRIES){banner={txt:`Again: ${MG4_TRIES-tr} left`,c:'#e8b030',t:0};phase='retry';pt=0;}
        else{const b=run.best[run.i];run.scores[run.i]=b;banner={txt:b>.9?'Perfect':b>.65?'Good':b>.35?'Rough':'Ruined',c:b>.9?'#ffd27a':b>.65?'#9be07a':b>.35?'#e8c070':'#c04a2a',t:0};
          (b>.65?MS.good:MS.tick)();if(run.i<steps.length-1){phase='next';pt=0;}else{phase='done';setTimeout(finish,700);}}}}
    else if(phase==='retry'){if(pt>1.3){mk(false);phase='ready';pt=0;hint();}}
    else if(phase==='next'){if(pt>1){run.i++;begin();}}
    if(phase!=='demo'&&phase!=='play'&&cur&&cur.quiet)cur.quiet();
    I.pressed=false;I.released=false;I.side=0;
    // ---- draw
    g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
    if(K.shk>0){K.shk-=dt;g.setTransform(1,0,0,1,Math.round((Math.random()-.5)*3),Math.round((Math.random()-.5)*3));}
    if(reveal>0){reveal+=dt;MG4ART.scene(K,def.scene,t);MG4ART.light(K,def.scene,t);K.pa(0,0,W,H,'#000',.5);K.glow(160,84,90,'255,220,140',.35+Math.sin(t*4)*.05);
      def.reveal&&def.reveal(K,t);for(let i=0;i<12;i++){const a=t*1.4+i*.52,r2=56+Math.sin(t*3+i)*5;K.px(160+Math.cos(a)*r2,84+Math.sin(a)*r2*.55,2,2,'#fff4c0');}
      const q=result,stars=q>.9?3:q>.6?2:q>.3?1:0;for(let i=0;i<stars;i++)if(!run['st'+i]&&reveal-.3-i*.25>0){run['st'+i]=1;A.tone(880*[1,1.26,1.5][i],.25,'triangle',.07);A.tone(1760*[1,1.26,1.5][i],.15,'sine',.03,{delay:.03});K.emit(128+i*24+6,154,8,{c:['#fff4c0','#ffd27a'],v:50,g:80,life:.5});}K.pa(118,142,84,22,'#140c06',.75);for(let i=0;i<3;i++){const on=i<stars,pop=on?Math.min(1,Math.max(0,(reveal-.3-i*.25)*5)):1;if(on&&pop<=0)continue;cg3Star(K,128+i*24,148+(on?Math.round((1-pop)*-5):0),on);}}
    else{MG4ART.scene(K,spd().scene||def.scene,t);cur.draw(t,phase);MG4ART.light(K,spd().scene||def.scene,t);K.run={i:run.i,n:steps.length};cur.hud&&phase!=='title'&&cur.hud(t);}
    for(let k=K.parts.length-1;k>=0;k--){const p=K.parts[k];p.t+=dt;if(p.t>p.life){K.parts.splice(k,1);continue;}p.vx*=1-p.drag*dt;p.vy=p.vy*(1-p.drag*dt)+p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
      const u=p.t/p.life,c=p.c[Math.min(p.c.length-1,Math.floor(u*p.c.length))];if(p.kind==='smoke'){const z=Math.max(1,p.sz*(.5+Math.sin(u*Math.PI)*.8)),X=Math.round(p.x),Y=Math.round(p.y),zr=Math.round(z);for(let dy=-zr;dy<=zr;dy++){const w=Math.round(Math.sqrt(Math.max(0,z*z-dy*dy)));if(w<1)continue;K.px(X-w,Y+dy,2*w,1,c);if(dy<0&&dy>-zr)K.px(X-w,Y+dy,Math.max(1,w-1),1,p.hi||c);}}else if(p.kind==='steam'){const z=Math.max(1,Math.round(p.sz)),X=Math.round(p.x),Y=Math.round(p.y);g.globalAlpha=.35*(1-u);g.fillStyle=c;g.beginPath();g.rect(X-z+1,Y-z,2*z-2,2*z);g.rect(X-z,Y-z+1,2*z,2*z-2);g.fill('nonzero');g.globalAlpha=1;}else{g.globalAlpha=u>.75?(1-u)*4:1;K.px(p.x,p.y,p.sz,p.sz,c);g.globalAlpha=1;}}
    for(let k=K.pops.length-1;k>=0;k--){const p=K.pops[k];p.t+=dt;if(p.t>1){K.pops.splice(k,1);continue;}const yy=Math.round(p.y-p.t*18-(p.big?Math.sin(Math.min(1,p.t*8)*Math.PI)*4:0));K.textO(p.txt,p.x,yy,p.t>.7&&Math.floor(p.t*20)%2?'#fff4d8':p.c,p.big?2:1);}
    if(K.flash>0){K.flash-=dt;K.pa(0,0,W,H,'#fff6d0',Math.max(0,K.flash)*.6);}
    g.setTransform(1,0,0,1,0,0);
    if(reveal===0){
      if(phase==='title'){const u=Math.min(1,pt*5);K.pa(0,0,W,H,'#000',.35*u);K.plaque(spd().t||cur.title,'#ffd27a',Math.round(70-(1-u)*20),null,2);}
      if(phase==='demo'||(phase==='play'&&window.MG4_AUTO)){if(phase==='demo')K.plaque('Watch','#ffd27a',3,70);const hp=AP.hand||[150,150];K.hand(hp[0],hp[1],AP.press||AP.hold);}
      if(phase==='your'){K.pa(0,0,W,H,'#000',.45);K.plaque('Your turn','#9be07a',60,120,2);if(Math.floor(t*2.5)%2)K.text(K.fine?'Click or press Space to start':'Tap to start',160,98,'#f4ecd8');}
      if(phase==='ready'){const go=pt>.5;const sc=Math.min(1,(go?pt-.5:pt)*6);K.plaque(go?'Go!':'Ready',go?'#9be07a':'#ffd27a',Math.round(66-(1-sc)*12),go?80:96,2);}
      if(banner&&(phase==='retry'||phase==='next'||phase==='done')){banner.t+=dt;if(banner.t<1.3)K.plaque(banner.txt,banner.c,Math.round(64-Math.max(0,1-banner.t*6)*16),null,2);}
      const tl=MG4_TRIES-(run.tries[run.i]||0);for(let k=0;k<MG4_TRIES;k++){const x=8+k*9,y=H-12;K.px(x-1,y-1,8,9,'#1a0e06');K.px(x,y,6,7,k<tl?'#c84a3a':'#3a2010');if(k<tl)K.px(x,y,6,1,'#f08070');}
      for(let k=0;k<steps.length;k++){const x=W-14-(steps.length-k)*11,y=H-12;const sc_=run.scores[k];const c=sc_!=null?(sc_>.65?'#7cc04a':sc_>.35?'#e8b030':'#d84a2a'):null;
        K.px(x-1,y-1,9,9,'#1a0e06');K.px(x,y,7,7,'#8e621c');K.px(x,y,7,1,'#e8c060');K.px(x,y,1,7,'#d4a03c');K.px(x+6,y,1,7,'#664412');K.px(x,y+6,7,1,'#664412');
        if(c){K.px(x+2,y+2,3,3,c);K.px(x+2,y+2,1,1,'#ffffff');}else if(k===run.i)K.px(x+2,y+2,3,3,(Math.floor(t*3)%2)?'#fff2c8':'#e8c060');else K.px(x+2,y+2,3,3,'#3a2608');}}
    requestAnimationFrame(frame);};requestAnimationFrame(frame);}
// every recipe that has a fourth-generation game uses it; the rest keep the third
{const KEYOF=new Map();const index=()=>{for(const [k,d] of Object.entries(CG3_RECIPES))KEYOF.set(d,k);};
  const _r=cg3Run;cg3Run=function(def,name,done,icon){if(!KEYOF.size)index();const k=KEYOF.get(def);if(k&&MG4R[k]&&!window.MG4_OFF)return mg4Run(MG4R[k],name,done,icon);return _r.apply(this,arguments);};}
