/* ================= homes as extensions of the people who live in them (#154). Every room gets things on its walls (calendars with the
   days crossed off, paintings, coats on pegs, hanging plants), something on every table (a mug, a plate, a lamp, a vase of dead
   flowers, a stack of books, a candle), a change of floor where the kitchen ends and the sitting room starts, and the mess of a life
   (stains, papers, bottles, a knocked-over chair, an unmade bed). Some front rooms are L-shaped now, a wall stub making a nook.
   Under three houses there are rooms nobody mentions. And some things are wrong: a kitchen cabinet of unlabeled rusty tins, a
   wardrobe hiding drawings of you, eyes at your cabin window at night, a door in your wall after midnight, a church with no pews. ================= */
const DRESS={
  home_agnes:{walls:['in_calendar','in_coatpegs'],floor:'carpet',table:['t_candle','t_vase'],flaws:['in_papers','in_papers'],nook:1},
  home_hale:{walls:['in_painting_b'],floor:'boards',table:['t_books','t_candle'],flaws:['in_papers']},
  home_dunn:{walls:['in_calendar','in_coatpegs'],floor:'lino',table:['t_mug','t_plate'],flaws:['in_bottles','in_stain','in_chair_down'],nook:1},
  home_cora:{walls:['in_calendar','in_painting_a'],floor:null,table:['t_books','t_vase'],flaws:['in_papers']},
  home_june:{walls:['in_calendar','in_hangplant'],floor:'carpet',table:['t_mug','t_books'],flaws:['in_papers','in_papers'],nook:1},
  home_otto:{walls:['in_coatpegs','in_painting_a'],floor:'boards',table:['t_plate','t_mug'],flaws:['in_bottles','in_stain'],special:'cabinet'},
  home_silas:{walls:['in_painting_b','in_calendar'],floor:'boards',table:['t_candle','t_lamp'],flaws:['in_stain']},
  home_quill:{walls:['in_hangplant','in_painting_a'],floor:'carpet',table:['t_vase','t_plate'],flaws:[],nook:1},
  home_fenn:{walls:['in_coatpegs','in_calendar'],floor:'boards',table:['t_mug','t_plate'],flaws:['in_stain']},
  home_thorne:{walls:['in_calendar'],floor:'boards',table:['t_mug'],flaws:['in_bottles','in_chair_down','in_stain']},
  home_ashby:{walls:['in_calendar'],floor:'lino',table:['t_books','t_lamp'],flaws:[],nook:1},
  home_vale:{walls:['in_hangplant','in_coatpegs'],floor:'carpet',table:['t_vase'],flaws:['in_papers']},
  home_kerrigan:{walls:['in_coatpegs'],floor:'boards',table:['t_plate','t_candle'],flaws:['in_stain','in_bottles']},
  home_pike:{walls:['in_painting_a'],floor:'boards',table:['t_mug'],flaws:['in_bottles']},
  home_ward:{walls:['in_calendar'],floor:'boards',table:['t_books'],flaws:['in_papers']},
  back_agnes:{walls:['in_painting_a'],flaws:[],special:'trapdoor'},back_hale:{walls:['in_painting_b'],flaws:['in_papers'],rumple:1},back_dunn:{walls:['in_calendar'],flaws:['in_bottles','in_stain'],rumple:1},
  back_cora:{walls:['in_calendar'],flaws:['in_papers'],special:'wardrobe'},back_june:{walls:['in_hangplant'],flaws:['in_papers'],rumple:1},back_otto:{walls:['in_coatpegs'],flaws:['in_bottles'],rumple:1},
  back_silas:{walls:['in_painting_b'],flaws:['in_stain']},back_quill:{walls:['in_painting_a'],flaws:[],rumple:1},back_thorne:{walls:['in_calendar'],flaws:['in_bottles'],rumple:1},
  back_kerrigan:{walls:[],flaws:['in_stain'],rumple:1},back_pike:{walls:['in_painting_a'],flaws:[],rumple:1},
  cabin:{walls:['in_calendar','in_coatpegs'],table:['t_lamp','t_mug'],flaws:[]},tavern:{walls:['in_painting_a','in_calendar'],table:['t_mug','t_plate','t_candle'],flaws:['in_stain']}};
