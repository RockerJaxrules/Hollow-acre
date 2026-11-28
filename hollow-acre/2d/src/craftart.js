/* ================= the crafting art kit: textures (wood grain with knots, brushed metal, woven cloth, leather, brick, stone, glass,
   fire and glow) and five places to work (a tiled kitchen, the forge, the carpentry workshop, the sewing table, the farm yard),
   all drawn into the 240x120 minigame canvas, lit from the upper left like the rest of the game. ================= */
const CA_P={
  wood:['#24140a','#3e2414','#5a361e','#78492a','#966036','#b47a46','#cf9a62','#e6bc86'],
  oak:['#2a1a0c','#4a2e16','#6c4422','#8e5c30','#ae7840','#c89456','#ddb276','#eed09c'],
  iron:['#121418','#232730','#363c4a','#4e5666','#6a7486','#8c96a8','#b4bcca','#dee4ec'],
  copper:['#2e1006','#56220c','#803616','#a84e22','#cc6c32','#e48c48','#f4b070','#fcd8a8'],
  brass:['#3a2608','#664412','#8e621c','#b48228','#d4a03c','#e8c060','#f6dc94','#fff2c8'],
  cloth:['#2a2620','#423c32','#5c5446','#766c5a','#90866e','#aaa084','#c4ba9e'],
  leather:['#200e06','#3a1c0c','#552a14','#70391c','#8c4c28','#a86438','#c4824e'],
  straw:['#5a4214','#7c5c1e','#9e7a2c','#c09a3e','#d8b456','#ecce78','#f8e6a4'],
  stone:['#1e1c20','#302d32','#444046','#5a565c','#726e74','#8c888e','#a8a4a8'],
  brick:['#2a100c','#4a1e16','#6a2c20','#8a3c2a','#a84e36','#c06848'],
  glass:['#1c3448','#2c5070','#40709a','#6898c0','#9cc4e0','#d4ecf8'],
  fire:['#5a1404','#9a2c08','#d8540c','#f08a1c','#f8b83c','#fce07c','#fff6c8'],
  grass:['#1c3418','#2a4a20','#3c6228','#527e32','#6c9a3e','#8cb44e'],
  tile:['#8a8274','#b0a894','#ccc4ae','#e2dac4','#f0eadc']};
