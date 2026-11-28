/* ================= t352 the world and interiors pass (the last of the final polish, t337/run_m1/NOTES.md items 7, 12-14).
   1. ROOMS OPEN WITH YOU IN VIEW: the room camera now knows where the HUD sits. The goal bar across the top and the toolbar
      along the bottom are taken off the view, so a room that fits is centred in what you can actually see; a big room opens on
      you at the door, standing above the toolbar with as much of the room as fits above you (it used to pan down from the back
      wall with you under the toolbar), and as you walk in the camera stops with the back wall just under the goal bar. ================= */
const W52={t:0,top:0,bot:0};
function w52Pads(){const now=performance.now();if(now-W52.t<400)return W52;W52.t=now;
  try{const v=document.getElementById('view');if(!v)return W52;const vr=v.getBoundingClientRect();if(!vr.height)return W52;const sc=vr.height/VH;
    const x0=vr.left+vr.width*.3,x1=vr.left+vr.width*.7;let top=vr.top,bot=vr.bottom;
    const vis=e=>{if(!e||e.hidden)return null;const c=getComputedStyle(e);if(c.display==='none'||c.visibility==='hidden'||+c.opacity<.05)return null;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.right>x0&&r.left<x1?r:null;};
    for(const id of ['objective','clock','stat']){const r=vis(document.getElementById(id));if(r&&r.top<vr.top+vr.height*.4)top=Math.max(top,r.bottom);}
    for(const id of ['hotbar','buttons','btnBag','btnUse']){const r=vis(document.getElementById(id));if(r&&r.bottom>vr.top+vr.height*.6)bot=Math.min(bot,r.top);}
    const nt=Math.max(0,(top-vr.top)/sc/PPM),nb=Math.max(0,(vr.bottom-bot)/sc/PPM);if(nt>0&&nb>0){W52.top=nt;W52.bot=nb;W52.ok=true;}else{if(!W52.ok){W52.top=nt;W52.bot=nb;}W52.t=0;}}catch(e){}   /* (while a door fades, the toolbar is hidden for a frame or two: keep the last real measure and look again next frame) */
  return W52;}
// the camera's z inside a room: the room's span is the back wall's top (3 m up) to just past the front wall
function w52RoomZ(R,hh){const p=w52Pads(),tp=p.top+.2,bp=p.bot+.25,top=R.oz-3,bot=R.oz+R.d+.6;
  if(bot-top<=2*hh-tp-bp)return (top+bot)/2-(tp-bp)/2;
  return clamp(P.z-.6-(tp-bp)/2,top+hh-tp,bot-hh+bp);}
function w52RoomTop(R,hh){return w52RoomZ(R,hh);}   /* no more pan down from the back wall with you off the bottom of the screen: a big room opens on you */
/* 2. THE FESTIVALS FEEL FINISHED: each of the four days dresses the square its own way.
   Harvest Market: produce on every table (apples in baskets, jam and honey, squash and gourds, bread and a pie), crates and a
   chalk price slate by the tables, green-and-gold pennants. Pumpkin Weigh-in: pumpkin heaps on straw round the scale and a
   ribbon board, orange pennants. Lantern Dance: the lanterns lit after sundown, couples turning on the boards. Hollow Fair:
   red-and-cream pennants. Drawn in code in the game's palette, 1 px dark outline, lit from the top left. */
function w52Reg(name,cv,ax,ay){const src='w52:'+name;IMG[src]=cv;SPR[name]=Object.assign({src,fw:cv.width,fh:cv.height,ax,ay});}
function w52Cv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const px=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(x|0,y|0,ww|0,hh|0);};fn(g,px);return c;}
const W52C={ol:'#1e120a',red:['#5e1410','#86201a','#b8342a','#dc5a44','#f08a6a'],grn:['#22381a','#36561e','#4e7a26','#74a03a','#a4c860'],
  org:['#5a1e04','#8a3206','#c0500e','#e0701e','#f49a40','#fcc070'],gold:['#5a3a08','#8a5e10','#c08a20','#e8b440','#fcdc80'],
  wood:['#2e1a0c','#4a2c16','#6a4222','#8a5c32','#ac7c4a','#cca070'],cream:['#6a5a44','#9a8a6c','#c8b898','#e8dcbc','#f8f0dc'],
  jar:['#2a1830','#4a2448','#7a3456','#a84a5e'],glass:['#8aa4ac','#c8dce0','#eef6f6'],straw:['#6a5418','#9a7c28','#c8a840','#e8cc6a']};
