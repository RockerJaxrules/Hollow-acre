/* ================= #378 the wardrobe, part 3: the face. Brows, eyes and lashes, lipstick, liner, shadow, blush, freckles, beauty marks,
   scars, face paint, tattoos and piercings, painted pixel by pixel onto the face as it's drawn in every frame (facing you and side on;
   from behind there is no face). Each hangs on the generator's anchors for that frame: the face's axis and the eye row, so it moves
   with every bob, nod, blink and swing, and stays under the hair, beard, collar and glasses drawn after it. Nothing to download. ================= */
const WDF={};
const WDF_ORDER=['shadow','brows','eyes','liner','lips','blush','freckles','mole','scar','paint','tattoo','pnose','pbrow','plip'];
const WDF_SLOT={brows:['brow'],eyes:['eye'],shadow:['shadow'],liner:['liner'],lips:['lip'],blush:['blush'],freckles:['mark'],mole:['mark'],scar:[],paint:['paint','paint2'],tattoo:['tattoo'],pnose:['pierce'],pbrow:['pierce'],plip:['pierce']};
// an item: its front painter and its side painter (each gets the frame's helpers), registered as a 0-byte item
function wdFace(pos,id,label,front,side,o){o=o||{};WDF[pos+':'+id]={f:front,s:side};wdAdd([{cat:pos,id,label,v:'none',layer:null,slots:o.slots||WDF_SLOT[pos]||[],tags:o.tags||[],flags:['face'],def:o.def||null}]);}
const WDF_LASH=[34,24,26],WDF_WHITE=[238,234,226];
// the frame's helpers. Front: P(dx,dy) is the pixel dx right of the face's axis, dy below the eye row; M paints it and its mirror.
// Side: U(u,dy), u counted forward from the axis toward the nose. skin-only paints never cover an eye, a brow or the mouth's shadow unless asked
function wdfCtx(a,dst,W,fx0,fy0,A,dir,K){const cx=A[0],hy=A[1],f=dir==='E'?1:dir==='W'?-1:0;const SKB=K.skb,HB=K.hb;
  const idx=(x,y)=>{if(x<0||x>=WD_FW||y<0||y>=WD_FH)return -1;const X=fx0+x;if(X<0||X>=W)return -1;return ((fy0+y)*W+X)*4;};
  const rawK=i=>i<0||!a[i+3]?-2:((a[i]<<16)|(a[i+1]<<8)|a[i+2]);
  const sk=(x,y)=>{const i=idx(x,y);if(i<0||!a[i+3])return -1;const k=SKB.get(rawK(i));return k===undefined?-1:k;};
  // m keeps a mark readable on any skin: 'c40' at least 40 of brightness away from what it lies on (its own way first), 'd'/'l' always darker/lighter, 'b' blush (half the skin's own colour)
  const put=(x,y,c,o,m)=>{const i=idx(x,y);if(i<0||!c)return;if(o==='skin'&&(SKB.get(rawK(i))===undefined))return;if(o==='opaque'&&!a[i+3])return;
    if(m){const b=[dst[i],dst[i+1],dst[i+2]];c=m==='b'?wdfContrast(wdfMix(b,c,.5),b,16,0):wdfContrast(c,b,+m.slice(1),m[0]==='d'?-1:m[0]==='l'?1:0);}
    dst[i]=c[0];dst[i+1]=c[1];dst[i+2]=c[2];dst[i+3]=255;};
  const H={cx,hy,f,side:!!f,shut:!!(A[2]&1),top:A[3],K,sk,
    P:(dx,dy,c,o,m)=>put(cx+dx,hy+dy,c,o,m),M:(dx,dy,c,o,m)=>{put(cx+dx,hy+dy,c,o,m);put(cx+1-dx,hy+dy,c,o,m);},U:(u,dy,c,o,m)=>put(cx+u*f,hy+dy,c,o,m),
    // the skin's own shade at a pixel, as an index into a ramp (so paint keeps the face's light and shadow)
    skF:(dx,dy)=>sk(cx+dx,hy+dy),skU:(u,dy)=>sk(cx+u*f,hy+dy),
    isHair:(x,y)=>{const i=idx(x,y);return i>=0&&!!a[i+3]&&HB.has(rawK(i));},
    fill:(fn,c,o,m)=>{for(let y=0;y<WD_FH;y++)for(let x=0;x<WD_FW;x++){const k=sk(x,y);if(k<0)continue;const r=fn(x-cx,y-hy,k);if(r!=null)put(x,y,Array.isArray(r)?r:c[r],o,m);}},
    raw:(x,y)=>{const i=idx(x,y);return i<0||!a[i+3]?null:[a[i],a[i+1],a[i+2]];},put};
  return H;}
