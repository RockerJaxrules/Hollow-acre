/* ================= the map in your menu, redrawn as a proper map of the valley: painted terrain with forest canopy, shaded water
   and the quarry, cream roads with ink edges, and every building, tree and fence drawn in miniature from the world's own sprites.
   Region names, place plaques, a compass, a parchment frame. Your mark, your objective, and anyone you're playing with.
   It zooms, and it scrolls with a finger. ================= */
const MAPX={s:4,pad:34,cv:null,zoom:1};
const REGIONS=[['MARROW HOLLOW',49,16],['HOLLOW ACRE',-2,-15.5],['ROUTE 9',-58,-14],['THE HOLLOW WOODS',108,-16],['THE QUARRY',147,-36],['BLACK LAKE',186,34],
  ['WICKHAM CROSSING',131,40],['QUILL ORCHARD',47,72],['THE MARSH PLACE',-25,70],['MILL ROAD',14,62],['THE RIVER',80,108],['TITHE CLEARING',-26,100],['THE CORN',-2,26]];
const MAPSIL={};
function mapSil(im,sx,sy,w,h){const k=im.src+'|'+sx+'|'+sy;if(MAPSIL[k])return MAPSIL[k];const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  g.drawImage(im,sx,sy,w,h,0,0,w,h);g.globalCompositeOperation='source-in';g.fillStyle='#2a1808';g.fillRect(0,0,w,h);return MAPSIL[k]=c;}
function mapPaint(){const s=MAPX.s,pad=MAPX.pad,W=Math.round((B.x1-B.x0)*s),H=Math.round((B.z1-B.z0)*s);
  const c=document.createElement('canvas');c.width=W+pad*2;c.height=H+pad*2;const g=c.getContext('2d');
  // ---- terrain, pixel by pixel
  const FW=W,FH=H;{const W=Math.round(FW/2),H=Math.round(FH/2),s=MAPX.s/2;
  const img=g.createImageData(W,H),d=img.data;const water=new Uint8Array(W*H);
  const at=(x,y)=>[B.x0+x/s,B.z0+y/s];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const [wx,wz]=at(x+.5,y+.5);if(LAYERS.water(wx,wz))water[y*W+x]=1;}
  // distance to the shore, for depth shading (a few cheap passes)
  const dist=new Uint8Array(W*H);for(let i=0;i<W*H;i++)dist[i]=water[i]?255:0;
  for(let pass=0;pass<2;pass++){for(let y=1;y<H;y++)for(let x=1;x<W;x++){const i=y*W+x;if(!water[i])continue;dist[i]=Math.min(dist[i],dist[i-1]+1,dist[i-W]+1);}
    for(let y=H-2;y>=0;y--)for(let x=W-2;x>=0;x--){const i=y*W+x;if(!water[i])continue;dist[i]=Math.min(dist[i],dist[i+1]+1,dist[i+W]+1);}}
  const mix=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const [wx,wz]=at(x+.5,y+.5);const i=(y*W+x)*4;let col;
    const n1=fbm(wx*.08,wz*.08),n2=fbm(wx*.5+11,wz*.5+3),n3=hash(Math.floor(wx*4),Math.floor(wz*4));
    if(water[y*W+x]){const dd=Math.min(1,dist[y*W+x]/7);col=mix([118,170,196],[38,72,112],dd);
      if(dist[y*W+x]<1)col=[196,222,226];else if(n3>.93&&dd>.3)col=mix(col,[150,196,214],.6);}
    else if(LAYERS.stone(wx,wz)){col=mix([150,146,138],[118,114,108],n2);if(n3>.86)col=[92,88,84];if(n3<.08)col=[190,186,176];}
    else if(LAYERS.dirt(wx,wz)){col=mix([196,160,104],[168,128,78],n2);if(n3>.92)col=[140,104,64];}
    else if(LAYERS.dark&&LAYERS.dark(wx,wz)){col=mix([46,74,40],[30,52,30],n2);if(n3>.7)col=mix(col,[70,100,52],.6);if(n3<.12)col=[22,38,24];}
    else{col=mix([118,150,72],[92,128,60],n1);col=mix(col,[150,150,70],Math.max(0,n2-.55));if(n3>.95)col=mix(col,[200,170,90],.5);}
    if(wx>CORN.x0&&wx<CORN.x1&&wz>CORN.z0&&wz<CORN.z1){col=mix([214,182,86],[176,140,60],n2);if(Math.floor(wx*2)%2===0)col=mix(col,[150,118,48],.35);}
    // light from the top left: a soft relief from the noise
    const sh=(fbm(wx*.12+.7,wz*.12+.7)-fbm(wx*.12,wz*.12))*90;col=col.map(v=>Math.max(0,Math.min(255,v+sh)));
    d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=255;}
  // the land casts a thin dark line along every shore
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const k=y*W+x;if(water[k])continue;if(water[k+1]||water[k-1]||water[k+W]||water[k-W]){const i=k*4;d[i]=Math.round(d[i]*.62);d[i+1]=Math.round(d[i+1]*.62);d[i+2]=Math.round(d[i+2]*.62);}}
  const tc=document.createElement('canvas');tc.width=W;tc.height=H;tc.getContext('2d').putImageData(img,0,0);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(tc,pad,pad,FW,FH);
  MAPX.water={W,H,water,dist};}
  const W2=FW,H2=FH;
  g.save();g.translate(pad,pad);const X=x=>(x-B.x0)*s,Y=z=>(z-B.z0)*s;
  // little waves on open water
  {const w=MAPX.water;g.strokeStyle='rgba(220,240,250,.55)';g.lineWidth=1;for(let i=0;i<900;i++){const x=Math.floor(Math.random()*w.W),y=Math.floor(Math.random()*w.H);if(!w.water[y*w.W+x]||w.dist[y*w.W+x]<2)continue;const X2=x*2,Y2=y*2;g.beginPath();g.moveTo(X2-2,Y2);g.quadraticCurveTo(X2,Y2-2,X2+2,Y2);g.stroke();}}
  // roads: an ink edge, a cream fill, a faint dashed centre on the big ones
  const roads=(typeof ROADS!=='undefined'?ROADS:[]);
  for(const pass of [0,1,2])for(const [x0,z0,x1,z1,w] of roads){g.lineCap='round';g.beginPath();g.moveTo(X(x0),Y(z0));g.lineTo(X(x1),Y(z1));
    if(pass===0){g.strokeStyle='#5a3a20';g.lineWidth=w*s*.9+3;g.stroke();}else if(pass===1){g.strokeStyle='#e8d4a4';g.lineWidth=w*s*.9;g.stroke();}
    else if(w>=2.4){g.setLineDash([5,6]);g.strokeStyle='rgba(150,110,60,.6)';g.lineWidth=1;g.stroke();g.setLineDash([]);}}
  // the field: tilled ground is drawn live; here, its fence of earth
  g.strokeStyle='rgba(90,60,30,.7)';g.lineWidth=1;g.strokeRect(X(FIELD.x0),Y(FIELD.z0),FIELD.w*s,FIELD.h*s);
  // ---- every object in the valley, in miniature, back to front
  const list=OBJ.filter(o=>!o.room&&o.x<250&&o.x>B.x0-2&&o.x<B.x1+2&&o.z>B.z0-2&&o.z<B.z1+2&&o.spr&&SPR[o.spr]&&IMG[SPR[o.spr].src]&&!/^(grass|flat)$/.test(o.kind||'')).sort((a,b)=>a.z-b.z);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  for(const o of list){const m=SPR[o.spr],im=IMG[m.src];const k=o.kind||'';let sc=s/PPM*(k==='bld'?1.28:k==='tree'?1.15:1.05)*(o.scale||1);
    if(o.hide&&!/tree|bld/.test(k))continue;
    let sx=0,sy=0;if(m.clips){const c=Object.values(m.clips)[0];const r=Object.values(c)[0];sy=r[0]*m.fh;}
    const dx=X(o.x)-m.ax*sc,dy=Y(o.z)-m.ay*sc,dw=m.fw*sc,dh=m.fh*sc;if(dw<1.5||dh<1.5)continue;
    if(k==='bld'||k==='tree'){g.fillStyle='rgba(20,14,8,.28)';g.beginPath();g.ellipse(X(o.x)+dw*.06,Y(o.z),dw*.42,Math.max(1.5,dw*.13),0,0,Math.PI*2);g.fill();}
    if(k==='bld'){const oc=mapSil(im,sx,sy,m.fw,m.fh);for(const [ox,oy] of [[-1.5,0],[1.5,0],[0,-1.5],[0,1.5]])g.drawImage(oc,0,0,m.fw,m.fh,dx+ox,dy+oy,dw,dh);}
    g.drawImage(im,sx,sy,m.fw,m.fh,dx,dy,dw,dh);}
  g.restore();
  // ---- the frame: parchment edge, ink border, corners
  {const W=W2,H=H2;g.save();const vg=g.createRadialGradient(c.width/2,c.height/2,Math.min(W,H)*.45,c.width/2,c.height/2,Math.max(W,H)*.72);vg.addColorStop(0,'rgba(60,40,20,0)');vg.addColorStop(1,'rgba(60,36,16,.38)');
  g.fillStyle=vg;g.fillRect(pad,pad,W,H);
  g.fillStyle='#d8c08a';g.fillRect(0,0,c.width,pad);g.fillRect(0,c.height-pad,c.width,pad);g.fillRect(0,0,pad,c.height);g.fillRect(c.width-pad,0,pad,c.height);
  for(let i=0;i<2600;i++){const x=Math.random()*c.width,y=Math.random()*c.height;if(x>pad&&x<c.width-pad&&y>pad&&y<c.height-pad)continue;g.fillStyle=Math.random()<.5?'rgba(120,84,40,.18)':'rgba(255,240,200,.2)';g.fillRect(x,y,2,2);}
  g.strokeStyle='#4a2e14';g.lineWidth=3;g.strokeRect(pad-2,pad-2,W+4,H+4);g.lineWidth=1;g.strokeRect(pad-8,pad-8,W+16,H+16);
  for(const [cx,cy] of [[pad-8,pad-8],[c.width-pad+8,pad-8],[pad-8,c.height-pad+8],[c.width-pad+8,c.height-pad+8]]){g.fillStyle='#4a2e14';g.beginPath();g.arc(cx,cy,6,0,Math.PI*2);g.fill();g.fillStyle='#d8c08a';g.beginPath();g.arc(cx,cy,3,0,Math.PI*2);g.fill();}
  // scale ticks along the border
  g.fillStyle='#4a2e14';for(let x=pad;x<c.width-pad;x+=s*10)g.fillRect(x,pad-6,1,4);for(let y=pad;y<c.height-pad;y+=s*10)g.fillRect(pad-6,y,4,1);
  // compass rose
  {const cx=c.width-pad-62,cy=c.height-pad-62,r=40;g.save();g.translate(cx,cy);g.fillStyle='rgba(232,214,170,.88)';g.beginPath();g.arc(0,0,r+8,0,Math.PI*2);g.fill();g.strokeStyle='#4a2e14';g.lineWidth=2;g.stroke();
    for(let k=0;k<8;k++){const a=k*Math.PI/4,L=k%2?r*.55:r;g.fillStyle=k%2?'#8a6a3a':(k===0?'#9a2a1a':'#4a2e14');g.beginPath();g.moveTo(Math.sin(a)*L,-Math.cos(a)*L);g.lineTo(Math.sin(a+.25)*8,-Math.cos(a+.25)*8);g.lineTo(Math.sin(a-.25)*8,-Math.cos(a-.25)*8);g.closePath();g.fill();}
    g.fillStyle='#4a2e14';g.font='bold 10px "Hollow Pixel",monospace';g.textAlign='center';g.fillText('N',0,-r-12);g.restore();}
  // title cartouche
  {const t='The Valley of Marrow Hollow';g.font='bold 20px "Hollow Pixel",monospace';const tw=g.measureText(t).width+44,tx=pad+18,ty=pad+16;g.fillStyle='rgba(232,214,170,.92)';g.fillRect(tx,ty,tw,38);g.strokeStyle='#4a2e14';g.lineWidth=2;g.strokeRect(tx,ty,tw,38);g.strokeRect(tx+4,ty+4,tw-8,30);
    g.fillStyle='#3a2210';g.textAlign='left';g.fillText(t,tx+22,ty+26);}}
  return c;}
