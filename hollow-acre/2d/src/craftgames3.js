/* ================= the making games, third pass: everything you craft, cook, smelt, sew or build plays as the real steps of making it,
   drawn as the thing itself taking shape. The mechanics here only judge your timing and show a small gauge; each recipe's own art
   (craftrecipes.js) draws the scene. At the end the finished thing is shown with its quality. ================= */
const CG3M={};   // mechanics: (step, kit, run) => {st, hint, update(dt), down(), up(), side(s), ui(t), done, score}
// tap as the tool passes each mark
CG3M.marks=(sp,K)=>{const n=sp.n||3,x0=sp.x0||40,x1=sp.x1||200;const st={pos:0,dir:1,sweeps:0,hit:[],chop:0,marks:Array.from({length:n},(_,i)=>n===1?.5:.1+i*(.8/(n-1))+(K.H32(i,n,7)-.5)*.06),x0,x1};
  const o={st,hint:sp.hint||`${K.fine?'Click':'Tap'} as it passes each mark.`,
    update(dt){st.pos+=st.dir*dt*(sp.speed||.55)*(1+st.sweeps*.12);if(st.pos>1){st.pos=1;st.dir=-1;st.sweeps++;}if(st.pos<0){st.pos=0;st.dir=1;st.sweeps++;}st.chop=Math.max(0,st.chop-dt*4);if(st.sweeps>=4)o.finish();},
    finish(){if(o.done)return;o.done=true;o.score=st.marks.reduce((a,_,i)=>a+(st.hit[i]||0),0)/n;},
    down(){let b=-1,bd=1;st.marks.forEach((m,i)=>{if(st.hit[i]!==undefined)return;const d=Math.abs(st.pos-m);if(d<bd){bd=d;b=i;}});
      if(b>=0&&bd<.1){const s=bd<.022?1:bd<.05?.65:.3;st.hit[b]=s;st.chop=1;st.last=b;K.burst(x0+st.marks[b]*(x1-x0),sp.by||70,10,sp.chips||'#e8c890');SFX.thud&&SFX.thud(0,.3);if(st.hit.filter(v=>v!==undefined).length===n)setTimeout(o.finish,350);}else SFX.deny&&SFX.deny();},
    ui(){st.marks.forEach((m,i)=>{const x=x0+m*(x1-x0),c=st.hit[i];K.px(x-1,sp.my||40,3,3,c===undefined?'#fff4c6':c>.6?'#9be07a':c>.25?'#e8c070':'#c04a2a');});}};return o;};
// a needle swings; tap in the gold
CG3M.gauge=(sp,K)=>{const n=sp.n||1;const st={nd:0,dir:1,res:[],anim:0,n,zone:()=>.5+Math.sin(st.res.length*2.3+1)*.22};
  const o={st,hint:sp.hint||`${K.fine?'Click':'Tap'} when the needle is in the gold.`,
    update(dt){st.nd+=st.dir*dt*(sp.speed||.8)*(1+st.res.length*.15);if(st.nd>1){st.nd=1;st.dir=-1;}if(st.nd<0){st.nd=0;st.dir=1;}st.anim=Math.max(0,st.anim-dt*2);},
    down(){if(o.done||st.res.length>=n)return;const z=sp.zone||.1,d=Math.abs(st.nd-st.zone());const s=d<z*.45?1:d<z?.65:d<z*1.8?.3:0;st.res.push(s);st.anim=1;SFX[s>.5?'plant':'thud']&&SFX[s>.5?'plant':'thud'](0,.25);
      if(st.res.length>=n)setTimeout(()=>{o.done=true;o.score=st.res.reduce((a,b)=>a+b,0)/n;},600);},
    ui(){const x=24,y=6,w=192,zc=st.zone(),z=sp.zone||.1;K.px(x-3,y-2,w+6,11,'#4a3410');K.px(x-2,y-1,w+4,9,'#a8822c');K.px(x,y,w,7,'#1a1008');
      if(sp.strip)for(let i=0;i<w;i++)K.px(x+i,y+1,1,5,sp.strip(i/w));
      const zz=(a,c)=>K.px(x+(zc-a)*w,y+1,(a*2)*w,5,c);zz(z*1.8,'rgba(90,58,24,.9)');zz(z,'#a87420');zz(z*.45,'#ffd27a');const nx=x+st.nd*w;K.px(nx-1,y-4,3,3,'#f4ecd8');K.px(nx,y-1,1,10,'#f4ecd8');
      if(n>1)for(let i=0;i<n;i++)K.px(112+i*8,y+11,5,2,i<st.res.length?(st.res[i]>.6?'#9be07a':st.res[i]>.25?'#e8c070':'#c04a2a'):'#4a3420');}};return o;};
