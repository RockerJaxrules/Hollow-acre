/* ================= the new Marrow Hollow, finished off: clutter cleared from its streets and doorways, a story behind every door that
   isn't anybody's home, long grass framing the fences, and two layers that move at their own speed over the town (leaves blowing
   close past the camera, crows high overhead whose shadows cross the streets). Old saves keep their things out of the new buildings. ================= */
// ---- the streets and doorways are kept clear of anything the woods scattered there
{const _bw=buildWorld;buildWorld=function(){_bw();
  const doors=[...Object.keys(TB).map(tbDoor),...Object.keys(SHOPS_AT).map(shopDoor)];
  const blds=OBJ.filter(o=>o.kind==='bld'&&inTown(o.x,o.z)).map(o=>{const f=SPR[o.spr]&&SPR[o.spr].foot;return f?[o.x+f[0]-.2,o.z+f[1]-.2,o.x+f[2]+.2,o.z+.2]:null;}).filter(Boolean);
  const junk=o=>{if(o.town||o.hide||!inTown(o.x,o.z))return false;const k=o.kind||'';const loose=o.debris||/^(rock_|weeds_|twig|stump)/.test(o.spr||'');
    if(!loose&&!(['tree','pine','bush'].includes(k)||(k==='anim'&&o.grass)||k==='deco'))return false;
    if(loose&&!o.yard)return true;
    if(onRoad(o.x,o.z,.5))return true;if(doors.some(d=>Math.hypot(d[0]-o.x,d[1]-o.z)<1.8))return true;
    return blds.some(b=>o.x>b[0]&&o.x<b[2]&&o.z>b[1]&&o.z<b[3]);};
  for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(!junk(o))continue;for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-o.z)<.5)circles.splice(j,1);OBJ.splice(i,1);}
  // long grass at the foot of the fences and the terrace wall: low things in front of the eye that frame the street
  const F=OBJ.filter(o=>(o.kind==='fence'||o.kind==='wall')&&inTown(o.x,o.z));
  for(const f of F){const h=floraH?floraH(f.x,f.z,7):Math.random();if(h>.34)continue;const n=2+((h*20)|0)%3;
    for(let k=0;k<n;k++){const x=f.x+(f.kind==='wall'?.4+k*.5:(floraH(f.x+k,f.z,8)-.5)*1.2),z=f.z+(f.kind==='wall'?.35:.3)+floraH(f.x,f.z+k,9)*.2;
      if(onRoad(x,z,.2)||doors.some(d=>Math.hypot(d[0]-x,d[1]-z)<1.4))continue;obj(h<.12?'tgold':'tgrass',x,z,{kind:'anim',grass:1,fps:1.4,ph:h*2,town:1});}}};}

// ---- every door in town has someone, or a story, behind it
const TOWN_DOORS={
  pell:{name:'The Pell house',day:'Boarded up since 1987. Chalked on the boards: a ring with a line through it, the mark the town leaves on a door after the Tithe takes someone from behind it. Under it, smaller, in a child’s hand: WE ARE STILL IN HERE.',
    night:'Behind the boards, very softly, someone is counting. They have got past a thousand. They are not tired.'},
  oakes:{name:'The Oakes house',day:'Mrs. Oakes, through the letterbox: “We’re not taking callers. Not this month.” Then, quieter: “Is it you? Is it your year? Leave a turnip on the step if it is, and we’ll pray for you properly.”',
    night:'The letterbox lifts. Two eyes. It drops again. A chair is dragged across the door on the inside.'},
  gale:{name:'The Gale house',day:'Three bicycles rusted into the lawn. Three height marks scored into the door frame, the children’s names beside them. A fourth mark, much higher, with no name. None of the Gales is that tall.',
    night:'A light goes off upstairs as you knock. Then another. Then one in a room the house is too small to have.'},
  marr:{name:'Old Marr’s house',day:'The mailbox is stuffed with letters in old Mr. Marr’s handwriting, all addressed to himself, all dated next week. The one on top: “Don’t open the door to the new one. They look like Elias.”',
    night:'From inside, an old man reads aloud: “Don’t open the door to the new one.” A page turns. “Don’t open the door.”'},
  wren:{name:'The Wren house',day:'For sale since 1972. The sign has been repainted every autumn. Through the dusty window a table is laid for four, and the plates are clean, and the chairs are pulled out.',
    night:'The table inside is laid for five now.'},
  hall:{name:'The town hall',day:'Chained shut. A notice on the door: TOWN MEETING ON THE QUESTION OF THE TITHE — POSTPONED. It is dated October 1952. The clock above has said eight minutes to twelve ever since the night of the vote.',
    night:'The chains are hanging loose. Inside, in the dark, a gavel knocks three times, and a room full of people says “Aye.”'},
  school:{name:'The schoolhouse',day:'Through the window: twenty small desks, and Miss Vance’s blackboard. DAYS LEFT, and under it a long row of tally marks, rubbed out and redone so often the slate has worn pale.',
    night:'Chalk squeaks inside. The schoolroom is dark. Someone small is adding a tally mark to the board, one stroke at a time.'}};
