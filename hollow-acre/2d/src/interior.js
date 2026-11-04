/* ================= interiors: walk in through the door; each room lives far east of the valley in its own pocket of the world ================= */
// furniture: [sprite, x, z (metres from the room's top-left floor corner, sprite feet), footprint [x0,z0,x1,z1] or null, kind]
const ROOMS={
  cabin:{ox:300,oz:-60,out:{x:doorPos.x,z:doorPos.z+.9},name:'Grandpa’s cabin',furn:[
    ['in_bed',1.3,2.6,[-.85,-2.1,.85,0]],['in_shelf_books',3.2,.62,[-.8,-.4,.8,0]],['in_clock',4.3,.55,[-.3,-.3,.3,0]],['in_desk',5.85,.95,[-.88,-.45,.88,0]],
    ['in_stove',7.9,.95,[-.68,-.5,.68,0]],['in_rug',3.9,4.1,null,'flat'],['in_table',6.3,3.5,[-.85,-.45,.85,0]],['in_chair',5.2,3.55,[-.3,-.25,.3,0]],['in_chair',7.4,3.55,[-.3,-.25,.3,0]],
    ['in_cellar',1.2,5.4,null,'flat'],['in_mirror',8.45,-.45,null,'flat'],['barrel',8.4,5.2,[-.4,-.3,.4,0]]]},
  store:{ox:330,oz:-60,out:{x:31,z:-8.7},name:'Coyle’s General Store',furn:[
    ['in_shelf_cans',1.1,.62,[-1,-.4,1,0]],['in_shelf_jars',2.9,.62,[-.8,-.4,.8,0]],['in_shelf_jars',6.2,.62,[-.8,-.4,.8,0]],['in_shelf_cans',7.9,.62,[-1,-.4,1,0]],
    ['in_counter',4.55,2.5,[-1.56,-.6,1.56,0]],['in_crates',8.0,4.9,[-.7,-.4,.7,0]],['in_keg',.8,4.7,[-.4,-.3,.4,0]],['sacks',1.7,5.3,[-.55,-.3,.55,0]],['barrel',.7,3.3,[-.4,-.3,.4,0]],['in_rug',4.5,4.9,null,'flat']]},
  church:{ox:360,oz:-60,out:{x:48,z:-17.9},name:'Marrow Hollow Church',furn:[
    ['in_altar',5,1.7,[-1.15,-.65,1.15,0]],['in_candles',2.5,1.1,[-.6,-.25,.6,0]],['in_candles',7.5,1.1,[-.6,-.25,.6,0]],
    ['in_pew',2.4,3.6,[-1.95,-.45,1.95,0]],['in_pew',7.6,3.6,[-1.95,-.45,1.95,0]],['in_pew',2.4,5.0,[-1.95,-.45,1.95,0]],['in_pew',7.6,5.0,[-1.95,-.45,1.95,0]],
    ['in_pew',2.4,6.4,[-1.95,-.45,1.95,0]],['in_pew',7.6,6.4,[-1.95,-.45,1.95,0]]]},
  garage:{ox:392,oz:-60,out:{x:-33.7,z:-9.9},name:'Pruitt’s Garage',furn:[
    ['in_shelf_tools',1.2,.62,[-1,-.4,1,0]],['in_bench',5.3,1.05,[-1.3,-.5,1.3,0]],['in_keg',8.2,1.0,[-.4,-.3,.4,0]],['in_car',3.2,4.0,[-1.85,-1.3,1.85,0]],
    ['in_crates',8.0,4.7,[-.7,-.4,.7,0]],['barrel',7.6,2.4,[-.4,-.3,.4,0]],['in_keg',.6,5.2,[-.4,-.3,.4,0]]]}};
S.room=null;
function roomOf(){return S.room&&ROOMS[S.room];}
function buildInteriors(){for(const k in ROOMS){const R=ROOMS[k],m=SPR['room_'+k];R.w=m.room.w;R.d=m.room.d;R.door=m.room.door;const x0=R.ox,z0=R.oz,x1=x0+R.w,z1=z0+R.d;
  addRect(x0-3,z0-4,x1+3,z0+.3);addRect(x0-3,z0-4,x0+.12,z1+3);addRect(x1-.12,z0-4,x1+3,z1+3);
  addRect(x0-3,z1,x0+R.door-.62,z1+3);addRect(x0+R.door+.62,z1,x1+3,z1+3);addRect(x0-3,z1+.5,x1+3,z1+3);
  for(const [spr,lx,lz,f,kind] of R.furn){const o=obj(spr,x0+lx,z0+lz,{kind:kind||'furn',night:SPR[spr+'_n']?spr+'_n':null,room:k});if(f)addRect(o.x+f[0],o.z+f[1],o.x+f[2],o.z+f[3]);}}}