const wdfMix=(a,b,t)=>a.map((v,i)=>Math.round(v*(1-t)+b[i]*t));
// a mark's colour pushed away from the skin under it until there is d of brightness between them (darker by scaling, lighter toward white)
function wdfContrast(c,b,d,want){const lc=wdLuma(c),lb=wdLuma(b);let dir=want||(lc<lb?-1:1);if(!want&&Math.abs(lc-lb)>=d)return c;if(want<0&&lc<=lb-d)return c;if(want>0&&lc>=lb+d)return c;
  if(!want){if(dir<0&&lb-d<4)dir=1;else if(dir>0&&lb+d>251)dir=-1;}
  if(dir<0){const t=Math.min(1,Math.max(0,lb-d)/Math.max(1,lc));return c.map(v=>Math.round(v*t));}
  const t=Math.min(1,(Math.min(255,lb+d)-lc)/Math.max(1,255-lc));return c.map(v=>Math.round(v+(255-v)*t));}
// the colours a face uses, worked out once per look
function wdfCols(w){const S=wdRamp(wdColD(w,'skin')),R=k=>wdRamp(wdColD(w,k));const mk=wdCol(w,'mark'),pc=wdCol(w,'pierce');
  return {S,brow:R('brow'),lip:R('lip'),liner:R('liner'),shadow:R('shadow'),blush:R('blush'),paint:R('paint'),paint2:R('paint2'),tattoo:R('tattoo'),
    freck:mk?wdRamp(mk)[2]:S[1],mole:mk?wdRamp(mk)[0]:S[0],pierce:wdRamp(pc||'#c0c4c8'),eye:R('eye'),
    skb:new Map(lookRamp(LOOK_BASE.skin).map((c,i)=>[wdKey(c),i])),hb:new Set(lookRamp(LOOK_BASE.hair).concat(lookRamp(WD_BASE.brow)).map(wdKey))};}
WD.facePass=function(w,tool,r0,r1,a,dst,W,X0){const items=[];for(const p of WDF_ORDER){const id=w.it[p];const d=id&&WDF[p+':'+id];if(d)items.push(d);}if(!items.length)return;
  const K=wdfCols(w);for(let row=r0;row<r1;row++){const dir=WD_ROWDIR[row];if(!dir||dir==='N')continue;
    for(let col=0;col<9;col++){const fx0=col*WD_FW-X0;if(fx0+WD_FW<=0||fx0>=W)continue;const A=wdAnchor(tool,row,col);if(!A||(A[2]&6))continue;
      const H=wdfCtx(a,dst,W,fx0,(row-r0)*WD_FH,A,dir,K);for(const d of items){const fn=H.side?d.s:d.f;if(fn)try{fn(H);}catch(e){}}}}};
// ---- eyebrows: the drawn brows come off (back to skin) and the chosen shape goes on, dark enough to read on any skin
const wdfBrowOff=H=>{const S=H.K.S;for(let dy=-4;dy<=0;dy++)for(let dx=-8;dx<=9;dx++){const x=H.cx+dx,y=H.hy+dy;if(H.isHair(x,y))H.put(x,y,S[dx<=-6&&!H.side?4:dx>=7&&!H.side?2:3]);}};
const wdfBrow=(front,side)=>[H=>{wdfBrowOff(H);const B=H.K.brow;for(const [dx,dy,k] of front)H.M(dx,dy,B[k],null,'d56');},H=>{wdfBrowOff(H);const B=H.K.brow;for(const [u,dy,k] of side)H.U(u,dy,B[k],null,'d56');}];
for(const [id,label,F,Sd] of [
  ['arched','Arched',[[-5,-1,1],[-4,-2,1],[-3,-2,1],[-2,-1,2]],[[3,-1,1],[4,-2,1],[5,-2,1]]],
  ['raised','Raised',[[-5,-3,1],[-4,-3,1],[-3,-3,1]],[[3,-3,1],[4,-3,1],[5,-3,1]]],
  ['none','Shaved',[],[]]]){const [f,s]=wdfBrow(F,Sd);wdFace('brows',id,label,f,s);}
