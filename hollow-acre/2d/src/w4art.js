/* ================= W4 part two, Chapter One's pictures (story plan, chapter 1, beats 7-9): Coyle's corkboard of MISSING
   posters, one for every autumn; Agnes's open door, with Ruth's room kept the way it was past it; the valley from the cabin
   window on your first night, when the town's lit windows go out one at a time. Drawn here pixel by pixel on the close-up
   canvas (176x112, shown at 2x); nothing on the board or in the room shows a child hurt. ================= */
const W4F={H:['#.#','#.#','###','#.#','#.#'],P:['##.','#.#','##.','#..','#..'],U:['#.#','#.#','#.#','#.#','###'],Y:['#.#','#.#','.#.','.#.','.#.'],V:['#.#','#.#','#.#','#.#','.#.'],L:['#..','#..','#..','#..','###'],A:['.#.','#.#','###','#.#','#.#'],E:['###','#..','##.','#..','###'],'0':['###','#.#','#.#','#.#','###'],'1':['.#','##','.#','.#','.#'],'2':['###','..#','###','#..','###'],'6':['###','#..','###','#.#','###'],'7':['###','..#','.#.','.#.','.#.'],'8':['###','#.#','###','#.#','###'],'9':['###','#.#','###','..#','###'],M:['#...#','##.##','#.#.#','#...#','#...#'],I:['#','#','#','#','#'],S:['###','#..','###','..#','###'],N:['#..#','##.#','#.##','#..#','#..#'],
  G:['.###','#...','#.##','#..#','.###'],O:['.#.','#.#','#.#','#.#','.#.'],C:['###','#..','#..','#..','###'],T:['###','.#.','.#.','.#.','.#.']};
function w4Text(P,x,y,s,col){for(const ch of s){const g=W4F[ch];if(!g){x+=3;continue;}for(let r=0;r<g.length;r++)for(let c=0;c<g[r].length;c++)if(g[r][c]==='#')P(x+c,y+r,1,1,col);x+=g[0].length+1;}return x;}
const w4Hash=(a,b)=>(((a*73856093)^(b*19349663))>>>0)%1000/1000;

