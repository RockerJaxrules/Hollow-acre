/* ================= #272 The Count, shown. Every part of the valley kept one small thing of the child it gave up: a toy horse,
   a shoe, a slate, a top, a cap, a bag of marbles. Finding one used to open a page that told you what you were looking at.
   Now the screen goes in on the thing itself, lying where it was left (in the furrow, on the wall, in the long grass), with
   whatever was carved, stitched or chalked on it there to read; who they were and how the place gave them up stays under it.
   Closing it is saying their name. ================= */
const cgH=(x,y)=>(((x*73856093)^(y*19349663))>>>0)%97;
// ---- the ground each thing lies on: flat tones, a few clusters placed with a purpose (no speckle)
function cgGround(P,t){const H=cgH,fill=f=>{for(let y=0;y<104;y++)for(let x=0;x<160;x++)P(x,y,1,1,f(x,y));};
  const tufts=(n,c,s)=>{for(let i=0;i<n;i++){const x=H(i,s)%158,y=H(s,i)%100;P(x,y+2,1,1,c[0]);P(x+1,y,1,3,c[1]);P(x+2,y+1,1,2,c[0]);}};
  const stones=(n,c,s,big)=>{for(let i=0;i<n;i++){const x=H(i,s)%156,y=H(s,i)%100,w=(big?4:2)+H(i,i+s)%3;P(x,y+1,w,2,c[0]);P(x+1,y,w-1,1,c[1]);P(x,y+3,w,1,c[2]);}};
  const leaves=(n,s)=>{for(let i=0;i<n;i++){const x=H(i,s)%156,y=H(s,i)%100,c=['#a8582a','#c8822e','#8a3a1e','#b89a3a'][i%4];P(x,y,3,1,c);P(x+1,y+1,2,1,sgtShade(c,.7));}};
  const planks=(a,b,h)=>fill((x,y)=>{const r=(y+((x/37|0)%2)*3)%h;return r===0?'#1e140a':r===1?b:a;});
  switch(t){
    case 'furrow':fill((x,y)=>{const r=(y+((x>>5)&1))%8;return r<2?'#6a5034':r<5?'#54402a':r<7?'#43331f':'#30241a';});stones(10,['#5a4632','#7a6046','#2a2016'],3);break;
    case 'corn':fill((x,y)=>y>80?'#3a2e1a':'#16130a');for(let x=-2;x<162;x+=6){const top=(x*7)%14;for(let y=top;y<84;y++)P(x+((y>>4)&1),y,2,1,(x/6|0)%2?'#4a3e1a':'#3e3414');}
      for(let y=0;y<104;y++){P(118,y,4,1,'#8a7434');P(118,y,1,1,'#b09a4c');P(121,y,1,1,'#5a4a20');}for(const [ly,d] of [[18,-1],[40,1],[62,-1]])for(let i=0;i<22;i++)P(119+d*i,ly+Math.round(i*.35+Math.sin(i*.3)*2),2,1,'#8a7a38');break;
    case 'bank':fill((x,y)=>{const e=70+Math.round(Math.sin(x*.07)*3);return y<e?'#3e3020':y===e?'#5a4630':y<e+3?'#1a140e':'#16262c';});stones(8,['#4e3e2a','#6a5640','#2a2016'],5);
      for(const rx of [8,30,132,150])for(let i=0;i<5;i++){P(rx+i,58+(i*3)%7,1,12,i%2?'#4a4a24':'#5e5a2c');P(rx+i,58+(i*3)%7,1,1,'#9a8a48');}for(const [x,y] of [[40,84],[96,92],[120,80]])P(x,y,8,1,'#2a3e46');break;
    case 'under':fill((x,y)=>y<14?((x%12)===0?'#140e08':'#2a1e12'):y<18?'#0c0806':'#2e261c');for(let x=0;x<160;x+=22){P(x,0,6,18,'#1a120a');P(x,0,1,18,'#3a2a1a');}stones(14,['#3a3226','#4e4434','#1e1810'],8);
      // the end of the covered bridge overhead: its sill beam across the top, the deck planks' ends in it, and a stone pier at the side
      P(0,16,160,9,'#3a2816');for(let x=0;x<160;x+=11){P(x,16,1,8,'#1e140a');P(x+1,16,1,8,'#4e3820');}P(0,16,160,1,'#5e4428');P(0,24,160,1,'#6a4e2e');P(0,25,160,1,'#120c06');
      for(let x=4;x<160;x+=33){P(x,18,1,1,'#8a8a90');P(x+16,21,1,1,'#8a8a90');}
      for(const px of [36,122]){P(px-1,25,15,40,'#16120e');P(px,25,13,39,'#4a463e');for(let yy=25;yy<64;yy+=6){P(px,yy,13,1,'#2a2620');P(px+((yy/6|0)%2?6:3),yy,1,6,'#2a2620');P(px,yy+1,13,1,'#5e5a50');}P(px,25,2,39,'#5a564c');P(px-2,63,17,3,'#00000055');}
      P(0,26,160,3,'#00000066');P(0,29,160,3,'#00000033');break;
    case 'ditch':fill((x,y)=>y<30?'#4e5428':y<70?'#3e3a20':'#2a2c1e');tufts(40,['#3a4020','#6a7034'],5);for(let y=74;y<104;y+=7)P(0,y,160,1,'#1e2420');stones(6,['#4a4030','#6a5a44','#1e1810'],2);leaves(8,4);break;
    case 'cobble':fill((x,y)=>{const row=y/7|0,cx=(x+(row&1)*5)%10,cy=y%7;return cx===0||cy===0?'#1e1e20':cy===1?'#7a7670':(H(x>>3,row)%3?'#5a5852':'#64625c');});break;
    case 'wall':fill((x,y)=>{const row=y/16|0,cx=(x+(row&1)*14)%28,cy=y%16;return cx===0||cy===0?'#24242a':cy<2?'#8a8890':(H(x/28|0,row)%2?'#5e5e66':'#6a6a72');});for(const [x,y] of [[20,30],[110,70],[60,90]]){P(x,y,10,2,'#4a5a3a');P(x+2,y-1,5,1,'#6a7a4a');}break;
    case 'boards':planks('#5e4428','#8a6a44',9);for(let i=0;i<14;i++){const x=(H(i,3)%150)+4,y=(H(3,i)%11)*9+4;P(x,y,1,1,'#9a9aa0');}break;
    case 'step':fill((x,y)=>y<40?'#3a2c1c':y===40?'#a07a52':y<52?'#6e5034':y===52?'#1e140a':'#4a3824');for(let x=0;x<160;x+=19)P(x,41,1,11,'#4a3420');break;
    case 'road':fill((x,y)=>'#5a5244');stones(40,['#6e6656','#8a8270','#3a3428'],6);for(let y=0;y<104;y++)P(70+Math.round(Math.sin(y*.1)*3),y,3,1,'#4e4638');break;
    case 'verge':fill((x,y)=>{const e=50+Math.round(Math.sin(x*.05)*3);return y<e?'#3a3a3c':y===e?'#c8b860':y<e+3?'#5a5244':'#4e5428';});tufts(30,['#3a4020','#6a7034'],9);break;
    case 'gravel':fill(()=>'#605848');stones(50,['#746a58','#908670','#3e382c'],11);P(48,0,12,104,'#120c08');P(49,0,10,104,'#5a4028');P(49,0,2,104,'#7a5a3a');P(48,60,12,5,'#3a3a40');break;
    case 'rock':fill((x,y)=>y<34?'#0a0806':'#3a3634');for(let x=0;x<160;x++){P(x,34,1,1,'#5a5450');}for(const [y,c] of [[60,'#5a4a3a'],[88,'#5a4a3a']])P(0,y,160,2,c);for(let x=4;x<160;x+=14)P(x,58,4,34,'#2a2018');
      for(let i=0;i<8;i++){const x=H(i,2)%150,y=40+H(2,i)%60;P(x,y,6,1,'#24201e');P(x+1,y+1,4,1,'#5a5450');}break;
    case 'wetrock':fill((x,y)=>{const b=((x/24|0)+(y/18|0))%3;return b===0?'#4a4c50':b===1?'#3a3c40':'#5a5c60';});for(let i=0;i<10;i++){const y=H(i,7)%100;for(let x=0;x<160;x+=3)P(x,y+Math.round(Math.sin(x*.2+i)),2,1,'#c8d8dc');}break;
    case 'roots':fill(()=>'#3a2e1e');for(const [x0,y0,x1,y1,w] of [[0,20,90,50,5],[160,10,70,46,4],[20,104,80,60,4],[150,100,96,58,3]]){for(let t=0;t<=1;t+=.01){const x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+Math.sin(t*6)*3;P(x,y,w,w,'#7a7a72');P(x,y,w,1,'#a4a29a');P(x,y+w-1,w,1,'#4a4a44');}}leaves(10,7);break;
    case 'quarry':fill((x,y)=>{const e=78+Math.round(Math.sin(x*.09)*2);return y<e?(((x/20|0)+(y/12|0))%2?'#6a6660':'#76726a'):y<e+2?'#a8a49a':'#0e0e10';});for(let i=0;i<6;i++){const x=H(i,5)%150,y=H(5,i)%70;P(x,y,8,1,'#4a4640');}break;
    case 'shore':fill((x,y)=>{const e=62+Math.round(Math.sin(x*.06)*3);return y<e?'#2e261c':y===e?'#4a3e2e':'#040506';});stones(6,['#3e3426','#5a4e3a','#1a140e'],12);break;
    case 'long':fill(()=>'#3a4420');break;
    case 'rail':fill((x,y)=>y<44?'#1e1810':y<50?'#2a2016':'#4a3824');P(0,40,160,8,'#120c08');P(0,41,160,6,'#7a5a3a');P(0,41,160,1,'#a8845a');for(const x of [20,138]){P(x,48,8,56,'#120c08');P(x+1,48,6,56,'#6a4e30');P(x+1,48,1,56,'#8a6a44');}
      for(let y=52;y<104;y+=7)P(0,y,160,1,'#2a1e12');break;
    case 'grass':fill(()=>'#4e5428');tufts(60,['#3a4020','#6a7034'],5);leaves(12,9);break;
    case 'path':fill((x,y)=>Math.abs(y-52-Math.sin(x*.04)*8)<26?'#6a5a40':'#4e5428');stones(20,['#7a6a50','#9a8a6a','#3e3426'],4);tufts(20,['#3a4020','#6a7034'],3);break;
    case 'pebbles':fill((x,y)=>y>84?'#1e3038':'#5a5650');for(let i=0;i<60;i++){const x=H(i,8)%154,y=H(8,i)%80;P(x,y,6,4,'#2a2824');P(x+1,y,4,3,['#8a867c','#9a948a','#7a766c'][i%3]);P(x+1,y,2,1,'#b8b4aa');}break;
    case 'concrete':fill((x,y)=>(x%40===0||y%32===0)?'#4a4844':'#7a7870');for(const [x,y,w] of [[30,10,20],[100,60,30],[12,70,14]]){P(x,y,w,6,'#6a6862');}break;
    case 'seat':fill((x,y)=>{const r=x%14;return y<14?'#2a2420':r===0?'#4a3a2a':r===1?'#a08a6a':'#8a765a';});P(0,14,160,2,'#3a2e22');for(let x=0;x<160;x+=14)for(let y=18;y<104;y+=4)P(x+1,y,1,1,'#c0a888');P(0,90,160,14,'#6a5a46');break;
    case 'peat':fill((x,y)=>(H(x>>2,y>>2)%9===0)?'#3e2c1a':'#2d2015');for(let i=0;i<5;i++)P(H(i,3)%150,H(3,i)%100,10,1,'#4a3622');break;
    case 'ash':fill((x,y)=>(H(x>>2,y>>2)%7===0)?'#2a2624':'#3a3634');for(const [x,y] of [[16,20],[124,74],[40,86]]){P(x,y,14,7,'#120c0a');P(x+1,y+1,12,5,'#6a2e22');P(x+1,y+1,12,1,'#8a4a3a');P(x+7,y+1,1,5,'#3a1a14');}
      for(let i=0;i<12;i++){const x=H(i,4)%156,y=H(4,i)%100;P(x,y,3,2,'#141212');P(x,y,1,1,'#c8501a');}break;
    case 'litter':fill(()=>'#2a2418');leaves(60,6);P(118,0,14,104,'#6a6a62');P(119,0,11,104,'#e8e4d8');P(119,0,3,104,'#f8f4ea');for(let y=6;y<100;y+=9)P(121,y,8,1,'#2a2a28');break;
    case 'dirt':fill(()=>'#4a3a26');stones(18,['#5e4c36','#7a6648','#2e2418'],7);break;
    case 'corn2':fill((x,y)=>y>92?'#3a2e1a':'#14110a');
      for(const [sx,sh,lean] of [[30,0,-.04],[48,1,.03],[100,0,.05],[119,1,-.03],[138,0,.02]]){for(let y=0;y<96;y++){const xx=Math.round(sx+(96-y)*lean);P(xx,y,3,1,sh?'#6a5a24':'#7a6a2c');P(xx,y,1,1,'#a89048');if(y%21===8)P(xx,y,3,1,'#4a3e18');}}
      // long blades drooping off the nodes, each its own angle, a pale midrib
      for(const [x0,y0,d,len,lift] of [[101,22,-1,30,6],[49,40,1,30,6],[118,58,-1,26,4],[31,74,1,24,5],[137,34,-1,22,7],[30,14,1,20,8]]){
        for(let t=0;t<len;t++){const f=t/len,px=x0+d*t,py=y0-Math.round(Math.sin(f*1.9)*lift)+Math.round(f*f*14),w=f<.7?2:1;P(px,py,1,w+1,'#6e5e26');P(px,py,1,1,'#b09a4c');if(w>1)P(px,py+1,1,1,'#8a7834');}}break;
    case 'falls2':fill((x,y)=>(((x+Math.round(Math.sin(y*.3)*2))>>2)%3===0)?'#2a3a42':'#1e2c34');
      for(const pts of [[[18,40,44,46,14],[30,64,50,70,12]],[[108,44,140,40,15],[104,66,126,72,12]]])sgtBlob(P,pts,['#121418','#3a3c42','#54565c','#7a7c84']);
      for(const [wx,wy] of [[30,34],[40,38],[118,34],[130,36],[36,58],[112,60]])P(wx,wy,2,1,'#e8f0f4');
      for(const [fx,fy] of [[62,74],[92,72],[78,80]])for(let i=0;i<6;i++){const a=i*1.1;sgtBlob(P,[[fx+Math.cos(a)*3,fy+Math.sin(a)*1.5,fx+Math.cos(a)*3,fy+Math.sin(a)*1.5,1.6]],['#a8b8c0','#c8d8dc','#e8f0f4','#ffffff']);}break;
    case 'turf':fill((x,y)=>{const e=28+Math.round(Math.sin(x*.07)*2);return y<e-6?(H(x>>2,y>>2)%5===0?'#4a5428':'#3e4a22'):y<e?((y+(x>>3))%3===0?'#2a1e12':'#3a2a1a'):y===e?'#4a3622':(H(x>>2,y>>2)%9===0?'#3e2c1a':'#2d2015');});
      for(let x=0;x<160;x+=9){const e=28+Math.round(Math.sin(x*.07)*2);P(x,e-6,1,6,'#1e140c');}break;
    case 'chstep':fill((x,y)=>{const r=y%22;return r<3?'#9a9890':r<14?(((x/30|0)+(y/22|0))%2?'#7a7872':'#84827a'):r<16?'#2a2a2e':'#5a5a5e';});for(let x=0;x<160;x+=30)for(let y=0;y<104;y+=22)P(x,y+3,1,11,'#4a4a50');break;
    case 'mine2':fill((x,y)=>y<30?'#2e2a28':'#3a3430');for(let y=36;y<62;y++)P(58,y,44,1,'#050404');P(50,30,8,40,'#120c08');P(51,30,6,40,'#5a4028');P(51,30,2,40,'#7a5a3a');P(102,30,8,40,'#120c08');P(103,30,6,40,'#4a3420');
      P(48,30,64,7,'#120c08');P(49,31,62,5,'#5e4430');P(49,31,62,1,'#8a6a46');
      for(let y=62;y<104;y++){const t=(y-62)/42,l=Math.round(72-t*30),r=Math.round(88+t*30);if((y-62)%Math.max(3,Math.round(3+t*6))===0)P(l-2,y,r-l+5,2,'#4a3420');P(l,y,2,1,'#8a8a90');P(r,y,2,1,'#8a8a90');P(l,y,1,1,'#c8c8d0');}
      for(let y=48;y<62;y++){P(76,y,1,1,'#2a2a2e');P(84,y,1,1,'#2a2a2e');}break;
    case 'shore2':fill((x,y)=>{const e=x*.55+30;return y<e?'#2e261c':y<e+2?'#4a3e2e':'#040506';});stones(5,['#3e3426','#5a4e3a','#1a140e'],12);break;
    case 'ring':fill(()=>'#4e5428');tufts(50,['#3a4020','#6a7034'],5);for(let a=3.4;a<6.1;a+=.03)P(Math.round(80+Math.cos(a)*50),Math.round(46+Math.sin(a)*12),2,2,'#5e5034');
      for(const [sx,sw,sh,by] of [[40,10,30,40],[74,8,22,34],[106,8,26,38]]){P(sx-1,by-sh-1,sw+2,sh+1,'#120c08');P(sx,by-sh,sw,sh,'#5e5e64');P(sx,by-sh,2,sh,'#7e7e86');P(sx+sw-2,by-sh,2,sh,'#3e3e44');P(sx,by-sh,sw,1,'#8e8e96');P(sx-2,by,sw+4,2,'#2a3018');}break;
    case 'gravel2':fill(()=>'#605848');stones(40,['#746a58','#908670','#3e382c'],11);P(34,0,10,64,'#1a1a1e');P(35,0,8,64,'#6a6e74');P(35,0,2,64,'#9a9ea4');P(30,62,18,8,'#120c08');P(31,62,16,7,'#8a8880');P(31,62,16,1,'#aaa8a0');
      P(14,0,60,12,'#120c08');P(15,0,58,11,'#2a6a3a');P(15,9,58,1,'#e8e8e0');P(37,14,4,1,'#3a3a40');P(37,40,4,1,'#3a3a40');break;
  }}
