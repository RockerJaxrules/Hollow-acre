/* ================= the depiction audit, part two (docs/STORY_PLAN.md 8.3): the pictures that showed a child hurt, each changed with
   its words, keeping the same story beat. The lore stays (the Tithe takes children, offscreen).
   - the small grave: the last one is open and empty; a clean sheet lies folded at the bottom with Grandpa's label (not a soaked
     shape in a sheet). The world's open grave is cut from this close-up, so it changes too.
   - the quarry: the person-shaped hollow and its scratches stay; the torn pink nails are gone; a little silver birthday star is
     pressed into the stone at the raised fingertips.
   - the fen: no bodies. A plaited grass rope with its 1872 token and a rag cap caught on it at the pool's edge; under the black water
     more tokens on their ropes; by the hut's door your own coat laid out flat on the peat, a new token tied to its sleeve. The
     world's fen is cut from this close-up, so it changes too.
   - the cold house: the third hook holds a child's coat on a hanger with Agnes's blue ribbon on the hook (drawn in tools/gore4.py)
     and these words say so.
   Lines already saved in a journal are swapped for the new ones. ================= */
const AUD2_TXT=[
  ['graves','Lying in it, wrapped in a bedsheet, is something the shape of a person. The sheet is soaked through, dark, from the inside, and still soaking. It has been here long enough that the flies are fat and slow.<br><br>You don’t pull the sheet back. You don’t have to. Pinned to the chest is a paper label, the kind on a jar of preserves, in Grandpa’s handwriting: <i>for later.</i>',
    'At the bottom of it a bedsheet has been folded square, clean and pressed, the way you would leave one on a bed for a guest. Pinned to it is a paper label, the kind on a jar of preserves, in Grandpa’s handwriting: <i>for later.</i>'],
  ['quarry','Three fingernails are still stuck in the rock, torn out at the root. They are painted pink. One of them has a little silver star on it, the kind girls stick on for a birthday.',
    'Up where the fingertips would be, a little silver star is pressed into the stone, the kind girls stick on for a birthday.'],
  ['cold','The third is wrapped in sacking and tied with twine. It is the size of a nine-year-old. Its feet stick out at the bottom, bare, and the toenails are painted pink, and they are not rotten. Thirty years and they are not rotten.<br><br>There is a ribbon tied round one ankle. Someone has written on the sacking, in chalk: <i>RUTH — KEEP COLD.</i>',
    'The third hook holds only a small coat on a wooden hanger, buttoned to the top, a blue ribbon tied round the hook above it.<br><br>Someone has chalked on the beam over it: <i>RUTH — KEEP COLD.</i>'],
  ['fen','It is lying where the peat has shrunk back from the edge of a pool. A child, brown and soft as an old glove, curled on its side the way children sleep. There is a rope round its neck plaited from grass, and on the rope a wooden token with a year burnt into it: 1872.<br><br>The peat keeps everything. Now you know how to look you can see more of them under the black water, curled up, dozens, each with its rope.<br><br>The one nearest the hut is not old. Its coat is your coat: the same colour, the same torn pocket. Its face is turned down into the peat. You don’t turn it over.',
    'It is lying where the peat has shrunk back from the edge of a pool: a rope plaited from grass, coiled, a small rag cap caught on it, and a wooden token with a year burnt into it: 1872.<br><br>The peat keeps everything. Now you know how to look you can see more of them under the black water, token after token on their ropes, dozens, turning slowly.<br><br>The one nearest the hut is new. Someone has laid a coat out flat on the peat, arms wide, and tied the token to its sleeve. It is your coat: the same colour, the same torn pocket.']];