// ---- labels never sit on each other: each tries its spot, then above, below, to the side; a pin marks the real spot when it moves.
// What doesn't fit waits for you to zoom in. Your own mark is never covered.
function mapLayout(inner){const W=inner.clientWidth,H=inner.clientHeight;if(!W||!H)return;const placed=[];
  const you=inner.querySelector('.you');if(you){const x=you.offsetLeft,y=you.offsetTop;placed.push({x0:x-14,y0:y-14,x1:x+14,y1:y+14});}
  const hit=r=>r.x0<2||r.y0<2||r.x1>W-2||r.y1>H-2||placed.some(q=>r.x0<q.x1&&r.x1>q.x0&&r.y0<q.y1&&r.y1>q.y0);
  const items=[...inner.querySelectorAll('.plq,.rgn')].sort((a,b)=>(+b.dataset.pri)-(+a.dataset.pri));
  for(const el of items){el.style.display='';const ax=+el.dataset.ax*W/100,ay=+el.dataset.ay*H/100,w=el.offsetWidth,h=el.offsetHeight;
    const C=el.classList.contains('rgn')?[[0,0],[0,-h*.8],[0,h*.8],[w*.25,0],[-w*.25,0]]:[[0,0],[0,-h-7],[0,h+7],[w/2+9,0],[-w/2-9,0],[w/2+7,-h-3],[-w/2-7,-h-3],[w/2+7,h+3],[-w/2-7,h+3]];
    let ok=null;for(const [dx,dy] of C){const r={x0:ax+dx-w/2-3,y0:ay+dy-h/2-2,x1:ax+dx+w/2+3,y1:ay+dy+h/2+2};if(!hit(r)){ok=[dx,dy,r];break;}}
    if(!ok){el.style.display='none';continue;}
    placed.push(ok[2]);el.style.left=(ax+ok[0])+'px';el.style.top=(ay+ok[1])+'px';
    if((ok[0]||ok[1])&&el.classList.contains('plq')){const d=document.createElement('div');d.className='pin';d.style.left=ax+'px';d.style.top=ay+'px';inner.appendChild(d);}}}