// ---- chalk that can do sums (the game's pixel font has no + = -)
const CG_GLY={'+':'000010111010000','=':'000111000111000','-':'000000111000000','?':'110001010000010'};
function cgT(P,str,x,y,col){let X=x;for(const ch of String(str).toUpperCase()){const f=CG_GLY[ch]||((typeof PXFONT!=='undefined'&&PXFONT[ch])||null);if(!f){X+=3;continue;}
  for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(f[j*3+i]==='1')P(X+i,y+j,1,1,col);X+=4;}return X;}
// ---- the things themselves
const cgMar=(P,x,y,c,r)=>{r=r||3;const R2=r*r,c2=sgtShade(c,1.75);for(let j=-Math.ceil(r);j<=Math.ceil(r);j++)for(let i=-Math.ceil(r);i<=Math.ceil(r);i++){const d=i*i+j*j;if(d>R2+.6)continue;
    let col=d>R2-r*1.4?'#0e0e12':(i+j>r*.7?sgtShade(c,.62):c);const a=Math.atan2(j,i);if(d<=R2-r*1.4&&Math.sin(a*2+Math.sqrt(d)*1.3)>.55)col=c2;P(x+i,y+j,1,1,col);}
  P(x-Math.round(r*.45),y-Math.round(r*.5),1,1,'#ffffff');if(r>=3)P(x-Math.round(r*.45)+1,y-Math.round(r*.5),1,1,'#e8f0ff');};