for(const [k,t] of Object.entries(TOWN_DOORS)){const [x,z]=tbDoor(k);
  interact.push({x,z,r:.9,on:()=>!S.room,label:()=>k==='school'||k==='wren'?'Look':'Knock',ok:()=>true,act(){const night=isNight();SFX.thud&&SFX.thud(0,.2);
    const key='door:'+k;S.rgLook=S.rgLook||{};if(!S.rgLook[key]){S.rgLook[key]=1;addLore(t.name+': '+t.day.replace(/<[^>]+>/g,''));}
    toast(night?t.night:t.day,5,true);if(night&&typeof mindHit==='function')mindHit(3);}});}
// the memorial and the bandstand on the green
const GREEN_LOOKS=[
  {x:41.4,z:2.2,label:'Read',name:'The memorial',text:'TO THE CHILDREN OF MARROW HOLLOW, WHO WENT AHEAD. Under it, a year and a first name for every autumn since 1871. The newest is Danny’s. Below his, the stone has already been dressed smooth for one more.'},
  {x:squarePos.x,z:squarePos.z+2,label:'Look',name:'The bandstand',text:'Someone has scratched a hopscotch into the bandstand boards and numbered it one to ninety-two. The band hasn’t played since the festival of 1952. On festival nights you can still hear them tuning up.'}];
for(const g of GREEN_LOOKS)interact.push({x:g.x,z:g.z,r:1.2,on:()=>!S.room,label:()=>g.label,ok:()=>true,act(){SFX.page&&SFX.page();const key='green:'+g.name;S.rgLook=S.rgLook||{};
  if(!S.rgLook[key]){S.rgLook[key]=1;addLore(g.name+': '+g.text);}toast(g.text,5.5,true);}});

