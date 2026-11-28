/* ================= t380 the railway: the long line out of the valley. The owner: "the trains should be larger for going to a new
   part area when I add to the story so don't let players add them in yet but it needs to be a long journey unlike buses where
   the player will be on the train for 3 in game days and they will be able to do stuff on the trains and have fun but that's
   for later".
   - The railway is part of the world now, not something the farm builds: one line, laid down the west side of Mill Road from
     the Crossroads station (the end of the line, for Hollow Acre and Marrow Hollow) south past the Deep Corn into the woods
     at the Low Fields, where it runs on out of the valley.
   - A big train: a tender engine (6.25 m), its tender and three long coaches in maroon and cream, larger than the people
     and the bus as a real train is. Now and then one comes up the line, stands at the Crossroads with steam up, and goes back.
   - Boarding isn't possible yet: the company has closed the line to passengers. The notice on the platform says so, and
     rl80Board() is the one place a journey will start from (the three-day ride, later).
   ================= */
// ---------------------------------------------------------------- the paint (hue-shifted, more steps than the old line's)
const R80P={maroon:['#1e0c0e','#33141a','#4c1c22','#66262a','#843632','#a24c40','#bc6a56'],cream:T80P.cream,green:T80P.green,roof:T80P.roof,
  iron:['#121318','#1d1f26','#2b2e37','#3d414c','#555a66','#727886','#959ba8'],brass:T41P.brass,steel:T41P.steel,red:['#2e0e0c','#521812','#7c2418','#a63624','#c8523a'],lamp:T41P.lamp};
// a rail wheel side-on: the tyre lit at the top-left, six spokes turning, the hub, a dark flange line under the rim
function r80Wheel(K,cx,cy,r,f,spokes){const I=R80P.iron,S=R80P.steel;spokes=spokes||6;
  K.ell(cx,cy,r,r,(x,y,nx,ny,d)=>d>.84?(nx+ny<-.6?I[5]:nx+ny>.5?I[1]:I[3]):(d>.78?I[0]:null));
  const rot=f/3*Math.PI*2/spokes;for(let k=0;k<spokes;k++){const a=rot+k*Math.PI*2/spokes;for(let t=2.5;t<r*.8;t+=.5)K.px(Math.round(cx+Math.cos(a)*t),Math.round(cy+Math.sin(a)*t),1,1,Math.cos(a-2.36)>0?I[4]:I[2]);}
  K.ell(cx,cy,Math.max(2.5,r*.18),Math.max(2.5,r*.18),(x,y,nx,ny)=>nx+ny<0?S[4]:S[2]);}
// shared: the outline a deep version of what it borders, lighter on the lit top-left; buffers and a coupling at an end
function r80Outline(K){K.outline=function(){const W=K.W,Hh=K.H,D=K.g.getImageData(0,0,W,Hh),d=D.data,out=[];const A=(x,y)=>x>=0&&y>=0&&x<W&&y<Hh&&d[(y*W+x)*4+3]>40;
  for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){if(A(x,y))continue;let src=null,lit=false;for(const [dx,dy,l] of [[1,0,1],[0,1,1],[-1,0,0],[0,-1,0]]){if(A(x+dx,y+dy)){src=((y+dy)*W+x+dx)*4;lit=!!l;break;}}
    if(src!==null){const k=lit?.64:.4;out.push([x,y,`rgb(${Math.round(d[src]*k+8)},${Math.round(d[src+1]*k+6)},${Math.round(d[src+2]*k+10)})`]);}}
  for(const [x,y,col] of out)K.px(x,y,1,1,col);};}
function r80Buffers(Sc,u,dir,Wd,h){const S=R80P.steel,I=R80P.iron;const u1=u+dir*7;const vw=Sc.view||'S';
  // (side-on only the near buffer: the far one would peek over it and read as a stack of knobs)
  for(const v of vw==='E'?[Wd-11]:vw==='W'?[11]:[11,Wd-11]){Sc.tube(Math.min(u,u+dir*5),Math.max(u,u+dir*5),v,h,2.6,F=>t41Sh(I,F.lit,3,4));Sc.tube(Math.min(u+dir*5,u1),Math.max(u+dir*5,u1),v,h,4.6,F=>F.part!=='side'?(F.s+F.t<6?S[4]:S[3]):t41Sh(S,F.lit,2.6,4));}
  Sc.box(Math.min(u,u+dir*6),Math.max(u,u+dir*6),Wd/2-2,Wd/2+2,h-4,h-1,F=>t41Sh(I,F.lit,2.6,4));}