const cgMarOld=(P,x,y,c,r)=>{r=r||2.7;sgtBlob(P,[[x,y,x,y,r]],['#0e0e12',sgtShade(c,.55),c,sgtShade(c,1.4)]);for(let i=-1;i<=1;i++)P(x+i,y+Math.round(Math.sin(i*1.4)*1.2),1,1,sgtShade(c,1.8));P(x-Math.round(r*.5),y-Math.round(r*.5),1,1,'#ffffff');if(r>3)P(x-Math.round(r*.5)+1,y-Math.round(r*.5),1,1,'#e8f0ff');};
function cgHorse(P,x,y,o){const R=o.c==='pink'?['#4a2030','#a8708a','#cc98ae','#ecc4d4']:o.c==='char'?['#060504','#141210','#24201c','#3e3630']:['#1e140a','#5e4630','#7e6040','#a4825a'];
  const back=[R[0],sgtShade(R[1],.8),sgtShade(R[2],.8),R[2]],rot=o.rot||0,cs=Math.cos(rot),sn=Math.sin(rot);
  const T=(u,v)=>[x+u*cs-v*sn,y+u*sn+v*cs],C=(u1,v1,u2,v2,r)=>{const a=T(u1,v1),b=T(u2,v2);return [a[0],a[1],b[0],b[1],r];},D=(u,v,w,h,c)=>{const [a,b]=T(u,v);P(Math.round(a),Math.round(b),w,h,c);};
  P(x-26,y+18+(o.base?15:0)-(rot?3:0),56,3,'#00000055');
  if(o.base){sgtBlob(P,[[x-28,y+24,x+28,y+24,6.5]],R);for(let i=0;i<o.base.length;i++){const w=o.base[i].length*4-1,tx=x-(w>>1),ty=y+20+i*6;sgtT(P,o.base[i],tx,ty+1,sgtShade(R[3],1.25));sgtT(P,o.base[i],tx,ty,R[0]);}
    for(const wx of [-20,20])sgtBlob(P,[[x+wx,y+31,x+wx,y+31,3.6]],['#120c06','#3a2a18','#4e3a24','#6a5034']);}
  sgtBlob(P,[C(-10,4,-11,17,2),C(9,4,10,17,2)],back);
  sgtBlob(P,[C(-12,0,13,0,6.5)],R);
  sgtBlob(P,o.broken?[C(-6,4,-6,10,2.1),C(13,4,13,18,2.1)]:[C(-6,4,-6,18,2.1),C(13,4,13,18,2.1)],R);
  if(o.broken){for(const [u,v] of [[-7,10],[-5,11],[-6,11]])D(u,v,1,1,'#d8c098');sgtBlob(P,[[x-30,y+20,x-24,y+21,2]],R);P(x-24,y+19,1,3,'#d8c098');}
  const nk=o.graze?[C(-11,-2,-19,5,4),C(-20,6,-25,13,3.4),C(-17,1,-15,-3,1.4)]:[C(-11,-2,-17,-13,4),C(-17,-14,-26,-10,3.6),C(-15,-17,-14,-21,1.4)];sgtBlob(P,nk,R);
  if(o.graze){for(let i=0;i<8;i++)D(-11-i*1,-4+i*1.1,2,1,R[1]);D(-23,9,2,1,R[0]);}else{for(let i=0;i<9;i++)D(-11-i*.7,-6-i*1.2,2,1,o.c==='pink'?'#e8b0c8':R[1]);D(-22,-14,2,1,R[0]);D(-26,-9,1,1,R[0]);}
  for(let i=0;i<3;i++)for(let j=0;j<11;j++)D(19+i+Math.round(j*.3),-3+j,1,1,o.c==='char'?'#1a1612':i%2?'#8a7a5a':'#b8a478');
  if(o.c==='wood'||!o.c)for(let i=0;i<5;i++)D(-8+i*5,-2+(i%2)*3,3,1,R[1]);
  if(o.c==='char'){for(let i=0;i<14;i++){const ex=x-20+cgH(i,5)%40,ey=y-10+cgH(5,i)%24;P(ex,ey,1,1,i%3?'#c8501a':'#f0a040');}for(let i=0;i<6;i++)D(-12+i*5,-1+(i%2)*2,3,1,'#000000');}}
