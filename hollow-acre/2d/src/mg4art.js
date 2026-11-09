/* ================= the places you make things, drawn for the 320x180 stage: the workshop, the kitchen, the forge, the sewing room,
   the yard and the barn. Each has its own light: a window, a lantern, the fire. ================= */
const MG4ART={
  cache:{},
  fire(K,x0,y0,w,h,heat,t,clip){const g=K.g,F=['#fff8d8','#fce07c','#f8b83c','#f08a1c','#d8541c','#a82c0c','#6a1806'];if(clip){g.save();g.beginPath();g.rect(clip[0],clip[1],clip[2],clip[3]);g.clip();}
    heat=Math.max(.05,heat);for(let x=0;x<w;x+=2){const u=x/w,env=Math.pow(Math.sin(Math.PI*Math.min(1,Math.max(0,u*1.04-.02))),.55);
      const n=Math.sin(x*.31+t*7.3)*.45+Math.sin(x*.17-t*4.1)*.3+Math.sin(x*.71+t*12.7)*.25;const H=Math.max(1,h*heat*env*(.62+.38*n));
      const bands=[[0,.18,0],[.18,.36,1],[.36,.55,2],[.55,.72,3],[.72,.86,4],[.86,.95,5],[.95,1,6]];
      for(const [a,b,c] of bands){const y1=y0-H*a,y2=y0-H*b;K.px(x0+x,Math.round(y2),2,Math.max(1,Math.round(y1-y2)),F[c===0&&env<.6?1:c]);}
      if(n>.55&&H>4){const fy=y0-H-3-((t*40+x*3)%6);K.px(x0+x,fy,1,2,F[4]);}}
    g.globalAlpha=.55;K.px(x0,y0-2,w,2,F[0]);g.globalAlpha=1;if(clip)g.restore();},
  // the still parts of a room are drawn once into a canvas, then lit and animated on top every frame
  base(name,draw){if(this.cache[name])return this.cache[name];const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const K=caKit(g,320,180);K.g=g;draw(K,g);MG4ART.despeck(g,320,180);return this.cache[name]=c;},
  despeck(g,w,h){const d=g.getImageData(0,0,w,h),a=d.data,o=new Uint8ClampedArray(a);const at=(x,y)=>((y*w+x)<<2);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=at(x,y),n=[at(x-1,y),at(x+1,y),at(x,y-1),at(x,y+1)];
    const same=n.every(j=>o[j]===o[n[0]]&&o[j+1]===o[n[0]+1]&&o[j+2]===o[n[0]+2]);if(same&&(o[i]!==o[n[0]]||o[i+1]!==o[n[0]+1]||o[i+2]!==o[n[0]+2])){a[i]=o[n[0]];a[i+1]=o[n[0]+1];a[i+2]=o[n[0]+2];}}g.putImageData(d,0,0);},
  tool(K,x,y,kind){const I=CA_P.iron,W=CA_P.wood;
    if(kind==='saw'){for(let i=0;i<34;i++){const h=8-i*.12;K.px(x+i,y+1,1,h,I[4+(i%3===0?1:0)]);K.px(x+i,y+1+h,1,1,(i%2)?I[2]:I[3]);}K.px(x,y,34,1,I[6]);K.px(x-10,y-1,11,10,W[4]);K.px(x-10,y-1,11,2,W[6]);K.px(x-7,y+2,5,4,W[1]);}
    else if(kind==='square'){K.px(x,y,3,28,I[5]);K.px(x,y+25,22,3,I[5]);K.px(x,y,1,28,I[7]);for(let k=0;k<6;k++)K.px(x+1,y+3+k*4,1,1,I[2]);}
    else if(kind==='plane'){K.px(x,y+4,22,6,W[5]);K.px(x,y+4,22,1,W[7]);K.px(x+4,y,8,5,W[4]);K.px(x+14,y+1,4,4,W[3]);K.px(x+2,y+10,18,2,I[3]);}
    else if(kind==='mallet'){K.px(x,y,14,8,W[5]);K.px(x,y,14,2,W[7]);K.px(x+12,y,2,8,W[3]);K.px(x+6,y+8,3,16,W[4]);K.px(x+6,y+8,1,16,W[6]);}
    else if(kind==='chisel'){K.px(x,y,3,9,W[5]);K.px(x,y+9,3,10,I[5]);K.px(x,y+9,1,10,I[7]);K.px(x,y+18,3,1,I[2]);}
    else if(kind==='rope'){for(let a=0;a<6.28*3;a+=.12){const r=5+a*.4;K.px(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,2,2,a%1>.5?'#b89a5a':'#8a6e3a');}}},
  scene(K,name,t){const g=K.g;const b=this.base(name,(k,gg)=>this.paint[name]?this.paint[name](k,gg):this.paint.workshop(k,gg));g.drawImage(b,0,0);const A=this.anim[name];A&&A(K,t);},
  paint:{
    workshop(K){// the workshop at dusk: dark stained board walls, a window onto bare branches, the tool rail, shelves of tins, the lantern
      // (animated) as the light; the bench top lit along its edge, curled shavings on the floor (drawn, not sprinkled)
      const W=['#120a05','#1e1209','#2a190d','#362112','#422816','#4e301a','#5a381f','#664024'],O=['#160d06','#24160c','#321f10','#402814','#4e3119','#5c3a1e','#6a4324','#784c2a'];
      K.planks(0,0,320,118,W,14,21,true);for(let y=0;y<44;y++)K.pa(0,y,320,1,'#050302',.45-y/100);
      K.px(132,10,56,40,W[0]);for(let y=0;y<34;y++){const u=y/34;K.px(135,13+y,50,1,`rgb(${62+u*58|0},${66+u*40|0},${86+u*14|0})`);}
      for(let x=0;x<50;x++){const h=4+Math.round(Math.sin(x*.23)*2+Math.sin(x*.61));K.px(135+x,47-h,1,h,'#181a1c');}
      K.g.save();K.g.beginPath();K.g.rect(135,13,50,34);K.g.clip();K.line(172,47,170,24,'#1a1614',2);for(const [x1,y1,x2,y2] of [[171,32,160,22],[171,28,182,16],[176,21,184,14],[164,25,158,18],[171,24,174,13]])K.line(x1,y1,x2,y2,'#1a1614',1);K.g.restore();
      K.px(158,13,3,34,W[2]);K.px(135,28,50,3,W[2]);K.px(129,48,62,4,W[5]);K.px(129,48,62,1,W[7]);K.px(129,52,62,1,W[0]);
      K.px(10,12,104,4,O[3]);K.px(10,12,104,1,O[6]);for(let x=14;x<112;x+=10)K.px(x,13,2,2,O[1]);
      MG4ART.tool(K,22,20,'saw');MG4ART.tool(K,64,18,'square');MG4ART.tool(K,74,20,'chisel');MG4ART.tool(K,80,22,'chisel');MG4ART.tool(K,92,20,'mallet');
      MG4ART.tool(K,214,16,'plane');K.px(208,12,104,4,O[3]);K.px(208,12,104,1,O[6]);MG4ART.tool(K,282,20,'square');
      K.plank(216,58,92,4,O,4);K.px(216,58,92,1,O[7]);K.pa(216,62,92,3,'#000',.45);for(let i=0;i<7;i++){const jx=220+i*12;K.px(jx,46,9,12,['#5a3a1c','#3a4652','#6a2e20','#8a7438','#4a5228','#523040','#34465a'][i]);K.px(jx,46,9,2,'#4e5260');K.px(jx,46,1,12,'#ffffff30');K.px(jx+8,46,1,12,'#00000060');}
      K.plank(0,112,320,10,O,9);K.px(0,112,320,1,O[7]);K.planks(0,122,320,58,O,11,13);K.px(0,122,320,1,O[0]);K.pa(0,123,320,4,'#000',.45);
      K.metal(4,100,22,14,CA_P.iron,8);K.px(8,96,14,4,CA_P.iron[3]);
      const SH=[[[0,0,5],[5,-1,2],[6,-2,1],[4,-3,2],[3,-2,1]],[[0,0,7],[7,-1,1],[1,-1,2]],[[0,0,3],[3,1,3],[6,0,2],[1,-1,2]]],C=['#7a5c34','#9a7a48','#5a4228'];
      for(const [sx,sy,v] of [[44,149,0],[121,147,1],[198,160,2],[272,149,0]]){SH[v].forEach(([dx,dy,w],i)=>K.px(sx+dx,sy+dy,w,1,C[i%3===2?2:i%2?0:1]));K.px(sx,sy+1,SH[v][0][2],1,'#00000050');}
      for(let y=160;y<180;y++)K.pa(0,y,320,1,'#000',(y-160)/60);},
    kitchen(K){// the farmhouse kitchen at dusk: old cream tiles gone grey, a few stained or cracked, each lit on its top-left edge; a cold window;
      // dull copper pans, drying herbs, a shelf of jars; the oil lamp (animated) is the light; the counter with a lit top and its shadow
      const T=['#2a241e','#5e584c','#6e675a','#7c7566','#8a8272','#968e7c'],W=['#140c06','#24160c','#342012','#442a18','#54361e','#644226','#744e2e','#845a36'],O=W;
      for(let y=0;y<112;y++)for(let x=0;x<320;x++){const tx=x%12,ty=y%12,cx=(x/12)|0,cy=(y/12)|0,n=K.H32(cx,cy,15);let c;
        if(tx===0||ty===0)c=T[0];else{let k=n>.9?2:n>.75?4:3;if(ty===1||tx===1)k++;if(ty===11||tx===11)k--;c=T[Math.max(1,Math.min(5,k))];}
        K.px(x,y,1,1,c);}
      for(let k=0;k<6;k++){const cx=((K.H32(k,1,19)*26)|0)*12,cy=((K.H32(k,2,19)*8)|0)*12;K.line(cx+3,cy+2,cx+6,cy+6,T[1],1);K.line(cx+6,cy+6,cx+5,cy+10,T[1],1);}
      for(let y=0;y<112;y++)K.pa(0,y,320,1,'#0a0604',.42-y/300);
      // the window: dusk, a black ridge of trees, a dark frame and sill
      K.px(18,12,62,44,W[1]);for(let y=0;y<38;y++){const u=y/38;K.px(21,15+y,56,1,`rgb(${70+u*60|0},${74+u*44|0},${96+u*16|0})`);}
      for(let x=0;x<56;x++){const h=6+Math.round(Math.sin(x*.21)*2+Math.sin(x*.53)*1.5+(x%9===4?3:0));K.px(21+x,53-h,1,h,'#161a1c');}
      K.px(47,15,3,38,W[2]);K.px(21,33,56,3,W[2]);K.px(15,55,68,4,W[5]);K.px(15,55,68,1,W[7]);K.px(15,59,68,1,W[0]);
      // dull copper pans on a rail
      const C=['#2a1208','#4a2210','#6a3418','#8a4a24','#a65e30','#b8743e','#c8885a','#d8a070'];K.px(116,5,88,2,'#3a3a40');K.px(116,5,88,1,'#5a5a62');
      for(let i=0;i<4;i++){const cx=128+i*21,r=5+(i%2)*2,cy=16+r;K.px(cx-1,7,2,2,'#2a2a30');K.px(cx-1,9,3,cy-r-9,C[2]);K.px(cx,9,1,cy-r-9,C[4]);
        for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y)/r;if(d>1)continue;let k=d>.82?(x+y<0?5:1):d>.7?1:(x-y>r*.6?2:x+y<-r*.4?4:3);if(Math.abs(x+y+r*.3)<1&&d<.65)k=6;K.px(cx+x,cy+y,1,1,C[k]);}}
      for(let i=0;i<3;i++){const hx=92+i*9;K.line(hx,4,hx,10,'#3a2e1a',1);for(let k=0;k<8;k++)K.px(hx-3+((k*3)%7),10+k*1.4,2,2,['#3a4a22','#4e5e2a','#2e3a1c'][k%3]);}
      // a shelf of jars, their glass catching the lamp
      K.px(222,48,90,5,W[4]);K.px(222,48,90,1,W[6]);K.pa(222,53,90,3,'#000',.4);
      for(let i=0;i<6;i++){const jx=226+i*14;K.px(jx,34,11,14,'#3a3430');K.px(jx+1,37,9,11,['#7a4220','#4e6a34','#8e7438','#6a3020','#9a8450','#7a7064'][i]);K.px(jx,32,11,2,'#6a5a3a');K.px(jx+1,35,1,12,'#c8c0b0');K.px(jx+9,35,1,12,'#1e1a16');}
      // the counter: a lit top edge, the front in dark boards, a shadow under the lip
      K.plank(0,112,320,8,M4.sh(O,1),5);K.px(0,112,320,1,O[7]);K.planks(0,120,320,60,O,8,11);K.px(0,120,320,1,O[0]);K.pa(0,121,320,4,'#000',.45);for(let y=160;y<180;y++)K.pa(0,y,320,1,'#000',(y-160)/60);},
    // the kitchen again, with the iron range in front: a cooktop with a burner ring, an oven door and a firebox
    stove(K){MG4ART.paint.kitchen(K);const I=CA_P.iron;K.pa(84,108,152,6,'#000',.35);
      for(let y=110;y<180;y++){const k=y<116?4:3;K.px(92,y,136,1,I[k]);}K.px(92,110,136,1,I[6]);K.px(92,110,1,70,I[5]);K.px(227,110,1,70,I[1]);
      K.metal(86,102,148,9,I,14);K.px(86,111,148,2,I[1]);K.ell(160,106,30,3,I[1]);K.ell(160,106,27,2,I[0]);for(let a=0;a<6.28;a+=.35)K.px(160+Math.cos(a)*22,106+Math.sin(a)*1.6,2,1,I[3]);
      K.px(102,122,58,46,I[1]);K.px(104,124,54,42,I[2]);K.px(104,124,54,1,I[5]);for(let k=0;k<3;k++)K.px(108,130+k*10,46,1,I[3]);K.metal(118,118,26,3,CA_P.brass);
      K.px(170,122,46,30,I[1]);K.px(172,124,42,26,'#160a04');K.metal(182,154,22,3,CA_P.brass);for(const kx of [100,118,200,218])K.ball(kx,115,2,CA_P.brass);
      K.px(92,172,136,8,I[1]);for(const lx of [96,220])K.px(lx,172,6,8,I[0]);},
    forge(K){// the smithy: soot-dark stone walls, a brick hearth blackened above its mouth, the hood and chimney, tongs and hammers on a rail,
      // a water barrel and a coal bin, and a floor of worn flagstones (no bright brick); the fire is the only light
      const ST=['#141216','#1e1c20','#28262a','#323034','#3e3b40','#4a464c','#58545a'],BR=['#1e0a08','#341410','#4a1e16','#5e2a1e','#723628','#864434'];
      K.stones(0,0,320,124,ST);for(let y=0;y<60;y++)K.pa(0,y,320,1,'#050404',.5-y/120);
      K.bricks(8,64,96,60,BR,14,6);for(let y=0;y<14;y++)K.pa(8,64+y,96,1,'#0a0604',.6-y/24);K.px(20,80,72,30,'#140804');
      K.px(4,52,104,12,'#2a2c34');K.metal(4,50,104,4,['#121418','#1e2026','#2c2e36','#3a3e48','#4a4e5a','#5e6270','#787c88','#9a9ea8']);K.px(30,0,52,50,'#1a1c22');K.px(30,0,4,50,'#2c2e36');K.px(78,0,4,50,'#101216');
      for(let i=0;i<4;i++){K.line(150+i*14,12,150+i*14,44,'#3a3e48',1);K.px(146+i*14,44,9,4,'#2c2e36');K.px(146+i*14,44,9,1,'#4e5260');}K.px(140,10,70,3,'#3a2416');K.px(140,10,70,1,'#5a3a22');
      const WD=['#140c06','#24160c','#342012','#442a18','#54361e','#644226','#744e2e','#845a36'];K.plank(262,82,40,42,WD,6,true);K.metal(260,86,44,3,['#121418','#1e2026','#2c2e36','#3a3e48','#4a4e5a','#5e6270','#787c88','#9a9ea8']);K.metal(260,112,44,3,['#121418','#1e2026','#2c2e36','#3a3e48','#4a4e5a','#5e6270','#787c88','#9a9ea8']);K.ell(282,84,19,4,'#141c24');K.ell(282,84,15,2,'#24343e');K.px(272,83,8,1,'#4a5a64');
      K.px(222,106,30,18,'#1e2026');K.px(222,106,30,1,'#3a3e48');for(let k=0;k<9;k++)K.px(224+((k*7)%24),102+(k%3),5,4,k%2?'#1a1a1c':'#262628'),K.px(225+((k*7)%24),102+(k%3),2,1,'#3a3a3e');
      // the floor: worn flagstones, each lit on its top edge, dark joints, soot by the hearth
      K.px(0,124,320,56,ST[2]);const FS=[[0,124,46,14],[46,124,58,12],[104,124,40,15],[144,124,64,13],[208,124,50,14],[258,124,62,12],[0,138,62,16],[62,136,48,18],[110,139,70,15],[180,137,56,17],[236,136,84,18],[0,154,40,26],[40,154,76,26],[116,154,58,26],[174,154,70,26],[244,154,76,26]];
      for(const [x,y,w,h] of FS){const k=K.H32(x,y,3)>.6?3:K.H32(x,y,4)>.5?2:1;K.px(x+1,y+1,w-2,h-2,ST[k+1]);K.px(x+1,y+1,w-2,1,ST[k+3]);K.px(x+1,y+h-2,w-2,1,ST[k]);K.px(x,y,w,1,ST[0]);K.px(x,y,1,h,ST[0]);}
      for(let y=124;y<150;y++)K.pa(0,y,120,1,'#0a0604',.35-(y-124)/80);K.px(0,124,320,2,ST[1]);for(let y=160;y<180;y++)K.pa(0,y,320,1,'#000',(y-160)/50);},
    sewing(K){// the sewing room at dusk: dark plum damask paper, heavy curtains at a cold window, a shelf of spools, a headless dress form
      // in the corner, the wainscot and the floorboards; one candle (animated) lights it
      const WP=['#160e14','#1e141c','#281a24','#32222e','#3e2a38','#4a3444'];
      K.px(0,0,320,100,WP[2]);for(let x=0;x<320;x+=48){K.px(x,0,1,100,WP[1]);}
      for(let r=0;r<5;r++)for(let c=0;c<14;c++){const x=10+c*24+(r%2)*12,y=8+r*20;K.px(x,y-3,1,7,WP[3]);K.px(x-3,y,7,1,WP[3]);K.px(x-1,y-1,3,3,WP[3]);K.px(x-2,y-2,1,1,WP[4]);K.px(x+2,y+2,1,1,WP[1]);K.px(x,y,1,1,WP[1]);}
      for(let y=0;y<30;y++)K.pa(0,y,320,1,'#000',.35-y/86);
      // the window: dusk outside, a cross bar, heavy dark-red curtains with long folds
      K.px(26,10,72,52,'#0e0a0c');for(let y=0;y<46;y++){const u=y/46;K.px(29,13+y,66,1,`rgb(${58+u*40|0},${66+u*30|0},${92+u*10|0})`);}
      for(let x=0;x<66;x++){const h=4+Math.round(Math.sin(x*.19)*2+Math.sin(x*.07)*2);K.px(29+x,59-h,1,h,'#1e2228');}K.px(61,13,2,46,'#0e0a0c');K.px(29,34,66,2,'#0e0a0c');K.px(22,62,80,3,'#3a2416');K.px(22,62,80,1,'#5a3a22');
      const CU=['#2a0c10','#3c1216','#50181c','#641e22','#7a2a2a'];for(const [cx,w] of [[18,18],[92,18]]){for(let x=0;x<w;x++){const f=Math.sin(x*.9)*.5+.5;K.px(cx+x,6,1,96,CU[1+Math.round(f*2)]);if(x%6===2)K.px(cx+x,6,1,96,CU[4]);if(x%6===4)K.px(cx+x,6,1,96,CU[0]);}K.px(cx,6,w,2,CU[0]);}
      K.px(14,4,100,3,'#3a2416');K.px(14,4,100,1,'#6a4a2a');
      // the shelf of spools, thread colours gone dusky
      K.px(196,62,104,4,'#4a2e1a');K.px(196,62,104,1,'#7a5432');K.pa(196,66,104,3,'#000',.4);
      for(let i=0;i<6;i++){const sx=202+i*16,C=['#7a3a30','#4e6478','#a88a40','#4e5e3a','#5e4070','#b8b0a0'][i];K.px(sx,42,11,3,'#6a4a2a');K.px(sx,59,11,3,'#5a3a20');K.px(sx+1,45,9,14,C);K.px(sx+1,45,2,14,'rgba(255,255,255,.18)');K.px(sx+8,45,1,14,'rgba(0,0,0,.35)');for(let y=47;y<58;y+=3)K.px(sx+1,y,9,1,'rgba(0,0,0,.18)');}
      // a headless dress form in the corner
      const DF=['#1a1612','#2a241e','#3a322a','#4a4036','#5a4e42','#6a5c4e'];K.px(285,100,2,14,'#2a1a0e');K.px(278,112,16,2,'#2a1a0e');K.px(278,112,16,1,'#4a3020');
      for(let y=0;y<44;y++){const w=Math.round(7+3*Math.sin(Math.min(1,y/16)*Math.PI*.5)-(y>18&&y<28?2:0)+(y>30?2:0));for(let x=-w;x<=w;x++){const u=x/w;K.px(286+x,56+y,1,1,DF[u<-.75?3:u<-.35?5:u<.2?4:u<.65?2:1]);}}K.px(284,52,5,4,DF[2]);K.px(284,52,5,1,DF[4]);
      for(let y=0;y<44;y++){const w=Math.round(9+4*Math.sin(Math.min(1,y/16)*Math.PI*.5)-(y>18&&y<28?3:0)+(y>30?2:0));for(let x=-w;x<=w;x++)K.px(297+x,56+y,1,1,DF[x<-w*.4?4:x>w*.5?1:3]);}K.px(295,52,5,4,DF[2]);
      // the wainscot and the floor
      K.px(0,100,320,14,'#2a1a10');K.px(0,100,320,1,'#4a3020');for(let x=4;x<320;x+=40){K.px(x,103,32,8,'#22150c');K.px(x,103,32,1,'#120a06');K.px(x,110,32,1,'#3a2618');}
      const FL=['#140a06','#1e1009','#28160c','#321c10','#3c2414','#462a18','#50321c','#5a3a22'];K.plank(0,114,320,8,FL,4);K.planks(0,122,320,58,FL,9,6);K.px(0,122,320,1,FL[0]);for(let y=160;y<180;y++)K.pa(0,y,320,1,'#000',(y-160)/60);},
    yard(K){// an autumn evening behind the farm, overcast and going cold: a low sky warming at the horizon, far ridges, the
      // tree line in dulled autumn colours, the barn with one lit window, the rail fence, the dark field, and the clamp hearth
      // in front with a spare woodpile on the left and a turf heap with a spade on the right
      const SKY=['#454c5e','#4f5566','#5a5e6e','#686a74','#7a7676','#8e8478','#a2907a'];for(let y=0;y<78;y++)K.px(0,y,320,1,SKY[Math.min(6,(y/11.5)|0)]);
      for(const [cx,cy,w,c,e] of [[46,16,110,'#5a6070','#727480'],[200,9,140,'#555b6c','#6c6e7a'],[292,27,90,'#676872','#857f7c'],[120,35,80,'#706e74','#8c8480']]){
        for(let i=0;i<w;i++){const u=i/w,h=Math.round(2+3*Math.sin(u*Math.PI)+Math.sin(u*9)*.8);K.px(cx-w/2+i,cy-h,1,h,c);K.px(cx-w/2+i,cy,1,1,e);}}
      const ridge=(base,amp,f,ph,body,edge)=>{for(let x=0;x<320;x++){const top=base-Math.round(amp*(.55+.45*Math.sin(x*f+ph))+amp*.3*Math.sin(x*f*2.7+ph*2));K.px(x,top,1,90-top,body);K.px(x,top,1,1,edge);}};
      ridge(60,10,.021,1.3,'#3c4456','#4a5264');ridge(68,7,.034,4.1,'#2e3a3a','#3a4846');
      // the tree line: each tree its own dulled autumn colour, lit from the low west sky, trunks between
      const TC=[['#1c100a','#3a1c0e','#582a14','#74401c','#8c5426','#a46a32'],['#1a140a','#382c10','#544416','#6e5c1c','#867224','#9c8a34'],
        ['#0e1610','#18241a','#223422','#2e4428','#3c5430','#4c6438'],['#180a10','#341420','#4c1c24','#64282a','#7a3a2e','#905034']];
      const tree=(tx,ty,sz,kind,C,far)=>{if(kind==='bare'){const c=far?'#2a2a30':'#1e1612';K.px(tx,ty-16*sz,1,16*sz+4,c);for(const [bx,by,bl,d] of [[0,-14,6,-1],[0,-10,7,1],[0,-6,5,-1],[0,-16,4,1]])K.line(tx,ty+by*sz,tx+d*bl*sz,ty+by*sz-bl*sz*.6,c,1);return;}
        if(kind==='pine'){const P=far?['#262c30','#2e363a']:['#101812','#18241a','#22302a'];K.px(tx,ty-2,2,6,'#1a120c');for(let k=0;k<4;k++){const w=(7-k*1.6)*sz,y0=ty-2-k*5*sz;for(let r=0;r<6*sz;r++){const ww=Math.round(w*(r/(6*sz)));K.px(tx+1-ww,y0-6*sz+r,ww*2,1,P[1]);K.px(tx+1-ww,y0-6*sz+r,1,1,P[P.length-1]);K.px(tx+ww,y0-6*sz+r,1,1,P[0]);}}return;}
        K.px(tx-1,ty,3,10,far?'#2a262a':'#20140c');for(let k=0;k<6;k++){const dx=(K.H32(tx,k,3)-.5)*16*sz,dy=-3-K.H32(k,tx,4)*10*sz,r=Math.max(3,Math.round((4+K.H32(tx+k,2,5)*4)*sz));K.ball(Math.round(tx+dx),Math.round(ty+dy),r,C);}};
      const FAR=[['#2a2a30','#34343a','#3e3e44','#48464c','#524e52','#5c5658']];
      for(let i=0;i<22;i++){const tx=(i*15+((i*11)%7))|0;tree(tx,70-((i*7)%4),.6+K.H32(i,1,8)*.3,K.H32(i,2,8)<.2?'pine':'leaf',FAR[0],1);}
      for(let i=0;i<17;i++){const tx=2+i*19+((i*13)%11),ty=76-((i*13)%7),h=K.H32(i,3,8);const kind=h<.12?'bare':h<.3?'pine':'leaf';tree(tx,ty,.75+K.H32(i,4,8)*.55,kind,TC[(i*5+1)%4],0);}
      // the barn: dark red boards, a slate roof, a white X on the door, one window lit
      K.px(230,52,44,26,'#5a1c16');for(let x=230;x<274;x+=4)K.px(x,52,1,26,'#44140e');K.px(272,52,2,26,'#36100c');K.px(230,52,1,26,'#6e2a1e');
      for(let i=0;i<10;i++)K.px(226+i,51-i,52-i*2,1,i<2?'#34343c':i<4?'#44444e':'#4e4e58');K.px(226,51,52,1,'#1c1c22');K.px(236,42,32,1,'#5e5e68');
      K.px(244,62,14,16,'#3a120e');K.line(245,63,257,77,'#a8a090',1);K.line(257,63,245,77,'#a8a090',1);K.px(239,55,7,5,'#1a0e08');K.px(240,56,5,3,'#e8b860');K.px(240,56,5,1,'#f8d890');
      // the rail fence, posts lit on the left, a shadow under each rail
      for(let x=6;x<320;x+=34){K.px(x,64,4,20,'#4e321c');K.px(x,64,1,20,'#6e4c2c');K.px(x+3,64,1,20,'#2a1a0c');K.px(x-1,63,6,1,'#86603a');}
      for(const y of [68,75]){K.px(0,y,320,2,'#5e3e22');K.px(0,y,320,1,'#7e5832');K.px(0,y+2,320,1,'#24160a');}
      // the field: three flat tones in broad soft patches (no speckle), darkening toward the viewer
      const G=['#161e12','#1c2616','#24301a','#2e3a1e','#3a4624','#4a542a'];
      const vn=(x,y,c,sd)=>{const gx=x/c,gy=y/c,i=Math.floor(gx),j=Math.floor(gy),fx=gx-i,fy=gy-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=K.H32(i,j,sd),b=K.H32(i+1,j,sd),c2=K.H32(i,j+1,sd),d=K.H32(i+1,j+1,sd);return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v;};
      for(let y=80;y<180;y++)for(let x=0;x<320;x++){const n=vn(x,y*2.2,56,9),k=(n>.62?4:n>.36?3:2)-(y>150?1:0);K.px(x,y,1,1,G[k]);}
      for(let y=80;y<86;y++)K.pa(0,y,320,1,'#000',.28-(y-80)*.04);
      // drawn tufts: a dark root, two lit blades, a straw seed head on some
      for(let i=0;i<28;i++){const x=(K.H32(i,1,21)*312)|0,y=86+((K.H32(i,2,21)*86)|0);if(Math.abs(x-160)<104&&y>136)continue;const k=y>150?2:3;
        K.px(x,y+2,5,1,G[k-1]);K.px(x+1,y,1,2,G[k+1]);K.px(x+3,y-1,1,3,G[k+1]);K.px(x+2,y+1,1,1,G[k]);K.px(x+1,y-1,1,1,G[k+2]);if(i%3===0){K.px(x+3,y-3,1,2,'#9a8a52');K.px(x+3,y-3,1,1,'#bca86a');}}
      // the hearth where the clamp is built: packed earth in a shallow ring, an old charred floor, a lit rim and a shadow below
      const E=['#140c08','#1e140c','#2a1c10','#3a2816','#4a341c','#5a4224','#6a502c'];
      for(let y=-20;y<=20;y++)for(let x=-100;x<=100;x++){const d=(x/100)**2+(y/20)**2;if(d>1)continue;const rim=d>.8;const l=-x/100*.3-y/20*.6;
        let k=rim?(y<0?5:2):d>.45?(l>.1?4:3):(l>.2?3:2);if(!rim&&d<.4&&K.H32((x+100)>>3,(y+20)>>2,5)>.6)k--;K.px(160+x,156+y,1,1,E[k]);}
      for(let x=-100;x<=100;x++){const y=Math.round(20*Math.sqrt(Math.max(0,1-(x/100)**2)));K.pa(160+x,157+y,1,2,'#000',.35);}
      for(const [ax,ay,w] of [[-30,-4,6],[22,6,5],[-8,10,4],[40,-8,4],[-52,4,5]]){K.px(160+ax,156+ay,w,1,'#5a5652');K.px(160+ax+1,156+ay-1,w-2,1,'#7a7470');}
      // the spare woodpile on the left: log ends in rows, rings on each, bark round the rim, the lit side up-left
      const END=['#3a2412','#6a4422','#8e6234','#ae7e46','#c89a5c','#dab276'];
      const lend=(cx,cy,r)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y)/r;if(d>1)continue;let k=d>.8?0:d>.62?(x+y<0?3:2):(Math.round(d*6)%2?4:3);if(d<.2)k=2;if(d<=.62&&x+y<-r*.5)k++;K.px(cx+x,cy+y,1,1,END[k]);}};
      K.pa(12,154,66,4,'#000',.4);for(const [x,y,r] of [[20,148,6],[33,149,6],[46,148,6],[59,149,6],[71,150,5],[26,137,6],[39,137,6],[52,137,6],[65,139,5],[33,126,6],[46,126,6],[58,128,5],[40,115,6],[52,117,5]])lend(x,y,r);
      // the turf heap on the right: cut sods stacked in three rows, grass on top, earth faces lit on the left; a spade in it
      K.pa(240,155,64,4,'#000',.4);
      for(const [sx,sy,w] of [[246,146,17],[263,147,16],[279,146,18],[252,137,16],[268,136,17],[284,138,13],[260,128,15],[275,127,14]]){
        K.px(sx,sy,w,3,G[4]);K.px(sx,sy,w,1,G[5]);K.px(sx+w-2,sy,2,3,G[3]);K.px(sx,sy+3,w,6,E[4]);K.px(sx,sy+3,2,6,E[5]);K.px(sx+w-2,sy+3,2,6,E[2]);K.px(sx,sy+9,w,1,E[1]);
        K.px(sx+3,sy-1,1,1,G[5]);K.px(sx+w-5,sy-1,1,1,G[4]);}
      K.px(290,98,2,26,'#6a4a2a');K.px(290,98,1,26,'#8e6a3e');K.px(286,96,10,3,'#5a3c20');K.px(286,96,10,1,'#8e6a3e');
      K.px(287,122,8,6,'#5a5e66');K.px(287,122,8,1,'#8a8e96');K.px(287,122,1,6,'#7a7e86');K.px(294,122,1,6,'#3a3e46');},
    barn(K){// inside the barn at dusk: dark board walls, the beam with hay hanging off the loft, one dusty window of cold light, a lantern,
      // tools on the wall, stacked bales (straw drawn in strokes, no speckle), the swept threshing floor
      const BW=['#140a06','#1e1009','#2a170c','#361f10','#432714','#513019','#5f3a1f','#6d4426'],SD=['#2e2010','#44321a','#5c4622','#765c2c','#8e7236','#a68844','#bc9e58'];
      K.planks(0,0,320,118,BW,16,31,true);for(let y=0;y<52;y++)K.pa(0,y,320,1,'#050302',.6-y/88);
      // the loft: hay over the beam, a few wisps hanging down
      for(let x=0;x<320;x++){const h=4+Math.round(2*Math.sin(x*.21)+Math.sin(x*.53+1));K.px(x,30-h,1,h,SD[2]);K.px(x,30-h,1,1,SD[4]);if(x%7===3)K.px(x,30-h+1,1,1,SD[3]);}
      for(const [x,l] of [[22,7],[58,5],[97,9],[131,4],[188,8],[226,6],[263,5],[302,7]]){K.px(x,38,1,l,SD[3]);K.px(x+1,38,1,l-2,SD[2]);}
      K.px(0,30,320,8,BW[3]);K.px(0,30,320,1,BW[5]);K.px(0,37,320,1,BW[1]);K.pa(0,38,320,4,'#000',.35);
      for(const x of [40,160,280]){K.px(x,0,8,30,BW[2]);K.px(x,0,1,30,BW[4]);K.px(x+7,0,1,30,BW[0]);}
      // a small dusty window: cold grey light, a cobweb in its corner
      K.px(132,48,40,30,'#120a06');K.px(135,51,34,24,'#6e7a80');K.px(135,51,34,9,'#86929a');K.px(135,51,34,2,'#9ea8ac');K.px(151,51,2,24,'#120a06');K.px(135,62,34,2,'#120a06');
      K.px(135,73,34,2,'#4e585c');for(let k=0;k<5;k++)K.px(136+k,52+k,1,1,'#b4bcbe');K.px(136,52,5,1,'#b4bcbe');K.px(136,52,1,5,'#b4bcbe');
      K.px(130,78,44,3,BW[5]);K.px(130,78,44,1,BW[7]);K.px(130,81,44,1,BW[0]);
      // tools: a pitchfork, a rake, a coil of rope on a peg (dull iron, dark wood)
      const IR=['#1e1e22','#2e2e34','#3e3e46','#50505a','#64646e','#7a7a84'];
      K.line(200,44,200,104,'#7a6448',2);K.px(200,44,1,60,'#a08a68');for(const d of [-4,0,4])K.line(200+d,44,200+d,34,IR[4],1);K.px(196,44,9,2,IR[3]);
      K.line(214,46,214,104,'#6e5a40',2);K.px(214,46,1,58,'#94805e');K.px(208,44,13,3,IR[3]);for(let x=208;x<221;x+=2)K.px(x,47,1,3,IR[2]);
      K.px(236,52,3,3,BW[2]);for(let r=0;r<3;r++)K.ell(238,62,9-r*2,7-r*2,r%2?'#5a4626':'#7a6236');K.ell(238,62,3,2,BW[1]);
      // the bales: a lit top face, a front of straw in short strokes, a shaded right end, twine bands, a shadow under each
      const bale=(x,y,w,h)=>{K.px(x,y,w,5,SD[4]);K.px(x,y,w,1,SD[6]);for(let k=0;k<w/5;k++)K.px(x+1+((k*7)%(w-4)),y+1+(k%3),3,1,SD[5]);
        K.px(x,y+5,w,h-5,SD[2]);for(let r=0;r<(h-5)/2;r++){let xx=x+((r*5+x)%7);while(xx<x+w-4){const l=2+((xx*3+r+y)%4);K.px(xx,y+6+r*2,Math.min(l,x+w-4-xx),1,r%2?SD[3]:SD[1]);xx+=l+3;}}
        K.px(x+w-4,y+5,4,h-5,SD[1]);K.px(x+w-4,y,4,5,SD[3]);for(const bx of [x+w*.28|0,x+w*.72|0]){K.px(bx,y,2,h,'#2e1e0c');K.px(bx,y,1,h,'#4a3216');}
        K.pa(x,y+h,w,3,'#000',.5);};
      bale(8,74,56,22);bale(70,74,56,22);bale(36,52,56,22);bale(250,80,56,22);
      // the threshing floor: wide oak boards gone dark, swept, a few straws lying across
      const OD=['#120a05','#1e1209','#2a1a0c','#362212','#422a16','#4e341c','#5a3e22','#684828'];
      K.px(0,112,320,10,OD[3]);K.px(0,112,320,1,OD[5]);K.planks(0,122,320,58,OD,12,5);K.px(0,122,320,1,OD[0]);for(let x=0;x<320;x+=2)K.pa(x,123,2,4,'#000',.3);
      for(let k=0;k<26;k++){const x=(K.H32(k,7,9)*318)|0,y=126+((K.H32(k,8,9)*52)|0);K.line(x,y,x+4+(k%3),y-1+(k%2),SD[2+(k%3)],1);}
      for(let y=0;y<34;y++){const x0=118+Math.round(y*.9),w=36+Math.round(y*.3);for(let x=x0;x<x0+w;x++){const bar=Math.abs(x-(x0+w/2))<1.5||Math.abs(y-14)<1;if(!bar)K.pa(x,138+y,1,1,'#b8c4c8',.13);}}
      for(let y=150;y<180;y++)K.pa(0,y,320,1,'#000',(y-150)/90);}},
  anim:{
    workshop(K,t){const a=.18+Math.sin(t*5)*.02;K.px(250,0,1,10,CA_P.iron[2]);K.metal(246,10,10,3,CA_P.brass);K.px(247,13,8,9,'rgba(255,220,140,.8)');K.px(249,15,4,5,'#fff2c0');K.metal(246,22,10,2,CA_P.brass);K.glow(251,18,34,'255,200,120',a);K.glow(251,40,90,'255,190,110',.16+Math.sin(t*5)*.01);},
    kitchen(K,t){// the oil lamp on its hook, the flame breathing
      const f=Math.sin(t*6.3)*.5+Math.sin(t*14.1)*.3,X=212;K.px(X,0,1,8,'#2a2a30');K.px(X-5,8,11,2,'#4a3a22');K.px(X-4,10,9,12,'#2a1c10');K.px(X-3,11,7,10,'rgba(255,214,140,.8)');
      K.px(X-1,14+(f>.3?0:1),3,5,'#ffd27a');K.px(X,15,1,3,'#fff2c0');K.px(X-6,22,13,3,'#4a3a22');K.px(X-6,22,13,1,'#7a6038');K.glow(X,16,60,'255,200,120',.24+f*.05);},
    stove(K,t){MG4ART.anim.kitchen(K,t);const f=.5+Math.sin(t*7)*.15+Math.sin(t*13)*.1;MG4ART.fire(K,173,150,40,22,.7+f*.2,t,[172,124,42,26]);for(let x=174;x<212;x+=4)K.px(x,147,2,3,'#2a1a10');K.glow(194,138,34,'255,140,60',.25+f*.12);},
    forge(K,t){const f=.35+Math.sin(t*3)*.04+Math.sin(t*11)*.02;MG4ART.fire(K,22,110,68,26,.75+Math.sin(t*2)*.08,t,[20,80,72,30]);K.glow(56,96,120,'255,140,60',f);},
    sewing(K,t){K.px(34,48,5,14,'#d8c8a8');K.px(34,48,5,1,'#f0e4c8');K.px(38,48,1,14,'#a89878');K.px(31,61,11,2,'#4a3a28');const fy=Math.round(Math.sin(t*9)*.6);K.px(35,42+fy,3,6,'#ffd27a');K.px(36,40+fy,1,3,'#fff6c8');K.px(36,46,1,2,'#2a1a10');K.glow(36,46,50,'255,200,130',.32);},
    yard(K,t){// a low cloud drifting, and now and then crows crossing the evening
      const cx=((t*3)%420)-60;for(let i=0;i<70;i++){const h=Math.round(2+2*Math.sin(i/70*Math.PI));K.pa(cx+i,40-h,1,h,'#626470',.8);}
      for(let k=0;k<3;k++){const u=((t*.035+k*.13)%1),x=-20+u*360,y=30+k*6+Math.sin(t*2+k)*2,f=Math.floor(t*6+k*2)%2;if(u>.98)continue;
        K.px(x,y,1,1,'#14100e');K.px(x-2,y-1+f,2,1,'#14100e');K.px(x+1,y-1+f,2,1,'#14100e');K.px(x-3,y-2+2*f,1,1,'#14100e');K.px(x+3,y-2+2*f,1,1,'#14100e');}},
    barn(K,t){// a lantern hung from the beam, its flame breathing
      const f=Math.sin(t*6)*.5+Math.sin(t*13.3)*.3;K.px(262,38,1,10,'#1e1e22');K.px(258,48,9,2,'#3e3e46');K.px(258,48,9,1,'#64646e');K.px(259,50,7,10,'#2a1c10');
      K.px(260,51,5,8,'rgba(255,200,110,.85)');K.px(261,53+(f>.3?0:1),3,4,'#ffd27a');K.px(262,54,1,2,'#fff2c0');K.px(258,60,9,2,'#3e3e46');K.glow(262,56,40,'255,190,100',.22+f*.05);}},
  LIGHT:{workshop:{x:251,y:18,r:280,c:'255,196,130',a:.34,mote:'#d8c8a8'},
    kitchen:{x:212,y:16,r:280,c:'255,196,130',a:.32,mote:'#d8c8a8'},
    stove:{x:212,y:16,r:280,c:'255,196,130',a:.32,mote:'#d8c8a8'},
    forge:{x:56,y:96,r:240,c:'255,120,40',a:.44,ember:1},sewing:{x:36,y:46,r:300,c:'255,190,130',a:.34,mote:'#d8c8b8'},
    yard:{x:40,y:60,r:380,c:'255,206,150',a:.2,mote:'#d8c8a8'},barn:{x:262,y:56,r:250,c:'255,196,130',a:.3,mote:'#c8c4b4'}},
  light(K,name,t){const L=this.LIGHT[name]||this.LIGHT.workshop,g=K.g,W=320,H=180;
    g.save();g.globalCompositeOperation='soft-light';const gr=g.createRadialGradient(L.x,L.y,4,L.x,L.y,L.r);gr.addColorStop(0,`rgba(${L.c},${L.a*2})`);gr.addColorStop(.55,`rgba(${L.c},${L.a*.6})`);gr.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();
    if(L.shaft){g.save();g.globalCompositeOperation='screen';const sg=g.createLinearGradient(0,L.shaft[0][1],0,H),SC=L.sc||L.c;sg.addColorStop(0,`rgba(${SC},.14)`);sg.addColorStop(1,`rgba(${SC},0)`);g.fillStyle=sg;g.beginPath();g.moveTo(...L.shaft[0]);for(const p of L.shaft.slice(1))g.lineTo(...p);g.closePath();g.fill();g.restore();}
    const vg=g.createRadialGradient(W/2,H*.55,60,W/2,H*.55,210);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,4,2,.45)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    if(L.mote)for(let k=0;k<16;k++){const u=(t*.05+K.H32(k,5,18))%1;const mx=(L.shaft?L.shaft[0][0]+25:L.x)+Math.sin(t*.7+k)*22+(K.H32(k,6,18)-.5)*80-u*40,my=L.y+10+u*140;if(my<0||my>H)continue;K.pa(mx,my,1,1,L.mote,.55*Math.sin(u*Math.PI));}
    if(L.ember)for(let k=0;k<18;k++){const u=(t*.35+K.H32(k,7,18))%1;const ex=L.x+(K.H32(k,8,18)-.4)*70+Math.sin(t*3+k)*5,ey=L.y-u*100;K.pa(ex,ey,1,1,u<.5?'#ffd27a':'#e8642a',1-u);}
    if(L.pollen)for(let k=0;k<12;k++){const u=(t*.04+K.H32(k,10,18))%1;K.pa((K.H32(k,11,18)*W+u*80)%W,40+Math.sin(t+k)*10+K.H32(k,12,18)*110,1,1,'#fff8c0',.7);}}};
