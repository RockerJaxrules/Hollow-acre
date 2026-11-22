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
  tongs:()=>M4.pre('tongs',56,14,K=>{const I=CA_P.iron;K.line(1,3,40,5,I[3],2);K.line(1,3,40,4,I[5],1);K.line(1,10,40,8,I[2],2);K.px(39,4,5,6,I[4]);K.px(39,4,5,1,I[6]);K.px(41,6,2,2,I[1]);K.px(41,6,1,1,I[7]);K.line(44,6,54,3,I[4],2);K.line(44,7,54,10,I[3],2);},true),
  shammer:()=>M4.pre('shammer',30,52,K=>{const I=CA_P.iron,H=['#5a3a1a','#8a6234','#b48a50','#d4ae72'];for(let y=12;y<50;y++){K.px(13,y,1,1,H[3]);K.px(14,y,2,1,H[2]);K.px(16,y,1,1,H[1]);}
    for(let y=1;y<=12;y++)for(let x=2;x<=27;x++){let k=y<2?7:y<4?6:y<9?4:2;if(x<4||x>25)k-=1;if(x===2||x===27)k=1;K.px(x,y,1,1,I[k]);}K.px(1,3,1,8,I[5]);K.px(28,3,1,8,I[2]);},true),
  // (t371) a sandstone wheel without the salt-and-pepper: a smooth face, a worn ring where the tools ride, the rim, a few hand-set grit
  // marks so you can see it turn; the light stays put (wheelLit, drawn over it, unturned)
  wheel:()=>M4.pre('wheel2',72,72,K=>{const S=['#4a4238','#6a6054','#8a7e6c','#a49682','#c0b29a'];for(let y=-34;y<=34;y++)for(let x=-34;x<=34;x++){const d=Math.hypot(x,y);if(d>34.4)continue;
      let k=d>32.5?0:d>30.5?1:(d>22.5&&d<24.5)?1:d<7?(d<3.2?0:d<4.2?1:3):2;K.px(36+x,36+y,1,1,S[k]);}
    for(const [a,r,w,k] of [[.3,14,2,1],[1.5,27,3,1],[2.4,18,2,3],[3.3,10,2,1],[4.1,26,2,3],[5.0,15,3,1],[5.7,28,2,3],[.9,20,1,3],[2.9,27,2,1],[4.6,20,2,1]])K.px(36+Math.cos(a)*r,36+Math.sin(a)*r,w,2,S[k]);},true),
  wheelLit:()=>M4.pre('wheelLit',72,72,K=>{for(let y=-34;y<=34;y++)for(let x=-34;x<=34;x++){const d=Math.hypot(x,y);if(d>34.4)continue;const l=(-x-y)/(d||1);
      if(d>29&&l>.45)K.pa(36+x,36+y,1,1,'#fff4e0',l>.8?.32:.18);else if(d>27&&l<-.4)K.pa(36+x,36+y,1,1,'#0a0604',l<-.8?.4:.24);else if(d<27&&l<-.2&&d>8)K.pa(36+x,36+y,1,1,'#0a0604',.1);}},false)};