// an ellipse across the length (a boiler a little wider than it is tall, so it reads the same side-on and end-on)
const r80Oval=(vc,hc,rx,ry)=>{const P=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;P.push([vc+Math.cos(a)*rx,hc+Math.sin(a)*ry]);}return P;};
// ---------------------------------------------------------------- THE ENGINE: a six-coupled tender engine, built once
// 7 m (224 px) long, 2.25 m (72) wide over the running boards, 3.8 m to the chimney top. Driving wheels as tall as a man; a
// bogie under the smokebox with the cylinders over it; the boiler with three bands, the brass dome and safety valves, the cab
// with round spectacles, the headlamp on the smokebox. Green, lined in red at the running board.
const R80E={L:224,Wd:72,rails:[20,52]};
function r80EngWheels(view,f){const {L}=R80E,I=R80P.iron,S=R80P.steel;const fx=u=>view==='E'?u:L-u;const GY=50;
  return t41Can(L+4,GY+2,K=>{const rot=f/3*Math.PI*2/3;
    for(const u of [186,208]){r80Wheel(K,fx(u),GY-11,11,f,8);K.box(fx(u)-4,GY-20,9,6,I[3]);K.box(fx(u)-4,GY-20,9,1,I[5]);}
    K.box(Math.min(fx(176),fx(218)),GY-24,42,3,I[3]);K.box(Math.min(fx(176),fx(218)),GY-24,42,1,I[5]);
    const pins=[];for(const u of [54,102,150]){r80Wheel(K,fx(u),GY-23,23,f,14);K.ell(Math.round(fx(u)+Math.cos(rot+Math.PI)*10),Math.round(GY-23+Math.sin(rot+Math.PI)*10),7,5,()=>I[1]);pins.push([fx(u)+Math.cos(rot)*9,GY-23+Math.sin(rot)*9]);}
    // the coupling rod over the crank pins, the connecting rod forward to the crosshead on its slide bars, the piston rod into
    // the cylinder
    for(let i=0;i<2;i++){K.line(pins[i][0],pins[i][1],pins[i+1][0],pins[i+1][1],S[3]);K.line(pins[i][0],pins[i][1]+1,pins[i+1][0],pins[i+1][1]+1,I[2]);}
    const ch=[fx(170),GY-30];K.line(pins[2][0],pins[2][1],ch[0],ch[1],S[4]);K.line(pins[2][0],pins[2][1]+1,ch[0],ch[1]+1,I[2]);
    for(const p of pins)K.box(Math.round(p[0])-1,Math.round(p[1])-1,3,3,S[4]);
    K.box(Math.min(fx(160),fx(182)),GY-33,22,2,S[3]);K.box(Math.min(fx(160),fx(182)),GY-28,22,1,S[2]);K.box(ch[0]-2,GY-32,5,5,S[4]);K.box(Math.min(ch[0],fx(184)),GY-31,Math.abs(fx(184)-ch[0]),1,S[4]);});}
// the smokebox door: a dished plate in a rim, two hinge straps, the dart, and the number plate over it
function r80SmokeTex(R){const I=R80P.iron,B=R80P.brass,D=2*R;return t41Tex(D,D,K=>{
  K.ell(R,R,R-.5,R-.5,(x,y,nx,ny,d)=>d>.92?(nx+ny<-.4?I[5]:I[1]):(nx+ny<-.5?I[4]:nx+ny>.5?I[2]:I[3]));
  K.ell(R,R+2,R*.68,R*.68,(x,y,nx,ny,d)=>d>.9?(nx+ny<-.3?I[5]:I[4]):(nx+ny>.6?I[2]:I[3]));
  for(const y of [Math.round(R*.7),Math.round(R*1.45)]){K.box(Math.round(R*.4),y,Math.round(R*.7),1,I[5]);K.box(Math.round(R*.4),y+1,Math.round(R*.7),1,I[4]);}
  K.box(R-6,R+1,13,1,I[6]);K.box(R-6,R+2,13,1,I[4]);K.box(R-1,R,3,4,I[4]);
  K.box(R-8,3,16,7,B[1]);K.box(R-7,4,14,5,B[3]);K.box(R-7,4,14,1,B[4]);K.text('NO 7',R-6,4,'#2a1a08');});}
