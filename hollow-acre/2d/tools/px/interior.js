// ---- interiors: room shells (floor + back wall + side walls + cut-away front wall) and furniture, 3/4 view, light from the upper left
SEED=CFG.seed||7;
const W=CFG.w,H=CFG.h,N=!!CFG.night;
const A=layer('art',W,H),B=layer('details',W,H),SHD=layer('shadow',W,H);
const WD=PAL.wood,ST=PAL.stone,TR=PAL.white,RD=PAL.red,K=CFG.kind;const RK=['#2a2220','#3a302c','#4a3e38','#5e5048'].map(HEX);
function gs(cx,cy,rx,ry,a){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+y*y/(ry*ry)<=1)P(SHD,cx+x,cy+y,PAL.out[0],a||70);}
function planks(L,x0,y0,w,h,R,pw){pw=pw||8;for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const row=Math.floor((y-y0)/pw),off=Math.floor(hsh(row,7,31)*44),seg=Math.floor((x-x0+off)/44);
  let k=2+((hsh(seg,row,3)>.55)?1:0);if((y-y0)%pw===0)k=0;else if((y-y0)%pw===1)k=Math.min(4,k+1);if((x-x0+off)%44===0)k=0;
  // grain as long streaks a step darker along each board, nails in pairs at the board ends (no single dark specks: "too gritty")
  const v=(y-y0)%pw,u=(x-x0+off)%44;if(v>=3&&v<pw-1&&k>0){const sv=3+Math.floor(hsh(seg,row,20)*(pw-4)),s0=4+Math.floor(hsh(seg,row,21)*14),sl=10+Math.floor(hsh(seg,row,22)*16);if(v===sv&&u>=s0&&u<s0+sl)k=Math.max(1,k-1);
    const sv2=3+Math.floor(hsh(seg,row,23)*(pw-4));if(pw>=10&&v===sv2&&sv2!==sv&&u>=26&&u<38)k=Math.max(1,k-1);}
  if(pw>=7&&(u===2||u===41)&&(v===2||v===pw-2))k=1;P(L,x,y,R[Math.max(0,Math.min(R.length-1,k))]);}}
function tilesF(L,x0,y0,w,h,R,s){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=Math.floor((x-x0)/s),j=Math.floor((y-y0)/s),u=(x-x0)%s,v=(y-y0)%s;
  let c=(i+j)%2?shade(R[3],.92):R[3];if(u===0||v===0)c=R[1];else if(u===1||v===1)c=R[4];P(L,x,y,c);}}   // two close tones, a lit edge, a seam: not a quilt of greys
function concrete(L,x0,y0,w,h){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const n=hsh(x>>2,y>>2,6)*.6+hsh(x,y,7)*.4;let c=ST[n>.7?3:n<.25?1:2];if(((x-x0)%96===0)||((y-y0)%64===0))c=ST[1];P(L,x,y,c);}
  for(let i=0;i<5;i++){const cx=x0+hsh(i,1,3)*w|0,cy=y0+hsh(i,2,3)*h|0,r=6+hsh(i,3,3)*10|0;for(let y=-r;y<=r;y++)for(let x=-r*1.5;x<=r*1.5;x++){if(x*x/(2.25*r*r)+y*y/(r*r)>1-hsh(cx+x,cy+y,4)*.3)continue;P(L,cx+x,cy+y,PAL.ink[1],150);}}}
function wallpaper(L,x0,y0,w,h,R,stripe){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){let k=2;const u=(x-x0)%stripe;if(u<2)k=3;if(u===stripe>>1)k=1;if((y-y0)%14===7&&u===stripe>>2)k=3;if(hsh(x>>3,y>>3,8)>.92)k=1;P(L,x,y,R[k]);}}
function brick(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const r=Math.floor((y-y0)/6),o=r%2?6:0,b=(x-x0+o)%12;let c=R[(hsh(Math.floor((x-x0+o)/12),r,5)>.6)?3:2];if(b===0||(y-y0)%6===5)c=R[0];else if((y-y0)%6===0)c=R[4];P(L,x,y,c);}}
function plaster(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const n=hsh(x>>3,(y+(x>>4))>>3,5)*.7+hsh(x,y,6)*.3;P(L,x,y,R[n>.8?4:n<.12?2:3]);}
  for(let i=0;i<4;i++){const cx=x0+hsh(i,4,2)*w|0,cy=y0+8+hsh(i,5,2)*(h-16)|0;for(let k=0;k<14;k++)P(L,cx+k-(k>>2),cy+(k>>1)+(k%3===0?1:0),R[1]);}}
function windowW(L,x,y,w,h,arched){rect(L,x-3,y-3,w+6,h+7,TR[3]);frame(L,x-3,y-3,w+6,h+7,TR[5],TR[1]);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(arched&&j<w/2){const dx=i-w/2+.5,dy=w/2-j;if(dx*dx+dy*dy>(w/2)*(w/2))continue;}
    let c=N?(j<h*.5?PAL.ink[0]:PAL.ink[1]):(j<h*.45?PAL.glass[4]:PAL.glass[3]);if(!N&&(i-j)%11===0)c=PAL.glass[5];P(L,x+i,y+j,c);}
  vl(L,x+(w>>1),y,h,TR[2]);hl(L,x,y+(h>>1),w,TR[2]);hl(L,x-4,y+h+3,w+8,TR[4]);hl(L,x-4,y+h+4,w+8,TR[1]);
  if(!N)for(let j=0;j<h;j++)P(SHD,x+w+3,y+j,PAL.out[0],40);}
// ---- every house its own walls, floor and doors (spliced into interior.js before the room shells)
function damask(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const u=(x-x0)%16,v=(y-y0)%20,dx=Math.abs(u-8),dy=Math.abs(v-10);let k=2;
  if(dx+dy*.8<6&&dx+dy*.8>3.5)k=3;if(dx+dy*.8<2)k=3;if((u===0||u===15)&&v%4<2)k=1;P(L,x,y,R[k]);}}
function panelWall(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const u=(x-x0)%40,v=(y-y0)%46;let c=R[2];if(u<3||v<3)c=R[3];if(u===0||v===0)c=R[4];if(u===39||v===45)c=R[1];
  if(u>5&&u<35&&v>5&&v<41){c=R[2];if(u===6||v===6)c=R[1];if(u===34||v===40)c=R[3];if(hsh(x>>1,y>>3,4)>.8)c=R[1];}P(L,x,y,c);}}
function logWall(L,x0,y0,w,h,R){for(let y=y0;y<y0+h;y++){const r=Math.floor((y-y0)/11),v=(y-y0)%11;for(let x=x0;x<x0+w;x++){let c=v<2?R[4]:v<5?R[3]:v<9?R[2]:v<10?R[1]:PAL.cream[0];
  if(hsh(x>>2,r,6)>.86&&v>2&&v<9)c=R[1];P(L,x,y,c);}}}
function beadWains(L,x0,y,w,h,C){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let c=C[2];if(i%5===0)c=C[1];if(i%5===1)c=C[3];if(j<3)c=j===0?C[3]:C[2];P(L,x0+i,y+j,c);}hl(L,x0,y-1,w,WD[3]);hl(L,x0,y-2,w,WD[4]);}
function parquet(L,x0,y0,w,h){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const a=x-x0+y-y0,b=x-x0-(y-y0);const cell=Math.floor(a/12)+Math.floor(b/12);const dir=cell%2;const t=dir?(a%12):(((b%12)+12)%12);
  let c=WD[dir?3:4];if(t===0)c=WD[1];if(t===1)c=WD[dir?4:5];if(hsh(Math.floor(a/12),Math.floor(b/12),5)>.7)c=shade(c,.92);P(L,x,y,c);}}
function checker(L,x0,y0,w,h,A2,B2){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const i=Math.floor((x-x0)/16),j=Math.floor((y-y0)/16),u=(x-x0)%16,v=(y-y0)%16;let c=(i+j)%2?A2[3]:B2[3];
  if(u===0||v===0)c=shade(c,.85);if(hsh(x>>2,y>>2,8)>.93)c=shade(c,.92);P(L,x,y,c);}}
function flagstone(L,x0,y0,w,h){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const r=Math.floor((y-y0)/18),o=(r*13)%27,s=Math.floor((x-x0+o)/(22+(r%3)*4));const u=(x-x0+o)%(22+(r%3)*4),v=(y-y0)%18;
  const n=hsh(s,r,9);let c=ST[n>.66?4:n>.33?3:2];if(u<2||v<2)c=ST[1];if(u===2||v===2)c=ST[n>.5?5:4];
  if(hsh(s,r,11)>.62&&u>3&&v>3){const cu=6+Math.floor(hsh(s,r,12)*10),cv=5+Math.floor(hsh(s,r,13)*6),dir=hsh(s,r,14)>.5?1:-1,dv=v-cv;if(dv>=0&&dv<6&&u===cu+dir*Math.floor(dv*.7))c=ST[1];}   // a crack, not specks
  P(L,x,y,c);}}
function painted(L,x0,y0,w,h,C){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const row=Math.floor((y-y0)/9),v=(y-y0)%9;let c=C[3];if(v===0)c=C[1];if(v===1)c=C[4];
  const wear=Math.exp(-Math.pow((x-x0-w*.5)/(w*.18),2))*Math.exp(-Math.pow((y-y0-h*.55)/(h*.4),2));if(hsh(x>>2,row,11)<wear*.55-.12)c=hsh(x>>3,row,12)>.5?shade(C[3],.84):WD[4];P(L,x,y,c);}}
function hexTile(L,x0,y0,w,h,C){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const r=Math.floor((y-y0)/7),o=r%2?5:0,u=(x-x0+o)%10,v=(y-y0)%7;let c=C[3];
  if(v===0||u===0)c=C[1];if(hsh(Math.floor((x-x0+o)/10),r,13)>.88)c=C[2];if(hsh(Math.floor((x-x0+o)/10),r,14)>.988)c=PAL.slate[3];P(L,x,y,c);}}
