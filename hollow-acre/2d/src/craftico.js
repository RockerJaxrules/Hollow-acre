/* ================= proper pictures for the things you make (the crafting lists used to show the material instead):
   the oil flask, the sprinkler, the club, sickle and machete, the jacket, coat and mail shirt ================= */
const CICO={};
function cicoMake(key,draw){const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');const H=s=>{const n=Math.sin(s*12.9898)*43758.5453;return n-Math.floor(n);};
  const p=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
  const poly=(pts,fn)=>{let x0=99,x1=-1,y0=99,y1=-1;for(const [x,y] of pts){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
    for(let y=Math.floor(y0);y<=y1;y++)for(let x=Math.floor(x0);x<=x1;x++){let ins=false;for(let a=0,b=pts.length-1;a<pts.length;b=a++){const [xa,ya]=pts[a],[xb,yb]=pts[b];if((ya>y+.5)!==(yb>y+.5)&&x+.5<(xb-xa)*(y+.5-ya)/(yb-ya)+xa)ins=!ins;}if(ins){const c2=fn(x,y);if(c2)p(x,y,1,1,c2);}}};
  draw(p,poly,H,g);
  const d=g.getImageData(0,0,32,32),D=d.data,out=[];for(let y=0;y<32;y++)for(let x=0;x<32;x++){if(D[(y*32+x)*4+3])continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<32&&Y<32&&D[(Y*32+X)*4+3]>40){out.push([x,y]);break;}}}
  g.fillStyle='rgba(20,14,10,.92)';for(const [x,y] of out)g.fillRect(x,y,1,1);ICON[key]=c.toDataURL();CICO[key]=c;return key;}
{const W=CA_P.wood,O=CA_P.oak,I=CA_P.iron,C=CA_P.copper,B=CA_P.brass,L=CA_P.leather;
  cicoMake('it_flask',(p,poly)=>{poly([[9,29],[23,29],[23,15],[19,11],[19,7],[13,7],[13,11],[9,15]],(x,y)=>y>16?(x<12?'#e8c060':x>20?'#a8802c':'#c8a040'):x<12?'rgba(232,244,252,.75)':'rgba(170,200,220,.55)');
    p(10,15,1,13,'#ffffff');p(13,3,6,5,'#a87850');p(13,3,6,1,'#c89870');p(11,19,10,6,'#efe2b8');p(12,21,8,1,'#5a3a1a');p(13,23,6,1,'#8a6a3a');});
  cicoMake('it_sprinkler',(p,poly,H)=>{for(let x=-7;x<=7;x++){const i=Math.max(1,Math.min(7,Math.round(6-Math.abs(x+2)/7*4.5)));p(16+x,15,1,14,B[i]);}p(9,13,15,2,B[6]);for(const y of [17,25])for(let x=-7;x<=7;x++)p(16+x,y,1,2,C[Math.max(2,Math.min(6,Math.round(5-Math.abs(x+2)/7*3)))]);
    p(15,8,3,5,B[5]);p(9,7,15,2,B[4]);p(9,7,15,1,B[6]);p(14,5,5,3,B[3]);for(let k=0;k<5;k++){p(4+k,4-k%2,1,1,'#9fd0f0');p(27-k,4-k%2,1,1,'#9fd0f0');p(6+k*5,1,1,1,'#d8f0ff');}});
  cicoMake('it_club',(p)=>{for(let s=0;s<=1;s+=.02){const x=6+s*20,y=27-s*21,r=1.6+s*s*3.6;for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){if(dx*dx+dy*dy>r*r)continue;const l=(dx+dy)/(2*r);p(x+dx,y+dy,1,1,O[Math.max(1,Math.min(7,Math.round(5-l*3)))]);}}
    for(let k=0;k<4;k++){const s=.05+k*.06;p(6+s*20-1,27-s*21-1,3,2,L[k%2?2:4]);}p(22,7,2,2,O[2]);p(24,10,1,1,O[2]);});
  cicoMake('it_sickle',(p)=>{const cx=18,cy=14,R=11;for(let a=Math.PI*.98;a<Math.PI*2.15;a+=.02){const u=(a-Math.PI*.98)/(Math.PI*1.17),th=Math.max(1,Math.round(5*Math.pow(1-u,.7)));for(let k=0;k<th;k++){const rr=R-k;p(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.9,1,1,k===th-1?C[7]:k===0?C[2]:C[4]);}}
    p(5,12,4,4,B[4]);p(5,12,4,1,B[6]);for(let k=0;k<14;k++){p(6-k*.25,16+k,3,1,W[k%5===0?3:4]);p(6-k*.25,16+k,1,1,W[6]);}});
  cicoMake('it_machete',(p,poly)=>{const th=-.72,dx=Math.cos(th),dy=Math.sin(th),Pt=(t,o)=>[7+dx*t-dy*o,26+dy*t+dx*o];const sp=[],ed=[];for(let t=0;t<=26;t+=2){const w=t<20?3.5+t/20*2:5.5*(1-(t-20)/6);sp.push(Pt(t,-2));ed.push(Pt(t,-2+Math.max(1,w)));}
    poly(sp.concat(ed.reverse()),(x,y)=>{const o=(x-7)*-dy+(y-26)*dx;return o>2.2?I[7]:o>.6?I[6]:I[5];});const [gx,gy]=Pt(0,0);p(gx-2,gy-3,4,6,B[4]);for(let t=-9;t<0;t++){const [x,y]=Pt(t,0);p(x-1,y-1,3,3,W[Math.abs(t)%4===0?2:4]);}});
  const jacketPts=[[9,5],[13,3],[19,3],[23,5],[27,13],[24,15],[23,11],[23,28],[9,28],[9,11],[8,15],[5,13]];
  cicoMake('it_jacket',(p,poly,H)=>{const P2=['#3a3428','#5c5446','#766c5a','#8a8068','#9a9078'];poly(jacketPts,(x,y)=>{const n=H(x*31+y);return P2[Math.max(0,Math.min(4,Math.round(3-(x-16)/10-(y-4)/24+(n>.8?1:n<.15?-1:0))))];});
    p(16,6,1,22,'#3a3428');poly([[13,3],[16,8],[19,3]],()=>'#4a4436');for(let i=0;i<4;i++)p(17,10+i*4,2,2,B[5]);p(11,20,4,3,'#4a4436');p(18,20,4,3,'#4a4436');});
  cicoMake('it_coat',(p,poly,H)=>{poly([[9,4],[13,2],[19,2],[23,4],[28,14],[25,16],[23,11],[24,30],[8,30],[9,11],[7,16],[4,14]],(x,y)=>{const n=H(x*17+y*3);return L[Math.max(1,Math.min(6,Math.round(4-(x-16)/10-(y-4)/26+(n>.85?1:n<.12?-1:0))))];});
    p(16,5,1,25,L[1]);poly([[13,2],[16,8],[19,2]],()=>L[2]);for(let i=0;i<5;i++){p(14,9+i*4,1,1,C[6]);p(18,9+i*4,1,1,C[6]);}p(10,22,1,1,C[6]);p(22,22,1,1,C[6]);});
  cicoMake('it_mail',(p,poly)=>{poly([[9,5],[13,3],[19,3],[23,5],[27,12],[24,14],[23,11],[23,28],[9,28],[9,11],[8,14],[5,12]],(x,y)=>{const r=((x+(y>>1)%2*2)%4),q=y%2;return r===0||q===0?I[3]:r===2?I[6]:I[5];});
    poly([[13,3],[16,7],[19,3]],()=>I[2]);});}
Object.assign(CRAFT_ICON,{flask:'it_flask',spr:'it_sprinkler',sprinkler:'it_sprinkler',club:'it_club',sickle:'it_sickle',machete:'it_machete',jacket:'it_jacket',coat:'it_coat',mail:'it_mail'});
// the oil lamp's picture is the lit lamp and the table top, not the whole stand shrunk down
{const mk=()=>{const m=SPR.in_oillamp_n,im=m&&IMG[m.src];if(!im||!im.complete||!im.naturalWidth){setTimeout(mk,400);return;}const c=document.createElement('canvas');c.width=32;c.height=32;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  g.drawImage(im,0,0,m.fw,30,(32-m.fw)>>1,1,m.fw,30);ICON.in_oillamp=c.toDataURL();};mk();}