// a round fruit: dark rim, body, lit top-left dot
function w52Fruit(px,x,y,r,P){px(x-r,y-r+1,r*2,r*2-2,W52C.ol);px(x-r+1,y-r,r*2-2,r*2,W52C.ol);px(x-r+1,y-r+1,r*2-2,r*2-2,P[1]);px(x-r+1,y-r+1,r*2-3,r*2-3,P[2]);px(x-r+1,y-r+1,Math.max(1,r-1),Math.max(1,r-1),P[3]);px(x-r+2,y-r+1,1,1,P[4]||P[3]);}
function w52Basket(px,x,y,w){const W=W52C.wood;px(x,y,w,6,W52C.ol);px(x+1,y,w-2,5,W[2]);for(let i=x+1;i<x+w-1;i+=2)px(i,y+1,1,4,W[3]);px(x+1,y+4,w-2,1,W[1]);}
const W52_GOODS={
  apples:(g,px)=>{w52Basket(px,3,11,18);for(const [x,y,c] of [[6,10,'red'],[10,9,'red'],[14,10,'grn'],[18,10,'red'],[8,7,'red'],[13,7,'red'],[16,7,'grn']])w52Fruit(px,x,y,2,W52C[c]);
    w52Basket(px,26,11,18);for(const [x,y,c] of [[29,10,'grn'],[33,9,'grn'],[37,10,'grn'],[41,10,'grn'],[31,7,'grn'],[36,7,'red'],[39,7,'grn']])w52Fruit(px,x,y,2,W52C[c]);
    w52Fruit(px,48,14,2,W52C.red);w52Fruit(px,22,15,2,W52C.red);},
  jars:(g,px)=>{const jar=(x,y,cont,lid)=>{px(x,y,6,9,W52C.ol);px(x+1,y+2,4,6,W52C.glass[0]);px(x+1,y+3,4,5,cont[2]);px(x+1,y+3,1,4,cont[3]);px(x+1,y,4,2,lid);px(x+1,y,2,1,'#f4ecd8');px(x+4,y+3,1,1,W52C.glass[2]);};
    jar(3,6,W52C.red,'#d8c8a8');jar(10,6,W52C.jar,'#c84a34');jar(17,6,W52C.red,'#d8c8a8');jar(24,6,W52C.gold,'#5a7a3a');jar(31,6,W52C.jar,'#d8c8a8');
    const pot=(x,y)=>{px(x,y,8,9,W52C.ol);px(x+1,y+1,6,7,W52C.gold[2]);px(x+1,y+1,2,6,W52C.gold[3]);px(x+2,y,4,2,W52C.gold[1]);px(x+2,y+3,4,1,W52C.gold[4]);};pot(38,6);pot(45,6);},
  squash:(g,px)=>{const pump=(x,y,r)=>{w52Fruit(px,x,y,r,W52C.org);px(x,y-r-1,1,2,W52C.grn[1]);px(x-1,y-r+1,1,r*2-3,W52C.org[1]);};pump(8,10,4);pump(19,11,3);pump(41,10,4);
    for(const [x,y] of [[27,11],[33,12]]){px(x-3,y-2,7,5,W52C.ol);px(x-2,y-1,5,3,W52C.grn[2]);px(x-2,y-1,2,1,W52C.grn[3]);px(x+3,y-1,2,2,W52C.cream[2]);}
    w52Fruit(px,48,13,2,W52C.gold);w52Fruit(px,14,14,2,W52C.gold);},
  bread:(g,px)=>{const loaf=(x,y)=>{px(x,y+1,11,6,W52C.ol);px(x+1,y,9,7,W52C.ol);px(x+1,y+1,9,5,W52C.gold[2]);px(x+1,y+1,9,2,W52C.gold[3]);for(let i=x+3;i<x+10;i+=3)px(i,y+1,1,2,W52C.gold[1]);};
    loaf(3,6);loaf(14,7);const pie=(x,y)=>{px(x,y+2,16,5,W52C.ol);px(x+1,y+1,14,5,W52C.ol);px(x+1,y+2,14,3,W52C.gold[3]);for(let i=x+2;i<x+15;i+=3)px(i,y+2,1,3,W52C.red[2]);px(x+1,y+5,14,1,W52C.cream[2]);};pie(28,7);
    px(46,9,6,5,W52C.ol);px(47,10,4,3,W52C.cream[3]);}};
