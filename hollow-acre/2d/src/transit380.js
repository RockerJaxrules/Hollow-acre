/* ================= t380 the county bus, small and seldom. The owner: "buses should be way smaller and less clutter and
   glitchy and make the train and bus routes realistic full loop not getting in the way of other stuff and make sense";
   "buses also should not be running constantly unless player is on them then they run whenever player gets on them you will
   see them occasionally but not often".
   - ONE bus, a little county bus in scale with the people: 4.25 m long, 1.56 m wide, its roof just over a grown man's hat.
   - ONE loop on the county's own roads, clockwise, every turn a right turn: Hollow Acre (the Mill Road corner) -> Marrow
     Hollow -> Quarry Road -> down the Wickham road -> Wickham -> back along to Mill Road -> up to Hollow Acre. It comes in from
     the county garage along Route 9 from the east, goes round, and goes back the way it came. A stop is one post on the verge,
     on the kerb side, so the door opens onto it.
   - Three runs a day (7 am, noon, 5 pm). Wait at a stop and pick where you're going: if no bus is due soon the county sends one.
     On board you ride it round: the view rides with it, it calls at every stop, and you can get off at any of them.
   - On a shared farm the host keeps the timetable in the farm book, so every game has the same bus in the same place.
   ================= */
// ---------------------------------------------------------------- one camera for any heading (the four square views, and
// the four between them for the corners): screen x = X, screen y = Z - h, the model's u along it (rear 0 to front L), v across
// it (its left 0 to its right Wd), turned to the heading (dx,dz)
const T80H={E:[1,0],W:[-1,0],S:[0,1],N:[0,-1],SE:[.7071,.7071],SW:[-.7071,.7071],NE:[.7071,-.7071],NW:[-.7071,-.7071]};
// (like every top in the game, a horizontal top is drawn at three-quarters of its depth: a cube's top is 32 x 24)
const T80FS=.75;
function t80Cam(L,Wd,view){const [dx,dz]=T80H[view];const w=L*Math.abs(dx)+Wd*Math.abs(dz),d=L*Math.abs(dz)+Wd*Math.abs(dx);
  return {X:(u,v)=>(u-L/2)*dx-(v-Wd/2)*dz+w/2,Z:(u,v)=>((u-L/2)*dz+(v-Wd/2)*dx+d/2)*T80FS,N:(a,b)=>[a*dx-b*dz,a*dz+b*dx],w,d:d*T80FS};}
const T80CAM={on:false};
{const _c=t41Cam;t41Cam=function(L,Wd,view){return T80CAM.on&&T80H[view]?t80Cam(L,Wd,view):_c(L,Wd,view);};}
// the eight headings, nearest first
function t80View(dx,dz){let best='E',bd=-9;for(const k in T80H){const h=T80H[k],d=h[0]*dx+h[1]*dz;if(d>bd){bd=d;best=k;}}return best;}
// ---------------------------------------------------------------- THE LITTLE COUNTY BUS
// 4.4 m (140 px) long, 1.56 m (50) wide, 2 m (64) to the roof: short end to end, but its walls stand a head over the farmer and
// its door is taller than he is. Bottle green below a cream window band, the roof rounded at its shoulders and at both ends, a
// flat front with a split windscreen and the COUNTY board over it. Six windows a side on an even pitch, their sills at a man's
// head height; the door on the kerb (right) side ahead of the front wheel, the driver's window opposite it.
const T80B={L:140,Wd:50,H:64,sh:58,wr:12,wu:[26,99],panes:[[6,18],[22,38],[42,58],[62,78],[82,98],[102,112]],door:[117,131],win:[41,55]};
// hue-shifted ramps for the bus: the roof's grey goes violet in shade and warm in the light; more steps in the green and cream
const T80P={roof:['#28242e','#3b3641','#524d56','#6b6667','#87817a','#a49d8b','#bdb59e'],
  green:['#0f1914','#18281f','#22382b','#2e4a37','#3e6046','#557a55','#7a9a68'],cream:['#3e3628','#5e5440','#857a5c','#ad9f78','#c9bb93','#e1d6b4','#f1e9cf']};
function t80BusPoly(crown){const {Wd,sh}=T80B,r=Math.max(1,Math.min(6,crown-sh)),top=crown,c0=top-r;const P=[[0,6],[Wd,6]];for(let i=0;i<=6;i++){const a=i/6*Math.PI/2;P.push([Wd-r+r*Math.cos(a),c0+r*Math.sin(a)]);}
  for(let i=0;i<=6;i++){const a=Math.PI/2+i/6*Math.PI/2;P.push([r+r*Math.cos(a),c0+r*Math.sin(a)]);}return P;}
// a rider seen through the glass: a dark head and shoulders against the pane (warm-lit at night)
function t80Rider(K,cx,bot,k,warm){const hc=warm?['#4a3020','#5a3a24','#3a2418'][k%3]:['#2a2018','#3a2c20','#1e1812'][k%3],sc=warm?'#3a2418':'#1a1a20';
  K.box(cx-2,bot-8,4,1,hc);K.box(cx-3,bot-7,6,4,hc);K.box(cx-2,bot-3,4,1,hc);K.box(cx-4,bot-2,8,1,sc);K.box(cx-5,bot-1,10,2,sc);}   // (a round head on square shoulders)
// a pane lit from the top-left: the sky at its head, one glint across it, darker below; warm and lit at night
function t80Pane(K,a,b,t,bb,o){o=o||{};const GL=T41P.glass,g0=o.g==null?4:o.g;for(let x=a;x<=b;x++)for(let y=t;y<=bb;y++){let col=y<t+3?GL[2]:GL[1];const d=(x-a)+(y-t);
    if(d>=g0&&d<=g0+1)col=GL[3];else if(d===g0+2)col=GL[2];
    if(o.warm){const core=x>a+1&&x<b-1&&y>t+2&&y<bb-1;col=y<t+2?'#b8863e':core?(d>=g0&&d<=g0+1?'#fff2c8':'#f2d48a'):(d>=g0&&d<=g0+1?'#f0cc80':'#d2a052');}K.px(x,y,1,1,col);}}
// the green and the cream turned as a gently bowed side: lighter where the side leans to the light at the top of each band
function t80Paint(K,L,tt,col){const G=T80P.green,C=T80P.cream;
  K.box(0,tt(58),L,tt(38)-tt(58),C[3]);K.box(0,tt(58),L,1,C[5]);K.box(0,tt(57),L,2,C[4]);K.box(0,tt(40),L,2,C[2]);   // cream: a lit top, the body, a shade line under the sills
  K.box(0,tt(38),L,1,G[0]);K.box(0,tt(37),L,1,G[5]);K.box(0,tt(36),L,6,G[4]);K.box(0,tt(30),L,tt(13)-tt(30),G[3]);K.box(0,tt(13),L,4,G[2]);K.box(0,tt(9),L,3,G[1]);   // green: lit under the belt, darker to the skirt
  K.box(0,tt(23),L,1,G[2]);K.box(0,tt(22),L,1,G[4]);}   // the rub strip: a dark seam with a lit lip under it
