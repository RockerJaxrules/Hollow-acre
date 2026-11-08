/* ================= the steps of making things, each one its own little game played the way the job is really done:
   saw in time, push the plane at an even speed, swing the hammer just hard enough, brush with the grain,
   chop even slices as the hand feeds the knife, hold a pot on the simmer, pour to the line, drop the egg in the butter,
   toss and catch, follow the backbone with the knife. Each has its own sounds, its own physics and its own demo. ================= */
const M4={C:{},
  // a still drawing kept in its own canvas, optionally with a dark outline round it
  pre(key,w,h,fn,ol){if(this.C[key])return this.C[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const K=caKit(g,w,h);K.g=g;fn(K,g,w,h);if(ol)M4.outline(c,ol===true?'#1a0e06':ol);return this.C[key]=c;},
  outline(c,col){const g=c.getContext('2d'),w=c.width,h=c.height,d=g.getImageData(0,0,w,h),a=d.data,o=new Uint8Array(w*h);for(let i=0;i<w*h;i++)o[i]=a[i*4+3]>40?1:0;
    const rgb=[1,3,5].map(i=>parseInt(col.slice(i,i+2),16));
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;if(o[i])continue;if((x>0&&o[i-1])||(x<w-1&&o[i+1])||(y>0&&o[i-w])||(y<h-1&&o[i+w])){a[i*4]=rgb[0];a[i*4+1]=rgb[1];a[i*4+2]=rgb[2];a[i*4+3]=255;}}g.putImageData(d,0,0);},
  rot(g,img,x,y,ang,ox,oy,sx,sy){g.save();g.translate(Math.round(x),Math.round(y));if(ang)g.rotate(ang);if(sx||sy)g.scale(sx||1,sy||1);g.drawImage(img,-ox,-oy);g.restore();},
  sh(P,d){return P.map((c,i)=>P[Math.max(0,Math.min(P.length-1,i+d))]);},
  cl:(v,a,b)=>Math.max(a,Math.min(b,v)),
  // an error turned into a score: within a is perfect, within b good, within c ok
  q:(e,a,b,c)=>e<=a?1:e<=b?.75:e<=c?.45:.15,
  avg:a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0,
  // where a point of a rotated drawing ends up
  tr(x,y,ang,lx,ly){const c=Math.cos(ang),s=Math.sin(ang);return [x+lx*c-ly*s,y+lx*s+ly*c];}};
// the demo's hands: a fake pointer the step reads exactly like yours
function m4ai(st,AP,dt){const a=st._ai||(st._ai={x:160,y:90,down:false,pressed:false,released:false,dx:0,dy:0,side:0,ax:0,ay:0,demo:true,tapT:0});
  a.pressed=a.released=false;a.side=0;a.dx=a.dy=0;a.ax=0;a.ay=0;if(a.tapT>0){a.tapT-=dt;if(a.tapT<=0&&a.down){a.down=false;a.released=true;}}AP.I=a;return a;}
const m4move=(a,x,y)=>{a.dx=x-a.x;a.dy=y-a.y;a.x=x;a.y=y;};
const m4hold=(a,on)=>{if(on&&!a.down){a.down=true;a.pressed=true;}else if(!on&&a.down){a.down=false;a.released=true;}};
const m4tap=a=>{if(a.down)return;a.down=true;a.pressed=true;a.tapT=.09;};
// ---------------------------------------------------------------- the props, drawn once each
const SKIN=['#5a2e1a','#8a4e30','#b8744c','#d89a6e','#eebc90','#f8d8b4'];
const M4S={
  saw:()=>M4.pre('saw',100,24,K=>{const I=CA_P.iron,O=CA_P.oak;
    for(let x=1;x<=78;x++){const top=Math.round(17-(7+6*x/78));for(let y=top;y<=17;y++){const u=(y-top)/Math.max(1,17-top);let k=u<.14?6:u<.32?5:u<.72?4:3;if(((x*7+y*3)%29)===0)k--;if(y===top+2&&x%9<5)k=6;K.px(x,y,1,1,I[k]);}K.px(x,top,1,1,I[7]);}
    for(let x=1;x<=78;x++){K.px(x,18,1,1,(x%2)?I[2]:I[5]);if(x%2===0)K.px(x,19,1,1,I[3]);}
    K.px(58,10,10,1,I[3]);K.px(58,12,7,1,I[3]);K.px(58,10,1,3,I[3]);
    for(let y=1;y<=21;y++)for(let x=76;x<=97;x++){const cx=Math.min(x-76,97-x),cy=Math.min(y-1,21-y);if(cx+cy<3)continue;if(((x-88)/4.6)**2+((y-11)/5.6)**2<1)continue;if(x<81&&y>16)continue;
      let k=5;if(y<4||x<79)k=6;if(x>94||y>19)k=3;if(((x-88)/4.6)**2+((y-11)/5.6)**2<1.5)k=(y<11?2:6);if(((x*3+y*5)%17)===0)k--;K.px(x,y,1,1,O[k]);}
    for(const [sx,sy] of [[79,7],[79,14]]){K.px(sx,sy,2,2,CA_P.brass[5]);K.px(sx,sy,1,1,CA_P.brass[7]);}},true),
  plane:()=>M4.pre('plane',46,26,K=>{const I=CA_P.iron,R=['#1e0a06','#3a140a','#5a2412','#7a341a','#9a4622','#b85e30','#d07a44'];
    for(let x=3;x<=42;x++){const top=x<6?15+(6-x):x>39?15+(x-39):12;for(let y=top;y<=22;y++){let k=y===top?6:y<top+2?4:y>20?1:2;if(x===3||x===42)k=1;K.px(x,y,1,1,I[k]);}}
    K.px(3,22,40,1,I[5]);K.px(3,23,40,1,I[0]);
    for(let i=0;i<14;i++){K.px(13+i*.5,5+i,3,1,I[i<2?7:5]);}K.px(11,5,4,1,I[7]);
    for(let y=8;y<=15;y++)K.px(15,y,5,1,y<10?'#2a2a30':'#1a1a20');K.px(15,8,5,1,'#5a5a66');K.ball(19,17,2,CA_P.brass);
    const tote=[[30,14],[31,12],[32,10],[33,8],[34,6],[35,4],[36,2]];for(const [tx,ty] of tote){K.px(tx,ty,4,3,R[4]);K.px(tx,ty,1,3,R[6]);K.px(tx+3,ty,1,3,R[2]);}K.px(36,1,5,3,R[5]);K.px(36,1,5,1,R[6]);
    K.ball(8,10,3,R,4);K.px(7,14,3,2,I[3]);},true),
  hammer:()=>M4.pre('hammer',52,26,K=>{const I=CA_P.iron,H=['#5a3a1a','#8a6234','#b48a50','#d4ae72','#e8cc96'];
    for(let x=11;x<=50;x++){const tap=x<16?1:0;K.px(x,10-tap,1,1,H[4]);K.px(x,11-tap,1,1,H[3]);K.px(x,12,1,1,H[2]);K.px(x,13+tap,1,1,H[1]);if(x%7===0)K.px(x,11,1,1,H[2]);}
    for(let x=36;x<=50;x++){K.px(x,9,1,6,x%3?'#3a2410':'#5a3418');K.px(x,9,1,1,'#7a5430');}K.px(50,9,1,6,'#2a1408');
    for(let y=3;y<=23;y++){const face=y>=19;const x0=face?2:4,w=face?11:8;for(let x=x0;x<x0+w;x++){let k=x===x0?6:x<x0+2?5:x>x0+w-2?2:4;if(y===23)k=7;if(y===19)k=6;if(y===18)k=2;K.px(x,y,1,1,I[k]);}}
    K.px(4,8,8,1,I[2]);K.px(4,15,8,1,I[2]);for(let i=0;i<9;i++){const cx=6+i,cy=3-Math.round(Math.sin(i/8*Math.PI*.9)*2)-(i>5?i-5:0);K.px(cx,Math.max(0,cy),2,2,I[i<4?5:4]);}},true),
  knife:()=>M4.pre('knife',16,48,K=>{const I=CA_P.iron;
    for(let y=18;y<=44;y++){const w=y>40?8-(y-40):8;for(let x=4;x<4+w;x++){let k=x<6?6:x<9?5:x<11?4:3;if(y===44||(x===4+w-1&&y>40))k=7;K.px(x,y,1,1,I[k]);}}
    K.px(4,18,8,1,I[7]);K.px(4,44,5,1,'#ffffff');for(let y=20;y<42;y+=6)K.px(6,y,1,3,'#ffffff');
    K.px(4,15,8,3,I[5]);K.px(4,15,8,1,I[7]);
    for(let y=1;y<=14;y++)for(let x=5;x<=10;x++)K.px(x,y,1,1,x<7?'#4a3a3a':x>9?'#140c0c':'#2a2020');for(const ry of [4,8,12])K.px(7,ry,2,1,CA_P.brass[6]);},true),
  brush:()=>M4.pre('brush',20,44,K=>{const W=CA_P.wood,I=CA_P.iron;
    for(let y=1;y<=18;y++){const w=y<4?4:6;const x0=y<4?8:7;for(let x=x0;x<x0+w;x++)K.px(x,y,1,1,x===x0?W[6]:x>x0+w-2?W[2]:W[4]);}K.ell(10,3,2,1,W[3]);
    for(let y=19;y<=26;y++)for(let x=4;x<=15;x++)K.px(x,y,1,1,y===19?I[7]:x<6?I[6]:x>13?I[2]:y%3===0?I[3]:I[5]);
    for(let y=27;y<=40;y++)for(let x=4;x<=15;x++)K.px(x,y,1,1,(x%2)?'#c8a878':'#a88858');K.px(4,40,12,1,'#7a5a38');},true),
  jug:()=>M4.pre('jug',40,40,K=>{const C=['#3a3428','#6a6250','#a89c84','#d8ccb0','#efe6d0','#fbf6ea'],B=['#1c2a48','#2c4472','#40609a','#5a80b8'];
    for(let y=6;y<=36;y++){const u=(y-6)/30;const r=9+Math.sin(u*Math.PI*.9+.2)*5;for(let x=-r;x<=r;x++){const l=-x/r*.7-(u-.4)*.5;let k=Math.round(3+l*2.2);let c=C[M4.cl(k,0,5)];if(y>=20&&y<=24)c=B[M4.cl(Math.round(2+l*1.5),0,3)];if(y===19||y===25)c=B[0];K.px(19+x,y,1,1,c);}}
    K.ell(19,6,10,2,C[4]);K.ell(19,6,8,1,C[1]);for(let i=0;i<7;i++)K.px(4+i,4+i*.3,2,2,C[i<3?5:4]);K.px(3,3,3,2,C[5]);
    for(let a=-1.4;a<=1.4;a+=.1){K.px(30+Math.cos(a)*6,20+Math.sin(a)*9,2,2,a<0?C[4]:C[2]);}},true),
  ladle:()=>M4.pre('ladle',60,30,K=>{const I=CA_P.iron;for(let i=0;i<40;i++){const x=16+i,y=16-i*.34;K.px(x,y,2,2,I[i%7===0?4:5]);K.px(x,y,2,1,I[7]);}K.px(54,1,5,4,'#3a2410');K.px(54,1,5,1,'#5a3418');
    for(let y=14;y<=24;y++){const ww=Math.round(9*Math.sqrt(Math.max(0,1-((y-14)/10)**2)));for(let x=-ww;x<=ww;x++)K.px(10+x,y,1,1,I[x<-ww*.4?6:x>ww*.5?2:4]);}K.ell(10,14,9,2,I[6]);K.ell(10,14,7,1,I[1]);},true),
  pot:(c)=>M4.pre('pot'+c,86,40,K=>{const I=CA_P.iron;
    for(let y=6;y<=36;y++){const ww=37-(y>31?(y-31)*1.6:0);for(let x=-ww;x<ww;x++){const l=-x/ww*.75-.05+(y<9?.3:0);K.px(43+x,y,1,1,I[M4.cl(Math.round(3+l*2.6),1,6)]);}}
    K.px(4,3,78,4,I[4]);K.px(4,3,78,1,I[7]);K.px(4,6,78,1,I[1]);for(const s of [0,1]){const hx=s?80:0;K.px(hx,9,6,5,I[2]);K.px(hx,9,6,1,I[5]);}},true),
  crucible:()=>M4.pre('crucible',32,36,K=>{const C=['#2a1a10','#4a2e1c','#6a4a30','#8a6a48','#a8886a'];for(let y=4;y<=33;y++){const r=Math.round(12-(y-4)*.12);for(let x=-r;x<=r;x++){const l=-x/r*.7-.1;K.px(16+x,y,1,1,C[M4.cl(Math.round(2+l*2),0,4)]);}}
    K.ell(16,4,12,3,C[4]);K.ell(16,4,10,2,'#ff9a3a');K.px(10,4,6,1,'#fff0c0');K.px(2,2,6,3,C[3]);K.px(2,2,6,1,C[4]);for(let y=5;y<34;y++){const r=Math.round(12-(y-4)*.12);K.pa(16+r-3,y,3,1,'#ff6a1a',.35);}},true),
  bowl:(c)=>M4.pre('bowl'+c,60,26,K=>{const P=c==='wood'?CA_P.oak:['#3a2a20','#7a5040','#b06a48','#d08a5a','#e8b080','#f6d4a8'];
    for(let y=5;y<=21;y++){const u=(y-5)/16;const ww=Math.round(27*Math.sqrt(Math.max(0,1-u*u*.82)));for(let x=-ww;x<=ww;x++){const l=-x/ww*.7+.1-u*.5;K.px(30+x,y,1,1,P[M4.cl(Math.round(3+l*2.4),0,P.length-1)]);}}
    K.px(16,21,28,3,P[1]);K.px(16,21,28,1,P[3]);K.ell(30,5,27,5,P[5]);for(let x=8;x<52;x+=6)K.px(x,12,3,1,P[2]);},true),
  // the fillet: silver skin on one side, pink flesh with white lines on the other (two halves of one strip, drawn at half size)
  fillet:()=>M4.pre('fillet',180,18,K=>{for(let x=0;x<88;x++){const h=Math.max(2,7*Math.sin(Math.PI*(x+3)/94));for(let y=-h;y<=h;y++){const v=(y+h)/(2*h);K.px(1+x,9+y,1,1,v<.3?'#3a5e74':v<.55?'#8a9aa4':'#d4dee2');K.px(91+x,9+y,1,1,v<.25?'#f8d8cc':v>.8?'#e0a090':'#f0b8a8');}
    if(x%8===0)for(let y=-h+1;y<h;y++)K.px(91+x+Math.round(y*.4),9+y,1,1,'#fff0ea');}},'#3a1a10'),
  fish:()=>M4.pre('fish',136,50,K=>{const back=['#1a2a3a','#2a4458','#3a5e74','#4e7890'],belly=['#8a9aa4','#b4c2ca','#d4dee2','#eef4f6'];
    for(let x=4;x<=112;x++){const u=(x-4)/108;const hh=18*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.05)),.7)+2;for(let y=-hh;y<=hh;y++){const v=(y+hh)/(2*hh);let c;if(v<.45)c=back[M4.cl(Math.round(v*6+(x%7===0?-1:0)),0,3)];else c=belly[M4.cl(Math.round((v-.45)*6.5+((x+y)%9===0?-1:0)),0,3)];
      if(((x*2+Math.round(y)*3)%11===0)&&v>.25&&v<.85)c=v<.45?back[3]:'#ffffff';K.px(x,25+y,1,1,c);}}
    for(let x=10;x<=108;x++)K.px(x,25+Math.round(Math.sin(x*.05)*1.5),1,1,'#c8d4da');
    for(let i=0;i<16;i++){const tx=112+i,sp=2+i*1.1;K.px(tx,25-sp,1,sp*2,i%3?back[2]:back[1]);K.px(tx,25-sp,1,1,back[3]);}K.px(114,25-1,10,2,belly[1]);
    for(let i=0;i<30;i++){const fx=42+i,fh=6-Math.abs(i-12)*.35;if(fh>0)K.px(fx,8-fh+3,1,fh,i%3?back[1]:back[2]);}
    K.ball(16,21,3,['#0a0a0a','#2a2a2a','#e8e0c0','#ffffff']);K.px(16,21,2,2,'#0a0a0a');K.px(17,20,1,1,'#ffffff');
    for(let y=-12;y<=12;y++)K.px(28+Math.round(Math.abs(y)*.35),25+y,1,1,back[0]);K.px(3,26,4,2,'#5a3a3a');
    for(let i=0;i<10;i++)K.px(36+i,34+i*.5,1,4-i*.3,belly[0]);},true),
  tin:()=>M4.pre('tin',30,26,K=>{const I=CA_P.iron;for(let y=4;y<=24;y++)for(let x=2;x<=27;x++)K.px(x,y,1,1,I[x<5?6:x>24?2:x%5===0?4:5]);K.px(2,10,26,8,'#b8402a');K.px(2,10,26,1,'#e06a48');K.px(6,12,18,4,'#f2e2bc');K.px(8,13,14,1,'#3a2410');K.px(8,15,10,1,'#3a2410');
    K.ell(15,4,13,3,I[7]);K.ell(15,4,11,2,'#4a2410');K.ell(14,4,6,1,'#7a3e1c');},true),
  sawhorse:()=>M4.pre('sawhorse',48,66,K=>{const W=CA_P.wood;for(let i=0;i<60;i++){K.px(10-i*.12,6+i,4,1,W[i%9===0?3:4]);K.px(34+i*.12,6+i,4,1,W[i%9===0?2:3]);}K.px(8,36,32,3,W[3]);K.px(8,36,32,1,W[5]);K.plank(2,1,44,6,W,3);},true),
  hand:(dir)=>M4.pre('hand'+dir,18,15,K=>{const P=SKIN,F=['.....oooooo.......','...oohhhhhhoo.....','..ohhmmmmmmmhoo...','.ohmmmmmmmmmmmso..','.ohmmmhhhhmmmmmso.','.ohmmoooooommmmso.','.ommhmmsmmsmmsmso.','.ommmmsmmsmmsmmso.','.ommhmsmmsmmsmmso.','.osmmmsmmsmmsmsso.','..osmmsmmsmmsssso.','..oossossossosoo..','...oo.oo.oo.oo....'];
    const C={o:'#3a1a0c',h:P[5],m:P[4],s:P[2],n:P[3]};F.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;const x=dir==='l'?17-i:i;K.px(x,j+1,1,1,C[ch]);}});}),
  palm:(dir)=>M4.pre('palm'+dir,22,13,K=>{const P=SKIN,F=['...oooooooo...........','..ohhhhhhhhooooooooo..','.ohmmmmmmmmhhhhhhhhhoo','ohmmmmmmmmmmmmmmmmmmmo','ommmmmmmmmmsssssssssso','ommmmmmmmmmmmmmmmmmmmo','ommmmmmmmmmsssssssssso','ommmmmmmmmmmmmmmmmmmo.','.osmmmmmmmmsssssssso..','..oooooooooooooooo....'];
    const C={o:'#3a1a0c',h:P[5],m:P[4],s:P[2]};F.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;const x=dir==='l'?21-i:i;K.px(x,j+1,1,1,C[ch]);}});})};