function wideBoards(L,x0,y0,w,h){for(let y=y0;y<y0+h;y++)for(let x=x0;x<x0+w;x++){const row=Math.floor((y-y0)/14),v=(y-y0)%14,off=Math.floor(hsh(row,7,32)*97),seg=Math.floor((x-x0+off)/97);let c=hsh(seg,row,15)>.5?PAL.bark[3]:shade(PAL.bark[3],.9);
  if(v===0)c=PAL.bark[0];if(v===1)c=PAL.bark[4];const u=(x-x0+off)%97;if(u===0)c=PAL.bark[1];
  if(v>2&&v<13&&u>4&&u<92&&hsh((x-x0+off)>>4,row*14+v,16)>.93)c=PAL.bark[1];   // grain: 16 px streaks along the board, no specks
  if((u===3||u===94)&&(v===4||v===10))c=PAL.bark[0];P(L,x,y,c);}}   // nails at the board ends
// a closed panelled door on the back wall, with its frame, knob, a strip of light under it (or dark, at night)
function backDoor(L,cx,floorY,C,knob){const w=26,h=56,x=Math.round(cx-w/2),y=floorY-h;rect(L,x-4,y-4,w+8,h+4,TR[4]);frame(L,x-4,y-4,w+8,h+4,TR[5],TR[2]);rect(L,x-2,y-2,w+4,2,TR[3]);
  rect(L,x,y,w,h,C[3]);frame(L,x,y,w,h,C[4],C[1]);for(const [px,py,pw,ph] of [[x+4,y+5,8,18],[x+14,y+5,8,18],[x+4,y+29,8,22],[x+14,y+29,8,22]]){frame(L,px,py,pw,ph,C[1],C[4]);rect(L,px+1,py+1,pw-2,ph-2,C[2]);}
  ell(L,x+w-5,y+31,1,1,(knob||PAL.brass)[2]);P(L,x+w-6,y+30,(knob||PAL.brass)[3]);P(L,x+w-5,y+34,PAL.ink[0]);hl(L,x+1,floorY-1,w-2,N?PAL.ink[0]:PAL.lit[3]);
  for(let j=0;j<4;j++)for(let i=0;i<w;i++){const c=G(A,x+i,floorY+j);if(c)P(A,x+i,floorY+j,N?shade(c,.85):[Math.min(255,c[0]+18-j*4),Math.min(255,c[1]+14-j*3),Math.min(255,c[2]+6-j)]);}}