function cgCap(P,x,y,o){const c=o.c||'#6a5a4a',R=['#120c08',sgtShade(c,.6),c,sgtShade(c,1.3)];if(!o.snag)P(x-20,y+12,40,3,'#00000055');
  if(o.st==='bonnet'&&o.lie&&o.flatlie){const F=['#1a1418',sgtShade(c,.72),c,sgtShade(c,1.12)],rb=o.rib||'#c86a8a';
    // fallen on its crown: we look into it, the brim up round the hollow, the ribbons spread flat on the grass
    for(const d of [-1,1])for(let t=0;t<20;t++){const px=x+d*(12+t),py=y+4+Math.round(Math.sin(t*.35)*2)+(d>0?t*.2:0);P(px,py,1,3,t%5===4?sgtShade(rb,.7):rb);P(px,py,1,1,sgtShade(rb,1.35));}
    sgtBlob(P,[[x-4,y,x+4,y,12]],F);sgtBlob(P,[[x-2,y+1,x+2,y+1,8.4]],['#8a8478','#a8a296','#bcb6a8','#cec8ba']);
    for(let a2=0;a2<6.283;a2+=.09){const px=Math.round(x+Math.cos(a2)*14.2),py=Math.round(y+Math.sin(a2)*10.4);P(px,py,1,1,(Math.round(a2*9)%2)?sgtShade(c,1.15):sgtShade(c,.9));}
    for(let k=0;k<3;k++)P(x-6+k*5,y-4+(k%2),3,1,sgtShade(c,.8));
    P(x+14,y+2,7,5,rb);P(x+13,y+1,3,7,sgtShade(rb,.75));P(x+19,y+1,3,7,sgtShade(rb,.75));P(x+16,y+3,2,2,sgtShade(rb,.6));}
  else if(o.st==='bonnet'){const F=['#1a1418',sgtShade(c,.62),c,sgtShade(c,1.28)],rb=o.rib||sgtShade(c,.82);if(o.lie)P(x-18,y+13,40,4,'#00000055');
    // hung from a leaf by its ties: two flat ribbons up from the brim's lower corners to a knot round the blade
    if(o.hang){const kx=x+4,ky=y-26;for(const [sx,sy] of [[x-12,y+10],[x+4,y+9]])for(let t=0;t<=1;t+=.03){const px=Math.round(sx+(kx-sx)*t+Math.sin(t*3.1)*(sx<x?-4:4)),py=Math.round(sy+(ky-sy)*t);P(px,py,3,1,rb);P(px,py,1,1,sgtShade(rb,1.3));P(px+2,py,1,1,sgtShade(rb,.7));}
      P(kx-3,ky-2,7,4,rb);P(kx-5,ky-4,3,4,sgtShade(rb,.8));P(kx+3,ky-4,3,4,sgtShade(rb,.8));P(kx-1,ky-1,2,2,sgtShade(rb,.55));}
    sgtBlob(P,[[x+5,y-6,x+12,y-1,9]],F);for(let k=0;k<4;k++)for(let t=0;t<12;t++){const a=-1.4+t*.24;P(Math.round(x+9+Math.cos(a)*(3+k*1.7)),Math.round(y-3+Math.sin(a)*(3+k*1.7)),1,1,F[1]);}
    for(let i=0;i<16;i++){const h=5+((i>>1)%2);P(x+3+i,y+7,1,h,i%3===0?F[1]:F[2]);P(x+3+i,y+7+h,1,1,F[0]);}
    sgtBlob(P,[[x-4,y-6,x-4,y+6,11]],F);
    for(let a=3.3;a<5.6;a+=.04){const px=Math.round(x-4+Math.cos(a)*10.4),py=Math.round(y+Math.sin(a)*16.2);P(px,py,1,1,sgtShade(c,1.5));}
    const lin=o.lining||sgtShade(c,1.45);for(let py=y-12;py<=y+13;py++)for(let px=x-15;px<=x+1;px++){const e=((px-(x-7))/7)**2+((py-(y+.5))/11.5)**2;if(e>1)continue;
      const dd=Math.hypot((px-(x-4))/6,(py-(y+2))/9);let col=dd<.45?sgtShade(lin,.42):dd<.75?sgtShade(lin,.62):dd<1.05?sgtShade(lin,.82):lin;
      if(((px-(x-4))*7+(py-(y+2))*3)%9===0&&dd>.45)col=sgtShade(col,.85);if((Math.abs(px-(x-10)+Math.round((py-y)*.5))<1&&py<y+2)||(Math.abs(px-(x-5)-Math.round((py-y)*.3))<1&&py>y+4))col=sgtShade(lin,.7);P(px,py,1,1,col);}
    for(let a=0;a<6.283;a+=.04){const rr=8.3+Math.sin(a*11)*.35,px=Math.round(x-7+Math.cos(a)*rr),py=Math.round(y+.5+Math.sin(a)*(rr+3.9));P(px,py,1,1,Math.sin(a*11)>.2?sgtShade(c,1.5):sgtShade(c,1.2));P(Math.round(x-7+Math.cos(a)*(rr+1)),Math.round(y+.5+Math.sin(a)*(rr+4.9)),1,1,sgtShade(c,a>3.3&&a<5.6?1.35:1.05));}
    if(o.lie){const rb=o.rib||'#c86a8a';for(const [sx,sy,d] of [[x-12,y+11,-1],[x+2,y+12,1]])for(let t=0;t<22;t++){const px=sx+d*Math.round(t*.9),py=sy+Math.round(t*.35+Math.sin(t*.4)*1.5);P(px,py,3,1,rb);P(px,py,1,1,sgtShade(rb,1.35));}
      const kx=x+22,ky=y+18;P(kx-3,ky-2,7,4,rb);P(kx-6,ky-4,4,4,sgtShade(rb,.8));P(kx+3,ky-4,4,4,sgtShade(rb,.8));P(kx,ky-1,2,2,sgtShade(rb,.55));}}
  else if(o.st==='flat'){const F=['#140e0a',sgtShade(c,.68),c,sgtShade(c,1.18)];
    // the crown from above, a soft oval; the peak toward you, a flat lighter half-moon along the near edge, its shadow under it
    sgtBlob(P,[[x-9,y-3,x+9,y-4,8.4]],F);
    for(const [bx,by] of [[x-10,y-7],[x+2,y-9],[x-4,y-1]])for(let i=0;i<6;i++){P(bx+i,by+(i%2),1,1,sgtShade(c,1.25));P(bx+i,by+1-(i%2),1,1,sgtShade(c,.8));}
    for(let i=-6;i<=6;i++)P(x+i,y-12+Math.round((i*i)/14),1,1,F[1]);P(x-1,y-12,3,2,F[1]);P(x-1,y-12,1,1,F[2]);
    for(let px=x-13;px<=x+13;px++){const t=(px-x)/13,d=Math.round(Math.sqrt(Math.max(0,1-t*t))*6);if(d<1)continue;
      P(px,y+3,1,1,'#0a0806');for(let j=1;j<=d;j++)P(px,y+3+j,1,1,j===1?sgtShade(c,1.55):j===d?sgtShade(c,.95):sgtShade(c,1.32));P(px,y+4+d,1,2,'#0a0806');}
    for(let px=x-12;px<=x+12;px++)P(px,y+6+Math.round(Math.sqrt(Math.max(0,1-((px-x)/13)**2))*6)+2,1,1,'#00000066');
    for(let i=0;i<16;i++){const wy=y-11+Math.round(Math.sin(i*.6)*1.2)-Math.round(i*.2);P(x+2+i,wy,1,1,'#c8d8dc');P(x+2+i,wy-1,1,2,'#2a3a42');}P(x+12,y-14,3,1,'#ffffff');}
  else if(o.st==='folded'){const F=['#120608',sgtShade(c,.62),c,sgtShade(c,1.35)];sgtBlob(P,[[x-12,y+3,x+12,y+3,4.5],[x-10,y-1,x+10,y-1,5.5],[x-6,y-6,x+6,y-6,4.5]],F);
    for(const k of [-1,0,1])for(let t=0;t<13;t++)P(Math.round(x+k*7*(1-t/13)),y+5-t,1,1,F[1]);P(x-1,y-10,3,2,F[3]);P(x,y-10,1,1,'#ffffff');
    P(x-12,y+5,25,2,sgtShade(c,1.2));P(x-12,y+7,25,1,F[0]);for(let i=0;i<5;i++)P(x-9+i*4,y-2,2,1,sgtShade(c,1.6));}
  else if(o.st==='ragcap'){const F=['#120c08',sgtShade(c,.62),c,sgtShade(c,1.25)];sgtBlob(P,[[x-3,y,x+3,y+1,13]],F);
    for(let t=0;t<22;t++){const px=x-9+t,py=y-3+Math.round(Math.sin(t*.28)*3);P(px,py,1,1,F[0]);P(px,py-1,1,1,F[3]);}
    for(let t=0;t<12;t+=2)P(x+2,y+2+t,1,1,'#d8ccb0');P(x-10,y+3,7,6,'#5a4a3a');P(x-10,y+3,7,1,'#7a6a52');for(let i=0;i<7;i+=2)P(x-10+i,y+9,1,1,'#d8ccb0');
    for(let a=0;a<6.283;a+=.35){const px=Math.round(x+Math.cos(a)*15.5),py=Math.round(y+.5+Math.sin(a)*13.5);if(cgH(px,py)%3===0)P(px,py,1,2,F[1]);}
    for(const [rx,ry,ph] of [[17,12,0],[18.5,13.5,1]])for(let a=0;a<6.283;a+=.04){const px=Math.round(x+Math.cos(a)*rx),py=Math.round(y+1+Math.sin(a)*ry*.62);P(px,py,1,1,(Math.round(a*12)+ph)%2?'#6a5a2a':'#c8b468');}
    for(let j=0;j<10;j++)P(x+17+(j%2),y+7+j,1,1,j%2?'#6a5a2a':'#c8b468');}
  else if(o.st==='knit'){sgtBlob(P,[[x-11,y+2,x+11,y+2,5],[x-9,y-3,x+9,y-3,5],[x-6,y-7,x+6,y-7,4]],R);for(let ry=y-9;ry<y+6;ry+=2)for(let rx=x-12;rx<x+12;rx+=3)P(rx+((ry>>1)&1),ry,1,1,R[1]);
    for(let rx=x-12;rx<=x+12;rx++)for(let ry=y+3;ry<y+8;ry++)P(rx,ry,1,1,(rx&1)?R[1]:R[2]);P(x-12,y+3,25,1,R[3]);sgtBlob(P,[[x,y-13,x,y-13,3.2]],['#120c08','#c8c0b0','#e8e0d0','#ffffff']);}
  else if(o.st==='rag'){sgtBlob(P,[[x-11,y,x+8,y-1,6.5]],R);sgtBlob(P,[[x+7,y+4,x+17,y+6,2.4]],[R[0],sgtShade(c,.45),sgtShade(c,.65),sgtShade(c,.85)]);
    for(const [px,py,w,pc] of [[x-8,y-4,6,'#7a4a3a'],[x+1,y-2,5,'#4a5a6a']]){P(px,py,w,4,pc);P(px,py,w,1,sgtShade(pc,1.3));for(let i=0;i<w;i+=2)P(px+i,py+4,1,1,'#d8ccb0');}
    for(let rx=x-17;rx<x+8;rx+=2)P(rx,y+6+((rx>>1)&1),1,2,R[1]);for(let rx=x+9;rx<x+18;rx+=2)P(rx,y+8,1,2,sgtShade(c,.45));
    for(let i=0;i<30;i++)P(x-15+i,y+3+Math.round(Math.sin(i*.4)),1,1,i%2?'#6a5a2a':'#c8b468');for(let j=0;j<12;j++)P(x+16+(j%2),y+4+j,1,1,j%2?'#6a5a2a':'#c8b468');}
  else if(o.st==='sunhat'){const S=['#3a2a10','#9a7a3a','#c8a456','#e8cc80'];for(let a=0;a<6.283;a+=.02)for(let r=12;r<23;r++){const px=Math.round(x+Math.cos(a)*r),py=Math.round(y+4+Math.sin(a)*r*.42);P(px,py,1,1,r>21?S[0]:((r+Math.round(a*12))%3===0?S[1]:Math.sin(a)<-.2?S[3]:S[2]));}
    sgtBlob(P,[[x-8,y-1,x+8,y-1,7]],S);for(let rx=x-14;rx<=x+14;rx++)P(rx,y+3,1,2,Math.abs(rx-x)<15?'#3a5a9a':'#3a5a9a');P(x-15,y+3,30,1,'#5a7aba');}
  }
