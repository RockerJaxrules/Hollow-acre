/* ================= #298 part four: the story's things in the world look like their close-ups, and each close-up stands on the
   ground the thing really lies on. The open graves showed an empty black hole in the world while their close-ups showed what lies
   in them; Ida's jars stood in two even rows of three where the close-up has four over three; the well's pail was a little tan tub
   where the close-up pulls up a grey staved bucket with iron hoops. Each world thing is now drawn from its close-up's own layout
   (the same shapes, colours, count and facing, at the world's size), and behind each close-up is the world's own ground at that
   spot (the grass and the gravestones round the grave, Ida's brick wall behind her shelves), drawn again at the close-up's own
   pixel size by f98Ground (found298c.js). The picture of the thing itself is unchanged. ================= */
const S98={};
// a canvas sprite the world draws like any other, anchored at (ax,ay)
function s98Spr(id,c,ax,ay){const src='s98:'+id;IMG[src]=c;SPR['s98_'+id]={src,fw:c.width,fh:c.height,ax:Math.round(ax),ay:Math.round(ay),foot:[0,0,0,0]};return 's98_'+id;}
const s98Hex=h=>{const n=parseInt(h.slice(1,7),16);return [n>>16,(n>>8)&255,n&255];};
// the close-up's own picture with its plain backdrop taken out (the colours listed), so the world can show through
function s98Cut(c,keys,keep){const o=document.createElement('canvas');o.width=c.width;o.height=c.height;const g=o.getContext('2d');g.drawImage(c,0,0);
  const id=g.getImageData(0,0,c.width,c.height),d=id.data,K=keys.map(s98Hex);
  for(let i=0;i<d.length;i+=4){const x=(i>>2)%c.width,y=((i>>2)/c.width)|0;if(keep&&keep(x,y))continue;for(const k of K)if(d[i]===k[0]&&d[i+1]===k[1]&&d[i+2]===k[2]){d[i+3]=0;break;}}
  g.putImageData(id,0,0);return o;}
// a close-up drawn at S times the world, shrunk back to the world's size: each world pixel takes the colour covering most of it
// (a dark line keeps its place if it covers a third), and one outline goes round the whole, a darker step of its own colour
function s98Shrink(c,S,o){o=o||{};const W=Math.ceil(c.width/S),H=Math.ceil(c.height/S),sd=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  const out=document.createElement('canvas');out.width=W;out.height=H;const g=out.getContext('2d'),id=g.createImageData(W,H),D=id.data,lum=(r,gg,b)=>r*.3+gg*.59+b*.11;
  for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const votes=new Map();let cov=0,tot=0;
    for(let v=Math.floor(Y*S);v<Math.min(c.height,Math.ceil((Y+1)*S));v++)for(let u=Math.floor(X*S);u<Math.min(c.width,Math.ceil((X+1)*S));u++){
      const wx=Math.min(u+1,(X+1)*S)-Math.max(u,X*S),wy=Math.min(v+1,(Y+1)*S)-Math.max(v,Y*S),w=wx*wy;if(w<=0)continue;tot+=w;const i=(v*c.width+u)*4;if(sd[i+3]<128)continue;cov+=w;
      const k=(sd[i]<<16)|(sd[i+1]<<8)|sd[i+2];votes.set(k,(votes.get(k)||0)+w);}
    if(!tot||cov/tot<(o.cov||.45))continue;let best=0,bw=-1,dark=-1,dw=0;for(const [k,w] of votes){if(w>bw){bw=w;best=k;}const L=lum(k>>16,(k>>8)&255,k&255);if(L<40&&w>dw){dw=w;dark=k;}}
    if(dark>=0&&dw>=cov*.34)best=dark;const t=(Y*W+X)*4;D[t]=best>>16;D[t+1]=(best>>8)&255;D[t+2]=best&255;D[t+3]=255;}
  if(!o.noLine){const A=new Uint8Array(W*H);for(let i=0;i<W*H;i++)A[i]=D[i*4+3]>0;
    for(let Y=0;Y<H;Y++)for(let X=0;X<W;X++){const i=Y*W+X;if(!A[i])continue;const e=(X===0||!A[i-1])||(X===W-1||!A[i+1])||(Y===0||!A[i-W])||(Y===H-1||!A[i+W]);if(!e)continue;
      const r=D[i*4],gg=D[i*4+1],b=D[i*4+2];if(lum(r,gg,b)<40)continue;const lit=(X===0||!A[i-1])&&!(Y===H-1||!A[i+W])||(Y===0||!A[i-W])&&!(X===W-1||!A[i+1]);const k=lit?.62:.4;   // lit at the top left
      D[i*4]=Math.round(r*k);D[i*4+1]=Math.round(gg*k);D[i*4+2]=Math.round(b*k*1.08);}}
  if(o.glass){const A=new Uint8Array(W*H),Q=[];for(let i=0;i<W*H;i++)if(!D[i*4+3]&&(i%W===0||i%W===W-1||i<W||i>=W*(H-1))){A[i]=1;Q.push(i);}   // a hole the outside can't reach is glass
    while(Q.length){const i=Q.pop(),x=i%W;for(const j of [x>0?i-1:-1,x<W-1?i+1:-1,i-W,i+W]){if(j<0||j>=W*H||A[j]||D[j*4+3])continue;A[j]=1;Q.push(j);}}
    const gr=o.glassIn||[0,0,W,H];for(let i=0;i<W*H;i++)if(!D[i*4+3]&&!A[i]&&i%W>=gr[0]&&i%W<gr[2]&&((i/W)|0)>=gr[1]&&((i/W)|0)<gr[3]){const c=s98Hex(o.glass);D[i*4]=c[0];D[i*4+1]=c[1];D[i*4+2]=c[2];D[i*4+3]=255;}}
  g.putImageData(id,0,0);if(o.paint)o.paint((x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);});return out;}
// the close-up: the world's ground round the point at (the thing's own world object left out), with the thing's own picture on top
function s98OnGround(key,cut,at,S,ax,ay,skip){if(!at||typeof f98Ground!=='function')return null;
  return sgtC(key,cut.width,cut.height,(P,g)=>{const bg=f98Ground(at,cut.width,cut.height,S,ax,ay,{skip:skip||[],frontZ:at.z});g.drawImage(bg,0,0);g.drawImage(cut,0,0);if(bg.front)g.drawImage(bg.front,0,0);});}
const s98Beat=id=>{const o=typeof SGW!=='undefined'&&SGW.objs[id];return o&&o[0]?o[0]:null;};

// ---- the open graves. The close-ups' own pit, body, spoil and spade, with the grass round them taken from the graveyard itself
// (the stones either side, the blood on the grass); in the world the same pit with the same thing lying in it.
const S98_GRAVE={graves:{S:2.5,ax:85,ay:95.5,pit:[24,26,92,62],paint:(P)=>{P(32,16,10,6,'#1a120a');P(33,17,8,4,'#f2ead2');P(33,17,8,1,'#ffffff');P(34,18,4,1,'#6a5a6e');P(34,20,6,1,'#6a5a6e');}},   // FOR LATER: at this size two strokes, not letters
  yourgrave:{S:2,ax:88,ay:92,pit:[14,22,124,64]}};
