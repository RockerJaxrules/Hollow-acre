/* ================= the crafts: cut cloth and leather along the chalk, sew a running stitch, braid rag strips, scoop a pumpkin,
   weigh by a swinging needle, sieve and thresh, pull a knot tight, dip candles, cork a flask, roll pastry, crimp a pie, bake it golden,
   stuff a dress form. Each its own game with its own look and sound. ================= */
// ---------------------------------------------------------------- shared bits
const m4cloth=(key,w,h,P,seed)=>M4.pre(key,w,h,k=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const n=k.H32(x%200,y,seed||3);const v=((x+y)&1)?1:0;const lv=3+v-((((x>>1)+(y>>1))%5===0)?1:0)-(n>.95?1:0);k.px(x,y,1,1,P[Math.max(0,Math.min(P.length-1,lv))]);}});
// still things drawn once: planks, a board, a vat
const m4blk=(key,w,h,fn)=>M4.pre(key,w,h,fn);
// woven canvas: threads over and under, a soft light across the folds; and pebbled leather with creases
const m4weave=(key,w,h,P,seed)=>M4.pre(key+'_v3',w,h,k=>{// flat cloth: one body tone, a few drape folds drawn as tapered curves (a lit crest, its
  // shadow just under it), a frayed selvedge on the left, a darker hem with a lit top edge, pins at the corners of a laid-out sheet
  const sheet=w<300&&h>60&&!/^sew/.test(key);k.px(0,0,w,h,P[3]);
  if(sheet){for(let f=0;f<3;f++){const x0=w*(.1+f*.3)+k.H32(f,1,seed)*20,y0=h*(.15+k.H32(f,2,seed)*.3),len=40+k.H32(f,3,seed)*50,ang=.35+k.H32(f,4,seed)*.4;
      for(let i=0;i<len;i++){const u=i/len,taper=Math.sin(u*Math.PI),x=Math.round(x0+Math.cos(ang)*i),y=Math.round(y0+Math.sin(ang)*i+Math.sin(u*5+f)*2);if(x<2||x>=w-2||y<2||y>=h-4)continue;
        k.px(x,y,1,1,P[4]);const sw=taper>.6?2:taper>.2?1:0;if(sw)k.px(x,y+1,1,sw,P[2]);}}
    for(let y=2;y<h-3;y+=2)k.px(0,y,1+((y*7)%3===0?2:1),1,P[2]);
    for(const [px,py] of [[4,4],[w-6,4],[4,h-8],[w-6,h-8]]){k.px(px,py,3,1,'#c8c8d0');k.px(px+3,py-1,2,2,'#a83a2a');k.px(px+3,py-1,1,1,'#e86a5a');}}
  k.px(0,0,w,1,P[5]);k.px(0,h-2,w,2,P[1]);if(/^sew/.test(key)){for(let x=0;x<w;x+=6)k.px(x,h-5,3,1,P[2]);}});
const m4hide=(key,w,h,P,seed)=>M4.pre(key,w,h,k=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){// smooth hide: a soft sheen across it, fine pebbles, now and then a crease
  const sheen=Math.sin(x*.025+y*.012+seed)*.5+Math.sin(y*.04)*.3;const peb=k.H32(x>>1,y>>1,seed);let lv=4+(sheen>.45?1:sheen<-.45?-1:0)+(peb>.88?1:0)-(peb<.06?1:0);
  if(Math.abs(Math.sin(x*.11+y*.031+seed)*Math.sin(y*.07))<.015)lv-=1;k.px(x,y,1,1,P[Math.max(0,Math.min(P.length-1,lv))]);}});
