/* ================= #379 the world is what it says it is (owner, Nov 27: "Hollis garage doesn't match the door is to the side of the
   garage", "Gates for orphanage should be open or you have to open it you shouldn't just be walking through it").
   - Pruitt's garage: you go in through its big front door, up its steps. The way in used to be under the right-hand window, a wall
     with no door in it, while the door itself only offered a look at a map; the map is now taped up inside that window instead.
   - Greyfield's iron gates were drawn shut and you walked straight through them. They are now a gate you open: the leaves stand
     solid until you open them, then swing back into the yard on their hinges (the game's own door thud as the latch lifts and as each leaf meets its stop),
     and stay open (saved).
     The brick posts now stop you where they are drawn (their colliders only covered their outer halves). ================= */
const W79={};
function w79S(){if(!S.w79)S.w79={};const s=S.w79;s.gate=s.gate||{};return s;}
const w79Cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function w79Reg(id,c,ax,ay){const src='w79:'+id;IMG[src]=c;SPR['w79_'+id]={src,fw:c.width,fh:c.height,ax:Math.round(ax),ay:Math.round(ay),foot:[0,0,0,0]};return 'w79_'+id;}
// the game's own door sound (SFX.thud, as every door and hatch uses): the latch as it lifts, then the leaf against its stop
function w79Creak(g){g=g||1;try{SFX.thud&&SFX.thud(0,.2*g);}catch(e){}setTimeout(()=>{try{SFX.thud&&SFX.thud(0,.3*g);}catch(e){}},780);}