// (t371) the tongs' jaws are at the sprite's right end: draw it mirrored so the jaws bite the work at (jx,jy) and the reins run out
// along ang to the fist, which closes on both reins near their ends
const m4tongs=(K,jx,jy,ang,o)=>{o=o||{};M4.rot(K.g,M4F.tongs(),jx,jy,ang,54,7,-1,1);if(o.hand===false)return null;const p=M4.tr(jx,jy,ang,o.at||45,0);m4grip(K,p[0],p[1],ang,{side:o.side||-1});return p;};
// ---------------------------------------------------------------- BELLOWS: each pump feeds the fire; the bag needs a moment to fill again; hold the metal at its colour
S4.bellows=(sp,K)=>{const g=K.g,LO=(sp.band||[.6,.82])[0],HI=(sp.band||[.6,.82])[1],DUR=sp.dur||6,item=sp.item||'bar';const bel=M4F.bellows();
  const st={H:.25,fill:1,pump:0,prog:0,inT:0,runT:0,burn:0,t:0,end:0,puffs:[]};let roar=null,crk=null;
  const pumpNow=()=>{const p=st.fill;st.fill=0;st.pump=.001;st.flare=.25+p*.75;st.H=Math.min(1.15,st.H+.095*(.25+.75*p));/* (t376) the stroke: the bag's air rushing out, then its breath back in; the fire flares */if(item==='pump')MSX.play('pump',null,{g:1.9+1.2*p});else{MSX.play('bellows',p>.8?2:p>.45?1:0,{g:.55+.5*p});MSX.play('bellowsIn',null,{dl:MSX.rt(.15),g:.35+.4*p,pri:0});}st.fl6=.4+.6*p;
    K.emit(100,100,6,{c:['#fff4d0','#ffd27a','#f08a1c'],v:60+p*60,ang:-Math.PI*.85,spread:1,g:-40,life:.6});(st.ash=st.ash||[]).push(...Array.from({length:2+Math.round(p*3)},()=>({x:94,y:93,vx:-(30+Math.random()*40*p),vy:-8-Math.random()*16,t:0,life:.45+Math.random()*.25,r:1.5+Math.random()})));if(p<.45)K.judge(.25,140,70,true);};
  return {title:sp.t||'Pump the bellows',how:item==='pump'?'Tap to pump. Each stroke builds pressure, but the pump needs a moment to refill. Keep the needle in the green.':'Tap to pump. Each pump feeds the fire, but the bellows need a moment to fill again. Keep the metal glowing in the green.',hint:'Tap to pump. Hold the glow in the green.',st,
    update(dt,I){st.t+=dt;if(!roar){roar=item==='pump'?MSX.loop('spray',{type:'highpass',f:2400}):MSX.loop('roar',{type:'lowpass',f:500});crk=item==='pump'?null:MSX.loop('crackle',{type:'highpass',f:800});}
      /* (t376) the fire roars and crackles with its heat and leaps on each stroke; the sprayer hisses with its pressure */st.fl6=Math.max(0,(st.fl6||0)-dt*2.2);{const fl6=st.fl6;if(item==='pump')roar.set(st.H*.42,.9+st.H*.3,1800+st.H*1600);else{roar.set(.06+st.H*.2+fl6*.18,.85+st.H*.25+fl6*.15,300+st.H*700+fl6*600);crk.set(.02+st.H*.12+fl6*.08,.9+st.H*.2);}}
      if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.12-st.burn*.25,0,1);}return;}
      st.runT+=dt;st.fill=Math.min(1,st.fill+dt/.5);if(st.pump>0){st.pump+=dt/.3;if(st.pump>=1)st.pump=0;}
      st.H-=.085*(st.H-.12)*dt*1.4;if(I.pressed)pumpNow();
      if(st.H>=LO&&st.H<=HI){st.inT+=dt;st.prog+=dt/DUR;}else if(st.H>HI){st.burn+=dt;if(item!=='pump'&&Math.random()<dt*20)K.emit(70,96,1,{c:['#ffffff','#fff4d0'],v:90,spread:2,g:120,life:.5});}
      if(item!=='pump'&&Math.random()<dt*(4+st.H*30))K.emit(36+Math.random()*48,96,1,{c:['#ffd27a','#f06a1c','#c83a14'],v:30+st.H*60,spread:.8,g:-30,life:.9+st.H});
      
      if(st.prog>=1||st.runT>(sp.time||16)){st.end=.001;MS.good();}},
    draw(t){const H=st.H;
      // coals: a heap of lumps whose cracks glow with the heat
      for(let i=0;i<26;i++){const cx=24+(i*37%64),cy=100+((i*13)%10),r=3+(i%3);const gl=Math.max(0,Math.min(1,H*1.2-((i*7)%5)*.08+Math.sin(t*3+i)*.08));K.ball(cx,cy,r,['#0a0806','#1a1614','#2a2420','#3a332c'],r-1);if(gl>.2){K.px(cx-1,cy,2,1,heatCol(gl*.9));K.px(cx,cy-1,1,1,heatCol(gl));}}
      // (t300) each push of air makes the fire flare: it leaps, brightens to yellow-white at its heart, and dies back
      if(st.flare>0)st.flare=Math.max(0,st.flare-1/60/.45);const fl=st.flare||0;
      K.px(20,80,72,30,'#1a0a04');MG4ART.fire(K,22,106,68,28,Math.min(1,.3+H*.8+fl*.5),t,[20,80,72,30]);K.glow(56,96,60+H*50+fl*30,'255,150,60',.2+H*.35+fl*.25);
      for(const q of st.ash||[]){q.t+=1/60;q.x+=q.vx/60;q.y+=q.vy/60;q.vx*=.95;const u=q.t/q.life;if(u<1){g.globalAlpha=.45*(1-u);K.ell(q.x,q.y,q.r+u*4,(q.r+u*4)*.8,'#cfc4b2');g.globalAlpha=1;}}if(st.ash)st.ash=st.ash.filter(q=>q.t<q.life);   /* (round 5) the ash puffs swell and fade */
      if(fl>.05){g.save();g.beginPath();g.rect(20,78,72,32);g.clip();for(const [x0,sc,ph] of [[27,.75,0],[39,1.1,1.7],[50,.6,3.1],[58,1.25,.6],[70,.85,2.4],[80,.55,4.2]])K.flame(x0+Math.sin(t*9+ph)*1.5,106,fl*sc*(.8+.25*Math.sin(t*17+ph*3)),t*1.6+ph);g.restore();K.glow(56,100,26,'255,240,200',fl*.35);}   /* (round 5) ragged tongues of different heights, not bars */
      if(item==='pump'){const P_=st.H;const cx=150,cy=96;K.ball(cx,cy,14,CA_P.brass,8);K.px(cx-2,cy-24,4,12,CA_P.brass[4]);for(let a=0;a<6.28;a+=.5){const r=6+P_*40;for(let k=0;k<5;k++){const u=k/5;K.pa(cx+Math.cos(a+st.t*3)*r*u,cy-24-Math.sin(u*Math.PI)*P_*30+u*10,1,1,'#9cc4e0',.8*(1-u));}}
        // (t365) the barrel stands low at your right, its plunger's T at the bottom of the picture: your hand pumps near you
        const PY=74;K.px(200,70+PY,12,60,CA_P.iron[4]);K.px(200,70+PY,12,1,CA_P.iron[6]);const pl=st.pump>0?Math.sin(Math.PI*Math.min(1,st.pump))*14:0;K.px(205,46+PY+pl,2,26,CA_P.iron[6]);K.px(196,44+PY+pl,20,4,CA_P.wood[4]);m4grip(K,206,45+PY+pl,0,{side:1,arm:-1.45});K.line(200,150,cx+8,cy+6,'#3a3a3a',2);
        K.ball(250,150,8,['#2a2a2a','#c8c0a8','#e8e0cc','#f8f4ec']);const na=-2.3+Math.min(1.1,P_)*2.8;K.line(250,150,250+Math.cos(na)*6,150+Math.sin(na)*6,'#a02a1a',1);return;}
      if(item==='crucible'){const cx=58,cy=92;K.ball(cx,cy,13,['#3a2a20','#6a4a34','#8a6a4c','#a8886a'],11);K.ell(cx,cy-9,11,3,'#2a1a10');const m=Math.min(1,st.prog*1.4);if(m>0){K.ell(cx,cy-9,9*m+1,2,heatCol(.55+H*.4));K.px(cx-4,cy-10,4,1,'#fff4d0');}else for(let k=0;k<5;k++)K.px(cx-7+k*3,cy-11+(k%2),3,2,sp.ore||'#8a6a4a');K.glow(cx,cy-6,24,'255,180,80',.2+H*.3);}
      else{const c=heatCol(Math.min(1,H));for(let x=40;x<150;x++){const u=(x-40)/110,hh=Math.max(0,Math.min(1,H*(1.15-u*1.1)));K.px(x,96,1,4,u<.5?heatCol(hh):CA_P.iron[3]);K.px(x,96,1,1,u<.5?heatCol(Math.min(1,hh+.15)):CA_P.iron[5]);}K.glow(70,98,26,'255,170,80',.2+H*.3);m4tongs(K,144,98,0,{hand:false});}
      // the bellows: the bottom board stays put, the top board hinges at the nozzle; the leather pleats open and close between them
      // (t365) the bellows lie from the fire's mouth down toward you at an angle, drawn in their own picture and turned, so the
      // handle you work is low and near you
      const BC=M4.C.m65bel||(M4.C.m65bel=(()=>{const c=document.createElement('canvas');c.width=112;c.height=80;const gg=c.getContext('2d');gg.imageSmoothingEnabled=false;const kk=caKit(gg,112,80);kk.g=gg;return {c,gg,kk};})());
      BC.gg.clearRect(0,0,112,80);const K0=K;{const K=BC.kk;
      const sq=st.pump>0?Math.sin(Math.PI*Math.min(1,st.pump)):0,open=Math.max(.15,(.35+.65*st.fill)-sq*.8),NX=16,NY=46,BL=62,ang=-.08-open*.32;const W=CA_P.wood,L=CA_P.leather;
      K.px(NX-8,NY-2,12,4,CA_P.brass[3]);K.px(NX-8,NY-2,12,1,CA_P.brass[6]);K.px(NX-12,NY-1,5,2,CA_P.brass[2]);
      // (t371) four leather pleats between the boards: each a lit ridge and a shadowed fold, squashed thin when you squeeze and
      // fanned out as the bag fills; the back edge zigzags where the folds stand out
      const PL=3;for(let i=0;i<=BL;i++){const x=NX+4+i;const yb=NY+2+i*.12,yt=NY-2+Math.tan(ang)*i;const gap=yb-yt-1;if(gap>1)for(let y=Math.ceil(yt)+1;y<yb;y++){const u=(y-yt-1)/gap,v=(u*PL)%1;const back=i>BL-3;if(back&&v>.5)continue;K.px(x,y,1,1,u<.04||(v>.86&&u<.96)?L[1]:v<.16&&u>.1?L[4]:u>.7?L[2]:L[3]);}
        K.px(x,yt-4,1,1,W[0]);K.px(x,yt-3,1,1,W[6]);K.px(x,yt-2,1,1,W[5]);K.px(x,yt-1,1,1,W[4]);K.px(x,yt,1,1,i%8===4?CA_P.brass[5]:W[2]);
        K.px(x,yb,1,1,i%8===0?CA_P.brass[5]:W[4]);K.px(x,yb+1,1,1,W[3]);K.px(x,yb+2,1,1,W[2]);K.px(x,yb+3,1,1,W[0]);}
      // each board runs back into a handle; your right fist works the top one, your left steadies the bottom one
      const hx=NX+4+BL,hy=NY-1+Math.tan(ang)*BL,bxe=hx,bye=NY+3+BL*.12,ba=Math.atan(.12),HL=15;
      for(const [x0,y0,a] of [[hx,hy-1,ang],[bxe,bye,ba]]){const c=Math.cos(a),s_=Math.sin(a);K.line(x0,y0,x0+c*HL,y0+s_*HL,W[0],4);K.line(x0,y0,x0+c*HL,y0+s_*HL,W[4],2);K.line(x0,y0-1,x0+c*HL,y0+s_*HL-1,W[6],1);K.px(x0+c*HL-2,y0+s_*HL-2,4,4,W[0]);K.px(x0+c*HL-1,y0+s_*HL-1,2,2,W[5]);}
      const TH=.58;M4.rot(g,BC.c,104,100,TH,NX,NY);
      {const [gx,gy]=M4.tr(104,100,TH,hx+Math.cos(ang)*9-NX,hy+Math.sin(ang)*9-NY);m4grip(K0,gx,gy,ang+TH,{side:1});}
      {const [gx,gy]=M4.tr(104,100,TH,bxe+Math.cos(ba)*8-NX,bye+Math.sin(ba)*8-NY);m4grip(K0,gx,gy,ba+TH,{side:-1});}}},
    hud(t){K.label(item==='pump'?'PRESSURE':'HEAT',286,21,'#f4ecd8');K.gauge(282,30,8,92,LO/1.15,HI/1.15,st.H/1.15,{zone:'#5a3a14'});K.meter(st.prog,st.runT?st.inT/st.runT:1);if(item==='pump')return;
      K.label('BELLOWS',150,52,st.fill<.95?'#e8b030':'#9be07a');K.px(132,60,36,3,'#1a0e06');K.px(133,61,34*st.fill,1,st.fill<.95?'#e8b030':'#9be07a');
      if(st.H>HI&&Math.floor(t*6)%2)K.label('TOO HOT: IT’LL BURN',160,24,'#e8542a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);const mid=(LO+HI)/2;if(st.H<mid-.02&&st.fill>.9&&st.t>.4)m4tap(a);AP.hand=[item==='pump'?150:136,item==='pump'?120:112];AP.press=a.down;},
    quiet(){roar&&roar.set(0);crk&&crk.set(0);},stop(){roar&&roar.stop();crk&&crk.stop();roar=crk=null;}};};
