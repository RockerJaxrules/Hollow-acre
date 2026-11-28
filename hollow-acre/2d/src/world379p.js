/* ================= #379p W6, door scares, stage A (story plan 6.3: "from chapter 2, at most once a week. Three knocks at night. Look
   through the window: a full close-up of the Hollow's face pressed to the glass, embers in the carved eyes, needle teeth, the straw at
   its collar moving with its breath. Open the door: nobody. Wet prints drawn in the world, leading in past your feet to the bed").
   At night in the cabin, from Chapter Two on, once a week at most: three knocks. While the knocking hangs there you can look through
   the window by the door, or open the door, or do nothing. The window shows it: the Hollow's own carved head (never a person, never
   anything child-shaped) pressed to the glass, embers moving in its eye holes, needle teeth in the carved mouth, straw at its collar,
   its breath fogging the glass. The door opens on nobody; on the boards, wet prints come in past your feet and go to the bed, and they
   are there until morning. Fear through the Fear bar: +12 for the face ('door'), +4 more for the door after it, +12 for the door alone.
   It must be fake often enough that you stop believing it (plan 6.3); later stages build on it. ================= */
const W79P={};
// the face at the glass, drawn by hand in code: a carved head gone soft and dark with rot, the cuts lit from inside by embers
function w79pFace(){return sgtC('w79p_face',132,100,(P)=>{
  const F=['#2a1608','#502c10','#784216','#a05a22','#c47634'],G=['#0a0c10','#12161c','#1a2028'],E=['#7a2008','#c84a10','#ff9030','#ffd070'];
  for(let y=0;y<100;y++)for(let x=0;x<132;x++)P(x,y,1,1,G[(x+y*3)%17===0?2:(y<50?0:1)]);   /* the night outside the glass */
  // the head, pressed close: a squashed dome filling the pane, lit faintly from its own cuts, darkest at the rim
  const cx=66,cy=54,rx=44,ry=40;for(let y=cy-ry;y<cy+ry;y++)for(let x=cx-rx;x<cx+rx;x++){const e=((x-cx)/rx)**2+((y-cy)/ry)**2;if(e>1)continue;
    const rib=Math.abs(Math.sin((x-cx)/rx*Math.PI*1.6))<.12;let k=e>.86?0:e>.6?1:2;if(!rib&&e<.45&&y>cy-10)k=3;if(rib&&k>0)k--;P(x,y,1,1,F[k]);}
  for(const [x,y,l] of [[40,30,9],[86,34,7],[58,76,6],[92,70,5]])for(let i=0;i<l;i++)P(x+i,y+(i%3===0?1:0),1,1,F[0]);   /* rot, as cracks that follow the ribs */
  // the eye holes: ragged triangles, an ember bed inside each, the light spilling on the cut rim
  const eye=(x0,y0,w,h,flip)=>{for(let j=0;j<h;j++){const half=Math.round((w/2)*(1-j/h));for(let i=-half;i<=half;i++){const x=x0+i+(flip?Math.round(j*.2):-Math.round(j*.2)),y=y0+j;
      P(x,y,1,1,j>h*.55?E[1]:j>h*.25?E[2]:E[0]);if(Math.abs(i)===half)P(x,y,1,1,E[0]);}}P(x0-1,y0+Math.round(h*.4),3,2,E[3]);};
  eye(45,34,24,18,false);eye(87,34,24,18,true);
  // the carved mouth: a jagged slot, ember-dark inside, a row of needle teeth top and bottom, thin and pale and too many
  for(let x=40;x<94;x++){const yt=64+Math.round(Math.sin((x-40)*.35)*2),yb=74+Math.round(Math.sin((x-40)*.3+1)*2);for(let y=yt;y<yb;y++)P(x,y,1,1,y<yt+2?E[0]:'#1e0804');}
  for(let x=41;x<93;x+=3){const yt=64+Math.round(Math.sin((x-40)*.35)*2),yb=74+Math.round(Math.sin((x-40)*.3+1)*2),L=4+((x*7)%3);
    for(let i=0;i<L;i++)P(x,yt+i,1,1,i===0?'#c8bca0':'#e8dcc0');for(let i=0;i<L-1;i++)P(x+1,yb-1-i,1,1,i===0?'#c8bca0':'#e8dcc0');}
  // straw at its collar, standing out over the sill in clumps
  for(let i=0;i<34;i++){const x=20+i*2.7+((i*5)%3),h=11+((i*7)%9),lean=((i%5)-2)*.35;for(let k=0;k<h;k++){const X=Math.round(x+k*lean);P(X,99-k,1,1,k>h-3?'#e8c878':k%4===1?'#8a6a28':'#c09a44');if(k<h-4&&i%3===0)P(X+1,99-k,1,1,'#a07c34');}}
  // the glass: the fog of its breath round the mouth, and one cold streak of reflected light
  for(let y=58;y<84;y++)for(let x=34;x<100;x++){const e=((x-67)/34)**2+((y-71)/14)**2;if(e<1&&((x+y)%2===0||e<.5))P(x,y,1,1,`rgba(190,200,210,${(.16*(1-e)).toFixed(3)})`);}
  for(let i=0;i<40;i++)P(14+i,6+Math.round(i*.9),1,1,'rgba(200,210,230,.18)');
  // the window frame and its cross, in front of everything
  const W=['#2a1a10','#4a301c','#6a4628'];P(0,0,132,5,W[1]);P(0,95,132,5,W[1]);P(0,0,5,100,W[1]);P(127,0,5,100,W[1]);P(64,0,4,100,W[1]);P(0,48,132,4,W[1]);
  for(const [x,y,w,h] of [[0,0,132,1],[0,48,132,1],[0,0,1,100],[64,0,1,100]])P(x,y,w,h,W[2]);for(const [x,y,w,h] of [[0,4,132,1],[0,51,132,1],[4,0,1,100],[67,0,1,100]])P(x,y,w,h,W[0]);});}
