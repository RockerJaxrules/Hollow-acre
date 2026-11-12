/* ================= #258 reading things up close. Gravestones, grave markers, signposts, the county sign and the memorial on the
   green can all be read, any time, day or night. Reading one no longer puts a line of red text on the screen: the view zooms in
   on the thing itself, and you read what is actually on it. Words are carved into stone (lit from the top left, so each letter
   has a shadowed wall and a bright lip), painted on wood (with the paint worn through in places), cast in a bronze plaque, or
   printed on a road sign. Anything the old line said that isn't written on the object stays underneath as a short caption. At
   night it is lit by your lantern. Tap, click, or press E or Escape to step back. ================= */
const RU={on:false,box:null,cv:null,g:null,cap:null,hint:null,objC:null,spec:null,K:3,W:320,H:180,t:0,raf:0,openAt:0,wasPaused:false,capOn:false,capTxt:'',fx:[]};
// ---- names and words for the stones (deterministic by where the stone stands)
const RU_FIRST=['ELIZA','TOMAS','RUTH','ISAAC','MARY','ABEL','CLARA','JONAH','HATTIE','SAMUEL','WALTER','ADA','PETER','LIZZIE','AMOS','EDIE','FRANK','ROSE','HENRY','LOTTIE','MILES','IRENE','GUS','VIOLET','EZRA','LEON','DORA','CALEB','EFFIE','BESS','NOAH','PEARL','ARTHUR','ANNIE','JESSE','MAUD','ELI','GRETA','LUTHER','IVY'];
const RU_LAST=['MARSH','CRANE','ABERNATHY','HALE','DUNN','QUILL','THORNE','VALE','HARTLEY','WREN','LARK','CALDER','MOSS','PIKE','BELL'];
function ruHash(a,b,s){const n=Math.sin(a*127.1+b*311.7+(s||0)*74.7)*43758.5453;return n-Math.floor(n);}
function ruPick(arr,h){return arr[Math.floor(h*arr.length)%arr.length];}
// what is written on a stone or marker, by the place it stands in
function ruGraveWords(o){const h1=ruHash(o.x,o.z,1),h2=ruHash(o.x,o.z,2),h3=ruHash(o.x,o.z,3),first=ruPick(RU_FIRST,h1),last=ruPick(RU_LAST,h2);
  const inYard=o.x>53&&o.x<73&&o.z>-42&&o.z<-32,tithe=Math.hypot(o.x-TITHE.x,o.z-TITHE.z-1)<9,old=o.x>-22&&o.x<-5&&o.z>-136&&o.z<-128,grey=o.x>-183&&o.x<-160&&o.z>40&&o.z<60;
  if(inYard){const yr=1871+Math.floor(h3*150);return {lines:[first,last,'OCTOBER '+yr],epi:ruPick(['WENT AHEAD','DRAWN BY LOT','GIVEN FOR THE HARVEST','WE KEPT YOUR PLACE','ASLEEP IN THE CORN'],h1*7%1),
    cap:ruPick(['The earth in front of it has never been dug.','The grass around it has been kept short. There is nobody under it.','A name and a year. One for each October.'],h2*5%1),wear:.04};}
  if(tithe){const yr=1871+Math.floor(h3*9);return {lines:[first,last,String(yr)],epi:'THE FIRST',cap:'It faces the Tithe stone, not the road.',wear:.12};}
  if(old){const yr=1790+Math.floor(h3*70);return {lines:[first,last,String(yr)],epi:'REST',cap:'Worn almost smooth. The fire took Old Marrow’s church, not its stones.',wear:.38};}
  if(grey)return {lines:[first,last,'1902'],epi:null,cap:'Forty markers and one year. Nobody in Marrow Hollow will say what happened at Greyfield.',wear:.2};
  return {lines:[first,last,String(1871+Math.floor(h3*150))],epi:'AT REST',cap:'',wear:.1};}
// what a sign says
function ruSignWords(o){const near=(p,r)=>p&&Math.hypot(o.x-p.x,o.z-p.z)<(r||1.6);
  if(near(farmSignPos))return {title:'HOLLOW ACRE',sub:['E. MARSH, PROP.'],tally:31,cap:'Somebody has scratched a tally into the post. Thirty-one marks.'};
  if(near(tsPos))return {title:'MARROW HOLLOW',sub:['POP. 41'],strike:'41',carved:'40',cap:'Someone has scratched out the 41 and carved 40 beside it.'};
  if(o.landSign&&typeof LAND_PARCELS!=='undefined'){const P=LAND_PARCELS.find(p=>p.id===o.landSign);if(P)return {title:'FOR SALE',red:true,plain:true,sub:[`${P.w*P.h} SQUARES`,`${P.price} COINS`,'DEEDS AT THE TOWN HALL'],cap:''};}
  let L=String(o.label||'').replace(/^!/,'');if(!L&&typeof o.spr==='string'&&o.spr.startsWith('sign:'))L=o.spr.slice(5).replace(/:[PL]$/,'');
  return {title:L.toUpperCase()||'…',sub:[],plain:o.face==='P',cap:''};}
function ruKind(o){const s=String(o.spr||'');if(/^grave_[013]$/.test(s))return s==='grave_1'?'stone':'slab';if(s==='grave_2'||s==='rg_marker_0'||s==='rg_marker_1')return 'cross';if(s==='rg_marker_2')return 'stone';
  if(s==='memorial')return 'memorial';if(s==='rg_countysign')return 'county';if(s==='signpost'||s.startsWith('sign:'))return 'sign';return null;}
