/* ================= t365: the lights redrawn after a blind critique (tin 6, Walt's 5.5, hood 4.5, flashlight 3.5), then again for
   our camera, which looks down at the ground at about 60 degrees: a torch pointed at us or away from us still shows its barrel.
   - Dunn's flashlight from the front: your fist on top, the short barrel running down out of it toward us (two knurled rings),
     the chrome head and its lens at the lower end, the brightest pixels on the whole torch; the beam fans down the screen from
     that lens. From behind: the tail cap under your fist, the barrel running up the screen past your hip (two rings), the bezel
     at its tip lit by its own beam, and the beam starting there. Only the lens glows: no ball of light round your hand.
   - Walt's lantern is the hurricane lantern of the heart scene and the icon: a wire bail standing clear over a narrow chimney cap,
     the vent, a globe of cool amber glass with only the flame hot in it, held between two dark brass tubes (the frame is two
     value steps under the glass, so the globe reads as glass in a frame and not one amber bell), the brass base cut W. COYLE.
   - The hood: the tin lantern stays its own tall cylinder inside it. From behind it's a closed tin shell over the glass, the
     bail and cap above it, a warm line of light leaking round its edge, and the ground behind you darker; from the side a
     straight tin back with a lip at top and foot; from the front its warm inside either side of the glass. The glass of the
     hooded lantern is a cooler amber, only the flame hot (it read as an orange fruit).
   - The icons: the battery is a battery (a cylinder, the terminal nub, a band, a plus); the hood is a hood round a lantern. ====== */
// ---------------------------------------------------------------- the flashlight, front and back
// (knurling is two ring lines across the barrel: a pixel checker reads as dither)
{const _fc=liFlashCanvas;liFlashCanvas=function(dir,lit){if(dir!=='S'&&dir!=='N')return _fc(dir,lit);const sk=liSkin();const key='365d'+dir+(lit?'L':'D')+sk[2];if(LI_FC[key])return LI_FC[key];
  const pal=LI_FPAL[lit?'lit':'dark'];
  const R=dir==='S'?
    // the fist on top, the barrel running down out of it toward us, two rings, the chrome head flaring, the lens ellipse at the bottom
    ['.KKKKK.','K33321K','K22221K','K11110K','.KKKKK.','.kcHbk.','.kHBbk.','.kcHbk.','kcCCCck','kCLWLck','.kcLck.','..kkk..']:
    // the bezel at the tip (its rim lit by the beam leaving it), the barrel angled up the screen and out past your hip (so the beam
    // leaves it clear of your head), two rings, your fist round it, the tail cap nearest us
    [lit?'.....kLWLk.':'...........','....kcCCCk.','.....kcHbk.','.....kHbk..','....kcHk...','....kHbk...','...kcHk....','...kHbk....','..KKKKK....','.K33332K...','.K22221K...','.K11100K...','..KKKKK....','..kcHk.....','...kk......'];
  const W=R[0].length,H=R.length;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const map={k:'#0c0c10',K:'#1a0a0a',C:pal.C,c:pal.c,L:pal.L,W:lit?pal.W:pal.L,H:pal.H,B:pal.B,b:pal.b,'0':sk[0],'1':sk[1],'2':sk[2],'3':sk[3]};
  R.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.')continue;g.fillStyle=map[ch];g.fillRect(i,j,1,1);}});
  return LI_FC[key]=dir==='S'?{c,ax:3,ay:2,lx:3,ly:9.5}:{c,ax:4,ay:10,lx:7,ly:.5};};}
