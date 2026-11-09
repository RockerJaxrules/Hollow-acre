/* ================= tools, drawn by the game: the hoe, pickaxe, axe, watering can and rod, held in the hands the character sheets
   draw, at the grip, angle and layer each frame asks for (META.tool, from px/chibi2.js). Because the game draws them they can reach
   the square you aim at, go behind you when they should, pour water where it lands, and look different once upgraded. ================= */
const TOOL_ART={
 axe:{px:5,art:["...KKKK.......", "...KDLK.....KK", "...KDLK...KKeK", "...KDLK.KKmleK", "..KsDLsKmmmleK", "..KsbbsmmmmleK", "..KsDLsmmmmleK", "..KsbbsmmmmleK", "..KsDLsKmmmleK", "...KDLK.KKmleK", "...KDLK...KKeK", "...KDLK.....KK", "...KDLK.......", "...KDMK.......", "...KDLK.......", "...KDLK.......", "...KDMK.......", "...KDLK.......", "...KDLK.......", "...KDMK.......", "...KDLK.......", "...KDLK.......", "...KKKK......."]},   /* judge, Nov 10: the head as the icon's flared wedge (narrow at the eye, a straight bright edge with corners); the rounded blade read as a pan at the strike */
 pick:{px:9,art:["......KKKKKK......","....KKllmmmmKK....","..KKllmmbbmmmmKK..",".KllmmKKbbKKmmmsK.","KllmK..KDLK..KmmsK","KlmK...KDLK...KmsK","KlK....KDLK....KsK",".K.....KDLK.....K.",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KKKK......."]},
 hoe:{px:5,art:["....KK.......","...KDLKKKKKK.","...KDLKmmmllK","...KsbbmmmmlK","...KDLKKKmmeK","...KDLK..KmeK","...KDLK...KeK","...KDLK....K.","...KDMK.....","...KDLK.....","...KDLK.....","...KDMK.....","...KDLK.....","...KDLK.....",
   "...KDMK.....","...KDLK.....","...KDLK.....","...KDMK.....","...KDLK.....","...KDLK.....","...KDLK.....","...KDLK.....","...KDLK.....","...KKKK....."]},
 // the same tools seen from the front, for swings straight up and down: the hoe's blade face-on, the pickaxe's head across, the axe's blade edge-on
 hoe_f:{px:5,art:["..KKKKKKK..", ".KlleeellK.", ".KmmlllmmK.", "..KKKsKKK..", "....KsK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KDLK....", "...KKKK...."]},
 pick_f:{px:4,art:["...KK...", "..KeK...", "..KelK..", "..KlmK..", "..KlmK..", ".KKmbKK.", ".KbsbbK.", "..KDLK..", "..KDLK..", "..KDMK..", "..KDLK..", "..KDLK..", "..KDMK..", "..KDLK..", "..KDLK..", "..KDMK..", "..KDLK..", "..KDLK..", "..KDMK..", "..KDLK..", "..KKKK.."]},   /* judge, Nov 10: seen end-on the head is a thin spike, lit on the left, not a round knob (that read as a mallet) */
 axe_f:{px:4,art:["...KK...", "..KleK..", "..KleK..", ".KmleK..", ".KmleK..", ".KmlbK..", "..KsbK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KDLK..", "..KKKK.."]},
 /* the can end-on (judge r6: tipping the side view toward us read as a gourd): facing down the drum with the grey rose low on its
    front, tipped forward to pour with the rose below it; facing up the rose shows above the far rim, leaning further out to pour */
 can_f:{px:5.5,py:1,tip:[6.5, 9.5],art:["..KKKKKKKK..", ".K........K.", ".K..KllK..K.", ".KKKKmmKKKK.", ".KeelllmmbK.", ".KbbbbbbbbK.", ".KlllllmmbK.", ".KlllKKKmbK.", ".KllKihgKbK.", ".KllKhggKbK.", ".KlllKKKmbK.", ".KbbbbbbbbK.", ".KmmmmmmbbK.", "..KKKKKKKK.."]},
 can_ft:{px:5.5,py:1,tip:[6, 12],art:["..KKKKKKKK..", ".KeeelllmbK.", ".KeelllmmbK.", ".KbbbbbbbbK.", ".KlllllmmbK.", ".KlllllmmbK.", ".KbbbbbbbbK.", "..KmmmmmbK..", "....KmmK....", "...KKKKKK...", "...KihggK...", "...KhggsK...", "....KKKK...."]},
 can_b:{px:5.5,py:2,tip:[10, 1],art:["........KKK.", "....KKK.KihK", "....KlK.KhgK", "..KKKmKKKmK.", ".KeelllmmbK.", ".KbbbbbbbbK.", ".KlllllmmbK.", ".KlllllmmbK.", ".KlllllmmbK.", ".KbbbbbbbbK.", ".KmmmmmmbbK.", "..KKKKKKKK.."]},
 can_bt:{px:5.5,py:4,tip:[11, 1],art:["..........KKK", ".........KihK", "........KKhgK", "....KKK.KmKK.", "..KKKlKKmK...", ".KeelllmbK...", ".KbbbbbbbK...", ".KllllllmbK..", ".KllllllmbK..", ".KbbbbbbbbK..", ".KmmmmmmbbK..", "..KKKKKKKK..."]},
 // the watering can side-on, spout to the right (judge: the hand-drawn can reads like its icon; the 3D one read as a gourd),
 // in the icon's greens with its grey rose on the spout; the hand holds the top of the handle
 can:{px:5,py:1,tip:[16.5,4.5],art:["...KKKKK..........", "..KlmmmbK.........", "..Km...Kb.....KKK.", ".KKKKKKKKK...KihK.", "KleelllmmbK..KhgK.", "KelllllmmbK.KlKKK.", "KllllllmmbKKmK....", "KlllllmmmbbmbK....", "KmllllmmmbbbK.....", "KmmmmmmmbbsK......", ".KbbbbbbbsK.......", "..KKKKKKKK........"]}};
/* metal and wood in hand (judge, Nov 10: the old greys with a white edge read as steel and stayed SIMILAR to the icons);
   g h i: the can's grey rose (the icon's), which no grade recolours; the can's greens are the icon's (METAL.tin) */
const TOOL_PAL={K:[26,16,12],D:[84,52,28],M:[124,82,46],L:[176,126,76],s:[60,64,76],b:[92,98,112],m:[150,156,170],l:[204,210,222],e:[244,248,252],g:[70, 73, 83],h:[134, 138, 147],i:[215, 216, 218]};
// metal by grade: what upgrades look like
const METAL={rust:{s:[54,42,40],b:[86,66,56],m:[120,92,74],l:[150,120,98],e:[176,150,126]},iron:{},
  copper:{s:[88,42,24],b:[138,68,34],m:[194,104,52],l:[230,148,84],e:[252,204,150]},
  steel:{s:[38,54,92],b:[66,96,148],m:[112,150,206],l:[172,204,242],e:[232,246,255]},
  steel2:{s:[40,48,64],b:[68,82,104],m:[112,128,152],l:[166,182,204],e:[232,240,250]},   // NEXT (judge, grades: the cornflower blue read as enamel or ice): a blue-grey, waiting for its own judge round
  gold:{s:[110,72,14],b:[168,118,24],m:[220,170,40],l:[248,214,90],e:[255,244,180]},
  tin:{s:[38,71,50],b:[55,97,62],m:[75,123,75],l:[103,151,93],e:[150,196,128]},
  glass:{s:[8,16,20],b:[14,34,38],m:[24,60,62],l:[46,108,102],e:[178,242,226]}};   // Hollow-glass: black glass with the gem's teal in it and a hard bright glint (judge: mid teal read as verdigris paint, a sidegrade)   // the can icon's greens, the in-hand body a step up to its sage with a lit top (judge: it sank into the plaid)
function toolGrade(kind){const t=typeof TOOL_TIER!=='undefined'&&TOOL_TIER[kind];return t?t[Math.min(t.length,toolLv(kind))-1]:'iron';}
// rotate pixel art cleanly (3x3 supersampled, majority vote) about the grip, and remember the result
const TOOL_CACHE=new Map();
function toolStamp(kind,grade,ang,k,mir){ang=Math.round(ang/3)*3;k=Math.round(k*20)/20;const key=kind+grade+ang+'|'+k+(mir?'m':'');let st=TOOL_CACHE.get(key);if(st)return st;
  const T=TOOL_ART[kind],A=T.art,h=A.length,w=A[0].length,px0=T.px,py0=T.py!==undefined?T.py+.5:h-3.5;const pal=Object.assign({},TOOL_PAL,METAL[grade]||{});
  if(kind.startsWith('can'))pal.K=pal.s.map(v=>Math.round(v*.5));   /* the can's outline a darker version of its own colour (LPC rule; judge: near-black sank it) */
  const th=(ang+90)*Math.PI/180,c=Math.cos(th),s=Math.sin(th),R=Math.ceil(Math.hypot(w,h))+2;const N=2*R+1;
  const cv=document.createElement('canvas');cv.width=N;cv.height=N;const g=cv.getContext('2d');const id=g.createImageData(N,N),D=id.data;
  for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const cnt={};let empty=0;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=dx+(i-1)/3,y=dy+(j-1)/3;let u=x*c+y*s,v=(-x*s+y*c)/k;if(mir)u=-u;const ax=Math.floor(px0+u),ay=Math.floor(py0+v);
      const ch=(ay>=0&&ay<h&&ax>=0&&ax<w)?(A[ay][ax]||'.'):'.';if(ch==='.')empty++;else cnt[ch]=(cnt[ch]||0)+1;}
    if(empty>=5)continue;let best=null,bn=0;for(const ch in cnt)if(cnt[ch]>bn||(cnt[ch]===bn&&ch==='K')){best=ch;bn=cnt[ch];}
    const col=pal[best];const o=((dy+R)*N+(dx+R))*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
  g.putImageData(id,0,0);st={cv,R};TOOL_CACHE.set(key,st);if(TOOL_CACHE.size>600)TOOL_CACHE.delete(TOOL_CACHE.keys().next().value);return st;}
// the rod: cork grip, reel, a shaft that tapers to the tip. Bamboo, ash, then greenheart.
const ROD_COL=[[[214,188,96],[150,124,54]],[[206,164,112],[134,98,62]],[[86,128,70],[44,74,40]],[[60,130,122],[14,36,40]]];   // bamboo, ash, greenheart, Hollow-glass (the gem's teal)
function drawRod(g,gx,gy,ang,k,lvl,fl){const a=ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);const L=Math.round(30*k);const [lt,dk]=ROD_COL[Math.max(0,Math.min(3,(lvl||1)-1))];
  const px=(x,y,c)=>{g.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;g.fillRect(Math.round(x),Math.round(y),1,1);};
  // the butt and cork below the hand
  for(let i=-4;i<=3;i++){const x=gx+dx*i,y=gy+dy*i;px(x,y,i<0?[120,84,48]:[176,136,84]);px(x+(Math.abs(dy)>.7?1:0),y+(Math.abs(dy)>.7?0:1),[60,40,24]);}
  // the shaft
  const ol=[34,24,16],ax=Math.abs(dy)>.7;
  for(let i=4;i<=L;i++){const x=gx+dx*i,y=gy+dy*i;const thin=i>L*.62;if(!thin){px(x+(ax?-1:0),y+(ax?0:-1),ol);px(x+(ax?2:0),y+(ax?0:2),ol);}else px(x+(ax?1:0),y+(ax?0:1),ol);}
  for(let i=4;i<=L;i++){const x=gx+dx*i,y=gy+dy*i;const thin=i>L*.62;px(x,y,lt);if(!thin)px(x+(ax?1:0),y+(ax?0:1),dk);}
  // guides and the reel
  for(const t of [.35,.6,.82]){const i=Math.round(L*t);px(gx+dx*i-dy,gy+dy*i+dx,[200,200,210]);}
  const rx=gx+dx*1-dy*2*(fl||1),ry=gy+dy*1+dx*2;g.fillStyle='#2a2a32';g.fillRect(Math.round(rx)-1,Math.round(ry)-1,3,3);px(rx,ry,[190,190,200]);
  return [gx+dx*L,gy+dy*L];}