function t80SideTex(right,open,riders,lit,plain){const {L,H,wu,panes,door,win}=T80B,G=T80P.green,C=T80P.cream,S=T41P.steel;const tt=h=>H-h;const fr=u=>right?u:L-u;
  return t41Tex(L,H-5,K=>{t80Paint(K,L,tt);
    // windows on an even pitch, a pale sill under each and a shadow over it
    let k=0;for(const [a0,b0] of panes){const a=Math.round(Math.min(fr(a0),fr(b0))),w=b0-a0;const who=riders&&((k*5+3)%7)<4;const dark=lit&&k===3;
      t80Pane(K,a,a+w-1,tt(win[1]),tt(win[0]),{warm:!!lit&&!dark,g:[3,5,2,6,4,3][k%6]});if(who)t80Rider(K,a+(w>>1)+(k%2?-1:1),tt(win[0]),k,!!lit&&!dark);
      K.box(a-1,tt(win[0])+1,w+2,1,C[1]);K.box(a-1,tt(win[1])-1,w+2,1,C[2]);k++;}
    if(right){const d0=door[0],d1=door[1];
      if(open){K.box(d0,tt(57),d1-d0,tt(7)-tt(57),'#120e0c');K.box(d0,tt(12),d1-d0,2,'#6c5a44');K.box(d0,tt(12)+2,d1-d0,1,'#2a2018');K.box(d0,tt(20),d1-d0,1,'#3a3026');K.box(d0+2,tt(34),2,6,'#3a3026');
        K.box(d0-1,tt(57),1,tt(7)-tt(57),G[0]);K.box(d1,tt(57),1,tt(7)-tt(57),G[5]);}
      else{K.box(d0,tt(57),d1-d0,tt(7)-tt(57),G[3]);for(const a of [d0+1,d0+8]){t41Pane(K,a,a+4,tt(55),tt(34),{warm:!!lit});K.box(a,tt(31),5,tt(10)-tt(31),G[4]);K.box(a,tt(31),5,1,G[5]);K.box(a,tt(11),5,1,G[2]);}
        K.box(d0,tt(57),1,tt(7)-tt(57),G[0]);K.box(d1-1,tt(57),1,tt(7)-tt(57),G[0]);K.box(d0+7,tt(57),1,tt(7)-tt(57),G[1]);K.box(d0+6,tt(28),1,3,S[4]);}}
    else{// the driver's window, its front edge raked back with the screen, and his head in it
      const a=Math.round(fr(132)),b=Math.round(fr(116));t41Pane(K,a,b,tt(win[1]),tt(win[0]-1),{slantL:4,warm:!!lit});t80Rider(K,a+9,tt(win[0]-1),1,!!lit);K.box(a,tt(win[0]-1)+1,b-a+1,1,C[1]);}
    if(!plain){const txt='MARROW CO.',tw=K.textW(txt),tx=Math.round(fr((wu[0]+wu[1])/2)-tw/2);K.text(txt,tx+1,tt(31)+1,G[0]);K.text(txt,tx,tt(31),C[5]);}
    // (on the corners the letters would shear into a smudge, so the turned views go without them)
    // wheel arches: the hole the wheel turns in, and a lit lip round its top
    // road dirt: a crescent of spray hugging the back of each arch, heaviest low down (two browns, no specks)
    for(const w of wu){const sc=fr(w),hc=T80B.wr,bk=right?-1:1;for(let y=0;y<H-5;y++)for(let x=Math.floor(sc-19);x<=sc+19;x++){const h=H-y-.5,dx=x+.5-sc,d=Math.hypot(dx,h-hc);if(h<6||dx*bk<2)continue;
        const a=Math.atan2(h-hc,Math.abs(dx));if(d>15.4&&d<17.6+(1-Math.min(1,(h-6)/12))*2.2&&a<.9)K.px(x,y,1,1,d<16.4?'#4a3826':'#5e4a32');}}
    for(const w of wu){const sc=fr(w),hc=T80B.wr;for(let y=0;y<H-5;y++)for(let x=Math.floor(sc-17);x<=sc+17;x++){const h=H-y-.5,d=Math.hypot(x+.5-sc,h-hc);if(h<6)continue;
        if(d<14.5)K.g.clearRect(x,y,1,1);else if(d<15.6)K.px(x,y,1,1,x+.5<sc?G[6]:G[1]);}}
    // wear: grime low along the skirt with a wandering top edge, and a rust run under two window corners
    for(let x=0;x<L;x++){const g=Math.round(2+1.2*Math.sin(x*.23)+.8*Math.sin(x*.61+1));for(let k=0;k<g;k++)K.px(x,tt(9)-k,1,1,k===g-1?G[2]:'#22301f');}
    for(const [u,len] of [[38,6],[98,4]]){const x=Math.round(fr(u));K.box(x,tt(40)+1,1,len,'#6a3c22');K.box(x,tt(40)+1,1,1,'#8a5430');K.box(x+(right?1:-1),tt(40)+2,1,len-3,'#4e2c1a');}
    // the bumpers' ends wrapping round the corners: a bright top, the steel, a dark lip
    for(const x0 of [0,L-5]){K.box(x0,tt(10),5,1,S[4]);K.box(x0,tt(9),5,2,S[3]);K.box(x0,tt(7),5,1,S[1]);}
  });}
// a bumper across an end face: a bright top edge, the steel lit to the left, a dark lip under it
function t80Bumper(K,Wd,tt){const S=T41P.steel;K.box(0,tt(10),Wd,1,S[4]);for(let x=0;x<Wd;x++)K.box(x,tt(9),1,2,x<Wd*.4?S[3]:S[2]);K.box(0,tt(7),Wd,1,S[1]);}
// the ends as you'd see them standing before or behind it (t runs down from the roof)
function t80EndPaint(K,Wd,tt){const C=T80P.cream,G=T80P.green;K.box(0,0,Wd,tt(58),T80P.roof[4]);t80Paint(K,Wd,tt);}
function t80FrontTex(lit){const {Wd,H,win}=T80B,C=T80P.cream,S=T41P.steel,LM=T41P.lamp;return t41Tex(Wd,H-5,K=>{const tt=h=>H-h;t80EndPaint(K,Wd,tt);
  K.box(11,tt(59),28,7,'#0e0c0a');K.box(11,tt(59),28,1,'#2a2622');const w=K.textW('COUNTY');K.text('COUNTY',25-Math.round(w/2),tt(58),lit?LM[4]:LM[3]);
  t41Pane(K,4,23,tt(52),tt(win[0]),{slantL:2,warm:false});t41Pane(K,27,45,tt(52),tt(win[0]),{slantR:2,warm:false});K.box(24,tt(52),3,tt(win[0])-tt(52)+1,C[3]);K.box(24,tt(52),1,tt(win[0])-tt(52)+1,C[5]);
  t80Rider(K,12,tt(win[0]),0,false);K.box(3,tt(win[0])+1,44,1,C[1]);
  for(let x=18;x<=31;x++){const bar=(x-18)%3!==2;for(let y=tt(32);y<=tt(14);y++)K.px(x,y,1,1,bar?(y===tt(32)?S[4]:x<25?S[3]:S[2]):'#0e0e10');}K.box(17,tt(33),16,1,S[4]);K.box(17,tt(13),16,1,S[1]);
  for(const cx of [8,42]){K.ell(cx,tt(24),4.2,4.2,(x,y,nx,ny,d)=>d>.74?(ny<-.3?S[3]:S[1]):(lit?(nx+ny<-.5?'#fffbe8':LM[4]):(nx+ny<-.6?'#e8ecef':nx+ny<.2?'#9aa6b0':'#6a7682')));}
  t80Bumper(K,Wd,tt);});}
function t80RearTex(riders,lit){const {Wd,H,win}=T80B,C=T80P.cream,G=T80P.green,R=T41P.red,S=T41P.steel;return t41Tex(Wd,H-5,K=>{const tt=h=>H-h;t80EndPaint(K,Wd,tt);
  t80Pane(K,6,35,tt(win[1]),tt(win[0]+2),{warm:!!lit,g:5});if(riders){t80Rider(K,14,tt(win[0]+2),1,!!lit);t80Rider(K,28,tt(win[0]+2),2,!!lit);}K.box(5,tt(win[0]+2)+1,32,1,C[1]);
  K.box(20,tt(36),1,tt(11)-tt(36),G[1]);K.box(21,tt(36),1,tt(11)-tt(36),G[4]);
  K.box(12,tt(23),19,8,C[5]);K.box(12,tt(23),19,1,C[6]);K.box(12,tt(16),19,1,C[2]);const pw=K.textW('MC 9');K.text('MC 9',21-Math.floor(pw/2),tt(22)+1,'#2a2218');   // the plate
  // the ladder up the back to the roof: two rails lit on the left, rungs every five
  for(let h=12;h<=60;h++){K.px(39,tt(h),1,1,S[3]);K.px(40,tt(h),1,1,S[1]);K.px(44,tt(h),1,1,S[3]);K.px(45,tt(h),1,1,S[1]);}for(let h=14;h<=58;h+=5){K.box(40,tt(h),4,1,S[4]);K.box(40,tt(h)+1,4,1,S[1]);}
  for(const cx of [5,33]){K.box(cx-2,tt(30),4,6,lit?'#ff6a48':R[3]);K.box(cx-2,tt(30),4,1,R[4]);K.box(cx-2,tt(25),4,1,R[1]);}
  t80Bumper(K,Wd,tt);});}