// the dress form: f is how full each side is stuffed (0 flat and sagging, 1 full)
const m4form=(K,cx,top,fl,fr,t)=>{const g=K.g,L=['#8a7a5a','#b0a07a','#ccbe96','#e2d6b2','#f2e8cc','#fbf6e4'];
  const half=(s,f)=>{const pts=[[0,0],[9,1],[17,6],[19,12],[18,22],[13,34],[12,40],[15,52],[17,60],[14,64],[0,64]];g.beginPath();pts.forEach(([x,y],i)=>{const sag=(1-f)*(y>8&&y<60?Math.sin(y/64*Math.PI)*5:0);const X=cx+s*(x*(.7+.3*f)-sag*.4),Y=top+y+(1-f)*(y>20?2:0);i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();};
  K.px(cx-1,top+64,3,40,CA_P.wood[3]);K.px(cx-1,top+64,1,40,CA_P.wood[5]);for(const s of [-1,0,1])K.line(cx,top+100,cx+s*20,top+110,CA_P.wood[3],2);K.ell(cx,top+111,24,3,'#00000040');
  for(const [s,f] of [[-1,fl],[1,fr]]){half(s,f);const gr=g.createLinearGradient(cx-20*s,0,cx+4*s,0);gr.addColorStop(0,s<0?L[4]:L[2]);gr.addColorStop(1,s<0?L[3]:L[1]);g.fillStyle=gr;g.fill();g.strokeStyle='#5a4a32';g.lineWidth=1;g.stroke();
    for(let y=4;y<62;y+=3)K.pa(cx+s*(4+((y*7)%9)),top+y,1,1,L[0],.5);if(f<.6)for(let k=0;k<4;k++)K.line(cx+s*6,top+20+k*9,cx+s*15,top+23+k*9,L[1],1);}
  K.px(cx,top+2,1,62,'#8a6a4a');for(let y=4;y<62;y+=4)K.px(cx-1,top+y,3,1,'#a8885a');
  K.ball(cx,top-4,5,CA_P.wood,4);K.px(cx-2,top-1,5,3,CA_P.wood[3]);};
const m4len=pts=>{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L;};
const m4at=(pts,s)=>{for(let i=1;i<pts.length;i++){const d=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(s<=d||i===pts.length-1){const u=d?Math.min(1,s/d):0;return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*u,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*u,Math.atan2(pts[i][1]-pts[i-1][1],pts[i][0]-pts[i-1][0])];}s-=d;}return [pts[0][0],pts[0][1],0];};
const m4near=(pts,x,y)=>{let best=1e9,bs=0,acc=0;for(let i=1;i<pts.length;i++){const [ax,ay]=pts[i-1],[bx,by]=pts[i];const dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;let u=((x-ax)*dx+(y-ay)*dy)/(L*L);u=Math.max(0,Math.min(1,u));const px=ax+dx*u,py=ay+dy*u,d=Math.hypot(x-px,y-py);if(d<best){best=d;bs=acc+u*L;}acc+=L;}return [best,bs];};
const M4C={
  shears:()=>M4.pre('shears',40,22,(K,g)=>{const I=CA_P.iron;for(let i=0;i<22;i++){K.px(1+i,8-i*.12,1,2,I[i<3?7:5]);K.px(1+i,11+i*.12,1,2,I[i<3?6:4]);}K.px(22,8,3,5,I[3]);g.strokeStyle='#2a2a2a';g.lineWidth=2;for(const yy of [6,15]){g.beginPath();g.ellipse(31,yy,5,3.5,0,0,6.29);g.stroke();}},true),
  needle:()=>M4.pre('needle',6,30,(K,g)=>{for(let y=1;y<28;y++)K.px(2,y,y<4?2:1,1,y<4?CA_P.iron[4]:CA_P.iron[6]);g.clearRect(2,2,1,1);K.px(3,1,1,4,CA_P.iron[7]);},true),
  spoon:()=>M4.pre('spoon',44,16,K=>{const I=CA_P.iron;K.ell(8,8,7,5,I[5]);K.ell(8,8,5,3,I[3]);K.px(6,6,3,1,I[7]);for(let x=14;x<42;x++)K.px(x,7+(x-14)*.05,1,2,x>30?CA_P.wood[4]:I[5]);},true),
  pin:()=>M4.pre('pin',72,16,K=>{const W=CA_P.wood;for(let x=12;x<60;x++){for(let y=2;y<14;y++){const r=Math.abs(y-8)/6;K.px(x,y,1,1,W[r<.3?6:r<.6?5:r<.85?4:3]);}}for(const hx of [1,60]){for(let x=0;x<11;x++)for(let y=5;y<11;y++)K.px(hx+x,y,1,1,W[y<7?6:y<9?4:3]);}},true),
  flail:()=>M4.pre('flail',8,40,K=>{for(let y=1;y<38;y++)K.px(2,y,4,1,CA_P.wood[y%9===0?3:5]);K.px(2,1,4,1,CA_P.wood[7]);},true)};
// ---------------------------------------------------------------- TRACE: follow the line with shears, knife or putty knife; steady and on the line
S4.trace=(sp,K)=>{const g=K.g,paths=sp.paths,surf=sp.surface||'canvas',tool=sp.tool||'shears';
  const total=paths.reduce((a,p)=>a+m4len(p),0);
  const st={pi:0,s:0,tx:paths[0][0][0],ty:paths[0][0][1],q:[],seg:[],cut:[],t:0,end:0,snip:0,wob:Math.random()*6,spd:0,jump:0};let loop=null;
  const P=()=>paths[st.pi];
  const SURF={canvas:['#7a6a4a','#8e7e5a','#a8966c','#bcaa80','#cdbd94','#ddd0aa'],leather:CA_P.leather,denim:['#1c2a48','#2c3e62','#3c527c','#4e6894','#6280aa','#7a98c0']};
  return {title:sp.t||'Cut along the line',how:(tool==='shears'?'Cut':'Follow')+' the line from start to end: '+(K.fine?'hold the mouse button and move along it (or hold Space and steer with W/S/A/D)':'drag along it with your finger')+'. Stay on the line and don’t rush.',hint:'Stay on the line. Steady, not fast.',st,
    update(dt,I){st.t+=dt;if(!loop)loop=MS.loop('bandpass',tool==='knife'?3200:tool==='putty'?900:4200,1.2);
      if(st.end){st.end+=dt;loop.set(0);if(st.end>1){st.done=true;st.score=M4.avg(st.q);}return;}
      if(st.jump>0){st.jump-=dt;if(st.jump<=0){const [x,y]=P()[0];st.tx=x;st.ty=y;}return;}
      const path=P(),L=m4len(path);let tx=st.tx,ty=st.ty;
      if(I.key){if(I.down){const [ax,ay,an]=m4at(path,st.s+3);const nx=-Math.sin(an),ny=Math.cos(an);const wob=Math.sin(st.t*2.4+st.wob)*10+Math.sin(st.t*5.7)*4;
          tx=st.tx+(ax-st.tx)*.6+nx*wob*dt*1.4+(I.ax||0)*30*dt;ty=st.ty+(ay-st.ty)*.6+ny*wob*dt*1.4+(I.ay||0)*30*dt;const d=Math.hypot(ax-st.tx,ay-st.ty);if(d>0){tx=st.tx+(tx-st.tx)*Math.min(1,55*dt/Math.max(d,1)*1.5);ty=st.ty+(ty-st.ty)*Math.min(1,55*dt/Math.max(d,1)*1.5);}}}
      else if(I.down){tx=I.x;ty=I.y;}
      const dx=tx-st.tx,dy=ty-st.ty,dd=Math.hypot(dx,dy),mx=200*dt;if(dd>mx){tx=st.tx+dx/dd*mx;ty=st.ty+dy/dd*mx;}const moved=Math.hypot(tx-st.tx,ty-st.ty);st.tx=tx;st.ty=ty;st.spd+=(moved/dt-st.spd)*Math.min(1,dt*8);
      if(I.down){const [dist,s2]=m4near(path,st.tx,st.ty);if(s2>st.s&&s2-st.s<14&&dist<12){const fast=st.spd>130;while(st.s<s2){st.s=Math.min(s2,st.s+1);const e=dist+(fast?1.5:0);const q=M4.q(e,1.6,3.2,5.5);st.q.push(q);st.seg.push(q);st.cut.push([st.tx,st.ty,st.pi,fast]);
            st.snip+=1;if(tool==='shears'&&st.snip>=6){st.snip=0;MS.snip();}if(st.seg.length>=24){const m=M4.avg(st.seg);K.judge(m>.9?1:m>.7?.75:m>.4?.45:.15,surf==='pumpkin'?st.tx-44:96,surf==='pumpkin'?st.ty-40:12,true);if(m<.4)MS.miss();st.seg=[];}}}
        loop.set(tool==='shears'?0:Math.min(.12,st.spd/1000),undefined,undefined);}else loop.set(0);
      if(st.s>=L-1.5){if(st.pi<paths.length-1){st.pi++;st.s=0;st.jump=.35;MS.good();}else{st.end=.001;MS.good();if(tool==='shears')MS.snip();}}},
    draw(t){
      if(surf==='pumpkin'){const cx=160,cy=84;g.drawImage(m4blk('pumpkinface',200,136,k=>{for(let y=-58;y<=58;y++){const w=Math.round(96*Math.sqrt(Math.max(0,1-(y/60)**2)));for(let x=-w;x<=w;x++){const rib=Math.abs(Math.sin((x/w)*Math.PI*2.5));const l=-x/w*.35-y/60*.45+rib*.25;k.px(100+x,72+y,1,1,['#7a2e08','#a8420e','#d05a16','#e8742a','#f49a48','#fcc070'][Math.max(0,Math.min(5,Math.round(2.6+l*3)))]);}}
        k.px(96,0,8,14,'#4a6a2a');k.px(96,0,2,14,'#6a8a3a');}),cx-100,cy-72);if(sp.glow&&st.end){for(const p of paths){g.fillStyle=`rgba(255,${190+Math.sin(t*9)*20|0},90,.9)`;g.beginPath();g.moveTo(p[0][0],p[0][1]);for(const q of p)g.lineTo(q[0],q[1]);g.fill();}K.glow(cx,cy,70,'255,190,90',.35+Math.sin(t*9)*.05);}}
      else if(surf==='glass'){g.drawImage(m4blk('glassfr',200,80,k=>k.planks(0,0,200,80,CA_P.wood,10,4,true)),60,40);for(let r=0;r<2;r++)for(let c=0;c<3;c++){K.pa(66+c*64,46+r*36,58,30,'#c8e2f0',.55);K.px(70+c*64,48+r*36,10,1,'#ffffff');}}
      else{const C=surf==='leather'?m4hide('hide_'+surf,220,96,CA_P.leather,5):m4weave('wv_'+surf,220,96,SURF[surf]||SURF.canvas,7);K.pa(54,30,220,96,'#000',.3);g.drawImage(C,50,26);for(let x=50;x<270;x+=3)K.px(x,26,2,1,SURF[surf]?SURF[surf][5]:'#ddd0aa');}
      // the line to follow, then what you've done
      paths.forEach((p,pi)=>{if(pi<st.pi&&tool!=='putty')return;const L=m4len(p);for(let s=pi===st.pi?st.s:0;s<L;s+=4){const [x,y]=m4at(p,s);K.px(x,y,2,1,surf==='pumpkin'?'#3a1a08':surf==='glass'?'#7a6a4a':'#fff8e8');}});
      for(const [x,y,pi,f] of st.cut){if(tool==='putty'){K.px(x-1,y-1,3,3,'#b8ac90');K.px(x-1,y-1,3,1,'#d8ccb0');}else if(surf==='pumpkin'){K.px(x,y,2,2,'#2a0e04');K.px(x,y+2,2,1,'#f8d080');}else{K.px(x,y,1,1,'#1a0e06');K.px(x+1,y,1,1,f?'#6a4a2a':'#2a1a0c');}}
      if(st.end&&surf!=='pumpkin'&&tool==='shears'){const u=Math.min(1,st.end*1.5);const p=paths[paths.length-1];g.save();g.translate(u*24,u*10);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(p[0][0]+3,p[0][1]+3);for(const q of p)g.lineTo(q[0]+3,q[1]+3);g.fill();g.restore();}
      // the tool
      if(!st.end||tool==='shears'){const [,,an]=m4at(P(),Math.min(st.s+2,m4len(P())));if(tool==='shears'){const open=Math.abs(Math.sin(st.s*.5))*.35;M4.rot(g,M4C.shears(),st.tx,st.ty,an+Math.PI,1,10);K.line(st.tx,st.ty,st.tx-Math.cos(an+open)*20,st.ty-Math.sin(an+open)*20,CA_P.iron[6],1);const [hx,hy]=M4.tr(st.tx,st.ty,an+Math.PI,30,6);m4sleeve(K,hx+3,hy,hx+30,hy+20);m4hand(K,hx,hy);}
        else if(tool==='knife'){M4.rot(g,M4S.knife(),st.tx,st.ty,-.5,8,44);const [hx,hy]=M4.tr(st.tx,st.ty,-.5,0,-38);m4sleeve(K,hx+3,hy,hx+30,hy+20);m4hand(K,hx,hy);}
        else{K.px(st.tx-5,st.ty-2,10,3,CA_P.iron[5]);K.px(st.tx-5,st.ty-2,10,1,CA_P.iron[7]);K.line(st.tx,st.ty-2,st.tx+10,st.ty-20,CA_P.wood[4],3);m4hand(K,st.tx+11,st.ty-22);}}
      if(st.jump>0){const [x,y]=P()[0];K.pa(x-3,y-3,6,6,'#ffd27a',.6+Math.sin(t*20)*.3);}},
    hud(){K.meter((paths.slice(0,st.pi).reduce((a,p)=>a+m4len(p),0)+st.s)/total,M4.avg(st.q)||1);if(st.spd>130&&!st.end)K.label('TOO FAST',160,14,'#e8542a');if(paths.length>1)K.label('PIECE '+Math.min(paths.length,st.pi+1)+'/'+paths.length,30,14,'#f4ecd8','l');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.jump>0||st.t<.5){const [x,y]=P()[0];m4move(a,x,y);m4hold(a,false);}else{this._s=Math.max(this._s||0,st.s)+58*dt;const [x,y]=m4at(P(),this._s);m4move(a,x+Math.sin(st.t*3)*.6,y);m4hold(a,true);if(this._s>=m4len(P()))this._s=0;}AP.hand=[a.x+6,a.y-30];AP.press=a.down;},
    quiet(){loop&&loop.set(0);},stop(){loop&&loop.stop();loop=null;}};};