function r80EnginePic(view,f){const {L,Wd}=R80E,I=R80P.iron,R=R80P.red,B=R80P.brass,G=R80P.green,S=R80P.steel,LM=R80P.lamp,RF=R80P.roof;const vc=Wd/2;
  T80CAM.on=true;let Sc;try{Sc=t41Scene(L,Wd,view,130,{padX:10,padTop:2,padBot:4});}finally{T80CAM.on=false;}
  const iron=(F,b)=>t41Sh(I,F.lit,b==null?3:b,5);
  Sc.box(12,218,26,46,16,46,()=>I[1]);
  if(view==='E'||view==='W'){const c=r80EngWheels(view,f);const vN=view==='E'?R80E.rails[1]+4:R80E.rails[0]-4;Sc.bill(c,view==='E'?0:L,vN,0,0,c.height-2);}
  else{const g=t41GearCan(Wd,12);Sc.bill(g.c,view==='S'?208:20,vc,0,g.ax,g.ay);}
  // the buffer beam with its buffers and coupling, the running board lined in red with its valance, the cylinders over the bogie
  Sc.box(218,224,0,Wd,28,44,F=>{if(F.part==='side'&&!F.up)return I[4];return t41Sh(R,F.lit,3,3);});r80Buffers(Sc,224,1,Wd,36);
  Sc.box(10,218,0,Wd,46,51,F=>!F.up?(F.lit>.6?I[5]:I[4]):(F.t<1?R[4]:F.t<2?I[5]:F.t<4?R[3]:R[1]));
  for(const v of [4,Wd-4]){Sc.tube(174,206,v,36,9,F=>{if(F.part!=='side')return F.s+F.t<8?I[5]:I[3];if(Math.abs(F.u-176)<1||Math.abs(F.u-204)<1)return S[3];return iron(F,3);});}
  // the boiler with its bands (each a bright line with a dark one beside it), the smokebox with its door, the saddle
  Sc.box(190,216,18,54,46,58,()=>I[1]);
  Sc.ext('u',r80Oval(vc,72,22,18),56,194,F=>{if(F.part!=='side')return iron(F);for(const u of [92,128,164]){if(Math.abs(F.u-u)<1)return t41Sh(S,F.lit,3.2,4);if(Math.abs(F.u-u-1.5)<.6)return G[1];}
    const k=Math.round(2.6+4*(F.lit-.55));return G[Math.max(1,Math.min(5,k))];},{round:[vc,72]});
  const SM=r80SmokeTex(22);Sc.ext('u',r80Oval(vc,72,24,20),192,218,F=>F.part==='cap1'?SM((F.s/48*44),(F.t/40*44)):iron(F,2.6),{round:[vc,72]});
  // standing up off the boiler: the chimney with its lip, the brass dome and safety valves, the headlamp, the whistle
  Sc.cyl(208,vc,7,88,112,F=>F.part==='top'?(Math.hypot(F.u-208,F.v-vc)<4.8?'#060607':I[4]):iron(F,3));
  Sc.cyl(208,vc,9,110,115,F=>F.part==='top'?(Math.hypot(F.u-208,F.v-vc)<5?'#060607':I[5]):iron(F,3.4));
  Sc.cyl(136,vc,12,86,92,F=>F.part==='top'?G[3]:t41Sh(G,F.lit,3,4));Sc.cyl(136,vc,10,92,100,F=>t41Sh(B,F.lit,2.4,4));Sc.dome(136,vc,100,10,4,F=>t41Sh(B,F.lit,3,4));
  Sc.cyl(100,vc,7,86,90,F=>F.part==='top'?I[3]:t41Sh(I,F.lit,2,3));Sc.cyl(100,vc,5,90,98,F=>t41Sh(B,F.lit,2.4,4));Sc.dome(100,vc,98,5,2,F=>t41Sh(B,F.lit,3,4));
  Sc.cyl(70,vc,2,88,102,F=>t41Sh(B,F.lit,2.6,4));
  Sc.box(212,220,vc-7,vc+7,90,102,F=>{if(F.part==='cap1'){const d=Math.hypot(F.s-7,F.t-6);if(d<4.5)return d<2?LM[4]:LM[3];}return iron(F,3);});
  // the cab: round spectacles in its front over the boiler, a door opening each side, the back open to the tender; its roof
  // arched over the front, darker than the coaches' and sooted
  const cv0=6,cv1=Wd-6;
  Sc.box(12,58,cv0,cv1,51,114,F=>{
    if(F.part==='cap1'){for(const cx of [14,cv1-cv0-14]){const d=Math.hypot(F.s-cx,F.t-16);if(d<6.5)return d>5.4?S[4]:(F.s-cx+F.t-16<-3?T41P.glass[3]:T41P.glass[1]);}return t41Sh(G,F.lit,2.6,5);}
    if(F.part==='cap0'){if(F.s>8&&F.s<cv1-cv0-8&&F.t>8&&F.t<48)return F.t<10?G[1]:'#120e0c';return t41Sh(G,F.lit,3,5);}
    if(F.part==='side'&&F.up){const s=F.s;if(s>12&&s<30&&F.t>8&&F.t<44)return F.t<10||s<13.5?G[0]:(F.t>24?'#0e0c0a':(s-12)+(F.t-10)<7?T41P.glass[2]:'#120f0d');if(F.t<1)return G[5];
      if(F.t>56&&F.t<58)return R[3];if(F.t>=58)return G[2];if(s<2||s>44)return G[4];if((Math.floor(s)%9===4)&&F.t>48&&F.t<55)return G[1];}
    return t41Sh(G,F.lit,3.2,5);});
  const CR=['#1e1b20','#2a262c','#36323a','#454048','#57525a','#6a6468'];
  Sc.ext('u',[[cv0-2,114],[cv1+2,114],[cv1+2,116],[cv1-8,120],[cv1-20,122],[vc,122.5],[cv0+20,122],[cv0+8,120],[cv0-2,116]],8,62,F=>{if(F.part==='cap1')return F.t<2?CR[4]:CR[2];if(F.part!=='side')return CR[2];const [,nZ]=Sc.cam.N(F.nl[0],F.nl[1]);if(nZ>.25)return CR[1];return t41Sh(CR,F.lit,3.4,4);});
  const c=Sc.done({crease:4,inset:2,foot:[8,220,6,Wd-6],before:r80Outline});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc,stack:Sc.P(208,vc,115)};}
// ---------------------------------------------------------------- THE TENDER: 4.4 m (140), its coal heaped high, two bogies
const R80T={L:140,Wd:70};
// a bogie side-on: a frame plate lit along its top, two wheels, an axlebox over each with its leaf spring, the bolster in between
function r80Bogie(K,a,GY,f,r,sp){const I=R80P.iron,S=R80P.steel;for(const d of [-sp,sp])r80Wheel(K,a+d,GY-r,r,f,8);
  K.box(a-sp-r+2,GY-r-9,2*(sp+r)-3,5,I[3]);K.box(a-sp-r+2,GY-r-9,2*(sp+r)-3,1,I[5]);K.box(a-sp-r+2,GY-r-5,2*(sp+r)-3,1,I[1]);
  for(const d of [-sp,sp]){const x=a+d;K.box(x-4,GY-r-4,9,8,I[4]);K.box(x-4,GY-r-4,9,1,I[6]);K.box(x-4,GY-r+3,9,1,I[1]);K.box(x-1,GY-r-1,3,3,I[2]);
    for(let i=0;i<3;i++)K.box(x-6+i,GY-r-12+i,13-2*i,1,i%2?S[2]:S[3]);}
  K.box(a-5,GY-r-10,11,9,I[2]);K.box(a-5,GY-r-10,11,1,I[4]);for(let i=0;i<4;i++)K.box(a-4,GY-r-8+i*2,9,1,i%2?S[2]:S[4]);}
function r80TenWheels(view,f){const {L}=R80T;const fx=u=>view==='E'?u:L-u;const GY=30;return t41Can(L+4,GY+2,K=>{for(const u of [36,104])r80Bogie(K,fx(u),GY,f,11,15);});}
function r80Coal(Sc,u0,u1,v0,v1,h0,peak){// a heap of fist-sized lumps: the top line ragged, each lump a lit 2-3 px cluster with a dark seam round it
  const CO=['#07070a','#0f0f14','#1a1a21','#272730','#3b3b48','#5a5a6c'];const Hc=(a,b)=>{const n=Math.sin(a*12.9898+b*78.233)*43758.5453;return n-Math.floor(n);};
  const prof=[];for(let u=u0;u<=u1;u+=3){const k=(u-u0)/(u1-u0);const top=h0+peak*Math.sin(Math.PI*Math.min(1,k*1.15))-(Hc(u,7)>.5?1:0)-(Hc(u,11)>.75?1:0);prof.push([u,Math.max(h0,top)]);}
  const P=[[u0,h0],[u1,h0]].concat(prof.slice().reverse());
  Sc.ext('v',P,v0,v1,F=>{const row=Math.floor(F.v/4),cu=Math.floor((F.u+(row%2)*2.5)/5),lu=F.u+(row%2)*2.5-cu*5,lv=F.v-row*4,q=Hc(cu,row);
    if(lu>4.4&&lv>2.4)return CO[1];const base=F.lit>.6?CO[3]:CO[2];if(q>.64&&lu<3&&lv<2)return F.lit>.55?CO[5]:CO[4];return base;});}
