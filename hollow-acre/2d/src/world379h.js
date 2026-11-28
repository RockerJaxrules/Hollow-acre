/* ================= #379h W6, part two: Greyfield's matron's office and boiler cellar (story plan 6.2: "the boiler cellar, where the
   roots come through the wall (the Rinds). No gore here at any level"; out "up the coal chute").
   - The dormitory's back wall has a door to the matron's office: a roll-top desk with the intake book on it (the story's Look),
     filing cabinets you can hide behind, her clock, archive boxes, and a hatch in the floor.
   - The hatch goes down to the boiler cellar: the cold boiler and its tank, coal heaped in the corner, and pale roots grown in
     through the wall. Something lives down here: a Rind, the Hollow's root grown into the shape of a man in a work shirt. It is
     blind. It drifts along the walls; it hunts by sound: run, or walk close to it, and it turns and comes for you. Hide behind
     the boiler and it loses you; hold your lit lantern on it and it shrinks back from the light. If it reaches you it shoves you
     back up through the hatch (your heart, not your body: no wounds, no blood, here at any level).
   - The way out is the coal chute, up into the yard beside the house.
   Anchors for the story: 'w79_matron' (from the dorm's back wall), its Look at the desk (4.0, 2.55);
   W79H.threat('w79_matron', {...}) once after the book; 'w79_boiler' (from the hatch), the chute escape. ================= */
const W79G={};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  if(ROOMS.rg_dorm&&SPR.room_rg_office&&SPR.room_cellar_dunn){
    ROOMS.w79_matron={ox,oz:-60,name:'The matron’s office',shell:'room_rg_office',from:'rg_dorm',out:{x:0,z:0},furn:[
      BF('in_desk_roll',4.0,1.95,.5),BF('in_chair',4.0,1.25,.25),BF('in_filecab',.75,.95,.4),BF('in_filecab',1.45,.95,.4),BF('in_archboxes',6.9,.95,.4),
      BF('in_clock',7.45,.55,.3),['in_rugrect',4.0,4.3,null,'flat'],['in_trapdoor',1.4,4.6,null,'flat']]};
    ox+=40;
    ROOMS.w79_boiler={ox,oz:-60,name:'The boiler room',shell:'room_cellar_dunn',from:'w79_matron',out:{x:0,z:0},furn:[
      BF('furnace',6.3,1.15,.55),BF('in_drum',4.6,1.0,.3),BF('in_drum',5.15,1.15,.3),['w79_roots',2.0,-.3,null,'flat'],['w79_roots',5.5,-.35,null,'flat'],['w79_roots',7.5,-.25,null,'flat'],
      BF('ore_coal',.9,4.1,.3),BF('ore_coal',1.6,4.5,.3),BF('ore_coal',.8,3.3,.3)]};}}
