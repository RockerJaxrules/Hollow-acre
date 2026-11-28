/* ================= #298 part two: the toy horses, the tops, the marbles and the slates you find look like their close-ups too
   (the horse on its plank with its name carved, the snapped one, the grazing one, the pink plastic one, the charred one; every top
   tipped over on its side with its string or its scuff; the bag with M.P. on it, the twist of paper and three pennies, the flour
   sack, the painted river stones, the marbles loose under the sign; each slate with its own chalk). ================= */
// ---- toy horses (cgHorse at the world's scale: the same body, legs, neck and tail, never on wheels unless the close-up has them)
function f98Horse(P,x,y,o){const s=.55,R=o.c==='pink'?['#4a2030','#a8708a','#cc98ae','#ecc4d4']:o.c==='char'?['#060504','#141210','#24201c','#3e3630']:['#1e140a','#5e4630','#7e6040','#a4825a'];
  const back=[R[0],sgtShade(R[1],.8),sgtShade(R[2],.8),R[2]],rot=o.rot||0,cs=Math.cos(rot),sn=Math.sin(rot),lr=r=>Math.max(1.45,r*s);
  const T=(u,v)=>[x+(u*cs-v*sn)*s,y+(u*sn+v*cs)*s],C=(u1,v1,u2,v2,r)=>{const a=T(u1,v1),b=T(u2,v2);return [a[0],a[1],b[0],b[1],r];},D=(u,v,w,h,c)=>{const [a,b]=T(u,v);P(Math.round(a),Math.round(b),w,h,c);};
  f98Sh(P,x+1,y+Math.round(18*s)+(o.base?8:0)+(rot?-1:0),13,2);
  if(o.base){sgtBlob(P,[[x-15,y+13,x+15,y+13,3.6]],R);for(let i=0;i<2;i++)for(let k=0;k<(i?8:10);k++)if(k%5!==4)P(x-(i?8:10)+k*2+(i?1:0),y+12+i*2,1,1,R[0]);   // the plank, its carved name as short strokes
    for(const wx of [-11,11])sgtBlob(P,[[x+wx,y+17,x+wx,y+17,2]],['#120c06','#3a2a18','#4e3a24','#6a5034']);}
  sgtBlob(P,[C(-10,4,-11,17,lr(2)),C(9,4,10,17,lr(2))],back);   // the far legs
  sgtBlob(P,[C(-12,0,13,0,6.5*s)],R);   // the body
  sgtBlob(P,o.broken?[C(-6,4,-6,10,lr(2.1)),C(13,4,13,18,lr(2.1))]:[C(-6,4,-6,18,lr(2.1)),C(13,4,13,18,lr(2.1))],R);   // the near legs
  if(o.broken){D(-7,11,1,1,'#d8c098');sgtBlob(P,[[x-17,y+10,x-14,y+11,1.3]],R);}   // the snapped leg, lying by it
  const nk=o.graze?[C(-11,-2,-19,5,4*s),C(-20,6,-25,13,3.4*s+.3)]:[C(-11,-2,-17,-13,4*s),C(-17,-14,-26,-10,3.6*s+.3),C(-15,-17,-14,-21,1.4)];sgtBlob(P,nk,R);   // the neck, the head (and an ear)
  if(o.graze)for(let i=0;i<4;i++)D(-11-i*2,-4+i*2.2,1,1,R[1]);else for(let i=0;i<5;i++)D(-11-i*1.3,-6-i*2.2,1,1,o.c==='pink'?'#e8b0c8':R[1]);   // the mane
  D(o.graze?-23:-22,o.graze?9:-14,1,1,R[0]);   // the eye
  for(let j=0;j<6;j++){D(19+Math.round(j*.5),-3+j*1.8,1,1,o.c==='char'?'#1a1612':'#b8a478');D(20+Math.round(j*.5),-2+j*1.8,1,1,o.c==='char'?'#141210':'#8a7a5a');}   // the tail
  if(o.c==='char')for(let i=0;i<6;i++){const ex=x-10+cgH(i,5)%20,ey=y-6+cgH(5,i)%12;P(ex,ey,1,1,i%3?'#c8501a':'#f0a040');}}   // embers in the char
