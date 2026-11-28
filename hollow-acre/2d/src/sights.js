/* ================= #268 show it, don't tell it. When the story sent you somewhere to find something (the deer behind the barn,
   the open grave, the coffins, the cold house, the pantry jars, the well, the orchard, the quarry, the scarecrow, the rehearsal) a
   card used to describe what you saw. Now the view zooms in on the thing itself, the same close-up as reading a gravestone (the
   world blurred behind it): the deer's heart is still beating and the flies lift off it, the carcasses drip, the bucket comes up
   with the braid in it. Only what the picture can't say stays underneath, in a line. Anything with writing on it (the register,
   the ledgers, the lists, the Covenant) still reads as before. A carcass you stumble on out in the fields does the same the first
   time you find that kind. ================= */
const SGT={};
const sgtC=(key,w,h,fn)=>{if(SGT[key])return SGT[key];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const P=(x,y,ww,hh,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),ww||1,hh||1);};fn(P,g,w,h);return SGT[key]=c;};
// the game's own sprites, laid together in one picture
function sgtSprites(key,list,paint){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const [n,dx,dy] of list){const m=SPR[n];if(!m)continue;x0=Math.min(x0,dx-m.ax);y0=Math.min(y0,dy-m.ay);x1=Math.max(x1,dx-m.ax+m.fw);y1=Math.max(y1,dy-m.ay+m.fh);}
  if(x0>x1)return null;return sgtC(key,Math.ceil(x1-x0),Math.ceil(y1-y0),(P,g)=>{const pos={};for(const [n,dx,dy] of list){const m=SPR[n],im=m&&IMG[m.src];if(!im)continue;const X=Math.round(dx-m.ax-x0),Y=Math.round(dy-m.ay-y0);pos[n]=[X,Y];g.drawImage(im,0,0,m.fw,m.fh,X,Y,m.fw,m.fh);}
    if(paint)paint(P,pos);});}