// the wet prints: long and narrow, three claw-marks where the toes should be, dark and wet with a lit rim (nobody's foot)
function w79pPrintSpr(){if(SPR.w79p_print)return;const c=document.createElement('canvas');c.width=10;c.height=18;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  for(let y=4;y<17;y++){const w=y<8?4:y<13?5:3,x=5-Math.ceil(w/2);P(x,y,w,1,'rgba(14,18,24,.72)');P(x,y,1,1,'rgba(90,110,130,.5)');}
  for(const [x,l] of [[2,4],[5,5],[8,4]]){for(let i=0;i<l;i++)P(x-(x<5?Math.floor(i/2):x>5?-Math.floor(i/2):0),4-i,1,1,'rgba(14,18,24,.72)');}
  const src='w79p:print';IMG[src]=c;SPR.w79p_print={src,fw:10,fh:18,ax:5,ay:16,foot:[0,0,0,0]};}
W79P.prints=[];
function w79pPrints(){w79pPrintSpr();const R=ROOMS.cabin;if(!R)return;const bed=OBJ.find(o=>o.room==='cabin'&&!o.hide&&/^in_bed/.test(o.spr));
  const a={x:R.ox+R.door,z:R.oz+R.d-.5},b=bed?{x:bed.x,z:bed.z+.35}:{x:R.ox+1.3,z:R.oz+2.9},n=8;
  for(let i=0;i<n;i++){const u=(i+.5)/n,s=i%2?.14:-.14,dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz)||1;W79P.prints.push(obj('w79p_print',a.x+dx*u-dz/L*s,a.z+dz*u+dx/L*s,{kind:'flat',noCol:true,room:'cabin',flip:!!(i%2)}));}
  W79P.pday=S.day;}
// the knocking: night, the cabin, Chapter Two on, no more than once a week
function w79pStart(){const R=ROOMS.cabin;W79P.on={t:0,looked:false};S.w79p=S.w79p||{};S.w79p.a=S.day;
  for(const dl of [0,450,900])setTimeout(()=>{try{SFX.thud&&SFX.thud(0,.55);if(typeof cam!=='undefined')cam.shake=Math.max(cam.shake||0,.08);}catch(e){}},dl);
  setTimeout(()=>toast('Three knocks at the door.',3,true),1100);}
setInterval(()=>{try{const R=ROOMS.cabin;if(!R)return;
    if(W79P.on){W79P.on.t+=1;if(W79P.on.t>50||S.room!=='cabin')W79P.on=null;return;}
    if(W79P.prints.length&&S.hour>=6&&S.hour<20&&S.day!==W79P.pday){for(const o of W79P.prints)o.hide=true;W79P.prints=[];}
    if(S.room!=='cabin'||S.mode!=='play'||S.paused||(typeof SCENE!=='undefined'&&SCENE))return;const night=S.hour>=21||S.hour<4;const ch=typeof sagaChapter==='function'?sagaChapter():1;
    S.w79p=S.w79p||{};if(!night||ch<2||(S.day-(S.w79p.a==null?-99:S.w79p.a))<7){W79P.wait=0;return;}
    W79P.wait=(W79P.wait||0)+1;if(W79P.wait>=25&&rand()<.05){W79P.wait=0;w79pStart();}}catch(e){}},1000);