// the bus in any of the eight views
function t80BusPic(view,f,open,riders,lit){const {L,Wd,H,sh,wr,wu}=T80B,S=T41P.steel,I=T41I,TY=T41P.tyre,RF=T80P.roof;
  T80CAM.on=true;let Sc;try{Sc=t41Scene(L,Wd,view,H+4,{padX:4,padTop:2,padBot:3});}finally{T80CAM.on=false;}
  const diag=view.length===2;const RS=t80SideTex(true,open,riders,lit,diag),LS=t80SideTex(false,false,riders,lit,diag),FT=t80FrontTex(lit),RT=t80RearTex(riders,lit);
  // the chassis and the dark of the wheel wells (the bumpers are painted on the ends and wrap a hand round the corners)
  Sc.box(6,L-6,4,Wd-4,2,6,F=>F.part==='side'&&F.up?I[1]:I[0]);
  for(const w of wu)Sc.box(w-11,w+11,3,Wd-3,6,20,()=>'#100c0a');
  // the wheels: short drums across the bus, a dark tread, the sidewall lit at the top-left, a pale hub with three studs that turn
  const wheel=w=>F=>{if(F.part==='side')return t41Sh(TY,F.lit,1.6,3);const du=F.c-w,dh=F.h-wr,d=Math.hypot(du,dh);
    if(d>wr-1.1)return TY[0];if(d>5.2)return (du-dh)<-3?TY[3]:TY[1];if(d>4.2)return S[1];
    const a=Math.atan2(dh,du)-f*Math.PI*2/9,seg=Math.PI*2/3;const stud=d>2.2&&d<3.6&&Math.abs(((a%seg)+seg)%seg-seg/2)<.42;
    return stud?S[1]:(du-dh<-1.5?S[4]:S[3]);};
  const ring=w=>{const P=[];for(let i=0;i<20;i++){const a=i/20*Math.PI*2;P.push([w+Math.cos(a)*wr,wr+Math.sin(a)*wr]);}return P;};
  for(const w of wu)for(const [v0,v1] of [[1,7],[Wd-7,Wd-1]])Sc.ext('v',ring(w),v0,v1,wheel(w),{round:[w,wr]});
  // seen end on, the tyres under the bumper: the bus stands on them
  if(view==='S'||view==='N'){const u0=view==='S'?L-7:3;for(const v of [2,Wd-8])Sc.box(u0,u0+4,v,v+6,0,9,F=>F.part==='side'&&!F.up?TY[3]:(F.v<v+1.2||F.v>v+4.8)?S[2]:t41Sh(TY,F.lit,1.6,3));}
  // the body: the sides textured; the roof lit by its planes (the top one tone, the shoulder toward the light a step up, the
  // other a step down), rounded at its shoulders and stepped down at both ends so it reads round from every side
  const roofId=++Sc.idc;
  // (the roof light comes from the upper left and a little behind, as on the town's roofs: the far and left of the top palest,
  // stepping darker toward the near edge and the right end; a dark gutter at the foot of each shoulder)
  const RL=(()=>{const l=[-.5,.78,-.38],n=Math.hypot(...l);return l.map(v=>v/n);})();
  const roof=F=>{if(F.h<sh+1.1)return RF[1];let a=F.nl[0],b=F.nl[1],c=F.nl[2];
    if(c>.9){b+=(F.v-Wd/2)/(Wd/2)*.32;a+=F.u<16?-(16-F.u)/16*.3:F.u>L-16?(F.u-L+16)/16*.3:0;const n=Math.hypot(a,b,c);a/=n;b/=n;c/=n;}
    const [nX,nZ]=Sc.cam.N(a,b);const l=nX*RL[0]+c*RL[1]+nZ*RL[2];return l>.84?RF[6]:l>.76?RF[5]:l>.62?RF[4]:l>.42?RF[3]:RF[2];};
  const body=F=>{if(F.part==='cap1')return FT(F.s,F.t);if(F.part==='cap0')return RT(F.s,F.t);
    if(F.up&&F.h<sh+.5){const T=F.nl[1]>0?RS:LS;return T(F.s,F.t);}
    // (a hatch's shadow falls down and to the right of it on the roof)
    if(F.h>H-.6){const [hx,hz]=T80H[view];const su=2.4*hx+2.4*hz,sv=-2.4*hz+2.4*hx;for(const u of [34,92])if(F.u-su>=u&&F.u-su<=u+14&&F.v-sv>=18&&F.v-sv<=32&&!(F.u>=u&&F.u<=u+14&&F.v>=18&&F.v<=32))return RF[2];}
    return roof(F);};
  const endCap=F=>(F.part==='cap0'||F.part==='cap1')&&F.h>sh-.5?roof({nl:[F.part==='cap1'?.7:-.7,0,.7]}):body(F);
  const steps=[[0,2,H-4],[2,4,H-2],[4,6,H-1]];
  for(const [a0,a1,cr] of steps){Sc.ext('u',t80BusPoly(cr),a0,a1,a0===0?body:endCap,{ttop:H,sL:L,pid:roofId});Sc.ext('u',t80BusPoly(cr),L-a1,L-a0,a0===0?body:endCap,{ttop:H,sL:L,pid:roofId});}
  Sc.ext('u',t80BusPoly(H),6,L-6,body,{ttop:H,sL:L,noCaps:true,pid:roofId});
  // two roof hatches spaced along it, one pixel proud: their lids a step lighter, their sides a step darker
  for(const u of [34,92])Sc.box(u,u+14,18,32,H-.5,H+2,F=>F.part==='side'&&!F.up?RF[6]:(Sc.cam.N(F.nl[0],F.nl[1])[1]>.3?RF[1]:RF[3]));
  // the contact shadow on the ground under the body (its own footprint, turned with it)
  const cam=Sc.cam,ox=Sc.ox,oy=Sc.oy;const foot=[[0,0],[L,0],[L,Wd],[0,Wd]].map(([u,v])=>[ox+cam.X(u,v),oy+cam.Z(u,v)]);
  const c=Sc.done({crease:4,shadow:false,before(K){K.outline=function(){const W=K.W,Hh=K.H,D=K.g.getImageData(0,0,W,Hh),d=D.data,out=[];const A=(x,y)=>x>=0&&y>=0&&x<W&&y<Hh&&d[(y*W+x)*4+3]>40;
      for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){if(A(x,y))continue;let src=null,lit=false;for(const [dx,dy,l] of [[1,0,1],[0,1,1],[-1,0,0],[0,-1,0]]){if(A(x+dx,y+dy)){src=((y+dy)*W+x+dx)*4;lit=!!l;break;}}
        if(src!==null){const k=lit?.62:.42;out.push([x,y,`rgb(${Math.round(d[src]*k+6)},${Math.round(d[src+1]*k+6)},${Math.round(d[src+2]*k+10)})`]);}}
      for(const [x,y,col] of out)K.px(x,y,1,1,col);};},after(K){const g=K.g;g.save();g.globalCompositeOperation='destination-over';g.fillStyle='rgba(14,10,8,.42)';g.beginPath();foot.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.restore();}});
  return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// the lit windows, the lamps and the pool of the headlamps at night, from the same model
function t80BusLights(Sc,view){const {L,Wd,panes,win}=T80B,P=Sc.P,out=[];const [dx,dz]=T80H[view];const nZ=dx;   // (the right side faces you when nZ>0)
  const sideV=nZ>.2?Wd:nZ<-.2?0:null;
  if(sideV!=null)for(const [a,b] of panes){const p0=P(a,sideV,win[1]),p1=P(b,sideV,win[0]);out.push({t:'win',r:t41RectP(Sc,p0,p1)});}
  if(dz>.2||Math.abs(dx)>.2){for(const v of [8,Wd-8]){const p=P(L+1,v,24);out.push({t:'lamp',x:p[0],y:p[1],r:2.6,c:[255,236,190]});}
    const f=P(L+40,Wd/2,0);out.push({t:'pool',x:f[0],y:f[1],rx:14+Math.abs(dx)*16,ry:8+Math.abs(dz)*8});}
  if(dz<-.2||Math.abs(dx)>.2)for(const v of [5,Wd-5]){const p=P(-1,v,28);out.push({t:'lamp',x:p[0],y:p[1],r:1.6,c:[255,90,60]});}
  return out;}
function t80BusKey(v,f,open,riders,lit){riders=riders?1:0;lit=lit?1:0;open=open?1:0;f=f%3;
  return t41SprPic(`t80b_${v}_${f}_${open}_${riders}_${lit}`,()=>t80BusPic(v,f,open,riders,lit),Sc=>t80BusLights(Sc,v));}
// @@GAMEPLAY ---------------------------------------------------------------- the loop, the stops, the timetable
// The loop, clockwise from the Quarry corner: south down the Wickham road, west along it past Wickham, north up Mill Road, east
// along Route 9 past Hollow Acre, Marrow Hollow and Quarry Road, back to the corner. The garage is off past the end of Route 9.
// The line is laid in the lane the bus keeps on each road (measured against what stands on each verge, t380/clear.js), with the
// corners where two lanes meet; the third number is how tight that corner is turned:
// - Route 9 (3 m): the right-hand lane; going out past the gas station it keeps left of the GAS sign;
// - the Quarry corner road (2.4 m): the crown, and by Wickham's corner house (its wall stands on the verge) the east half;
// - Wickham's street (3 m): a little right, clear of the lamp posts and the barrel on the kerb; west of Wickham (2 m) the crown;
// - Mill Road (2 m): a little left, clear of the hedge, the crossroads marker and the signpost on its east verge, and it turns
//   onto Route 9 tight, inside the signpost.
const T80_IN=[[244,-6.62],[150,-6.62,3]];
const T80_LAPPTS=[[150,28],[150.35,31],[150.35,45.6,3],[97.5,45.6],[94.5,45.88],[19.6,45.88,3],[19.6,-5.38,2],[150,-5.38,3]];
const T80_OUT=[[184,-5.38],[187,-6.3],[244,-6.3]];
// the stops on the loop, in the order a lap reaches them; each a post on the verge on the kerb (right-hand) side
const T80_STOP={farm:{at:[24.6,-3.9],note:'at the Mill Road corner, by Grandpa’s gate'},town:{at:[49.2,-3.7],note:'on Main Street'},
  quarry:{at:[140.5,-3.9],note:'at the foot of the quarry road'},wick:{at:[104,44.1],note:'by the Lantern Inn'}};