// pennants on a rope between two posts, the same frame as the lantern strings
function w52Pennants(cols){return w52Cv(136,116,(g,px)=>{const W=W52C.wood;
  for(const x of [3,129]){px(x,6,5,110,W52C.ol);px(x+1,7,3,108,W[2]);px(x+1,7,1,108,W[3]);px(x,112,5,4,W52C.ol);}
  const ropeY=x=>10+Math.round(12*Math.sin(Math.PI*(x-6)/124));for(let x=6;x<130;x++){px(x,ropeY(x),1,1,W52C.ol);}
  let k=0;for(let x=10;x<124;x+=9){const y=ropeY(x+3)+1,c=cols[k++%cols.length];for(let r=0;r<8;r++){const w=Math.max(1,7-r);px(x+(7-w)/2-1,y+r,w+2,1,W52C.ol);px(x+(7-w)/2,y+r,w,1,r<2?c[1]:c[0]);}}});}
const W52S={};
function w52MakeArt(){if(W52S.done)return;W52S.done=1;
  for(const [k,fn] of Object.entries(W52_GOODS))w52Reg('w52_goods_'+k,w52Cv(54,18,fn),27,18+27);
  w52Reg('w52_pen_market',w52Pennants([['#4e7a26','#74a03a'],['#c08a20','#e8b440'],['#c8b898','#e8dcbc']]),68,113);
  w52Reg('w52_pen_weigh',w52Pennants([['#c0500e','#e0701e'],['#8a5e10','#c08a20'],['#6a4222','#8a5c32']]),68,113);
  w52Reg('w52_pen_fair',w52Pennants([['#b8342a','#dc5a44'],['#c8b898','#f8f0dc']]),68,113);
  // a produce crate on the ground, a hay bale, a chalk price slate on legs, a pumpkin heap on straw, a ribbon board
  w52Reg('w52_crate',w52Cv(26,20,(g,px)=>{const W=W52C.wood;px(1,7,24,12,W52C.ol);px(2,8,22,10,W[2]);px(2,8,22,2,W[4]);px(2,12,22,1,W[1]);px(2,16,22,1,W[1]);
    for(const [x,y,c] of [[5,6,'red'],[9,5,'red'],[13,6,'grn'],[17,5,'red'],[21,6,'red'],[7,3,'red'],[15,3,'grn'],[11,3,'red'],[19,3,'red']])w52Fruit(px,x,y,2,W52C[c]);}),13,19);
  w52Reg('w52_hay',w52Cv(30,18,(g,px)=>{const S2=W52C.straw;px(1,3,28,14,W52C.ol);px(2,2,26,14,W52C.ol);px(2,3,26,12,S2[2]);px(2,3,26,3,S2[3]);px(2,13,26,2,S2[1]);
    for(let x=4;x<27;x+=3)px(x,6,1,6,S2[1]);px(9,3,1,12,'#6a3a10');px(20,3,1,12,'#6a3a10');}),15,17);
  w52Reg('w52_slate',w52Cv(22,26,(g,px)=>{px(1,1,20,14,W52C.ol);px(2,2,18,12,'#2a2e2c');px(2,2,18,1,'#3e4442');
    for(const [x,y,w] of [[4,4,6],[12,4,5],[4,7,8],[14,7,3],[4,10,5],[11,10,6]])px(x,y,w,1,'#d8dccc');px(5,15,2,10,W52C.ol);px(15,15,2,10,W52C.ol);px(5,15,1,10,W52C.wood[3]);px(15,15,1,10,W52C.wood[3]);}),11,25);
  w52Reg('w52_pumpheap',w52Cv(40,26,(g,px)=>{const S2=W52C.straw;px(2,18,36,7,W52C.ol);px(3,19,34,5,S2[2]);for(let x=4;x<36;x+=3)px(x,19,1,2,S2[3]);
    const pump=(x,y,r)=>{w52Fruit(px,x,y,r,W52C.org);px(x-1,y-r+1,1,r*2-3,W52C.org[1]);px(x+2,y-r+2,1,r*2-4,W52C.org[1]);px(x,y-r-2,2,3,W52C.ol);px(x,y-r-1,1,2,W52C.grn[2]);};
    pump(10,16,6);pump(26,17,6);pump(18,10,5);pump(33,19,3);}),20,24);
  w52Reg('w52_ribbons',w52Cv(24,36,(g,px)=>{px(1,1,22,16,W52C.ol);px(2,2,20,14,W52C.wood[3]);px(2,2,20,1,W52C.wood[4]);
    const ros=(x,c)=>{px(x-3,4,7,7,W52C.ol);px(x-2,5,5,5,c[0]);px(x-1,6,3,3,c[1]);px(x-2,11,2,4,c[0]);px(x+1,11,2,4,c[0]);};
    ros(6,['#2a4a9a','#8aa8e8']);ros(12,['#a82a2a','#e88a7a']);ros(18,['#c89a20','#f8e08a']);px(10,17,4,19,W52C.ol);px(11,17,2,19,W52C.wood[2]);}),12,35);}