// ---- the live layer: the field as it is today, you, your objective, your friends
function mapLive(g,base){const s=MAPX.s,pad=MAPX.pad,X=x=>pad+(x-B.x0)*s,Y=z=>pad+(z-B.z0)*s;g.drawImage(base,0,0);
  for(const t of tiles){if(t.gh)continue;if(!t.tilled&&!t.crop)continue;g.fillStyle=t.crop&&t.crop.watered?'#5a3a20':'#7a5230';g.fillRect(X(t.x-.5)+.5,Y(t.z-.5)+.5,s-1,s-1);
    if(t.crop){g.fillStyle=t.crop.stage>=3?'#e8a030':'#7ac04a';g.fillRect(X(t.x)-1,Y(t.z)-1,2,2);}}
  const ob=typeof objective==='function'?objective():null;const tg=ob&&ob[2];
  if(tg&&isFinite(tg.x)&&isFinite(tg.z)&&tg.x<250){const x=X(tg.x),y=Y(tg.z);g.save();g.translate(x,y);g.fillStyle='#ffd040';g.strokeStyle='#5a2a08';g.lineWidth=2;g.beginPath();
    for(let k=0;k<10;k++){const a=k*Math.PI/5-Math.PI/2,r=k%2?4:10;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();g.stroke();g.restore();}
  if(typeof others==='function')for(const p of others()){const q=p.presence;if(!q||q.r)continue;g.fillStyle='#4ab0e8';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(X(q.x),Y(q.z),5,0,Math.PI*2);g.fill();g.stroke();
    g.font='bold 10px "Hollow Pixel",monospace';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(240,226,190,.9)';g.strokeText(clean(q.n),X(q.x),Y(q.z)-9);g.fillStyle='#123a5a';g.fillText(clean(q.n),X(q.x),Y(q.z)-9);}}
// ---- the screen
{const c=document.createElement('style');c.textContent=`
#mapWrap{position:relative;overflow:auto;max-height:min(64vh,620px);-webkit-overflow-scrolling:touch;background:#2a1a0c;box-shadow:inset 0 0 0 3px #5a3418;touch-action:pan-x pan-y}
#mapInner{position:relative}#mapInner canvas{display:block;width:100%;height:auto;image-rendering:auto}
#mapWrap .rgn{position:absolute;transform:translate(-50%,-50%);font:italic 600 13px/1 Georgia,serif;letter-spacing:.16em;color:#3a2210;white-space:nowrap;pointer-events:none;
  text-shadow:0 0 2px rgba(240,226,190,.95),0 0 4px rgba(240,226,190,.9),1px 1px 0 rgba(240,226,190,.9)}
#mapWrap .plq,#mapWrap .rgn{z-index:2}#mapWrap .pin{z-index:1;position:absolute;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#3a2210;box-shadow:0 0 0 1.5px #f0e2be;pointer-events:none}
#mapWrap .plq{position:absolute;transform:translate(-50%,-50%);font:600 11px/1.1 Georgia,serif;color:#2a1608;background:rgba(236,220,178,.9);padding:2px 6px;border:1px solid #6a4422;box-shadow:1px 1px 0 rgba(0,0,0,.35);white-space:nowrap;pointer-events:none}
#mapWrap .you{position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;pointer-events:none;z-index:4}#mapWrap .you .dir{position:absolute;left:50%;top:50%;width:0;height:0;transform-origin:0 0}#mapWrap .you .dir:after{content:'';position:absolute;left:7px;top:-4px;border-left:7px solid #e8402a;border-top:4px solid transparent;border-bottom:4px solid transparent;filter:drop-shadow(0 0 1px #fff)}
#mapWrap .you:before{content:'';position:absolute;inset:0;border-radius:50%;background:#e8402a;box-shadow:0 0 0 2px #fff,0 0 0 4px rgba(0,0,0,.4)}
#mapWrap .you:after{content:'';position:absolute;inset:-7px;border-radius:50%;border:2px solid rgba(232,64,42,.8);animation:mapRing 1.4s ease-out infinite}
@keyframes mapRing{from{transform:scale(.4);opacity:1}to{transform:scale(1.4);opacity:0}}
#mapWrap .you.ghost:before{background:#2a2a2a;box-shadow:0 0 0 2px #888}#mapWrap .you.ghost:after{border-color:rgba(40,40,40,.7)}
#mapBar{display:flex;gap:6px;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:12px}#mapBar .z{display:flex;gap:4px}#mapBar button{min-width:34px}
#mapLegend{display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:6px;font-size:11.5px;opacity:.85}#mapLegend i{display:inline-block;width:10px;height:10px;margin-right:4px;vertical-align:-1px;border:1px solid #1a0e06}`;document.head.appendChild(c);}
function mapZoom(z){MAPX.zoom=clamp(z,1,4);renderMap(true);}
// #275: the place names were typed-in spots from an older layout of the town, so after the redesign several sat well away
// from their buildings (the old mine 15 paces off, the church 7, the graveyard 6), and "you" looked wrong beside them. Now each
// name is pinned to the real building it names, wherever it stands.
const MAP_PIN={'Church':'church','Coyle’s store':'store','Post office':'postoffice','Town hall':'townhall','Schoolhouse':'schoolhouse','Pruitt’s Garage':'garage',
  'Feed & Stock':'shop_feed','Forge':'shop_forge','Bait & Tackle':'shop_bait','Hartley Carpentry':'shop_carp','Lantern Inn':'inn','Gas station':'fuel',
  'The Marsh place':'h_marsh','Tithe House':'h_tithe','Covered bridge':'cbridge','Old mine':'mineportal'};
function mapPlacesLive(){const by={};for(const o of OBJ){if(o.kind!=='bld'||o.room||o.hide)continue;if(!by[o.spr])by[o.spr]=o;}
  for(const p of MAP_PLACES){const k=MAP_PIN[p[0]],o=k&&by[k];if(o){p[1]=o.x;p[2]=o.z;continue;}
    try{if(p[0]==='Graveyard'){p[1]=(GYARD.x0+GYARD.x1)/2;p[2]=(GYARD.z0+GYARD.z1)/2;}else if(p[0]==='The pond'){p[1]=pond.x;p[2]=pond.z;}
      else if(p[0]==='Your car'){p[1]=carPos.x;p[2]=carPos.z;}else if(p[0]==='Crossroads'){p[1]=crossPos.x;p[2]=crossPos.z;}else if(p[0]==='The green'){p[1]=squarePos.x;p[2]=squarePos.z;}}catch(e){}}}
renderMap=function(keep){try{mapPlacesLive();}catch(e){}const B2=$('bagBody');$('bagSub').textContent=S.room?'You are indoors. The mark shows the door you came in by.':'You are the red mark. The star is where you’re headed.';
  if(!MAPX.cv){B2.innerHTML='<p class="jsub" style="padding:30px;text-align:center">Inking the map…</p>';$('bag').hidden=false;setTimeout(()=>{MAPX.cv=mapPaint();if(GM_TAB==='map'&&!$('bag').hidden)renderMap();},30);return;}
  const prev=$('mapWrap');const keepX=keep&&prev?(prev.scrollLeft+prev.clientWidth/2)/prev.scrollWidth:null,keepY=keep&&prev?(prev.scrollTop+prev.clientHeight/2)/prev.scrollHeight:null;
  B2.innerHTML=`<div id="mapBar"><span>Drag to look around.</span><span class="z"><button class="btn" id="mzOut">−</button><button class="btn" id="mzIn">+</button></span></div><div id="mapWrap"><div id="mapInner"><canvas id="mapCv"></canvas></div></div>
    <div id="mapLegend"><span><i style="background:#e8402a;border-radius:50%"></i>You</span><span><i style="background:#ffd040"></i>Where you’re headed</span><span><i style="background:#4ab0e8;border-radius:50%"></i>Friends</span><span><i style="background:#e8d4a4"></i>Roads</span><span><i style="background:#2e4a28"></i>Deep woods</span></div>`;
  const base=MAPX.cv,cv=$('mapCv');cv.width=base.width;cv.height=base.height;mapLive(cv.getContext('2d'),base);
  // the mine: a grey shoulder of rock with a dark timbered mouth, so it can be found on the map
  if(typeof MINE!=='undefined'&&MINE.z<-12){const g=cv.getContext('2d'),s=MAPX.s*2.2,X=MAPX.pad+(MINE.x-B.x0)*MAPX.s,Y=MAPX.pad+(MINE.z-B.z0)*MAPX.s;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(X,Y+s*.4,s*3.4,s*.7,0,0,6.29);g.fill();
    g.fillStyle='#5a5650';g.beginPath();g.ellipse(X,Y-s*.6,s*3.2,s*1.9,0,Math.PI,0);g.fill();g.fillStyle='#7a766e';g.beginPath();g.ellipse(X-s*.5,Y-s*1.1,s*2.2,s*1.1,0,Math.PI,0);g.fill();
    g.fillStyle='#14100c';g.beginPath();g.ellipse(X,Y-s*.2,s*1.05,s*1.3,0,Math.PI,0);g.fill();g.fillRect(X-s*1.05,Y-s*.2,s*2.1,s*.5);
    g.fillStyle='#8a5a2a';g.fillRect(X-s*1.25,Y-s*1.5,s*.35,s*1.8);g.fillRect(X+s*.9,Y-s*1.5,s*.35,s*1.8);g.fillRect(X-s*1.35,Y-s*1.65,s*2.7,s*.35);}
  const wrap=$('mapWrap'),inner=$('mapInner');const fit=wrap.clientWidth||600;const wpx=Math.max(fit,Math.round(fit*1.7*MAPX.zoom));inner.style.width=wpx+'px';
  const pct=(x,z)=>[(MAPX.pad+(x-B.x0)*MAPX.s)/base.width*100,(MAPX.pad+(z-B.z0)*MAPX.s)/base.height*100];
  for(const [n,x,z] of MAP_PLACES){const nn=x=>x.toLowerCase().replace(/^the /,'');if(REGIONS.some(r=>nn(r[0])===nn(n)))continue;const [l,t]=pct(x,z);const dv=document.createElement('div');dv.className='plq';dv.dataset.ax=l;dv.dataset.ay=t;dv.dataset.pri=10;dv.textContent=n;inner.appendChild(dv);}
  for(const [n,x,z] of REGIONS){const [l,t]=pct(x,z);const dv=document.createElement('div');dv.className='rgn';dv.dataset.ax=l;dv.dataset.ay=t;dv.dataset.pri=5;dv.style.fontSize=Math.round(11+MAPX.zoom*2)+'px';dv.textContent=n;inner.appendChild(dv);}
  let px=P.x,pz=P.z;const R=roomOf&&roomOf();if(R&&R.out){px=R.out.x;pz=R.out.z;}const [l,t]=pct(px,pz);const y=document.createElement('div');y.className='you';y.style.left=l+'%';y.style.top=t+'%';
  // which way you're facing, so the exact spot reads at a glance
  if(!R){const ang=Math.atan2(P.fz||0,P.fx||0)*180/Math.PI;const ar=document.createElement('i');ar.className='dir';ar.style.transform=`rotate(${ang}deg)`;y.appendChild(ar);}inner.appendChild(y);
  // late in the story the map knows something you don't: a second mark, at the Marsh place
  if(typeof hl==='function'&&hl()>=3&&isNight()&&rand()<.5){const [l2,t2]=pct(-20,LANE_W-1);const g2=document.createElement('div');g2.className='you ghost';g2.style.left=l2+'%';g2.style.top=t2+'%';inner.appendChild(g2);setTimeout(()=>g2.remove(),2400);}
  $('mzIn').onclick=()=>mapZoom(MAPX.zoom*1.5);$('mzOut').onclick=()=>mapZoom(MAPX.zoom/1.5);
  $('bag').hidden=false;requestAnimationFrame(()=>{mapLayout(inner);const fx=keepX!=null?keepX:l/100,fy=keepY!=null?keepY:t/100;wrap.scrollLeft=fx*wrap.scrollWidth-wrap.clientWidth/2;wrap.scrollTop=fy*wrap.scrollHeight-wrap.clientHeight/2;});};
