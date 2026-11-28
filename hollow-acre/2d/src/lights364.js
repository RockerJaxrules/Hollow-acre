/* ================= t364: your own lights (owner: "when Caitlyn gives you her fathers lantern that should become your main lantern
   same with flashlight should replace main lantern or you get to chose").
   Every light is its own thing you own and carry:
   - the tin lantern you start with: a round warm pool;
   - Walt's brass lantern (Caitlyn, six hearts): polished brass with W. COYLE cut in its base, a brighter, warmer, slightly larger
     pool, a steadier flame and a little longer on a fill of oil;
   - Dunn's service flashlight (three fish): held in your hand, pointing where you face, a narrow cold-white cone that reaches
     about 11-12 m with almost no spill: it lights what's ahead and leaves the dark around you. It runs on a battery (the lantern
     chip turns into a battery chip while you carry it); spare batteries are sold at Coyle's General, and a flat one is swapped
     for a spare by itself, the way a dry lantern takes a flask;
   - the lantern hood (the smith's): a reflector that fits whichever lantern you carry and throws a forward lobe. Not a flashlight.
   A new light becomes the one you carry, with a short note. Switch any time in the backpack (each light is an item you can
   Carry, {Y} on a pad) or with a tap on its slot in the toolbar (tapping the one you carry swaps to your next light). The choice is
   saved, and friends see the light you carry. Old saves are read from the story: Caitlyn's sixth heart means Walt's lantern,
   Dunn's finished trade means the flashlight, a bought hood the hood; nothing is lost.
   All art is drawn here by hand, pixel by pixel: hue-shifted ramps, a dark outline, light from the top left. ================= */
var LI_ON=false;   // (a var: other files may ask before this module has run)
const LI_KINDS=['tin','walt','flash'];
const LI_NAME={tin:'Tin lantern',walt:'Walt’s lantern',flash:'Dunn’s flashlight',hood:'Lantern hood'};
function liS(){let L=S.lit;if(!L||typeof L!=='object')L=S.lit={own:{tin:1,walt:0,flash:0,hood:0},cur:'tin',hood:1,batt:100,cells:0,v:0};
  L.own=Object.assign({tin:1,walt:0,flash:0,hood:0},L.own||{});L.own.tin=1;if(!LI_KINDS.includes(L.cur)||!L.own[L.cur])L.cur='tin';
  if(!(L.batt>=0))L.batt=100;L.cells=Math.max(0,L.cells|0);if(L.hood==null)L.hood=1;return L;}
// old saves: S.flashlight was set by any of the three (Walt's lantern, Dunn's trade, the hood) and each one closed the others off,
// so read who gave it from the story; where the save can't tell, keep both rather than lose one
function liMigrate(){const L=liS();if(L.v>=1)return false;L.v=1;const hs=S.heartSeen||{},q=S.q||{};let any=false;
  if(hs.mae6){L.own.walt=1;any=true;}
  if(S.flashlight){if(q.dunn){L.own.flash=1;L.batt=100;L.cells=Math.max(L.cells,1);any=true;}if(!hs.mae6||q.dunn){L.own.hood=1;any=true;}}
  L.cur=L.own.walt?'walt':'tin';return any;}
const liCur=()=>liS().cur;
const liOwn=k=>!!liS().own[k];
const liHoodOn=()=>{const L=liS();return !!(L.own.hood&&L.hood&&L.cur!=='flash');};
// oil burns a little slower in Walt's lantern (its wick is trimmed right); the flashlight burns none
function liFuelRate(){const c=liCur();return c==='flash'?0:c==='walt'?.8:1;}
function liPowered(){const L=liS();return L.cur==='flash'?L.batt>0:S.fuel>0;}
// ---------------------------------------------------------------- the art
// a grid of letters to a canvas, each letter a colour of the light's palette ('.' is clear)
function liGrid(rows,pal,flip){const W=rows[0].length,H=rows.length,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  rows.forEach((r,y)=>{for(let x=0;x<W;x++){const ch=r[x];if(ch==='.'||!pal[ch])continue;g.fillStyle=pal[ch];g.fillRect(flip?W-1-x:x,y,1,1);}});return c;}
// the tin lantern: as before (lantern.js), its bail seen as an arch from the front or back and edge-on from the side
const LI_TIN={S:LANTERN_ART,N:LANTERN_ART,E:['...k...','...k...'].concat(LANTERN_ART.slice(2)),W:['...k...','...k...'].concat(LANTERN_ART.slice(2))};
// Walt's: a caged barn lantern in polished brass, a clear globe round a trimmed flame, the plate on its base cut W. COYLE (two
// rows of cuts on the plate say lettering at this size); the plate faces out from your hip, so it shows from the front only
const LI_WALT={
  S:['..kkkkk..','.k.....k.','...kkk...','..kHHBk..','.kHBBBbk.','kbbbbbbbk','kGcgFgcgk','kGcfFfcgk','kGcFwFcgk','kgcgegcgk','kHHBBBBbk','kbnmnmnbk','kbbbbbbbk','.kkkkkkk.'],
  N:['..kkkkk..','.k.....k.','...kkk...','..kHHBk..','.kHBBBbk.','kbbbbbbbk','kGcgFgcgk','kGcfFfcgk','kGcFwFcgk','kgcgegcgk','kHHBBBBbk','kbBBBBBbk','kbbbbbbbk','.kkkkkkk.'],
  E:['....k....','....k....','...kkk...','..kHHBk..','.kHBBBbk.','kbbbbbbbk','kGcgFgcgk','kGcfFfcgk','kGcFwFcgk','kgcgegcgk','kHHBBBBbk','kbBBBBnbk','kbbbbbbbk','.kkkkkkk.']};