// from the side its knurling is a ring too (its pixels alternated)
LI_FLASH.E.rows=['.....s...kkk','kkkkkkkkkcLk','kHHHHHcHkCWk','kbbbbbHbkcWk','kkkkkkkkkcLk','.........kkk'];
// the beam: bright from the lens itself, so it has a source you can see; facing away it leaves the bezel at the torch's tip, and
// isn't drawn over your head and back (never lighting your own back as a pale column). A little light comes back off the ground
// at your feet, low and flat, so you can always see yourself; nothing round the hand
LI_BR.splice(0,LI_BR.length,[0,.62],[.06,.72],[.22,.86],[.4,1],[.62,.86],[.8,.5],[.92,.18],[1,0]);for(const k of Object.keys(LI_BT))delete LI_BT[k];
liBeamDraw=function(g,ox,oy,fx,fz,a){if(!(a>0))return;let me=false;try{const lp=liCur()==='flash'?lanternPos():null;me=!!lp&&Math.abs(lp.x-ox)<.6&&Math.abs(lp.y-oy)<.6;}catch(e){}   // (a friend's beam is drawn by the same call)
  let m=Math.hypot(fx,fz)||1;fx/=m;fz/=m;const away=me&&P.dir==='N';if(away){fx+=.04;m=Math.hypot(fx,fz);fx/=m;fz/=m;}
  const ang=Math.atan2(fz*.82,fx),sl=Math.hypot(fx,fz*.82);const T=liBeamTex(11.8*PPM*(.82+.18*sl));
  g.save();if(away){const X=sx(P.x),Y=sz(P.z);g.beginPath();g.rect(0,0,g.canvas.width,g.canvas.height);g.ellipse(X,Y-24,10.5,15,0,0,Math.PI*2);g.clip('evenodd');}
  g.translate(ox,oy);g.rotate(ang);g.globalAlpha=Math.min(1,a);g.drawImage(T.c,0,-T.cy);g.restore();
  if(LI_BFX.f!==FRAME_NO){LI_BFX.f=FRAME_NO;LI_BFX.list.length=0;}const prev=LI_BFX.list.find(b=>b.ox===ox&&b.oy===oy);
  if(prev)prev.a=Math.max(prev.a,a);else if(LI_BFX.list.length<8)LI_BFX.list.push({ox,oy,ang,T,a,away,X:sx(P.x),Y:sz(P.z)});
  nightPool(g,ox+fx*6.2*PPM,oy+fz*6.2*PPM*.82,2.1*PPM,.24*a,LI_FCOL,.7);   // the hot spot where it lands
  // the little that comes back off the lit ground: enough to see yourself (and the torch in your hand) by, round your body, not your hand
  try{if(me)nightPool(g,sx(P.x),sz(P.z)-13,1.8*PPM,.6*a,LI_FCOL,1.15);else nightPool(g,ox,oy+8,1.2*PPM,.2*a,LI_FCOL,.45);}catch(e){}};
// the beam laid over the ground in its own cool white, brightest at the lens: the light map only multiplies what's under it, so on
// grass the beam came out mint green and on dirt cream. Over the lit frame, each beam drawn this frame gives what it lights its own
// cool colour (keeping the ground's brightness), a little of its white, and a point of light at the lens
const LI_BFX={f:-1,list:[]};
{const _ma=nightMoonAdd;nightMoonAdd=function(DK){try{if(LI_BFX.f===FRAME_NO&&DK>0)for(const b of LI_BFX.list){if(!(b.a>0))continue;const k=Math.min(1,b.a*DK);ctx2.save();
      if(b.away){ctx2.beginPath();ctx2.rect(0,0,VW,VH);ctx2.ellipse(b.X,b.Y-24,10.5,15,0,0,Math.PI*2);ctx2.clip('evenodd');}
      ctx2.translate(b.ox,b.oy);ctx2.rotate(b.ang);ctx2.globalCompositeOperation='color';ctx2.globalAlpha=Math.min(1,.95*k);ctx2.drawImage(b.T.c,0,-b.T.cy);
      ctx2.globalCompositeOperation='screen';ctx2.globalAlpha=.16*k;ctx2.drawImage(b.T.c,0,-b.T.cy);ctx2.restore();
      ctx2.save();ctx2.globalCompositeOperation='screen';const gr=ctx2.createRadialGradient(b.ox,b.oy,0,b.ox,b.oy,5);gr.addColorStop(0,`rgba(236,242,255,${(.55*k).toFixed(3)})`);gr.addColorStop(1,'rgba(236,242,255,0)');
      ctx2.fillStyle=gr;ctx2.fillRect(b.ox-5,b.oy-5,10,10);ctx2.restore();}}catch(e){}return _ma.apply(this,arguments);};}
// your flashlight's light: the beam (with its shadows at night) and a point of light at the lens, not a ball round your hand
{const _pl=liPlayerLight;liPlayerLight=function(t,L,DK){if(liCur()!=='flash')return _pl.apply(this,arguments);const on=lanternOn()?1:0;const sput=sputT>0?(Math.random()<.5?.15:.6):1;
  const low=liS().batt<12;const fuelK=low?(.6+.4*Math.random())*(.55+.45*liS().batt/12):1;const k=L*sput*fuelK*(on?1:.12-.09*DK);const lp=lanternPos();const kk=on?k:0;
  if(DK>0)nightLantern(lp,kk,0,DK,{beam:1});if(DK<1)liBeamDraw(lctx,lp.x,lp.y,P.fx,P.fz,.9*kk*(1-DK));glowAt(lp.x,lp.y,3.2,[236,242,255],.9*kk);};}
