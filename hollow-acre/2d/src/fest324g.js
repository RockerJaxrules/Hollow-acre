/* ================= t324 the festival games, played on the minigame stage (320x180, the same hands, judging and tries as the
   making games), in front of the fair: a late October afternoon in the square, bunting and lanterns, the town at your back.
   RING TOSS (aim, then hold for the throw and let go: front pegs 1, middle 2, back 3), RING THE BELL (catch the swing at the
   top of the gauge), the CROW SHOOT (tin crows on three rails; never the girl), APPLE BOBBING (hold to go under, come up with
   an apple in your teeth, mind your breath; leave the black one), and PUMPKIN CARVING (draw the face with the knife; the town
   judges eyes, mouth, teeth and how even it is). And the weigh-in, shown on the scale. ================= */
const F2G={skipped:false},F2R={};
document.addEventListener('click',e=>{if(e.target&&e.target.id==='mg4Skip'&&MG4.on)F2G.skipped=true;},true);
addEventListener('keydown',e=>{if(e.code==='Escape'&&typeof MG4!=='undefined'&&MG4.on)F2G.skipped=true;},true);
const F2C={red:['#3a0c0a','#5e1410','#86201a','#a83226','#c84a34','#e06a4a'],cream:['#6a5a44','#8c7a5e','#ad9a7a','#cbb898','#e2d2b2','#f4e8cc'],
  tin:['#141418','#22242c','#34363f','#4a4c56','#666a74','#8c909a','#b8bcc4'],gold:['#4a3008','#7a5210','#a8761c','#d09c2c','#ecc24a','#fce48a'],
  pump:['#5a1e04','#8a3206','#b8480c','#d8641a','#ee8a2e','#f8ae56','#fcd08a'],skin:['#5a3020','#8a5038','#b07050','#d09070','#e8b090','#f8d0b0']};
// ---------------------------------------------------------------- the fair, behind every game
MG4ART.paint.fair=function(K){
  // a late afternoon sky going gold at the rooftops
  const SKY=['#4e5872','#5a6278','#6a6e7e','#7e7c82','#968a82','#b09a82','#c8aa84'];for(let y=0;y<72;y++)K.px(0,y,320,1,SKY[Math.min(6,(y/10.5)|0)]);
  for(const [cx,cy,w] of [[60,14,90],[210,8,130],[300,24,70]])for(let i=0;i<w;i++){const u=i/w,h=Math.round(2+3*Math.sin(u*Math.PI));K.px(cx-w/2+i,cy-h,1,h,'#6c7286');K.px(cx-w/2+i,cy,1,1,'#8a8a96');}
  // the roofs of Marrow Hollow, the church steeple, chimneys with smoke
  const ROOF='#2a2430',ROOF2='#36303c',WALL='#3e3440',WIN='#e8b060';
  const house=(x,w,h,gable)=>{const top=72-h;K.px(x,top,w,h,WALL);for(let k=0;k<gable;k++)K.px(x-2+k,top-gable+k,w+4-k*2,1,k===0?ROOF2:ROOF);K.px(x-2,top,w+4,2,ROOF);
    for(let i=0;i<Math.floor(w/9);i++)if(K.H32(x,i,3)>.45){K.px(x+3+i*9,top+5,3,4,WIN);K.px(x+3+i*9,top+5,3,1,'#fff0b8');}};
  house(4,30,22,8);house(40,24,16,6);house(70,34,26,9);house(116,22,18,6);house(214,30,20,8);house(250,26,24,7);house(284,36,18,8);
  // the steeple
  K.px(150,24,16,48,WALL);for(let k=0;k<22;k++)K.px(158-Math.round(k*.36),2+k,Math.round(k*.72)+1,1,ROOF);K.px(157,0,2,4,'#1a141c');K.px(154,34,8,10,'#1a141c');K.px(156,36,4,6,'#5a4a3a');
  K.px(176,40,30,32,WALL);K.px(174,38,34,3,ROOF);
  // the green: grass falling away, a cobbled strip, the trestles
  for(let y=72;y<180;y++){const u=(y-72)/108;K.px(0,y,320,1,u<.5?['#3e5a2c','#46622e','#4e6a32'][(y>>2)%3]:['#5a5040','#625846','#6a604c'][(y>>2)%3]);}
  for(let i=0;i<260;i++){const x=(K.H32(i,1,9)*320)|0,y=74+((K.H32(i,2,9)*50)|0);K.px(x,y,1,2,K.H32(i,3,9)>.5?'#5e7a3a':'#36502a');}
  for(let i=0;i<70;i++){const x=(K.H32(i,4,9)*320)|0,y=128+((K.H32(i,5,9)*50)|0),w=6+((K.H32(i,6,9)*8)|0);K.px(x,y,w,3,'#56503e');K.px(x,y,w,1,'#7a725c');}
  // leaf litter
  for(let i=0;i<50;i++){const x=(K.H32(i,7,9)*320)|0,y=80+((K.H32(i,8,9)*96)|0);K.px(x,y,2,1,['#b8582a','#d88a3a','#8a3a1a','#c8a040'][i%4]);}};
MG4ART.anim.fair=function(K,t){
  // bunting strung over the stage, flapping
  const COL=['#c84a34','#e8c060','#3a6aa8','#4a8a3a','#f0e4c8'];
  for(const [y0,sag,ph] of [[6,10,0],[20,8,1.7]]){for(let x=0;x<320;x+=2){const u=x/320,y=y0+Math.sin(u*Math.PI)*sag;K.px(x,y,2,1,'#2a1a10');}
    for(let i=0;i<20;i++){const x=8+i*16,u=x/320,y=Math.round(y0+Math.sin(u*Math.PI)*sag)+1,f=Math.round(Math.sin(t*3+i+ph)*1.2);const c=COL[(i+(ph>1?2:0))%5];
      for(let r=0;r<7;r++){const w=Math.max(1,6-r);K.px(x-w/2+f*(r/7),y+r,w,1,c);}K.px(x-3,y,6,1,'#1a1008');}}
  // lanterns along the second string, glowing as the light goes
  for(let i=0;i<7;i++){const x=24+i*46,y=Math.round(20+Math.sin((x/320)*Math.PI)*8)+4,b=Math.sin(t*2+i)*.15;K.px(x-3,y,7,8,'#c8582a');K.px(x-2,y+1,5,6,'#f0a040');K.px(x-1,y+2,3,3,'#ffe090');K.glow(x,y+4,14,'255,190,90',.18+b*.1);}
  // the crowd at your back: heads and shoulders, swaying
  const C=[['#3a2a22','#5a3e30'],['#2a2a34','#40404c'],['#4a3020','#6a4a30'],['#2e3a2a','#44543c'],['#3e2030','#5a3044']];
  for(let i=0;i<14;i++){const x=6+i*23+((i*7)%9),b=Math.round(Math.sin(t*1.6+i*1.3)*1.2),c=C[i%5];const y=166+b+((i*5)%4);
    K.px(x-9,y,18,16,c[0]);K.px(x-9,y,18,1,c[1]);K.px(x-4,y-9,9,10,'#2a1c16');K.px(x-4,y-9,9,2,['#5a3a22','#2a2018','#8a6a3a','#3a2a1a'][i%4]);}
  // a leaf drifting down now and then
  for(let k=0;k<5;k++){const u=(t*.12+k*.21)%1;K.px(((k*67+t*14)%330)-5,u*170,2,1,['#d88a3a','#b8582a'][k%2]);}};
MG4ART.LIGHT.fair={x:46,y:18,r:380,c:'255,212,160',a:.22,mote:'#e8d8b8'};
MAMB.fair={bed:['bandpass',520,.5,.02],ev:[[2.6,()=>{for(let i=0;i<3;i++)A.tone(320+Math.random()*180,.08,'triangle',.012,{delay:i*.07,filter:['lowpass',1200]});}],
  [5,()=>{const n=[392,440,494,523,587];for(let i=0;i<4;i++)A.tone(n[(Math.random()*5)|0],.22,'square',.008,{delay:i*.2,filter:['lowpass',1400]});}],[7,()=>A.tone(700+Math.random()*300,.12,'sine',.02,{slide:1100})]]};