// ---------------------------------------------------------------- 1. Pruitt's garage: the way in is its big door
const W79_GARAGE={x:-36,z:-10.25,map:{x:-32.9,z:-10.15}};
function w79Garage(){if(W79.garage)return;if(typeof ROOMS==='undefined'||!ROOMS.garage||typeof interact==='undefined')return;
  let n=0;for(const it of interact){if(!it||typeof it.label!=='function')continue;let lb='';try{lb=it.label();}catch(e){}
    if(lb==='Enter'&&Math.abs(it.x+33.7)<.05&&Math.abs(it.z+10.25)<.05){it.x=W79_GARAGE.x;it.z=W79_GARAGE.z;it.r=1.05;n++;}}
  if(!n)return;ROOMS.garage.out={x:W79_GARAGE.x,z:-9.5};
  try{if(typeof HOMES!=='undefined'&&HOMES.pruitt&&HOMES.pruitt.door)HOMES.pruitt.door=[W79_GARAGE.x,W79_GARAGE.z];}catch(e){}
  // whoever works the garage stands on the forecourt by the pumps, not on the steps in front of the door
  try{if(typeof PL!=='undefined'&&PL.garage)PL.garage=[-33.3,-8.5,.8];}catch(e){}
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

/* ---------------------------------------------------------------- 3. the coffins are under the church (owner: "the coffins should be moved
   back into a cellar that you have to go into because that makes sense"). Fourteen coffins stood out on the grass beside the church
   while the prompt sent you to a cellar door and the close-up was a crypt. Now: a cellar door lies in front of the church under its
   last window (the town's own cellar door, the one at the Dunns', with a chain and a padlock through its handles). On the night the
   story sends you, the chain hangs loose and one leaf lies thrown back, its stone steps going down into the dark. "Go down" takes you
   into the room under the church, where the coffins stand in their rows against the back wall, and the close-up opens when you reach
   them, on that room's own flagstones and wall. Before that night the door is chained shut, and it says so. */
const W79_CRYPT={x:53.9,z:-27.4,gx:4.0,gz:1.05};
function w79Hatch(open){const k=open?'hatch_o':'hatch_c';if(W79[k])return W79[k];const m=SPR.cellardoor,im=m&&IMG[m.src];if(!im||(!(im instanceof HTMLCanvasElement)&&!(im.complete&&im.naturalWidth)))return null;
  const c=w79Cv(80,42),g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);const P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const WD=['#22180f','#36281a','#4c3a28','#634d36','#7a6146','#8f7556'],IR=['#25272f','#383a44','#50545f','#6f7480'],BR=['#4a3410','#7a5a20','#a8822e','#d0aa4c'];
  if(!open){   /* a chain through both handles, and a padlock hanging from it */
    for(let i=0,x=17;x<39;i++,x+=2){if(i%2===0){P(x,24,3,1,IR[3]);P(x,25,3,1,IR[0]);}else{P(x+1,23,1,3,IR[2]);P(x+1,26,1,1,IR[0]);}}
    P(26,26,1,3,IR[2]);P(29,26,1,3,IR[1]);P(27,25,2,1,IR[2]);   /* the shackle */
    P(25,28,6,5,BR[0]);P(26,29,4,3,BR[2]);P(26,29,2,1,BR[3]);P(29,30,1,2,BR[1]);P(27,30,1,1,BR[0]);   /* the lock's brass body, lit top-left, a keyhole */
  }else{
    /* the right leaf is gone from its frame: stone steps going down under the church, each tread darker than the one before */
    const ST=[[30,33,'#7c7a74','#929089'],[29,29,'#2a2a30'],[25,28,'#55544f','#66655f'],[24,24,'#1c1c22'],[20,23,'#36363a','#424246'],[19,19,'#121216'],[15,18,'#0a090c']];
    for(const [y0,y1,col,lit] of ST){P(29,y0,21,y1-y0+1,col);if(lit)P(29,y0,21,1,lit);}
    P(29,15,1,19,'#0e0c10');P(49,15,1,19,'#1a181c');P(29,15,21,2,'rgba(0,0,0,.55)');   /* the frame's shadow falls into the stairwell */
    for(const y of [31,26,21])P(31+((y*7)%5),y,3,1,'rgba(0,0,0,.25)');   /* worn hollows in the treads */
    /* the leaf thrown back flat on the ground beyond the frame, underside up: planks, two battens and a brace, the hinge straps at its hinge edge */
    const lx=51,ly=15,lw=21,lh=19;P(lx+1,ly+lh,lw,2,'rgba(8,6,8,.55)');
    for(let x=0;x<lw;x++)for(let y=0;y<lh;y++){const pl=Math.floor(x/5),seam=x%5===4;P(lx+x,ly+y,1,1,seam?WD[1]:pl%2?WD[3]:WD[4]);}
    for(const by of [3,13]){P(lx,ly+by,lw,1,WD[5]);P(lx,ly+by+1,lw,1,WD[3]);P(lx,ly+by+2,lw,1,WD[1]);}
    for(let i=0;i<9;i++){P(lx+3+i*2,ly+12-i,2,1,WD[4]);P(lx+3+i*2,ly+13-i,2,1,WD[1]);}
    for(const by of [4,14]){P(lx,ly+by,7,1,IR[3]);P(lx,ly+by+1,7,1,IR[0]);}
    P(lx-1,ly-1,lw+2,1,WD[0]);P(lx-1,ly+lh,lw+2,1,WD[0]);P(lx-1,ly,1,lh,WD[0]);P(lx+lw,ly,1,lh,WD[0]);P(lx,ly,lw,1,WD[5]);
    /* the chain hangs loose from the left handle down over the kerb; the padlock lies open in the grass */
    for(let i=0;i<7;i++){const x=24-i,y=26+i*2;if(i%2===0){P(x,y,2,1,IR[3]);P(x,y+1,2,1,IR[0]);}else P(x,y,1,2,IR[2]);}
    P(12,37,5,4,BR[0]);P(13,38,3,2,BR[2]);P(13,38,1,1,BR[3]);P(12,35,1,2,IR[2]);P(13,34,3,1,IR[2]);   /* lying on its side, the shackle sprung */
  }
  return W79[k]=w79Reg(k,c,28,36);}