// the swing's blur: a pale arc between the wind-up and the swing
function drawSmear(g,gx,gy,a0,a1,k,r){a0*=Math.PI/180;a1*=Math.PI/180;for(let i=2;i<=22;i++){const aa=a0+(a1-a0)*i/22;for(const [rr,c] of [[r,'rgba(250,246,232,.85)'],[r-1,'rgba(214,206,186,.6)']]){g.fillStyle=c;g.fillRect(Math.round(gx+Math.cos(aa)*rr*k),Math.round(gy+Math.sin(aa)*rr*k),1,1);}}}
// one entry point: what's held in this frame, drawn at sheet origin (ox, oy). layer: 'back' or 'front'. Returns where the business end is.
function toolOverlay(g,nm,dir,f,ox,oy,layer,o){const m=SPR[nm];const T=m&&m.tool&&m.tool[dir]&&m.tool[dir][f];if(!T)return null;const [gx0,gy0,ang,k,behind]=T;
  if((layer==='back')!==!!behind)return null;const kind=m.toolKind;const gx=ox+gx0,gy=oy+gy0;const fl=dir==='W'?-1:1;o=o||{};
  if(kind==='rod')return drawRod(g,gx,gy,ang,k,S.rod||1,fl);
  /* owner, Nov 10: facing down and up the can pointed sideways. Facing down it turns so the spout points toward the square in
     front of him (to the left of the can at his right hip) and tips down onto it, like facing left; facing up it is held at
     his shoulder with the spout up and away over it */
  if(kind==='can'&&(dir==='S'||dir==='N')){const nm2=(dir==='S'?'can_f':'can_b')+(ang>25?'t':'');const A=TOOL_ART[nm2];
    const st=toolStamp(nm2,toolGrade('can'),-90,1,false);g.drawImage(st.cv,gx-st.R,gy-st.R);   // drawn as drawn: the views carry their own tip
    return [gx+A.tip[0]-A.px,gy+A.tip[1]-A.py];}
  if(kind==='can'){const mir=dir==='W';const tilt=dir==='W'?-(180-ang):dir==='S'?-(28+ang*.85):dir==='N'?-(65-ang*.4):ang;   /* facing down the spout always aims toward the square in front (judge r5: at rest it was still side-on) */   // the sheet stores the west angle mirrored (180-a)
    const st=toolStamp('can',toolGrade('can'),tilt-90,1,mir);g.drawImage(st.cv,gx-st.R,gy-st.R);
    // the spout's tip, turned with the can
    const CA=TOOL_ART.can,sx0=(mir?-1:1)*(CA.tip[0]-CA.px),sy0=CA.tip[1]-CA.py,r=tilt*Math.PI/180;return [gx+sx0*Math.cos(r)-sy0*Math.sin(r),gy+sx0*Math.sin(r)+sy0*Math.cos(r)];}
  const grade=o.grade||toolGrade(kind);
  if(f===4&&m.tool[dir][3]){const a0=m.tool[dir][3][2];let a1=ang;if(dir==='W'&&a1>a0)a1-=360;if(dir!=='W'&&a1<a0)a1+=360;if(dir==='E'||dir==='W')drawSmear(g,gx,gy,a0,a1,1,19);}
  const front=(dir==='S'||dir==='N')&&TOOL_ART[kind+'_f'];   /* owner: facing down/up the pick hit the stone sideways; the front art keeps its head in the swing, point first */const st=toolStamp(front?kind+'_f':kind,grade,ang,k,dir==='W');g.drawImage(st.cv,gx-st.R,gy-st.R);
  const r=ang*Math.PI/180;return [gx+Math.cos(r)*18*k,gy+Math.sin(r)*18*k];}