LI_WALT.W=LI_WALT.E;
const LI_PAL={
  tin:{lit:LANTERN_PAL.lit,dark:LANTERN_PAL.dark},
  walt:{lit:{k:'#2a1406',b:'#6e3e12',B:'#b88224',H:'#f2cc66',c:'#c89438',g:'#e8a854',G:'#fff0c8',f:'#ffb446',F:'#ffe08a',w:'#fffaec',e:'#8a4a16',m:'#4a2a0c',n:'#e2ae44'},
        dark:{k:'#2a1406',b:'#6a4214',B:'#a8782a',H:'#d8b86a',c:'#6a4a1c',g:'#464c56',G:'#7a828e',f:'#3a3e46',F:'#454a52',w:'#50555e',e:'#3a3028',m:'#3a220a',n:'#b88a36'}}};
// the hood: a tin reflector behind the flame (the side away from where you face), so it throws the light forward. Seen from the
// front its bright inside frames the globe; from behind its dull back hides the flame; from the side it's a curved shell
const LI_HPAL={k:'#1a1c22',r:'#d6dee6',R:'#9aa4ae',d:'#3e444c',D:'#585f68',s:'#7c858f'};
function liHoodOver(g,W,H,dir,y0,y1,front){const P=(x,y,c)=>{g.fillStyle=LI_HPAL[c];g.fillRect(x,y,1,1);};
  if(dir==='S'&&!front){for(let y=y0-1;y<=y1;y++){P(0,y,'k');P(W-1,y,'k');P(1,y,y<y0+1?'k':'r');P(W-2,y,y<y0+1?'k':'R');}for(let x=1;x<W-1;x++)P(x,y0-1,'k');}
  if(dir==='N'&&front){for(let y=y0;y<y1;y++)for(let x=1;x<W-1;x++){const e=x===1||x===W-2;P(x,y,e?'k':x<W/2-1?'s':x<W/2+1?'D':'d');}for(let x=2;x<W-2;x++)P(x,y0+1+((x*3)%2),x<W/2?'r':'D');}
  if((dir==='E'||dir==='W')&&front){const L=dir==='E';for(let y=y0;y<y1;y++){const bow=(y===y0||y===y1-1)?1:0;const x=L?bow:W-1-bow;P(x,y,'k');P(L?x+1:x-1,y,y<(y0+y1)/2?'r':'R');}}}
// the lantern on your belt, for the way you face, lit or dark, with or without the hood (cached)
const LI_CV={};
function liLanternCanvas(kind,dir,hood,lit,fk){const fl=lit?(fk>.35?2:fk<-.35?0:1):0;const key=kind+dir+(hood?'h':'')+(lit?'L':'D')+fl;if(LI_CV[key])return LI_CV[key];
  const rows=(kind==='walt'?LI_WALT:LI_TIN)[dir]||(kind==='walt'?LI_WALT.S:LI_TIN.S);const pal=LI_PAL[kind][lit?'lit':'dark'];
  // the flame's tip moves with the flicker
  const R=rows.map((r,y)=>{if(!lit)return r;if(kind==='tin'){if(fl===0)r=r.replace('W','F');if(fl===2&&y===5)r=r.replace('f','F');}else{if(fl===0)r=r.replace('w','F');if(fl===2&&y===6)r=r.replace('gFg','gwg');if(fl===0&&y===6)r=r.replace('gFg','ggg');}return r;});
  const pad=hood?1:0,W=R[0].length+pad*2,H=R.length;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const y0=kind==='walt'?5:4,y1=kind==='walt'?10:9;
  if(hood)liHoodOver(g,W,H,dir,y0,y1,false);
  g.drawImage(liGrid(R,pal),pad,0);
  if(hood)liHoodOver(g,W,H,dir,y0,y1,true);
  return LI_CV[key]=c;}
// Dunn's flashlight in your hand: a long black service torch with a chrome bezel; from the side its whole length, pointing ahead;
// toward you only the lens; away from you only its tail. Your fist round its body in your own skin
const LI_FPAL={lit:{k:'#0c0c10',b:'#20202a',B:'#363644',H:'#646476',c:'#7e8494',C:'#d2d8e4',L:'#dce8ff',W:'#ffffff',s:'#5a2a2c'},
               dark:{k:'#0c0c10',b:'#20202a',B:'#363644',H:'#646476',c:'#7e8494',C:'#b8bec8',L:'#2a3240',W:'#4a5464',s:'#5a2a2c'}};
const LI_FLASH={
  E:{rows:['.....s...kkk','kkkkkkkkkcLk','kHBHBHBHkCWk','kbbbbbbbkcWk','kkkkkkkkkcLk','.........kkk'],ax:2,ay:2.5,lx:10,ly:2.5,fist:[1,1]},
  S:{rows:['.....','.....','.kkk.','kcCck','kCWLk','kcLck','.kkk.'],ax:2,ay:1.5,lx:2,ly:4,fist:[0,0]},
  N:{rows:['.kkk.','kcCck','kbBbk','kbBbk','kbHbk','.kkk.'],ax:2,ay:3,lx:2,ly:0,fist:[0,2]}};