// the close-up's own drawing with no grass under it: sgtPit's pit, its lips and walls only (the grass and tufts round it go)
const S98_PITKEY={graves:'a_graves',yourgrave:'a_yourgrave2'};
function s98GraveCut(id){const k='cut_'+id;if(S98[k])return S98[k];const fn=SGT_ART['_s98_'+id],kk=S98_PITKEY[id];if(!fn)return null;
  const save=SGT[kk],op=sgtPit;delete SGT[kk];let c=null;
  try{sgtPit=function(P,w,h,px,py,pw,ph,seed){const G=SGT_GRASS,far=(x,y)=>y>=py-2&&y<py&&x>=px-1&&x<=px+pw,near=(x,y)=>y>=py+ph&&y<py+ph+2&&x>=px-1&&x<=px+pw;
      op((x,y,ww,hh,c)=>{const X=Math.round(x),Y=Math.round(y);if(c===G[1]||c===G[2]||(c===G[3]&&!far(X,Y))||(c===G[0]&&!near(X,Y)))return;P(x,y,ww,hh,c);},w,h,px,py,pw,ph,seed);};
    c=fn();}finally{sgtPit=op;delete SGT[kk];if(save)SGT[kk]=save;}
  if(c)s98Apron(c,S98_GRAVE[id].pit);return S98[k]=c;}
// the dug earth round the hole: a ragged lip of turned soil under everything, with a few lit clods, so it reads as a hole dug in the grass
function s98Apron(c,[px,py,pw,ph]){const g=c.getContext('2d'),id=g.getImageData(0,0,c.width,c.height),d=id.data;
  for(let y=py-9;y<py+ph+9;y++)for(let x=px-9;x<px+pw+9;x++){if(x<0||y<0||x>=c.width||y>=c.height)continue;const i=(y*c.width+x)*4;if(d[i+3])continue;
    const dx=Math.max(px-x,0,x-(px+pw-1)),dy=Math.max(py-y,0,y-(py+ph-1)),dd=Math.hypot(dx,dy),r=2.6+f98N(x/5,y/4,17)*4.2;if(dd<=0||dd>r)continue;
    const h=sgtH(x>>1,y),lit=h<9&&dd<r-1.5,c2=dd>r-1?'#3a2818':lit?'#7a5c3a':f98N(x/7,y/5,23)>.5?'#56402a':'#4c3622';const v=s98Hex(c2);d[i]=v[0];d[i+1]=v[1];d[i+2]=v[2];d[i+3]=255;
    if(lit&&y+1<c.height&&!d[i+c.width*4+3]){const u=s98Hex('#33231a'),j=i+c.width*4;d[j]=u[0];d[j+1]=u[1];d[j+2]=u[2];d[j+3]=255;}}
  g.putImageData(id,0,0);}
for(const id of ['graves','yourgrave']){const orig=SGT_ART[id];if(!orig)continue;SGT_ART['_s98_'+id]=orig;
  SGT_ART[id]=function(){try{const o=s98Beat(id),cut=s98GraveCut(id),d=S98_GRAVE[id];if(o&&cut){const im=s98OnGround('s98g_'+id+'_'+Math.round(o.x*10)+'_'+Math.round(o.z*10),cut,{x:o.x,z:o.z},d.S,d.ax,d.ay,[o]);if(im)return im;}}catch(e){}
    return orig.apply(this,arguments);};}
// the world's grave: the same picture at the world's size
function s98GraveSpr(id){const n='grave_'+id;if(SPR['s98_'+n])return 's98_'+n;const cut=s98GraveCut(id),d=S98_GRAVE[id];if(!cut)return null;
  const c=s98Shrink(cut,d.S,{paint:d.paint}),[px,py,pw,ph]=d.pit,g=c.getContext('2d'),x0=Math.round(px/d.S),y0=Math.round(py/d.S),x1=Math.round((px+pw)/d.S),y1=Math.round((py+ph*.3)/d.S);
  const im=g.getImageData(x0,y0,x1-x0,y1-y0);for(let i=0;i<im.data.length;i+=4){im.data[i]*=.72;im.data[i+1]*=.7;im.data[i+2]*=.74;}g.putImageData(im,x0,y0);   // the far wall a step darker: at this size it is a hole's shadowed side, not a plank
  return s98Spr(n,c,d.ax/d.S,d.ay/d.S);}

// ---- Ida's jars: two shelves, four jars over two and the big empty one with this year's label, as in the close-up. They stand
// against her front wall (the close-up shows the wall behind them), so the world shelf moves back to stand just in front of the wall, clear of the window.
const S98_JARS={S:3},s98JarsArt=SGT_ART.jars;
function s98JarsCut(){if(S98.jars)return S98.jars;const c=s98JarsArt&&s98JarsArt();if(!c)return null;
  // the plain dark pantry behind them goes; so does the wall seen through the empty jar (the world's wall shows through the glass)
  const o=s98Cut(c,['#2a1c14','#33241a','#2e2016']),g=o.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  for(const x of [1,144]){P(x,6,5,98,'#120a06');P(x+1,7,3,97,'#5a3a22');P(x+1,7,1,97,'#8a6040');P(x+3,7,1,97,'#3e2816');P(x,6,5,1,'#0e0806');P(x+1,7,3,1,'#a87a50');}   // the shelf's two uprights, standing on the ground
  return S98.jars=o;}

// ---- the well's pail: the close-up pulls up a grey staved bucket with iron hoops on an iron bail; the world's pail is now the same
// bucket (it hung as a little tan tub). While the well is the thing to go and see, a strand of hair hangs over its rim.
function s98Pail(g,ox,oy,hair){const P=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(ox+x,oy+y,w,h);},O='#120a06';
  P(-5,-3,1,3,O);P(5,-3,1,3,O);P(-4,-4,9,1,O);P(-4,-3,9,1,'#4a4a54');P(-4,-3,3,1,'#8a8a96');   // the iron bail, up to the rope
  P(-4,0,9,1,O);P(-5,1,1,2,O);P(5,1,1,2,O);P(-4,1,1,1,'#a8a498');P(-3,1,7,1,'#0c1014');P(4,1,1,1,'#6a665a');P(-4,2,9,1,'#8a867a');P(-4,2,3,1,'#b0ac9e');   // the rim: dark water inside, the front lip lit
  for(let y=3;y<10;y++){const w=y<6?5:4;P(-w-1,y,1,1,O);P(w+1,y,1,1,O);for(let x=-w;x<=w;x++){const u=(x+w)/(2*w);P(x,y,1,1,u<.25?'#7a766a':u<.7?'#66625a':'#4e4b44');}}   // grey staves, narrowing to the foot
  P(-4,10,9,1,O);P(-5,4,11,1,'#2c2c34');P(-4,4,3,1,'#7a7a86');P(-4,7,9,1,'#2c2c34');P(-3,7,2,1,'#7a7a86');P(-2,3,1,1,'#4a4740');P(1,5,1,1,'#4a4740');P(2,8,1,1,'#4a4740');   // two iron hoops, stave joints
  if(hair){P(1,0,4,2,O);P(5,1,2,8,O);P(1,1,4,1,hair[2]||'#8a6040');P(5,2,1,6,hair[2]||'#8a6040');P(6,3,1,5,hair[1]||'#5a3a20');}}   // a strand of hair over the rim