// ---- eye shapes and lashes. A shut eye keeps its lashes on the closed lid; the shapes that need an open eye leave it alone.
// The whites are the skin's own colour lifted, so they never glow on dark skin
const LA=WDF_LASH;
const wdfEyeC=(H,c)=>c==='lid'?H.K.S[2]:c==='iris'?H.K.eye[1]:c==='wh'?wdfMix(H.K.S[3],WDF_WHITE,.55):c;
const wdfEye=(front,side,shutF,shutS)=>[H=>{const L=H.shut?(shutF||[]):front;for(const [dx,dy,c] of L)H.M(dx,dy,wdfEyeC(H,c));},
  H=>{const L=H.shut?(shutS||[]):side;for(const [u,dy,c] of L)H.U(u,dy,wdfEyeC(H,c));}];
for(const [id,label,F,Sd,sF,sS] of [
  ['long','Long lashes',[[-6,-1,LA],[-5,-1,LA],[-6,0,LA],[-4,-1,LA]],[[2,-1,LA],[2,0,LA],[3,-1,LA]],[[-6,2,LA],[-7,1,LA],[-5,3,LA],[-4,3,LA]],[[2,2,LA],[1,1,LA],[3,3,LA]]],
  ['wide','Wide eyes',[[-5,1,'wh'],[-2,1,'wh'],[-4,3,'lid'],[-3,3,'lid']],[[3,1,'wh']]],
  ['cat','Cat eyes',[[-6,-1,LA],[-2,1,LA]],[[2,-1,LA],[3,-1,LA]],[[-6,1,LA]],[[2,1,LA]]],
  ['droopy','Downturned',[[-6,1,LA],[-5,1,LA]],[[2,1,LA],[3,1,LA]],[[-6,3,LA]],[[2,3,LA]]],
  ['stare','Rolled stare',[[-4,2,'wh'],[-3,2,'wh'],[-3,1,'iris']],[[4,2,'wh'],[5,1,'iris']]]]){const [f,s]=wdfEye(F,Sd,sF,sS);wdFace('eyes',id,label,f,s,id==='stare'?{tags:['horror']}:null);}
// ---- lipstick on the mouth, in the lipstick's five shades
const wdfLips=(front,side)=>[H=>{const L=H.K.lip;for(const [dx,dy,k] of front)H.P(dx,dy,L[k],null,'c48');},H=>{const L=H.K.lip;for(const [u,dy,k] of side)H.U(u,dy,L[k],null,'c48');}];
for(const [id,label,F,Sd] of [
  ['tint','Tint',[[-1,6,1],[0,7,1],[1,7,1],[2,6,1]],[[6,6,1],[7,6,1]]],
  ['full','Full',[[-1,6,1],[0,6,2],[1,6,2],[2,6,1],[0,7,3],[1,7,3]],[[6,6,1],[7,6,2],[7,7,3]]]]){const [f,s]=wdfLips(F,Sd);wdFace('lips',id,label,f,s);}
// ---- eyeliner: along the lashes with a flick up behind the eye; on a shut eye it follows the closed lid (a run keeps running)
const wdfLine=(front,side,wing,keep)=>[H=>{const L=H.K.liner;if(H.shut){for(let dx=-6;dx<=-3;dx++)H.M(dx,2,L[1],null,'d56');if(wing)H.M(-7,1,L[1],null,'d56');for(const [dx,dy,k] of (keep||[]))H.M(dx,dy,L[k],null,'d56');return;}for(const [dx,dy,k] of front)H.M(dx,dy,L[k],null,'d56');},
  H=>{const L=H.K.liner;if(H.shut){for(const u of [2,3,4,5])H.U(u,2,L[1],null,'d56');return;}for(const [u,dy,k] of side)H.U(u,dy,L[k],null,'d56');}];
for(const [id,label,F,Sd,wing,keep] of [
  ['wing','Wing',[[-5,0,1],[-4,0,1],[-3,0,1],[-6,-1,1],[-7,-2,1]],[[3,0,1],[4,0,1],[2,-1,1]],1],
  ['kohl','Kohl',[[-6,0,1],[-5,0,1],[-4,0,1],[-3,0,1],[-5,2,1],[-4,3,1],[-3,3,1],[-2,1,1]],[[2,0,1],[3,0,1],[4,0,1],[3,3,1],[4,3,1]]],
  ['graphic','Heavy',[[-5,-1,1],[-4,-1,1],[-3,-1,1],[-5,0,0],[-4,0,0],[-3,0,0],[-6,-1,1],[-7,-2,1]],[[3,0,0],[4,0,0],[3,-1,1],[2,-1,1]],1],
  ['drip','Running',[[-5,2,1],[-4,3,1],[-3,3,1],[-5,4,1],[-5,5,2]],[[3,3,1],[4,3,1],[3,4,1],[3,5,2]],0,[[-5,4,1],[-5,5,2]]]]){const [f,s]=wdfLine(F,Sd,wing,keep);wdFace('liner',id,label,f,s,id==='drip'?{tags:['horror']}:null);}