// ---- the drawn sights (64 x 56 or so, lit from the top left, a bold dark outline, a few tones a colour)
const SGT_DRAW={
  // the well bucket: wet staves and iron hoops, tea-coloured water, a long braid looped over the rim, a brass tag on it
  well:()=>sgtC('well',64,56,(P)=>{const W=['#20140c','#3a2616','#5a3c22','#7a5432','#9a6e44'],I=['#14141a','#2e3038','#4a4e58','#6a707c'];
    for(let y=14;y<52;y++){const t=(y-14)/38,hw=Math.round(20-t*4);for(let x=-hw;x<=hw;x++){const u=x/hw;P(32+x,y,1,1,(x+hw)%7===0?W[0]:W[u<-.6?3:u<.3?2:1]);}P(32-hw-1,y,1,1,'#0a0604');P(32+hw+1,y,1,1,'#0a0604');}
    for(const y of [18,34,48])for(let x=-20;x<=20;x++)P(32+x,y,1,2,I[Math.abs(x)>16?1:x<0?3:2]);
    for(let x=-19;x<=19;x++){const e=1-(x/19)**2;P(32+x,15,1,1,'#5a4a2a');P(32+x,14,1,1,'#7a6a3a');}P(13,13,38,1,'#0a0604');
    for(let x=12;x<30;x++)P(x,12-Math.round(Math.sin((x-12)/18*Math.PI)*8),1,1,I[2]);   // the handle
    // the braid: hair the colour of straw, plaited, hanging over the rim and down the side
    for(let i=0;i<34;i++){const x=40+Math.sin(i*.35)*2,y=12+i;P(x,y,3,1,i%3===0?'#7a5a2a':'#c8a050');P(x+1,y,1,1,'#e8c878');}
    P(39,44,6,4,'#c89a3c');P(39,44,6,1,'#f0d070');P(40,46,4,1,'#6a4c14');}),
  // the orchard: a bare branch hung with red apples, every one bitten, a milk tooth still in the lowest
  orchard:()=>sgtC('orchard',64,56,(P)=>{const B=['#1a120c','#2e2014','#46301c'];for(let i=0;i<60;i++){P(2+i,10+Math.round(Math.sin(i*.08)*4),1,3,B[i%7===0?2:1]);}
    for(const [x,y] of [[16,30],[36,24],[52,34],[28,44]]){P(x,14,1,y-18,B[1]);
      for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++){const d=Math.hypot(i,j*1.05);if(d>6.2)continue;const u=(i+j)/12;P(x+i,y+j,1,1,d>5.4?'#3a0c0a':u<-.3?'#d8483a':u<.2?'#b02c22':'#7a1a14');}
      for(let j=-3;j<=2;j++)for(let i=1;i<=6;i++){if(Math.hypot(i-5,j)<3.4)P(x+i,y+j-1,1,1,i>4?'#2a0a08':'#f0e6c8');}P(x+3,y-3,2,1,'#f6f0dc');P(x+3,y+1,2,1,'#f6f0dc');}   // the bite: cream flesh, two tooth-marks
    P(30,46,3,4,'#f8f4ea');P(30,46,3,1,'#ffffff');P(31,49,1,2,'#c8b8a0');}),
  // the quarry face: a hollow cut the shape of a person, the rock inside scratched, three pink nails in the stone
  quarry:()=>sgtC('quarry',56,64,(P)=>{const R=['#2a2a30','#3e3e46','#56565e','#706e76','#8a8890'];for(let y=0;y<64;y++)for(let x=0;x<56;x++){const v=2.4+Math.sin(x*.4+y*.13)*.5-(y/64)*.6+(((x*7+y*3)%17)===0?-1:0);P(x,y,1,1,R[Math.max(0,Math.min(4,Math.round(v)))]);}
    const fig=(x,y)=>{const hx=28,hy=12;if(Math.hypot(x-hx,y-hy)<6)return true;if(y>=17&&y<=46&&Math.abs(x-28)<=(y<40?8:6))return true;if(y>46&&y<62&&(Math.abs(x-24)<3||Math.abs(x-32)<3))return true;if(y>=19&&y<=42&&(Math.abs(x-18)<2||Math.abs(x-38)<2))return true;return false;};
    for(let y=0;y<64;y++)for(let x=0;x<56;x++){if(!fig(x,y))continue;const edge=!fig(x-1,y)||!fig(x,y-1);const edge2=!fig(x+1,y)||!fig(x,y+1);P(x,y,1,1,edge?'#14141a':edge2?R[4]:R[0]);if(!edge&&!edge2&&((x+y*2)%5===0))P(x,y,1,1,R[2]);}   // the hollow, its scratches all running out
    for(const [x,y] of [[20,30],[36,26],[23,41]]){P(x,y,2,3,'#e870a0');P(x,y,2,1,'#ffb0d0');}P(36,26,1,1,'#ffffff');}),
  // the scarecrow on its pole: the head turned right round, the burlap face dark and wet
  scare:()=>sgtC('scare',56,64,(P)=>{const S=['#3a2a10','#5a4418','#7a5e24','#9a7a34','#bc9a4a'];P(26,22,4,42,'#2a1a0c');P(27,22,1,42,'#4a3018');
    for(let y=24;y<44;y++){const hw=Math.round(10-(y-24)*.2);for(let x=-hw;x<=hw;x++)P(28+x,y,1,1,S[(x+y)%5===0?1:x<0?3:2]);}   // the coat, straw poking out
    for(const [x,y] of [[16,40],[38,42],[24,46]])P(x,y,4,1,S[4]);
    for(let j=-9;j<=9;j++)for(let i=-9;i<=9;i++){const d=Math.hypot(i,j);if(d>9)continue;const u=(i+j)/18;P(28+i,14+j,1,1,d>8.2?'#140c06':u<-.3?S[4]:u<.2?S[3]:S[2]);}   // the sack head
    for(let j=2;j<9;j++)for(let i=-6;i<=4;i++){if(Math.hypot(i,j-3)<5.5)P(28+i,14+j,1,1,j<5?'#4a1e14':'#3a120c');}P(23,19,2,4,'#5a1408');P(30,20,1,5,'#5a1408');   // the face, soaked dark from the inside, running
    P(19,6,18,2,'#2a1a0c');P(16,8,24,2,'#4a3418');P(16,8,24,1,'#6a4c24');P(25,3,6,4,'#4a3418');P(25,3,6,1,'#6a4c24');P(26,8,4,1,'#a02818');}),   // the hat, its red band
  // the rehearsal: a straw dummy on the altar steps in your clothes, a face painted on a flour sack
  rehearsal:()=>sgtC('rehearsal',56,64,(P)=>{const L=(typeof S!=='undefined'&&S.look)||{};const top=/^#[0-9a-f]{6}$/i.test(L.shirt||'')?L.shirt:'#a83a2a';
    for(let y=52;y<64;y++)P(0,y,56,1,y===52?'#6a5a4a':y<58?'#4a3a2e':'#3a2e24');for(let x=0;x<56;x+=8)P(x,53,1,5,'#2a2018');   // the altar steps
    P(18,26,20,20,'#120c08');P(19,27,18,18,top);P(19,27,18,2,'#ffffff30');for(let y=29;y<45;y+=4)P(19,y,18,1,'#00000030');   // your shirt
    P(20,46,6,7,'#2a2a3a');P(30,46,6,7,'#2a2a3a');P(12,28,7,3,top);P(37,28,7,3,top);for(const [x,y] of [[11,31],[44,31],[24,52],[32,52]])P(x,y,2,3,'#c8a050');   // straw where the hands and feet should be
    P(17,6,22,20,'#120c08');P(18,7,20,18,'#e8e0cc');P(18,7,20,2,'#f6f0e2');   // the flour sack
    P(22,12,3,3,'#1a1a24');P(31,12,3,3,'#1a1a24');P(23,19,10,1,'#7a2420');P(24,20,8,1,'#7a2420');P(27,15,2,3,'#c8a090');}),
};
// ---- close-ups drawn at the viewer's own scale (one pixel here is one pixel of the zoom, like the gravestones)
const sgtT=(P,str,x,y,col,sc)=>{sc=sc||1;let X=x;for(const ch of String(str).toUpperCase()){const f=(typeof PXFONT!=='undefined'&&PXFONT[ch])||null;if(!f){X+=3*sc;continue;}for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1')P(X+i*sc,y+j*sc,sc,sc,col);X+=4*sc;}return X;};
const sgtName=()=>String((typeof NAME==='function'&&NAME())||'YOU').toUpperCase().replace(/[^A-Z ]/g,'').slice(0,9)||'YOU';
const SGT_DIRT=['#1c120a','#2c1c10','#3e2a18','#523a22','#6a4c2e','#84603a'],SGT_GRASS=['#22200f','#2e2c16','#3c3a1e','#4c4826'];
// looking down into an open grave: autumn grass round it, the far wall's face in two browns with its lip lit, a dark floor, a heap of spoil and a spade in it
const sgtShade=(hex,f)=>{const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255,m=v=>Math.max(0,Math.min(255,Math.round(f<1?v*f:v+(255-v)*(f-1))));return '#'+[m(r),m(g),m(b)].map(v=>v.toString(16).padStart(2,'0')).join('');};
function sgtPit(P,w,h,px,py,pw,ph,seed){for(let y=0;y<h;y++)for(let x=0;x<w;x++){const band=Math.sin(x*.05+y*.09+seed)+Math.sin(x*.11-y*.04);P(x,y,1,1,SGT_GRASS[band>.6?2:1]);}
  for(let i=0;i<14;i++){const tx=(i*53+seed*17)%w,ty=(i*29+seed*7)%h;if(tx>px-4&&tx<px+pw+4&&ty>py-4&&ty<py+ph+4)continue;for(const [dx,dy] of [[0,0],[1,-1],[2,0],[-1,0],[1,-2]])P(tx+dx,ty+dy,1,1,SGT_GRASS[3]);P(tx,ty+1,3,1,SGT_GRASS[0]);}
  for(let x=px-1;x<=px+pw;x++){P(x,py-2,1,2,SGT_GRASS[3]);}P(px-1,py-1,pw+2,1,'#8a7a50');   // the far lip, catching the light
  const wall=Math.round(ph*.26);for(let y=py;y<py+wall;y++)for(let x=px;x<px+pw;x++){const strata=((y-py)%4===0)||((x*3+y)%17===0);P(x,y,1,1,SGT_DIRT[strata?2:(y-py)<2?4:3]);}
  for(let y=py+wall;y<py+ph;y++)for(let x=px;x<px+pw;x++)P(x,y,1,1,SGT_DIRT[((x+y*3)%11===0)?2:1]);for(let y=py;y<py+ph;y++){P(px,y,1,1,SGT_DIRT[0]);P(px+pw-1,y,1,1,SGT_DIRT[0]);}P(px,py+ph-1,pw,1,SGT_DIRT[0]);
  P(px-1,py+ph,pw+2,2,SGT_GRASS[0]);}
function sgtSpoil(P,cx,cy,rx,ry){for(let x=-rx-2;x<=rx+2;x++){const w=Math.round(3*Math.sqrt(Math.max(0,1-(x/(rx+2))**2)));P(cx+x,cy+ry-2,1,w+1,'rgba(0,0,0,.32)');}for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++){const e=(x/rx)**2+(y/ry)**2;if(e>1)continue;const h=1-e,u=(x+y*1.4)/(rx+ry);P(cx+x,cy+y,1,1,SGT_DIRT[e>.88?1:u<-.45&&h>.3?5:u<-.1?4:u<.35?3:2]);}
  for(const [dx,dy] of [[-rx*.5,-ry*.2],[rx*.3,-ry*.5],[rx*.1,ry*.3],[-rx*.2,ry*.5]]){P(cx+dx,cy+dy,3,2,SGT_DIRT[1]);P(cx+dx,cy+dy,2,1,SGT_DIRT[5]);}}
function sgtSpade(P,x,y){for(let i=0;i<26;i++)P(x+i*.5,y-i,2,1,i<3?'#5a3a1c':'#7a5432');P(x+12,y-27,7,2,'#3a2614');P(x-3,y,7,8,'#5a5e66');P(x-3,y,7,1,'#9aa0aa');P(x-3,y+7,7,1,'#2a2c30');}
const SGT_ART={
  // the small grave: a bundle wrapped in a bedsheet, soaked through dark from the inside, a jar label on a string: FOR LATER
  graves:()=>sgtC('a_graves',156,104,(P)=>{sgtPit(P,156,104,24,26,92,62,3);sgtSpoil(P,132,66,20,14);sgtSpade(P,136,62);
    const cx=70,cy=64;const half=x=>x<-20?7.5-((x+26)/6)**2*1.5:x<-16?5:x<10?8.5-Math.abs(x+3)*.04:x<22?7-((x-10)/12)*2:5-((x-22)/4)*3;   // head, the narrow tie at the neck, the body, the legs, the feet
    for(let x=-26;x<=26;x++){const hw=half(x);for(let y=-Math.ceil(hw);y<=hw;y++){const e=Math.abs(y)/hw;const soak=Math.max(0,1-Math.hypot((x+2)/13,(y-1)/6.5));const fold=((x*2+y*5+80)%11===0);
      let c=e>.84?'#6a645a':y<-hw*.4?'#e6e0d2':y<hw*.3?'#cfc8b8':'#aaa290';if(fold)c='#9a9282';if(soak>.55)c=soak>.82?'#2e0804':'#561812';else if(soak>.3)c='#86463a';P(cx+x,cy+y,1,1,c);}}
    for(const x of [cx-17,cx+10,cx+21])P(x,cy-Math.round(half(x-cx)),2,Math.round(half(x-cx)*2)+1,'#8a8070');   // the ties
    for(let i=0;i<8;i++)P(cx+2+i,cy-6-i*.6,1,1,'#c8b88a');   // the string
    P(cx+9,cy-24,24,15,'#1a120a');P(cx+10,cy-23,22,13,'#f2ead2');P(cx+10,cy-23,22,1,'#ffffff');sgtT(P,'FOR',cx+15,cy-21,'#2a1a2e');sgtT(P,'LATER',cx+11,cy-15,'#2a1a2e');}),
  // your grave: you, older, in the clothes you have on; the face gone to the bone and grinning; a folded note in the hand
  yourgrave:()=>sgtC('a_yourgrave2',168,104,(P)=>{sgtPit(P,168,104,14,22,124,64,7);sgtSpoil(P,150,30,16,12);sgtSpade(P,146,28);
    const L=(typeof S!=='undefined'&&S.look)||{},top=/^#[0-9a-f]{6}$/i.test(L.shirt||'')?L.shirt:'#a83a2a',T=[sgtShade(top,.45),sgtShade(top,.7),top,sgtShade(top,1.25)];const y0=60,o='#120c08';
    // the skull on its neck, a fringe of grey hair round it
    for(let y=-7;y<=7;y++)for(let x=-7;x<=7;x++){const e=(x/7)**2+(y/7)**2;if(e>1)continue;P(30+x,y0+y,1,1,e>.8?'#8a8274':x+y<-3?'#f2e8d0':'#d8ccb0');}
    for(let a=-2.4;a<=2.4;a+=.12){P(30+Math.cos(a+Math.PI)*8,y0+Math.sin(a+Math.PI)*8,2,2,a>-1&&a<1?'#a8a8a4':'#cacac6');}
    P(26,y0-2,3,3,'#1a120a');P(32,y0-2,3,3,'#1a120a');P(29,y0+1,2,2,'#3a2a1a');for(let x=26;x<35;x+=2){P(x,y0+4,1,2,'#fff6e0');P(x+1,y0+4,1,2,'#3a2a1a');}
    P(37,y0-2,5,5,'#c8bca0');P(37,y0-2,5,1,'#e8dcc0');   // the neck
    // the flannel shirt: collar, body, two sleeves; checks in two close reds; a fold down the middle; lit from the left
    for(let y=-11;y<=11;y++)for(let x=42;x<86;x++){const edge=x===42||x===85||Math.abs(y)===11;const ck=((x>>2)+((y+12)>>2))%2===0;let t=ck?2:1;if(x<48)t++;if(y>6)t--;if(x===64)t=0;P(x,y0+y,1,1,edge?o:T[Math.max(0,Math.min(3,t))]);}
    P(42,y0-4,7,9,T[3]);P(43,y0-3,5,7,T[2]);P(42,y0-4,7,1,o);   // the collar
    for(const sy of [-1,1]){for(let x=46;x<76;x++){const y=y0+sy*13;P(x,y-2,1,5,x===46?o:((x>>2)%2?T[1]:T[2]));P(x,y-2,1,1,o);P(x,y+2,1,1,o);}}   // the sleeves, down at its sides
    P(74,y0-15,6,4,'#d8ccb0');P(74,y0+12,6,4,'#d8ccb0');   // the bony hands at the cuffs
    // one hand drawn up onto the chest, holding the folded note
    for(let x=56;x<72;x++)P(x,y0-6+Math.round((x-56)*.3),1,4,T[1]);P(70,y0-2,6,5,'#d8ccb0');P(64,y0-6,14,10,o);P(65,y0-5,12,8,'#f2ead2');P(65,y0-5,12,1,'#ffffff');P(70,y0-5,1,8,'#c8c0a8');
    // jeans: two legs, a seam each, lit along the top; boots at the foot end
    for(const sy of [-5,5])for(let x=86;x<122;x++)for(let y=-4;y<=4;y++){const yy=y0+sy+y;P(x,yy,1,1,Math.abs(y)===4?'#141c2c':y<-1?'#4a5a7a':y===1?'#22304a':'#2e3e5e');}
    for(const sy of [-5,5]){P(122,y0+sy-5,9,10,o);P(123,y0+sy-4,7,8,'#3a2614');P(123,y0+sy-4,7,2,'#5a3c22');}
    // the far wall's shadow over the upper body
    for(let y=y0-14;y<y0-4;y++)for(let x=16;x<132;x++)if(((x+y)&1)===0)P(x,y,1,1,'rgba(0,0,0,.18)');}),
  // under the church: rows of small coffins with their lids off, and at the front one full-sized, new, brass-handled, your name on its plate
  crypt:()=>sgtC('a_crypt',168,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<168;x++)P(x,y,1,1,(x%16===0||y%12===0)?'#16141a':((x*5+y*7)%31===0)?'#2a2830':'#201e26');
    const W=['#2a1a0e','#3e2814','#56381c','#6e4a26','#8a5e32'];
    const coffin=(x,y,w,h,fill,lid)=>{for(let j=0;j<h;j++){const u=j/h,ww=Math.round(w*(u<.28?.72+u:1.06-(u-.28)*.55));for(let i=0;i<ww;i++){const X=x+Math.round((w-ww)/2)+i;P(X,y+j,1,1,(i===0||i===ww-1||j===0||j===h-1)?'#120c08':fill(i,j,ww,h));}}
      if(lid){for(let j=0;j<h;j++){const u=j/h,ww=Math.round(w*(u<.28?.72+u:1.06-(u-.28)*.55)*.7);for(let i=0;i<ww;i++)P(x+w+2+i+Math.round(j*.15),y+j+2,1,1,(i===0||i===ww-1)?'#120c08':W[2]);}
        for(let k=0;k<3;k++)P(x+w+4+k*2,y+5,1,h-8,'#8a6a4a');}};   // the lid leaning beside it, scratched inside
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const sc=.6+r*.14,w=Math.round(14*sc+4),h=Math.round(22*sc+4),x=6+c*(w+14)+r*2,y=4+r*20;
      coffin(x,y,w,h,(i,j,ww,hh)=>(i<2||j<2)?W[3]:(i>ww-3||j>hh-3)?W[0]:'#0c0a0c',true);}
    // the big one: pale new wood, brass handles, the plate
    // the big one, lying across the front: six-sided, narrow at the head, widest at the shoulders, new pale wood lit along its lid, brass handles, the plate
    const bx=88,by=56,bw=74,bh=40,hw=x=>{const u=x/bw;return u<.3?.62+u*1.27:1-(u-.3)*.55;};
    for(let x=0;x<bw;x++){const half=Math.round(bh/2*hw(x));P(bx+x+3,by+20+half+1,1,3,'rgba(0,0,0,.45)');}   // its shadow on the floor
    for(let x=0;x<bw;x++){const half=Math.round(bh/2*hw(x));for(let y=-half;y<=half;y++){const edge=Math.abs(y)===half||x===0||x===bw-1;const v=y<-half+4?'#ecc890':y<-half*.2?(x%11===0?'#c49660':'#d8ac72'):y<half-4?'#b88650':'#8e6236';P(bx+x,by+20+y,1,1,edge?'#120c08':v);}}
    for(let x=4;x<bw-4;x++){const half=Math.round(bh/2*hw(x));P(bx+x,by+20-half+3,1,1,'#f6dca8');}
    for(const hx of [bx+18,bx+44])P(hx,by+20+Math.round(bh/2*hw(hx-bx))-3,8,3,'#c89a3c');
    P(bx+20,by+12,36,14,'#4a300c');P(bx+21,by+13,34,12,'#e8c060');P(bx+21,by+13,34,1,'#fff2c8');P(bx+21,by+24,34,1,'#a87a28');
    const n=sgtName();sgtT(P,n,bx+38-n.length*2,by+16,'#4a300c');}),
  // Ida's pantry: jars of teeth sorted by size, eyes turning in brine, a jar of hair, each with a year; and an empty one with a fresh label: yours
  jars:()=>sgtC('a_jars',150,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<150;x++)P(x,y,1,1,(x%24===0)?'#2a1e14':'#3a2a1c');
    for(const sy of [44,96]){P(4,sy,142,5,'#5a3c22');P(4,sy,142,1,'#8a6440');P(4,sy+5,142,2,'#140c06');}
    const jar=(x,y,fill,lab,draw)=>{P(x,y-34,22,34,'#140c06');for(let yy=y-33;yy<y-1;yy++)for(let xx=x+1;xx<x+21;xx++)P(xx,yy,1,1,yy<y-27?'#8a9a9a':fill);P(x+2,y-33,2,31,'#c8d8d4');P(x+1,y-37,20,4,'#5a5e66');P(x+1,y-37,20,1,'#9aa0aa');
      draw&&draw(x,y);if(lab){P(x+3,y-16,16,9,'#f0e6c8');sgtT(P,lab,x+3,y-14,'#3a2a1a');}};
    jar(10,44,'#3a3a24',"52",(x,y)=>{for(let i=0;i<9;i++)P(x+4+(i%4)*4,y-26+Math.floor(i/4)*4,2,3,'#f4eedc');});   // milk teeth
    jar(40,44,'#6a6a3a',"74",(x,y)=>{for(const [dx,dy,c] of [[5,-24,'#4a7aa8'],[13,-22,'#6a4a2a'],[8,-12,'#4a7aa8']]){P(x+dx,y+dy,5,5,'#e8e4d8');P(x+dx+1,y+dy+1,3,3,c);P(x+dx+2,y+dy+2,1,1,'#0a0a0a');}});   // eyes, pale blue and brown
    jar(70,44,'#3a2a1a',"81",(x,y)=>{for(let i=0;i<12;i++)P(x+4+i,y-25+Math.sin(i)*3,1,8,'#c8a050');});   // a twist of hair
    jar(100,44,'#3a3a24',"99",(x,y)=>{for(let i=0;i<14;i++)P(x+3+(i%5)*3,y-27+Math.floor(i/5)*4,2,2,'#f4eedc');});   // more teeth, smaller
    jar(14,96,'#6a6a3a',"64",(x,y)=>{for(const [dx,dy] of [[6,-24],[12,-14]]){P(x+dx,y+dy,5,5,'#e8e4d8');P(x+dx+1,y+dy+1,3,3,'#6a4a2a');}});
    jar(44,96,'#5a1a14',"88",(x,y)=>{P(x+6,y-22,9,10,'#8a2a20');P(x+7,y-21,4,3,'#c84a3a');});   // something red
    // the empty one, its label fresh and white, with your name
    P(96,96-36,30,36,'#140c06');for(let yy=96-35;yy<95;yy++)P(97,yy,28,1,yy<96-29?'#9aa8a8':'#2a3436');P(98,96-35,2,33,'#d8e8e4');P(97,96-39,28,4,'#5a5e66');P(97,96-39,28,1,'#9aa0aa');
    const n=sgtName();P(99,96-20,24,10,'#ffffff');sgtT(P,n.slice(0,5),100,96-18,'#2a1a2e');}),
  // the bucket up from the well: wet staves and hoops, tea-coloured water, a long plait of hair over the rim with a brass tag: HOLLOW ACRE 1874
  well:()=>sgtC('a_well',130,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<130;x++)P(x,y,1,1,((x*3+y*7)%19===0)?'#2a2a30':'#22222a');
    const W=['#20140c','#3a2616','#5a3c22','#7a5432','#9a6e44'],I=['#14141a','#2e3038','#4a4e58','#6a707c'];const cx=58;
    for(let y=30;y<98;y++){const t=(y-30)/68,hw=Math.round(36-t*7);for(let x=-hw;x<=hw;x++){const u=x/hw;P(cx+x,y,1,1,(x+hw)%9===0?W[0]:W[u<-.6?3:u<.3?2:1]);}P(cx-hw-1,y,1,1,'#0a0604');P(cx+hw+1,y,1,1,'#0a0604');}
    for(const y of [36,62,90])for(let x=-36;x<=36;x++)P(cx+x,y,1,3,I[Math.abs(x)>30?1:x<0?3:2]);
    for(let x=-34;x<=34;x++){P(cx+x,31,1,1,'#7a6a3a');P(cx+x,32,1,1,'#5a4a2a');}P(cx-35,30,71,1,'#0a0604');
    for(let x=-30;x<=30;x++)P(cx+x,4+Math.round((x/30)**2*24),1,1,I[2]);   // the handle, the rope above
    // the plait: three strands crossing, straw-blond, wet and dark at the tip, tied off with twine at both ends
    for(let i=0;i<60;i++){const x=cx+22+Math.sin(i*.12)*4,y=28+i;const ph=i%6;P(x-2,y,6,1,ph<2?'#7a5a2a':ph<4?'#c8a050':'#e0c070');P(x+(ph<3?-1:2),y,1,1,'#f0d890');}
    P(cx+19,30,7,2,'#a8a080');P(cx+19,87,7,2,'#a8a080');
    P(cx+26,74,30,20,'#1a120a');P(cx+27,75,28,18,'#c89a3c');P(cx+27,75,28,1,'#f0d070');sgtT(P,'HOLLOW',cx+29,77,'#4a300c');sgtT(P,'1874',cx+33,85,'#4a300c');}),
  // the rehearsal: the altar steps, two candles, a straw dummy in your clothes with your face painted on a flour sack, and it has bled down the steps
  rehearsal:()=>sgtC('a_rehearsal',150,104,(P)=>{for(let y=0;y<104;y++)for(let x=0;x<150;x++)P(x,y,1,1,y<56?((x%30===0)?'#16121a':'#1e1820'):'#2a2630');
    for(let s=0;s<3;s++){const y=60+s*14,x0=20-s*8,x1=130+s*8;P(x0,y,x1-x0,14,'#4a4650');P(x0,y,x1-x0,2,'#7a7680');P(x0,y+12,x1-x0,2,'#1a181e');}   // the stone steps
    for(const cx of [30,120]){P(cx-2,38,5,22,'#e8e0cc');P(cx-2,38,5,1,'#ffffff');P(cx,34,1,4,'#ffd27a');P(cx-1,32,3,3,'#fff4c0');}   // the candles
    const L=(typeof S!=='undefined'&&S.look)||{},top=/^#[0-9a-f]{6}$/i.test(L.shirt||'')?L.shirt:'#a83a2a',T=[sgtShade(top,.45),sgtShade(top,.7),top,sgtShade(top,1.25)];const cx=75,o='#120c08';
    // slumped on the top step: legs over the edge in trousers, straw at the cuffs
    for(const lx of [cx-8,cx+2]){P(lx,46,7,16,o);P(lx+1,47,5,14,'#3a3a4a');P(lx+1,47,1,14,'#5a5a6a');for(const [dx,dy] of [[0,0],[2,1],[4,0]])P(lx+dx+1,62+dy,1,3,'#c8a050');}
    // the shirt: a body sagging forward, collar, two sleeves hanging, checks in two close tones, lit on the left
    for(let y=26;y<48;y++){const half=y<30?9:11;for(let x=-half;x<=half;x++){const ck=(((x+12)>>2)+(y>>2))%2===0;let t=ck?2:1;if(x<-6)t++;if(y>42)t--;P(cx+x,y,1,1,(Math.abs(x)===half||y===26)?o:T[Math.max(0,Math.min(3,t))]);}}
    P(cx-5,25,10,4,T[3]);P(cx-5,25,10,1,o);P(cx,26,1,3,o);
    for(const sx of [-1,1]){for(let y=28;y<46;y++){const x=cx+sx*(12+Math.round((y-28)*.12));P(x-2,y,5,1,((y>>2)%2)?T[1]:T[2]);P(x-2,y,1,1,o);P(x+2,y,1,1,o);}for(const [dx,dy] of [[-1,0],[1,1],[0,2],[2,1]])P(cx+sx*15+dx,46+dy,1,3,'#c8a050');}
    // the flour-sack head, lolling, a seam stitched across its crown, your face painted on in clumsy strokes
    for(let y=4;y<26;y++)for(let x=-11;x<=11;x++){const e=(x/11)**2+((y-15)/11)**2;if(e>1)continue;P(cx+x+2,y,1,1,e>.82?'#7a7262':x<-5?'#f2ecdc':y>21?'#c8c0ac':'#e2dac6');}
    for(let x=-8;x<=8;x+=2)P(cx+x+2,6,1,2,'#5a4a3a');P(cx-6,8,17,1,'#8a7a64');
    P(cx-4,12,4,4,o);P(cx+4,12,4,4,o);P(cx-3,13,1,1,'#5a5a5a');P(cx-4,20,12,2,'#8a1a14');P(cx-2,22,8,1,'#8a1a14');P(cx+1,15,2,3,'#a08070');for(const [x,y] of [[-12,10],[12,14]])P(cx+x+2,y,3,1,'#c8a050');
    for(let i=0;i<34;i++){const x=cx-2+Math.sin(i*.4)*2,y=40+i;P(x,y,3+(i>16?2:0),1,i<18?'#5a0a06':'#7a1008');}P(cx-6,72,16,3,'#5a0a06');P(cx-10,86,22,3,'#4a0806');}),   // and it bled, all the way down
};
// ---- shapes built from capsules and lit from the top left, so bodies read as bodies: parts are [ax,ay,bx,by,radius];
// ramp is [outline, shadow, mid, light]
const sgtSeg=(x,y,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/L));return Math.hypot(x-ax-t*dx,y-ay-t*dy);};
const sgtBlob=(P,parts,ramp,noise)=>{let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of parts){x0=Math.min(x0,p[0]-p[4],p[2]-p[4]);y0=Math.min(y0,p[1]-p[4],p[3]-p[4]);x1=Math.max(x1,p[0]+p[4],p[2]+p[4]);y1=Math.max(y1,p[1]+p[4],p[3]+p[4]);}
  x0=Math.floor(x0)-1;y0=Math.floor(y0)-1;x1=Math.ceil(x1)+1;y1=Math.ceil(y1)+1;const W=x1-x0+1,M=new Uint8Array(W*(y1-y0+1));
  const at=(x,y)=>x<x0||x>x1||y<y0||y>y1?0:M[(y-y0)*W+x-x0];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)for(const p of parts)if(sgtSeg(x+.5,y+.5,p[0],p[1],p[2],p[3])<=p[4]){M[(y-y0)*W+x-x0]=1;break;}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!at(x,y))continue;let c;
    if(!at(x-1,y)||!at(x+1,y)||!at(x,y-1)||!at(x,y+1))c=ramp[0];
    else if(!at(x-1,y-1)||!at(x,y-2)||!at(x-2,y))c=ramp[3];
    else if(!at(x+1,y+1)||!at(x,y+2)||!at(x+2,y))c=ramp[1];
    else c=noise&&((x*7+y*13)%noise===0)?ramp[1]:ramp[2];
    P(x,y,1,1,c);}};