const T80_ORDER=['wick','farm','town','quarry'];
const T80_RUNS=[7,12,17];          // the timetable: three runs a day, each once round
const T80_V=560,T80_ACC=7,T80_DWELL=.04,T80_LAST=20;   // metres an hour at speed, metres to get up to it, the wait at a stop, the last call
const T80={paths:{},times:{},lapLen:0,stopS:null,lastSig:''};
const T80_DOOR=(124-70)/32-.7;   // the door is (124-70)/32 m ahead of the bus's middle: it draws up with the door just past the post
// the old network's stops: the four on the loop keep their names and move to the loop's kerb side; the rest come down
{for(const st of T41_STOPS){const n=T80_STOP[st.id];if(!n)continue;st.at=n.at.slice();st.view='post';st.note=n.note;}
  const keep=T80_ORDER.map(id=>T41_STOP_BY[id]).filter(Boolean);T41_STOPS.splice(0,T41_STOPS.length,...keep);T41_ORDER.splice(0,T41_ORDER.length,...T80_ORDER);
  for(const it of interact){if(!it||typeof it.label!=='function')continue;let l='';try{l=it.label();}catch(e){continue;}const m=/^Bus stop · (.+)$/.exec(l);if(!m)continue;
    const st=T41_STOPS.find(s=>s.name===m[1]);if(!st){it.on=()=>false;continue;}const fp=t41StopFront(st);it.x=fp[0];it.z=fp[1];}}
// a polyline with each corner rounded to its own radius (the third number, none: left sharp), sampled every 0.25 m
function t80Poly(pts){const P=[pts[0]];for(let i=1;i<pts.length-1;i++){const [ax,az]=pts[i-1],[bx,bz,r]=pts[i],[cx,cz]=pts[i+1];const l1=Math.hypot(bx-ax,bz-az),l2=Math.hypot(cx-bx,cz-bz);
    const ux=(bx-ax)/l1,uz=(bz-az)/l1,vx=(cx-bx)/l2,vz=(cz-bz)/l2;if(!r||Math.abs(ux*vz-uz*vx)<.2){P.push(pts[i]);continue;}
    const rr=Math.min(r,l1*.45,l2*.45);const p0=[bx-ux*rr,bz-uz*rr],p1=[bx+vx*rr,bz+vz*rr];
    for(let k=0;k<=12;k++){const t=k/12,q=1-t;P.push([q*q*p0[0]+2*q*t*bx+t*t*p1[0],q*q*p0[1]+2*q*t*bz+t*t*p1[1]]);}}
  P.push(pts[pts.length-1]);const out=[];let s=0;
  for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1];const L=Math.hypot(bx-ax,bz-az);if(L<1e-6)continue;const n=Math.max(1,Math.ceil(L/.25));
    for(let k=0;k<n;k++){const t=k/n;out.push({x:ax+(bx-ax)*t,z:az+(bz-az)*t,s:s+L*t,dx:(bx-ax)/L,dz:(bz-az)/L});}s+=L;}
  const l=P[P.length-1],q=out[out.length-1];out.push({x:l[0],z:l[1],s,dx:q.dx,dz:q.dz});out.len=s;return out;}
// a run's path for n laps: in from the garage, round n times, out the way it came
function t80Path(n){n=Math.max(1,Math.min(6,n|0));if(T80.paths[n])return T80.paths[n];const pts=T80_IN.slice();for(let j=0;j<n;j++)for(const p of T80_LAPPTS)pts.push(p);for(const p of T80_OUT)pts.push(p);
  const P=t80Poly(pts);T80.paths[n]=P;return P;}
// where the bus calls on a path: every pass by each stop's post (one a lap), drawn up with its door beside the post
function t80Passes(n){const key='p'+n;if(T80.paths[key])return T80.paths[key];const P=t80Path(n),out=[];
  for(const id of T80_ORDER){const st=T41_STOP_BY[id];let run=null;for(const p of P){const d=Math.hypot(p.x-st.at[0],p.z-st.at[1]);
      if(d<3.2){if(!run||d<run.d)run={d,s:p.s};}else if(run){out.push({id,s:run.s-T80_DOOR});run=null;}}if(run)out.push({id,s:run.s-T80_DOOR});}
  out.sort((a,b)=>a.s-b.s);let lap=0;const seen={};for(const c of out){if(seen[c.id]!=null&&seen[c.id]>=lap)lap++;c.lap=lap;seen[c.id]=lap;}
  T80.paths[key]=out;return out;}
function t80Stops(){if(T80.stopS)return T80.stopS;const out={};for(const c of t80Passes(1))out[c.id]=c.s;T80.lapLen=t80Path(2).len-t80Path(1).len;T80.stopS=out;return out;}
// the stops a run calls at, along its path: [{id,s,lap}]
function t80Calls(n){const built=t80Built();return t80Passes(n).filter(c=>built.includes(c.id));}
const t80Built=()=>{const T=S.emp&&S.emp.tr;if(!T||!T.bus)return [];return T80_ORDER.filter(id=>T.stops&&T.stops[id]);};
// one stretch: dist D from speed v0 (0 or full) to v1: its time, and how far along at time tau
function t80LegT(D,v0,v1){const a=Math.min(T80_ACC,D/((v0?0:1)+(v1?0:1)||1));const ac=(v0?0:a)+(v1?0:a);return (D-ac)/T80_V+(v0?0:2*a/T80_V)+(v1?0:2*a/T80_V);}
function t80LegS(D,v0,v1,tau){const a=Math.min(T80_ACC,D/((v0?0:1)+(v1?0:1)||1));const ta=2*a/T80_V;const t1=v0?0:ta,cruise=D-(v0?0:a)-(v1?0:a),tc=cruise/T80_V;
  if(!v0&&tau<t1){const q=tau/ta;return a*q*q;}const s0=v0?0:a;if(tau<t1+tc||v1)return Math.min(D,s0+(tau-t1)*T80_V);const q=clamp((tau-t1-tc)/ta,0,1);return s0+cruise+a*(1-(1-q)*(1-q));}
// a run's timeline: moves and waits from the garage and back, as [{t0,t1,s0,s1,v0,v1,stop,lap}] in hours from its start
function t80Time(n){const sig=n+'|'+t80Built().join(',');if(T80.times[sig])return T80.times[sig];const P=t80Path(n),calls=t80Calls(n),L=[];let t=0,s=0,v=1;
  for(const c of calls){const D=c.s-s;if(D>.01){const dt=t80LegT(D,v,0);L.push({t0:t,t1:t+dt,s0:s,s1:c.s,v0:v,v1:0});t+=dt;}L.push({t0:t,t1:t+T80_DWELL,s0:c.s,s1:c.s,stop:c.id,lap:c.lap});t+=T80_DWELL;s=c.s;v=0;}
  const D=P.len-s,dt=t80LegT(D,v,1);L.push({t0:t,t1:t+dt,s0:s,s1:P.len,v0:v,v1:1});t+=dt;L.dur=t;T80.times[sig]=L;return L;}
// ---- the day's runs (the farm book keeps them: on a shared farm the host writes them and everyone reads them)
function t80Day(){const T=S.emp&&S.emp.tr;if(!T||!T.bus)return null;let b=T.b80;if(!b||b.day!==S.day){b={day:S.day,runs:T80_RUNS.map(h=>({t0:h,laps:1}))};if(t41Host())T.b80=b;}return b;}
// the runs that really go: in time order, one at a time (a run that would start while another is out is dropped)
function t80Runs(){const b=t80Day();if(!b)return [];const rs=b.runs.slice().sort((a,c)=>a.t0-c.t0);const out=[];let end=-1;
  for(const r of rs){if(r.t0<end-1e-6)continue;const dur=t80Time(r.laps).dur;out.push({r,t0:r.t0,end:r.t0+dur,laps:r.laps});end=r.t0+dur;}return out;}