function s98WellSprite(){const m=SPR.well;if(!m||!IMG[m.src]||S98.wellDone)return;const im=IMG[m.src];if(!im.width)return;
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
  // the old tub (x 33..41, y 45..50 of each frame) is cut away and the bucket drawn in its place, hanging from the same rope
  for(let fx=0;fx+m.fw<=im.width;fx+=m.fw){for(let y=45;y<51;y++){const ref=g.getImageData(fx+30,y,1,1).data;g.fillStyle=`rgba(${ref[0]},${ref[1]},${ref[2]},${ref[3]/255})`;g.clearRect(fx+33,y,9,1);g.fillRect(fx+33,y,9,1);}s98Pail(g,fx+36,43,null);}
  S98.wellPlain=c;const c2=document.createElement('canvas');c2.width=c.width;c2.height=c.height;const g2=c2.getContext('2d');g2.drawImage(c,0,0);
  const hair=typeof st37Ramp==='function'?st37Ramp(S.look&&S.look.hair):null;for(let fx=0;fx+m.fw<=im.width;fx+=m.fw)s98Pail(g2,fx+36,43,hair||['#3a2414','#5a3a20','#8a6040','#b08a58']);
  S98.wellHair=c2;IMG['s98:well']=c;IMG['s98:well_hair']=c2;S98.wellSrc=m.src;S98.wellDone=1;}
{const _ds=drawSpr;drawSpr=function(name,x,y,clip,dir,frame,o){if(name==='well'&&S98.wellDone){const m=SPR.well,keep=m.src;
    let cur=false;try{cur=typeof sgCurrent==='function'&&sgCurrent()&&sgCurrent().id==='well';}catch(e){}
    m.src=cur?'s98:well_hair':'s98:well';try{return _ds.apply(this,arguments);}finally{m.src=keep;}}
  return _ds.apply(this,arguments);};}

// ---- put the new world things in place once the story has made them
{const _sp=sgProps;sgProps=function(){const r=_sp.apply(this,arguments);try{
    for(const id of ['graves','yourgrave']){const o=s98Beat(id);if(o&&o.spr==='g_grave'){const n=s98GraveSpr(id);if(n){o.spr=n;if(id==='graves')o.x+=.35;}}}   // the small grave clear of the stone in front of it
    const j=s98Beat('jars');if(j&&!j._s98){const cut=s98JarsCut();if(cut){const c=s98Shrink(cut,S98_JARS.S,{glass:'#2e3438',glassIn:[32,18,42,31]});/* only the empty jar is glass */j.spr=s98Spr('jars',c,c.width/2,c.height-1);
      const h=OBJ.find(q=>q.spr&&/^house/.test(q.spr)&&Math.abs(q.x-j.x+1.6)<.6&&q.z<j.z&&j.z-q.z<2.5);if(h){j.z=h.z+.34;j.x=h.x+1.3;}j._s98=1;}}
  }catch(e){}return r;};}
// the jars' close-up: the shelves on the world's own wall and ground
{const _ja=SGT_ART.jars;SGT_ART.jars=function(){try{const o=s98Beat('jars'),cut=s98JarsCut();if(o&&o._s98&&cut){const m=SPR[o.spr];
      const im=s98OnGround('s98g_jars_'+Math.round(o.x*10)+'_'+Math.round(o.z*10),cut,{x:o.x,z:o.z},S98_JARS.S,m.ax*S98_JARS.S,m.ay*S98_JARS.S,[o]);if(im)return im;}}catch(e){}
    return _ja.apply(this,arguments);};}
setInterval(()=>{try{if(!S98.wellDone&&typeof SPR!=='undefined'&&SPR.well&&IMG[SPR.well.src]&&IMG[SPR.well.src].complete!==false)s98WellSprite();}catch(e){}},500);

// ---- (B2) the world itself at its own pixel size round a point, for close-ups drawn at the world's scale: its ground chunks as they
// are and the things standing there drawn as the world draws them (nothing re-textured: at 1:1 there is nothing to enlarge)
function s98Raw(at,cw,ch,ax,ay,opt){opt=opt||{};const skip=opt.skip||[],X0=Math.round(at.x*PPM-ax),Y0=Math.round(at.z*PPM-ay);
  const out=document.createElement('canvas');out.width=cw;out.height=ch;const g=out.getContext('2d');g.imageSmoothingEnabled=false;
  for(let kz=Math.floor(Y0/CH);kz<=Math.floor((Y0+ch)/CH);kz++)for(let kx=Math.floor(X0/CH);kx<=Math.floor((X0+cw)/CH);kx++){try{g.drawImage(chunk(kx,kz),kx*CH-X0,kz*CH-Y0);}catch(e){}}
  const L=[];for(const q of OBJ){if(q.room||q.hide||skip.includes(q)||!q.spr)continue;const m=SPR[q.spr];if(!m||!IMG[m.src])continue;const X=q.x*PPM,Y=q.z*PPM;
    if(X-m.ax>X0+cw||X-m.ax+m.fw<X0||Y-m.ay>Y0+ch||Y-m.ay+m.fh<Y0)continue;L.push(q);}
  L.sort((a,b)=>((a.kind==='flat')-(b.kind==='flat'))*-1e6+(a.z-b.z));for(const q of L){const m=SPR[q.spr],top=q.z*PPM-m.ay,vis=Math.min(top+m.fh,Y0+ch)-Math.max(top,Y0);if(q.kind!=='flat'&&vis<m.fh*.35)continue;   /* a thing mostly outside the picture is left out, not shown as a sliver */
    try{drawSpr(q.spr,q.x*PPM-X0,q.z*PPM-Y0,undefined,undefined,0,{ctx:g,flip:q.flip});}catch(e){}}
  return out;}

// ---- Sheriff Dunn's list: the close-up is the list and the photographs pinned to his front door. In the world his door showed
// nothing; now, while the list is the thing to go and see, the same list and photographs are pinned there (small, below the door's
// window), and the close-up's door takes the colour of his real one (dark slate planks, not green panels).
const S98_LIST={S:6,ax:13,ay:36,door:['#0c0a0e','#17151b','#26222a','#38323e']};
const s98ListArt=SGT_ART.dunnlist;
function s98ListCut(){if(S98.list)return S98.list;const c=s98ListArt&&s98ListArt();if(!c)return null;
  const o=document.createElement('canvas');o.width=c.width;o.height=c.height;const g=o.getContext('2d');g.drawImage(c,0,0);const id=g.getImageData(0,0,c.width,c.height),d=id.data;
  for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2],L=r*.3+gg*.59+b*.11;if(gg>r+3&&gg>=b-3&&L<90)d[i+3]=0;}   // the green door goes: what is left is what is pinned to it
  g.putImageData(id,0,0);return S98.list=o;}
// the close-up's door is Dunn's own: dark slate planks (his door's seams, six times its size) and its pale frame at the sides, the list,
// the knife and the photographs pinned on it as they were, each with a thin shadow on the wood
function s98ListArtSlate(){if(S98.listSlate)return S98.listSlate;const cut=s98ListCut();if(!cut)return null;
  const o=document.createElement('canvas');o.width=cut.width;o.height=cut.height;const g=o.getContext('2d'),P=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  P(0,0,152,104,'#26222a');
  for(const [x0,x1] of [[3,30],[32,66],[68,102],[104,147]]){P(x0,0,1,104,'#38323e');for(const [gx,gy,gl] of [[x0+7,8,30],[x0+14,52,26],[x0+(x1-x0>>1),20,40]])if(gx<x1-2)P(gx,gy+sgtH(x0,gl)%9,1,gl,'#2c2830');}   /* each plank lit on its left, two or three long faint grain lines */
  for(const x of [30,66,102])P(x,0,2,104,'#0c0a0e');for(const x of [32,68,104])P(x-0,0,1,104,'#17151b');
  P(0,0,3,104,'#766255');P(0,0,1,104,'#a9987f');P(3,0,1,104,'#0c0a0e');P(147,0,1,104,'#0c0a0e');P(148,0,4,104,'#766255');P(148,0,1,104,'#a9987f');   /* the frame either side */
  const id=cut.getContext('2d').getImageData(0,0,cut.width,cut.height).data;for(let y=0;y<103;y++)for(let x=0;x<151;x++){const i=(y*cut.width+x)*4,j=((y+1)*cut.width+x+1)*4;if(id[i+3]>200&&id[j+3]<100)P(x+1,y+1,1,1,'rgba(8,6,10,.55)');}
  g.drawImage(cut,0,0);for(let y=0;y<104;y++)for(let x=0;x<152;x++){const d=Math.min(x,151-x,y,103-y);if(d<5)P(x,y,1,1,`rgba(0,0,0,${(5-d)*.06})`);}
  return S98.listSlate=o;}