// ---- letters: the game's pixel font drawn small, read back as a mask (one font pixel = one art pixel at 10 px)
function ruMask(text,size){const c=document.createElement('canvas'),g=c.getContext('2d');g.font=`${size}px "Hollow Pixel",monospace`;const w=Math.max(1,Math.ceil(g.measureText(text).width))+2,h=Math.ceil(size*1.05)+2;
  c.width=w;c.height=h;g.font=`${size}px "Hollow Pixel",monospace`;g.textBaseline='top';g.fillStyle='#fff';g.fillText(text,1,1);const d=g.getImageData(0,0,w,h).data,m=new Uint8Array(w*h);
  let x0=w,x1=-1,y0=h,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>110){m[y*w+x]=1;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<0)return {w:0,h:0,m:new Uint8Array(0)};const cols=[];let run=[];for(let x=x0;x<=x1;x++){let any=0;for(let y=y0;y<=y1;y++)if(m[y*w+x]){any=1;break;}if(any){if(run.length)cols.push(...(run.length>=2&&run.length<=4?run.slice(0,1):run));run=[];cols.push(x);}else run.push(x);}
  const W2=cols.length,H2=y1-y0+1,m2=new Uint8Array(W2*H2);for(let y=0;y<H2;y++)for(let i=0;i<W2;i++)m2[y*W2+i]=m[(y+y0)*w+cols[i]];return {w:W2,h:H2,m:m2};}
function ruLetters(g,M,ox,oy,style){const at=(x,y)=>x>=0&&y>=0&&x<M.w&&y<M.h&&M.m[y*M.w+x];const P=(x,y,c)=>{g.fillStyle=c;g.fillRect(ox+x,oy+y,1,1);};
  const wear=style.wear||0,sd=style.seed||1,thick=!!style.thick;
  for(let y=-1;y<=M.h;y++)for(let x=-1;x<=M.w;x++){const on=at(x,y);
    if(on){const worn=wear&&ruHash((x+ox)>>1,(y+oy)>>1,sd)<wear;
      if(style.carve){if(worn&&wear>.2)continue;P(x,y,thick&&(!at(x+1,y)||!at(x,y+1))&&at(x-1,y)&&at(x,y-1)?style.wall:thick&&(!at(x+1,y)||!at(x,y+1))?style.wall2||style.groove:style.groove);}
      else if(style.emboss){P(x,y,(!at(x-1,y)||!at(x,y-1))?style.hi:style.face);}
      else P(x,y,worn?(style.paint2||style.paint):style.paint);}
    else if(style.carve&&!thick&&at(x,y-1)){if(wear>.2&&ruHash(x+ox,y+oy,sd+1)<wear)continue;P(x,y,style.lip);}
    else if(style.emboss&&(at(x-1,y)||at(x,y-1)||at(x-1,y-1)))P(x,y,style.shadow);}}
// stone, filled in soft clusters of three tones (never speckle), bevelled toward the light at the top left
function ruStone(g,shape,x0,y0,w,h,pal,seed){const N=(x,y)=>{const fx=x/16,fy=y/11,ix=Math.floor(fx),iy=Math.floor(fy),u=fx-ix,v=fy-iy,a=ruHash(ix,iy,seed),b=ruHash(ix+1,iy,seed),c=ruHash(ix,iy+1,seed),d=ruHash(ix+1,iy+1,seed);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(!shape(x,y))continue;const n=N(x,y);let c=n<.5?pal[2]:pal[3];
    const L=!shape(x-1,y)||!shape(x-2,y),T=!shape(x,y-1)||!shape(x,y-2),R=!shape(x+1,y)||!shape(x+2,y)||!shape(x+3,y),B=!shape(x,y+1)||!shape(x,y+2);
    if(R||B)c=pal[1];if((L||T)&&!R)c=pal[4];if(!shape(x-1,y)||!shape(x+1,y)||!shape(x,y-1)||!shape(x,y+1))c=pal[0];g.fillStyle=c;g.fillRect(x0+x,y0+y,1,1);}}
function ruMoss(g,shape,x0,y0,w,h,seed,amt,where){const C=['#2e421c','#44602a','#5e7c36'];const n=x=>{const f=x/7,i=Math.floor(f),u=f-i;return ruHash(i,seed,where==='low'?3:4)*(1-u)+ruHash(i+1,seed,where==='low'?3:4)*u;};
  const lim=Math.min(.95,1-amt/40);for(let x=0;x<w;x++){const v=n(x);if(v<lim)continue;const th=1+Math.round((v-lim)/(1-lim)*(where==='low'?5:3));
    if(where==='low'){let yb=h-1;while(yb>0&&!shape(x,yb))yb--;for(let k=0;k<th;k++){if(!shape(x,yb-k))break;g.fillStyle=k===th-1?C[2]:k===0?C[0]:C[1];g.fillRect(x0+x,y0+yb-k,1,1);}}
    else{let yt=0;while(yt<h&&!shape(x,yt))yt++;for(let k=0;k<th;k++){if(!shape(x,yt+k))break;g.fillStyle=k===0?C[2]:k===th-1?C[0]:C[1];g.fillRect(x0+x,y0+yt+k,1,1);}}}}