function caKit(g,W,H){
  const px=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  const pa=(x,y,w,h,c,a)=>{g.globalAlpha=a;px(x,y,w,h,c);g.globalAlpha=1;};
  const H32=(a,b,s)=>{let h=(a*374761393+b*668265263+(s||0)*362437)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967295;};
  const pick=(P,l)=>P[Math.max(0,Math.min(P.length-1,Math.round(l)))];
  // a plank: grain that wanders with the length, a knot or two, a lit top edge and a dark bottom one
  const plank=(x,y,w,h,P,seed,vert)=>{seed=seed||1;const L=vert?h:w,T=vert?w:h;const knot=H32(seed,3,1)>.55&&L>16;const kx=3+H32(seed,5,2)*(L-6),ky=T/2;
    for(let a=0;a<L;a++)for(let b=0;b<T;b++){const wv=Math.sin(a*.05+seed)*1.2+Math.sin(a*.017+seed*2)*1.8;const gr=Math.sin((b+wv)*1.1+seed)*.5+.5;
      let k=3+(gr>.88?1:gr<.1?-1:0)+(H32(a>>3,b,seed)>.97?-1:0);
      if(knot){const d=Math.hypot(a-kx,(b-ky)*1.8);if(d<1.6)k=1;else if(d<2.6)k=2;}
      if(b===0)k=Math.max(k,5);if(b===1)k=Math.max(k,4);if(b===T-1)k=1;
      px(vert?x+b:x+a,vert?y+a:y+b,1,1,pick(P,k));}};
  const shiftP=(P,d)=>P.map((c,i)=>P[Math.max(0,Math.min(P.length-1,i+d))]);
  const planks=(x,y,w,h,P,bw,seed,vert)=>{for(let i=0;i*bw<(vert?w:h);i++){const t=Math.min(bw,(vert?w:h)-i*bw);const d=H32(i,seed,11)>.72?1:H32(i,seed,12)<.22?-1:0;const Pi=shiftP(P,d);
      vert?plank(x+i*bw,y,t,h,Pi,seed+i*7,true):plank(x,y+i*bw,w,t,Pi,seed+i*7,false);
      // the gap between boards, and the shadow it throws
      if(vert){px(x+i*bw,y,1,h,P[0]);pa(x+i*bw+1,y,1,h,P[0],.35);}else{px(x,y+i*bw,w,1,P[0]);pa(x,y+i*bw+1,w,1,P[0],.3);}
      // nail heads at the ends of every board
      const L=vert?h:w;for(const e of [4,L-5]){if(L<12)break;const nx=vert?x+i*bw+Math.floor(t/2):x+e,ny=vert?y+e:y+i*bw+Math.floor(t/2);px(nx,ny,2,2,'#2a2420');px(nx,ny,1,1,'#8a8478');}
      // weathering: a few darker flecks
      for(let k=0;k<L/9;k++){const a=Math.floor(H32(k,i,seed+3)*L),b=1+Math.floor(H32(i,k,seed+4)*(t-2));pa(vert?x+i*bw+b:x+a,vert?y+a:y+i*bw+b,1+(k%2),1,P[1],.5);}}};
  // metal: banded with a hard highlight and a soft reflection, optional rivets
  const metal=(x,y,w,h,P,rivets)=>{for(let b=0;b<h;b++){const t=b/Math.max(1,h-1);const k=t<.12?6:t<.3?5:t<.55?4:t<.8?3:2;px(x,y+b,w,1,pick(P,k));}px(x,y,w,1,P[7]||P[P.length-1]);px(x,y+h-1,w,1,P[1]);
    for(let i=0;i<w;i+=3)if(H32(i,y,7)>.7)pa(x+i,y+1,1,h-2,P[1],.25);if(rivets)for(let i=4;i<w-3;i+=Math.max(8,rivets)){px(x+i,y+2,2,2,P[6]);px(x+i+1,y+3,1,1,P[1]);}};
  const cloth=(x,y,w,h,P,seed)=>{for(let b=0;b<h;b++)for(let a=0;a<w;a++){const k=3+(((a+b)&1)?1:0)-(((a>>1)+(b>>1))%5===0?1:0)+(H32(a,b,seed||3)>.96?-1:0);px(x+a,y+b,1,1,pick(P,k));}};
  const leather=(x,y,w,h,P)=>{for(let b=0;b<h;b++)for(let a=0;a<w;a++){const n=H32(a>>1,b>>1,5)*.6+H32(a,b,6)*.4;px(x+a,y+b,1,1,pick(P,n>.8?5:n>.4?4:n>.15?3:2));}};
  const bricks=(x,y,w,h,P,bw,bh)=>{bw=bw||12;bh=bh||6;for(let b=0;b<h;b++){const r=(b/bh)|0,off=r%2?bw/2:0,rb=b%bh;for(let a=0;a<w;a++){const c=(((a+off)/bw)|0),ca=(a+off)%bw;const mort=rb===bh-1||ca===bw-1;
    const n=H32(c,r,4);let k=n>.75?4:n>.3?3:2;if(rb===0)k++;if(rb===bh-2)k--;if(ca===0)k++;if(ca===bw-2)k--;
    const chip=!mort&&((rb===0&&ca===0&&H32(c,r,9)>.6)||(rb===bh-2&&ca===bw-2&&H32(c,r,10)>.7));
    px(x+a,y+b,1,1,mort||chip?(rb===bh-1&&ca<bw-1?P[0]:P[1]):pick(P,k+(H32(a,b,13)>.94?-1:0)));}}};
  const stones=(x,y,w,h,P)=>{for(let b=0;b<h;b++){const r=(b/8)|0,off=(r*5)%11;for(let a=0;a<w;a++){const c=((a+off)/13)|0;const n=H32(c,r,8);const mort=b%8===7||(a+off)%13===12;px(x+a,y+b,1,1,mort?P[0]:pick(P,(n>.66?4:n>.33?3:2)+(H32(a,b,14)>.93?-1:0))+'');if(!mort&&b%8===0)px(x+a,y+b,1,1,P[5]);if(!mort&&(a+off)%13===0)px(x+a,y+b,1,1,P[4]);if(!mort&&(b%8===6||(a+off)%13===11))px(x+a,y+b,1,1,P[1]);}}};
  const ell=(cx,cy,rx,ry,c)=>{for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry))));px(cx-w,cy+y,w*2+1,1,c);}};
  const ball=(cx,cy,r,P,ry)=>{ry=ry||r;for(let y=-ry;y<=ry;y++)for(let x=-r;x<=r;x++){const d=x*x/(r*r)+y*y/(ry*ry);if(d>1)continue;const l=-x/r*.6-y/ry*.75+.35-(d>.82?.5:0);px(cx+x,cy+y,1,1,pick(P,(P.length-1)*(l*.5+.5)));}};
  const shadow=(cx,cy,rx,ry,a)=>{g.globalAlpha=a||.35;ell(cx,cy,rx,ry,'#0a0604');g.globalAlpha=1;};
  const glow=(cx,cy,r,col,a)=>{const gr=g.createRadialGradient(cx,cy,0,cx,cy,r);gr.addColorStop(0,`rgba(${col},${a})`);gr.addColorStop(1,`rgba(${col},0)`);g.fillStyle=gr;g.fillRect(cx-r,cy-r,r*2,r*2);};
  const line=(x0,y0,x1,y1,c,w)=>{const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)));for(let i=0;i<=n;i++)px(x0+(x1-x0)*i/n-(w>1?w/2:0),y0+(y1-y0)*i/n-(w>1?w/2:0),w||1,w||1,c);};
  const flame=(x,y,s,t,P)=>{P=P||CA_P.fire;for(let i=0;i<5;i++){const f=Math.sin(t*12+i*1.9+x)*1.5;const h=(6+Math.sin(t*8+i)*2)*s;px(x+i*2*s,y-h+f,2*s,h,pick(P,2+(i%3)));px(x+i*2*s,y-h*.6+f,1*s,h*.5,P[5]);}};
  const IMGC={};const sprite=(name,x,y,o)=>{o=o||{};const m=SPR[name],im=m&&IMG[m.src];if(!im)return;const sc=o.scale||1;const f=o.frame||0;g.save();if(o.alpha!==undefined)g.globalAlpha=o.alpha;
    if(o.flip){g.translate(Math.round(x+m.fw*sc),Math.round(y));g.scale(-1,1);g.drawImage(im,f*m.fw,0,m.fw,m.fh,0,0,m.fw*sc,m.fh*sc);}else g.drawImage(im,f*m.fw,0,m.fw,m.fh,Math.round(x),Math.round(y),m.fw*sc,m.fh*sc);g.restore();return true;};
  const icon=(n,x,y,s)=>{if(!IMGC[n]){IMGC[n]=new Image();IMGC[n].src=iconOf(n);}const im=IMGC[n];if(im.complete&&im.naturalWidth)g.drawImage(im,Math.round(x),Math.round(y),32*(s||1),32*(s||1));};
  const vig=()=>{const gr=g.createRadialGradient(W/2,H/2,30,W/2,H/2,150);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.5)');g.fillStyle=gr;g.fillRect(0,0,W,H);};
  // ---- the places
  const scene=(name,t)=>{
    if(name==='kitchen'){// cream tiles with grout, a window with morning light, a shelf of jars, the counter
      for(let y=0;y<86;y++)for(let x=0;x<W;x++){const tx=x%10,ty=y%10,n=H32((x/10)|0,(y/10)|0,15);px(x,y,1,1,tx===0||ty===0?CA_P.tile[0]:pick(CA_P.tile,(ty<2?4:tx>7?2:3)-(n>.8&&ty>1?1:0)));if(tx===2&&ty===2||tx===3&&ty===2)px(x,y,1,1,'#fbf8ee');}
      // copper pans hanging from a rail, and bunches of herbs drying
      px(96,6,52,2,CA_P.iron[3]);for(let i=0;i<3;i++){const cx=106+i*16;line(cx,8,cx,13,CA_P.iron[2],1);ball(cx,19,6,CA_P.copper,5);px(cx-1,13,3,2,CA_P.copper[2]);}
      for(let i=0;i<2;i++){const hx=60+i*10;line(hx,4,hx,10,'#5a4a2a',1);for(let k=0;k<7;k++)px(hx-3+((k*3)%7),10+k*1.4,2,2,['#4a6a2a','#6a8a3a','#3a5a24'][k%3]);}
      px(14,10,40,30,'#3c5a7a');for(let y=0;y<30;y++)pa(14,10+y,40,1,'#ffe8b0',.5-y/70);px(33,10,2,30,CA_P.wood[2]);px(14,24,40,2,CA_P.wood[2]);px(12,8,44,2,CA_P.wood[4]);px(12,40,44,3,CA_P.wood[3]);
      plank(150,28,80,4,CA_P.wood,3);for(let i=0;i<5;i++){const jx=154+i*15;px(jx,18,10,10,'rgba(200,230,240,.55)');px(jx+1,21,8,7,['#c8702c','#7aa64c','#e8c060','#a84e36','#ead07e'][i]);px(jx,16,10,2,CA_P.brass[4]);px(jx+1,19,1,8,'#ffffff');}
      glow(34,30,60,'255,230,170',.18);plank(0,86,W,6,CA_P.oak,5);planks(0,92,W,28,CA_P.wood,7,11);px(0,92,W,1,CA_P.wood[0]);}
    else if(name==='stove'){scene('kitchen',t);px(40,64,160,56,CA_P.iron[1]);metal(40,62,160,6,CA_P.iron);for(let i=0;i<12;i++){px(56+i*11,104,8,10,CA_P.iron[0]);flame(57+i*11,112,1,t);}px(40,100,160,2,CA_P.iron[3]);}
    else if(name==='forge'){stones(0,0,W,90,CA_P.stone);for(let y=0;y<40;y++)pa(0,y,W,1,'#0a0806',.35-y/115);glow(20,70,90,'255,140,60',.35+Math.sin(t*3)*.04);
      metal(206,74,22,16,CA_P.iron,8);px(208,72,18,3,CA_P.iron[1]);for(let k=0;k<8;k++)px(209+((k*5)%15),70-(k%3),3,2,'#1a1a1c');for(let i=0;i<3;i++){line(180+i*12,6,180+i*12,26,CA_P.iron[3],1);px(176+i*12,26,8,3,CA_P.iron[2]);}
      bricks(0,90,W,30,CA_P.brick,14,5);px(0,90,W,2,CA_P.brick[5]);}
    else if(name==='workshop'){planks(0,0,W,86,CA_P.wood,12,21,true);for(let y=6;y<80;y+=10)for(let x=8;x<W;x+=10)px(x,y,1,1,CA_P.wood[0]);
      // tools hung on the wall: a saw, a square, a hand plane, a mallet
      px(16,14,26,8,CA_P.iron[5]);for(let i=0;i<26;i+=2)px(16+i,22,1,1,CA_P.iron[3]);px(40,12,8,12,CA_P.wood[4]);px(196,10,3,26,CA_P.iron[5]);px(196,33,18,3,CA_P.iron[5]);px(60,16,16,7,CA_P.wood[5]);px(64,13,6,3,CA_P.iron[4]);px(222,12,4,18,CA_P.wood[4]);px(218,8,12,7,CA_P.wood[3]);
      px(94,6,40,28,CA_P.wood[1]);px(96,8,36,24,'#9cc4e0');for(let y=0;y<24;y++)pa(96,8+y,36,1,'#fff4d0',.35-y/80);px(113,8,2,24,CA_P.wood[3]);px(96,19,36,2,CA_P.wood[3]);px(92,33,44,3,CA_P.wood[5]);px(92,36,44,1,CA_P.wood[1]);
      for(let i=0;i<5;i++)px(100+i*6,22+((i*3)%5),3,2,'#6a9a4a');
      line(160,0,160,10,CA_P.iron[2],1);metal(156,10,9,3,CA_P.brass);px(157,13,7,8,'rgba(255,220,140,.75)');px(159,15,3,4,'#fff2c0');metal(156,21,9,2,CA_P.brass);glow(160,17,26,'255,200,120',.25+Math.sin(t*5)*.03);
      plank(0,86,W,8,CA_P.oak,9);planks(0,94,W,26,CA_P.oak,9,13);px(0,94,W,1,CA_P.oak[0]);metal(4,80,18,8,CA_P.iron);
      for(let k=0;k<40;k++){const sx=(H32(k,1,16)*W)|0,sy=96+((H32(k,2,16)*22)|0);px(sx,sy,1+(k%3===0?1:0),1,'#e8c890');}}
    else if(name==='sewing'){for(let y=0;y<86;y++)for(let x=0;x<W;x++){const s=(x%16<2)?3:(((x+((y/12)|0)*8)%16===8)&&y%12===6)?4:2;px(x,y,1,1,pick(['#3a2a30','#4a3640','#5a4450','#6c5460','#86707a'],s));}
      for(let i=0;i<4;i++){const sx=170+i*14;px(sx,30,10,16,['#b25645','#90abc2','#d6ad52','#6d8355'][i]);px(sx,28,10,3,CA_P.wood[4]);px(sx,46,10,3,CA_P.wood[4]);}ball(150,40,8,['#5a1a14','#8a2a20','#b84a3a','#d87060']);
      plank(0,86,W,6,CA_P.wood,4);planks(0,92,W,28,CA_P.wood,7,6);}
    else if(name==='yard'){const day=typeof nightK==='number'?1-nightK:1;for(let y=0;y<60;y++){const k=y/60;px(0,y,W,1,`rgb(${(150+k*60)*day|0},${(190+k*40)*day|0},${(220+k*20)*day|0})`);}
      for(let i=0;i<12;i++){const tx=i*22+((i*7)%9);ball(tx,52-((i*13)%7),11,CA_P.grass,9);}for(let y=56;y<H;y++)for(let x=0;x<W;x++){const n=H32(x>>1,y>>1,9);px(x,y,1,1,pick(CA_P.grass,(n>.75?4:n>.3?3:2)+(y<60?1:0)));}
      for(let i=0;i<3;i++){const cx=((i*90+t*4)%(W+60))-30,cy=10+i*7;for(const [dx,dy,r] of [[0,0,6],[8,-3,7],[16,0,6],[8,2,6]])ell(cx+dx,cy+dy,r,3,'#f6f8fa');ell(cx+8,cy+3,12,1,'#d8e2ea');}
      px(186,38,22,14,'#8a2a20');px(184,36,26,3,'#5a1a14');px(195,44,4,8,'#3a1210');
      for(let k=0;k<26;k++){const fx=(H32(k,3,17)*W)|0,fy=64+((H32(k,4,17)*50)|0);px(fx,fy,2,2,['#f0e070','#e86a8a','#f4f4f4','#b88ae0'][k%4]);px(fx,fy+2,1,2,'#3c6228');}
      for(let x=0;x<W;x+=30){plank(x,48,4,14,CA_P.wood,x,true);}plank(0,51,W,3,CA_P.wood,2);}
  };
  const LIGHT={kitchen:{x:34,y:22,r:170,c:'255,228,170',a:.34,shaft:[[14,10],[54,10],[110,120],[40,120]],mote:'#fff4d0'},
    stove:{x:120,y:110,r:150,c:'255,150,60',a:.36,mote:'#fff4d0',steam:1},
    forge:{x:20,y:74,r:190,c:'255,120,40',a:.42,ember:1},
    workshop:{x:114,y:20,r:170,c:'255,226,170',a:.32,shaft:[[96,8],[132,8],[104,120],[52,120]],mote:'#f8e6b8'},
    sewing:{x:150,y:36,r:150,c:'255,196,150',a:.3,mote:'#f4e0d0'},
    yard:{x:210,y:-10,r:280,c:'255,244,210',a:.22,pollen:1}};
  const light=(name,t)=>{const L=LIGHT[name];if(!L)return;
    g.save();g.globalCompositeOperation='soft-light';const gr=g.createRadialGradient(L.x,L.y,4,L.x,L.y,L.r);gr.addColorStop(0,`rgba(${L.c},${L.a*2})`);gr.addColorStop(.55,`rgba(${L.c},${L.a*.6})`);gr.addColorStop(1,'rgba(0,0,0,.45)');
    g.fillStyle=gr;g.fillRect(0,0,W,H);g.restore();
    if(L.shaft){g.save();g.globalCompositeOperation='screen';const sg=g.createLinearGradient(0,L.shaft[0][1],0,H);sg.addColorStop(0,`rgba(${L.c},.16)`);sg.addColorStop(1,`rgba(${L.c},0)`);g.fillStyle=sg;g.beginPath();g.moveTo(...L.shaft[0]);for(const p of L.shaft.slice(1))g.lineTo(...p);g.closePath();g.fill();g.restore();}
    // the room darkens toward its corners
    const vg=g.createRadialGradient(W/2,H*.55,40,W/2,H*.55,150);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(8,4,2,.42)');g.fillStyle=vg;g.fillRect(0,0,W,H);
    // dust in the light, embers over the fire, steam off the pots, pollen in the sun
    if(L.mote)for(let k=0;k<14;k++){const u=(t*.05+H32(k,5,18))%1;const mx=(L.shaft?L.shaft[0][0]+20:L.x)+Math.sin(t*.7+k)*18+(H32(k,6,18)-.5)*60-u*30,my=L.y+10+u*90;if(my<0||my>H)continue;pa(mx,my,1,1,L.mote,.55*Math.sin(u*Math.PI));}
    if(L.ember)for(let k=0;k<16;k++){const u=(t*.35+H32(k,7,18))%1;const ex=L.x+(H32(k,8,18)-.3)*50+Math.sin(t*3+k)*4,ey=L.y-u*80;pa(ex,ey,1,1,u<.5?'#ffd27a':'#e8642a',1-u);}
    if(L.steam)for(let k=0;k<8;k++){const u=(t*.25+H32(k,9,18))%1;const sx=60+k*16+Math.sin(t*2+k)*3,sy=62-u*44;pa(sx,sy,3,2,'#f4f0ea',.28*(1-u));}
    if(L.pollen)for(let k=0;k<10;k++){const u=(t*.04+H32(k,10,18))%1;pa((H32(k,11,18)*W+u*60)%W,30+Math.sin(t+k)*8+H32(k,12,18)*70,1,1,'#fff8c0',.7);}};
  return {px,pa,H32,pick,plank,planks,metal,cloth,leather,bricks,stones,ell,ball,shadow,glow,line,flame,sprite,icon,scene,vig,light};}
