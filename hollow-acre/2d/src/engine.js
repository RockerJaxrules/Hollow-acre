/* ================= engine: canvas, sprites, ground, lighting, input ================= */
const $=id=>document.getElementById(id);
const view=$('view');const ctx2=view.getContext('2d');
let VW=320,VH=480,SCALE=3;
function resize(){const dpr=Math.min(3,window.devicePixelRatio||1);const W=innerWidth*dpr,H=innerHeight*dpr;
  SCALE=Math.max(1,Math.round(Math.min(W,H)/(innerWidth<innerHeight?400:360)));VW=Math.ceil(W/SCALE);VH=Math.ceil(H/SCALE);
  view.width=VW;view.height=VH;view.style.width=innerWidth+'px';view.style.height=innerHeight+'px';ctx2.imageSmoothingEnabled=false;
  for(const c of [lightC,fogC,fxC]){c.width=VW;c.height=VH;}lctx.imageSmoothingEnabled=false;}
const lightC=document.createElement('canvas'),lctx=lightC.getContext('2d');
const fogC=document.createElement('canvas'),fctx=fogC.getContext('2d');
const fxC=document.createElement('canvas'),xctx=fxC.getContext('2d');
// ---------- sprites
// a loose image is asked for under this build's name (?b=), so no cache can hand back an older picture
const IMG={};
// the published page carries its images bundled in a few packs (packs.json lists them); anywhere else each image loads from its own path
const PACK={};let PACKS=null;
const PACKINFO={ok:0,total:0,on:false};
function fetchPack(n,tries){return fetch(n+'?b='+BUILD_ID+(tries<3?'&r='+tries:'')).then(r=>{if(!r.ok)throw new Error(r.status);return r.json();}).then(d=>{Object.assign(PACK,d);PACKINFO.ok++;})
  .catch(()=>tries>1?new Promise(res=>setTimeout(res,(4-tries)*1200)).then(()=>fetchPack(n,tries-1)):null);}   // a pack that fails is fetched again, up to three times