// ---- the corkboard: posters pinned over posters, the oldest at the bottom of the pile gone the colour of tea
function w4Board(){return st37Cv(176,112,(P,g)=>{
  // the store's back wall: planks, lit along their top edge
  for(let y=0;y<112;y++){const row=Math.floor(y/9),cy=y%9;const c=cy===0?'#2e1c12':cy===1?'#7a5232':row%2?'#5a3a22':'#62402a';P(0,y,176,1,c);}
  for(let row=0;row<13;row++){const x=((row*53)%37)+20;P(x,row*9+1,1,8,'#3e2818');P(x+71,row*9+1,1,8,'#3e2818');P(x+128,row*9+1,1,8,'#3e2818');}
  // the frame (oak), lit on top and left, dark on the right and bottom
  const X0=9,Y0=5,X1=167,Y1=107;P(X0-1,Y0-1,X1-X0+3,Y1-Y0+3,'#24160c');P(X0,Y0,X1-X0+1,Y1-Y0+1,'#6e4626');
  P(X0,Y0,X1-X0+1,1,'#b0804a');P(X0,Y0,1,Y1-Y0+1,'#9a6c3c');P(X0+1,Y0+1,X1-X0-1,1,'#8e5e32');P(X1,Y0,1,Y1-Y0+1,'#4a2e1a');P(X0,Y1,X1-X0+1,1,'#3e2616');
  // the cork: warm brown, a few broad darker patches (shapes, not grain)
  const CX0=14,CY0=10,CX1=162,CY1=102;P(CX0-1,CY0-1,CX1-CX0+3,1,'#3e2616');P(CX0-1,CY0-1,1,CY1-CY0+3,'#4a2e1a');
  P(CX0,CY0,CX1-CX0+1,CY1-CY0+1,'#8e6438');
  for(let i=0;i<46;i++){const x=CX0+Math.floor(w4Hash(i,3)*144),y=CY0+Math.floor(w4Hash(i,7)*88),w=3+Math.floor(w4Hash(i,11)*5),h=2+Math.floor(w4Hash(i,13)*3),c=i%3?'#7e5832':'#9e7242';
    for(let r=0;r<h;r++){const o=(r*7+i)%3-1;P(x+o,y+r,Math.max(2,w-Math.abs(r-1)),1,c);}}
  for(let i=0;i<14;i++){const x=CX0+Math.floor(w4Hash(i,17)*144),y=CY0+Math.floor(w4Hash(i,19)*88);P(x,y,2,2,'#6e4a2a');P(x+2,y+1,1,1,'#6e4a2a');}
  // posters, oldest first (the bottom of the pile); each newer one pinned over the last, like scales
  const AGES=[ // paper, shade, edge, ink, photo backdrop
    ['#c2a062','#a4844a','#7a6034','#8a5a3e','#9a8a62'],['#caa96a','#ac8c50','#7e6438','#8c5640','#9c8e6c'],['#d2b276','#b29458','#846a3c','#904e40','#8e8e7c'],
    ['#dcc088','#bca064','#8a7044','#984a3e','#848c88'],['#e4cc98','#c4ac74','#907a4c','#9c443a','#7c8890'],['#ead6a8','#ccb684','#988458','#a03e36','#748494'],
    ['#f0e2bc','#d2c296','#9e8c64','#a43630','#6c7e94'],['#f4eacc','#d8cca6','#a4946c','#a8302a','#667a96']];
  const SLOTS=[];   // [x,y] for each poster, oldest first
  const cols=7,rows=3;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=CX0+2+c*21+Math.round((w4Hash(c,r+20)-.5)*5)+(r%2?6:0),y=CY0+2+r*25+Math.round(w4Hash(c+9,r)*3);if(x+31<=CX1&&y+38<=CY1)SLOTS.push([x,y]);}
  // draw order: back row first, so each row laps over the one above it; age falls row by row and across
  const order=SLOTS.map((s,i)=>i);const N=order.length;
  // four kinds of sheet, so the board reads as years of different hands: the printed MISSING bill, the typed sheet with a
  // black rule, the hand-lettered HELP, and a small index card. Text only: the missing stay offscreen.
  function sheet(x,y,W,H,A){g.globalAlpha=.45;P(x+2,y+H,W-1,2,'#322125');P(x+W,y+2,2,H,'#322125');g.globalAlpha=1;
    P(x,y,W,H,A[2]);P(x+1,y+1,W-2,H-2,A[0]);P(x+1,y+H-3,W-2,2,A[1]);P(x+W-2,y+1,1,H-2,A[1]);}
  function lines(x,y,W,n,k,col,gap){const L=[[4,7,3,6],[6,3,8],[3,5,4,5],[7,6],[5,2,7],[8,4]];for(let i=0;i<n;i++){const ln=L[(i+k)%L.length];let lx=x;for(const w of ln){if(lx+w>x+W)break;P(lx,y+i*(gap||2),w,1,col);lx+=w+2;}}}
  function poster(x,y,age,k,blank){const A=AGES[Math.min(AGES.length-1,Math.floor(age*AGES.length))];const ink=age<.3?'#5a4632':'#3a2e26';
    const kind=blank?'blank':['bill','typed','bill','help','card','bill','typed'][k%7];
    const W=kind==='card'?22:kind==='typed'?26:30,H=kind==='card'?16:kind==='typed'?34:36;
    sheet(x,y,W,H,A);if(kind==='blank')return [W,H];
    const AG=['6','7','8','9','10','11','12'][(k*3)%7];
    if(kind==='bill'){w4Text(P,x+2,y+3,'MISSING',age<.3&&k%2?'#4a3a2a':A[3]);
      const NM=[[8,6],[5,9],[10,4],[6,7],[9,5],[4,10],[7,8]][k%7];let xx=x+3;for(const w of NM){P(xx,y+11,w,2,ink);xx+=w+2;}
      w4Text(P,w4Text(P,x+3,y+16,'AGE',ink)+1,y+16,AG,ink);lines(x+3,y+23,W-6,1+(k%3),k,ink);w4Text(P,x+3,y+H-8,'OCT',A[3]);}
    else if(kind==='typed'){P(x+3,y+3,W-6,2,ink);lines(x+3,y+8,W-6,9,k,ink,2);w4Text(P,x+3,y+H-8,'OCT',ink);}
    else if(kind==='help'){const big=(xx,yy,str,col)=>{for(const ch of str){const gl=W4F[ch];for(let r=0;r<5;r++)for(let c=0;c<gl[r].length;c++)if(gl[r][c]==='#')P(xx+c*2,yy+r*2,2,2,col);xx+=gl[0].length*2+1;}};
      big(x+2,y+4,'HELP',A[3]);w4Text(P,w4Text(P,x+3,y+18,'AGE',ink)+1,y+18,AG,ink);lines(x+3,y+25,W-6,2,k,ink,3);}
    else {P(x+2,y+3,W-4,1,'#a84040');lines(x+3,y+6,W-6,3,k,ink,3);}
    if(age<.55){const cx=x+W-1,cy=y+H-1;for(let i=0;i<4;i++){P(cx-i,cy-3+i,1,4-i,A[1]);}P(cx-4,cy,4,1,A[2]);g.globalAlpha=.5;P(cx-3,cy+1,4,1,'#322125');g.globalAlpha=1;}
    if(age<.4){for(let i=0;i<2+(k%2);i++){const fx=x+3+Math.floor(w4Hash(k,i+40)*(W-8)),fy=y+3+Math.floor(w4Hash(k+3,i)*(H-8));P(fx,fy,2,1,A[1]);P(fx,fy+1,1,1,A[1]);}}
    return [W,H];}
  function pin(x,y,c){P(x+1,y+1,2,2,'#2a1c14');P(x,y,2,2,c[0]);P(x,y,1,1,c[1]);}
  const PINS=[['#b8302a','#e8786a'],['#3a5a9a','#8aa6d8'],['#c8a030','#f0d878'],['#4a7a44','#94c088']];
  order.forEach((i,j)=>{const [x,y]=SLOTS[i];const age=.85*j/N;const [w]=poster(x,y,age,i,false);pin(x+(w>>1)-1,y+1,PINS[i%4]);});
  // the store's LOST poster in the corner (the one you see from the floor), its face scratched out from inside the glass it hung in
  {Object.assign(W4F,{L:['#..','#..','#..','#..','###'],A:['.#.','#.#','###','#.#','#.#'],E:['###','#..','##.','#..','###'],'9':['###','#.#','###','..#','###']});
   const x=131,y=63,W=29,H=36;g.globalAlpha=.45;P(x+2,y+H,W-1,2,'#322125');P(x+W,y+2,2,H,'#322125');g.globalAlpha=1;
   P(x,y,W,H,'#a09474');P(x+1,y+1,W-2,H-2,'#e6dcc0');P(x+W-2,y+1,1,H-2,'#d0c4a4');w4Text(P,x+8,y+3,'LOST','#3a2e26');
   const px=x+7,py=y+10;P(px-1,py-1,16,15,'#9a9080');P(px,py,14,13,'#6e6e74');P(px,py+9,14,4,'#626268');   /* the photo box, flat grey */
   for(const [sx0,sy0,len] of [[2,1,9],[5,0,8],[1,5,7]]){for(let i=0;i<len;i++){P(px+sx0+i,py+sy0+i,2,1,'#a8a6a4');P(px+sx0+i,py+sy0+i+1,1,1,'#8a8a8e');}}   /* scratched out in three strokes, to the card */
   w4Text(P,x+7,y+H-9,'AGE 9','#3a2e26');P(x+13,y+1,3,2,'#c8c0a8');}
  // last year's: whole, on top, middle left
  poster(48,42,.97,12,false);pin(62,43,PINS[0]);
  // this year's: a clean blank sheet, taped at the top, the tape for the bottom already stuck on and folded back, waiting
  const bx=104,by=34;poster(bx,by,1,0,true);
  const tape=(x,y,w,h)=>{P(x,y,w,h,'#d8d0a8');P(x,y,w,1,'#ece6c8');P(x,y+h-1,w,1,'#b8b088');};
  tape(bx-2,by-2,9,4);tape(bx+23,by-2,9,4);tape(bx+1,by+33,7,3);tape(bx+22,by+33,7,3);
},null);}