function ruGround(g,cx,gy,w,seed,kind){const P=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,ww,hh);};
  const pal=kind==='pave'?['#5a5a58','#6e6e6a','#46464a']:kind==='gravel'?['#5a5246','#6e6454','#40382e']:['#4a3a24','#3a2e1c','#2c2214'];
  for(let r=0;r<13;r++){const edge=w*Math.sqrt(1-(r/13.5)**2);for(let x=Math.round(cx-edge-6);x<=cx+edge+6;x++){const d=Math.abs(x-cx)-edge+ (ruHash(x>>2,r,seed)-.5)*8;if(d>3)continue;if(d>0&&((x+r)&1))continue;
      let c=r<2?pal[0]:r<6?pal[1]:pal[2];if(kind==='pave'){const row=r<4?0:r<9?1:2,rh=[0,4,9][row],sz=[7,11,9][row],off=[0,5,2][row],k=Math.floor((x+off+Math.floor(ruHash(row,Math.floor((x+off)/sz),seed)*3))/sz);c=ruHash(k,row,seed)<.5?pal[1]:pal[0];if(r===rh||((x+off)%sz===0&&ruHash(k,row,seed+1)<.85))c=pal[2];}
      if(kind==='gravel'){const q=ruHash(x>>1,r>>1,seed);c=q<.16?pal[0]:q>.86?'#7e7262':pal[1];}P(x,gy+r,1,1,c);}}
  if(kind==='pave'||kind==='gravel')return;
  for(let i=0;i<w*1.6;i++){const x=cx-w+Math.floor(ruHash(i,seed,3)*w*2),hh=2+Math.floor(ruHash(i,seed,4)*7),y=gy+2+Math.floor(ruHash(i,seed,5)*6);if(Math.abs(x-cx)>w*Math.sqrt(Math.max(0,1-((y-gy)/12.5)**2)))continue;
    const c=ruHash(i,seed,6)<.5?'#5e6a2a':ruHash(i,seed,6)<.8?'#7a7a34':'#8a6a30';for(let k=0;k<hh;k++)P(x+(k>hh*.6?(i%2?1:-1):0),y-k,1,1,c);}
  for(let i=0;i<10;i++){const x=cx-w*.8+ruHash(i,seed,11)*w*1.6,y=gy+3+ruHash(i,seed,12)*7,c=['#b8521c','#d07a2a','#8a3a1a','#c8a040'][i%4];P(x,y,3,2,c);P(x+1,y-1,1,1,c);}}
