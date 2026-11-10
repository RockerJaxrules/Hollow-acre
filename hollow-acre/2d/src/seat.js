/* ================= sitting (owner: "add the ability to sit on everything that is meant to be sit on"). Chairs, rocking chairs,
   stools, pews, park benches and the swings: walk up to one and press the act key (or tap it) to sit down; move to get up.
   Each seat knows which way you face in it, the spots along it you can sit in, and how high its seat is.
   f: the way you face ('*' = whichever way you were facing). at: spots along it, in units from its middle.
   lift: px your body rises off the floor (a high stool, a swing). dz: how far behind the sprite's foot you sit when its back faces
   the camera (you sit behind the back you can see, and it hides your legs). ================= */
const SEATS={
  in_chair:{f:'S',lift:1},in_chairE:{f:'E',dx:.04},in_chairN:{f:'N',dz:.2},
  in_rockS:{f:'S',lift:2},in_rocker:{f:'S',lift:2},in_rockE:{f:'E',dx:.1,lift:2},in_rockN:{f:'N',dz:.2,lift:8},
  in_stool:{f:'*',lift:8},
  in_pew:{f:'S',at:[-1.5,-.75,0,.75,1.5],lift:2},in_pew_bk:{f:'N',at:[-1.5,-.75,0,.75,1.5],dz:.24},in_pewv_bk:{f:'N',at:[-1.5,-.75,0,.75,1.5],dz:.24},in_pews_bk:{f:'N',at:[-.7,0,.7],dz:.24},in_pewsb_bk:{f:'N',at:[-.7,0,.7],dz:.24},in_pewss_bk:{f:'N',at:[-.45,.45],dz:.24},in_chbench:{f:'N',at:[-.7,0,.7],dz:-.06,lift:3},in_chbench_b:{f:'N',at:[-.7,.7],dz:-.06,lift:3},in_chbench_s:{f:'N',at:[-.45,.45],dz:-.06,lift:3},in_pewb_bk:{f:'N',at:[-1.5,-.75,0,.75,1.5],dz:.24},
  parkbench:{f:'S',at:[-.42,.42],lift:1},
  rg_swing:{f:'S',at:[-.36,.78],lift:9}};
const SEAT_DIR={S:[0,1],N:[0,-1],E:[1,0],W:[-1,0]};
function seatFace(o,d,dir){let f=d.f==='*'?(dir||'S'):d.f;if(o.flip&&(f==='E'||f==='W'))f=f==='E'?'W':'E';return f;}
function seatAt(o,d,i){const a=d.at?d.at[i]:0;return o.x+(o.flip?-a:a);}
// where your feet go, sitting in it
function seatSpot(o,d,i,face){let x=seatAt(o,d,i);if(face==='E')x+=d.dx||0;if(face==='W')x-=d.dx||0;
  return {x,z:face==='N'?o.z-(d.dz||.22):o.z+.03};}
// someone already in it: you, or a townsperson sitting there
function seatTaken(o,i){if(P.sit&&P.sit.o===o&&P.sit.i===i)return true;for(const n of npcs)if(n.vis&&n._seat&&n._seat.o===o&&n._seat.i===i)return true;return false;}
function sitDown(o,i){const d=SEATS[o.spr];if(!d||P.sit)return;const face=seatFace(o,d,P.dir);const p=seatSpot(o,d,i,face);
  P.sit={o,i,face,x:p.x,z:p.z,lift:d.lift||0,from:{x:P.x,z:P.z},room:S.room,t:0};P.walkTo=null;P.anim=null;
  P.x=p.x;P.z=p.z;P.dir=face;P.fx=SEAT_DIR[face][0];P.fz=SEAT_DIR[face][1];P.t=0;SFX.thud&&SFX.thud(0,.1);
  if(!S.sitHint){S.sitHint=1;toast(fineP()?'You sit down. Move to get up again.':'You sit down. Move the stick to get up again.',2.4);}
  seatMoment(o);}
function standUp(){const s=P.sit;if(!s)return;P.sit=null;P.x=s.from.x;P.z=s.from.z;}
// a pew at night: something sits down beside you
function seatMoment(o){if(!/^in_pew/.test(o.spr)||!isNight()||rand()<.4)return;const s=P.sit;
  setTimeout(()=>{if(P.sit!==s)return;SFX.thud&&SFX.thud(0,.18);toast('The pew creaks beside you, the way it does when someone sits down.',3,true);typeof mindHit==='function'&&mindHit(2);},2600+rand()*2400);}