const LI_FC={};
function liSkin(){const L=(S.look||{});const sk=/^#[0-9a-f]{6}$/i.test(L.skin||'')?L.skin:'#e8b48c';const mx=(a,b,u)=>m4mix(a,b,u);return [mx(sk,'#2a0e18',.62),mx(sk,'#3a1424',.3),sk,mx(sk,'#fff0d0',.28)];}
function liFlashCanvas(dir,lit){const sk=liSkin();const key=dir+(lit?'L':'D')+sk[2];if(LI_FC[key])return LI_FC[key];
  const D=dir==='W'?LI_FLASH.E:LI_FLASH[dir]||LI_FLASH.S;const pal=LI_FPAL[lit?'lit':'dark'];const c=liGrid(D.rows,pal,dir==='W');const g=c.getContext('2d');
  const P=(x,y,i)=>{g.fillStyle=i<0?'#1a0a0a':sk[i];g.fillRect(dir==='W'?c.width-1-x:x,y,1,1);};
  // the fist: knuckles lit on top, the thumb along the body, the fingers' shadow under it
  const [fx,fy]=D.fist;
  if(dir==='E'||dir==='W'){for(let x=1;x<4;x++)P(fx+x,fy-1,-1);P(fx,fy,-1);P(fx+1,fy,3);P(fx+2,fy,2);P(fx+3,fy,3);P(fx+4,fy,-1);
    P(fx,fy+1,-1);P(fx+1,fy+1,2);P(fx+2,fy+1,1);P(fx+3,fy+1,2);P(fx+4,fy+1,-1);P(fx,fy+2,-1);P(fx+1,fy+2,1);P(fx+2,fy+2,0);P(fx+3,fy+2,1);P(fx+4,fy+2,-1);for(let x=1;x<4;x++)P(fx+x,fy+3,-1);}
  else if(dir==='S'){// seen from the front: the fist above and behind the lens, knuckles toward you
    for(let x=0;x<5;x++)P(fx+x,fy,x===0||x===4?-1:-1);P(fx,fy+1,-1);P(fx+1,fy+1,3);P(fx+2,fy+1,2);P(fx+3,fy+1,2);P(fx+4,fy+1,-1);P(fx,fy+2,-1);P(fx+4,fy+2,-1);P(fx+1,fy+2,1);P(fx+3,fy+2,1);}
  else{// from behind: the back of the fist over the body, the tail below it
    for(let x=0;x<5;x++)P(fx+x,fy,-1);P(fx,fy+1,-1);P(fx+1,fy+1,3);P(fx+2,fy+1,2);P(fx+3,fy+1,1);P(fx+4,fy+1,-1);P(fx,fy+2,-1);P(fx+1,fy+2,2);P(fx+2,fy+2,1);P(fx+3,fy+2,0);P(fx+4,fy+2,-1);}
  return LI_FC[key]={c,ax:dir==='W'?c.width-1-D.ax+1:D.ax,ay:D.ay,lx:dir==='W'?c.width-1-D.lx+1:D.lx,ly:D.ly};}
// where your hand is (from your feet), for the way you face: the right hand toward you, the near one from the side
const LI_HAND={S:[-8.5,-9.5],N:[8,-9.5],E:[.5,-9.5],W:[-.5,-9.5]};
const liBob=()=>{const mv=LANT.px!=null&&Math.hypot(P.x-(LI_LAST.x||P.x),P.z-(LI_LAST.z||P.z))>.002;return mv?Math.round(Math.sin(P.t*10)*.8):0;};
const LI_LAST={x:null,z:null};
// ---------------------------------------------------------------- the icons (backpack, toolbar), 32x32, drawn in code
const LI_ICON={};
function liIcon(id){if(LI_ICON[id])return LI_ICON[id];const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');
  const P=(x,y,col)=>{if(x<0||y<0||x>31||y>31)return;g.fillStyle=col;g.fillRect(x,y,1,1);};
  // a ramp from dark to light along a cylinder's width (light from the left), with one hot band
  const cyl=(x0,x1,y0,y1,R,hot)=>{const w=x1-x0;for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const u=(x-x0)/Math.max(1,w);let i=u<.12?2:u<.3?(hot?R.length-1:3):u<.55?3:u<.8?2:1;if(i>R.length-1)i=R.length-1;P(x,y,R[i]);}};
  const ell=(cx,cy,rx,ry,R)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++){const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy>1)continue;const l=-dx*.6-dy*.7;P(x,y,R[Math.max(0,Math.min(R.length-1,Math.round(2+l*2)))]);}};
  const line=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let i=0;i<=n;i++)P(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),col);};
  const TIN=['#2e2a28','#55504a','#7e776c','#a8a092','#d2cab8'],BR=['#4a2a0c','#7a4a14','#b07a24','#dca43c','#f8dc88'],GL=['#5a4630','#c89c58','#f0c878','#fff0c0'],
    FL=['#c8601a','#ff9a2a','#ffd060','#fff6d0'],BK=['#101016','#20202a','#343442','#565668','#8a8aa0'],CH=['#3a3e48','#6e7482','#a8b0bc','#e6ecf4'];
  if(id==='tin'||id==='walt'){const R=id==='walt'?BR:TIN,cx=16;
    // the bail, the cap, the globe with its flame, the base (Walt's: a cage of guard wires and the engraved plate)
    for(let a=0;a<=20;a++){const t=Math.PI+a/20*Math.PI;P(Math.round(cx+Math.cos(t)*7),Math.round(8+Math.sin(t)*6),R[a<8?3:1]);}
    ell(cx,9,4,2,R);cyl(cx-6,cx+5,10,11,R,1);P(cx-6,10,R[4]);
    for(let y=12;y<=21;y++){const w=Math.round(5+Math.sin((y-11.5)/10*Math.PI)*1.6);for(let x=cx-w;x<=cx+w-1;x++){const u=(x-(cx-w))/(2*w);P(x,y,u<.16?GL[3]:u<.3?GL[2]:u>.82?GL[0]:GL[1]);}}
    for(let y=14;y<=19;y++){const w=y<15?0:y<17?1:1;for(let x=cx-w;x<=cx+w-1+1;x++)P(x,y,y<15?FL[2]:x===cx?FL[3]:FL[1]);}P(cx,20,FL[0]);
    if(id==='walt'){for(const gx of [cx-4,cx+3])for(let y=12;y<=21;y++)P(gx,y,R[y%3?2:1]);P(cx-5,13,'#ffffff');}
    cyl(cx-7,cx+6,22,26,R,1);for(let x=cx-7;x<=cx+6;x++)P(x,22,R[4]);for(let x=cx-6;x<=cx+5;x++)P(x,27,R[1]);
    if(id==='walt'){for(const x of [cx-5,cx-4,cx-2,cx-1,cx,cx+2,cx+3])P(x,24,R[0]);for(const x of [cx-5,cx-3,cx-1,cx+1,cx+3])P(x,25,R[1]);P(cx+5,23,'#fff6d0');}}
  else if(id==='flash'){// lying corner to corner: the tail at the lower left, the head and its lens at the upper right
    const ax=6,ay=26,bx=22,by=10;const L=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/L,uy=(by-ay)/L,nx=-uy,ny=ux;
    for(let y=0;y<32;y++)for(let x=0;x<32;x++){const X=x+.5-ax,Y=y+.5-ay,al=X*ux+Y*uy,ac=X*nx+Y*ny;if(al<0||al>L+4)continue;const head=al>L-5;const r=head?4.2:2.6;if(Math.abs(ac)>r)continue;
      const v=ac/r;let col;if(al>L+1.5){col=v<-.2?'#ffffff':v<.4?'#dce8ff':'#9ab0d0';}else if(head){col=CH[v<-.5?3:v<0?2:v<.5?1:0];if(al>L-1&&al<L+1.5)col=CH[v<0?3:2];}
      else{col=BK[v<-.55?4:v<-.15?3:v<.35?2:v<.7?1:0];if(Math.floor(al)%3===0&&al>3&&al<L-7&&v<.5)col=BK[Math.min(4,(v<-.15?4:3))];}
      if(al<2)col=BK[v<0?2:1];P(x,y,col);}
    P(Math.round(ax+ux*(L-9)+nx*-2.6),Math.round(ay+uy*(L-9)+ny*-2.6),'#7a3436');}
  else if(id==='hood'){// a curved tin reflector, seen three-quarter: its dull back shell, its polished inside with the lantern's
    // glint caught in it, the rolled rim, and the clip at the top that fits over a lantern's cap
    for(let y=6;y<=27;y++){const t=(y-16.5)/10.5,q=Math.sqrt(Math.max(0,1-t*t));const xo=Math.round(16-10*q),xi=Math.round(16-5*q),xr=Math.round(16+5+2*q);
      for(let x=xo;x<=xr;x++){let col;if(x<xi)col=TIN[x-xo<2?3:x-xo<4?2:1];else if(x>=xr-1)col=TIN[4];else{const u=(x-xi)/Math.max(1,xr-1-xi);col=u<.25?CH[1]:u<.5?CH[2]:u<.8?CH[3]:CH[2];}P(x,y,col);}}
    for(let y=13;y<=19;y++)for(let x=15;x<=19;x++){const d=Math.hypot(x-17,y-16);if(d<2.4)P(x,y,d<1.1?'#ffffff':'#fff2cc');}
    cyl(12,19,2,5,TIN,1);P(12,2,TIN[4]);for(let x=13;x<=18;x++)P(x,5,TIN[0]);}
  else if(id==='cell'){// a battery from Coyle's: a steel can in a dark red jacket with a cream band, the brass button on top
    cyl(10,21,7,27,['#3a0e10','#5e1a1a','#8a2a24','#b03a2c','#d8604a'],1);cyl(10,21,13,15,['#6a5a3e','#a8946a','#d8c89a','#efe2bc','#fff6dc'],1);
    for(let x=10;x<=21;x++){P(x,7,'#c8ccd4');P(x,27,'#5a5e66');}ell(15.5,7,5,1.4,CH);cyl(13,18,4,6,BR,1);P(13,4,BR[4]);}
  // one outline round it all
  const d=g.getImageData(0,0,32,32),D=d.data,out=[];for(let y=0;y<32;y++)for(let x=0;x<32;x++){if(D[(y*32+x)*4+3])continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<32&&Y<32&&D[(Y*32+X)*4+3]>40){out.push([x,y]);break;}}}
  g.fillStyle='rgba(20,14,10,.95)';for(const [x,y] of out)g.fillRect(x,y,1,1);
  return LI_ICON[id]=c;}
