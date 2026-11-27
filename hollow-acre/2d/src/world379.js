/* ================= #379 the world is what it says it is (owner, Nov 27: "Hollis garage doesn't match the door is to the side of the
   garage", "Gates for orphanage should be open or you have to open it you shouldn't just be walking through it").
   - Pruitt's garage: you go in through its big front door, up its steps. The way in used to be under the right-hand window, a wall
     with no door in it, while the door itself only offered a look at a map; the map is now taped up inside that window instead.
   - Greyfield's iron gates were drawn shut and you walked straight through them. They are now a gate you open: the leaves stand
     solid until you open them, then swing back into the yard on their hinges with a creak and a clank, and stay open (saved).
     The brick posts now stop you where they are drawn (their colliders only covered their outer halves). ================= */
const W79={};
function w79S(){if(!S.w79)S.w79={};const s=S.w79;s.gate=s.gate||{};return s;}
const w79Cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function w79Reg(id,c,ax,ay){const src='w79:'+id;IMG[src]=c;SPR['w79_'+id]={src,fw:c.width,fh:c.height,ax:Math.round(ax),ay:Math.round(ay),foot:[0,0,0,0]};return 'w79_'+id;}
// our own synthesised sounds (sfx376): an iron gate's hinge creaks as it swings, its leaf knocks against its stop
function w79Creak(g){try{if(typeof MSX!=='undefined'&&MSX.ok&&MSX.ok()){MSX.play('creak',null,{g:.6*(g||1),r:.72});MSX.play('creak',null,{g:.4*(g||1),r:.6,dl:.32});MSX.play('knock',null,{g:.32*(g||1),r:.7,dl:.78});return;}}catch(e){}
  try{SFX.thud&&SFX.thud(0,.18);}catch(e){}}

// ---------------------------------------------------------------- 1. Pruitt's garage: the way in is its big door
const W79_GARAGE={x:-36,z:-10.25,map:{x:-32.9,z:-10.15}};
function w79Garage(){if(W79.garage)return;if(typeof ROOMS==='undefined'||!ROOMS.garage||typeof interact==='undefined')return;
  let n=0;for(const it of interact){if(!it||typeof it.label!=='function')continue;let lb='';try{lb=it.label();}catch(e){}
    if(lb==='Enter'&&Math.abs(it.x+33.7)<.05&&Math.abs(it.z+10.25)<.05){it.x=W79_GARAGE.x;it.z=W79_GARAGE.z;it.r=1.05;n++;}}
  if(!n)return;ROOMS.garage.out={x:W79_GARAGE.x,z:-9.5};
  try{if(typeof HOMES!=='undefined'&&HOMES.pruitt&&HOMES.pruitt.door)HOMES.pruitt.door=[W79_GARAGE.x,W79_GARAGE.z];}catch(e){}
  // the road map: taped up inside the right-hand window (it was a glint on the door, where the way in now is)
  try{const f=finds.find(q=>q.id==='map');if(f){const OLD=f.title,ox=f.x,oz=f.z;f.x=W79_GARAGE.map.x;f.z=W79_GARAGE.map.z;f.title='A map in the garage window';
    f.text='A road map taped up inside the garage window, every way out of the valley crossed through in black. Pinned to it with a nail, a polaroid of your crashed car, taken from above. Nobody has a ladder that tall.';
    W79.mapOld=OLD+'|';W79.mapNew=f.title+'|';
    for(const it of interact){if(!it||Math.abs(it.x-ox)>.01||Math.abs(it.z-oz)>.01||it.r!==1.3)continue;it.x=f.x;it.z=f.z;it.r=1.1;const _on=it.on;it.on=()=>!S.lore.includes(W79.mapOld)&&(_on?_on():true);}}}catch(e){}
  W79.garage=1;}
// an old save that already read the map on the door has read it in the window too
function w79MapSeen(){if(!W79.mapOld||!S.lore)return;if(S.lore.includes(W79.mapOld)&&!S.lore.includes(W79.mapNew))S.lore.push(W79.mapNew);}

// ---------------------------------------------------------------- 2. gates you open (Greyfield's iron gates)
// a gate sprite is cut in two: the posts and the arch stay where they are; each leaf becomes its own sprite, hung on its post, redrawn
// as it swings back into the yard (each column of the leaf moves in toward the hinge by cos and back, up the screen, by sin)
const W79_GATES={grey:{spr:'rg_gate',hinge:[26,101],mid:64,top:24,bot:99,isLeaf:(x,y)=>x>=26&&x<=101&&y<=99&&(y>=30||(y>=24&&x>=40&&x<=88)),open:65*Math.PI/180,
  posts:[[-2.05,-1.19],[1.19,2.05]]}};
function w79LeafDraw(G,L){const c=L.cv,g=c.getContext('2d'),src=L.src,n=src.width,H=src.height,cs=Math.cos(G.th),sn=Math.sin(G.th);g.clearRect(0,0,c.width,c.height);
  for(let d=n-1;d>=0;d--){const col=L.left?d:n-1-d,X=L.left?Math.round(d*cs):c.width-1-Math.round(d*cs),Y=c.height-H-Math.round(d*sn);g.drawImage(src,col,0,1,H,X,Y,1,H);}}