// ---- parallax over the town: leaves blowing past close to the camera, crows high overhead with their shadows crossing the ground
const NEAR={leaves:[],flock:null,t:0,next:40};
function nearLeaf(){const a=Math.random()*6.283,r=6+Math.random()*7;return {x:cam.x+Math.cos(a)*r,z:cam.z+Math.sin(a)*r*.7,vx:.8+Math.random()*1.2,vz:.15+Math.random()*.4,
  rot:Math.random()*6.28,vr:(Math.random()-.5)*4,s:2+Math.random()*1.5,c:['#c8642a','#d8a030','#a83a1e','#e0b848'][(Math.random()*4)|0],ph:Math.random()*6};}
{const _dx=depthOver;depthOver=function(t){_dx(t);if(DX.off||S.room||S.mode!=='play')return;const day=clamp(1-nightK*1.4,0,1);const dt=Math.min(.05,t-(NEAR.t||t));NEAR.t=t;
  const P1=1.55,toS=(x,z)=>{const X=sx(x),Y=sz(z);return [(X-VW/2)*P1+VW/2,(Y-VH*.5)*P1+VH*.5];};
  // leaves: more of them where there are trees about
  const want=day>.05?Math.round(5+4*(typeof DX.nPar==='number'&&DX.nPar>0?1:0)):0;
  while(NEAR.leaves.length<want)NEAR.leaves.push(nearLeaf());if(NEAR.leaves.length>want)NEAR.leaves.length=want;
  for(let i=0;i<NEAR.leaves.length;i++){const l=NEAR.leaves[i];l.ph+=dt;l.x+=(l.vx+Math.sin(l.ph*1.3)*.9)*dt;l.z+=(l.vz+Math.cos(l.ph*.9)*.3)*dt;l.rot+=l.vr*dt;
    const [fx,fy]=toS(l.x,l.z);if(fx<-40||fx>VW+40||fy<-40||fy>VH+40||Math.hypot(l.x-cam.x,l.z-cam.z)>16){NEAR.leaves[i]=nearLeaf();continue;}
    ctx2.save();ctx2.globalAlpha=.85*day;ctx2.translate(Math.round(fx),Math.round(fy));ctx2.rotate(l.rot);ctx2.scale(1,.55+.45*Math.abs(Math.sin(l.ph*2.2)));
    ctx2.fillStyle=l.c;const s=l.s*2;ctx2.fillRect(-s,-s/2,s*2,s);ctx2.fillRect(-s/2,-s,s,s*2);ctx2.fillStyle='rgba(60,24,10,.6)';ctx2.fillRect(-s,0,s*2,1);ctx2.restore();}
  // the flock: now and then, in daylight, seven crows go over in a ragged line; their shadows run along the ground below and behind them
  NEAR.next-=dt;if(!NEAR.flock&&NEAR.next<=0&&day>.4){NEAR.next=70+Math.random()*80;const dir=Math.random()<.5?1:-1;
    NEAR.flock={x:cam.x-dir*22,z:cam.z-6+Math.random()*10,dir,birds:Array.from({length:7},(_,i)=>({dx:-dir*i*1.1+(Math.random()-.5)*.6,dz:(i%2?1:-1)*i*.55+(Math.random()-.5)*.4,ph:Math.random()*6}))};
    if(SFX.crow)try{SFX.crow();}catch(e){}}
  const F=NEAR.flock;if(F){F.x+=F.dir*7*dt;const sun=sunState&&sunState();
    for(const b of F.birds){b.ph+=dt*9;const bx=F.x+b.dx,bz=F.z+b.dz;
      if(sun){const X=sx(bx+sun.sx*4),Y=sz(bz+4.2);ctx2.fillStyle=`rgba(8,10,14,${(.22*day).toFixed(2)})`;ctx2.fillRect(Math.round(X-5),Math.round(Y),10,2);ctx2.fillRect(Math.round(X-1),Math.round(Y-1),3,4);}
      const [fx,fy]=toS(bx,bz);const up=Math.sin(b.ph)>0;ctx2.fillStyle=`rgba(14,12,14,${(.9*day).toFixed(2)})`;
      ctx2.fillRect(Math.round(fx-1),Math.round(fy),3,2);
      if(up){ctx2.fillRect(Math.round(fx-6),Math.round(fy-3),5,2);ctx2.fillRect(Math.round(fx+2),Math.round(fy-3),5,2);}else{ctx2.fillRect(Math.round(fx-6),Math.round(fy+1),5,2);ctx2.fillRect(Math.round(fx+2),Math.round(fy+1),5,2);}}
    if(Math.abs(F.x-cam.x)>34)NEAR.flock=null;}};}