// ---- the new land's sights
const sgtLook=()=>{const L=(typeof S!=='undefined'&&S.look)||{};const ok=c=>/^#[0-9a-f]{6}$/i.test(c||'');return {shirt:ok(L.shirt)?L.shirt:'#b8402c',pants:ok(L.pants)?L.pants:'#3a4e7a',hair:ok(L.hair)?L.hair:'#6a4224'};};
Object.assign(SGT_ART,{
  // the Weeping Birches: white trunks, dolls on strings at every height; Ruth's with its blue ribbon; the newest at the height of your face, your hair, its dress half-sewn, the needle hanging
  birches:()=>sgtC('a_birches',160,104,(P)=>{const lk=sgtLook();for(let y=0;y<104;y++)for(let x=0;x<160;x++){const h=(((x*73856093)^(y*19349663))>>>0)%89;P(x,y,1,1,y>84?(h<5?'#4a3a22':h<9?'#3a3424':'#2c281c'):(h<3?'#1c2220':'#161c1a'));}
    for(const [tx,tw] of [[14,8],[52,6],[98,7],[140,9]]){for(let y=0;y<92;y++)for(let x=0;x<tw;x++){P(tx+x,y,1,1,x===0||x===tw-1?'#6a6a62':x<2?'#f0ece0':'#d4d0c4');}for(let y=4;y<90;y+=7+((tx+y)%5))P(tx+1+(y%3),y,tw-3,1,'#1a1a18');}
    for(const [bx,by,bw] of [[18,14,40],[56,22,48],[100,10,44],[22,40,32]]){for(let x=0;x<bw;x++)P(bx+x,by+Math.round(Math.sin(x/bw*3)*2),1,2,'#bab6aa');}
    const doll=(x,y,dress,hair,big)=>{const k=big?2:1;for(let i=0;i<(big?6:y-14);i++)P(x+2*k,y-i-1,1,1,'#8a8270');P(x+k,y,4*k,4*k,'#e8dcc8');P(x+k,y,4*k,1,'#f8f0e0');P(x+k,y,4*k,k,hair);P(x+2*k,y+2*k,1,1,'#2a1a10');P(x+3*k,y+2*k,1,1,'#2a1a10');
      P(x,y+4*k,6*k,6*k,dress);P(x,y+4*k,6*k,1,'#ffffff40');P(x+k,y+10*k,k,2*k,'#e8dcc8');P(x+4*k,y+10*k,k,2*k,'#e8dcc8');};
    for(const [x,y,c] of [[26,22,'#8a5a7a'],[64,30,'#6a7a4a'],[44,50,'#7a4a3a'],[108,18,'#4a5a7a'],[124,44,'#8a7a4a'],[80,58,'#5a4a6a'],[34,66,'#7a6a5a']])doll(x,y,c,'#6a4a2a');
    doll(110,52,'#7a8aa8','#d8c27a');P(110,53,7,2,'#2a4a9a');P(116,52,2,4,'#3a5aba');   // Ruth's: the blue ribbon in her wool hair
    // the newest, low and close: your hair in a braid, the dress only half sewn, the needle hanging on its thread
    const nx=66,ny=60,ol='#2a2018',hr=lk.hair,cal='#d8ccb0',dr='#8a7aa0';for(let i=0;i<7;i++)P(nx+5,ny-i-1,1,1,'#8a8270');
    P(nx+1,ny+8,10,14,ol);P(nx+2,ny+8,8,13,cal);P(nx+2,ny+8,1,13,'#ece2c8');P(nx+2,ny+21,3,5,ol);P(nx+7,ny+21,3,5,ol);P(nx+3,ny+21,1,4,cal);P(nx+8,ny+21,1,4,cal);
    P(nx-1,ny+9,3,8,ol);P(nx+10,ny+9,3,8,ol);P(nx,ny+9,1,7,cal);P(nx+11,ny+9,1,7,cal);
    P(nx+1,ny-1,10,10,ol);P(nx+2,ny,8,8,'#e8dcc8');P(nx+2,ny,8,2,hr);P(nx+2,ny,3,1,sgtShade(hr,1.35));P(nx+2,ny+2,1,3,hr);P(nx+9,ny+2,1,3,hr);
    P(nx+4,ny+4,1,1,'#2a1a10');P(nx+7,ny+4,1,1,'#2a1a10');P(nx+5,ny+6,2,1,'#8a5a4a');
    for(let i=0;i<10;i++)P(nx+10+(i%2),ny+2+i,2,1,i%2?sgtShade(hr,.7):hr);P(nx+10,ny+12,3,1,'#a8a080');
    P(nx+1,ny+8,10,6,dr);P(nx+1,ny+8,10,1,sgtShade(dr,1.3));P(nx+1,ny+8,1,6,sgtShade(dr,1.2));P(nx+3,ny+8,6,1,'#e8e0d0');
    for(let x=0;x<12;x++){const L=3+((x*5)%3);P(nx+x,ny+14,1,L,x<2?sgtShade(dr,1.15):x>9?sgtShade(dr,.75):dr);P(nx+x,ny+14+L,1,1,sgtShade(dr,.5));}
    for(const sx of [2,5,8]){P(nx+sx,ny+19,1,1,'#3a3040');P(nx+sx+1,ny+20,1,1,'#3a3040');}
    for(let i=0;i<7;i++)P(nx+9+Math.round(i*.5),ny+21+i,1,1,'#c8bca0');P(nx+12,ny+28,1,4,'#b8bcc8');P(nx+12,ny+28,1,1,'#ffffff');P(nx+12,ny+31,1,1,'#6a6e7a');}),
  // the fen: the peat bank and black water, the turf-cutter's hut; a child curled on its side, brown as an old glove, a
  // plaited grass rope round its neck and a wooden tag burnt 1872; more of them curled under the water; and by the hut's
  // door, face down, one in your coat
  fen:()=>sgtC('a_fen2',160,104,(P)=>{const lk=sgtLook(),hs=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%97;
    const edge=x=>Math.round(52+Math.sin(x*.05)*4+Math.sin(x*.19)*1.5);
    for(let y=0;y<104;y++)for(let x=0;x<160;x++){const e=edge(x),h=hs(x,y);
      P(x,y,1,1,y<e?(h<3?'#45311c':h<9?'#221710':'#2d2015'):y===e?'#5a4428':y<e+4?(y===e+3?'#0a0806':'#1a120c'):(h<2?'#1a2a30':'#0b1215'));}
    for(const [rx,ry,rw] of [[18,70,8],[66,62,6],[100,82,10],[140,66,7],[40,94,5]])P(rx,ry,rw,1,'#1e3036');
    // the hut: plank wall, the doorway, its shadow on the bank
    for(let y=0;y<28;y++)for(let x=118;x<160;x++)P(x,y,1,1,(x-118)%5===0?'#1e1810':y<3?'#141008':(x+y)%13===0?'#4a3e2c':'#3a3024');
    P(118,0,1,28,'#4e4232');P(131,9,12,19,'#100c08');P(130,8,14,1,'#5a4a36');P(130,8,1,20,'#5a4a36');P(143,8,1,20,'#2a2218');P(118,28,42,2,'#150f0a');
    for(const rx of [6,30,58,92,150]){const e=edge(rx);for(let i=0;i<6;i++){const hh=5+((rx+i*7)%5);P(rx+i,e-hh+2,1,hh,i%2?'#4a4a24':'#5e5a2c');P(rx+i,e-hh+2,1,1,'#9a8a48');}}
    // a child curled on its side: back rounded, knees drawn up, head bowed onto them, one arm across the shins
    const curl=(cx,cy,s,f,rot)=>{const c=Math.cos(rot||0),sn=Math.sin(rot||0),T=(u,v)=>{u*=f;return [cx+(u*c-v*sn)*s,cy+(u*sn+v*c)*s];},C=(a,b,r)=>{const A=T(a[0],a[1]),B=T(b[0],b[1]);return [A[0],A[1],B[0],B[1],r*s];};
      // folded at the knee: the thigh runs forward to the knee, the shin angles back down to the foot (a "<", not two logs)
      return {torso:[C([-10,2],[-5,-3],4.6),C([-5,-3],[2,-4],4.6),C([2,-4],[8,1],2.6)],
        thigh:[C([-7,4],[6,6],3.5)],shin:[C([6,7],[0,12.5],2.4),C([0,12.5],[-5,13],1.6)],
        head:[C([10.5,4],[10.6,4.1],4.2)],arm:[C([2,-2],[5.5,4.5],1.8),C([5.5,4.5],[2.5,10],1.6),C([2.5,10],[.8,10.6],1.5)],T};};
    const curlDraw=(q,L,face)=>{const lo=[L[0],L[1],sgtShade(L[2],.88),sgtShade(L[3],.9)];sgtBlob(P,q.shin,lo);sgtBlob(P,q.torso,L);sgtBlob(P,q.thigh,L);sgtBlob(P,q.arm,L);sgtBlob(P,q.head,L);
      if(!face)return;const D=(u,v,c,w)=>{const [x,y]=q.T(u,v);P(Math.round(x),Math.round(y),w||1,1,c);};
      for(let u=-10;u<=4;u+=.5)D(u,-7.3-Math.sin((u+10)/14*3.1)*.9,L[3]);
      D(9.2,3.6,L[0]);D(9.2,4.4,L[1]);D(12.2,4.2,L[0]);D(12.9,4.6,L[0]);D(14.6,5.4,L[0]);D(13.2,7,L[1]);D(13.8,6.8,L[1]);
      for(const [u,v] of [[7.4,1],[8,.2],[9,-.3],[10,-.4],[11,-.2],[7.2,2]])D(u,v,'#8a3a18');
      D(1,10,L[3]);D(.2,11,L[0]);D(1.4,11.4,L[0]);D(-6,13.2,L[0]);};
    const deep=['#081014','#0e1a1f','#142329','#1c3036'];
    for(const [cx,cy,s,f,r] of [[30,74,1,1,.5],[86,88,.95,-1,-1.1],[134,72,1,1,2.6]])curlDraw(curl(cx,cy,s,f,r),deep,false);
    const cx=34,cy=24,L=['#1a0e06','#4a2a12','#6a4024','#94643a'],q=curl(cx,cy,1.45,1,0);sgtBlob(P,[[cx-14,cy+19,cx+16,cy+19,4]],['#170f0a','#170f0a','#170f0a','#170f0a']);
    curlDraw(q,L,true);
    // the plaited grass rope round its neck, and the tag hanging off it
    const [nx,ny]=q.T(7,-.6);for(let i=0;i<7;i++){const a=.2+i/6*2.8;P(nx+Math.round(Math.cos(a)*2.4),ny+Math.round(Math.sin(a)*1.8),1,1,i%2?'#6a5a2a':'#c8b468');}
    for(let i=0;i<11;i++)P(nx+2+Math.round(i*.9),ny+2+i,1,1,i%2?'#6a5a2a':'#c8b468');
    const tx=nx+6,ty=ny+13;P(tx,ty,20,10,'#2a1a0a');P(tx+1,ty+1,18,8,'#c8a878');P(tx+1,ty+1,18,1,'#e2c89a');P(tx+1,ty+8,18,1,'#9a7a50');P(tx+12,ty-1,2,2,'#2a1a0a');sgtT(P,'1872',tx+2,ty+3,'#2a1406');
    // the newest, face down by the hut's door, in your coat: arms out, your hair, boots still on
    const x0=110,y0=40,sh=lk.shirt,pa=lk.pants,ol='#120c08';sgtBlob(P,[[x0-6,y0+3,x0+26,y0+3,5.5]],['#140e0a','#140e0a','#140e0a','#140e0a']);
    sgtBlob(P,[[x0+12,y0-2,x0+24,y0-3,2.4],[x0+12,y0+2,x0+23,y0+5,2.4]],[ol,sgtShade(pa,.6),pa,sgtShade(pa,1.3)]);
    sgtBlob(P,[[x0+24,y0-3,x0+27,y0-3,2.2],[x0+23,y0+5,x0+26,y0+6,2.2]],[ol,'#140e08','#2a2018','#4a3a2c']);
    sgtBlob(P,[[x0,y0,x0+12,y0,5]],[ol,sgtShade(sh,.6),sh,sgtShade(sh,1.3)]);
    sgtBlob(P,[[x0+1,y0-4,x0-8,y0-8,2.5],[x0+3,y0+4,x0+11,y0+6,2.4]],[ol,sgtShade(sh,.55),sgtShade(sh,.85),sgtShade(sh,1.2)]);
    sgtBlob(P,[[x0-10,y0-9,x0-10,y0-9,1.8],[x0+13,y0+6,x0+13,y0+6,1.7]],[ol,'#8a6a58','#c8a088','#e0c0a8']);
    sgtBlob(P,[[x0-6,y0,x0-6,y0,3.8]],[ol,sgtShade(lk.hair,.6),lk.hair,sgtShade(lk.hair,1.35)]);
    P(x0+6,y0+2,4,2,sgtShade(sh,.4));P(x0+6,y0+2,4,1,sgtShade(sh,.3));P(x0+3,y0-1,1,3,sgtShade(sh,.5));}),
  // from the fire lookout: the valley from above through the cab's window. Its roads and the creek run out like the spokes of a
  // wheel through the fields to a rim of woods; at the hub, your field, a light in it. The logbook lies open on the sill.
  lookout:()=>sgtC('a_lookout3',160,104,(P)=>{const cx=64,cy=58,K=.55,hs=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%101,N=9,A0=.2;
    const FL=['#4a3e22','#3a3a1e','#52462a','#403420','#36381c'];
    const toS=(u,v)=>{const w=1+v/110;return [cx+u*1.45*w,cy+v*(v<0?K:1)];},hill=x=>Math.round(13+Math.sin(x*.045+1)*4+Math.sin(x*.13)*2),hill2=x=>Math.round(21+Math.sin(x*.07+2.5)*3);
    for(let y=0;y<104;y++)for(let x=0;x<160;x++){const v=(y-cy)/(y<cy?K:1),w=1+v/110,u=(x-cx)/(1.45*w),d=Math.hypot(u,v),h=hs(x,y);let c;
      if(y<hill(x)-7)c=h<4?'#3a3a4c':'#2c2e3e';else if(y<hill(x))c=y===hill(x)-7?'#3a4440':'#121c1a';else if(y<hill2(x))c=y===hill(x)?'#24302a':'#16241c';
      else if(d>43)c=h<20?'#0c150f':h<45?'#15231a':'#111d15';
      else{let a=Math.atan2(v,u)-A0;while(a<0)a+=6.283;const sec=Math.floor(a/(6.283/N)),ring=d>24?1:0;c=FL[(sec*2+ring*3)%5];
        if(Math.abs(d-24)<.7)c='#24301a';else if(h<4)c='#2a2a16';else if((sec+ring)%2===0&&((y+sec)%3===0))c=sgtShade(c,.85);}
      P(x,y,1,1,c);}
    for(let i=0;i<52;i++){const a=i/52*6.283+.05,r=47+(i*7)%6,[x,y]=toS(Math.cos(a)*r,Math.sin(a)*r);if(y<hill2(Math.round(x))+1)continue;const sc=y<cy?.75:1.15;sgtBlob(P,[[x,y,x,y,(3+(i%3)*.6)*sc]],['#08100b','#13221a','#1c3022','#2a4430']);}
    for(let k=0;k<N;k++){const a=k/N*6.283+A0,wet=k===2||k===6;for(let r=6;r<110;r+=.3){const ww=wet?Math.sin(r*.35)*1.3:0;
        let [x,y]=toS(Math.cos(a)*r-Math.sin(a)*ww,Math.sin(a)*r+Math.cos(a)*ww);x=Math.round(x);y=Math.round(y);if(y<hill2(x)||x<0||x>159||y>103)continue;
        if(wet){P(x,y,2,y<cy?1:2,'#3e6e7e');P(x,y,1,1,'#6a9aa8');}else{P(x,y+1,1,1,'#2a2214');P(x,y,1,1,'#b0a070');}}
      if(!wet)for(const r of [17,31]){let [x,y]=toS(Math.cos(a)*r,Math.sin(a)*r);x=Math.round(x)+2;y=Math.round(y)-2;P(x,y,3,1,'#7a3a2a');P(x,y+1,3,2,'#c8b890');P(x+1,y+2,1,1,'#2a1a10');}}
    for(let y=-4;y<=5;y++)for(let x=-8;x<=8;x++)P(cx+x,cy+y,1,1,Math.abs(x)===8||y===-4||y===5?'#1e160c':(y&1)?'#4e3c1e':'#3a2c14');
    const lx=cx+4,ly=cy-2;for(let y=-9;y<=9;y++)for(let x=-12;x<=12;x++){const d=Math.hypot(x/1.3,y);if(d<4.5)P(lx+x,ly+y,1,1,'#ffd8604a');else if(d<8.5)P(lx+x,ly+y,1,1,'#ffc85026');}
    P(cx+2,cy-5,5,2,'#5a2a1e');P(cx+2,cy-3,5,3,'#b8a888');P(cx+3,cy-3,2,2,'#ffe6a0');P(cx+3,cy-3,1,1,'#ffffff');
    // the cab's window: a frame round the view, one mullion well off the hub, the sill, the logbook open on it
    const F='#2a2420',B='#4a3e30';for(let y=0;y<92;y++){P(0,y,5,1,F);P(155,y,5,1,F);P(116,y,4,1,F);P(5,y,1,1,B);P(120,y,1,1,B);}
    for(let x=0;x<160;x++){P(x,0,1,4,F);P(x,4,1,1,B);P(x,92,1,12,'#3a3028');P(x,92,1,1,'#6a5a46');}
    P(12,93,42,11,'#2a1a0e');P(13,94,19,9,'#e2d6b8');P(33,94,20,9,'#d8ccae');P(32,94,1,9,'#8a7a5a');
    for(let i=0;i<4;i++){P(15,96+i*2,14-(i%2)*4,1,'#6a5a44');P(35,96+i*2,9,1,'#6a5a44');P(47,96+i*2,2,1,'#c89a3a');}
    P(60,97,16,2,'#c89a3a');P(60,97,2,2,'#2a2018');}),
  // under the reservoir: down through clear green water, the old street. The roofs and the walls, a lamp post, a bicycle on its side;
  // the drowned stand in the street in their Sunday clothes, hair lifting, every one turned away toward the north-west
  drowned:()=>sgtC('a_drowned2',160,104,(P)=>{const hs=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%89;
    for(let y=0;y<104;y++)for(let x=0;x<160;x++){const h=hs(x,y);let c;
      if(y<46)c=h<4?'#21403c':'#1c3a37';else{const row=Math.floor((y-46)/4),cx=(x+(row%2)*3)%6,cy=(y-46)%4;c=cx===0||cy===0?'#132a28':h<6?'#24443f':'#1d3b37';}
      if(((x+y*2)>>3)%9===0)c=sgtShade(c,1.12);
      P(x,y,1,1,c);}
    P(0,45,160,1,'#2e524c');P(0,46,160,1,'#10221f');
    // the houses on the far side of the street, roofs toward us, weed up their walls
    for(const [hx,hw] of [[4,40],[54,44],[110,46]]){for(let y=0;y<16;y++)P(hx-1,6+y,hw+2,1,y%3===0?'#14282a':y<2?'#3a5e58':'#25423f');
      P(hx-1,22,hw+2,1,'#0e1e1e');for(let y=23;y<44;y++)P(hx,y,hw,1,y===23?'#0e1e1e':'#2c4c47');P(hx,23,1,21,'#3a605a');
      for(let wx=hx+5;wx<hx+hw-8;wx+=14){P(wx,28,7,7,'#0a1616');P(wx,28,7,1,'#3e625c');P(wx+3,28,1,7,'#2c4c47');P(wx,31,7,1,'#2c4c47');}
      P(hx+hw-11,32,7,12,'#0a1414');P(hx+hw-12,31,9,1,'#3e625c');
      for(let i=0;i<4;i++){const sx=hx+3+i*((hw/4)|0);for(let y=0;y<8+i%3*3;y++)P(sx+Math.round(Math.sin(y*.6+i)),43-y,1,1,'#2e5a3a');}}
    // a lamp post, lit from the top left
    P(102,22,2,46,'#2a4a46');P(102,22,1,46,'#4a6e66');P(99,18,8,5,'#1a3230');P(100,19,6,3,'#5a8a7e');P(98,17,10,1,'#3a5e58');P(100,67,6,2,'#132826');
    // a bicycle on its side in the road
    const ring=(x,y,r)=>{for(let a=0;a<6.283;a+=.09)P(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.7),1,1,'#5e8a80');};
    ring(124,92,6);ring(142,92,6);for(let i=0;i<=10;i++){P(124+i*.9,92-i*.5,1,1,'#7aa89c');P(133+i*.9,87+i*.5,1,1,'#7aa89c');}P(132,86,4,1,'#9ac8bc');P(142,86,1,6,'#7aa89c');P(141,85,4,1,'#9ac8bc');
    // the people, from behind: a man in his suit and hat, women in their church dresses, a girl; their hair lifting in the water,
    // every one turned the same way, up and to the left
    const skin='#9ab8b0',ol='#0a1414';
    const who=(x,y,o)=>{const c=o.c,hk=o.hair,s=o.s||1,R=(a,b,w,h,col)=>P(Math.round(x+a*s),Math.round(y+b*s),Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s)),col);
      if(o.dress){R(-6,-12,12,13,ol);R(-5,-12,10,12,c);R(-5,-12,2,12,sgtShade(c,1.25));R(3,-12,2,12,sgtShade(c,.7));R(-6,0,3,1,'#060c0c');R(1,0,3,1,'#060c0c');}
      else{R(-4,-8,3,9,ol);R(1,-8,3,9,ol);R(-3,-8,2,8,sgtShade(c,.8));R(2,-8,2,8,sgtShade(c,.7));R(-5,0,4,1,'#060c0c');R(0,0,4,1,'#060c0c');}
      // the back of the coat: a seam down the middle, the collar, the right arm hanging, the left half hidden as they turn away left
      R(-6,-22,12,13,ol);R(-5,-21,10,12,c);R(-5,-21,2,12,sgtShade(c,1.25));R(3,-21,2,12,sgtShade(c,.7));R(0,-20,1,11,sgtShade(c,.75));R(-4,-22,7,2,sgtShade(c,.6));
      R(-7,-20,2,8,sgtShade(c,.8));R(5,-20,2,10,sgtShade(c,.65));R(5,-11,2,2,sgtShade(skin,.75));
      // the back of the head: all hair, nudged left the way they're looking
      R(-5,-30,7,9,ol);R(-4,-29,5,8,hk);R(-4,-29,2,1,sgtShade(hk,1.35));R(-4,-29,1,3,sgtShade(hk,1.2));R(0,-26,1,4,sgtShade(hk,.75));
      if(o.hat){R(-7,-31,11,2,ol);R(-6,-31,9,1,o.hat);R(-4,-35,6,4,ol);R(-3,-34,4,3,o.hat);R(-3,-34,1,3,sgtShade(o.hat,1.4));}
      if(o.lift){const n=o.lift+4;for(let j=0;j<n;j++){const px=1+j*.85,py=-27-j*.5+Math.sin(j*.55)*1.3,w=Math.max(1,3.6*(1-j/n)+.6);
          for(let k=0;k<Math.ceil(w);k++){const col=k===0?sgtShade(hk,1.3):k>=Math.ceil(w)-1?sgtShade(hk,.6):hk;R(px,py-w/2+k,1,1,col);}}}};
    for(const [x,y,o] of [[26,72,{c:'#2a2e3c',hair:'#4a3a2a',hat:'#1a1e26'}],[52,64,{c:'#4a3448',hair:'#8a7a5a',dress:1,lift:13}],[80,70,{c:'#2a3a4a',hair:'#2a2420',hat:'#3a4a5a',dress:1,lift:8}],
        [64,92,{c:'#3a4a3a',hair:'#c8b880',dress:1,lift:14,s:.8}],[116,74,{c:'#30303a',hair:'#8a8a84',hat:'#202028'}],[92,98,{c:'#44303a',hair:'#5a3a24',dress:1,lift:12}]])who(x,y,o);
    // bubbles going up, and the light coming down
    for(const [x,y] of [[50,30],[51,25],[81,28],[66,58],[67,52],[117,30],[118,22]])P(x,y,1,1,'#9ad0c4');
    for(let i=0;i<18;i++){const x=(i*41)%156,y=(i*29)%100;P(x,y,4+(i%3)*2,1,'#5e9a8c');}}),
  // the deep corn: a clearing trampled flat with the corn standing all round; a ring of scarecrows in children's clothes, all facing
  // in. In the middle, a new one your size, in your clothes, your hair and your face painted on, a card on its chest: STAND-IN
  corn:()=>sgtC('a_corn2',160,104,(P)=>{const lk=sgtLook(),hs=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%97;
    for(let y=0;y<104;y++)for(let x=0;x<160;x++){const h=hs(x,y);P(x,y,1,1,y<34?(h<8?'#0e0c06':'#16130a'):(h<5?'#6a5a2a':h<9?'#2a2214':'#3a2e1a'));}
    // the wall of corn behind
    for(let x=-2;x<162;x+=4){const top=2+((x*7)%9),sh=(x*13)%3;for(let y=top;y<38;y++)P(x+(y>>4)%2,y,2,1,y<top+4?'#b89a48':sh?'#6a5a24':'#56481c');
      for(let y=top+6;y<36;y+=7){const d=(x+y)%2?1:-1;for(let i=0;i<5;i++)P(x+d*i,y+i*.6,1,1,'#7a6a2c');}}
    P(0,36,160,2,'#120e08');
    const ol='#120c08';
    const crow=(x,y,s,o)=>{const X=v=>Math.round(x+v*s),Y=v=>Math.round(y+v*s),B=(a,b,c,d,col,line)=>{if(line!==false)P(X(a)-1,Y(b)-1,X(c)-X(a)+2,Y(d)-Y(b)+2,ol);P(X(a),Y(b),X(c)-X(a),Y(d)-Y(b),col);};
      P(X(-8),Y(41),X(8)-X(-8),2,'#00000066');B(-1,8,1,41,'#4a3418');
      if(o.pants){B(-4,20,0,33,o.pants);B(0,20,4,33,sgtShade(o.pants,.85));P(X(-4),Y(33),X(4)-X(-4),1,'#c8a848');}
      const sh=o.sh;B(-13,9,13,14,sh);B(-5,8,5,22,sh);P(X(-5),Y(8),2,Y(22)-Y(8),sgtShade(sh,1.25));P(X(5)-2,Y(8),2,Y(22)-Y(8),sgtShade(sh,.7));P(X(-13),Y(9),X(13)-X(-13),1,sgtShade(sh,1.2));
      if(o.stripe)for(let b=11;b<22;b+=3)P(X(-5),Y(b),X(5)-X(-5),1,o.stripe);
      if(o.apron&&o.front){P(X(-3),Y(12),X(3)-X(-3),Y(22)-Y(12),'#d8d0bc');P(X(-3),Y(12),1,Y(22)-Y(12),'#f0e8d4');}
      if(o.kerchief&&o.front){P(X(-3),Y(8),X(3)-X(-3),2,o.kerchief);P(X(-1),Y(10),2,2,o.kerchief);}
      for(const sx of [-15,13])for(let i=0;i<3;i++)P(X(sx)+i,Y(10)+i,1,2,'#d8b850');
      for(let i=0;i<4;i++)P(X(-3)+i*2,Y(22),1,2+(i%2),'#d8b850');
      B(-4,-1,4,9,'#b89a68');P(X(-4),Y(-1),1,Y(9)-Y(-1),'#d8bc88');P(X(4)-1,Y(-1),1,Y(9)-Y(-1),'#8a6e46');for(let i=0;i<5;i++)P(X(-3)+((i*3)%7),Y(1)+i*2,1,1,'#9a7e52');
      P(X(-4),Y(8),X(4)-X(-4),1,'#5a4220');for(let i=0;i<3;i++)P(X(-2)+i*2,Y(9),1,1,'#d8b850');
      if(o.front&&!o.you){P(X(-2.5),Y(3),2,2,'#1a120a');P(X(1.5),Y(3),2,2,'#1a120a');for(let i=0;i<4;i++)P(X(-2)+i*1,Y(6.4),1,1,i%2?'#1a120a':'#6a5030');}
      if(!o.front){for(let b=0;b<8;b+=2)P(X(0),Y(b),1,1,'#6a5030');}};
    const kids=[[30,44,.8,{sh:'#7a8a6a',front:1,apron:1}],[58,38,.8,{sh:'#6a6a8a',front:1,kerchief:'#a82a20'}],[104,38,.8,{sh:'#8a4a3a',front:1,stripe:'#c8b890'}],[130,44,.8,{sh:'#a89060',front:1}],
      [12,60,.9,{sh:'#5a6a8a',front:1,stripe:'#2a3448'}],[148,60,.9,{sh:'#8a7a5a',front:1,apron:1}]];
    for(const k of kids)crow(...k);
    // you, in the middle, your size
    const mx=80,my=28,s=1.55;crow(mx,my,s,{sh:lk.shirt,pants:lk.pants,front:1,you:1});
    const X=v=>Math.round(mx+v*s),Y=v=>Math.round(my+v*s);
    P(X(-5),Y(-3),X(5)-X(-5),Y(1)-Y(-3),lk.hair);P(X(-5),Y(-3),X(5)-X(-5),1,sgtShade(lk.hair,1.35));P(X(-5),Y(1),2,3,lk.hair);P(X(4),Y(1),2,3,lk.hair);P(X(-5),Y(-4),X(5)-X(-5)+2,1,ol);
    P(X(-3),Y(2.6),3,2,'#f2ead2');P(X(1.2),Y(2.6),3,2,'#f2ead2');P(X(-2),Y(2.6),2,2,'#2a3a5a');P(X(2),Y(2.6),2,2,'#2a3a5a');P(X(-3),Y(2),3,1,'#3a2414');P(X(1.2),Y(2),3,1,'#3a2414');
    P(X(-1.6),Y(6.4),5,1,'#a82018');P(X(-2.2),Y(6),1,1,'#a82018');P(X(2.6),Y(6),1,1,'#a82018');P(X(-1),Y(7.2),1,2,'#8a1a14');
    // the card, tied on with string
    const cw=36,cx0=mx-18,cy0=Y(13);P(mx-8,Y(9),1,cy0-Y(9),'#d8d0bc');P(mx+8,Y(9),1,cy0-Y(9),'#d8d0bc');P(cx0,cy0,cw,10,ol);P(cx0+1,cy0+1,cw-2,8,'#f2ead2');P(cx0+1,cy0+1,cw-2,1,'#ffffff');
    sgtT(P,'STAND',cx0+3,cy0+3,'#2a1a2e');P(cx0+23,cy0+5,2,1,'#2a1a2e');sgtT(P,'IN',cx0+26,cy0+3,'#2a1a2e');
    // the near side of the ring, their backs to us
    crow(42,72,1,{sh:'#6a4a5a'});crow(118,72,1,{sh:'#4a6a5a',stripe:'#2a3a30'});
    // corn close in front at the corners
    for(const [x0,x1] of [[0,22],[140,160]])for(let x=x0;x<x1;x+=3){const top=74+((x*5)%11);for(let y=top;y<104;y++)P(x,y,2,1,y<top+3?'#c8aa58':'#6a5a24');for(let y=top+5;y<104;y+=6)P(x-1,y,4,1,'#7a6a2c');}}),
});
// ---- the story places (chapter two): what you actually see when you get there
const sgtH=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%97;
Object.assign(SGT_ART,{
  // the Marsh place: your cabin, to the board. The window crack shaped like a river, the porch board that sticks, and on the door
  // a note in Grandpa's hand, addressed to you
  p_marsh:()=>sgtC('p_marsh',160,104,(P)=>{const ol='#140c06';
    for(let y=0;y<82;y++)for(let x=0;x<160;x++){const r=y%9,h=sgtH(x,y);P(x,y,1,1,r===8?'#8a8070':r===0?'#24180c':r===1?'#7a5a3a':r<6?(h<6?'#4a3420':'#5e4428'):'#3e2c1a');}
    // the window, four panes, and the crack running across them like a river with its creeks
    P(8,12,44,46,ol);P(10,14,40,42,'#5a4228');for(const [px,py] of [[12,16],[31,16],[12,36],[31,36]]){P(px,py,17,18,'#1e2a34');P(px,py,17,2,'#3a4a58');P(px,py,2,18,'#2a3844');}
    const glass=(x,y)=>x>=12&&x<48&&y>=16&&y<54&&!(x>=29&&x<31)&&!(y>=34&&y<36);
    for(let t=0;t<=1;t+=.006){const x=Math.round(13+t*34+Math.sin(t*7)*3),y=Math.round(17+t*35+Math.sin(t*11)*4);if(glass(x,y)){P(x,y,1,1,'#c8d4dc');if(glass(x+1,y+1))P(x+1,y+1,1,1,'#0c1418');}}
    for(const [t0,dx,dy,n] of [[.18,1,-.6,7],[.42,-.4,1,6],[.6,1,-.8,8],[.8,-.7,.9,5]]){let x=13+t0*34+Math.sin(t0*7)*3,y=17+t0*35+Math.sin(t0*11)*4;for(let j=0;j<n;j++){x+=dx;y+=dy+Math.sin(j)*.4;if(glass(Math.round(x),Math.round(y)))P(x,y,1,1,'#9aa8b2');}}
    P(6,58,48,3,'#6a4e30');P(6,58,48,1,'#9a7a52');
    // the door, planks and a Z brace, the latch
    P(66,4,50,79,ol);for(let x=68;x<114;x++)for(let y=6;y<82;y++)P(x,y,1,1,(x-68)%9===0?'#2a1c10':(x-68)%9===1?'#8a6a44':sgtH(x,y)<5?'#5a4028':'#6e5034');
    for(let i=0;i<46;i++){P(68+i,64-Math.round(i*.9),1,3,'#4a3420');P(68+i,64-Math.round(i*.9),1,1,'#9a7a52');}P(68,18,46,4,'#4a3420');P(68,66,46,4,'#4a3420');P(68,18,46,1,'#9a7a52');P(68,66,46,1,'#9a7a52');
    P(106,40,4,6,'#1a1a1a');P(106,40,1,6,'#6a6a6a');
    // the note: nailed at eye height, the paper curling, your name in his hand
    P(72,23,40,32,'#00000055');P(70,21,40,32,'#3a2a18');P(71,22,38,30,'#d4c494');P(71,22,38,1,'#e8dab0');P(71,22,1,30,'#e0d2a4');P(108,22,1,30,'#a8966a');P(71,51,38,1,'#a8966a');
    for(const [fx,fy] of [[75,24],[101,27],[93,42],[78,47],[104,45],[86,30]])P(fx,fy,2,1,'#b0905a');P(102,46,7,6,'#6e5034');for(let i=0;i<6;i++)P(102+i,51-i,7-i,1,i<2?'#b8a070':'#e6d6a8');
    P(89,23,2,2,'#2a2a2a');P(89,23,1,1,'#8a8a8a');
    const ink='#2a2440',nm=sgtName().slice(0,8);sgtT(P,'FOR',74,27,ink);let X=74;for(let i=0;i<nm.length;i++){X=sgtT(P,nm[i],X,35+(i%2),ink);}
    for(const [ly,lw] of [[43,30],[47,24]])for(let i=0;i<lw;i++)P(74+i,ly+Math.round(Math.sin(i*.9)),1,1,i%7===6?'#e6dac0':'#5a5470');sgtT(P,'G',98,46,ink);P(102,50,1,1,ink);
    // the porch boards, and the one that sticks up
    for(let y=82;y<104;y++)for(let x=0;x<160;x++){const r=(y-82)%6;P(x,y,1,1,r===0?'#1e140a':r===1?'#9a7a52':sgtH(x,y)<6?'#5e4428':'#74583a');}
    for(let i=0;i<22;i++){const lf=Math.round((i/21)**1.4*8),x=80+i;P(x,94-lf-6,1,1,'#1e140a');P(x,94-lf-5,1,1,'#d0aa78');P(x,94-lf-4,1,4,'#8a6a44');P(x,94-lf,1,lf,'#060402');}
    P(101,80,2,6,'#a8875c');P(101,80,2,1,'#d0aa78');P(80,88,1,6,'#1e140a');P(78,89,2,2,'#b0b0b0');P(78,89,1,1,'#e8e8e8');}),
  // the Tithe House: no windows, a ring of stones, the door nailed shut over and over, holes right through; a child's shoes on the step
  p_tithe:()=>sgtC('p_tithe',160,104,(P)=>{const ol='#0e0c0c';
    for(let y=0;y<104;y++)for(let x=0;x<160;x++)P(x,y,1,1,y<30?'#1c1e24':y<92?'#1a1c18':sgtH(x,y)<10?'#2e3a22':'#242e1a');
    for(const [sx,sw,sh,gy,dk] of [[20,7,16,86,1],[133,7,15,86,1],[2,11,30,94,0],[147,11,28,94,0]]){const c=dk?['#3e3e44','#4a4a50','#2e2e34','#5a5a60']:['#5a5a5e','#7a7a80','#3e3e44','#8a8a90'];
      P(sx-1,gy-sh-1,sw+2,sh+1,ol);P(sx,gy-sh,sw,sh,c[0]);P(sx,gy-sh,2,sh,c[1]);P(sx+sw-2,gy-sh,2,sh,c[2]);P(sx,gy-sh,sw,1,c[3]);P(sx-2,gy,sw+4,1,'#141a10');}
    // the wall: coursed stone, no window anywhere
    for(let y=6;y<88;y++)for(let x=30;x<130;x++){const row=Math.floor((y-6)/7),off=(row%2)*6,cx=(x-30+off)%12,cy=(y-6)%7;P(x,y,1,1,cx===0||cy===0?'#24242a':cy===1?'#7a7880':sgtH(x,y)<8?'#4a4a52':'#5a5a62');}
    P(30,6,100,2,'#8a8890');P(28,4,104,2,ol);P(28,6,2,82,ol);P(130,6,2,82,ol);
    // the door, and a hundred and fifty years of nails
    P(54,18,52,70,ol);P(52,14,56,5,'#6a686e');P(52,14,56,1,'#9a98a0');
    for(let x=56;x<104;x++)for(let y=20;y<88;y++)P(x,y,1,1,(x-56)%8===0?'#1a120c':(x-56)%8===1?'#6a5038':'#4a3826');
    // a hundred and fifty years of nailing: heads in clusters where each year's boards went across, rust bleeding down from them
    for(let c=0;c<9;c++){const cy=24+c*7+(c%2)*2;for(let i=0;i<5+(c%3);i++){const x=58+((sgtH(c,i)%44)),y=cy+(sgtH(i,c)%4);if((x-56)%8<2)continue;
        const L=2+sgtH(x,y)%5;for(let j=1;j<=L;j++)P(x,y+1+j,1,1,j<L?'#7a3a1a':'#5a2a12');P(x-1,y-1,3,3,'#1a1414');P(x,y,2,2,'#7a7a80');P(x,y,1,1,'#c8c8d0');}}
    for(const [x,y] of [[62,38],[90,30],[74,58],[96,70],[66,76]]){P(x,y,2,2,'#000000');P(x,y+2,2,1,'#5a4430');}
    // the step and the shoes: side by side, neat, toes pointing in at the door
    P(44,88,72,8,ol);P(45,88,70,7,'#6a686e');P(45,88,70,1,'#9a98a0');P(45,94,70,1,'#3a3a40');
    // the shoes from behind: heels toward you, open, laced, the toes against the door
    // the shoes, from behind and a little above: scuffed buckle shoes, heels to you, toes to the door, a shade apart
    const shoe=(x,f)=>{const y=76;sgtBlob(P,[[x-.5,y+5,x+.5,y+11,5.4]],['#0e0806','#24160e','#3a2418','#5e3e2a']);P(x-2,y+1,3,1,'#6e4c34');P(x+2,y+2,1,1,'#6e4c34');
      sgtBlob(P,[[x-1.6,y+11,x+1.6,y+11,3]],['#6e4c34','#0a0604','#140c08','#140c08']);P(x-4,y+15,9,1,'#6e4c34');P(x-3,y+16,7,1,'#24160e');
      P(x-5,y+6,11,1,'#140c08');P(x-5,y+5,11,1,'#4a3020');const bx=f?x-6:x+4;P(bx,y+4,2,3,'#9a9aa2');P(bx,y+4,1,1,'#ffffff');P(x-5,y+18,11,2,'#00000055');};
    P(64,93,32,2,'#2a2a30');shoe(73,0);shoe(87,1);}),
  // the hollow tree: split like a door left ajar; inside, at a child's height, carved over and over, fresh: WHEN THE SUN IS IN
  p_tree:()=>sgtC('p_tree',160,104,(P)=>{const ol='#0a0806';
    for(let y=0;y<104;y++)for(let x=0;x<160;x++)P(x,y,1,1,y>90?(sgtH(x,y)<12?'#3a2e1c':'#2a2214'):(sgtH(x,y)<4?'#141a14':'#0e130f'));
    const L=y=>58-Math.round(Math.sin(y*.21)*2+Math.sin(y*.07)*3+(y>40?(y-40)*.05:0)),R=y=>102+Math.round(Math.sin(y*.17+1)*2+(y>40?(y-40)*.12:0));
    for(let y=0;y<92;y++){for(let x=34;x<128;x++){const l=L(y),r=R(y);let c;
        if(x<l||x>r+8){const g=sgtH(x,(y+(x*5)%9)>>3)%4;c=(x===34||x===127)?ol:['#b8b6ae','#a4a29a','#a4a29a','#8a8a84'][g];if(sgtH(x,7)%9===0)c='#6e6e68';if(x<38)c='#6a6a64';if(x>123)c='#5a5a54';}
        else if(x<=r){c=y<44?'#0a0705':(sgtH(x,y)<6?'#c8a878':'#d8bc8a');if(x===l)c='#4a3420';}
        else c=x<=r+2?'#4a3420':(sgtH(x,y)<8?'#a88a5e':'#bc9e70');
        P(x,y,1,1,c);}}
    for(let x=34;x<128;x++)for(let i=0;i<3;i++)P(x+i*2-2,90+i,1,1,'#4a3a26');
    // the carving, three times down the inside, fresh-cut wood round each letter, sap still running
    // carved into the wood: dark grooves with a lit lower lip, three goes at it, uneven, the last one over the second
    const cut='#2e1c0c',lip='#f6e2b8',fresh='#e6cc98';
    for(const [y,dx] of [[47,1],[61,4],[74,0]]){const x=L(y)+4+dx;for(let i=-1;i<42;i++)for(let j=-2;j<13;j++)if(x+i<R(y+j)-1&&!(i<1&&sgtH(i,y+j)%2)&&!(j>10&&sgtH(x+i,j)%3))P(x+i,y+j,1,1,fresh);
      let X=x;for(const [i,ch] of [...'WHEN THE'].entries()){const jy=y+((sgtH(i,y)%3)-1);sgtT(P,ch,X,jy+1,lip);sgtT(P,ch,X,jy,cut);X+=4+(sgtH(y,i)%2);}
      X=x+1;for(const [i,ch] of [...'SUN IS IN'].entries()){const jy=y+6+((sgtH(i+9,y)%3)-1);sgtT(P,ch,X,jy+1,lip);sgtT(P,ch,X,jy,cut);X+=4+(sgtH(y,i+5)%2);}}
    // the sap: welling out of the lowest letters and running down, glossy
    for(const [sx,sy,len] of [[L(80)+8,86,6],[L(80)+21,86,4],[L(80)+33,86,7]])
      {for(let j=0;j<len;j++){P(sx,sy+j,2,1,'#b8640e');P(sx,sy+j,1,1,'#e89a2a');}P(sx-1,sy+len,4,2,'#a8540a');P(sx,sy+len,1,1,'#ffd890');P(sx,sy+2,1,2,'#fff0c0');}
    for(let y=0;y<44;y+=6)P(L(y)+3,y+2,2,1,'#2a1c10');}),
  // the Black Lake: the dock, the sky, you standing there, and none of it in the water. Under the last plank, a cord pulled
  // straight down into the dark
  p_lake:()=>sgtC('p_lake',160,104,(P)=>{const lk=sgtLook(),ol='#060606';
    for(let y=0;y<104;y++)for(let x=0;x<160;x++){const tl=Math.round(18+Math.sin(x*.21)*3+Math.sin(x*.07)*2+((x*7)%5===0?-3:0));
      P(x,y,1,1,y<tl?(y<6?'#262a32':'#20242c'):y<26?'#0a0e0c':y<66?(sgtH(x,y)<2?'#0a0c0d':'#050607'):y===66?'#141c20':(y>90?'#04070a':'#060a0d'));}
    // the dock from the side: planks on top, the beam, the posts going down into the water
    for(let x=0;x<104;x++){P(x,50,1,1,'#b09a72');P(x,51,1,3,(x%9===0)?'#2a2014':'#8a7656');P(x,54,1,5,'#4a3a28');P(x,58,1,1,'#2a2014');}P(103,50,1,9,'#2a2014');
    for(const px of [6,46,86]){P(px,59,5,8,ol);P(px+1,59,3,7,'#4a3a28');P(px+1,59,1,7,'#6a5a40');}
    // you, at the end, looking down
    const sx=78,sh=lk.shirt,pa=lk.pants;P(sx-1,30,9,20,ol);P(sx,46,3,4,'#2a2018');P(sx+4,46,3,4,'#2a2018');P(sx,38,7,8,pa);P(sx,38,2,8,sgtShade(pa,1.2));
    P(sx-1,29,9,10,ol);P(sx,30,7,9,sh);P(sx,30,2,9,sgtShade(sh,1.25));P(sx+5,31,2,8,sgtShade(sh,.7));P(sx+1,22,7,8,ol);P(sx+2,23,5,6,'#d8a888');P(sx+2,22,5,3,lk.hair);P(sx+1,23,2,4,lk.hair);P(sx+6,26,1,1,'#2a1a10');
    // the cord: tied round the last plank, pulled tight, straight down; the only ring on the water
    P(98,54,5,4,'#c8b890');P(98,54,5,1,'#e8dcc0');for(let y=58;y<104;y++){P(100,y,1,1,y<66?'#c8b890':y<84?'#8a7c60':'#4a4234');}
    for(let a=0;a<6.283;a+=.2)P(Math.round(100+Math.cos(a)*6),Math.round(66+Math.sin(a)*1.2),1,1,'#2e3a40');}),
  // Wickham's noticeboard: the same notice pinned over itself for a hundred and fifty years; this year's on top, the date ringed
  p_wick:()=>sgtC('p_wick',160,104,(P)=>{const ol='#100a06';
    for(let y=0;y<104;y++)for(let x=0;x<160;x++)P(x,y,1,1,y>92?(sgtH(x,y)<10?'#4a4a48':'#3a3a3a'):sgtH(x,y)<4?'#1e2226':'#181c20');
    P(18,10,6,94,ol);P(136,10,6,94,ol);P(19,10,4,94,'#5a4028');P(137,10,4,94,'#4a3420');P(19,10,1,94,'#7a5a3a');
    P(12,2,136,10,ol);for(let x=13;x<147;x++)for(let y=3;y<11;y++)P(x,y,1,1,(x+((y>>2)%2)*3)%6===0?'#2a1a12':y<5?'#6a3a2a':'#4e2a1e');
    P(22,12,116,74,ol);P(23,13,114,72,'#6a5034');
    // the old notices underneath, yellowed and torn, every one the same
    for(let i=0;i<14;i++){const x=24+sgtH(i,3)%70,y=14+sgtH(i,9)%30,w=36+sgtH(i,5)%10,h=40;const c=['#a89868','#9a8a5a','#b8a878','#8a7a50'][i%4];P(x,y,w,h,'#2a2014');P(x+1,y+1,w-2,h-2,c);for(let k=0;k<5;k++)P(x+4,y+5+k*6,w-10,1,sgtShade(c,.7));P(x+w-4,y+h-5,3,4,'#6a5034');}
    // this year's
    const nx=46,ny=16;for(let i=12;i>0;i--){const c=['#c8b88a','#a89868','#d8c89a','#8a7a50'][i%4],ox=-1-(sgtH(i,1)%3),oy=-(i*.7|0)-1;P(nx+ox,ny+oy,66,1,c);P(nx+ox-(i%2),ny+oy,1,64,sgtShade(c,.85));P(nx+ox,ny+oy+1,66,1,'#3a2a18');}
    P(nx+2,ny+2,66,66,'#00000066');P(nx,ny,66,66,'#2a2014');P(nx+1,ny+1,64,64,'#ece4d0');P(nx+1,ny+1,64,1,'#fffaf0');P(nx+32,ny-1,3,3,'#a82a20');
    const ink='#1e1a24';let y=ny+5;for(const ln of ['THE DRAWING','WILL BE HELD','AT MARROW','HOLLOW CHURCH','ATTENDANCE','IS KIND'])
      {const w=ln.length*4-1;sgtT(P,ln,nx+33-Math.floor(w/2),y,ink);y+=7;}
    P(nx+8,y+1,48,1,'#8a8478');sgtT(P,(typeof st37DrawDate==='function'?st37DrawDate():'FALL 28'),nx+19,y+4,ink);for(let a=0;a<6.283;a+=.08)P(Math.round(nx+32+Math.cos(a)*17),Math.round(y+6+Math.sin(a)*5),1,1,'#b82a20');}),
});
const SGT_PLACE={
  marsh:{art:'p_marsh',cap:'It is your cabin. Not like it: yours, down to the porch board that sticks and the crack in the window shaped like a river. The note on the door is in Grandpa’s hand, addressed to you, dated thirty years ago.'},
  tithe:{art:'p_tithe',cap:'A house with no windows inside a ring of stones. Its door has been nailed shut a hundred and fifty times; the holes go right through. On the step, a child’s shoes, toes pointing in.'},
  tree:{art:'p_tree',cap:'The dead tree is split like a door left ajar. Carved inside, over and over, at the height of a child: WHEN THE SUN IS IN. The carving is fresh. The sap is still wet.'},
  lake:{art:'p_lake',cap:'The water reflects nothing. Not the dock, not the sky, not you. Under the last plank a cord goes straight down, pulled tight, the way a cord is when someone at the other end is holding on.'},
  wick:{art:'p_wick',cap:'Wickham’s noticeboard: the same notice, pinned over itself every year for a hundred and fifty years. THE DRAWING WILL BE HELD AT MARROW HOLLOW CHURCH. This year’s has your birthday on it.'},
};
// a chapter-two place: the screen goes in on it instead of a page of text (false: nothing opened, the page comes instead)
function stPlaceSight(p,fin){const d=SGT_PLACE[p&&p.k];if(!d||!SGT_ART[d.art]||typeof ruOpen!=='function')return false;let img=null;try{img=SGT_ART[d.art]();}catch(e){return false;}if(!img)return false;
  ruOpen({x:p.x,z:p.z,_sight:{img,fx:d.fx||{}}},d.cap);if(!RU.on)return false;RU.after=fin||null;return true;}
