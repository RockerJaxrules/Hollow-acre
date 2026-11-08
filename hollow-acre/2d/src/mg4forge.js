/* ================= the forge games: pump the bellows to the right colour, shape hot metal on the anvil where it's still too thick,
   plunge it into the trough and hold it till the hissing stops, hold the edge to the grindstone at the right angle,
   skim the slag off molten metal, wind wire and close mail rings. ================= */
// metal glows by heat: black, dull red, cherry, orange, yellow, white
const HEATC=['#2a2624','#4a2018','#8a2414','#c83a14','#f06a1c','#f8a83c','#fcd870','#fff4d0'];
const heatCol=h=>HEATC[Math.max(0,Math.min(7,Math.round(h*7)))];
const M4F={
  anvil:()=>M4.pre('anvil',112,58,K=>{const I=CA_P.iron;
    // the horn, the face, the heel, the waist and the foot
    for(let x=0;x<26;x++){const h=Math.max(1,Math.round(7-x*.22));for(let y=0;y<h;y++)K.px(x+1,8+y+(7-h)/2,1,1,I[y<1?6:y<2?5:3]);}
    K.px(26,6,70,12,I[3]);for(let y=0;y<12;y++)K.px(26,6+y,70,1,I[y<1?7:y<2?6:y<4?5:y<9?3:2]);K.px(96,6,12,9,I[3]);K.px(96,6,12,1,I[6]);K.px(84,8,4,4,I[0]);K.px(76,8,3,3,I[1]);
    for(let y=18;y<40;y++){const w=Math.round(26-(y<30?(y-18)*.6:(39-y)*.2)*1);K.px(61-w,y,w*2,1,I[y<22?2:3]);K.px(61-w,y,2,1,I[5]);K.px(59+w,y,2,1,I[1]);}
    K.px(30,40,62,8,I[2]);K.px(30,40,62,1,I[5]);K.px(26,48,70,4,I[1]);},true),
  stump:()=>M4.pre('stump',84,40,K=>{const W=CA_P.wood;for(let y=0;y<38;y++)for(let x=0;x<80;x++){const n=K.H32(x>>1,y,3);K.px(2+x,1+y,1,1,y<6?(((x-40)**2/1600+(y-3)**2/9)<1?W[((Math.hypot((x-40)/2,(y-3)*2)|0)%3)+4]:W[2]):W[x<6?5:x>74?1:(n>.8?2:3)]);}},true),
  bellows:()=>M4.pre('bellows',76,44,K=>{},false),
  tongs:()=>M4.pre('tongs',56,14,K=>{const I=CA_P.iron;K.line(1,5,40,6,I[3],2);K.line(1,8,40,7,I[2],2);K.px(40,4,4,6,I[4]);K.line(44,6,54,3,I[4],2);K.line(44,7,54,10,I[3],2);},true),
  shammer:()=>M4.pre('shammer',30,52,K=>{const I=CA_P.iron,H=['#5a3a1a','#8a6234','#b48a50','#d4ae72'];for(let y=12;y<50;y++){K.px(13,y,1,1,H[3]);K.px(14,y,2,1,H[2]);K.px(16,y,1,1,H[1]);}
    for(let y=1;y<=12;y++)for(let x=2;x<=27;x++){let k=y<2?7:y<4?6:y<9?4:2;if(x<4||x>25)k-=1;if(x===2||x===27)k=1;K.px(x,y,1,1,I[k]);}K.px(1,3,1,8,I[5]);K.px(28,3,1,8,I[2]);},true),
  wheel:()=>M4.pre('wheel',72,72,K=>{const S=['#5a5248','#7a7064','#9a8e7e','#b4a894','#ccc0aa'];for(let y=-34;y<=34;y++)for(let x=-34;x<=34;x++){const d=Math.hypot(x,y);if(d>34)continue;const n=K.H32(x+40,y+40,7);let k=d>32?0:d>30?1:n>.75?3:n>.3?2:1;if(d<6)k=d<3?0:4;K.px(36+x,36+y,1,1,S[k]);}
    for(let a=0;a<6.28;a+=.785)for(let r=8;r<29;r+=2)K.px(36+Math.cos(a)*r,36+Math.sin(a)*r,1,1,'#6a6256');},true)};