// ---- saves from before the new town: anything put down where a building now stands goes back to the farm
{const _lg=loadGame;loadGame=function(d){try{if(d&&d.bench&&typeof BENCHES!=='undefined'){
    const blds=OBJ.filter(o=>o.kind==='bld').map(o=>{const f=SPR[o.spr]&&SPR[o.spr].foot;return f?[o.x+f[0]-1,o.z+f[1]-1,o.x+f[2]+1,o.z+1.5]:null;}).filter(Boolean);
    for(const [k,p] of Object.entries(d.bench)){if(!p||!inTown(p.x,p.z))continue;const bad=onRoad(p.x,p.z,.6)||blds.some(b=>p.x>b[0]&&p.x<b[2]&&p.z>b[1]&&p.z<b[3]);
      if(bad){const i=BENCHES.findIndex(b=>b[0]===k);if(i>=0&&typeof benchSpot==='function')d.bench[k]=benchSpot(i);}}}}catch(e){}
  return _lg.apply(this,arguments);};}

// ---- the farmstead and the houses on Route 9 west, given back their yards (#146c)
{const _bw=buildWorld;buildWorld=function(){_bw();
  const P_=(spr,x,z,o)=>put(spr,x,z,0,Object.assign({kind:'prop',town:1},o||{}));const T_=(n,x,z)=>{const e=obj(n,x,z,{kind:'tree',solid:1,town:1});addCircle(x,z,.4);return e;};
  const clearAround=(x0,z0,x1,z1)=>{for(let i=OBJ.length-1;i>=0;i--){const o=OBJ[i];if(o.town||o.x<x0||o.x>x1||o.z<z0||o.z>z1)continue;if(!/^(tree|pine|bush|deco|anim)$/.test(o.kind||'')&&!o.debris)continue;
      for(let j=circles.length-1;j>=0;j--)if(Math.hypot(circles[j].x-o.x,circles[j].z-o.z)<.5)circles.splice(j,1);OBJ.splice(i,1);}};
  // Hollow Acre: Grandpa's little orchard under the ridge, his tool shed, and the honesty stand at the gate
  clearAround(-12,-19.6,-7,-14);for(const [n,x,z] of [['apple_tree',-10.4,-14.9],['apple_gold',-8.2,-17.1],['apple_tree',-11,-18.4]])T_(n,x,z);
  P_('shed_b',-9.8,-9.9);P_('in_produce',-10.2,-8.35);P_('signpost',-11.9,-7.9,{label:'EGGS',kind:'prop'});
  // Agnes's back garden: vegetables, her washing, and Ruth's swing, still hanging
  clearAround(-50.5,-19.8,-41.5,-12.6);hedgeLine(-50.2,-12.9,-19.2);hedgeLine(-41.8,-12.9,-19.2);fenceLine(-50.2,-19.2,-41.8,-19.2,0,'picket');
  P_('gardenbed',-47.6,-15,{kind:'flat'});P_('clothesline',-44.6,-17.6);P_('rg_swing',-46.8,-17.8);P_('birdbath',-43.2,-14.6);
  // behind Pruitt's: the cars Hollis couldn't save, tyres and drums
  clearAround(-41.5,-17.6,-30,-14);P_('rg_car_b',-38.2,-15.4);P_('rg_car_c',-33.6,-16.6,{flip:true});P_('tyres',-35.6,-14.6);P_('tyres',-35,-15.1);P_('drum',-31.2,-14.6);P_('drum',-30.7,-15);
  reserve(-50.5,-19.8,-41.5,-12.6);reserve(-41.5,-17.6,-30,-14);};}
interact.push({x:-10.2,z:-7.9,r:1.1,on:()=>!S.room,label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();const t='Grandpa’s honesty stand. A tin nailed to the post, CASH in his capitals. It is full of coins: forty years of them, most older than you. Nobody ever took one. Under the tin someone has scratched, recently: HE STILL COUNTS IT.';
  toast(t,5,true);S.rgLook=S.rgLook||{};if(!S.rgLook.honesty){S.rgLook.honesty=1;addLore(t);}}});