function ruWrap(t,size,maxW){if(ruMask(t,size).w<=maxW)return [t];const ws=t.split(' '),out=[];let cur='';for(const w of ws){const n=cur?cur+' '+w:w;if(cur&&ruMask(n,size).w>maxW){out.push(cur);cur=w;}else cur=n;}if(cur)out.push(cur);return out;}
// ---- the close-ups, drawn into an art-pixel canvas (Wc x Hc), standing on the ground line gy
function ruDraw(g,Wc,Hc,spec){const cx=Wc>>1,gy=spec.gy;const P=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w,h);};const sd=spec.seed;
  if(spec.kind==='slab'||spec.kind==='stone'){const W2=spec.kind==='slab'?126:104,H2=spec.kind==='slab'?104:118,x0=cx-(W2>>1),plH=spec.kind==='slab'?9:6,y0=gy-H2-plH,old=spec.wear>.3;
      const shape=spec.kind==='slab'?(x,y)=>x>=0&&x<W2&&y>=Math.round(5*(((x-W2/2)/(W2/2))**2))&&y<H2&&!((x<3||x>W2-4)&&y<3):(x,y)=>{if(x<0||x>=W2||y<0||y>=H2)return false;const r=W2/2;if(y<r){const dx=x-r+.5,dy=y-r;return dx*dx+dy*dy<=r*r;}return true;};
      ruGround(g,cx,gy,W2*.75,sd,'grass');
      P(x0-6,gy-plH,W2+12,plH,'#2a2c30');P(x0-5,gy-plH+1,W2+10,plH-2,'#7e8282');P(x0-5,gy-plH+1,W2+10,1,'#a8acaa');P(x0-5,gy-2,W2+10,1,'#5e6264');
      P(x0+3,gy-plH-2,W2-2,2,'rgba(0,0,0,.35)');
      const pal=old?['#26282c','#5a5e5e','#6e7272','#7e8280','#9a9e9a']:['#2a2c30','#7e8282','#959997','#a8acaa','#c4c8c4'];
      ruStone(g,shape,x0,y0,W2,H2,pal,sd);
      // the crack, from the top right edge, a dark line with a lit lip
      {let x=W2-14-Math.floor(ruHash(sd,1,2)*20),y=Math.round(5*(((x-W2/2)/(W2/2))**2));const n=16+Math.floor(ruHash(sd,2,2)*14);for(let i=0;i<n;i++){P(x0+x,y0+y,1,1,pal[0]);P(x0+x+1,y0+y,1,1,pal[4]);y++;if(ruHash(i,sd,5)<.45)x+=ruHash(i,sd,6)<.6?-1:1;}}
      ruMoss(g,shape,x0,y0,W2,H2,sd,old?30:16,'low');ruMoss(g,shape,x0,y0,W2,H2,sd+9,old?18:8,'high');
      for(let i=0;i<5;i++){const lx=Math.floor(ruHash(i,sd,21)*(W2-10))+5,ly=Math.floor(ruHash(i,sd,22)*(H2-20))+10;if(!shape(lx,ly))continue;P(x0+lx,y0+ly,2,1,'#c8c090');P(x0+lx+1,y0+ly+1,1,1,'#a8a070');}
      const st={carve:1,groove:old?'#44484a':'#505456',wall:old?'#6e7272':'#82868a',wall2:old?'#54585a':'#64686a',lip:pal[4],wear:spec.wear,seed:sd};
      let ty=y0+(spec.kind==='slab'?12:Math.round(H2*.34));
      if(spec.kind==='slab'){const X=cx-3;const cr={w:7,h:11,m:new Uint8Array(77)};for(let y=0;y<11;y++)for(let x=0;x<7;x++)cr.m[y*7+x]=(x>=2&&x<=4)||(y>=3&&y<=5)?1:0;ruLetters(g,cr,X,ty,st);ty+=17;}
      else{const X=cx-3;const cr={w:7,h:9,m:new Uint8Array(63)};for(let y=0;y<9;y++)for(let x=0;x<7;x++)cr.m[y*7+x]=(x===3)||(y===2&&x>=1&&x<=5)?1:0;ruLetters(g,cr,X,y0+12,st);}
      const lines=[...spec.lines];if(spec.epi)lines.push('—',spec.epi);
      const maxW=W2-(spec.kind==='slab'?16:24);let li=0;for(const t0 of lines){if(t0==='—'){P(cx-10,ty+1,21,1,st.groove);P(cx-10,ty+2,21,1,st.lip);ty+=6;continue;}const big=li<2&&ruMask(t0,20).w<=maxW;li++;
        for(const t of big?[t0]:ruWrap(t0,10,maxW)){const M=ruMask(t,big?20:10);ruLetters(g,M,cx-(M.w>>1),ty,{...st,thick:big});ty+=M.h+(big?4:5);}}
      return {top:y0,bot:gy+10};}
  if(spec.kind==='cross'){const wood=spec.grey?['#1e1a16','#5e564c','#7a7064','#948a7c','#aaa294']:['#1e140c','#5a3e24','#704e2e','#8a6440','#a47c52'];
      const pw=18,ph=Math.min(gy-14,122),bw=Math.max(92,0),bh=22,px0=cx-(pw>>1),top=gy-ph,by=top+24,bx0=cx-(bw>>1);
      ruGround(g,cx,gy,56,sd,'grass');
      const grain=(x0,y0,w,h,vert)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++){const e=x===0||y===0||x===w-1||y===h-1;let c=wood[2];const n=vert?ruHash(x,Math.floor(y/9),sd):ruHash(Math.floor(x/9),y,sd);
        if(n<.22)c=wood[1];else if(n>.8)c=wood[3];if(vert?x===1:y===1)c=wood[4];if(vert?x>=w-3:y>=h-3)c=wood[1];if(e)c=wood[0];P(x0+x,y0+y,1,1,c);}};
      grain(px0,top,pw,ph,true);P(px0+2,by+bh,pw-3,2,'rgba(0,0,0,.35)');grain(bx0,by,bw,bh,false);
      for(const ny of [by-5,by+bh+3]){P(cx-1,ny,2,2,'#2a2a2a');P(cx-1,ny,1,1,'#8a8a8a');}
      P(px0+2,gy-3,pw-4,3,'#2c2214');ruMoss(g,(x,y)=>x>=0&&x<pw&&y>=0&&y<ph,px0,top,pw,ph,sd,6,'low');
      const st={carve:1,groove:'#1a120a',lip:wood[4],wear:Math.min(.15,spec.wear),seed:sd};
      const nm=[spec.lines[0],spec.lines[1]].filter(Boolean),M1=ruMask(nm.join(' '),10);
      if(M1.w<=bw-10)ruLetters(g,M1,cx-(M1.w>>1),by+7,st);else{const a=ruMask(nm[0],10),b=ruMask(nm[1]||'',10);ruLetters(g,a,cx-(a.w>>1),by+3,st);ruLetters(g,b,cx-(b.w>>1),by+12,st);}
      // the year on a tin plate nailed to the post
      const yr=String(spec.lines[2]||'').replace(/\D/g,'').slice(0,4);P(px0-3,by+bh+10,pw+6,40,'#3a3c3e');P(px0-2,by+bh+11,pw+4,38,'#8a8e8c');P(px0-2,by+bh+11,pw+4,1,'#b8bcb8');
      let yy=by+bh+14;for(const ch of yr){const M=ruMask(ch,10);ruLetters(g,M,cx-(M.w>>1),yy,{emboss:1,face:'#3a3c3e',hi:'#2a2c2e',shadow:'#c8ccc8',wear:spec.wear*.5,seed:sd+3});yy+=9;}
      P(px0+1,by+bh+46,2,2,'#5a3a1a');P(px0+pw-3,by+bh+46,2,2,'#5a3a1a');
      return {top,bot:gy+10};}
  if(spec.kind==='memorial'){const top=Math.max(4,gy-176),sh=gy-14-top,wb=140,wt=112;const shape=(x,y)=>{const k=y/sh,hw=(wt+(wb-wt)*k)/2;return y>=0&&y<sh&&Math.abs(x-wb/2)<hw;};
      ruGround(g,cx,gy,96,sd,'pave');
      P(cx-72,gy-14,144,8,'#2a2c30');P(cx-71,gy-13,142,6,'#7e8282');P(cx-71,gy-13,142,1,'#a8acaa');P(cx-66,gy-20,132,7,'#2a2c30');P(cx-65,gy-19,130,5,'#8a8e8c');P(cx-65,gy-19,130,1,'#b4b8b4');
      ruStone(g,(x,y)=>shape(x,y),cx-(wb>>1),top,wb,sh-6,['#2a2c30','#7e8282','#959997','#a8acaa','#c4c8c4'],sd);ruMoss(g,(x,y)=>shape(x,y),cx-(wb>>1),top,wb,sh-6,sd,18,'low');
      // the bronze plaque, letters cast in relief, green where the rain runs
      const pw=100,ph=Math.min(92,sh-26),px0=cx-(pw>>1),py0=top+4;P(px0-1,py0-1,pw+2,ph+2,'#2a1a08');
      for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){let c=ruHash(Math.floor(x/22),Math.floor(y/16),sd+4)<.5?'#8e6026':'#966628';if(x<3||y<3)c=x<1||y<1?'#e0a858':'#c08440';if(x>pw-4||y>ph-4)c=x>pw-2||y>ph-2?'#3a220a':'#5a3a14';if((x===4||y===4)&&x>3&&y>3&&x<pw-4&&y<ph-4)c='#6a4418';P(px0+x,py0+y,1,1,c);}
      for(let i=0;i<7;i++){const vx=px0+6+Math.floor(ruHash(i,sd,31)*(pw-12)),vy=py0+ph+1,L=4+Math.floor(ruHash(i,sd,32)*9);for(let k=0;k<L;k++)P(vx,vy+k,1+(k<2?1:0),1,k>L*.6?'#6aa088':'#4a8a72');}
      for(const [x,y] of [[px0+3,py0+3],[px0+pw-5,py0+3],[px0+3,py0+ph-5],[px0+pw-5,py0+ph-5]]){P(x,y,2,2,'#5a3a14');P(x,y,1,1,'#e8b060');}
      const st={emboss:1,face:'#d8a050',hi:'#f0c878',shadow:'#3a220a',wear:0,seed:sd};let ty=py0+8;const gap=ph<80?2:3;
      for(const t of spec.lines){if(t==='—'){P(cx-30,ty+1,61,1,'#3a220a');P(cx-30,ty,61,1,'#d8a050');ty+=5;continue;}const M=ruMask(t,10);ruLetters(g,M,cx-(M.w>>1),ty,st);ty+=M.h+gap;}
      // dressed smooth below the last name: one more
      P(px0+10,ty+2,pw-20,1,'#b07a34');P(px0+10,ty+3,pw-20,1,'#7a4c1c');
      spec.candles=[[cx-40,gy-20],[cx-27,gy-20],[cx+22,gy-20],[cx+38,gy-20]];
      for(const [x,y] of spec.candles){P(x,y-9,4,9,'#e8dcc0');P(x+3,y-9,1,9,'#b8ac90');P(x,y-10,4,1,'#f4ecd8');P(x+1,y-11,1,2,'#2a1a08');}
      return {top,bot:gy+10};}
  if(spec.kind==='county'){const w2=150,h2=70,x0=cx-75,y0=Math.max(6,gy-150);
      ruGround(g,cx,gy,96,sd,'gravel');for(const px0 of [x0+18,x0+w2-26]){P(px0,y0+h2-4,8,gy-y0-h2+4,'#3a2414');P(px0+1,y0+h2-4,2,gy-y0-h2+4,'#6a4424');P(px0+6,y0+h2-4,2,gy-y0-h2+4,'#24160a');}
      P(x0,y0,w2,h2,'#0e1a12');P(x0+1,y0+1,w2-2,h2-2,'#e8ece8');P(x0+3,y0+3,w2-6,h2-6,'#1e4a32');
      for(let i=0;i<40;i++){const x=x0+4+Math.floor(ruHash(i,sd,41)*(w2-8)),y=y0+4+Math.floor(ruHash(i,sd,42)*(h2-8)),r=1+Math.floor(ruHash(i,sd,43)*3);P(x,y,r*2,r,ruHash(i,sd,44)<.5?'#1a3e2a':'#245638');}
      const st={paint:'#eef2ee',wear:.03,seed:sd};let ty=y0+11;for(const t of ['LEAVING','MARROW','COUNTY']){const M=ruMask(t,10);ruLetters(g,M,cx-(M.w>>1),ty,st);ty+=M.h+7;}
      for(const [hx,hy] of [[x0+28,y0+50],[x0+121,y0+18],[x0+104,y0+56]]){P(hx-1,hy-1,4,4,'#0a120c');P(hx,hy,2,2,'#05080a');P(hx+3,hy,1,1,'#c8d0c8');for(let k=0;k<6;k++)P(hx+1,hy+3+k,1,1,'#6a3a1a');}
      const by=y0+h2+8,bw=124,bx=cx-62;P(bx,by,bw,26,'#2a2420');P(bx+1,by+1,bw-2,24,'#e4dcc8');P(bx+1,by+23,bw-2,2,'#b8ae98');
      const M=ruMask('COME BACK SOON',10);ruLetters(g,M,cx-(M.w>>1),by+9,{paint:'#1a1614',wear:.02,seed:sd});
      for(const [dx,L] of [[-31,18],[-29,26],[-26,12]]){P(cx+dx,by+4,2,L,'#7a0a0a');P(cx+dx,by+4+L,2,2,'#5a0606');}
      return {top:y0,bot:gy+10};}
  // a signpost: a wooden board (an arrow unless it's a plain board) on a post, the words painted on it
  {const title=spec.title,big=ruMask(title,20),small=ruMask(title,10),useBig=big.w<=Math.min(Wc-40,190),T=useBig?big:small,subs=(spec.sub||[]).map(s=>ruMask(s,10));
    const bw=Math.max(96,T.w+28,...subs.map(s=>s.w+24)),bh=(useBig?T.h+16:T.h+14)+subs.reduce((a,s)=>a+s.h+5,0),tip=spec.plain?0:16,bx=cx-((bw+tip)>>1),by=Math.max(6,gy-bh-58);
    ruGround(g,cx,gy,60,sd,'grass');
    const W0=['#1e140c','#5a3e24','#704e2e','#8a6440','#a47c52'],WB=spec.red?['#2a2420','#b8ae98','#d8d0bc','#e8e2d0','#f4f0e4']:W0;
    for(let y=by+bh-4;y<gy;y++){P(cx-5,y,10,1,W0[2]);P(cx-5,y,1,1,W0[0]);P(cx+4,y,1,1,W0[0]);P(cx-4,y,1,1,W0[4]);P(cx+2,y,2,1,W0[1]);}
    for(let y=0;y<bh;y++){const tw=tip?Math.round(tip*(1-Math.abs(y-bh/2)/(bh/2))):0;for(let x=0;x<bw+tw;x++){const e=y===0||y===bh-1||x===0||x===bw+tw-1;let c=ruHash(Math.floor(x/11),y,sd)<.25?WB[1]:ruHash(Math.floor(x/7),y,sd+2)>.82?WB[3]:WB[2];
      if(y===Math.round(bh/2))c=WB[1];if(y===1||y===Math.round(bh/2)+1)c=WB[4];if(y>=bh-3)c=WB[1];if(e)c=WB[0];P(bx+x,by+y,1,1,c);}}
    for(const nx of [bx+5,bx+bw-8])for(const ny of [by+4,by+bh-7]){P(nx,ny,2,2,'#2a2a2a');P(nx,ny,1,1,'#9a9a9a');}
    const pst={paint:spec.red?'#b8261a':'#efe6cc',paint2:spec.red?'#962012':'#d4c8aa',wear:.12,seed:sd};let ty=by+(useBig?8:7);ruLetters(g,T,bx+((bw-T.w)>>1),ty,pst);ty+=T.h+(useBig?7:6);
    for(let i=0;i<subs.length;i++){const S2=subs[i];const X=bx+((bw-S2.w)>>1);ruLetters(g,S2,X,ty,{paint:spec.red?'#2a1a0e':'#e4d8bc',paint2:spec.red?'#4a3424':'#c8bc9e',wear:.12,seed:sd+i});
      if(spec.strike&&(spec.sub[i]||'').includes(spec.strike)){const pre=ruMask((spec.sub[i]).split(spec.strike)[0],10),sw=ruMask(spec.strike,10);const sx0=X+pre.w+4;for(let k=-1;k<=sw.w;k++){P(sx0+k,ty+3+(k%3===0?1:0),1,1,'#2a1a0e');P(sx0+k,ty+4,1,1,'#c8a878');}
        if(spec.carved){const C=ruMask(spec.carved,10);ruLetters(g,C,sx0+sw.w+6,ty,{carve:1,groove:W0[1],deep:W0[0],lip:W0[4],seed:sd});}}
      ty+=S2.h+5;}
    if(spec.tally){let y=by+bh+3;for(let gI=0;gI*5<spec.tally;gI++){const n=Math.min(5,spec.tally-gI*5);for(let k=0;k<Math.min(4,n);k++){P(cx-4+k*2,y,1,8,'#2a1a0e');P(cx-3+k*2,y,1,8,'#a8885c');}if(n===5)for(let j=0;j<10;j++){P(cx-5+j,y+7-Math.round(j*6/9),1,1,'#2a1a0e');P(cx-5+j,y+8-Math.round(j*6/9),1,1,'#a8885c');}y+=11;}}
    return {top:by,bot:gy+10};}}
