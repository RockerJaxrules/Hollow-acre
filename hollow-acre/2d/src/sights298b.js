/* ================= #298 part five (B3b): the cornfield's stand-in, the fen, the Black Lake and the Weeping Birches, in the
   world as in their close-ups (uses the helpers in sights298.js). ================= */
// ---- the cornfield: the ring of scarecrows had no one in its middle in the world, and the close-up's ring was a different set
// (little plain dolls round a stand-in). The stand-in now stands in the ring's middle in the world, made the way the ring's own
// scarecrows are made, but on a taller post, in your shirt, your hair on the sack, your face painted on it, the label pinned to
// its chest; and the close-up is that ring itself at its own pixel size, the stand-in in the middle with the others round it.
function s98StandIn(){if(S98.standin)return S98.standin;const m=SPR.rg_scare_a,im=m&&IMG[m.src];if(!im||!im.width)return null;const L=sgtLook(),hair=(S.look&&S.look.hair)||'#5a3a20',shirt=L.shirt||'#b8402c';
  const src=document.createElement('canvas');src.width=m.fw;src.height=m.fh;src.getContext('2d').drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);const sd=src.getContext('2d').getImageData(0,0,m.fw,m.fh).data;
  const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh+12;const g=c.getContext('2d'),id=g.createImageData(c.width,c.height),D=id.data;
  const put=(x,y,v)=>{if(x<0||y<0||x>=c.width||y>=c.height)return;const i=(y*c.width+x)*4;D[i]=v[0];D[i+1]=v[1];D[i+2]=v[2];D[i+3]=255;};
  const SR=[sgtShade(shirt,.45),sgtShade(shirt,.7),shirt,sgtShade(shirt,1.2)].map(s98Hex),HR=[sgtShade(hair,.55),hair,sgtShade(hair,1.3)].map(s98Hex);
  for(let y=0;y<m.fh;y++)for(let x=0;x<m.fw;x++){const i=(y*m.fw+x)*4;if(sd[i+3]<128)continue;let v=[sd[i],sd[i+1],sd[i+2]];const r=v[0],gg=v[1],b=v[2],lum=r*.3+gg*.59+b*.11;
    if(y<9&&!(x>=13&&x<=31&&y>=6))continue;   /* no hat */
    if(b>r+15&&b>gg){const k=lum<50?0:lum<80?1:lum<110?2:3;v=SR[Math.max(0,k-((((x>>1)+(y>>1))%2)?1:0))];}   /* your shirt, in checks */
    const yy=y<58?y:y+12;put(x,yy,v);if(y>=58&&y<60)for(let j=0;j<12;j++)put(x,58+j,v);}   /* the post twelve pixels taller */
  for(let y=5;y<11;y++){const hw=y<7?7:9;for(let x=22-hw;x<=22+hw;x++)put(x,y,HR[y<7?2:x<18?2:1]);put(22-hw-1,y,[20,14,10]);put(22+hw+1,y,[20,14,10]);}for(const x of [13,14,30,31])for(let y=10;y<15;y++)put(x,y,HR[0]);   /* your hair on the sack */
  for(let y=10;y<18;y++)for(let x=16;x<=28;x++){if(((x-22)/6.5)**2+((y-13.5)/4.2)**2>1)continue;put(x,y,s98Hex('#d8b090'));}   /* your face, painted on */
  for(const [x,y] of [[19,12],[25,12]]){put(x,y,[30,22,20]);put(x+1,y,[30,22,20]);}for(let x=19;x<=25;x++)put(x,16,s98Hex(x===19||x===25?'#7a2018':'#a02818'));
  g.putImageData(id,0,0);const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};P(15,33,15,7,'#140c06');P(16,34,13,5,'#efe8d8');P(17,36,3,1,'#3a2a1a');P(21,36,2,1,'#3a2a1a');P(24,36,4,1,'#3a2a1a');P(22,31,1,2,'#8a8a92');   /* the label */
  return S98.standin=s98Spr('standin',c,m.ax,m.ay+12);}