// ---- eyeshadow on the lid (on a shut eye the whole lid), and under the eye
const wdfShadow=(front,side,lid)=>[H=>{const S=H.K.shadow;if(H.shut&&lid){for(const dx of [-4,-3])for(const dy of [0,1])H.M(dx,dy,S[3],'skin','c40');}for(const [dx,dy,k] of front)if(!(H.shut&&dy>=-1&&dy<=2))H.M(dx,dy,S[k],'skin','c40');},
  H=>{const S=H.K.shadow;for(const [u,dy,k] of side)if(!(H.shut&&dy>=-1&&dy<=2))H.U(u,dy,S[k],'skin','c40');}];
for(const [id,label,F,Sd,lid] of [
  ['wing','Winged',[[-4,-1,3],[-3,-1,3],[-5,-1,3],[-6,-1,2]],[[4,-1,3],[5,-1,3],[3,-1,3],[2,-1,2]],1],
  ['halo','Halo',[[-4,-1,3],[-3,-1,3],[-5,1,3],[-2,1,3]],[[4,-1,3],[5,-1,3],[3,1,3]],1],
  ['bruised','Bruised',[[-5,3,1],[-4,3,1],[-3,3,1],[-5,2,2],[-4,4,2],[-3,4,2]],[[3,3,1],[4,3,1],[5,3,1],[3,4,2],[4,4,2]],0]]){const [f,s]=wdfShadow(F,Sd,lid);wdFace('shadow',id,label,f,s,id==='bruised'?{tags:['horror']}:null);}
// ---- blush: half the skin's own colour, so it warms a dark cheek instead of cutting it
const wdfBlush=(front,side)=>[H=>{const B=H.K.blush;for(const [dx,dy,k] of front)H.M(dx,dy,B[k],'skin','b');},H=>{const B=H.K.blush;for(const [u,dy,k] of side)H.U(u,dy,B[k],'skin','b');}];
for(const [id,label,F,Sd] of [
  ['wide','Rosy',[[-7,4,2],[-6,4,3],[-5,4,3],[-6,5,2],[-5,5,2]],[[1,4,2],[2,4,3],[3,4,3],[2,5,2]]],
  ['high','Cheekbones',[[-6,3,3],[-5,3,3],[-7,4,2],[-6,4,2]],[[2,3,3],[3,3,3],[2,4,2]]]]){const [f,s]=wdfBlush(F,Sd);wdFace('blush',id,label,f,s);}
// ---- a beauty mark: one deliberate dot high on the cheek (seen side on only from its own side)
wdFace('mole','cheek','Beauty mark',H=>H.P(-4,4,H.K.mole,'skin','d64'),H=>{if(H.f>0)H.U(4,4,H.K.mole,'skin','d64');});
// ---- scars: a raised line clearly lighter than the skin, with a darker edge beside it
const wdfScar=(front,sideE,sideW)=>[H=>{const S=H.K.S;for(const [dx,dy,k] of front)H.P(dx,dy,k==='r'?wdfMix(S[4],[246,196,188],.4):S[1],'skin',k==='r'?'l48':'d36');},
  H=>{const S=H.K.S;for(const [u,dy,k] of (H.f>0?sideE:sideW))H.U(u,dy,k==='r'?wdfMix(S[4],[246,196,188],.4):S[1],'skin',k==='r'?'l48':'d36');}];
// across the eye: down through the brow (breaking it) to the lid, then on below the eye
for(const [id,label,F,E,Wd] of [
  ['eye','Across the eye',[[-4,-4,'r'],[-4,-3,'r'],[-4,-2,'r'],[-4,-1,'r'],[-3,-3,'g'],[-4,3,'r'],[-4,4,'r'],[-4,5,'r'],[-3,4,'g'],[-3,5,'g']],[[4,-4,'r'],[4,-3,'r'],[4,-2,'r'],[4,-1,'r'],[4,3,'r'],[4,4,'r'],[4,5,'r']],[]],
  ['cheek','Cheek slash',[[4,3,'r'],[5,4,'r'],[6,5,'r'],[7,6,'r'],[4,4,'g'],[5,5,'g'],[6,6,'g']],[],[[2,3,'r'],[3,4,'r'],[4,5,'r'],[2,4,'g'],[3,5,'g']]]]){const [f,s]=wdfScar(F,E,Wd);wdFace('scar',id,label,f,s);}
