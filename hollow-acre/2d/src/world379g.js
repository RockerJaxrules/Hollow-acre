/* ================= #379g W6, part one: the valley's abandoned interiors, where you hide and how you get out (story plan 6.2; owner:
   "some of them should be hide inside maybe secret cellars ... you come in there exploring find what you want but than need to
   escape"). The first place is Room 6 at the Pine Rest:
   - a bathroom door in the back wall you can hide behind: shut inside, you see only the line of light under the door;
   - while you are in the room, the handle of the room's door can turn (at night, or when the story calls it). You have a few
     seconds to hide. Hidden, you hear it cross the room, stop outside the bathroom, and go. Not hidden, it sees you, and you are
     thrown out into the car park with your heart going;
   - the crawlspace under the bed: a low dark space where the room's guests' bags are kept, one for every year, the newest with
     your name on the tag;
   - the way out through the front window, onto the walkway beside the door.
   The pieces are general, for the places the story sends you next (Greyfield's boiler cellar, Marrow Halt's lamp room...):
   W79H.hideSpot(room,x,z,label,text), W79H.escape(room,x,z,label,to), W79H.threat(room,{warn,secs,pass,caught}).
   Anchors for the story: room 'rg_room6' (entered by its door at the Pine Rest), 'w79_crawl6' (from under Room 6's bed). ================= */
const W79H={spots:[],esc:[],hid:null,th:null};
// fear (W3, fear378.js): every moment goes through fearAdd with its reason once the Fear bar is in the build; until then mindHit
const w79Fear=(n,why)=>{try{if(typeof fearAdd==='function')return fearAdd(n,why);if(typeof mindHit==='function')mindHit(n);}catch(e){}};
const w79Rate=(k,ps,on)=>{try{if(typeof fearRate==='function')fearRate(k,ps,!!on);}catch(e){}};
// read-only, for the Fear bar and the face: hiding, what is at the door, whether something hunts you
window.__w79={hidden:()=>!!W79H.hid,threat:()=>W79H.th?W79H.th.phase:null,hunted:()=>!!(typeof W79G!=='undefined'&&W79G.r&&W79G.r.mode==='hunt'&&S.room==='w79_boiler')};
// the dark cellars: too frightened and without a light, you stop at the top and won't go down
const W79H_DARK=new Set(['w79_crawl6','w79_boiler','w79_lamproom']);
{const _er=enterRoom;enterRoom=function(k){try{if(W79H_DARK.has(k)&&typeof fearDarkRefuse==='function'&&fearDarkRefuse()){if(typeof fearBalk==='function')fearBalk();return;}}catch(e){}return _er.apply(this,arguments);};}
// ---- hiding: you are shut in somewhere; the world goes dark but for a line of light, and nothing that hunts by sight finds you
W79H.hideSpot=function(room,x,z,label,text){const s={room,x,z,label,text};W79H.spots.push(s);
  interact.push({get x(){return ROOMS[room]?ROOMS[room].ox+x:0;},get z(){return ROOMS[room]?ROOMS[room].oz+z:0;},r:.95,on:()=>S.room===room&&!W79H.hid,label:()=>label,ok:()=>true,
    act(){W79H.hide(s);}});return s;};