// ---- Agnes's door: past her, down the hall, Ruth's door stands open and her room is kept the way it was. The bed is made,
// the doll sits on the pillow, the calendar on the wall is crossed off day by day into October and then stops.
Object.assign(W4F,{E:['###','#..','##.','#..','###'],R:['##.','#.#','##.','#.#','#.#'],B:['##.','#.#','##.','#.#','##.']});
function w4Door(){return st37Cv(176,112,(P,g)=>{
  // the hall: faded striped paper in the dim, a skirting board, the runner on the boards
  P(0,0,176,112,'#3e352e');for(let x=0;x<176;x+=6){P(x,0,2,98,'#463c34');P(x+3,0,1,98,'#362e28');}
  P(0,96,176,3,'#2a221c');P(0,99,176,13,'#4a3626');for(let y=101;y<112;y+=3)P(0,y,176,1,'#3e2c1e');
  // the doorway: inside it the room, lit by its own window
  const DX0=50,DX1=126,DY0=8,DY1=106;   // opening
  const BW=78;   // back wall bottom (the floor line)
  // back wall: old paper gone the colour of weak tea, a shade toward the corners; its sprigs in loose irregular clusters
  P(DX0,DY0,DX1-DX0,BW-DY0,'#a8967c');P(DX0,DY0,4,BW-DY0,'#988670');P(DX1-4,DY0,4,BW-DY0,'#988670');P(DX0,DY0,DX1-DX0,3,'#988670');
  for(let i=0;i<70;i++){const x=DX0+3+Math.floor(w4Hash(i,51)*(DX1-DX0-6)),y=DY0+5+Math.floor(w4Hash(i,53)*(BW-DY0-12)),v=i%4;
    if(v===0){P(x,y,1,2,'#8a7864');P(x+1,y,1,1,'#946c68');}else if(v===1){P(x,y,2,1,'#8a7864');P(x+1,y+1,1,1,'#946c68');}else if(v===2){P(x,y,1,1,'#946c68');P(x+1,y+1,1,1,'#8a7864');P(x-1,y+1,1,1,'#8a7864');}else P(x,y,1,1,'#8a7864');}
  P(DX0,BW-3,DX1-DX0,3,'#b8b0a2');P(DX0,BW-1,DX1-DX0,1,'#8a7e6c');   // skirting
  // the floor of the room: boards running away from you, lit pale where the window falls
  for(let y=BW;y<DY1;y++){const t=(y-BW)/(DY1-BW);P(DX0,y,DX1-DX0,1,t<.5?'#9a7048':'#8a6240');}
  for(let i=-4;i<=4;i++){const xa=88+i*6,xb=88+i*13;for(let y=BW;y<DY1;y++){const x=Math.round(xa+(xb-xa)*(y-BW)/(DY1-BW));if(x>DX0&&x<DX1)P(x,y,1,1,'#74502e');}}
  g.globalAlpha=.3;for(let y=BW+2;y<BW+20;y++){if(y===BW+10||y===BW+11)continue;const x0=58+(y-BW)*1.2,w=17;P(x0,y,7,1,'#e8f0f0');P(x0+9,y,w-9,1,'#e8f0f0');}g.globalAlpha=1;   /* the window's light on the boards, its glazing bars dark across it */   // the window's light on the boards
  // the rag rug
  for(let y=0;y<9;y++){const hw=Math.round(17*Math.sqrt(1-((y-4)/4.6)**2));const c=['#8a5a5a','#a88a6a','#6a7a8a','#a07060'][y%4];P(84-hw,92+y,hw*2,1,c);}
  P(70,96,1,1,'#5a3a2a');
  // the window (left), net curtains tied back
  const WX=56,WY=18;P(WX-1,WY-1,18,26,'#f0ece0');P(WX,WY,16,24,'#bcd0dc');P(WX,WY+12,16,12,'#c8d8d8');P(WX+7,WY,2,24,'#f0ece0');P(WX,WY+11,16,2,'#f0ece0');
  P(WX+1,WY+18,14,6,'#9ab08a');P(WX+1,WY+20,6,4,'#8aa078');   // a hedge outside
  for(const [cx,dir] of [[WX-3,1],[WX+15,-1]]){for(let y=0;y<28;y++){const w=y<16?4:Math.max(2,4-((y-16)>>2));P(cx+(dir<0?4-w:0),WY-3+y,w,1,y%5===0?'#e0dcd0':'#f4f0e6');}P(cx+1,WY+12,3,2,'#c08a8a');}   // curtains and their ties
  P(WX-4,WY-4,24,2,'#b8a888');   // the curtain rail
  // the calendar: a picture of an autumn tree, OCT, the days crossed off up to the 11th and then nothing
  const CX=73,CY=10,CW=31,CH=47;P(CX+1,CY+1,CW,CH,'#a89a74');P(CX,CY,CW,CH,'#ece2c6');P(CX,CY,CW,1,'#f6f0de');P(CX+CW-1,CY,1,CH,'#d0c4a4');P(CX,CY+CH-1,CW,1,'#d0c4a4');
  P(CX+14,CY-3,3,3,'#5a5048');P(CX+15,CY-2,1,1,'#8a8070');   /* the nail */
  P(CX+2,CY+2,CW-4,10,'#a8c0cc');P(CX+2,CY+9,CW-4,3,'#8a9a5a');P(CX+14,CY+6,2,4,'#5a3a24');   /* the picture: sky, field, a trunk */
  for(const [x,y,w,c] of [[CX+11,CY+2,8,'#e8a040'],[CX+9,CY+3,12,'#c86a2a'],[CX+8,CY+4,14,'#d88a34'],[CX+9,CY+6,12,'#b85a24']])P(x,y,w,2,c);
  {const big=(x,y,s,col)=>{for(const ch of s){const gl=W4F[ch];for(let r=0;r<5;r++)for(let c=0;c<gl[r].length;c++)if(gl[r][c]==='#')P(x+c*2,y+r*2,2,2,col);x+=gl[0].length*2+2;}};big(CX+5,CY+14,'OCT','#8a2a22');}
  const GX=CX+2,GY=CY+27;for(let d=0;d<31;d++){const c=(d+3)%7,r=Math.floor((d+3)/7);const x=GX+c*4,y=GY+r*2;if(r>4)continue;}
  for(let d=0;d<31;d++){const c=(d+3)%7,r=Math.floor((d+3)/7);const x=GX+c*4,y=CY+26+r*4;if(y+3>CY+CH-1)continue;P(x,y,3,3,'#dcd0b0');
    if(d<11){P(x,y,1,1,'#a83030');P(x+1,y+1,1,1,'#a83030');P(x+2,y+2,1,1,'#a83030');P(x+2,y,1,1,'#a83030');P(x,y+2,1,1,'#a83030');}}
  // the bed (right): white headboard against the wall, the quilt she made, the pillow, the doll sitting up
  const HX=104,HY=46;P(HX,HY,28,4,'#ccc2b2');P(HX+1,HY-2,26,2,'#ccc2b2');P(HX+4,HY-3,20,1,'#ccc2b2');P(HX,HY+4,28,22,'#b8ae9e');
  for(let x=HX+3;x<HX+28;x+=5)P(x,HY+5,2,20,'#a89e8e');P(HX,HY,1,26,'#948a7c');
  const QY=HY+16;   // quilt top surface, then its front edge hanging down
  const Q=['#9e7072','#74886a','#b4a68e','#707c98','#a28256'];
  for(let y=QY;y<QY+16;y++)for(let x=HX-6+((QY+16-y)>>2);x<DX1;x++){const qx=Math.floor((x-HX+12)/5),qy=Math.floor((y-QY)/4);P(x,y,1,1,Q[(qx+qy*2)%5]);}
  for(let y=QY+16;y<QY+25;y++)for(let x=HX-6;x<DX1;x++){const qx=Math.floor((x-HX+12)/5);P(x,y,1,1,['#7e5658','#566a50','#948670','#545e7a','#84663e'][(qx+1)%5]);}
  P(HX-6,QY+16,DX1-HX+6,1,'#cec2ac');P(HX-6,QY+25,DX1-HX+6,1,'#5a4a3a');   // the turned edge, the shadow under
  P(HX+3,HY+8,22,8,'#d8cfc0');P(HX+3,HY+14,22,2,'#b8ae9e');P(HX+4,HY+8,20,1,'#e8e0d2');   // the pillow
  // her cloth rabbit, sitting slumped against the pillow where she left it: long ears, one flopped, a button eye
  const RX=HX+11,RY=HY+4,FU='#9a7a64',FL='#b89a80',FD='#6e5444';
  P(RX,RY+8,10,9,FU);P(RX+1,RY+9,4,7,FL);P(RX+9,RY+9,1,8,FD);P(RX,RY+16,10,1,FD);   /* body, its lit side, its shade */
  P(RX+1,RY+2,8,7,FU);P(RX+2,RY+3,4,4,FL);P(RX+8,RY+3,1,6,FD);P(RX+3,RY+5,1,1,'#1e1618');P(RX+6,RY+5,1,1,'#1e1618');P(RX+4,RY+7,2,1,'#c07878');   /* head: two button eyes, a stitched nose */
  P(RX+2,RY-5,2,7,FU);P(RX+2,RY-4,1,5,'#d8a8a0');P(RX+6,RY-1,6,2,FU);P(RX+11,RY,2,4,FU);P(RX+7,RY-1,4,1,'#d8a8a0');   /* one ear up, one flopped over to the side */
  P(RX-2,RY+10,3,3,FU);P(RX+9,RY+10,3,3,FU);P(RX+1,RY+15,3,2,FL);P(RX+6,RY+15,3,2,FL);   /* paws, feet */
  for(const sx_ of [92,99]){P(sx_,99,6,3,'#5a2a24');P(sx_+1,98,4,1,'#3a1a16');P(sx_+1,99,3,1,'#24120e');P(sx_+4,100,2,1,'#8a4a3a');P(sx_,101,6,1,'#7a3a30');P(sx_,102,6,1,'#22140e');P(sx_+2,98,1,2,'#c8a050');}   /* small strapped shoes, buckles lit */
  // the door, swung in against the left wall of the room, its edge lit
  P(DX0,DY0,5,DY1-DY0,'#6e4a2e');P(DX0+5,DY0,1,DY1-DY0,'#9a6e44');
  // the frame of the doorway: painted trim, lit left, shade right, its shadow on the hall wall
  P(DX0-6,DY0-6,6,DY1-DY0+6,'#c8c0b0');P(DX1,DY0-6,6,DY1-DY0+6,'#a8a090');P(DX0-6,DY0-6,DX1-DX0+12,6,'#bcb4a4');
  P(DX0-6,DY0-6,1,DY1-DY0+6,'#e0d8c8');P(DX0-6,DY0-6,DX1-DX0+12,1,'#e0d8c8');P(DX1+5,DY0-6,1,DY1-DY0+6,'#7a7468');P(DX0-1,DY0-1,1,DY1-DY0+1,'#8a8478');
  g.globalAlpha=.5;P(DX1+6,DY0-4,3,DY1-DY0+4,'#1e1814');g.globalAlpha=1;
  // the room's light spilling out onto the hall boards
  g.globalAlpha=.22;for(let y=DY1;y<112;y++){const s=(y-DY1);P(DX0-s,y,DX1-DX0+s*2,1,'#ffe8b0');}g.globalAlpha=1;
},null);}