// ---- face paint (paint, with paint2 for the dark parts): it follows the head's light, a cool grey step on its shaded right side and under the brows
const wdfFace=(H,fn,c,m)=>H.fill((dx,dy,k)=>dy>=-6&&dy<=9&&(H.side?dx*H.f>=-1:dx>=-7&&dx<=8)?fn(dx,dy,k):null,c,'skin',m);
const wdfCool=(A,k)=>wdfMix(A[Math.max(0,k)],[96,104,124],.22);
const wdfPaintK=(H,A,dx,dy,k)=>{if(!H.side&&(dx>=6||dy===-1&&dx>=-6&&dx<=7||dy>=8))return wdfCool(A,k-1);if(H.side&&(dy===-1||dy>=8))return wdfCool(A,k-1);return k;};
// the sockets: a rounded dark ring round each eye with the bridge of the nose left light between them; a shut eye's lid is painted too
const WDF_SOCK=[[-6,0],[-6,1],[-6,2],[-5,-1],[-4,-1],[-3,-1],[-2,0],[-2,1],[-2,2],[-5,3],[-4,3],[-3,3],[-5,0],[-5,1],[-5,2],[-4,0],[-3,0],[-4,1],[-3,1],[-4,2],[-3,2]];
const WDF_PAINT=[
  ['skull','Skull',H=>{const A=H.K.paint,B=H.K.paint2;wdfFace(H,(dx,dy,k)=>wdfPaintK(H,A,dx,dy,k),A);for(const [dx,dy] of WDF_SOCK)H.M(dx,dy,B[dy===-1||dy===3||dx===-6||dx===-2?1:0],'skin');
      H.P(0,4,B[0],'skin');H.P(1,4,B[0],'skin');for(let dx=-2;dx<=3;dx++)H.P(dx,6,B[1],'opaque');for(const dx of [-2,0,1,3])H.P(dx,7,B[1],'opaque');},
    H=>{const A=H.K.paint,B=H.K.paint2;wdfFace(H,(u,dy,k)=>wdfPaintK(H,A,u,dy,k),A);for(let dy=-1;dy<=3;dy++)for(let u=2;u<=6;u++)if(!((dy===-1||dy===3)&&(u===2||u===6)))H.U(u,dy,B[dy===-1||dy===3?1:0],'skin');H.U(8,3,B[0],'opaque');H.U(8,4,B[0],'opaque');
      for(let u=5;u<=7;u++)H.U(u,6,B[1],'opaque');H.U(6,7,B[1],'opaque');},{def:{paint:'#e0d8c4',paint2:'#1a1618'},tags:['horror']}],
  ['grin','Stitched grin',H=>{const B=H.K.paint2;for(let dx=-5;dx<=-2;dx++)H.M(dx,6,B[1],'skin','d48');for(const dx of [-5,-3])H.M(dx,5,B[1],'skin','d48'),H.M(dx,7,B[1],'skin','d48');},H=>{const B=H.K.paint2;for(let u=3;u<=5;u++)H.U(u,6,B[1],'skin','d48');H.U(4,5,B[1],'skin','d48');H.U(4,7,B[1],'skin','d48');},{def:{paint2:'#1a1618'},tags:['horror']}],
  // blood tears: two runs of different lengths, each thickening at its end; on dark skin they run brighter red, not darker
  ['tears','Blood tears',H=>{const A=H.K.paint,dk=wdLuma(H.K.S[3])<120;for(const [dx,dy,k] of [[-4,3,3],[-4,4,2],[-4,5,2],[-4,6,1],[-5,6,2],[5,3,3],[5,4,2],[5,5,2],[5,6,2],[5,7,2],[5,8,1],[6,8,2]])H.P(dx,dy,A[dk?Math.min(4,k+2):k],'skin',dk?'l36':'c48');},
    H=>{const A=H.K.paint,dk=wdLuma(H.K.S[3])<120,L=H.f>0?[[4,3,3],[4,4,2],[4,5,2],[4,6,1],[3,6,2]]:[[4,3,3],[4,4,2],[4,5,2],[4,6,2],[4,7,2],[4,8,1],[3,8,2]];for(const [u,dy,k] of L)H.U(u,dy,A[dk?Math.min(4,k+2):k],'skin',dk?'l36':'c48');},{def:{paint:'#8a1a1a'},tags:['horror']}],
  // ash rubbed across the eyes: on the skin only, its top and bottom edges uneven
  ['mask','Ash mask',H=>{const B=H.K.paint2;wdfFace(H,(dx,dy,k)=>{const t=-1-((dx*5+3)%3===0?1:0),b=3+((dx*7+1)%3===0?1:0);return dy>=t&&dy<=b?k:null;},B,'d40');},
    H=>{const B=H.K.paint2;wdfFace(H,(u,dy,k)=>{const uu=u*H.f;if(uu<2)return null;const t=-1-((uu*5+3)%3===0?1:0),b=3+((uu*7+1)%3===0?1:0);return dy>=t&&dy<=b?k:null;},B,'d40');},{def:{paint2:'#3a3a40'}}],
  ['half','Half face',H=>{const A=H.K.paint;wdfFace(H,(dx,dy,k)=>dx<=0?wdfPaintK(H,A,dx,dy,k):null,A);},H=>{if(H.f<0)return;const A=H.K.paint;wdfFace(H,(u,dy,k)=>wdfPaintK(H,A,u,dy,k),A);},{def:{paint:'#e0d8c4'}}],
  ['jester','Jester',H=>{const A=H.K.paint,B=H.K.paint2;wdfFace(H,(dx,dy,k)=>wdfPaintK(H,A,dx,dy,k),A);H.P(0,4,B[3],'skin');H.P(1,4,B[2],'skin');for(let dx=-2;dx<=3;dx++)H.P(dx,6,B[2],'opaque');H.P(0,7,B[3],'opaque');H.P(1,7,B[3],'opaque');
      for(const [dx,dy] of [[-4,4],[-5,5],[-3,5],[-4,6]])H.M(dx,dy,B[2],'skin');},
    H=>{const A=H.K.paint,B=H.K.paint2;wdfFace(H,(u,dy,k)=>wdfPaintK(H,A,u,dy,k),A);H.U(8,3,B[3],'opaque');H.U(8,4,B[2],'opaque');H.U(6,6,B[2],'opaque');H.U(7,6,B[2],'opaque');for(const [u,dy] of [[4,4],[3,5],[5,5],[4,6]])H.U(u,dy,B[2],'skin');},{def:{paint:'#f0ece4',paint2:'#b81a1a'}}]];
