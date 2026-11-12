/* ================= #266 the car repair, done with your hands. Every step but the winch used to be the same bar with a marker
   sweeping across it, whatever the step said. Now each step is a close-up of the job it names, and you do that job:
     the frame      beat each dent out of the fender with a body hammer (miss and you put a new ding in it);
     the radiator   drag the slack of the fan belt round the alternator pulley, lever it tight, then turn each hose clamp's
                    screw until it bites (too far and it cuts the hose);
     the wheel      hang the wheel on the hub with the holes lined up on the studs, then torque the lug nuts in a star;
     the glass      carry the windshield into the frame without knocking a corner, then run the seal round it;
     the wiring     swing the heavy battery into its tray, then hook up the red cable, the black, and the loom plug;
     the engine     pour the gas in to the full mark, then turn the key and let go when it catches.
   All of it is drawn here, ours. ================= */
const CRP={RED:['#1c0c0a','#3a1410','#56201a','#6e2c22','#8a3a2c','#a8503c','#c06a52','#d8907a'],
  GL:['#0e1a1e','#16303a','#1f4a56','#2f6a76','#58a0a8','#9cd0d4'],
  RUB:['#08080b','#111115','#1a1a20','#24242b','#2f2f38','#3c3c47'],
  YEL:['#3a2a06','#6a4c0c','#9a7012','#c89a1c','#e8c040','#f6e08a']};
// ---- the close-up backdrop: the roadside at dusk, out of focus, with the work light's warmth from the top left
(function(){if(typeof MG4ART==='undefined')return;
  MG4ART.paint.carclose=K=>{for(let y=0;y<180;y++){const t=y/180;K.px(0,y,320,1,`rgb(${Math.round(20+t*12)},${Math.round(18+t*10)},${Math.round(28+t*6)})`);}
    for(let x=0;x<320;x+=2){const h=10+Math.sin(x*.05)*4+Math.sin(x*.17+1)*2;K.pa(x,40-h,2,h+4,'#141a18',.8);}
    K.pa(0,150,320,30,'#0c0a0e',.5);};
  MG4ART.anim.carclose=(K,t)=>{K.glow(30,8,150,'255,224,150',.1+Math.sin(t*3.1)*.008+(Math.sin(t*23)>.94?-.03:0));};
  MG4ART.LIGHT.carclose={x:70,y:28,r:230,c:'250,222,150',a:.13,mote:'#9aa0b4'};})();
// ---- drawing helpers
const crT=(P,k)=>P[Math.max(0,Math.min(P.length-1,Math.round(k)))];
// a painted steel panel: lit along the top, a soft reflection band, darker toward the bottom; a little rust at the lower edge
function crSheet(k,w,h,P,seed,rust){for(let y=0;y<h;y++){const u=y/Math.max(1,h-1);let base=u<.06?6:u<.16?5.4:u<.3?4.6:u<.42?5.2:u<.75?4:u<.9?3.3:2.6;
    for(let x=0;x<w;x++){let v=base-(x/w)*.5;if(((x*13+y*7+seed)%97)===0)v-=.6;k.px(x,y,1,1,crT(P,v));}}
  // rust comes in patches along the lower edge, each a dark-cored shape with a lighter crust at its rim, not a speckle
  if(rust)for(let i=0;i<Math.ceil(w/44);i++){const cx=i*44+12+k.H32(i,1,seed)*20,cy=h-4-k.H32(i,2,seed)*Math.min(14,h*.12),rx=5+k.H32(i,3,seed)*11,ry=2.5+k.H32(i,4,seed)*4;
    for(let y=-Math.ceil(ry)-1;y<=ry+1;y++)for(let x=-Math.ceil(rx)-1;x<=rx+1;x++){const wob=1+(k.H32(Math.floor((cx+x)/3),Math.floor((cy+y)/3),seed+7)-.5)*.5;const e=(x/rx)**2+(y/ry)**2;if(e>wob)continue;
      const X=Math.round(cx+x),Y=Math.round(cy+y);if(X<0||Y<0||X>=w||Y>=h)continue;k.px(X,Y,1,1,crT(P,e>wob*.7?2.6:e>wob*.35?1.6:1));}}
  k.px(0,0,w,1,P[7]);k.px(0,h-1,w,1,P[1]);}
// a flat disc (a pulley face, a hub) lit from the top left, with a rim
function crDisc(K,cx,cy,r,P,inner){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y);if(d>r+.4)continue;let k=3.6-(x+y)/(r*2.2);if(d>r-1.4)k+=(x+y<0?1.6:-1.4);if(inner&&d<inner)k-=1.2;K.px(cx+x,cy+y,1,1,crT(P,k));}}
// a ring (a tire, a pulley groove) shaded by its slope: the upper-left shoulders lit, the lower-right in shade
function crRing(K,cx,cy,r0,r1,P){for(let y=-r1;y<=r1;y++)for(let x=-r1;x<=r1;x++){const d=Math.hypot(x,y);if(d<r0||d>r1+.4)continue;const u=(d-r0)/Math.max(1,r1-r0),nx=x/(d||1),ny=y/(d||1);
    const slope=(u<.5?-1:1)*(1-Math.abs(u-.5)*2)*.6;let k=2.6-(nx+ny)*1.1*(u>.5?1:-.4)+slope;if(u>.92||u<.08)k-=.8;K.px(cx+x,cy+y,1,1,crT(P,k));}}
// a hex nut face-on
function crNut(K,cx,cy,r,P,rot){rot=rot||0;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const a=Math.atan2(y,x)-rot,d=Math.hypot(x,y);const seg=Math.PI/3,ang=((a%seg)+seg)%seg-seg/2;if(d*Math.cos(ang)>r*.92)continue;
    const face=Math.floor(((a+Math.PI*2)%(Math.PI*2))/seg);const k=[5.6,4.8,3.4,2.4,3.2,4.6][(face+6)%6]-(d<r*.38?1.4:0);K.px(cx+x,cy+y,1,1,crT(P,k));}}
// the engine bay: dark iron in deep shade at the edges, a ribbed valve cover, a loom of wires and a hose, bolts catching the light
function crBay(k,w,h,seed,o){o=o||{};const I=CA_P.iron;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ex=Math.min(x,w-1-x)/w,ey=Math.min(y,h-1-y)/h;let v=2.1-(y/h)*.7+Math.min(.6,Math.min(ex,ey)*3);if(((x*7+y*13+seed)%61)===0)v-=.5;k.px(x,y,1,1,crT(I,v));}
  if(o.cover){const [cx,cy,cw,ch]=o.cover;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const u=y/ch;let v=u<.08?6:u<.5?4.6-u:3.2-u*.8;if(x%8===0&&u>.15&&u<.85)v-=1.2;if(x%8===1&&u>.15&&u<.85)v+=.6;k.px(cx+x,cy+y,1,1,crT(I,v));}
    k.px(cx,cy+ch,cw,2,'#08080a');for(const bx of [cx+6,cx+cw-8]){k.px(bx-1,cy+2,3,3,I[2]);k.px(bx,cy+3,1,1,I[7]);}}
  if(o.loom){const [x0,y0,x1,y1]=o.loom;for(let i=0;i<=60;i++){const u=i/60,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u+Math.sin(u*Math.PI)*10;k.px(x,y,3,3,'#141418');k.px(x,y,2,1,(i%6<3)?'#4a3a28':'#2a2a30');}}
  if(o.hose){const [x0,y0,x1,y1]=o.hose;for(let i=0;i<=80;i++){const u=i/80,x=x0+(x1-x0)*u,y=y0+(y1-y0)*u-Math.sin(u*Math.PI)*12;for(let j=-4;j<=4;j++)k.px(x,y+j,1,1,crT(CRP.RUB,3.4-j*.35-(Math.abs(j)>3?1.5:0)));}}
  for(const [bx,by] of (o.bolts||[]))crNutK(k,bx,by,3);}
function crNutK(k,cx,cy,r){crNut(k,cx,cy,r,CA_P.iron,.3);}
// pixel arc / line of a given thickness
function crArc(K,cx,cy,r,a0,a1,w,c){const n=Math.max(6,Math.ceil(Math.abs(a1-a0)*r));for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;K.px(cx+Math.cos(a)*r-w/2,cy+Math.sin(a)*r-w/2,w,w,c);}}
const crHyp=(ax,ay,bx,by)=>Math.hypot(bx-ax,by-ay);
// a gentle hand-held sway for things you carry
const crHold=(st,I,dt,k)=>{const tx=I.x,ty=I.y;st.vx=(st.vx||0)+((tx-st.x)*k-(st.vx||0)*2*Math.sqrt(k))*dt;st.vy=(st.vy||0)+((ty-st.y)*k-(st.vy||0)*2*Math.sqrt(k))*dt;st.x+=st.vx*dt;st.y+=st.vy*dt;};
// the body hammer: a round steel face on a short head, an ash handle (pivot at the grip)
const crHammer=()=>M4.pre('crhammer',50,16,K=>{const I=CA_P.iron,O=CA_P.oak;for(let x=12;x<48;x++){for(let y=6;y<10;y++)K.px(x,y,1,1,O[y===6?6:y===9?2:4]);}K.px(40,5,8,6,O[3]);K.px(40,5,8,1,O[5]);
    for(let y=1;y<15;y++)for(let x=1;x<13;x++){const u=(y-1)/13;let k=u<.15?6:u<.4?5:u<.7?4:3;if(x<3)k+=1;if(x>10)k-=1;K.px(x,y,1,1,I[M4.cl(k,0,7)]);}K.px(0,3,2,10,I[7]);K.px(0,3,1,10,I[6]);},true);