const DRESS_TABLES=new Set(['in_table','in_desk','in_kcounter']);
const dressH=(a,b)=>{const v=Math.sin(a*12.9898+b*78.233)*43758.5453;return v-Math.floor(v);};
function dressRoom(k,D){const R=ROOMS[k],m=R&&SPR[R.shell||('room_'+k)];if(!m||!m.room)return;const w=m.room.w,d=m.room.d,door=m.room.door;
  const rects=[],spans=[];
  for(const f of R.furn){const [spr,lx,lz,fp,kind]=f;const sm=SPR[spr];const hw=sm?sm.fw/64:.5;
    if(fp)rects.push([lx+fp[0],lz+fp[1],lx+fp[2],lz+fp[3]]);if(lz<1.7)spans.push([lx-hw-.15,lx+hw+.15]);}
  for(const wd of m.room.windows||[])spans.push([wd[0]-.8,wd[0]+.8]);for(const dr of m.room.doors||[])spans.push([dr[0]-.85,dr[0]+.85]);spans.push([8.0,8.7]);
  const freeSpan=(a,b)=>!spans.some(s=>a<s[1]&&b>s[0]);const freeRect=(x0,z0,x1,z1)=>!rects.some(r=>x0<r[2]&&x1>r[0]&&z0<r[3]&&z1>r[1]);
  const add=[];
  // the special pieces first (a tall cabinet or wardrobe may stand in front of a window; not in front of a door or other furniture)
  if(D.special==='cabinet'||D.special==='wardrobe'){const hw=D.special==='cabinet'?.65:.8;const busy=spans.filter((s,i)=>i<R.furn.length+5);
    for(let x=1;x<w-1;x+=.25){const a=x-hw,b=x+hw;if(spans.some(s=>a<s[1]&&b>s[0]&&!(m.room.windows||[]).some(wd=>Math.abs(s[0]-(wd[0]-.8))<.01&&Math.abs(s[1]-(wd[0]+.8))<.01)))continue;
      if(D.special==='cabinet'){add.push(['in_cabinet',x,.62,[-.6,-.4,.6,0]]);D.cabX=x;}else{add.push(['in_drawings',x,-.45,null,'flat'],['in_wardrobe',x,.7,[-.75,-.45,.75,0]]);D.wardX=x;}
      spans.push([a,b]);rects.push([x-hw,.2,x+hw,.7]);break;}}
  // the walls
  let si=0;for(const spr of D.walls||[]){for(let i=0;i<40;i++){const x=1+((dressH(k.length+si,i)*(w-2))*4|0)/4;if(x<.9||x>w-.9||!freeSpan(x-.7,x+.7))continue;add.push([spr,x,-.45,null,'flat']);spans.push([x-.7,x+.7]);break;}si++;}
  // something on every table
  let ti=0;for(const f of R.furn.slice()){if(!DRESS_TABLES.has(f[0])||!D.table||!D.table.length)continue;const t1=D.table[ti%D.table.length],t2=D.table[(ti+1)%D.table.length];ti++;
    add.push([t1,f[1]-.38,f[2]+.03,null]);if(t2!==t1||f[0]==='in_table')add.push([t2,f[1]+.36,f[2]+.04,null]);}
  // an unmade bed or two
  if(D.rumple)for(const f of R.furn)if(f[0]==='in_bed')add.push(['in_rumple',f[1],f[2]+.03,null]);
  // the mess of a life, where there's floor for it
  let fi=0;for(const spr of D.flaws||[]){for(let i=0;i<60;i++){const x=.9+dressH(fi+7,i)*(w-1.8),z=1.7+dressH(i,fi+3)*(d-2.9);if(Math.abs(x-door)<1.3&&z>d-2.4)continue;
      if(!freeRect(x-.6,z-.5,x+.6,z+.3))continue;const fp=spr==='in_chair_down'?[-.5,-.2,.5,0]:spr==='in_bottles'?[-.4,-.2,.4,0]:null;add.push([spr,x,z,fp,spr==='in_stain'||spr==='in_papers'?'flat':undefined]);rects.push([x-.6,z-.5,x+.6,z+.3]);break;}fi++;}
  // a nook: a stub of wall out from the right-hand wall makes the room an L
  if(D.nook&&w>=8){const z=+(d*.5).toFixed(2),x0=w-2.06;if(freeRect(x0-.2,z-.7,w,z+.3)){add.push(['in_partition',x0,z,[0,-.4,2.06,0]]);rects.push([x0,z-.4,w,z]);}}
  // a change of floor where one part of the room becomes another
  // (interiors r3) never over a floor that is already patterned: a lino patch on a checker read as a pale glitch block
  const shellFl=((SPR[R.shell||('room_'+k)]||{}).room||{}).floor,patterned=['checker','parquet','hex','painted','flag'].includes(shellFl);
  const floors=D.floor&&!patterned?[['in_floor_'+D.floor,w*(.3+dressH(k.length,1)*.4),d*.62,null,'flat']]:[];
  R.furn=[...floors,...R.furn,...add];
  return {w,d,spans,rects,freeSpan,freeRect};}