// as an item icon the rest of the game can show
for(const k of ['tin','walt','flash','hood','cell'])try{ICON['li_'+k]=liIcon(k).toDataURL();}catch(e){}
// ---------------------------------------------------------------- owning, carrying, switching
const liText=k=>({tin:'the tin lantern',walt:'Walt’s lantern',flash:'Dunn’s flashlight'}[k]);
function liChanged(){try{lastHud='';updateHud();}catch(e){}try{renderHotbar();}catch(e){}try{liChip(true);}catch(e){}try{if(typeof coopSend==='function')coopSend(true);}catch(e){}}
// carry another light you own: a short note says where each one goes
function liCarry(k,quiet){const L=liS();if(!L.own[k]||!LI_KINDS.includes(k))return false;const prev=L.cur;if(prev===k)return false;L.cur=k;
  if(!quiet){const hang=k==='flash'?'You take Dunn’s flashlight in your hand.':`You hang ${liText(k)} on your belt.`;const away=prev==='flash'?'The flashlight goes in your pack.':prev==='walt'?'Walt’s lantern goes in your pack.':'The tin one goes in your pack.';
    let tail='';if(k==='flash'&&L.batt<=0)tail=L.cells>0?' Its battery is flat; you put in a fresh one.':' Its battery is flat.';if(k==='flash'&&L.batt<=0&&L.cells>0){L.cells--;L.batt=100;}
    if(k!=='flash'&&L.own.hood&&L.hood)tail=' The hood goes on it.';toast(hang+' '+away+tail,3.4);try{SFX.click?SFX.click():A.tone(900,.04,'square',.03);}catch(e){}}
  liChanged();return true;}