// the hit: drawn at the business end on the strike and the frame after (dirt, wood chips, stone chips and a spark)
// what flies off the blade: two-tone chips of 2-3 px (judge: 1 px specks read as dust), thrown back and up from the tip
const HIT_FX={hoe:[[['#7a5634','#4a3220'],-5,-3,3,2],[['#8a6440','#5a3e24'],-3,-6,2,2],[['#7a5634','#4a3220'],3,-5,2,3],[['#6a4a2c','#3e2a18'],6,-2,3,2]],
  axe:[[['#ecd29c','#b08a52'],-4,-5,3,2],[['#d8b878','#9a7444'],3,-7,2,3],[['#f0dcae','#b89660'],6,-2,3,2],[['#c8a468','#8a6a3e'],-6,-1,2,2]],
  pick:[[['#a8a8b0','#5e5e68'],-4,-5,3,2],[['#9a9aa4','#585862'],4,-6,2,3],[['#b8b8c0','#6a6a74'],6,-1,3,2],[['#8a8a94','#4e4e58'],-6,-2,2,2]]};
function hitFx(g,kind,tip,f){const P_=HIT_FX[kind];if(!P_||!tip||(f!==5&&f!==6))return;const k=f===5?1:1.8;
  for(const [[cl,cd],dx,dy,w0,h0] of P_){const w=f===6?Math.max(2,w0-1):w0,h=f===6?Math.max(2,h0-1):h0;const x=Math.round(tip[0]+dx*k),y=Math.round(tip[1]+dy*k+(f===6?2:0));
    g.fillStyle='#140e0a';g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle=cd;g.fillRect(x,y,w,h);g.fillStyle=cl;g.fillRect(x,y,w-1,h-1);}
  // the pick strikes a spark off the stone: warm white, never tinted by what's under it
  if(kind==='pick'&&f===5){const x=Math.round(tip[0]),y=Math.round(tip[1]);g.fillStyle='#2a1e10';g.fillRect(x-3,y-2,7,3);g.fillRect(x-1,y-4,3,7);g.fillStyle='#ffe6a0';g.fillRect(x-2,y-1,5,1);g.fillRect(x,y-3,1,5);g.fillStyle='#ffffff';g.fillRect(x,y-1,1,1);}}