function w79CryptB(){return typeof SAGA!=='undefined'&&SAGA.find(q=>q.id==='crypt');}
// open: the night the story sends you, ever after, or when someone has been taken down there
function w79CryptOpen(){const B=w79CryptB();if(!B)return false;try{if(sgDone('crypt'))return true;if(sgCurrent()===B&&(isNight()||S.hour>=19))return true;if(typeof dkTaken==='function'&&dkTaken())return true;}catch(e){}return false;}
function w79CryptBuild(){if(W79.crypt)return true;if(typeof ROOMS==='undefined'||!ROOMS.undercroft||!ROOMS.undercroft.w||!OBJ.some(o=>o.room==='undercroft'))return false;
  const C=W79_CRYPT,sc=w79Hatch(false),so=w79Hatch(true);if(!sc||!so)return false;const R=ROOMS.undercroft;
  C.o=obj(sc,C.x,C.z,{kind:'prop',noCol:true});addRect(C.x-.85,C.z-1.1,C.x+.85,C.z-.05);
  R.out={x:C.x,z:C.z+.7};
  interact.push({x:C.x,z:C.z+.45,r:1.25,on:()=>!S.room,label:()=>w79CryptOpen()?'Go down':'Cellar door',ok:()=>true,act(){
    if(!w79CryptOpen()){SFX.deny&&SFX.deny();toast('A chain through both handles and a padlock on it. Hale keeps the key.',3.4);return;}
    SFX.thud&&SFX.thud(0,.4);if(typeof dkTaken==='function'&&dkTaken()&&typeof mindHit==='function')mindHit(3);R.out={x:C.x,z:C.z+.7};enterRoom('undercroft');}});
  // the dark road's own way down (the night someone is taken) now starts at this door; its old "Go down" by the church corner is retired
  try{dkCrypt.p={x:C.x,z:C.z+.6};DK_TRAIL=null;}catch(e){}
  for(const it of interact){if(it===interact[interact.length-1]||!it.story||typeof it.label!=='function')continue;let lb='';try{lb=it.label();}catch(e){}if(lb==='Go down'&&Math.abs(it.x-C.x)<.2&&Math.abs(it.z-(C.z+.6))<.2)it.on=()=>false;}
  // in the room: the candles move out to the corners, so the rows of coffins have the back wall
  for(const [spr,nx,nz] of [['in_candles',1.15,.95],['in_votive',7.05,1.0]]){const o=OBJ.find(q=>q.room==='undercroft'&&(q.spr===spr||q.spr===spr+'_n'));if(!o)continue;const ox=o.x,oz=o.z,dx=R.ox+nx-ox,dz=R.oz+nz-oz;
    for(const q of rects)if(q.x0<ox&&q.x1>ox&&q.z1<=oz+.01&&q.z1>=oz-.01&&q.z0>oz-.5){q.x0+=dx;q.x1+=dx;q.z0+=dz;q.z1+=dz;}o.x+=dx;o.z+=dz;}
  CGRID.dirty=true;
  // the story: the beat is played in the room, not by the church wall; its arrow points at this door
  const B=w79CryptB();if(B){B.at=()=>({x:C.x,z:C.z+.6});
    B.goal='There’s a cellar door in front of the church, under its last window, that Hale keeps chained. Tonight it isn’t.';
    if(typeof B.lore==='string')B.lore=B.lore.replace('a hundred and fifty small empty coffins','rows of small empty coffins');
    if(typeof B.text==='string')B.text=B.text.replace('Small ones, in rows, a hundred and fifty of them, lids off, every one empty.','Small ones, standing in rows against the wall, some with their lids off, every one empty.');}
  try{if(PG.ics)PG.ics.built=0;if(PG.objs)PG.objs.built=0;}catch(e){}
  W79.crypt=1;return true;}
// the coffins the story leaves: in the room under the church, standing against its back wall
function w79CryptProps(){const os=SGW.objs&&SGW.objs.crypt;if(!os||!os.length)return;const R=ROOMS.undercroft;
  for(const o of os){if(o._w79)continue;o.x=R.ox+W79_CRYPT.gx;o.z=R.oz+W79_CRYPT.gz;o.room='undercroft';o._w79=1;addRect(R.ox+2.25,R.oz+.05,R.ox+5.3,R.oz+W79_CRYPT.gz);}}
{const _sp=sgProps;sgProps=function(){const r=_sp.apply(this,arguments);try{if(W79.crypt)w79CryptProps();}catch(e){}return r;};}
// the beat plays down there, when you reach the coffins
{const _p=sgPlay;sgPlay=function(b){if(b&&b.id==='crypt'&&W79.crypt&&S.room!=='undercroft')return;return _p.apply(this,arguments);};}
setInterval(()=>{try{if(!W79.crypt||S.room!=='undercroft'||S.mode!=='play'||S.paused)return;const B=w79CryptB();if(!B||S.saga.done.crypt||sgCurrent()!==B)return;
  const R=ROOMS.undercroft;if(Math.hypot(P.x-(R.ox+W79_CRYPT.gx),P.z-(R.oz+W79_CRYPT.gz+.4))<2.3){sgProps();w79CryptProps();sgPlay(B);}}catch(e){}},250);