// ---- tops (cgTop at the world's scale: tipped over on its side, the crown's flat disc at one end, the metal point at the other)
function f98Top(P,x,y,o){const s=.62,c=o.c||'#8a5a34',c2=o.c2||'#c8a03a',th=o.th!=null?o.th:.25,cs=Math.cos(th),sn=Math.sin(th);
  const sh=o.shape||'squat',W=(sh==='tall'?8.5:sh==='pear'?10.5:12)*s,Lc=(sh==='tall'?28:sh==='pear'?25:22)*s,ex=W*.36,bow=sh==='pear'?1.35:sh==='squat'?1.6:1.8,sho=sh==='pear'?.26:.18;
  const bx=x-Lc*.42*cs,by=y-Lc*.42*sn,uv=(px,py)=>{const dx=px-bx,dy=py-by;return [dx*cs+dy*sn,-dx*sn+dy*cs];},wAt=u=>{const t=u/Lc;if(t<sho)return W*(.8+.2*Math.sin(t/sho*Math.PI/2));return W*Math.pow(Math.max(0,1-(t-sho)/(1-sho)),bow)+(t>.9?.6:0);};
  const inCone=(u,v)=>u>=0&&u<=Lc&&Math.abs(v)<=wAt(u),inCrown=(u,v)=>(u/ex)**2+(v/(W*.8))**2<=1,inside=(px,py)=>{const [u,v]=uv(px+.5,py+.5);return inCone(u,v)||inCrown(u,v);};
  f98Sh(P,x,y+Math.round(W*.8)+1,Math.round(Lc*.55),2);
  if(o.string){for(let a=0;a<6.283;a+=.08)P(Math.round(x-1+Math.cos(a)*10),Math.round(y+W+4+Math.sin(a)*2.2),1,1,'#c8bca0');for(let i=0;i<7;i++)P(x+9+i,y+W+4+Math.round(i*.3),1,1,'#c8bca0');}   // its string, coiled where it fell
  else if(o.scuff){for(let a=0;a<9;a+=.12){const r=2+a*.75;P(Math.round(x+14+Math.cos(a)*r*1.4),Math.round(y+5+Math.sin(a)*r*.5),1,1,sgtShade(o.scuff,.8));}}   // the spin's scuff in the dirt
  const X0=Math.floor(x-Lc-2),X1=Math.ceil(x+Lc+2),Y0=Math.floor(y-Lc-2),Y1=Math.ceil(y+Lc+2),bands=o.bands||[.3,.55];
  for(let py=Y0;py<=Y1;py++)for(let px=X0;px<=X1;px++){if(!inside(px,py))continue;const [u,v]=uv(px+.5,py+.5);let col;
    if(!inside(px-1,py)||!inside(px+1,py)||!inside(px,py-1)||!inside(px,py+1))col='#140a06';
    else if(inCrown(u,v)&&u<ex*.55)col=v<0?sgtShade(c,1.55):sgtShade(c,1.3);
    else{const t=v/Math.max(1,wAt(u));let base=c;for(const b of bands)if(Math.abs(u/Lc-b-.07*t*t)<.06)base=c2;col=t<-.5?sgtShade(base,1.35):t>.45?sgtShade(base,.6):t>.05?sgtShade(base,.82):base;}
    P(px,py,1,1,col);}
  for(let k=0;k<3;k++)P(Math.round(bx+(Lc+k)*cs),Math.round(by+(Lc+k)*sn),1,1,k<1?'#a8a8b0':'#e0e0e8');   // the metal point
  sgtBlob(P,[[bx-1.5*cs,by-1.5*sn,bx-5*cs,by-5*sn,1.3],[bx-5.6*cs,by-5.6*sn,bx-6*cs,by-6*sn,1.7]],['#120a06','#5a4028','#7a5a3a','#a07a52']);}   // the peg out of the crown