function s98CornWorld(){if(typeof RGP==='undefined'||!RGP.cornC)return;let o=S98.cornObj;if(o&&!OBJ.includes(o))o=S98.cornObj=null;
  if(!o){const n=s98StandIn();if(!n)return;o=S98.cornObj=obj(n,RGP.cornC.x+1,RGP.cornC.z+1.4,{kind:'prop',noCol:true});}   // in the ring's middle, a pace to the side of the one behind it
  let on=false;try{const b=sgCurrent();on=!!((S.saga&&S.saga.done&&S.saga.done.corn)||(b&&b.id==='corn'));}catch(e){}o.hide=!on;}
const s98CornArt=SGT_ART.corn;
SGT_ART.corn=function(){try{s98CornWorld();const o=S98.cornObj;if(o){return sgtC('s98g_corn',260,131,(P,g)=>{g.drawImage(s98Raw({x:o.x-.5,z:o.z},260,131,130,134,{}),0,0);});}}catch(e){}
  return s98CornArt.apply(this,arguments);};

// ---- the fen: in the world the body lay alone on the grass; the close-up has it curled on its side at the edge of a black pool with
// its year token, the newest one in your coat beside it, more of them under the water, and a hut close by (the hut is far off
// in the world). The world now has the close-up's own bodies, bank and pool there, at the world's size; the close-up keeps them
// and shows the fen's own grass round them in place of the bare peat and the hut.
const S98_FEN={S:2,ax:35,ay:40};const s98FenArt=SGT_ART.fen;
function s98FenCut(){if(S98.fenCut)return S98.fenCut;const c=s98FenArt&&s98FenArt();if(!c)return null;
  return S98.fenCut=s98Cut(c,['#45311c','#221710','#2d2015'],(x,y)=>false);}
function s98FenObj(){return OBJ.find(o=>(o.spr==='rg_bogbody'||o.spr==='s98_fen')&&typeof RGP!=='undefined'&&Math.hypot(o.x-RGP.bog.x,o.z-RGP.bog.z)<4);}
function s98FenWorld(){if(S98.fenDone)return;const o=s98FenObj(),cut=s98FenCut();if(!o||!cut)return;const c2=document.createElement('canvas');c2.width=cut.width;c2.height=cut.height;const g=c2.getContext('2d');g.drawImage(cut,0,0);g.clearRect(118,0,42,30);   /* the hut stays where it is in the world, far off */
  S98.fenCut2=c2;const w3=document.createElement('canvas');w3.width=c2.width;w3.height=c2.height;const g3=w3.getContext('2d');g3.drawImage(c2,0,0);const id=g3.getImageData(0,0,w3.width,w3.height),q=id.data;
  for(let y=46;y<w3.height;y++)for(let x=0;x<w3.width;x++){const e=((x-80)/(76-Math.sin(y*.3)*3))**2+((y-60)/(44+Math.sin(x*.13)*3))**2;if(e>1)q[(y*w3.width+x)*4+3]=0;}   /* in the world the pool has its own ragged edge all round */
  g3.putImageData(id,0,0);const sm=s98Shrink(w3,S98_FEN.S,{noLine:1});o.spr=s98Spr('fen',sm,S98_FEN.ax/S98_FEN.S,S98_FEN.ay/S98_FEN.S);o.kind='flat';S98.fenDone=1;}
SGT_ART.fen=function(){try{s98FenWorld();const o=s98FenObj(),c=S98.fenCut2;if(o&&c){const d=S98_FEN;return sgtC('s98g_fen',c.width,c.height,(P,g)=>{g.drawImage(f98Ground({x:o.x,z:o.z},c.width,c.height,d.S,d.ax,d.ay,{skip:[o]}),0,0);g.drawImage(c,0,0);});}}catch(e){}
  return s98FenArt.apply(this,arguments);};