// something new: it becomes the light you carry, with a note
function liGain(k){const L=liS();const had=!!L.own[k];L.own[k]=1;S.flashlight=true;
  if(k==='hood'){L.hood=1;toast(L.cur==='flash'?'The hood is for a lantern. It goes in your pack, for when you carry one.':`You fit the hood over ${L.cur==='walt'?'Walt’s lantern':'your lantern'}. Its light reaches out ahead of you now.`,3.6);liChanged();return;}
  if(k==='flash'&&!had){L.batt=100;L.cells=Math.max(L.cells,1);}
  if(L.cur===k){liChanged();return;}const prev=L.cur;L.cur=k;
  const msg=k==='walt'?`You hang Walt’s lantern on your belt. ${prev==='flash'?'The flashlight goes in your pack.':'The tin one goes in your pack.'}`
    :`You take Dunn’s flashlight in your hand. ${prev==='walt'?'Walt’s lantern goes':'Your lantern goes'} in your pack. A spare battery rattles in your pocket.`;
  setTimeout(()=>{try{toast(msg+' (Switch in your backpack.)',4.2);}catch(e){}},700);liChanged();}
// ---- in the backpack and on the toolbar: each light you own is an item you can Carry
{const _ak=allItemKeys;allItemKeys=function(){const ks=_ak();const L=liS();for(const k of LI_KINDS)if(L.own[k])ks.push('L:'+k);if(L.own.hood)ks.push('L:hood');return ks;};}
{const _ii=itemInfo;itemInfo=function(key){if(!(key&&key.startsWith('L:')))return _ii.apply(this,arguments);const id=key.slice(2),L=liS();if(id!=='hood'&&!LI_KINDS.includes(id))return null;
  const cur=L.cur===id,btn=(label,k)=>` <button class="chip" data-place="${k}" style="margin-left:4px">${label}</button>`;let desc='';
  if(id==='tin')desc=`Grandpa’s old tin lantern. A round, warm pool of light all round you. Oil ${Math.ceil(S.fuel)}%, ${S.flasks} spare flask${S.flasks===1?'':'s'}.`;
  else if(id==='walt')desc=`Walt Coyle’s brass lantern, his name cut in the base. A brighter, warmer, steadier light that reaches a little further, and it’s easier on oil. Oil ${Math.ceil(S.fuel)}%, ${S.flasks} spare flask${S.flasks===1?'':'s'}.`;
  else if(id==='flash')desc=`Dunn’s service flashlight. A narrow white beam that reaches far ahead and lights nothing else: what’s beside you and behind you stays dark. Battery ${Math.ceil(L.batt)}%, ${L.cells} spare${L.cells===1?'':'s'} (Coyle’s sells them).`;
  else desc=L.cur==='flash'?'A tin reflector for a lantern. It does nothing for a flashlight.':`A tin reflector on ${L.cur==='walt'?'Walt’s lantern':'your lantern'}, throwing its light out ahead of you.`;
  if(id==='hood')desc+=L.cur==='flash'?'':btn(L.hood?'Take off':'Fit','L:hood');else desc+=cur?' <i>(carrying)</i>':btn('Carry','L:'+id);
  return {key,type:'L',id,name:LI_NAME[id],desc,icon:'li_'+id,qty:1,tool:true};};}
{const _hi=holdItem;holdItem=function(key){if(!(key&&key.startsWith('L:')))return _hi.apply(this,arguments);const id=key.slice(2),L=liS();
  if(id==='hood'){if(L.cur!=='flash'){L.hood=L.hood?0:1;toast(L.hood?'You fit the hood over your lantern.':'You take the hood off. The light goes round you again.',2.2);liChanged();}}else liCarry(id);
  try{if(!$('bag').hidden&&typeof renderItems==='function'&&GM_TAB==='items')renderItems();}catch(e){}};}