// ---- which beats are sights, what to show, and the one line that stays underneath (the beat's own takeaway)
const SGT_BEATS={deer:{sp:[['g_deer_open',0,0]],fx:{pulse:[36,8],flies:5,ribs:1}},graves:{art:'graves',fx:{flies:3}},crypt:{art:'crypt'},
  cold:{sp:[['g_hooks',0,0]],fx:{drip:1}},yourgrave:{art:'yourgrave',fx:{flies:2}},jars:{art:'jars'},
  well:{art:'well',fx:{drip:1}},orchard:{draw:'orchard'},quarry:{draw:'quarry'},scare:{draw:'scare'},rehearsal:{art:'rehearsal'},
  birches:{art:'birches'},fen:{art:'fen',fx:{flies:2}},lookout:{art:'lookout'},drowned:{art:'drowned'},corn:{art:'corn'}};
function sgtImage(id){const d=SGT_BEATS[id];if(!d)return null;if(d.art&&SGT_ART[d.art])return SGT_ART[d.art]();if(d.draw&&SGT_DRAW[d.draw])return SGT_DRAW[d.draw]();if(d.sp)return sgtSprites('beat_'+id,d.sp,d.paint);return null;}
// in the open small grave: a shape wrapped in a bedsheet, soaked dark from the inside, a jar label pinned to its chest
function sgtWrapped(P,pos){const p=pos.g_grave;if(!p)return;const [gx,gy]=p;for(let y=0;y<11;y++)for(let x=0;x<26;x++){const e=((x-13)/13)**2+((y-5.5)/5.6)**2;if(e>1)continue;const soak=((x*5+y*7)%11)/11+(x>8&&x<20?.4:0);
    P(gx+14+x,gy+10+y,1,1,e>.8?'#3a2a20':soak>.9?'#4a0c08':soak>.6?'#7a3428':y<3?'#e8e0d0':'#c8bca8');}P(gx+21,gy+13,5,4,'#f4ecd8');P(gx+21,gy+13,5,1,'#ffffff');P(gx+22,gy+15,3,1,'#6a5a4a');}