// where the bus is at hour h: {x,z,dx,dz,moving,stop,s,leg,run} or null when it's in the garage
function t80Where(h){h=h==null?S.hour:h;for(const R of t80Runs()){if(h<R.t0||h>=R.end)continue;return t80WhereRun(R,h);}return null;}
function t80WhereRun(R,h){const L=t80Time(R.laps),P=t80Path(R.laps),tau=h-R.t0;if(tau<0||tau>=L.dur)return null;{
    let lo=0,hi=L.length-1;while(lo<hi){const m=(lo+hi)>>1;if(L[m].t1<=tau)lo=m+1;else hi=m;}const l=L[lo];
    const s=l.stop?l.s0:l.s0+t80LegS(l.s1-l.s0,l.v0,l.v1,clamp(tau-l.t0,0,l.t1-l.t0));const p=t41At(P,s);
    return {x:p.x,z:p.z,dx:p.dx,dz:p.dz,moving:!l.stop,stop:l.stop||null,s,leg:l,run:R,k:l.stop?(tau-l.t0)/(l.t1-l.t0):0};}}
// the next call at stop A from hour h: {arr,dep,run,lap} (only runs already in the book)
function t80NextAt(A,h){for(const R of t80Runs()){if(R.end<h)continue;for(const l of t80Time(R.laps))if(l.stop===A&&R.t0+l.t0>=h-.002)return {arr:R.t0+l.t0,dep:R.t0+l.t1,run:R,lap:l.lap};}return null;}
// after leaving A on run R, when it reaches B (needs laps): {arr, laps}
function t80ArrB(R,depA,B){const S0=t80Stops();const A0=depA-R.t0;for(let n=R.laps;n<=R.laps+2;n++){for(const l of t80Time(n))if(l.stop===B&&l.t0>A0+.001)return {arr:R.t0+l.t0,dep:R.t0+l.t1,laps:n};}return null;}
// ---- asking for a bus. The book holder (the host) answers: the bus that's out comes round again; else one due soon; else the
// county sends one now (and the run it would have run into is dropped). dry: only say when, change nothing.
function t80Ask(A,B,h,dry){const b=t80Day();if(!b)return null;h=h==null?S.hour:h;if((h>=T80_LAST||h<6.5)&&!t80Where(h))return null;
  const runs=t80Runs(),cur=runs.find(R=>h>=R.t0&&h<R.end);
  let pick=null;
  if(cur){for(let n=cur.laps;n<=cur.laps+2&&!pick;n++){for(const l of t80Time(n))if(l.stop===A&&cur.t0+l.t0>=h+.01){pick={R:cur,n,arr:cur.t0+l.t0,dep:cur.t0+l.t1};break;}}}
  else{const nx=t80NextAt(A,h+.01);if(nx&&nx.arr-h<=.6)pick={R:nx.run,n:nx.run.laps,arr:nx.arr,dep:nx.dep};
    else if(h<T80_LAST&&h>=6.5){const l=t80Time(1).find(q=>q.stop===A);if(l){const t0=t80SendAt(h,l.t0,runs);const r={t0:+t0.toFixed(4),laps:1};pick={R:{r,t0:r.t0,laps:1,fresh:1},n:1,arr:r.t0+l.t0,dep:r.t0+l.t1};}}}
  if(!pick)return null;
  // and on to B
  let laps=pick.n,arrB=null;if(B){const RR={t0:pick.R.t0,laps:pick.n};const q=t80ArrB(RR,pick.dep,B);if(q){laps=Math.max(laps,q.laps);arrB=q.arr;}}
  if(!dry){if(pick.R.fresh){pick.R.r.laps=laps;const end=pick.R.t0+t80Time(laps).dur;b.runs=b.runs.filter(r=>!(r.t0>=pick.R.t0&&r.t0<end));b.runs.push(pick.R.r);}
    else if(pick.R.r.laps<laps)pick.R.r.laps=laps;}
  return {arr:pick.arr,dep:pick.dep,arrB,laps};}
// when a bus sent for you sets off: it's already out on the loop a few minutes short of your stop, wherever nobody can see it
// join the road (out of sight of you and everyone on the farm), and never while the last run is still out; else from the garage
function t80SendAt(h,offA,runs){let prevEnd=-1;for(const R of runs)if(R.t0<=h)prevEnd=Math.max(prevEnd,R.end);
  const eyes=[[P.x,P.z]];try{if(typeof others==='function')for(const p of others()){const q=p.presence;if(q&&!q.r&&isFinite(q.x))eyes.push([q.x,q.z]);}}catch(e){}
  for(const lead of [.07,.1,.14,.19,.25,.33,.45,.6]){const t0=h+lead-offA;if(t0>h||t0<prevEnd)continue;
    const w=t80WhereRun({t0,laps:1},h);if(w&&eyes.every(([x,z])=>Math.hypot(w.x-x,w.z-z)>24))return t0;}
  return h;}
// on a shared farm a farmhand asks the host, and the host's answer comes back in the book
function t80Call(A,B){if(t41Guest()){try{CO.room.emit('tr80',{op:'call',a:A,b:B,h:+S.hour.toFixed(4),by:t41Me()},HOST.hostPeer);}catch(e){}return t80Ask(A,B,S.hour,true);}
  const r=t80Ask(A,B,S.hour,false);if(r)try{saveGame&&saveGame(true);}catch(e){}return r;}
{const _hw=hostWire;hostWire=function(){const r0=_hw.apply(this,arguments);const r=CO.room;if(!r||!r.on)return r0;
  HOST.off.push(r.on('tr80',m=>{if(!m||m.isMe||HOST.role!=='host'||!m.data)return;try{const d=m.data;if(d.op==='call'&&T80_STOP[d.a]&&(!d.b||T80_STOP[d.b]))t80Ask(d.a,d.b||null,Math.max(S.hour,+d.h||0),false);}catch(e){}}));
  return r0;};}
// ---- the old network gives way: no more three-bus timetable (the old route builder finds nothing), and the town's riders, the
// map and the stop pages ask the new timetable
t41BusRoute=function(){return null;};
t41BusPhases=function(){return [];};
// (the town only rides a bus that's due within half an hour: nobody stands at a stop all morning for the noon run)
{const _tt=t41Trip;t41Trip=function(kind,A,B){if(kind!=='bus')return _tt.apply(this,arguments);const nx=t80NextAt(A,S.hour);if(!nx||nx.dep-S.hour>.5)return null;
  for(const l of t80Time(nx.run.laps))if(l.stop===B&&nx.run.t0+l.t0>nx.dep)return {dep:nx.dep,arr:nx.run.t0+l.t0,depWait:nx.arr,veh:'bus',phase:0};return null;};}
// (t41StopsBuilt reads T41_STOPS, which now holds only the loop's four)
// ---- the bus this frame: its sprite, where it stands, its footprint turned with it
const T80F={frame:-1,car:null,w:null};
function t80Car(){if(T80F.frame===FRAME_NO)return T80F.car;T80F.frame=FRAME_NO;T80F.car=null;if(S.room||!S.emp||!S.emp.tr||!S.emp.tr.bus)return null;
  const w=t80Where();T80F.w=w;if(!w)return null;if(Math.hypot(w.x-P.x,w.z-P.z)>70&&!T80R.on)return null;
  const v=t80View(w.dx,w.dz),[hx,hz]=T80H[v];const f=w.moving?Math.floor(w.s/.42)%3:0;const door=!!w.stop&&w.k>.12&&w.k<.88&&hx>.2;
  const riders=(T41V.riding.bus|0)>0||T80R.on&&T80R.st==='aboard'||t80PeerAboard(w);const lit=t41Lit();
  const key=t80BusKey(v,f,door,riders,lit);const L=T80B.L/32,W=T80B.Wd/32;
  const near=w.z+L/2*Math.abs(hz)+W/2*Math.abs(hx);
  const ux=w.dx,uz=w.dz,rx=-w.dz,rz=w.dx;const foot=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[w.x+ux*a*L/2+rx*b*W/2,w.z+uz*a*L/2+rz*b*W/2]);
  T80F.car={w,v,key,x:w.x,z:near,cz:w.z,foot,lit,L,W};return T80F.car;}