// a board seen from the front and a little above: a lit top face, a darker front face
function m4board(w,top,front,P,seed){return M4.pre('bd'+w+'_'+top+'_'+front+'_'+seed+P[3],w+2,top+front+2,K=>{K.plank(1,1,w,top,M4.sh(P,1),seed);K.plank(1,1+top,w,front,M4.sh(P,-1),seed+5);K.px(1,top+1,w,1,M4.sh(P,1)[6]);},true);}
const m4hand=(K,x,y,flip)=>{const h=M4S.hand(flip?'l':'r');K.g.drawImage(h,Math.round(x-9),Math.round(y-8));};
const m4palm=(K,x,y,flip)=>{const h=M4S.palm(flip?'l':'r');K.g.drawImage(h,Math.round(x-11),Math.round(y-7));};
// just a cuff behind the wrist, pointing back toward you: hands, not sticks
const m4sleeve=(K,x0,y0,x1,y1,c)=>{const ux=(x1>=x0?1:-1)*.55,uy=.84;const L=11,col=c||'#7a3a34',hi='#a85a4a',dk='#3a1a14';
  for(let i=2;i<=L;i++){const x=x0+ux*i,y=y0+uy*i;K.px(x-4,y-4,8,8,dk);}for(let i=2;i<=L;i++){const x=x0+ux*i,y=y0+uy*i;K.px(x-3,y-3,6,6,col);K.px(x-3,y-3,6,1,hi);if(i%4===0)K.px(x-3,y,6,1,dk);}
  const cx=x0+ux*2,cy=y0+uy*2;K.px(cx-4,cy-4,8,8,'#e8dcc4');K.px(cx-3,cy-3,6,6,'#f6efe0');};