const DRESS_INFO={};
{const _bi=buildInteriors;buildInteriors=function(){
  for(const [k,D] of Object.entries(DRESS))if(ROOMS[k]){try{DRESS_INFO[k]=dressRoom(k,D);}catch(e){}}
  // the special pieces
  {const I=DRESS_INFO.back_agnes;if(I){for(let i=0;i<40;i++){const x=2+dressH(3,i)*(I.w-3),z=2.4+dressH(i,5)*(I.d-3.4);if(I.freeRect(x-.8,z-.6,x+.8,z+.6)){ROOMS.back_agnes.furn.push(['in_trapdoor',x,z,null,'flat']);DRESS.back_agnes.trap={x,z};break;}}}}
  _bi.apply(this,arguments);
  // the drawings start hidden behind the wardrobe
  const dr=OBJ.find(o=>o.room==='back_cora'&&o.spr==='in_drawings');if(dr){dr.hide=!(S.rgLook&&S.rgLook.wardrobe);DRESS.back_cora.drawObj=dr;}
  const wd=OBJ.find(o=>o.room==='back_cora'&&o.spr==='in_wardrobe');if(wd)DRESS.back_cora.wardObj=wd;
  if(S.rgLook&&S.rgLook.wardrobe&&wd)wardPull();
  // the church's pews, and the colliders under them, so they can be gone at night
  NIGHTROOM.pews=OBJ.filter(o=>o.room==='church'&&/^in_pew/.test(o.spr)).map(o=>({o,r:rects.find(r=>Math.abs(r.x0-(o.x-1.95))<.02&&Math.abs(r.z0-(o.z-.45))<.02)}));};}
// ---- the wrong things
function wardPull(){const D=DRESS.back_cora,o=D.wardObj;if(!o||o.pulled)return;o.pulled=1;const r=rects.find(q=>Math.abs(q.x0-(o.x-.75))<.02&&Math.abs(q.z1-o.z)<.02);o.z+=1.3;if(r){r.z0+=1.3;r.z1+=1.3;CGRID.dirty=true;}}
interact.push({x:0,z:0,r:1.1,on:()=>S.room==='home_otto'&&DRESS.home_otto.cabX!=null,label:()=>'Cabinet',ok:()=>true,act(){SFX.thud&&SFX.thud(0,.2);
  const t='The kitchen cabinet is full to the top with tins: hundreds of them, identical, rusted, no labels. They are all warm. When you shut the door you hear them settle, like something breathing out.';
  toast(t,5,true);S.rgLook=S.rgLook||{};if(!S.rgLook.cans){S.rgLook.cans=1;addLore(t);mindHit&&mindHit(3);}}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.home_otto.ox+(DRESS.home_otto.cabX||0);}},z:{get(){return ROOMS.home_otto.oz+1.3;}}});}
