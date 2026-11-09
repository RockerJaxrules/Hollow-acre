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
  base(name,draw){if(this.cache[name])return this.cache[name];const c=document.createElement('canvas');c.width=320;c.height=180;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const K=caKit(g,320,180);K.g=g;draw(K,g);return this.cache[name]=c;},
  tool(K,x,y,kind){const I=CA_P.iron,W=CA_P.wood;
    if(kind==='saw'){for(let i=0;i<34;i++){const h=8-i*.12;K.px(x+i,y+1,1,h,I[4+(i%3===0?1:0)]);K.px(x+i,y+1+h,1,1,(i%2)?I[2]:I[3]);}K.px(x,y,34,1,I[6]);K.px(x-10,y-1,11,10,W[4]);K.px(x-10,y-1,11,2,W[6]);K.px(x-7,y+2,5,4,W[1]);}
    else if(kind==='square'){K.px(x,y,3,28,I[5]);K.px(x,y+25,22,3,I[5]);K.px(x,y,1,28,I[7]);for(let k=0;k<6;k++)K.px(x+1,y+3+k*4,1,1,I[2]);}
    else if(kind==='plane'){K.px(x,y+4,22,6,W[5]);K.px(x,y+4,22,1,W[7]);K.px(x+4,y,8,5,W[4]);K.px(x+14,y+1,4,4,W[3]);K.px(x+2,y+10,18,2,I[3]);}
    else if(kind==='mallet'){K.px(x,y,14,8,W[5]);K.px(x,y,14,2,W[7]);K.px(x+12,y,2,8,W[3]);K.px(x+6,y+8,3,16,W[4]);K.px(x+6,y+8,1,16,W[6]);}
    else if(kind==='chisel'){K.px(x,y,3,9,W[5]);K.px(x,y+9,3,10,I[5]);K.px(x,y+9,1,10,I[7]);K.px(x,y+18,3,1,I[2]);}
    else if(kind==='rope'){for(let a=0;a<6.28*3;a+=.12){const r=5+a*.4;K.px(x+Math.cos(a)*r,y+Math.sin(a)*r*.8,2,2,a%1>.5?'#b89a5a':'#8a6e3a');}}},
  scene(K,name,t){const g=K.g;const b=this.base(name,(k,gg)=>this.paint[name]?this.paint[name](k,gg):this.paint.workshop(k,gg));g.drawImage(b,0,0);const A=this.anim[name];A&&A(K,t);},
  paint:{
    workshop(K){const W=CA_P.wood,O=CA_P.oak;K.planks(0,0,320,118,W,14,21,true);
      // a window with leaves outside
      K.px(132,10,56,40,W[1]);for(let y=0;y<34;y++){const u=y/34;K.px(135,13+y,50,1,`rgb(${140+u*70|0},${186+u*44|0},${222+u*20|0})`);}
      for(let x=0;x<50;x++){const h=6+Math.sin(x*.13)*2+Math.sin(x*.41)*1;K.px(135+x,47-h,1,h,'#7a9a8a');}for(let x=0;x<50;x++){const h=3+Math.sin(x*.3+1)*1.5;K.px(135+x,47-h,1,h,'#5a7a4a');}
      K.g.save();K.g.beginPath();K.g.rect(135,13,50,34);K.g.clip();K.px(172,24,3,23,'#3a2a1a');K.px(172,24,1,23,'#5a4028');const LEAF=['#1c3418','#2a4a20','#3c6228','#527e32','#6c9a3e','#8cb44e'];for(const [lx,ly,r] of [[166,22,7],[178,18,8],[186,26,6],[160,30,5],[174,30,6],[182,12,5],[168,13,5]])K.ball(lx,ly,r,LEAF,r-1);
      for(let k=0;k<20;k++){const lx=158+((k*13)%30),ly=10+((k*7)%24);K.px(lx,ly,1,1,'#a8d060');}K.ball(146,40,5,LEAF,3);K.ball(152,42,4,LEAF,3);K.g.restore();
      K.px(158,13,3,34,W[3]);K.px(135,28,50,3,W[3]);K.px(129,48,62,4,W[5]);K.px(129,52,62,1,W[1]);
      // the tool wall: a pegboard rail with saws, a square, chisels, a mallet, a coil of rope
      K.px(10,12,104,4,O[3]);K.px(10,12,104,1,O[6]);for(let x=14;x<112;x+=10)K.px(x,13,2,2,O[1]);
      MG4ART.tool(K,22,20,'saw');MG4ART.tool(K,64,18,'square');MG4ART.tool(K,74,20,'chisel');MG4ART.tool(K,80,22,'chisel');MG4ART.tool(K,92,20,'mallet');
      MG4ART.tool(K,214,16,'plane');K.px(208,12,104,4,O[3]);K.px(208,12,104,1,O[6]);MG4ART.tool(K,256,30,'rope');MG4ART.tool(K,282,20,'square');
      // shelves of jars and tins
      K.plank(216,58,92,4,O,4);for(let i=0;i<7;i++){const jx=220+i*12;K.px(jx,46,9,12,['#8a5a2a','#5a6a7a','#a8402a','#d8b050','#6a7a3a','#7a4a6a','#4a6a8a'][i]);K.px(jx,46,9,2,CA_P.iron[5]);K.px(jx+1,48,1,9,'rgba(255,255,255,.35)');}
      // the bench top
      K.plank(0,112,320,10,O,9);K.planks(0,122,320,58,O,11,13);K.px(0,122,320,1,O[0]);for(let x=0;x<320;x+=2)K.pa(x,123,2,4,'#000',.18);
      K.metal(4,100,22,14,CA_P.iron,8);K.px(8,96,14,4,CA_P.iron[3]);
      for(let k=0;k<60;k++){const sx=(K.H32(k,1,16)*320)|0,sy=126+((K.H32(k,2,16)*50)|0);K.px(sx,sy,1+(k%3===0?1:0),1,'#e8c890');}},
    kitchen(K){const T=CA_P.tile,W=CA_P.wood,O=CA_P.oak;
      for(let y=0;y<112;y++)for(let x=0;x<320;x++){const tx=x%12,ty=y%12,n=K.H32((x/12)|0,(y/12)|0,15);K.px(x,y,1,1,tx===0||ty===0?T[0]:K.pick(T,(ty<2?4:tx>9?2:3)-(n>.8&&ty>1?1:0)));if((tx===2||tx===3)&&ty===2)K.px(x,y,1,1,'#fbf8ee');}
      K.px(18,12,62,44,W[1]);for(let y=0;y<38;y++){const u=y/38;K.px(21,15+y,56,1,`rgb(${150+u*70|0},${192+u*40|0},${226+u*18|0})`);}
      for(let x=0;x<56;x++){const h=7+Math.sin(x*.11+2)*3;K.px(21+x,53-h,1,h,'#86a890');}for(let x=0;x<56;x++){const h=3+Math.sin(x*.27)*1.5;K.px(21+x,53-h,1,h,'#5e8a4c');}
      K.g.save();K.g.beginPath();K.g.rect(21,15,56,38);K.g.clip();const LEAF=['#1c3418','#2a4a20','#3c6228','#527e32','#6c9a3e','#8cb44e'];K.px(64,30,2,23,'#3a2a1a');for(const [lx,ly,r] of [[60,26,6],[70,22,7],[66,32,5],[74,30,4]])K.ball(lx,ly,r,LEAF,r-1);
      for(let k=0;k<5;k++){const cx=26+k*9;K.ball(cx,49,3,['#a83a2a','#c8503a','#e87050','#f8a080'],3);}K.g.restore();
      K.px(47,15,3,38,W[3]);K.px(21,33,56,3,W[3]);K.px(15,55,68,4,W[5]);K.px(15,59,68,1,W[1]);
      // copper pans hung by their handles: flat rounds with a rolled rim and a bright polish streak
      K.px(116,5,88,2,CA_P.iron[3]);K.px(116,5,88,1,CA_P.iron[6]);const C=CA_P.copper;
      for(let i=0;i<4;i++){const cx=128+i*21,r=5+(i%2)*2,cy=16+r;K.px(cx-1,7,2,2,CA_P.iron[2]);K.px(cx-1,9,3,cy-r-9,C[2]);K.px(cx,9,1,cy-r-9,C[5]);
        for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const d=Math.hypot(x,y)/r;if(d>1)continue;let k=d>.82?(x+y<0?6:2):d>.7?1:(x-y>r*.6?2:x+y<-r*.4?5:4);if(Math.abs(x+y+r*.3)<1&&d<.65)k=7;K.px(cx+x,cy+y,1,1,C[k]);}}
      for(let i=0;i<3;i++){const hx=92+i*9;K.line(hx,4,hx,10,'#5a4a2a',1);for(let k=0;k<8;k++)K.px(hx-3+((k*3)%7),10+k*1.4,2,2,['#4a6a2a','#6a8a3a','#3a5a24'][k%3]);}
      K.plank(222,48,90,5,W,3);for(let i=0;i<6;i++){const jx=226+i*14;K.px(jx,34,11,14,'rgba(200,230,240,.55)');K.px(jx+1,38,9,10,['#c8702c','#7aa64c','#e8c060','#a84e36','#ead07e','#c8b8a0'][i]);K.px(jx,32,11,2,CA_P.brass[4]);K.px(jx+1,35,1,12,'#ffffff');}
      K.plank(0,112,320,8,O,5);K.planks(0,120,320,60,W,8,11);K.px(0,120,320,1,W[0]);for(let x=0;x<320;x+=2)K.pa(x,121,2,4,'#000',.2);},
    // the kitchen again, with the iron range in front: a cooktop with a burner ring, an oven door and a firebox
    stove(K){MG4ART.paint.kitchen(K);const I=CA_P.iron;K.pa(84,108,152,6,'#000',.35);
      for(let y=110;y<180;y++){const k=y<116?4:3;K.px(92,y,136,1,I[k]);}K.px(92,110,136,1,I[6]);K.px(92,110,1,70,I[5]);K.px(227,110,1,70,I[1]);
      K.metal(86,102,148,9,I,14);K.px(86,111,148,2,I[1]);K.ell(160,106,30,3,I[1]);K.ell(160,106,27,2,I[0]);for(let a=0;a<6.28;a+=.35)K.px(160+Math.cos(a)*22,106+Math.sin(a)*1.6,2,1,I[3]);
      K.px(102,122,58,46,I[1]);K.px(104,124,54,42,I[2]);K.px(104,124,54,1,I[5]);for(let k=0;k<3;k++)K.px(108,130+k*10,46,1,I[3]);K.metal(118,118,26,3,CA_P.brass);
      K.px(170,122,46,30,I[1]);K.px(172,124,42,26,'#160a04');K.metal(182,154,22,3,CA_P.brass);for(const kx of [100,118,200,218])K.ball(kx,115,2,CA_P.brass);
      K.px(92,172,136,8,I[1]);for(const lx of [96,220])K.px(lx,172,6,8,I[0]);},
    forge(K){K.stones(0,0,320,124,CA_P.stone);for(let y=0;y<50;y++)K.pa(0,y,320,1,'#0a0806',.4-y/125);
      // the hearth, its hood and chimney
      K.bricks(8,64,96,60,CA_P.brick,14,6);K.px(20,80,72,30,'#1a0a04');K.px(4,52,104,12,CA_P.iron[2]);K.metal(4,50,104,4,CA_P.iron);K.px(30,0,52,50,CA_P.iron[1]);K.px(30,0,4,50,CA_P.iron[3]);
      // tongs and hammers on the wall, a water barrel, a coal bin
      for(let i=0;i<4;i++){K.line(150+i*14,12,150+i*14,44,CA_P.iron[3],1);K.px(146+i*14,44,9,4,CA_P.iron[2]);}K.px(140,10,70,3,CA_P.wood[3]);
      K.plank(262,82,40,42,CA_P.wood,6,true);K.metal(260,86,44,3,CA_P.iron);K.metal(260,112,44,3,CA_P.iron);K.ell(282,84,19,4,'#2a4a6a');K.ell(282,84,15,2,'#4a7aa0');
      K.metal(222,106,30,18,CA_P.iron,8);for(let k=0;k<14;k++)K.px(224+((k*5)%26),103-(k%3),4,3,'#1a1a1c');
      K.bricks(0,124,320,56,CA_P.brick,16,6);K.px(0,124,320,2,CA_P.brick[5]);for(let x=0;x<320;x+=2)K.pa(x,126,2,3,'#000',.25);},
    sewing(K){for(let y=0;y<114;y++)for(let x=0;x<320;x++){const s=(x%18<2)?3:(((x+((y/14)|0)*9)%18===9)&&y%14===7)?4:2;K.px(x,y,1,1,K.pick(['#3a2a30','#4a3640','#5a4450','#6c5460','#86707a'],s));}
      K.px(30,14,60,44,'#2a1a10');K.px(33,17,54,38,'#7a9ab8');for(let y=0;y<38;y++)K.pa(33,17+y,54,1,'#ffe8c0',.3-y/120);K.px(59,17,2,38,'#2a1a10');
      for(let i=0;i<6;i++){const sx=200+i*16;K.px(sx,40,11,18,['#b25645','#90abc2','#d6ad52','#6d8355','#8a5a9a','#e8e0d0'][i]);K.px(sx,38,11,3,CA_P.wood[4]);K.px(sx,58,11,3,CA_P.wood[4]);}K.plank(194,61,104,4,CA_P.wood,3);
      K.ball(150,44,9,['#5a1a14','#8a2a20','#b84a3a','#d87060']);for(let k=0;k<6;k++)K.px(144+k*2,36+((k*3)%5),1,5,CA_P.iron[6]);
      K.plank(0,114,320,8,CA_P.wood,4);K.planks(0,122,320,58,CA_P.wood,9,6);K.px(0,122,320,1,CA_P.wood[0]);},
    yard(K){// an autumn afternoon behind the farm: banded sky, two far ridges, a tree line in its colours, the red barn, the rail fence, the mown field
      const SKY=['#7aa8d0','#8cb6d8','#a2c4de','#bcd2e2','#d6dee2','#e8e2d4'];for(let y=0;y<84;y++)K.px(0,y,320,1,SKY[Math.min(5,(y/14)|0)]);
      const ridge=(base,amp,f,ph,cols)=>{for(let x=0;x<320;x++){const top=base-Math.round(amp*(.55+.45*Math.sin(x*f+ph))+amp*.3*Math.sin(x*f*2.7+ph*2));K.px(x,top,1,84-top,cols[0]);K.px(x,top,1,1,cols[1]);}};
      ridge(58,10,.021,1.3,['#8a9eb4','#a6b6c6']);ridge(66,7,.034,4.1,['#6e8a8c','#86a0a0']);
      // the tree line: clumps of leaf puffs, each tree its own autumn colour, trunks showing between
      const TC=[['#3a2a14','#7a3214','#a84a1e','#c86a2a','#e08e3a','#f2b45a'],['#2a2410','#6a5418','#9a7a20','#c49e28','#e2c03c','#f2dc64'],['#1c3418','#2a4a20','#3c6228','#527e32','#6c9a3e','#8cb44e'],['#2a1018','#6c1c2e','#9a2a30','#c43e34','#e2603c','#f28a52']];
      for(let i=0;i<15;i++){const tx=4+i*22+((i*7)%9),ty=72-((i*13)%6);const C=TC[(i*5+1)%4];K.px(tx-1,ty,3,10,'#3e2414');
        for(const [dx,dy,r] of [[-6,2,7],[6,2,7],[0,-4,8],[-3,-9,5],[4,-8,5]])K.ball(tx+dx,ty+dy,r,C);}
      // the barn in the distance: red board walls, a grey roof, a white X on the door
      K.px(230,50,44,26,'#8a2a20');for(let x=230;x<274;x+=4)K.px(x,50,1,26,'#6a1e16');K.px(272,50,2,26,'#5a1a14');
      for(let i=0;i<10;i++)K.px(226+i,49-i,52-i*2,1,i<2?'#4a4a52':'#6a6a74');K.px(226,49,52,1,'#2a2a30');
      K.px(244,60,14,16,'#5a1a14');K.line(245,61,257,75,'#e8e0d0',1);K.line(257,61,245,75,'#e8e0d0',1);K.px(240,54,6,4,'#2a1a10');K.px(241,55,4,2,'#e8c870');
      // the rail fence, posts lit on the left, a shadow line under the rails
      for(let x=6;x<320;x+=34){K.px(x,62,4,20,'#7a5230');K.px(x,62,1,20,'#a87848');K.px(x+3,62,1,20,'#4a2e16');K.px(x-1,61,6,1,'#c89456');}
      for(const y of [66,73]){K.px(0,y,320,2,'#966036');K.px(0,y,320,1,'#c89456');K.px(0,y+2,320,1,'#4a2e16');}
      // the field: flat bands of grass in soft patches, with drawn tufts (dark root, lit tips), a few flowers, a cart track
      const G=['#2e5228','#3e6a2e','#4e8236','#64983e','#80b04a','#a2c85c'];
      const vn=(x,y,c,sd)=>{const gx=x/c,gy=y/c,i=Math.floor(gx),j=Math.floor(gy),fx=gx-i,fy=gy-j,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);const a=K.H32(i,j,sd),b=K.H32(i+1,j,sd),c2=K.H32(i,j+1,sd),d=K.H32(i+1,j+1,sd);return a+(b-a)*u+(c2-a)*v+(a-b-c2+d)*u*v;};
      for(let y=78;y<180;y+=2)for(let x=0;x<320;x+=2){const n=vn(x,y*1.6,40,9)*.7+vn(x,y,14,13)*.3;const k=n>.6?3:n>.42?2:1;K.px(x,y,2,2,G[k]);}
      for(let i=0;i<70;i++){const x=(K.H32(i,1,21)*316)|0,y=82+((K.H32(i,2,21)*94)|0);const k=K.H32(x>>4,y>>4,9)>.5?3:2;
        K.px(x,y+2,3,1,G[k-1]);K.px(x,y+1,3,1,G[k]);K.px(x,y,1,1,G[k+2]);K.px(x+2,y,1,1,G[k+2]);K.px(x+1,y-1,1,1,G[5]);}
      for(let k=0;k<14;k++){const fx=(K.H32(k,3,17)*316)|0,fy=96+((K.H32(k,4,17)*78)|0);const c=['#f0e070','#e86a8a','#f4f4f4','#b88ae0'][k%4];K.px(fx,fy,2,2,c);K.px(fx+1,fy+1,1,1,'#f8e8a0');K.px(fx,fy+2,1,2,'#2e5228');}
      for(let y=84;y<180;y++){const w=2+((y-84)/12|0);for(const cx of [118-((y-84)*.5|0),196+((y-84)*.5|0)])K.pa(cx,y,w,1,'#6a4a28',.5);}},
    barn(K){// inside the barn: board walls in their own shade, a beam and the loft, a window of light, tools, stacked bales, straw on the boards
      K.planks(0,0,320,118,CA_P.wood,16,31,true);for(let y=0;y<40;y++)K.pa(0,y,320,1,'#0a0604',.5-y/90);
      K.px(0,30,320,8,CA_P.wood[3]);K.px(0,30,320,1,CA_P.wood[5]);K.px(0,37,320,1,CA_P.wood[1]);K.pa(0,38,320,4,'#000',.3);       // the beam
      for(const x of [40,160,280]){K.px(x,0,8,30,CA_P.wood[2]);K.px(x,0,1,30,CA_P.wood[4]);K.px(x+7,0,1,30,CA_P.wood[0]);}
      K.px(132,48,40,30,'#2a1a10');K.px(135,51,34,24,'#cfe2ea');K.px(135,51,34,8,'#e8f0f0');K.px(151,51,2,24,'#2a1a10');K.px(135,62,34,2,'#2a1a10');   // a window
      // tools on the wall: a pitchfork, a rake, a coil of rope on a peg
      K.line(200,44,200,104,CA_P.oak[4],2);for(const d of [-4,0,4])K.line(200+d,44,200+d,34,CA_P.iron[5],1);K.px(196,44,9,2,CA_P.iron[4]);
      K.line(214,46,214,104,CA_P.oak[3],2);K.px(208,44,13,3,CA_P.iron[4]);for(let x=208;x<221;x+=2)K.px(x,47,1,3,CA_P.iron[3]);
      K.px(236,52,3,3,CA_P.oak[2]);for(let r=0;r<3;r++)K.ell(238,62,9-r*2,7-r*2,r%2?'#8a6a3a':'#b49058');K.ell(238,62,3,2,CA_P.wood[1]);
      // the bales: lit top, straw-textured front with two twine bands, stacked two high on the left
      const bale=(x,y,w,h)=>{const S=CA_P.straw;K.px(x,y,w,5,S[5]);K.px(x,y,w,1,S[6]);
        for(let yy=y+5;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){const n=K.H32(xx>>1,yy,4);K.px(xx,yy,1,1,S[n>.8?4:n>.4?3:2]);}
        K.px(x+w-3,y+5,3,h-5,S[1]);for(const bx of [x+w*.28|0,x+w*.72|0]){K.px(bx,y,2,h,'#6a4a20');K.px(bx,y,1,h,'#9a7030');}
        K.px(x,y+h,w,2,'#2a1a08');for(let k=0;k<5;k++)K.px(x+((K.H32(k,x,5)*w)|0),y-1-(k%2),1,2,S[5]);};
      bale(8,74,56,22);bale(70,74,56,22);bale(36,52,56,22);bale(250,80,56,22);
      K.px(0,112,320,10,CA_P.oak[3]);K.px(0,112,320,1,CA_P.oak[5]);K.planks(0,122,320,58,CA_P.oak,12,5);K.px(0,122,320,1,CA_P.oak[0]);
      for(let k=0;k<60;k++){const x=(K.H32(k,7,9)*318)|0,y=124+((K.H32(k,8,9)*54)|0);K.line(x,y,x+3+(k%3),y-1+(k%2),CA_P.straw[3+(k%3)],1);}}},
  anim:{
    workshop(K,t){const a=.18+Math.sin(t*5)*.02;K.px(250,0,1,10,CA_P.iron[2]);K.metal(246,10,10,3,CA_P.brass);K.px(247,13,8,9,'rgba(255,220,140,.8)');K.px(249,15,4,5,'#fff2c0');K.metal(246,22,10,2,CA_P.brass);K.glow(251,18,34,'255,200,120',a);},
    kitchen(K,t){},
    stove(K,t){const f=.5+Math.sin(t*7)*.15+Math.sin(t*13)*.1;MG4ART.fire(K,173,150,40,22,.7+f*.2,t,[172,124,42,26]);for(let x=174;x<212;x+=4)K.px(x,147,2,3,'#2a1a10');K.glow(194,138,34,'255,140,60',.25+f*.12);},
    forge(K,t){const f=.35+Math.sin(t*3)*.04+Math.sin(t*11)*.02;MG4ART.fire(K,22,110,68,26,.75+Math.sin(t*2)*.08,t,[20,80,72,30]);K.glow(56,96,120,'255,140,60',f);},
    sewing(K,t){K.px(118,78,5,16,'#efe2c0');K.px(118,78,5,1,'#fff6e0');const fy=Math.sin(t*9)*1;K.px(119,72+fy,3,6,'#ffd27a');K.px(120,70+fy,1,3,'#fff6c8');K.glow(120,74,40,'255,210,140',.3);},
    yard(K,t){for(let i=0;i<3;i++){const cx=((i*120+t*5)%(380))-40,cy=12+i*9;for(const [dx,dy,r] of [[0,0,7],[9,-3,8],[18,0,7],[9,2,7]])K.ell(cx+dx,cy+dy,r,3,'#f6f8fa');}},
    barn(K,t){}},
  LIGHT:{workshop:{x:160,y:24,r:220,c:'255,228,170',a:.34,shaft:[[135,13],[185,13],[200,180],[110,180]],mote:'#f8e6b8'},
    kitchen:{x:48,y:30,r:220,c:'255,228,170',a:.34,shaft:[[21,15],[77,15],[150,180],[60,180]],mote:'#fff4d0'},
    stove:{x:48,y:30,r:230,c:'255,226,170',a:.32,shaft:[[21,15],[77,15],[150,180],[60,180]],mote:'#fff4d0'},
    forge:{x:56,y:96,r:240,c:'255,120,40',a:.44,ember:1},sewing:{x:120,y:74,r:200,c:'255,196,150',a:.32,mote:'#f4e0d0'},
    yard:{x:300,y:-10,r:360,c:'255,244,210',a:.2,pollen:1},barn:{x:160,y:40,r:240,c:'255,220,160',a:.3,mote:'#f0e0b0'}},
  light(K,name,t){const L=this.LIGHT[name]||this.LIGHT.workshop,g=K.g,W=320,H=180;
    g.save();g.globalCompositeOperation='soft-light';const gr=g.createRadialGradient(L.x,L.y,4,L.x,L.y,L.r);gr.addColorStop(0,`rgba(${L.c},${L.a*2})`);gr.addColorStop(.55,`rgba(${L.c},${L.a*.6})`);gr.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();
    if(L.shaft){g.save();g.globalCompositeOperation='screen';const sg=g.createLinearGradient(0,L.shaft[0][1],0,H);sg.addColorStop(0,`rgba(${L.c},.14)`);sg.addColorStop(1,`rgba(${L.c},0)`);g.fillStyle=sg;g.beginPath();g.moveTo(...L.shaft[0]);for(const p of L.shaft.slice(1))g.lineTo(...p);g.closePath();g.fill();g.restore();}
    const vg=g.createRadialGradient(W/2,H*.55,60,W/2,H*.55,210);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,4,2,.45)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    if(L.mote)for(let k=0;k<16;k++){const u=(t*.05+K.H32(k,5,18))%1;const mx=(L.shaft?L.shaft[0][0]+25:L.x)+Math.sin(t*.7+k)*22+(K.H32(k,6,18)-.5)*80-u*40,my=L.y+10+u*140;if(my<0||my>H)continue;K.pa(mx,my,1,1,L.mote,.55*Math.sin(u*Math.PI));}
    if(L.ember)for(let k=0;k<18;k++){const u=(t*.35+K.H32(k,7,18))%1;const ex=L.x+(K.H32(k,8,18)-.4)*70+Math.sin(t*3+k)*5,ey=L.y-u*100;K.pa(ex,ey,1,1,u<.5?'#ffd27a':'#e8642a',1-u);}
    if(L.pollen)for(let k=0;k<12;k++){const u=(t*.04+K.H32(k,10,18))%1;K.pa((K.H32(k,11,18)*W+u*80)%W,40+Math.sin(t+k)*10+K.H32(k,12,18)*110,1,1,'#fff8c0',.7);}}};