// ---- the cloth bag (Mary Pruitt's): a round glass marble, letters stitched big enough to read, and the bag itself
const CG_GLASS=['..oooo..','.owlbbo.','owlbssbo','olbsbbdo','obbssbdo','obbbsddo','.odssdo.','..oooo..'];   // (a hooked S of colour inside the glass)
function cgGlass(P,x,y,c,sw){const k={o:'#0e0e12',w:'#ffffff',l:sgtShade(c,1.45),b:c,d:sgtShade(c,.58),s:sw||sgtShade(c,1.9)};
  CG_GLASS.forEach((r,j)=>{for(let i=0;i<8;i++){const ch=r[i];if(ch!=='.')P(x-4+i,y-4+j,1,1,k[ch]);}});P(x-1,y+4,4,1,'#00000066');P(x+3,y+3,1,1,'#00000055');P(x+4,y+1,1,2,'#00000044');}   // (its shadow tucked under it, down-right)
const CG_STITCH={M:['11...11','111.111','11.1.11','11...11','11...11','11...11','11...11'],P:['11111.','11..11','11..11','11111.','11....','11....','11....'],
  '.':['..','..','..','..','..','11','11']};
function cgStitch(P,t,x,y,col){const sh=sgtShade(col,.55),hi=sgtShade(col,1.35);let w=0;for(const ch of t){const g=CG_STITCH[ch];if(g)w+=g[0].length+1;}w--;let X=x-(w>>1);
  for(const ch of t){const g=CG_STITCH[ch];if(!g)continue;g.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='1'){P(X+i,y+j+1,1,1,sh);}});
    g.forEach((r,j)=>{for(let i=0;i<r.length;i++)if(r[i]==='1')P(X+i,y+j,1,1,(j===0||r[i-1]!=='1')&&j<2?hi:col);});X+=g[0].length+1;}return w;}
const cgCanStitch=t=>!!t&&t.length<=4&&[...t].every(ch=>CG_STITCH[ch]);
function cgClothBag(P,x,y,o,pal){const c=o.c||'#8a7a5a',R=['#120c08',sgtShade(c,.62),c,sgtShade(c,1.22)],cord='#5a3a1a',cordL='#8a6038';
  P(x-20,y+13,40,3,'#00000055');
  cgGlass(P,x+19,y+12,pal[3],'#fff4c0');   // (this one has rolled half under the cloth)
  // the body, the shoulders narrowing to the neck, the gathered ruffle above the tie
  sgtBlob(P,[[x-9,y+5,x+9,y+5,9.5],[x-4,y-3,x+4,y-3,6.5]],R);
  sgtBlob(P,[[x-2,y-11,x+2,y-11,2.6]],R);
  // the ruffle flares out above the tie like a skirt turned up: pleats fanning from the cord, a ragged lip, its inside dark
  {const H=8;for(let r=0;r<H;r++){const fy=y-11-r,hw=Math.round(3+r*.62);for(let dx=-hw;dx<=hw;dx++){const lip=r>=H-1-((dx+hw*3+r)%3===0?1:0)&&r>=H-2;
      const pl=Math.round(dx*3/hw*.9+3)%2;let col=dx===-hw||dx===hw?R[0]:pl?R[1]:(dx<0?R[3]:R[2]);if(r===H-1)col=(dx+hw)%3===1?R[0]:R[3];P(x+dx,fy,1,1,col);}}
    for(let dx=-6;dx<=6;dx+=3)P(x+dx,y-11-H,2,1,R[0]);P(x-3,y-11-H+1,7,1,'#2a1e12');}
  // the cord, wound twice round the neck, knotted, with its end hanging
  for(const cy of [y-10,y-8]){P(x-4,cy,9,1,cord);P(x-3,cy,7,1,cordL);P(x-4,cy+1,9,1,'#2a1a0a');}
  P(x+5,y-10,3,3,cord);P(x+6,y-10,1,1,cordL);for(let i=0;i<6;i++)P(x+7+(i>>1),y-7+i,1,1,i%2?cord:cordL);
  // the folds run down and out from the tie, and stop short of the letters
  for(const [fx,d] of [[-5,-1],[-2,0],[2,0],[5,1]])for(let i=0;i<4;i++)P(x+fx+Math.round(d*i*.7),y-6+i,1,1,R[1]);
  for(const fx of [x-14,x+14])for(let i=0;i<6;i++)P(fx+(fx<x?-(i>>2):(i>>2)),y+1+i,1,1,R[1]);
  // her initials in red thread, and a running stitch under them
  if(cgCanStitch(o.t))cgStitch(P,o.t,x,y-1,'#c83a2a');else if(o.t){const w=o.t.length*4-1;sgtT(P,o.t,x-(w>>1),y+2,'#c83a2a');}
  for(let i=0;i<22;i++)if(i%3!==2)P(x-11+i,y+9,1,1,i%3===0?'#d8b04a':'#a8802a');
  // the rest, spilled where they rolled: not in a row
  for(const [dx,dy,k,sw] of [[-14,13,0,'#bfe0ff'],[-5,17,1,'#ffd0c0'],[7,15,2,'#d8ffd8'],[27,19,4,'#c8d0e8']])cgGlass(P,x+dx,y+dy,pal[k],sw);}
