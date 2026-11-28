/* ================= #379o W6: the Marsh place and its jar cellar (story plan 6.2: "The Marsh place, chapter 9: what is 'later' there;
   hide; secret cellar: the jar cellar (a jar for every year with your name; the Rinds); out by the coal hatch"). The abandoned cabin
   that is the same as yours can be gone into now (in the last days its door still opens on your own cabin, as before):
   - inside, the same room as yours, gone grey with dust: the bed, the stove, the table and its chairs, the clock, and the cellar hatch
     in the same place as yours. Under the bed there is room to hide;
   - under the hatch, the jar cellar: shelves of jars down every wall, one for every year, each labelled in Grandpa's hand with your
     name. A Rind lives down here, blind, as at Greyfield: it hunts by sound, the lantern turned on it drives it back, and hiding loses
     it; if it reaches you it shoves you back up the hatch. Out by the coal hatch into the yard beside the cabin.
   Anchors: room 'w79_marshin' (the Marsh place's own door), the hide under the bed (1.3, 3.15), the hatch "Go down" (1.2, 5.0);
   room 'w79_jars', the Look at the jars (4.0, 1.0), the coal hatch (7.3, 1.0). W79O.r is the cellar's Rind (mode 'drift' | 'hunt'). ================= */
const W79O={};
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  if(SPR.room_cabin&&SPR.room_cabin_cellar){
    ROOMS.w79_marshin={ox,oz:-60,name:'The Marsh place',shell:'room_cabin',out:{x:-20,z:44.8},furn:[
      ['in_bed',1.3,2.6,[-.85,-2.1,.85,0]],BF('in_shelf_books',3.2,.62,.4),BF('in_clock',4.3,.55,.3),BF('in_stove',7.9,.95,.5),BF('in_table',6.3,3.5,.45),
      BF('in_chairE',5.2,3.55,.25),['in_cellar',1.2,5.4,null,'flat'],BF('barrel',8.4,5.2,.3)]};ox+=40;
    ROOMS.w79_jars={ox,oz:-60,name:'The jar cellar',shell:'room_cabin_cellar',from:'w79_marshin',out:{x:0,z:0},furn:[
      BF('in_shelf_jars',1.0,.62,.4),BF('in_shelf_jars',2.6,.62,.4),BF('in_shelf_jars',4.2,.62,.4),BF('in_shelf_jars',5.8,.62,.4),BF('in_shelf_jars',7.2,.62,.4),
      BF('in_shelf_jars',.7,3.4,.4),BF('in_shelf_jars',7.4,3.6,.4),BF('ore_coal',7.4,1.7,.3)]};}}
// the Marsh place's door: into its own room now, except in the last days, when it still opens on your cabin
{const _bw=buildWorld;buildWorld=function(){const r=_bw.apply(this,arguments);try{const it=interact.find(i=>{try{return Math.abs(i.x+20)<.05&&Math.abs(i.z-44.4)<.05;}catch(e){return false;}});
  if(it&&ROOMS.w79_marshin){const a=it.act;it.label=()=>'Go in';it.act=function(){try{if(typeof stLast==='function'&&stLast()&&typeof stLeft==='function'&&stLeft()<=3)return a.apply(this,arguments);}catch(e){}enterRoom('w79_marshin');};}}catch(e){}return r;};}
if(ROOMS.w79_marshin){
  const s=W79H.hideSpot('w79_marshin',1.3,3.15,'Hide under the bed','You slide in under the bed. It is your bed. Somebody has slept in it.');s.view='planks';
  interact.push({get x(){return ROOMS.w79_marshin.ox+1.2;},get z(){return ROOMS.w79_marshin.oz+5.0;},r:.85,on:()=>S.room==='w79_marshin'&&!W79H.hid,label:()=>'Go down',ok:()=>true,act(){
    const J=ROOMS.w79_jars,M=ROOMS.w79_marshin;J.from='w79_marshin';J.out={x:M.ox+1.2,z:M.oz+4.6};SFX.thud&&SFX.thud(0,.3);enterRoom('w79_jars');}});
  interact.push({get x(){return ROOMS.w79_jars.ox+4.0;},get z(){return ROOMS.w79_jars.oz+1.1;},r:1.1,on:()=>S.room==='w79_jars',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('A jar for every year, back along every wall. Each is labelled in Grandpa’s hand with your name and a year. The oldest labels are brown as tea. In each, something small: a button, a ribbon, a curl of hair your colour. The newest jar has this year on it, and nothing in it yet.',6.4,true);w79Fear(5,'look');}});
  W79H.escape('w79_jars',7.3,1.0,'Climb out of the coal hatch',()=>({x:-15.6,z:44.3}),'You push the coal hatch up into the yard beside the Marsh place and lie in the weeds a while, breathing.');}