// the way out, said the way you play: the stick on a pad, a drag on a touch screen, a move key on a keyboard (or Use, anywhere)
const w79hHow=()=>{try{if(typeof GP!=='undefined'&&GP.mode==='pad')return 'Push the stick to come out.';if(matchMedia('(pointer:coarse)').matches)return 'Drag to come out.';}catch(e){}return 'Press a move key to come out.';};
W79H.hide=function(s){W79H.hid=s;W79H.hidAt={x:P.x,z:P.z};SFX.thud&&SFX.thud(0,.18);toast((s.text?s.text+' ':'')+w79hHow(),3.4);};
W79H.unhide=function(){if(!W79H.hid)return;W79H.hid=null;SFX.thud&&SFX.thud(0,.15);};
// you stay put while hidden; any move key brings you out (unless something is on the other side of the door)
{const _u=update;update=function(dt){_u(dt);try{W79H.tick(dt);w79Rate('held',1.5,W79H.hid&&W79H.th&&W79H.th.phase==='in');}catch(e){}};}
W79H.tick=function(dt){if(W79H.hid){if(S.room!==W79H.hid.room){W79H.hid=null;}else{const a=W79H.hidAt;const moved=Math.hypot(P.x-a.x,P.z-a.z)>.05;
      if(moved){if(W79H.th&&W79H.th.phase==='in'){P.x=a.x;P.z=a.z;}else W79H.unhide();}}}
  const T=W79H.th;if(!T)return;if(S.room!==T.room&&T.phase!=='done'){W79H.th=null;return;}T.t+=dt;
  if(T.phase==='warn'&&T.t>=T.secs){T.phase=W79H.hid?'in':'seen';T.t=0;
    if(T.phase==='seen'){SFX.stinger&&SFX.stinger();w79Fear(12,'seen');toast(T.caught,4,true);setTimeout(()=>{if(S.room===T.room){P.fz=1;leaveRoom(true);}},1400);W79H.th=null;return;}
    SFX.thud&&SFX.thud(0,.35);toast(T.inside,3.4,true);}
  if(T.phase==='in'){if(Math.floor(T.t*1.25)!==Math.floor((T.t-dt)*1.25)&&T.t<5)SFX.thud&&SFX.thud(0,.1);   /* its steps, crossing the room */
    if(T.t>=6.5){toast(T.pass,3.2);T.phase='leave';T.t=0;w79Fear(4,'passed');}}
  if(T.phase==='leave'){if(Math.floor(T.t*1.25)!==Math.floor((T.t-dt)*1.25))SFX.thud&&SFX.thud(0,.08);if(T.t>=1.7){T.phase='done';W79H.th=null;}}};
W79H.threat=function(room,o){if(W79H.th||S.room!==room)return false;o=o||{};W79H.th={room,t:0,phase:'warn',secs:(o.secs||5)*(typeof fearTier==='function'&&fearTier()>=4?.8:1),inside:o.inside||'It comes in. You hear it breathing on the other side of the door.',
  pass:o.pass||'It stands outside the door a long time. Then it goes.',caught:o.caught||'It sees you.'};
  SFX.thud&&SFX.thud(0,.22);setTimeout(()=>SFX.thud&&SFX.thud(0,.22),350);toast(o.warn||'The door handle turns.',3,true);return true;};