// a doormat inside the front door
function doormat(L,cx,y,C){for(let j=0;j<9;j++)for(let i=0;i<38;i++){let c=(i+j)%3===0?C[2]:C[3];if(i<2||i>35||j===0||j===8)c=C[1];P(L,cx-19+i,y+j,c);}}
// ---------------- room shells: CFG.room has the floor size in metres
if(K==='room'){const R=CFG.room,fw=R.w*32,fd=R.d*32,side=12,wallH=92,top=wallH+8,x0=side,front=top+fd;
  // back wall
  if(R.theme==='cabin'){wallpaper(A,x0,8,fw,wallH,PAL.sage,16);rect(A,x0,8+wallH-30,fw,30,WD[2]);planks(A,x0,8+wallH-28,fw,26,[WD[1],WD[1],WD[2],WD[3],WD[3]],13);hl(A,x0,8+wallH-30,fw,WD[4]);hl(A,x0,8+wallH-31,fw,WD[5]);}
  if(R.theme==='home'){const PR=PAL[R.paper||'sage'],wl=R.wall||'stripe';if(wl==='stripe')wallpaper(A,x0,8,fw,wallH,PR,14);if(wl==='damask')damask(A,x0,8,fw,wallH,PR);if(wl==='plaster')plaster(A,x0,8,fw,wallH,R.paper?PR:TR);if(wl==='panel')panelWall(A,x0,8,fw,wallH,WD);if(wl==='log')logWall(A,x0,8,fw,wallH,PAL.bark);
    const ws=R.wains||(wl==='panel'||wl==='log'?'none':'planks');if(ws==='planks'){rect(A,x0,8+wallH-30,fw,30,WD[2]);planks(A,x0,8+wallH-28,fw,26,[WD[1],WD[1],WD[2],WD[3],WD[3]],13);hl(A,x0,8+wallH-30,fw,WD[4]);hl(A,x0,8+wallH-31,fw,WD[5]);}if(ws==='bead')beadWains(A,x0,8+wallH-30,fw,30,PAL[R.beadc||'cream']);}
  if(R.theme==='store'){brick(A,x0,8,fw,wallH,PAL.red);rect(A,x0,8+wallH-22,fw,22,WD[2]);for(let x=x0;x<x0+fw;x+=7)vl(A,x,8+wallH-22,22,WD[1]);hl(A,x0,8+wallH-22,fw,WD[4]);}
  if(R.theme==='church'){plaster(A,x0,8,fw,wallH,TR);rect(A,x0,8+wallH-26,fw,26,WD[1]);for(let x=x0;x<x0+fw;x+=24)frame(A,x+2,8+wallH-23,20,20,WD[3],WD[0]);hl(A,x0,8+wallH-26,fw,WD[3]);}
  if(R.theme==='garage'){for(let y=8;y<8+wallH;y++)for(let x=x0;x<x0+fw;x++){const r=Math.floor((y-8)/10),o=r%2?9:0,b=(x-x0+o)%18;let c=ST[(hsh(Math.floor((x-x0+o)/18),r,5)>.5)?3:2];if(b===0||(y-8)%10===9)c=ST[1];else if((y-8)%10===0)c=ST[4];P(A,x,y,c);}}
  if(R.theme==='mine'){for(let y=8;y<8+wallH;y++)for(let x=x0;x<x0+fw;x++){const n=hsh(x>>3,(y+(x>>4))>>3,5)*.7+hsh(x,y,6)*.3;P(A,x,y,ST[n>.75?3:n<.25?0:1]);}
    for(let x=x0;x<x0+fw;x+=40)for(let y=8;y<8+wallH;y++){P(A,x,y,WD[2]);P(A,x+1,y,WD[1]);}for(let x=x0;x<x0+fw;x++){P(A,x,14,WD[2]);P(A,x,15,WD[0]);}}
  if(R.theme==='glass'){for(let y=8;y<8+wallH;y++)for(let x=x0;x<x0+fw;x++){const i=(x-x0)%24,j=(y-8)%20;let c=N?PAL.ink[1]:PAL.glass[(y-8)<wallH*.5?4:3];if(!N&&(x+y)%23===0)c=PAL.glass[5];if(i===0||j===0)c=TR[3];P(A,x,y,c);}}
  // ceiling beam line, crown moulding
  rect(A,x0,0,fw,8,WD[1]);hl(A,x0,7,fw,WD[3]);for(let x=x0;x<x0+fw;x+=48)rect(A,x,0,10,8,WD[2]);
  for(const w of R.windows||[]){windowW(B,x0+w[0]*32-(w[2]||28)/2|0,14+(w[3]||8),w[2]||28,w[4]||34,R.theme==='church');}
  // floor
  if(R.theme==='cabin'||R.theme==='store'||(R.theme==='home'&&(!R.floor||R.floor==='planks')))planks(A,x0,top,fw,fd,WD,8);
  if(R.theme==='home'){const fl=R.floor;if(fl==='parquet')parquet(A,x0,top,fw,fd);if(fl==='checker')checker(A,x0,top,fw,fd,PAL[R.chk||'slate'],PAL.cream);if(fl==='flag')flagstone(A,x0,top,fw,fd);if(fl==='painted')painted(A,x0,top,fw,fd,PAL[R.paint||'teal']);if(fl==='hex')hexTile(A,x0,top,fw,fd,TR);if(fl==='wide')wideBoards(A,x0,top,fw,fd);}
  if(R.theme==='church')tilesF(A,x0,top,fw,fd,ST,16);
  if(R.theme==='garage')concrete(A,x0,top,fw,fd);
  if(R.theme==='garage'){const bx=x0+fw-150,bw=104;for(let y=14;y<8+wallH;y++)for(let x=bx;x<bx+bw;x++){const j=(y-14)%6;P(A,x,y,j===0?ST[4]:j===5?ST[1]:ST[3]);}frame(A,bx-3,12,bw+6,wallH-2,WD[3],WD[0]);rect(A,bx+bw/2-6,8+wallH-10,12,3,PAL.slate[2]);
    for(let x=bx;x<bx+bw;x++){const k=((x-bx)>>3)%2;for(let j=0;j<4;j++)P(A,x,top+fd-60+j,k?PAL.mustard[4]:PAL.ink[0]);}}
  if(R.theme==='mine'){for(let y=top;y<top+fd;y++)for(let x=x0;x<x0+fw;x++){const n=hsh(x>>4,(y+(x>>3))>>4,8)*.8+hsh(x,y,9)*.2;P(A,x,y,n>.78?RK[3]:n>.45?RK[2]:RK[1]);}
    for(let i=0;i<40;i++){const px=x0+(hsh(i,1,4)*fw|0),py=top+(hsh(i,2,4)*fd|0);P(A,px,py,ST[3]);P(A,px+1,py,ST[2]);}}
  if(R.theme==='glass'){tilesF(A,x0,top,fw,fd,ST,16);const s0x=x0+32,s0y=top+38,sw=7*32,sh=4*32;for(let y=s0y-3;y<s0y+sh+3;y++)for(let x=s0x-3;x<s0x+sw+3;x++){const edge=x<s0x||y<s0y||x>=s0x+sw||y>=s0y+sh;
    const n=hsh(x>>2,y>>2,6)*.6+hsh(x,y,7)*.4;P(A,x,y,edge?WD[y<s0y?4:1]:(n>.75?[150,104,64]:n<.25?[92,60,36]:[120,82,50]));}}
  // skirting where floor meets the back wall + ambient occlusion
  rect(A,x0,top-8,fw,8,WD[1]);hl(A,x0,top-8,fw,WD[3]);for(let y=0;y<10;y++)for(let x=x0;x<x0+fw;x++){const c=G(A,x,top+y);if(c)P(A,x,top+y,shade(c,.62+y*.038));}
  for(let y=top;y<front;y++)for(let x=0;x<14;x++){for(const xx of [x0+x,x0+fw-1-x]){const c=G(A,xx,y);if(c)P(A,xx,y,shade(c,.66+x*.024));}}
  // ---- depth: the back wall darkens toward the ceiling, the floor darkens away from the windows
  for(let y=8;y<8+wallH;y++){const k=.7+.3*Math.min(1,(y-8)/36);for(let x=x0;x<x0+fw;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,k));}}
  for(let y=top;y<front;y++){const k=1-.12*((y-top)/fd);for(let x=x0;x<x0+fw;x++){const c=G(A,x,y);if(c)P(A,x,y,shade(c,k));}}
  // ---- dressing on the walls: framed pictures, a wall shelf, a sign, a hymn board, a pegboard: each with a lit top edge and a shadow on the wall
  const wallShadow=(x,y,w,h)=>{for(let j=0;j<3;j++)for(let i=0;i<w;i++){const c=G(A,x+2+i,y+h+j);if(c)P(A,x+2+i,y+h+j,shade(c,.7+j*.1));}for(let j=0;j<h;j++)for(let i=0;i<2;i++){const c=G(A,x+w+i,y+2+j);if(c)P(A,x+w+i,y+2+j,shade(c,.75+i*.1));}};
  const picture=(x,y,w,h,k)=>{wallShadow(x,y,w,h);rect(B,x,y,w,h,WD[3]);frame(B,x,y,w,h,WD[5],WD[0]);const C=[[PAL.sage,PAL.mustard],[PAL.blue,PAL.cream],[PAL.rust,PAL.slate]][k%3];
    for(let j=2;j<h-2;j++)for(let i=2;i<w-2;i++){const t=j/(h-2);P(B,x+i,y+j,t<.55?C[0][3]:C[1][2]);}hl(B,x+2,y+Math.round(h*.55),w-4,C[1][1]);if(k%2)ell(B,x+(w>>1),y+(h>>1)-1,2,3,C[1][0]);P(B,x+(w>>1),y-2,PAL.slate[4]);};
  const wins=(R.windows||[]).map(w=>w[0]);const gapsAt=[];for(let c=1;c<R.w;c++){if(wins.every(w=>Math.abs(w-c)>1.1)&&Math.abs(c-R.door)>.5&&(R.doors||[]).every(d=>Math.abs(d[0]-c)>1.3))gapsAt.push(c);}
  if(R.theme==='cabin'||R.theme==='home'){gapsAt.slice(0,3).forEach((c,i)=>{const px=x0+c*32-9;i===1?(()=>{const sx=px-6;wallShadow(sx,40,30,3);rect(B,sx,40,30,3,WD[4]);hl(B,sx,40,30,WD[5]);
      for(let k=0;k<4;k++){const jx=sx+3+k*7;rect(B,jx,32,5,8,[PAL.rust,PAL.sage,PAL.mustard,PAL.glass][k][3]);hl(B,jx,31,5,PAL.brass[2]);P(B,jx+1,34,PAL.white[5]);}})():picture(px,26,18,22,i+(R.paper||'').length);});}
  if(R.theme==='store'){const sx=x0+fw/2-46;wallShadow(sx,18,92,13);rect(B,sx,18,92,13,PAL.cream[3]);frame(B,sx,18,92,13,PAL.cream[2],WD[0]);drawText(B,'COYLE GENERAL',sx+18,22,PAL.red[1]);
    for(let x=x0+6;x<x0+fw-6;x+=4){const y=12+Math.round(Math.sin((x-x0)/18)*3+3);P(B,x,y,PAL.mustard[(x>>2)%2?3:4]);if((x>>2)%5===0){P(B,x,y+1,PAL.rust[3]);P(B,x,y+2,PAL.rust[2]);}}}
  if(R.theme==='church'){const hx=x0+fw/2-60;wallShadow(hx,30,20,26);rect(B,hx,30,20,26,WD[1]);frame(B,hx,30,20,26,WD[3],WD[0]);for(let k=0;k<4;k++)drawText(B,['1','8','7','1'][k],hx+4+(k%2)*8,33+(k>>1)*10,PAL.cream[3]);
    const cx2=x0+fw/2;rect(B,cx2-1,22,3,22,PAL.brass[2]);rect(B,cx2-6,28,13,3,PAL.brass[2]);hl(B,cx2-6,28,13,PAL.brass[3]);vl(B,cx2-1,22,22,PAL.brass[3]);}
  if(R.theme==='garage'){const px=x0+fw-120;wallShadow(px,24,70,40);rect(B,px,24,70,40,WD[1]);for(let y=28;y<62;y+=5)for(let x=px+3;x<px+68;x+=5)P(B,x,y,WD[0]);
    for(const [tx,ty,k] of [[px+8,30,0],[px+20,28,1],[px+34,30,2],[px+48,28,0],[px+60,30,1]]){if(k===0){vl(B,tx,ty,14,PAL.slate[4]);rect(B,tx-2,ty,5,4,PAL.slate[2]);}else if(k===1){vl(B,tx,ty+2,14,WD[4]);rect(B,tx-3,ty,7,3,PAL.slate[3]);}else{ell(B,tx,ty+7,5,5,PAL.slate[3]);ell(B,tx,ty+7,3,3,PAL.ink[1]);}}
    const cx3=x0+40;wallShadow(cx3,30,18,22);rect(B,cx3,30,18,22,PAL.cream[3]);rect(B,cx3,30,18,5,PAL.red[3]);for(let j=0;j<3;j++)for(let i=0;i<4;i++)rect(B,cx3+2+i*4,37+j*5,3,3,PAL.cream[1]);P(B,cx3+10,47,PAL.red[3]);}
  if(R.theme==='home'){for(const d of R.doors||[])backDoor(B,x0+d[0]*32,top,PAL[d[1]||'bark'],d[2]&&PAL[d[2]]);if(R.mat)doormat(A,x0+R.door*32,front-11,PAL[R.mat]);}
  else if(R.theme==='store'||R.theme==='garage'){for(const d of R.doors||[])backDoor(B,x0+d[0]*32,top,PAL[d[1]||'bark'],d[2]&&PAL[d[2]]);if(R.mat)doormat(A,x0+R.door*32,front-11,PAL[R.mat]);}
  // ---- sunlight through each window, falling across the floor down and to the right (day only)
  if(!N&&R.theme!=='mine')for(const w of R.windows||[]){const ww=w[2]||28,wx=x0+w[0]*32-ww/2;for(let y=top+2;y<Math.min(front-4,top+86);y++){const t=(y-top)/86,sk=Math.round((y-top)*.55);
      for(let x=wx+sk;x<wx+sk+ww;x++){const e=Math.min(x-(wx+sk),wx+sk+ww-1-x);const a=(1-t)*Math.min(1,e/4);const c=G(A,x,y);if(c&&a>0)P(A,x,y,[Math.min(255,c[0]*(1+.28*a)+10*a),Math.min(255,c[1]*(1+.24*a)+8*a),Math.min(255,c[2]*(1+.12*a)+2*a)]);}}}
  // ---- hanging lamps over the big rooms
  if(R.theme==='store'||R.theme==='church'){for(const f of [.25,.75]){const lx=x0+Math.round(fw*f);vl(B,lx,0,18,PAL.slate[2]);ell(B,lx,22,7,4,N?PAL.lit[4]:PAL.brass[2]);hl(B,lx-7,22,15,PAL.brass[1]);ell(B,lx,25,3,1,N?PAL.lit[5]:PAL.cream[3]);}}
  // side walls: dark tops of the left and right walls
  for(const sx of [0,x0+fw]){rect(A,sx,0,side,front+10,PAL.ink[1]);for(let y=0;y<front+10;y++){const inner=sx?sx:sx+side-1;P(A,inner,y,WD[2]);P(A,sx?inner+1:inner-1,y,WD[1]);P(A,sx?inner+2:inner-2,y,WD[0]);}
    for(let y=0;y<front+10;y+=32){hl(A,sx,y,side,WD[1]);}vl(A,sx?sx+side-1:sx,0,front+10,PAL.ink[0]);}
  // cut-away front wall: a beam with a gap for the door
  const dg0=x0+R.door*32-22,dg1=x0+R.door*32+22;for(let x=0;x<W;x++){if(x>=dg0&&x<dg1)continue;rect(A,x,front,1,10,x%32===0?WD[0]:WD[2]);P(A,x,front,WD[4]);P(A,x,front+9,PAL.ink[0]);}
  for(let y=front-4;y<front+10;y++)for(const x of [dg0-1,dg1]){P(A,x,y,WD[1]);}
  for(let x=dg0;x<dg1;x++){P(A,x,front+2,WD[3]);P(A,x,front+3,WD[1]);}   // threshold
  console.log('META '+JSON.stringify({w:W,h:H,top,side,front}));}
// ---------------- furniture
const cx=W>>1,base=H-3;
function topBox(x,y,w,tH,fH,R,face){plk(x,y,w,tH,R,1);const fy=y+tH;rect(A,x,fy,w,fH,face||R[2]);hl(A,x,fy,w,R[0]);vl(A,x,fy,fH,R[3]);vl(A,x+w-1,fy,fH,R[0]);hl(A,x,fy+fH-1,w,R[0]);
  for(let yy=fy+fH;yy<H-2;yy++)for(let xx=x+2;xx<x+w-2;xx++)P(SHD,xx,yy,PAL.out[0],Math.round(70+(yy-fy-fH)*6));for(let xx=x-1;xx<x+w+2;xx++)P(SHD,xx,H-3,PAL.out[0],150);
  for(let yy=fy;yy<fy+fH;yy++)for(let xx=x+w-3;xx<x+w;xx++){const c=G(A,xx,yy);if(c)P(A,xx,yy,shade(c,.75));}}
function plk(x,y,w,h,R,dir){for(let j=0;j<h;j++)for(let i=0;i<w;i++){let c=R[4];if(dir?(i%7===0):(j%5===0))c=R[3];if(j===0)c=R[5]||R[4];P(A,x+i,y+j,c);}}
if(K==='bed'){ // quilted bed, headboard against the wall, pillow, a dark stain grandpa never washed out
  const x0=4,w=W-8;post(A,x0,6,5,40);post(A,x0+w-5,6,5,40);rect(A,x0,8,w,18,WD[2]);frame(A,x0,8,w,18,WD[4],WD[0]);for(let i=x0+8;i<x0+w-8;i+=8)vl(A,i,10,14,WD[1]);
  const q=[PAL.red,PAL.cream,PAL.sage];const qy=26,qh=H-qy-12;for(let j=0;j<qh;j++)for(let i=0;i<w-4;i++){const R=q[(Math.floor(i/9)+Math.floor(j/9))%3];let c=R[2];if(i%9===0||j%9===0)c=R[1];if(j<3)c=R[3];P(A,x0+2+i,qy+j,c);}
  rect(A,x0+6,20,w-12,10,PAL.cream[3]);frame(A,x0+6,20,w-12,10,PAL.cream[3],PAL.cream[1]);hl(A,x0+7,28,w-14,PAL.cream[2]);
  rect(A,x0+2,qy+qh,w-4,8,PAL.red[1]);hl(A,x0+2,qy+qh,w-4,PAL.red[3]);for(let i=0;i<w-4;i+=4)P(A,x0+2+i,qy+qh+7,PAL.red[0]);
  post(A,x0,qy+qh-6,5,16);post(A,x0+w-5,qy+qh-6,5,16);ell(B,x0+w*.62|0,qy+qh*.55|0,6,3,PAL.rust[1]);gs(cx+3,base,W/2-2|0,3,80);}