// ---- open, draw, close
function ruEnsure(){if(RU.box)return;const b=document.createElement('div');b.id='ruBox';b.hidden=true;b.setAttribute('role','dialog');b.setAttribute('aria-modal','true');
  b.innerHTML='<canvas id="ruCv"></canvas><div id="ruCap"></div><div id="ruHint"></div>';document.body.appendChild(b);RU.box=b;RU.cv=$('ruCv');RU.g=RU.cv.getContext('2d');RU.cap=$('ruCap');RU.hint=$('ruHint');
  const css=document.createElement('style');css.textContent=`#ruBox{position:fixed;inset:0;z-index:75;background:#05050a;overflow:hidden;cursor:pointer;opacity:0;transition:opacity .25s steps(3)}
#ruBox.on{opacity:1}#ruCv{position:absolute;left:0;top:0;image-rendering:pixelated;image-rendering:crisp-edges;transform:scale(.14);transition:transform .32s steps(6)}
#ruBox.on #ruCv{transform:none}
#ruCap{position:absolute;left:0;right:0;padding:0 18px;text-align:center;font:clamp(13px,calc(var(--ruK,3)*3.4px),34px) 'Hollow Pixel',monospace;color:#e8dcc0;text-shadow:2px 2px 0 #000,-1px -1px 0 #000;line-height:1.35;max-width:min(92vw,34em);box-sizing:border-box;margin:0 auto;opacity:0;transition:opacity .3s .3s}
#ruBox.on #ruCap{opacity:1}
#ruHint{position:absolute;left:0;right:0;bottom:max(10px,env(safe-area-inset-bottom,0px));text-align:center;font:12px 'Hollow Pixel',monospace;color:#9a8c70;text-shadow:1px 1px 0 #000;letter-spacing:.06em}`;document.head.appendChild(css);
  const close=e=>{if(!RU.on||performance.now()-RU.openAt<280)return;if(e&&e.type==='keydown'&&!/^(e|E|Escape|Enter| |x|X)$/.test(e.key))return;if(e){e.preventDefault();e.stopPropagation();}ruClose();};
  b.addEventListener('pointerdown',close);addEventListener('keydown',e=>{if(RU.on)close(e);},true);}
