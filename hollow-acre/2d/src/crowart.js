/* ================= the crows, drawn by hand. The graveyard flock and the crow that comes down where you just stood were
   an 8x5 block with a 4x4 head: at 1x a black brick. Now each is a hand-placed crow (tools/px/crow/frames.py, the .pxg
   files beside it): side view facing right, mirrored for left; standing and watching, pecking, a hop, the two wing
   beats of flight and a landing flare with the legs down. Black on a hue-shifted ramp (plum shadow, indigo body, a cool
   blue sheen on the crown and the shoulder), a bold violet-black outline that lightens where the top-left light falls,
   a grey horn beak with a lit ridge, a pale eye, horn legs, and a drop shadow that shrinks and fades as it climbs.
   Every frame is drawn once onto its own small canvas for each facing, so a crow costs two drawImage calls a frame
   (shadow, bird) and allocates nothing. Same call and states as before: b.st 'peck'|'hop'|'fly'|'land', b.dir +-1,
   b.h height, b.ph phase. Pigeons (anything not b.kind 'crow') keep the original drawing. ================= */
{const ambBirdOld=ambBird;
 const CRW_PAL={o:'#0a0810',l:'#231f35','1':'#160f1b','2':'#211a2c','3':'#322d4a','4':'#4a4b70','5':'#6d7cae',b:'#2f2a33',B:'#6d6878',e:'#d4b464',F:'#575262'};
 const CRW_ROWS={
 stand:[9,14,[
  '.........llll.....',
  '........l4554oo...',
  '........l443e2BBo.',
  '........l33332bbBb',
  '.......l553322boo.',
  '.....l45553222o...',
  '....l444331222o...',
  '..ll344331222o....',
  'll31433112221o....',
  'o23212111111o.....',
  'oooo.o11111o......',
  '.......o1o1o......',
  '........o.b.......',
  '........o.F.......',
  '.......ooobFb.....']],
 peck:[9,14,[
  '..................',
  '..................',
  '..................',
  '..................',
  '..................',
  'lll...............',
  'o33lllllll........',
  '.o2144554443ll....',
  '..o21333344332l...',
  '...o11222233334l..',
  '....o111122213e2l.',
  '.....o11111o2222Bo',
  '.......o1o1ooooobB',
  '........o.b....obb',
  '.......ooobFb...ob']],
 hop:[9,12,[
  '.........llll.....',
  '........l4554oo...',
  '........l443e2BBo.',
  '........l33332bbBb',
  '.......l553322boo.',
  '.....l45553222o...',
  '....l444331222o...',
  '..ll344331222o....',
  'll31433112221o....',
  'o23212111111o.....',
  'oooo.o11111o......',
  '.......obbFo......',
  '........ooo.......',
  '..................',
  '..................']],
 fly_up:[10,13,[
  '.........o...........',
  '.......o.4o..........',
  '.....o.3o4o..........',
  '...o.3o3o44o.........',
  '..l3o334443o.........',
  '..l43344332o.........',
  '...l3443442o.........',
  '....l345543ollll.....',
  '.lll.l33454l4554oo...',
  'l33323334433443e2BBo.',
  'o3222233333333332bbBb',
  'o2211122233332221boo.',
  '.o11oo111222111o.....',
  '..oo..ooooooooo......']],
 fly_dn:[10,10,[
  '.....................',
  '.....................',
  '.....................',
  '.....................',
  '............llll.....',
  '.lll.lllllll4554oo...',
  'l33323445543443e2BBo.',
  'o3222334554332222bbBb',
  'o2211o34433222211boo.',
  '.o11oo4554432111o....',
  '..oo.o4443332ooo.....',
  '.....o4433322o.......',
  '.....o3343322o.......',
  '.....o334332o........',
  '.....o3o34o3o........',
  '......o.o3.3o........',
  '.........o.3o........',
  '...........o.........']],
 land:[11,16,[
  '.........o...........',
  '.......o.4o..........',
  '.....o.3o4o..........',
  '...o.3o3o44o.........',
  '..l3o334443o.........',
  '..l43344332o.........',
  '...l3443442o.........',
  '....l345543ollll.....',
  '.lll.l33454l4554oo...',
  'l33323334433443e2BBo.',
  'o3222233333333332bbBb',
  'o2211122233332221boo.',
  '.o11oo111222111o.....',
  '..oo..oooo1o1oo......',
  '..........o.b........',
  '...........o.b.......',
  '...........oobFb.....']]};
 /* drop shadows, LPC #322125: on the ground, low in the air, high in the air */
 const CRW_SH=[[['.xxxxxxx.','xxxxxxxxx','.xxxxxxx.'],.6],[['.xxxxx.','xxxxxxx','.xxxxx.'],.4],[['.xxx.','xxxxx'],.25]];
 let CRW=null;
 function crwCanvas(rows,flip,col){const w=rows[0].length,h=rows.length,c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=rows[y][x];if(ch==='.')continue;g.fillStyle=col||CRW_PAL[ch];g.fillRect(flip?w-1-x:x,y,1,1);}return c;}
 function crwBuild(){const o={};for(const k in CRW_ROWS){const [ax,ay,rows]=CRW_ROWS[k];o[k]={c:[crwCanvas(rows,0),crwCanvas(rows,1)],ax,ay,w:rows[0].length};}
   o.sh=CRW_SH.map(([rows,a])=>crwCanvas(rows,0,`rgba(50,33,37,${a})`));return o;}
 ambBird=function(b,X,Y){if(b.kind!=='crow')return ambBirdOld(b,X,Y);
   if(!CRW)CRW=crwBuild();
   const g=ctx2,t=performance.now(),ph=b.ph||0,h=Math.max(0,Math.round(b.h||0)),L=b.dir<0?1:0;let f=CRW.stand,lift=0;
   if(b.st==='fly'||(b.st==='land'&&h>16))f=Math.sin(t/60+ph)>0?CRW.fly_up:CRW.fly_dn;   /* the same beat the old wings used */
   else if(b.st==='land'&&h>=3)f=CRW.land;                                                  /* flare, legs down, just before it lands */
   else if(b.st==='hop'){const p=b.t>0&&b.t<.3?1-b.t/.3:0;lift=Math.round(Math.sin(p*Math.PI)*3);if(lift>0)f=CRW.hop;}
   else if(b.st==='peck'&&Math.sin(t/180+ph)>.6)f=CRW.peck;                                  /* the same peck rhythm as before */
   const s=CRW.sh[h<4?0:h<24?1:2];g.drawImage(s,X-(s.width>>1),Y-2);
   g.drawImage(f.c[L],X-(L?f.w-1-f.ax:f.ax),Y-1-f.ay-h-lift);};}