// the player's fists over the handle, drawn after the tool (from the look's own colours: see custom.js)
const FISTS={};
function fistOverlay(g,nm,dir,f,ox,oy){const im=FISTS[nm];const m=SPR[nm];if(!im||!m||!m.clips||!m.clips.thrust)return;const T=m.tool&&m.tool[dir]&&m.tool[dir][f];if(!T||T[4])return;
  const r=m.clips.thrust[dir];g.drawImage(im,f*m.fw,r[0]*m.fh,m.fw,m.fh,ox,oy,m.fw,m.fh);}
// water falling from the spout onto the square in front
function waterStream(g,from,to,t){const [x0,y0]=from;let [x1,y1]=to;   // a stream 2 px wide in two blues (judge: a 1 px dotted line read as wire), a splash where it lands
  /* judge r8: the stream sat on the same pixels every frame (only the splash moved): its far end now shifts a pixel or two each
     frame; the splash is 2x2 drops with a dark lower edge (1 px specks vanished) on a dark wet patch of soil */
  const ph=Math.floor(t*13)%4;x1+=[0,1,0,-1][ph];y1+=[0,1,1,0][ph];
  g.fillStyle='rgba(28,16,8,.32)';g.fillRect(Math.round(x1)-4,Math.round(y1),9,2);g.fillRect(Math.round(x1)-3,Math.round(y1)+2,7,1);
  const n=Math.max(16,Math.ceil(Math.hypot(x1-x0,y1-y0)/1.5));   /* judge: a long stream read as a dotted wire */
  for(let i=0;i<n;i++){const u=((i/n)+t*2.2)%1;const x=x0+(x1-x0)*Math.sqrt(u),y=y0+(y1-y0)*u*u;const hh=Math.max(1,Math.min(3,Math.round(y1)-Math.round(y)));   // the stream stops at the splash: running past it made a '+' that read as a sparkle
    g.fillStyle=i%4===0?'#e6f4ff':'#7ab8e0';g.fillRect(Math.round(x),Math.round(y),2,hh);g.fillStyle='#4a86b8';if(hh>1)g.fillRect(Math.round(x)+1,Math.round(y)+1,1,hh-1);}
  const k=(t*6)%1;g.fillStyle='#a8d4f0';g.fillRect(Math.round(x1)-2,Math.round(y1)+1,5,1);g.fillStyle='#7ab8e0';g.fillRect(Math.round(x1)-1,Math.round(y1),3,1);
  for(const d of [-1,1]){const dx=Math.round(x1+d*(2+k*4))-(d<0?1:0),dy=Math.round(y1-1-Math.sin(k*Math.PI)*3);
    g.fillStyle='#7ab8e0';g.fillRect(dx,dy,2,2);g.fillStyle='#e6f4ff';g.fillRect(dx,dy,1,1);g.fillStyle='#3c6e9c';g.fillRect(dx,dy+1,2,1);}}
