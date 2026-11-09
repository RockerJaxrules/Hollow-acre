/* ================= building and the last crafts: set bricks, logs, shingles, panes and tools in place as your hands sway over them,
   hold a post plumb while the earth is tamped, dig a hole spade by spade, light a lantern between gusts, keep a charcoal clamp
   smouldering. Then every remaining recipe, each with its own steps. ================= */
// a cut log lying on its side: bark in long shaped grooves (no speckle), lit along the top, the sawn end on the left: a bark
// rim, pale sapwood, one ring line, a darker heart. Three variants: length, grooves, a knot, the heart off centre
const m4log=v=>{v=v||0;const L=[29,31,27][v];return M4.pre('log4_'+v,L+7,16,K=>{const B=['#1e1208','#2e1c0e','#3e2814','#4e341a','#604020','#74502a'],R=['#2a1a0c','#7a5430','#b48450','#cfa064','#e0b87a'];
  for(let y=0;y<14;y++){const k=y<1?5:y<3?4:y>11?1:y>9?2:3;K.px(6,1+y,L,1,B[k]);}
  const GR=[[[10,4,9],[21,5,7],[13,7,6],[24,8,8],[8,9,5],[17,10,8]],[[9,5,12],[24,4,6],[12,8,5],[20,9,10],[29,7,4]],[[11,3,6],[19,6,9],[8,8,7],[16,10,6],[25,5,5]]][v];
  for(const [x,y,w] of GR){if(x+w>L+5)continue;K.px(x,1+y,w,1,B[2]);K.px(x+1,y,w-2,1,B[4]);}
  if(v===1){K.px(22,6,4,3,B[1]);K.px(23,6,2,1,B[0]);K.px(22,5,4,1,B[5]);}
  const hx=[0,1,-1][v],hy=[0,-1,1][v];
  for(let y=-7;y<=6;y++)for(let x=-5;x<=4;x++){const d=Math.sqrt((x/4.6)**2+((y+.5)/7)**2);if(d>1)continue;const dh=Math.sqrt(((x-hx)/4.6)**2+((y+.5-hy)/7)**2);
    let c=d>.84?R[0]:d>.66?(x+y<-2?R[4]:R[3]):dh>.56?R[1]:dh>.28?(x+y<-1?R[3]:R[2]):R[1];if(d>.56&&d<=.66)c=R[1];K.px(6+x,8+y,1,1,c);}},true);};
// the clamp covered: turf sods laid over a dome, foreshortened toward its edges (laid out by angle round the dome), each sod
// its own shade, grass on its top edge with a few blades standing up, earth showing in the gaps; lit from the upper left
const m4clamp=()=>M4.pre('clamp4',150,62,K=>{const E=['#140c08','#1e140c','#2a1c10','#3a2816','#4a341c','#5a4224','#6a502c'],T=['#1a2612','#22321a','#2c4020','#385026','#46602c','#567034'];
  const cell=(x,y)=>{const nx=x/70,ny=(56-y)/56,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));const lat=Math.asin(Math.min(1,ny)),lon=Math.atan2(nx,Math.max(.02,nz));
    const row=Math.floor(lat/.2),fr=lat/.2-row,off=K.H32(row,1,7)*.3,cw=.36/Math.max(.35,Math.cos(lat)),col=Math.floor((lon+off)/cw),fc=(lon+off)/cw-col;return {nx,ny,nz,row,col,fr,fc};};
  const top={};
  for(let y=0;y<=56;y++){const w=Math.round(70*Math.sqrt(Math.max(0,1-((56-y)/56)**2)));for(let x=-w;x<=w;x++){const c=cell(x,y);const seed=K.H32(c.row,c.col,11);
    const l=-c.nx*.8+c.ny*.6+c.nz*.1-.08+(seed-.5)*.12;let col;
    const gapH=c.fc>.93,gapV=c.fr<.1;
    if(gapV&&!gapH)col=E[1];else if(gapH)col=E[2];
    else if(c.fr>.7-seed*.2+.08*Math.sin(x*.7+c.row*2))col=T[l>.45?5:l>.1?4:l>-.3?3:2];
    else col=E[l>.5?6:l>.15?5:l>-.2?4:l>-.55?3:2];
    if(y>53)col=E[1];K.px(75+x,2+y,1,1,col);if(c.fr>.72&&!gapH&&K.H32(x+70,c.row,13)>.86)top[(75+x)+','+(1+y)]=T[l>.1?5:4];}}
  for(const k in top){const [x,y]=k.split(',').map(Number);K.px(x,y,1,1,top[k]);}},true);