interact.push({x:0,z:0,r:1.1,on:()=>S.room==='back_cora'&&DRESS.back_cora.wardX!=null,label:()=>S.rgLook&&S.rgLook.wardrobe?'Look':'Wardrobe',ok:()=>true,act(){S.rgLook=S.rgLook||{};const D=DRESS.back_cora;
  if(!S.rgLook.wardrobe){S.rgLook.wardrobe=1;wardPull();if(D.drawObj)D.drawObj.hide=false;SFX.thud&&SFX.thud(0,.4);
    const t='You drag the wardrobe forward from the wall. Behind it, nailed up edge to edge: drawings in a child’s crayon, dozens of them, all of you. You in your red shirt. You at the farm gate. You asleep. In some of them something tall stands beside you, holding your hand.';
    toast(t,6,true);addLore(t);mindHit&&mindHit(6);SFX.stinger&&SFX.stinger();}
  else toast('The drawings. The newest is still damp. In it you are standing exactly here, looking at the drawings.',4,true);}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.back_cora.ox+(DRESS.back_cora.wardX||0)+(S.rgLook&&S.rgLook.wardrobe?1.1:0);}},z:{get(){return ROOMS.back_cora.oz+(S.rgLook&&S.rgLook.wardrobe?1.0:1.4);}}});}

// ---- the rooms under the houses
{let ox=Math.max(...Object.values(ROOMS).map(R=>R.ox||0))+40;const F=(spr,x,z,dep,kind)=>{const m=SPR[spr];const hw=m?Math.max(.2,m.fw/64-.12):.4;return [spr,x,z,kind==='flat'?null:[-hw,-(dep||.4),hw,0],kind||undefined];};
  const mk=(k,name,out,furn)=>{if(!SPR['room_'+k])return;ROOMS[k]={ox,oz:-60,name,shell:'room_'+k,out,furn};ox+=24;};
  mk('cellar_agnes','Under Ruth’s room',{x:0,z:0},[F('in_altar',4,1.3,.6),F('in_candles',2.4,1.1,.3),F('in_candles',5.6,1.1,.3),['in_photowall',4,-.45,null,'flat'],F('in_cradle',1.2,3.4,.3),
    F('in_chair',4,3.2,.25),F('in_shelf_jars',7.1,.62,.4),['in_stain',4,2.4,null,'flat'],['in_stain',2.6,3.8,null,'flat']]);
  mk('cellar_hale','The parsonage cellar',{x:TB.hale[1]+4.6,z:TB.hale[2]+1.2},[F('in_shelf_jars',1,.62,.4),F('in_shelf_jars',2.7,.62,.4),F('in_shelf_jars',5.3,.62,.4),F('in_shelf_jars',7,.62,.4),
    F('in_keg',1,3.4,.3),F('in_keg',1.8,3.6,.3),F('in_coffin',6.4,3.8,1.9),['in_stain',4.6,3.2,null,'flat']]);
  mk('cellar_dunn','Under the sheriff’s house',{x:TB.dunn[1]+4.3,z:TB.dunn[2]+.4},[F('in_filecab',.7,.85,.4),F('in_filecab',1.6,.85,.4),F('in_filecab',2.5,.85,.4),['in_mapboard',4.6,-.9,null,'flat'],
    F('in_desk',4.6,2.4,.45),F('in_chair',4.6,3.3,.25),F('in_crates',7,3.8,.4),['in_drawings',6.8,-.45,null,'flat']]);}
const CELLAR_LOOKS={
  cellar_agnes:[4,2,'An altar of Ruth’s things on a white cloth: her hairbrush, her school shoes, a bowl. The bowl is fresh. Something in it is still wet, and dark, and the cloth around it has been wiped and wiped and is pink with it.'],
  cellar_hale:[4,1.4,'Jars, floor to ceiling, each labelled in Ida’s round hand with a year and a first name. They go back to 1871. The newest jar has a label but no name yet. It is empty, and washed, and waiting.'],
  cellar_dunn:[4.6,2.9,'The town’s real records. Every drawing since 1871, and beside each one a page of reasons. The slips were never random. Someone always chose. The page for this year is headed with your name, and the reasons go on for four sheets.']};