function r80TenderPic(view,f){const {L,Wd}=R80T,I=R80P.iron,G=R80P.green,R=R80P.red,S=R80P.steel,B=R80P.brass;const vc=Wd/2;
  T80CAM.on=true;let Sc;try{Sc=t41Scene(L,Wd,view,104,{padX:10,padTop:2,padBot:4});}finally{T80CAM.on=false;}
  Sc.box(8,132,24,46,14,28,()=>I[1]);
  if(view==='E'||view==='W'){const c=r80TenWheels(view,f);Sc.bill(c,view==='E'?0:L,view==='E'?R80E.rails[1]+3:R80E.rails[0]-3,0,0,c.height-2);}
  else{const g=t41GearCan(Wd,12);Sc.bill(g.c,view==='S'?120:20,vc,0,g.ax,g.ay);}
  Sc.box(2,138,0,Wd,24,29,F=>!F.up?I[4]:(F.t<1?I[5]:I[2]));r80Buffers(Sc,2,-1,Wd,26);
  const TX=t41Tex(L,64,K=>{K.box(0,0,L,64,G[3]);K.box(0,0,L,1,G[6]);K.box(0,1,L,2,G[5]);K.box(0,3,L,1,G[4]);K.box(0,56,L,8,G[2]);K.box(0,62,L,2,G[1]);
    K.box(4,7,L-8,1,R[3]);K.box(4,52,L-8,1,R[3]);for(const x of [4,L-5])K.box(x,7,1,46,R[3]);
    for(const x of [46,94]){K.box(x,8,1,44,G[1]);K.box(x+1,8,1,44,G[4]);}for(let x=8;x<L-6;x+=6){K.px(x,5,1,1,G[1]);K.px(x,58,1,1,G[1]);}
    for(let x=0;x<L;x++){const g=Math.round(1.5+Math.sin(x*.2)+.7*Math.sin(x*.53));for(let k=0;k<g;k++)K.px(x,55-k,1,1,'#1e2e22');}
    const txt='MARROW VALLEY',tw=K.textW(txt);K.text(txt,Math.round(L/2-tw/2)+1,27,G[0]);K.text(txt,Math.round(L/2-tw/2),26,B[4]);});
  const back=t41Tex(Wd,64,K=>{K.box(0,0,Wd,64,G[3]);K.box(0,0,Wd,2,G[5]);K.box(0,56,Wd,8,G[2]);for(let y=6;y<56;y++){K.px(Wd-14,y,1,1,S[3]);K.px(Wd-9,y,1,1,S[1]);}for(let y=8;y<56;y+=6)K.box(Wd-13,y,4,1,S[4]);
    K.box(10,12,8,8,R[3]);K.box(10,12,8,1,R[4]);});
  Sc.box(4,136,0,Wd,29,92,F=>{if(F.part==='side'&&F.up)return TX(F.nl[1]>0?F.s:L-F.s,F.t);if(F.part==='cap0')return back(F.s,F.t);if(F.part==='cap1')return F.t<2?G[5]:t41Sh(G,F.lit,3,5);return F.lit>.6?G[5]:G[4];});
  r80Coal(Sc,40,134,6,Wd-6,92,13);
  Sc.cyl(20,vc,8,92,97,F=>F.part==='top'?I[4]:t41Sh(I,F.lit,2.6,4));
  const c=Sc.done({crease:4,inset:2,foot:[6,134,6,Wd-6],before:r80Outline});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// ---------------------------------------------------------------- THE COACHES: 7.5 m (240), maroon below and cream above
const R80K={L:240,Wd:72};
function r80CoachWheels(view,f){const {L}=R80K;const fx=u=>view==='E'?u:L-u;const GY=28;return t41Can(L+4,GY+2,K=>{for(const tc of [44,196])r80Bogie(K,fx(tc),GY,f,11,14);});}
function r80CoachSide(lit,right){const {L}=R80K,M=R80P.maroon,C=R80P.cream,B=R80P.brass,H=76;return t41Tex(L,H,K=>{
  // cream above the waist with the roof's shadow along its top, maroon below with panel seams, a rivet row and grime low down
  K.box(0,0,L,38,C[4]);K.box(0,0,L,3,C[2]);K.box(0,3,L,1,C[3]);K.box(0,4,L,1,C[5]);K.box(0,35,L,3,C[3]);K.box(0,38,L,1,'#1a0c0a');K.box(0,39,L,1,B[3]);
  K.box(0,40,L,H-40,M[3]);K.box(0,40,L,3,M[5]);K.box(0,43,L,2,M[4]);K.box(0,H-8,L,8,M[2]);K.box(0,H-1,L,1,M[1]);
  for(let x=4;x<L-2;x+=5)K.px(x,45,1,1,M[1]);for(const x of [30,78,126,174,222]){K.box(x,46,1,H-48,M[1]);K.box(x+1,46,1,H-48,M[4]);}
  for(let x=0;x<L;x++){const g=Math.round(2+1.2*Math.sin(x*.17)+.8*Math.sin(x*.47+2));for(let k=0;k<g;k++)K.px(x,H-9-k,1,1,k===g-1?M[2]:'#2a1214');}
  for(const d0 of [6,L-24]){K.box(d0-1,5,20,H-7,M[1]);K.box(d0,6,18,H-9,M[3]);K.box(d0,6,18,1,M[5]);t41Pane(K,d0+3,d0+14,9,26,{warm:!!lit});K.box(d0+15,46,2,2,B[4]);K.box(d0+15,46,2,1,B[3]);}
  for(let i=0;i<10;i++){const a=30+i*18;const warm=!!lit&&i!==(right?3:6);t80Pane(K,a,a+13,10,30,{warm,g:[4,6,3,5,7,4,5,3,6,4][i]});K.box(a-1,9,16,1,C[2]);K.box(a-1,31,16,1,C[5]);K.box(a-1,32,16,1,C[2]);
    if(i%3===1){K.box(a+3,5,8,3,C[5]);K.box(a+3,7,8,1,C[2]);}}
  const txt='MARROW VALLEY',tw=K.textW(txt);K.text(txt,Math.round(L/2-tw/2)+1,53,'#1a0c0a');K.text(txt,Math.round(L/2-tw/2),52,B[4]);});}
function r80CoachEnd(lit){const {Wd}=R80K,M=R80P.maroon,C=R80P.cream,S=R80P.steel,I=R80P.iron,H=76;return t41Tex(Wd,H,K=>{
  K.box(0,0,Wd,38,C[4]);K.box(0,0,Wd,3,C[2]);K.box(0,38,Wd,1,'#1a0c0a');K.box(0,39,Wd,H-39,M[3]);K.box(0,39,Wd,3,M[5]);K.box(0,H-8,Wd,8,M[2]);
  // the gangway: its bellows folds round a dark door, end windows each side of it
  K.box(24,6,24,H-10,I[2]);for(let y=6;y<H-4;y+=3){K.box(24,y,24,1,I[3]);}K.box(28,10,16,H-16,'#120e0c');t41Pane(K,30,41,13,28,{warm:!!lit});
  for(const a of [5,52])t41Pane(K,a,a+14,10,28,{warm:!!lit});});}
function r80CoachPic(view,f,riders,lit){const {L,Wd}=R80K,I=R80P.iron;const vc=Wd/2;
  T80CAM.on=true;let Sc;try{Sc=t41Scene(L,Wd,view,116,{padX:10,padTop:2,padBot:4});}finally{T80CAM.on=false;}
  Sc.box(20,220,24,48,12,24,()=>I[1]);
  if(view==='E'||view==='W'){const c=r80CoachWheels(view,f);Sc.bill(c,view==='E'?0:L,view==='E'?R80E.rails[1]+3:R80E.rails[0]-3,0,0,c.height-2);}
  else{const g=t41GearCan(Wd,11);Sc.bill(g.c,view==='S'?212:28,vc,0,g.ax,g.ay);}
  // the solebar along the bottom of the body, lit along its top; buffers and a coupling at each end
  Sc.box(0,L,0,Wd,20,25,F=>!F.up?I[4]:(F.t<1?I[5]:I[2]));r80Buffers(Sc,0,-1,Wd,22);r80Buffers(Sc,L,1,Wd,22);
  const ST=[r80CoachSide(lit,false),r80CoachSide(lit,true)],ET=r80CoachEnd(lit);
  Sc.box(2,L-2,0,Wd,25,100,F=>{if(F.part==='cap0'||F.part==='cap1')return ET(F.s,F.t);if(F.part==='side'&&F.up)return ST[F.nl[1]>0?1:0](F.s,F.t);return R80P.maroon[2];});
  // the roof: one long arch, lit by its planes from the upper left a step darker than the bus's, sooted toward the engine end
  // (u = L), a dark gutter at each eave; three torpedo vents along the crown
  const RF=['#1c1a1f','#29262c','#37333a','#47434a','#5b565b','#6f6a6b','#857f7c'],RL=(()=>{const l=[-.5,.78,-.38],n=Math.hypot(...l);return l.map(v=>v/n);})();
  const roof=F=>{if(F.part!=='side')return RF[2];if(F.h<101)return RF[0];const [nX,nZ]=Sc.cam.N(F.nl[0],F.nl[1]);let l=nX*RL[0]+F.nl[2]*RL[1]+nZ*RL[2];l-=Math.max(0,(F.u-L*.55)/(L*.45))*.22;
    return l>.84?RF[5]:l>.74?RF[4]:l>.58?RF[3]:l>.4?RF[2]:RF[1];};
  Sc.ext('u',[[-1,100],[Wd+1,100],[Wd+1,102],[Wd-8,107],[Wd-20,110],[vc,111],[20,110],[8,107],[-1,102]],0,L,roof);
  for(const u of [48,120,192])Sc.ext('u',r80Oval(vc,111.5,3,2.4),u-7,u+7,F=>F.part!=='side'?RF[3]:t41Sh(RF,F.lit,3.4,3),{round:[vc,111.5]});
  const c=Sc.done({crease:4,inset:2,foot:[4,L-4,6,Wd-6],before:r80Outline});return {c,ax:Sc.ax,ay:Sc.ay,S:Sc};}
// @@GAMEPLAY ---------------------------------------------------------------- the line, the station, the train
// the line: down the west side of Mill Road from the buffer stop at the Crossroads to the siding in the woods at the Low Fields
const R80_LINE=[[16.9,-.2],[16.9,236],[17.4,252],[16.5,270],[16.9,290],[16.9,301]];
// the Crossroads platform on the west side (clear of the bigger train), its name board at the far end, the company's notice and
// a bench; the level crossings where a road comes over the line get a crossing sign on the north side
const R80_STA={plat:{x0:13.2,z0:1.4,x1:15.65,z1:17.4},board:[14.4,.9],notice:[14.45,12.4],bench:[14.3,4.6]};
const R80_XING=[[15.1,44.3],[15.1,138.7],[15.1,195.4]];
// north to south: three coaches, the tender, the engine facing south (it leads going back down the line, the coaches lead
// coming up: a branch-line train propelled into the terminus)
const R80_CARS=[['coach',7.5],['coach',7.5],['coach',7.5],['tender',140/32],['engine',224/32]];
const R80_GAP=.25,R80_V=1000,R80_ACC=45,R80_STAND=[9.4,15.0];
const R80={path:null,cars:null,tl:0,sPlat:1.3,sSid:0};
function rl80Path(){if(R80.path)return R80.path;const P=t80Poly(R80_LINE);R80.path=P;let o=0;R80.cars=R80_CARS.map(([k,l])=>{const c={k,l,o};o+=l+R80_GAP;return c;});R80.tl=o-R80_GAP;R80.sSid=P.len-R80.tl-.6;return P;}
const r80LegT=D=>{const a=Math.min(R80_ACC,D/2);return (D-2*a)/R80_V+4*a/R80_V;};
const r80LegS=(D,t)=>{const a=Math.min(R80_ACC,D/2),ta=2*a/R80_V,tc=(D-2*a)/R80_V;if(t<ta){const q=t/ta;return a*q*q;}if(t<ta+tc)return a+(t-ta)*R80_V;const q=clamp((t-ta-tc)/ta,0,1);return D-a*(1-q)*(1-q);};
// a run: it appears standing at the siding (only when nobody's near enough to see it), comes up the line, stands at the
// Crossroads with steam up, goes back, and stands at the siding until nobody's looking, then it's gone down the line
function rl80Phase(r,h){rl80Path();const D=R80.sSid-R80.sPlat,lt=r80LegT(D),t=h-r.t0;const a=.08,b=a+lt,c=b+r.stand,d=c+lt;
  if(t<a)return {s:R80.sSid,moving:false,at:'siding'};if(t<b)return {s:R80.sSid-r80LegS(D,t-a),moving:true,dir:-1};
  if(t<c)return {s:R80.sPlat,moving:false,at:'platform',left:c-t};if(t<d)return {s:R80.sPlat+r80LegS(D,t-c),moving:true,dir:1};return {s:R80.sSid,moving:false,at:'siding',back:true};}
// the day's runs (the farm book carries them, so a shared farm sees one train): every day in the morning, every other day the afternoon too
function rl80Day(){const E=EMP();let b=E.rl80;if(!b||b.day!==S.day){b={day:S.day,runs:R80_STAND.filter((h,i)=>i===0||S.day%2===0).map(h=>({t0:h,stand:h<12?1.4:1.2}))};if(t41Host())E.rl80=b;}return b;}
function rl80Live(){const b=rl80Day();return b.runs.filter(r=>r.go&&!r.gone&&S.hour>=r.t0);}
// anyone near enough to see the siding (or the train standing there)?
function rl80Seen(x,z,m){const eyes=[[P.x,P.z]];try{if(typeof others==='function')for(const p of others()){const q=p.presence;if(q&&!q.r&&isFinite(q.x))eyes.push([q.x,q.z]);}}catch(e){}
  return eyes.some(([ex,ez])=>Math.hypot(ex-x,ez-z)<m)||(S.room?false:false);}
function rl80Tick(){if(!t41Host()||S.mode!=='play')return;const b=rl80Day();rl80Path();let ch=false;const sid=t41At(R80.path,R80.sSid+R80.tl/2);
  for(const r of b.runs){if(r.gone)continue;if(S.hour<r.t0)continue;
    if(!r.go){if(S.hour>19){r.gone=1;ch=true;continue;}if(rl80Seen(sid.x,sid.z,R80.tl/2+30)){r.t0=+(S.hour+.02).toFixed(4);ch=true;}else{r.t0=Math.max(r.t0,+(S.hour-.01).toFixed(4));r.go=1;ch=true;}continue;}
    const ph=rl80Phase(r,S.hour);if(ph.back&&!rl80Seen(sid.x,sid.z,R80.tl/2+30)){r.gone=1;ch=true;}}
  if(ch)EMP().rl80=b;}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<.5)return;t=0;try{rl80Tick();}catch(e){console.warn('rl80',e);}};}