// ---------------------------------------------------------------- RING TOSS
const F2PEG=[{y:104,v:1,xs:[78,124,170,216,262],w:6,tol:7},{y:86,v:2,xs:[96,134,172,210,248],w:5,tol:5.5},{y:70,v:3,xs:[112,142,172,202,232],w:4,tol:4.2}];
S4.f2toss=(sp,K)=>{const g=K.g,N=5;const st={ring:0,phase:'aim',ax:160,aw:0,pw:0,pdir:1,fly:null,on:[],floor:[],pts:0,t:0,end:0,msg:null};
  const board=M4.pre('f2tossbd',236,72,k=>{for(let y=0;y<72;y++){const u=y/72;for(let x=0;x<236;x++){const stripe=((x+((y*.4)|0))>>4)&1;k.px(x,y,1,1,stripe?(u>.85?'#5a2a22':'#6e3a2e'):(u>.85?'#7a6656':'#8e7a68'));}}
    k.px(0,0,236,2,F2C.red[5]);k.px(0,70,236,2,F2C.red[0]);for(let x=0;x<236;x+=59)k.px(x,0,2,72,'#3a1e10');},false);
  const ringAt=(x,y,s,c,tilt)=>{const rx=Math.max(3,Math.round(9*s)),ry=Math.max(2,Math.round(3.8*s*(tilt||1))),th=Math.max(2,Math.round(2.4*s));
    for(let a=0;a<6.28;a+=.06){const px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;K.px(px-1,py-1,th+1,th+1,'#2a1408');}
    for(let a=0;a<6.28;a+=.06){const px=x+Math.cos(a)*rx,py=y+Math.sin(a)*ry;K.px(px,py,th-1,th-1,a<3.14?c[1]:c[0]);if(a>3.6&&a<4.6)K.px(px,py,1,1,'#fff4d0');}};
  const RC=['#9a6a2a','#f0c860'];
  return {title:'Ring toss',how:K.fine?'An arrow sweeps along the bottom: click (or hold Space) to set your aim, keep holding while the power bar rises and falls, and let go to throw. Front pegs 1, middle 2, back 3.':'Tap and hold to set your aim, keep holding while the power rises and falls, and let go to throw. Front pegs 1, middle 2, back 3.',hint:'Hold to aim and power, let go to throw.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>1.1){st.done=true;st.score=M4.cl(st.pts/12,0,1);F2R.toss={pts:st.pts};}return;}
      if(st.phase==='aim'){st.aw+=dt*(1.9+st.ring*.25);st.ax=160+Math.sin(st.aw)*110;if(I.pressed||I.down&&I.fresh){st.phase='power';st.pw=0;st.pdir=1;MS.tick();}}
      else if(st.phase==='power'){st.pw+=st.pdir*dt*1.15;if(st.pw>1){st.pw=1;st.pdir=-1;}if(st.pw<0){st.pw=0;st.pdir=1;}
        if(I.released||!I.down){const ty=112-st.pw*48,tx=st.ax+(Math.random()-.5)*4;st.fly={x0:160,y0:168,x1:tx,y1:ty,u:0};st.phase='fly';MS.whoosh();}}
      else if(st.phase==='fly'){const f=st.fly;f.u+=dt*1.7;if(f.u>=1){let hit=null;for(const R of F2PEG)for(const px of R.xs){if(Math.abs(f.y1-R.y)<7&&Math.abs(f.x1-px)<R.tol&&!st.on.some(o=>o.x===px&&o.y===R.y))hit={x:px,y:R.y,v:R.v};}
          if(hit){st.on.push(hit);st.pts+=hit.v;K.judge(hit.v===3?1:hit.v===2?.8:.62,hit.x,hit.y-34);MS.tink(hit.v/3);K.emit(hit.x,hit.y,8,{c:['#fff4c0','#e8c060'],v:50,g:120,life:.5});st.msg={t:'+'+hit.v,c:'#ffd27a',x:hit.x+14,y:hit.y-20,u:0};}
          else{st.floor.push({x:f.x1+(Math.random()-.5)*20,y:Math.min(124,f.y1+14+Math.random()*10)});MS.knock();K.judge(.1,f.x1,f.y1-30,true);A.tone(160,.12,'square',.03);}
          st.fly=null;st.ring++;st.phase=st.ring>=N?'wait':'aim';st.aw=Math.random()*6;if(st.ring>=N)st.end=.001;}}
      if(st.msg){st.msg.u+=dt;if(st.msg.u>1)st.msg=null;}},
    draw(t){// the booth: counter, the striped board with its pegs, the prizes on the top shelf
      K.px(34,22,252,6,'#3a2414');K.px(34,22,252,1,'#6a4424');for(let i=0;i<7;i++){const x=48+i*34;K.px(x,12,10,10,['#c8402a','#3a6aa8','#e8c060','#4a8a3a','#8a3a8a','#c8402a','#e8a040'][i]);K.px(x+1,13,3,8,'rgba(255,255,255,.35)');K.px(x-1,10,12,2,'#5a3a1a');}
      g.drawImage(board,42,48);K.shadow(160,122,124,6,.3);
      for(const R of F2PEG)for(const px of R.xs){const h=[0,9,7,6][R.v],w=[0,6,5,4][R.v],x0=Math.round(px-w/2),y0=R.y-h,hw=Math.ceil(w/2);
        for(let k=0;k<h+2;k++)K.pa(x0+w+k*.9,R.y-1+k*.45,2,1,'#2a0c06',.42*(1-k/(h+2)));                 // its shadow, down and to the right
        K.px(x0-1,y0+1,w+2,h,'#2a1408');K.px(x0,y0+1,w,h-1,'#cbb898');K.px(x0,y0+1,1,h-1,'#ede0c4');K.px(x0+w-1,y0+1,1,h-1,'#8a7a5e');
        K.ell(px,y0+1,hw+1,2,'#2a1408');K.ell(px,y0+1,hw,1,'#e8dcc0');K.px(px-hw,y0+1,hw,1,'#fbf2de');}
      for(const R of F2PEG){K.text(String(R.v),38,R.y-8,'#f4e6c8');}
      for(const o of st.on)ringAt(o.x,o.y-3,o.y<80?.55:o.y<95?.75:.95,RC);
      // the counter at the front
      K.plank(20,124,280,12,CA_P.wood,4);K.px(20,136,280,26,'#4a2c18');for(let x=24;x<300;x+=22)K.px(x,136,2,26,'#3a2010');K.px(20,124,280,1,CA_P.wood[7]);
      for(const f of st.floor)ringAt(f.x,f.y,.8,['#5a4426','#8a6a3a'],.6);
      // the aim and the power
      if(st.phase==='aim'||st.phase==='power'){const x=st.ax,ty=st.phase==='power'?112-st.pw*48:96;for(let k=0;k<1;k+=.06){const xx=160+(x-160)*k,yy=166+(ty-166)*k-Math.sin(k*Math.PI)*30;if(((k*16)|0)%2===0)K.px(xx,yy,2,2,'#ffd27a');}K.px(x-3,ty,7,1,'#ffd27a');K.px(x,ty-3,1,7,'#ffd27a');}
      if(st.fly){const f=st.fly,u=f.u,x=f.x0+(f.x1-f.x0)*u,y=f.y0+(f.y1-f.y0)*u-Math.sin(u*Math.PI)*(40+(112-f.y1)*.6),s=1.6-u*(1.6-(f.y1<80?.55:f.y1<95?.75:.95));ringAt(x,y,s,RC,.7+Math.sin(t*20)*.3);}
      else if(st.ring<N){ringAt(160,166,1.5,RC);}
      m4hand(K,150,158);if(st.msg)K.textO(st.msg.t,st.msg.x,Math.round(st.msg.y-st.msg.u*10),st.msg.c,2);},
    hud(){K.label('POWER',296,14,'#f4ecd8');K.gauge(292,24,8,90,.66,1,st.phase==='power'?st.pw:0);K.label(`RINGS ${N-st.ring}`,40,150,'#f4ecd8','l');K.label(`PEGS ${st.pts}`,40,160,'#ffd27a','l');K.meter(st.ring/N,st.pts/Math.max(1,st.ring*2));},
    auto(dt,AP){const a=m4ai(this,AP,dt);const R=F2PEG[1],tx=R.xs[(st.ring+1)%5];
      if(st.phase==='aim'){a.down=Math.abs(st.ax-tx)<4;a.fresh=a.down;}else if(st.phase==='power'){a.down=!(st.pw>.48&&st.pw<.56&&st.pdir>0);}else a.down=false;
      AP.I={x:160,y:150,down:a.down,pressed:a.down&&!AP._d,released:!a.down&&AP._d,fresh:a.down&&!AP._d,raw:a.down};AP._d=a.down;AP.hand=[160,150];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- RING THE BELL
S4.f2bell=(sp,K)=>{const g=K.g,N=3;const st={sw:0,ph:0,swing:null,puck:null,best:0,tries:[],t:0,end:0,ding:0,crows:[]};
  const MARKS=[[.2,'TICKLE'],[.4,'FARMHAND'],[.6,'MILLER'],[.8,'BLACKSMITH'],[.95,'HOLLOW']];
  const TX=206,TOP=26,BOT=150;const hY=v=>BOT-(BOT-TOP-10)*v;
  return {title:'Ring the bell',how:K.fine?'The needle swings across the gauge. Click (or press Space) as it reaches the top, by the bell, and bring the mallet down. Three swings: your best counts.':'The needle swings across the gauge. Tap as it reaches the top and bring the mallet down. Three swings: your best counts.',hint:'Swing when the needle is at the top.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>1.2){st.done=true;st.score=M4.cl(st.best,0,1);F2R.bell={best:st.best};}return;}
      if(!st.swing&&!st.puck){st.ph+=dt*(2.3+st.tries.length*.5);const v=(Math.sin(st.ph)+1)/2;st.needle=v;
        if(I.pressed){const p=M4.cl(1-Math.abs(1-v)*1.25,0,1)*(v>.985?1:.97);st.swing={u:0,p};MS.whoosh();}}
      if(st.swing){st.swing.u+=dt*4.2;if(st.swing.u>=1){const p=st.swing.p;st.swing=null;st.puck={y:0,v:Math.sqrt(p)*3.2,top:p,u:0};MS.thunk();K.shk=.12;K.emit(150,150,8,{c:['#c8a878','#8a6a3a'],v:60});}}
      if(st.puck){const q=st.puck;q.u+=dt;q.y+=q.v*dt*.62;q.v-=dt*3.4;if(q.y>=q.top&&q.v>0){q.y=q.top;q.v=0;}
        if(q.y>=.95&&!q.rang){q.rang=1;st.ding=1;MS.anvil(1.6);A.tone(1320,1.4,'sine',.08,{verb:1});K.flash=.4;K.judge(1,TX,TOP+20);for(let i=0;i<5;i++)st.crows.push({x:TX+(Math.random()-.5)*10,y:TOP,vx:(Math.random()-.5)*120,vy:-40-Math.random()*40,t:0});}
        if(q.v<=0&&q.u>.6){q.v-=dt;q.y+=q.v*dt;if(q.y<=0){const p=q.top;st.tries.push(p);st.best=Math.max(st.best,p);if(!q.rang)K.judge(p,TX,hY(p)-10);st.puck=null;if(st.tries.length>=N)st.end=.001;}}}
      if(st.ding>0)st.ding-=dt*.8;for(const c of st.crows){c.t+=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy-=10*dt;}st.crows=st.crows.filter(c=>c.t<2.5);},
    draw(t){// the tower: a tall painted board on a post, the marks, the bell at the top, the pad at the bottom
      K.shadow(TX,BOT+12,40,6,.35);for(let x=-10;x<10;x++){const u=(x+10)/20;const cr=['#fff6e0','#f0e4c8','#e2d4b4','#cfc09e','#b4a482','#9a8a6a'],rr=F2C.red;const k=u<.12?0:u<.3?1:u<.6?2:u<.82?3:u<.94?4:5;
        for(let y=TOP;y<BOT+6;y++)K.px(TX+x,y,1,1,(((y-TOP)/6)|0)%2?rr[Math.max(0,5-k)]:cr[k]);}
      K.px(TX-1,TOP+4,3,BOT-TOP,'#3a2a1a');K.px(TX-1,TOP+4,1,BOT-TOP,'#5a4a3a');
      for(const [v,l] of MARKS){const y=hY(v);K.px(TX+11,y,8,1,'#1a1008');K.label(l,TX+22,y-3,v>=.95?'#ffd27a':'#f4e6c8','l');}
      const sw=Math.round(st.ding>0?Math.sin(t*40)*st.ding*3:0),BG=F2C.gold;K.px(TX-6,TOP+2,12,3,'#3a3e44');K.px(TX-6,TOP+2,12,1,'#8890a0');
      [3,4,5,5,6,6,7,8,9,10].forEach((hw,j)=>{const y=TOP-12+j;for(let x=-hw;x<=hw;x++){const u=x/hw;K.px(TX+sw+x,y,1,1,BG[u<-.45?4:u<.2?3:u<.7?2:1]);}});
      K.px(TX+sw-10,TOP-2,21,1,BG[0]);K.px(TX+sw-7,TOP-2,15,1,'#1e120e');K.px(TX+sw-3,TOP-11,1,2,BG[5]);K.px(TX+sw-4,TOP-9,1,2,BG[5]);K.px(TX+sw,TOP-1,1,2,BG[1]);
      if(st.ding>0)K.glow(TX,TOP-6,40,'255,230,140',st.ding*.6);
      K.px(TX-26,BOT+2,52,10,'#4a2c18');K.px(TX-22,BOT-2,44,6,'#c84a34');K.px(TX-22,BOT-2,44,1,'#e8806a');
      {const k=st.swing&&st.swing.u>.9?2:0;K.px(TX-16,BOT-8,6,8,'#3a2414');K.line(TX-40,BOT-10+k,TX-4,BOT-6-k,CA_P.wood[4],3);K.px(TX-44,BOT-14+k,14,5,'#a83226');K.px(TX-44,BOT-14+k,14,1,'#e06a4a');K.px(TX-44,BOT-10+k,14,1,'#5a1410');}
      // the puck
      const py=hY(st.puck?st.puck.y:0)+4;K.px(TX-5,py-4,10,7,F2C.tin[5]);K.px(TX-5,py-4,10,1,F2C.tin[6]);K.px(TX-5,py+2,10,1,F2C.tin[2]);
      // the mallet and your hands: raised, then down on the pad
      const u=st.swing?st.swing.u:0,a=-1.9+u*1.75;const hx=124,hy=128;g.save();g.translate(hx,hy);g.rotate(a);const W_=CA_P.wood;
      K.px(-2,-3,64,1,W_[3]);K.px(-2,-2,64,1,W_[6]);K.px(-2,-1,64,1,W_[5]);K.px(-2,0,64,1,W_[4]);K.px(-2,1,64,1,W_[2]);
      for(let y=-10;y<10;y++){const v=y/10;K.px(54,y,18,1,W_[v<-.6?6:v<-.1?5:v<.5?4:3]);}K.px(54,-10,18,1,W_[7]);K.px(54,9,18,1,W_[1]);K.px(57,-10,2,20,CA_P.iron[3]);K.px(67,-10,2,20,CA_P.iron[3]);K.px(57,-10,1,20,CA_P.iron[5]);g.restore();
      m4hand(K,hx-6,hy-2,true);m4hand(K,hx+6,hy-4);
      for(const c of st.crows){const f=Math.sin(c.t*24)>0;K.px(c.x-3,c.y,7,2,'#1a1418');K.px(c.x-(f?5:3),c.y-(f?2:-1),3,2,'#1a1418');K.px(c.x+(f?3:1),c.y-(f?2:-1),3,2,'#1a1418');}
      // the record board
      K.px(26,30,70,40,'#2a2a2a');K.px(24,28,74,2,CA_P.wood[5]);K.px(24,70,74,2,CA_P.wood[3]);K.text('RECORDS',61,34,'#f4e6c8');K.text('GIDEON 96',61,46,'#d8d0c0');K.text('MAUD 88',61,55,'#d8d0c0');K.text(`YOU ${Math.round(st.best*100)}`,61,64,'#ffd27a');},
    hud(){K.label('SWING',40,84,'#f4ecd8');K.gauge(36,94,8,60,.9,1,st.needle||0);K.meter(st.tries.length/N,st.best);
      for(let i=0;i<N;i++){const v=st.tries[i];K.px(54+i*10,148,7,7,'#1a0e06');K.px(55+i*10,149,5,5,v==null?'#3a2010':v>=.95?'#ffd27a':v>.6?'#9be07a':'#c84a3a');}},
    auto(dt,AP){const a=m4ai(this,AP,dt);const d=!st.swing&&!st.puck&&(st.needle||0)>.93&&Math.cos(st.ph)<0;AP.I={x:160,y:90,down:d,pressed:d&&!AP._d,released:!d&&AP._d,raw:d};AP._d=d;AP.hand=[40,140];AP.press=d;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- THE CROW SHOOT
S4.f2crows=(sp,K)=>{const g=K.g,TIME=24;const st={t:0,end:0,cx:160,cy:90,shots:[],tg:[],pts:0,hits:0,girl:0,spawn:0,shotsLeft:16,look:0,gT:2.5};
  const RAILS=[{y:62,d:1,sp:40},{y:96,d:-1,sp:50},{y:130,d:1,sp:60}];
  // a tin crow cut-out, side on: drawn from a pixel pattern so it reads as a bird at any size; dark edge, lit top, a red-painted eye
  const CROW2=['..#...###...#.....','..##.#hhh####.....','...##hmmmme##.....','....#mmmmmmbbb#...','...#mmmmmmm###....','..#hmmmmmmmm#.....','.#hmmmmmmmmmm#....','#hmmmmmmmmmmmm#...','#mmmmmmmmmmmmm#...','.#dmmmmmmmmmd#....','..##ddmmmmdd#.....','....##dddd##......','.....#.#.#........','.....#.#.#........'];
  const CROW=['......###.........','.....#hhh##.......','....#hmmmme##.....','....#mmmmmmbbb#...','...#mmmmmmm###....','..#hmmmmmmmm#.....',
    '.#hmmmmmmmmmm#....','#hmmmmmmmmmmmm#...','#mmmmmmmmmmmmm#...','.#dmmmmmmmmmd#....','..##ddmmmmdd#.....','....##dddd##......','.....#.#.#........','.....#.#.#........'];
  const crow=(x,y,gold,down,flip,pose)=>{const PAT=pose?CROW2:CROW;const C=gold?F2C.gold:['#121014','#1e1c22','#2c2a32','#3e3c46','#5e5c68','#8a8896','#ffffff'];const H=CROW.length,W=CROW[0].length;
    if(down){K.px(x-8,y-3,16,3,C[1]);K.px(x-8,y-3,16,1,C[3]);K.px(x-1,y,2,4,'#3a2a1a');return;}
    for(let j=0;j<H;j++)for(let i=0;i<W;i++){const ch=PAT[j][i];if(ch==='.')continue;const xx=flip?x+8-i:x-9+i,yy=y-H+j;
      K.px(xx,yy,1,1,ch==='#'?'#141418':ch==='h'?C[5]:ch==='m'?C[3]:ch==='d'?C[2]:ch==='b'?(gold?'#8a5a10':'#c88a2a'):ch==='e'?'#c8302a':C[3]);}
    K.px(x-1,y,2,4,'#3a2a1a');};
  const GIRL=['...rr.rr...','....rrr....','..hhhhhhh..','.hhffffffh.','.hfeffeffh.','.hfffffffh.','..hffmffh..','...ffff....','....dd.....','.a.dddd.a..','.a.dddd.a..','..ddddddd..','..ddddddd..','.ddddddddd.','ddddddddddd','...l...l...','...l...l...'];
  const girl=(x,y,down,look)=>{if(down){K.px(x-6,y-3,12,3,'#d8d4cc');K.px(x-1,y,2,4,'#3a2a1a');return;}const H=GIRL.length;
    for(let j=0;j<H;j++)for(let i=0;i<11;i++){const ch=GIRL[j][i];const col={r:'#a8283a',h:'#2a1a14',f:'#f0e0d4',e:'#0a0606',m:'#6a2a2a',d:'#e8e4dc',a:'#f0e0d4',l:'#4a3a30'}[ch];
      if(col)K.px(x-5+i+(ch==='e'?look:0),y-H+j,1,1,col);}
    K.px(x-5,y-H+11,1,4,'#ffffff');K.px(x-1,y,2,4,'#3a2a1a');};
  return {title:'Crow shoot',how:K.fine?'Move the sight with the mouse (or W A S D) and click (or press Space) to shoot. Tin crows 1, gold crows 3. Sixteen stones. Do not hit the little girl.':'Drag the sight and tap to shoot. Tin crows 1, gold crows 3. Sixteen stones. Do not hit the little girl.',hint:'Shoot the crows. Never the girl.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>1.2){st.done=true;st.score=M4.cl(st.pts/16,0,1);F2R.crows={pts:st.pts};}return;}
      if(I.ax||I.ay){st.cx=M4.cl(st.cx+I.ax*150*dt,20,300);st.cy=M4.cl(st.cy+I.ay*120*dt,30,150);}else{st.cx+=(I.x-st.cx)*Math.min(1,dt*18);st.cy+=(I.y-st.cy)*Math.min(1,dt*18);}
      // each rail carries a steady file of targets, nose to tail, like the chain in a real gallery
      if(!st.filled){st.filled=1;RAILS.forEach((R,r)=>{for(let x=10+Math.random()*20;x<320;x+=30+Math.random()*44)st.tg.push({r,x,kind:Math.random()<.12?'gold':'tin',down:0,sp:R.sp,flip:Math.random()<.35,pose:Math.random()<.35});});}
      for(let r=0;r<3;r++){const R=RAILS[r],on=st.tg.filter(q=>q.r===r);const edge=R.d>0?Math.min(...on.map(q=>q.x),999):Math.max(...on.map(q=>q.x),-999);
        if(R.d>0?edge>30+((st.t*37|0)%40):edge<290-((st.t*37|0)%40)){st.gT-=0;const girl=st.gT<=0&&r===1&&!st.tg.some(q=>q.kind==='girl');if(girl)st.gT=4+Math.random()*2;
          st.tg.push({r,x:R.d>0?-14:334,kind:girl?'girl':Math.random()<.12?'gold':'tin',down:0,sp:R.sp*(1+st.t/TIME*.4),flip:Math.random()<.35,pose:Math.random()<.35});}}
      st.gT-=dt;
      for(const q of st.tg){q.x+=RAILS[q.r].d*q.sp*dt;if(q.down)q.down+=dt;}st.tg=st.tg.filter(q=>q.x>-20&&q.x<340);for(const q of st.tg)if(q.down>2.2)q.down=0;   // knocked-down crows swing back up further along
      if(I.pressed&&st.shotsLeft>0){st.shotsLeft--;st.shots.push({x0:160,y0:172,x1:st.cx,y1:st.cy,u:0});A.tone(300,.08,'square',.03,{slide:900});A.hiss(.06,.15,'highpass',2400);}
      for(const s of st.shots){s.u+=dt*7;if(s.u>=1&&!s.done){s.done=1;let hit=null;for(const q of st.tg){if(q.down)continue;const R=RAILS[q.r];const h=q.kind==='girl'?22:16;if(Math.abs(s.x1-q.x)<9&&s.y1<R.y+2&&s.y1>R.y-h-2){hit=q;break;}}
          if(hit){hit.down=.001;if(hit.kind==='girl'){st.pts=Math.max(0,st.pts-3);st.girl++;K.flash=.5;K.shk=.3;A.tone(90,.8,'sawtooth',.06,{slide:50,filter:['lowpass',600]});A.hiss(.6,.2,'bandpass',300,{q:2});K.judge(0,hit.x,RAILS[hit.r].y-30,true);st.look=1.6;}
            else{const v=hit.kind==='gold'?3:1;st.pts+=v;st.hits++;MS.tink(v===3?1:.4);K.judge(v===3?1:.7,hit.x,RAILS[hit.r].y-30);K.emit(hit.x,RAILS[hit.r].y-8,6,{c:['#b8bcc4','#ffffff'],v:60,g:160,life:.4});}}
          else{K.emit(s.x1,s.y1,3,{c:['#8a7a62'],v:30,g:120,life:.3});A.tone(140,.05,'square',.02);}}}
      st.shots=st.shots.filter(s=>s.u<1.3);if(st.look>0)st.look-=dt;
      if((st.shotsLeft<=0&&!st.shots.some(s=>!s.done))||st.t>TIME)st.end=.001;},
    draw(t){// the gallery: a dark back wall with planks, three rails, the striped awning above, the counter in front
      for(let y=30;y<142;y++){const k=((y-30)>>3)%3;K.px(14,y,292,1,['#6a4a30','#5e422a','#735236'][k]);if((y-30)%8===0)K.px(14,y,292,1,'#4a3220');}for(let x=14;x<306;x+=36)K.px(x,30,1,112,'#4a3220');
      for(const lx of [70,250]){K.glow(lx,40,90,'255,210,140',.28);K.px(lx-4,34,9,5,'#3a2a1a');K.px(lx-3,39,7,4,'#ffd27a');}
      for(let x=0;x<320;x+=16){K.px(x,22,8,10,F2C.red[3]);K.px(x+8,22,8,10,F2C.cream[4]);K.px(x,31,16,2,'#1a0e08');}for(let x=4;x<320;x+=16)K.px(x,32,8,3,F2C.red[2]);
      for(const R of RAILS){K.px(0,R.y+4,320,3,'#5a4632');K.px(0,R.y+4,320,1,'#a08460');K.px(0,R.y+7,320,1,'#2a1c12');for(let x=20;x<320;x+=60){K.px(x,R.y+7,3,6,'#3a2a1a');K.px(x,R.y+7,1,6,'#6a5034');}
        for(let x=((st.t*R.sp*R.d)%12+12)%12;x<320;x+=12)K.px(x,R.y+5,2,1,'#3a2a1a');}
      for(const q of st.tg){const R=RAILS[q.r];if(q.kind==='girl')girl(Math.round(q.x),R.y+4,q.down>0,st.look>0?(q.x<st.cx?1:-1):0);else crow(Math.round(q.x),R.y+4,q.kind==='gold',q.down>0,(RAILS[q.r].d<0)!==!!q.flip,q.pose);}
      if(st.look>0){K.pa(0,0,320,180,'#2a0008',Math.min(.35,st.look*.2));}
      K.plank(0,146,320,10,CA_P.wood,7);K.px(0,156,320,24,'#3a2414');
      // the slingshot and the stones in flight
      K.px(156,156,3,20,CA_P.wood[4]);K.line(150,152,157,162,CA_P.wood[5],2);K.line(166,152,158,162,CA_P.wood[5],2);m4hand(K,150,166);
      for(const s of st.shots){if(s.done)continue;const x=s.x0+(s.x1-s.x0)*s.u,y=s.y0+(s.y1-s.y0)*s.u-Math.sin(s.u*Math.PI)*6;K.px(x-1,y-1,3,3,'#8a8070');}
      const X=Math.round(st.cx),Y=Math.round(st.cy);K.px(X-7,Y,5,1,'#ffd27a');K.px(X+3,Y,5,1,'#ffd27a');K.px(X,Y-7,1,5,'#ffd27a');K.px(X,Y+3,1,5,'#ffd27a');K.px(X,Y,1,1,'#fff4c0');},
    hud(){K.label(`STONES ${st.shotsLeft}`,40,8,'#f4ecd8','l');K.label(`POINTS ${st.pts}`,130,8,'#ffd27a','l');K.label(`${Math.max(0,Math.ceil(TIME-st.t))}`,290,8,'#f4ecd8','r');K.meter(Math.min(1,st.t/TIME),st.hits/Math.max(1,16-st.shotsLeft));},
    auto(dt,AP){const a=m4ai(this,AP,dt);const q=st.tg.find(q=>!q.down&&q.kind!=='girl'&&q.x>60&&q.x<260);if(q){const R=RAILS[q.r];a.x+=(q.x+RAILS[q.r].d*q.sp*.14-a.x)*Math.min(1,dt*10);a.y+=(R.y-8-a.y)*Math.min(1,dt*10);}
      const near=q&&Math.abs(a.x-(q.x+RAILS[q.r].d*q.sp*.14))<4;const d=near&&(st.t*3%1)<.5;AP.I={x:a.x,y:a.y,down:d,pressed:d&&!AP._d,raw:d};AP._d=d;AP.hand=[a.x,a.y];AP.press=d;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- APPLE BOBBING
S4.f2bob=(sp,K)=>{const g=K.g,TIME=22,CX=160,CY=96,R=70;const st={t:0,end:0,mx:CX,my:CY,under:0,uT:0,cool:0,target:null,breath:1,held:null,got:0,apples:[],black:0,cough:0,splash:[]};
  for(let i=0;i<9;i++){const a=i*.7,r=20+(i*13)%42;st.apples.push({x:CX+Math.cos(a)*r,y:CY+Math.sin(a)*r*.7,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*10,c:i%3===0?'g':'r',bob:Math.random()*6});}
  return {title:'Apple bobbing',how:K.fine?'Move your face over an apple with the mouse (or W A S D). Hold the button (or Space) to go under: you bite if an apple is right under you. Let go to come up with it. Watch your breath. Leave the black apple.':'Drag your face over an apple and hold to go under; you bite if one is right under you. Let go to come up with it. Watch your breath. Leave the black apple.',hint:'Hold to go under, let go to come up.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>1.2){st.done=true;st.score=M4.cl(st.got/6,0,1);F2R.bob={got:st.got};}return;}
      if(st.cough>0){st.cough-=dt;}
      if(I.ax||I.ay){st.mx=M4.cl(st.mx+I.ax*110*dt,CX-R+12,CX+R-12);st.my=M4.cl(st.my+I.ay*90*dt,CY-R*.7+10,CY+R*.7-10);}else if(!st.under||true){st.mx+=(M4.cl(I.x,CX-R+12,CX+R-12)-st.mx)*Math.min(1,dt*(st.under?3:9));st.my+=(M4.cl(I.y,CY-R*.7+10,CY+R*.7-10)-st.my)*Math.min(1,dt*(st.under?3:9));}
      if(st.t>9&&!st.black){st.black=1;st.apples.push({x:CX,y:CY+30,vx:0,vy:-6,c:'k',bob:0,rise:1});}
      if(st.cool>0)st.cool-=dt;
      const down=I.down&&st.cough<=0&&st.breath>0&&!(st.cool>0);
      if(down&&!st.under){st.under=1;st.uT=0;MS.plop();A.hiss(.3,.2,'lowpass',900);st.splash.push({x:st.mx,y:st.my,t:0});
        let best=null,bd=10;for(const a of st.apples){const d=Math.hypot(a.x-st.mx,a.y-st.my);if(d<bd){bd=d;best=a;}}
        st.target=best;if(!best){for(const a of st.apples){const d=Math.hypot(a.x-st.mx,a.y-st.my);if(d<34){a.vx+=(a.x-st.mx)/d*40;a.vy+=(a.y-st.my)/d*30;}}}}
      if(st.under){st.uT+=dt;const T=st.target;if(T&&!st.held){if(Math.hypot(T.x-st.mx,T.y-st.my)>12)st.target=null;else if(st.uT>=.4){st.held=T;A.tone(240,.08,'sine',.1);MS.crunch();}}
        st.breath-=dt*.32;if(st.held){st.held.x=st.mx;st.held.y=st.my;}if(st.breath<=0){st.breath=0;st.under=0;st.cough=1.4;st.held=null;A.tone(200,.3,'sawtooth',.04,{slide:120});K.judge(.1,st.mx,st.my-30,true);}
        if(!I.down){st.under=0;st.cool=.5;MS.plop();st.splash.push({x:st.mx,y:st.my,t:0});if(!st.held&&st.target){K.textO('TOO QUICK',st.mx,st.my-26,'#e8c070',1);st.target=null;}
          if(st.held){const a=st.held;st.held=null;st.apples.splice(st.apples.indexOf(a),1);
            if(a.c==='k'){st.got=Math.max(0,st.got-1);K.flash=.4;A.tone(110,.6,'sawtooth',.05,{slide:60,filter:['lowpass',500]});K.textO('IT TASTES OF PENNIES',160,40,'#e8542a',1);}
            else{st.got++;K.judge(a.c==='g'?1:.8,160,24);MS.crunch();K.emit(st.mx,st.my,10,{c:['#cfe8f8','#ffffff'],v:60,g:100,life:.5});}
            if(st.apples.filter(q=>q.c!=='k').length<3)for(let i=0;i<3;i++)st.apples.push({x:CX+(Math.random()-.5)*80,y:CY+(Math.random()-.5)*50,vx:(Math.random()-.5)*14,vy:(Math.random()-.5)*10,c:Math.random()<.3?'g':'r',bob:Math.random()*6});}}}
      else st.breath=Math.min(1,st.breath+dt*.5);
      for(const a of st.apples){if(a===st.held)continue;a.bob+=dt*2;a.x+=a.vx*dt;a.y+=a.vy*dt;a.vx*=1-dt*.6;a.vy*=1-dt*.6;a.vx+=Math.sin(st.t*.7+a.bob)*3*dt;a.vy+=Math.cos(st.t*.5+a.bob)*2*dt;
        const dx=(a.x-CX)/(R-10),dy=(a.y-CY)/((R-10)*.7),d=Math.hypot(dx,dy);if(d>1){a.x=CX+dx/d*(R-10);a.y=CY+dy/d*(R-10)*.7;a.vx*=-.6;a.vy*=-.6;}}
      for(const s of st.splash)s.t+=dt;st.splash=st.splash.filter(s=>s.t<.8);if(st.t>TIME&&!st.under)st.end=.001;},
    draw(t){// the barrel from above: staves, two iron hoops, dark water with the sky in it
      g.drawImage(M4.pre('f2tub',320,180,k=>{// the rim from straight above: staves running out from the middle, two iron hoops, the water flat and dark
        k.ell(CX+4,CY+6,R+20,(R+20)*.72,'#14100c');
        for(let a=0;a<6.283;a+=.012){const st=Math.floor(a/6.283*44),P=CA_P.wood,kk=st%3===0?3:st%3===1?4:5,lit=Math.cos(a+2.3)>.3?1:Math.cos(a+2.3)<-.3?-1:0;
          for(let r=R+1;r<R+17;r++){const x=CX+Math.cos(a)*r,y=CY+Math.sin(a)*r*.72;k.px(x,y,1,1,(Math.floor(a/6.283*44*10)%10===0)?P[1]:P[Math.max(1,Math.min(7,kk+lit))]);}}
        for(const rr of [R+5,R+13])for(let a=0;a<6.283;a+=.01){k.px(CX+Math.cos(a)*rr,CY+Math.sin(a)*rr*.72,1,1,CA_P.iron[Math.cos(a+2.3)>0?4:2]);}
        k.ell(CX,CY,R,R*.72,'#24384a');k.ell(CX-6,CY-5,R-12,(R-12)*.72,'#2c4458');
        for(let x=-34;x<20;x++)k.px(CX+x,CY-R*.5+Math.round(Math.sin(x*.12)*1.5),1,1,'#7a9ab0');},false),0,0);
      for(const s of st.splash){for(let a=0;a<6.28;a+=.4){const r=6+s.t*40;K.pa(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r*.6,2,1,'#cfe8f8',1-s.t/.8);}}
      for(const a of st.apples){if(a===st.held&&st.under)continue;const by=Math.round(Math.sin(a.bob)*1.2);const P=a.c==='g'?['#2a4a14','#3e6a1c','#5a8a2a','#7aaa3a','#a8cc5a']:a.c==='k'?['#060404','#120a0a','#1e1214','#2a1a1c','#3a2628']:['#4a0c08','#7a1810','#a82a1a','#d0482a','#ec7a4a'];
        K.ball(Math.round(a.x),Math.round(a.y)+by,7,P,6);K.px(Math.round(a.x),Math.round(a.y)-7+by,1,3,'#3a2414');K.px(Math.round(a.x)+1,Math.round(a.y)-6+by,3,1,'#4a7a2a');}
      // your face: the shadow on the water, then you going under
      const X=Math.round(st.mx),Y=Math.round(st.my);if(!st.under){g.globalAlpha=.3;K.ell(X+2,Y+2,9,7,'#06101a');g.globalAlpha=1;const r=10+Math.sin(t*4)*1.5;for(let a=0;a<6.28;a+=.25)K.pa(X+Math.cos(a)*r,Y+Math.sin(a)*r*.7,1,1,'#9ab8cc',.7);}
      else{K.pa(0,0,320,180,'#103048',.25);for(let k=0;k<6;k++){const u=(t*1.2+k*.17)%1;K.pa(X-6+k*2,Y-u*30,2,2,'#cfe8f8',1-u);}}
      if(st.held&&!st.under){}
      if(st.cough>0)K.textO('*COUGH*',X,Y-24,'#f4e6c8',1);},
    hud(){K.label('BREATH',292,14,'#f4ecd8');K.gauge(288,24,8,90,.3,1,st.breath,{zone:'#1c3a5a'});K.label(`APPLES ${st.got}`,40,10,'#ffd27a','l');K.label(`${Math.max(0,Math.ceil(TIME-st.t))}`,40,22,'#f4ecd8','l');K.meter(Math.min(1,st.t/TIME),Math.min(1,st.got/6));},
    auto(dt,AP){const a=m4ai(this,AP,dt);const tgt=st.apples.filter(q=>q.c!=='k').sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y))[0];
      let d=false;if(st.under){d=!st.held&&st.breath>.25;}else if(tgt){a.x+=(tgt.x-a.x)*Math.min(1,dt*6);a.y+=(tgt.y-a.y)*Math.min(1,dt*6);d=Math.hypot(tgt.x-a.x,tgt.y-a.y)<4&&st.breath>.6;}
      AP.I={x:a.x,y:a.y,down:d,pressed:d&&!AP._d,released:!d&&AP._d,raw:d};AP._d=d;AP.hand=[a.x+8,a.y+8];AP.press=d;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- PUMPKIN CARVING
S4.f2carve=(sp,K)=>{const g=K.g,TIME=28,CX=160,CY=94,RX=78,RY=60,CS=2,GW=Math.ceil(RX*2/CS),GH=Math.ceil(RY*2/CS);
  const cut=new Uint8Array(GW*GH),inFace=(i,j)=>{const x=(i*CS+CS/2-RX)/RX,y=(j*CS+CS/2-RY)/RY;return x*x+y*y<.86;};
  const st={t:0,end:0,lx:null,ly:null,carved:0,chips:[]};
  const shell=M4.pre('f2pump',RX*2+8,RY*2+20,k=>{const P=['#3a1020','#5a1e10','#7a2c0c','#9a3c12','#b44e1a','#c8622a','#d8783a'];const NR=7;
    for(let y=-RY;y<=RY;y++)for(let x=-RX;x<=RX;x++){const d=(x*x)/(RX*RX)+(y*y)/(RY*RY);if(d>1)continue;
      const th=Math.asin(M4.cl(x/RX/Math.sqrt(Math.max(.05,1-(y*y)/(RY*RY))),-1,1)),ph=(th/Math.PI+.5)*NR,fr=ph-Math.floor(ph);   // where across its rib this pixel is
      const bulge=Math.sin(fr*Math.PI),groove=fr<.06||fr>.94,crest=fr>.28&&fr<.4&&y<RY*.5;const l=-x/RX*.62-y/RY*.5+(bulge-.6)*1.1-(d>.9?.5:0)+(crest?.5:0);
      k.px(x+RX+4,y+RY+14,1,1,groove?P[0]:P[Math.max(1,Math.min(6,Math.round(3+l*2.6)))]);}
    for(let y=0;y<14;y++)k.px(RX+1+Math.round(Math.sin(y*.4)*1.5),y,6,1,y<2?'#6a8a3a':['#2e3a14','#3e4a1c','#4e5a24'][y%3]);},false);
  const carveAt=(x,y)=>{let n=0;const r=2.6;for(let j=Math.floor((y-CY+RY-r)/CS);j<=Math.ceil((y-CY+RY+r)/CS);j++)for(let i=Math.floor((x-CX+RX-r)/CS);i<=Math.ceil((x-CX+RX+r)/CS);i++){
      if(i<0||j<0||i>=GW||j>=GH||!inFace(i,j))continue;const cx=CX-RX+i*CS+CS/2,cy=CY-RY+j*CS+CS/2;if(Math.hypot(cx-x,cy-y)>r)continue;if(!cut[j*GW+i]){cut[j*GW+i]=1;n++;}}
    if(n){st.carved+=n;if(Math.random()<.4)st.chips.push({x,y,vx:(Math.random()-.5)*60,vy:-40-Math.random()*40,t:0});if(Math.random()<.25)A.hiss(.05,.08,'bandpass',1800,{q:1.5});}};
  // the judging: two eyes up top, a wide mouth below, teeth in it, the face even side to side, not hacked to bits
  const judge=()=>{const comps=[];const seen=new Uint8Array(GW*GH);
    for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){if(!cut[j*GW+i]||seen[j*GW+i])continue;const q=[[i,j]];seen[j*GW+i]=1;let n=0,x0=i,x1=i,y0=j,y1=j,sy=0;
      while(q.length){const [a,b]=q.pop();n++;sy+=b;x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b);y1=Math.max(y1,b);for(const [da,db] of [[1,0],[-1,0],[0,1],[0,-1]]){const c=a+da,d=b+db;if(c<0||d<0||c>=GW||d>=GH)continue;const k=d*GW+c;if(cut[k]&&!seen[k]){seen[k]=1;q.push([c,d]);}}}
      comps.push({n,x0,x1,y0,y1,cy:sy/n});}
    const big=comps.filter(c=>c.n>=10);const eyes=big.filter(c=>c.cy<GH*.48).sort((a,b)=>b.n-a.n).slice(0,2);const mouth=big.filter(c=>c.cy>=GH*.48).sort((a,b)=>b.n-a.n)[0];
    let eyeS=eyes.length>=2?1:eyes.length*.4;if(eyes.length>=2&&Math.sign(eyes[0].x0+eyes[0].x1-GW)===Math.sign(eyes[1].x0+eyes[1].x1-GW))eyeS*=.5;
    const mouthS=mouth?M4.cl((mouth.x1-mouth.x0)/(GW*.45),0,1):0;
    let teeth=0;if(mouth){let last=null;for(let i=mouth.x0;i<=mouth.x1;i++){let top=null;for(let j=mouth.y0;j<=mouth.y1;j++)if(cut[j*GW+i]){top=j;break;}if(top!=null&&last!=null&&Math.abs(top-last)>=2)teeth++;if(top!=null)last=top;}}
    const teethS=M4.cl(teeth/6,0,1);let a=0,b=0;for(let j=0;j<GH;j++)for(let i=0;i<GW/2;i++){const L=cut[j*GW+i],R2=cut[j*GW+GW-1-i];if(L||R2){a++;if(L&&R2)b++;}}const sym=a?b/a:0;
    const tot=st.carved/(GW*GH*.68);const cov=tot<.05?tot/.05:tot>.4?M4.cl(1-(tot-.4)*2.5,0,1):1;
    return {score:M4.cl(eyeS*.26+mouthS*.24+M4.cl(sym*1.4,0,1)*.22+teethS*.14+cov*.14,0,1),eyes:eyes.length,mouth:!!mouth,teeth,sym};};
  const AUTO=[[[124,72],[136,60],[146,74],[124,72]],[[176,72],[186,60],[198,74],[176,72]],[[150,92],[160,82],[170,92]],[[118,108],[130,118],[140,110],[150,120],[160,110],[170,120],[180,110],[190,118],[202,108]],[[118,108],[160,132],[202,108]]];
  return {title:'Carve the pumpkin',how:K.fine?'Hold the mouse button and draw to cut. Two eyes up top, a nose if you like, a wide mouth with teeth. The candle shows through. The town likes it even, and frightening.':'Drag your finger to cut. Two eyes up top, a wide mouth with teeth. The candle shows through. The town likes it even, and frightening.',hint:'Draw the face with the knife.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>1.6){if(!st.res)st.res=judge();st.done=true;st.score=st.res.score;if(!F2R.carve||!F2R.carve.res||st.res.score>=F2R.carve.res.score)F2R.carve={res:st.res,img:st.img};}return;}
      if(I.down){const x=I.x,y=I.y;if(st.lx!=null){const n=Math.ceil(Math.hypot(x-st.lx,y-st.ly)/1.2);for(let k=1;k<=n;k++)carveAt(st.lx+(x-st.lx)*k/n,st.ly+(y-st.ly)*k/n);}else carveAt(x,y);st.lx=x;st.ly=y;}else{st.lx=st.ly=null;}
      for(const c of st.chips){c.t+=dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=220*dt;}st.chips=st.chips.filter(c=>c.t<.8);
      if(st.t>TIME){st.end=.001;st.res=judge();K.judge(st.res.score,160,30);MS.good();
        try{const c=document.createElement('canvas');c.width=GW;c.height=GH;const q=c.getContext('2d');q.fillStyle='#d8641a';q.fillRect(0,0,GW,GH);q.fillStyle='#ffe090';for(let j=0;j<GH;j++)for(let i=0;i<GW;i++)if(cut[j*GW+i])q.fillRect(i,j,1,1);st.img=c.toDataURL();}catch(e){}}},
    draw(t){K.plank(10,CY+RY-6,300,10,CA_P.wood,3);K.px(10,CY+RY+4,300,30,'#3a2414');for(let x=14;x<310;x+=26)K.px(x,CY+RY+4,2,30,'#2a180c');
      K.shadow(CX+6,CY+RY-2,RX+6,6,.55);g.drawImage(shell,CX-RX-4,CY-RY-14);
      const fl=.8+Math.sin(t*9)*.1+Math.sin(t*23)*.06;
      for(let j=0;j<GH;j++)for(let i=0;i<GW;i++){if(!cut[j*GW+i])continue;const x=CX-RX+i*CS,y=CY-RY+j*CS;const edge=(j>0&&!cut[(j-1)*GW+i]);
        K.px(x,y,CS,CS,edge?'#f8c878':fl>.85?'#ffe8a0':'#ffd27a');if(edge)K.px(x,y,CS,1,'#c86818');}
      if(st.carved>20)K.glow(CX,CY,RX,'255,200,100',Math.min(.3,st.carved/2000)*fl);
      for(const c of st.chips)K.px(c.x,c.y,2,2,'#f0a050');
      if(!st.end){const x=st.lx!=null?st.lx:this._ix||160,y=st.ly!=null?st.ly:this._iy||90;K.px(x,y-14,2,14,'#c8ccd4');K.px(x,y-14,1,14,'#ffffff');K.px(x-1,y-24,4,10,CA_P.wood[4]);m4hand(K,x-4,y-26);}},
    hud(){K.label('TIME',296,14,'#f4ecd8');K.gauge(292,24,8,90,0,1,Math.max(0,1-st.t/TIME),{zone:'#5a3a1a'});K.meter(Math.min(1,st.t/TIME));},
    auto(dt,AP){const a=m4ai(this,AP,dt);a.k=a.k||{p:0,s:0};const P=AUTO[a.k.p%AUTO.length],q=P[Math.min(P.length-1,Math.floor(a.k.s))],r=P[Math.min(P.length-1,Math.floor(a.k.s)+1)],f=a.k.s%1;
      const x=q[0]+(r[0]-q[0])*f,y=q[1]+(r[1]-q[1])*f;a.k.s+=dt*3;if(a.k.s>=P.length-1){a.k.p++;a.k.s=0;}AP.I={x,y,down:a.k.s>.05,raw:true};AP.hand=[x,y];AP.press=true;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- the defs and what each game pays (each step leaves what happened on F2R)
const f2Def=(k,t)=>()=>{delete F2R[k.slice(2)];return {scene:'fair',reveal:m4ico('candy_apple'),steps:[{k,t}]};};
Object.assign(F2G,{
  toss:{def:f2Def('f2toss','Five rings'),done(q){const p=(F2R.toss||{}).pts!=null?F2R.toss.pts:Math.round(q*12);f2Tix(p);if(p>(F2S().rec.toss||0))F2S().rec.toss=p;
    toast(`Ring toss: ${p} point${p===1?'':'s'}. +${p} fair ticket${p===1?'':'s'}.${p>=12?' Nell shouts it across the square.':''}`,3);}},
  bell:{def:f2Def('f2bell','Ring the bell'),done(q){const b=Math.round(((F2R.bell||{}).best!=null?F2R.bell.best:q)*100);const tk=b>=95?10:b>=80?6:b>=60?4:b>=40?2:1;f2Tix(tk);
    if(b>(F2S().rec.bell||0))F2S().rec.bell=b;toast(b>=95?`DING! The whole square turns round. ${b}. +${tk} tickets. Gideon claps you on the back hard enough to hurt.`:`${b}. +${tk} ticket${tk===1?'':'s'}.`,3.2);}},
  crows:{def:f2Def('f2crows','Shoot the crows'),done(q){const p=(F2R.crows||{}).pts!=null?F2R.crows.pts:Math.round(q*16);f2Tix(p);if(p>(F2S().rec.crows||0))F2S().rec.crows=p;
    toast(`Crow shoot: ${p} point${p===1?'':'s'}. +${p} fair ticket${p===1?'':'s'}.`,2.8);}},
  bob:{def:()=>{delete F2R.bob;return {scene:'tub',reveal:m4ico('candy_apple'),steps:[{k:'f2bob',t:'Bob for apples'}]};},done(q){const n=(F2R.bob||{}).got!=null?F2R.bob.got:Math.round(q*6);const tk=Math.min(12,n*2);f2Tix(tk);if(n)addInv('candy_apple',Math.min(2,n));
    if(n>(F2S().rec.bob||0))F2S().rec.bob=n;toast(`${n} apple${n===1?'':'s'}! +${tk} fair tickets${n?' and a candied apple from Caitlyn':''}.${n>=6?' Finn looks at you with real respect.':''}`,3);}},
  carve:{def:f2Def('f2carve','Carve a face'),done(q){const c=F2R.carve||{};const D=f2D();D.carveImg=c.img||null;f2Enter('carve',q,{img:c.img});const r=c.res||{};
    toast(`Your carving goes on the shelf with the others: ${r.eyes>=2?'two eyes':r.eyes===1?'one eye':'no eyes to speak of'}, ${r.mouth?'a mouth':'no mouth'}${r.teeth>=3?' full of teeth':''}. The town votes at half past three.`,4);}}});
// ---------------------------------------------------------------- the weigh-in, on the scale
F2G.weighShow=function(rows,cb){const order=rows.slice();const W=320,H=180;
  openNote(`<h3>The Pumpkin Weigh-in</h3><canvas id="f2wc" width="${W*2}" height="${H*2}" style="width:100%;max-width:640px;image-rendering:pixelated;display:block;margin:0 auto"></canvas><p class="jsub" id="f2wl">Hale lifts the first pumpkin onto the pan…</p>`,'…');
  const cv=$('f2wc'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;const K=mg4Kit(g);g.setTransform(2,0,0,2,0,0);
  let i=0,ph=0,needle=0,shown=[],t0=performance.now(),dead=false;const btn=$('noteClose');btn.disabled=true;
  const loop=now=>{if(dead||$('note').hidden){dead=true;return;}const t=(now-t0)/1000;const dt=1/60;g.setTransform(2,0,0,2,0,0);MG4ART.scene(K,'fair',t);
    const cur=order[i];if(cur){ph+=dt;const tgt=cur.lb/70;const k=ph<.6?0:Math.min(1,(ph-.6)/1.4);needle=k<1?tgt*(1-Math.cos(k*Math.PI*3.5)*Math.exp(-k*3))*Math.min(1,k*3):tgt;
      if(ph>3.2){shown.push(cur);A.tone(523+shown.length*60,.2,'triangle',.06);i++;ph=0;const L=$('f2wl');if(L)L.textContent=order[i]?`${cur.n}: ${cur.lb} lb. Next, ${order[i].n}’s…`:`${cur.n}: ${cur.lb} lb. That’s all of them.`;}}
    // the scale: frame, dial, pan
    K.px(120,40,6,110,CA_P.wood[3]);K.px(194,40,6,110,CA_P.wood[3]);K.px(116,36,88,8,CA_P.wood[5]);K.px(116,36,88,1,CA_P.wood[7]);
    K.ball(160,62,20,['#6a6052','#c8c0a8','#e8e0c8','#f4ecd8','#fffaf0'],20);for(let k=0;k<=7;k++){const a=Math.PI*.8+k/7*Math.PI*1.4;K.px(160+Math.cos(a)*16,62+Math.sin(a)*16,1,1,'#3a2a1a');}
    const a=Math.PI*.8+Math.min(1,needle)*Math.PI*1.4;K.line(160,62,160+Math.cos(a)*15,62+Math.sin(a)*15,'#a8301c',1);K.px(159,61,3,3,'#3a2a1a');
    K.line(150,84,160,100,'#4a4a52',1);K.line(170,84,160,100,'#4a4a52',1);K.px(159,82,2,18,'#4a4a52');const drop=cur?Math.round(Math.min(1,needle)*8):0;
    K.ell(160,112+drop,30,6,'#5a5a64');K.ell(160,110+drop,28,4,'#8a8a94');if(cur&&ph>.3)K.ball(160,96+drop,Math.round(10+cur.lb/7),F2C.pump,Math.round(8+cur.lb/9));
    if(cur){K.plaque(cur.n.toUpperCase(),'#ffd27a',140,null,1);if(ph>2)K.textO(`${cur.lb} LB`,160,124,'#fff4c0',2);}
    shown.forEach((r,j)=>K.label(`${r.n} ${r.lb}`,12,14+j*10,r.me?'#ffd27a':'#f4ecd8','l'));
    if(i>=order.length){btn.disabled=false;btn.textContent='See who won';btn.onclick=()=>{dead=true;btn.onclick=null;$('note').hidden=true;S.paused=false;cb(order.slice().sort((p,q)=>q.lb-p.lb));};return;}
    requestAnimationFrame(loop);};requestAnimationFrame(loop);};
// the carvings shown in the vote
{const _v=f2Vote;f2Vote=function(){_v.apply(this,arguments);try{const D=f2D();if(D.carveImg){const N=$('noteText');const im=document.createElement('img');im.src=D.carveImg;im.style.cssText='display:block;margin:6px auto;width:160px;image-rendering:pixelated;border-radius:40% 40% 46% 46%';N.insertBefore(im,N.children[1]||null);}}catch(e){}};}
MG4ART.paint.tub=function(K){// the green by the steps from above: trodden dirt round the barrel, grass beyond it, a few leaves
  for(let y=0;y<180;y++)for(let x=0;x<320;x+=2){const d=Math.hypot((x-160)/1.3,(y-96))+Math.sin(x*.07)*6+Math.sin(y*.11)*5;K.px(x,y,2,1,d<128?['#5a4a36','#56462f','#5e4e38'][((x>>3)+(y>>2))%3]:d<138?'#4a5a30':['#3e5a2a','#44602c','#3a5428'][((x>>2)+(y>>3))%3]);}
  for(let i=0;i<90;i++){const x=K.H32(i,1,4)*320|0,y=K.H32(i,2,4)*180|0;if(Math.hypot((x-160)/1.3,y-96)<140)continue;K.px(x,y,1,3,'#5e7a3a');K.px(x+1,y+1,1,2,'#2e4a22');}
  for(let i=0;i<40;i++){const x=K.H32(i,5,4)*320|0,y=K.H32(i,6,4)*180|0;K.px(x,y,2,1,['#b8582a','#d88a3a','#8a3a1a'][i%3]);}};
MG4ART.anim.tub=function(K,t){};MG4ART.LIGHT.tub={x:40,y:20,r:360,c:'255,212,160',a:.2,mote:'#e8d8b8'};MAMB.tub=MAMB.fair;
// ---------------------------------------------------------------- THE LANTERN DANCE, on the same stage as the fair games
// (the old little canvas game is kept for its ending: who you danced with, the hearts, the scene after)
MG4ART.paint.dance=function(K){// the square at dusk going to night: a deep blue sky, the bandstand roof, the floor laid on the grass
  const SKY=['#141a2e','#1a2036','#20263e','#282c46','#30324c','#3a3850','#463e54'];for(let y=0;y<80;y++)K.px(0,y,320,1,SKY[Math.min(6,(y/11.5)|0)]);
  for(let i=0;i<40;i++){const x=K.H32(i,1,7)*320|0,y=K.H32(i,2,7)*50|0;K.px(x,y,1,1,i%5?'#8a8aa8':'#d8d8f0');}
  K.ell(254,14,5,5,'#e8e4d0');K.ell(256,13,4,4,'#141a2e');   // a thin moon
  for(const [x,w,h] of [[0,60,22],[54,40,30],[214,50,26],[262,58,20]]){K.px(x,80-h,w,h,'#12121c');K.px(x-2,80-h,w+4,2,'#1a1a26');}
  for(let k=0;k<26;k++)K.px(160-k*2,46+k,k*4+1,1,k%4<2?'#1e3a2a':'#c8c0a8');K.px(110,72,100,8,'#1a1a22');   // the bandstand roof
  for(let y=80;y<180;y++)K.px(0,y,320,1,['#1a2418','#1e2a1c','#222e1e'][(y>>3)%3]);
  for(let y=104;y<170;y++){const w=Math.round(120+(y-104)*1.6);for(let x=160-w;x<160+w;x++){const b=((y-104)>>3);K.px(x,y,1,1,(y-104)%8===0?'#7a5a36':(((x+b*29)>>5)&1)?'#5e4428':'#56402a');}}};
MG4ART.anim.dance=function(K,t){// the lantern strings overhead, glowing; couples turning at the back of the floor
  for(const [y0,sag] of [[18,14],[34,10]]){for(let x=0;x<320;x+=2)K.px(x,y0+Math.sin(x/320*Math.PI)*sag,2,1,'#0a0a10');
    for(let i=0;i<9;i++){const x=16+i*36,y=Math.round(y0+Math.sin(x/320*Math.PI)*sag)+2,b=Math.sin(t*1.7+i)*.12;K.px(x-3,y,7,9,'#a8441a');K.px(x-2,y+1,5,7,'#f0a040');K.px(x-1,y+2,3,4,'#ffe090');K.glow(x,y+4,22,'255,180,80',.24+b);}}
  const g=K.g,PAIRS=[['otto','orla'],['hob','tess'],['gideon','iris']];
  const body=(id,dir,f,x,y)=>{const m=SPR[id],im=m&&IMG[m.src];if(!im||!im.complete)return false;const C=m.clips||{};const row=((C.walk||{})[dir]||[3,9]);g.drawImage(im,(f%row[1])*m.fw,row[0]*m.fh,m.fw,m.fh,Math.round(x-m.ax),Math.round(y-m.ay),m.fw,m.fh);return true;};
  PAIRS.forEach(([a,b],i)=>{const cx=62+i*98,ph=(t*.5+i*.37)%4,turn=ph>3.4?(ph-3.4)/.6:0,sw=Math.sin(t*2.6+i)*2,f=Math.floor(t*6+i*3);
    const side=turn>0?Math.cos(turn*Math.PI):1;const y=104;   // every few bars they turn once round each other
    const xa=cx-11*side+sw,xb=cx+11*side+sw;const da=side>0?'E':'W',db=side>0?'W':'E';
    K.shadow(cx,y+1,22,3,.35);if(body(a,da,f,xa,y)&&body(b,db,f+4,xb,y)){K.line(Math.min(xa,xb)+6,y-23,Math.max(xa,xb)-6,y-23,'#d8a880',1);}});};
MG4ART.LIGHT.dance={x:160,y:30,r:260,c:'255,170,90',a:.3,ember:0};MAMB.dance={bed:['bandpass',420,.4,.014],ev:[[3,()=>A.tone(660+Math.random()*120,.18,'triangle',.012)]]};
S4.f2dance=(sp,K)=>{const g=K.g,N=16,BEAT=.66,T0=1.6,RX=64,RY=124;
  const notes=Array.from({length:N},(_,i)=>({t:T0+i*BEAT*(i%4===3?1.5:1)+(i>7?.33:0)+(i>11?.2:0),hit:null}));const st={t:0,end:0,score:0,flash:0,hearts:[]};
  const path=u=>[RX+u*230,RY-Math.sin(Math.min(1,u)*Math.PI)*36-u*10];   // lanterns come down a string from the right to the ring
  return {title:'Keep time',how:K.fine?'Lanterns come down the string to the ring. Click (or press Space) just as each one reaches it.':'Lanterns come down the string to the ring. Tap just as each one reaches it.',hint:'Press as each lantern reaches the ring.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>1.2){st.done=true;st.score=st.score/N;F2R.dance={hits:st.score};}return;}
      if(I.pressed){let best=null,bd=.22;for(const n of notes){if(n.hit!==null)continue;const d=Math.abs(n.t-st.t);if(d<bd){bd=d;best=n;}}
        if(best){best.hit=true;st.score++;st.flash=.6;const q=bd<.07?1:bd<.14?.8:.62;K.judge(q,RX,RY-40);A.tone(440+st.score*28,.14,'triangle',.07);if(q>=1)st.hearts.push({x:RX+10,y:RY-10,t:0});}
        else{A.tone(150,.1,'square',.03);K.judge(.1,RX,RY-40,true);}}
      for(const n of notes)if(n.hit===null&&st.t-n.t>.24){n.hit=false;K.combo=0;}
      for(const h of st.hearts)h.t+=dt;st.hearts=st.hearts.filter(h=>h.t<1.4);if(st.flash>0)st.flash-=dt;
      if(st.t>notes[N-1].t+1)st.end=.001;},
    draw(t){// the string and the ring, the lanterns sliding down, hearts going up
      for(let u=0;u<=1;u+=.004){const [x,y]=path(u);K.px(x,y-6,1,1,'#2a1a10');}
      K.px(RX-14,RY-14,28,28,'rgba(0,0,0,0)');for(let a=0;a<6.28;a+=.08){K.px(RX+Math.cos(a)*13,RY-6+Math.sin(a)*13,2,2,st.flash>0?'#ffe8a0':'#e8c070');}
      if(st.flash>0)K.glow(RX,RY-6,30,'255,220,120',st.flash*.6);
      for(const n of notes){if(n.hit===true)continue;const u=(n.t-st.t)/2.2;if(u<-.15||u>1.05)continue;const [x,y]=path(Math.max(0,u));const miss=n.hit===false;
        K.px(x-4,y-12,9,12,miss?'#4a2a1a':'#a8441a');K.px(x-3,y-11,7,10,miss?'#5a3a2a':'#f0a040');K.px(x-1,y-9,3,5,miss?'#6a4a32':'#ffe090');K.px(x,y-14,1,2,'#2a1a10');if(!miss)K.glow(x,y-6,14,'255,180,80',.25);}
      for(const h of st.hearts){const y=h.y-h.t*40,x=h.x+Math.sin(h.t*6)*4;for(const [dx,dy] of [[-2,0],[-1,-1],[1,-1],[2,0],[-2,1],[-1,1],[0,1],[1,1],[2,1],[-1,2],[0,2],[1,2],[0,3]])K.pa(x+dx,y+dy,1,1,'#e8506a',1-h.t/1.4);}},
    hud(){K.label(`${st.score}/${N}`,296,10,'#ffd27a','r');K.meter(Math.min(1,st.t/(notes[N-1].t+1)),notes.filter(n=>n.hit!==null).length?st.score/notes.filter(n=>n.hit!==null).length:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const d=notes.some(n=>n.hit===null&&st.t-n.t>-.03&&st.t-n.t<.1);AP.I={x:160,y:90,down:d,pressed:d&&!AP._d,raw:d};AP._d=d;AP.hand=[RX,RY+10];AP.press=d;},
    quiet(){},stop(){}};};
if(typeof fGame==='function'){const _fg=fGame;fGame=function(title,hint,draw,press,done){
  if(/^Lantern Dance/.test(String(title))&&typeof mg4Run==='function'){F2G.skipped=false;delete F2R.dance;
    mg4Run({scene:'dance',reveal:m4ico('bouquet'),steps:[{k:'f2dance',t:'Keep time'}]},title,q=>{const r=F2G.skipped?null:((F2R.dance||{}).hits!=null?F2R.dance.hits:q);done(r);});return;}
  return _fg.apply(this,arguments);};}