// the hatch shows its state
setInterval(()=>{try{if(!W79.crypt)return;const C=W79_CRYPT,s=w79CryptOpen()?W79.hatch_o:W79.hatch_c;if(C.o.spr!==s)C.o.spr=s;}catch(e){}},500);
// the close-up stands on the room's own floor and wall (it drew the grass outside the church)
function w79RoomBack(cut,gx,gz,S_,ax,ay){const m=SPR.room_undercroft,im=m&&IMG[m.src];if(!im)return null;const W=cut.width,H=cut.height;
  const src=w79Cv(m.fw,m.fh),sg=src.getContext('2d');sg.drawImage(im,0,0);const sd=sg.getImageData(0,0,m.fw,m.fh).data;
  const c=w79Cv(W,H),g=c.getContext('2d'),id=g.createImageData(W,H),d=id.data;const x0=m.side+gx*PPM,y0=m.top+gz*PPM;
  for(let v=0;v<H;v++)for(let u=0;u<W;u++){const X=Math.max(0,Math.min(m.fw-1,Math.floor(x0+(u-ax)/S_))),Y=Math.max(0,Math.min(m.fh-1,Math.floor(y0+(v-ay)/S_))),i=(Y*m.fw+X)*4,j=(v*W+u)*4;
    d[j]=sd[i];d[j+1]=sd[i+1];d[j+2]=sd[i+2];d[j+3]=255;}
  g.putImageData(id,0,0);g.drawImage(cut,0,0);return c;}
{const _a=SGT_ART.crypt;SGT_ART.crypt=function(){try{const o=s98Beat('crypt');if(o&&o.room==='undercroft'&&typeof s98CoffinCanvas==='function'){const k='w79crypt';if(SGT[k])return SGT[k];const d=S98_CRYPT;
    const im=w79RoomBack(s98CoffinCanvas(false),W79_CRYPT.gx,W79_CRYPT.gz,d.S,d.ax,d.ay);if(im)return SGT[k]=im;}}catch(e){}return _a.apply(this,arguments);};}
setInterval(()=>{try{if(typeof OBJ==='undefined'||!OBJ.length)return;w79CryptBuild();}catch(e){}},500);

/* ---------------------------------------------------------------- 4. the shape in the stone stands in the quarry. The prompt sent you to the
   quarry and the close-up was a cut face of stone with a hollow the shape of a person in it, but where you stood there was only flat
   quarry floor and two loose rocks. A block of cut stone now stands at the end of the quarry road, its face the close-up's own stones
   and hollow brought down to the world's size (each world pixel the colour covering most of it), a lit top with the feather-and-wedge
   marks the men left, broken stone at its foot. You can't walk through it. */
const W79_Q={x:146,z:-28.7,S:1.5};
function w79QuarryBuild(){if(W79.quarry)return true;if(typeof s98Shrink!=='function'||!SGT_DRAW.quarry)return false;let img=null;try{img=SGT_DRAW.quarry();}catch(e){}if(!img)return false;
  const sm=s98Shrink(img,W79_Q.S,{}),W=sm.width,T=15,F=5,H=T+sm.height+F,c=w79Cv(W+2,H),g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const h=(a,b)=>(((a*73856093)^(b*19349663))>>>0)%97,ST=['#2a2a30','#4a4a52','#5e5e68','#74747e','#8a8a94','#a2a2ab'];
  // the top: the bed the stone was split from, lit from above; its back edge broken, two shallow steps where blocks came away
  for(let x=0;x<W;x++){const back=2+h(x>>2,3)%3,step=x>W*.62?3:0;for(let y=back+step;y<T;y++){const near=y>T-4;P(x+1,y,1,1,near?ST[4]:(h(x>>3,y>>2)%5===0?ST[3]:ST[4]));}
    P(x+1,back+step,1,1,ST[1]);if(x>0&&(h(x-1>>2,3)%3)!==(h(x>>2,3)%3))P(x+1,back+step+1,1,1,ST[2]);}
  for(let x=Math.round(W*.62);x<W;x++)P(x+1,T-12,1,1,ST[5]);
  P(1,T-1,W,1,ST[5]);   /* the lit lip */
  for(const fx of [9,17,26,71,80,93,104])if(fx<W-2){P(fx+1,T-4,1,3,ST[1]);P(fx+2,T-4,1,3,ST[5]);}   /* drill marks along the lip, each with its lit far wall */
  g.drawImage(sm,1,T);
  // its foot: broken stone and a contact shadow
  P(0,T+sm.height,W+2,2,'rgba(50,33,37,.6)');P(2,T+sm.height+2,W-2,1,'rgba(50,33,37,.35)');
  for(const [x,w,hh] of [[3,6,3],[14,4,2],[W-20,7,3],[W-9,5,2],[Math.round(W*.42),3,2]]){const y=T+sm.height-hh+1;P(x,y,w,hh,ST[2]);P(x,y,w,1,ST[4]);P(x,y,1,hh,ST[3]);P(x+w-1,y+1,1,hh-1,ST[1]);P(x,y+hh,w,1,'rgba(50,33,37,.6)');}
  const sp=w79Reg('quarryface',c,(W+2)/2,T+sm.height);
  W79.qo=obj(sp,W79_Q.x,W79_Q.z,{kind:'prop',noCol:true});const hw=(W/2)/PPM;addRect(W79_Q.x-hw,W79_Q.z-T/PPM*1.3,W79_Q.x+hw,W79_Q.z-.04);
  // the loose quarry rocks never stand inside it
  for(const o of OBJ){if(o===W79.qo||o.room||o.hide)continue;if(Math.abs(o.x-W79_Q.x)<hw+1.1&&o.z>W79_Q.z-2.2&&o.z<W79_Q.z+.9&&/^(rock_|ore_)/.test(o.spr))o.hide=true;}
  W79.quarry=1;return true;}