// hold to raise it, let go to let it fall (or the other way): keep it in the band
CG3M.heat=(sp,K)=>{const [lo,hi]=sp.band;const dur=sp.dur||3.2;const st={v:sp.start!=null?sp.start:.25,prog:0,inb:0,total:0,lo,hi,hold:false};
  const o={st,hint:sp.hint||'Hold to raise it. Keep it in the band.',
    update(dt){st.hold=o.hold;const up=sp.invert?!o.hold:o.hold;st.v+=(up?(sp.rise||.55):-(sp.fall||.34))*dt;st.v=Math.max(0,Math.min(1.08,st.v));st.total+=dt;if(st.v>lo&&st.v<hi){st.inb+=dt;st.prog+=dt/dur;}
      if(st.prog>=1||st.total>dur*2.8){o.done=true;o.score=Math.min(1,st.inb/Math.max(dur,st.total)*1.15)*(st.prog>=1?1:.8);}},
    ui(){const tx=222,ty=14;K.px(tx-3,ty-3,12,88,'#7a5a1a');K.px(tx-2,ty-2,10,86,'#cfa646');K.px(tx,ty,6,80,'#1a1210');K.px(tx,ty+80*(1-hi),6,80*(hi-lo),'#2c4a1c');const v=Math.min(1,st.v);
      K.px(tx+1,ty+80*(1-v),4,80*v,st.v>lo&&st.v<hi?'#ffd27a':st.v>=hi?'#ff5a2a':'#7a9ac0');K.px(10,6,150*Math.min(1,st.prog),3,'#9be07a');K.px(10,9,150,1,'#4a3420');if(sp.label)K.text(sp.label,40,12,'#f4ecd8');}};return o;};
// hold to fill, let go at the line (pour, bend, coil all work this way)
CG3M.fill=(sp,K)=>{const st={f:0,line:sp.line||(.68+K.H32(Date.now()&255,3,1)*.18),going:false,stopped:false};
  const o={st,hint:sp.hint||'Hold, and let go at the line.',
    update(dt){if(st.stopped)return;if(o.hold){st.going=true;st.f+=dt*(sp.rate||.34)*(1+st.f*(sp.accel||.25));}else if(st.going){st.stopped=true;const d=Math.abs(st.f-st.line);o.score=st.f>1.02?.15:d<.03?1:d<.07?.7:d<.13?.4:.15;SFX.coin&&SFX.coin();setTimeout(()=>{o.done=true;},550);}
      if(st.f>1.08&&!st.stopped){st.stopped=true;st.over=true;o.score=.1;SFX.deny&&SFX.deny();setTimeout(()=>{o.done=true;},550);}},ui(){}};return o;};
// the saw runs on by itself; hold to steer down, let go to rise; stay on the line
CG3M.saw=(sp,K)=>{const st={x:0,y:.5,vy:0,on:0,total:0,kerf:[],line:s=>.5+Math.sin(s*5.2+(sp.seed||1))*.2+Math.sin(s*11)*.05};
  const o={st,hint:sp.hint||'Hold to steer the saw down, let go to let it rise. Follow the pencil line.',
    update(dt){st.x+=dt*(sp.speed||.2);st.vy+=(o.hold?2.2:-2.2)*dt;st.vy=Math.max(-.9,Math.min(.9,st.vy));st.y=Math.max(0,Math.min(1,st.y+st.vy*dt));st.total+=dt;const ok=Math.abs(st.y-st.line(st.x))<.06;if(ok)st.on+=dt;st.kerf.push([st.x,st.y,ok]);
      if(Math.random()<.6)K.parts.push({x:(sp.x0||20)+st.x*(sp.w||200),y:(sp.y0||30)+st.y*(sp.h||70),vx:(Math.random()-.5)*30,vy:-10,t:0,c:sp.dust||'#e8c890'});if(st.x>=1){o.done=true;o.score=Math.min(1,st.on/st.total*1.1);}},ui(){}};return o;};