SGT_ART.dunnlist=function(){try{const c=s98ListArtSlate();if(c)return c;}catch(e){}return s98ListArt.apply(this,arguments);};
// the world's list on his door, drawn at the door's own size in the close-up's layout: the paper with its lines and the red name at
// the foot, the knife's handle, six pale photographs in two rows of three, the seventh under them, and the bright polaroid
function s98ListSprite(){const c=document.createElement('canvas');c.width=26;c.height=18;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const sh=(x,y,w,h)=>{P(x+1,y+h,w,1,'rgba(8,6,10,.6)');P(x+w,y+1,1,h,'rgba(8,6,10,.6)');};
  sh(2,2,8,13);P(2,2,8,13,'#140c06');P(3,3,6,11,'#e8e0cc');P(3,3,6,1,'#f8f2e2');for(const [y,w] of [[5,5],[7,4],[9,5],[11,3]])P(3+1,y,w-1,1,'#8a8070');P(4,13,3,1,'#7a1a14');   /* the list, YOU in red at its foot */
  P(9,2,2,1,'#d0d4da');P(11,1,1,1,'#5a3820');P(12,0,2,1,'#3a2414');   /* the knife going in at the top corner */
  const card=(x,y,c)=>{sh(x,y,3,4);P(x,y,3,4,c);P(x+1,y+1,1,2,'#3a2a1a');};
  card(13,1,'#d8c49c');card(17,1,'#ccb690');card(21,1,'#c4ac86');card(13,6,'#bca27c');card(17,6,'#b49a74');card(21,6,'#ac926c');card(13,11,'#a48a64');
  sh(17,11,7,6);P(17,11,7,6,'#f4f0e6');P(18,12,5,3,'#1a2030');P(19,13,3,1,'#6a5a8a');P(18,14,1,1,'#c86a20');   /* the polaroid: you asleep, the stove's glow in its corner */
  return c;}
function s98ListWorld(){if(typeof SG==='undefined'||!SG.list||typeof TB==='undefined'||!TB.dunn)return;let o=S98.listObj;if(o&&!OBJ.includes(o))o=S98.listObj=null;   // the world was built again
  if(!o){const n=s98Spr('list',s98ListSprite(),S98_LIST.ax,S98_LIST.ay);o=S98.listObj=obj(n,TB.dunn[1],TB.dunn[2]+.002,{kind:'prop',noCol:true});}
  let cur=false;try{const b=sgCurrent();cur=!!(b&&b.id==='list');}catch(e){}o.hide=!cur;}   // pinned there only until he locks it away

// ---- the scarecrow you bound the Hollow into: its close-up was a straw doll with a sack face and a hat, nothing like the pumpkin-
// headed scarecrow in your field. The close-up is now that scarecrow itself, at its own pixel size, its head turned to you the way
// it turns when you come near, on the field it stands in; from the night it turned its head, its carved face runs wet and dark, in
// the world as in the close-up.
function s98ScareSheet(){if(S98.scareWet)return S98.scareWet;const m=SPR.scarecrow,im=m&&IMG[m.src];if(!im||!im.width||!m.clips||!m.clips.look)return null;
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const row=m.clips.look.S[0];
  for(let f=2;f<m.clips.look.S[1];f++){const X0=f*m.fw,Y0=row*m.fh,id=g.getImageData(X0,Y0,m.fw,60),d=id.data,W=m.fw,at=(x,y)=>(y*W+x)*4;
    const isSkin=(x,y)=>{if(x<0||y<0||x>=W||y>=60)return false;const i=at(x,y);return d[i+3]>200&&d[i]>d[i+1]+18&&d[i]>60&&d[i]<235&&!(d[i+1]>150);};
    const carved=(x,y)=>{const i=at(x,y);if(d[i+3]<200)return false;const L=d[i]*.3+d[i+1]*.59+d[i+2]*.11;return L<34||(d[i]>200&&d[i+1]>140);};
    // the bottom of each carved hole: where a carved pixel has pumpkin skin under it
    const solid=(x,y)=>x>=0&&y>=0&&x<W&&y<60&&d[at(x,y)+3]>200,inner=(x,y)=>{for(let j=-3;j<=3;j++)for(let i=-3;i<=3;i++)if(!solid(x+i,y+j))return false;return true;};   /* a carved hole is inside the face, not the pumpkin's outline */
    // the carved holes, each one connected patch inside the face: the two eyes, and the mouth (the lowest)
    const lab=new Int16Array(W*60).fill(-1),comps=[];for(let y=0;y<60;y++)for(let x=0;x<W;x++){if(lab[y*W+x]>=0||!carved(x,y)||!inner(x,y))continue;const q=[[x,y]],cp=[];lab[y*W+x]=comps.length;
      while(q.length){const [cx,cy]=q.pop();cp.push([cx,cy]);for(const [nx,ny] of [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]])if(nx>=0&&ny>=0&&nx<W&&ny<60&&lab[ny*W+nx]<0&&carved(nx,ny)&&inner(nx,ny)){lab[ny*W+nx]=comps.length;q.push([nx,ny]);}}
      if(cp.length>=4)comps.push(cp);else for(const [px,py] of cp)lab[py*W+px]=-2;}
    if(comps.length<2){g.putImageData(id,X0,Y0);continue;}
    const bot=cp=>Math.max(...cp.map(p=>p[1])),byLow=comps.slice().sort((p,q)=>bot(q)-bot(p)),mouth=byLow[0],eyes=byLow.slice(1,3);
    const put=(x,y,hex)=>{if(x<0||y<0||x>=W||y>=60)return;const v=s98Hex(hex),i=at(x,y);d[i]=v[0];d[i+1]=v[1];d[i+2]=v[2];d[i+3]=255;};
    const run=(x,y,over)=>{let yy=y,n=0;while(yy<59&&(isSkin(x,yy)||(over&&n<9&&!carved(x,yy)))){const out=!isSkin(x,yy);put(x,yy,out?'#3a0e08':n===0?'#5a1a0e':'#2e0a06');if(!out&&isSkin(x+1,yy))put(x+1,yy,'#4a140a');yy++;n++;if(over&&out&&n>2&&!solid(x,yy+1))break;}
      put(x,yy,'#2a0806');if(isSkin(x+1,yy-1)||!solid(x+1,yy))put(x+1,yy,'#3a0e08');put(x-1,y,'#c8704a');};   /* the run, a drop at its foot, one wet glint where it leaves the hole */
    for(const e of eyes){const yb=bot(e),xs=e.filter(p=>p[1]===yb).map(p=>p[0]);run(Math.round((Math.min(...xs)+Math.max(...xs))/2),yb+1,false);}
    {const yb=bot(mouth),xs=mouth.filter(p=>p[1]>=yb-1).map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs);for(const x of [x0+2,Math.round((x0+x1)/2)+1,x1-2]){let y=yb;while(y>0&&!carved(x,y))y--;run(x,y+1,true);}}   /* from the mouth, over the chin and hanging */
    g.putImageData(id,X0,Y0);}
  IMG['s98:scarewet']=c;S98.scareSrc=m.src;return S98.scareWet=c;}