const W52F={objs:{},dance:[]};
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{w52BuildFest();}catch(e){console.warn('w52 fest',e);}return r;};}
function w52BuildFest(){w52MakeArt();if(typeof F2P==='undefined'||typeof squarePos==='undefined')return;const O=W52F.objs={};const q=squarePos;
  const mk=(k,spr,x,z,kind)=>{const o=obj(spr,x,z,{kind:kind||'prop',hide:true,noCol:true});(O[k]=O[k]||[]).push(o);return o;};
  const goods=['apples','jars','squash','bread'];F2P.tables.forEach((p,i)=>mk('market','w52_goods_'+goods[i%4],p.x,p.z+.02));
  mk('market','w52_crate',52.0,6.1);mk('market','w52_crate',59.3,6.0);mk('market','w52_hay',51.2,5.0);mk('market','w52_slate',57.3,6.3);
  mk('weigh','w52_pumpheap',F2P.scale.x+2.1,F2P.scale.z-.4);mk('weigh','w52_pumpheap',F2P.scale.x-2.2,F2P.scale.z-.4);mk('weigh','w52_hay',F2P.scale.x+3.6,F2P.scale.z-1.0);
  mk('weigh','w52_ribbons',F2P.scale.x-1.2,F2P.scale.z-1.1);mk('weigh','w52_pumpheap',F2P.carve.x+1.6,F2P.carve.z+1.2);
  for(const k of ['market','weigh','fair'])for(const dx of [-6.8,6.8]){if(k==='weigh'&&dx>0)continue;mk('pen_'+k,'w52_pen_'+k,q.x+dx,q.z+5.2);}   /* (r2) no string across the front of the scale */}
// the dressing follows the day; the plain lantern strings only go up for the dance
{const _fd=fDress;fDress=function(){const r=_fd.apply(this,arguments);try{w52Dress();}catch(e){}return r;};}
function w52Dress(){const f=typeof fToday==='function'&&fToday(),w=typeof fWedding==='function'&&fWedding();const on=!!(f||w)&&!S.room;const k=f&&f.k;
  for(const [key,list] of Object.entries(W52F.objs))for(const o of list){const want=key==='market'?k==='market':key==='weigh'?k==='weigh':key==='pen_'+k&&!w;o.hide=!(on&&want);}
  if(typeof FDEC!=='undefined')for(const o of FDEC)if(o.spr==='f_lanterns')o.hide=!on||!!(k&&k!=='dance'&&!w);}