// ---- the Lamplighter (#153): the town's front room. Nobody keeps the bar; everybody pays. The till is always full.
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;const F=(spr,x,z,dep,kind)=>{const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;return [spr,x,z,kind==='flat'?null:[-hw,-(dep||.4),hw,0],kind||undefined];};
  ROOMS.tavern={ox,oz:-60,name:'The Lamplighter',shell:'room_tavern',out:tbOut('tavern'),furn:[
    F('in_hearth',3.8,1,.5),F('in_backbar',12.0,.62,.4),['in_walllantern',4.4,-.45,null,'flat'],['in_walllantern',15.6,-.45,null,'flat'],F('in_keg',14.4,.9,.3),F('in_keg',15.2,1.1,.3),['in_photowall',8.4,-.45,null,'flat'],
    F('in_bar',10.2,3.2,.6),F('in_bar',13.6,3.2,.6),F('in_stool',9.0,3.95,.15),F('in_stool',10.2,3.95,.15),F('in_stool',13.4,3.95,.15),F('in_stool',14.6,3.95,.15),   // a real bar, stools along it (a gap where you order)
    F('in_table',3,4.6,.45),F('in_chair',1.9,4.65,.25),F('in_chair',4.1,4.65,.25),F('in_tablecards',6.8,4.9,.35),F('in_chair',5.7,4.95,.25),F('in_chair',7.9,4.95,.25),
    F('in_table',3.2,7.4,.45),F('in_chair',2.1,7.45,.25),F('in_chair',4.3,7.45,.25),F('in_chess',11.2,7.4,.3),F('in_chair',10.2,7.45,.25),F('in_chair',12.2,7.45,.25),
    F('in_piano',14.4,6.4,.5),['barrel',.7,2.6,[-.4,-.3,.4,0]],['barrel',15.4,4.6,[-.4,-.3,.4,0]],F('in_plant2',15.4,8.4,.3),F('in_plant',.8,8.4,.25)]};
  ROOM_LAMP.tavern=[6.5,2.4];}
interact.push({x:tbDoor('tavern')[0],z:tbDoor('tavern')[1],r:1,on:()=>!S.room,label:()=>'Enter',ok:()=>true,act(){
  if(S.hour<11||S.hour>=21.5){toast(S.hour<11?'Shut till eleven. Through the glass the chairs are already pulled out, as if everyone has just stood up.':'Shut. The lamp in the window is lit. Someone inside is laughing at a joke nobody told.',3,true);SFX.deny&&SFX.deny();return;}
  enterRoom('tavern');setTimeout(()=>{try{A.tone(1568,.35,'sine',.08,{verb:true});}catch(e){}},420);}});
vendors.tavern={name:'The Lamplighter',sub:'Nobody keeps the bar. Put your coins in the till. The till is always full.',rows:()=>[
  {k:'stew',name:'Bowl of stew',desc:'+50 energy, +15 health. Thick, peppery, still hot. Nobody saw who made it.',price:20,can:true,buy(){addInv('stew');}},
  {k:'pie',name:'Pie by the slice',desc:'+60 energy, +25 health.',price:30,can:true,buy(){addInv('pie');}},
  {k:'round',name:'Buy the room a round',desc:'Everyone here likes you a little more.',price:40,can:true,buy(){const R=ROOMS.tavern;let n=0;
    for(const q of npcs)if(q.loc==='in'&&Math.abs(q.x-R.ox-R.w/2)<R.w/2+1&&Math.abs(q.z-R.oz-R.d/2)<R.d/2+1&&typeof PEOPLE!=='undefined'&&PEOPLE[q.def.id]){addFriend(q.def.id,12);n++;}
    toast(n?`${n} glass${n>1?'es':''} go up. “To the farm.” Somebody adds, quietly: “While it lasts.”`:'You buy a round for an empty room. Every glass on the bar is empty in the morning.',3);}}]};