for(const [k,L] of Object.entries(CELLAR_LOOKS))interact.push({x:0,z:0,r:1.2,on:()=>S.room===k,label:()=>'Look',ok:()=>true,act(){toast(L[2],6,true);SFX.page&&SFX.page();S.rgLook=S.rgLook||{};if(!S.rgLook[k]){S.rgLook[k]=1;addLore(L[2]);mindHit&&mindHit(5);}},_k:k});
for(const it of interact.filter(q=>q._k))Object.defineProperties(it,{x:{get(){return ROOMS[it._k]?ROOMS[it._k].ox+CELLAR_LOOKS[it._k][0]:0;}},z:{get(){return ROOMS[it._k]?ROOMS[it._k].oz+CELLAR_LOOKS[it._k][1]:0;}}});
const cellarGate=(ids,need,msg)=>{const best=Math.max(0,...ids.map(id=>typeof hearts==='function'?hearts(id):0));return best>=need?null:msg;};
// Agnes's trapdoor, in Ruth's room
interact.push({x:0,z:0,r:1,on:()=>S.room==='back_agnes'&&!!DRESS.back_agnes.trap,label:()=>'Trapdoor',ok:()=>true,act(){const no=cellarGate(['agnes'],6,'Bolted from underneath. When you hold your breath, something down there holds its breath too.');
  if(no){toast(no,3.4,true);SFX.deny&&SFX.deny();return;}const T=DRESS.back_agnes.trap;ROOMS.cellar_agnes.out={x:ROOMS.back_agnes.ox+T.x,z:ROOMS.back_agnes.oz+T.z+.6};ROOMS.cellar_agnes.from='back_agnes';enterRoom('cellar_agnes');}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return ROOMS.back_agnes.ox+(DRESS.back_agnes.trap?DRESS.back_agnes.trap.x:0);}},z:{get(){return ROOMS.back_agnes.oz+(DRESS.back_agnes.trap?DRESS.back_agnes.trap.z:0);}}});}
// the cellar doors outside the parsonage and the sheriff's house
for(const [k,x,z,ids,need,no,night] of [['cellar_hale',TB.hale[1]+4.6,TB.hale[2]+.6,['hale','ida'],5,'Padlocked. The padlock is new. The hinges are older than the house.','Someone is knocking on the cellar doors. From underneath. Three slow knocks, then a pause, then three.'],
  ['cellar_dunn',TB.dunn[1]+4.3,TB.dunn[2]-.2,['dunn','wes'],6,'A sheriff’s padlock, and a chain through the handles. The chain is warm.','Lamplight in the crack between the doors. Someone down there is turning pages, very fast.']])
  interact.push({x,z,r:1,on:()=>!S.room,label:()=>'Cellar',ok:()=>true,act(){if(isNight()){toast(night,3.6,true);mindHit&&mindHit(2);return;}const g=cellarGate(ids,need,no);if(g){toast(g,3,true);SFX.deny&&SFX.deny();return;}enterRoom(k);}});
// out of a cellar you came down into from a room: back up into that room, beside the trapdoor
{const _lr=leaveRoom;leaveRoom=function(){const R=roomOf();if(R&&R.from){const back=R.from,O=R.out;S.mode='trans';fade(1);SFX.thud(0,.25);
    setTimeout(()=>{S.room=back;P.x=O.x;P.z=O.z;P.dir='S';P.fx=0;P.fz=1;S.mode='play';fade(0);},380);return;}return _lr.apply(this,arguments);};}