// the three pictures are drawn ahead, one at a time while nothing else is happening, once a train is due within the half hour
const R80KEYS=[['r80e_S',()=>r80EnginePic('S',0)],['r80t_S',()=>r80TenderPic('S',0)],['r80k_S',()=>r80CoachPic('S',0,0,0)]];
function rl80Warm(){try{if(S.mode!=='play')return;const k=R80KEYS.find(q=>!SPR[q[0]]);if(!k)return;if(!rl80Day().runs.some(r=>!r.gone&&r.t0-S.hour<.5))return;t41SprPic(k[0],k[1]);}catch(e){}}
setInterval(()=>{if(typeof requestIdleCallback==='function')requestIdleCallback(rl80Warm,{timeout:600});else rl80Warm();},900);
// the cars this frame: each faces south, drawn by its near (south) end
const R80F={frame:-1,cars:[]};
function rl80Cars(){if(R80F.frame===FRAME_NO)return R80F.cars;R80F.frame=FRAME_NO;const out=[];R80F.cars=out;if(S.room)return out;rl80Path();
  for(const r of rl80Live()){const ph=rl80Phase(r,S.hour);for(const c of R80.cars){const sc=ph.s+c.o+c.l/2;const p=t41At(R80.path,sc);if(Math.hypot(p.x-P.x,p.z-P.z)>90)continue;
      const key=t41SprPic(...R80KEYS[c.k==='engine'?0:c.k==='tender'?1:2]);
      const wid=(c.k==='engine'?R80E.Wd:c.k==='tender'?R80T.Wd:R80K.Wd)/32;out.push({k:c.k,key,x:p.x,cz:p.z,z:p.z+c.l/2,len:c.l,wid,v:'S',steam:c.k==='engine',moving:ph.moving,run:r,ph});}}
  return out;}
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld.apply(this,arguments);try{for(const c of rl80Cars()){if(!onScreen(c.x,c.z,420))continue;D.push({z:c.z,mind:1,draw(){drawSpr(c.key,sx(c.x),sz(c.z));if(c.steam&&(c.moving||(c.ph.at==='platform')))t41Steam(Object.assign({},c,{v:'S'}),c.moving?t:t*.45);}});}}catch(e){console.warn('rl80 draw',e);}};}
{const _se=sunEnd;sunEnd=function(){try{const s=DX.sun;if(s&&!s.lamp&&DX.sg){const g=DX.sg;g.setTransform(1,0,0,1,0,0);g.fillStyle='rgba(10,18,6,.9)';
    for(const c of rl80Cars()){if(!onScreen(c.x,c.z,420))continue;t41BoxShadow(g,c.x-c.wid/2,c.cz-c.len/2,c.x+c.wid/2,c.cz+c.len/2,c.k==='coach'?112:c.k==='tender'?100:116);}}}catch(e){}return _se.apply(this,arguments);};}