const AUD2_LORE=[
  ['Something wrapped in a soaked sheet lies in it, labelled in Grandpa’s hand: for later.','A clean sheet lies folded at the bottom, labelled in Grandpa’s hand: for later.'],
  ['Three pink fingernails are still in the stone.','A little silver birthday star is pressed into the stone.'],
  ['Ruth Abernathy is in the cold house by the Black Lake, wrapped in sacking on a meat hook. Thirty years and she has not rotted. She was never taken anywhere.','In the cold house by the Black Lake a child’s coat hangs on the third hook, Agnes’s blue ribbon tied above it: RUTH — KEEP COLD. They have been keeping a place for her.'],
  ['The peat keeps them all. The newest, by the hut, wears your coat.','The peat keeps their tokens, dozens of them. The newest, by the hut, is tied to your coat.']];
(function(){try{for(const [id,a,b] of AUD2_TXT){const bt=SAGA.find(q=>q.id===id);if(bt&&typeof bt.text==='string')bt.text=bt.text.split(a).join(b);}
    for(const [a,b] of AUD2_LORE)for(const bt of SAGA)if(typeof bt.lore==='string')bt.lore=bt.lore.split(a).join(b);}catch(e){}})();
function aud2Lore(){try{if(!Array.isArray(S.lore))return;for(let i=0;i<S.lore.length;i++)for(const [a,b] of AUD2_LORE)if(typeof S.lore[i]==='string'&&S.lore[i].includes(a))S.lore[i]=S.lore[i].split(a).join(b);}catch(e){}}
{const _lg=loadGame;loadGame=function(){const r=_lg.apply(this,arguments);aud2Lore();return r;};}aud2Lore();

// ---- the small grave: the pit, its spoil and the spade as before (gorex374.js gcGraves), and at the bottom a clean sheet folded
// square, lying flat, its layers showing along the front edge; Grandpa's FOR LATER label pinned to it with a string
const aud2Graves=()=>sgtC('a_graves_aud2',156,104,(P)=>{sgtPit(P,156,104,24,26,92,62,3);sgtSpoil(P,132,66,20,14);sgtSpade(P,136,62);
  // rough earth along the pit's lips: clods and bites of turned soil break the straight edges, lit on top, dark under
  const hs=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%101,E=['#2e2014','#4a3624','#5e4630','#7a5c3c'];
  for(let x=22;x<118;x++){const k=hs(x,1);if(k<55){const h=1+(k%3);for(let d=0;d<h;d++)P(x,26-1-d+(k%2),1,1,d===h-1?E[3]:E[2]);}if(k>60){P(x,27,1,1+(k%2),E[0]);}
    const k2=hs(x,9);if(k2<50){const h=1+(k2%3);for(let d=0;d<h;d++)P(x,88+d,1,1,d===0?E[2]:E[1]);}}
  for(let y=24;y<90;y++){const k=hs(3,y);if(k<55){const w=1+(k%3);for(let d=0;d<w;d++)P(24-1-d,y,1,1,d===w-1?E[1]:E[2]);}const k2=hs(7,y);if(k2<55){const w=1+(k2%3);for(let d=0;d<w;d++)P(116+d,y,1,1,d===w-1?E[0]:E[1]);}}
  for(const [cx,cy,r] of [[30,25,3],[61,24,2],[95,25,3],[112,86,2],[40,89,3],[22,58,2]]){for(let y=-r;y<=r;y++)for(let x=-r-1;x<=r+1;x++){const e=(x/(r+1))**2+(y/r)**2;if(e>1)continue;P(cx+x,cy+y,1,1,y<-r*.3?E[3]:e>.6?E[1]:E[2]);}}
  // a clean sheet folded in four, lying flat: two layers showing at the near edge, a crease across the middle,
  // lit along the top and left, shaded down and right, softened corners; its shadow down and right
  const x0=50,y0=56,w=38,h=12,ed=5,C=['#5a5246','#8a8070','#a89e8a','#c4bba8','#ddd6c6','#f2ede2'];
  P(x0+3,y0+h+ed,w,2,'rgba(50,33,37,.6)');P(x0+w,y0+3,3,h+ed,'rgba(50,33,37,.6)');
  P(x0,y0,w,h+ed,C[0]);P(x0+1,y0+1,w-2,h-1,C[4]);
  P(x0+1,y0+1,w-2,1,C[5]);P(x0+1,y0+1,1,h-2,C[5]);P(x0+2,y0+2,w*.55,1,C[5]);   // the lit top and left
  P(x0+w-3,y0+2,2,h-2,C[3]);P(x0+2,y0+h-1,w-3,1,C[3]);   // shaded right and near edges of the top face
  for(let x=3;x<w-3;x++){const y=y0+6+(x>w*.5?1:0);P(x0+x,y,1,1,C[2]);P(x0+x,y+1,1,1,C[5]);}   // the crease across the middle: a shadow line with its lit lip
  for(let y=1;y<h-1;y++)P(x0+Math.round(w*.62),y0+y,1,1,y<6?C[3]:C[2]);   // the second fold, down the long way
  P(x0+1,y0+h,w-2,2,C[3]);P(x0+1,y0+h+2,w-2,1,C[1]);P(x0+1,y0+h+3,w-2,1,C[2]);P(x0+2,y0+h+1,w-4,1,C[4]);   // the near edge: two folded layers
  P(x0+w-2,y0+h,1,ed,C[1]);P(x0,y0,1,1,'rgba(0,0,0,0)');for(const [cx,cy] of [[x0,y0],[x0+w-1,y0],[x0,y0+h+ed-1],[x0+w-1,y0+h+ed-1]])P(cx,cy,1,1,'#3a2818');   // softened corners
  // the label, pinned with a string to the sheet's corner
  const lx=70,ly=64;for(let i=0;i<7;i++)P(lx+2+i,ly-6-i*.6,1,1,'#c8b88a');
  P(lx+9,ly-24,24,15,'#1a120a');P(lx+10,ly-23,22,13,'#f2ead2');P(lx+10,ly-23,22,1,'#ffffff');sgtT(P,'FOR',lx+15,ly-21,'#2a1a2e');sgtT(P,'LATER',lx+11,ly-15,'#2a1a2e');});