// what you can do while it knocks
interact.push({get x(){return ROOMS.cabin?ROOMS.cabin.ox+Math.max(.8,ROOMS.cabin.door-1.6):0;},get z(){return ROOMS.cabin?ROOMS.cabin.oz+ROOMS.cabin.d-.45:0;},r:1,
  on:()=>!!W79P.on&&S.room==='cabin'&&!W79P.on.looked,label:()=>'Look through the window',ok:()=>true,act(){const D=W79P.on;D.looked=true;w79Fear(12,'door');
    sgtOpen({x:P.x,z:P.z},w79pFace(),'It is pressed to the glass, so close its breath fogs it. The embers in its eyes move, and find you.',{});}});
interact.push({get x(){return ROOMS.cabin?ROOMS.cabin.ox+ROOMS.cabin.door:0;},get z(){return ROOMS.cabin?ROOMS.cabin.oz+ROOMS.cabin.d-.45:0;},r:.95,
  on:()=>!!W79P.on&&S.room==='cabin',label:()=>'Open the door',ok:()=>true,act(){const D=W79P.on;W79P.on=null;SFX.thud&&SFX.thud(0,.3);w79Fear(D&&D.looked?4:12,'door');w79pPrints();
    toast('Nobody. The yard is empty to the fence. On the boards, wet prints come in past your feet and go across the room to the bed.',5.4,true);}});

/* ---------------------------------------------------------------- stage B (plan 6.3: "from chapter 6: the knock comes while you sleep and
   wakes you. The window shows nothing. Open the door: nothing. Turn round: it is in the mirror behind you, for half a second").
   From the story's sixth chapter (the last part of Chapter Two on today's three), at most once a week (one week's knock is A or B),
   alone (not in a shared game): you go to bed and three knocks wake you at one in the morning. The window shows the yard, empty; the
   door opens on nothing. Then, behind you, the mirror: for half a second it is in the room with you, standing at your back. Then it
   is only you, and the room. Fear +15 through the Fear bar ('door'). */
function w79pMirrorArt(){return sgtC('w79p_mirror',96,124,(P)=>{
  const Gd=['#3a2a0c','#6a4c18','#9a7428','#c8a040','#e8c868'],R=['#06070a','#0c0e14','#141822','#1e2430'];
  for(let y=0;y<124;y++)for(let x=0;x<96;x++){const e=((x-48)/44)**2+((y-62)/58)**2;if(e>1)continue;P(x,y,1,1,e>.9?Gd[(x+y)%3===0?3:2]:e>.84?Gd[1]:R[y<50?1:y<90?2:1]);}   /* the oval glass in its gilt frame */
  for(let y=6;y<118;y++)for(let x=6;x<90;x++){const e=((x-48)/44)**2+((y-62)/58)**2;if(e>.84||e<.8)continue;if(x<48&&y<62)P(x,y,1,1,Gd[4]);}   /* the lit rim, upper left */
  // the room behind you in the glass: the dark bed, the window's grey square
  P(14,64,26,14,R[3]);P(14,64,26,2,'#2c3442');P(60,34,16,14,'#28303c');P(67,34,1,14,R[1]);P(60,40,16,1,R[1]);
  // it: standing at your back, much taller than you, the carved head bent under the ceiling, the embers in its eyes, straw at the collar
  for(let y=22;y<118;y++){const w=y<44?0:Math.round(9+Math.min(9,(y-44)*.2));for(let x=48-w;x<=48+w;x++)if(w)P(x,y,1,1,(x+y*2)%9===0?'#0a0b0e':'#030304');}
  for(let y=14;y<44;y++)for(let x=34;x<62;x++){const e=((x-48)/14)**2+((y-29)/15)**2;if(e<1)P(x,y,1,1,e>.8?'#1a0c06':e>.5?'#3a1e0c':'#5a2e12');}
  for(const ex of [41,53]){P(ex,25,4,3,'#c84a10');P(ex+1,25,2,1,'#ffd070');}
  for(let x=39;x<58;x+=2){P(x,35,1,3,'#d8ccb0');}P(39,34,19,1,'#1e0804');
  for(let i=0;i<14;i++){const x=36+i*2,h=5+(i*7)%5;for(let k=0;k<h;k++)P(x+Math.round(k*((i%3)-1)*.3),44+k,1,1,k%3?'#9a7a34':'#c8a050');}
  // you, small in the front of the glass, from behind: dark hair, the shoulders of your coat
  for(let y=78;y<118;y++){const w=y<88?6:Math.round(8+(y-88)*.35);for(let x=48-w;x<=48+w;x++)P(x,y,1,1,y<88?'#2a1c14':'#3a2a22');}});}