// ---------------------------------------------------------------- SAW: one smooth stroke per beat; rushing binds the blade
S4.saw=(sp,K)=>{const g=K.g,X0=44,X1=292,TOP=96,FR=106,BOT=114,CX=sp.cx||232,N=sp.n||9,TEMPO=sp.tempo||.62,P=sp.wood||CA_P.wood;
  const board=m4board(X1-X0,10,8,P,sp.seed||5),saw=M4S.saw(),horse=M4S.sawhorse();
  const off=M4.pre('off'+CX+(sp.seed||5)+P[3],X1-CX+2,20,k=>k.g.drawImage(board,CX-X0,0,X1-CX+2,20,0,0,X1-CX+2,20));
  const st={d:0,n:0,q:[],drift:0,sp:-1,last:-9,next:1e9,bind:0,t:0,fall:null,dust:0,end:0,bounces:0,idle:0};
  const sound={rasp:null};
  const stroke=()=>{if(st.fall)return;const iv=st.t-st.last;let q;
    if(st.n===0)q=1;else if(iv<TEMPO*.5){q=.1;st.bind=.28;K.shk=.12;A.tone(1700,.14,'sawtooth',.035,{slide:1250,filter:['bandpass',1800,6]});}
    else q=M4.q(Math.abs(iv-TEMPO),.1,.2,.32);
    st.last=st.t;st.next=st.t+TEMPO;st.sp=0;MS.saw(1,q<.3?.6:1);st.idle=0;
    if(st.n>0){st.q.push(q);K.judge(q,CX,TOP-48,true);if(q>=.95)K.emit(CX,TOP-26,5,{c:['#fff4c0','#ffd27a'],v:50,g:40,life:.45});else if(q<.3)MS.miss();}
    st.n++;st.d=Math.min(1,st.d+(st.n===1?.55:q>=.95?1.15:q>=.6?1:q>=.3?.78:.4)/N);
    if(q<.6&&st.n>1)st.drift+=(Math.random()<.5?-1:1)*(.85-q)*1.3;else st.drift*=.8;
    const kx=CX+st.drift*st.d;K.emit(kx,FR+st.d*8,7,{c:['#f6e2b4','#e8c890','#c8a070'],v:36,ang:Math.PI/2,spread:1.6,g:340,life:.9});st.dust+=3;
    if(st.d>=1){st.fall={x:CX,y:TOP,vx:18,vy:-24,a:0,va:2.1};MS.crunch();setTimeout(()=>MS.crunch(),60);}};
  return {title:sp.t||'Saw it to length',how:'Tap in time with the ring: one smooth stroke per beat. Rushing binds the saw.',hint:'Tap when the ring closes. Steady strokes cut straight.',st,
    update(dt,I){st.t+=dt;st.idle+=dt;if(st.bind>0)st.bind-=dt;
      if(st.sp>=0){const p=st.sp;st.sp+=dt/(TEMPO*.68);if(p<.5&&st.sp>=.5)MS.saw(-1,.55);if(st.sp>=1)st.sp=-1;}
      if(st.fall){const f=st.fall;f.vy+=620*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.a+=f.va*dt;const low=f.y+Math.sin(Math.abs(f.a))*(X1-CX)+18;
        if(low>176&&f.vy>0){f.y-=low-176;if(st.bounces<1){f.vy*=-.3;f.va=-2.4;f.vx*=.5;st.bounces++;MS.thunk();K.emit(f.x+30,176,10,{c:['#c8a070','#8a6a48'],v:50,spread:2.6,g:200,life:.6});K.shk=.12;}else{f.vy=0;f.vx=0;}}
        if(st.bounces>=1&&!f.flat){if(f.a<=.02){f.a=0;f.va=0;f.flat=1;f.y=176-18;MS.thunk();A.hiss(.12,.2,'lowpass',500);K.emit(f.x+30,176,12,{c:['#d8b888','#a88858'],v:60,spread:2.8,g:200,life:.6});K.shk=.15;}}
        if(f.flat){f.a=0;f.va=0;f.y=176-18;}
        st.end+=dt;if(st.end>1.3){st.done=true;st.score=.72*M4.avg(st.q)+.28*(1-Math.min(1,Math.abs(st.drift)/5));}return;}
      if(I.pressed)stroke();},
    draw(t){const d=st.d,kx=CX+st.drift*d;
      for(const hx of [104,196])g.drawImage(horse,hx-24,112);
      if(st.dust)K.ell(kx+2,176,Math.min(14,2+st.dust*.35),Math.min(3,1+st.dust*.05),'#d8b888');
      g.drawImage(board,0,0,CX-X0+1,20,X0-1,TOP-1,CX-X0+1,20);
      if(!st.fall)g.drawImage(off,CX,TOP-1);
      else{const f=st.fall;g.save();g.translate(Math.round(f.x),Math.round(f.y+18));g.rotate(f.a);g.drawImage(off,0,-19);g.restore();}
      for(let y=TOP+1;y<BOT;y+=2)K.px(CX,y,1,1,'#2a2a34');
      if(st.n>0){K.px(kx-1,TOP,2,FR-TOP,'#1a0e06');for(let y=FR;y<FR+d*8;y++){const x=CX+st.drift*((y-FR)/8)*d;K.px(x-1,y,2,1,'#1a0e06');K.px(x+1,y,1,1,'#3a2410');}}
      m4palm(K,X0+46,TOP+3,true);
      if(!st.fall){const s=st.sp<0?0:Math.sin(Math.PI*Math.min(1,st.sp));const dTip=20+40*s;const ang=-.55+(st.bind>0?(Math.random()-.5)*.08:0);
        const cy=FR+d*8-1;g.save();g.beginPath();g.rect(0,0,320,FR);g.rect(kx-2,FR,4,d*8+1);g.clip();M4.rot(g,saw,kx,cy,ang,dTip,18);g.restore();
        const [hx,hy]=M4.tr(kx,cy,ang,88-dTip,11-18);m4sleeve(K,hx+4,hy+2,hx+40,hy-20);m4hand(K,hx,hy+1);}},
    hud(t){if(st.fall)return;const cx=CX,cy=TOP-24;const left=st.n===0?((t*1.4)%1):M4.cl((st.next-st.t)/TEMPO,0,1);const r=5+left*18;
      K.g.strokeStyle='rgba(20,10,4,.8)';K.g.lineWidth=3;K.g.beginPath();K.g.arc(cx,cy,5,0,6.29);K.g.stroke();K.g.strokeStyle=left<.12?'#9be07a':'#fff4c0';K.g.lineWidth=1;K.g.beginPath();K.g.arc(cx,cy,5,0,6.29);K.g.stroke();
      K.g.strokeStyle=`rgba(255,210,122,${.35+.65*(1-left)})`;K.g.beginPath();K.g.arc(cx,cy,r,0,6.29);K.g.stroke();
      if(st.n===0)K.label('TAP',cx,cy-3,'#ffd27a');K.meter(st.d,M4.avg(st.q)||1);
      if(st.idle>2.2&&st.n>0&&Math.floor(t*3)%2)K.label('KEEP SAWING',160,24,'#ffd27a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(!st.fall&&((st.n===0&&st.t>.6)||(st.n>0&&st.t>=st.next-.012)))m4tap(a);AP.hand=[CX+6,TOP-30];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- PLANE: hold to push; keep the speed even and the shaving comes off in one long curl
S4.plane=(sp,K)=>{const g=K.g,X0=34,X1=286,TOP=90,FR=102,LO=sp.lo||52,HI=sp.hi||94,VMAX=160,CELL=2,NC=(X1-X0)/CELL,P=sp.wood||CA_P.oak;
  const board=m4board(X1-X0,12,8,P,sp.seed||7),plane=M4S.plane();
  const tex=lv=>M4.pre('ptex'+lv+P[3],X1-X0,12,k=>{k.plank(0,0,X1-X0,12,M4.sh(P,lv===0?2:lv===1?1:0),sp.seed||7);const H=k.H32;
    if(lv===2)for(let x=0;x<X1-X0;x++){if(x%6<2)k.pa(x,1,1,10,'#2a1608',.35);for(let y=1;y<12;y++)if(H(x,y,3)>.82)k.pa(x,y,1,1,H(x,y,4)>.5?'#1a0e06':'#f0d8b0',.45);}
    if(lv===1)for(let x=0;x<X1-X0;x++){if(x%12<1)k.pa(x,1,1,10,'#2a1608',.25);for(let y=1;y<12;y++)if(H(x,y,5)>.93)k.pa(x,y,1,1,'#2a1608',.3);}
    if(lv===0){for(let x=0;x<X1-X0;x+=3)k.pa(x,2,2,1,'#fff6e0',.35);}
    if(lv==='T')for(let x=0;x<X1-X0;x++){for(let y=1;y<12;y++)if(H(x,y,8)>.7)k.pa(x,y,1,1,'#2a1608',.65);if(x%3===0)k.pa(x,3,1,6,'#1a0e06',.5);}});
  const st={x:X0-28,v:0,pass:0,mode:'wait',lift:0,r:new Array(NC).fill(sp.rough||2),torn:new Array(NC).fill(0),inb:[],ok:0,cnt:0,rib:0,curls:[],chat:0,t:0,end:0,bx:-1};
  let loop=null;const L=()=>loop||(loop=MS.loop('bandpass',3000,.9));
  const smooth=()=>M4.avg(st.r.map((r,i)=>st.torn[i]?.3:r===0?1:r===1?.5:0));
  const breakRib=(x,y)=>{if(st.rib>6)st.curls.push({x,y,r:Math.min(8,2+st.rib*.03),vy:-30,vx:-20+Math.random()*30,a:0,rest:false,land:112+Math.random()*4});st.rib=0;};
  return {title:sp.t||'Plane it smooth',how:'Hold to push the plane along the board. Keep the speed in the green: too fast and it chatters and tears the wood.',hint:'Hold to push. Keep the needle in the green.',st,
    update(dt,I){st.t+=dt;const bx=st.x+20;
      if(st.mode==='wait'){if(I.down){st.mode='push';st.cnt=0;st.ok=0;}}
      if(st.mode==='push'){st.v+=(I.down?150:-240)*dt;st.v=M4.cl(st.v,0,VMAX);st.x+=st.v*dt;const nb=st.x+20;
        const inb=st.v>=LO&&st.v<=HI,fast=st.v>HI;
        for(let x=Math.max(X0,Math.ceil(bx));x<Math.min(X1,nb);x++){const c=Math.floor((x-X0)/CELL);if(c<0||c>=NC)continue;if((x-X0)%CELL)continue;st.cnt++;
          if(inb){st.r[c]=Math.max(0,st.r[c]-1);st.torn[c]=0;st.ok++;st.rib+=CELL;}
          else if(fast){st.torn[c]=1;st.r[c]=Math.max(0,st.r[c]-1);if(st.rib)breakRib(nb,TOP);if(Math.random()<.5)K.emit(nb,TOP+4,2,{c:['#e8c890','#b48a5a'],v:70,ang:-Math.PI*.7,spread:1,g:300,life:.5});}
          else if(st.v>4&&st.rib)breakRib(nb,TOP);}
        if(fast){st.chat+=dt;if(st.chat>.05){st.chat=0;MS.knock();}}
        L().set(st.v>3&&nb>X0&&nb<X1?(.05+.11*Math.min(1,st.v/HI))*(fast?1.2:1):0,2400+st.v*14,fast?4:.9);
        if(nb>=X1+2){if(st.rib)breakRib(X1,TOP);st.inb.push(st.cnt?st.ok/st.cnt:0);st.pass++;st.mode='lift';st.lift=0;st.lx=st.x;MS.whoosh();L().set(0);
          const p=st.inb[st.inb.length-1];K.judge(p>.9?1:p>.7?.75:p>.4?.45:.15,X1-30,TOP-26);}}
      else if(loop)loop.set(0);
      if(st.mode==='lift'){st.lift+=dt/.8;st.x=st.lx+(X0-28-st.lx)*Math.min(1,st.lift);st.v=0;if(st.lift>=1){st.mode=(st.pass>=(sp.passes||3)||smooth()>.98)?'end':'wait';}}
      if(st.mode==='end'){st.end+=dt;if(st.end>.5){st.done=true;st.score=.65*smooth()+.35*M4.avg(st.inb);}}
      for(const c of st.curls){if(c.rest)continue;c.vy+=400*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.a+=dt*8;if(c.y>c.land){c.y=c.land;c.rest=true;}}},
    draw(t){g.drawImage(board,X0-1,TOP-1);
      let c=0;while(c<NC){const k=st.torn[c]?'T':st.r[c];let e=c+1;while(e<NC&&(st.torn[e]?'T':st.r[e])===k)e++;g.drawImage(tex(k),c*CELL,0,(e-c)*CELL,12,X0+c*CELL,TOP,(e-c)*CELL,12);c=e;}
      for(const cu of st.curls){for(let a=0;a<9;a+=.5){const r=cu.r*(1-a/12);K.px(cu.x+Math.cos(a+cu.a)*r,cu.y-cu.r+Math.sin(a+cu.a)*r*.8,2,1,a%1<.5?'#f6dcae':'#d8b07a');}}
      const lift=st.mode==='lift'?Math.sin(Math.PI*Math.min(1,st.lift))*14:0;const jit=st.v>HI?(Math.random()-.5)*2:0;const px_=Math.round(st.x),py=TOP+6-22-lift+jit;
      if(st.mode==='push'&&st.v>0)K.pa(px_+3,TOP+8,40,2,'#000',.18);
      g.drawImage(plane,px_,py);
      if(st.rib>0){const R=Math.min(9,2+st.rib*.04),A=Math.min(12.5,st.rib*.06),mx=px_+15,my=py+5;for(let a=0;a<A;a+=.35){const r=R*(1-a/(A+3));K.px(mx+4+Math.cos(-a*1.1)*r,my-R+Math.sin(-a*1.1)*r,2,2,a%1.4<.7?'#f6dcae':'#e0bc86');}}
      m4sleeve(K,px_+42,py+4,px_+70,py-24);m4hand(K,px_+38,py+5);m4sleeve(K,px_+5,py+4,px_-6,py-30,'#4a5a7a');m4hand(K,px_+8,py+6,true);},
    hud(t){const gx=110,gy=26;K.label('SPEED',gx-4,gy,'#f4ecd8',1,'r');K.gauge(gx,gy,100,6,LO/VMAX,HI/VMAX,st.v/VMAX);
      K.label('PASS '+Math.min((sp.passes||3),st.pass+1)+'/'+(sp.passes||3),250,gy,'#f4ecd8');K.meter(smooth(),M4.avg(st.inb)||1);
      if(st.mode==='wait'&&Math.floor(t*2.5)%2)K.label(st.pass?'HOLD FOR THE NEXT PASS':'HOLD TO PUSH',160,44,'#ffd27a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.mode==='wait')m4hold(a,st.t>.4);else if(st.mode==='push'){if(st.v<66)m4hold(a,true);else if(st.v>80)m4hold(a,false);}else m4hold(a,false);AP.hand=[st.x+36,TOP-24];AP.press=a.down;},
    quiet(){loop&&loop.set(0);},stop(){loop&&loop.stop();}};};
// ---------------------------------------------------------------- HAMMER: hold to raise, let go to strike; the edge nails want a lighter blow
S4.hammer=(sp,K)=>{const g=K.g,X0=sp.x0||58,X1=sp.x1||262,TOP=92,FR=104,N=sp.n||4,P=sp.wood||CA_P.oak,H0=13;
  const board=m4board(X1-X0,12,8,P,sp.seed||9),under=m4board(X1-X0-24,6,10,M4.sh(P,-1),(sp.seed||9)+3),ham=M4S.hammer();
  const nails=[];for(let i=0;i<N;i++){const x=Math.round(X0+18+(X1-X0-36)*(N>1?i/(N-1):.5));const edge=sp.edge&&(i===0||i===N-1);nails.push({x,h:H0,bent:0,sc:1,hits:0,split:0,edge,lo:edge?.34:.55,hi:edge?.58:.82});}
  const st={i:0,p:0,ph:'ready',sw:0,from:0,hx:nails[0].x,t:0,end:0,ang:.25,move:0,straight:0};
  const nailTop=n=>TOP+6-n.h;const HPX=47,HPY=12,HFACE=11;
  const strike=()=>{const n=nails[st.i],p=st.p,mid=(n.lo+n.hi)/2,half=(n.hi-n.lo)/2;let q,sink;n.hits++;
    if(p<n.lo){sink=H0*(.1+.12*p/n.lo);q=p<n.lo-.2?.15:.45;MS.knock();MS.tink(.1);}
    else if(p<=n.hi){const c=1-Math.abs(p-mid)/half;sink=H0*(.46+.16*c);q=c>.55?1:.75;MS.tink(p);MS.knock();K.emit(n.x,nailTop(n)-1,4,{c:['#fff4c0','#ffd27a'],v:60,g:150,life:.3});}
    else if(n.edge){n.split=1;sink=H0*.6;q=.15;MS.crunch();A.hiss(.25,.2,'bandpass',900,{q:2});K.shk=.2;}
    else{n.bent=1;sink=H0*.15;q=.15;A.tone(420,.28,'square',.05,{slide:170,filter:['lowpass',1400]});MS.tink(.9);st.straight=.6;}
    n.h=Math.max(0,n.h-sink);n.sc=Math.max(0,n.sc-(q>=.95?0:q>=.6?.06:q>=.3?.16:.3));K.judge(q,n.x,nailTop(n)-22,true);if(q>=.95)K.flash=.12;if(q<.3)MS.miss();K.shk=Math.max(K.shk,.08);
    K.emit(n.x,TOP+6,3,{c:['#c8a070','#8a6a48'],v:30,g:200,life:.4});
    if(n.h<=.6){n.h=0;MS.thunk();K.emit(n.x,TOP+6,8,{c:['#d8b888','#a88858'],v:45,spread:3,g:220,life:.5});if(st.i<N-1){st.move=.001;}else st.ph='end';}};
  return {title:sp.t||'Nail it together',how:'Hold to raise the hammer, let go to strike. Stop in the green: too hard bends the nail, and near the edge it splits the wood.',hint:'Hold, then let go in the green. Edge nails want less.',st,
    update(dt,I){st.t+=dt;const n=nails[st.i];
      if(st.move>0){st.move+=dt/.4;const nx=nails[Math.min(N-1,st.i+1)].x;st.hx+= (nx-st.hx)*Math.min(1,dt*10);if(st.move>=1){st.i++;st.move=0;st.hx=nails[st.i].x;st.ph='ready';}st.ang+=(.25-st.ang)*Math.min(1,dt*10);return;}
      if(st.straight>0){st.straight-=dt;if(st.straight<=0){n.bent=0;A.tone(300,.3,'sawtooth',.03,{slide:520,filter:['bandpass',900,4]});}return;}
      if(st.ph==='end'){st.end+=dt;st.ang+=(.25-st.ang)*Math.min(1,dt*8);if(st.end>.7){st.done=true;st.score=M4.avg(nails.map(n=>n.sc));}return;}
      if(st.ph==='ready'){st.ang+=(.25-st.ang)*Math.min(1,dt*10);if(I.pressed||(I.down&&!st.wasDown)){st.ph='raise';st.p=0;}}
      if(st.ph==='raise'){if(I.down){st.p=Math.min(1,st.p+dt/.85);st.ang=.25+st.p*1.25+(st.p>=1?Math.sin(st.t*40)*.03:0);}else{st.ph='swing';st.sw=0;st.from=st.ang;MS.whoosh();}}
      if(st.ph==='swing'){st.sw+=dt/.07;st.ang=st.from*(1-Math.min(1,st.sw));if(st.sw>=1){st.ang=0;strike();if(st.ph==='swing')st.ph='ready';}}
      st.wasDown=I.down;},
    draw(t){g.drawImage(under,X0+11,TOP+12);g.drawImage(board,X0-1,TOP-1);
      for(const n of nails){const top=nailTop(n);
        if(n.split){let x=n.x,y=TOP+6;const dir=n.x<160?-1:1;K.px(x,y,1,1,'#1a0e06');while(Math.abs(x-n.x)<Math.abs((dir<0?X0:X1)-n.x)){x+=dir*2;y+=(Math.random()<.5?-1:1);y=M4.cl(y,TOP+2,FR+6);K.px(x,y,2,1,'#1a0e06');}}
        if(n.h>0){if(n.bent){K.px(n.x,top+n.h*.5,1,n.h*.5,CA_P.iron[5]);for(let k=0;k<n.h*.5;k++)K.px(n.x+k*.7,top+n.h*.5-k,1,1,CA_P.iron[6]);K.px(n.x+n.h*.35-1,top-1,3,1,CA_P.iron[7]);}
          else{K.px(n.x,top,1,n.h,CA_P.iron[6]);K.px(n.x+1,top,1,n.h,CA_P.iron[4]);K.px(n.x-1,top-1,4,2,CA_P.iron[5]);K.px(n.x-1,top-1,4,1,CA_P.iron[7]);}}
        else{K.ell(n.x+.5,TOP+6,2,1,CA_P.iron[4]);K.px(n.x,TOP+5,1,1,CA_P.iron[7]);}
        if(n===nails[st.i]&&n.h>0)K.pa(n.x-3,TOP+5,8,3,'#ffd27a',.2+Math.sin(t*6)*.1);}
      const n=nails[st.i];const top=n.h>0?nailTop(n)-1:TOP+5;const pvx=st.hx+39,pvy=top-HFACE;
      M4.rot(g,ham,pvx,pvy,st.ang,HPX,HPY);const [hx,hy]=M4.tr(pvx,pvy,st.ang,-3,0);m4sleeve(K,hx+3,hy,hx+38,hy+30);m4hand(K,hx,hy);
      m4palm(K,X0+4,TOP+5,true);},
    hud(t){const n=nails[st.i];const gx=Math.min(300,st.hx+64),gy=30;K.gauge(gx,gy,6,58,n.lo,n.hi,st.ph==='raise'?st.p:st.ph==='swing'?st.p:0,{zone:n.edge?'#5a4a1c':'#2c5a1c'});
      if(n.edge)K.label('EDGE',gx+3,gy-8,'#e8b030');K.label('NAIL '+(st.i+1)+'/'+N,30,20,'#f4ecd8','l');
      K.meter(nails.filter(x=>x.h===0).length/N,M4.avg(nails.map(x=>x.sc)));},
    auto(dt,AP){const a=m4ai(this,AP,dt);const n=nails[st.i];
      if(st.ph==='ready'&&!st.move&&!st.straight&&st.t>.5){if(!this._w)this._w=.25;this._w-=dt;if(this._w<=0){m4hold(a,true);this._tg=(n.lo+n.hi)/2+(Math.random()-.5)*.06;this._w=.35;}}
      else if(st.ph==='raise'){if(st.p>=this._tg)m4hold(a,false);else m4hold(a,true);}
      AP.hand=[st.hx+40,nailTop(n)-34];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- BRUSH: drag the brush along the grain to cover it all; dip when it runs dry; don't let it pool
S4.brush=(sp,K)=>{const g=K.g,BX=50,BY=64,BW=212,BH=44,CS=4,GW=BW/CS,GH=BH/CS,P=sp.wood||CA_P.wood,COL=sp.col||'#7a3e1c';
  const top=M4.pre('btop'+P[3]+(sp.seed||2),BW,BH,k=>k.planks(0,0,BW,BH,M4.sh(P,1),11,sp.seed||2));const front=m4board(BW,0,8,P,(sp.seed||2)+1);
  const stain=document.createElement('canvas');stain.width=BW;stain.height=BH;const sg=stain.getContext('2d');
  const cov=new Float32Array(GW*GH),cross=new Uint8Array(GW*GH),brush=M4S.brush(),tin=M4S.tin();const TX=284,TY=116;const BR=[.2,.9,.5,1,.3,.8,.6,.1,.95,.4,.7,.25,.85,.55,.15,.65];
  const st={bx:200,by:40,lx:200,ly:40,load:1,still:0,pools:0,t:0,end:0,wet:[],dip:0,path:null,pi:0,ang:0,sc:stain,cov,seedK:0};
  const covered=()=>{let n=0;for(let i=0;i<cov.length;i++)if(cov[i]>=.6)n++;return n/cov.length;};
  const stamp=(x,y,horiz)=>{const lx=x-BX,ly=y-BY;if(lx<-2||ly<-7||lx>BW+2||ly>BH+7)return;const L=st.load;if(L<=.02)return;
    const fw=4,fh=14;sg.fillStyle=COL;const y0=Math.round(ly-fh/2),x0=Math.round(lx-fw/2);
    // bristle streaks: each hair lays a slightly different amount, so wet strokes show their direction
    if(horiz)for(let k=0;k<fh;k++){sg.globalAlpha=.34*L*(.55+.9*BR[(k+st.seedK)%BR.length]);sg.fillRect(x0,y0+k,fw,1);}
    else for(let k=0;k<fh;k+=2){sg.globalAlpha=.22*L;sg.fillRect(x0+(k%4?1:0),y0+k,fw-1,1);}
    sg.globalAlpha=1;const a=L*(horiz?.42:.3);for(let cy=Math.floor((ly-fh/2)/CS);cy<=Math.floor((ly+fh/2-1)/CS);cy++)for(let cx=Math.floor((lx-fw/2)/CS);cx<=Math.floor((lx+fw/2-1)/CS);cx++){if(cx<0||cy<0||cx>=GW||cy>=GH)continue;const i=cy*GW+cx;cov[i]+=a/(horiz?1:2.2);if(!horiz)cross[i]=1;}
    st.load=Math.max(0,st.load-.0055);if(Math.random()<.3)st.wet.push({x:x+(Math.random()-.5)*3,y:y+(Math.random()-.5)*12,t:0});};
  // the demo's (and the keyboard's) way round: along each row with the grain, dipping when dry
  const plan=()=>{const P_=[];for(let r=0;r<4;r++){const y=BY+6+r*10.7;const L2R=r%2===0;P_.push({x:L2R?BX-4:BX+BW+4,y,up:true},{x:L2R?BX+BW+4:BX-4,y,up:false});}return P_;};
  return {title:sp.t||'Brush on the finish',how:'Drag the brush along the grain (side to side) to cover the wood. Dip it in the tin when it runs dry, and keep it moving or it pools.',hint:'Drag along the grain. Dip when dry. Keep moving.',st,
    update(dt,I,t){st.t+=dt;const auto=I.key||I.demo&&this._auto;
      if(st.dip>0){st.dip-=dt;if(st.dip<=0){st.load=1;MS.drip();setTimeout(()=>MS.drip(),90);}}
      let tx=I.x,ty=I.y,down=I.down;
      if(I.key){if(!st.path){st.path=plan();st.pi=0;}down=false;if(I.down){const tg=st.load<.3&&st.dip<=0?{x:TX,y:TY-10,up:true,dip:1}:st.path[st.pi%st.path.length];const d=Math.hypot(tg.x-st.bx,tg.y-st.by),spd=150*dt;
          if(d<=spd){st.bx=tg.x;st.by=tg.y;if(tg.dip){st.dip=.35;}else st.pi++;}else{st.bx+=(tg.x-st.bx)/d*spd;st.by+=(tg.y-st.by)/d*spd;}down=!tg.up&&!tg.dip;tx=st.bx;ty=st.by;}else{tx=st.bx;ty=st.by;}}
      else{st.bx+=(tx-st.bx)*Math.min(1,dt*22);st.by+=(ty-st.by)*Math.min(1,dt*22);}
      const dx=st.bx-st.lx,dy=st.by-st.ly,dist=Math.hypot(dx,dy);st.ang+=((M4.cl(dx*.25,-.5,.5))-st.ang)*Math.min(1,dt*10);
      if(down&&Math.hypot(st.bx-TX,st.by-(TY-8))<16&&st.dip<=0&&st.load<.95){st.dip=.35;}
      const onB=st.bx>BX-3&&st.bx<BX+BW+3&&st.by>BY-4&&st.by<BY+BH+4;
      if(down&&!st.wasD)st.seedK=(Math.random()*16)|0;st.wasD=down;
      if(down&&onB&&st.dip<=0){const n=Math.max(1,Math.ceil(dist/2));const horiz=Math.abs(dx)>=Math.abs(dy)*.8||dist<.5;for(let k=1;k<=n;k++)stamp(st.lx+dx*k/n,st.ly+dy*k/n,horiz);
        if(dist/dt<10&&st.load>.25){st.still+=dt;if(st.still>.65){st.pools++;st.still=-.5;sg.globalAlpha=.55;sg.fillStyle=COL;sg.beginPath();sg.ellipse(st.bx-BX,st.by-BY+3,5,3,0,0,6.29);sg.fill();sg.globalAlpha=1;MS.drip();K.judge(.1,st.bx,st.by-16,true);}}else st.still=Math.max(0,st.still-dt);
}
      if(!this._snd)this._snd=MS.loop('bandpass',1700,.8);this._snd.set(down&&onB&&st.dip<=0?Math.min(.16,dist/dt/900)*(.4+st.load*.6):0,1300+Math.min(900,dist/dt*4));
      st.lx=st.bx;st.ly=st.by;for(let k=st.wet.length-1;k>=0;k--){st.wet[k].t+=dt;if(st.wet[k].t>1.2)st.wet.splice(k,1);}
      const c=covered();if((c>=.97||st.t>(sp.time||20))&&!st.end){st.end=.001;MS.good();}
      if(st.end){st.end+=dt;if(st.end>.6){let m=0,v=0,n=0,xs=0;for(let i=0;i<cov.length;i++){const x=Math.min(2,cov[i]);if(cov[i]>=.6){m+=x;n++;xs+=cross[i];}}m/=Math.max(1,n);for(let i=0;i<cov.length;i++)if(cov[i]>=.6)v+=(Math.min(2,cov[i])-m)**2;v=Math.sqrt(v/Math.max(1,n));
        st.done=true;st.score=M4.cl(.58*c+.22*(1-xs/Math.max(1,n))+.2*M4.cl(1-v/.7,0,1)-st.pools*.08,0,1);}}},
    draw(t){g.drawImage(front,BX-1,BY+BH-1);g.drawImage(top,BX,BY);K.px(BX,BY,BW,1,M4.sh(P,1)[7]);
      g.save();g.globalCompositeOperation='multiply';g.drawImage(stain,BX,BY);g.globalCompositeOperation='source-over';g.globalAlpha=.35;g.drawImage(stain,BX,BY);g.restore();
      for(const w of st.wet)K.pa(w.x,w.y,1,1,'#fff6e0',.7*(1-w.t/1.2));
      g.drawImage(tin,TX-15,TY-20);
      const b=st.dip>0?{x:TX,y:TY-12+Math.sin(st.dip*9)*3}:{x:st.bx,y:st.by};K.pa(b.x-6,b.y+2,12,3,'#000',.2);
      M4.rot(g,brush,b.x,b.y,st.ang,10,40);const tipC=st.load>.5?COL:st.load>.15?'#9a6a3a':'#c8a878';const [tx_,ty_]=M4.tr(b.x,b.y,st.ang,0,-2);K.px(tx_-5,ty_-3,11,3,tipC);
      const [hx,hy]=M4.tr(b.x,b.y,st.ang,0,-30);m4sleeve(K,hx+3,hy,hx+30,hy-30);m4hand(K,hx,hy);},
    hud(t){K.meter(covered());K.label('LOAD',TX,TY+8,'#f4ecd8');K.px(TX-12,TY+15,24,3,'#1a0e06');K.px(TX-11,TY+16,22*st.load,1,st.load<.15?'#d84a2a':'#e8b030');
      if(st.load<.3&&st.dip<=0&&Math.floor(t*3)%2)K.label(st.load<.1?'DIP IT':'RUNNING DRY',TX-10,TY-34,'#ffd27a');},
    auto(dt,AP){this._auto=true;const a=m4ai(this,AP,dt);if(!this._p){this._p=plan();this._i=0;}
      const tg=st.load<.3&&st.dip<=0?{x:TX,y:TY-8,up:false,dip:1}:this._p[this._i%this._p.length];const d=Math.hypot(tg.x-a.x,tg.y-a.y),spd=150*dt;
      if(d<=spd){m4move(a,tg.x,tg.y);if(!tg.dip)this._i++;}else m4move(a,a.x+(tg.x-a.x)/d*spd,a.y+(tg.y-a.y)/d*spd);m4hold(a,!tg.up);AP.hand=[a.x+4,a.y-36];AP.press=a.down;},
    quiet(){this._snd&&this._snd.set(0);},stop(){this._snd&&this._snd.stop();this._snd=null;}};};
// ---------------------------------------------------------------- CHOP: the hand feeds the knife; chop when the edge reaches the mark for even slices
const VEG={
  carrot:{L:74,R:u=>2.2+4.6*Math.min(1,u/60),w0:6,skin:['#5a1c04','#9a3a0c','#d05a16','#ec7c2a','#f8a050'],flesh:['#e8701c','#f49a40','#fcc070'],crunch:1,
    deco(K,x,u,cy,r){if(u%7<1)K.px(x,cy-r+2,1,r*2-3,'#b8460e');},top:(K,x,cy,t)=>{for(let k=0;k<7;k++){const a=-.9+k*.3+Math.sin(t*2+k)*.05;K.line(x,cy,x+Math.cos(a)*14,cy-4+Math.sin(a)*12,k%2?'#4a8a2a':'#6aaa3a',1);}}},
  turnip:{L:34,R:u=>Math.max(1.5,13*Math.sqrt(Math.max(0,1-((u-17)/17)**2))),w0:7,skin:['#5a1c4a','#8a3a7a','#c8a0c8','#ece4e8','#fbf8f6'],flesh:['#e8e0d0','#f6f0e4','#fffaf0'],crunch:1,purple:1,
    top:(K,x,cy,t)=>{for(let k=0;k<5;k++){const a=-.7+k*.35;K.line(x,cy-2,x+Math.cos(a)*10,cy-6+Math.sin(a)*9,k%2?'#4a8a2a':'#6aaa3a',2);}}},
  potato:{L:42,R:u=>Math.max(2,11*Math.sqrt(Math.max(0,1-((u-21)/21)**2))),w0:7,skin:['#4a2e14','#7a5428','#a87c44','#c8a060','#e0c088'],flesh:['#e8d088','#f4e2a8','#fcf0c8'],
    deco(K,x,u,cy,r){if((u*7)%23<1.2)K.px(x,cy-r*.3,2,1,'#5a3a1a');}},
  onion:{L:36,R:u=>Math.max(2,12.5*Math.sqrt(Math.max(0,1-((u-18)/18)**2))),w0:6,skin:['#5a2a0c','#8a4a1a','#b87430','#d89a48','#ecc070'],flesh:['#d8c0d8','#ece0ec','#fbf6fb'],rings:1,
    deco(K,x,u,cy,r){if(u%5<1)K.px(x,cy-r+1,1,r*2-2,'#a86428');},top:(K,x,cy,t)=>{K.line(x,cy,x+8,cy-3,'#c8a060',2);}},
  shroom:{L:46,R:u=>u<30?4.5:4.5+Math.sin(Math.min(1,(u-30)/16)*Math.PI)*6,w0:6,skin:['#0c3a34','#1a6a5a','#2aa08a','#6ae8d0','#c8fff0'],flesh:['#a8f0e0','#d0fff4','#ffffff'],glow:1},
  corn:{L:56,R:u=>Math.max(2,7-Math.abs(u-28)*.08),w0:7,skin:['#7a5410','#c8901c','#e8b830','#f6d050','#fff08a'],flesh:['#f0d060','#f8e080','#fff4b0'],core:'#e8d8a0',
    deco(K,x,u,cy,r){if(u%3<1)K.px(x,cy-r+1,1,r*2-2,'#c8901c');for(let y=-r+2;y<r-1;y+=3)K.px(x,cy+y,1,1,'#fff08a');}},
  fish:{L:60,R:u=>3.6+Math.sin(Math.min(1,u/60)*Math.PI)*2,w0:9,skin:['#3a4a58','#6a7a88','#a8b4bc','#e8d8d0','#f8ece6'],flesh:['#f0b8a8','#f8d0c4','#fff0ea'],flat:1}};
S4.chop=(sp,K)=>{const g=K.g,KX=152,CY=100,BX0=34,BX1=286,BTOP=96,FEEDX=8;const list=(sp.veg||['carrot']).map(n=>VEG[n]);
  const board=M4.pre('cboard',BX1-BX0+2,22,k=>{k.plank(1,1,BX1-BX0,14,['#4a2e16','#6c4422','#8e5c30','#b07a44','#c89456','#ddb276','#ecc890','#f6dcae'],17);k.plank(1,15,BX1-BX0,5,CA_P.oak,3);k.px(BX1-12,4,6,5,'#2a1608');k.px(BX1-11,5,4,3,'#4a2e16');},true);
  const knife=M4S.knife();
  const st={vi:0,fed:0,cut:3,slices:[],kph:-1,t:0,q:[],n:0,end:0,swap:0,ph:Math.random()*6,wait:0,pile:0};
  const V=()=>list[st.vi];const uk=()=>st.fed-FEEDX;
  const total=list.reduce((a,v)=>a+Math.max(1,Math.floor((v.L-3-v.w0*1.3)/v.w0)),0);
  const chopNow=()=>{const v=V();if(!v||st.swap)return;const u=uk();if(u<=st.cut+.6){MS.knock();return;}const w=u-st.cut;const e=Math.abs(w-v.w0)/v.w0;const q=w<v.w0*.4?.15:M4.q(e,.16,.32,.55);
    const r=v.R((st.cut+u)/2);st.slices.push({w,r,v,a:0,x:KX-w/2,y:CY,tx:BX0+22+(st.pile%10)*10.5+(Math.random()-.5)*2,ty:CY+3-Math.floor(st.pile/10)*3+(Math.random()-.5),t:0});st.pile++;
    st.cut=u;st.q.push(q);st.n++;MS.chop();if(v.crunch)MS.crunch();K.judge(q,KX-56,CY-34,true);if(q>=.95)K.emit(KX,CY-6,5,{c:['#fff4c0','#ffd27a'],v:40,g:40,life:.4});else if(q<.3)MS.miss();
    K.emit(KX,CY,5,{c:v.flesh,v:46,g:300,life:.5,spread:2.4});
    if(v.L-st.cut<v.w0*1.3){st.swap=.001;}};
  return {title:sp.t||'Chop it evenly',how:'The hand feeds the knife. Tap to chop each time the cut edge reaches the mark, for even slices.',hint:'Chop as the edge meets the mark.',st,
    update(dt,I){st.t+=dt;const v=V();
      if(st.kph>=0){const p=st.kph;st.kph+=dt/.24;if(p<.24&&st.kph>=.24)chopNow();if(st.kph>=1)st.kph=-1;}
      if(st.swap){st.swap+=dt;if(st.swap>.45){st.swap=0;if(st.vi<list.length-1){st.vi++;st.fed=-46;st.cut=3;}else{st.gone=1;st.end=.001;}}}
      else if(v&&!st.end){const base=v.w0/.6;const spd=base*(1+.38*Math.sin(st.t*1.6+st.ph)+.2*Math.sin(st.t*3.4+st.ph*2));if(uk()<st.cut-.5)st.fed+=Math.min(st.cut-uk()+.01,140*dt);else if(uk()-st.cut<v.w0*2.6)st.fed+=Math.max(2,spd)*dt;}
      if(I.pressed&&st.kph<0&&!st.end)st.kph=0;
      for(const s of st.slices){s.t+=dt;s.a=Math.min(1,s.t/.22);if(s.t>.12){s.x+=(s.tx-s.x)*Math.min(1,dt*5);s.y+=(s.ty-s.y)*Math.min(1,dt*5);}}
      if(st.end){st.end+=dt;if(st.end>.7){st.done=true;st.score=M4.avg(st.q);}}},
    draw(t){g.drawImage(board,BX0-1,BTOP-1);const v=V();
      for(const s of st.slices){const v2=s.v,r=s.r;if(s.a<1){const fw=Math.max(1,s.w*(1-s.a)),fx=s.x-fw/2;K.px(fx,s.y-r,fw,r*2,v2.skin[2]);K.ell(fx,s.y,Math.max(1,r*.85*s.a),r,v2.flesh[1]);}
        else{const rx=Math.max(2,r*.85),ry=Math.max(1.5,r*.55);K.pa(s.x-rx,s.y+ry-1,rx*2,2,'#000',.25);K.ell(s.x,s.y,rx,ry,v2.skin[1]);K.ell(s.x,s.y-1,rx-1,Math.max(1,ry-1),v2.flesh[1]);
          if(v2.rings)for(let k=1;k<3;k++)K.g.strokeStyle=v2.flesh[0],K.g.lineWidth=1,K.g.beginPath(),K.g.ellipse(s.x,s.y-1,rx*k/3,ry*k/3,0,0,6.29),K.g.stroke();
          else K.ell(s.x,s.y-1,Math.max(1,rx*.45),Math.max(1,ry*.45),v2.flesh[2]);if(v2.core)K.px(s.x-1,s.y-1,2,1,v2.core);K.px(s.x-rx*.5,s.y-ry*.6,2,1,'#ffffff');}}
      if(v&&!st.gone){const tip=KX+FEEDX-st.fed+(st.swap?st.swap*420:0);
        for(let u=Math.ceil(st.cut);u<=v.L;u++){const x=tip+u,r=v.R(u);if(x>330)break;K.px(x,CY-r,1,r*2,v.skin[2]);K.px(x,CY-r,1,Math.max(1,r*.55),v.skin[3]);K.px(x,CY-r,1,1,v.skin[4]);K.px(x,CY+r*.45,1,r*.55,v.skin[1]);K.px(x,CY+r-1,1,1,v.skin[0]);
          if(v.purple&&u>v.L*.45)K.px(x,CY-r,1,r*1.1,u>v.L*.65?v.skin[1]:v.skin[2]);if(v.deco)v.deco(K,x,u,CY,r);}
        const fx=tip+st.cut,fr=v.R(st.cut+.5);K.ell(fx,CY,1,fr,v.flesh[1]);K.px(fx,CY-fr*.4,1,fr*.8,v.flesh[2]);if(v.top)v.top(K,tip+v.L,CY,t);if(v.glow)K.glow(tip+v.L*.6,CY,26,'120,255,220',.25);
        if(!st.swap){const hx=Math.max(KX+16,tip+st.cut+12),hr=v.R(M4.cl(hx-tip,0,v.L));m4sleeve(K,hx+4,CY-hr-6,hx+42,CY-hr-34);m4hand(K,hx,CY-hr-4);}}
      if(v&&!st.swap&&!st.end){const mx=KX-v.w0;K.px(mx,BTOP+15,1,3,'#fff4c0');K.pa(mx,BTOP+1,1,13,'#fff4c0',.25);}
      const kp=st.kph<0?0:st.kph<.24?st.kph/.24:st.kph<.4?1:1-(st.kph-.4)/.6;const r0=v&&!st.gone?v.R(M4.cl(Math.max(st.cut,uk()),0,v.L)):5;const yUp=CY-r0-52+Math.sin(st.t*3)*1,yDn=CY+r0-44;const ky=Math.round(yUp+(yDn-yUp)*kp);
      g.drawImage(knife,KX-8,ky);m4sleeve(K,KX+3,ky+6,KX+34,ky-20);m4hand(K,KX,ky+6);},
    hud(){K.meter((st.n)/Math.max(1,total),M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);const v=V();if(v&&!st.swap&&st.kph<0&&!st.end){if(this._j==null)this._j=(Math.random()-.5)*.5;const lead=v.w0/.6*.058;if(uk()-st.cut>=v.w0-lead+this._j&&uk()>st.cut){m4tap(a);this._j=null;}}AP.hand=[KX+14,CY-40];AP.press=a.down;},
    quiet(){},stop(){}};};
// ---------------------------------------------------------------- SIMMER: hold to turn up the fire; the pot answers slowly; keep it in the band, and mind the cold things going in
S4.simmer=(sp,K)=>{const g=K.g,CX=160,BOT=104,LO=sp.lo||.55,HI=sp.hi||.75,COL=sp.col||['#c8a040','#e8c868'],DUR=sp.dur||7,pot=M4S.pot('i');
  const adds=(sp.adds||[{at:2.6,icon:'turnip'},{at:6,icon:'turnip'}]).map(a=>Object.assign({fall:-1},a));
  const st={T:.3,f:0,prog:0,inT:0,runT:0,foam:0,overs:0,t:0,end:0,stir:0};let bub=null,fire=null;
  const L=()=>{if(!bub){bub=MS.loop('lowpass',520,1.2);fire=MS.loop('bandpass',260,.7);}};
  return {title:sp.t||'Keep it on a simmer',how:'Hold to turn up the fire, let go to ease it. The pot is slow to answer, so think ahead. Keep the heat in the green until it’s cooked.',hint:'Hold for more fire. Keep the heat in the green.',st,
    update(dt,I){st.t+=dt;L();if(st.end){st.end+=dt;bub.set(.04);fire.set(0);if(st.end>.8){st.done=true;st.score=M4.cl(st.inT/Math.max(1,st.runT)*1.08-st.overs*.18,0,1);}return;}
      st.runT+=dt;st.f+=((I.down?1:0)-st.f)*Math.min(1,dt*2.6);st.T+=(.4*st.f-.24*(st.T-.12))*dt*(sp.slow||1);
      for(const a of adds){if(a.fall<0&&st.t>=a.at-.6){a.fall=0;}if(a.fall>=0&&a.fall<1){a.fall+=dt/.6;if(a.fall>=1){st.T-=sp.chill||.14;MS.plop();setTimeout(()=>MS.plop(),70);K.emit(CX,74,12,{c:COL,v:70,g:300,life:.6});}}}
      const inb=st.T>=LO&&st.T<=HI;if(inb){st.inT+=dt;st.prog+=dt/DUR;}else if(st.T>HI)st.prog+=dt/(DUR*2.2);
      if(st.T>HI+.08)st.foam+=(st.T-HI-.04)*2.2*dt;else st.foam=Math.max(0,st.foam-dt*.5);
      if(st.foam>=1){st.foam=0;st.overs++;st.T-=.18;MS.sizzleHit();MS.steam();K.shk=.25;K.emit(CX,72,24,{c:['#ffffff','#f0e8d8',COL[1]],v:80,spread:3,g:260,life:.9});K.judge(.1,CX,52,true);MS.miss();}
      st.stir+=dt*(1.5+st.T*2);bub.set(Math.max(0,st.T-.35)*.28,300+st.T*500);fire.set(st.f*.07,200+st.f*200);
      if(st.T>.42&&Math.random()<dt*(st.T*9)){A.tone(180+Math.random()*260,.06,'sine',.03+st.T*.03,{slide:90});}
      if(st.T>.4&&Math.random()<dt*st.T*14)K.emit(CX-28+Math.random()*56,74,1,{c:['#efe8dc'],v:14,g:-30,life:1.4,sz:3,kind:'steam'});
      if(st.prog>=1||st.runT>(sp.time||17)){st.end=.001;MS.good();}},
    draw(t){const f=st.f,T=st.T;
      for(let i=0;i<9;i++){const fx=CX-34+i*8.5,fh=2+f*7+Math.sin(t*20+i*1.7)*1.4;K.px(fx,BOT+1-fh,4,fh,i%2?'#3a6ae8':'#5a8af8');K.px(fx+1,BOT+1-fh*.5,2,fh*.5,'#c8e0ff');if(f>.5)K.px(fx+1,BOT-fh-2,2,2,'#f8b83c');}
      if(f>.05)K.glow(CX,BOT,40+f*20,'90,140,255',.12+f*.15);
      g.drawImage(pot,CX-43,BOT-36);
      const sy=BOT-31;K.ell(CX,sy,34,4,COL[0]);K.ell(CX-4,sy-1,24,2,COL[1]);
      (sp.bits||[]).forEach((c,i)=>{const bx=CX-26+((i*23+Math.floor(st.stir*2)*5)%52),by=sy-1+Math.sin(st.stir+i)*1.2;K.px(bx,by,3,2,c);K.px(bx,by,1,1,'#ffffff');});
      const nb=T<.42?0:T<LO?2:T<=HI?6:12;for(let i=0;i<nb;i++){const ph=(t*(1+T*3)+i*.37)%1,bx=CX-30+((i*29+Math.floor(t*(2+T*6))*7)%60);if(ph<.75){const big=T>HI&&i%2;K.px(bx,sy-(ph>.5?1:0),big?3:2,big?2:1,COL[1]);K.px(bx,sy-(ph>.5?1:0),1,1,'#fff8e0');}}
      if(st.foam>0){const fh=st.foam*9;for(let x=-34;x<=34;x+=2){const h=fh*(.7+.3*Math.sin(x*.7+t*6));K.px(CX+x,sy-h,2,h+1,x%4?'#fbf6ea':'#efe6d0');}}
      if(sp.glow)K.glow(CX,sy,50,'120,255,220',.25+Math.sin(t*3)*.05);
      const ang=st.stir;const sx=CX+Math.cos(ang)*18,syy=sy-Math.abs(Math.sin(ang))*1;K.line(sx,syy,sx+10,syy-34,CA_P.wood[4],2);K.px(sx-1,syy-1,4,3,CA_P.wood[3]);
      for(const a of adds)if(a.fall>=0&&a.fall<1){const y=20+a.fall*(sy-20);K.icon(a.icon,CX-8,y-16,.5);}
      const kx=120,ky=128;K.ball(kx,ky,5,CA_P.brass);const ka=-2.2+f*2.2;K.line(kx,ky,kx+Math.cos(ka)*4,ky+Math.sin(ka)*4,'#3a2608',1);},
    hud(t){const gx=286,gy=30,gh=92;K.label('HEAT',gx+4,gy-9,'#f4ecd8');K.gauge(gx,gy,8,gh,LO/1.1,HI/1.1,st.T/1.1,{zone:'#2c5a1c'});
      if(st.T>HI+.08&&Math.floor(t*6)%2)K.label('BOILING OVER',160,24,'#e8542a');K.meter(st.prog,st.runT?st.inT/st.runT:1);
      for(const a of adds)if(a.fall>=0&&a.fall<1)K.label('IN IT GOES',160,34,'#ffd27a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);const Tp=st.T+(.4*st.f-.24*(st.T-.12))*.75;m4hold(a,Tp<(LO+HI)/2-.02);AP.hand=[124,118];AP.press=a.down;},
    quiet(){bub&&bub.set(0);fire&&fire.set(0);},stop(){bub&&bub.stop();fire&&fire.stop();bub=fire=null;}};};
// ---------------------------------------------------------------- POUR: hold to tilt; the fuller the jug, the sooner it pours; stop at the line (it keeps running a moment after)
S4.pour=(sp,K)=>{const g=K.g,ves=sp.vessel||'jug',img=ves==='ladle'?M4S.ladle():ves==='crucible'?M4S.crucible():M4S.jug(),COL=sp.col||['#f4eee0','#fffaf0'],LT=sp.line||.78,cap=ves==='ladle'?.36:1.5,NB=sp.n||1;
  const PV=ves==='ladle'?{x:190,y:62,ox:10,oy:18,sx:1,sy:14}:ves==='crucible'?{x:212,y:54,ox:15,oy:18,sx:2,sy:3}:{x:214,y:52,ox:19,oy:20,sx:3,sy:4};
  const bowl=M4S.bowl(sp.bowl||'clay');const st={a:0,V:1,q:0,L:0,bi:0,res:[],t:0,still:0,done2:0,spill:0,dip:0,end:0,slide:0,splash:[]};
  let loop=null;const S=()=>loop||(loop=MS.loop('bandpass',500,6));
  const spout=a=>M4.tr(PV.x,PV.y,-a,PV.sx-PV.ox,PV.sy-PV.oy);
  const [s1x]=spout(1.05);const BX=Math.round(s1x-10),BY=112,RIM=BY-17;
  const a0=()=>ves==='ladle'?.5+(1-st.V)*.7:.42+(1-st.V)*.75;
  const judgeBowl=()=>{const e=Math.abs(st.L-LT);const q=st.L>1.02?.1:e<=.035?1:e<=.075?.8:e<=.13?.55:e<=.2?.3:.1;st.res.push(q);K.judge(q,BX,RIM-30);};
  return {title:sp.t||'Pour it to the line',how:'Hold to tip the '+(ves==='ladle'?'ladle':'jug')+', let go to straighten it. It keeps running a moment after you let go, so stop just before the line.',hint:'Hold to tip. Let go just before the line.',st,
    update(dt,I){st.t+=dt;if(st.end){st.end+=dt;S().set(0);if(st.end>.6){st.done=true;st.score=M4.avg(st.res);}return;}
      if(st.slide>0){st.slide+=dt/.7;if(st.slide>=1){st.slide=0;st.bi++;st.L=0;st.still=0;st.done2=0;}S().set(0);return;}
      if(st.dip>0){st.dip+=dt/.9;st.a=Math.max(0,st.a-dt*3);if(st.dip>=1){st.dip=0;st.V=1;st.still=0;MS.plop();}S().set(0);return;}
      st.a+=(I.down?1.15:-1.9)*dt;st.a=M4.cl(st.a,0,1.75);const Q=st.V>0?1.1*Math.pow(Math.max(0,st.a-a0()),1.4):0;st.q+=(Q-st.q)*Math.min(1,dt/.14);if(st.V<=0)st.q=Math.max(0,st.q-dt*3);
      const fl=st.q*dt;if(fl>0){st.L+=fl;st.V=Math.max(0,st.V-fl/cap);if(Math.random()<st.q*1.2)st.splash.push({x:BX+(Math.random()-.5)*6,y:RIM+2+(1-Math.min(1,st.L))*12,t:0});}
      if(st.L>1.02&&!st.spill){st.spill=1;MS.sizzleHit&&A.hiss(.4,.12,'lowpass',800);}
      S().set(Math.min(.22,st.q*.35),350+Math.min(1.1,st.L)*1500,6);
      if(st.q>.01)st.still=0;else if(st.L>.2){st.still+=dt;}
      if(ves==='ladle'&&st.V<.03&&st.q<.05&&st.L<LT-.02&&!st.dip){st.dip=.001;MS.plop();}   // empty: back to the pot for more, whatever your hand is doing
      if(st.still>(st.L>=LT-.12?.7:2.4)||(st.L>1.1&&st.q<.02)){judgeBowl();if(st.bi<NB-1){st.slide=.001;}else st.end=.001;}
      for(let k=st.splash.length-1;k>=0;k--){st.splash[k].t+=dt;if(st.splash[k].t>.35)st.splash.splice(k,1);}},
    draw(t){const off=st.slide>0?-st.slide*140:0;const bx=BX+off;
      if(sp.bowl==='mould'){const I=CA_P.iron;K.px(bx-46,BY,92,14,CA_P.stone[3]);K.px(bx-46,BY,92,2,CA_P.stone[5]);K.px(bx-46,BY+13,92,1,CA_P.stone[1]);for(let x=bx-44;x<bx+44;x+=9)K.px(x,BY+4+(x%3),5,1,CA_P.stone[2]);K.px(bx-46,BY+14,92,BY+14<124?124-BY-14:0,CA_P.stone[2]);K.pa(bx-34,BY-1,68,3,'#000',.35);K.px(bx-32,RIM+3,64,BY-RIM-3,I[2]);K.px(bx-32,RIM+3,64,1,I[1]);K.px(bx-32,RIM-6,64,9,I[4]);K.px(bx-32,RIM-6,64,1,I[6]);
        K.px(bx-24,RIM-4,48,6,'#141210');K.px(bx-24,RIM-4,48,2,'#2a2624');const lv=Math.min(1.05,st.L);if(lv>.01){const top=Math.round(RIM-4+(1-lv)*3);K.px(bx-24+(1-lv)*2,top,48-(1-lv)*4,RIM+2-top,COL[0]);K.px(bx-22,top,30,1,COL[1]);K.glow(bx,RIM,40,'255,170,80',.35*lv);}
        const ly=Math.round(RIM-4+(1-LT)*3);for(let x=-24;x<24;x+=3)K.px(bx+x,ly,2,1,'#9be07a');if(st.L>1.02){K.px(bx-34,RIM-2,4,BY-RIM,COL[0]);K.px(bx+30,RIM-2,4,BY-RIM,COL[0]);}}
      else{
      g.drawImage(bowl,bx-30,BY-22);g.save();g.beginPath();g.ellipse(bx,RIM,25,4.5,0,0,6.29);g.clip();K.px(bx-26,RIM-5,52,10,sp.bowl==='wood'?'#4a2e16':'#5a3020');K.ell(bx,RIM+2.4,10,1.6,sp.bowl==='wood'?'#6c4422':'#7a4430');K.pa(bx-26,RIM-5,52,3,'#000',.3);
      const lv=Math.min(1.05,st.L);if(lv>.01){const ly=RIM+2.6*(1-lv),rx=9+lv*15.5,ry=1.6+lv*2.8;K.ell(bx,ly,rx,ry,COL[0]);K.ell(bx-3,ly-.6,rx*.55,Math.max(1,ry*.4),COL[1]);if(sp.glow)K.glow(bx,ly,30,'120,255,220',.3);
        if(st.q>.01)for(let k=1;k<3;k++){const rr=((st.t*1.6+k*.5)%1);g.strokeStyle=`rgba(255,255,255,${.4*(1-rr)})`;g.lineWidth=1;g.beginPath();g.ellipse(bx-4,ly,3+rr*rx*.6,1+rr*ry*.6,0,0,6.29);g.stroke();}}
      const tly=RIM+2.6*(1-LT),trx=9+LT*15.5,tr_=1.6+LT*2.8;for(let a=Math.PI;a<=Math.PI*2;a+=.2)K.px(bx+Math.cos(a)*trx,tly+Math.sin(a)*tr_,1,1,'#9be07a');g.restore();
      if(st.L>1.02){for(let k=0;k<5;k++)K.px(bx-20+k*10,RIM+2+((t*30+k*7)%14),2,3,COL[0]);K.ell(bx,BY+1,30,2,COL[0]);}}
      for(const s of st.splash)K.px(s.x+s.t*30*(s.x>bx?1:-1),s.y-Math.sin(s.t*9)*5,1,1,COL[1]);
      if(ves==='ladle'){const px=262,py=112;g.drawImage(M4S.pot('i'),px-43,py-36);K.ell(px,py-31,34,4,COL[0]);K.ell(px-4,py-32,24,2,COL[1]);if(sp.glow)K.glow(px,py-31,40,'120,255,220',.25);}
      let ax=PV.x,ay=PV.y,aa=st.a;if(st.dip>0){const u=Math.sin(Math.PI*st.dip);ax+=u*70;ay+=u*16;aa=-u*.3;}
      M4.rot(g,img,ax,ay,-aa,PV.ox,PV.oy);
      const fullness=st.V;if(ves==='jug'&&aa<.2){K.ell(ax,ay-15,7,1,fullness>.1?COL[0]:'#3a3428');}
      if(st.q>.004&&!st.dip){const [sx,sy]=M4.tr(ax,ay,-aa,PV.sx-PV.ox,PV.sy-PV.oy);const vx=-(8+st.q*16),sur=RIM+2.6*(1-Math.min(1,st.L))-1;let x=sx,y=sy,vy=10;const w=st.q>.5?3:st.q>.15?2:1;
        for(let k=0;k<60&&y<sur;k++){K.px(x,y,w,2,COL[0]);if(k%3===0)K.px(x,y,1,1,COL[1]);const dtt=.012;x+=vx*dtt;vy+=600*dtt;y+=vy*dtt;}
        K.ell(x,sur,3+w,1,COL[1]);}
      const [hx,hy]=M4.tr(ax,ay,-aa,ves==='ladle'?55-PV.ox:31-PV.ox,ves==='ladle'?3-PV.oy:20-PV.oy);m4sleeve(K,hx+3,hy,hx+40,hy-24);m4hand(K,hx,hy);},
    hud(t){const gx=290,gy=40;K.label('FILL',gx+4,gy-9,'#f4ecd8');K.gauge(gx,gy,8,70,(LT-.035)/1.1,(LT+.035)/1.1,Math.min(1.1,st.L)/1.1);
      if(NB>1)K.label('BOWL '+(st.bi+1)+'/'+NB,30,20,'#f4ecd8','l');if(st.dip>0)K.label('MORE FROM THE POT',160,24,'#ffd27a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.slide||st.dip||st.end){m4hold(a,false);}else{const pred=st.L+st.q*(.16+Math.max(0,st.a-a0())/1.9*.6);m4hold(a,pred<LT-.012&&st.t>.4);}AP.hand=[PV.x+12,PV.y-30];AP.press=a.down;},
    quiet(){loop&&loop.set(0);},stop(){loop&&loop.stop();loop=null;}};};
// ---------------------------------------------------------------- the pan on the stove, shared by the egg and the toss
const m4pan=(K,cx,ry,t,heat)=>{const I=CA_P.iron,y=96;K.pa(cx-40,y+9,80,4,'#000',.3);K.px(cx+36,y-1,46,4,I[2]);K.px(cx+36,y-1,46,1,I[5]);K.px(cx+60,y-2,24,6,'#2a1a10');K.px(cx+60,y-2,24,1,'#4a2e16');
  for(let x=-40;x<=40;x++){const h=Math.round(7*Math.sqrt(Math.max(0,1-(x/40)**2)));K.px(cx+x,y,1,h+2,I[x<-20?3:x>25?1:2]);}K.ell(cx,y,40,ry||8,I[4]);K.ell(cx,y,37,(ry||8)-2,I[1]);K.ell(cx-6,y-1,22,(ry||8)-5,I[2]);if(heat)K.glow(cx,y,30,'255,160,80',.08*heat);};
// ---------------------------------------------------------------- CRACK: the egg sways in your hand; tap to crack it over the butter (and not on the egg already in)
S4.crack=(sp,K)=>{const g=K.g,CX=150,N=sp.n||2,egg=['#8a8070','#c8bca8','#e8dcc4','#f8f0e0','#ffffff'];
  const st={i:0,t:0,ph:'sway',hx:CX,hy:68,fall:null,eggs:[],q:[],end:0,back:0,crk:0,shells:[]};let siz=null;
  const pats=[];for(let i=0;i<N;i++)pats.push({c:CX+(N>1?(i/(N-1)-.5)*34:0),ph:i*2.1});
  const butterOf=(i,t)=>{const p=pats[Math.min(N-1,i)];return {x:p.c+Math.sin(t*.55+p.ph)*9+Math.sin(t*1.4+p.ph)*2.5,y:96+Math.sin(t*1.1+p.ph)*1.2};};const butter=t=>butterOf(st.i,t);
  const sway=t=>CX+Math.sin(t*1.3+.6)*30+Math.sin(t*2.7)*6;
  return {title:sp.t||'Crack them into the butter',how:'Your hand sways over the pan. Tap to crack the egg when it’s right over the butter, and keep clear of the egg already in.',hint:'Tap over the butter. Leave room for the next.',st,
    update(dt,I){st.t+=dt;const b=butter(st.t);if(siz)siz.set(.04+st.eggs.length*.02,3200);
      if(st.ph==='sway'){const nx=sway(st.t);st.vx=(nx-st.hx)/dt;st.hx=nx;if(I.pressed){st.ph='crack';st.crk=0;MS.crunch();A.tone(2400,.03,'square',.03);}}
      else if(st.ph==='crack'){st.crk+=dt;if(st.crk>.1){st.ph='fall';st.fall={x:st.hx,y:st.hy+6,vx:(st.vx||0)*.25,vy:20};st.shells.push({x:st.hx-4,y:st.hy,vx:-30,vy:-60},{x:st.hx+4,y:st.hy,vx:40,vy:-70});}}
      else if(st.ph==='fall'){const f=st.fall;f.vy+=700*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.y>=96){const inPan=Math.abs(f.x-CX)<32;const d=Math.abs(f.x-b.x);let q=inPan?M4.q(d,3.5,7.5,12):.1;
          for(const e of st.eggs)if(Math.abs(e.x-f.x)<15)q=Math.max(.1,q-.35);st.eggs.push({x:f.x,y:96,t:0,on:inPan});st.q.push(q);K.judge(q,f.x,70);
          if(inPan){MS.sizzleHit();if(!siz)siz=MS.loop('highpass',3000,.7);}else{MS.thunk();MS.miss();}K.emit(f.x,95,8,{c:['#fffaf0','#f8f0e0'],v:40,g:200,life:.4});st.fall=null;st.ph='wait';st.back=0;}}
      else if(st.ph==='wait'){st.back+=dt;if(st.back>.8){st.i++;if(st.i>=N){st.ph='end';}else{st.ph='sway';}}}
      if(st.ph==='end'){st.end+=dt;if(st.end>.8){st.done=true;st.score=M4.avg(st.q);}}
      for(const e of st.eggs)e.t+=dt;for(const s of st.shells){s.vy+=500*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;}},
    draw(t){m4pan(K,CX,8,t,1);for(let i=st.eggs.length;i<N;i++){const b=butterOf(i,st.t),cur=i===st.i;K.ell(b.x,b.y,7,2,'#e8c040');K.ell(b.x-1,b.y-1,4,1,'#fff4a0');for(let k=0;k<3;k++)K.px(b.x-5+k*4,b.y-2-((t*14+k*5)%4),1,1,'#fff8d0');if(cur&&Math.floor(t*4)%2)K.px(b.x+5,b.y-3,1,1,'#ffffff');}
      for(const e of st.eggs){const r=Math.min(1,e.t/.35);const rx=4+r*10,ry=1.5+r*3;if(e.on){K.ell(e.x,e.y,rx+1,ry+1,'#e8dcc0');K.ell(e.x,e.y,rx,ry,'#fffaf0');if(e.t>2)for(let a=0;a<6.28;a+=.6)K.px(e.x+Math.cos(a)*(rx+1),e.y+Math.sin(a)*(ry+.5),1,1,'#d8a860');K.ball(e.x-1,e.y-1,3,['#c87010','#e89a20','#f8c840','#ffe080'],2);}
        else{K.ell(e.x,104,8,2,'#fffaf0');K.ball(e.x,103,2,['#c87010','#f8c840']);}}
      if(st.fall){const f=st.fall;K.ell(f.x,f.y-2,3,4,'#fffaf0');K.ball(f.x,f.y,3,['#c87010','#e89a20','#f8c840','#ffe080']);}
      for(const s of st.shells)if(s.y<200){K.ell(s.x,s.y,3,2,egg[3]);K.px(s.x-2,s.y,4,1,egg[1]);}
      if(st.ph==='sway'||st.ph==='crack'){const y=st.hy+(st.ph==='crack'?Math.sin(st.crk/.1*Math.PI)*6:0);K.ball(st.hx,y,7,egg,9);K.pa(st.hx-5,96,10,2,'#000',.18);if(st.ph==='crack')for(let k=0;k<4;k++)K.px(st.hx-4+k*2,y+((k%2)?1:-1),2,1,'#8a8070');
        m4sleeve(K,st.hx+10,y-6,st.hx+44,y-36);m4hand(K,st.hx+6,y-4);}
      else if(st.ph==='wait'&&st.i<N-1){const u=Math.min(1,st.back/.8);const x=CX+70+u*(sway(st.t)-CX-70);K.ball(x,st.hy,7,egg,9);m4sleeve(K,x+10,st.hy-6,x+44,st.hy-36);m4hand(K,x+6,st.hy-4);}},
    hud(){K.label('EGG '+Math.min(N,st.i+1)+'/'+N,30,20,'#f4ecd8','l');K.meter(st.q.length/N,M4.avg(st.q)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.ph==='sway'&&st.t>.8){const b=butter(st.t+.36);const land=st.hx+(st.vx||0)*.25*.26;if(Math.abs(land-b.x)<2.2)m4tap(a);}AP.hand=[st.hx+14,st.hy-24];AP.press=a.down;},
    quiet(){siz&&siz.set(0);},stop(){siz&&siz.stop();siz=null;}};};
// ---------------------------------------------------------------- FLIP: watch the underside turn golden, toss it, then slide the pan under it as it comes down
S4.flip=(sp,K)=>{const g=K.g,item=sp.item||'egg',CK=sp.cook||5,TOSSES=sp.n||1,HOME=150;
  const st={px:HOME,d:0,ph:'cook',fly:null,res:[],t:0,end:0,after:0,k:0,cubes:null,side:0,dT:0,rel:0,fell:0};let siz=null;
  if(item==='hash'){st.cubes=[];for(let i=0;i<26;i++){const u=(Math.random()+Math.random()+Math.random())/3-.5;st.cubes.push({rx:u*56,y:95,x:0,vx:0,vy:0,a:0,va:0,on:1,fly:0,shown:0,lay:Math.random()});}}
  const EG=['#fffaf0','#fbf0d8','#f0d898','#c88a48','#5a3418'],FI=['#f4d4c8','#ecc4a8','#e0a868','#b0642a','#4a2a14'],HA=['#f0dca0','#e8c878','#d8a048','#a8642a','#4a2a14'];
  const color=(d,P)=>d<.45?P[0]:d<.85?P[1]:d<1.2?P[2]:d<1.5?P[3]:P[4];
  const toss=()=>{st.ph='fly';st.dT=st.d;MS.whoosh();A.tone(140,.08,'sine',.12,{slide:80});const dq=st.d>1.5?.1:M4.q(Math.abs(st.d-1),.12,.25,.42);st.dq=dq;K.judge(dq,st.px,52,true);if(dq<.3)MS.miss();st.kick=.15;
    if(st.cubes){for(const c of st.cubes)if(c.on){c.x=st.px+c.rx;c.fly=1;c.vx=(Math.random()-.5)*80+(Math.random()<.5?-1:1)*10;c.vy=-200-Math.random()*60;c.va=(Math.random()-.5)*24;}st.fly={t:0};}
    else st.fly={x:st.px+st.rel,y:94,vx:(Math.random()<.5?-1:1)*(18+Math.random()*22),vy:-232,a:0,va:Math.PI/.9,t:0};};
  const view=(x,y,a,cooked,under)=>{if(sp.count>1&&!view.inner){view.inner=1;const s=Math.cos(a);view(x-12,y+(s<0?1:0),a,cooked);view(x+12,y-(s<0?1:0),a,cooked);view.inner=0;return;}const s=Math.cos(a),ry=Math.max(1,Math.abs(s)*(item==='fish'?4.5:sp.count>1?4:5)),rx=item==='fish'?19:sp.count>1?10:13;const raw=(s>=0)===(st.side===0);
    if(item==='fish'){K.ell(x,y,rx+1,ry+1,'#b89080');if(raw){K.ell(x,y,rx,ry,'#f4c8b8');for(let k=-2;k<=2;k++)K.px(x+k*6,y-ry*.5,1,Math.max(1,ry),'#fff0ea');if(st.side===0&&st.d>.5)K.px(x-rx+1,y+ry-1,rx*2-2,1,color(st.d,FI));}
      else{K.ell(x,y,rx,ry,color(cooked,FI));for(let k=-2;k<=2;k++)K.px(x+k*6,y-ry*.4,2,1,color(cooked+.25,FI));K.px(x-rx*.5,y-ry*.6,rx*.6,1,'#fff4d0');}}
    else{K.ell(x,y,rx+1,ry+1,'#d8c8a8');if(raw){K.ell(x,y,rx,ry,'#fffaf0');if(st.side===0&&st.d>.5)for(let a2=0;a2<6.28;a2+=.45)K.px(x+Math.cos(a2)*(rx+.5),y+Math.sin(a2)*(ry+.5),1,1,color(st.d,EG));K.ball(x-1,y-1,3,['#c87010','#e89a20','#f8c840','#ffe080'],Math.max(1,Math.round(2*Math.abs(s))));}
      else{K.ell(x,y,rx,ry,color(cooked,EG));K.ell(x-1,y-1,4,Math.max(1,ry*.5),'#f8ecc8');K.px(x-3,y-ry*.5,3,1,'#fffaf0');}}};
  return {title:sp.t||'Flip it when it’s golden',how:'Watch the underside go golden, then tap to toss it. While it’s in the air, slide the pan under it ('+(K.fine?'move the mouse, or A/D':'drag')+') to catch it.',hint:'Tap when golden, then catch it with the pan.',st,
    update(dt,I){st.t+=dt;if(!siz)siz=MS.loop('highpass',2600,.7);siz.set(st.ph==='fly'?.015:.05+Math.min(1,st.d)*.04,2400+Math.min(1.6,st.d)*1400);if(st.kick>0)st.kick-=dt;
      if(st.ph==='fly'){const mv=(I.pressed?0:M4.cl(I.dx||0,-30,30))+(I.ax||0)*200*dt;st.px=M4.cl(st.px+mv,108,204);}else st.px+=(HOME-st.px)*Math.min(1,dt*4);
      if(st.ph==='cook'){st.d+=dt/CK;if(st.d>1.3&&Math.random()<dt*7)K.emit(st.px,90,1,{c:['#6a6058'],v:10,g:-40,life:1.4,sz:3,kind:'steam'});if(I.pressed)toss();else if(st.d>1.95)toss();}
      else if(st.ph==='fly'){const f=st.fly;f.t+=dt;
        if(st.cubes){let air=0;for(const c of st.cubes){if(c.fly!==1&&c.fly!==2)continue;c.vy+=520*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.a+=c.va*dt;
            if(c.fly===1&&c.vy>0&&c.y>=95){if(Math.abs(c.x-st.px)<34){c.fly=0;c.y=95;c.rx=M4.cl(c.x-st.px,-30,30);c.shown=st.dT;if(Math.random()<.35)A.tone(500+Math.random()*300,.04,'sine',.03);}else c.fly=2;}
            if(c.fly===2&&c.y>=106){c.fly=3;c.on=0;MS.knock();}if(c.fly===1||c.fly===2)air++;}
          if(!air){const got=st.cubes.filter(c=>c.on).length,cq=got/st.cubes.length;const q2=cq>.92?1:cq>.75?.75:cq>.5?.45:.15;K.judge(q2,st.px,62,true);if(q2<.3)MS.miss();st.res.push(.5*st.dq+.5*q2);MS.sizzleHit();st.k++;st.d=0;st.side=1;st.after=0;st.ph=st.k>=TOSSES?'after':'cook';}}
        else{f.vy+=520*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.a+=f.va*dt;if(f.vy>0&&f.y>=94){const off=Math.abs(f.x-st.px);const cq=off>30?.05:M4.q(off,5,11,19);
            if(off>30){st.fell=1;st.fx=f.x;MS.thunk();MS.miss();}else{st.rel=M4.cl(f.x-st.px,-24,24);MS.sizzleHit();K.emit(f.x,93,8,{c:['#fff6d0','#f0d898'],v:45,g:240,life:.4});}
            K.judge(cq,f.x,62,true);st.res.push(.55*st.dq+.45*cq);st.k++;st.side=1;st.d=0;st.ph='after';st.after=0;}}}
      else if(st.ph==='after'){st.after+=dt;st.d+=dt/CK;if(st.fell&&st.after>.7){st.fell=0;st.rel=0;}if(st.after>1.3)st.ph='end';}
      if(st.ph==='end'){st.end+=dt;if(st.end>.3){st.done=true;st.score=M4.avg(st.res);}}},
    draw(t){const kick=st.kick>0?Math.sin(st.kick/.15*Math.PI)*-3:0;g.save();g.translate(0,Math.round(kick));m4pan(K,st.px,8,t,1);
      if(st.cubes){for(const c of st.cubes){if(c.fly===3||!c.on&&c.fly===0)continue;const x=c.fly?c.x:st.px+c.rx,y=c.fly?c.y:95-Math.round((1-Math.abs(c.rx)/30)*3*c.lay);const col=color(c.shown,HA);K.px(x-2,y-3,4,4,'#3a2410');K.px(x-2,y-3,3,3,col);K.px(x-2,y-3,3,1,HA[0]);K.px(x,y-1,1,1,HA[3]);if(c.on&&!c.fly&&st.d>.6&&c.lay<.5)K.px(x-2,y,3,1,color(st.d,HA));}}
      else if(st.ph==='fly'&&st.fly){g.restore();g.save();const f=st.fly;K.pa(f.x-10,95,20,2,'#000',.2);view(f.x,f.y,f.a,st.dT);}
      else if(st.fell){g.restore();g.save();view(st.fx,106,0,st.dT);}
      else view(st.px+st.rel,94,0,st.dT);
      g.restore();if(st.d>1.3)K.pa(st.px-30,70,60,24,'#3a3430',Math.min(.3,(st.d-1.3)*.6));
      m4sleeve(K,st.px+86,92+kick,st.px+120,70);m4hand(K,st.px+82,94+kick);},
    hud(t){if(st.ph==='cook'){K.label('UNDERSIDE',120,30,'#f4ecd8','r');K.gauge(126,30,90,6,.85/1.6,1.15/1.6,Math.min(1.6,st.d)/1.6,{zone:'#7a5a1c'});if(st.d>1.2&&Math.floor(t*6)%2)K.label('BURNING',160,42,'#e8542a');}
      if(st.ph==='fly'&&Math.floor(t*6)%2)K.label('CATCH IT',160,24,'#ffd27a');if(TOSSES>1)K.label('TOSS '+Math.min(TOSSES,st.k+1)+'/'+TOSSES,30,20,'#f4ecd8','l');K.meter(st.res.length/TOSSES,M4.avg(st.res)||1);},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.ph==='cook'&&st.d>=.99)m4tap(a);
      if(st.ph==='fly'){let tx;if(st.cubes){let s=0,n=0;for(const c of st.cubes)if(c.fly===1){const tl=(-c.vy+Math.sqrt(Math.max(0,c.vy*c.vy+2*520*Math.max(0,95-c.y))))/520;s+=c.x+c.vx*tl;n++;}tx=n?s/n:st.px;}
        else{const f=st.fly;const tl=(-f.vy+Math.sqrt(Math.max(0,f.vy*f.vy+2*520*Math.max(0,94-f.y))))/520;tx=f.x+f.vx*tl;}const d=tx-st.px;a.ax=Math.abs(d)>1.5?Math.sign(d):0;}
      AP.hand=[st.px+86,80];AP.press=a.down;},
    quiet(){siz&&siz.set(0);},stop(){siz&&siz.stop();siz=null;}};};
// ---------------------------------------------------------------- FILLET: hold the knife to the backbone and draw it to the tail, steady and not too fast
S4.fillet=(sp,K)=>{const g=K.g,FX=92,FY=58,XS=FX+30,XE=FX+112,yl=x=>FY+25-Math.sin((x-XS)/(XE-XS)*Math.PI)*4.5,fish=M4S.fish();
  const board=M4.pre('fboard',262,22,k=>{k.plank(1,1,260,14,['#4a2e16','#6c4422','#8e5c30','#b07a44','#c89456','#ddb276','#ecc890','#f6dcae'],23);k.plank(1,15,260,5,CA_P.oak,5);},true);
  const st={kx:XS-6,ky:yl(XS),cut:XS,path:[],q:[],seg:[],t:0,end:0,lift:0,spd:0,wob:Math.random()*6};let loop=null;const S=()=>loop||(loop=MS.loop('bandpass',3600,1.2));
  return {title:sp.t||'Fillet along the backbone',how:'Drag the knife along the dotted line from head to tail. Stay on the line and don’t rush it.'+(K.fine?' (Keys: hold Space to cut, W/S to steer.)':''),hint:'Follow the dotted line. Steady, not fast.',st,
    update(dt,I){st.t+=dt;if(st.end){st.lift+=dt/.9;S().set(0);if(st.lift>=1.2){st.done=true;st.score=M4.avg(st.q);}return;}
      let tx=st.kx,ty=st.ky;if(I.key){if(I.down){tx=st.kx+60*dt;ty=st.ky+(I.ay*38+Math.sin(st.t*2.2+st.wob)*12+Math.sin(st.t*5.3)*5)*dt;}}else if(I.down){tx=I.x;ty=I.y;}
      const dx=tx-st.kx,dy=ty-st.ky,d=Math.hypot(dx,dy),mx=230*dt;if(d>mx){tx=st.kx+dx/d*mx;ty=st.ky+dy/d*mx;}const ox=st.kx;st.kx=tx;st.ky=ty;
      st.spd+=((Math.max(0,st.kx-ox)/Math.max(dt,1e-3))-st.spd)*Math.min(1,dt*8);
      if(I.down&&st.kx>st.cut&&Math.abs(st.ky-yl(st.kx))<14){const fast=st.spd>150;while(st.cut<st.kx&&st.cut<XE){st.cut+=1;const yy=st.ky+(fast?(Math.random()-.5)*3:0);const e=Math.abs(yy-yl(st.cut))+(fast?1.6:0);const q=M4.q(e,1.6,3.2,5.5);st.path.push([st.cut,yy,fast]);st.q.push(q);st.seg.push(q);
          if(st.seg.length>=22){const m=M4.avg(st.seg);K.judge(m>.9?1:m>.7?.75:m>.4?.45:.15,st.cut,st.ky-22,true);if(m<.4)MS.miss();st.seg=[];}}
        S().set(.04+Math.min(.12,st.spd/900),3000+st.spd*6,1.2);}else S().set(0);
      if(st.cut>=XE){st.end=.001;MS.shave();MS.good();}},
    draw(t){g.drawImage(board,30,FY+32);g.drawImage(fish,FX,FY);
      if(!st.end)for(let x=XS;x<=XE;x+=4)if(x>st.cut)K.px(x,yl(x),2,1,'#fff4c0');
      for(const [x,y,f] of st.path){K.px(x,y,1,1,f?'#5a1a14':'#8a2a20');K.px(x,y+1,1,2,f?'#c87060':'#f0a898');}
      if(st.end){const u=Math.min(1,st.lift),e=u<.5?2*u*u:1-2*(1-u)*(1-u);const fl=M4S.fillet();const cx=FX+70+e*64,cy=FY+18-Math.sin(u*Math.PI)*26+e*20,sy=Math.cos(e*Math.PI);
        K.pa(cx-36,FY+40,72,3,'#000',.18*e);g.save();g.translate(Math.round(cx),Math.round(cy));g.rotate(e*.12);g.scale(1,Math.abs(sy)<.08?.08:Math.abs(sy));g.drawImage(fl,sy>=0?0:90,0,90,18,-45,-9,90,18);g.restore();
        K.px(XS,yl(XS),XE-XS,1,'#8a2a20');}
      if(!st.end){const kn=M4S.knife();M4.rot(g,kn,st.kx,st.ky,-1.15,8,44);const [hx,hy]=M4.tr(st.kx,st.ky,-1.15,0,-38);m4sleeve(K,hx+3,hy,hx+34,hy-20);m4hand(K,hx,hy);}},
    hud(){K.meter((st.cut-XS)/(XE-XS),M4.avg(st.q)||1);if(st.spd>150)K.label('TOO FAST',160,24,'#e8542a');},
    auto(dt,AP){const a=m4ai(this,AP,dt);if(st.t<.5){m4move(a,st.kx,st.ky);m4hold(a,false);}else{const nx=Math.min(XE+2,a.x+62*dt);m4move(a,nx,yl(nx)+Math.sin(st.t*3)*.8);m4hold(a,true);}AP.hand=[a.x+8,a.y-46];AP.press=a.down;},
    quiet(){loop&&loop.set(0);},stop(){loop&&loop.stop();loop=null;}};};
// ---------------------------------------------------------------- the recipes that use them
const m4spr=(name,sc)=>K=>{const m=SPR[name];if(!m)return;sc=sc||2;K.sprite(name,160-m.fw*sc/2,84-m.fh*sc/2,{scale:sc});};
const m4ico=name=>K=>K.icon(name,112,36,3);
Object.assign(MG4R,{
  'b_furn:chair':{scene:'workshop',reveal:m4spr('in_rockS',2),steps:[{k:'saw',t:'Cut the legs to length',n:8,seed:5},{k:'plane',t:'Plane the seat smooth',wood:CA_P.oak,seed:3},{k:'hammer',t:'Nail the seat to the frame',n:4,edge:1}]},
  'b_furn:shelf':{scene:'workshop',reveal:m4spr('in_shelf_jars',2),steps:[{k:'saw',t:'Cut the shelf boards',n:9,seed:8,wood:CA_P.oak},{k:'hammer',t:'Fix the brackets',n:4,edge:1,wood:CA_P.oak},{k:'brush',t:'Oil it',col:'#8a4a1c',wood:CA_P.oak}]},
  'b_furn:crates':{scene:'workshop',reveal:m4spr('in_crates',2),steps:[{k:'saw',t:'Cut the slats',n:7,tempo:.56,seed:12},{k:'hammer',t:'Nail the slats on',n:6,seed:4},{k:'brush',t:'Stain the crates',col:'#5a3418',time:16}]},
  'cook:soup':{scene:'kitchen',reveal:m4ico('soup'),steps:[{k:'chop',t:'Chop the turnips',veg:['turnip','turnip','turnip']},{k:'simmer',t:'Simmer the soup',scene:'stove',adds:[{at:2.4,icon:'turnip'},{at:5.6,icon:'turnip'}],bits:['#f2ece4','#f2ece4','#7aa64c','#f2ece4']},{k:'pour',t:'Ladle it into the bowl',vessel:'ladle',col:['#c8a040','#e8c868']}]},
  'cook:chowder':{scene:'kitchen',reveal:m4ico('chowder'),steps:[{k:'chop',t:'Dice the potatoes',veg:['potato','potato']},{k:'pour',t:'Pour in the cream',col:['#f6f0e2','#ffffff'],bowl:'wood',line:.7},{k:'simmer',t:'Simmer it thick',scene:'stove',col:['#efe2c0','#fbf2da'],bits:['#e8d088','#f0c040','#e8d088'],slow:.8,adds:[{at:3,icon:'corn'},{at:6.4,icon:'fish'}]}]},
  'cook:egg_fried':{scene:'stove',reveal:m4ico('egg_fried'),steps:[{k:'crack',t:'Crack them into the butter',n:2},{k:'flip',t:'Flip them over easy',item:'egg',count:2,cook:4.2}]},
  'cook:fish_fried':{scene:'kitchen',reveal:m4ico('fish_fried'),steps:[{k:'fillet',t:'Fillet the fish'},{k:'flip',t:'Fry it golden',item:'fish',cook:5,scene:'stove'}]},
  'cook:hash':{scene:'kitchen',reveal:m4ico('hash'),steps:[{k:'chop',t:'Chop the potatoes and onion',veg:['potato','onion']},{k:'flip',t:'Toss the hash',item:'hash',n:2,cook:3.4,scene:'stove'}]},
  'cook:glowstew':{scene:'kitchen',reveal:m4ico('glowstew'),steps:[{k:'chop',t:'Slice the glowing mushrooms',veg:['shroom','shroom']},{k:'simmer',t:'Simmer it (it hums)',scene:'stove',col:['#2aa08a','#6ae8d0'],glow:1,bits:['#a8f0e0','#c8fff0'],adds:[{at:3,icon:'mushroom'}]},{k:'pour',t:'Ladle it out',vessel:'ladle',col:['#2aa08a','#8af8e0'],glow:1}]}});