// is a point inside the bus (with a margin)? in its own frame: along it and across it
function t80Inside(x,z,m,w){w=w||t80Where();if(!w)return false;const dx=x-w.x,dz=z-w.z,a=dx*w.dx+dz*w.dz,b=-dx*w.dz+dz*w.dx;return Math.abs(a)<T80B.L/64+(m||0)&&Math.abs(b)<T80B.Wd/64+(m||0);}
// a friend riding shows as a rider in the windows; drawn on the road they'd stand through the roof, so they aren't
const t80PeerAboard=w=>{try{return typeof others==='function'&&others().some(p=>p.presence&&!(p.presence.r)&&t80Inside(p.presence.x,p.presence.z,.05,w));}catch(e){return false;}};
{const _dp=drawPeer;drawPeer=function(x,z){try{if(!S.room&&S.emp&&S.emp.tr&&S.emp.tr.bus&&t80Inside(x,z,.05))return;}catch(e){}return _dp.apply(this,arguments);};}
// drawn among everything else by its near edge; you, riding, aren't drawn standing in the road
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{
  if(T80R.on&&T80R.st==='aboard'){const i=D.findIndex(d=>d.player);if(i>=0)D.splice(i,1);}
  const c=t80Car();if(c&&onScreen(c.x,c.z,260))D.push({z:c.z,mind:1,draw(){drawSpr(c.key,sx(c.x),sz(c.z));}});}catch(e){console.warn('t80 draw',e);}};}
// its shadow down and to the right like everything else's: the hull of its footprint and its roof moved along the light
{const _se=sunEnd;sunEnd=function(){try{const s=DX.sun,c=t80Car();if(c&&s&&!s.lamp&&DX.sg&&onScreen(c.x,c.z,260)){const g=DX.sg;g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(10,18,6,.9)';
    const C=c.foot.map(([x,z])=>[sx(x),sz(z)]),H=T80B.H;const hl=t41Hull(C.concat(C.map(p=>[p[0]+T41SHD.dx*H,p[1]+T41SHD.dy*H])));g.beginPath();hl.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();}}catch(e){}return _se.apply(this,arguments);};}
// after dark: its windows, lamps and the pool its headlamps throw, drawn into the light
{const _ll=lifeLight;lifeLight=function(t,L){_ll.apply(this,arguments);if(L<.15)return;try{const c=t80Car();if(!c||!onScreen(c.x,c.z,260))return;const m=SPR[c.key];if(!m||!m.lights)return;
  const X=Math.round(sx(c.x)),Y=Math.round(sz(c.z));lctx.save();lctx.globalCompositeOperation='lighter';
  for(const q of m.lights){if(q.t==='win'){if(!c.lit)continue;const [rx,ry,w,h]=q.r;lctx.fillStyle=`rgba(255,196,120,${.7*L})`;lctx.fillRect(X+rx,Y+ry,w,h);glowAt(X+rx+w/2,Y+ry+h/2,w*.8+5,[255,180,100],.2*L);}
    else if(q.t==='lamp'){glowAt(X+q.x,Y+q.y,q.r*2.6,q.c,.9*L);glowAt(X+q.x,Y+q.y,q.r*.9,[255,250,230],.85*L);}
    else if(q.t==='pool'){const R=Math.max(q.rx,q.ry),g=lctx.createRadialGradient(X+q.x,Y+q.y,2,X+q.x,Y+q.y,R);g.addColorStop(0,`rgba(255,226,160,${.7*L})`);g.addColorStop(.5,`rgba(255,210,140,${.3*L})`);g.addColorStop(1,'rgba(255,200,120,0)');
      lctx.save();lctx.translate(X+q.x,Y+q.y);lctx.scale(q.rx/R,q.ry/R);lctx.translate(-(X+q.x),-(Y+q.y));lctx.fillStyle=g;lctx.beginPath();lctx.arc(X+q.x,Y+q.y,R,0,Math.PI*2);lctx.fill();lctx.restore();}}
  lctx.restore();}catch(e){try{lctx.restore();}catch(_){}}};}
// nobody stands inside the bus: if it comes through where you are, you're put beside it, the short way out
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.room||(T80R.on&&T80R.st==='aboard'))return;try{const w=(t80Car()||{}).w;if(!w)return;
  const dx=P.x-w.x,dz=P.z-w.z,a=dx*w.dx+dz*w.dz,b=-dx*w.dz+dz*w.dx,ha=T80B.L/64+.25,hb=T80B.Wd/64+.25;if(Math.abs(a)>=ha||Math.abs(b)>=hb)return;
  if(ha-Math.abs(a)<hb-Math.abs(b)){const na=Math.sign(a||1)*ha;P.x=w.x+w.dx*na-w.dz*b;P.z=w.z+w.dz*na+w.dx*b;}else{const nb=Math.sign(b||1)*hb;P.x=w.x+w.dx*a-w.dz*nb;P.z=w.z+w.dz*a+w.dx*nb;}}catch(e){}};}
// ---- riding: pick where you're going at the stop; wait (on your own the wait passes in a blink); it draws up, you get on;
// the view rides with it round the loop; it calls at every stop; you get off where you're going, or at the next stop if you ask
const T80R={on:false,st:'',A:null,B:null,req:null,arr:0,t:0,since:0};
// the stop's spots: where you wait (beside the post, a step back from the road), and where you step on and off (by the door)
function t80Spots(id){const st=T41_STOP_BY[id];const at=st.at;const side=Math.sign(at[1]-(id==='wick'?46:-6))||1,go=id==='wick'?-1:1;return {wait:[at[0]+.45*go,at[1]+.25*side],door:[at[0]+.7*go,at[1]-.4*side]};}
const t80Shared=()=>typeof wcShared==='function'&&wcShared();
function t80Name(id){return (T41_STOP_BY[id]||{}).name||id;}
function t80Board(A,B){if(T80R.on)return;
  // in a contest another player's line charges its fare, paid to its owner (as the old line did)
  const fare=t41RideFare();if(fare&&S.coins<fare){SFX.deny&&SFX.deny();toast(`The fare is ${fare}. You have ${S.coins}.`,2.2);return;}
  const r=t80Call(A,B);if(!r){toast(S.hour>=T80_LAST?'The last bus has gone in. It runs again from seven.':'No bus is coming here today.',2.6);return;}
  if(fare){S.coins-=fare;updateHud&&updateHud();t41PayOwner(fare,'fare');}
  $('note').hidden=true;S.paused=false;Object.assign(T80R,{on:true,st:'wait',A,B,req:null,arr:r.arr,t:0,since:S.hour});const sp=t80Spots(A);
  // on your own, the wait goes by in a blink: the bus is pulling in when you look up
  const wait=r.arr-S.hour;if(!t80Shared()&&wait>.05){fade(1);setTimeout(()=>{S.hour=Math.max(S.hour,r.arr-.028);P.x=sp.wait[0];P.z=sp.wait[1];P.dir=A==='wick'?'S':'N';fade(0);
      toast(`You wait ${Math.round(wait*60)} minutes. Here it comes.`,2.4);},520);}
  else{P.walkTo={x:sp.wait[0],z:sp.wait[1],t:0,then(){P.dir=A==='wick'?'S':'N';}};toast(wait>.05?`The bus is due at ${t41TimeStr(r.arr)}.`:'Here it comes.',2.4);}
  t80Hud(true);}
function t80Off(id,why){const sp=t80Spots(id);P.x=sp.door[0];P.z=sp.door[1];try{collide(P,.3);}catch(e){}P.dir=id==='wick'?'N':'S';T80R.on=false;T80R.st='';t80Hud(false);
  SFX.engine&&SFX.engine(false);SFX.thud&&SFX.thud(0,.2);if(why)toast(why,2.4);}
{const _u=update;update=function(dt){_u(dt);if(!T80R.on)return;try{
  if(S.room||S.mode!=='play'){if(T80R.st==='aboard'){T80R.on=false;SFX.engine&&SFX.engine(false);}T80R.on=false;t80Hud(false);return;}
  T80R.t+=dt;const w=t80Where();
  if(T80R.st==='wait'){const sp=t80Spots(T80R.A);
    // walked off: you stop waiting
    if(Math.hypot(P.x-sp.wait[0],P.z-sp.wait[1])>4.5&&!P.walkTo){T80R.on=false;t80Hud(false);toast('You stop waiting for the bus.',2);return;}
    if(!w&&S.hour>T80R.arr+.12){T80R.on=false;t80Hud(false);toast('The bus never came.',2.4);return;}
    if(w&&w.stop===T80R.A&&!w.moving){if(!P.walkTo&&w.k<.5)P.walkTo={x:sp.door[0],z:sp.door[1],t:0};
      if(w.k>.5){T80R.st='aboard';T80R.t=0;T80R.left=false;P.walkTo=null;P.anim=null;SFX.thud&&SFX.thud(0,.25);SFX.engineStart&&SFX.engineStart();SFX.engine&&SFX.engine(true);
        const TT=TR41();TT.rides=(TT.rides|0)+1;try{guideS&&(guideS().rode41=1);}catch(e){}}}
    t80Hud(true);return;}
  if(T80R.st==='aboard'){if(!w){t80Off(T80R.B,null);return;}P.x=w.x;P.z=w.z;P.walkTo=null;if(w.moving)T80R.left=true;
    // (it calls where you're going, or where you pulled the cord for; not where you got on, until it's been round)
    if(T80R.left&&w.stop&&!w.moving&&w.k>.35&&(w.stop===T80R.B||w.stop===T80R.req)){t80Off(w.stop,`${t80Name(w.stop)}. ${t41TimeStr(S.hour)}.`);return;}
    t80Hud(true);}}catch(e){console.warn('t80 ride',e);T80R.on=false;t80Hud(false);SFX.engine&&SFX.engine(false);}};}