function post(L,x,y,w,h){rect(A,x,y,w,h,WD[2]);vl(A,x,y,h,WD[4]);vl(A,x+w-1,y,h,WD[0]);hl(A,x,y,w,WD[5]);}
if(K==='table'){topBox(3,10,W-6,12,5,WD);for(const x of [5,W-9])post(A,x,27,4,H-30);
  // supper still laid out: a plate, a cup, a lamp
  ell(B,cx-8,15,5,3,PAL.cream[3]);ell(B,cx-8,15,3,2,PAL.cream[2]);rect(B,cx+3,10,4,5,PAL.slate[3]);hl(B,cx+3,10,4,PAL.slate[5]);
  rect(B,cx+10,6,5,8,N?PAL.lit[4]:PAL.glass[4]);rect(B,cx+9,14,7,2,PAL.brass[2]);hl(B,cx+10,5,5,PAL.brass[3]);gs(cx+3,base,W/2-2|0,3,70);}
if(K==='chair'){rect(A,4,2,W-8,16,WD[2]);frame(A,4,2,W-8,16,WD[4],WD[0]);for(let x=7;x<W-7;x+=4)vl(A,x,4,12,WD[1]);topBox(3,18,W-6,6,3,WD);for(const x of [4,W-7])post(A,x,27,3,H-30);gs(cx+2,base,W/2-2|0,2,70);}
if(K==='stove'){const ir=PAL.slate;topBox(3,14,W-6,9,H-30,ir,ir[1]);for(const x of [10,W-16]){ell(A,x+3,18,4,2,ir[0]);ell(A,x+3,18,2,1,ir[2]);}
  rect(A,cx-1,0,4,14,ir[2]);vl(A,cx-1,0,14,ir[4]);rect(A,cx-8,30,16,12,ir[0]);frame(A,cx-8,30,16,12,ir[3],ir[0]);
  for(let i=0;i<14;i+=3)rect(A,cx-7+i,33,2,6,N?PAL.lit[3]:PAL.rust[2]);rect(A,cx-4,46,8,2,PAL.brass[2]);for(const x of [5,W-9])post(A,x,H-10,4,8);gs(cx+3,base,W/2-2|0,3,80);}
// ---- 3/4 cabinet: a lit top you look down on, a front frame, a recessed dark back, each shelf board lit on its top edge, items shading the back behind them
function cabinet(x0,y0,w,h,top,R,inner){rect(A,x0,y0,w,top,R[4]);hl(A,x0,y0,w,R[5]||R[4]);hl(A,x0,y0+top-1,w,R[2]);for(let i=x0+5;i<x0+w-3;i+=9)P(A,i,y0+2,R[3]);
  rect(A,x0,y0+top,w,h-top,R[2]);vl(A,x0,y0+top,h-top,R[3]);vl(A,x0+1,y0+top,h-top,R[3]);vl(A,x0+w-2,y0+top,h-top,R[1]);vl(A,x0+w-1,y0+top,h-top,R[0]);hl(A,x0,y0+h-1,w,R[0]);
  for(let y=y0+top+2;y<y0+h-4;y++)for(let x=x0+3;x<x0+w-3;x++){const dy=y-(y0+top+2);P(A,x,y,shade(inner||R[1],.62+Math.min(.3,(x-x0)/w*.0+dy*0)));}
  for(let y=y0+h-4;y<y0+h-1;y++)hl(A,x0+1,y,w-2,R[1]);for(let x=x0-1;x<x0+w+2;x++){P(SHD,x,y0+h,PAL.out[0],160);P(SHD,x,y0+h+1,PAL.out[0],90);}}
function board(x0,y,w,R){hl(A,x0+2,y,w-4,R[4]);hl(A,x0+2,y+1,w-4,R[2]);hl(A,x0+2,y+2,w-4,R[0]);for(let x=x0+3;x<x0+w-3;x++){const c=G(A,x,y-1);if(c)P(A,x,y-1,shade(c,.75));}}
if(K==='shelf'){const goods=CFG.goods||'books',x0=2,w=W-4,top=6,h=H-4;cabinet(x0,1,w,h,top,WD,WD[1]);const step=CFG.step||17;const ys=[];for(let sy=1+top+step;sy<1+h-6;sy+=step)ys.push(sy);
  let prev=1+top+2;for(const sy of ys){let x=x0+4;
    while(x<x0+w-5){const room=x0+w-5-x;
      if(goods==='books'){const bw=Math.min(room,2+(hsh(x,sy,1)*3|0)),bh=8+(hsh(x,sy,2)*5|0),R=[PAL.red,PAL.teal,PAL.mustard,PAL.blue,PAL.sage,PAL.rust][hsh(x,sy,3)*6|0];const lean=hsh(x,sy,9)>.9;
        for(let j=0;j<bh;j++)for(let i=0;i<bw;i++){const c=i===0?R[3]:i===bw-1?R[1]:R[2];P(A,x+i+(lean&&j<bh/2?1:0),sy-bh+j,c);}hl(A,x,sy-bh+2,bw,R[4]||R[3]);hl(A,x,sy-3,bw,R[1]);P(A,x+bw,sy-bh+2,shade(WD[1],.5));x+=bw+(hsh(x,sy,4)>.85?3:0);}
      else if(goods==='jars'){const R=[PAL.rust,PAL.sage,PAL.mustard,PAL.red][hsh(x,sy,3)*4|0];rect(A,x,sy-9,5,9,PAL.glass[2]);rect(A,x+1,sy-6,3,6,R[3]);vl(A,x+3,sy-6,6,R[2]);hl(A,x,sy-10,5,PAL.brass[2]);hl(A,x,sy-11,5,PAL.brass[3]);P(A,x+1,sy-8,PAL.glass[5]);vl(A,x+5,sy-9,9,shade(WD[1],.5));x+=7;}
      else if(goods==='cans'){const R=[PAL.red,PAL.blue,PAL.mustard,PAL.sage][hsh(x,sy,3)*4|0];rect(A,x,sy-8,4,8,R[2]);vl(A,x,sy-8,8,R[3]);vl(A,x+3,sy-8,8,R[1]);hl(A,x,sy-5,4,PAL.cream[3]);hl(A,x,sy-8,4,TR[4]);vl(A,x+4,sy-8,8,shade(WD[1],.5));x+=5;}
      else if(goods==='tools'||goods==='parts'){const t=hsh(x,sy,3);if(t<.35){rect(A,x,sy-10,6,10,PAL.slate[2]);hl(A,x,sy-10,6,PAL.slate[4]);vl(A,x+5,sy-10,10,PAL.slate[1]);x+=8;}
        else if(t<.65){ell(A,x+3,sy-4,3,3,PAL.slate[3]);ell(A,x+3,sy-4,1,1,PAL.ink[0]);P(A,x+2,sy-6,PAL.slate[5]);x+=8;}else{rect(A,x,sy-6,8,6,PAL.red[2]);hl(A,x,sy-6,8,PAL.red[4]);vl(A,x+7,sy-6,6,PAL.red[1]);P(A,x+3,sy-7,PAL.slate[4]);x+=10;}}
      else if(goods==='mail'){for(let i=0;i<5&&x<x0+w-8;i++){rect(A,x,sy-12,7,12,WD[0]);hl(A,x,sy-12,7,WD[1]);if(hsh(i,sy,5)>.3){rect(A,x+1,sy-9,5,6,PAL.cream[3]);hl(A,x+1,sy-9,5,PAL.cream[2]);P(A,x+4,sy-8,PAL.red[3]);}vl(A,x+7,sy-12,12,WD[3]);x+=8;}break;}
      else break;}
    board(x0,sy,w,WD);prev=sy;}
  }
// ---- personality furniture
if(K==='rocker'){const R=WD;for(let y=4;y<22;y++){rect(A,5,y,W-10,1,R[(y%4)?2:1]);}frame(A,5,4,W-10,18,R[4],R[0]);for(let x=7;x<W-7;x+=4)vl(A,x,6,14,R[1]);topBox(4,22,W-8,6,3,R);
  for(const x of [6,W-8])post(A,x,31,3,H-37);for(let i=0;i<W-2;i++){const y=H-5+Math.round(Math.pow((i-(W-2)/2)/((W-2)/2),2)*2);P(A,1+i,y,R[3]);P(A,1+i,y+1,R[1]);}
  rect(B,7,23,W-14,4,PAL.red[3]);hl(B,7,23,W-14,PAL.red[4]);for(let x=8;x<W-8;x+=3)P(B,x,25,PAL.cream[2]);}
if(K==='cradle'){const R=WD;for(let y=0;y<H-8;y++)for(let x=2;x<W-2;x++){const e=x===2||x===W-3||y===0;P(A,x,y+4,e?R[4]:(x%4===0?R[1]:R[3]));}rect(A,4,6,W-8,H-16,PAL.cream[3]);hl(A,4,6,W-8,PAL.cream[2]);
  ell(B,W/2|0,10,4,3,[230,220,210]);P(B,(W/2|0)-1,10,PAL.ink[0]);P(B,(W/2|0)+1,10,PAL.ink[0]);rect(B,(W/2|0)-5,13,10,5,PAL.red[3]);for(let i=0;i<W-4;i++){const y=H-4+Math.round(Math.pow((i-(W-4)/2)/((W-4)/2),2)*2);P(A,2+i,y,R[3]);P(A,2+i,y+1,R[0]);}gs(W/2|0,H-2,W/2-3|0,2,90);}
