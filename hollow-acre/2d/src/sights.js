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
  rehearsal:()=>sgtC('rehearsal',56,64,(P)=>{const L=(typeof S!=='undefined'&&S.look)||{};const top=/^#[0-9a-f]{6}$/i.test(L.top||'')?L.top:'#a83a2a';
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
    const L=(typeof S!=='undefined'&&S.look)||{},top=/^#[0-9a-f]{6}$/i.test(L.top||'')?L.top:'#a83a2a',T=[sgtShade(top,.45),sgtShade(top,.7),top,sgtShade(top,1.25)];const y0=60,o='#120c08';
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
    const L=(typeof S!=='undefined'&&S.look)||{},top=/^#[0-9a-f]{6}$/i.test(L.top||'')?L.top:'#a83a2a',T=[sgtShade(top,.45),sgtShade(top,.7),top,sgtShade(top,1.25)];const cx=75,o='#120c08';
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
// ---- which beats are sights, what to show, and the one line that stays underneath (the beat's own takeaway)
const SGT_BEATS={deer:{sp:[['g_deer_open',0,0]],fx:{pulse:[36,8],flies:5,ribs:1}},graves:{art:'graves',fx:{flies:3}},crypt:{art:'crypt'},
  cold:{sp:[['g_hooks',0,0]],fx:{drip:1}},yourgrave:{art:'yourgrave',fx:{flies:2}},jars:{art:'jars'},
  well:{art:'well',fx:{drip:1}},orchard:{draw:'orchard'},quarry:{draw:'quarry'},scare:{draw:'scare'},rehearsal:{art:'rehearsal'}};
function sgtImage(id){const d=SGT_BEATS[id];if(!d)return null;if(d.art&&SGT_ART[d.art])return SGT_ART[d.art]();if(d.draw&&SGT_DRAW[d.draw])return SGT_DRAW[d.draw]();if(d.sp)return sgtSprites('beat_'+id,d.sp,d.paint);return null;}
// in the open small grave: a shape wrapped in a bedsheet, soaked dark from the inside, a jar label pinned to its chest
function sgtWrapped(P,pos){const p=pos.g_grave;if(!p)return;const [gx,gy]=p;for(let y=0;y<11;y++)for(let x=0;x<26;x++){const e=((x-13)/13)**2+((y-5.5)/5.6)**2;if(e>1)continue;const soak=((x*5+y*7)%11)/11+(x>8&&x<20?.4:0);
    P(gx+14+x,gy+10+y,1,1,e>.8?'#3a2a20':soak>.9?'#4a0c08':soak>.6?'#7a3428':y<3?'#e8e0d0':'#c8bca8');}P(gx+21,gy+13,5,4,'#f4ecd8');P(gx+21,gy+13,5,1,'#ffffff');P(gx+22,gy+15,3,1,'#6a5a4a');}
// in your grave: a body in your clothes, grey-haired, the face gone to the teeth
function sgtDouble(P,pos){const p=pos.g_grave;if(!p)return;const [gx,gy]=p;const L=(typeof S!=='undefined'&&S.look)||{};const top=/^#[0-9a-f]{6}$/i.test(L.top||'')?L.top:'#a83a2a';
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