// ---------------------------------------------------------------- Walt's lantern: the hurricane lantern of the heart scene and the icon
// the same lantern as its icon: the bail standing clear, a flat cap on its band, a round globe of pale glass (the brightest part at
// 1x, only the flame in it hot: a tall drop over the wick, as on the icon), the brass base with W. COYLE cut in it. No cage of tubes, no pointed cap
LI_WALT.S=['..kkkkk..','.k.....k.','.k.kkk.k.','.kkBHBkk.','kbBBHBBbk','.kGGgghk.','kGGgfghhk','kGggWghhk','kGggFghhk','.kGgehhk.','kbBHHBBbk','kbnmnmnbk','kbBBBBBbk','.kkkkkkk.'];
LI_WALT.N=LI_WALT.S.slice(0,11).concat(['kbBBBBBbk','kbBBBBBbk','.kkkkkkk.']);
LI_WALT.E=['....k....','....k....','...kkk...','..kBHBk..'].concat(LI_WALT.S.slice(4,10),['kbBHHBBbk','kbBBBBBbk','kbBBBBBbk','.kkkkkkk.']);LI_WALT.W=LI_WALT.E;
// the brass taken dark (cap, wires, tubes, base) and the glass two value steps over it, a cool amber; only the flame is hot
LI_PAL.walt={lit:{k:'#1e1008',b:'#4a2c10',B:'#6a4620',H:'#9a7034',G:'#eee0c0',g:'#cfbc94',h:'#988462',f:'#f09030',F:'#ffd068',W:'#fff4d8',e:'#3a2414',m:'#24140a',n:'#7e5a2a'},
             dark:{k:'#1e1008',b:'#40260e',B:'#5e3e1c',H:'#86622e',G:'#5e646e',g:'#3e434c',h:'#2c3038',f:'#3e434c',F:'#3e434c',W:'#3e434c',e:'#22201e',m:'#24140a',n:'#6e4e24'}};
// ---------------------------------------------------------------- the hood
// the tin lantern inside it keeps its own tall shape; its glass a cooler amber with only the flame hot
const LI_TINH={rows:{5:'kGgfghk',6:'kGfWfhk',7:'kGgFghk',8:'kGgeghk'},
  lit:Object.assign({},LANTERN_PAL.lit,{G:'#e2c896',g:'#bc9a64',h:'#866a44',e:'#7a4418'}),dark:Object.assign({},LANTERN_PAL.dark,{G:'#5a5e66',g:'#3c4048',h:'#2e3036'})};
const LI_HW={lit:'#a88a64',top:'#c8a676',spill:'#f0b060'};   /* the inside: tin warmed by the flame, not orange */
function liHood365(g,W,H,dir,y0,y1,lit,L){const P=(x,y,c)=>{if(x<0||y<0||x>=W||y>=H)return;g.fillStyle=LI_HPAL[c]||c;g.fillRect(L?x:W-1-x,y,1,1);};
  if(dir==='E'||dir==='W'){// (drawn for facing E: the back on the left; W is the mirror) a straight tin back the height of the lantern, a lip at
    // its top and a foot at its bottom turning toward the flame
    for(let y=y0-2;y<=y1+2;y++){P(0,y,'k');P(1,y,y<y0?'s':y<y1?'D':'d');}
    P(0,y0-3,'k');P(1,y0-3,'k');P(2,y0-3,'k');P(1,y1+3,'k');P(2,y1+3,'k');}
  else if(dir==='N'){// a closed tin shell over the glass: rounded corners, the dull back lit from the left, a rolled rim along its top,
    // and the flame's light leaking round its edge as a warm line (dark when the lantern is out)
    const xa=2,xb=W-3,ya=y0-1,yb=y1+1,E=lit?LI_HW.spill:'k';   /* (as wide as the lantern, so it stays the lantern's tall shape) */
    for(let y=ya;y<=yb;y++)for(let x=xa;x<=xb;x++){if((x===xa||x===xb)&&(y===ya||y===yb))continue;const edge=x===xa||x===xb||y===ya||y===yb;
      const u=(x-xa)/(xb-xa);P(x,y,edge?E:y===ya+1?(u<.6?'R':'D'):u<.3?'s':u<.65?'D':'d');}}
  else{// from the front: its warm inside either side of the glass, its edge outside that, its top over the cap's shoulders
    for(let y=y0-2;y<=y1+1;y++){P(0,y,'k');P(1,y,lit?(y<y0+1?LI_HW.top:LI_HW.lit):(y<y0+1?'r':'R'));}for(let x=0;x<4;x++)P(x,y0-3,'k');}}