// the toolbar: a tap on a light carries it; a tap on the one you carry swaps to your next light. Either way the tool you had in
// hand stays selected (the slot is a switch, not something you hold)
{const _su=slotUse;slotUse=function(i){const k=S.slots&&S.slots[i];if(!(k&&k.startsWith('L:'))||S.mode!=='play'||S.paused)return _su.apply(this,arguments);const id=k.slice(2),L=liS();
  if(id==='hood'){holdItem(k);}else if(L.cur!==id)liCarry(id);else{const own=LI_KINDS.filter(q=>L.own[q]);if(own.length<2){toast(`${LI_NAME[id]}. ${id==='flash'?'Battery '+Math.ceil(L.batt)+'%':'Oil '+Math.ceil(S.fuel)+'%'}.`,1.6);}else liCarry(own[(own.indexOf(id)+1)%own.length]);}
  renderHotbar();};}
// ---------------------------------------------------------------- the HUD chip: oil for a lantern, the battery for the flashlight
const LI_BATT_ICO='<svg viewBox="0 0 10 10" shape-rendering="crispEdges" class="u37ico li364b"><rect x="3" y="0" width="4" height="1" fill="#1a0e06"/><rect x="2" y="1" width="6" height="9" fill="#1a0e06"/><rect x="4" y="0" width="2" height="1" fill="#d8b050"/><rect x="3" y="2" width="4" height="7" fill="#8a2a24"/><rect x="3" y="2" width="1" height="7" fill="#c84a3a"/><rect x="3" y="4" width="4" height="2" fill="#e8dcb4"/><rect x="3" y="4" width="1" height="2" fill="#fff6dc"/><rect x="6" y="2" width="1" height="7" fill="#5a1a18"/></svg>';
const LI_CELL_ICO='<svg viewBox="0 0 6 9" shape-rendering="crispEdges" class="u37ico"><rect x="1" y="1" width="4" height="8" fill="#1a0e06"/><rect x="2" y="0" width="2" height="1" fill="#d8b050"/><rect x="2" y="2" width="2" height="6" fill="#8a2a24"/><rect x="2" y="2" width="1" height="6" fill="#c84a3a"/><rect x="2" y="4" width="2" height="1" fill="#e8dcb4"/></svg>';
const LI_CH={k:null,t:''};
function liHudText(){const L=liS();return L.cur==='flash'?Math.ceil(L.batt)+'%':Math.ceil(S.fuel)+'%'+(S.flasks?' +'+S.flasks:'');}
function liSig(){const L=liS();return L.cur+(L.cur==='flash'?Math.ceil(L.batt)+'/'+L.cells:'');}
function liLow(th){const L=liS();return L.cur==='flash'?L.batt<(th||25):S.fuel<(th||25);}
// written only when the light you carry or its numbers change (no per-frame DOM writes)
function liChip(force){const c=$('cOil');if(!c)return;const L=liS(),f=L.cur==='flash';const t=f?'f'+L.cells:'l';if(!force&&t===LI_CH.t)return;LI_CH.t=t;
  const title=f?'Flashlight battery and spare batteries':'Lantern oil and spare flasks';if(c.title!==title){c.title=title;c.dataset.u37t=title;}
  const ico=[...c.children].find(e=>e.classList&&e.classList.contains('u37ico'));
  if(f){if(!ico||!ico.classList.contains('li364b')){if(ico)ico.remove();c.insertAdjacentHTML('afterbegin',LI_BATT_ICO);}c.querySelectorAll('.u37fl').forEach(x=>x.remove());}
  else if(ico&&ico.classList.contains('li364b')){ico.remove();if(typeof U37_ICON!=='undefined'&&U37_ICON.oil)c.insertAdjacentHTML('afterbegin',U37_ICON.oil);}
  let sp=c.querySelector('.li364c');if(f&&L.cells>0){if(!sp){sp=document.createElement('span');sp.className='li364c u37fl';const o=$('iOil');if(o)o.after(sp);else c.appendChild(sp);}const h=LI_CELL_ICO+'+'+L.cells;if(sp.innerHTML!==h)sp.innerHTML=h;}else if(sp)sp.remove();
  try{lastHud='';updateHud();}catch(e){}}