// ---- the cabin window, your first night: the field and the scarecrow under a thin moon, and across the valley the town's
// lit windows, which go out one at a time (the close-up's fx lays the dark copy over each in turn; the church's goes last)
function w4Night(allDark){const wins=[];const c=st37Cv(176,112,(P,g)=>{
  // the log wall round the window, barely lit from the room behind you
  P(0,0,176,112,'#1e140e');for(let y=0;y<112;y+=8){P(0,y,176,1,'#120c08');P(0,y+1,176,1,'#2a1c12');}
  const WX0=22,WX1=154,WY0=8,WY1=98;   // the glass
  // sky: deep blue to a lighter band over the hills; a thin moon; a few stars, placed, not sprinkled
  {const SK=['#111828','#131b2e','#151e33','#172138','#1a253e','#1d2944','#212e4a'];for(let y=WY0;y<WY1;y++){const t=Math.min(SK.length-1,Math.floor((y-WY0+((y*7)%3))/6.5));P(WX0,y,WX1-WX0,1,SK[t]);}}
  for(const [x,y] of [[36,16],[61,12],[79,22],[117,14],[140,24],[49,30],[104,27]])P(x,y,1,1,'#c8d0e0');P(131,13,1,1,'#e8ecf4');
  P(134,16,4,1,'#e8e4c8');P(136,17,3,1,'#e8e4c8');P(137,18,3,2,'#e8e4c8');P(136,20,3,1,'#e8e4c8');P(134,21,4,1,'#e8e4c8');   /* the moon, a sliver */
  // the far hills
  for(let x=WX0;x<WX1;x++){const h=Math.round(46-6*Math.sin((x-WX0)/22)-3*Math.sin((x-WX0)/9+1));P(x,h,1,60-h,'#141c2a');P(x,h,1,1,'#26324a');}
  // the town across the valley: roofs, the church with its steeple, lit windows
  // each house its own shape: gables, a hip roof, a barn's gambrel, a flat-topped store, a two-storey house; chimneys on some
  const HS=[[33,12,58,'gable',1,1],[47,9,57,'hip',1,0],[58,16,55,'gambrel',1,0],[86,10,57,'gable',1,1],[98,13,53,'two',2,1],[113,14,58,'flat',1,0],[129,10,56,'gable',1,0],[141,9,58,'hip',1,1]];
  const WALL='#182030',WEDGE='#222c40',ROOF='#101622',RLIT='#3a4866',RDIM='#2a3650';
  for(const [x,w,y,t,st,ch] of HS){P(x,y,w,64-y,WALL);P(x+w-1,y,1,64-y,WEDGE);
    if(t==='gable'||t==='two'){const hh=Math.ceil(w/2.4);for(let i=0;i<w;i++){const ry=Math.round(y-Math.min(i,w-1-i)*hh/(w/2));P(x+i,ry,1,y-ry+1,ROOF);P(x+i,ry,1,1,i>=w/2?RLIT:RDIM);}}
    else if(t==='hip'){for(let r=0;r<4;r++){P(x+r,y-r,w-r*2,1,r===3?RLIT:ROOF);}P(x+w-4,y-3,1,4,RDIM);}
    else if(t==='gambrel'){for(let i=0;i<w;i++){const d=Math.min(i,w-1-i),ry=d<4?y-d*2:y-8-Math.floor((d-4)/2);P(x+i,ry,1,y-ry+1,ROOF);P(x+i,ry,1,1,i>=w/2?RLIT:RDIM);}}
    else if(t==='flat'){P(x-1,y-2,w+2,2,ROOF);P(x-1,y-2,w+2,1,RDIM);P(x+2,y+1,w-4,1,RDIM);}
    if(ch){const cx=x+Math.floor(w*.7);P(cx,y-7,2,5,ROOF);P(cx+1,y-7,1,5,RDIM);}}
  const CHX=74,CHY=50;P(CHX,CHY,10,14,'#141c2a');P(CHX+9,CHY,1,14,'#2a3650');P(CHX+3,CHY-14,4,14,'#101622');P(CHX+6,CHY-14,1,14,'#2a3650');P(CHX+4,CHY-20,2,6,'#101622');P(CHX+5,CHY-20,1,6,'#3a4866');P(CHX+4,CHY-23,2,3,'#101622');P(CHX+3,CHY-21,4,1,'#101622');   /* the church and its steeple, a cross on top */
  P(CHX+4,CHY-9,2,3,'#1a2234');   /* the belfry opening */
  P(WX0,64,WX1-WX0,3,'#0e1420');   /* the street line */
  const W=[[36,60],[41,60],[50,60],[62,60],[69,59],[89,60],[93,60],[101,56],[106,56],[101,60],[116,60],[122,60],[132,60],[144,60]];
  W.forEach(([x,y],i)=>wins.push([x,y,3,3]));wins.push([CHX+4,CHY+3,2,5]);   /* the church window last */
  for(const [x,y,w,h] of wins){if(allDark){P(x,y,w,h,'#1a2030');continue;}
    g.globalAlpha=.28;P(x-1,y-1,w+2,h+2,'#d8a048');g.globalAlpha=1;P(x,y,w,h,'#f0c868');P(x,y,w,1,'#fae8a8');P(x,y+h-1,w,1,'#d89a40');}
  // the near field: ploughed rows running away toward the town (earth, not water), each ridge catching the moon on its right
  // side, stubble standing in them; lighter round the scarecrow's post so the post stands against it
  P(WX0,66,WX1-WX0,WY1-66,'#16150f');
  P(WX0,66,WX1-WX0,5,'#13130e');for(let r=-11;r<=11;r++){const xt=88+r*5;for(let y=71;y<WY1;y++){const t=(y-66)/(WY1-66),x=Math.round(xt+r*t*t*26+r*t*10);if(x<WX0||x>=WX1)continue;P(x,y,1,1,'#262a26');if(t>.25&&x+1<WX1)P(x+1,y,1,1,'#30363a');}}
  for(let i=0;i<40;i++){const t=.3+w4Hash(i,61)*.7,r=Math.floor(w4Hash(i,63)*22)-11,y=Math.round(66+t*(WY1-66)),x=Math.round(88+r*5+r*t*t*26+r*t*10);if(x<WX0+1||x>=WX1-1||y>=WY1-1)continue;P(x,y-1-(t>.7?1:0),1,1+(t>.7?1:0),'#3c4038');}
  for(let x=WX0+4;x<WX1;x+=14){P(x,74,2,9,'#0a0e14');P(x+1,74,1,9,'#26303c');}P(WX0,76,WX1-WX0,1,'#0a0e14');P(WX0,75,WX1-WX0,1,'#202a36');
  // the scarecrow on its post, a silhouette with the moon on its right edge: a wide-brimmed hat, a sack head tipped to one side,
  // a coat with a ragged hem, straw hanging from both cuffs
  {const K='#080b10',R='#2c3850',X=58;
   P(X-1,86,2,12,K);P(X-12,76,25,2,K);   /* the post and the crossbar */
   P(X-4,77,9,10,K);P(X-5,84,11,2,K);P(X-5,86,2,1,K);P(X-1,86,2,2,K);P(X+3,86,2,1,K);   /* the coat, its ragged hem */
   P(X-11,75,8,3,K);P(X+4,75,8,3,K);   /* the sleeves along the bar */
   for(const [x,l] of [[X-12,4],[X-10,3],[X-11,2],[X+10,3],[X+12,4],[X+11,2]])P(x,78,1,l,K);   /* straw hanging from the cuffs */
   P(X-2,69,6,7,K);P(X-3,70,1,5,K);P(X+3,75,1,1,K);   /* the sack head, tipped */
   P(X-6,68,13,2,K);P(X-3,64,7,4,K);P(X-2,63,5,1,K);   /* the hat: a wide brim, the crown */
   P(X+4,64,1,4,R);P(X+7,68,1,1,R);P(X+4,69,1,6,R);P(X+5,77,1,9,R);P(X+12,76,1,1,R);P(X+1,87,1,9,R);}
  // the frame: sash and mullions, lit a little on the room side
  const F='#3a2618',FL='#5a3c24',FD='#22160c';
  P(WX0-6,WY0-6,WX1-WX0+12,6,F);P(WX0-6,WY1,WX1-WX0+12,8,F);P(WX0-6,WY0,6,WY1-WY0,F);P(WX1,WY0,6,WY1-WY0,F);
  P(WX0-6,WY0-6,WX1-WX0+12,1,FL);P(WX0-6,WY1,WX1-WX0+12,1,FL);P(WX0-1,WY0,1,WY1-WY0,FD);P(WX1,WY0,1,WY1-WY0,FL);
  P(87,WY0,3,WY1-WY0,F);P(87,WY0,1,WY1-WY0,FL);P(WX0,30,WX1-WX0,3,F);P(WX0,30,WX1-WX0,1,FL);P(WX0,32,WX1-WX0,1,FD);
  P(WX0-10,WY1+8,WX1-WX0+20,4,'#4a3020');P(WX0-10,WY1+8,WX1-WX0+20,1,'#6a4630');   /* the sill */
});c.w4wins=wins;return c;}