// strike as the ring closes on each spot
CG3M.hammer=(sp,K)=>{const pos=sp.pos;const n=pos.length;const st={k:0,r:1,anim:0,driven:[],pos};
  const o={st,hint:sp.hint||`${K.fine?'Click':'Tap'} as the ring closes.`,
    end(){setTimeout(()=>{o.done=true;o.score=st.driven.reduce((a,b)=>a+b,0)/n;},450);},
    update(dt){if(o.done||st.k>=n){st.anim=Math.max(0,st.anim-dt*4);return;}st.r-=dt*(sp.speed||.9)*(1+st.k*.1);st.anim=Math.max(0,st.anim-dt*4);if(st.r<-.15){st.driven[st.k]=0;st.k++;st.r=1;SFX.deny&&SFX.deny();if(st.k>=n)o.end();}},
    down(){if(st.k>=n)return;const d=Math.abs(st.r-.12);const s=d<.05?1:d<.12?.65:d<.22?.3:0;st.driven[st.k]=s;st.anim=1;st.lastHit=st.k;SFX.thud&&SFX.thud(0,.45);const [x,y]=pos[st.k];K.burst(x,y,12,sp.sparks||'#e8c890',90);st.k++;st.r=1;if(st.k>=n)o.end();},
    ui(){if(st.k>=n)return;const [x,y]=pos[st.k];const g=K.g;g.strokeStyle='#ffd27a';g.lineWidth=1;g.beginPath();g.arc(x,y,Math.max(0,st.r)*28+4,0,Math.PI*2);g.stroke();g.strokeStyle='rgba(155,224,122,.85)';g.beginPath();g.arc(x,y,.12*28+4,0,Math.PI*2);g.stroke();}};return o;};
// arrows slide in; press the side they ask for at the line
CG3M.rhythm=(sp,K)=>{const n=sp.n||8;const st={tm:0,good:0,notes:Array.from({length:n},(_,i)=>({t:1.1+i*(sp.gap||.62),s:K.H32(i,n,sp.seed||3)<.5?-1:1,hit:null}))};
  const o={st,hint:K.fine?'Press A/← or D/→ as each arrow reaches the line (or click that half).':'Tap the left or right half as each arrow reaches the line.',
    update(dt){st.tm+=dt;for(const nt of st.notes)if(nt.hit===null&&st.tm-nt.t>.22){nt.hit=0;SFX.deny&&SFX.deny();}if(st.tm>st.notes[n-1].t+.6&&!o.done){o.done=true;o.score=st.notes.reduce((a,b)=>a+(b.hit||0),0)/n;}},
    side(s){let b=null,bd=1;for(const nt of st.notes){if(nt.hit!==null)continue;const d=Math.abs(st.tm-nt.t);if(d<bd){bd=d;b=nt;}}if(!b||bd>.3)return;if(b.s!==s){b.hit=0;SFX.deny&&SFX.deny();return;}b.hit=bd<.07?1:bd<.15?.65:.3;st.good++;SFX.page&&SFX.page();},
    ui(){K.pa(8,4,224,16,'#000',.4);K.px(36,4,2,16,'#9be07a');for(const nt of st.notes){if(nt.hit!==null)continue;const x=36+(nt.t-st.tm)*110;if(x>232||x<6)continue;const c=nt.s<0?'#ffd27a':'#90c8f0';K.px(x-5,6,11,11,c);K.px(x-5,6,11,1,'#ffffff');
      for(let j=0;j<4;j++){K.px(x+(nt.s<0?-2+j:2-j),11-j,1,1,'#1a0e06');K.px(x+(nt.s<0?-2+j:2-j),11+j,1,1,'#1a0e06');}}}};return o;};
// tap as fast as you can (or left-right in turn)
CG3M.mash=(sp,K)=>{const st={taps:0,tm:0,last:0,p:0};
  const o={st,hint:sp.alt?(K.fine?'Press A/← and D/→ in turn (or click left, right…) as fast as you can.':'Tap left, right, left, right… as fast as you can.'):`${K.fine?'Click (or Space)':'Tap'} as fast as you can.`,
    update(dt){st.tm+=dt;st.p=Math.min(1,st.taps/sp.need);if((st.taps>=sp.need||st.tm>sp.time)&&!o.done){o.done=true;o.score=Math.min(1,st.taps/sp.need)*(st.taps>=sp.need?1:.85);}},
    down(){if(sp.alt||o.done)return;st.taps++;st.hitT=performance.now();SFX.thud&&SFX.thud(0,.15);},
    ui(){K.px(10,6,220*st.p,4,'#9be07a');K.px(10,10,220*Math.max(0,1-st.tm/sp.time),1,'#e8a040');}};
  if(sp.alt)o.side=s=>{if(o.done||s===st.last)return;st.last=s;st.taps++;st.hitT=performance.now();SFX.thud&&SFX.thud(0,.15);};return o;};