function cgMarbles(P,x,y,o){const pal=['#2a6aba','#c83a2a','#2a9a5a','#d8b83a','#e8e8f0','#7a3aa8'];
  if(o.st==='bag'){cgClothBag(P,x,y,o,pal);}
  else if(o.st==='flour'||o.st==='stones'){const c=o.st==='flour'?'#d8d0bc':(o.c||'#8a7a5a'),R=['#120c08',sgtShade(c,.6),c,sgtShade(c,1.25)];P(x-18,y+14,36,3,'#00000055');
    sgtBlob(P,[[x-10,y+5,x+10,y+5,9],[x-6,y-5,x+6,y-5,6.5],[x-3,y-13,x+3,y-13,3]],R);for(let i=0;i<12;i++)P(x-6+i,y-10+(i%2),1,1,'#3a2a14');P(x+6,y-10,4,1,'#3a2a14');P(x+9,y-10,1,6,'#3a2a14');
    for(let i=0;i<5;i++)P(x-8+i*4,y-4+(i%2),1,3+(i%2),R[1]);for(const fx of [x-13,x+13])P(fx,y+1,1,7,R[1]);   // (gathers under the neck and folds at the sides, clear of what's stitched on it)
    if(o.t){const w=o.t.length*4-1;for(let i=0;i<w;i+=2)P(x-(w>>1)+i,y+9,1,1,'#c8a03a');sgtT(P,o.t,x-(w>>1),y+2,'#c83a2a');}
    if(o.st==='flour'){sgtT(P,'FLOUR',x-9,y+1,'#9a8a6a');for(let i=0;i<20;i++)P(x-20+cgH(i,1)%40,y+12+cgH(1,i)%6,1,1,'#ece4d4');}
    if(o.st==='stones'){for(const [sx,sy,f] of [[x-20,y+12,0],[x+16,y+10,1],[x+4,y+16,2]]){sgtBlob(P,[[sx-2,sy,sx+2,sy,3.6]],['#1a1a18','#6a6660','#8a867c','#b4b0a6']);P(sx-2,sy-1,1,1,'#ffffff');P(sx+2,sy-1,1,1,'#ffffff');P(sx-1,sy+1+(f===1?0:1),3,1,f===2?'#c83a2a':'#ffffff');}}
    else for(let i=0;i<5;i++)cgMar(P,x-16+i*8+(i%2)*2,y+14+(i%3)*2,pal[i%pal.length]);}
  else if(o.st==='twist'){P(x-18,y+9,42,3,'#00000055');const W=['#2a2014','#a89c80','#d4c8aa','#eee4cc'];
    sgtBlob(P,[[x-12,y,x-4,y-.6,7],[x-4,y-.6,x+4,y-1.4,4.8],[x+4,y-1.4,x+9,y-2,2.8]],W);
    for(let i=0;i<9;i++){P(x+9+i,y-2-Math.round(i*.45),1,3,i%2?W[1]:W[3]);}
    for(const [fx,fy] of [[x-8,y-5],[x-2,y-3],[x+2,y+1]]){P(fx,fy,1,4,W[1]);P(fx+1,fy,1,4,W[3]);}
    sgtBlob(P,[[x-13,y-1,x-13,y+1,5.4]],['#2a2014','#1a140c','#241c12','#3a2e1c']);cgMar(P,x-14,y+1,pal[0],3.2);cgMar(P,x-21,y+7,pal[1],3);
    for(const [cx2,cy2] of [[x+12,y+10],[x+21,y+7],[x+18,y+14]]){sgtBlob(P,[[cx2-1.5,cy2,cx2+1.5,cy2,3.2]],['#3a1a0a','#7a3c12','#b06a2a','#d89048']);P(cx2-3,cy2-1,6,1,'#e8a858');P(cx2-1,cy2,2,1,'#7a3c12');P(cx2-3,cy2-2,1,1,'#ffffff');}}
  else if(o.st==='spill'){const c=o.c||'#7a6a52',R=['#120c08',sgtShade(c,.6),c,sgtShade(c,1.25)];P(x-28,y+9,62,3,'#00000055');
    sgtBlob(P,[[x-22,y+1,x-6,y-1,8.5],[x-6,y-1,x-2,y-1,6]],R);for(let i=0;i<4;i++)P(x-20+i*4,y-6+(i%2),1,10,R[1]);
    sgtBlob(P,[[x-1,y-1,x-1,y+1,5]],['#120c08','#1a140c','#241c12','#2e2418']);for(let i=0;i<8;i++)P(x-4+i,y-7+Math.round(Math.sin(i)*1),1,1,'#3a2a14');
    for(const [sx,sy,f] of [[x+8,y+3,0],[x+19,y-3,1],[x+27,y+6,2],[x+15,y+10,0]]){sgtBlob(P,[[sx-2,sy,sx+2,sy,4.6]],['#1a1a18','#6a6660','#8a867c','#b4b0a6']);
      P(sx-2,sy-1,1,2,'#ffffff');P(sx+2,sy-1,1,2,'#ffffff');if(f===0){P(sx-2,sy+2,1,1,'#ffffff');P(sx-1,sy+3,3,1,'#ffffff');P(sx+2,sy+2,1,1,'#ffffff');}
      else if(f===1){P(sx-2,sy+3,1,1,'#c83a2a');P(sx-1,sy+2,3,1,'#c83a2a');P(sx+2,sy+3,1,1,'#c83a2a');}else P(sx-1,sy+2,3,1,'#ffffff');}}
  else {for(const [i,dx,dy,r] of [[0,-24,-2,4.6],[1,-8,8,4.2],[2,4,-9,4.6],[3,20,3,4],[4,9,14,3.6]])cgMar(P,x+dx,y+dy,pal[i%pal.length],r);}}
function cgShoe(P,x,y,o){const c=o.c||'#4a3424',R=['#0e0806',sgtShade(c,.6),c,sgtShade(c,1.3)];P(x-18,y+8,38,3,'#00000055');
  if(o.st==='sneaker'){const w=o.c2||'#e8e8e0';sgtBlob(P,[[x-14,y+5,x+13,y+5,2.6]],['#1a1a1a','#9a9a94','#d8d8d0','#f4f4ee']);sgtBlob(P,[[x-12,y,x+10,y-1,5],[x+6,y-3,x+11,y-6,4.2]],R);
    sgtBlob(P,[[x-14,y+2,x-9,y+1,3]],['#1a1a1a','#b8b8b0','#e8e8e0','#ffffff']);for(let i=0;i<5;i++){P(x-6+i*2.6,y-5-i*.4,2,1,w);P(x-5+i*2.6,y-4-i*.4,1,1,'#ffffff');}
    for(let i=0;i<14;i++)P(x-6+i,y+1-Math.round(Math.sin(i/13*3.1)*3),1,1,o.c2||'#c83a2a');P(x+6,y-8,5,3,'#140c0a');}
  else if(o.st==='boot'){sgtBlob(P,[[x-13,y+1,x+6,y+1,4.4],[x+4,y-2,x+6,y-16,4.6]],['#060508','#1a1820','#2a2834','#5a5a6c']);P(x-15,y+5,24,2,'#0a0a0a');P(x+2,y+5,7,3,'#0a0a0a');
    for(let i=0;i<5;i++){P(x+1,y-13+i*3,1,1,'#8a8a98');P(x+1,y-13+i*3,1,1,'#c8c8d0');}for(let i=0;i<5;i++)P(x+5,y-14+i*3,3,1,'#6a5a4a');P(x+3,y-20,6,2,'#0a0a0e');}
  else if(o.st==='jelly'){const J='#b04a7a';sgtBlob(P,[[x+6,y+11,x+2,y+3,5.6],[x+2,y+3,x-4,y-9,7.4]],[J,'#d070a0b0','#e88ab0a0','#ffc8e0c0']);
    for(const [a1,b1,a2,b2] of [[-11,-10,5,-1],[5,-11,-11,-1]])for(let t=0;t<=1;t+=.04){const px=Math.round(x+a1+(a2-a1)*t),py=Math.round(y+b1+(b2-b1)*t);P(px,py,3,2,'#d8609a');P(px,py,3,1,'#f4a8cc');}
    for(let i=-6;i<=8;i++)P(x+i,y+6+Math.round(Math.abs(i-1)*.15),1,2,'#d8609a');P(x+8,y+5,3,4,'#d8d8e0');P(x+9,y+6,1,2,'#7a7a84');P(x-2,y-6,1,1,'#ffffff');P(x+3,y-8,2,1,'#ffffff');}
  else {const s2=1.35,X=v=>Math.round(x+v*s2),Y=v=>Math.round(y+v*s2);
    P(X(-13),Y(5),X(12)-X(-13),3,'#140c08');P(X(6),Y(5),X(12)-X(6),5,'#0e0806');
    sgtBlob(P,[[X(-12),Y(2),X(3),Y(1.5),4.6*s2],[X(3),Y(0),X(9),Y(-1),4.4*s2]],R);
    sgtBlob(P,[[X(3),Y(-3),X(8),Y(-3.5),2.2*s2]],[sgtShade(c,1.45),'#0a0604','#140c08','#2e1c10']);P(X(3),Y(-1.5),X(8)-X(3),1,sgtShade(c,.75));
    for(let i=0;i<7;i++)P(X(-11)+i,Y(-2)+Math.round(Math.abs(i-3)*.4),1,1,sgtShade(c,1.5));for(let i=0;i<8;i+=2)P(X(-6),Y(-2)+i,1,1,sgtShade(c,.55));
    if(o.st==='mary'){for(let j=0;j<9;j++)P(X(1)+Math.round(j*-.35),Y(-4)+j,2,1,R[0]);P(X(-2),Y(2.5),4,4,'#a8a8b0');P(X(-1),Y(3),1,1,'#ffffff');P(X(-2),Y(2.5),4,1,'#d0d0d8');}
    else for(let i=0;i<3;i++)P(X(-4)+i*3,Y(-3)+i,3,1,'#d8ccb0');
    for(let i=0;i<6;i++)P(X(-11)+i*5,Y(4.5),2,1,sgtShade(c,.55));}
  if(o.wet)for(let i=0;i<10;i++)P(x-22+cgH(i,2)%44,y+8+cgH(2,i)%4,2,1,'#9aa8b0');}