try{if(typeof S98_PITKEY!=='undefined')S98_PITKEY.graves='a_graves_aud2';if(SGT_ART._s98_graves)SGT_ART._s98_graves=aud2Graves;
  const _g=SGT_ART.graves;SGT_ART.graves=function(){const o=typeof SGW!=='undefined'&&SGW.objs&&SGW.objs.graves;return (o&&o[0])?_g.apply(this,arguments):aud2Graves();};
  if(typeof S98!=='undefined')delete S98.cut_graves;for(const k of Object.keys(SGT))if(/^s98g_graves/.test(k))delete SGT[k];}catch(e){}

// ---- the quarry: the r5 picture (t360/story337_x1.js st37Quarry5) without the nails, with a silver birthday star at the fingertips
function aud2Quarry(){return st37Cv(ST37W,ST37H,(P)=>{
  // a worked quarry face: beds of stone in uneven courses, each block lit along its top, a dark bedding line under it,
  // vertical joints, the half-pipes of old drill holes, and a few long cracks
  const B=['#3e3a44','#4c4852','#5a5660','#68646e','#78747e','#8a8690'],hq=(a,b)=>st37H(a,b);let y=0,row=0;
  while(y<ST37H){const bh=10+hq(row,3)%7;let x=-(hq(row,5)%23);let col=0;
    while(x<ST37W){const bw=22+hq(row,col+11)%26,tone=1+hq(col,row+7)%3;
      for(let yy=y;yy<y+bh&&yy<ST37H;yy++)for(let xx=Math.max(0,x);xx<Math.min(ST37W,x+bw);xx++){let c=B[tone+(yy<y+2?2:yy>y+bh-3?-1:0)];if(xx<x+1)c=B[0];P(xx,yy,1,1,c);}
      if(hq(col+3,row)%3===0){const dx=x+6+hq(col,row)%Math.max(1,bw-10);for(let yy=y+2;yy<y+bh-1;yy++){P(dx,yy,1,1,B[0]);P(dx+1,yy,1,1,B[4]);}}   // a drill hole's half-pipe
      x+=bw;col++;}
    for(let xx=0;xx<ST37W;xx++)P(xx,y+bh-1,1,1,'#26222c');y+=bh;row++;}
  for(const [x0,y0,l,dx] of [[18,8,26,1],[150,14,30,-1],[160,70,22,1],[24,72,24,-1]])for(let k=0;k<l;k++)P(x0+Math.round(Math.sin(k*.5)*1.5)+Math.round(k*.15*dx),y0+k,1,1,'#221e28');
  const cx=88;const fig=(x,y)=>{const head=((x-cx)/8)**2+((y-26)/9)**2<1;const neck=Math.abs(x-cx)<4&&y>=34&&y<38;const body=Math.abs(x-cx)<15-Math.max(0,(y-60)*.2)&&y>=37&&y<78;
    const sd=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-ax-t*dx,py-ay-t*dy);};
    const armL=sd(x,y,cx-12,41,cx-36,13)<4.4;const armR=sd(x,y,cx+12,41,cx+36,13)<4.4;const legL=x>cx-12&&x<cx-2&&y>=76&&y<106;const legR=x>cx+2&&x<cx+12&&y>=76&&y<106;
    return head||neck||body||armL||armR||legL||legR;};
  for(let y=0;y<ST37H;y++)for(let x=30;x<150;x++){if(!fig(x,y)){if(fig(x-1,y-1)&&(!fig(x,y-1)||!fig(x-1,y)))P(x,y,1,1,'#d4d0dc');else if(fig(x+1,y+1)&&(!fig(x+1,y)||!fig(x,y+1)))P(x,y,1,1,'#2a2630');continue;}
    let up=0;while(up<6&&fig(x,y-up-1))up++;let lf=0;while(lf<6&&fig(x-lf-1,y))lf++;let dn=0;while(dn<4&&fig(x,y+dn+1))dn++;let rt=0;while(rt<4&&fig(x+rt+1,y))rt++;
    let col='#262430';if(((x*3+y*7)%19)===0)col='#2e2c36';
    if(rt<=2&&rt<lf)col=rt===0?'#a8a4b2':rt===1?'#8a8696':'#6e6a7a';if(dn<=2&&dn<up)col=dn===0?'#b4b0be':dn===1?'#948f9e':'#76727e';
    if(up<=3&&up<=dn)col=up<=1?'#060508':'#0e0c12';if(lf<=3&&lf<=rt&&!(dn<=2&&dn<up))col=lf<=1?'#060508':'#100e14';P(x,y,1,1,col);}
  const scr=(x0,y0,x1,y1,n,sd)=>{for(let f=0;f<n;f++){const o=f*2,l=1-.12*((st37H(f,sd)%4));const ex=x0+o+(x1-x0)*l,ey=y0+(y1-y0)*l;const N=Math.ceil(Math.abs(ey-y0));
      for(let k=1;k<=N;k++){const qx=Math.round(x0+o+(ex-x0-o)*k/N+(st37H(k>>2,f+sd)%4===0?1:0)),qy=Math.round(y0+(ey-y0)*k/N);if(fig(qx,qy)&&fig(qx+1,qy)){P(qx,qy,1,1,'#a6a2b0');P(qx+1,qy,1,1,'#08060a');}}}};
  scr(cx-10,44,cx-6,70,4,1);scr(cx+3,48,cx+6,74,3,2);scr(cx-4,20,cx-2,31,3,3);scr(cx-8,82,cx-7,102,2,4);
  // the scratches the fingertips left, raking down the raised arm, as before
  [[cx+31,10],[cx+35,8],[cx+39,10]].forEach(([nx,ny],k)=>{const l=16+k*3;for(let t=0;t<l;t++){const x=Math.round(nx+1-t*.78),y=Math.round(ny+4+t*.62);P(x,y,1,1,'#b0acba');P(x+1,y,1,1,'#08060a');}});
  // a small tin star, pressed into the stone where the fingertips were: seven pixels across, a dark outline, a four-step ramp lit top-left
  const sx=cx+31,sy=8,SM=['.....#.....','....###....','....###....','###########','.#########.','..#######..','..#######..','.####.####.','.###...###.','.#.......#.'];
  const T=['#1a1620','#7c8494','#a8b0bc','#d4dae2','#f6f8fc'];
  for(let y=0;y<SM.length;y++)for(let x=0;x<SM[y].length;x++){if(SM[y][x]!=='#')continue;for(const [ox,oy] of [[-1,0],[1,0],[0,-1],[0,1]]){const yy=y+oy,xx=x+ox;if(!SM[yy]||SM[yy][xx]!=='#')P(sx+xx,sy+yy,1,1,T[0]);}}
  for(let y=0;y<SM.length;y++)for(let x=0;x<SM[y].length;x++)if(SM[y][x]==='#')P(sx+x,sy+y,1,1,T[x+y<7?4:x+y<10?3:x+y<13?2:1]);
  P(sx+5,sy+4,1,1,'#ffffff');
});}
try{SGT_DRAW.quarry=aud2Quarry;st37Quarry=aud2Quarry;}catch(e){}