// the blade runs along a path: hold on the lines, let go on the gaps
CG3M.trace=(sp,K)=>{const st={s:0,good:0,total:0,segs:sp.segs,path:sp.path};
  const o={st,hint:sp.hint||'Hold while the blade is on a line, let go on the gaps.',
    update(dt){st.s+=dt*(sp.speed||.16);st.total+=dt;const seg=st.segs.find(q=>st.s>=q[0]&&st.s<q[1]);if(seg&&(!!o.hold)===!!seg[2])st.good+=dt;st.hold=o.hold;if(st.s>=1&&!o.done){o.done=true;o.score=Math.min(1,st.good/st.total*1.08);}},
    ui(){for(const [a,b,cut] of st.segs){if(!cut)continue;for(let u=a;u<b;u+=.004){const [x,y]=st.path(u);if(u<st.s){K.px(x-1,y-1,3,3,sp.cutCol||'#2a1006');if(sp.cutHi)K.px(x,y,1,1,sp.cutHi);}else if(((u*400)|0)%3!==0)K.px(x,y,2,2,sp.guide||'#fff0c8');}}}};return o;};
// keep a bubble level: tap the low side up
CG3M.level=(sp,K)=>{const st={tilt:.4,v:0,prog:0,inb:0,total:0,tm:0};
  const o={st,hint:K.fine?'Press A/← or D/→ (or click a side) to lift that side. Keep the bubble in the middle.':'Tap the side that sits low to lift it. Keep the bubble in the middle.',
    update(dt){st.tm+=dt;st.v+=(Math.sin(st.tm*1.3)*.5+Math.sin(st.tm*3.1)*.25)*dt*.9;st.v*=1-dt*.8;st.tilt=Math.max(-1,Math.min(1,st.tilt+st.v*dt*2));st.total+=dt;if(Math.abs(st.tilt)<.14){st.inb+=dt;st.prog+=dt/(sp.dur||3.4);}
      if((st.prog>=1||st.total>10)&&!o.done){o.done=true;o.score=Math.min(1,st.inb/Math.max(sp.dur||3.4,st.total)*1.15)*(st.prog>=1?1:.8);}},
    side(s){st.v-=s*.32;SFX.page&&SFX.page();},ui(){K.px(10,6,150*Math.min(1,st.prog),3,'#9be07a');K.px(10,9,150,1,'#4a3420');}};return o;};
// drop each piece as it swings over the right spot
CG3M.drop=(sp,K)=>{const n=sp.n||4;const st={x:0,t:0,k:0,placed:[],falling:null,n,target:sp.target||.5};
  const o={st,hint:`${K.fine?'Click':'Tap'} to drop it when it’s over the spot.`,
    update(dt){st.t+=dt;st.x=.5+Math.sin(st.t*(1.5+st.k*.25))*.42;if(st.falling){st.falling.y+=dt*3.2;if(st.falling.y>=1){st.placed.push(st.falling.x);const d=Math.abs(st.falling.x-st.target);st.falling.s=d<.03?1:d<.08?.65:d<.16?.3:0;st.res=(st.res||[]).concat(st.falling.s);st.falling=null;SFX.thud&&SFX.thud(0,.3);
        if(st.placed.length>=n)setTimeout(()=>{o.done=true;o.score=st.res.reduce((a,b)=>a+b,0)/n;},500);}}},
    down(){if(st.falling||st.placed.length+(st.falling?1:0)>=n)return;st.falling={x:st.x,y:0};st.k++;},ui(){}};return o;};