const s98ScareOn=()=>{try{if(S.saga&&S.saga.done&&S.saga.done.scare)return true;const b=sgCurrent();return !!(b&&b.id==='scare');}catch(e){return false;}};
{const _ds=drawSpr;drawSpr=function(name,x,y,clip,dir){if(name==='scarecrow'&&clip==='look'&&s98ScareOn()&&s98ScareSheet()){const m=SPR.scarecrow,keep=m.src;m.src='s98:scarewet';
    try{return _ds.apply(this,arguments);}finally{m.src=keep;}}return _ds.apply(this,arguments);};}
// the close-up: the field round the scarecrow as it is, the scarecrow on it with its head turned to you and its face wet
const s98ScareArt=SGT_DRAW.scare;
SGT_DRAW.scare=function(){try{const m=SPR.scarecrow,sh=s98ScareSheet();if(m&&sh&&typeof scare!=='undefined'){const cw=96,ch=80,ax=48,ay=m.ay-6;   /* head and shoulders: the whole post (160 px) can't stand in the view at this size, so it is a close-up of the head, shown twice as big */
    return sgtC('s98g_scare_'+Math.round(scare.x*10)+'_'+Math.round(scare.z*10),cw,ch,(P,g)=>{g.drawImage(s98Raw({x:scare.x,z:scare.z},cw,ch,ax,ay),0,0);
      const r=m.clips.look.S,fx=(r[1]-1)*m.fw,fy=r[0]*m.fh;g.drawImage(sh,fx,fy,m.fw,m.fh,ax-m.ax,ay-m.ay,m.fw,m.fh);});}}catch(e){}
  return s98ScareArt.apply(this,arguments);};

// ---- the Tithe House: its close-up keeps its own boarded door, the shoes and the step, now set in the house's own stone wall with
// its own ground under it (it stood in a narrow block against a night sky, between standing stones that are not by the door). The
// world's shoes were two cream blocks; the door's foot, the shoes and the step in the world are now the close-up's, shrunk to the
// world's size (the two pictures are 1.5 apart: the close-up's shoes are 40 px across, the world's 26).
const S98_TITHE={S:1.5,ax:81,ay:100.5,door:[52,12,110,90],step:[44,86,117,97],foot:[52,70,111,97],frame:[38,6,124,100]};   /* frame: the close-up's crop, tight on the door so the view shows it twice as big */
const s98TitheArt=SGT_ART.p_tithe;
function s98TitheCut(){if(S98.titheCut)return S98.titheCut;const c=s98TitheArt&&s98TitheArt();if(!c)return null;const o=document.createElement('canvas');o.width=c.width;o.height=c.height;const g=o.getContext('2d');
  for(const [x0,y0,x1,y1] of [S98_TITHE.door,S98_TITHE.step])g.drawImage(c,x0,y0,x1-x0,y1-y0,x0,y0,x1-x0,y1-y0);return S98.titheCut=o;}
function s98TitheWorld(){if(S98.titheDone)return;const m=SPR.h_tithe37,im=m&&IMG[m.src];if(!im||!im.width)return;const cut=s98TitheCut();if(!cut)return;
  const [x0,y0,x1,y1]=S98_TITHE.foot,piece=document.createElement('canvas');piece.width=x1-x0;piece.height=y1-y0;piece.getContext('2d').drawImage(cut,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);
  const sm=s98Shrink(piece,S98_TITHE.S,{noLine:1,cov:.5}),c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);
  const wx=Math.round(m.ax+(x0-S98_TITHE.ax)/S98_TITHE.S),wy=Math.round(m.ay+(y0-S98_TITHE.ay)/S98_TITHE.S);g.drawImage(sm,wx,wy);IMG[m.src]=c;S98.titheDone=1;}
SGT_ART.p_tithe=function(){try{const cut=s98TitheCut(),h=OBJ.find(o=>o.spr==='h_tithe37');if(cut&&h){const d=S98_TITHE,[fx0,fy0,fx1,fy1]=d.frame,w=fx1-fx0,hh=fy1-fy0;
    return sgtC('s98g_tithe_'+Math.round(h.x*10)+'_'+Math.round(h.z*10),w,hh,(P,g)=>{const bg=f98Ground({x:h.x,z:h.z},w,hh,d.S,d.ax-fx0,d.ay-fy0,{});g.drawImage(bg,0,0);g.drawImage(cut,-fx0,-fy0);});}}catch(e){}
  return s98TitheArt.apply(this,arguments);};
setInterval(()=>{try{s98ListWorld();s98TitheWorld();}catch(e){}},400);

// ---- the coffins: in the world three plain coffins stood against the church's side wall, while the close-up was a crypt of small
// coffins in rows and one full-sized new one with a brass plate. Both pictures now draw one layout: fourteen small coffins in
// three uneven rows, standing, some with their lids off and leaning beside them (names scratched inside), and the long new one
// with its brass plate at the front, ELIAS scratched on it. In the world each is drawn at its true size beside the player (a child's
// coffin about as tall as you, the new one taller); the close-up draws the same coffins one and a half times bigger with the close-up's
// own coffin drawing (its shape, wood, scratches and the names), on the grass and path where they stand.
// each: [x, foot y, width, height, wood, open (lid off), name, lean] in world pixels from the group's anchor (its front middle)
const S98_COF=[[-52,-27,10,27,0,0,'',-1],[-36,-28,11,29,1,1,'RUTH',0],[-20,-26,10,26,2,0,'',1],[-4,-28,11,30,3,0,'',0],[13,-27,10,27,1,1,'DANNY',-1],
  [-46,-13,11,29,2,0,'',1],[-29,-12,12,31,0,0,'',0],[-12,-14,11,28,3,1,'MOLLY',0],[6,-12,12,30,2,0,'',-1],[24,-13,10,27,0,0,'',1],
  [-41,1,12,31,1,0,'',0],[-23,0,11,29,3,0,'',-1],[-5,1,12,30,0,1,'ANNIE',1]];