// ---- marbles: a glass ball 3 px across with its swirl and glint
const f98Mar=(P,x,y,c)=>{P(x,y-1,2,1,'#0e0e12');P(x,y+2,2,1,'#0e0e12');P(x-1,y,1,2,'#0e0e12');P(x+2,y,1,2,'#0e0e12');P(x,y,1,1,'#ffffff');P(x+1,y,1,1,c);P(x,y+1,1,1,c);P(x+1,y+1,1,1,sgtShade(c,.6));};   // a round glass ball: a dark ring, the glint top-left, its colour, the shade bottom-right
const F98_MP=['#2a6aba','#c83a2a','#2a9a5a','#d8b83a','#e8e8f0','#7a3aa8'];
function f98ClothBag(P,x,y,o){const c=o.c||'#8a7a5a',R=f98Ramp(c);f98Sh(P,x+2,y+8,12,2);
  sgtBlob(P,[[x-4,y+3,x+4,y+3,5.4],[x-2,y-2,x+2,y-2,3.6]],R);sgtBlob(P,[[x-1,y-6,x+1,y-6,1.6]],R);   // the body, the shoulders, the neck
  for(let r=0;r<4;r++){const hw=2+Math.round(r*.6);for(let dx=-hw;dx<=hw;dx++)P(x+dx,y-7-r,1,1,dx===-hw||dx===hw||r===3&&(dx+hw)%2?R[0]:(dx+r)%2?R[1]:R[3]);}   // the ruffle above the tie
  P(x-3,y-6,7,1,'#5a3a1a');P(x-2,y-6,5,1,'#8a6038');P(x+3,y-6,2,2,'#5a3a1a');P(x+4,y-4,1,2,'#8a6038');   // the cord and its end
  if(o.t){P(x-4,y+1,1,4,'#c83a2a');P(x-3,y+1,1,1,'#c83a2a');P(x-2,y+2,1,1,'#c83a2a');P(x-1,y+1,1,4,'#c83a2a');P(x,y+4,1,1,'#c83a2a');P(x+2,y+1,1,4,'#c83a2a');P(x+3,y+1,1,1,'#c83a2a');P(x+4,y+2,1,1,'#c83a2a');P(x+3,y+3,1,1,'#c83a2a');P(x+5,y+4,1,1,'#c83a2a');}   // M.P. in red thread
  for(let i=0;i<10;i++)if(i%3!==2)P(x-5+i,y+6,1,1,'#d8b04a');
  for(const [dx,dy,k] of [[-8,7,0],[-3,9,1],[3,8,2],[9,6,3],[13,9,4]])f98Mar(P,x+dx,y+dy,F98_MP[k]);}   // spilled where they rolled
function f98Twist(P,x,y){const W=['#2a2014','#a89c80','#d4c8aa','#eee4cc'];f98Sh(P,x+2,y+5,12,2);
  sgtBlob(P,[[x-6,y,x-2,y-.4,3.8],[x-2,y-.4,x+2,y-.8,2.6],[x+2,y-.8,x+5,y-1.2,1.6]],W);for(let i=0;i<5;i++)P(x+5+i,y-1-Math.round(i*.4),1,2,i%2?W[1]:W[3]);   // the twist of paper, its tail
  for(const fx of [x-4,x-1])P(fx,y-2,1,3,W[1]);sgtBlob(P,[[x-7,y,x-7,y+.5,2.6]],['#2a2014','#1a140c','#241c12','#3a2e1c']);f98Mar(P,x-7,y+1,F98_MP[0]);f98Mar(P,x-11,y+4,F98_MP[1]);   // the open end, a marble in it, one rolled out
  for(const [cx2,cy2] of [[x+6,y+5],[x+11,y+3],[x+9,y+7]]){P(cx2-1,cy2-1,4,3,'#3a1a0a');P(cx2,cy2-1,2,1,'#e8a858');P(cx2-1,cy2,4,1,'#b06a2a');P(cx2,cy2+1,2,1,'#7a3c12');}}   // three pennies