setInterval(()=>{try{liChip(false);}catch(e){}},500);
if(typeof u37ChipLabel==='function'){const _cl=u37ChipLabel;u37ChipLabel=function(c){const t=c.title||c.dataset.u37t||'';if(/battery/i.test(t)){const L=liS();return `Flashlight battery ${Math.ceil(L.batt)}%`+(L.cells?`, ${L.cells} spare${L.cells===1?'':'s'}`:', no spare');}return _cl.apply(this,arguments);};}
// spare batteries at Coyle's General (only once you have a flashlight to put them in)
{const _m=vendors.mae.rows;vendors.mae.rows=()=>{const r=_m();const L=liS();if(L.own.flash)r.push({k:'cell',name:'Flashlight battery',desc:L.cells>=3?'You can only carry three spares.':`A fresh battery for Dunn’s flashlight. You have ${L.cells} spare${L.cells===1?'':'s'}.`,price:10,can:L.cells<3,buy(){L.cells++;liChip(true);}});return r;};}
// ---------------------------------------------------------------- drawing what you carry
// the flashlight's battery runs down while it's on at night; flat, a spare goes in by itself (the way a dry lantern takes a flask)
let liDarkT=0;
function liTick(dt){const L=liS();if(L.v<1)liMigrate();
  if(L.cur==='flash'&&isNight()&&!S.bound&&S.mode==='play'&&!S.paused){L.batt=Math.max(0,L.batt-dt*.72);
    if(L.batt<=0){liDarkT+=dt;if(liDarkT>2.4&&L.cells>0){L.cells--;L.batt=100;liDarkT=0;try{SFX.refill();}catch(e){}toast('You change the battery with cold fingers.',2.2);liChip(true);}
      else if(liDarkT>.05&&liDarkT<.1&&L.cells===0)toast(L.own.walt||L.own.tin?'The flashlight is dead. Your lantern is in your pack.':'The flashlight is dead.',2.6,true);}
    else liDarkT=0;}
  LI_LAST.x=P.x;LI_LAST.z=P.z;}
{const _hu=hollowUpdate;hollowUpdate=function(dt){try{liTick(dt);}catch(e){}return _hu.apply(this,arguments);};}
{const _lp=lanternPos;lanternPos=function(){if(liCur()!=='flash')return _lp.apply(this,arguments);const X=sx(P.x),Y=sz(P.z);const h=LI_HAND[P.dir]||LI_HAND.S;
  const f=liFlashCanvas(P.dir,true);const hx=Math.round(X+h[0]),hy=Math.round(Y+h[1]+liBob());return {hx,hy,x:hx-f.ax+f.lx,y:hy-f.ay+f.ly,gx:X,gy:Y-2,flash:1};};}
lanternDraw=function(g,clip,t){lanternSwing();if(!lanternShown()||clip==='hurt'||clip==='sit')return;const c=liCur(),lit=lanternOn();
  // (while your hands are busy with a tool, the flashlight is tucked under your arm: its beam goes on, the torch isn't drawn in the swing)
  if(c==='flash'){if(P.anim)return;const lp=lanternPos();const f=liFlashCanvas(P.dir,lit);g.drawImage(f.c,Math.round(lp.hx-f.ax),Math.round(lp.hy-f.ay));return;}
  const lp=_liHip();const cv=liLanternCanvas(c,P.dir,liHoodOn(),lit,lit?lanternFlicker(t)*(c==='walt'?.45:1):0);const H=cv.height,W=cv.width;
  for(let y=0;y<H;y++){const dx=Math.round(LANT.sw*1.8*(y/H));g.drawImage(cv,0,y,W,1,lp.hx-(W>>1)+dx,lp.hy-1+y-(c==='walt'?1:0),W,1);}};
const _liHip=()=>{const X=sx(P.x),Y=sz(P.z);const h=LANTERN_HIP[P.dir]||LANTERN_HIP.S;return {hx:Math.round(X+h[0]),hy:Math.round(Y+h[1])};};
// ---------------------------------------------------------------- the light it throws
const LI_WCOL=[[0,[255,228,170]],[.13,[255,194,112]],[.38,[255,156,72]],[.7,[230,118,48]],[1,[192,90,36]]];   // Walt's: a cleaner, warmer gold
const LI_FCOL=[[0,[236,242,255]],[.3,[214,226,250]],[.7,[176,196,232]],[1,[140,160,206]]];                     // the flashlight: a cold white, bluer as it fades
// the beam: a narrow cone from the lens the way you face, bright and even to 11-12 m, soft at its edges, almost nothing beside it
// the beam's picture, made once per length (a few lengths, by direction): its brightness along it (still in the air close to you,
// meeting the ground a couple of metres out, brightest from there to ~9 m) times across it (a bright core, soft edges, nothing
// past ~20 degrees), in the cold white of a filament bulb. Drawn turned the way you face; no gradient bands, no per-frame work
const LI_BT={};
const LI_BR=[[0,.08],[.1,.3],[.22,.78],[.4,1],[.62,.86],[.8,.5],[.92,.18],[1,0]];
function liBeamTex(L){L=Math.round(L/12)*12;if(LI_BT[L])return LI_BT[L];const HA=.37,H=2*Math.ceil(L*Math.sin(HA))+2,W=L+2,c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d'),d=g.createImageData(W,H),D=d.data,cy=H/2;const rad=u=>{let i=1;while(i<LI_BR.length-1&&LI_BR[i][0]<u)i++;const A=LI_BR[i-1],B=LI_BR[i],k=clamp((u-A[0])/(B[0]-A[0]),0,1);return A[1]+(B[1]-A[1])*(k*k*(3-2*k));};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const X=x+.5,Y=y+.5-cy,r=Math.hypot(X,Y);if(r>L)continue;const th=Math.abs(Math.atan2(Y,X));if(th>HA)continue;
    const ac=th<.07?1:Math.pow(Math.cos((th-.07)/(HA-.07)*Math.PI/2),2.2),u=r/L,f=rad(u)*(.25+.75*ac)*ac;if(f<.004)continue;const col=nightColAt(LI_FCOL,u),o=(y*W+x)*4;
    D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=Math.round(255*Math.min(1,f*.92));}
  g.putImageData(d,0,0);return LI_BT[L]={c,cy};}