interact.push({x:0,z:0,r:1.3,on:()=>S.room==='tavern',label:()=>'Bar',ok:()=>true,act(){openShop('tavern');}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.tavern.ox+11.9;}},z:{get(){return ROOMS.tavern.oz+4.0;}}});}
interact.push({x:0,z:0,r:1,on:()=>S.room==='tavern',label:()=>'Look',ok:()=>true,act(){SFX.page&&SFX.page();const t='Photographs of every regular since 1890, nailed up behind the bar. Under each one, a year. Some of the faces have been scratched out with a key. One of the newest photos is of you, at that table, laughing. You have never been in here before.';
  toast(t,5,true);S.rgLook=S.rgLook||{};if(!S.rgLook.tavphoto){S.rgLook.tavphoto=1;addLore(t);if(typeof mindHit==='function')mindHit(4);}}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.tavern.ox+8.4;}},z:{get(){return ROOMS.tavern.oz+.5;}}});}

// ---- micro-climates: the copses are dark underfoot and in the air; the alley is in shadow all day, and the courtyard beyond is bright
{const Dk=LAYERS.dark;const inCopse=(x,z)=>COPSES.some(C=>((x-C.x)/C.rx)**2+((z-C.z)/C.rz)**2<1+(fbm(x*.4,z*.4)-.5)*.5);LAYERS.dark=(x,z)=>inCopse(x,z)||Dk(x,z);}
{const _do=depthOver;depthOver=function(t){_do(t);if(S.room||DX.off)return;const day=clamp(1-nightK*1.4,0,1);if(day<=0)return;
  ctx2.save();ctx2.fillStyle=`rgba(8,12,18,${(.36*day).toFixed(3)})`;ctx2.fillRect(Math.round(sx(ALLEY.x0)),Math.round(sz(ALLEY.z0)-40),Math.round((ALLEY.x1-ALLEY.x0)*32),Math.round((ALLEY.z1-ALLEY.z0)*32)+40);
  for(const C of COPSES){const X=sx(C.x),Y=sz(C.z)-30;if(X<-260||X>VW+260||Y<-200||Y>VH+200)continue;const g=ctx2.createRadialGradient(X,Y,10,X,Y,C.rx*32*1.1);
    g.addColorStop(0,`rgba(6,12,10,${(.42*day).toFixed(3)})`);g.addColorStop(1,'rgba(6,12,10,0)');ctx2.fillStyle=g;ctx2.save();ctx2.translate(X,Y);ctx2.scale(1,C.rz/C.rx*1.2);ctx2.translate(-X,-Y);ctx2.beginPath();ctx2.arc(X,Y,C.rx*32*1.1,0,6.283);ctx2.fill();ctx2.restore();}
  ctx2.restore();};}

// ---- the town pond on the commons below the school: reeds, a willow leaning over, a bench. Kids are told not to swim in it.
const TPOND={x:49,z:35.4,rx:4.4,rz:2.5};
const inTPond=(x,z)=>((x-TPOND.x)/TPOND.rx)**2+((z-TPOND.z)/TPOND.rz)**2<1+(fbm(x*.7+2,z*.7)-.5)*.3;
{const W=LAYERS.water;LAYERS.water=(x,z)=>W(x,z)||inTPond(x,z);}
{const _c=collide;collide=function(p,r){_c(p,r);if(p.x>=250||Math.abs(p.x-TPOND.x)>TPOND.rx+1||Math.abs(p.z-TPOND.z)>TPOND.rz+1||!inTPond(p.x,p.z))return;
  for(let rr=.2;rr<3;rr+=.2)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*6.283)*rr,z=p.z+Math.sin(a/16*6.283)*rr;if(!inTPond(x,z)){p.x=x;p.z=z;return;}}};}
{const _bw=buildWorld;buildWorld=function(){_bw();
  for(let a=0;a<6.28;a+=.32){if(floraH(a,9,3)>.62)continue;const x=TPOND.x+Math.cos(a)*(TPOND.rx+.5),z=TPOND.z+Math.sin(a)*(TPOND.rz+.45);if(inTPond(x,z))continue;obj('reeds',x,z,{kind:'plant',town:1});}
  {const e=obj('willow',43.8,36.2,{kind:'tree',solid:1,town:1});addCircle(43.8,36.2,.45);}
  put('parkbench',53.6,39.2,0,{kind:'prop',town:1});put('signpost',54.8,32.6,.2,{label:'NO SWIMMING',kind:'prop'});};}