function f98Flour(P,x,y){const c='#d8d0bc',R=['#120c08',sgtShade(c,.6),c,sgtShade(c,1.25)];f98Sh(P,x+2,y+8,11,2);
  sgtBlob(P,[[x-5,y+3,x+5,y+3,5],[x-3,y-2,x+3,y-2,3.6],[x-1,y-7,x+1,y-7,1.8]],R);P(x-3,y-5,7,1,'#3a2a14');P(x+3,y-5,1,3,'#3a2a14');   // the sack and its tie
  for(const [i,w] of [[0,2],[3,1],[5,2],[8,1]])P(x-4+i,y+2,w,1,'#9a8a6a');P(x-5,y+1,1,3,'#9a8a6a');P(x+5,y+1,1,3,'#9a8a6a');   // FLOUR, as stencil strokes in its frame
  for(let i=0;i<6;i++)P(x-8+cgH(i,1)%16,y+7+cgH(1,i)%2,1,1,'#ece4d4');for(const [dx,dy,k] of [[-6,8,0],[-1,9,1],[2,8,2],[6,8,3],[8,9,4]])f98Mar(P,x+dx,y+dy,F98_MP[k]);}
function f98Spill(P,x,y){const c='#6a6050',R=f98Ramp(c);f98Sh(P,x+2,y+5,15,2);
  sgtBlob(P,[[x-12,y+.5,x-4,y-.5,4.6],[x-4,y-.5,x-2,y-.5,3.2]],R);for(let i=0;i<3;i++)P(x-11+i*3,y-3+(i%2),1,6,R[1]);sgtBlob(P,[[x-1,y,x-1,y+.5,2.8]],['#120c08','#1a140c','#241c12','#2e2418']);   // the bag on its side, its mouth open
  for(const [sx,sy,f] of [[x+5,y+2,0],[x+11,y-2,1],[x+15,y+4,2],[x+9,y+6,0]]){sgtBlob(P,[[sx,sy,sx,sy+.5,3.2]],['#1a1a18','#4e4a46','#6a6660','#8e8a82']);P(sx-1,sy-1,1,1,'#ffffff');P(sx+1,sy-1,1,1,'#ffffff');P(sx-1,sy+1,3,1,f===1?'#c83a2a':'#e8e4dc');}}   // river stones, each painted with a face
function f98Loose(P,x,y){for(const [dx,dy,k] of [[-9,-2,0],[-3,4,1],[4,-4,2],[10,1,3],[5,6,4]]){P(x+dx-1,y+dy+2,4,1,'rgba(50,33,37,.5)');f98Mar(P,x+dx,y+dy,F98_MP[k]);}}
// ---- slates lying on the ground: a wooden frame, the dark slate, the chalk laid out as in the close-up
function f98Slate(P,x,y,o){const w=30,h=21,x0=x-15,y0=y-10,ch='#e4e4dc';f98Sh(P,x+2,y+12,16,2);
  P(x0-1,y0-1,w+2,h+2,'#120c08');P(x0,y0,w,h,'#7a5a3a');P(x0,y0,w,1,'#a8845a');P(x0,y0,1,h,'#a8845a');P(x0,y0+h-1,w,1,'#4a3420');P(x0+w-1,y0,1,h,'#5a4028');   // the frame, lit top-left
  P(x0+2,y0+2,w-4,h-4,'#2c3234');P(x0+4,y0+5,5,1,'#363e40');P(x0+18,y0+14,6,1,'#363e40');
  const box=(a,b,ww,hh)=>{P(a,b,ww,1,ch);P(a,b+hh,ww+1,1,ch);P(a,b,1,hh,ch);P(a+ww,b,1,hh,ch);};
  if(o.draw==='word'){const t=o.t||'',tw=t.length*4-1;sgtT(P,t,x-(tw>>1),y-2,ch);}
  else if(o.draw==='hop'){let cx=x0+4;for(const col of [1,2,1,2,1]){if(col===1)box(cx,y0+8,3,3);else{box(cx,y0+5,3,3);box(cx,y0+9,3,3);}cx+=3;}box(cx,y0+6,7,7);P(cx+2,y0+9,4,1,ch);}   // the hopscotch and HOME at its end
  else if(o.draw==='doll'){P(x-1,y0+3,3,1,ch);P(x-2,y0+4,1,2,ch);P(x+2,y0+4,1,2,ch);P(x-1,y0+6,3,1,ch);for(let j=0;j<5;j++){P(x-1-Math.round(j*.5),y0+7+j,1,1,ch);P(x+1+Math.round(j*.5),y0+7+j,1,1,ch);}P(x-4,y0+12,9,1,ch);P(x-4,y0+8,2,1,ch);P(x+3,y0+8,2,1,ch);P(x-2,y0+13,1,2,ch);P(x+2,y0+13,1,2,ch);}   // a doll in chalk
  else if(Array.isArray(o.draw)){const L=o.draw,top=y0+Math.round((h-L.length*2.6)/2)+1;L.forEach((ln,i)=>{const t=typeof ln==='string'?ln:ln.t,n=Math.min(22,Math.round(t.length*1.5)),tx=x-(n>>1)+((cgH(i,7)%3)-1),ty=top+Math.round(i*2.6);
      for(let k=0;k<n;k++)if(t[Math.floor(k/1.5)]!==' '&&(k%4!==3))P(tx+k,ty,1,1,ch);if(typeof ln==='object'&&ln.strike)P(tx-1,ty,n+2,1,'#a8a8a0');});}}   // the lines of chalk, short strokes the length of each word