liLanternCanvas=function(kind,dir,hood,lit,fk){const fl=lit?(fk>.35?2:fk<-.35?0:1):0;const key='365d'+kind+dir+(hood?'h':'')+(lit?'L':'D')+fl;if(LI_CV[key])return LI_CV[key];
  let rows=(kind==='walt'?LI_WALT:LI_TIN)[dir]||(kind==='walt'?LI_WALT.S:LI_TIN.S);let pal=LI_PAL[kind][lit?'lit':'dark'];
  if(kind==='tin'&&hood){rows=rows.map((r,y)=>LI_TINH.rows[y]||r);pal=LI_TINH[lit?'lit':'dark'];}
  const R=rows.map((r,y)=>{if(!lit)return r;if(kind==='tin'){if(fl===0)r=r.replace('W','F');if(fl===2&&y===5)r=r.replace('f','F');}else{if(fl===2&&y===5)r=r.replace('GGgg','GGfg');if(fl===0&&y===6)r=r.replace('gfg','ggg');}return r;});   // the flame's tip moves with the flicker
  const pad=hood?2:0,W=R[0].length+pad*2,H=R.length;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const y0=5,y1=kind==='walt'?9:8;
  if(hood&&dir==='S'){liHood365(g,W,H,'S',y0,y1,lit,true);liHood365(g,W,H,'S',y0,y1,lit,false);}
  g.drawImage(liGrid(R,pal),pad,0);
  if(hood&&dir!=='S')liHood365(g,W,H,dir,y0,y1,lit,dir!=='W');
  return LI_CV[key]=c;};
// the ground ahead brighter, behind darker, with the hood on (the colour light at dusk; night362 does the dark)
{const _pl=liPlayerLight;liPlayerLight=function(t,L,DK){if(!liHoodOn()||liCur()==='flash')return _pl.apply(this,arguments);
  const c=liCur(),on=lanternOn()?1:0;const sput=sputT>0?(Math.random()<.5?.15:.6):1;const low=S.fuel<15;const fuelK=low?(.6+.4*Math.random()):1;
  const steady=c==='walt'?.45:1;const fk=lanternFlicker(t)*steady;const k=L*sput*fuelK*(on?1:.12-.09*DK);const lp=lanternPos();
  if(DK>0)nightLantern(lp,k*(.92+.08*fk)*(c==='walt'?1.12:1),fk,DK,{walt:c==='walt'});
  const big=c==='walt'?1.16:1,R=6.6*big*PPM*(.97+.03*fk);
  if(DK<1){lanternPool(lp.gx+P.fx*1.6*PPM,lp.gy+P.fz*1.3*PPM,R,c==='walt'?[255,196,116]:[255,186,104],.8*k*(.92+.08*fk)*(1-DK));
    lanternPool(lp.gx+P.fx*3.6*PPM,lp.gy+P.fz*2.9*PPM,5*PPM,[255,210,146],.72*k*(1-DK));}
  glowAt(lp.x+P.fx*2,lp.y,16+2*fk,[255,232,170],.95*k);glowAt(lp.x+P.fx*10,lp.y+P.fz*6,40,[255,170,80],.5*k*(.85+.15*fk));};}