// nobody stands inside the train: you're put beside it, the short way out
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.room)return;try{for(const c of rl80Cars()){const dx=P.x-c.x,dz=P.z-c.cz,hx=c.wid/2+.22,hz=c.len/2+.22;if(Math.abs(dx)>=hx||Math.abs(dz)>=hz)continue;
      if(hx-Math.abs(dx)<hz-Math.abs(dz))P.x=c.x+Math.sign(dx||1)*hx;else P.z=c.cz+Math.sign(dz||1)*hz;}}catch(e){}};}
// it whistles leaving the Crossroads and coming in, if you're near enough to hear
{let last='';const _u=update;update=function(dt){_u(dt);try{if(S.mode!=='play')return;for(const r of rl80Live()){const ph=rl80Phase(r,S.hour);const k=r.t0+':'+(ph.at||(ph.dir<0?'up':'down'));
      if(k!==last){const prev=last;last=k;if(prev&&prev.startsWith(r.t0+':')&&Math.hypot(P.x-16.9,P.z-8)<70&&(ph.at==='platform'||ph.dir>0))t41Whistle();}}}catch(e){}};}
// ---- the station and its things, set out once in the world (the farm doesn't build them any more)
const R80W={objs:[],hid:[],circs:[],done:false};
function rl80Sync(){for(const o of R80W.objs){o.hide=true;const i=OBJ.indexOf(o);if(i>=0)OBJ.splice(i,1);}R80W.objs=[];for(const o of R80W.hid)o.hide=false;R80W.hid=[];
  for(const q of R80W.circs){const i=circles.indexOf(q);if(i>=0)circles.splice(i,1);}R80W.circs=[];if(OBJ.length<1000)return;const P0=rl80Path();
  const add=(key,x,z,kind,extra)=>{try{const o=obj(key,x,z,Object.assign({kind,t41:1},extra||{}));R80W.objs.push(o);return o;}catch(e){return null;}};
  const circ=(x,z,r)=>{const q={x,z,r};circles.push(q);R80W.circs.push(q);};
  rl80Clear();
  const p=R80_STA.plat;{const r=t41Platform(p.x1-p.x0,p.z1-p.z0,'e');add(t41Spr('r80_plat',()=>r.c,r.ax,r.gy),(p.x0+p.x1)/2,p.z1+.28,'flat',{});}
  {const bk=t41Spr('r80_board',()=>t41NameBoard('CROSSROADS').c,c=>c.width/2,48);add(bk,R80_STA.board[0],R80_STA.board[1],'prop',{label:'CROSSROADS',t41sh:{sil:1}});circ(R80_STA.board[0]-.6,R80_STA.board[1]-.05,.12);circ(R80_STA.board[0]+.6,R80_STA.board[1]-.05,.12);}
  {const nk=t41Spr('r80_notice',()=>t41NameBoard('LINE CLOSED').c,c=>c.width/2,48);add(nk,R80_STA.notice[0],R80_STA.notice[1],'prop',{label:'LINE CLOSED',t41sh:{sil:1}});circ(R80_STA.notice[0],R80_STA.notice[1]-.05,.3);}
  {const bk=t41BenchKey('E');add(bk,R80_STA.bench[0],R80_STA.bench[1],'prop',{t41sh:{sil:1}});circ(R80_STA.bench[0],R80_STA.bench[1]-.15,.3);}
  // the buffer stop at the end of the line, and the crossing signs
  {const {L,Wd,face}=T41BUF,at=[16.9,-.2-(face-L/2)/32];const cam=t41Cam(L,Wd,'S');add(t41SprPic('t41_buf_S',()=>t41BufferPic('S')),at[0],at[1]+cam.d/64,'prop',{t41sh:{fp:[at[0]-.9,at[1]-.6,at[0]+.9,at[1]+.1],h:22}});circ(16.9,-.4,.5);}
  for(const [x,z] of R80_XING){add(t41Spr('t41_xbuck2',()=>t41Crossbuck().c,30,96),x,z,'prop',{label:'RAILROAD CROSSING',t41sh:{sil:1}});circ(x,z-.05,.15);}
  if(typeof NAV!=='undefined')NAV.sig='';}