// bubbles of slag rise; skim each one at its biggest
CG3M.skim=(sp,K)=>{const n=sp.n||4;const st={b:null,k:0,res:[],tm:0};const spawn=()=>{st.b={x:.2+K.H32(st.k,9,2)*.6,size:0,life:0};};spawn();
  const o={st,hint:`${K.fine?'Click':'Tap'} to skim each bubble when it’s biggest, before it bursts.`,
    update(dt){st.tm+=dt;const b=st.b;if(!b)return;b.life+=dt;b.size=Math.min(1,b.life/1.3);if(b.life>1.6){st.res.push(0);SFX.deny&&SFX.deny();o.next();}},
    next(){st.k++;if(st.k>=n){st.b=null;setTimeout(()=>{o.done=true;o.score=st.res.reduce((a,b)=>a+b,0)/n;},400);}else spawn();},
    down(){const b=st.b;if(!b)return;const s=b.size>.92?1:b.size>.7?.65:b.size>.45?.3:0;st.res.push(s);st.skimT=1;SFX.plant&&SFX.plant(0,.2);o.next();},ui(){}};return o;};
// keep a wheel turning at the right speed with taps
CG3M.spin=(sp,K)=>{const [lo,hi]=sp.band;const st={v:.2,prog:0,inb:0,total:0,ang:0};
  const o={st,hint:`${K.fine?'Click (or Space)':'Tap'} to keep it turning. Not too slow, not too fast.`,
    update(dt){st.v=Math.max(0,st.v-dt*(sp.decay||.5));st.ang+=st.v*dt*14;st.total+=dt;if(st.v>lo&&st.v<hi){st.inb+=dt;st.prog+=dt/(sp.dur||3.2);}if((st.prog>=1||st.total>10)&&!o.done){o.done=true;o.score=Math.min(1,st.inb/Math.max(sp.dur||3.2,st.total)*1.15)*(st.prog>=1?1:.8);}},
    down(){st.v=Math.min(1.1,st.v+(sp.kick||.16));},
    ui(){const tx=222,ty=14;K.px(tx-3,ty-3,12,88,'#7a5a1a');K.px(tx,ty,6,80,'#1a1210');K.px(tx,ty+80*(1-hi),6,80*(hi-lo),'#2c4a1c');const v=Math.min(1,st.v);K.px(tx+1,ty+80*(1-v),4,80*v,st.v>lo&&st.v<hi?'#ffd27a':'#7a9ac0');K.px(10,6,150*Math.min(1,st.prog),3,'#9be07a');}};return o;};