function loadPacks(){if(PACKS)return PACKS;return PACKS=fetch('packs.json?b='+BUILD_ID,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(L=>{if(!L||!L.packs)return null;PACKINFO.on=true;PACKINFO.total=L.packs.length;
  return Promise.all(L.packs.map(n=>fetchPack(n,3)));}).catch(()=>null);}
function loadImages(list,prog){let done=0;return loadPacks().then(()=>Promise.all(list.map(src=>new Promise(res=>{
  if(PACKINFO.on&&!PACK[src]){prog&&prog(++done,list.length);return res();}   // its pack failed: the loose file on the site is an old one, so leave it out
  const im=new Image();im.onload=()=>{IMG[src]=im;prog&&prog(++done,list.length);res();};im.onerror=()=>{if(PACK[src]&&im.src!==src&&!PACKINFO.on){im.src=src;return;}prog&&prog(++done,list.length);res();};im.src=PACK[src]||(src+'?b='+BUILD_ID);}))));}
function drawSpr(name,x,y,clip,dir,frame,o){const m=SPR[name];if(!m)return;const im=IMG[m.src];if(!im)return;o=o||{};
  let sx=0,sy=0;if(m.clips){const c=(m.clips[clip]||m.clips.idle||Object.values(m.clips)[0]);const r=c[dir]||c.S||Object.values(c)[0];sy=r[0]*m.fh;sx=((frame|0)%r[1])*m.fw;}
  const g=o.ctx||ctx2;const dx=Math.round(x-m.ax),dy=Math.round(y-m.ay);
  if(o.alpha!==undefined)g.globalAlpha=o.alpha;
  if(o.flip){g.save();g.translate(Math.round(x)*2,0);g.scale(-1,1);g.drawImage(im,sx,sy,m.fw,m.fh,dx,dy,m.fw,m.fh);g.restore();}
  else if(o.scale&&o.scale!==1){const s=o.scale;g.drawImage(im,sx,sy,m.fw,m.fh,Math.round(x-m.ax*s),Math.round(y-m.ay*s),Math.round(m.fw*s),Math.round(m.fh*s));}
  else g.drawImage(im,sx,sy,m.fw,m.fh,dx,dy,m.fw,m.fh);
  if(o.alpha!==undefined)g.globalAlpha=1;}
// ---------- ground chunks
const CH=256,chunks=new Map();let FRAME_NO=0;
const TS={};   // the old LPC ground tiles are gone: the ground is drawn from our own tex_ textures
const PIECE={1:[[0,2]],2:[[2,2]],3:[[1,2]],4:[[0,4]],5:[[0,3]],6:[[0,4],[2,2]],7:[[2,1]],8:[[2,4]],9:[[2,4],[0,2]],10:[[2,3]],11:[[1,1]],12:[[1,4]],13:[[2,0]],14:[[1,0]]};
function drawAuto(){}
function maskAt(fn,x,z){return (fn(x,z)?8:0)|(fn(x+1,z)?4:0)|(fn(x,z+1)?2:0)|(fn(x+1,z+1)?1:0);}
// the ground is drawn in chunks and kept; the valley is big enough now that only the most recently seen ones are kept (the rest are redrawn if you come back)
const CHUNK_MAX=150;
function chunkKeep(k,c){chunks.set(k,c);if(chunks.size>CHUNK_MAX){let n=chunks.size-CHUNK_MAX;for(const key of chunks.keys()){if(n--<=0)break;chunks.delete(key);}}}
function chunk(cx,cz){const k=cx+','+cz;let c=chunks.get(k);if(c){if(c.used!==FRAME_NO){c.used=FRAME_NO;chunks.delete(k);chunks.set(k,c);}return c;}
  c=document.createElement('canvas');c.width=CH;c.height=CH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
  const N=CH/32,x0=cx*N,z0=cz*N;
  if(x0>=280){g.fillStyle='#0a090c';g.fillRect(0,0,CH,CH);chunkKeep(k,c);return c;}
  c.wm=groundPixels(g,x0,z0,N);
  // Route 9: the Blender-rendered asphalt strip (rotated to run east-west), ending where the farm lane begins
  const rs=roadStripH();if(rs&&z0*32<(-6+5.2)*32&&(z0+N)*32>(-6-5.2)*32&&x0<-12.5){g.save();g.beginPath();{const ex=(-12.5-x0)*32;g.moveTo(0,0);for(let y=0;y<=CH;y+=4)g.lineTo(ex-Math.round(hash(y+z0*CH,7)*14+fbm(y*.05+z0*.3,z0)*70),y);g.lineTo(0,CH);g.closePath();}g.clip();{const bx0=(BRIDGE.x-4.4-x0)*32,bx1=(BRIDGE.x+4.4-x0)*32;g.beginPath();g.rect(-9999,-9999,bx0+9999,99999);g.rect(bx1,-9999,99999,99999);g.clip();}
    for(let wx=-312;wx<-12.5;wx+=12){const dx=(wx-x0)*32;if(dx>CH||dx+rs.width<0)continue;g.drawImage(rs,dx,(-6-5-z0)*32);}g.restore();}
  // past the ragged end, broken slabs of the same asphalt lie out on the gravel, fewer the further you go
  if(rs&&z0*32<(-6+5.2)*32&&(z0+N)*32>(-6-5.2)*32&&x0<-6&&x0+N>-16){for(let i=0;i<26;i++){const sx=-14.2+hash(i,91)*5.6,sz=-6+(hash(i,92)-.5)*7.4;if(hash(i,93)<(sx+13.4)/4.6)continue;
    const r=(.25+hash(i,94)*.55)*(1-(sx+14.2)/9)*32;if(r<4)continue;const cx=(sx-x0)*32,cz=(sz-z0)*32;if(cx<-40||cx>CH+40||cz<-40||cz>CH+40)continue;
    g.save();g.beginPath();for(let k=0;k<6;k++){const a2=k/6*6.283+hash(i,95+k);const rr=r*(.65+hash(i*7+k,96)*.5);g.lineTo(cx+Math.cos(a2)*rr,cz+Math.sin(a2)*rr*.8);}g.closePath();g.clip();
    g.drawImage(rs,(-30-x0)*32,(-6-5-z0)*32);g.restore();g.fillStyle='rgba(20,14,10,.35)';g.fillRect(Math.round(cx-r*.6),Math.round(cz+r*.62),Math.round(r*1.2),2);}}
  // the bridge deck: worn planks running across, darker toward the walls
  {const bx0=Math.round((BRIDGE.x-4.45-x0)*32),bx1=Math.round((BRIDGE.x+4.45-x0)*32),bz0=Math.round((-9.3-z0)*32),bz1=Math.round((-2.8-z0)*32);
   if(bx1>0&&bx0<CH&&bz1>0&&bz0<CH)for(let x=bx0;x<bx1;x++){const pl=Math.floor((x-bx0)/9),k=(x-bx0)%9;for(let y=Math.max(0,bz0);y<Math.min(CH,bz1);y++){const e=Math.min(y-bz0,bz1-1-y)/18;
     let c=k===8?[46,30,20]:k===0?[128,92,60]:[[96,66,42],[104,72,46],[88,60,38]][(pl+((y>>5)&1))%3];const n=hash(pl*31+(y>>3),x0+z0)*.18+.82;const sh=Math.min(1,.45+e*.6)*n;
     if(((y+pl*13)%37)===0&&k>2&&k<6)c=[40,28,18];g.fillStyle=`rgb(${c[0]*sh|0},${c[1]*sh|0},${c[2]*sh|0})`;g.fillRect(x,y,1,1);}}}
  // no water shows through the bridge decks: they come out of the water mask, so reflections and ripples stop at the planks
  if(c.wm){const wg=c.wm.getContext('2d');const cut=(ax,az,bx,bz)=>wg.clearRect(Math.round((ax-x0)*32),Math.round((az-z0)*32),Math.round((bx-ax)*32),Math.round((bz-az)*32));
    cut(BRIDGE.x-4.45,-9.3,BRIDGE.x+4.45,-2.8);cut(FOOT.x-3,FOOT.z-.8,FOOT.x+3,FOOT.z+.8);}
  // forest litter: leaf piles, moss, tufts, twigs and pebbles strewn over the woods by world position, gathered by a slow
  // noise into drifts of every size with bare soil between, so the forest floor never repeats with its 192 px tile.
  // Cells round the chunk's edge are visited too, so a pile that straddles two chunks is drawn whole in both.
  const lit=SPR.litter&&IMG[SPR.litter.src];
  if(lit){const cw=SPR.litter.fw,chh=SPR.litter.fh;for(let j=-2;j<N+2;j++)for(let i=-2;i<N+2;i++){const X=x0+i,Z=z0+j,h=hash(X*13+5,Z*7+11);
      // atlas (forest8.py): 0-5 loose leaves, 6-9 big piles, 10-13 medium, 14-17 small, 18-20 moss, 21-22 tufts, 23-25 sticks, 26-28 stones,
      // 29-32 heaps. A drift is graded: a merged heap at its heart, piles round it, loose leaves at its rim; open soil gets no lone leaves.
      const dr=fbm(X*.16+40,Z*.16+17),p=dr>.64?.62:dr>.55?.46:dr>.47?.3:.06;if(h>p)continue;
      if(!LAYERS.dark(X+.5,Z+.5)||!LAYERS.dark(X-.7,Z+.5)||!LAYERS.dark(X+1.7,Z+.5)||!LAYERS.dark(X+.5,Z+1.4)||terr(X+.5,Z+.5)!=='grass')continue;
      const r=hash(X+31,Z+17),q=hash(X*3+1,Z*5+2),pk=(a,n)=>a+((q*n)|0)%n;
      const v=dr>.68?(r<.45?pk(29,4):r<.8?pk(6,4):r<.9?pk(18,3):pk(23,3))
             :dr>.6?(r<.45?pk(6,4):r<.75?pk(10,4):r<.87?pk(18,3):pk(23,3))
             :dr>.53?(r<.4?pk(10,4):r<.65?pk(14,4):r<.85?pk(0,6):pk(18,3))
             :dr>.47?(r<.5?pk(0,6):r<.75?pk(14,4):r<.88?pk(21,2):pk(26,3))
             :(r<.4?pk(26,3):r<.75?pk(23,3):pk(21,2));
      const ox=((hash(X,Z+3)*24)|0)-12,oy=((hash(X+5,Z)*24)|0)-12,cx=i*32+16+ox,cy=j*32+16+oy;
      g.drawImage(lit,v*cw,0,cw,chh,cx-(cw>>1),cy-(chh>>1),cw,chh);}}   // never mirrored: the light stays top-left
    if(lit){const cw=SPR.litter.fw,chh=SPR.litter.fh;for(const o of OBJ){if(o.hide||o.room||o.x<x0-2||o.x>x0+N+2||o.z<z0-2||o.z>z0+N+2)continue;
      if(!(o.kind==='tree'||o.kind==='pine'||/boulder|rock_big|stump/.test(o.spr||'')))continue;if(!LAYERS.dark(o.x,o.z)||hash(o.x*7|0,o.z*3|0)>.75)continue;
      const r=hash((o.x*13)|0,(o.z*11)|0),v=r<.35?29+((r*11.4)|0)%4:r<.75?6+((r*10)|0)%4:10+((r*10)|0)%4;
      g.drawImage(lit,v*cw,0,cw,chh,Math.round((o.x-x0)*32+10-(cw>>1)),Math.round((o.z-z0)*32+6-(chh>>1)),cw,chh);}}   // leaves gathered against what stops them
  // stones on the dirt: clusters of 2-4 strewn by world position, gathered toward a lane's edges and corners so its
  // middle reads as trodden (the dirt tile itself carries only grit, so no stone marks its 192 px repeat)
  const grit=SPR.dirt_grit&&IMG[SPR.dirt_grit.src];
  if(grit){const gw=SPR.dirt_grit.fw,gh=SPR.dirt_grit.fh,nc=Math.round(grit.width/gw);
    for(let j=-1;j<N+1;j++)for(let i=-1;i<N+1;i++){const X=x0+i,Z=z0+j,h=hash(X*11+3,Z*13+7);if(h>.34)continue;
      if(terr(X+.5,Z+.5)!=='dirt'||(X>CORN.x0-1&&X<CORN.x1+1&&Z>CORN.z0-1&&Z<CORN.z1+1)||(X>FIELD.x0-1&&X<FIELD.x0+FIELD.w+1&&Z>FIELD.z0-1&&Z<FIELD.z0+FIELD.h+1))continue;
      const nearEdge=terr(X+1.8,Z+.5)!=='dirt'||terr(X-.8,Z+.5)!=='dirt'||terr(X+.5,Z+1.8)!=='dirt'||terr(X+.5,Z-.8)!=='dirt';
      if(!nearEdge&&h>.07)continue;
      const v=(hash(X+19,Z+23)*nc)|0,ox=((hash(X,Z+31)*22)|0)-11,oy=((hash(X+37,Z)*22)|0)-11;
      g.drawImage(grit,v*gw,0,gw,gh,i*32+16+ox-(gw>>1),j*32+16+oy-(gh>>1),gw,gh);}}
  // ground clutter: tufts, stones, wildflowers, twigs on open grass
  const dec=SPR.decor&&IMG[SPR.decor.src];
  if(dec)for(let j=0;j<N;j++)for(let i=0;i<N;i++){const X=x0+i,Z=z0+j,h=hash(X*7+3,Z*5+1);if(terr(X+.5,Z+.5)!=='grass')continue;
    const edge=terr(X+.5,Z-.5)!=='grass'||terr(X+.5,Z+1.5)!=='grass'||terr(X-.5,Z+.5)!=='grass'||terr(X+1.5,Z+.5)!=='grass',woods=LAYERS.dark(X+.5,Z+.5)||LAYERS.dark(X+.5,Z+2),cliff=ridgeH(X)>.3&&Z>ridgeZ(X)+RIDGE.h-1&&Z<ridgeZ(X)+RIDGE.h+2;
    const deep=lit&&LAYERS.dark(X+.5,Z+.5)&&!edge;   // under the trees the litter (with its own sticks and stones) carries the floor: no bright grass, flowers or pale pebbles
    if(deep||!(edge&&h>.35||woods&&h>.45||cliff&&h>.3||h>.94))continue;
    const r=hash(X+2,Z+9);const v=r<.45?(r*6.6|0)%3:r<.62?3+(r*10|0)%2:r<.82?5+(r*10|0)%2:7;const ox=(hash(X,Z+3)*16)|0,oy=(hash(X+5,Z)*16)|0;g.drawImage(dec,v*16,0,16,16,i*32+ox,j*32+oy,16,16);}
  // the ridge: a cliff face drawn column by column, with ambient occlusion at its foot
  const cl=SPR.cliff&&IMG[SPR.cliff.src];
  if(cl&&x0+N>RIDGE.x0&&x0<RIDGE.x1)for(let px=0;px<CH;px++){const wx=x0+px/32,hh=ridgeH(wx);if(hh<=0)continue;const top=Math.round(ridgeZ(wx)*32)-z0*32,hp=Math.round(hh*32);
    if(top+hp+8<0||top>CH)continue;const sc=((Math.round(wx*32)%64)+64)%64;
    g.drawImage(cl,sc,0,1,8,px,top,1,8);if(hp>8)g.drawImage(cl,sc,60-(hp-8),1,hp-8,px,top+8,1,hp-8);
    for(let k=0;k<6;k++){g.fillStyle=`rgba(0,18,10,${.34-k*.055})`;g.fillRect(px,top+hp+k,1,1);}}
  chunkKeep(k,c);return c;}
let _rsH=null;function roadStripH(){if(_rsH)return _rsH;const m=SPR.road,im=m&&IMG[m.src];if(!im)return null;
  const c=document.createElement('canvas');c.width=im.height;c.height=im.width;const g=c.getContext('2d');g.translate(0,im.width);g.rotate(-Math.PI/2);g.drawImage(im,0,0);return _rsH=c;}
// ---------- per-pixel ground: LibreSprite textures sampled in world space, regions blended along irregular edges
const TEXD={};const TP=192;
function texData(k){if(TEXD[k])return TEXD[k];const m=SPR['tex_'+k],im=m&&IMG[m.src];if(!im)return null;const c=document.createElement('canvas');c.width=TP;c.height=TP;const q=c.getContext('2d');q.drawImage(im,0,0);
  return TEXD[k]=q.getImageData(0,0,TP,TP).data;}
const GPAL={curb:[[150,144,134],[112,106,100]],gutter:[30,28,33],line:[176,150,70],dirt:[[78,48,36],[98,64,42],[146,106,64]],stone:[[54,52,62],[74,71,84]],grassTuft:[[78,138,58],[100,160,64]],wet:[[60,130,162],[148,196,216]]};
function jnoise(x,y){const xi=x>>3,yi=y>>3,fx=(x&7)/8,fy=(y&7)/8;const h=(a,b)=>hash(a*7+13,b*11+5);const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);
  const u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
function groundPixels(g,x0,z0,N){const LY=['dark','dirt','stone','walk','tar','gravel','water'],TX=['forest','dirt','stone','walk','tar','gravel','water'],NL=LY.length,WI=NL-1;const tg=texData('grass');if(!tg)return;
  const tl=TX.map(texData);const M=N+1;const corner=LY.map(l=>{const a=new Uint8Array(M*M),fn=LAYERS[l];for(let j=0;j<M;j++)for(let i=0;i<M;i++)a[j*M+i]=fn(x0+i,z0+j)?1:0;return a;});
  const id=g.createImageData(CH,CH),D=id.data;const wm=new Uint8Array(CH*CH);let anyW=0;
  for(let py=0;py<CH;py++){const j=py>>5,v=((py&31)+.5)/32;const wy=z0*32+py,ty=((wy%TP)+TP)%TP;
    for(let px=0;px<CH;px++){const i=px>>5,u=((px&31)+.5)/32;const wx=x0*32+px,tx=((wx%TP)+TP)%TP;let top=-1,edge=1,gx=0,gy=0;
      for(let l=0;l<NL;l++){const c=corner[l];const a=c[j*M+i],b=c[j*M+i+1],cc=c[(j+1)*M+i],d=c[(j+1)*M+i+1];const s4=a+b+cc+d;if(!s4)continue;
        if(s4===4){top=l;edge=1;continue;}const val=a*(1-u)*(1-v)+b*u*(1-v)+cc*(1-u)*v+d*u*v;const f=val+(jnoise(wx+l*97,wy+l*53)-.5)*(l===3||l===4?.05:.34);
        if(f>=.5){top=l;edge=f-.5;gy=(cc+d)-(a+b);gx=(b+d)-(a+cc);}}
      const o=(py*CH+px)*4,ti=(ty*TP+tx)*4;let T=top<0?tg:(tl[top]||tg);let r=T[ti],gg=T[ti+1],bb=T[ti+2];
      if(top>=0&&edge<1){const L=LY[top];
        if(L==='dirt'||L==='stone'||L==='gravel'){if(edge<.07){const q=L==='dirt'?GPAL.dirt[1]:GPAL.stone[1];r=q[0];gg=q[1];bb=q[2];if(hash(wx,wy)>.62&&gy<=0){const t=GPAL.grassTuft[hash(wx+3,wy)>.5?1:0];r=t[0];gg=t[1];bb=t[2];}}
          else if(edge<.17&&gy>0){r*=.74;gg*=.74;bb*=.74;}else if(edge<.13&&gx>0){r*=.84;gg*=.84;bb*=.84;}else if(edge<.12&&gy<0){r=Math.min(255,r*1.1);gg=Math.min(255,gg*1.1);bb=Math.min(255,bb*1.08);}}
        else if(L==='water'){if(edge<.06){const q=GPAL.dirt[2];r=q[0];gg=q[1];bb=q[2];}else if(edge<.1){const q=GPAL.dirt[1];r=q[0];gg=q[1];bb=q[2];}
          else if(edge<.22&&gy>0){r*=.68;gg*=.72;bb*=.8;}else if(edge<.15){const q=GPAL.wet[(wx+wy)%5===0?1:0];r=q[0];gg=q[1];bb=q[2];}}
        else if(L==='tar'){if(edge<.045){const q=GPAL.curb[gy<0?0:1];r=q[0];gg=q[1];bb=q[2];}else if(edge<.085){const q=GPAL.gutter;r=q[0];gg=q[1];bb=q[2];}}
        else if(L==='walk'){if(edge<.05){const q=GPAL.dirt[0];r=q[0];gg=q[1];bb=q[2];}else if(edge<.1&&gy>0){r*=.82;gg*=.82;bb*=.82;}}
        else if(L==='dark'&&edge<.09){if(hash(wx,wy)<1-edge/.09){r=tg[ti];gg=tg[ti+1];bb=tg[ti+2];}else if(edge<.03){r*=.86;gg*=.86;bb*=.86;}}}   // the wood's edge: grass blades break over the floor, no dark rim (a rim read as a hole)
      // a faded centre line down the town streets
      if(top===4&&typeof tarLine==='function'&&tarLine(wx/32,wy/32)){const q=GPAL.line;const k=.78+hash(wx>>1,wy)*.22;r=q[0]*k;gg=q[1]*k;bb=q[2]*k;}
      if(top===WI&&edge>=.1){wm[py*CH+px]=1;anyW=1;}
      D[o]=r;D[o+1]=gg;D[o+2]=bb;D[o+3]=255;}}
  g.putImageData(id,0,0);
  if(!anyW)return null;const mc=document.createElement('canvas');mc.width=CH;mc.height=CH;const mg=mc.getContext('2d');const md=mg.createImageData(CH,CH);for(let i=0;i<CH*CH;i++)if(wm[i])md.data[i*4+3]=255;mg.putImageData(md,0,0);return mc;}
// ---------- camera
const cam={x:0,z:0,shake:0,px:0,pz:0};
// all screen positions come from one integer-snapped camera, so ground and sprites never drift against each other
const sx=x=>Math.round(x*PPM)-cam.px+(VW>>1), sz=z=>Math.round(z*PPM)-cam.pz+Math.round(VH*.56);
// ---------- input
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'&&S.mode==='play')e.preventDefault();if(e.code==='KeyQ')onSeed();});addEventListener('keyup',e=>keys[e.code]=false);
const joy={x:0,y:0,id:null,ox:0,oy:0};
function setupTouch(){const J=$('joy'),K=$('knob');
  const down=e=>{if(typeof PLACE!=='undefined'&&PLACE.on)return;for(const t of e.changedTouches){if(joy.id!==null)continue;if(t.target.closest&&t.target.closest('button,.sheet,.screen'))continue;
      if(t.clientX>innerWidth*.62&&t.clientY>innerHeight*.55)continue;joy.id=t.identifier;joy.ox=t.clientX;joy.oy=t.clientY;J.style.left=t.clientX+'px';J.style.top=t.clientY+'px';J.classList.add('on');K.style.transform='translate(0,0)';}};
  const move=e=>{for(const t of e.changedTouches){if(t.identifier!==joy.id)continue;let dx=t.clientX-joy.ox,dy=t.clientY-joy.oy;const d=Math.hypot(dx,dy),m=52;if(d>m){dx*=m/d;dy*=m/d;}
      joy.x=dx/m;joy.y=dy/m;K.style.transform=`translate(${dx}px,${dy}px)`;e.preventDefault();}};
  const up=e=>{for(const t of e.changedTouches){if(t.identifier!==joy.id)continue;joy.id=null;joy.x=joy.y=0;J.classList.remove('on');}};
  addEventListener('touchstart',down,{passive:true});addEventListener('touchmove',move,{passive:false});addEventListener('touchend',up);addEventListener('touchcancel',up);
  // mouse drag fallback
  let md=false;addEventListener('mousedown',e=>{if(e.target!==view&&!(e.target&&e.target.id==='c'))return;if(typeof PLACE!=='undefined'&&PLACE.on)return;md=true;joy.ox=e.clientX;joy.oy=e.clientY;});
  addEventListener('mousemove',e=>{if(!md)return;let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const d=Math.hypot(dx,dy),m=60;if(d>m){dx*=m/d;dy*=m/d;}joy.x=dx/m;joy.y=dy/m;});
  addEventListener('mouseup',()=>{md=false;joy.x=joy.y=0;});}
// ---------- lighting
const AMB=[[0,[22,26,52]],[4.5,[24,28,56]],[6,[150,120,130]],[7.5,[235,226,214]],[9,[255,252,244]],[16,[255,248,236]],[17.6,[250,196,150]],[18.8,[170,104,112]],[19.8,[62,52,92]],[20.6,[26,30,62]],[26,[18,22,48]]];
function ambient(h){let i=0;while(i<AMB.length-2&&AMB[i+1][0]<=h)i++;const a=AMB[i],b=AMB[i+1];const t=smooth(clamp((h-a[0])/(b[0]-a[0]),0,1));return a[1].map((v,k)=>v+(b[1][k]-v)*t);}
function glowAt(x,y,r,col,a){const g=lctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);g.addColorStop(.45,`rgba(${col[0]},${col[1]},${col[2]},${a*.45})`);g.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
  lctx.fillStyle=g;lctx.fillRect(x-r,y-r,r*2,r*2);}