if(K==='piano'){const R=[[30,18,14],[52,30,22],[78,46,32],[104,64,44],[132,86,60],[160,110,80]];topBox(2,4,W-4,8,H-24,R,R[2]);rect(A,6,16,W-12,10,R[1]);frame(A,6,16,W-12,10,R[3],R[0]);
  for(let x=6;x<W-6;x+=3){rect(A,x,24,2,8,[236,232,220]);P(A,x+2,24,PAL.ink[1]);}for(let x=7;x<W-7;x+=6)rect(A,x,24,2,4,PAL.ink[0]);hl(A,6,32,W-12,R[0]);
  rect(B,W/2-6|0,6,12,8,PAL.cream[3]);for(let i=0;i<3;i++)hl(B,W/2-5|0,8+i*2,10,PAL.ink[1]);for(const x of [8,W-12])rect(B,x,1,3,6,PAL.cream[3]),P(B,x+1,0,N?PAL.lit[5]:PAL.lit[3]);for(const x of [4,W-8])post(A,x,H-12,4,10);}
if(K==='chess'){topBox(4,12,W-8,12,4,WD);for(let j=0;j<4;j++)for(let i=0;i<8;i++){const c=(i+j)%2?PAL.cream[3]:WD[1];rect(A,8+i*3,13+j*2,3,2,c);}
  for(const [x,y,c] of [[10,11,PAL.ink[0]],[14,10,PAL.ink[0]],[22,11,TR[5]],[27,10,TR[5]],[18,12,TR[5]]]){vl(B,x,y,3,c);P(B,x,y-1,c);}post(A,W/2-2|0,28,4,H-32);rect(A,W/2-7|0,H-6,14,3,WD[2]);gs(W/2|0,H-3,10,2,80);}
if(K==='blackboard'){rect(A,1,1,W-2,H-6,WD[2]);frame(A,1,1,W-2,H-6,WD[4],WD[0]);rect(A,4,4,W-8,H-13,[34,52,44]);for(let i=0;i<30;i++)P(A,5+(hsh(i,1)*(W-10)|0),5+(hsh(i,2)*(H-15)|0),[46,66,56]);
  drawText(A,'DAYS LEFT',7,7,[220,224,214]);drawText(A,'9',W-14,7,[240,200,190]);for(let k=0;k<4;k++)for(let i=0;i<5;i++)vl(A,8+k*12+i*2,16,6,[200,204,196]);for(let k=0;k<4;k++)for(let i=0;i<9;i++)P(A,7+k*12+i,19-((i%3)?0:0)+(i===4?0:0),[200,204,196]);
  hl(A,3,H-6,W-6,WD[4]);hl(A,3,H-5,W-6,WD[1]);rect(A,12,H-8,6,2,[240,240,236]);}
if(K==='schooldesk'){topBox(2,8,W-4,9,3,WD);rect(B,6,9,8,5,PAL.cream[3]);hl(B,7,11,6,PAL.ink[1]);P(B,W-8,10,PAL.slate[2]);for(const x of [3,W-6])post(A,x,20,3,H-24);rect(A,4,H-10,W-8,2,PAL.slate[2]);gs(W/2|0,H-3,W/2-3|0,2,80);}
if(K==='globe'){ell(A,W/2|0,10,8,8,PAL.blue[3]);for(const [x,y,r] of [[-3,-2,3],[3,2,3],[-1,4,2]])ell(A,(W/2|0)+x,10+y,r,r-1,PAL.sage[3]);ell(A,(W/2|0)-3,6,2,2,PAL.blue[5]);
  for(let a=0;a<20;a++){const t=a/20*Math.PI;P(A,(W/2|0)+Math.round(Math.cos(t+1.6)*10),10-Math.round(Math.sin(t+1.6)*10),PAL.brass[2]);}vl(A,W/2|0,19,H-24,WD[2]);rect(A,(W/2|0)-5,H-5,10,3,WD[2]);gs(W/2|0,H-2,7,2,80);}
if(K==='mailsacks'){for(const [cx,cy,rx,ry] of [[10,H-11,9,8],[22,H-10,9,8],[16,H-17,7,6]]){for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){if(x*x/(rx*rx)+y*y/(ry*ry)>1)continue;const l=-x/rx*.5-y/ry*.7;P(A,cx+x,cy+y,PAL.slate[l>.4?4:l>-.2?3:2]);}
    rect(A,cx-2,cy-ry-2,5,3,PAL.slate[2]);hl(A,cx-2,cy-ry,5,PAL.bark[2]);}drawText(A,'US',7,H-12,PAL.cream[3]);for(let i=0;i<4;i++){rect(B,24+i*2,H-21-i,6,4,PAL.cream[3]);hl(B,24+i*2,H-21-i,6,PAL.cream[2]);}gs(W/2|0,H-2,W/2-2|0,2,90);}
if(K==='netwall'){for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){if((x+y)%6===0||(x-y+60)%6===0)P(A,x,y+Math.round(Math.sin(x*.2)*2),[150,130,96]);}for(const [x,y] of [[8,6],[20,10],[34,5],[46,12],[14,22],[40,24]]){ell(A,x,y,2,2,PAL.red[3]);P(A,x-1,y-1,PAL.red[4]);}
  for(const x of [3,W-4]){vl(A,x,0,H,WD[3]);P(A,x,0,PAL.slate[4]);}}
if(K==='rods'){rect(A,2,H-10,W-4,6,WD[2]);hl(A,2,H-10,W-4,WD[4]);for(let i=0;i<4;i++){const x=6+i*6;for(let y=2;y<H-8;y++)P(A,x+Math.round((H-y)*.02*(i-1.5)),y,i%2?WD[4]:[60,50,40]);P(A,x,2,PAL.red[3]);rect(A,x-1,H-16,3,4,PAL.slate[3]);}
  vl(A,3,0,H-4,WD[1]);vl(A,W-4,0,H-4,WD[1]);gs(W/2|0,H-2,W/2-2|0,2,80);}
if(K==='coffin'){const R=[[30,20,16],[52,34,26],[78,52,38],[104,72,52],[130,94,68],[156,118,88]];for(const x of [8,W-12])post(A,x,H-12,4,10);
  const poly=(y)=>{const t=y/(H-16);return Math.round((W/2-4)*(t<.3?.75+t*.8:1-(t-.3)*.35));};for(let y=0;y<H-16;y++){const hw=poly(y);for(let x=-hw;x<=hw;x++){const e=Math.abs(x)>hw-2;P(A,(W/2|0)+x,2+y,e?R[x<0?4:1]:R[3]);}}
  for(let y=4;y<H-20;y++)P(B,W/2|0,y,R[1]);hl(B,(W/2|0)-4,10,9,R[1]);drawText(B,'M',(W/2|0)-1,18,PAL.brass[3]);gs(W/2|0,H-2,W/2-4|0,2,90);}
if(K==='shovels'){rect(A,2,6,W-4,4,WD[3]);hl(A,2,6,W-4,WD[5]);for(let i=0;i<3;i++){const x=7+i*9;vl(A,x,4,H-22,WD[3]);vl(A,x+1,4,H-22,WD[1]);rect(A,x-2,H-19,6,10,PAL.slate[3]);hl(A,x-2,H-19,6,PAL.slate[4]);P(A,x,H-9,PAL.slate[2]);
    P(A,x-1,H-10,PAL.slate[2]);P(A,x+2,H-10,PAL.slate[2]);hl(A,x-2,3,6,WD[2]);}for(let y=H-12;y<H-3;y++)P(B,5,y,[90,62,36]);gs(W/2|0,H-2,W/2-2|0,2,80);}
if(K==='filecab'){topBox(2,2,W-4,5,H-10,PAL.slate,PAL.slate[2]);for(let k=0;k<3;k++){const y=10+k*((H-14)/3|0);frame(A,4,y,W-8,(H-14)/3-2|0,PAL.slate[4],PAL.slate[0]);rect(A,(W/2|0)-3,y+3,6,2,PAL.brass[2]);rect(B,6,y+1,6,2,PAL.cream[3]);}}
if(K==='mapboard'){rect(A,1,1,W-2,H-2,WD[2]);frame(A,1,1,W-2,H-2,WD[4],WD[0]);rect(A,4,4,W-8,H-8,PAL.cream[2]);for(let i=0;i<14;i++)P(A,5+(hsh(i,4)*(W-10)|0),5+(hsh(i,5)*(H-10)|0),PAL.cream[1]);
  for(let x=6;x<W-6;x++){P(A,x,(H/2|0)+Math.round(Math.sin(x*.18)*4),PAL.rust[2]);}for(const [x,y] of [[10,10],[24,16],[38,8],[46,22],[18,26]]){P(B,x,y,PAL.red[4]);P(B,x,y+1,PAL.red[2]);}
  for(let t=0;t<1;t+=.05){P(B,Math.round(10+t*36),Math.round(10+t*12),PAL.red[3]);}for(let t=0;t<1;t+=.05)P(B,Math.round(46-t*28),Math.round(22+t*4),PAL.red[3]);}
if(K==='photowall'){for(const [x,y,w,h,k] of [[2,2,12,14,0],[16,4,14,10,1],[32,2,10,12,2],[8,18,16,10,3],[28,16,12,12,4]]){rect(A,x,y,w,h,WD[3]);frame(A,x,y,w,h,WD[5],WD[0]);
    rect(A,x+2,y+2,w-4,h-4,[[200,190,170],[180,170,150],[210,200,180],[170,160,140],[190,180,160]][k]);ell(A,x+(w>>1),y+(h>>1)-1,2,2,[110,96,80]);rect(A,x+(w>>1)-2,y+(h>>1)+1,5,3,[110,96,80]);P(A,x+(w>>1),y-1,PAL.slate[4]);}}