// ---- the Black Lake: the close-up was the dock seen side-on at night, though in the world the dock runs out from the north shore
// toward you. The close-up is now the dock's real end over the water, drawn again at twice its size, with the cord tied under its
// last plank going straight down into the water, pulled tight; the water flat and dark, giving nothing back.
const s98LakeArt=SGT_ART.p_lake;
function s98LakeDock(){return typeof LAKE!=='undefined'&&OBJ.find(q=>q.spr==='dock'&&Math.abs(q.x-LAKE.x)<3&&Math.abs(q.z-(LAKE.z-LAKE.rz+1.4))<3);}
function s98LakeWorld(){const o=s98LakeDock();if(!o)return;let c=S98.cordObj;if(c&&!OBJ.includes(c))c=S98.cordObj=null;if(c)return;const m=SPR.dock,cv=document.createElement('canvas');cv.width=7;cv.height=10;const g=cv.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  for(let y=0;y<7;y++)P(3,y,1,1,y%3===0?'#8a7656':'#a8946c');P(0,7,7,1,'#2e4048');P(1,8,5,1,'#1a2a30');P(3,7,1,1,'#6a7a80');   /* the cord from under the last plank, straight down into the water, a ring where it goes in */
  S98.cordObj=obj(s98Spr('cord',cv,3,0),o.x,o.z+(m.fh-m.ay-2)/32,{kind:'flat',noCol:true});}
SGT_ART.p_lake=function(){try{s98LakeWorld();const o=s98LakeDock();if(o){const m=SPR.dock,S=2,cw=160,ch=104,ax=80,ay=36,end=o.z+(m.fh-m.ay-3)/32;
    return sgtC('s98g_lake',cw,ch,(P,g)=>{g.drawImage(f98Ground({x:o.x,z:end},cw,ch,S,ax,ay,{plain:1,skipRe:/^(f98_|rem_|s98_cord)/}),0,0);const id=g.getImageData(0,0,cw,ch),d=id.data;
      g.putImageData(id,0,0);
      const ex=ax,ey=ay+2;P(ex-2,ey,5,2,'#3a2a18');P(ex-1,ey,2,1,'#8a7656');for(let y=ey+2;y<ey+16;y++)P(ex,y,1,1,y%5===0?'#8a7656':'#a8946c');   /* the knot under the last plank, the cord going straight down, taut */
      for(let x=-7;x<=7;x++)P(ex+x,ey+16+Math.round(Math.abs(x)*.25),1,1,Math.abs(x)>4?'#1a2a30':'#2e4048');P(ex,ey+15,1,2,'#6a7a80');});}}catch(e){}
  return s98LakeArt.apply(this,arguments);};

// ---- the Weeping Birches: the close-up was straight poles with cords strung between them; in the world (and in the story) the dolls
// hang on strings from the branches of the dead birches. The close-up is now those birches at their own pixel size, the dolls in their
// branches, and the newest doll the story names hangs lowest, at the height of your face, from the nearer trunk, in the world and
// in the close-up: your hair in a braid, a dress not finished, the needle still in it.
function s98NewDoll(){if(S98.newdoll)return S98.newdoll;const c=document.createElement('canvas');c.width=16;c.height=30;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const hair=(S.look&&S.look.hair)||'#5a3a20';P(2,0,3,2,'#5a4a34');P(3,2,1,7,'#8a8270');   /* tied round a stub on the trunk, the string */
  P(1,9,9,9,'#1a120c');P(2,10,7,7,'#e8dcc8');P(2,10,7,1,'#f8f0e0');P(4,13,1,1,'#2a1a10');P(7,13,1,1,'#2a1a10');P(5,15,2,1,'#8a5040');   /* the stitched face */
  P(2,9,7,2,hair);P(1,10,1,4,hair);P(9,10,1,10,sgtShade(hair,.75));P(9,20,1,2,'#c8a050');   /* your hair, a braid down one side, baling twine at its end */
  P(1,18,9,8,'#1a120c');P(2,18,7,7,'#7a6a8a');P(2,18,7,1,'#9a8aaa');for(const x of [2,4,5,7,8])P(x,25,1,1+(x%2),'#7a6a8a');P(3,22,4,1,'#5a4a6a');   /* the dress, its hem unfinished */
  P(8,21,1,4,'#d0d0d8');P(8,21,1,1,'#ffffff');P(9,24,1,4,'#c8a050');   /* the needle still in it, threaded */
  P(3,26,1,3,'#e8dcc8');P(6,26,1,3,'#e8dcc8');return S98.newdoll=s98Spr('newdoll',c,3,29);}