// the lanterns light after sundown: a warm point on every lantern and a pool on the boards
const W52L={pts:null};
function w52LanternPts(){if(W52L.pts)return W52L.pts;const m=SPR.f_lanterns,im=m&&IMG[m.src];if(!im||!im.complete||!im.width)return null;
  try{const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;const g=c.getContext('2d');g.drawImage(im,m.x||0,m.y||0,m.fw,m.fh,0,0,m.fw,m.fh);
    const d=g.getImageData(0,0,m.fw,40).data;const cols=[];for(let x=0;x<m.fw;x++){let n=0,sy=0;for(let y=0;y<40;y++){const o=(y*m.fw+x)*4;if(d[o+3]>200&&d[o]>200&&d[o+1]>150&&d[o+2]<190){n++;sy+=y;}}cols.push(n?sy/n:-1);}
    const pts=[];let x=0;while(x<m.fw){if(cols[x]>=0){let a=x,s=0,n=0;while(x<m.fw&&cols[x]>=0){s+=cols[x];n++;x++;}pts.push([(a+x-1)/2-m.ax,s/n-m.ay]);}x++;}W52L.pts=pts;}catch(e){W52L.pts=[];}return W52L.pts;}
{const _ll=lifeLight;lifeLight=function(t,L){const r=_ll.apply(this,arguments);try{const f=typeof fToday==='function'&&fToday();if(f&&f.k==='dance'&&!S.room&&S.hour>=17&&S.hour<=20.2){const pts=w52LanternPts()||[];
    for(const o of FDEC){if(o.spr!=='f_lanterns'||o.hide)continue;const X=sx(o.x),Y=sz(o.z);if(X<-160||X>VW+160)continue;for(const [dx,dy] of pts)glowAt(X+dx,Y+dy,14+Math.sin(t*3+dx)*1.5,[255,200,120],.8*L);
      glowAt(X,Y-30,110,[255,170,90],.35*L);}
    if(FDEC.floor&&!FDEC.floor.hide)glowAt(sx(FDEC.floor.x),sz(FDEC.floor.z)-28,170,[255,180,100],.45*L);}}catch(e){}return r;};}
// couples on the boards at the dance: up to four pairs turn slowly round each other, facing their partner
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{w52Dance(dt);}catch(e){}return r;};}
function w52Dance(dt){const f=typeof fToday==='function'&&fToday();const live=f&&f.k==='dance'&&!S.room&&S.hour>=17&&S.hour<19.75&&FDEC.floor&&!FDEC.floor.hide;
  if(!live){W52F.dance=[];return;}const fl=FDEC.floor,t=performance.now()/1000;
  if(!W52F.dance.length){const pool=npcs.filter(n=>n.vis!==false&&Math.hypot(n.x-fl.x,n.z-fl.z)<13&&!/hale|kid|finn|iris|bram|pip/i.test(n.def.id)).sort((a,b)=>Math.hypot(a.x-fl.x,a.z-fl.z)-Math.hypot(b.x-fl.x,b.z-fl.z));W52F.dance=pool.slice(0,8);}
  const D=W52F.dance,C=D.length>>1,sp=C<=2?2.2:C===3?1.6:1.25;for(let i=0;i+1<D.length;i+=2){const c=i/2,cx=fl.x+(c-(C-1)/2)*sp,cz=fl.z-.55+(c%2?.3:-.1),a=t*1.3+c*1.7;
    const ox=Math.cos(a)*.4,oz=Math.sin(a)*.22;const A=D[i],B=D[i+1];A.x=cx+ox;A.z=cz+oz;B.x=cx-ox;B.z=cz-oz;
    const face=(n,dx,dz)=>{n.dir=Math.abs(dx)>Math.abs(dz)*1.5?(dx>0?'E':'W'):(dz>0?'S':'N');};face(A,-ox,-oz);face(B,ox,oz);
    for(const n of [A,B]){n.clip='walk';n.t=(n.t||0)+dt*.6;n.target=null;n.wait=1;}}}