if(K==='knit'){ell(A,W/2|0,H-7,8,5,WD[3]);ell(A,W/2|0,H-9,7,3,WD[1]);for(const [x,y,c] of [[-3,-11,PAL.red],[2,-12,PAL.teal],[0,-9,PAL.mustard]])ell(A,(W/2|0)+x,H+y,3,3,c[3]);vl(A,(W/2|0)+4,H-18,8,PAL.slate[4]);vl(A,(W/2|0)+6,H-17,8,PAL.slate[4]);gs(W/2|0,H-2,9,2,80);}
// ---- the garage
if(K==='tires'){for(let k=0;k<4;k++){const y=H-6-k*7;for(let yy=-4;yy<=4;yy++)for(let x=-12;x<=12;x++){const d=x*x/144+yy*yy/16;if(d>1)continue;const inner=x*x/36+yy*yy/4<1;P(A,(W/2|0)+x,y+yy,inner?[16,14,16]:d>.7?[30,28,30]:yy<0?[64,62,66]:[42,40,44]);}
    for(let x=-11;x<=11;x+=3)P(A,(W/2|0)+x,y-3,[80,78,84]);}gs(W/2|0,H-2,13,2,100);}
if(K==='drum'){const Rd=CFG.blue?PAL.blue:PAL.red;for(let y=6;y<H-3;y++){for(let x=-9;x<=9;x++){const u=(x+9)/18;P(A,(W/2|0)+x,y,Rd[u<.2?4:u<.55?3:u<.85?2:1]);}}for(const y of [10,(H/2|0),H-7])for(let x=-9;x<=9;x++)P(A,(W/2|0)+x,y,Rd[1]);
  ell(A,W/2|0,6,9,3,Rd[4]);ell(A,W/2|0,6,7,2,Rd[2]);ell(A,(W/2|0)+4,6,1,1,PAL.ink[0]);for(let i=0;i<6;i++)P(B,(W/2|0)-6+i*2,H-8+(i%2),[20,18,22]);ell(SHD,(W/2|0)+3,H-1,11,2,PAL.out[0]);}
if(K==='toolbox'){const Rr=PAL.red;topBox(2,4,W-4,6,H-16,Rr,Rr[2]);for(let k=0;k<4;k++){const y=12+k*5;hl(A,4,y,W-8,Rr[1]);hl(A,(W/2|0)-4,y+2,8,PAL.slate[4]);}for(const x of [5,W-8]){ell(A,x+1,H-4,2,2,PAL.ink[0]);}
  rect(B,6,1,9,3,PAL.slate[3]);P(B,18,2,PAL.slate[4]);rect(B,22,2,6,2,PAL.mustard[3]);}
if(K==='hoist'){const Y=PAL.mustard;for(let i=0;i<W-6;i++){P(A,3+i,H-6,Y[3]);P(A,3+i,H-5,Y[1]);}vl(A,8,8,H-14,Y[3]);vl(A,9,8,H-14,Y[1]);for(let i=0;i<W-12;i++){const y=8+Math.round(i*.15);P(A,8+i,y,Y[4]);P(A,8+i,y+1,Y[2]);}
  vl(A,W-6,10,16,PAL.slate[2]);for(let y=26;y<34;y+=2){P(A,W-7,y,PAL.slate[3]);P(A,W-5,y+1,PAL.slate[3]);}rect(A,W-12,34,12,10,PAL.slate[2]);hl(A,W-12,34,12,PAL.slate[4]);for(let x=W-11;x<W-1;x+=3)vl(A,x,36,7,PAL.slate[1]);
  for(const x of [4,W-8])ell(A,x+1,H-3,2,2,PAL.ink[0]);gs(W/2|0,H-2,W/2-2|0,2,90);}
if(K==='car'){ // the cruiser on blocks, hood up, seen from the 3/4 view: roof and glass on top, doors along the front, wheels off
  const B2=[[22,24,30],[40,44,54],[70,76,92],[110,118,136],[160,168,184],[214,220,232]];const x0=6,w=W-12;for(const x of [x0+14,x0+w-26])for(let y=H-14;y<H-3;y++)hl(A,x,y,12,ST[(y%3)?2:1]);
  for(let y=24;y<H-12;y++)for(let x=x0;x<x0+w;x++){const t=(y-24)/(H-36);let c=B2[t<.1?4:t<.55?3:2];if(x<x0+3)c=B2[4];if(x>x0+w-4)c=B2[1];P(A,x,y,c);}
  for(let x=x0+6;x<x0+w-6;x++){P(A,x,H-26,B2[1]);P(A,x,H-25,TR[4]);P(A,x,H-24,TR[3]);}drawText(A,'SHERIFF',x0+w/2-14|0,H-21,B2[0]);
  const rx0=x0+w*.28|0,rw=w*.42|0;for(let y=6;y<24;y++){const inset=Math.round((24-y)*.3);for(let x=rx0+inset;x<rx0+rw-inset;x++){let c=y<10?B2[3]:N?PAL.ink[0]:PAL.glass[y<16?3:2];if(!N&&(x-y)%9===0&&y>=10)c=PAL.glass[5];P(A,x,y,c);}}
  rect(A,rx0+rw/2-6|0,4,5,3,PAL.red[3]);rect(A,rx0+rw/2+1|0,4,5,3,PAL.blue[3]);
  for(let y=0;y<22;y++)for(let x=0;x<20;x++){if(x+y<6)continue;P(A,x0+w-22+x,2+y,y<3?B2[4]:B2[2]);}rect(A,x0+w-30,22,24,6,PAL.ink[1]);for(let i=0;i<4;i++)rect(A,x0+w-28+i*6,23,4,3,PAL.slate[3]);
  for(const x of [x0+14,x0+w-26]){ell(A,x+6,H-14,7,3,[16,14,16]);}gs(cx,base,W/2-2|0,3,110);}
if(K==='rug'){for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(x-W/2)/(W/2),dy=(y-H/2)/(H/2);const d=dx*dx+dy*dy;if(d>1)continue;let c=PAL.red[2];if(d>.8)c=PAL.mustard[2];else if(d>.7)c=PAL.red[1];else if(d<.18)c=PAL.mustard[3];else if((Math.round(Math.atan2(dy,dx)*4))%2===0&&d>.35&&d<.55)c=PAL.cream[2];P(A,x,y,c);}}
if(K==='counter'){ // shop counter with a till, a bell and a jar of candy
  topBox(2,10,W-4,10,H-24,WD,WD[2]);for(let x=6;x<W-6;x+=16)frame(A,x,24,12,H-32,WD[3],WD[0]);
  rect(B,W-30,1,16,10,PAL.slate[2]);frame(B,W-30,1,16,10,PAL.slate[4],PAL.slate[0]);rect(B,W-27,3,10,3,PAL.cream[3]);for(let i=0;i<4;i++)P(B,W-28+i*3,8,PAL.brass[3]);
  ell(B,20,10,3,2,PAL.brass[3]);P(B,20,7,PAL.brass[3]);rect(B,36,3,7,8,PAL.glass[3]);for(let i=0;i<5;i++)P(B,37+i,6+(i%2),[PAL.red[4],PAL.mustard[5],PAL.sage[4]][i%3]);
  gs(cx+3,base,W/2-2|0,3,80);}
if(K==='crates'){topBox(2,8,W/2-2,7,H-18,WD);topBox(W/2+1,14,W/2-3,7,H-24,WD);for(const [x,w,y] of [[2,W/2-2,15],[W/2+1,W/2-3,21]]){for(let i=0;i<w-4;i++)P(A,x+2+i,y+3+Math.round(i*(H-y-12)/(w-4)),WD[4]);}
  for(let i=0;i<4;i++)ell(B,8+i*6,7,3,2,PAL.rust[4]);gs(cx+3,base,W/2-2|0,3,80);}
if(K==='pew'){const x0=2,w=W-4;rect(A,x0,2,w,16,WD[2]);frame(A,x0,2,w,16,WD[4],WD[0]);hl(A,x0,2,w,WD[5]);topBox(x0,18,w,7,4,WD);
  for(const x of [x0,x0+w-6])post(A,x,2,6,H-6);for(let x=x0+8;x<x0+w-8;x+=26){rect(B,x,12,8,3,PAL.red[2]);}gs(cx+3,base,W/2-2|0,2,70);}
if(K==='altar'){topBox(4,22,W-8,10,H-36,TR,TR[3]);for(let x=8;x<W-8;x+=12)vl(A,x,34,H-40,TR[2]);rect(B,cx-14,24,28,6,PAL.red[2]);hl(B,cx-14,24,28,PAL.red[4]);
  for(const x of [10,W-14]){rect(B,x,8,4,14,PAL.cream[3]);P(B,x+1,5,N?PAL.lit[5]:PAL.lit[3]);P(B,x+2,6,PAL.lit[4]);rect(B,x-1,21,6,2,PAL.brass[2]);}
  // the ledger, open
  rect(B,cx-9,18,18,6,PAL.cream[3]);vl(B,cx,18,6,PAL.cream[1]);for(let i=0;i<3;i++){hl(B,cx-7,19+i*2,6,PAL.ink[1]);hl(B,cx+2,19+i*2,6,PAL.ink[1]);}gs(cx+3,base,W/2-2|0,3,80);}
if(K==='bench'){ // Hollis's workbench: vice, pegboard back, scattered parts
  rect(A,2,0,W-4,24,WD[1]);frame(A,2,0,W-4,24,WD[3],WD[0]);for(let y=4;y<22;y+=5)for(let x=6;x<W-6;x+=5)P(A,x,y,WD[0]);
  for(const [x,t] of [[10,0],[22,1],[34,2],[48,0],[60,1]]){if(t===0){vl(B,x,3,14,PAL.slate[4]);rect(B,x-2,3,5,4,PAL.slate[2]);}else if(t===1){vl(B,x,5,12,WD[4]);rect(B,x-3,3,7,3,PAL.slate[3]);}else{ell(B,x,9,5,5,PAL.slate[3]);ell(B,x,9,3,3,PAL.ink[1]);}}
  topBox(2,24,W-4,10,H-38,WD,WD[2]);rect(B,W-20,18,10,8,PAL.slate[2]);hl(B,W-20,18,10,PAL.slate[4]);rect(B,10,27,6,3,PAL.slate[3]);ell(B,30,29,3,2,PAL.rust[2]);rect(B,44,26,9,4,PAL.red[3]);
  for(const x of [5,W-9])post(A,x,H-12,4,10);gs(cx+3,base,W/2-2|0,3,80);}