function s98BirchWorld(){if(typeof RGP==='undefined'||!RGP.dolls)return;let o=S98.dollObj;if(o&&!OBJ.includes(o))o=S98.dollObj=null;
  const t=OBJ.find(q=>q.spr==='rg_dolltree_b'&&Math.hypot(q.x-RGP.dolls.x,q.z-RGP.dolls.z)<8);if(!t)return;
  if(!o){const n=s98NewDoll();o=S98.dollObj=obj(n,t.x+.22,t.z+.05,{kind:'prop',noCol:true});const m=SPR[n];m.ay=29+14;}   /* hung from the trunk at face height */
  let on=false;try{const b=sgCurrent();on=!!((S.saga&&S.saga.done&&S.saga.done.birches)||(b&&b.id==='birches'));}catch(e){}o.hide=!on;}
const s98BirchArt=SGT_ART.birches;
SGT_ART.birches=function(){try{s98BirchWorld();const t=OBJ.find(q=>q.spr==='rg_dolltree_b'&&Math.hypot(q.x-RGP.dolls.x,q.z-RGP.dolls.z)<8);if(t&&S98.dollObj){
    return sgtC('s98g_birches',260,130,(P,g)=>{g.drawImage(s98Raw({x:t.x+2.2,z:t.z},260,130,130,140,{}),0,0);});}}catch(e){}
  return s98BirchArt.apply(this,arguments);};
setInterval(()=>{try{s98CornWorld();s98FenWorld();s98BirchWorld();s98LakeWorld();}catch(e){}},400);

