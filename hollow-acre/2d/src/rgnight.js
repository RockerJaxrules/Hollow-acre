/* ================= after dark, each new place does something only it does. Some of it is always there at night (Room 6's
   doorway, the hearths of Old Marrow glowing, a light up in the lookout); once a night, each place does one thing to you:
     Route 9 West   someone stands in the doorway of Room 6; when you get close the door is shut, and something knocks three times
     Greyfield      a child in a nightdress among the numbered crosses; gone when you get there, two small bare footprints
     The Fen        a hand comes up out of the black water beside you, opens, and goes back down
     The Deep Corn  the scarecrow from the middle of the maze is standing in the row behind you
     The Drowned Village  heads come up out of the reservoir, all facing your farm, and go under as you come near
     Pine Ridge     a light in the lookout cab, and something walking round and round up there
     Old Marrow     every hearth glowing, as if the fires were lit again; no heat
     The Weeping Birches  a doll drops at your feet
   ================= */
S.rgNight=S.rgNight||{};
const RGN_EV={x:0,z:0,k:null,t:0,dur:0};
const rgnNight=()=>isNight()&&!S.room&&S.mode==='play';
function rgnOnce(k,text,hit){if(S.rgNight[k]===S.day)return false;S.rgNight[k]=S.day;S.rgNightSeen=S.rgNightSeen||{};S.rgNightSeen[k]=text;setTimeout(()=>{toast(text,5,true);mindHit&&mindHit(hit||3);SFX.stinger&&SFX.stinger();},300);return true;}
// where Room 6's door is, where the lookout cab is, the chapel windows, the hearths
const RGN_R6=()=>({x:RGP.motel.x+4.05,z:RGP.motel.z+.05});
const RGN_HEARTHS=[[-2,-114],[10,-103],[-50,-112],[-60,-127],[8,-129],[-12,-94],[-44,-98]];
const RGN_DOLL={on:false,x:0,z:0,it:null};
const RGN_HEADS=[];
let RGN_SCARE=null;
function rgnTick(dt){RGN_EV.t+=dt;if(!rgnNight()){RGN_HEADS.length=0;return;}const r=rgAt(P.x,P.z);const k=r&&r.k;
  // Route 9 West: the doorway
  {const d=RGN_R6(),dist=Math.hypot(P.x-d.x,P.z-d.z);if(dist<4.2&&rgnOnce('r9w','Someone was standing in the doorway of Room 6. When you get there, the door is shut. Then, from the inside, three slow knocks.',4)){for(let i=0;i<3;i++)A.tone&&A.tone(70,.16,'square',.09,{delay:.6+i*.55,filter:['lowpass',300]});}}
  // Greyfield: the child among the crosses
  if(k==='grey'){const c={x:-171,z:50};const dist=Math.hypot(P.x-c.x,P.z-c.z);if(dist<4.5&&rgnOnce('grey','A child in a nightdress was standing among the crosses. Nobody is there now. The grass where she stood is pressed flat in the shape of two small bare feet.',4)){}
    if(S.rgNight.grey!==S.day&&Math.random()<dt*.15)A.tone&&A.tone(1100+Math.random()*300,.25,'triangle',.012,{slide:1500});}
  // the fen: a hand out of the water beside you
  if(k==='fen'&&S.rgNight.fen!==S.day&&!RGN_EV.k){for(let a=0;a<24;a++){const rr=2+(a%4)*1.1,x=P.x+Math.cos(a*.79)*rr,z=P.z+Math.sin(a*.79)*rr*.8;if(inFenPool(x,z)){if(Math.random()<dt*.6){RGN_EV.k='hand';RGN_EV.x=x;RGN_EV.z=z;RGN_EV.t=0;RGN_EV.dur=3.2;
      rgnOnce('fen','A hand came up out of the black water beside you. A child’s hand, brown as peat. It opened, as if to show you there was nothing in it, and went back down.',5);
      if(typeof AMBR!=='undefined')for(let i=0;i<3;i++)setTimeout(()=>AMBR.push({x,z,t:0}),i*400);}break;}}}
  if(RGN_EV.k&&RGN_EV.t>RGN_EV.dur)RGN_EV.k=null;
  // the Deep Corn: the scarecrow follows
  if(k==='corn'&&P.x>DCF.x0&&P.x<DCF.x1&&P.z>DCF.z0&&P.z<DCF.z1){if(!RGN_SCARE)RGN_SCARE=OBJ.find(o=>o.scareYou);
    if(RGN_SCARE&&S.rgNight.corn!==S.day&&Math.random()<dt*.25){const back=Math.atan2(-(P.fz||1),-(P.fx||0));let spot=null;
      for(let d=4;d<8&&!spot;d+=.5)for(let s=-.6;s<=.6&&!spot;s+=.3){const x=P.x+Math.cos(back+s)*d,z=P.z+Math.sin(back+s)*d;if(dcPath(x,z)&&!onScreen(x,z,-30))spot=[x,z];}
      if(spot){RGN_SCARE.x=spot[0];RGN_SCARE.z=spot[1];rgnOnce('corn','Something is standing in the row behind you. The scarecrow from the middle of the maze. Its painted face is your face. It wasn’t there a moment ago.',5);A.hiss&&A.hiss(1.4,.06,'highpass',2000,{wobble:true});}}}
  else if(RGN_SCARE&&!isNight()){RGN_SCARE.x=RGP.cornC.x;RGN_SCARE.z=RGP.cornC.z-.4;}
  // the reservoir: heads in the water
  if(k==='drown'){if(!RGN_HEADS.length){const R=RGP.res;for(let i=0;i<9;i++){for(let t=0;t<30;t++){const a=Math.random()*6.283,rr=.35+Math.random()*.55;const x=R.x+Math.cos(a)*R.rx*rr,z=R.z+Math.sin(a)*R.rz*rr;if(inRes(x,z)){RGN_HEADS.push({x,z,h:0,ph:Math.random()*6});break;}}}}
    let near=false;for(const h of RGN_HEADS){const d=Math.hypot(P.x-h.x,P.z-h.z);const want=d>9?1:0;h.h=clamp(h.h+(want?dt*.25:-dt*1.2),0,1);if(h.h>.5&&d<22)near=true;}
    if(near&&rgnOnce('drown','Heads have come up out of the reservoir, all over the water, all facing the same way: north-west, toward your farm. As you come down to the shore they go under, one by one, without a ripple.',4)){}}
  else RGN_HEADS.length=0;
  // Pine Ridge: the lookout's light, and the steps
  if(k==='ridge'&&Math.hypot(P.x-RGP.tower.x,P.z-RGP.tower.z)<26&&rgnOnce('ridge','There is a light on in the lookout cab. Something up there is walking round and round the catwalk, slowly, in the dark. The stairs creak as it starts down.',4)){for(let i=0;i<8;i++)A.tone&&A.tone(110,.09,'square',.05,{delay:1+i*.45,filter:['lowpass',400]});}
  // Old Marrow: the hearths
  if(k==='marrow'&&rgnOnce('marrow','Every hearth in Old Marrow is glowing, as if the fires were lit again tonight. You hold your hand to one. There is no heat at all. Something in the chimney is breathing.',3)){}
  // the birches: a doll falls
  if(k==='birch'&&!RGN_DOLL.on&&S.rgNight.birch!==S.day&&Math.random()<dt*.2){RGN_DOLL.on=true;RGN_DOLL.x=P.x+(P.fx||0)*1.2;RGN_DOLL.z=P.z+(P.fz||1)*1.2;RGN_DOLL.day=S.day;
    rgnOnce('birch','Something drops out of the birches and lands at your feet with a soft sound. A doll.',3);
    if(!RGN_DOLL.it){RGN_DOLL.it={x:0,z:0,r:1,on:()=>RGN_DOLL.on&&!S.room,label:()=>'Look',ok:()=>true,act(){RGN_DOLL.on=false;const faceless=typeof RG_HEARTS!=='undefined'&&RG_HEARTS.agnes.h&&S.heartSeen['agnes'+RG_HEARTS.agnes.h];
        const t=faceless?'It is the doll with your hair and your colours, and no face. Agnes kept her word. Someone has drawn a face on the calico in charcoal, badly, as if from memory. It is getting there.':'It is a little rag doll with your hair, in your colours. Its face is stitched very carefully. It is your face. The thread is still warm.';
        addLore(t);toast(t,5.5,true);mindHit&&mindHit(4);}};interact.push(RGN_DOLL.it);}RGN_DOLL.it.x=RGN_DOLL.x;RGN_DOLL.it.z=RGN_DOLL.z;}
  if(RGN_DOLL.on&&(RGN_DOLL.day!==S.day||!isNight()))RGN_DOLL.on=false;}
{const _u=update;update=function(dt){_u(dt);if(S.mode!=='play'||S.paused)return;try{rgnTick(dt);}catch(e){}};}
// ---- the drawing
{const _ld=lifeDrawables;lifeDrawables=function(D,t){_ld(D,t);if(S.room||!isNight())return;const g=ctx2;
  // the figure in Room 6's doorway: only from a distance
  {const d=RGN_R6(),dist=Math.hypot(P.x-d.x,P.z-d.z);if(dist>4.4&&dist<28&&S.rgNight.r9w!==S.day&&onScreen(d.x,d.z,40))D.push({z:d.z+.02,mind:1,draw(){const X=Math.round(sx(d.x)),Y=Math.round(sz(d.z))-9;
    g.fillStyle='rgba(225,220,205,.85)';g.fillRect(X-3,Y-50,7,44);g.fillRect(X-2,Y-58,5,8);g.fillStyle='#0a0808';g.fillRect(X-1,Y-55,1,1);g.fillRect(X+1,Y-55,1,1);}});}
  // the child among the crosses
  {const c={x:-171,z:50},dist=Math.hypot(P.x-c.x,P.z-c.z);if(dist>6&&dist<26&&S.rgNight.grey!==S.day&&onScreen(c.x,c.z,40))D.push({z:c.z,mind:1,draw(){const X=Math.round(sx(c.x)),Y=Math.round(sz(c.z));
    g.fillStyle='rgba(232,230,220,.82)';g.beginPath();g.moveTo(X-5,Y);g.lineTo(X+5,Y);g.lineTo(X+3,Y-16);g.lineTo(X-3,Y-16);g.fill();g.fillRect(X-3,Y-23,6,7);g.fillStyle='#1a1414';g.fillRect(X-3,Y-24,6,3);g.fillRect(X-1,Y-20,1,1);g.fillRect(X+1,Y-20,1,1);}});}
  // the hand out of the fen
  if(RGN_EV.k==='hand'&&onScreen(RGN_EV.x,RGN_EV.z,30)){const e=RGN_EV;D.push({z:e.z,mind:1,draw(){const X=Math.round(sx(e.x)),Y=Math.round(sz(e.z));const k=Math.sin(Math.min(1,e.t/e.dur)*Math.PI);const h=Math.round(k*14);
    g.fillStyle='#5a3a24';g.fillRect(X-2,Y-h,5,h);g.fillStyle='#6e4a2e';g.fillRect(X-3,Y-h-4,7,4);if(e.t>e.dur*.35&&e.t<e.dur*.7)for(let i=-2;i<=2;i++)g.fillRect(X+i*2-1,Y-h-8-Math.abs(i),1,4);g.fillStyle='rgba(200,220,220,.4)';g.fillRect(X-5,Y,11,1);}});}
  // heads in the reservoir
  for(const h of RGN_HEADS){if(h.h<=.02||!onScreen(h.x,h.z,30))continue;D.push({z:h.z,mind:1,draw(){const X=Math.round(sx(h.x)),Y=Math.round(sz(h.z));const up=Math.round(h.h*7);
    g.fillStyle='#14181c';g.fillRect(X-4,Y-up,8,up+1);g.fillStyle='rgba(205,214,210,.9)';if(up>4){g.fillRect(X-5,Y-up+3,2,3);}g.fillStyle='rgba(180,200,210,.45)';g.fillRect(X-6,Y+1,13,1);}});}
  // the lookout cab's lit windows
  if(Math.hypot(P.x-RGP.tower.x,P.z-RGP.tower.z)<40&&onScreen(RGP.tower.x,RGP.tower.z,400))D.push({z:RGP.tower.z+.02,mind:1,draw(){const X=Math.round(sx(RGP.tower.x)),Y=Math.round(sz(RGP.tower.z))-334+102;
    for(let i=0;i<4;i++){g.fillStyle='rgba(255,214,130,.85)';g.fillRect(X-27+i*14,Y,11,9);}const fx=X-24+((Math.floor(t*.7)%5)*12);g.fillStyle='#0a0806';g.fillRect(fx,Y+1,4,8);}});
  // Old Marrow: the chapel windows burning
  if(!(typeof twStarted==='function'&&twStarted('church'))&&Math.hypot(P.x-RGP.chapel.x,P.z-RGP.chapel.z)<40&&onScreen(RGP.chapel.x,RGP.chapel.z,400))D.push({z:RGP.chapel.z+.02,mind:1,draw(){const X=Math.round(sx(RGP.chapel.x)),Y=Math.round(sz(RGP.chapel.z));
    for(let i=0;i<4;i++){const wx=X-168+14+26+i*50,wy=Y-224+130;const fl=.6+.4*Math.sin(t*7+i*2);g.fillStyle=`rgba(255,${110+fl*60|0},40,${.55+.3*fl})`;g.fillRect(wx+2,wy+6,13,40);g.fillRect(wx+5,wy,7,6);}}});
  // a doll at your feet
  if(RGN_DOLL.on)D.push({z:RGN_DOLL.z,mind:1,draw(){const X=Math.round(sx(RGN_DOLL.x)),Y=Math.round(sz(RGN_DOLL.z));g.fillStyle='rgba(10,8,8,.35)';g.fillRect(X-6,Y-1,12,3);
    g.fillStyle='#d8ccb8';g.fillRect(X-6,Y-5,4,4);g.fillStyle='#8a6a7a';g.fillRect(X-2,Y-6,8,5);g.fillStyle='#c8b8a0';g.fillRect(X+6,Y-5,2,2);g.fillStyle='#6a4a30';g.fillRect(X-7,Y-6,2,3);}});};}
{const _ll=lifeLight;lifeLight=function(t,L){_ll(t,L);try{if(S.room)return;
  if(Math.hypot(P.x-RGP.tower.x,P.z-RGP.tower.z)<40)glowAt(sx(RGP.tower.x),sz(RGP.tower.z)-228,70,[255,200,120],.75*L);
  if(Math.hypot(P.x-RGP.chapel.x,P.z-RGP.chapel.z)<50){if(!(typeof twStarted==='function'&&twStarted('church')))for(let i=0;i<4;i++)glowAt(sx(RGP.chapel.x)-168+14+34+i*50,sz(RGP.chapel.z)-70,42,[255,120,40],(.55+.25*Math.sin(t*7+i*2))*L);
    for(const [x,z] of RGN_HEARTHS)if(onScreen(x,z,80))glowAt(sx(x),sz(z)-14,30,[255,90,30],(.6+.3*Math.sin(t*5+x))*L);}
  {const d=RGN_R6();if(Math.hypot(P.x-d.x,P.z-d.z)<30&&S.rgNight.r9w!==S.day)glowAt(sx(d.x),sz(d.z)-36,30,[220,230,255],.4*L);}}catch(e){}};}