// ---------------------------------------------------------------- the icons
{const _ic=liIcon;liIcon=function(id){if(id!=='walt'&&id!=='hood'&&id!=='cell')return _ic(id);const key='365'+id;if(LI_ICON[key])return LI_ICON[key];
  const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');const P=(x,y,col)=>{if(x<0||y<0||x>31||y>31)return;g.fillStyle=col;g.fillRect(x,y,1,1);};
  const cyl=(x0,x1,y0,y1,R)=>{const w=x1-x0;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=(x-x0)/Math.max(1,w);P(x,y,R[u<.12?2:u<.3?R.length-1:u<.55?3:u<.8?2:1]);}};
  const ell=(cx,cy,rx,ry,R)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy>1)continue;const l=-dx*.6-dy*.7;P(x,y,R[Math.max(0,Math.min(R.length-1,Math.round(2+l*2)))]);}};
  const TIN=['#2e2a28','#55504a','#7e776c','#a8a092','#d2cab8'],BR=['#3a2210','#5e3a18','#8a5e2a','#b08440','#d0aa68'],CH=['#3a3e48','#6e7482','#a8b0bc','#d8dee8'],FL=['#c8601a','#f08a2a','#f8be5c','#fff4dc'];
  const glass=['#4e4a48','#a8a290','#c4bca8','#d6d2c8'];
  if(id==='walt'){const cx=16;   // the hurricane lantern of the heart scene: bail, cap, a cool glass globe round the flame, the brass base cut W. COYLE
    for(let a=0;a<=20;a++){const t=Math.PI+a/20*Math.PI;P(Math.round(cx+Math.cos(t)*7),Math.round(8+Math.sin(t)*6),BR[a<8?3:1]);}
    ell(cx,9,4,2,BR);cyl(cx-6,cx+5,10,11,BR);
    for(let y=12;y<=21;y++){const w=Math.round(5+Math.sin((y-11.5)/10*Math.PI)*1.6);for(let x=cx-w;x<=cx+w-1;x++){const u=(x-(cx-w))/(2*w);P(x,y,u<.16?glass[3]:u<.3?glass[2]:u>.82?glass[0]:glass[1]);}}
    for(let y=14;y<=19;y++){const w=y<15?0:1;for(let x=cx-w;x<=cx+w;x++)P(x,y,y<15?FL[2]:x===cx?FL[3]:FL[1]);}P(cx,20,'#5a3a1c');
    cyl(cx-7,cx+6,22,26,BR);for(let x=cx-7;x<=cx+6;x++)P(x,22,BR[4]);for(let x=cx-6;x<=cx+5;x++)P(x,27,BR[1]);
    for(const x of [cx-5,cx-4,cx-2,cx-1,cx,cx+2,cx+3])P(x,24,BR[0]);for(const x of [cx-5,cx-3,cx-1,cx+1,cx+3])P(x,25,BR[1]);}
  else if(id==='hood'){// the hood: a tin shell standing behind a lantern, its polished inside catching the flame, its rolled rim, the clip over the cap
    for(let y=6;y<=28;y++){const t=(y-17)/11,q=Math.sqrt(Math.max(0,1-t*t));const xl=Math.round(16-11*q),xr=Math.round(16+11*q);
      for(let x=xl;x<=xr;x++){const u=(x-xl)/Math.max(1,xr-xl);const rim=x<=xl+1||x>=xr-1||y<=7;P(x,y,rim?(x<16?TIN[4]:TIN[2]):u<.3?'#e8c890':u<.7?'#c8a070':'#8a7050');}}
    for(let x=13;x<=19;x++){P(x,3,TIN[3]);P(x,4,TIN[1]);}
    const t=_ic('tin');g.drawImage(t,0,2);}   /* the lantern in front of it, at its own size */
  else{// a battery: an upright cell, its brass terminal nub on top, a dark jacket, a cream band with a plus on it
    cyl(10,21,8,27,['#16161c','#24242c','#3a3a46','#56566a','#7a7a90']);cyl(10,21,12,17,['#4a2412','#7a3e1e','#a85e32','#c8804a','#e0a06a']);
    for(let x=10;x<=21;x++){P(x,8,'#c8ccd4');P(x,27,'#3a3e46');}ell(15.5,8,5.5,1.4,CH);cyl(13,18,4,7,BR);P(13,4,BR[4]);
    for(let x=14;x<=17;x++)P(x,14,'#2a140a');for(let y=13;y<=16;y++)P(15,y,'#2a140a');for(let y=13;y<=16;y++)P(16,y,'#2a140a');for(let x=14;x<=17;x++)P(x,15,'#2a140a');}   /* a dark plus on a copper band (a red cross read as first aid) */
  const d=g.getImageData(0,0,32,32),D=d.data,out=[];for(let y=0;y<32;y++)for(let x=0;x<32;x++){if(D[(y*32+x)*4+3])continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<32&&Y<32&&D[(Y*32+X)*4+3]>40){out.push([x,y]);break;}}}
  g.fillStyle='rgba(20,14,10,.95)';for(const [x,y] of out)g.fillRect(x,y,1,1);return LI_ICON[key]=c;};}
for(const C of [LI_FC,LI_CV,LI_ICON])for(const k of Object.keys(C))delete C[k];