// ---------------------------------------------------------------- BELLOWS: each pump feeds the fire; the bag needs a moment to fill again; hold the metal at its colour
S4.bellows=(sp,K)=>{const g=K.g,LO=(sp.band||[.6,.82])[0],HI=(sp.band||[.6,.82])[1],DUR=sp.dur||6,item=sp.item||'bar';const bel=M4F.bellows();
  const st={H:.25,fill:1,pump:0,prog:0,inT:0,runT:0,burn:0,t:0,end:0,puffs:[]};let roar=null;
  const pumpNow=()=>{const p=st.fill;st.fill=0;st.pump=.001;st.H=Math.min(1.15,st.H+.095*(.25+.75*p));A.hiss(.32,.18*(.4+.6*p),'lowpass',380,{slide:900});A.tone(90,.18,'sine',.08*(p+.3),{slide:60});
    K.emit(100,100,6,{c:['#fff4d0','#ffd27a','#f08a1c'],v:60+p*60,ang:-Math.PI*.85,spread:1,g:-40,life:.6});if(p<.45)K.judge(.25,140,70,true);};
  return {title:sp.t||'Pump the bellows',how:item==='pump'?'Tap to pump. Each stroke builds pressure, but the pump needs a moment to refill. Keep the needle in the green.':'Tap to pump. Each pump feeds the fire, but the bellows need a moment to fill again. Keep the metal glowing in the green.',hint:'Tap to pump. Hold the glow in the green.',st,
    update(dt,I){st.t+=dt;if(!roar)roar=MS.loop('lowpass',300,.8);roar.set(.03+st.H*.12,180+st.H*500);
      if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.12-st.burn*.25,0,1);}return;}
      st.runT+=dt;st.fill=Math.min(1,st.fill+dt/.5);if(st.pump>0){st.pump+=dt/.3;if(st.pump>=1)st.pump=0;}
      st.H-=.085*(st.H-.12)*dt*1.4;if(I.pressed)pumpNow();
      if(st.H>=LO&&st.H<=HI){st.inT+=dt;st.prog+=dt/DUR;}else if(st.H>HI){st.burn+=dt;if(item!=='pump'&&Math.random()<dt*20)K.emit(70,96,1,{c:['#ffffff','#fff4d0'],v:90,spread:2,g:120,life:.5});}
      if(item!=='pump'&&Math.random()<dt*(4+st.H*30))K.emit(36+Math.random()*48,96,1,{c:['#ffd27a','#f06a1c','#c83a14'],v:30+st.H*60,spread:.8,g:-30,life:.9+st.H});
      if(item!=='pump'&&Math.random()<dt*st.H*6)A.tone(1800+Math.random()*1800,.02,'square',.012);if(item==='pump'&&roar)roar.set(st.H*.08,1800+st.H*1200);
      if(st.prog>=1||st.runT>(sp.time||16)){st.end=.001;MS.good();}},
    draw(t){const H=st.H;
      // coals: a heap of lumps whose cracks glow with the heat
      for(let i=0;i<26;i++){const cx=24+(i*37%64),cy=100+((i*13)%10),r=3+(i%3);const gl=Math.max(0,Math.min(1,H*1.2-((i*7)%5)*.08+Math.sin(t*3+i)*.08));K.ball(cx,cy,r,['#0a0806','#1a1614','#2a2420','#3a332c'],r-1);if(gl>.2){K.px(cx-1,cy,2,1,heatCol(gl*.9));K.px(cx,cy-1,1,1,heatCol(gl));}}
      K.px(20,80,72,30,'#1a0a04');MG4ART.fire(K,22,106,68,28,.3+H*.8,t,[20,80,72,30]);K.glow(56,96,60+H*50,'255,150,60',.2+H*.35);
      if(item==='pump'){const P_=st.H;const cx=150,cy=96;K.ball(cx,cy,14,CA_P.brass,8);K.px(cx-2,cy-24,4,12,CA_P.brass[4]);for(let a=0;a<6.28;a+=.5){const r=6+P_*40;for(let k=0;k<5;k++){const u=k/5;K.pa(cx+Math.cos(a+st.t*3)*r*u,cy-24-Math.sin(u*Math.PI)*P_*30+u*10,1,1,'#9cc4e0',.8*(1-u));}}
        K.px(200,70,12,60,CA_P.iron[4]);K.px(200,70,12,1,CA_P.iron[6]);const pl=st.pump>0?Math.sin(Math.PI*Math.min(1,st.pump))*14:0;K.px(205,46+pl,2,26,CA_P.iron[6]);K.px(196,44+pl,20,4,CA_P.wood[4]);m4hand(K,206,42+pl);K.line(200,124,cx+8,cy+6,'#3a3a3a',2);
        K.ball(240,110,8,['#2a2a2a','#c8c0a8','#e8e0cc','#f8f4ec']);const na=-2.3+Math.min(1.1,P_)*2.8;K.line(240,110,240+Math.cos(na)*6,110+Math.sin(na)*6,'#a02a1a',1);return;}
      if(item==='crucible'){const cx=58,cy=92;K.ball(cx,cy,13,['#3a2a20','#6a4a34','#8a6a4c','#a8886a'],11);K.ell(cx,cy-9,11,3,'#2a1a10');const m=Math.min(1,st.prog*1.4);if(m>0){K.ell(cx,cy-9,9*m+1,2,heatCol(.55+H*.4));K.px(cx-4,cy-10,4,1,'#fff4d0');}else for(let k=0;k<5;k++)K.px(cx-7+k*3,cy-11+(k%2),3,2,sp.ore||'#8a6a4a');K.glow(cx,cy-6,24,'255,180,80',.2+H*.3);}
      else{const c=heatCol(Math.min(1,H));for(let x=40;x<150;x++){const u=(x-40)/110,hh=Math.max(0,Math.min(1,H*(1.15-u*1.1)));K.px(x,96,1,4,u<.5?heatCol(hh):CA_P.iron[3]);K.px(x,96,1,1,u<.5?heatCol(Math.min(1,hh+.15)):CA_P.iron[5]);}K.glow(70,98,26,'255,170,80',.2+H*.3);M4.rot(g,M4F.tongs(),150,98,0,0,7);}
      // the bellows: the bottom board stays put, the top board hinges at the nozzle; the leather pleats open and close between them
      const sq=st.pump>0?Math.sin(Math.PI*Math.min(1,st.pump)):0,open=Math.max(.15,(.35+.65*st.fill)-sq*.8),NX=104,NY=100,BL=62,ang=-.08-open*.32;const W=CA_P.wood,L=CA_P.leather;
      K.px(NX-8,NY-2,12,4,CA_P.brass[3]);K.px(NX-8,NY-2,12,1,CA_P.brass[6]);K.px(NX-12,NY-1,5,2,CA_P.brass[2]);
      for(let i=0;i<=BL;i++){const x=NX+4+i;const yb=NY+2+i*.12,yt=NY-2+Math.tan(ang)*i;const fold=Math.floor((yb-yt)/5);for(let y=Math.ceil(yt)+2;y<yb-1;y++){const u=(y-yt)/(yb-yt);K.px(x,y,1,1,L[(Math.floor(u*fold*2))%2?2:4]);}
        K.px(x,yb,1,3,W[i%11===0?2:3]);K.px(x,yb,1,1,W[5]);K.px(x,yt-2,1,3,W[i%11===0?3:4]);K.px(x,yt-2,1,1,W[6]);}
      const hx=NX+4+BL,hy=NY-2+Math.tan(ang)*BL;K.px(hx,hy-1,12,3,W[4]);K.px(hx+9,hy-6,3,8,W[3]);m4hand(K,hx+11,hy-6);},
    hud(t){K.label(item==='pump'?'PRESSURE':'HEAT',286,21,'#f4ecd8');K.gauge(282,30,8,92,LO/1.15,HI/1.15,st.H/1.15,{zone:'#5a3a14'});K.meter(st.prog,st.runT?st.inT/st.runT:1);if(item==='pump')return;
      K.label('BELLOWS',150,52,st.fill<.95?'#e8b030':'#9be07a');K.px(132,60,36,3,'#1a0e06');K.px(133,61,34*st.fill,1,st.fill<.95?'#e8b030':'#9be07a');
      if(st.H>HI&&Math.floor(t*6)%2)K.label('TOO HOT: IT’LL BURN',160,24,'#e8542a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);const mid=(LO+HI)/2;if(st.H<mid-.02&&st.fill>.9&&st.t>.4)m4tap(a);AP.hand=[176,70];AP.press=a.down;},
    quiet(){roar&&roar.set(0);},stop(){roar&&roar.stop();roar=null;}};};