function liBeamDraw(g,ox,oy,fx,fz,a){if(!(a>0))return;const m=Math.hypot(fx,fz)||1;fx/=m;fz/=m;const ang=Math.atan2(fz*.82,fx),sl=Math.hypot(fx,fz*.82);
  const T=liBeamTex(11.8*PPM*(.82+.18*sl));g.save();g.translate(ox,oy);g.rotate(ang);g.globalAlpha=Math.min(1,a);g.drawImage(T.c,0,-T.cy);g.restore();
  // the hot spot where it lands, and the little that spills back off the ground and your hand: just enough to see yourself by
  const hx=ox+fx*6.2*PPM,hy=oy+fz*6.2*PPM*.82;nightPool(g,hx,hy,2.1*PPM,.24*a,LI_FCOL,.7);nightPool(g,ox-fx*4,oy+6-fz*4,2.4*PPM,.34*a,LI_FCOL,.78);}
// your light this frame (called from main.js's light pass): which light, how bright, its pool or its beam, its shadows
function liPlayerLight(t,L,DK){const c=liCur(),on=lanternOn()?1:0;const sput=sputT>0?(Math.random()<.5?.15:.6):1;
  const low=c==='flash'?liS().batt<12:S.fuel<15;const fuelK=low?(.6+.4*Math.random())*(c==='flash'?.55+.45*liS().batt/12:1):1;
  const steady=c==='walt'?.45:1;const fk=lanternFlicker(t)*steady;const k=L*sput*fuelK*(on?1:.12-.09*DK);const lp=lanternPos();
  if(c==='flash'){const kk=on?k:0;if(DK>0)nightLantern(lp,kk,0,DK,{beam:1});if(DK<1)liBeamDraw(lctx,lp.x,lp.y,P.fx,P.fz,.9*kk*(1-DK));
    glowAt(lp.x,lp.y,7,[236,242,255],.95*kk);glowAt(lp.x,lp.y,16,[200,214,246],.35*kk);return;}
  const big=c==='walt'?1.16:1,R=8.5*big*PPM*(.97+.03*fk);
  if(DK>0)nightLantern(lp,k*(.92+.08*fk)*(c==='walt'?1.12:1),fk,DK,{walt:c==='walt'});
  if(DK<1)lanternPool(lp.gx+P.fx*.6*PPM,lp.gy+P.fz*.5*PPM,R,c==='walt'?[255,196,116]:[255,186,104],.95*k*(.92+.08*fk)*(1-DK)*(c==='walt'?1.08:1));
  if(liHoodOn()&&DK<1)lanternPool(lp.gx+P.fx*3*PPM,lp.gy+P.fz*2.4*PPM,4.2*PPM,[255,206,140],.42*k*(1-DK));
  glowAt(lp.x,lp.y,18+2*fk,[255,232,170],.95*k*(c==='walt'?1.08:1));glowAt(lp.x,lp.y,46,[255,170,80],.55*k*(.85+.15*fk));}
// how far your light reaches and whether the Hollow is in it: anywhere in a lantern's round pool (and out ahead in the hood's
// lobe), only inside the flashlight's cone (and the hand's-breadth of spill right by you)
function liRange(){const c=liCur();return c==='flash'?11.6:liHoodOn()?11:c==='walt'?9.4:8.5;}
function liCatch(d,dot){const c=liCur();if(!lanternOn())return {lit:false,range:liRange(),burn:1};
  if(c==='flash')return {lit:(d<11.6&&dot>Math.cos(.27))||d<1.5,range:11.6,burn:1.3};
  const R=c==='walt'?9.4:8.5;let lit=d<R;if(liHoodOn()&&d<11&&dot>Math.cos(.55))lit=true;return {lit,range:liHoodOn()?11:R,burn:c==='walt'?1.1:1};}
// ---------------------------------------------------------------- friends: the light each one carries
function liCode(){const L=liS();return (L.cur==='flash'?'f':L.cur==='walt'?'w':'t')+(liHoodOn()?'h':'')+(lanternOn()?'':'0');}
// ---------------------------------------------------------------- saves: mine alone in a shared farm; old saves read from the story
try{if(typeof PERSONAL!=='undefined'&&!PERSONAL.includes('lit'))PERSONAL.push('lit');}catch(e){}
{const _lg=loadGame;loadGame=function(d){try{if(d&&d.S&&!d.S.lit)delete S.lit;}catch(e){}const r=_lg.apply(this,arguments);try{const any=liMigrate();liS();liChanged();
  if(any&&!(typeof HOST!=='undefined'&&HOST.applying)){const L=liS();const have=LI_KINDS.filter(k=>L.own[k]).map(k=>LI_NAME[k]).concat(L.own.hood?['the hood']:[]);
    setTimeout(()=>{try{toast(`Your lights are in your backpack now: ${have.join(', ')}. You’re carrying ${liText(L.cur)}.`,4.6);}catch(e){}},2600);}}catch(e){}return r;};}
LI_ON=true;