// ---- the Black Lake's low mist was drawn as see-through 6 px squares, which read as missing pieces of the picture: each wisp is now
// a long low bank with flat, stepped edges, as pixel fog is drawn
{const _pd=partsDraw;partsDraw=function(){const keep=[];for(const p of parts)if(p.size===6&&/^rgba\((230|160|220),/.test(p.col))keep.push(p);
  if(keep.length){const left=parts.filter(p=>!keep.includes(p));const all=parts.slice();parts.length=0;parts.push(...left);try{_pd();}finally{parts.length=0;parts.push(...all);}
    for(const p of keep){const x=Math.round(sx(p.x)),y=Math.round(sz(p.z)-p.y*PPM),w=14+Math.round((p.x*7.3%1+1)%1*10);ctx2.globalAlpha=(1-p.t/p.life)*.7;ctx2.fillStyle=p.col;ctx2.fillRect(x-(w>>1),y,w,2);ctx2.fillRect(x-(w>>1)+3,y-1,w-7,1);}ctx2.globalAlpha=1;return;}
  return _pd.apply(this,arguments);};}

// ---- the fen, row two of the critique: the curled body's parts were one brown and merged into a sack; each part now has its own
// value and outline (the thigh lit, the shin in shade, the arm a step lighter, a crease where the thigh meets the body), and what is
// left of a smock over its back says a person; the grass rope and the 1872 token go back over it
function s98FenBody(c){if(!c||c._s98b)return;c._s98b=1;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w||1,h||1);};
  const cx=34,cy=24,s=1.45,f=1,T=(u,v)=>[cx+u*f*s,cy+v*s],C=(a,b,r)=>{const A=T(a[0],a[1]),B=T(b[0],b[1]);return [A[0],A[1],B[0],B[1],r*s];};
  const L=['#1a0e06','#4a2a12','#6a4024','#94643a'],lt=L.map(h=>sgtShade(h,1.14)),dk=L.map((h,i)=>i?sgtShade(h,.78):h),SM=['#1a140c','#4a4232','#5e5442','#7a6e58'];
  sgtBlob(P,[C([6,7],[0,12.5],2.4),C([0,12.5],[-5,13],1.6)],dk);   /* the shin, folded back under */
  sgtBlob(P,[C([-10,2],[-5,-3],4.6),C([-5,-3],[2,-4],4.6),C([2,-4],[8,1],2.6)],L);   /* the curved back */
  sgtBlob(P,[C([-9,1],[-4,-3.4],3.6),C([-4,-3.4],[2,-3.6],3.4)],SM);for(const u of [-8,-5,-2])P(T(u,1.8)[0],T(u,1.8)[1],2,2,SM[1]);   /* what is left of a smock, ragged at its hem */
  sgtBlob(P,[C([-7,4],[6,6],3.5)],lt);const [kx,ky]=T(-6,2.6);for(let i=0;i<9;i++)P(kx+i*1.5,ky+Math.round(i*.15),1,1,'#120804');   /* the thigh, forward to the knee; the crease where it meets the body */
  sgtBlob(P,[C([2,-2],[5.5,4.5],1.8),C([5.5,4.5],[2.5,10],1.6),C([2.5,10],[.8,10.6],1.5)],lt);sgtBlob(P,[C([10.5,4],[10.6,4.1],4.2)],L);
  const D=(u,v,col)=>{const [x,y]=T(u,v);P(x,y,1,1,col);};D(9.2,3.6,L[0]);D(9.2,4.4,L[1]);D(12.2,4.2,L[0]);D(12.9,4.6,L[0]);D(14.6,5.4,L[0]);D(13.2,7,L[1]);for(const [u,v] of [[7.4,1],[8,.2],[9,-.3],[10,-.4],[11,-.2],[7.2,2]])D(u,v,'#8a3a18');
  const [nx,ny]=T(7,-.6);for(let i=0;i<7;i++){const a=.2+i/6*2.8;P(nx+Math.round(Math.cos(a)*2.4),ny+Math.round(Math.sin(a)*1.8),1,1,i%2?'#6a5a2a':'#c8b468');}
  for(let i=0;i<11;i++)P(nx+2+Math.round(i*.9),ny+2+i,1,1,i%2?'#6a5a2a':'#c8b468');
  const tx=nx+6,ty=ny+13;P(tx,ty,20,10,'#2a1a0a');P(tx+1,ty+1,18,8,'#c8a878');P(tx+1,ty+1,18,1,'#e2c89a');P(tx+1,ty+8,18,1,'#9a7a50');P(tx+12,ty-1,2,2,'#2a1a0a');sgtT(P,'1872',tx+2,ty+3,'#2a1406');}
{const _fc=s98FenCut;s98FenCut=function(){const had=S98.fenCut;const c=_fc();if(c&&!had)s98FenBody(c);return c;};}