function ruSpec(o,cap){const kind=ruKind(o),seed=Math.floor(ruHash(o.x,o.z,9)*9999)+1;
  if(kind==='slab'||kind==='stone'||kind==='cross'){const w=ruGraveWords(o);return {kind,seed,lines:w.lines,epi:w.epi,wear:w.wear,cap:cap||w.cap,grey:String(o.spr).startsWith('rg_marker')};}
  if(kind==='memorial'){const n=[];for(const [y,i] of [[1871,0],[1872,1],[1873,2]])n.push(`${y}  ${RU_FIRST[(i*7+3)%RU_FIRST.length]}`);
    return {kind,seed,lines:['TO THE CHILDREN','OF MARROW HOLLOW','WHO WENT AHEAD','—',...n.slice(0,2),'. . .','DANNY'],cap:'A year and a first name for every autumn since 1871. Below Danny’s, the bronze has already been dressed smooth for one more.'};}
  if(kind==='county')return {kind,seed,cap:cap||''};
  const s=ruSignWords(o);return {kind:'sign',seed,...s,cap:s.cap||''};}
function ruOpen(o,cap){if(RU.on||!o)return;ruEnsure();const spec=ruSpec(o,cap);if(!spec)return;RU.spec=spec;RU.on=true;RU.openAt=performance.now();RU.wasPaused=!!S.paused;S.paused=true;
  SFX.page&&SFX.page();const vw=innerWidth,vh=innerHeight,K=Math.max(2,Math.floor(Math.min(vw/170,vh/150))),W=Math.ceil(vw/K),H=Math.ceil(vh/K);RU.K=K;RU.W=W;RU.H=H;
  const cv=RU.cv;cv.width=W;cv.height=H;cv.style.width=W*K+'px';cv.style.height=H*K+'px';RU.box.style.setProperty('--ruK',K);
  spec.gy=Math.round(H*(H>W*1.2?.6:.74));
  // where the object is on screen: the zoom grows out of it
  let ox=vw/2,oy=vh/2;try{const c=($('view')||$('c')),r=c.getBoundingClientRect();ox=r.left+(sx(o.x))*r.width/c.width;oy=r.top+(sz(o.z))*r.height/c.height;}catch(e){}
  cv.style.transformOrigin=`${ox}px ${oy}px`;
  // the world behind, zoomed in on the object and dimmed (its own pixels, three times bigger)
  const g=RU.g;g.imageSmoothingEnabled=false;g.fillStyle='#05050a';g.fillRect(0,0,W,H);
  {const oc0=cine,oh=o.hide;try{cine=Object.assign({},oc0||{},{hidePlayer:true});o.hide=true;render(0,performance.now());}catch(e){}cine=oc0;o.hide=oh;}
  try{const c=($('view')||$('c')),r=c.getBoundingClientRect(),scx=(ox-r.left)*c.width/r.width,scy=(oy-r.top)*c.height/r.height,zw=c.width/4,zh=zw*H/W;const tc=document.createElement('canvas');tc.width=Math.ceil(W/3);tc.height=Math.ceil(H/3);const tg=tc.getContext('2d');tg.filter='blur(1.5px)';tg.drawImage(c,scx-zw/2,scy-zh*.42,zw,zh,0,0,tc.width,tc.height);g.globalAlpha=.75;g.drawImage(tc,0,0,W,H);g.globalAlpha=1;}catch(e){}
  g.fillStyle='rgba(6,6,12,.56)';g.fillRect(0,0,W,H);
  // the object, drawn once into its own layer (so the light and the candles can be laid over it)
  const [oc,og]=(()=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return [c,x];})();
  const ext=ruDraw(og,W,H,spec);
  const night=typeof isNight==='function'&&(isNight()||S.hour<5.5);spec.night=night;
  if(night){const base=document.createElement('canvas');base.width=W;base.height=H;const bg2=base.getContext('2d');bg2.drawImage(oc,0,0);
    og.globalCompositeOperation='source-atop';og.fillStyle='rgba(10,14,34,.72)';og.fillRect(0,0,W,H);
    const lc=document.createElement('canvas');lc.width=W;lc.height=H;const lg=lc.getContext('2d');const lx=W*.36,ly=ext.bot-14;lg.drawImage(base,0,0);
    const mk2=document.createElement('canvas');mk2.width=W;mk2.height=H;const mg=mk2.getContext('2d');for(const [r,a2] of [[140,.16],[96,.18],[58,.2]]){mg.fillStyle=`rgba(0,0,0,${a2})`;mg.beginPath();mg.arc(lx,ly,r,0,6.29);mg.fill();}
    lg.globalCompositeOperation='destination-in';lg.drawImage(mk2,0,0);lg.globalCompositeOperation='source-atop';lg.fillStyle='rgba(255,168,80,.4)';lg.fillRect(0,0,W,H);
    og.globalCompositeOperation='lighter';og.drawImage(lc,0,0);og.globalCompositeOperation='source-over';}
  RU.objC=oc;RU.bg=g.getImageData(0,0,W,H);
  RU.cap.textContent=spec.cap||'';RU.cap.hidden=!spec.cap;RU.cap.style.fontSize='';RU.cap.style.top=Math.min(vh-70,(ext.bot+6)*K)+'px';
  // (#287) the whole caption on screen, whatever the monitor: below the picture if it fits, else lifted, else in smaller letters
  if(spec.cap){const room=vh-Math.max(28,vh*.05);let fs=parseFloat(getComputedStyle(RU.cap).fontSize)||16;
    for(let i=0;i<12;i++){const h=RU.cap.offsetHeight,top0=Math.min(vh-70,(ext.bot+6)*K);let top=top0;if(top+h>room)top=Math.max(8,room-h);RU.cap.style.top=top+'px';
      if(top+h<=room&&top>=Math.min(top0,vh*.55))break;fs=Math.max(12,fs*.88);RU.cap.style.fontSize=fs+'px';if(fs<=12)break;}}
  RU.hint.textContent=matchMedia('(pointer:coarse)').matches?'Tap to step back':'Click or press E to step back';
  RU.box.hidden=false;RU.box.classList.remove('on');void RU.box.offsetWidth;RU.box.classList.add('on');RU.t=0;
  cancelAnimationFrame(RU.raf);let last=performance.now();const tick=now=>{if(!RU.on)return;RU.t+=(now-last)/1000;last=now;ruFrame();RU.raf=requestAnimationFrame(tick);};RU.raf=requestAnimationFrame(tick);ruFrame();}