/* 3. HOMES VARY. The houses all stood the same way: a row along the back wall, the bed back right, a table in the middle, a rug
   by the door. Now each household lays its room out its own way, with the furniture art the game already has:
   kitchen at the back and the bed in the front corner (Agnes, Otto, Ashby), bed in the back corner and work in the middle
   (Thorne's stone, Vale's sewing), bed in the front corner (Pike), the doctor's examining cot in the middle of Ashby's,
   a long scrubbed table at Otto's, and the Lantern Inn becomes a guest house (pigeonholes, trunks, a long supper table,
   armchairs by the fire) instead of a second tavern. Silas, Quill, Hale, Cora, Dunn, Fenn and Kerrigan keep theirs (heart
   scenes are staged in some of them); June's rooms and Ward's schoolhouse went back to their old rooms after the judge (r2). */
function w52Fp(spr,kind){if(kind==='flat')return null;if(/^in_bed|^in_bedbrass|^in_bedfour|^in_bedplain|^in_mattress/.test(spr))return [-.85,-2.1,.85,0];if(spr==='in_childbed')return [-.55,-1.8,.55,0];
  const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;const dep=/table|desk|counter|ctr_/.test(spr)?.45:/chair|stool|childchair/.test(spr)?.25:.35;return [-hw,-dep,hw,0];}
const W52H={
 home_agnes:[['in_mirror',.5,-.45,'flat'],['in_photowall',6.0,-.9,'flat'],['in_calendar',3.0,-.45,'flat'],['in_stove',1.0,.95],['in_shelf_jars',3.9,.62],['in_clock',4.95,.55],['in_hopechest',6.0,1.25],
   ['in_table',2.3,3.0],['in_chair',1.2,3.05],['in_chairN',2.3,3.65],['t_candle',1.95,3.03],['t_vase',2.7,3.04],['in_rug',4.4,4.6,'flat'],['in_rocker',3.4,3.9],['in_doll_sit',3.4,3.92],['in_knit',4.3,4.0],
   ['in_cradle',7.4,2.6],['in_bed',7.55,5.65]], 
 home_otto:[['in_netwall',3.4,-.95,'flat'],['in_rods',.6,.9],['barrel',1.5,1.3],['in_stove',4.3,.95],['in_stain',2.2,2.0,'flat'],
   ['in_longtable',4.9,2.95],['in_chair',3.8,2.45],['in_chair',6.0,2.45],['in_chairN',4.3,3.7],['in_chairN',5.6,3.7],['t_plate',4.2,2.98],['t_mug',4.9,2.99],['t_plate',5.6,2.98],
   ['in_keg',.8,4.8],['in_crates',2.1,5.1],['in_bed',7.55,5.8],['in_bottles',6.2,4.7],['in_netbarrel',.7,3.2]],
 home_thorne:[['in_quarryrack',.8,-.5,'flat'],['in_mapboard',4.0,-.5,'flat'],['in_banker',4.0,1.1],['in_bed',1.25,2.8],['in_nightstand',2.45,1.2],
   ['in_roughblock',4.3,3.9],['in_stoneblocks',3.0,4.4],['in_table',6.6,3.4],['in_chair',5.5,3.45],['t_mug',6.6,3.43],['in_drum',.6,5.3],['in_stain',5.2,4.6,'flat'],['in_lumberstack',7.6,5.4]],
 home_ashby:[['in_eyechart',4.8,-.5,'flat'],['in_medcab',.7,.8],['in_shelf_books',3.4,.62],['in_washstandm',2.2,1.0],['in_cot',5.6,2.4],['in_stool',7.0,2.45],['in_doctorbag',4.3,2.5],
   ['in_rug',4.3,4.2,'flat'],['in_table',1.8,4.6],['in_chair',.8,4.65],['t_books',1.45,4.63],['t_lamp',2.2,4.64],['in_bed',7.6,5.75],['in_lampstand',6.2,5.6]],
 home_vale:[['in_shelf_mail',3.5,.62],['in_bed',1.25,2.8],['in_knit',2.65,1.2],['in_dressform',6.7,2.3],['in_sewmachine',4.6,3.2],['in_stool',4.6,3.75],['in_clothbasket',5.7,3.45],
   ['in_rug',4.6,4.5,'flat'],['in_table',7.2,4.6],['in_chair',6.1,4.65],['t_books',7.2,4.63],['in_papers',2.3,4.7,'flat'],['in_linentrunk',1.0,5.5]],
 home_pike:[['in_netwall',2.6,-.9,'flat'],['in_painting_a',4.5,-.5,'flat'],['in_rods',.6,.9],['in_kcounter',5.7,.75],['in_bed',1.25,5.7],['in_netbarrel',2.6,5.6],
   ['in_table',4.6,3.2],['in_chair',3.5,3.25],['in_chair',5.7,3.25],['t_mug',4.3,3.23],['t_plate',4.9,3.22],['in_rug',4.6,4.1,'flat'],['in_rockS',6.6,4.6],['in_creel',7.7,5.4]],};