Object.assign(F98_FIND,{
  field:{w:38,h:34,y:16,gy:32,d:(P,x,y)=>f98Horse(P,x,y,{base:1})},
  mine:{w:38,h:30,y:15,d:(P,x,y)=>f98Horse(P,x,y,{rot:-.32,broken:1})},
  orchard:{w:38,h:28,y:14,d:(P,x,y)=>f98Horse(P,x,y,{graze:1})},
  cars:{w:38,h:30,y:15,d:(P,x,y)=>f98Horse(P,x,y,{c:'pink'})},
  oldmarrow:{w:38,h:30,y:15,d:(P,x,y)=>f98Horse(P,x,y,{c:'char'})},
  pond:{w:40,h:26,y:11,d:(P,x,y)=>f98Top(P,x,y,{c:'#a87a4a',c2:'#3a6a4a',string:1,shape:'squat',th:.2})},
  crossroads:{w:40,h:24,y:11,d:(P,x,y)=>f98Top(P,x,y,{c:'#2a4a7a',c2:'#c8a03a',shape:'squat',th:-.2,scuff:'#5a5244',bands:[.3]})},
  hollowtree:{w:40,h:26,y:11,d:(P,x,y)=>f98Top(P,x,y,{c:'#6a3c1c',c2:'#d8c890',shape:'pear',bands:[.3],th:-.3,string:1})},
  millroad:{w:40,h:26,y:11,d:(P,x,y)=>f98Top(P,x,y,{c:'#b88a3a',c2:'#efe4c8',shape:'squat',th:.35,string:1,bands:[.28,.5]})},
  deepcorn:{w:40,h:24,y:11,d:(P,x,y)=>f98Top(P,x,y,{c:'#9a2e1c',c2:'#1e1e1e',shape:'tall',th:.15,bands:[.3,.52],scuff:'#4a3a26'})},
  bridge:{w:34,h:30,y:14,gy:23,d:(P,x,y)=>f98ClothBag(P,x,y,{t:'M.P.',c:'#8a7a5a'})},
  store:{w:34,h:22,y:10,d:(P,x,y)=>f98Twist(P,x,y)},
  mill:{w:30,h:30,y:14,gy:23,d:(P,x,y)=>f98Flour(P,x,y)},
  wkriver:{w:36,h:22,y:10,d:(P,x,y)=>f98Spill(P,x,y)},
  county:{w:28,h:20,y:9,d:(P,x,y)=>f98Loose(P,x,y)},
  square:{w:34,h:28,y:12,d:(P,x,y)=>f98Slate(P,x,y,{draw:'hop'})},
  quarry:{w:34,h:28,y:12,d:(P,x,y)=>f98Slate(P,x,y,{draw:['300 X 4',{t:'= 1100',strike:1},{t:'= 1300',strike:1},'= 1200','+ 1 DOOR?']})},
  wksquare:{w:34,h:28,y:12,d:(P,x,y)=>f98Slate(P,x,y,{draw:['MOLLY','MOLLY MOLLY','MOLLY','MOLLY MOLLY','MOLLY']})},
  greyfield:{w:34,h:28,y:12,d:(P,x,y)=>f98Slate(P,x,y,{draw:'word',t:'ALICE'})},
  birches:{w:34,h:28,y:12,d:(P,x,y)=>f98Slate(P,x,y,{draw:'doll'})},
});
// ---- where these lie, as their close-ups show them
// nothing tall stands close beside it either (a lamp post at its edge reads as the slate leaning on it)
function f98Crowd(x,z,id){const X=x*PPM,Z=z*PPM;for(const o of OBJ){if(o.room||o.hide||o.kind==='flat'||o.kind==='deco'||o===RGC_OBJ[id])continue;if(Math.abs(o.x-x)>4||Math.abs(o.z-z)>5)continue;const m=SPR[o.spr];if(!m||/^(tgrass|tgold|weeds|grass|flower|leaf|f98_)/.test(o.spr))continue;
    const ox=o.x*PPM-m.ax,oy=o.z*PPM-m.ay,ix=Math.min(X+22,ox+m.fw)-Math.max(X-22,ox),iy=Math.min(Z+8,oy+m.fh)-Math.max(Z-24,oy);if(ix>0&&iy>0)return o;}return null;}