// ---- Wickham and the farm, by the same rules (#153): height, worn paths, mud, a copse, walls of whatever was to hand, small stories
DESIRE.push([[106.5,44.4],[116,48.6],[121,50.4]],[[127,57],[128.6,62.6],[127.4,68.6]],[[133.4,57.8],[134.6,61.8]],
  [[0,-8.4],[0.4,-6]],[[2.6,-8.6],[5.8,-9.4]],[[4.2,-7.6],[9.6,-7.4],[13.6,-8.4]],[[-1.6,-1],[-4.6,-4.4],[-9.8,-7.6]]);
COPSES.push({x:101,z:35.4,rx:4.2,rz:3.2});
{const _bw=buildWorld;buildWorld=function(){_bw();
  const Y=(spr,x,z,o)=>put(spr,x,z,0,Object.assign({kind:'prop',town:1},o||{}));const D=(spr,x,z)=>obj(spr,x,z,{kind:'flat',town:1});
  const W=(spr,x0,x1,z)=>{for(let x=x0;x<x1-.05;x+=2)obj(spr,Math.min(x,x1-2),z,{kind:'prop',noCol:true,town:1});addSeg(x0,z-.15,x1,z-.15,.3);};
  // Wickham: the chapel stands on a rise, a stone retaining wall with wooden steps up from High Street
  {const base=39.2,s0=WK.bell-1.2,s1=WK.bell+1.2;const run=(a,b)=>{for(let x=a;x<b-.05;x+=2)obj('twall',Math.min(x,b-2),base,{kind:'wall',town:1});addSeg(a,base-.5,b,base-.5,.5);};
    run(119.4,s0);run(s1,128.6);obj('tsteps_wood',WK.bell,base,{kind:'flat',town:1,stairs:1});addSeg(s0-.02,base-1.5,s0-.02,base+.15,.16);addSeg(s1+.02,base-1.5,s1+.02,base+.15,.16);
    Y('vines',119.8,base+.02,{noCol:true});Y('vines',128.2,base+.02,{noCol:true});}
  // the copse behind the inn: dark, close, a path in that nobody admits to using
  {const C=COPSES[COPSES.length-1];for(let i=0;i<12;i++){const a=i*2.4,r=.2+((i*.41)%1)*.8;const x=C.x+Math.cos(a)*C.rx*r,z=C.z+Math.sin(a)*C.rz*r;const e=obj(['pine_0','spruce_1','pine_1','spruce_0'][i%4],x,z,{kind:'pine',solid:1,town:1});addCircle(x,z,.4);}}
  // the inn's kitchen yard; the boarded house's roof under a tarp; the riverbank trodden to mud; a broken wheel at the net loft
  Y('firewood',109.4,35.4);Y('choppingblock',111,35.6);Y('bucket',125.8,52.6);obj('tarp',146.5,43.42,{kind:'prop',noCol:true,town:1});
  D('mud_a',128.4,66.4);D('mud_b',133.6,63.2);Y('wheel',139.6,56.6);W('stonewall',100.2,104.2,54.6);W('stonewall_b',104.2,106.2,54.6);
  // the farm: Grandpa's barn roof patched with a tarp, the axe left in the block by the woodpile, the yard worn to mud at the trough
  obj('tarp',16.4,-9.58,{kind:'prop',noCol:true,town:1});Y('choppingblock',5.8,-9.2);D('mud_a',8.6,-7.8);Y('bucket',8.4,-9.8);};}
