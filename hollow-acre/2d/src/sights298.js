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