// ---- fishing with the rod in your hands: wind up while the power builds, whip it out on the cast, hold it while you wait, and it jerks on a bite
const ROD={prev:'off',castT:9};
function rodFrame(){if(typeof fish==='undefined')return -1;const mg=typeof MG!=='undefined'&&MG.on;if(fish.state==='off'&&!mg)return -1;
  if(fish.state==='power')return 1+Math.min(2,Math.floor((fish.power||0)*3));
  if(mg)return 5+((performance.now()/90|0)%2);
  if(ROD.castT<.36)return 4+Math.min(2,Math.floor(ROD.castT/.12));
  if(fish.state==='bite')return 6+((performance.now()/110|0)%2);return 7;}
{const _u=update;update=function(dt){_u(dt);if(typeof fish==='undefined')return;if(fish.state==='wait'&&ROD.prev==='power')ROD.castT=0;else ROD.castT+=dt;ROD.prev=fish.state;};}
// the line hangs in a soft curve while you wait, and snaps straight when something pulls
function fishLine(g,from,to,taut,t){const [x0,y0]=from,[x1,y1]=to;const n=Math.max(8,Math.ceil(Math.hypot(x1-x0,y1-y0)));const sag=taut?0:Math.min(10,Math.hypot(x1-x0,y1-y0)*.12);
  g.fillStyle=taut?'rgba(250,250,250,.9)':'rgba(236,236,236,.7)';for(let i=0;i<=n;i++){const u=i/n;g.fillRect(Math.round(x0+(x1-x0)*u),Math.round(y0+(y1-y0)*u+Math.sin(u*Math.PI)*sag),1,1);}}