function w79pBOk(){try{if(typeof mpOn==='function'&&mpOn())return false;const ch=typeof wk79Ch==='function'?wk79Ch():1;S.w79p=S.w79p||{};
  return ch>=6&&S.room==='cabin'&&(S.day-(S.w79p.a==null?-99:S.w79p.a))>=7&&rand()<.5;}catch(e){return false;}}
function w79pMirrorFlash(){const v=document.getElementById('view');if(!v)return;const c=document.createElement('canvas');const im=w79pMirrorArt();c.width=VW;c.height=VH;
  c.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges';v.insertAdjacentElement('afterend',c);
  const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#000';g.fillRect(0,0,VW,VH);const k=Math.max(1,Math.floor(Math.min(VW*.7/im.width,VH*.82/im.height)));
  g.drawImage(im,Math.round(VW/2-im.width*k/2),Math.round(VH/2-im.height*k/2),im.width*k,im.height*k);SFX.stinger&&SFX.stinger();w79Fear(15,'door');
  setTimeout(()=>{c.remove();toast('When you look again there is only you in the glass, and the room behind you.',4,true);},520);}
function w79pB(){S.w79p.a=S.day;S.mode='trans';fade(1);setTimeout(()=>{const R=ROOMS.cabin,bed=OBJ.find(o=>o.room==='cabin'&&!o.hide&&/^in_bed/.test(o.spr));
    S.hour=Math.max(S.hour,25);   /* one in the morning (at two you would fall asleep where you stand) */if(bed){P.x=bed.x+.9;P.z=bed.z+.5;}P.dir='S';S.mode='play';fade(0);W79P.b={t:0,done:false};
    for(const dl of [200,650,1100])setTimeout(()=>{try{SFX.thud&&SFX.thud(0,.6);if(typeof cam!=='undefined')cam.shake=Math.max(cam.shake||0,.1);}catch(e){}},dl);
    setTimeout(()=>toast('Three knocks wake you. It is one in the morning.',3.4,true),1300);},700);}
{const _sl=sleep;sleep=function(){try{if(S.mode==='play'&&!W79P.b&&w79pBOk()){w79pB();return;}}catch(e){}return _sl.apply(this,arguments);};}
// awake: the window, the door, and then the mirror (after the door, or if you do nothing for a while)
setInterval(()=>{try{const b=W79P.b;if(!b)return;if(S.room!=='cabin'){W79P.b=null;return;}b.t+=1;if(!b.done&&b.t>=25){b.done=true;setTimeout(()=>{w79pMirrorFlash();W79P.b=null;},400);}}catch(e){}},1000);
interact.push({get x(){return ROOMS.cabin?ROOMS.cabin.ox+Math.max(.8,ROOMS.cabin.door-1.6):0;},get z(){return ROOMS.cabin?ROOMS.cabin.oz+ROOMS.cabin.d-.45:0;},r:1,
  on:()=>!!W79P.b&&!W79P.b.done&&S.room==='cabin'&&!W79P.b.looked,label:()=>'Look through the window',ok:()=>true,act(){W79P.b.looked=true;w79Fear(3,'look');toast('Only the yard, white with frost, and the dark line of the corn. Nothing is there.',3.6);}});
interact.push({get x(){return ROOMS.cabin?ROOMS.cabin.ox+ROOMS.cabin.door:0;},get z(){return ROOMS.cabin?ROOMS.cabin.oz+ROOMS.cabin.d-.45:0;},r:.95,
  on:()=>!!W79P.b&&!W79P.b.done&&S.room==='cabin',label:()=>'Open the door',ok:()=>true,act(){const b=W79P.b;b.done=true;SFX.thud&&SFX.thud(0,.3);
    toast('Nothing. Nobody. The cold comes in round your feet. You shut the door and turn round.',3.2,true);setTimeout(()=>{w79pMirrorFlash();W79P.b=null;},2600);}});