// ---------------------------------------------------------------- ANVIL: the metal is thickest where it glows above the outline; strike there while it's hot
S4.anvil=(sp,K)=>{const g=K.g,AX=110,AY=108,X0=150,N=48,shape=sp.shape||'blade',an=M4F.anvil(),stump=M4F.stump(),ham=M4F.shammer();
  const tgt=new Array(N),h=new Array(N);for(let i=0;i<N;i++){const u=i/(N-1);h[i]=8+(Math.random()-.5)*.6;
    tgt[i]=shape==='blade'?(u<.3?7:7-(u-.3)/.7*5):shape==='point'?(u<.55?6:6-(u-.55)/.45*5):shape==='curve'?6.5-Math.sin(u*Math.PI)*1.5-(u>.75?(u-.75)*12:0):5;}
  const st={hx:X0+30,heat:1,strikes:0,swing:-1,t:0,end:0,reheat:0,errs:[],cold:0};
  const err=()=>{let e=0;for(let i=0;i<N;i++)e+=Math.max(0,h[i]-tgt[i])+Math.max(0,tgt[i]-h[i])*1.6;return e/N;};const e0=err();
  const strike=x=>{const ci=Math.round((x-X0)/2);const hot=st.heat;if(hot<.25){st.cold++;MS.anvil(1.3);K.judge(.15,x,AY-40,true);MS.miss();K.emit(x,AY-8,4,{c:['#c8c0b0'],v:60,g:200,life:.3});return;}
    // the blow flattens most under the hammer and spreads to either side; metal already at its line barely moves, except right under the face
    let before=0,after=0;for(let i=Math.max(0,ci-5);i<=Math.min(N-1,ci+5);i++){const w=Math.exp(-((i-ci)**2)/8),d=Math.min(h[i]-1,(.9+hot*.9)*w,Math.max(0,h[i]-tgt[i])+(i===ci?.5:0));before+=Math.abs(h[i]-tgt[i]);h[i]-=Math.max(0,d);after+=Math.abs(h[i]-tgt[i]);}
    const gain=before-after;const q=gain>1.2?1:gain>.4?.75:gain>-.3?.45:.15;K.judge(q,x,AY-44,true);if(q<.3)MS.miss();
    st.heat=Math.max(0,st.heat-.05);st.strikes++;MS.anvil(.75+(1-hot)*.45);MS.thunk();K.shk=.12;K.emit(x,AY-6,10+hot*12,{c:['#fff4d0','#ffd27a','#f08a1c'],v:110,spread:2.6,g:260,life:.5});K.emit(x,AY-6,3,{c:['#3a3430'],v:50,spread:2,g:300,life:.6});};
  return {title:sp.t||'Shape it on the anvil',how:'Tap the metal where it bulges above the outline to hammer it down. It cools as you work: strike while it glows. Too many blows in one place and it goes too thin.',hint:'Tap the thick parts above the outline. Work it while it glows.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.8){st.done=true;st.score=M4.cl(1-err()/Math.max(.6,e0)*.9-st.cold*.05,0,1);}return;}
      if(st.reheat>0){st.reheat+=dt/1.3;if(st.reheat>=1){st.reheat=0;st.heat=1;MS.whoosh();}return;}
      st.heat=Math.max(0,st.heat-dt*(sp.cool||.1));if(st.heat<=.06){st.reheat=.001;A.hiss(.4,.1,'lowpass',500);}
      const kx=I.key||I.demo&&this._k;if(I.ax)st.hx=M4.cl(st.hx+I.ax*140*dt,X0,X0+N*2);
      if(st.swing>=0){st.swing+=dt/.16;if(st.swing>=.5&&!st.hit){st.hit=1;strike(st.sx);}if(st.swing>=1)st.swing=-1;}
      else if(I.pressed){st.sx=I.key?st.hx:M4.cl(I.x,X0,X0+N*2);st.hx=st.sx;st.swing=0;st.hit=0;}
      if(err()<.35||st.strikes>=(sp.max||32)||st.t>(sp.time||28)){st.end=.001;MS.good();}},
    draw(t){g.drawImage(stump,AX+13,AY+40);g.drawImage(an,AX-6,AY-8);
      const rh=st.reheat>0?Math.sin(Math.PI*st.reheat):0,off=-rh*90;
      for(let i=0;i<N;i++){const x=X0+i*2+off,th=Math.max(1,h[i]),ty=AY-2-th;const c=heatCol(Math.min(1,st.heat*.95+.05));K.px(x,ty,2,th,c);K.px(x,ty,2,1,heatCol(Math.min(1,st.heat+.2)));K.px(x,AY-2,2,1,'#2a1a10');
        const tt=AY-2-tgt[i];if(!st.reheat)K.px(x,tt,2,1,h[i]-tgt[i]>.6?'#9be07a':'#5a8a4a');}
      M4.rot(g,M4F.tongs(),X0+N*2+off+2,AY-5,0,0,7);m4hand(K,X0+N*2+off+58,AY-4);
      if(!st.reheat)K.glow(X0+N+off,AY-6,40,'255,160,70',st.heat*.3);
      const sw=st.swing<0?0:st.swing<.5?st.swing*2:1-(st.swing-.5)*2;const up=st.swing<0?(Math.sin(st.t*4)*2+26):26-sw*26;const hx=st.hx;
      if(!st.reheat){M4.rot(g,ham,hx,AY-6-up-12,(1-sw)*-.3*(st.swing<0?.4:1),15,12);m4hand(K,hx+1,AY-6-up+28);}
      if(st.reheat)K.label('BACK IN THE FIRE',160,40,'#ffd27a');},
    hud(t){K.label('HEAT',286,21,'#f4ecd8');K.gauge(282,30,8,80,.25,1,st.heat,{zone:'#5a3a14'});K.meter(1-Math.min(1,err()/Math.max(.6,e0)));
      if(st.heat<.3&&!st.reheat&&Math.floor(t*4)%2)K.label('COOLING',160,24,'#e8b030');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.swing<0&&!st.reheat&&st.t>.5){if(this._w==null)this._w=.35;this._w-=dt;if(this._w<=0){let bi=0,bv=-9;for(let i=0;i<N;i++){let s=0;for(let j=Math.max(0,i-3);j<=Math.min(N-1,i+3);j++)s+=h[j]-tgt[j];if(s>bv){bv=s;bi=i;}}m4move(a,X0+bi*2,AY-10);m4tap(a);this._w=.38;}}AP.hand=[a.x+4,AY-30];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- QUENCH: plunge it in fast and all the way, hold it still till the hissing stops, then lift it out
S4.quench=(sp,K)=>{const g=K.g,TX=200,TY=118,TW=96,L=56,TANG=10;const st={d:0,heat:Array.from({length:L},(_,i)=>i<TANG?.25:1),warp:0,in:0,t:0,end:0,out:0,boil:0,lifted:0};let hiss=null;
  const hotB=()=>{let m=0;for(let i=TANG;i<L;i++)m=Math.max(m,st.heat[i]);return m;};
  return {title:sp.t||'Quench it',how:'Hold to lower the hot blade into the water, all the way in one go. Keep holding until the hissing stops, then let go to lift it out.',hint:'Hold: plunge it fully, wait for quiet, let go.',st,
    update(dt,I){st.t+=dt;if(!hiss)hiss=MS.loop('highpass',2600,.6);
      if(st.end){st.end+=dt;hiss.set(0);if(st.end>.7){const hot=hotB();st.done=true;st.score=M4.cl((1-Math.min(1,st.warp*1.6))*.6+(hot<.18?.4:hot<.35?.25:.08),0,1);}return;}
      st.d=M4.cl(st.d+(I.down?1.3:-1.6)*dt,0,1);const sub=Math.round(st.d*L*.95);let boil=0;
      for(let i=0;i<L;i++){if(L-1-i<sub){const c=st.heat[i];st.heat[i]=Math.max(0,c-dt*1.1);if(i>=TANG)boil+=c;}}boil/=(L-TANG)*.5;st.boil+=(boil-st.boil)*Math.min(1,dt*8);
      if(st.d>.05&&st.d<.9){let top=0;for(let i=TANG;i<L;i++){if(!(L-1-i<sub))top+=st.heat[i];}st.warp+=dt*Math.min(1,top/(L-TANG))*.55;}
      if(st.d>.05)st.in=1;hiss.set(Math.min(.3,st.boil*.35),2200+st.boil*2000);
      if(st.boil>.05&&Math.random()<dt*st.boil*40)K.emit(TX+(Math.random()-.5)*14,TY-4,1,{c:['#f4f0e8','#e8e4dc'],v:30,ang:-Math.PI/2,spread:1.2,g:-60,life:1.4,sz:4,kind:'steam'});
      if((st.in&&st.d<.02&&!I.down)||st.t>(sp.time||14)){st.end=.001;MS.good();}},
    draw(t){const I=CA_P.iron;g.drawImage(M4.pre('trough',TW+10,50,k=>{k.planks(1,1,TW+8,48,M4.sh(CA_P.wood,-1),8,7);k.plank(1,1,TW+8,4,CA_P.wood,3);k.metal(1,15,TW+8,3,I,10);k.metal(1,35,TW+8,3,I,10);},true),TX-TW/2-5,TY-5);
      const wl=TY+2;K.px(TX-TW/2,wl,TW,8,'#2a4a6a');for(let x=0;x<TW;x+=3)K.px(TX-TW/2+x,wl+Math.round(Math.sin(x*.4+t*6)*st.boil),2,1,'#4a7aa0');
      const by=wl-L+Math.round(st.d*L*.95)+Math.round(Math.sin(t*40)*st.boil*1.2);for(let i=0;i<L;i++){const y=by+i,w=i>L-10?Math.max(1,6-(i-L+10)*.6):6;if(y>=wl+1){K.pa(TX-3,y,w,1,heatCol(st.heat[i]),.55);continue;}K.px(TX-3,y,w,1,heatCol(st.heat[i]));K.px(TX-3,y,1,1,heatCol(Math.min(1,st.heat[i]+.15)));}
      for(let i=0;i<Math.round(st.boil*14);i++){const bx=TX-14+((i*29+Math.floor(t*20)*7)%28),ph=(t*3+i*.3)%1;K.px(bx,wl+2+ph*6,2,2,'#c8e0f0');}
      K.px(TX-2,by-18,4,18,I[3]);M4.rot(g,M4F.tongs(),TX,by-18,-Math.PI/2,0,7);m4hand(K,TX+1,by-60);
      if(st.boil>.15)K.glow(TX,wl,40,'255,255,255',st.boil*.15);},
    hud(t){const hot=hotB();K.label('HISS',286,21,'#f4ecd8');K.gauge(282,30,8,80,0,.18,Math.min(1,st.boil),{zone:'#2c5a1c'});K.meter(1-hot,1-Math.min(1,st.warp*1.6));
      if(st.d>.05&&st.d<.85&&st.warp>.05&&Math.floor(t*5)%2)K.label('ALL THE WAY IN',160,24,'#e8b030');if(st.in&&st.boil<.05&&st.d>.9&&Math.floor(t*3)%2)K.label('QUIET: LIFT IT OUT',160,34,'#9be07a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);const hot=hotB();m4hold(a,st.t>.5&&(hot>.12||st.boil>.04));AP.hand=[TX+12,40];AP.press=a.down;},
    quiet(){hiss&&hiss.set(0);},stop(){hiss&&hiss.stop();hiss=null;}};};
// ---------------------------------------------------------------- GRIND: hold the edge to the turning stone at the right angle; the wheel kicks, so keep correcting
S4.grind=(sp,K)=>{const g=K.g,WX=150,WY=84,R=34,A0=sp.angle||.42,TOL=.11,wheel=M4F.wheel();
  const st={a:A0+.25,prog:0,inT:0,runT:0,t:0,end:0,kick:0,spin:0,tread:0};let grind=null;
  return {title:sp.t||'Sharpen it on the stone',how:'Hold the blade to the turning stone at the right angle: '+(K.fine?'move the mouse up and down (or W/S)':'drag up and down')+'. The wheel kicks the blade, so keep correcting. Hold to press it to the stone.',hint:'Keep the angle in the green while you hold.',st,
    update(dt,I){st.t+=dt;if(!grind)grind=MS.loop('bandpass',2600,1.5);st.spin+=dt*7;st.tread+=dt*3;
      if(st.end){st.end+=dt;grind.set(0);if(st.end>.6){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.15,0,1);}return;}
      st.kick+=(Math.sin(st.t*1.7)*.35+Math.sin(st.t*4.3)*.2+(Math.random()-.5)*1.5-st.kick)*dt*2;st.a+=st.kick*dt*.9;
      if(I.key||I.ay)st.a+=I.ay*.9*dt;else if(!I.demo||this._ai)st.a=M4.cl(st.a+(I.dy||0)*-.012,0,1.2);st.a=M4.cl(st.a,0,1.2);
      const on=I.down;if(on){st.runT+=dt;}const inb=Math.abs(st.a-A0)<=TOL;
      if(on&&inb){st.inT+=dt;st.prog+=dt/(sp.dur||5);if(Math.random()<dt*60)K.emit(WX-R*Math.cos(.6)+2,WY+R*Math.sin(.6)-2,1,{c:['#fff4d0','#ffd27a','#f8a83c'],v:120+Math.random()*80,ang:Math.PI*.78,spread:.5,g:240,life:.5});}
      else if(on&&Math.random()<dt*12)K.emit(WX-R*.8,WY+R*.55,1,{c:['#c8a060'],v:80,ang:Math.PI*.8,spread:1,g:240,life:.4});
      grind.set(on?(inb?.14:.07):0,inb?2600:1500,inb?1.5:4);
      if(st.prog>=1||st.t>(sp.time||15)){st.end=.001;MS.good();}},
    draw(t){const W=CA_P.wood;K.px(WX-44,WY+30,88,6,W[3]);K.px(WX-40,WY-2,4,66,W[4]);K.px(WX+36,WY-2,4,66,W[4]);K.px(WX-36,WY+50,72,14,'#2a4a6a');K.px(WX-36,WY+50,72,1,'#4a7aa0');
      M4.rot(g,wheel,WX,WY,st.spin,36,36);K.px(WX-2,WY-2,4,4,CA_P.iron[5]);const tr=Math.sin(st.tread)*5;K.px(WX-30,WY+64+tr,60,3,W[5]);
      const cx=WX-R*Math.cos(.6),cy=WY+R*Math.sin(.6);const ang=Math.PI+.6-(st.a-A0)*1.4-.2;const bl=60;
      const ex=cx-Math.cos(ang-Math.PI)*bl,ey=cy-Math.sin(ang-Math.PI)*bl;const nx=-(ey-cy)/bl,ny=(ex-cx)/bl;
      // the blade as a real shape: spine, flat and a bright edge that sharpens as you go
      g.fillStyle=CA_P.iron[4];g.beginPath();g.moveTo(cx,cy);g.lineTo(ex+nx*5,ey+ny*5);g.lineTo(ex-nx*2,ey-ny*2);g.closePath();g.fill();g.fillStyle=CA_P.iron[6];g.beginPath();g.moveTo(cx,cy);g.lineTo(ex+nx*5,ey+ny*5);g.lineTo(ex+nx*3,ey+ny*3);g.closePath();g.fill();
      K.line(cx,cy,ex-nx*2,ey-ny*2,st.prog>.5?'#ffffff':CA_P.iron[7],1);K.line(cx,cy,ex+nx*5,ey+ny*5,CA_P.iron[2],1);
      K.px(ex-12,ey-2,14,6,CA_P.wood[3]);m4hand(K,ex-8,ey);
      if(Math.abs(st.a-A0)<=TOL)K.glow(cx,cy,14,'255,220,140',.3);},
    hud(t){K.label('ANGLE',286,21,'#f4ecd8');K.gauge(282,30,8,80,(A0-TOL)/1.2,(A0+TOL)/1.2,st.a/1.2);K.meter(st.prog,st.runT?st.inT/st.runT:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.t>.4);a.ay=M4.cl((A0-st.a)*8,-1,1);AP.hand=[90,120];AP.press=a.down;},
    quiet(){grind&&grind.set(0);},stop(){grind&&grind.stop();grind=null;}};};
// ---------------------------------------------------------------- SKIM: dross floats up through the melt; scoop each lump off before it sinks back, and don't waste good metal
S4.skim=(sp,K)=>{const g=K.g,CX=160,CY=92,RX=70,RY=22,N=sp.n||5,COL=sp.col||['#ff9a3a','#ffd27a','#fff4d0'];
  const st={lumps:[],made:0,got:0,lost:0,waste:0,t:0,end:0,sk:null,next:.8};
  const spawn=()=>{const a=Math.random()*6.28,r=Math.random()*.7;st.lumps.push({x:CX+Math.cos(a)*RX*r,y:CY+Math.sin(a)*RY*r,life:0,max:3.6+Math.random()*1.4,sz:3+Math.random()*3,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*3});st.made++;};
  const scoop=(x,y)=>{st.sk={x,y,t:0};let best=null,bd=1e9;for(const l of st.lumps){const d=Math.hypot(l.x-x,(l.y-y)*1.6);if(d<bd){bd=d;best=l;}}
    if(best&&bd<14&&best.life>.35){st.lumps.splice(st.lumps.indexOf(best),1);st.got++;MS.plop();A.tone(300,.1,'sine',.08,{slide:200});K.judge(best.life<best.max*.6?1:.75,x,y-20,true);K.emit(x,y,6,{c:['#3a3430','#6a6460'],v:50,g:200,life:.5});}
    else{st.waste++;A.hiss(.2,.12,'lowpass',900);K.judge(.15,x,y-20,true);MS.miss();K.emit(x,y,6,{c:COL,v:50,g:200,life:.4});}};
  return {title:sp.t||'Skim off the slag',how:'Grey slag floats up through the molten metal. Tap each lump to scoop it off before it sinks back in. Tapping clean metal wastes it.',hint:'Tap the grey lumps. Leave the bright metal.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.cl(st.got/N-st.waste*.08,0,1);}return;}
      st.next-=dt;if(st.made<N&&st.next<=0){spawn();st.next=.9+Math.random()*.9;}
      for(let k=st.lumps.length-1;k>=0;k--){const l=st.lumps[k];l.life+=dt;l.x+=l.vx*dt;l.y+=l.vy*dt;if(((l.x-CX)/RX)**2+((l.y-CY)/RY)**2>.8){l.vx*=-1;l.vy*=-1;}if(l.life>l.max){st.lumps.splice(k,1);st.lost++;K.judge(.15,l.x,l.y-16,true);MS.miss();}}
      if(I.pressed){if(I.key){const l=st.lumps.filter(l=>l.life>.35).sort((a,b)=>a.life-b.life).pop();if(l)scoop(l.x,l.y);else scoop(CX,CY);}else scoop(I.x,I.y);}
      if(st.sk){st.sk.t+=dt;if(st.sk.t>.35)st.sk=null;}
      if(st.made>=N&&!st.lumps.length){st.end=.001;MS.good();}},
    draw(t){const S=CA_P.stone;K.ell(CX,CY+16,RX+12,RY+8,'#1a1614');for(let y=0;y<26;y++){const w=RX+10-y*.2;K.px(CX-w,CY+y-4,w*2,1,S[y<3?4:y<20?2:1]);}
      K.ell(CX,CY,RX+8,RY+6,S[5]);K.ell(CX,CY,RX+4,RY+3,S[1]);K.ell(CX,CY,RX,RY,COL[0]);for(let k=0;k<14;k++){const a=k*.45+t*.3,r=.3+((k*7)%5)/7;K.ell(CX+Math.cos(a)*RX*r*.8,CY+Math.sin(a)*RY*r*.8,8,2,COL[1]);}K.ell(CX-18,CY-6,24,4,COL[2]);K.glow(CX,CY,90,'255,190,90',.4);
      for(const l of st.lumps){const up=Math.min(1,l.life/.35),sink=Math.max(0,(l.life-(l.max-.6))/.6);const r=l.sz*up*(1-sink*.6);if(r<.5)continue;K.ball(l.x,l.y,Math.max(1,Math.round(r)),['#1a1816','#3a3430','#5a544e','#7a746c'],Math.max(1,Math.round(r*.55)));if(sink>0)K.pa(l.x-r,l.y-1,r*2,2,COL[0],sink);}
      const sx=st.sk?st.sk.x:CX+RX+20,sy=st.sk?st.sk.y:CY-30;const dip=st.sk?Math.sin(Math.PI*st.sk.t/.35)*4:0;K.line(sx+4,sy-4+dip,sx+60,sy-46,CA_P.iron[4],2);K.ell(sx,sy+dip,6,2,CA_P.iron[5]);K.ell(sx,sy-1+dip,4,1,CA_P.iron[3]);m4hand(K,sx+56,sy-44);},
    hud(){K.label('SLAG '+st.got+'/'+N,30,20,'#f4ecd8','l');K.meter(st.got/N);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const l=st.lumps.filter(l=>l.life>.5).sort((a,b)=>b.life-a.life)[0];if(l&&!st.sk&&!a.down){if(this._w==null)this._w=.2;this._w-=dt;if(this._w<=0){m4move(a,l.x,l.y);m4tap(a);this._w=.25;}}AP.hand=[a.x+3,a.y-12];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- CRANK: wind the wire round the rod in even turns: steady circles, not too fast
S4.crank=(sp,K)=>{const g=K.g,RX=60,RY=94,RL=180,CXk=262,CYk=94,CR=16,N=sp.n||18;
  const st={ang:0,turns:0,coils:[],last:null,spd:0,t:0,end:0,spds:[],ok:0};let wind=null;
  return {title:sp.t||'Wind the wire into a coil',how:sp.look==='mortar'?'Grind in circles with the pestle: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace.':sp.look==='straw'?'Twist the straw: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace.':sp.look==='rug'?'Coil the braid round into a rug: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace.':K.fine?'Turn the crank in circles with the mouse (or hold Space). Keep an even, steady pace so the coils sit tight.':'Turn the crank by drawing circles with your finger. Keep an even, steady pace so the coils sit tight.',hint:'Steady circles: not too fast, not too slow.',st,
    update(dt,I){st.t+=dt;if(!wind)wind=MS.loop('bandpass',900,3);if(st.end){st.end+=dt;wind.set(0);if(st.end>.6){st.done=true;st.score=M4.cl(st.ok/Math.max(1,st.coils.length),0,1);}return;}
      let da=0;const ccx=sp.look?160:CXk,ccy=sp.look?96:CYk;if(I.key&&I.down)da=dt*6.2;else if(I.down){const a=Math.atan2(I.y-ccy,I.x-ccx);if(st.last!=null){let d=a-st.last;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;da=Math.max(0,d);}st.last=a;}else st.last=null;
      st.ang+=da;st.spd+=(da/dt-st.spd)*Math.min(1,dt*5);wind.set(da>0?Math.min(.1,st.spd*.012):0,500+st.spd*80,3);
      while(st.ang>=Math.PI*2){st.ang-=Math.PI*2;const s=st.spd;const ok=s>3.2&&s<9.5;st.coils.push(ok?1:s>=9.5?2:0);if(ok)st.ok++;A.tone(ok?900:600,.04,'triangle',.05);if(!ok)K.judge(.25,RX+st.coils.length*6,RY-24,true);else if(st.coils.length%4===0)K.judge(1,RX+st.coils.length*6,RY-24,true);}
      if(st.coils.length>=N){st.end=.001;MS.good();}},
    draw(t){const I=CA_P.iron,look=sp.look;
      if(look){const n=st.coils.length,cx=160,cy=96;
        if(look==='rug'){for(let i=0;i<n*14;i++){const a=i*.45,r=3+a*1.05;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.55;K.px(x-1,y-1,3,3,['#b25645','#90abc2','#d6ad52'][(i>>2)%3]);}const a=n*14*.45+st.ang,r=3+n*14*.45*1.05;m4hand(K,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.55-4);}
        else if(look==='mortar'){K.ell(cx,cy+24,40,10,'#3a3630');for(let y=0;y<26;y++){const w=40-y*.4;K.px(cx-w,cy+y-2,w*2,1,CA_P.stone[y<3?5:y<20?3:2]);}K.ell(cx,cy,34,8,CA_P.stone[1]);K.ell(cx,cy+1,30,6,'#d8d0c0');const bones=Math.max(0,8-n);for(let i=0;i<bones;i++)K.px(cx-20+i*5,cy-1+(i%2),4,2,'#efe8dc');
          const px=cx+Math.cos(st.ang)*18,py=cy+Math.sin(st.ang)*4;K.line(px,py,px+18,py-50,CA_P.stone[4],6);K.line(px+1,py-1,px+19,py-51,CA_P.stone[6],2);m4hand(K,px+18,py-50);}
        else{for(let i=0;i<9;i++){const tw=st.ang*.15+i*.7,ox=Math.sin(tw)*(4+n*.2);K.line(cx-20+i*4+ox,30,cx-4+i+ox*.3,130,CA_P.straw[3+(i%3)],2);}K.px(cx-12,124,24,6,'#93463f');m4hand(K,cx+Math.cos(st.ang)*16,40+Math.sin(st.ang)*4);m4hand(K,cx,128,true);}
        return;}
      K.px(RX-6,RY-30,8,60,CA_P.wood[3]);K.px(RX-6,RY-30,1,60,CA_P.wood[5]);K.metal(RX,RY-3,RL,6,I);
      st.coils.forEach((c,i)=>{const x=RX+4+i*(RL-10)/N;g.strokeStyle=c===1?'#c87a3a':c===2?'#a85a2a':'#8a4a2a';g.lineWidth=2;g.beginPath();g.ellipse(x+(c===2?(i%2?2:-2):0),RY,2.5,8+(c===0?2:0),0,0,6.29);g.stroke();K.px(x-1,RY-8,1,1,'#f4b070');});
      const sp_=st.coils.length;K.line(RX+4+sp_*(RL-10)/N,RY-8,RX+4+sp_*(RL-10)/N+8,RY-40,'#c87a3a',1);
      K.px(CXk-2,CYk-2,4,4,I[5]);const hx=CXk+Math.cos(st.ang)*CR,hy=CYk+Math.sin(st.ang)*CR;K.line(CXk,CYk,hx,hy,I[4],3);K.px(hx-3,hy-6,6,10,CA_P.wood[4]);m4hand(K,hx,hy+2);
      g.strokeStyle='rgba(255,244,192,.25)';g.lineWidth=1;g.beginPath();g.arc(CXk,CYk,CR,0,6.29);g.stroke();},
    hud(t){K.label('PACE',156,24,'#f4ecd8','r');K.gauge(162,24,90,6,3.2/12,9.5/12,Math.min(12,st.spd)/12);K.meter(st.coils.length/N,st.coils.length?st.ok/st.coils.length:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(this._a==null)this._a=0;if(st.t>.4){this._a+=dt*6.2;const ccx=sp.look?160:CXk,ccy=sp.look?96:CYk;m4move(a,ccx+Math.cos(this._a)*CR*2,ccy+Math.sin(this._a)*CR*2);m4hold(a,true);}AP.hand=[a.x+2,a.y-10];AP.press=a.down;},
    quiet(){wind&&wind.set(0);},stop(){wind&&wind.stop();wind=null;}};};
// ---------------------------------------------------------------- LINKS: the pliers squeeze each open ring shut; tap when the two ends meet for a closed, seamless link
S4.links=(sp,K)=>{const g=K.g,N=sp.n||8,COLS=8;const st={i:0,ph:0,sp:2.2,done_:[],t:0,end:0,close:0};
  const ringAt=i=>{const r=(i/COLS)|0,c=i%COLS;return [92+c*18+(r%2)*9,60+r*16];};
  return {title:sp.t||'Close the rings',how:'Each new ring hangs open while the pliers wobble its ends together and apart. Tap when the ends meet to close it seamlessly.',hint:'Tap when the two ends touch.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.done_);}return;}
      if(st.close>0){st.close+=dt/.25;if(st.close>=1){st.close=0;st.i++;st.ph=Math.random()*6;st.sp=2.2+st.i*.18;if(st.i>=N){st.end=.001;MS.good();}}return;}
      st.ph+=dt*st.sp;if(I.pressed){const gap=Math.abs(Math.sin(st.ph))*6;const q=M4.q(gap,.9,2,3.4);st.done_.push(q);st.gap=gap;st.close=.001;K.judge(q,ringAt(st.i)[0],ringAt(st.i)[1]-18,true);if(q<.3)MS.miss();MS.tink(.7);A.tone(2200,.04,'square',.02);}},
    draw(t){K.leather(70,40,180,80,CA_P.leather);for(let x=70;x<250;x+=6)K.px(x,40,3,1,CA_P.leather[5]);
      for(let i=0;i<Math.min(N,st.done_.length);i++){const [x,y]=ringAt(i);g.strokeStyle=st.done_[i]>.6?CA_P.iron[6]:CA_P.iron[4];g.lineWidth=2;g.beginPath();g.ellipse(x,y,6,5,0,0,6.29);g.stroke();if(st.done_[i]<.6){K.px(x+5,y-1,2,2,'#2a2018');}}
      if(st.i<N){const [x,y]=ringAt(st.i);const gap=st.close>0?(st.gap||0)*(1-st.close):Math.abs(Math.sin(st.ph))*6;g.strokeStyle=CA_P.iron[7];g.lineWidth=2;g.beginPath();g.ellipse(x,y,6,5,0,-Math.PI/2+gap*.09,Math.PI*1.5-gap*.09);g.stroke();
        K.px(x-1-gap*.5,y-7,2,3,CA_P.iron[7]);K.px(x+gap*.5,y-7,2,3,CA_P.iron[5]);
        for(const s of [-1,1]){const px=x+s*(5+gap*.5),py=y-10;K.line(px,py,px+s*18,py-26,CA_P.iron[3],3);K.px(px+s*18-4,py-34,8,10,'#b8402a');}m4hand(K,x-24,y-44,true);m4hand(K,x+24,y-44);}},
    hud(){K.label('RING '+Math.min(N,st.i+1)+'/'+N,30,20,'#f4ecd8','l');K.meter(st.done_.length/N,st.done_.length?M4.avg(st.done_):1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(!st.close&&st.t>.5&&Math.abs(Math.sin(st.ph+st.sp*.03))<.12)m4tap(a);const [x,y]=ringAt(Math.min(N-1,st.i));AP.hand=[x+10,y+14];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- the recipes
const m4rv=(fn,sc)=>K=>{K.g.save();K.g.translate(160,84);K.g.scale(sc||1.5,sc||1.5);K.g.translate(-120,-60);fn(K);K.g.restore();};
Object.assign(MG4R,{
  'b_furnace:cb':{scene:'forge',reveal:m4ico('cbar'),steps:[{k:'bellows',t:'Melt the copper',item:'crucible',band:[.55,.82],ore:'#c86a3a'},{k:'skim',t:'Skim the slag off',n:4,col:['#ff9a3a','#ffc070','#fff0c0']},{k:'pour',t:'Pour the copper into the mould',vessel:'crucible',col:['#ff9a3a','#ffd27a'],glow:1,bowl:'mould',line:.8}]},
  'b_furnace:ib':{scene:'forge',reveal:m4ico('ibar'),steps:[{k:'bellows',t:'Melt the iron: it wants it hotter',item:'crucible',band:[.68,.88],ore:'#6a4a3a'},{k:'skim',t:'Skim the slag off',n:6,col:['#ffb060','#ffd890','#fff4d0']},{k:'pour',t:'Pour the iron into the mould',vessel:'crucible',col:['#ffb060','#fff0b0'],glow:1,bowl:'mould',line:.8}]},
  'b_weapon:club':{scene:'workshop',reveal:m4rv(K=>RK.club(K,120,58)),steps:[{k:'saw',t:'Saw the blank from the oak log',n:9,wood:CA_P.oak,seed:14},{k:'plane',t:'Shave it to a grip',wood:CA_P.oak,seed:5,passes:3},{k:'brush',t:'Oil the grip',col:'#6a3a18',wood:CA_P.oak,time:16}]},
  'b_weapon:sickle':{scene:'forge',reveal:m4rv(K=>RK.sickle(K,128,56,CA_P.copper)),steps:[{k:'bellows',t:'Heat the copper',band:[.6,.84]},{k:'anvil',t:'Hammer the curve',shape:'curve'},{k:'quench',t:'Quench it'},{k:'grind',t:'Put an edge on it'}]},
  'b_weapon:machete':{scene:'forge',reveal:m4rv(K=>RK.machete(K,96,84)),steps:[{k:'bellows',t:'Heat the iron',band:[.66,.86]},{k:'anvil',t:'Draw out the blade',shape:'blade'},{k:'quench',t:'Quench it'},{k:'grind',t:'Sharpen it on the stone'}]},
  'b_armor:mail':{scene:'forge',reveal:K=>{for(let r=0;r<7;r++)for(let c=0;c<10;c++){const x=118+c*9+(r%2)*4,y=56+r*9;K.g.strokeStyle=CA_P.iron[6];K.g.lineWidth=1.5;K.g.beginPath();K.g.ellipse(x,y,5,4,0,0,Math.PI*2);K.g.stroke();}},
    steps:[{k:'crank',t:'Wind the wire into a coil',n:16},{k:'links',t:'Close the rings',n:10}]}});