// ---- what you see while hidden: the back of the door in the dark. Light leaks faintly round its edges, a warmer strip shows under it
// with dust drifting in it; when something is in the room the shadows of its feet cross the strip, stop in front of you and stay,
// the light dimming as it leans in; when it goes, they move away. Drawn on its own layer over the world (after the room's lighting,
// which would otherwise swallow it); the layer is only shown, and only drawn, while you are hidden.
W79H.cv=null;
function w79hLayer(){if(W79H.cv)return W79H.cv;const v=document.getElementById('view');if(!v)return null;const c=document.createElement('canvas');c.id='w79hide';
  c.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;image-rendering:crisp-edges;display:none';v.insertAdjacentElement('afterend',c);return W79H.cv=c;}
function w79hDraw(){const c=w79hLayer();if(!c)return;if(c.width!==VW||c.height!==VH){c.width=VW;c.height=VH;}const g=c.getContext('2d'),t=performance.now()/1000,th=W79H.th;
  const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));};
  R(0,0,VW,VH,'#020103');
  const dw=Math.round(Math.min(VW*.24,VH*.42)),dh=Math.round(VH*.64),x0=Math.round(VW/2-dw/2),y1=Math.round(VH*.76),y0=y1-dh;
  let dim=1;if(th&&th.phase==='in'&&th.t>2.6)dim=.6+.07*Math.sin(th.t*1.3);
  for(let y=y0;y<y1;y++){const a=(.04+.2*Math.pow((y-y0)/dh,2.2))*dim;R(x0-1,y,1,1,`rgba(196,150,84,${a.toFixed(3)})`);R(x0+dw,y,1,1,`rgba(196,150,84,${(a*.8).toFixed(3)})`);}   /* round the two sides */
  R(x0,y0-1,dw,1,`rgba(196,150,84,${(.06*dim).toFixed(3)})`);   /* and faintly along the top */
  R(x0,y1,dw,3,`rgba(236,192,112,${(.92*dim).toFixed(3)})`);R(x0,y1+3,dw,1,`rgba(196,140,72,${(.5*dim).toFixed(3)})`);   /* the strip under the door, warm and wider */
  for(let k=1;k<=7;k++)R(x0-k*3,y1+3+k,dw+k*6,1,`rgba(150,100,52,${((.12-k*.015)*dim).toFixed(3)})`);   /* its light on the floor at your feet */
  for(let i=0;i<6;i++){const u=(t*(.025+i*.006)+i*.37)%1,mx=x0+dw*(.12+.76*((i*.29+.05*Math.sin(t*.5+i*1.7)+1)%1)),my=y1+4+u*9;R(mx,my,1,1,`rgba(244,214,150,${((1-u)*.55*dim).toFixed(3)})`);}   /* dust */
  if(th&&(th.phase==='in'||th.phase==='leave')){const walk=th.phase==='in'?Math.min(1,th.t/2.6):1-Math.min(1,th.t/1.6),off=(th.phase==='in'?-1:1)*dw*.95*(1-walk),moving=walk<1;
    const fw=Math.max(3,Math.round(dw*.1)),gap=Math.round(dw*.06),cx=x0+dw/2+off;
    for(const sd of [-1,1]){const step=moving?Math.sin(th.t*7+(sd>0?Math.PI:0))*dw*.025:0;let fx=cx+sd*(gap/2+fw/2)-fw/2+step;const l=Math.max(x0,fx),r=Math.min(x0+dw,fx+fw);if(r<=l)continue;
      R(l,y1,r-l,3,'#050304');R(l-1,y1+3,r-l+2,4,'rgba(2,1,3,.75)');}}
}
function w79hFrame(){const c=w79hLayer();if(!c)return;const on=!!W79H.hid&&S.room===(W79H.hid&&W79H.hid.room);if(on!==W79H.on){W79H.on=on;c.style.display=on?'block':'none';}if(on)w79hDraw();}
{const loop=()=>{try{w79hFrame();}catch(e){}requestAnimationFrame(loop);};requestAnimationFrame(loop);}
// Use brings you out too (not while it stands at the door)
interact.push({get x(){return P.x;},get z(){return P.z;},r:5,on:()=>!!W79H.hid&&!(W79H.th&&(W79H.th.phase==='in'||W79H.th.phase==='leave')),label:()=>'Move to come out',ok:()=>true,act(){W79H.unhide();}});
// ---- escapes: a way out that isn't the door
W79H.escape=function(room,x,z,label,to,text){const e={room,x,z,label,to,text};W79H.esc.push(e);
  interact.push({get x(){return ROOMS[room]?ROOMS[room].ox+x:0;},get z(){return ROOMS[room]?ROOMS[room].oz+z:0;},r:.95,on:()=>S.room===room&&!W79H.hid,label:()=>label,ok:()=>true,act(){
    const p=typeof to==='function'?to():to;S.mode='trans';fade(1);SFX.thud&&SFX.thud(0,.3);W79H.th=null;
    setTimeout(()=>{S.room=null;P.x=p.x;P.z=p.z;P.dir='S';P.fx=0;P.fz=1;S.mode='play';fade(0);if(text)toast(text,2.8);},380);}});return e;};