// a little pixel star for the quality rating
const CG3_STAR=['.....#.....','....#*#....','....#*#....','.###***###.','#****o****#','.#*******#.','..#*****#..','..#**#**#..','.#**#.#**#.','.##.....##.'];
function cg3Star(K,x,y,on){CG3_STAR.forEach((r,j)=>{for(let i=0;i<r.length;i++){const c=r[i];if(c==='.')continue;K.px(x+i,y+j,1,1,c==='#'?(on?'#7a4a10':'#2a1a0c'):c==='o'?(on?'#fff4c0':'#5a4430'):on?(j<4?'#ffe9a0':'#ffd27a'):'#4a3420');}});}
// ---------- running one: a recipe is {scene, steps, reveal}; each step is {m, t, art(K,t,st,run), ...mechanic options}
function cg3Run(def,name,done,icon){const box=$('cgame'),cv=$('cgC'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;const W=240,H=120;
  const K=caKit(g,W,H);K.g=g;K.fine=matchMedia('(pointer:fine)').matches;K.parts=[];
  // gauges and markers drawn by the mechanics come out carved: a dark rim, a lit top edge, a shaded bottom edge
  {const _px=K.px;const sh=(c,k)=>{const n=parseInt(c.slice(1,7),16);const f=v=>Math.max(0,Math.min(255,Math.round(k>0?v+(255-v)*k:v*(1+k))));return '#'+[n>>16,(n>>8)&255,n&255].map(v=>f(v).toString(16).padStart(2,'0')).join('');};
    K.px=(x,y,w,h,c)=>{if(K.inUI&&typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)&&w*h>=4){_px(x-1,y-1,w+2,h+2,'#1a0e06');_px(x,y,w,h,c);if(h>=3)_px(x,y,w,1,sh(c,.35));if(h>=4&&w>=2)_px(x,y+h-1,w,1,sh(c,-.35));if(w>=4&&h>=4)_px(x,y,1,h,sh(c,.18));return;}_px(x,y,w,h,c);};}
  K.text=(t,x,y,c)=>{const ui=K.inUI;K.inUI=false;K.text0(t,x,y,c);K.inUI=ui;};
  K.text0=(t,x,y,c)=>{t=String(t).toUpperCase();let X=Math.round(x-t.length*2);for(const ch of t){const f=PXFONT[ch]||PXFONT[' '];for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1'){K.px(X+i+1,y+j+1,1,1,'#1a0e06');K.px(X+i,y+j,1,1,c);}X+=4;}};
  K.burst=(x,y,n,c,sp)=>{for(let i=0;i<n;i++)K.parts.push({x,y,vx:(Math.random()-.5)*(sp||70),vy:-20-Math.random()*(sp||50),t:0,c});};
  const steps=def.steps;const run={i:0,scores:[],states:[],name};let cur=null,wait=0,last=performance.now(),result=null,banner=null,reveal=0;
  box.style.display='flex';CG.on=true;$('cgT').textContent=name;
  const start=()=>{const sp=steps[run.i];cur=CG3M[sp.m](sp,K,run);cur.hold=false;{const u=cur.ui;cur.ui=t=>{K.inUI=true;try{u.call(cur,t);}finally{K.inUI=false;}};}run.states[run.i]=cur.st;$('cgH').innerHTML=`<b>${steps.length>1?`${run.i+1}/${steps.length} · `:''}${sp.t}.</b> ${cur.hint}`;};
  const finish=()=>{if(result!==null)return;result=run.scores.reduce((a,b)=>a+b,0)/run.scores.length;reveal=.001;
    $('cgH').innerHTML=`<b>${result>.9?'Beautifully made.':result>.65?'Well made.':result>.35?'It’ll do.':'Rough, but it works.'}</b>`;
    cg3Card(name,icon,result);
    setTimeout(()=>{box.style.display='none';CG.on=false;removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);cv.onpointerdown=cv.onpointerup=cv.onpointercancel=null;done(result);},1700);};
  const down=x=>{if(!cur||cur.done||wait>0||result!==null)return;A.init&&A.init();if(cur.side&&x!==undefined&&!cur.down){cur.side(x<W/2?-1:1);return;}if(cur.side&&x!==undefined&&(steps[run.i].m==='rhythm'||steps[run.i].m==='level'||steps[run.i].alt)){cur.side(x<W/2?-1:1);return;}cur.hold=true;cur.down&&cur.down();};
  const up=()=>{if(cur)cur.hold=false;};
  const kd=e=>{if(e.code==='Escape'){e.preventDefault();e.stopPropagation();while(run.scores.length<steps.length)run.scores.push(.5);finish();return;}
    if(cur&&cur.side&&/^(KeyA|ArrowLeft|KeyD|ArrowRight)$/.test(e.code)){e.preventDefault();e.stopPropagation();if(!e.repeat&&wait<=0&&!cur.done)cur.side(/KeyA|ArrowLeft/.test(e.code)?-1:1);return;}
    if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC'){e.preventDefault();e.stopPropagation();if(!e.repeat)down();}};
  const ku=e=>{if(e.code==='Space'||e.code==='Enter'||e.code==='KeyC')up();};addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);const rc=cv.getBoundingClientRect();down((e.clientX-rc.left)/rc.width*W);};cv.onpointerup=cv.onpointercancel=()=>up();
  $('cgSkip').onclick=()=>{while(run.scores.length<steps.length)run.scores.push(.5);finish();};
  start();
  const frame=now=>{if(!CG.on&&result!==null)return;const dt=Math.min(.05,(now-last)/1000)*(window.CG2_SPEED||1);last=now;const t=now/1000;window.CG2_NOW=result===null?steps[run.i].m+':'+run.i:'reveal';
    if(cur&&!cur.done&&wait<=0&&result===null)cur.update(dt);
    if(cur&&cur.done&&wait<=0&&result===null&&run.scores.length===run.i){const s=cur.score||0;run.scores.push(s);banner={txt:s>.9?'Perfect':s>.65?'Good':s>.35?'Rough':'Ruined',c:s>.9?'#ffd27a':s>.65?'#9be07a':s>.35?'#e8c070':'#c04a2a',t:0};
      if(run.i<steps.length-1)wait=.9;else setTimeout(finish,500);}
    if(wait>0){wait-=dt;if(wait<=0){run.i++;start();}}
    g.clearRect(0,0,W,H);K.scene(reveal>0?(def.revealScene||def.scene):(steps[run.i].scene||def.scene),t);
    if(reveal>0){reveal+=dt;const q=result;K.light(def.revealScene||def.scene,t);K.pa(0,0,W,H,'#000',.45);K.glow(120,62,60,'255,220,140',.35+Math.sin(t*4)*.05);def.reveal(K,t);
      for(let i=0;i<10;i++){const a=t*1.5+i*.63,r2=38+Math.sin(t*3+i)*4;K.px(120+Math.cos(a)*r2,60+Math.sin(a)*r2*.6,2,2,'#fff4c0');}
      const stars=q>.9?3:q>.6?2:q>.3?1:0;K.pa(84,93,72,17,'#140c06',.75);for(let i=0;i<3;i++){const on=i<stars,pop=on?Math.min(1,Math.max(0,(reveal-.25-i*.22)*5)):1;if(on&&pop<=0)continue;cg3Star(K,100+i*20-5,95+(on?Math.round((1-pop)*-4):0),on);}}
    else{const sp=steps[run.i];if(sp.dy){g.save();g.translate(0,sp.dy);}sp.art(K,t,cur.st,run);if(sp.dy)g.restore();K.light(sp.scene||def.scene,t);cur.ui(t);}
    for(let k=K.parts.length-1;k>=0;k--){const p=K.parts[k];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;if(p.t>.8){K.parts.splice(k,1);continue;}K.px(p.x,p.y,2,2,p.c);}
    if(banner&&reveal===0){banner.t+=dt;if(banner.t<1.1){const dy=Math.round(Math.max(0,1-banner.t*6)*-14+Math.sin(Math.min(1,banner.t*6)*Math.PI)*-2);const bx=78,by=46+dy,bw=84,bh=20;
      K.pa(bx+2,by+3,bw,bh,'#000',.35);K.px(bx-1,by-1,bw+2,bh+2,'#1a0e06');K.px(bx,by,bw,bh,'#7a4a20');for(let x=2;x<bw;x+=5)K.px(bx+x,by,1,bh,'#6a3e1a');K.px(bx,by,bw,1,'#b8823c');K.px(bx,by+bh-1,bw,1,'#4a2a10');
      for(const [cx,cy] of [[bx+2,by+2],[bx+bw-4,by+2],[bx+2,by+bh-4],[bx+bw-4,by+bh-4]]){K.px(cx,cy,2,2,'#e8c060');K.px(cx,cy,1,1,'#fff2c8');}
      K.px(bx+6,by+4,bw-12,bh-8,'#2a1608');K.text(banner.txt,120,by+7,banner.c);
      if(banner.txt==='Perfect')for(let k=0;k<6;k++){const a=banner.t*4+k;K.px(120+Math.cos(a)*48,by+10+Math.sin(a)*14,2,2,'#fff4c0');}}}
    if(reveal===0)for(let k=0;k<steps.length;k++){const x=W-12-(steps.length-k)*10,y=H-11;const done_=k<run.scores.length,c=done_?(run.scores[k]>.65?'#7cc04a':run.scores[k]>.35?'#e8b030':'#d84a2a'):null;
      K.px(x-1,y-1,9,9,'#1a0e06');K.px(x,y,7,7,'#8e621c');K.px(x,y,7,1,'#e8c060');K.px(x,y,1,7,'#d4a03c');K.px(x+6,y,1,7,'#664412');K.px(x,y+6,7,1,'#664412');
      if(c){K.px(x+2,y+2,3,3,c);K.px(x+2,y+2,1,1,'#ffffff');}else if(k===run.i){K.px(x+2,y+2,3,3,(Math.floor(t*3)%2)?'#fff2c8':'#e8c060');}else K.px(x+2,y+2,3,3,'#3a2608');}
    requestAnimationFrame(frame);};requestAnimationFrame(frame);}