function cgSlate(P,x,y,o){P(x-36,y+24,74,4,'#00000055');P(x-36,y-26,72,50,'#120c08');P(x-35,y-25,70,48,'#7a5a3a');P(x-35,y-25,70,1,'#a8845a');P(x-35,y-25,1,48,'#a8845a');P(x-35,y+22,70,1,'#4a3420');P(x-36,y+24,72,3,'#4a3420');
  P(x-31,y-21,62,40,'#2c3234');for(let i=0;i<9;i++){const sx=x-29+cgH(i,4)%56,sy=y-19+cgH(4,i)%36;P(sx,sy,6,2,'#363e40');}
  const ch='#e4e4dc',C=(a,b,w,h)=>{for(let i=0;i<w;i++){if(cgH(a+i,b)%7)P(a+i,b,1,1,ch);if(cgH(a+i,b+h)%7)P(a+i,b+h,1,1,ch);}for(let j=0;j<=h;j++){if(cgH(a,b+j)%7)P(a,b+j,1,1,ch);if(cgH(a+w,b+j)%7)P(a+w,b+j,1,1,ch);}};
  if(o.draw==='hop'){let cx=x-30;const mid=y-1,num=(n,a,b)=>sgtT(P,String(n),a+2,b+1,ch);let n=1;
    for(const col of [1,2,1,2,1,2]){if(col===1){C(cx,mid-4,7,8);num(n++,cx,mid-3);}else{C(cx,mid-12,7,8);num(n++,cx,mid-11);C(cx,mid-4+4,7,8);num(n++,cx,mid+1);}cx+=7;}
    C(cx,mid-8,22,16);sgtT(P,'HOME',cx+3,mid-2,ch);}
  else if(o.draw==='doll'){for(let a=0;a<6.283;a+=.3)P(Math.round(x+Math.cos(a)*5),Math.round(y-12+Math.sin(a)*5),1,1,ch);P(x-2,y-13,1,1,ch);P(x+2,y-13,1,1,ch);for(let i=0;i<5;i++)P(x-1+i*.5,y-9,1,1,ch);
    for(let j=0;j<16;j++){P(x-Math.round(j*.6)-1,y-6+j,1,1,ch);P(x+Math.round(j*.6)+1,y-6+j,1,1,ch);}for(let i=-10;i<=10;i++)P(x+i,y+10,1,1,ch);for(const s of [-1,1])for(let j=0;j<8;j++)P(x+s*(3+j),y-5+Math.round(j*.4),1,1,ch);
    for(let j=0;j<6;j++){P(x-3,y+11+j,1,1,ch);P(x+3,y+11+j,1,1,ch);}for(let j=0;j<10;j++)P(x+6+Math.round(j*.3),y-17+j,1,1,ch);}
  else if(Array.isArray(o.draw)){const L=o.draw,top=y-((L.length*7)>>1)-1;L.forEach((ln,i)=>{const t=typeof ln==='string'?ln:ln.t,w=t.length*4-1,tx=x-(w>>1)+((cgH(i,7)%3)-1),ty=top+i*7;cgT(P,t,tx,ty,ch);
      if(typeof ln==='object'&&ln.strike)for(let k=-1;k<=w;k++)P(tx+k,ty+2+Math.round(Math.sin(k)*.6),1,1,ch);});}}
function cgTop(P,x,y,o){const c=o.c||'#8a5a34',c2=o.c2||'#c8a03a',th=o.th!=null?o.th:.25,cs=Math.cos(th),sn=Math.sin(th);
  // a turned top tipped over: the crown (a flat disc, seen as an ellipse) at one end, straight sides running to the metal point
  const sh=o.shape||'squat',W=sh==='tall'?8.5:sh==='pear'?10.5:12,Lc=sh==='tall'?28:sh==='pear'?25:22,ex=W*.36,bow=sh==='pear'?1.35:sh==='squat'?1.6:1.8,sho=sh==='pear'?.26:.18;
  const bx=x-Lc*.42*cs,by=y-Lc*.42*sn,uv=(px,py)=>{const dx=px-bx,dy=py-by;return [dx*cs+dy*sn,-dx*sn+dy*cs];},wAt=u=>{const t=u/Lc;if(t<sho)return W*(.8+.2*Math.sin(t/sho*Math.PI/2));return W*Math.pow(Math.max(0,1-(t-sho)/(1-sho)),bow)+(t>.9?.6:0);};
  const inCone=(u,v)=>u>=0&&u<=Lc&&Math.abs(v)<=wAt(u),inCrown=(u,v)=>(u/ex)**2+(v/(W*.8))**2<=1,inside=(px,py)=>{const [u,v]=uv(px+.5,py+.5);return inCone(u,v)||inCrown(u,v);};
  P(x-Lc*.55,y+W*.8,Lc*1.1,3,'#00000050');
  if(o.string){for(let a=0;a<6.283;a+=.04)P(Math.round(x-2+Math.cos(a)*16),Math.round(y+W+6+Math.sin(a)*3.5),1,1,'#c8bca0');for(let i=0;i<12;i++)P(x+14+i,y+W+6+Math.round(i*.3),1,1,'#c8bca0');}
  else if(o.scuff){for(let a=0;a<12.5;a+=.06){const r=3+a*1.1;P(Math.round(x+24+Math.cos(a)*r*1.4),Math.round(y+8+Math.sin(a)*r*.5),1,1,sgtShade(o.scuff,a%1.2<.6?.78:.88));}}
  const X0=Math.floor(x-Lc),X1=Math.ceil(x+Lc),Y0=Math.floor(y-Lc),Y1=Math.ceil(y+Lc),bands=o.bands||[.3,.55];
  for(let py=Y0;py<=Y1;py++)for(let px=X0;px<=X1;px++){if(!inside(px,py))continue;const [u,v]=uv(px+.5,py+.5);let col;
    if(!inside(px-1,py)||!inside(px+1,py)||!inside(px,py-1)||!inside(px,py+1))col='#140a06';
    else if(inCrown(u,v)&&u<ex*.55)col=(u/ex)**2+(v/(W*.8))**2>.72?sgtShade(c,.85):(v<0?sgtShade(c,1.55):sgtShade(c,1.3));
    else{const t=v/Math.max(1,wAt(u));let base=c;for(const b of bands)if(Math.abs(u/Lc-b-.07*t*t)<.04)base=c2;col=t<-.55?sgtShade(base,1.35):t>.5?sgtShade(base,.6):t>.1?sgtShade(base,.82):base;}
    P(px,py,1,1,col);}
  // the metal point, and the peg out of the middle of the crown
  for(let k=0;k<4;k++)P(Math.round(bx+(Lc+k)*cs),Math.round(by+(Lc+k)*sn),1,1,k<2?'#a8a8b0':'#e0e0e8');
  sgtBlob(P,[[bx-2*cs,by-2*sn,bx-8*cs,by-8*sn,1.6],[bx-9*cs,by-9*sn,bx-9.5*cs,by-9.5*sn,2.5]],['#120a06','#5a4028','#7a5a3a','#a07a52']);
  if(o.t){const tx=Math.round(bx+Lc*.3*cs)-6,ty=Math.round(by+Lc*.3*sn-W*.45);sgtT(P,o.t,tx,ty+1,sgtShade(c,1.6));sgtT(P,o.t,tx,ty,'#140a06');}}
