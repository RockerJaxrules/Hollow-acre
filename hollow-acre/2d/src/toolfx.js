/* ================= tools, drawn by the game: the hoe, pickaxe, axe, watering can and rod, held in the hands the character sheets
   draw, at the grip, angle and layer each frame asks for (META.tool, from px/chibi2.js). Because the game draws them they can reach
   the square you aim at, go behind you when they should, pour water where it lands, and look different once upgraded. ================= */
const TOOL_ART={
 axe:{px:5,art:["....KKK.......","...KDLK.KKK...","...KDLKKmllK..","...KDLKmmmleK.","...KDLKmmmmleK","..KsDLsmmmmmeK","..KsbbsmmmmmeK","..KsDLsmmmmmeK","...KDLKmmmmleK","...KDLKmmmleK.","...KDLKKmllK..","...KDLK.KKK...",
   "...KDLK.......","...KDMK.......","...KDLK.......","...KDLK.......","...KDMK.......","...KDLK.......","...KDLK.......","...KDMK.......","...KDLK.......","...KDLK.......","...KKKK......."]},
 pick:{px:9,art:["......KKKKKK......","....KKllmmmmKK....","..KKllmmbbmmmmKK..",".KllmmKKbbKKmmmsK.","KllmK..KDLK..KmmsK","KlmK...KDLK...KmsK","KlK....KDLK....KsK",".K.....KDLK.....K.",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KDMK.......",".......KDLK.......",".......KDLK.......",".......KKKK......."]},
 hoe:{px:5,art:["....KK.......","...KDLKKKKKK.","...KDLKmmmllK","...KsbbmmmmlK","...KDLKKKmmeK","...KDLK..KmeK","...KDLK...KeK","...KDLK....K.","...KDMK.....","...KDLK.....","...KDLK.....","...KDMK.....","...KDLK.....","...KDLK.....",
   "...KDMK.....","...KDLK.....","...KDLK.....","...KDMK.....","...KDLK.....","...KDLK.....","...KDLK.....","...KDLK.....","...KDLK.....","...KKKK....."]},
 // a watering can seen from the side, spout to the right; the hand holds the top of the handle
 can:{px:5,py:1,art:["...KKKKK........","..KlmmmbK.......","..Km...Kb.......",".KKKKKKKKK....KK","KleelllmmbK..KeK","KelllllmmbK.KlK.","KllllllmmbKKmK..","KlllllmmmbbmbK..","KmllllmmmbbbK...","KmmmmmmmbbsK....",".KbbbbbbbsK.....","..KKKKKKKK......"]}};
const TOOL_PAL={K:[26,16,12],D:[84,52,28],M:[124,82,46],L:[176,126,76],s:[60,64,76],b:[92,98,112],m:[150,156,170],l:[204,210,222],e:[244,248,252]};
// metal by grade: what upgrades look like
const METAL={rust:{s:[66,40,28],b:[108,60,36],m:[148,86,50],l:[184,122,74],e:[212,160,110]},iron:{},
  copper:{s:[88,42,24],b:[138,68,34],m:[194,104,52],l:[230,148,84],e:[252,204,150]},
  steel:{s:[46,58,82],b:[76,98,130],m:[126,154,190],l:[184,208,234],e:[236,246,255]},
  gold:{s:[110,72,14],b:[168,118,24],m:[220,170,40],l:[248,214,90],e:[255,244,180]},
  tin:{s:[70,84,78],b:[104,124,114],m:[148,170,156],l:[192,212,198],e:[232,244,236]}};
function toolGrade(kind){const T=S.tools||{};
  if(kind==='hoe')return (S.hoe||T.hoe||1)>1?'copper':'rust';if(kind==='pick')return (T.pick||1)>2?'gold':(T.pick||1)>1?'steel':'iron';
  if(kind==='axe')return (T.axe||1)>2?'gold':(T.axe||1)>1?'steel':'iron';if(kind==='can')return S.waterMax>10?'copper':'tin';return 'iron';}
// rotate pixel art cleanly (3x3 supersampled, majority vote) about the grip, and remember the result
const TOOL_CACHE=new Map();
function toolStamp(kind,grade,ang,k,mir){ang=Math.round(ang/3)*3;k=Math.round(k*20)/20;const key=kind+grade+ang+'|'+k+(mir?'m':'');let st=TOOL_CACHE.get(key);if(st)return st;
  const T=TOOL_ART[kind],A=T.art,h=A.length,w=A[0].length,px0=T.px,py0=T.py!==undefined?T.py+.5:h-3.5;const pal=Object.assign({},TOOL_PAL,METAL[grade]||{});
  const th=(ang+90)*Math.PI/180,c=Math.cos(th),s=Math.sin(th),R=Math.ceil(Math.hypot(w,h))+2;const N=2*R+1;
  const cv=document.createElement('canvas');cv.width=N;cv.height=N;const g=cv.getContext('2d');const id=g.createImageData(N,N),D=id.data;
  for(let dy=-R;dy<=R;dy++)for(let dx=-R;dx<=R;dx++){const cnt={};let empty=0;
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){const x=dx+(i-1)/3,y=dy+(j-1)/3;let u=x*c+y*s,v=(-x*s+y*c)/k;if(mir)u=-u;const ax=Math.floor(px0+u),ay=Math.floor(py0+v);
      const ch=(ay>=0&&ay<h&&ax>=0&&ax<w)?(A[ay][ax]||'.'):'.';if(ch==='.')empty++;else cnt[ch]=(cnt[ch]||0)+1;}
    if(empty>=5)continue;let best=null,bn=0;for(const ch in cnt)if(cnt[ch]>bn||(cnt[ch]===bn&&ch==='K')){best=ch;bn=cnt[ch];}
    const col=pal[best];const o=((dy+R)*N+(dx+R))*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=255;}
  g.putImageData(id,0,0);st={cv,R};TOOL_CACHE.set(key,st);if(TOOL_CACHE.size>600)TOOL_CACHE.delete(TOOL_CACHE.keys().next().value);return st;}
// the rod: cork grip, reel, a shaft that tapers to the tip. Bamboo, ash, then greenheart.
const ROD_COL=[[[214,188,96],[150,124,54]],[[206,164,112],[134,98,62]],[[86,128,70],[44,74,40]]];
function drawRod(g,gx,gy,ang,k,lvl,fl){const a=ang*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);const L=Math.round(30*k);const [lt,dk]=ROD_COL[Math.max(0,Math.min(2,(lvl||1)-1))];
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
  if(kind==='can'){const tilt=(dir==='W'?-1:1)*ang;const st=toolStamp('can',toolGrade('can'),tilt-90,1,dir==='W');g.drawImage(st.cv,gx-st.R,gy-st.R);
    // the spout's tip, turned with the can
    const sx0=(dir==='W'?-1:1)*(14.5-5),sy0=4.5-1.5,r=tilt*Math.PI/180;return [gx+sx0*Math.cos(r)-sy0*Math.sin(r),gy+sx0*Math.sin(r)+sy0*Math.cos(r)];}
  const grade=o.grade||toolGrade(kind);
  if(f===4&&m.tool[dir][3]){const a0=m.tool[dir][3][2];let a1=ang;if(dir==='W'&&a1>a0)a1-=360;if(dir!=='W'&&a1<a0)a1+=360;if(dir==='E'||dir==='W')drawSmear(g,gx,gy,a0,a1,1,19);}
  const st=toolStamp(kind,grade,ang,k,dir==='W');g.drawImage(st.cv,gx-st.R,gy-st.R);
  const r=ang*Math.PI/180;return [gx+Math.cos(r)*18*k,gy+Math.sin(r)*18*k];}