// the next stop the bus calls at from where it is now
function t80NextStop(){const w=t80Where();if(!w)return null;const L=t80Time(w.run.laps);const tau=S.hour-w.run.t0;for(const l of L)if(l.stop&&l.t1>tau+.001&&!(l.stop===w.stop&&!w.moving&&w.k>.5))return l.stop;return null;}
// while you wait or ride, the one thing to press: stop waiting, or ask for the next stop
{const _cc=computeContext;computeContext=function(){if(T80R.on&&S.mode==='play'&&!S.room){
    if(T80R.st==='aboard'){const nx=t80NextStop();if(nx&&nx!==T80R.B&&nx!==T80R.req)return {label:`Get off at ${t80Name(nx)}`,ok:true,act(){T80R.req=nx;SFX.click&&SFX.click();toast(`You pull the cord. It'll stop at ${t80Name(nx)}.`,2.2);}};
      return {label:`Riding to ${t80Name(T80R.req||T80R.B)}`,ok:false,act(){}};}
    if(T80R.st==='wait')return {label:'Stop waiting',ok:true,act(){T80R.on=false;P.walkTo=null;t80Hud(false);toast('You stop waiting for the bus.',2);}};}
  return _cc.apply(this,arguments);};}
{const _sa=startAnim;startAnim=function(){if(T80R.on&&T80R.st==='aboard')return;return _sa.apply(this,arguments);};}
// the little card over the play: waiting (when it's due) or riding (where to, and the next stop); written only when it changes
const T80HUD={el:null,txt:''};
function t80Hud(on){let el=T80HUD.el;if(!on){if(el&&!el.hidden){el.hidden=true;T80HUD.txt='';}return;}
  if(!el){el=T80HUD.el=document.createElement('div');el.id='t80ride';el.hidden=true;document.body.appendChild(el);
    const css=document.createElement('style');css.textContent=`#t80ride{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 74px);transform:translateX(-50%);z-index:40;pointer-events:none;
      padding:5px 12px 6px;background:#efe3c4;color:#2a1a0e;border:2px solid #5a3a1e;box-shadow:0 2px 0 #1a0e06;font:13px/1.3 'Hollow Pixel',ui-monospace,monospace;text-align:center;white-space:nowrap;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
      #t80ride b{color:#3f6246;font-weight:normal;letter-spacing:.04em}`;document.head.appendChild(css);}
  let t='';if(T80R.st==='wait')t=`<b>MARROW CO.</b> · to ${t80Name(T80R.B)} · ${S.hour<T80R.arr-.01?'due '+t41TimeStr(T80R.arr):'pulling in'}`;
  else{const nx=t80NextStop();t=`<b>MARROW CO.</b> · to ${t80Name(T80R.req||T80R.B)}${nx&&nx!==(T80R.req||T80R.B)?' · next: '+t80Name(nx):''}`;}
  if(t!==T80HUD.txt){T80HUD.txt=t;el.innerHTML=t;}if(el.hidden)el.hidden=false;}
// ---- at the stop: where it goes, and when you'd be there
{const _os=t41OpenStop;t41OpenStop=function(kind,id){if(kind!=='bus')return _os.apply(this,arguments);if(T80R.on||T41R.on)return;t80OpenStop(id);};}
function t80OpenStop(id){const here=T41_STOP_BY[id];if(!here)return;const T=TR41(),fare=t41RideFare();let h=`<h3>Bus stop · ${here.name}</h3>`+t41Diagram('bus:'+id);
  const dests=t80Built().filter(s=>s!==id).map(s=>T41_STOP_BY[s]);
  const nx=t80NextAt(id,S.hour);
  if(S.hour>=T80_LAST&&!(nx&&nx.arr<S.hour+.5)||S.hour<6.5)h+=`<p>${S.hour<12?'The first bus comes out at seven.':'The last bus has gone in. It comes out again at seven.'}${isNight()?' Whatever stops here before then, don’t get on it.':''}</p>`;
  else{h+=`<p class="t41svc">MARROW CO. · round the Valley Loop · ${fare?`fare <b>${fare}</b>, paid to ${T.by}`:'you ride free'}</p>`;
    h+=`<p class="t41svc">${nx&&nx.arr-S.hour<=.6?`The next bus is due at <b>${t41TimeStr(nx.arr)}</b>.`:'No bus is due soon. Pick where you’re going and the county will send one out.'}</p><div class="t41dest">`;
    for(const d of dests){const tr=t80Ask(id,d.id,S.hour,true);const walk=Math.hypot(d.at[0]-here.at[0],d.at[1]-here.at[1])*1.35/168;
      if(!tr||tr.arrB==null){h+=`<button class="t41go off" disabled><span class="n">${d.name}</span><span class="t">no more today</span></button>`;continue;}
      const mins=Math.max(1,Math.round((tr.arrB-S.hour)*60)),slow=(tr.arrB-S.hour)>walk;
      h+=`<button class="t41go${slow?' slow':''}" data-k="${d.id}"><span class="n">${d.name}</span><span class="t">${mins<60?mins+' min':Math.floor(mins/60)+' h'+(mins%60?' '+(mins%60)+' min':'')} · ${t41TimeStr(tr.arrB)}</span>${slow?'<span class="t41slow">walk it, it’s quicker</span>':''}</button>`;}
    h+='</div>';}
  openNote(h,'Not now',()=>{});t41Modal();
  document.querySelectorAll('#noteText .t41go[data-k]').forEach(b=>b.addEventListener('click',()=>{t80Board(id,b.dataset.k);},{once:true}));}
// ---- the line diagram on the stop and in the farm book: the loop drawn out from Hollow Acre round and back, each stop where it
// lies along it, where the bus is now; the railway under it as it stands
{const _dg=t41Diagram;t41Diagram=function(here){const T=TR41();const S0=t80Stops(),Lp=T80.lapLen||1;
  // the four stops evenly along the line (Hollow Acre at both ends, round and back), the bus between the two it's between
  const ids=['farm','town','quarry','wick'],X=i=>i*25;
  let h='<div class="t41dia"><div class="t41ln bus"><div class="t41lab">MARROW CO. · the Valley Loop, round and back to Hollow Acre</div><div class="t41track"><div class="t41rule" style="left:0;right:0"></div>';
  ids.forEach((id,i)=>{h+=`<span class="t41st${T.bus&&T.stops[id]?' on':''}${here==='bus:'+id?' here':''}" style="left:${X(i)}%">${here==='bus:'+id?'<em>you are here</em>':''}<i></i><b>${t80Name(id)}</b></span>`;});
  h+=`<span class="t41st${T.bus?' on':''}" style="left:100%"><i></i><b>Hollow Acre</b></span>`;
  const w=t80Where();if(w&&w.x<150.5){const rel=s=>((s-S0.farm)%Lp+Lp)%Lp;const marks=ids.map(id=>rel(S0[id])).concat([Lp]);const r=rel(w.s);let x=100;
    for(let i=0;i<4;i++)if(r>=marks[i]&&r<=marks[i+1]){x=X(i)+25*(r-marks[i])/Math.max(1,marks[i+1]-marks[i]);break;}
    h+=`<img class="t41veh" src="${t41Ico('bus')}" style="left:${x.toFixed(1)}%" alt="bus">`;}
  h+='</div></div>';
  return h+t80RailDia(here)+'</div>';};}
// (the railway's rows: for now as they were)
function t80RailDia(here){return '';}
function t80RailDiaOld(here){const T=TR41();if(!T.valley)return '';const sts=t41Stations();return `<div class="t41ln rail"><div class="t41lab">MARROW VALLEY LINE</div><div class="t41track"><div class="t41rule"></div>`+
  sts.map((s,i)=>`<span class="t41st on${here==='train:'+s.id?' here':''}" style="left:${sts.length>1?(i/(sts.length-1)*100).toFixed(1):50}%">${here==='train:'+s.id?'<em>you are here</em>':''}<i></i><b>${s.name}</b></span>`).join('')+'</div></div>';}