function coneAt(x,y,ang,spread,len,col,a){lctx.save();lctx.beginPath();lctx.moveTo(x,y);const n=14;for(let i=0;i<=n;i++){const t=ang-spread+spread*2*i/n;lctx.lineTo(x+Math.cos(t)*len,y+Math.sin(t)*len*.92);}lctx.closePath();lctx.clip();
  const g=lctx.createRadialGradient(x,y,4,x,y,len);g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${a})`);g.addColorStop(.55,`rgba(${col[0]},${col[1]},${col[2]},${a*.55})`);g.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
  lctx.fillStyle=g;lctx.fillRect(x-len,y-len,len*2,len*2);lctx.restore();}
// ---------- particles (pixel squares)
const parts=[];
function burst(x,z,n,col,spd,life,up,size){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=spd*(.3+Math.random()*.7);parts.push({x,z,y:0,vx:Math.cos(a)*s,vz:Math.sin(a)*s*.6,vy:(up||1)*(1+Math.random()),t:0,life:life*(.6+Math.random()*.6),col,size:size||1});}}
function partsUpdate(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue;}p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=dt*4;if(p.y<0){p.y=0;p.vy*=-.3;p.vx*=.6;p.vz*=.6;}}}
function partsDraw(){for(const p of parts){const x=Math.round(sx(p.x)),y=Math.round(sz(p.z)-p.y*PPM);ctx2.globalAlpha=1-p.t/p.life;ctx2.fillStyle=p.col;ctx2.fillRect(x,y,p.size,p.size);}ctx2.globalAlpha=1;}
// ---------- fog/noise textures
let fogTex=null,grainTex=null;
function makeFog(){const c=document.createElement('canvas');c.width=256;c.height=256;const g=c.getContext('2d');const id=g.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const F=(X,Y)=>fbm(X/38,Y/38)*.8+fbm(X/12+5,Y/12)*.2,u=x/256,w=y/256;const v=F(x,y)*(1-u)*(1-w)+F(x-256,y)*u*(1-w)+F(x,y-256)*(1-u)*w+F(x-256,y-256)*u*w;const a=clamp((v-.42)*2.4,0,1);const o=(y*256+x)*4;id.data[o]=170;id.data[o+1]=176;id.data[o+2]=196;id.data[o+3]=a*140;}
  g.putImageData(id,0,0);fogTex=c;
  const n=document.createElement('canvas');n.width=128;n.height=128;const ng=n.getContext('2d');const nd=ng.createImageData(128,128);
  for(let i=0;i<128*128;i++){const v=Math.random()*255;nd.data[i*4]=nd.data[i*4+1]=nd.data[i*4+2]=v;nd.data[i*4+3]=22;}ng.putImageData(nd,0,0);grainTex=n;}