// ---- the fen: the sights.js picture (bank, black water, the hut, the reeds) with tokens on ropes in place of the bodies, and your
// coat laid out flat by the hut's door with the newest token tied to its sleeve
const AUD2_SH=[];   // the fen's shadows, painted translucent over the ground in the close-up (a cut would bake them solid)
function aud2FenArt(){return sgtC('a_fen_aud',160,104,(P0)=>{AUD2_SH.length=0;const P=(x,y,w,h,c)=>{if(c==='rgba(50,33,37,.6)'){AUD2_SH.push([x,y,w,h]);return;}P0(x,y,w,h,c);};const lk=sgtLook(),hs=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%97;
  const edge=x=>Math.round(52+Math.sin(x*.05)*4+Math.sin(x*.19)*1.5);
  for(let y=0;y<104;y++)for(let x=0;x<160;x++){const e=edge(x),h=hs(x,y);
    P(x,y,1,1,y<e?(h<3?'#45311c':h<9?'#221710':'#2d2015'):y===e?'#5a4428':y<e+4?(y===e+3?'#0a0806':'#1a120c'):(h<2?'#1a2a30':'#0b1215'));}
  for(const [rx,ry,rw] of [[18,70,8],[66,62,6],[100,82,10],[140,66,7],[40,94,5]])P(rx,ry,rw,1,'#1e3036');
  for(let y=0;y<28;y++)for(let x=118;x<160;x++)P(x,y,1,1,(x-118)%5===0?'#1e1810':y<3?'#141008':(x+y)%13===0?'#4a3e2c':'#3a3024');
  P(118,0,1,28,'#4e4232');P(131,9,12,19,'#100c08');P(130,8,14,1,'#5a4a36');P(130,8,1,20,'#5a4a36');P(143,8,1,20,'#2a2218');P(118,28,42,2,'#150f0a');
  for(const rx of [6,30,58,92,150]){const e=edge(rx);for(let i=0;i<6;i++){const hh=5+((rx+i*7)%5);P(rx+i,e-hh+2,1,hh,i%2?'#4a4a24':'#5e5a2c');P(rx+i,e-hh+2,1,1,'#9a8a48');}}
  const SHD='rgba(50,33,37,.6)';
  // on the bank: two stakes with a straw rope sagging between them, and the year tokens hung from it on short strings
  const W=['#2a1a0c','#5a3c1e','#7a5630','#9a7444'];
  for(const sx of [8,54]){P(sx+2,34,2,10,SHD);P(sx-1,22,4,18,W[0]);P(sx,23,2,16,W[2]);P(sx,23,1,16,W[3]);P(sx+1,38,1,1,W[1]);}   // stakes, lit left, shadow down-right
  const ry=x=>Math.round(25+Math.sin((x-10)/44*Math.PI)*5);
  for(let x=10;x<55;x++){const y=ry(x);P(x,y-1,1,1,'#2a2210');P(x,y,1,1,(x%3)?'#c8b468':'#8a7a3a');P(x,y+1,1,1,(x%3)?'#a89448':'#6a5a2a');P(x,y+2,1,1,'#2a2210');}   // the straw rope, two pixels, plaited
  const TK=['#2a1a0a','#9a7a50','#c8a878','#e2c89a'];
  for(const tx of [17,27,37,46]){const ty=ry(tx)+3;P(tx+3,ty,1,2,'#6a5a2a');   // the string
    P(tx,ty+2,7,8,TK[0]);P(tx+1,ty+3,5,6,TK[2]);P(tx+1,ty+3,5,1,TK[3]);P(tx+1,ty+3,1,6,TK[3]);P(tx+5,ty+4,1,5,TK[1]);P(tx+1,ty+8,5,1,TK[1]);   // a pale wooden token, lit top-left
    P(tx+2,ty+5,1,2,'#4a2a12');P(tx+4,ty+5,1,2,'#4a2a12');P(tx+3,ty+5,1,1,'#4a2a12');   // a year burnt into it
    P(tx+2,ty+10,6,1,SHD);}
  // fallen on the bank under them, the one you can read: 1872
  P(24,45,22,2,SHD);P(22,40,20,10,'#2a1a0a');P(23,41,18,8,'#c8a878');P(23,41,18,1,'#e2c89a');P(23,48,18,1,'#9a7a50');sgtT(P,'1872',24,43,'#2a1406');
  // by the hut: a coat laid out flat on the peat, collar at the top, the sleeves spread a little, V lapels, buttons down the front,
  // empty; a muted version of your shirt's colour; its shadow down and right
  const cx=86,y0=20,H=28,sh=lk.shirt,C=[sgtShade(sh,.3),sgtShade(sh,.5),sgtShade(sh,.68),sgtShade(sh,.84),sgtShade(sh,1),sgtShade(sh,1.22)];
  const hw=v=>v<3?6+v:v<H-6?9:9+(v-(H-6))*.4;   // shoulders, body, the hem flaring a little
  for(let v=0;v<=H;v++){const w=Math.round(hw(v));P(cx-w+3,y0+v+3,2*w+1,1,'rgba(50,33,37,.6)');}
  for(const sg of [-1,1])for(let k=0;k<17;k++){const x=cx+sg*(9+Math.round(k*.42)),y=y0+3+k;P(x+sg*3+2,y+2,2,2,'rgba(50,33,37,.6)');for(let t=0;t<4;t++)P(x+sg*t,y,1,1,t===3||k===16?C[0]:sg<0?(t<2?C[4]:C[3]):(t<1?C[3]:C[2]));}   // the sleeves, angled out
  for(let v=0;v<=H;v++){const w=Math.round(hw(v));for(let u=-w;u<=w;u++){const e=Math.abs(u)===w||v===0||v===H;P(cx+u,y0+v,1,1,e?C[0]:u<-w*.45?C[4]:u<w*.35?C[3]:C[2]);}}   // the body, lit on the left
  for(let v=1;v<11;v++){const w=Math.max(0,Math.round((11-v)*.55));for(let k=0;k<=w;k++){P(cx-1-k,y0+v,1,1,C[5]);P(cx+1+k,y0+v,1,1,C[3]);}P(cx,y0+v,1,1,C[1]);}   // the lapels, a V from the collar
  P(cx-5,y0-1,11,2,C[1]);P(cx-4,y0-1,9,1,C[3]);   // the collar
  for(let v=13;v<H-1;v+=5){P(cx,y0+v,2,2,C[0]);P(cx,y0+v,1,1,sgtShade(sh,1.6));}   // buttons down the front
  P(cx+3,y0+17,5,4,C[1]);P(cx+3,y0+17,5,1,C[0]);P(cx+6,y0+20,2,1,C[2]);   // the torn pocket
  // a new token tied to the right sleeve's cuff, its year not burnt yet
  {const tx=cx+16,ty=y0+20;P(tx+2,ty-1,1,2,'#6a5a2a');P(tx,ty+1,7,8,TK[0]);P(tx+1,ty+2,5,6,TK[2]);P(tx+1,ty+2,5,1,TK[3]);P(tx+1,ty+2,1,6,TK[3]);P(tx+2,ty+9,6,1,SHD);}
});}
function aud2Shade(g){g.fillStyle='rgba(50,33,37,.6)';for(const [x,y,w,h] of AUD2_SH)g.fillRect(Math.round(x),Math.round(y),w,h);}
// the turf-cutter's hut, in the close-up only (in the world the hut stands further off): turf walls in courses, a grassed turf
// roof, a dark doorway with a lit lintel; about 26 px across
function aud2Hut(P){const x0=128,y0=2,w=26,h=24,T=['#1e170e','#3a2c1a','#4e3c22','#5e4a2c'],G=['#2e3a18','#4a5a24','#6a7a34','#8a9a48'];
  P(x0+3,y0+h,w,3,'rgba(50,33,37,.6)');
  P(x0,y0+6,w,h-6,T[0]);for(let y=y0+7;y<y0+h-1;y++)for(let x=x0+1;x<x0+w-1;x++)P(x,y,1,1,((y-y0)%4===2)?T[1]:(x+((y-y0)>>2)*3)%7===0?T[1]:x<x0+4?T[3]:T[2]);   // turf courses
  for(let x=x0-2;x<x0+w+2;x++){const t=Math.round(Math.abs(x-x0-w/2)*.34);for(let y=y0+t;y<y0+8;y++)P(x,y,1,1,y===y0+t?G[3]:y<y0+t+2?G[2]:y<y0+7?G[1]:G[0]);}   // the turf roof, grass on it
  for(const tx of [x0+2,x0+9,x0+17,x0+23])P(tx,y0+Math.round(Math.abs(tx-x0-w/2)*.34)-1,1,2,G[3]);
  const dx=x0+10,dy=y0+11;P(dx-1,dy-1,8,h-10,T[0]);P(dx,dy,6,h-11,'#08060a');P(dx-1,dy-2,8,1,'#7a6040');P(dx-1,dy-1,1,h-10,T[3]);}   // the doorway
try{SGT_ART.fen=function(){try{s98FenWorld();const o=s98FenObj(),c=S98.fenCut2;if(o&&c){const d=S98_FEN;return sgtC('s98g_fen_aud',c.width,c.height,(P,g)=>{g.drawImage(f98Ground({x:o.x,z:o.z},c.width,c.height,d.S,d.ax,d.ay,{skip:[o]}),0,0);aud2FenArt();aud2Shade(g);g.drawImage(c,0,0);aud2Hut(P);});}}catch(e){}
  return sgtC('a_fen_aud_hut',160,104,(P,g)=>{const a=aud2FenArt();g.drawImage(a,0,0);aud2Shade(g);aud2Hut(P);});};}catch(e){}
try{s98FenCut=function(){if(S98.fenCut)return S98.fenCut;const c=aud2FenArt();return S98.fenCut=s98Cut(c,['#45311c','#221710','#2d2015'],(x,y)=>false);};}catch(e){}