function ruFrame(){const g=RU.g,spec=RU.spec;g.putImageData(RU.bg,0,0);g.drawImage(RU.objC,0,0);const t=RU.t;
  if(spec.candles)for(const [i,[x,y]] of spec.candles.entries()){const f=Math.sin(t*11+i*2.3)+Math.sin(t*17+i);const h=3+(f>0?1:0);g.fillStyle='#ffd27a';g.fillRect(x+1,y-11-h,2,h);g.fillStyle='#fff4c0';g.fillRect(x+1,y-12-(f>.8?1:0),1,1);
    g.globalAlpha=.09+.03*f;g.fillStyle='#f0a040';g.beginPath();g.arc(x+2,y-13,9,0,6.29);g.fill();g.globalAlpha=1;}
  if(spec.night){g.globalAlpha=.035+.02*Math.sin(t*7)*Math.sin(t*2.3);g.fillStyle='#f0a040';g.fillRect(0,0,RU.W,RU.H);g.globalAlpha=1;}}
function ruClose(){if(!RU.on)return;RU.on=false;cancelAnimationFrame(RU.raf);RU.box.classList.remove('on');setTimeout(()=>{if(!RU.on)RU.box.hidden=true;},260);S.paused=RU.wasPaused;}
// ---- every readable thing in the world gets "Read"; the few that already had one open the close-up instead of a line of text
{const _toast=toast;toast=function(msg){if(RU.capOn){RU.capTxt=String(msg||'');return;}return _toast.apply(this,arguments);};}
const RU_DONE=new WeakSet();let ruLen=-1;
function ruScan(){if(OBJ.length===ruLen)return;ruLen=OBJ.length;const live=new Set(OBJ);
  for(let i=interact.length-1;i>=0;i--){const ic=interact[i];if(ic._ruObj&&!live.has(ic._ruObj))interact.splice(i,1);}
  for(const o of OBJ){if(RU_DONE.has(o)||o.room||!ruKind(o))continue;RU_DONE.add(o);
    const old=interact.find(ic=>!ic._ruObj&&!ic._ruWrapped&&!ic.story&&Math.hypot(ic.x-o.x,ic.z-o.z)<1.7&&(()=>{try{return (typeof ic.label==='function'?ic.label():ic.label)==='Read';}catch(e){return false;}})());
    if(old){old._ruWrapped=true;const a=old.act;old.act=function(){RU.capOn=true;RU.capTxt='';try{a.apply(this,arguments);}finally{RU.capOn=false;}const t=RU.capTxt;if(!document.getElementById('note')||document.getElementById('note').hidden)ruOpen(o,ruKind(o)==='memorial'?'':t&&ruKind(o)!=='sign'?t:'');};continue;}
    interact.push({x:o.x,z:o.z+.55,r:1.05,_ruObj:o,on:()=>!S.room,label:()=>'Read',ok:()=>true,act(){ruOpen(o);}});}}
setInterval(()=>{try{ruScan();}catch(e){}},1500);try{ruScan();}catch(e){}