// ---- the farm book's Transit page: one bus, the four stops on its loop, no more buses to buy
t41NextBuy=function(T){const coin=p=>p?`· ${p}`:'· free';const btn=(op,lab,id)=>`<button data-t41="${op}"${id?` data-id="${id}"`:''} ${S.coins<t41Price(op)?'class="nope"':''}>${lab} ${coin(t41Price(op))}</button>`;
  if(!T.bus)return t41Row('The county bus','The old county bus and a stop at your gate. It goes round the Valley Loop three times a day.',btn('bus','Buy'));
  const st=T41_STOPS.find(s=>!T.stops[s.id]);if(st)return t41Row(st.name,`${st.note}. The next stop to put up.`,btn('stop','Put up a stop',st.id));
  return '';};
{const _bk=t41Book;t41Book=function(){const T=TR41(),run=t41CanRun();const coin=p=>p?`· ${p}`:'· free';
  if(!t41Open())return _bk.apply(this,arguments);
  let h=t41Diagram('');
  const L=T.log[0];if(L)h+=`<p class="bwlead">Yesterday: ${L.bus?`${L.bus} on the bus`:''}${L.bus&&L.train?', ':''}${L.train?`${L.train} on the train`:''}. Fares ${L.fareB+L.fareT}, upkeep ${L.up}: <b style="color:${L.net>=0?'#3a5a2a':'#a8281c'}">${L.net>=0?'+':''}${L.net}</b>.${L.named.length?` Seen riding: ${L.named.join(', ')}.`:''}</p>`;
  else if(T.bus||T.valley)h+=`<p class="bwlead">The first takings come in tomorrow morning.</p>`;
  if(run){const nx=t41NextBuy(T);if(nx)h+='<h4>Next for the line</h4>'+nx;}
  if(!run)h+=`<p class="bzs">${T.by}’s line. You can ride it; ${T.fare?`the fare is <b>${T.fare}</b>, paid to ${T.by}.`:'it’s free for now.'}</p>`;
  h+='<h4>The county bus</h4>';
  if(!T.bus)h+=t41Row('The county bus',`The county’s old bottle-green bus, MARROW CO. on its sides, laid up since the last driver went into the reservoir. Buy it and it goes round the Valley Loop at seven, noon and five, calling at the stops you put up, and the county sends it out whenever someone waits for it. Upkeep ${T41_UPKEEP.bus} a day; fares ${T41_FARE.bus} a rider. Comes with the stop at your gate.`,run?`<button data-t41="bus" ${S.coins<t41Price('bus')?'class="nope"':''}>Buy ${coin(t41Price('bus'))}</button>`:'');
  else for(const st of T41_STOPS){const b=T.stops[st.id];h+=t41Row(`${b?'✓ ':''}${st.name}`,`${st.note}.${b?' Built day '+b.day+'.':''}`,b||!run?'':`<button data-t41="stop" data-id="${st.id}" ${S.coins<t41Price('stop')?'class="nope"':''}>Put up a stop ${coin(t41Price('stop'))}</button>`);}
  h+=t80BookRail(T,run,coin);
  if(t41Compete()&&(T.bus||T.valley)&&run)h+=`<h4>The fare for other players</h4><p class="bzs">Other farms ride your line for <b>${T.fare|0}</b> a ride, paid to you.${T.paidIn?` They’ve paid you ${T.paidIn} so far.`:''} You ride free.</p><p><span class="mc34sw"><button data-t41fare="-1">− 1</button><b style="margin:0 10px">${T.fare|0}</b><button data-t41fare="1">+ 1</button></span></p>`;
  else if(T.bus||T.valley)h+=`<p class="bzs">You ride free.${typeof mpOn==='function'&&mpOn()?' So does everyone on this farm.':''}</p>`;
  if(T.log.length>1){h+='<h4>The last week</h4>';for(const r of T.log.slice(0,6))h+=`<div class="t41log"><span>Day ${r.day}</span><span>${r.bus+r.train} riders</span><span style="color:${r.net>=0?'#3a5a2a':'#a8281c'}">${r.net>=0?'+':''}${r.net}</span></div>`;}
  return h+'<div style="height:6px"></div>';};}
// the railway isn't the farm's to build: it's the long line out of the valley, and the company has closed it for now
function t80BookRail(T,run,coin){return `<h4>The railway</h4><p class="bzs">The rails down Mill Road belong to the long line out of the valley, not the county. The company has closed it to passengers for now. Nobody will say until when.</p>`;}
// the book can't buy a second fleet any more
{const _ap=t41Apply;t41Apply=function(op){if(op==='bus2'||op==='valley'||op==='south'||op==='dining')return false;return _ap.apply(this,arguments);};}
// ---- the world map: the bus where it is, and the next one due at a stop
if(typeof m6Transit==='function'){const _m6=m6Transit;m6Transit=function(){const o=_m6.apply(this,arguments);try{if(o&&o.veh&&typeof M6L!=='undefined'&&M6L.transit){const w=t80Where();if(w)o.veh.push({x:w.x,z:w.z,icon:'bus'});}}catch(e){}return o;};}
if(typeof m6NextAt==='function'){const _mn=m6NextAt;m6NextAt=function(kind,sid){if(kind!=='bus')return _mn.apply(this,arguments);try{const n=t80NextAt(sid,S.hour);return n?n.arr:null;}catch(e){return null;}};}
// ---- an old save: the stops off the loop come down and the extra buses go back, and what they cost comes back with one line
function t80Settle(){if(!t41Host())return;const T=S.emp&&S.emp.tr;if(!T||T.v80)return;T.v80=1;let back=0;const gone=[];
  for(const id of Object.keys(T.stops||{}))if(!T80_STOP[id]){delete T.stops[id];back+=t41Price('stop')|0;gone.push((T41_STOP_BY[id]||{}).name||id);}
  if(T.bus2){delete T.bus2;back+=t41Price('bus2')|0;}
  let rail=0;for(const k of ['valley','south','dining'])if(T[k]){delete T[k];rail+=t41Price(k)|0;}const hadRail=rail>0||T.railGone;back+=rail;
  if(!back&&!gone.length)return;
  const owner=T.by||t41Me();if(back){if(typeof mpOn==='function'&&mpOn()&&typeof mkPay==='function'&&owner!==t41Me())mkPay(owner,back,`The county bus: ${back} coins back.`);else{S.coins+=back;updateHud&&updateHud();}}
  try{t41Build();t41Sync(true);}catch(e){}try{saveGame&&saveGame(true);}catch(e){}
  setTimeout(()=>toast(hadRail?`The rail company took its line back, closed for now: ${back} coins back for the rail${gone.length||T.bus2?' and the bus stops off the new loop':''}.`
    :`The county bus runs one loop now, round Hollow Acre, Marrow Hollow, Quarry Road and Wickham.${back?` ${back} coins back for the rest.`:''}`,4.5),2600);}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<1.3)return;t=0;try{if(S.mode==='play')t80Settle();}catch(e){}};}
// the day's timetable is written at dawn (and the book keeps it)
{const _nd=newDay;newDay=function(){const r=_nd.apply(this,arguments);try{t80Day();}catch(e){}return r;};}
// ---- the bus is drawn ahead of time, a view at a time while nothing else is happening, so it never stutters into sight
const T80W={q:null,lit:-1};
function t80Warm(){try{if(S.mode!=='play'||!S.emp||!S.emp.tr||!S.emp.tr.bus)return;const lit=t41Lit()?1:0;
  if(!T80W.q||T80W.lit!==lit){T80W.lit=lit;T80W.q=[];for(const rd of [0,1])for(const v of ['E','S','W','N','SE','SW','NE','NW'])for(let f=0;f<3;f++)T80W.q.push([v,f,0,rd,lit]);
    for(const rd of [0,1])for(const v of ['E','NE','SE'])T80W.q.push([v,0,1,rd,lit]);}
  const k=T80W.q.shift();if(k)t80BusKey(...k);}catch(e){}}
setInterval(()=>{if(typeof requestIdleCallback==='function')requestIdleCallback(t80Warm,{timeout:400});else t80Warm();},350);
// ---- what the town says, on the loop as it is now
try{T41_SAY.generic[0]='Rode your bus round to Wickham. The driver wouldn’t take my coins past the reservoir. Said nobody pays out there.';
  const lsb=typeof LS_SIDE!=='undefined'&&LS_SIDE.find(q=>q.id==='transit41b');if(lsb){lsb.done='See? Twenty minutes to Wickham. My mother walked it every day of her life.';
    lsb.say='Stand at any stop and open it: pick where you’re going, and if no bus is due the county sends one round. It costs you nothing and saves your legs. It goes round the loop, so sit tight, or pull the cord for the next stop.';}}catch(e){}
// the dev hook the tests use
if(typeof window!=='undefined')window.__t80={T80,T80R,t80Where,t80Runs,t80Ask,t80Board,t80Path,t80Stops,t80Time,t80Car,t80NextAt,t80Day,t80OpenStop};