// the cellar's Rind (the same blind thing as Greyfield's, its own walk)
const W79O_PATH=[[2.0,1.6],[5.6,1.8],[4.0,3.0],[6.4,3.2],[1.8,2.8]];
{const _u=update;update=function(dt){_u(dt);try{const J=ROOMS.w79_jars;if(!J||!J.w||typeof w79gRindReg!=='function')return;
  if(!W79O.r){w79gRindReg();W79O.r={o:obj('w79_rind0',J.ox+2,J.oz+1.6,{kind:'prop',noCol:true,room:'w79_jars'}),i:0,t:0,mode:'drift',lx:P.x,lz:P.z};}
  const R=W79O.r,o=R.o;w79Rate('chase',2,S.room==='w79_jars'&&R.mode==='hunt'&&!W79H.hid&&Math.hypot(P.x-o.x,P.z-o.z)<6);
  if(S.room!=='w79_jars'||S.mode!=='play'||S.paused){R.lx=P.x;R.lz=P.z;return;}
  const sp=Math.hypot(P.x-R.lx,P.z-R.lz)/Math.max(.001,dt);R.lx=P.x;R.lz=P.z;const d=Math.hypot(P.x-o.x,P.z-o.z);
  const face=d>.01?((o.x-P.x)*(P.fx||0)+(o.z-P.z)*(P.fz||0))/d:0,lit=typeof lanternOn==='function'&&lanternOn()&&!W79H.hid&&d<2.4&&face>.7;
  const fr=typeof fearTier==='function'?(fearTier()>=3?1.25:1):1;
  if(!W79H.hid&&((sp>2.4&&d<6.5*fr)||(sp>.4&&d<2.2*fr))){if(R.mode!=='hunt'){R.mode='hunt';SFX.breath&&SFX.breath(0);}R.lost=0;}
  if(R.mode==='hunt'&&(W79H.hid||d>8)){R.lost=(R.lost||0)+dt;if(R.lost>1.6){R.mode='drift';R.lost=0;}}
  let tx,tz,v=.45;if(lit){tx=o.x+(o.x-P.x);tz=o.z+(o.z-P.z);v=1.3;}else if(R.mode==='hunt'){tx=P.x;tz=P.z;v=1.05;}else{const p=W79O_PATH[R.i];tx=J.ox+p[0];tz=J.oz+p[1];if(Math.hypot(tx-o.x,tz-o.z)<.15)R.i=(R.i+1)%W79O_PATH.length;}
  const dx=tx-o.x,dz=tz-o.z,L=Math.hypot(dx,dz);if(L>.02){const st=Math.min(L,v*dt);o.x=clamp(o.x+dx/L*st,J.ox+.5,J.ox+J.w-.5);o.z=clamp(o.z+dz/L*st,J.oz+.6,J.oz+J.d-.3);if(Math.abs(dx)>.05)o.flip=dx<0;}
  R.t+=dt*(v>.5?1.6:1);o.spr='w79_rind'+(Math.floor(R.t*2.2)%2);
  if(!W79H.hid&&!lit&&d<.55&&R.mode==='hunt'){R.mode='drift';R.i=0;o.x=J.ox+6.4;o.z=J.oz+3.2;w79Fear(10,'caught');SFX.stinger&&SFX.stinger();
    toast('Its hands find your face in the dark, cold as roots, and read it. Then it shoves you back up the steps, hard.',4,true);P.fz=1;setTimeout(()=>{if(S.room==='w79_jars')leaveRoom(true);},700);}}catch(e){}};}
// the other dark cellars balk you too when you are too frightened to go down without a light
try{for(const k of ['w79_jars','w79_race','w79_crypt9','w79_coldin'])W79H_DARK.add(k);}catch(e){}