// one "Sit" for every spot on every seat in the world, kept in step with the furniture as it is built, moved and taken away
const SEAT_ENT=new Map();
function seatEntry(o,i){const d=SEATS[o.spr];const it={seat:true,o,i,r:.5,
    on:()=>!P.sit&&!o.hide&&!(typeof PLACE!=='undefined'&&PLACE.on)&&!seatTaken(o,i),
    label:()=>'Sit',ok:()=>true,act(){sitDown(o,i);}};
  Object.defineProperties(it,{x:{get(){return seatAt(o,d,i);},enumerable:true},z:{get(){return o.z-(seatFace(o,d)==='N'?.3:.12);},enumerable:true}});return it;}
function seatDrop(o){const e=SEAT_ENT.get(o);SEAT_ENT.delete(o);if(!e)return;for(const it of e){const k=interact.indexOf(it);if(k>=0)interact.splice(k,1);}}
function seatSync(){const live=new Set();
  for(const o of OBJ){const d=SEATS[o.spr];if(!d||o.hide)continue;live.add(o);const e=SEAT_ENT.get(o);if(e&&e.spr===o.spr)continue;if(e)seatDrop(o);
    const ents=(d.at||[0]).map((a,i)=>seatEntry(o,i));ents.spr=o.spr;SEAT_ENT.set(o,ents);interact.push(...ents);}
  for(const o of [...SEAT_ENT.keys()])if(!live.has(o))seatDrop(o);}
// sitting holds you in the seat, facing its way, until you move (or something makes you jump up)
{let syncT=0;const _u=update;update=function(dt){
  const s=P.sit;if(s){let mx=joy.x||0,mz=joy.y||0;if(keys.KeyW||keys.ArrowUp||keys.KeyS||keys.ArrowDown||keys.KeyA||keys.ArrowLeft||keys.KeyD||keys.ArrowRight)mx=1;
    if(Math.hypot(mx,mz)>.15||P.anim||P.walkTo||S.room!==s.room||S.mode==='scare'||s.o.hide||!SEAT_ENT.has(s.o))standUp();}
  _u(dt);
  const t=P.sit;if(t){P.x=t.x;P.z=t.z;P.dir=t.face;P.fx=SEAT_DIR[t.face][0];P.fz=SEAT_DIR[t.face][1];P.clip='sit';t.t+=dt;
    if(S.mode==='play'&&typeof tierOf==='function'&&tierOf(M.v)<3)M.v=Math.min(100,M.v+dt*.1);}   // sitting a while steadies you, a little
  syncT-=dt;if(syncT<=0){syncT=.5;seatSync();npcSeats();}};}
// drawn on the seat: raised by the seat's height, no shadow at the feet (the seat's own shadow is under you)
{const _al=actLean;actLean=function(){const s=P.sit;return s?[0,-s.lift]:_al();};}
{const _fs=footShadow;footShadow=function(fr,X,Y){if(P.sit&&fr===P._fr)return;return _fs(fr,X,Y);};}
// sitting, the act button gets you up when there is nothing else to do
{const _cc=computeContext;computeContext=function(){const r=_cc();if(!P.sit)return r;if(hlTile||!r||!r.label){hlTile=null;return {label:'Stand up',ok:true,act:standUp};}return r;};}
// townspeople sit too: anyone who has stood still for a moment beside a free seat sits in it, and gets up when they walk off
function npcSeats(){for(const n of npcs){
  if(!n.vis){n._seat=null;n._still=0;continue;}
  const lp=n._lp,still=lp&&Math.abs(lp[0]-n.x)<.02&&Math.abs(lp[1]-n.z)<.02;n._lp=[n.x,n.z];
  if(n._seat){const s=n._seat;if(!still||n.clip==='walk'||n.clip==='stand'||s.o.hide||!SEAT_ENT.has(s.o))n._seat=null;continue;}
  n._still=still&&n.clip!=='walk'&&n.clip!=='stand'?(n._still||0)+.5:0;if(n._still<1.5)continue;
  let best=null,bd=.95;for(const [o,ents] of SEAT_ENT){if(Math.abs(o.x-n.x)>3||Math.abs(o.z-n.z)>2)continue;
    for(const it of ents){const d=Math.hypot(it.x-n.x,it.z+.12-n.z);if(d<bd&&!seatTaken(o,it.i)&&Math.hypot(it.x-P.x,it.z-P.z)>.5){bd=d;best=it;}}}
  if(!best)continue;const o=best.o,d=SEATS[o.spr],face=seatFace(o,d,n.dir||'S'),p=seatSpot(o,d,best.i,face);
  n._seat={o,i:best.i,face,x:p.x,z:p.z,lift:d.lift||0};}}