if(K==='cellar'){ // a cellar door set into the floor, chained, with scratch marks from the inside
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(x%8);let c=k===0?WD[0]:k===1?WD[3]:WD[2];if(y<2||y>H-3||x<2||x>W-3)c=WD[1];P(A,x,y,c);}
  for(let i=0;i<W;i++){const y=(H/2|0)+Math.round(Math.sin(i*.5));P(B,i,y,PAL.slate[i%3?3:1]);}rect(B,cx-4,(H/2|0)-3,8,7,PAL.slate[2]);frame(B,cx-4,(H/2|0)-3,8,7,PAL.slate[4],PAL.slate[0]);
  for(let i=0;i<5;i++){const x=6+i*5;for(let j=0;j<7;j++)P(B,x+(j>>1),4+j,PAL.ink[0]);}}
if(K==='mirror'){rect(A,2,2,W-4,H-4,WD[3]);frame(A,2,2,W-4,H-4,WD[5],WD[0]);for(let y=5;y<H-5;y++)for(let x=5;x<W-5;x++){let c=N?PAL.ink[1]:PAL.glass[(y<H/2?3:2)];if(!N&&(x-y)%9===0)c=PAL.glass[4];P(A,x,y,c);}}
if(K==='clock'){rect(A,cx-6,0,12,H-2,WD[1]);frame(A,cx-6,0,12,H-2,WD[3],WD[0]);ell(A,cx,9,5,5,PAL.cream[3]);P(A,cx,6,PAL.ink[0]);P(A,cx,7,PAL.ink[0]);P(A,cx+1,9,PAL.ink[0]);P(A,cx+2,9,PAL.ink[0]);
  rect(A,cx-3,20,6,H-26,PAL.ink[0]);vl(A,cx,20,H-30,PAL.brass[2]);ell(A,cx,H-10,2,2,PAL.brass[3]);gs(cx+2,base,7,2,70);}
if(K==='candles'){for(let i=0;i<7;i++){const x=4+i*5,h=6+(hsh(i,1)*8|0);rect(A,x,base-h,3,h,PAL.cream[3]);vl(A,x,base-h,h,PAL.cream[2]);P(A,x+1,base-h-1,N?PAL.lit[5]:PAL.lit[4]);P(A,x+1,base-h-2,PAL.lit[3]);}gs(cx,base,W/2-2|0,2,50);}
if(K==='desk'){topBox(3,12,W-6,10,H-28,WD,WD[2]);frame(A,8,26,W/2-10,H-34,WD[3],WD[0]);P(A,W/4|0,30,PAL.brass[3]);
  rect(B,10,8,14,7,PAL.cream[3]);hl(B,12,10,9,PAL.ink[1]);hl(B,12,12,7,PAL.ink[1]);rect(B,W-20,4,8,10,PAL.slate[2]);ell(B,W-16,3,4,2,N?PAL.lit[4]:PAL.cream[3]);
  for(const x of [5,W-9])post(A,x,H-8,4,6);gs(cx+3,base,W/2-2|0,3,70);}
if(K==='keg'){const x0=4,w=W-8;for(let y=6;y<base;y++){const t=(y-6)/(base-6),half=w/2+Math.round(Math.sin(t*Math.PI)*1.5);for(let x=-half;x<half;x++){const u=(x+half)/(2*half);P(A,cx+x,y,PAL.red[u<.2?4:u<.6?3:u<.85?2:1]);}}
  for(const y of [10,base-6])for(let x=-w/2;x<w/2;x++)P(A,cx+x,y,PAL.slate[3]);ell(A,cx,6,w/2,3,PAL.red[4]);ell(A,cx,6,3,1,PAL.ink[1]);gs(cx+2,base,w/2+1|0,2,70);}
// ---- the cabin's upgrades: Nell's kitchen counter (a basin sink with a pump, a cutting board, crocks) and a stone hearth
if(K==='kcounter'){topBox(2,10,W-4,10,H-24,WD,WD[2]);
  for(const dx of [6,W/2+2|0]){frame(A,dx,24,(W/2|0)-10,H-30,WD[3],WD[0]);P(A,dx+((W/2|0)-10)-3,24+((H-30)>>1),PAL.brass[3]);}
  ell(A,W-20,15,8,4,PAL.white[2]);ell(A,W-20,15,6,3,PAL.white[4]);ell(A,W-20,16,5,2,PAL.glass[3]);P(A,W-22,15,PAL.white[5]);
  rect(A,W-10,2,3,12,PAL.slate[2]);vl(A,W-10,2,12,PAL.slate[4]);rect(A,W-13,2,6,2,PAL.slate[3]);hl(A,W-16,4,6,PAL.slate[2]);
  rect(B,8,12,16,6,WD[4]);hl(B,8,12,16,WD[5]);hl(B,8,17,16,WD[2]);ell(B,15,13,3,2,[236,232,224]);P(B,15,11,PAL.curtain[3]);P(B,16,10,PAL.moss[3]);
  for(const [x,c] of [[28,PAL.rust],[34,PAL.cream]]){rect(B,x,6,5,8,c[2]);hl(B,x,6,5,c[3]);vl(B,x+4,6,8,c[1]);}
  gs(cx+3,base,W/2-2|0,3,70);}
if(K==='hearth'){const ST=PAL.stone,x0=4,w=W-8,top=6;
  for(let y=top;y<H-6;y++)for(let x=x0;x<x0+w;x++){const row=(y-top)/7|0,off=row%2?6:0,col=(x-x0+off)/12|0;const mort=(y-top)%7===6||(x-x0+off)%12===11;
    P(A,x,y,mort?ST[1]:ST[hsh(row,col,4)>.66?4:hsh(row,col,5)>.33?3:2]);}
  rect(A,x0-3,top+16,w+6,5,WD[3]);hl(A,x0-3,top+16,w+6,WD[5]);hl(A,x0-3,top+20,w+6,WD[1]);
  for(const [x,c] of [[x0+4,PAL.cream],[x0+w-9,PAL.cream]]){rect(B,x,top+9,3,7,c[3]);P(B,x+1,top+8,N?PAL.lit[5]:PAL.lit[3]);}
  const fx=cx-13,fy=top+28,fw=26,fh=H-fy-10;for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){const r=fw/2;if(y<r&&(x-r+.5)**2+(r-y)**2>r*r)continue;P(A,fx+x,fy+y,PAL.ink[0]);}
  for(let x=4;x<fw-4;x++){P(A,fx+x,fy+fh-3,WD[1]);P(A,fx+x,fy+fh-4,WD[2]);}
  const F=N?[PAL.lit[2],PAL.lit[3],PAL.lit[4],PAL.lit[5]]:[PAL.lit[1],PAL.lit[2],PAL.lit[3],PAL.lit[4]];
  for(let i=0;i<9;i++){const x=fx+6+i*1.6|0,h=5+(hsh(i,1,7)*7|0);for(let j=0;j<h;j++)P(B,x,fy+fh-5-j,F[Math.min(3,(j*4/h|0)===0?3:3-(j*4/h|0))]);}
  rect(A,x0-6,H-7,w+12,4,ST[3]);hl(A,x0-6,H-7,w+12,ST[5]);hl(A,x0-6,H-4,w+12,ST[1]);gs(cx,base,W/2|0,2,60);}
// ---- the cabin furniture turned, for placing it facing another way. These are the east-facing views; west is the same art flipped.
// chair from its side: the back upright on the left (a post from the floor to the top rail), the seat running toward where it faces
if(K==='chairE'){post(A,4,27,3,H-30);post(A,W-7,27,3,H-30);rect(A,6,H-11,W-12,2,WD[1]);hl(A,6,H-11,W-12,WD[3]);
  for(let y=2;y<27;y++){const lean=y<8?0:y<16?0:0;rect(A,4+lean,y,4,1,WD[2]);P(A,4+lean,y,WD[4]);P(A,7+lean,y,WD[0]);}
  rect(A,3,1,6,3,WD[3]);hl(A,3,1,6,WD[5]);hl(A,3,3,6,WD[1]);for(const y of [9,15])hl(A,5,y,2,WD[1]);
  topBox(5,18,W-8,6,3,WD);gs(cx+1,base,W/2-2|0,2,70);}
// chair from behind: the back of the backrest is nearest you and hides the seat; its back legs stand in front
if(K==='chairN'){for(const x of [4,W-7])post(A,x,27,3,H-30);rect(A,3,24,W-6,3,WD[2]);hl(A,3,24,W-6,WD[3]);hl(A,3,26,W-6,WD[0]);
  rect(A,4,6,W-8,18,WD[1]);frame(A,4,6,W-8,18,WD[3],WD[0]);for(let x=7;x<W-7;x+=4)vl(A,x,8,14,WD[2]);hl(A,4,6,W-8,WD[4]);hl(A,5,7,W-10,WD[2]);
  gs(cx+2,base,W/2-2|0,2,70);}
// bookshelf from its side: a long top you look down on (it runs back into the room) and the plain side panel, the shelf boards showing as pegs
if(K==='shelfE'){const x0=2,sw=5,w=W-4-sw,top=CFG.top||22,fh=H-4-top,fx=x0+w;topBox(x0,1,w+sw,top,fh,WD,WD[2]);
  // the side panel
  for(let y=1+top+2;y<1+top+fh-2;y++){P(A,x0+(w>>1),y,WD[1]);if(hsh(x0,y,3)>.92)P(A,x0+3,y,WD[1]);}
  // a slim strip of the open front, seen at an angle on the side it faces: dark shelf bays, book spines, the board ends lit
  const BK=[PAL.red,PAL.teal,PAL.mustard,PAL.blue,PAL.sage,PAL.rust];
  for(let y=1+top;y<1+top+fh-1;y++){P(A,fx,y,WD[0]);for(let i=1;i<sw;i++)P(A,fx+i,y,shade(WD[1],.55));P(A,fx+sw-1,y,WD[3]);}
  for(let n=0,sy=1+top+17;n<3;n++,sy+=17){for(let y=sy-12;y<sy;y++){const R=BK[hsh(y>>1,sy,3)*6|0];for(let i=1;i<sw-1;i++)P(A,fx+i,y,R[i===1?3:2]);if((y-sy)%3===0)P(A,fx+1,y,R[1]);}
    for(let i=0;i<sw;i++){P(A,fx+i,sy,WD[4]);P(A,fx+i,sy+1,WD[1]);}P(A,x0+3,sy,WD[0]);P(A,x0+3,sy-1,WD[4]);}
  for(let y=1+top+fh-6;y<1+top+fh-1;y++)hl(A,x0+1,y,w+sw-2,WD[1]);for(let x=x0-1;x<x0+w+sw+2;x++){P(SHD,x,H-3,PAL.out[0],160);P(SHD,x,H-2,PAL.out[0],90);}}