const S98_COFBIG=[19,2,18,54];
const S98_CRYPT={S:1.5,ax:108,ay:106};
function s98Coffins(P,k,world){const W=[['#6a4a30','#5a3e28','#46301e'],['#7a5a3a','#6a4c30','#523a24'],['#5a4434','#4a382a','#3a2c20'],['#6e5a42','#5e4a34','#4a3a28']];
  const shape=(w,h)=>yy=>{const t=yy/h,s=w*.32;return t<.3?Math.round(s+(w/2-s)*(t/.3)):Math.round(w/2-(w/2-s*.75)*((t-.3)/.7));};
  const cof=(cx,foot,w,h,col,open,nm,L)=>{const sh=shape(w,h),y=foot-h,Q=(px,py,c)=>P(px+Math.round((py-foot)*L/h),py,1,1,c);
    P(cx-Math.round(w*.5),foot-1,w+3,2,'rgba(30,20,24,.45)');   /* its foot on the ground, a little shadow down and right */
    for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++){let c=Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':yy===1?sgtShade(col[0],1.32):xx<-hw/3?sgtShade(col[0],1.12):xx<hw/3?col[1]:sgtShade(col[2],.78);   /* a lit top edge, the left side lit, the right in shade */
      if(open&&Math.abs(xx)<hw-1&&yy>0&&yy<h-1)c=yy<Math.max(3,h*.16)?'#5a4030':xx<-hw+2?'#4a3426':xx>hw-3?'#1e140e':'#2e2018';Q(cx+xx,y+yy,c);}}   /* inside, a dim lining: the far end's wall lit, the near side in shadow */
    if(!open&&h>12){const n=world?2:3;for(let i=0;i<n;i++){const sy=y+Math.round(h*(.18+i*.12))+(st37H(cx,i)%2),sx0=cx-Math.round(w*.2)+(st37H(i,cx)%2);for(let q=0;q<Math.max(2,Math.round(w*.25))+(st37H(cx+i,y)%2);q++)Q(sx0+q,sy,'#1e140c');}}   /* a name scratched on the lid */
    if(open){const lx=cx+Math.ceil(w/2)+2,ly=y-Math.round(h*.08);for(let yy=0;yy<h;yy++){const hw=sh(yy);for(let xx=-hw;xx<=hw;xx++)Q(lx+xx+Math.round(yy*.15),ly+yy,Math.abs(xx)===hw||yy===0||yy===h-1?'#0e0b0c':'#9a7a58');}   /* the lid, leaning beside it, its inside out */
      if(!world&&nm)for(let i=0;i<nm.length&&i<4;i++){const f=(typeof PXFONT!=='undefined'&&PXFONT[nm[i]])||null;if(!f)continue;for(let j=0;j<5;j++)for(let q=0;q<3;q++)if(f[j*3+q]==='1')Q(lx-1+q+Math.round((3+i*6)*.15),ly+4+i*6+j,'#3a2414');}
      else for(let i=0;i<3;i++)Q(lx-1+(i%2),ly+3+i*3,'#5a3e24');}};
  for(const [x,f,w,h,wi,op,nm,L] of S98_COF)cof(k.x+x*k.s,k.y+f*k.s,Math.round(w*k.s),Math.round(h*k.s),W[wi],!!op,nm,world?L:Math.round(L*k.s));
  const [bx,bf,bw,bh]=S98_COFBIG,cx=k.x+bx*k.s,foot=k.y+bf*k.s,w=Math.round(bw*k.s),h=Math.round(bh*k.s),y=foot-h;cof(cx,foot,w,h,['#8a6440','#765434','#5c4026'],false,'',0);
  for(let yy=y+Math.round(h*.1);yy<foot-Math.round(h*.06);yy+=Math.max(4,Math.round(h*.14)))P(cx-Math.round(w*.3),yy,Math.round(w*.6),1,'#6a4a2c');   /* new planks, still pale */
  const pw=Math.round(w*.75),ph=Math.max(3,Math.round(h*.15)),py=y+Math.round(h*.42);P(cx-Math.ceil(pw/2)-1,py-1,pw+2,ph+2,'#0e0b0c');P(cx-Math.ceil(pw/2),py,pw,ph,'#c8a048');P(cx-Math.ceil(pw/2),py,pw,1,'#f0d888');   /* the brass plate */
  if(!world&&typeof st37ScratchName==='function')st37ScratchName(P,cx-12,y+Math.round(h*.22),'#1e1006','#c8a070',.72);
  else if(world)P(cx-3,y+Math.round(h*.25),6,1,'#2a1a0c');}
function s98CoffinCanvas(world){const k=world?'cofW':'cofA';if(S98[k])return S98[k];const c=document.createElement('canvas');
  if(world){c.width=96;c.height=64;}else{c.width=typeof ST37W!=='undefined'?ST37W:176;c.height=typeof ST37H!=='undefined'?ST37H:112;}
  const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w||1,h||1);};
  s98Coffins(P,world?{x:60,y:60,s:1}:{x:S98_CRYPT.ax,y:S98_CRYPT.ay,s:S98_CRYPT.S},world);return S98[k]=c;}
const s98CryptArt=SGT_ART.crypt;
SGT_ART.crypt=function(){try{const o=s98Beat('crypt'),cut=s98CoffinCanvas(false);if(o&&o._s98&&cut){const d=S98_CRYPT;
    const im=s98OnGround('s98g_crypt_'+Math.round(o.x*10)+'_'+Math.round(o.z*10),cut,{x:o.x,z:o.z},d.S,d.ax,d.ay,[o]);if(im)return im;}}catch(e){}
  return s98CryptArt.apply(this,arguments);};
{const _sp=sgProps;sgProps=function(){const r=_sp.apply(this,arguments);try{const o=s98Beat('crypt');if(o&&!o._s98){o.spr=s98Spr('coffins',s98CoffinCanvas(true),60,60);o._s98=1;}}catch(e){}return r;};}

// ---- the rehearsal: the dummy sat on three bare stone steps against a black wall. The church it happens in has a white-clothed
// altar table under the big wooden cross, a wood wainscot, a plastered wall and grey flagstones; the dummy, its blood and the two
// candles are kept as they are, and behind them is now that altar end, by candlelight: the dummy sits on the altar's cloth, its legs
// over the front edge, and what ran out of it runs down the cloth.
const s98RehArt=SGT_ART.rehearsal;
SGT_ART.rehearsal=function(){try{const c=s98RehArt&&s98RehArt();if(c&&c.width===150){return sgtC('s98g_rehearsal',150,104,(P,g)=>{
    const dim=(h,k)=>sgtShade(h,k);
    for(let y=0;y<30;y++)for(let x=0;x<150;x++){const n=f98N(x/9,y/6,41);P(x,y,1,1,n>.66?'#625a52':n<.3?'#4e4842':'#58504a');}   // the plastered wall, dim
    for(const [x0,y0,len] of [[16,6,9],[128,12,7]])for(let i=0;i<len;i++)P(x0+i,y0+Math.round(Math.sin(i*.9)*1.2)+(i>>2),1,1,'#3e3832');   // two old cracks
    // the big cross behind it, its arms showing either side of the sack head
    P(104,0,9,31,'#281916');P(105,0,7,31,'#4e3220');P(105,0,2,31,'#66442d');P(83,10,51,8,'#281916');P(84,11,49,6,'#4e3220');P(84,11,49,2,'#7e583c');P(84,16,49,1,'#3a2618');P(107,12,3,3,'#a87e34');P(107,12,1,1,'#e0bc70');
    for(let y=22;y<36;y++)for(let x=0;x<150;x++){const px=(x+6)%25;P(x,y,1,1,y<24?'#5a3e24':y===24?'#1e140c':px===0?'#1e140c':px===1?'#4a3220':y===35?'#24180e':'#3a2616');}   // the wood wainscot
    for(let y=36;y<104;y++)for(let x=0;x<150;x++){const tx=Math.floor((x+4)/20),ty=Math.floor((y-36)/20),j=(x+4)%20===0||(y-36)%20===0,lip=(x+4)%20===1||(y-36)%20===1,n=sgtH(tx,ty)%3;P(x,y,1,1,j?'#4e4e54':lip?'#86868a':n===0?'#6e6e72':n===1?'#747478':'#6a6a6e');}   // the church's pale grey square tiles
    // the altar: a table under a white cloth that hangs to the floor in broad folds at uneven spacing; the dummy stands on the floor in front of it
    P(53,33,107,32,'#140e11');P(54,34,105,4,'#d0c8ae');P(54,34,105,1,'#e8e2ce');P(54,38,105,1,'#8e8470');
    const folds=[62,75,89,124,138,150];for(let y=39;y<63;y++)for(let x=54;x<159;x++){let c='#ccc4aa';for(const f of folds){const dx=x-f-Math.round((y-39)*.06*(f<106?-1:1));if(dx===0)c='#e8e2ce';else if(dx===1||dx===2)c=dx===1?'#b4aa90':'#c0b69c';}if(y>60)c='#b4aa90';P(x,y,1,1,c);}
    for(let x=54;x<159;x++)P(x,63,1,1+((x>>3)%2),'#8e8470');P(54,65,105,2,'rgba(10,6,8,.45)');
    for(const cx of [61]){P(cx-3,14,7,21,'#140e11');P(cx-2,16,5,18,'#e8e0cc');P(cx-2,16,1,18,'#ffffff');P(cx+2,16,1,18,'#c8c0a8');P(cx-3,33,7,2,'#5a4a30');P(cx,12,1,4,'#ffd27a');P(cx-1,10,3,3,'#fff4c0');}   // the altar's two candles, standing on it
    for(let x=-14;x<=14;x++){const w=Math.round(2.4*Math.sqrt(Math.max(0,1-(x/15)**2)));if(w>0)P(75+x+2,65,1,w,'rgba(8,4,8,.5)');}   // the dummy's shadow at its feet
    for(let y=0;y<104;y++)for(let x=0;x<150;x++){const d=Math.hypot((x-75)/80,(y-50)/70);if(d>.8)P(x,y,1,1,`rgba(8,4,10,${Math.min(.5,(d-.8)*1.4)})`);}   // only the candles light it: the corners fall dark
    g.drawImage(s98RehCut(),0,0);/* the old candles on the steps go: the altar's own stand on it */});}}catch(e){}
  return s98RehArt.apply(this,arguments);};