// ---- upgraded tools look upgraded on the toolbar too: the metal (or the can, or the rod's shaft) takes the grade's colours
const ROD_RAMP=lvl=>{const [lt,dk]=ROD_COL[Math.max(0,Math.min(3,(lvl||1)-1))];const mix=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
  return [mix(dk,[0,0,0],.45),dk,mix(dk,lt,.5),lt,mix(lt,[255,255,255],.35)];};
const GRADE_ICON={};
function rgbHsv(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,mx?d/mx:0,mx/255];}
function gradeIcon(kind){const grade=kind==='rod'?'rod'+(S.rod||1):toolGrade(kind);const key=kind+'@'+grade;if(GRADE_ICON[key])return GRADE_ICON[key];
  const sk=SPR['icon32_'+kind]?'icon32_'+kind:'icon_'+kind;const m=SPR[sk],im=m&&IMG[m.src];if(!im||!im.complete&&im.complete!==undefined)return null;
  const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d',{willReadFrequently:true});g.imageSmoothingEnabled=false;g.drawImage(im,0,0,m.fw,m.fh,0,0,32,32);
  const d=g.getImageData(0,0,32,32),D=d.data;
  // which pixels change: metal (grey) for blades and heads, green for the can, the wood of the rod
  const pick=(r,gg,b)=>{const [h,sat,v]=rgbHsv(r,gg,b);if(kind==='can')return h>80&&h<170&&sat>.15&&v>.05;   /* the can's darkest greens too: they stayed green on the copper can (owner: upgrades get their own colours) */if(kind==='rod')return h>15&&h<45&&sat>.3&&v>.2;return sat<.21&&v>.28;};
  const cols=new Map();for(let i=0;i<D.length;i+=4){if(!D[i+3])continue;if(!pick(D[i],D[i+1],D[i+2]))continue;const k=(D[i]<<16)|(D[i+1]<<8)|D[i+2];cols.set(k,.3*D[i]+.59*D[i+1]+.11*D[i+2]);}
  const sorted=[...cols.entries()].sort((a,b)=>a[1]-b[1]);const lo=sorted.length?sorted[0][1]:0,hi=sorted.length?sorted[sorted.length-1][1]:1;
  const M=METAL[grade]||{};const ramp=kind==='rod'?ROD_RAMP(S.rod||1):[M.s||TOOL_PAL.s,M.b||TOOL_PAL.b,M.m||TOOL_PAL.m,M.l||TOOL_PAL.l,M.e||TOOL_PAL.e];
  const map=new Map(sorted.map(([k,L])=>[k,ramp[Math.max(0,Math.min(4,Math.round((L-lo)/Math.max(1,hi-lo)*4)))]]));
  if(grade!=='iron'&&!(kind==='can'&&grade==='tin')&&!(kind==='rod'&&(S.rod||1)===1))for(let i=0;i<D.length;i+=4){if(!D[i+3])continue;const to=map.get((D[i]<<16)|(D[i+1]<<8)|D[i+2]);if(to){D[i]=to[0];D[i+1]=to[1];D[i+2]=to[2];}}
  g.putImageData(d,0,0);return GRADE_ICON[key]=c.toDataURL();}
{const _io=iconOf;iconOf=function(spr){if(spr==='hoe'||spr==='can'||spr==='pick'||spr==='axe'||spr==='rod'){const u=gradeIcon(spr);if(u)return u;}return _io.apply(this,arguments);};}

// ---- when a tool comes back upgraded, say so, and make its slot shine
{const NAME={hoe:'hoe',can:'watering can',pick:'pickaxe',axe:'axe',rod:'rod'};const LOOK={copper:'a copper blade',steel:'a blue steel head',gold:'a gold head'};let last=null;
  setInterval(()=>{if(S.mode!=='play')return;const now={hoe:toolGrade('hoe'),can:toolGrade('can'),pick:toolGrade('pick'),axe:toolGrade('axe'),rod:'r'+(S.rod||1)};
    if(last)for(const k in now)if(now[k]!==last[k]){const i=typeof slotOf==='function'?slotOf(k):-1;const b=i>=0&&$('hotbar')&&$('hotbar').children[i];if(b){b.classList.remove('hint');void b.offsetWidth;b.classList.add('hint');}
      toast(k==='rod'?`Your new rod is in your toolbar.`:k==='can'?'Your watering can is copper now, and holds twice as much.':`Your ${NAME[k]} has ${LOOK[now[k]]||'a new head'} now.`,2.2);}
    last=now;},700);}