// ---------------------------------------------------------------- ANVIL: the metal is thickest where it glows above the outline; strike there while it's hot
S4.anvil=(sp,K)=>{const g=K.g,AX=90,AY=108,X0=130,N=48,shape=sp.shape||'blade',an=M4F.anvil(),stump=M4F.stump(),ham=M4F.shammer();
  const tgt=new Array(N),h=new Array(N);for(let i=0;i<N;i++){const u=i/(N-1);h[i]=8+(Math.random()-.5)*.6;
    tgt[i]=shape==='blade'?(u<.3?7:7-(u-.3)/.7*5):shape==='point'?(u<.55?6:6-(u-.55)/.45*5):shape==='curve'?6.5-Math.sin(u*Math.PI)*1.5-(u>.75?(u-.75)*12:0):5;}
  const st={hx:X0+30,heat:1,strikes:0,swing:-1,t:0,end:0,reheat:0,errs:[],cold:0};
  const err=()=>{let e=0;for(let i=0;i<N;i++)e+=Math.max(0,h[i]-tgt[i])+Math.max(0,tgt[i]-h[i])*1.6;return e/N;};const e0=err();
  const strike=x=>{const ci=Math.round((x-X0)/2);const hot=st.heat;if(hot<.25){st.cold++;K.judge(.15,x,AY-40,true);MS.miss();K.emit(x,AY-8,4,{c:['#c8c0b0'],v:60,g:200,life:.3});return;}
    // the blow flattens most under the hammer and spreads to either side; metal already at its line barely moves, except right under the face
    let before=0,after=0;for(let i=Math.max(0,ci-5);i<=Math.min(N-1,ci+5);i++){const w=Math.exp(-((i-ci)**2)/8),d=Math.min(h[i]-1,(.9+hot*.9)*w,Math.max(0,h[i]-tgt[i])+(i===ci?.5:0));before+=Math.abs(h[i]-tgt[i]);h[i]-=Math.max(0,d);after+=Math.abs(h[i]-tgt[i]);}
    const gain=before-after;const q=gain>1.2?1:gain>.4?.75:gain>-.3?.45:.15;K.judge(q,Math.max(60,x-52),AY-40,true);   /* (t300) beside the work, clear of the raised hammer */if(q<.3)MS.miss();
    st.heat=Math.max(0,st.heat-.05);st.strikes++;K.shk=.12;K.emit(x,AY-6,10+hot*12,{c:['#fff4d0','#ffd27a','#f08a1c'],v:110,spread:2.6,g:260,life:.5});K.emit(x,AY-6,3,{c:['#3a3430'],v:50,spread:2,g:300,life:.6});};
  return {title:sp.t||'Shape it on the anvil',how:'Tap the metal where it bulges above the outline to hammer it down. It cools as you work: strike while it glows. Too many blows in one place and it goes too thin.',hint:'Tap the thick parts above the outline. Work it while it glows.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.8){st.done=true;st.score=M4.cl(1-err()/Math.max(.6,e0)*.9-st.cold*.05,0,1);}return;}
      if(st.reheat>0){const r0=st.reheat;st.reheat+=dt/1.3;if(r0<.5&&st.reheat>=.5)MSX.play('coals','in');if(st.reheat>=1){st.reheat=0;st.heat=1;MSX.play('setbar');}return;}
      st.heat=Math.max(0,st.heat-dt*(sp.cool||.1));if(st.heat<=.06){st.reheat=.001;MSX.play('tongs');}
      const kx=I.key||I.demo&&this._k;if(I.ax)st.hx=M4.cl(st.hx+I.ax*140*dt,X0,X0+N*2);
      if(st.swing>=0){st.swing+=dt/.16;if(st.swing>=.5&&!st.hit){st.hit=1;strike(st.sx);}if(st.swing>=1)st.swing=-1;}
      else if(I.pressed){st.sx=I.key?st.hx:M4.cl(I.x,X0,X0+N*2);st.hx=st.sx;st.swing=0;st.hit=0;st.go=1;}
      /* (t300) the hammer's picture: it travels over to where you struck while it falls (no jump), lands, rests a beat, bounces back up */
      st.vx=st.vx==null?st.hx:st.vx+(st.hx-st.vx)*Math.min(1,dt*30);m3blow(st.vis||(st.vis={}),dt,st.go,.08,.075,1,.6);st.go=0;if(m3onWork(st.vis))st.vx=st.hx;
      /* (t376) the blow rings out on the frame the face meets the bar: heavy and warm on glowing iron, brighter as it cools, a clang when cold */if(st.vis.land)MSX.play('anvil','h'+(st.heat>.7?0:st.heat>.45?1:st.heat>=.25?2:3));
      if(err()<.35||st.strikes>=(sp.max||32)||st.t>(sp.time||28)){st.end=.001;MS.good();}},
    draw(t){g.drawImage(stump,AX+13,AY+40);g.drawImage(an,AX-6,AY-8);
      const rh=st.reheat>0?Math.sin(Math.PI*st.reheat):0,off=-rh*90;
      // (t371) the bar glows yellow, orange, then cherry as it cools; the metal still standing above the outline glows a shade hotter,
      // and the outline is a dark scribed line (no green: hot iron is never green)
      const base=.1+st.heat*.8;for(let i=0;i<N;i++){const x=X0+i*2+off,th=Math.max(1,h[i]),ty=AY-2-th,ex=Math.min(th,h[i]-tgt[i]);K.px(x,ty,2,th,heatCol(base));
        if(ex>.5&&!st.reheat)K.px(x,ty,2,Math.round(ex),heatCol(Math.min(1,base+.15)));K.px(x,ty,2,1,heatCol(Math.min(1,base+.25)));K.px(x,AY-3,2,1,heatCol(Math.max(0,base-.25)));K.px(x,AY-2,2,1,'#2a1a10');
        const tt=AY-2-tgt[i];if(!st.reheat){if(h[i]-tgt[i]>.6)K.px(x,tt,2,1,'#3a1208');else if(tt<ty)K.pa(x,tt,2,1,'#e8dcc0',.35);}}
      m4tongs(K,X0+N*2+off-6,AY-2-Math.max(1,h[N-1])/2,.3,{side:-1,at:44});
      if(!st.reheat)K.glow(X0+N+off,AY-6,40,'255,160,70',st.heat*.3);
      // (t371) the hammer swings from the wrist: raised, its head up and back; at the blow the handle is level and the face lands flat on the metal under it
      // (t300) and with weight: it falls faster and faster from high over your shoulder, the face lands flat, rests on the metal a beat
      // (a white-hot flash where it bites), then bounces up and settles raised again; your fist stays round the handle's end throughout
      const V=st.vis||{},lift=V.L==null?1:V.L,hx=st.vx==null?st.hx:st.vx;
      if(!st.reheat){const ci=M4.cl(Math.round((hx-X0)/2),0,N-1),top=AY-2-Math.max(1,h[ci]);
        const fx=hx+36+lift*5,fy=top-13-lift*12,ha=Math.PI+Math.pow(Math.max(0,lift),.55)*1.1+Math.min(0,lift)*1.1;   /* (round 5) the wrist keeps turning the head down right into the blow */M4.rot(g,ham,fx+Math.cos(ha)*31,fy+Math.sin(ha)*31,ha-Math.PI*1.5,15,12);m4grip(K,fx,fy,ha,{side:1});
        if(m3onWork(V)&&st.heat>=.25){K.glow(hx,top,16,'255,236,180',.55);K.px(hx-8,top-1,3,1,'#fff6d8');K.px(hx+6,top-1,3,1,'#fff6d8');K.px(hx-11,top-2,2,1,'#ffd27a');K.px(hx+10,top-2,2,1,'#ffd27a');}}
      if(st.reheat)K.label('BACK IN THE FIRE',160,40,'#ffd27a');},
    hud(t){K.label('HEAT',286,21,'#f4ecd8');K.gauge(282,30,8,80,.25,1,st.heat,{zone:'#5a3a14'});K.meter(1-Math.min(1,err()/Math.max(.6,e0)));
      if(st.heat<.3&&!st.reheat&&Math.floor(t*4)%2)K.label('COOLING',160,24,'#e8b030');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.swing<0&&!st.reheat&&st.t>.5){if(this._w==null)this._w=.35;this._w-=dt;if(this._w<=0){let bi=0,bv=-9;for(let i=0;i<N;i++){let s=0;for(let j=Math.max(0,i-3);j<=Math.min(N-1,i+3);j++)s+=h[j]-tgt[j];if(s>bv){bv=s;bi=i;}}m4move(a,X0+bi*2,AY-10);m4tap(a);this._w=.38;}}AP.hand=[a.x+4,AY-30];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- QUENCH: plunge it in fast and all the way, hold it still till the hissing stops, then lift it out
S4.quench=(sp,K)=>{const g=K.g,TX=200,TY=118,TW=96,L=56,TANG=10;const st={d:0,heat:Array.from({length:L},(_,i)=>i<TANG?.25:1),warp:0,in:0,t:0,end:0,out:0,boil:0,lifted:0};let hiss=null,bub=null;
  const hotB=()=>{let m=0;for(let i=TANG;i<L;i++)m=Math.max(m,st.heat[i]);return m;};
  return {title:sp.t||'Quench it',how:'Hold to lower the hot blade into the water, all the way in one go. Keep holding until the hissing stops, then let go to lift it out.',hint:'Hold: plunge it fully, wait for quiet, let go.',st,
    update(dt,I){st.t+=dt;if(!hiss){hiss=MSX.loop('steam',{type:'highpass',f:2400});bub=MSX.loop('boil',{type:'lowpass',f:900});}
      if(st.end){st.end+=dt;hiss.set(0);bub.set(0);if(st.end<.6&&Math.random()<dt*9)MSX.play('drip',null,{g:.5,pri:0});if(st.end>.7){const hot=hotB();st.done=true;st.score=M4.cl((1-Math.min(1,st.warp*1.6))*.6+(hot<.18?.4:hot<.35?.25:.08),0,1);}return;}
      st.d=M4.cl(st.d+(I.down?1.3:-1.6)*dt,0,1);const sub=Math.round(st.d*L*.95);let boil=0;
      for(let i=0;i<L;i++){if(L-1-i<sub){const c=st.heat[i];st.heat[i]=Math.max(0,c-dt*1.1);if(i>=TANG)boil+=c;}}boil/=(L-TANG)*.5;st.boil+=(boil-st.boil)*Math.min(1,dt*8);
      if(st.d>.05&&st.d<.9){let top=0;for(let i=TANG;i<L;i++){if(!(L-1-i<sub))top+=st.heat[i];}st.warp+=dt*Math.min(1,top/(L-TANG))*.55;}
      if(st.d>.05)st.in=1;/* (t376) the steam film tearing off the steel, the water boiling round it; water runs off the blade as it comes up */hiss.set(Math.min(.34,st.boil*.4),.9+st.boil*.2,1800+st.boil*2600);bub.set(Math.min(.32,st.boil*.45),.75+st.boil*.5,500+st.boil*1500);if(st.d<(st.d6||0)-.001&&st.d>.02&&st.d<.97&&Math.random()<dt*16)MSX.play('drip',null,{g:.55,pri:0});st.d6=st.d;
      /* (t300, critic) the steam: a few light puffs at a time, each swelling, drifting and fading as it rises (grey balls read as rocks) */
      st.pf=st.pf||[];if(st.d>.02&&!st.inW){st.inW=1;for(let k=0;k<9;k++)st.pf.push({x:TX+(Math.random()-.5)*16,y:TY-2,vx:(Math.random()-.5)*40,vy:-30-Math.random()*40,t:0,life:.7+Math.random()*.5,r:2.5+Math.random()*2});K.emit(TX,TY,8,{c:['#c8e0f0','#ffffff'],v:70,ang:-Math.PI/2,spread:1.4,g:300,life:.45});}if(st.d<.01)st.inW=0;
      if(st.boil>.05&&Math.random()<dt*st.boil*14)st.pf.push({x:TX+(Math.random()-.5)*12,y:TY-2,vx:(Math.random()-.5)*10,vy:-22-Math.random()*14,t:0,life:1.1+Math.random()*.5,r:2+Math.random()*1.5});
      for(const q of st.pf){q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy*=1-dt*.6;q.vx+=Math.sin(q.t*3+q.r)*dt*6;}st.pf=st.pf.filter(q=>q.t<q.life);
      if((st.in&&st.d<.02&&!I.down)||st.t>(sp.time||14)){st.end=.001;MS.good();}},
    draw(t){const I=CA_P.iron;g.drawImage(M4.pre('trough',TW+10,50,k=>{k.planks(1,1,TW+8,48,M4.sh(CA_P.wood,-1),8,7);k.plank(1,1,TW+8,4,CA_P.wood,3);k.metal(1,15,TW+8,3,I,10);k.metal(1,35,TW+8,3,I,10);},true),TX-TW/2-5,TY-5);
      const wl=TY+2;K.px(TX-TW/2,wl,TW,8,'#2a4a6a');for(let x=0;x<TW;x+=3)K.px(TX-TW/2+x,wl+Math.round(Math.sin(x*.4+t*6)*st.boil),2,1,'#4a7aa0');
      // (t371) a knife blank, not a candle: a narrow grey tang, a shoulder, the blade glowing orange (you quench from orange, not white)
      // with a lit spine, a darker edge and a point. It sinks behind the trough's front: dim through the water, gone below it
      st.dv=st.dv==null?st.d:st.dv;st.dvv=st.dvv||0;st.dvv+=(380*(st.d-st.dv)-26*st.dvv)/60;st.dv+=st.dvv/60;const dv=M4.cl(st.dv,0,1.03);   /* (round 5) the plunge eases in and settles */
      const by=wl-L+Math.round(dv*L*.95)+Math.round(Math.sin(t*40)*st.boil*1.2),FR=wl+8;
      /* (t376) the slap and the violent hiss start on the frame the tip is seen to go under */{const sub=Math.round(dv*L*.95);if(sub>=1&&!st.in6){st.in6=1;if(!st.end)MSX.play('quench',null,{g:.35+.8*hotB()});}else if(sub<1)st.in6=0;}
      for(let i=0;i<L;i++){const y=by+i;if(y>=FR)break;const tang=i<TANG,w=tang?3:i>L-12?Math.max(1,Math.round(7-(i-L+12)*.55)):7,x0=tang?TX-2:TX-3,c=st.heat[i]*(.8+.12*i/L);
        const C=tang?I[3]:heatCol(c),L_=tang?I[5]:heatCol(Math.min(1,c+.12)),D=tang?I[2]:heatCol(Math.max(0,c-.14)),B=heatCol(Math.min(1,c+.2));
        if(y>=wl){K.pa(x0,y,w,1,C,.45);continue;}K.px(x0-1,y,w+2,1,'#1a0e08');K.px(x0,y,w,1,C);K.px(x0,y,1,1,L_);if(!tang&&w>4){K.px(x0+w-3,y,1,1,B);K.px(x0+w-2,y,2,1,D);}else if(w>2)K.px(x0+w-1,y,1,1,D);}
      if(by+TANG<wl)K.px(TX-3,by+TANG,7,1,'#1a0e08');
      if(by+L<FR+2&&by+L>=wl)K.px(TX-1,by+L-1,1,1,'#1a0e08');
      for(let i=0;i<Math.round(st.boil*14);i++){const bx=TX-14+((i*29+Math.floor(t*20)*7)%28),ph=(t*3+i*.3)%1;K.px(bx,wl+6-ph*6,2,1,'#c8e0f0');}
      if(st.boil>.04&&by+L>wl){const rx=5+st.boil*5+Math.sin(t*30)*.8;for(let a=0;a<6.28;a+=.35)K.px(TX+Math.cos(a)*rx,wl+1+Math.sin(a)*1.6,1,1,a<3.14?'#eef6fa':'#a8c8dc');}
      /* (t300) the hot blade glows on the dark: a warm halo round what's still above the water, a flare where it meets the water */
      {let hot=0;for(let i=TANG;i<L;i++)if(by+i<wl)hot=Math.max(hot,st.heat[i]);if(hot>.08)K.glow(TX,Math.min(wl-6,by+L*.55),18+hot*10,'255,140,50',.18+hot*.32);if(st.boil>.1)K.glow(TX,wl,14,'255,200,140',st.boil*.25);}
      m4tongs(K,TX,by+3,-1.05,{side:1,at:44});
      if(st.boil>.15)K.glow(TX,wl,40,'255,255,255',st.boil*.15);
      for(const q of st.pf||[]){const u=q.t/q.life,r=q.r+u*7,a=.2*(1-u)*Math.min(1,q.t*6);g.globalAlpha=a;K.ell(q.x,q.y,r,r*.8,'#f6f4f0');g.globalAlpha=a*.8;K.ell(q.x-r*.3,q.y-r*.3,r*.5,r*.4,'#ffffff');g.globalAlpha=1;}},
    hud(t){const hot=hotB();K.label('HISS',286,21,'#f4ecd8');K.gauge(282,30,8,80,0,.18,Math.min(1,st.boil),{zone:'#2c5a1c'});K.meter(1-hot,1-Math.min(1,st.warp*1.6));
      if(st.d>.05&&st.d<.85&&st.warp>.05&&Math.floor(t*5)%2)K.label('ALL THE WAY IN',160,24,'#e8b030');if(st.in&&st.boil<.05&&st.d>.9&&Math.floor(t*3)%2)K.label('QUIET: LIFT IT OUT',160,34,'#9be07a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);const hot=hotB();m4hold(a,st.t>.5&&(hot>.12||st.boil>.04));AP.hand=[TX+50,72];AP.press=a.down;},
    quiet(){hiss&&hiss.set(0);bub&&bub.set(0);},stop(){hiss&&hiss.stop();bub&&bub.stop();hiss=bub=null;}};};
// ---------------------------------------------------------------- GRIND: hold the edge to the turning stone at the right angle; the wheel kicks, so keep correcting
S4.grind=(sp,K)=>{const g=K.g,WX=150,WY=84,R=34,A0=sp.angle||.42,TOL=.11,wheel=M4F.wheel();
  const st={a:A0+.25,prog:0,inT:0,runT:0,t:0,end:0,kick:0,spin:0,tread:0};let grind=null,chat=null,whl=null;
  return {title:sp.t||'Sharpen it on the stone',how:'Hold the blade to the turning stone at the right angle: '+(K.fine?'move the mouse up and down (or W/S)':'drag up and down')+'. The wheel kicks the blade, so keep correcting. Hold to press it to the stone.',hint:'Keep the angle in the green while you hold.',st,
    update(dt,I){st.t+=dt;if(!grind){grind=MSX.loop('grit',{type:'bandpass',f:3600,q:.8});chat=MSX.loop('chatter');whl=MSX.loop('wheel');}whl.set(.16,1);st.spin+=dt*7;st.tread+=dt*3;
      if(st.end){st.end+=dt;grind.set(0);chat.set(0);if(st.end>.6){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.15,0,1);}return;}
      st.kick+=(Math.sin(st.t*1.7)*.35+Math.sin(st.t*4.3)*.2+(Math.random()-.5)*1.5-st.kick)*dt*2;st.a+=st.kick*dt*.9;
      if(I.key||I.ay)st.a+=I.ay*.9*dt;else if(!I.demo||this._ai)st.a=M4.cl(st.a+(I.dy||0)*-.012,0,1.2);st.a=M4.cl(st.a,0,1.2);
      const on=I.down;if(on){st.runT+=dt;}const inb=Math.abs(st.a-A0)<=TOL;
      if(on&&inb){st.inT+=dt;st.prog+=dt/(sp.dur||5);if(Math.random()<dt*60)K.emit(WX-R*.97+1,WY-R*.25+1,1,{c:['#fff4d0','#ffd27a','#f8a83c'],v:120+Math.random()*80,ang:Math.PI*.6,spread:.5,g:240,life:.5});}
      else if(on&&Math.random()<dt*12)K.emit(WX-R*.97+1,WY-R*.25+1,1,{c:['#c8a060'],v:80,ang:Math.PI*.62,spread:1,g:240,life:.4});
      /* (t376) steel on the wet stone: an even gritty hiss at the right angle; off it the edge skips and chatters */{const off=Math.abs(st.a-A0);grind.set(on?(inb?.26:.08):0,1+Math.min(.15,Math.abs(st.kick)*.1),inb?3600:2600,.8);chat.set(on&&!inb?Math.min(.22,.08+off*.5):0,.85+Math.min(.4,off));}
      if(st.prog>=1||st.t>(sp.time||15)){st.end=.001;MS.good();}},
    draw(t){const W=CA_P.wood;K.px(WX-44,WY+30,88,6,W[3]);K.px(WX-44,WY+30,88,1,W[5]);K.px(WX-44,WY+35,88,1,W[1]);
      for(const px_ of [WX-40,WX+36]){K.px(px_-1,WY-3,6,67,W[0]);K.px(px_,WY-2,4,66,W[4]);K.px(px_,WY-2,1,66,W[6]);K.px(px_+3,WY-2,1,66,W[2]);K.px(px_,WY-2,4,1,W[6]);}
      K.px(WX-39,WY+49,78,16,W[0]);K.px(WX-38,WY+50,76,14,W[3]);K.px(WX-38,WY+50,76,1,W[5]);K.px(WX-38,WY+57,76,1,W[2]);K.px(WX-36,WY+51,72,4,'#22405c');K.px(WX-36,WY+51,72,1,'#5a8ab0');
      M4.rot(g,wheel,WX,WY,-st.spin,36,36);g.drawImage(M4F.wheelLit(),WX-36,WY-36);K.ball(WX,WY,3,CA_P.iron,3);const tr=Math.sin(st.tread)*5;K.px(WX-30,WY+64+tr,60,3,W[5]);
      const PH=Math.PI+.25,cx=WX+R*Math.cos(PH),cy=WY+R*Math.sin(PH);const ang=Math.PI-.85-(st.a-A0)*1.4;const bl=48;
      const ex=cx+Math.cos(ang)*bl,ey=cy+Math.sin(ang)*bl;const nx=-(ey-cy)/bl,ny=(ex-cx)/bl;
      // the blade as a real shape: spine, flat and a bright edge that sharpens as you go
      g.fillStyle=CA_P.iron[4];g.beginPath();g.moveTo(cx,cy);g.lineTo(ex+nx*5,ey+ny*5);g.lineTo(ex-nx*2,ey-ny*2);g.closePath();g.fill();g.fillStyle=CA_P.iron[6];g.beginPath();g.moveTo(cx,cy);g.lineTo(ex+nx*5,ey+ny*5);g.lineTo(ex+nx*3,ey+ny*3);g.closePath();g.fill();
      K.line(cx,cy,ex-nx*2,ey-ny*2,st.prog>.5?'#ffffff':CA_P.iron[7],1);K.line(cx,cy,ex+nx*5,ey+ny*5,CA_P.iron[2],1);
      {const ca=Math.cos(ang),sa=Math.sin(ang),hx0=ex+nx*1.5,hy0=ey+ny*1.5;K.line(hx0,hy0,hx0+ca*3,hy0+sa*3,CA_P.brass[4],4);K.line(hx0+ca*3,hy0+sa*3,hx0+ca*22,hy0+sa*22,CA_P.wood[1],5);K.line(hx0+ca*3,hy0+sa*3,hx0+ca*22,hy0+sa*22,CA_P.wood[4],3);K.line(hx0+ca*3-1,hy0+sa*3,hx0+ca*22-1,hy0+sa*22,CA_P.wood[6],1);
        m4grip(K,hx0+ca*11,hy0+sa*11,ang,{side:-1});}
      if(Math.abs(st.a-A0)<=TOL)K.glow(cx,cy,14,'255,220,140',.3);},
    hud(t){K.label('ANGLE',286,21,'#f4ecd8');K.gauge(282,30,8,80,(A0-TOL)/1.2,(A0+TOL)/1.2,st.a/1.2);K.meter(st.prog,st.runT?st.inT/st.runT:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.t>.4);a.ay=M4.cl((A0-st.a)*8,-1,1);AP.hand=[90,120];AP.press=a.down;},
    quiet(){grind&&grind.set(0);chat&&chat.set(0);whl&&whl.set(0);},stop(){grind&&grind.stop();chat&&chat.stop();whl&&whl.stop();grind=chat=whl=null;}};};
// ---------------------------------------------------------------- SKIM: dross floats up through the melt; scoop each lump off before it sinks back, and don't waste good metal
S4.skim=(sp,K)=>{const g=K.g,CX=160,CY=92,RX=70,RY=22,N=sp.n||5,COL=sp.col||['#ff9a3a','#ffd27a','#fff4d0'];
  const st={lumps:[],made:0,got:0,lost:0,waste:0,t:0,end:0,sk:null,next:.8};
  const spawn=()=>{const a=Math.random()*6.28,r=Math.random()*.7;st.lumps.push({x:CX+Math.cos(a)*RX*r,y:CY+Math.sin(a)*RY*r,life:0,max:3.6+Math.random()*1.4,sz:3+Math.random()*3,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*3});st.made++;};
  const scoop=(x,y)=>{st.sk={x,y,t:0};let best=null,bd=1e9;for(const l of st.lumps){const d=Math.hypot(l.x-x,(l.y-y)*1.6);if(d<bd){bd=d;best=l;}}
    if(best&&bd<14&&best.life>.35){st.lumps.splice(st.lumps.indexOf(best),1);st.got++;st.sk.got=best.sz;MSX.play('skim','got');K.judge(best.life<best.max*.6?1:.75,x,y-20,true);K.emit(x,y,6,{c:['#3a3430','#6a6460'],v:50,g:200,life:.5});}
    else{st.waste++;MSX.play('skim','waste');K.judge(.15,x,y-20,true);MS.miss();K.emit(x,y,6,{c:COL,v:50,g:200,life:.4});}};
  return {title:sp.t||'Skim off the slag',how:'Grey slag floats up through the molten metal. Tap each lump to scoop it off before it sinks back in. Tapping clean metal wastes it.',hint:'Tap the grey lumps. Leave the bright metal.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.cl(st.got/N-st.waste*.08,0,1);}return;}
      st.next-=dt;if(Math.random()<dt*.7)MSX.play('skim','sink',{g:.18,pri:0});if(st.made<N&&st.next<=0){spawn();st.next=.9+Math.random()*.9;}
      for(let k=st.lumps.length-1;k>=0;k--){const l=st.lumps[k];l.life+=dt;l.x+=l.vx*dt;l.y+=l.vy*dt;if(((l.x-CX)/RX)**2+((l.y-CY)/RY)**2>.8){l.vx*=-1;l.vy*=-1;}if(l.life>l.max){st.lumps.splice(k,1);st.lost++;MSX.play('skim','sink',{g:.6});K.judge(.15,l.x,l.y-16,true);MS.miss();}}
      if(I.pressed){if(I.key){const l=st.lumps.filter(l=>l.life>.35).sort((a,b)=>a.life-b.life).pop();if(l)scoop(l.x,l.y);else scoop(CX,CY);}else scoop(I.x,I.y);}
      if(st.sk){st.sk.t+=dt;if(st.sk.t>.35)st.sk=null;}if(I.x!=null){const dx=(I.x-CX)/RX,dy=(I.y-CY)/RY,d=Math.hypot(dx,dy);const k=d>.85?.85/d:1;st.px=CX+dx*k*RX;st.py=CY+dy*k*RY;}
      if(st.made>=N&&!st.lumps.length){st.end=.001;MS.good();}},
    draw(t){const S=CA_P.stone;K.ell(CX,CY+16,RX+12,RY+8,'#1a1614');for(let y=0;y<26;y++){const w=RX+10-y*.2;K.px(CX-w,CY+y-4,w*2,1,S[y<3?4:y<20?2:1]);}
      K.ell(CX,CY,RX+8,RY+6,S[5]);K.ell(CX,CY,RX+4,RY+3,S[1]);K.ell(CX,CY,RX,RY,COL[0]);
      // (t371) the melt's sheen: soft lens-shaped streaks (no single-pixel tips), drifting slowly
      const lens=(x,y,rx,ry,c)=>{for(let j=-ry+1;j<ry;j++){const w=Math.round(rx*Math.sqrt(1-(j*j)/(ry*ry)));K.px(x-w,y+j,w*2,1,c);}};
      for(let k=0;k<14;k++){const a=k*.45+t*.3,r=.3+((k*7)%5)/7;lens(CX+Math.cos(a)*RX*r*.8,CY+Math.sin(a)*RY*r*.8,6,2,COL[1]);}lens(CX-18,CY-6,24,4,COL[2]);K.glow(CX,CY,90,'255,190,90',.4);
      // slag: dark crusty clumps riding the melt, each in a dull ring of cooler metal; they shrink and redden as they sink back
      for(const l of st.lumps){const up=Math.min(1,l.life/.35),sink=Math.max(0,(l.life-(l.max-.6))/.6);const r=(l.sz+1)*up*(1-sink*.6);if(r<.5)continue;const R_=Math.max(1,Math.round(r)),SL=['#100e0c','#24201c','#3a342e','#5a5048'];
        K.pa(l.x-R_-2,l.y-1,R_*2+5,3,'#a8401a',.55);K.pa(l.x-R_-1,l.y-2,R_*2+3,5,'#c85a20',.35);K.ball(l.x,l.y,R_,SL,Math.max(1,Math.round(r*.6)));if(R_>2){K.ball(l.x+Math.round(R_*.7),l.y-1,Math.max(1,R_-2),SL,Math.max(1,Math.round(r*.4)));K.px(l.x-R_+1,l.y-1,1,1,'#7a6e62');K.px(l.x+1,l.y-Math.round(r*.6),2,1,'#6a6056');}
        if(sink>0)K.pa(l.x-r,l.y-1,r*2,2,COL[0],sink);}
      const sx=st.sk?st.sk.x:(st.px!=null?st.px:CX+RX-16),sy=st.sk?st.sk.y:(st.py!=null?st.py:CY-4);const dip=st.sk?Math.sin(Math.PI*st.sk.t/.35)*4:0;const hx=Math.min(282,sx+40),hy=sy+22;   /* (t364) the skimmer's handle toward you: your hand below the pot's rim, not over it */K.line(sx+6,sy-2+dip,hx,hy,'#1a1c22',4);K.line(sx+6,sy-2+dip,hx,hy,CA_P.iron[4],2);K.line(sx+6,sy-3+dip,hx,hy-1,CA_P.iron[6],1);
      // (t371) a round, shallow skimmer pierced with holes: the melt glows through them; a scooped clump sits in it as it lifts
      {const y0=sy+dip,I=CA_P.iron;K.ell(sx,y0,9,6,'#1a1c22');K.ell(sx,y0,8,5,I[5]);K.ell(sx,y0,6,4,I[3]);K.px(sx-6,y0-4,5,1,I[7]);K.px(sx-8,y0-2,1,3,I[6]);K.px(sx+3,y0+4,4,1,I[2]);
        for(const [dx,dy] of [[-3,-2],[0,-2],[3,-2],[-4,0],[-1,0],[2,0],[5,0],[-3,2],[0,2],[3,2]])K.px(sx+dx,y0+dy,1,1,dip>1.5?COL[0]:'#0e0f12');
        if(st.sk&&st.sk.got)K.ball(sx-1,y0-2,Math.max(2,Math.round(st.sk.got*.8)),['#100e0c','#24201c','#3a342e','#5a5048'],2);}{const ha=Math.atan2(hy-(sy-4+dip),hx-(sx+4));m4grip(K,hx,hy,ha,{side:-1});}},
    hud(){K.label('SLAG '+st.got+'/'+N,30,20,'#f4ecd8','l');K.meter(st.got/N);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const l=st.lumps.filter(l=>l.life>.5).sort((a,b)=>b.life-a.life)[0];if(l&&!st.sk&&!a.down){if(this._w==null)this._w=.2;this._w-=dt;if(this._w<=0){m4move(a,l.x,l.y);m4tap(a);this._w=.25;}}AP.hand=[a.x+3,a.y-12];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- CRANK: wind the wire round the rod in even turns: steady circles, not too fast
S4.crank=(sp,K)=>{const g=K.g,RX=128,RY=100,RL=112,CXk=262,CYk=100,CR=16,N=sp.n||18;
  const st={ang:0,turns:0,coils:[],last:null,spd:0,t:0,end:0,spds:[],ok:0};let wind=null,wet=null;
  return {title:sp.t||'Wind the wire into a coil',how:sp.look==='mortar'?'Grind in circles with the pestle: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace.':sp.look==='straw'?'Twist the straw: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace.':sp.look==='rug'?'Coil the braid round into a rug: draw circles'+(K.fine?' with the mouse (or hold Space)':' with your finger')+' at an even, steady pace.':K.fine?'Turn the crank in circles with the mouse (or hold Space). Keep an even, steady pace so the coils sit tight.':'Turn the crank by drawing circles with your finger. Keep an even, steady pace so the coils sit tight.',hint:'Steady circles: not too fast, not too slow.',st,
    update(dt,I){st.t+=dt;if(!wind){/* (t376) what is being turned decides the sound: wire on the rod, a pestle in the mortar, a quern, straw, a braid on the floor, cream in a churn, a press */const L6=sp.look;wind=L6==='mortar'?MSX.loop('pestle',{type:'lowpass',f:2400}):L6==='quern'?MSX.loop('quern'):L6==='straw'?MSX.loop('straw'):L6==='rug'?MSX.loop('cloth'):L6==='churn'?MSX.loop('slosh'):L6==='press'?MSX.fric({f:110,bp:520,q:3,g:1.2,wob:.12}):MSX.loop('wire',{type:'bandpass',f:3200,q:1.2});if(L6==='press')wet=MSX.loop('trickle');}if(st.end){st.end+=dt;wind.set(0);wet&&wet.set(0);if(st.end>.6){st.done=true;st.score=M4.cl(st.ok/Math.max(1,st.coils.length),0,1);}return;}
      let da=0;const ccx=sp.look?160:CXk,ccy=sp.look?96:CYk;if(I.key&&I.down)da=dt*6.2;else if(I.down){const a=Math.atan2(I.y-ccy,I.x-ccx);if(st.last!=null){let d=a-st.last;if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;da=Math.max(0,d);}st.last=a;}else st.last=null;
      {const q0=Math.floor(st.ang/(Math.PI/2));st.ang+=da;const q1=Math.floor(st.ang/(Math.PI/2));if(q1!==q0){if(!sp.look)MSX.play('ratchet',null,{g:.7});else if(sp.look==='quern'&&q1%2===0)MSX.play('knock','oak',{g:.5});}}st.spd+=(da/dt-st.spd)*Math.min(1,dt*5);{const v6=da>0?Math.min(1.2,st.spd/7):0,L6=sp.look,pr=Math.min(1,st.coils.length/N);if(L6==='press'){wind.set(v6*.9,pr);wet.set((.24+1.4*pr)*(v6>0?1:.4),1);}else wind.set(v6*(L6==='churn'?2:L6==='rug'?.53:L6==='straw'?.86:L6==='mortar'?.87:L6==='quern'?1.04:.115),.65+v6*.5,L6==='mortar'?1400+v6*1600:L6?0:2600+v6*1200);}
      while(st.ang>=Math.PI*2){st.ang-=Math.PI*2;const s=st.spd;const ok=s>3.2&&s<9.5;st.coils.push(ok?1:s>=9.5?2:0);if(ok)st.ok++;{const L6=sp.look;if(!L6)MSX.play('coil',null,{r:ok?1:.8});else if(L6==='mortar')MSX.play('crush');else if(L6==='churn')MSX.play('pat',null,{g:.8});else if(L6==='rug')MSX.play('pat',null,{g:.5});else if(L6==='press')MSX.play('creak',null,{g:.7});}if(!ok)K.judge(.25,RX+st.coils.length*6,RY-24,true);else if(st.coils.length%4===0)K.judge(1,RX+st.coils.length*6,RY-24,true);}
      if(st.coils.length>=N){st.end=.001;MS.good();}},
    draw(t){const I=CA_P.iron,look=sp.look;
      if(look){const n=st.coils.length,cx=160,cy=96;
        if(look==='rug'){const tot=Math.max(1,(sp.n||14)*14),seg=Math.round((n+st.ang/(Math.PI*2))*14);K.ell(cx,cy+3,8+seg*.36,4+seg*.2,'#00000030');
          for(let i=0;i<seg;i++){const a=i*.45,r=3+i*.34;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*.56;const c=['#b25645','#90abc2','#d6ad52'][(i>>1)%3];K.px(x-2,y-2,4,4,M4.sh([c,c,c],0)[0]);K.px(x-2,y-2,4,1,'#ffffff40');K.px(x+1,y-1,1,3,'#00000030');}
          const a=seg*.45,r=3+seg*.34,ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r*.56;for(let k=0;k<30;k++){const x=ex+k*2.4,y=ey-k*1.2;K.px(x-2,y-2,4,4,['#b25645','#90abc2','#d6ad52'][(k>>1)%3]);}m4grip(K,ex+10,ey-5,-.46,{side:1,arm:-.6});}
        else if(look==='mortar'){K.ell(cx,cy+24,40,10,'#3a3630');for(let y=0;y<26;y++){const w=40-y*.4;K.px(cx-w,cy+y-2,w*2,1,CA_P.stone[y<3?5:y<20?3:2]);}K.ell(cx,cy,34,8,CA_P.stone[1]);K.ell(cx,cy+1,30,6,'#d8d0c0');const bones=Math.max(0,8-n);for(let i=0;i<bones;i++)K.px(cx-20+i*5,cy-1+(i%2),4,2,'#efe8dc');
          const px=cx+Math.cos(st.ang)*18,py=cy+Math.sin(st.ang)*4;K.line(px,py,px+18,py-50,CA_P.stone[4],6);K.line(px+1,py-1,px+19,py-51,CA_P.stone[6],2);m4grip(K,px+16,py-44,-1.23,{side:1,arm:-1.35});}
        else{for(let i=0;i<9;i++){const tw=st.ang*.15+i*.7,ox=Math.sin(tw)*(4+n*.2);K.line(cx-20+i*4+ox,30,cx-4+i+ox*.3,130,CA_P.straw[3+(i%3)],2);}K.px(cx-12,124,24,6,'#93463f');m4grip(K,cx-10+Math.cos(st.ang)*16*.4,38+Math.sin(st.ang)*4,-Math.PI/2+Math.cos(st.ang)*.2,{side:1,arm:-1.5});m4grip(K,cx,130,Math.PI/2,{side:-1,arm:1.65});}
        return;}
      g.drawImage(M4.pre('wirebench',200,30,k=>{k.plank(0,0,200,8,CA_P.oak,6);k.px(0,8,200,22,CA_P.oak[2]);k.px(0,8,200,1,CA_P.oak[0]);for(const lx of [6,186])k.px(lx,8,8,22,CA_P.oak[3]);}),112,RY+14);
      K.metal(RX-14,RY-8,14,22,I,0);K.px(RX-12,RY-12,10,4,I[5]);K.px(RX-16,RY+2,4,10,I[3]);K.ball(RX-26,RY+6,9,CA_P.copper,8);K.ell(RX-26,RY+6,3,3,CA_P.wood[2]);K.line(RX-20,RY,RX+4,RY-8,'#c87a3a',1);
      K.metal(RX,RY-3,RL,6,I);
      st.coils.forEach((c,i)=>{const x=RX+4+i*(RL-10)/N;g.strokeStyle=c===1?'#c87a3a':c===2?'#a85a2a':'#8a4a2a';g.lineWidth=2;g.beginPath();g.ellipse(x+(c===2?(i%2?2:-2):0),RY,2.5,8+(c===0?2:0),0,0,6.29);g.stroke();K.px(x-1,RY-8,1,1,'#f4b070');});
      const sp_=st.coils.length;K.line(RX-20,RY+2,RX+4+sp_*(RL-10)/N,RY+8,'#c87a3a',1);
      // (t371) the rod runs on through a bearing to the crank; the crank turns round the rod's axis, so seen from here its handle rides a
      // tall narrow ellipse (in front of the hub on the near half, behind it on the far half) and its grip stays level, parallel to the rod
      K.px(RX+RL,RY-1,CXk-RX-RL,3,I[4]);K.px(RX+RL,RY-1,CXk-RX-RL,1,I[6]);K.metal(CXk-14,RY-4,6,18,I);
      {const R9=9,z=Math.cos(st.ang),hx=CXk+z*R9*.35,hy=CYk+Math.sin(st.ang)*R9;const crank=()=>{K.line(CXk,CYk,hx,hy,I[1],4);K.line(CXk,CYk,hx,hy,I[4],2);K.px(hx-1,hy-2,10,4,CA_P.wood[1]);K.px(hx,hy-1,8,2,CA_P.wood[4]);K.px(hx,hy-1,8,1,CA_P.wood[6]);};
        if(z<0)crank();K.ball(CXk,CYk,3,I,3);if(z>=0)crank();m4grip(K,hx+5,hy,0,{side:1});}
      g.strokeStyle='rgba(255,244,192,.25)';g.lineWidth=1;g.beginPath();g.arc(CXk,CYk,CR,0,6.29);g.stroke();},
    hud(t){K.label('PACE',156,24,'#f4ecd8','r');K.gauge(162,24,90,6,3.2/12,9.5/12,Math.min(12,st.spd)/12);K.meter(st.coils.length/N,st.coils.length?st.ok/st.coils.length:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(this._a==null)this._a=0;if(st.t>.4){this._a+=dt*6.2;const ccx=sp.look?160:CXk,ccy=sp.look?96:CYk;m4move(a,ccx+Math.cos(this._a)*CR*2,ccy+Math.sin(this._a)*CR*2);m4hold(a,true);}AP.hand=[a.x+2,a.y-10];AP.press=a.down;},
    quiet(){wind&&wind.set(0);wet&&wet.set(0);},stop(){wind&&wind.stop();wet&&wet.stop();wind=wet=null;}};};
// ---------------------------------------------------------------- LINKS: the pliers squeeze each open ring shut; tap when the two ends meet for a closed, seamless link
S4.links=(sp,K)=>{const g=K.g,N=sp.n||8,COLS=8;const st={i:0,ph:0,sp:2.2,done_:[],t:0,end:0,close:0};
  const ringAt=i=>{const r=(i/COLS)|0,c=i%COLS;return [128+c*12+(r%2)*6,92+r*10];};
  return {title:sp.t||'Close the rings',how:'Each new ring hangs open while the pliers wobble its ends together and apart. Tap when the ends meet to close it seamlessly.',hint:'Tap when the two ends touch.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.done_);}return;}
      if(st.close>0){st.close+=dt/.25;if(st.close>=1){st.close=0;MSX.play('pliers');MSX.play('mail',null,{dl:.05,g:.7,pri:0});st.i++;st.ph=Math.random()*6;st.sp=2.2+st.i*.18;if(st.i>=N){st.end=.001;MS.good();}}return;}
      st.ph+=dt*st.sp;if(I.pressed){const gap=Math.abs(Math.sin(st.ph))*6;const q=M4.q(gap,.9,2,3.4);st.done_.push(q);st.gap=gap;st.close=.001;K.judge(q,ringAt(st.i)[0],ringAt(st.i)[1]-18,true);if(q<.3)MS.miss();MSX.play('grip');}},
    draw(t){const Lt=CA_P.leather,O=CA_P.oak;K.px(100,128,170,12,O[3]);K.px(100,128,170,2,O[5]);K.px(100,139,170,1,O[1]);
      K.px(111,79,148,52,'#140a04');K.px(112,80,146,50,Lt[2]);K.px(112,80,146,1,Lt[4]);K.px(112,80,1,50,Lt[3]);K.px(112,129,146,1,Lt[1]);K.px(257,80,1,50,Lt[1]);
      for(let x=116;x<254;x+=5){K.px(x,83,2,1,Lt[4]);K.px(x,126,2,1,Lt[1]);}for(let y=86;y<125;y+=5){K.px(115,y,1,2,Lt[4]);K.px(254,y,1,2,Lt[1]);}
      const ring=(x,y,c,a0,a1)=>{g.strokeStyle='rgba(16,8,4,.55)';g.lineWidth=2;g.beginPath();g.ellipse(x+1,y+2,6,5,0,a0,a1);g.stroke();g.strokeStyle=c;g.beginPath();g.ellipse(x,y,6,5,0,a0,a1);g.stroke();};
      for(let i=0;i<Math.min(N,st.done_.length);i++){const [x,y]=ringAt(i);ring(x,y,st.done_[i]>.6?CA_P.iron[6]:CA_P.iron[4],0,6.29);K.px(x-4,y-4,2,1,CA_P.iron[7]);if(st.done_[i]<.6){K.px(x-1,y-6,2,2,Lt[2]);}}
      if(st.i<N){const [x,y]=ringAt(st.i);const gap=st.close>0?(st.gap||0)*(1-st.close):Math.abs(Math.sin(st.ph))*6;ring(x,y,CA_P.iron[7],-Math.PI/2+gap*.09,Math.PI*1.5-gap*.09);
        K.px(x-1-gap*.5,y-7,2,3,CA_P.iron[7]);K.px(x+gap*.5,y-7,2,3,CA_P.iron[5]);
        const I=CA_P.iron,sq=st.close>0?Math.sin(Math.PI*st.close):0,o=gap*.35,PX=x+3,PY=y+15,AX=1.1;
        for(const s of [-1,1]){const tx=x+s*(7+o),ty=y;K.line(tx,ty+2,PX,PY,I[1],4);K.line(tx,ty+2,PX,PY,s<0?I[5]:I[4],2);K.px(tx-1,ty-1,3,4,I[s<0?6:4]);}
        K.ball(PX,PY,2,I,2);
        for(const s of [-1,1]){const a=AX+s*(.1+gap*.02-sq*.06),ex=PX+Math.cos(a)*26,ey=PY+Math.sin(a)*26,mx=PX+Math.cos(a)*12,my=PY+Math.sin(a)*12;K.line(PX,PY,mx,my,I[3],3);K.line(mx,my,ex,ey,'#5a1a10',4);K.line(mx,my,ex,ey,'#b8402a',2);K.line(mx-1,my,ex-1,ey,'#d8604a',1);}
        m4grip(K,PX+Math.cos(AX)*(17-sq),PY+Math.sin(AX)*(17-sq),AX,{side:1});}},
    hud(){K.label('RING '+Math.min(N,st.i+1)+'/'+N,30,20,'#f4ecd8','l');K.meter(st.done_.length/N,st.done_.length?M4.avg(st.done_):1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(!st.close&&st.t>.5&&Math.abs(Math.sin(st.ph+st.sp*.03))<.12)m4tap(a);const [x,y]=ringAt(Math.min(N-1,st.i));AP.hand=[x+14,y+30];AP.press=a.down;},
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