// nothing growing on the line or the platform, and no loose crates or fence ends in the train's way (story things, signs and
// markers stay). The day's new twigs and stones come later than the world, so this runs again every few seconds.
function rl80Clear(){const P0=rl80Path(),p=R80_STA.plat;
  for(const o of OBJ){if(o.hide||o.x<11||o.x>22.6||o.z<-3||o.z>304||o.room||o.t41||o.story||o.town||o.mile||o.crashOak||o.label)continue;
    const onPlat=o.x>p.x0-.4&&o.x<p.x1+.3&&o.z>p.z0-.5&&o.z<p.z1+.6;const s=clamp(o.z+.2,0,P0.len);const q=t41At(P0,s);const dmin=Math.abs(o.x-q.x);
    const veg=/^(tree|pine|bush|deco|anim|grass|plant)$/.test(o.kind||'')||o.debris||/^(twig|rock_|weeds_|stick|stone|pebble|leaves)/.test(o.spr||'');const thing=/^(crate|hay|barrel|sack|bale|fence)/.test(o.spr||'');
    if((veg&&(dmin<1.7||onPlat))||(thing&&dmin<1.5)){o.hide=true;R80W.hid.push(o);for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-(o.z-.1))<.7){R80W.hid.push({set hide(v){if(!v)circles.push(this.c);},c:circles[j]});circles.splice(j,1);}}}}
{let t=0;const _mu=mindUpdate;mindUpdate=function(dt){_mu(dt);t+=dt;if(t<4)return;t=0;try{if(!S.room&&OBJ.length>1000&&R80W.objs.length)rl80Clear();}catch(e){}};}
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{R80W.objs=[];R80W.hid=[];R80W.circs=[];rl80Sync();}catch(e){console.warn('rl80',e);}return r;};}
// the track is laid for everyone now: the ground under it drawn with rails, ties and ballast, and planks where a road comes over
t41RailBuckets=function(){if(T41RAIL.buckets)return T41RAIL.buckets;const B=new Map();T41RAIL.buckets=B;const N=CH/32,add=(k,e)=>{let b=B.get(k);if(!b)B.set(k,b=[]);b.push(e);};
  const P=rl80Path(),cross=[];for(const q of ROADS){for(let i=0;i<P.length-1;i+=2){const a=P[i];const qx=q[2]-q[0],qz=q[3]-q[1],ql=Math.hypot(qx,qz)||1;if(Math.abs(a.dx*qx+a.dz*qz)/ql>.3)continue;if(segDist(a.x,a.z,q[0],q[1],q[2],q[3])<q[4]/2+.2)cross.push([a.x,a.z]);}}
  const step=1/32;for(let s=0;s<=P.len;s+=step){const p=t41At(P,s);const pl=cross.some(c=>Math.abs(c[0]-p.x)<.5&&Math.abs(c[1]-p.z)<.5);const e={x:p.x,z:p.z,dx:p.dx,dz:p.dz,sl:(s%.62)<step,pl,s,tz:false};
    for(const kk of new Set([[0,0],[-1.2,-1.2],[1.2,1.2],[1.2,-1.2],[-1.2,1.2]].map(([ox,oz])=>Math.floor((p.x+ox)/N)+','+Math.floor((p.z+oz)/N))))add(kk,e);}
  return B;};
{const _ch=chunk;chunk=function(cx,cz){const k=cx+','+cz;const had=chunks.has(k);const c=_ch.apply(this,arguments);try{if(!had&&c&&!(S.emp&&S.emp.tr&&(S.emp.tr.valley||S.emp.tr.bus)))t41PaintRail(c,cx,cz);}catch(e){}return c;};}
// ---- at the station: the Company's notice; a train standing at the platform has its doors locked
// @@JOURNEY: rl80Board(dest) is the one place a journey on the long line starts. While the line is closed it says so. When the
// story opens the line, set R80J.open and R80J.start (the three-day ride: the carriages as a place, the dining car, the nights
// aboard, and where it arrives); the station page offers it, and a standing train's doors open onto it.
const R80J={open:false,start:null};
function rl80Board(dest){if(R80J.open&&typeof R80J.start==='function')return R80J.start(dest);
  const standing=rl80Live().some(r=>rl80Phase(r,S.hour).at==='platform');
  toast(standing?'The carriage door is locked. In the second coach somebody draws the blind.':'The line is closed. Nobody is selling tickets.',3);return false;}