// ---- what you made, on a parchment card like a fresh catch
{const css=document.createElement('style');css.textContent=`#craftCard{position:fixed;left:50%;top:9%;transform:translateX(-50%) scale(.6);opacity:0;z-index:62;display:flex;gap:10px;align-items:center;padding:8px 14px 8px 8px;background:#f2e2bc;color:#3a2410;font:14px 'Pixelify Sans',monospace;
  box-shadow:0 0 0 3px #5a3418,0 0 0 6px #b8823c,0 0 0 9px #3a2410,0 8px 0 9px rgba(0,0,0,.35);transition:transform .22s cubic-bezier(.3,1.6,.5,1),opacity .2s;pointer-events:none}
#craftCard.on{transform:translateX(-50%) scale(1);opacity:1}#craftCard img{width:64px;height:64px;image-rendering:pixelated;background:#d8c49a;box-shadow:inset 0 0 0 2px #a8865a}
#craftCard b{font-size:17px;display:block}#craftCard .q{color:#8a6a2a}#craftCard .new{display:inline-block;background:#d84a2a;color:#fff4dc;padding:0 5px;margin-left:6px;font-size:12px;vertical-align:2px}`;document.head.appendChild(css);
  const c=document.createElement('div');c.id='craftCard';c.innerHTML='<img alt=""><div class="t"></div>';document.body.appendChild(c);}