// bookshelf from behind: the plank back panel, nails along the boards, the top edge lit
if(K==='shelfN'){const x0=2,w=W-4,top=6,fh=H-4-top;topBox(x0,1,w,top,fh,WD,WD[2]);
  for(let x=x0+2;x<x0+w-2;x++){const seam=(x-x0)%9===0;for(let y=1+top+1;y<1+top+fh-1;y++){let c=seam?WD[0]:WD[(hsh(Math.floor((x-x0)/9),y>>4,5)>.6)?3:2];if(!seam&&(x-x0)%9===1)c=WD[3];P(A,x,y,c);}}
  for(let sy=1+top+17;sy<1+top+fh-6;sy+=17)for(let x=x0+4;x<x0+w-4;x+=9){P(A,x,sy,WD[0]);P(A,x,sy-1,WD[4]);}
  for(let y=1+top+fh-6;y<1+top+fh-1;y++)hl(A,x0+1,y,w-2,shade(WD[1],.85));for(let x=x0-1;x<x0+w+2;x++){P(SHD,x,H-3,PAL.out[0],160);P(SHD,x,H-2,PAL.out[0],90);}}
// ---- Grandpa's rocking chair in three views, and an oil lamp on a little side table (spliced into interior.js before the flatten)
function ln(L,x0,y0,x1,y1,c,t){t=t||1;const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))*2+1;for(let i=0;i<=n;i++){const u=i/n,x=Math.round(x0+(x1-x0)*u),y=Math.round(y0+(y1-y0)*u);for(let a=0;a<t;a++)for(let b=0;b<t;b++)P(L,x+a,y+b,c);}}
function stile(x,y0,y1,w,R){for(let y=y0;y<y1;y++){P(A,x,y,R[4]);for(let i=1;i<w-1;i++)P(A,x+i,y,R[3]);P(A,x+w-1,y,R[1]);}}
function plaid(x0,y0,w,h,top){for(let j=0;j<h;j++)for(let i=0;i<w;i++){const a=(Math.floor(i/3)+Math.floor(j/3))%2;let c=a?RD[3]:RD[4];if(i%3===1&&j%3===1)c=PAL.cream[2];if(j<top)c=shade(c,1.12);if(j===h-1)c=RD[1];P(A,x0+i,y0+j,c);}}
if(K==='rockS'){const R=WD;
  // rockers first: two curved runners coming toward you, toes curling up at the front
  for(const s of [-1,1]){const bx=cx+s*8,fx=cx+s*12;for(let k=0;k<=12;k++){const u=k/12,x=Math.round(bx+(fx-bx)*u),y=Math.round(36+u*8-(u>.85?(u-.85)*14:0));P(A,x,y,R[4]);P(A,x,y+1,R[2]);P(A,x+(s>0?1:-1),y+1,R[1]);}}
  // back legs (half hidden), front legs
  stile(cx-9,31,38,2,R);stile(cx+7,31,38,2,R);stile(cx-12,30,42,3,R);stile(cx+9,30,42,3,R);
  // the tall back: arched top rail, two stiles, five spindles
  stile(cx-11,3,30,3,R);stile(cx+8,3,30,3,R);for(let x=cx-11;x<cx+11;x++){const d=Math.abs(x-cx+.5)/11,y=Math.round(2+d*d*3);P(A,x,y,R[5]);P(A,x,y+1,R[4]);P(A,x,y+2,R[3]);P(A,x,y+3,R[1]);}
  for(let i=0;i<5;i++){const x=cx-7+i*3;for(let y=7;y<23;y++){P(A,x,y,R[4]);P(A,x+1,y,R[2]);}}hl(A,cx-8,22,17,R[3]);hl(A,cx-8,23,17,R[1]);
  // the seat seen from above, wider at the front, a plaid cushion on it
  for(let j=0;j<7;j++){const w=Math.round(20+j*1.2),x0=cx-(w>>1);for(let i=0;i<w;i++)P(A,x0+i,24+j,(i%6===0)?R[3]:R[4]);P(A,x0,24+j,R[5]);}
  plaid(cx-8,22,17,6,2);rect(A,cx-13,31,27,2,R[2]);hl(A,cx-13,31,27,R[4]);hl(A,cx-13,33,27,R[0]);
  // arms reaching forward from the back, on turned front posts
  for(const s of [-1,1]){const x0=s<0?cx-11:cx+10,x1=s<0?cx-14:cx+12;ln(A,x0,14,x1,23,R[4],2);ln(A,x0+(s<0?1:0),16,x1+(s<0?1:0),25,R[2]);stile(s<0?cx-14:cx+11,24,31,3,R);P(A,(s<0?cx-14:cx+11)+1,26,R[5]);}
  gs(cx,base-1,13,2,80);}
if(K==='rockE'){const R=WD;
  // a long curved runner under it all
  for(let x=3;x<W-3;x++){const u=(x-W/2)/(W/2-3),y=Math.round(41-u*u*5);P(A,x,y,R[4]);P(A,x,y+1,R[3]);P(A,x,y+2,R[1]);}
  // legs down to the runner
  ln(A,13,39,15,26,R[3],2);ln(A,30,38,29,26,R[3],2);ln(A,14,39,16,26,R[1]);
  // the seat edge and cushion
  rect(A,13,25,20,3,R[3]);hl(A,13,25,20,R[5]);hl(A,13,27,20,R[1]);plaid(14,21,17,4,1);
  // the back leans away
  for(let y=2;y<26;y++){const x=Math.round(8+(y-2)*.25);P(A,x,y,R[5]);P(A,x+1,y,R[4]);P(A,x+2,y,R[2]);P(A,x+3,y,R[1]);}rect(A,6,1,6,3,R[4]);hl(A,6,1,6,R[5]);
  // the arm and its front post
  ln(A,11,13,31,15,R[4],2);hl(A,12,13,19,R[5]);stile(29,16,25,3,R);
  gs(W/2|0,base-1,18,2,80);}
if(K==='rockN'){const R=WD;
  for(const s of [-1,1]){const bx=cx+s*12,fx=cx+s*8;for(let k=0;k<=12;k++){const u=k/12,x=Math.round(bx+(fx-bx)*u),y=Math.round(44-u*8+(u<.15?(.15-u)*12:0));P(A,x,y,R[3]);P(A,x,y+1,R[1]);}}
  stile(cx-12,30,42,3,R);stile(cx+9,30,42,3,R);stile(cx-9,30,37,2,R);stile(cx+7,30,37,2,R);
  for(const s of [-1,1]){const x0=s<0?cx-11:cx+10,x1=s<0?cx-14:cx+12;ln(A,x0,14,x1,23,R[3],2);stile(s<0?cx-14:cx+11,24,30,3,R);}
  rect(A,cx-13,29,27,3,R[2]);hl(A,cx-13,29,27,R[3]);hl(A,cx-13,31,27,R[0]);
  stile(cx-11,3,31,3,R);stile(cx+8,3,31,3,R);for(let x=cx-11;x<cx+11;x++){const d=Math.abs(x-cx+.5)/11,y=Math.round(2+d*d*3);P(A,x,y,R[4]);P(A,x,y+1,R[3]);P(A,x,y+2,R[2]);P(A,x,y+3,R[0]);}
  for(let i=0;i<5;i++){const x=cx-7+i*3;for(let y=7;y<26;y++){P(A,x,y,R[3]);P(A,x+1,y,R[1]);}}hl(A,cx-8,25,17,R[2]);hl(A,cx-8,26,17,R[0]);
  gs(cx,base-1,13,2,80);}
if(K==='oillamp'){const R=WD;
  // a round side table on one turned leg and three feet
  ell(A,cx,21,9,3,R[4]);ell(A,cx,20,9,2,R[5]);for(let x=-9;x<=9;x++)P(A,cx+x,23+(Math.abs(x)>7?-1:0),R[2]);
  for(let y=24;y<36;y++){const w=y<27||y>32?2:1;rect(A,cx-w,y,w*2,1,R[3]);P(A,cx-w,y,R[4]);P(A,cx+w-1,y,R[1]);}ell(A,cx,29,2,1,R[4]);
  ln(A,cx-1,35,cx-6,base,R[3]);ln(A,cx,35,cx+6,base,R[2]);ln(A,cx,36,cx,base,R[1]);
  // a lace doily, then the lamp: brass font, collar, glass chimney, the flame
  ell(A,cx,19,6,1,PAL.cream[3]);for(let x=-6;x<=6;x+=2)P(A,cx+x,20,PAL.cream[2]);
  ell(A,cx,16,5,3,PAL.brass[2]);ell(A,cx-1,15,3,1,PAL.brass[3]);hl(A,cx-4,18,9,PAL.brass[1]);rect(A,cx-2,12,5,2,PAL.brass[1]);hl(A,cx-2,12,5,PAL.brass[3]);
  for(let y=2;y<12;y++){const w=y<4?2:y<9?3:2;for(let x=-w;x<=w;x++){const edge=Math.abs(x)===w;P(A,cx+x,y,N?(edge?PAL.lit[3]:PAL.lit[4]):(edge?PAL.glass[4]:PAL.glass[5]),N?255:edge?230:95);}}
  P(A,cx-2,4,PAL.glass[5]);P(A,cx-2,5,PAL.glass[5]);hl(A,cx-2,1,5,PAL.brass[2]);
  if(N){P(A,cx,8,PAL.lit[5]);P(A,cx,7,PAL.lit[5]);P(A,cx,9,PAL.lit[4]);P(A,cx-1,8,PAL.lit[5]);P(A,cx+1,8,PAL.lit[4]);}else{P(A,cx,9,PAL.lit[3]);P(A,cx,8,PAL.lit[4]);}
  P(A,cx,10,PAL.ink?PAL.ink[0]:R[0]);
  gs(cx,base,8,2,70);}
const flat=flatten([A,B],W,H);const O=K==='room'||K==='rug'?layer('o',W,H):outline(flat);
emit([SHD,O,A,B],CFG.out);if(K!=='room')console.log('META '+JSON.stringify({w:W,h:H}));