// ---------------------------------------------------------------- DROP: the piece sways in your hands over its place; tap to set it down true
S4.drop=(sp,K)=>{const g=K.g,item=sp.item||'brick',N=sp.n||5;
  const SL=[];const add=(x,y,w,h)=>SL.push({x,y,w,h,got:null});
  if(item==='brick'){for(let i=0;i<N;i++){const row=Math.floor(i/3),c=i%3;add(124+c*36+(row%2?18:0)-(row%2&&c===2?36*3:0),150-row*12,34,11);}}
  else if(item==='log'){const rows=[3,2,1];let i=0;rows.forEach((n,r)=>{for(let c=0;c<n&&i<N;c++,i++)add(160+(c-(n-1)/2)*31,151-r*13,32,14);});}
  else if(item==='shingle'){for(let i=0;i<N;i++){const row=Math.floor(i/4),c=i%4;add(104+c*30+(row%2?15:0),60+row*14,30,16);}}
  else if(item==='pane'){for(let i=0;i<N;i++)add(98+i*62,96,54,42);}
  else if(item==='tool'){for(let i=0;i<N;i++)add(100+i*40,70,30,40);}
  const st={i:0,x:120,t:0,end:0,fall:null,q:[],tries:0,spd:sp.speed||1.3};const HOLD=item==='log'?44:24;
  const slot=()=>SL[Math.min(SL.length-1,st.i)];
  const drawPiece=(x,y,w,h,ang,broken)=>{g.save();g.translate(Math.round(x),Math.round(y));if(ang)g.rotate(ang);
    if(item==='brick'){K.bricks(-w/2,-h/2,w,h,CA_P.brick,w,h);K.px(-w/2,-h/2,w,1,CA_P.brick[5]);}
    else if(item==='log'){const lv=m4log(Math.round(Math.abs(x*3))%3);g.drawImage(lv,-lv.width/2,-h/2-1);}
    else if(item==='shingle'){K.plank(-w/2,-h/2,w,h,['#2a1a10','#4a2e1c','#6a4a30','#8a5c3a','#a87448','#c08a58','#d8a470','#e8bc88'],(x*3)|0);K.px(-w/2,h/2-1,w,1,'#1a0e06');}
    else if(item==='pane'){if(broken){for(let k=0;k<6;k++)K.pa(-w/2+k*9,-h/2+((k*7)%h),8,6,'#c8e2f0',.6);}else{K.pa(-w/2,-h/2,w,h,'#c8e2f0',.55);K.px(-w/2+3,-h/2+2,12,1,'#ffffff');K.px(-w/2,-h/2,w,1,'#e8f4fa');}}
    else if(item==='tool'){const T=['saw','plane','square','mallet','chisel'][st.i%5];MG4ART.tool(K,-w/2+6,-h/2+6,T);}
    g.restore();};
  return {title:sp.t||'Set it in place',how:'Your hands sway over the spot. Tap to set the piece down when it lines up with its place.',hint:'Tap when it lines up.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.avg(st.q.concat(new Array(Math.max(0,N-st.q.length)).fill(.15)));}return;}
      const s=slot();if(!st.fall){st.x=s.x+Math.sin(st.t*st.spd*(1+st.i*.06))*46+Math.sin(st.t*st.spd*2.3)*8;if(I.pressed){st.fall={x:st.x,y:HOLD,vy:0,ang:0,va:0};MS.whoosh();}}
      else{const f=st.fall;f.vy+=520*dt;f.y+=f.vy*dt;f.ang+=f.va*dt;f.x+=(f.vx||0)*dt;if(!f.land&&f.y>=s.y){const off=Math.abs(f.x-s.x),w=s.w;const q=off>w*.45?.1:M4.q(off,w*.06,w*.15,w*.28);
          if(off>w*.45){f.land=1;f.vx=(f.x>s.x?60:-60);f.va=(f.x>s.x?4:-4);f.vy=-80;st.q.push(.1);K.judge(.1,s.x,s.y-24,true);MS.miss();if(item==='pane'){A.hiss(.4,.3,'highpass',3000);for(let k=0;k<6;k++)A.tone(2000+Math.random()*3000,.2,'sine',.04,{delay:Math.random()*.2});f.broken=1;}else MS.thunk();st.i++;}
          else{s.got=f.x-s.x;f.y=s.y;st.q.push(q);K.judge(q,s.x,s.y-24,true);if(q<.3)MS.miss();st.fall=null;st.i++;
            if(item==='pane')MS.tink(.8);else if(item==='tool')A.tone(800,.06,'triangle',.05);else{MS.thunk();A.hiss(.1,.15,'lowpass',600);}K.emit(s.x,s.y+s.h/2,6,{c:item==='brick'?['#c8b8a0','#a89880']:['#c8a070'],v:40,spread:2.4,g:200,life:.5});K.shk=.08;}
          if(st.i>=N){st.end=.001;MS.good();}}
        if(f.land&&f.y>200)st.fall=null;}},
    draw(t){// the place being built
      if(item==='brick'){K.ell(160,160,74,8,'#4a3a2a');}
      if(item==='log'){K.pa(110,152,100,6,'#000',.3);K.px(158,104,5,52,'#3e2a18');K.px(158,104,1,52,'#6e4c2c');K.px(162,104,1,52,'#22140a');K.px(158,103,5,1,'#9a7448');K.px(159,102,3,1,'#b08858');}
      if(item==='shingle'){g.drawImage(M4.pre('rafters',150,96,k=>{k.planks(0,0,150,96,CA_P.wood,10,3,true);for(let y=8;y<96;y+=14)k.px(0,y,150,2,CA_P.wood[5]);},true),88,46);}
      if(item==='pane'){g.drawImage(M4.pre('ghframe',200,64,k=>{for(let i=0;i<4;i++)k.px(i*62,0,8,64,CA_P.wood[3]);k.px(0,0,200,6,CA_P.wood[4]);k.px(0,58,200,6,CA_P.wood[2]);},true),66,62);}
      if(item==='tool'){g.drawImage(M4.pre('toolboard',200,70,k=>{k.planks(0,0,200,70,CA_P.wood,10,8,true);},true),60,40);for(const s of SL){K.px(s.x-1,s.y-16,3,4,CA_P.iron[4]);}}
      for(const s of SL){if(s.got!=null)drawPiece(s.x+s.got,s.y,s.w,s.h,s.got*.01);else if(s===slot()&&!st.end)g.setLineDash([2,2]),g.strokeStyle='rgba(255,244,192,.6)',g.strokeRect(s.x-s.w/2,s.y-s.h/2,s.w,s.h),g.setLineDash([]);}
      if(st.fall){const f=st.fall;drawPiece(f.x,f.y,slot().w,slot().h,f.ang,f.broken);}
      else if(!st.end){const s=slot();drawPiece(st.x,HOLD,s.w,s.h,Math.sin(st.t*2)*.05);m4hand(K,st.x-s.w/2-4,HOLD,true);m4hand(K,st.x+s.w/2+4,HOLD);K.pa(st.x-s.w/2,s.y+s.h/2,s.w,2,'#000',.18);}},
    hud(){K.label((item==='brick'?'BRICK ':item==='log'?'LOG ':item==='shingle'?'SHINGLE ':item==='pane'?'PANE ':'TOOL ')+Math.min(N,st.i+1)+'/'+N,30,14,'#f4ecd8','l');K.meter(st.i/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const s=slot();if(!st.fall&&!st.end&&st.t>.6){const tf=Math.sqrt(2*(s.y-24)/520);const lead=st.x;if(Math.abs(st.x-s.x)<1.2)m4tap(a);}AP.hand=[st.x+4,HOLD-20];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- LEVEL: hold it upright against the knocks; watch the bubble
S4.level=(sp,K)=>{const g=K.g,look=sp.look||'post',DUR=sp.dur||4,BAND=.06;const st={th:.12,w:0,prog:0,inT:0,runT:0,t:0,end:0,thump:0,nt:1};
  return {title:sp.t||'Hold it plumb',how:K.fine?'It leans and gets knocked. Push it back upright: move the mouse to the side you want it to go while holding (or use A / D). Keep the bubble in the middle.':'It leans and gets knocked. Push it back upright by dragging toward the side you want it to go. Keep the bubble in the middle.',hint:'Keep the bubble centred.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.15,0,1);}return;}
      let u=0;if(I.ax)u=I.ax;else if(I.down)u=M4.cl((I.x-160)/50,-1,1);st.runT+=dt;
      st.nt-=dt;if(st.nt<=0){st.nt=1.1+Math.random()*.8;const k=(Math.random()<.5?-1:1)*(.3+Math.random()*.2);st.w+=k;st.thump=.2;if(look==='post'){A.tone(110,.15,'sine',.25,{slide:60});A.hiss(.1,.2,'lowpass',500);}else if(look==='chimney')MS.tink(.5);else MS.knock();K.shk=.06;}
      if(st.thump>0)st.thump-=dt;st.w+=(Math.sin(st.th)*1.8+u*3-st.w*2)*dt;st.th+=st.w*dt;st.th=M4.cl(st.th,-.6,.6);
      if(Math.abs(st.th)<=BAND){st.inT+=dt;st.prog+=dt/DUR;}if(st.prog>=1||st.t>(sp.time||12)){st.end=.001;MS.good();}},
    draw(t){const bx=160,by=look==='chimney'?120:look==='door'?150:look==='anvil'?126:150;
      if(look==='post'){K.ell(bx,by+2,50,8,'#5a4422');K.ell(bx,by,14,4,'#2a1a0c');}
      if(look==='door'){K.px(100,40,8,112,CA_P.wood[3]);K.px(212,40,8,112,CA_P.wood[3]);K.px(100,36,120,8,CA_P.wood[4]);}
      if(look==='chimney'){K.ball(bx,by+16,22,CA_P.brass,10);K.px(bx-10,by-2,20,6,CA_P.brass[5]);}
      if(look==='anvil'){K.plank(bx-30,by+8,60,24,CA_P.oak,4,true);K.line(bx-90,by+30,bx+60,by-6,CA_P.wood[4],4);}
      g.save();g.translate(bx,by);g.rotate(st.th);
      if(look==='post'){K.plank(-6,-90,12,92,CA_P.wood,6,true);K.px(-6,-90,12,2,CA_P.wood[6]);}
      else if(look==='door'){g.drawImage(M4.pre('coopdoor',90,106,k=>{k.planks(0,0,90,106,CA_P.wood,10,4,true);k.line(4,100,86,6,CA_P.wood[2],3);k.metal(0,14,90,4,CA_P.iron);k.metal(0,86,90,4,CA_P.iron);},true),-45,-108);}
      else if(look==='chimney'){g.drawImage(M4.pre('chimney',26,56,k=>{for(let y=0;y<56;y++){const w=Math.round(8+Math.sin(y/56*Math.PI)*5);k.pa(13-w,y,w*2,1,'#d8eef8',.45);k.px(13-w,y,1,1,'#ffffff');k.pa(12+w,y,1,1,'#8ab0c8',.8);}},false),-13,-56);}
      else if(look==='anvil'){g.drawImage(M4F.anvil(),-56,-58);}
      // the level on it
      const lw=24,ly=look==='door'?-60:look==='chimney'?-30:look==='anvil'?-62:-60;K.px(-lw/2,ly,lw,5,'#3a6a2a');K.px(-lw/2,ly,lw,1,'#6a9a4a');K.px(-lw/2+2,ly+1,lw-4,3,'#c8e8a8');const bub=M4.cl(-st.th*60,-9,9);K.px(bub-2,ly+1,4,3,'#ffffff');K.px(-1,ly,1,5,'#1a3a1a');K.px(2,ly,1,5,'#1a3a1a');
      g.restore();
      if(look==='post'&&st.thump>0){K.px(bx+18,by-30-st.thump*40,4,30,CA_P.iron[4]);}
      const hx=bx+Math.sin(st.th)*-70,hy=by-Math.cos(st.th)*70;m4hand(K,hx-10,hy,true);m4hand(K,hx+10,hy);},
    hud(){K.label('PLUMB',286,14,'#f4ecd8');K.gauge(282,24,8,90,.5-BAND/1.2,.5+BAND/1.2,.5+st.th/1.2);K.meter(st.prog,st.runT?st.inT/st.runT:1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);a.ax=M4.cl(-(st.th*12+st.w*2.5),-1,1);AP.hand=[160+a.ax*30,40];AP.press=Math.abs(a.ax)>.3;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- DIG: hold to drive the spade in, let go to lift the soil out; too deep and it sticks
S4.dig=(sp,K)=>{const g=K.g,N=sp.n||6;const st={d:0,hole:0,q:[],t:0,end:0,lift:0,stuck:0,wig:0,pile:0};
  return {title:sp.t||'Dig the hole',how:'Hold to drive the spade in with your foot, let go to lift the soil out. A full spade is deep but not too deep: go too far and it sticks, and you’ll have to wiggle it free.',hint:'Hold, then let go when the spade’s full.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;st.score=M4.avg(st.q);}return;}
      if(st.lift>0){st.lift+=dt/.55;if(st.lift>=1)st.lift=0;return;}
      if(st.stuck){if(I.pressed){st.wig++;A.tone(180,.08,'sawtooth',.04,{filter:['lowpass',600]});if(st.wig>=4){st.stuck=0;st.wig=0;st.d=.9;}}return;}
      if(I.down){const res=1+Math.sin(st.t*9)*.5;st.d+=dt*.85*res;if(Math.random()<dt*10)A.hiss(.05,.08,'lowpass',400);if(st.d>=1.12){st.stuck=1;st.q.push(.15);K.judge(.15,160,60,true);MS.miss();A.tone(140,.25,'square',.05,{slide:90});}}
      else if(st.d>.05){const q=st.d>=.6&&st.d<=1?1:st.d>=.4?.6:.3;st.q.push(q);K.judge(q,160,60,true);st.hole+=st.d/N*1.1;st.pile+=st.d;st.lift=.001;MS.whoosh();A.hiss(.2,.15,'lowpass',700);K.emit(200,90,12,{c:['#5a4022','#7a5a32','#3a2a14'],v:90,ang:-Math.PI*.3,spread:.8,g:400,life:.8});st.d=0;
        if(st.q.length>=N||st.hole>=1){st.end=.001;MS.good();}}},
    draw(t){K.ell(150,152,74,14,'#2a1e0e');K.ell(150,150,70,12,'#4a3418');for(let k=0;k<30;k++){const a=k*2.4,r=40+((k*13)%30);K.px(150+Math.cos(a)*r,150+Math.sin(a)*r*.17,2,1,k%2?'#6a4a24':'#3a2a14');}const h=Math.min(1,st.hole);K.ell(150,148,18+h*10,4+h*3,'#1a0e06');K.ell(236,150,10+st.pile*6,3+st.pile*2,'#5a4022');
      const lift=st.lift>0?Math.sin(st.lift*Math.PI):0;const d=st.stuck?1.12:st.d;const sx=150,sy=150-30+d*18-lift*30;
      // a spade: a dished steel blade with a tread on top, an ash shaft, a D-grip
      for(let y=0;y<18;y++){const w=Math.round(9-Math.max(0,y-12)*.9);K.px(sx-w,sy+y,w*2,1,CA_P.iron[y<2?6:y>15?3:5]);K.px(sx-w,sy+y,1,1,CA_P.iron[7]);K.px(sx+w-1,sy+y,1,1,CA_P.iron[2]);}K.px(sx-9,sy-1,18,2,CA_P.iron[3]);K.px(sx-2,sy-4,4,6,CA_P.iron[4]);
      if(lift>.1){K.ell(sx,sy+4,9,4,'#5a4022');for(let k=0;k<5;k++)K.px(sx-6+k*3,sy+1-(k%2),2,2,'#3a2a14');}
      K.px(sx-1,sy-60,3,58,CA_P.wood[4]);K.px(sx-1,sy-60,1,58,CA_P.wood[6]);K.px(sx-7,sy-66,14,3,CA_P.wood[3]);K.px(sx-7,sy-66,2,7,CA_P.wood[3]);K.px(sx+5,sy-66,2,7,CA_P.wood[3]);
      K.px(sx+9,sy-6,14,5,'#3a2a1a');K.px(sx+9,sy-6,14,1,'#5a4030');m4hand(K,sx,sy-64);m4hand(K,sx,sy-36,true);if(st.stuck&&Math.floor(t*6)%2)K.label('STUCK: TAP TO WIGGLE',160,30,'#e8542a');},
    hud(){K.label('DEPTH',286,14,'#f4ecd8');K.gauge(282,24,8,90,.6/1.15,1/1.15,Math.min(1.15,st.stuck?1.12:st.d)/1.15,{zone:'#5a4a1c'});K.meter(Math.min(1,st.hole),M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.stuck)m4tap(a);else if(!st.lift&&st.t>.5)m4hold(a,st.d<.8);AP.hand=[166,50];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- LIGHT: strike a match and hold it to the wick, but only between the gusts
S4.light=(sp,K)=>{const g=K.g,look=sp.look||'lantern';const st={m:3,lit:0,burn:0,catch:0,t:0,end:0,gust:0,next:2.2,strike:0,out:0};
  const windy=()=>st.gust>0;
  return {title:sp.t||'Light it',how:'Tap to strike a match, then hold to keep it to the wick. A gust blows a match out if it’s held there, so wait for the leaves to settle. Three matches.',hint:'Strike, then hold it to the wick when the air is still.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.9){st.done=true;st.score=st.lit?[1,1,.7,.45][3-st.m]||.45:.15;}return;}
      st.next-=dt;if(st.next<=0){st.gust=1.1+Math.random()*.6;st.next=2+Math.random()*2.2;A.hiss(1.2,.12,'lowpass',500,{slide:900});}if(st.gust>0)st.gust-=dt;
      if(st.burn>0){st.burn-=dt;if(st.burn<=0){st.out=.5;}}
      if(st.out>0){st.out-=dt;return;}
      if(st.burn<=0){if(I.pressed&&st.m>0){st.m--;st.burn=6;st.catch=0;st.strike=.3;A.hiss(.25,.3,'highpass',2600);A.tone(900,.1,'triangle',.05);}}
      else if(I.down&&!I.pressed){if(windy()){st.burn=0;st.out=.6;A.hiss(.3,.15,'lowpass',900);MS.miss();K.judge(.15,160,40,true);}else{st.catch+=dt/1.1;if(st.catch>=1){st.lit=1;st.end=.001;MS.good();A.hiss(.4,.1,'bandpass',800);}}}
      if(st.strike>0)st.strike-=dt;if(!st.lit&&st.m<=0&&st.burn<=0&&st.out<=0){st.end=.001;}},
    draw(t){const lx=160,ly=92;
      // leaves and dust tell you about the wind
      for(let i=0;i<8;i++){const ph=(t*(windy()?1.2:.15)+i*.13)%1;const x=windy()?ph*340-10:40+i*30+Math.sin(t+i)*4,y=40+((i*29)%80)+Math.sin(t*2+i)*(windy()?8:2);K.px(x,y,2,2,i%2?'#c8822a':'#8a5a1a');}
      if(look==='lantern'){K.px(lx-1,20,2,26,CA_P.iron[3]);K.px(lx-40,18,80,3,CA_P.wood[3]);
        // a hurricane lantern: a domed top with a ring, a glass globe in wire guards, a brass tank with the wick knob
        g.drawImage(M4.pre('lantern2',44,64,k=>{const I=CA_P.iron,B=CA_P.brass;k.ell(22,4,4,3,I[2]);k.px(14,6,16,4,I[4]);k.px(10,10,24,4,I[5]);k.px(10,10,24,1,I[7]);
          for(let y=14;y<44;y++){const w=Math.round(9+Math.sin((y-14)/30*Math.PI)*4);k.pa(22-w,y,w*2,1,'#d8eef8',.35);k.px(22-w,y,1,1,'#ffffff');k.pa(21+w,y,1,1,'#8ab0c8',.9);}
          for(const xx of [9,22,35])k.line(xx,14,xx+(xx-22)*.25,44,I[3],1);k.px(8,44,28,3,B[3]);k.px(8,44,28,1,B[6]);k.px(10,47,24,12,B[4]);k.px(10,47,3,12,B[6]);k.px(31,47,3,12,B[2]);k.px(8,59,28,3,B[3]);k.ball(37,52,3,B,2);k.px(20,36,4,8,'#e8dcc0');},true),lx-22,ly-34);}
      else{K.ball(lx,ly+16,22,CA_P.brass,10);K.px(lx-10,ly-2,20,6,CA_P.brass[5]);K.px(lx-2,ly-6,4,5,'#e8dcc0');}
      if(st.lit){for(let k=0;k<3;k++)K.flame(lx-3,ly-2,.5,t+k);K.glow(lx,ly-4,60,'255,210,120',.45+Math.sin(t*9)*.05);}
      if(st.burn>0||st.out>0){const lean=windy()?-6:Math.sin(t*3)*1;const mx=lx+8,my=ly-6;K.line(mx,my,mx+26,my-30,'#c8a060',1);K.px(mx-1,my-1,3,3,'#8a2a14');if(st.burn>0){K.flame(mx-3+lean*.5,my-2,.4,t);K.glow(mx,my-4,20,'255,190,90',.4);}else{for(let k=0;k<3;k++)K.pa(mx-2+k*2+lean,my-6-k*4,2,2,'#c8c0b8',.5);}m4hand(K,mx+28,my-32);}
      if(st.catch>0&&!st.lit){K.px(lx-10,ly+30,20*st.catch,2,'#ffd27a');}},
    hud(t){K.label('MATCHES '+st.m,30,14,'#f4ecd8','l');K.label(windy()?'GUST!':'STILL',160,14,windy()?'#e8542a':'#9be07a');K.meter(st.lit?1:st.catch);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.burn<=0&&st.out<=0&&st.m>0&&!st.end&&st.t>.5){if(!windy()&&st.next>1.3)m4tap(a);}else if(st.burn>0){m4hold(a,!windy()&&st.next>.15&&st.burn<5.8);}AP.hand=[196,40];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- SMOULDER: a charcoal clamp wants a slow burn: hold to bank earth over the vents, let go to give it air
S4.smoulder=(sp,K)=>{const g=K.g,LO=.38,HI=.6,DUR=sp.dur||6;const st={air:.8,burn:.7,prog:0,inT:0,runT:0,t:0,end:0,flare:0,cold:0};let roar=null;
  return {title:sp.t||'Keep it smouldering',how:'The clamp wants a slow, smoky burn. Hold to bank earth over the vents (less air), let go to open them. Watch the smoke: thin blue is right, flames mean it’s burning away, no smoke means it’s dying.',hint:'Hold to cover the vents. Keep the burn in the green.',st,
    update(dt,I){st.t+=dt;if(!roar)roar=MS.loop('lowpass',240,.8);if(st.end){st.end+=dt;roar.set(0);if(st.end>.6){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.12-st.flare*.06,0,1);}return;}
      st.runT+=dt;st.air+=((I.down?0:1)-st.air)*Math.min(1,dt*1.4);st.burn+=(st.air*.95-st.burn)*dt*.7+Math.sin(st.t*1.3)*.02*dt;roar.set(st.burn*.1,180+st.burn*300);
      if(st.burn>=LO&&st.burn<=HI){st.inT+=dt;st.prog+=dt/DUR;}if(st.burn>HI+.12&&Math.random()<dt*3){st.flare++;A.hiss(.2,.15,'bandpass',900);}
      const n=st.burn;if(Math.random()<dt*(10+n*24)*Math.max(.3,st.air)){const vx=[-40,0,40][(Math.random()*3)|0];K.emit(160+vx+(Math.random()-.5)*6,(vx?138:110),1,{c:n>HI?['#4a4a4e','#3a3a3e','#2c2c30']:n<LO?['#c8c4bc','#b4b0a8']:['#a4acb8','#8e96a4','#7a8290'],hi:n>HI?'#5c5c60':'#c0c6d0',v:10+n*16,ang:-Math.PI/2,spread:.45,g:-20,drag:.6,life:2.2,sz:2.5+n*2.5,kind:'smoke'});}
      if(st.prog>=1||st.t>(sp.time||15)){st.end=.001;MS.good();}},
    draw(t){const cx=160;g.drawImage(m4clamp(),cx-75,100);
      for(const vx of [-40,0,40]){const vy=vx?140:112;const o=st.air;K.ell(cx+vx,vy,7,2+o*2,'#140a04');K.ell(cx+vx,vy-1,7,1,'#2a1c10');
        if(st.burn>HI)K.flame(cx+vx-4,vy,.5+(st.burn-HI)*2,t+vx);else if(o>.25){K.ell(cx+vx,vy+1,4,Math.max(1,o*2),'#a8380e');K.px(cx+vx-2,vy+1,4,1,st.burn>LO?'#f08a2a':'#c85a1a');K.px(cx+vx-1,vy+1,2,1,'#ffc860');}}
      if(st.air<.6){m4hand(K,cx+52,126);K.ell(cx+58,132,8,3,'#4a3820');}K.glow(cx,132,44,'255,120,40',Math.max(0,st.burn-.3)*.4);},
    hud(t){K.label('BURN',248,22,'#f4ecd8');K.gauge(244,34,8,70,LO,HI,st.burn,{zone:'#3a6a2a'});K.meter(st.prog,st.runT?st.inT/st.runT:1);if(st.burn>HI+.1&&Math.floor(t*5)%2)K.label('FLAMES: COVER IT',160,24,'#e8542a');if(st.burn<LO-.1&&Math.floor(t*5)%2)K.label('DYING: GIVE IT AIR',160,24,'#e8b030');},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.burn+(st.air*.95-st.burn)*.6>(LO+HI)/2);AP.hand=[214,112];AP.press=a.down;},
    quiet(){roar&&roar.set(0);},stop(){roar&&roar.stop();roar=null;}};};
// ---------------------------------------------------------------- variations on earlier steps: rivets, wax, a pump, a mortar, a coil, a twist, a rinse, small vessels
// ---------------------------------------------------------------- the recipes
{const JACKET=[[110,40],[150,34],[170,34],[210,40],[234,62],[220,72],[206,60],[206,112],[114,112],[114,60],[100,72],[86,62],[110,40]];
const COAT=[[112,34],[148,30],[172,30],[208,34],[230,60],[216,68],[204,58],[208,118],[112,118],[116,58],[104,68],[90,60],[112,34]];
const ring=(cx,cy,rx,ry,n)=>{const p=[];for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI*2;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;};
const FACE=[[[122,64],[138,64],[130,50],[122,64]],[[182,64],[198,64],[190,50],[182,64]],[[154,82],[166,82],[160,72],[154,82]],[[118,96],[130,104],[142,96],[154,106],[166,96],[178,106],[190,96],[202,104]]];
const BENCH=(spr,sc)=>K=>{const m=SPR[spr];if(!m)return;sc=sc||1.5;K.sprite(spr,160-m.fw*sc/2,84-m.fh*sc/2,{scale:sc});};
const D={
  'cook:pie':{scene:'kitchen',reveal:m4ico('pie'),steps:[{k:'roll',t:'Roll out the crust'},{k:'pour',t:'Spoon in the pumpkin filling',col:['#d8742a','#e8904a'],bowl:'tin',line:.75},{k:'crimp',t:'Crimp the edge',n:12},{k:'bake',t:'Bake it golden'}]},
  'b_furnace:ch':{scene:'yard',reveal:m4ico('coal'),steps:[{k:'drop',t:'Stack the wood into a clamp',item:'log',n:6},{k:'smoulder',t:'Keep it smouldering, not burning'}]},
  'b_armor:jacket':{scene:'sewing',reveal:m4rv(CG3K['b_armor:jacket'].reveal),steps:[{k:'trace',t:'Cut the canvas along the pattern',paths:[JACKET],surface:'canvas',tool:'shears'},{k:'sew',t:'Sew the seams',n:14},{k:'brush',t:'Rub the wax in',look:'wax',col:'#8a6a3a',time:16}]},
  'b_armor:coat':{scene:'sewing',reveal:m4rv(CG3K['b_armor:coat'].reveal),steps:[{k:'trace',t:'Cut the leather to the pattern',paths:[COAT],surface:'leather',tool:'shears'},{k:'hammer',t:'Set the copper rivets',n:5,look:'rivet'}]},
  'b_furn:lamp':{scene:'workshop',reveal:BENCH('in_oillamp_n',2),steps:[{k:'level',t:'Set the chimney glass on straight',look:'chimney',dur:3.5},{k:'pour',t:'Fill the font with oil',col:['#c8a040','#e8c868'],bowl:'font',line:.8},{k:'light',t:'Light the wick',look:'lamp'}]},
  'b_furn:rug':{scene:'sewing',reveal:m4ico('in_rug'),steps:[{k:'braid',t:'Braid the rag strips',n:12},{k:'crank',t:'Coil it round into a rug',look:'rug',n:14}]},
  'b_furn:pumpkin':{scene:'workshop',reveal:BENCH('jack_b',2),steps:[{k:'trace',t:'Cut the lid',paths:[ring(160,30,26,10,24)],surface:'pumpkin',tool:'knife'},{k:'scoop',t:'Scoop out the seeds'},{k:'trace',t:'Carve the face',paths:FACE,surface:'pumpkin',tool:'knife',glow:1}]},
  'b_farm:spr':{scene:'workshop',reveal:m4rv(CG3K['b_farm:spr'].reveal),steps:[{k:'hammer',t:'Rivet the brass seams',n:5,look:'rivet',metal:'brass'},{k:'bellows',t:'Pump it: test the spray',item:'pump',band:[.5,.78]}]},
  'b_farm:fert':{scene:'workshop',reveal:m4ico('bonemeal'),steps:[{k:'crank',t:'Grind the bones',look:'mortar',n:12},{k:'scale',t:'Bag it by weight',col:['#f4f0e4','#ddd4c0']}]},
  'b_farm:ts':{scene:'barn',reveal:m4ico('seed_turnip'),steps:[{k:'flail',t:'Thresh the seed heads',n:8},{k:'sieve',t:'Sift the seed from the chaff'}]},
  'b_farm:ps':{scene:'workshop',reveal:m4ico('seed_pumpkin'),steps:[{k:'scoop',t:'Scoop out the seeds',n:28},{k:'sieve',t:'Rinse them in the sieve',look:'rinse'}]},
  'b_farm:charm':{scene:'workshop',reveal:m4rv(CG3K['b_farm:charm'].reveal),steps:[{k:'crank',t:'Twist the straw',look:'straw',n:10},{k:'knot',t:'Pull the knot tight'}]},
  'craft:flask':{scene:'workshop',reveal:m4rv(CG3K['craft:flask'].reveal),steps:[{k:'simmer',t:'Render the oil from the coal and fibre',scene:'stove',col:['#5a3a1a','#8a5a2a'],bits:['#2a2a2a','#3a3a3a'],adds:[{at:3,icon:'coal'}]},{k:'pour',t:'Fill the flask through the funnel',col:['#8a5a2a','#c8903a'],bowl:'flask',line:.8},{k:'cork',t:'Cork it'}]},
  'craft:candle':{scene:'kitchen',reveal:m4rv(CG3K['craft:candle'].reveal),steps:[{k:'simmer',t:'Melt the tallow',scene:'stove',col:['#e8dcb8','#f8f0d8'],bits:[],adds:[{at:2.5,icon:'tallow'}]},{k:'dip',t:'Dip the candle',n:6}]},
  'build:coop':{scene:'yard',reveal:m4rv(CG3K['build:coop'].reveal),steps:[{k:'hammer',t:'Frame the walls',n:4},{k:'drop',t:'Lay the roof shingles',item:'shingle',n:8},{k:'level',t:'Hang the door square',look:'door'}]},
  'build:lamps':{scene:'yard',reveal:m4rv(CG3K['build:lamps'].reveal),steps:[{k:'dig',t:'Dig the post holes'},{k:'level',t:'Set the post plumb',look:'post'},{k:'light',t:'Light the lantern'}]},
  'build:gh':{scene:'yard',reveal:m4rv(CG3K['build:gh'].reveal),steps:[{k:'hammer',t:'Bolt the frame',n:4,look:'rivet',metal:'iron'},{k:'drop',t:'Fit the glass panes',item:'pane',n:3},{k:'trace',t:'Putty the seams',paths:[[[66,108],[256,108]],[[66,72],[256,72]]],surface:'glass',tool:'putty'}]},
  'build:bench_farm':{scene:'workshop',reveal:m4rv(CG3K['build:bench_farm'].reveal),steps:[{k:'saw',t:'Saw the bench top',n:8,wood:CA_P.oak},{k:'plane',t:'Plane it flat',wood:CA_P.oak}]},
  'build:furnace':{scene:'forge',reveal:m4rv(CG3K['build:furnace'].reveal),steps:[{k:'drop',t:'Lay the bricks',item:'brick',n:6},{k:'bellows',t:'Light the first fire and draw it up',band:[.55,.82]}]},
  'build:bench_weapon':{scene:'forge',reveal:m4rv(CG3K['build:bench_weapon'].reveal),steps:[{k:'level',t:'Lever the anvil onto the block',look:'anvil',dur:3},{k:'hammer',t:'Bolt the vise on',n:3,look:'rivet',metal:'iron'}]},
  'build:bench_armor':{scene:'sewing',reveal:m4rv(CG3K['build:bench_armor'].reveal),steps:[{k:'stuff',t:'Stuff the dress form'},{k:'crimp',t:'Pin your measurements to it',look:'form',n:8}]},
  'build:bench_furn':{scene:'workshop',reveal:m4rv(CG3K['build:bench_furn'].reveal),steps:[{k:'hammer',t:'Nail up the tool board',n:4},{k:'drop',t:'Hang the tools',item:'tool',n:4}]}};
D['craft:sprinkler']=D['b_farm:spr'];D['craft:scare']=D['b_farm:charm'];
Object.assign(MG4R,D);}