// the dummy in the church itself: from the night of the rehearsal until the drawing it stands where the close-up shows it, on the
// floor before the altar's left end (Hale keeps to its middle), its blood on the stones; the same drawing as the close-up's, at the world's size (1.3 apart)
function s98RehCut(){if(S98.rehCut)return S98.rehCut;const c=s98RehArt&&s98RehArt();if(!c||c.width!==150)return null;
  const o=s98Cut(s98Cut(s98Cut(c,['#16121a','#1e1820','#2a2630','#4a4650','#7a7680','#1a181e']),['#e8e0cc','#ffffff','#ffd27a','#fff4c0'],(x,y)=>!((x>=26&&x<=35)||(x>=116&&x<=125))),['#5a0a06','#7a1008','#4a0806'],(x,y)=>y<64);   /* the old run below the feet and the two bars go */
  const g=o.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  for(let y=63;y<74;y++)for(let x=56;x<104;x++){const dx=(x-76)/(20+3*Math.sin(y*1.3)),dy=(y-67)/(4.6+Math.sin(x*.7)*.8);const e=dx*dx+dy*dy+(sgtH(x>>1,y)%7)*.02;if(e>1)continue;P(x,y,1,1,e>.78?'#3a0604':y<65&&x<80?'#8a1810':'#5a0a06');}   /* one ragged pool at its feet, fed by the run down its legs */
  P(74,62,4,3,'#5a0a06');P(70,66,3,1,'#9a2418');return S98.rehCut=o;}
function s98RehWorld(){if(typeof ROOMS==='undefined'||!ROOMS.church)return;let o=S98.rehObj;if(o&&!OBJ.includes(o))o=S98.rehObj=null;
  if(!o){const cut=s98RehCut();if(!cut)return;const p=document.createElement('canvas');p.width=54;p.height=92;p.getContext('2d').drawImage(cut,49,2,54,92,0,0,54,92);
    const sm=s98Shrink(p,1.3);const n=s98Spr('dummy',sm,(75-49)/1.3,(65-2)/1.3);const R=ROOMS.church;o=S98.rehObj=obj(n,R.ox+5-1.05,R.oz+2.2,{kind:'furn',room:'church',noCol:true});}   // before the altar's left end, clear of Hale behind its middle
  let on=false;try{const st=S.st||{};const b=sgCurrent();on=!!((S.saga&&S.saga.done&&S.saga.done.rehearsal)||(b&&b.id==='rehearsal'))&&!st.done&&!STG;}catch(e){on=false;}o.hide=!on;}
setInterval(()=>{try{s98RehWorld();}catch(e){}},400);

// ======== (B3) the region beats and the chapter-two places
// ---- Wickham's noticeboard: its close-up board stood in the dark. It stands in Wickham's square, before the stone wall, on cobbles:
// the close-up's board is kept and the square goes behind it. In the world, Wickham's board now carries the same notice, big in
// the middle over the older ones, the red ring at its foot, as the close-up shows it (only this board: the town's own is unchanged).
const S98_WICK={S:2.8,ax:80,ay:106};const s98WickArt=SGT_ART.p_wick;
function s98WickBoard(){const o=OBJ.find(q=>q.spr==='board'&&Math.abs(q.x-120)<1.5&&Math.abs(q.z-48.6)<1.5);return o||OBJ.find(q=>q.spr==='s98_wickboard');}
function s98WickWorld(){if(S98.wickDone)return;const o=s98WickBoard(),m=SPR.board,im=m&&IMG[m.src];if(!o||!im||!im.width)return;
  const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);
  for(const [x,y,w,h,col] of [[9,15,13,15,'#a89868'],[42,14,13,14,'#9a8a5a'],[11,30,11,9,'#b8a878'],[43,29,12,10,'#8a7a50']]){P(x,y,w,h,'#2a2014');P(x+1,y+1,w-2,h-2,col);P(x+2,y+4,w-4,1,sgtShade(col,.7));P(x+2,y+7,w-5,1,sgtShade(col,.7));}   /* the older notices, yellowed */
  P(21,12,22,29,'#140c06');P(22,13,20,27,'#efe8d8');P(22,13,20,1,'#ffffff');for(let k=0;k<6;k++)P(25,16+k*3,14-(k%2)*3,1,'#5a4a3a');P(26,34,12,4,'#a02818');P(27,35,10,2,'#efe8d8');P(29,35,5,1,'#5a4a3a');P(31,12,2,2,'#a02818');   /* this year's notice, its red ring */
  for(const [x,y] of [[10,40],[44,40]])P(x,y,8,3,'#c8b890');   /* H HALE, on the corners */
  o.spr=s98Spr('wickboard',c,m.ax,m.ay);S98.wickDone=1;}
SGT_ART.p_wick=function(){try{const c=s98WickArt&&s98WickArt(),o=s98WickBoard();if(c&&o&&S98.wickDone){const d=S98_WICK;
    return sgtC('s98g_wick_'+Math.round(o.x*10),c.width,c.height,(P,g)=>{g.drawImage(f98Ground({x:o.x,z:o.z},c.width,c.height,d.S,d.ax,d.ay,{skip:[o],frontZ:o.z}),0,0);g.drawImage(s98Cut(c,['#181c20','#1e2226','#3a3a3a','#4a4a48']),0,0);});}}catch(e){}
  return s98WickArt.apply(this,arguments);};