function enterRoom(k){const R=ROOMS[k];S.mode='trans';fade(1);SFX.thud(0,.25);
  setTimeout(()=>{S.room=k;P.x=R.ox+R.door;P.z=R.oz+R.d-.45;P.dir='N';P.fx=0;P.fz=-1;P.anim=null;H.vis=false;if(H.state!=='gone'){H.state='gone';H.timer=5;}S.mode='play';fade(0);
    if(!S.first['room_'+k]){S.first['room_'+k]=1;toast(R.name+'.',2);}},380);}
function leaveRoom(){const R=roomOf();if(!R)return;S.mode='trans';fade(1);SFX.thud(0,.25);
  setTimeout(()=>{S.room=null;P.x=R.out.x;P.z=R.out.z;P.dir='S';P.fx=0;P.fz=1;S.mode='play';fade(0);},380);}
// doors outside
{const cab=interact.find(it=>it.x===doorPos.x&&it.z===doorPos.z);if(cab){cab.label=()=>!S.readLetter?'Read note':'Enter';
    cab.act=function(){if(!S.readLetter){S.readLetter=true;openNote(LETTER.map(p=>p.startsWith('<span')?p:`<p>${p}</p>`).join(''));return;}enterRoom('cabin');};}}
interact.push({x:31,z:-9.05,r:.9,label:()=>'Enter',ok:()=>true,act(){if(isNight()){toast('Locked. Behind the glass, every can on the shelf has been turned to face the door.',3);SFX.deny();return;}enterRoom('store');}});
interact.push({x:48,z:-18.2,r:1.1,label:()=>'Enter',ok:()=>true,act(){enterRoom('church');}});
interact.push({x:-33.7,z:-10.25,r:.9,label:()=>'Enter',ok:()=>true,act(){enterRoom('garage');}});
// things to use inside
const rp=(k,lx,lz)=>({x:ROOMS[k].ox+lx,z:ROOMS[k].oz+lz});
const inRoom=k=>()=>S.room===k;
interact.push({...rp('cabin',1.3,2.9),r:1.3,on:inRoom('cabin'),label:()=>S.hour>=18?'Sleep':'Bed',ok:()=>true,act(){if(S.hour<18){toast('You aren’t tired yet. The pillow still smells of Grandpa’s pipe.',2.6);return;}sleep();}});
interact.push({...rp('cabin',5.85,1.4),r:1.1,on:inRoom('cabin'),label:()=>'Desk',ok:()=>true,act(){
  const T=tierOf(M.v);openNote(T>=3?`<p><i>Grandpa’s ledger of the farm. Every line on every page says the same thing, in your handwriting:</i></p><p>DON’T LET IT IN DON’T LET IT IN DON’T LET IT IN</p>`:
  `<p><i>Grandpa’s desk. A seed ledger, a pipe gone cold, and a list in pencil:</i></p><p>Turnips by the 3rd. Pumpkins by the 9th. Six pages hidden, one for every year I said no.</p><p>Bell at eight. Lamp oil. <b>Never open the cellar after dark.</b></p>`);}});
interact.push({...rp('cabin',1.2,5.1),r:1,on:inRoom('cabin'),label:()=>'Cellar',ok:()=>true,act(){const n=isNight();SFX.thud(0,n?.5:.2);
  toast(n?'Three slow knocks answer you. From underneath.':'Chained shut. The scratches on the boards run the wrong way, from the inside.',3,n);if(n)mindHit&&mindHit(4);}});
interact.push({...rp('cabin',8.45,.3),r:.9,on:inRoom('cabin'),label:()=>'Mirror',ok:()=>true,act(){const T=tierOf(M.v);
  const lines=['You look tired. You look like him.','You look tired. Your reflection looks more tired.','Your reflection blinks a moment after you do.','It isn’t you. It’s wearing your shirt, and it’s smiling.','There is nobody in the mirror. The room behind you is empty too. Except for the shape in the bed.'];
  toast(lines[Math.min(4,T)],3.2,T>=2);if(T>=2){SFX.stinger();mindHit&&mindHit(3);}}});