for(const [id,label,f,s,o] of WDF_PAINT)wdFace('paint',id,label,f,s,o);
// ---- tattoos: a teardrop under the eye, and a band round bare upper arms (sleeves cover it)
wdFace('tattoo','tear','Teardrop',H=>{const T=H.K.tattoo;H.P(-5,4,T[1],'skin','d72');H.P(-5,5,T[0],'skin','d72');H.P(-4,5,T[1],'skin','d56');},H=>{if(H.f<0)return;const T=H.K.tattoo;H.U(3,4,T[1],'skin','d72');H.U(3,5,T[0],'skin','d72');});
const wdfArms=fn=>H=>{const T=H.K.tattoo;for(let r=2;r<=10;r++){const y=H.top+r;for(let x=0;x<WD_FW;x++){const off=Math.abs(x-H.cx-.5);if(!H.side&&off<5.5)continue;if(H.sk(x,y)>=0&&fn(r,x))H.put(x,y,T[1],null,'d56');}}};
wdFace('tattoo','armband','Arm band',wdfArms(r=>r===4),wdfArms(r=>r===4));
// ---- a brow bar: grey metal (a lit pixel and a shaded one) with dark contact pixels on the skin
const wdfPin=(front,sideE,sideW)=>{const col=(H,k)=>k==='c'?[H.K.pierce[0],'d52']:k==='g'?[H.K.pierce[4],null]:[H.K.pierce[+k],'c40'];
  return [H=>{for(const [dx,dy,k] of front){const [c,m]=col(H,k);H.P(dx,dy,c,'opaque',m);}},H=>{for(const [u,dy,k] of (H.f>0?sideE:sideW)){const [c,m]=col(H,k);H.U(u,dy,c,'opaque',m);}}];};
for(const [pos,id,label,F,E,Wd] of [
  ['pbrow','bar','Brow bar',[[-6,-3,'3'],[-6,-2,'c'],[-6,-1,'2'],[-6,0,'c']],[[2,-3,'3'],[2,-2,'c'],[2,-1,'2'],[2,0,'c']],[]]]){const [f,s]=wdfPin(F,E,Wd);wdFace(pos,id,label,f,s);}