// ================================================================= THE FRAME: beat the dents out of the fender
S4.crDents=(sp,K)=>{const g=K.g,X0=16,X1=298,TOP=30,BOT=148,AX=X0+190,AY=BOT+18,AR=50,TRIM=70;
  const sheet=M4.pre('crfender2',X1-X0,BOT-TOP,k=>{crSheet(k,X1-X0,BOT-TOP,CRP.RED,5,true);
      // the wheel arch: cut out at the bottom, with its lip lit along the top
      for(let y=0;y<BOT-TOP;y++)for(let x=0;x<X1-X0;x++){const d=Math.hypot(x+X0-AX,y+TOP-AY);if(d<AR)k.g.clearRect(x,y,1,1);else if(d<AR+3)k.px(x,y,1,1,CRP.RED[d<AR+1?2:6]);}
      // the headlight bezel at the front end, and a seam line
      for(let y=10;y<44;y++)for(let x=0;x<26;x++){const d=Math.hypot((x-14)/12,(y-27)/16);if(d>1)continue;k.px(x,y,1,1,d>.82?CA_P.iron[d>.92?2:6]:crT(CRP.GL,1+(x<12&&y<24?3:0)));}
      for(let y=4;y<BOT-TOP-30;y++)k.px(34,y,1,1,CRP.RED[2]);},false);
  const tire=M4.pre('crtirearch',120,40,k=>{crRing(k,60,AR,AR-18,AR-2,CRP.RUB);},false);
  const DENTS=(sp.dents||[[70,52,15],[124,104,17],[160,54,13],[236,56,14],[96,128,11],[272,104,12]]).map(([x,y,r])=>({x,y,r,d:1,pop:0}));
  const ham=crHammer();const st={t:0,x:160,y:90,sw:0,res:[],miss:0,end:0,ang:.9,hx:160,hy:90,bump:0};
  const onPanel=(x,y)=>x>X0+2&&x<X1-2&&y>TOP+2&&y<BOT-2&&Math.hypot(x-AX,y-AY)>AR+3;
  const live=()=>DENTS.filter(d=>d.d>0);
  const strike=(x,y)=>{let best=null,bd=1e9;for(const d of DENTS){if(d.d<=0)continue;const dd=Math.hypot(x-d.x,y-d.y);if(dd<d.r+4&&dd<bd){bd=dd;best=d;}}
    if(best){const c=1-bd/(best.r+4);best.d-=.34+.36*c;const q=c>.62?1:c>.32?.7:.45;st.res.push(q);K.pops.length=0;K.judge(q,M4.cl(best.x,130,270),22,true);MS.tink(.3+c*.5);MS.knock();
      K.emit(x,y,4+Math.round(c*5),{c:['#fff4c0','#ffd27a','#e8a050'],v:70,g:160,life:.3});st.bump=.12;
      if(best.d<=0){best.d=0;best.pop=.35;MS.pop&&MS.pop();A.tone(1200,.08,'triangle',.05,{slide:1600});K.emit(best.x,best.y,8,{c:[CRP.RED[3],CRP.RED[1]],v:45,g:220,life:.5});}
      if(!live().length&&!st.end)st.end=.001;}
    else if(onPanel(x,y)){st.miss++;st.res.push(.1);DENTS.push({x,y,r:6,d:.7,pop:0,ding:1});K.judge(.1,x,y-16,true);MS.miss();A.tone(380,.12,'square',.04,{slide:240,filter:['lowpass',1600]});K.shk=.12;}
    else{MS.whoosh&&MS.whoosh();}};
  return {title:sp.t||'Beat the dents out',how:(K.fine?'Click':'Tap')+' a dent to swing the hammer at it. Hit it dead centre; it takes two or three blows. Miss and you put a new ding in the panel.',hint:'Hit the dents dead centre. Don’t hit the flat metal.',st,
    update(dt,I){st.t+=dt;if(st.bump>0)st.bump-=dt;for(const d of DENTS)if(d.pop>0)d.pop-=dt;
      if(st.end){st.end+=dt;st.ang+=(.9-st.ang)*Math.min(1,dt*8);if(st.end>.8){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.miss*.03,.05,1);}return;}
      st.x+=(I.x-st.x)*Math.min(1,dt*18);st.y+=(I.y-st.y)*Math.min(1,dt*18);
      if(st.sw>0){st.sw+=dt/.09;st.ang=.9*(1-Math.min(1,st.sw));if(st.sw>=1){st.sw=0;st.ang=0;strike(st.hx,st.hy);}}
      else{st.ang+=(.9-st.ang)*Math.min(1,dt*10);st.hx=st.x;st.hy=st.y;if(I.pressed){st.sw=.001;st.hx=I.x;st.hy=I.y;MS.whoosh&&MS.whoosh();}}},
    draw(t){g.drawImage(sheet,X0,TOP);g.drawImage(tire,AX-60,BOT-22,120,40);
      K.pa(X0,BOT,X1-X0,3,'#000',.35);
      // the chrome trim, kinked wherever a dent still pushes on it: knock them out and it runs straight
      for(let x=X0+30;x<X1-4;x++){let off=0;for(const d of DENTS)if(d.d>0)off+=d.d*(d.ding?2:7)*Math.exp(-((x-d.x)**2)/(2*(d.r*1.7)**2))*(d.y<TRIM?-1:1)*Math.exp(-Math.abs(d.y-TRIM)/40);
        const y=Math.round(TRIM+off);K.px(x,y,1,1,CA_P.iron[7]);K.px(x,y+1,1,1,CA_P.iron[5]);K.px(x,y+2,1,1,CA_P.iron[2]);}
      for(const d of DENTS){if(d.d>0){const r=d.r*(.55+.45*d.d),ry=r*.72;
          // a dent is a hollow: its upper-left wall falls into shade, its lower-right wall catches the light
          for(let y=-Math.ceil(ry)-1;y<=ry+1;y++)for(let x=-Math.ceil(r)-1;x<=r+1;x++){const e=(x/r)**2+(y/ry)**2;if(e>1.18)continue;const s=(x+y)/(r+ry);
              let k=e>1?(s<0?5.6:3):4.2+s*3.4*d.d-(e<.3?.9*d.d:0);if(e>.82&&e<=1)k+=s>0?1.4*d.d:-1.2*d.d;K.px(d.x+x,d.y+y,1,1,crT(CRP.RED,k));}
          if(!d.ding){for(let i=-2;i<=2;i++)K.px(d.x-Math.round(r*.6)+i,d.y-Math.round(ry*.6)-i*.3,1,1,CRP.RED[1]);}
          if(DENTS.indexOf(d)===DENTS.findIndex(q=>q.d>0))K.pa(d.x-1,d.y-1,3,3,'#ffd27a',.2+Math.sin(t*6)*.15);}
        if(d.pop>0){const u=1-d.pop/.35;for(let i=0;i<10;i++){const a=i/10*6.283;K.pa(d.x+Math.cos(a)*(4+u*d.r),d.y+Math.sin(a)*(3+u*d.r*.7),2,2,'#fff4c0',d.pop*2.4);}}}
      const px=st.sw>0?st.hx:st.x,py=st.sw>0?st.hy:st.y;const PVX=px+44,PVY=py-1;M4.rot(g,ham,PVX,PVY,st.ang,44,8);
      const [gx,gy]=M4.tr(PVX,PVY,st.ang,0,0);m4sleeve(K,gx+3,gy,gx+40,gy+34);m4hand(K,gx,gy);
      if(st.sw===0&&!st.end){K.pa(st.x-1,st.y-5,2,3,'#fff4c0',.6);K.pa(st.x-5,st.y-1,3,2,'#fff4c0',.6);K.pa(st.x+3,st.y-1,3,2,'#fff4c0',.6);K.pa(st.x-1,st.y+3,2,3,'#fff4c0',.6);}},
    hud(t){const n=DENTS.filter(d=>!d.ding).length,left=live().length;K.label('DENTS LEFT '+left,30,16,'#f4ecd8','l');if(st.miss)K.label('NEW DINGS '+st.miss,30,26,'#e8b030','l');
      K.meter(1-left/Math.max(1,DENTS.length),st.res.length?M4.avg(st.res):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const d=live()[0];if(d){m4move(a,d.x+(Math.random()-.5)*2,d.y+(Math.random()-.5)*2);this._w=(this._w||0)-dt;if(this._w<=0&&st.sw===0&&Math.hypot(st.x-d.x,st.y-d.y)<3){m4tap(a);this._w=.45;}}
      AP.I=a;AP.hand=[a.x+6,a.y+6];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE RADIATOR, 1: the fan belt over the pulleys, then tension
S4.crBelt=(sp,K)=>{const g=K.g;const A_={x:150,y:130,r:22},B_={x:150,y:62,r:16},C0={x:230,y:90,r:11};
  const block=M4.pre('crblock2',320,180,k=>{crBay(k,320,180,11,{cover:[30,10,260,22],hose:[10,150,90,170],bolts:[[70,60],[236,60],[64,160],[250,160]]});
      // the timing cover: a rounded plate behind the pulleys, lit along its upper-left edge
      for(let y=36;y<170;y++)for(let x=96;x<214;x++){const dx=(x-150)/58,dy=(y-100)/66;const e=dx*dx+dy*dy;if(e>1)continue;let v=3.2-(dy*.8+dx*.5);if(e>.86)v+=(dx+dy<0?2:-1.2);k.px(x,y,1,1,crT(CA_P.iron,v));}
      for(const [x,y] of [[112,60],[188,60],[104,104],[196,104],[118,150],[182,150]])crNutK(k,x,y,2);},false);
  const st={t:0,ph:'fit',L:{x:196,y:126},grab:0,ten:0,tq:0,res:[],miss:0,end:0,flap:0,snap:0,alt:C0.x};
  const C=()=>({x:st.alt,y:C0.y,r:C0.r});
  const tan=(p,q,side)=>{const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy),th=Math.atan2(dy,dx),b=Math.acos(M4.cl((p.r-q.r)/d,-1,1))*side;return [[p.x+p.r*Math.cos(th+b),p.y+p.r*Math.sin(th+b)],[q.x+q.r*Math.cos(th+b),q.y+q.r*Math.sin(th+b)],th+b];};
  // the belt round a list of pulleys, going clockwise
  const belt=(cs,c)=>{const pts=[];for(let i=0;i<cs.length;i++){const p=cs[i],q=cs[(i+1)%cs.length];const [a,b,ang]=tan(p,q,-1);pts.push({a,b,ang,p,q});}
    for(let i=0;i<pts.length;i++){const s=pts[i];K.line(s.a[0],s.a[1],s.b[0],s.b[1],c[1],3);K.line(s.a[0],s.a[1]-1,s.b[0],s.b[1]-1,c[3],1);
      const nx=pts[(i+1)%pts.length],q=s.q;if(q.r>0){let a0=s.ang,a1=nx.ang;while(a1<a0)a1+=Math.PI*2;crArc(K,q.x,q.y,q.r+1,a0,a1,3,c[2]);}}};
  const fitted=()=>st.ph!=='fit';
  return {title:sp.t||'Loop the fan belt',how:'Drag the slack of the belt out round the far side of the small pulley and let go on it. Then hold to lever the alternator out until the belt is tight, and let go in the green.',hint:'Drag the belt round the small pulley. Then hold, and let go in the green.',st,
    update(dt,I){st.t+=dt;if(st.snap>0)st.snap-=dt;if(st.flap>0)st.flap-=dt;
      if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.miss*.08,.05,1);}return;}
      const c=C();
      if(st.ph==='fit'){const near=Math.hypot(I.x-st.L.x,I.y-st.L.y)<14;
        if(I.pressed)st.grab=1;
        if(st.grab&&I.down){st.L.x+=(I.x-st.L.x)*Math.min(1,dt*20);st.L.y+=(I.y-st.L.y)*Math.min(1,dt*20);}
        if(st.grab&&(I.released||!I.down)){st.grab=0;const tx=c.x+c.r+2,ty=c.y;const e=Math.hypot(st.L.x-tx,st.L.y-ty);
          if(e<8&&st.L.x>c.x){st.ph='ten';st.res.push(e<3?1:e<5.5?.8:.6);K.judge(st.res[0],c.x,c.y-24,true);MS.thunk();A.tone(180,.12,'sine',.05);}
          else if(Math.hypot(st.L.x-196,st.L.y-126)>6){st.miss++;st.flap=.5;A.tone(160,.18,'sawtooth',.05,{slide:80});K.judge(.1,st.L.x,st.L.y-14,true);st.L={x:196,y:126};}}}
      else if(st.ph==='ten'){if(I.down){st.ten=Math.min(1.15,st.ten+dt*.55);st.alt=C0.x+st.ten*9;A.tone&&Math.random()<dt*14&&A.tone(90+st.ten*60,.03,'square',.012);}
        else if(st.ten>.05){const lo=.62,hi=.84,mid=(lo+hi)/2;const q=st.ten>1.02?.15:st.ten>=lo&&st.ten<=hi?(1-Math.abs(st.ten-mid)/(hi-mid)>.55?1:.75):st.ten<lo?Math.max(.2,st.ten/lo*.55):.35;
          st.res.push(q);K.judge(q,c.x,c.y-26,true);if(q>=.6){MS.good();A.tone(520,.06,'triangle',.05);}else MS.miss();st.end=.001;st.ph='done';}}},
    draw(t){g.drawImage(block,0,0);
      // the fan behind the water pump pulley: four blades in shade, each lit along its leading edge
      for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;for(let r=17;r<42;r++){const w=Math.round(4+r*.2);const x=B_.x+Math.cos(a)*r,y=B_.y+Math.sin(a)*r*.9;K.px(x-w/2,y-w/2,w,w,CA_P.iron[2]);K.px(x-w/2,y-w/2,w,1,CA_P.iron[4]);}}
      crDisc(K,B_.x,B_.y,B_.r,CA_P.iron,5);crDisc(K,A_.x,A_.y,A_.r,CA_P.iron,7);const c=C();
      // the alternator: a finned can on its slotted bracket
      K.px(C0.x-6,C0.y+8,30,5,CA_P.iron[2]);K.px(C0.x-6,C0.y+8,30,1,CA_P.iron[5]);K.px(C0.x+2,C0.y+9,16,2,'#0a0a0c');
      for(let y=-16;y<=16;y++){const w=Math.round(Math.sqrt(256-y*y));K.px(c.x+4,c.y+y,w+6,1,crT(CA_P.iron,4.4-y/12));}for(let y=-12;y<=12;y+=4)K.px(c.x+8,c.y+y,12,1,CA_P.iron[2]);
      crDisc(K,c.x,c.y,c.r,CA_P.iron,3);
      for(const p of [A_,B_,c]){crArc(K,p.x,p.y,p.r-2,0,Math.PI*2,1,CA_P.iron[1]);K.px(p.x-1,p.y-1,3,3,CA_P.iron[1]);K.px(p.x-1,p.y-1,1,1,CA_P.iron[6]);}
      const RB=[CRP.RUB[0],CRP.RUB[1],CRP.RUB[3],CRP.RUB[5]];
      if(fitted())belt([B_,c,A_],RB);
      else{const L={x:st.L.x,y:st.L.y+(st.flap>0?Math.sin(st.flap*40)*3:0),r:0};belt([B_,L,A_],RB);
        // where it goes: a faint ghost of the belt round the small pulley, and a grip mark on the slack
        if(!st.grab){g.globalAlpha=.25+Math.sin(t*5)*.1;crArc(K,c.x,c.y,c.r+2,-Math.PI/2,Math.PI/2,1,'#9be07a');g.globalAlpha=1;}
        m4hand(K,st.L.x+4,st.L.y+6);}
      if(st.ph==='ten'||st.ph==='done'){// the pry bar against the alternator
        K.line(c.x+20,c.y+2,c.x+46,c.y+48,CA_P.iron[5],3);K.line(c.x+20,c.y+1,c.x+46,c.y+47,CA_P.iron[7],1);m4hand(K,c.x+44,c.y+44);
        if(st.ten>.3){const sag=Math.max(0,(.7-st.ten))*8;K.pa(B_.x+30,(B_.y+c.y)/2+sag,2,2,'#fff4c0',.0);}}},
    hud(t){if(st.ph==='ten'||st.ph==='done'){K.label('TENSION',236,22,'#f4ecd8','r');K.gauge(240,22,60,6,.62/1.15,.84/1.15,st.ten/1.15);}
      else K.label('BELT ON',30,16,'#f4ecd8','l');K.meter(st.ph==='fit'?0:st.ph==='ten'?.5+st.ten*.4:1,st.res.length?M4.avg(st.res):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const c=C();
      if(st.ph==='fit'){this._p=(this._p||0)+dt;if(this._p<.5){m4move(a,st.L.x,st.L.y);}else{m4hold(a,true);const tx=c.x+c.r+2,ty=c.y;const u=Math.min(1,(this._p-.5)/1.2);const mx=196+(tx-196)*u+Math.sin(u*Math.PI)*20,my=126+(ty-126)*u;m4move(a,mx,my);if(u>=1)m4hold(a,false);}}
      else if(st.ph==='ten'){m4hold(a,st.ten<.72);}AP.I=a;AP.hand=[a.x+4,a.y+6];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE RADIATOR, 2: turn each hose clamp's screw until it bites
S4.crClamps=(sp,K)=>{const g=K.g,HY=104,HR=13;const CL=[{x:128,tq:0,done:0},{x:224,tq:0,done:0}];
  const bay=M4.pre('crclampbay',320,180,k=>{crBay(k,320,180,17,{cover:[150,12,160,24],loom:[110,160,310,150],bolts:[[180,150],[300,60]]});},false);
  const rad=M4.pre('crradiator',90,140,k=>{const I=CA_P.iron;for(let y=0;y<140;y++)for(let x=0;x<90;x++){let v=x%3===0?2:3.6-(y/140)*.8;if(y<18||y>126)v=4.6-(y<18?0:1.5)-(x/90)*.6;k.px(x,y,1,1,crT(I,v));}k.px(0,0,90,1,I[7]);k.px(0,18,90,1,I[2]);k.px(0,126,90,1,I[6]);
      k.px(84,26,6,14,I[5]);k.px(84,26,6,1,I[7]);},false);
  const st={t:0,i:0,res:[],end:0,spray:0,turn:0};
  const hose=(K,x0,x1)=>{for(let x=x0;x<x1;x++){const wob=Math.sin(x*.05)*1.5;for(let y=-HR;y<=HR;y++){const u=y/HR;let k=3.4-u*1.6;if(Math.abs(u)>.86)k=1;K.px(x,HY+wob+y,1,1,crT(CRP.RUB,k));}}};
  const LO=.66,HI=.86;
  return {title:sp.t||'Clamp the hoses',how:'Hold to turn the screw: the clamp band closes round the hose. Let go when the needle is in the green. Keep going and it cuts the hose.',hint:'Hold to turn. Let go in the green.',st,
    update(dt,I){st.t+=dt;if(st.spray>0)st.spray-=dt;
      if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.cl(M4.avg(st.res),.05,1);}return;}
      const c=CL[st.i];if(!c)return;
      if(I.down){const rate=c.tq<.5?.7:.42;c.tq=Math.min(1.2,c.tq+dt*rate);st.turn+=dt*9;if(Math.random()<dt*10)A.tone(1400+c.tq*600,.02,'square',.01);if(c.tq>1.02&&!c.cut){c.cut=1;st.spray=.8;A.hiss(.5,.12,'highpass',2400);}}
      else if(c.tq>.05&&!c.done){c.done=1;const mid=(LO+HI)/2;const q=c.cut?.12:c.tq>=LO&&c.tq<=HI?(1-Math.abs(c.tq-mid)/(HI-mid)>.5?1:.75):c.tq<LO?Math.max(.15,c.tq/LO*.5):.4;
        st.res.push(q);K.judge(q,c.x,HY-44,true);if(q>=.6){MS.good();A.tone(700,.05,'triangle',.05);}else MS.miss();
        if(st.i<CL.length-1)setTimeout(()=>{st.i++;},380);else st.end=.001;}},
    draw(t){g.drawImage(bay,0,0);g.drawImage(rad,12,22);hose(K,98,250);
      // the thermostat housing on the engine side
      K.px(250,HY-16,40,32,CA_P.iron[3]);K.px(250,HY-16,40,1,CA_P.iron[6]);K.px(250,HY+15,40,1,CA_P.iron[1]);K.px(248,HY-12,4,24,CA_P.iron[5]);
      K.px(96,HY-12,4,24,CA_P.iron[5]);
      for(const c of CL){const close=Math.min(1,c.tq);const bw=5,gap=Math.round((1-close)*3);
        // the band round the hose, the hose squeezed a little where it bites
        for(let y=-HR-1+gap;y<=HR+1-gap;y++)K.px(c.x-3,HY+y,bw+2,1,crT(CA_P.iron,5.6-(y/HR)*1.8));K.px(c.x-3,HY-HR-1+gap,bw+2,1,CA_P.iron[7]);for(let y=-HR+2;y<HR;y+=3)K.px(c.x-1,HY+y,3,1,CA_P.iron[3]);
        // the screw housing on top, the slotted screw head
        K.px(c.x-6,HY-HR-9+gap,13,8,CA_P.iron[4]);K.px(c.x-6,HY-HR-9+gap,13,1,CA_P.iron[6]);K.px(c.x-6,HY-HR-2+gap,13,1,CA_P.iron[2]);
        const sa=c===CL[st.i]?st.turn:0;crDisc(K,c.x,HY-HR-12+gap,3,CA_P.iron);K.line(c.x-Math.cos(sa)*2,HY-HR-12+gap-Math.sin(sa)*1,c.x+Math.cos(sa)*2,HY-HR-12+gap+Math.sin(sa)*1,CA_P.iron[1],1);
        if(c.cut){K.px(c.x-6,HY+2,12,2,'#1a0a08');}}
      {const c=CL[Math.min(st.i,CL.length-1)];if(!c.done){const gap=Math.round((1-Math.min(1,c.tq))*3),dx=c.x,dy=HY-HR-12+gap,R=12;
          // the dial painted round the screw: a dark track, the green where it bites, a needle that follows the turns
          for(let a=Math.PI;a<=Math.PI*2;a+=.04){const u=(a-Math.PI)/Math.PI,on=u>=LO/1.2&&u<=HI/1.2;K.px(dx+Math.cos(a)*R-1,dy+Math.sin(a)*R-1,2,2,on?'#7cc04a':'#1a0e06');}
          const na=Math.PI+Math.min(1.2,c.tq)/1.2*Math.PI;K.line(dx+Math.cos(na)*6,dy+Math.sin(na)*6,dx+Math.cos(na)*(R+3),dy+Math.sin(na)*(R+3),'#fff4c0',1);}}
      if(st.spray>0){const c=CL[st.i];K.emit(c.x+4,HY-4,2,{c:['#9ad0b0','#58a090'],v:60,ang:-1.2,spread:1.2,g:200,life:.5});}
      // the screwdriver on the screw being turned, yellow handle stripes rolling as it turns
      const c=CL[Math.min(st.i,CL.length-1)];const gap=Math.round((1-Math.min(1,c.tq))*3),sx=c.x,sy=HY-HR-14+gap;
      K.px(sx-1,sy-24,3,24,CA_P.iron[5]);K.px(sx-1,sy-24,1,24,CA_P.iron[7]);K.px(sx-2,sy-2,5,2,CA_P.iron[3]);
      for(let y=0;y<22;y++){const u=y/22,hw=y<3||y>19?4:5;for(let x=-hw;x<=hw;x++){const s=Math.floor((x+st.turn*3)%4+4)%4;K.px(sx+x,sy-46+y,1,1,crT(CRP.YEL,(s<2?4.2:2.8)-x*.15+(u<.12?1:0)-(u>.88?1:0)));}}
      K.px(sx-5,sy-47,11,1,CRP.YEL[5]);m4hand(K,sx+9,sy-34);},
    hud(t){const c=CL[Math.min(st.i,CL.length-1)];K.label('CLAMP '+(Math.min(st.i,CL.length-1)+1)+'/'+CL.length,30,16,'#f4ecd8','l');
      K.meter((st.i+(c.done?1:c.tq*.8))/CL.length,st.res.length?M4.avg(st.res):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const c=CL[st.i];if(c&&!c.done){this._w=(this._w||0)+dt;if(this._w>.4)m4hold(a,c.tq<(LO+HI)/2-.02);}else{this._w=0;m4hold(a,false);}
      AP.I=a;const k=CL[Math.min(st.i,CL.length-1)];AP.hand=[k.x+4,HY-60];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE WHEEL, 1: hang it on the hub with the holes on the studs
S4.crHang=(sp,K)=>{const g=K.g,HX=200,HY=94,SR=13,TR=44;
  const arch=M4.pre('crarch',320,70,k=>{crSheet(k,320,70,CRP.RED,21,true);for(let y=0;y<70;y++)for(let x=0;x<320;x++){const d=Math.hypot(x-HX,y-110);if(d<66)k.g.clearRect(x,y,1,1);else if(d<69)k.px(x,y,1,1,CRP.RED[d<67?1:6]);}},false);
  const wheelImg=M4.pre('crwheel',96,96,k=>{crRing(k,48,48,30,TR,CRP.RUB);for(let a=0;a<40;a++){const an=a/40*Math.PI*2;k.px(48+Math.cos(an)*(TR-3),48+Math.sin(an)*(TR-3),2,2,CRP.RUB[0]);}
      crDisc(k,48,48,29,CA_P.iron,9);crArc(k,48,48,23,0,Math.PI*2,1,CA_P.iron[2]);k.g.clearRect(43,43,10,10);crArc(k,48,48,6,0,Math.PI*2,1,CA_P.iron[6]);
      // five bolt holes cut right through, each with a pressed rim lit on its lower-right inner edge (it's a hollow) and its upper-left outer lip
      for(let i=0;i<5;i++){const an=-Math.PI/2+i*Math.PI*2/5;const cx=48+Math.cos(an)*SR,cy=48+Math.sin(an)*SR;
        for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const d=Math.hypot(x,y);if(d<=3.6)k.g.clearRect(Math.round(cx+x),Math.round(cy+y),1,1);else if(d<=5.4){const s=(x+y)/d;k.px(Math.round(cx+x),Math.round(cy+y),1,1,CA_P.iron[d<4.6?(s>0?6:2):(s<0?6:3)]);}}}},false);
  const st={t:0,x:72,y:118,vx:0,vy:0,ang:.5,av:0,res:[],miss:0,end:0,on:0,held:0,drop:0};
  const align=()=>{const s=Math.PI*2/5;let d=((st.ang%s)+s)%s;if(d>s/2)d-=s;return Math.abs(d);};
  return {title:sp.t||'Hang the wheel',how:'Drag the wheel onto the hub. It turns as it hangs: let go when the holes sit over the studs (they glow green).',hint:'Drag it on. Let go when the studs glow green.',st,
    update(dt,I){st.t+=dt;if(st.drop>0)st.drop-=dt;
      if(st.end){st.end+=dt;st.x+=(HX-st.x)*Math.min(1,dt*12);st.y+=(HY-st.y)*Math.min(1,dt*12);if(st.end>.8){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.miss*.1,.05,1);}return;}
      if(I.pressed&&Math.hypot(I.x-st.x,I.y-st.y)<TR+8)st.held=1;
      if(st.held&&I.down){crHold(st,I,dt,60);}else{st.vx*=.8;st.vy+=dt*300;st.x+=st.vx*dt;st.y=Math.min(118,st.y+st.vy*dt);if(st.y>=118)st.vy=0;}
      // a wheel held by its tread turns as it swings
      st.av+=(-st.vx*.0028-st.av*1.6)*dt*6+Math.sin(st.t*1.3)*dt*.25;st.ang+=st.av*dt*4+Math.sin(st.t*1.1)*dt*.12;
      if(st.held&&(I.released||!I.down)){st.held=0;const d=Math.hypot(st.x-HX,st.y-HY),al=align();
        if(d<10&&al<.11){st.res.push(al<.05&&d<5?1:.75);K.judge(st.res[st.res.length-1],HX,HY-56,true);MS.thunk();A.tone(150,.15,'sine',.06);st.end=.001;st.on=1;}
        else if(d<22){st.miss++;st.res.push(.2);K.judge(.1,HX,HY-56,true);A.tone(220,.12,'square',.05,{filter:['lowpass',900]});MS.knock();K.shk=.12;st.drop=.4;}}},
    draw(t){g.drawImage(arch,0,0);K.pa(0,70,320,4,'#000',.3);
      // the brake disc, the hub and its five studs
      crDisc(K,HX,HY,30,CA_P.iron,12);crArc(K,HX,HY,24,0,Math.PI*2,1,CA_P.iron[3]);crDisc(K,HX,HY,11,CA_P.iron);
      const al=align(),near=Math.hypot(st.x-HX,st.y-HY)<14,ok=near&&al<.11;
      for(let i=0;i<5;i++){const an=-Math.PI/2+i*Math.PI*2/5;const x=Math.round(HX+Math.cos(an)*SR),y=Math.round(HY+Math.sin(an)*SR);
        K.pa(x-1,y-1,5,5,'#000',.45);   // its shadow on the hub, down and right
        for(let j=0;j<5;j++){K.px(x-2,y-4+j,3,1,(j%2)?CA_P.iron[4]:CA_P.iron[5]);K.px(x-2,y-4+j,1,1,CA_P.iron[6]);}   // the threaded post
        K.px(x-2,y-5,3,1,ok?'#9be07a':CA_P.iron[7]);if(ok)K.px(x-2,y-4,1,4,'#9be07a');}
      K.pa(st.x-36,Math.min(150,st.y+TR-4),72,6,'#000',.35);
      M4.rot(g,wheelImg,st.x,st.y,st.ang,48,48);
      // the wheel's bolt holes warm to green as they come round over the studs
      {const near2=Math.hypot(st.x-HX,st.y-HY)<26,w=Math.max(0,1-al/.25);if(near2&&!st.on)for(let i=0;i<5;i++){const an=-Math.PI/2+i*Math.PI*2/5+st.ang;const x=st.x+Math.cos(an)*SR,y=st.y+Math.sin(an)*SR;g.globalAlpha=.3+w*.6;crArc(K,x,y,6,0,Math.PI*2,1,ok?'#9be07a':'#e8c060');g.globalAlpha=1;}}
      if(!st.on){m4palm(K,st.x-TR+4,st.y-4,true);m4palm(K,st.x+TR-4,st.y-4);}
      if(ok&&!st.on)K.pa(HX-2,HY-2,5,5,'#9be07a',.3+Math.sin(t*10)*.2);},
    hud(t){K.label('LINE UP THE STUDS',30,16,'#f4ecd8','l');K.meter(st.on?1:Math.max(0,1-Math.hypot(st.x-HX,st.y-HY)/140)*.8,st.res.length?M4.avg(st.res):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);this._p=(this._p||0)+dt;
      if(this._p<.4)m4move(a,st.x,st.y);else{m4hold(a,true);const u=Math.min(1,(this._p-.4)/1.4);m4move(a,72+(HX-72)*u,118+(HY-118)*u-Math.sin(u*Math.PI)*14);if(u>=1&&align()<.045&&Math.hypot(st.x-HX,st.y-HY)<3)m4hold(a,false);}
      AP.I=a;AP.hand=[a.x+6,a.y-30];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE WHEEL, 2: the lug nuts, in a star, each to its torque
S4.crLugs=(sp,K)=>{const g=K.g,CX=172,CY=94,R=24,ORDER=[0,2,4,1,3];
  const wheel=M4.pre('crwheelbig',150,150,k=>{crRing(k,75,75,48,70,CRP.RUB);for(let a=0;a<60;a++){const an=a/60*Math.PI*2;k.px(75+Math.cos(an)*66,75+Math.sin(an)*66,2,2,CRP.RUB[0]);}
      crDisc(k,75,75,47,CA_P.iron,14);crArc(k,75,75,38,0,Math.PI*2,1,CA_P.iron[2]);for(let i=0;i<8;i++){const an=i*Math.PI/4+.2;k.px(75+Math.cos(an)*31-2,75+Math.sin(an)*31-2,5,4,CA_P.iron[1]);}
      crDisc(k,75,75,11,CA_P.iron);k.px(72,72,6,6,'#0a0a0c');},false);
  const NUT=[0,1,2,3,4].map(i=>{const an=-Math.PI/2+i*Math.PI*2/5;return {i,x:Math.round(CX+Math.cos(an)*R),y:Math.round(CY+Math.sin(an)*R),tq:0,done:0,rot:0};});
  const st={t:0,sel:-1,seq:[],res:[],end:0,crook:0,lean:0};
  const LO=.64,HI=.84;
  const want=()=>{if(!st.seq.length)return null;const first=st.seq[0];return (first+ORDER[st.seq.length])%5;};
  return {title:sp.t||'Lug nuts, in a star',how:(K.fine?'Click':'Tap')+' a nut, hold to pull the wrench, let go in the green. Go round in a star: each nut, then the one across from it (the card shows the order).',hint:'Star order: across, not round. Hold, let go in the green.',st,
    update(dt,I){st.t+=dt;st.lean+=((st.crook?.035*st.crook:0)-st.lean)*Math.min(1,dt*4);
      if(st.end){st.end+=dt;if(st.end>.8){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.crook*.12,.05,1);}return;}
      if(st.sel<0){if(I.pressed){let best=null,bd=14;for(const n of NUT){if(n.done)continue;const d=Math.hypot(I.x-n.x,I.y-n.y);if(d<bd){bd=d;best=n;}}
          if(best){st.sel=best.i;const w=want();if(w!=null&&w!==best.i){st.crook++;A.tone(240,.2,'square',.04,{slide:180,filter:['lowpass',1200]});toast&&0;}st.hold=1;}}}
      else{const n=NUT[st.sel];if(I.down&&st.hold){n.tq=Math.min(1.2,n.tq+dt*(n.tq<.5?.8:.5));n.rot+=dt*4*(1.2-n.tq);if(Math.random()<dt*8)A.tone(900+n.tq*500,.02,'square',.012);if(n.tq>=.98&&!n.clk){n.clk=1;A.tone(2200,.03,'square',.03);}}
        else if(n.tq>.05){const mid=(LO+HI)/2;const q=n.tq>1.05?.3:n.tq>=LO&&n.tq<=HI?(1-Math.abs(n.tq-mid)/(HI-mid)>.5?1:.78):n.tq<LO?Math.max(.15,n.tq/LO*.55):.5;
          n.done=1;st.seq.push(n.i);st.res.push(q);K.judge(q,n.x,n.y-18,true);if(q>=.6){MS.good();MS.knock();}else MS.miss();st.sel=-1;st.hold=0;if(st.seq.length>=5)st.end=.001;}
        else if(!I.down){st.sel=-1;st.hold=0;}}},
    draw(t){const lx=Math.round(st.lean*40);g.drawImage(wheel,CX-75+lx,CY-75);
      for(const n of NUT){const x=n.x+lx,y=n.y;K.pa(x-4,y-3,9,9,'#000',.35);crNut(K,x,y,4,CA_P.iron,n.rot);if(n.done){K.px(x-1,y+5,3,1,n.tq>1.05?'#e8542a':'#9be07a');}}
      // the first nut is yours to pick; after that the card is the only help
      if(!st.seq.length&&st.sel<0){const n=NUT[0];K.pa(n.x-6,n.y-6,13,13,'#ffd27a',.18+Math.sin(t*6)*.1);}
      if(st.sel>=0){const n=NUT[st.sel];const a=-.6-n.tq*.5;const ex=n.x+lx+Math.cos(a)*46,ey=n.y+Math.sin(a)*46;
        K.line(n.x+lx,n.y,ex,ey,CA_P.iron[3],4);K.line(n.x+lx,n.y-1,ex,ey-1,CA_P.iron[6],1);const px_=-Math.sin(a)*12,py_=Math.cos(a)*12,mx=n.x+lx+Math.cos(a)*30,my=n.y+Math.sin(a)*30;K.line(mx-px_,my-py_,mx+px_,my+py_,CA_P.iron[3],4);K.line(mx-px_,my-py_-1,mx+px_,my+py_-1,CA_P.iron[6],1);
        K.px(n.x+lx-5,n.y-5,11,11,CA_P.iron[2]);K.px(n.x+lx-4,n.y-4,9,9,CA_P.iron[4]);K.px(n.x+lx-4,n.y-4,9,1,CA_P.iron[6]);m4hand(K,ex,ey);
        // the torque arc round the nut: green where it clicks, a tick that sweeps as you pull
        const R=16,cx=n.x+lx,cy=n.y;for(let a=Math.PI*.75;a<=Math.PI*2.25;a+=.035){const u=(a-Math.PI*.75)/(Math.PI*1.5),on=u>=LO/1.2&&u<=HI/1.2;K.px(cx+Math.cos(a)*R-1,cy+Math.sin(a)*R-1,2,2,on?'#7cc04a':'#1a0e06');}
        const ta=Math.PI*.75+Math.min(1.2,n.tq)/1.2*Math.PI*1.5;K.px(cx+Math.cos(ta)*R-2,cy+Math.sin(ta)*R-2,4,4,'#fff4c0');}
      // the order card: a little star
      K.px(12,30,52,52,'#2a1608');K.px(13,31,50,50,'#e8d8b0');K.px(13,31,50,1,'#fff6dc');
      const P5=[0,1,2,3,4].map(i=>{const an=-Math.PI/2+i*Math.PI*2/5;return [38+Math.cos(an)*18,57+Math.sin(an)*18];});
      for(let k=0;k<5;k++){const a=P5[(k*2)%5],b=P5[(k*2+2)%5];K.line(a[0],a[1],b[0],b[1],'#a07040',1);}
      for(let k=0;k<5;k++){const p=P5[ORDER[k]];K.px(p[0]-3,p[1]-3,7,7,'#5a3a18');K.text(String(k+1),p[0],p[1]-2,'#fff6dc');}},
    hud(t){const n=st.sel>=0?NUT[st.sel]:null;K.label('NUT '+Math.min(5,st.seq.length+1)+'/5',70,16,'#f4ecd8','l');if(st.crook)K.label('NOT A STAR',70,26,'#e8b030','l');
      K.meter(st.seq.length/5,st.res.length?M4.avg(st.res):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.seq.length>=5){AP.I=a;return;}if(st.sel<0){const w=st.seq.length?want():0;const n=NUT[w];m4move(a,n.x,n.y);this._w=(this._w||0)+dt;if(this._w>.5){m4hold(a,true);this._w=0;}}
      else{const n=NUT[st.sel];m4hold(a,n.tq<(LO+HI)/2);}AP.I=a;AP.hand=[a.x+6,a.y+6];AP.press=a.down;},
    stop(){}};};
// the windshield opening, shared by the glass and the seal
const CR_WIN={tl:[96,44],tr:[224,44],br:[248,120],bl:[72,120]};
function crWinFrame(K,t,glass){const g=K.g;
  const body=M4.pre('crwinbody',320,180,k=>{crSheet(k,320,180,CRP.RED,33,false);
      // the opening, and the cab inside: dark, a dash, the wheel's top, a seat back
      const inside=(x,y)=>{const u=(y-44)/76;if(u<0||u>1)return false;const l=96+(72-96)*u,r=224+(248-224)*u;return x>=l&&x<=r;};
      for(let y=0;y<180;y++)for(let x=0;x<320;x++){if(inside(x,y)){const u=(y-44)/76;k.px(x,y,1,1,u>.72?'#1a1416':u>.7?'#3a2c2a':'#0c0c12');}
        else{const u=(y-40)/86;const l=92+(68-92)*u,r=228+(252-228)*u;if(y>=40&&y<=124&&x>=l-1&&x<=r+1&&!inside(x,y))k.px(x,y,1,1,'#14141a');}}
      for(let x=140;x<180;x++)for(let y=100;y<112;y++){const d=Math.hypot((x-160)/20,(y-112)/12);if(d>.85&&d<1)k.px(x,y,1,1,'#2a2a30');}
      for(let y=58;y<92;y++)k.px(196,y,10,1,'#141018');
      // the hood below, lit along its leading edge; the roof above
      for(let x=0;x<320;x++)k.px(x,124,1,1,CRP.RED[7]);for(let x=0;x<320;x++){k.px(x,40,1,1,CRP.RED[2]);}},false);
  g.drawImage(body,0,0);}
// ================================================================= THE GLASS, 1: carry the new windshield in without knocking it
S4.crGlass=(sp,K)=>{const g=K.g;const W0=CR_WIN;
  const pane=M4.pre('crpane',182,80,k=>{const inside=(x,y)=>{const u=y/76;if(u<0||u>1)return false;const l=24+(0-24)*u,r=152+(176-152)*u;return x>=l+2&&x<=r+2;};
      for(let y=0;y<78;y++)for(let x=0;x<182;x++){if(!inside(x,y))continue;let v=2.4+(y/78)*.6;const s=(x-y*1.4);if(s>40&&s<58)v=4.2;if(s>64&&s<70)v=3.8;k.pa(x,y,1,1,crT(CRP.GL,v),.82);}
      for(let y=0;y<78;y++){const u=y/76;const l=Math.round(24-24*u)+2,r=Math.round(152+24*u)+2;k.px(l,y,1,1,CRP.GL[5]);k.px(r,y,1,1,CRP.GL[1]);}k.px(26,0,128,1,CRP.GL[5]);k.px(2,77,176,1,'#0a1214');},false);
  const st={t:0,x:248,y:130,vx:0,vy:0,ang:.18,held:0,knock:0,kc:0,res:[],end:0,set:0,chips:[]};
  const OX=72+90,OY=44+38;   // where the pane's centre sits when it is in
  const corners=()=>{const c=Math.cos(st.ang),s=Math.sin(st.ang);return [[-66,-38],[62,-38],[88,38],[-90,38]].map(([x,y])=>[st.x+x*c-y*s,st.y+x*s+y*c]);};
  return {title:sp.t||'Set the glass',how:'Drag the windshield up into the frame. Carry it slowly and level: knock a corner on the frame and it chips. Let go when it sits square in the opening.',hint:'Slow and level. Let go when it sits square.',st,
    update(dt,I){st.t+=dt;if(st.kc>0)st.kc-=dt;
      if(st.end){st.end+=dt;st.x+=(OX-st.x)*Math.min(1,dt*10);st.y+=(OY-st.y)*Math.min(1,dt*10);st.ang*=.8;if(st.end>.8){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.knock*.18,.05,1);}return;}
      if(I.pressed&&Math.abs(I.x-st.x)<90&&Math.abs(I.y-st.y)<42)st.held=1;
      if(st.held&&I.down){crHold(st,I,dt,40);}else{st.vx*=.85;st.vy*=.85;}
      st.ang+=((st.vx*.0016)-st.ang)*Math.min(1,dt*3);
      // a corner that swings into the frame's edge, moving, chips the glass
      const spd=Math.hypot(st.vx,st.vy);if(st.kc<=0&&spd>55){for(const [x,y] of corners()){const u=(y-44)/76;if(u<-.12||u>1.12)continue;const l=96+(72-96)*u,r=224+(248-224)*u;const out=x<l-2||x>r+2;const inBand=x>l-14&&x<r+14&&y>34&&y<130;
          if(out&&inBand){st.knock++;st.kc=.5;st.chips.push([x-st.x,y-st.y]);A.tone(1800,.05,'square',.04);A.tone(900,.12,'triangle',.03,{delay:.02});K.shk=.12;K.judge(.1,x,y-12,true);break;}}}
      if(st.held&&(I.released||!I.down)){st.held=0;const d=Math.hypot(st.x-OX,st.y-OY);if(d<6&&Math.abs(st.ang)<.05){const q=d<2.5?1:.8;st.res.push(q);K.judge(q,OX,OY-48,true);MS.thunk();st.end=.001;}}},
    draw(t){crWinFrame(K,t);const c=corners();
      // corner marks where it should sit, brighter as it nears
      const d=Math.hypot(st.x-OX,st.y-OY),ok=d<6&&Math.abs(st.ang)<.05;for(const [x,y] of [W0.tl,W0.tr,W0.br,W0.bl]){K.px(x-3,y-1,6,1,ok?'#9be07a':'#e8c060');K.px(x-1,y-3,1,6,ok?'#9be07a':'#e8c060');}
      K.pa(st.x-80,st.y+44,160,5,'#000',.25);M4.rot(g,pane,st.x,st.y,st.ang,90,38);
      for(const [cx,cy] of st.chips){const x=st.x+cx*Math.cos(st.ang)-cy*Math.sin(st.ang),y=st.y+cx*Math.sin(st.ang)+cy*Math.cos(st.ang);K.line(x,y,x+5,y-3,'#dff4f4',1);K.line(x,y,x+2,y+4,'#dff4f4',1);}
      // the suction cups, and your hands on them
      if(!st.end)for(const sx of [-34,34]){const x=st.x+sx*Math.cos(st.ang),y=st.y+sx*Math.sin(st.ang)-6;K.ell(x,y,7,4,CRP.RUB[3]);K.ell(x,y-1,5,2,CRP.RUB[5]);K.px(x-6,y-8,12,3,CA_P.iron[4]);K.px(x-6,y-8,12,1,CA_P.iron[6]);m4hand(K,x,y-6);}},
    hud(t){K.label('KNOCKS '+st.knock,30,16,st.knock?'#e8b030':'#f4ecd8','l');K.meter(Math.max(0,1-Math.hypot(st.x-OX,st.y-OY)/120),M4.cl(1-st.knock*.25,0,1));},
    auto(dt,AP){const a=m4ai(this,AP,dt);this._p=(this._p||0)+dt;if(this._p<.4)m4move(a,st.x,st.y);else{m4hold(a,true);const u=Math.min(1,(this._p-.4)/2.2),e=u*u*(3-2*u);m4move(a,248+(OX-248)*e,130+(OY-130)*e);if(u>=1&&Math.abs(st.ang)<.03&&Math.hypot(st.x-OX,st.y-OY)<2)m4hold(a,false);}
      AP.I=a;AP.hand=[a.x+6,a.y+6];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE GLASS, 2: run the seal round the edge, steady
S4.crSeal=(sp,K)=>{const g=K.g;const W0=CR_WIN,o=2;
  const PATH=[[W0.tl[0]-o,W0.tl[1]-o],[W0.tr[0]+o,W0.tr[1]-o],[W0.br[0]+o,W0.br[1]+o],[W0.bl[0]-o,W0.bl[1]+o],[W0.tl[0]-o,W0.tl[1]-o]];
  const L=m4len(PATH),N=90;const seg=Array(N).fill(0);const st={t:0,s:0,x:PATH[0][0],y:PATH[0][1],res:[],smear:0,end:0,blobs:[],lx:null,ly:null};
  return {title:sp.t||'Run the seal',how:'Hold and draw the bead of sealant round the edge of the glass, all the way round, at a steady pace. Off the seam it smears.',hint:'Hold and go round the seam. Steady, not fast.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;if(st.end>.6){st.done=true;const cov=seg.filter(v=>v>0).length/N;st.score=M4.cl(cov*M4.avg(seg.filter(v=>v>0))-st.smear*.02,.05,1);}return;}
      st.x+=(I.x-st.x)*Math.min(1,dt*25);st.y+=(I.y-st.y)*Math.min(1,dt*25);
      if(I.down){const [s,d]=m4near(PATH,st.x,st.y);const sp_=st.lx==null?0:Math.hypot(st.x-st.lx,st.y-st.ly)/Math.max(dt,.001);
        if(d<5){const i=Math.min(N-1,Math.floor(s/L*N));const q=sp_>170?.45:sp_<12?.6:1-Math.max(0,(sp_-110)/120);if(!seg[i])seg[i]=M4.cl(q,.3,1);if(sp_<12&&Math.random()<dt*3)st.blobs.push([st.x,st.y]);if(Math.random()<dt*12)A.hiss(.04,.02,'bandpass',600);}
        else if(d<16){if(Math.random()<dt*6){st.smear++;st.blobs.push([st.x,st.y]);}}
        st.lx=st.x;st.ly=st.y;}else{st.lx=null;}
      if(seg.filter(v=>v>0).length>=N*.97&&!st.end){st.end=.001;MS.good();}},
    draw(t){crWinFrame(K,t);
      // the glass in place
      for(let y=46;y<119;y++){const u=(y-44)/76;const l=Math.round(96-24*u)+2,r=Math.round(224+24*u)-2;g.globalAlpha=.55;K.px(l,y,r-l,1,crT(CRP.GL,2.6+((y*3)%40<4?1.4:0)));g.globalAlpha=1;}
      // the seam: dashed where it still needs sealant, a fat black bead where it has it
      for(let i=0;i<N;i++){const [x,y]=m4at(PATH,(i+.5)/N*L);if(seg[i]){K.px(x-1,y-1,3,3,'#0c0c0e');K.px(x-1,y-1,2,1,'#3a3a44');}else if((i+Math.floor(t*6))%3===0)K.px(x,y,1,1,'#e8c060');}
      for(const [x,y] of st.blobs)K.px(x-1,y-1,3,2,'#141416');
      const [sx,sy]=PATH[0];K.pa(sx-3,sy-3,7,7,'#9be07a',.25+Math.sin(t*5)*.15);
      // the caulk gun: a tube, the nozzle at your point
      const x=st.x,y=st.y;K.line(x,y,x+10,y-10,'#d8d0c0',2);K.px(x+9,y-22,24,12,CA_P.iron[4]);K.px(x+9,y-22,24,1,CA_P.iron[6]);K.px(x+12,y-20,18,8,'#c84a2a');K.px(x+12,y-20,18,1,'#e88060');K.px(x+30,y-12,3,12,CA_P.iron[3]);m4hand(K,x+30,y-2);},
    hud(t){const cov=seg.filter(v=>v>0).length/N;K.label('SEALED '+Math.round(cov*100)+'%',30,16,'#f4ecd8','l');if(st.smear)K.label('SMEARS '+st.smear,30,26,'#e8b030','l');K.meter(cov,seg.filter(v=>v>0).length?M4.avg(seg.filter(v=>v>0)):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);this._s=(this._s||0)+dt*70;const [x,y]=m4at(PATH,Math.min(L,this._s));m4move(a,x,y);m4hold(a,this._s<L+4);AP.I=a;AP.hand=[a.x+30,a.y-2];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE WIRING, 1: swing the battery into its tray
const crBatteryImg=sc=>M4.pre('crbatt'+sc,60*sc,44*sc,k=>{const B=CRP.RUB;const W=56*sc,H=34*sc,x0=2*sc,y0=8*sc;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){let v=y<4*sc?4.4:3-(y/H)*1.2-(x/W)*.4;if(y===4*sc)v=1;k.px(x0+x,y0+y,1,1,crT(B,v));}k.px(x0,y0,W,1,B[5]);
    k.px(x0+6*sc,y0+12*sc,W-12*sc,8*sc,'#c89a1c');k.px(x0+6*sc,y0+12*sc,W-12*sc,1,'#f6e08a');k.px(x0+6*sc,y0+19*sc,W-12*sc,1,'#6a4c0c');
    for(const [tx,col] of [[10*sc,'#c84a2a'],[W-14*sc,'#2a2a30']]){k.px(x0+tx,y0-5*sc,6*sc,6*sc,CA_P.iron[4]);k.px(x0+tx,y0-5*sc,6*sc,1,CA_P.iron[7]);k.px(x0+tx-1,y0-1,8*sc,2*sc,col);}},true);
const crBatt34=()=>M4.pre('crbatt34',64,62,k=>{const B=CRP.RUB;
    // the front face: black case, a yellow label band, lit along its top edge
    for(let y=20;y<58;y++)for(let x=4;x<58;x++){let v=2.6-(y-20)/38-(x-4)/120;k.px(x,y,1,1,crT(B,v));}k.px(4,20,54,1,B[5]);k.px(57,20,1,38,B[0]);
    k.px(10,32,42,10,'#c89a1c');k.px(10,32,42,1,'#f6e08a');k.px(10,41,42,1,'#6a4c0c');for(let x=14;x<48;x+=6)k.px(x,36,3,2,'#6a4c0c');
    // the top face, seen from above: lighter, with the two posts and their caps
    for(let y=8;y<20;y++)for(let x=8+(20-y)*.3;x<62-(20-y)*.3;x++)k.px(x,y,1,1,crT(B,4.4-(y-8)/14));k.px(8,8,54,1,B[5]);
    for(const [px,col,hi] of [[16,'#a82c18','#e05a3a'],[46,'#1a1a20','#5a5a66']]){k.px(px-4,9,9,7,col);k.px(px-4,9,9,1,hi);k.px(px-1,6,3,4,CA_P.iron[5]);k.px(px-1,6,3,1,CA_P.iron[7]);}
    k.px(14,14,5,1,'#f4ecd8');k.px(16,12,1,5,'#f4ecd8');k.px(44,14,5,1,'#f4ecd8');
    // the carry strap, arched over the top
    for(let i=0;i<=28;i++){const u=i/28,x=6+u*50,y=8-Math.sin(u*Math.PI)*8;k.px(x,y,2,2,'#2a2014');k.px(x,y,2,1,'#5a4a30');}},true);
S4.crBattery=(sp,K)=>{const g=K.g,TX=118,TY=112,img=crBatt34();
  const bay=M4.pre('crbay3',320,180,k=>{crBay(k,320,180,41,{cover:[184,64,124,30],loom:[150,30,316,46],hose:[190,120,316,150],bolts:[[30,40],[30,150],[190,160]]});
      for(let y=24;y<62;y++)for(let x=8;x<170;x++)k.px(x,y,1,1,crT(CA_P.iron,3.6-(y-24)/24+(y===24?2:0)));
      // the open steel tray in three-quarter view: dark inside with ribs, a lit lip all round, the front wall facing you
      const L=TX-38,R=TX+38,Tt=TY-26,Bb=TY+8;for(let y=Tt;y<Bb;y++)for(let x=L;x<R;x++){let v=.6+(y-Tt)/40;if((x-L)%9===0)v+=.6;k.px(x,y,1,1,crT(CA_P.iron,v));}
      for(let x=L-2;x<R+2;x++){k.px(x,Tt-2,1,2,CA_P.iron[x<TX?6:5]);}for(let y=Tt-2;y<Bb;y++){k.px(L-2,y,2,1,CA_P.iron[6]);k.px(R,y,2,1,CA_P.iron[3]);}
      for(let y=Bb;y<Bb+9;y++)for(let x=L-2;x<R+2;x++)k.px(x,y,1,1,crT(CA_P.iron,y===Bb?6.6:4.2-(y-Bb)*.3-(x-L)/160));k.px(L-2,Bb+9,R-L+4,2,'#08080a');
      // the hold-down bar and its two J-bolts, laid aside on the fender lip; the red cable end waiting at the tray's edge
      for(let x=0;x<52;x++){k.px(TX+46+x,TY+12,1,3,crT(CA_P.iron,x<2?7:5-x/52));}k.px(TX+46,TY+15,52,1,'#08080a');
      for(const by of [TY+20,TY+27]){const bx=TX+48;for(let x=0;x<18;x++)k.px(bx+x,by,1,2,CA_P.iron[x<1?7:5]);k.px(bx+18,by-4,2,6,CA_P.iron[5]);k.px(bx+16,by-5,3,1,CA_P.iron[6]);crNutK(k,bx-2,by+1,2);k.px(bx,by+2,20,1,'#08080a');}
      for(let i=0;i<=20;i++){const u=i/20,x=8+u*(L-14),y=78+Math.sin(u*Math.PI)*6;k.px(x,y,3,3,'#a82c18');k.px(x,y,3,1,'#e05a3a');}k.px(L-14,78,9,6,'#a82c18');k.px(L-14,78,9,1,'#e05a3a');k.px(L-11,80,3,2,CA_P.iron[1]);},false);
  const st={t:0,x:262,y:150,vx:0,vy:0,ang:0,held:0,res:[],knock:0,end:0,fall:0,lift:0};
  const GROUND=170;
  return {title:sp.t||'Drop the battery in',how:'Grab the battery by its strap and swing it over to the empty tray. It’s heavy: it lags and sways. Let go when it hangs square over the tray. Drop it on the engine and it clanks.',hint:'Heavy. Bring it over the tray, steady, then let go.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;st.y=Math.min(TY-4,st.y+dt*170);st.x+=(TX-st.x)*Math.min(1,dt*10);st.ang*=.8;if(st.end>.8){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.knock*.2,.05,1);}return;}
      if(st.fall){st.vy+=dt*500;st.y+=st.vy*dt;if(st.y>=st.fall){st.y=st.fall;st.vy=0;st.fall=0;MS.knock();A.tone(160,.1,'square',.05,{filter:['lowpass',800]});}return;}
      if(I.pressed&&Math.abs(I.x-st.x)<34&&I.y>st.y-70&&I.y<st.y+6)st.held=1;
      if(st.held&&I.down){crHold(st,{x:I.x,y:I.y+44},dt,14);st.y=Math.min(st.y,GROUND);}
      st.ang+=((-st.vx*.004)-st.ang)*Math.min(1,dt*2.5);
      if(st.held&&(I.released||!I.down)){st.held=0;const dx=Math.abs(st.x-TX);
        if(dx<9&&st.y<TY+2&&Math.abs(st.ang)<.12){const q=dx<3.5&&Math.abs(st.ang)<.05?1:.78;st.res.push(q);K.judge(q,TX-60,TY-50,true);MS.thunk();K.emit(TX,TY+4,10,{c:['#8a8070','#5a5248'],v:40,g:100,life:.6});st.end=.001;}
        else if(st.x>176&&st.y<150){st.knock++;st.res.push(.15);K.judge(.1,st.x-50,st.y-60,true);A.tone(300,.2,'square',.05,{slide:200,filter:['lowpass',1400]});K.shk=.18;st.fall=GROUND;st.x=Math.max(st.x,200);}
        else st.fall=GROUND;}},
    draw(t){g.drawImage(bay,0,0);const ok=Math.abs(st.x-TX)<9&&Math.abs(st.ang)<.12&&st.y<TY+2;
      // its shadow: wide and faint when it's high, tight and dark as it comes down over the tray
      const over=Math.abs(st.x-TX)<46&&st.y<TY+20,floor=over?TY+2:GROUND+2,hgt=Math.max(0,floor-st.y),sw=30+Math.min(30,hgt*.3),sa=Math.max(.12,.5-hgt*.006);
      K.pa(st.x-sw,floor-3,sw*2,6,'#000',sa);if(!st.end&&over)for(let x=TX-36;x<TX+36;x+=4)K.px(x,TY-16,2,1,ok?'#9be07a':'#e8c060');
      M4.rot(g,img,st.x,st.y,st.ang,32,58);
      if(st.held||!st.end){const [hx,hy]=M4.tr(st.x,st.y,st.ang,0,-58);if(st.held){m4sleeve(K,hx+3,hy-4,hx+30,hy-60);m4hand(K,hx,hy-2);}}},
    hud(t){K.label('INTO THE TRAY',30,16,'#f4ecd8','l');K.meter(st.end?1:Math.max(0,1-Math.abs(st.x-TX)/150)*.8,M4.cl(1-st.knock*.3,0,1));},
    auto(dt,AP){const a=m4ai(this,AP,dt);this._p=(this._p||0)+dt;if(this._p<.4)m4move(a,st.x,st.y-50);else{m4hold(a,true);const u=Math.min(1,(this._p-.4)/2.4),e=u*u*(3-2*u);m4move(a,262+(TX-262)*e,110+(TY-48-110)*e);if(u>=1&&Math.abs(st.ang)<.03&&Math.abs(st.x-TX)<2)m4hold(a,false);}
      AP.I=a;AP.hand=[a.x+6,a.y+6];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE WIRING, 2: red first, then black, then the loom plug
S4.crCables=(sp,K)=>{const g=K.g,BX=150,BY=104,img=crBatteryImg(2);
  const T={red:{x:BX-34,y:BY-72},blk:{x:BX+34,y:BY-72},plug:{x:262,y:66}};
  const HOME={red:[44,142],blk:[70,156],plug:[98,146]};
  const ENDS=[{k:'red',x:44,y:142,ax:-10,ay:110,c:['#5a1408','#a82c18','#e05a3a'],done:0},{k:'blk',x:70,y:156,ax:-10,ay:140,c:['#0a0a0c','#26262e','#6a6a78'],done:0},{k:'plug',x:98,y:146,ax:-10,ay:168,c:['#6a5a3a','#c8b48a','#efe2c0'],done:0}];
  const st={t:0,grab:-1,res:[],spark:0,sx:0,sy:0,end:0,bad:0};
  const tgt=e=>T[e.k];
  return {title:sp.t||'Hook up the cables',how:'Drag each cable end onto its place: the red clamp on the red post (+), the black on the black (−), the loom plug into its socket. Red first, always: black first and it sparks.',hint:'Red on red, black on black, plug in the socket. Red first.',st,
    update(dt,I){st.t+=dt;if(st.spark>0)st.spark-=dt;if(st.end){st.end+=dt;if(st.end>.8){st.done=true;st.score=M4.cl(M4.avg(st.res)-st.bad*.15,.05,1);}return;}
      if(st.grab<0&&I.pressed){let bd=16;ENDS.forEach((e,i)=>{if(e.done)return;const d=Math.hypot(I.x-e.x,I.y-e.y);if(d<bd){bd=d;st.grab=i;}});}
      if(st.grab>=0){const e=ENDS[st.grab];if(I.down){e.x+=(I.x-e.x)*Math.min(1,dt*20);e.y+=(I.y-e.y)*Math.min(1,dt*20);}
        else{let hit=null,hd=11;for(const [k,p] of Object.entries(T)){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<hd&&!ENDS.some(q=>q.done&&q.k===k)){hd=d;hit=k;}}
          if(hit===e.k){const early=e.k==='blk'&&!ENDS[0].done;if(early){st.bad++;st.spark=.35;st.sx=T.blk.x;st.sy=T.blk.y;A.hiss(.12,.2,'highpass',3000);A.tone(2400,.06,'square',.05);K.flash=.15;K.judge(.25,e.x,e.y-16,true);st.res.push(.3);}
            else{const q=hd<4?1:.8;st.res.push(q);K.judge(q,e.x,e.y-16,true);A.tone(1600,.03,'square',.04);MS.knock();}
            e.done=1;e.x=T[hit].x;e.y=T[hit].y;if(ENDS.every(q=>q.done))st.end=.001;}
          else if(hit){st.bad++;st.spark=.4;st.sx=T[hit].x;st.sy=T[hit].y;A.hiss(.15,.22,'highpass',2800);A.tone(2600,.05,'square',.05);K.flash=.18;K.shk=.15;K.judge(.1,e.x,e.y-16,true);[e.x,e.y]=HOME[e.k];}
          st.grab=-1;}}},
    draw(t){g.drawImage(M4.pre('crbaybg3',320,180,k=>{crBay(k,320,180,51,{loom:[236,20,316,40],bolts:[[246,100],[300,100]]});
          for(let y=36;y<96;y++)for(let x=238;x<306;x++)k.px(x,y,1,1,crT(CA_P.iron,3.4-(y-36)/40+(y===36?2:0)+(x===238?1.4:0)));
          for(let x=BX-64;x<BX+64;x++)for(let y=BY-12;y<BY+4;y++)k.px(x,y,1,1,y===BY-12?'#34343c':'#0c0c10');},false),0,0);
      g.drawImage(img,BX-60,BY-88);
      // the loom socket on the inner fender
      K.px(T.plug.x-10,T.plug.y-8,20,16,'#c8b48a');K.px(T.plug.x-10,T.plug.y-8,20,1,'#efe2c0');for(let i=0;i<3;i++)K.px(T.plug.x-6+i*5,T.plug.y-3,2,6,'#3a3020');
      K.text('+',T.red.x+4,T.red.y-16,'#e8542a');K.text('-',T.blk.x+4,T.blk.y-16,'#d8d8e0');
      // each cable sags from where it comes in to its end
      for(const e of ENDS){const mx=(e.ax+e.x)/2,my=Math.max(e.ay,e.y)+(e.done?6:22);let px=e.ax,py=e.ay;for(let i=1;i<=24;i++){const u=i/24,x=(1-u)*(1-u)*e.ax+2*u*(1-u)*mx+u*u*e.x,y=(1-u)*(1-u)*e.ay+2*u*(1-u)*my+u*u*e.y;K.line(px,py,x,y,e.c[1],3);K.line(px,py-1,x,y-1,e.c[2],1);px=x;py=y;}
        if(e.k==='plug'){K.px(e.x-7,e.y-5,14,10,e.c[1]);K.px(e.x-7,e.y-5,14,1,e.c[2]);}else{K.px(e.x-5,e.y-4,10,8,e.c[1]);K.px(e.x-5,e.y-4,10,1,e.c[2]);K.px(e.x-2,e.y-1,4,2,CA_P.iron[1]);}
        if(st.grab>=0&&ENDS[st.grab]===e)m4hand(K,e.x+4,e.y+6);}
      if(st.spark>0){for(let i=0;i<5;i++){const a=Math.random()*6.28,r=4+Math.random()*10;K.line(st.sx,st.sy,st.sx+Math.cos(a)*r,st.sy+Math.sin(a)*r,'#fff4c0',1);}K.glow(st.sx,st.sy,30,'200,220,255',.6);}
      if(ENDS.every(e=>e.done))K.glow(T.plug.x,T.plug.y-20,24,'120,255,160',.35);},
    hud(t){K.label('HOOKED UP '+ENDS.filter(e=>e.done).length+'/3',30,16,'#f4ecd8','l');if(st.bad)K.label('SPARKS '+st.bad,30,26,'#e8b030','l');K.meter(ENDS.filter(e=>e.done).length/3,st.res.length?M4.avg(st.res):.7);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const i=ENDS.findIndex(e=>!e.done);if(i>=0){const e=ENDS[i],p=T[e.k];this._p=(this._p||0)+dt;if(this._i!==i){this._i=i;this._p=0;}
        if(this._p<.35)m4move(a,e.x,e.y);else{m4hold(a,true);const u=Math.min(1,(this._p-.35)/1);m4move(a,e.x+(p.x-e.x)*Math.min(1,u*1.5),e.y+(p.y-e.y)*Math.min(1,u*1.5));if(u>=1)m4hold(a,false);}}
      AP.I=a;AP.hand=[a.x+4,a.y+6];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE ENGINE, 1: pour the gas in to the full mark
S4.crFuel=(sp,K)=>{const g=K.g,NX=132,NY=96,LO=.86,HI=.97;
  const side=M4.pre('crquarter2',320,130,k=>{crSheet(k,320,130,CRP.RED,61,true);for(let y=0;y<130;y++)for(let x=0;x<320;x++){const d=Math.hypot((x-NX)/15,(y-(NY-20-40))/13);if(d<1)k.px(x,y,1,1,d>.84?(x-NX+y-(NY-60)<0?CRP.RED[1]:CRP.RED[6]):'#140806');}
      for(let y=0;y<130;y++){k.px(40,y,1,1,CRP.RED[2]);}for(let x=0;x<320;x++)k.px(x,40,1,1,CRP.RED[7]);},false);
  const HOLEY=NY-20;
  const can=M4.pre('crcan2',48,42,k=>{const RC=['#2a0806','#5a120c','#8a1e12','#b8301c','#d84a2a','#f07a50'];for(let y=6;y<40;y++)for(let x=10;x<46;x++){let v=4.2-((y-6)/34)*1.6-((x-10)/36)*.6;if(((x+y)%12===0)&&y>12&&y<34)v-=.7;k.px(x,y,1,1,crT(RC,v));}
      k.px(10,6,36,1,RC[5]);k.px(22,1,16,6,RC[1]);k.px(24,2,12,3,'#1a0604');k.px(2,10,9,4,CA_P.iron[4]);k.px(2,10,9,1,CA_P.iron[6]);k.px(0,8,4,7,CA_P.iron[5]);},true);
  const st={t:0,a:0,L:.12,q:0,res:[],end:0,still:0,spill:0,drops:[]};
  return {title:sp.t||'Pour the gas in',how:'Hold to tip the can. The gauge climbs as it pours, and it keeps running a moment after you let go. Stop on the full mark. Too much and it runs down the paint.',hint:'Hold to tip. Let go just before the full mark.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;st.a=Math.max(0,st.a-dt*2);if(st.end>.7){st.done=true;st.score=M4.cl(st.res[0]==null?.4:st.res[0],.05,1);}return;}
      st.a+=(I.down?1.1:-1.8)*dt;st.a=M4.cl(st.a,0,1.4);const Q=Math.max(0,st.a-.45)*.42;st.q+=(Q-st.q)*Math.min(1,dt/.18);
      if(st.q>.004){st.L+=st.q*dt;st.still=0;if(Math.random()<st.q*30)A.tone(220+Math.random()*80,.04,'sine',.02);}else if(st.L>.3)st.still+=dt;
      if(st.L>1&&!st.spill){st.spill=1;A.hiss(.5,.1,'lowpass',900);}
      if(st.spill)st.drops.push([NX+(Math.random()-.5)*10,NY-6,0]);for(const d of st.drops)d[2]+=dt;st.drops=st.drops.filter(d=>d[2]<1.4).slice(-80);
      if((st.still>.8&&st.L>.5)||(st.L>1.08&&st.q<.01)){const e=st.L;const q=e>1.0?.15:e>=LO&&e<=HI?1:e>=LO-.06?.7:e>=LO-.15?.45:.25;st.res.push(q);K.judge(q,NX,NY-70,true);(q>=.6?MS.good:MS.miss)();st.end=.001;}},
    draw(t){g.drawImage(side,0,40);
      // the filler neck in the open fuel door
      crRing(K,NX,HOLEY,4,8,CA_P.iron);K.px(NX-3,HOLEY-3,6,6,'#0a0606');
      // the fuel door, swung open on its hinge
      for(let y=0;y<26;y++)for(let x=0;x<8;x++)K.px(NX-24+x,HOLEY-13+y,1,1,crT(CRP.RED,x<2?6:x>6?2:4));
      // the can, tipping about its handle; the stream from the spout when it's tipped far enough
      const PX=NX+34,PY=HOLEY-34,ca=-st.a*.8;M4.rot(g,can,PX,PY,ca,28,24);const [sx,sy]=M4.tr(PX,PY,ca,-28,-14);
      if(st.q>.004){const w=Math.max(1,Math.round(st.q*24));for(let i=0;i<=12;i++){const u=i/12,x=sx+(NX-sx)*u,y=sy+(HOLEY-sy)*u*u+u*2;K.pa(x-w/2,y,w,3,'#e8b040',.8);K.px(x,y,1,2,'#f8e090');}}
      const [h1x,h1y]=M4.tr(PX,PY,ca,2,-22),[h2x,h2y]=M4.tr(PX,PY,ca,14,14);m4hand(K,h1x,h1y);m4palm(K,h2x,h2y);
      for(const d of st.drops)K.pa(d[0]+d[2]*2,HOLEY+4+d[2]*60,2,3,'#c89a40',1-d[2]/1.4);
      // the fuel gauge, like the one on the dash
      const GX=262,GY=150,GR=26;crDisc(K,GX,GY,GR+3,CA_P.iron,GR);K.ell(GX,GY,GR,GR,'#14141a');for(let i=0;i<=8;i++){const a=Math.PI+i/8*Math.PI;K.px(GX+Math.cos(a)*(GR-3),GY+Math.sin(a)*(GR-3),1,1,'#d8d0c0');}
      for(let a=Math.PI+LO*Math.PI;a<Math.PI+HI*Math.PI;a+=.03)K.px(GX+Math.cos(a)*(GR-6),GY+Math.sin(a)*(GR-6),2,2,'#7cc04a');
      K.text('E',GX-GR+5,GY-6,'#d8d0c0');K.text('F',GX+GR-7,GY-6,'#d8d0c0');const na=Math.PI+Math.min(1.05,st.L)*Math.PI;K.line(GX,GY,GX+Math.cos(na)*(GR-6),GY+Math.sin(na)*(GR-6),'#e8542a',1);K.px(GX-1,GY-1,3,3,CA_P.iron[6]);},
    hud(t){K.label('FUEL',30,16,'#f4ecd8','l');K.meter(Math.min(1,st.L/HI),st.L>1?.2:.8);},
    auto(dt,AP){const a=m4ai(this,AP,dt);m4hold(a,st.L+st.q*1.2<(LO+HI)/2-.03);AP.I=a;AP.hand=[NX+36,NY-76];AP.press=a.down;},
    stop(){}};};
// ================================================================= THE ENGINE, 2: turn the key, and let go when it catches
S4.crKey=(sp,K)=>{const g=K.g,KX=238,KY=124,TX=132,TY=118,TR=26;
  const dash=M4.pre('crdash2',320,180,k=>{
      // the windscreen: dusk over the road ahead, the hood's red edge along its foot; dark pillars at the sides
      for(let y=0;y<78;y++){const u=y/78;k.px(0,y,320,1,`rgb(${Math.round(46+u*40)},${Math.round(40+u*26)},${Math.round(62+u*10)})`);}
      for(let x=0;x<320;x+=2){const h=8+Math.sin(x*.06)*3+Math.sin(x*.19)*2;k.px(x,60-h,2,h,'#1c2420');}
      for(let y=60;y<78;y++){const w=(y-58)*5;k.px(160-w,y,w*2,1,'#26262c');}for(let y=62;y<78;y+=5)k.px(159,y,2,3,'#a89c70');
      for(let x=0;x<320;x++){k.px(x,72,1,6,crT(CRP.RED,x<160?5.4-x/200:4.6));}k.px(0,72,320,1,CRP.RED[7]);
      for(let y=0;y<80;y++){const l=Math.round(30-y*.35),r=Math.round(290+y*.35);k.px(0,y,l,1,'#141016');k.px(r,y,320-r,1,'#141016');k.px(l,y,1,1,'#2a2228');}
      // the dashboard: dark vinyl, lit along its padded top edge, a cowl over the gauges
      for(let y=78;y<180;y++)for(let x=0;x<320;x++){let v=y<82?4.4-(y-78)*.6:2.6-(y-82)/70+((x*5+y*3)%47===0?-.5:0);k.px(x,y,1,1,crT(CRP.RUB,v));}
      for(let y=84;y<152;y++)for(let x=88;x<178;x++){const e=((x-133)/45)**2+((y-118)/34)**2;if(e>1)continue;k.px(x,y,1,1,crT(CRP.RUB,e>.86?(y<118?4.6:1):1.4));}
      // the steering column coming up from below, the ignition lock on its side
      for(let y=118;y<180;y++)for(let x=200;x<262;x++){const w=24+(y-118)*.3,c=231;if(Math.abs(x-c)>w)continue;k.px(x,y,1,1,crT(CRP.RUB,3.4-(x-c)/w*1.6));}
      crDisc(k,KX,KY,13,CA_P.iron,8);crDisc(k,KX,KY,7,CA_P.brass);k.px(KX-1,KY-4,2,8,'#1a1006');
      for(const [a,l] of [[-2.3,0],[-1.6,1],[-.95,2]]){k.px(KX+Math.cos(a)*17-1,KY+Math.sin(a)*17-1,2,2,['#a89878','#d8d0c0','#e8a050'][l]);}
      // the wheel's rim across the left, in front of everything: thick, worn, lit along its top
      for(let a=-1.62;a<-.55;a+=.004){for(let r=-5;r<=5;r++){const R=150+r;const x=Math.round(40+Math.cos(a)*R),y=Math.round(250+Math.sin(a)*R);if(x<0||x>=320||y<0||y>=180)continue;k.px(x,y,1,1,crT(CRP.RUB,r<-3?5:r<0?3.6:r<3?2.4:1));}}},false);
  const st={t:0,crank:0,ang:0,rpm:0,next:.7,peak:0,strong:2+Math.floor(Math.random()*2),cough:0,res:[],tries:0,end:0,run:0,batt:1,dead:0,ok:0,fob:0,fv:0};
  const LO=.62,HI=.86;
  return {title:sp.t||'Turn it over',how:'Hold to turn the key and crank the engine. It coughs, coughs, then one cough kicks the needle into the green: let go right then and it catches. Crank too long and the battery fades.',hint:'Hold to crank. Let go when the needle kicks into the green.',st,
    update(dt,I){st.t+=dt;st.fv+=(-st.fob*30-st.fv*3)*dt;st.fob+=st.fv*dt;
      if(st.end){st.end+=dt;st.rpm+=(.4-st.rpm)*Math.min(1,dt*3);if(st.end>1.2){st.done=true;st.score=[1,.8,.6,.45][Math.min(3,st.tries)];}return;}
      if(st.dead>0){st.dead-=dt;st.rpm*=.9;st.ang+=(0-st.ang)*Math.min(1,dt*10);return;}
      if(I.down){if(st.ang<.5)st.fv+=6;st.ang+=(.9-st.ang)*Math.min(1,dt*14);st.crank+=dt;st.batt=Math.max(.35,st.batt-dt*.06);st.fv+=Math.sin(st.t*40)*dt*30;
        st.next-=dt;if(st.next<=0){st.cough++;const strong=st.cough>=st.strong&&Math.random()<.75;st.peak=strong?.78+Math.random()*.06:.28+Math.random()*.22;st.next=.55+Math.random()*.45;st.fv+=strong?14:7;K.shk=Math.max(K.shk,strong?.1:.05);A.tone(70,.12,'sawtooth',.05,{filter:['lowpass',500]});if(strong)A.tone(110,.18,'sawtooth',.05,{filter:['lowpass',700]});}
        st.peak=Math.max(0,st.peak-dt*1.1);const base=.12*st.batt+Math.sin(st.t*38)*.02;st.rpm=Math.max(base,st.peak);if(Math.random()<dt*20)A.tone(60+st.batt*30,.05,'square',.02*st.batt,{filter:['lowpass',400]});}
      else{st.ang+=(0-st.ang)*Math.min(1,dt*14);
        if(st.crank>.15){if(st.rpm>=LO&&st.rpm<=HI){st.end=.001;st.run=1;MS.good();A.tone(90,.6,'sawtooth',.05,{filter:['lowpass',600]});K.judge(st.tries===0?1:.75,TX,TY-46,true);}
          else{st.tries++;st.dead=.8;st.cough=0;st.strong=2+Math.floor(Math.random()*2);A.tone(60,.3,'sawtooth',.04,{slide:30,filter:['lowpass',400]});K.judge(.2,TX,TY-46,true);}st.crank=0;}
        st.rpm*=.9;}},
    draw(t){const shake=st.run?Math.sin(t*44)*.6:0;g.drawImage(dash,0,Math.round(shake));
      if(st.run){for(let i=0;i<4;i++){const a=(t*.8+i*.25)%1;K.pa(250+a*30,56-a*30,5,4,'#8a8a90',(1-a)*.35);}}
      // the tachometer set into the cowl: green where it catches; the needle kicks with each cough
      crDisc(K,TX,TY,TR+2,CA_P.iron,TR);K.ell(TX,TY,TR,TR,'#0c0c12');for(let i=0;i<=10;i++){const a=Math.PI*.8+i/10*Math.PI*1.4;K.px(TX+Math.cos(a)*(TR-4),TY+Math.sin(a)*(TR-4),i%5?1:2,i%5?1:2,'#d8d0c0');}
      for(let a=Math.PI*.8+LO*Math.PI*1.4;a<Math.PI*.8+HI*Math.PI*1.4;a+=.025)K.px(TX+Math.cos(a)*(TR-8)-1,TY+Math.sin(a)*(TR-8)-1,2,2,'#7cc04a');
      const na=Math.PI*.8+M4.cl(st.rpm,0,1)*Math.PI*1.4;K.line(TX,TY,TX+Math.cos(na)*(TR-5),TY+Math.sin(na)*(TR-5),'#ff6a3a',1);K.px(TX-2,TY-2,4,4,CA_P.iron[6]);K.text('RPM',TX,TY+10,'#a89878');
      // warning lamps beside it: lit while it cranks, the oil lamp out once it runs
      K.px(180,104,6,4,st.run?'#2a1a14':(st.ang>.3?'#e8542a':'#3a2020'));K.px(180,112,6,4,st.run?'#7cc04a':'#203020');
      // the key: a brass head turned in the lock, a leather fob on a ring swinging under it; the hand pinches it from the right
      const a=-1.6+st.ang*.7,ex=KX+Math.cos(a)*9,ey=KY+Math.sin(a)*9;
      for(let i=0;i<8;i++){const u=i/8;K.px(KX+(ex-KX)*u-1,KY+(ey-KY)*u-1,3,3,CA_P.brass[i<2?3:5]);}
      for(let y=-6;y<=6;y++)for(let x=-4;x<=4;x++){if((x/4.5)**2+(y/6.5)**2>1)continue;K.px(ex+x,ey+y-5,1,1,crT(CA_P.brass,4.6-(x+y)*.25));}K.px(ex-1,ey-8,2,2,'#2a1a06');
      const fa=st.fob*.25,fx=ex+Math.sin(fa)*2,fy=ey+3;K.px(fx-2,fy,4,1,CA_P.iron[6]);for(let j=0;j<16;j++){const x=fx+Math.sin(fa)*j*.9,y=fy+1+j*.95;K.px(x-2,y,5,1,crT(CA_P.leather,5-j*.15));}
      m4hand(K,ex+15,ey-2,true);},
    hud(t){K.label('TRY '+(st.tries+1),30,16,'#f4ecd8','l');K.label('BATTERY',30,26,st.batt<.6?'#e8b030':'#a89878','l');K.px(70,27,30,3,'#2a2a30');K.px(70,27,Math.round(30*st.batt),3,st.batt<.6?'#e8b030':'#7cc04a');K.meter(st.run?1:Math.min(.9,st.cough/4),[1,.8,.6,.45][Math.min(3,st.tries)]);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.dead>0||st.end){m4hold(a,false);}else{const rel=a.down&&st.rpm>=LO+.02&&st.rpm<=HI-.02;m4hold(a,!rel);}AP.I=a;AP.hand=[KX+16,KY-10];AP.press=a.down;},
    stop(){}};};
// ---- the stages, each a short run of these
const CR_RUNS={winch:null,
  frame:[{k:'crDents',t:'Beat the dents out'}],
  rad:[{k:'crBelt',t:'Loop the fan belt'},{k:'crClamps',t:'Clamp the hoses'}],
  wheel:[{k:'crHang',t:'Hang the wheel'},{k:'crLugs',t:'Lug nuts, in a star'}],
  glass:[{k:'crGlass',t:'Set the glass'},{k:'crSeal',t:'Run the seal'}],
  wires:[{k:'crBattery',t:'Drop the battery in'},{k:'crCables',t:'Hook up the cables'}],
  start:[{k:'crFuel',t:'Pour the gas in'},{k:'crKey',t:'Turn it over'}]};
{const _cm=carMg;carMg=function(stage,done){const run=CR_RUNS[stage.id];if(!run||window.CR_OLD)return _cm.apply(this,arguments);S.cgTut=S.cgTut||{};
  mg4Run({scene:'carclose',icon:stage.icon||'wrench',steps:run.map(s=>Object.assign({},s))},stage.mg.name,done,stage.icon||'wrench');};}