const W52_INN=[['in_hearth',4,1],['in_rockE',5.55,2.3],['in_nightstand',6.15,2.1],['in_rockS',2.4,2.5],['in_rug_b',4.0,3.1,'flat'],['in_clock',8,.55],
  ['in_ctr_inn',12.45,3],['in_keyboard',12.45,-.45,'flat'],['in_shelf_mail',14.9,.62],['in_coatstand',10.4,1.0],['in_walllantern',6.6,-.45,'flat'],['in_walllantern',15.9,-.45,'flat'],
  ['in_linentrunk',9.4,5.5],['in_satchel',10.2,5.7],
  ['in_table',3,5],['in_chair',1.9,5.05],['in_chair',4.1,5.05],
  ['in_longtable',5.4,7.6],['in_chair',4.2,7.05],['in_chair',5.4,7.05],['in_chair',6.6,7.05],['in_chairN',4.6,8.3],['in_chairN',6.2,8.3],['t_candle',5.4,7.63],['t_plate',4.5,7.62],['t_plate',6.3,7.62],['t_mug',5.0,7.64],
  ['in_rug',14.4,7.2,'flat'],['in_rockS',13.6,6.6],['in_rockS',15.2,6.6],['in_lampstand',16.3,6.9],['in_shelf_books',14.4,4.6],
  ['barrel',.7,2.6],['in_plant2',16.4,9.3],['in_plant',.8,9.4]];
function w52Homes(){for(const [k,L] of Object.entries(W52H))if(ROOMS[k])ROOMS[k].furn=L.map(([s,x,z,kind])=>kind?[s,x,z,w52Fp(s,kind),kind]:[s,x,z,w52Fp(s)]);
  if(ROOMS.home_harlow)ROOMS.home_harlow.furn=W52_INN.map(([s,x,z,kind])=>kind?[s,x,z,null,kind]:[s,x,z,w52Fp(s)]);}
{const _bw=buildWorld;buildWorld=function(){try{w52Homes();}catch(e){console.warn('w52 homes',e);}return _bw.apply(this,arguments);};}
/* 4. MILESTONES SHOW THEIR PLACE. Travelling to a milestone used to fade in on the post in an empty field. Now the screen opens on
   what the place is: the first rows of the Deep Corn, the steeple standing in the reservoir, the whole fire lookout tower, the
   hedged Low Fields. The camera holds there a moment and then glides back to you at the post (walk and it comes back at once). */
const W52_LOOK={corn:[12,197],drown:[133.5,203.5],ridge:[151,-155],low:[3.5,334.2]};
let W52CAM=null;
function w52Cam(fx,fz){const c=W52CAM;if(!c)return null;const now=performance.now()/1000,e=now-c.t0;
  if(c.go==null&&(Math.hypot(P.x-c.px,P.z-c.pz)>.3||e>2.6))c.go=now;
  if(c.go==null)return [c.x,c.z];const q=clamp((now-c.go)/1.5,0,1);if(q>=1){W52CAM=null;return null;}const k=q*q*(3-2*q);return [lerp(c.x,fx,k),lerp(c.z,fz,k)];}
{const _go=rgGoTo;rgGoTo=function(from,m){const ok=_go.apply(this,arguments);try{const L=ok&&m&&W52_LOOK[m.k];if(L)setTimeout(()=>{W52CAM={x:L[0],z:L[1],t0:performance.now()/1000,px:P.x,pz:P.z,go:null};},505);}catch(e){}return ok;};}
/* 5. (extra) THE FERRY LANDING: a shoreline willow grew right over the foot of Nan's dock and swallowed you whole when you stood
   there. It is gone (its trunk collider with it); the willows either side of the landing stay. */
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{
  for(const o of OBJ){if(o.spr!=='willow'||Math.hypot(o.x-126.5,o.z-76.0)>.8)continue;o.hide=true;o.gone=true;
    if(typeof circles!=='undefined')for(const c of circles)if(Math.hypot(c.x-o.x,c.z-o.z)<.7){c.r=0;c.x+=1e4;}}}catch(e){}return r;};}