// in your grave: a body in your clothes, grey-haired, the face gone to the teeth
function sgtDouble(P,pos){const p=pos.g_grave;if(!p)return;const [gx,gy]=p;const L=(typeof S!=='undefined'&&S.look)||{};const top=/^#[0-9a-f]{6}$/i.test(L.shirt||'')?L.shirt:'#a83a2a';
  P(gx+14,gy+11,22,8,'#14100c');P(gx+15,gy+12,14,6,top);P(gx+29,gy+12,6,6,'#3a3a4a');P(gx+12,gy+11,5,8,'#9a9a98');P(gx+12,gy+11,5,2,'#c8c8c4');P(gx+13,gy+15,3,1,'#f0ead8');P(gx+14,gy+15,1,1,'#14100c');P(gx+20,gy+18,4,2,'#d8c0a0');}
// ---- the close-up itself: a picture of the thing, on the blurred world, with a little life in it
{const _rs=ruSpec;ruSpec=function(o,cap){if(o&&o._sight)return Object.assign({kind:'sight',seed:1,cap:cap||''},o._sight);return _rs.apply(this,arguments);};}
{const _rd=ruDraw;ruDraw=function(g,W,H,spec){if(spec.kind!=='sight')return _rd.apply(this,arguments);const im=spec.img;if(!im)return {top:0,bot:spec.gy};
  const k=im.width>=100?Math.max(1,Math.min(2,Math.floor(Math.min(W*.92/im.width,H*.7/im.height)))):Math.max(2,Math.min(3,Math.floor(Math.min(W*.74/im.width,H*.6/im.height)))),w=im.width*k,h=im.height*k,x=Math.round(W/2-w/2),y=Math.round(spec.gy-h);spec._k=k;spec._x=x;spec._y=y;
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(W/2,spec.gy-2,w*.48,Math.max(4,k*3),0,0,6.283);g.fill();g.imageSmoothingEnabled=false;g.drawImage(im,x,y,w,h);
  if(spec.fx&&spec.fx.ribs){const cx=x+w*.5,cy=y+h*.55;g.strokeStyle='#f0e6d0';g.lineWidth=k;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+k*9,cy+k*3);g.moveTo(cx,cy);g.lineTo(cx+k*2,cy+k*7);g.stroke();g.fillStyle='#5a1408';g.fillRect(cx-k,cy-k,k*2,k*2);}   // the two ribs, set like clock hands
  return {top:y,bot:spec.gy+4};};}
{const _rf=ruFrame;ruFrame=function(){_rf.apply(this,arguments);const spec=RU.spec;if(!spec||spec.kind!=='sight'||!spec._k)return;const g=RU.g,t=RU.t,k=spec._k,x=spec._x,y=spec._y,im=spec.img,fx=spec.fx||{};
  if(fx.pulse){const [px,py]=fx.pulse,b=Math.pow(Math.max(0,Math.sin(t*2.2)),8);g.fillStyle='#c81e18';const r=Math.round(k*(1+b*1.4));g.fillRect(x+px*k-r,y+py*k-r,r*2,r*2);g.fillStyle='#ff6050';g.fillRect(x+px*k-r,y+py*k-r,Math.max(1,r),Math.max(1,r>>1));}
  if(fx.flies)for(let i=0;i<fx.flies;i++){const a=t*(1.6+i*.3)+i*2.1,lift=fx.pulse?Math.max(0,Math.sin(t*2.2+i))*6:0;const fx_=x+im.width*k*(.5+Math.cos(a)*.32),fy=y+im.height*k*(.35+Math.sin(a*1.3)*.2)-lift*k*.4;g.fillStyle='#0a0808';g.fillRect(Math.round(fx_),Math.round(fy),k,k);
    if(Math.sin(t*30+i)>0){g.fillStyle='#8a8a90';g.fillRect(Math.round(fx_)-k,Math.round(fy)-k,k,1);g.fillRect(Math.round(fx_)+k,Math.round(fy)-k,k,1);}}
  if(fx.drip)for(let i=0;i<3;i++){const ph=(t*.7+i*.37)%1,dx=x+im.width*k*(.3+i*.2),dy=y+im.height*k*.55+ph*im.height*k*.42;g.fillStyle='#7a0c0a';g.fillRect(Math.round(dx),Math.round(dy),k,k*2);}};}
{const _rc=ruClose;ruClose=function(){const cb=RU.after;RU.after=null;const r=_rc.apply(this,arguments);if(cb)setTimeout(cb,280);return r;};}
function sgtOpen(at,img,cap,fx,after){if(!img||typeof ruOpen!=='function'){after&&after();return false;}const o={x:at.x,z:at.z,_sight:{img,fx:fx||{}}};ruOpen(o,cap||'');if(!RU.on){after&&after();return false;}RU.after=after||null;return true;}
// ---- the story's sights
{const _sp=sgPlay;sgPlay=function(b){const d=SGT_BEATS[b.id];if(!d||b.npc||S.saga.done[b.id])return _sp.apply(this,arguments);const img=sgtImage(b.id);if(!img)return _sp.apply(this,arguments);
  S.saga.done[b.id]=S.day;const lore=sgVal(b.lore);
  const fin=()=>{addLore(lore);journalNote(`${sgVal(b.title)}.`);if(b.key){S.keyItems=S.keyItems||[];if(!S.keyItems.includes(b.key))S.keyItems.push(b.key);}sgFx(b.fx,b.hit||0);sgProps();
    const nx=sgCurrent();if(!nx&&b.gate==='c1')setTimeout(()=>toast('Now the peddler at the crossroads will sell you candles. After 7:30 pm.',3.6),900);};
  const objs=SGW.objs&&SGW.objs[b.id];const at=objs&&objs[0]?{x:objs[0].x,z:objs[0].z}:b.at();
  sgtOpen(at,img,lore,d.fx,fin);};}