// ---- each find: where it lies and what's on it
const CG_FIND={
  field:{g:'furrow',k:'horse',o:{base:['EDWIN MARSH','HIS HORSE']}},corn:{g:'corn2',k:'cap',o:{st:'bonnet',c:'#7e94b0',hang:1,rib:'#6a7e98'},at:[80,52]},
  pond:{g:'bank',k:'top',o:{t:'N.L.',c:'#a87a4a',c2:'#3a6a4a',string:1,shape:'squat',th:.2},at:[80,48]},bridge:{g:'under',k:'marbles',o:{st:'bag',t:'M.P.',c:'#8a7a5a'},at:[80,46],pos:[80,48]},
  oak:{g:'ditch',k:'shoe',o:{st:'sneaker',c:'#d0d0c8',c2:'#2a4a9a'}},square:{g:'cobble',k:'slate',o:{draw:'hop'}},
  church:{g:'chstep',k:'cap',o:{st:'folded',c:'#6a1a28'},at:[80,50]},graveyard:{g:'wall',k:'shoe',o:{st:'boot'}},store:{g:'boards',k:'marbles',o:{st:'twist'}},
  crossroads:{g:'road',k:'top',o:{c:'#2a4a7a',c2:'#c8a03a',shape:'squat',th:-.2,scuff:'#5a5244',bands:[.3]},at:[74,52]},lane:{g:'step',k:'shoe',o:{st:'mary',c:'#6a3c22'},at:[80,46]},
  mine:{g:'mine2',k:'horse',o:{rot:-.32,broken:1},at:[80,60],pos:[84,70]},falls:{g:'falls2',k:'cap',o:{st:'flat',c:'#7a6248'},at:[80,54],pos:[76,54]},hollowtree:{g:'roots',k:'top',o:{c:'#6a3c1c',c2:'#d8c890',shape:'pear',bands:[.3],th:-.3,string:1}},
  quarry:{g:'quarry',k:'slate',o:{draw:['300 X 4',{t:'= 1100',strike:1},{t:'= 1300',strike:1},'= 1200','+ 1 DOOR?']},at:[80,46]},
  lake:{g:'shore2',k:'shoe',o:{st:'jelly'},at:[80,52]},orchard:{g:'long',k:'horse',o:{graze:1},over:'long'},marsh:{g:'rail',k:'cap',o:{st:'knit',c:'#8a4a5a'},at:[80,34]},
  clearing:{g:'ring',k:'shoe',o:{st:'small',c:'#4a3424'},at:[80,60]},mill:{g:'boards',k:'marbles',o:{st:'flour'}},millroad:{g:'verge',k:'top',o:{c:'#b88a3a',c2:'#efe4c8',shape:'squat',th:.35,string:1,bands:[.28,.5]},at:[80,68]},
  wksquare:{g:'cobble',k:'slate',o:{draw:['MOLLY','MOLLY MOLLY','MOLLY','MOLLY MOLLY','MOLLY']}},wkriver:{g:'pebbles',k:'marbles',o:{st:'spill',c:'#6a6050'},at:[76,48]},
  wkchapel:{g:'grass',k:'cap',o:{st:'bonnet',lie:1,c:'#dcd8cc',rib:'#c86a8a',lining:'#f4eee0'},at:[76,48]},motel:{g:'concrete',k:'shoe',o:{st:'sneaker',c:'#3a5a9a',c2:'#e8e8e0'}},
  cars:{g:'seat',k:'horse',o:{c:'pink'},at:[80,46]},county:{g:'gravel2',k:'marbles',o:{st:'loose'},at:[90,56]},greyfield:{g:'dirt',k:'slate',o:{draw:['ALICE']}},
  fen:{g:'turf',k:'cap',o:{st:'ragcap',c:'#7a6a50'},at:[80,56]},deepcorn:{g:'dirt',k:'top',o:{c:'#9a2e1c',c2:'#1e1e1e',shape:'tall',th:.15,bands:[.3,.52],scuff:'#4a3a26'},at:[74,52]},dam:{g:'concrete',k:'shoe',o:{st:'mary',c:'#8a2a2a',wet:1}},
  ridge:{g:'path',k:'cap',o:{st:'sunhat'}},oldmarrow:{g:'ash',k:'horse',o:{c:'char'}},birches:{g:'litter',k:'slate',o:{draw:'doll'}},
};
const CG_DRAW={horse:cgHorse,cap:cgCap,marbles:cgMarbles,shoe:cgShoe,slate:cgSlate,top:cgTop};
function cgArt(id){const d=CG_FIND[id];if(!d)return null;const [cx0,cy0]=d.at||[80,52];return sgtC('cg_'+id,96,64,(Q,g)=>{const ox=Math.max(0,Math.min(64,cx0-48)),oy=Math.max(0,Math.min(40,cy0-30)),P=(x,y,w,h,c)=>Q(x-ox,y-oy,w,h,c);cgGround(P,d.g);
  if(d.stones)for(const [sx,sh] of [[34,40],[118,36]]){P(sx-1,0,10,sh+1,'#120c08');P(sx,0,8,sh,'#6a6a70');P(sx,0,2,sh,'#8a8a90');}
  const [x,y]=d.pos||d.at||[80,52];(CG_DRAW[d.k]||cgShoe)(P,x,y,d.o||{});
  if(d.over==='long')for(let i=0;i<70;i++){const bx=cgH(i,9)%160,by=60+cgH(9,i)%44,h=8+cgH(i,2)%10;for(let j=0;j<h;j++)P(bx+Math.round(j*.3*((i%2)?1:-1)),by-j,1,1,j>h-3?'#9a9a50':'#5e6e2e');}
  if(d.over==='long')for(const [ax,ay] of [[46,78],[112,74]]){sgtBlob(P,[[ax,ay,ax,ay,3.4]],['#2a0e0a','#7a1e14','#a8301e','#d8583a']);P(ax,ay-4,1,2,'#3a2a14');}});}
// the text after its first sentence (a full stop after an initial, as in "M.P. stitched on it", or after Mr/Mrs/Dr/St, doesn't end one)
function cgAfterFirst(t){for(let i=0;i<t.length;i++){if(t[i]!=='.'||!/^\s+[A-Z]/.test(t.slice(i+1,i+4)))continue;const w=(t.slice(0,i).match(/([A-Za-z]+)$/)||['',''])[1];
  if(/^([A-Z]|Mr|Mrs|Ms|Dr|St)$/.test(w))continue;return t.slice(i+1).trimStart();}return t;}
// ---- finding one: the screen goes in on it; closing it, you say their name
function rgcSight(c,fin){if(typeof ruOpen!=='function')return false;let img=null;try{img=cgArt(c.id);}catch(e){return false;}if(!img)return false;
  // the picture shows what the first sentence used to describe; the caption keeps who they were and how the place gave them up
  let rest=cgAfterFirst(String(c.text||'').replace(/<[^>]+>/g,''));if(rest.startsWith(c.who+', '))rest=rest.slice(c.who.length+2).replace(/^./,m=>m.toUpperCase());const cap=!rest?c.text:rest.startsWith(c.who+' ')||rest.startsWith(c.who+'’')?(rest.includes(String(c.yr))?rest:`${c.yr}. ${rest}`):`${c.who}, ${c.yr}. ${rest}`;   // (no name twice: "Mary Pruitt, 1919. Mary Pruitt hid...")
  ruOpen({x:c.x,z:c.z,_sight:{img,fx:{}}},cap);if(!RU.on)return false;RU.after=fin||null;
  try{RU.hint.textContent=matchMedia('(pointer:coarse)').matches?'Tap to say their name':'Click or press E to say their name';}catch(e){}return true;}