// the player's fists over the handle, drawn after the tool (from the look's own colours: see custom.js)
const FISTS={};
function fistOverlay(g,nm,dir,f,ox,oy){const im=FISTS[nm];const m=SPR[nm];if(!im||!m||!m.clips||!m.clips.thrust)return;const T=m.tool&&m.tool[dir]&&m.tool[dir][f];if(!T||T[4])return;
  const r=m.clips.thrust[dir];g.drawImage(im,f*m.fw,r[0]*m.fh,m.fw,m.fh,ox,oy,m.fw,m.fh);}
// water falling from the spout onto the square in front
function waterStream(g,from,to,t){const [x0,y0]=from,[x1,y1]=to;const n=14;for(let i=0;i<n;i++){const u=((i/n)+t*2.2)%1;const x=x0+(x1-x0)*Math.sqrt(u),y=y0+(y1-y0)*u*u;
    g.fillStyle=i%3?'rgba(150,205,240,.9)':'rgba(230,246,255,.95)';g.fillRect(Math.round(x),Math.round(y),i%2?1:2,2);}
  g.fillStyle='rgba(210,236,255,.7)';const s=Math.sin(t*30);g.fillRect(Math.round(x1)-2-(s>0?1:0),Math.round(y1),5,1);g.fillRect(Math.round(x1)-1,Math.round(y1)-1+(s>0?0:1),1,1);}
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