// the making-game window: carved wood and brass like the fishing gauge, a parchment plaque for the name
{const css=document.createElement('style');css.textContent=`
#cgame{background:radial-gradient(ellipse at 50% 45%,rgba(20,10,4,.35),rgba(6,3,1,.78))}
#cgame .box{background:radial-gradient(circle at 9px 9px,#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),radial-gradient(circle at calc(100% - 9px) 9px,#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),
  radial-gradient(circle at 9px calc(100% - 9px),#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),radial-gradient(circle at calc(100% - 9px) calc(100% - 9px),#fff2c8 0 1px,#e8c060 1px 3px,#5a3418 3px 4px,transparent 4px),
  repeating-linear-gradient(90deg,#7a4a20 0 4px,#6a3e1a 4px 5px,#7e4e22 5px 9px,#6a3e1a 9px 10px)!important;
  box-shadow:0 0 0 3px #1a0e06,0 0 0 6px #b8823c,0 0 0 9px #3a2410,0 12px 0 9px rgba(0,0,0,.4),inset 0 2px 0 #b8823c,inset 0 -2px 0 #4a2a10,inset 2px 0 0 #a8763a,inset -2px 0 0 #4a2a10!important;padding:16px 18px 14px!important;gap:10px!important}
#cgame canvas{width:min(88vw,560px)!important;box-shadow:0 0 0 2px #1a0e06,0 0 0 4px #4a2a10,0 0 0 6px #b8823c,0 0 0 8px #1a0e06!important}
#cgame .t{background:#f2e2bc;color:#3a2410!important;font-size:18px!important;padding:3px 16px;box-shadow:0 0 0 2px #5a3418,0 0 0 4px #b8823c,0 0 0 6px #3a2410,0 4px 0 6px rgba(0,0,0,.3);letter-spacing:.04em}
#cgame .h{color:#fff4dc!important;text-shadow:1px 1px 0 #000;background:rgba(26,14,6,.6);padding:4px 12px;box-shadow:0 0 0 1px #4a2a10;font-size:13px}
#cgame .h b{color:#ffd27a}`;document.head.appendChild(css);}
function cg3Card(name,icon,q){const c=$('craftCard');if(!c)return;S.madeLog=S.madeLog||{};const nm=String(name).replace(/^Building: /,'');const isNew=!S.madeLog[nm];S.madeLog[nm]=Math.max(S.madeLog[nm]||0,q);
  const img=c.querySelector('img');img.src=iconOf(icon||'wood');const stars=q>.9?3:q>.6?2:q>.3?1:0;
  c.querySelector('.t').innerHTML=`<b>${nm}${isNew?'<span class="new">NEW</span>':''}</b><span class="q">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</span> ${q>.9?'Beautifully made.':q>.65?'Well made.':q>.35?'It’ll do.':'Rough, but it works.'}`;
  c.classList.add('on');clearTimeout(cg3Card.t);cg3Card.t=setTimeout(()=>c.classList.remove('on'),2600);}
// every recipe with its own making game uses it
const CG3_RECIPES={};
{const _cg=craftGame;craftGame=function(type,r,done){const v=typeof CR!=='undefined'&&CR.v;const def=CG3_RECIPES[v+':'+r.k];if(def)return cg3Run(def,r.name,done,typeof craftIcon==='function'?craftIcon(v,r):null);return _cg.apply(this,arguments);};}