interact.push({...rp('cabin',7.9,1.4),r:1,on:inRoom('cabin'),label:()=>'Stove',ok:()=>true,act(){M.v=Math.min(100,M.v+6);toast('You warm your hands. For a moment the house feels like his again.',2.4);}});
interact.push({...rp('store',4.55,3.0),r:1.4,on:inRoom('store'),label:()=>'Counter',ok:()=>true,act(){toast('Mae calls from the back room: “Take what you need, dear. Leave the coins by the till.”',2.8);openShop('mae');}});
interact.push({...rp('garage',5.3,1.5),r:1.3,on:inRoom('garage'),label:()=>'Workbench',ok:()=>true,act(){openShop('hollis');}});
interact.push({...rp('garage',3.2,4.4),r:1.6,on:inRoom('garage'),label:()=>'Cruiser',ok:()=>true,act(){toast('The sheriff’s old cruiser, up on blocks. There’s a child’s shoe on the back seat, dry as bone.',3);}});
interact.push({...rp('church',5,2.2),r:1.4,on:inRoom('church'),label:()=>'Ledger',ok:()=>true,act(){openNote(`<p><i>The parish ledger, open on the altar. A name for every October since 1871, in the same brown ink.</i></p><p>1987 · Ruth Abernathy<br>1999 · Daniel Coyle<br>…</p><p>The last line is already written. The ink is still wet. It is your name.</p>`);mindHit&&mindHit(5);}});
interact.push({...rp('church',5,5.7),r:1.4,on:inRoom('church'),label:()=>'Pray',ok:()=>true,act(){const T=tierOf(M.v);M.v=Math.min(100,M.v+(T>=3?-4:8));toast(T>=3?'You kneel. Somebody in the back pew kneels with you. When you turn, the pew is empty.':'You sit a while. The quiet helps.',3,T>=3);}});
// walking into the doorway takes you back out
const _upd2=update;update=function(dt){_upd2(dt);const R=roomOf();if(!R||S.mode!=='play')return;
  if(P.z>R.oz+R.d-.12&&Math.abs(P.x-(R.ox+R.door))<.7)leaveRoom();
  if(isNight())M.v=Math.min(100,M.v+.3*dt);
  if(isNight()&&!S.bound){R.knockT=(R.knockT===undefined?18:R.knockT)-dt;if(R.knockT<=0){R.knockT=24+rand()*30;if(tierOf(M.v)>=1||rand()<.4){for(let i=0;i<3;i++)setTimeout(()=>SFX.thud(0,.45),i*420);setTimeout(()=>toast(pick(['Three knocks at the door.','Knocking. Low on the door, where a child would knock.','Someone tries the handle. Slowly.','“Let me in,” in Grandpa’s voice.']),2.8,true),1300);}}}};
// the Hollow can't follow you in. It waits.
const _hu=hollowUpdate;hollowUpdate=function(dt){if(S.room){if(H.state!=='gone'){H.state='gone';H.vis=false;}H.timer=Math.max(H.timer||0,3);return 99;}return _hu(dt);};
// visions stay inside the walls
const _ap=aroundPlayer;aroundPlayer=function(a,b,d0,d1){const p=_ap(a,b,d0,d1);const R=roomOf();if(R){p.x=clamp(p.x,R.ox+.6,R.ox+R.w-.6);p.z=clamp(p.z,R.oz+.8,R.oz+R.d-.5);}return p;};
// waking up: if you went to bed inside, you wake up inside
const _nd=newDay;newDay=function(msg,pos){const was=S.room;_nd(msg,pos);if(was==='cabin'&&!pos){const R=ROOMS.cabin;P.x=R.ox+2.6;P.z=R.oz+2.9;P.dir='S';}else S.room=null;};
// light: daylight through the windows, warm lamps at night
const _amb=ambient;ambient=function(h){const a=_amb(h);if(!S.room)return a;const d=clamp((h-6)/1.5,0,1)*clamp((19.5-h)/1.5,0,1);return [lerp(64,206,d),lerp(56,192,d),lerp(66,170,d)];};
function interiorGround(){const R=roomOf();if(!R)return;const m=SPR['room_'+S.room];const X=Math.round(sx(R.ox))-m.side,Y=Math.round(sz(R.oz))-m.top;const im=IMG[m.src];if(im)ctx2.drawImage(im,X,Y);
  const n=SPR['room_'+S.room+'_n'];if(n&&nightK>0&&IMG[n.src]){ctx2.globalAlpha=nightK;ctx2.drawImage(IMG[n.src],X,Y);ctx2.globalAlpha=1;}}
function interiorLight(L){const R=roomOf();if(!R)return;const fl=.94+.06*Math.sin(performance.now()/180);
  const G=(lx,lz,r,c,a)=>glowAt(sx(R.ox+lx),sz(R.oz+lz),r,c,a*L*fl);
  if(S.room==='cabin'){G(6.5,3.0,110,[255,180,100],.75);G(7.9,.6,70,[255,120,40],.8);G(5.9,.6,60,[255,200,130],.6);}
  if(S.room==='store'){G(4.55,2.0,120,[255,190,110],.7);}
  if(S.room==='church'){G(2.5,.7,80,[255,190,110],.8);G(7.5,.7,80,[255,190,110],.8);G(5,1.2,100,[255,180,100],.6);}
  if(S.room==='garage'){G(5.3,.6,120,[220,230,255],.55);}}