// the roots through the wall: the wall ivy's own shapes, its greens turned to the pale of the Hollow's root (bone, rind, a dark seam)
function w79gRoots(){if(SPR.w79_roots||!SPR.vines)return;const m=SPR.vines,im=IMG[m.src];if(!im||!(im.complete&&im.naturalWidth))return;const c=document.createElement('canvas');c.width=m.fw;c.height=m.fh;
  const g=c.getContext('2d');g.drawImage(im,0,0,m.fw,m.fh,0,0,m.fw,m.fh);const id=g.getImageData(0,0,m.fw,m.fh),d=id.data,R=[[58,50,40],[110,100,80],[160,150,124],[204,194,166],[226,218,194]];
  for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const L=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;const k=Math.max(0,Math.min(4,Math.floor(L*6)));d[i]=R[k][0];d[i+1]=R[k][1];d[i+2]=R[k][2];}
  g.putImageData(id,0,0);const src='w79g:roots';IMG[src]=c;SPR.w79_roots=Object.assign({},m,{src});}
{const _bi0=buildInteriors;buildInteriors=function(){try{w79gRoots();if(!SPR.w79_roots&&SPR.vines)SPR.w79_roots=Object.assign({},SPR.vines);}catch(e){}return _bi0.apply(this,arguments);};}
setInterval(()=>{try{if(SPR.w79_roots&&!SPR.w79_roots.src.startsWith('w79g')){delete SPR.w79_roots;w79gRoots();}}catch(e){}},1500);
// the door in the dormitory's back wall, and the ways between the rooms
{const _bi=buildInteriors;buildInteriors=function(){_bi.apply(this,arguments);try{const D=ROOMS.rg_dorm;if(D&&ROOMS.w79_matron&&SPR.in_partition_door&&!W79G.door)W79G.door=obj('in_partition_door',D.ox+11.55,D.oz-.25,{kind:'flat',room:'rg_dorm'});}catch(e){}};}
if(ROOMS.w79_matron){
  interact.push({get x(){return ROOMS.rg_dorm.ox+12.58;},get z(){return ROOMS.rg_dorm.oz+.55;},r:.95,on:()=>S.room==='rg_dorm',label:()=>'The matron’s office',ok:()=>true,act(){
    const M=ROOMS.w79_matron,D=ROOMS.rg_dorm;M.from='rg_dorm';M.out={x:D.ox+12.58,z:D.oz+1.15};enterRoom('w79_matron');}});
  interact.push({get x(){return ROOMS.w79_matron.ox+1.4;},get z(){return ROOMS.w79_matron.oz+4.4;},r:.85,on:()=>S.room==='w79_matron'&&!W79H.hid,label:()=>'Go down',ok:()=>true,act(){
    const B=ROOMS.w79_boiler,M=ROOMS.w79_matron;B.from='w79_matron';B.out={x:M.ox+1.4,z:M.oz+3.9};SFX.thud&&SFX.thud(0,.3);enterRoom('w79_boiler');}});
  W79H.hideSpot('w79_matron',1.1,1.75,'Hide behind the cabinets','You fold yourself in behind the filing cabinets, where the matron kept the door you came in by in sight.');
  W79H.hideSpot('w79_boiler',7.35,1.9,'Hide behind the boiler','You press in behind the boiler. Its iron is warm and smells of old smoke and wet roots.');
  W79H.escape('w79_boiler',.75,1.2,'Climb the coal chute',()=>({x:RGP.home.x+7.4,z:RGP.home.z+1.0}),'You come up through the coal hatch at the side of the house, black to the elbows, and shut it on whatever is listening.');
  interact.push({get x(){return ROOMS.w79_boiler.ox+5.5;},get z(){return ROOMS.w79_boiler.oz+.6;},r:1,on:()=>S.room==='w79_boiler'&&!W79H.hid,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('Roots have come in through the bricks, pale and as thick as an arm, and spread along the wall like hands feeling for something. They are warm. One has grown round the boiler’s gauge, as if it wanted to know the heat.',5.5,true);}});}
// ---- the Rind: drawn by hand in code, two steps of a walk; pale rind skin, dark vine sinews round its limbs, a grown man's torn work
// shirt and the strap of his overalls, and no face, only a seam where the root closed over it
function w79gRindArt(f){const W=24,H=48,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d'),P=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w||1,h||1);};
  const SK=['#1a1410','#6e6650','#9a917a','#beb59c','#d8d0b8'],VN=['#1e2614','#34421f','#4c5c2c'],SH=['#2c2a2e','#4a4a54','#62626e'],OV='#34485a';
  const leg=(x,lift)=>{P(x,34-lift,4,13+lift,SK[2]);P(x,34-lift,1,13+lift,SK[3]);P(x+3,34-lift,1,13+lift,SK[1]);P(x,46,4,1,SK[0]);for(let y=36-lift;y<46;y+=4)P(x,y,4,1,VN[1]);};
  P(5,46,14,2,'rgba(50,33,37,.55)');
  leg(7,f?2:0);leg(13,f?0:2);
  P(6,18,12,17,SH[1]);P(6,18,3,17,SH[2]);P(15,18,3,17,SH[0]);P(8,22,1,9,SH[0]);P(12,26,4,1,SH[0]);P(10,33,5,2,SK[2]);   /* the torn work shirt, a hole showing rind */
  P(8,17,2,15,OV);P(14,17,2,15,OV);P(8,30,8,5,OV);   /* the overalls' straps and bib */
  for(const [ax,dir] of [[3,-1],[19,1]]){const sw=f?dir:-dir;for(let y=0;y<17;y++){const x=ax+Math.round(y*.06*sw);P(x,19+y,3,1,y%5===2?VN[1]:SK[2]);P(x,19+y,1,1,SK[3]);}P(ax-1+(sw>0?1:0),36,4,3,SK[2]);P(ax-1,38,1,2,SK[1]);P(ax+2,38,1,3,SK[1]);}   /* long arms, wrapped in vine, the fingers trailing */
  P(9,6,7,11,SK[3]);P(9,6,2,11,SK[4]);P(15,6,1,11,SK[1]);P(10,5,5,1,SK[3]);P(12,8,1,7,SK[1]);P(11,10,1,2,SK[1]);P(13,12,1,2,SK[1]);   /* the head: smooth rind, a closed seam where a face was */
  P(10,15,5,3,SK[2]);for(const [x,y] of [[8,9],[16,11],[9,14]])P(x,y,1,3,VN[0]);
  // one outline, a step darker than what it borders
  const id=g.getImageData(0,0,W,H),d=id.data,O=new Uint8Array(W*H);for(let i=0;i<W*H;i++)O[i]=d[i*4+3]>200?1:0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(O[y*W+x])continue;if((x>0&&O[y*W+x-1])||(x<W-1&&O[y*W+x+1])||(y>0&&O[(y-1)*W+x])||(y<H-1&&O[(y+1)*W+x]))if(y<46)P(x,y,1,1,SK[0]);}
  return c;}