/* r2 (after the judge): the weigh-in. The square's east bench stood straight in front of the scale and the crowd piled up
   behind it in one heap. The bench moves to the grass by the south wall (beside the dance floor, where you can watch from it),
   the pumpkin heaps and the ribbon board go behind the scale, and the people at the weigh-in stand round it in a half ring,
   each in their own place, facing the scale, with the scale's front left open for you. When their day moves on, they go.
   At the fair, the people at the crow gallery stand to its left, so what they say doesn't cover the stall. */
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{
  for(const o of OBJ)if(o.spr==='parkbench'&&Math.hypot(o.x-53.6,o.z-8.6)<.2){o.x=51.8;o.z=10.8;}
  {let seen=0;for(const o of OBJ)if(o.room==='home_agnes'&&o.spr==='in_papers'&&seen++>0)o.hide=true;}   /* (r2) Agnes keeps one pattern sheet on the floor, not a scatter of the same one */
  if(typeof PL!=='undefined'&&typeof F2P!=='undefined'&&F2P.crows)PL.f2_crows=[F2P.crows.x-2.9,F2P.crows.z+1.5,.4];}catch(e){}return r;};}
const W52W={pin:new Map()};
function w52WeighSlots(){const c=F2P.scale;return [[-2.3,1.0],[-1.2,1.3],[1.2,1.3],[2.3,1.0],[-4.0,.2],[3.5,.4],[-1.3,3.2],[1.3,3.2],[-4.6,2.2],[4.4,2.2],[-5.3,.9],[5.4,1.0]].map(([dx,dz])=>[c.x+dx,c.z+dz]);}
function w52Weigh(){const f=typeof fToday==='function'&&fToday();const live=f&&f.k==='weigh'&&!S.room&&typeof F2P!=='undefined'&&FDEC.scale&&!FDEC.scale.hide;
  if(!live){W52W.pin.clear();return;}const c=F2P.scale,slots=w52WeighSlots();
  for(const [n,p] of W52W.pin){let w=null;try{w=wantFor(n);}catch(e){}if(n.vis===false||w!==p.want||(typeof talkingTo!=='undefined'&&talkingTo===n&&false))W52W.pin.delete(n);}
  const used=new Set([...W52W.pin.values()].map(p=>p.i));
  for(const n of npcs){if(W52W.pin.has(n)||n.vis===false||Math.hypot(n.x-c.x,n.z-c.z-1.3)>3.9)continue;let i=-1,bd=1e9;
    for(let k=0;k<slots.length;k++){if(used.has(k))continue;const d=Math.hypot(slots[k][0]-n.x,slots[k][1]-n.z);if(d<bd){bd=d;i=k;}}if(i<0)break;
    let w=null;try{w=wantFor(n);}catch(e){}W52W.pin.set(n,{i,want:w});used.add(i);}
  for(const [n,p] of W52W.pin){const [x,z]=slots[p.i];n.x=x;n.z=z;n.target=null;n.wait=1;n.route=null;
    if(!(typeof talkingTo!=='undefined'&&talkingTo===n)){const dx=c.x-x,dz=c.z-z;n.dir=Math.abs(dx)>Math.abs(dz)*1.2?(dx>0?'E':'W'):'N';n.clip='idle';}}}
{const _u=update;update=function(dt){const r=_u.apply(this,arguments);try{w52Weigh();}catch(e){}return r;};}