/* ---------------------------------------------------------------- 5. the county line: the close-up shows, across the road from the county
   sign, your own farm sign and mailbox at the mouth of a gravel lane printed with your boot prints going out and coming back. Now the
   world shows them there too, from the day the story sends you to the line. */
const W79_CL={x:-289.2,z:-3.05};
function w79Lane(){if(W79.lane)return W79.lane;const Wd=46,Hd=150,c=w79Cv(Wd,Hd),g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const h=(a,b)=>(((a*73856093)^(b*19349663))>>>0)%97,GR=['#6a665e','#807b72','#96918a','#aaa59c'];
  for(let y=0;y<Hd;y++){const wob=Math.round(Math.sin(y*.09)*2+Math.sin(y*.031+1)*2),l=6+wob+(h(y>>2,1)%3===0?1:0),r=Wd-6+wob-(h(y>>2,2)%3===0?1:0);
    P(l,y,r-l,1,GR[1]);P(l,y,1,1,'#4c4a40');P(r-1,y,1,1,'#4c4a40');}
  // the gravel in small stones lit on top (a light pebble over its own dark underside), sparse, never a speckle
  for(let cy=1;cy<Hd-2;cy+=3)for(let cx=8;cx<Wd-9;cx+=4){const k=h(cx+3,cy+7)%10;if(k>3)continue;const x=cx+(h(cx,cy)%3),y=cy;P(x,y,2,1,k<2?GR[3]:GR[2]);P(x,y+1,2,1,GR[0]);}
  // boot prints, a sole and a heel each, going out on the left and coming back on the right
  const boot=(x,y,up)=>{const so=up?0:4,he=up?5:0;P(x,y+so,4,3,'#46423a');P(x+1,y+so,2,1,'#3a362f');P(x,y+he,4,2,'#46423a');};
  for(let y=6,i=0;y<Hd-12;y+=14,i++){boot(13+(i%2)*6,y,true);boot(27+(i%2)*6,y+7,false);}
  for(let y=0;y<6;y++)P(0,y,Wd,1,`rgba(42,40,36,${.1*(6-y)})`);
  return W79.lane=w79Reg('lane',c,Wd/2,0);}
function w79CountyShow(){try{const B=typeof SAGA!=='undefined'&&SAGA.find(q=>q.id==='county');return !!B&&(sgDone('county')||sgCurrent()===B);}catch(e){return false;}}
function w79CountyBuild(){if(W79.county)return true;if(!SPR.signpost||!SPR.mailbox)return false;const L=w79Lane(),X=W79_CL.x,Z=W79_CL.z;
  W79.cty=[obj(L,X,Z,{kind:'flat',noCol:true}),obj('signpost',X-1.35,Z+1.15,{label:'HOLLOW ACRE'}),obj('mailbox',X+1.3,Z+1.2)];
  W79.ctyCol=[];W79.county=1;return true;}
setInterval(()=>{try{if(!W79.county)return;const on=w79CountyShow();for(const o of W79.cty)o.hide=!on;
  if(on&&!W79.ctyCol.length){addCircle(W79_CL.x-1.35,W79_CL.z+1.05,.2);W79.ctyCol.push(circles[circles.length-1]);addCircle(W79_CL.x+1.3,W79_CL.z+1.1,.15);W79.ctyCol.push(circles[circles.length-1]);}
  if(!on&&W79.ctyCol.length){for(const q of W79.ctyCol){const i=circles.indexOf(q);if(i>=0)circles.splice(i,1);}W79.ctyCol=[];}}catch(e){}},700);
setInterval(()=>{try{if(typeof OBJ==='undefined'||!OBJ.length)return;if(!W79.quarry)w79QuarryBuild();if(!W79.county)w79CountyBuild();}catch(e){}},600);