function w79gRindReg(){for(const f of [0,1]){const k='w79_rind'+f;if(SPR[k])continue;const c=w79gRindArt(f),src='w79g:rind'+f;IMG[src]=c;SPR[k]={src,fw:c.width,fh:c.height,ax:12,ay:46,foot:[0,0,0,0]};}}
const W79G_PATH=[[2.2,1.4],[5.2,1.7],[3.6,2.6],[6.6,2.9],[1.6,2.2]];
function w79gRind(dt){const B=ROOMS.w79_boiler;if(!B||!B.w)return;
  if(!W79G.r){w79gRindReg();W79G.r={o:obj('w79_rind0',B.ox+2.2,B.oz+1.4,{kind:'prop',noCol:true,room:'w79_boiler'}),i:0,t:0,mode:'drift',lx:P.x,lz:P.z,pk:0};}
  const R=W79G.r,o=R.o;if(S.room!=='w79_boiler'||S.mode!=='play'||S.paused){R.lx=P.x;R.lz=P.z;return;}
  const sp=Math.hypot(P.x-R.lx,P.z-R.lz)/Math.max(.001,dt);R.lx=P.x;R.lz=P.z;const d=Math.hypot(P.x-o.x,P.z-o.z);
  const face=d>.01?((o.x-P.x)*(P.fx||0)+(o.z-P.z)*(P.fz||0))/d:0,lit=typeof lanternOn==='function'&&lanternOn()&&!W79H.hid&&d<2.4&&face>.7;   /* your lantern turned on it */
  // it hears you: running anywhere near, or walking right by it; hidden, you are silent
  if(!W79H.hid&&((sp>2.4&&d<6.5)||(sp>.4&&d<2.2))){if(R.mode!=='hunt'){R.mode='hunt';SFX.breath&&SFX.breath(0);}R.lost=0;}
  if(R.mode==='hunt'&&(W79H.hid||d>8)){R.lost=(R.lost||0)+dt;if(R.lost>1.6){R.mode='drift';R.lost=0;}}
  let tx,tz,v=.45;if(lit){tx=o.x+(o.x-P.x);tz=o.z+(o.z-P.z);v=1.3;}else if(R.mode==='hunt'){tx=P.x;tz=P.z;v=1.05;}else{const p=W79G_PATH[R.i];tx=B.ox+p[0];tz=B.oz+p[1];if(Math.hypot(tx-o.x,tz-o.z)<.15)R.i=(R.i+1)%W79G_PATH.length;}
  const dx=tx-o.x,dz=tz-o.z,L=Math.hypot(dx,dz);if(L>.02){const st=Math.min(L,v*dt);o.x=clamp(o.x+dx/L*st,B.ox+.5,B.ox+B.w-.5);o.z=clamp(o.z+dz/L*st,B.oz+.6,B.oz+B.d-.3);if(Math.abs(dx)>.05)o.flip=dx<0;}
  R.t+=dt*(v>.5?1.6:1);const f=Math.floor(R.t*2.2)%2;o.spr='w79_rind'+f;
  // it reaches you: shoved back up the hatch, heart going (no wounds here)
  if(!W79H.hid&&!lit&&d<.55&&R.mode==='hunt'){R.mode='drift';R.i=0;o.x=B.ox+6.6;o.z=B.oz+2.9;if(typeof mindHit==='function')mindHit(10);SFX.stinger&&SFX.stinger();
    toast('Its hands find your face, cold as roots, and read it. Then it shoves you, hard, back up through the hatch.',4,true);P.fz=1;setTimeout(()=>{if(S.room==='w79_boiler')leaveRoom(true);},700);}}
{const _u=update;update=function(dt){_u(dt);try{w79gRind(dt);}catch(e){}};}
// the town's first-visit line ("Marrow Hollow. Every curtain moves as you pass.") is said when you first stand east of the farm; every
// room's pocket of the world lies far east, so it was said the first time you went indoors anywhere (over Room 6's hiding view, for
// one). It now waits until you are outside again.
{const _er=enterRoom;enterRoom=function(k){if(!S.visitedTown){S.visitedTown=true;W79G.vt=1;}return _er.apply(this,arguments);};}
{const _u=update;update=function(dt){_u(dt);if(W79G.vt&&!S.room&&S.mode==='play'){S.visitedTown=false;W79G.vt=0;}};}