// ---- a carcass out in the fields: the first of each kind comes up close; after that you only see it where it lies
const SGT_KILL={rabbit:{sp:[['g_spatter',10,4],['g_rabbit',0,0]],fx:{flies:3},cap:'Nothing has been eaten. It was killed and left, neatly, where you would walk.'},
  ribs:{sp:[['g_drag',-40,2],['g_ribs',0,0]],fx:{flies:2},cap:'Whatever did this carried the rest of it somewhere. The crows won’t go near the drag mark.'}};
function goreSight(k){const d=SGT_KILL[k.kind];if(!d||S.mode!=='play'||S.paused||(typeof H!=='undefined'&&H.state==='chase'))return false;const g=goreS();if(g.seen['sight_'+k.kind])return false;
  const img=sgtSprites('kill_'+k.kind,d.sp);if(!img)return false;g.seen['sight_'+k.kind]=1;return sgtOpen({x:k.x,z:k.z},img,d.cap,d.fx);}
// ---- #286: the three story finds that were still a card of words: Grandpa's calendar in the barn, the county line that brings you
// back to your own gate, and Sheriff Dunn's list with its photographs. (The ledger, the register, the intake book and the Covenant
// are things you read, so they still read.)
const sgtMask=(caps)=>(x,y)=>caps.some(c=>sgtSeg(x,y,c[0],c[1],c[2],c[3])<c[4]);
Object.assign(SGT_ART,{
  // inside the barn door: a hundred and fifty calendars nailed one over another, the top one with your birthday ringed in old red;
  // on the boards below, a chalk body your size filled with salt, a little smile drawn through it with a finger
  barncal:()=>sgtC('a_barncal',152,104,(P)=>{
    const BD=['#1a100a','#281a10','#352316','#40301c'];
    for(let y=0;y<70;y++)for(let x=0;x<152;x++){const b=Math.floor(x/13),u=x%13,n=sgtH(x,y+b*7);P(x,y,1,1,u===0?BD[0]:u===12?BD[1]:n<3?BD[1]:n>93?BD[3]:(b%2?BD[2]:sgtShade(BD[2],1.06)));}
    for(let i=0;i<152;i++){const y=Math.round(62-i*.34);P(i,y,1,5,'#2e2014');P(i,y,1,1,'#4a3422');P(i,y+5,1,1,'#120a06');}
    for(const [nx,ny] of [[6,6],[19,6],[32,6],[110,6],[123,6],[136,6]])P(nx,ny,1,1,'#7a7a80');
    const FL=['#1e140c','#2c1e12','#38281a','#463220'];
    for(let y=70;y<104;y++)for(let x=0;x<152;x++){const r=Math.floor((y-70)/7),v=(y-70)%7,n=sgtH(x+r*11,y);P(x,y,1,1,v===0?FL[0]:v===1?FL[3]:n<3?FL[0]:(r%2?FL[1]:FL[2]));}
    P(0,68,152,2,'#0e0804');P(0,70,152,1,'#2a1c10');
    // the stack, edges showing under the top page: the further down, the older and browner
    const cx=52,cy=5,cw=48,ch=50,AGE=['#d6caac','#c8b896','#b8a680','#a8946c','#98845c','#88744e','#786442','#6a5638','#5c4a30'];
    // a shadow under the whole stack, then each older page's edge in turn: a band of paper going brown toward the bottom
    P(cx-1,cy+ch+11,cw+3,2,'rgba(0,0,0,.45)');P(cx+cw+1,cy+3,2,ch+9,'rgba(0,0,0,.35)');
    for(let k=9;k>=1;k--){const c=AGE[k-1],sp=Math.ceil(k/2),ox=[0,1,-1,1,0,-1,1,0,-1][k-1];P(cx-sp+ox,cy+k,cw+sp*2,ch,c);P(cx-sp+ox,cy+ch+k-1,cw+sp*2,1,sgtShade(c,.78));P(cx-sp+ox,cy+k,1,ch,sgtShade(c,.85));
      if(k%3===0)P(cx+cw+sp+ox-6,cy+ch+k-2,6,2,sgtShade(c,1.14));if(k===5){P(cx-sp+ox,cy+ch+k-3,4,3,sgtShade(c,1.1));P(cx-sp+ox,cy+ch+k,4,1,'#140c06');}}
    P(cx-6,cy+ch+10,cw+12,1,'#140c06');P(cx-6,cy+5,1,ch+5,'#140c06');P(cx+cw+5,cy+5,1,ch+5,'#140c06');
    for(const nx of [cx-3,cx+cw+2])P(nx,cy+8,2,2,'#6a3a1c'),P(nx,cy+8,1,1,'#a86a3a');
    P(cx-1,cy-1,cw+2,ch+2,'#140c06');P(cx,cy,cw,ch,'#e6dcc2');P(cx,cy,cw,1,'#f6eedc');
    // the picture at the top of this year's page: a field, a red barn, the ridge
    P(cx+3,cy+3,cw-6,16,'#9aa6ac');P(cx+3,cy+12,cw-6,7,'#6a7a44');for(let x=0;x<cw-6;x++){const h=Math.round(3+Math.sin(x*.21)*2);P(cx+3+x,cy+12-h,1,h,'#4e5e3a');}
    P(cx+28,cy+11,9,6,'#8a2a20');P(cx+27,cy+10,11,1,'#5a1a14');P(cx+31,cy+14,3,3,'#3a1a10');P(cx+3,cy+18,cw-6,1,'#5a4a30');
    sgtT(P,'OCTOBER',cx+10,cy+21,'#3a2a1a');
    for(let r=0;r<5;r++)for(let c=0;c<7;c++){const X=cx+3+c*6,Y=cy+29+r*4;P(X,Y,6,4,'#d8ccb0');P(X+1,Y+1,4,2,'#e6dcc2');P(X+1,Y+1,1,1,'#7a6a52');}
    // the ring, in something that was red once, and where it ran
    {const X=cx+3+4*6+3,Y=cy+29+2*4+2;for(let a=0;a<6.283;a+=.08){P(X+Math.cos(a)*5,Y+Math.sin(a)*3.4,1,1,'#7a1a12');P(X+Math.cos(a)*5.6,Y+Math.sin(a)*3.9,1,1,'#5a1008');}P(X+3,Y+4,1,4,'#6a140c');P(X+3,Y+8,1,1,'#4a0c06');}
    // the nail through all of them
    P(cx+23,cy+1,3,3,'#2a2a2e');P(cx+23,cy+1,1,1,'#9a9aa2');
    // the chalk body, filled with salt
    const body=sgtMask([[47,86,47,86,5.6],[52,86,57,86,2.2],[58,85.5,82,86,6.4],[60,80,53,76,2.1],[53,76,46,78,1.9],[60,92,80,94,2.1],[82,83,111,81,2.8],[82,89,111,92,2.8],[111,81,114,78,2],[111,92,114,95,2]]);
    for(let y=72;y<103;y++)for(let x=36;x<120;x++){if(!body(x,y))continue;const edge=!body(x-1,y)||!body(x+1,y)||!body(x,y-1)||!body(x,y+1);const n=sgtH(x,y);P(x,y,1,1,edge?'#f6f2ea':n<22?'#bab6ae':n<55?'#d6d2ca':'#e8e4dc');}
    for(const [sx,sy] of [[44,79],[63,99],[90,96],[118,86],[71,77],[101,77],[40,93]])P(sx,sy,1,1,'#cfcbc3');
    for(const [sx,sy] of [[45,87],[46,88],[47,88],[48,88],[49,87]])P(sx,sy,1,1,'#3a2a1a');
    // the barn's own dark at the edges
    for(let y=0;y<104;y++)for(let x=0;x<152;x++){const d=Math.min(x,151-x,y,103-y);if(d<6)P(x,y,1,1,`rgba(0,0,0,${(6-d)*.07})`);}}),
  // the county line: LEAVING MARROW COUNTY, COME BACK SOON, two brown runs down the second board; and over the road, where the
  // highway should go on, your own mailbox and the farm sign, and the gravel lane printed with boot prints going out and coming back
  county:()=>sgtC('a_county',156,104,(P)=>{
    for(let y=0;y<34;y++)for(let x=0;x<156;x++)P(x,y,1,1,y<10?'#6e747c':y<22?'#7c828a':'#8a9096');
    const pine=(x,base,h,c)=>{for(let j=0;j<h;j++){const w=Math.round((j/h)*h*.32)+1;P(x-w,base-h+j,w*2+1,1,c);}};
    for(let x=-4;x<160;x+=7)pine(x+(sgtH(x,1)%4),40,14+sgtH(x,3)%10,'#2a3830');for(let x=0;x<160;x+=9)pine(x+3,42,10+sgtH(x,5)%7,'#1e2a24');
    for(let y=40;y<104;y++)for(let x=0;x<156;x++){const n=sgtH(x,y);P(x,y,1,1,n<8?'#3a4428':n>90?'#5a6436':'#4a5430');}
    // Route 9, across
    for(let y=50;y<62;y++)for(let x=0;x<156;x++){const n=sgtH(x,y);P(x,y,1,1,y===50||y===61?'#2e2e30':n<10?'#3a3a3e':'#46464a');}for(let x=4;x<156;x+=14)P(x,55,7,2,'#c8b860');
    // the lane, gravel, coming toward you from the road
    const lane=(x,y)=>{if(y<62)return false;const t=(y-62)/42;return x>98-t*22&&x<132+t*22;};
    for(let y=62;y<104;y++)for(let x=0;x<156;x++){if(!lane(x,y))continue;const n=sgtH(x,y);P(x,y,1,1,n<14?'#7a7266':n<40?'#9a9284':n>92?'#b8b0a2':'#8a8476');}
    // boot prints: the same boots, going out and coming back
    const boot=(x,y,up)=>{const c='#4e483e',d='#3e382e';const toe=up?0:5;P(x,y+toe,4,4,c);P(x+1,y+toe-(up?1:-4),2,1,'#b8b0a2');P(x+1,y+toe+1,2,2,d);P(x,y+(up?5:0),4,2,c);P(x+1,y+(up?6:1),2,1,d);};
    for(let i=0;i<4;i++){const y=64+i*10;boot(103+(i%2)*5+Math.round(i*-2),y,true);boot(122+(i%2)*5+Math.round(i*2.2),y+4,false);}
    // the mailbox and the farm sign at the mouth of the lane
    P(138,36,3,24,'#3a2a1a');P(138,36,1,24,'#4a3626');P(127,25,25,12,'#14100c');P(128,26,23,10,'#5a6470');P(128,26,23,1,'#8a949e');P(128,35,23,1,'#3a424c');P(152,22,2,8,'#a02a1a');P(150,22,3,2,'#a02a1a');sgtT(P,'MARSH',130,28,'#e8e0cc');
    P(96,26,2,34,'#3a2a1a');P(122,26,2,34,'#3a2a1a');P(92,16,36,13,'#14100c');P(93,17,34,11,'#d8ccb0');P(93,17,34,1,'#f0e6d0');sgtT(P,'HOLLOW',98,18,'#3a2414');sgtT(P,'ACRE',102,23,'#3a2414');
    // the county sign, close on the left
    P(14,30,3,44,'#2e2014');P(56,30,3,44,'#2e2014');P(14,30,1,44,'#4a3422');P(56,30,1,44,'#4a3422');
    const board=(y,h)=>{P(6,y-1,62,h+2,'#14100c');P(7,y,60,h,'#e4e0d6');P(7,y,60,1,'#ffffff');P(7,y+h-1,60,1,'#a8a49a');};
    board(10,15);sgtT(P,'LEAVING',23,12,'#1e3a22');sgtT(P,'MARROW COUNTY',11,18,'#1e3a22');
    board(27,9);sgtT(P,'COME BACK SOON',9,29,'#1e3a22');
    for(const sx of [24,46]){for(let y=27;y<46;y++){const w=y<36?2:1;P(sx+(y>40?1:0),y,w,1,y<36?'#6a2a14':'#5a2410');}P(sx,46,1,2,'#4a1c0c');}
    for(let y=0;y<104;y++)for(let x=0;x<156;x++){const d=Math.min(x,155-x,y,103-y);if(d<5)P(x,y,1,1,`rgba(0,0,0,${(5-d)*.06})`);}}),
  // Dunn's front door: the list pinned with a kitchen knife, a hundred and fifty names and yours last; beside it a photograph for
  // every year, a child with a candle on the church step, the eyes scratched out; the newest one is you, asleep, seen from the stove
  dunnlist:()=>sgtC('a_dunnlist',152,104,(P)=>{
    const DR=['#1a2420','#24302a','#2e3c34','#3a4a40'];
    for(let y=0;y<104;y++)for(let x=0;x<152;x++){const n=sgtH(x,y);P(x,y,1,1,n<6?DR[1]:n>94?DR[3]:DR[2]);}
    for(const [px,py,pw,ph] of [[6,4,62,96],[74,4,72,96]]){P(px,py,pw,1,DR[0]);P(px,py,1,ph,DR[0]);P(px,py+ph-1,pw,1,DR[3]);P(px+pw-1,py,1,ph,DR[3]);}
    // the list
    const lx=12,ly=10;P(lx-1,ly-1,52,82,'#140c06');P(lx,ly,50,80,'#e8e0cc');P(lx,ly,50,1,'#f8f2e2');P(lx,ly+79,50,1,'#b8ae98');
    sgtT(P,'1871 MARSH',lx+4,ly+5,'#2a2018');
    for(let r=0;r<12;r++){const y=ly+13+r*4,w=16+sgtH(r,7)%22;P(lx+4,y,10,1,'#8a8070');P(lx+16,y,w,1,'#6a6050');}
    P(lx+4,ly+63,40,1,'#8a8070');sgtT(P,sgtName().slice(0,9),lx+4,ly+68,'#5a1410');P(lx+4,ly+74,4*Math.min(9,sgtName().length),1,'#5a1410');
    // the kitchen knife through it
    for(let t=0;t<10;t++){const x=lx+44+t,y=ly+3-Math.round(t*.5);P(x,y,1,3,t<2?'#6a7078':'#b0b6be');P(x,y,1,1,'#e8ecf2');}P(lx+43,ly+3,2,2,'#2a1c10');P(lx+40,ly+2,4,4,'rgba(0,0,0,.25)');   // the blade going in, the slit it cut
    P(lx+54,ly-4,3,6,'#d0d4da');P(lx+54,ly-4,1,6,'#f0f2f6');   // the bolster
    for(let t=0;t<15;t++){const x=lx+57+t,y=ly-5-Math.round(t*.5);P(x,y,1,5,t%5===0?'#1a0e08':'#3a2414');P(x,y,1,1,'#5a3820');P(x+1,y+5,1,1,'rgba(0,0,0,.35)');}P(lx+61,ly-6,1,1,'#e8c060');P(lx+67,ly-9,1,1,'#e8c060');
    // the photographs, one a year
    const SEP=[['#c8b48c','#a8946c','#8a7656','#e8dcbc'],['#b8a07a','#988060','#7a6448','#e4d6b4'],['#a88e68','#8a7254','#6a5640','#e0d0ac'],['#9a8060','#7a6448','#5a4834','#dccaa4'],['#8a7254','#6a5640','#4a3a2a','#d8c49c'],['#7a6448','#5a4834','#3a2e22','#d4be94'],['#6a5640','#4a3a2a','#2a2018','#d0b88c']];
    const KIDS=[{h:0,hair:'#2a1a10',dress:'#2a2018',tall:0},{h:1,hair:'#c8a050',dress:'#4a3a2a',tall:2},{h:2,hair:'#3a2a1a',dress:'#e8e0cc',tall:-1},{h:0,hair:'#7a4a24',dress:'#3a2a3a',tall:1},{h:1,hair:'#1a1410',dress:'#5a4a34',tall:3},{h:2,hair:'#a87a40',dress:'#2a2420',tall:0},{h:0,hair:'#4a3020',dress:'#6a5a48',tall:-2}];
    const YRS=['1951','1958','1964','1971','1979','1986','1994'];
    const kid=(X,Y,W,H,i)=>{const T=SEP[i],k=KIDS[i];P(X,Y,W,H,T[1]);P(X+2,Y,W-4,H-6,T[2]);P(X+4,Y+1,W-8,H-7,sgtShade(T[2],.7));   // the church door behind
      P(X,Y+H-6,W,3,T[0]);P(X,Y+H-3,W,3,T[1]);P(X,Y+H-6,W,1,sgtShade(T[0],1.1));const c=X+Math.floor(W/2)-3,top=Y+H-19-k.tall;const tone=v=>sgtShade(v,.6+i*.02);
      P(c,top+6,7,13+k.tall-5,tone(k.dress));if(k.dress==='#e8e0cc')P(c,top+6,7,1,'#c8bca8');else P(c+2,top+6,3,2,'#e8e0cc');P(c+1,Y+H-5,2,2,'#2a2018');P(c+4,Y+H-5,2,2,'#2a2018');
      P(c+1,top,5,6,'#c8a888');P(c+1,top-1,5,2,tone(k.hair));if(k.h===1)P(c,top,1,5,tone(k.hair)),P(c+6,top,1,5,tone(k.hair));if(k.h===2)P(c+1,top,2,2,tone(k.hair));
      for(const [dx,dy] of [[0,1],[1,2],[2,3],[3,1],[4,2],[5,3],[6,2],[2,1],[5,1]])P(c+dx,top+dy,1,1,(dx+dy)%3?'#f4eedc':'#d8ccb4');   // the eyes gouged out with a pin, one stroke across
      P(c+7,top+8,1,4,'#e8dcc0');P(c+7,top+7,1,1,'#ffd860');P(c+6,top+10,2,1,'#c8a888');};
    const photo=(x,y,w,h,i)=>{P(x+1,y+1,w,h,'rgba(0,0,0,.45)');P(x,y,w,h,SEP[i][3]);kid(x+2,y+4,w-4,h-9,i);sgtT(P,YRS[i].slice(2),x+w-10,y+h-5,'#5a4a3a');P(x+Math.floor(w/2)-1,y+1,2,2,'#a8281c');P(x+Math.floor(w/2)-1,y+1,1,1,'#e86a5a');};
    let i=0;for(let r=0;r<2;r++)for(let c=0;c<3;c++){photo(80+c*21+(i%2),7+r*29+(i%3===1?1:0),19,27,i);i++;}photo(80,66,19,27,6);
    // the newest: colour, at night, you in your bed, the edge of the stove in the corner of the frame
    {const x=102,y=60,w=42,h=36;P(x+2,y+2,w,h,'rgba(0,0,0,.5)');P(x,y,w,h,'#f4f0e6');const X=x+2,Y=y+2,W=w-4,H=h-7;P(X,Y,W,H,'#1a2030');
      P(X+3,Y+14,W-6,12,'#3a3e52');P(X+3,Y+14,W-6,1,'#5a6078');P(X+4,Y+10,10,6,'#c8c4b8');const L=sgtLook();P(X+5,Y+9,8,5,L.hair);P(X+7,Y+12,4,3,'#c8a888');
      P(X+12,Y+15,20,8,'#6a5a8a');P(X+12,Y+15,20,1,'#8a7aaa');P(X,Y+H-8,9,8,'#0c0c10');P(X+1,Y+H-6,6,2,'#c86a20');P(X+2,Y+H-5,3,1,'#ffb050');
      P(x+Math.floor(w/2),y,2,2,'#a8281c');P(x+Math.floor(w/2),y,1,1,'#e86a5a');}
    for(let y=0;y<104;y++)for(let x=0;x<152;x++){const d=Math.min(x,151-x,y,103-y);if(d<5)P(x,y,1,1,`rgba(0,0,0,${(5-d)*.06})`);}})});
Object.assign(SGT_BEATS,{barn:{art:'barncal'},county:{art:'county'},list:{art:'dunnlist',fx:{}}});
// the county line still sends you home once you've seen it
{const _sp=sgPlay;sgPlay=function(b){if(!b||!b.home||S.saga.done[b.id]||!SGT_BEATS[b.id])return _sp.apply(this,arguments);
  const r=_sp.apply(this,arguments);const after=RU.after;RU.after=()=>{if(after)after();if(typeof rgHome==='function')rgHome('The farm sign goes by. HOLLOW ACRE. You never turned round.');};return r;};}