// ---- the cabin at night: something at the window
const PEEP={next:30,t:0,on:null};
{const _do=depthOver;depthOver=function(t){_do(t);if(S.room!=='cabin'||!isNight()||S.bound||S.mode!=='play')return;const R=ROOMS.cabin,m=SPR[R.shell||'room_cabin'];if(!m||!m.room||!m.room.windows||!m.room.windows.length)return;
  const dt=Math.min(.05,t-(PEEP.t||t));PEEP.t=t;
  if(!PEEP.on){PEEP.next-=dt;if(PEEP.next<=0){const tier=typeof tierOf==='function'?tierOf(M.v):1;PEEP.next=Math.max(14,60-tier*10)+Math.random()*30;
      PEEP.on={w:m.room.windows[(Math.random()*m.room.windows.length)|0],kind:Math.random()<.55?'eyes':'pass',t:0,ex:.3+Math.random()*.4,ey:.3+Math.random()*.3};if(typeof mindHit==='function')mindHit(1);}return;}
  const E=PEEP.on;E.t+=dt;const dur=E.kind==='eyes'?2.8:2.0;if(E.t>dur){PEEP.on=null;return;}
  const X=Math.round(sx(R.ox+E.w[0])-14),Y=Math.round(sz(R.oz)-78),W=E.w[2]||28,Hh=E.w[4]||34;ctx2.save();ctx2.beginPath();ctx2.rect(X,Y,W,Hh);ctx2.clip();
  if(E.kind==='eyes'){const a=Math.min(1,E.t*2,(dur-E.t)*2);const ex=X+W*E.ex,ey=Y+Hh*E.ey;ctx2.fillStyle=`rgba(4,4,6,${(.55*a).toFixed(2)})`;ctx2.fillRect(ex-7,ey-4,16,9);
    const blink=Math.sin(E.t*9)>.94;if(!blink){ctx2.fillStyle=`rgba(230,226,190,${a.toFixed(2)})`;ctx2.fillRect(Math.round(ex-4),Math.round(ey-1),2,2);ctx2.fillRect(Math.round(ex+3),Math.round(ey-1),2,2);
      ctx2.fillStyle=`rgba(255,250,220,${(a*.6).toFixed(2)})`;ctx2.fillRect(Math.round(ex-4),Math.round(ey-1),1,1);ctx2.fillRect(Math.round(ex+3),Math.round(ey-1),1,1);}}
  else{const k=E.t/dur,px=X-14+k*(W+28);ctx2.fillStyle='rgba(2,2,4,.85)';ctx2.beginPath();ctx2.arc(px,Y+Hh*.42,5.5,0,6.283);ctx2.fill();ctx2.fillRect(px-9,Y+Hh*.42+5,18,Hh);}
  ctx2.restore();};}

// ---- rooms that are not the same after dark: a door in your cabin wall after midnight; the church with no pews at night
const NIGHTROOM={pews:[],cabinDoor:null,state:{}};
{const _bi2=buildInteriors;buildInteriors=function(){_bi2.apply(this,arguments);const R=ROOMS.cabin;if(R){const m=SPR[R.shell||'room_cabin'];const w=m&&m.room?m.room.w:9;
    const o=obj('in_partition_door',R.ox+w*.5-1.03,R.oz-.25,{kind:'flat',room:'cabin',hide:true});NIGHTROOM.cabinDoor=o;}};}
interact.push({x:0,z:0,r:1,on:()=>S.room==='cabin'&&NIGHTROOM.cabinDoor&&!NIGHTROOM.cabinDoor.hide,label:()=>'Door',ok:()=>true,act(){SFX.stinger&&SFX.stinger();mindHit&&mindHit(5);
  toast('There was never a door here. It opens onto a hallway, a long one, papered like Grandpa’s front room, with a light at the far end. You can hear the cabin’s clock ticking from down there. You close it. In the morning it is a wall again.',6,true);}});
{const it=interact[interact.length-1];Object.defineProperties(it,{x:{get(){return NIGHTROOM.cabinDoor?NIGHTROOM.cabinDoor.x+1.03:0;}},z:{get(){return NIGHTROOM.cabinDoor?NIGHTROOM.cabinDoor.z+.75:0;}}});}
{let acc=0;const _u=update;update=function(dt){_u(dt);acc+=dt;if(acc<.5)return;acc=0;
  const late=S.hour>=24||S.hour<4.5,churchNight=isNight()&&!S.bound;
  if(NIGHTROOM.cabinDoor&&S.room!=='cabin')NIGHTROOM.cabinDoor.hide=!late;   // it is there when you come in after midnight, and gone when you come back in the day
  if(NIGHTROOM.state.church!==churchNight&&S.room!=='church'){NIGHTROOM.state.church=churchNight;
    for(const p of NIGHTROOM.pews){p.o.hide=churchNight;if(p.r){const i=rects.indexOf(p.r);if(churchNight&&i>=0)rects.splice(i,1);else if(!churchNight&&i<0)rects.push(p.r);}}}};}
{const _er=enterRoom;enterRoom=function(k){_er.apply(this,arguments);if(k==='church'&&NIGHTROOM.state.church)setTimeout(()=>toast('The pews are gone. Not moved: gone, and the floor where they stood is dustless and pale. Someone has left one chair in the middle of the aisle, facing the door.',5,true),700);};}
// ---- weather comes inside: in a storm the rooms go dim and close
{const _am=ambient;ambient=function(h){const a=_am(h);if(!S.room||!S.storm)return a;return [a[0]*.72,a[1]*.74,a[2]*.82];};}