// ---------------------------------------------------------------- SEW: a running stitch. Tap as each chalk tick passes under the needle, and keep the seam under it
S4.sew=(sp,K)=>{const g=K.g,NX=150,SP=10,N=sp.n||14,P=sp.cloth||['#5a4a30','#6e5c3c','#82704a','#968458','#a89668','#bcaa7c'];const cloth=m4weave('sew'+P[3],200,90,P,11);
  const st={off:0,dy:0,drift:0,stitches:[],q:[],t:0,end:0,nd:0,next:0,seamY:t=>0};
  const seam=x=>Math.sin(x*.012)*10+Math.sin(x*.031)*4;
  return {title:sp.t||'Sew the seam',how:'The cloth feeds under the needle. Tap to stitch as each chalk tick passes the needle, and keep the seam under it: '+(K.fine?'move the mouse up/down (or W/S)':'drag up and down')+'.',hint:'Tap on each tick; keep the seam under the needle.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.q);}return;}
      st.off+=dt*(sp.speed||17);if(I.ay)st.dy+=I.ay*40*dt;else if(I.down&&!I.key)st.dy+=(I.dy||0);st.dy=M4.cl(st.dy,-30,30);
      if(st.nd>0){st.nd+=dt/.22;if(st.nd>=1)st.nd=0;}
      if(I.pressed&&st.nd===0){st.nd=.001;const u=st.off+NX-60;const k=Math.round(u/SP),e=Math.abs(u-k*SP);const ey=Math.abs(seam(st.off+NX-60)+st.dy);const q=Math.min(M4.q(e,1.2,2.6,4),M4.q(ey,2,4,7));
        st.stitches.push([k*SP,ey,q]);st.q.push(q);K.judge(q,NX-74,30,true);if(q<.3)MS.miss();A.hiss(.05,.1,'highpass',4200);A.tone(1500,.03,'triangle',.03);if(st.q.length>=N){st.end=.001;MS.good();}}
      st.dy+=(Math.sin(st.t*.9)*.6+Math.sin(st.t*2.1)*.3)*dt*14;},
    draw(t){const top=40;const ox=Math.round(-(st.off%200));for(let k=0;k<3;k++)g.drawImage(cloth,ox+k*200,top+st.dy);K.pa(0,top+st.dy+88,320,3,'#000',.25);
      for(let x=0;x<320;x+=2){const u=st.off+x-60;K.px(x,top+st.dy+44+seam(u),1,1,'#f8f0dc');if(Math.abs(((u%SP)+SP)%SP)<1)K.px(x,top+st.dy+41+seam(u),1,6,'#fff8e8');}
      for(const [u,ey,q] of st.stitches){const x=u-st.off+60;if(x<-10||x>330)continue;const y=top+st.dy+44+seam(u)+(q<.5?(ey>3?3:0):0);K.px(x-3,y,6,1,sp.thread||'#a8302a');K.px(x-3,y-1,6,1,'#d85a4a');}
      const ny=top+44-30+(st.nd>0?Math.sin(st.nd*Math.PI)*11:0);g.drawImage(M4C.needle(),NX-3,ny);K.line(NX,ny+2,NX+30,ny-30,sp.thread||'#a8302a',1);m4hand(K,NX+4,ny-6);
      K.pa(NX-1,top-6,1,6,'#ffd27a',.6);},
    hud(){K.label('STITCH '+Math.min(N,st.q.length+1)+'/'+N,30,14,'#f4ecd8','l');K.meter(st.q.length/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const u=st.off+NX-60+(sp.speed||17)*.03;const e=((u%SP)+SP)%SP;if(st.nd===0&&st.t>.6&&(e<.6||e>SP-.6))m4tap(a);a.ay=M4.cl(-(seam(st.off+NX-60)+st.dy)*.25,-1,1);AP.hand=[NX+14,30];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- BRAID: three strips; cross the glowing one over the middle on the beat (left side or right side)
S4.braid=(sp,K)=>{const g=K.g,N=sp.n||12,TEMPO=sp.tempo||.7,COLS=sp.cols||['#b25645','#90abc2','#d6ad52'];const st={k:0,next:1.2,q:[],t:0,end:0,cross:0,order:[0,1,2],links:[]};
  const side=()=>st.k%2?-1:1;   // right over middle, then left over middle
  return {title:sp.t||'Braid the strips',how:'Cross the glowing strip over the middle one when the ring closes: tap the '+(K.fine?'left or right side (or A / D)':'left or right side of the picture')+', whichever strip is glowing.',hint:'Tap the glowing side on the beat.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.q);}return;}
      if(st.cross>0){st.cross+=dt/.25;if(st.cross>=1)st.cross=0;}
      let s=0;if(I.side)s=I.side;else if(I.pressed&&!I.key)s=I.x<160?-1:1;else if(I.pressed&&I.key)s=side();
      if(s){const e=Math.abs(st.t-st.next);const right=s===side();const q=right?M4.q(e,.1,.2,.32):.1;st.q.push(q);K.judge(q,160+s*40,40,true);if(q<.3)MS.miss();MS.rustle();
        if(right){const o=st.order;if(s>0)[o[1],o[2]]=[o[2],o[1]];else [o[0],o[1]]=[o[1],o[0]];}st.links.push([...st.order]);st.cross=.001;st.k++;st.next=st.t+TEMPO;if(st.k>=N){st.end=.001;MS.good();}}
      else if(st.t>st.next+.45){st.q.push(.15);K.judge(.15,160,40,true);MS.miss();st.k++;st.next=st.t+TEMPO;st.links.push([...st.order]);if(st.k>=N){st.end=.001;}}},
    draw(t){const hx=160,hy=24;K.px(hx-14,hy-6,28,6,CA_P.wood[3]);K.px(hx-2,hy-14,4,8,CA_P.iron[4]);
      // the braid so far: a column of crossing lumps
      st.links.forEach((o,i)=>{const y=hy+8+i*6,sd=i%2?-1:1;for(let k=0;k<3;k++){const x=hx+(k-1)*4*(1-.4)+sd*(k===1?2:0);K.ell(x,y+(k===1?1:0),5,3,COLS[o[k]]);K.px(x-3,y-2,4,1,'#ffffff40');}});
      const by=hy+8+st.links.length*6;const o=st.order,sd=side();
      for(let k=0;k<3;k++){const fx=hx+(k-1)*30,glow=(k===(sd>0?2:0))&&!st.end;const len=150-by;for(let y=0;y<len;y+=2){const w=Math.sin(y*.08+t*2+k)*2;K.px(hx+(fx-hx)*(y/len)+w-2,by+y,5,2,COLS[o[k]]);}if(glow)K.glow(fx,150,18,'255,240,180',.4+Math.sin(t*8)*.15);}
      m4hand(K,hx-36,150,true);m4hand(K,hx+36,150);},
    hud(t){const left=M4.cl((st.next-st.t)/TEMPO,0,1);const cx=160+side()*56,cy=110;K.g.strokeStyle='#fff4c0';K.g.lineWidth=1;K.g.beginPath();K.g.arc(cx,cy,5,0,6.29);K.g.stroke();K.g.strokeStyle=`rgba(255,210,122,${.4+.6*(1-left)})`;K.g.beginPath();K.g.arc(cx,cy,5+left*16,0,6.29);K.g.stroke();
      K.label(side()>0?'RIGHT':'LEFT',cx,cy+12,'#ffd27a');K.meter(st.k/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(!st.end&&Math.abs(st.t-st.next)<.02){m4move(a,160+side()*60,110);m4tap(a);}AP.hand=[160+side()*60,104];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- SCOOP: drag the spoon through the pumpkin and scrape out every seed and string
S4.scoop=(sp,K)=>{const g=K.g,CX=160,CY=96,RX=74,RY=40,N=sp.n||34;const seeds=[];for(let i=0;i<N;i++){const a=Math.random()*6.28,r=.25+Math.random()*.7;seeds.push({x:CX+Math.cos(a)*RX*r,y:CY+Math.sin(a)*RY*r,on:1,a:Math.random()*6});}
  const st={sx:CX+90,sy:CY-50,load:0,got:0,t:0,end:0,flick:0,path:0};let scr=null;
  return {title:sp.t||'Scoop out the seeds',how:K.fine?'Hold and drag the spoon through the pumpkin to scrape out the seeds and strings (or hold Space). When the spoon is full it flicks them out.':'Drag the spoon through the pumpkin to scrape out the seeds and strings. When it’s full it flicks them out.',hint:'Scrape every seed out.',st,
    update(dt,I){st.t+=dt;if(!scr)scr=MS.loop('bandpass',1400,1.4);if(st.end){st.end+=dt;scr.set(0);if(st.end>.6){st.done=true;st.score=M4.cl(st.got/N*1.05,0,1);}return;}
      let tx=st.sx,ty=st.sy;if(I.key&&I.down){st.path+=dt*1.6;const r=.9-((st.path*.12)%.8);tx=CX+Math.cos(st.path*2.2)*RX*r;ty=CY+Math.sin(st.path*2.2)*RY*r;}else if(I.down){tx=I.x;ty=I.y;}
      const d=Math.hypot(tx-st.sx,ty-st.sy),mx=260*dt;if(d>mx){tx=st.sx+(tx-st.sx)/d*mx;ty=st.sy+(ty-st.sy)/d*mx;}const mv=Math.hypot(tx-st.sx,ty-st.sy);st.sx=tx;st.sy=ty;
      const inside=((st.sx-CX)/RX)**2+((st.sy-CY)/RY)**2<1;scr.set(I.down&&inside?Math.min(.12,mv/dt/1200):0,1200+mv/dt*4);
      if(I.down&&inside&&st.flick<=0)for(const s of seeds)if(s.on&&Math.hypot(s.x-st.sx,(s.y-st.sy)*1.3)<8&&st.load<6){s.on=0;st.load++;if(Math.random()<.4)A.tone(600+Math.random()*400,.03,'sine',.03);}
      if(st.load>=6||(st.load>0&&!inside&&st.flick<=0)){st.flick=.45;st.got+=st.load;st.load=0;MS.whoosh();K.emit(st.sx,st.sy,10,{c:['#f0d080','#e8a040','#f8e0a0'],v:120,ang:-Math.PI/2+.6,spread:.8,g:300,life:.9});}
      if(st.flick>0)st.flick-=dt;if(st.got+st.load>=N||st.t>(sp.time||18)){st.got+=st.load;st.load=0;st.end=.001;MS.good();}},
    draw(t){// the opened pumpkin, seen from above: the thick orange wall, the pale inside, the seeds and strings
      K.pa(0,0,320,180,'#140a04',.45);K.ell(CX,CY+6,RX+20,RY+14,'#7a2e08');K.ell(CX,CY,RX+18,RY+12,'#d05a16');K.ell(CX-6,CY-4,RX+8,RY+6,'#e8742a');K.ell(CX,CY,RX+4,RY+3,'#f8c070');K.ell(CX,CY+2,RX,RY,'#f0a050');K.ell(CX,CY+4,RX-8,RY-6,'#e8904a');
      for(const s of seeds)if(s.on){K.px(s.x-1,s.y,3,2,'#f8e8b0');K.px(s.x-1,s.y,3,1,'#fff8d8');K.line(s.x+1,s.y,s.x+5+Math.sin(s.a)*3,s.y+3,'#e8a040',1);}
      const fl=st.flick>0?Math.sin((1-st.flick/.45)*Math.PI)*-12:0;M4.rot(g,M4C.spoon(),st.sx,st.sy+fl,-.6,8,8);for(let i=0;i<st.load;i++)K.px(st.sx-3+(i%3)*2,st.sy-2+((i/3)|0)*2+fl,2,1,'#f8e8b0');const [hx,hy]=M4.tr(st.sx,st.sy+fl,-.6,36,8);m4hand(K,hx,hy);},
    hud(){K.label('SEEDS '+st.got+'/'+N,30,14,'#f4ecd8','l');K.meter(st.got/N);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const s=seeds.filter(s=>s.on).sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y))[0];if(st.t>.5){if(st.load>=6||!s){m4move(a,a.x+(CX+RX+30-a.x)*.2,a.y+(CY-RY-20-a.y)*.2);}else{const d=Math.hypot(s.x-a.x,s.y-a.y),v=200*dt;m4move(a,d<v?s.x:a.x+(s.x-a.x)/d*v,d<v?s.y:a.y+(s.y-a.y)/d*v);}m4hold(a,true);}AP.hand=[a.x+8,a.y-20];AP.press=a.down;},
    quiet(){scr&&scr.set(0);},stop(){scr&&scr.stop();scr=null;}};};
// ---------------------------------------------------------------- SCALE: pour into the sack on the spring scale; the needle swings and settles, so stop early
S4.scale=(sp,K)=>{const g=K.g,MK=sp.mark||.7,COL=sp.col||['#f4f0e4','#ddd4c0'];const st={m:0,x:0,v:0,flow:0,t:0,end:0,still:0,pour:0};let snd=null;
  return {title:sp.t||'Weigh it out',how:'Hold to pour into the sack. The scale needle swings and takes a moment to settle, so let go early and watch it come to rest on the mark.',hint:'Hold to pour. Let go early; it settles.',st,
    update(dt,I){st.t+=dt;if(!snd)snd=MS.loop('bandpass',1800,.8);if(st.end){st.end+=dt;snd.set(0);if(st.end>.6){const e=Math.abs(st.m-MK);st.done=true;st.score=st.m>MK+.12?.15:M4.q(e,.025,.06,.12);}return;}
      st.flow+=((I.down?1:0)-st.flow)*Math.min(1,dt*6);st.m+=st.flow*dt*.32;snd.set(st.flow*.12,1500+st.flow*800);
      if(st.flow>.05&&Math.random()<dt*30)K.emit(160,58,1,{c:COL,v:20,ang:Math.PI/2,spread:.4,g:300,life:.5});
      const k=40,c=3.2;const a=k*(st.m-st.x)-c*st.v;st.v+=a*dt;st.x+=st.v*dt;
      if(st.flow<.02&&st.m>.15){st.still+=dt;if(st.still>1.6&&Math.abs(st.v)<.02){st.end=.001;K.judge(st.m>MK+.12?.15:M4.q(Math.abs(st.m-MK),.025,.06,.12),160,40);}}else st.still=0;},
    draw(t){const cx=160,cy=34,R=16;K.px(150,2,20,4,CA_P.wood[3]);K.px(159,6,2,10,CA_P.iron[5]);
      K.ball(cx,cy,R,['#5a5040','#c8c0a8','#e8e0cc','#f8f4ec']);g.strokeStyle=CA_P.brass[3];g.lineWidth=2;g.beginPath();g.arc(cx,cy,R,0,6.29);g.stroke();const ang=f=>-2.4+Math.min(1.12,f)*3.2;
      for(let k=0;k<=10;k++){const a=ang(k/10);K.px(cx+Math.cos(a)*(R-3),cy+Math.sin(a)*(R-3),1,1,'#3a3020');}const am=ang(MK);K.line(cx+Math.cos(am)*(R-6),cy+Math.sin(am)*(R-6),cx+Math.cos(am)*(R-1),cy+Math.sin(am)*(R-1),'#3a8a2a',2);
      const an=ang(st.x);K.line(cx,cy,cx+Math.cos(an)*(R-3),cy+Math.sin(an)*(R-3),'#a02a1a',1);K.px(cx-1,cy-1,2,2,'#2a2018');K.px(cx-1,cy+R,2,8,CA_P.iron[5]);
      const f=Math.min(1.15,st.m),w=14+f*14,h=22+f*18,top=cy+R+8+st.x*3;g.fillStyle='#b89a6a';g.beginPath();g.moveTo(cx-7,top);g.lineTo(cx+7,top);g.lineTo(cx+w,top+h*.45);g.lineTo(cx+w-3,top+h);g.lineTo(cx-w+3,top+h);g.lineTo(cx-w,top+h*.45);g.closePath();g.fill();
      for(let y=top+2;y<top+h;y+=3)K.pa(cx-w+4,y,w*2-8,1,'#8a6a3a',.4);K.px(cx-8,top,16,3,'#7a5a2a');
      const sx=cx+34,sy=46+(st.flow>.05?6:0);K.ball(sx,sy,8,['#5a5a5a','#8a8a8a','#b8b8b8','#d8d8d8']);K.ell(sx-6,sy+2,4,2,COL[0]);if(st.flow>.05)for(let y=sy+4;y<top+4;y+=2)K.px(cx+2+(y-sy)*.2,y,2,2,COL[0]);m4hand(K,sx+10,sy-2);},
    hud(t){K.meter(Math.min(1,st.m/MK),Math.abs(st.m-MK)<.06?1:.5);if(st.m>MK+.06&&Math.floor(t*4)%2)K.label('TOO MUCH',160,160,'#e8542a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.t>.5&&st.m+st.flow*.32*.25<MK-.004);AP.hand=[208,40];AP.press=a.down;},
    quiet(){snd&&snd.set(0);},stop(){snd&&snd.stop();snd=null;}};};
// ---------------------------------------------------------------- SIEVE: shake the riddle side to side at a steady pace: the chaff flies off, the seed falls through
S4.sieve=(sp,K)=>{const g=K.g,LO=1.4,HI=3.2,N=sp.n||1;const st={x:0,last:0,dir:0,rate:0,shakes:[],prog:0,spill:0,inT:0,runT:0,t:0,end:0};
  return {title:sp.t||'Sift it',how:K.fine?'Shake the sieve side to side: move the mouse left and right while holding, or tap A and D in turn. A steady pace sifts it; too wild and it spills.':'Shake the sieve side to side by dragging left and right. A steady pace sifts it; too wild and it spills.',hint:'Shake side to side at a steady pace.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.1-st.spill*.04,0,1);}return;}
      let tx=st.x;if(I.side){st.dir=I.side;st.kb=1;}if(I.down&&!I.key&&!I.side){st.kb=0;tx=M4.cl(I.x-160,-60,60);}else if(st.kb){tx=st.x+(st.dir*60-st.x)*Math.min(1,dt*12);}
      const v=(tx-st.x)/dt;const s=Math.sign(v);if(s&&s!==st.last&&Math.abs(v)>20){st.shakes.push(st.t);st.last=s;A.hiss(.06,.06,'bandpass',2200,{q:.8});}st.x=tx;
      st.shakes=st.shakes.filter(x=>st.t-x<1.2);st.rate=st.shakes.length/1.2;const inb=st.rate>=LO&&st.rate<=HI;if(st.rate>0)st.runT+=dt;
      if(inb){st.inT+=dt;st.prog+=dt/(sp.dur||5);if(Math.random()<dt*14)K.emit(160+st.x+(Math.random()-.5)*80,88,1,{c:['#d8c890','#c0ac70','#a89058'],v:50,ang:-Math.PI/2+(Math.random()-.5),spread:.9,g:-12,drag:1.2,life:1.4});}
      else if(st.rate>HI){if(Math.random()<dt*6){st.spill++;K.emit(160+st.x+st.dir*66,96,3,{c:M4KE.slice(2),v:60,spread:1.2,ang:st.dir>0?-.3:Math.PI+.3,g:320,life:.7});}}
      if(st.prog>=1||st.t>(sp.time||14)){st.end=.001;MS.good();}},
    draw(t){const cx=160+st.x,inb=st.rate>=LO&&st.rate<=HI,rinse=sp.look==='rinse';
      K.pa(110,174,100,3,'#000',.45);g.drawImage(m4basket('B'),108,134);const pile=Math.min(1,st.prog);
      if(pile>0){const rx=Math.round(14+pile*28),ry=Math.round(1+pile*4);for(let x=-rx;x<=rx;x++){const hh=Math.round(ry*Math.sqrt(1-(x/rx)**2));for(let y=0;y<=hh;y++)K.px(160+x,146-y,1,1,M4KE[y===hh?(x<0?5:4):x<-rx*.3?3:2]);}}
      g.drawImage(m4basket('F'),108,134);
      if(inb&&!rinse)for(let i=0;i<6;i++){const sx=cx-36+i*14+Math.round(Math.sin(i*2.1)*3);if(sx<116||sx>204)continue;for(let y=112;y<140;y+=2)if(((y+Math.floor(t*90)+i*5)%9)<3)K.px(sx,y,1,2,M4KE[3+(i%2)]);}
      K.pa(cx-62,110,124,3,'#000',.3);g.drawImage(m4riddle(),cx-70,78);
      const left=1-Math.min(1,st.prog);for(let i=0;i<Math.round(36*(rinse?1:left));i++){const a=i*2.4,r=(i%7)/7,jx=Math.round(Math.sin(t*22+i)*.6);const x=cx+Math.round(Math.cos(a)*50*r)+jx,y=93+Math.round(Math.sin(a)*8*r);
        if(rinse)K.px(x,y,2,1,i%3?'#f8e8b0':'#fff8d8');else if(i%3===0)K.px(x,y,3,1,i%2?M4SD[5]:M4SD[4]);else{K.px(x,y,2,1,M4KE[4]);K.px(x,y+1,2,1,M4KE[2]);}}
      if(rinse){for(let i=0;i<10;i++){const ph=(t*1.5+i*.1)%1;K.pa(cx-40+i*9,108+ph*30,1,3,'#9cc4e0',.8*(1-ph));}}
      m4hand(K,cx-68,94,true);m4hand(K,cx+68,94);},
    hud(t){K.label('PACE',156,14,'#f4ecd8','r');K.gauge(162,14,90,6,LO/4.5,HI/4.5,Math.min(4.5,st.rate)/4.5);K.meter(st.prog,st.runT?st.inT/st.runT:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);this._k=1;if(this._p==null)this._p=0;this._p+=dt;if(this._p>.44&&st.t>.4){this._p=0;a.side=st.dir>0?-1:1;}AP.hand=[160+st.x,70];AP.press=!!a.side;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- barn props: a tied sheaf of wheat, the riddle (a bentwood sieve), a wicker basket
const M4SD=['#2e2010','#44321a','#5c4622','#765c2c','#8e7236','#a68844','#bc9e58'],M4KE=['#4a3210','#6e5020','#94702e','#b68e40','#d4ac56','#e8c470'];
const m4sheaf=v=>M4.pre('sheaf3_'+(v||0),48,16,K=>{const S=M4SD,E=M4KE;v=v||0;
  for(let r=0;r<9;r++){const c=r<2?S[5]:r<5?S[4]:r<7?S[3]:S[2];for(let x=16;x<46;x++){const y=3+r+Math.round((x-16)/30*(r-4)*.35);K.px(x,y,1,1,(x+r*3)%11===0?S[2]:c);}K.px(45,3+r+Math.round((r-4)*.35),1,1,S[6]);}
  K.px(28,2,3,12,'#2e1c0c');K.px(28,2,1,12,'#5a3a1c');K.px(28,2,3,1,'#6e4a26');
  for(let k=0;k<(v?4:5);k++){const y0=(v?5:4)+k*2,len=v?10+(k%2)*3:12;for(let i=0;i<len;i++){const x=15-i,y=y0+Math.round(i*(k-(v?1.5:2))*(v?.16:.12));K.px(x,y,1,1,E[(i>>1)%2?4:3]);K.px(x,y+1,1,1,E[(i>>1)%2?2:1]);}
    const tx=15-len,ty=y0+Math.round(len*(k-(v?1.5:2))*(v?.16:.12));K.line(tx,ty,tx-3,ty-2+(k>2?2:0),S[5],1);}},true);
const m4riddle=()=>M4.pre('riddle2',140,38,K=>{const B=['#2a1a0c','#46301a','#624424','#7e5a30','#9a723e','#b48c52'];const cx=70,cy=15;
  for(let x=-66;x<=66;x++){const yb=Math.round(14*Math.sqrt(Math.max(0,1-(x/66)**2)));for(let k=0;k<5;k++)K.px(cx+x,cy+yb+k,1,1,k<1?B[4]:x<-40?B[3]:x>40?B[1]:B[2]);}
  for(let y=-14;y<=14;y++)for(let x=-66;x<=66;x++){const o=(x/66)**2+(y/14)**2,i=(x/61)**2+(y/11)**2;if(o>1)continue;
    if(i>1)K.px(cx+x,cy+y,1,1,y<0?(x<0?B[5]:B[4]):(x<0?B[3]:B[2]));else K.px(cx+x,cy+y,1,1,(x+66)%3===0||(y+14)%3===0?'#4a3a24':'#1a1208');}},true);
const m4basket=part=>M4.pre('basket3'+part,104,44,K=>{const W=['#24180a','#3a2810','#523a18','#6a4c22','#82622e','#9a783a'];const cx=52,cy=8;
  if(part==='B'){for(let y=cy;y<42;y++){const hw=Math.round(48-(y-cy)*.18);for(let x=-hw;x<=hw;x++){const row=((y-cy)/4)|0,cxw=(x+hw+(row%2)*3)%6,cyw=(y-cy)%4;
      const l=-x/hw*.6;let k=(cxw===0||cyw===3)?1:(cyw===0?3:2);k+=l>.3?1:l<-.35?-1:0;if(y>39)k=0;K.px(cx+x,y,1,1,W[Math.max(0,Math.min(5,k))]);}}
    for(let y=-8;y<=0;y++)for(let x=-48;x<=48;x++)if((x/48)**2+(y/8)**2<=1)K.px(cx+x,cy+y,1,1,(x/44)**2+(y/6)**2<=1?'#140c06':W[(x+y)%4<2?4:3]);}
  else{for(let x=-48;x<=48;x++){const yb=Math.round(8*Math.sqrt(Math.max(0,1-(x/48)**2)));for(let k=-1;k<=1;k++)K.px(cx+x,cy+yb+k,1,1,W[((x+k*2)>>1)%2?4:2]);K.px(cx+x,cy+yb-2,1,1,(x/44)**2<=1?W[1]:W[3]);}}},part==='F'?false:true);
// ---------------------------------------------------------------- FLAIL: the swingle whirls on its hinge at the staff's tip; tap and the whole flail comes down so the swingle lands flat across the sheaves
S4.flail=(sp,K)=>{const g=K.g,N=sp.n||8;const st={a:Math.PI,blows:0,q:[],t:0,end:0,hit:0,grain:0,pq:0,s0:0,bump:0};
  const HR=[228,76],HD=[222,100],A0=3.78,A1=2.73,SL=30,FL=50,W=['#2a1e12','#4a3a24','#6a5434','#8a7048','#a88c5c','#c4a874','#dcc290','#ecd8ac'];
  const pose=()=>{const h=st.hit;if(!h)return {hx:HR[0],hy:HR[1],a:A0,s:st.a};const u=h<.4?h/.4:h<.55?1:1-(h-.55)/.45;const e=h<.4?u*u:u*u*(3-2*u);
    return {hx:HR[0]+(HD[0]-HR[0])*e,hy:HR[1]+(HD[1]-HR[1])*e,a:A0+(A1-A0)*e,s:h<.4?st.s0+(Math.PI-st.s0)*e:Math.PI};};
  return {title:sp.t||'Thresh it',how:'The flail’s loose arm whirls round on its hinge. Tap when it’s at the top of its swing (the bright arc): the flail comes down and lands it flat on the sheaves, knocking the grain out.',hint:'Tap when the arm is at the top, in the bright arc.',st,
    update(dt,I){st.t+=dt;if(st.bump>0)st.bump-=dt;if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.avg(st.q);}return;}
      if(st.hit>0){const was=st.hit;st.hit+=dt/.5;if(was<.4&&st.hit>=.4){const q=st.pq;A.tone(130,.14,'sine',.25*q+.05,{slide:70});A.hiss(.1,.2*q+.05,'lowpass',900);K.shk=.12*q+.03;st.bump=.12;st.grain+=q;
          K.emit(150,120,Math.round(4+14*q),{c:M4KE.slice(2),v:90,spread:2.6,g:300,life:.7});K.emit(150,118,Math.round(3+6*q),{c:['#d8c890','#c0ac70'],v:40,spread:2,g:-30,drag:1,life:1.2});
          if(st.blows>=N){st.end=.001;MS.good();}}
        if(st.hit>=1){st.hit=0;st.a=Math.PI;}return;}
      st.a-=dt*(3.4+st.blows*.15);
      if(I.pressed){const ph=((st.a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);const e=Math.min(Math.abs(ph-Math.PI*1.5),Math.abs(ph+Math.PI*.5));const q=M4.q(e,.25,.5,.85);st.q.push(q);st.blows++;st.pq=q;st.hit=.001;
        st.s0=ph<Math.PI?ph+Math.PI*2:ph;MS.whoosh&&MS.whoosh();K.judge(q,170,50,true);if(q<.3)MS.miss();}},
    draw(t){// the sheaves laid across the floor, the grain heap growing in front
      const by=st.bump>0?-1:0;for(const [x,y,v,f] of [[96,114,0,0],[124,117,1,1],[152,113,1,0],[180,116,0,1]]){K.pa(x+2,y+14,44,2,'#000',.35);if(f){g.save();g.translate(x+48,y+by);g.scale(-1,1);g.drawImage(m4sheaf(v),0,0);g.restore();}else g.drawImage(m4sheaf(v),x,y+by);}
      const gr=Math.min(1,st.grain/N);if(gr>0){const r=Math.round(8+gr*30),h=2+gr*6;K.pa(160-r,147,r*2,2,'#000',.4);for(let x=-r;x<=r;x++){const hh=Math.round(h*Math.sqrt(1-(x/r)**2));for(let y=0;y<=hh;y++)K.px(160+x,147-y,1,1,M4KE[y===hh?(x<0?5:4):x<-r*.3?3:x>r*.4?1:2]);}
        for(let k=0;k<Math.round(gr*8);k++){const kx=Math.round((K.H32(k,3,7)-.5)*r*1.4);K.px(160+kx,147-Math.round(h*.4)-(k%2),2,1,M4KE[4]);}}
      const P=pose(),tx=P.hx+Math.cos(P.a)*FL,ty=P.hy+Math.sin(P.a)*FL;
      // the sweet spot: a bright arc over the hinge at the top of the swing (only while it whirls)
      if(!st.hit&&!st.end){const ph=((st.a%(Math.PI*2))+Math.PI*2)%(Math.PI*2),near=Math.abs(ph-Math.PI*1.5)<.25;for(let a=-.25;a<=.25;a+=.03){const r=SL+5;K.px(tx+Math.cos(Math.PI*1.5+a)*r-1,ty+Math.sin(Math.PI*1.5+a)*r-1,3,3,'#1a0c12');}for(let a=-.25;a<=.25;a+=.03){const r=SL+5;K.px(tx+Math.cos(Math.PI*1.5+a)*r,ty+Math.sin(Math.PI*1.5+a)*r,2,1,near?'#fff2b8':'#c89a48');}}
      K.line(P.hx,P.hy,tx,ty,'#1a0c06',6);K.line(P.hx,P.hy,tx,ty,W[3],4);K.line(P.hx,P.hy-1,tx,ty-1,W[5],2);K.line(P.hx,P.hy-2,tx,ty-2,W[7],1);
      const ex=tx+Math.cos(P.s)*SL,ey=ty+Math.sin(P.s)*SL;
      if(!st.hit)for(let a=.12;a<.6;a+=.09)K.px(tx+Math.cos(P.s+a)*(SL-1),ty+Math.sin(P.s+a)*(SL-1),1,1,'#7a6a4e');
      K.line(tx,ty,ex,ey,'#1a0c06',7);K.line(tx,ty,ex,ey,W[2],5);K.line(tx,ty-1,ex,ey-1,W[4],2);K.line(tx,ty-2,ex,ey-2,W[6],1);K.px(tx-3,ty-3,7,7,'#1a0c06');K.px(tx-2,ty-2,5,5,'#5a2e16');K.px(tx-2,ty-2,5,1,'#8a4e28');K.px(tx-2,ty,5,1,'#3a1a0a');K.px(tx-1,ty+1,1,2,'#8a4e28');
      m4hand(K,P.hx,P.hy);m4hand(K,P.hx+(tx-P.hx)*.3,P.hy+(ty-P.hy)*.3+2,true);},
    hud(){K.label('BLOWS '+st.blows+'/'+N,30,14,'#f4ecd8','l');K.meter(st.blows/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const ph=((st.a%(Math.PI*2))+Math.PI*2)%(Math.PI*2);if(!st.hit&&st.t>.5&&Math.abs(ph-Math.PI*1.5)<.08)m4tap(a);AP.hand=[236,56];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- KNOT: hold to pull; keep the tension in the green while it draws tight; too hard and it snaps
S4.knot=(sp,K)=>{const g=K.g;const st={T:0,tight:0,snap:0,inT:0,runT:0,t:0,end:0};
  return {title:sp.t||'Pull the knot tight',how:'Hold to pull the ends. The knot draws tight while the tension is in the green; the straw slips and grabs, so ease off when it climbs or it’ll snap.',hint:'Hold to pull. Keep the tension in the green.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=st.snap?.15:M4.cl(st.inT/Math.max(1,st.runT)*1.15,0,1);}return;}
      const slip=Math.sin(st.t*2.3)*.18+Math.sin(st.t*5.1)*.08;st.T+=((I.down?.9+slip:0)-st.T)*Math.min(1,dt*(I.down?2.2:4));if(I.down)st.runT+=dt;
      if(st.T>=.45&&st.T<=.72){st.inT+=dt;st.tight+=dt/(sp.dur||3);if(Math.random()<dt*8)A.tone(220+st.tight*200,.05,'sawtooth',.02,{filter:['bandpass',600,3]});}
      if(st.T>.86){st.snap=1;st.end=.001;A.hiss(.2,.3,'bandpass',2600);MS.miss();K.judge(.1,160,60);K.shk=.2;}
      if(st.tight>=1){st.end=.001;MS.good();}},
    draw(t){const tg=Math.min(1,st.tight),pull=st.T*14;g.drawImage(m4blk('knotbench',320,10,k=>k.planks(0,0,320,10,CA_P.oak,10,6)),0,112);for(let i=0;i<9;i++)K.line(120+i*4,60,130+i*2,110,CA_P.straw[3+(i%3)],2);
      const r=10*(1.4-tg*.8);K.ell(150,70,r+2,r*.6+1,'#7a2a24');K.ell(150,70,r,r*.6,'#93463f');K.ell(150,70,r-3,Math.max(1,r*.6-3),CA_P.straw[4]);
      K.line(150-r,70,90-pull,64,'#93463f',3);K.line(150+r,70,210+pull,64,'#93463f',3);if(st.snap){K.px(150-r-4,66,3,8,'#f4ecd8');}m4hand(K,86-pull,64,true);m4hand(K,214+pull,64);},
    hud(t){K.label('TENSION',286,14,'#f4ecd8');K.gauge(282,24,8,90,.45,.72,Math.min(1,st.T));K.meter(st.tight,st.runT?st.inT/st.runT:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.t>.4&&st.T<.6);AP.hand=[214,40];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- DIP: dip the wick, lift it, and wait for the new layer to go from wet and shiny to dull before the next dip
S4.dip=(sp,K)=>{const g=K.g,N=sp.n||6;const st={layers:0,wet:0,dip:0,q:[],t:0,end:0,thin:0};
  return {title:sp.t||'Dip the candle',how:'Tap to dip the wick in the tallow. Each dip adds a layer, but only once the last one has set: wait until it turns from shiny to dull, or the hot tallow melts it back off.',hint:'Dip when the candle looks dull, not shiny.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.q);}return;}
      if(st.dip>0){const p=st.dip;st.dip+=dt/.7;if(p<.5&&st.dip>=.5){A.tone(200,.15,'sine',.08,{slide:150});MS.plop();}if(st.dip>=1){st.dip=0;}return;}
      st.wet=Math.max(0,st.wet-dt/(sp.set||1.3));
      if(I.pressed){const q=st.layers===0?1:st.wet>.5?.15:st.wet>.2?.45:st.wet>.05?.75:1;st.q.push(q);if(q<.3){st.thin++;MS.miss();K.emit(160,90,8,{c:['#f4ecd0','#e8dcb8'],v:30,ang:Math.PI/2,spread:.6,g:200,life:.6});}else st.layers++;K.judge(q,190,60,true);st.wet=1;st.dip=.001;
        if(st.q.length>=N+st.thin&&st.layers>=N||st.q.length>=N+3){st.end=.001;MS.good();}}},
    draw(t){const cx=160;K.px(cx-40,8,80,4,CA_P.wood[3]);K.px(cx-1,12,2,10,'#3a2a20');
      const d=st.dip>0?Math.sin(st.dip*Math.PI)*46:0;const w=2+st.layers*2,h=20+st.layers*8,top=22+d;
      for(let y=0;y<h;y++){const ww=w-(y<4?2-(y>>1):0);K.px(cx-ww/2,top+y,ww,1,y%8<1?'#e8dcb8':'#f4ecd0');}K.px(cx-w/2,top,1,h,'#ffffff');
      if(st.wet>0){K.pa(cx-w/2,top,w,h,'#ffffff',.2*st.wet);for(let k=0;k<3;k++)K.pa(cx-w/2+1,top+4+k*9,1,4,'#ffffff',.9*st.wet);if(st.wet>.6)K.px(cx-1,top+h,2,2+st.wet*2,'#f4ecd0');}
      g.drawImage(m4blk('dipvat',104,52,k=>{k.plank(2,0,100,52,CA_P.wood,4,true);k.metal(0,8,104,3,CA_P.iron);k.metal(0,40,104,3,CA_P.iron);}),cx-52,96);K.ell(cx,96,48,6,'#e8dcb0');K.ell(cx,96,44,4,'#f4ecd0');K.ell(cx-10,95,14,1,'#ffffff');
      for(let i=0;i<4;i++){const ph=(t*.5+i*.25)%1;K.pa(cx-20+i*12+Math.sin(t+i)*3,90-ph*20,4,3,'#ffffff',.25*(1-ph));}m4hand(K,cx+44,10);},
    hud(t){K.label('LAYERS '+st.layers+'/'+N,30,14,'#f4ecd8','l');K.label(st.wet>.2?'SHINY: WAIT':'DULL: DIP',230,40,st.wet>.2?'#e8b030':'#9be07a');K.meter(st.layers/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.dip===0&&st.t>.6&&st.wet<.04)m4tap(a);AP.hand=[200,20];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- CORK: the cork wobbles in your fingers; tap to press it in when it sits straight over the neck
S4.cork=(sp,K)=>{const g=K.g,N=sp.n||1;const st={ang:0,in:0,push:0,q:[],t:0,end:0,tries:0};
  return {title:sp.t||'Cork it',how:'The cork wobbles as you line it up. Tap to press it home when it sits straight over the neck. Crooked, it jams.',hint:'Tap when it’s straight.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.q);}return;}
      if(st.push>0){st.push+=dt/.35;if(st.push>=1){st.push=0;if(st.ok){st.end=.001;MS.good();}}return;}
      st.ang=Math.sin(st.t*2.6)*.35+Math.sin(st.t*5.3)*.12;
      if(I.pressed){const e=Math.abs(st.ang);const q=M4.q(e,.04,.1,.18);st.tries++;st.push=.001;if(q>=.45||st.tries>=3){st.ok=1;st.q.push(q*(st.tries>1?.85:1));A.tone(420,.08,'sine',.12,{slide:300});MS.pop();}else{A.tone(260,.12,'square',.04,{slide:180});MS.miss();}K.judge(q,190,50,true);}},
    draw(t){const cx=160,FY=150;g.drawImage(M4.pre('flask'+(sp.col?sp.col[0]:''),60,80,k=>{const G=CA_P.glass;for(let y=30;y<78;y++){const r=Math.round(24*Math.sqrt(Math.max(0,1-((y-54)/24)**2)));for(let x=-r;x<=r;x++)k.px(30+x,y,1,1,G[Math.max(0,Math.min(5,Math.round(3-x/r*1.5)))]);}k.px(24,4,12,28,G[3]);k.px(25,4,2,28,G[5]);k.ell(30,62,18,8,sp.col?sp.col[0]:'#c8a040');k.px(14,58,8,2,'#ffffff');},true),cx-30,FY-78);
      const push=st.push>0?Math.sin(st.push*Math.PI/2):0;const seated=st.ok&&st.push===0;const cy=FY-80-(seated?-8:16-push*24);M4.rot(g,M4.pre('cork',10,14,k=>{for(let y=0;y<14;y++)k.px(1+(y>10?1:0),y,8-(y>10?2:0),1,y%3?'#b8885a':'#a87848');k.px(1,0,8,1,'#d8a878');},true),cx,cy,seated?0:st.ang,5,7);
      if(!seated){const [hx,hy]=M4.tr(cx,cy,st.ang,0,-12);m4hand(K,hx,hy-4);}g.drawImage(m4blk('corkbench',320,30,k=>k.planks(0,0,320,30,CA_P.oak,10,5)),0,150);},
    hud(){K.meter(st.q.length/N,st.q.length?M4.avg(st.q):1);K.label('STRAIGHT?',230,50,Math.abs(st.ang)<.06?'#9be07a':'#f4ecd8');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(!st.push&&st.t>.6&&Math.abs(st.ang)<.025)m4tap(a);AP.hand=[176,40];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- ROLL: roll the pastry out to the size of the tin, keeping it round: roll across, then up and down
S4.roll=(sp,K)=>{const g=K.g,CX=160,CY=96,R=sp.r||46;const st={rx:22,ry:22,px:CX,py:CY,dir:0,stroke:0,t:0,end:0,strokes:0,lastS:0,sx:CX,sy:CY,pa:0};
  return {title:sp.t||'Roll out the pastry',how:K.fine?'Drag the rolling pin across the dough: side to side widens it, up and down lengthens it (or use A/D and W/S). Keep it round and stop at the dotted circle.':'Drag the rolling pin across the dough: side to side widens it, up and down lengthens it. Keep it round and stop at the dotted circle.',hint:'Roll both ways; keep it round; stop at the circle.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){const e=(Math.abs(st.rx-R)+Math.abs(st.ry-R))/2,ov=Math.max(0,st.rx-R)+Math.max(0,st.ry-R);st.done=true;st.score=M4.cl(1-e/16-ov*.02,0,1);}return;}
      let dx=0,dy=0;if(I.ax||I.ay){dx=(I.ax||0)*120*dt;dy=(I.ay||0)*120*dt;}else if(I.down){dx=I.x-st.px;dy=I.y-st.py;}const d=Math.hypot(dx,dy);
      if(d>.2&&(I.down||I.ax||I.ay)){st.px=M4.cl(st.px+dx,CX-90,CX+90);st.py=M4.cl(st.py+dy,CY-60,CY+60);const horiz=Math.abs(dx)>Math.abs(dy);st.pa=horiz?Math.PI/2:0;
        const over=Math.abs(st.px-CX)<st.rx+6&&Math.abs(st.py-CY)<st.ry+6;if(over){const k=.045*d;if(horiz)st.rx+=k;else st.ry+=k;st.rx=Math.min(R+16,st.rx);st.ry=Math.min(R+16,st.ry);if(Math.random()<.3)A.hiss(.06,.05,'lowpass',500);
          if(Math.random()<.2)K.emit(st.px,st.py,1,{c:['#f8f4ec'],v:20,spread:3,g:0,drag:4,life:.8});}}
      if(I.released&&!I.key)st.strokes++;if(st.rx>=R-1&&st.ry>=R-1||st.t>(sp.time||16)){st.end=.001;MS.good();}},
    draw(t){K.pa(0,0,320,180,'#140a04',.45);g.drawImage(m4blk('rollboard',260,110,k=>{k.plank(0,0,260,110,CA_P.oak,7);for(let j=0;j<40;j++)k.pa(10+((j*37)%240),8+((j*23)%96),2,1,'#ffffff',.5);}),30,40);
      g.setLineDash([3,3]);g.strokeStyle='#9be07a';g.lineWidth=1;g.beginPath();g.ellipse(CX,CY,R,R*.62,0,0,6.29);g.stroke();g.setLineDash([]);
      // flat pastry, seen from above: a soft rim, flour on it, the marks of the pin
      K.ell(CX,CY+1,st.rx+1,st.ry*.62+1,'#c89a60');K.ell(CX,CY,st.rx,st.ry*.62,'#ecd2a0');K.ell(CX,CY,st.rx-3,Math.max(1,st.ry*.62-2),'#f2dcae');
      for(let k=0;k<26;k++){const a=k*2.39,r=Math.sqrt((k*.618)%1);K.px(CX+Math.cos(a)*st.rx*.85*r,CY+Math.sin(a)*st.ry*.55*r,1,1,'#fff8ec');}for(let k=-2;k<=2;k++)K.pa(CX-st.rx*.7,CY+k*st.ry*.2,st.rx*1.4,1,'#d8b880',.35);
      M4.rot(g,M4C.pin(),st.px,st.py,st.pa,36,8);const [h1x,h1y]=M4.tr(st.px,st.py,st.pa,-30,0),[h2x,h2y]=M4.tr(st.px,st.py,st.pa,30,0);m4hand(K,h1x,h1y-2,true);m4hand(K,h2x,h2y-2);},
    hud(){K.label('WIDE '+Math.round(st.rx/R*100)+'%  LONG '+Math.round(st.ry/R*100)+'%',160,14,Math.abs(st.rx-st.ry)<6?'#9be07a':'#e8b030');K.meter(Math.min(st.rx,st.ry)/R,1-Math.min(1,Math.abs(st.rx-st.ry)/12));},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.t>.5){if(this._ph==null){this._ph=0;this._h=1;}this._ph+=dt*2.2;const horiz=st.rx<=st.ry;const s=Math.sin(this._ph);m4move(a,horiz?CX+s*st.rx:CX,horiz?CY:CY+s*st.ry*.8);m4hold(a,true);}AP.hand=[a.x+30,a.y-14];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- CRIMP: the pie turns on the stand; pinch a flute each time a mark comes round to your fingers
S4.crimp=(sp,K)=>{const g=K.g,CX=160,CY=100,RX=70,RY=26,N=sp.n||12,look=sp.look||'pie';const st={a:0,done_:[],q:[],t:0,end:0,pinch:0};const marks=[];for(let i=0;i<N;i++)marks.push(i/N*Math.PI*2);
  return {title:sp.t||'Crimp the edge',how:look==='pie'?'The pie turns on its stand. Tap to pinch a flute each time a mark comes round to your fingers at the front.':'The form turns. Tap to set a pin each time a chalk mark comes round to your hand.',hint:'Tap as each mark reaches your fingers.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.q.concat(new Array(Math.max(0,N-st.q.length)).fill(.15)));}return;}
      st.a+=dt*(sp.speed||1.1);if(st.pinch>0){st.pinch-=dt;}
      if(I.pressed&&st.pinch<=0){st.pinch=.18;let best=-1,be=9;marks.forEach((m,i)=>{if(st.done_[i]!=null)return;const ph=(((m+st.a-Math.PI/2)%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;if(Math.abs(ph)<be){be=Math.abs(ph);best=i;}});
        const q=best<0?.15:M4.q(be,.06,.14,.24);if(best>=0&&be<.5){st.done_[best]=q;st.q.push(q);}else st.q.push(.15);K.judge(q,CX,CY+RY+20,true);if(q<.3)MS.miss();A.tone(look==='pie'?320:1800,.05,look==='pie'?'sine':'square',.05);}
      if(st.a>Math.PI*2*(sp.turns||1.15)||st.done_.filter(x=>x!=null).length>=N){st.end=.001;MS.good();}},
    draw(t){if(look==='pie'){K.px(CX-6,CY+RY,12,40,CA_P.wood[3]);K.ell(CX,CY+RY+40,40,6,CA_P.wood[2]);}
      if(look==='pie'){K.ell(CX,CY+4,RX+4,RY+3,'#a87438');K.ell(CX,CY,RX,RY,'#c89a58');K.ell(CX,CY-2,RX-8,RY-6,'#d8742a');K.ell(CX-10,CY-6,RX-30,RY-14,'#e8904a');}
      else{m4form(K,CX,CY-58,1,1,t);g.strokeStyle='#e8d070';g.lineWidth=1;g.beginPath();g.ellipse(CX,CY,RX*.55,RY*.45,0,0,Math.PI);g.stroke();}
      marks.forEach((m,i)=>{const a=m+st.a;const x=CX+Math.cos(a)*RX*(look==='pie'?1:.55),y=CY+Math.sin(a)*RY*(look==='pie'?1:.45);if(Math.sin(a)<-.2)return;const done=st.done_[i]!=null;
        if(look==='pie'){if(done)for(let k=-2;k<=2;k++)K.px(x+k,y-1+Math.abs(k)*.5,1,3,st.done_[i]>.6?'#8a5428':'#7a4420');else K.px(x-1,y-1,2,2,'#fff4c0');}
        else{if(done){K.px(x,y-6,1,6,CA_P.iron[6]);K.ball(x,y-7,2,['#8a1a14','#c83a2a','#f86a5a']);}else K.px(x-1,y-1,2,2,'#2a6a9a');}});
      const p=st.pinch>0?2:0;const hy=look==='pie'?CY+RY+8:CY+RY*.45+6;m4hand(K,CX-8,hy-p,true);m4hand(K,CX+8,hy-p);},
    hud(){K.meter(st.done_.filter(x=>x!=null).length/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.pinch<=0)marks.forEach((m,i)=>{if(st.done_[i]!=null)return;const ph=(((m+st.a-Math.PI/2)%(Math.PI*2))+Math.PI*3)%(Math.PI*2)-Math.PI;if(Math.abs(ph)<.03)m4tap(a);});AP.hand=[CX+10,CY+RY+20];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- BAKE: watch the crust through the oven window and take it out when it's golden; the fire runs hot and cold
S4.bake=(sp,K)=>{const g=K.g;const st={c:0,heat:.6,t:0,end:0,out:0};let roar=null;
  const crust=c=>c<.35?['#e8c890','#f0d8a8']:c<.7?['#d8a050','#e8b868']:c<1.05?['#b8702a','#d08a3a']:c<1.3?['#8a4a1a','#a85a24']:['#3a2010','#5a3018'];
  return {title:sp.t||'Bake it golden',how:'Watch the crust through the oven window. The fire runs hot and cold, so the colour changes at its own pace. Tap to take it out when it’s golden brown.',hint:'Tap to take it out when it’s golden.',st,
    update(dt,I){st.t+=dt;if(!roar)roar=MS.loop('lowpass',260,.8);if(st.end){st.end+=dt;roar.set(0);if(st.end>.9){st.done=true;st.score=st.c>1.3?.1:M4.q(Math.abs(st.c-.95),.1,.2,.32);}return;}
      st.heat=.6+Math.sin(st.t*.7)*.25+Math.sin(st.t*1.9)*.1;st.c+=dt*st.heat*(sp.rate||.22);roar.set(.03+st.heat*.05,200+st.heat*200);
      if(st.c>1.15&&Math.random()<dt*8)K.emit(160,64,1,{c:['#5a5048'],v:12,g:-40,life:1.4,sz:3,kind:'steam'});
      if(I.pressed||st.c>1.6){st.end=.001;st.out=1;A.tone(500,.1,'sine',.06,{slide:300});const q=st.c>1.3?.1:M4.q(Math.abs(st.c-.95),.1,.2,.32);K.judge(q,160,40);MS.thunk();}},
    draw(t){const I=CA_P.iron;K.px(70,30,180,130,I[1]);K.metal(66,26,188,8,I,12);K.px(86,44,148,80,'#140c08');
      const gr=g.createRadialGradient(160,124,4,160,124,100);gr.addColorStop(0,`rgba(255,${(150+st.heat*70)|0},60,${.35+st.heat*.4})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(86,44,148,80);
      MG4ART.fire(K,88,124,144,20,.45+st.heat*.5,t,[86,44,148,80]);
      const out=st.out?Math.min(1,st.end*2.5):0;const py=96+out*50;const [c1,c2]=crust(st.c);K.ell(160,py+6,46,9,'#5a5a5a');K.ell(160,py+4,44,8,'#8a8a8a');K.ell(160,py,40,8,c1);K.ell(156,py-2,30,5,c2);for(let k=0;k<6;k++)K.px(130+k*10,py-1,4,1,crust(st.c+.2)[0]);
      if(!st.out){K.pa(86,44,148,80,'#c8e2f0',.12);K.px(90,46,40,1,'#ffffff');}K.px(86,124,148,4,I[3]);K.metal(130,128,60,4,CA_P.brass);g.drawImage(m4blk('bakefloor',320,20,k=>k.planks(0,0,320,20,CA_P.oak,10,3)),0,160);},
    hud(){K.label('CRUST',286,14,'#f4ecd8');K.gauge(282,24,8,90,.85/1.6,1.08/1.6,Math.min(1.6,st.c)/1.6,{zone:'#7a5a1c'});},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(!st.end&&st.c>=.95)m4tap(a);AP.hand=[170,140];AP.press=a.down;},
    quiet(){roar&&roar.set(0);},stop(){roar&&roar.stop();roar=null;}};};
// ---------------------------------------------------------------- STUFF: push straw into each side of the dress form in turn; keep it level and fill it to the line
S4.stuff=(sp,K)=>{const g=K.g,N=sp.n||16;const st={L:0,R:0,tilt:0,q:[],t:0,end:0,push:0,ps:0};
  return {title:sp.t||'Stuff the dress form',how:'Push straw into the left or right side ('+(K.fine?'click a side, or A / D':'tap a side')+'). Keep both sides even so it stands straight, and fill it to the line.',hint:'Fill both sides evenly.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.cl(1-Math.abs(st.L-st.R)/6-Math.max(0,(st.L+st.R)/2-N/2)*.05,0,1);}return;}
      let s=0;if(I.side)s=I.side;else if(I.pressed)s=I.x<160?-1:1;if(st.push>0)st.push-=dt;
      if(s&&st.push<=0){if(s<0)st.L++;else st.R++;st.push=.15;st.ps=s;MS.rustle();K.emit(160+s*20,80,4,{c:CA_P.straw.slice(3),v:40,spread:2,g:200,life:.5});const d=Math.abs(st.L-st.R);K.judge(d<=1?1:d<=2?.75:d<=3?.45:.15,160+s*30,40,true);}
      st.tilt+=((st.R-st.L)*.05-st.tilt)*Math.min(1,dt*4);if(st.L+st.R>=N){st.end=.001;MS.good();}},
    draw(t){const cx=160,top=34;g.save();g.translate(cx,150);g.rotate(st.tilt*.3);g.translate(-cx,-150);const fl=k=>Math.min(1,k/(N/2));
      m4form(K,cx,top,fl(st.L),fl(st.R),t);g.setLineDash([2,2]);g.strokeStyle='rgba(155,224,122,.8)';g.beginPath();g.moveTo(cx-20,top+12);g.lineTo(cx-20,top+58);g.moveTo(cx+20,top+12);g.lineTo(cx+20,top+58);g.stroke();g.setLineDash([]);g.restore();
      // the straw waiting in a basket, and a handful going in
      K.ell(258,150,26,8,CA_P.straw[1]);K.ell(258,146,24,6,CA_P.straw[3]);for(let i=0;i<14;i++)K.line(240+i*3,146,236+i*3.5,134+((i*5)%7),CA_P.straw[3+(i%3)],1);
      const p=st.push>0?st.ps:0;if(p)for(let i=0;i<5;i++)K.line(cx+p*26,90+i,cx+p*(34+i*2),84+i*3,CA_P.straw[4+(i%2)],1);m4hand(K,cx-34+(p<0?10:0),92,true);m4hand(K,cx+34-(p>0?10:0),92);},
    hud(){K.label('L '+st.L+'  R '+st.R,160,14,Math.abs(st.L-st.R)<=1?'#9be07a':'#e8b030');K.meter((st.L+st.R)/N,1-Math.min(1,Math.abs(st.L-st.R)/4));},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.push<=0&&st.t>.5){a.side=st.L<=st.R?-1:1;}AP.hand=[160+(st.L<=st.R?-40:40),80];AP.press=!!a.side;},
    quiet(){},stop(){}};};