// ---- Room 6: the bathroom, the crawlspace, the window
{const R6=ROOMS.rg_room6;if(R6&&SPR.room_cellar_hale){
  let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;
  const bag=(spr,x,z)=>BF(spr,x,z,.3);
  ROOMS.w79_crawl6={ox,oz:-60,name:'Under the bed',shell:'room_cellar_hale',from:'rg_room6',out:{x:0,z:0},furn:[
    bag('in_satchel',.8,1.0),bag('in_doctorbag',1.7,1.1),bag('sacks',2.7,.95),bag('in_satchel',3.6,1.2),bag('in_linentrunk',4.7,1.0),bag('in_satchel',5.8,1.1),bag('in_doctorbag',6.7,.95),
    bag('in_satchel',1.2,2.4),bag('sacks',2.3,2.6),bag('in_satchel',5.4,2.5),bag('in_doctorbag',6.6,2.6)]};
  // the bathroom door in the back wall, between the nightstand and the dresser
  W79H.r6door=null;
  {const _bi=buildInteriors;buildInteriors=function(){_bi.apply(this,arguments);try{const R=ROOMS.rg_room6;if(R&&SPR.in_partition_door&&!W79H.r6door)W79H.r6door=obj('in_partition_door',R.ox+2.95,R.oz-.25,{kind:'flat',room:'rg_room6'});
      const C=ROOMS.w79_crawl6,R6b=ROOMS.rg_room6;if(C&&R6b)C.out={x:R6b.ox+1.25,z:R6b.oz+3.75};}catch(e){}};}
  W79H.hideSpot('rg_room6',3.98,.55,'Hide in the bathroom','You shut yourself in the bathroom. The light under the door is the only light.');
  // the crawlspace: under the stripped bed
  interact.push({get x(){return ROOMS.rg_room6.ox+1.25;},get z(){return ROOMS.rg_room6.oz+3.3;},r:.85,on:()=>S.room==='rg_room6'&&!W79H.hid,label:()=>'Look under the bed',ok:()=>true,act(){
    const C=ROOMS.w79_crawl6,R=ROOMS.rg_room6;C.from='rg_room6';C.out={x:R.ox+1.25,z:R.oz+3.75};SFX.thud&&SFX.thud(0,.2);enterRoom('w79_crawl6');}});
  interact.push({get x(){return ROOMS.w79_crawl6.ox+3.7;},get z(){return ROOMS.w79_crawl6.oz+1.9;},r:1.1,on:()=>S.room==='w79_crawl6',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();
    toast('A bag for every year, pushed in under the floor in rows: a doctor’s bag, a satchel, a trunk with a woman’s initials. Every tag reads ROOM 6. The newest is still dry. The writing on its tag is yours.',6,true);w79Fear(3,'look');}});
  // out through the front window onto the walkway, beside the door
  W79H.escape('rg_room6',5.9,4.55,'Climb out of the window',()=>({x:RGP.motel.x+5.4,z:RGP.motel.z+.95}),'You drop onto the walkway and don’t look back at the window.');
  // at night the handle turns, once a night at most, a little while after you come in
  setInterval(()=>{try{if(S.room!=='rg_room6'||S.mode!=='play'||S.paused||W79H.th||!isNight())return;S.w79h=S.w79h||{};if(S.w79h.r6night===S.day)return;
      W79H.r6t=(W79H.r6t||0)+1;if(W79H.r6t<12)return;W79H.r6t=0;S.w79h.r6night=S.day;
      W79H.threat('rg_room6',{warn:'Someone has a key. The handle of Room 6 turns, slowly.',inside:'The door opens. Something comes in and stands where the bed is.',
        pass:'It goes to the bathroom door and stays there, breathing, a long time. Then the room door closes.',caught:'It is in the doorway, much taller than the door, and it has seen you.'});}catch(e){}},1000);}}