function w79GateBuild(key){const G=W79_GATES[key];if(G.o)return true;const o=OBJ.find(q=>q.spr===G.spr&&!q.room);const m=SPR[G.spr],im=m&&IMG[m.src];if(!o||!im||(!(im instanceof HTMLCanvasElement)&&!(im.complete&&im.naturalWidth)))return false;
  const W=m.fw,Hh=m.fh,base=w79Cv(W,Hh),bg=base.getContext('2d');bg.drawImage(im,0,0,W,Hh,0,0,W,Hh);const id=bg.getImageData(0,0,W,Hh),d=id.data;
  const [h0,h1]=G.hinge,top=G.top,bot=G.bot,H=bot-top+1;
  const leaf=(x0,x1,left)=>{const n=x1-x0+1,src=w79Cv(n,H),sg=src.getContext('2d'),sd=sg.createImageData(n,H);
    for(let y=top;y<=bot;y++)for(let x=x0;x<=x1;x++){if(!G.isLeaf(x,y))continue;const i=(y*W+x)*4,j=((y-top)*n+(x-x0))*4;for(let k=0;k<4;k++)sd.data[j+k]=d[i+k];d[i+3]=0;}
    sg.putImageData(sd,0,0);const cv=w79Cv(n,H+n);return {src,cv,left,n};};
  const L=leaf(h0,G.mid-1,true),R=leaf(G.mid,h1,false);bg.putImageData(id,0,0);
  G.o=o;G.x=o.x;G.z=o.z;G.base=w79Reg('gate_'+key,base,m.ax,m.ay);G.L=L;G.R=R;
  const s=w79S();G.th=s.gate[key]?G.open:0;G.t=s.gate[key]?1:0;G.want=G.t;
  // world x of each hinge
  const px=1/PPM,hxL=o.x+(h0-m.ax)*px,hxR=o.x+(h1+1-m.ax)*px;G.hx=[hxL,hxR];G.len=L.n*px;
  for(const lf of [L,R]){const sp=w79Reg('gate_'+key+(lf.left?'_l':'_r'),lf.cv,lf.left?0:lf.cv.width-1,lf.cv.height-1+(m.ay-bot));lf.spr=sp;
    lf.o=obj(sp,lf.left?hxL:hxR,o.z-.3,{kind:'prop',noCol:true});w79LeafDraw(G,lf);}
  o.spr=G.base;
  // the posts stop you where they are drawn
  for(const [a,b] of G.posts){for(let i=rects.length-1;i>=0;i--){const q=rects[i];if(q.z0<o.z+.2&&q.z1>o.z-.4&&q.x0>o.x+a-.2&&q.x1<o.x+b+.2&&q.x1-q.x0<1){rects.splice(i,1);}}addRect(o.x+a,o.z-.32,o.x+b,o.z+.06);}
  w79GateCol(G);
  // open it from either side
  for(const dz of [.55,-.6])interact.push({x:o.x,z:o.z+dz,r:1.35,on:()=>!S.room&&G.want<1,label:()=>'Open the gate',ok:()=>true,act(){w79GateOpen(key);}});
  return true;}
function w79GateCol(G){if(G.col)for(const q of G.col){const a=q.k==='r'?rects:segs,i=a.indexOf(q.q);if(i>=0)a.splice(i,1);}G.col=[];
  const z=G.z,[hl,hr]=G.hx;if(G.want<1){addRect(hl,z-.1,hr,z+.04);G.col.push({k:'r',q:rects[rects.length-1]});return;}
  const c=Math.cos(G.open)*G.len,s=Math.sin(G.open)*G.len;addSeg(hl,z-.04,hl+c,z-.04-s,.08);G.col.push({k:'s',q:segs[segs.length-1]});addSeg(hr,z-.04,hr-c,z-.04-s,.08);G.col.push({k:'s',q:segs[segs.length-1]});}
function w79GateOpen(key){const G=W79_GATES[key];if(!G||!G.o||G.want>=1)return;G.want=1;w79S().gate[key]=1;w79Creak(1);w79GateCol(G);}
// the swing: slow off the latch, gathering, a small bounce off its stop
function w79GateTick(dt){for(const key in W79_GATES){const G=W79_GATES[key];if(!G.o||G.t===G.want)continue;G.t=Math.min(1,G.t+dt/1.05);const u=G.t;
  const e=u<.7?1.06*Math.pow(u/.7,1.5):1.06-.06*Math.sin((u-.7)/.3*Math.PI/2);G.th=u>=1?G.open:G.open*e;
  w79LeafDraw(G,G.L);w79LeafDraw(G,G.R);}}
{const _u=update;update=function(dt){_u(dt);try{w79GateTick(dt);}catch(e){}};}

// ---------------------------------------------------------------- set up once the world is built
setInterval(()=>{try{if(typeof OBJ==='undefined'||!OBJ.length)return;w79Garage();for(const k in W79_GATES)if(!W79_GATES[k].o)w79GateBuild(k);w79MapSeen();
  // a save loaded after the gate was built: its saved state wins
  const s=w79S();for(const k in W79_GATES){const G=W79_GATES[k];if(G.o&&s.gate[k]&&G.want<1){G.want=1;G.t=1;G.th=G.open;w79LeafDraw(G,G.L);w79LeafDraw(G,G.R);w79GateCol(G);}}}catch(e){}},500);
