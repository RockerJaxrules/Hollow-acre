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
// ---- hiding: you are shut in somewhere; the world goes dark but for a line of light, and nothing that hunts by sight finds you
W79H.hideSpot=function(room,x,z,label,text){const s={room,x,z,label,text};W79H.spots.push(s);
  interact.push({get x(){return ROOMS[room]?ROOMS[room].ox+x:0;},get z(){return ROOMS[room]?ROOMS[room].oz+z:0;},r:.95,on:()=>S.room===room&&!W79H.hid,label:()=>label,ok:()=>true,
    act(){W79H.hide(s);}});return s;};
W79H.hide=function(s){W79H.hid=s;W79H.hidAt={x:P.x,z:P.z};SFX.thud&&SFX.thud(0,.18);if(s.text)toast(s.text,2.6);};
W79H.unhide=function(){if(!W79H.hid)return;W79H.hid=null;SFX.thud&&SFX.thud(0,.15);};
// you stay put while hidden; any move key brings you out (unless something is on the other side of the door)
{const _u=update;update=function(dt){_u(dt);try{W79H.tick(dt);}catch(e){}};}
W79H.tick=function(dt){if(W79H.hid){if(S.room!==W79H.hid.room){W79H.hid=null;}else{const a=W79H.hidAt;const moved=Math.hypot(P.x-a.x,P.z-a.z)>.05;
      if(moved){if(W79H.th&&W79H.th.phase==='in'){P.x=a.x;P.z=a.z;}else W79H.unhide();}}}
  const T=W79H.th;if(!T)return;if(S.room!==T.room&&T.phase!=='done'){W79H.th=null;return;}T.t+=dt;
  if(T.phase==='warn'&&T.t>=T.secs){T.phase=W79H.hid?'in':'seen';T.t=0;
    if(T.phase==='seen'){SFX.stinger&&SFX.stinger();if(typeof mindHit==='function')mindHit(12);toast(T.caught,4,true);setTimeout(()=>{if(S.room===T.room){P.fz=1;leaveRoom(true);}},1400);W79H.th=null;return;}
    SFX.thud&&SFX.thud(0,.35);toast(T.inside,3.4,true);}
  if(T.phase==='in'){if(Math.floor(T.t*1.25)!==Math.floor((T.t-dt)*1.25)&&T.t<5)SFX.thud&&SFX.thud(0,.1);   /* its steps, crossing the room */
    if(T.t>=6.5){toast(T.pass,3.2);T.phase='done';W79H.th=null;if(typeof mindHit==='function')mindHit(4);}}};
W79H.threat=function(room,o){if(W79H.th||S.room!==room)return false;o=o||{};W79H.th={room,t:0,phase:'warn',secs:o.secs||5,inside:o.inside||'It comes in. You hear it breathing on the other side of the door.',
  pass:o.pass||'It stands outside the door a long time. Then it goes.',caught:o.caught||'It sees you.'};
  SFX.thud&&SFX.thud(0,.22);setTimeout(()=>SFX.thud&&SFX.thud(0,.22),350);toast(o.warn||'The door handle turns.',3,true);return true;};
// the dark you see while hidden: everything black but a strip of light under the door
{const _do=depthOver;depthOver=function(t){const r=_do.apply(this,arguments);try{if(W79H.hid){ctx2.fillStyle='#000';ctx2.fillRect(0,0,VW,VH);const w=Math.round(VW*.34),x=Math.round(VW/2-w/2),y=Math.round(VH*.58);
      const th=W79H.th,flick=th&&th.phase==='in'&&Math.sin(th.t*3.1)>.2;ctx2.fillStyle=flick?'#3a2a18':'#a8884c';ctx2.fillRect(x,y,w,2);ctx2.fillStyle=flick?'#1a120a':'#4a3a20';ctx2.fillRect(x,y+2,w,1);
      if(flick){ctx2.fillStyle='#000';ctx2.fillRect(x+Math.round(w*.3+Math.sin(th.t)*w*.2),y,Math.round(w*.18),2);}}}catch(e){}return r;};}
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
    toast('A bag for every year, pushed in under the floor in rows: a doctor’s bag, a satchel, a trunk with a woman’s initials. Every tag reads ROOM 6. The newest is still dry. The writing on its tag is yours.',6,true);if(typeof mindHit==='function')mindHit(3);}});
  // out through the front window onto the walkway, beside the door
  W79H.escape('rg_room6',5.9,4.55,'Climb out of the window',()=>({x:RGP.motel.x+5.4,z:RGP.motel.z+.95}),'You drop onto the walkway and don’t look back at the window.');
  // at night the handle turns, once a night at most, a little while after you come in
  setInterval(()=>{try{if(S.room!=='rg_room6'||S.mode!=='play'||S.paused||W79H.th||!isNight())return;S.w79h=S.w79h||{};if(S.w79h.r6night===S.day)return;
      W79H.r6t=(W79H.r6t||0)+1;if(W79H.r6t<12)return;W79H.r6t=0;S.w79h.r6night=S.day;
      W79H.threat('rg_room6',{warn:'Someone has a key. The handle of Room 6 turns, slowly.',inside:'The door opens. Something comes in and stands where the bed is.',
        pass:'It goes to the bathroom door and stays there, breathing, a long time. Then the room door closes.',caught:'It is in the doorway, much taller than the door, and it has seen you.'});}catch(e){}},1000);}}