// ---- the Marsh place: in the world it is a blue clapboard house with a green door; its close-up was a brown plank cabin. The
// close-up is now that house's own front (the door, its window, the porch, the lower window), drawn again at twice the size, and the
// three things the story says are there are put on the house itself, so the world shows them too: the note on the door, the crack
// across the window shaped like a river, and the porch board that sticks up.
const S98_MARSH={S:2,cx:102,cy:195,w:220,h:110};const s98MarshArt=SGT_ART.p_marsh;
function s98MarshWorld(){if(S98.marshDone)return;const m=SPR.h_marsh,im=m&&IMG[m.src];if(!im||!im.width)return;
  const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};g.drawImage(im,0,0);
  P(110,192,13,10,'#1a120a');P(111,193,11,8,'#e8dcb8');P(111,193,11,1,'#f8f0d8');P(112,195,5,1,'#5a4a3a');P(112,197,7,1,'#5a4a3a');P(116,199,5,1,'#7a6a52');P(116,191,1,2,'#8a8a92');   /* the note, nailed to the door */
  for(const [x,y] of [[51,168],[53,170],[54,171],[56,173],[57,175],[59,176],[61,178],[62,180],[64,181],[66,183],[67,185],[69,186],[70,188],[72,190],[55,177],[54,179],[64,176],[66,175]])P(x,y,1,1,'#c8d4dc');   /* the crack across the glass, branching like a river */
  P(111,221,14,1,'#c8a878');P(111,222,14,1,'#3a2414');   /* the porch board that sticks */
  IMG[m.src]=c;S98.marshDone=1;}
SGT_ART.p_marsh=function(){try{const h=OBJ.find(o=>o.spr==='h_marsh'),m=SPR.h_marsh;if(h&&m&&S98.marshDone){const d=S98_MARSH,ax=d.w/2+(m.ax-d.cx)*d.S,ay=d.h/2+(m.ay-d.cy)*d.S;
    return sgtC('s98g_marsh_'+Math.round(h.x*10),d.w,d.h,(P,g)=>{g.drawImage(f98Ground({x:h.x,z:h.z},d.w,d.h,d.S,ax,ay,{}),0,0);{const id=g.getImageData(0,0,d.w,d.h),q=id.data;for(let i=0;i<q.length;i+=4){q[i]*=.93;q[i+1]*=.98;q[i+2]*=.72;}g.putImageData(id,0,0);}   /* in the colours the house shows in the world there: its blue siding reads muted sage under the fen's light */
      
      const nx=d.w/2+(110-d.cx)*d.S,ny=d.h/2+(192-d.cy)*d.S;P(nx,ny,26,20,'#1a120a');P(nx+1,ny+1,24,18,'#e8dcb8');P(nx+1,ny+1,24,1,'#f8f0d8');   /* the note, close: FOR YOU in Grandpa's hand, a scrawl, a nail */
      sgtT(P,'FOR',nx+3,ny+3,'#3a2a1a');sgtT(P,'YOU',nx+3,ny+9,'#3a2a1a');for(let i=0;i<14;i++)P(nx+5+i,ny+16-Math.round(Math.sin(i*.9)*1.2),1,1,'#5a4a3a');P(nx+12,ny-2,2,4,'#8a8a92');P(nx+12,ny-2,1,1,'#d0d0d8');});}}catch(e){}
  return s98MarshArt.apply(this,arguments);};
setInterval(()=>{try{s98WickWorld();s98MarshWorld();}catch(e){}},400);

// ---- the hollow tree: in the world it was the plain dark dead tree that grows all over the valley; its close-up is a pale grey trunk
// split open like a door ajar, dark inside at the top, the wood below carved over and over, three candle stubs at its foot. The
// tree that stands there is now that tree (pale bark, the split, the carved wood, the candles); the close-up stands on its ground.
const S98_TREE={S:8};const s98TreeArt=SGT_ART.p_tree;
function s98TreeObj(){return OBJ.find(o=>(o.spr==='deadtree'||o.spr==='s98_hollowtree')&&Math.abs(o.x-HOLLOW_TREE.x)<.6&&Math.abs(o.z-HOLLOW_TREE.z)<.6);}
function s98TreeWorld(){if(S98.treeDone)return;const o=s98TreeObj(),m=SPR.deadtree,im=m&&IMG[m.src];if(!o||!im||!im.width)return;
  const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const g=c.getContext('2d');g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);const id=g.getImageData(0,0,m.fw,m.fh),d=id.data;
  const R=['#2e2c2a','#5a5a54','#6e6e68','#8a8a84','#a4a29a','#b8b6ae'].map(s98Hex);
  for(let i=0;i<d.length;i+=4){if(d[i+3]<200)continue;const L=d[i]*.3+d[i+1]*.59+d[i+2]*.11,k=L<16?0:L<40?1:L<62?2:L<80?3:L<100?4:5,v=R[k];d[i]=v[0];d[i+1]=v[1];d[i+2]=v[2];}   /* the bark gone pale grey, as in the close-up */
  g.putImageData(id,0,0);const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  for(let y=48;y<80;y++){const l=27-(y>70?1:0),r=35+(y>66?1:0);P(l-1,y,1,1,'#4a3420');P(l,y,r-l,1,y<63?'#0a0705':(sgtH(l,y)<10?'#c8a878':'#d8bc8a'));}   /* the split: dark inside at the top, the carved wood below */
  for(const [x,y] of [[28,66],[31,66],[29,69],[32,69],[28,72],[31,72],[30,75]])P(x,y,2,1,'#6a5030');   /* the carving */
  for(const x of [28,31,34]){P(x,80,1,2,'#e8dcc0');P(x,79,1,1,'#ffb040');}   /* three candle stubs at its foot */
  o.spr=s98Spr('hollowtree',c,m.ax,m.ay);S98.treeDone=1;}
// the carving's second "SUN IS IN" lost the foot of its I under the third go's fresh-cut wood, so it read SUN TS IN: cut it again on top
function s98TreeText(c){if(!c||c._s98txt)return;c._s98txt=1;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w||1,h||1);};
  const L=y=>58-Math.round(Math.sin(y*.21)*2+Math.sin(y*.07)*3+(y>40?(y-40)*.05:0)),y=61,x=L(y)+4+4;let X=x+1;
  for(const [i,ch] of [...'SUN IS IN'].entries()){const jy=y+6+((sgtH(i+9,y)%3)-1);sgtT(P,ch,X,jy+1,'#f6e2b8');sgtT(P,ch,X,jy,'#2e1c0c');X+=4+(sgtH(y,i+5)%2);}}
SGT_ART.p_tree=function(){try{const c=s98TreeArt&&s98TreeArt(),o=s98TreeObj(),m=SPR.deadtree;s98TreeText(c);if(c&&o&&S98.treeDone&&m){const S=S98_TREE.S,ax=80+(m.ax-30.5)*S,ay=92+(m.ay-80)*S;
    return sgtC('s98g_tree',c.width,c.height,(P,g)=>{g.drawImage(f98Ground({x:o.x,z:o.z},c.width,c.height,S,ax,ay,{skip:[o]}),0,0);g.drawImage(s98Cut(c,['#141a14','#0e130f','#3a2e1c','#2a2214']),0,0);});}}catch(e){}
  return s98TreeArt.apply(this,arguments);};
setInterval(()=>{try{s98TreeWorld();}catch(e){}},400);