function f98Shore(id,maxR){const c=RGC.find(c=>c.id===id);if(!c)return null;for(let r=0;r<(maxR||10);r+=.25)for(let a=0;a<32;a++){const X=c.x+Math.cos(a/32*6.283)*r,Z=c.z+Math.sin(a/32*6.283)*r;
    if(LAYERS.water(X,Z)||!(LAYERS.water(X-.4,Z)||LAYERS.water(X,Z-.4)||LAYERS.water(X+.4,Z)))continue;if(f98Hidden(X,Z,id))continue;const A=cgNear(X,Z,.6);if(A.c.some(q=>Math.hypot(q.x-X,q.z-Z)<q.r+.45))continue;return {x:X,z:Z};}return null;}
const f98By=(spr,id,dx,dz)=>{const c=RGC.find(c=>c.id===id);if(!c)return null;let best=null,bd=1e9;for(const o of OBJ){if(o.spr!==spr||o.room)continue;const d=Math.hypot(o.x-c.x,o.z-c.z);if(d<bd&&d<12){bd=d;best=o;}}return best?{x:best.x+dx,z:best.z+dz}:null;};
Object.assign(F98_AT,{
  pond:()=>f98Shore('pond',8),   // on the bank, at the water
  mine:()=>f98By('mineportal','mine',1.15,.75),   // set down at the mine's mouth, beside the way in
  county:()=>f98By('rg_countysign','county',.55,.45),   // under the county sign
  crossroads:()=>f98OnGround('crossroads',(x,z)=>LAYERS.dirt(x,z),8),   // on the road where it crosses
  quarry:()=>f98OnGround('quarry',(x,z)=>LAYERS.gravel(x,z)||LAYERS.stone(x,z),8),   // on the quarry's rock at its edge
  square:()=>{const c=RGC.find(c=>c.id==='square'),stalls=[[squarePos.x-6.3,squarePos.z+3.8],[squarePos.x+6.2,squarePos.z+3.6]],own=interact.filter(i=>i.r===1&&Math.abs(i.x-c.x)<.01&&Math.abs(i.z-c.z-.15)<.01);
    const far=(x,z)=>stalls.every(([sx,sz])=>Math.hypot(sx-x,sz-z)>3)&&!f98Crowd(x,z,'square')&&!interact.some(i=>!own.includes(i)&&i.npc===undefined&&Math.hypot(i.x-x,i.z-z)<1.8);
    return f98OnGround('square',(x,z)=>LAYERS.stone(x,z)&&far(x,z),10);},   // on the square's paving, clear of where the fair's stalls stand
  wksquare:()=>f98OnGround('wksquare',(x,z)=>LAYERS.stone(x,z),8),   // on Wickham square's cobbles
});