// ---- the birches, row three: at close-up size the dolls were specks. The close-up is now twice the world's size round the newest
// doll on the nearer trunk, the birch drawn again at that size, and every doll in the picture drawn again by hand there: its cord
// up to the branch, a stitched face, hair, a dress in its own colour with a birthday stitched on the hem, arms and legs; the newest
// with your hair in a braid, its dress unfinished, the needle in it.
const S98_DRESS=['#928294','#7e8ca0','#a27c76','#5e4e60','#4e5a6a','#6a4e4c','#8a9a6a','#7a8a5a'];
function s98DollSpots(spr){const k='dolls_'+spr;if(S98[k])return S98[k];const m=SPR[spr],im=m&&IMG[m.src];if(!im)return [];const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const g=c.getContext('2d');g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);
  const d=g.getImageData(0,0,m.fw,m.fh).data,isD=(x,y)=>{const i=(y*m.fw+x)*4;if(d[i+3]<128)return false;const r=d[i],gg=d[i+1],b=d[i+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);return mx-mn>=16&&mx>70&&!(r<60&&gg<60&&b<60);};   /* the dolls are the only coloured things on a grey and white tree */
  const seen=new Uint8Array(m.fw*m.fh),out=[];for(let y=0;y<m.fh;y++)for(let x=0;x<m.fw;x++){if(seen[y*m.fw+x]||!isD(x,y))continue;const q=[[x,y]];seen[y*m.fw+x]=1;let x0=x,x1=x,y0=y,y1=y,cols={};
    while(q.length){const [a,b2]=q.pop();x0=Math.min(x0,a);x1=Math.max(x1,a);y0=Math.min(y0,b2);y1=Math.max(y1,b2);const i=(b2*m.fw+a)*4,key='#'+[d[i],d[i+1],d[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');cols[key]=(cols[key]||0)+1;
      for(let j=-2;j<=2;j++)for(let i2=-2;i2<=2;i2++){const nx=a+i2,ny=b2+j;if(nx<0||ny<0||nx>=m.fw||ny>=m.fh||seen[ny*m.fw+nx]||!isD(nx,ny))continue;seen[ny*m.fw+nx]=1;q.push([nx,ny]);}}
    if((x1-x0+1)*(y1-y0+1)>=12&&y1-y0<=24&&x1-x0<=14&&y0<m.fh*.72){const dress=Object.entries(cols).sort((p,q2)=>q2[1]-p[1]).map(e=>e[0]).find(h=>{const n=parseInt(h.slice(1),16),r=n>>16,gg=(n>>8)&255,b=n&255;return !(r>190&&gg>180);})||'#928294';out.push({x:(x0+x1)/2,top:y0-3,bot:y1,dress});}}
  return S98[k]=out;}
function s98Doll(P,cx,top,cord,dress,hair,newest){const ol='#140c0a',DR=[sgtShade(dress,.55),sgtShade(dress,.8),dress,sgtShade(dress,1.22)];
  for(let y=top;y<top+cord;y++)P(cx,y,1,1,'#5a4a3a');   /* its cord, down from the branch */
  const hy=top+cord;P(cx-4,hy,9,9,ol);P(cx-3,hy+1,7,7,'#e4d6c0');P(cx-3,hy+1,7,1,'#f6ecdc');P(cx+2,hy+2,1,5,'#c8b8a0');   /* the head, lit from the top left */
  P(cx-4,hy,9,2,hair);P(cx-4,hy+2,1,3,hair);if(newest){P(cx+4,hy+2,2,12,sgtShade(hair,.8));for(let i=0;i<5;i++)P(cx+4+(i%2),hy+3+i*2,1,1,sgtShade(hair,1.25));P(cx+4,hy+14,2,1,'#c8a050');}else P(cx+4,hy+2,1,3,hair);   /* the hair; the newest's in a braid tied off with twine */
  P(cx-2,hy+4,1,1,'#2a1a10');P(cx+1,hy+4,1,1,'#2a1a10');P(cx-1,hy+6,2,1,'#8a5040');   /* stitched eyes, a stitched mouth */
  const dy=hy+9;for(let j=0;j<10;j++){const hw=3+Math.round(j*.35);for(let i=-hw;i<=hw;i++){const u=(i+hw)/(2*hw);P(cx+i,dy+j,1,1,i===-hw||i===hw?ol:u<.3?DR[3]:u<.7?DR[2]:DR[1]);}}   /* the dress, flaring */
  if(newest){for(const i of [-5,-3,-1,2,4])P(cx+i,dy+10,1,1+((i+5)%2),DR[2]);P(cx-4,dy+7,7,1,DR[0]);P(cx+4,dy+4,1,6,'#d0d0d8');P(cx+4,dy+4,1,1,'#ffffff');P(cx+5,dy+9,1,5,'#c8a050');}   /* unfinished: the hem raw and uneven, the needle still in it, threaded */
  else{for(let i=-5;i<=5;i+=2)P(cx+i,dy+8,1,1,DR[0]);P(cx-6,dy+9,13,1,ol);}   /* a birthday stitched round the hem */
  P(cx-6,dy+1,2,4,DR[2]);P(cx+5,dy+1,2,4,DR[1]);P(cx-6,dy+5,2,2,'#e4d6c0');P(cx+5,dy+5,2,2,'#d4c6b0');   /* arms and hands */
  P(cx-2,dy+(newest?11:10),2,4,'#e4d6c0');P(cx+1,dy+(newest?11:10),2,4,'#d4c6b0');P(cx-2,dy+(newest?15:14),2,1,ol);P(cx+1,dy+(newest?15:14),2,1,ol);}   /* legs, feet */
{const _ba=SGT_ART.birches;SGT_ART.birches=function(){try{s98BirchWorld();const t=OBJ.find(q=>q.spr==='rg_dolltree_b'&&Math.hypot(q.x-RGP.dolls.x,q.z-RGP.dolls.z)<8),nd=S98.dollObj;if(t&&nd){
    const S=2,cw=240,ch=131,m=SPR.rg_dolltree_b,dm=SPR[nd.spr],fy=nd.z*PPM-dm.ay,cxw=nd.x*PPM,ax=cw/2,ay=ch+26;   /* the newest doll's feet at the foot of the picture, the doll above it whole */
    return sgtC('s98g_birches2',cw,ch,(P,g)=>{const at={x:nd.x,z:nd.z};g.drawImage(f98Ground(at,cw,ch,S,ax,ay,{skip:[nd],frontZ:nd.z+.5}),0,0);
      const W2=(wx,wy)=>[ax+(wx-nd.x*PPM)*S,ay+(wy-nd.z*PPM)*S];const hair=(S.look&&S.look.hair)||'#5a3a20';let n=0;
      for(const q of [t]){   /* the tree in the picture (a neighbour's edge is left out of the picture, so its dolls are too) */
        const mm=SPR[q.spr];for(const sp of s98DollSpots(q.spr)){const [X,Y]=W2(q.x*PPM-mm.ax+sp.x,q.z*PPM-mm.ay+sp.top);const [,Yb]=W2(0,q.z*PPM-mm.ay+sp.bot);
        if(X<-10||X>cw+10||Yb<0||Y>ch)continue;const dy=Yb-Y-34;s98Doll(P,Math.round(X),Math.round(Y),Math.max(3,dy),sp.dress,['#3a2a1a','#c8a050','#5a3a20','#1a1410','#8a5a30'][n++%5],false);}}
      const [X,Y]=W2(cxw,fy);s98Doll(P,Math.round(X+6),Math.round(Y)+2,10,'#7a6a8a',hair,true);});}}catch(e){}
  return _ba.apply(this,arguments);};}

// ---- the cornfield, row one: standing corn round the ring in the world (the story's ring is in the middle of the corn), drawn
// only where nothing else stands and leaving the four ways in clear; and the close-up is the stand-in at twice the world's size,
// from the corn behind it to its chest: your hair, your face painted on the sack with care, your check shirt, the label on its chest
// in Grandpa's hand, STAND-IN, and the ring's nearest scarecrows to either side, their sacks stitched and stuffed.
function s98CornRing(){if(S98.cornRing||typeof RGP==='undefined'||!RGP.cornC||!SPR.corn_2)return;const cx=RGP.cornC.x,cz=RGP.cornC.z+1.7;S98.cornRing=[];
  for(const [r0,st] of [[6.4,0],[7.6,.5]])for(let a=0;a<360;a+=11){const aa=a+st*11,dg=((aa%90)+90)%90;if(dg<16||dg>74)continue;   /* the four ways in stay clear */
    const rr=r0+((a*7)%5)*.12,x=cx+Math.cos(aa*Math.PI/180)*rr,z=cz+Math.sin(aa*Math.PI/180)*rr*.8;
    if(OBJ.some(o=>!o.room&&!o.hide&&o.kind!=='flat'&&Math.hypot(o.x-x,o.z-z)<.7))continue;try{if(LAYERS.water(x,z))continue;}catch(e){}
    S98.cornRing.push(obj('corn_2',x,z,{kind:'prop',noCol:true,flip:((a*13)%2)===1}));}}
const s98CornArt2=SGT_ART.corn;
SGT_ART.corn=function(){try{s98CornRing();s98CornWorld();const o=S98.cornObj;if(o){const S=2,cw=240,ch=131,m=SPR[o.spr],ax=cw/2;
    return sgtC('s98g_corn2',cw,ch,(P,g)=>{const top=ch-46*S;   /* the stand-in's sprite row 46 (below the label) at the picture's foot */g.drawImage(f98Ground({x:o.x,z:o.z},cw,ch,S,ax,top+m.ay*S,{frontZ:o.z+.4}),0,0);   /* the stand-in itself is part of the world drawn again here */
      const X0=ax-m.ax*S,Y0=top;   /* sprite pixel (u,v) is at X0+u*2, Y0+v*2 */
      const L=sgtLook(),shirt=L.shirt||'#b8402c',hair=(S.look&&S.look.hair)||'#5a3a20',Q=(u,v,w,h,c)=>P(X0+u*S,Y0+v*S,w,h,c);
      const sid=IMG[m.src].getContext?IMG[m.src].getContext('2d').getImageData(0,0,m.fw,m.fh).data:null,sr=s98Hex(shirt),isShirt=(u,v)=>{if(!sid)return false;const i=(v*m.fw+u)*4;if(sid[i+3]<200)return false;const r=sid[i],gg=sid[i+1],b=sid[i+2];return Math.abs(r*sr[1]-gg*sr[0])<9000&&Math.abs(r*sr[2]-b*sr[0])<9000&&r+gg+b>60&&!(u<4||u>40);};
      for(let v=22;v<50;v++)for(let u=5;u<39;u++){if(!isShirt(u,v)||!isShirt(u+1,v)||!isShirt(u,v+1))continue;if((u*2)%8===0)Q(u,v,1,2,sgtShade(shirt,.62));if((v*2)%8===0)Q(u,v,2,1,sgtShade(shirt,.62));}   /* the check of the shirt, fine at this size, only on the shirt */
      for(let u=13;u<32;u+=1)if(u%2)Q(u,5,1,2,sgtShade(hair,1.3));for(const u of [14,16,29,31])Q(u,11,1,6,sgtShade(hair,.7));   /* strands of your hair */
      Q(18,12,2,1,'#f6eedc');Q(24,12,2,1,'#f6eedc');Q(19,12,1,1,'#3a2a1a');Q(25,12,1,1,'#3a2a1a');Q(19,15,7,1,'#c83828');Q(20,16,5,1,'#8a1a14');Q(21,14,2,1,'#c89878');   /* the painted face: eyes with a white each, the red mouth, the nose */
      for(let u=13;u<32;u+=2)Q(u,9,1,1,'#7a6040');   /* the seam stitched across the sack */
      P(X0+14*S-4,Y0+33*S-2,38,14,'#140c06');P(X0+14*S-3,Y0+33*S-1,36,12,'#efe8d8');P(X0+14*S-3,Y0+33*S-1,36,1,'#ffffff');sgtT(P,'STAND-IN',X0+14*S-2,Y0+33*S+2,'#3a2414');P(X0+22*S,Y0+31*S,2,4,'#8a8a92');   /* the label, in Grandpa's hand */
      for(const [u,v] of [[2,27],[40,27],[2,31],[40,31]])for(let i=0;i<4;i++)Q(u+(i%2),v+i,1,2,i%2?'#c8a050':'#9a7a30');});}}catch(e){}
  return s98CornArt2.apply(this,arguments);};
setInterval(()=>{try{s98CornRing();}catch(e){}},700);