function rl80Station(){const standing=rl80Live().find(r=>rl80Phase(r,S.hour).at==='platform');
  let h=`<h3>Station · Crossroads</h3><p class="t41svc">THE MARROW VALLEY LINE · for Hollow Acre and Marrow Hollow</p>
    <p><b>NOTICE.</b> Passenger services on this line are suspended until further notice. By order of the Company.</p>`;
  h+=standing?`<p>The train at the platform has steam up, but every door is locked and there’s nobody in the cab. It goes back down the line at ${t41TimeStr(standing.t0+.08+r80LegT(R80.sSid-R80.sPlat)+standing.stand)}.</p><p style="text-align:center;margin-top:8px"><button class="btn" id="r80Door">Try a carriage door</button></p>`
    :`<p>The rails run south down Mill Road, past the Deep Corn, and on out of the valley. Now and then a train still comes up, stands a while, and goes back.</p>`;
  openNote(h,'Not now',()=>{});try{t41Modal();}catch(e){}const b=$('r80Door');if(b)b.addEventListener('click',()=>{$('note').hidden=true;S.paused=false;rl80Board(null);},{once:true});}
{const p=R80_STA.plat;interact.push({x:(p.x0+p.x1)/2,z:(p.z0+p.z1)/2,r:(p.z1-p.z0)/2+.6,on:()=>!S.room,label:()=>'Station · Crossroads',ok:()=>true,act(){rl80Station();}});}
// ---- the world map: the line, the station, the train when it's out
if(typeof m6Transit==='function'){const _m6=m6Transit;m6Transit=function(){const o=_m6.apply(this,arguments);try{if(o&&typeof M6L!=='undefined'&&M6L.transit){const p=R80_STA.plat;
    o.stations.push({id:'s:xr',sid:'xr',t:'station',name:'Crossroads station',x:(p.x0+p.x1)/2,z:(p.z0+p.z1)/2,icon:'train',note:'The line is closed to passengers'});o.rails=[rl80Path()];
    for(const r of rl80Live()){const ph=rl80Phase(r,S.hour);const q=t41At(R80.path,ph.s+R80.tl/2);o.veh.push({x:q.x,z:q.z,icon:'train'});}}}catch(e){}return o;};}
// the dev hook the tests use
if(typeof window!=='undefined')window.__r80={R80,rl80Day,rl80Live,rl80Phase,rl80Cars,rl80Board,rl80Station,rl80Tick,R80J};
